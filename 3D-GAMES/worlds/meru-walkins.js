// MERU — the walk-in shops: Item Shop [meruItemshop], Armory [meruArmory], Fortune Teller [meruFortune], Burgers [meruBurgers].
// Built ON the square at real size (no fade), like the Ruins Museum: you see in through the open door and the front windows,
// and from inside you see the square. The roof lifts off while you are inside. Keepers, lines, stock and minigames are unchanged
// (worlds/meru-shops.js, meru-fortune.js, meru-burgers.js); only where things stand moved here.
// Footprints are in the square's art px (2880 x 1620); the south row sits on the square's south edge so the plaza stays open.
export const SHOPS = {
  itemshop: { key: 'itemshop', zone: 'meruItemshop', label: 'Item Shop', x0: 440, x1: 910, y0: 1200, y1: 1560, face: 'N', h: 3.6 },
  fortune: { key: 'fortune', zone: 'meruFortune', label: 'Fortune Teller', cx: 1110, cy: 1372, r: 165, face: 'N', h: 3.4 },
  armory: { key: 'armory', zone: 'meruArmory', label: 'Armory', x0: 2340, x1: 2840, y0: 1200, y1: 1540, face: 'N', h: 3.8 },
  burgers: { key: 'burgers', zone: 'meruBurgers', label: 'Burgers', x0: 50, x1: 388, y0: 1180, y1: 1560, face: 'N', h: 3.6 },
};
// people, in each room's local metres (origin = room centre, +z = toward the door), face 0 = looking at the door
const LOCAL = {
  kia: ['itemshop', 0, -3.3, 0], bram: ['armory', 0, -3.7, 0], ora: ['fortune', 0, -1.85, 0],
  burgerCook: ['burgers', 1.8, -3.5, 0], michaelJay: ['burgers', 3.5, 2.6, -Math.PI / 2],
};
export function walkins({ AX, AZ, S }) {
  const R = {};
  for (const d of Object.values(SHOPS)) {
    const cx = d.r ? d.cx : (d.x0 + d.x1) / 2, cy = d.r ? d.cy : (d.y0 + d.y1) / 2, rot = d.face === 'N' ? Math.PI : 0, sg = rot ? -1 : 1;
    const w = d.r ? d.r * 2 * S : (d.x1 - d.x0) * S, dp = d.r ? d.r * 2 * S : (d.y1 - d.y0) * S;
    const X = AX(cx), Z = AZ(cy);
    const wl = (lx, lz) => [X + sg * lx, Z + sg * lz];
    const front = d.r ? d.r * S : dp / 2;
    R[d.key] = { ...d, X, Z, rot, sg, w, d: dp, wl, wface: f => f + rot,
      door: (() => { const [x, z] = wl(0, front + 1.6); return { x, z, face: rot + Math.PI }; })(),       // stand here, looking in
      inside: (x, z) => { const lx = (x - X) * sg, lz = (z - Z) * sg; return d.r ? Math.hypot(lx, lz) < d.r * S - 0.25 : Math.abs(lx) < w / 2 - 0.2 && Math.abs(lz) < dp / 2 - 0.2; },
      region: (x, z) => { const lx = (x - X) * sg, lz = (z - Z) * sg, m = 2.2; return d.r ? Math.hypot(lx, lz) < d.r * S + m : Math.abs(lx) < w / 2 + m && Math.abs(lz) < dp / 2 + m; } };
  }
  const list = Object.values(R);
  return {
    R, list, S,
    at: (x, z) => list.find(s => s.inside(x, z)) || null,
    // the square's 2D walk mask still has the old shop footprints in it: inside a shop's region, walls are colliders instead
    walk: (x, z) => list.some(s => s.region(x, z)) ? true : undefined,
    place(people) { for (const p of people) { const l = LOCAL[p.key]; if (!l) continue; const s = R[l[0]], [x, z] = s.wl(l[1], l[2]); p.x = x; p.z = z; p.face = s.wface(l[3]); } },
  };
}

export function buildWalkins(K, WI) {
  const { THREE, scene, M, BOX, toon, BK, grad, glowing, glowSprite, DARK, WOOD, GOLD, colliders, camBlockers, lampM, sign, canvasTex, flames, rr } = K;
  const glassM = new THREE.MeshBasicMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide });
  const frameM = toon('#1b1830');
  const out = { roofs: {}, groups: {}, cuts: {}, ball: null };
  // one shared warm light that moves to the shop you are nearest (one light, so phones stay fast)
  const lamp = new THREE.PointLight(0xffd9a8, 0, 13, 1.5); scene.add(lamp);

  function room(s) {
    const T = new THREE.Group(); T.position.set(s.X, 0, s.Z); T.rotation.y = s.rot; scene.add(T);
    const shell = new THREE.Group(); T.add(shell); camBlockers.push(shell);
    const roof = new THREE.Group(); T.add(roof);   // not a camera blocker: raycasts hit hidden objects too
    out.roofs[s.key] = roof; out.groups[s.key] = T;
    const box = (x0, x1, z0, z1, h, mat, parent = T, ol = 0.025, y0 = 0) => { const m = M(BOX(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2, parent, ol); return m; };
    const col = (x0, x1, z0, z1) => { const [ax, az] = s.wl(x0, z0), [bx, bz] = s.wl(x1, z1); colliders.push({ box: [Math.min(ax, bx), Math.max(ax, bx), Math.min(az, bz), Math.max(az, bz)] }); };
    const solid = (x0, x1, z0, z1, h, mat) => { box(x0, x1, z0, z1, h, mat); col(x0, x1, z0, z1); };
    const circ = (x, z, r) => { const [ax, az] = s.wl(x, z); colliders.push({ c: [ax, az, r] }); };
    return { T, shell, roof, box, col, solid, circ };
  }
  // a rectangular shop: back + side walls, a front wall with an open door and two big windows, floor, flat roof.
  // Every wall is split at 1 m: the upper part is a CUTAWAY that hides while you are inside and the camera is beyond that wall.
  const LOW = 1.0;
  function rectShell(s, o) {
    const { T, shell, roof, box, col } = room(s), W2 = s.w / 2, D2 = s.d / 2, h = s.h, t = 0.3, dh = 1.8, win = o.win || [W2 * 0.55, 2.2], sill = 0.85, top = 2.5;
    const wm = BK.texMat(o.wall, o.wallCol, s.w / 2.4, h / 2.4), wmIn = o.inner ? BK.texMat(o.inner[0], o.inner[1], s.w / 2.4, h / 2.4) : wm, tm = toon(o.trim);
    const cuts = { F: [], B: [], L: [], R: [] }; out.cuts[s.key] = { cuts, W2, D2 };
    const cut = (side, m) => { cuts[side].push(m); return m; };
    const wall = (side, x0, x1, z0, z1, y0, y1, mat, ol = 0.04) => { if (y0 < LOW) box(x0, x1, z0, z1, Math.min(y1, LOW) - y0, mat, shell, ol, y0); if (y1 > LOW) cut(side, box(x0, x1, z0, z1, y1 - Math.max(y0, LOW), mat, shell, ol, Math.max(y0, LOW))); };
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(s.w - 0.2, s.d - 0.2), o.floorMat || BK.texMat(o.floor, o.floorCol, s.w / 2, s.d / 2)); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.1; fl.receiveShadow = true; T.add(fl);
    wall('B', -W2, W2, -D2, -D2 + t, 0, h, wm); wall('L', -W2, -W2 + t, -D2, D2, 0, h, wm); wall('R', W2 - t, W2, -D2, D2, 0, h, wm);
    if (o.inner) { wall('B', -W2 + t, W2 - t, -D2 + t, -D2 + t + 0.02, 0, h - 0.05, wmIn, 0); wall('L', -W2 + t, -W2 + t + 0.02, -D2 + t, D2 - t, 0, h - 0.05, wmIn, 0); wall('R', W2 - t - 0.02, W2 - t, -D2 + t, D2 - t, 0, h - 0.05, wmIn, 0); }
    const ww = win[1] / 2, wx = Math.min(W2 - ww - 0.3, Math.max(win[0], dh + ww + 0.35)), z0 = D2 - t, z1 = D2; out.cuts[s.key].win = { x: wx, w: win[1], sill, top };
    for (const [p, q] of [[-W2, -wx - ww], [-wx + ww, -dh], [dh, wx - ww], [wx + ww, W2]]) if (q - p > 0.05) wall('F', p, q, z0, z1, 0, h, wm);
    for (const c of [-wx, wx]) { box(c - ww, c + ww, z0, z1, sill, wm, shell, 0.03); cut('F', box(c - ww, c + ww, z0, z1, h - top, wm, shell, 0.03, top));
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(win[1], top - sill), glassM); gl.position.set(c, (sill + top) / 2, D2 - t / 2); T.add(gl); cut('F', gl);
      box(c - ww - 0.04, c + ww + 0.04, z1 - 0.02, z1 + 0.08, 0.1, frameM, T, 0, sill - 0.05); cut('F', box(c - ww - 0.04, c + ww + 0.04, z1 - 0.02, z1 + 0.08, 0.1, frameM, T, 0, top)); cut('F', box(c - 0.03, c + 0.03, z1 - 0.02, z1 + 0.06, top - sill, frameM, T, 0, sill)); }
    cut('F', box(-dh, dh, z0, z1, h - 2.7, wm, shell, 0.03, 2.7)); cut('F', box(-dh - 0.1, dh + 0.1, z1, z1 + 0.12, 0.14, tm, T, 0, 2.62));
    box(-W2 - 0.05, W2 + 0.05, D2, D2 + 0.06, 0.22, tm, shell, 0, 0); box(-W2 - 0.05, W2 + 0.05, -D2 - 0.06, D2 + 0.06, 0.2, tm, roof, 0.02, h);
    box(-W2 - 0.25, W2 + 0.25, -D2 - 0.25, D2 + 0.25, 0.3, toon(o.roofCol), roof, 0.03, h + 0.2);
    box(-W2 + 0.6, W2 - 0.6, -D2 + 0.6, D2 - 0.6, 0.35, toon(o.roofTop || o.roofCol), roof, 0.02, h + 0.5);
    col(-W2, W2, -D2 - 0.1, -D2 + t + 0.1); col(-W2 - 0.1, -W2 + t + 0.1, -D2, D2); col(W2 - t - 0.1, W2 + 0.1, -D2, D2); col(-W2, -dh, D2 - t - 0.1, D2 + 0.1); col(dh, W2, D2 - t - 0.1, D2 + 0.1);
    return { T, shell, roof, box, col, W2, D2, h, tm, cutF: m => cut('F', m), solid: (x0, x1, zz0, zz1, hh, mat) => { box(x0, x1, zz0, zz1, hh, mat); col(x0, x1, zz0, zz1); } };
  }
  const sconce = (T, x, y, z) => { M(BOX(0.16, 0.24, 0.1), lampM, x, y, z, T, 0.01); glowSprite(x, y, z, 0xffc070, 0.55, T); };

  // ---------------- ITEM SHOP (Kia) ----------------
  { const s = WI.R.itemshop, r = rectShell(s, { wall: 'tile', wallCol: '#1d3b3a', inner: ['tile', '#24504d'], trim: '#e6e1d3', floor: 'plank', floorCol: '#8a6440', roofCol: '#14302e', roofTop: '#1d3b3a', win: [3.9, 2.6] });
    const { T, W2, D2, h, solid } = r, GREEN = toon('#3f6b4a');
    // outside: awning, SHOP sign, flower boxes, banners
    for (let i = 0; i < 10; i++) { const st = r.cutF(M(BOX(s.w / 10, 0.06, 1.5), toon(i % 2 ? '#f2f0ea' : '#3f9a5e'), -W2 + (i + 0.5) * s.w / 10, 2.95, D2 + 0.7, T, 0.015)); st.rotation.x = 0.35; }
    { const g = new THREE.Group(); g.position.set(0, 0, 0); T.add(g); sign(g, 'SHOP', (c, x, y) => { c.fillStyle = '#7ef0b0'; c.beginPath(); c.moveTo(x + 10, y - 26); c.lineTo(x + 22, y - 26); c.lineTo(x + 22, y - 8); c.lineTo(x + 34, y + 22); c.lineTo(x - 2, y + 22); c.lineTo(x + 10, y - 8); c.closePath(); c.fill(); }, 3.4, h + 0.15, D2 + 0.2, '#4ade80'); r.roof.add(g); }
    for (const c of [-3.9, 3.9]) { M(BOX(2.7, 0.3, 0.4), toon('#5a3420'), c, 0.7, D2 + 0.25, T, 0.015); for (let k = 0; k < 5; k++) M(new THREE.SphereGeometry(0.13, 8, 6), toon(['#ff8a3a', '#9ad04a', '#ec3013', '#f472b6', '#facc15'][k]), c - 1.0 + k * 0.5, 0.95, D2 + 0.25, T, 0); }
    // inside: counter, potion shelves behind Kia, crates, sale table, lamps
    solid(-3.6, 3.6, -2.7, -2.0, 1.05, GREEN); M(BOX(7.4, 0.08, 0.95), toon('#e6e1d3'), 0, 1.09, -2.35, T, 0.01);
    for (const x of [-1.5, 1.5]) M(new THREE.CylinderGeometry(0.05, 0.05, 0.25, 6), toon('#cbd5e1'), x, 1.25, -2.35, T, 0);
    for (let row = 0; row < 3; row++) { M(BOX(9, 0.08, 0.55), WOOD, 0, 1.2 + row * 0.75, -D2 + 0.6, T, 0.01); for (let i = 0; i < 14; i++) { const c = ['#4ade80', '#38bdf8', '#f472b6', '#facc15', '#c084fc'][(i + row) % 5]; M(new THREE.CylinderGeometry(0.1, 0.12, 0.3, 8), toon(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.4 }), -4.1 + i * 0.63, 1.4 + row * 0.75, -D2 + 0.6, T, 0.01); } }
    for (const [x, z] of [[-5.3, 2.2], [-4.5, 3.4], [5.3, 3.2]]) solid(x - 0.45, x + 0.45, z - 0.45, z + 0.45, 0.9, WOOD);
    solid(2.0, 4.2, 0.6, 1.5, 0.85, WOOD); for (let i = 0; i < 4; i++) M(BOX(0.38, 0.3, 0.38), toon(['#a8323e', '#e6b45a', '#38bdf8', '#4ade80'][i]), 2.35 + i * 0.5, 1.0, 1.05, T, 0.01);
    for (const x of [-3.2, 3.2]) { M(new THREE.CylinderGeometry(0.12, 0.18, 0.18, 10), lampM, x, h - 0.3, -0.5, T, 0.01, 0.32); }
    sconce(T, -W2 + 0.35, 2.3, -1); sconce(T, W2 - 0.35, 2.3, -1);
  }
  // ---------------- ARMORY (Bram) ----------------
  { const s = WI.R.armory, r = rectShell(s, { wall: 'panel', wallCol: '#38404f', inner: ['brick', '#2a315a'], trim: '#c0995c', floor: 'stone', floorCol: '#5c5675', roofCol: '#4f5868', roofTop: '#6f7a8c', win: [4.1, 2.6] });
    const { T, W2, D2, h, solid } = r, STEEL = toon('#8a94a8');
    // outside: timber braces, sign, shield, banners
    for (const sx of [-1, 1]) { const x = sx * (W2 - 0.9); r.cutF(M(BOX(0.18, h - LOW, 0.1), toon('#5a4030'), x, LOW + (h - LOW) / 2, D2 + 0.05, T, 0)); }
    { const g = new THREE.Group(); T.add(g); sign(g, 'ARMORY', (c, x, y) => { c.strokeStyle = '#f6e7c8'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x + 46, y + 24); c.moveTo(x + 46, y - 24); c.lineTo(x, y + 24); c.stroke(); }, 4.0, h + 0.15, D2 + 0.2, '#94a3b8'); r.roof.add(g); }
    { const sh = r.cutF(M(new THREE.CylinderGeometry(0.75, 0.75, 0.14, 28), STEEL, -W2 + 0.5, 3.0, D2 + 0.12, T, 0.03, 0.75)); sh.rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.25, 0.25, 0.18, 16), GOLD, 0, 0.05, 0, sh, 0); }
    // inside: counter, wall of blades, shields on the side walls, armour stands, forge, anvil
    solid(-3.2, 3.2, -3.0, -2.3, 1.0, toon('#26306b')); M(BOX(6.6, 0.08, 0.85), toon('#c0995c'), 0, 1.04, -2.65, T, 0.01);
    for (let i = 0; i < 10; i++) { const x = -4.5 + i; M(BOX(0.06, 1.5, 0.04), toon('#e7edf4'), x, 2.3, -D2 + 0.45, T, 0.01); M(BOX(0.3, 0.06, 0.06), GOLD, x, 1.55, -D2 + 0.47, T, 0); }
    for (const sx of [-1, 1]) for (const z of [-2.4, -0.2]) M(new THREE.CylinderGeometry(0.42, 0.42, 0.08, 18), toon('#2a315a'), sx * (W2 - 0.45), 2.0, z, T, 0.02, 0.42).rotation.z = Math.PI / 2;
    for (const [x, z] of [[-5.4, 2.0], [5.4, 2.0], [-5.4, -0.8]]) { const g = new THREE.Group(); g.position.set(x, 0, z); T.add(g); M(new THREE.CylinderGeometry(0.06, 0.06, 1.4, 6), WOOD, 0, 0.7, 0, g, 0.01); M(BOX(0.7, 0.8, 0.4), STEEL, 0, 1.6, 0, g, 0.02); M(new THREE.SphereGeometry(0.22, 10, 8), STEEL, 0, 2.2, 0, g, 0.02, 0.22); r.col(x - 0.4, x + 0.4, z - 0.4, z + 0.4); }
    solid(4.0, 6.3, -4.35, -3.1, 1.2, toon('#3a3448')); { const gw = M(BOX(1.4, 0.4, 0.8), toon('#ff8a2a', { emissive: new THREE.Color('#ff6a1a'), emissiveIntensity: 1.6 }), 5.15, 1.3, -3.7, T, 0); gw.castShadow = false; glowSprite(5.15, 1.5, -3.7, 0xff7a30, 3.2, T); }
    solid(-1.0, 0.0, 0.8, 1.4, 0.8, toon('#3a3448')); M(BOX(1.4, 0.25, 0.5), toon('#4a4f6a'), -0.5, 0.92, 1.1, T, 0.02);
    for (const x of [-3.4, 3.4]) M(new THREE.CylinderGeometry(0.12, 0.18, 0.18, 10), lampM, x, h - 0.3, -0.6, T, 0.01, 0.32);
  }
  // ---------------- BURGERS (Sizzle, Michael Jay) ----------------
  { const s = WI.R.burgers, RED = toon('#c42d3c'), CHROME = toon('#cbd5e1'), CREAM = toon('#f2ead8');
    const checker = n => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'); g.fillStyle = '#f4f1ea'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#1b1b22'; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(n[0], n[1]); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t; };
    const r = rectShell(s, { wall: 'tile', wallCol: '#f2ead8', trim: '#cbd5e1', floorMat: new THREE.MeshToonMaterial({ map: checker([s.w / 1.6, s.d / 1.6]), gradientMap: grad }), roofCol: '#1b1b22', roofTop: '#2a2a33', win: [3.0, 2.2] });
    const { T, W2, D2, h, solid, box } = r;
    // red band + chrome strip all round, inside and out
    box(-W2 - 0.03, W2 + 0.03, -D2 - 0.03, -D2 + 0.33, 1.0, RED, T, 0); box(-W2 - 0.03, -W2 + 0.33, -D2, D2, 1.0, RED, T, 0); box(W2 - 0.33, W2 + 0.03, -D2, D2, 1.0, RED, T, 0);
    for (const [a, b] of [[-W2 - 0.03, -1.2], [1.2, W2 + 0.03]]) { box(a, b, D2 - 0.33, D2 + 0.03, 0.85, RED, T, 0); box(a, b, D2 - 0.35, D2 + 0.05, 0.08, CHROME, T, 0, 0.85); }
    for (let i = 0; i < 9; i++) { const st = r.cutF(M(BOX(s.w / 9, 0.06, 1.2), i % 2 ? CREAM : RED, -W2 + (i + 0.5) * s.w / 9, 2.9, D2 + 0.55, T, 0.01)); st.rotation.x = 0.32; }
    { const g = new THREE.Group(); T.add(g); sign(g, 'BURGERS', null, 4.4, h + 0.15, D2 + 0.2, '#f97316'); r.roof.add(g); }
    M(BOX(2.2, 0.04, 1.2), RED, 0, 0.03, D2 + 0.8, T, 0);
    // kitchen line on the back wall
    solid(0.5, 3.9, -D2 + 0.3, -D2 + 1.2, 0.95, toon('#3a3a44'));
    { const top = M(BOX(3.3, 0.06, 0.85), toon('#2a2a30', { emissive: new THREE.Color('#ff5a1a'), emissiveIntensity: 0.35 }), 2.2, 0.98, -D2 + 0.75, T, 0); top.castShadow = false; }
    for (let i = 0; i < 4; i++) M(new THREE.CylinderGeometry(0.2, 0.2, 0.07, 14), toon('#5a3420'), 1.0 + i * 0.8, 1.04, -D2 + 0.75, T, 0.006, 0.2);
    glowSprite(2.2, 1.3, -D2 + 0.75, 0xff7a30, 2.8, T);
    M(BOX(3.4, 0.06, 0.06), CHROME, 2.2, 2.0, -D2 + 0.38, T, 0); for (let i = 0; i < 4; i++) M(BOX(0.34, 0.48, 0.02), toon('#fbfaf5'), 0.9 + i * 0.85, 1.72, -D2 + 0.4, T, 0.005);
    solid(-1.1, 0.3, -D2 + 0.3, -D2 + 1.2, 0.95, toon('#4a4a55')); M(BOX(1.2, 0.05, 0.6), toon('#e8b84a', { emissive: new THREE.Color('#a8781a'), emissiveIntensity: 0.4 }), -0.4, 0.97, -D2 + 0.75, T, 0);
    solid(-4.3, -1.5, -D2 + 0.3, -D2 + 1.2, 1.0, toon('#3a3a44')); M(BOX(1.8, 0.85, 0.45), CHROME, -2.9, 1.43, -D2 + 0.65, T, 0.02);
    for (let i = 0; i < 3; i++) { const c = ['#c42d3c', '#f97316', '#38bdf8'][i]; M(BOX(0.3, 0.4, 0.06), toon(c, { emissive: new THREE.Color(c), emissiveIntensity: 0.4 }), -3.5 + i * 0.6, 1.48, -D2 + 0.9, T, 0); }
    { const c = document.createElement('canvas'); c.width = 1024; c.height = 228; const g = c.getContext('2d'); g.fillStyle = '#16161c'; g.fillRect(0, 0, 1024, 228); g.fillStyle = '#f97316'; g.font = '900 128px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('BURGERS', 57, 123); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const m = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.98), new THREE.MeshBasicMaterial({ map: t })); m.position.set(0, 2.9, -D2 + 0.32); T.add(m); }
    // counter with its return; you come round the west end
    solid(-3.4, 3.2, -2.9, -2.2, 1.05, RED); M(BOX(6.7, 0.08, 0.9), CHROME, -0.1, 1.09, -2.55, T, 0.01);
    solid(3.2, 3.9, -2.9, -1.0, 1.05, RED); M(BOX(0.8, 0.08, 2.0), CHROME, 3.55, 1.09, -1.95, T, 0.01);
    for (let i = 0; i < 5; i++) { const x = -2.9 + i * 1.25; M(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), CHROME, x, 0.35, -1.7, T, 0); M(new THREE.CylinderGeometry(0.28, 0.28, 0.12, 14), RED, x, 0.74, -1.7, T, 0.01, 0.28); r.col(x - 0.28, x + 0.28, -1.98, -1.42); }
    // two booths on the west wall
    for (const z of [0.6, 3.3]) { solid(-W2 + 0.3, -W2 + 1.7, z - 0.5, z + 0.5, 0.78, CREAM); M(BOX(1.5, 0.06, 1.1), CHROME, -W2 + 1.0, 0.8, z, T, 0); for (const sg of [-1, 1]) { solid(-W2 + 0.3, -W2 + 1.6, z + sg * 1.0 - 0.28, z + sg * 1.0 + 0.28, 0.5, RED); M(BOX(1.3, 0.7, 0.14), RED, -W2 + 0.95, 0.85, z + sg * 1.24, T, 0.02); } }
    // Michael Jay's table
    { const x = 2.4, z = 2.6; M(new THREE.CylinderGeometry(0.6, 0.6, 0.07, 18), CREAM, x, 0.8, z, T, 0.01, 0.6); M(new THREE.CylinderGeometry(0.06, 0.12, 0.8, 8), CHROME, x, 0.4, z, T, 0); r.col(x - 0.6, x + 0.6, z - 0.6, z + 0.6);
      M(new THREE.CylinderGeometry(0.28, 0.28, 0.1, 12), RED, x - 1.1, 0.6, z, T, 0.01, 0.28); M(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 6), CHROME, x - 1.1, 0.3, z, T, 0);
      M(new THREE.CylinderGeometry(0.1, 0.08, 0.22, 10), RED, x + 0.2, 0.94, z - 0.2, T, 0.005); }
    for (const [x, z] of [[-2, -0.3], [2, -0.3], [0, 3]]) { M(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 4), DARK, x, h - 0.25, z, T, 0); M(new THREE.ConeGeometry(0.32, 0.28, 12, 1, true), RED, x, h - 0.6, z, T, 0.01, 0.32); M(new THREE.SphereGeometry(0.11, 8, 6), lampM, x, h - 0.72, z, T, 0); }
  }
  // ---------------- FORTUNE TELLER (Ora's tent) ----------------
  { const s = WI.R.fortune, { T, shell, roof } = room(s), rad = s.r * WI.S, h = s.h;
    const starsT = canvasTex(1024, 128, c => { c.fillStyle = '#2a2458'; c.fillRect(0, 0, 1024, 128); c.fillStyle = '#e8e2ff'; for (let i = 0; i < 120; i++) { c.beginPath(); c.arc(rr(0, 1024), rr(0, 128), rr(1, 3), 0, 7); c.fill(); } c.fillStyle = '#f0c96a'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(40 + i * 85, 64, 12, 0.6, 5.7); c.fill(); } });
    const outM = new THREE.MeshToonMaterial({ map: starsT, gradientMap: grad, side: THREE.DoubleSide }), inM = toon('#5b2a7a', { side: THREE.DoubleSide });
    // the wall in bands so it can have a doorway (front) and two open window flaps either side of it
    const DOOR = 0.6, WIN = [[0.9, 1.5], [-1.5, -0.9]];   // angles from the front (+z), radians
    const seg = (a0, a1, y0, y1) => { if (a1 - a0 < 0.01) return; for (const [m, rr2] of [[outM, rad], [inM, rad - 0.06]]) { const g = new THREE.CylinderGeometry(rr2, rr2, y1 - y0, Math.max(3, Math.round((a1 - a0) * 10)), 1, true, a0, a1 - a0); const ms = new THREE.Mesh(g, m); ms.position.y = (y0 + y1) / 2; ms.castShadow = ms.receiveShadow = true; shell.add(ms); } };
    // CylinderGeometry angle 0 points at +z
    const T0 = DOOR, T1 = Math.PI * 2 - DOOR;
    seg(T0, T1, 0, 1.0); seg(T0, T1, 2.3, h);
    { let a = T0; for (const [w0, w1] of [[WIN[0][0], WIN[0][1]], [Math.PI * 2 + WIN[1][0], Math.PI * 2 + WIN[1][1]]].sort((p, q) => p[0] - q[0])) { seg(a, w0, 1.0, 2.3); a = w1; } seg(a, T1, 1.0, 2.3); }
    seg(-DOOR, DOOR, 2.5, h);
    for (const [a0, a1] of WIN) for (const a of [a0, a1]) M(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6), GOLD, Math.sin(a) * (rad + 0.02), 1.65, Math.cos(a) * (rad + 0.02), shell, 0);
    M(new THREE.TorusGeometry(rad + 0.04, 0.08, 6, 48), GOLD, 0, h, 0, roof, 0).rotation.x = Math.PI / 2;
    M(new THREE.ConeGeometry(rad + 0.5, 3.0, 40), toon('#3d2f7a'), 0, h + 1.5, 0, roof, 0.05, rad + 0.5);
    { const orb = M(new THREE.SphereGeometry(0.5, 24, 16), glowing('#58d8ff', null, 1.8), 0, h + 3.4, 0, roof, 0.04, 0.5); glowSprite(0, h + 3.4, 0, 0x7fd8ff, 3.6, roof); flames.push({ bob: orb, y: h + 3.4 }); }
    { const g = new THREE.Group(); roof.add(g); sign(g, 'FORTUNE TELLER', null, 3.4, h + 0.45, rad + 0.25, '#c084fc'); }
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const f = M(new THREE.ConeGeometry(0.15, 0.34, 3), toon(i % 3 === 0 ? '#e6b45a' : i % 3 === 1 ? '#c084fc' : '#f2f0ea'), Math.sin(a) * (rad + 0.3), h - 0.2, Math.cos(a) * (rad + 0.3), roof, 0.01); f.rotation.set(Math.PI, a, 0); }
    // lanterns either side of the door, rug in front
    for (const sx of [-1, 1]) { const x = sx * 1.5; M(new THREE.CylinderGeometry(0.05, 0.06, 2.6, 8), DARK, x, 1.3, rad + 0.7, T, 0.012, 0.06); M(new THREE.SphereGeometry(0.22, 12, 8), toon('#c084fc', { emissive: new THREE.Color('#c084fc'), emissiveIntensity: 1.4 }), x, 2.7, rad + 0.7, T, 0.015, 0.22); glowSprite(x, 2.7, rad + 0.7, 0xc084fc, 2.0, T); const [ax, az] = s.wl(x, rad + 0.7); colliders.push({ c: [ax, az, 0.2] }); }
    M(new THREE.CylinderGeometry(1.1, 1.1, 0.03, 32), toon('#5b2a7a'), 0, 0.04, rad + 1.0, T, 0);
    // floor, ring, table, crystal ball, candles, cushions
    const rug = new THREE.Mesh(new THREE.CircleGeometry(rad - 0.1, 40), toon('#3b1d5a')); rug.rotation.x = -Math.PI / 2; rug.position.y = 0.1; T.add(rug);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rad - 0.6, 0.05, 6, 48), toon('#e6b45a')); ring.rotation.x = Math.PI / 2; ring.position.y = 0.12; T.add(ring);
    M(new THREE.CylinderGeometry(0.85, 0.85, 0.08, 24), WOOD, 0, 0.8, -0.9, T, 0.02, 0.85); M(new THREE.CylinderGeometry(0.15, 0.25, 0.8, 10), WOOD, 0, 0.4, -0.9, T, 0.01, 0.25);
    M(new THREE.CylinderGeometry(0.95, 1.0, 0.5, 24, 1, true), toon('#7c3aed', { side: THREE.DoubleSide }), 0, 0.6, -0.9, T, 0);
    const ball = M(new THREE.SphereGeometry(0.3, 20, 14), glowing('#a5f3fc', null, 1.2), 0, 1.14, -0.9, T, 0.015, 0.3); ball.castShadow = false; glowSprite(0, 1.14, -0.9, 0x8be9ff, 2.4, T); out.ball = ball;
    M(new THREE.TorusGeometry(0.22, 0.05, 6, 16), GOLD, 0, 0.88, -0.9, T, 0).rotation.x = Math.PI / 2;
    for (const [x, z] of [[-0.55, -1.3], [0.55, -1.3], [0.65, -0.45]]) { M(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 6), toon('#f4f1ec'), x, 0.94, z, T, 0); glowSprite(x, 1.1, z, 0xffc060, 0.55, T); }
    for (const [x, z, c] of [[-2.3, 1.3, '#c42d3c'], [2.3, 1.3, '#e6b45a'], [-2.6, -1.3, '#38bdf8']]) M(new THREE.CylinderGeometry(0.45, 0.5, 0.25, 12), toon(c), x, 0.22, z, T, 0.01, 0.5);
    { const [ax, az] = s.wl(0, -0.9); colliders.push({ c: [ax, az, 1.0] }); }
    // wall colliders: a ring of posts, leaving the doorway open
    for (let a = DOOR + 0.06; a < Math.PI * 2 - DOOR - 0.02; a += 0.14) { const [ax, az] = s.wl(Math.sin(a) * rad, Math.cos(a) * rad); colliders.push({ c: [ax, az, 0.3] }); }
  }
  return {
    ...out,
    update(x, z, t, cx, cz, cam, dt = 0.016) {
      const inS = WI.at(x, z); let best = null, bd = 16;
      // a shop counts as 'here' while you are in it, for 1.2 s after you step out, and while the real camera is still at its walls
      for (const s of WI.list) { const C = out.cuts[s.key]; if (inS === s) s.leftT = 1.2; else s.leftT = Math.max(0, (s.leftT || 0) - dt); const qx = cam ? (cam.x - s.X) * s.sg : 99, qz = cam ? (cam.z - s.Z) * s.sg : 99; s.camNear = !!C && Math.abs(qx) < C.W2 + 2.5 && Math.abs(qz) < C.D2 + 2.5 && (!cam || cam.y < s.h + 4); s.near = inS === s || s.leftT > 0 || s.camNear; if (!C) continue;
        const inside = inS === s, lx = inside ? (cx - s.X) * s.sg : qx, lz = inside ? (cz - s.Z) * s.sg : qz, here = s.near;
        const hide = { F: here && lz > C.D2 - 0.6, B: here && lz < -C.D2 + 0.6, L: here && lx < -C.W2 + 0.6, R: here && lx > C.W2 - 0.6 };
        for (const k in C.cuts) for (const m of C.cuts[k]) m.visible = !hide[k]; }
      for (const s of WI.list) { out.roofs[s.key].visible = !s.near; const d = Math.hypot(s.X - x, s.Z - z); out.groups[s.key].visible = d < 70; if (d < bd) { bd = d; best = s; } }
      if (best) { lamp.position.set(best.X, best.h - 0.6, best.Z); lamp.intensity = (inS === best ? 9 : 6) * Math.min(1, (16 - bd) / 6); } else lamp.intensity = 0;
      if (out.ball) out.ball.material.emissiveIntensity = 0.9 + Math.sin(t * 2.2) * 0.4;
      return inS;
    },
  };
}
