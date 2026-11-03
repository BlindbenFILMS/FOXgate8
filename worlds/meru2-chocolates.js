// MERU 2.0 — s44 TOWN 2 INTERIOR 2: FOXES' CHOCOLATES [meruChocolates] (f 10..30 × -168..-152, door S (20, -152), side door W (10, -160)).
// Run by the twins (Ben's picks): COCOA the maker (chef whites + tall hat, in the kitchen) and BEAN the server (smart vest + bow tie, behind
// the glass counter). They finish each other's lines. Room: cream + brown tiles, glass counter of truffles, a chocolate fountain, copper pots +
// kitchen at the back, the curved bay window seen from inside. TWO 3D games, both tap-to-play (phone first), GENTLE (no fail, slower = less gold):
//  · CONVEYOR (back right): chocolates ride out of the enrober; tap the ones on the order card to box them. 3 boxes, the belt speeds up.
//  · DECORATE (back left): tap a pot to pour the base (tap again to stop in the gold band), tap a pot for the swirl, tap jars for toppings, bell = serve.
// A finished round = gold + the twins' gift: CHEF HAT first (worn inside the shop), then Box of Chocolates / Cocoa Charm in turn.
// s64 INTERIOR POLISH 2: shopKit (Bean = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board; badge), NOW HIRING by the door,
// one-box twin menu with choices, one-box end lines, yellow start rings, hint hand after 3 s, portrait lens + view offset, camera kept in the room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildChocolates({ THREE, scene, kit, cols, save, touch, sayTo, camera, hour, isMuted }) {
  const X0 = 10.4, X1 = 29.6, Z0 = -167.6, Z1 = -152.4, CX = 20, CZ = -160;
  const G = new THREE.Group(); G.name = 'chocolateShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const pos = [], nor = [], col = [];
  const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
    const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
  const box = (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz);
  const cyl = (r0, r1, h, hex, x, y, z, seg = 12) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex);
  const sph = (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const BR = '#5e3622', DK = '#4a2a1c', CR = '#f2e6d0', PK = '#f2c4a8', GOLD = '#e6b45a', COP = '#b87333', STEEL = '#8d9298', MARB = '#f3eee6';
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 12, H / 2 + 2); });
  const plane = (map, w, h, x, y, z, ry = 0, opt = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...opt })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  // ---------- floor: cream + brown tiles ----------
  { const t = CT(128, 128, (g, w) => { g.fillStyle = '#efe3cc'; g.fillRect(0, 0, w, w); g.fillStyle = '#6b3f2a'; g.fillRect(0, 0, 64, 64); g.fillRect(64, 64, 64, 64); g.strokeStyle = 'rgba(32,30,29,0.35)'; g.lineWidth = 2; for (const k of [0, 64, 128]) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k, w); g.moveTo(0, k); g.lineTo(w, k); g.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 1.6, (Z1 - Z0) / 1.6); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  // wainscot: brown panels + a cream rail on the back, east and west walls (west split round the side door)
  const wain = (w, x, z, ry) => { box(w, 1.1, 0.05, BR, x, 0.62, z, ry); box(w, 0.08, 0.08, CR, x, 1.2, z, ry); for (let u = -w / 2 + 0.6; u < w / 2 - 0.3; u += 1.2) box(0.04, 0.8, 0.07, DK, x + Math.cos(ry) * u, 0.6, z - Math.sin(ry) * u, ry); };
  wain(X1 - X0, CX, Z0 + 0.03, 0); wain(Z1 - Z0, X1 - 0.03, CZ, Math.PI / 2); wain(Z0 + 6.4 - Z0, X0 + 0.03, Z0 + 3.2, Math.PI / 2); wain(Z1 - (-158.8), X0 + 0.03, (Z1 - 158.8) / 2, Math.PI / 2);
  // ---------- SHOP: glass display counter of truffles (BEAN behind it), till, hanging sign ----------
  box(7, 1.0, 1.0, DK, 25.5, 0.5, -157.1); box(7.1, 0.08, 1.06, GOLD, 25.5, 1.02, -157.1); for (let x = 22.5; x < 29; x += 1.0) box(0.05, 0.8, 0.04, BR, x, 0.5, -156.58);
  box(7, 0.04, 0.84, CR, 25.5, 1.32, -157.1); box(7.1, 0.06, 1.0, MARB, 25.5, 1.68, -157.1); rect(22, 29, -157.6, -156.6);
  const trufCol = ['#3a2216', '#8a5a36', '#f3ead8', '#e6b45a', '#e0457b', '#d9a838', '#7a2a3a'], truf = [];
  for (const y of [1.1, 1.4]) for (const z of [-157.35, -156.9]) for (let x = 22.3; x < 28.8; x += 0.2) truf.push([x, y, z]);
  { const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 5), new THREE.MeshLambertMaterial(), truf.length), M4 = new THREE.Matrix4(); truf.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); im.setColorAt(i, cc.set(trufCol[(i * 7 + Math.floor(i / 33)) % trufCol.length])); }); G.add(im);
    const gl = new THREE.Mesh(new THREE.BoxGeometry(7, 0.6, 0.9), new THREE.MeshPhongMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.18, shininess: 100, depthWrite: false })); gl.position.set(25.5, 1.36, -157.1); G.add(gl); }
  box(0.5, 0.3, 0.4, GOLD, 28.4, 1.86, -157.2); box(0.42, 0.12, 0.3, DK, 28.4, 2.06, -157.25, 0, -0.4);
  const SIGN = label('COCOA & BEAN', DK, PK, 512, 96, 60); { const s = plane(SIGN, 3.6, 0.68, 25.5, 3.3, -157.1); const b2 = s.clone(); b2.rotation.y = Math.PI; G.add(b2); for (const x of [24.0, 27.0]) cyl(0.01, 0.01, 2.6, '#3d3b3a', x, 4.9, -157.1, 3); }
  for (const x of [23.2, 25.5, 27.8]) { cyl(0.01, 0.01, 2.2, '#3d3b3a', x, 5.3, -156.2, 3); put(new THREE.ConeGeometry(0.28, 0.3, 12, 1, true), x, 4.05, -156.2, COP); }
  const bulbs = [[23.2, 3.92, -156.2], [25.5, 3.92, -156.2], [27.8, 3.92, -156.2]];
  // the curved BAY WINDOW from inside (exterior bay at x 25.8): warm glass, brown mullions, the gold tiers of boxes, a cushioned sill
  { const glow = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 2.8), new THREE.MeshBasicMaterial({ color: 0xfff1d6 })); glow.position.set(25.8, 2.4, Z1 - 0.04); glow.rotation.y = Math.PI; G.add(glow);
    for (let i = 0; i <= 6; i++) box(0.1, 2.8, 0.08, BR, 25.8 + (i - 3) * 0.9, 2.4, Z1 - 0.08); box(5.6, 0.1, 0.08, BR, 25.8, 2.4, Z1 - 0.08);
    box(5.8, 0.25, 0.3, BR, 25.8, 3.82, Z1 - 0.12); box(5.8, 0.5, 1.0, PK, 25.8, 0.7, Z1 - 0.55); box(5.9, 0.08, 1.06, CR, 25.8, 0.98, Z1 - 0.55);
    [[1.5, 1.2], [1.0, 1.65], [0.55, 2.1]].forEach(([r, y]) => { put(new THREE.CylinderGeometry(r, r, 0.06, 18, 1, false, Math.PI / 2, Math.PI), 25.8, y, Z1 - 0.05, GOLD, 0, 0, 0, 1, 1, 0.45); for (let i = 0; i < Math.round(r * 5); i++) { const a = Math.PI / 2 + (i + 0.5) / Math.round(r * 5) * Math.PI; box(0.26, 0.2, 0.2, [PK, '#ec3013', GOLD, '#7a2a3a'][i % 4], 25.8 + r * 0.8 * Math.sin(a), y + 0.13, Z1 - 0.05 + r * 0.8 * Math.cos(a) * 0.45, a); } });
    rect(22.9, 28.7, Z1 - 1.1, Z1); }
  // ---------- the CHOCOLATE FOUNTAIN (front left) + strawberry plate ----------
  const FX = 15, FZ = -156;
  cyl(0.95, 0.95, 0.08, MARB, FX, 0.9, FZ, 20); cyl(0.7, 0.8, 0.86, DK, FX, 0.45, FZ, 20); cyl(0.07, 0.07, 1.4, GOLD, FX, 1.6, FZ, 8);
  const tiers = [[0.6, 1.15], [0.42, 1.6], [0.25, 2.0]]; for (const [r, y] of tiers) { put(new THREE.CylinderGeometry(r, r * 0.55, 0.14, 18, 1, true), FX, y, FZ, GOLD); cyl(r - 0.03, r - 0.03, 0.02, '#3a2216', FX, y + 0.05, FZ, 18); }
  sph(0.12, '#3a2216', FX, 2.32, FZ, 1, 1.4, 1);
  for (let i = 0; i < 10; i++) { const a = i * 0.628; sph(0.07, '#d4213a', FX + Math.cos(a) * 0.82, 0.99, FZ + Math.sin(a) * 0.82, 1, 1.2, 1); box(0.02, 0.18, 0.02, '#c9a36b', FX + Math.cos(a) * 0.82, 1.1, FZ + Math.sin(a) * 0.82); }
  ringC(FX, FZ, 1.05);
  const dripTex = CT(64, 128, (g, w, h) => { g.fillStyle = 'rgba(58,34,22,0.95)'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(122,74,42,0.9)'; for (let i = 0; i < 8; i++) g.fillRect(i * 8 + 2, (i * 37) % h, 3, 40); g.fillStyle = 'rgba(30,16,10,0.6)'; for (let i = 0; i < 6; i++) g.fillRect(i * 11, (i * 53) % h, 2, 26); });
  dripTex.wrapS = dripTex.wrapT = THREE.RepeatWrapping; dripTex.repeat.set(6, 1);
  const dripM = new THREE.MeshBasicMaterial({ map: dripTex, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false });
  for (const [r, y, h] of [[0.6, 1.15, 0.2], [0.42, 1.6, 0.38], [0.25, 2.0, 0.33]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.01, r + 0.05, h, 18, 1, true), dripM); c.position.set(FX, y + 0.05 - h / 2, FZ); G.add(c); }
  // ---------- KITCHEN · back left: stove with 4 copper pots (DARK / MILK / WHITE / PINK), marble bench, mould, 6 topping jars, serve bell ----------
  const POTS = [{ key: 'dark', name: 'DARK', c: '#3a2216' }, { key: 'milk', name: 'MILK', c: '#8a5a36' }, { key: 'white', name: 'WHITE', c: '#f3ead8' }, { key: 'pink', name: 'PINK', c: '#f29ab8' }];
  const POTX = [13.65, 14.55, 15.45, 16.35], POTZ = -166.85;
  box(4.2, 0.9, 1.2, '#3d3b3a', 15, 0.45, POTZ); box(4.3, 0.06, 1.3, '#5a5654', 15, 0.92, POTZ); rect(12.9, 17.1, -167.6, -166.2);
  POTS.forEach((p, i) => { const x = POTX[i]; cyl(0.2, 0.2, 0.03, '#201e1d', x, 0.96, POTZ, 12); put(new THREE.CylinderGeometry(0.3, 0.27, 0.42, 16, 1, true), x, 1.18, POTZ, COP); cyl(0.27, 0.27, 0.03, COP, x, 0.98, POTZ, 16); cyl(0.28, 0.28, 0.02, p.c, x, 1.3, POTZ, 16); box(0.4, 0.04, 0.05, COP, x + 0.42, 1.32, POTZ, 0); });
  POTS.forEach((p, i) => plane(label(p.name, CR, DK, 128, 48, 30), 0.62, 0.22, POTX[i], 0.62, POTZ + 0.61));
  box(5.6, 0.05, 0.05, '#3d3b3a', 15, 2.5, Z0 + 0.1); for (let i = 0; i < 6; i++) { const x = 12.6 + i * 0.95, r = 0.16 + (i % 3) * 0.05; cyl(0.008, 0.008, 0.2, '#3d3b3a', x, 2.38, Z0 + 0.25, 3); put(new THREE.CylinderGeometry(r, r * 0.9, r * 1.1, 12), x, 2.2 - r * 0.6, Z0 + 0.25, COP); box(0.04, 0.04, r * 1.4, COP, x, 2.2 - r * 0.2, Z0 + 0.25 + r * 0.9); }
  const BENCH = { x0: 13.2, x1: 16.8, z0: -165.6, z1: -164.2, y: 1.0 };
  box(3.6, 0.95, 1.4, DK, 15, 0.48, -164.9); box(3.7, 0.08, 1.5, MARB, 15, 0.98, -164.9); for (let x = 13.6; x < 16.8; x += 0.9) box(0.04, 0.7, 0.04, BR, x, 0.45, -164.18); rect(13.15, 16.85, -165.65, -164.15);
  const TOPS = [{ key: 'salt', name: 'SEA SALT', c: '#f6f6f6' }, { key: 'nut', name: 'HAZELNUTS', c: '#b07a3e' }, { key: 'rasp', name: 'RASPBERRY', c: '#d4213a' }, { key: 'leaf', name: 'GOLD LEAF', c: '#e6b45a' }, { key: 'spr', name: 'SPRINKLES', c: '#7c4dc4' }, { key: 'peel', name: 'ORANGE PEEL', c: '#f97316' }];
  const JARX = [13.5, 14.1, 14.7, 15.3, 15.9, 16.5], JARZ = -165.3;
  const jarGlass = new THREE.MeshPhongMaterial({ color: 0xe6f4ff, transparent: true, opacity: 0.3, shininess: 90, depthWrite: false });
  TOPS.forEach((t, i) => { const x = JARX[i]; cyl(0.15, 0.15, 0.2, t.c, x, 1.12, JARZ, 10); cyl(0.17, 0.17, 0.05, COP, x, 1.37, JARZ, 10); const j = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.34, 12, 1, true), jarGlass); j.position.set(x, 1.19, JARZ); G.add(j);
    plane(label(t.name, CR, DK, 192, 48, 24), 0.5, 0.13, x, 1.12, JARZ + 0.18); });
  const MX = 15, MZ = -164.55, MY = 1.03;
  cyl(0.46, 0.46, 0.03, GOLD, MX, MY, MZ, 22);
  const mould = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.36, 0.3, 24, 1, true), new THREE.MeshLambertMaterial({ color: 0xd9d4cc, side: THREE.DoubleSide })); mould.position.set(MX, MY + 0.16, MZ); G.add(mould);
  const fillM = new THREE.MeshLambertMaterial({ color: 0x3a2216 }), fill = new THREE.Mesh(new THREE.CylinderGeometry(0.355, 0.35, 1, 24), fillM); fill.position.set(MX, MY + 0.02, MZ); fill.visible = false; G.add(fill);
  const bandM = new THREE.MeshBasicMaterial({ color: 0xffd23a }), bands = [0.78, 0.92].map(k => { const b = new THREE.Mesh(new THREE.TorusGeometry(0.385, 0.012, 4, 28), bandM); b.rotation.x = Math.PI / 2; b.position.set(MX, MY + 0.02 + k * 0.28, MZ); G.add(b); return b; });
  const spillM = new THREE.Mesh(new THREE.CircleGeometry(0.6, 18), fillM); spillM.rotation.x = -Math.PI / 2; spillM.position.set(MX + 0.1, MY + 0.02, MZ + 0.05); spillM.visible = false; G.add(spillM);
  const swirlM = new THREE.MeshLambertMaterial({ color: 0xf3ead8 });
  const swirl = (() => { const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60, r = 0.3 * (1 - u) + 0.02, a = u * Math.PI * 7; pts.push(V(Math.cos(a) * r, u * 0.13, Math.sin(a) * r)); } const tg = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 180, 0.032, 6); const m = new THREE.Mesh(tg, swirlM); m.position.set(MX, 0, MZ); m.visible = false; G.add(m); return m; })();
  const topG = TOPS.map((t, ti) => { const g = new THREE.Group(); g.position.set(MX, 0, MZ); const m = new THREE.MeshLambertMaterial({ color: t.c }); for (let i = 0; i < 12; i++) { const a = i * 2.4 + ti, r = 0.08 + ((i * 37 + ti * 11) % 23) / 23 * 0.24;
      const geo = t.key === 'nut' ? new THREE.SphereGeometry(0.035, 6, 4) : t.key === 'rasp' ? new THREE.SphereGeometry(0.04, 6, 4) : t.key === 'peel' ? new THREE.BoxGeometry(0.11, 0.02, 0.03) : t.key === 'leaf' ? new THREE.BoxGeometry(0.07, 0.006, 0.06) : new THREE.BoxGeometry(t.key === 'spr' ? 0.05 : 0.025, 0.02, t.key === 'spr' ? 0.012 : 0.025);
      const pm = t.key === 'spr' ? new THREE.MeshLambertMaterial({ color: ['#ec3013', '#ffd23a', '#3f9a5e', '#2e86b8', '#f29ab8', '#7c4dc4'][i % 6] }) : t.key === 'leaf' ? new THREE.MeshPhongMaterial({ color: 0xe6b45a, shininess: 120, emissive: 0x3a2a08 }) : m;
      const o = new THREE.Mesh(geo, pm); o.position.set(Math.cos(a) * r, 0.02 + (i % 3) * 0.008, Math.sin(a) * r); o.rotation.set(i * 0.7, a, i * 0.3); g.add(o); } g.visible = false; G.add(g); return g; });
  const ladle = new THREE.Group(); { const lm = new THREE.MeshLambertMaterial({ color: COP }); const cup = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), lm); ladle.add(cup); const h = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.6), lm); h.position.set(0, 0.06, 0.32); h.rotation.x = -0.4; ladle.add(h); } ladle.position.set(MX + 0.08, MY + 0.95, MZ - 0.05); ladle.rotation.z = 1.1; ladle.visible = false; G.add(ladle);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 1, 8), fillM); stream.visible = false; G.add(stream);
  const bell = new THREE.Group(); bell.position.set(16.45, MY, -164.45); G.add(bell); { const bm = new THREE.MeshPhongMaterial({ color: 0xd9a838, shininess: 80 }); const d = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), bm); d.position.y = 0.04; bell.add(d); const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 14), new THREE.MeshLambertMaterial({ color: 0x3d3b3a })); bell.add(pl); const nb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), bm); nb.position.y = 0.19; bell.add(nb); }
  for (const [x, z] of [[11.2, -167.0], [11.9, -167.1], [11.5, -166.4]]) { sph(0.38, '#b89a6a', x, 0.36, z, 1, 1.05, 0.9); box(0.3, 0.05, 0.3, '#8a6a3a', x, 0.74, z); } rect(10.7, 12.4, -167.6, -166.0);
  plane(label('COCOA BEANS', '#b89a6a', DK, 256, 48, 26), 0.8, 0.15, 11.5, 0.45, -166.04);
  // ---------- KITCHEN · back right: the CONVEYOR (enrober at the east end → belt → bin at the west end), gift box stand, shelves of boxes ----------
  const BY = 1.0, BZ = -164.4, BXE = 27.6, BXW = 20.8;
  box(8.8, 0.12, 1.1, STEEL, 24.95, BY - 0.1, BZ); for (const s of [-1, 1]) box(8.8, 0.12, 0.05, '#5a5654', 24.95, BY + 0.04, BZ + s * 0.52); for (let x = 21; x < 29.4; x += 1.4) for (const s of [-1, 1]) box(0.08, BY - 0.15, 0.08, '#5a5654', x, (BY - 0.15) / 2, BZ + s * 0.45);
  rect(20.5, 29.5, BZ - 0.6, BZ + 0.6);
  const beltTex = CT(64, 32, (g, w, h) => { g.fillStyle = '#2b2a29'; g.fillRect(0, 0, w, h); g.fillStyle = '#3d3b3a'; g.fillRect(0, 0, 6, h); g.fillRect(32, 0, 6, h); }); beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(17, 1);
  { const b = new THREE.Mesh(new THREE.PlaneGeometry(8.6, 0.92), new THREE.MeshLambertMaterial({ map: beltTex })); b.rotation.x = -Math.PI / 2; b.position.set(24.95, BY - 0.035, BZ); G.add(b); }
  box(1.9, 1.5, 1.4, CR, 28.55, BY + 0.75, BZ); box(1.95, 0.12, 1.45, BR, 28.55, BY + 1.5, BZ); box(1.9, 0.3, 1.4, PK, 28.55, BY + 1.3, BZ); box(0.05, 0.45, 1.0, '#201e1d', 27.58, BY + 0.28, BZ);
  for (let i = 0; i < 3; i++) cyl(0.07, 0.07, 0.5, COP, 28.2 + i * 0.35, BY + 1.85, BZ - 0.3, 8);
  const curtM = new THREE.MeshBasicMaterial({ map: dripTex, transparent: true, opacity: 0.95, depthWrite: false }); { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.5), curtM); c.position.set(27.56, BY + 0.28, BZ); c.rotation.y = -Math.PI / 2; G.add(c); }
  plane(label('ENROBER', PK, DK, 256, 64, 40), 1.2, 0.3, 28.55, BY + 1.3, BZ + 0.71);
  box(0.9, 0.5, 1.1, '#5a5654', 20.3, 0.25, BZ); box(0.8, 0.05, 1.0, '#3a2216', 20.3, 0.5, BZ);
  const STAND = { x: 22.95, z: -162.95 }; box(0.6, 0.95, 0.5, DK, STAND.x, 0.48, STAND.z); box(0.66, 0.05, 0.56, MARB, STAND.x, 0.97, STAND.z); rect(STAND.x - 0.33, STAND.x + 0.33, STAND.z - 0.28, STAND.z + 0.28);
  for (const y of [2.3, 3.1]) { box(8.4, 0.06, 0.45, BR, 25, y, Z0 + 0.25); for (let x = 21.2; x < 28.9; x += 0.62) { const h = 0.22 + ((x * 7) % 3) * 0.04; box(0.5, h, 0.34, [PK, '#ec3013', GOLD, '#7a2a3a', CR][Math.round(x * 3 + y) % 5], x, y + 0.03 + h / 2, Z0 + 0.25); box(0.52, 0.03, 0.08, GOLD, x, y + 0.05 + h * 0.5, Z0 + 0.43); } }
  for (const [x, z] of [[13, Z0 + 0.12], [17, Z0 + 0.12], [22, Z0 + 0.12], [27.5, Z0 + 0.12]]) { box(0.2, 0.3, 0.12, COP, x, 3.9, z); bulbs.push([x, 3.78, z + 0.12]); }
  // ---------- merge ----------
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere();
  G.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const lm = new THREE.MeshBasicMaterial({ color: 0xffe2a8 }), im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.09, 8, 5), lm, bulbs.length), M4 = new THREE.Matrix4(); bulbs.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); G.add(im); }
  // ---------- the CHOCOLATES (6 kinds, shared geometry; the belt + box use clones) ----------
  const CH = [{ key: 'truffle', name: 'DARK TRUFFLES', c: '#3a2216' }, { key: 'heart', name: 'MILK HEARTS', c: '#8a5a36' }, { key: 'star', name: 'WHITE STARS', c: '#f3ead8' },
    { key: 'cup', name: 'CARAMEL CUPS', c: '#e6b45a' }, { key: 'dome', name: 'RASPBERRY DOMES', c: '#e0457b' }, { key: 'gold', name: 'GOLD HAZELNUTS', c: '#d9a838' }];
  const ext = (sh, d) => { const e = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.02, bevelSegments: 2, curveSegments: 8 }); e.center(); return e; };
  const heartS = new THREE.Shape(); heartS.moveTo(0, -0.17); heartS.bezierCurveTo(-0.03, -0.12, -0.2, -0.04, -0.18, 0.06); heartS.bezierCurveTo(-0.16, 0.18, -0.03, 0.18, 0, 0.08); heartS.bezierCurveTo(0.03, 0.18, 0.16, 0.18, 0.18, 0.06); heartS.bezierCurveTo(0.2, -0.04, 0.03, -0.12, 0, -0.17);
  const starS = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.09 : 0.2; i ? starS.lineTo(Math.cos(a) * r, Math.sin(a) * r) : starS.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const L_ = c => new THREE.MeshLambertMaterial({ color: c }), F_ = c => new THREE.MeshPhongMaterial({ color: c, shininess: 110, flatShading: true });
  const TPL = CH.map(t => { const o = new THREE.Group(), add = (geo, m, x = 0, y = 0, z = 0) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); o.add(me); return me; };
    if (t.key === 'truffle') { add(new THREE.SphereGeometry(0.17, 12, 8), L_('#3a2216'), 0, 0.17); add(new THREE.SphereGeometry(0.06, 6, 4), L_('#6b3f2a'), 0.06, 0.31, 0.05); }
    else if (t.key === 'heart') add(ext(heartS, 0.1), L_('#8a5a36'), 0, 0.2);
    else if (t.key === 'star') add(ext(starS, 0.1), L_('#f3ead8'), 0, 0.21);
    else if (t.key === 'cup') { add(new THREE.CylinderGeometry(0.17, 0.12, 0.17, 14), F_('#e6b45a'), 0, 0.085); add(new THREE.SphereGeometry(0.15, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), L_('#c97a2a'), 0, 0.16); }
    else if (t.key === 'dome') { add(new THREE.SphereGeometry(0.18, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), L_('#e0457b'), 0, 0.02); add(new THREE.CylinderGeometry(0.19, 0.19, 0.04, 14), L_('#3a2216'), 0, 0.02); add(new THREE.SphereGeometry(0.035, 6, 4), L_('#f3ead8'), 0, 0.2); }
    else add(new THREE.IcosahedronGeometry(0.16, 1), F_('#d9a838'), 0, 0.17);
    return o; });
  // ---------- the twins + customers ----------
  const TWIN_LOOK = { fur: '#7a4a2a', furDark: '#4e2c18', muzzle: '#e8c9a6', snout: '#d9b08a', chin: '#f4ece0', fluff: '#f4ece0' };
  const hatMesh = (tall = 1) => { const h = new THREE.Group(), w = new THREE.MeshLambertMaterial({ color: 0xffffff }); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.12, 16), w); h.add(band);
    const puff = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.2, 0.26 * tall, 16), w); puff.position.y = 0.06 + 0.13 * tall; h.add(puff); const top = new THREE.Mesh(new THREE.SphereGeometry(0.27, 14, 8), w); top.scale.y = 0.55; top.position.y = 0.06 + 0.26 * tall; h.add(top);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, p = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.24 * tall, 0.02), new THREE.MeshLambertMaterial({ color: 0xe6e0d4 })); p.position.set(Math.cos(a) * 0.235, 0.06 + 0.13 * tall, Math.sin(a) * 0.235); p.rotation.y = -a; h.add(p); } return h; };
  const onHead = (fox, obj, y = 0.42) => { const hd = fox.userData && fox.userData.P && fox.userData.P.head; obj.position.set(0, y, -0.02); (hd || fox).add(obj); if (!hd) obj.position.y = 2.25; };
  const cocoa = kit.makeFox({ key: 'cocoa', torso: ['#f6f3ec', '#e6e0d4', '#c9c2b4'], outfit: 'coat', mood: 'happy', eyes: ['#7a4a2a', '#7a4a2a'], look: TWIN_LOOK });
  cocoa.position.set(18.7, 0, -166.4); G.add(cocoa); ringC(18.7, -166.4, 0.5); onHead(cocoa, hatMesh(1.5));
  const bean = kit.makeFox({ key: 'bean', torso: ['#7a2a3a', '#5e1f2c', '#3d141c'], outfit: 'vest', mood: 'happy', eyes: ['#7a4a2a', '#7a4a2a'], look: TWIN_LOOK });
  bean.position.set(25.5, 0, -158.35); G.add(bean); ringC(25.5, -158.35, 0.5);
  { const bt = new THREE.Group(), bm = new THREE.MeshLambertMaterial({ color: 0xec3013 }); for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.12, 4), bm); w.rotation.z = s * Math.PI / 2; w.position.x = s * 0.06; bt.add(w); } bt.add(new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), bm)); const bd = bean.userData && bean.userData.P && bean.userData.P.body; bt.position.set(0, 1.27, 0.25); (bd || bean).add(bt); }
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'choc', color: '#7a2a3a', boardTitle: 'Cocoa & Bean best',
    room: { X0, X1, Z0, Z1 }, door: [20, -152.8], keeper: bean, keeperRy: 0,
    games: [{ k: 'belt', name: 'Conveyor', color: '#7a2a3a' }, { k: 'deco', name: 'Decorate', color: '#e6b45a' }],
    board: { x: X1 - 0.05, y: 2.4, z: -160.6, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: 17.4, z: -152.95, ry: Math.PI }, hiringLine: 'BOX CHOCOLATES',
    sun: [{ x: 25.8, z: -154.4, w: 4.6, d: 1.6 }, { x: 20, z: -153.6, w: 1.4, d: 1.4 }],
    lamps: bulbs.slice(0, 3),
    browse: [[23.2, -155.6, Math.PI], [27.6, -155.6, Math.PI], [15, -154.6, Math.PI], [24.6, -154.3, 0]],
    looks: [['#e8d6b0', '#c9b48a', '#8a7450'], ['#2e86b8', '#22648a', '#16435c']], clock: { x: X0 + 0.08, y: 3.5, z: -164.6, ry: Math.PI / 2 } });
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.85, depthWrite: false });
  const startRings = [[21.9, -162.55, 1.2], [17.55, -163.55, 1.1]].map(([x, z, r]) => { const m = new THREE.Mesh(new THREE.RingGeometry(r - 0.12, r, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.1, z); G.add(m); return m; });
  const endT = { key: 'chocEnd', obj: cocoa, ry: 0, r: 6 }, cocoaT = { key: 'chocCocoa', obj: cocoa, ry: 0, r: 2.4 }, beanT = { key: 'chocBean', obj: bean, ry: 0, r: 2.6 };
  const CUST = [
    { name: 'NURSE POPPY', forW: 'for the night shift', say: 'Something to keep the ward awake!' },
    { name: "THE MAYOR'S CLERK", forW: 'for the council meeting', say: 'They argue less with chocolate.' },
    { name: 'GRAN HAZEL', forW: 'for bridge club', say: 'Nothing too chewy, dear. My teeth.' },
    { name: 'SKIP', forW: 'for the skate crew', say: 'Big ones. We fall over a lot.' },
    { name: 'CAPTAIN TOR', forW: "for the ship's crew", say: 'Ship rule: no swapping. Make it fair.' },
    { name: 'MISS JUNE', forW: "for her sister's wedding", say: 'It has to be perfect. No pressure!' },
    { name: 'RANGER MOSS', forW: 'for the long walk', say: 'Sturdy ones. For the pocket.' }];
  const LOOKS = [['#f3f2f2', '#d8d2c8', '#9aa0a6'], ['#2e4a6b', '#22374f', '#16243a'], ['#7c4dc4', '#5e3a96', '#3d2563'], ['#3f6a3a', '#2e4f2a', '#1e331c']];
  const custFox = LOOKS.map((lk, i) => { const f = kit.makeFox({ key: 'chocCust' + i, torso: lk, outfit: i % 2 ? 'coat' : 'vest', mood: 'happy' }); f.position.set(25.5, 0, -155.5); f.rotation.y = Math.PI; f.visible = false; G.add(f); return f; });
  const showCust = i => custFox.forEach((f, k) => { f.visible = i != null && k === i % custFox.length; });
  // ---------- shared state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, hat = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine') => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.06, 0.15, 'triangle'), boop = () => tone(196, 0.05, 0.25, 'square');
  const pick = (a, n) => [...a].sort(() => Math.random() - 0.5).slice(0, n);
  const GIFTS = { chefHat: 'CHEF HAT', chocolates: 'BOX OF CHOCOLATES', cocoaCharm: 'COCOA CHARM' };
  const giveGift = () => { const n = save.stat('chocClears', 0), id = !save.count('chefHat') ? 'chefHat' : n % 2 ? 'cocoaCharm' : 'chocolates'; save.give(id); save.setStat('chocClears', n + 1); return [id, GIFTS[id]]; };
  // ---------- card (Modernist: ground, 2px ink, red bar, flush left) — same spot as the flower shop: LEFT, under the place box ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:200px;width:min(58vw,260px);max-height:calc(100vh - 340px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; card.style.top = short ? '96px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:' + (innerHeight > 700 ? 2 : 6) + 'px">' + C.forW + '</div>' + (innerHeight > 700 ? '<div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '');
  const foot = (next) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- tap input (phone + mouse): a short, still press anywhere on the game view (not on the HUD's buttons) ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(); let down = null;
  const blocked = (e) => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (!busy) return; down = blocked(e) ? null : { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; }, true);
  addEventListener('pointerup', e => { if (!busy || !down || down.id !== e.pointerId) return; const d = down; down = null; if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 14 || performance.now() - d.t > 600) return;
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); (busy === 'belt' ? beltTap : decoTap)(ray.ray); }, true);
  const nearest = (r, list) => { let best = null, bs = 1; for (const it of list) { const s = r.distanceToPoint(it.p) / (it.r * (touch ? 1.3 : 1)); if (s < bs) { bs = s; best = it; } } return best; };
  // ---------- camera: a fixed view that fits the play area on any screen (portrait phone first) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = (tgt, w, h, pitch, minD) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), wT = hT * (camera.aspect || 1); const d = Math.max(w / 2 / wT, h / 2 / hT, minD);
    camT.look.copy(tgt); camT.pos.set(tgt.x, tgt.y + Math.sin(pitch) * d, tgt.z + Math.cos(pitch) * d); };
  let fovP = null, vOff = 0; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; } if (vOff) { cam.clearViewOffset(); vOff = 0; } cam.updateProjectionMatrix(); };
  function camFix(cam, dt) { if (!busy) { camCur.on = false; if (fovP != null || vOff) lensOff(cam); return; } const wide = (camera.aspect || 1) > 1;
    if (!wide) { if (fovP == null) fovP = cam.fov; const oy = -Math.round(innerHeight * 0.2), fv = Math.max(fovP, 72); if (cam.fov !== fv || vOff !== oy) { cam.fov = fv; cam.setViewOffset(innerWidth, innerHeight, 0, oy, innerWidth, innerHeight); vOff = oy; cam.updateProjectionMatrix(); } } else if (fovP != null || vOff) lensOff(cam);   // portrait: wider lens + picture slid down so the work sits under the card if (busy === 'belt') fitCam(wide ? V(23.7, BY + 0.1, BZ + 0.45) : V(24.3, BY + 0.1, BZ - 0.6), wide ? 4.6 : 3.8, 2.4, 0.66, 5.4); else fitCam(wide ? V(MX - 0.6, MY + 0.15, -165.5) : V(MX, MY + 0.15, -166.3), 3.8, 2.6, 0.95, 3.6);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 4); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(Math.max(X0 + 0.4, Math.min(X1 - 0.4, camCur.pos.x)), Math.min(5.2, camCur.pos.y), Math.max(Z0 + 0.4, Math.min(Z1 - 0.4, camCur.pos.z))); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }   // kept inside the room
  // ---------- HINT HAND: no tap for 3 s → a pointer taps the next thing to touch ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy === 'belt' && BL && BL.pause <= 0) { const O = BL.o; let best = null; for (const it of items) if (it.s === 'belt' && O.want[it.t] && (O.have[it.t] || 0) < O.want[it.t] && it.g.position.x > BXW + 0.8 && (!best || it.g.position.x < best.x)) best = it.g.position; return best ? [V(best.x, BY + 0.18, best.z), 'TAP IT'] : null; }
    if (busy === 'deco' && DC && DC.pause <= 0) { const O = DC.o; if (DC.pour) return DC.fill > 0.6 ? [V(MX, MY + 0.2, MZ), 'TAP IN THE GOLD'] : null; if (DC.base == null) return [V(POTX[O.base], 1.25, POTZ), 'TAP THE POT']; if (DC.sw == null) return [V(POTX[O.swirl], 1.25, POTZ), 'TAP FOR THE SWIRL'];
      const t = O.tops.find(q => !DC.tops.includes(q)); return t != null ? [V(JARX[t], 1.2, JARZ), 'TAP THE JAR'] : [V(bell.position.x, MY + 0.1, bell.position.z), 'RING THE BELL']; } return null; };
  const hintTick = t => { const h = busy && performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ================= CONVEYOR =================
  let BL = null; const boxG = new THREE.Group(); boxG.position.set(STAND.x, BY + 0.0, STAND.z); G.add(boxG);
  const boxBase = new THREE.Mesh(new THREE.BoxGeometry(1, 0.12, 0.56), new THREE.MeshLambertMaterial({ color: 0xf2c4a8 })); boxBase.position.y = 0.06; boxG.add(boxBase);
  const boxIn = new THREE.Mesh(new THREE.BoxGeometry(1, 0.02, 0.48), new THREE.MeshLambertMaterial({ color: 0x4a2a1c })); boxIn.position.y = 0.115; boxG.add(boxIn);
  const lid = new THREE.Group(); { const lm = new THREE.Mesh(new THREE.BoxGeometry(1, 0.08, 0.6), new THREE.MeshLambertMaterial({ color: 0xf2c4a8 })); lid.add(lm); const rb = new THREE.MeshLambertMaterial({ color: 0xec3013 }); const r1 = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.09, 0.07), rb); lid.add(r1); const r2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.62), rb); lid.add(r2); for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.02, 5, 10), rb); l.position.set(s * 0.06, 0.07, 0); l.rotation.y = s * 0.5; lid.add(l); } } lid.position.y = 0.2; lid.visible = false; boxG.add(lid);
  boxG.visible = false;
  const slotPos = (i, n) => { const c = n / 2, sp = 0.22; return V((i % c - (c - 1) / 2) * sp, 0.13, (Math.floor(i / c) - 0.5) * 0.22); };
  const sizeBox = n => { const w = n / 2 * 0.22 + 0.12; boxBase.scale.x = w; boxIn.scale.x = w - 0.06; lid.scale.x = w; };
  const BOXES = [{ n: 4, mix: [2, 2], v: 0.85 }, { n: 6, mix: [2, 2, 2], v: 1.2 }, { n: 8, mix: [3, 3, 2], v: 1.55 }];
  const items = [];
  const clearItems = () => { for (const it of items) G.remove(it.g); items.length = 0; };
  const clearBox = () => { for (const c of [...boxG.children]) if (c.userData.slot) boxG.remove(c); lid.visible = false; };
  const newBox = () => { const spec = BOXES[BL.k], types = pick([0, 1, 2, 3, 4, 5], spec.mix.length), want = {}; types.forEach((t, j) => { want[t] = spec.mix[j]; });
    BL.o = { want, have: {}, n: spec.n, v: spec.v, t: 0, miss: 0, cust: BL.cs[BL.k] }; clearBox(); sizeBox(spec.n); showCust(BL.o.cust); toast('BOX ' + (BL.k + 1) + ' OF 3 · BELT SPEED ' + (BL.k + 1), 1.8); };
  const filled = O => Object.values(O.have).reduce((a, b) => a + b, 0);
  const spawn = () => { const O = BL.o; let t; const need = O ? Object.keys(O.want).map(Number).filter(i => (O.have[i] || 0) < O.want[i]) : [];
    t = need.length && Math.random() < 0.5 ? need[Math.floor(Math.random() * need.length)] : Math.floor(Math.random() * 6); if (t === BL.last && Math.random() < 0.6) t = (t + 1 + Math.floor(Math.random() * 5)) % 6; BL.last = t;
    const o = TPL[t].clone(); o.position.set(BXE + 0.2, BY, BZ + (Math.random() - 0.5) * 0.25); G.add(o); items.push({ g: o, t, s: 'belt', u: 0, vy: 0, from: V(), to: V() }); };
  function startBelt(P) { busy = 'belt'; BL = { k: 0, cs: pick(CUST.map((_, i) => i), 3), gold: 0, acc: 0.6, pause: 0, last: -1 }; Object.assign(P, { x: 21.25, z: -162.9, yaw: Math.PI * 0.6, sp: 0 }); boxG.visible = true; newBox(); }
  function beltTap(r) { if (!BL || BL.pause > 0) return; const list = items.filter(it => it.s === 'belt').map(it => ({ it, p: V(it.g.position.x, BY + 0.18, it.g.position.z), r: 0.42 })); const h = nearest(r, list); if (!h) return; const it = h.it, O = BL.o;
    if (!O.want[it.t]) { O.miss++; BL.miss = (BL.miss || 0) + 1; it.s = 'eat'; it.u = 0; boop(); toast(['NOT ON THE CARD · BEAN EATS IT', 'BEAN: "MINE NOW."', 'COCOA: "BEAN, STOP EATING THE STOCK."'][O.miss % 3], 1.5); return; }
    if ((O.have[it.t] || 0) >= O.want[it.t]) { toast('ENOUGH ' + CH[it.t].name, 1.2); return; }
    const si = filled(O); O.have[it.t] = (O.have[it.t] || 0) + 1; it.s = 'fly'; it.u = 0; it.slot = si; it.from.copy(it.g.position); it.to.copy(boxG.localToWorld(slotPos(si, O.n))); pop();
    if (Object.entries(O.want).every(([i, n]) => (O.have[i] || 0) === n)) { const g2 = Math.max(O.n * 2, O.n * 5 + Math.max(0, Math.round(24 - O.t)) - O.miss * 2); BL.gold += g2; save.addGold(g2); BL.pause = 1.9; setTimeout(() => { if (BL) { lid.visible = true; ding(); } }, 480); toast('BOXED · +' + g2 + ' GOLD', 2.2); } }
  function beltTick(dt) { const O = BL.o, v = O.v; O.t += BL.pause > 0 ? 0 : dt; BL.acc += v * dt; if (BL.acc >= 0.9) { BL.acc = -Math.random() * 0.25; spawn(); }
    beltTex.offset.x += v * dt / (8.6 / 17) * 0.5;
    for (let i = items.length - 1; i >= 0; i--) { const it = items[i], p = it.g.position;
      if (it.s === 'belt') { p.x -= v * dt; if (p.x < BXW) { it.s = 'drop'; it.vy = 0; } }
      else if (it.s === 'drop') { p.x -= v * dt * 0.6; it.vy -= 9 * dt; p.y += it.vy * dt; if (p.y < 0.45) { G.remove(it.g); items.splice(i, 1); } }
      else if (it.s === 'eat') { it.u += dt / 0.35; p.y = BY + Math.sin(it.u * Math.PI) * 0.4; it.g.scale.setScalar(Math.max(0.01, 1 - it.u)); if (it.u >= 1) { G.remove(it.g); items.splice(i, 1); } }
      else if (it.s === 'fly') { it.u += dt / 0.42; const u = Math.min(1, it.u); p.lerpVectors(it.from, it.to, u); p.y += Math.sin(u * Math.PI) * 0.6; it.g.scale.setScalar(1 - u * 0.45); it.g.rotation.y = u * Math.PI * 2;
        if (u >= 1) { G.remove(it.g); items.splice(i, 1); const c = TPL[it.t].clone(); c.scale.setScalar(0.55); c.position.copy(slotPos(it.slot, BL.o.n)); c.userData.slot = true; boxG.add(c); } } }
    if (BL.pause > 0) { BL.pause -= dt; if (BL.pause <= 0) { BL.k++; if (BL.k >= 3) return endBelt(); newBox(); } }
    const rows = Object.entries(O.want).map(([i, n]) => { const h = O.have[i] || 0; return row(CH[i].c, n + ' ' + CH[i].name, h + '/' + n, h === n); }).join('');
    setCard('b' + BL.k + JSON.stringify(O.have) + Math.floor(O.t) + BL.pause, head('BOX ' + (BL.k + 1) + ' OF 3', Math.floor(O.t) + ' S') + foot(BL.pause > 0 ? 'BOXED! NEXT BOX COMING' : 'TAP THE CHOCOLATES ON THE CARD') + '<div style="padding:8px 10px 10px">' + who(CUST[O.cust]) + rows + '</div>'); }
  function endBelt() { const gold = BL.gold, m = BL.miss || 0, n = save.stat('chocClears', 0), gift = giveGift(); save.best('chocBestBelt', gold); stop(); toast('ALL 3 BOXED · +' + gold + ' GOLD · ' + gift[1], 3.5);
    K.finish('belt', m === 0 ? 3 : m <= 2 ? 2 : 1, gold, !K.stars('belt'));
    sayTo(endT, [{ who: 'bean', role: 'THE SERVER', text: ['Three boxes out the door!', 'All boxed, nothing squashed!', 'The belt likes you!'][n % 3] + ' ' + giftLine(gift) }]); }
  // ================= DECORATE =================
  let DC = null;
  const decoOrder = k => { const b = Math.floor(Math.random() * 4); let s = Math.floor(Math.random() * 4); if (s === b) s = (s + 1 + Math.floor(Math.random() * 3)) % 4; return { base: b, swirl: s, tops: pick([0, 1, 2, 3, 4, 5], [1, 2, 3][k]), rate: [0.42, 0.55, 0.68][k], cust: DC.cs[k] }; };
  const resetMould = () => { DC.base = null; DC.fill = 0; DC.pour = false; DC.spill = false; DC.sw = null; DC.swK = 0; DC.tops = []; fill.visible = false; swirl.visible = false; spillM.visible = false; topG.forEach(g2 => { g2.visible = false; }); ladle.visible = false; stream.visible = false; bands.forEach(b => { b.visible = true; }); };
  function startDeco(P) { busy = 'deco'; DC = { k: 0, cs: pick(CUST.map((_, i) => i), 3), gold: 0, pause: 0 }; DC.o = decoOrder(0); resetMould(); showCust(DC.o.cust); Object.assign(P, { x: 17.55, z: -163.55, yaw: -Math.PI * 0.62, sp: 0 }); toast('ORDER 1 OF 3', 1.6); }
  const topY = () => MY + 0.02 + DC.fill * 0.28;
  const stopPour = () => { DC.pour = false; ladle.visible = false; stream.visible = false; const f = DC.fill; toast(f >= 0.78 && f <= 0.92 ? 'PERFECT POUR' : f < 0.78 ? 'A LITTLE SHALLOW' : 'BRIMMING!', 1.3); pop(); };
  function decoTap(r) { if (!DC || DC.pause > 0) return; if (DC.pour) { stopPour(); return; }
    const T = [...POTX.map((x, i) => ({ k: 'pot', i, p: V(x, 1.25, POTZ), r: 0.36 })), ...JARX.map((x, i) => ({ k: 'jar', i, p: V(x, 1.2, JARZ), r: 0.27 })), { k: 'bell', p: V(bell.position.x, MY + 0.1, bell.position.z), r: 0.3 }, { k: 'mould', p: V(MX, MY + 0.15, MZ), r: 0.42 }];
    const h = nearest(r, T); if (!h) return;
    if (h.k === 'pot') { if (DC.base == null) { DC.base = h.i; DC.pour = true; fillM.color.set(POTS[h.i].c); fill.visible = true; ladle.visible = true; stream.visible = true; toast('POURING ' + POTS[h.i].name + ' · TAP TO STOP', 1.6); return; }
      DC.sw = h.i; DC.swK = 0; swirlM.color.set(POTS[h.i].c); swirl.visible = true; pop(); toast(POTS[h.i].name + ' SWIRL', 1.2); return; }
    if (h.k === 'jar') { if (DC.base == null) { toast('POUR THE BASE FIRST · TAP A POT', 1.6); return; } if (DC.tops.includes(h.i)) { toast(TOPS[h.i].name + ' IS ON', 1.1); return; } if (DC.tops.length >= 3) { toast('THREE TOPPINGS IS PLENTY', 1.4); return; }
      DC.tops.push(h.i); topG[h.i].visible = true; tone(1200, 0.03, 0.12, 'triangle'); return; }
    if (h.k === 'bell') { if (DC.base == null) { toast('NOTHING TO SERVE YET', 1.4); return; } ding(); serve(); return; }
    if (h.k === 'mould' && DC.base == null) toast('TAP A POT TO POUR', 1.4); }
  function serve() { const O = DC.o, f = DC.fill; let s = 0; s += DC.base === O.base ? 10 : 2; s += f >= 0.78 && f <= 0.92 && !DC.spill ? 12 : f >= 0.68 && f <= 1 && !DC.spill ? 6 : 2; s += DC.sw === O.swirl ? 8 : DC.sw != null ? 2 : 0;
    for (const t of DC.tops) s += O.tops.includes(t) ? 6 : -3; const g2 = Math.max(6, s); DC.gold += g2; save.addGold(g2); const max = 30 + O.tops.length * 6, q = s / max; DC.q = (DC.q || 0) + q;
    toast(CUST[O.cust].name + ' · ' + (q > 0.85 ? '"A WORK OF ART!"' : q > 0.55 ? '"LOVELY, THANK YOU!"' : '"IT\'S... CHOCOLATE. I LIKE CHOCOLATE."') + ' +' + g2, 2.8); DC.pause = 2.4; }
  function decoTick(dt) { const O = DC.o;
    if (DC.pour) { DC.fill += O.rate * dt; if (DC.fill >= 1) { DC.fill = 1; DC.pour = false; DC.spill = true; ladle.visible = false; stream.visible = false; spillM.visible = true; boop(); toast('SPILL! COCOA: "THE FLOOR LOVES IT."', 1.8); } }
    fill.scale.y = Math.max(0.001, DC.fill * 0.28); fill.position.y = MY + 0.02 + DC.fill * 0.14; const ty = topY();
    if (stream.visible) { const top = MY + 0.86; stream.scale.y = top - ty; stream.position.set(MX, (top + ty) / 2, MZ); ladle.rotation.z = 1.1 + Math.sin(performance.now() / 160) * 0.05; }
    if (swirl.visible) { DC.swK = Math.min(1, DC.swK + dt / 0.9); swirl.position.y = ty; const n = swirl.geometry.index.count; swirl.geometry.setDrawRange(0, Math.floor(n * DC.swK / 3) * 3); }
    topG.forEach(g2 => { g2.position.y = ty + (swirl.visible ? 0.06 : 0); });
    if (DC.pause > 0) { DC.pause -= dt; if (DC.pause <= 0) { DC.k++; if (DC.k >= 3) return endDeco(); DC.o = decoOrder(DC.k); resetMould(); showCust(DC.o.cust); toast('ORDER ' + (DC.k + 1) + ' OF 3', 1.6); } return drawDeco(); }
    drawDeco(); }
  function drawDeco() { const O = DC.o, f = DC.fill, P2 = POTS, okB = DC.base === O.base, okF = f >= 0.78 && f <= 0.92 && !DC.spill;
    const meter = '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:78%;width:14%;top:0;bottom:0;background:#ffd23a"></div><div style="position:absolute;left:0;top:0;bottom:0;width:' + (f * 100).toFixed(1) + '%;background:' + (DC.base != null ? P2[DC.base].c : '#cfcac3') + ';opacity:0.9"></div></div>';
    const rows = row(P2[O.base].c, 'BASE · ' + P2[O.base].name, DC.base == null ? '—' : okB ? '✓' : '✗', okB) + '<div style="padding:2px 0 4px;font-size:12px;font-weight:800">FILL TO THE GOLD BAND' + meter + '</div>' +
      row(P2[O.swirl].c, 'SWIRL · ' + P2[O.swirl].name, DC.sw == null ? '—' : DC.sw === O.swirl ? '✓' : '✗', DC.sw === O.swirl) + O.tops.map(t => row(TOPS[t].c, TOPS[t].name, DC.tops.includes(t) ? '✓' : '—', DC.tops.includes(t))).join('') +
      (DC.tops.filter(t => !O.tops.includes(t)).length ? '<div style="font-size:12px;color:#5a5654;padding-top:3px">EXTRA: ' + DC.tops.filter(t => !O.tops.includes(t)).map(t => TOPS[t].name).join(', ') + '</div>' : '');
    const next = DC.pause > 0 ? 'SERVED! NEXT ORDER COMING' : DC.pour ? 'TAP ANYWHERE TO STOP POURING' : DC.base == null ? 'TAP A POT TO POUR THE BASE' : DC.sw == null ? 'TAP A POT FOR THE SWIRL' : DC.tops.length < O.tops.length ? 'TAP THE TOPPING JARS' : 'TAP THE BELL TO SERVE';
    setCard('d' + DC.k + DC.base + Math.round(f * 50) + DC.sw + DC.tops.join() + DC.spill + (DC.pause > 0) + DC.pour, head('ORDER ' + (DC.k + 1) + ' OF 3', 'DECORATE') + foot(next) + '<div style="padding:8px 10px 10px">' + who(CUST[O.cust]) + rows + '</div>'); }
  function endDeco() { const gold = DC.gold, q = (DC.q || 0) / 3, n = save.stat('chocClears', 0), gift = giveGift(); save.best('chocBestDeco', gold); stop(); toast('3 SERVED · +' + gold + ' GOLD · ' + gift[1], 3.5);
    K.finish('deco', q > 0.85 ? 3 : q > 0.55 ? 2 : 1, gold, !K.stars('deco'));
    sayTo(endT, [{ who: 'cocoa', role: 'THE MAKER', text: ['Three showpieces, steady hands!', 'Art! Edible art!', 'Not one spill worth mentioning!'][n % 3] + ' ' + giftLine(gift) }]); }
  const giftLine = gift => gift[0] === 'chefHat' ? 'You earned the tall hat. Wear it in here, house rule.' : gift[0] === 'cocoaCharm' ? 'Take a Cocoa Charm for luck. Do not eat it.' : 'Have a Box of Chocolates, on the house.';
  function stop() { busy = null; BL = null; DC = null; clearItems(); clearBox(); boxG.visible = false; resetMould0(); showCust(null); hideCard(); }
  const resetMould0 = () => { fill.visible = false; swirl.visible = false; spillM.visible = false; topG.forEach(g2 => { g2.visible = false; }); ladle.visible = false; stream.visible = false; };
  function quit() { const was = busy; stop(); HINT.style.display = 'none'; toast(was === 'belt' ? 'BELT STOPPED · GOLD KEPT' : 'APRON OFF · GOLD KEPT', 2); }
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 + 0.3 && P.y < 2.5;
  const SPOT = { belt: { x: 21.9, z: -162.55, r: 1.2 }, deco: { x: 17.55, z: -163.55, r: 1.1 } };
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r;
  const near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  function prompt(P) { if (busy || !inShop(P)) return null; if (at(P, SPOT.belt)) return 'START THE BELT · BOX ORDERS'; if (at(P, SPOT.deco)) return 'DECORATE · TAKE AN ORDER'; if (K.atHiring(P)) return 'NOW HIRING · START WORK';
    if (near(P, beanT) || near(P, cocoaT)) return 'TALK · COCOA & BEAN'; return null; }
  // s64: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last); whichever twin you walk up to answers
  const HELLO = { bean: ["Welcome to Foxes' Chocolates! I'm Bean, he's Cocoa. Twins. Fancy some work? Paid in gold and snacks.", 'Back again! Cocoa saved you the broken ones. Belt or bench today?', 'You smell of caramel. That means you work here now.', 'Cocoa is tempering. I am supervising. Want a shift?'],
    cocoa: ["Welcome! I'm Cocoa, I make them. Bean sells them. Twins. Want work? Paid in gold.", 'Careful, the pots are hot. The belt is not. Want a shift?', 'Bean ate the samples again. I need hands. Yours?', 'Tempering is love and patience. Mostly patience. Ready?'] };
  const SECRET = ['Cocoa licked the belt once. Just once, he says. Loudly.', 'The secret ingredient is love. Cocoa says butter. It is both.', 'Bean tempers the customers, I temper the chocolate. My job is harder.', 'White chocolate has no cocoa in it. Do not tell Cocoa. He cries.'];
  let lastP = null;
  const twinMenu = (t, first) => { const w = t === beanT ? 'bean' : 'cocoa', role = w === 'bean' ? 'THE SERVER' : 'THE MAKER';
    sayTo(t, [{ who: w, role, text: first ? HELLO[w][0] : HELLO[w][1 + (talked % 3)], choices: [
      { text: CHOICE_WORK, pick: () => { if (!busy && lastP) startBelt(lastP); } },
      { text: 'DECORATE A SHOWPIECE', pick: () => { if (!busy && lastP) startDeco(lastP); } },
      { text: 'TELL ME A SECRET', pick: () => sayTo(t, [{ who: w, role, text: SECRET[talked % SECRET.length] }]) },
      { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); };
  function talk(P) { lastP = P; if (busy) { if (DC && DC.pour) stopPour(); return true; } if (!inShop(P)) return false;
    if (at(P, SPOT.belt)) { startBelt(P); return true; } if (at(P, SPOT.deco)) { startDeco(P); return true; } if (K.atHiring(P)) { ding(); startBelt(P); return true; }
    const t = near(P, beanT) ? beanT : near(P, cocoaT) ? cocoaT : null; if (!t) return false;
    twinMenu(t, !talked++); return true; }
  // ---------- per frame ----------
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt;
    if (busy && !inShop(P)) stop(); if (busy && fox) fox.visible = false;   // the fixed game view: you are the hands, not the body in the way
    if (G.visible) { dripTex.offset.y -= dt * 0.6; if (!busy) beltTex.offset.x += dt * 0.3;
      if (busy === 'belt' && BL) beltTick(dt); else if (busy === 'deco' && DC) decoTick(dt);
      { const tw = cocoa, dx = P.x - tw.position.x, dz = P.z - tw.position.z, dd = Math.hypot(dx, dz), look = dd < 5 && !busy ? Math.atan2(dx, dz) : Math.sin(t * 0.6 + tw.position.x) * 0.2; tw.rotation.y += Math.atan2(Math.sin(look - tw.rotation.y), Math.cos(look - tw.rotation.y)) * Math.min(1, dt * 3); kit.animFox && kit.animFox(tw, dt, 0);
        const A = tw.userData.P && tw.userData.P.arms; if (A && dd > 3 && !busy) { A[1].rotation.x = -0.9 + Math.sin(t * 5) * 0.12; A[1].rotation.z = 0.25 + Math.cos(t * 5) * 0.12; } }   // Cocoa stirs a pot until you come close
      startRings.forEach(m => { m.visible = !busy; m.scale.setScalar(1 + Math.sin(t * 3) * 0.04); }); hintTick(t);
      for (const f of custFox) if (f.visible) { f.rotation.y = Math.PI + Math.sin(t * 1.3) * 0.15; kit.animFox && kit.animFox(f, dt, 0); } }
    if (fox && save.count('chefHat') && (!hat || !(() => { for (let p = hat.parent; p; p = p.parent) if (p === fox) return true; return false; })())) { hat = hatMesh(1.15); onHead(fox, hat); }   // s45: re-attach after a tailor outfit swap
    if (hat) hat.visible = inShop(P) && !P.car;
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, belt: () => BL, deco: () => DC, items, startBelt, startDeco, cocoa, bean, tapAt(x, y) { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); if (busy) (busy === 'belt' ? beltTap : decoTap)(ray.ray); },
    project(v) { const p = v.clone().project(camera); return [(p.x + 1) / 2 * innerWidth, (1 - p.y) / 2 * innerHeight]; }, kit: K, hint: () => HINT.style.display !== 'none', dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__chocs = API; return API;
}
