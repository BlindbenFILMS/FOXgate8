// MERU 2.0 — s135 SALT HQ · UPSTAIRS [meruSaltHQ] ("cluster buildings part 6", Ben's picks s134: the lift → one work floor per HQ, copy of meru2-vaxhq.js ·
// 5 jobs: COUNT THE TAKE · SPOT THE CHEAT (casino cameras) · DOOR LIST (casino back door) · "HONEST" DELIVERIES (walk Lakeside) · TIDY THE BOOKS ·
// every clear ends with a CHOICE: KEEP QUIET (family favour) or TIP OFF the Meru Daily / Meru Buzz (a story + gold) ·
// prizes: SALT SUIT (1st clear, Tailor) · FAMILY PIN (2 jobs: 20% off at the FAMILY PANTRY) · SALT TROPHY (all 5, + 60 gold) + Old Salt's scene · relic FIRST SALT CRYSTAL (3 stars on all)).
// The floor = an extra room in the cluster lobby row (clusters.addRoom), reached by the left LIFT in the Salt lobby. Stats prefix sfh.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildSaltHQ({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go, groundH = () => 0 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'saltHQ'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, LOX = LR.ox, RH = 4.4;
  const SR = clusters.addRoom({ key: 'saltFloor', room: 'meruSaltHQ', title: 'SALT \u00b7 UPSTAIRS' }, RH); SR.out = LR.out; const OX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', NAVY = '#2e4a6b', NAVY2 = '#16263c', ACC = NAVY, BURG = '#5a1d26', WOOD = '#5a3d26', DWOOD = '#3d2a1c', BRASS = '#d7ad52', BAIZE = '#2f6b45', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLACK = '#26292d', BLUE = '#2e86b8';
  const VCM = new THREE.MeshLambertMaterial({ vertexColors: true });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      tor: (r, t, hex, x, y, z, rx = 0, ry = 0) => put(new THREE.TorusGeometry(r, t, 6, 16), x, y, z, hex, ry, rx),
      sph: (r, hex, x, y, z) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex),
      mesh(parent) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, VCM); m.userData.noCull = true; parent.add(m); return m; } }; };
  const plate = (txt, w, h, bg, fg, bar) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (bar) { g.fillStyle = bar; g.fillRect(0, 0, Math.max(8, W * 0.03), H); } g.fillStyle = fg; g.textBaseline = 'middle'; let s = Math.round(H * 0.6); g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > W * 0.86 && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.fillText(txt, bar ? W * 0.07 : W * 0.06, H / 2 + 2); });
  const planeT = (tex, w, h, x, y, z, ry, parent, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat || new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.set(0, ry, 0); m.userData.noCull = true; parent.add(m); return m; };
  const rectL = (a, b, c, d) => cols.push({ f: [OX + a, OX + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'saltUpstairs'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('sfhDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#5d6f82', '#e7e4dc', '#334155'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  // ================= UPSTAIRS SHELL (old money: dark wood, burgundy, brass, a lake window) =================
  const R0 = mk(), { box, cyl, sph, tor } = R0, WALL = '#e2d9c8';
  box(20, 0.1, 20, '#6b4a32', 0, -0.05, 0); for (let x = -9.5; x <= 9.5; x += 1) box(0.02, 0.012, 20, '#5a3d26', x, 0.006, 0);
  box(20, 0.2, 20, '#2a1a14', 0, RH + 0.1, 0); for (let z = -8; z <= 8; z += 4) box(20, 0.16, 0.2, DWOOD, 0, RH - 0.08, z);
  box(20, 0.9, 0.3, WOOD, 0, 0.45, -10); box(20, RH - 3.8, 0.3, WALL, 0, 3.8 + (RH - 3.8) / 2, -10);
  for (let x = -10; x <= 10; x += 2.5) box(0.14, 2.9, 0.16, DWOOD, x, 2.35, -9.86);
  for (const s of [-1, 1]) { box(0.3, RH, 20, WALL, s * 10, RH / 2, 0); box(0.06, 1.2, 20, WOOD, s * 9.83, 0.6, 0); box(0.08, 0.06, 20, BRASS, s * 9.82, 1.22, 0); }
  box(20, RH, 0.3, WALL, 0, RH / 2, 10); box(20, 1.2, 0.06, WOOD, 0, 0.6, 9.83); box(20, 0.06, 0.08, BRASS, 0, 1.22, 9.82);
  rectL(-10, 10, -10.3, -9.7); rectL(9.8, 10.3, -10, 10); rectL(-10.3, -9.8, -10, 10); rectL(-10, 10, 9.8, 10.3);
  box(1.8, 0.02, 14.4, BURG, 0, 0.012, 1.8); for (const s of [-1, 1]) box(0.05, 0.022, 14.4, BRASS, s * 0.9, 0.014, 1.8);   // runner: lift → the lawyer's desk
  box(1.8, 2.7, 0.06, BRASS, 0, 1.35, 9.82); box(0.03, 2.7, 0.07, INK, 0, 1.35, 9.8); box(2.1, 0.14, 0.12, DWOOD, 0, 2.78, 9.8); for (const s of [-1, 1]) box(0.14, 2.8, 0.12, DWOOD, s * 1.0, 1.4, 9.8);
  // THE LAWYER'S DESK (north, end of the runner)
  box(4.4, 0.08, 1.1, DWOOD, 0, 1.02, -6.6); box(4.2, 0.98, 0.9, WOOD, 0, 0.49, -6.6); box(4.2, 0.06, 0.04, BRASS, 0, 0.9, -6.13); rectL(-2.2, 2.2, -7.1, -6.1);
  for (let k = 0; k < 3; k++) box(0.34, 0.06, 0.46, k % 2 ? PAPER : CREAM, -1.3 + k * 0.08, 1.09 + k * 0.06, -6.7, 0.1 * k); cyl(0.05, 0.08, 0.36, BRASS, 1.4, 1.24, -6.8, 8); box(0.4, 0.22, 0.04, '#bcd4e6', 1.4, 1.5, -6.8);
  // OLD SALT'S OFFICE (NE): low wood wall + glass above, door gap on the west side (z -7.2..-4.8)
  box(6, 1.0, 0.14, WOOD, 7, 0.5, -4); box(0.14, 1.0, 2.8, WOOD, 4, 0.5, -8.6); box(0.14, 1.0, 0.8, WOOD, 4, 0.5, -4.4);
  for (const [x, z] of [[4, -4], [4, -7.2], [4, -4.8], [10, -4]]) box(0.12, RH, 0.12, DWOOD, x, RH / 2, z); box(6, 0.12, 0.12, DWOOD, 7, 2.9, -4); box(0.12, 0.12, 2.8, DWOOD, 4, 2.9, -8.6);
  rectL(3.9, 4.1, -10, -7.2); rectL(3.9, 4.1, -4.8, -3.9); rectL(4, 10, -4.1, -3.9);
  box(2.6, 0.1, 1.2, DWOOD, 7.2, 0.95, -7.2); box(2.4, 0.9, 1.0, '#2a1a14', 7.2, 0.45, -7.2); rectL(5.9, 8.5, -7.8, -6.6);
  box(0.9, 1.2, 0.8, BURG, 7.2, 0.6, -8.6); box(0.9, 0.5, 0.2, BURG, 7.2, 1.3, -9.0);
  tor(0.55, 0.05, WOOD, 9.8, 2.3, -7.2, 0, Math.PI / 2); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; box(0.05, 0.05, 1.3, WOOD, 9.8, 2.3 + Math.sin(a) * 0.0, -7.2, 0, a); }   // ship's wheel
  box(0.7, 0.45, 0.7, BURG, 5.4, 0.23, -5.2); box(0.7, 0.55, 0.15, BURG, 5.4, 0.7, -4.9); circL(5.4, -5.2, 0.5);
  cyl(0.06, 0.06, 0.1, PAPER, 6.5, 1.05, -7.1, 10); cyl(0.12, 0.12, 0.03, BRASS, 8.0, 1.02, -7.0, 12);
  // COUNTING TABLE (NW): baize, coin stacks, scales
  box(4.0, 0.1, 1.6, DWOOD, -6.8, 0.92, -7.8); box(3.8, 0.04, 1.4, BAIZE, -6.8, 0.98, -7.8); for (const [x, z] of [[-8.6, -8.4], [-5, -8.4], [-8.6, -7.2], [-5, -7.2]]) box(0.1, 0.9, 0.1, DWOOD, x, 0.45, z); rectL(-8.9, -4.7, -8.7, -6.9);
  for (let k = 0; k < 9; k++) cyl(0.07, 0.07, 0.04 + (k % 4) * 0.05, [PAPER, RED, BLUE, BAIZE, INK][k % 5], -8.2 + k * 0.32, 1.02 + (0.04 + (k % 4) * 0.05) / 2, -7.6 - (k % 2) * 0.3, 10);
  box(0.06, 0.4, 0.06, BRASS, -5.3, 1.2, -8.1); box(0.6, 0.03, 0.03, BRASS, -5.3, 1.4, -8.1); for (const s of [-1, 1]) cyl(0.12, 0.1, 0.03, BRASS, -5.3 + s * 0.3, 1.25, -8.1, 10);
  // CAMERA DESK (W wall): four casino monitors
  box(1.2, 0.08, 3.4, DWOOD, -9.2, 0.95, 0.2); box(1.1, 0.9, 3.3, WOOD, -9.2, 0.45, 0.2); rectL(-10, -8.6, -1.5, 1.9);
  for (const [z, y] of [[-0.6, 1.5], [1.0, 1.5], [-0.6, 2.25], [1.0, 2.25]]) box(0.12, 0.66, 1.4, BLACK, -9.7, y, z);
  // CASINO BACK DOOR (SW, south wall) + podium + velvet rope
  box(1.6, 2.6, 0.08, '#2a1a14', -5.6, 1.3, 9.8); box(1.8, 0.1, 0.1, BRASS, -5.6, 2.65, 9.78); sph(0.06, BRASS, -5.0, 1.2, 9.72);
  box(0.8, 1.1, 0.6, DWOOD, -4.2, 0.55, 7.4); box(0.9, 0.05, 0.7, BRASS, -4.2, 1.12, 7.4, 0, -0.25); rectL(-4.65, -3.75, 7.1, 7.7);
  for (const x of [-7.2, -6.4]) { cyl(0.05, 0.12, 0.95, BRASS, x, 0.48, 7.6, 8); sph(0.07, BRASS, x, 0.98, 7.6); circL(x, 7.6, 0.2); } box(0.8, 0.06, 0.06, BURG, -6.8, 0.82, 7.6);
  // DISPATCH (E wall): parcel shelves + trolley
  box(0.7, 2.4, 3.6, DWOOD, -0 + 9.55, 1.2, 1.4); for (let r = 0; r < 3; r++) { box(0.72, 0.05, 3.6, WOOD, 9.55, 0.5 + r * 0.7, 1.4); for (let q = 0; q < 4; q++) box(0.42, 0.3, 0.5, ['#c9a27a', '#b08a5e', CREAM][(r + q) % 3], 9.5, 0.68 + r * 0.7, 0.0 + q * 0.9); }
  rectL(9.1, 10, -0.4, 3.2); box(1.0, 0.1, 0.7, STEEL, 7.6, 0.5, 3.4); for (const s of [-1, 1]) box(0.04, 0.9, 0.04, STEEL, 7.1, 0.9, 3.4 + s * 0.3); box(0.5, 0.36, 0.4, '#c9a27a', 7.7, 0.73, 3.4); circL(7.6, 3.4, 0.6);
  // LEDGER DESK (SE) + the bookcase of ledgers (south wall)
  box(4.0, 2.6, 0.5, DWOOD, 6.6, 1.3, 9.6); for (let r = 0; r < 4; r++) for (let q = 0; q < 12; q++) box(0.24, 0.42, 0.3, [BURG, NAVY, '#2a3d20', '#201e1d'][(r * 3 + q) % 4], 4.95 + q * 0.3, 0.5 + r * 0.6, 9.4); rectL(4.6, 8.6, 9.3, 10);
  box(2.4, 0.08, 1.0, DWOOD, 6.6, 0.95, 7.6); box(2.2, 0.9, 0.8, WOOD, 6.6, 0.45, 7.6); rectL(5.4, 7.8, 7.1, 8.1); box(0.7, 0.06, 0.5, CREAM, 6.3, 1.02, 7.5); box(0.7, 0.06, 0.5, INK, 7.1, 1.02, 7.5); cyl(0.04, 0.1, 0.4, BRASS, 7.6, 1.2, 7.9, 8); cyl(0.16, 0.1, 0.14, BAIZE, 7.6, 1.42, 7.9, 10);
  // FAMILY PANTRY (E wall) + TROPHY CASE
  box(0.9, 1.0, 1.6, DWOOD, 9.45, 0.5, 5.2); for (let k = 0; k < 6; k++) cyl(0.09, 0.09, 0.22, [CREAM, PAPER, '#c9a27a'][k % 3], 9.3 + (k % 2) * 0.25, 1.11, 4.6 + Math.floor(k / 2) * 0.55, 10); rectL(8.9, 10, 4.4, 6.0);
  box(0.9, 0.9, 1.2, DWOOD, 9.35, 0.45, -2.6); box(0.85, 1.0, 1.15, '#d6e8f0', 9.35, 1.4, -2.6); rectL(8.8, 10, -3.3, -1.9);
  // clerk desks (middle)
  for (const s of [-1, 1]) { const cx = s * 4.4; box(3.2, 0.08, 1.8, DWOOD, cx, 0.9, 0.8); box(0.06, 0.86, 1.7, WOOD, cx - 1.55, 0.43, 0.8); box(0.06, 0.86, 1.7, WOOD, cx + 1.55, 0.43, 0.8); box(3.1, 0.3, 0.04, BURG, cx, 1.1, 0.8); rectL(cx - 1.6, cx + 1.6, -0.1, 1.7);
    for (const dx of [-0.8, 0.8]) { box(0.5, 0.05, 0.36, CREAM, cx + dx, 0.96, 0.5); cyl(0.06, 0.06, 0.12, PAPER, cx + dx + 0.3, 1.0, 1.1, 8); box(0.5, 0.18, 0.3, '#3d3b3a', cx + dx, 1.03, 1.1); } }
  for (const [x, z] of [[-9.1, -9.1], [-9.1, 9.1], [3.2, -9.1], [9.1, 9.1]]) { cyl(0.3, 0.24, 0.5, BRASS, x, 0.25, z, 10); sph(0.55, '#4f7d3a', x, 0.95, z); sph(0.4, '#5f8d48', x - 0.15, 1.35, z + 0.15); circL(x, z, 0.5); }
  const LAMPS = [[-5, -5], [0, -3], [-5, 3], [5, 2], [-4, 7], [2.5, 7], [7, -7]]; for (const [x, z] of LAMPS) { box(0.04, 0.5, 0.04, BRASS, x, RH - 0.25, z); cyl(0.32, 0.18, 0.2, BRASS, x, RH - 0.55, z, 10); sph(0.12, '#fff1c8', x, RH - 0.66, z); }
  R0.mesh(G);
  const glassM = new THREE.MeshLambertMaterial({ color: '#bcd4e6', transparent: true, opacity: 0.25, depthWrite: false });
  for (const [w, x, z, ry] of [[6, 7, -4, 0], [2.8, 4, -8.6, Math.PI / 2], [0.8, 4, -4.4, Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.85), glassM); m.position.set(x, 1.95, z); m.rotation.y = ry; m.userData.noCull = true; m.renderOrder = 3; G.add(m); }
  const viewT = CT(1024, 160, (g, W, H) => { const sky = g.createLinearGradient(0, 0, 0, H * 0.5); sky.addColorStop(0, '#8fc3e8'); sky.addColorStop(1, '#e8eef2'); g.fillStyle = sky; g.fillRect(0, 0, W, H); g.fillStyle = '#4b7fa3'; g.fillRect(0, H * 0.5, W, H);
    g.fillStyle = '#7f8c99'; for (let i = 0; i < 18; i++) { const x = (i * 131) % W, w = 10 + (i * 7) % 18, h = 6 + (i * 17) % 22; g.fillRect(x, H * 0.5 - h, w, h); }
    for (let i = 0; i < 6; i++) { const x = 80 + i * 160, y = H * 0.62 + (i % 3) * 14; g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 36, y); g.lineTo(x + 30, y + 7); g.lineTo(x + 5, y + 7); g.fill(); g.fillStyle = i % 2 ? '#ec3013' : '#2e4a6b'; g.fillRect(x + 14, y - 14, 3, 14); }
    g.fillStyle = 'rgba(255,255,255,0.45)'; for (let i = 0; i < 40; i++) g.fillRect((i * 53) % W, H * 0.56 + (i * 7) % 60, 16, 2); });
  const viewM = new THREE.MeshBasicMaterial({ map: viewT }); planeT(null, 20, 2.9, 0, 2.35, -9.84, 0, G, viewM);
  const monT = CT(256, 160, (g, W, H) => { g.fillStyle = '#1e2a22'; g.fillRect(0, 0, W, H); g.fillStyle = '#2f6b45'; g.beginPath(); g.ellipse(W / 2, H / 2 + 10, 96, 46, 0, 0, 7); g.fill(); g.fillStyle = '#e7e4dc'; for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(50 + i * 52, 34, 13, 0, 7); g.fill(); } g.fillStyle = 'rgba(255,255,255,0.08)'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1); g.fillStyle = '#ec3013'; g.font = '900 18px Archivo, sans-serif'; g.fillText('\u25cf REC', 10, H - 12); });
  const camM = new THREE.MeshBasicMaterial({ map: monT }); for (const [z, y] of [[-0.6, 1.5], [1.0, 1.5], [-0.6, 2.25], [1.0, 2.25]]) planeT(null, 1.26, 0.56, -9.63, y, z, Math.PI / 2, G, camM);
  planeT(plate('SALT \u00b7 UPSTAIRS', 512, 96, INK, PAPER, NAVY), 2.4, 0.45, 0, 3.4, 9.83, Math.PI, G);
  planeT(plate('LIFT \u00b7 LOBBY', 384, 96, INK, PAPER, RED), 1.5, 0.36, 0, 3.05, 9.82, Math.PI, G);
  planeT(plate('THE FAMILY LAWYER', 512, 96, NAVY, PAPER, BRASS), 1.8, 0.36, 0, 1.75, -6.0, 0, G);
  planeT(plate('COUNTING ROOM', 384, 96, INK, PAPER, RED), 1.8, 0.4, -6.8, 3.3, -9.83, 0, G);
  planeT(plate('CASINO CAMERAS', 384, 96, INK, PAPER, RED), 1.8, 0.4, -9.83, 3.2, 0.2, Math.PI / 2, G);
  planeT(plate('CASINO BACK DOOR', 512, 96, BURG, PAPER, BRASS), 1.9, 0.38, -5.6, 3.0, 9.83, Math.PI, G);
  planeT(plate('DISPATCH', 384, 96, INK, PAPER, RED), 1.6, 0.38, 9.83, 3.0, 1.4, -Math.PI / 2, G);
  planeT(plate('THE BOOKS', 384, 96, INK, PAPER, RED), 1.6, 0.38, 6.6, 3.3, 9.83, Math.PI, G);
  planeT(plate('FAMILY PANTRY', 384, 96, NAVY, PAPER, BRASS), 1.4, 0.34, 9.83, 1.75, 5.2, -Math.PI / 2, G);
  planeT(plate('OLD SALT', 384, 96, INK, BRASS, BRASS), 1.6, 0.4, 9.83, 3.2, -7.2, -Math.PI / 2, G);
  planeT(plate('SALT', 256, 96, NAVY, PAPER), 0.9, 0.34, 7.0, 3.3, -3.98, Math.PI, G);
  const trophy = new THREE.Group(); { const S = mk(); S.cyl(0.14, 0.18, 0.1, INK, 0, 0.05, 0, 12); S.cyl(0.06, 0.12, 0.34, PAPER, 0, 0.27, 0, 12); S.sph(0.1, PAPER, 0, 0.48, 0); for (let k = 0; k < 3; k++) S.box(0.03, 0.03, 0.03, INK, (k - 1) * 0.05, 0.56, 0); S.box(0.22, 0.06, 0.02, NAVY, 0, 0.06, 0.16); S.mesh(trophy); }
  trophy.position.set(9.35, 0.92, -2.6); G.add(trophy); trophy.visible = false;
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#9fc3e8', emissiveIntensity: 0.4 })); crystal.scale.set(1, 1.5, 1); crystal.position.set(7.9, 1.22, -7.3); crystal.userData.noCull = true; G.add(crystal); crystal.visible = false;
  // ================= LOBBY: the lift sign =================
  const LG = new THREE.Group(); LG.position.set(LOX, LY, LZ); scene.add(LG); LG.visible = false;
  planeT(plate('UPSTAIRS \u00b7 FAMILY WORK', 512, 96, INK, PAPER, NAVY), 1.8, 0.32, -GEO.RW / 2 + 0.26, 3.15, -4, Math.PI / 2, LG);
  const LLIFT = [-8.4, -4], LDESK = [0, -5], MAIN = [0, 9.0];
  // ================= FOXES =================
  const LW0 = [0, -7.8, 0], BOSS0 = [7.2, -8.3, 0], W0 = [[-4.4, 2.3, Math.PI], [4.4, 2.3, Math.PI]];
  const lawyer = kit.makeFox({ key: 'saltConsigliere', name: 'Family Lawyer', torso: ['#e7e4dc', '#3d3b3a', '#201e1d'], outfit: 'suit', mood: 'neutral' }); lawyer.position.set(LW0[0], 0, LW0[1]); lawyer.rotation.y = LW0[2]; lawyer.userData.noCull = true; lawyer.userData.rosterShop = 'SALT HQ'; lawyer.userData.rosterRole = 'keeper'; G.add(lawyer);
  const boss = kit.makeFox({ key: 'saltBoss', name: 'Old Salt', torso: ['#e7e4dc', NAVY, NAVY2], outfit: 'suit', mood: 'warm' }); boss.position.set(BOSS0[0], 0, BOSS0[1]); boss.rotation.y = BOSS0[2]; boss.userData.noCull = true; boss.userData.rosterShop = 'SALT HQ'; G.add(boss); circL(BOSS0[0], BOSS0[1], 0.45);
  const workers = W0.map(([x, z, ry], i) => { const f = kit.makeFox({ key: 'saltClerk' + i, name: 'Family Clerk', torso: LOOKS[i ? 2 : 0], outfit: i ? 'vest' : 'coat', mood: 'neutral' }); f.position.set(x, 0, z); f.rotation.y = ry; f.userData.noCull = true; f.userData.rosterShop = 'SALT HQ'; G.add(f); circL(x, z, 0.45); return f; });
  // ================= shopKit (the lawyer = keeper) =================
  const GAMES = [{ k: 'count', name: 'Count the Take', color: BAIZE }, { k: 'cheat', name: 'Spot the Cheat', color: INK }, { k: 'door', name: 'Door List', color: BURG }, { k: 'deliver', name: 'Honest Deliveries', color: '#b08a5e' }, { k: 'books', name: 'Tidy the Books', color: NAVY }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { count: [-6.8, -5.9], cheat: [-7.6, 0.2], door: [-5.6, 6.2], deliver: [7.8, 1.4], books: [6.6, 6.0] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'sfh', color: NAVY, boardTitle: 'Salt family board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper: lawyer, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -8.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: -2.6, z: 8.2, ry: 0 }, hiringLine: 'COUNTING \u00b7 DOORS \u00b7 PARCELS \u00b7 BOOKS', sun: [{ x: -5, z: -7.6, w: 3.2, d: 2.2 }, { x: 1.6, z: -3.8, w: 3.2, d: 2.2 }, { x: -1.4, z: -8.2, w: 2.4, d: 1.6 }],
    lamps: LAMPS.map(([x, z]) => [x, RH - 0.7, z]), lampsOn: () => { const h = hour(); return h >= 19 || h < 7; },
    browse: [[2.2, 3.2, Math.PI / 2], [-2.2, 3.6, -Math.PI / 2], [6.8, 4.0, Math.PI / 2]], looks: [LOOKS[1], LOOKS[3], LOOKS[4]], clock: { x: 2.8, y: 3.4, z: 9.83, ry: Math.PI } });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); G.add(m); ringMeshes[k] = m; }
  // ================= KIT: sound, toast, fade, card, panel, arrow =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const liftDing = () => { tone(1046, 0.06, 0.6); tone(1318, 0.05, 0.7, 'sine', 0.18); };
  let veil = null, fading = false; const fade = fn => { if (fading) { setTimeout(() => fade(fn), 380); return; } fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + ACC + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, stopBtn) => '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stopBtn ? '<button data-stop style="pointer-events:auto;min-height:44px;min-width:64px;padding:0 12px;text-align:left;background:#f3f2f2;color:#201e1d;border:2px solid #f3f2f2;border-radius:0;font:900 12px Archivo,sans-serif;cursor:pointer">STOP</button>' : '') + '</div>';
  const steps = items => '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>';
  const tipH = (who, t) => '<div style="margin-top:6px;font-size:12px;font-weight:800;line-height:1.3"><span style="color:' + RED + ';font-weight:900">' + who + ' \u00b7 </span>' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; const b = card.querySelector('[data-stop]'); if (b) b.onclick = e => { e.stopPropagation(); quit(); }; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL);
  const sideM = () => { const W = innerWidth, H = innerHeight; return H < 520 ? Math.max(8, Math.min(180, (W - 320) / 2)) : 8; };
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = sideM(), w = Math.min(640, W - side * 2); Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + ACC + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span data-h style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const tipBar = t => '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + t + '</div>';
  const showPanel = (html, onStop) => { fitPanel(); PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => (onStop ? onStop() : quit()); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none' && J && GD[J.g] && GD[J.g].draw ) { fitPanel(); GD[J.g].draw(); } });
  const shake = el => { try { el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); } catch (e) {} };
  const pulse = el => { if (!el) return; el.style.outline = '4px solid #ffd23a'; try { el.animate([{ outlineColor: '#ffd23a', outlineWidth: '4px' }, { outlineColor: 'rgba(255,210,58,0)', outlineWidth: '8px' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  const BTN = 'min-width:0;min-height:56px;padding:6px 10px;text-align:left;background:#fff;color:#201e1d;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;line-height:1.15;cursor:pointer;outline:0 solid transparent';
  const timeRow = '<div data-time style="height:8px;background:#201e1d;width:100%;flex:none"></div>';
  const ARW = document.createElement('div'); ARW.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;background:#201e1d;color:#ffd23a;font-weight:900;font-size:15px;padding:6px 10px;border:2px solid #ffd23a;white-space:nowrap;transform:translate(-50%,-100%)';
  document.body.appendChild(ARW); const tmp = V();
  function arrowTo(w, label) { if (!w) { ARW.style.display = 'none'; return; } tmp.copy(w).project(camera); let x = (tmp.x + 1) / 2 * innerWidth, y = (1 - tmp.y) / 2 * innerHeight; const behind = tmp.z > 1; if (behind) { x = innerWidth - x; y = innerHeight - y; }
    const m = 120, mr = innerWidth < 600 ? 130 : 270, mt = innerHeight < 520 ? 60 : 130, mb = innerHeight < 520 ? 70 : 250, off = behind || x < m || x > innerWidth - mr || y < mt || y > innerHeight - mb, cx = innerWidth / 2, cy = innerHeight / 2;
    let ar = '\u25bc'; if (off) { const a = Math.atan2(y - cy, x - cx); x = clamp(x, m, innerWidth - mr); y = clamp(y, mt, innerHeight - mb); ar = '<span style="display:inline-block;transform:rotate(' + (a * 180 / Math.PI + 90).toFixed(0) + 'deg)">\u25b2</span>'; }
    ARW.style.display = 'block'; ARW.style.left = Math.round(x) + 'px'; ARW.style.top = Math.round(y) + 'px'; const h = ar + ' ' + label; if (ARW._h !== h) { ARW._h = h; ARW.innerHTML = h; } }
  // ================= state =================
  let busy = null, J = null, lastP = null, lastFox = null, snapK = false, endClear = 0;
  const addGold = n => { n = Math.max(0, Math.round(n)); if (!J) return 0; J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { if (!J) return; J.miss++; nope(); toast(msg, s); const tip = PANEL.style.display !== 'none' && PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#ec3013'; tip.style.color = '#ffffff'; } };
  const okTip = msg => { const tip = PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#201e1d'; tip.style.color = '#ffd23a'; } };
  const timeBar = (el, f, warn) => { if (!el) return; el.style.width = (clamp(f, 0, 1) * 100).toFixed(1) + '%'; el.style.background = warn ? RED : INK; };
  const ln = (who, role) => text => ({ who, role, text });
  const goRoom = (x, z, yaw) => go(OX + x, LY, LZ + z, yaw);
  const turnTo = (f, want, dt, k = 4) => { let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * k); };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const GD = {};
  // a quick "round" engine for the panel jobs: list, ci, cueT, wait, draw, next, tick with timer + hint after 3 s
  const roundTick = (D, dt, T, missMsg, hintSel) => { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / T, J.cueT < 3); if (J.cueT <= 0) { missOne(missMsg); D.next(); } }
    if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const s = hintSel(); if (s) pulse(PANEL.querySelector(s)); } };
  const roundNext = (D, g, T) => { if (!J || J.g !== g) return; J.ci++; J.cueT = T; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); D.draw(); setTimeout(finishGame, 800); return; } D.draw(); };
  const wrongBtn = (el, msg) => { missOne(msg); shake(el); el.disabled = true; el.style.opacity = '0.4'; };
  const goodBtn = el => { el.style.background = '#201e1d'; el.style.color = '#ffd23a'; };
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'SALT');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;
  const T_LW = { key: 'saltConsigliere', name: 'Family Lawyer', role: 'SALT FAMILY', obj: lawyer, ry: LW0[2], r: 6 }, lwLn = ln('Family Lawyer', 'SALT FAMILY');
  const T_OS = { key: 'saltBoss', name: 'Old Salt', role: 'HEAD OF THE SALT FAMILY', obj: boss, ry: BOSS0[2], r: 6 }, osLn = ln('Old Salt', 'HEAD OF THE SALT FAMILY');
  const FURS = [['#e07a1f', 'ORANGE'], ['#9aa0a6', 'GREY'], ['#f3f2f2', 'WHITE'], ['#5a3d26', 'BROWN'], ['#201e1d', 'BLACK']];
  const faceSvg = c => '<svg viewBox="0 0 40 40" style="width:100%;height:auto;display:block" aria-hidden="true"><rect width="40" height="40" fill="#d9ecf6"/><polygon points="7,16 12,3 18,14" fill="' + c + '" stroke="#201e1d" stroke-width="1.5"/><polygon points="22,14 28,3 33,16" fill="' + c + '" stroke="#201e1d" stroke-width="1.5"/><circle cx="20" cy="23" r="13" fill="' + c + '" stroke="#201e1d" stroke-width="1.5"/><ellipse cx="20" cy="29" rx="7" ry="5" fill="#fff"/><circle cx="15" cy="21" r="2.4" fill="#201e1d"/><circle cx="25" cy="21" r="2.4" fill="#201e1d"/><ellipse cx="20" cy="30" rx="2.4" ry="3" fill="#201e1d"/></svg>';
  // ---------- 1 COUNT THE TAKE (counting table): add up each tray of casino chips, pick the total ----------
  const CHIPS = [[1, '#f3f2f2', '#201e1d'], [5, '#ec3013', '#fff'], [10, '#2e86b8', '#fff'], [25, '#2f7d5a', '#fff'], [100, '#201e1d', '#ffd23a']];
  const CTT = 15, CTN = 6;
  GD.count = { panel: true, shot: () => [toW(-6.8, 1.1, -7.8), 4.2, 2.2, 0.35, 3.2, 0, 6],
    begin() { goRoom(-6.8, -5.9, Math.PI); J.list = [...Array(CTN)].map((_, i) => { const ds = pickN(CHIPS, i < 2 ? 2 : i < 4 ? 3 : 4).sort((a, b) => a[0] - b[0]), tray = ds.map(d => ({ d, n: 1 + Math.floor(Math.random() * 5) })), tot = tray.reduce((s, t) => s + t.d[0] * t.n, 0);
        const lo = tray[0].d[0], hi = tray[tray.length - 1].d[0], set = new Set([tot]); for (const o of shuffle([tot + lo, tot - lo, tot + hi, tot - hi, tot + 2 * lo, tot + (tray[1] ? tray[1].d[0] : 2 * lo)])) { if (o > 0 && set.size < 4) set.add(o); } return { tray, tot, opts: shuffle([...set]) }; });
      J.ci = 0; J.cueT = CTT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      const tray = c ? '<div style="border:2px solid #201e1d;background:#2f6b45;padding:10px;display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">' + c.tray.map(t => '<div style="display:flex;flex-direction:column-reverse;align-items:stretch;width:58px;gap:2px"><div style="font-size:12px;font-weight:900;color:#fff;margin-top:4px">' + t.d[0] + ' G</div>' + [...Array(t.n)].map(() => '<div style="height:10px;background:' + t.d[1] + ';border:2px solid #201e1d;box-sizing:content-box"></div>').join('') + '</div>').join('') + '</div>' : '';
      showPanel(panelHead('COUNT THE TAKE \u00b7 TRAY ' + nOf(), goldR()) + body(c ? '<div style="font-size:11px;font-weight:900;color:#ec3013">LAST NIGHT\u2019S CASINO TAKE \u00b7 EACH CHIP SHOWS ITS VALUE</div>' + tray + timeRow
        + '<div style="font-size:11px;font-weight:900">HOW MUCH IS ON THE TRAY?</div><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px">' + c.opts.map((o, i) => '<button data-i="' + i + '" style="' + BTN + ';min-height:60px;font-size:22px">' + o + ' G</button>').join('') + '</div>' : '<div style="font-size:22px;font-weight:900">EVERY TRAY COUNTED</div>') + tipBar('ADD EACH STACK \u00b7 CHIPS \u00d7 VALUE'));
      PANEL.querySelectorAll('[data-i]').forEach(b => { b.onclick = () => this.pick(+b.dataset.i, b); }); J.idle = 0; J.hinted = false; },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (c.opts[i] !== c.tot) { wrongBtn(el, 'MISCOUNT \u00b7 ADD THE STACKS AGAIN'); return; }
      addGold(3); coin(); goodBtn(el); okTip('CORRECT \u00b7 ' + c.tot + ' G IN THE BAG'); J.wait = 0.8; setTimeout(() => this.next(), 700); },
    next() { roundNext(this, 'count', CTT); },
    tick(dt) { roundTick(this, dt, CTT, 'TOO SLOW \u00b7 THE TRAY GOES BACK IN THE PILE', () => '[data-i="' + J.list[J.ci].opts.indexOf(J.list[J.ci].tot) + '"]'); } };
  // ---------- 2 SPOT THE CHEAT (camera desk): four casino feeds, tap the player who slips a card or a chip ----------
  const FEEDS = ['CAM 1 \u00b7 CARDS', 'CAM 2 \u00b7 DICE', 'CAM 3 \u00b7 WHEEL', 'CAM 4 \u00b7 CARDS'];
  const SCT = 10, SCN = 8;
  GD.cheat = { panel: true, shot: () => [toW(-9.6, 1.9, 0.2), 3.2, 2.2, 0.12, 3.0, Math.PI / 2, 5.5],
    begin() { goRoom(-7.6, 0.2, -Math.PI / 2); J.furs = [...Array(12)].map(() => pick1(FURS)[0]); J.list = [...Array(SCN)].map(() => ({ seat: Math.floor(Math.random() * 12), type: Math.random() < 0.5 ? 'card' : 'chip' })); J.ci = 0; J.cueT = SCT; J.wait = 0.4; J.evT = 0.8; J.lastC = 0; J.flashed = false; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci], w = wide();
      const feed = f => '<div style="min-width:0;border:2px solid #201e1d;background:#1e2a22;padding:4px;display:flex;flex-direction:column;gap:4px"><div style="display:flex;justify-content:space-between;font-size:10px;font-weight:900;color:#e7e4dc"><span>' + FEEDS[f] + '</span><span style="color:#ec3013">\u25cf REC</span></div>'
        + '<div style="background:#2f6b45;padding:4px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:4px">' + [0, 1, 2].map(s => { const i = f * 3 + s; return '<button data-s="' + i + '" aria-label="Player ' + (s + 1) + ' on ' + FEEDS[f] + '" style="position:relative;overflow:visible;min-height:44px;padding:2px;background:#d9ecf6;border:2px solid #201e1d;border-radius:0;cursor:pointer">' + faceSvg(J.furs[i]) + '<span data-fx style="position:absolute;inset:0;pointer-events:none"></span></button>'; }).join('') + '</div></div>';
      showPanel(panelHead('SPOT THE CHEAT \u00b7 ' + nOf(), goldR()) + body(c ? '<div style="display:grid;grid-template-columns:repeat(' + (w ? 4 : 2) + ',minmax(0,1fr));gap:8px">' + [0, 1, 2, 3].map(feed).join('') + '</div>' + timeRow
        + '<div style="display:flex;gap:12px;flex-wrap:wrap;font-size:12px;font-weight:900;align-items:center"><span>CHEATS:</span><span style="display:flex;gap:4px;align-items:center"><span style="display:inline-block;width:10px;height:14px;background:#fff;border:2px solid #ec3013"></span>A CARD FROM A SLEEVE</span><span style="display:flex;gap:4px;align-items:center"><span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:#ffd23a;border:2px solid #201e1d"></span>A CHIP SLIPPED IN</span><span style="opacity:.7">A DRINK IS JUST A DRINK</span></div>'
        : '<div style="font-size:22px;font-weight:900">THE TABLES ARE CLEAN</div>') + tipBar('WATCH THE FEEDS \u00b7 TAP THE CHEAT'));
      PANEL.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => this.pick(+b.dataset.s, b); }); J.idle = 0; J.hinted = false; },
    fx(i, type) { const b = PANEL.querySelector('[data-s="' + i + '"] [data-fx]'); if (!b) return; const s = document.createElement('span');
      const st = { card: 'position:absolute;left:-4px;bottom:6px;width:12px;height:17px;background:#fff;border:2px solid #ec3013', chip: 'position:absolute;left:50%;bottom:-4px;width:14px;height:14px;border-radius:50%;background:#ffd23a;border:2px solid #201e1d', drink: 'position:absolute;right:-3px;bottom:4px;width:9px;height:14px;background:#7fb7d9;border:2px solid #201e1d' }[type];
      s.style.cssText = st; b.appendChild(s); const kf = { card: [{ transform: 'translate(-6px,0) rotate(-20deg)', opacity: 0 }, { transform: 'translate(4px,-4px) rotate(0deg)', opacity: 1, offset: 0.35 }, { transform: 'translate(10px,-6px)', opacity: 1, offset: 0.7 }, { transform: 'translate(14px,-6px)', opacity: 0 }],
        chip: [{ transform: 'translate(-50%,6px)', opacity: 0 }, { transform: 'translate(-50%,-6px)', opacity: 1, offset: 0.4 }, { transform: 'translate(-50%,-14px)', opacity: 1, offset: 0.75 }, { transform: 'translate(-50%,-18px)', opacity: 0 }],
        drink: [{ transform: 'translateY(6px)', opacity: 0 }, { transform: 'translateY(-8px)', opacity: 1, offset: 0.5 }, { transform: 'translateY(4px)', opacity: 0 }] }[type];
      try { s.animate(kf, { duration: 950, easing: 'ease-out' }).onfinish = () => s.remove(); } catch (e) { setTimeout(() => s.remove(), 950); } },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (i !== c.seat) { missOne('WRONG PLAYER \u00b7 THAT ONE IS HONEST'); shake(el); return; }
      if (!J.flashed) { toast('WAIT \u00b7 WATCH FIRST', 1.2); return; }
      addGold(4); ding(); el.style.outline = '4px solid #ec3013'; okTip('CAUGHT \u00b7 SECURITY IS ON THE WAY'); J.wait = 0.9; setTimeout(() => this.next(), 800); },
    next() { J.flashed = false; J.evT = 0.8; J.lastC = 0; roundNext(this, 'cheat', SCT); },
    tick(dt) { const c = J.list[J.ci]; if (c && J.wait <= 0) { J.lastC += dt; if ((J.evT -= dt) <= 0) { J.evT = rnd(0.45, 0.9);
        if (J.lastC > 1.4 && Math.random() < 0.45) { J.lastC = 0; J.flashed = true; this.fx(c.seat, c.type); } else { let s = Math.floor(Math.random() * 12); if (s === c.seat) s = (s + 5) % 12; this.fx(s, 'drink'); } } }
      roundTick(this, dt, SCT, 'TOO SLOW \u00b7 THE CHEAT CASHED OUT', () => (J.flashed ? '[data-s="' + J.list[J.ci].seat + '"]' : null)); if (J.hinted && !J.flashed) J.hinted = false; } };
  // ---------- 3 DOOR LIST (casino back door): guest list in, banned out, password in, Pepper scarves out ----------
  const GNAMES = ['ROSA REED', 'OTTO MILL', 'BEA BRAMBLE', 'TOMO FINCH', 'NELL ASH', 'MOSS GREY', 'PIP LARK', 'RUBY STONE', 'DUSTY OAKS', 'LUNA FERN', 'KIT MARSH', 'HAL VANE', 'CORA BAY', 'FINN TIDE'];
  const PASSW = ['BARNACLE', 'LIGHTHOUSE', 'ANCHOR', 'SEAGULL', 'DRIFTWOOD', 'LOBSTER'], SCARVES = [['#2e4a6b', 'NAVY'], ['#9aa0a6', 'GREY'], ['#2f7d5a', 'GREEN'], ['#ffd23a', 'YELLOW']];
  const DLT = 12, DLN = 8;
  GD.door = { panel: true, shot: () => [toW(-5.6, 1.4, 8.6), 3.6, 2.4, 0.18, 3.0, Math.PI, 5.5],
    begin() { goRoom(-5.6, 6.2, 0); const names = shuffle(GNAMES); J.guests = names.slice(0, 5); J.banned = names.slice(5, 7); J.pass = pick1(PASSW); const rest = names.slice(7);
      J.list = shuffle(['list', 'list', 'banned', 'pepper', 'pass', 'wrongpass', 'stranger', pick1(['list', 'pass', 'banned'])]).map(t => { const fur = pick1(FURS)[0];
        const name = t === 'list' || t === 'pepper' ? pick1(J.guests) : t === 'banned' ? pick1(J.banned) : pick1(rest), word = t === 'pass' ? J.pass : t === 'wrongpass' ? pick1(PASSW.filter(p => p !== J.pass)) : null;
        return { t, name, fur, word, scarf: t === 'pepper' ? ['#ec3013', 'PEPPER RED'] : pick1(SCARVES), ok: t === 'list' || t === 'pass' }; });
      J.ci = 0; J.cueT = DLT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci], w = wide();
      const lists = '<div style="flex:' + (w ? '0 0 34%' : 'none') + ';min-width:0;display:' + (w ? 'flex;flex-direction:column' : 'grid;grid-template-columns:repeat(2,minmax(0,1fr))') + ';gap:6px">'
        + '<div style="border:2px solid #201e1d;background:#fffdf3;padding:6px 8px"><div style="font-size:11px;font-weight:900;color:#2f7d5a">GUEST LIST</div>' + J.guests.map(n => '<div style="font-size:12px;font-weight:800;line-height:1.35">' + n + '</div>').join('') + '</div>'
        + '<div style="display:flex;flex-direction:column;gap:6px"><div style="border:2px solid #201e1d;background:#fff;padding:6px 8px"><div style="font-size:11px;font-weight:900;color:#ec3013">BANNED</div>' + J.banned.map(n => '<div style="font-size:12px;font-weight:800;line-height:1.35;text-decoration:line-through">' + n + '</div>').join('') + '</div>'
        + '<div style="border:2px solid #201e1d;background:#201e1d;color:#ffd23a;padding:6px 8px"><div style="font-size:11px;font-weight:900">PASSWORD TONIGHT</div><div style="font-size:16px;font-weight:900">' + J.pass + '</div></div></div></div>';
      const guest = c ? '<div style="display:flex;gap:10px;align-items:stretch;border:2px solid #201e1d;background:#fff;padding:8px"><div style="width:84px;flex:none"><div>' + faceSvg(c.fur) + '</div><div style="height:12px;background:' + c.scarf[0] + ';border:2px solid #201e1d;border-top:0"></div></div>'
        + '<div style="min-width:0;display:flex;flex-direction:column;justify-content:center;gap:4px"><div style="font-size:11px;font-weight:900;color:#5a1d26">AT THE BACK DOOR</div><div style="font-size:18px;font-weight:900;line-height:1.15">\u201cI AM ' + c.name + '.' + (c.word ? ' ' + c.word + '.' : '') + '\u201d</div><div style="font-size:12px;font-weight:800">SCARF \u00b7 ' + c.scarf[1] + '</div></div></div>' + timeRow
        + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><button data-a="1" style="' + BTN + ';min-height:64px;font-size:18px;background:#3f9a5e;color:#fff">LET IN</button><button data-a="0" style="' + BTN + ';min-height:64px;font-size:18px;background:#ec3013;color:#fff">TURN AWAY</button></div>' : '<div style="font-size:22px;font-weight:900">DOOR CLOSED FOR THE NIGHT</div>';
      showPanel(panelHead('DOOR LIST \u00b7 GUEST ' + nOf(), goldR()) + '<div style="flex:1;min-height:0;display:flex;flex-direction:' + (w ? 'row' : 'column') + ';gap:10px;padding:10px;box-sizing:border-box;overflow:auto">' + lists + '<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px">' + guest + '</div></div>' + tipBar('LIST OR PASSWORD = IN \u00b7 BANNED OR A RED PEPPER SCARF = OUT'));
      PANEL.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => this.pick(+b.dataset.a, b); }); J.idle = 0; J.hinted = false; },
    pick(a, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return;
      if ((a === 1) !== c.ok) { missOne({ list: 'ON THE GUEST LIST \u00b7 LET THEM IN', pass: 'RIGHT PASSWORD \u00b7 LET THEM IN', banned: 'BANNED \u00b7 OLD SALT WILL HEAR OF THIS', pepper: 'A PEPPER SCARF \u00b7 NO PEPPERS TONIGHT', wrongpass: 'WRONG PASSWORD \u00b7 TURN THEM AWAY', stranger: 'NOT ON THE LIST \u00b7 NO PASSWORD' }[c.t]); shake(el); }
      else { addGold(3); ding(); goodBtn(el); okTip(c.ok ? 'WELCOME IN' : c.t === 'pepper' ? 'NICE SCARF \u00b7 WRONG FAMILY' : 'NOT TONIGHT, FRIEND'); }
      J.wait = 1.0; setTimeout(() => this.next(), 900); },
    next() { roundNext(this, 'door', DLT); },
    tick(dt) { roundTick(this, dt, DLT, 'TOO SLOW \u00b7 THE QUEUE GOT LOUD', () => '[data-a="' + (J.list[J.ci].ok ? 1 : 0) + '"]'); } };
  // ---------- 4 "HONEST" DELIVERIES (walk Lakeside): four parcels to four doors, each before its time runs out ----------
  const CONTENTS = ['A BOX OF \u201cSALT\u201d', 'A PARCEL THAT TICKS', 'A HEAVY ENVELOPE', 'A SMALL BARREL', 'A SOCK, FULL', 'A CRATE MARKED FISH', 'A HAT BOX (NO HAT)'];
  const DLV = 4, lakeDoors = () => (clusters.spots || []).filter(s => s && /^cl:in:/.test(s.key)).map(s => ({ s, c: (L.CLUSTER_BUILDINGS || []).find(q => 'cl:in:' + q.key === s.key) })).filter(o => o.c && o.c.cl === 'pearl' && o.c.key !== 'saltHQ');
  const outside = P => !!P && Math.abs((P.y || 0) - LY) > 8;
  GD.deliver = { errand: true,
    begin() { const ds = pickN(lakeDoors(), DLV); if (!ds.length) { toast('NO DOORS FOUND', 2); stop(); return; } let from = LR.out || { x: OX, z: LZ };
      J.drops = ds.map(o => { const d = Math.hypot(o.s.x - from.x, o.s.z - from.z); from = o.s; return { x: o.s.x, z: o.s.z, name: o.c.title, what: pick1(CONTENTS), T: Math.max(40, Math.round(d / 3 + 25)), got: false }; });
      J.di = 0; J.left = J.drops[0].T; J.late = false; J.t0 = performance.now(); const o = LR.out || { x: OX, z: LZ, yaw: 0 }; let h = 0; try { h = groundH(o.x, o.z) || 0; } catch (e) {} go(o.x, h + 0.05, o.z, o.yaw || 0); toast('PARCEL 1 \u00b7 ' + J.drops[0].name, 2.4); },
    tick(dt) { const P = lastP, d = J.drops[J.di]; if (!P || !d) return; if (!J.late) { J.left -= dt; if (J.left <= 0) { J.late = true; J.left = 0; missOne('LATE \u00b7 STILL DELIVER IT', 2); } }
      if (outside(P) && Math.hypot(P.x - d.x, P.z - d.z) < 3.4) { d.got = true; addGold(J.late ? 1 : 4); ding(); toast(pick1(['NO QUESTIONS. THANK YOU.', 'PUT IT DOWN GENTLY. VERY GENTLY.', 'WE NEVER MET.', 'SALT, YES. OF COURSE. SALT.']), 2.2); J.di++; const n = J.drops[J.di];
        if (!n) { ARW.style.display = 'none'; addGold(6); finishGame(); return; } J.left = n.T; J.late = false; }
      const n = J.drops[J.di]; if (n) { let h = 0; try { h = groundH(n.x, n.z) || 0; } catch (e) {} if (outside(P)) arrowTo(V(n.x, h + 3, n.z), n.name + ' \u00b7 ' + Math.ceil(J.left) + ' S'); else ARW.style.display = 'none'; } },
    card() { const d = J.drops[J.di]; return { key: 'd' + J.di + Math.ceil(J.left / 2) + (lastP && outside(lastP) ? 'o' : 'i'), right: Math.ceil(J.left) + ' S', stop: true, next: lastP && !outside(lastP) ? 'GO OUTSIDE \u00b7 LAKESIDE' : 'FOLLOW THE ARROW',
      body: '<div style="display:flex;flex-direction:column;gap:3px;margin-top:6px">' + J.drops.map((o, i) => '<div style="font-size:12px;font-weight:900;display:flex;justify-content:space-between;gap:6px;' + (o.got ? 'opacity:.5;text-decoration:line-through' : i === J.di ? '' : 'opacity:.7') + '"><span>' + (o.got ? '\u2713 ' : '') + o.name + '</span><span>' + (i === J.di ? o.what : '') + '</span></div>').join('') + '</div>'
        + (d ? '<div style="height:6px;background:#e7e4dc;margin-top:6px"><div style="height:6px;width:' + (J.left / d.T * 100).toFixed(0) + '%;background:' + (J.left < 10 ? RED : '#b08a5e') + '"></div></div>' : '') + tipH('LAWYER', 'Do not open them. Do not shake them.') }; } };
  // ---------- 5 TIDY THE BOOKS (ledger desk): each receipt goes in THE BOOK or THE OTHER BOOK ----------
  const HONEST = ['CASINO COFFEE BEANS \u00b7 12 G', 'DUMP TRUCK TYRES \u00b7 40 G', 'FERRY TICKETS \u00b7 6 G', 'BISCUITS FOR THE COUSIN \u00b7 3 G', 'NEW DICE \u00b7 8 G', 'BOAT PAINT, BLUE \u00b7 22 G', 'DOORMAN UNIFORMS \u00b7 30 G', 'FISHING LICENCE \u00b7 5 G', 'CHIP POLISH \u00b7 4 G', 'CASINO LIGHT BULBS \u00b7 9 G'];
  const OTHER = ['BARRELS, NO LABEL, 2 AM \u00b7 200 G', 'CASH IN A SOCK \u00b7 150 G', 'A BOAT THAT WAS NOT THERE \u00b7 300 G', '\u201cSALT\u201d (NOT SALT) \u00b7 90 G', 'GIFT FOR A JUDGE \u00b7 120 G', 'CRATES MARKED FISH, NO FISH \u00b7 80 G', 'MIDNIGHT FERRY, LIGHTS OFF \u00b7 60 G', 'RELICS, NO PAPERS \u00b7 250 G'];
  const BKT = 8, BKN = 10;
  GD.books = { panel: true, shot: () => [toW(6.6, 1.3, 8.0), 3.6, 2.4, 0.3, 3.0, Math.PI, 5.5],
    begin() { goRoom(6.6, 6.0, 0); const h = pickN(HONEST, 5), o = pickN(OTHER, 5); J.list = shuffle([...h.map(t => ({ t, other: false })), ...o.map(t => ({ t, other: true }))]).slice(0, BKN); J.ci = 0; J.cueT = BKT; J.wait = 0.4; J.nB = 0; J.nO = 0; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('TIDY THE BOOKS \u00b7 RECEIPT ' + nOf(), goldR()) + body(c ? '<div style="border:2px solid #201e1d;background:#fffdf3;padding:10px 12px"><div style="font-size:11px;font-weight:900;color:#ec3013">RECEIPT</div><div style="font-size:20px;font-weight:900;line-height:1.2;text-wrap:pretty">' + c.t + '</div><div style="margin-top:8px">' + timeRow + '</div></div>'
        + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><button data-b="0" style="' + BTN + ';min-height:84px;background:#e7e4dc"><span style="display:block;font-size:18px">THE BOOK</span><span style="font-size:11px">' + J.nB + ' LINES \u00b7 FOR THE TAX FOX</span></button><button data-b="1" style="' + BTN + ';min-height:84px;background:#201e1d;color:#ffd23a"><span style="display:block;font-size:18px">THE OTHER BOOK</span><span style="font-size:11px">' + J.nO + ' LINES \u00b7 FAMILY EYES ONLY</span></button></div>'
        : '<div style="font-size:22px;font-weight:900">BOTH BOOKS TIDY</div>') + tipBar('NIGHT BOATS \u00b7 NO LABELS \u00b7 NO PAPERS \u00b7 CASH IN SOCKS = THE OTHER BOOK'));
      PANEL.querySelectorAll('[data-b]').forEach(b => { b.onclick = () => this.pick(+b.dataset.b, b); }); J.idle = 0; J.hinted = false; },
    pick(b, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if ((b === 1) !== c.other) { missOne(c.other ? 'THAT ONE IS FAMILY EYES ONLY' : 'THAT ONE IS HONEST \u00b7 THE BOOK'); shake(el); }
      else { addGold(2); tone(520, 0.05, 0.12, 'square'); tone(320, 0.05, 0.2, 'triangle', 0.08); goodBtn(el); if (b) J.nO++; else J.nB++; }
      J.wait = 0.6; setTimeout(() => this.next(), 500); },
    next() { roundNext(this, 'books', BKT); },
    tick(dt) { roundTick(this, dt, BKT, 'TOO SLOW \u00b7 THE RECEIPT BLEW AWAY', () => '[data-b="' + (J.list[J.ci].other ? 1 : 0) + '"]'); } };
  // ================= PRIZES =================
  const SUIT = { outfit: 'suit', torso: ['#e7e4dc', NAVY, NAVY2], name: 'SALT SUIT' };
  const GIFT = { suit: 'A SALT SUIT, your size. The family dresses its friends. The Tailor has a copy.', pin: 'The FAMILY PIN. Twenty percent off at the Family Pantry. Wear it on your collar.', trophy: 'All five. The SALT TROPHY goes in the case, with 60 gold. Old Salt wants a word.' };
  function giveGift() { save.setStat('sfhClears', save.stat('sfhClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('sfhSuit', false)) { save.setStat('sfhSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 2 && !save.stat('sfhPin', false)) { save.setStat('sfhPin', true); save.give('saltPin'); return 'pin'; }
    if (nd >= GAMES.length && !save.stat('sfhAll', false)) { save.setStat('sfhAll', true); save.give('saltTrophy'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function crystalCheck(then) { if (!allThree() || save.stat('sfhCrystal', false)) { then && then(); return false; } save.setStat('sfhCrystal', true); save.addRelic('saltCrystal'); crystal.visible = true; ding();
    sayTo(T_OS, [osLn('Three stars on every job. Take the FIRST SALT CRYSTAL. My grandmother dug it from the lake.')], () => { toast('RELIC \u00b7 FIRST SALT CRYSTAL', 2.6); then && then(); }); return true; }
  // KEEP QUIET or TIP OFF (after every clear)
  const TIPS = { count: 'THE CASINO TAKE IS BIGGER THAN THE BOOKS SAY', cheat: 'THE SALT CASINO WATCHES EVERY TABLE', door: 'WHO GETS THROUGH THE SALT BACK DOOR', deliver: 'SALT PARCELS THAT ARE NOT SALT', books: 'THE SALTS KEEP TWO BOOKS' };
  const favour = () => save.stat('sfhFavour', 0), tips = () => { const t = save.stat('sfhTips', null) || {}; return (t.paper || 0) + (t.buzz || 0); };
  function choiceAfter(g, then) { const told = save.stat('sfhTold', null) || {}, quiet = save.stat('sfhQuiet', null) || {};
    const tip = (who, name) => () => { const t = { ...(save.stat('sfhTips', null) || {}) }; t[who] = (t[who] || 0) + 1; save.setStat('sfhTips', t); const first = !told[g]; save.setStat('sfhTold', { ...told, [g]: who }); const gold = first ? 12 : 3; save.addGold(gold); coin();
      const st = save.stat('storySaltTips', null) || []; if (!st.includes(g)) save.setStat('storySaltTips', [...st, g]); toast(name + ' \u00b7 \u201c' + TIPS[g] + '\u201d \u00b7 +' + gold + ' G', 3.2); then && then(); };
    sayTo(T_LW, [{ ...lwLn('Naturally, what you saw today stays in the family. Yes?'), choices: [
      { text: 'KEEP QUIET', pick: () => { save.setStat('sfhFavour', favour() + 1); let g2 = 0; if (!quiet[g]) { save.setStat('sfhQuiet', { ...quiet, [g]: true }); g2 = 4; save.addGold(4); coin(); } sayTo(T_LW, [lwLn('Wise. The family remembers its friends.' + (g2 ? ' A little extra, for your trouble.' : ''))], then); } },
      { text: 'TIP OFF THE MERU DAILY', pick: tip('paper', 'MERU DAILY') }, { text: 'TIP OFF MERU BUZZ', pick: tip('buzz', 'MERU BUZZ') }] }]); }
  // FAMILY PANTRY (sideboard): the pin = 20% off
  const shopObj = new THREE.Object3D(); shopObj.position.set(9.0, 1.2, 5.2); G.add(shopObj);
  const SHOP = [['coinChoc', 'COIN CHOCOLATE', 6], ['energyPod', 'ENERGY FILL POD', 10], ['erToGo', 'ER TO GO', 10]];
  const price = p => (save.count('saltPin') ? Math.round(p * 0.8) : p);
  function shopMenu() { const T = { key: 'saltPantry', name: 'FAMILY PANTRY', role: 'SALT', obj: shopObj, r: 3 }, pin = !!save.count('saltPin');
    sayTo(T, [{ who: 'FAMILY PANTRY', role: pin ? 'FAMILY PIN \u00b7 20% OFF' : 'FAMILY PRICES WITH A PIN', text: pin ? 'A note on the jar: FRIENDS OF THE FAMILY, HELP YOURSELF. PAY THE TIN.' : 'A note on the jar: FULL PRICE FOR VISITORS. PAY THE TIN.',
      choices: [...SHOP.map(([id, n, p]) => ({ text: n + ' \u00b7 ' + price(p) + ' G', pick: () => { if (!save.spend(price(p))) { nope(); toast('NOT ENOUGH GOLD', 1.6); return; } save.give(id); coin(); toast(n + ' \u00b7 IN YOUR BAG', 1.8); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  function useItem(id) { if (id === 'saltPin' && save.count('saltPin')) { toast('SALT FAMILY PIN \u00b7 20% OFF AT THE FAMILY PANTRY', 2.4); return true; } if (id === 'saltTrophy' && save.count('saltTrophy')) { toast('THE SALT TROPHY \u00b7 FIVE FOR FIVE UPSTAIRS', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { count: 'Last night\u2019s casino take. Count each tray, pick the right total. The family hates loose change.', cheat: 'Four casino cameras. Somebody is cheating the house. Tap the cheat. Sleeves and chips, mostly.',
    door: 'The casino back door tonight. Guest list in, banned list out. The password works too.', deliver: 'Four parcels around Lakeside. Do not open them. Do not shake them. Be quick.', books: 'Two books. The book, and the other book. Sort each receipt. Night boats go in the other.' };
  const DONE = { count: 'Every tray counted. Not a coin missing. Old Salt will be pleased.', cheat: 'Caught them all. The house thanks you. The house always wins.', door: 'Right foxes in, wrong foxes out. A doorman\u2019s dream.', deliver: 'All delivered. Nobody asked what was inside. Perfect.', books: 'Both books tidy. Especially the other one.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; sayTo(T_LW, [lwLn(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('sfhVisits', save.stat('sfhVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0 }; const D = GD[g]; busy = D.errand ? 'errand' : 'job'; ding(); fade(() => D.begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('sfhDone', d); save.setStat('sfhLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const say = () => { const L1 = [lwLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(lwLn(GIFT[gift])); K.finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(1600 + k * 200, 0.02, 0.06, 'square', k * 0.06);
      sayTo(T_LW, L1, () => choiceAfter(g, () => { if (busy === 'end') { busy = null; J = null; } crystalCheck(); })); };
    fade(() => { cleanup(); goRoom(0, -4.6, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; } hidePanel(); hideCard(); ARW.style.display = 'none';
    lawyer.position.set(LW0[0], 0, LW0[1]); lawyer.rotation.y = LW0[2]; [lawyer, boss, ...workers].forEach(f => { f.userData.mood = f === boss ? 'warm' : 'neutral'; }); }
  function stop() { cleanup(); busy = null; J = null; }
  function quit() { if (busy === 'intro') { busy = null; return; } if (!J || busy === 'end') return; const wasOut = J.g === 'deliver'; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); if (wasOut) {} }
  // ================= camera (job shots) =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !fading && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on || snapK) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(snapK ? camT.pos : cam.position); } snapK = false; const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(clamp(camCur.pos.x, OX - 9.5, OX + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.3), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= talk + prompt =================
  const inRoom = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inLobby = P => !!P && Math.abs(P.x - LOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = p => GAMES.find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearLW = p => nearL(p, 0, -5.4, 1.4), nearOS = p => p.x > 4.2 && p.z < -4.2 && nearL(p, BOSS0[0], BOSS0[1], 3.0), nearShop = p => nearL(p, 8.4, 5.2, 1.4);
  const nearW = p => workers.findIndex(f => nearL(p, f.position.x, f.position.z, 1.6)), atCase = p => nearL(p, 8.4, -2.6, 1.2);
  const bossScene = () => save.stat('sfhAll', false) && !save.stat('sfhScene', false);
  function prompt(P) { if (busy) return null;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; return nearL(p, LLIFT[0], LLIFT[1], 1.6) ? 'LIFT \u00b7 UPSTAIRS' : nearL(p, LDESK[0], LDESK[1], 2.4) ? 'TALK \u00b7 BRINE' : null; }
    if (!inRoom(P)) return null; const p = toL(P); if (nearL(p, MAIN[0], MAIN[1], 1.0)) return 'LIFT \u00b7 DOWN TO THE LOBBY'; const r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearLW(p)) return 'TALK \u00b7 FAMILY LAWYER'; if (nearOS(p)) return bossScene() ? 'TALK \u00b7 OLD SALT \u00b7 SIT DOWN' : 'TALK \u00b7 OLD SALT'; if (nearShop(p)) return 'FAMILY PANTRY';
    const w = nearW(p); if (w >= 0) return 'TALK \u00b7 FAMILY CLERK'; if (atCase(p)) return 'TROPHY CASE'; return null; }
  let talkL = save.stat('sfhTalkedL', 0), talkO = save.stat('sfhTalkedO', 0), talkB = 0, talkW = 0;
  const LW_HI = ['Back again. The family has work. The family always has work.', 'Your file is getting thicker. In a good way. Mostly.', 'Old Salt asked about you. Twice. That is a lot, for him.'];
  function lwMenu() { const first = !talkL; talkL++; save.setStat('sfhTalkedL', talkL);
    sayTo(T_LW, [{ ...lwLn(first ? 'The family lawyer. I hire upstairs. Five jobs. All perfectly legal, as far as you know.' : LW_HI[(talkL - 2) % LW_HI.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) },
      { text: 'PICK A JOB', pick: () => sayTo(T_LW, [{ ...lwLn('Which one?'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'ARE THE SALTS HONEST?', pick: () => sayTo(T_LW, [lwLn('Legally speaking, yes. Ask me again with a contract.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_LW, [lwLn('Goodbye. This conversation never happened. Billing says it did.')]) }] }]); }
  const OS_HI = ['Sit, if you like. The chair is old. So am I.', 'The lake looks calm today. The lake always lies.', 'You work well. Quiet work is better.'];
  function osMenu() { const first = !talkO; talkO++; save.setStat('sfhTalkedO', talkO); if (crystalCheck()) return; const ch = [];
    if (bossScene()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneBoss() });
    ch.push({ text: 'THE BANDITS?', pick: () => sayTo(T_OS, [osLn('Somebody took my cousin\u2019s building. When I find out who, they will wish they took a holiday.')]) });
    ch.push({ text: 'THE CASINO?', pick: () => sayTo(T_OS, [osLn('The house always wins. That is not crime. That is maths.')]) });
    if (save.stat('sfhScene', false)) ch.push({ text: 'WHO PAYS BOTH FAMILIES?', pick: () => sayTo(T_OS, [osLn('Someone who sells locks. I said nothing. You heard nothing.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_OS, [osLn('Go well. Mind the stairs. Mind the papers.')]) });
    sayTo(T_OS, [{ ...osLn(first ? 'Old Salt. The lawyer says you work. Work is good. Quiet work is better.' : bossScene() ? 'There you are. Five jobs, five clears. Sit. We should talk.' : OS_HI[(talkO - 2) % OS_HI.length]), choices: ch }]); }
  function sceneBoss() { busy = 'scene'; save.setStat('sfhScene', true); const loyal = favour() >= tips(); save.setStat('storySaltLoyal', loyal);
    const end = () => { busy = null; save.setStat('storySaltScene', true); toast('STORY \u00b7 SOMEONE PAYS BOTH FAMILIES', 2.6); crystalCheck(); };
    sayTo(T_OS, [osLn('Five jobs. You counted, watched, kept the door, carried, and tidied.'),
      osLn(loyal ? 'And you kept quiet. In Meru, quiet is worth more than gold.' : 'The papers printed our books this week. A little bird talked. I know birds.'),
      { ...osLn('The bandits in my cousin\u2019s building? Paid with Pepper money. Or someone wants us to think so.'), choices: [
        { text: 'WHO WANTS A WAR?', pick: () => sayTo(T_OS, [osLn('Someone who sells locks to both sides. Keep the trophy. Keep listening.')], end) },
        { text: 'I WILL FIND OUT.', pick: () => sayTo(T_OS, [osLn(loyal ? 'Good. Do it quietly. You are family now.' : 'Good. Then tell me first. Not the papers.')], end) }] }]); }
  const BR = ln('Brine', 'SALT HQ FRONT DESK'), T_BR = () => ({ key: 'saltDesk', name: 'Brine', role: 'SALT HQ FRONT DESK', obj: LR.keeper || LG, r: 4 });
  function brMenu() { talkB++; const hi = talkB === 1 ? 'Salt Family HQ. Honest business, honest folk. Can I help you, or are you lost?' : save.stat('sfhAll', false) ? 'Our trophy winner. The family remembers. The family always remembers.' : 'Back again. The lawyer is hiring upstairs.';
    sayTo(T_BR(), [{ ...BR(hi), choices: [{ text: CHOICE_WORK, pick: () => sayTo(T_BR(), [BR('The lawyer hires upstairs. Lift on the left. Wipe your paws.')], () => upLift()) },
      { text: 'WHAT DOES THE FAMILY DO?', pick: () => sayTo(T_BR(), [BR('The casino, the dump, a few boats. Rumours say smuggling. Rumours should mind their manners.')]) },
      { text: 'THE PEPPERS?', pick: () => sayTo(T_BR(), [BR('We do not say that name in the lobby. Say it outside. Far outside.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const upLift = () => { liftDing(); fade(() => goRoom(0, 7.6, Math.PI)); setTimeout(() => K.chime(), 500); };
  const downLift = () => { liftDing(); fade(() => go(LOX + LLIFT[0] + 0.6, LY, LZ + LLIFT[1], Math.PI / 2)); };
  const W_LINES = ['Forty-one, forty-two... you made me lose count. Forty-one...', 'The other book is heavier. Funny, that.', 'Old Salt counts faster than me. In his head. Asleep.', 'Do not touch the scales. They are honest. Mostly.'];
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true; if (busy) return false;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; if (nearL(p, LLIFT[0], LLIFT[1], 1.6)) { upLift(); return true; } if (nearL(p, LDESK[0], LDESK[1], 2.4)) { tone(1320, 0.05, 0.5); brMenu(); return true; } return false; }
    if (!inRoom(P)) return false; const p = toL(P);
    if (nearL(p, MAIN[0], MAIN[1], 1.0)) { downLift(); return true; }
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; }
    if (nearLW(p)) { tone(1320, 0.05, 0.5); lwMenu(); return true; } if (nearOS(p)) { tone(660, 0.05, 0.6); osMenu(); return true; } if (nearShop(p)) { blip(); shopMenu(); return true; }
    const w = nearW(p); if (w >= 0) { const T = { key: 'saltClerk' + w, name: 'Family Clerk', role: 'SALT', obj: workers[w], r: 4 }; sayTo(T, [{ who: 'Family Clerk', role: 'SALT', text: W_LINES[(talkW++ + w) % W_LINES.length] }]); return true; }
    if (atCase(p)) { toast(save.stat('sfhAll', false) ? 'THE SALT TROPHY \u00b7 WON BY YOU' : 'TROPHY CASE \u00b7 EMPTY \u00b7 DO ALL 5 JOBS', 2.4); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, spawned = !/[?&]spawn=saltfloor/.test(location.search), spawnT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(0, 7.6, Math.PI); }
    const inR = inRoom(P), inL = inLobby(P); G.visible = inR || busy === 'job'; LG.visible = inL;
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; if (inR) { trophy.visible = !!save.stat('sfhAll', false); crystal.visible = !!save.stat('sfhCrystal', false); const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); viewM.color.set(n ? '#3a4560' : dusk ? '#e8b48a' : '#ffffff'); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('salt job: ' + (e && e.stack || e)); stop(); }
      if (J && D.card) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || goldR()) + foot(c.next, c.stop) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && GD[J.g].panel && !fading && GD[J.g].draw && J.list && J.ci < J.list.length) GD[J.g].draw();
    if (G.visible) { crystal.rotation.y += dt * 0.8; for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      const p = toL(P); for (let i = 0; i < 2; i++) { const f = workers[i]; kit.animFox(f, dt, 0, false); if (!busy && nearL(p, f.position.x, f.position.z, 4)) turnTo(f, Math.atan2(p.x - f.position.x, p.z - f.position.z), dt, 3); else { turnTo(f, W0[i][2], dt, 2); armUp(f, 1, 0.5 + Math.sin(t * 6 + i * 2) * 0.2, -1.0); } }
      kit.animFox(boss, dt, 0, false); if (!busy || busy === 'scene') { const dd = Math.hypot(p.x - boss.position.x, p.z - boss.position.z); turnTo(boss, dd < 6 ? Math.atan2(p.x - boss.position.x, p.z - boss.position.z) : BOSS0[2] + Math.sin(t * 0.25) * 0.5, dt, 2); } }
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: inR ? 0 : 99, talking: false, clear: endClear > 0 ? [0, -4.6, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { saltfloor: [OX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), up: upLift, down: downLift, scene: sceneBoss, choice: g => choiceAfter(g), lawyer, boss, workers, lakeDoors,
    _view(p, l, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p)); c.lookAt(toW(...l)); c.updateMatrixWorld(); const v = G.visible; G.visible = true; renderer.render(scene, c); G.visible = v; return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); } };
  window.__salt = API; return API;
}
