// Blind Canvas gallery: the Academy of Music for the Blind, polish pass (28 Oct, Ben's picks).
//  · A CONCERT-HALL FRONT: both AMB rooms now stand 0.36 m up (floor AMB_FLOOR), so the door is reached by three wide stone
//    steps (ink nosings for low vision) AND, either side, a step-free RAMP (1:12) along the front with red handrails, a level
//    landing at the top and a big RAMP sign at each foot. Six white half-columns, an ink cornice with a red line, four tall windows.
//  · WARM LIGHT: the windows glow at night and throw sun patches + dust motes on the floor inside by day; warm wall lamps by the
//    door and light pools on the steps after dark; soft warm pools on the floors inside.
//  · THE STAGE: a lighting truss with four cans, beams onto the piano, the drums, the guitar and the middle, light pools on the
//    boards and a row of footlights.
// No real lights: additive planes faded by sky() ('day' | 'golden' | 'night').
import * as THREE from '../vendor/three/three.module.js';
import { lean } from './gallery-texmem.js';

const FONT = 'Archivo, Arimo, Helvetica, Arial, sans-serif';
export const AMB_FLOOR = 0.42;   // both AMB rooms' floor (was 0.06)

export function buildAmbPolish({ root, col, tickers, inside, sky, CAMPUS, lowEnd = false }) {
  const A = CAMPUS.amb, FL = AMB_FLOOR, FZ = A.z1, CX = (A.x0 + A.x1) / 2;
  const DX0 = CX - 3.85, DX1 = CX + 3.85;   // the doorway (doorW 7.7)
  const tex = (w, h, draw, rep) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } return lean(t); };
  const box = (w, h, d, m, x, y, z, solid = true, parent = root) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); parent.add(b); if (solid) col.push(b); return b; };
  const hidden = (w, h, d, x, y, z) => { const b = box(w, h, d, null, x, y, z); b.visible = false; return b; };
  const flat = (w, d, m, x, y, z, parent = root) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, d), m); p.rotation.x = -Math.PI / 2; p.position.set(x, y, z); parent.add(p); return p; };
  const ink = new THREE.MeshLambertMaterial({ color: 0x1d1c1b }), red = new THREE.MeshBasicMaterial({ color: 0xec3013 });
  const stone = new THREE.MeshLambertMaterial({ map: tex(128, 128, (c, w, h) => { c.fillStyle = '#ddd7cc'; c.fillRect(0, 0, w, h); for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${Math.random() < 0.5 ? '255,255,255' : '90,80,70'},${0.05 + Math.random() * 0.06})`; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); } c.fillStyle = 'rgba(90,80,70,.18)'; c.fillRect(0, 0, w, 2); c.fillRect(0, 0, 2, h); }, [4, 1]) });
  const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  const radT = tex(64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,214,150,1)'); g.addColorStop(0.5, 'rgba(255,190,110,0.35)'); g.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const softT = tex(64, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.2, 'rgba(255,255,255,1)'); g.addColorStop(0.8, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'destination-in'; const v = c.createLinearGradient(0, 0, 0, h); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(0.15, 'rgba(0,0,0,1)'); v.addColorStop(0.85, 'rgba(0,0,0,1)'); v.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = v; c.fillRect(0, 0, w, h); });
  const mode = () => { try { return sky ? sky() : 'golden'; } catch (e) { return 'golden'; } };

  // ================================================================ the front: landing, steps, ramps, rails
  const LZ0 = -23.3, LZ1 = -21.8, RL = 5.0, PAT = 1.0;   // ramp lane (z), ramp length, the level patch at the top of each ramp
  box(DX1 - DX0 + 2 * PAT, FL, 1.0, stone, CX, FL / 2, -23.5);   // landing: x 35.15..44.85, z -24..-23 (covers the doorway)
  for (const s of [-1, 1]) box(PAT, FL, 1.2, stone, CX + s * (3.85 + PAT / 2), FL / 2, -22.4);   // the patches beside the steps (z -23..-21.8)
  box(DX1 - DX0, 0.28, 0.6, stone, CX, 0.14, -22.7); box(DX1 - DX0, 0.14, 0.6, stone, CX, 0.07, -22.1);   // two steps (+ the landing = three risers)
  for (const [y, z] of [[0.14, -21.835], [0.28, -22.435], [FL, -23.035]]) box(DX1 - DX0, 0.012, 0.07, ink, CX, y + 0.006, z, false);   // nosings: an ink edge on every step
  // the ramps: a wedge each, rising towards the door; the west one runs east, the east one runs west
  const wedge = (hiAtEnd) => { const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(RL, 0); s.lineTo(hiAtEnd ? RL : 0, FL); s.closePath(); return new THREE.ExtrudeGeometry(s, { depth: LZ1 - LZ0, bevelEnabled: false }); };
  const rampW = new THREE.Mesh(wedge(true), stone); rampW.position.set(DX0 - PAT - RL, 0, LZ0); root.add(rampW); col.push(rampW);
  const rampE = new THREE.Mesh(wedge(false), stone); rampE.position.set(DX1 + PAT, 0, LZ0); root.add(rampE); col.push(rampE);
  const rampH = x => { const w0 = DX0 - PAT - RL, e1 = DX1 + PAT + RL; if (x < CX) return Math.max(0, Math.min(1, (x - w0) / RL)) * FL; return Math.max(0, Math.min(1, (e1 - x) / RL)) * FL; };
  // a red tactile strip across the foot and the top of each ramp
  const tactT = tex(64, 64, (c, w, h) => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,.28)'; for (let y = 8; y < h; y += 16) for (let x = 8; x < w; x += 16) { c.beginPath(); c.arc(x, y, 4, 0, 6.3); c.fill(); } }, [1, 4]);
  const tactM = new THREE.MeshLambertMaterial({ map: tactT }); tactM.polygonOffset = true; tactM.polygonOffsetFactor = -2;
  for (const s of [-1, 1]) { const foot = s < 0 ? DX0 - PAT - RL : DX1 + PAT + RL; flat(0.4, LZ1 - LZ0, tactM, foot + s * 0.2, 0.012, (LZ0 + LZ1) / 2); flat(0.4, LZ1 - LZ0, tactM, (s < 0 ? DX0 - PAT : DX1 + PAT) - s * 0.2, FL + 0.004, (LZ0 + LZ1) / 2); }
  // handrails: ink posts, a red top rail (high contrast), along the open side of each ramp and its patch, and between patch and steps
  const RH = 0.95, RZ = LZ1 - 0.06;
  for (const s of [-1, 1]) {
    const xa = s < 0 ? DX0 - PAT - RL + 0.25 : DX1 + PAT + RL - 0.25, xTop = s < 0 ? DX0 - PAT : DX1 + PAT, xEnd = s < 0 ? DX0 - 0.05 : DX1 + 0.05;
    for (let i = 0; i <= 5; i++) { const x = xa + (xEnd - xa) * i / 5, h = (x - xTop) * -s > 0 ? FL : rampH(x); box(0.06, RH, 0.06, ink, x, h + RH / 2, RZ, false); }
    const y0 = rampH(xa) + RH, y1 = FL + RH, len = Math.hypot(xTop - xa, y1 - y0);
    const sl = box(len + 0.06, 0.07, 0.07, red, (xa + xTop) / 2, (y0 + y1) / 2, RZ, false); sl.rotation.z = Math.atan2(y1 - y0, xTop - xa);
    box(Math.abs(xEnd - xTop) + 0.07, 0.07, 0.07, red, (xTop + xEnd) / 2, y1, RZ, false);
    box(0.32, 0.07, 0.07, red, xa + s * 0.16, y0 - 0.02, RZ, false);   // runs on past the foot (a rail you can find)
    // (28 Oct, Ben: the ramp was blocked at the top) the rail + blocker across the top patch, between it and the steps, are gone: the
    // patch opens straight onto the steps' top and the landing, so the ramp leads to the door
    hidden(Math.abs(xEnd - xa) + 0.3, 1.9, 0.12, (xa + xEnd) / 2, 0.95, RZ);   // (what stops you: the outer rail is solid)
  }

  // ================================================================ the concert-hall face: half-columns, cornice, windows, lamps
  const fluteT = tex(64, 8, (c, w, h) => { c.fillStyle = '#f4f2ee'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(60,50,40,.16)'; for (let i = 0; i < 8; i++) c.fillRect(i * 8, 0, 2, h); });
  const colM = new THREE.MeshLambertMaterial({ map: fluteT });
  const COLS = [31.3, 33.0, 34.7, 45.3, 47.0, 48.7], C0 = 0.45, C1 = 6.3;
  for (const s of [-1, 1]) box(4.55, 0.45, 0.3, ink, s < 0 ? A.x0 + 2.275 : A.x1 - 2.275, 0.225, FZ + 0.15, false);   // the ink plinth under the front wall
  for (const x of COLS) {
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.29, C1 - C0, 16, 1, true, -Math.PI / 2, Math.PI), colM); shaft.position.set(x, (C0 + C1) / 2, FZ); root.add(shaft);
    box(0.66, 0.18, 0.34, ink, x, C0 + 0.09, FZ + 0.17, false); box(0.72, 0.26, 0.4, ink, x, C1 + 0.13, FZ + 0.2, false);
  }
  const W = A.x1 - A.x0 + 0.4;
  box(W, 0.4, 0.6, ink, CX, 6.76, FZ + 0.3, false); box(W, 0.06, 0.62, red, CX, 6.53, FZ + 0.31, false);   // the cornice and its red line
  // windows: tall and narrow between the columns; dark glass by day, warm at night (seen from inside: daylight, or night blue)
  // (28 Oct, Ben: SEE THROUGH, like the WHY House) real holes in the front wall (gallery.json rooms amb frontWins, cut by buildWing):
  // clear glass with a faint tint (warm after dark), an ink frame through the wall's depth, the mullions on the outside
  const glassOut = new THREE.MeshBasicMaterial({ color: 0xd6e8ee, transparent: true, opacity: 0.12, depthWrite: false, side: THREE.DoubleSide });
  const WX = [32.15, 33.85, 46.15, 47.85], WY0 = 1.5, WY1 = 5.0, WW = 0.9, WH = WY1 - WY0, WC = (WY0 + WY1) / 2, WD = 0.46, WZ = FZ - 0.2;
  for (const x of WX) {
    box(WW + 0.2, 0.1, WD, ink, x, WY0, WZ, false); box(WW + 0.2, 0.1, WD, ink, x, WY1, WZ, false);
    for (const s of [-1, 1]) box(0.1, WH, WD, ink, x + s * WW / 2, WC, WZ, false);
    const go = new THREE.Mesh(new THREE.PlaneGeometry(WW, WH), glassOut); go.position.set(x, WC, FZ - 0.2); go.renderOrder = 2; go.userData.noCull = true; root.add(go);
    for (const y of [WY0 + WH / 3, WY0 + WH * 2 / 3]) box(WW, 0.05, 0.04, ink, x, y, FZ + 0.03, false); box(0.05, WH, 0.04, ink, x, WC, FZ + 0.03, false);
  }
  // inside, by day: a sun patch on the floor under each window, and dust motes turning in the light
  const sunM = new THREE.MeshBasicMaterial({ map: softT, color: 0xffd9a0, opacity: 0.25, ...ADD });
  for (const x of WX) { const p = flat(WW * 1.1, 2.4, sunM, x + 0.35, FL + 0.014, FZ - 1.75); p.rotation.z = 0.12; }
  const motes = (() => {
    const N = lowEnd ? 60 : 140, pos = new Float32Array(N * 3), seed = [];
    for (let i = 0; i < N; i++) { const w = WX[i % 4]; seed.push([w + (Math.random() - 0.5) * 0.8, FL + 0.3 + Math.random() * 4.2, FZ - 0.5 - Math.random() * 2.4, Math.random() * 6.3]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({ color: 0xffe6b8, size: 0.035, opacity: 0.7, ...ADD });
    const pts = new THREE.Points(geo, m); pts.frustumCulled = false; pts.userData.dyn = true; root.add(pts); inside.push([pts, 'amb']);
    return { pts, m, tick(t) { for (let i = 0; i < N; i++) { const s = seed[i]; pos[i * 3] = s[0] + Math.sin(t * 0.13 + s[3]) * 0.25; pos[i * 3 + 1] = s[1] + Math.sin(t * 0.09 + s[3] * 2) * 0.35; pos[i * 3 + 2] = s[2] + Math.cos(t * 0.11 + s[3]) * 0.3; } geo.attributes.position.needsUpdate = true; } };
  })();
  // warm wall lamps either side of the door, halos, and light pools on the landing and the steps at night
  const lampG = [], n0 = root.children.length;
  const bulbM = new THREE.MeshBasicMaterial({ color: 0xffd28a }), haloM = new THREE.MeshBasicMaterial({ map: radT, opacity: 0.5, ...ADD }), poolM = new THREE.MeshBasicMaterial({ map: radT, opacity: 0.4, ...ADD });
  for (const s of [-1, 1]) { const x = CX + s * 4.45; box(0.18, 0.5, 0.16, ink, x, FL + 2.7, FZ + 0.08, false); box(0.12, 0.3, 0.04, bulbM, x, FL + 2.7, FZ + 0.17, false);
    const h = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.5), haloM); h.position.set(x, FL + 2.7, FZ + 0.2); root.add(h); }
  flat(10, 1.4, poolM, CX, FL + 0.008, -23.4); flat(9, 2.4, poolM, CX, 0.012, -20.9);
  lampG.push(...root.children.slice(n0));   // (the lamps, halos and pools: always drawn)
  // inside: soft warm pools down the main room and in the stage room
  const roomPoolM = new THREE.MeshBasicMaterial({ map: radT, opacity: 0.12, ...ADD });
  for (const z of [-31, -40, -49]) flat(9, 7, roomPoolM, CX, FL + 0.012, z);
  for (const z of [-35.5, -44.5]) flat(8, 6, roomPoolM, 58.5, FL + 0.012, z);
  // the RAMP signs, at the foot of each ramp (eye level, big type)
  const rampT = tex(640, 400, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 20, w, 20); c.fillStyle = '#fff'; c.font = `800 150px ${FONT}`; c.fillText('RAMP', 34, 170);
    c.fillStyle = '#ffd27a'; c.font = `800 52px ${FONT}`; c.fillText('Step-free way in', 38, 262); c.fillStyle = '#ff9783'; c.font = `700 40px ${FONT}`; c.fillText('Handrails both ways', 38, 330); });
  const arrowT = (dir) => tex(256, 400, (c, w, h) => { c.fillStyle = '#1d1c1b'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, h - 20, w, 20); c.save(); c.translate(w / 2, 190); c.scale(dir, 1); c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-90, -34); c.lineTo(20, -34); c.lineTo(20, -90); c.lineTo(100, 0); c.lineTo(20, 90); c.lineTo(20, 34); c.lineTo(-90, 34); c.closePath(); c.fill(); c.restore(); });
  for (const s of [-1, 1]) {
    const g = new THREE.Group(), x = s < 0 ? A.x0 - 1.6 : A.x1 + 1.6; g.position.set(x, 0, -23.6); g.rotation.y = s * -0.35; root.add(g);
    box(0.1, 1.35, 0.1, ink, 0, 0.675, 0, false, g); box(1.98, 0.88, 0.12, ink, 0, 1.75, 0, false, g);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(1.28, 0.8), new THREE.MeshBasicMaterial({ map: rampT })); f.position.set(s * 0.27, 1.75, 0.065); g.add(f);   // (the arrow on the side towards the ramp)
    const a = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.8), new THREE.MeshBasicMaterial({ map: arrowT(-s) })); a.position.set(-s * 0.65, 1.75, 0.065); g.add(a);
    hidden(0.3, 1.4, 0.3, x, 0.7, -23.6);
  }

  // ================================================================ the stage: lighting truss, beams, pools, footlights
  const ST = { x0: 63.9, z0: -47.5, z1: -32.5, top: FL + 0.45 };
  const stg = new THREE.Group(); root.add(stg); inside.push([stg, 'amb']);
  const TY = FL + 5.5, TX = 62.6;
  { const t = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 15.2), ink); t.position.set(TX, TY, (ST.z0 + ST.z1) / 2); stg.add(t);
    for (const z of [ST.z0 + 0.6, ST.z1 - 0.6]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.04, FL + 6.4 - TY, 0.04), ink); r.position.set(TX, (TY + FL + 6.4) / 2, z); stg.add(r); } }
  const TARGETS = [[66.1, -44.2], [65.3, -40.4], [64.9, -36.2], [66.8, -38.3]];
  const beamT = tex(16, 128, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(255,225,170,0.9)'); g.addColorStop(1, 'rgba(255,200,130,0)'); c.fillStyle = g; c.fillRect(0, 0, w, h); });
  const beamM = new THREE.MeshBasicMaterial({ map: beamT, opacity: 0.16, side: THREE.DoubleSide, ...ADD });
  const stPoolM = new THREE.MeshBasicMaterial({ map: radT, opacity: 0.55, ...ADD });
  const canM = new THREE.MeshLambertMaterial({ color: 0x151515 }), lensM = new THREE.MeshBasicMaterial({ color: 0xffe2a8 });
  const beams = [], pools = [];
  for (const [tx, tz] of TARGETS) {
    const from = new THREE.Vector3(TX + 0.2, TY - 0.28, tz + (tz - (ST.z0 + ST.z1) / 2) * 0.05), to = new THREE.Vector3(tx, ST.top, tz), L = from.distanceTo(to);
    const can = new THREE.Group(); can.position.copy(from); can.lookAt(to); stg.add(can);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.36, 12).rotateX(Math.PI / 2), canM); can.add(body);
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.11, 12), lensM); lens.position.z = 0.181; can.add(lens);
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.03), ink); yoke.position.set(from.x, from.y + 0.15, from.z); stg.add(yoke);
    // the beam: an open cone from the lens to the stage, its gradient fading towards the floor
    const g = new THREE.CylinderGeometry(0.1, 0.95, L, 18, 1, true); g.translate(0, -L / 2, 0); g.rotateX(-Math.PI / 2);   // (tip at the origin, opening along +z)
    const beam = new THREE.Mesh(g, beamM); beam.position.copy(from); beam.lookAt(to); beam.renderOrder = 6; stg.add(beam); beams.push(beam);
    const p = new THREE.Mesh(new THREE.CircleGeometry(1.0, 24), stPoolM); p.rotation.x = -Math.PI / 2; p.position.set(tx, ST.top + 0.012, tz); stg.add(p); pools.push(p);
  }
  // footlights: a row of warm bulbs along the stage's front face
  { const n = 20, im = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.08, 0.16), bulbM, n), m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { m4.makeTranslation(ST.x0 - 0.02, ST.top - 0.12, ST.z0 + 0.5 + i * (ST.z1 - ST.z0 - 1) / (n - 1)); im.setMatrixAt(i, m4); }
    stg.add(im); const glow = new THREE.Mesh(new THREE.PlaneGeometry(ST.z1 - ST.z0 - 0.6, 0.5), new THREE.MeshBasicMaterial({ map: softT, color: 0xffc27a, opacity: 0.35, ...ADD })); glow.rotation.y = -Math.PI / 2; glow.position.set(ST.x0 - 0.04, ST.top - 0.1, (ST.z0 + ST.z1) / 2); stg.add(glow); }
  // (28 Oct, Ben: they popped in and out as you walked) the stage lights are never skipped: not by the far-small-things cull,
  // not by the behind-a-wall tiles, not by the camera's view box (the beams' lit cones reach past their own bounds)
  stg.traverse(o => { o.userData.dyn = true; o.userData.noCull = true; o.frustumCulled = false; });

  // ================================================================ day / night, and the slow life of the lights
  let k = { night: 0.2, day: 0.7 }, acc = 1;
  tickers.push((dt) => {
    acc += dt; const t = performance.now() / 1000;
    if (acc > 0.25) { acc = 0; const m = mode(); const n = m === 'night' ? 1 : m === 'golden' ? 0.22 : 0, d = m === 'day' ? 1 : m === 'golden' ? 0.75 : 0;
      k.night += (n - k.night) * 0.25; k.day += (d - k.day) * 0.25;
      glassOut.color.setRGB(0.84 + 0.16 * k.night, 0.91 - 0.1 * k.night, 0.93 - 0.4 * k.night); glassOut.opacity = 0.12 + 0.1 * k.night;   // clear -> a warm glint at night
      sunM.opacity = 0.28 * k.day; motes.m.opacity = 0.75 * k.day; haloM.opacity = 0.12 + 0.6 * k.night; poolM.opacity = 0.05 + 0.4 * k.night; roomPoolM.opacity = 0.08 + 0.14 * k.night; }
    if (motes.pts.visible && k.day > 0.05) motes.tick(t);
    if (stg.visible) { const b = 0.2 + Math.sin(t * 0.7) * 0.025; beamM.opacity = b; stPoolM.opacity = 0.7 + Math.sin(t * 0.7) * 0.06; }
  });
  for (const o of [...lampG]) o.traverse(m => { m.userData.noCull = true; });
  return { floor: FL };
}
