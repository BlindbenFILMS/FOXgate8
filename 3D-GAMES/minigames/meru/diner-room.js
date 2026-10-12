// The Burgers diner ROOM (Sizzle's): recipes, sides, ingredient models and buildDiner(ctx). No imports: everything comes in on ctx,
// so both the stand-alone shift (burger-shift.js) and Meru 2.0 (worlds/meru2-rooms2.js) build the same room from this one file.
export const RECIPES = [
  { id: 'plain', name: 'MERU BURGER', day: 1, stack: ['patty'], price: 6 },
  { id: 'garden', name: 'GARDEN BURGER', day: 1, stack: ['patty', 'lettuce', 'tomato'], price: 7 },
  { id: 'cheese', name: 'CHEESEBURGER', day: 2, stack: ['patty', 'cheese'], price: 7 },
  { id: 'castle', name: 'THE CASTLE', day: 3, stack: ['patty', 'cheese', 'lettuce', 'tomato', 'sauce'], price: 9 },
  { id: 'pickle', name: 'PICKLE BACK', day: 3, stack: ['patty', 'pickle', 'onion', 'sauce'], price: 8 },
  { id: 'double', name: 'DOUBLE GATE', day: 4, stack: ['patty', 'cheese', 'patty', 'cheese'], price: 11 },
  { id: 'melt', name: 'MERU MELT', day: 5, stack: ['patty', 'cheese', 'onion', 'sauce', 'patty'], price: 12 }];

export const SIDES = { fries: { name: 'FRIES', day: 2, price: 3 }, cola: { name: 'COLA', day: 1, price: 2, col: '#5a2a1a' }, orange: { name: 'ORANGE', day: 1, price: 2, col: '#ff8a1a' }, shake: { name: 'SHAKE', day: 3, price: 4, col: '#f7b6d2' } };

export function makeIng(T3, toon, k, state, outline) {
  const g = new T3.Group(), add = (geo, col, x = 0, y = 0, z = 0, o = 0.012, r) => { const m = new T3.Mesh(geo, toon(col)); m.position.set(x, y, z); m.castShadow = true; if (outline && o) outline(m, o, r); g.add(m); return m; };
  const wavy = (r, h, waves, amp, ruff = 0, seg = 40) => { const geo = new T3.CylinderGeometry(r, r, h, seg, 1); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), rr2 = Math.hypot(x, z); if (rr2 < r * 0.5) continue; const a = Math.atan2(z, x), s = 1 + amp * Math.sin(a * waves) + amp * 0.5 * Math.sin(a * waves * 2.3 + 1); p.setX(i, x * s); p.setZ(i, z * s); p.setY(i, p.getY(i) + ruff * Math.sin(a * waves + 0.7)); } geo.computeVertexNormals(); return geo; };
  const lathe = pts => new T3.LatheGeometry(pts.map(([x, y]) => new T3.Vector2(x, y)), 28);
  if (k === 'bunB') { add(lathe([[0, 0], [0.13, 0], [0.152, 0.012], [0.158, 0.03], [0.15, 0.048], [0, 0.05]]), '#d98f3a', 0, 0, 0, 0.01, 0.16); add(new T3.CylinderGeometry(0.142, 0.142, 0.006, 28), '#f6dca0', 0, 0.05, 0, 0); }
  else if (k === 'bunT') { add(lathe([[0, 0], [0.152, 0], [0.16, 0.012], [0.152, 0.04], [0.12, 0.072], [0.07, 0.094], [0, 0.1]]), '#e39a42', 0, 0, 0, 0.01, 0.16); add(new T3.CylinderGeometry(0.15, 0.15, 0.004, 28), '#f6dca0', 0, 0.001, 0, 0);
    for (let i = 0; i < 14; i++) { const a = i * 2.4 + 0.3, r = 0.025 + (i % 5) * 0.022, y = 0.1 - (r / 0.16) ** 2 * 0.085; const s = add(new T3.SphereGeometry(0.009, 6, 4), '#fff6d8', Math.cos(a) * r, y + 0.002, Math.sin(a) * r, 0); s.scale.set(1, 0.55, 1.6); s.rotation.y = a; } }
  else if (k === 'patty') { const col = state && state !== 'raw' ? ({ rare: '#c4523e', medium: '#8a4a26', well: '#5a3018', burnt: '#2a1a14', done: '#6e3f22' }[state] || '#6e3f22') : '#e57373'; add(wavy(0.16, 0.045, 9, 0.035), col, 0, 0, 0, 0.012, 0.16);
    if (state && state !== 'raw') for (const dz of [-0.06, 0, 0.06]) add(new T3.BoxGeometry(0.24, 0.004, 0.016), state === 'burnt' ? '#120a08' : '#2a160c', 0, 0.0235, dz, 0).rotation.y = 0.6;
    else for (let i = 0; i < 8; i++) add(new T3.SphereGeometry(0.012, 5, 4), '#f2a0a0', Math.cos(i * 2.1) * 0.09, 0.022, Math.sin(i * 2.1) * 0.09, 0).scale.y = 0.4; }
  else if (k === 'cheese') { const geo = new T3.BoxGeometry(0.29, 0.012, 0.29, 8, 1, 8), p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), c = (Math.max(Math.abs(x), Math.abs(z)) / 0.145) ** 3; p.setY(i, p.getY(i) - c * 0.03 * (0.6 + 0.4 * Math.abs(Math.sin(x * 40 + z * 30)))); } geo.computeVertexNormals(); add(geo, '#ffc93a', 0, 0, 0, 0.006).rotation.y = 0.4; }
  else if (k === 'lettuce') { add(wavy(0.172, 0.012, 11, 0.09, 0.012), '#5aa83a', 0, 0, 0, 0.006); add(wavy(0.15, 0.012, 13, 0.1, 0.01), '#86d44e', 0, 0.01, 0, 0.006).rotation.y = 0.5; }
  else if (k === 'tomato') { for (const [x, z, r] of [[-0.04, 0.02, 0.085], [0.05, -0.02, 0.08]]) { add(new T3.CylinderGeometry(r, r, 0.018, 24), '#d83a28', x, 0, z, 0.008, r); add(new T3.CylinderGeometry(r * 0.78, r * 0.78, 0.02, 24), '#f06a52', x, 0.0005, z, 0); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; const s = add(new T3.SphereGeometry(r * 0.22, 8, 5), '#ffc9a8', x + Math.cos(a) * r * 0.42, 0.011, z + Math.sin(a) * r * 0.42, 0); s.scale.set(1, 0.25, 0.6); s.rotation.y = -a; } } }
  else if (k === 'pickle') { for (const [x, z] of [[-0.06, 0.03], [0.05, 0.05], [0.0, -0.06]]) { add(wavy(0.045, 0.01, 7, 0.06), '#5f7d1e', x, 0, z, 0.006, 0.045); add(new T3.CylinderGeometry(0.03, 0.03, 0.011, 16), '#a8c45a', x, 0.0005, z, 0); } }
  else if (k === 'onion') { for (const [r, c] of [[0.12, '#f2e6ef'], [0.085, '#e8c9e0'], [0.05, '#f6eef4']]) { const m = add(new T3.TorusGeometry(r, 0.013, 6, 28), c, 0, 0, 0, 0.004); m.rotation.x = Math.PI / 2; m.scale.z = 0.6; } }
  else if (k === 'sauce') { add(wavy(0.11, 0.006, 6, 0.18), '#c42d3c', 0, 0, 0, 0); add(wavy(0.06, 0.007, 5, 0.2), '#e0493f', 0.02, 0.002, 0.01, 0); }
  return g; }

export function buildDiner(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 12, D = 10, H = 4.2, red = toon('#c42d3c'), white = toon('#f6f3ee'), chrome = toon('#d7dde3'), ink = toon('#201e1d'), wood = toon('#8a5a32'), teal = toon('#5cc6c0');
  const floorT = CTX(256, 256, c => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#f6f3ee' : '#c42d3c'; c.fillRect(x * 32, y * 32, 32, 32); } }); floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 1.2, D / 1.2);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  { const kt = floorT.clone(); kt.needsUpdate = true; kt.repeat.set(W / 1.2, 8 / 1.2); const kf = new T3.Mesh(new T3.PlaneGeometry(W, 8), new T3.MeshToonMaterial({ map: kt, gradientMap: ctx.grad })); kf.rotation.x = -Math.PI / 2; kf.position.set(0, -0.002, -D / 2 - 4); root.add(kf); }
  const wallT = CTX(256, 256, c => { c.fillStyle = '#f2e8d8'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#5cc6c0'; c.fillRect(0, 150, 256, 106); c.fillStyle = '#c42d3c'; c.fillRect(0, 140, 256, 10); c.fillStyle = '#d9cbb3'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 150, 2, 106); }); wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1);
  const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad });
  const cut = []; for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); if (!ry) cut.push(m); }
  { const fw = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); fw.position.set(0, H / 2, D / 2); fw.rotation.y = Math.PI; fw.userData.front = true; root.add(fw); }
  cut.push(M(new T3.BoxGeometry(W, 0.2, D), toon('#e8dccb'), 0, H + 0.1, 0, root, 0));
  // the big front window onto the square (bright), the door
  const front = [], booths = []; { const fc = root.children.length; const win = new T3.Mesh(new T3.PlaneGeometry(6, 2), new T3.MeshBasicMaterial({ color: 0xbfe6ff })); win.position.set(-1.6, 1.9, D / 2 - 0.02); win.rotation.y = Math.PI; root.add(win); for (const x of [-4.6, -1.6, 1.4]) M(new T3.BoxGeometry(0.12, 2.1, 0.12), red, x, 1.9, D / 2 - 0.06, root, 0.01); M(new T3.BoxGeometry(6.1, 0.12, 0.14), red, -1.6, 2.92, D / 2 - 0.06, root, 0.01); M(new T3.BoxGeometry(6.1, 0.12, 0.14), red, -1.6, 0.88, D / 2 - 0.06, root, 0.01);
    const door = new T3.Mesh(new T3.PlaneGeometry(1.6, 2.6), new T3.MeshBasicMaterial({ color: 0xd8f0ff })); door.position.set(4, 1.3, D / 2 - 0.02); door.rotation.y = Math.PI; root.add(door); M(new T3.BoxGeometry(1.8, 0.14, 0.14), red, 4, 2.64, D / 2 - 0.06, root, 0.01); front.push(...root.children.slice(fc)); }
  // KITCHEN (back): flat-top grill, fryer, drink machine, prep board, ingredient bins, bag stand, register
  const KZ = -2.6, K = { root, z: KZ, cut, front, booths };
  cut.push(M(new T3.BoxGeometry(W - 0.4, 0.9, 1.0), chrome, 0, 0.45, KZ - 1.4, root, 0.03));   // back counter
  M(new T3.BoxGeometry(5.8, 0.95, 1.75), white, 0, 0.475, KZ + 0.2, root, 0.03); M(new T3.BoxGeometry(5.9, 0.06, 1.85), chrome, 0, 0.98, KZ + 0.2, root, 0.015); M(new T3.BoxGeometry(5.9, 0.12, 0.06), red, 0, 0.82, KZ + 1.13, root, 0);
  K.top = 1.01;
  // grill (left)
  K.grill = { x: -1.75, z: KZ - 0.05 }; M(new T3.BoxGeometry(1.3, 0.04, 0.9), ink, K.grill.x, K.top + 0.02, K.grill.z, root, 0.01); M(new T3.BoxGeometry(1.34, 0.18, 0.06), chrome, K.grill.x, K.top + 0.09, K.grill.z - 0.46, root, 0.006);
  for (let i = 0; i < 6; i++) M(new T3.BoxGeometry(1.22, 0.003, 0.02), toon('#3a3836'), K.grill.x, K.top + 0.042, K.grill.z - 0.4 + i * 0.16, root, 0);
  K.grillSlots = [[-0.3, -0.2], [0.3, -0.2], [-0.3, 0.22], [0.3, 0.22]].map(([dx, dz]) => ({ x: K.grill.x + dx, z: K.grill.z + dz }));
  K.patBox = { x: K.grill.x - 0.82, z: KZ + 0.05 }; M(new T3.BoxGeometry(0.42, 0.14, 0.34), toon('#dbeafe'), K.patBox.x, K.top + 0.07, K.patBox.z, root, 0.008);
  for (let i = 0; i < 3; i++) M(new T3.CylinderGeometry(0.11, 0.11, 0.03, 14), toon('#e57373'), K.patBox.x - 0.1 + i * 0.1, K.top + 0.15 + i * 0.012, K.patBox.z, root, 0);
  // prep board (centre) + bins along the front edge
  K.board = { x: 0, z: KZ - 0.05 }; M(new T3.BoxGeometry(0.98, 0.04, 0.7), toon('#e9d2a8'), K.board.x, K.top + 0.02, K.board.z, root, 0.01); for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.96, 0.002, 0.004), toon('#d4b98a'), K.board.x, K.top + 0.041, K.board.z - 0.28 + i * 0.14, root, 0);
  K.bins = {}; const binKeys = ['bunB', 'cheese', 'lettuce', 'tomato', 'pickle', 'onion', 'sauce', 'bunT'];
  K.chop = { x: -2.55, z: KZ + 0.72 }; M(new T3.BoxGeometry(0.62, 0.04, 0.44), toon('#c99a62'), K.chop.x, K.top + 0.02, K.chop.z, root, 0.01); for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.6, 0.002, 0.004), toon('#b07f4a'), K.chop.x, K.top + 0.041, K.chop.z - 0.15 + i * 0.1, root, 0);
  K.binPiles = {}; binKeys.forEach((k, i) => { const x = -1.26 + i * 0.36, z = KZ + 0.66; M(new T3.BoxGeometry(0.34, 0.06, 0.4), chrome, x, K.top + 0.03, z, root, 0.008); const inner = new T3.Mesh(new T3.PlaneGeometry(0.29, 0.35), toon('#7d8790')); inner.rotation.x = -Math.PI / 2; inner.position.set(x, K.top + 0.062, z); root.add(inner);
    for (const [dx, dz, w, d] of [[0, 0.19, 0.34, 0.02], [0, -0.19, 0.34, 0.02], [0.16, 0, 0.02, 0.4], [-0.16, 0, 0.02, 0.4]]) M(new T3.BoxGeometry(w, 0.03, d), chrome, x + dx, K.top + 0.075, z + dz, root, 0);
    if (k === 'sauce') { M(new T3.CylinderGeometry(0.055, 0.062, 0.24, 14), toon('#c42d3c'), x, K.top + 0.18, z, root, 0.008, 0.062); M(new T3.CylinderGeometry(0.057, 0.057, 0.07, 14), toon('#f6f3ee'), x, K.top + 0.17, z, root, 0); M(new T3.ConeGeometry(0.035, 0.07, 10), toon('#c42d3c'), x, K.top + 0.335, z, root, 0.006); M(new T3.CylinderGeometry(0.006, 0.006, 0.04, 6), toon('#c42d3c'), x, K.top + 0.385, z, root, 0); }
    else { const n = k === 'bunT' || k === 'bunB' ? 3 : 4; for (let j = 0; j < n; j++) { const pc = makeIng(T3, toon, k, null, ctx.addOutline); const s = k === 'bunT' || k === 'bunB' ? 0.92 : k === 'cheese' ? 0.95 : 1.0; pc.scale.setScalar(s); pc.position.set(x + (j - (n - 1) / 2) * 0.012, K.top + 0.07 + j * (k === 'bunT' ? 0.035 : k === 'bunB' ? 0.03 : 0.014), z - 0.09 + j * 0.06); pc.rotation.set(-0.22, j * 0.7, 0); root.add(pc); (K.binPiles[k] = K.binPiles[k] || []).push(pc); } }
    K.bins[k] = { x, z }; });
  // fryer (right)
  K.fryer = { x: 1.55, z: KZ - 0.1 }; M(new T3.BoxGeometry(0.8, 0.12, 0.7), chrome, K.fryer.x, K.top + 0.06, K.fryer.z, root, 0.01); { const oil = new T3.Mesh(new T3.PlaneGeometry(0.66, 0.56), new T3.MeshToonMaterial({ color: '#d79a2a', gradientMap: ctx.grad })); oil.rotation.x = -Math.PI / 2; oil.position.set(K.fryer.x, K.top + 0.121, K.fryer.z); root.add(oil); K.oil = oil; }
  K.baskets = [-0.17, 0.17].map(dx => ({ x: K.fryer.x + dx, z: K.fryer.z }));
  K.friesBox = { x: K.fryer.x + 0.2, z: KZ + 0.62 }; M(new T3.BoxGeometry(0.3, 0.2, 0.3), toon('#fde68a'), K.friesBox.x, K.top + 0.1, K.friesBox.z, root, 0.008);
  // drink machine (back counter, right)
  K.drinks = { x: 2.45, z: KZ + 0.2 }; M(new T3.BoxGeometry(0.66, 0.5, 0.36), red, K.drinks.x, K.top + 0.25, K.drinks.z, root, 0.02); M(new T3.BoxGeometry(0.68, 0.1, 0.38), white, K.drinks.x, K.top + 0.52, K.drinks.z, root, 0.01);
  K.taps = ['cola', 'orange', 'shake'].map((k, i) => { const x = K.drinks.x + 0.21 - i * 0.21; M(new T3.BoxGeometry(0.17, 0.15, 0.06), toon(SIDES[k].col), x, K.top + 0.38, K.drinks.z - 0.2, root, 0.005); M(new T3.CylinderGeometry(0.075, 0.075, 0.03, 16), toon(SIDES[k].col), x, K.top + 0.585, K.drinks.z - 0.06, root, 0.008, 0.075); M(new T3.CylinderGeometry(0.02, 0.02, 0.07, 8), chrome, x, K.top + 0.27, K.drinks.z - 0.21, root, 0); return { k, x, z: K.drinks.z - 0.3, y: K.top }; });
  // tray + bag stand + register (front right of the counter)
  K.tray = { x: 0.85, z: KZ + 0.2 }; M(new T3.BoxGeometry(0.6, 0.02, 0.42), red, K.tray.x, K.top + 0.01, K.tray.z, root, 0);
  K.bagStand = { x: -2.55, z: KZ - 0.35 }; M(new T3.BoxGeometry(0.34, 0.06, 0.34), white, K.bagStand.x, K.top + 0.03, K.bagStand.z, root, 0.006); for (let i = 0; i < 3; i++) M(new T3.BoxGeometry(0.26, 0.02, 0.2), toon('#fbfbf7'), K.bagStand.x, K.top + 0.07 + i * 0.02, K.bagStand.z, root, 0);
  K.register = { x: 2.3, z: KZ + 1.62 }; M(new T3.BoxGeometry(0.42, 0.3, 0.34), ink, K.register.x, K.top + 0.15, K.register.z - 0.62, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), toon('#22c55e'), K.register.x, K.top + 0.34, K.register.z - 0.79, root, 0);
  // FRONT COUNTER where customers stand (chrome + red stools) — the customer side faces the camera's look
  M(new T3.BoxGeometry(5.6, 1.05, 0.5), red, 0, 0.525, KZ + 1.42, root, 0.03); M(new T3.BoxGeometry(5.7, 0.06, 0.62), chrome, 0, 1.08, KZ + 1.42, root, 0.015); K.pass = { z: KZ + 1.42, y: 1.11 };
  K.spots = [-1.7, 0, 1.7].map(x => ({ x, z: KZ + 2.4 }));
  // dining room: booths, stools, jukebox, menu board, neon
  for (const x of [-4.6, -2.6]) for (const z of [1.2, 3.4]) { const bc = root.children.length; M(new T3.BoxGeometry(1.4, 0.06, 0.9), white, x, 0.78, z, root, 0.01); M(new T3.CylinderGeometry(0.06, 0.06, 0.75, 8), chrome, x, 0.39, z, root, 0); for (const sz of [-0.75, 0.75]) { M(new T3.BoxGeometry(1.4, 0.5, 0.45), red, x, 0.25, z + sz, root, 0.02); M(new T3.BoxGeometry(1.4, 0.8, 0.14), red, x, 0.8, z + sz * 1.25, root, 0.02); } booths.push(...root.children.slice(bc)); }
  for (let i = 0; i < 6; i++) { const x = -2.4 + i * 0.95; M(new T3.CylinderGeometry(0.06, 0.08, 0.7, 8), chrome, x, 0.35, KZ + 2.95, root, 0); M(new T3.CylinderGeometry(0.24, 0.22, 0.12, 14), red, x, 0.74, KZ + 2.95, root, 0.01); }
  { const j = new T3.Group(); j.position.set(5.2, 0, 2.6); j.rotation.y = -Math.PI / 2; root.add(j); M(new T3.BoxGeometry(0.9, 1.5, 0.55), red, 0, 0.75, 0, j, 0.02); M(new T3.CylinderGeometry(0.45, 0.45, 0.55, 18, 1, false, 0, Math.PI), toon('#ffd23a'), 0, 1.5, 0, j, 0.02).rotation.set(Math.PI / 2, 0, Math.PI / 2); }
  const menuT = CTX(1024, 512, c => { c.fillStyle = '#1f2b27'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#ffd23a'; c.font = '900 76px Archivo, Arial'; c.fillText("SIZZLE'S BURGERS", 40, 92); c.fillStyle = '#f2f1e8'; c.font = '700 40px Archivo, Arial'; RECIPES.forEach((r, i) => { const x = 40 + (i % 2) * 500, y = 170 + Math.floor(i / 2) * 64; c.fillText(r.name, x, y); c.fillText(r.price + 'g', x + 380, y); }); c.fillStyle = '#ff9a8a'; c.fillText('FRIES 3g · DRINKS 2g · SHAKES 4g', 40, 470); });
  { const mb = new T3.Mesh(new T3.PlaneGeometry(4.4, 2.2), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(0, 3.0, -D / 2 + 0.07); root.add(mb); cut.push(mb, M(new T3.BoxGeometry(4.6, 2.4, 0.06), wood, 0, 3.0, -D / 2 + 0.01, root, 0.01)); }
  const neonT = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); c.font = '900 86px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff3a3a'; c.shadowBlur = 26; c.strokeStyle = '#ff5a5a'; c.lineWidth = 8; c.strokeText('BURGERS', 256, 66); c.fillStyle = '#fff'; c.fillText('BURGERS', 256, 66); });
  { const n = new T3.Mesh(new T3.PlaneGeometry(3.2, 0.8), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); n.position.set(-4.4, 3.4, 0.6); n.rotation.y = Math.PI / 2; root.add(n); }
  // pendant lamps over the counter
  K.lamps = []; for (const x of [-1.8, 0, 1.8]) { cut.push(M(new T3.CylinderGeometry(0.01, 0.01, 1.1, 4), ink, x, H - 0.55, KZ + 0.6, root, 0)); const sh = M(new T3.ConeGeometry(0.3, 0.3, 16, 1, true), red, x, H - 1.2, KZ + 0.6, root, 0.01); sh.material.side = T3.DoubleSide; K.lamps.push(sh); cut.push(sh); }
  cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K; }
