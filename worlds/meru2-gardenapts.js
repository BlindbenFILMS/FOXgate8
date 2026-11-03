// MERU 2.0 — s144 GARDEN APARTMENTS [meruGardenApts] (cluster apartments 1 of 4; Ben's picks s143/s144: jobs unique to this building, all 6 ideas ·
// the LIFT goes to a FLAT FLOOR (new room) with FLAT 7 for rent (pay per game week at the manager) · flat = SLEEP (morning + full heal) + STORAGE CHEST + TROPHY SHELF ·
// prizes: GARDEN LIVERY (1st clear, Tailor) · HALF RENT (3 jobs) · GOLDEN WATERING CAN + 60 G + FREE RENT (all 6) + the manager's VAX loan scene · relic ISLAND ORCHID (3 stars on all)).
// LOBBY jobs: POLISH THE GOLD LOBBY · SMILE PRACTICE · VALET THE BOATS · ROOM SERVICE (tray up the lift). FLOOR jobs: FIX THE HOT WATER · WATER THE ROOF GARDEN.
// Made from the worlds/meru2-woodshop.js + meru2-gallery.js kit. Stats prefix gdn.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { ITEM_LABELS } from './meru-shops.js';
export function buildGardenApts({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, clusters, go, heal = () => {}, sleep = () => 1 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'gardenApts'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, OX = LR.ox, RH = 4.4;
  const SR = clusters.addRoom({ key: 'gardenFloor', room: 'meruGardenApts', title: 'GARDEN APARTMENTS \u00b7 FLOOR 7' }, RH); SR.out = LR.out; const FOX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLUE = '#2e86b8', GRN = '#2f7d5a', LEAF = '#4f8a3a', GOLD = '#d7ad52', OAK = '#a77b4f', DKW = '#5a3d26', TERR = '#b5643c', ACC = GRN;
  const rectL = (a, b, c, d, F) => { const o = { f: [(F ? FOX : OX) + a, (F ? FOX : OX) + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }; cols.push(o); return o; }, circL = (x, z, r, F) => cols.push({ c: [(F ? FOX : OX) + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'gardenAptsLobby'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const FG = new THREE.Group(); FG.name = 'gardenAptsFloor'; FG.position.set(FOX, LY, LZ); scene.add(FG); FG.visible = false;
  const toW = (x, y, z, F) => V((F ? FOX : OX) + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ }), toF = P => ({ x: P.x - FOX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('gdnDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2f7d5a', '#f3f2f2', '#1e3d2f'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#d7ad52', '#f3f2f2', '#7a5236'], ['#9fc4e0', '#f3f2f2', '#2e4a6b']];
  // ================= LOBBY extras: GOLD MIRROR + brass rail (left wall, front), VALET podium + key board (right, front), ROOM SERVICE hatch (desk, right) =================
  const R0 = mk(), { box, cyl, sph } = R0;
  box(0.08, 2.4, 2.4, GOLD, -9.82, 1.9, 6.0); box(0.04, 2.1, 2.1, '#cfe2ee', -9.77, 1.9, 6.0); box(0.05, 0.08, 2.6, GOLD, -9.7, 0.95, 6.0); for (const z of [4.8, 7.2]) box(0.06, 0.95, 0.06, GOLD, -9.7, 0.48, z);
  box(0.6, 1.1, 0.5, DKW, 8.2, 0.55, 6.4); box(0.66, 0.06, 0.56, GOLD, 8.2, 1.13, 6.4); box(0.3, 0.02, 0.2, PAPER, 8.2, 1.17, 6.4); rectL(7.9, 8.5, 6.1, 6.7);
  box(0.06, 1.2, 1.6, DKW, 9.82, 2.0, 6.4); for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) { cyl(0.02, 0.02, 0.06, GOLD, 9.74, 2.4 - r * 0.35, 5.8 + q * 0.3, 6, 0, Math.PI / 2); box(0.02, 0.12, 0.06, r === 1 && q === 2 ? RED : GOLD, 9.73, 2.32 - r * 0.35, 5.8 + q * 0.3); }
  box(1.0, 0.06, 0.5, GOLD, 6.6, 0.3, 7.8); for (const dx of [-0.45, 0.45]) box(0.04, 1.6, 0.04, GOLD, 6.6 + dx, 0.95, 7.8); box(0.98, 0.04, 0.04, GOLD, 6.6, 1.75, 7.8); box(0.5, 0.4, 0.3, '#7a1d2a', 6.5, 0.53, 7.8); box(0.3, 0.3, 0.25, BLUE, 6.85, 0.48, 7.8); rectL(6.05, 7.15, 7.5, 8.1);
  box(0.9, 0.9, 0.06, INK, 4.6, 1.55, -9.82); box(0.8, 0.06, 0.4, GOLD, 4.6, 1.05, -9.6); box(0.5, 0.05, 0.3, PAPER, 4.6, 1.1, -9.6); rectL(4.1, 5.1, -9.85, -9.35);
  R0.mesh(G);
  planeT(plate('POLISH THE GOLD', 384, 96, INK, PAPER, GOLD), 1.5, 0.36, -9.83, 3.5, 6.0, Math.PI / 2, G); planeT(plate('VALET \u00b7 BOATS', 384, 96, INK, PAPER, GOLD), 1.5, 0.36, 9.83, 3.1, 6.4, -Math.PI / 2, G);
  planeT(plate('ROOM SERVICE', 384, 96, INK, PAPER, RED), 1.2, 0.3, 4.6, 2.3, -9.8, 0, G); planeT(plate('LIFT \u00b7 FLATS \u00b7 FLOOR 7', 512, 96, GRN, PAPER, GOLD), 1.7, 0.32, -9.74, 3.15, -4, Math.PI / 2, G);
  const LLIFT = [-8.4, -4], HATCH = [4.6, -9.4];
  // ================= FLOOR 7: hall (south), FLAT 7 (north-west, for rent), ROOF GARDEN (north-east, skylight) =================
  const F0 = mk(), fb = F0.box, fc = F0.cyl, fs = F0.sph, WL = '#f1ece0';
  fb(20, 0.1, 20, '#cdb38a', 0, -0.05, 0); fb(20, 0.012, 6.4, '#2f5a46', 0, 0.006, 6.8); for (const s of [-1, 1]) fb(20, 0.014, 0.06, GOLD, 0, 0.008, 6.8 + s * 3.1);
  fb(9.4, 0.02, 13.4, '#8fa36a', 5.3, 0.012, -3.3);   // garden lawn
  fb(20, 0.2, 20, CREAM, 0, RH + 0.1, 0); fb(20, RH, 0.3, WL, 0, RH / 2, -10); for (const s of [-1, 1]) fb(0.3, RH, 20, WL, s * 10, RH / 2, 0); for (const s of [-1, 1]) fb(8.4, RH, 0.3, WL, s * 5.8, RH / 2, 10); fb(3.2, RH - 3.0, 0.3, WL, 0, 3.0 + (RH - 3.0) / 2, 10);
  rectL(-10, 10, -10.3, -9.7, true); rectL(9.8, 10.3, -10, 10, true); rectL(-10.3, -9.8, -10, 10, true); rectL(-10, -1.6, 9.8, 10.3, true); rectL(1.6, 10, 9.8, 10.3, true); rectL(-1.6, 1.6, 9.9, 10.4, true);
  fb(1.8, 2.7, 0.06, STEEL, 0, 1.35, 9.82); fb(0.03, 2.7, 0.07, INK, 0, 1.35, 9.8); fb(2.1, 0.14, 0.12, GOLD, 0, 2.78, 9.8);
  for (const s of [-1, 1]) fb(0.06, 0.24, 20, GRN, s * 9.83, 0.12, 0); fb(20, 0.24, 0.06, GRN, 0, 0.12, -9.83);
  // partition z 3.5: wall x -10..-6, FLAT 7 door -6..-4.6, wall -4.6..2.0 (boiler on its hall face), glass 2.0..10 with the garden doorway 4.2..5.8; flat/garden wall x -0.6
  fb(4, RH, 0.2, WL, -8, RH / 2, 3.5); fb(6.6, RH, 0.2, WL, -1.3, RH / 2, 3.5); fb(1.4, RH - 2.6, 0.2, WL, -5.3, 2.6 + (RH - 2.6) / 2, 3.5); rectL(-10, -6, 3.4, 3.6, true); rectL(-4.6, 2.0, 3.4, 3.6, true);
  for (const [x0, x1] of [[2.0, 4.2], [5.8, 10]]) { fb(x1 - x0, 0.3, 0.16, GOLD, (x0 + x1) / 2, 0.15, 3.5); fb(x1 - x0, 0.1, 0.16, GOLD, (x0 + x1) / 2, 2.8, 3.5); rectL(x0, x1, 3.4, 3.6, true); } for (const x of [2.0, 4.2, 5.8, 7.9, 10]) fb(0.08, 2.8, 0.1, GOLD, x, 1.4, 3.5);
  fb(0.2, RH, 13.5, WL, -0.6, RH / 2, -3.25); rectL(-0.7, -0.5, -10, 3.5, true);
  // tenant doors FLATS 1-6 (south wall ×4, west + east walls)
  const DOORS = [[-7.5, 9.8, 0], [-4, 9.8, 0], [4, 9.8, 0], [7.5, 9.8, 0], [-9.8, 6.5, 1], [9.8, 6.5, -1]];
  DOORS.forEach(([x, z, s], i) => { if (!s) { fb(1.2, 2.4, 0.08, '#2f5a46', x, 1.2, 9.82); fb(1.4, 0.1, 0.1, GOLD, x, 2.45, 9.8); fs(0.05, GOLD, x + 0.42, 1.1, 9.74); } else { fb(0.08, 2.4, 1.2, '#2f5a46', x * 0.998, 1.2, z); fb(0.1, 0.1, 1.4, GOLD, x * 0.998, 2.45, z); fs(0.05, GOLD, x - s * 0.08, 1.1, z + 0.42); } });
  // boiler cupboard on the hall face (x -1.5)
  fb(1.6, 2.2, 0.12, STEEL, -1.5, 1.1, 3.62); fb(1.4, 0.3, 0.06, INK, -1.5, 1.85, 3.7); for (let k = 0; k < 3; k++) { fc(0.04, 0.04, 1.0, k % 2 ? BLUE : RED, -2.0 + k * 0.5, 1.1, 3.72, 8); fc(0.08, 0.08, 0.04, GOLD, -2.0 + k * 0.5, 0.6, 3.75, 10, Math.PI / 2); }
  // FLAT 7: bed (north-west), chest, trophy shelf (west wall), sofa, rug, window
  fb(2.2, 0.5, 2.6, '#f3f2f2', -7.8, 0.25, -7.8); fb(2.3, 0.2, 2.7, DKW, -7.8, 0.1, -7.8); fb(2.3, 1.1, 0.12, DKW, -7.8, 0.75, -9.1); fb(2.0, 0.14, 1.6, GRN, -7.8, 0.55, -7.2); fb(0.7, 0.16, 0.4, PAPER, -8.3, 0.58, -8.6); fb(0.7, 0.16, 0.4, PAPER, -7.3, 0.58, -8.6); rectL(-9.0, -6.6, -9.2, -6.4, true);
  fb(1.1, 0.6, 0.6, OAK, -3.4, 0.3, -9.3); fb(1.14, 0.06, 0.64, GOLD, -3.4, 0.62, -9.3); rectL(-4.0, -2.8, -9.7, -8.9, true);
  for (const y of [1.0, 1.6, 2.2]) fb(0.4, 0.05, 3.0, DKW, -9.6, y, -2.4); fb(0.06, 1.8, 3.1, DKW, -9.8, 1.6, -2.4);
  fb(2.6, 0.45, 0.9, '#7a1d2a', -4.8, 0.23, -1.0); fb(2.6, 0.6, 0.2, '#7a1d2a', -4.8, 0.6, -0.6); rectL(-6.1, -3.5, -1.5, -0.5, true); fc(1.4, 1.4, 0.012, '#d9c08a', -5, 0.012, -4.2, 20);
  fb(3.4, 1.8, 0.06, INK, -5, 2.3, -9.82);
  // ROOF GARDEN: planters along the north + east walls, pergola, bench, fountain, potted palms
  for (const [x, z, w, d] of [[2.6, -9.2, 3.6, 1.0], [7.4, -9.2, 4.6, 1.0], [9.2, -5, 1.0, 5.0], [9.2, 0.6, 1.0, 3.6]]) { fb(w, 0.6, d, TERR, x, 0.3, z); fb(w - 0.1, 0.05, d - 0.1, '#5a3d26', x, 0.62, z); rectL(x - w / 2, x + w / 2, z - d / 2, z + d / 2, true); }
  for (const x of [1.0, 9.0]) for (const z of [-7.2, -1.8]) fb(0.14, 2.9, 0.14, '#f3f2f2', x, 1.45, z); for (let k = 0; k < 6; k++) fb(8.3, 0.08, 0.12, '#f3f2f2', 5, 2.92, -7.2 + k * 1.08); for (const x of [1.0, 9.0]) fb(0.14, 0.14, 5.6, '#f3f2f2', x, 2.86, -4.5);
  fc(0.9, 1.0, 0.45, '#c9c2b0', 5, 0.23, -4.4, 16); fc(0.8, 0.8, 0.05, '#6fb6d8', 5, 0.44, -4.4, 16); fc(0.1, 0.12, 0.9, '#c9c2b0', 5, 0.8, -4.4, 8); fc(0.3, 0.2, 0.12, '#c9c2b0', 5, 1.25, -4.4, 10); circL(5, -4.4, 1.05, true);
  fb(1.8, 0.1, 0.5, OAK, 2.2, 0.48, -1.2); fb(1.8, 0.5, 0.08, OAK, 2.2, 0.75, -0.95); for (const dx of [-0.8, 0.8]) fb(0.08, 0.45, 0.45, DKW, 2.2 + dx, 0.23, -1.2); rectL(1.3, 3.1, -1.5, -0.9, true);
  for (const [x, z] of [[1.0, 2.6], [9.0, 2.6]]) { fc(0.32, 0.26, 0.6, TERR, x, 0.3, z, 10); fc(0.05, 0.06, 1.4, DKW, x, 1.2, z, 6); for (let k = 0; k < 6; k++) fb(0.9, 0.04, 0.2, LEAF, x + Math.cos(k) * 0.35, 1.95, z + Math.sin(k) * 0.35, k, 0, 0.4); circL(x, z, 0.4, true); }
  F0.mesh(FG);
  const skyM = new THREE.MeshBasicMaterial({ color: '#e8f3ff' }); const sky = new THREE.Mesh(new THREE.PlaneGeometry(8, 11), skyM); sky.rotation.x = Math.PI / 2; sky.position.set(5, RH - 0.02, -4); FG.add(sky);
  const viewM = new THREE.MeshBasicMaterial({ color: '#bfe0f2' }); planeT(null, 3.2, 1.6, -5, 2.3, -9.78, 0, FG, viewM);
  planeT(plate('GARDEN APARTMENTS \u00b7 FLOOR 7', 512, 96, GRN, PAPER, GOLD), 2.6, 0.45, 0, 3.4, 9.8, Math.PI, FG); planeT(plate('LIFT \u00b7 LOBBY', 384, 96, INK, PAPER, RED), 1.5, 0.36, 0, 3.05, 9.78, Math.PI, FG);
  planeT(plate('ROOF GARDEN', 384, 96, GRN, PAPER, GOLD), 1.6, 0.38, 5, 3.2, 3.6, 0, FG); planeT(plate('BOILER', 256, 96, INK, PAPER, RED), 0.9, 0.3, -1.5, 2.45, 3.7, 0, FG);
  DOORS.forEach(([x, z, s], i) => planeT(plate('FLAT ' + (i + 1), 256, 96, INK, PAPER, GOLD), 0.7, 0.26, s ? x + s * 0.12 : x, 2.15, s ? z : z - 0.08, s ? s * Math.PI / 2 : Math.PI, FG));
  // flat 7 door (locked until you rent), its sign, chest + trophy cups
  const doorM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.1), new THREE.MeshLambertMaterial({ color: '#2f5a46' })); doorM.position.set(-5.3, 1.3, 3.5); FG.add(doorM); const doorCol = rectL(-6, -4.6, 3.38, 3.62, true);
  const signT = CT(384, 128, () => {}), sign = planeT(signT, 1.2, 0.4, -5.3, 2.75, 3.62, 0, FG);
  const drawSign = () => { const g = signT.userData.c.getContext('2d'), r = rented(); g.fillStyle = r ? GRN : INK; g.fillRect(0, 0, 384, 128); g.fillStyle = GOLD; g.fillRect(0, 0, 12, 128); g.fillStyle = PAPER; g.font = '900 46px Archivo, sans-serif'; g.fillText('FLAT 7', 30, 56); g.font = '900 26px Archivo, sans-serif'; g.fillStyle = r ? YEL : RED; g.fillText(r ? (free() ? 'YOURS \u00b7 RENT FREE' : 'YOURS \u00b7 ' + daysLeft() + ' DAYS LEFT') : 'FOR RENT \u00b7 SEE THE MANAGER', 30, 100); signT.needsUpdate = true; };
  const cupG = new THREE.CylinderGeometry(0.07, 0.045, 0.2, 10), cupM = new THREE.MeshLambertMaterial({ color: GOLD, emissive: '#7a5a1a', emissiveIntensity: 0.3 }), CUPS = [];
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(cupG, cupM); m.position.set(-9.55, 1.13 + Math.floor(i / 4) * 0.6, -3.6 + (i % 4) * 0.8); m.visible = false; FG.add(m); CUPS.push(m); }
  const shelfT = CT(512, 96, () => {}), shelfP = planeT(shelfT, 2.4, 0.45, -9.78, 2.85, -2.4, Math.PI / 2, FG);
  const GOLDS = () => Object.entries((save.data && save.data.items) || {}).filter(([id, n]) => n > 0 && /^gold|^golden|Trophy$/.test(id)).map(([id]) => id);
  const drawShelf = () => { const n = GOLDS().length, g = shelfT.userData.c.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, 512, 96); g.fillStyle = GOLD; g.fillRect(0, 0, 14, 96); g.fillStyle = PAPER; g.font = '900 40px Archivo, sans-serif'; g.fillText('TROPHY SHELF \u00b7 ' + n, 32, 62); shelfT.needsUpdate = true; CUPS.forEach((c, i) => { c.visible = i < n; }); };
  const can = new THREE.Group(); { const S = mk(); S.cyl(0.12, 0.14, 0.22, GOLD, 0, 0.11, 0, 10); S.cyl(0.02, 0.03, 0.3, GOLD, 0.2, 0.2, 0, 6, 0, -0.9); S.box(0.04, 0.16, 0.18, GOLD, -0.13, 0.22, 0); S.mesh(can); } can.position.set(1.8, 1.12, -6.4); G.add(can); can.visible = false;
  const orchid = new THREE.Group(); { const S = mk(); S.cyl(0.07, 0.06, 0.12, PAPER, 0, 0.06, 0, 10); S.cyl(0.01, 0.01, 0.3, LEAF, 0, 0.27, 0, 5); for (let k = 0; k < 5; k++) S.sph(0.045, '#e8a0d8', Math.cos(k * 1.26) * 0.07, 0.42, Math.sin(k * 1.26) * 0.07); S.mesh(orchid); } orchid.position.set(-1.8, 1.12, -6.4); G.add(orchid); orchid.visible = false;
  // ================= FOXES: the Building Manager (replaces the lobby's quiet keeper) + the Island Gardener (roof garden) =================
  const old = LR.keeper; if (old && old.parent) old.parent.remove(old); LR.keeper = null;
  const MG0 = [0, -7.4, 0], GD0 = [7.0, -6.6, -Math.PI / 2];
  const keeper = kit.makeFox({ key: 'gaptManager', name: 'Building Manager', torso: ['#2f7d5a', '#f3f2f2', '#d7ad52'], outfit: 'suit', mood: 'warm' }); keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2]; keeper.userData.noCull = true; keeper.userData.rosterShop = 'GARDEN APARTMENTS'; keeper.userData.rosterRole = 'keeper'; G.add(keeper);
  const gardener = kit.makeFox({ key: 'gaptGardener', name: 'Island Gardener', torso: ['#4f7d3a', '#e2d2b4', '#2a3d20'], outfit: 'vest', mood: 'warm' }); gardener.position.set(GD0[0], 0, GD0[1]); gardener.rotation.y = GD0[2]; gardener.userData.noCull = true; FG.add(gardener); circL(GD0[0], GD0[1], 0.45, true);
  const GAMES = [{ k: 'polish', name: 'Polish the Gold', color: GOLD }, { k: 'smile', name: 'Smile Practice', color: GRN }, { k: 'valet', name: 'Valet the Boats', color: BLUE }, { k: 'room', name: 'Room Service', color: RED },
    { k: 'hot', name: 'Fix the Hot Water', color: RED, F: true }, { k: 'garden', name: 'Water the Roof Garden', color: LEAF, F: true }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { polish: [-8.0, 6.0], smile: [-2.4, -4.6], valet: [7.0, 6.4], room: [4.6, -7.4], hot: [-1.5, 4.7], garden: [5.4, -1.2] };
  const lampsOn = () => { const h = hour(); return h >= 19 || h < 7; };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'gdn', color: GRN, boardTitle: 'Garden Apartments board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -3.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 2.8, z: 8.2, ry: 0 }, hiringLine: 'POLISH \u00b7 SMILE \u00b7 VALET \u00b7 TRAYS \u00b7 PIPES \u00b7 PLANTS', sun: [{ x: 0, z: 7.4, w: 2.4, d: 2.0 }, { x: -3, z: 4, w: 2.4, d: 1.6 }],
    lamps: [[0, 3.6, -6], [0, 3.6, -0.5], [0, 3.6, 5]], lampsOn, browse: [[-5.6, 2.6, -Math.PI / 2], [5.6, 2.6, Math.PI / 2], [-3.0, -2.0, Math.PI]], looks: [LOOKS[1], LOOKS[2], LOOKS[3]], clock: { x: 3.6, y: 3.4, z: 9.83, ry: Math.PI } });
  const KF = shopKit({ THREE, G: FG, scene, kit, save, camera, touch, hour, isMuted, prefix: 'gdn', color: GRN, room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], games: [],
    sun: [{ x: 5, z: -6, w: 3.4, d: 2.2 }, { x: 5, z: -1.4, w: 3.4, d: 2.2 }, { x: -5, z: -8.4, w: 2.4, d: 1.4 }], lamps: [[-5, RH - 0.6, -4], [0, RH - 0.6, 6.8], [-6, RH - 0.6, 6.8], [6, RH - 0.6, 6.8], [5, 2.7, -4.5]], lampsOn, browse: [[3.2, -2.6, Math.PI], [7.0, 1.4, Math.PI / 2]], looks: [LOOKS[3], LOOKS[1]] });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const q of GAMES) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[q.k][0], 0.03, RINGS[q.k][1]); (q.F ? FG : G).add(m); ringMeshes[q.k] = m; }
  const greenM = new THREE.MeshBasicMaterial({ color: '#7cff9b', transparent: true, opacity: 0.8, depthWrite: false }), SPOTS = { bed: [-7.8, -5.8], chest: [-3.4, -8.2], shelf: [-8.6, -2.4] }, spotMeshes = {};
  for (const k in SPOTS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.64, 28), greenM); m.rotation.x = -Math.PI / 2; m.position.set(SPOTS[k][0], 0.03, SPOTS[k][1]); FG.add(m); spotMeshes[k] = m; }
  // ================= KIT: sound, toast, fade, card, panel, arrow =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const liftDing = () => { tone(1046, 0.06, 0.6); tone(1318, 0.05, 0.7, 'sine', 0.18); }, knock = () => { tone(150, 0.08, 0.1, 'square'); tone(150, 0.08, 0.1, 'square', 0.16); };
  let veil = null, fading = false; const fade = fn => { if (fading) { setTimeout(() => fade(fn), 380); return; } fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + ACC + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span>' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><button data-stop style="pointer-events:auto;min-height:44px;min-width:64px;padding:0 12px;text-align:left;background:#f3f2f2;color:#201e1d;border:2px solid #f3f2f2;border-radius:0;font:900 12px Archivo,sans-serif;cursor:pointer">STOP</button></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; const b = card.querySelector('[data-stop]'); if (b) b.onclick = e => { e.stopPropagation(); quit(); }; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL); PANEL.addEventListener('contextmenu', e => e.preventDefault());
  const sideM = () => { const W = innerWidth, H = innerHeight; return H < 520 ? Math.max(8, Math.min(180, (W - 320) / 2)) : 8; };
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = sideM(), w = Math.min(640, W - side * 2); Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + ACC + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const tipBar = t => '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + t + '</div>';
  const showPanel = html => { fitPanel(); PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => quit(); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none' && J && GD[J.g] && GD[J.g].draw) { fitPanel(); GD[J.g].draw(); } });
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
  // ================= state + helpers =================
  let busy = null, J = null, lastP = null, lastFox = null, snapK = false, endClear = 0;
  const addGold = n => { n = Math.max(0, Math.round(n)); if (!J) return 0; J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { if (!J) return; J.miss++; nope(); toast(msg, s); const tip = PANEL.style.display !== 'none' && PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#ec3013'; tip.style.color = '#ffffff'; } };
  const okTip = msg => { const tip = PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#201e1d'; tip.style.color = '#ffd23a'; } };
  const timeBar = (el, f, warn) => { if (!el) return; el.style.width = (clamp(f, 0, 1) * 100).toFixed(1) + '%'; el.style.background = warn ? RED : INK; };
  const ln = (who, role) => text => ({ who, role, text });
  const goRoom = (x, z, yaw, F) => go((F ? FOX : OX) + x, LY, LZ + z, yaw), CX = () => (J && J.F ? FOX : OX);
  const turnTo = (f, want, dt, k = 4) => { let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * k); };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const GD = {};
  const roundTick = (D, dt, T, missMsg, hintSel) => { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / T, J.cueT < 3); if (J.cueT <= 0) { missOne(missMsg); D.next(); } }
    if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const s = hintSel(); if (s) pulse(PANEL.querySelector(s)); } };
  const roundNext = (D, g, T) => { if (!J || J.g !== g) return; J.ci++; J.cueT = T; J.wait = 0.3; J.idle = 0; J.hinted = false; if (J.ci >= J.list.length) { addGold(6); D.draw(); setTimeout(finishGame, 800); return; } D.draw(); };
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : '');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;
  const T_MG = { key: 'gaptManager', name: 'Building Manager', role: 'GARDEN APARTMENTS', obj: keeper, ry: MG0[2], r: 6 }, mgLn = ln('Building Manager', 'GARDEN APARTMENTS');
  const T_GD = { key: 'gaptGardener', name: 'Island Gardener', role: 'ROOF GARDEN', obj: gardener, ry: GD0[2], r: 4 }, gdLn = ln('Island Gardener', 'ROOF GARDEN');
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;min-width:0;display:block;touch-action:none;background:#1e3d2f;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = (t, attr = 'data-go') => '<button ' + attr + ' style="' + BTN + ';flex:1;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const sideBtn = (ic, t, attr) => '<button ' + attr + ' style="' + BTN + ';flex:none;width:92px;display:flex;flex-direction:column;justify-content:center;gap:4px;font-size:16px;background:#ec3013;color:#fff;touch-action:none"><span style="font-size:30px;line-height:1">' + ic + '</span>' + t + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = (down, up) => { const kd = e => { const k = down(e); if (k) { e.preventDefault(); e.stopPropagation(); } }, ku = e => { if (up && up(e)) { e.preventDefault(); e.stopPropagation(); } }; addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  // ---------- 1 POLISH THE GOLD LOBBY: rub the smudges off the mirror, the brass rail, the lift doors; too fast = streaks ----------
  const PLT = 22, PL_R = [['THE GOLD MIRROR', 6], ['THE BRASS RAIL', 7], ['THE LIFT DOORS', 8]];
  GD.polish = { shot: () => [toW(-9.7, 1.6, 6.0), 3.0, 2.6, 0.2, 2.4, Math.PI / 2, 5],
    begin() { goRoom(-8.0, 6.0, -Math.PI / 2); J.list = PL_R.map(([n, k]) => ({ n, sp: [...Array(k)].map(() => ({ x: rnd(0.1, 0.9), y: rnd(0.15, 0.85), r: rnd(0.06, 0.09), hp: 1 })), streaks: [] })); J.ci = 0; J.cueT = PLT; J.wait = 0.4; J.down = null; J.fast = 0; J.cool = 0; J.A = 2; snapK = true; this.draw(); },
    rect(w, h) { return { x0: w * 0.04, y0: h * 0.06, pw: w * 0.92, ph: h * 0.88 }; },
    uv(cv, e) { const r = cv.getBoundingClientRect(), q = this.rect(r.width, r.height); J.A = q.pw / q.ph; return { u: (e.clientX - r.left - q.x0) / q.pw, v: (e.clientY - r.top - q.y0) / q.ph, t: performance.now() / 1000 }; },
    draw() { const c = J.list[J.ci]; showPanel(panelHead((c ? 'POLISH ' + c.n : 'POLISH THE GOLD') + ' \u00b7 ' + nOf(), goldR()) + body(c ? '<canvas data-cv style="width:100%;flex:1;min-height:140px;display:block;touch-action:none"></canvas>' + timeRow : doneMsg('THE LOBBY GLEAMS')) + tipBar('RUB EVERY SMUDGE OFF \u00b7 SMOOTH STROKES, TOO FAST LEAVES STREAKS'));
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = this.uv(cv, e); }, e => { const p = this.uv(cv, e); this.rub(J.down, p); if (J) J.down = p; }); },
    rub(a, b) { const c = J.list[J.ci]; if (!c || J.wait > 0 || !a) return; J.idle = 0; const d = Math.hypot((b.u - a.u) * J.A, b.v - a.v), sp = d / Math.max(0.008, b.t - a.t);
      for (const s of c.sp) if (s.hp > 0 && Math.hypot((b.u - s.x) * J.A, b.v - s.y) < s.r + 0.05) { s.hp -= d * 2.4; if (s.hp <= 0) tone(1800, 0.03, 0.1, 'triangle'); }
      if (sp > 3.6) { J.fast += d; if (J.fast > 0.5 && J.cool <= 0) { J.fast = 0; J.cool = 1; c.streaks.push([b.u, b.v]); missOne('STREAKS \u00b7 SLOWER, SMOOTHER STROKES'); } } else J.fast = Math.max(0, J.fast - d);
      if (c.sp.every(s => s.hp <= 0)) { addGold(4); ding(); okTip(c.n + ' GLEAMS'); J.wait = 0.9; J.down = null; setTimeout(() => this.next(), 700); } },
    next() { J.down = null; J.fast = 0; roundNext(this, 'polish', PLT); },
    tick(dt) { J.cool -= dt; roundTick(this, dt, PLT, 'TOO SLOW \u00b7 A GUEST IS COMING DOWN', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, q = this.rect(w, h); g.fillStyle = '#1e3d2f'; g.fillRect(0, 0, w, h);
      if (J.ci === 0) { g.fillStyle = GOLD; g.fillRect(q.x0, q.y0, q.pw, q.ph); const gr = g.createLinearGradient(q.x0, q.y0, q.x0 + q.pw, q.y0 + q.ph); gr.addColorStop(0, '#e4f1f8'); gr.addColorStop(1, '#a9c6d6'); g.fillStyle = gr; g.fillRect(q.x0 + 14, q.y0 + 14, q.pw - 28, q.ph - 28); }
      else if (J.ci === 1) { g.fillStyle = '#3d2a1c'; g.fillRect(q.x0, q.y0, q.pw, q.ph); for (const yy of [0.3, 0.7]) { const gr = g.createLinearGradient(0, q.y0 + q.ph * (yy - 0.08), 0, q.y0 + q.ph * (yy + 0.08)); gr.addColorStop(0, '#f6dc8f'); gr.addColorStop(1, '#a8812f'); g.fillStyle = gr; g.fillRect(q.x0, q.y0 + q.ph * (yy - 0.08), q.pw, q.ph * 0.16); } for (const xx of [0.1, 0.5, 0.9]) { g.fillStyle = GOLD; g.fillRect(q.x0 + q.pw * xx - 6, q.y0, 12, q.ph); } }
      else { g.fillStyle = '#c0c4c8'; g.fillRect(q.x0, q.y0, q.pw, q.ph); g.fillStyle = INK; g.fillRect(q.x0 + q.pw / 2 - 2, q.y0, 4, q.ph); g.fillStyle = GOLD; g.fillRect(q.x0, q.y0, q.pw, 12); }
      for (const s of c.sp) { if (s.hp <= 0) continue; const cx = q.x0 + s.x * q.pw, cy = q.y0 + s.y * q.ph, r = s.r * q.ph; g.globalAlpha = 0.25 + 0.65 * s.hp; g.fillStyle = '#6b5a48'; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(cx + Math.cos(k * 1.6) * r * 0.5, cy + Math.sin(k * 1.6) * r * 0.5 - r * 0.4, r * 0.28, 0, 7); g.fill(); } g.beginPath(); g.arc(cx, cy + r * 0.25, r * 0.55, 0, 7); g.fill(); g.globalAlpha = 1; }
      g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 3; for (const [u, v] of c.streaks) { const x = q.x0 + u * q.pw, y = q.y0 + v * q.ph; for (const dy of [-8, 0, 8]) { g.beginPath(); g.moveTo(x - 30, y + dy); g.lineTo(x + 30, y + dy - 6); g.stroke(); } }
      g.fillStyle = INK; g.fillRect(q.x0, q.y0 + q.ph - 26, 170, 26); g.fillStyle = YEL; g.font = '900 14px Archivo, sans-serif'; g.fillText('SMUDGES LEFT ' + c.sp.filter(s => s.hp > 0).length, q.x0 + 8, q.y0 + q.ph - 8);
      if (J.down) { const x = q.x0 + J.down.u * q.pw, y = q.y0 + J.down.v * q.ph; g.fillStyle = YEL; g.fillRect(x - 24, y - 14, 48, 28); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x - 24, y - 14, 48, 28); } } };
  // ---------- 2 SMILE PRACTICE: a tenant complains; pick the LOVELY reply (not the honest one, never the rude one) ----------
  const SMT = 12, SMILES = [['The hot water is cold!', 'A brisk shower! Lovely for the fur.', 'Yes, the boiler is broken.', 'Wear a hat.'],
    ['The rent went up again.', 'Only because the building got lovelier!', 'The Peppers like money.', 'Then move.'], ['There is a duck in the lift.', 'A lovely island guest! He rides for free.', 'He has been there a week.', 'Push the duck out.'],
    ['My window will not open.', 'It keeps the lovely sea breeze just right!', 'It is painted shut.', 'Break it.'], ['The garden hose sprayed me.', 'A lovely surprise shower, on the house!', 'It leaks. Everywhere.', 'Stand somewhere else.'],
    ['The doorman was asleep.', 'He was resting his lovely eyes for you.', 'He sleeps most of the day.', 'So? I sleep too.'], ['My neighbour plays the harp at night.', 'Free lovely music! Other buildings pay for that.', 'Every night, yes. For hours.', 'Buy earmuffs.'],
    ['The lift is too slow.', 'More lovely time to enjoy the gold mirrors!', 'It is very old.', 'Take the stairs.'], ['A gull stole my breakfast.', 'Island wildlife! So lovely and so close.', 'They do that daily.', 'Eat faster.'], ['Who owns this building?', 'The lovely Pepper family. Lovely, legitimate people.', 'The Peppers. Nobody knows how.', 'None of your business.']];
  GD.smile = { shot: () => [toW(0, 1.6, -7.2), 2.6, 2.2, 0.12, 2.4, 0, 5],
    begin() { goRoom(-2.4, -4.6, Math.PI * 0.9); J.list = pickN(SMILES, 6).map(([q, lovely, honest, rude]) => ({ q, opts: shuffle([[lovely, 'L'], [honest, 'H'], [rude, 'R']]) })); J.ci = 0; J.cueT = SMT; J.wait = 0.3; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('SMILE PRACTICE \u00b7 ' + nOf(), goldR()) + body(c ? '<div style="border:2px solid #201e1d;background:#fff;padding:10px;font-size:17px;font-weight:900;line-height:1.3"><span style="color:#ec3013">TENANT \u00b7 </span>' + c.q + '</div>' + timeRow
        + '<div style="display:grid;grid-template-columns:' + (wide() ? 'repeat(3,minmax(0,1fr))' : '1fr') + ';gap:6px">' + c.opts.map(([t, k], i) => '<button data-k="' + k + '" data-i="' + i + '" style="' + BTN + '">' + t.toUpperCase() + '</button>').join('') + '</div>' : doneMsg('THE MANAGER BEAMS')) + tipBar('PICK THE LOVELY REPLY \u00b7 HONEST WORRIES THE MANAGER, RUDE IS RUDE'));
      PANEL.querySelectorAll('[data-k]').forEach(b => { b.onclick = () => this.pick(b.dataset.k, b); }); },
    pick(k, el) { if (J.wait > 0) return; J.idle = 0; if (k === 'L') { addGold(3); ding(); el.style.background = '#201e1d'; el.style.color = '#ffd23a'; okTip('LOVELY! THE TENANT SMILES'); J.wait = 0.8; setTimeout(() => this.next(), 700); }
      else { missOne(k === 'H' ? 'TOO HONEST \u00b7 THE MANAGER GOES PALE' : 'RUDE \u00b7 THE TENANT STORMS OFF'); shake(el); el.disabled = true; el.style.opacity = '0.4'; } },
    next() { roundNext(this, 'smile', SMT); },
    tick(dt) { roundTick(this, dt, SMT, 'TOO SLOW \u00b7 SAY SOMETHING LOVELY', () => '[data-k="L"]'); } };
  // ---------- 3 VALET THE BOATS: steer each guest's boat into its numbered slip on the island jetty ----------
  const VLN = 6, SLIPS = 5, GUESTS = ['LADY ROSE', 'SIR HUGO', 'MR. VAX', 'THE DUCHESS', 'CAPTAIN CORAL', 'MADAME LUXE', 'DR. ORBIT', 'OLD SALT'];
  GD.valet = { shot: () => [toW(8.2, 1.3, 6.4), 2.6, 2.4, 0.3, 2.4, -Math.PI / 2, 5],
    begin() { goRoom(7.0, 6.4, Math.PI / 2); J.list = pickN(GUESTS, VLN).map((n, i) => ({ n, slip: 1 + Math.floor(Math.random() * SLIPS), sp: 0.13 + i * 0.022, x: 0.5 })); J.ci = 0; J.wait = 0.6; J.y = 0; J.tx = 0.5; J.dir = 0; J.res = null; snapK = true;
      keyAct(e => { if (e.code === 'ArrowLeft' || e.code === 'KeyA') { J.dir = -1; return true; } if (e.code === 'ArrowRight' || e.code === 'KeyD') { J.dir = 1; return true; } return false; }, e => { if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) { J.dir = 0; return true; } return false; }); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('VALET THE BOATS \u00b7 ' + nOf(), goldR()) + body(c ? '<div style="font-size:15px;font-weight:900">' + c.n + ' \u00b7 <span style="color:#ec3013">SLIP ' + c.slip + '</span></div>' + (wide() ? '<div style="flex:1;min-height:0;display:flex;gap:8px">' + sideBtn('\u25c0', 'LEFT', 'data-l') + cvTag('4/3') + sideBtn('\u25b6', 'RIGHT', 'data-r') + '</div>' : cvTag('4/5') + '<div style="display:flex;gap:8px;flex:none">' + bigBtn('\u25c0 LEFT', 'data-l') + bigBtn('RIGHT \u25b6', 'data-r') + '</div>') : doneMsg('EVERY BOAT TIED UP')) + tipBar('STEER INTO THE RED SLIP \u00b7 DRAG ON THE WATER OR HOLD LEFT / RIGHT'));
      const hold = (s, d) => { const b = PANEL.querySelector(s); if (!b) return; b.onpointerdown = e => { e.preventDefault(); J.dir = d; J.idle = 0; J.drag = false; }; b.onpointerup = b.onpointercancel = b.onpointerleave = () => { if (J.dir === d) J.dir = 0; }; };
      hold('[data-l]', -1); hold('[data-r]', 1); const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = true; J.drag = true; this.aim(cv, e); }, e => this.aim(cv, e)); },
    aim(cv, e) { const r = cv.getBoundingClientRect(); J.tx = clamp((e.clientX - r.left) / r.width, 0.05, 0.95); J.idle = 0; },
    slipX: i => 0.1 + (i - 0.5) * 0.8 / SLIPS,
    tick(dt) { const c = J.list[J.ci]; if (!c) return; J.idle = (J.idle || 0) + dt;
      if (J.wait > 0) { J.wait -= dt; if (J.wait <= 0 && J.res) { J.res = null; J.ci++; J.y = 0; J.tx = 0.5; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 700); return; } J.list[J.ci].x = 0.5; this.draw(); } }
      else { if (J.dir) J.tx = clamp(c.x + J.dir * 0.5 * dt * 3, 0.05, 0.95); else if (!J.drag) J.tx = c.x; c.x += (J.tx - c.x) * Math.min(1, dt * 4); c.x += Math.sin(performance.now() / 700) * 0.0009; J.y += c.sp * dt;
        if (J.y >= 0.82) { const sx = this.slipX(c.slip), hw = 0.8 / SLIPS / 2, k = Math.round((c.x - 0.1) / (0.8 / SLIPS) + 0.5), post = Math.abs(((c.x - 0.1) / (0.8 / SLIPS)) - Math.round((c.x - 0.1) / (0.8 / SLIPS))) < 0.12;
          if (Math.abs(c.x - sx) < hw * 0.62) { addGold(4); ding(); okTip('TIED UP IN SLIP ' + c.slip + ' \u00b7 ' + c.n + ' TIPS'); J.res = 'ok'; } else if (post) { tone(120, 0.08, 0.3, 'sawtooth'); missOne('BUMP \u00b7 YOU HIT A POST'); J.res = 'bump'; } else { missOne('WRONG SLIP \u00b7 THAT WAS SLIP ' + clamp(k, 1, SLIPS)); J.res = 'bad'; }
          J.wait = 1.0; J.drag = false; } }
      if (J.idle > 3 && !J.hinted) { J.hinted = true; pulse(PANEL.querySelector(c.x < this.slipX(c.slip) ? '[data-r]' : '[data-l]')); } this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f; g.fillStyle = '#2e6f96'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2; const t = performance.now() / 600;
      for (let k = 0; k < 8; k++) { const y = ((k * 0.13 + t * 0.03) % 1) * h; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 20) g.lineTo(x, y + Math.sin(x * 0.04 + k) * 3); g.stroke(); }
      g.fillStyle = '#a77b4f'; g.fillRect(0, 0, w, h * 0.08); const sw = 0.8 / SLIPS * w;
      for (let i = 0; i <= SLIPS; i++) { const x = (0.1 + i * 0.8 / SLIPS) * w; g.fillStyle = '#5a3d26'; g.fillRect(x - 4, 0, 8, h * 0.2); }
      for (let i = 1; i <= SLIPS; i++) { const x = this.slipX(i) * w; g.fillStyle = i === c.slip ? RED : PAPER; g.fillRect(x - sw * 0.3, h * 0.085, sw * 0.6, h * 0.07); g.fillStyle = i === c.slip ? '#fff' : INK; g.font = '900 ' + Math.round(h * 0.06) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText(String(i), x, h * 0.145); }
      g.textAlign = 'left'; const bx = c.x * w, by = h * (0.95 - J.y * 0.92), bw = sw * 0.42, bh = h * 0.16;
      g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(bx, by - bh / 2); g.lineTo(bx + bw / 2, by - bh * 0.2); g.lineTo(bx + bw / 2, by + bh / 2); g.lineTo(bx - bw / 2, by + bh / 2); g.lineTo(bx - bw / 2, by - bh * 0.2); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.fillStyle = GOLD; g.fillRect(bx - bw * 0.28, by - bh * 0.05, bw * 0.56, bh * 0.3); g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(bx - bw * 0.3, by + bh / 2, bw * 0.6, 6);
      if (J.res) { g.fillStyle = J.res === 'ok' ? YEL : RED; g.font = '900 ' + Math.round(h * 0.07) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText(J.res === 'ok' ? 'LOVELY PARKING' : J.res === 'bump' ? 'BUMP!' : 'WRONG SLIP', w / 2, h * 0.55); g.textAlign = 'left'; } } };
  // ---------- 4 ROOM SERVICE (walk): take the tray at the hatch, lift up to FLOOR 7, knock on the right flat before it goes cold; 3 trays ----------
  const RSN = 3, COLD = 55, MENU = ['HOT TEA + SCONES', 'LOBSTER SOUP', 'COCOA FOR TWO', 'EGGS ON TOAST', 'FRESH CROISSANTS', 'MINT TEA'];
  const tray = new THREE.Group(); { const S = mk(); S.box(0.5, 0.03, 0.34, GOLD, 0, 0, 0); S.cyl(0.14, 0.14, 0.04, PAPER, -0.08, 0.035, 0, 12); S.cyl(0.06, 0.05, 0.1, PAPER, 0.15, 0.07, 0.05, 10); S.sph(0.13, '#e8e4dc', -0.08, 0.06, 0); S.mesh(tray); } tray.visible = false; scene.add(tray);
  const steamM = new THREE.PointsMaterial({ color: '#ffffff', size: 0.12, transparent: true, opacity: 0.6, depthWrite: false }), steamG = new THREE.BufferGeometry(); steamG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3)); const steam = new THREE.Points(steamG, steamM); steam.frustumCulled = false; tray.add(steam);
  GD.room = { errand: true,
    begin() { goRoom(4.6, -8.0, Math.PI); J.list = [...Array(RSN)].map(() => ({ item: pick1(MENU), flat: 1 + Math.floor(Math.random() * 6) })); J.ci = 0; J.carry = null; J.t0 = 0; this.take(); },
    take() { const c = J.list[J.ci]; if (!c) return; J.carry = { t: COLD }; tray.visible = true; ding(); toast('TRAY \u00b7 ' + c.item + ' \u00b7 FLAT ' + c.flat, 2.4); },
    goal() { const c = J.list[J.ci]; if (!c) return null; const onF = inFloor(lastP); if (J.carry) { if (!onF) return [toW(LLIFT[0] + 0.6, 1.2, LLIFT[1]), 'LIFT \u00b7 UP']; const d = DOORS[c.flat - 1]; return [toW(d[0], 1.4, d[1], true), 'FLAT ' + c.flat]; }
      if (onF) return [toW(0, 1.2, 9.2, true), 'LIFT \u00b7 DOWN']; return [toW(HATCH[0], 1.2, HATCH[1]), 'NEXT TRAY']; },
    deliver(i) { const c = J.list[J.ci]; if (!c || !J.carry) return; knock(); if (i + 1 !== c.flat) { missOne('WRONG DOOR \u00b7 THIS IS FLAT ' + (i + 1)); return; }
      const hot = J.carry.t > 0; if (hot) { addGold(5); toast('DELIVERED HOT \u00b7 FLAT ' + c.flat + ' SAYS LOVELY', 2.2); } else { missOne('IT WENT COLD \u00b7 FLAT ' + c.flat + ' SIGHS'); }
      J.carry = null; tray.visible = false; J.ci++; if (J.ci >= J.list.length) { addGold(6); if (J.t0 < 150) addGold(10); setTimeout(finishGame, 700); } },
    tick(dt) { J.t0 += dt; if (J.carry) { J.carry.t -= dt; const P = lastP; if (P) { const yaw = P.yaw || 0; tray.position.set(P.x + Math.sin(yaw) * 0.5, (P.y || 0) + 1.25, P.z + Math.cos(yaw) * 0.5); tray.rotation.y = yaw; }
        const a = steamG.attributes.position, tt = performance.now() / 1000; for (let i = 0; i < 6; i++) { const ph = (tt * 0.6 + i / 6) % 1; a.setXYZ(i, Math.sin(i * 2.1) * 0.06, 0.1 + ph * 0.5, Math.cos(i * 1.7) * 0.05); } a.needsUpdate = true; steamM.opacity = J.carry.t > 0 ? 0.6 : 0; }
      const gl = this.goal(); arrowTo(gl && gl[0], gl ? gl[1] : ''); const c = J.list[J.ci];
      setCard('rs' + J.ci + (J.carry ? 'c' : 'n') + Math.ceil(J.carry ? J.carry.t : 0), head('ROOM SERVICE \u00b7 ' + Math.min(J.ci + 1, RSN) + ' / ' + RSN, goldR()) + '<div style="padding:8px 10px;font-size:13px;font-weight:900">' + (c ? (J.carry ? c.item + '<br><span style="color:#ec3013">FLAT ' + c.flat + ' \u00b7 FLOOR 7</span><div style="height:6px;background:#e7e4dc;margin-top:6px"><div style="height:6px;width:' + clamp(J.carry.t / COLD * 100, 0, 100).toFixed(0) + '%;background:' + (J.carry.t < 15 ? RED : '#e07a1f') + '"></div></div>' + (J.carry.t > 0 ? 'HOT \u00b7 ' + Math.ceil(J.carry.t) + ' S' : 'COLD') : 'BACK TO THE HATCH FOR THE NEXT TRAY') : 'ALL DELIVERED') + '</div>' + foot(J.carry ? 'LIFT \u00b7 THEN KNOCK (E)' : 'HATCH BY THE DESK (E)')); } };
  // ---------- 5 FIX THE HOT WATER: the red (hot) + blue (cold) pipes run crossed to some flats; tap a crossed flat to swap them ----------
  const HTT = 14, HTN = 4;
  GD.hot = { F: true, shot: () => [toW(-1.5, 1.2, 3.6, true), 2.2, 2.4, 0.15, 2.2, 0, 5],
    begin() { goRoom(-1.5, 4.7, Math.PI, true); J.list = [...Array(HTN)].map((_, r) => { const n = 2 + (r > 1 ? 1 : 0), x = new Set(pickN([0, 1, 2, 3, 4, 5], n)); return { rows: [0, 1, 2, 3, 4, 5].map(i => x.has(i)) }; }); J.ci = 0; J.cueT = HTT; J.wait = 0.3; snapK = true; this.draw(); },
    pipe(cr) { const a = cr ? 'M4 10 C30 10 40 34 76 34' : 'M4 10 H76', b = cr ? 'M4 34 C30 34 40 10 76 10' : 'M4 34 H76';
      return '<svg viewBox="0 0 80 44" style="width:' + (wide() ? 60 : 80) + 'px;height:44px;flex:none" aria-hidden="true"><path d="' + a + '" stroke="#ec3013" stroke-width="6" fill="none"/><path d="' + b + '" stroke="#2e86b8" stroke-width="6" fill="none"/></svg>'; },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('FIX THE HOT WATER \u00b7 ROUND ' + nOf(), goldR()) + body(c ? '<div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:2px 12px;font-size:11px;font-weight:900;white-space:nowrap"><span>BOILER \u00b7 <span style="color:#ec3013">HOT</span> / <span style="color:#2e86b8">COLD</span></span><span>TAPS \u00b7 <span style="color:#ec3013">H</span> / <span style="color:#2e86b8">C</span></span></div>' + timeRow
        + '<div style="display:grid;grid-template-columns:' + (wide() ? 'repeat(2,minmax(0,1fr))' : '1fr') + ';gap:6px">' + c.rows.map((cr, i) => '<button data-r="' + i + '" style="' + BTN + ';display:flex;align-items:center;gap:8px;min-height:56px">' + this.pipe(cr) + '<span>FLAT ' + (i + 1) + (cr ? '<br><span style="font-size:11px;color:#ec3013;white-space:nowrap">HOT TAP RUNS COLD</span>' : '<br><span style="font-size:11px;color:#2f7d5a">OK</span>') + '</span></button>').join('') + '</div>' : doneMsg('HOT IS HOT, COLD IS COLD')) + tipBar('TAP A FLAT WITH CROSSED PIPES TO SWAP THEM \u00b7 LEAVE THE STRAIGHT ONES'));
      PANEL.querySelectorAll('[data-r]').forEach(b => { b.onclick = () => this.tap(+b.dataset.r, b); }); },
    tap(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0;
      if (!c.rows[i]) { missOne('FLAT ' + (i + 1) + ' WAS FINE \u00b7 NOW ITS HOT TAP RUNS COLD'); c.rows[i] = true; this.draw(); return; }
      c.rows[i] = false; tone(500, 0.05, 0.15, 'triangle'); tone(700, 0.04, 0.15, 'triangle', 0.08);
      if (c.rows.every(x => !x)) { addGold(4); ding(); this.draw(); okTip('PIPES STRAIGHT \u00b7 STEAM IN EVERY SHOWER'); J.wait = 0.9; setTimeout(() => this.next(), 800); return; } this.draw(); },
    next() { roundNext(this, 'hot', HTT); },
    tick(dt) { roundTick(this, dt, HTT, 'TOO SLOW \u00b7 A TENANT IS SHIVERING', () => { const c = J.list[J.ci]; const i = c.rows.findIndex(Boolean); return i >= 0 ? '[data-r="' + i + '"]' : null; }); } };
  // ---------- 6 WATER THE ROOF GARDEN: hold to pour, let go with the soil in the green band; too much drowns it ----------
  const WGT = 12, PLANTS = [['ISLAND ORCHID', 0.22, 0.36, '#e8a0d8'], ['PEPPER PALM', 0.66, 0.84, LEAF], ['GOLDEN ROSE', 0.44, 0.6, GOLD], ['SEA LILY', 0.55, 0.7, '#9fc4e0'], ['FIRE FERN', 0.3, 0.46, '#e07a1f'], ['VAX VIOLET', 0.48, 0.6, '#7a5ab8'], ['NIGHT JASMINE', 0.36, 0.5, PAPER]];
  GD.garden = { F: true, shot: () => [toW(7.4, 0.8, -8.6, true), 3.6, 2.2, 0.5, 2.6, 0, 6],
    begin() { goRoom(5.4, -1.2, Math.PI, true); J.list = pickN(PLANTS, 6).map(([n, lo, hi, col]) => ({ n, lo, hi, col, v: 0, done: false, soggy: false })); J.ci = 0; J.cueT = WGT; J.wait = 0.3; J.pour = false; snapK = true;
      keyAct(e => { if (e.code === 'Space' || e.code === 'Enter') { if (!e.repeat) this.down(); return true; } return false; }, e => { if (e.code === 'Space' || e.code === 'Enter') { this.up(); return true; } return false; }); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead((c ? c.n : 'THE ROOF GARDEN') + ' \u00b7 ' + nOf(), goldR()) + body(c ? (wide() ? timeRow + '<div style="flex:1;min-height:0;display:flex;gap:8px">' + cvTag('4/3') + '<div style="flex:none;width:150px;display:flex">' + bigBtn('HOLD TO POUR') + '</div></div>' : cvTag('1/1') + timeRow + bigBtn('HOLD TO POUR')) : doneMsg('THE GARDEN DRINKS')) + tipBar('HOLD TO POUR \u00b7 LET GO WITH THE SOIL IN THE GREEN'));
      const b = PANEL.querySelector('[data-go]'), cv = PANEL.querySelector('[data-cv]'); for (const el of [b, cv]) if (el) { el.onpointerdown = e => { e.preventDefault(); this.down(); }; el.onpointerup = el.onpointercancel = el.onpointerleave = () => this.up(); } },
    down() { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.done) return; J.pour = true; J.idle = 0; },
    up() { const c = J.list[J.ci]; if (!J.pour || !c) return; J.pour = false; if (c.done) return;
      if (c.v >= c.lo && c.v <= c.hi) { c.done = true; addGold(4); ding(); okTip(c.n + ' \u00b7 JUST RIGHT'); J.wait = 0.9; setTimeout(() => this.next(), 800); } else if (c.v < c.lo) okTip('MORE WATER \u00b7 HOLD AGAIN'); },
    next() { J.pour = false; roundNext(this, 'garden', WGT); },
    tick(dt) { const c = J.list[J.ci];
      if (c && J.pour && !c.done) { c.v += dt * 0.32; if (c.v % 0.1 < dt * 0.32) tone(600 + c.v * 600, 0.015, 0.06, 'triangle'); if (c.v > c.hi + 0.02) { c.done = true; c.soggy = true; J.pour = false; missOne('TOO MUCH \u00b7 ' + c.n + ' IS SOGGY'); J.wait = 1.0; setTimeout(() => this.next(), 900); } }
      roundTick(this, dt, WGT, 'TOO SLOW \u00b7 THE SUN DRIED IT OUT', () => '[data-go]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, t = performance.now() / 1000; g.fillStyle = '#cfe8f5'; g.fillRect(0, 0, w, h);
      const px = w * 0.38, py = h * 0.78; g.fillStyle = TERR; g.beginPath(); g.moveTo(px - w * 0.16, py - h * 0.12); g.lineTo(px + w * 0.16, py - h * 0.12); g.lineTo(px + w * 0.12, py + h * 0.14); g.lineTo(px - w * 0.12, py + h * 0.14); g.closePath(); g.fill();
      g.fillStyle = c.v > 0.05 ? '#3d2a1c' : '#8a6a48'; g.fillRect(px - w * 0.15, py - h * 0.14, w * 0.3, h * 0.04);
      const droop = c.soggy ? 0.6 : c.v < c.lo ? 0.25 * (1 - c.v / c.lo) : 0; g.strokeStyle = LEAF; g.lineWidth = 5; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(px + k * 8, py - h * 0.14); g.quadraticCurveTo(px + k * 22, py - h * (0.4 - droop * 0.2), px + k * (34 + droop * 30), py - h * (0.46 - droop * 0.35)); g.stroke(); }
      g.fillStyle = c.col; for (let k = -1; k <= 1; k++) { g.beginPath(); g.arc(px + k * 40, py - h * (0.52 - droop * 0.3), 13, 0, 7); g.fill(); }
      if (J.pour) { g.fillStyle = BLUE; g.save(); g.translate(px + w * 0.2, h * 0.18); g.rotate(-0.5); g.fillRect(-30, -18, 60, 36); g.fillRect(28, -6, 36, 8); g.restore(); g.fillStyle = 'rgba(46,134,184,.7)'; for (let k = 0; k < 8; k++) g.fillRect(px + w * 0.05 + Math.sin(t * 20 + k) * 6, h * 0.24 + ((t * 2 + k / 8) % 1) * h * 0.36, 4, 10); }
      const mx = w * 0.78, mw = w * 0.1, m0 = h * 0.08, mh = h * 0.84, Y = v => m0 + mh * (1 - v); g.fillStyle = PAPER; g.fillRect(mx, m0, mw, mh); g.fillStyle = '#7cff9b'; g.fillRect(mx, Y(c.hi), mw, mh * (c.hi - c.lo)); g.fillStyle = '#3d2a1c'; g.fillRect(mx + mw * 0.2, Y(c.v), mw * 0.6, mh * c.v); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(mx, m0, mw, mh);
      g.fillStyle = INK; g.font = '900 ' + Math.round(Math.max(12, h * 0.055)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(c.n, 10, h * 0.09); } };
  // ================= PRIZES (building-themed) =================
  const SUIT = { outfit: 'suit', torso: ['#f3f2f2', '#2f7d5a', '#d7ad52'], name: 'GARDEN LIVERY' };
  const GIFT = { suit: 'A GARDEN LIVERY, green and gold. Lovely on you. The Tailor has a copy.', half: 'Three jobs! Your rent on FLAT 7 is half price now. Lovely.', trophy: 'All six! The GOLDEN WATERING CAN and 60 gold. And FLAT 7 is rent free. A word?' };
  function giveGift() { save.setStat('gdnClears', save.stat('gdnClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('gdnSuit', false)) { save.setStat('gdnSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 3 && !save.stat('gdnHalf', false)) { save.setStat('gdnHalf', true); return 'half'; }
    if (nd >= GAMES.length && !save.stat('gdnAll', false)) { save.setStat('gdnAll', true); save.give('goldCan'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function orchidCheck(then) { if (!allThree() || save.stat('gdnOrchid', false)) { then && then(); return false; } save.setStat('gdnOrchid', true); save.addRelic('islandOrchid'); orchid.visible = true; ding();
    sayTo(T_MG, [mgLn('Three stars on every job! Take THE ISLAND ORCHID. It only flowers for lovely people.')], () => { toast('RELIC \u00b7 THE ISLAND ORCHID', 2.6); then && then(); }); return true; }
  // ================= FLAT 7: rent per game week, sleep, chest, trophy shelf =================
  const free = () => !!save.stat('gdnAll', false), price = () => (free() ? 0 : save.stat('gdnHalf', false) ? 20 : 40);
  const rented = () => free() || save.stat('gdnRentTo', 0) >= today(), daysLeft = () => Math.max(0, save.stat('gdnRentTo', 0) - today() + 1);
  function rentFlat() { const p = price(); if (p > 0 && !save.spend(p)) { sayTo(T_MG, [mgLn(p + ' gold a week. Come back with a little more. Lovely to see you anyway.')]); return; }
    coin(); const from = Math.max(today(), save.stat('gdnRentTo', 0) + 1); save.setStat('gdnRentTo', from + 6); if (!save.count('gaptKey')) save.give('gaptKey'); drawSign();
    sayTo(T_MG, [mgLn((save.stat('gdnRented', 0) ? 'Renewed! Seven more lovely days. ' : 'FLAT 7 is yours for the week. Here is the key. ') + 'Lift on the left, floor seven.')]); save.setStat('gdnRented', save.stat('gdnRented', 0) + 1); }
  function flatMenu() { const r = rented(), ch = [];
    if (free()) ch.push({ text: 'THANK YOU FOR THE FREE FLAT', pick: () => sayTo(T_MG, [mgLn('You earned it. Sleep well. Water the orchids.')]) });
    else ch.push({ text: (r ? 'RENEW \u00b7 +7 DAYS \u00b7 ' : 'RENT FLAT 7 \u00b7 ') + price() + ' G A WEEK', pick: rentFlat });
    ch.push({ text: 'WHAT DOES THE FLAT HAVE?', pick: () => sayTo(T_MG, [mgLn('A bed for a lovely night, a chest for your things, and a shelf for your trophies.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(T_MG, [{ ...mgLn(free() ? 'FLAT 7 is yours, rent free, for good.' : r ? 'FLAT 7 is yours for ' + daysLeft() + ' more day' + (daysLeft() === 1 ? '' : 's') + '. Renew any time.' : 'FLAT 7, floor seven. Garden views. ' + price() + ' gold a week.'), choices: ch }]); }
  const lab = id => (ITEM_LABELS[id] || String(id).replace(/([A-Z])/g, ' $1')).toUpperCase(), chestIn = () => save.stat('gdnChest', null) || {};
  const T_CH = () => ({ key: 'gaptChest', name: 'YOUR CHEST', role: 'FLAT 7', obj: FG, r: 3 }), chLn = ln('YOUR CHEST', 'FLAT 7');
  function chest() { const bag = Object.entries((save.data && save.data.items) || {}).filter(q => q[1] > 0 && q[0] !== 'gaptKey').sort((a, b) => b[1] - a[1]).slice(0, 5), box2 = Object.entries(chestIn()).filter(q => q[1] > 0).slice(0, 5);
    const ch = [...bag.map(([id, n]) => ({ text: 'STORE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { if (!save.take(id, n)) return; const L = { ...chestIn() }; L[id] = (L[id] || 0) + n; save.setStat('gdnChest', L); tone(330, 0.05, 0.2); toast('STORED \u00b7 ' + lab(id), 2); drawShelf(); } })),
      ...box2.map(([id, n]) => ({ text: 'TAKE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { const L = { ...chestIn() }; delete L[id]; save.setStat('gdnChest', L); save.give(id, n); tone(440, 0.05, 0.2); toast('TAKEN \u00b7 ' + lab(id), 2); drawShelf(); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(T_CH(), [{ ...chLn(box2.length ? 'Your chest. ' + box2.length + ' kind' + (box2.length > 1 ? 's' : '') + ' of thing inside.' : 'Your chest. Empty. Store what you like.'), choices: ch }]); }
  function sleepHere() { fade(() => { const d = sleep(); heal(9999); window.__m2yawn = 1;   /* s627: wake up with a yawn + stretch */ goRoom(-7.8, -5.6, Math.PI, true); toast('GOOD MORNING \u00b7 DAY ' + (d || today()) + ' \u00b7 FULL HEALTH', 3); drawSign(); }); }
  function useItem(id) { if (id === 'goldCan' && save.count('goldCan')) { toast('THE GOLDEN WATERING CAN \u00b7 SIX FOR SIX AT GARDEN APARTMENTS', 2.4); return true; }
    if (id === 'gaptKey' && save.count('gaptKey')) { toast(rented() ? 'FLAT 7 KEY \u00b7 ' + (free() ? 'RENT FREE' : daysLeft() + ' DAYS LEFT') : 'FLAT 7 KEY \u00b7 THE RENT RAN OUT \u00b7 SEE THE MANAGER', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { polish: 'Polish the gold! Rub every smudge off. Smooth strokes, or it streaks.', smile: 'Smile practice. A tenant complains. You pick the lovely reply. Never the honest one.',
    valet: 'Guests arrive by boat. Steer each one into its slip on the jetty. Lovely and gentle.', room: 'Room service! Take the tray, lift to floor seven, knock on the right flat. Keep it hot.',
    hot: 'The hot water is cold again. Find the crossed pipes in the boiler and swap them.', garden: 'Water the roof garden. Hold to pour, let go in the green. Too much drowns them.' };
  const DONE = { polish: 'Gleaming! I can see my lovely smile in it.', smile: 'Lovely, lovely, lovely. You are a natural.', valet: 'Every boat tied up. Not one scratch. Lovely.', room: 'Every tray delivered. The tenants are almost happy.', hot: 'Hot is hot again. Nobody shivered. Well, almost nobody.', garden: 'The garden drinks. Even the orchid looks pleased.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const inLobby = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inFloor = P => !!P && Math.abs(P.x - FOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const T = inFloor(lastP) && GN[g].F ? T_GD : T_MG; sayTo(T, [(T === T_GD ? gdLn : mgLn)(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('gdnVisits', save.stat('gdnVisits', 0) + 1); J = { g, miss: 0, gold: 0, t: 0, F: !!GN[g].F }; busy = GD[g].errand ? 'errand' : 'job'; ding(); fade(() => GD[g].begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, F = J.F, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('gdnDone', d); save.setStat('gdnLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none'; tray.visible = false;
    const say = () => { const L1 = [mgLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(mgLn(GIFT[gift])); K.finish(g, stars, gold, first); drawSign(); for (let k = 0; k < 4; k++) tone(1200 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T_MG, L1, () => { if (busy === 'end') { busy = null; J = null; } orchidCheck(); }); };
    fade(() => { cleanup(); goRoom(0, -4.4, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; } hidePanel(); hideCard(); ARW.style.display = 'none'; tray.visible = false; keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2]; }
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
    camCur.pos.set(clamp(camCur.pos.x, CX() - 9.5, CX() + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.3), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= talk + prompt =================
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = (p, F) => GAMES.find(q => !!q.F === !!F && nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearMg = p => nearL(p, 0, -5, 2.4), atLiftL = p => nearL(p, LLIFT[0], LLIFT[1], 1.6), atLiftF = p => nearL(p, 0, 9.0, 1.2), nearGd = p => nearL(p, GD0[0] - 1.2, GD0[1], 1.6), atHatch = p => nearL(p, HATCH[0], HATCH[1] + 1.2, 1.4);
  const doorAt = p => DOORS.findIndex(([x, z, s]) => nearL(p, s ? x + s * 1.0 : x, s ? z : z - 1.0, 1.1)), atFlatDoor = p => nearL(p, -5.3, 4.6, 1.1), spotAt = p => Object.keys(SPOTS).find(k => nearL(p, SPOTS[k][0], SPOTS[k][1], 0.9));
  const sceneReady = () => save.stat('gdnAll', false) && !save.stat('gdnScene', false);
  function prompt(P) {
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) return 'LIFT \u00b7 UP TO FLOOR 7'; if (!J.carry && atHatch(p)) return 'HATCH \u00b7 TAKE THE NEXT TRAY'; return null; }
      if (inFloor(P)) { const p = toF(P); if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY'; const d = doorAt(p); if (d >= 0 && J.carry) return 'KNOCK \u00b7 FLAT ' + (d + 1); } return null; }
    if (busy) return null;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftL(p)) return 'LIFT \u00b7 FLOOR 7 \u00b7 FLATS + ROOF GARDEN';
      if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearMg(p)) return sceneReady() ? 'TALK \u00b7 BUILDING MANAGER \u00b7 A WORD' : 'TALK \u00b7 BUILDING MANAGER'; return null; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY';
      if (atFlatDoor(p) && !rented()) return 'FLAT 7 \u00b7 FOR RENT \u00b7 SEE THE MANAGER'; const s = spotAt(p); if (s && rented()) return s === 'bed' ? 'BED \u00b7 SLEEP TILL MORNING' : s === 'chest' ? 'YOUR CHEST \u00b7 STORE + TAKE' : 'TROPHY SHELF';
      if (nearGd(p)) return 'TALK \u00b7 ISLAND GARDENER'; return null; }
    return null; }
  let talkM = save.stat('gdnTalked', 0), talkG = 0;
  const MG_HI = ['Back again! Lovely. Nothing to report. Nothing at all. Ha.', 'The duck is in the lift again. Lovely duck.', 'The Peppers visited. They said lovely things. Mostly about rent.'];
  function mMenu() { const first = !talkM; talkM++; save.setStat('gdnTalked', talkM); if (orchidCheck()) return;
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) }, { text: 'PICK A JOB', pick: () => sayTo(T_MG, [{ ...mgLn('Which job? The pipes and the garden are up on floor seven.'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase() + (q.F ? ' \u00b7 FLOOR 7' : ''), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'YOUR FLAT \u00b7 FLAT 7', pick: flatMenu }];
    if (sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneLoan() });
    ch.push({ text: 'WHO OWNS THE BUILDING?', pick: () => sayTo(T_MG, [mgLn('The Pepper family. A legitimate business. I am told to say legitimate. Twice.')]) });
    if (save.stat('gdnScene', false)) ch.push({ text: 'THE VAX GOLD?', pick: () => sayTo(T_MG, [mgLn('VAX lent the Peppers the gold for the island. Not lovely. Not lovely at all.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_MG, [mgLn('Goodbye! Have a lovely, lovely day.')]) });
    sayTo(T_MG, [{ ...mgLn(first ? 'Garden Apartments! Six jobs, one lovely flat for rent. Shall we begin?' : sceneReady() ? 'Six for six! Lovely. Can we have a quiet word?' : MG_HI[(talkM - 2) % MG_HI.length]), choices: ch }]); }
  function sceneLoan() { busy = 'scene'; save.setStat('gdnScene', true);
    const end = () => { busy = null; save.setStat('storyGardenLoan', true); toast('STORY \u00b7 VAX GOLD BOUGHT THE ISLAND', 2.6); orchidCheck(); };
    sayTo(T_MG, [mgLn('You polished, smiled, steered and fixed. Truly lovely. So I will be honest, once.'), { ...mgLn('The Peppers had no gold for these towers. VAX lent it. In a VAX envelope.'), choices: [
      { text: 'WHY WOULD VAX DO THAT?', pick: () => sayTo(T_MG, [mgLn('A family in debt does what it is told. That is not lovely.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T_MG, [mgLn('Quietly, please. I would like to stay lovely and employed.')], end) }] }]); }
  const GD_LINES = ['The orchids like it warm. The palms like it wet. I like it quiet.', 'Roof garden on floor seven. Best view on the island. Mind the hose.', 'The VAX violet only flowers when a VAX van is parked outside. Odd plant.', 'Water the roots, not the leaves. The leaves just complain.'];
  function gMenu() { talkG++; sayTo(T_GD, [{ ...gdLn(GD_LINES[(talkG - 1) % GD_LINES.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(done().garden ? 'hot' : 'garden') }, { text: 'WHAT GROWS HERE?', pick: () => sayTo(T_GD, [gdLn('Orchids, pepper palms, golden roses. All lovely. All thirsty.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const upLift = () => { liftDing(); fade(() => goRoom(0, 7.6, Math.PI, true)); setTimeout(() => KF.chime(), 500); };
  const downLift = () => { liftDing(); fade(() => go(OX + LLIFT[0] + 0.6, LY, LZ + LLIFT[1], Math.PI / 2)); };
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true;
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) { upLift(); return true; } if (!J.carry && atHatch(p)) { GD.room.take(); return true; } return false; }
      if (inFloor(P)) { const p = toF(P); if (atLiftF(p)) { downLift(); return true; } const d = doorAt(p); if (d >= 0 && J.carry) { GD.room.deliver(d); return true; } } return false; }
    if (busy) return false;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) { startGame(r.k); return true; } if (atLiftL(p)) { upLift(); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; } if (nearMg(p)) { tone(1320, 0.05, 0.5); mMenu(); return true; } return false; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) { startGame(r.k); return true; } if (atLiftF(p)) { downLift(); return true; }
      if (atFlatDoor(p) && !rented()) { toast('FLAT 7 \u00b7 ' + price() + ' G A WEEK \u00b7 SEE THE MANAGER IN THE LOBBY', 2.6); return true; }
      const s = spotAt(p); if (s && rented()) { if (s === 'bed') sleepHere(); else if (s === 'chest') chest(); else { const n = GOLDS().length; toast(n ? 'TROPHY SHELF \u00b7 ' + n + ' GOLDEN PRIZE' + (n > 1 ? 'S' : '') : 'TROPHY SHELF \u00b7 EMPTY \u00b7 WIN SOME GOLD', 2.4); } return true; }
      if (nearGd(p)) { tone(1320, 0.05, 0.5); gMenu(); return true; } return false; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, spawned = !/[?&]spawn=(gardenapts|gardenfloor)(&|$)/.test(location.search), spawnT = 0, wasR = null;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; const f = /spawn=gardenfloor/.test(location.search); goRoom(0, 7.6, Math.PI, f); }
    const inL = inLobby(P), inF = inFloor(P); G.visible = inL || (busy === 'job' && !!J && !J.F) || (busy === 'errand' && inL); FG.visible = inF || (busy === 'job' && !!J && J.F);
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; const r = rented(); if (r !== wasR) { wasR = r; doorM.visible = !r; doorCol.y0 = r ? 999 : LY - 3; drawSign(); }
      if (inL) { can.visible = !!save.stat('gdnAll', false); orchid.visible = !!save.stat('gdnOrchid', false); }
      if (inF) { drawShelf(); const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); skyM.color.set(n ? '#2a3450' : dusk ? '#f0c08a' : '#e8f3ff'); viewM.color.set(n ? '#1d2742' : dusk ? '#e8b07a' : '#bfe0f2'); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('garden apts job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; if (!busy) m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
    for (const k in spotMeshes) spotMeshes[k].visible = !busy && rented();
    if (G.visible) orchid.rotation.y += dt * 0.6;
    if (FG.visible) { const p = toF(P); kit.animFox(gardener, dt, 0, false); if (!busy && nearL(p, gardener.position.x, gardener.position.z, 3.5)) turnTo(gardener, Math.atan2(p.x - gardener.position.x, p.z - gardener.position.z), dt, 3); else { turnTo(gardener, GD0[2], dt, 2); armUp(gardener, 1, 0.5 + Math.sin(t * 2) * 0.15, -0.9); } }
    K.tick(dt, toL(P), { inShop: inL, busy: !!busy, near: 0, talking: false, clear: endClear > 0 ? [0, -4.4, 2.6] : null });
    KF.tick(dt, toF(P), { inShop: inF, busy: !!busy, near: 0, talking: false }); }
  drawShelf();
  const API = { group: G, floor: FG, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading, rented: rented(), price: price() }),
    spawn: { gardenapts: [OX, LZ + 7.6, Math.PI, LY], gardenfloor: [FOX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), scene: sceneLoan, up: upLift, down: downLift, rent: rentFlat, keeper, gardener,
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    _view(p, l, F = false, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p, F)); c.lookAt(toW(...l, F)); c.updateMatrixWorld(); return c; },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); KF.dispose(); scene.remove(tray); } };
  window.__gardenApts = API; return API;
}
