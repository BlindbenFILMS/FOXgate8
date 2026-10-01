// MERU — the Lake [meruLake]: a zone of the ONE outdoor map, south of the square (walk out of the south gate, no fade).
// Laid out from the 2D scene (ref/meruLake.*). Lake px → town art: ax = px + 600, ay = py + 1620.
// Water from the 2D water map; the jetty is land. People, lines and prices verbatim from surface_meru.html.
import { branch } from '../engine/story.js';

const S = 80 / 2880, SRC_Y = 1620 / 2880;
const AX = a => (a - 1440) * S, AZ = a => (a - 810) * S;
export const lx = px => AX(px + 600), lz = py => AZ(py + 1620);
const sq = (px, py) => [px + 600, (py + 1620) / SRC_Y];
const L15 = (x, y) => [x * 1.5, y * 1.5];                 // the 2D lake placed people/spots in 1920 space

let WAT = null; export function setWater(rows) { WAT = rows; }
function rowsHit(R, px, py) { if (!R || py < R[0].y || py > R[R.length - 1].y + 8) return false; let lo = 0, hi = R.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (R[m].y <= py) lo = m; else hi = m - 1; } for (const [a, b] of R[lo].s) if (px >= a - 4 && px <= b + 4) return true; return false; }
const JETTY = [[1575, 1845, 760, 1450], [1500, 1920, 1450, 1580]];
const inJetty = (px, py) => JETTY.some(([a, b, c, d]) => px >= a && px <= b && py >= c && py <= d);
const toPx = (ax, ay) => [ax - 600, ay - 1620];
export function inZone(ax, ay) { const [px, py] = toPx(ax, ay); return px >= 0 && px <= 2880 && py >= 0 && py <= 2880; }
export const waterAt = (ax, ay) => { const [px, py] = toPx(ax, ay); return rowsHit(WAT, px, py); };
export function walkable(ax, ay) { const [px, py] = toPx(ax, ay); if (px < 30 || px > 2850 || py > 2850) return false; if (inJetty(px, py)) return true; return !rowsHit(WAT, px, py); }
export function boatable(ax, ay) { const [px, py] = toPx(ax, ay); if (inJetty(px, py)) return false; if (!rowsHit(WAT, px, py)) return false; for (const [dx, dy] of [[30, 0], [-30, 0], [0, 30], [0, -30]]) if (!rowsHit(WAT, px + dx, py + dy) && !inJetty(px + dx, py + dy)) return false; return true; }
export function treeOK(ax, ay) { const [px, py] = toPx(ax, ay); if (py < 800 && px > 200 && px < 2650) return false; if (px > 700 && px < 1000 && py < 500) return false; for (const [dx, dy] of [[0, 0], [70, 0], [-70, 0], [0, 70], [0, -70]]) if (rowsHit(WAT, px + dx, py + dy) || inJetty(px + dx, py + dy)) return false; if (Math.hypot(px - 2740, py - 1990) < 160) return false; return true; }
// terrain: flat round the lake, a basin under the water
export function flatMask(X, Z) { const x0 = lx(0), x1 = lx(2880), z0 = lz(0), z1 = lz(2880); const dx = Math.max(0, x0 - X, X - x1), dz = Math.max(0, z0 - Z, Z - z1), d = Math.hypot(dx, dz); return d <= 0 ? 1 : Math.max(0, 1 - d / 12); }
export function basin(X, Z) { const ax = X / S + 1440, ay = Z / S + 810; if (!inZone(ax, ay)) return 0; const [px, py] = toPx(ax, ay); if (!rowsHit(WAT, px, py) && !inJetty(px, py)) return 0; let deep = 0; for (const r of [50, 110, 180]) if (rowsHit(WAT, px + r, py) && rowsHit(WAT, px - r, py) && rowsHit(WAT, px, py + r) && rowsHit(WAT, px, py - r)) deep++; return -(0.7 + deep * 0.5); }
export const WATER_Y = -0.3;

export const FOXES = [
  { key: 'fisherwoman', name: 'Fisherwoman', role: 'The Lake', outfit: 'vest', female: true, torso: ['#99d6c8', '#5fa89a', '#2d6b60'], crest: '8', stand: sq(...L15(1040, 1013)), face: Math.PI, mood: 'happy' },
  { key: 'fisherman', name: 'Fisherman', role: 'Boat hire', outfit: 'vest', torso: ['#d4b896', '#b8956a', '#7a5c38'], crest: '8', stand: sq(...L15(1193, 1013)), face: Math.PI, mood: 'warm' },
];
export const DIALOGUE = {
  fisherwoman: [{ who: 'npc', text: 'You just missed it!' }, { who: 'player', text: 'What did I miss?' }, { who: 'npc', text: 'PRINCE MAX was diving for HULL PEARLS.' }, { who: 'npc', text: 'He woke the sea monster. NELLY!' }, { who: 'player', text: 'He is okay? What\u2019s up with the pearls and the sea monster?' }, { who: 'npc', text: 'Prince Max fled fast.' }, { who: 'npc', text: 'Said he was off to the TAVERN. Calm his nerves.' }],
};
const N = t => ({ who: 'npc', text: t }), P = t => ({ who: 'player', text: t });
// openFishermanDialogue + openBoatRental, verbatim (the SMARTS options wait for the stats system)
export const DYN = {
  fisherman(flag, save) {
    const rented = flag('boatRented');
    const answer = [N('HULL PEARLS are the strongest material in the known universe.'), N('They are also the POOP of our own SEA MONSTER!'), P('Wow. I knew poop could fertilise crops. I did not know it covered our starships!'), N(rented ? 'Yup, it is interesting! She is all yours, friend \u2014 the boat is waiting at the dock.' : 'Yup, it is interesting! By the way \u2014 do you want to rent the boat?')];
    const t = branch([N('FREE FISHING here. And DIVE for HULL PEARLS. If you are brave enough to face NELLY.')], [
      { label: 'What are HULL PEARLS?', replies: [], do: rented ? null : 'offer' }, { label: 'Who is NELLY?', replies: [], do: rented ? null : 'offer' },
      { label: 'RENT BOAT', replies: rented ? ['She is already yours, friend. Waiting for you at the dock.'] : ['Course you can. Let me find the paperwork.'], do: rented ? null : 'offer' },
      { label: 'MAYBE LATER', replies: ['Suit yourself. The lake is not going anywhere.'] }]);
    t.nodes.b0.lines = answer.slice(); t.nodes.b1.lines = answer.slice(); return t;
  },
};
export const RENTAL = canPay => branch([N('RENT the boat for 1 GOLD?')], [
  { label: 'YES', replies: canPay ? ['One gold. She is yours.'] : ['\u2026you have not got a coin on you, have you. Take her anyway \u2014 bring me one when you are richer.'], set: 'boatRented', do: canPay ? 'pay1' : null },
  { label: 'NO', replies: ['Suit yourself. She will be here when you are ready.'] }]);

const [mwx, mwy] = [1710, 1660], [mlx, mly] = [1710, 1540];
export const SPOTS = [
  { gate: 'fish', text: 'Go FISHING', x: lx(...[835]), z: lz(818), r: 2.2, onLand: true },
  { gate: 'board', text: 'Board the boat', x: lx(mlx), z: lz(mly), r: 2.0, onLand: true },
];
export const MOOR = { x: lx(mwx), z: lz(mwy) + 0.6, face: Math.PI };
export const ASHORE = { x: lx(mlx), z: lz(mly) - 0.4 };
export const DIVES = [[1620, 1280], [1573, 660], [760, 1553], [1220, 1480], [353, 1280]].map(([x, y]) => { const [a, b] = L15(x, y); return { x: lx(a), z: lz(b), r: 2.6 }; });

export function buildLake(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, flames, signTex, DARK, WOOD, heightAt } = K;
  const root = new THREE.Group(); root.name = 'meruLake'; scene.add(root);
  const W = p => p * S;
  // water
  const water = new THREE.Mesh(new THREE.PlaneGeometry(W(2700), W(2000), 1, 1), new THREE.MeshToonMaterial({ color: '#3f86c4', gradientMap: grad, emissive: new THREE.Color('#123e6e'), emissiveIntensity: 0.35, transparent: true, opacity: 0.92 }));
  water.rotation.x = -Math.PI / 2; water.position.set(lx(1420), WATER_Y, lz(1680)); water.receiveShadow = true; root.add(water);
  // beach, road from the south gate, stream, little waterfall
  const sand = new THREE.Mesh(BOX(W(2370), 0.05, W(370)), toon('#e7d4a4')); sand.position.set(lx(1435), 0.02, lz(615)); sand.receiveShadow = true; root.add(sand);
  const road = new THREE.Mesh(BOX(W(200), 0.06, W(440)), toon('#d9c395')); road.position.set(lx(840), 0.03, lz(220)); road.receiveShadow = true; root.add(road);
  const stream = new THREE.Mesh(BOX(W(100), 0.04, W(780)), new THREE.MeshToonMaterial({ color: '#4b8fd0', gradientMap: grad, emissive: new THREE.Color('#163f70'), emissiveIntensity: 0.35 })); stream.position.set(lx(380), 0.03, lz(370)); root.add(stream);
  colliders.push({ box: [lx(330), lx(430), lz(0), lz(760)] });
  for (let i = 0; i < 6; i++) { const f = M(new THREE.SphereGeometry(0.3 + i * 0.05, 8, 6), glowing('#dff2ff', null, 0.5), lx(380) + (i - 2.5) * 0.4, -0.05, lz(790) + Math.sin(i) * 0.3, root, 0); f.castShadow = false; }
  // the jetty: walkway + T-head, posts, bollards, lamps at the end
  const deck = BK.texMat('plank', '#8a6440', 2, 8);
  M(BOX(W(270), 0.18, W(690)), deck, lx(1710), 0.35, lz(1105), root, 0.02); M(BOX(W(420), 0.18, W(130)), BK.texMat('plank', '#8a6440', 4, 1), lx(1710), 0.35, lz(1515), root, 0.02);
  for (let py = 780; py <= 1570; py += 90) for (const px of (py > 1440 ? [1505, 1915] : [1580, 1840])) M(new THREE.CylinderGeometry(0.12, 0.12, 1.7, 7), toon('#4a3424'), lx(px), -0.4, lz(py), root, 0.01, 0.12);
  for (const px of [1520, 1900]) for (const py of [1460, 1570]) M(new THREE.CylinderGeometry(0.14, 0.18, 0.5, 8), DARK, lx(px), 0.65, lz(py), root, 0.01, 0.18);
  for (const px of [1530, 1890]) BK.lantern(lx(px), lz(1560), root, null, '#ffd38a');
  // two rowboats on the beach, the boat-hire sign, crates, a bench, fire pits, the fishing ring
  for (const [px, py, r] of [[1180, 590, 0.4], [2300, 640, -0.3]]) { const g = new THREE.Group(); g.position.set(lx(px), 0.25, lz(py)); g.rotation.y = r; root.add(g); const h = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon('#7a5236', { side: THREE.DoubleSide })); h.scale.set(0.9, 0.5, 2.0); h.rotation.x = Math.PI; g.add(h); colliders.push({ c: [lx(px), lz(py), 1.4] }); }
  { const st = signTex('BOAT HIRE', null, '#38bdf8'); const g = new THREE.Group(); g.position.set(lx(700), 0, lz(700)); root.add(g); M(new THREE.CylinderGeometry(0.07, 0.07, 1.8, 6), WOOD, 0, 0.9, 0, g, 0.01, 0.07); M(BOX(2.2, 0.55, 0.1), [DARK, DARK, DARK, DARK, DARK, glowing(0, st, 1.1)], 0, 1.75, 0, g, 0.02); colliders.push({ c: [lx(700), lz(700), 0.3] }); }
  for (const [px, py] of [[1450, 640], [1490, 660]]) M(BOX(0.6, 0.5, 0.6), WOOD, lx(px), 0.25, lz(py), root, 0.02);
  for (const [px, py] of [[1890, 700], [2020, 450], [2080, 480]]) { M(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 10), WOOD, lx(px), 0.25, lz(py), root, 0.02, 0.3); colliders.push({ c: [lx(px), lz(py), 0.35] }); }
  for (const [px, py] of [[515, 540], [1950, 540]]) { M(BOX(1.8, 0.12, 0.5), WOOD, lx(px), 0.45, lz(py), root, 0.02); colliders.push({ box: [lx(px) - 0.9, lx(px) + 0.9, lz(py) - 0.3, lz(py) + 0.3] }); }
  for (const [px, py] of [[620, 430], [2740, 1990]]) { const g = new THREE.Group(); g.position.set(lx(px), 0, lz(py)); root.add(g); for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; M(new THREE.DodecahedronGeometry(0.18, 0), toon('#6b6280'), Math.cos(a) * 0.55, 0.1, Math.sin(a) * 0.55, g, 0.01, 0.18); } const f1 = M(new THREE.ConeGeometry(0.35, 0.8, 7), glowing('#ff8a2a', null, 2.4), 0, 0.42, 0, g, 0); const f2 = M(new THREE.ConeGeometry(0.18, 0.5, 7), glowing('#ffe28a', null, 2.4), 0, 0.34, 0, g, 0); f1.castShadow = f2.castShadow = false; flames.push({ fl: f1, fi: f2, ph: px }); glowSprite(0, 0.6, 0, 0xff9a40, 3.6, g); colliders.push({ c: [lx(px), lz(py), 0.7] }); }
  const ringM = toon('#ddd4ee', { emissive: new THREE.Color('#ddd4ee'), emissiveIntensity: 0.6 });
  { const r = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.07, 6, 32), ringM); r.rotation.x = Math.PI / 2; r.position.set(lx(835), 0.08, lz(818)); root.add(r); }
  // dive rings + pearl glints on the water
  const diveRings = DIVES.map(d => { const r = new THREE.Mesh(new THREE.TorusGeometry(d.r * 0.8, 0.08, 6, 32), toon('#7dd3fc', { emissive: new THREE.Color('#7dd3fc'), emissiveIntensity: 0.9 })); r.rotation.x = Math.PI / 2; r.position.set(d.x, WATER_Y + 0.05, d.z); root.add(r); return r; });
  // boulders in the lake + round the shore
  for (const [px, py, s] of [[700, 2100, 1.6], [1420, 2240, 2.0], [2160, 2000, 1.6], [520, 960, 0.8], [350, 1720, 0.8], [2480, 1560, 0.9], [2400, 2400, 0.7], [1050, 2440, 0.7], [1870, 2340, 0.7]]) { const m = M(new THREE.DodecahedronGeometry(s, 0), toon('#8a8fa8'), lx(px), -0.1 + s * 0.35, lz(py), root, 0.03, s); m.scale.y = 0.65; }
  // lamps line the road down from the south gate and along the beach
  BK.linePath([[lx(840), lz(20)], [lx(840), lz(430)], [lx(1560), lz(430)], [lx(1700), lz(760)]], { every: 9, side: 1.9, kind: 'lantern', parent: root, colliders });
  // the boat (follows you when aboard; moored at the jetty otherwise)
  const boat = new THREE.Group(); { const hull = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), toon('#c42d3c', { side: THREE.DoubleSide })); hull.scale.set(0.95, 0.55, 2.1); hull.rotation.x = Math.PI; hull.position.y = 0.45; hull.castShadow = true; boat.add(hull); M(BOX(1.7, 0.08, 0.35), toon('#e7e1d3'), 0, 0.42, 0.3, boat, 0.01); M(BOX(1.8, 0.1, 4.0), toon('#f2f0ea'), 0, 0.47, 0, boat, 0); boat.children[boat.children.length - 1].scale.set(1, 1, 0.04); }
  boat.position.set(MOOR.x, WATER_Y, MOOR.z); boat.rotation.y = MOOR.face; root.add(boat);
  // Nelly: a hump and a head drifting through the deep water (the boat fight with the harpoon comes with the 3D minigame pass)
  const nelly = new THREE.Group(); { const m = toon('#3f8a6a'); for (let i = 0; i < 3; i++) M(new THREE.SphereGeometry(0.9 - i * 0.18, 12, 8), m, 0, 0.05, -i * 1.5, nelly, 0.04, 0.9); const neck = M(new THREE.CylinderGeometry(0.28, 0.4, 2.2, 10), m, 0, 1.0, 1.2, nelly, 0.03, 0.4); neck.rotation.x = 0.3; M(new THREE.SphereGeometry(0.5, 12, 8), m, 0, 2.1, 1.65, nelly, 0.03, 0.5); for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.1, 8, 6), toon('#fff6c8'), s * 0.22, 2.25, 2.05, nelly, 0.01); }
  nelly.position.set(lx(1300), WATER_Y - 0.25, lz(1950)); root.add(nelly);
  let t = 0;
  return { root, boat, update(dt, aboard, px, pz, face) {
    t += dt; diveRings.forEach((r, i) => { r.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.06); });
    water.position.y = WATER_Y + Math.sin(t * 0.8) * 0.03;
    const a = t * 0.12; nelly.position.x = lx(1300) + Math.cos(a) * 9; nelly.position.z = lz(1950) + Math.sin(a * 1.3) * 4; nelly.rotation.y = Math.atan2(-Math.sin(a) * 9 * 0.12, Math.cos(a * 1.3) * 4 * 0.156); nelly.position.y = WATER_Y - 0.6 + Math.max(0, Math.sin(t * 0.35)) * 0.7;
    if (aboard) { boat.position.set(px, WATER_Y + Math.sin(t * 2.4) * 0.04, pz); boat.rotation.y = face; boat.rotation.z = Math.sin(t * 1.7) * 0.04; }
  }, nellyPos: () => nelly.position };
}
