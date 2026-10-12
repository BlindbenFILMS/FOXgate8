// MERU 2.0 — step 10 ART PASS 6d part 2b: the BARRACKS [meruBarracks] as a walk-in drill hall (was a solid block).
// Its own stone shell (f -40..40 × -440..-400, door S at x 0, 3.6 m so the range tank stays out) with a cutaway: the roof and any wall
// between the camera and you drop away while you are inside. People from the layout (room coords) with the old looks (meru-interiors.js):
// the Guard Captain, the Master of Arms, King Might on the dais (throne scene). No new lines. Room kit = merged by material.
// West wing: 2 rows of bunks + footlockers + wall lockers. East wing: the sparring circle, straw dummies, archery butts, weapon racks.
// Centre: the red runner from the door to the dais, long mess tables, braziers, banners, iron ring chandeliers.
import { makeRoomKit } from './meru2-roomkit.js';
import { KING_MIGHT } from '../fox-kit.js';
export function buildBarracks({ THREE, scene, kit, cols, L, touch }) {
  const b = L.BUILDINGS.find(q => q.key === 'barracks'); if (!b) return { tick() {} };
  const { CT, Bin, flat, rnd } = makeRoomKit({ THREE, touch });
  const [x0, x1, z0, z1] = b.f, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H = 9, T = 0.6, DW = 1.8, far = touch ? 90 : 160;
  const box = (a0, a1, c0, c1, y1 = 4) => cols.push({ f: [a0, a1, c0, c1], y1 }), ring = (x, z, r) => cols.push({ c: [x, z, r], y1: 4 });
  const stoneT = (base, n) => CT(256, 256, (g, w) => { g.fillStyle = '#4a4540'; g.fillRect(0, 0, w, w); const rh = w / n; for (let r = 0; r < n; r++) { let x = -(r % 2) * 40; while (x < w) { const L2 = 50 + rnd() * 50, k = 0.86 + rnd() * 0.22; const c = new THREE.Color(base);
      g.fillStyle = `rgb(${c.r * 255 * k | 0},${c.g * 255 * k | 0},${c.b * 255 * k | 0})`; g.fillRect(x + 2, r * rh + 2, L2 - 4, rh - 4); for (let s = 0; s < 14; s++) { g.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)'; g.fillRect(x + rnd() * L2, r * rh + rnd() * rh, 3, 2); } x += L2; } } });
  const flagT = CT(256, 256, (g, w) => { g.fillStyle = '#5a554e'; g.fillRect(0, 0, w, w); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const k = 0.85 + rnd() * 0.25; g.fillStyle = `rgb(${150 * k | 0},${142 * k | 0},${128 * k | 0})`; g.fillRect(i * 64 + 2 + rnd() * 3, j * 64 + 2 + rnd() * 3, 58, 58); } });
  // ---------- the shell ----------
  const shell = new THREE.Group(); scene.add(shell); const wallT = stoneT('#9b8f7d', 8); wallT.wrapS = wallT.wrapT = THREE.RepeatWrapping;
  const wallM = (len) => { const t = wallT.clone(); t.needsUpdate = true; t.repeat.set(len / 4, H / 4); return new THREE.MeshLambertMaterial({ map: t }); };
  const sides = { N: [], S: [], W: [], E: [] };
  const wall = (side, a, c, len, alongX) => { const m = new THREE.Mesh(new THREE.BoxGeometry(alongX ? len : T, H, alongX ? T : len), wallM(len)); m.position.set(a, H / 2, c); if (!touch) { m.castShadow = true; m.receiveShadow = true; } shell.add(m); sides[side].push(m); };
  wall('N', cx, z0 + T / 2, x1 - x0, true); wall('W', x0 + T / 2, cz, z1 - z0, false); wall('E', x1 - T / 2, cz, z1 - z0, false);
  const sl = (b.door[0] - DW) - x0, sr = x1 - (b.door[0] + DW); wall('S', x0 + sl / 2, z1 - T / 2, sl, true); wall('S', x1 - sr / 2, z1 - T / 2, sr, true);
  { const m = new THREE.Mesh(new THREE.BoxGeometry(DW * 2, H - 4.2, T), wallM(DW * 2)); m.position.set(b.door[0], 4.2 + (H - 4.2) / 2, z1 - T / 2); shell.add(m); sides.S.push(m); }
  box(x0, x1, z0, z0 + T, 99); box(x0, x0 + T, z0, z1, 99); box(x1 - T, x1, z0, z1, 99); box(x0, b.door[0] - DW, z1 - T, z1, 99); box(b.door[0] + DW, x1, z1 - T, z1, 99);
  const o = Bin(), roofG = new THREE.Group(); shell.add(roofG); const rf = Bin();
  rf.box('mat', '#6b6258', x1 - x0, 0.4, z1 - z0, cx, H + 0.2, cz); for (let x = x0 + 1; x < x1; x += 2.5) for (const z of [z0 + 0.3, z1 - 0.3]) rf.box('mat', '#8a7f70', 1.2, 1.0, 0.7, x, H + 0.9, z);
  for (let z = z0 + 1; z < z1; z += 2.5) for (const x of [x0 + 0.3, x1 - 0.3]) rf.box('mat', '#8a7f70', 0.7, 1.0, 1.2, x, H + 0.9, z); rf.build(roofG);
  // outside: the arch, a BARRACKS sign, two torches, two banners on the front
  o.box('mat', '#6b6258', DW * 2 + 1.4, 0.5, T + 0.3, b.door[0], 4.45, z1 - T / 2); for (const s of [-1, 1]) o.box('mat', '#6b6258', 0.7, 4.2, T + 0.3, b.door[0] + s * (DW + 0.35), 2.1, z1 - T / 2);
  for (const s of [-1, 1]) { const x = b.door[0] + s * 3.6; o.box('mat', '#201e1d', 0.1, 0.5, 0.4, x, 3.0, z1 + 0.2); o.cyl('mat', '#3d3b3a', 0.16, 0.3, x, 3.35, z1 + 0.4, 8, 0, 0, 1.3); o.sph('glo', '#ffb347', 0.16, x, 3.6, z1 + 0.4, 1.6, 6);
    const bx = b.door[0] + s * 9; o.box('mat', '#1f2650', 2.2, 4.2, 0.06, bx, 5.6, z1 + 0.04); o.box('mat', '#e6b45a', 2.2, 0.16, 0.08, bx, 7.7, z1 + 0.05); o.box('mat', '#e6b45a', 0.9, 0.9, 0.08, bx, 5.8, z1 + 0.07); o.box('mat', '#1f2650', 0.5, 0.5, 0.09, bx, 5.8, z1 + 0.08); }
  o.build(shell);
  { const sg = CT(512, 112, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#e6b45a'; g.fillRect(0, 0, 18, h); g.font = '900 60px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('BARRACKS', 40, h / 2 + 3); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.1), new THREE.MeshBasicMaterial({ map: sg, color: 0xe8e8e8 })); m.position.set(b.door[0], 5.4, z1 + 0.05); shell.add(m); }
  // ---------- inside ----------
  const IG = new THREE.Group(); scene.add(IG); const k = Bin();
  flat(IG, flagT, x1 - x0 - 2 * T, z1 - z0 - 2 * T, cx, 0.06, cz, 3);
  const RED = '#a8323e', NAVY = '#1f2650', GOLD = '#e6b45a', WOOD = '#6b4a32', DARK = '#3d2a1c', IRON = '#3d3b3a';
  // the runner from the door to the dais + the M seal
  k.box('mat', RED, 3, 0.012, 30, 0, 0.07, -413); for (const s of [-1, 1]) k.box('mat', GOLD, 0.14, 0.014, 30, s * 1.45, 0.072, -413);
  k.cyl('mat', RED, 2.6, 0.02, 0, 0.075, -414, 32); k.tor('mat', GOLD, 2.3, 0.04, 0, 0.09, -414, Math.PI / 2); k.cyl('mat', NAVY, 1.4, 0.022, 0, 0.08, -414, 24);
  // the dais on the north wall: two steps, the throne, the great banner, braziers, crossed spears
  k.box('mat', '#8a7f70', 14, 0.5, 6, 0, 0.25, -436); k.box('mat', '#8a7f70', 10, 0.25, 1, 0, 0.125, -432.5); k.box('mat', RED, 8, 0.02, 7, 0, 0.51, -436.3);
  box(-7, 7, -439.4, -433.5, 0.4);
  k.box('mat', DARK, 1.8, 0.6, 1.3, 0, 0.8, -437.6); k.box('mat', RED, 1.6, 0.14, 1.1, 0, 1.17, -437.5); k.box('mat', DARK, 1.8, 2.8, 0.3, 0, 2.3, -438.3); k.box('mat', RED, 1.4, 2.0, 0.04, 0, 2.2, -438.13);
  for (const s of [-1, 1]) { k.box('mat', DARK, 0.25, 0.9, 1.2, s * 0.95, 1.2, -437.6); k.sph('gls', GOLD, 0.12, s * 0.95, 1.7, -437.0); k.sph('gls', GOLD, 0.14, s * 0.8, 3.75, -438.3); } k.oct('gls', GOLD, 0.24, 0, 3.95, -438.3, 1.3);
  box(-1.1, 1.1, -438.6, -436.8);
  k.box('mat', NAVY, 4, 6.5, 0.06, 0, 4.6, -439.35); k.box('mat', GOLD, 4.1, 0.2, 0.08, 0, 7.9, -439.33); k.box('mat', GOLD, 1.8, 1.8, 0.08, 0, 5.4, -439.31); k.box('mat', NAVY, 1.2, 1.2, 0.09, 0, 5.4, -439.3);
  for (let i = 0; i < 5; i++) k.box('mat', GOLD, 0.12, 0.5, 0.08, -1.6 + i * 0.8, 1.3, -439.31);
  for (const s of [-1, 1]) { const x = s * 5.5; k.cyl('mat', IRON, 0.12, 1.1, x, 1.05, -434.5, 8); k.cyl('mat', IRON, 0.5, 0.35, x, 1.75, -434.5, 12, 0, 0, 1.3); k.sph('glo', '#ff8a3a', 0.42, x, 2.0, -434.5, 0.8, 8); k.sph('glo', '#ffd27a', 0.24, x, 2.3, -434.5, 1.2, 6);
    for (const a of [-0.35, 0.35]) k.box('mat', '#8a8580', 0.05, 3.6, 0.05, s * 3.6 + a * 0.4, 2.2, -439.2, 0, 0, a); }
  // banners down the long walls
  for (const x of [-30, -18, 18, 30]) { k.box('mat', NAVY, 2, 4.4, 0.05, x, 5.6, -439.33); k.box('mat', GOLD, 0.8, 0.8, 0.06, x, 6.0, -439.32); }
  for (const z of [-430, -418, -408]) for (const s of [-1, 1]) { const x = s * 39.35; k.box('mat', RED, 0.05, 3.6, 1.6, x, 6.0, z); k.box('mat', GOLD, 0.06, 0.14, 1.6, x, 7.85, z); }
  // WEST WING: two rows of bunks, footlockers, wall lockers, the Captain's desk
  for (let i = 0; i < 6; i++) for (const row of [0, 1]) { const x = -36 + i * 3.6, z = row ? -426 : -437.6; const zz = row ? z : z;
    for (const e of [-0.45, 0.45]) for (const f of [-1, 1]) k.box('mat', IRON, 0.06, 2.0, 0.06, x + e, 1.0, zz + f * 1.0);
    for (const y of [0.45, 1.55]) { k.box('mat', IRON, 1.0, 0.08, 2.1, x, y, zz); k.box('mat', '#e7e5ef', 0.92, 0.16, 2.0, x, y + 0.12, zz); k.box('mat', NAVY, 0.94, 0.06, 1.3, x, y + 0.22, zz + 0.3); k.box('mat', '#f3f2f2', 0.7, 0.1, 0.35, x, y + 0.24, zz - 0.75); }
    k.box('mat', WOOD, 0.9, 0.45, 0.5, x, 0.225, zz + (row ? 1.4 : 1.4)); k.box('gls', '#8a8580', 0.92, 0.04, 0.06, x, 0.42, zz + 1.4); box(x - 0.55, x + 0.55, zz - 1.1, zz + 1.7, 2.2); }
  for (let i = 0; i < 14; i++) { const z = -438 + i * 0.75; k.box('gls', i % 2 ? '#5c6670' : '#4f5963', 0.55, 2.1, 0.7, -39.1, 1.05, z); k.box('mat', '#3f4854', 0.01, 1.9, 0.01, -38.82, 1.05, z + 0.35); k.box('gls', '#c0c4cc', 0.03, 0.12, 0.03, -38.81, 1.1, z - 0.2); }
  box(-39.4, -38.8, -438.4, -427.6, 3);
  k.box('mat', DARK, 2.4, 0.78, 1.1, -12, 0.39, -420); k.box('mat', WOOD, 2.5, 0.05, 1.2, -12, 0.8, -420); k.box('mat', '#f3efe2', 0.5, 0.01, 0.7, -12.4, 0.83, -420); k.box('mat', '#2e4a6b', 0.3, 0.06, 0.4, -11.5, 0.85, -419.8); k.cyl('gls', GOLD, 0.05, 0.12, -11.1, 0.88, -420.3, 8);
  k.box('mat', DARK, 0.5, 0.5, 0.5, -12, 0.25, -421); k.box('mat', DARK, 0.5, 0.6, 0.06, -12, 0.75, -421.25); box(-13.3, -10.7, -420.6, -419.4, 1.2);
  // centre: two long mess tables + benches between the runner and the wings
  for (const x of [-7, 7]) { k.box('mat', WOOD, 1.4, 0.08, 9, x, 0.78, -418); for (const z of [-421.8, -414.2]) for (const s of [-0.55, 0.55]) k.box('mat', DARK, 0.1, 0.74, 0.1, x + s, 0.37, z);
    for (const s of [-1, 1]) { k.box('mat', WOOD, 0.4, 0.06, 9, x + s * 1.05, 0.45, -418); for (const z of [-421.8, -414.2]) k.box('mat', DARK, 0.3, 0.42, 0.08, x + s * 1.05, 0.21, z); }
    for (let i = 0; i < 6; i++) { const z = -421.6 + i * 1.45; k.cyl('gls', '#c0c4cc', 0.16, 0.03, x - 0.3, 0.83, z, 12); k.cyl('mat', '#8a6a42', 0.06, 0.16, x + 0.35, 0.9, z + 0.4, 8); }
    box(x - 1.3, x + 1.3, -422.6, -413.4, 1.2); }
  // EAST WING: sparring circle, straw dummies, archery butts on the east wall, weapon racks
  const sx = 24, sz = -422; k.cyl('mat', '#c9b48a', 4.6, 0.02, sx, 0.075, sz, 40); k.tor('mat', '#f3f2f2', 4.4, 0.03, sx, 0.09, sz, Math.PI / 2); k.tor('mat', RED, 1.2, 0.03, sx, 0.09, sz, Math.PI / 2);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; k.cyl('mat', DARK, 0.08, 1.0, sx + Math.cos(a) * 5, 0.5, sz + Math.sin(a) * 5, 6); }
  for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * Math.PI * 2; if (Math.abs(a - Math.PI) < 0.4) continue; const r0 = 5, ux = sx + Math.cos(a) * r0, uz = sz + Math.sin(a) * r0; k.box('mat', '#c9a227', 2.6, 0.05, 0.05, ux, 0.9, uz, -a + Math.PI / 2); }
  for (const [x, z] of [[14, -434], [17, -434], [20, -434]]) { k.cyl('mat', DARK, 0.06, 1.2, x, 0.6, z, 6); k.cyl('mat', '#d6b86a', 0.3, 0.9, x, 1.3, z, 10); k.sph('mat', '#d6b86a', 0.24, x, 1.95, z, 1, 8); k.box('mat', '#d6b86a', 1.0, 0.16, 0.16, x, 1.5, z); k.box('mat', RED, 0.62, 0.08, 0.62, x, 1.1, z); ring(x, z, 0.45); }
  for (const z of [-436, -430, -424]) { k.cyl('mat', '#d6b86a', 0.9, 0.5, 38.6, 1.4, z, 18, 0, Math.PI / 2); for (const [r, c] of [[0.7, '#f3f2f2'], [0.5, RED], [0.3, '#f3f2f2'], [0.12, GOLD]]) k.cyl('mat', c, r, 0.02, 38.34 - (0.9 - r) * 0.01, 1.4, z, 18, 0, Math.PI / 2);
    for (const e of [-0.6, 0.6]) k.box('mat', DARK, 0.1, 1.6, 0.1, 38.9, 0.8, z + e); }
  box(38.1, 39.4, -437, -423, 2.5);
  k.box('mat', '#f3f2f2', 0.08, 0.012, 14, 31, 0.07, -430);
  for (const z of [-414, -408]) { k.box('mat', DARK, 0.3, 2.2, 3.2, 39.1, 1.1, z); for (let i = 0; i < 6; i++) { const zz = z - 1.3 + i * 0.52; k.box('gls', '#c0c4cc', 0.05, 1.6, 0.06, 38.85, 1.3, zz); k.box('mat', GOLD, 0.06, 0.06, 0.24, 38.85, 0.62, zz); } box(38.6, 39.4, z - 1.6, z + 1.6, 3); }
  for (let i = 0; i < 3; i++) { k.cyl('mat', '#8a6a42', 0.32, 0.8, 36 - i * 0.8, 0.4, -402.5, 12); k.cyl('mat', IRON, 0.33, 0.04, 36 - i * 0.8, 0.7, -402.5, 12); ring(36 - i * 0.8, -402.5, 0.34); }
  // iron ring chandeliers over the hall, plain lanterns over the wings
  for (const x of [-24, 0, 24]) for (const z of [-428, -414]) { const y = 6.2; k.box('mat', IRON, 0.03, H - y, 0.03, x, (H + y) / 2, z); k.tor('mat', IRON, 1.3, 0.05, x, y, z, Math.PI / 2); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, px = x + Math.cos(a) * 1.3, pz = z + Math.sin(a) * 1.3; k.cyl('mat', '#f3efe2', 0.04, 0.16, px, y + 0.1, pz, 6); k.sph('glo', '#ffd27a', 0.07, px, y + 0.25, pz, 1.4, 6); } }
  k.build(IG);
  // ---------- people (looks from the old Meru modules, places from the layout's room coords) ----------
  const room = s => { const a = (L.SPEAKERS.find(q => q.key === s) || {}).at; return a && !Array.isArray(a) ? [cx + a.x, cz + a.z] : null; };
  const npcs = [];
  const people = [], put = (key, opt, at, ry) => { if (!at) return; const f = kit.makeFox({ key, ...opt }); f.position.set(at[0], at[2] || 0, at[1]); f.rotation.y = ry; scene.add(f); ring(at[0], at[1], 0.45); npcs.push(f); people.push({ key, obj: f, ry, r: key === 'mike' ? 4.2 : 2.6 }); };
  put('barracksGuardCaptain', { torso: ['#52525b', '#27272a', '#09090b'], crest: 'M', gear: 'sword', outfit: 'armor', mood: 'stern' }, room('barracksGuardCaptain') ? [-14, -420] : null, Math.PI / 2);
  put('barracksMasterOfArms', { torso: ['#1e3a8a', '#1e3a8a', '#172554'], crest: 'M', gear: 'sword', outfit: 'armor', mood: 'determined' }, (q => q && [sx - 2.6, sz + 2.2])(room('barracksMasterOfArms')), -Math.PI / 2 - 0.6);
  put('mike', { torso: ['#7a808c', '#474d59', '#23272f'], crest: 'M', crown: true, eyes: ['#e6b45a', '#e6b45a'], outfit: 'armor', mood: 'warm', look: KING_MIGHT }, room('mike') ? [0, -436.4, 0.5] : null, 0);
  // ---------- cutaway + distance hide ----------
  const inside = (p) => p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1 && p.y < H;
  function tick(dt, p, cam) {
    const d = cam ? Math.hypot(Math.max(x0 - cam.x, 0, cam.x - x1), Math.max(z0 - cam.z, 0, cam.z - z1)) : 0; IG.visible = d < far;
    const inP = !!p && inside(p), inC = !!cam && cam.x > x0 && cam.x < x1 && cam.z > z0 && cam.z < z1 && cam.y < H + 1, act = inP || inC;
    roofG.visible = !act;
    if (cam) { sides.N.forEach(m => m.visible = !(act && cam.z < z0 + 1)); sides.S.forEach(m => m.visible = !(act && cam.z > z1 - 1)); sides.W.forEach(m => m.visible = !(act && cam.x < x0 + 1)); sides.E.forEach(m => m.visible = !(act && cam.x > x1 - 1)); }
    for (const f of npcs) kit.animFox(f, dt, 0, false); }
  return { tick, inside, people };
}
