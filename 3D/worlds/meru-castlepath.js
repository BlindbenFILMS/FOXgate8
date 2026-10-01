// MERU — Castle Path zone [meruThronePath], part of the ONE outdoor map, directly north of the square.
// Laid out from the 2D scene (ref/meruThronePath.json + .svg, 2880x2880 src px, same scale as the square).
// The 2D exitSouth (x 880, y 2880) meets the square's north exit, so: town art ax = px + 560, ay = py - 2880.
const S = 80 / 2880;
const PX = 560, PY = -2880;
const AX = a => (a - 1440) * S, AZ = a => (a - 810) * S;
export const cx = px => AX(px + PX), cz = py => AZ(py + PY);
const toPath = (ax, ay) => [ax - PX, ay - PY];
const SRC_Y = 1620 / 2880;
const sq = (px, py) => [px + PX, (py + PY) / SRC_Y];        // town FOXES use the 2880-square y space

// walk map of the 2D scene (road, plaza, east road), rows every 8 px
let WALK = null;
export function setWalk(rows) { WALK = rows; }
function onWalk(px, py) {
  if (!WALK || py < WALK[0].y) return false; let lo = 0, hi = WALK.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (WALK[m].y <= py) lo = m; else hi = m - 1; }
  for (const [a, b] of WALK[lo].s) if (px >= a && px <= b) return true; return false;
}
export const RIVER = [1395, 1488], FOUNTAIN = { x: 470, y: 1720, r: 112 };
export function inZone(ax, ay) { const [px, py] = toPath(ax, ay); return py >= 0 && py < 2880 && px >= 0 && px <= 2880; }
// paths from the walk map; off them, the grass is free to roam (the "off-path freedom" rule)
export function walkable(ax, ay) {
  const [px, py] = toPath(ax, ay);
  if (px < 30 || px > 2850 || py < 700 || py >= 2880) return false;
  if (onWalk(px, py)) return true;
  if (py < 965) return false;                                   // castle wall line
  if (py > RIVER[0] - 8 && py < RIVER[1] + 8) return false;     // stream: the bridge is on the walk map
  if (Math.hypot(px - FOUNTAIN.x, py - FOUNTAIN.y) < FOUNTAIN.r + 18) return false;
  if (px > 2740 && py > 1780 && py < 2300) return false;        // barracks gatehouse
  return true;
}
export function treeOK(ax, ay) {
  const [px, py] = toPath(ax, ay);
  if (py < 1060) return false; if (px > 560 && px < 1200) return false;
  if (py > 1820 && py < 2280 && px > 1040) return false;
  if (py > RIVER[0] - 60 && py < RIVER[1] + 60) return false;
  if (Math.hypot(px - FOUNTAIN.x, py - FOUNTAIN.y) < 260) return false;
  for (const [x, y] of [[1302, 2484], [480, 2512], [400, 1572], [400, 1860]]) if (Math.hypot(px - x, py - y) < 160) return false;
  return true;
}
// flatten the terrain under the zone; hills resume 10 m past its edges
export function flatMask(X, Z) {
  const x0 = cx(0), x1 = cx(2880), z0 = cz(0), z1 = cz(2880);
  const dx = Math.max(0, x0 - X, X - x1), dz = Math.max(0, z0 - Z, Z - z1), d = Math.hypot(dx, dz);
  return d <= 0 ? 1 : Math.max(0, 1 - d / 10);
}

// ---- people (names, colours, posts and lines from surface_meru.html) ----
export const FOXES = [
  { key: 'castleGuard1', name: 'Castle Guard', role: 'Castle gate', outfit: 'armor', torso: ['#52525b', '#27272a', '#09090b'], crest: 'M', gear: 'sword', stand: sq(704, 880), face: 0, mood: 'stern' },
  { key: 'castleGuard2', name: 'Castle Guard', role: 'Castle gate', outfit: 'armor', torso: ['#52525b', '#27272a', '#09090b'], crest: 'M', gear: 'sword', stand: sq(1050, 880), face: 0, mood: 'stern' },
  { key: 'zadie', name: 'Zadie', role: 'Zale\'s shadow', outfit: 'coat', female: true, torso: ['#fde047', '#ca8a04', '#713f12'], crest: 'Z', path: [sq(776, 1000), sq(776, 2720)], speed: 1.3, mood: 'determined' },
  { key: 'nash', name: 'Nash', role: 'General of Nebo', outfit: 'armor', torso: ['#4ade80', '#16a34a', '#14532d'], crest: 'N', path: [sq(976, 2720), sq(976, 1000)], speed: 1.3, mood: 'stern' },
];
export const DIALOGUE = {
  castleGuard1: [{ who: 'player', text: 'Can I go up?' }, { who: 'npc', text: 'Not past me, and not past him. The KING is receiving, and receiving is a list, and you are not going to read it out to me.' }, { who: 'player', text: 'How does a fox get on the list?' }, { who: 'npc', text: 'He is sent for. That is the whole of it and there is no other way onto it.' }, { who: 'npc', text: 'Wait at the BARRACKS if you would rather be useful while you wait. What the King sends down, the Captain hands out.' }],
  castleGuard2: [{ who: 'player', text: 'Do you ever let anybody through?' }, { who: 'npc', text: 'Every day. And every one of them was expected before they got here.' }, { who: 'player', text: 'That is not very reassuring.' }, { who: 'npc', text: 'It is not meant to reassure, it is meant to be a door.' }, { who: 'npc', text: 'Stand wherever you like. Just not between us — the path is narrow and we are the width of it.' }],
  zadie: [{ who: 'player', text: 'You stay very close to Zale tonight, Zadie.' }, { who: 'npc', text: 'I am her shadow. She commands the fleet. I see it done. I do not need a loud voice to be deadly.' }, { who: 'player', text: 'Do you believe Meru is plotting something against the outer worlds?' }, { who: 'npc', text: 'The signatures from the Michael\u0027s Sphere are abnormal. Power is moving from the farms to classified grids.' }, { who: 'npc', text: 'Meru is preparing for something.' }],
  nash: [{ who: 'player', text: 'General Nash, would you aid us if Luxor invades our system?' }, { who: 'npc', text: 'Nebo is strictly neutral, young Steward. I do not start conflicts. But violate our vector space...' }, { who: 'npc', text: '...and you learn why my forces have never lost.' }, { who: 'player', text: 'What do you make of the anti-Meru rumors?' }, { who: 'npc', text: 'Propaganda, designed to unsettle the trade lanes. King Might gave us terraformed worlds and working gates.' }, { who: 'npc', text: 'Why would he destroy his own creation?' }],
};
// the castle door (castleDoorHeld in the 2D game): what the guard says depends on the story so far
export function castleDoorLines(flag) {
  if (flag('maxHome')) return null;
  if (flag('maxFollowing')) return [{ who: 'npc', text: 'HALT \u2014 PRINCE MAX! You found him \u2014 stand aside, stand aside!' }, { who: 'max', text: 'At ease. My cousin pulled me out of the ruins.' }, { who: 'npc', text: 'The King has been asking for you both since dawn. Come \u2014 we will take you to him ourselves. This way, quickly!' }];
  if (!flag('tournamentWon')) return [{ who: 'npc', text: 'The castle is CLOSED to callers today.' }, { who: 'player', text: 'I NEED to speak with KING MIGHT!' }, { who: 'npc', text: 'Then you want the ARENA, not this door. He is hosting his own birthday tournament.' }, { who: 'player', text: 'This cannot wait for a tournament!' }, { who: 'npc', text: 'It will have to. Try the ARENA east of town.' }];
  return [{ who: 'npc', text: 'NO ENTRY until PRINCE MAX IS FOUND.' }, { who: 'player', text: 'BUT I NEED TO SPEAK to the KING!' }, { who: 'npc', text: 'Unless you have found the Prince... the King asks all hands to keep searching. Try the LAKE or the RUINS.' }];
}
// door spots (2D portals gate_meruThroneroom, gate_meruBarracks)
export const SPOTS = [
  { gate: 'throne', label: 'Throne Room', key: 'meruThroneroom', x: cx(876), z: cz(812), r: 2.6 },
  { gate: 'barracks', label: 'Barracks', key: 'meruBarracks', x: cx(2725), z: cz(2047), r: 3.0 },
];

// ---- the 3D build ----
export function buildCastlePath(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, camBlockers, flames, bannerM, emblemTex, signTex, cobbleTex, plazaTex, lampM, DARK, GOLD, WOOD, crystalM } = K;
  const root = new THREE.Group(); root.name = 'meruThronePath'; scene.add(root);
  const W = px => px * S;
  const slab = (px0, px1, py0, py1, mat, top) => { const m = new THREE.Mesh(BOX(W(px1 - px0), top, W(py1 - py0)), mat); m.position.set(cx((px0 + px1) / 2), top / 2, cz((py0 + py1) / 2)); m.receiveShadow = true; root.add(m); return m; };
  const texM = (fn, rx, ry) => new THREE.MeshToonMaterial({ map: fn([rx, ry]), gradientMap: grad });
  // road, plaza before the gate, the east road to the barracks, the navy runner
  slab(674, 1078, 940, 2925, texM(cobbleTex, 404 / 150, 1985 / 150), 0.07);
  slab(574, 1198, 950, 1340, texM(plazaTex, 624 / 360, 390 / 360), 0.075);
  slab(674, 1078, 700, 950, texM(plazaTex, 404 / 360, 250 / 360), 0.075);
  slab(1078, 2790, 1900, 2195, texM(plazaTex, 1712 / 360, 295 / 360), 0.072);
  const navy = toon('#26306b'); slab(856, 896, 950, 2880, navy, 0.085);
  for (let py = 1500; py < 2860; py += 180) { const d = new THREE.Mesh(BOX(0.42, 0.03, 0.42), GOLD); d.rotation.y = Math.PI / 4; d.position.set(cx(876), 0.1, cz(py)); root.add(d); }
  { const g = new THREE.Group(); g.position.set(cx(880), 0, cz(1150)); root.add(g); M(new THREE.CylinderGeometry(W(100), W(100), 0.14, 48), toon('#c42d3c'), 0, 0.08, 0, g, 0); const t = emblemTex(); const top = new THREE.Mesh(new THREE.CircleGeometry(W(97), 48), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); top.rotation.x = -Math.PI / 2; top.position.y = 0.155; g.add(top); }
  // the stream + bridge
  const water = new THREE.Mesh(new THREE.PlaneGeometry(W(2840), W(RIVER[1] - RIVER[0])), new THREE.MeshToonMaterial({ color: '#5fa3d8', gradientMap: grad, emissive: new THREE.Color('#1d4f86'), emissiveIntensity: 0.25 }));
  water.rotation.x = -Math.PI / 2; water.position.set(cx(1440), 0.03, cz((RIVER[0] + RIVER[1]) / 2)); root.add(water);
  for (const sgn of [-1, 1]) { const bank = new THREE.Mesh(BOX(W(2840), 0.12, 0.25), toon('#6b7a5a')); bank.position.set(cx(1440), 0.06, cz(sgn < 0 ? RIVER[0] : RIVER[1])); root.add(bank); }
  for (const [px, py] of [[180, 1430], [420, 1455], [1500, 1420], [1980, 1460], [2400, 1430], [2700, 1450]]) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.32, 10), toon('#4f9a44')); p.rotation.x = -Math.PI / 2; p.position.set(cx(px), 0.045, cz(py)); root.add(p); }
  const stoneM = BK.texMat('stone', '#5a5f86', 3, 1);
  for (const px of [664, 1088]) { M(BOX(0.45, 0.9, W(150)), stoneM, cx(px), 0.45, cz(1441), root, 0.025); for (const py of [1365, 1517]) M(BOX(0.6, 1.25, 0.6), toon('#4a4f78'), cx(px), 0.62, cz(py), root, 0.025); }
  // castle wall, corner towers, gatehouse, keep
  const castle = new THREE.Group(); root.add(castle); camBlockers.push(castle);
  const wallM = BK.texMat('stone', '#3d4270', 1, 1), trimM = toon('#2a2e52'), navyM = toon('#1f2650');
  const wallSeg = (px0, px1) => { const w = W(px1 - px0), m = M(BOX(w, 7, W(190)), BK.texMat('stone', '#3d4270', w / 2.4, 3), cx((px0 + px1) / 2), 3.5, cz(855), castle, 0.05);
    M(BOX(w + 0.2, 0.35, W(190) + 0.3), trimM, cx((px0 + px1) / 2), 7.1, cz(855), castle, 0.02);
    for (let x = px0 + 40; x < px1 - 20; x += 90) M(BOX(1.1, 0.9, 0.7), wallM, cx(x), 7.7, cz(935), castle, 0.02); return m; };
  wallSeg(0, 580); wallSeg(1180, 2880);
  for (const px of [240, 2640]) { M(new THREE.CylinderGeometry(3.6, 4, 10, 20), BK.texMat('stone', '#3a3f6b', 5, 4), cx(px), 5, cz(760), castle, 0.05, 4); M(new THREE.CylinderGeometry(4.1, 4.1, 0.5, 20), trimM, cx(px), 10.2, cz(760), castle, 0.02, 4.1); M(new THREE.ConeGeometry(4.3, 4.2, 20), toon('#26306b'), cx(px), 12.5, cz(760), castle, 0.04, 4.3); }
  // gatehouse: two towers + lintel, the arch recess (walkable) and the closed doors at its back
  for (const [p0, p1] of [[580, 674], [1078, 1180]]) { M(BOX(W(p1 - p0), 10, W(390)), BK.texMat('stone', '#363b66', 1.2, 4), cx((p0 + p1) / 2), 5, cz(755), castle, 0.05); M(BOX(W(p1 - p0) + 0.3, 0.4, W(390) + 0.3), trimM, cx((p0 + p1) / 2), 10.2, cz(755), castle, 0.02); }
  M(BOX(W(404), 5, W(390)), BK.texMat('stone', '#363b66', 4, 2), cx(876), 7.5, cz(755), castle, 0.05);
  M(BOX(W(404) + 0.2, 0.5, 0.5), GOLD, cx(876), 5.05, cz(948), castle, 0.02);
  M(BOX(W(404), 5, 0.4), WOOD, cx(876), 2.5, cz(782), castle, 0.03);
  for (let i = -3; i <= 3; i++) M(BOX(0.12, 4.8, 0.1), DARK, cx(876) + i * 1.5, 2.45, cz(782) + 0.25, castle, 0);
  for (const sx of [-1, 1]) { const rg = M(new THREE.TorusGeometry(0.28, 0.05, 6, 16), GOLD, cx(876) + sx * 0.8, 2.3, cz(782) + 0.3, castle, 0); }
  { const t = emblemTex(); const disc = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40), new THREE.MeshToonMaterial({ map: t, gradientMap: grad, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.25 })); disc.position.set(cx(876), 8.0, cz(950) + 0.02); castle.add(disc); M(new THREE.TorusGeometry(1.65, 0.12, 8, 40), GOLD, cx(876), 8.0, cz(950) + 0.02, castle, 0); }
  for (const px of [532, 1222]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.6), bannerM); b.position.set(cx(px), 4.6, cz(950) + 0.05); castle.add(b); M(BOX(1.4, 0.1, 0.1), GOLD, cx(px), 5.95, cz(950) + 0.06, castle, 0); }
  // round M crests along the wall face + wall torches
  const crestT = emblemTex();
  for (const px of [380, 1640, 2160, 2440]) { const d = new THREE.Mesh(new THREE.CircleGeometry(1.25, 32), new THREE.MeshToonMaterial({ map: crestT, gradientMap: grad })); d.position.set(cx(px), 4.3, cz(950) + 0.02); castle.add(d); M(new THREE.TorusGeometry(1.3, 0.1, 6, 32), trimM, cx(px), 4.3, cz(950) + 0.03, castle, 0); }
  for (const px of [360, 1400, 1880, 2620]) BK.sconce(castle, cx(px), 3.0, cz(950) + 0.05);
  // the keep and halls behind the wall: simple distant blocks with lit windows (phone budget)
  const hallM = toon('#1c2148'), roofM = toon('#141838'), winM = glowing('#ffc874', null, 1.4);
  for (const [x0, y0, x1, y1, h] of [[140, 120, 560, 420, 13], [620, 60, 940, 320, 18], [1240, 140, 1760, 440, 14], [1960, 100, 2420, 380, 15], [2480, 160, 2820, 420, 12]]) {
    const w = W(x1 - x0), d = W(y1 - y0), X = cx((x0 + x1) / 2), Z = cz((y0 + y1) / 2); M(BOX(w, h, d), hallM, X, h / 2, Z, castle, 0.06); M(BOX(w + 0.4, 0.5, d + 0.4), roofM, X, h + 0.25, Z, castle, 0.03);
    const n = Math.max(2, Math.floor(w / 4)); for (let i = 0; i < n; i++) if ((i * 7 + x0) % 3) M(BOX(0.7, 1.1, 0.1), winM, X - w / 2 + (i + 0.5) * w / n, h * 0.62, Z + d / 2 + 0.05, castle, 0);
  }
  { const t = emblemTex(); const d = new THREE.Mesh(new THREE.CircleGeometry(2.4, 40), new THREE.MeshToonMaterial({ map: t, gradientMap: grad, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.3 })); d.position.set(cx(780), 13.5, cz(320) + 0.06); castle.add(d); }
  // braziers (fire bowls, like the square's) + gate lamps + crystals
  const bowl = (px, py, y = 0, parent = root) => { const g = new THREE.Group(); g.position.set(cx(px), y, cz(py)); parent.add(g); M(new THREE.CylinderGeometry(0.3, 0.42, 0.8, 10), toon('#4a4560'), 0, 0.4, 0, g, 0.03, 0.42); M(new THREE.CylinderGeometry(0.65, 0.4, 0.35, 12), toon('#5c5675'), 0, 0.97, 0, g, 0.03, 0.65);
    const fl = M(new THREE.ConeGeometry(0.36, 0.9, 8), glowing('#ff9a3a', null, 2.4), 0, 1.55, 0, g, 0); fl.castShadow = false; const fi = M(new THREE.ConeGeometry(0.19, 0.55, 8), glowing('#ffe28a', null, 2.4), 0, 1.42, 0, g, 0); fi.castShadow = false;
    flames.push({ fl, fi, ph: Math.random() * 10 }); glowSprite(0, 1.6, 0, 0xff9a40, 4, g); if (!y) colliders.push({ c: [cx(px), cz(py), 0.7] }); };
  bowl(520, 1010); bowl(1240, 1010); bowl(240, 760, 10.4, castle); bowl(2640, 760, 10.4, castle);
  BK.lampPost(cx(712), cz(965), root, colliders); BK.lampPost(cx(1044), cz(965), root, colliders);
  for (const [px, py] of [[600, 1000], [1150, 1000], [2745, 1880], [2745, 2215], [620, 2850], [1140, 2850]]) { M(BOX(0.4, 0.5, 0.4), toon('#3a3a58'), cx(px), 0.25, cz(py), root, 0.03); const c = M(new THREE.OctahedronGeometry(0.28, 0), crystalM, cx(px), 0.95, cz(py), root, 0.03, 0.28); c.scale.y = 1.5; flames.push({ spin: c }); glowSprite(cx(px), 0.95, cz(py), 0x58d8ff, 2.0); colliders.push({ c: [cx(px), cz(py), 0.35] }); }
  // lamps line both roads (the "always see the path" rule)
  BK.linePath([[cx(876), cz(2860)], [cx(876), cz(1360)]], { every: 10, side: W(202) + 0.9, both: true, parent: root, colliders });
  BK.linePath([[cx(1160), cz(2047)], [cx(2700), cz(2047)]], { every: 11, side: W(148) + 0.8, both: true, parent: root, colliders });
  // hedges + stone benches beside the east road (as drawn in the 2D scene)
  const hedgeM = toon('#3f7d3f');
  for (const py of [1872, 2222]) for (const [a, b] of [[1150, 1650], [1760, 2250], [2340, 2700]]) { M(BOX(W(b - a), 0.7, 0.55), hedgeM, cx((a + b) / 2), 0.35, cz(py), root, 0.03); colliders.push({ box: [cx(a), cx(b), cz(py) - 0.35, cz(py) + 0.35] }); }
  for (const [a, b, py] of [[1250, 1750, 1780], [2050, 2550, 1780], [1250, 1750, 2300], [2050, 2550, 2300]]) { M(BOX(W(b - a), 0.45, 0.6), toon('#8a8fb0'), cx((a + b) / 2), 0.22, cz(py), root, 0.025); colliders.push({ box: [cx(a), cx(b), cz(py) - 0.35, cz(py) + 0.35] }); }
  // fountain on the west green, with two benches
  { const g = new THREE.Group(); g.position.set(cx(FOUNTAIN.x), 0, cz(FOUNTAIN.y)); root.add(g); const r = W(FOUNTAIN.r);
    M(new THREE.CylinderGeometry(r, r + 0.15, 0.6, 32, 1, true), toon('#9aa0c4', { side: THREE.DoubleSide }), 0, 0.3, 0, g, 0); M(new THREE.TorusGeometry(r, 0.14, 8, 32), toon('#b8bdd9'), 0, 0.6, 0, g, 0).rotation.x = Math.PI / 2;
    const wm = new THREE.Mesh(new THREE.CircleGeometry(r - 0.05, 32), new THREE.MeshToonMaterial({ color: '#6fb6e6', gradientMap: grad, emissive: new THREE.Color('#2a6aa8'), emissiveIntensity: 0.35 })); wm.rotation.x = -Math.PI / 2; wm.position.y = 0.45; g.add(wm);
    M(new THREE.CylinderGeometry(0.25, 0.4, 1.4, 12), toon('#b8bdd9'), 0, 0.7, 0, g, 0.03, 0.4); M(new THREE.CylinderGeometry(0.9, 0.5, 0.25, 16), toon('#b8bdd9'), 0, 1.45, 0, g, 0.03, 0.9); const jet = M(new THREE.SphereGeometry(0.32, 12, 8), glowing('#bfe6ff', null, 0.8), 0, 1.8, 0, g, 0); jet.castShadow = false;
    colliders.push({ c: [cx(FOUNTAIN.x), cz(FOUNTAIN.y), r + 0.3] });
    for (const py of [1572, 1868]) { M(BOX(2.2, 0.12, 0.6), WOOD, cx(400), 0.5, cz(py), root, 0.03); M(BOX(2.2, 0.5, 0.1), WOOD, cx(400), 0.8, cz(py) + (py < 1720 ? -0.28 : 0.28), root, 0.03); colliders.push({ box: [cx(400) - 1.1, cx(400) + 1.1, cz(py) - 0.4, cz(py) + 0.4] }); } }
  // roadside shrine with candles, and a wooden cart on the west verge
  { const g = new THREE.Group(); g.position.set(cx(1302), 0, cz(2484)); root.add(g); M(BOX(1.2, 1.1, 0.9), toon('#3a3f6b'), 0, 0.55, 0, g, 0.03); M(BOX(1.4, 0.16, 1.1), trimM, 0, 1.18, 0, g, 0.02); const t = emblemTex(); const d = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); d.rotation.y = -Math.PI / 2; d.position.set(-0.61, 0.6, 0); g.add(d);
    for (let i = 0; i < 3; i++) { M(new THREE.CylinderGeometry(0.04, 0.04, 0.18, 6), toon('#f4f1ec'), -0.3 + i * 0.3, 1.35, 0, g, 0); glowSprite(-0.3 + i * 0.3, 1.5, 0, 0xffc060, 0.7, g); } colliders.push({ c: [cx(1302), cz(2484), 0.8] }); }
  { const g = new THREE.Group(); g.position.set(cx(480), 0, cz(2512)); g.rotation.y = 0.35; root.add(g); M(BOX(2.2, 0.5, 1.3), WOOD, 0, 0.75, 0, g, 0.03); for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 14), DARK, sx * 0.7, 0.42, sz * 0.72, g, 0.02, 0.42).rotation.x = Math.PI / 2; M(BOX(1.2, 0.08, 0.08), WOOD, 1.6, 0.6, 0, g, 0); for (let i = 0; i < 3; i++) M(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 10), toon('#a0743f'), -0.5 + i * 0.5, 1.25, 0, g, 0.02, 0.28); colliders.push({ c: [cx(480), cz(2512), 1.3] }); }
  // the barracks gatehouse at the end of the east road
  { const g = new THREE.Group(); root.add(g); camBlockers.push(g); const X = cx(2815), Z = cz(2047);
    M(BOX(W(130), 6.5, W(520)), BK.texMat('stone', '#363b66', 1, 3), X, 3.25, Z, g, 0.05); M(BOX(W(130) + 0.3, 0.4, W(520) + 0.3), trimM, X, 6.7, Z, g, 0.02);
    M(BOX(0.3, 4, 4.2), WOOD, cx(2752), 2, Z, g, 0.03); M(BOX(0.4, 0.4, 4.6), GOLD, cx(2750), 4.2, Z, g, 0.02);
    const st = signTex('BARRACKS', null, '#e6b45a'); M(BOX(0.18, 1.0, 4.0), [DARK, glowing(0, st, 1.2), DARK, DARK, DARK, DARK], cx(2748), 5.1, Z, g, 0.03).rotation.y = 0;
    for (const py of [1860, 2234]) { M(BOX(0.8, 3.4, 0.8), toon('#2a2e52'), cx(2752), 1.7, cz(py), g, 0.03); const t = emblemTex(); const d = new THREE.Mesh(new THREE.CircleGeometry(0.38, 24), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); d.rotation.y = -Math.PI / 2; d.position.set(cx(2752) - 0.41, 2.6, cz(py)); g.add(d); } }
  return root;
}
