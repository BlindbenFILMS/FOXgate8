import { makeRoomKit } from './meru2-roomkit.js';
// MERU 2.0 — step 10 ART PASS 6a: the three Town Square shop interiors, dressed for real.
// ITEM SHOP [meruItemshop] (Kia) · ARMORY [meruArmory] (Bram) · FORTUNE TELLER [meruFortune] (Ora).
// Everything static in a room is merged by material (matte / glossy / glass / glow) = 4-5 draws per room plus a textured floor + sign.
// Rooms hide beyond 120 m (60 m on phones). Goods match the shop-window pictures: Item Shop shelves + bottles, Armory shields + blades.
export function buildShopRooms({ THREE, scene, kit, cols, KEEPERS, touch }) {
  const { CT, Bin, flat, wallPlane, planks, slate, signTex, pendant, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const SP = touch ? 1.35 : 1;   // goods spacing on phones
  const rugTex = () => CT(512, 512, (g, w) => { const c = w / 2, R = (r, col) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); };
    R(254, '#5e1f2c'); R(240, '#c0995c'); R(232, '#7a2a3a'); R(200, '#c0995c'); R(194, '#26306b');
    g.fillStyle = '#c0995c'; for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; g.beginPath(); g.arc(c + Math.cos(a) * 216, c + Math.sin(a) * 216, 6, 0, 7); g.fill(); }
    g.save(); g.translate(c, c); g.fillStyle = '#7a2a3a'; for (let i = 0; i < 8; i++) { g.rotate(Math.PI / 4); g.beginPath(); g.moveTo(0, -170); g.lineTo(26, -60); g.lineTo(-26, -60); g.closePath(); g.fill(); } g.restore();
    R(96, '#c0995c'); R(86, '#5b3f7a'); R(40, '#c0995c'); R(30, '#7a2a3a');
    g.globalAlpha = 0.08; for (let i = 0; i < 2500; i++) { g.fillStyle = rnd() < 0.5 ? '#000' : '#fff'; g.fillRect(rnd() * w, rnd() * w, 2, 2); } g.globalAlpha = 1;
    g.globalCompositeOperation = 'destination-in'; R(254, '#000'); });
  const tapTex = () => CT(256, 200, (g, w, h) => { g.fillStyle = '#3a2440'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c0995c'; g.lineWidth = 6; g.strokeRect(8, 8, w - 16, h - 30); g.lineWidth = 2; g.strokeRect(16, 16, w - 32, h - 46);
    const cx = w / 2, cy = 88; g.fillStyle = '#c0995c'; g.beginPath(); g.moveTo(cx - 54, cy); g.quadraticCurveTo(cx, cy - 40, cx + 54, cy); g.quadraticCurveTo(cx, cy + 40, cx - 54, cy); g.fill();
    g.fillStyle = '#3a2440'; g.beginPath(); g.arc(cx, cy, 17, 0, 7); g.fill(); g.fillStyle = '#9fd6ff'; g.beginPath(); g.arc(cx, cy, 9, 0, 7); g.fill();
    g.fillStyle = '#e6d8b0'; g.beginPath(); g.arc(46, 52, 18, 0, 7); g.fill(); g.fillStyle = '#3a2440'; g.beginPath(); g.arc(54, 46, 16, 0, 7); g.fill();
    g.fillStyle = '#e6d8b0'; for (let i = 0; i < 22; i++) { const x = 26 + rnd() * (w - 52), y = 24 + rnd() * (h - 70); if (Math.hypot(x - cx, y - cy) < 62) continue; const s = 1 + rnd() * 2.5; g.fillRect(x - s, y, s * 2 + 1, 1); g.fillRect(x, y - s, 1, s * 2 + 1); }
    g.fillStyle = '#c0995c'; for (let x = 10; x < w - 10; x += 6) g.fillRect(x, h - 22, 2, 14 + (x % 12 ? 0 : 4)); });

  // ---------- goods (shop shelves) ----------
  // run of one product along a shelf front line a -> b at shelf top y, facing n (unit, outward); stock goes back (-n)
  function goods(b, type, ax, az, bx, bz, y, nx, nz, rows = 2) {
    const L = Math.hypot(bx - ax, bz - az), tx = (bx - ax) / L, tz = (bz - az) / L, ry = -Math.atan2(tz, tx);
    const W = { bat: 0.17, cell: 0.16, choc: 0.36, amber: 0.2, kit: 0.32, pot: 0.15, carton: 0.56 }[type] * SP;
    const POT = ['#4ade80', '#38bdf8', '#f472b6', '#facc15', '#a855f7'], pc = POT[Math.abs(Math.round(y * 7 + ax)) % 5];
    for (let s = W / 2; s < L - W / 2 + 0.001; s += W) for (let r = 0; r < (touch ? 1 : rows); r++) { if (rnd() < 0.08) continue;
      const v = 0.1 + r * 0.2, x = ax + tx * s - nx * v, z = az + tz * s - nz * v;
      if (type === 'bat') { b.cyl('gls', '#2f6fd6', 0.06, 0.2, x, y + 0.1, z, 7); b.cyl('mat', '#d9dde2', 0.061, 0.035, x, y + 0.215, z, 7); b.cyl('mat', '#ffd23a', 0.062, 0.025, x, y + 0.08, z, 7); }
      else if (type === 'cell') { b.cyl('mat', '#3f4854', 0.06, 0.04, x, y + 0.02, z, 6); b.cyl('glo', '#7cff9b', 0.04, 0.17, x, y + 0.125, z, 6); b.cyl('mat', '#3f4854', 0.06, 0.04, x, y + 0.23, z, 6); }
      else if (type === 'choc') { if (r) continue; const n = 2 + (rnd() * 2 | 0); for (let k = 0; k < n; k++) { b.box('mat', k % 2 ? '#8f2632' : '#a8323e', 0.32, 0.07, 0.24, x, y + 0.035 + k * 0.072, z, ry); b.box('gls', '#ffc64a', 0.33, 0.072, 0.035, x, y + 0.035 + k * 0.072, z, ry); } }
      else if (type === 'amber') { b.cyl('gls', '#e08a1e', 0.075, 0.15, x, y + 0.075, z, 8); b.cyl('mat', '#3d2a1c', 0.08, 0.04, x, y + 0.17, z, 8); }
      else if (type === 'kit') { if (r) continue; b.box('mat', '#f3f2f2', 0.28, 0.2, 0.2, x, y + 0.1, z, ry); const fx = x + nx * 0.101, fz = z + nz * 0.101; b.box('mat', '#ec3013', 0.14, 0.04, 0.01, fx, y + 0.1, fz, ry); b.box('mat', '#ec3013', 0.04, 0.14, 0.01, fx, y + 0.1, fz, ry); }
      else if (type === 'pot') { b.cyl('gls', pc, 0.05, 0.15, x, y + 0.075, z, 7); b.cyl('gls', pc, 0.02, 0.06, x, y + 0.18, z, 5); b.cyl('mat', '#b08b5e', 0.022, 0.03, x, y + 0.225, z, 5); }
      else if (type === 'carton') { if (r) continue; const hh = 0.32 + rnd() * 0.12; b.box('mat', rnd() < 0.5 ? '#c9a878' : '#b8955f', 0.5, hh, 0.4, x, y + hh / 2, z + 0.1 * -nz, ry); b.box('mat', '#e6d8b0', 0.51, 0.05, 0.12, x, y + hh - 0.02, z, ry); } } }

  const rooms = [], spots = [], npcs = [];
  const fox = (key, opt, x, z, ry) => { const f = kit.makeFox({ key, ...opt }); f.position.set(x, 0, z); f.rotation.y = ry; scene.add(f); ring(x, z, 0.5); npcs.push(f); return f; };
  const room = (x, z) => { const G = new THREE.Group(); scene.add(G); rooms.push({ G, x, z }); return G; };

  // ================= ITEM SHOP (Kia): f -38..-18 × 60..76, door N at x -28 =================
  { const cx = -28, G = room(cx, 68), b = Bin(), K = KEEPERS.find(q => q.key === 'kia') || {};
    flat(G, planks('#b98c5a', '#5a3a22'), 19.2, 15.2, cx, 0.05, 68, 2);
    // back wall unit: 8 bays × 5 shelves, teal back, walnut frame, price strips, cartons on top
    const WU = 18.8, X0 = cx - WU / 2, SY = [0.2, 0.95, 1.7, 2.45, 3.2], TY = ['pot', 'bat', 'choc', 'kit', 'amber', 'cell'];
    b.box('mat', '#24504d', WU, 3.9, 0.06, cx, 1.95, 75.56); b.box('mat', '#2a1d14', WU, 0.2, 0.5, cx, 0.1, 75.3); b.box('mat', '#3d2a1c', WU + 0.2, 0.24, 0.62, cx, 4.0, 75.25);
    for (let i = 0; i <= 8; i++) b.box('mat', '#3d2a1c', 0.08, 3.9, 0.5, X0 + i * WU / 8, 1.95, 75.3);
    for (let j = 0; j < 5; j++) { if (j) b.box('mat', '#6b4a32', WU, 0.05, 0.48, cx, SY[j] - 0.025, 75.3); b.box('mat', '#f3f2f2', WU, 0.035, 0.012, cx, SY[j] - 0.02, 75.055);
      for (let i = 0; i < 8; i++) goods(b, j === 4 ? 'carton' : TY[(i * 2 + j * 3) % 6], X0 + i * WU / 8 + 0.1, 75.06, X0 + (i + 1) * WU / 8 - 0.1, 75.06, SY[j], 0, -1); }
    wallPlane(G, signTex('ITEM SHOP'), 4.4, 0.82, cx, 4.65, 75.5, 0, true);
    // counter: walnut body, inset panels, pale stone top, glass case with cells + amber, register, bell, bags
    b.box('mat', '#6b4a32', 8, 1.0, 0.9, cx, 0.5, 70.1); b.box('mat', '#2a1d14', 8.06, 0.1, 0.94, cx, 0.05, 70.1);
    for (let k = 0; k < 4; k++) b.box('mat', '#57391f', 1.7, 0.6, 0.03, cx - 3 + k * 2, 0.55, 69.64);
    b.box('gls', '#e6e1d3', 8.2, 0.06, 1.05, cx, 1.03, 70.1);
    b.box('mat', '#3d2a1c', 2.0, 0.05, 0.62, cx - 2.4, 1.085, 70.1); b.box('glass', '#cfe9ff', 2.0, 0.42, 0.62, cx - 2.4, 1.32, 70.1);
    goods(b, 'cell', cx - 3.35, 69.86, cx - 2.45, 69.86, 1.11, 0, -1, 2); goods(b, 'amber', cx - 2.35, 69.86, cx - 1.45, 69.86, 1.11, 0, -1, 2);
    b.box('mat', '#201e1d', 0.5, 0.16, 0.42, cx + 1.6, 1.14, 70.25); b.box('mat', '#3d3b3a', 0.42, 0.04, 0.26, cx + 1.6, 1.24, 70.2, 0, -0.3);
    b.box('mat', '#201e1d', 0.04, 0.26, 0.04, cx + 1.6, 1.35, 70.42); b.box('mat', '#201e1d', 0.34, 0.18, 0.04, cx + 1.6, 1.52, 70.4); b.box('glo', '#7cffd0', 0.3, 0.14, 0.01, cx + 1.6, 1.52, 70.375);
    b.sph('gls', '#ffc64a', 0.07, cx + 0.5, 1.07, 69.85, 0.7); for (let k = 0; k < 3; k++) b.box('mat', '#c9a878', 0.26, 0.34, 0.16, cx + 2.7 + k * 0.32, 1.23, 70.35, rnd() * 0.3 - 0.15);
    box(cx - 4.1, cx + 4.1, 69.55, 70.65);
    // two double-sided gondolas on the sales floor
    for (const gx of [cx - 6.6, cx + 6.6]) { const gz = 65.3, GL = 4.6;
      b.box('mat', '#2a1d14', 1.0, 0.16, GL, gx, 0.08, gz); b.box('mat', '#e6e1d3', 0.06, 1.55, GL, gx, 0.85, gz); b.box('mat', '#3d2a1c', 1.04, 0.06, GL + 0.04, gx, 1.64, gz);
      for (const ez of [gz - GL / 2, gz + GL / 2]) b.box('mat', '#24504d', 1.0, 1.62, 0.04, gx, 0.81, ez);
      for (const s of [-1, 1]) { for (const y of [0.62, 1.12]) b.box('mat', '#d8d2c8', 0.44, 0.035, GL - 0.06, gx + s * 0.26, y - 0.02, gz); b.box('mat', '#f3f2f2', 0.012, 0.035, GL - 0.06, gx + s * 0.48, 0.6, gz);
        [0.16, 0.64, 1.14].forEach((y, j) => { const t1 = TY[(j * 2 + (s > 0 ? 1 : 4) + (gx > cx ? 3 : 0)) % 6], t2 = TY[(j * 2 + (s > 0 ? 2 : 5) + (gx > cx ? 3 : 0)) % 6];
          goods(b, t1, gx + s * 0.48, gz - GL / 2 + 0.1, gx + s * 0.48, gz - 0.05, y, s, 0, 2); goods(b, t2, gx + s * 0.48, gz + 0.05, gx + s * 0.48, gz + GL / 2 - 0.1, y, s, 0, 2); }); }
      goods(b, 'choc', gx - 0.18, gz - 1.8, gx - 0.18, gz + 1.8, 1.67, -1, 0, 1); box(gx - 0.55, gx + 0.55, gz - GL / 2 - 0.05, gz + GL / 2 + 0.05); }
    // stepped window displays inside the front windows (bottles + chocolates, the shop-window picture)
    for (const wx of [cx - 6.6, cx + 6.6]) { [[2.6, 0.3, 0.9, 0.15, 61.05], [2.2, 0.3, 0.6, 0.45, 61.2], [1.8, 0.3, 0.3, 0.75, 61.35]].forEach(([w, h, d, y, z], k) => { b.box('mat', '#e6e1d3', w, h, d, wx, y, z); b.box('mat', '#3d2a1c', w + 0.02, 0.03, d + 0.02, wx, y + h / 2, z);
        goods(b, ['choc', 'pot', 'pot'][k], wx + w / 2 - 0.1, z - d / 2 + 0.02, wx - w / 2 + 0.1, z - d / 2 + 0.02, y + h / 2, 0, -1, 1); }); box(wx - 1.35, wx + 1.35, 60.55, 61.55); }
    // stock corner (west, behind the counter line) + a round chocolate table (east)
    for (const [x, z, s] of [[-36.6, 73.6, 0.9], [-36.6, 72.6, 0.8], [-35.7, 73.7, 0.7]]) { b.box('mat', '#b8955f', s, s, s, x, s / 2, z, rnd() * 0.3); b.box('mat', '#e6d8b0', s + 0.01, 0.06, 0.18, x, s - 0.02, z, 0); }
    b.box('mat', '#c9a878', 0.6, 0.5, 0.6, -36.6, 1.15, 73.6, 0.2); box(-37.4, -35.2, 72, 74.3);
    b.cyl('mat', '#3d2a1c', 0.08, 0.75, -20.6, 0.375, 71.2, 8); b.cyl('mat', '#2a1d14', 0.35, 0.05, -20.6, 0.025, 71.2, 12); b.cyl('mat', '#6b4a32', 0.75, 0.06, -20.6, 0.78, 71.2, 18);
    for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; b.box('mat', k % 2 ? '#8f2632' : '#a8323e', 0.3, 0.07, 0.22, -20.6 + Math.cos(a) * 0.48, 0.845, 71.2 + Math.sin(a) * 0.48, -a); }
    for (let k = 0; k < 3; k++) b.box('mat', '#a8323e', 0.34 - k * 0.06, 0.08, 0.26 - k * 0.04, -20.6, 0.85 + k * 0.082, 71.2, k * 0.4); ring(-20.6, 71.2, 0.85);
    for (const [x, z] of [[cx - 6.6, 65.3], [cx, 65.3], [cx + 6.6, 65.3], [cx - 2.2, 70.1], [cx + 2.2, 70.1]]) pendant(b, x, z, 3.2);
    // CEILING (after pass 7): white plaster at 7 m, a walnut cornice to match the shelving, a coffer grid of 3 × 2 light panels between the pendants
    { const CY = 6.9, x0 = cx - 9.6, x1 = cx + 9.6, z0 = 60.4, z1 = 75.6; b.box('glo', '#cfc8ba', x1 - x0, 0.12, z1 - z0, cx, CY + 0.06, 68);
      for (const z of [z0 + 0.12, z1 - 0.12]) b.box('mat', '#5a3a22', x1 - x0, 0.26, 0.24, cx, CY - 0.13, z); for (const x of [x0 + 0.12, x1 - 0.12]) b.box('mat', '#5a3a22', 0.24, 0.26, z1 - z0, x, CY - 0.13, 68);
      for (const x of [cx - 3.3, cx + 3.3]) b.box('glo', '#a99f8e', 0.18, 0.2, z1 - z0, x, CY - 0.1, 68); b.box('glo', '#a99f8e', x1 - x0, 0.2, 0.18, cx, CY - 0.1, 67.7);
      for (const x of [cx - 6.5, cx, cx + 6.5]) for (const z of [63.8, 71.6]) { b.box('glo', '#bdb5a6', 4.2, 0.03, 4.6, x, CY - 0.02, z); b.box('glo', '#fff6dc', 1.6, 0.02, 0.5, x, CY - 0.04, z + (z < 68 ? 1.4 : -1.4)); } }
    b.build(G);
    fox('kia', { torso: (K.torso && K.torso[0]) || '#f6efe0', outfit: K.outfit || 'vest' }, cx, 72.2, Math.PI);
    spots.push({ key: 'shop:kia', x: cx, z: 68.4, r: 2.2, prompt: 'ITEM SHOP \u00b7 BUY' }); }

  // ================= ARMORY (Bram): f 18..38 × 60..76, door N at x 28 =================
  let forge = null;
  { const cx = 28, G = room(cx, 68), b = Bin(), K = KEEPERS.find(q => q.key === 'bram') || {};
    flat(G, slate(), 19.2, 15.2, cx, 0.05, 68, 2.4);
    // back wall: dark boards, wainscot, iron rails; swords left, crossed halberds centre, axes right, a row of shields above
    b.box('mat', '#3a2c22', 18.8, 4.4, 0.06, cx, 2.2, 75.56); b.box('mat', '#241a12', 18.8, 0.9, 0.1, cx, 0.45, 75.5); b.box('mat', '#5a3d26', 18.8, 0.06, 0.14, cx, 0.92, 75.48);
    for (let x = cx - 9.4; x <= cx + 9.4; x += 1.2) b.box('mat', '#2a1f17', 0.03, 3.5, 0.02, x, 2.65, 75.52);
    for (const y of [1.25, 2.55]) b.box('gls', '#2a2e33', 18.8, 0.06, 0.06, cx, y, 75.46);
    const sword = (x, y, z, len, rz = 0, ry = 0, flatOn) => { const sn = Math.sin(rz), cs = Math.cos(rz), at = d => [x - sn * d, y + cs * d];
      const [bx, by] = at(len / 2 + 0.2), [gx, gy] = at(0.17), [hx, hy] = at(0.03);
      if (flatOn) { b.box('gls', '#e7edf4', 0.05, 0.012, len, x, y, z - len / 2 - 0.2, ry); b.box('gls', '#c0995c', 0.22, 0.03, 0.04, x, y, z - 0.17, ry); b.box('mat', '#3d2a1c', 0.035, 0.035, 0.16, x, y, z - 0.06, ry); return; }
      b.box('gls', '#e7edf4', 0.07, len, 0.015, bx, by, z, ry, 0, rz); b.box('gls', '#c0995c', 0.34, 0.05, 0.06, gx, gy, z, ry, 0, rz); b.box('mat', '#3d2a1c', 0.045, 0.24, 0.045, hx, hy, z, ry, 0, rz); };
    for (let i = 0; i < 8; i++) sword(cx - 8.6 + i * 0.75, 1.0, 75.4, 0.9 + (i % 3) * 0.15);
    for (let i = 0; i < 8; i++) { const x = cx + 3.1 + i * 0.75; b.box('mat', '#6b4a32', 0.05, 1.35, 0.05, x, 1.75, 75.4); b.box('gls', '#cbd5e1', 0.26, 0.24, 0.02, x + 0.14, 2.28, 75.4); if (i % 2) b.box('gls', '#cbd5e1', 0.22, 0.2, 0.02, x - 0.12, 2.28, 75.4); }
    for (const s of [-1, 1]) { const a = s * 0.38, sn = Math.sin(a), cs = Math.cos(a), tx = cx - sn * 1.5, ty = 2.2 + cs * 1.5;
      b.box('mat', '#5a3d26', 0.06, 3.0, 0.06, cx, 2.2, 75.38, 0, 0, a); b.box('gls', '#cbd5e1', 0.4, 0.32, 0.02, tx - sn * -0.18 + cs * 0.2 * -s, ty - 0.18 * cs, 75.36, 0, 0, a); b.box('gls', '#e7edf4', 0.03, 0.42, 0.02, tx - sn * 0.2, ty + cs * 0.2, 75.36, 0, 0, a); }
    const SH = ['#a8323e', '#cbd5e1', '#26306b', '#c0995c'];
    for (let i = 0; i < 13; i++) { const x = cx - 8.4 + i * 1.4, y = 3.55, c = SH[i % 4];
      if (i % 2 === 0) { b.cyl('mat', '#2a2e33', 0.5, 0.05, x, y, 75.47, 16, Math.PI / 2); b.cyl('mat', c, 0.45, 0.06, x, y, 75.44, 16, Math.PI / 2); b.sph('gls', '#e7edf4', 0.1, x, y, 75.4, 1, 8); }
      else { b.box('mat', c, 0.66, 0.42, 0.05, x, y + 0.2, 75.44); b.cyl('mat', c, 0.38, 0.05, x, y - 0.06, 75.44, 3, Math.PI / 2); b.box('mat', '#2a2e33', 0.7, 0.05, 0.06, x, y + 0.42, 75.43); b.box('gls', '#e7edf4', 0.06, 0.6, 0.02, x, y + 0.05, 75.41); } }
    wallPlane(G, signTex('ARMORY'), 3.6, 0.68, cx, 4.85, 75.5, 0, true);
    // counter: heavy oak, iron straps, glass case of daggers, ledger + scales
    b.box('mat', '#4a3424', 8, 1.0, 0.9, cx, 0.5, 70.1); b.box('mat', '#6b4a32', 8.2, 0.08, 1.05, cx, 1.04, 70.1);
    for (let k = 0; k <= 8; k++) b.box('gls', '#2a2e33', 0.08, 1.0, 0.02, cx - 4 + k, 0.5, 69.645);
    b.box('mat', '#2a1f17', 2.2, 0.05, 0.62, cx + 2.2, 1.105, 70.1); b.box('glass', '#cfe9ff', 2.2, 0.36, 0.62, cx + 2.2, 1.31, 70.1);
    for (let k = 0; k < 4; k++) sword(cx + 1.4 + k * 0.5, 1.15, 70.4, 0.32, 0, 0, true);
    b.box('mat', '#7a2a3a', 0.46, 0.04, 0.34, cx - 2.2, 1.1, 70.15, 0.15); b.box('mat', '#f3efe2', 0.42, 0.03, 0.3, cx - 2.2, 1.125, 70.15, 0.15);
    b.cyl('gls', '#c0995c', 0.03, 0.4, cx - 3.3, 1.28, 70.2, 6); b.box('gls', '#c0995c', 0.5, 0.02, 0.02, cx - 3.3, 1.47, 70.2); for (const s of [-1, 1]) b.cyl('gls', '#c0995c', 0.09, 0.02, cx - 3.3 + s * 0.24, 1.3, 70.2, 10);
    box(cx - 4.1, cx + 4.1, 69.55, 70.65);
    // armour stands along the side windows (the far right one = Reinforced Armor, gold trim)
    for (const [x, z, ry, gold] of [[20.6, 63.2, Math.PI / 2], [20.6, 66.8, Math.PI / 2], [35.4, 63.2, -Math.PI / 2, true], [35.4, 66.8, -Math.PI / 2]]) {
      const st = gold ? '#9aa4b0' : '#7c8794', tr = gold ? '#c0995c' : '#3f4854', fx = Math.sin(ry), fz = Math.cos(ry), px = fz, pz = -fx;
      b.cyl('mat', '#2a2e33', 0.38, 0.08, x, 0.04, z, 12); b.cyl('mat', '#3d2a1c', 0.04, 1.0, x, 0.55, z, 6);
      b.cyl('gls', st, 0.36, 0.36, x, 1.08, z, 10, 0, 0, 0.82); b.cyl('gls', tr, 0.3, 0.05, x, 1.27, z, 10);
      b.cyl('gls', st, 0.24, 0.62, x, 1.58, z, 10, 0, 0, 1.25); b.cyl('gls', tr, 0.2, 0.06, x, 1.92, z, 10);
      for (const s of [-1, 1]) { b.sph('gls', st, 0.16, x + px * s * 0.36, 1.84, z + pz * s * 0.36, 0.75); b.sph('gls', tr, 0.1, x + px * s * 0.36, 1.88, z + pz * s * 0.36, 0.6); }
      b.sph('gls', st, 0.17, x, 2.13, z, 1.05); b.box('mat', '#151719', 0.24, 0.04, 0.06, x + fx * 0.15, 2.13, z + fz * 0.15, ry + Math.PI / 2);
      if (gold) b.box('mat', '#ec3013', 0.05, 0.16, 0.34, x, 2.34, z, ry + Math.PI / 2); ring(x, z, 0.45); }
    // front window displays: a shield on a stand with crossed swords behind (the shop-window picture)
    for (const wx of [cx - 6.2, cx + 6.2]) { b.box('mat', '#3a2c22', 2.2, 0.5, 0.8, wx, 0.25, 61.1); b.box('mat', '#5a3d26', 2.24, 0.04, 0.84, wx, 0.51, 61.1);
      for (const s of [-1, 1]) sword(wx + s * 0.25, 0.75, 61.3, 1.0, s * 0.5);
      const c = wx < cx ? '#a8323e' : '#26306b'; b.cyl('mat', '#2a2e33', 0.5, 0.05, wx, 1.1, 61.0, 16, Math.PI / 2 - 0.25); b.cyl('mat', c, 0.45, 0.06, wx, 1.1, 60.98, 16, Math.PI / 2 - 0.25); b.sph('gls', '#e7edf4', 0.1, wx, 1.11, 60.92);
      b.box('mat', '#3d2a1c', 0.06, 0.6, 0.06, wx, 0.8, 61.15, 0, 0.3); box(wx - 1.15, wx + 1.15, 60.6, 61.55); }
    // spear barrel (west, by the counter)
    b.cyl('mat', '#6b4a32', 0.36, 0.8, 19.6, 0.4, 70.6, 12, 0, 0, 0.9); for (const y of [0.15, 0.65]) b.cyl('gls', '#2a2e33', 0.37, 0.05, 19.6, y, 70.6, 12);
    for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2, ox = Math.cos(a) * 0.15, oz = Math.sin(a) * 0.15; b.box('mat', '#8a6a42', 0.04, 2.1, 0.04, 19.6 + ox, 1.3, 70.6 + oz, 0, oz * 0.4, -ox * 0.4); b.box('gls', '#e7edf4', 0.07, 0.25, 0.02, 19.6 + ox * 3.2, 2.45, 70.6 + oz * 3.2, 0, oz * 0.4, -ox * 0.4); }
    ring(19.6, 70.6, 0.45);
    // forge corner behind the counter (SE): brick hearth, ember bed, iron hood + flue; anvil on a stump
    b.box('mat', '#7a3e2c', 2.2, 1.0, 1.6, 36.3, 0.5, 74.6); b.box('mat', '#5a2c20', 2.26, 0.08, 1.66, 36.3, 1.0, 74.6);
    b.cyl('gls', '#2a2e33', 1.2, 1.1, 36.3, 2.0, 74.6, 4, 0, 0, 0.3, Math.PI / 4); b.box('mat', '#2a2e33', 0.5, 2.6, 0.5, 36.3, 3.85, 74.9);
    b.box('gls', '#2a2e33', 0.03, 0.8, 0.03, 35.4, 1.45, 74.0, 0, 0, 0.3); b.box('gls', '#2a2e33', 0.03, 0.7, 0.03, 35.5, 1.4, 74.2, 0, 0, 0.4);
    b.cyl('mat', '#5a3d26', 0.3, 0.5, 33.7, 0.25, 73.4, 10); b.box('gls', '#2a2e33', 0.62, 0.22, 0.24, 33.7, 0.62, 73.4); b.box('gls', '#2a2e33', 0.3, 0.12, 0.18, 33.7, 0.46, 73.4);
    b.cyl('gls', '#2a2e33', 0.1, 0.32, 33.24, 0.66, 73.4, 8, 0, Math.PI / 2, 0.25); b.box('mat', '#5a3d26', 0.03, 0.03, 0.34, 33.8, 0.75, 73.3, 0.4); b.box('gls', '#3f4854', 0.1, 0.07, 0.07, 33.8, 0.75, 73.14, 0.4);
    box(35.1, 37.6, 73.6, 75.6); ring(33.7, 73.4, 0.45);
    { const e = Bin(); e.box('glo', '#ff7a2a', 1.6, 0.05, 1.1, 36.3, 1.06, 74.6); for (let k = 0; k < 14; k++) e.sph('glo', rnd() < 0.5 ? '#ffb347' : '#ff4a1a', 0.06 + rnd() * 0.05, 35.6 + rnd() * 1.4, 1.1, 74.15 + rnd() * 0.9, 0.6, 5);
      forge = e.build(G).glo; }
    // two iron ring chandeliers
    for (const x of [cx - 4.5, cx + 4.5]) { const y = 3.8, z = 65.3; b.tor('gls', '#2a2e33', 0.7, 0.04, x, y, z, Math.PI / 2);
      for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 0.4; b.box('mat', '#2a2e33', 0.015, 1.4, 0.015, x + Math.cos(a) * 0.35, y + 0.68, z + Math.sin(a) * 0.35, -a, 0, 0.45 * (k % 2 ? 1 : -1) * 0); }
      b.box('mat', '#2a2e33', 0.015, 7 - y - 1.35, 0.015, x, (7 + y + 1.35) / 2, z);
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, px = x + Math.cos(a) * 0.7, pz = z + Math.sin(a) * 0.7; b.cyl('mat', '#f3efe2', 0.035, 0.14, px, y + 0.1, pz, 6); b.sph('glo', '#ffd27a', 0.04, px, y + 0.22, pz, 1.7, 5); } }
    // CEILING (after pass 7): dark boarded ceiling at 7 m on heavy oak beams (front to back, iron straps), a wall plate all round; the chandelier chains hang from the beams
    { const CY = 6.9, x0 = cx - 9.6, x1 = cx + 9.6, z0 = 60.4, z1 = 75.6; b.box('mat', '#6a4e34', x1 - x0, 0.12, z1 - z0, cx, CY + 0.06, 68);
      for (let k = 0; k < 12; k++) b.box('mat', k % 2 ? '#5a412b' : '#735438', x1 - x0, 0.02, 0.04, cx, CY - 0.01, z0 + 1.2 + k * 1.15);
      for (const z of [z0 + 0.15, z1 - 0.15]) b.box('mat', '#5a3d26', x1 - x0, 0.36, 0.3, cx, CY - 0.18, z); for (const x of [x0 + 0.15, x1 - 0.15]) b.box('mat', '#5a3d26', 0.3, 0.36, z1 - z0, x, CY - 0.18, 68);
      for (const x of [cx - 8.1, cx - 4.5, cx - 1.6, cx + 1.6, cx + 4.5, cx + 8.1]) { b.box('mat', '#8a6440', 0.36, 0.44, z1 - z0, x, CY - 0.22, 68); for (const z of [62.6, 68, 73.4]) b.box('gls', '#2a2e33', 0.4, 0.06, 0.14, x, CY - 0.42, z); } }
    b.build(G);
    fox('bram', { torso: (K.torso && K.torso[0]) || '#cbd5e1', outfit: K.outfit || 'vest' }, cx, 72.2, Math.PI);
    spots.push({ key: 'shop:bram', x: cx, z: 68.4, r: 2.2, prompt: 'ARMORY \u00b7 BUY' }); }

  // ================= FORTUNE TELLER (Ora): f -86..-74 × -60..-48, door S at x -80 =================
  let orb = null, candles = null;
  { const cx = -80, G = room(cx, -54), b = Bin();
    flat(G, planks('#5a3d2c', '#2a1a12'), 11.2, 11.2, cx, 0.05, -54, 2);
    const rt = rugTex(); flat(G, rt, 7.4, 7.4, cx, 0.065, -55.2, 0, new THREE.MeshLambertMaterial({ map: rt, transparent: true, alphaTest: 0.5, polygonOffset: true, polygonOffsetFactor: -4 }));
    // back wall: star tapestry behind Ora, pleated velvet drapes either side, valance + gold fringe
    wallPlane(G, tapTex(), 4.4, 3.44, cx, 2.6, -59.5);
    for (const [a, z] of [[-85.4, -82.4], [-77.6, -74.6]]) for (let x = a, k = 0; x < z; x += 0.2, k++) b.box('mat', k % 2 ? '#5e1f2c' : '#7a2a3a', 0.21, 4.6, 0.1, x + 0.1, 2.3, k % 2 ? -59.46 : -59.38);
    b.box('mat', '#7a2a3a', 11.2, 0.46, 0.22, cx, 4.78, -59.38); b.box('gls', '#c0995c', 11.2, 0.08, 0.23, cx, 4.52, -59.38);
    // tent swags from a gold ceiling medallion out to the walls
    b.cyl('gls', '#c0995c', 0.42, 0.12, cx, 5.6, -54, 16);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2 + Math.PI / 8, ex = cx + Math.sin(a) * 5.4, ez = -54 + Math.cos(a) * 5.4, dy = 0.75, Ln = Math.hypot(5.4, dy);
      b.box('mat', k % 2 ? '#5b3f7a' : '#7a2a3a', 1.1, 0.025, Ln, (cx + ex) / 2, 5.6 - dy / 2, (-54 + ez) / 2, a, Math.asin(dy / Ln)); }
    // Ora's table: floor-length cloth, gold trim, crystal ball on a brass stand, tarot spread, two candles
    const tz = -56.5;
    b.cyl('mat', '#5b3f7a', 1.0, 0.8, cx, 0.4, tz, 22, 0, 0, 0.93); b.cyl('mat', '#4a2f66', 0.99, 0.04, cx, 0.82, tz, 22); b.tor('gls', '#c0995c', 0.99, 0.03, cx, 0.08, tz, Math.PI / 2); b.tor('gls', '#c0995c', 0.98, 0.025, cx, 0.8, tz, Math.PI / 2);
    b.cyl('gls', '#c0995c', 0.13, 0.07, cx, 0.875, tz, 12, 0, 0, 0.8); b.tor('gls', '#c0995c', 0.17, 0.05, cx, 0.92, tz, Math.PI / 2);
    for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.32, r = 0.62; b.box('gls', k === 2 ? '#f3efe2' : '#7a2a3a', 0.13, 0.008, 0.2, cx + Math.sin(a) * r, 0.846, tz + Math.cos(a) * r, a); if (k === 2) b.box('mat', '#c0995c', 0.06, 0.01, 0.06, cx, 0.851, tz + r); }
    for (const s of [-1, 1]) { b.cyl('gls', '#c0995c', 0.07, 0.02, cx + s * 0.62, 0.85, tz - 0.25, 10); b.cyl('mat', '#f5dfae', 0.035, 0.18, cx + s * 0.62, 0.95, tz - 0.25, 7); }
    ring(cx, tz, 1.1);
    orb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), new THREE.MeshPhongMaterial({ color: 0x9fd6ff, emissive: 0x3a6aa8, transparent: true, opacity: 0.82, shininess: 140, specular: 0xffffff })); orb.position.set(cx, 1.22, tz); G.add(orb);
    // Ora's high-backed chair
    b.box('mat', '#3a2440', 0.8, 0.08, 0.6, cx, 0.5, -59.0); for (const [lx, lz] of [[-0.35, -0.25], [0.35, -0.25], [-0.35, 0.25], [0.35, 0.25]]) b.box('mat', '#2a1a2e', 0.06, 0.5, 0.06, cx + lx, 0.25, -59.0 + lz);
    b.box('mat', '#3a2440', 0.9, 2.1, 0.1, cx, 1.55, -59.32); b.tor('gls', '#c0995c', 0.24, 0.07, cx, 2.25, -59.26); b.oct('gls', '#c0995c', 0.09, cx, 2.25, -59.26, 1.4); b.sph('gls', '#c0995c', 0.07, cx - 0.45, 2.62, -59.32); b.sph('gls', '#c0995c', 0.07, cx + 0.45, 2.62, -59.32);
    // west cabinet of jars, books and candles
    { const x = -85.0, z = -56.6; b.box('mat', '#3a2440', 0.7, 2.3, 1.8, x, 1.15, z); b.box('mat', '#2a1a2e', 0.04, 2.2, 1.7, x + 0.36, 1.15, z);
      for (const y of [0.55, 1.15, 1.75]) { b.box('mat', '#4a2f66', 0.6, 0.04, 1.7, x + 0.05, y, z);
        for (let k = 0; k < 6; k++) { const zz = z - 0.7 + k * 0.28, t = (k + Math.round(y * 3)) % 3;
          if (t === 0) { b.cyl('gls', ['#7cff9b', '#e08a1e', '#9fd6ff', '#c94c3a'][k % 4], 0.07, 0.2, x + 0.1, y + 0.12, zz, 8); b.cyl('mat', '#3d2a1c', 0.075, 0.04, x + 0.1, y + 0.24, zz, 8); }
          else if (t === 1) for (let q = 0; q < 3; q++) b.box('mat', ['#7a2a3a', '#26306b', '#3d6b4a'][q], 0.22, 0.26 - q * 0.02, 0.06, x + 0.08, y + 0.15, zz - 0.07 + q * 0.07);
          else { b.cyl('mat', '#f3efe2', 0.04, 0.16, x + 0.1, y + 0.1, zz, 6); b.sph('glo', '#ffd27a', 0.03, x + 0.1, y + 0.22, zz, 1.7, 5); } } }
      for (let k = 0; k < 3; k++) b.cyl('mat', '#f3efe2', 0.045, 0.14 + k * 0.06, x, 2.3 + (0.07 + k * 0.03), z - 0.3 + k * 0.3, 6);
      box(-85.6, -84.6, -57.6, -55.6); }
    // east side table: incense burner, book stack
    b.cyl('mat', '#3a2440', 0.07, 0.72, -75.7, 0.36, -57.6, 8); b.cyl('mat', '#3a2440', 0.48, 0.05, -75.7, 0.74, -57.6, 16); b.cyl('mat', '#2a1a2e', 0.3, 0.04, -75.7, 0.02, -57.6, 12);
    b.cyl('gls', '#c0995c', 0.1, 0.12, -75.55, 0.82, -57.75, 10, 0, 0, 1.3); b.cyl('mat', '#3d2a1c', 0.006, 0.3, -75.55, 1.0, -57.75, 4);
    for (let k = 0; k < 3; k++) b.box('mat', ['#26306b', '#7a2a3a', '#3d6b4a'][k], 0.32 - k * 0.03, 0.06, 0.24, -75.85, 0.8 + k * 0.06, -57.45, k * 0.3); ring(-75.7, -57.6, 0.5);
    // star lanterns + floor candle clusters by the door
    for (const [x, z, y] of [[-83.2, -57.4, 3.6], [-76.8, -57.4, 3.9], [-83.2, -51.2, 3.8], [-76.8, -51.2, 3.5]]) { b.box('mat', '#2a1a2e', 0.012, 5.2 - y, 0.012, x, (5.2 + y) / 2 + 0.15, z); b.oct('gls', '#c0995c', 0.24, x, y, z, 1.4); b.sph('glo', '#ffb347', 0.13, x, y, z, 1.2, 6); }
    for (const x of [-84.6, -75.4]) { b.cyl('gls', '#c0995c', 0.32, 0.03, x, 0.07, -49.4, 14); [[0, 0, 0.42], [0.14, 0.1, 0.28], [-0.12, 0.12, 0.2]].forEach(([dx, dz, h]) => { b.cyl('mat', '#f5dfae', 0.06, h, x + dx, 0.08 + h / 2, -49.4 + dz, 8); b.sph('glo', '#ffd27a', 0.04, x + dx, 0.12 + h, -49.4 + dz, 1.7, 5); }); }
    const out = b.build(G); candles = out.glo;
    fox('ora', { torso: '#5b3f7a', outfit: 'robe' }, cx, -58.2, 0); }

  const far = touch ? 60 : 120;
  function tick(dt, t, cam) {
    if (cam) for (const r of rooms) r.G.visible = Math.hypot(cam.x - r.x, cam.z - r.z) < far;
    if (orb) orb.material.emissiveIntensity = 0.8 + Math.sin(t * 2.4) * 0.4;
    if (forge) forge.material.color.setScalar(0.75 + 0.18 * Math.sin(t * 7.3) + 0.1 * Math.sin(t * 13.1));
    if (candles) candles.material.color.setScalar(0.88 + 0.08 * Math.sin(t * 11) + 0.05 * Math.sin(t * 23)); }
  return { spots, npcs, tick };
}
