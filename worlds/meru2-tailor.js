// MERU 2.0 — s45 TOWN 2 INTERIOR 3: TAILOR SHOP [meruTailor] (f -34..-16 × -170..-152, door S (-25, -152), side door E (-16, -161)).
// MADAME STITCH (Ben's pick): tall, elegant old fox, tape round her neck, pin cushion on her wrist, very proper.
// ONE ORDER, 4 STEPS (Ben): a Meru regular orders a suit → MEASURE (tap to stop the tape at the red mark: chest, arm, leg) → CLOTH
// (rolls slide down the bolt ramp, tap the customer's colours) → STITCH (tap as each ring passes under the needle) → DRESS THE FORM
// (tap buttons, tie, pocket square, then the bell) → the customer collects, wearing it. GENTLE: no fail, sloppier = less gold.
// Prize per finished order: an OUTFIT made from the order's cloth (suit, then coat, waistcoat, robe), then LUCKY THREAD.
// New outfits are tried on in the FITTING ROOM first (curtain, WEAR IT / KEEP IT FOR LATER); the fitting room also swaps outfits later.
// s64 INTERIOR POLISH 3: shopKit (Madame = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board; badge), NOW HIRING by the door,
// one-box menu with choices, one-box end line, yellow ring at the order book, hint hand after 3 s, portrait wide lens, camera kept in the room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildTailor({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour, isMuted }) {
  const X0 = -33.6, X1 = -16.4, Z0 = -169.6, Z1 = -152.4, CX = -25, CZ = -161;
  const G = new THREE.Group(); G.name = 'tailorShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const pos = [], nor = [], col = [];
  const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
    const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
  const box = (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz);
  const cyl = (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz);
  const sph = (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const GRN = '#2f4a3a', GRN2 = '#24392d', BRASS = '#c9a14a', WOOD = '#6b4a2e', WOOD2 = '#4e3420', CRM = '#ece4d2', INK = '#201e1d', TAPE = '#ffd23a';
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 12, H / 2 + 2); });
  const plane = (map, w, h, x, y, z, ry = 0, opt = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...opt })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  // ---------- floor: oak planks + a burgundy rug ----------
  { const t = CT(256, 256, (g, w) => { for (let i = 0; i < 8; i++) { g.fillStyle = ['#8a6440', '#7d5a39', '#94704a', '#82603d'][i % 4]; g.fillRect(0, i * 32, w, 32); g.fillStyle = 'rgba(32,30,29,0.35)'; g.fillRect(0, i * 32, w, 2); g.fillRect(((i * 97) % 200) + 20, i * 32, 2, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 3, (Z1 - Z0) / 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  box(4.6, 0.02, 3.4, '#7a2a3a', -25.4, 0.085, -158.9); box(4.2, 0.022, 3.0, '#5e1f2c', -25.4, 0.088, -158.9); box(3.8, 0.024, 2.6, '#7a2a3a', -25.4, 0.09, -158.9);
  // ---------- walls: deep green panelling, brass rails (east wall split round the side door, front only a low wainscot round the door) ----------
  const panel = (w, h, x, y, z, ry) => { box(w, h, 0.05, GRN, x, y, z, ry); for (let u = -w / 2 + 0.8; u < w / 2 - 0.2; u += 1.6) box(0.06, h - 0.1, 0.07, GRN2, x + Math.cos(ry) * u, y, z - Math.sin(ry) * u, ry); };
  const rail = (w, x, y, z, ry) => box(w, 0.06, 0.08, BRASS, x, y, z, ry);
  panel(X1 - X0, 4.2, CX, 2.1, Z0 + 0.03, 0); rail(X1 - X0, CX, 1.0, Z0 + 0.06, 0); rail(X1 - X0, CX, 4.2, Z0 + 0.06, 0);
  panel(Z1 - Z0, 4.2, X0 + 0.03, 2.1, CZ, Math.PI / 2); rail(Z1 - Z0, X0 + 0.06, 1.0, CZ, Math.PI / 2); rail(Z1 - Z0, X0 + 0.06, 4.2, CZ, Math.PI / 2);
  for (const [a, b] of [[Z0, -162.3], [-159.7, Z1]]) { panel(b - a, 4.2, X1 - 0.03, 2.1, (a + b) / 2, Math.PI / 2); rail(b - a, X1 - 0.06, 1.0, (a + b) / 2, Math.PI / 2); }
  box(0.05, 1.0, 2.6, GRN, X1 - 0.03, 3.7, -161); rail(Z1 - Z0, X1 - 0.06, 4.2, CZ, Math.PI / 2); box(0.1, 3.3, 0.12, BRASS, X1 - 0.08, 1.6, -162.35); box(0.1, 3.3, 0.12, BRASS, X1 - 0.08, 1.6, -159.65); box(0.1, 0.12, 2.8, BRASS, X1 - 0.08, 3.25, -161);
  for (const [a, b] of [[X0, -26.4], [-23.6, X1]]) { box(b - a, 0.9, 0.05, GRN, (a + b) / 2, 0.45, Z1 - 0.03); rail(b - a, (a + b) / 2, 0.92, Z1 - 0.06, 0); }
  // ---------- BOLTS OF CLOTH on tall shelves (back wall) + the bolt RAMP the rolls slide down + basket + trolley ----------
  const BOLT = ['#2e4a6b', '#3d3b3a', '#8a5a36', '#3f6a3a', '#6b3a5e', '#ece4d2', '#ec3013', '#e6b45a', '#38bdf8', '#7a2a3a', '#5a5654', '#c9a36b', '#1e331c', '#9aa0a6'];
  { const x0 = -33.2, x1 = -26.6, zc = -169.2; for (const x of [x0, (x0 + x1) / 2, x1]) box(0.1, 4.0, 0.7, WOOD2, x, 2.0, zc);
    [0.35, 1.15, 1.95, 2.75, 3.55].forEach((y, k) => { box(x1 - x0, 0.06, 0.7, WOOD, (x0 + x1) / 2, y, zc); for (let x = x0 + 0.45, i = 0; x < x1 - 0.3; x += 0.68, i++) { if (Math.abs(x - (x0 + x1) / 2) < 0.3) continue; const n = 3 + ((i + k) % 3); for (let j = 0; j < n; j++) { const c = BOLT[(i * 5 + k * 3 + j * 2) % BOLT.length], dx = ((i * 13 + j * 7) % 5 - 2) * 0.012; box(0.6, 0.12, 0.52, c, x + dx, y + 0.09 + j * 0.13, zc + 0.04); box(0.62, 0.03, 0.4, '#c9a36b', x + dx, y + 0.09 + j * 0.13, zc + 0.04); } } });
    rect(x0 - 0.1, x1 + 0.1, Z0, -168.8); }
  const RAMP = { xa: -32.5, xb: -27.1, zt: -168.2, zb: -165.5, yt: 1.75, yb: 1.0 }, LANES = [-31.6, -29.8, -28.0];
  { const len = Math.hypot(RAMP.zb - RAMP.zt, RAMP.yt - RAMP.yb), ang = Math.atan2(RAMP.yt - RAMP.yb, RAMP.zb - RAMP.zt), zc = (RAMP.zt + RAMP.zb) / 2, yc = (RAMP.yt + RAMP.yb) / 2;
    box(RAMP.xb - RAMP.xa, 0.06, len, '#9a7550', (RAMP.xa + RAMP.xb) / 2, yc, zc, 0, ang); for (const x of [RAMP.xa, -30.7, -28.9, RAMP.xb]) box(0.06, 0.1, len, BRASS, x, yc + 0.07, zc, 0, ang);
    for (const x of [RAMP.xa + 0.1, RAMP.xb - 0.1]) { box(0.08, RAMP.yb, 0.08, WOOD2, x, RAMP.yb / 2, RAMP.zb - 0.05); box(0.08, RAMP.yt, 0.08, WOOD2, x, RAMP.yt / 2, RAMP.zt + 0.05); }
    box(5.4, 0.62, 0.9, '#b08a55', -29.8, 0.31, -165.0); box(5.2, 0.04, 0.75, '#4a3a28', -29.8, 0.56, -165.0); for (let x = -32.4; x < -27.2; x += 0.3) box(0.03, 0.6, 0.92, '#8a6a3a', x, 0.31, -165.0);
    rect(-32.6, -27.0, -168.8, -164.5); }
  const TROL = { x: -26.6, z: -164.6, y: 0.95 }; box(0.9, 0.06, 0.6, WOOD, TROL.x, 0.9, TROL.z); for (const sx of [-0.4, 0.4]) for (const sz of [-0.25, 0.25]) { box(0.04, 0.8, 0.04, BRASS, TROL.x + sx, 0.5, TROL.z + sz); cyl(0.07, 0.07, 0.04, INK, TROL.x + sx, 0.08, TROL.z + sz, 10, 0, Math.PI / 2); } rect(TROL.x - 0.5, TROL.x + 0.5, TROL.z - 0.35, TROL.z + 0.35);
  // ---------- FITTING BOX + 3-WAY MIRROR (west) ----------
  const BX = -30.5, BZ = -161.5, BY = 0.3;
  cyl(0.72, 0.76, BY, WOOD2, BX, BY / 2 + 0.07, BZ, 22); cyl(0.73, 0.73, 0.03, BRASS, BX, BY + 0.07, BZ, 22); ringC(BX, BZ, 0.8);
  const mirM = new THREE.MeshPhongMaterial({ color: 0xcfe0ea, shininess: 120, specular: 0xffffff });
  [[-31.75, BZ, Math.PI / 2], [-31.5, BZ - 0.95, Math.PI / 2 + 0.6], [-31.5, BZ + 0.95, Math.PI / 2 - 0.6]].forEach(([x, z, ry]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 2.1), mirM); m.position.set(x, 1.4, z); m.rotation.y = ry; G.add(m);
    box(1.0, 2.2, 0.05, BRASS, x - Math.sin(ry) * 0.03, 1.4, z - Math.cos(ry) * 0.03, ry); box(0.9, 0.1, 0.3, WOOD2, x - Math.sin(ry) * 0.1, 0.12, z - Math.cos(ry) * 0.1, ry); });
  rect(-32.1, -31.2, BZ - 1.4, BZ + 1.4);
  // ---------- the CHANGING BOOTH (front west corner): two walls, a mirror, a hook, red velvet curtain on a brass rail ----------
  const BOOTH = { x: -32.3, z: -155.2 };
  for (const z of [-156.9, -153.5]) { box(2.5, 2.6, 0.06, GRN, -32.25, 1.37, z); box(2.5, 0.08, 0.1, BRASS, -32.25, 2.68, z); rect(-33.6, -31.0, z - 0.08, z + 0.08); }
  box(0.08, 0.08, 3.5, BRASS, -31.0, 2.62, -155.2); box(2.5, 0.05, 3.4, GRN2, -32.25, 2.7, -155.2);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.7), mirM); m.position.set(X0 + 0.09, 1.35, -155.2); m.rotation.y = Math.PI / 2; G.add(m); box(0.04, 1.8, 0.9, BRASS, X0 + 0.07, 1.35, -155.2); }
  box(0.25, 0.04, 0.04, BRASS, X0 + 0.2, 2.0, -156.3); box(0.5, 0.05, 0.03, INK, X0 + 0.3, 1.9, -156.3);
  plane(label('FITTING ROOM', INK, '#f3f2f2', 320, 64, 34), 1.5, 0.3, -30.94, 2.95, -155.2, Math.PI / 2);
  const curM = new THREE.MeshLambertMaterial({ color: 0xa3202a }), curt = [-1, 1].map(s => { const c = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 1.7), curM); c.position.set(-31.0, 1.4, -155.2 + s * 0.85); G.add(c); return c; });
  let curK = 0, curTo = 0;
  // ---------- CUTTING TABLE + old SEWING MACHINE (back east) ----------
  const NX = -22.6, NZ = -166.6, TY = 0.95;
  box(6.6, 0.08, 1.4, WOOD, -21.1, TY - 0.04, NZ); for (const x of [-24.2, -18.0]) for (const z of [NZ - 0.6, NZ + 0.6]) box(0.1, TY - 0.08, 0.1, WOOD2, x, (TY - 0.08) / 2, z); box(6.4, 0.06, 1.2, WOOD2, -21.1, 0.25, NZ); rect(-24.45, -17.75, NZ - 0.75, NZ + 0.75);
  for (let x = -24.2; x < -17.9; x += 0.1) box(0.012, 0.002, 0.04, x % 1 < 0.05 && x % 1 > -0.05 ? INK : '#f3f2f2', x, TY + 0.001, NZ + 0.66);
  box(1.0, 0.03, 0.64, INK, NX + 0.15, TY + 0.015, NZ);
  box(0.16, 0.42, 0.16, INK, NX + 0.12, TY + 0.24, NZ - 0.48); box(0.16, 0.14, 0.62, INK, NX + 0.12, TY + 0.48, NZ - 0.22); box(0.18, 0.28, 0.16, INK, NX + 0.0, TY + 0.36, NZ + 0.02);
  box(0.17, 0.02, 0.6, '#e6b45a', NX + 0.12, TY + 0.52, NZ - 0.22); box(0.17, 0.02, 0.6, '#e6b45a', NX + 0.12, TY + 0.44, NZ - 0.22);
  cyl(0.15, 0.15, 0.05, '#5a5654', NX + 0.24, TY + 0.36, NZ - 0.48, 16, 0, Math.PI / 2); cyl(0.03, 0.03, 0.12, INK, NX + 0.12, TY + 0.6, NZ - 0.36, 8); cyl(0.04, 0.04, 0.06, '#d4213a', NX + 0.12, TY + 0.65, NZ - 0.36, 10);
  box(0.6, 0.02, 0.1, '#c9ced3', -23.7, TY + 0.01, NZ + 0.3, 0.5); box(0.6, 0.02, 0.1, '#c9ced3', -23.7, TY + 0.01, NZ + 0.3, -0.2); for (const s of [-1, 1]) put(new THREE.TorusGeometry(0.06, 0.015, 5, 12), -23.35 + s * 0.05, TY + 0.02, NZ + 0.3 + s * 0.08, '#201e1d', 0, Math.PI / 2);
  sph(0.11, '#d4213a', -23.9, TY + 0.08, NZ - 0.35); box(0.18, 0.04, 0.06, '#f3f2f2', -23.4, TY + 0.02, NZ - 0.4, 0.3);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 6), new THREE.MeshPhongMaterial({ color: 0xdfe3e6, shininess: 100 })); needle.position.set(NX, TY + 0.15, NZ + 0.02); G.add(needle);
  const pfoot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.1), new THREE.MeshLambertMaterial({ color: 0x9aa0a6 })); pfoot.position.set(NX, TY + 0.085, NZ + 0.02); G.add(pfoot);
  // hanging measuring tapes on a brass rail (east wall)
  box(0.05, 0.05, 3.2, BRASS, X1 - 0.12, 2.6, -166.0); for (let i = 0; i < 7; i++) { const z = -167.4 + i * 0.45, h = 0.8 + (i % 3) * 0.25; box(0.01, h, 0.04, TAPE, X1 - 0.13, 2.6 - h / 2, z); box(0.012, h, 0.004, INK, X1 - 0.135, 2.6 - h / 2, z + 0.012); }
  // ---------- the DRESS FORM station (centre east) + accessory table ----------
  const MQ = { x: -22.3, z: -160.8 }, ACC = { x: -19.9, z: -160.6, y: 0.9 };
  box(2.1, 0.06, 1.15, WOOD, ACC.x, ACC.y - 0.03, ACC.z); box(2.1, 0.03, 1.17, BRASS, ACC.x, ACC.y - 0.07, ACC.z); for (const sx of [-0.95, 0.95]) for (const sz of [-0.48, 0.48]) box(0.07, ACC.y - 0.06, 0.07, WOOD2, ACC.x + sx, (ACC.y - 0.06) / 2, ACC.z + sz); rect(ACC.x - 1.1, ACC.x + 1.1, ACC.z - 0.6, ACC.z + 0.6);
  // display forms (static, suits): one in the window, one by the counter
  const form = (x, z, f, cloth, dk) => { for (let i = 0; i < 3; i++) { const a = i * 2.09; box(0.5, 0.04, 0.06, INK, x + Math.cos(a) * 0.22, 0.1, z + Math.sin(a) * 0.22, -a); } cyl(0.025, 0.025, 1.0, BRASS, x, 0.6, z, 6);
    cyl(0.27, 0.23, 0.75, cloth, x, 1.38, z, 14); cyl(0.23, 0.25, 0.22, dk, x, 0.92, z, 14); sph(0.3, cloth, x, 1.72, z, 1.3, 0.45, 0.8); cyl(0.07, 0.07, 0.14, CRM, x, 1.88, z, 8); sph(0.08, WOOD2, x, 1.98, z);
    box(0.16, 0.36, 0.02, '#f7f1e6', x, 1.56, z + f * 0.265); box(0.06, 0.3, 0.02, '#7a2a3a', x, 1.5, z + f * 0.28); for (const y of [1.26, 1.15, 1.04]) sph(0.022, '#e6b45a', x, y, z + f * 0.255); ringC(x, z, 0.4); };
  form(-29.6, -153.3, -1, '#3d3b3a', '#201e1d'); form(-17.4, -153.4, -1, '#2e4a6b', '#16243a');
  // ---------- the COUNTER (front east): order book, till, pin cushion, ribbon reels; the hanging SCISSORS sign ----------
  box(4.2, 1.0, 0.8, WOOD2, -19.5, 0.5, -155.4); box(4.3, 0.06, 0.9, WOOD, -19.5, 1.03, -155.4); box(4.25, 0.04, 0.04, BRASS, -19.5, 0.95, -154.98); for (let x = -21.3; x < -17.6; x += 0.6) box(0.04, 0.8, 0.03, BRASS, x, 0.48, -154.99); rect(-21.65, -17.35, -155.85, -154.95);
  box(0.36, 0.03, 0.46, '#f7f1e6', -21.2, 1.08, -155.35, 0.12, 0, 0.06); box(0.36, 0.03, 0.46, '#f3ead8', -20.85, 1.08, -155.35, 0.12, 0, -0.06); box(0.02, 0.005, 0.5, '#d4213a', -21.02, 1.1, -155.3, 0.12);
  box(0.5, 0.3, 0.4, BRASS, -17.9, 1.21, -155.5); box(0.42, 0.12, 0.3, INK, -17.9, 1.42, -155.55, 0, -0.4);
  sph(0.1, '#d4213a', -19.1, 1.12, -155.3); for (const [x, c] of [[-18.6, '#ec3013'], [-18.45, '#2e4a6b'], [-18.3, '#e6b45a']]) cyl(0.06, 0.06, 0.1, c, x, 1.11, -155.2, 10);
  { const sX = -19.5, sY = 3.35, sZ = -155.4; for (const s of [-1, 1]) { box(0.9, 0.06, 0.03, '#c9ced3', sX + s * 0.05, sY, sZ, 0, 0, s * 0.4); put(new THREE.TorusGeometry(0.13, 0.03, 6, 14), sX + s * 0.42, sY - 0.17 * s * 0 - 0.18, sZ, BRASS, 0, 0, 0); } for (const x of [sX - 0.3, sX + 0.3]) cyl(0.008, 0.008, 1.0, '#3d3b3a', x, sY + 0.55, sZ, 3);
    const SG = label('MADAME STITCH', INK, '#ffd23a', 512, 96, 58); const s1 = plane(SG, 2.6, 0.48, sX, sY + 0.45, sZ + 0.01); const s2 = s1.clone(); s2.rotation.y = Math.PI; s2.position.z = sZ - 0.01; G.add(s2); }
  const bulbs = []; for (const [x, z] of [[-29.5, -160.5], [-25.4, -158.9], [-21.2, -166.6], [-21.1, -160.6], [-19.5, -156.5]]) { cyl(0.01, 0.01, 1.4, '#3d3b3a', x, 4.6, z, 3); put(new THREE.ConeGeometry(0.3, 0.3, 12, 1, true), x, 3.85, z, BRASS); bulbs.push([x, 3.72, z]); }
  // ---------- merge ----------
  const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere();
  G.add(new THREE.Mesh(g0, new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const lm = new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 5), lm, bulbs.length), M4 = new THREE.Matrix4(); bulbs.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); G.add(im); }
  // ---------- the live DRESS FORM (its jacket takes the order's cloth) + accessories ----------
  const L_ = c => new THREE.MeshLambertMaterial({ color: c });
  const dressM = L_('#2e4a6b'), dressDk = L_('#16243a'), liningM = L_('#ec3013'), buttonM = new THREE.MeshPhongMaterial({ color: 0xe6b45a, shininess: 90 }), tieM = L_('#ec3013'), sqM = L_('#ffffff');
  const MQG = new THREE.Group(); MQG.position.set(MQ.x, 0, MQ.z); G.add(MQG); ringC(MQ.x, MQ.z, 0.45);
  const mAdd = (geo, m, x, y, z, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.z = rz; MQG.add(o); return o; };
  { const ink = L_(INK), br = L_(BRASS); for (let i = 0; i < 3; i++) { const a = i * 2.09, o = mAdd(new THREE.BoxGeometry(0.5, 0.04, 0.06), ink, Math.cos(a) * 0.22, 0.1, Math.sin(a) * 0.22); o.rotation.y = -a; } mAdd(new THREE.CylinderGeometry(0.025, 0.025, 1.0, 6), br, 0, 0.6, 0);
    mAdd(new THREE.CylinderGeometry(0.27, 0.23, 0.75, 16), dressM, 0, 1.38, 0); mAdd(new THREE.CylinderGeometry(0.23, 0.25, 0.22, 16), dressDk, 0, 0.92, 0); mAdd(new THREE.SphereGeometry(0.3, 14, 8), dressM, 0, 1.72, 0).scale.set(1.3, 0.45, 0.8);
    for (const s of [-1, 1]) mAdd(new THREE.CapsuleGeometry(0.08, 0.5, 4, 8), dressM, s * 0.37, 1.38, 0, s * 0.08); mAdd(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 8), L_(CRM), 0, 1.88, 0); mAdd(new THREE.SphereGeometry(0.08, 8, 6), L_(WOOD2), 0, 1.98, 0);
    mAdd(new THREE.BoxGeometry(0.16, 0.36, 0.02), L_('#f7f1e6'), 0, 1.56, 0.265); for (const s of [-1, 1]) mAdd(new THREE.BoxGeometry(0.07, 0.34, 0.02), liningM, s * 0.1, 1.53, 0.272, s * 0.32); }
  const tieMesh = mAdd(new THREE.BoxGeometry(0.07, 0.32, 0.02), tieM, 0, 1.5, 0.282); tieMesh.visible = false;
  const btnMesh = [1.26, 1.15, 1.04].map(y => { const o = mAdd(new THREE.SphereGeometry(0.026, 8, 6), buttonM, 0, y, 0.255); o.visible = false; return o; });
  const sqMesh = mAdd(new THREE.BoxGeometry(0.1, 0.06, 0.02), sqM, 0.15, 1.5, 0.27, 0.15); sqMesh.visible = false;
  const BUTTONS = [{ name: 'GOLD', c: '#e6b45a' }, { name: 'SILVER', c: '#c9ced3' }, { name: 'BLACK', c: '#201e1d' }, { name: 'PEARL', c: '#f3ead8' }];
  const TIES = [{ name: 'RED', c: '#ec3013' }, { name: 'NAVY', c: '#2e4a6b' }, { name: 'GREEN', c: '#3f7a52' }, { name: 'YELLOW', c: '#ffd23a' }];
  const SQUARES = [{ name: 'WHITE', c: '#ffffff' }, { name: 'RED', c: '#ec3013' }, { name: 'GOLD', c: '#e6b45a' }, { name: 'SKY', c: '#38bdf8' }];
  const CATS = [{ key: 'btn', name: 'BUTTONS', list: BUTTONS, z: -160.98 }, { key: 'tie', name: 'TIE', list: TIES, z: -160.6 }, { key: 'sq', name: 'POCKET SQUARE', list: SQUARES, z: -160.22 }], ACCX = [-20.6, -20.22, -19.84, -19.46];
  const accTargets = [];
  CATS.forEach(cat => cat.list.forEach((it, i) => { const x = ACCX[i], z = cat.z, y = ACC.y, m = cat.key === 'btn' ? new THREE.MeshPhongMaterial({ color: it.c, shininess: 90 }) : L_(it.c);
    if (cat.key === 'btn') { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.11, 0.03, 16), L_(BRASS)); d.position.set(x, y + 0.015, z); G.add(d); for (let k = 0; k < 3; k++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.015, 10), m); b.position.set(x + Math.cos(k * 2.1) * 0.05, y + 0.04, z + Math.sin(k * 2.1) * 0.05); G.add(b); } }
    else if (cat.key === 'tie') { const t = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.015, 0.3), m); t.position.set(x, y + 0.008, z); G.add(t); const k2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.06), m); k2.position.set(x, y + 0.02, z - 0.15); G.add(k2); }
    else { const s = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.015, 0.15), m); s.position.set(x, y + 0.008, z); s.rotation.y = Math.PI / 4; G.add(s); }
    accTargets.push({ k: cat.key, i, p: V(x, y + 0.03, z), r: 0.18 }); }));
  const bell = new THREE.Group(); bell.position.set(-19.0, ACC.y, -160.6); G.add(bell); { const bm = new THREE.MeshPhongMaterial({ color: 0xd9a838, shininess: 80 }); const d = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), bm); d.position.y = 0.04; bell.add(d); bell.add(new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 14), L_('#3d3b3a'))); const nb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), bm); nb.position.y = 0.19; bell.add(nb); }
  accTargets.push({ k: 'bell', p: V(-19.0, ACC.y + 0.1, -160.6), r: 0.26 });
  // ---------- MADAME STITCH ----------
  const OLD_LOOK = { fur: '#b9aea3', furDark: '#8c8278', muzzle: '#efe9e2', snout: '#e2d8cc', chin: '#f6f2ec', fluff: '#f6f2ec' };
  const madame = kit.makeFox({ key: 'madameStitch', torso: ['#f3f2f2', '#201e1d', '#111111'], outfit: 'dress', mood: 'happy', eyes: ['#5a7a8a', '#5a7a8a'], look: OLD_LOOK });
  madame.scale.multiplyScalar(1.08); madame.position.set(-19.5, 0, -156.45); G.add(madame); ringC(-19.5, -156.45, 0.5);
  { const bd = madame.userData && madame.userData.P && madame.userData.P.body, tm = L_(TAPE), tg = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 4, 20), tm); ring.rotation.x = Math.PI / 2; ring.position.set(0, 1.3, 0.04); tg.add(ring);
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.42, 0.012), tm); st.position.set(s * 0.1, 1.08, 0.29); st.rotation.x = -0.15; tg.add(st); } (bd || madame).add(tg);
    const arm = madame.userData && madame.userData.P && madame.userData.P.arms && madame.userData.P.arms[0]; if (arm) { const pc = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), L_('#d4213a')); pc.scale.y = 0.6; pc.position.set(0, -0.28, 0); arm.add(pc); for (let i = 0; i < 4; i++) { const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.06, 4), L_('#dfe3e6')); pin.position.set(Math.cos(i * 1.6) * 0.04, -0.24, Math.sin(i * 1.6) * 0.04); pin.rotation.z = Math.cos(i * 1.6) * 0.5; arm.add(pin); } } }
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'tailor', color: '#2f4a3a', boardTitle: "Madame's best",
    room: { X0, X1, Z0, Z1 }, door: [-25, -152.8], keeper: madame, keeperRy: 0,
    games: [{ k: 'order', name: 'Suit order', color: '#2f4a3a' }],
    board: { x: X0 + 0.06, y: 2.4, z: -158.5, ry: Math.PI / 2, w: 1.3 }, hiring: { x: -27.6, z: -152.95, ry: Math.PI }, hiringLine: 'MAKE A SUIT',
    sun: [{ x: -29.4, z: -153.6, w: 2.4, d: 1.4 }, { x: -25, z: -153.5, w: 1.6, d: 1.4 }],
    lamps: bulbs,
    browse: [[-29.6, -154.4, 0], [-17.4, -154.5, 0], [-29.8, -163.9, Math.PI], [-29.2, -161.5, -Math.PI / 2]],
    looks: [['#e8d6b0', '#c9b48a', '#8a7450'], ['#7c4dc4', '#5e3a96', '#3d2563']], clock: { x: X1 - 0.08, y: 3.4, z: -157.5, ry: -Math.PI / 2 } });
  const orderRing = new THREE.Mesh(new THREE.RingGeometry(0.93, 1.05, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85, depthWrite: false })); orderRing.rotation.x = -Math.PI / 2; orderRing.position.set(-21.4, 0.1, -154.3); G.add(orderRing);
  const madameT = { key: 'tailorMadame', obj: madame, ry: 0, r: 2.6 }, endT = { key: 'tailorEnd', obj: madame, ry: 0, r: 8 };
  const MS = 'madame stitch', ROLE = 'THE TAILOR', ms = text => ({ who: MS, role: ROLE, text });
  // ---------- cloth, customers (the Meru regulars from Sizzle's) ----------
  const CLOTH = [{ name: 'NAVY', c: '#2e4a6b' }, { name: 'CHARCOAL', c: '#3d3b3a' }, { name: 'TWEED', c: '#8a5a36' }, { name: 'FOREST', c: '#3f6a3a' }, { name: 'PLUM', c: '#6b3a5e' }, { name: 'CREAM', c: '#d9cfb8' }];
  const LINING = [{ name: 'RED', c: '#ec3013' }, { name: 'GOLD', c: '#e6b45a' }, { name: 'SKY', c: '#38bdf8' }], ROLLS = [...CLOTH, ...LINING];
  const dark = (hex, k = 0.62) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString();
  const CUST = [
    { name: 'KIA', role: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], cloth: 1, forW: "for the old king's memorial", say: 'Something sombre. Something with depth.' },
    { name: 'PELL', role: 'Crestview doorman', torso: ['#1f2937', '#e6b45a', '#111827'], cloth: 0, btn: 0, forW: 'for the residents\u2019 ball', say: 'Gold buttons. Residents like gold buttons.' },
    { name: 'OTTO', role: 'Lakeside doorman', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], cloth: 3, forW: 'for the Lakeside gala', say: 'Nothing that shows lake water, please.' },
    { name: 'MARLA', role: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], cloth: 4, forW: 'for market day', say: 'Bright! They must see me from the Arena.' },
    { name: 'MICHAEL JAY', role: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], cloth: 5, tie: 0, forW: 'for a date at the diner', say: 'Sharp, but not too sharp. It is a diner.' },
    { name: 'THE FISHERMAN', role: 'Lake jetty', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], cloth: 0, forW: "for his daughter's wedding", say: 'I have not worn a suit in twenty years.' },
    { name: 'THE SAGE', role: 'Ruins museum', torso: ['#a78bfa', '#ede9fe', '#5b21b6'], cloth: 2, forW: 'for the museum opening', say: 'Pockets. Many pockets. For notes.' }];
  const custCache = {};
  const custFox = (i, suited) => { const k = i + (suited ? 's' : 'v'); if (custCache[k]) return custCache[k]; const C = CUST[i], cl = CLOTH[C.cloth].c;
    const f = kit.makeFox(suited ? { key: 'tailorCustS' + i, torso: ['#f7f1e6', cl, dark(cl)], outfit: 'suit', mood: 'happy' } : { key: 'tailorCust' + i, torso: C.torso, outfit: 'vest', mood: 'happy' }); f.visible = false; G.add(f); custCache[k] = f; return f; };
  const hideCusts = () => Object.values(custCache).forEach(f => { f.visible = false; });
  // ---------- shared state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, BO = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine') => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.06, 0.15, 'triangle'), boop = () => tone(196, 0.05, 0.25, 'square'), tick2 = () => tone(1320, 0.04, 0.08, 'square');
  const rnd = n => Math.floor(Math.random() * n);
  // ---------- outfits (the prize) ----------
  const KINDS = ['suit', 'coat', 'vest', 'robe'], KIND_NAME = { suit: 'SUIT', coat: 'COAT', vest: 'WAISTCOAT', robe: 'ROBE' };
  const owned = () => { const o = save.stat('tailorOutfits', null); return Array.isArray(o) ? o : []; };
  const curOutfit = () => save.data && save.data.outfit && save.data.outfit.outfit ? save.data.outfit : null;
  const sameO = (a, b) => (!a && !b) || (a && b && a.outfit === b.outfit && a.torso && b.torso && a.torso[1] === b.torso[1]);
  const giveGift = cloth => { const have = owned(), next = KINDS.find(k => !have.some(o => o.outfit === k)); save.setStat('tailorClears', save.stat('tailorClears', 0) + 1);
    if (next) { const c = CLOTH[cloth], o = { outfit: next, torso: ['#f7f1e6', c.c, dark(c.c)], name: c.name + ' ' + KIND_NAME[next] }; save.setStat('tailorOutfits', [...have, o]); save.setStat('tailorTry', o); return { kind: 'outfit', o, label: o.name }; }
    save.give('luckyThread'); return { kind: 'thread', label: 'LUCKY THREAD' }; };
  // ---------- cards (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the chocolate shop ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => innerHeight > 720 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const meter = (f, a, b, c) => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:' + (a * 100) + '%;width:' + ((b - a) * 100) + '%;top:0;bottom:0;background:#ffd23a"></div><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.min(1, f) * 100).toFixed(1) + '%;background:' + c + ';opacity:0.85"></div></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, sub, opts) => { pick.innerHTML = head(title, 'FITTING ROOM') + '<div style="padding:8px 10px 10px"><div style="font-size:13px;font-weight:800">' + sub + '</div></div>'; const body = pick.lastChild;
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on); b.innerHTML = (o.sw ? '<span style="width:16px;height:16px;flex:none;border:2px solid ' + (o.primary || o.on ? '#fff' : '#201e1d') + ';background:' + o.sw + '"></span>' : '') + '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- tap input (phone + mouse): a short, still press on the game view (not on HUD buttons or the fitting-room card) ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job') return; down = blocked(e) ? null : { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; }, true);
  addEventListener('pointerup', e => { if (busy !== 'job' || !down || down.id !== e.pointerId) return; const d = down; down = null; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 14 || performance.now() - d.t > 600) return;
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); jobTap(ray.ray); }, true);
  const nearest = (r, list) => { let best = null, bs = 1; for (const it of list) { const s = r.distanceToPoint(it.p) / (it.r * (touch ? 1.3 : 1)); if (s < bs) { bs = s; best = it; } } return best; };
  // ---------- camera: a fixed view per station, fitted to the screen (portrait: subject sits below the card; wide: right of it) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const VIEW = { measure: [V(BX, 1.45, BZ + 0.15), 3.0, 3.1, 0.2, 4.2, Math.PI / 2], fabric: [V(-29.5, 1.1, -166.6), 6.4, 3.3, 0.66, 5.5, 0], stitch: [V(-21.6, 1.0, NZ), 3.4, 1.4, 0.8, 3, 0],
    dress: [V(-20.6, 1.1, -160.6), 4.3, 2.3, 0.5, 3.6, 0], collect: [V(-19.6, 1.3, -155.4), 3.6, 2.9, 0.22, 4.8, -1.3], booth: [V(BOOTH.x, 1.2, BOOTH.z), 2.0, 2.6, 0.12, 3.2, Math.PI / 2] };
  const fitCam = ([tgt, w, h, pitch, minD, yaw]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.18 * 2 * d * hT; else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'booth' ? 'booth' : busy === 'job' && J ? J.step : null; if (!v) { camCur.on = false; lensOff(cam); return; }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wider lens (fitCam already drops the subject under the card)
    fitCam(VIEW[v]);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(Math.max(X0 + 0.35, Math.min(X1 - 0.35, camCur.pos.x)), Math.min(4.8, camCur.pos.y), Math.max(Z0 + 0.35, Math.min(Z1 - 0.35, camCur.pos.z))); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }   // kept inside the room
  // ---------- HINT HAND: no tap for 3 s → a pointer taps the next thing to touch ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0) return null;
    if (J.step === 'measure') return J.m && J.m.hold <= 0 && J.m.k < 3 ? [mark.position.clone(), 'TAP AT THE RED MARK'] : null;
    if (J.step === 'fabric') { const F = J.f; if (!F || F.done) return null; let best = null; for (const r of rolls) if (r.st === 'ramp' && F.want[r.c] && (F.have[r.c] || 0) < F.want[r.c] && (!best || r.s > best.s)) best = r; return best ? [best.g.position.clone(), 'TAP THIS ROLL'] : null; }
    if (J.step === 'stitch') return J.s && !J.s.done ? [V(NX, TY + 0.1, NZ), 'TAP ON YELLOW'] : null;
    if (J.step === 'dress') { const D = J.d; if (!D || D.served) return null; const c = CATS.find(q => D[q.key] !== J.dress[q.key]); const t = c ? accTargets.find(a => a.k === c.key && a.i === J.dress[c.key]) : accTargets.find(a => a.k === 'bell'); return t ? [t.p.clone(), c ? 'TAP ' + c.list[J.dress[c.key]].name : 'RING THE BELL'] : null; }
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ================= THE ORDER =================
  const STEPS = ['measure', 'fabric', 'stitch', 'dress'], STEP_NAME = { measure: 'MEASURE', fabric: 'CHOOSE THE CLOTH', stitch: 'STITCH', dress: 'DRESS THE FORM', collect: 'COLLECTION' };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  function startJob() { const n = save.stat('tailorOrders', 0), ci = (n * 3 + 1) % CUST.length, C = CUST[ci]; save.setStat('tailorOrders', n + 1);
    J = { ci, C, cloth: C.cloth, lining: rnd(3), step: 'measure', gold: 0, pause: 0, t: 0 };
    J.dress = { btn: C.btn != null ? C.btn : rnd(4), tie: C.tie != null ? C.tie : rnd(4), sq: rnd(4) };
    dressM.color.set(CLOTH[J.cloth].c); dressDk.color.set(dark(CLOTH[J.cloth].c, 0.5)); liningM.color.set(LINING[J.lining].c); tieMesh.visible = false; sqMesh.visible = false; btnMesh.forEach(b => { b.visible = false; });
    const f = custFox(ci, false); f.position.set(BX, BY + 0.07, BZ); f.rotation.y = Math.PI / 2; f.visible = true; busy = 'job'; beginMeasure(); toast('STEP 1 OF 4 · MEASURE ' + C.name, 1.8); }
  const nextStep = () => { const i = STEPS.indexOf(J.step); if (i < STEPS.length - 1) { J.step = STEPS[i + 1]; J.t = 0; toast('STEP ' + (i + 2) + ' OF 4 · ' + STEP_NAME[J.step], 1.8); ({ fabric: beginFabric, stitch: beginStitch, dress: beginDress })[J.step](); } else beginCollect(); };
  // ---- 1 · MEASURE: the tape runs out and back; tap to stop it on the red mark ----
  const tapeM = L_(TAPE), tape = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), tapeM), mark = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), L_('#ec3013')), tapeCase = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 14), L_(TAPE));
  for (const o of [tape, mark, tapeCase]) { o.visible = false; G.add(o); }
  const PARTS = [{ key: 'chest', name: 'CHEST', lo: 88, hi: 108, sp: 0.45 }, { key: 'arm', name: 'ARM', lo: 56, hi: 66, sp: 0.55 }, { key: 'leg', name: 'LEG', lo: 74, hi: 86, sp: 0.65 }];
  function beginMeasure() { J.m = { k: 0, u: 0, L: 0, res: [], hold: 0, tg: PARTS.map(p => p.lo + rnd(p.hi - p.lo + 1)) }; for (const o of [tape, mark, tapeCase]) o.visible = true; }
  const placeTape = (k, L, tg) => { const y0 = BY + 0.07; if (k === 0) { const z0 = BZ - 0.5, x = BX + 0.62; tape.scale.set(0.015, 0.07, Math.max(0.001, L)); tape.position.set(x, y0 + 1.45, z0 + L / 2); mark.scale.set(0.04, 0.18, 0.02); mark.position.set(x + 0.01, y0 + 1.45, z0 + tg); tapeCase.rotation.set(Math.PI / 2, 0, 0); tapeCase.position.set(x, y0 + 1.45, z0 - 0.03); }
    else { const yt = k === 1 ? y0 + 1.75 : y0 + 0.86, x = BX + (k === 1 ? 0.3 : 0.55), z = k === 1 ? BZ + 0.68 : BZ + 0.2; tape.scale.set(0.015, Math.max(0.001, L), 0.07); tape.position.set(x, yt - L / 2, z); mark.scale.set(0.04, 0.02, 0.18); mark.position.set(x + 0.01, yt - tg, z); tapeCase.rotation.set(0, 0, 0); tapeCase.position.set(x, yt + 0.03, z); } };
  function measureTick(dt) { const M = J.m, P0 = PARTS[M.k], tg = M.tg[M.k] / 100, Lmax = tg * 1.35;
    if (M.hold > 0) { M.hold -= dt; if (M.hold <= 0) { M.k++; M.u = 0; if (M.k >= 3) { for (const o of [tape, mark, tapeCase]) o.visible = false; J.pause = 1.3; return; } } }
    else { M.u += dt * P0.sp; const fr = M.u % 1; M.L = Lmax * (1 - Math.abs(1 - 2 * fr)); if (Math.floor((M.L * 100) / 5) !== M.lt) { M.lt = Math.floor(M.L * 100 / 5); if (M.L > 0.02) tone(900 + M.L * 400, 0.012, 0.04, 'square'); } }
    if (M.k < 3) placeTape(M.k, M.L, tg); drawMeasure(); }
  function measureTap() { const M = J.m; if (M.hold > 0 || M.k >= 3) return; const tg = M.tg[M.k], got = Math.round(M.L * 100), d = Math.abs(got - tg), pts = d <= 2 ? 10 : d <= 5 ? 7 : d <= 10 ? 4 : 2; M.res[M.k] = got; addGold(pts); M.hold = 1.1;
    d <= 2 ? ding() : pop(); toast(PARTS[M.k].name + ' ' + got + ' CM · ' + (d <= 2 ? 'MADAME: "EXACTLY."' : d <= 5 ? 'MADAME: "VERY GOOD."' : 'MADAME: "I SHALL LET OUT THE SEAM."') + ' +' + pts, 1.6); }
  function drawMeasure() { const M = J.m, k = Math.min(2, M.k), tg = M.tg[k], Lmax = tg * 1.35;
    const rows = PARTS.map((p, i) => row(i === k && M.k < 3 ? '#ffd23a' : '#cfcac3', p.name + ' · STOP AT ' + M.tg[i], M.res[i] != null ? M.res[i] + ' CM' : '\u2014', M.res[i] != null && Math.abs(M.res[i] - M.tg[i]) <= 5)).join('');
    const live = M.k < 3 ? '<div style="padding:2px 0 0;font-weight:900;font-size:22px">' + Math.round(M.L * 100) + ' <span style="font-size:13px">CM</span></div>' + meter(M.L / Lmax, (tg - 2) / 100 / Lmax, (tg + 2) / 100 / Lmax, '#201e1d') : '';
    setCard('m' + M.k + Math.round(M.L * 100) + (M.hold > 0), head('STEP 1 OF 4', 'MEASURE') + foot(M.k >= 3 ? 'ALL MEASURED' : M.hold > 0 ? 'NOTED' : 'TAP AT THE RED MARK') + '<div style="padding:8px 10px 10px">' + who(J.C) + live + rows + '</div>'); }
  // ---- 2 · CLOTH: rolls slide down the bolt ramp; tap the customer's cloth (x2) and lining (x1) ----
  const rollTpl = ROLLS.map(r => { const o = new THREE.Group(), m = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.9, 14), L_(r.c)); m.rotation.z = Math.PI / 2; o.add(m); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 10), L_('#c9a36b')); e.rotation.z = Math.PI / 2; e.position.x = s * 0.47; o.add(e); }
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.06, 14), L_(dark(r.c, 0.75))); band.rotation.z = Math.PI / 2; o.add(band); return o; });
  const rolls = [], pile = [];
  const clearRolls = () => { for (const r of rolls) G.remove(r.g); rolls.length = 0; for (const p of pile) G.remove(p); pile.length = 0; };
  const rampAt = s => V(0, RAMP.yt + (RAMP.yb - RAMP.yt) * s + 0.2, RAMP.zt + (RAMP.zb - RAMP.zt) * s);
  function beginFabric() { custFox(J.ci, false).visible = false; J.f = { want: { [J.cloth]: 2, [6 + J.lining]: 1 }, have: {}, acc: 0.7, miss: 0, last: -1, t: 0 }; }
  const fabNeed = () => Object.keys(J.f.want).map(Number).filter(i => (J.f.have[i] || 0) < J.f.want[i]);
  function spawnRoll() { const F = J.f, need = fabNeed(); let c = need.length && Math.random() < 0.45 ? need[rnd(need.length)] : rnd(ROLLS.length); if (c === F.last) c = (c + 1 + rnd(ROLLS.length - 1)) % ROLLS.length; F.last = c;
    const lane = LANES[rnd(3)]; if (rolls.some(r => r.st === 'ramp' && r.x === lane && r.s < 0.25)) return; const g = rollTpl[c].clone(); const p = rampAt(0); g.position.set(lane, p.y, p.z); G.add(g); rolls.push({ g, c, x: lane, s: 0, st: 'ramp', u: 0, vy: 0, from: V(), to: V() }); }
  function fabricTick(dt) { const F = J.f; F.t += dt; F.acc += dt; if (F.acc > 1.05 && fabNeed().length) { F.acc = Math.random() * -0.3; spawnRoll(); }
    for (let i = rolls.length - 1; i >= 0; i--) { const r = rolls[i], p = r.g.position;
      if (r.st === 'ramp') { r.s += dt * 0.19; const q = rampAt(r.s); p.set(r.x, q.y, q.z); r.g.rotation.x += dt * 0.19 * 2.8 / 0.17; if (r.s >= 1) { r.st = 'fall'; r.vy = 0; } }
      else if (r.st === 'fall' || r.st === 'bump') { if (r.st === 'bump') p.z += dt * 0.8; r.vy -= 9 * dt; p.y += r.vy * dt; p.z += dt * 0.4; if (p.y < 0.5) { G.remove(r.g); rolls.splice(i, 1); } }
      else if (r.st === 'fly') { r.u += dt / 0.5; const u = Math.min(1, r.u); p.lerpVectors(r.from, r.to, u); p.y += Math.sin(u * Math.PI) * 0.7; r.g.rotation.y = u * Math.PI;
        if (u >= 1) { G.remove(r.g); rolls.splice(i, 1); const c2 = rollTpl[r.c].clone(); c2.position.set(TROL.x, TROL.y + 0.17 + pile.length * 0.3, TROL.z); G.add(c2); pile.push(c2); } } }
    if (!fabNeed().length && !F.done && !rolls.some(r => r.st === 'fly')) { F.done = true; const g2 = addGold(15 + Math.max(0, 12 - F.t) - F.miss); ding(); toast('CLOTH CHOSEN · +' + g2 + ' GOLD', 1.8); J.pause = 1.6; }
    drawFabric(); }
  function fabricTap(r) { const F = J.f; if (F.done) return; const h = nearest(r, rolls.filter(q => q.st === 'ramp').map(q => ({ q, p: q.g.position.clone(), r: 0.6 }))); if (!h) return; const q = h.q;
    if (!F.want[q.c]) { F.miss++; q.st = 'bump'; q.vy = 2; boop(); toast(['MADAME: "NOT THAT ONE, DARLING."', 'MADAME: "' + ROLLS[q.c].name + '? FOR ' + J.C.name + '? NO."', 'MADAME: "THE CARD, DARLING. READ THE CARD."'][F.miss % 3], 1.5); return; }
    if ((F.have[q.c] || 0) >= F.want[q.c]) { toast('ENOUGH ' + ROLLS[q.c].name, 1.1); return; }
    F.have[q.c] = (F.have[q.c] || 0) + 1; q.st = 'fly'; q.u = 0; q.from.copy(q.g.position); q.to.set(TROL.x, TROL.y + 0.17 + (pile.length + rolls.filter(z => z.st === 'fly').length) * 0.3, TROL.z); pop(); }
  function drawFabric() { const F = J.f, rows = Object.entries(F.want).map(([i, n]) => { const h = F.have[i] || 0, isL = +i >= 6; return row(ROLLS[i].c, n + ' ' + ROLLS[i].name + (isL ? ' LINING' : ' CLOTH'), h + '/' + n, h === n); }).join('');
    setCard('f' + JSON.stringify(F.have) + !!F.done + Math.floor(F.t), head('STEP 2 OF 4', 'CHOOSE THE CLOTH') + foot(F.done ? 'ON THE TROLLEY' : 'TAP THESE ROLLS') + '<div style="padding:8px 10px 10px">' + who(J.C) + rows + '</div>'); }
  // ---- 3 · STITCH: the cloth slides under the needle; tap as each ring passes under it ----
  const strip = new THREE.Group(); strip.position.set(NX, TY + 0.035, NZ); strip.visible = false; G.add(strip);
  const stripM = L_('#2e4a6b'), ringW = new THREE.MeshBasicMaterial({ color: 0xffffff }), ringR = new THREE.MeshBasicMaterial({ color: 0xec3013 }), ringG = new THREE.MeshBasicMaterial({ color: 0x9aa0a6 }), ringY = new THREE.MeshBasicMaterial({ color: 0xffd23a });
  const ringGeo = new THREE.RingGeometry(0.04, 0.068, 18), dashGeo = new THREE.BoxGeometry(0.1, 0.008, 0.016);
  const SEAMS = [{ n: 8, v: 0.3, name: 'SLEEVE SEAM' }, { n: 8, v: 0.42, name: 'BACK SEAM' }];
  function newSeam() { const S = J.s, spec = SEAMS[S.k]; for (const c of [...strip.children]) strip.remove(c); stripM.color.set(CLOTH[J.cloth].c); let x = 0.7; S.marks = [];
    for (let i = 0; i < spec.n; i++) { x += 0.32 + Math.random() * 0.28; const m = new THREE.Mesh(ringGeo, ringW); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.004, 0); strip.add(m); S.marks.push({ x, m, st: 0 }); }
    const len = x + 0.6, cl = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.5), stripM); cl.rotation.x = -Math.PI / 2; cl.position.set(len / 2, 0, 0); strip.add(cl);
    const ln = new THREE.Mesh(new THREE.BoxGeometry(len, 0.002, 0.01), ringW); ln.position.set(len / 2, 0.002, 0); strip.add(ln); strip.position.x = NX; S.len = len; S.v = spec.v; S.done = false; }
  function beginStitch() { J.s = { k: 0, good: 0, perfect: 0, plunge: 0 }; strip.visible = true; newSeam(); }
  function stitchTick(dt) { const S = J.s; if (!S.done) strip.position.x -= S.v * dt; S.plunge = Math.max(0, S.plunge - dt * 6);
    needle.position.y = TY + 0.15 - S.plunge * 0.06 + Math.sin(performance.now() / 70) * 0.006; pfoot.position.y = TY + 0.085 - S.plunge * 0.01;
    for (const m of S.marks) { const wx = strip.position.x + m.x; if (!m.st && wx < NX - 0.1) { m.st = 2; m.m.material = ringG; } if (!m.st && Math.abs(wx - NX) < 0.1) m.m.material = ringY; else if (!m.st) m.m.material = ringW; }
    if (!S.done && strip.position.x + S.marks[S.marks.length - 1].x < NX - 0.25) { S.done = true; const good = S.marks.filter(m => m.st === 1).length; toast(SEAMS[S.k].name + ' · ' + good + '/' + S.marks.length + ' NEAT', 1.6);
      setTimeout(() => { if (!J || J.step !== 'stitch') return; S.k++; if (S.k >= SEAMS.length) { strip.visible = false; const g2 = addGold(S.good * 2 + S.perfect); ding(); toast('ALL SEWN · +' + g2 + ' GOLD', 1.8); J.pause = 1.4; } else newSeam(); }, 900); }
    drawStitch(); }
  function stitchTap() { const S = J.s; if (S.done) return; S.plunge = 1; tick2(); let best = null, bd = 9; for (const m of S.marks) { if (m.st) continue; const d = Math.abs(strip.position.x + m.x - NX); if (d < bd) { bd = d; best = m; } }
    if (best && bd < 0.1) { best.st = 1; best.m.material = ringR; const ds = new THREE.Mesh(dashGeo, ringR); ds.position.set(best.x, 0.008, 0); strip.add(ds); S.good++; if (bd < 0.045) { S.perfect++; toast('PERFECT STITCH', 0.7); } }
    else toast('WAIT FOR A RING UNDER THE NEEDLE', 1.0); }
  function drawStitch() { const S = J.s, rows = SEAMS.map((sp, i) => { const done = i < S.k || (i === S.k && S.done), n = i === S.k ? S.marks.filter(m => m.st === 1).length : i < S.k ? '\u2713' : 0; return row(i === S.k ? '#ffd23a' : '#cfcac3', sp.name, i <= S.k ? (typeof n === 'number' ? n + '/' + sp.n : n) : '\u2014', done); }).join('');
    setCard('s' + S.k + S.good + S.done + S.marks.filter(m => m.st === 2).length, head('STEP 3 OF 4', 'STITCH') + foot(S.done ? 'SEAM DONE' : 'TAP AS A RING GOES YELLOW') + '<div style="padding:8px 10px 10px">' + who(J.C) + rows + '</div>'); }
  // ---- 4 · DRESS THE FORM: tap buttons, a tie and a pocket square, then the bell ----
  function beginDress() { J.d = { btn: null, tie: null, sq: null }; }
  function dressTap(r) { const h = nearest(r, accTargets); if (!h) return; const D = J.d;
    if (h.k === 'bell') { if (D.btn == null && D.tie == null && D.sq == null) { toast('DRESS THE FORM FIRST', 1.2); return; } ding(); let s = 0; for (const c of CATS) s += D[c.key] === J.dress[c.key] ? 8 : D[c.key] != null ? 3 : 0; const g2 = addGold(Math.max(6, s));
      toast(s >= 24 ? 'MADAME: "IMPECCABLE." +' + g2 : s >= 14 ? 'MADAME: "VERY SMART." +' + g2 : 'MADAME: "IT IS... A LOOK." +' + g2, 1.8); J.pause = 1.6; J.d.served = true; return; }
    if (D.served) return; D[h.k] = h.i; pop();
    if (h.k === 'btn') { buttonM.color.set(BUTTONS[h.i].c); btnMesh.forEach(b => { b.visible = true; }); } else if (h.k === 'tie') { tieM.color.set(TIES[h.i].c); tieMesh.visible = true; } else { sqM.color.set(SQUARES[h.i].c); sqMesh.visible = true; } }
  function drawDress() { const D = J.d, rows = CATS.map(c => { const w = c.list[J.dress[c.key]], got = D[c.key]; return row(w.c, c.name + ' · ' + w.name, got == null ? '\u2014' : got === J.dress[c.key] ? '\u2713' : '\u2717', got === J.dress[c.key]); }).join('');
    const all = CATS.every(c => D[c.key] != null); setCard('d' + D.btn + D.tie + D.sq + !!D.served, head('STEP 4 OF 4', 'DRESS THE FORM') + foot(D.served ? 'READY FOR COLLECTION' : all ? 'TAP THE BELL' : 'TAP BUTTONS, TIE, SQUARE') + '<div style="padding:8px 10px 10px">' + who(J.C) + rows + '</div>'); }
  // ---- COLLECTION: the customer comes back to the counter wearing the suit ----
  function beginCollect() { J.step = 'collect'; J.t = 0; hideCusts(); const f = custFox(J.ci, true); f.position.set(-19.6, 0, -154.35); f.rotation.y = Math.PI; f.visible = true; const g2 = addGold(10); tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7);
    setCard('c', head('COLLECTED', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(J.C) + row(CLOTH[J.cloth].c, CLOTH[J.cloth].name + ' SUIT', '\u2713', true) + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['I feel like a new fox.', 'It fits like a promise.', 'Do I look taller? I look taller.'][J.ci % 3] + '"</div></div>'); toast(J.C.name + ' COLLECTS · +' + g2 + ' GOLD', 2.2); }
  function endJob() { const gold = J.gold, n = save.stat('tailorClears', 0), gift = giveGift(J.cloth); save.best('tailorBest', gold); stop(); toast('ORDER DONE · +' + gold + ' GOLD · ' + gift.label, 3.5);
    K.finish('order', gold >= 100 ? 3 : gold >= 70 ? 2 : 1, gold, !K.stars('order'));
    sayTo(endT, [ms(['Splendid.', 'Impeccable.', 'Very proper.'][n % 3] + ' ' + (gift.kind === 'outfit' ? 'I made you a ' + gift.o.name.toLowerCase() + ' from the same bolt. Try it on, by the window.' : 'A spool of Lucky Thread for you. My grandmother swore by it.'))]); }
  // ---- the job loop + taps ----
  function jobTick(dt) { J.t += dt; if (J.pause > 0) { J.pause -= dt; if (J.step === 'measure') drawMeasure(); else if (J.step === 'dress') drawDress(); if (J.pause <= 0) nextStep(); return; }
    if (J.step === 'measure') measureTick(dt); else if (J.step === 'fabric') fabricTick(dt); else if (J.step === 'stitch') stitchTick(dt); else if (J.step === 'dress') drawDress(); else if (J.step === 'collect' && J.t > 3.2) endJob(); }
  function jobTap(r) { if (!J || J.pause > 0) return; if (J.step === 'measure') measureTap(); else if (J.step === 'fabric') fabricTap(r); else if (J.step === 'stitch') stitchTap(); else if (J.step === 'dress') dressTap(r); }
  function stop() { busy = null; J = null; clearRolls(); strip.visible = false; for (const o of [tape, mark, tapeCase]) o.visible = false; hideCusts(); hideCard(); }
  // ================= THE FITTING ROOM =================
  function boothSwap(o, then) { BO.phase = 'close'; BO.t = 0; BO.o = o; BO.then = then; curTo = 1; tone(392, 0.03, 0.3, 'triangle'); }
  function startBooth(P) { busy = 'booth'; Object.assign(P, { x: BOOTH.x, z: BOOTH.z, yaw: Math.PI / 2, sp: 0 }); BO = { prev: curOutfit(), phase: 'idle', t: 0 }; const tr = save.stat('tailorTry', null);
    if (tr && tr.outfit) boothSwap(tr, () => showPick('TRY-ON', tr.name + ' · HOW DOES IT FEEL?', [{ label: 'WEAR IT', primary: true, sw: tr.torso[1], go: () => { save.setOutfit(tr); save.setStat('tailorTry', null); closeBooth('WEARING THE ' + tr.name); } },
      { label: 'KEEP IT FOR LATER', go: () => { save.setStat('tailorTry', null); hidePick(); boothSwap(BO.prev, () => closeBooth(tr.name + ' IS IN YOUR WARDROBE')); } }]));
    else wardrobe(); }
  function wardrobe() { const cur = curOutfit(), list = [{ o: null, label: 'MY ARMOUR', sw: '#e7edf4' }, ...owned().map(o => ({ o, label: o.name, sw: o.torso[1] }))];
    showPick('WARDROBE', 'PICK AN OUTFIT TO WEAR', [...list.map(it => ({ label: it.label + (sameO(it.o, cur) ? ' · ON' : ''), sw: it.sw, on: sameO(it.o, cur), go: () => { if (sameO(it.o, curOutfit())) return; hidePick(); boothSwap(it.o, () => { save.setOutfit(it.o); wardrobe(); }); } })), { label: 'DONE', primary: true, go: () => closeBooth() }]); }
  function closeBooth(msg) { hidePick(); busy = null; BO = null; curTo = 0; if (msg) toast(msg, 2.6); }
  function boothTick(dt) { if (!BO) return; BO.t += dt; if (BO.phase === 'close' && curK >= 0.99) { BO.phase = 'swap'; wear(BO.o || null); BO.t = 0; }
    else if (BO.phase === 'swap' && BO.t > 0.35) { BO.phase = 'open'; curTo = 0; tone(523, 0.04, 0.4, 'triangle'); } else if (BO.phase === 'open' && curK <= 0.02) { BO.phase = 'idle'; const f = BO.then; BO.then = null; if (f) f(); } }
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 + 0.3 && P.y < 2.5;
  const SPOT = { order: { x: -21.4, z: -154.3, r: 1.05 }, booth: { x: BOOTH.x + 0.2, z: BOOTH.z, r: 1.0 } };
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  function prompt(P) { if (busy || !inShop(P)) return null; if (at(P, SPOT.order)) return 'TAKE AN ORDER · MAKE A SUIT'; if (K.atHiring(P)) return 'NOW HIRING · START WORK';
    if (at(P, SPOT.booth)) { const tr = save.stat('tailorTry', null); return tr && tr.outfit ? 'TRY ON · ' + tr.name : owned().length ? 'FITTING ROOM · CHANGE OUTFIT' : null; }
    if (near(P, madameT)) return 'TALK · MADAME STITCH'; return null; }
  // s64: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ['Good day. I am Madame Stitch. Forty years I have dressed this town. Shall we make a suit?', 'Ah, you again. Good. The order book is waiting, darling.', 'Armour is a tin can with ambitions. Shall we sew instead?', 'Hope wanted everything blue. I allowed it. What shall we make today?'];
  const TIPS = ['A good suit is a quiet suit. It does not shout. It clears its throat.', 'Measure twice. Cut once. Complain never.', 'Noble asked for a cape. For the chair. I am considering it.', 'Pins go in the cushion, darling. Not in the customer.'];
  let lastP = null;
  const madameMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startJob(); } }];
    if (save.stat('tailorTry', null) || owned().length) ch.push({ text: 'THE FITTING ROOM', pick: () => { if (!busy && lastP) startBooth(lastP); } });
    ch.push({ text: 'A TAILOR\'S TIP, PLEASE', pick: () => sayTo(madameT, [ms(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(madameT, [{ ...ms(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy === 'job') return true; if (busy === 'booth') return true; if (!inShop(P)) return false;
    if (at(P, SPOT.order)) { startJob(); return true; }
    if (at(P, SPOT.booth) && (save.stat('tailorTry', null) || owned().length)) { startBooth(P); return true; }
    if (K.atHiring(P)) { ding(); startJob(); return true; }
    if (!near(P, madameT)) return false;
    madameMenu(!talked++); return true; }
  function quit() { if (busy === 'booth') { if (BO && BO.phase !== 'idle') return; const tr = save.stat('tailorTry', null); if (tr && tr.outfit && !sameO(curOutfit(), tr)) { hidePick(); boothSwap(BO.prev, () => closeBooth()); return; } closeBooth(); return; }
    stop(); HINT.style.display = 'none'; toast('ORDER PUT DOWN · GOLD KEPT', 2); }
  // ---------- per frame ----------
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt;
    if (busy === 'job' && !inShop(P)) stop(); if (busy === 'job' && fox) fox.visible = false;
    curK += Math.sign(curTo - curK) * Math.min(Math.abs(curTo - curK), dt * 2.6); curt.forEach((c, i) => { const s = i ? 1 : -1, w = 1.7 * (0.22 + 0.78 * curK); c.scale.z = w / 1.7; c.position.z = BOOTH.z + s * (1.7 - w / 2); });
    if (G.visible) { if (busy === 'job' && J) jobTick(dt); if (busy === 'booth') boothTick(dt);
      orderRing.visible = !busy; orderRing.scale.setScalar(1 + Math.sin(t * 3) * 0.04); hintTick(t);
      for (const f of Object.values(custCache)) if (f.visible) { kit.animFox && kit.animFox(f, dt, 0); } }
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, booth: () => BO, skipTo(s) { if (!J) startJob(); J.pause = 0; if (s === 'collect') { beginCollect(); return; } J.step = STEPS[STEPS.indexOf(s) - 1]; nextStep(); }, rolls, strip, NX, startJob, startBooth, madame, accTargets,
    tapAt(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); if (busy === 'job') jobTap(ray.ray); }, tapRay(p) { jobTap(new THREE.Ray(p.clone().add(V(0, 3, 0)), V(0, -1, 0))); },
    project(v) { const p = v.clone().project(camera); return [(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight]; }, kit: K, hint: () => HINT.style.display !== 'none', dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__tailor = API; return API;
}
