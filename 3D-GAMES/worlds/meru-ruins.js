// MERU — Ruins Path [meruRuins] and Desert Ruins [meruDesert]: two zones of the ONE outdoor map, west of the square.
// Laid out from the 2D scenes (ref/meruRuins.*, ref/meruDesert.*), same scale as the square (80 m per 2880 px).
// Ruins px → town art: ax = px - 2880, ay = py - 630 (its road meets the square's west road).
// Desert px → town art: ax = px - 5760, ay = py - 630.
import { PLAYER_MALE } from '../fox-kit.js';
import { branch } from '../engine/story.js';

const S = 80 / 2880, SRC_Y = 1620 / 2880;
const AX = a => (a - 1440) * S, AZ = a => (a - 810) * S;
export const rx = px => AX(px - 2880), rz = py => AZ(py - 630);    // ruins px → world
export const dx = px => AX(px - 5760), dz = py => AZ(py - 630);    // desert px → world
const sqR = (px, py) => [px - 2880, (py - 630) / SRC_Y], sqD = (px, py) => [px - 5760, (py - 630) / SRC_Y];
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
let rnd = 7; const R = () => ((rnd = (rnd * 16807) % 2147483647) / 2147483647);

let WR = null, WD = null;
export function setWalk(r, d) { WR = r; WD = d; }
function onWalk(W, px, py) { if (!W || py < W[0].y || py > W[W.length - 1].y + 8) return false; let lo = 0, hi = W.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (W[m].y <= py) lo = m; else hi = m - 1; } for (const [a, b] of W[lo].s) if (px >= a && px <= b) return true; return false; }

// ---- ruins layout (px) ----
const MUS = { x0: 1030, x1: 1770, y0: 1820, y1: 2490, in: [1062, 1738, 1852, 2458], door: [1345, 1455] };
const DIG = [1179, 1980, 562, 1116];
const RAIL_N = 1236, RAIL_S = 1636, GAPS_N = [[1300, 1520], [2350, 2560]], GAPS_S = [[1225, 1575], [2747, 2880]];
// ---- desert layout (px) ----
const TEMPLE = [1070, 1810, 1130, 1600], MOUTH = [1230, 1650, 1600, 1800], PERMIT = [1990, 2700, 300, 960];
const TRAIL = [[2870, 1320], [1960, 1320], [1440, 1860]], TRAIL2 = [[2283, 1320], [2283, 760]];

export function inRuins(ax, ay) { const px = ax + 2880, py = ay + 630; return px >= 0 && px < 2880 && py >= 260 && py <= 2760; }
export function inDesert(ax, ay) { const px = ax + 5760, py = ay + 630; return px >= 0 && px < 2880 && py >= 0 && py <= 2880; }
export const inZone = (ax, ay) => inRuins(ax, ay) || inDesert(ax, ay);
const inR = (px, py, r, m = 0) => px > r[0] - m && px < r[1] + m && py > r[2] - m && py < r[3] + m;

export function walkable(ax, ay) {
  if (inRuins(ax, ay)) { const px = ax + 2880, py = ay + 630;
    if (py < 300 || py > 2700) return false;
    if (inR(px, py, [MUS.x0, MUS.x1, MUS.y0, MUS.y1])) return inR(px, py, MUS.in) || (px > MUS.door[0] && px < MUS.door[1] && py < MUS.in[2] + 4);
    return true; }
  if (inDesert(ax, ay)) { const px = ax + 5760, py = ay + 630;
    if (px < 34 || py < 40 || py > 2840) return false;
    if (inR(px, py, PERMIT)) return inR(px, py, [2036, 2654, 346, 914]) || (px > 2272 && px < 2462 && py > 900);
    if (inR(px, py, TEMPLE) || inR(px, py, MOUTH, -20)) return false;
    return true; }
  return false;
}
export function treeOK(ax, ay) {
  if (inDesert(ax, ay)) return false; const px = ax + 2880, py = ay + 630;
  if (px < 2150) return false; if (py > 1180 && py < 1700) return false; if (inR(px, py, [1900, 2650, 420, 1000])) return false; if (inR(px, py, [1850, 2350, 1600, 1840])) return false;
  return true;
}
// sand west, grass east; the desert all sand
export function sandAt(X, Z) { const ax = X / S + 1440, ay = Z / S + 810; if (ax > 0) return 0; if (ax < -2880) return 1; return 1 - sm(-980, -380, ax); }
export function flatMask(X, Z) { const x0 = AX(-5760), x1 = AX(0), z0 = AZ(-630), z1 = AZ(2250); const ddx = Math.max(0, x0 - X, X - x1), ddz = Math.max(0, z0 - Z, Z - z1), d = Math.hypot(ddx, ddz); return d <= 0 ? 1 : Math.max(0, 1 - d / 12); }
function segDist(px, py, pts) { let best = 1e9; for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], vx = x1 - x0, vy = y1 - y0, L = vx * vx + vy * vy; const t = Math.max(0, Math.min(1, ((px - x0) * vx + (py - y0) * vy) / L)); best = Math.min(best, Math.hypot(px - x0 - vx * t, py - y0 - vy * t)); } return best; }
const rectDist = (px, py, r) => Math.hypot(Math.max(0, r[0] - px, px - r[1]), Math.max(0, r[2] - py, py - r[3]));
// low dunes in the desert, kept flat along the trail and round the buildings
export function dune(X, Z) {
  const ax = X / S + 1440, ay = Z / S + 810; if (ax > -2880 || ax < -5900) return 0; const px = ax + 5760, py = ay + 630;
  const keep = Math.min(segDist(px, py, TRAIL), segDist(px, py, TRAIL2), rectDist(px, py, TEMPLE), rectDist(px, py, PERMIT), rectDist(px, py, MOUTH));
  const m = sm(60, 220, keep) * sm(-2880, -3100, ax);
  const h = Math.max(0, Math.sin(px * 0.0042 + 1.3) * Math.cos(py * 0.0031) + 0.45 * Math.sin(px * 0.011 + py * 0.007));
  return h * 0.9 * m;
}

// ---- people ----
const SAGE_LOOK = { ...PLAYER_MALE, elder: 1, muzzle: '#f1e3cf', chin: '#f4f1ec', fluff: '#f4f4f6', tailTip: '#ffffff' };
export const FOXES = [
  { key: 'sage', name: 'Old Sage', role: 'Ruins Museum', outfit: 'robe', torso: ['#8a6d3b', '#5e4a28', '#3a2c17'], crest: 'M', look: SAGE_LOOK, stand: sqR(1330, 2330), face: Math.PI, mood: 'warm' },
  { key: 'ruinsGuard', name: 'Snag', role: 'Ruins road', outfit: 'armor', torso: ['#52525b', '#27272a', '#09090b'], crest: 'M', gear: 'sword', stand: sqR(1349, 1339), face: Math.PI / 2, mood: 'stern' },
  { key: 'spade', name: 'Spade', role: 'Permit Office', outfit: 'vest', torso: ['#d9c39a', '#a98a5c', '#6b552f'], crest: 'M', stand: sqD(2367, 478), face: 0, mood: 'warm' },
];
export const DIALOGUE = {
  ruinsGuard: [{ who: 'player', text: 'What is out west?' }, { who: 'npc', text: 'The RUINS. Past them the DESERT, and past that nothing anybody has bothered to give a name to.' }, { who: 'player', text: 'Anything I should know?' }, { who: 'npc', text: 'The site is safe enough in daylight. What is UNDER it is not, and the way under is a stair in the middle of the floor that most foxes find with their ankles.' }, { who: 'npc', text: 'The SAGE keeps a museum up there and pays full worth for anything old you carry out. He is the only reason this road gets swept.' }],
  sage: [{ who: 'npc', text: 'Another traveller drawn to the old stones. Come closer. Few climb this path now. Mind the plinths.' }, { who: 'player', text: 'What can you tell me about the ruins ahead?' }, { who: 'npc', text: 'Older than the Eight Gates themselves. When the centre hub was split, a shard fell here. This temple grew around it.' }, { who: 'npc', text: 'The builders are long gone. Their work still hums.' }, { who: 'player', text: 'Is it safe to go inside?' }, { who: 'npc', text: 'Safe? No. The lower halls flooded generations ago. The dark took what the water did not.' }, { who: 'npc', text: 'Bats, rats, and worse nest down there. Carry light. Keep your blade close. And do NOT trust the still water.' }, { who: 'player', text: 'Why do the ruins matter now?' }, { who: 'npc', text: 'A piece of the broken centre gate sleeps inside. The very fragment Luxor would kill to hold.' }, { who: 'npc', text: 'Whoever holds it holds a key to the gates. Tread carefully. The old stones remember everything.' }],
};
const P = t => ({ who: 'player', text: t }), N = t => ({ who: 'npc', text: t }), MX = t => ({ who: 'max', text: t });
// talks that change with the story (openSageTalk, openPermitDialogue), verbatim
export const DYN = {
  sage(flag, save) {
    const carrying = save.data.relics.length;
    return branch([N('Welcome to the RUINS MUSEUM. Every piece came out of the hill beneath you.'), P('You dug all this up yourself?'), N('Some. Travellers with more luck than sense brought the rest. Which brings me to my standing offer.'), N('Find a RELIC anywhere in Meru. Bring it here. I pay its FULL worth. No shopkeeper\u2019s half.')], [
      { label: carrying ? 'I have something for you. (' + carrying + ')' : 'I have something for you.', replies: carrying ? ['Let me see it, then.'] : ['Your pack is empty, child.', 'Go and look. The ruins below are full of it.'], do: carrying ? 'relics' : null },
      { label: 'Which piece is the prize?', replies: ['THE NINTH KEY. The far plinth, on your left. There were only ever EIGHT gates. And yet.', 'Every scholar who explains it argues with the last. I would not sell it for a kingdom.', 'The CRACKED GATE SIGIL I keep too. Worth twenty gold. Do not ask me to be consistent.'] },
      { label: 'What should I look for?', replies: ['Anything old that someone bothered to make BEAUTIFUL. A pin. A coin. A carving.', 'The bandits below have been pocketing things for years. They do not know what they hold. You will.'] },
      ...(flag('ringJob') && !flag('hasSageRing') ? [{ label: 'Lift the black stone ring.', replies: [], do: 'steal' }] : []),
      { label: 'Just looking, thank you.', replies: ['Take your time. It has waited far longer than you have.'] },
    ]);
  },
  spade(flag) {
    if (!flag('tournamentWon')) return branch([N('Permit? Not today, friend. Field\u0027s shut.'), P('Shut? There\u0027s nobody out here.'), N('That is why. They are all at the ARENA. King Might is hosting his own birthday tournament.'), P('Every digger went to watch?'), N('Every fox worth the name. I would be there too. Come back when the competition is done.'), N('Then I will stamp you one.')]);
    if (!flag('maxHome') && !flag('maxFollowing')) return branch([N('Permit? Not today, friend. Whole field\u0027s shut.'), P('Shut? There\u0027s nobody out here.'), N('That is the trouble. A lad went missing in these dunes. King Might\u0027s own son. Max. They say he went down the old stair.'), N('He never came back up. Nobody digs while a fox is lost. Find him. Get him home to his father.'), N('Then come back and I will stamp you one.')]);
    if (flag('maxFollowing') && !flag('digPermit')) return branch([N('Well now. That is the King\u0027s son at your shoulder.'), MX('It is. And this fox pulled me out.'), N('Out of where, Prince?'), MX('A cage. Down the old stair. Bandits.'), N('Then the field is open again because of you. Take a permit. Not a coin.')], [
      { label: 'Take the permit.', replies: ['Stamped. Four sites out there. Get him home first, mind.'], set: 'digPermit', do: 'dig' }, { label: 'Later \u2014 MAX comes first.', replies: ['Good fox. It will keep.'] }]);
    if (flag('digPermit')) return branch([N('Permit\u0027s still good. Sites are yours whenever you want them.')], [
      { label: 'Stamp me out to the field.', replies: ['Mind the storms. And the company.'], do: 'dig' }, { label: 'Just passing.', replies: ['Suit yourself. I\u0027m not going anywhere.'] }]);
    return branch([N('Well now. Word came up the road ahead of you. You pulled the King\u0027s son out of that hole.'), N('And walked him all the way to the castle.'), P('So what does a permit cost me?'), N('Cost you? Not a coin. The field is open again because of you. Take it. And take a shovel while you are here.')], [
      { label: 'Take the permit.', replies: ['Stamped. Four sites out there. The Colonnade is the gentlest place to start.'], set: 'digPermit', do: 'dig' }, { label: 'I\u0027ll come back for it.', replies: ['It\u0027ll keep. So will the sand.'] }]);
  },
};
export const SPOTS = [
  { gate: 'cave', label: 'Caves', key: 'meruRuinsInterior', x: dx(1440), z: dz(1840), r: 3.0 },
];

// ---- build ----
export function buildRuins(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, camBlockers, flames, emblemTex, signTex, cobbleTex, plazaTex, lampM, DARK, GOLD, WOOD, crystalM, heightAt, pointLights, windowM } = K;
  const root = new THREE.Group(); root.name = 'meruRuins+meruDesert'; scene.add(root);
  const W = p => p * S, Y = (x, z) => heightAt(x, z);
  const slab = (x0, x1, z0, z1, mat, top, y = 0) => { const m = new THREE.Mesh(BOX(x1 - x0, top, z1 - z0), mat); m.position.set((x0 + x1) / 2, y + top / 2, (z0 + z1) / 2); m.receiveShadow = true; root.add(m); return m; };
  const tex = (fn, a, b) => new THREE.MeshToonMaterial({ map: fn([a, b]), gradientMap: grad });
  const boxC = (x0, x1, z0, z1, h, mat, parent = root, out = 0.03) => { M(BOX(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, parent, out); colliders.push({ box: [x0, x1, z0, z1] }); };
  const stoneM = BK.texMat('stone', '#b8ab90', 3, 1), sandStone = toon('#c9b48c'), darkStone = toon('#8a7d66');

  // ======== RUINS PATH ========
  slab(rx(0), rx(2880), rz(1272), rz(1600), tex(cobbleTex, 2880 / 150, 328 / 150), 0.07);
  { const g = new THREE.Group(); g.position.set(rx(1395), 0, rz(1500)); root.add(g); M(new THREE.CylinderGeometry(W(70), W(70), 0.12, 40), toon('#8a8fb0'), 0, 0.08, 0, g, 0); const t = emblemTex(); const d = new THREE.Mesh(new THREE.CircleGeometry(W(62), 40), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); d.rotation.x = -Math.PI / 2; d.position.y = 0.145; g.add(d); }
  // low rails both sides of the road, with gaps onto the field and the museum
  const railM = toon('#3a3f6b'), postM = toon('#2a2e52');
  const rail = (py, gaps) => { let x = 0; const cuts = [...gaps, [2880, 2880]]; for (const [g0, g1] of cuts) { if (g0 > x + 20) { const a = rx(x), b = rx(g0); M(BOX(b - a, 0.6, 0.35), railM, (a + b) / 2, 0.3, rz(py), root, 0.02); colliders.push({ box: [a, b, rz(py) - 0.22, rz(py) + 0.22] }); for (let p = x; p <= g0; p += 240) M(BOX(0.4, 0.95, 0.45), postM, rx(Math.min(p, g0)), 0.47, rz(py), root, 0.02); } x = g1; } };
  rail(RAIL_N, GAPS_N); rail(RAIL_S, GAPS_S);
  BK.linePath([[rx(80), rz(1436)], [rx(2860), rz(1436)]], { every: 12, side: W(170), both: true, parent: root, colliders });
  for (const [px, py] of [[2850, 1240], [2850, 1660], [30, 1240], [30, 1660]]) { M(BOX(0.4, 0.5, 0.4), toon('#3a3a58'), rx(px), 0.25, rz(py), root, 0.03); const c = M(new THREE.OctahedronGeometry(0.28, 0), crystalM, rx(px), 0.95, rz(py), root, 0.03, 0.28); c.scale.y = 1.5; flames.push({ spin: c }); glowSprite(rx(px), 0.95, rz(py), 0x58d8ff, 2.0); }
  // the field north of the road: ruined wall lines, millstones, the dig site
  for (const [a, b, y] of [[66, 148, 42], [245, 310, 36], [422, 492, 30], [534, 582, 38], [110, 160, 100], [200, 258, 87], [366, 432, 82], [466, 520, 69], [555, 612, 96], [17, 85, 118], [115, 155, 158], [190, 258, 145], [44, 98, 171], [476, 516, 150], [545, 612, 160]]) {
    const x0 = rx(a * 4.5), x1 = rx(b * 4.5), z = rz(y * 4.5 + 120), h = 0.5 + ((a * 7) % 5) * 0.12; M(BOX(x1 - x0, h, 0.5), stoneM, (x0 + x1) / 2, h / 2, z, root, 0.02); colliders.push({ box: [x0, x1, z - 0.3, z + 0.3] });
    if (a % 3 === 0) M(new THREE.DodecahedronGeometry(0.35, 0), sandStone, x1 + 0.4, 0.2, z + 0.3, root, 0.02, 0.35); }
  for (const [px, py] of [[675, 922], [981, 1093], [2011, 472], [2250, 1021]]) { const m = M(new THREE.CylinderGeometry(0.75, 0.75, 0.3, 18), darkStone, rx(px), 0.15, rz(py), root, 0.02, 0.75); colliders.push({ c: [rx(px), rz(py), 0.75] }); M(new THREE.CylinderGeometry(0.15, 0.15, 0.32, 8), toon('#5a5040'), rx(px), 0.17, rz(py), root, 0); }
  slab(rx(DIG[0]), rx(DIG[1]), rz(DIG[2]), rz(DIG[3]), BK.texMat('tile', '#a8997a', 7, 5), 0.06);
  for (let px = DIG[0]; px <= DIG[1]; px += 100) M(BOX(0.05, 0.02, W(DIG[3] - DIG[2])), toon('#7a6c52'), rx(px), 0.075, rz((DIG[2] + DIG[3]) / 2), root, 0);
  for (let py = DIG[2]; py <= DIG[3]; py += 100) M(BOX(W(DIG[1] - DIG[0]), 0.02, 0.05), toon('#7a6c52'), rx((DIG[0] + DIG[1]) / 2), 0.075, rz(py), root, 0);
  for (const [px, py] of [[1341, 787], [1629, 810]]) { boxC(rx(px) - 0.55, rx(px) + 0.55, rz(py) - 1.3, rz(py) + 1.3, 1.0, toon('#d8d2c2')); M(BOX(1.25, 0.18, 2.75), toon('#c2bba8'), rx(px), 1.05, rz(py), root, 0.02); }
  { const p = M(new THREE.CylinderGeometry(0.4, 0.45, 3.6, 12), toon('#d8d2c2'), rx(1485), 0.4, rz(967), root, 0.03, 0.45); p.rotation.z = Math.PI / 2; p.rotation.y = 0.5; colliders.push({ c: [rx(1485), rz(967), 1.0] }); }
  for (let i = 0; i < 10; i++) M(new THREE.BoxGeometry(0.5 + R() * 0.4, 0.35, 0.45), toon('#cfc7b3'), rx(DIG[0] + 80 + R() * 640), 0.2, rz(DIG[2] + 60 + R() * 440), root, 0.02).rotation.y = R() * 3;
  // excavation grids, a tent, crates, the trench lantern
  for (const [a, b, c, d] of [[1957, 2272, 684, 891], [2326, 2574, 504, 666]]) { const x0 = rx(a), x1 = rx(b), z0 = rz(c), z1 = rz(d); slab(x0, x1, z0, z1, toon('#7a5a3a'), 0.05); for (let k = 0; k <= 4; k++) { M(BOX(0.08, 0.12, z1 - z0), WOOD, x0 + (x1 - x0) * k / 4, 0.1, (z0 + z1) / 2, root, 0); M(BOX(x1 - x0, 0.12, 0.08), WOOD, (x0 + x1) / 2, 0.1, z0 + (z1 - z0) * k / 4, root, 0); } for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) M(BOX(0.12, 0.6, 0.12), WOOD, x, 0.3, z, root, 0.01); }
  { const g = new THREE.Group(); g.position.set(rx(2440), 0, rz(820)); root.add(g); const tent = new THREE.Mesh(new THREE.ConeGeometry(1.7, 2.0, 4), toon('#efe6cf')); tent.position.y = 1.0; tent.rotation.y = Math.PI / 4; tent.castShadow = true; g.add(tent); M(BOX(0.8, 1.2, 0.05), DARK, 0, 0.6, 1.2, g, 0); colliders.push({ c: [rx(2440), rz(820), 1.4] }); }
  boxC(rx(2101) - 0.4, rx(2101) + 0.4, rz(877) - 0.4, rz(877) + 0.4, 0.8, WOOD); M(new THREE.CylinderGeometry(0.35, 0.35, 0.8, 12), WOOD, rx(2304), 0.4, rz(846), root, 0.02, 0.35);
  BK.lantern(rx(2310), rz(914), root, colliders);
  // west plot beside the museum
  slab(rx(700), rx(880), rz(2047), rz(2272), toon('#6e5434'), 0.05); for (let k = 0; k < 5; k++) M(BOX(W(170), 0.08, 0.12), toon('#5a4428'), rx(790), 0.1, rz(2070 + k * 45), root, 0);
  // ---- the RUINS MUSEUM (walk-in, no fade; the roof lifts off while you are inside) ----
  const mus = new THREE.Group(); root.add(mus); camBlockers.push(mus);
  const mx0 = rx(MUS.x0), mx1 = rx(MUS.x1), mz0 = rz(MUS.y0), mz1 = rz(MUS.y1), mh = 4.2, wt = W(MUS.in[0] - MUS.x0);
  const mWall = BK.texMat('stone', '#2c3058', 6, 2), mTrim = toon('#e6e1d3');
  boxC(mx0, mx1, mz1 - wt, mz1, mh, mWall, mus); boxC(mx0, mx0 + wt, mz0, mz1, mh, mWall, mus); boxC(mx1 - wt, mx1, mz0, mz1, mh, mWall, mus);
  boxC(mx0, rx(MUS.door[0]), mz0, mz0 + wt, mh, mWall, mus); boxC(rx(MUS.door[1]), mx1, mz0, mz0 + wt, mh, mWall, mus);
  M(BOX(W(MUS.door[1] - MUS.door[0]), mh - 2.8, wt), mWall, rx(1400), 2.8 + (mh - 2.8) / 2, mz0 + wt / 2, mus, 0.02);
  M(BOX(mx1 - mx0 + 0.3, 0.25, 0.4), mTrim, (mx0 + mx1) / 2, mh, mz0, mus, 0.015);
  const roof = new THREE.Group(); mus.add(roof); M(BOX(mx1 - mx0 + 0.6, 0.35, mz1 - mz0 + 0.6), toon('#1f2650'), (mx0 + mx1) / 2, mh + 0.2, (mz0 + mz1) / 2, roof, 0.03); M(BOX(mx1 - mx0 - 2, 0.6, mz1 - mz0 - 2), toon('#2a315a'), (mx0 + mx1) / 2, mh + 0.6, (mz0 + mz1) / 2, roof, 0.02);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(mx1 - mx0 - 2 * wt, mz1 - mz0 - 2 * wt), BK.texMat('tile', '#d6d3e6', 8, 8)); floor.rotation.x = -Math.PI / 2; floor.position.set((mx0 + mx1) / 2, 0.06, (mz0 + mz1) / 2); floor.receiveShadow = true; mus.add(floor);
  slab(rx(1225), rx(1575), rz(1616), mz0, toon('#c9c7dc'), 0.12); slab(rx(1290), rx(1510), rz(1700), mz0, toon('#bdbbd2'), 0.2);
  const runner = new THREE.Mesh(BOX(W(70), 0.03, rz(2380) - rz(1860)), toon('#a8323e')); runner.position.set(rx(1400), 0.08, (rz(1860) + rz(2380)) / 2); mus.add(runner);
  const relicCol = ['#e6b45a', '#7dd3fc', '#f472b6', '#cbd5e1', '#4ade80', '#c084fc'];
  [[1110, 1957], [1110, 2160], [1110, 2349], [1690, 1957], [1690, 2160], [1690, 2349]].forEach(([px, py], i) => { const x = rx(px), z = rz(py); boxC(x - 0.45, x + 0.45, z - 0.45, z + 0.45, 1.0, toon('#26306b'), mus); M(BOX(0.95, 0.06, 0.95), mTrim, x, 1.02, z, mus, 0.01);
    const relic = M(i % 2 ? new THREE.OctahedronGeometry(0.2, 0) : new THREE.TorusGeometry(0.16, 0.05, 6, 16), toon(relicCol[i], { emissive: new THREE.Color(relicCol[i]), emissiveIntensity: 0.4 }), x, 1.3, z, mus, 0.01); flames.push({ spin: relic });
    const glass = new THREE.Mesh(BOX(0.8, 0.7, 0.8), new THREE.MeshBasicMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.16, depthWrite: false })); glass.position.set(x, 1.4, z); mus.add(glass);
    for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 6), GOLD, x + (px < 1400 ? 0.9 : -0.9), 0.45, z + s * 0.6, mus, 0); });
  boxC(rx(1480), rx(1640), rz(2400), rz(2440), 1.0, WOOD, mus); M(BOX(W(160) + 0.2, 0.06, 0.7), toon('#3a2618'), rx(1560), 1.02, rz(2420), mus, 0.01);
  for (const [px, py] of [[1080, 1880], [1720, 1880], [1080, 2440], [1720, 2440]]) BK.sconce(mus, rx(px) + (px < 1400 ? 0.1 : -0.1), 2.6, rz(py), px < 1400 ? Math.PI / 2 : -Math.PI / 2);
  { const L = new THREE.PointLight(0xffd6a0, 0, 12, 1.6); L.position.set(rx(1400), 3.4, rz(2150)); scene.add(L); pointLights.push({ L, k: 9 }); }
  { const st = signTex('RUINS MUSEUM', null, '#e6b45a'); const g = new THREE.Group(); g.position.set(rx(2092), 0, rz(1720)); root.add(g); for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.08, 0.08, 2.4, 8), DARK, s * 2.1, 1.2, 0, g, 0.01, 0.08); M(BOX(4.6, 1.15, 0.16), [DARK, DARK, DARK, DARK, glowing(0, st, 1.2), DARK], 0, 2.2, 0, g, 0.03); colliders.push({ box: [rx(2092) - 2.3, rx(2092) + 2.3, rz(1720) - 0.2, rz(1720) + 0.2] }); }

  // ======== DESERT RUINS ========
  // trodden trail + lanterns (the "always see the path" rule)
  const trailM = toon('#c7a46a');
  const trail = (pts, w) => { for (let i = 0; i < pts.length - 1; i++) { const [a, b] = pts[i], [c, d] = pts[i + 1]; const x0 = dx(a), z0 = dz(b), x1 = dx(c), z1 = dz(d), L = Math.hypot(x1 - x0, z1 - z0); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, L + w), trailM); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(x1 - x0, z1 - z0); m.position.set((x0 + x1) / 2, 0.035, (z0 + z1) / 2); m.receiveShadow = true; root.add(m); } };
  trail(TRAIL, 3.2); trail(TRAIL2, 2.4);
  BK.linePath(TRAIL.map(([a, b]) => [dx(a), dz(b)]), { every: 11, side: 2.4, kind: 'lantern', parent: root, colliders });
  BK.linePath(TRAIL2.map(([a, b]) => [dx(a), dz(b)]), { every: 9, side: 1.9, kind: 'lantern', parent: root, colliders });
  // the temple over the old stair: base, colonnade, pediment, the cave mouth
  { const g = new THREE.Group(); root.add(g); camBlockers.push(g); const x0 = dx(TEMPLE[0]), x1 = dx(TEMPLE[1]), z0 = dz(TEMPLE[2]), z1 = dz(TEMPLE[3]), cxm = (x0 + x1) / 2, w = x1 - x0, d = z1 - z0;
    const tM = BK.texMat('stone', '#d6ccb4', w / 2.4, 2); boxC(x0, x1, z0, z1, 0.8, toon('#bfb398'), g); M(BOX(w - 1.2, 5.2, d - 2.4), tM, cxm, 3.4, (z0 + z1) / 2 - 0.6, g, 0.04);
    for (let i = 0; i < 6; i++) { const x = x0 + 1.0 + i * (w - 2.0) / 5; M(new THREE.CylinderGeometry(0.42, 0.48, 5.0, 14), toon('#efe7d3'), x, 3.3, z1 - 0.9, g, 0.03, 0.48); M(BOX(1.1, 0.3, 1.1), toon('#d8d0bb'), x, 0.95, z1 - 0.9, g, 0.02); M(BOX(1.1, 0.3, 1.1), toon('#d8d0bb'), x, 5.9, z1 - 0.9, g, 0.02); }
    M(BOX(w + 0.3, 0.6, d), toon('#cbbf9f'), cxm, 6.35, (z0 + z1) / 2, g, 0.03);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.001, w / 2 + 0.2, 1.8, 3, 1), toon('#d8ccae')); ped.rotation.set(Math.PI / 2, 0, 0); ped.scale.set(1, d, 0.75); ped.position.set(cxm, 7.1, (z0 + z1) / 2); ped.castShadow = true; g.add(ped);
    const st = signTex('RUINS', null, '#a98a5c'); M(BOX(3.6, 0.9, 0.16), [DARK, DARK, DARK, DARK, glowing(0, st, 1.1), DARK], cxm, 6.35, z1 + 0.12, g, 0.02);
    const mz0 = dz(MOUTH[2]), mz1 = dz(MOUTH[3]), mxa = dx(MOUTH[0]), mxb = dx(MOUTH[1]);
    for (const s of [mxa, mxb]) boxC(s - 0.45, s + 0.45, mz0, mz1, 1.6, toon('#8a7d66'), g);
    M(BOX(mxb - mxa + 0.9, 0.45, 0.8), toon('#8a7d66'), (mxa + mxb) / 2, 1.8, mz1 - 0.4, g, 0.02);
    const pit = new THREE.Mesh(new THREE.PlaneGeometry(mxb - mxa - 0.9, mz1 - mz0), new THREE.MeshBasicMaterial({ color: 0x0b0a12 })); pit.rotation.x = -Math.PI / 2; pit.position.set((mxa + mxb) / 2, 0.06, (mz0 + mz1) / 2); g.add(pit);
    for (let k = 0; k < 5; k++) M(BOX(mxb - mxa - 1.0, 0.06, 0.3), toon('#3a3448'), (mxa + mxb) / 2, 0.05 - k * 0.001, mz1 - 0.6 - k * 0.9, g, 0);
    const cs = signTex('CAVES', null, '#a98a5c'); M(BOX(2.8, 0.7, 0.14), [DARK, DARK, DARK, DARK, glowing(0, cs, 1.1), DARK], (mxa + mxb) / 2, 2.4, mz1 - 0.3, g, 0.02);
    for (const s of [mxa - 0.9, mxb + 0.9]) { M(new THREE.CylinderGeometry(0.06, 0.08, 1.8, 8), DARK, s, 0.9, mz1 + 0.2, g, 0.01, 0.08); M(new THREE.SphereGeometry(0.2, 10, 8), lampM, s, 1.9, mz1 + 0.2, g, 0.01, 0.2); glowSprite(s, 1.9, mz1 + 0.2, 0xffb060, 2.2, g); } }
  // the PERMIT OFFICE [meruPermitOffice] (2D surveyoffice.js): walk-in, no fade, the roof lifts while you are inside.
  // Grown around the old shed's door: box 1990-2700 x 300-960, door 2272-2462 in the south wall, counter with a way round its east end,
  // four racks of pigeonholes on the back wall under PERMITS, Spade in the service strip between them.
  const OF = { x0: dx(1990), x1: dx(2700), z0: dz(300), z1: dz(960), wt: 46 * S, h: 3.6, dl: dx(2272), dr: dx(2462) };
  let ofRoof;
  { const g = new THREE.Group(); root.add(g); camBlockers.push(g); const { x0, x1, z0, z1, wt, h } = OF, cxm = (x0 + x1) / 2, czm = (z0 + z1) / 2;
    const wall = BK.texMat('plank', '#b98a52', 5, 1.6), trim = toon('#6b4a20');
    boxC(x0, x1, z0, z0 + wt, h, wall, g); boxC(x0, x0 + wt, z0, z1, h, wall, g); boxC(x1 - wt, x1, z0, z1, h, wall, g);
    boxC(x0, OF.dl, z1 - wt, z1, h, wall, g); boxC(OF.dr, x1, z1 - wt, z1, h, wall, g); M(BOX(OF.dr - OF.dl, h - 2.6, wt), wall, (OF.dl + OF.dr) / 2, 2.6 + (h - 2.6) / 2, z1 - wt / 2, g, 0.02);
    M(BOX(x1 - x0 + 0.1, 0.22, 0.2), trim, cxm, h - 0.1, z1 + 0.02, g, 0);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 2 * wt, z1 - z0 - 2 * wt), BK.texMat('plank', '#6b5334', 5, 4)); fl.rotation.x = -Math.PI / 2; fl.position.set(cxm, 0.05, czm); fl.receiveShadow = true; g.add(fl);
    ofRoof = new THREE.Group(); g.add(ofRoof); M(BOX(x1 - x0 + 0.6, 0.3, z1 - z0 + 0.6), toon('#6b4a2e'), cxm, h + 0.15, czm, ofRoof, 0.02); M(BOX(x1 - x0 - 2, 0.5, z1 - z0 - 2), toon('#7a5634'), cxm, h + 0.5, czm, ofRoof, 0.02);
    // the front: awning, windows, sign, doormat, lamps either side
    M(BOX(OF.dr - OF.dl + 2.4, 0.12, 1.2), toon('#c42d3c'), (OF.dl + OF.dr) / 2, 2.75, z1 + 0.55, g, 0.015).rotation.x = 0.25;
    for (const xx of [x0 + 2.4, x1 - 2.4]) M(BOX(1.4, 0.9, 0.1), windowM, xx, 1.7, z1 + 0.06, g, 0);
    const st = signTex('PERMIT OFFICE', null, '#c42d3c'); M(BOX(4.6, 0.9, 0.14), [DARK, DARK, DARK, DARK, glowing(0, st, 1.1), DARK], (OF.dl + OF.dr) / 2, 3.2, z1 + 0.12, g, 0.02);
    M(BOX(2.6, 0.08, 0.9), toon('#e7dcc2'), (OF.dl + OF.dr) / 2, 0.04, z1 + 1.0, g, 0);
    for (const px of [1950, 2740]) BK.lampPost(dx(px), dz(1010), g, colliders);
    // inside: the counter (2066-2500 x 516-628), the four racks, PERMITS on the back wall, a stamp and papers, a shovel by the end
    const cx0 = dx(2066), cx1 = dx(2500), cz0 = dz(516), cz1 = dz(628);
    boxC(cx0, cx1, cz0, cz1, 1.05, toon('#8a6440'), g); M(BOX(cx1 - cx0 + 0.1, 0.08, cz1 - cz0 + 0.1), toon('#e7dcc2'), (cx0 + cx1) / 2, 1.09, (cz0 + cz1) / 2, g, 0.01);
    M(BOX(0.35, 0.2, 0.25), toon('#c42d3c'), dx(2300), 1.2, (cz0 + cz1) / 2, g, 0.01); for (let i = 0; i < 3; i++) M(BOX(0.5, 0.02, 0.36), toon('#fbfaf5'), dx(2160) + i * 0.12, 1.14 + i * 0.02, (cz0 + cz1) / 2, g, 0);
    const rw = (x1 - x0 - 2 * wt - 5 * 24 * S) / 4, rz0 = dz(352), rz1 = dz(432);
    for (let i = 0; i < 4; i++) { const rxx = x0 + wt + 24 * S + i * (rw + 24 * S) + rw / 2; boxC(rxx - rw / 2, rxx + rw / 2, z0 + wt, z0 + wt + 0.5, 2.2, toon('#4a3520'), g);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) M(BOX(rw / 7, 0.18, 0.04), toon('#e8dfc6'), rxx - rw / 2 + (c + 0.5) * rw / 6, 0.8 + r * 0.55, z0 + wt + 0.52, g, 0); }
    { const c = document.createElement('canvas'); c.width = 512; c.height = 112; const x = c.getContext('2d'); x.fillStyle = '#4a3520'; x.fillRect(0, 0, 512, 112); x.fillStyle = '#f0d5a6'; x.font = '800 64px Archivo, Arial'; x.textBaseline = 'middle'; x.fillText('PERMITS', 24, 60); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.75), new THREE.MeshBasicMaterial({ map: tx })); m.position.set(cxm, 2.9, z0 + wt + 0.02); g.add(m); }
    M(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), WOOD, dx(2560), 0.75, dz(470), g, 0.01).rotation.z = 0.25; M(BOX(0.32, 0.4, 0.05), toon('#9aa6b5'), dx(2560) + 0.2, 0.2, dz(470), g, 0.01);
    const L = new THREE.PointLight(0xffd9a8, 0, 12, 1.5); L.position.set(cxm, h - 0.6, czm); g.add(L); pointLights && pointLights.push && pointLights.push({ L, k: 7, office: true }); M(new THREE.CylinderGeometry(0.25, 0.35, 0.3, 10), lampM, cxm, h - 0.4, czm, g, 0.01, 0.35); }
  const inOffice = (x, z) => x > OF.x0 && x < OF.x1 && z > OF.z0 && z < OF.z1 + 0.2;
  // standing stones and rocks across the dunes (kept off the trail)
  let n = 0; for (let i = 0; i < 400 && n < 34; i++) { const px = 80 + R() * 2720, py = 80 + R() * 2700; if (segDist(px, py, TRAIL) < 120 || segDist(px, py, TRAIL2) < 100 || rectDist(px, py, TEMPLE) < 140 || rectDist(px, py, PERMIT) < 140 || rectDist(px, py, MOUTH) < 160) continue; n++;
    const x = dx(px), z = dz(py), y = Y(x, z), h = 1.2 + R() * 2.6, r = 0.28 + R() * 0.2; const p = M(new THREE.CylinderGeometry(r * 0.85, r, h, 8), toon(R() < 0.5 ? '#d8cfb8' : '#c9bfa6'), x, y + h / 2 - 0.1, z, root, 0.025, r); p.rotation.z = (R() - 0.5) * 0.15; colliders.push({ c: [x, z, r + 0.1] }); }
  n = 0; for (let i = 0; i < 400 && n < 30; i++) { const px = 60 + R() * 2760, py = 60 + R() * 2760; if (segDist(px, py, TRAIL) < 90 || segDist(px, py, TRAIL2) < 80 || rectDist(px, py, TEMPLE) < 100 || rectDist(px, py, PERMIT) < 100) continue; n++;
    const x = dx(px), z = dz(py), s = 0.3 + R() * 0.7; const m = M(new THREE.DodecahedronGeometry(s, 0), toon(R() < 0.5 ? '#9a8f7c' : '#b0a48d'), x, Y(x, z) + s * 0.3, z, root, 0.02, s); m.scale.y = 0.55; m.rotation.y = R() * 3; if (s > 0.6) colliders.push({ c: [x, z, s] }); }

  // museum roof lifts while you are inside
  const inMus = (x, z) => x > mx0 && x < mx1 && z > mz0 && z < mz1;
  // split into the two zones so each can be hidden when you are far from it
  const rootR = new THREE.Group(), rootD = new THREE.Group(); scene.add(rootR, rootD); const edge = dx(2880), bb = new THREE.Box3(), cc = new THREE.Vector3();
  [...root.children].forEach(o => { bb.setFromObject(o); bb.getCenter(cc); (cc.x < edge ? rootD : rootR).add(o); }); scene.remove(root);
  return { rootR, rootD, inOffice, update(x, z, indoor) { roof.visible = indoor || !inMus(x, z); ofRoof.visible = indoor || !inOffice(x, z); } };
}
