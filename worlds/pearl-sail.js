// PEARL SAIL TOWER [pearlSailTower] — side-on 2.5D climb (classic Metroid feel) inside the Pearl Sail, Pearl Quarter, Meru 2.
// 6 floors + the roof. The tower's security bots went haywire: crawlers patrol, drones swoop, wall turrets fire, ceiling droppers fall,
// shielded guards block from the front (jump over, hit the back). Roof boss: SUDS-9, the rogue window-cleaning robot on its gondola.
// Then the PEARL OF THE SAIL relic. Movement + combat use the Combat Workshop tuning (move-lab.js loadTune: walk, jump 8, gravity 24,
// swing / windup / reach / combo window / finisher / sword + laser damage, fire rate, energy) and its button rules: 1 = slash, chained in
// rhythm (press on the beat = PERFECT x1.3, 3rd hit = finisher); 2 = laser (stick up = aim up); 3 = jump, again in the air = DOUBLE JUMP
// with a flip. Engine contract for Game HUD.dc.html (setStick, melee, range, jump, useItem, mapData, ...).
import * as THREE from '../vendor/three/three.module.js';
import { rr, pick, clamp, smooth, lerp, damp, makeGradient } from '../village-game.js';
import { crestTex } from '../meru-game.js';
import { foxKit } from '../fox-kit.js';
import { CAST } from '../engine/cast.js';
import { loadTune } from '../move-lab.js';
import { makeRoomKit } from './meru2-roomkit.js';
import { save } from '../engine/save.js';

export const X0 = -22, X1 = 22, FH = 8, ROOF = 48;
// plats: one-way [x0, x1, y] (y relative to the floor). desks: low one-way tops. solids: [x0, x1, y0, y1]. foes: see spawn().
export const FLOORS = [
  { name: 'LOBBY', dir: 1, floor: '#ece8e1', plats: [[6, 10, 1.6], [11, 14, 3.2], [11, 15, 4.8], [15.5, 18.5, 6.4]], desks: [[-7, -1.5, 1.1]], solids: [],
    foes: [['crawler', -3, 6, 0], ['crawler', 11, 14, 3.2]] },
  { name: 'OPEN OFFICE', dir: -1, floor: '#8c97a6', plats: [[-6, -2, 1.6], [-11, -7.5, 3.2], [-15, -11, 4.8], [-18.5, -15.5, 6.4]], desks: [[2, 6, 1.0], [8, 12, 1.0]], solids: [],
    foes: [['drone', -2, 5], ['drone', 8, 4.5], ['crawler', -14, 1, 0]] },
  { name: 'SERVER ROOM', dir: 1, floor: '#3d4148', plats: [[4, 8, 1.6], [9, 12, 3.2], [11, 15, 4.8], [15.5, 18.5, 6.4]], desks: [], solids: [[-12, -10.6, 0, 2.2], [-5, -3.6, 0, 2.2], [13.5, 15, 0, 2.2]],
    foes: [['dropper', -8, 7.3], ['dropper', 2, 7.3], ['dropper', 10.5, 7.3], ['turret', -21.5, 3.6, 1], ['crawler', 11, 15, 4.8]] },
  { name: 'EXECUTIVE SUITE', dir: -1, floor: '#6b4a3a', plats: [[-3, 1, 1.6], [-9, -5, 3.2], [-15, -11, 4.8], [-18.5, -15.5, 6.4]], desks: [[3, 11, 1.0]], solids: [],
    foes: [['guard', -15, -1, 0], ['guard', 3, 11, 1.0], ['drone', -6, 6.6]] },
  { name: 'ATRIUM', dir: 1, floor: '#d9d4cc', plats: [[2, 5, 1.6], [6, 9, 3.2], [11, 15, 4.8], [15.5, 18.5, 6.4]], desks: [], solids: [],
    foes: [['drone', 0, 6.4], ['drone', 9, 3], ['dropper', 2.5, 7.3], ['dropper', -10, 7.3], ['turret', 21.5, 3.6, -1]] },
  { name: 'MAINTENANCE', dir: -1, floor: '#55595f', plats: [[-4, 0, 1.6], [-9, -5.5, 3.2], [-15, -11, 4.8], [-18.5, -15.5, 6.4]], desks: [], solids: [],
    foes: [['guard', -16, 8, 0], ['crawler', -4, 0, 1.6], ['crawler', -15, -11, 4.8], ['turret', -21.5, 6, 1]] },
];
const holeOf = k => FLOORS[k - 1].dir > 0 ? [14, 19] : [-19, -14];   // slab k (y = 8k) opens on the side the floor below climbs toward

export async function createPearlSail({ container, onState = () => {}, onExit = () => {} }) {
  const T = loadTune(), touch = matchMedia('(pointer: coarse)').matches;
  const W = () => container.clientWidth || 1, H = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.5 : 2)); renderer.setSize(W(), H()); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#bfe0f5');
  const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.5, 400);
  const hemiL = new THREE.HemisphereLight(0xffffff, 0x8a8f99, 1.25); scene.add(hemiL); const TINT = ['#fff6ea', '#f2f6ff', '#bcd4ff', '#ffe9d2', '#fff8ee', '#e9eef2', '#ffffff'].map(c => new THREE.Color(c)), tintC = new THREE.Color('#fff6ea'); const sun = new THREE.DirectionalLight(0xffffff, 1.35); sun.position.set(10, 30, 20); scene.add(sun);
  const grad = makeGradient(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.04, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const { CT, Bin, signTex } = makeRoomKit({ THREE, touch });
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Sp = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);

  // ================= COLLISION WORLD =================
  const solids = [], ones = [];   // solids {x0,x1,y0,y1}; ones {x0,x1,y, kind, f}
  solids.push({ x0: X0 - 3, x1: X0, y0: -5, y1: 80 }, { x0: X1, x1: X1 + 3, y0: -5, y1: ROOF }, { x0: X0, x1: X1, y0: -1, y1: 0 });
  for (let k = 1; k <= 6; k++) { const y = k * FH, [h0, h1] = holeOf(k); solids.push({ x0: X0, x1: h0, y0: y - 0.6, y1: y }, { x0: h1, x1: X1, y0: y - 0.6, y1: y }); ones.push({ x0: h0, x1: h1, y, kind: 'grate', f: k }); }
  solids.push({ x0: 21.4, x1: X1, y0: ROOF, y1: ROOF + 1 });   // roof parapet (the gondola side)
  FLOORS.forEach((F, f) => { const yb = f * FH; for (const [a, b, y] of F.plats) ones.push({ x0: a, x1: b, y: yb + y, kind: 'ledge', f }); for (const [a, b, y] of F.desks) ones.push({ x0: a, x1: b, y: yb + y, kind: 'desk', f }); for (const [a, b, y0, y1] of F.solids) solids.push({ x0: a, x1: b, y0: yb + y0, y1: yb + y1, rack: true, f }); });
  const gondolaDeck = { x0: 22.3, x1: 26.3, y: 46, kind: 'gondola' }; ones.push(gondolaDeck);
  // route check (reach: single 1.33 m, double ~3 m): warns in the console if a step is too high / far
  FLOORS.forEach((F, f) => { const pts = [[F.dir > 0 ? -18 : 16.5, 0, 0]].concat(F.plats.map(([a, b, y]) => [(a + b) / 2, y, (b - a) / 2])); const [h0, h1] = holeOf(f + 1); pts.push([(h0 + h1) / 2, 8, 2.5]);
    for (let i = 1; i < pts.length; i++) { const dy = pts[i][1] - pts[i - 1][1], gap = Math.abs(pts[i][0] - pts[i - 1][0]) - pts[i][2] - pts[i - 1][2]; if (i < pts.length - 1) { const [cx, cy, hw] = pts[i], [hh0, hh1] = holeOf(f + 1); if (cy + 1.8 > FH - 0.6 && (cx - hw < hh0 || cx + hw > hh1)) console.warn('pearl sail route: floor ' + (f + 1) + ' ledge ' + i + ' has no head room under the slab'); }
      if (pts[i][1] + 1.7 > FH - 0.6) { const [hh0, hh1] = holeOf(f + 1), [cx, , hw] = pts[i]; if (cx - hw < hh0 - 0.01 || cx + hw > hh1 + 0.01) console.warn('pearl sail route: floor ' + (f + 1) + ' step ' + i + ' rises into the ceiling'); }
      if (dy > 2.0 || (i > 1 && gap > 4.5)) console.warn('pearl sail route: floor ' + (f + 1) + ' step ' + i + ' dy ' + dy.toFixed(1) + ' gap ' + gap.toFixed(1)); } });
  const inSolid = (x, y) => solids.some(s => x > s.x0 && x < s.x1 && y > s.y0 && y < s.y1);
  const supportAt = (x, y) => { let best = null; for (const s of solids) if (x > s.x0 && x < s.x1 && s.y1 <= y + 0.05 && (!best || s.y1 > best.y)) best = { y: s.y1, x0: s.x0, x1: s.x1 }; for (const o of ones) if (o.kind !== 'gondola' && x > o.x0 && x < o.x1 && o.y <= y + 0.05 && (!best || o.y > best.y)) best = { y: o.y, x0: o.x0, x1: o.x1 }; return best || { y: 0, x0: X0, x1: X1 }; };

  // ================= ART: the tower =================
  const ART = new THREE.Group(); scene.add(ART);
  const skyTex = CT(512, 1024, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#3f86c8'); gr.addColorStop(0.55, '#a9d6f2'); gr.addColorStop(0.8, '#e6f2f6'); gr.addColorStop(0.81, '#5fa7cf'); gr.addColorStop(1, '#2f7fb0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 14; i++) { const x = (i * 173) % w, y = 60 + (i * 97) % 420; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * 16, y + Math.sin(k) * 5, 26, 11, 0, 0, 7); g.fill(); } }
    const sil = (x, ww, hh, c) => { g.fillStyle = c; g.fillRect(x, h * 0.8 - hh, ww, hh); }; for (let i = 0; i < 26; i++) sil((i * 61) % w, 14 + (i * 7) % 26, 30 + (i * 37) % 120, i % 3 ? '#8fb3c9' : '#7aa0b8');
    g.fillStyle = '#6e93ab'; g.beginPath(); g.moveTo(120, h * 0.8); g.lineTo(132, h * 0.8 - 250); g.lineTo(144, h * 0.8); g.fill(); g.fillStyle = '#c9a24a'; g.fillRect(380, h * 0.8 - 180, 30, 180);
    g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; for (let i = 0; i < 30; i++) { const y = h * 0.82 + i * 6; g.beginPath(); g.moveTo((i * 53) % w, y); g.lineTo((i * 53) % w + 40, y); g.stroke(); } });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(260, 200), new THREE.MeshBasicMaterial({ map: skyTex, fog: false })); m.position.set(0, 40, -90); ART.add(m); }
  scene.fog = new THREE.Fog(0xcfe6f3, 40, 95);
  // GRAPHICS s35r: the city OUTSIDE the glass (real 3D boxes = true parallax as you climb): 3 depth rows of towers, lit windows at dusk tones
  { const cb = Bin(); let sd = 7; const R2 = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (const [z, n, hmax, col] of [[-22, 9, 34, '#dfe7ee'], [-38, 12, 60, '#c9d6e2'], [-62, 16, 90, '#b4c6d6']]) for (let i = 0; i < n; i++) { const w = 5 + R2() * 7, h = 10 + R2() * hmax, x = -70 + (i + R2() * 0.6) * (140 / n); cb.box('mat', col, w, h, 5, x, h / 2 - 2, z); for (let k = 0; k < 4; k++) cb.box('glo', R2() < 0.5 ? '#fff6dc' : '#eaf4ff', w * 0.8, 0.25, 0.02, x, 4 + R2() * (h - 6), z + 2.52); }
    cb.box('mat', '#5fa7cf', 300, 0.1, 80, 0, -2.2, -50); cb.build(ART); }
  const shaftTex = CT(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,248,220,0.9)'); gr.addColorStop(1, 'rgba(255,248,220,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const shaftMat = new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, opacity: 0.09, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (let k = 0; k < 6; k++) for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 9), shaftMat); m.position.set(-14 + i * 13 + (k % 2) * 4, k * FH + 3.6, -3); m.rotation.z = 0.5; m.rotation.x = -0.35; ART.add(m); }
  const crackTex = CT(256, 256, (g, w) => { g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(w / 2, w / 2); let x = w / 2, y = w / 2; const a = i * 0.7 + 0.2; for (let k = 0; k < 5; k++) { x += Math.cos(a + (k % 2 ? 0.3 : -0.3)) * 22; y += Math.sin(a + (k % 2 ? 0.3 : -0.3)) * 22; g.lineTo(x, y); } g.stroke(); } g.beginPath(); g.arc(w / 2, w / 2, 30, 0, 7); g.stroke(); });
  const crackMat = new THREE.MeshBasicMaterial({ map: crackTex, transparent: true, depthWrite: false });
  const alarmMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a }), ledMat = new THREE.MeshBasicMaterial({ vertexColors: true });
  const sb = Bin(), alarm = Bin(), leds = Bin();
  const ZB = -6, ZF = 3;   // back glass / front cut edge of each slab
  // side columns of the sail (full height) + the mast on the roof
  for (const sx of [-1, 1]) { sb.box('mat', '#f3f2f2', 2.6, ROOF + 1, 10, sx * (X1 + 1.3), (ROOF + 1) / 2, -1.5); sb.box('mat', '#201e1d', 0.08, ROOF + 1, 0.04, sx * X1, (ROOF + 1) / 2, ZF + 0.02); }
  sb.box('mat', '#f6f3ec', 1.6, 26, 1.6, -21, ROOF + 13, -3); for (let k = 1; k <= 3; k++) sb.box('gls', '#c9a227', 1.8, 0.4, 1.8, -21, ROOF + k * 6, -3);
  const platArt = (o, z = 0) => { const w = o.x1 - o.x0, cx = (o.x0 + o.x1) / 2;
    if (o.kind === 'desk') { sb.box('gls', '#a77b4f', w, 0.12, 1.5, cx, o.y - 0.06, z); const fb = Math.floor((o.y + 0.01) / FH) * FH; for (const e of [o.x0 + 0.2, o.x1 - 0.2]) sb.box('mat', '#3d3b3a', 0.08, o.y - 0.1 - fb, 1.3, e, fb + (o.y - 0.1 - fb) / 2, z); for (let x = o.x0 + 0.8; x < o.x1 - 0.5; x += 2.2) { sb.box('mat', '#201e1d', 0.7, 0.45, 0.06, x, o.y + 0.3, z - 0.4); sb.box('glo', '#7dd3fc', 0.6, 0.36, 0.01, x, o.y + 0.3, z - 0.36); } }
    else if (o.kind === 'grate') { sb.box('mat', '#3d3b3a', w, 0.14, 2.4, cx, o.y - 0.07, z); for (let x = o.x0; x <= o.x1 + 0.01; x += 0.5) sb.box('mat', '#201e1d', 0.04, 0.16, 2.42, x, o.y - 0.07, z); for (const e of [o.x0, o.x1]) sb.box('mat', '#ffd23a', 0.16, 0.18, 2.44, e, o.y - 0.07, z); }
    else { sb.box('mat', '#f3f2f2', w, 0.32, 1.5, cx, o.y - 0.16, z); sb.box('mat', '#ec3013', w + 0.02, 0.07, 1.52, cx, o.y - 0.3, z); const top = Math.ceil((o.y + 0.01) / FH) * FH - 0.6; if (top - o.y > 0.4) for (const e of [o.x0 + 0.3, o.x1 - 0.3]) sb.box('mat', '#201e1d', 0.03, top - o.y, 0.03, e, (top + o.y) / 2, z); } };
  for (const o of ones) if (o.kind !== 'gondola') platArt(o);
  for (let k = 0; k <= 6; k++) { const y = k * FH; if (k > 0) { const [h0, h1] = holeOf(k); for (const [a, b] of [[X0, h0], [h1, X1]]) { sb.box('mat', '#e9e6e0', b - a, 0.6, ZF - ZB, (a + b) / 2, y - 0.3, (ZF + ZB) / 2); sb.box('mat', '#ec3013', b - a, 0.08, 0.02, (a + b) / 2, y - 0.15, ZF + 0.01); sb.box('mat', '#201e1d', b - a, 0.04, 0.02, (a + b) / 2, y - 0.58, ZF + 0.01); } }
    if (k < 6) { const F = FLOORS[k]; sb.box('mat', F.floor, X1 - X0, 0.02, ZF - ZB, 0, y + 0.01, (ZF + ZB) / 2);
      // ceiling light strips, back glass + mullions, spandrel band with the floor sign
      for (let x = -18; x <= 18; x += 6) sb.box('glo', '#f4f8ff', 3.6, 0.04, 0.4, x, y + FH - 0.62, -2);
      sb.box('glass', '#bfe3ff', X1 - X0, 6.6, 0.04, 0, y + 3.3, ZB + 0.1); for (let x = X0 + 4; x < X1; x += 4) sb.box('mat', '#cfd3d6', 0.16, 6.6, 0.16, x, y + 3.3, ZB + 0.1);
      sb.box('mat', '#f3f2f2', X1 - X0, 1.4, 0.2, 0, y + FH - 1.3, ZB + 0.1); sb.box('mat', '#cfd3d6', X1 - X0, 0.12, 0.2, 0, y + 0.06, ZB + 0.1);
      { const s = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.7), new THREE.MeshBasicMaterial({ map: signTex((k + 1) + ' · ' + F.name) })); s.position.set(F.dir > 0 ? -9 : 9, y + FH - 1.3, ZB + 0.22); ART.add(s); }
      for (let i = 0; i < 2; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), crackMat); c.position.set(((k * 7 + i * 13) % 34) - 17, y + 2.5 + i * 1.6, ZB + 0.16); c.rotation.z = k + i; ART.add(c); }
      for (const ax of [-12, 12]) { alarm.box('glo', '#ffffff', 0.5, 0.25, 0.25, ax + (k % 2) * 3, y + FH - 0.8, -3.5); sb.box('mat', '#201e1d', 0.6, 0.08, 0.3, ax + (k % 2) * 3, y + FH - 0.65, -3.5); }
      dress(k, y); } }
  // ---- per-floor dressing (background only, z -1.2 .. -5.5) ----
  function dress(k, y) { const D = (x, z) => [x, z];
    const deskBG = (x, z, tilt) => { sb.box('gls', '#b08b5e', 2.4, 0.08, 1.1, x, y + 0.76, z, 0, 0, tilt ? 0.25 : 0); sb.box('mat', '#3d3b3a', 0.08, 0.72, 1.0, x - 1.1, y + 0.36, z); sb.box('mat', '#3d3b3a', 0.08, 0.72, 1.0, x + 1.1, y + 0.36, z); sb.box('mat', '#201e1d', 0.6, 0.4, 0.05, x, y + 1.05, z - 0.35, 0, tilt ? 0.6 : 0); sb.box('glo', tilt ? '#2a2d33' : '#7dd3fc', 0.52, 0.32, 0.01, x, y + 1.05, z - 0.32); };
    const chair = (x, z, down) => { if (down) { sb.box('mat', '#201e1d', 0.5, 0.5, 0.08, x, y + 0.08, z, 0.4, Math.PI / 2); sb.cyl('mat', '#3d3b3a', 0.25, 0.04, x + 0.4, y + 0.1, z, 8, 0, Math.PI / 2); } else { sb.box('mat', '#201e1d', 0.5, 0.08, 0.5, x, y + 0.5, z); sb.box('mat', '#201e1d', 0.5, 0.6, 0.08, x, y + 0.82, z - 0.25); sb.cyl('mat', '#3d3b3a', 0.05, 0.45, x, y + 0.24, z); } };
    const plant = (x, z, s = 1) => { sb.cyl('mat', '#f3f2f2', 0.35 * s, 0.6 * s, x, y + 0.3 * s, z, 12); for (let i = 0; i < 7; i++) sb.sph('mat', i % 2 ? '#3d6b4a' : '#4f8a5c', 0.3 * s, x + Math.cos(i) * 0.22 * s, y + (0.9 + (i % 3) * 0.25) * s, z + Math.sin(i) * 0.22 * s, 1.3, 6); };
    const paper = () => { for (let i = 0; i < 14; i++) sb.box('mat', '#f6f6f2', 0.3, 0.005, 0.22, ((i * 37 + k * 11) % 40) - 20, y + 0.03, -1.2 - (i % 4) * 0.9, i); };
    if (k === 0) { // LOBBY: revolving door (the exit), reception wall logo, security gates, sofas, big plants
      sb.cyl('glass', '#cfe9ff', 1.3, 3.2, -20.2, y + 1.6, 0, 18); sb.cyl('gls', '#c9a227', 1.36, 0.14, -20.2, y + 3.25, 0, 18); sb.box('gls', '#c9a227', 0.08, 3.1, 2.5, -20.2, y + 1.6, 0, 0.6); sb.box('gls', '#c9a227', 0.08, 3.1, 2.5, -20.2, y + 1.6, 0, 0.6 + Math.PI / 2);
      { const s = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.6), new THREE.MeshBasicMaterial({ map: signTex('EXIT') })); s.position.set(-20.2, y + 3.9, 1.4); ART.add(s); }
      { const lg = CT(512, 160, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.font = '900 72px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('PEARL SAIL', 26, h / 2); g.fillStyle = '#ec3013'; g.fillRect(0, h - 14, w, 14); }); const s = new THREE.Mesh(new THREE.PlaneGeometry(8, 2.5), new THREE.MeshBasicMaterial({ map: lg })); s.position.set(-4.2, y + 3.4, -4.6); ART.add(s); }
      sb.box('mat', '#e6e3dc', 14, 5, 0.3, -4.2, y + 2.5, -4.9); for (const x of [1.5, 3, 4.5]) { sb.box('gls', '#9aa0a6', 0.25, 1.1, 0.5, x, y + 0.55, -1.6); sb.box('glass', '#cfe9ff', 1.2, 0.8, 0.04, x + 0.7, y + 0.8, -1.6); sb.box('glo', '#ff3b3b', 0.12, 0.12, 0.02, x, y + 1.0, -1.34); }
      for (const x of [9, 15]) { sb.box('mat', '#2e4a6b', 3, 0.45, 1, x, y + 0.45, -4); sb.box('mat', '#2e4a6b', 3, 0.8, 0.25, x, y + 0.85, -4.45); } sb.box('mat', '#2e4a6b', 3, 0.45, 1, 12, y + 0.2, -2.5, 0.3, 0, 1.4);
      plant(-15, -4.4, 1.6); plant(18.5, -4.4, 1.6); plant(7, -4.4, 1.2); sb.cyl('mat', '#f3f2f2', 0.5, 0.9, -11, y + 0.3, -2.4, 12, 0, Math.PI / 2); paper(); }
    if (k === 1) { for (let x = -18; x <= 18; x += 4.5) { deskBG(x, -3.4, (x * 7 | 0) % 3 === 0); chair(x + 0.4, -2.4, (x * 3 | 0) % 2 === 0); sb.box('glass', '#e6f4ff', 4, 1.3, 0.05, x, y + 1.4, -4.2); }
      sb.cyl('mat', '#e6f4ff', 0.3, 1.1, 14, y + 0.55, -1.6, 10); sb.cyl('glass', '#7dd3fc', 0.28, 0.5, 14, y + 1.35, -1.6, 10); plant(-20, -4.8, 1.3); paper(); }
    if (k === 2) { for (let x = -19; x <= 19; x += 2.6) { sb.box('mat', '#2a2d33', 1.4, 2.8, 1.1, x, y + 1.4, -4.2); for (let j = 0; j < 7; j++) leds.box('glo', j % 3 ? '#22c55e' : '#ec3013', 0.08, 0.05, 0.02, x - 0.5 + (j % 4) * 0.3, y + 0.5 + j * 0.32, -3.64); }
      for (const s of FLOORS[2].solids) { const cx = (s[0] + s[1]) / 2; sb.box('mat', '#2a2d33', s[1] - s[0], s[3], 1.4, cx, y + s[3] / 2, 0); sb.box('mat', '#ffd23a', s[1] - s[0] + 0.02, 0.08, 1.42, cx, y + s[3] - 0.05, 0); for (let j = 0; j < 5; j++) leds.box('glo', j % 2 ? '#22c55e' : '#7dd3fc', 0.08, 0.05, 0.02, cx - 0.3 + (j % 3) * 0.3, y + 0.4 + j * 0.36, 0.72); }
      for (let x = -20; x <= 20; x += 5) sb.box('mat', '#3d3b3a', 4.6, 0.1, 0.6, x, y + 6.9, -2.5); for (let i = 0; i < 9; i++) sb.cyl('mat', ['#ec3013', '#2e4a6b', '#ffd23a'][i % 3], 0.04, 3.2, -16 + i * 4, y + 5.3, -2.3 - (i % 2) * 0.3, 6, 0, 0.3 * (i % 2 ? 1 : -1)); }
    if (k === 3) { for (const x of [-16, -6, 6, 16]) { sb.box('glass', '#cfe9ff', 7, 3.4, 0.05, x, y + 1.7, -3); sb.box('gls', '#201e1d', 7, 0.08, 0.08, x, y + 3.4, -3); sb.box('gls', '#201e1d', 0.08, 3.4, 0.08, x - 3.5, y + 1.7, -3); } sb.box('gls', '#5a3d26', 8, 0.12, 2, -6, y + 0.78, -4.4); for (let i = 0; i < 6; i++) chair(-9.5 + i * 1.4, -5.1, i === 2);
      for (const x of [-18, 0, 12]) { sb.box('gls', '#c9a227', 2.2, 1.6, 0.06, x, y + 4.6, -5.6); sb.box('mat', ['#2e4a6b', '#7a2a3a', '#3f7a52'][(x + 18) % 3], 2, 1.4, 0.02, x, y + 4.6, -5.55); } plant(20, -4.6, 1.4); plant(-20, -4.6, 1.4); paper(); }
    if (k === 4) { sb.cyl('glass', '#cfe9ff', 1.6, 7.4, -8, y + 3.7, -3.6, 16); sb.box('mat', '#9aa0a6', 2.2, 2.4, 2.2, -8, y + 1.7, -3.6, 0, 0, 0.12); sb.box('mat', '#201e1d', 0.04, 7.4, 0.04, -8, y + 3.7, -3.6);
      sb.cyl('mat', '#7a5236', 0.35, 4, 14, y + 2, -4.2, 8); for (let i = 0; i < 10; i++) sb.sph('mat', i % 2 ? '#3d6b4a' : '#4f8a5c', 1.1, 14 + Math.cos(i) * 1.2, y + 4.5 + (i % 3) * 0.7, -4.2 + Math.sin(i) * 0.8, 1, 8);
      for (const o of FLOORS[4].plats) { const cx = (o[0] + o[1]) / 2; sb.cyl('gls', '#c9a227', (o[1] - o[0]) / 2 + 0.2, 0.1, cx, y + o[2] - 0.38, 0, 16); sb.sph('glo', '#fff1c8', 0.22, cx, y + o[2] - 0.5, 0); } plant(-18, -4.6, 1.5); }
    if (k === 5) { for (let i = 0; i < 4; i++) { const py = y + 1.2 + i * 1.5; sb.cyl('gls', ['#9aa0a6', '#ec3013', '#2e4a6b', '#ffd23a'][i], 0.22, X1 - X0, 0, py, -4.6 + i * 0.3, 10, 0, Math.PI / 2); for (let x = -20; x <= 20; x += 8) sb.box('mat', '#201e1d', 0.12, 0.5, 0.5, x, py, -4.6 + i * 0.3); }
      for (const x of [-12, 4, 15]) { sb.box('mat', '#c0c4cc', 1.6, 2, 0.6, x, y + 1, -2.6); for (let j = 0; j < 6; j++) sb.box('mat', j % 2 ? '#ffd23a' : '#201e1d', 0.27, 0.2, 0.02, x - 0.66 + j * 0.27, y + 1.95, -2.28); } sb.cyl('mat', '#3d3b3a', 1.2, 0.3, 9, y + 4.2, -5, 20, Math.PI / 2); paper(); } }
  // ROOF: deck, helipad, parapet, davit crane (the gondola hangs from it)
  { const y = ROOF; sb.box('mat', '#d6d2ca', X1 - X0, 0.02, ZF - ZB, 0, y + 0.01, (ZF + ZB) / 2); sb.cyl('mat', '#ffd23a', 3.4, 0.02, 4, y + 0.02, -2.5, 28); sb.cyl('mat', '#d6d2ca', 3.0, 0.03, 4, y + 0.025, -2.5, 28); sb.box('mat', '#ffd23a', 0.5, 0.04, 3, 3, y + 0.03, -2.5); sb.box('mat', '#ffd23a', 0.5, 0.04, 3, 5, y + 0.03, -2.5); sb.box('mat', '#ffd23a', 1.5, 0.04, 0.5, 4, y + 0.03, -2.5);
    sb.box('mat', '#f3f2f2', 0.6, 1, ZF - ZB, 21.7, y + 0.5, (ZF + ZB) / 2); sb.box('mat', '#ec3013', 0.62, 0.08, ZF - ZB, 21.7, y + 1.0, (ZF + ZB) / 2);
    sb.box('mat', '#ffd23a', 0.5, 13, 0.5, 21.2, y + 6.5, -3.2); sb.box('mat', '#ffd23a', 6, 0.5, 0.5, 23.9, y + 13, -3.2); sb.box('mat', '#201e1d', 0.7, 0.7, 0.7, 26.6, y + 12.8, -3.2); for (let i = 0; i < 6; i++) sb.box('mat', '#201e1d', 0.52, 0.5, 0.52, 21.2, y + 1 + i * 2, -3.2); }
  sb.build(ART); { const o = alarm.build(ART); if (o.glo) o.glo.material = alarmMat; } { const o = leds.build(ART); if (o.glo) o.glo.material = ledMat; }

  // ================= THE FOX (Combat Workshop rig) =================
  const fox = kit.makeFox({ ...CAST.player }), FP = fox.userData.P, swordArm = FP.arms[1], gunArm = FP.arms[0];
  const blob = new THREE.Mesh(new THREE.CircleGeometry(0.45, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false })); blob.rotation.x = -Math.PI / 2; scene.add(blob);
  const P = { x: -17, y: 0, vx: 0, vy: 0, face: 1, ground: true, dbl: false, coyote: 0, buf: 0, hp: 100, en: 100, enT: 0, inv: 0, swing: 0, swingDur: 0.4, combo: 0, comboT: 0, hitDone: true, pow: 1, beatAt: -9, fireCd: 0, recoil: 0, spin: 0, on: null, ko: 0, drop: 0 };
  const CP = { x: -17, y: 0, f: 0 }; let maxFloor = 0;
  const St = { t: 0, state: 'ready', paused: false, shake: 0, hitStop: 0, zoom: 1, kills: 0, kos: 0, time: 0, banner: '', bannerT: 0, toast: null, won: null };
  const stick = { x: 0, y: 0 }, keys = new Set();

  // ================= FX: bolts, sparks, floating words, pearls =================
  const boltGeo = new THREE.CapsuleGeometry(0.07, 0.7, 3, 6); boltGeo.rotateZ(Math.PI / 2);
  const boltMatP = new THREE.MeshBasicMaterial({ color: 0x7df9ff }), boltMatE = new THREE.MeshBasicMaterial({ color: 0xff3b2a });
  const bolts = []; const fireBolt = (x, y, vx, vy, mine, dmg) => { let b = bolts.find(q => !q.on); if (!b) { b = { m: new THREE.Mesh(boltGeo, boltMatP) }; const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); gl.scale.set(1.6, 0.9, 1); b.m.add(gl); b.gl = gl; scene.add(b.m); bolts.push(b); } b.gl.material.color.set(mine ? 0x7df9ff : 0xff3b2a); Object.assign(b, { on: true, x, y, vx, vy, mine, dmg, life: 1.4 }); b.m.material = mine ? boltMatP : boltMatE; b.m.scale.setScalar(mine ? 1 : 1.5); b.m.visible = true; b.m.rotation.z = Math.atan2(vy, vx); };
  const sparkGeo = Bx(0.12, 0.12, 0.12), sparks = [];
  const burst = (x, y, n, col = 0xffd23a, sp = 6) => { for (let i = 0; i < n; i++) { let s = sparks.find(q => !q.on); if (!s) { s = { m: new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: col })) }; scene.add(s.m); sparks.push(s); } const a = Math.random() * 6.283, v = sp * (0.4 + Math.random() * 0.8); Object.assign(s, { on: true, x, y, z: 0.4, vx: Math.cos(a) * v, vy: Math.sin(a) * v + 2, life: 0.35 + Math.random() * 0.35 }); s.m.material.color.set(col); s.m.visible = true; } };
  const wordTex = {}, words = []; const say3 = (txt, x, y, col = '#ffd23a') => { const k = txt + col; if (!wordTex[k]) wordTex[k] = CT(256, 64, (g, w, h) => { g.font = '900 40px Archivo, sans-serif'; g.textBaseline = 'middle'; g.lineWidth = 8; g.strokeStyle = '#000'; g.strokeText(txt, 8, h / 2); g.fillStyle = col; g.fillText(txt, 8, h / 2); });
    let s = words.find(q => !q.on); if (!s) { s = { sp: new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false })) }; s.sp.renderOrder = 20; scene.add(s.sp); words.push(s); } s.sp.material.map = wordTex[k]; s.sp.material.needsUpdate = true; s.sp.scale.set(2.4, 0.6, 1); Object.assign(s, { on: true, x, y, life: 0.8 }); s.sp.visible = true; };
  const pearlGeo = Sp(0.22), pearlMat = new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x9ab, shininess: 120 }), pearls = [];
  const dropPearl = (x, y) => { const m = new THREE.Mesh(pearlGeo, pearlMat); scene.add(m); pearls.push({ m, x, y: y + 0.5, vy: 4, on: true }); };
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a });
  const arcMat = new THREE.MeshBasicMaterial({ color: 0xd8fbff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), arc = new THREE.Mesh(new THREE.RingGeometry(1.5, 2.6, 28, 1, -1.3, 2.6), arcMat); arc.renderOrder = 15; scene.add(arc); const ARC = { t: 0 };
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }), jring = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.62, 28), ringMat); jring.rotation.x = -Math.PI / 2; scene.add(jring); const JR = { t: 0 };
  const muzzle = (x, y, col) => glowPop(x, y, col, 1.5);
  const glowTex = CT(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  const flashMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  function flash(e, on) { if (e.flashOn === on) return; e.flashOn = on; for (const [m, mat] of e.m.userData.ms) if (m.material !== shieldMat || !on) m.material = on ? flashMat : mat; }
  const barBg = new THREE.MeshBasicMaterial({ color: 0x000000, depthTest: false }), barFg = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false }), barGeo = new THREE.PlaneGeometry(1, 1);
  function hpBar(e, dt) { e.barT = (e.barT || 0) - dt; if (e.barT <= 0 || e.boss) { if (e.bar) e.bar.visible = false; return; } if (!e.bar) { e.bar = new THREE.Group(); const bg = new THREE.Mesh(barGeo, barBg); bg.scale.set(1.3, 0.16, 1); const fg = new THREE.Mesh(barGeo, barFg); fg.scale.set(1.2, 0.08, 1); fg.position.z = 0.01; e.bar.add(bg, fg); e.bar.userData.fg = fg; e.bar.renderOrder = 18; bg.renderOrder = 18; fg.renderOrder = 19; scene.add(e.bar); }
    const k = Math.max(0, e.hp / e.max), fg = e.bar.userData.fg; e.bar.visible = true; fg.scale.x = 1.2 * k; fg.position.x = -0.6 * (1 - k); e.bar.position.set(e.x, e.y + BOX[e.type][2] + 0.5, 1.2); }
  function deathAnim(e, dt) { e.dying -= dt; const g = e.m; e.dvy -= 22 * dt; e.x += e.dvx * dt; e.y += e.dvy * dt; g.position.set(e.x, e.y, 0); g.rotation.z += (e.type === 'drone' ? 14 : 9) * dt * Math.sign(e.dvx || 1); g.scale.multiplyScalar(e.dying < 0.2 ? 0.85 : 1); flash(e, Math.floor(e.dying * 20) % 2 === 0);
    if (e.fly) { const f = e.fly; f.vy -= 22 * dt; f.m.position.x += f.vx * dt; f.m.position.y += f.vy * dt; f.m.rotation.z += f.r * dt; if (e.dying <= 0) scene.remove(f.m); }
    if (e.dying <= 0) { g.visible = false; burst(e.x, e.y + 0.4, 16, 0xff9b2a, 8); glowPop(e.x, e.y + 0.4, 0xffb347, 2.4); chunks(e.x, e.y + 0.4, 5); St.shake = Math.max(St.shake, 0.25); } }
  const chunkGeo = Bx(0.22, 0.16, 0.22), chunkMats = [toon('#f3f2f2'), toon('#2a2d33'), toon('#ec3013')], chunkL = [];
  function chunks(x, y, n) { for (let i = 0; i < n; i++) { let c = chunkL.find(q => !q.on); if (!c) { c = { m: new THREE.Mesh(chunkGeo, chunkMats[i % 3]) }; scene.add(c.m); chunkL.push(c); } Object.assign(c, { on: true, x, y, vx: rr(-6, 6), vy: rr(4, 10), r: rr(-12, 12), life: rr(0.9, 1.4) }); c.m.visible = true; c.m.material = chunkMats[i % 3]; } }
  const pops = []; function glowPop(x, y, col, s) { let p = pops.find(q => !q.on); if (!p) { p = { sp: new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })) }; scene.add(p.sp); pops.push(p); } Object.assign(p, { on: true, life: 0.25, s }); p.sp.material.color.set(col); p.sp.position.set(x, y, 0.6); p.sp.visible = true; }
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }), lineGeo = Bx(1, 0.05, 0.05);
  function tele(e, on, x0, y0, x1, y1) { if (!on) { if (e.line) e.line.visible = false; return; } if (!e.line) { e.line = new THREE.Mesh(lineGeo, lineMat); scene.add(e.line); } const L = Math.hypot(x1 - x0, y1 - y0); e.line.visible = true; e.line.scale.x = L; e.line.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0.3); e.line.rotation.z = Math.atan2(y1 - y0, x1 - x0); lineMat.opacity = 0.35 + 0.35 * Math.sin(St.t * 40); }

  // ROUTE HINT (Ben: "I do not see where to jump"): a pulsing yellow arrow over the next ledge up on this floor (then over the grate in the ceiling hole)
  const hintTex = CT(128, 128, (g, w) => { g.fillStyle = '#ffd23a'; g.strokeStyle = '#000'; g.lineWidth = 8; g.beginPath(); g.moveTo(w / 2, 14); g.lineTo(w - 16, 70); g.lineTo(w / 2 + 18, 70); g.lineTo(w / 2 + 18, 116); g.lineTo(w / 2 - 18, 116); g.lineTo(w / 2 - 18, 70); g.lineTo(16, 70); g.closePath(); g.stroke(); g.fill(); });
  const hint = new THREE.Sprite(new THREE.SpriteMaterial({ map: hintTex, transparent: true, depthTest: false })); hint.renderOrder = 19; hint.scale.set(1.1, 1.1, 1); scene.add(hint);
  const ROUTES = FLOORS.map((F, f) => { const [h0, h1] = holeOf(f + 1); return F.plats.map(([a, b, y]) => [(a + b) / 2, f * FH + y]).concat([[(h0 + h1) / 2, (f + 1) * FH]]); });
  function stepHint() { const f = Math.min(5, Math.floor((P.y + 0.5) / FH)); if (P.y >= ROOF - 0.1 || St.state !== 'run') { hint.visible = false; return; } const nx = ROUTES[f].find(([, y]) => y > P.y + 0.3); if (!nx) { hint.visible = false; return; }
    hint.visible = true; hint.position.set(nx[0], nx[1] + 1.2 + Math.sin(St.t * 5) * 0.2, 1); hint.material.opacity = 0.65 + 0.35 * Math.sin(St.t * 5); }

  // ================= ENEMIES =================
  const WH = toon('#f3f2f2'), DK = toon('#2a2d33'), GR = toon('#9aa0a6'), shieldMat = new THREE.MeshPhongMaterial({ color: 0x7df9ff, transparent: true, opacity: 0.5, shininess: 120, depthWrite: false });
  const foes = [];
  function mkMesh(type) { const g = new THREE.Group(); scene.add(g); const u = g.userData;
    if (type === 'crawler' || type === 'dropper') { const body = M(type === 'dropper' ? Sp(0.45) : Bx(1.2, 0.5, 0.9), type === 'dropper' ? DK : WH, 0, 0.55, 0, g, 0.03, type === 'dropper' ? 0.45 : undefined); if (type === 'crawler') M(Bx(0.9, 0.12, 0.7), DK, 0, 0.86, 0, g, 0); M(Sp(0.12, 8, 6), eyeMat, type === 'dropper' ? 0.36 : 0.62, 0.6, 0, g, 0);
      u.legs = []; for (let i = 0; i < (type === 'dropper' ? 6 : 4); i++) { const lg = new THREE.Group(); lg.position.set(type === 'dropper' ? (i % 3 - 1) * 0.3 : (i % 2 ? 0.45 : -0.45), 0.45, i < (type === 'dropper' ? 3 : 2) ? 0.35 : -0.35); g.add(lg); M(Bx(0.08, 0.5, 0.08), DK, 0, -0.22, 0, lg, 0.015); u.legs.push(lg); }
      if (type === 'dropper') { u.cable = M(Bx(0.03, 1, 0.03), DK, 0, 1.5, 0, g, 0); } }
    else if (type === 'drone') { M(Sp(0.42), WH, 0, 0, 0, g, 0.03, 0.42); M(new THREE.TorusGeometry(0.46, 0.06, 6, 20), DK, 0, 0, 0, g, 0).rotation.x = Math.PI / 2; M(Sp(0.13, 8, 6), eyeMat, 0.36, 0, 0.12, g, 0); u.rot = []; for (const sx of [-0.35, 0.35]) { M(Bx(0.06, 0.25, 0.06), DK, sx, 0.45, 0, g, 0); const r = M(Bx(0.7, 0.03, 0.1), GR, sx, 0.58, 0, g, 0); u.rot.push(r); } }
    else if (type === 'turret') { M(Bx(0.3, 1.3, 1.3), DK, 0, 0, 0, g, 0.03); M(Sp(0.42), GR, 0, 0, 0, g, 0.03, 0.42); const piv = new THREE.Group(); g.add(piv); M(Bx(1.0, 0.2, 0.2), DK, 0.5, 0, 0, piv, 0.02); const tip = new THREE.Mesh(Sp(0.14, 8, 6), new THREE.MeshBasicMaterial({ color: 0x551111 })); tip.position.x = 1.05; piv.add(tip); u.piv = piv; u.tip = tip; }
    else if (type === 'guard') { M(Bx(0.9, 1.3, 0.7), WH, 0, 1.15, 0, g, 0.03); M(Bx(0.6, 0.45, 0.55), DK, 0, 2.0, 0, g, 0.03); M(Bx(0.08, 0.12, 0.5), eyeMat, 0.31, 2.02, 0, g, 0); M(Bx(0.92, 0.12, 0.72), toon('#ec3013'), 0, 1.5, 0, g, 0);
      u.legs = []; for (const sz of [-0.2, 0.2]) { const lg = new THREE.Group(); lg.position.set(0, 0.55, sz); g.add(lg); M(Bx(0.22, 0.55, 0.22), DK, 0, -0.27, 0, lg, 0.02); u.legs.push(lg); }
      u.shield = M(Bx(0.12, 1.7, 1.1), shieldMat, 0.65, 1.15, 0, g, 0); M(Bx(0.14, 1.72, 0.06), DK, 0.66, 1.15, 0.55, g, 0); M(Bx(0.14, 1.72, 0.06), DK, 0.66, 1.15, -0.55, g, 0); }
    { const eye = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff3b2a, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); eye.scale.setScalar(type === 'guard' ? 1.1 : 0.9); eye.position.set(type === 'guard' ? 0.36 : type === 'dropper' ? 0.4 : type === 'turret' ? 0 : 0.62, type === 'guard' ? 2.02 : type === 'drone' || type === 'turret' ? 0 : 0.6, 0.2); g.add(eye); u.eyeGlow = eye; }
    u.ms = []; g.traverse(o => { if (o.isMesh && o.material !== outlineMat && o.material !== eyeMat) u.ms.push([o, o.material]); });
    return g; }
  const BOX = { crawler: [0.6, 0, 1.0], dropper: [0.5, 0, 1.0], drone: [0.5, -0.5, 0.5], turret: [0.5, -0.6, 0.6], guard: [0.5, 0, 2.3] };
  function spawn(def, f, extra = {}) { const [type] = def, yb = f * FH, e = { type, f, alive: true, t: 0, cd: rr(0.5, 1.5), face: -1, state: 'idle', hp: { crawler: 40, dropper: 30, drone: 25, turret: 50, guard: 70 }[type], hit: 0, ...extra };
    if (type === 'crawler' || type === 'guard') Object.assign(e, { x0: def[1], x1: def[2], x: (def[1] + def[2]) / 2, y: yb + def[3] });
    if (type === 'drone') Object.assign(e, { hx: def[1], hy: yb + def[2], x: def[1], y: yb + def[2] });
    if (type === 'turret') Object.assign(e, { x: def[1], y: yb + def[2], face: def[3] });
    if (type === 'dropper') Object.assign(e, { x: def[1], y: yb + def[2] - 1.0, top: yb + def[2] + 0.1, state: 'hang' });
    e.max = e.hp; e.m = mkMesh(type); foes.push(e); return e; }
  FLOORS.forEach((F, f) => F.foes.forEach(d => spawn(d, f)));
  const overlapP = (x0, x1, y0, y1) => P.x + 0.35 > x0 && P.x - 0.35 < x1 && P.y + 1.7 > y0 && P.y < y1;
  const fBox = e => { const b = BOX[e.type]; return [e.x - b[0], e.x + b[0], e.y + b[1], e.y + b[2]]; };
  function hurt(d, fromX) { if (DM.on) { burst(P.x, P.y + 1, 6, 0xff3b2a, 4); return; } if (P.inv > 0 || P.ko > 0 || St.state !== 'run') return; P.hp = Math.max(0, P.hp - d); P.inv = 1.0; P.vx = (P.x >= fromX ? 1 : -1) * 4; P.vy = 4; P.ground = false; St.shake = Math.max(St.shake, 0.35); burst(P.x, P.y + 1, 10, 0xff3b2a, 5); say3('-' + d, P.x, P.y + 2.4, '#ff6b5a');
    if (P.hp <= 0) { P.ko = 1.6; St.kos++; St.banner = 'KNOCKED OUT'; St.bannerT = 1.6; } }
  function damage(e, d, fromX, kind) { if (!e.alive) return false;
    if (e.type === 'guard' && e.state !== 'stagger' && Math.sign(fromX - e.x) === e.face) { burst(e.x + e.face * 0.7, e.y + 1.2, 8, 0x7df9ff, 4); glowPop(e.x + e.face * 0.7, e.y + 1.2, 0x7df9ff, 1.2); say3('BLOCKED', e.x, e.y + 2.8, '#7df9ff'); e.shieldT = 0.2; if (kind === 'melee') { P.vx = P.x < e.x ? -6 : 6; } return false; }
    e.hp -= d; e.hit = 0.12; e.barT = 2.5; burst(e.x, e.y + (BOX[e.type][1] + BOX[e.type][2]) / 2, 8, 0xffffff, 5); glowPop(e.x, e.y + (BOX[e.type][1] + BOX[e.type][2]) / 2, 0xffffff, 0.9);
    if (e.type !== 'turret' && e.type !== 'guard' && e.state !== 'hang') { e.kx = Math.sign(e.x - fromX) * 7; e.ky = e.type === 'drone' ? 2 : 0; } if (e.type === 'crawler' && e.state === 'crouch') { e.state = 'idle'; e.cd = 0.8; }
    if (e.hp <= 0) { e.alive = false; e.dying = 0.75; e.dvx = Math.sign(e.x - fromX) * 4 || 2; e.dvy = e.type === 'drone' ? 2 : 7; e.state = 'dead'; St.kills++; St.hitStop = Math.max(St.hitStop, 0.07); burst(e.x, e.y + 0.5, 14, 0xffd23a, 7); chunks(e.x, e.y + 0.6, 7); St.shake = Math.max(St.shake, 0.22); if (e.bar) e.bar.visible = false; if (e.line) e.line.visible = false;
      if (e.type === 'guard') { const sh = e.m.userData.shield; e.m.remove(sh); scene.add(sh); sh.position.set(e.x + e.face * 0.65, e.y + 1.15, 0); e.fly = { m: sh, vx: e.face * 5, vy: 6, r: e.face * 8 }; }
      if (Math.random() < 0.45) dropPearl(e.x, e.y); } return true; }
  function updFoe(e, dt) { if (!e.alive) { if (e.dying > 0) deathAnim(e, dt); return; } e.t += dt; if (e.kx) { e.x += e.kx * dt; e.y += (e.ky || 0) * dt; e.kx = damp(e.kx, 0, 9, dt); e.ky = damp(e.ky || 0, 0, 9, dt); if (Math.abs(e.kx) < 0.05) e.kx = 0; if (e.x0 != null) e.x = clamp(e.x, e.x0, e.x1); } e.cd -= dt; e.hit = Math.max(0, e.hit - dt); const g = e.m, dx = P.x - e.x, py = P.y + 0.9, near = Math.abs(py - (e.y + 0.6)) < 2.4 && P.ko <= 0;
    if (e.type === 'crawler' || (e.type === 'dropper' && e.state === 'walk')) { const chase = near && Math.abs(dx) < 7, u = g.userData; if (e.state === 'walk' || e.state === 'idle') { if (chase) e.face = Math.sign(dx) || e.face; e.x += e.face * (chase ? 3 : 1.6) * dt; if (chase && Math.abs(dx) < 3.4 && e.cd <= 0 && e.type === 'crawler') { e.state = 'crouch'; e.t = 0; } }
      else if (e.state === 'crouch') { e.squash = 1; if (e.t > 0.4) { e.state = 'lunge'; e.t = 0; say3('!', e.x, e.y + 1.6, '#ff6b5a'); } } else if (e.state === 'lunge') { e.x += e.face * 10 * dt; e.hop = Math.sin(Math.min(1, e.t / 0.3) * Math.PI) * 0.6; if (e.t > 0.3) { e.state = 'idle'; e.cd = 1.6; e.hop = 0; burst(e.x, e.y, 5, 0xcfc8bb, 3); } }
      if (e.x < e.x0) { e.x = e.x0; e.face = 1; } if (e.x > e.x1) { e.x = e.x1; e.face = -1; } e.squash = damp(e.squash || 0, e.state === 'crouch' ? 1 : 0, 14, dt); g.userData.eyeGlow.material.opacity = e.state === 'crouch' ? 0.6 + 0.4 * Math.sin(e.t * 50) : 0.55;
      g.userData.legs.forEach((l, i) => l.rotation.z = e.state === 'crouch' ? 0.9 : Math.sin(e.t * (e.state === 'lunge' ? 30 : 14) + i * 1.6) * 0.5); const b = fBox(e); if (overlapP(...b)) hurt(e.state === 'lunge' ? 14 : 10, e.x); }
    else if (e.type === 'dropper') { if (e.state === 'hang') { if (Math.abs(dx) < 2 && P.y < e.y && P.y > e.top - 8.5) { e.state = 'shake'; e.t = 0; } }
      else if (e.state === 'shake') { g.position.x = e.x + Math.sin(e.t * 60) * 0.08; if (e.t > 0.35) { e.state = 'fall'; e.vy = 0; const s = supportAt(e.x, e.y); e.land = s; } }
      else if (e.state === 'fall') { e.vy -= 30 * dt; e.y += e.vy * dt; if (e.y <= e.land.y) { e.y = e.land.y; e.state = 'walk'; e.x0 = Math.max(e.land.x0 + 0.5, e.x - 3); e.x1 = Math.min(e.land.x1 - 0.5, e.x + 3); burst(e.x, e.y, 8, 0xcfc8bb, 4); } if (overlapP(...fBox(e))) hurt(15, e.x); }
      if (g.userData.cable) { g.userData.cable.visible = e.state === 'hang' || e.state === 'shake'; g.userData.cable.scale.y = Math.max(0.1, e.top - e.y - 1); g.userData.cable.position.y = 1 + (e.top - e.y - 1) / 2; } }
    else if (e.type === 'drone') { const dist = Math.hypot(dx, py - e.y);
      if (e.state === 'idle') { const tx = e.hx + clamp(dx * 0.3, -3, 3), ty = e.hy + Math.sin(e.t * 2) * 0.4; e.x = damp(e.x, tx, 2, dt); e.y = damp(e.y, ty, 2, dt); e.face = Math.sign(dx) || 1; if (dist < 9 && e.cd <= 0 && P.ko <= 0 && Math.abs(P.y - e.hy) < 7) { e.state = 'aim'; e.t = 0; e.tx = P.x; e.ty = P.y + 1.0; } }
      else if (e.state === 'aim') { g.position.x = e.x + Math.sin(e.t * 50) * 0.06; tele(e, true, e.x, e.y, e.tx, e.ty); g.userData.eyeGlow.material.opacity = 1; if (e.t > 0.55) { tele(e, false); g.userData.eyeGlow.material.opacity = 0.55; e.state = 'swoop'; e.t = 0; const L = Math.hypot(e.tx - e.x, e.ty - e.y) || 1; e.vx = (e.tx - e.x) / L * 11; e.vy = (e.ty - e.y) / L * 11; } }
      else if (e.state === 'swoop') { e.x += e.vx * dt; e.y += e.vy * dt; const fl = e.f * FH; if (e.t > 1.0 || e.y < fl + 0.6 || inSolid(e.x, e.y)) { e.state = 'back'; e.cd = 1.8; e.y = Math.max(e.y, fl + 0.6); } if (overlapP(...fBox(e))) { hurt(12, e.x); e.state = 'back'; e.cd = 1.8; } }
      else if (e.state === 'back') { e.x = damp(e.x, e.hx, 3, dt); e.y = damp(e.y, e.hy, 3, dt); if (Math.hypot(e.x - e.hx, e.y - e.hy) < 0.5) e.state = 'idle'; }
      g.userData.rot.forEach((r, i) => r.rotation.y += dt * (i ? 40 : -40)); }
    else if (e.type === 'turret') { const a = Math.atan2(py - e.y, dx), lim = e.face > 0 ? clamp(a, -1.3, 1.3) : (Math.abs(a) > 1.84 ? a : (a > 0 ? 1.84 : -1.84)); g.userData.piv.rotation.z = lim;
      const act = Math.hypot(dx, py - e.y) < 18 && Math.abs(P.y - e.y) < 6 && P.ko <= 0; if (e.state === 'idle' && act && e.cd <= 0) { e.state = 'charge'; e.t = 0; }
      if (e.state === 'charge') { g.userData.tip.material.color.setRGB(0.4 + e.t * 1.0, 0.1, 0.08); tele(e, true, e.x + Math.cos(lim) * 1.1, e.y + Math.sin(lim) * 1.1, e.x + Math.cos(lim) * 16, e.y + Math.sin(lim) * 16); g.userData.eyeGlow.material.opacity = 0.5 + e.t; if (e.t > 0.6) { e.state = 'idle'; e.cd = 2.2; fireBolt(e.x + Math.cos(lim) * 1.1, e.y + Math.sin(lim) * 1.1, Math.cos(lim) * 10, Math.sin(lim) * 10, false, 10); g.userData.tip.material.color.set(0x551111); tele(e, false); g.userData.eyeGlow.material.opacity = 0.55; muzzle(e.x + Math.cos(lim) * 1.1, e.y + Math.sin(lim) * 1.1, 0xff3b2a); } } }
    else if (e.type === 'guard') { const see = near && Math.abs(dx) < 7;
      if (e.state === 'idle') { if (see) { e.face = Math.sign(dx) || e.face; if (Math.abs(dx) > 1.9) e.x += e.face * 2.2 * dt; else if (e.cd <= 0) { e.state = 'wind'; e.t = 0; } } else { e.x += e.face * 1.4 * dt; } if (e.x < e.x0) { e.x = e.x0; e.face = 1; } if (e.x > e.x1) { e.x = e.x1; e.face = -1; } }
      else if (e.state === 'wind') { g.userData.eyeGlow.material.opacity = 0.6 + 0.4 * Math.sin(e.t * 50); if (e.t > 0.45) { e.state = 'bash'; e.t = 0; } }
      else if (e.state === 'bash') { e.x = clamp(e.x + e.face * 7 * dt, e.x0, e.x1); if (overlapP(Math.min(e.x, e.x + e.face * 1.1), Math.max(e.x, e.x + e.face * 1.1), e.y, e.y + 2.2)) hurt(15, e.x); if (e.t > 0.25) { e.state = 'stagger'; e.t = 0; say3('OPEN!', e.x, e.y + 2.8, '#ffd23a'); } }
      else if (e.state === 'stagger') { if (e.t > 1.0) { e.state = 'idle'; e.cd = 0.9; } }
      const sd = e.state === 'stagger' ? 1 : 0; e.sd = damp(e.sd || 0, sd, 10, dt); g.userData.legs.forEach((l, i) => l.rotation.z = Math.sin(e.t * 8 + i * Math.PI) * 0.4 * (1 - e.sd)); const sh = g.userData.shield; sh.position.x = e.state === 'wind' ? 0.45 : 0.65 - e.sd * 0.25; sh.position.y = 1.15 - e.sd * 0.75; sh.rotation.z = -e.sd * 1.1; shieldMat.opacity = 0.5 + (e.shieldT > 0 ? 0.4 : 0); e.shieldT = (e.shieldT || 0) - dt; g.rotation.z = e.sd * 0.12 * Math.sin(e.t * 18); if (e.state === 'idle' && overlapP(...fBox(e))) hurt(8, e.x); }
    if (e.type !== 'drone' || e.state !== 'aim') g.position.x = e.type === 'dropper' && e.state === 'shake' ? g.position.x : e.x; g.position.y = e.y + (e.hop || 0); g.scale.set(e.type === 'turret' ? 1 : e.face, 1, 1).multiplyScalar(e.hit > 0 ? 1.1 : 1); if (e.type === 'turret') g.scale.x = 1; if (e.squash) { g.scale.y *= 1 - e.squash * 0.35; g.scale.x *= 1 + e.squash * 0.15; }
    flash(e, e.hit > 0); hpBar(e, dt); }

  // ================= BOSS: SUDS-9 =================
  const BS = { hp: 900, max: 900, state: 'wait', t: 0, gy: 44, plan: 0, sweeps: 0, bladeX: 22, bladeHi: false, docked: false, hit: 0, n: 0 };
  const gond = new THREE.Group(); scene.add(gond);
  M(Bx(4.2, 0.25, 2.2), GR, 24.3, 0, 0, gond, 0.03); for (const sz of [-1.05, 1.05]) M(Bx(4.2, 0.08, 0.08), DK, 24.3, 1.1, sz, gond, 0); for (const x of [22.3, 26.3]) for (const sz of [-1.05, 1.05]) M(Bx(0.08, 1.1, 0.08), DK, x, 0.55, sz, gond, 0);
  for (let i = 0; i < 6; i++) M(Bx(0.7, 0.2, 0.04), toon(i % 2 ? '#201e1d' : '#ffd23a'), 22.65 + i * 0.7, -0.05, 1.13, gond, 0);
  const robot = new THREE.Group(); robot.position.set(24, 0.12, 0); gond.add(robot);
  M(Bx(1.5, 1.6, 1.0), WH, 0, 1.0, 0, robot, 0.04); M(Bx(1.52, 0.18, 1.02), toon('#ec3013'), 0, 1.4, 0, robot, 0); M(Bx(0.5, 0.5, 0.6), DK, 0, 0.1, 0, robot, 0.02);
  const dome = M(Sp(0.62, 16, 10), new THREE.MeshPhongMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.55, shininess: 120, depthWrite: false }), 0, 2.2, 0, robot, 0); M(Bx(0.9, 0.2, 0.5), eyeMat, -0.25, 2.2, 0, robot, 0);
  const tank = M(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 10), toon('#2e7fb8'), 0.6, 1.3, -0.6, robot, 0.02); M(Bx(0.7, 0.14, 0.14), DK, -0.3, 1.9, 0.6, robot, 0.02);
  const armPiv = new THREE.Group(); armPiv.position.set(-0.75, 1.3, 0.3); robot.add(armPiv); const pole = M(Bx(1, 0.16, 0.16), GR, -0.5, 0, 0, armPiv, 0.02); const blade = new THREE.Group(); armPiv.add(blade); M(Bx(0.18, 0.9, 2.6), DK, 0, 0, 0, blade, 0.02); M(Bx(0.08, 0.95, 2.62), toon('#ffd23a'), -0.12, 0, 0, blade, 0);
  const cables = [0, 1].map(i => M(Bx(0.04, 1, 0.04), DK, 23.4 + i * 2.2, 0, -0.4, scene, 0));
  const warn = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 2.4), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0, depthWrite: false })); warn.rotation.x = -Math.PI / 2; warn.position.set(0, ROOF + 0.05, 0); scene.add(warn);
  const bubbles = [], bubGeo = Sp(0.38, 12, 8), bubMat = new THREE.MeshPhongMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.55, shininess: 140, specular: 0xffffff, depthWrite: false });
  const lob = () => { const x0 = 23.2, y0 = BS.gy + 2.4, tx = clamp(P.x + rr(-2.5, 2.5), -19, 19), tf = 1.5, gg = 7, vx = (tx - x0) / tf, vy = ((ROOF + 0.4 - y0) + 0.5 * gg * tf * tf) / tf; const m = new THREE.Mesh(bubGeo, bubMat); m.position.set(x0, y0, 0); scene.add(m); bubbles.push({ m, x: x0, y: y0, vx, vy, on: true }); };
  const relic = new THREE.Group(); relic.visible = false; scene.add(relic); M(new THREE.TorusGeometry(0.7, 0.1, 8, 28), toon('#c9a227'), 0, 0, 0, relic, 0.02); M(Sp(0.42, 18, 12), new THREE.MeshPhongMaterial({ color: 0xffffff, emissive: 0x334455, shininess: 150, specular: 0xffffff }), 0, 0, 0, relic, 0);
  { const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.0, 14, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xfff1c8, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide })); beam.position.y = 6; relic.add(beam); }
  relic.position.set(0, ROOF + 1.4, 0); let relicOn = false;
  const bossBox = () => [22.7, 25.5, BS.gy + 0.3, BS.gy + 2.9];
  function hitBoss(d, kind) { if (BS.state === 'wait' || BS.state === 'dead' || BS.state === 'intro') return false; const k = BS.docked ? 1 : kind === 'melee' ? 0.6 : 0.4; const dd = Math.round(d * k); BS.hp = Math.max(0, BS.hp - dd); BS.hit = 0.15; burst(24, BS.gy + 2, 6, BS.docked ? 0xffd23a : 0x9fe8ff, 5); if (BS.docked) say3('WEAK POINT', 23.5, BS.gy + 3.6); if (BS.hp <= 0) { BS.state = 'dead'; BS.t = 0; St.shake = 0.8; St.banner = 'SUDS-9 IS DOWN'; St.bannerT = 2.4; foes.filter(f => f.boss && f.alive).forEach(f => damage(f, 999, f.x, 'x')); } return true; }
  function updBoss(dt) { BS.t += dt; BS.hit = Math.max(0, BS.hit - dt); const ph = BS.hp > BS.max * 0.6 ? 1 : BS.hp > BS.max * 0.3 ? 2 : 3;
    if (BS.state === 'wait') { if (P.y >= ROOF - 0.1 && P.ground) { BS.state = 'intro'; BS.t = 0; St.banner = 'SUDS-9 · THE WINDOW CLEANER'; St.bannerT = 2.6; } }
    else if (BS.state === 'intro') { BS.gy = lerp(44, 51, smooth(0, 1, BS.t / 2.4)); if (BS.t > 2.6) next(); }
    else if (BS.state === 'idle') { BS.gy = damp(BS.gy, 51 + Math.sin(St.t * 1.3) * 2.2, 2, dt); if (BS.t > (ph === 3 ? 0.8 : 1.3)) next(); }
    else if (BS.state === 'spray') { BS.gy = damp(BS.gy, 52, 2, dt); if (BS.t > 0.55) { BS.t = 0; lob(); BS.n--; if (BS.n <= 0) { BS.state = 'idle'; BS.t = 0; } } }
    else if (BS.state === 'minions') { if (BS.t > 0.6) { const live = foes.filter(f => f.boss && f.alive).length; for (let i = 0; i < Math.min(2, 4 - live); i++) { const e = spawn(['drone', i ? 6 : -6, 6 + i], 6, { boss: true }); e.x = 23; e.y = BS.gy + 2; e.state = 'back'; } BS.state = 'idle'; BS.t = 0; } }
    else if (BS.state === 'dock') { BS.gy = damp(BS.gy, ROOF, 5, dt); if (BS.t > 0.8) { BS.gy = ROOF; BS.state = 'tele'; BS.t = 0; BS.bladeX = 21.6; St.banner = BS.bladeHi ? 'STAY DOWN!' : 'JUMP!'; St.bannerT = 0.9; } }
    else if (BS.state === 'tele') { warn.material.opacity = 0.25 + 0.25 * Math.sin(BS.t * 30); warn.material.color.set(BS.bladeHi ? 0xffd23a : 0xec3013); if (BS.t > 0.8) { BS.state = 'swipe'; BS.t = 0; } }
    else if (BS.state === 'swipe') { BS.bladeX -= (ph === 3 ? 30 : 24) * dt; const y0 = BS.bladeHi ? ROOF + 2.0 : ROOF, y1 = BS.bladeHi ? ROOF + 2.9 : ROOF + 0.85; if (overlapP(BS.bladeX - 0.4, BS.bladeX + 0.4, y0, y1)) hurt(18, BS.bladeX + 3);
      if (BS.bladeX < X0 + 0.5) { warn.material.opacity = 0; if (BS.sweeps > 1) { BS.sweeps--; BS.bladeHi = !BS.bladeHi; BS.state = 'tele'; BS.t = 0; BS.bladeX = 21.6; St.banner = BS.bladeHi ? 'STAY DOWN!' : 'JUMP!'; St.bannerT = 0.9; } else { BS.state = 'docked'; BS.t = 0; BS.docked = true; St.banner = 'HIT IT NOW!'; St.bannerT = 1.2; } } }
    else if (BS.state === 'docked') { BS.bladeX = damp(BS.bladeX, 21.6, 4, dt); if (BS.t > 2.3) { BS.docked = false; BS.state = 'idle'; BS.t = 0; } }
    else if (BS.state === 'dead') { BS.gy -= Math.min(30, BS.t * 14) * dt; if (Math.random() < 0.3) burst(24 + rr(-1.5, 1.5), BS.gy + rr(0, 3), 6, pick([0xffd23a, 0xff6b2a, 0xffffff]), 7); if (BS.t > 1.8 && !relicOn) { relicOn = true; relic.visible = true; St.banner = 'THE PEARL OF THE SAIL'; St.bannerT = 2.4; } }
    function next() { const plan = ph === 1 ? ['spray', 'sweep'] : ph === 2 ? ['spray', 'minions', 'sweep'] : ['spray', 'sweep2', 'minions', 'spray', 'sweep2']; const s = plan[BS.plan++ % plan.length]; BS.t = 0;
      if (s === 'spray') { BS.state = 'spray'; BS.n = ph === 3 ? 5 : ph === 2 ? 4 : 3; } else if (s === 'minions') BS.state = 'minions'; else { BS.state = 'dock'; BS.sweeps = s === 'sweep2' ? 2 : 1; BS.bladeHi = false; } }
    // pose
    gond.position.y = BS.gy; gondolaDeck.y = BS.gy + 0.125; gond.visible = BS.state !== 'wait' || P.y > ROOF - 10; const ext = BS.state === 'tele' || BS.state === 'swipe' || BS.state === 'docked' ? Math.max(0.5, 23.25 - BS.bladeX) : 0.6;
    pole.scale.x = ext; pole.position.x = -ext / 2; blade.position.x = -ext; blade.position.y = BS.bladeHi && BS.state !== 'docked' ? ROOF + 2.45 - (BS.gy + 1.42) : ROOF + 0.45 - (BS.gy + 1.42); blade.visible = ext > 0.7;
    robot.scale.setScalar(BS.hit > 0 ? 1.06 : 1); dome.material.opacity = BS.docked ? 0.15 : 0.55; robot.rotation.z = BS.state === 'dead' ? Math.min(1.2, BS.t) : 0;
    cables.forEach(c => { const top = ROOF + 12.6, bot = BS.gy + 1.1; c.visible = BS.state !== 'dead' || BS.t < 0.3; c.scale.y = Math.max(0.1, top - bot); c.position.y = (top + bot) / 2; });
    for (const b of bubbles) { if (!b.on) continue; b.vy -= 7 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.m.position.set(b.x, b.y, 0); b.m.scale.setScalar(1 + Math.sin(St.t * 9 + b.x) * 0.06); const pop = () => { b.on = false; scene.remove(b.m); burst(b.x, b.y, 8, 0xe8fbff, 4); };
      if (overlapP(b.x - 0.35, b.x + 0.35, b.y - 0.35, b.y + 0.35)) { hurt(8, b.x); pop(); } else if (b.y < ROOF + 0.3 || b.x < X0) pop(); } }

  // ================= PLAYER =================
  const BEAT = () => T.beatWin ?? 0.13;
  const api = {};
  function startSwing() { const now = St.t, perfect = P.combo > 0 && Math.abs(now - P.beatAt) <= BEAT() && P.comboT > 0;
    P.combo = P.comboT > 0 && P.combo < 3 ? P.combo + 1 : 1; P.perfect = perfect; P.pow = (P.combo === 3 ? T.finisher : 1) * (perfect ? 1.3 : 1); P.swingDur = (T.windup * 0.6 + T.swingTime); P.swing = P.swingDur; P.hitDone = false; P.comboT = T.comboWindow + P.swingDur; if (perfect) say3('PERFECT', P.x, P.y + 2.6); }
  function meleeHit() { ARC.t = 0.16; arcMat.color.set(P.combo === 3 ? 0xffd23a : P.perfect ? 0xfff1a8 : 0xd8fbff); arc.position.set(P.x + P.face * 0.2, P.y + 1.1, 0.4); arc.scale.set(P.face * (P.combo === 3 ? 1.2 : 1), P.combo === 2 ? -1 : 1, 1); arc.rotation.z = P.combo === 3 ? Math.PI / 2 * P.face : 0; const r = T.reach * (P.combo === 3 ? 1.15 : 1), x0 = P.face > 0 ? P.x - 0.3 : P.x - r, x1 = P.face > 0 ? P.x + r : P.x + 0.3, y0 = P.y - 0.5, y1 = P.y + 2.4, d = Math.round(T.swordDmg * P.pow); let hit = false;
    for (const e of foes) { if (!e.alive || Math.abs(e.f - curFloor()) > 1) continue; const b = fBox(e); if (b[0] < x1 && b[1] > x0 && b[2] < y1 && b[3] > y0) { if (damage(e, d, P.x, 'melee')) hit = true; } }
    for (const b of bubbles) if (b.on && b.x > x0 && b.x < x1 && b.y > y0 && b.y < y1) { b.on = false; scene.remove(b.m); burst(b.x, b.y, 8, 0xe8fbff, 4); }
    const bb = bossBox(); if (curFloor() === 6 && bb[0] < x1 && bb[1] > x0 && bb[2] < y1 && bb[3] > y0 && hitBoss(d, 'melee')) hit = true;
    if (hit) { St.hitStop = T.hitStop; St.shake = Math.max(St.shake, 0.12 + (P.combo === 3 ? 0.15 : 0)); } }
  function shoot() { if (P.fireCd > 0) { P.fireQ = true; return; } const cost = T.energyCost; if (P.en < cost) { P.fireCd = 0.25; say3('NO ENERGY', P.x, P.y + 2.4, '#7df9ff'); return; }
    P.en -= cost; P.enT = 0.4; P.fireCd = 1 / T.fireRate; P.recoil = T.recoil; const up = stick.y > 0.5 || keys.has('KeyW') || keys.has('ArrowUp'), side = Math.abs(stick.x) > 0.3 || keys.has('KeyA') || keys.has('KeyD') || keys.has('ArrowLeft') || keys.has('ArrowRight');
    let a = DM.on && DM.aim != null ? DM.aim : up ? (side ? (P.face > 0 ? Math.PI / 4 : Math.PI * 3 / 4) : Math.PI / 2) : (P.face > 0 ? 0 : Math.PI);
    if (!up && !(DM.on && DM.aim != null)) { let best = null, bd = 1e9; for (const e of foes) { if (!e.alive || Math.abs(e.f - curFloor()) > 0 && !e.boss) continue; const ex = e.x - P.x, ey = e.y + (BOX[e.type][1] + BOX[e.type][2]) / 2 - (P.y + 1.2); if (Math.sign(ex) !== P.face || Math.abs(ex) > 16) continue; const ang = Math.abs(Math.atan2(ey, Math.abs(ex))); if (ang < 0.35 && Math.abs(ex) < bd) { bd = Math.abs(ex); best = Math.atan2(ey, ex); } } if (best != null) a = best; }
    const sp = 32, ox = P.x + Math.cos(a) * 0.7, oy = P.y + 1.25 + Math.sin(a) * 0.5; fireBolt(ox, oy, Math.cos(a) * sp, Math.sin(a) * sp, true, T.laserDmg); muzzle(ox, oy, 0x7df9ff); P.aimA = a; P.aimT = 0.3; }
  const curFloor = () => clamp(Math.floor((P.y + 0.5) / FH), 0, 6);
  function doJump() { if (P.ko > 0 || St.state !== 'run') return; const down = stick.y < -0.6 || keys.has('KeyS') || keys.has('ArrowDown');
    if (P.ground && down && P.on && P.on.kind !== 'gondola') { P.drop = 0.25; P.ground = false; P.on = null; P.y -= 0.05; return; }
    if (P.ground || P.coyote > 0) { P.vy = T.jump; P.ground = false; P.coyote = 0; P.dbl = false; P.on = null; }
    else if (!P.dbl) { P.dbl = true; P.vy = T.jump * 1.12; P.spin = 1; burst(P.x, P.y + 0.2, 8, 0xffffff, 2.5); JR.t = 0.3; jring.position.set(P.x, P.y + 0.1, 0); }
    else P.buf = 0.12; }
  function stepPlayer(dt) { if (P.ko > 0) { P.ko -= dt; fox.visible = Math.floor(P.ko * 10) % 2 === 0; if (P.ko <= 0) { Object.assign(P, { x: CP.x, y: CP.y + 0.05, vx: 0, vy: 0, hp: 100, inv: 1.5, ground: false }); fox.visible = true; } return; }
    const kx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), ix = clamp(stick.x + kx, -1, 1);
    const tv = Math.abs(ix) > 0.12 ? ix * T.walk * 1.1 : 0; P.vx = damp(P.vx, tv, P.ground ? T.accel : T.accel * 0.55, dt); if (Math.abs(ix) > 0.12 && P.swing <= 0) P.face = ix > 0 ? 1 : -1;
    P.vy -= T.gravity * dt; if (P.vy < -22) P.vy = -22; P.coyote -= dt; P.buf -= dt; P.drop -= dt; P.inv -= dt;
    // X
    let nx = P.x + P.vx * dt; for (const s of solids) if (nx + 0.35 > s.x0 && nx - 0.35 < s.x1 && P.y + 1.7 > s.y0 + 0.3 && P.y < s.y1 - 0.02) { nx = P.vx > 0 ? s.x0 - 0.351 : s.x1 + 0.351; P.vx = 0; } P.x = nx;
    // Y
    const prevY = P.y; let ny = P.y + P.vy * dt, landed = null;
    if (P.on && P.on.kind === 'gondola' && P.ground) ny = Math.max(ny, P.on.y);
    for (const s of solids) if (P.x + 0.35 > s.x0 && P.x - 0.35 < s.x1) { if (P.vy <= 0 && prevY >= s.y1 - 0.05 && ny < s.y1) { ny = s.y1; landed = s; } else if (P.vy > 0 && prevY + 1.7 <= s.y0 + 0.05 && ny + 1.7 > s.y0) { ny = s.y0 - 1.7; P.vy = 0; } }
    if (P.vy <= 0 && P.drop <= 0) for (const o of ones) if (P.x + 0.3 > o.x0 && P.x - 0.3 < o.x1 && prevY >= o.y - 0.05 - (o.kind === 'gondola' ? 0.4 : 0) && ny < o.y && (!landed || o.y > ny)) { ny = o.y; landed = o; }
    if (landed) { if (!P.ground && P.vy < -9) burst(P.x, ny, 6, 0xcfc8bb, 3); P.y = ny; P.vy = 0; if (!P.ground) { P.ground = true; P.dbl = false; if (P.buf > 0) { P.buf = 0; doJump(); } } P.on = landed.kind ? landed : null; }
    else { if (P.ground) P.coyote = 0.1; P.ground = false; P.y = ny; P.on = null; }
    if (P.x > X1 + 0.2 && P.y < ROOF - 2) { P.ko = 0; Object.assign(P, { x: 14, y: ROOF + 0.05, vx: 0, vy: 0 }); hurt(10, 20); P.inv = 1.2; }   // fell off the gondola side
    // combat timers
    if (P.swing > 0) { P.swing -= dt; const wt = T.windup * 0.6; if (!P.hitDone && P.swingDur - P.swing >= wt) { P.hitDone = true; meleeHit(); } if (P.swing <= 0) { P.beatAt = St.t; if (P.queued) { P.queued = false; startSwing(); } } }
    P.comboT -= dt; if (P.comboT < 0) P.combo = 0; P.fireCd = Math.max(0, P.fireCd - dt); if (P.fireQ && P.fireCd <= 0) { P.fireQ = false; shoot(); } P.recoil = damp(P.recoil, 0, 12, dt); P.aimT -= dt;
    P.enT -= dt; if (P.enT < 0) P.en = Math.min(100, P.en + T.energyRegen * dt);
    // checkpoints + floor banners
    const f = curFloor(); if (P.ground && f > maxFloor) { maxFloor = f; CP.x = P.x; CP.y = P.y; CP.f = f; St.banner = f === 6 ? 'THE ROOF' : 'FLOOR ' + (f + 1) + ' · ' + FLOORS[f].name; St.bannerT = 1.8; } else if (P.ground && f === maxFloor && f === CP.f && Math.abs(P.y - CP.y) < 0.1 && Math.abs(P.x - CP.x) > 0) {}
    for (const p of pearls) { if (!p.on) continue; const s = supportAt(p.x, p.y); p.vy -= 18 * dt; p.y = Math.max(s.y + 0.25, p.y + p.vy * dt); p.m.position.set(p.x, p.y + Math.sin(St.t * 4 + p.x) * 0.08, 0.3); if (overlapP(p.x - 0.3, p.x + 0.3, p.y - 0.3, p.y + 0.3)) { p.on = false; scene.remove(p.m); P.hp = Math.min(100, P.hp + 12); say3('+12', P.x, P.y + 2.4, '#7cff9b'); } }
    if (relicOn && relic.visible && overlapP(-0.8, 0.8, ROOF, ROOF + 3)) { relic.visible = false; win(); } }
  function win() { if (DM.on) { St.won = { time: Math.round(St.time), best: Math.round(St.time), newBest: false, kills: St.kills, kos: 0, gold: 0, first: false, demo: true }; St.state = 'won'; return; }   // the demo never pays out
    const first = !save.flag('pearlSailCleared'); try { save.addRelic('pearlSail'); save.setFlag('pearlSailCleared'); save.addGold(first ? 150 : 25); save.best('pearlSailBestScore', 1); } catch (e) {} const tm = Math.round(St.time);
    const best = save.stat('pearlSailBest', 0); if (!best || tm < best) save.setStat('pearlSailBest', tm); St.won = { time: tm, best: Math.min(best || tm, tm), newBest: !best || tm < best, kills: St.kills, kos: St.kos, gold: first ? 150 : 25, first }; St.state = 'won'; }
  function poseFox(dt) { fox.position.set(P.x, P.y, 0); const ty = P.face > 0 ? Math.PI / 2 : -Math.PI / 2; fox.rotation.y = damp(fox.rotation.y, ty, 18, dt); fox.userData.mood = P.swing > 0 ? 'determined' : 'warm';
    kit.animFox(fox, dt, Math.abs(P.vx), !P.ground); FP.body.rotation.y = 0; FP.body.rotation.x = 0;
    if (P.spin > 0) { P.spin = Math.max(0, P.spin - dt / 0.45); FP.body.rotation.x = -(1 - P.spin) * Math.PI * 2; } if (P.ground) P.spin = 0;
    if (P.swing > 0) { const tt = 1 - Math.max(0, P.swing) / P.swingDur, wf = (T.windup * 0.6) / P.swingDur, w = tt < wf ? smooth(0, 1, tt / wf) : 1, s = tt < wf ? 0 : Math.pow(smooth(0, 1, (tt - wf) / (1 - wf)), 0.7);
      if (P.combo === 1) { swordArm.rotation.set(lerp(-1.2, -3.05, w) + (lerp(-3.05, -0.35, s) + 3.05) * (s > 0 ? 1 : 0), 0, 0.12); FP.sword.rotation.set(Math.PI - 0.3, 0, 0); FP.body.rotation.x = lerp(-0.08 * w, 0.18, s); }
      else if (P.combo === 2) { swordArm.rotation.set(-1.45, 0, s > 0 ? lerp(1.35, -1.25, s) : lerp(0.3, 1.35, w)); FP.sword.rotation.set(Math.PI - 0.15, 0, 0); FP.body.rotation.y = s > 0 ? lerp(0.5, -0.55, s) : lerp(0, 0.5, w); }
      else { swordArm.rotation.set(-1.5, 0, 0.9); FP.sword.rotation.set(Math.PI - 0.2, 0, 0); FP.body.rotation.y = s > 0 ? -s * Math.PI * 2 : w * 0.4; FP.body.position.y += Math.sin(s * Math.PI) * 0.25; } }
    if (P.aimT > 0 || P.fireCd > 0) { const a = P.aimA ?? 0, up = Math.sin(a); gunArm.rotation.x = -1.48 - up * 1.4 - P.recoil * 0.35; gunArm.rotation.z = -0.08; FP.gun.rotation.set(1.43 - P.recoil * 0.5, 0, 0); }
    fox.visible = P.ko > 0 ? fox.visible : (P.inv > 0 ? Math.floor(St.t * 20) % 2 === 0 : true);
    const s = supportAt(P.x, P.y + 0.05); blob.position.set(P.x, s.y + 0.03, 0); const hgt = P.y - s.y; blob.scale.setScalar(clamp(1 - hgt * 0.15, 0.4, 1)); blob.material.opacity = 0.25 * clamp(1 - hgt * 0.12, 0.2, 1); }


  // ================= DEMO (Ben: "add a demo so I can see it played through"): an autopilot that climbs the route, fights, beats SUDS-9 and takes the relic.
  // Uses the same inputs as a player (stick, jump, double jump, slash, laser); no damage taken; if it gets stuck for 5 s it hops onto the next ledge.
  const DM = { on: false, t: 0, shotT: 0, top: -1, stuckT: 0, aim: null, jT: 0 };
  function stepDemo(dt) { if (!DM.on || St.state !== 'run' || P.ko > 0) return; DM.t += dt; DM.shotT -= dt; DM.jT -= dt; P.hp = Math.max(P.hp, 60); P.en = Math.max(P.en, 40);
    const f = curFloor(); let sx = 0; DM.aim = null;
    const foeNear = foes.filter(e => e.alive && Math.abs(e.f - f) <= (e.boss ? 1 : 0) && Math.abs(e.y + (BOX[e.type][1] + BOX[e.type][2]) / 2 - (P.y + 1.2)) < 1.8 && Math.abs(e.x - P.x) < 13).sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0];
    if (f === 6) { // ROOF
      if (relicOn && relic.visible) sx = clamp((0 - P.x) * 0.6, -1, 1);
      else if (BS.state === 'dead') sx = 0;
      else { const tx = BS.docked ? 20.9 : 18.5; sx = clamp((tx - P.x) * 0.8, -1, 1); if (Math.abs(tx - P.x) < 0.25) sx = 0;
        if (BS.state === 'swipe' && !BS.bladeHi && P.ground && BS.bladeX - P.x < 4.2 && BS.bladeX > P.x) { doJump(); DM.jT = 0.32; }
        if (DM.jT < 0 && DM.jT > -0.2 && !P.ground && !P.dbl && BS.state === 'swipe' && !BS.bladeHi) doJump();
        if (BS.docked && Math.abs(P.x - 20.9) < 0.6 && P.ground) { P.face = 1; if (P.swing <= 0) api.melee(); }
        else if (DM.shotT <= 0 && BS.state !== 'swipe' && BS.state !== 'tele') { DM.shotT = 0.22; P.face = 1; const live = foes.find(e => e.boss && e.alive); DM.aim = live && Math.abs(live.y - P.y - 1.2) < 1.2 ? (live.x > P.x ? 0 : Math.PI) : Math.atan2(BS.gy + 1.6 - (P.y + 1.25), 23.8 - P.x); shoot(); } } }
    else { if (P.ground || DM.base == null) DM.base = P.y; const fb = Math.min(5, Math.floor((DM.base + 0.5) / FH)), nx = ROUTES[fb].find(([, y]) => y > DM.base + 0.3), seg = nx && (nx[1] === (fb + 1) * FH ? holeOf(fb + 1) : FLOORS[fb].plats.find(([a, b, y]) => Math.abs((a + b) / 2 - nx[0]) < 0.01 && Math.abs(fb * FH + y - nx[1]) < 0.01));
      if (foeNear && Math.abs(foeNear.x - P.x) < 2.2) { P.face = foeNear.x > P.x ? 1 : -1; if (foeNear.type === 'guard' && Math.sign(P.x - foeNear.x) === foeNear.face && P.ground) { doJump(); DM.jT = 0.3; sx = P.face; } else if (P.swing <= 0) api.melee(); }
      else if (foeNear && DM.shotT <= 0 && foeNear.type !== 'guard') { DM.shotT = 0.25; P.face = foeNear.x > P.x ? 1 : -1; shoot(); }
      if (seg) { const a = seg[0], b = seg[1], cx = (a + b) / 2, gapX = Math.max(a - P.x, P.x - b, 0), under = gapX < 2.6, hw = Math.min(1.2, (b - a) / 2 - 0.3);
        if (P.ground) { sx = Math.sign(cx - P.x) * (gapX > 0 ? 1 : 0.4); const edge = P.on && (sx > 0 ? P.x > P.on.x1 - 0.6 : P.x < P.on.x0 + 0.6); if ((under || (edge && gapX < 5)) && (!foeNear || Math.abs(foeNear.x - P.x) > 2.2)) { doJump(); DM.jT = 0.33; } }
        else { const d = cx - P.x; sx = Math.abs(d) > hw ? Math.sign(d) : d / hw * 0.5; if (DM.jT < 0 && !P.dbl && P.vy < 1.2) doJump(); } }
      // stuck guard: no new height for 6 s = hop onto the next ledge above the best height reached
      if (P.ground && P.y > DM.top + 0.3) { DM.top = P.y; DM.stuckT = 0; } else DM.stuckT += dt;
      if (DM.stuckT > 6) { window.__pearlStuck = (window.__pearlStuck || 0) + 1; const q = ROUTES[Math.min(5, Math.floor((DM.top + 0.5) / FH))].find(([, y]) => y > DM.top + 0.3); if (q) Object.assign(P, { x: q[0], y: q[1] + 0.05, vx: 0, vy: 0 }); DM.stuckT = 0; } }
    stick.x = sx; stick.y = 0; }
  // ================= CAMERA + LOOP =================
  const cam = { x: P.x, y: 3 };
  function stepCam(dt) { const asp = W() / H(), th = Math.tan(22.5 * Math.PI / 180), port = asp < 1, bz = curFloor() === 6 && BS.state !== 'wait' ? 1.3 : 1, dist = (port ? 6.6 / (th * asp) : Math.max(7 / th, 9.5 / (th * asp))) * St.zoom * bz, halfW = dist * th * asp, halfH = dist * th;
    const roof = curFloor() === 6, bossOn = roof && BS.state !== 'wait', lead = P.face * 1.6, fx = bossOn ? Math.min(Math.max(P.x + lead, 27 - halfW), P.x + halfW - 2.5) : P.x + lead, tx = halfW >= 24 ? 0 : clamp(fx, X0 - 1.5 + halfW, (roof ? X1 + 6 : X1 + 1.5) - halfW), ty = Math.max(halfH - 1.2, P.y + 1.8 + halfH * 0.22);
    cam.x = damp(cam.x, tx, 5, dt); cam.y = damp(cam.y, ty, 5, dt); const sk = St.shake * T.shake; camera.position.set(cam.x + (Math.random() - 0.5) * sk, cam.y + 1.2 + (Math.random() - 0.5) * sk, dist); camera.lookAt(cam.x, cam.y, 0); camera.aspect = asp; camera.updateProjectionMatrix(); }
  let raf = 0, last = performance.now(), hudKey = '', emitT = 0;
  let dead = false; const sched = () => { if (dead) return; if (document.hidden) setTimeout(() => frame(performance.now()), 33); else raf = requestAnimationFrame(frame); };   // hidden tabs / previews: keep ticking
  function frame(now) { sched(); try { frame0(now); } catch (e) { if (!frame.err) { frame.err = e; window.__pearlErr = String(e && e.stack || e); console.warn('pearl frame: ' + window.__pearlErr); } } }
  function frame0(now) { let dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!St.paused) { St.t += dt; if (St.hitStop > 0) { St.hitStop -= dt; dt *= 0.1; } St.shake = Math.max(0, St.shake - dt * 1.6); St.bannerT -= dt;
      if (St.state === 'run') { St.time += dt; stepDemo(dt); stepPlayer(dt); const f = curFloor(); for (const e of foes) if (Math.abs(e.f - f) <= 1) updFoe(e, dt); if (f >= 5) updBoss(dt); }
      for (const b of bolts) { if (!b.on) continue; b.life -= dt; b.x += b.vx * dt; b.y += b.vy * dt; b.m.position.set(b.x, b.y, 0.2); let dead = b.life <= 0 || inSolid(b.x, b.y);
        if (!dead && b.mine) { for (const e of foes) { if (!e.alive) continue; const bx = fBox(e); if (b.x > bx[0] && b.x < bx[1] && b.y > bx[2] && b.y < bx[3]) { damage(e, b.dmg, b.x - b.vx, 'shot'); dead = true; break; } }
          if (!dead) for (const q of bubbles) if (q.on && Math.hypot(q.x - b.x, q.y - b.y) < 0.5) { q.on = false; scene.remove(q.m); burst(q.x, q.y, 8, 0xe8fbff, 4); dead = true; break; }
          const bb = bossBox(); if (!dead && b.x > bb[0] && b.x < bb[1] && b.y > bb[2] && b.y < bb[3] && hitBoss(b.dmg, 'shot')) dead = true; }
        if (!dead && !b.mine && overlapP(b.x - 0.15, b.x + 0.15, b.y - 0.15, b.y + 0.15)) { hurt(b.dmg, b.x - b.vx); dead = true; }
        if (dead) { b.on = false; b.m.visible = false; burst(b.x, b.y, 4, b.mine ? 0x7df9ff : 0xff3b2a, 3); } }
      for (const s of sparks) { if (!s.on) continue; s.life -= dt; s.vy -= 14 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.m.position.set(s.x, s.y, s.z); s.m.scale.setScalar(Math.max(0.1, s.life * 2.4)); if (s.life <= 0) { s.on = false; s.m.visible = false; } }
      for (const c of chunkL) { if (!c.on) continue; c.life -= dt; c.vy -= 22 * dt; c.x += c.vx * dt; c.y += c.vy * dt; const sp2 = supportAt(c.x, c.y + 0.5); if (c.y < sp2.y + 0.08) { c.y = sp2.y + 0.08; c.vy = Math.abs(c.vy) * 0.35; c.vx *= 0.6; c.r *= 0.5; } c.m.position.set(c.x, c.y, 0.3); c.m.rotation.z += c.r * dt; c.m.rotation.x += c.r * 0.5 * dt; if (c.life <= 0) { c.on = false; c.m.visible = false; } }
      for (const p of pops) { if (!p.on) continue; p.life -= dt; const k = 1 - p.life / 0.25; p.sp.scale.setScalar(p.s * (0.6 + k)); p.sp.material.opacity = Math.max(0, 1 - k); if (p.life <= 0) { p.on = false; p.sp.visible = false; } }
      ARC.t -= dt; arcMat.opacity = Math.max(0, ARC.t / 0.16) * 0.85; arc.visible = ARC.t > 0; JR.t -= dt; ringMat.opacity = Math.max(0, JR.t / 0.3); jring.scale.setScalar(1 + (0.3 - Math.max(0, JR.t)) * 7); jring.visible = JR.t > 0;
      tintC.lerp(TINT[curFloor()], Math.min(1, dt * 2)); hemiL.color.copy(tintC);
      for (const w of words) { if (!w.on) continue; w.life -= dt; w.y += dt * 1.4; w.sp.position.set(w.x, w.y, 1); w.sp.material.opacity = Math.min(1, w.life * 3); if (w.life <= 0) { w.on = false; w.sp.visible = false; } }
      eyeMat.color.setRGB(0.8 + Math.random() * 0.2, 0.1 + (Math.random() < 0.08 ? 0.6 : 0), 0.05); alarmMat.color.setRGB(0.5 + 0.5 * Math.max(0, Math.sin(St.t * 5)), 0.08, 0.05); ledMat.color.setScalar(0.6 + 0.4 * (Math.sin(St.t * 13) > 0 ? 1 : 0));
      relic.rotation.y += dt * 1.2; relic.position.y = ROOF + 1.4 + Math.sin(St.t * 2) * 0.15;
      poseFox(dt); stepHint(); }
    stepCam(dt); renderer.render(scene, camera); emitT -= dt; if (emitT <= 0) { emitT = 0.1; emit(); } }
  function emit() { const f = curFloor(), left = foes.filter(e => e.alive && e.f === f && !e.boss).length, sv = save.data, nearExit = f === 0 && P.x < -17.5 && St.state === 'run';
    const hud = { hp: Math.round(P.hp), hpMax: 100, en: Math.round(P.en), gold: sv.gold, hour: 12, day: 1, items: Object.entries(sv.items || {}).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n })), place: 'Pearl Sail · ' + (f === 6 ? 'Roof' : 'Floor ' + (f + 1)),
      quest: { text: f === 6 ? (BS.state === 'dead' ? 'Take the Pearl of the Sail' : 'Beat SUDS-9 on the roof') : 'Climb to the roof · ' + FLOORS[f].name.toLowerCase() + ' · ' + left + ' bots here' }, prompt: nearExit ? { key: 'E', text: 'Leave the Pearl Sail' } : null, toast: St.toast, dialog: null, weather: 'Clear', muted: true, inCave: true, weapons: [],
      floor: f, floorName: f === 6 ? 'ROOF' : FLOORS[f].name, left, banner: St.bannerT > 0 ? St.banner : '', state: St.state, ko: P.ko > 0,
      boss: f === 6 && BS.state !== 'wait' && BS.state !== 'dead' ? { name: 'SUDS-9 · WINDOW CLEANER', pct: Math.round(BS.hp / BS.max * 100), docked: BS.docked } : null, won: St.won, time: Math.round(St.time), kills: St.kills, demo: DM.on };
    const k = JSON.stringify(hud); if (k !== hudKey) { hudKey = k; onState(hud); } }
  // ================= INPUT =================
  const onKD = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.repeat) { keys.add(e.code); return; } keys.add(e.code);
    if (St.state !== 'run' || St.paused) return; if (e.code === 'Space') { e.preventDefault(); api.jump(); } else if (e.code === 'Digit1' || e.code === 'KeyJ') api.melee(); else if (e.code === 'Digit2' || e.code === 'KeyK') api.range(); else if (e.code === 'KeyE') api.talk(); };
  const onKU = e => keys.delete(e.code);
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); const onBlur = () => keys.clear(); addEventListener('blur', onBlur);
  const ro = new ResizeObserver(() => { renderer.setSize(W(), H()); }); ro.observe(container);
  sched();
  Object.assign(api, {
    demo(on = true) { DM.on = !!on; if (on && St.state === 'ready') { St.state = 'run'; St.banner = 'DEMO · WATCH THE CLIMB'; St.bannerT = 2.2; } if (!on) { stick.x = 0; stick.y = 0; } },
    start(tut) { if (St.state !== 'ready') return; St.state = 'run'; if (!tut) { St.banner = 'FLOOR 1 · LOBBY'; St.bannerT = 1.8; return; }
      const tips = ['JUMP · TAP AGAIN IN THE AIR = DOUBLE JUMP', '1 · SLASH ON THE BEAT = PERFECT', '2 · LASER · HOLD UP TO AIM UP', 'DOWN + JUMP DROPS THROUGH A LEDGE', 'SHIELDS BLOCK THE FRONT · HIT GUARDS FROM BEHIND', 'CLIMB TO THE ROOF']; tips.forEach((t, i) => setTimeout(() => { St.banner = t; St.bannerT = 2.6; }, i * 2800)); },
    melee() { if (St.state !== 'run' || P.ko > 0) return; if (P.swing > 0) { if (P.swingDur - P.swing > P.swingDur * 0.45) P.queued = true; return; } startSwing(); }, meleeUp() {},
    range() { if (St.state !== 'run' || P.ko > 0) return; shoot(); }, rangeUp() {}, jump() { doJump(); }, jumpUp() { if (P.vy > 3 && !P.dbl) P.vy *= 0.6; },
    talk() { if (St.state === 'run' && curFloor() === 0 && P.x < -17.5) onExit(); },
    choose() {}, closeDialog() {}, nextLine() {}, clearToast() { St.toast = null; }, closeWheel() {}, skipTime() {},
    useItem(id) { const heal = { erToGo: 20, healingCharges: 20, splint: 60, chocolates: 10, amber: 15, repairKit: 30 }[id]; if (heal != null) { if (P.hp >= 100) { say3('HP FULL', P.x, P.y + 2.4, '#7cff9b'); return; } if (!save.take(id)) return; P.hp = Math.min(100, P.hp + heal); say3('+' + heal, P.x, P.y + 2.4, '#7cff9b'); return; } if (id === 'energyPod') { if (!save.take(id)) return; P.en = 100; say3('ENERGY FULL', P.x, P.y + 2.4, '#7df9ff'); } },
    setPaused(p) { St.paused = !!p; }, setHudPad() {}, setStick(x, y) { stick.x = x || 0; stick.y = y || 0; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, lookRelease() {}, zoomBy(f) { St.zoom = clamp(St.zoom * f, 0.7, 1.5); },
    getCam() { return { dist: 13, pitch: 0.38 }; }, setCam() {}, mapData() { return { p: [P.x, -P.y, 0], indoor: true, b: [], f: [], e: [], q: null }; }, setMinimap() {}, toggleSound() {}, cycleWeather() {},
    restart() { location.reload(); }, stats: () => ({ foes: foes.length, alive: foes.filter(e => e.alive).length }),
    _dbg: { P, BS, foes, scene, ART, camera, tp(x, y) { Object.assign(P, { x, y, vx: 0, vy: 0 }); maxFloor = Math.max(maxFloor, curFloor()); }, St },
    destroy() { dead = true; cancelAnimationFrame(raf); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); ro.disconnect(); renderer.dispose(); renderer.domElement.remove(); },
  });
  emit(); return api;
}
