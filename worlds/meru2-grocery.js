// MERU 2.0 — the ITEM SHOP grows into a GROCERY (Ben, s33: "triple the size, shopping aisles, diner ingredients, soda cans, a refrigerated
// area, the shopping cart, things you'd get on a shopping errand"). Shell f -46..-10 × 60..88 (was -38..-18 × 60..76), door N at x -28.
// Kia's item shop (worlds/meru2-shoprooms.js) stays at the front; round it: PRODUCE (west), BAKERY + SODA (east), FIVE AISLES (back hall),
// the COOLER WALL (back): patties, cheese, milk, shakes, frozen fries, soda. Cart corral by the door + ONE cart you can push (E).
// Every product is a diner ingredient (minigames/meru/diner-room.js: patty, cheese, lettuce, tomato, onion, pickle, sauce, buns, fries,
// cola, orange, shake) or a shopping-errand staple. All static parts merged by material (worlds/meru2-roomkit.js Bin): ~5 draws.
import { makeRoomKit } from './meru2-roomkit.js';
import { funKit } from '../engine/vehicle-fun.js?v=s645';
export const GROCERY = { x0: -56, x1: -11, z0: 60, z1: 108, door: [-28, 60], backX: -41 };   // backX: s34 back door in the back wall, between the freezer islands   // Ben: the Bank's size (45 x 48, turned so Crestview's door stays clear)

export function buildGrocery({ THREE, scene, M, toon, grad, cols, touch }) {
  const K = makeRoomKit({ THREE, touch }), b = K.Bin(), G = new THREE.Group(); scene.add(G);
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const rnd = K.rnd, SP = touch ? 1.8 : 1.2, ROWS = 1, spots = [], R = GROCERY, CXR = (R.x0 + R.x1) / 2, CZR = (R.z0 + R.z1) / 2;
  const CHROME = '#cbd5e1', WHITE = '#f3f2f2', SHELF = '#d8d2c8', TEAL = '#24504d', RED = '#c42d3c';
  // floor: big pale tiles over the whole store (Kia's planks sit on top at the front)
  { const t = K.CT(128, 128, (g, w) => { g.fillStyle = '#e9e5dc'; g.fillRect(0, 0, w, w); g.fillStyle = '#d9d3c7'; g.fillRect(0, 0, w / 2, w / 2); g.fillRect(w / 2, w / 2, w / 2, w / 2); g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, w); });
    K.flat(G, t, R.x1 - R.x0 - 0.8, R.z1 - R.z0 - 0.8, CXR, 0.04, CZR, 2.4); }

  // ---------- products (one unit at x, y, z facing yaw ry) ----------
  const W = { cola: 0.09, orange: 0.09, ketchup: 0.11, mustard: 0.11, mayo: 0.12, pickle: 0.14, bun: 0.34, chips: 0.26, can: 0.11, flour: 0.3, oil: 0.12,
    patty: 0.32, cheese: 0.24, milk: 0.13, shake: 0.12, fries: 0.26, six: 0.3, cereal: 0.24 };
  function unit(type, x, y, z, ry) {
    if (type === 'cola' || type === 'orange') { const c = type === 'cola' ? '#5a2a1a' : '#ff8a1a'; b.cyl('gls', c, 0.035, 0.12, x, y + 0.06, z, 8); b.cyl('gls', '#c9ced3', 0.033, 0.012, x, y + 0.125, z, 8); }
    else if (type === 'six') { for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) b.cyl('gls', (i + j) % 2 ? '#5a2a1a' : '#ec3013', 0.034, 0.12, x + (i - 1) * 0.075 * Math.cos(ry) + (j - 0.5) * 0.075 * Math.sin(ry), y + 0.06, z - (i - 1) * 0.075 * Math.sin(ry) + (j - 0.5) * 0.075 * Math.cos(ry), 7);
      b.box('mat', '#f3f2f2', 0.24, 0.03, 0.16, x, y + 0.13, z, ry); }
    else if (type === 'ketchup' || type === 'mustard' || type === 'mayo') { const c = { ketchup: '#c42d3c', mustard: '#f2c21b', mayo: '#f6f0dc' }[type]; b.cyl('gls', c, 0.04, 0.19, x, y + 0.095, z, 8); b.cyl('mat', type === 'mayo' ? '#2e8bd8' : WHITE, 0.022, 0.05, x, y + 0.215, z, 6); }
    else if (type === 'pickle') { b.cyl('glass', '#5f8f3a', 0.055, 0.17, x, y + 0.085, z, 10); b.cyl('mat', '#3f6a2c', 0.045, 0.14, x, y + 0.075, z, 8); b.cyl('gls', '#c9a227', 0.057, 0.03, x, y + 0.185, z, 10); }
    else if (type === 'bun') { b.box('mat', '#d9a35a', 0.3, 0.12, 0.22, x, y + 0.06, z, ry); b.box('glass', '#f3f2f2', 0.32, 0.14, 0.24, x, y + 0.07, z, ry); b.box('mat', RED, 0.06, 0.02, 0.24, x, y + 0.13, z, ry); }
    else if (type === 'chips') { const c = ['#ffd23a', '#ec3013', '#2e8bd8', '#16a34a'][Math.abs(Math.round(x * 3 + y * 5)) % 4]; b.box('gls', c, 0.22, 0.3, 0.08, x, y + 0.15, z, ry); }
    else if (type === 'can') { const c = ['#c42d3c', '#16a34a', '#e0a020', '#2e4a6b'][Math.abs(Math.round(x * 7 + y * 3)) % 4]; b.cyl('gls', '#b8bec4', 0.045, 0.11, x, y + 0.055, z, 8); b.cyl('mat', c, 0.046, 0.07, x, y + 0.055, z, 8); }
    else if (type === 'cereal') { const c = ['#ffd23a', '#ec3013', '#2e8bd8', '#f472b6'][Math.abs(Math.round(x * 5 + y * 7)) % 4]; b.box('mat', c, 0.2, 0.34, 0.08, x, y + 0.17, z, ry); b.box('mat', '#f3f2f2', 0.12, 0.1, 0.082, x, y + 0.22, z, ry); }
    else if (type === 'flour') { b.box('mat', '#f6f0dc', 0.26, 0.36, 0.15, x, y + 0.18, z, ry); b.box('mat', '#2e8bd8', 0.265, 0.08, 0.155, x, y + 0.24, z, ry); }
    else if (type === 'oil') { b.cyl('glass', '#e0b030', 0.045, 0.26, x, y + 0.13, z, 8); b.cyl('mat', '#e0b030', 0.04, 0.2, x, y + 0.1, z, 8); b.cyl('mat', '#16a34a', 0.02, 0.04, x, y + 0.28, z, 6); }
    else if (type === 'patty') { b.box('mat', WHITE, 0.3, 0.04, 0.22, x, y + 0.02, z, ry); b.box('mat', '#b5473f', 0.24, 0.03, 0.17, x, y + 0.05, z, ry); b.box('glass', '#ffffff', 0.3, 0.06, 0.22, x, y + 0.04, z, ry); }
    else if (type === 'cheese') { b.box('mat', '#f2c21b', 0.2, 0.09, 0.12, x, y + 0.045, z, ry); b.box('mat', RED, 0.205, 0.02, 0.125, x, y + 0.08, z, ry); }
    else if (type === 'milk') { b.box('mat', WHITE, 0.1, 0.22, 0.1, x, y + 0.11, z, ry); b.box('mat', '#2e8bd8', 0.102, 0.05, 0.102, x, y + 0.2, z, ry); }
    else if (type === 'shake') { b.cyl('mat', '#f9a8d4', 0.045, 0.16, x, y + 0.08, z, 8, 0, 0, 1.3); b.cyl('mat', WHITE, 0.06, 0.03, x, y + 0.17, z, 8); }
    else if (type === 'fries') { b.box('mat', '#ec3013', 0.22, 0.3, 0.07, x, y + 0.15, z, ry); b.box('mat', '#ffd23a', 0.16, 0.08, 0.072, x, y + 0.22, z, ry); }
  }
  // a run of one product along a shelf front a -> b at height y, facing (nx, nz); stock goes back
  function run(type, ax, az, bx, bz, y, nx, nz, rows = ROWS) {
    const L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L, ry = Math.atan2(nx, nz), w = W[type] * SP;
    for (let s = w / 2; s < L - w / 2 + 1e-3; s += w) for (let r = 0; r < rows; r++) { if (rnd() < 0.06) continue; const v = 0.09 + r * 0.17; unit(type, ax + tx * s - nx * v, y, az + tz * s - nz * v, ry); } }
  // a double-sided gondola running north-south: centre x, z0..z1, 4 shelves, product list per side + an end-cap
  function gondola(x, z0, z1, west, east, label) {
    const L = z1 - z0, zc = (z0 + z1) / 2, SY = [0.12, 0.62, 1.12, 1.62];
    b.box('mat', '#2a2a30', 1.1, 0.12, L, x, 0.06, zc); b.box('mat', WHITE, 0.06, 2.0, L, x, 1.05, zc); b.box('mat', TEAL, 1.14, 0.08, L + 0.04, x, 2.08, zc);
    for (const ez of [z0, z1]) b.box('mat', TEAL, 1.1, 2.1, 0.05, x, 1.05, ez);
    for (const [s, list] of [[-1, west], [1, east]]) SY.forEach((y, j) => { if (j) b.box('mat', SHELF, 0.48, 0.035, L - 0.08, x + s * 0.28, y - 0.02, zc); b.box('mat', WHITE, 0.012, 0.035, L - 0.08, x + s * 0.52, y - 0.01, zc);
      run(list[j % list.length], x + s * 0.52, z0 + 0.06, x + s * 0.52, z1 - 0.06, y, s, 0); });
    box(x - 0.6, x + 0.6, z0 - 0.05, z1 + 0.05);
    // the aisle sign hanging over the gondola (both faces)
    const t = K.CT(512, 160, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 18, h); g.fillStyle = '#f3f2f2'; g.font = '900 64px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText(label, 44, h / 2 + 4); });
    for (const ry of [Math.PI / 2, -Math.PI / 2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.8), new THREE.MeshBasicMaterial({ map: t })); m.position.set(x + (ry > 0 ? 0.02 : -0.02), 3.5, zc); m.rotation.y = ry; G.add(m); }
    b.box('mat', '#201e1d', 0.02, 1.6, 0.02, x, 4.7, zc - 1); b.box('mat', '#201e1d', 0.02, 1.6, 0.02, x, 4.7, zc + 1); }

  // ---------- SEVEN AISLES (back hall, z 79.5..91.5) ----------
  const GZ0 = 79.5, GZ1 = 94.5;
  gondola(-52, GZ0, GZ1, ['bun', 'bun', 'bun', 'bun'], ['bun', 'flour', 'bun', 'bun'], '1 · BUNS + BREAD');
  gondola(-45.5, GZ0, GZ1, ['ketchup', 'mustard', 'mayo', 'ketchup'], ['mustard', 'ketchup', 'mayo', 'mustard'], '2 · SAUCES');
  gondola(-39, GZ0, GZ1, ['pickle', 'pickle', 'can', 'can'], ['can', 'pickle', 'can', 'pickle'], '3 · PICKLES + CANS');
  gondola(-32.5, GZ0, GZ1, ['chips', 'chips', 'chips', 'chips'], ['chips', 'can', 'chips', 'chips'], '4 · SNACKS');
  gondola(-26, GZ0, GZ1, ['six', 'cola', 'orange', 'six'], ['orange', 'six', 'cola', 'cola'], '5 · SODA');
  gondola(-19.5, GZ0, GZ1, ['flour', 'oil', 'flour', 'oil'], ['oil', 'flour', 'oil', 'flour'], '6 · BAKING + OIL');
  gondola(-13.2, GZ0, GZ1, ['cereal', 'cereal', 'cereal', 'cereal'], ['cereal', 'cereal', 'cereal', 'cereal'], '7 · BREAKFAST');
  // FREEZER ISLANDS (z 95.4..97.6): open chest freezers under glass lids, frozen fries + patties
  for (const [x0, x1] of [[-52.5, -43.5], [-38.5, -29.5], [-24.5, -15.5]]) { const xc = (x0 + x1) / 2, w = x1 - x0, zc = 100.5;
    b.box('gls', '#e6eaee', w, 0.85, 2.2, xc, 0.425, zc); b.box('glo', '#dff3ff', w - 0.2, 0.02, 2.0, xc, 0.78, zc); b.box('gls', '#2e8bd8', w + 0.04, 0.1, 2.24, xc, 0.08, zc);
    run('fries', x0 + 0.15, zc - 0.45, x1 - 0.15, zc - 0.45, 0.62, 0, -1, 1); run('patty', x0 + 0.15, zc + 0.55, x1 - 0.15, zc + 0.55, 0.62, 0, 1, 1);
    b.box('glass', '#cfe9ff', w, 0.02, 2.2, xc, 0.95, zc); b.box('gls', '#cbd5e1', w, 0.04, 0.04, xc, 0.96, zc); box(x0 - 0.05, x1 + 0.05, zc - 1.15, zc + 1.15); }

  // ---------- THE COOLER WALL (back wall, z 86.7..87.6): glass doors, lit inside, frost band, COLD sign ----------
  { const z = R.z1 - 0.85, D = 0.9, H = 2.5, SEC = [['patty', 'MEAT'], ['cheese', 'CHEESE'], ['milk', 'DAIRY'], ['shake', 'DESSERTS'], ['cola', 'SODA'], ['fries', 'FROZEN']];
    // s34: the BACK DOOR (meru2-layout BACK_DOORS.itemshop, x -41) splits the cooler wall: 2 sections west of it, 4 east, lined up with the freezer gap
    const BD = GROCERY.backX, spans = BD == null ? [[R.x0 + 0.4, R.x1 - 0.4, 6]] : [[R.x0 + 0.4, BD - 2.5, 2], [BD + 2.5, R.x1 - 0.4, 4]], sections = [];
    { let k = 0; for (const [a0, a1, n] of spans) { const w = (a1 - a0) / n; for (let i = 0; i < n; i++, k++) sections.push([a0 + i * w + 0.1, a0 + (i + 1) * w - 0.1, SEC[k][0], SEC[k][1]]); } }
    for (const [x0, x1, type, label] of sections) { const xc = (x0 + x1) / 2, w = x1 - x0;
      b.box('gls', '#e6eaee', w, 0.3, D, xc, 0.15, z); b.box('gls', '#e6eaee', w, 0.4, D, xc, H + 0.2, z); b.box('glo', '#eaf6ff', w - 0.1, H - 0.3, 0.04, xc, H / 2 + 0.15, z + D / 2 - 0.06);
      for (const sx of [x0, x1]) b.box('gls', CHROME, 0.08, H, D, sx, H / 2 + 0.15, z);
      const SY = [0.32, 0.86, 1.4, 1.94], alt = { patty: ['patty', 'patty', 'patty', 'patty'], cheese: ['cheese', 'cheese', 'cheese', 'cheese'], milk: ['milk', 'shake', 'milk', 'shake'], cola: ['six', 'cola', 'orange', 'six'], fries: ['fries', 'fries', 'fries', 'fries'], shake: ['shake', 'shake', 'milk', 'shake'] }[type];
      SY.forEach((y, j) => { b.box('gls', '#c9ced3', w - 0.16, 0.03, D - 0.15, xc, y - 0.02, z + 0.05); run(alt[j], x0 + 0.12, z - D / 2 + 0.12, x1 - 0.12, z - D / 2 + 0.12, y, 0, -1); });
      const nd = Math.max(2, Math.round(w / 1.2)); for (let i = 0; i < nd; i++) { const dx = x0 + (i + 0.5) * w / nd; b.box('glass', '#cfe9ff', w / nd - 0.06, H - 0.1, 0.03, dx, H / 2 + 0.15, z - D / 2 - 0.02); b.box('gls', CHROME, 0.04, 0.6, 0.05, dx + w / nd / 2 - 0.15, 1.35, z - D / 2 - 0.06); }
      b.box('glo', '#7fd3ff', w, 0.08, 0.02, xc, H + 0.02, z - D / 2 - 0.03);
      const t = K.CT(512, 128, (g, cw, ch) => { g.fillStyle = '#0f2a44'; g.fillRect(0, 0, cw, ch); g.fillStyle = '#7fd3ff'; g.fillRect(0, ch - 10, cw, 10); g.fillStyle = '#f3f2f2'; g.font = '900 72px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText(label, 26, ch / 2 - 2); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(Math.min(3.4, w - 0.6), 0.8), new THREE.MeshBasicMaterial({ map: t })); m.position.set(xc, 3.35, z - D / 2 + 0.02); G.add(m); }
    for (const [a0, a1] of spans) box(a0, a1, z - D / 2 - 0.1, z + D / 2 + 0.1);
    // cold floor strip + a frosty glow in front of the coolers
    const ft = K.CT(64, 64, (g, w) => { const q = g.createLinearGradient(0, 0, 0, w); q.addColorStop(0, 'rgba(127,211,255,0.35)'); q.addColorStop(1, 'rgba(127,211,255,0)'); g.fillStyle = q; g.fillRect(0, 0, w, w); });
    const fm = new THREE.Mesh(new THREE.PlaneGeometry(R.x1 - R.x0 - 1.2, 2.2), new THREE.MeshBasicMaterial({ map: ft, transparent: true, depthWrite: false })); fm.rotation.x = -Math.PI / 2; fm.rotation.z = Math.PI; fm.position.set(CXR, 0.06, z - D / 2 - 1.1); G.add(fm); }

  // ---------- PRODUCE (west strip, x -45.5..-38): tilted crate tables + a pickle barrel ----------
  { const P = [['#e0442a', 0.09], ['#4fae3a', 0.14], ['#d9b46a', 0.08], ['#a0703e', 0.09], ['#ffd23a', 0.08], ['#7a2a5a', 0.08]];   // tomato, lettuce, onion, potato, lemon, red onion
    for (const [px, z, k0] of [[-54.4, 68, 0], [-54.4, 72, 2], [-54.4, 76, 4], [-48, 69, 1], [-48, 74, 3], [-42.4, 69, 4], [-42.4, 74, 0]]) {   // s76: +1.5 m south (room for the checkout lanes + market jobs)
      b.box('mat', '#6b4a32', 1.4, 0.8, 3.4, px, 0.4, z); b.box('mat', '#3d2a1c', 1.5, 0.06, 3.5, px, 0.82, z);
      for (const [dz, k] of [[-0.85, k0], [0.85, k0 + 1]]) { const [col, r] = P[k % P.length]; b.box('mat', '#9a7550', 1.2, 0.18, 1.5, px, 0.95, z + dz, 0, px < -53 ? -0.25 : 0);
        for (let i = 0; i < (touch ? 10 : 22); i++) b.sph('mat', col, r, px + (rnd() - 0.5) * 1.0, 1.08 + rnd() * 0.08, z + dz + (rnd() - 0.5) * 1.3, k === 1 ? 0.8 : 1, 6); }
      box(px - 0.8, px + 0.8, z - 1.75, z + 1.75); }
    const t = K.CT(512, 128, (g, w, h) => { g.fillStyle = '#2f6b3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3f2f2'; g.font = '900 70px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('FRESH PRODUCE', 24, h / 2 + 2); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshBasicMaterial({ map: t })); m.position.set(R.x0 + 0.45, 3.0, 72); m.rotation.y = Math.PI / 2; G.add(m);
    b.cyl('mat', '#7a5236', 0.42, 0.9, -41.5, 0.45, 77.1, 14); b.tor('mat', '#201e1d', 0.43, 0.04, -41.5, 0.25, 77.1, Math.PI / 2); b.tor('mat', '#201e1d', 0.43, 0.04, -41.5, 0.7, 77.1, Math.PI / 2);
    for (let i = 0; i < 7; i++) b.sph('mat', '#5f8f3a', 0.07, -41.5 + (rnd() - 0.5) * 0.5, 0.93, 77.1 + (rnd() - 0.5) * 0.5, 2.2, 6); ring(-41.5, 77.1, 0.5); }

  // ---------- BAKERY + SODA (east strip, x -18..-10.5): bun racks, a soda can pyramid, a sauce end-cap ----------
  { for (const z of [64, 67.4]) { const x = -12.2; for (const sx of [-0.4, 0.4]) for (const sz of [-1.4, 1.4]) b.box('gls', CHROME, 0.04, 2.0, 0.04, x + sx, 1.0, z + sz);
      for (let s = 0; s < 5; s++) { const y = 0.2 + s * 0.42; b.box('gls', '#b3b9bf', 0.84, 0.025, 2.84, x, y, z); run('bun', x - 0.38, z - 1.36, x - 0.38, z + 1.36, y + 0.02, -1, 0, 1); }
      box(x - 0.45, x + 0.45, z - 1.45, z + 1.45); }
    const t = K.CT(512, 128, (g, w, h) => { g.fillStyle = '#7a4a24'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffe2a8'; g.font = '900 72px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('BAKERY', 24, h / 2 + 2); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 0.75), new THREE.MeshBasicMaterial({ map: t })); m.position.set(R.x1 - 0.45, 3.0, 65.7); m.rotation.y = -Math.PI / 2; G.add(m);
    // soda pyramid: cans stacked in a stepped square on a red plinth, a SODA price card
    { const cx = -15.2, cz = 72.6; b.box('mat', RED, 1.6, 0.3, 1.6, cx, 0.15, cz); const n = touch ? 5 : 7, st = 0.2;
      for (let lv = 0; lv < n; lv++) { const k = n - lv; for (let i = 0; i < k; i++) for (let j = 0; j < k; j++) b.cyl('gls', (i + j + lv) % 3 === 0 ? '#ff8a1a' : '#5a2a1a', 0.07, 0.13, cx + (i - (k - 1) / 2) * st, 0.3 + 0.065 + lv * 0.13, cz + (j - (k - 1) / 2) * st, 7); }
      b.box('mat', '#201e1d', 0.02, 1.0, 0.02, cx + 0.9, 0.8, cz); const c = K.CT(256, 160, (g, w, h) => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.font = '900 54px Archivo, Arial'; g.fillText('SODA', 20, 66); g.font = '800 40px Archivo, Arial'; g.fillText('2 GOLD', 20, 128); });
      const card = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.44), new THREE.MeshBasicMaterial({ map: c })); card.position.set(cx + 0.9, 1.35, cz); card.rotation.y = -Math.PI / 2; G.add(card); ring(cx, cz, 1.2); }
    // sauce end-cap by the soda (a short gondola)
    { const x = -12.4, z = 75.4; b.box('mat', TEAL, 0.9, 1.6, 1.8, x, 0.8, z); for (const y of [0.4, 0.85, 1.3]) { b.box('mat', SHELF, 0.4, 0.03, 1.7, x - 0.62, y - 0.02, z); run(['ketchup', 'mustard', 'mayo'][Math.round(y * 2) % 3], x - 0.8, z - 0.82, x - 0.8, z + 0.82, y, -1, 0, 1); }
      box(x - 0.85, x + 0.45, z - 0.95, z + 0.95); } }

  // ---------- the back of Kia's wall unit: a GROCERY header, and strip lights over the new floor ----------
  { const t = K.CT(1024, 192, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 24, h); g.fillStyle = '#f3f2f2'; g.font = '900 104px Archivo, Arial'; g.textBaseline = 'middle'; g.fillText('MERU MARKET · GROCERY', 60, h / 2 + 6); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.7), new THREE.MeshBasicMaterial({ map: t })); m.position.set(-28, 3.0, 75.62); m.rotation.y = 0; G.add(m);
    for (const x of [-52, -45.5, -39, -32.5, -26, -19.5]) for (const z of [78, 82, 86, 90, 94, 98, 102, 105]) { b.box('mat', '#201e1d', 2.2, 0.05, 0.16, x + 3.5, 5.6, z); b.box('glo', '#fff6dc', 2.1, 0.02, 0.1, x + 3.5, 5.57, z); }
    for (const z of [63, 67, 71, 75, 79, 84, 89, 94, 99, 104]) for (const x of [-53.5, -14]) { b.box('mat', '#201e1d', 0.16, 0.05, 2.2, x, 5.6, z); b.box('glo', '#fff6dc', 0.1, 0.02, 2.1, x, 5.57, z); } }

  // ---------- the cart corral by the door (three nested carts, from the Vehicle Workshop model) + ONE cart to push ----------
  const FK = funKit({ THREE, M, toon, grad, scene });
  // s76: the corral moved OUTSIDE (meru2-grocery-jobs.js cart lot); the one pushable cart stays by the door
  const cart = FK.make('cart'), CV = cart.userData.V; cart.position.set(-40.4, 0, 62.6); cart.rotation.y = Math.PI / 2; scene.add(cart);
  if (CV && CV.cargo) CV.cargo.forEach(m => { m.visible = false; });
  let Pref = null, pushing = false, cy = Math.PI / 2, roll = 0, head = 0, lpx = null, lpz = null;
  const cs = { key: 'groceryCart', x: -40.4, z: 62.6, r: 1.5, get prompt() { return pushing ? 'LET GO OF THE CART' : 'PUSH A SHOPPING CART'; },
    use(P) { Pref = P; pushing = !pushing; if (pushing) { cy = cart.rotation.y; head = Math.atan2(cart.position.x - P.x, cart.position.z - P.z); lpx = P.x; lpz = P.z; } } };
  spots.push(cs); window.__m2grocery = { spot: cs, cart, state: () => ({ pushing, hasP: !!Pref, cart: [cart.position.x, cart.position.z] }) };   // test hook

  b.build(G);
  function tick(dt, t, cam) {
    if (cam) G.visible = Math.hypot(cam.x - CXR, cam.z - CZR) < (touch ? 65 : 130);
    if (pushing && Pref) { const P = Pref, mdx = P.x - (lpx ?? P.x), mdz = P.z - (lpz ?? P.z); lpx = P.x; lpz = P.z; if (Math.hypot(mdx, mdz) > 0.004) { let d2 = Math.atan2(mdx, mdz) - head; d2 = Math.atan2(Math.sin(d2), Math.cos(d2)); head += d2 * Math.min(1, dt * 8); }   // the cart goes where you walk
      const fx = Math.sin(head), fz = Math.cos(head), tx = P.x + fx * 1.05, tz = P.z + fz * 1.05;
      if (Math.hypot(cart.position.x - P.x, cart.position.z - P.z) > 3.5 || P.car || P.boat || P.skate || P.tank) pushing = false;
      else { const ox = cart.position.x, oz = cart.position.z; cart.position.set(tx, (P.y || 0), tz); let d = head - cy; d = Math.atan2(Math.sin(d), Math.cos(d)); cy += d * Math.min(1, dt * 10); cart.rotation.y = cy;
        roll += Math.hypot(tx - ox, tz - oz) / 0.065; if (CV && CV.casters) CV.casters.forEach(c => { c.children[0] && (c.children[0].rotation.x = roll); c.rotation.y = d * 2; }); } }
    cs.x = cart.position.x; cs.z = cart.position.z; }
  return { spots, tick, group: G, cart };
}
