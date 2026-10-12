// MERU — Arena Path [meruArena]: the market road between the square's east gate and the arena, part of the ONE outdoor map.
// The 2D Arena Path is a fight-day market; its people, colours and lines are verbatim from surface_meru.html
// (lines live in meru-arenapath-dialogue.json, loaded with the walk maps).
// Layout is compact here (the 3D arena stands at the road's end): x 42..92 m, z -14..14 m.
// The Michelle + Max meeting (pathMichelle / pathMax, arenaMeetDone) is wired in meru-game.js (checkMeet) from worlds/meru-meet.json.
export const X0 = 42, X1 = 92, ZH = 14;
export const inZone = (X, Z) => X > X0 - 2 && X < X1 + 2 && Math.abs(Z) < ZH + 2;
export function flatMask(X, Z) { const dx = Math.max(0, X0 - 4 - X, X - X1 - 2), dz = Math.max(0, Math.abs(Z) - ZH - 2); const d = Math.hypot(dx, dz); return d <= 0 ? 1 : Math.max(0, 1 - d / 8); }
const G = ['#52525b', '#27272a', '#09090b'];
// [key, name, role, outfit, torso, x, z, face, mood, extra]
const PEOPLE = [
  ['arenaGuard1', 'Arena Guard', 'Arena gate', 'armor', G, 89, -4.2, -Math.PI / 2, 'stern', { gear: 'sword' }],
  ['arenaGuard2', 'Arena Guard', 'Arena road', 'armor', G, 70, 3.2, 0, 'stern', { gear: 'sword', pts: [[58, 3.2], [86, 3.2]], speed: 1.1 }],
  ['vance', 'Arena Official', 'Arena', 'suit', ['#3a4a75', '#22304f', '#0e1730'], 88.5, 5.2, -Math.PI / 2, 'smug', {}],
  ['arenaRoadGuard1', 'Road Guard', 'Arena road', 'armor', G, 64, -3.6, Math.PI / 2, 'stern', { gear: 'sword' }],
  ['arenaRoadGuard2', 'Road Guard', 'Arena road', 'armor', G, 64, 3.8, Math.PI / 2, 'stern', { gear: 'sword' }],
  ['torv', 'Torv', 'Fight fan', 'coat', ['#6f7f9c', '#4a5773', '#232c3f'], 80, -2.6, Math.PI / 2, 'excited', {}],
  ['marla', 'Marla', 'Ribbon seller', 'dress', ['#7fae5c', '#57813a', '#2f4a1f'], 48, -8.4, 0, 'warm', { female: true }],
  ['wren', 'Wren', 'Spectator', 'coat', ['#a883c4', '#7a5a94', '#452f57'], 52, -10.8, Math.PI / 2, 'sad', { female: true }],
  ['pell', 'Pell', 'Pie stall', 'vest', ['#d1793f', '#a1522a', '#5c2d13'], 56, -8.6, 0, 'warm', {}],
  ['sela', 'Sela', 'Flowers', 'dress', ['#c0729a', '#8e4c70', '#4a2438'], 68, -8.6, 0, 'sad', { female: true }],
  ['rosk', 'Rosk', 'Juggler', 'vest', ['#4fb3a4', '#2f8377', '#17453f'], 74, -6.4, 0, 'happy', {}],
  ['odo', 'Odo', 'Bookmaker', 'suit', ['#7d95c4', '#52679a', '#2c3a5e'], 50, 8.6, Math.PI, 'smug', {}],
  ['tam', 'Tam', 'Old-timer', 'robe', ['#dcb254', '#ab8231', '#5f4519'], 58, 9.6, Math.PI, 'warm', {}],
  ['ivy', 'Ivy', 'Fruit stall', 'dress', ['#d98aa6', '#a85f79', '#5c2f3f'], 72, 8.6, Math.PI, 'happy', { female: true }],
  ['hetty', 'Hetty', 'Fish seller', 'vest', ['#8fa86a', '#5f7645', '#2c3a20'], 80, 8.6, Math.PI, 'warm', { female: true }],
];
const SQY = 1620 / 2880, S = 80 / 2880;
const toSq = (x, z) => [x / S + 1440, (z / S + 810) / SQY];
export const FOXES = PEOPLE.map(([key, name, role, outfit, torso, x, z, face, mood, ex]) => { const f = { key, name, role, outfit, torso, crest: 'M', face, mood, ...ex }; if (ex.pts) { f.path = ex.pts.map(([a, b]) => toSq(a, b)); delete f.pts; } else f.stand = toSq(x, z); return f; });
export const DIALOGUE = {};
export function setDialogue(d) { Object.assign(DIALOGUE, d); }
// stalls: [x, z, facing (1 = opens to +z), canopy colour, goods]
const STALLS = [[48, -10, 1, '#c42d3c', 'ribbons'], [56, -10, 1, '#e6b45a', 'pies'], [68, -10, 1, '#c084fc', 'flowers'], [50, 10, -1, '#38bdf8', 'odds'], [72, 10, -1, '#4ade80', 'fruit'], [80, 10, -1, '#7dd3fc', 'fish']];
export function buildArenaPath(K) {
  const { THREE, scene, M, BOX, toon, BK, colliders, signTex, glowing, DARK, WOOD, bannerM } = K;
  const root = new THREE.Group(); root.name = 'meruArena'; scene.add(root);
  const plaza = new THREE.Mesh(BOX(X1 - X0, 0.05, 2 * ZH - 2), toon('#a9a3bd')); plaza.position.set((X0 + X1) / 2, 0.025, 0); plaza.receiveShadow = true; root.add(plaza);
  const runner = new THREE.Mesh(BOX(X1 - X0 + 4, 0.03, 2.2), toon('#a8323e')); runner.position.set((X0 + X1) / 2 + 1, 0.11, 0); root.add(runner);
  const goods = { ribbons: ['#c42d3c', '#38bdf8', '#e6b45a'], pies: ['#c98a3c', '#a86a2a', '#e0b06a'], flowers: ['#f472b6', '#facc15', '#c084fc'], odds: ['#f4f1ec', '#f4f1ec', '#f4f1ec'], fruit: ['#ef4444', '#f59e0b', '#84cc16'], fish: ['#9fb6c8', '#7d95a8', '#c4d2dc'] };
  for (const [x, z, f, col, kind] of STALLS) {
    const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
    M(BOX(3.0, 0.9, 1.0), WOOD, 0, 0.45, f * 0.5, g, 0.02); M(BOX(3.2, 0.08, 1.2), toon('#3a2618'), 0, 0.92, f * 0.5, g, 0.01);
    for (const sx of [-1.45, 1.45]) for (const sz of [0, f * 1.0]) M(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 6), DARK, sx, 1.3, sz, g, 0.01, 0.06);
    const can = M(BOX(3.4, 0.12, 1.8), toon(col), 0, 2.6, f * 0.45, g, 0.02); can.rotation.x = -f * 0.18;
    for (let i = 0; i < 7; i++) M(new THREE.ConeGeometry(0.22, 0.32, 3), toon(i % 2 ? '#f2f0ea' : col), -1.5 + i * 0.5, 2.38, f * 1.4, g, 0).rotation.x = Math.PI;
    const c3 = goods[kind]; for (let i = 0; i < 6; i++) M(kind === 'odds' ? BOX(0.3, 0.02, 0.4) : new THREE.SphereGeometry(0.11, 8, 6), toon(c3[i % 3]), -1.1 + i * 0.44, 1.02, f * 0.5, g, 0);
    colliders.push({ box: [x - 1.6, x + 1.6, z + (f > 0 ? 0 : -1.1), z + (f > 0 ? 1.1 : 0)] });
  }
  const balls = [0, 1, 2].map(i => M(new THREE.SphereGeometry(0.1, 8, 6), toon(['#ef4444', '#facc15', '#38bdf8'][i]), 74, 2, -6.4, root, 0));
  M(BOX(0.7, 1.1, 0.5), WOOD, 87.6, 0.55, 6.2, root, 0.02); M(BOX(0.6, 0.06, 0.45), toon('#f4f1ec'), 87.6, 1.14, 6.2, root, 0.01); colliders.push({ box: [87.2, 88.0, 5.9, 6.5] });
  for (let x = 46; x <= 88; x += 8) for (const s of [-1, 1]) { M(new THREE.CylinderGeometry(0.08, 0.1, 4.4, 8), DARK, x, 2.2, s * 5.2, root, 0.02, 0.1); const b = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.6), bannerM); b.position.set(x, 3.3, s * 5.2 - s * 0.1); b.rotation.y = s > 0 ? Math.PI : 0; root.add(b); colliders.push({ c: [x, s * 5.2, 0.2] }); }
  BK.linePath([[X0, 0], [X1 - 2, 0]], { every: 8, side: 3.4, both: true, parent: root, colliders });
  { const st = signTex('ARENA PATH', null, '#e6b45a'); const g = new THREE.Group(); g.position.set(44, 0, -4.2); g.rotation.y = Math.PI / 2; root.add(g); for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), DARK, s * 1.6, 1.2, 0, g, 0.01, 0.07); M(BOX(3.6, 0.9, 0.14), [DARK, DARK, DARK, DARK, glowing(0, st, 1.1), DARK], 0, 2.2, 0, g, 0.02); }
  let t = 0;
  return { root, update(dt) { t += dt; balls.forEach((b, i) => { const a = t * 4 + i * 2.1; b.position.set(74 + Math.cos(a) * 0.35, 1.9 + Math.abs(Math.sin(a)) * 0.9, -6.4 + 0.45); }); } };
}
