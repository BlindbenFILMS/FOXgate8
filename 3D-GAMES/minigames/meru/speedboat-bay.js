// 8 GATES — MERU · SPEEDBOAT BAY [meruSpeedboatBay]. Stand-alone minigame on the shared driving engine (vehicle-lab.js, opts.course + opts.lake).
// Course: boathouse slip + jetty blackboard + the MERU FISHERMAN → 1 BUOY SLALOM → 2 POWER-TURN RING → 3 RAMP JUMPS (sandbars) → 4 TORPEDO TARGETS → 5 BEACH SHALLOWS → ROBOT BOAT WAVES → 6 RIVAL RACE (3 laps, top 2 to pass).
// Robots are the Gate Guard family (Sink Sentry riders on grey jet skis; Sink Sentry pontoon turrets).
import { save } from '../../engine/save.js';
import { creatureKit } from '../../engine/creature-kit.js';
import { creatureFx } from '../../engine/creature-fx.js';
import { bakeCreature } from '../../engine/bake.js';
import { buildBoathouse, BH } from './bay-boathouse.js';

export const SPEEDBOAT_BAY = { name: 'SPEEDBOAT BAY', room: 'meruSpeedboatBay', bestKey: 'meru.speedboatBay.best.v1' };
export const BAY_LAKE = { x0: -220, x1: 220, z0: -60, z1: 400, amp: 1.5, seg: 80 };

export function speedboatBay(X) {
  const { THREE, scene, M, toon, rr, clamp, damp } = X, LK = BAY_LAKE;
  const ck = creatureKit({ THREE, toon, M }), fx = creatureFx(THREE), tmp = new THREE.Vector3(), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const R = { t: 0, score: 0, tokens: 0, totalTokens: 0, kills: 0, totalBots: 0, targets: 0, totalTargets: 0, deaths: 0, hp: 100, hurt: 0, banner: '', bannerT: 0, wave: 0, next: 0, state: 'ready', board: true, armed: false, done: null, down: 0, seen: new Set(), cp: null, torp: 4, nitro: 2, pt: null, ptCd: 0, tCd: 0, ring: false, slalomHits: 0, race: null, tries: 0, place: 0, ramCd: 0 };
  const ink = toon('#201e1d'), red = toon('#ec3013'), white = toon('#f3f2f2'), steel = toon('#5b5f66'), dark = toon('#2b2f36'), sand = toon('#e8d5a3'), wood = toon('#8a5a32');
  const SPR = (mat, p, s) => { const sp = new THREE.Sprite(mat); if (p) sp.position.copy(p); if (s) sp.scale.copy(s); return sp; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const glow = (col, op = 0.8) => new THREE.SpriteMaterial({ map: X.glowTex, color: col, transparent: true, depthWrite: false, opacity: op, blending: THREE.AdditiveBlending });
  const banner = (s, t = 3.5) => { R.banner = s; R.bannerT = t; };
  const W = (x, z) => X.waveH(x, z, X.St.t), S = () => X.V.spec;
  const touch = X.touch, Q = (x, z) => [x * 2, z * 2 + 60];
  X.camera.far = 900; X.camera.updateProjectionMatrix();

  // ---------- sky, shore, far hills ----------
  scene.background = new THREE.Color('#cfe6ef'); scene.fog = new THREE.Fog(0xcfe6ef, 180, 560);
  X.sun.intensity = 2.4;
  const grass = toon('#8fbf6a'), noOut = m => { m.castShadow = false; return m; };
  for (const [x, z, w, d, mat] of [[0, LK.z0 - 60, 760, 120, sand], [0, LK.z1 + 60, 760, 120, grass], [LK.x0 - 80, (LK.z0 + LK.z1) / 2, 160, LK.z1 - LK.z0, grass], [LK.x1 + 80, (LK.z0 + LK.z1) / 2, 160, LK.z1 - LK.z0, grass]]) noOut(M(new THREE.BoxGeometry(w, 1, d), mat, x, 0, z, null, 0));
  for (const [x, z, w, d] of [[0, LK.z1 + 3, LK.x1 - LK.x0 + 12, 6], [LK.x0 - 3, (LK.z0 + LK.z1) / 2, 6, LK.z1 - LK.z0 + 12], [LK.x1 + 3, (LK.z0 + LK.z1) / 2, 6, LK.z1 - LK.z0 + 12]]) noOut(M(new THREE.BoxGeometry(w, 1.04, d), sand, x, 0, z, null, 0));
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2 + rr(-0.1, 0.1), d = rr(380, 420), h = rr(26, 56), m = M(new THREE.CylinderGeometry(rr(14, 24), rr(26, 38), h, 7), toon(i % 3 ? '#7fa36a' : '#6b8f5c'), Math.cos(a) * d, h / 2, 170 + Math.sin(a) * d, null, 0); noOut(m); }
  { const trunk = toon('#7a4f2a'), leaf = [toon('#4f8a3c'), toon('#5f9e46')]; for (let i = 0; i < 54; i++) { const side = i % 3, t = rr(0, 1); let x, z; if (side === 0) { x = rr(LK.x0 + 5, LK.x1 - 5); z = LK.z1 + rr(8, 22); } else { x = (side === 1 ? LK.x0 - rr(8, 22) : LK.x1 + rr(8, 22)); z = LK.z0 + t * (LK.z1 - LK.z0); } const h = rr(3, 5); noOut(M(new THREE.CylinderGeometry(0.25, 0.35, h, 6), trunk, x, h / 2 + 0.5, z, null, 0)); noOut(M(new THREE.SphereGeometry(rr(1.8, 2.6), 8, 6), leaf[i % 2], x, h + 1.6, z, null, 0)); } }
  // beach umbrellas (red/white) on the sand by the boathouse
  for (const [x, z] of [[-34, -70], [-48, -66], [26, -72], [40, -67], [58, -70]]) { noOut(M(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), ink, x, 2, z, null, 0)); const u = noOut(M(new THREE.ConeGeometry(1.8, 0.8, 8), toon((x * 7) % 2 ? '#ec3013' : '#f3f2f2'), x, 3.6, z, null, 0.02)); }

  // ---------- props helpers ----------
  function solid(x, z, r, h = 3) { const o = { kind: 'block', solid: true, noAim: true, noRespawn: true, g: new THREE.Group(), x, z, r: r / 0.6, h, hp: 1e9, home: [x, z] }; X.props.push(o); return o; }
  function custom(kind, g, x, z, r, h, hp, extra = {}) { g.position.set(x, 0, z); scene.add(g); const o = Object.assign({ kind, custom: true, noRespawn: true, g, sq: g, x, z, r, h, hp, max: hp, home: [x, z] }, extra); X.props.push(o); return o; }

  // ---------- BOATHOUSE (start: the boat sits in the slip) + BLACKBOARD: minigames/meru/bay-boathouse.js (also mounted in the Meru 2 boathouse) ----------
  // ---------- JETTY + BLACKBOARD + THE FISHERMAN ----------
  const JX = -16, JZ0 = -64, JZ1 = -24;
  { const plank = toon('#b07a4a'); M(new THREE.BoxGeometry(3.6, 0.3, JZ1 - JZ0), plank, JX, 1.2, (JZ0 + JZ1) / 2, null, 0.02); for (let z = JZ0 + 1; z <= JZ1; z += 4) for (const sx of [-1, 1]) M(new THREE.CylinderGeometry(0.2, 0.2, 3, 6), wood, JX + sx * 1.6, 0.2, z, null, 0);
    for (let z = JZ0 + 1; z <= JZ1; z += 2.4) solid(JX, z, 1.6, 2);
    for (const z of [-50, -38]) M(new THREE.TorusGeometry(0.35, 0.12, 6, 14), red, JX + 1.85, 0.9, z, null, 0.01).rotation.y = Math.PI / 2; }
  const HB = buildBoathouse({ THREE, M, toon, glowTex: X.glowTex, grad: X.grad, scene, solid, boardAt: { x: JX, y: 1.35, z: JZ1 + 1.5, yaw: Math.PI / 2 + 0.35 } }), { BD, coinP } = HB;
  // the MERU FISHERMAN (same look as the Lake zone: worlds/meru-lake.js)
  const fisher = X.kit.makeFox({ ...X.CAST.player, torso: ['#d4b896', '#b8956a', '#7a5c38'], outfit: 'vest', crest: '8', gear: 'none', mood: 'warm' }); fisher.position.set(JX + 0.4, 1.35, BD.z - 4.2); fisher.rotation.y = Math.PI / 2; scene.add(fisher); const FY = fisher.position.y;
  const bubCv = document.createElement('canvas'); bubCv.width = 768; bubCv.height = 160; const bubTex = new THREE.CanvasTexture(bubCv); bubTex.colorSpace = THREE.SRGBColorSpace;
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthTest: false })); bub.scale.set(6, 1.25, 1); bub.position.set(JX + 0.4, 5.1, BD.z - 4.2); bub.renderOrder = 9; scene.add(bub); let bubText = '';
  function say(s) { if (s === bubText) return; bubText = s; const g = bubCv.getContext('2d'); g.clearRect(0, 0, 768, 160); g.font = '800 40px Archivo, sans-serif'; const w = Math.min(760, g.measureText(s).width + 56); g.fillStyle = '#f3f2f2'; g.fillRect(4, 4, w - 8, 112); g.lineWidth = 6; g.strokeStyle = '#201e1d'; g.strokeRect(4, 4, w - 8, 112); g.beginPath(); g.moveTo(40, 116); g.lineTo(70, 116); g.lineTo(44, 150); g.closePath(); g.fillStyle = '#201e1d'; g.fill(); g.textBaseline = 'middle'; g.fillText(s, 28, 62); bubTex.needsUpdate = true; }
  say('Read the board, skipper!');
  let hop = 0; const cheer = () => { hop = 1; };

  // ---------- the course line: lanterns on piles + red/white buoy lines ----------
  const PATH = [[0, -38], [0, 360], [60, 380], [150, 360], [150, 184], [144, 60], [80, 8]];
  function along(step, fn) { for (let i = 0; i < PATH.length - 1; i++) { const [ax, az] = PATH[i], [bx, bz] = PATH[i + 1], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, n = Math.max(1, Math.round(L / step)); for (let k = 0; k < n; k++) { const s = (k + 0.5) * L / n; fn(ax + ux * s, az + uz * s, ux, uz); } } }
  const lanterns = [], lb = [], lampSpr = [];
  along(24, (x, z, ux, uz) => { for (const sd of [-1, 1]) lanterns.push([x + uz * sd * 42, z - ux * sd * 42]); });
  along(8, (x, z, ux, uz) => { for (const sd of [-1, 1]) lb.push({ x: x + uz * sd * 36, z: z - ux * sd * 36, p: rr(0, 6) }); });
  { const n = lanterns.length, o3 = new THREE.Object3D(), pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.12, 0.16, 5.4, 6), ink, n), cap = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.6, 0.55), red, n);
    lanterns.forEach(([x, z], i) => { o3.position.set(x, 2.0, z); o3.updateMatrix(); pole.setMatrixAt(i, o3.matrix); o3.position.set(x, 4.5, z); o3.updateMatrix(); cap.setMatrixAt(i, o3.matrix); const sp = SPR(glow(0xffd98a, 0.85), V3(x, 4.6, z), V3(2, 2, 1)); scene.add(sp); lampSpr.push({ sp, x, z }); });
    scene.add(pole, cap); }
  const lbMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: X.grad }), lb.length), lbO = new THREE.Object3D();
  { const cR = new THREE.Color('#ec3013'), cW = new THREE.Color('#f3f2f2'); lb.forEach((b, i) => lbMesh.setColorAt(i, i % 4 < 2 ? cR : cW)); scene.add(lbMesh); }
  // big buoys (slalom + ring): rock on the swell, shove when hit, spring home
  const BUOYS = [];
  function bigBuoy(x, z, col, kind, sc = 1) { const g = new THREE.Group(); scene.add(g); M(new THREE.CylinderGeometry(0.7 * sc, 0.9 * sc, 1.3 * sc, 12), toon(col), 0, 0.3 * sc, 0, g, 0.03); M(new THREE.CylinderGeometry(0.92 * sc, 0.92 * sc, 0.25 * sc, 12), white, 0, 0.55 * sc, 0, g, 0); M(new THREE.ConeGeometry(0.5 * sc, 1.1 * sc, 10), toon(col), 0, 1.5 * sc, 0, g, 0.02); M(new THREE.SphereGeometry(0.18 * sc, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd23a }), 0, 2.15 * sc, 0, g, 0); const b = { g, x, z, hx: x, hz: z, vx: 0, vz: 0, wob: 0, kind, r: 1 * sc, hitCd: 0 }; BUOYS.push(b); return b; }
  [[6, -12], [-6, -2], [6, 8], [-6, 18], [6, 28]].forEach(([x, z]) => bigBuoy(...Q(x, z), '#ec3013', 'slalom', 1.2));
  const RING = { x: 0, z: 156, r: 16 }; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, cz = Math.sin(a); if (Math.abs(Math.cos(a)) < 0.25) continue; bigBuoy(RING.x + Math.cos(a) * RING.r, RING.z + cz * RING.r, '#ffd23a', 'ring', 0.8); }
  // floating section signs (red square + white name), facing the boat as it comes up the lane
  function sign(n, s, x, z, yaw = Math.PI) { const t = CT(1024, 256, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(16, 16, 224, 224); g.fillStyle = '#f3f2f2'; g.font = '900 170px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(n, 70, 136); g.font = '900 104px Archivo, sans-serif'; g.fillText(s, 272, 136); }); const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw; scene.add(g);
    for (const sx of [-12, 12]) { for (let k = 0; k < 7; k++) M(new THREE.CylinderGeometry(0.4, 0.4, 1.1, 10), k % 2 ? white : red, sx, -0.4 + k * 1.1, 0, g, 0.015); g.add(SPR(glow(0xffd98a, 0.85), V3(sx, 7.6, 0), V3(2.4, 2.4, 1))); }
    M(new THREE.BoxGeometry(25, 0.7, 0.7), ink, 0, 7.0, 0, g, 0.02); const pm = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); pm.position.set(0, 5.4, 0); g.add(pm); return g; }
  sign('1', 'SLALOM', 0, 22); sign('2', 'RING', 0, 132); sign('3', 'RAMPS', 0, 180); sign('4', 'TARGETS', 0, 278); sign('5', 'SHALLOWS', 150, 338, 0); sign('6', 'ROBOTS', 148, 176, 0);

  // ---------- 3 RAMP JUMPS: floating ramps + sandbars ----------
  const BARS = [{ x: 0, z: 216, a: 22, b: 5 }, { x: 0, z: 260, a: 22, b: 5 }];
  for (const B of BARS) { const m = M(new THREE.SphereGeometry(1, 24, 10), sand, B.x, -0.2, B.z, null, 0); m.scale.set(B.a, 0.55, B.b); m.castShadow = false; for (let k = 0; k < 5; k++) M(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 4), toon('#6b8f3c'), B.x + rr(-10, 10), 0.6, B.z + rr(-2, 2), null, 0); }
  X.addRamp({ x: 0, z: 192, yaw: 0, w: 14, l: 6, h: 2.2, top: 0 }, '#c9a463'); X.addRamp({ x: 0, z: 236, yaw: 0, w: 14, l: 6, h: 2.4, top: 0 }, '#c9a463');
  // ---------- 5 BEACH SHALLOWS ----------
  const SH = { x0: 116, x1: 192, z0: 184, z1: 324 };
  { const st = CT(256, 256, (g, w, h) => { g.fillStyle = '#e8d5a3'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(160,130,80,0.5)'; g.lineWidth = 4; for (let y = 8; y < h; y += 22) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) g.lineTo(x, y + Math.sin(x * 0.08 + y) * 4); g.stroke(); } }); st.wrapS = st.wrapT = THREE.RepeatWrapping; st.repeat.set(5, 9);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(SH.x1 - SH.x0, SH.z1 - SH.z0), new THREE.MeshBasicMaterial({ map: st, transparent: true, opacity: 0.5, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set((SH.x0 + SH.x1) / 2, 0.08, (SH.z0 + SH.z1) / 2); m.renderOrder = 1; scene.add(m);
    for (let k = 0; k < 14; k++) { const x = k % 2 ? SH.x1 - rr(0, 3) : SH.x0 + rr(0, 3), z = rr(SH.z0, SH.z1); for (let j = 0; j < 4; j++) M(new THREE.CylinderGeometry(0.04, 0.05, rr(1, 1.8), 4), toon('#6b8f3c'), x + rr(-0.6, 0.6), 0.5, z + rr(-0.6, 0.6), null, 0); } }
  const inSh = (x, z) => x > SH.x0 && x < SH.x1 && z > SH.z0 && z < SH.z1;

  // ---------- pickups: 8-tokens, repair kits, nitro canisters, torpedo crates ----------
  const coinTex = CT(128, 128, (g) => { g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(64, 64, 62, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#a8792e'; g.beginPath(); g.arc(64, 64, 50, 0, 7); g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 72px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70); });
  coinTex.center.set(0.5, 0.5); coinTex.rotation = Math.PI / 2; const coinGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.16, 22); coinGeo.rotateX(Math.PI / 2); const faceM = new THREE.MeshBasicMaterial({ map: coinTex }), gold = toon('#e6b45a'), coinMats = [gold, faceM, faceM];
  const bcM = [gold.clone(), faceM.clone(), faceM.clone()]; bcM.forEach(m => { m.transparent = true; });
  const bCoins = []; for (const side of [1, -1]) { const c = new THREE.Mesh(coinGeo, bcM); c.scale.setScalar(0.24); c.position.set((1492 / 1600 - 0.5) * 6.4 * side, 3.3 + (0.5 - 746 / 900) * 3.6, 0.16 * side); HB.board.add(c); bCoins.push(c); }
  const tokens = [];
  function token(x, y, z, kind = 'coin') { const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
    if (kind === 'coin') { g.add(new THREE.Mesh(coinGeo, coinMats)); g.add(SPR(glow(0xffd23a, 0.55), null, V3(2.4, 2.4, 1))); R.totalTokens++; }
    else if (kind === 'wrench') { const gr = toon('#22c55e'); M(new THREE.BoxGeometry(0.28, 1.3, 0.2), gr, 0, 0, 0, g, 0.02); M(new THREE.TorusGeometry(0.32, 0.12, 6, 12, 4.6), gr, 0, 0.75, 0, g, 0.02).rotation.z = -0.75; g.add(SPR(glow(0x22c55e, 0.55), null, V3(2.6, 2.6, 1))); }
    else if (kind === 'nitro') { M(new THREE.CylinderGeometry(0.42, 0.42, 1.3, 12), toon('#38bdf8'), 0, 0, 0, g, 0.02); M(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 8), ink, 0, 0.8, 0, g, 0); M(new THREE.CylinderGeometry(0.44, 0.44, 0.2, 12), white, 0, 0.1, 0, g, 0); g.add(SPR(glow(0x38bdf8, 0.6), null, V3(2.6, 2.6, 1))); }
    else { M(new THREE.BoxGeometry(1.3, 0.8, 0.9), toon('#4d5a2a'), 0, 0, 0, g, 0.02); M(new THREE.BoxGeometry(1.32, 0.2, 0.92), red, 0, 0.1, 0, g, 0); g.add(SPR(glow(0xff8a1a, 0.55), null, V3(2.6, 2.6, 1))); }
    tokens.push({ g, x, y, z, kind, got: false, t: rr(0, 6), back: 0 }); }
  [[-3, -12], [3, -2], [-3, 8], [3, 18], [-3, 28], [0, -30]].forEach(([x, z]) => { const [a, b] = Q(x, z); token(a, 1.6, b); });
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; token(RING.x + Math.cos(a) * 8, 1.6, RING.z + Math.sin(a) * 8); }
  for (const B of BARS) for (let k = 0; k < 5; k++) token(0, 2.6 + Math.sin((k + 0.5) / 5 * Math.PI) * 2.6, B.z - 10 + k * 5);
  for (const [x, z] of [[-10, 116], [10, 124], [-6, 136], [8, 144], [12, 158], [32, 160], [52, 156]].map(([a, b]) => Q(a, b))) token(x, 1.6, z);
  for (let k = 0; k < 7; k++) token(150 + (k % 2 ? 8 : -8), 1.6, 316 - k * 20);
  for (const [x, z] of [[72, 40], [70, 20], [66, 0], [52, -14]].map(([a, b]) => Q(a, b))) token(x, 1.6, z);
  for (const [x, z] of [[-50, 10], [-74, 60], [-72, 110], [-40, 152], [38, 120], [38, 80], [34, 30]].map(([a, b]) => Q(a, b))) token(x, 1.6, z);
  token(-18, 1.6, -45); token(204, 1.6, 360);
  [[10, -30], [0, 96], [60, 156], [86, 6], [-60, 130]].forEach(([x, z]) => token(...Q(x, z).flatMap((v, i) => i ? [1.4, v] : [v]), 'nitro'));
  [[-10, -16], [0, 110], [70, 30], [28, -18]].forEach(([x, z]) => { const [a, b] = Q(x, z); token(a, 1.4, b, 'ammo'); });
  [[80, 96], [55, -6], [-75, 30]].forEach(([x, z]) => { const [a, b] = Q(x, z); token(a, 1.4, b, 'wrench'); });

  // ---------- 4 TORPEDO TARGETS: floating barrels, target boards, sentry pontoons ----------
  const tgtT = CT(256, 320, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.beginPath(); g.arc(128, 70, 52, 0, 7); g.fill(); g.fillRect(48, 130, 160, 170); g.lineWidth = 10; g.strokeStyle = '#f3f2f2'; for (const r of [120, 80, 40]) { g.beginPath(); g.arc(128, 215, r * 0.6, 0, 7); g.stroke(); } g.fillStyle = '#201e1d'; g.fillRect(96, 58, 22, 16); g.fillRect(138, 58, 22, 16); g.lineWidth = 8; g.strokeStyle = '#201e1d'; g.strokeRect(4, 4, w - 8, h - 8); });
  const floaters = [];
  for (const [x, z] of [[-12, 114], [12, 118], [-4, 128], [6, 134], [-14, 140], [14, 142]].map(([a, b]) => Q(a, b))) { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.7, 0.7, 1.6, 14), red, 0, 0.3, 0, g, 0.02); for (const y of [-0.1, 0.7]) M(new THREE.CylinderGeometry(0.72, 0.72, 0.2, 14), toon('#ffd23a'), 0, y, 0, g, 0); const o = custom('barrel', g, x, z, 1.2, 0.1, 8); floaters.push(o); R.totalTargets++; }
  for (const [x, z] of [[-8, 120], [8, 128], [0, 140], [-16, 130]].map(([a, b]) => Q(a, b))) { const g = new THREE.Group(), fl = new THREE.Group(); g.add(fl); M(new THREE.BoxGeometry(2.2, 0.4, 1.2), white, 0, 0.1, 0, g, 0.02); const pm = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.5), new THREE.MeshBasicMaterial({ map: tgtT, side: THREE.DoubleSide })); pm.position.y = 1.25; fl.add(pm); fl.position.y = 0.3; g.rotation.y = Math.PI; const o = custom('target', g, x, z, 1.4, 0.1, 1, { fl, down: 0 }); floaters.push(o); R.totalTargets++; }

  // ---------- robots ----------
  const BOT = { ski: { sc: 0.42, r: 1.6, hp: 30, pts: 60, label: 'ROBOT SKI' }, big: { sc: 0.55, r: 2.0, hp: 70, pts: 120, label: 'ROBOT RAM' }, sentry: { sc: 1.25, r: 2.2, hp: 60, pts: 80, label: 'SENTRY' } };
  const bots = [], spawnQ = [], bolts = [];
  const hpBg = new THREE.SpriteMaterial({ color: 0x201e1d, depthTest: false }), hpFg = new THREE.SpriteMaterial({ color: 0xec3013, depthTest: false });
  const laneGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0, 0, 0.5);
  const recolor = (g, map) => g.traverse(m => { if (m.isMesh && map.has(m.material)) m.material = map.get(m.material); });
  function spawnBot(type, x, z) { const D = BOT[type]; let g, rider = null;
    if (type === 'sentry') { g = new THREE.Group(); const pon = new THREE.Group(); g.add(pon); M(new THREE.BoxGeometry(4.2, 0.6, 4.2), steel, 0, 0, 0, pon, 0.03); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(4.24, 0.2, 0.3), toon('#ffd23a'), 0, 0.2, sx * 1.9, pon, 0); rider = ck.build('Sink Sentry'); rider.scale.multiplyScalar(D.sc); rider.position.y = 0.3; g.add(rider); solid(x, z, 2.0, 2); }
    else { g = X.vk.make('jetski'); recolor(g, new Map([[toon('#ec3013'), dark], [toon('#f3f2f2'), steel]])); g.scale.setScalar(1.56 * (type === 'big' ? 1.3 : 1)); rider = ck.build('Sink Sentry'); rider.scale.multiplyScalar(D.sc / 1.56); try { bakeCreature(THREE, rider); } catch (e) {} rider.position.copy(g.userData.V.seat); rider.position.y -= 0.1; g.userData.V.body.add(rider); }
    if (type === 'sentry') { try { bakeCreature(THREE, rider); } catch (e) {} }
    fx.attach(g);
    const bar = new THREE.Group(), bb = new THREE.Sprite(hpBg), bf = new THREE.Sprite(hpFg), bw = 3; bb.scale.set(bw + 0.1, 0.18, 1); bf.scale.set(bw, 0.12, 1); bf.center.set(0, 0.5); bf.position.x = -bw / 2; bb.renderOrder = bf.renderOrder = 8; bar.add(bb, bf); bar.visible = false; scene.add(bar);
    const o = custom('bot', g, x, z, D.r * 1.3, 0.1, D.hp, { type, D, rider, st: type === 'sentry' ? 'idle' : 'rise', t: 0, cd: rr(1, 2), bar, bf, bw, face: Math.atan2(X.C.x - x, X.C.z - z), spd: 0, wave: R.wave });
    o.onHit = () => { fx.hit(g); o.bar.visible = true; }; if (type === 'sentry') ck.enter(rider, 'idle'); bots.push(o); R.totalBots++;
    if (type !== 'sentry') { X.spray(tmp.set(x, 0.4, z), 12, 4); X.ripple(x, z, 4, 0.8); X.audio.burst(0.3, 600, 0.2); }
    return o; }
  const sentries = [[-18, 150], [18, 112]].map(([x, z]) => spawnBot('sentry', ...Q(x, z)));
  const boltGeo = new THREE.SphereGeometry(0.22, 10, 8), boltMat = new THREE.MeshBasicMaterial({ color: 0xff3b1f });
  function fireBolt(o) { const p = V3(o.x, 2.6, o.z), d = V3(X.C.x + rr(-0.8, 0.8), X.C.y + 1, X.C.z + rr(-0.8, 0.8)).sub(p).normalize(), m = new THREE.Mesh(boltGeo, boltMat); m.position.copy(p); m.add(SPR(glow(0xff3b1f, 0.9), null, V3(1.3, 1.3, 1))); scene.add(m); bolts.push({ m, v: d.multiplyScalar(28), life: 2.6, dmg: 5 }); X.audio.tone(1100, 0.07, 0.04, 'square', 0.5); }
  function boatHit(n, kx = 0, kz = 0) { if (R.state !== 'run' || R.down > 0) return; R.hp = Math.max(0, R.hp - n); R.hurt = 1; X.St.shake = Math.max(X.St.shake, 0.3 + n * 0.02); X.popup(tmp.set(X.C.x, X.C.y + 3.5, X.C.z), '-' + n, '#ec3013'); X.audio.burst(0.2, 500, 0.25); if (kx || kz) { X.C.x += kx; X.C.z += kz; }
    if (R.hp <= 0) { R.down = 2.6; R.deaths++; X.boom(tmp.set(X.C.x, 1, X.C.z), 3); banner('HULL BREACHED · BACK ON THE WATER IN 2 S', 2.6); X.C.speed = 0; } }
  const ZC = { x: 144, z: 96, r: 70 };
  const WAVES = [null, { name: 'ROBOT SKIS', list: () => ring(4).map(([x, z]) => ['ski', x, z]) }, { name: 'MORE SKIS', list: () => ring(5).map(([x, z]) => ['ski', x, z]) }, { name: 'THE RAMS', list: () => [...ring(2, 40).map(([x, z]) => ['big', x, z]), ...ring(4).map(([x, z]) => ['ski', x, z])] }];
  function ring(n, r = 50) { const a0 = rr(0, 6.3), out = []; for (let i = 0; i < n; i++) { const a = a0 + i / n * Math.PI * 2; out.push([clamp(ZC.x + Math.cos(a) * r, LK.x0 + 6, LK.x1 - 6), ZC.z + Math.sin(a) * r]); } return out; }
  function startWave(n) { R.wave = n; const Wv = WAVES[n]; banner('WAVE ' + n + ' / 3 · ' + Wv.name, 3); X.audio.tone(330, 0.3, 0.06, 'square', 1.5); setTimeout(() => X.audio.tone(495, 0.3, 0.06, 'square', 1.5), 180); Wv.list().forEach(([type, x, z], i) => spawnQ.push({ type, x, z, t: i * 0.4 + 0.6 })); R.cp = { x: 144, z: 140, yaw: Math.PI }; }

  // ---------- 6 RIVAL RACE ----------
  const GATES = [[28, 16], [-100, 80], [-150, 220], [-120, 350], [0, 376], [76, 340], [76, 180], [60, 60]], NG = GATES.length, LAPS = 2;
  const gateG = GATES.map(([x, z], i) => { const [nx, nz] = GATES[(i + 1) % NG], [px, pz] = GATES[(i + NG - 1) % NG], dx = nx - px, dz = nz - pz, l = Math.hypot(dx, dz), ux = dx / l, uz = dz / l, g = new THREE.Group(); scene.add(g); g.visible = false;
    for (const sd of [-1, 1]) { const x2 = x + uz * sd * 14, z2 = z - ux * sd * 14, p = new THREE.Group(); p.position.set(x2, 0, z2); g.add(p); for (let k = 0; k < 4; k++) M(new THREE.CylinderGeometry(0.3, 0.3, 1.1, 10), k % 2 ? white : red, 0, k * 1.1, 0, p, 0.012); scene.add(SPR(glow(0xffd98a, 0.85), V3(x2, 4.8, z2), V3(2.2, 2.2, 1))); }
    if (i === 0) { const ct = CT(256, 64, (g2) => { for (let a = 0; a < 16; a++) for (let b = 0; b < 4; b++) { g2.fillStyle = (a + b) % 2 ? '#201e1d' : '#f3f2f2'; g2.fillRect(a * 16, b * 16, 16, 16); } }); const fl = new THREE.Mesh(new THREE.PlaneGeometry(28, 1.2), new THREE.MeshBasicMaterial({ map: ct, side: THREE.DoubleSide })); fl.position.set(x, 4.4, z); fl.rotation.y = Math.atan2(ux, uz) + Math.PI / 2; g.add(fl); }
    return g; });
  const nextGlow = SPR(glow(0xffd23a, 0.9), V3(0, 3, 0), V3(5, 5, 1)); nextGlow.visible = false; scene.add(nextGlow);
  const g0 = GATES[0], g1 = GATES[1], gdx = g1[0] - g0[0], gdz = g1[1] - g0[1], gl = Math.hypot(gdx, gdz), GU = [gdx / gl, gdz / gl], GYAW = Math.atan2(GU[0], GU[1]);
  const slot = (back, side) => [g0[0] - GU[0] * back + GU[1] * side, g0[1] - GU[1] * back - GU[0] * side];
  const SLOTS = [slot(9, -4), slot(9, 4), slot(16, -4), slot(16, 4)];
  const RIVALS = [['RUE', '#38bdf8', 21.8], ['MARLO', '#a3e635', 20.8], ['TIDE', '#f472b6', 19.8]].map(([name, col, base], i) => {
    const g = X.makeVeh('boat'), Vv = g.userData.V, vs = Vv.spec.scale || 1; g.scale.setScalar(vs); const tint = new Map(); g.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material.color.getHexString() === 'ec3013') { if (!tint.has(m.material)) { const nm = m.material.clone(); nm.color.set(col); tint.set(m.material, nm); } m.material = tint.get(m.material); } });
    const f = X.kit.makeFox({ ...X.CAST.player, torso: [col, '#f3f2f2', '#201e1d'], outfit: 'vest', gear: 'none', crest: '', mood: 'determined' }); f.scale.multiplyScalar(1 / vs); f.position.copy(Vv.seatLocal || Vv.seat); (Vv.seatParent || Vv.body).add(f); const P = f.userData.P; if (P) { P.legs.forEach(l => l.rotation.x = -1.45); P.arms.forEach(a => a.rotation.x = -1.1); }
    g.visible = false; scene.add(g); return { name, g, V: Vv, f, base, x: 0, z: 0, yaw: GYAW, spd: 0, k: 0, off: (i - 1) * 3, done: 0, nit: 0 }; });
  const prog = (k, x, z) => { const nx = GATES[(k + 1) % NG], px = GATES[k % NG], L = Math.hypot(nx[0] - px[0], nx[1] - px[1]); return k + clamp(1 - Math.hypot(nx[0] - x, nx[1] - z) / L, 0, 1); };
  function raceGrid() { R.race = { st: 'count', c: 3.6, k: 0, fin: [], said: '' }; gateG.forEach(g => g.visible = true); RIVALS.forEach((r, i) => { const [x, z] = SLOTS[i + 1]; Object.assign(r, { x, z, yaw: GYAW, spd: 0, k: 0, done: 0 }); r.g.visible = true; }); X.place(SLOTS[0][0], SLOTS[0][1], GYAW); R.cp = { x: SLOTS[0][0], z: SLOTS[0][1], yaw: GYAW }; }
  const ord = n => n + (n === 1 ? 'ST' : n === 2 ? 'ND' : n === 3 ? 'RD' : 'TH');
  function racePlace() { const me = prog(R.race.k, X.C.x, X.C.z); return 1 + RIVALS.filter(r => r.done ? true : prog(r.k, r.x, r.z) > me).length; }

  // ---------- smash hook ----------
  function onSmash(o, by) {
    if (o.kind === 'barrel') { o.g.visible = false; R.targets++; R.score += 40; X.popup(tmp.set(o.x, 3, o.z), 'KABOOM +40', '#ff8a1a'); setTimeout(() => X.blast(V3(o.x, 0.8, o.z), 4.0, 80, false), 60); X.spray(tmp.set(o.x, 0.5, o.z), 14, 6); }
    else if (o.kind === 'target') { o.down = 0.001; R.targets++; R.score += 50; X.popup(tmp.set(o.x, 3.6, o.z), 'TARGET +50', '#ffd23a'); X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); }
    else if (o.kind === 'bot') { o.st = 'die'; o.t = 0; o.bar.visible = false; if (o.lane) o.lane.visible = false; R.kills++; R.score += o.D.pts; X.popup(tmp.set(o.x, 3.6, o.z), o.D.label + ' +' + o.D.pts, '#ffd23a'); cheer(); X.audio.tone(220, 0.3, 0.06, 'sawtooth', 0.5); }
    if (R.targets === R.totalTargets && !R.seen.has('allT')) { R.seen.add('allT'); R.score += 200; banner('ALL TARGETS DOWN · +200', 3); }
  }

  // ---------- weapons: the speedboat's own TORPEDO · POWER TURN · NITRO (engine/vehicle-fun.js), gated by course ammo ----------
  function press(n, down) { const C = X.C; if (R.state !== 'run' || R.down > 0 || (R.race && R.race.st === 'count')) return true;
    if (n === 1) { if (down) { if (R.torp <= 0) { X.popup(tmp.set(C.x, 3, C.z), 'NO TORPEDOES · GRAB CRATES', '#9ca3af'); return true; } R.t1 = X.St.t; return false; }
      if (R.torp <= 0 || R.tCd > 0) return R.torp <= 0; const spread = X.St.t - (R.t1 || 0) > 0.4; R.torp = Math.max(0, R.torp - (spread ? 2 : 1)); R.tCd = spread ? 1.6 : 0.6; return false; }
    if (n === 2) { if (down && C.ground && X.inLake(C.x, C.z) && R.ptCd <= 0) { R.ptCd = 0.8; if (Math.hypot(C.x - RING.x, C.z - RING.z) < RING.r - 1 && !R.ring) { R.ring = true; R.score += 100; banner('RING CLEAR · +100', 2.5); X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.4); } } return false; }
    if (!down) return false; if (C.nitroCd > 0) return true; if (R.nitro <= 0) { X.popup(tmp.set(C.x, 3, C.z), 'NO NITRO · GRAB CANISTERS', '#9ca3af'); return true; } R.nitro--; return false; }

  // ---------- zones ----------
  const ZONES = [['slalom', p => p.z > 16 && p.z < 124 && Math.abs(p.x) < 40, '1 · BUOY SLALOM: weave the big red buoys. Don\'t touch them', { x: 0, z: 8, yaw: 0 }], ['ring', p => Math.hypot(p.x - RING.x, p.z - RING.z) < RING.r, '2 · POWER-TURN RING: press 2 inside the ring', { x: 0, z: 128, yaw: 0 }], ['ramps', p => p.z > 176 && p.z < 272 && Math.abs(p.x) < 40, '3 · RAMP JUMPS: hit 3 = NITRO up the ramp and fly the sandbar', { x: 0, z: 172, yaw: 0 }], ['targets', p => p.z > 276 && p.z < 362 && Math.abs(p.x) < 44, '4 · TORPEDO TARGETS: 1 fires. Barrels go boom', { x: 0, z: 268, yaw: 0 }], ['shallows', p => inSh(p.x, p.z), '5 · BEACH SHALLOWS: slow going, big splash', { x: 150, z: 336, yaw: Math.PI }], ['robots', p => Math.hypot(p.x - ZC.x, p.z - ZC.z) < ZC.r && p.z < 172, 'ROBOT BOATS! Torpedo them or NITRO-ram them', { x: 144, z: 170, yaw: Math.PI }]];
  // ---------- GUIDANCE: next-goal arrow, faint yellow guide line, lit lamps, floating chevrons, wrong-way radio, off-course fog ----------
  const GOALS = [['slalom', 'SLALOM', 0, 22], ['ring', 'RING', RING.x, RING.z], ['ramps', 'RAMPS', 0, 186], ['targets', 'TARGETS', 0, 290], ['shallows', 'SHALLOWS', 150, 334], ['robots', 'ROBOTS', ZC.x, ZC.z + 40]];
  function goal() { const RC = R.race;
    if (RC) { if (RC.st !== 'go') return { x: GATES[0][0], z: GATES[0][1], label: RC.st === 'wait' ? 'START GATE' : 'START' }; const gi = (RC.k + 1) % NG; return { x: GATES[gi][0], z: GATES[gi][1], label: gi === 0 ? (RC.k + 1 >= NG * LAPS ? 'FINISH' : 'LAP LINE') : 'GATE ' + (gi + 1) + '/' + NG }; }
    if (R.wave) { let b = null, bd = 1e9; for (const o of bots) if (!o.dead && o.type !== 'sentry') { const d = Math.hypot(o.x - X.C.x, o.z - X.C.z); if (d < bd) { bd = d; b = o; } } return b ? { x: b.x, z: b.z, label: 'ROBOT' } : { x: ZC.x, z: ZC.z, label: 'ROBOTS' }; }
    for (const [k, label, x, z] of GOALS) if (k === 'ring' ? !(R.ring || R.seen.has('ramps')) : !R.seen.has(k)) return { x, z, label }; return { x: ZC.x, z: ZC.z, label: 'ROBOTS' }; }
  const segs = (pts, closed) => { const out = []; for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) out.push([pts[i], pts[(i + 1) % pts.length]]); return out; };
  const PSEG = segs(PATH, false), RSEG = segs(GATES, true);
  const dSeg = (S2, x, z) => { let m = 1e9; for (const [[ax, az], [bx, bz]] of S2) { const dx = bx - ax, dz = bz - az, u = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz), 0, 1); m = Math.min(m, Math.hypot(x - ax - dx * u, z - az - dz * u)); } return m; };
  const arrSh = new THREE.Shape([[-0.5, 1.6], [0.5, 1.6], [0.5, 0.6], [1.1, 0.6], [0, -0.8], [-1.1, 0.6], [-0.5, 0.6]].map(([a, b]) => new THREE.Vector2(a, b))), arrG = new THREE.ExtrudeGeometry(arrSh, { depth: 0.5, bevelEnabled: false }); arrG.translate(0, 0, -0.25);
  const nextArrow = new THREE.Group(); scene.add(nextArrow); M(arrG, new THREE.MeshBasicMaterial({ color: 0xffd23a }), 0, 0, 0, nextArrow, 0.06); nextArrow.add(SPR(glow(0xffd23a, 0.55), V3(0, 0.4, 0), V3(5, 5, 1))); nextArrow.scale.setScalar(2.2); nextArrow.visible = false;
  const GN = 28, gPos = new Float32Array((GN + 1) * 6), gUv = new Float32Array((GN + 1) * 4), gIdx = []; for (let i = 0; i < GN; i++) { const a = i * 2; gIdx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const gGeo = new THREE.BufferGeometry(); gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3)); gGeo.setAttribute('uv', new THREE.BufferAttribute(gUv, 2)); gGeo.setIndex(gIdx);
  const dashT = CT(64, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(4, 150); g.lineTo(32, 40); g.lineTo(60, 150); g.lineTo(60, 200); g.lineTo(32, 100); g.lineTo(4, 200); g.closePath(); g.fill(); }); dashT.wrapT = THREE.RepeatWrapping;
  const gMat = new THREE.MeshBasicMaterial({ map: dashT, transparent: true, opacity: 0.25, depthWrite: false, side: THREE.DoubleSide }), gLine = new THREE.Mesh(gGeo, gMat); gLine.frustumCulled = false; gLine.renderOrder = 3; gLine.visible = false; scene.add(gLine);
  const chevs = []; { const cT = CT(256, 256, (g) => { g.beginPath(); g.moveTo(28, 200); g.lineTo(128, 70); g.lineTo(228, 200); g.lineTo(228, 150); g.lineTo(128, 20); g.lineTo(28, 150); g.closePath(); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.stroke(); }), cM = new THREE.MeshBasicMaterial({ map: cT, transparent: true, depthWrite: false });
    along(40, (x, z, ux, uz) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.atan2(ux, uz); scene.add(g); M(new THREE.BoxGeometry(4.4, 0.25, 4.4), white, 0, 0, 0, g, 0.02); const p = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), cM); p.rotation.set(-Math.PI / 2, 0, Math.PI); p.position.y = 0.14; g.add(p); chevs.push({ g, x, z }); }); }
  function radio(s) { if (R.radioCd > 0) return; R.radio = s; R.radioT = 4.5; R.radioCd = 10; X.audio.tone(1800, 0.05, 0.04, 'square', 1); setTimeout(() => X.audio.tone(1400, 0.07, 0.04, 'square', 1), 90); }
  function guide(dt, sp) { const C = X.C, T = X.St.t, g = goal(); R.goal = g; R.radioT = Math.max(0, (R.radioT || 0) - dt); R.radioCd = Math.max(0, (R.radioCd || 0) - dt); if (R.radioT <= 0) R.radio = '';
    if (!touch || R.fr % 2) for (const ch of chevs) { ch.g.visible = !R.race; ch.g.position.y = W(ch.x, ch.z) + 0.1; ch.g.rotation.z = Math.sin(T * 1.4 + ch.x) * 0.08; }
    const live = R.state === 'run' && !R.board; gLine.visible = nextArrow.visible = false; if (!live) return;
    const dx = g.x - C.x, dz = g.z - C.z, gd = Math.hypot(dx, dz); R.gd = gd;
    nextArrow.visible = gd > 22; nextArrow.position.set(g.x, 8 + Math.sin(T * 3) * 0.6, g.z); nextArrow.rotation.y += dt * 1.6;
    const off = R.race ? dSeg(RSEG, C.x, C.z) : dSeg(PSEG, C.x, C.z); R.offK = damp(R.offK || 0, clamp((off - 40) / 30, 0, 1), 2, dt);
    const fx0 = Math.sin(C.yaw), fz0 = Math.cos(C.yaw), dot = gd > 1 ? (fx0 * dx + fz0 * dz) / gd : 1;
    if (gd > 30 && dot < -0.25 && sp > 3 && !(R.race && R.race.st === 'count')) R.wwT = (R.wwT || 0) + dt; else R.wwT = 0;
    // guide line: boat bow → goal, riding the waves
    if (gd > 12) { gLine.visible = true; const sx = C.x + fx0 * 4, sz = C.z + fz0 * 4, lx = g.x - sx, lz = g.z - sz, L = Math.hypot(lx, lz) || 1, px = lz / L * 0.8, pz = -lx / L * 0.8;
      for (let i = 0; i <= GN; i++) { const u = i / GN, x = sx + lx * u, z = sz + lz * u, y = W(x, z) + 0.3, v = u * L / 4 - T * 1.5; gPos.set([x - px, y, z - pz, x + px, y, z + pz], i * 6); gUv.set([0, v, 1, v], i * 4); }
      gGeo.attributes.position.needsUpdate = true; gGeo.attributes.uv.needsUpdate = true; gMat.opacity = damp(gMat.opacity, R.race ? 0.55 : clamp(0.22 + R.offK * 0.6 + (R.wwT > 1 ? 0.4 : 0), 0, 0.9), 4, dt); }
    // off course: fog rolls in, the water chops up, a gentle speed cap (free to roam)
    if (scene.fog) { scene.fog.near = 180 - R.offK * 130; scene.fog.far = 560 - R.offK * 360; }
    if (R.offK > 0.2) { if (Math.random() < R.offK * 0.5) X.spray(tmp.set(C.x + rr(-2, 2), 0.5, C.z + rr(-2, 2)), 2, 3); X.St.shake = Math.max(X.St.shake, 0.06 * R.offK); C.speed = Math.min(C.speed, S().max * (1 - 0.25 * R.offK)); }
    if (R.wwT > 3) { if (!(R.bannerT > 0.3 && R.banner.startsWith('WRONG'))) banner('WRONG WAY · ' + g.label + ' IS BEHIND YOU', 1.2); radio(R.race ? 'Wrong way, skipper! The gates are behind you!' : 'Turn around, skipper! ' + g.label.charAt(0) + g.label.slice(1).toLowerCase() + ' is behind you.'); }
    else if (R.offK > 0.6) { R.offT = (R.offT || 0) + dt; if (R.offT > 3) radio('You are off the lamps. Follow the yellow line back!'); } else R.offT = 0;
    // only the lamps toward the next goal stay bright
    R.lampT = (R.lampT || 0) - dt; if (R.lampT <= 0) { R.lampT = 0.25; const L2 = gd * gd || 1; for (const l of lampSpr) { const u = clamp(((l.x - C.x) * dx + (l.z - C.z) * dz) / L2, 0, 1), dl = Math.hypot(l.x - C.x - dx * u, l.z - C.z - dz * u), on = R.race || Math.hypot(l.x - g.x, l.z - g.z) < 70 || dl < 30; l.sp.material.opacity = on ? 0.9 : 0.15; } } }
  const start = { x: 0, z: -54, yaw: 0 }; R.cp = { ...start };
  X.setPaused(true);

  function update(dt, thr, sp, rdt) {
    const C = X.C, Sp = S(), T = X.St.t; R.bannerT = Math.max(0, R.bannerT - rdt); R.hurt = Math.max(0, R.hurt - rdt * 1.6); R.tCd = Math.max(0, R.tCd - dt); R.ptCd = Math.max(0, R.ptCd - dt); R.ramCd = Math.max(0, R.ramCd - dt);
    if (R.state === 'run' && !(R.race && R.race.st === 'count')) R.t += dt;
    { R.ct = (R.ct || 0) + rdt; bCoins.forEach(c => c.rotation.y = R.ct * 2.6); const op = 0.55 + 0.45 * Math.cos(R.ct * 5.2); bcM.forEach(m => m.opacity = op); }
    // lane buoys bob (every other frame on phones)
    R.fr = (R.fr || 0) + 1; if (!touch || R.fr % 2) { lb.forEach((b, i) => { lbO.position.set(b.x, W(b.x, b.z) + 0.1, b.z); lbO.rotation.set(Math.sin(T * 1.6 + b.p) * 0.2, 0, Math.cos(T * 1.3 + b.p) * 0.2); lbO.updateMatrix(); lbMesh.setMatrixAt(i, lbO.matrix); }); lbMesh.instanceMatrix.needsUpdate = true; }
    // fisherman + bubble
    const dF = Math.hypot(C.x - JX, C.z - BD.z); bub.visible = dF < 40; X.kit.animFox(fisher, dt, 0, false); if (hop > 0) { hop -= dt * 1.4; fisher.position.y = FY + Math.abs(Math.sin(hop * 9)) * 0.4; fisher.userData.P.arms.forEach(a => a.rotation.x = -2.8); } else { fisher.position.y = FY; fisher.userData.P.arms.forEach(a => a.rotation.x = damp(a.rotation.x, 0, 6, dt)); }
    if (R.state === 'run') say(R.race ? (R.race.st === 'count' ? 'On your marks!' : 'Go go go! Top two!') : dF < 14 ? 'Out of the slip and up the lamps!' : R.wave ? 'Sink those robots!' : 'Follow the lamps, skipper!');
    // blackboard: idle up to the jetty end to read it
    const dB = Math.hypot(C.x - (BD.x + 3), C.z - BD.z); if (dB > 18) R.armed = true; if (R.state === 'run' && R.armed && dB < 7 && sp < 5) { R.armed = false; R.board = true; X.setPaused(true); }
    if (R.down > 0) { R.down -= dt; C.speed = 0; if (Math.random() < 0.6) X.puff(tmp.set(C.x, 1.6, C.z), 0x2a2826, 1, 1.5, 1.4, 1.2); if (R.down <= 0) { const p = R.cp || start; X.place(p.x, p.z, p.yaw); R.hp = 100; banner('BACK IN!', 1.5); } }
    // sandbars + shallows
    let shallow = false; for (const B of BARS) if (((C.x - B.x) / B.a) ** 2 + ((C.z - B.z) / B.b) ** 2 < 1 && C.ground) shallow = 'bar';
    if (inSh(C.x, C.z) && C.ground) shallow = shallow || 'sh';
    if (shallow) { C.speed = clamp(C.speed, -3, shallow === 'bar' ? 4 : 10); if (!R.wade) { R.wade = true; X.popup(tmp.set(C.x, 3, C.z), shallow === 'bar' ? 'SANDBAR!' : 'WADING', '#9ca3af'); X.St.shake = Math.max(X.St.shake, 0.2); } if (sp > 1 && Math.random() < 0.7) for (const sd of [-1, 1]) X.spray(tmp.set(C.x + Math.cos(C.yaw) * sd * 1.4, 0.4, C.z - Math.sin(C.yaw) * sd * 1.4), 1, 3 + sp * 0.2); } else R.wade = false;
    // zones
    for (const [k, test, line, cp] of ZONES) if (!R.seen.has(k) && R.state === 'run' && test(C)) { R.seen.add(k); banner(line, 4.5); if (!R.race && !R.wave) R.cp = cp; if (k === 'robots' && !R.wave) setTimeout(() => startWave(1), 400); }
    if (R.seen.has('slalom') && !R.seen.has('slalomDone') && C.z > 126 && Math.abs(C.x) < 40) { R.seen.add('slalomDone'); if (!R.slalomHits) { R.score += 150; banner('CLEAN SLALOM · +150', 2.5); } }
    // big buoys
    for (const b of BUOYS) { b.hitCd = Math.max(0, b.hitCd - dt); b.vx += (b.hx - b.x) * 2 * dt - b.vx * 1.2 * dt; b.vz += (b.hz - b.z) * 2 * dt - b.vz * 1.2 * dt; b.x += b.vx * dt; b.z += b.vz * dt; const d = Math.hypot(b.x - C.x, b.z - C.z);
      if (d < Sp.r + b.r) { const l = d || 1; b.vx += (b.x - C.x) / l * (2 + sp * 0.9); b.vz += (b.z - C.z) / l * (2 + sp * 0.9); C.speed *= 0.92; if (b.hitCd <= 0 && sp > 2) { b.hitCd = 0.8; b.wob = 1; X.ripple(b.x, b.z, 2, 0.7); X.audio.tone(300, 0.1, 0.04, 'sine'); if (b.kind === 'slalom' && R.state === 'run') { R.slalomHits++; X.popup(tmp.set(b.x, 3, b.z), 'BUOY!', '#ec3013'); } } }
      if (sp > 8 && d < 9) b.wob = Math.min(1, b.wob + dt * 2.5); b.wob = Math.max(0, b.wob - dt * 0.45);
      b.g.position.set(b.x, W(b.x, b.z) - 0.1 + Math.sin(T * 6 + b.hx) * 0.2 * b.wob, b.z); b.g.rotation.z = Math.sin(T * 1.7 + b.hx) * 0.15 + Math.sin(T * 5) * 0.4 * b.wob; b.g.rotation.x = Math.cos(T * 1.3 + b.hz) * 0.12 + Math.cos(T * 4.3) * 0.3 * b.wob; }
    // floaters (barrels + target boards) bob; ram them
    for (const o of floaters) { if (o.kind === 'target' && o.down > 0 && o.down < 1) { o.down = Math.min(1, o.down + dt * 3); o.fl.rotation.x = -o.down * Math.PI / 2; } if (o.dead && o.kind === 'barrel') continue; o.g.position.y = W(o.x, o.z) - 0.05; o.g.rotation.z = Math.sin(T * 1.5 + o.x) * 0.12; o.g.rotation.x = Math.cos(T * 1.2 + o.z) * 0.1;
      if (!o.dead && Math.hypot(o.x - C.x, o.z - C.z) < Sp.r + 1.2) { X.smash(o, 'ram'); if (o.kind === 'barrel') boatHit(8); } }
    // pickups
    for (const tk of tokens) { tk.t += dt; if (tk.got) { if (tk.kind === 'nitro' || tk.kind === 'ammo') { tk.back -= dt; if (tk.back <= 0) { tk.got = false; tk.g.visible = true; } } continue; } tk.g.rotation.y += dt * 2.6; tk.g.position.y = tk.y + Math.sin(tk.t * 2.2) * 0.18 + (tk.y < 2 ? W(tk.x, tk.z) : 0);
      if (Math.hypot(tk.x - C.x, tk.z - C.z) < Sp.r + 0.8 && Math.abs(C.y + 1.2 - tk.g.position.y) < 2.4) { tk.got = true; tk.g.visible = false; X.puff(tmp.set(tk.x, tk.y, tk.z), tk.kind === 'coin' ? 0xffd23a : tk.kind === 'wrench' ? 0x22c55e : tk.kind === 'nitro' ? 0x38bdf8 : 0xff8a1a, 6, 3, 0.6, 0.4, true);
        if (tk.kind === 'coin') { R.tokens++; R.score += 50; X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), R.tokens + ' / ' + R.totalTokens, '#e6b45a'); X.audio.tone(1320, 0.08, 0.05, 'triangle', 1.5); setTimeout(() => X.audio.tone(1760, 0.1, 0.04, 'triangle', 1.2), 70); if (R.tokens === R.totalTokens) { banner('EVERY TOKEN! +300', 3); R.score += 300; } }
        else if (tk.kind === 'wrench') { tk.back = 1e9; save.give('repairKit'); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'REPAIR KIT +1', '#22c55e'); banner('REPAIR KIT: in your ITEMS. Use it to patch the hull', 3); X.audio.tone(660, 0.2, 0.05, 'triangle', 1.6); }
        else if (tk.kind === 'nitro') { tk.back = 25; R.nitro = Math.min(4, R.nitro + 1); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'NITRO +1', '#38bdf8'); X.audio.tone(880, 0.12, 0.05, 'triangle', 1.6); }
        else { tk.back = 25; R.torp = Math.min(6, R.torp + 2); X.popup(tmp.set(tk.x, tk.y + 1.6, tk.z), 'TORPEDOES +2', '#ff8a1a'); X.audio.tone(520, 0.15, 0.05, 'square', 1.2); } } }
    // waves of robot skis
    for (let i = spawnQ.length - 1; i >= 0; i--) { const q = spawnQ[i]; q.t -= dt; if (q.t <= 0) { spawnBot(q.type, q.x, q.z); spawnQ.splice(i, 1); } }
    if (R.wave && !R.race && R.state === 'run' && !spawnQ.length && !bots.some(o => !o.dead && o.type !== 'sentry')) { if (!R.next) R.next = 1.8; R.next -= dt; if (R.next <= 0) { R.next = 0; if (R.wave < 3) startWave(R.wave + 1); else { R.wave = 0; R.seen.add('wavesDone'); R.race = { st: 'wait', k: 0 }; gateG.forEach(g => g.visible = true); banner('6 · RIVAL RACE: back to the chequered gate by the jetty. Finish TOP 2', 5); } } }
    updBots(dt, sp);
    // bolts
    for (let i = bolts.length - 1; i >= 0; i--) { const b = bolts[i]; b.life -= dt; b.m.position.addScaledVector(b.v, dt); const p = b.m.position; let end = b.life <= 0 || p.y < 0;
      if (!end && Math.hypot(p.x - C.x, p.z - C.z) < Sp.r && p.y < C.y + 3) { boatHit(b.dmg); end = true; }
      if (end) { X.spray(p, 4, 2); scene.remove(b.m); bolts.splice(i, 1); } }
    updRace(dt, sp);
    guide(dt, sp);
  }
  function updBots(dt, sp) {
    const C = X.C, Sp = S();
    for (const o of bots) { if (o.gone) continue; o.t += dt; const g = o.g, dx = C.x - o.x, dz = C.z - o.z, d = Math.hypot(dx, dz), want = Math.atan2(dx, dz); fx.pre(g);
      if (o.st === 'die') { fx.post(g, dt); g.position.y -= dt * 1.2; g.rotation.z += dt * 1.5; if (o.t > 1.1) { o.gone = true; X.boom(tmp.set(o.x, 1, o.z), 2.2, 0xffb347); X.spray(tmp.set(o.x, 0.6, o.z), 14, 6); scene.remove(g, o.bar); } continue; }
      const turn = rate => { const df = Math.atan2(Math.sin(want - o.face), Math.cos(want - o.face)); o.face += clamp(df, -rate * dt, rate * dt); };
      const live = R.state === 'run' && R.down <= 0;
      if (o.type === 'sentry') { if (live && R.seen.has('targets') && d < 80) { turn(2.4); o.cd -= dt; if (o.st === 'idle' && o.cd <= 0) { o.st = 'windup'; o.t = 0; ck.enter(o.rider, 'windup'); } else if (o.st === 'windup' && o.t > 0.8) { o.st = 'attack'; o.t = 0; o.shots = 0; ck.enter(o.rider, 'attack'); } else if (o.st === 'attack') { if (o.shots < 3 && o.t > o.shots * 0.15) { fireBolt(o); o.shots++; } if (o.t > 0.6) { o.st = 'idle'; o.cd = rr(2.2, 3.2); ck.enter(o.rider, 'idle'); } } }
        o.rider.rotation.y = o.face; ck.animate(o.rider, o.st === 'idle' ? 'idle' : o.st, o.t, dt, {}); g.position.y = X.waveH(o.x, o.z, X.St.t) * 0.6 - 0.1; }
      else { const big = o.type === 'big', top = big ? 15 : 17;
        if (o.st === 'rise') { o.spd = 0; if (o.t > 0.8) { o.st = 'chase'; o.t = 0; } }
        else if (!live) o.spd = damp(o.spd, 0, 2, dt);
        else if (o.st === 'chase') { turn(2.2); o.spd = damp(o.spd, d > 10 ? top : 8, 2, dt); o.cd -= dt; if (d < 22 && o.cd <= 0) { o.st = 'windup'; o.t = 0; o.aim = want; X.audio.tone(140, 0.6, 0.04, 'sawtooth', 2); } }
        else if (o.st === 'windup') { o.spd = damp(o.spd, 2, 4, dt); o.face = damp(o.face, o.aim, 8, dt); if (!o.lane) { o.lane = new THREE.Mesh(laneGeo, new THREE.MeshBasicMaterial({ color: 0xff3b1f, transparent: true, opacity: 0.4, depthWrite: false })); scene.add(o.lane); } o.lane.visible = true; o.lane.position.set(o.x, 0.4, o.z); o.lane.rotation.y = o.aim; o.lane.scale.set(big ? 3 : 2, 1, 26); o.lane.material.opacity = 0.2 + 0.3 * Math.sin(o.t * 16) ** 2; if (o.t > 0.85) { o.st = 'dash'; o.t = 0; o.lane.visible = false; o.hitP = false; } }
        else if (o.st === 'dash') { o.spd = big ? 25 : 27; o.face = o.aim; if (Math.random() < 0.7) X.spray(tmp.set(o.x, 0.4, o.z), 1, 3); if (!o.hitP && d < Sp.r + o.D.r + 0.6) { o.hitP = true; boatHit(big ? 18 : 10, Math.sin(o.aim) * 1.4, Math.cos(o.aim) * 1.4); C.speed *= 0.5; o.st = 'recover'; o.t = 0; } else if (o.t > 1.1) { o.st = 'recover'; o.t = 0; } }
        else if (o.st === 'recover') { o.spd = damp(o.spd, 5, 2, dt); o.face += dt * 1.4; if (o.t > 1.0) { o.st = 'chase'; o.t = 0; o.cd = rr(1.4, 2.6); } }
        o.x += Math.sin(o.face) * o.spd * dt; o.z += Math.cos(o.face) * o.spd * dt; o.x = clamp(o.x, LK.x0 + 3, LK.x1 - 3); o.z = clamp(o.z, LK.z0 + 3, LK.z1 - 3);
        // player NITRO/fast ram + body push
        if (d < Sp.r + o.D.r) { if (sp > 14 && R.ramCd <= 0) { R.ramCd = 0.4; X.popup(tmp.set(o.x, 3.6, o.z), 'RAMMED', '#ec3013'); X.damage(o, C.nitro > 0 ? 60 : 35, 'ram'); X.St.shake = Math.max(X.St.shake, 0.4); } const l = d || 1, mn = Sp.r + o.D.r; o.x = C.x - dx / l * mn; o.z = C.z - dz / l * mn; }
        for (const s of bots) if (s !== o && !s.dead && s.type !== 'sentry') { const ex = o.x - s.x, ez = o.z - s.z, e = Math.hypot(ex, ez); if (e < 3 && e > 0.01) { o.x += ex / e * (3 - e) * 0.5; o.z += ez / e * (3 - e) * 0.5; } }
        const wy = X.waveH(o.x, o.z, X.St.t); g.position.set(o.x, o.st === 'rise' ? wy - 1.5 + o.t / 0.8 * 1.6 : wy + 0.05, o.z); g.rotation.order = 'YXZ'; g.rotation.set(-clamp(o.spd / 30, 0, 1) * 0.12 + Math.sin(X.St.t * 2 + o.x) * 0.06, o.face, (o.st === 'chase' ? clamp(-Math.atan2(Math.sin(want - o.face), Math.cos(want - o.face)), -0.4, 0.4) : 0) + Math.cos(X.St.t * 1.7 + o.z) * 0.06);
        if (o.spd > 6 && Math.random() < (touch ? 0.15 : 0.35)) X.ripple(o.x - Math.sin(o.face) * 1.6, o.z - Math.cos(o.face) * 1.6, 1.6, 0.4); }
      o.g.position.x = o.x; o.g.position.z = o.z; if (o.type !== 'sentry') {} fx.post(g, dt);
      o.bar.position.set(o.x, 4.2, o.z); o.bf.scale.x = o.bw * Math.max(0, o.hp / o.max); }
  }
  function updRace(dt, sp) {
    const RC = R.race; if (!RC || R.state !== 'run') return; const C = X.C;
    if (RC.st === 'wait') { const ng = GATES[0]; nextGlow.visible = true; nextGlow.position.set(ng[0], 3 + Math.sin(R.t * 4) * 0.3, ng[1]); if (Math.hypot(C.x - ng[0], C.z - ng[1]) < 18) { raceGrid(); banner('RACE · 2 LAPS · TOP 2 TO PASS', 3); } return; }
    if (RC.st === 'count') { RC.c -= dt; C.x = SLOTS[0][0]; C.z = SLOTS[0][1]; C.yaw = GYAW; C.speed = 0; const n = Math.ceil(RC.c); const s = n > 0 && n <= 3 ? String(n) : ''; if (s && RC.said !== s) { RC.said = s; banner(s, 1); X.audio.tone(440, 0.2, 0.06, 'square', 1); } if (RC.c <= 0) { RC.st = 'go'; banner('GO!', 1.2); X.audio.tone(880, 0.4, 0.06, 'square', 1); } }
    // rivals
    const meP = prog(RC.k, C.x, C.z);
    for (const r of RIVALS) { if (!r.g.visible) continue; const T = X.St.t;
      if (RC.st === 'go') { const gi = (r.k + 1) % NG, [gx, gz] = GATES[gi], [nx2, nz2] = GATES[(gi + 1) % NG], pl = Math.hypot(nx2 - gx, nz2 - gz), tx = gx + (nz2 - gz) / pl * r.off, tz = gz - (nx2 - gx) / pl * r.off;
        const want = Math.atan2(tx - r.x, tz - r.z), df = Math.atan2(Math.sin(want - r.yaw), Math.cos(want - r.yaw)); r.yaw += clamp(df, -1.5 * dt, 1.5 * dt);
        const rp = prog(r.k, r.x, r.z), rub = r.done ? 0.4 : 1 + clamp((meP - rp) * 0.06, -0.14, 0.2); r.nit = Math.max(0, r.nit - dt); if (!r.done && Math.random() < dt * 0.06) r.nit = 1.6;
        const top = r.base * rub * (r.nit > 0 ? 1.3 : 1) * (1 - Math.min(0.5, Math.abs(df) * 0.35)); r.spd = damp(r.spd, top, 1.4, dt);
        if (Math.hypot(gx - r.x, gz - r.z) < 15) { r.k++; if (!r.done && r.k >= NG * LAPS) { r.done = RC.fin.length + 1; RC.fin.push(r.name); } } }
      else r.spd = 0;
      r.x += Math.sin(r.yaw) * r.spd * dt; r.z += Math.cos(r.yaw) * r.spd * dt;
      const dx = r.x - C.x, dz = r.z - C.z, d = Math.hypot(dx, dz), mn = S().r + 1.9; if (d < mn && d > 0.01) { r.x = C.x + dx / d * mn; r.z = C.z + dz / d * mn; C.speed *= 0.96; if (sp > 6 && !(r.bumpT > T)) { r.bumpT = T + 0.6; X.audio.burst(0.15, 700, 0.15); X.St.shake = Math.max(X.St.shake, 0.2); } }
      for (const s of RIVALS) if (s !== r) { const ex = r.x - s.x, ez = r.z - s.z, e = Math.hypot(ex, ez); if (e < 3.8 && e > 0.01) { r.x += ex / e * (3.8 - e) * 0.5; r.z += ez / e * (3.8 - e) * 0.5; } }
      r.x = clamp(r.x, LK.x0 + 3, LK.x1 - 3); r.z = clamp(r.z, LK.z0 + 3, LK.z1 - 3);
      const wy = X.waveH(r.x, r.z, T), sz = X.waveH(r.x + Math.sin(r.yaw) * 1.4, r.z + Math.cos(r.yaw) * 1.4, T) - X.waveH(r.x - Math.sin(r.yaw) * 1.4, r.z - Math.cos(r.yaw) * 1.4, T);
      r.g.position.set(r.x, wy + 0.05, r.z); r.g.rotation.order = 'YXZ'; r.g.rotation.set(-Math.atan2(sz, 2.8) - clamp(r.spd / 25, 0, 1) * 0.08, r.yaw, Math.sin(T * 1.6 + r.off) * 0.06); if (r.V.prop) r.V.prop.rotation.z += (3 + r.spd * 2.6) * dt; if (r.V.spin) { r.V.spin.rotation.x = -clamp((r.spd - 4) / 10, 0, 1) * 0.09; r.V.spin.position.y = -0.2 + clamp((r.spd - 4) / 10, 0, 1) * 0.14; }
      if (r.spd > 8) { if (Math.random() < (touch ? 0.25 : 0.6)) X.puff(tmp.set(r.x - Math.sin(r.yaw) * 3, 0.9, r.z - Math.cos(r.yaw) * 3), 0xffffff, 1, 2 + r.spd * 0.1, 0.8, 0.5); r.rip = (r.rip || 0) - dt; if (r.rip <= 0) { r.rip = 0.2; X.ripple(r.x - Math.sin(r.yaw) * 2.6, r.z - Math.cos(r.yaw) * 2.6, 2.4, 0.45); } } }
    if (RC.st !== 'go') return;
    const gi = (RC.k + 1) % NG, ng = GATES[gi]; nextGlow.visible = true; nextGlow.position.set(ng[0], 3 + Math.sin(R.t * 4) * 0.3, ng[1]);
    if (Math.hypot(C.x - ng[0], C.z - ng[1]) < 16) { RC.k++; X.audio.tone(990, 0.1, 0.05, 'triangle', 1.4); if (RC.k % NG === 0 && RC.k < NG * LAPS) banner('LAP ' + (RC.k / NG + 1) + ' / ' + LAPS + ' · ' + ord(racePlace()), 2); }
    R.place = racePlace();
    if (RC.k >= NG * LAPS) { const place = RC.fin.length + 1; R.place = place;
      if (place <= 2) { R.score += place === 1 ? 500 : 250; nextGlow.visible = false; finish(); }
      else { R.tries++; RC.st = 'retry'; banner(ord(place) + ' PLACE · TOP 2 TO PASS · TRY AGAIN', 3.5); setTimeout(() => { if (R.state === 'run') { raceGrid(); } }, 3200); } }
  }
  function grade(s) { return s >= 4600 ? 'S' : s >= 3600 ? 'A' : s >= 2500 ? 'B' : 'C'; }
  function finish() { R.state = 'done'; const tb = Math.max(0, Math.round((540 - R.t) * 2)); const total = R.score + tb - R.deaths * 150; let best = null; try { best = JSON.parse(localStorage.getItem(SPEEDBOAT_BAY.bestKey) || 'null'); } catch (e) {} const nb = !best || total > best.score; if (nb) try { localStorage.setItem(SPEEDBOAT_BAY.bestKey, JSON.stringify({ score: total, time: Math.round(R.t), grade: grade(total), place: R.place })); } catch (e) {}
    R.done = { time: Math.round(R.t), tokens: R.tokens, totalTokens: R.totalTokens, kills: R.kills, totalBots: R.totalBots, targets: R.targets, totalTargets: R.totalTargets, deaths: R.deaths, place: R.place, tries: R.tries, base: R.score, timeBonus: tb, total, grade: grade(total), best: nb ? total : best.score, newBest: nb }; say('That is a real skipper!'); cheer(); X.audio.tone(523, 0.2, 0.06, 'triangle', 1); setTimeout(() => X.audio.tone(659, 0.2, 0.06, 'triangle', 1), 160); setTimeout(() => X.audio.tone(784, 0.4, 0.06, 'triangle', 1), 320); }
  const quest = () => R.goal && R.state === 'run' ? (R.race ? 'Race · lap ' + Math.min(LAPS, Math.floor(R.race.k / NG) + 1) + '/' + LAPS + ' · ' : R.wave ? 'Wave ' + R.wave + '/3 · ' : 'Next: ') + R.goal.label + ' · ' + Math.round(R.gd || 0) + ' m' : R.race ? (R.race.st === 'wait' ? 'Race: go to the chequered gate by the jetty' : 'Race · lap ' + Math.min(LAPS, Math.floor(R.race.k / NG) + 1) + ' / ' + LAPS + ' · finish top 2') : R.wave ? 'Wave ' + R.wave + ' / 3 · sink the robot boats' : 'Follow the lamps · slalom · ring · ramps · targets · shallows';
  return {
    start, onSmash, update, press, get boardURL() { return HB.boardURL; }, get boardURLP() { return HB.boardURLP; }, get coinP() { return coinP; },
    hud: () => ({ state: R.state, hp: Math.round(R.hp), tokens: R.tokens, totalTokens: R.totalTokens, kills: R.kills, totalBots: R.totalBots, time: Math.floor(R.t), score: R.score, banner: R.bannerT > 0 ? R.banner : '', wave: R.wave, hurt: Math.round(R.hurt * 10) / 10, board: R.board, done: R.done, low: R.hp < 30, torp: R.torp, nitro: R.nitro, quest: quest(), radio: R.radio || '', goal: (() => { const g = R.goal; if (!g || R.state !== 'run' || R.board) return null; const v = tmp.set(g.x, 3, g.z).project(X.camera); return { nx: Math.round(v.x * 1000) / 1000, ny: Math.round(v.y * 1000) / 1000, behind: v.z > 1, dist: Math.round(R.gd || 0), label: g.label }; })(), race: R.race && R.race.st !== 'wait' ? { lap: Math.min(LAPS, Math.floor(R.race.k / NG) + 1), laps: LAPS, place: R.place || 4, txt: 'LAP ' + Math.min(LAPS, Math.floor(R.race.k / NG) + 1) + '/' + LAPS + ' · ' + ord(R.place || 4) } : null }),
    armour: () => R.hp, heal(n) { if (R.hp >= 100) return 0; const a = Math.min(100, R.hp + n) - R.hp; R.hp += a; X.popup(tmp.set(X.C.x, 3, X.C.z), 'HULL +' + Math.round(a), '#22c55e'); return a; }, say(s) { banner(s, 2.5); },
    torpFull: () => R.torp >= 6 && R.nitro >= 4, refill() { R.torp = 6; R.nitro = 4; }, addTorp(n) { R.torp = Math.min(6, R.torp + n); },
    map: () => { const nb = R.race && R.race.st !== 'retry' ? [['Gate', ...GATES[R.race.st === 'wait' ? 0 : (R.race.k + 1) % NG]]] : []; return { b: [['Board', BD.x, BD.z], ...nb], l: lanterns, t: tokens.filter(k => !k.got && k.kind === 'coin').map(k => [k.x, k.z]), e: [...bots.filter(o => !o.dead && !o.gone).map(o => [o.x, o.z]), ...RIVALS.filter(r => r.g.visible).map(r => [r.x, r.z])], q: R.goal ? [R.goal.x, R.goal.z, R.goal.label] : null, r: R.race ? GATES : PATH, rc: !!R.race, g: R.goal ? [R.goal.x, R.goal.z] : null }; },
    rollOut() { R.board = false; X.setPaused(false); if (R.state === 'ready') { R.state = 'run'; banner('OUT OF THE SLIP! FOLLOW THE LAMPS', 3); X.audio.init && X.audio.init(); } },
    closeBoard() { R.board = false; X.setPaused(false); },
    openBoard() { R.board = true; X.setPaused(true); },
    reset() { const p = R.cp || start; X.place(p.x, p.z, p.yaw); },
    _skipTo(k) { R.state = 'run'; R.board = false; X.setPaused(false); const z = ZONES.find(Z => Z[0] === k); if (k === 'race') { R.wave = 0; R.race = { st: 'wait', k: 0 }; gateG.forEach(g => g.visible = true); X.place(44, -8, -2.2); return; } if (z) X.place(z[3].x, z[3].z, z[3].yaw); },
    _killAll() { for (const o of bots) if (!o.dead && o.type !== 'sentry') X.damage(o, 9999, 'test'); },
  };
}
