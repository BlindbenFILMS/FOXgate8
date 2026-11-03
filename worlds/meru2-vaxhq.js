// MERU 2.0 — s134 VAX HQ · TOP FLOOR [meruVaxHQ] ("cluster buildings part 5", Ben's picks: VAX only, every job deluxe · the LIFT takes you to a work floor ·
// all 6 jobs: MAILROOM SORT · SALES PITCH (Penn) · SECURITY GATE · PRODUCT TEST LAB · COFFEE RUN (to the CEO) · LIFT OPERATOR ·
// prizes: VAX SUIT (1st clear, Tailor) · STAFF BADGE (2 jobs: 20% off at the STAFF SHOP) · TROPHY in the case (all 6, + 60 gold) · CEO scene (all 6) ·
// relic VAX PRISM (3 stars on every job)).
// The TOP FLOOR = an extra room in the cluster lobby row (clusters.addRoom), reached by the left LIFT in the VAX lobby (quick fade).
// Kit pieces (panel, card, fade, arrow, job camera) follow worlds/meru2-tabloid.js. Stats prefix vxh.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildVaxHQ({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'vaxHQ'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, LOX = LR.ox, RH = 4.6;
  const SR = clusters.addRoom({ key: 'vaxFloor', room: 'meruVaxHQ', title: 'VAX \u00b7 TOP FLOOR' }, RH); SR.out = LR.out; const OX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', GRN = '#2f7d5a', GRN2 = '#1e3d2f', STEEL = '#9aa0a6', DARK = '#3d3b3a', BLACK = '#26292d', WOOD = '#5a3d26', GOLD = '#d7ad52', BLUE = '#2e86b8';
  const VCM = new THREE.MeshLambertMaterial({ vertexColors: true });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex),
      mesh(parent) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, VCM); m.userData.noCull = true; parent.add(m); return m; } }; };
  const plate = (txt, w, h, bg, fg, bar) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (bar) { g.fillStyle = bar; g.fillRect(0, 0, Math.max(8, W * 0.03), H); } g.fillStyle = fg; g.textBaseline = 'middle'; let s = Math.round(H * 0.6); g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > W * 0.86 && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.fillText(txt, bar ? W * 0.07 : W * 0.06, H / 2 + 2); });
  const planeT = (tex, w, h, x, y, z, ry, parent, mat) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat || new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.set(0, ry, 0); m.userData.noCull = true; parent.add(m); return m; };
  const rectL = (a, b, c, d) => cols.push({ f: [OX + a, OX + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'vaxTopFloor'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('vxhDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n);
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#7c4dc4', '#e7e4dc', '#3d2563'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  // ================= TOP FLOOR SHELL =================
  const R0 = mk(), { box, cyl, sph } = R0, WALL = '#ecebe6';
  box(20, 0.1, 20, '#cfc9bd', 0, -0.05, 0); for (let x = -9; x <= 9; x += 2) box(0.02, 0.012, 20, '#c2bbad', x, 0.006, 0);
  box(20, 0.2, 20, '#f3f2f2', 0, RH + 0.1, 0);
  box(20, 0.9, 0.3, WALL, 0, 0.45, -10); box(20, RH - 4.0, 0.3, WALL, 0, 4.0 + (RH - 4.0) / 2, -10);   // north: sill + header (the window band between)
  for (let x = -10; x <= 10; x += 2.5) box(0.12, 3.1, 0.14, INK, x, 2.45, -9.86);
  for (const s of [-1, 1]) box(0.3, RH, 20, WALL, s * 10, RH / 2, 0);
  box(20, RH, 0.3, WALL, 0, RH / 2, 10);
  box(20, 0.24, 0.06, GRN, 0, 0.12, 9.82); box(0.06, 0.24, 20, GRN, -9.82, 0.12, 0); box(0.06, 0.24, 20, GRN, 9.82, 0.12, 0);   // skirting
  rectL(-10, 10, -10.3, -9.7); rectL(9.8, 10.3, -10, 10); rectL(-10.3, -9.8, -10, 10); rectL(-10, 10, 9.8, 10.3);
  box(1.8, 0.02, 14.4, GRN, 0, 0.012, 1.8); for (const s of [-1, 1]) box(0.05, 0.022, 14.4, GOLD, s * 0.9, 0.014, 1.8);   // runner: lift → Penn's desk
  // MAIN LIFT (south centre) + SERVICE LIFT (south, x 5.5) with the operator's panel
  for (const lx of [0, 5.5]) { box(1.8, 2.7, 0.06, STEEL, lx, 1.35, 9.82); box(0.03, 2.7, 0.07, INK, lx, 1.35, 9.8); box(2.1, 0.14, 0.12, GOLD, lx, 2.78, 9.8); for (const s of [-1, 1]) box(0.14, 2.8, 0.12, GOLD, lx + s * 1.0, 1.4, 9.8); }
  box(0.5, 0.9, 0.12, INK, 6.9, 1.4, 9.78); for (let k = 0; k < 6; k++) box(0.12, 0.08, 0.04, k % 2 ? YEL : PAPER, 6.9, 1.08 + k * 0.12, 9.71);
  // SALES DESK (north, end of the runner) + the product shelf
  box(4.4, 0.08, 1.1, INK, 0, 1.02, -6.6); box(4.2, 0.98, 0.9, GRN, 0, 0.49, -6.6); box(4.2, 0.98, 0.04, GOLD, 0, 0.49, -6.13); rectL(-2.2, 2.2, -7.1, -6.1);
  for (const [x, c] of [[-1.5, RED], [-0.6, YEL], [1.2, BLUE]]) box(0.36, 0.3, 0.3, c, x, 1.21, -6.75);
  box(0.6, 0.44, 0.05, BLACK, 0.4, 1.32, -6.9, -0.2);
  // CEO CORNER OFFICE (NE): glass walls, door gap on the west side (z -7.2..-4.8)
  box(0.12, RH, 0.12, INK, 4, RH / 2, -4); box(0.12, RH, 0.12, INK, 4, RH / 2, -7.2); box(0.12, RH, 0.12, INK, 4, RH / 2, -4.8); box(6, 0.12, 0.12, INK, 7, 2.9, -4); box(0.12, 0.12, 2.8, INK, 4, 2.9, -8.6);
  rectL(3.9, 4.1, -10, -7.2); rectL(3.9, 4.1, -4.8, -3.9); rectL(4, 10, -4.1, -3.9);
  box(2.6, 0.1, 1.1, WOOD, 7.2, 0.95, -7.2); box(2.4, 0.9, 0.9, '#3d2a1c', 7.2, 0.45, -7.2); rectL(5.9, 8.5, -7.8, -6.6);
  box(0.8, 1.1, 0.8, '#7a1d2a', 7.2, 0.55, -8.6); box(0.8, 0.4, 0.2, '#7a1d2a', 7.2, 1.2, -9.0);
  for (const z of [-5.2]) { box(0.7, 0.45, 0.7, GRN, 5.4, 0.23, z); box(0.7, 0.55, 0.15, GRN, 5.4, 0.7, z + 0.3); circL(5.4, z, 0.5); }
  box(0.3, 0.02, 0.4, PAPER, 6.6, 1.01, -7.1, 0.3); cyl(0.1, 0.1, 0.03, GOLD, 8.0, 1.02, -7.0, 12);
  // DESK PODS (middle)
  for (const s of [-1, 1]) { const cx = s * 4.4; box(3.2, 0.08, 1.8, '#f3f2f2', cx, 0.9, 0.8); box(0.06, 0.86, 1.7, DARK, cx - 1.55, 0.43, 0.8); box(0.06, 0.86, 1.7, DARK, cx + 1.55, 0.43, 0.8); box(3.1, 0.32, 0.04, GRN, cx, 1.1, 0.8); rectL(cx - 1.6, cx + 1.6, -0.1, 1.7);
    for (const dx of [-0.8, 0.8]) for (const sz of [-1, 1]) { box(0.7, 0.44, 0.04, BLACK, cx + dx, 1.3, 0.8 + sz * 0.3); box(0.06, 0.12, 0.06, DARK, cx + dx, 1.0, 0.8 + sz * 0.3); } }
  // COFFEE BAR (east wall)
  box(1.2, 0.08, 3.8, INK, 9.2, 0.98, 1.1); box(1.1, 0.94, 3.7, '#e7e4dc', 9.2, 0.47, 1.1); rectL(8.6, 10, -0.8, 3.0);
  box(0.6, 0.7, 0.5, BLACK, 9.35, 1.37, 0.4); box(0.2, 0.08, 0.2, RED, 9.1, 1.5, 0.4); box(0.3, 0.04, 0.3, STEEL, 9.1, 1.04, 0.4);
  for (let k = 0; k < 4; k++) cyl(0.05, 0.04, 0.11, PAPER, 9.3, 1.08, 1.4 + k * 0.14, 8); box(0.25, 0.35, 0.18, PAPER, 9.4, 1.2, 2.3); box(0.2, 0.25, 0.2, '#7a5236', 9.4, 1.14, 2.7);
  // STAFF SHOP (vending machine, east wall south) + TROPHY CASE
  box(1.0, 2.1, 1.3, GRN, 9.4, 1.05, 6.4); box(0.06, 1.3, 0.9, '#bcd4e6', 8.88, 1.3, 6.3); for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) box(0.08, 0.16, 0.16, [RED, YEL, BLUE][(r + q) % 3], 8.94, 0.9 + r * 0.4, 6.0 + q * 0.3); rectL(8.8, 10, 5.7, 7.1);
  box(0.9, 0.9, 1.2, INK, 9.35, 0.45, -2.6); box(0.85, 1.0, 1.15, '#d6e8f0', 9.35, 1.4, -2.6); rectL(8.8, 10, -3.3, -1.9);
  // MAIL RACK (west wall): 6 pigeonholes + cart
  box(0.7, 2.3, 4.0, '#7a5236', -9.55, 1.15, 0.2); for (let k = 0; k < 6; k++) { box(0.04, 0.5, 0.56, ['#ec3013', '#ffd23a', '#e07a1f', '#7c4dc4', '#2e86b8', '#2f7d5a'][k], -9.18, 1.55 + Math.floor(k / 3) * -0.7 + 0.35, -1.0 + (k % 3) * 1.2); }
  rectL(-10, -9.1, -1.8, 2.2); box(1.0, 0.7, 0.7, STEEL, -8.0, 0.45, 3.4); for (let k = 0; k < 4; k++) box(0.4, 0.26, 0.34, '#c9a27a', -8.1 + (k % 2) * 0.42, 0.93 + Math.floor(k / 2) * 0.27, 3.4); circL(-8.0, 3.4, 0.7);
  // TEST LAB (NW): bench + gadgets
  box(4.2, 0.08, 1.2, '#f3f2f2', -6.8, 0.95, -8.4); box(4.0, 0.9, 1.0, STEEL, -6.8, 0.45, -8.4); rectL(-8.9, -4.7, -9.1, -7.8);
  box(0.4, 0.3, 0.3, '#c0c4c8', -8.2, 1.14, -8.4); box(0.3, 0.4, 0.3, '#e07a1f', -7.4, 1.19, -8.5); cyl(0.14, 0.14, 0.3, RED, -6.4, 1.14, -8.4, 12); box(0.5, 0.06, 0.5, INK, -5.4, 1.02, -8.4); box(0.8, 0.5, 0.05, BLACK, -6.0, 1.5, -8.95);
  // SECURITY DESK (SW, by the lift) + turnstiles
  box(2.8, 0.08, 1.0, INK, -5.6, 1.02, 7.6); box(2.6, 0.98, 0.8, GRN2, -5.6, 0.49, 7.6); rectL(-7.0, -4.2, 7.1, 8.1); for (const dx of [-0.7, 0.7]) box(0.56, 0.36, 0.04, BLACK, -5.6 + dx, 1.3, 7.85, Math.PI);
  for (const z of [4.6, 6.0]) { box(0.3, 1.0, 0.3, STEEL, -8.4, 0.5, z); box(0.9, 0.05, 0.05, GOLD, -7.9, 0.9, z + 0.25); circL(-8.4, z, 0.3); }
  // plants + light strips
  for (const [x, z] of [[-9.1, -9.1], [-9.1, 9.1], [3.4, -9.1], [9.1, 9.1]]) { cyl(0.3, 0.24, 0.5, INK, x, 0.25, z, 10); sph(0.55, '#4f7d3a', x, 0.95, z); sph(0.4, '#5f8d48', x - 0.15, 1.35, z + 0.15); circL(x, z, 0.5); }
  const LAMPS = [[-5, -5], [0, -3], [-5, 2], [5, 2], [-5, 7], [2.5, 7], [7, -7]]; for (const [x, z] of LAMPS) box(0.36, 0.05, 2.4, '#f6f6f0', x, RH - 0.05, z);
  R0.mesh(G);
  // glass (CEO office walls) + the window view
  const glassM = new THREE.MeshLambertMaterial({ color: '#bcd4e6', transparent: true, opacity: 0.28, depthWrite: false });
  for (const [w, x, z, ry] of [[6, 7, -4, 0], [2.8, 4, -8.6, Math.PI / 2], [0.8, 4, -4.4, Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 2.8), glassM); m.position.set(x, 1.45, z); m.rotation.y = ry; m.userData.noCull = true; m.renderOrder = 3; G.add(m); }
  const viewT = CT(1024, 160, (g, W, H) => { const sky = g.createLinearGradient(0, 0, 0, H * 0.6); sky.addColorStop(0, '#8fc3e8'); sky.addColorStop(1, '#d9ecf6'); g.fillStyle = sky; g.fillRect(0, 0, W, H); g.fillStyle = '#5b8fb0'; g.fillRect(0, H * 0.62, W, H);
    for (let i = 0; i < 26; i++) { const x = (i * 97) % W, w = 14 + (i * 13) % 26, h = 18 + (i * 37) % 52; g.fillStyle = i % 3 ? '#7f8c99' : '#a3adb6'; g.fillRect(x, H * 0.62 - h, w, h); }
    g.fillStyle = '#5d6f82'; g.fillRect(W * 0.72, H * 0.62 - 92, 12, 92); g.beginPath(); g.moveTo(W * 0.72, H * 0.62 - 92); g.lineTo(W * 0.72 + 6, H * 0.62 - 110); g.lineTo(W * 0.72 + 12, H * 0.62 - 92); g.fill();
    g.fillStyle = '#4f7d3a'; g.beginPath(); g.ellipse(W * 0.3, H * 0.66, 90, 7, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,0.5)'; for (let i = 0; i < 40; i++) g.fillRect((i * 53) % W, H * 0.7 + (i * 7) % 40, 18, 2); });
  const viewM = new THREE.MeshBasicMaterial({ map: viewT }); planeT(null, 20, 3.1, 0, 2.45, -9.84, 0, G, viewM);
  planeT(plate('VAX \u00b7 TOP FLOOR', 512, 96, INK, PAPER, GRN), 2.4, 0.45, 0, 3.4, 9.83, Math.PI, G);
  planeT(plate('LIFT \u00b7 LOBBY', 384, 96, INK, PAPER, RED), 1.5, 0.36, 0, 3.05, 9.82, Math.PI, G);
  planeT(plate('SERVICE LIFT', 384, 96, INK, PAPER, RED), 1.6, 0.38, 5.5, 3.05, 9.82, Math.PI, G);
  planeT(plate('SALES \u00b7 PENN', 384, 96, GRN, PAPER, GOLD), 1.6, 0.4, 0, 1.75, -6.0, 0, G);
  planeT(plate('MAILROOM', 384, 96, INK, PAPER, RED), 1.6, 0.38, -9.83, 3.2, 0.2, Math.PI / 2, G);
  planeT(plate('TEST LAB', 384, 96, INK, PAPER, RED), 1.6, 0.38, -9.83, 3.2, -7.6, Math.PI / 2, G);
  planeT(plate('COFFEE BAR', 384, 96, INK, PAPER, RED), 1.6, 0.38, 9.83, 2.9, 1.1, -Math.PI / 2, G);
  planeT(plate('STAFF SHOP', 384, 96, GRN, PAPER, GOLD), 1.3, 0.34, 9.83, 2.5, 6.4, -Math.PI / 2, G);
  planeT(plate('SECURITY', 384, 96, INK, PAPER, RED), 1.5, 0.36, -5.6, 2.2, 9.83, Math.PI, G);
  planeT(plate('VAX \u00b7 CHIEF EXECUTIVE', 512, 96, INK, GOLD, GOLD), 2.2, 0.42, 9.83, 2.6, -7.2, -Math.PI / 2, G);
  planeT(plate('VAX', 256, 96, GRN, PAPER), 0.9, 0.34, 7.0, 3.3, -3.98, Math.PI, G);
  // TROPHY in the case (all 6) + the PRISM on the CEO desk (relic, 3 stars everywhere)
  const trophy = new THREE.Group(); { const S = mk(); S.cyl(0.14, 0.18, 0.1, INK, 0, 0.05, 0, 12); S.cyl(0.04, 0.04, 0.24, GOLD, 0, 0.22, 0, 8); S.cyl(0.18, 0.08, 0.26, GOLD, 0, 0.47, 0, 12); for (const s of [-1, 1]) S.box(0.06, 0.16, 0.04, GOLD, s * 0.2, 0.5, 0); S.box(0.22, 0.06, 0.02, GRN, 0, 0.06, 0.16); S.mesh(trophy); }
  trophy.position.set(9.35, 0.92, -2.6); G.add(trophy); trophy.visible = false;
  const prism = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), new THREE.MeshLambertMaterial({ color: '#9fe3ff', emissive: '#2e86b8', emissiveIntensity: 0.4 })); prism.position.set(7.9, 1.2, -7.3); prism.userData.noCull = true; G.add(prism); prism.visible = false;
  // ================= LOBBY: the lift sign =================
  const LG = new THREE.Group(); LG.position.set(LOX, LY, LZ); scene.add(LG); LG.visible = false;
  planeT(plate('TOP FLOOR \u00b7 WORK', 512, 96, INK, PAPER, GRN), 1.7, 0.32, -GEO.RW / 2 + 0.26, 3.15, -4, Math.PI / 2, LG);
  const LLIFT = [-8.4, -4], LDESK = [0, -5], MAIN = [0, 9.0];
  // ================= FOXES =================
  const PN0 = [0, -7.8, 0], CEO0 = [7.2, -8.3, 0], W0 = [[-4.4, 2.3, Math.PI], [4.4, 2.3, Math.PI]];
  const penn = kit.makeFox({ key: 'vaxSales', name: 'Penn', torso: ['#f3f2f2', GRN, GRN2], outfit: 'suit', mood: 'happy' }); penn.position.set(PN0[0], 0, PN0[1]); penn.rotation.y = PN0[2]; penn.userData.noCull = true; penn.userData.rosterShop = 'VAX HQ'; penn.userData.rosterRole = 'keeper'; G.add(penn);
  const ceo = kit.makeFox({ key: 'vaxCEO', name: 'Vax', torso: ['#201e1d', GOLD, '#111111'], outfit: 'suit', mood: 'warm' }); ceo.position.set(CEO0[0], 0, CEO0[1]); ceo.rotation.y = CEO0[2]; ceo.userData.noCull = true; ceo.userData.rosterShop = 'VAX HQ'; G.add(ceo); circL(CEO0[0], CEO0[1], 0.45);
  const workers = W0.map(([x, z, ry], i) => { const f = kit.makeFox({ key: 'vaxWorker' + i, name: 'Office Worker', torso: LOOKS[i * 3], outfit: i ? 'vest' : 'coat', mood: 'neutral' }); f.position.set(x, 0, z); f.rotation.y = ry; f.userData.noCull = true; f.userData.rosterShop = 'VAX HQ'; G.add(f); circL(x, z, 0.45); return f; });
  // ================= shopKit (Penn = keeper) =================
  const GAMES = [{ k: 'sales', name: 'Sales Pitch', color: GRN }, { k: 'mail', name: 'Mailroom Sort', color: '#e07a1f' }, { k: 'gate', name: 'Security Gate', color: INK },
    { k: 'lab', name: 'Product Test Lab', color: BLUE }, { k: 'coffee', name: 'Coffee Run', color: '#7a5236' }, { k: 'lift', name: 'Lift Operator', color: RED }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { sales: [-2.2, -5.0], mail: [-7.8, 0.2], lab: [-6.8, -6.6], gate: [-5.6, 6.0], coffee: [7.6, 1.1], lift: [5.5, 7.9] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'vxh', color: GRN, boardTitle: 'VAX staff board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper: penn, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -8.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: -2.8, z: 8.2, ry: 0 }, hiringLine: 'MAIL \u00b7 SALES \u00b7 COFFEE \u00b7 LIFTS', sun: [{ x: -5, z: -7.6, w: 3.2, d: 2.2 }, { x: 1.6, z: -3.8, w: 3.2, d: 2.2 }, { x: -1.4, z: -8.2, w: 2.4, d: 1.6 }],
    lamps: LAMPS.map(([x, z]) => [x, RH - 0.3, z]), lampsOn: () => { const h = hour(); return h >= 19 || h < 7; },
    browse: [[2.2, 3.2, Math.PI / 2], [-2.2, 3.4, -Math.PI / 2], [7.0, 4.0, Math.PI / 2]], looks: [LOOKS[1], LOOKS[2], LOOKS[4]], clock: { x: 2.8, y: 3.4, z: 9.83, ry: Math.PI } });
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
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + GRN + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
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
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + GRN + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span data-h style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const tipBar = t => '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + t + '</div>';
  const showPanel = (html, onStop) => { fitPanel(); PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => (onStop ? onStop() : quit()); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none' && J && GD[J.g] && GD[J.g].draw && !(J.g === 'coffee' && !J.brew)) { fitPanel(); GD[J.g].draw(); } });
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
  const T_PN = { key: 'vaxSales', name: 'Penn', role: 'VAX HEAD OF SALES', obj: penn, ry: PN0[2], r: 6 }, pnLn = ln('Penn', 'VAX HEAD OF SALES');
  const T_CEO = { key: 'vaxCEO', name: 'Vax', role: 'VAX CHIEF EXECUTIVE', obj: ceo, ry: CEO0[2], r: 6 }, ceoLn = ln('Vax', 'VAX CHIEF EXECUTIVE');
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
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'VAX');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;
  // ---------- 1 SALES PITCH (Penn's desk): match the product to the customer's problem ----------
  const PITCH = [['I keep losing my keys. Every morning.', 'VAX BEEPING KEYRING'], ['I am late for the ferry every day.', 'VAX VERY LOUD ALARM CLOCK'], ['My tea goes cold before I drink it.', 'VAX SINGING KETTLE'],
    ['My socks never match. Never!', 'VAX SOCKS THAT PAIR THEMSELVES'], ['It always rains on my walk to work.', 'VAX POCKET UMBRELLA'], ['My flat is so dark in winter.', 'VAX SUNNY LAMP'],
    ['I lose my phone in the sofa. Daily.', 'VAX SOFA WITH A PHONE IN IT'], ['I forget my friends\u2019 birthdays.', 'VAX REMINDER WATCH'], ['My plants keep dying.', 'VAX TALKING WATERING CAN']];
  const SPT = 12, SPN = 6;
  GD.sales = { panel: true, shot: () => [toW(0, 1.3, -6.4), 3.6, 2.4, 0.18, 3.2, 0.2, 6],
    begin() { goRoom(-1.6, -4.9, Math.PI); J.list = pickN(PITCH, SPN).map(p => ({ p, opts: shuffle([p[1], ...pickN(PITCH.filter(q => q !== p).map(q => q[1]), 2)]) })); J.ci = 0; J.cueT = SPT; J.wait = 0.4; snapK = true; this.cust(); this.draw(); },
    cust() { if (J.cf) { J.cf.parent && J.cf.parent.remove(J.cf); J.objs = J.objs.filter(o => o !== J.cf); } if (J.ci >= J.list.length) return; const f = kit.makeFox({ key: 'vaxCustomer' + J.ci, name: 'Customer', torso: LOOKS[J.ci % LOOKS.length], outfit: ['coat', 'dress', 'vest', 'robe'][J.ci % 4], mood: 'neutral' }); f.position.set(0.9, 0, -5.2); f.rotation.y = Math.PI; f.userData.noCull = true; f.userData.crowd = true; G.add(f); J.objs.push(f); J.cf = f; },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('SALES PITCH \u00b7 CUSTOMER ' + nOf(), goldR()) + body(c ? '<div style="border:2px solid #201e1d;padding:6px 10px;background:#fff"><div style="font-size:11px;font-weight:900;color:#ec3013">THE CUSTOMER SAYS</div><div style="font-size:20px;font-weight:900;line-height:1.2;text-wrap:pretty">\u201c' + c.p[0] + '\u201d</div><div style="margin-top:6px">' + timeRow + '</div></div>'
        + '<div style="font-size:11px;font-weight:900">PICK THE PRODUCT</div>' + c.opts.map((o, i) => '<button data-i="' + i + '" style="' + BTN + ';flex:none;font-size:16px">' + o + '</button>').join('') : '<div style="font-size:22px;font-weight:900">EVERYONE BOUGHT SOMETHING</div>') + tipBar('LISTEN TO THE PROBLEM \u00b7 SELL THE FIX'));
      PANEL.querySelectorAll('[data-i]').forEach(b => { b.onclick = () => this.pick(+b.dataset.i, b); }); J.idle = 0; J.hinted = false; },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (c.opts[i] !== c.p[1]) { wrongBtn(el, 'NOT WHAT THEY NEED \u00b7 LISTEN AGAIN'); if (J.cf) J.cf.userData.mood = 'angry'; return; }
      addGold(4); ding(); goodBtn(el); okTip('SOLD! \u00b7 PENN: THAT IS THE VAX WAY'); if (J.cf) J.cf.userData.mood = 'happy'; J.wait = 1.0; J.wave = 0.9; setTimeout(() => this.next(), 900); },
    next() { roundNext(this, 'sales', SPT); if (J && J.g === 'sales') this.cust(); },
    tick(dt, t) { roundTick(this, dt, SPT, 'TOO SLOW \u00b7 THE CUSTOMER WALKED OFF', () => '[data-i="' + J.list[J.ci].opts.indexOf(J.list[J.ci].p[1]) + '"]'); kit.animFox(penn, dt, 0, false); if (J.cf) kit.animFox(J.cf, dt, 0, false);
      if ((J.wave = (J.wave || 0) - dt) > 0) armUp(penn, 1, 2.4 + Math.sin(t * 12) * 0.3); else armUp(penn, 1, 0.5 + Math.sin(t * 5) * 0.25, -0.6); } };
  // ---------- 2 MAILROOM SORT (west rack): parcel → the right floor (by department or by name) ----------
  const DEPTS = [['LOBBY', 1, '#ec3013'], ['PHONES', 9, '#ffd23a'], ['SOUP', 17, '#e07a1f'], ['SOFAS', 25, '#7c4dc4'], ['SATELLITES', 33, '#2e86b8'], ['TOP FLOOR', 40, '#2f7d5a']];
  const STAFF = [['GLOSSA', 'LOBBY'], ['MS. RING', 'PHONES'], ['CHEF BROTH', 'SOUP'], ['MR. CUSHION', 'SOFAS'], ['DR. ORBIT', 'SATELLITES'], ['PENN', 'TOP FLOOR'], ['VAX', 'TOP FLOOR'], ['DIAL', 'PHONES'], ['LADLE', 'SOUP']];
  const MST = 9, MSN = 10;
  GD.mail = { panel: true, shot: () => [toW(-9.0, 1.4, 0.2), 4.2, 2.6, 0.15, 3.2, Math.PI / 2, 6],
    begin() { goRoom(-7.6, 0.2, -Math.PI / 2); J.list = [...Array(MSN)].map((_, i) => { if (i % 2) { const s = STAFF[Math.floor(Math.random() * STAFF.length)]; return { to: s[0], d: s[1], byName: true }; } const d = DEPTS[Math.floor(Math.random() * DEPTS.length)]; return { to: d[0] + ' DEPT', d: d[0] }; });
      J.ci = 0; J.cueT = MST; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci], w = wide();
      const dir = '<div style="flex:' + (w ? '0 0 36%' : 'none') + ';min-width:0;border:2px solid #201e1d;background:#fffdf3;padding:6px 10px;' + (w ? 'overflow:auto' : '') + '"><div style="font-size:11px;font-weight:900;color:#2f7d5a">STAFF DIRECTORY</div>' + STAFF.map(s => '<div style="font-size:13px;font-weight:800;line-height:1.4;border-bottom:1px dashed #cfcac3;display:flex;justify-content:space-between;gap:6px"><span>' + s[0] + '</span><span>' + s[1] + '</span></div>').join('') + '</div>';
      showPanel(panelHead('MAILROOM SORT \u00b7 PARCEL ' + nOf(), goldR()) + '<div style="flex:1;min-height:0;display:flex;flex-direction:' + (w ? 'row' : 'column') + ';gap:10px;padding:10px;box-sizing:border-box;overflow:auto">' + dir
        + '<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px">' + (c ? '<div style="border:2px solid #201e1d;background:#c9a27a;padding:8px 10px"><div style="font-size:11px;font-weight:900">PARCEL \u00b7 TO</div><div style="font-size:24px;font-weight:900;line-height:1.1">' + c.to + '</div></div>' + timeRow
          + '<div style="display:grid;grid-template-columns:repeat(' + (innerWidth < 420 ? 2 : 3) + ',minmax(0,1fr));gap:8px">' + DEPTS.map(d => '<button data-d="' + d[0] + '" style="' + BTN + ';border-left:10px solid ' + d[2] + '"><span style="display:block;font-size:20px">' + d[1] + '</span><span style="font-size:12px">' + d[0] + '</span></button>').join('') + '</div>' : '<div style="font-size:22px;font-weight:900">ALL SORTED</div>') + '</div></div>'
        + tipBar(c && c.byName ? 'A NAME? FIND IT IN THE DIRECTORY' : 'TAP THE FLOOR FOR THAT DEPARTMENT'));
      PANEL.querySelectorAll('[data-d]').forEach(b => { b.onclick = () => this.pick(b.dataset.d, b); }); J.idle = 0; J.hinted = false; },
    pick(d, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (d !== c.d) { wrongBtn(el, 'WRONG FLOOR \u00b7 CHECK THE DIRECTORY'); return; }
      addGold(2); tone(520, 0.05, 0.12, 'square'); tone(320, 0.05, 0.2, 'triangle', 0.08); goodBtn(el); J.wait = 0.5; setTimeout(() => this.next(), 450); },
    next() { roundNext(this, 'mail', MST); },
    tick(dt) { roundTick(this, dt, MST, 'TOO SLOW \u00b7 THE PARCEL PILES UP', () => '[data-d="' + J.list[J.ci].d + '"]'); } };
  // ---------- 3 SECURITY GATE (SW desk): check badges against the list, spot the fakes ----------
  const VNAMES = ['ROSA REED', 'OTTO MILL', 'BEA BRAMBLE', 'TOMO FINCH', 'NELL ASH', 'MOSS GREY', 'PIP LARK', 'RUBY STONE', 'DUSTY OAKS', 'LUNA FERN', 'KIT MARSH', 'HAL VANE'];
  const FURS = [['#e07a1f', 'ORANGE'], ['#9aa0a6', 'GREY'], ['#f3f2f2', 'WHITE'], ['#5a3d26', 'BROWN'], ['#201e1d', 'BLACK']];
  const GTT = 12, GTN = 8;
  const faceSvg = c => '<svg viewBox="0 0 40 40" style="width:100%;height:auto;display:block" aria-hidden="true"><rect width="40" height="40" fill="#d9ecf6"/><polygon points="7,16 12,3 18,14" fill="' + c + '" stroke="#201e1d" stroke-width="1.5"/><polygon points="22,14 28,3 33,16" fill="' + c + '" stroke="#201e1d" stroke-width="1.5"/><circle cx="20" cy="23" r="13" fill="' + c + '" stroke="#201e1d" stroke-width="1.5"/><ellipse cx="20" cy="29" rx="7" ry="5" fill="#fff"/><circle cx="15" cy="21" r="2.4" fill="#201e1d"/><circle cx="25" cy="21" r="2.4" fill="#201e1d"/><ellipse cx="20" cy="30" rx="2.4" ry="3" fill="#201e1d"/></svg>';
  GD.gate = { panel: true, shot: () => [toW(-5.6, 1.3, 7.0), 3.6, 2.4, 0.2, 3.2, Math.PI - 0.2, 6],
    begin() { goRoom(-5.6, 6.0, 0); const list = pickN(VNAMES, 5), d = today(); J.vlist = list;
      J.list = [...Array(GTN)].map((_, i) => { const fur = FURS[Math.floor(Math.random() * FURS.length)], fault = Math.random() < 0.45 ? ['list', 'date', 'photo', 'logo'][Math.floor(Math.random() * 4)] : null;
        const name = fault === 'list' ? pickN(VNAMES.filter(n => !list.includes(n)), 1)[0] : list[i % list.length]; const photo = fault === 'photo' ? pickN(FURS.filter(f => f !== fur), 1)[0] : fur;
        return { name, fur, photo, valid: fault === 'date' ? Math.max(0, d - 1 - Math.floor(Math.random() * 3)) : d + Math.floor(Math.random() * 4), logo: fault === 'logo' ? ['VEX', 'VAKS', 'VAXX'][Math.floor(Math.random() * 3)] : 'VAX', fault }; });
      J.ci = 0; J.cueT = GTT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci], w = wide(), d = today();
      const vl = '<div style="flex:' + (w ? '0 0 32%' : 'none') + ';min-width:0;border:2px solid #201e1d;background:#fffdf3;padding:6px 10px"><div style="font-size:11px;font-weight:900;color:#2f7d5a">VISITORS TODAY \u00b7 DAY ' + d + '</div>' + J.vlist.map(n => '<div style="font-size:13px;font-weight:800;line-height:1.4;border-bottom:1px dashed #cfcac3">' + n + '</div>').join('') + '</div>';
      const badge = c ? '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px"><div style="border:2px solid #201e1d;padding:6px;background:#fff"><div style="font-size:11px;font-weight:900;margin-bottom:4px">AT THE GATE</div><div style="max-width:110px">' + faceSvg(c.fur[0]) + '</div><div style="font-size:12px;font-weight:900;margin-top:4px">\u201cHI, I AM ' + c.name + '.\u201d</div></div>'
        + '<div style="border:2px solid #201e1d;padding:6px;background:#2f7d5a;color:#fff"><div style="font-size:16px;font-weight:900;color:#ffd23a">' + c.logo + ' \u00b7 VISITOR</div><div style="display:flex;gap:6px;align-items:center;margin-top:4px"><div style="width:44px;flex:none;border:2px solid #fff">' + faceSvg(c.photo[0]) + '</div><div style="min-width:0"><div style="font-size:13px;font-weight:900;line-height:1.15">' + c.name + '</div><div style="font-size:11px;font-weight:800">VALID TO DAY ' + c.valid + '</div></div></div></div></div>' + timeRow
        + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><button data-a="1" style="' + BTN + ';min-height:64px;font-size:20px;background:#3f9a5e;color:#fff">ALLOW</button><button data-a="0" style="' + BTN + ';min-height:64px;font-size:20px;background:#ec3013;color:#fff">DENY</button></div>' : '<div style="font-size:22px;font-weight:900">GATE CLEAR</div>';
      showPanel(panelHead('SECURITY GATE \u00b7 VISITOR ' + nOf(), goldR()) + '<div style="flex:1;min-height:0;display:flex;flex-direction:' + (w ? 'row' : 'column') + ';gap:10px;padding:10px;box-sizing:border-box;overflow:auto">' + vl + '<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px">' + badge + '</div></div>' + tipBar('NAME ON THE LIST \u00b7 DATE OK \u00b7 PHOTO MATCHES \u00b7 REAL LOGO'));
      PANEL.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => this.pick(+b.dataset.a, b); }); J.idle = 0; J.hinted = false; },
    pick(a, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; const ok = !c.fault;
      if (a === 1 && !ok) { missOne({ list: 'NOT ON THE LIST \u00b7 A FAKE GOT IN', date: 'OUT OF DATE \u00b7 CHECK THE DAY', photo: 'WRONG PHOTO \u00b7 LOOK AT THE FUR', logo: 'FAKE LOGO \u00b7 ' + c.logo + ' IS NOT VAX' }[c.fault]); shake(el); }
      else if (a === 0 && ok) { missOne('THAT BADGE WAS REAL \u00b7 LET THEM IN'); shake(el); }
      else { addGold(3); ding(); goodBtn(el); okTip(ok ? 'WELCOME TO VAX' : { list: 'CAUGHT \u00b7 NOT ON THE LIST', date: 'CAUGHT \u00b7 OUT OF DATE', photo: 'CAUGHT \u00b7 WRONG PHOTO', logo: 'CAUGHT \u00b7 FAKE LOGO' }[c.fault]); }
      J.wait = 1.0; setTimeout(() => this.next(), 900); },
    next() { roundNext(this, 'gate', GTT); },
    tick(dt) { roundTick(this, dt, GTT, 'TOO SLOW \u00b7 THE QUEUE GOT GRUMPY', () => '[data-a="' + (J.list[J.ci].fault ? 0 : 1) + '"]'); } };
  // ---------- 4 PRODUCT TEST LAB (NW bench): run the test, read the gauge, PASS or FAIL ----------
  const GADGETS = [['VAX TOASTER', 'TOAST TIME', 'S', 50, 70, 120], ['VAX SINGING KETTLE', 'SONG VOLUME', 'DB', 40, 60, 100], ['VAX ROBOT MOP', 'BATTERY', 'MIN', 90, 120, 180], ['VAX SUNNY LAMP', 'BRIGHTNESS', 'LUX', 800, 1000, 1500],
    ['VAX POCKET UMBRELLA', 'LEAKS', 'DROPS', 0, 2, 20], ['VAX LOUD ALARM CLOCK', 'LOUDNESS', 'DB', 70, 90, 140], ['VAX BEEPING KEYRING', 'BEEPS', 'BEEPS', 3, 5, 12], ['VAX SOUP FLASK', 'SOUP HEAT', '\u00b0C', 60, 80, 120]];
  const LBT = 14, LBN = 6;
  GD.lab = { panel: true, shot: () => [toW(-6.8, 1.3, -8.2), 4.2, 2.4, 0.2, 3.2, 0.25, 6],
    begin() { goRoom(-6.8, -6.8, Math.PI); J.list = pickN(GADGETS, LBN).map(g => { const [, , , lo, hi, mx] = g, pass = Math.random() < 0.5, span = hi - lo; let v = pass ? lo + Math.round(Math.random() * span) : Math.random() < 0.5 && lo > 0 ? Math.max(0, lo - Math.max(1, Math.round(span * rnd(0.2, 0.9)))) : Math.min(mx, hi + Math.max(1, Math.round((span || 2) * rnd(0.2, 0.9)))); return { g, v, pass: v >= lo && v <= hi }; });
      J.ci = 0; J.cueT = LBT; J.wait = 0.4; J.ran = false; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('PRODUCT TEST LAB \u00b7 ' + nOf(), goldR()) + body(c ? '<div style="border:2px solid #201e1d;padding:6px 10px;background:#fff"><div style="font-size:11px;font-weight:900;color:#2e86b8">ON THE BENCH</div><div style="font-size:20px;font-weight:900">' + c.g[0] + '</div><div style="font-size:14px;font-weight:800">SPEC \u00b7 ' + c.g[1] + ' ' + c.g[3] + ' TO ' + c.g[4] + ' ' + c.g[2] + '</div><div style="margin-top:6px">' + timeRow + '</div></div>'
        + '<div style="border:2px solid #201e1d;background:#201e1d;padding:8px 10px;color:#fff"><div style="display:flex;justify-content:space-between;font-size:12px;font-weight:900"><span>READING</span><span data-read>' + (J.ran ? c.v + ' ' + c.g[2] : '\u2014') + '</span></div><div style="position:relative;height:26px;margin-top:6px;background:#3d3b3a">'
        + '<div style="position:absolute;top:0;bottom:0;left:' + (c.g[3] / c.g[5] * 100) + '%;width:' + Math.max(1.5, (c.g[4] - c.g[3]) / c.g[5] * 100) + '%;background:#3f9a5e"></div><div data-bar style="position:absolute;left:0;top:9px;height:8px;width:' + (J.ran ? Math.min(100, c.v / c.g[5] * 100) : 0) + '%;background:#ffd23a"></div></div><div style="font-size:11px;font-weight:800;margin-top:4px;color:#ffd23a">GREEN = IN SPEC</div></div>'
        + '<button data-run style="' + BTN + ';flex:none;background:#2e86b8;color:#fff"' + (J.ran ? ' disabled' : '') + '>RUN TEST</button><div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><button data-a="1" style="' + BTN + ';min-height:60px;font-size:20px;background:#3f9a5e;color:#fff">PASS</button><button data-a="0" style="' + BTN + ';min-height:60px;font-size:20px;background:#ec3013;color:#fff">FAIL</button></div>'
        : '<div style="font-size:22px;font-weight:900">ALL TESTED</div>') + tipBar('RUN THE TEST \u00b7 INSIDE THE GREEN = PASS'));
      const r = PANEL.querySelector('[data-run]'); if (r) { if (J.ran) r.style.opacity = '0.4'; r.onclick = () => this.run(); } PANEL.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => this.pick(+b.dataset.a, b); }); J.idle = 0; J.hinted = false; },
    run() { const c = J.list[J.ci]; if (!c || J.ran || J.anim) return; J.anim = 0.001; J.idle = 0; tone(220, 0.04, 1.2, 'sawtooth'); const r = PANEL.querySelector('[data-run]'); if (r) { r.disabled = true; r.style.opacity = '0.4'; } },
    pick(a, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (!J.ran) { toast('RUN THE TEST FIRST', 1.4); pulse(PANEL.querySelector('[data-run]')); return; }
      if ((a === 1) !== c.pass) { missOne(c.pass ? 'IT WAS IN SPEC \u00b7 THAT ONE PASSES' : 'OUT OF SPEC \u00b7 THAT ONE FAILS'); shake(el); } else { addGold(4); ding(); goodBtn(el); okTip(c.pass ? 'PASSED \u00b7 TO THE SHOPS' : 'FAILED \u00b7 BACK TO THE MAKERS'); }
      J.wait = 1.0; setTimeout(() => this.next(), 900); },
    next() { J.ran = false; J.anim = 0; roundNext(this, 'lab', LBT); },
    tick(dt) { const c = J.list[J.ci]; if (J.anim && c) { J.anim += dt / 1.2; const f = Math.min(1, J.anim), b = PANEL.querySelector('[data-bar]'), rd = PANEL.querySelector('[data-read]'), v = Math.round(c.v * (1 - Math.pow(1 - f, 3)));
        if (b) b.style.width = Math.min(100, v / c.g[5] * 100) + '%'; if (rd) rd.textContent = v + ' ' + c.g[2]; if (f >= 1) { J.anim = 0; J.ran = true; blip(); J.idle = 0; J.hinted = false; } }
      roundTick(this, dt, LBT, 'TOO SLOW \u00b7 NEXT GADGET', () => (J.ran ? '[data-a="' + (J.list[J.ci].pass ? 1 : 0) + '"]' : '[data-run]')); } };
  // ---------- 5 COFFEE RUN (walk the floor): take 4 orders, brew each cup at the bar, carry it before it goes cold ----------
  const RECIPES = [['BLACK', ['SHOT']], ['WHITE', ['SHOT', 'MILK']], ['SWEET WHITE', ['SHOT', 'MILK', 'SUGAR']], ['CAPPUCCINO', ['SHOT', 'MILK', 'FOAM']], ['DOUBLE', ['SHOT', 'SHOT']], ['MOCHA', ['SHOT', 'MILK', 'CHOC']]];
  const ADDS = [['SHOT', '#3d2a1c'], ['MILK', '#f3f2f2'], ['SUGAR', '#e7e4dc'], ['FOAM', '#fffdf3'], ['CHOC', '#7a5236']];
  const COLD = 45, CRT = 150, BAR = [8.0, 1.1];
  const cupMesh = (() => { const g = new THREE.Group(); const S = mk(); S.cyl(0.07, 0.055, 0.14, PAPER, 0, 0.07, 0, 10); S.cyl(0.072, 0.072, 0.02, GRN, 0, 0.12, 0, 10); S.mesh(g); g.visible = false; scene.add(g); return g; })();
  const steamM = new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, depthWrite: false }); const steam = [0, 1, 2].map(i => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), steamM); cupMesh.add(m); return m; });
  const PEOPLE = () => [{ k: 'w0', n: 'DESK WEST', f: workers[0] }, { k: 'w1', n: 'DESK EAST', f: workers[1] }, { k: 'penn', n: 'PENN', f: penn }, { k: 'ceo', n: 'VAX (CEO)', f: ceo }];
  const same = (a, b) => a.length === b.length && a.slice().sort().join() === b.slice().sort().join();
  GD.coffee = { errand: true,
    begin() { J.orders = PEOPLE().map(p => { const r = RECIPES[Math.floor(Math.random() * RECIPES.length)]; return { ...p, r, got: false }; }); J.carry = null; J.brew = null; J.t0 = performance.now(); goRoom(7.2, 2.4, -Math.PI / 2); toast('FOUR ORDERS \u00b7 BREW AT THE COFFEE BAR', 2.4); },
    openBrew() { J.brew = { for: null, cup: [] }; this.draw(); },
    draw() { const B = J.brew; if (!B) return; const left = J.orders.filter(o => !o.got), o = B.for && J.orders.find(q => q.k === B.for);
      showPanel(panelHead('COFFEE BAR \u00b7 ' + (o ? 'FOR ' + o.n : 'WHO IS IT FOR?'), goldR()) + body(!o ? left.map(q => '<button data-for="' + q.k + '" style="' + BTN + ';flex:none;display:flex;justify-content:space-between;gap:8px"><span>' + q.n + '</span><span>' + q.r[0] + '</span></button>').join('')
        : '<div style="border:2px solid #201e1d;padding:6px 10px;background:#fff"><div style="font-size:11px;font-weight:900;color:#ec3013">ORDER \u00b7 ' + o.r[0] + '</div><div style="font-size:16px;font-weight:900">' + o.r[1].join(' + ') + '</div></div>'
          + '<div style="border:2px solid #201e1d;padding:6px 10px;background:#fffdf3;min-height:44px;font-size:15px;font-weight:900">IN THE CUP \u00b7 ' + (B.cup.length ? B.cup.join(' + ') : 'EMPTY') + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(' + (innerWidth < 420 ? 3 : 5) + ',minmax(0,1fr));gap:8px">' + ADDS.map(([a, c]) => '<button data-add="' + a + '" style="' + BTN + ';border-top:10px solid ' + c + '">' + a + '</button>').join('') + '</div>'
          + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><button data-pour style="' + BTN + ';background:#201e1d;color:#ffd23a">POUR AWAY</button><button data-serve style="' + BTN + ';background:#3f9a5e;color:#fff">SERVE THE CUP</button></div>') + tipBar(o ? 'ADD EXACTLY WHAT THE ORDER SAYS' : 'PICK AN ORDER'), () => { J.brew = null; hidePanel(); });
      PANEL.querySelectorAll('[data-for]').forEach(b => { b.onclick = () => { B.for = b.dataset.for; blip(); this.draw(); }; });
      PANEL.querySelectorAll('[data-add]').forEach(b => { b.onclick = () => { if (B.cup.length >= 4) { toast('THE CUP IS FULL', 1.2); return; } B.cup.push(b.dataset.add); tone(b.dataset.add === 'SHOT' ? 300 : 700, 0.04, 0.2, 'triangle'); this.draw(); }; });
      const pr = PANEL.querySelector('[data-pour]'); if (pr) pr.onclick = () => { B.cup = []; tone(180, 0.04, 0.3, 'sawtooth'); this.draw(); };
      const sv = PANEL.querySelector('[data-serve]'); if (sv) sv.onclick = () => { if (!same(B.cup, o.r[1])) { missOne('WRONG RECIPE \u00b7 POUR IT AWAY AND TRY AGAIN'); shake(sv); return; } ding(); J.carry = { k: o.k, t: COLD }; J.brew = null; hidePanel(); cupMesh.visible = true; toast('CARRY IT TO ' + o.n, 2); }; },
    tick(dt, t) { const P = lastP; if (!P) return; const p = toL(P);
      if (J.carry) { J.carry.t -= dt; cupMesh.position.set(P.x, (P.y || LY) + 1.05, P.z); if (lastFox) { const yy = lastFox.rotation.y; cupMesh.position.x = P.x + Math.sin(yy) * 0.45; cupMesh.position.z = P.z + Math.cos(yy) * 0.45; }
        steam.forEach((m, i) => { const ph = (t * 0.8 + i / 3) % 1; m.position.set(Math.sin(t * 3 + i) * 0.02, 0.15 + ph * 0.25, 0); m.scale.setScalar(0.6 + ph); m.visible = J.carry.t > 12; });
        const o = J.orders.find(q => q.k === J.carry.k), fp = o.f.position; if (Math.hypot(p.x - fp.x, p.z - fp.z) < (o.k === 'ceo' ? 2.4 : 1.7)) { o.got = true; J.carry = null; cupMesh.visible = false; addGold(o.k === 'ceo' ? 8 : 5); ding(); toast(o.k === 'ceo' ? 'VAX \u00b7 HOT. CORRECT. YOU MAY STAY.' : o.k === 'penn' ? 'PENN \u00b7 PERFECT! I COULD SELL THIS.' : 'THANKS! JUST HOW I LIKE IT.', 2.4); o.f.userData.mood = 'happy'; o.thank = 1.2; }
        else if (J.carry.t <= 0) { J.carry = null; cupMesh.visible = false; missOne('IT WENT COLD \u00b7 MAKE A NEW ONE', 2.2); } }
      for (const o of J.orders) if ((o.thank = (o.thank || 0) - dt) > 0) armUp(o.f, 1, 2.4 + Math.sin(t * 12) * 0.3);
      if (J.orders.every(o => o.got)) { ARW.style.display = 'none'; if ((performance.now() - J.t0) / 1000 < CRT) addGold(10); finishGame(); return; }
      if (J.brew) { ARW.style.display = 'none'; return; }
      if (J.carry) { const o = J.orders.find(q => q.k === J.carry.k); arrowTo(V(o.f.position.x + OX, LY + 2.4, o.f.position.z + LZ), o.n + ' \u00b7 ' + Math.ceil(J.carry.t) + ' S'); }
      else arrowTo(toW(BAR[0] + 0.8, 2.2, BAR[1]), 'COFFEE BAR'); },
    card() { const sec = Math.floor((performance.now() - J.t0) / 1000); return { key: 'c' + J.orders.filter(o => o.got).length + (J.carry ? J.carry.k + Math.ceil(J.carry.t / 5) : '-') + '|' + sec, right: Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), stop: true,
      next: J.carry ? 'CARRY IT \u00b7 BEFORE IT GOES COLD' : (touch ? 'TAP TALK' : 'E') + ' AT THE COFFEE BAR',
      body: '<div style="display:flex;flex-direction:column;gap:3px;margin-top:6px">' + J.orders.map(o => '<div style="font-size:12px;font-weight:900;display:flex;justify-content:space-between;gap:6px;' + (o.got ? 'opacity:.5;text-decoration:line-through' : '') + '"><span>' + (o.got ? '\u2713 ' : '') + o.n + '</span><span>' + o.r[0] + '</span></div>').join('') + '</div>'
        + (J.carry ? '<div style="height:6px;background:#e7e4dc;margin-top:6px"><div style="height:6px;width:' + (J.carry.t / COLD * 100).toFixed(0) + '%;background:' + (J.carry.t < 12 ? RED : '#e07a1f') + '"></div></div>' : '') + tipH('PENN', 'Vax takes it hot. Very hot. Do not keep Vax waiting.') }; } };
  // ---------- 6 LIFT OPERATOR (service lift panel): tap a floor, the car goes; drop off + pick up before they give up ----------
  const LFT = 6, LTN = 10, PAT = 28, CAP = 4;
  GD.lift = { panel: true, shot: () => [toW(5.5, 1.5, 9.2), 3.4, 2.6, 0.18, 3.0, Math.PI, 5.5],
    begin() { goRoom(5.5, 7.8, 0); J.car = 0; J.tgt = 0; J.stop = 0; J.wait = []; J.ride = []; J.n = 0; J.left = LTN; J.spawnT = 0.5; J.id = 0; J.made = 0; snapK = true; liftDing(); this.draw(); },
    draw() { const col = !(innerHeight < 520 && innerWidth > innerHeight);
      showPanel(panelHead('LIFT OPERATOR \u00b7 ' + J.n + ' / ' + LTN, goldR()) + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box">'
        + '<div data-ride style="flex:none;border:2px solid #201e1d;background:#fffdf3;padding:6px 10px;font-size:14px;font-weight:900;min-height:24px"></div>'
        + '<div data-shaft style="flex:1;min-height:0;display:flex;flex-direction:' + (col ? 'column-reverse' : 'row') + ';gap:6px">' + DEPTS.map((d, i) => '<button data-f="' + i + '" style="' + BTN + ';flex:1 1 0;min-height:44px;display:flex;' + (col ? 'flex-direction:row;align-items:center' : 'flex-direction:column') + ';gap:6px;padding:4px 8px;border-left:10px solid ' + d[2] + '"><span style="flex:none;font-size:15px;min-width:' + (col ? '96px' : '0') + '">' + d[1] + ' \u00b7 ' + d[0] + '</span><span data-q style="display:flex;flex-wrap:wrap;gap:4px"></span></button>').join('') + '</div></div>'
        + tipBar('TAP A FLOOR TO SEND THE LIFT \u00b7 IT STOPS, THEY GET OFF AND ON'));
      PANEL.querySelectorAll('[data-f]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); J.tgt = +b.dataset.f; J.idle = 0; blip(); if (Math.abs(J.car - J.tgt) < 0.01 && J.stop <= 0) this.arrive(); this.paint(); }; }); J.idle = 0; J.hinted = false; this.paint(); },
    chip: (q, bg) => '<span style="padding:1px 5px;border:2px solid #201e1d;background:' + (bg || '#fff') + ';font-size:12px;font-weight:900">\u2192 ' + DEPTS[q.to][1] + '</span>',
    paint() { const fl = Math.round(J.car); PANEL.querySelectorAll('[data-f]').forEach(b => { const i = +b.dataset.f, here = Math.abs(J.car - i) < 0.05, q = J.wait.filter(w => w.at === i); b.style.background = here ? '#ffd23a' : i === J.tgt ? '#e7e4dc' : '#fff';
        const s = b.querySelector('[data-q]'), h = q.map(w => this.chip(w, w.p < 8 ? '#ff9b8a' : '#fff')).join(''); if (s._h !== h) { s._h = h; s.innerHTML = h; } });
      const r = PANEL.querySelector('[data-ride]'); if (r) { const h = 'IN THE LIFT (' + J.ride.length + '/' + CAP + ') \u00b7 FLOOR ' + DEPTS[fl][1] + (J.ride.length ? ' \u00b7 ' + J.ride.map(q => '\u2192' + DEPTS[q.to][1]).join(' ') : ' \u00b7 EMPTY'); if (r._h !== h) { r._h = h; r.textContent = h; } } },
    tick(dt) { J.idle = (J.idle || 0) + dt; J.spawnT -= dt;
      if (J.spawnT <= 0 && J.n + J.ride.length + J.wait.length < LTN && J.wait.length < 6) { J.spawnT = rnd(2.6, 3.8); const at = Math.floor(Math.random() * DEPTS.length); let to = Math.floor(Math.random() * (DEPTS.length - 1)); if (to >= at) to++; J.wait.push({ id: J.id++, at, to, p: PAT }); J.made++; tone(1200, 0.02, 0.08, 'triangle'); }
      for (const w of J.wait.slice()) { w.p -= dt; if (w.p <= 0) { J.wait = J.wait.filter(q => q !== w); missOne('A PASSENGER GAVE UP \u00b7 TOOK THE STAIRS'); } }
      if (J.stop > 0) J.stop -= dt; else if (Math.abs(J.car - J.tgt) > 0.01) { const d = J.tgt - J.car, s = Math.sign(d) * Math.min(Math.abs(d), dt * LFT * 0.33); const before = Math.round(J.car); J.car += s; if (Math.abs(J.tgt - J.car) < 0.01) { J.car = J.tgt; this.arrive(); } else if (Math.round(J.car) !== before) tone(660, 0.015, 0.05, 'square'); }
      if (J.idle > 3 && !J.hinted) { J.hinted = true; const w = J.ride[0] ? J.ride[0].to : J.wait[0] ? J.wait.slice().sort((a, b) => a.p - b.p)[0].at : null; if (w != null) pulse(PANEL.querySelector('[data-f="' + w + '"]')); }
      this.paint(); if (J.n >= LTN && !J.ending) { J.ending = true; addGold(6); setTimeout(finishGame, 600); } },
    arrive() { const f = J.tgt; liftDing(); J.stop = 0.6; const off = J.ride.filter(q => q.to === f); if (off.length) { J.ride = J.ride.filter(q => q.to !== f); J.n += off.length; off.forEach(() => addGold(2)); const h = PANEL.querySelector('[data-h]'); if (h) h.textContent = 'LIFT OPERATOR \u00b7 ' + J.n + ' / ' + LTN; okTip(off.length + ' OFF AT ' + DEPTS[f][0]); }
      const on = J.wait.filter(w => w.at === f).slice(0, CAP - J.ride.length); if (on.length) { J.wait = J.wait.filter(w => !on.includes(w)); J.ride.push(...on); } else if (J.wait.some(w => w.at === f)) toast('LIFT FULL \u00b7 DROP SOMEONE OFF FIRST', 1.6); J.idle = 0; J.hinted = false; } };
  // ================= PRIZES =================
  const SUIT = { outfit: 'suit', torso: ['#f3f2f2', GRN, GRN2], name: 'VAX SUIT' };
  const GIFT = { suit: 'Your own VAX SUIT. Very you. Very VAX. The Tailor keeps a copy.', badge: 'A VAX STAFF BADGE! Twenty percent off at the Staff Shop. Do not tell accounts.', trophy: 'All six! The VAX TROPHY, in the case, and 60 gold. Vax wants to see you.' };
  function giveGift() { save.setStat('vxhClears', save.stat('vxhClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('vxhSuit', false)) { save.setStat('vxhSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 2 && !save.stat('vxhBadge', false)) { save.setStat('vxhBadge', true); save.give('vaxBadge'); return 'badge'; }
    if (nd >= GAMES.length && !save.stat('vxhAll', false)) { save.setStat('vxhAll', true); save.give('vaxTrophy'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function prismCheck(then) { if (!allThree() || save.stat('vxhPrism', false)) { then && then(); return false; } save.setStat('vxhPrism', true); save.addRelic('vaxPrism'); prism.visible = true; ding();
    sayTo(T_CEO, [ceoLn('Three stars on every job. Take the VAX PRISM. My very first product.')], () => { toast('RELIC \u00b7 VAX PRISM', 2.6); then && then(); }); return true; }
  // STAFF SHOP (vending machine): the badge = 20% off
  const shopObj = new THREE.Object3D(); shopObj.position.set(9.0, 1.4, 6.4); G.add(shopObj);
  const SHOP = [['erToGo', 'ER TO GO', 10], ['energyPod', 'ENERGY FILL POD', 10], ['chocolates', 'BOX OF CHOCOLATES', 20]];
  const price = p => (save.count('vaxBadge') ? Math.round(p * 0.8) : p);
  function shopMenu() { const T = { key: 'vaxShop', name: 'STAFF SHOP', role: 'VAX', obj: shopObj, r: 3 }, badge = !!save.count('vaxBadge');
    sayTo(T, [{ who: 'VAX STAFF SHOP', role: badge ? 'BADGE \u00b7 20% OFF' : 'STAFF PRICES WITH A BADGE', text: badge ? 'BEEP. STAFF BADGE FOUND. HELLO, COLLEAGUE.' : 'BEEP. NO BADGE. FULL PRICE, FRIEND.',
      choices: [...SHOP.map(([id, n, p]) => ({ text: n + ' \u00b7 ' + price(p) + ' G', pick: () => { if (!save.spend(price(p))) { nope(); toast('NOT ENOUGH GOLD', 1.6); return; } save.give(id); coin(); toast(n + ' \u00b7 IN YOUR BAG', 1.8); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  function useItem(id) { if (id === 'vaxBadge' && save.count('vaxBadge')) { toast('VAX STAFF BADGE \u00b7 20% OFF AT THE STAFF SHOP', 2.4); return true; } if (id === 'vaxTrophy' && save.count('vaxTrophy')) { toast('THE VAX TROPHY \u00b7 SIX FOR SIX ON THE TOP FLOOR', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { sales: 'Customers at my desk! Listen to the problem, sell the VAX fix.', mail: 'Parcels for the whole tower. Floor by department. Names are in the directory.', gate: 'You are security. Check each badge against the list. Fakes get turned away.',
    lab: 'New gadgets! Run each test. Inside the green, pass it. Outside, fail it.', coffee: 'Four coffee orders, Vax included. Brew at the bar, carry them hot.', lift: 'The service lift is yours. Tap a floor, the car goes. Nobody waits too long.' };
  const DONE = { sales: 'Six sold! You have the VAX smile now.', mail: 'Every parcel on the right floor. Soup got soup.', gate: 'No fakes got past. Security wants to hire you.', lab: 'Tested and sorted. The toasters thank you.', coffee: 'Hot coffee all round. Vax smiled. I think.', lift: 'Everyone delivered. Nobody took the stairs. Almost.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; sayTo(T_PN, [pnLn(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('vxhVisits', save.stat('vxhVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0 }; const D = GD[g]; busy = D.errand ? 'errand' : 'job'; ding(); fade(() => D.begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('vxhDone', d); save.setStat('vxhLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const say = () => { const L1 = [pnLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(pnLn(GIFT[gift])); K.finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(1600 + k * 200, 0.02, 0.06, 'square', k * 0.06);
      sayTo(T_PN, L1, () => { if (busy === 'end') { busy = null; J = null; } if (!prismCheck()) {} }); };
    fade(() => { cleanup(); goRoom(0, -4.6, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 30000); }
  function cleanup() { if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; } hidePanel(); hideCard(); ARW.style.display = 'none'; cupMesh.visible = false;
    penn.position.set(PN0[0], 0, PN0[1]); penn.rotation.y = PN0[2]; [penn, ceo, ...workers].forEach(f => { f.userData.mood = f === ceo ? 'warm' : f === penn ? 'happy' : 'neutral'; }); }
  function stop() { cleanup(); busy = null; J = null; }
  function quit() { if (busy === 'intro') { busy = null; return; } if (!J || busy === 'end') return; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
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
  const nearPN = p => nearL(p, 0, -5.4, 1.4), nearCEO = p => p.x > 4.2 && p.z < -4.2 && nearL(p, CEO0[0], CEO0[1], 3.0), nearShop = p => nearL(p, 8.3, 6.4, 1.4), nearBar = p => nearL(p, BAR[0], BAR[1], 1.6);
  const nearW = p => workers.findIndex(f => nearL(p, f.position.x, f.position.z, 1.6)), atCase = p => nearL(p, 8.4, -2.6, 1.2);
  const ceoScene = () => save.stat('vxhAll', false) && !save.stat('vxhScene', false);
  function prompt(P) { if (busy === 'errand' && J && J.g === 'coffee') { if (!inRoom(P) || J.brew || J.carry) return null; return nearBar(toL(P)) ? 'COFFEE BAR \u00b7 BREW A CUP' : null; } if (busy) return null;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; return nearL(p, LLIFT[0], LLIFT[1], 1.6) ? 'LIFT \u00b7 TOP FLOOR' : nearL(p, LDESK[0], LDESK[1], 2.4) ? 'TALK \u00b7 GLOSSA' : null; }
    if (!inRoom(P)) return null; const p = toL(P); if (nearL(p, MAIN[0], MAIN[1], 1.0)) return 'LIFT \u00b7 DOWN TO THE LOBBY'; const r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearPN(p)) return 'TALK \u00b7 PENN'; if (nearCEO(p)) return ceoScene() ? 'TALK \u00b7 VAX \u00b7 COME IN' : 'TALK \u00b7 VAX'; if (nearShop(p)) return 'VAX STAFF SHOP';
    const w = nearW(p); if (w >= 0) return 'TALK \u00b7 OFFICE WORKER'; if (atCase(p)) return 'TROPHY CASE'; return null; }
  let talkP = save.stat('vxhTalkedP', 0), talkC = save.stat('vxhTalkedC', 0), talkG = 0, talkW = 0;
  const PN_HI = ['Back! Ready to sell? Sort? Brew? Everything is for sale, even work.', 'The board says you are good. The board is never wrong. VAX made it.', 'Vax asked about you. That is either very good or very busy.'];
  function pnMenu() { const first = !talkP; talkP++; save.setStat('vxhTalkedP', talkP);
    sayTo(T_PN, [{ ...pnLn(first ? 'Penn, head of sales, and this whole top floor! Six jobs. All VAX quality. Mostly.' : PN_HI[(talkP - 2) % PN_HI.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) },
      { text: 'PICK A JOB', pick: () => sayTo(T_PN, [{ ...pnLn('Which one?'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'WHAT ARE YOU SELLING TODAY?', pick: () => sayTo(T_PN, [pnLn('Socks that never pair wrong. A kettle that sings. A sofa with a phone in it.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_PN, [pnLn('Bye! Tell your friends. Tell them to bring money.')]) }] }]); }
  const CEO_HI = ['The top floor. Everything you see from here buys from VAX.', 'You again. Penn says you work hard. Penn says that about pens.', 'Busy. Always busy. Speak quickly. Kindly.'];
  function ceoMenu() { const first = !talkC; talkC++; save.setStat('vxhTalkedC', talkC); if (prismCheck()) return; const ch = [];
    if (ceoScene()) ch.push({ text: 'YOU WANTED TO SEE ME?', pick: () => sceneCEO() });
    ch.push({ text: 'WHY SELL EVERYTHING?', pick: () => sayTo(T_CEO, [ceoLn('Everyone buys something. The Salts and Peppers fight over crumbs. VAX owns the bakery.')]) });
    if (save.stat('vxhScene', false)) ch.push({ text: 'THE BANDITS?', pick: () => sayTo(T_CEO, [ceoLn('Locks are selling very well this week. That is all I will say.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_CEO, [ceoLn('Close the door. Gently. It cost more than your house.')]) });
    sayTo(T_CEO, [{ ...ceoLn(first ? 'Vax. Chief executive. You are on my top floor. Penn hires. I watch.' : ceoScene() ? 'There you are. Six jobs, six wins. Come in. Sit.' : CEO_HI[(talkC - 2) % CEO_HI.length]), choices: ch }]); }
  function sceneCEO() { busy = 'scene'; save.setStat('vxhScene', true); const end = () => { busy = null; save.setStat('storyVaxLocks', true); toast('STORY \u00b7 VAX SELLS THE LOCKS', 2.6); prismCheck(); };
    sayTo(T_CEO, [ceoLn('Look out there. Every light on that shore buys from VAX.'), ceoLn('The Salts and the Peppers think they own Meru. They rent it. From me.'),
      { ...ceoLn('Bandits in both their buildings. Bad for them. Wonderful for VAX. Everyone buys locks now.'), choices: [
        { text: 'DID YOU SEND THE BANDITS?', pick: () => sayTo(T_CEO, [ceoLn('Me? I sell locks, not bandits. Mostly locks.'), ceoLn('Keep the trophy. Keep your eyes open. I will be watching. Kindly.')], end) },
        { text: 'THAT IS NOT FAIR.', pick: () => sayTo(T_CEO, [ceoLn('Fair is a product too. It does not sell well.'), ceoLn('Keep the trophy. Keep your eyes open. I will be watching. Kindly.')], end) }] }]); }
  const GL = ln('Glossa', 'VAX FRONT DESK'), T_GL = () => ({ key: 'vaxReception', name: 'Glossa', role: 'VAX FRONT DESK', obj: LR.keeper || LG, r: 4 });
  function glMenu() { talkG++; const hi = talkG === 1 ? 'Welcome to VAX. We sell everything, to everyone. Do you have an appointment?' : save.stat('vxhAll', false) ? 'Our trophy winner! The top floor talks about you. Nicely, mostly.' : 'Back at VAX. Penn is hiring on the top floor.';
    sayTo(T_GL(), [{ ...GL(hi), choices: [{ text: CHOICE_WORK, pick: () => sayTo(T_GL(), [GL('Penn hires on the top floor. Lift on the left. Up you go.')], () => upLift()) },
      { text: 'WHAT DOES VAX SELL?', pick: () => sayTo(T_GL(), [GL('Phones, sofas, soup, satellites. If it exists, VAX sells it.')]) },
      { text: 'THE PEARL SAIL?', pick: () => sayTo(T_GL(), [GL('Their own robots locked them out. VAX is not worried. VAX is very worried.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const upLift = () => { liftDing(); fade(() => goRoom(0, 7.6, Math.PI)); setTimeout(() => K.chime(), 500); };
  const downLift = () => { liftDing(); fade(() => go(LOX + LLIFT[0] + 0.6, LY, LZ + LLIFT[1], Math.PI / 2)); };
  const W_LINES = ['Spreadsheets. Then more spreadsheets. VAX sells those too.', 'Is it lunch? It feels like lunch.', 'Penn sold me a pen. I already had a pen.', 'The view is nice. I have never looked up.'];
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true;
    if (busy === 'errand' && J && J.g === 'coffee') { if (!J.brew && !J.carry && inRoom(P) && nearBar(toL(P))) { GD.coffee.openBrew(); return true; } return false; } if (busy) return false;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; if (nearL(p, LLIFT[0], LLIFT[1], 1.6)) { upLift(); return true; } if (nearL(p, LDESK[0], LDESK[1], 2.4)) { tone(1320, 0.05, 0.5); glMenu(); return true; } return false; }
    if (!inRoom(P)) return false; const p = toL(P);
    if (nearL(p, MAIN[0], MAIN[1], 1.0)) { downLift(); return true; }
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; }
    if (nearPN(p)) { tone(1320, 0.05, 0.5); pnMenu(); return true; } if (nearCEO(p)) { tone(880, 0.05, 0.6); ceoMenu(); return true; } if (nearShop(p)) { blip(); shopMenu(); return true; }
    const w = nearW(p); if (w >= 0) { const T = { key: 'vaxWorker' + w, name: 'Office Worker', role: 'VAX', obj: workers[w], r: 4 }; sayTo(T, [{ who: 'Office Worker', role: 'VAX', text: W_LINES[(talkW++ + w) % W_LINES.length] }]); return true; }
    if (atCase(p)) { toast(save.stat('vxhAll', false) ? 'THE VAX TROPHY \u00b7 WON BY YOU' : 'TROPHY CASE \u00b7 EMPTY \u00b7 DO ALL 6 JOBS', 2.4); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, spawned = !/[?&]spawn=vaxfloor/.test(location.search), spawnT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(0, 7.6, Math.PI); }
    const inR = inRoom(P), inL = inLobby(P); G.visible = inR || busy === 'job'; LG.visible = inL;
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; if (inR) { trophy.visible = !!save.stat('vxhAll', false); prism.visible = !!save.stat('vxhPrism', false); const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); viewM.color.set(n ? '#3a4560' : dusk ? '#e8b48a' : '#ffffff'); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('vax job: ' + (e && e.stack || e)); stop(); }
      if (J && D.card) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || goldR()) + foot(c.next, c.stop) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && GD[J.g].panel && !fading && GD[J.g].draw && (J.g === 'lift' ? J.n < LTN : J.list && J.ci < J.list.length)) GD[J.g].draw();
    if (G.visible) { prism.rotation.y += dt * 0.8; for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      const p = toL(P); for (let i = 0; i < 2; i++) { const f = workers[i]; kit.animFox(f, dt, 0, false); if (!(busy === 'errand' && J && J.g === 'coffee' && J.orders && J.orders[i].thank > 0)) { if (!busy && nearL(p, f.position.x, f.position.z, 4)) turnTo(f, Math.atan2(p.x - f.position.x, p.z - f.position.z), dt, 3); else { turnTo(f, W0[i][2], dt, 2); armUp(f, 1, 0.5 + Math.sin(t * 7 + i) * 0.15, -1.1); } } }
      kit.animFox(ceo, dt, 0, false); if (!busy || busy === 'scene' || busy === 'errand') { const dd = Math.hypot(p.x - ceo.position.x, p.z - ceo.position.z); turnTo(ceo, dd < 6 ? Math.atan2(p.x - ceo.position.x, p.z - ceo.position.z) : CEO0[2] + Math.sin(t * 0.3) * 0.4, dt, 2); } }
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: inR ? 0 : 99, talking: busy === 'job' && J && J.g === 'sales', clear: endClear > 0 ? [0, -4.6, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { vaxfloor: [OX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), up: upLift, down: downLift, scene: sceneCEO, penn, ceo, workers,
    _view(p, l, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p)); c.lookAt(toW(...l)); c.updateMatrixWorld(); const v = G.visible; G.visible = true; renderer.render(scene, c); G.visible = v; return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); scene.remove(cupMesh); K.dispose(); } };
  window.__vax = API; return API;
}
