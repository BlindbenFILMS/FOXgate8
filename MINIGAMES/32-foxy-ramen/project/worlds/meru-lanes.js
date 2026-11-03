// MERU — Meru Lanes [meruBowling]: the bowling hall on the square's south side, walk-in (no fade): door + windows face the square (north),
// the hall runs south toward the lake. Built in local metres (+z = the door) and turned 180°, so SG flips local → world.
// Mott (keeper), Gale, Nera, Rook: names, colours and lines verbatim from surface_meru.html (meru-lanes-dialogue.json).
// Bowling itself runs the user's original tenpin game in the panel (minigames/meru/tenpin.html).
const S = 80 / 2880;
export const LANES = { x: (1950 - 1440) * S, z: (1612 - 810) * S, w: 20, d: 24, h: 5.5, key: 'bowling', label: 'Meru Lanes', b: 3, ds: -1 };
const SG = -1;
LANES.exit = { x: LANES.x, z: LANES.z + SG * (LANES.d / 2 - 1.1) };
const X = v => LANES.x + SG * v, Z = v => LANES.z + SG * v;
const colB = (a, b, c, d) => { const x0 = LANES.x + SG * a, x1 = LANES.x + SG * b, z0 = LANES.z + SG * c, z1 = LANES.z + SG * d; return { box: [Math.min(x0, x1), Math.max(x0, x1), Math.min(z0, z1), Math.max(z0, z1)] }; };
export const PEOPLE = [
  { key: 'lanesKeeper', name: 'Mott', role: 'Meru Lanes', outfit: 'vest', torso: ['#f0b866', '#b07a2c', '#5a3a12'], crest: '8', x: X(6.5), z: Z(7.5), face: Math.PI / 2 + Math.PI + Math.PI, mood: 'warm' },
  { key: 'lanesRegular', name: 'Gale', role: 'Lane one', outfit: 'vest', torso: ['#fef3c7', '#fbbf24', '#b45309'], crest: '8', x: X(-5.2), z: Z(5), face: Math.PI + Math.PI, mood: 'sad' },
  { key: 'lanesRecord', name: 'Nera', role: 'The racks', outfit: 'dress', female: true, torso: ['#a5f3fc', '#22d3ee', '#155e75'], crest: '8', x: X(6.6), z: Z(-2), face: -Math.PI / 2 + Math.PI, mood: 'smug' },
  { key: 'lanesRival', name: 'Rook', role: 'Regular', outfit: 'coat', torso: ['#e5e7eb', '#9ca3af', '#374151'], crest: '8', x: X(4.2), z: Z(3.2), face: -Math.PI / 2 + Math.PI, mood: 'stern' },
];
export const BOWL_SPOTS = [0, 4].map((lx, i) => ({ x: X(lx), z: Z(6.2), lane: i + 2 }));   // lane one is Dash's (worlds/meru-bowler.js)
export function buildLanes(K) {
  const { THREE, scene, M, BOX, toon, BK, DARK, WOOD, GOLD, roomLights, colliders, lampM, glowing, bigFront, sign, glowSprite } = K;
  const R = LANES, T = new THREE.Group(); T.position.set(R.x, 0, R.z); T.rotation.y = Math.PI; scene.add(T); const W2 = R.w / 2, D2 = R.d / 2;
  const cuts = { F: [], B: [], L: [], R: [] }, roof = []; T.userData.cuts = cuts; T.userData.roof = roof; const LOW = 1.3;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(R.w, R.d), BK.texMat('tile', '#2a315a', R.w / 1.6, R.d / 1.6)); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.03; fl.receiveShadow = true; T.add(fl);
  const wm = BK.texMat('panel', '#2a315a', R.w / 2.4, R.h / 2.4), tm = toon('#c0995c');
  const outM = BK.texMat('brick', '#3a3f6e', R.w / 2.4, R.h / 2.4);
  for (const [x, z, w, ry, sd] of [[0, -D2, R.w, 0, 'B'], [-W2, 0, R.d, Math.PI / 2, 'L'], [W2, 0, R.d, -Math.PI / 2, 'R']]) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry; T.add(g);
    const lo = new THREE.Mesh(BOX(w, LOW, 0.3), wm); lo.position.y = LOW / 2; lo.receiveShadow = true; g.add(lo); const up = new THREE.Mesh(BOX(w, R.h - LOW, 0.3), wm); up.position.y = LOW + (R.h - LOW) / 2; up.receiveShadow = up.castShadow = true; g.add(up); cuts[sd].push(up);
    for (const sz of [-1, 1]) { const sk = new THREE.Mesh(BOX(w + 0.3, R.h, 0.04), outM); sk.position.set(0, R.h / 2, -0.19); if (sz > 0) continue; g.add(sk); cuts[sd].push(sk); }
    cuts[sd].push(M(BOX(w, 0.3, 0.42), tm, 0, R.h - 0.15, 0.05, g, 0)); M(BOX(w, 0.14, 0.36), tm, 0, LOW, 0.03, g, 0); }
  bigFront(T, R, { dh: 2.0, low: LOW, wins: [-5.0, 5.0], lower: outM, upper: outM, trim: tm, mat: toon('#c42d3c'), cuts });
  cuts.F.push(M(BOX(R.w, 0.3, 0.42), tm, 0, R.h - 0.15, D2 + 0.05, T, 0));
  // roof (lifts while you are inside): flat slab, gold parapet, a giant pin on top; MERU LANES sign over the door
  roof.push(M(BOX(R.w + 0.6, 0.3, R.d + 0.6), toon('#1e2246'), 0, R.h + 0.15, 0, T, 0.03));
  for (const [x, z, ww, dd] of [[0, D2, R.w + 0.9, 0.3], [0, -D2, R.w + 0.9, 0.3], [W2, 0, 0.3, R.d + 0.6], [-W2, 0, 0.3, R.d + 0.6]]) roof.push(M(BOX(ww, 0.5, dd), tm, x, R.h + 0.5, z, T, 0.02));
  { const p = new THREE.Group(); p.position.set(-W2 + 3, R.h + 0.3, D2 - 3); T.add(p); roof.push(p); M(new THREE.CylinderGeometry(0.5, 0.85, 2.6, 14), toon('#f8f8f8'), 0, 1.3, 0, p, 0.03, 0.85); M(new THREE.SphereGeometry(0.55, 14, 10), toon('#f8f8f8'), 0, 3.0, 0, p, 0.03, 0.55); for (const y of [2.15, 2.4]) M(new THREE.CylinderGeometry(0.56, 0.58, 0.12, 14), toon('#c42d3c'), 0, y, 0, p, 0); }
  { const sg = new THREE.Group(); T.add(sg); sign(sg, 'MERU LANES', null, 5.6, 3.9, D2 + 0.3, '#38bdf8'); sg.traverse(m => { if (m.isMesh) cuts.F.push(m); }); }
  for (const sx of [-1, 1]) { M(BOX(0.22, 0.34, 0.22), lampM, sx * 2.0, 2.6, D2 + 0.3, T, 0.01); glowSprite(sx * 2.0, 2.6, D2 + 0.34, 0xffc070, 1.0, T); }
  // three lanes: maple boards, gutters, arrows, pins at the far end (no walking down the lane)
  const maple = BK.texMat('plank', '#d9b27a', 1, 8), pinM = toon('#f8f8f8'), pinB = toon('#c42d3c');
  T.userData.pins = {};
  for (const lx of [-4, 0, 4]) { M(BOX(2.2, 0.08, 16), maple, lx, 0.04, -3, T, 0); T.userData.pins[lx] = []; for (const s of [-1, 1]) M(BOX(0.35, 0.05, 16), toon('#1b1830'), lx + s * 1.28, 0.03, -3, T, 0);
    for (let i = 0; i < 5; i++) M(new THREE.ConeGeometry(0.08, 0.22, 3), toon('#7a4a2a'), lx - 0.6 + i * 0.3, 0.09, 1.0, T, 0).rotation.x = -Math.PI / 2;
    let k = 0; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) { const p = new THREE.Group(); p.position.set(lx + (c - r / 2) * 0.32, 0.08, -10 - r * 0.28); T.add(p); T.userData.pins[lx].push(p); M(new THREE.CylinderGeometry(0.06, 0.1, 0.38, 8), pinM, 0, 0.19, 0, p, 0.008); M(new THREE.SphereGeometry(0.07, 8, 6), pinM, 0, 0.44, 0, p, 0.006); M(new THREE.CylinderGeometry(0.075, 0.075, 0.05, 8), pinB, 0, 0.33, 0, p, 0); k++; }
    M(BOX(2.4, 0.9, 0.3), DARK, lx, 1.6, -11.6, T, 0); colliders.push(colB(lx - 1.5, lx + 1.5, -11.8, 4.8)); }
  // the scoreboards (Nera's house record 212 and Rook's 147, as on the 2D chalk board), ball return, racks, the jukebox corner, Mott's counter
  for (const [lx, t] of [[-4, 'HOUSE 212 · NERA'], [4, 'ROOK 147']]) { const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#141838'; g.fillRect(0, 0, 512, 128); g.fillStyle = '#ffd38a'; g.font = '900 54px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText(t, 24, 66); const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 1), new THREE.MeshBasicMaterial({ map: tx })); m.position.set(lx, 3.6, -D2 + 0.17); T.add(m); }
  for (const lx of [-2, 2]) { M(BOX(0.7, 0.8, 1.6), toon('#3a3448'), lx, 0.4, 5.6, T, 0.02); for (let i = 0; i < 3; i++) M(new THREE.SphereGeometry(0.2, 12, 8), toon(['#38bdf8', '#c42d3c', '#4ade80'][i]), lx, 0.95, 5.1 + i * 0.45, T, 0.01, 0.2); colliders.push(colB(lx - 0.4, lx + 0.4, 4.8, 6.4)); }
  M(BOX(2.6, 1.6, 0.6), WOOD, 7.8, 0.8, -2, T, 0.02); for (let i = 0; i < 8; i++) M(new THREE.SphereGeometry(0.17, 10, 8), toon(['#f472b6', '#facc15', '#7dd3fc', '#a3e635'][i % 4]), 6.9 + (i % 4) * 0.6, 1.2 + Math.floor(i / 4) * 0.5, -1.7, T, 0.01, 0.17); colliders.push(colB((6.5), (9.1), -(2.3), -(1.7)));
  M(BOX(1.1, 1.8, 0.7), glowing('#ff3bd4', null, 1.0), -8.8, 0.9, 9.5, T, 0.02); colliders.push(colB(-(9.4), -(8.2), (9.1), (9.9)));
  M(BOX(3.2, 1.05, 0.9), toon('#5a3d2b'), 6.5, 0.52, 9.2, T, 0.02); M(BOX(3.3, 0.08, 1.0), tm, 6.5, 1.06, 9.2, T, 0); colliders.push(colB((4.9), (8.1), (8.75), (9.65)));
  for (const [x, z] of [[-5.2, 5.6], [4.2, 3.8]]) { M(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 14), WOOD, x, 0.75, z + 0.9, T, 0.01, 0.5); M(new THREE.CylinderGeometry(0.06, 0.08, 0.75, 6), DARK, x, 0.37, z + 0.9, T, 0); }
  for (const [x, z] of [[-5, 0], [5, 0], [0, 6]]) { const L = new THREE.PointLight(0xffd9a8, 0, 16, 1.4); L.position.set(X(x), R.h - 0.7, Z(z)); scene.add(L); roomLights.push({ L, k: 11 }); M(new THREE.CylinderGeometry(0.25, 0.35, 0.3, 10), lampM, x, R.h - 0.45, z, T, 0.01, 0.35); }
  return T;
}
