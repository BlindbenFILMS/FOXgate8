// 8 GATES — MERU · TANK RANGE [meruTankRange]. A stand-alone minigame built on the shared driving engine (vehicle-lab.js, opts.course).
// Course: hangar start + blackboard + SGT. TREAD → 1 DRIVE (cones) → 2 PIVOT → 3 JUMP → 4 BREAK THROUGH (brick walls) → 5 TARGETS → 6 THE PIT (4 robot waves, Wardens last) → 7 TANK DUEL vs SGT. TREAD.
// v2 (session 31): range x2 (Q(x,z) = [2x, 2z+100] from the hangar end; hangar + boards stay put), guidance (next arrow, guide line, lit lamps, arches, wrong way, radio, dust storm), limited rockets + turbo cans, bonuses, duel.
// Robots are the Gate Guard family (creature-kit: Sink Sentry / Sink Charger / Sink Warden), the Machine Fleet's advance troops.
import { save } from '../../engine/save.js';
import { creatureKit } from '../../engine/creature-kit.js';
import { creatureFx } from '../../engine/creature-fx.js';
import { bakeCreature } from '../../engine/bake.js';
import { buildHangar, HZ0, HZ1 } from './range-hangar.js';

export const TANK_RANGE = { name: 'TANK RANGE', room: 'meruTankRange', bestKey: 'meru.tankRange.best.v1' };

export function tankRange(X) {
  const { THREE, scene, M, toon, rr, clamp, damp } = X;
  const ck = creatureKit({ THREE, toon, M }), fx = creatureFx(THREE), tmp = new THREE.Vector3(), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const R = { t: 0, score: 0, tokens: 0, totalTokens: 0, kills: 0, totalBots: 33, targets: 0, totalTargets: 0, deaths: 0, hp: 100, hurt: 0, banner: '', bannerT: 0, wave: 0, next: 0, state: 'ready', board: true, armed: false, done: null, down: 0, seen: new Set(), cp: null, rk: 4, turbo: 2, coneHits: 0, pivA: 0, clean: false, pivot: false, duelT: 0 };
  const ink = toon('#201e1d'), red = toon('#ec3013'), white = toon('#f3f2f2'), steel = toon('#5b5f66'), conc = toon('#b9b4ab'), gold = toon('#e6b45a');
  const SPR = (mat, p, s) => { const sp = new THREE.Sprite(mat); if (p) sp.position.copy(p); if (s) sp.scale.copy(s); return sp; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const banner = (s, t = 3.5) => { R.banner = s; R.bannerT = t; };
  const S = () => X.V.spec, C = () => X.C;
  const Q = (x, z) => [x * 2, z * 2 + 100], Qi = p => ({ x: p.x / 2, z: (p.z - 100) / 2 }), touch = X.touch, RK_MAX = 8, TB_MAX = 4;
  X.camera.far = 1100; X.camera.updateProjectionMatrix();

  // ---------- sky, ground, road ----------
  scene.background = new THREE.Color('#d9d4c7'); scene.fog = new THREE.Fog(0xd9d4c7, 180, 560); const FOG0 = new THREE.Color('#d9d4c7'), DUST = new THREE.Color('#b8956a');
  const dirt = CT(512, 512, (g, w, h) => { g.fillStyle = '#9a774d'; g.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(70,50,28,0.25)' : 'rgba(255,236,200,0.10)'; g.fillRect(Math.random() * w, Math.random() * h, 2 + Math.random() * 4, 2 + Math.random() * 3); } g.strokeStyle = 'rgba(90,70,40,0.25)'; g.lineWidth = 2; for (let i = 0; i < 14; i++) { let x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += rr(-30, 30); y += rr(-30, 30); g.lineTo(x, y); } g.stroke(); } });
  dirt.wrapS = dirt.wrapT = THREE.RepeatWrapping; dirt.repeat.set(40, 40);
  { const gr = new THREE.Mesh(new THREE.PlaneGeometry(X.SIZE + 120, X.SIZE + 120), new THREE.MeshToonMaterial({ map: dirt, gradientMap: X.grad })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; scene.add(gr); }
  const roadT = CT(256, 1024, (g, w, h) => { g.fillStyle = '#e4dfd4'; g.fillRect(0, 0, w, h); for (let i = 0; i < 1400; i++) { g.fillStyle = 'rgba(60,56,50,0.10)'; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } g.fillStyle = 'rgba(60,56,50,0.12)'; for (const x of [52, 76, 180, 204]) g.fillRect(x, 0, 14, h); g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h); for (let y = 0; y < h; y += 128) g.fillRect(w / 2 - 3, y, 6, 64); });
  roadT.wrapT = THREE.RepeatWrapping; roadT.repeat.set(1, 6);
  { const rd = new THREE.Mesh(new THREE.PlaneGeometry(56, 364), new THREE.MeshToonMaterial({ map: roadT, gradientMap: X.grad })); rd.rotation.x = -Math.PI / 2; rd.position.set(0, 0.012, 82); rd.receiveShadow = true; scene.add(rd);
    // red/white kerbs along both road edges
    const kT = CT(128, 32, (g, w, h) => { for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#f3f2f2' : '#ec3013'; g.fillRect(i * 32, 0, 32, h); } }); kT.wrapS = THREE.RepeatWrapping; kT.repeat.set(90, 1);
    for (const sx of [-1, 1]) { const kb = new THREE.Mesh(new THREE.BoxGeometry(364, 0.22, 1.2), new THREE.MeshToonMaterial({ map: kT, gradientMap: X.grad })); kb.rotation.y = Math.PI / 2; kb.position.set(sx * 28.8, 0.11, 82); scene.add(kb); } }
  const PC = { x: 0, z: 348, r: 88 }, PK = 1.35, P2 = (x, z) => Q(x * PK, 124 + (z - 74) * PK), DA = { x: 0, z: 540, r: 52 };
  { const pf = new THREE.Mesh(new THREE.CircleGeometry(PC.r + 1, 96), new THREE.MeshToonMaterial({ color: '#dcd7cc', gradientMap: X.grad })); pf.rotation.x = -Math.PI / 2; pf.position.set(PC.x, 0.014, PC.z); pf.receiveShadow = true; scene.add(pf);
    for (const r0 of [28, 56]) { const rg = new THREE.Mesh(new THREE.RingGeometry(r0 - 0.3, r0 + 0.3, 96), new THREE.MeshBasicMaterial({ color: 0x9a958c })); rg.rotation.x = -Math.PI / 2; rg.position.set(PC.x, 0.02, PC.z); scene.add(rg); } }
  // distant mesas + berm at the edge of the range
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + rr(-0.1, 0.1), d = rr(440, 500), h = rr(30, 60), m = M(new THREE.CylinderGeometry(rr(16, 28), rr(28, 44), h, 7), toon(i % 3 ? '#c49a6c' : '#b07a52'), Math.cos(a) * d, h / 2, 250 + Math.sin(a) * d, null, 0); m.castShadow = false; }
  const L = X.LIM + 1; for (const [x, z, w, d] of [[0, -L, 2 * L, 3], [0, L, 2 * L, 3], [-L, 0, 3, 2 * L], [L, 0, 3, 2 * L]]) { const b = M(new THREE.BoxGeometry(w, 2.2, d), toon('#b8a479'), x, 0.6, z, null, 0); b.castShadow = false; }

  // ---------- props helpers ----------
  const FEN = { x: 136, z0: -100, z1: 610 };
  // the barrier fence keeps everything in (a clamp, not hundreds of solid props)
  function fence(o, r) { if (o.z < FEN.z0 - 6) return false; let hit = false; const lx = FEN.x - 0.6 - r, lz = FEN.z1 - 0.6 - r; if (o.x > lx) { o.x = lx; hit = true; } else if (o.x < -lx) { o.x = -lx; hit = true; } if (o.z > lz) { o.z = lz; hit = true; } if (Math.abs(o.x) > 16.5 + r * 0.5 && o.z < FEN.z0 + 0.6 + r) { o.z = FEN.z0 + 0.6 + r; hit = true; } return hit; }
  function solid(x, z, r, h = 3) { const o = { kind: 'block', solid: true, noAim: true, noRespawn: true, g: new THREE.Group(), x, z, r: r / 0.6, h, hp: 1e9, home: [x, z] }; X.props.push(o); return o; }
  const solids = () => X.props.filter(o => o.solid);
  function custom(kind, g, x, z, r, h, hp, extra = {}) { g.position.set(x, 0, z); scene.add(g); const o = Object.assign({ kind, custom: true, noRespawn: true, g, sq: g, x, z, r, h, hp, max: hp, home: [x, z] }, extra); X.props.push(o); return o; }

  { const bT = CT(256, 64, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); for (let i = -1; i < 9; i++) { g.fillStyle = '#ec3013'; g.beginPath(); g.moveTo(i * 32, h); g.lineTo(i * 32 + 16, h); g.lineTo(i * 32 + 40, 0); g.lineTo(i * 32 + 24, 0); g.fill(); } g.fillStyle = '#201e1d'; g.fillRect(0, h - 8, w, 8); });
    const segs = [], add = (x0, z0, x1, z1) => { const L2 = Math.hypot(x1 - x0, z1 - z0), n = Math.round(L2 / 3.2); for (let i = 0; i < n; i++) { const u = (i + 0.5) / n; segs.push([x0 + (x1 - x0) * u, z0 + (z1 - z0) * u, Math.atan2(x1 - x0, z1 - z0)]); } };
    add(-FEN.x, FEN.z0, -FEN.x, FEN.z1); add(FEN.x, FEN.z0, FEN.x, FEN.z1); add(-FEN.x, FEN.z1, FEN.x, FEN.z1); add(-FEN.x, FEN.z0, -16.5, FEN.z0); add(16.5, FEN.z0, FEN.x, FEN.z0);
    const geo = new THREE.BoxGeometry(0.9, 1.6, 3.2), im = new THREE.InstancedMesh(geo, new THREE.MeshToonMaterial({ map: bT, gradientMap: X.grad }), segs.length), om = new THREE.InstancedMesh(geo, X.outlineMat, segs.length), o3 = new THREE.Object3D();
    segs.forEach(([x, z, a], i) => { o3.position.set(x, 0.8, z); o3.rotation.set(0, a, 0); o3.scale.set(1, 1, 0.98); o3.updateMatrix(); im.setMatrixAt(i, o3.matrix); o3.scale.set(1.08, 1.05, 1.0); o3.updateMatrix(); om.setMatrixAt(i, o3.matrix); });
    im.castShadow = im.receiveShadow = true; scene.add(im, om); }
  // ---------- HANGAR (start) + BLACKBOARDS: minigames/meru/range-hangar.js (also mounted in the Meru 2 Tank Range hangar) ----------
  const HG = buildHangar({ THREE, M, toon, glowTex: X.glowTex, scene, solid }), { BOARDS, BD, coinP } = HG;
  // SGT. TREAD (new Meru soldier, invented for the range): stands by the board, salutes, talks in a bubble
  const sgt = X.kit.makeFox({ ...X.CAST.player, torso: ['#4b5563', '#e5e7eb', '#1f2937'], outfit: 'armor', gear: 'none', mood: 'happy' }); sgt.position.set(14.6, 0, -86.5); sgt.rotation.y = Math.atan2(0 - 14.6, -103 + 86.5); scene.add(sgt);
  const bubCv = document.createElement('canvas'); bubCv.width = 768; bubCv.height = 160; const bubTex = new THREE.CanvasTexture(bubCv); bubTex.colorSpace = THREE.SRGBColorSpace;
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthTest: false })); bub.scale.set(6, 1.25, 1); bub.position.set(14.6, 3.7, -86.5); bub.renderOrder = 9; scene.add(bub); let bubText = '';
  function say(s) { if (s === bubText) return; bubText = s; const g = bubCv.getContext('2d'); g.clearRect(0, 0, 768, 160); g.font = '800 40px Archivo, sans-serif'; const w = Math.min(760, g.measureText(s).width + 56); g.fillStyle = '#f3f2f2'; g.fillRect(4, 4, w - 8, 112); g.lineWidth = 6; g.strokeStyle = '#201e1d'; g.strokeRect(4, 4, w - 8, 112); g.beginPath(); g.moveTo(40, 116); g.lineTo(70, 116); g.lineTo(44, 150); g.closePath(); g.fillStyle = '#201e1d'; g.fill(); g.fillStyle = '#201e1d'; g.textBaseline = 'middle'; g.fillText(s, 28, 62); bubTex.needsUpdate = true; }
  say('Read the board, recruit!');

  // ---------- path lamps + painted section labels ----------
  // street lamps: knock them with the tank → they bend (light flickers), hit hard / again → snap, fall, small blast on impact
  const lamps = [], lampGlow = () => new THREE.SpriteMaterial({ map: X.glowTex, color: 0xffd98a, transparent: true, depthWrite: false, opacity: 0.85, blending: THREE.AdditiveBlending });
  const LAMPS = []; for (let z = -92; z <= 256; z += 24) for (const sx of [-1, 1]) LAMPS.push([sx * 31, z, sx]); for (const z of [446, 472]) for (const sx of [-1, 1]) LAMPS.push([sx * 17, z, sx]);
  for (const [x, z, sx] of LAMPS) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const pv = new THREE.Group(); g.add(pv);
    M(new THREE.CylinderGeometry(0.1, 0.12, 4.2, 6), ink, 0, 2.1, 0, pv, 0); M(new THREE.BoxGeometry(0.7, 0.25, 0.4), ink, -sx * 0.3, 4.2, 0, pv, 0); M(new THREE.CylinderGeometry(0.28, 0.32, 0.3, 8), ink, 0, 0.15, 0, g, 0);
    const gl = SPR(lampGlow(), V3(-sx * 0.4, 4.0, 0), V3(2.4, 2.4, 1)); pv.add(gl); lamps.push({ g, pv, gl, x, z, dim: 1, st: 'up', bend: 0, bx: 0, bz: 0, fall: 0, fv: 0, hits: 0, cd: 0, flick: 0 }); }
  function label(n, s, z) { const t = CT(1024, 256, (g, w, h) => { g.fillStyle = '#ec3013'; g.fillRect(0, 30, 200, 196); g.fillStyle = '#f3f2f2'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 46, 136); g.font = '900 120px Archivo, sans-serif'; g.fillText(s, 236, 136); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.92, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, Math.PI); m.position.set(2, 0.03, z); scene.add(m); }
  const chev = CT(256, 256, (g, w, h) => { g.lineJoin = 'miter'; g.beginPath(); g.moveTo(28, 200); g.lineTo(128, 70); g.lineTo(228, 200); g.lineTo(228, 150); g.lineTo(128, 20); g.lineTo(28, 150); g.closePath(); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.stroke(); });
  const arrows = []; function arrowRow(x, z0, n, yaw = 0, step = 3.4, sz = 4.6) { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(sz, sz), new THREE.MeshBasicMaterial({ map: chev, transparent: true, depthWrite: false })); m.rotation.set(-Math.PI / 2, 0, yaw + Math.PI); m.position.set(x + Math.sin(yaw) * step * i, 0.05, z0 + Math.cos(yaw) * step * i); m.renderOrder = 2; scene.add(m); arrows.push({ m, k: i / n, base: arrows.length }); } }
  arrowRow(0, -109, 5, 0, 3.6, 5.5); arrowRow(0, -91, 4, 0, 3.4); arrowRow(0, -12, 3, 0, 6.8, 7); arrowRow(0, 58, 2, 0, 3.4, 4); arrowRow(0, 94, 4, 0, 6.8, 7); arrowRow(0, 156, 1, 0, 3.4, 5); arrowRow(0, 236, 3, 0, 6.8, 7); arrowRow(0, 444, 3, 0, 6.8, 6);
  for (let z = -40; z <= 240; z += 40) for (const sx of [-1, 1]) arrowRow(sx * 20, z, 1, 0, 3.4, 5);
  label('1', 'DRIVE', -64); label('2', 'PIVOT', 10); label('3', 'JUMP', 46); label('4', 'BREAK', 112); label('5', 'TARGETS', 164); label('6', 'THE PIT', 252); label('7', 'DUEL', 458);

  // ---------- 1 DRIVE: cones ----------
  const cones = [], coneGeo = new THREE.ConeGeometry(0.42, 1.1, 12), bandGeo = new THREE.CylinderGeometry(0.27, 0.32, 0.18, 12), coneM = toon('#ff7a1a');
  for (let k = 0; k < 7; k++) { const x = (k % 2 ? 14 : -14), z = -56 + k * 10; const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); M(coneGeo, coneM, 0, 0.55, 0, g, 0.015); M(bandGeo, white, 0, 0.62, 0, g, 0); M(new THREE.BoxGeometry(0.9, 0.08, 0.9), ink, 0, 0.04, 0, g, 0); cones.push({ g, x, z, hx: x, hz: z, vx: 0, vz: 0, vy: 0, y: 0, down: 0, spin: 0 }); }

  // ---------- tokens + repair wrenches ----------
  const coinTex = CT(128, 128, (g) => { g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#a8792e'; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 72px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70); });
  coinTex.center.set(0.5, 0.5); coinTex.rotation = Math.PI / 2; const coinGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.16, 22); coinGeo.rotateX(Math.PI / 2); const faceM = new THREE.MeshBasicMaterial({ map: coinTex }), coinMats = [gold, faceM, faceM];
  const tokens = [];
  // the board's 8-token: spins and pulses in place of a chalk drawing (canvas 470,585 → board plane)
  const bcM = [gold.clone(), faceM.clone(), faceM.clone()]; bcM.forEach(m => { m.transparent = true; });
  const bCoins = []; for (const B of BOARDS) for (const side of [1, -1]) { const c = new THREE.Mesh(coinGeo, bcM); c.scale.setScalar(0.24); c.position.set((1492 / 1600 - 0.5) * 6.4 * side, 3.5 + (0.5 - 746 / 900) * 3.6, 0.16 * side); B.g.add(c); bCoins.push(c); }
  function token(x, y, z, kind = 'coin') { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    if (kind === 'coin') { const m = new THREE.Mesh(coinGeo, coinMats); g.add(m); g.add(SPR(new THREE.SpriteMaterial({ map: X.glowTex, color: 0xffd23a, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending }), null, V3(2.4, 2.4, 1))); R.totalTokens++; }
    else if (kind === 'turbo') { M(new THREE.CylinderGeometry(0.5, 0.5, 1.4, 12), toon('#38bdf8'), 0, 0, 0, g, 0.02); M(new THREE.CylinderGeometry(0.22, 0.22, 0.3, 8), ink, 0, 0.85, 0, g, 0); M(new THREE.CylinderGeometry(0.52, 0.52, 0.22, 12), white, 0, 0.1, 0, g, 0); g.add(SPR(new THREE.SpriteMaterial({ map: X.glowTex, color: 0x38bdf8, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending }), null, V3(2.8, 2.8, 1))); }
    else if (kind === 'ammo') { M(new THREE.BoxGeometry(1.6, 0.9, 1.0), toon('#4d5a2a'), 0, 0, 0, g, 0.02); M(new THREE.BoxGeometry(1.62, 0.22, 1.02), red, 0, 0.12, 0, g, 0); for (const sx of [-0.45, 0, 0.45]) M(new THREE.ConeGeometry(0.14, 0.4, 8), red, sx, 0.62, 0, g, 0); g.add(SPR(new THREE.SpriteMaterial({ map: X.glowTex, color: 0xff8a1a, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending }), null, V3(2.8, 2.8, 1))); }
    else { const gr = toon('#22c55e'); M(new THREE.BoxGeometry(0.28, 1.3, 0.2), gr, 0, 0, 0, g, 0.02); M(new THREE.TorusGeometry(0.32, 0.12, 6, 12, 4.6), gr, 0, 0.75, 0, g, 0.02).rotation.z = -0.75; M(new THREE.BoxGeometry(1.0, 0.3, 0.3), white, 0, -0.1, 0.12, g, 0); g.add(SPR(new THREE.SpriteMaterial({ map: X.glowTex, color: 0x22c55e, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending }), null, V3(2.6, 2.6, 1))); }
    tokens.push({ g, x, y, z, kind, got: false, t: rr(0, 6), back: 0 }); }
  for (let k = 0; k < 6; k++) token(k % 2 ? -6 : 6, 1.4, -51 + k * 10);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; token(Math.cos(a) * 4, 1.4, 28 + Math.sin(a) * 4); }
  for (let k = 0; k < 5; k++) token(0, 4.6 - Math.abs(k - 1.5) * 0.55, 68 + k * 2.6);
  for (let k = 0; k < 5; k++) token(-16 + k * 8, 1.4, 158 + (k % 2) * 4);
  for (const [x, z] of [[-18, 44], [18, 52], [0, 40], [0, 60]].map(([a, b]) => Q(a, b))) token(x, 1.4, z);
  for (const [x, z] of [[-14, 64], [14, 64], [-20, 82], [20, 82]].map(([a, b]) => P2(a, b))) token(x, 1.4, z);
  token(-80, 1.4, -90); token(-102, 6.4, 80);
  for (const [x, z] of [Q(0, 72), ...[[-24, 62], [24, 62]].map(([a, b]) => P2(a, b))]) token(x, 1.4, z, 'wrench');
  // ROCKET AMMO CRATES (+2) and TURBO cans (+1): respawn 25 s
  for (const [x, z] of [[-20, -20], [20, 96], [-28, 196], P2(-30, 74), P2(30, 92), [DA.x - 30, DA.z], [DA.x + 30, DA.z]]) token(x, 1.4, z, 'ammo');
  for (const [x, z] of [[16, -40], [-12, 38], [28, 140], P2(30, 70), [DA.x, DA.z - 30]]) token(x, 1.4, z, 'turbo');

  // ---------- 2 PIVOT pad, 3 JUMP ramps ----------
  { const pad = new THREE.Mesh(new THREE.RingGeometry(6.2, 6.9, 48), new THREE.MeshBasicMaterial({ color: 0xec3013 })); pad.rotation.x = -Math.PI / 2; pad.position.set(0, 0.03, 28); scene.add(pad); M(new THREE.CylinderGeometry(0.3, 0.3, 0.12, 16), ink, 0, 0.06, 28, null, 0); }
  X.addRamp({ x: 0, z: 52, yaw: 0, w: 20, l: 9, h: 2.4, top: 3 }, '#e6b45a');
  X.addRamp({ x: -92, z: 80, yaw: -Math.PI / 2, w: 7, l: 9, h: 3.2, top: 0 }, '#c9a463');

  // ---------- 4 BREAK THROUGH: brick walls, crates, junk ----------
  const brickT = CT(256, 256, (g, w, h) => { g.fillStyle = '#d9cfc2'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = -1; c < 4; c++) { g.fillStyle = ['#b5452c', '#a63d27', '#c24f33'][(r + c + 9) % 3]; g.fillRect(c * 72 + (r % 2) * 36 + 3, r * 32 + 3, 66, 26); } });
  const brickM = new THREE.MeshToonMaterial({ map: brickT, gradientMap: X.grad }), debris = [];
  for (const wz of [128, 148]) for (let k = -9; k <= 9; k++) { const g = new THREE.Group(); M(new THREE.BoxGeometry(3, 2.4, 0.9), brickM, 0, 1.2, 0, g, 0.02); M(new THREE.BoxGeometry(3.04, 0.16, 0.94), conc, 0, 2.45, 0, g, 0); custom('brick', g, k * 3 + (wz === 148 ? 1.5 : 0), wz, 2.0, 2.4, 25); }
  for (const [x, z] of [[-19, 12], [-20, 13.4], [19, 16], [18.5, 17.5], [20, 14.5]].map(([a, b]) => Q(a, b))) { const o = X.crate(x, z); o.noRespawn = true; }
  for (const [x, z, y, c] of [[-24, 22, 0.4, '#38bdf8'], [24, 8, -0.6, '#a78bfa'], [-26, -4, 1.2, '#e6b45a']].map(([a, b, y, c]) => [...Q(a, b), y, c])) { const o = X.junk(x, z, y, c); o.noRespawn = true; }

  // ---------- 5 TARGETS: robot cut-outs ----------
  const tgtT = CT(256, 320, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.beginPath(); g.arc(128, 70, 52, 0, 7); g.fill(); g.fillRect(48, 130, 160, 170); g.fillStyle = '#f3f2f2'; for (const r of [120, 80, 40]) { g.beginPath(); g.arc(128, 215, r * 0.6, 0, 7); g.lineWidth = 10; g.strokeStyle = '#f3f2f2'; g.stroke(); } g.fillStyle = '#201e1d'; g.fillRect(96, 58, 22, 16); g.fillRect(138, 58, 22, 16); g.lineWidth = 8; g.strokeStyle = '#201e1d'; g.strokeRect(4, 4, w - 8, h - 8); });
  const targets = [];
  for (const [x, z, slide] of [[-21, 38, 0], [21, 42, 0], [-33, 50, 6], [33, 54, 6], [-12, 62, 0], [12, 66, 0], [-44, 66, 7], [44, 70, 7]].map(([a, b, s]) => [...Q(a, b), s * 2])) { const g = new THREE.Group(), fl = new THREE.Group(); g.add(fl); M(new THREE.BoxGeometry(0.2, 1.2, 0.2), ink, 0, 0.6, 0, g, 0.01); const pm = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.5), new THREE.MeshBasicMaterial({ map: tgtT, side: THREE.DoubleSide })); pm.position.y = 1.25; fl.add(pm); fl.position.y = 1.2; M(new THREE.BoxGeometry(1.6, 0.12, 0.6), ink, 0, 0.06, 0, g, 0); g.rotation.y = Math.atan2(-x, -100 - z); const o = custom('target', g, x, z, 1.4, 3.8, 1, { fl, slide, hx: x, down: 0 }); targets.push(o); R.totalTargets++; if (slide) { const rail = M(new THREE.BoxGeometry(slide * 2 + 2, 0.12, 0.3), steel, x, 0.06, z, null, 0); } }

  // ---------- 6 THE PIT: ring wall, cover, towers, barrels, sandbags ----------
  { const segs = 108, geo = new THREE.BoxGeometry(5.4, 1.8, 1.2), im = new THREE.InstancedMesh(geo, conc, segs), om = new THREE.InstancedMesh(geo, X.outlineMat, segs), o3 = new THREE.Object3D(); let n = 0;
    for (let i = 0; i < segs; i++) { const a = i / segs * Math.PI * 2, gapS = Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.13 || Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2))) < 0.13; if (gapS) continue; const x = PC.x + Math.cos(a) * (PC.r + 1), z = PC.z + Math.sin(a) * (PC.r + 1); o3.position.set(x, 0.9, z); o3.rotation.set(0, -a + Math.PI / 2, 0); o3.scale.set(1, 1, 1); o3.updateMatrix(); im.setMatrixAt(n, o3.matrix); o3.scale.set(1.04, 1.08, 1.12); o3.updateMatrix(); om.setMatrixAt(n, o3.matrix); n++; solid(x, z, 1.7, 1.8); }
    im.count = om.count = n; im.castShadow = im.receiveShadow = true; scene.add(im, om);
    for (const sz of [-1, 1]) for (const sx of [-1, 1]) { M(new THREE.BoxGeometry(1.4, 4.5, 1.4), red, PC.x + sx * 12, 2.25, PC.z + sz * (PC.r + 1), null, 0.03); solid(PC.x + sx * 12, PC.z + sz * (PC.r + 1), 1.2, 4.5); } }
  for (const [x, z, a] of [[-10, 62, 0], [10, 62, 0], [-16, 76, 1.2], [16, 76, -1.2], [0, 80, 0], [-6, 92, 0.3], [6, 92, -0.3]].map(([a1, b1, c1]) => [...P2(a1, b1), c1])) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = a; scene.add(g); M(new THREE.BoxGeometry(5, 1.7, 1.5), conc, 0, 0.85, 0, g, 0.03); M(new THREE.BoxGeometry(5.04, 0.25, 1.54), toon('#ffd23a'), 0, 1.6, 0, g, 0); for (const k of [-1.6, 0, 1.6]) solid(x + Math.cos(a) * k, z - Math.sin(a) * k, 1.0, 1.7); }
  const towers = [[-20, 88], [20, 88]].map(([a, b]) => P2(a, b)); for (const [x, z] of towers) { for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new THREE.BoxGeometry(0.35, 5, 0.35), steel, x + sx * 2.2, 2.5, z + sz * 2.2, null, 0.02); M(new THREE.BoxGeometry(5.6, 0.4, 5.6), toon('#8a8f96'), x, 5.0, z, null, 0.03); for (const sx of [-1, 1]) { M(new THREE.BoxGeometry(5.6, 0.8, 0.12), red, x, 5.6, z + sx * 2.75, null, 0.01); M(new THREE.BoxGeometry(0.12, 0.8, 5.6), red, x + sx * 2.75, 5.6, z, null, 0.01); } for (let k = 0; k < 6; k++) M(new THREE.BoxGeometry(1, 0.1, 0.1), ink, x, 0.6 + k * 0.75, z - 2.4, null, 0); solid(x, z, 2.2, 5); }
  for (const [x, z, a] of [[-22, 66, 0.8], [22, 66, -0.8], [-4, 70, 0], [4, 86, 0]].map(([a1, b1, c1]) => [...P2(a1, b1), c1])) { const g = new THREE.Group(); for (let k = 0; k < 5; k++) { const sb = M(new THREE.CapsuleGeometry(0.32, 0.6, 3, 8), toon('#c2a878'), (k - 2) * 0.7, 0.35, 0, g, 0.015); sb.rotation.z = Math.PI / 2; } for (let k = 0; k < 4; k++) { const sb = M(new THREE.CapsuleGeometry(0.32, 0.6, 3, 8), toon('#b39a6c'), (k - 1.5) * 0.7, 0.95, 0, g, 0.015); sb.rotation.z = Math.PI / 2; } g.rotation.y = a; custom('sandbag', g, x, z, 2.0, 1.3, 60, { noAim: true }); }
  for (const [x, z] of [[-12, 70], [12, 70], [-26, 78], [26, 78], [0, 96], [-8, 56], [8, 56]].map(([a, b]) => P2(a, b))) { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.55, 0.55, 1.4, 14), red, 0, 0.7, 0, g, 0.02); M(new THREE.CylinderGeometry(0.57, 0.57, 0.18, 14), toon('#ffd23a'), 0, 0.95, 0, g, 0); M(new THREE.CylinderGeometry(0.57, 0.57, 0.18, 14), toon('#ffd23a'), 0, 0.45, 0, g, 0); custom('barrel', g, x, z, 1.1, 1.4, 8); }
  // the crowd: three foxes on a stand by the pit cheer every kill
  const fans = []; { const [sx, sz] = P2(-43, 60); M(new THREE.BoxGeometry(8, 1, 3), toon('#8a8f96'), sx, 0.5, sz, null, 0.02); M(new THREE.BoxGeometry(8, 1, 1.6), toon('#8a8f96'), sx - 0.8, 1.5, sz, null, 0.02); solid(sx, sz, 2.6, 2);
    [['#38bdf8', '#e0f2fe', '#0369a1'], ['#f472b6', '#fce7f3', '#9d174d'], ['#a3e635', '#ecfccb', '#3f6212']].forEach((tc, i) => { const f = X.kit.makeFox({ ...X.CAST.player, torso: tc, crest: '', gear: 'none', outfit: 'vest', mood: 'happy' }); f.position.set(sx - 2.4 + i * 2.4, 1.0 + (i === 1 ? 1 : 0), sz); f.rotation.y = Math.PI / 2; scene.add(f); fans.push({ f, y0: f.position.y, hop: 0 }); }); }
  const cheer = () => fans.forEach(F => F.hop = Math.max(F.hop, rr(0.6, 1)));

  // ---------- robots ----------
  const BOT = { drone: { name: 'Sink Charger', sc: 2.3, r: 3.2, h: 4.4, hp: 30, spd: 7.5, pts: 30, label: 'SCRAP DRONE' }, sentry: { name: 'Sink Sentry', sc: 1.45, r: 1.8, h: 3.5, hp: 70, spd: 0, pts: 60, label: 'SENTRY' }, charger: { name: 'Sink Charger', sc: 1.45, r: 2.4, h: 3.2, hp: 120, spd: 4.5, pts: 100, label: 'CHARGER' }, turret: { name: 'Sink Sentry', sc: 1.2, r: 1.8, h: 2.9, hp: 55, spd: 0, pts: 50, label: 'TURRET' }, warden: { name: 'Sink Warden', sc: 1.9, r: 3.6, h: 5.4, hp: 420, spd: 3.2, pts: 400, label: 'WARDEN' } };
  const bots = [], spawnQ = [], bolts = [], lobs = [];
  const laneGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5), ringGeo = new THREE.RingGeometry(7.0, 7.9, 40).rotateX(-Math.PI / 2), discGeo = new THREE.CircleGeometry(3.2, 32).rotateX(-Math.PI / 2);
  const hpBg = new THREE.SpriteMaterial({ color: 0x201e1d, depthTest: false }), hpFg = new THREE.SpriteMaterial({ color: 0xec3013, depthTest: false });
  function spawnBot(type, x, z, y = 0) { const D = BOT[type], g = ck.build(D.name); g.scale.multiplyScalar(D.sc); try { bakeCreature(THREE, g); } catch (e) {} scene.add(g); g.position.set(x, y, z); g.rotation.y = Math.atan2(X.C.x - x, X.C.z - z); fx.attach(g);
    if (!y) fx.spawn(g, () => { X.audio.burst(0.3, 300, 0.25); X.St.shake = Math.max(X.St.shake, D.sc > 1 ? 0.6 : 0.2); X.puff(tmp.set(x, 0.3, z), 0xb8a77a, 8, 3, 1, 0.7); });
    const bar = new THREE.Group(), bb = new THREE.Sprite(hpBg), bf = new THREE.Sprite(hpFg); bb.scale.set(2 * D.sc + 0.6, 0.18, 1); bf.scale.set(2 * D.sc + 0.5, 0.12, 1); bf.center.set(0, 0.5); bf.position.x = -(2 * D.sc + 0.5) / 2; bb.renderOrder = bf.renderOrder = 8; bar.add(bb, bf); bar.position.set(x, y + D.h + 0.9, z); bar.visible = false; scene.add(bar);
    const o = custom('bot', g, x, z, D.r * 1.4, y + D.h * 1.15, D.hp, { type, D, y, st: y ? 'idle' : 'spawn', t: 0, cd: rr(0.6, 1.6), lobCd: rr(2, 4), bar, bf, bw: 2 * D.sc + 0.5, face: g.rotation.y, wave: R.wave });
    g.position.set(x, y, z); o.onHit = (n, by) => { fx.hit(g); o.bar.visible = true; if (o.st === 'stun') X.popup(tmp.set(o.x, o.h + 1, o.z), 'x2', '#ffd23a'); }; bots.push(o); ck.enter(g, 'idle'); return o; }
  function setSt(o, s) { o.st = s; o.t = 0; const m = { move: 'move', windup: 'windup', attack: 'attack', recover: 'recover', stun: 'stagger', die: 'die', idle: 'idle', spawn: 'idle' }[s]; ck.enter(o.g, m); }
  function lane(o, w, col, len) { if (!o.lane) { o.lane = new THREE.Mesh(laneGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.4, depthWrite: false })); scene.add(o.lane); } o.lane.visible = true; o.lane.position.set(o.x, 0.05, o.z); o.lane.rotation.y = o.aim; o.lane.scale.set(w, 1, len); }
  const boltGeo = new THREE.SphereGeometry(0.22, 10, 8), boltMat = new THREE.MeshBasicMaterial({ color: 0xff3b1f });
  function fireBolt(o, tx, tz) { const y0 = o.y + o.D.h * 0.7 + (o.y ? 0.6 : 0), p = V3(o.x + Math.sin(o.face) * 1.2, y0, o.z + Math.cos(o.face) * 1.2), d = V3(tx, X.C.y + 1.3, tz).sub(p).normalize(), m = new THREE.Mesh(boltGeo, boltMat); m.position.copy(p); m.add(SPR(new THREE.SpriteMaterial({ map: X.glowTex, color: 0xff3b1f, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }), null, V3(1.3, 1.3, 1))); scene.add(m); bolts.push({ m, v: d.multiplyScalar(o.type === 'turret' ? 26 : 30), life: 2.6, dmg: o.type === 'turret' ? 3 : 5 }); X.audio.tone(1100, 0.07, 0.04, 'square', 0.5); }
  function tankHit(n, kx = 0, kz = 0) { if (R.state !== 'run' || R.down > 0) return; R.hp = Math.max(0, R.hp - n); R.hurt = 1; X.St.shake = Math.max(X.St.shake, 0.3 + n * 0.02); X.popup(tmp.set(X.C.x, X.C.y + 4, X.C.z), '-' + n, '#ec3013'); X.audio.burst(0.2, 500, 0.25); X.audio.tone(140, 0.15, 0.06, 'square', 0.6); if (kx || kz) { X.C.x += kx; X.C.z += kz; }
    if (R.hp <= 0) { R.down = 2.6; R.deaths++; X.boom(tmp.set(X.C.x, 1, X.C.z), 3); banner('TANK DOWN · BACK IN THE FIGHT IN 2 S', 2.6); X.C.speed = 0; } }
  const WAVES = [null, { name: 'SCRAP DRONES', list: () => arc(6).map(([x, z]) => ['drone', x, z]) }, { name: 'SENTRIES', list: () => [['sentry', ...P2(-20, 88), 5.2], ['sentry', ...P2(20, 88), 5.2], ['sentry', ...P2(-8, 96)], ['sentry', ...P2(8, 96)], ...arc(3).map(([x, z]) => ['drone', x, z])] }, { name: 'CHARGERS', list: () => [...arc(3).map(([x, z]) => ['charger', x, z]), ...arc(2, 48).map(([x, z]) => ['drone', x, z])] }, { name: 'THE WARDENS', list: () => [['warden', ...P2(-9, 96)], ['warden', ...P2(9, 96)], ['drone', ...P2(-16, 98), 0, 6], ['drone', ...P2(16, 98), 0, 6]] }];
  function arc(n, r = 64) { const out = []; for (let i = 0; i < n; i++) { const a = Math.PI / 2 + (n > 1 ? (i / (n - 1) - 0.5) * 1.8 : 0); out.push([PC.x + Math.cos(a) * r, PC.z + Math.sin(a) * r]); } return out; }
  function startWave(n) { R.wave = n; const W = WAVES[n]; banner('WAVE ' + n + ' · ' + W.name, 3); X.audio.tone(330, 0.3, 0.06, 'square', 1.5); setTimeout(() => X.audio.tone(495, 0.3, 0.06, 'square', 1.5), 180); W.list().forEach(([type, x, z, y = 0, delay = 0], i) => spawnQ.push({ type, x, z, y, t: delay || i * 0.35 + 0.6 })); R.cp = { x: 0, z: 252, yaw: 0 }; if (n === 4) say('Those are WARDENS. Keep moving!'); }

  // ---------- smash hook (bricks, targets, sandbags, barrels, robots) ----------
  function bits(x, y, z, col, n, dirx = 0, dirz = 0, sz = 0.35) { for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(rr(0.2, sz * 1.6), rr(0.15, sz), rr(0.2, sz * 1.3)), toon(col[i % col.length])); m.position.set(x + rr(-0.8, 0.8), y + rr(0, 1.6), z + rr(-0.4, 0.4)); m.castShadow = true; scene.add(m); debris.push({ m, v: V3(rr(-3, 3) + dirx * rr(6, 12), rr(3, 9), rr(-3, 3) + dirz * rr(6, 12)), s: V3(rr(-8, 8), rr(-8, 8), rr(-8, 8)), t: rr(2.5, 4) }); } }
  function onSmash(o, by) {
    if (o.kind === 'duel') { duelBeaten(); return; }
    const C0 = X.C, fx0 = Math.sin(C0.yaw), fz0 = Math.cos(C0.yaw);
    if (o.kind === 'brick') { o.g.visible = false; bits(o.x, 0.4, o.z, ['#b5452c', '#c24f33', '#d9cfc2'], 10, by === 'ram' || by === 'brick' ? fx0 : 0, by === 'ram' || by === 'brick' ? fz0 : 0); X.puff(tmp.set(o.x, 1, o.z), 0xc9b48a, 8, 3, 1.4, 0.9); X.audio.burst(0.3, 700, 0.25); R.score += 20; X.popup(tmp.set(o.x, 3, o.z), 'SMASH +20', '#ec3013'); X.St.shake = Math.max(X.St.shake, 0.3); }
    else if (o.kind === 'target') { o.down = 0.001; R.targets++; R.score += 50; X.popup(tmp.set(o.x, 4.2, o.z), 'TARGET +50', '#ffd23a'); X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); if (R.targets === R.totalTargets) { banner('ALL TARGETS DOWN · +200 · ON TO THE PIT', 3); R.score += 200; } }
    else if (o.kind === 'sandbag') { o.g.scale.y = 0.35; X.puff(tmp.set(o.x, 0.6, o.z), 0xc2a878, 10, 3, 1.2, 0.9); X.audio.burst(0.25, 400, 0.22); R.score += 10; }
    else if (o.kind === 'barrel') { o.g.visible = false; X.popup(tmp.set(o.x, 3, o.z), 'KABOOM', '#ff8a1a'); R.score += 15; setTimeout(() => X.blast(V3(o.x, 0.8, o.z), 4.0, 140, true), 60); }
    else if (o.kind === 'bot') { setSt(o, 'die'); o.bar.visible = false; if (o.lane) o.lane.visible = false; if (o.ring) o.ring.visible = false; R.kills++; R.score += o.D.pts; X.popup(tmp.set(o.x, o.h + 1.2, o.z), o.D.label + ' +' + o.D.pts, '#ffd23a'); cheer(); X.audio.tone(220, 0.3, 0.06, 'sawtooth', 0.5); }
  }

  // ---------- zones: a banner the first time you enter each part ----------
  const QT = f => p => f(Qi(p));
  const ZONES = [['drive', QT(p => p.z > -86 && p.z < -46 && Math.abs(p.x) < 20), '1 · DRIVE: weave the cones and grab the 8-tokens. Hit no cones = BONUS', { x: 0, z: -72, yaw: 0 }], ['pivot', p => Math.hypot(p.x, p.z - 28) < 8, '2 · PIVOT: stop, then push the stick sideways. Spin a full circle in the ring = BONUS', { x: 0, z: 14, yaw: 0 }], ['jump', QT(p => p.z > -30 && p.z < -12 && Math.abs(p.x) < 10), '3 · JUMP: 3 = TURBO up the ramp', { x: 0, z: 36, yaw: 0 }], ['break', QT(p => p.z > 2 && p.z < 30 && Math.abs(p.x) < 28), '4 · BREAK THROUGH: ram the walls at speed, or blast them', { x: 0, z: 100, yaw: 0 }], ['targets', QT(p => p.z > 30 && p.z < 78 && Math.abs(p.x) < 50), '5 · TARGETS: the turret aims itself. 1 rocket · 2 cannon · HOLD 1 = SALVO', { x: 0, z: 158, yaw: 0 }], ['pit', p => Math.hypot(p.x - PC.x, p.z - PC.z) < PC.r - 2, '6 · THE PIT: wreck the robots. Hide behind cover!', { x: 0, z: 252, yaw: 0 }]];

  const TURRETS = [[-22, 4], [22, 10], [-26, 30], [26, 36]].map(([a, b]) => Q(a, b));
  for (const [x, z] of TURRETS) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, sb = M(new THREE.CapsuleGeometry(0.34, 0.7, 3, 8), toon(k % 2 ? '#c2a878' : '#b39a6c'), Math.cos(a) * 2.4, 0.36, Math.sin(a) * 2.4, g, 0.015); sb.rotation.set(0, -a, Math.PI / 2); } }
  let turretsUp = false; function wakeTurrets() { if (turretsUp) return; turretsUp = true; TURRETS.forEach(([x, z], i) => { const o = spawnBot('turret', x, z, 0); o.early = true; o.cd = 0.8 + i * 0.4; }); }

  // ---------- link road (pit north gate → duel ring) + 7 DUEL ring ----------
  { const lt = roadT.clone(); lt.repeat.set(1, 1); lt.needsUpdate = true; const lr = new THREE.Mesh(new THREE.PlaneGeometry(28, 56), new THREE.MeshToonMaterial({ map: lt, gradientMap: X.grad })); lr.rotation.x = -Math.PI / 2; lr.position.set(0, 0.012, 462); lr.receiveShadow = true; scene.add(lr);
    const af = new THREE.Mesh(new THREE.CircleGeometry(DA.r + 1, 72), new THREE.MeshToonMaterial({ color: '#d2cbbd', gradientMap: X.grad })); af.rotation.x = -Math.PI / 2; af.position.set(DA.x, 0.014, DA.z); af.receiveShadow = true; scene.add(af);
    for (const r0 of [18, 36]) { const rg = new THREE.Mesh(new THREE.RingGeometry(r0 - 0.3, r0 + 0.3, 72), new THREE.MeshBasicMaterial({ color: 0xec3013 })); rg.rotation.x = -Math.PI / 2; rg.position.set(DA.x, 0.02, DA.z); scene.add(rg); }
    const segs = 64, geo = new THREE.BoxGeometry(5.4, 2.2, 1.2), im = new THREE.InstancedMesh(geo, conc, segs), om = new THREE.InstancedMesh(geo, X.outlineMat, segs), o3 = new THREE.Object3D(); let n = 0;
    for (let i = 0; i < segs; i++) { const a = i / segs * Math.PI * 2; if (Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2))) < 0.22) continue; const x = DA.x + Math.cos(a) * (DA.r + 1), z = DA.z + Math.sin(a) * (DA.r + 1); o3.position.set(x, 1.1, z); o3.rotation.set(0, -a + Math.PI / 2, 0); o3.scale.set(1, 1, 1); o3.updateMatrix(); im.setMatrixAt(n, o3.matrix); o3.scale.set(1.04, 1.08, 1.12); o3.updateMatrix(); om.setMatrixAt(n, o3.matrix); n++; solid(x, z, 1.7, 2.2); }
    im.count = om.count = n; im.castShadow = im.receiveShadow = true; scene.add(im, om);
    for (const [x, z, a] of [[-20, -12, 0.3], [20, -12, -0.3], [0, 6, 0], [-28, 16, 1.2], [28, 16, -1.2], [0, -30, 0]].map(([a1, b1, c1]) => [DA.x + a1, DA.z + b1, c1])) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = a; scene.add(g); M(new THREE.BoxGeometry(5, 1.9, 1.5), conc, 0, 0.95, 0, g, 0.03); M(new THREE.BoxGeometry(5.04, 0.25, 1.54), toon('#ffd23a'), 0, 1.8, 0, g, 0); for (const k of [-1.6, 0, 1.6]) solid(x + Math.cos(a) * k, z - Math.sin(a) * k, 1.0, 1.9); } }
  const gateG = new THREE.Group(), gateS = []; for (let k = 0; k < 5; k++) M(new THREE.BoxGeometry(4.8, 1.4, 0.8), k % 2 ? white : red, -9.6 + k * 4.8, 0.9, 0, gateG, 0.02); gateG.position.set(DA.x, 0, DA.z - DA.r - 1); gateG.visible = false; scene.add(gateG);
  function gate(on) { gateG.visible = on; if (on && !gateS.length) for (let x = -10; x <= 10; x += 4) gateS.push(solid(DA.x + x, DA.z - DA.r - 1, 1.5, 2)); }
  // ---------- numbered ARCHES over each section ----------
  function arch(n, s, z, hw = 26) { const t = CT(1024, 256, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(16, 16, 224, 224); g.fillStyle = '#f3f2f2'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 70, 136); g.font = '900 104px Archivo, sans-serif'; g.fillText(s, 272, 136); }); const g = new THREE.Group(); g.position.set(0, 0, z); g.rotation.y = Math.PI; scene.add(g);
    for (const sx of [-hw, hw]) { for (let k = 0; k < 12; k++) M(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 10), k % 2 ? white : red, sx, 0.55 + k * 1.1, 0, g, 0.015); g.add(SPR(lampGlow(), V3(sx, 13.8, 0), V3(2.6, 2.6, 1))); solid(sx, z, 0.9, 13); }
    M(new THREE.BoxGeometry(hw * 2 + 1, 0.8, 0.8), ink, 0, 13.4, 0, g, 0.02); const pm = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); pm.position.set(0, 11.2, 0); g.add(pm); }
  arch('1', 'DRIVE', -60); arch('2', 'PIVOT', 14); arch('3', 'JUMP', 40); arch('4', 'BREAK', 106); arch('5', 'TARGETS', 168); arch('6', 'THE PIT', 254); arch('7', 'DUEL', DA.z - DA.r - 8, 18);

  // ---------- 7 TANK DUEL: SGT. TREAD's own tank ----------
  const stG = X.makeVeh('tank'), SV = stG.userData.V, svs = (SV.spec && SV.spec.scale) || 1; stG.scale.setScalar(svs);
  { const tm = new Map(); stG.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material !== X.outlineMat) { if (!tm.has(m.material)) { const nm = m.material.clone(); if (nm.color.getHexString() === 'ec3013') nm.color.set('#ffd23a'); else nm.color.multiplyScalar(0.72); tm.set(m.material, nm); } m.material = tm.get(m.material); } }); }
  const drv = X.kit.makeFox({ ...X.CAST.player, torso: ['#4b5563', '#e5e7eb', '#1f2937'], outfit: 'armor', gear: 'none', mood: 'determined' }); drv.scale.multiplyScalar(1 / svs); { const sp0 = SV.seatLocal || SV.seat; if (sp0) drv.position.copy(sp0); (SV.seatParent || SV.body || stG).add(drv); const P = drv.userData.P; if (P) P.legs.forEach(l => l.rotation.x = -1.45); }
  const duelO = custom('duel', stG, DA.x, DA.z + 30, 4.3, 3.6, 550, { solid: true, noAim: true, face: Math.PI, spd: 0 }); stG.rotation.y = Math.PI;
  { const bar = new THREE.Group(), bb = new THREE.Sprite(hpBg), bf = new THREE.Sprite(hpFg), bw = 5; bb.scale.set(bw + 0.2, 0.24, 1); bf.scale.set(bw, 0.16, 1); bf.center.set(0, 0.5); bf.position.x = -bw / 2; bb.renderOrder = bf.renderOrder = 8; bar.add(bb, bf); bar.visible = false; scene.add(bar); Object.assign(duelO, { bar, bf, bw }); }
  duelO.onHit = () => { duelO.bar.visible = true; };
  const DU = { on: false, st: 'park', dir: 1, flip: 5, rk: 2.5, cn: 5, tb: 7, mode: 'circle', wt: 0, t0: 0, bt: 0 };
  const lnMat = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.4, depthWrite: false }), laneR = new THREE.Mesh(laneGeo, lnMat(0xff3b1f)), laneY = new THREE.Mesh(laneGeo, lnMat(0xffd23a)); laneR.visible = laneY.visible = false; scene.add(laneR, laneY);
  const dRkGeo = new THREE.CapsuleGeometry(0.12, 0.6, 3, 8); dRkGeo.rotateX(Math.PI / 2); const dRkM = toon('#4d5a2a'), dShM = new THREE.MeshBasicMaterial({ color: 0xffd23a }), dShGeo = new THREE.SphereGeometry(0.34, 12, 10);
  function duelFire(kind) { const o = duelO, a = DU.aim, sh = kind === 'shell', p = V3(o.x + Math.sin(a) * 3, 2.3, o.z + Math.cos(a) * 3), d = V3(DU.tx + (sh ? 0 : rr(-1.2, 1.2)) - p.x, X.C.y + 1.2 - p.y, DU.tz + (sh ? 0 : rr(-1.2, 1.2)) - p.z).normalize(), m = new THREE.Mesh(sh ? dShGeo : dRkGeo, sh ? dShM : dRkM); m.position.copy(p); m.lookAt(tmp.copy(p).add(d)); m.add(SPR(new THREE.SpriteMaterial({ map: X.glowTex, color: sh ? 0xffd23a : 0xff8a1a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }), null, V3(sh ? 2 : 1.3, sh ? 2 : 1.3, 1))); scene.add(m);
    bolts.push({ m, v: d.multiplyScalar(sh ? 52 : 30), life: 2.4, dmg: sh ? 14 : 5, big: sh }); X.puff(p, 0xffd23a, 4, 2, 0.8, 0.2, true); X.puff(p, 0xd1d5db, 4, 1.5, 0.9, 0.8); if (sh) { X.St.shake = Math.max(X.St.shake, 0.3); X.audio.tone(70, 0.35, 0.08, 'sawtooth', 0.4); X.audio.burst(0.3, 600, 0.3); } else { X.audio.tone(160, 0.3, 0.05, 'sawtooth', 0.35); X.audio.burst(0.2, 1400, 0.18); } }
  function duelPhase() { R.wave = 0; DU.on = true; DU.st = 'wait'; R.cp = { x: 0, z: 452, yaw: 0 }; banner('7 · TANK DUEL: SGT. TREAD waits in the ring north of the pit', 5); R.radioCd = 0; radio('Nice work in the pit. Now come and face me in the ring, recruit!'); }
  function duelBeaten() { const o = duelO; DU.st = 'beaten'; DU.bt = 0; o.bar.visible = false; laneR.visible = laneY.visible = false; R.duelT = Math.round(R.t - DU.t0); R.score += 600; X.popup(tmp.set(o.x, 5.5, o.z), 'SGT. TREAD BEATEN +600', '#ffd23a'); X.boom(tmp.set(o.x, 2, o.z), 3, 0xffb347); X.St.shake = Math.max(X.St.shake, 0.5); cheer(); R.radioCd = 0; radio('Outstanding, recruit! You beat me fair and square.'); banner('DUEL WON · SGT. TREAD SALUTES YOU', 3.5); setTimeout(() => { if (R.state === 'run') finish(); }, 3800); }
  const ad = a => Math.atan2(Math.sin(a), Math.cos(a));
  function updDuel(dt) { const o = duelO, C = X.C, Sp = S(), dx = C.x - o.x, dz = C.z - o.z, d = Math.hypot(dx, dz), want = Math.atan2(dx, dz);
    o.bar.position.set(o.x, 5.6, o.z); o.bf.scale.x = o.bw * Math.max(0, o.hp / o.max);
    const aiming = DU.mode === 'rkWind' || DU.mode === 'cnWind' || DU.mode === 'rkFire'; if (SV.turret && DU.st !== 'beaten') { const cur = SV.turret.rotation.y, tg = ad((aiming ? DU.aim : want) - o.face); SV.turret.rotation.y = cur + clamp(ad(tg - cur), -3 * dt, 3 * dt); }
    if (DU.st === 'beaten') { DU.bt += dt; if (Math.random() < 0.4) X.puff(tmp.set(o.x + rr(-1, 1), 3, o.z + rr(-1, 1)), 0x2a2826, 1, 1.5, 1.6, 1.4); const P = drv.userData.P; if (P) P.arms[1].rotation.x = damp(P.arms[1].rotation.x, (DU.bt % 3) < 1.6 ? -2.7 : 0, 8, dt); return; }
    if (!DU.on) return;
    if (DU.st === 'wait') { if (Math.hypot(C.x - DA.x, C.z - DA.z) < DA.r - 8) { gate(true); DU.st = 'count'; DU.c = 3.6; DU.said = ''; R.cp = { x: DA.x, z: DA.z - DA.r + 10, yaw: 0 }; banner('7 · TANK DUEL vs SGT. TREAD · the gate is shut', 2.2); } return; }
    if (DU.st === 'count') { DU.c -= dt; const n = Math.ceil(DU.c), s = n > 0 && n <= 3 ? String(n) : ''; if (s && DU.said !== s) { DU.said = s; banner('DUEL IN ' + s, 1); X.audio.tone(440, 0.2, 0.06, 'square', 1); } if (DU.c <= 0) { DU.st = 'go'; DU.t0 = R.t; o.solid = false; o.noAim = false; o.bar.visible = true; banner('GO! · OUTGUN SGT. TREAD', 1.6); X.audio.tone(880, 0.4, 0.06, 'square', 1); R.radioCd = 0; radio('Show me what you learned, recruit!'); } return; }
    if (R.state !== 'run') return;
    laneR.visible = laneY.visible = false; if (R.down > 0) { DU.mode = 'circle'; return; }
    const fast = o.hp / o.max < 0.5 ? 0.7 : 1; if (fast < 1 && !DU.half) { DU.half = true; R.radioCd = 0; radio('Not bad, recruit! Now I get serious.'); }
    DU.flip -= dt; if (DU.flip <= 0) { DU.dir *= -1; DU.flip = rr(4, 6.5); } DU.rk -= dt; DU.cn -= dt; DU.tb -= dt;
    let tx, tz, spd;
    if (DU.mode === 'turbo') { DU.mt -= dt; tx = DU.fx; tz = DU.fz; spd = 20; if (Math.random() < 0.7) X.puff(tmp.set(o.x - Math.sin(o.face) * 3, 1, o.z - Math.cos(o.face) * 3), 0x38bdf8, 1, 2, 1, 0.5, true); if (DU.mt <= 0 || Math.hypot(tx - o.x, tz - o.z) < 5) DU.mode = 'circle'; }
    else { const a = Math.atan2(o.x - C.x, o.z - C.z) + DU.dir * 0.75; tx = C.x + Math.sin(a) * 24; tz = C.z + Math.cos(a) * 24; spd = DU.mode === 'cnWind' ? 1.5 : DU.mode === 'circle' ? 8.5 : 4; }
    { const r = Math.hypot(tx - DA.x, tz - DA.z), mr = DA.r - 6; if (r > mr) { tx = DA.x + (tx - DA.x) / r * mr; tz = DA.z + (tz - DA.z) / r * mr; } }
    const df = ad(Math.atan2(tx - o.x, tz - o.z) - o.face); o.face += clamp(df, -1.9 * dt, 1.9 * dt); o.spd = damp(o.spd, spd * (1 - Math.min(0.7, Math.abs(df) * 0.45)), 3, dt); o.x += Math.sin(o.face) * o.spd * dt; o.z += Math.cos(o.face) * o.spd * dt;
    if (DU.mode === 'circle') {
      if (DU.tb <= 0 && d > 12) { DU.mode = 'turbo'; DU.mt = 1.6; DU.tb = rr(7, 10) * fast; const s = DU.dir; DU.fx = C.x + Math.cos(C.yaw) * s * 16 - Math.sin(C.yaw) * 8; DU.fz = C.z - Math.sin(C.yaw) * s * 16 - Math.cos(C.yaw) * 8; X.popup(tmp.set(o.x, 5, o.z), 'TURBO FLANK!', '#38bdf8'); X.audio.burst(0.5, 1200, 0.18); X.audio.tone(220, 0.5, 0.05, 'sawtooth', 2); }
      else if (DU.cn <= 0 && d < 70) { DU.mode = 'cnWind'; DU.wt = 0; X.audio.tone(90, 1, 0.05, 'sawtooth', 2.4); X.popup(tmp.set(o.x, 5, o.z), 'CANNON!', '#ffd23a'); }
      else if (DU.rk <= 0 && d < 60) { DU.mode = 'rkWind'; DU.wt = 0; X.audio.tone(1100, 0.6, 0.04, 'square', 0.6); } }
    const lock = k => { DU.aim = want; DU.tx = C.x + Math.sin(C.yaw) * C.speed * k; DU.tz = C.z + Math.cos(C.yaw) * C.speed * k; };
    const show = (L, w) => { L.visible = true; L.position.set(o.x, 0.07, o.z); L.rotation.y = DU.aim; L.scale.set(w, 1, Math.min(70, Math.hypot(DU.tx - o.x, DU.tz - o.z) + 4)); L.material.opacity = 0.2 + 0.35 * Math.sin(DU.wt * 18) ** 2; };
    if (DU.mode === 'rkWind') { DU.wt += dt; if (DU.wt < 0.55) lock(0.5); show(laneR, 0.8); if (DU.wt > 0.85) { DU.mode = 'rkFire'; DU.wt = 0; DU.shots = 0; } }
    else if (DU.mode === 'rkFire') { DU.wt += dt; if (DU.shots < 3 && DU.wt > DU.shots * 0.16) { duelFire('rocket'); DU.shots++; } if (DU.wt > 0.6) { DU.mode = 'circle'; DU.rk = rr(3.2, 4.6) * fast; } }
    else if (DU.mode === 'cnWind') { DU.wt += dt; if (DU.wt < 0.7) lock(0.35); show(laneY, 2.6); if (DU.wt > 1.15) { duelFire('shell'); DU.mode = 'circle'; DU.cn = rr(5, 7) * fast; } }
    for (const s of X.props) { if (s === o || s.dead || !s.solid) continue; const ex = o.x - s.x, ez = o.z - s.z, e = Math.hypot(ex, ez), mn = o.r * 0.6 + s.r * 0.6; if (e < mn && e > 0.001) { o.x = s.x + ex / e * mn; o.z = s.z + ez / e * mn; } }
    { const e = Math.hypot(o.x - C.x, o.z - C.z), mn = Sp.r + o.r * 0.6; if (e < mn && e > 0.001) { o.x = C.x + (o.x - C.x) / e * mn; o.z = C.z + (o.z - C.z) / e * mn; if (DU.mode === 'turbo' && !(DU.ramT > R.t)) { DU.ramT = R.t + 1; tankHit(10, (C.x - o.x) / e * 1.6, (C.z - o.z) / e * 1.6); DU.mode = 'circle'; } } }
    { const r = Math.hypot(o.x - DA.x, o.z - DA.z), mr = DA.r - 3; if (r > mr) { o.x = DA.x + (o.x - DA.x) / r * mr; o.z = DA.z + (o.z - DA.z) / r * mr; } }
    o.g.position.set(o.x, 0, o.z); o.g.rotation.y = o.face; }

  // ---------- GUIDANCE: next arrow, faint yellow guide line, lit lamps, wrong-way radio, dust storm off the road ----------
  const PATH = [[0, -100], [0, 264], [0, PC.z], [0, DA.z]];
  const dSeg = (x, z) => { let m = 1e9; for (let i = 0; i < PATH.length - 1; i++) { const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], dx = bx - ax, dz = bz - az, u = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const GOALS = [['drive', 'DRIVE', 0, -56], ['pivot', 'PIVOT', 0, 28], ['jump', 'JUMP', 0, 52], ['break', 'BREAK', 0, 128], ['targets', 'TARGETS', 0, 186], ['pit', 'THE PIT', 0, PC.z - PC.r + 6]];
  function goal() { const C = X.C;
    if (DU.on) { if (DU.st === 'go' || DU.st === 'count') return { x: duelO.x, z: duelO.z, label: 'SGT. TREAD' }; if (DU.st === 'wait') return { x: DA.x, z: DA.z - DA.r + 6, label: 'DUEL' }; return null; }
    if (R.wave) { let b = null, bd = 1e9; for (const o of bots) if (!o.dead && !o.gone) { const d = Math.hypot(o.x - C.x, o.z - C.z); if (d < bd) { bd = d; b = o; } } return b ? { x: b.x, z: b.z, label: 'ROBOT' } : { x: PC.x, z: PC.z, label: 'THE PIT' }; }
    let last = -1; GOALS.forEach((G, i) => { if (R.seen.has(G[0])) last = i; }); const G = GOALS[Math.min(GOALS.length - 1, last + 1)]; return { x: G[2], z: G[3], label: G[1] }; }
  const arrSh = new THREE.Shape([[-0.5, 1.6], [0.5, 1.6], [0.5, 0.6], [1.1, 0.6], [0, -0.8], [-1.1, 0.6], [-0.5, 0.6]].map(([a, b]) => new THREE.Vector2(a, b))), arrG = new THREE.ExtrudeGeometry(arrSh, { depth: 0.5, bevelEnabled: false }); arrG.translate(0, 0, -0.25);
  const nextArrow = new THREE.Group(); scene.add(nextArrow); M(arrG, new THREE.MeshBasicMaterial({ color: 0xffd23a }), 0, 0, 0, nextArrow, 0.06); nextArrow.add(SPR(new THREE.SpriteMaterial({ map: X.glowTex, color: 0xffd23a, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending }), V3(0, 0.4, 0), V3(5, 5, 1))); nextArrow.scale.setScalar(2.4); nextArrow.visible = false;
  const GN = 28, gPos = new Float32Array((GN + 1) * 6), gUv = new Float32Array((GN + 1) * 4), gIdx = []; for (let i = 0; i < GN; i++) { const a = i * 2; gIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3)); gGeo.setAttribute('uv', new THREE.BufferAttribute(gUv, 2)); gGeo.setIndex(gIdx);
  const dashT = CT(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(4, 150); g.lineTo(32, 40); g.lineTo(60, 150); g.lineTo(60, 200); g.lineTo(32, 100); g.lineTo(4, 200); g.closePath(); g.fill(); }); dashT.wrapT = THREE.RepeatWrapping;
  const gMat = new THREE.MeshBasicMaterial({ map: dashT, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }), gLine = new THREE.Mesh(gGeo, gMat); gLine.frustumCulled = false; gLine.renderOrder = 3; gLine.visible = false; scene.add(gLine);
  function radio(s) { if (R.radioCd > 0) return; R.radio = s; R.radioT = 4.5; R.radioCd = 10; X.audio.tone(1800, 0.05, 0.04, 'square', 1); setTimeout(() => X.audio.tone(1400, 0.07, 0.04, 'square', 1), 90); }
  function guide(dt, sp) { const C = X.C, T = X.St.t, g = goal(), Sp = S(); R.goal = g; R.radioT = Math.max(0, (R.radioT || 0) - dt); R.radioCd = Math.max(0, (R.radioCd || 0) - dt); if (R.radioT <= 0) R.radio = '';
    // off the road: rough ground (shake + slower) and a dust storm that thickens the further out you go
    const inPit = Math.hypot(C.x - PC.x, C.z - PC.z) < PC.r + 2, inDA = Math.hypot(C.x - DA.x, C.z - DA.z) < DA.r + 2, off = inPit || inDA || C.z < -86 ? 0 : Math.max(0, dSeg(C.x, C.z) - (C.z > 430 ? 14 : 28.5));
    R.rough = off > 0.5; R.offK = damp(R.offK || 0, clamp((off - 8) / 40, 0, 1), 1.5, dt);
    if (scene.fog) { scene.fog.near = 180 - R.offK * 160; scene.fog.far = 560 - R.offK * 470; scene.fog.color.copy(FOG0).lerp(DUST, R.offK); scene.background.copy(scene.fog.color); }
    if (R.state === 'run' && R.rough && R.down <= 0) { X.St.shake = Math.max(X.St.shake, 0.05 + 0.05 * R.offK); const mx = (Sp.max || 11) * (0.72 - 0.12 * R.offK) + (C.nitro > 0 ? 5 : 0); if (C.speed > mx) C.speed = damp(C.speed, mx, 4, dt); if (sp > 2 && Math.random() < (touch ? 0.3 : 0.6)) X.puff(tmp.set(C.x - Math.sin(C.yaw) * 2.6 + rr(-1, 1), 0.4, C.z - Math.cos(C.yaw) * 2.6 + rr(-1, 1)), 0xb8956a, 1, 1.5, 1.4, 0.8); }
    if (R.offK > 0.25 && Math.random() < R.offK * (touch ? 0.25 : 0.5)) X.puff(tmp.set(C.x + rr(-9, 9), rr(0.5, 3), C.z + rr(-9, 9)), 0xc9a97a, 1, 3, 2.6, 1.3);
    const live = R.state === 'run' && !R.board && g; gLine.visible = nextArrow.visible = false; if (!live) return;
    const dx = g.x - C.x, dz = g.z - C.z, gd = Math.hypot(dx, dz); R.gd = gd;
    nextArrow.visible = gd > 22; nextArrow.position.set(g.x, 10 + Math.sin(T * 3) * 0.6, g.z); nextArrow.rotation.y += dt * 1.6;
    const fx0 = Math.sin(C.yaw), fz0 = Math.cos(C.yaw), dot = gd > 1 ? (fx0 * dx + fz0 * dz) / gd : 1;
    if (gd > 30 && dot < -0.25 && sp > 3 && !R.wave && !(DU.on && DU.st !== 'wait')) R.wwT = (R.wwT || 0) + dt; else R.wwT = 0;
    if (gd > 12) { gLine.visible = true; const sx = C.x + fx0 * 4, sz = C.z + fz0 * 4, lx = g.x - sx, lz = g.z - sz, L = Math.hypot(lx, lz) || 1, px = lz / L * 0.8, pz = -lx / L * 0.8;
      for (let i = 0; i <= GN; i++) { const u = i / GN, x = sx + lx * u, z = sz + lz * u, y = 0.12, v = u * L / 4 - T * 1.5; gPos.set([x - px, y, z - pz, x + px, y, z + pz], i * 6); gUv.set([0, v, 1, v], i * 4); }
      gGeo.attributes.position.needsUpdate = true; gGeo.attributes.uv.needsUpdate = true; gMat.opacity = damp(gMat.opacity, clamp(0.22 + R.offK * 0.6 + (R.rough ? 0.12 : 0) + (R.wwT > 1 ? 0.4 : 0), 0, 0.9), 4, dt); }
    if (R.wwT > 3) { if (!(R.bannerT > 0.3 && R.banner.startsWith('WRONG'))) banner('WRONG WAY · ' + g.label + ' IS BEHIND YOU', 1.2); radio('Turn around, recruit! ' + g.label.charAt(0) + g.label.slice(1).toLowerCase() + ' is behind you.'); }
    else if (R.offK > 0.5) { R.offT = (R.offT || 0) + dt; if (R.offT > 3) radio('You are off the road, recruit. Follow the yellow line back!'); } else R.offT = 0;
    // only the lamps toward the next goal stay bright (all lit in the fights)
    R.lampT = (R.lampT || 0) - dt; if (R.lampT <= 0) { R.lampT = 0.25; const L2 = gd * gd || 1, all = R.wave || DU.on; for (const l of lamps) { const u = clamp(((l.x - C.x) * dx + (l.z - C.z) * dz) / L2, 0, 1), dl = Math.hypot(l.x - C.x - dx * u, l.z - C.z - dz * u); l.dim = all || Math.hypot(l.x - g.x, l.z - g.z) < 90 || dl < 40 ? 1 : 0.18; } } }
  // ---------- bonuses + fence ----------
  function bonuses(dt) { const C = X.C; if (R.state !== 'run') return;
    if (R.seen.has('drive') && !R.seen.has('coneDone') && Qi(C).z > -42) { R.seen.add('coneDone'); if (!R.coneHits) { R.clean = true; R.score += 150; banner('CLEAN CONE RUN · +150', 2.5); X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); } }
    if (!R.seen.has('pivotDone')) { if (Math.hypot(C.x, C.z - 28) < 6.5 && Math.abs(C.speed) < 1.5 && C.ground) { R.pivA += Math.abs(ad(C.yaw - (R.pyaw ?? C.yaw))); if (R.pivA > Math.PI * 2) { R.seen.add('pivotDone'); R.pivot = true; R.score += 100; banner('PIVOT 360 · +100', 2.5); X.popup(tmp.set(C.x, 4, C.z), 'PIVOT +100', '#ffd23a'); X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); } } else R.pivA = 0; R.pyaw = C.yaw; }
    R.fCd = Math.max(0, (R.fCd || 0) - dt); if (fence(C, S().r) && Math.abs(C.speed) > 3) { C.speed *= 0.4; if (R.fCd <= 0) { R.fCd = 0.5; X.audio.burst(0.15, 500, 0.2); X.St.shake = Math.max(X.St.shake, 0.2); } } }
  // ---------- weapons: LIMITED rockets (the pod shows what is left) + TURBO cans ----------
  function press(n, down) { const C = X.C; if (down && (R.state !== 'run' || R.down > 0)) return true;
    if (n === 1) { if (down && R.rk <= 0) { X.popup(tmp.set(C.x, 3.4, C.z), 'NO ROCKETS · GRAB AMMO CRATES', '#9ca3af'); return true; } return false; }
    if (n === 3) { if (!down) return false; if (C.nitroCd > 0) return true; if (R.turbo <= 0) { X.popup(tmp.set(C.x, 3.4, C.z), 'NO TURBO · GRAB CANS', '#9ca3af'); return true; } R.turbo--; return false; }
    return false; }
  function syncAmmo() { const C = X.C; if (R.lastA == null) R.lastA = C.ammo; const used = R.lastA - C.ammo; if (used > 0) R.rk = Math.max(0, R.rk - used); C.ammo = Math.min(4, R.rk); R.lastA = C.ammo; const V = X.V; if (V && V.podTubes) V.podTubes.forEach((tb, i) => tb.visible = i >= 4 - Math.floor(C.ammo)); }
  const start = { x: 0, z: -103, yaw: 0 }; R.cp = { ...start };
  X.setPaused(true);

  function update(dt, thr, sp, rdt) {
    const C = X.C, Sp = S(); R.bannerT = Math.max(0, R.bannerT - rdt); R.hurt = Math.max(0, R.hurt - rdt * 1.6); syncAmmo();
    if (R.state === 'run') R.t += dt;
    { R.ct = (R.ct || 0) + rdt; bCoins.forEach(c => c.rotation.y = R.ct * 2.6); const op = 0.55 + 0.45 * Math.cos(R.ct * 5.2); bcM.forEach(m => m.opacity = op); }
    { R.at = (R.at || 0) + rdt; const tt = R.at * 1.6; for (const a of arrows) { const ph = ((tt - a.k) % 1 + 1) % 1; a.m.material.opacity = 0.45 + 0.55 * Math.max(0, 1 - Math.abs(ph - 0.5) * 3); } }
    // talk bubble + sergeant
    const dS = Math.hypot(C.x - 14.6, C.z + 86.5); bub.visible = dS < 34; X.kit.animFox(sgt, dt, 0, false); const sal = (R.t % 5) < 0.9 && dS < 20; sgt.userData.P.arms[1].rotation.x = damp(sgt.userData.P.arms[1].rotation.x, sal ? -2.7 : 0, 10, dt);
    if (R.state === 'run') say(dS < 12 ? 'Roll out! Cones first, recruit.' : DU.on ? (DU.st === 'beaten' ? 'Outstanding, recruit!' : 'See you in the ring!') : R.wave === 4 ? 'Those are WARDENS. Keep moving!' : R.wave ? 'Give them the cannon!' : 'Follow the lamps!');
    // blackboard: drive up to it to read it full screen
    const dB = Math.min(...BOARDS.map(B => Math.hypot(C.x - B.x, C.z - B.z))); if (dB > 16) R.armed = true; if (R.state === 'run' && R.armed && dB < 7 && sp < 4) { R.armed = false; R.board = true; X.setPaused(true); }
    // down + respawn
    if (R.down > 0) { R.down -= dt; C.speed = 0; if (Math.random() < 0.6) X.puff(tmp.set(C.x, 2, C.z), 0x2a2826, 1, 1.5, 1.4, 1.2); if (R.down <= 0) { const p = R.cp || start; X.place(p.x, p.z, p.yaw); R.hp = 100; banner('BACK IN!', 1.5); } }
    const q0 = Qi(C); if (!turretsUp && q0.z > -24 && Math.abs(q0.x) < 30) wakeTurrets();
    if (turretsUp && !R.seen.has('landed') && (q0.z > -10 || (C.ground && q0.z > -14))) { R.seen.add('landed'); banner('TURRETS! Blast them before they wear you down', 3.5); }
    // zones
    for (const [k, test, line, cp] of ZONES) if (!R.seen.has(k) && R.state === 'run' && test(C)) { R.seen.add(k); banner(line, 4.5); if (cp && !R.wave && !DU.on) R.cp = cp; if (k === 'pit' && R.wave === 0) setTimeout(() => startWave(1), 300);
      if (k === 'break') [[-22, 34], [22, 34], [0, 40]].map(([a, b]) => Q(a, b)).forEach(([x, z], i) => spawnQ.push({ type: 'drone', x, z, y: 0, t: 0.8 + i * 0.4, early: true }));
      if (k === 'targets') [['sentry', -30, 76], ['sentry', 30, 76], ['drone', -10, 84], ['drone', 10, 84]].map(([k, a, b]) => [k, ...Q(a, b)]).forEach(([type, x, z], i) => spawnQ.push({ type, x, z, y: 0, t: 0.6 + i * 0.4, early: true })); }
    // cones
    for (const c of cones) { if (!c.down && Math.hypot(c.x - C.x, c.z - C.z) < Sp.r + 0.4) { c.down = 6; if (R.state === 'run') R.coneHits++; const l = Math.hypot(c.x - C.x, c.z - C.z) || 1; c.vx = (c.x - C.x) / l * (4 + sp) + Math.sin(C.yaw) * sp * 0.6; c.vz = (c.z - C.z) / l * (4 + sp) + Math.cos(C.yaw) * sp * 0.6; c.vy = 4 + sp * 0.3; c.spin = rr(8, 14); X.audio.tone(600, 0.06, 0.04, 'triangle', 0.6); X.popup(tmp.set(c.x, 2, c.z), 'CONE!', '#ff7a1a'); }
      if (c.down > 0) { c.down -= dt; c.vy -= 20 * dt; c.x += c.vx * dt; c.z += c.vz * dt; c.y = Math.max(0, c.y + c.vy * dt); if (c.y === 0) { c.vx *= 0.9; c.vz *= 0.9; c.vy = 0; c.spin *= 0.9; } c.g.rotation.x += c.spin * dt; c.g.rotation.z = c.y > 0 ? c.g.rotation.z + dt * 4 : Math.PI / 2; if (c.down <= 0 && Math.hypot(C.x - c.hx, C.z - c.hz) > 6) { c.down = 0; c.x = c.hx; c.z = c.hz; c.y = 0; c.g.rotation.set(0, 0, 0); } else if (c.down <= 0) c.down = 0.5; }
      c.g.position.set(c.x, c.y, c.z); }
    // tokens
    for (const tk of tokens) { tk.t += dt; if (tk.got) { if (tk.kind !== 'coin') { tk.back -= dt; if (tk.back <= 0) { tk.got = false; tk.g.visible = true; } } continue; } tk.g.rotation.y += dt * 2.6; tk.g.position.y = tk.y + Math.sin(tk.t * 2.2) * 0.18;
      if (Math.hypot(tk.x - C.x, tk.z - C.z) < Sp.r + 0.7 && Math.abs(C.y + 1.4 - tk.y) < 2.2) { tk.got = true; tk.g.visible = false; X.puff(tmp.set(tk.x, tk.y, tk.z), tk.kind === 'coin' ? 0xffd23a : tk.kind === 'ammo' ? 0xff8a1a : tk.kind === 'turbo' ? 0x38bdf8 : 0x22c55e, 6, 3, 0.6, 0.4, true);
        if (tk.kind === 'coin') { R.tokens++; R.score += 50; X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), R.tokens + ' / ' + R.totalTokens, '#e6b45a'); X.audio.tone(1320, 0.08, 0.05, 'triangle', 1.5); setTimeout(() => X.audio.tone(1760, 0.1, 0.04, 'triangle', 1.2), 70); if (R.tokens === R.totalTokens) { banner('EVERY TOKEN! +300', 3); R.score += 300; } }
        else if (tk.kind === 'ammo') { tk.back = 25; R.rk = Math.min(RK_MAX, R.rk + 2); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'ROCKETS +2', '#ff8a1a'); X.audio.tone(520, 0.15, 0.05, 'square', 1.2); }
        else if (tk.kind === 'turbo') { tk.back = 25; R.turbo = Math.min(TB_MAX, R.turbo + 1); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'TURBO +1', '#38bdf8'); X.audio.tone(880, 0.12, 0.05, 'triangle', 1.6); }
        else { tk.back = 1e9; save.give('repairKit'); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'REPAIR KIT +1', '#22c55e'); banner('REPAIR KIT: in your ITEMS. Tap it to fix the tank', 3); X.audio.tone(660, 0.2, 0.05, 'triangle', 1.6); } } }
    // bricks crumble on contact at speed (heavier than the bump rule)
    for (const o of X.props) if (o.kind === 'brick' && !o.dead && sp > 4.5 && Math.hypot(o.x - C.x, o.z - C.z) < Sp.r + 1.6) X.smash(o, 'brick');
    for (const lp of lamps) { lp.cd = Math.max(0, lp.cd - dt); const d = Math.hypot(lp.x - C.x, lp.z - C.z);
      if (lp.st !== 'down' && lp.st !== 'falling' && d < Sp.r + 0.5 && lp.cd <= 0 && sp > 1.5) { lp.cd = 0.5; lp.hits++; const ax = (lp.x - C.x) / (d || 1), az = (lp.z - C.z) / (d || 1); lp.bx = ax; lp.bz = az;
        if (sp > 8 || lp.hits >= 2) { lp.st = 'falling'; lp.fv = 0.8 + sp * 0.12; X.audio.burst(0.25, 900, 0.22); X.audio.tone(180, 0.2, 0.05, 'square', 0.4); X.popup(tmp.set(lp.x, 4.5, lp.z), 'TIMBER!', '#ffd23a'); X.St.shake = Math.max(X.St.shake, 0.25); X.puff(tmp.set(lp.x, 0.5, lp.z), 0xb8a77a, 6, 2, 0.8, 0.6); C.speed *= 0.85; }
        else { lp.st = 'bent'; lp.bend = Math.min(0.55, 0.25 + sp * 0.05); X.audio.tone(260, 0.18, 0.05, 'triangle', 0.6); X.audio.burst(0.12, 1400, 0.12); X.popup(tmp.set(lp.x, 4.5, lp.z), 'BENT', '#9ca3af'); C.speed *= 0.6; } }
      if (lp.st === 'falling') { lp.fv += dt * 6; lp.bend = Math.min(Math.PI / 2 - 0.05, lp.bend + lp.fv * dt); lp.flick = Math.random() < 0.5 ? 1 : 0; if (lp.bend >= Math.PI / 2 - 0.05) { lp.st = 'down'; lp.gl.visible = false; const tx = lp.x + lp.bx * 4.2, tz = lp.z + lp.bz * 4.2; X.boom(tmp.set(tx, 0.4, tz), 1.6, 0xffd98a); X.puff(tmp.set(tx, 0.6, tz), 0xffe08a, 10, 4, 0.5, 0.35, true); for (const o of X.props) if (o.kind === 'bot' && !o.dead && Math.hypot(o.x - tx, o.z - tz) < 2.6) X.damage(o, 25, 'lamp'); R.score += 25; X.popup(tmp.set(tx, 2.6, tz), 'LAMP DOWN +25', '#ec3013'); } }
      else if (lp.st === 'bent') { lp.flick = Math.random() < 0.18 ? 0 : 1; }
      else if (lp.st === 'up') lp.flick = 1;
      if (lp.st !== 'down') { lp.gl.material.opacity = 0.85 * lp.flick * lp.dim; lp.gl.visible = lp.flick > 0; }
      const ang = lp.bend; lp.pv.rotation.set(0, 0, 0); lp.pv.rotateOnWorldAxis(V3(lp.bz, 0, -lp.bx).normalize(), ang); }
    // targets: slide + flip down + swivel to face the tank
    for (const o of targets) if (!o.down) { const want = Math.atan2(C.x - o.x, C.z - o.z), cur = o.g.rotation.y, df = Math.atan2(Math.sin(want - cur), Math.cos(want - cur)); o.g.rotation.y = cur + clamp(df, -2.2 * dt, 2.2 * dt); }
    for (const o of targets) { if (o.slide && !o.dead) { o.x = o.hx + Math.sin(R.t * 0.9 + o.hx) * o.slide; o.g.position.x = o.x; } if (o.down > 0 && o.down < 1) { o.down = Math.min(1, o.down + dt * 3); o.fl.rotation.x = -o.down * Math.PI / 2; } }
    // fans
    for (const F of fans) { X.kit.animFox(F.f, dt, 0, false); if (F.hop > 0) { F.hop -= dt * 1.6; F.f.position.y = F.y0 + Math.abs(Math.sin(F.hop * 9)) * 0.5; F.f.userData.P.arms.forEach(a => a.rotation.x = -2.8); } else { F.f.position.y = F.y0; F.f.userData.P.arms.forEach(a => a.rotation.x = damp(a.rotation.x, 0, 6, dt)); } }
    // waves
    for (let i = spawnQ.length - 1; i >= 0; i--) { const q = spawnQ[i]; q.t -= dt; if (q.t <= 0) { const o = spawnBot(q.type, q.x, q.z, q.y); o.early = !!q.early; spawnQ.splice(i, 1); } }
    if (R.wave && R.state === 'run' && !spawnQ.some(q => !q.early) && !bots.some(o => !o.dead && !o.early)) { if (!R.next) R.next = R.wave < 4 ? 1.5 : 2; R.next -= dt; if (R.next <= 0) { R.next = 0; if (R.wave < 4) startWave(R.wave + 1); else duelPhase(); } }
    updBots(dt, sp); updDuel(dt); bonuses(dt);
    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; b.life -= dt; b.m.position.addScaledVector(b.v, dt); const p = b.m.position; let end = b.life <= 0 || p.y < 0.05;
      if (!end && Math.hypot(p.x - C.x, p.z - C.z) < Sp.r && p.y < C.y + 3.2) { tankHit(b.dmg); b.hitT = true; end = true; }
      if (!end) for (const o of X.props) if ((o.solid || (o.kind === 'sandbag' && !o.dead)) && p.y < o.h && Math.hypot(p.x - o.x, p.z - o.z) < o.r * 0.6) { if (o.kind === 'sandbag') X.damage(o, 4, 'bolt'); end = true; break; }
      if (end) { X.puff(p, 0xff8a6a, 4, 2, 0.4, 0.25, true); if (b.big) { X.boom(tmp.set(p.x, 0.5, p.z), 2.6, 0xffb347); X.St.shake = Math.max(X.St.shake, 0.35); if (!b.hitT && Math.hypot(p.x - C.x, p.z - C.z) < 4) tankHit(8); } scene.remove(b.m); bolts.splice(i, 1); } }
    for (let i = lobs.length - 1; i >= 0; i--) { const b = lobs[i]; b.t += dt; const u = Math.min(1, b.t / b.dur); b.m.position.set(b.x0 + (b.x1 - b.x0) * u, b.y0 + (0 - b.y0) * u + Math.sin(u * Math.PI) * 9, b.z0 + (b.z1 - b.z0) * u); b.disc.material.opacity = 0.25 + u * 0.35; if (Math.random() < 0.7) X.puff(b.m.position, 0xffb347, 1, 0.5, 0.6, 0.4, true);
      if (u >= 1) { X.boom(tmp.set(b.x1, 0.5, b.z1), 3); if (Math.hypot(C.x - b.x1, C.z - b.z1) < 3.4) tankHit(14); scene.remove(b.m, b.disc); lobs.splice(i, 1); } }
    guide(dt, sp);
    // debris
    for (let i = debris.length - 1; i >= 0; i--) { const d = debris[i]; d.t -= dt; d.v.y -= 20 * dt; d.m.position.addScaledVector(d.v, dt); if (d.m.position.y < 0.1) { d.m.position.y = 0.1; d.v.multiplyScalar(0.45); d.v.y = Math.abs(d.v.y) * 0.3; d.s.multiplyScalar(0.6); } d.m.rotation.x += d.s.x * dt; d.m.rotation.y += d.s.y * dt; d.m.rotation.z += d.s.z * dt; if (d.t <= 0) { scene.remove(d.m); debris.splice(i, 1); } }
  }
  function updBots(dt, sp) {
    const C = X.C, Sp = S();
    for (const o of bots) { if (o.gone) continue; o.t += dt; const g = o.g, D = o.D, dx = C.x - o.x, dz = C.z - o.z, d = Math.hypot(dx, dz), want = Math.atan2(dx, dz);
      fx.pre(g);
      if (o.st === 'die') { ck.animate(g, 'die', o.t, dt, {}); fx.post(g, dt); if (o.t > 1.3) { o.gone = true; X.boom(tmp.set(o.x, o.y + 1, o.z), 1.6 + D.sc * 1.6, 0xffb347); bits(o.x, o.y, o.z, ['#5b5f66', '#2b2f36', '#38bdf8'], D.sc > 1 ? 16 : 7, 0, 0, 0.3 * D.sc + 0.2); scene.remove(g, o.bar); } continue; }
      const turn = (rate) => { const df = Math.atan2(Math.sin(want - o.face), Math.cos(want - o.face)); o.face += clamp(df, -rate * dt, rate * dt); };
      let mv = 0, anim = o.st;
      if (o.st === 'spawn') { anim = 'idle'; if (o.t > 1.1) setSt(o, 'idle'); }
      else if (R.down > 0 || R.state !== 'run') { anim = 'idle'; }
      else if (o.type === 'drone') { if (o.st === 'idle' || o.st === 'move') { turn(6); const reach = Sp.r + o.r * 0.6; if (d > reach + 0.4) { mv = D.spd; o.st = 'move'; } else setSt(o, 'attack'); }
        else if (o.st === 'attack') { turn(6); if (o.t > 0.35 && !o.hit) { o.hit = true; if (d < Sp.r + o.r * 0.6 + 1.2) tankHit(4); } if (o.t > 0.45) { o.hit = false; setSt(o, 'recover'); } }
        else if (o.st === 'recover') { mv = -2; if (o.t > 0.5) setSt(o, 'move'); }
        if (sp > 5 && d < Sp.r + o.r * 0.6 + 0.35 && o.st !== 'die') { X.popup(tmp.set(o.x, 4.6, o.z), 'RAMMED', '#ec3013'); X.damage(o, 18, 'ram'); o.x -= dx / (d || 1) * 2.5; o.z -= dz / (d || 1) * 2.5; } }
      else if (o.type === 'sentry' || o.type === 'turret') { turn(2.4); o.cd -= dt; if (o.st === 'idle' && o.cd <= 0 && d < (o.type === 'turret' ? 60 : 48) && (o.type !== 'turret' || R.seen.has('landed'))) { setSt(o, 'windup'); o.aim = o.face; o.tx = C.x; o.tz = C.z; }
        if (o.st === 'windup') { o.aim = Math.atan2(o.tx - o.x, o.tz - o.z); lane(o, 0.5, 0xff3b1f, Math.hypot(o.tx - o.x, o.tz - o.z)); o.lane.position.y = 0.06; o.lane.material.opacity = 0.25 + 0.35 * Math.sin(o.t * 20) ** 2; if (o.t > 0.85) { setSt(o, 'attack'); o.shots = 0; o.lane.visible = false; } }
        else if (o.st === 'attack') { if (o.shots < (o.type === 'turret' ? 2 : 3) && o.t > o.shots * 0.14) { fireBolt(o, o.tx + rr(-0.6, 0.6), o.tz + rr(-0.6, 0.6)); o.shots++; } if (o.t > 0.5) { setSt(o, 'recover'); o.cd = o.type === 'turret' ? rr(2.6, 3.6) : rr(2.0, 3.0); } }
        else if (o.st === 'recover' && o.t > 0.6) setSt(o, 'idle'); anim = o.st === 'idle' ? 'idle' : o.st; }
      else if (o.type === 'charger') { o.cd -= dt;
        if (o.st === 'idle' || o.st === 'move') { turn(3); if (d > 20) { mv = D.spd; o.st = 'move'; } else if (o.cd <= 0) { setSt(o, 'windup'); o.aim = want; X.audio.tone(90, 0.8, 0.05, 'sawtooth', 2.4); } else { o.st = 'idle'; } }
        else if (o.st === 'windup') { o.face = damp(o.face, o.aim, 10, dt); lane(o, 3.0, 0xff8a1a, 28); o.lane.material.opacity = 0.25 + 0.3 * Math.sin(o.t * 16) ** 2; if (o.t > 0.95) { setSt(o, 'attack'); o.lane.visible = false; o.hitT = false; } }
        else if (o.st === 'attack') { const v = 20; o.x += Math.sin(o.aim) * v * dt; o.z += Math.cos(o.aim) * v * dt; if (Math.random() < 0.6) X.puff(tmp.set(o.x, 0.3, o.z), 0xb8a77a, 1, 2, 0.9, 0.5);
          if (!o.hitT && d < Sp.r + 1.8) { o.hitT = true; tankHit(16, Math.sin(o.aim) * 1.6, Math.cos(o.aim) * 1.6); C.speed *= -0.3; setSt(o, 'recover'); }
          else { let wall = null; for (const s of X.props) if (s.solid && Math.hypot(s.x - o.x, s.z - o.z) < s.r * 0.6 + 1.2) { wall = s; break; } if (wall) { setSt(o, 'stun'); o.dmgK = 2; X.St.shake = Math.max(X.St.shake, 0.3); X.popup(tmp.set(o.x, 3.4, o.z), 'STUNNED · HIT IT!', '#ffd23a'); X.audio.burst(0.3, 600, 0.3); X.puff(tmp.set(o.x, 1.4, o.z), 0xffd23a, 8, 3, 0.4, 0.4, true); } else if (o.t > 1.4) setSt(o, 'recover'); } }
        else if (o.st === 'stun') { if (Math.random() < 0.3) X.puff(tmp.set(o.x + rr(-1, 1), 2.4, o.z + rr(-1, 1)), 0xffd23a, 1, 0.5, 0.3, 0.4, true); if (o.t > 2.2) { o.dmgK = 1; setSt(o, 'idle'); o.cd = rr(1.5, 2.5); } }
        else if (o.st === 'recover') { if (o.t > 1.0) { setSt(o, 'idle'); o.cd = rr(1.6, 2.6); } } }
      else if (o.type === 'warden') { o.cd -= dt; o.lobCd -= dt;
        if (o.st === 'idle' || o.st === 'move') { turn(1.6); if (d < 9.5 && o.cd <= 0) { setSt(o, 'windup'); o.slam = true; if (!o.ring) { o.ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(o.ring); } o.ring.visible = true; X.audio.tone(80, 1, 0.06, 'sawtooth', 0.6); }
          else if (d > 12 && o.lobCd <= 0) { setSt(o, 'windup'); o.slam = false; o.lx = C.x + Math.sin(C.yaw) * C.speed * 0.9; o.lz = C.z + Math.cos(C.yaw) * C.speed * 0.9; }
          else if (d > 8.5) { mv = D.spd; o.st = 'move'; } else o.st = 'idle'; }
        else if (o.st === 'windup') { turn(1.2); if (o.slam) { o.ring.position.set(o.x, 0.06, o.z); o.ring.material.opacity = 0.3 + 0.4 * Math.sin(o.t * 14) ** 2; }
          if (o.t > (o.slam ? 1.0 : 0.6)) { setSt(o, 'attack'); if (o.slam) { o.ring.visible = false; X.boom(tmp.set(o.x, 0.4, o.z), 8, 0xffffff); X.ripple(o.x, o.z, 8.5, 0.9); X.St.shake = Math.max(X.St.shake, 0.8); if (d < 8.2) tankHit(22, dx / (d || 1) * 2.4, dz / (d || 1) * 2.4); o.cd = 2.8; }
            else { const disc = new THREE.Mesh(discGeo, new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.25, depthWrite: false })); disc.position.set(o.lx, 0.06, o.lz); scene.add(disc); const m = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 10), new THREE.MeshBasicMaterial({ color: 0xff8a1a })); scene.add(m); lobs.push({ m, disc, x0: o.x, y0: o.D.h, z0: o.z, x1: o.lx, z1: o.lz, t: 0, dur: 1.2 }); o.lobCd = rr(3.5, 4.5); X.audio.tone(200, 0.3, 0.05, 'sawtooth', 0.6); } } }
        else if (o.st === 'attack') { if (o.t > 0.45) setSt(o, 'recover'); }
        else if (o.st === 'recover') { if (o.t > (o.slam ? 1.1 : 0.4)) setSt(o, 'idle'); } }
      if (mv) { o.x += Math.sin(o.face) * mv * dt; o.z += Math.cos(o.face) * mv * dt; }
      if (!o.y) { for (const s of X.props) { if (s === o || s.dead || !(s.solid || s.kind === 'bot')) continue; const ex = o.x - s.x, ez = o.z - s.z, e = Math.hypot(ex, ez), mn = o.r * 0.6 + s.r * 0.6; if (e < mn && e > 0.001) { const k = s.kind === 'bot' ? 0.5 : 1; o.x = s.x + ex / e * (s.kind === 'bot' ? e + (mn - e) * k : mn); o.z = s.z + ez / e * (s.kind === 'bot' ? e + (mn - e) * k : mn); } }
        const e2 = Math.hypot(o.x - C.x, o.z - C.z), mn2 = Sp.r + o.r * 0.6; if (e2 < mn2 && e2 > 0.001) { o.x = C.x + (o.x - C.x) / e2 * mn2; o.z = C.z + (o.z - C.z) / e2 * mn2; }
        fence(o, o.r * 0.6); }
      g.position.x = o.x; g.position.z = o.z; if (o.st !== 'spawn') g.position.y = o.y; g.rotation.y = o.face;
      ck.animate(g, anim === 'move' ? 'move' : anim === 'stun' ? 'stagger' : anim, o.t, dt, { speed: mv ? 1 : 0 }); fx.post(g, dt);
      o.bar.position.set(o.x, o.y + D.h + 0.9, o.z); o.bf.scale.x = o.bw * Math.max(0, o.hp / o.max); }
  }
  function grade(s) { return s >= 4800 ? 'S' : s >= 3800 ? 'A' : s >= 2600 ? 'B' : 'C'; }
  function finish() { R.state = 'done'; const tb = Math.max(0, Math.round((600 - R.t) * 2)); const total = R.score + tb - R.deaths * 150; let best = null; try { best = JSON.parse(localStorage.getItem(TANK_RANGE.bestKey) || 'null'); } catch (e) {} const nb = !best || total > best.score; if (nb) try { localStorage.setItem(TANK_RANGE.bestKey, JSON.stringify({ score: total, time: Math.round(R.t), grade: grade(total) })); } catch (e) {}
    R.done = { time: Math.round(R.t), tokens: R.tokens, totalTokens: R.totalTokens, kills: R.kills, totalBots: R.totalBots, targets: R.targets, totalTargets: R.totalTargets, deaths: R.deaths, duel: R.duelT, clean: R.clean, pivot: R.pivot, base: R.score, timeBonus: tb, total, grade: grade(total), best: nb ? total : best.score, newBest: nb }; say('Outstanding, recruit!'); cheer(); X.audio.tone(523, 0.2, 0.06, 'triangle', 1); setTimeout(() => X.audio.tone(659, 0.2, 0.06, 'triangle', 1), 160); setTimeout(() => X.audio.tone(784, 0.4, 0.06, 'triangle', 1), 320); }
  return {
    start, onSmash, update, press, get boardURL() { return HG.boardURL; }, get boardURLP() { return HG.boardURLP; }, get coinP() { return coinP; },
    hud: () => ({ state: R.state, hp: Math.round(R.hp), tokens: R.tokens, totalTokens: R.totalTokens, kills: R.kills, totalBots: R.totalBots, time: Math.floor(R.t), score: R.score, banner: R.bannerT > 0 ? R.banner : '', wave: R.wave, hurt: Math.round(R.hurt * 10) / 10, board: R.board, done: R.done, low: R.hp < 30, rk: R.rk, rkMax: RK_MAX, turbo: R.turbo,
      quest: DU.on ? (DU.st === 'wait' ? 'Duel · drive into the ring north of the pit' : DU.st === 'beaten' ? 'Duel won' : 'Duel · beat SGT. TREAD') : R.wave ? 'Wave ' + R.wave + ' / 4 · wreck the robots' : 'Follow the lamps · wreck robots · beat 2 Wardens · grab tokens', radio: R.radio || '',
      duel: DU.on && DU.st !== 'wait' ? { pct: Math.max(0, Math.round(duelO.hp / duelO.max * 100)), st: DU.st } : null,
      goal: (() => { const g = R.goal; if (!g || R.state !== 'run' || R.board) return null; const v = tmp.set(g.x, 3, g.z).project(X.camera); return { nx: Math.round(v.x * 1000) / 1000, ny: Math.round(v.y * 1000) / 1000, behind: v.z > 1, dist: Math.round(R.gd || 0), label: g.label }; })() }),
    full: () => R.rk >= RK_MAX && R.turbo >= TB_MAX, refill() { R.rk = RK_MAX; R.turbo = TB_MAX; }, addRk(n) { R.rk = Math.min(RK_MAX, R.rk + n); },
    armour: () => R.hp, heal(n) { if (R.hp >= 100) return 0; const a = Math.min(100, R.hp + n) - R.hp; R.hp += a; X.popup(tmp.set(X.C.x, 3, X.C.z), 'ARMOUR +' + Math.round(a), '#22c55e'); return a; }, say(s) { banner(s, 2.5); },
    map: () => ({ b: BOARDS.map(B => ['Board', B.x, B.z]), l: lamps.filter(l => l.st !== 'down').map(l => [l.x, l.z]), t: tokens.filter(k => !k.got && k.kind === 'coin').map(k => [k.x, k.z]), e: [...bots.filter(o => !o.dead && !o.gone).map(o => [o.x, o.z]), ...(DU.on && DU.st !== 'beaten' ? [[duelO.x, duelO.z]] : [])], q: R.goal ? [R.goal.x, R.goal.z, R.goal.label] : null, r: PATH, g: R.goal ? [R.goal.x, R.goal.z] : null }),
    rollOut() { R.board = false; X.setPaused(false); if (R.state === 'ready') { R.state = 'run'; banner('ROLL OUT! FOLLOW THE LAMPS', 3); X.audio.init && X.audio.init(); } },
    closeBoard() { R.board = false; X.setPaused(false); },
    openBoard() { R.board = true; X.setPaused(true); },
    reset() { const p = R.cp || start; X.place(p.x, p.z, p.yaw); },
    _killAll() { for (const o of bots) if (!o.dead) X.damage(o, 9999, 'test'); },
    _skipTo(n) { R.state = 'run'; R.board = false; X.setPaused(false); if (n === 'duel') { X.place(0, 452, 0); duelPhase(); return; } X.place(0, 252, 0); if (n) startWave(n); },
    _duel() { return { st: DU.st, mode: DU.mode, hp: duelO.hp, x: duelO.x, z: duelO.z }; },
  };
}
