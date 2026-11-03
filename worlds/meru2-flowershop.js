// MERU 2.0 — s43 TOWN 2 INTERIOR 1: the FLOWER SHOP [meruFlowers] (f 172..184 × -46..-34, door W at (172, -40)).
// FLORA runs it: flower crown, pink dress, dreamy, talks to her plants, and SENDS SUNSHINE to whoever she talks to (a sun over your head +
// golden sparkles from her to you). MINIGAME 1 · ARRANGE (3D, in the shop): ring the bell → an ORDER CARD (customer, who it is for, stems
// wanted). Walk the bucket racks (E = pick 1 stem, carry up to 3), drop them in the vase on the counter, tie the ribbon, ring the bell to
// serve. 3 orders a round, each a little bigger; a gentle timer (a late customer just leaves). Gold per order + a Flora gift per full round
// (flower crown first, then healing bouquet / seed pouch / lucky clover). Fun, easy, pretty. MINIGAME 2 · DELIVER (flower bike) = next session.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildFlowerShop({ THREE, scene, kit, cols, save, touch, sayTo, L, camera, hour, isMuted }) {
  const X0 = 172.4, X1 = 183.6, Z0 = -45.6, Z1 = -34.4, CX = 178, CZ = -40;
  const G = new THREE.Group(); G.name = 'flowerShop'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const pos = [], nor = [], col = [];
  const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
    const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
  const box = (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz);
  const cyl = (r0, r1, h, hex, x, y, z, seg = 10) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex);
  const sph = (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const INK = '#201e1d', WOOD = '#b08b5e', PINK = '#f2a6c0', LEAF = '#4f8a3a', STEM = '#3f7a35';
  // ---------- flowers ----------
  const TYPES = [
    { key: 'rose', name: 'RED ROSES', one: 'RED ROSE', c: '#d4213a', at: [174.6, -44.9], side: -1 },
    { key: 'tulip', name: 'YELLOW TULIPS', one: 'YELLOW TULIP', c: '#ffd23a', at: [176.6, -44.9], side: -1 },
    { key: 'lily', name: 'WHITE LILIES', one: 'WHITE LILY', c: '#f6f3ec', at: [178.4, -44.9], side: -1 },
    { key: 'peony', name: 'PINK PEONIES', one: 'PINK PEONY', c: '#f29ab8', at: [174.6, -35.1], side: 1 },
    { key: 'iris', name: 'PURPLE IRISES', one: 'PURPLE IRIS', c: '#7c4dc4', at: [176.6, -35.1], side: 1 },
    { key: 'marigold', name: 'ORANGE MARIGOLDS', one: 'ORANGE MARIGOLD', c: '#f97316', at: [178.4, -35.1], side: 1 }];
  const bloom = (t, x, y, z, k = 1) => { const c = t.c;
    if (t.key === 'rose') { sph(0.11 * k, c, x, y, z, 1, 0.85, 1); sph(0.07 * k, '#a8162c', x, y + 0.05 * k, z); }
    else if (t.key === 'tulip') { put(new THREE.CylinderGeometry(0.09 * k, 0.05 * k, 0.16 * k, 7), x, y, z, c); }
    else if (t.key === 'lily') { for (let i = 0; i < 3; i++) put(new THREE.ConeGeometry(0.05 * k, 0.18 * k, 5), x + Math.sin(i * 2.1) * 0.05 * k, y + 0.03, z + Math.cos(i * 2.1) * 0.05 * k, c, i * 2.1, 0.9, 0); sph(0.03 * k, '#ffd23a', x, y + 0.02, z); }
    else if (t.key === 'peony') { sph(0.14 * k, c, x, y, z, 1, 0.8, 1); sph(0.09 * k, '#f7c3d5', x, y + 0.06 * k, z); }
    else if (t.key === 'iris') { for (let i = 0; i < 3; i++) box(0.05 * k, 0.16 * k, 0.1 * k, c, x + Math.sin(i * 2.1) * 0.05 * k, y, z + Math.cos(i * 2.1) * 0.05 * k, i * 2.1, 0.4); sph(0.03 * k, '#ffd23a', x, y + 0.05, z); }
    else { put(new THREE.CylinderGeometry(0.12 * k, 0.12 * k, 0.04 * k, 10), x, y, z, c); sph(0.045 * k, '#9a3a0a', x, y + 0.02, z); } };
  // ---------- room: wood floor, pink lower walls, bucket racks, counter, back shelves, hanging plants, string lights, sun sign ----------
  box(X1 - X0, 0.04, Z1 - Z0, WOOD, CX, 0.06, CZ); for (let x = X0 + 0.6; x < X1; x += 0.6) box(0.02, 0.045, Z1 - Z0, '#9a7550', x, 0.065, CZ);
  for (const [z, d] of [[Z0 + 0.03, 1], [Z1 - 0.03, -1]]) { box(X1 - X0, 1.0, 0.04, PINK, CX, 0.6, z); box(X1 - X0, 0.08, 0.06, '#f3f2f2', CX, 1.12, z + d * 0.02); }
  box(0.04, 1.0, Z1 - Z0, PINK, X1 - 0.03, 0.6, CZ); box(0.06, 0.08, Z1 - Z0, '#f3f2f2', X1 - 0.05, 1.12, CZ);
  for (const t of TYPES) { const [x, z] = t.at; box(1.6, 0.35, 0.8, '#9a7550', x, 0.25, z); cyl(0.32, 0.26, 0.55, '#8d9298', x, 0.7, z, 12); cyl(0.33, 0.33, 0.04, '#b9bec2', x, 0.98, z, 12);
    for (let i = 0; i < 10; i++) { const a = i * 0.75, r = i ? 0.14 + (i % 2) * 0.08 : 0, bx = x + Math.cos(a) * r, bz = z + Math.sin(a) * r, h = 1.25 + (i % 3) * 0.14; cyl(0.014, 0.014, h - 0.9, STEM, bx, 0.9 + (h - 0.9) / 2, bz, 4); bloom(t, bx, h, bz, 1.55); if (i % 2) box(0.12, 0.02, 0.06, LEAF, bx + 0.05, 1.05, bz, a); }
    rect(x - 0.8, x + 0.8, z - 0.4, z + 0.4); }
  box(1.0, 1.05, 6.4, '#9a7550', 179.5, 0.55, CZ - 0.2); box(1.2, 0.06, 6.6, '#f3f2f2', 179.5, 1.1, CZ - 0.2); for (let z = -43; z < -37; z += 0.5) box(0.03, 0.9, 0.05, '#7a5c40', 178.98, 0.5, z);
  rect(179.0, 180.0, -43.4, -37.0);
  box(0.4, 2.6, 8, '#9a7550', X1 - 0.25, 1.4, CZ); for (const y of [1.2, 2.0, 2.8]) { box(0.6, 0.06, 8, '#f3f2f2', X1 - 0.4, y, CZ); for (let z = -43.5; z <= -36.5; z += 1.0) { cyl(0.14, 0.11, 0.24, ['#b0623f', '#f3f2f2', '#2e86b8'][Math.round(z + y) & 1 ? 0 : 1], X1 - 0.4, y + 0.15, z, 8); sph(0.17, [LEAF, '#3f9a5e', TYPES[(Math.round(z * 3 + y) % 6 + 6) % 6].c][Math.round(z * 2 + y * 3) % 3 < 0 ? 0 : Math.round(z * 2 + y * 3) % 3], X1 - 0.4, y + 0.4, z); } }
  rect(X1 - 0.7, X1, -44, -36);
  for (const [x, z] of [[174.5, -41.5], [176.5, -38.5], [181.5, -43.5], [181.5, -36.5], [175.5, -44]]) { const y = 3.6; cyl(0.006, 0.006, 1.0, INK, x, y + 0.5, z, 3); cyl(0.22, 0.16, 0.25, '#b0623f', x, y, z, 8); for (let i = 0; i < 6; i++) { const a = i * 1.05; box(0.06, 0.4, 0.04, LEAF, x + Math.cos(a) * 0.18, y - 0.25, z + Math.sin(a) * 0.18, a, 0.3); } sph(0.2, '#3f9a5e', x, y + 0.15, z); }
  const lights = []; for (let i = 0; i <= 14; i++) { const t = i / 14, x = X0 + 0.3 + t * (X1 - X0 - 0.6), y = 4.2 - Math.sin(t * Math.PI) * 0.45; lights.push([x, y, Z0 + 0.25], [x, y, Z1 - 0.25]); }
  // planters by the window bench + a sun mosaic on the back wall over Flora
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere();
  G.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const lg = new THREE.SphereGeometry(0.05, 6, 4), lm = new THREE.MeshBasicMaterial({ color: 0xffe9a8 }), im = new THREE.InstancedMesh(lg, lm, lights.length), M4 = new THREE.Matrix4(); lights.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); G.add(im); }
  const sunTex = CT(256, 256, (g2, w) => { const c = w / 2; const gr = g2.createRadialGradient(c, c, 10, c, c, c); gr.addColorStop(0, 'rgba(255,240,170,1)'); gr.addColorStop(0.35, 'rgba(255,210,58,0.95)'); gr.addColorStop(0.6, 'rgba(255,190,40,0.35)'); gr.addColorStop(1, 'rgba(255,190,40,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, w, w);
    g2.fillStyle = 'rgba(255,214,70,0.9)'; for (let i = 0; i < 12; i++) { g2.save(); g2.translate(c, c); g2.rotate(i * Math.PI / 6); g2.beginPath(); g2.moveTo(-9, -52); g2.lineTo(0, -118); g2.lineTo(9, -52); g2.closePath(); g2.fill(); g2.restore(); }
    g2.fillStyle = '#ffd23a'; g2.beginPath(); g2.arc(c, c, 44, 0, 7); g2.fill(); g2.fillStyle = '#201e1d'; for (const s of [-1, 1]) { g2.beginPath(); g2.arc(c + s * 15, c - 6, 5, 0, 7); g2.fill(); } g2.lineWidth = 5; g2.strokeStyle = '#201e1d'; g2.beginPath(); g2.arc(c, c + 4, 18, 0.2, Math.PI - 0.2); g2.stroke(); });
  { const s = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), new THREE.MeshBasicMaterial({ map: sunTex, transparent: true, depthWrite: false })); s.position.set(X1 - 0.2, 3.7, CZ); s.rotation.y = -Math.PI / 2; G.add(s);
    const nm = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.7), new THREE.MeshBasicMaterial({ map: CT(512, 86, (g2, w, h) => { g2.fillStyle = '#f3f2f2'; g2.fillRect(0, 0, w, h); g2.fillStyle = '#c2456a'; g2.fillRect(0, 0, 14, h); g2.fillStyle = '#201e1d'; g2.font = '900 52px Archivo, sans-serif'; g2.textBaseline = 'middle'; g2.fillText("FLORA'S FLOWERS", 30, h / 2 + 3); }) }));
    nm.position.set(X1 - 0.18, 4.75, CZ); nm.rotation.y = -Math.PI / 2; G.add(nm); }
  // bucket name tags (one canvas), the counter: vase, ribbon reel, wrap paper, brass bell
  const tagTex = CT(512, 384, (g2, w, h) => { TYPES.forEach((t, i) => { const y = i * 64; g2.fillStyle = '#f3f2f2'; g2.fillRect(0, y, w, 64); g2.fillStyle = t.c; g2.fillRect(0, y, 40, 64); g2.fillStyle = '#201e1d'; g2.font = '900 36px Archivo, sans-serif'; g2.textBaseline = 'middle'; g2.fillText(t.name, 54, y + 34); }); });
  TYPES.forEach((t, i) => { const pg = new THREE.PlaneGeometry(1.4, 0.18), uv = pg.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - (i + 1 - uv.getY(k)) / 6); const m = new THREE.Mesh(pg, new THREE.MeshBasicMaterial({ map: tagTex })); m.position.set(t.at[0], 0.32, t.at[1] - t.side * 0.42); m.rotation.y = t.side > 0 ? Math.PI : 0; G.add(m); });
  const vase = new THREE.Group(); vase.position.set(179.45, 1.13, -40.8); G.add(vase);
  { const vm = new THREE.MeshPhongMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.45, shininess: 90 }); const v = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.12, 0.42, 14, 1, true), vm); v.position.y = 0.21; vase.add(v); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.115, 0.26, 14), new THREE.MeshBasicMaterial({ color: 0x8fd0f0, transparent: true, opacity: 0.4 })); w.position.y = 0.13; vase.add(w); }
  const wrap = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.75, 12, 1, true), new THREE.MeshLambertMaterial({ color: 0xe8d6b0, side: THREE.DoubleSide })); wrap.rotation.x = Math.PI; wrap.position.y = 0.55; wrap.visible = false; vase.add(wrap);
  const bow = new THREE.Group(); bow.position.y = 0.36; bow.visible = false; vase.add(bow); { const bm = new THREE.MeshLambertMaterial({ color: 0xec3013 }); for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 5, 10), bm); l.position.set(s * 0.08, 0, 0.17); l.rotation.y = s * 0.4; bow.add(l); } const k = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), bm); k.position.z = 0.18; bow.add(k); }
  const STEMS = [], bloomM = TYPES.map(t => new THREE.MeshLambertMaterial({ color: t.c })), stemM = new THREE.MeshLambertMaterial({ color: STEM }), sg = new THREE.CylinderGeometry(0.012, 0.012, 0.7, 4), bg = new THREE.SphereGeometry(0.1, 8, 6);
  for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.03 + (i % 4) * 0.025, s = new THREE.Group(); const st = new THREE.Mesh(sg, stemM); st.position.y = 0.35; s.add(st); const b = new THREE.Mesh(bg, bloomM[0]); b.position.y = 0.72 + (i % 3) * 0.07; b.scale.set(1, 0.8, 1); s.add(b); s.position.set(Math.cos(a) * r, 0.05, Math.sin(a) * r); s.rotation.set(Math.sin(a) * 0.28, 0, Math.cos(a) * 0.28); s.visible = false; vase.add(s); STEMS.push({ s, b }); }
  { const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.14, 14), new THREE.MeshLambertMaterial({ color: 0xec3013 })); reel.rotation.x = Math.PI / 2; reel.position.set(179.45, 1.3, -38.4); G.add(reel); const ax = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.24), new THREE.MeshLambertMaterial({ color: 0x9a7550 })); ax.position.set(179.45, 1.27, -38.4); G.add(ax);
    const paper = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.6), new THREE.MeshLambertMaterial({ color: 0xe8d6b0 })); paper.position.set(179.6, 1.16, -39.4); paper.rotation.y = 0.3; G.add(paper); }
  const bell = new THREE.Group(); bell.position.set(179.45, 1.13, -42.5); G.add(bell); { const bm = new THREE.MeshPhongMaterial({ color: 0xd9a838, shininess: 80 }); const d = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), bm); d.position.y = 0.04; bell.add(d); const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 14), new THREE.MeshLambertMaterial({ color: 0x3d3b3a })); bell.add(pl); const nb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), bm); nb.position.y = 0.19; bell.add(nb); }
  // ---------- Flora + customers ----------
  const flora = kit.makeFox({ key: 'flora', torso: ['#ffb3cc', '#f29ab8', '#d97a9c'], outfit: 'dress', mood: 'happy', eyes: ['#3f9a5e', '#3f9a5e'] }); flora.position.set(181.6, 0, CZ); flora.rotation.y = -Math.PI / 2; G.add(flora); ringC(181.6, CZ, 0.5);
  { const crown = new THREE.Group(); let hy = 1.9; const bb = new THREE.Box3().setFromObject(flora); hy = bb.max.y - flora.position.y - 0.62; crown.position.set(0, hy, 0.02);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 5, 16), new THREE.MeshLambertMaterial({ color: 0x4f8a3a })); tor.rotation.x = Math.PI / 2; crown.add(tor);
    const FC = [0xf29ab8, 0xffd23a, 0xf6f3ec, 0xd4213a, 0x7c4dc4, 0xf97316, 0xf29ab8, 0xffd23a]; FC.forEach((c, i) => { const a = i / FC.length * Math.PI * 2, f = new THREE.Mesh(new THREE.SphereGeometry(0.055, 7, 5), new THREE.MeshLambertMaterial({ color: c })); f.position.set(Math.cos(a) * 0.2, 0.02, Math.sin(a) * 0.2); crown.add(f); });
    flora.add(crown); }
  const floraT = { key: 'flora', obj: flora, ry: -Math.PI / 2, r: 3.8, name: 'FLORA', role: 'FLORIST' };
  const CUST = [
    { name: 'NURSE POPPY', fav: 1, forW: 'for the Hospital ward', say: 'Something to cheer up my patients!', look: ['#f3f2f2', '#d8d2c8', '#9aa0a6'] },
    { name: 'MR. TUCK', fav: 0, forW: 'for his wife, their anniversary', say: "Red ones. She loves red ones. I think.", look: ['#2e4a6b', '#22374f', '#16243a'] },
    { name: 'GRAN HAZEL', fav: 5, forW: 'for her birthday table', say: 'Bright, dear. I am ninety, not dull!', look: ['#7c4dc4', '#5e3a96', '#3d2563'] },
    { name: 'CURATOR BELL', fav: 2, forW: 'for the Museum opening', say: 'Elegant, please. Very elegant.', look: ['#201e1d', '#3d3b3a', '#5a5654'] },
    { name: 'SKIP', fav: 4, forW: 'for the skate park crush', say: "Don't tell anyone these are from me.", look: ['#ffd23a', '#d9a400', '#8a6a00'] },
    { name: 'RANGER MOSS', fav: 3, forW: 'for the Nature Office desk', say: 'Wild-looking ones, if you can.', look: ['#3f6a3a', '#2e4f2a', '#1e331c'] }];
  let K = null;
  const custFox = CUST.map((c, i) => { const f = kit.makeFox({ key: 'cust' + i, torso: c.look, outfit: i % 2 ? 'coat' : 'vest', mood: 'happy' }); f.position.set(176.4, 0, -37.7); f.rotation.y = Math.atan2(179 - 176.4, -40.8 + 37.7); f.visible = false; G.add(f); return f; });
  // ---------- s63 INTERIOR RULES via the shared shop kit ----------
  K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'flora', color: '#c2456a', boardTitle: "Flora's best",
    room: { X0, X1, Z0, Z1 }, door: [172.9, -40], keeper: flora, keeperRy: -Math.PI / 2,
    games: [{ k: 'arrange', name: 'Arrange', color: '#c2456a' }, { k: 'deliver', name: 'Deliveries', color: '#3f9a5e' }],
    board: { x: 172.47, y: 2.3, z: -36.6, ry: Math.PI / 2, w: 1.3 }, hiring: { x: 173.2, z: -43.2, ry: Math.PI / 2 }, hiringLine: 'ARRANGE BOUQUETS',
    sun: [{ x: 174.4, z: -42.4, w: 3.0, d: 1.5 }, { x: 174.4, z: -37.6, w: 3.0, d: 1.5 }],
    lamps: lights.filter((_, i) => i % 4 === 0),
    browse: TYPES.map(t => [t.at[0], t.at[1] - t.side * 1.05, t.side > 0 ? 0 : Math.PI]),
    looks: [['#e8d6b0', '#c9b48a', '#8a7450'], ['#2e86b8', '#22648a', '#16435c']], clock: { x: X1 - 0.12, y: 3.75, z: -43.3, ry: -Math.PI / 2 } });
  // ---------- sunshine: a smiling sun over the player + golden sparkles from Flora ----------
  const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: sunTex, transparent: true, depthWrite: false, opacity: 0 })); sunS.scale.set(1.1, 1.1, 1); scene.add(sunS);
  const spT = CT(64, 64, (g2, w) => { const gr = g2.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.4, 'rgba(255,214,70,0.8)'); gr.addColorStop(1, 'rgba(255,214,70,0)'); g2.fillStyle = gr; g2.fillRect(0, 0, w, w); });
  const sparks = []; for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: spT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.scale.setScalar(0.28); scene.add(s); sparks.push({ s, ph: i / 10 }); }
  let sun = 0;
  const shine = (sec = 7) => { sun = Math.max(sun, sec); };
  // ---------- game state ----------
  const SPOTS = [...TYPES.map((t, i) => ({ key: 'b' + i, t, x: t.at[0], z: t.at[1] - t.side * 1.0, r: 0.95 })), { key: 'vase', x: 178.2, z: -40.8, r: 1.0 }, { key: 'ribbon', x: 178.2, z: -38.4, r: 0.9 }, { key: 'bell', x: 178.2, z: -42.6, r: 0.9 }];
  let S = null, toastTxt = '', toastT = 0, talked = 0;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  const pickCust = n => { const used = new Set(); return Array.from({ length: n }, () => { let i; do i = Math.floor(Math.random() * CUST.length); while (used.has(i) && used.size < CUST.length); used.add(i); return i; }); };
  const makeOrder = (k, fav) => { const nT = [1, 2, 3][k], idx = [fav, ...TYPES.map((_, i) => i).filter(i => i !== fav).sort(() => Math.random() - 0.5)].slice(0, nT); const want = {}; idx.forEach((i, j) => { want[i] = k === 0 ? 3 : k === 1 ? 2 : [2, 1, 2][j]; }); const stems = Object.values(want).reduce((a, b) => a + b, 0); return { want, have: {}, stems, time: 50 + stems * 9, left: 50 + stems * 9, ribbon: false }; };
  const clearVase = () => { STEMS.forEach(q => { q.s.visible = false; }); bow.visible = false; wrap.visible = false; };
  const showVase = O => { let n = 0; for (const [i, c] of Object.entries(O.have)) for (let k = 0; k < c && n < STEMS.length; k++) { STEMS[n].s.visible = true; STEMS[n].b.material = bloomM[i]; n++; } for (; n < STEMS.length; n++) STEMS[n].s.visible = false; bow.visible = O.ribbon; };
  const startRound = () => { const cs = pickCust(3); S = { k: 0, cs, orders: [0, 1, 2].map(k => makeOrder(k, CUST[cs[k]].fav)), hand: {}, gold: 0, served: 0, bellT: 0 }; nextCust(); toast('ORDER 1 OF 3'); };
  const nextCust = () => { custFox.forEach(f => { f.visible = false; }); clearVase(); if (S && S.k < 3) custFox[S.cs[S.k]].visible = true; };
  const handCount = () => Object.values(S.hand).reduce((a, b) => a + b, 0);
  const done = O => Object.entries(O.want).every(([i, n]) => (O.have[i] || 0) === n);
  const finishOrder = (ok) => { const O = S.orders[S.k]; if (ok) { const g2 = O.stems * 8 + Math.ceil(O.left / 4); S.gold += g2; S.served++; save.addGold(g2); toast('SERVED · +' + g2 + ' GOLD', 2.4); shine(4); wrap.visible = true; }
    else toast(CUST[S.cs[S.k]].name + ' HAD TO GO · NEXT ORDER', 2.6);
    S.hand = {}; S.k++; S.bellT = ok ? 1.6 : 0.2; };
  const GIFTS = [['flowerCrown', 'FLOWER CROWN'], ['healingBouquet', 'HEALING BOUQUET'], ['seedPouch', 'SEED POUCH'], ['luckyClover', 'LUCKY CLOVER']];
  const giveGift = () => { const clears = save.stat('floraClears', 0), gift = !save.count('flowerCrown') ? GIFTS[0] : GIFTS[1 + (clears % 3)]; save.give(gift[0]); save.setStat('floraClears', clears + 1); return gift; };
  const endRound = () => { const full = S.served === 3; let gift = null;
    if (full) gift = giveGift();
    save.best('floraBestGold', S.gold); if (S.served) K.finish('arrange', S.served, S.gold, !save.stat('floraStar_arrange', 0)); const lines = full ? [{ who: 'npc', text: 'All three, every petal happy! Here, a ' + gift[1].toLowerCase() + ', grown with extra sun.' }]
      : S.served ? [{ who: 'npc', text: S.served + ' happy customers! The tulips say you have lovely hands.' }] : [{ who: 'npc', text: 'The flowers are patient. So am I. Try again, sunshine.' }];
    toast(full ? 'ROUND CLEAR · +' + S.gold + ' GOLD · ' + gift[1] : 'ROUND OVER · +' + S.gold + ' GOLD', 3.5); S = null; nextCust(); custFox.forEach(f => { f.visible = false; }); shine(8); sayTo(floraT, lines); };
  // ---------- order card (Modernist: white, 2px ink rule, red bar, flush left) ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:200px;width:min(58vw,260px);max-height:calc(100vh - 340px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; card.style.top = short ? '96px' : '200px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : 'calc(100vh - 340px)'; card.style.fontSize = short ? '12px' : ''; card.style.zoom = short ? '0.85' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const drawCard = () => { if (R) return; if (!S || S.k >= 3) { if (card.style.display !== 'none') card.style.display = 'none'; cardKey = ''; return; } const O = S.orders[S.k], C = CUST[S.cs[S.k]], hc = handCount();
    const rows = Object.entries(O.want).map(([i, n]) => { const h = O.have[i] || 0, t = TYPES[i]; return '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + t.c + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + n + ' ' + t.name + '</span><span style="font-weight:900;font-size:15px;color:' + (h === n ? '#3f7a52' : '#201e1d') + '">' + h + '/' + n + '</span></div>'; }).join('');
    const hand = hc ? Object.entries(S.hand).filter(([, n]) => n).map(([i, n]) => n + ' ' + (n > 1 ? TYPES[i].name : TYPES[i].one)).join(', ') : 'nothing';
    const step = !done(O) ? 'PICK STEMS · PUT THEM IN THE VASE' : !O.ribbon ? 'TIE THE RIBBON' : 'RING THE BELL TO SERVE', pct = Math.max(0, O.left / O.time);
    const key = [S.k, JSON.stringify(O.have), O.ribbon, hand, Math.ceil(O.left)].join('|'); if (key === cardKey) return; cardKey = key;
    card.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>ORDER ' + (S.k + 1) + ' OF 3</span><span>' + Math.ceil(O.left) + ' S</span></div>' +
      '<div style="height:4px;background:#cfcac3"><div style="height:4px;width:' + (pct * 100).toFixed(1) + '%;background:' + (pct < 0.25 ? '#ec3013' : '#3f7a52') + '"></div></div>' +
      '<div style="padding:8px 10px 10px"><div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' + rows +
      '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:#ec3013;border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">RIBBON</span><span style="font-weight:900;font-size:15px;color:' + (O.ribbon ? '#3f7a52' : '#201e1d') + '">' + (O.ribbon ? 'TIED' : '—') + '</span></div>' +
      '<div style="border-top:2px solid #201e1d;margin-top:6px;padding-top:6px;font-size:12px"><b>IN HAND:</b> ' + hand + (hc >= 3 ? ' (full)' : '') + '</div><div style="font-size:12px;font-weight:900;color:#ec3013;margin-top:4px">NEXT: ' + step + '</div></div>';
    card.style.display = 'block'; };
  // ---------- per-frame + interaction ----------
  const near = P => { let best = null, bd = 1e9; for (const s of SPOTS) { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < s.r && d < bd) { bd = d; best = s; } } return best; };
  const inShop = P => P.x > X0 - 0.2 && P.x < X1 && P.z > Z0 && P.z < Z1 && P.y < 2;
  const nearFlora = P => Math.hypot(P.x - 181.6, P.z - CZ) < floraT.r;
  function prompt(P) { const bp = bikePrompt(P); if (bp !== undefined) return bp; if (!inShop(P)) return null; const s = near(P);
    if (S && S.k < 3 && S.bellT <= 0) { const O = S.orders[S.k], hc = handCount();
      if (s && s.t) { const i = TYPES.indexOf(s.t); return hc >= 3 ? 'HANDS FULL · GO TO THE VASE' : 'PICK · ' + s.t.one + (O.want[i] ? '' : ' (not on the card)'); }
      if (s && s.key === 'vase') return hc ? 'PUT ' + hc + ' IN THE VASE' : done(O) ? null : 'THE VASE · BRING STEMS';
      if (s && s.key === 'ribbon') return done(O) ? (O.ribbon ? null : 'TIE THE RIBBON') : 'RIBBON · FINISH THE STEMS FIRST';
      if (s && s.key === 'bell') return done(O) && O.ribbon ? 'RING THE BELL · SERVE' : 'BELL · ORDER NOT READY';
      return null; }
    if (!S && !R && K.atHiring(P)) return 'NOW HIRING · START WORK';
    if (!S && s && s.key === 'bell') return 'RING THE BELL · TAKE AN ORDER';
    if (!S && nearFlora(P)) return 'TALK · FLORA';
    return null; }
  function talk(P) { const bt = bikeTalk(P); if (bt) return true; if (!inShop(P)) return false; const s = near(P);
    if (S && S.k < 3) { if (S.bellT > 0) return true; const O = S.orders[S.k], hc = handCount();
      if (s && s.t) { const i = TYPES.indexOf(s.t); if (hc >= 3) { toast('HANDS FULL · TAKE THEM TO THE VASE'); return true; } if (!O.want[i]) { toast('THAT ONE IS NOT ON THE CARD'); return true; }
        if ((O.have[i] || 0) + (S.hand[i] || 0) >= O.want[i]) { toast('YOU HAVE ENOUGH ' + s.t.name); return true; } S.hand[i] = (S.hand[i] || 0) + 1; toast('+1 ' + s.t.one, 1.2); return true; }
      if (s && s.key === 'vase') { if (!hc) return true; for (const [i, n] of Object.entries(S.hand)) O.have[i] = (O.have[i] || 0) + n; S.hand = {}; showVase(O); toast(done(O) ? 'ALL STEMS IN · TIE THE RIBBON' : 'IN THE VASE', 1.6); return true; }
      if (s && s.key === 'ribbon') { if (done(O) && !O.ribbon) { O.ribbon = true; showVase(O); toast('RIBBON TIED · RING THE BELL', 1.8); } return true; }
      if (s && s.key === 'bell') { if (done(O) && O.ribbon) { ding(); finishOrder(true); } else toast('NOT READY YET'); return true; }
      return false; }
    if (!R && K.atHiring(P)) { ding(); startRound(); return true; }
    if (s && s.key === 'bell') { ding(); startRound(); return true; }
    if (nearFlora(P)) { shine(9); const first = !talked++; floraMenu(first); return true; }
    return false; }
  const HELLO = ['Hello, sunshine! The lilies said you were coming. Help me with some bouquets?', 'Sunshine for you, sunshine for the peonies. Ready to work?', 'Shh, the tulips are napping. Want an order, or a ride on the bike?', 'Back again! The roses perked up when you walked in.'];
  const FACTS = ['Sunflowers turn to follow the sun. Like me!', 'Tulips keep growing in the vase, up to an inch!', 'A rose is a cousin of the apple. Smell one and see.', 'Bees love purple best. That is why I wear pink: no stings.'];
  const floraMenu = first => sayTo(floraT, [{ who: 'npc', text: first ? HELLO[0] : HELLO[1 + (talked % 3)], choices: [
    { text: CHOICE_WORK, pick: () => { if (!S && !R) { ding(); startRound(); } } },
    { text: 'FLOWER DELIVERIES', pick: () => { if (!S && !R) startRun(); } },
    { text: 'TELL ME A FLOWER FACT', pick: () => { shine(5); sayTo(floraT, [{ who: 'npc', text: FACTS[talked % FACTS.length] }]); } },
    { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  let ac = null; const ding = () => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime; for (const [f, k] of [[1568, 0.08], [2093, 0.05]]) { const o = ac.createOscillator(), gn = ac.createGain(); o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 1.2); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + 1.2); } } catch (e) {} };
  let bellK = 0;
  function tick(dt, P, fox) { bikeTick(dt, P, fox); const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt;
    if (S) { if (S.bellT > 0) { S.bellT -= dt; if (S.bellT <= 0) { if (S.k >= 3) endRound(); else { nextCust(); toast('ORDER ' + (S.k + 1) + ' OF 3'); } } }
      else if (S.k < 3) { const O = S.orders[S.k]; if (inShop(P) || d < 30) O.left -= dt; if (O.left <= 0) finishOrder(false); }
      if (S && !inShop(P) && d > 30) { toast('YOU LEFT THE SHOP · ROUND ENDED'); S = null; custFox.forEach(f => { f.visible = false; }); clearVase(); } }
    drawCard(); bellK = Math.max(0, bellK - dt);
    sun = Math.max(0, sun - dt); const on = sun > 0 && d < 14, a = on ? Math.min(1, sun / 1.2) : 0; sunS.material.opacity += (a - sunS.material.opacity) * Math.min(1, dt * 5); sunS.visible = sunS.material.opacity > 0.01;
    if (sunS.visible) { sunS.position.set(P.x, P.y + 2.75 + Math.sin(t * 2) * 0.08, P.z); const k = 1.0 + Math.sin(t * 3) * 0.08; sunS.scale.set(k, k, 1); sunS.material.rotation = t * 0.3; }
    for (const sp of sparks) { const u = (t * 0.45 + sp.ph) % 1, fx = 181.6, fy = 1.7, fz = CZ, tx = P.x, ty = P.y + 2.4, tz = P.z; sp.s.visible = sunS.visible; if (!sp.s.visible) continue;
      sp.s.position.set(fx + (tx - fx) * u, fy + (ty - fy) * u + Math.sin(u * Math.PI) * 0.8, fz + (tz - fz) * u + Math.sin(u * 9 + sp.ph * 6) * 0.15); sp.s.material.opacity = sunS.material.opacity * Math.sin(u * Math.PI); }
    K.tick(dt, P, { inShop: inShop(P), busy: !!S || !!R, near: d, talking: sun > 6.5 }); }
  // ================= DELIVER · the FLOWER BIKE (Ben, s43): pink bike + wicker basket parked by the greenhouse porch; DELIVERY BOARD = take 3 bouquets
  // for 3 doors (any order). Bouquets wilt as time passes; a bump throws petals (freshness down, bike keeps going). At each door a customer waves +
  // tips. Back at the porch: Flora's sunshine + gold (+ her gift when all 3 arrived fresh enough to count). After the first run the bike is free to ride.
  const PARK = { x: 168.6, z: -33.2, yaw: -Math.PI / 2 }, BOARD = { x: 168.9, z: -46.4 };
  const DOOR_KEYS = [['extramv4l8oxs', 'Meru Hospital'], ['extramv4lbt6h', 'Meru Motel'], ['extramv4lc8mr', 'History Museum'], ['extramv4kojov', 'Nature Office'], ['extramv4lce16', 'Country Club'], ['extramv4m7583', 'Post Office'], ['extramv4iruy4', "Foxes' Chocolates"], ['extramv4inbym', 'Tailor Shop'], ['extramv4ird5f', 'Barber Shop'], ['extramv4it4hx', 'Pie Shop'], ['extramv4koqiu', 'Hobby Shop'], ['itemshop', 'Item Shop'], ['armory', 'Armory'], ['bank', 'Bank'], ['tavern', 'Tavern']];
  const FN = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] }, DOORS = DOOR_KEYS.map(([k, label]) => { const b = (L && L.BUILDINGS || []).find(q => q.key === k); if (!b || !b.door) return null; const n = FN[b.face] || [0, 1]; return { label, x: b.door[0] + n[0] * 2.6, z: b.door[1] + n[1] * 2.6, yaw: Math.atan2(n[0], n[1]) }; }).filter(Boolean);
  const WHO = ['NURSE POPPY', 'THE NIGHT CLERK', 'DR. FENN', 'MRS. ALDER', 'BRAM', 'OLD WREN', 'MISS JUNE', 'A SHY FOX', 'THE COOK', 'CAPTAIN TOR'];
  const BK = new THREE.Group(); BK.name = 'flowerBike'; scene.add(BK);
  { const pm = new THREE.MeshLambertMaterial({ color: 0xf29ab8 }), dm = new THREE.MeshLambertMaterial({ color: 0x201e1d }), cm = new THREE.MeshLambertMaterial({ color: 0xc9ced3 }), wk = new THREE.MeshLambertMaterial({ color: 0xc9a36b }), M2 = (g2, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const o = new THREE.Mesh(g2, m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); BK.add(o); return o; };
    BK.userData.wheels = [0.62, -0.62].map(z => { const w = new THREE.Group(); w.position.set(0, 0.36, z); BK.add(w); const t = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.045, 6, 18), dm); t.rotation.y = Math.PI / 2; w.add(t); for (let i = 0; i < 4; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.62, 0.02), cm); s.rotation.x = i * Math.PI / 4; w.add(s); } return w; });
    M2(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 6), pm, 0, 0.62, 0.05, 1.1); M2(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 6), pm, 0, 0.62, -0.32, 0.25); M2(new THREE.CylinderGeometry(0.03, 0.03, 0.62, 6), pm, 0, 0.62, 0.55, -0.25);
    M2(new THREE.BoxGeometry(0.2, 0.06, 0.3), dm, 0, 0.95, -0.38); M2(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 6), cm, 0, 1.05, 0.55, 0, 0, Math.PI / 2); for (const s of [-1, 1]) M2(new THREE.CylinderGeometry(0.03, 0.03, 0.12, 6), dm, s * 0.3, 1.05, 0.55, 0, 0, Math.PI / 2);
    M2(new THREE.CylinderGeometry(0.26, 0.2, 0.3, 10, 1, true), wk, 0, 1.0, 0.86).material.side = THREE.DoubleSide; M2(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 10), wk, 0, 0.86, 0.86);
    const BQ = [0xd4213a, 0xffd23a, 0xf6f3ec, 0xf29ab8, 0x7c4dc4, 0xf97316]; BK.userData.bq = [0, 1, 2].map(i => { const q = new THREE.Group(); q.position.set((i - 1) * 0.13, 1.08, 0.86 + (i % 2) * 0.06); const wr = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.3, 8, 1, true), new THREE.MeshLambertMaterial({ color: 0xe8d6b0, side: THREE.DoubleSide })); wr.rotation.x = Math.PI; wr.position.y = 0.05; q.add(wr); for (let k = 0; k < 4; k++) { const fl = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 4), new THREE.MeshLambertMaterial({ color: BQ[(i * 2 + k) % 6] })); fl.position.set(Math.cos(k * 1.6) * 0.05, 0.22 + (k % 2) * 0.04, Math.sin(k * 1.6) * 0.05); q.add(fl); } BK.add(q); return q; }); }
  BK.position.set(PARK.x, 0, PARK.z); BK.rotation.y = PARK.yaw;
  { const bd = new THREE.Group(); bd.position.set(BOARD.x, 0, BOARD.z); bd.rotation.y = -Math.PI / 2; scene.add(bd); const wm = new THREE.MeshLambertMaterial({ color: 0x9a7550 }); for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.08), wm); l.position.set(s * 0.5, 0.7, 0); bd.add(l); }
    const pn = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.8), new THREE.MeshBasicMaterial({ map: CT(256, 170, (g2, w, h) => { g2.fillStyle = '#f3f2f2'; g2.fillRect(0, 0, w, h); g2.fillStyle = '#c2456a'; g2.fillRect(0, 0, w, 38); g2.fillStyle = '#ffffff'; g2.font = '900 26px Archivo, sans-serif'; g2.textBaseline = 'middle'; g2.fillText('DELIVERIES', 12, 20); g2.fillStyle = '#201e1d'; g2.font = '700 20px Archivo, sans-serif'; ['3 BOUQUETS · 3 DOORS', 'FASTER = FRESHER', 'MIND THE PETALS'].forEach((t, i) => g2.fillText(t, 12, 64 + i * 34)); }) }));
    pn.position.set(0, 1.25, 0.05); bd.add(pn); const bk = pn.clone(); bk.rotation.y = Math.PI; bk.position.z = -0.05; bd.add(bk); ringC(BOARD.x, BOARD.z, 0.5); }
  const beacons = [0, 1, 2].map(() => { const b = new THREE.Group(); const col = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 30, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xf29ab8, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); col.position.y = 15; b.add(col);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.12, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.15; b.add(ring); const fl = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), new THREE.MeshBasicMaterial({ color: 0xec3013 })); fl.position.y = 4; b.add(fl); b.visible = false; scene.add(b); return b; });
  const arrow = new THREE.Group(); { const am = new THREE.MeshBasicMaterial({ color: 0xffd23a }), sh = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 1.0), am); sh.position.z = 0.1; arrow.add(sh); const hd = new THREE.Mesh(new THREE.ConeGeometry(0.4, 0.7, 3), am); hd.rotation.x = Math.PI / 2; hd.position.z = 0.9; arrow.add(hd); arrow.visible = false; scene.add(arrow); }
  const tipFox = kit.makeFox({ key: 'flowerTip', torso: ['#2e86b8', '#22648a', '#16435c'], outfit: 'vest', mood: 'happy' }); tipFox.visible = false; scene.add(tipFox);
  const petals = Array.from({ length: 28 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.08), new THREE.MeshBasicMaterial({ color: [0xd4213a, 0xffd23a, 0xf29ab8, 0xf6f3ec, 0x7c4dc4, 0xf97316][i % 6], side: THREE.DoubleSide })); m.visible = false; scene.add(m); return { m, v: V(), life: 0 }; });
  const burst = (x, y, z, n = 14) => { let k = 0; for (const p of petals) { if (p.life > 0) continue; p.life = 1.4; p.m.visible = true; p.m.position.set(x, y, z); p.v.set((Math.random() - 0.5) * 4, 2 + Math.random() * 2.5, (Math.random() - 0.5) * 4); if (++k >= n) break; } };
  const B = { x: PARK.x, z: PARK.z, yaw: PARK.yaw, speed: 0, steer: 0, spin: 0, hitT: 0 }; let R = null, tipT = 0;
  const unlocked = () => save.flag('floraBike');
  const startRun = () => { const pool = [...DOORS].sort(() => Math.random() - 0.5).slice(0, 3); R = { drops: pool.map((d, i) => ({ ...d, who: WHO[Math.floor(Math.random() * WHO.length)], fresh: 100, done: false, gold: 0, i })), t: 0, crashes: 0, gold: 0 }; BK.userData.bq.forEach(q => { q.visible = true; }); toast('3 BOUQUETS IN THE BASKET · HOP ON THE BIKE', 2.8); };
  const nearBike = P => !P.bike && Math.hypot(P.x - B.x, P.z - B.z) < 2.2 && P.y < 1.5;
  const atPorch = P => Math.hypot(P.x - PARK.x, P.z - (PARK.z - 3)) < 7;
  function bikePrompt(P) { if (P.bike) return Math.abs(B.speed) < 1.5 ? 'GET OFF THE BIKE' : null;
    if (!R && Math.hypot(P.x - BOARD.x, P.z - BOARD.z) < 1.8) return S ? null : 'TAKE 3 DELIVERIES';
    if (nearBike(P)) return R || unlocked() ? 'RIDE THE FLOWER BIKE' : 'FLOWER BIKE · TAKE DELIVERIES FIRST'; return undefined; }
  function bikeTalk(P) { if (P.bike) { if (Math.abs(B.speed) < 1.5) { P.bike = false; B.speed = 0; P.x = B.x + Math.cos(B.yaw) * 0.9; P.z = B.z - Math.sin(B.yaw) * 0.9; if (atPorch(P) || Math.hypot(B.x - PARK.x, B.z - PARK.z) < 9) Object.assign(B, { x: PARK.x, z: PARK.z, yaw: PARK.yaw }); } return true; }
    if (!R && !S && Math.hypot(P.x - BOARD.x, P.z - BOARD.z) < 1.8) { startRun(); return true; }
    if (nearBike(P)) { if (R || unlocked()) { P.bike = true; P.x = B.x; P.z = B.z; P.yaw = B.yaw; B.speed = 0; } else toast('READ THE DELIVERY BOARD FIRST'); return true; } return false; }
  function bikeDrive(dt, ix, iy, P, block, ground) { const thr = Math.max(-1, Math.min(1, iy)), str = Math.max(-1, Math.min(1, ix));
    if (thr > 0.05) B.speed += 7 * thr * dt; else if (thr < -0.05) B.speed += 9 * thr * dt * (B.speed > 0 ? 1.4 : 0.4); else B.speed *= Math.exp(-1.1 * dt); B.speed = Math.max(-2.5, Math.min(10, B.speed));
    B.steer += (str - B.steer) * Math.min(1, dt * 7); const sp = Math.abs(B.speed); B.yaw -= B.steer * 2.1 * Math.min(1, sp / 3) * Math.sign(B.speed || 1) * dt;
    const nx = B.x + Math.sin(B.yaw) * B.speed * dt, nz = B.z + Math.cos(B.yaw) * B.speed * dt, gh = ground(nx, nz, 0); B.hitT -= dt;
    if (block(nx, nz, 0.45) || gh.water) { if (sp > 3 && B.hitT <= 0) { B.hitT = 0.8; if (R) { let lost = false; for (const d of R.drops) if (!d.done) { d.fresh = Math.max(0, d.fresh - 12); lost = true; } if (lost) { R.crashes++; burst(B.x + Math.sin(B.yaw) * 0.9, 1.2, B.z + Math.cos(B.yaw) * 0.9); toast('BUMP! PETALS EVERYWHERE', 1.6); } } } B.speed *= -0.3; }
    else { B.x = nx; B.z = nz; } B.spin += B.speed * dt / 0.36;
    P.x = B.x; P.z = B.z; P.y = gh.h || 0; P.yaw = B.yaw; P.sp = Math.min(3, sp * 0.35); P.ground = true; P.swim = false; P.vy = 0; }
  function bikeTick(dt, P, fox) { const t = performance.now() / 1000;
    BK.position.set(B.x, P.bike ? P.y : 0, B.z); BK.rotation.set(0, B.yaw, P.bike ? -B.steer * Math.min(1, Math.abs(B.speed) / 5) * 0.22 : 0); for (const w of BK.userData.wheels) w.rotation.x = B.spin;
    if (P.bike && fox) { fox.position.set(B.x - Math.sin(B.yaw) * 0.25, P.y + 0.42, B.z - Math.cos(B.yaw) * 0.25); fox.rotation.y = B.yaw; }
    for (const p of petals) if (p.life > 0) { p.life -= dt; p.v.y -= 6 * dt; p.m.position.addScaledVector(p.v, dt); if (p.m.position.y < 0.05) { p.m.position.y = 0.05; p.v.set(0, 0, 0); } p.m.rotation.x += dt * 6; p.m.rotation.y += dt * 4; if (p.life <= 0) p.m.visible = false; }
    if (tipT > 0) { tipT -= dt; tipFox.position.y = Math.abs(Math.sin(t * 6)) * 0.15; tipFox.rotation.y += Math.sin(t * 4) * 0.02; if (tipT <= 0) tipFox.visible = false; }
    if (!R) { arrow.visible = false; beacons.forEach(b => { b.visible = false; }); return; }
    R.t += dt; for (const d of R.drops) if (!d.done) d.fresh = Math.max(0, d.fresh - dt * 0.55);
    let next = null, nd = 1e9; R.drops.forEach((d, i) => { const b = beacons[i]; b.visible = !d.done; if (d.done) return; b.position.set(d.x, 0, d.z); b.children[2].position.y = 4 + Math.sin(t * 2 + i) * 0.4; b.children[1].rotation.z = t; const dd = Math.hypot(P.x - d.x, P.z - d.z); if (dd < nd) { nd = dd; next = d; }
      if (dd < 3.2 && P.y < 3) { d.done = true; const tip = d.fresh > 70 ? 8 : d.fresh > 35 ? 4 : 1; d.gold = 12 + Math.round(d.fresh * 0.2) + tip; R.gold += d.gold; save.addGold(d.gold); BK.userData.bq[i].visible = false;
        tipFox.position.set(d.x - Math.sin(d.yaw) * 1.2, 0, d.z - Math.cos(d.yaw) * 1.2); tipFox.rotation.y = d.yaw; tipFox.visible = true; tipT = 3; burst(d.x, 1.4, d.z, 8);
        toast(d.who + ' · ' + (d.fresh > 70 ? '"SO FRESH! HERE, A TIP."' : d.fresh > 35 ? '"LOVELY, THANK YOU!"' : '"OH... THEY TRIED THEIR BEST."') + ' +' + d.gold, 3); } });
    if (next) { arrow.visible = true; const ax = P.bike ? B.x : P.x, az = P.bike ? B.z : P.z; arrow.position.set(ax, (P.y || 0) + (P.bike ? 2.9 : 2.6), az); arrow.rotation.y = Math.atan2(next.x - ax, next.z - az); } else arrow.visible = false;
    if (R.drops.every(d => d.done) && atPorch(P)) { endRun(); return; }
    drawRun(P, next, nd); }
  const endRun = () => { const n = R.drops.filter(d => d.fresh >= 20).length, gold = R.gold, crashes = R.crashes; let gift = null; if (n === 3) gift = giveGift(); const first = !unlocked(); save.setFlag('floraBike'); save.best('floraBestRun', gold);
    R = null; card.style.display = 'none'; cardKey = ''; shine(9); toast('DELIVERIES DONE · +' + gold + ' GOLD' + (gift ? ' · ' + gift[1] : ''), 3.5);
    K.finish('deliver', crashes === 0 && n === 3 ? 3 : n === 3 ? 2 : 1, gold, first);
    sayTo(floraT, [{ who: 'npc', text: (crashes ? 'Petals on your fur! The town is prettier for it.' : 'Not one petal lost!') + (gift ? ' Here, a ' + gift[1].toLowerCase() + '.' : '') + (first ? ' The bike is yours to ride now.' : '') }]); };
  const drawRun = (P, next, nd) => { const rows = R.drops.map(d => '<div style="display:flex;gap:8px;align-items:center;padding:5px 0;border-top:1px solid #cfcac3' + (d.done ? ';opacity:0.55' : '') + '"><div style="flex:1;min-width:0"><div style="font-weight:900;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + d.label.toUpperCase() + '</div><div style="font-size:12px;color:#5a5654">' + (d.done ? 'DELIVERED · +' + d.gold : d.who + (d === next ? ' · ' + Math.round(nd) + ' M' : '')) + '</div></div>' +
      '<div style="width:72px;flex:none"><div style="height:8px;background:#cfcac3;border:1px solid #201e1d"><div style="height:6px;width:' + Math.round(d.fresh) + '%;background:' + (d.fresh > 60 ? '#3f9a5e' : d.fresh > 25 ? '#ffd23a' : '#ec3013') + '"></div></div><div style="font-size:11px;font-weight:800;margin-top:2px">' + (d.done ? '✓' : Math.round(d.fresh) + '% FRESH') + '</div></div></div>').join('');
    const left = R.drops.filter(d => !d.done).length, key = rows + left; if (key === cardKey) return; cardKey = key;
    card.innerHTML = '<div style="display:flex;justify-content:space-between;background:#c2456a;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>FLOWER DELIVERIES</span><span>' + (3 - left) + '/3</span></div><div style="padding:6px 10px 10px">' + rows +
      '<div style="font-size:12px;font-weight:900;color:#ec3013;margin-top:6px;border-top:2px solid #201e1d;padding-top:6px">' + (left ? (P.bike ? 'FOLLOW THE YELLOW ARROW' : 'HOP ON THE FLOWER BIKE') : 'ALL DELIVERED · RIDE BACK TO FLORA') + '</div></div>'; card.style.display = 'block'; };
  const API = { group: G, prompt, talk, tick, bikeDrive, run: () => R, bike: B, state: () => S, spots: SPOTS, toast: () => (toastT > 0 ? toastTxt : ''), active: () => !!S, talker: floraT, flora, kit: () => K, dispose() { card.remove(); K.dispose(); } }; window.__flower = API; return API;
}
