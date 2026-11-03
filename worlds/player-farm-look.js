// 8 GATES · PLAYER PLANET · s600 THE 7 TRADE BUILDINGS (Ben): each farm / trade building gets its OWN 3D model instead of the generic house box.
// farmShell(X, k, g, w, d, h) builds into the bare house() group g (local frame: door at x 0, front face z = d/2, ground y 0).
// house() still draws the foundation, the BIG ROOF SIGN (at SHELL_SIGN) + the EYE-LEVEL DOOR SIGN (x 3.4, y 2.2) and registers the door.
// The live yards / hives / animals stay in player-build farmLook.
export const SHELL_K = ['apiary', 'greenhouse', 'sheepfold', 'goatshed', 'camelpen', 'weaver', 'kiln', 'warehouse', 'whbig'];
export const SHELL_SIGN = {
  apiary: (w, d, h) => ({ y: h * 0.8 + 2.6, base: h * 0.8 + 0.5, z: d / 2 - 1.2 }),
  greenhouse: (w, d, h) => ({ y: h + 1.8, base: h - 0.1, z: 0 }),
  sheepfold: (w, d, h) => ({ y: h + 1.9, base: h - 0.2, z: 0 }),
  goatshed: (w, d, h) => ({ y: h * 0.85 + 2.2, base: h * 0.85, z: d / 2 - 1 }),
  camelpen: (w, d, h) => ({ y: h * 0.8 + 2.6, base: h * 0.8 + 0.6, z: 0 }),
  weaver: (w, d, h) => ({ y: h + 1.8, base: h - 0.2, z: d / 6 }),
  kiln: (w, d, h) => ({ y: h * 0.4 + 2.8, base: h * 0.4 + 0.6, z: d / 2 - d * 0.27 }),
  warehouse: (w, d, h) => ({ y: h + 2.2, base: h + 0.4, z: 0 }),
  whbig: (w, d, h) => ({ y: h + 2.6, base: h + 0.6, z: 0 })
};

export function farmShell(X, k, g, w, d, h) {
  const { THREE, M, BOX, toon: T } = X, FX = X.FX || [], fz = d / 2, PI = Math.PI;
  const glow = (...a) => X.glowSprite ? X.glowSprite(...a) : null;
  const dark = T('#201e1d'), white = T('#f3f2f2');
  // prism from a [z, y] profile, run along x (same trick as player-planet gable)
  const prism = (pts, len) => { const s = new THREE.Shape(); pts.forEach(([z, y], i) => i ? s.lineTo(-z, y) : s.moveTo(-z, y)); s.closePath(); const geo = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false }); geo.translate(0, 0, -len / 2); geo.rotateY(PI / 2); return geo; };
  const gable = (len, dep, hh) => prism([[-dep / 2, 0], [0, hh], [dep / 2, 0]], len);
  const glass = () => X._ppGlass || (X._ppGlass = new THREE.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.3, depthWrite: false }));
  let sd = 7 + k.length; const rnd = () => (sd = sd * 16807 % 2147483647) / 2147483647;
  const sideOfSign = (x, y) => x > 1.3 && x < 5.5 && y > 1.2 && y < 3.2;

  if (k === 'apiary') {   // THE GIANT HIVE: the building is a stacked bee box (3 honey supers, handholds, a white telescoping lid), a landing board at the door, honeycomb windows, a straw skep on the roof, bees
    const top = h * 0.8, th = top / 3, cols = ['#f0d878', '#e8c050', '#f0d878'];
    for (let i = 0; i < 3; i++) { M(BOX(w, th - 0.08, d), T(cols[i]), 0, i * th + th / 2, 0, g); M(BOX(w + 0.14, 0.16, d + 0.14), T('#5a3a22'), 0, (i + 1) * th - 0.04, 0, g, 0);
      for (const s of [-1, 1]) M(BOX(0.12, 0.35, 2.4), dark, s * (w / 2 + 0.02), i * th + th * 0.6, 0, g, 0);
      if (i === 2) for (const s of [-1, 1]) M(BOX(2.4, 0.35, 0.12), dark, s * w * 0.3, i * th + th * 0.6, fz + 0.02, g, 0); }
    M(BOX(w + 1.2, 0.5, d + 1.2), white, 0, top + 0.25, 0, g); M(BOX(w + 1.3, 0.12, d + 1.3), T('#8a929a'), 0, top + 0.56, 0, g, 0);
    M(BOX(5, 0.25, 2.2), T('#8a5a32'), 0, 0.12, fz + 1.1, g, 0); M(BOX(2.6, 3, 0.2), dark, 0, 1.5, fz + 0.05, g, 0); M(BOX(3.2, 0.3, 0.3), T('#5a3a22'), 0, 3.1, fz + 0.12, g, 0);
    const hex = new THREE.CylinderGeometry(0.5, 0.5, 0.15, 6), hm = T('#ffb02a', { emissive: '#7a4a00' });
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { const m = M(hex, hm, -w * 0.3 + c * 0.95 + (r % 2) * 0.47, th * 1.35 + r * 0.82, fz + 0.06, g, 0); m.rotation.x = PI / 2; }
    const sx = -w / 2 + 2.2, sz = -d / 2 + 2.2, sy = top + 0.6, straw = T('#c8a04a');
    for (let j = 0; j < 5; j++) { const t = M(new THREE.TorusGeometry(1.3 - j * 0.22, 0.3, 6, 14), straw, sx, sy + 0.3 + j * 0.4, sz, g, 0); t.rotation.x = PI / 2; }
    M(new THREE.SphereGeometry(0.42, 8, 6), straw, sx, sy + 2.3, sz, g, 0); M(BOX(0.5, 0.35, 0.1), dark, sx, sy + 0.4, sz + 1.28, g, 0);
    const bee = BOX(0.24, 0.16, 0.16), bm = T('#ffd23a'), bees = [];
    for (let i = 0; i < 6; i++) bees.push(M(bee, bm, 0, 0, 0, g, 0));
    FX.push((dt, t) => { bees.forEach((b, i) => { const a = t * (1.2 + i * 0.15) + i; b.position.set(Math.cos(a) * (1.4 + i * 0.25), 1.6 + Math.sin(t * 3 + i) * 0.5 + (i % 3) * 0.5, fz + 2 + Math.sin(a) * 1.1); b.rotation.y = -a; }); });
  }

  if (k === 'greenhouse') {   // A GLASS HOUSE: brick knee wall, glass walls + glass gable roof on white ribs, planting beds either side of the aisle, a boiler chimney at the back
    const wh = h * 0.55, rh = h - wh, gm = glass();
    M(BOX(w, 0.8, d), T('#a0503a'), 0, 0.4, 0, g); M(BOX(w + 0.2, 0.15, d + 0.2), white, 0, 0.86, 0, g, 0);
    for (const [bw, bd, x, z] of [[w, 0.06, 0, fz], [w, 0.06, 0, -fz], [0.06, d, -w / 2, 0], [0.06, d, w / 2, 0]]) { const m = M(BOX(bw, wh - 0.8, bd), gm, x, 0.8 + (wh - 0.8) / 2, z, g, 0); m.renderOrder = 2; m.castShadow = false; }
    const rf = M(gable(w, d, rh), gm, 0, wh, 0, g, 0); rf.renderOrder = 2; rf.castShadow = false;
    const n = Math.round(w / 2.75), a = Math.atan2(rh, d / 2), L = Math.hypot(rh, d / 2);
    for (let i = 0; i <= n; i++) { const x = -w / 2 + i * w / n; for (const s of [-1, 1]) { if (s > 0 && Math.abs(x) < 1.6) continue; M(BOX(0.18, wh, 0.18), white, x, wh / 2, s * fz, g, 0); const r = M(BOX(0.16, 0.16, L), white, x, wh + rh / 2, s * d / 4, g, 0); r.rotation.x = s * a; } }
    for (const s of [-1, 1]) for (let j = 1; j < 4; j++) M(BOX(0.16, wh + rh * (1 - Math.abs(-fz + j * d / 4) / fz), 0.16), white, s * w / 2, (wh + rh * (1 - Math.abs(-fz + j * d / 4) / fz)) / 2, -fz + j * d / 4, g, 0);
    M(BOX(w + 0.3, 0.22, 0.22), white, 0, h, 0, g, 0); M(BOX(w + 0.2, 0.18, 0.2), white, 0, wh, fz, g, 0); M(BOX(w + 0.2, 0.18, 0.2), white, 0, wh, -fz, g, 0);
    for (const s of [-1, 1]) M(BOX(0.25, 3, 0.25), white, s * 1.4, 1.5, fz + 0.06, g, 0); M(BOX(3.1, 0.25, 0.25), white, 0, 3, fz + 0.06, g, 0);
    const soil = T('#5a3a22'), lf = [T('#5fae4a'), T('#3a7a32')], fr = [T('#d84a3a'), T('#e8963a'), T('#ffd23a')], pg = new THREE.IcosahedronGeometry(0.55, 0), fg = new THREE.SphereGeometry(0.16, 6, 4);
    for (const s of [-1, 1]) { const bx = s * w * 0.27; M(BOX(w * 0.36, 0.6, d - 2.4), soil, bx, 0.3, 0, g, 0);
      for (let i = 0; i < 7; i++) { const z = -fz + 1.8 + i * (d - 3.6) / 6, x = bx + (rnd() - 0.5) * w * 0.2; M(pg, lf[i % 2], x, 1.05, z, g, 0); M(fg, fr[(i + (s > 0 ? 1 : 0)) % 3], x + 0.35, 1.2, z + 0.3, g, 0); } }
    M(new THREE.CylinderGeometry(0.6, 0.7, h + 2, 10), T('#a0503a'), w / 2 - 1.4, (h + 2) / 2, -fz - 0.9, g);
  }

  if (k === 'sheepfold') {   // A STONE LONG BARN: dry-stone walls with quoins, a steep slate roof, a red DUTCH DOOR (top half open), a hay-loft dormer with a hoist + a hanging bale, hay stacked by the door
    const wh = h * 0.55, rh = h - wh, st = T('#b8b2a6'), st2 = T('#8f897e'), q = T('#d8d2c6'), slate = T('#4a4e56'), red = T('#8a3a2a'), hay = T('#e0c060');
    M(BOX(w, wh, d), st, 0, wh / 2, 0, g); M(gable(w + 1.4, d + 1.6, rh), slate, 0, wh, 0, g);
    for (let i = 0; i < 30; i++) { const x = -w / 2 + 0.8 + rnd() * (w - 1.6), y = 0.4 + rnd() * (wh - 0.8); if (Math.abs(x) < 2.2 || sideOfSign(x, y)) continue; M(BOX(0.9 + rnd() * 0.7, 0.45 + rnd() * 0.3, 0.16), st2, x, y, fz + 0.06, g, 0); }
    for (const s of [-1, 1]) for (let j = 0; j < 4; j++) M(BOX(0.8, 0.6, 0.8), q, s * (w / 2 - 0.25), 0.35 + j * 0.8, fz - 0.25, g, 0);
    M(BOX(2.8, 1.4, 0.2), red, 0, 0.7, fz + 0.08, g, 0); M(BOX(2.8, 1.4, 0.12), dark, 0, 2.1, fz + 0.03, g, 0); M(BOX(1.4, 1.4, 0.15), red, -2.2, 2.1, fz + 0.1, g, 0);
    for (const s of [-1, 1]) { const b = M(BOX(3, 0.16, 0.06), white, 0, 0.7, fz + 0.2, g, 0); b.rotation.z = s * 0.45; }
    M(BOX(3.6, 0.45, 0.32), q, 0, 3.05, fz + 0.1, g, 0);
    const dz = fz - 0.6; M(BOX(3, 2.2, 2.6), st, 0, wh + 1.1, dz, g); M(BOX(1.6, 1.5, 0.12), dark, 0, wh + 1.05, dz + 1.31, g, 0);
    const dg = M(gable(2.8, 3.4, 1.2), slate, 0, wh + 2.2, dz, g); dg.rotation.y = PI / 2;
    M(BOX(0.25, 0.25, 2.2), T('#6a4a2e'), 0, wh + 2.5, dz + 1.9, g, 0); M(BOX(0.05, 1.8, 0.05), T('#c8a874'), 0, wh + 1.5, dz + 2.9, g, 0); M(BOX(1.1, 0.7, 0.7), hay, 0, wh + 0.4, dz + 2.9, g);
    for (const [x, y, z] of [[w / 2 - 1.6, 0.45, fz + 1.4], [w / 2 - 3, 0.45, fz + 1.4], [w / 2 - 2.3, 1.35, fz + 1.4], [w / 2 - 1.6, 0.45, fz + 2.6]]) M(BOX(1.3, 0.9, 0.9), hay, x, y, z, g);
  }

  if (k === 'goatshed') {   // A TIMBER LEAN-TO: a mono-pitch roof high at the front, board-and-batten walls, a green door, a propped-open hatch, + a GOAT CLIMBING TOWER beside it
    const hf = h * 0.85, hb = h * 0.45, wood = T('#8a6a44'), wood2 = T('#6a4e30'), green = T('#3a6a4a'), tin = T('#3a3a3c');
    M(BOX(w, hb, d), wood, 0, hb / 2, 0, g); M(prism([[fz, hb], [fz, hf], [-fz, hb]], w), wood, 0, 0, 0, g);
    const a = Math.atan2(hf - hb, d), L = Math.hypot(d, hf - hb); const rf = M(BOX(w + 1.2, 0.3, L + 1.4), tin, 0, (hf + hb) / 2 + 0.2, 0, g); rf.rotation.x = -a;
    for (let x = -w / 2 + 0.45; x < w / 2; x += 0.9) { if (Math.abs(x) < 1.7) continue; M(BOX(0.14, hf, 0.1), wood2, x, hf / 2, fz + 0.05, g, 0); }
    M(BOX(2.6, 3.2, 0.2), green, 0, 1.6, fz + 0.08, g, 0); for (const y of [0.6, 2.6]) M(BOX(2.4, 0.18, 0.08), white, 0, y, fz + 0.2, g, 0); { const b = M(BOX(0.18, 2.4, 0.08), white, 0, 1.6, fz + 0.2, g, 0); b.rotation.z = 0.75; }
    M(BOX(2.2, 1.4, 0.15), dark, -w * 0.3, hf * 0.6, fz + 0.06, g, 0); { const fl = M(BOX(2.4, 0.12, 1.5), wood2, -w * 0.3, hf * 0.6 + 0.85, fz + 0.65, g, 0); fl.rotation.x = 0.45; }
    const tx = w / 2 + 2.8, plank = T('#a07a50');
    for (const [s, y, z] of [[3, 1.2, -2.4], [2.4, 2.4, 0], [1.8, 3.6, 2.2]]) { M(BOX(s, 0.3, s), plank, tx, y, z, g); for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M(BOX(0.2, y, 0.2), wood2, tx + px * (s / 2 - 0.15), y / 2, z + pz * (s / 2 - 0.15), g, 0); }
    { const r1 = M(BOX(1, 0.15, 3), plank, tx, 0.6, -5.2, g, 0); r1.rotation.x = 0.42; const r2 = M(BOX(0.9, 0.15, 2.4), plank, tx, 1.8, -1.2, g, 0); r2.rotation.x = -0.5; const r3 = M(BOX(0.8, 0.15, 2.2), plank, tx, 3, 1.1, g, 0); r3.rotation.x = -0.55; }
  }

  if (k === 'camelpen') {   // A CARAVANSERAI: flat-roofed adobe with a crenellated parapet, two corner towers with red domes, a big arched gate, wooden roof beams, a striped awning, a water trough
    const wh = h * 0.8, sand = T('#d8b888'), sand2 = T('#c8a070'), red = T('#ec3013');
    M(BOX(w, wh, d), sand, 0, wh / 2, 0, g); M(BOX(w + 0.3, 0.6, d + 0.3), sand2, 0, wh + 0.3, 0, g, 0);
    const mg = BOX(0.8, 0.7, 0.5); for (let x = -w / 2 + 2.4; x <= w / 2 - 2.4; x += 1.6) for (const s of [-1, 1]) M(mg, sand, x, wh + 0.95, s * (fz - 0.1), g, 0);
    const mz = BOX(0.5, 0.7, 0.8); for (let z = -fz + 0.8; z <= fz - 2.4; z += 1.6) for (const s of [-1, 1]) M(mz, sand, s * (w / 2 - 0.1), wh + 0.95, z, g, 0);
    for (const s of [-1, 1]) { const tx = s * (w / 2 - 0.6); M(BOX(2.4, wh + 1.6, 2.4), sand2, tx, (wh + 1.6) / 2, fz - 0.6, g); M(new THREE.SphereGeometry(1.25, 12, 8, 0, 2 * PI, 0, PI / 2), red, tx, wh + 1.6, fz - 0.6, g); M(BOX(0.5, 0.8, 0.1), dark, tx, wh + 0.4, fz + 0.62, g, 0); }
    M(BOX(3.2, 3, 0.2), dark, 0, 1.5, fz + 0.03, g, 0); { const c = M(new THREE.CylinderGeometry(1.6, 1.6, 0.2, 16), dark, 0, 3, fz + 0.03, g, 0); c.rotation.x = PI / 2; }
    M(new THREE.TorusGeometry(1.8, 0.24, 6, 16, PI), sand2, 0, 3, fz + 0.12, g, 0); for (const s of [-1, 1]) M(BOX(0.48, 3, 0.48), sand2, s * 1.8, 1.5, fz + 0.12, g, 0);
    const vg = new THREE.CylinderGeometry(0.15, 0.15, 0.9, 6), vm = T('#6a4a2e'); for (let x = -w / 2 + 2.6; x <= w / 2 - 2.6; x += 1.8) { const v = M(vg, vm, x, wh - 0.5, fz + 0.4, g, 0); v.rotation.x = PI / 2; }
    M(BOX(2, 1.2, 0.12), dark, -w * 0.28, 2.1, fz + 0.04, g, 0); for (let i = 0; i < 6; i++) { const s = M(BOX(0.4, 0.08, 1.4), i % 2 ? white : red, -w * 0.28 - 1 + 0.2 + i * 0.4, 3.05, fz + 0.6, g, 0); s.rotation.x = 0.4; }
    M(BOX(1.4, 0.8, 4), T('#8a5a32'), -w / 2 - 1.2, 0.4, 0, g); M(BOX(1.1, 0.05, 3.7), T('#5fb8d8'), -w / 2 - 1.2, 0.78, 0, g, 0);
  }

  if (k === 'weaver') {   // A WEAVING MILL: a SAWTOOTH roof (three north-light teeth), cream walls on a blue band, tall factory windows, a giant BOBBIN of red thread by the door that slowly turns
    const wh = h * 0.55, ht = h - wh, blue = T('#2a4a7a'), lightG = T('#7fe3ff', { emissive: '#1a4a6a' }), win = T('#cfe6f0');
    M(BOX(w, wh, d), T('#efe2c8'), 0, wh / 2, 0, g); M(BOX(w + 0.2, 0.35, d + 0.2), blue, 0, wh, 0, g, 0);
    for (let i = 0; i < 3; i++) { const zb = -fz + i * d / 3, zf = zb + d / 3; M(prism([[zb, 0], [zb, ht], [zf, 0]], w + 0.4), blue, 0, wh, 0, g); M(BOX(w - 0.4, ht - 0.35, 0.08), lightG, 0, wh + ht / 2 - 0.05, zb - 0.06, g, 0); }
    M(BOX(2.6, 3, 0.2), blue, 0, 1.5, fz + 0.08, g, 0); M(BOX(3.2, 0.3, 0.3), T('#ffd23a'), 0, 3.15, fz + 0.12, g, 0);
    for (const x of [-6.2, -4.4, 6.6].map(v => v * w / 16)) { M(BOX(1.2, 2.2, 0.12), win, x, 1.9, fz + 0.05, g, 0); M(BOX(1.5, 0.2, 0.25), blue, x, 0.75, fz + 0.12, g, 0); }
    const bob = new THREE.Group(); bob.position.set(-3.4 * w / 16, 0, fz + 1.4); g.add(bob); const bw = T('#c8a874');
    for (const y of [0.15, 2.35]) M(new THREE.CylinderGeometry(1.1, 1.1, 0.3, 14), bw, 0, y, 0, bob);
    M(new THREE.CylinderGeometry(0.85, 0.85, 1.9, 14), T('#ec3013'), 0, 1.25, 0, bob, 0); M(new THREE.CylinderGeometry(0.3, 0.3, 2.8, 8), bw, 0, 1.4, 0, bob, 0);
    FX.push(dt => { bob.rotation.y += dt * 0.5; });
  }

  if (k === 'kiln') {   // A BOTTLE KILN: a tall brick bottle with iron bands behind a low brick workshop; the firing mouth + the top glow orange, smoke drifts up
    const wsD = d * 0.55, wsZ = fz - wsD / 2, wh = h * 0.4, brick = T('#a0503a'), brick2 = T('#7a3a2a');
    M(BOX(w, wh, wsD), brick, 0, wh / 2, wsZ, g); M(BOX(w + 0.3, 0.6, wsD + 0.3), brick2, 0, wh + 0.3, wsZ, g, 0);
    for (let j = 1; j < 4; j++) M(BOX(w + 0.04, 0.07, 0.04), T('#d8c0a0'), 0, j * wh / 4, fz + 0.01, g, 0);
    M(BOX(2.6, 3, 0.2), T('#3a2618'), 0, 1.5, fz + 0.08, g, 0); M(new THREE.TorusGeometry(1.45, 0.22, 6, 14, PI), brick2, 0, 3, fz + 0.1, g, 0);
    const kx = w * 0.12, kz = -fz + 3.9, top = h * 1.42;
    const prof = [[3.4, 0], [3.8, 1.5], [3.6, 3.2], [2.6, h * 0.75], [1.3, h * 1.15], [1.2, h * 1.35], [1.55, top]].map(([r, y]) => new THREE.Vector2(r, y));
    M(new THREE.LatheGeometry(prof, 16), T('#a0503a', { side: THREE.DoubleSide }), kx, 0, kz, g);
    for (const [r, y] of [[3.84, 1.5], [3.64, 3.2], [1.36, h * 1.15]]) { const b = M(new THREE.TorusGeometry(r, 0.1, 4, 24), dark, kx, y, kz, g, 0); b.rotation.x = PI / 2; }
    M(BOX(1.2, 1.3, 0.4), dark, kx - 3.6, 0.8, kz, g, 0).rotation.y = PI / 2;
    glow(kx - 3.9, 0.8, kz, '#ff7a1a', 2.4, 0.8, g); glow(kx, top + 0.3, kz, '#ffb44a', 3.2, 0.6, g);
    const puffs = []; for (let i = 0; i < 4; i++) { const p = glow(kx, top, kz, '#8a8480', 2.6, 0, g); if (p) { p.material = p.material.clone(); p.material.blending = THREE.NormalBlending; puffs.push({ p, o: i / 4 }); } }
    FX.push((dt, t) => { for (const q of puffs) { const u = (t * 0.12 + q.o) % 1; q.p.position.set(kx + u * 2.5, top + 0.5 + u * 7, kz + Math.sin(u * 5 + q.o * 6) * 0.6); q.p.scale.setScalar(2 + u * 4); q.p.material.opacity = 0.45 * Math.sin(u * PI); } });
  }
  if (k === 'warehouse') {   // s601d A TRADE SHED: grey corrugated walls, a low-pitch roof, a yellow-striped ROLL-UP DOOR on a LOADING DOCK, a jib HOIST + crate stacks
    const wall = T('#c8ccd2'), rib = T('#9aa6b6'), crate = T('#c8a46a'), band = T('#5a3a22'), yel = T('#ffd23a');
    M(BOX(w, h, d), wall, 0, h / 2, 0, g); for (let x = -w / 2 + 0.6; x < w / 2; x += 1.2) { M(BOX(0.12, h, 0.06), rib, x, h / 2, fz + 0.03, g, 0); M(BOX(0.12, h, 0.06), rib, x, h / 2, -fz - 0.03, g, 0); }
    const r = M(gable(w + 0.6, d + 0.6, 1.4), T('#3a3836'), 0, h, 0, g); r.castShadow = true;
    M(BOX(w * 0.7, 0.9, 2.4), T('#9a948a'), 0, 0.45, fz + 1.2, g); M(BOX(w * 0.7 + 0.1, 0.16, 0.16), yel, 0, 0.92, fz + 2.4, g, 0);
    M(BOX(2.4, 3.4, 0.14), dark, 0, 0.9 + 1.7, fz + 0.08, g, 0); for (let i = 0; i < 6; i++) M(BOX(2.3, 0.08, 0.04), i % 2 ? yel : T('#5b5753'), 0, 1.2 + i * 0.5, fz + 0.17, g, 0);
    M(BOX(0.2, h + 1.6, 0.2), dark, -w / 2 + 0.6, (h + 1.6) / 2, fz + 0.6, g); M(BOX(3.4, 0.2, 0.2), dark, -w / 2 + 2.1, h + 1.5, fz + 0.6, g, 0); M(BOX(0.04, 1.6, 0.04), dark, -w / 2 + 3.6, h + 0.7, fz + 0.6, g, 0); M(BOX(0.9, 0.7, 0.9), crate, -w / 2 + 3.6, h - 0.4, fz + 0.6, g, 0);
    for (let i = 0; i < 7; i++) { const x = -w / 2 - 1.4 + (i % 2) * 1.1, z = fz - 1 - Math.floor(i / 2) * 1.2, y = 0.5 + (i === 6 ? 1 : 0); M(BOX(1, 1, 1), crate, x, y, z, g); M(BOX(1.02, 0.12, 1.02), band, x, y, z, g, 0); }
    glow(0, h + 0.2, fz + 0.4, '#ffd9a0', 2.2, 0.7, g);
  }
  if (k === 'whbig') {   // s601d THE BIG WAREHOUSE: an arched-roof HANGAR (ribbed half-barrel), two roll-up doors, a crane rail over a crate yard, a little yellow forklift
    const shell = T('#9aa6b6'), rib = T('#5b5753'), crate = T('#c8a46a'), band = T('#5a3a22'), yel = T('#ffd23a');
    M(BOX(w, h * 0.55, d), shell, 0, h * 0.275, 0, g); const arc = new THREE.CylinderGeometry(w / 2, w / 2, d, 20, 1, false, 0, PI); arc.rotateZ(PI / 2); arc.rotateY(PI / 2);
    const A = M(arc, T('#c8ccd2', { side: THREE.DoubleSide }), 0, h * 0.55, 0, g); A.scale.y = (h * 0.6) / (w / 2);
    for (let z = -fz + 1; z < fz; z += 2.2) { const ring = M(new THREE.TorusGeometry(w / 2 + 0.05, 0.08, 4, 20, PI), rib, 0, h * 0.55, z, g, 0); ring.scale.y = (h * 0.6) / (w / 2); }
    for (const x of [-w * 0.32, w * 0.32]) { M(BOX(3.2, 3.6, 0.14), dark, x, 1.8, fz + 0.08, g, 0); for (let i = 0; i < 6; i++) M(BOX(3.1, 0.08, 0.04), i % 2 ? yel : T('#3a3836'), x, 0.5 + i * 0.55, fz + 0.17, g, 0); }
    M(BOX(2.4, 3.2, 0.14), dark, 0, 1.6, fz + 0.08, g, 0);
    const yx = w / 2 + 3.5; for (const z of [-fz + 1, fz - 1]) { M(BOX(0.3, h * 0.9, 0.3), dark, yx - 3, h * 0.45, z, g); M(BOX(0.3, h * 0.9, 0.3), dark, yx + 3, h * 0.45, z, g); } M(BOX(6.3, 0.3, 0.3), dark, yx, h * 0.9, -fz + 1, g, 0); M(BOX(6.3, 0.3, 0.3), dark, yx, h * 0.9, fz - 1, g, 0); M(BOX(0.4, 0.3, d - 2), yel, yx, h * 0.9, 0, g, 0);
    for (let i = 0; i < 12; i++) { const x = yx - 2 + (i % 3) * 1.6, z = -fz + 2.5 + Math.floor(i / 3) * 2.2, y = 0.6 + (rnd() < 0.4 ? 1.2 : 0); M(BOX(1.2, 1.2, 1.2), crate, x, y, z, g); M(BOX(1.22, 0.14, 1.22), band, x, y, z, g, 0); }
    const fx = -w / 2 - 2.2, fzz = fz - 0.5; M(BOX(1.4, 0.9, 2), yel, fx, 0.7, fzz, g); M(BOX(1.2, 1.1, 0.1), dark, fx, 1.7, fzz - 0.4, g, 0); for (const s of [-1, 1]) M(BOX(0.12, 2.4, 0.12), dark, fx + s * 0.55, 1.2, fzz + 1.05, g, 0); M(BOX(1.1, 0.08, 1), T('#5b5753'), fx, 0.3, fzz + 1.6, g, 0);
    glow(0, 3.6, fz + 0.4, '#ffd9a0', 2.4, 0.7, g);
  }
}
