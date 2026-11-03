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
  { key: 'fisherman', name: 'Fisherman', role: 'Boat hire', outfit: 'vest', torso: ['#d4b896', '#b8956a', '#7a5c38'], crest: '8', stand: sq(...L15(1193, 900)), face: Math.PI, mood: 'warm' },
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
export const onJetty = (X, Z) => (X > lx(1570) && X < lx(1850) && Z > lz(790) && Z < lz(1590)) || (X > lx(1495) && X < lx(1925) && Z > lz(1445) && Z < lz(1590));
export const JETTY_HEAD = { x: lx(1710), z: lz(735), face: 0 };
export const MOOR = { x: lx(mwx), z: lz(mwy) + 0.6, face: Math.PI };
export const ASHORE = { x: lx(mlx), z: lz(mly) - 0.4 };
export const DIVES = [[1620, 1280], [1573, 660], [760, 1553], [1220, 1480], [353, 1280]].map(([x, y]) => { const [a, b] = L15(x, y); return { x: lx(a), z: lz(b), r: 2.6 }; });

export function buildLake(K) {
  const { THREE, scene, M, BOX, toon, grad, glowing, glowSprite, BK, colliders, flames, signTex, DARK, WOOD, heightAt } = K;
  const root = new THREE.Group(); root.name = 'meruLake'; scene.add(root);
  const W = p => p * S;
  // water: a ripple-streaked toon surface, a faster glint layer over it, a pale shallow band and a breaking foam line at the beach
  const ripT = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); x.fillStyle = '#3f86c4'; x.fillRect(0, 0, 256, 256); x.lineCap = 'round';
    for (let i = 0; i < 110; i++) { const px = Math.random() * 256, py = Math.random() * 256, w = 6 + Math.random() * 22; x.strokeStyle = Math.random() < 0.6 ? 'rgba(150,205,240,0.55)' : 'rgba(40,100,160,0.5)'; x.lineWidth = 1 + Math.random() * 1.6; x.beginPath(); x.moveTo(px - w / 2, py); x.quadraticCurveTo(px, py - 2.5, px + w / 2, py); x.stroke(); }
    const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(14, 10); return t; })();
  const glintT = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d'); for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,255,255,${0.4 + Math.random() * 0.6})`; x.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 7, 1 + Math.random()); } const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 8); return t; })();
  const water = new THREE.Mesh(new THREE.PlaneGeometry(W(2700), W(2000), 1, 1), new THREE.MeshToonMaterial({ color: '#ffffff', map: ripT, gradientMap: grad, emissive: new THREE.Color('#123e6e'), emissiveIntensity: 0.35, transparent: true, opacity: 0.94 }));
  water.rotation.x = -Math.PI / 2; water.position.set(lx(1420), WATER_Y, lz(1680)); water.receiveShadow = true; root.add(water);
  const glint = new THREE.Mesh(new THREE.PlaneGeometry(W(2700), W(2000), 1, 1), new THREE.MeshBasicMaterial({ map: glintT, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
  glint.rotation.x = -Math.PI / 2; glint.position.set(lx(1420), WATER_Y + 0.02, lz(1680)); root.add(glint);
  const shoreZ = lz(800), shallowT = (() => { const cv = document.createElement('canvas'); cv.width = 4; cv.height = 64; const x = cv.getContext('2d'), gr = x.createLinearGradient(0, 0, 0, 64); gr.addColorStop(0, 'rgba(120,220,215,0.85)'); gr.addColorStop(1, 'rgba(120,220,215,0)'); x.fillStyle = gr; x.fillRect(0, 0, 4, 64); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  { const sh = new THREE.Mesh(new THREE.PlaneGeometry(W(2370), 5), new THREE.MeshBasicMaterial({ map: shallowT, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.set(lx(1435), WATER_Y + 0.03, shoreZ + 2.5); root.add(sh); }
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(W(2370), 0.45), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false })); surf.rotation.x = -Math.PI / 2; surf.position.set(lx(1435), WATER_Y + 0.05, shoreZ + 0.3); root.add(surf);
  // beach, road from the south gate (the stream + waterfall now come off the Falls bluff, worlds/meru-falls.js)
  const sand = new THREE.Mesh(BOX(W(2370), 0.05, W(370)), toon('#e7d4a4')); sand.position.set(lx(1435), 0.02, lz(615)); sand.receiveShadow = true; root.add(sand);
  const road = new THREE.Mesh(BOX(W(200), 0.06, W(440)), toon('#d9c395')); road.position.set(lx(840), 0.03, lz(220)); road.receiveShadow = true; root.add(road);
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
  for (const [px, py] of [[640, 540], [1950, 540]]) { M(BOX(1.8, 0.12, 0.5), WOOD, lx(px), 0.45, lz(py), root, 0.02); colliders.push({ box: [lx(px) - 0.9, lx(px) + 0.9, lz(py) - 0.3, lz(py) + 0.3] }); }
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
  // the boat: a shaped rowboat (pointed bow, round stern, deep keel line), red hull with a white sheer stripe, a wooden
  // gunwale, plank floor, two thwarts, oars in their locks and a little lantern on a bow post (follows you when aboard)
  const boat = new THREE.Group(); {
    const L = 2.2, Bm = 0.95, D = 0.62, top = 0.5;
    const hw = z => { const u = z / L; return Bm * (u > 0 ? Math.sqrt(Math.max(0, 1 - Math.pow(u, 1.6))) : Math.sqrt(Math.max(0, 1 - Math.pow(-u, 3)))) ; };
    const hg = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), hp = hg.attributes.position;
    for (let i = 0; i < hp.count; i++) { const x = hp.getX(i), y = hp.getY(i), z = hp.getZ(i); const zz = z * L, w = hw(zz), r = Math.hypot(x, -y) || 1; hp.setXYZ(i, x * w, top + y * D * (0.85 + 0.15 * (1 - Math.abs(z))) + Math.pow(Math.max(0, z), 3) * 0.22, zz); }
    hg.computeVertexNormals();
    const hull = M(hg, toon('#d8343f'), 0, 0, 0, boat, 0.03); hull.castShadow = true;
    const inner = new THREE.Mesh(hg, toon('#7a5236', { side: THREE.BackSide })); inner.scale.set(0.93, 0.93, 0.96); inner.position.y = 0.04; boat.add(inner);
    const rim = (dy, sc, mat, r) => { const pts = []; for (let i = 0; i <= 48; i++) { const a = i / 48 * Math.PI * 2, z = Math.cos(a) * L * 0.995, x = Math.sin(a) * hw(z) * sc; pts.push(new THREE.Vector3(x, top + dy + Math.pow(Math.max(0, z / L), 3) * 0.22, z)); } return M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 64, r, 6, true), mat, 0, 0, 0, boat, 0.012); };
    rim(0.0, 1.0, toon('#8a5a36'), 0.055); rim(-0.13, 1.0, toon('#f2efe6'), 0.035); rim(-0.24, 0.985, toon('#f2efe6'), 0.02);
    M(BOX(1.15, 0.05, 2.9), BK.texMat('plank', '#8a6440', 1, 3), 0, top - 0.36, -0.05, boat, 0);
    for (const [z, w] of [[0.7, 1.45], [-0.45, 1.62], [-1.45, 1.25]]) M(BOX(w, 0.07, 0.34), toon('#a8784a'), 0, top - 0.08, z, boat, 0.01);
    const oarM = toon('#c9a26a'), bladeM = toon('#f2efe6');
    for (const s of [-1, 1]) { const g = new THREE.Group(); g.position.set(s * (hw(-0.1) + 0.02), top + 0.06, -0.1); g.rotation.set(0, 0, s * 0.42); boat.add(g); M(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 6), DARK, 0, 0.04, 0, g, 0.005); const oar = new THREE.Group(); oar.rotation.z = -s * 1.32; g.add(oar); M(new THREE.CylinderGeometry(0.03, 0.035, 2.2, 6), oarM, 0, s * -0.55, 0, oar, 0.008, 0.035); const bl = M(BOX(0.04, 0.55, 0.2), bladeM, 0, s * -1.62, 0, oar, 0.008); bl.rotation.y = 0.2; boat.userData['oar' + s] = g; }
    M(new THREE.CylinderGeometry(0.035, 0.04, 0.6, 6), DARK, 0, top + 0.5, L - 0.25, boat, 0.008);
    const lamp = M(BOX(0.16, 0.2, 0.16), glowing('#ffd38a', null, 2.0), 0, top + 0.86, L - 0.25, boat, 0.01); lamp.castShadow = false;
    M(new THREE.TorusGeometry(0.28, 0.035, 6, 20), toon('#e8e2d0'), -hw(-1.1) - 0.05, top - 0.12, -1.1, boat, 0.01).rotation.y = Math.PI / 2;
    { const w = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.25, 32), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })); w.rotation.x = -Math.PI / 2; w.scale.set(1.0, 2.25, 1); w.position.y = -0.12; boat.add(w); boat.userData.wake = w; }
  }
  boat.position.set(MOOR.x, WATER_Y, MOOR.z); boat.rotation.y = MOOR.face; root.add(boat);
  // Nelly lives in worlds/meru-nelly.js now (the model, her roaming and the boat battle)
  let t = 0;
  return { root, boat, update(dt, aboard, px, pz, face) {
    t += dt; diveRings.forEach((r, i) => { r.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.06); });
    water.position.y = WATER_Y + Math.sin(t * 0.8) * 0.03; ripT.offset.x += dt * 0.012; ripT.offset.y += dt * 0.008; glintT.offset.x -= dt * 0.02; glintT.offset.y += dt * 0.012; glint.material.opacity = 0.28 + Math.sin(t * 1.3) * 0.08;
    { const u = (t * 0.22) % 1; surf.position.z = shoreZ + 0.9 - u * 0.8; surf.material.opacity = Math.sin(u * Math.PI) * 0.6; }
    boat.position.y = WATER_Y + 0.16 + Math.sin(t * 2.4) * 0.035; boat.rotation.z = Math.sin(t * 1.7) * 0.035; boat.rotation.x = Math.sin(t * 1.3) * 0.02;
    if (aboard) { const sp = Math.hypot(px - (boat.userData.px ?? px), pz - (boat.userData.pz ?? pz)) / Math.max(dt, 1e-3); boat.userData.px = px; boat.userData.pz = pz; boat.position.x = px; boat.position.z = pz; boat.rotation.y = face; boat.userData.row = (boat.userData.row || 0) + dt * Math.min(sp, 6) * 1.1; for (const s of [-1, 1]) boat.userData['oar' + s].rotation.y = Math.sin(boat.userData.row) * 0.5 * s; boat.userData.wake.material.opacity = Math.min(0.45, sp * 0.08); } else boat.userData.wake.material.opacity = 0.12;
  } };
}
