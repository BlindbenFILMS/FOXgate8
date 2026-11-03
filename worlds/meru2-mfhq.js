// MERU 2.0 — s136 MACHINE FLEET HQ · ENGINEERING [meruMachineFleetHQ] ("cluster buildings part 8", Ben's picks s134, made from worlds/meru2-pepperhq.js ·
// 5 jobs: REPAIR A GUARD BOT · PROGRAM A PATROL · HULL RIVETS · DRONE TEST FLIGHT · FAULT FINDER · no tip-off choice ·
// prizes: ENGINEER COAT (1st clear) · STAFF BADGE (2 jobs: 20% off at the PARTS CANTEEN) · FLEET TROPHY (all 5, + 60 gold) + the Director's scene · relic PROTOTYPE CORE (3 stars on all)). Stats prefix mfh.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildMachineHQ({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go, groundH = () => 0 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'mfHQ'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, LOX = LR.ox, RH = 4.6;
  const SR = clusters.addRoom({ key: 'mfFloor', room: 'meruMachineFleetHQ', title: 'MACHINE FLEET \u00b7 ENGINEERING' }, RH); SR.out = LR.out; const OX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', NAVY = '#334155', NAVY2 = '#1e293b', ACC = NAVY, SLATE = '#475569', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLACK = '#26292d', BLUE = '#2e86b8', CYAN = '#3fd3ff', HAZ = '#ffd23a', DK = '#3d4148', GRN = '#2f7d5a';
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
  const G = new THREE.Group(); G.name = 'mfEngineering'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('mfhDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#5d6f82', '#e7e4dc', '#334155'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  // ================= ENGINEERING FLOOR (floor 40 of the 200 m tower: concrete, slate, yellow safety lines, a sky window) =================
  const R0 = mk(), { box, cyl, sph, tor } = R0, WALL = '#cfd4d8';
  box(20, 0.1, 20, '#8a8f94', 0, -0.05, 0); for (let k = -8; k <= 8; k += 4) { box(0.03, 0.012, 20, '#767b80', k, 0.006, 0); box(20, 0.012, 0.03, '#767b80', 0, 0.006, k); }
  box(20, 0.2, 20, DK, 0, RH + 0.1, 0); for (let z = -8; z <= 8; z += 4) box(20, 0.22, 0.24, STEEL, 0, RH - 0.11, z);
  cyl(0.12, 0.12, 20, BLUE, -9.4, RH - 0.5, 0, 8, Math.PI / 2); cyl(0.1, 0.1, 20, RED, -9.0, RH - 0.45, 0, 8, Math.PI / 2); cyl(0.12, 0.12, 20, STEEL, 9.4, RH - 0.5, 0, 8, Math.PI / 2);
  box(20, 0.9, 0.3, SLATE, 0, 0.45, -10); box(20, RH - 3.8, 0.3, WALL, 0, 3.8 + (RH - 3.8) / 2, -10);
  for (let x = -10; x <= 10; x += 2.5) box(0.14, 2.9, 0.16, BLACK, x, 2.35, -9.86);
  for (const s of [-1, 1]) { box(0.3, RH, 20, WALL, s * 10, RH / 2, 0); box(0.06, 1.0, 20, SLATE, s * 9.83, 0.5, 0); box(0.08, 0.08, 20, HAZ, s * 9.82, 1.02, 0); }
  box(20, RH, 0.3, WALL, 0, RH / 2, 10); box(20, 1.0, 0.06, SLATE, 0, 0.5, 9.83); box(20, 0.08, 0.08, HAZ, 0, 1.02, 9.82);
  rectL(-10, 10, -10.3, -9.7); rectL(9.8, 10.3, -10, 10); rectL(-10.3, -9.8, -10, 10); rectL(-10, 10, 9.8, 10.3);
  box(2.0, 0.02, 14.4, '#5f6469', 0, 0.012, 1.8); for (const s of [-1, 1]) box(0.1, 0.022, 14.4, HAZ, s * 1.0, 0.014, 1.8);   // walkway: lift → the chief engineer
  box(1.8, 2.7, 0.06, STEEL, 0, 1.35, 9.82); box(0.03, 2.7, 0.07, INK, 0, 1.35, 9.8); box(2.1, 0.14, 0.12, BLACK, 0, 2.78, 9.8); for (const s of [-1, 1]) box(0.14, 2.8, 0.12, BLACK, s * 1.0, 1.4, 9.8);
  // CHIEF ENGINEER'S DESK (north, end of the walkway)
  box(4.4, 0.08, 1.1, SLATE, 0, 1.02, -6.6); box(4.2, 0.98, 0.9, DK, 0, 0.49, -6.6); box(4.2, 0.06, 0.04, HAZ, 0, 0.9, -6.13); rectL(-2.2, 2.2, -7.1, -6.1);
  box(0.62, 0.02, 0.44, BLUE, -1.2, 1.07, -6.7, 0.1); box(0.5, 0.02, 0.4, CREAM, -0.5, 1.075, -6.6, -0.15); box(0.7, 0.45, 0.05, BLACK, 1.3, 1.42, -6.9); box(0.08, 0.3, 0.08, STEEL, 1.3, 1.2, -6.9); cyl(0.05, 0.05, 0.12, RED, 0.5, 1.12, -6.8, 8);
  // DIRECTOR'S OFFICE (NE): low slate wall + glass, door gap on the west side (z -7.2..-4.8)
  box(6, 1.0, 0.14, SLATE, 7, 0.5, -4); box(0.14, 1.0, 2.8, SLATE, 4, 0.5, -8.6); box(0.14, 1.0, 0.8, SLATE, 4, 0.5, -4.4);
  for (const [x, z] of [[4, -4], [4, -7.2], [4, -4.8], [10, -4]]) box(0.12, RH, 0.12, BLACK, x, RH / 2, z); box(6, 0.12, 0.12, BLACK, 7, 2.9, -4); box(0.12, 0.12, 2.8, BLACK, 4, 2.9, -8.6);
  rectL(3.9, 4.1, -10, -7.2); rectL(3.9, 4.1, -4.8, -3.9); rectL(4, 10, -4.1, -3.9);
  box(2.6, 0.1, 1.2, CREAM, 7.2, 0.95, -7.2); box(2.4, 0.9, 1.0, SLATE, 7.2, 0.45, -7.2); rectL(5.9, 8.5, -7.8, -6.6);
  box(0.9, 1.2, 0.8, INK, 7.2, 0.6, -8.6); box(0.9, 0.5, 0.2, INK, 7.2, 1.3, -9.0);
  box(0.5, 1.0, 0.5, STEEL, 9.2, 0.5, -5.0); box(1.0, 0.14, 0.3, PAPER, 9.2, 1.25, -5.0); box(0.24, 0.05, 1.0, PAPER, 9.15, 1.25, -5.0); box(0.06, 0.22, 0.3, RED, 8.75, 1.36, -5.0); cyl(0.07, 0.07, 0.2, DK, 8.65, 1.25, -5.0, 8, 0, Math.PI / 2); rectL(8.9, 9.5, -5.3, -4.7);   // fleet ship model
  box(0.7, 0.45, 0.7, SLATE, 5.4, 0.23, -5.2); box(0.7, 0.55, 0.15, SLATE, 5.4, 0.7, -4.9); circL(5.4, -5.2, 0.5); cyl(0.06, 0.06, 0.1, PAPER, 6.5, 1.05, -7.1, 10);
  // REPAIR BAY (NW): steel bench, tools, a turntable (the guard bot stands on it, below)
  box(4.0, 0.1, 1.6, STEEL, -6.8, 0.92, -7.8); for (const [x, z] of [[-8.6, -8.4], [-5, -8.4], [-8.6, -7.2], [-5, -7.2]]) box(0.1, 0.9, 0.1, DK, x, 0.45, z); rectL(-8.9, -4.7, -8.7, -6.9); box(3.6, 0.06, 1.3, DK, -6.8, 0.3, -7.8);
  for (let k = 0; k < 5; k++) box(0.08, 0.04, 0.34, [RED, STEEL, HAZ, BLUE, STEEL][k], -8.4 + k * 0.22, 1.0, -8.3, 0.2 * k);
  box(0.5, 0.3, 0.36, RED, -5.4, 1.12, -8.2); box(0.5, 0.04, 0.36, DK, -5.4, 1.29, -8.2); cyl(0.5, 0.5, 0.06, DK, -6.8, 1.0, -7.8, 16);
  // PATROL CONTROL (W wall): desk + four monitors with patrol grids
  box(1.2, 0.08, 3.4, SLATE, -9.2, 0.95, 0.2); box(1.1, 0.9, 3.3, DK, -9.2, 0.45, 0.2); rectL(-10, -8.6, -1.5, 1.9);
  for (const [z, y] of [[-0.6, 1.5], [1.0, 1.5], [-0.6, 2.25], [1.0, 2.25]]) box(0.12, 0.66, 1.4, BLACK, -9.7, y, z);
  box(0.3, 0.04, 0.5, INK, -8.9, 1.01, 0.2); box(0.08, 0.16, 0.08, RED, -8.9, 1.1, 0.4);
  // HULL RIVETS (SW): a drone hull panel on a stand + the rivet gun cart
  box(2.8, 1.7, 0.1, STEEL, -5.6, 1.6, 9.1, 0, -0.18); for (const x of [-6.8, -4.4]) box(0.12, 1.0, 0.12, BLACK, x, 0.5, 9.25); box(2.8, 0.1, 0.5, DK, -5.6, 0.75, 9.25); rectL(-7.1, -4.1, 8.8, 9.8);
  for (let i = 0; i < 7; i++) for (const y of [1.0, 2.2]) sph(0.035, '#5f6469', -6.8 + i * 0.4, y, 9.03 - 0.18 * (y - 1.6));
  box(0.8, 0.7, 0.5, RED, -3.6, 0.45, 8.6); box(0.84, 0.05, 0.54, DK, -3.6, 0.82, 8.6); cyl(0.06, 0.06, 0.4, STEEL, -3.6, 0.95, 8.6, 8, 0, Math.PI / 2); rectL(-4.0, -3.2, 8.35, 8.85);
  // DRONE TEST CAGE (E wall): pad, posts, bars on the open side (the drone hovers inside, below)
  cyl(0.95, 0.95, 0.05, DK, 8.7, 0.03, 1.4, 18); for (const x of [8.5, 8.9]) box(0.1, 0.012, 0.7, HAZ, x, 0.06, 1.4); box(0.4, 0.012, 0.1, HAZ, 8.7, 0.06, 1.4);
  for (const z of [-0.4, 3.2]) { box(0.12, 2.8, 0.12, BLACK, 7.6, 1.4, z); box(2.4, 0.12, 0.12, BLACK, 8.8, 2.8, z); } box(0.12, 0.12, 3.6, BLACK, 7.6, 2.8, 1.4);
  for (let z = -0.0; z < 3.2; z += 0.4) box(0.03, 2.7, 0.03, STEEL, 7.6, 1.4, z); rectL(7.5, 10, -0.5, 3.3);
  // FAULT FINDER (SE): circuit bench + the server rack (blinking LEDs below)
  box(4.0, 2.6, 0.5, BLACK, 6.6, 1.3, 9.6); for (let k = 0; k < 4; k++) box(3.8, 0.04, 0.02, DK, 6.6, 0.5 + k * 0.6, 9.34); rectL(4.6, 8.6, 9.3, 10);
  box(2.4, 0.08, 1.0, SLATE, 6.6, 0.95, 7.6); box(2.2, 0.9, 0.8, DK, 6.6, 0.45, 7.6); rectL(5.4, 7.8, 7.1, 8.1);
  box(1.6, 0.03, 0.7, GRN, 6.6, 1.005, 7.6); for (let k = 0; k < 6; k++) box(0.16, 0.04, 0.12, INK, 6.0 + k * 0.24, 1.04, 7.5 + (k % 2) * 0.18); box(0.3, 0.2, 0.2, HAZ, 7.6, 1.09, 7.9);
  // PARTS CANTEEN (E wall: a vending machine) + TROPHY CASE
  box(0.9, 2.1, 1.4, RED, 9.45, 1.05, 5.2); box(0.04, 1.2, 1.1, '#bcd4e6', 8.99, 1.35, 5.1); box(0.05, 0.3, 0.3, INK, 8.99, 0.5, 5.2); rectL(8.9, 10, 4.4, 6.0);
  box(0.9, 0.9, 1.2, SLATE, 9.35, 0.45, -2.6); box(0.85, 1.0, 1.15, '#d6e8f0', 9.35, 1.4, -2.6); rectL(8.8, 10, -3.3, -1.9);
  // engineer desks (middle)
  for (const s of [-1, 1]) { const cx = s * 4.4; box(3.2, 0.08, 1.8, SLATE, cx, 0.9, 0.8); box(0.06, 0.86, 1.7, DK, cx - 1.55, 0.43, 0.8); box(0.06, 0.86, 1.7, DK, cx + 1.55, 0.43, 0.8); box(3.1, 0.3, 0.04, NAVY, cx, 1.1, 0.8); rectL(cx - 1.6, cx + 1.6, -0.1, 1.7);
    for (const dx of [-0.8, 0.8]) { box(0.5, 0.05, 0.36, CREAM, cx + dx, 0.96, 0.5); box(0.56, 0.34, 0.04, BLACK, cx + dx, 1.2, 1.25); box(0.06, 0.14, 0.06, STEEL, cx + dx, 1.0, 1.25); } }
  for (const [x, z] of [[-9.1, 9.1], [3.2, -9.1]]) { cyl(0.3, 0.24, 0.5, SLATE, x, 0.25, z, 10); sph(0.55, '#4f7d3a', x, 0.95, z); sph(0.4, '#5f8d48', x - 0.15, 1.35, z + 0.15); circL(x, z, 0.5); }
  for (const [x, z] of [[-9.3, -9.3], [-3.4, -9.3]]) { cyl(0.32, 0.32, 0.9, HAZ, x, 0.45, z, 12); for (const y of [0.25, 0.65]) cyl(0.33, 0.33, 0.08, INK, x, y, z, 12); circL(x, z, 0.4); }
  const LAMPS = [[-5, -5], [0, -3], [-5, 3], [5, 2], [-4, 7], [2.5, 7], [7, -7]]; for (const [x, z] of LAMPS) { box(0.04, 0.6, 0.04, BLACK, x, RH - 0.3, z); cyl(0.34, 0.12, 0.24, SLATE, x, RH - 0.66, z, 10); sph(0.12, '#fff1c8', x, RH - 0.8, z); }
  R0.mesh(G);
  const glassM = new THREE.MeshLambertMaterial({ color: '#bcd4e6', transparent: true, opacity: 0.25, depthWrite: false });
  for (const [w, x, z, ry] of [[6, 7, -4, 0], [2.8, 4, -8.6, Math.PI / 2], [0.8, 4, -4.4, Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.85), glassM); m.position.set(x, 1.95, z); m.rotation.y = ry; m.userData.noCull = true; m.renderOrder = 3; G.add(m); }
  const viewT = CT(1024, 160, (g, W, H) => { const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#6fb1e3'); sky.addColorStop(0.75, '#d9ebf6'); sky.addColorStop(1, '#eef3f6'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse((i * 197) % W, 30 + (i * 37) % 70, 60 + (i % 3) * 20, 10 + (i % 2) * 6, 0, 0, 7); g.fill(); }
    g.fillStyle = '#4b7fa3'; g.fillRect(0, H * 0.86, W, H * 0.14); g.fillStyle = '#9aa7b2'; for (let i = 0; i < 40; i++) { const w = 6 + (i * 7) % 12, h = 3 + (i * 13) % 9; g.fillRect((i * 61) % W, H * 0.86 - h, w, h); }
    for (let i = 0; i < 3; i++) { const x = 160 + i * 330, y = 50 + i * 18; g.fillStyle = '#334155'; g.fillRect(x, y, 30, 5); g.fillRect(x + 10, y - 4, 8, 13); g.fillStyle = '#ec3013'; g.fillRect(x + 26, y + 1, 4, 3); } });
  const viewM = new THREE.MeshBasicMaterial({ map: viewT }); planeT(null, 20, 2.9, 0, 2.35, -9.84, 0, G, viewM);
  const monT = CT(256, 160, (g, W, H) => { g.fillStyle = '#1e293b'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(63,211,255,0.35)'; g.lineWidth = 1; for (let x = 16; x < W; x += 28) { g.beginPath(); g.moveTo(x, 8); g.lineTo(x, H - 8); g.stroke(); } for (let y = 12; y < H; y += 28) { g.beginPath(); g.moveTo(8, y); g.lineTo(W - 8, y); g.stroke(); }
    g.fillStyle = '#5f6469'; for (const [x, y] of [[2, 1], [5, 3], [3, 4], [6, 1]]) g.fillRect(16 + x * 28, 12 + y * 28, 28, 28);
    g.strokeStyle = '#ffd23a'; g.lineWidth = 4; g.beginPath(); g.moveTo(30, 138); g.lineTo(30, 54); g.lineTo(114, 54); g.lineTo(114, 110); g.lineTo(198, 110); g.stroke(); g.fillStyle = '#ec3013'; g.beginPath(); g.arc(198, 110, 7, 0, 7); g.fill(); });
  const camM = new THREE.MeshBasicMaterial({ map: monT }); for (const [z, y] of [[-0.6, 1.5], [1.0, 1.5], [-0.6, 2.25], [1.0, 2.25]]) planeT(null, 1.26, 0.56, -9.63, y, z, Math.PI / 2, G, camM);
  planeT(plate('MACHINE FLEET \u00b7 ENGINEERING', 512, 96, INK, PAPER, CYAN), 2.6, 0.45, 0, 3.4, 9.83, Math.PI, G);
  planeT(plate('LIFT \u00b7 LOBBY', 384, 96, INK, PAPER, RED), 1.5, 0.36, 0, 3.05, 9.82, Math.PI, G);
  planeT(plate('CHIEF ENGINEER', 512, 96, NAVY, PAPER, HAZ), 1.8, 0.36, 0, 1.75, -6.0, 0, G);
  planeT(plate('REPAIR BAY', 384, 96, INK, PAPER, RED), 1.8, 0.4, -6.8, 3.3, -9.8, 0, G);
  planeT(plate('PATROL CONTROL', 384, 96, INK, PAPER, RED), 1.8, 0.4, -9.83, 3.2, 0.2, Math.PI / 2, G);
  planeT(plate('HULL RIVETS', 384, 96, INK, PAPER, RED), 1.8, 0.38, -5.6, 3.2, 9.83, Math.PI, G);
  planeT(plate('DRONE TEST', 384, 96, INK, PAPER, RED), 1.6, 0.38, 9.83, 3.3, 1.4, -Math.PI / 2, G);
  planeT(plate('FAULT FINDER', 384, 96, INK, PAPER, RED), 1.6, 0.38, 6.6, 3.3, 9.83, Math.PI, G);
  planeT(plate('PARTS CANTEEN', 384, 96, NAVY, PAPER, HAZ), 1.3, 0.3, 9.83, 2.6, 5.2, -Math.PI / 2, G);
  planeT(plate('DIRECTOR', 384, 96, INK, PAPER, CYAN), 1.6, 0.4, 9.83, 3.2, -7.2, -Math.PI / 2, G);
  planeT(plate('COGSWORTH', 256, 96, NAVY, PAPER), 1.0, 0.34, 7.0, 3.3, -3.98, Math.PI, G);
  const trophy = new THREE.Group(); { const S = mk(); S.cyl(0.14, 0.18, 0.1, INK, 0, 0.05, 0, 12); S.cyl(0.06, 0.12, 0.34, PAPER, 0, 0.27, 0, 12); S.box(0.16, 0.12, 0.12, PAPER, 0, 0.5, 0); S.box(0.12, 0.03, 0.02, CYAN, 0, 0.51, 0.065); S.box(0.22, 0.06, 0.02, NAVY, 0, 0.06, 0.16); S.mesh(trophy); }
  trophy.position.set(9.35, 0.92, -2.6); G.add(trophy); trophy.visible = false;
  const crystal = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11), new THREE.MeshLambertMaterial({ color: '#bff3ff', emissive: '#3fd3ff', emissiveIntensity: 0.6 })); crystal.position.set(7.9, 1.2, -7.3); crystal.userData.noCull = true; G.add(crystal); crystal.visible = false;
  // robots: the guard bot on the repair turntable, a sweeper bot doing laps, the test drone in its cage, blinking server LEDs
  const makeBot = (s, body) => { const g = new THREE.Group(), M = mk(); M.box(0.5, 0.12, 0.42, BLACK, 0, 0.08, 0); for (const x of [-0.2, 0.2]) M.box(0.12, 0.16, 0.46, DK, x, 0.09, 0);
    M.box(0.42, 0.5, 0.32, body, 0, 0.45, 0); M.box(0.44, 0.06, 0.34, NAVY, 0, 0.62, 0); M.box(0.14, 0.1, 0.02, CYAN, 0, 0.42, 0.165); M.mesh(g);
    const head = new THREE.Group(); head.position.y = 0.72; const H = mk(); H.box(0.34, 0.24, 0.28, body, 0, 0.12, 0); H.box(0.28, 0.07, 0.02, CYAN, 0, 0.14, 0.145); H.cyl(0.015, 0.015, 0.16, STEEL, 0.1, 0.32, 0, 6); H.sph(0.03, RED, 0.1, 0.41, 0); H.mesh(head); g.add(head);
    const arms = [-1, 1].map(sx => { const a = new THREE.Group(); a.position.set(sx * 0.27, 0.64, 0); const Q = mk(); Q.box(0.09, 0.34, 0.09, STEEL, 0, -0.15, 0); Q.box(0.12, 0.08, 0.12, body, 0, -0.34, 0); Q.mesh(a); g.add(a); return a; });
    g.scale.setScalar(s); g.userData.head = head; g.userData.arms = arms; return g; };
  const benchBot = makeBot(1.05, CREAM); benchBot.position.set(-6.8, 1.03, -7.8); G.add(benchBot);
  const sweeper = makeBot(0.62, HAZ); sweeper.position.set(-3, 0, -2.6); sweeper.rotation.y = Math.PI / 2; G.add(sweeper); const SW = { x: -3, d: 1, turn: 0 };
  const drone = new THREE.Group(), rotors = []; { const M = mk(); M.box(0.46, 0.12, 0.46, PAPER, 0, 0, 0); M.box(0.48, 0.04, 0.12, RED, 0, 0.07, 0); M.box(0.16, 0.08, 0.04, CYAN, 0, 0, 0.24); for (const a of [Math.PI / 4, -Math.PI / 4]) M.box(1.0, 0.04, 0.06, DK, 0, 0.02, 0, a); M.mesh(drone);
    for (const [x, z] of [[0.35, 0.35], [-0.35, 0.35], [0.35, -0.35], [-0.35, -0.35]]) { const r = new THREE.Group(); r.position.set(x, 0.08, z); const R = mk(); R.box(0.36, 0.01, 0.05, INK, 0, 0, 0); R.box(0.05, 0.01, 0.36, INK, 0, 0, 0); R.cyl(0.03, 0.03, 0.06, STEEL, 0, -0.03, 0, 6); R.mesh(r); drone.add(r); rotors.push(r); } }
  drone.position.set(8.7, 1.3, 1.4); G.add(drone);
  const ledA = new THREE.MeshBasicMaterial({ color: '#7cff9b' }), ledB = new THREE.MeshBasicMaterial({ color: '#ec3013' }), ledGeo = new THREE.PlaneGeometry(0.07, 0.05);
  for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) { const m = new THREE.Mesh(ledGeo, (r + q) % 3 ? ledA : ledB); m.position.set(5.0 + q * 0.75 + (r % 2) * 0.25, 0.8 + r * 0.6, 9.33); m.rotation.y = Math.PI; m.userData.noCull = true; G.add(m); }
  let ledT = 0; function animDeco(dt, t) { const u = benchBot.userData; u.head.rotation.y = Math.sin(t * 0.7) * 0.6; u.arms[1].rotation.x = -0.4 + Math.sin(t * 3) * 0.3;
    drone.position.y = 1.3 + Math.sin(t * 2) * 0.08; drone.rotation.y = Math.sin(t * 0.4) * 0.5; for (const r of rotors) r.rotation.y += dt * 30;
    if (SW.turn > 0) { SW.turn -= dt; sweeper.rotation.y += dt * Math.PI / 0.6; if (SW.turn <= 0) sweeper.rotation.y = SW.d > 0 ? Math.PI / 2 : -Math.PI / 2; } else { SW.x += SW.d * dt * 0.8; if (SW.x > 3.2 || SW.x < -3.2) { SW.x = clamp(SW.x, -3.2, 3.2); SW.d *= -1; SW.turn = 0.6; } }
    sweeper.position.x = SW.x; sweeper.userData.head.rotation.y = Math.sin(t * 1.3) * 0.3;
    if ((ledT -= dt) <= 0) { ledT = 0.35; ledA.color.set(Math.random() > 0.5 ? '#7cff9b' : '#3f9a5e'); ledB.color.set(Math.random() > 0.3 ? '#ec3013' : '#5a1a10'); } }
  // ================= LOBBY: the lift sign =================
  const LG = new THREE.Group(); LG.position.set(LOX, LY, LZ); scene.add(LG); LG.visible = false;
  planeT(plate('ENGINEERING \u00b7 FLEET WORK', 512, 96, INK, PAPER, CYAN), 1.8, 0.32, -GEO.RW / 2 + 0.26, 3.15, -4, Math.PI / 2, LG);
  const LLIFT = [-8.4, -4], LDESK = [0, -5], MAIN = [0, 9.0];
  // ================= FOXES =================
  const LW0 = [0, -7.8, 0], BOSS0 = [7.2, -8.3, 0], W0 = [[-4.4, 2.3, Math.PI], [4.4, 2.3, Math.PI]];
  const lawyer = kit.makeFox({ key: 'mfEngineer', name: 'Chief Engineer', torso: ['#e7e4dc', '#334155', '#1e293b'], outfit: 'coat', mood: 'neutral' }); lawyer.position.set(LW0[0], 0, LW0[1]); lawyer.rotation.y = LW0[2]; lawyer.userData.noCull = true; lawyer.userData.rosterShop = 'MACHINE FLEET HQ'; lawyer.userData.rosterRole = 'keeper'; G.add(lawyer);
  const boss = kit.makeFox({ key: 'mfDirector', name: 'Director Cogsworth', torso: ['#e7e4dc', '#475569', '#26292d'], outfit: 'suit', mood: 'warm' }); boss.position.set(BOSS0[0], 0, BOSS0[1]); boss.rotation.y = BOSS0[2]; boss.userData.noCull = true; boss.userData.rosterShop = 'MACHINE FLEET HQ'; G.add(boss); circL(BOSS0[0], BOSS0[1], 0.45);
  const workers = W0.map(([x, z, ry], i) => { const f = kit.makeFox({ key: 'mfEng' + i, name: 'Engineer', torso: LOOKS[i ? 2 : 0], outfit: i ? 'vest' : 'coat', mood: 'neutral' }); f.position.set(x, 0, z); f.rotation.y = ry; f.userData.noCull = true; f.userData.rosterShop = 'MACHINE FLEET HQ'; G.add(f); circL(x, z, 0.45); return f; });
  // ================= shopKit (the chief engineer = keeper) =================
  const GAMES = [{ k: 'repair', name: 'Repair a Guard Bot', color: CYAN }, { k: 'patrol', name: 'Program a Patrol', color: BLUE }, { k: 'rivets', name: 'Hull Rivets', color: STEEL }, { k: 'drone', name: 'Drone Test Flight', color: RED }, { k: 'fault', name: 'Fault Finder', color: GRN }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { repair: [-6.8, -5.9], patrol: [-7.6, 0.2], rivets: [-5.6, 6.2], drone: [6.6, 1.4], fault: [6.6, 6.0] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mfh', color: NAVY, boardTitle: 'Fleet engineering board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper: lawyer, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -8.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: -2.6, z: 8.2, ry: 0 }, hiringLine: 'BOTS \u00b7 PATROLS \u00b7 RIVETS \u00b7 DRONES \u00b7 FAULTS', sun: [{ x: -5, z: -7.6, w: 3.2, d: 2.2 }, { x: 1.6, z: -3.8, w: 3.2, d: 2.2 }, { x: -1.4, z: -8.2, w: 2.4, d: 1.6 }],
    lamps: LAMPS.map(([x, z]) => [x, RH - 0.85, z]), lampsOn: () => { const h = hour(); return h >= 19 || h < 7; },
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
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'FLEET');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;
  const T_LW = { key: 'mfEngineer', name: 'Chief Engineer', role: 'MACHINE FLEET', obj: lawyer, ry: LW0[2], r: 6 }, lwLn = ln('Chief Engineer', 'MACHINE FLEET');
  const T_OS = { key: 'mfDirector', name: 'Director Cogsworth', role: 'MACHINE FLEET DIRECTOR', obj: boss, ry: BOSS0[2], r: 6 }, osLn = ln('Director Cogsworth', 'MACHINE FLEET DIRECTOR');
  // ---------- 1 REPAIR A GUARD BOT (bench): tap a broken part, then the right tool ----------
  const RPT = 18, RPN = 6, PARTS = [['head', 'HEAD'], ['armL', 'LEFT ARM'], ['core', 'CORE'], ['armR', 'RIGHT ARM'], ['legs', 'TREADS']];
  const FAULTS = { bolt: ['LOOSE BOLT', 'WRENCH'], wire: ['CUT WIRE', 'SOLDER'], crack: ['CRACKED PLATE', 'NEW PLATE'], cell: ['FLAT CELL', 'CHARGER'] }, FK = Object.keys(FAULTS), TOOLS = FK.map(k => [k, FAULTS[k][1]]);
  const fGlyph = k => '<svg viewBox="0 0 24 24" style="width:24px;height:24px;flex:none" aria-hidden="true">' + ({ bolt: '<polygon points="12,3 20,7.5 20,16.5 12,21 4,16.5 4,7.5" fill="#ffd23a" stroke="#201e1d" stroke-width="2"/><circle cx="12" cy="12" r="3" fill="#201e1d"/>',
      wire: '<path d="M2 12h6l2-4M22 12h-6l-2 4" fill="none" stroke="#ec3013" stroke-width="3"/><path d="M10 6l1 2M14 18l-1-2" stroke="#ffd23a" stroke-width="2"/>',
      crack: '<rect x="3" y="3" width="18" height="18" fill="#9aa0a6" stroke="#201e1d" stroke-width="2"/><path d="M7 4l4 6-3 3 5 7" fill="none" stroke="#201e1d" stroke-width="2"/>',
      cell: '<rect x="3" y="7" width="16" height="10" fill="#fff" stroke="#201e1d" stroke-width="2"/><rect x="19" y="10" width="3" height="4" fill="#201e1d"/><rect x="5" y="9" width="3" height="6" fill="#ec3013"/>' })[k] + '</svg>';
  const okGlyph = '<svg viewBox="0 0 24 24" style="width:24px;height:24px;flex:none" aria-hidden="true"><path d="M4 12l5 5 11-11" fill="none" stroke="#2f7d5a" stroke-width="3.5"/></svg>';
  GD.repair = { panel: true, shot: () => [toW(-6.8, 1.5, -7.8), 3.4, 2.2, 0.3, 3.0, 0, 6],
    begin() { goRoom(-6.8, -5.9, Math.PI); J.list = [...Array(RPN)].map((_, i) => { const parts = pickN(PARTS.map(p => p[0]), 2 + Math.floor(i / 2)); return { f: Object.fromEntries(parts.map(p => [p, pick1(FK)])), fixed: {}, id: 'GB-' + (10 + Math.floor(Math.random() * 89)) }; });
      J.ci = 0; J.cueT = RPT; J.wait = 0.4; J.sel = null; snapK = true; this.draw(); },
    left(c) { return Object.keys(c.f).filter(p => !c.fixed[p]); },
    draw() { const c = J.list[J.ci];
      const cell = ([p, nm]) => { const f = c.f[p], fx = c.fixed[p], bad = f && !fx, sel = J.sel === p; return '<button data-p="' + p + '" style="' + BTN + ';grid-area:' + p + ';display:flex;flex-direction:column;align-items:flex-start;gap:4px;background:' + (sel ? '#201e1d' : bad ? '#ffe1da' : '#fff') + ';color:' + (sel ? '#ffd23a' : '#201e1d') + ';border-color:' + (bad ? '#ec3013' : '#201e1d') + '"><span style="font-size:12px">' + nm + '</span><span style="display:flex;align-items:center;gap:6px;font-size:11px">' + (bad ? fGlyph(f) + FAULTS[f][0] : okGlyph + (fx ? 'FIXED' : 'OK')) + '</span></button>'; };
      const nl = c ? this.left(c).length : 0;
      showPanel(panelHead('REPAIR A GUARD BOT \u00b7 BOT ' + nOf(), goldR()) + body(c ? '<div style="font-size:11px;font-weight:900;color:#ec3013">GUARD BOT ' + c.id + ' \u00b7 ' + nl + ' FAULT' + (nl === 1 ? '' : 'S') + ' LEFT</div>'
        + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-areas:\'. head .\' \'armL core armR\' \'. legs .\';gap:6px">' + PARTS.map(cell).join('') + '</div>' + timeRow
        + '<div style="font-size:11px;font-weight:900">' + (J.sel ? 'TOOL FOR THE ' + PARTS.find(q => q[0] === J.sel)[1] + '?' : 'TAP A RED PART FIRST') + '</div><div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px">' + TOOLS.map(([k, n]) => '<button data-t="' + k + '" style="' + BTN + ';min-height:56px;font-size:13px' + (J.sel ? '' : ';opacity:.5') + '">' + n + '</button>').join('') + '</div>'
        : '<div style="font-size:22px;font-weight:900">EVERY BOT BACK ON DUTY</div>') + tipBar('BOLT \u2192 WRENCH \u00b7 WIRE \u2192 SOLDER \u00b7 CRACK \u2192 PLATE \u00b7 FLAT \u2192 CHARGER'));
      PANEL.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => this.part(b.dataset.p); }); PANEL.querySelectorAll('[data-t]').forEach(b => { b.onclick = () => this.tool(b.dataset.t, b); }); J.idle = 0; J.hinted = false; },
    part(p) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; if (c.f[p] && !c.fixed[p]) { J.sel = p; blip(); this.draw(); } else { tone(600, 0.03, 0.08, 'square'); okTip('THAT PART WORKS \u00b7 FIND A RED ONE'); } },
    tool(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; if (!J.sel) { okTip('TAP A RED PART FIRST'); const l = this.left(c); if (l.length) pulse(PANEL.querySelector('[data-p="' + l[0] + '"]')); return; }
      if (c.f[J.sel] !== k) { missOne('WRONG TOOL \u00b7 READ THE FAULT'); shake(el); return; }
      c.fixed[J.sel] = true; J.sel = null; tone(880, 0.05, 0.1, 'square'); tone(1320, 0.04, 0.12, 'square', 0.06);
      if (!this.left(c).length) { addGold(4); ding(); this.draw(); okTip('BEEP. SYSTEMS ONLINE. THANK YOU, ENGINEER.'); J.wait = 0.9; setTimeout(() => this.next(), 900); return; } this.draw(); },
    next() { J.sel = null; roundNext(this, 'repair', RPT); },
    tick(dt) { roundTick(this, dt, RPT, 'TOO SLOW \u00b7 THE BOT RAN OUT OF POWER', () => { const c = J.list[J.ci]; if (J.sel) return '[data-t="' + c.f[J.sel] + '"]'; const l = this.left(c); return l.length ? '[data-p="' + l[0] + '"]' : null; }); } };
  // ---------- 2 PROGRAM A PATROL (console): arrow steps, the bot must touch every checkpoint in order ----------
  const PTT = 45, PTN = 5, GW = 6, MAXP = 16, DIRS = { u: [0, -1, '\u25b2'], d: [0, 1, '\u25bc'], l: [-1, 0, '\u25c0'], r: [1, 0, '\u25b6'] };
  const bfs = (walls, a, b) => { const key = (x, y) => y * GW + x, prev = new Map([[key(a[0], a[1]), null]]), q = [a];
    while (q.length) { const [x, y] = q.shift(); if (x === b[0] && y === b[1]) { const out = []; let k = key(x, y); while (prev.get(k)) { const [pk, dk] = prev.get(k); out.unshift(dk); k = pk; } return out; }
      for (const dk in DIRS) { const nx = x + DIRS[dk][0], ny = y + DIRS[dk][1], nk = key(nx, ny); if (nx < 0 || ny < 0 || nx >= GW || ny >= GW || walls.has(nk) || prev.has(nk)) continue; prev.set(nk, [key(x, y), dk]); q.push([nx, ny]); } } return null; };
  const makeRoute = i => { const nc = i < 2 ? 2 : 3, nw = 5 + i, PC = k => [k % GW, Math.floor(k / GW)];
    for (let n = 0; n < 300; n++) { const cells = shuffle([...Array(GW * GW).keys()]), cps = cells.slice(1, 1 + nc), walls = new Set(cells.slice(1 + nc, 1 + nc + nw)); let at = PC(cells[0]), sol = [], ok = true;
      for (const c of cps) { const s = bfs(walls, at, PC(c)); if (!s) { ok = false; break; } sol = sol.concat(s); at = PC(c); }
      if (ok && sol.length >= 5 + i && sol.length <= MAXP - 2) return { st: PC(cells[0]), cps: cps.map(PC), walls, sol }; }
    return { st: [0, 0], cps: [[3, 0], [3, 3]], walls: new Set(), sol: ['r', 'r', 'r', 'd', 'd', 'd'] }; };
  GD.patrol = { panel: true, shot: () => [toW(-9.6, 1.9, 0.2), 3.2, 2.2, 0.12, 3.0, Math.PI / 2, 5.5],
    begin() { goRoom(-7.6, 0.2, -Math.PI / 2); J.list = [...Array(PTN)].map((_, i) => makeRoute(i)); J.ci = 0; J.cueT = PTT; J.wait = 0.4; J.prog = []; J.run = null; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('PROGRAM A PATROL', goldR()) + body('<div style="font-size:22px;font-weight:900">EVERY PATROL RUNNING</div>') + tipBar('THE STREETS ARE SAFE')); return; }
      const R = J.run, bx = R ? R.x : c.st[0], by = R ? R.y : c.st[1], hit = R ? R.hit : 0, W2 = wide(); let cells = '';
      for (let y = 0; y < GW; y++) for (let x = 0; x < GW; x++) { const wl = c.walls.has(y * GW + x), ci = c.cps.findIndex(p => p[0] === x && p[1] === y), st = c.st[0] === x && c.st[1] === y, bot = bx === x && by === y;
        cells += '<div style="position:relative;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:14px;aspect-ratio:1;background:' + (wl ? 'repeating-linear-gradient(45deg,#3d4148 0 6px,#26292d 6px 12px)' : st ? '#cfe9f3' : '#fff') + '">'
          + (ci >= 0 ? '<span style="padding:1px 6px;border:2px solid #201e1d;background:' + (ci < hit ? '#201e1d' : '#ffd23a') + ';color:' + (ci < hit ? '#ffd23a' : '#201e1d') + '">' + (ci < hit ? '\u2713' : ci + 1) + '</span>' : st && !bot ? '<span style="font-size:9px">DOCK</span>' : '')
          + (bot ? '<span style="position:absolute;inset:16%;background:#3fd3ff;border:2px solid #201e1d;display:flex;align-items:center;justify-content:center"><span style="width:60%;height:22%;background:#201e1d"></span></span>' : '') + '</div>'; }
      const grid = '<div style="display:grid;grid-template-columns:repeat(' + GW + ',minmax(0,1fr));gap:2px;background:#201e1d;border:2px solid #201e1d;flex:none;' + (W2 ? 'width:min(50%, ' + Math.max(150, innerHeight - (innerHeight < 520 ? 16 : 136) - 110) + 'px);align-self:flex-start' : 'width:min(100%, 40vh);align-self:center') + '">' + cells + '</div>';
      const info = '<div style="display:flex;justify-content:space-between;gap:8px;font-size:11px;font-weight:900"><span style="color:#ec3013">TOUCH ' + c.cps.map((_, i) => i + 1).join(' \u2192 ') + ' \u00b7 MISS THE CRATES</span><span>' + J.prog.length + ' / ' + MAXP + '</span></div>';
      const strip = '<div style="display:flex;flex-wrap:wrap;gap:3px;min-height:30px;border:2px solid #201e1d;background:#fff;padding:3px;flex:none">' + (J.prog.length ? J.prog.map((d, i) => '<span style="min-width:20px;padding:2px 4px;font-size:13px;font-weight:900;background:' + (R && i === R.i - 1 ? '#ffd23a' : '#e7e4dc') + '">' + DIRS[d][2] + '</span>').join('') : '<span style="font-size:11px;font-weight:900;opacity:.6;padding:4px">EMPTY \u00b7 ADD STEPS</span>') + '</div>';
      const ctl = '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;flex:none">' + [['x', 'UNDO'], ['u', '\u25b2'], ['c', 'CLEAR'], ['l', '\u25c0'], ['d', '\u25bc'], ['r', '\u25b6']].map(([k, t]) => '<button data-a="' + k + '" style="' + BTN + ';min-height:50px;' + (DIRS[k] ? 'font-size:22px' : 'font-size:12px') + (R ? ';opacity:.5' : '') + '">' + t + '</button>').join('') + '</div>'
        + '<button data-run style="' + BTN + ';flex:none;min-height:54px;font-size:18px;background:#ec3013;color:#fff' + (R ? ';opacity:.5' : '') + '">' + (R ? 'RUNNING\u2026' : 'RUN PATROL') + '</button>';
      showPanel(panelHead('PROGRAM A PATROL \u00b7 ROUTE ' + nOf(), goldR()) + body(W2 ? '<div style="flex:1;min-height:0;display:flex;gap:10px">' + grid + '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:6px">' + info + strip + timeRow + ctl + '</div></div>' : info + grid + strip + timeRow + ctl) + tipBar('ARROWS ADD STEPS \u00b7 RUN \u00b7 A CRASH SENDS THE BOT BACK TO THE DOCK'));
      PANEL.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => this.key(b.dataset.a); }); const rb = PANEL.querySelector('[data-run]'); if (rb) rb.onclick = () => this.run(); J.idle = 0; J.hinted = false; },
    key(k) { if (J.run || J.wait > 0) return; J.idle = 0; if (k === 'x') J.prog.pop(); else if (k === 'c') J.prog = []; else { if (J.prog.length >= MAXP) { okTip('PROGRAM FULL \u00b7 ' + MAXP + ' STEPS'); nope(); return; } J.prog.push(k); } blip(); this.draw(); },
    run() { const c = J.list[J.ci]; if (!c || J.run || J.wait > 0) return; if (!J.prog.length) { okTip('ADD SOME STEPS FIRST'); return; } J.run = { i: 0, x: c.st[0], y: c.st[1], hit: 0, t: 0.25 }; tone(520, 0.05, 0.1, 'square'); this.draw(); },
    step() { const c = J.list[J.ci], R = J.run, d = J.prog[R.i]; if (d == null) { missOne('PATROL INCOMPLETE \u00b7 ADD MORE STEPS'); J.run = null; this.draw(); return; }
      const nx = R.x + DIRS[d][0], ny = R.y + DIRS[d][1], off = nx < 0 || ny < 0 || nx >= GW || ny >= GW; R.i++;
      if (off || c.walls.has(ny * GW + nx)) { missOne(off ? 'CRASH \u00b7 OFF THE MAP' : 'CRASH \u00b7 THE BOT HIT A CRATE'); J.run = null; this.draw(); return; }
      R.x = nx; R.y = ny; tone(700 + R.i * 20, 0.03, 0.06, 'square'); const cp = c.cps[R.hit];
      if (cp && cp[0] === nx && cp[1] === ny) { R.hit++; coin(); if (R.hit >= c.cps.length) { addGold(4); ding(); this.draw(); okTip('PATROL ROUTE SAVED \u00b7 GOOD CODE'); J.wait = 1.0; setTimeout(() => this.next(), 900); return; } } this.draw(); },
    next() { J.run = null; J.prog = []; roundNext(this, 'patrol', PTT); },
    tick(dt) { if (J.run && J.wait <= 0) { J.idle = 0; J.run.t -= dt; if (J.run.t <= 0) { J.run.t = 0.26; this.step(); } }
      roundTick(this, dt, PTT, 'TOO SLOW \u00b7 THE NIGHT SHIFT STARTED', () => { const c = J.list[J.ci], ok = J.prog.every((d, i) => d === c.sol[i]); return !ok ? '[data-a="x"]' : J.prog.length >= c.sol.length ? '[data-run]' : '[data-a="' + c.sol[J.prog.length] + '"]'; }); } };
  // ---------- 3 HULL RIVETS (hull panel): tap each rivet as its ring closes on it ----------
  const RVN = 4, RVK = 8;
  GD.rivets = { panel: true, shot: () => [toW(-5.6, 1.6, 9.0), 3.4, 2.2, 0.15, 3.0, Math.PI, 5.5],
    begin() { goRoom(-5.6, 6.2, 0); J.list = [...Array(RVN)].map((_, i) => { const gap = 0.95 - i * 0.12, dur = 1.7 - i * 0.18, pts = []; for (let r = 0; r < 2; r++) for (let q = 0; q < 4; q++) pts.push([14 + q * 24 + rnd(-4, 4), 28 + r * 44 + rnd(-6, 6)]);
        return { dur, rv: (i < 2 ? pts : shuffle(pts)).map((p, k) => ({ x: p[0], y: p[1], t0: 0.6 + k * gap, st: 0 })) }; }); J.ci = 0; J.wait = 0.4; J.pt = 0; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      const plate = c ? '<div style="position:relative;width:100%;max-width:calc((100vh - 170px) * 1.6);aspect-ratio:16/10;align-self:center;flex:none;background-color:#9aa0a6;border:2px solid #201e1d;background-image:linear-gradient(90deg,rgba(0,0,0,.1) 2px,transparent 2px),linear-gradient(rgba(0,0,0,.1) 2px,transparent 2px);background-size:25% 50%">'
        + c.rv.map((r, k) => '<button data-r="' + k + '" style="position:absolute;left:' + r.x.toFixed(1) + '%;top:' + r.y.toFixed(1) + '%;width:56px;height:56px;margin:-28px 0 0 -28px;padding:0;background:transparent;border:0;border-radius:0;cursor:pointer;touch-action:none"><span data-dot style="position:absolute;left:50%;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;background:' + (r.st === 1 ? '#d7dadd' : r.st === 2 ? '#ec3013' : '#3d4148') + ';border:2px solid #201e1d"></span><span data-ring style="position:absolute;left:50%;top:50%;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;border:3px solid #ffd23a;opacity:0;pointer-events:none"></span></button>').join('') + '</div>' : '';
      showPanel(panelHead('HULL RIVETS \u00b7 PANEL ' + nOf(), goldR()) + body(c ? '<div style="font-size:11px;font-weight:900;color:#ec3013">TAP EACH RIVET WHEN ITS RING TURNS GREEN \u00b7 ' + c.rv.filter(r => r.st === 1).length + ' / ' + RVK + ' SET</div>' + plate + timeRow : '<div style="font-size:22px;font-weight:900">THE HULL IS SEALED</div>') + tipBar('YELLOW RING = WAIT \u00b7 GREEN RING = HIT NOW \u00b7 TOO EARLY BENDS IT'));
      PANEL.querySelectorAll('[data-r]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); this.hit(+b.dataset.r); }; }); this.paint(); },
    paint() { const c = J.list[J.ci]; if (!c) return; PANEL.querySelectorAll('[data-r]').forEach(b => { const r = c.rv[+b.dataset.r], g = b.querySelector('[data-ring]'), u = (J.pt - r.t0) / c.dur; if (!g) return;
        if (r.st || u < 0 || u > 1.15) { g.style.opacity = '0'; return; } g.style.opacity = '1'; g.style.transform = 'scale(' + (1 + 2.4 * Math.max(0, 1 - u)).toFixed(2) + ')'; g.style.borderColor = u >= 0.7 ? '#7cff9b' : '#ffd23a'; });
      const last = c.rv[c.rv.length - 1]; timeBar(PANEL.querySelector('[data-time]'), 1 - J.pt / (last.t0 + c.dur * 1.15), false); },
    hit(k) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; const r = c.rv[k]; if (r.st) return; const u = (J.pt - r.t0) / c.dur; if (u < 0) return;
      if (u < 0.7) { r.st = 2; missOne('TOO EARLY \u00b7 THE RIVET BENT'); tone(140, 0.05, 0.2, 'sawtooth'); this.after(); return; }
      r.st = 1; tone(200, 0.08, 0.12, 'square'); tone(90, 0.06, 0.18, 'triangle', 0.02); this.after(); },
    after() { const c = J.list[J.ci]; this.draw(); if (c.rv.every(r => r.st)) { addGold(c.rv.every(r => r.st === 1) ? 5 : 2); ding(); okTip('PANEL SEALED'); J.wait = 0.9; setTimeout(() => this.next(), 800); } },
    next() { if (!J || J.g !== 'rivets') return; J.ci++; J.pt = 0; J.wait = 0.4; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } this.draw(); },
    tick(dt) { const c = J.list[J.ci]; if (!c) return; if (J.wait > 0) { J.wait -= dt; return; } J.pt += dt; let ch = false;
      for (const r of c.rv) if (!r.st && (J.pt - r.t0) / c.dur > 1.15) { r.st = 2; missOne('MISSED A RIVET'); ch = true; } if (ch) this.after(); else this.paint(); } };
  // ---------- 4 DRONE TEST FLIGHT (test cage): HOLD to climb, let go to drop, fly through 10 test gates ----------
  const DGN = 10, DRX = 0.3, DRR = 0.035, GWW = 0.08;
  GD.drone = { panel: true, shot: () => [toW(8.7, 1.3, 1.4), 2.6, 2.0, 0.15, 2.6, -Math.PI / 2, 5],
    begin() { goRoom(6.6, 1.4, Math.PI / 2); let gy = 0.5; J.list = [...Array(DGN)].map((_, i) => { gy = clamp(gy + rnd(-0.28, 0.28), 0.27, 0.73); return { x: 1.3 + i * 0.95, y: gy, gap: 0.36 - i * 0.008, mv: i >= 6 ? rnd(0.06, 0.1) : 0, ph: Math.random() * 6, st: 0 }; });
      J.ci = 0; J.dx = 0; J.dy = 0.5; J.vy = 0; J.hold = false; J.ready = 1.4; J.inv = 0; J.wait = 0; snapK = true;
      const isK = e => e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW', kd = e => { if (isK(e)) { J && (J.hold = true); e.preventDefault(); e.stopPropagation(); } }, ku = e => { if (isK(e)) { J && (J.hold = false); e.preventDefault(); e.stopPropagation(); } };
      addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; this.draw(); },
    gy(q) { return q.y + (q.mv ? Math.sin(J.t * 1.4 + q.ph) * q.mv : 0); },
    draw() { const fin = J.ci >= J.list.length, W2 = wide();
      showPanel(panelHead('DRONE TEST FLIGHT \u00b7 GATE ' + nOf(), goldR()) + body(fin ? '<div style="font-size:22px;font-weight:900">TEST PASSED \u00b7 DRONE CERTIFIED</div>' : '<canvas data-cv style="width:100%;display:block;background:#1e293b;touch-action:none;' + (W2 ? 'flex:1;min-height:100px' : 'aspect-ratio:4/3;flex:none') + '"></canvas>' + timeRow
        + '<button data-hold style="' + BTN + ';flex:none;min-height:' + (W2 ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">HOLD TO CLIMB</button>') + tipBar('HOLD = UP \u00b7 LET GO = DOWN \u00b7 FLY THROUGH THE GAPS'));
      const on = e => { e.preventDefault(); J.hold = true; }, off = () => { if (J) J.hold = false; };
      for (const el of [PANEL.querySelector('[data-cv]'), PANEL.querySelector('[data-hold]')]) if (el) { el.onpointerdown = on; el.onpointerup = off; el.onpointerleave = off; el.onpointercancel = off; } },
    tick(dt) { if (J.ci >= J.list.length) return;
      if (J.ready > 0) { J.ready -= dt; J.dy = 0.5 + Math.sin(J.t * 4) * 0.02; } else {
        J.vy = clamp(J.vy + (J.hold ? -2.4 : 1.25) * dt, -0.75, 0.8); J.dy += J.vy * dt; if (J.dy < 0.06) { J.dy = 0.06; J.vy = 0; } if (J.dy > 0.94) { J.dy = 0.94; J.vy = 0; } J.dx += dt * 0.34; J.inv -= dt;
        const g = J.list[J.ci], gx = g.x - J.dx, gy = this.gy(g);
        if (!g.st && gx < DRX + DRR && gx + GWW > DRX - DRR && Math.abs(J.dy - gy) > g.gap / 2 - DRR) { g.st = 2; missOne('CLIPPED GATE ' + (J.ci + 1)); tone(120, 0.06, 0.25, 'sawtooth'); J.inv = 0.6; }
        if (gx + GWW < DRX - DRR) { if (!g.st) { g.st = 1; addGold(2); tone(1200 + J.ci * 60, 0.04, 0.12, 'triangle'); } J.ci++; const h = PANEL.querySelector('[data-h]'); if (h) h.textContent = 'DRONE TEST FLIGHT \u00b7 GATE ' + nOf();
          if (J.ci >= J.list.length) { addGold(6); ding(); okTip('TEST PASSED \u00b7 DRONE CERTIFIED'); J.off && J.off(); J.hold = false; setTimeout(finishGame, 900); } } }
      timeBar(PANEL.querySelector('[data-time]'), J.ci / J.list.length, false); const cv = PANEL.querySelector('[data-cv]'); if (cv) this.render(cv); },
    render(cv) { const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
      const g = cv.getContext('2d'), S = cv.height, AW = cv.width / S, ox = J.dx; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#1e293b'; g.fillRect(0, 0, cv.width, cv.height); g.setTransform(S, 0, 0, S, 0, 0);
      g.strokeStyle = 'rgba(63,211,255,0.16)'; g.lineWidth = 0.004; for (let x = -(ox % 0.25); x < AW; x += 0.25) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, 1); g.stroke(); } for (let y = 0.125; y < 1; y += 0.25) { g.beginPath(); g.moveTo(0, y); g.lineTo(AW, y); g.stroke(); }
      g.fillStyle = '#3d4148'; g.fillRect(0, 0.97, AW, 0.03); g.fillRect(0, 0, AW, 0.03); const labels = [];
      J.list.forEach((q, i) => { const x = q.x - ox; if (x < -0.2 || x > AW + 0.2) return; const yy = this.gy(q), t = yy - q.gap / 2, b = yy + q.gap / 2;
        g.fillStyle = q.st === 2 ? '#ec3013' : q.st === 1 ? '#5f6469' : '#9aa0a6'; g.fillRect(x, 0, GWW, t); g.fillRect(x, b, GWW, 1 - b); g.fillStyle = '#ffd23a'; g.fillRect(x, t - 0.02, GWW, 0.02); g.fillRect(x, b, GWW, 0.02); labels.push([String(i + 1), x + 0.012, t - 0.035]); });
      const blink = J.inv > 0 && Math.floor(J.t * 16) % 2; g.save(); g.translate(DRX, J.dy); g.rotate(clamp(J.vy * 0.5, -0.35, 0.35));
      if (!blink) { g.fillStyle = '#f3f2f2'; g.fillRect(-0.05, -0.016, 0.1, 0.032); g.fillStyle = '#ec3013'; g.fillRect(-0.05, -0.016, 0.1, 0.008); g.fillStyle = '#3fd3ff'; g.fillRect(0.03, -0.004, 0.02, 0.01); g.fillStyle = '#201e1d'; const sp = Math.abs(Math.sin(J.t * 40)) * 0.035 + 0.005; for (const sx of [-0.04, 0.04]) { g.fillRect(sx - 0.003, -0.03, 0.006, 0.014); g.fillRect(sx - sp, -0.034, sp * 2, 0.005); } }
      g.restore(); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#f3f2f2'; g.font = '900 ' + Math.round(S * 0.05) + 'px Archivo, sans-serif'; for (const [s, x, y] of labels) g.fillText(s, x * S, y * S);
      if (J.ready > 0) { g.fillStyle = '#ffd23a'; g.font = '900 ' + Math.round(S * 0.1) + 'px Archivo, sans-serif'; g.fillText('READY', (DRX + 0.12) * S, 0.54 * S); } } };
  // ---------- 5 FAULT FINDER (circuit bench): probe the outputs, find the dead module, replace it ----------
  const FFT = 25, FFN = 6, MODS = ['FUSE', 'RELAY', 'CHIP', 'DRIVER', 'SENSOR', 'CAPACITOR', 'REGULATOR', 'AMP', 'GYRO', 'DIODE', 'TIMER', 'SWITCH'], MACH = ['GUARD BOT ARM', 'DRONE ROTOR', 'TANK TURRET', 'SHIP RADAR', 'LIFT MOTOR', 'THE DIRECTOR\u2019S TOASTER'];
  GD.fault = { panel: true, shot: () => [toW(6.6, 1.1, 7.6), 2.8, 1.8, 0.5, 2.6, Math.PI, 5],
    begin() { goRoom(6.6, 6.0, 0); const ms = shuffle(MACH.slice(0, 5)).concat([MACH[5]]); J.list = [...Array(FFN)].map((_, i) => { const n = [5, 6, 6, 7, 8, 8][i]; return { n, mods: pickN(MODS, n), f: Math.floor(Math.random() * n), m: ms[i], probe: {}, used: 0, bud: Math.ceil(Math.log2(n)), wrong: {} }; });
      J.ci = 0; J.cueT = FFT; J.wait = 0.4; J.mode = 'probe'; snapK = true; this.draw(); },
    range(c) { let lo = 0, hi = c.n - 1; for (const k in c.probe) { if (c.probe[k]) lo = Math.max(lo, +k + 1); else hi = Math.min(hi, +k); } return [lo, hi]; },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('FAULT FINDER', goldR()) + body('<div style="font-size:22px;font-weight:900">EVERY BOARD POWERED</div>') + tipBar('THE FLEET RUNS')); return; }
      const fixed = !!c.fixed, mode = J.mode;
      const card = (nm, i) => { const p = c.probe[i], tested = p != null, bad = c.wrong[i];
        return '<button data-m="' + i + '" style="' + BTN + ';min-height:68px;display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;gap:4px;padding:6px 8px;background:' + (fixed ? '#dff3e6' : bad ? '#e7e4dc' : '#fff') + '"><span style="font-size:10px;opacity:.7">' + (i + 1) + ' \u2192</span><span style="font-size:12px">' + nm + '</span>'
          + '<span style="font-size:11px;padding:1px 5px;' + (fixed || (tested && p) ? 'background:#2f7d5a;color:#fff' : tested ? 'background:#ec3013;color:#fff' : bad ? 'background:#201e1d;color:#ffd23a' : 'border:1px dashed #201e1d') + '">' + (fixed ? 'OUT 5 V' : tested ? 'OUT ' + (p ? '5 V' : '0 V') : bad ? 'FINE' : 'OUT ?') + '</span></button>'; };
      const segB = (k, t) => '<button data-mode="' + k + '" style="' + BTN + ';min-height:48px;font-size:13px;background:' + (mode === k ? '#201e1d' : '#fff') + ';color:' + (mode === k ? '#ffd23a' : '#201e1d') + '">' + t + '</button>';
      showPanel(panelHead('FAULT FINDER \u00b7 BOARD ' + nOf(), goldR()) + body('<div style="display:flex;justify-content:space-between;gap:4px 8px;font-size:11px;font-weight:900;flex-wrap:wrap"><span style="color:#ec3013">' + c.m + ' \u00b7 IN 5 V \u2192 OUT ' + (fixed ? '5 V' : '0 V') + '</span><span>PROBES ' + c.used + ' / ' + c.bud + '</span></div>'
        + '<div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px">' + c.mods.map(card).join('') + '</div>' + timeRow
        + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px">' + segB('probe', 'PROBE \u00b7 READ OUT') + segB('swap', 'REPLACE MODULE') + '</div>') + tipBar(mode === 'probe' ? 'TAP A MODULE TO READ ITS OUTPUT \u00b7 5 V = ALL BEFORE IT ARE FINE' : 'TAP THE DEAD MODULE TO REPLACE IT'));
      PANEL.querySelectorAll('[data-m]').forEach(b => { b.onclick = () => this.tap(+b.dataset.m); }); PANEL.querySelectorAll('[data-mode]').forEach(b => { b.onclick = () => { J.mode = b.dataset.mode; J.idle = 0; blip(); this.draw(); }; }); J.idle = 0; J.hinted = false; },
    tap(i) { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.fixed) return; J.idle = 0;
      if (J.mode === 'probe') { if (c.probe[i] != null) return; if (i === c.n - 1) { c.probe[i] = false; this.draw(); okTip('THAT IS THE BOARD OUTPUT \u00b7 0 V \u00b7 FREE PROBE'); return; }
        c.used++; c.probe[i] = i < c.f; tone(c.probe[i] ? 990 : 330, 0.05, 0.14, 'square'); this.draw(); if (c.used > c.bud) missOne('OVER THE PROBE LIMIT \u00b7 SPLIT THE BOARD IN HALF'); return; }
      if (i !== c.f) { c.wrong[i] = true; this.draw(); missOne('THAT MODULE WAS FINE \u00b7 PROBE FIRST'); return; }
      c.fixed = true; addGold(4); ding(); this.draw(); okTip('POWER ON \u00b7 THE ' + c.m + ' WORKS'); J.wait = 1.0; setTimeout(() => this.next(), 900); },
    next() { J.mode = 'probe'; roundNext(this, 'fault', FFT); },
    tick(dt) { roundTick(this, dt, FFT, 'TOO SLOW \u00b7 THE BOARD OVERHEATED', () => { const c = J.list[J.ci], [lo, hi] = this.range(c); if (lo >= hi) return J.mode === 'swap' ? '[data-m="' + lo + '"]' : '[data-mode="swap"]'; return J.mode === 'probe' ? '[data-m="' + Math.floor((lo + hi) / 2) + '"]' : '[data-mode="probe"]'; }); } };
  // ================= PRIZES =================
  const SUIT = { outfit: 'coat', torso: ['#e7e4dc', '#334155', '#1e293b'], name: 'ENGINEER COAT' };
  const GIFT = { suit: 'An ENGINEER COAT, your size. Pockets for every tool. The Tailor has a copy.', pin: 'Your STAFF BADGE. Twenty percent off at the Parts Canteen. Do not lose it.', trophy: 'All five. The FLEET TROPHY goes in the case, with 60 gold. The Director wants a word.' };
  function giveGift() { save.setStat('mfhClears', save.stat('mfhClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('mfhSuit', false)) { save.setStat('mfhSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 2 && !save.stat('mfhBadge', false)) { save.setStat('mfhBadge', true); save.give('mfBadge'); return 'pin'; }
    if (nd >= GAMES.length && !save.stat('mfhAll', false)) { save.setStat('mfhAll', true); save.give('mfTrophy'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function crystalCheck(then) { if (!allThree() || save.stat('mfhCore', false)) { then && then(); return false; } save.setStat('mfhCore', true); save.addRelic('fleetCore'); crystal.visible = true; ding();
    sayTo(T_OS, [osLn('Three stars on every job. Take the PROTOTYPE CORE. It powered our very first guard bot.')], () => { toast('RELIC \u00b7 PROTOTYPE CORE', 2.6); then && then(); }); return true; }
  // PARTS CANTEEN (vending machine): the staff badge = 20% off
  const shopObj = new THREE.Object3D(); shopObj.position.set(9.0, 1.2, 5.2); G.add(shopObj);
  const SHOP = [['energyPod', 'ENERGY FILL POD', 10], ['erToGo', 'ER TO GO', 10], ['coinChoc', 'COIN CHOCOLATE', 6]];
  const price = p => (save.count('mfBadge') ? Math.round(p * 0.8) : p);
  function shopMenu() { const T = { key: 'mfCanteen', name: 'PARTS CANTEEN', role: 'MACHINE FLEET', obj: shopObj, r: 3 }, pin = !!save.count('mfBadge');
    sayTo(T, [{ who: 'PARTS CANTEEN', role: pin ? 'STAFF BADGE \u00b7 20% OFF' : 'STAFF PRICES WITH A BADGE', text: pin ? 'BEEP. STAFF BADGE ACCEPTED. STAFF PRICES. PICK A SNACK.' : 'BEEP. VISITOR PRICES. STAFF GET TWENTY PERCENT OFF.',
      choices: [...SHOP.map(([id, n, p]) => ({ text: n + ' \u00b7 ' + price(p) + ' G', pick: () => { if (!save.spend(price(p))) { nope(); toast('NOT ENOUGH GOLD', 1.6); return; } save.give(id); coin(); toast(n + ' \u00b7 IN YOUR BAG', 1.8); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  function useItem(id) { if (id === 'mfBadge' && save.count('mfBadge')) { toast('MACHINE FLEET STAFF BADGE \u00b7 20% OFF AT THE PARTS CANTEEN', 2.4); return true; } if (id === 'mfTrophy' && save.count('mfTrophy')) { toast('THE FLEET TROPHY \u00b7 FIVE FOR FIVE IN ENGINEERING', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { repair: 'Guard bots in for repair. Tap the red part, then the right tool.', patrol: 'Program a patrol. Arrow steps, then RUN. Touch every checkpoint in order.', rivets: 'Hull rivets. Tap each rivet when its ring turns green. Too early bends it.', drone: 'Drone test flight. Hold to climb, let go to drop. Ten gates.', fault: 'Fault finder. Probe the outputs, find the dead module, replace it. Few probes.' };
  const DONE = { repair: 'Every bot back on duty. They beeped at you. That means thank you.', patrol: 'Every route saved. The night patrols run on your code now.', rivets: 'The hull is sealed. Not a whistle of air.', drone: 'Ten gates. The drone is certified. So are you.', fault: 'Every board powered. Even the Director\u2019s toaster.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; sayTo(T_LW, [lwLn(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('mfhVisits', save.stat('mfhVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0 }; const D = GD[g]; busy = D.errand ? 'errand' : 'job'; ding(); fade(() => D.begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('mfhDone', d); save.setStat('mfhLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const say = () => { const L1 = [lwLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(lwLn(GIFT[gift])); K.finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(1600 + k * 200, 0.02, 0.06, 'square', k * 0.06);
      sayTo(T_LW, L1, () => { if (busy === 'end') { busy = null; J = null; } crystalCheck(); }); };
    fade(() => { cleanup(); goRoom(0, -4.6, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; } hidePanel(); hideCard(); ARW.style.display = 'none';
    lawyer.position.set(LW0[0], 0, LW0[1]); lawyer.rotation.y = LW0[2]; [lawyer, boss, ...workers].forEach(f => { f.userData.mood = f === boss ? 'warm' : 'neutral'; }); }
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
  const nearLW = p => nearL(p, 0, -5.4, 1.4), nearOS = p => p.x > 4.2 && p.z < -4.2 && nearL(p, BOSS0[0], BOSS0[1], 3.0), nearShop = p => nearL(p, 8.4, 5.2, 1.4);
  const nearW = p => workers.findIndex(f => nearL(p, f.position.x, f.position.z, 1.6)), atCase = p => nearL(p, 8.4, -2.6, 1.2);
  const bossScene = () => save.stat('mfhAll', false) && !save.stat('mfhScene', false);
  function prompt(P) { if (busy) return null;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; return nearL(p, LLIFT[0], LLIFT[1], 1.6) ? 'LIFT \u00b7 ENGINEERING' : nearL(p, LDESK[0], LDESK[1], 2.4) ? 'TALK \u00b7 FRONT DESK' : null; }
    if (!inRoom(P)) return null; const p = toL(P); if (nearL(p, MAIN[0], MAIN[1], 1.0)) return 'LIFT \u00b7 DOWN TO THE LOBBY'; const r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearLW(p)) return 'TALK \u00b7 CHIEF ENGINEER'; if (nearOS(p)) return bossScene() ? 'TALK \u00b7 DIRECTOR \u00b7 SIT DOWN' : 'TALK \u00b7 DIRECTOR'; if (nearShop(p)) return 'PARTS CANTEEN';
    const w = nearW(p); if (w >= 0) return 'TALK \u00b7 ENGINEER'; if (atCase(p)) return 'TROPHY CASE'; return null; }
  let talkL = save.stat('mfhTalkedL', 0), talkO = save.stat('mfhTalkedO', 0), talkB = 0, talkW = 0;
  const LW_HI = ['Back again. Something is beeping somewhere. Something is always beeping.', 'Wash your paws. Oil gets on the blueprints.', 'The Director asked about you. He never asks about anyone.'];
  function lwMenu() { const first = !talkL; talkL++; save.setStat('mfhTalkedL', talkL);
    sayTo(T_LW, [{ ...lwLn(first ? 'Chief engineer. I keep the fleet flying. Five jobs up here. Do not touch anything red.' : LW_HI[(talkL - 2) % LW_HI.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) },
      { text: 'PICK A JOB', pick: () => sayTo(T_LW, [{ ...lwLn('Which one?'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'WHO CHANGED THE CODE?', pick: () => sayTo(T_LW, [lwLn('One line at the factory, sent from outside. Do the jobs. Then ask the Director.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_LW, [lwLn('Goodbye. Mind the sweeper bot. It does not stop for anyone.')]) }] }]); }
  const OS_HI = ['Back again. The fleet is flying. Some of your work is up there.', 'Every guard bot in Meru checks in here. Even the grumpy one.', 'Floor forty. The view is better from the top. I am not allowed up there.'];
  function osMenu() { const first = !talkO; talkO++; save.setStat('mfhTalkedO', talkO); if (crystalCheck()) return; const ch = [];
    if (bossScene()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneBoss() });
    ch.push({ text: 'THE FACTORY?', pick: () => sayTo(T_OS, [osLn(save.flag('robotFactoryCleared') ? 'You took our factory back. One line of code turned it. Thank you.' : 'Our factory robots turned on us. Down the street. Somebody must take it back.')]) });
    ch.push({ text: 'WHAT DOES THE FLEET DO?', pick: () => sayTo(T_OS, [osLn('We build, fly and fix machine ships and guard bots. For defence. Only defence.')]) });
    if (save.stat('mfhScene', false)) ch.push({ text: 'THE VAX PATCH?', pick: () => sayTo(T_OS, [osLn('Signed VAX. Locks to the families, patches to my robots. No proof. Yet.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_OS, [osLn('Goodbye. Mind the sweeper bot on your way out.')]) });
    sayTo(T_OS, [{ ...osLn(first ? 'Director Cogsworth. Every ship in the sky and every guard bot in Meru. My engineer says you work.' : bossScene() ? 'There you are. Five jobs, five clears. Sit. We should talk.' : OS_HI[(talkO - 2) % OS_HI.length]), choices: ch }]); }
  function sceneBoss() { busy = 'scene'; save.setStat('mfhScene', true);
    const end = () => { busy = null; save.setStat('storyMfScene', true); save.setStat('storyMfPatch', true); toast('STORY \u00b7 THE PATCH WAS SIGNED VAX', 2.6); crystalCheck(); };
    sayTo(T_OS, [osLn('Five jobs. Bots fixed, patrols coded, hulls sealed, drones flown, faults found. Well done.'),
      osLn('The factory robots turned because of one line of code. A patch from outside.'),
      { ...osLn('The patch was signed VAX. VAX sells locks to the families, and patches to my robots.'), choices: [
        { text: 'WHY WOULD VAX DO THAT?', pick: () => sayTo(T_OS, [osLn('Broken robots need new robots. Scared families need new locks. VAX sells both.')], end) },
        { text: 'I WILL FIND OUT.', pick: () => sayTo(T_OS, [osLn('Good. Start on Garden Island. Quietly. Keep the trophy, engineer.')], end) }] }]); }
  const BR = ln('Front Desk', 'MACHINE FLEET HQ'), T_BR = () => ({ key: 'mfDesk', name: 'Front Desk', role: 'MACHINE FLEET HQ', obj: LR.keeper || LG, r: 4 });
  function brMenu() { talkB++; const hi = talkB === 1 ? 'Machine Fleet HQ. Ships and guard bots. Badge, please. Oh, you want work?' : save.stat('mfhAll', false) ? 'Our trophy engineer. The guard bot beeps happily when you pass now.' : 'Back again. Engineering is hiring upstairs.';
    sayTo(T_BR(), [{ ...BR(hi), choices: [{ text: CHOICE_WORK, pick: () => sayTo(T_BR(), [BR('Engineering hires upstairs. Lift on the left. Please do not touch the guard bot.')], () => upLift()) },
      { text: 'WHAT DOES THE FLEET BUILD?', pick: () => sayTo(T_BR(), [BR('Ships, guard bots and drones. The Arena drones too. For defence.')]) },
      { text: 'THE GUARD BOT?', pick: () => sayTo(T_BR(), [BR('It guards. It beeps. It does not like being touched.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const upLift = () => { liftDing(); fade(() => goRoom(0, 7.6, Math.PI)); setTimeout(() => K.chime(), 500); };
  const downLift = () => { liftDing(); fade(() => go(LOX + LLIFT[0] + 0.6, LY, LZ + LLIFT[1], Math.PI / 2)); };
  const W_LINES = ['Rivets, rivets, rivets. I dream in rivets.', 'The sweeper bot ran over my lunch. Twice. Same lunch.', 'Do not tell the Chief, but I named the drones.', 'Patrol code is easy. The crates are the hard part.'];
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true; if (busy) return false;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; if (nearL(p, LLIFT[0], LLIFT[1], 1.6)) { upLift(); return true; } if (nearL(p, LDESK[0], LDESK[1], 2.4)) { tone(1320, 0.05, 0.5); brMenu(); return true; } return false; }
    if (!inRoom(P)) return false; const p = toL(P);
    if (nearL(p, MAIN[0], MAIN[1], 1.0)) { downLift(); return true; }
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; }
    if (nearLW(p)) { tone(1320, 0.05, 0.5); lwMenu(); return true; } if (nearOS(p)) { tone(660, 0.05, 0.6); osMenu(); return true; } if (nearShop(p)) { blip(); shopMenu(); return true; }
    const w = nearW(p); if (w >= 0) { const T = { key: 'mfEng' + w, name: 'Engineer', role: 'MACHINE FLEET', obj: workers[w], r: 4 }; sayTo(T, [{ who: 'Engineer', role: 'MACHINE FLEET', text: W_LINES[(talkW++ + w) % W_LINES.length] }]); return true; }
    if (atCase(p)) { toast(save.stat('mfhAll', false) ? 'THE FLEET TROPHY \u00b7 WON BY YOU' : 'TROPHY CASE \u00b7 EMPTY \u00b7 DO ALL 5 JOBS', 2.4); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, spawned = !/[?&]spawn=mffloor/.test(location.search), spawnT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(0, 7.6, Math.PI); }
    const inR = inRoom(P), inL = inLobby(P); G.visible = inR || busy === 'job'; LG.visible = inL;
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; if (inR) { trophy.visible = !!save.stat('mfhAll', false); crystal.visible = !!save.stat('mfhCore', false); const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); viewM.color.set(n ? '#3a4560' : dusk ? '#e8b48a' : '#ffffff'); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('mf job: ' + (e && e.stack || e)); stop(); }
      if (J && D.card) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || goldR()) + foot(c.next, c.stop) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && GD[J.g].panel && !fading && GD[J.g].draw && J.list && J.ci < J.list.length) GD[J.g].draw();
    if (G.visible) { animDeco(dt, t); crystal.rotation.y += dt * 0.8; for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      const p = toL(P); for (let i = 0; i < 2; i++) { const f = workers[i]; kit.animFox(f, dt, 0, false); if (!busy && nearL(p, f.position.x, f.position.z, 4)) turnTo(f, Math.atan2(p.x - f.position.x, p.z - f.position.z), dt, 3); else { turnTo(f, W0[i][2], dt, 2); armUp(f, 1, 0.5 + Math.sin(t * 6 + i * 2) * 0.2, -1.0); } }
      kit.animFox(boss, dt, 0, false); if (!busy || busy === 'scene') { const dd = Math.hypot(p.x - boss.position.x, p.z - boss.position.z); turnTo(boss, dd < 6 ? Math.atan2(p.x - boss.position.x, p.z - boss.position.z) : BOSS0[2] + Math.sin(t * 0.25) * 0.5, dt, 2); } }
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: inR ? 0 : 99, talking: false, clear: endClear > 0 ? [0, -4.6, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { mffloor: [OX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), up: upLift, down: downLift, scene: sceneBoss, lawyer, boss, workers, benchBot, sweeper, drone,
    _view(p, l, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p)); c.lookAt(toW(...l)); c.updateMatrixWorld(); const v = G.visible; G.visible = true; renderer.render(scene, c); G.visible = v; return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); } };
  window.__mf = API; return API;
}
