// MERU 2.0 — s145 LAKESIDE APARTMENTS [meruLakesideApts] (cluster apartments 2 of 4; Ben's picks s143/s144: jobs unique to this building, all 6 ideas ·
// LIFT → FLOOR 9 (new room) with FLAT 9G for rent (pay per game week at the manager) · flat = SLEEP + STORAGE CHEST + TROPHY SHELF ·
// prizes: LAKESIDE PEACOAT (1st clear, Tailor) · HALF RENT (3 jobs) · GOLDEN TUBA + 60 G + FREE RENT (all 6) + the manager's SALT LIFT scene · relic THE TUESDAY BELL (3 stars on all)).
// LOBBY jobs: FIX THE LIFT (it's not Tuesday) · CATCH THE LAKE DRIPS. FLOOR 9 jobs: FIND THE TUBA (walk) · SOUNDPROOF A WALL · WIPE THE LAKE WINDOWS · SHOW THE CUPBOARD FLAT.
// Made from worlds/meru2-gardenapts.js (same kit). Stats prefix lkp.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { ITEM_LABELS } from './meru-shops.js';
export function buildLakeApts({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, clusters, go, heal = () => {}, sleep = () => 1 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'lakesideApts'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, OX = LR.ox, RH = 4.4;
  const SR = clusters.addRoom({ key: 'lakeFloor', room: 'meruLakesideApts', title: 'LAKESIDE APARTMENTS \u00b7 FLOOR 9' }, RH); SR.out = LR.out; const FOX = SR.ox;
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLUE = '#2e86b8', NAVY = '#2e4a6b', LAKE = '#3f7fa8', SKY = '#9fc4e0', LEAF = '#4f8a3a', GOLD = '#d7ad52', OAK = '#a77b4f', DKW = '#5a3d26', PLUM = '#7a5ab8', ACC = NAVY;
  const rectL = (a, b, c, d, F) => { const o = { f: [(F ? FOX : OX) + a, (F ? FOX : OX) + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }; cols.push(o); return o; }, circL = (x, z, r, F) => cols.push({ c: [(F ? FOX : OX) + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'lakeAptsLobby'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const FG = new THREE.Group(); FG.name = 'lakeAptsFloor'; FG.position.set(FOX, LY, LZ); scene.add(FG); FG.visible = false;
  const toW = (x, y, z, F) => V((F ? FOX : OX) + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ }), toF = P => ({ x: P.x - FOX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('lkpDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2e4a6b', '#f3f2f2', '#1f2f45'], ['#3f7fa8', '#f3f2f2', '#1f3a52'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#9aa0a6', '#f3f2f2', '#3a3f45']];
  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'], DAYS3 = DAYS.map(d => d.slice(0, 3)), LET = 'ABCDEF';
  const dayIx = () => ((today() - 1) % 7 + 7) % 7, isTue = () => dayIx() === 1, liftFixed = () => !!done().lift;
  const fitTxt = (g, t, s, max) => { g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(t).width > max && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } };
  const lakeArt = (g, W, H) => { const sk = g.createLinearGradient(0, 0, 0, H * 0.56); sk.addColorStop(0, '#a9d2ec'); sk.addColorStop(1, '#eef6fa'); g.fillStyle = sk; g.fillRect(0, 0, W, H * 0.56);
    g.fillStyle = '#7f9a86'; g.beginPath(); g.moveTo(W * 0.1, H * 0.56); g.quadraticCurveTo(W * 0.24, H * 0.4, W * 0.38, H * 0.56); g.fill(); g.fillStyle = '#93ab95'; g.beginPath(); g.moveTo(W * 0.56, H * 0.56); g.quadraticCurveTo(W * 0.7, H * 0.45, W * 0.9, H * 0.56); g.fill();
    g.fillStyle = '#d7ad52'; g.fillRect(W * 0.68, H * 0.34, Math.max(2, W * 0.012), H * 0.14); g.fillStyle = '#3f7fa8'; g.fillRect(0, H * 0.56, W, H * 0.44); g.fillStyle = '#6fa8cc'; for (let k = 0; k < 16; k++) g.fillRect((k * 137) % W, H * (0.6 + ((k * 53) % 38) / 100), W * 0.07, Math.max(2, H * 0.01));
    g.fillStyle = '#f3f2f2'; g.beginPath(); g.moveTo(W * 0.44, H * 0.7); g.lineTo(W * 0.5, H * 0.7); g.lineTo(W * 0.47, H * 0.6); g.closePath(); g.fill(); g.fillStyle = '#201e1d'; for (const [x, y] of [[0.3, 0.18], [0.33, 0.15], [0.55, 0.22]]) g.fillRect(W * x, H * y, W * 0.022, Math.max(2, H * 0.008)); };
  // ================= LOBBY extras: LIFT CONTROL BOX + day sign (left wall), DRIP BUCKET + puddle + WET FLOOR (right front), lake painting (back wall) =================
  const R0 = mk(), { box, cyl, sph } = R0;
  box(0.14, 1.1, 0.8, STEEL, -9.8, 1.5, -1.4); box(0.04, 0.7, 0.6, INK, -9.72, 1.55, -1.4); for (let k = 0; k < 3; k++) box(0.03, 0.08, 0.08, k === 1 ? RED : YEL, -9.69, 1.75 - k * 0.2, -1.55); box(0.08, 0.42, 0.08, RED, -9.66, 1.3, -1.12, 0, 0, 0.5); sph(0.06, INK, -9.6, 1.48, -1.04); rectL(-9.95, -9.55, -1.85, -0.95);
  cyl(0.3, 0.24, 0.44, STEEL, 7.6, 0.22, 5.6, 12); cyl(0.27, 0.27, 0.02, LAKE, 7.6, 0.4, 5.6, 12); cyl(1.0, 1.0, 0.006, '#7fb2d0', 8.3, 0.004, 6.7, 18); rectL(7.25, 7.95, 5.25, 5.95);
  box(0.55, 0.75, 0.05, YEL, 6.8, 0.38, 7.1, 0.35, -0.2); rectL(6.5, 7.1, 6.9, 7.3);
  box(1.9, 1.15, 0.06, OAK, 4.6, 1.85, -9.85);
  R0.mesh(G);
  planeT(CT(512, 288, lakeArt), 1.7, 0.95, 4.6, 1.85, -9.8, 0, G); planeT(plate('LAKE VIEW \u00b7 COSTS EXTRA', 512, 96, INK, PAPER, SKY), 1.6, 0.3, 4.6, 1.05, -9.8, 0, G);
  planeT(plate('FIX THE LIFT', 384, 96, INK, PAPER, RED), 1.4, 0.34, -9.83, 3.35, -1.4, Math.PI / 2, G); planeT(plate('CATCH THE DRIPS', 384, 96, INK, PAPER, SKY), 1.5, 0.36, 9.83, 3.1, 5.6, -Math.PI / 2, G);
  planeT(plate('LIFT \u00b7 FLOOR 9 \u00b7 LAKE VIEWS', 512, 96, NAVY, PAPER, SKY), 1.7, 0.32, -9.74, 3.15, -4, Math.PI / 2, G); planeT(plate('WET FLOOR', 256, 96, YEL, INK), 0.46, 0.17, 6.83, 0.5, 7.15, 0.35, G);
  const dayT = CT(512, 160, () => {}); planeT(dayT, 1.5, 0.47, -9.74, 2.55, -1.4, Math.PI / 2, G); let dayDrawn = '';
  const drawDay = () => { const k = dayIx() + (liftFixed() ? 'f' : ''); if (k === dayDrawn) return; dayDrawn = k; const g = dayT.userData.c.getContext('2d'), ok = isTue() || liftFixed(); g.fillStyle = INK; g.fillRect(0, 0, 512, 160); g.fillStyle = ok ? YEL : RED; g.fillRect(0, 0, 14, 160); g.textBaseline = 'alphabetic';
    g.fillStyle = PAPER; fitTxt(g, 'TODAY \u00b7 ' + DAYS[dayIx()], 46, 450); g.fillText('TODAY \u00b7 ' + DAYS[dayIx()], 34, 66); const l2 = liftFixed() ? 'LIFT \u00b7 FIXED \u00b7 EVERY DAY IS TUESDAY' : isTue() ? 'LIFT \u00b7 WORKS TODAY' : 'LIFT \u00b7 TUESDAYS ONLY'; g.fillStyle = ok ? YEL : RED; fitTxt(g, l2, 32, 450); g.fillText(l2, 34, 126); dayT.needsUpdate = true; };
  const drip = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 4), new THREE.MeshBasicMaterial({ color: '#bfe0f2' })); drip.position.set(7.6, 3.4, 5.6); G.add(drip); let dripT = 0, dripHit = false;
  const LLIFT = [-8.4, -4];
  // ================= FLOOR 9: hall (south, FLATS 9A-9F), FLAT 9G (north-west, for rent), LAKE LOUNGE (north-east, the big lake window) =================
  const F0 = mk(), fb = F0.box, fc = F0.cyl, fs = F0.sph, WL = '#e9e4d6';
  fb(20, 0.1, 20, '#b9b2a2', 0, -0.05, 0); fb(20, 0.012, 6.4, NAVY, 0, 0.006, 6.8); for (const s of [-1, 1]) fb(20, 0.014, 0.06, SKY, 0, 0.008, 6.8 + s * 3.1);
  fb(10.4, 0.02, 13.4, '#c9a77a', 4.7, 0.012, -3.3);
  fb(20, 0.2, 20, CREAM, 0, RH + 0.1, 0); fb(20, RH, 0.3, WL, 0, RH / 2, -10); for (const s of [-1, 1]) fb(0.3, RH, 20, WL, s * 10, RH / 2, 0); for (const s of [-1, 1]) fb(8.4, RH, 0.3, WL, s * 5.8, RH / 2, 10); fb(3.2, RH - 3.0, 0.3, WL, 0, 3.0 + (RH - 3.0) / 2, 10);
  rectL(-10, 10, -10.3, -9.7, true); rectL(9.8, 10.3, -10, 10, true); rectL(-10.3, -9.8, -10, 10, true); rectL(-10, -1.6, 9.8, 10.3, true); rectL(1.6, 10, 9.8, 10.3, true); rectL(-1.6, 1.6, 9.9, 10.4, true);
  fb(1.8, 2.7, 0.06, STEEL, 0, 1.35, 9.82); fb(0.03, 2.7, 0.07, INK, 0, 1.35, 9.8); fb(2.1, 0.14, 0.12, SKY, 0, 2.78, 9.8);
  for (const s of [-1, 1]) fb(0.06, 0.24, 20, NAVY, s * 9.83, 0.12, 0); fb(20, 0.24, 0.06, NAVY, 0, 0.12, -9.83);
  // partition z 3.5: wall x -10..-6, FLAT 9G door -6..-4.6, wall -4.6..4.2 (thin-wall patch + cupboard door on its hall face), lounge doorway 4.2..5.8, wall 5.8..10; flat/lounge wall x -0.6
  fb(4, RH, 0.2, WL, -8, RH / 2, 3.5); fb(1.4, RH - 2.6, 0.2, WL, -5.3, 2.6 + (RH - 2.6) / 2, 3.5); rectL(-10, -6, 3.4, 3.6, true);
  fb(8.8, RH, 0.2, WL, -0.2, RH / 2, 3.5); rectL(-4.6, 4.2, 3.4, 3.6, true); fb(4.2, RH, 0.2, WL, 7.9, RH / 2, 3.5); rectL(5.8, 10, 3.4, 3.6, true); fb(1.6, RH - 2.8, 0.2, WL, 5.0, 2.8 + (RH - 2.8) / 2, 3.5);
  fb(0.2, RH, 13.5, WL, -0.6, RH / 2, -3.25); rectL(-0.7, -0.5, -10, 3.5, true);
  const DOORS = [[-7.5, 9.8, 0], [-4, 9.8, 0], [4, 9.8, 0], [7.5, 9.8, 0], [-9.8, 6.5, 1], [9.8, 6.5, -1]];
  DOORS.forEach(([x, z, s]) => { if (!s) { fb(1.2, 2.4, 0.08, NAVY, x, 1.2, 9.82); fb(1.4, 0.1, 0.1, STEEL, x, 2.45, 9.8); fs(0.05, GOLD, x + 0.42, 1.1, 9.74); } else { fb(0.08, 2.4, 1.2, NAVY, x * 0.998, 1.2, z); fb(0.1, 0.1, 1.4, STEEL, x * 0.998, 2.45, z); fs(0.05, GOLD, x - s * 0.08, 1.1, z + 0.42); } });
  fb(1.9, 2.2, 0.03, '#d8cfb8', -2.4, 1.4, 3.62); for (let k = 0; k < 4; k++) fb(0.03, 0.55, 0.02, INK, -3.0 + k * 0.4, 0.9 + (k % 2) * 0.7, 3.645, 0, 0, k % 2 ? 0.5 : -0.4);
  fb(0.8, 2.1, 0.08, '#8a6a48', 1.4, 1.05, 3.62); fs(0.04, GOLD, 1.68, 1.0, 3.68);
  // FLAT 9G: bed, chest, trophy shelf (west wall), sofa, rug, window
  fb(2.2, 0.5, 2.6, PAPER, -7.8, 0.25, -7.8); fb(2.3, 0.2, 2.7, DKW, -7.8, 0.1, -7.8); fb(2.3, 1.1, 0.12, DKW, -7.8, 0.75, -9.1); fb(2.0, 0.14, 1.6, NAVY, -7.8, 0.55, -7.2); fb(0.7, 0.16, 0.4, PAPER, -8.3, 0.58, -8.6); fb(0.7, 0.16, 0.4, PAPER, -7.3, 0.58, -8.6); rectL(-9.0, -6.6, -9.2, -6.4, true);
  fb(1.1, 0.6, 0.6, OAK, -3.4, 0.3, -9.3); fb(1.14, 0.06, 0.64, STEEL, -3.4, 0.62, -9.3); rectL(-4.0, -2.8, -9.7, -8.9, true);
  for (const y of [1.0, 1.6, 2.2]) fb(0.4, 0.05, 3.0, DKW, -9.6, y, -2.4); fb(0.06, 1.8, 3.1, DKW, -9.8, 1.6, -2.4);
  fb(2.6, 0.45, 0.9, LAKE, -4.8, 0.23, -1.0); fb(2.6, 0.6, 0.2, LAKE, -4.8, 0.6, -0.6); rectL(-6.1, -3.5, -1.5, -0.5, true); fc(1.4, 1.4, 0.012, '#c9d6de', -5, 0.012, -4.2, 20);
  fb(3.4, 1.8, 0.06, INK, -5, 2.3, -9.82);
  // LAKE LOUNGE: the big window (steel mullions + sill), sofa facing the lake, coffee table, telescope
  for (const x of [-0.3, 2.9, 6.5, 9.7]) fb(0.12, 2.7, 0.14, STEEL, x, 1.95, -9.8); fb(10.1, 0.12, 0.14, STEEL, 4.7, 3.3, -9.8); fb(10.1, 0.12, 0.45, CREAM, 4.7, 0.58, -9.7);
  fb(3.0, 0.45, 0.9, NAVY, 5.2, 0.23, -5.0); fb(3.0, 0.6, 0.2, NAVY, 5.2, 0.6, -4.5); rectL(3.7, 6.7, -5.5, -4.4, true);
  fb(1.4, 0.4, 0.7, OAK, 5.2, 0.2, -6.7); rectL(4.5, 5.9, -7.05, -6.35, true);
  for (let k = 0; k < 3; k++) fc(0.025, 0.025, 1.3, DKW, 8.6 + Math.cos(k * 2.1) * 0.25, 0.6, -8.4 + Math.sin(k * 2.1) * 0.25, 6, Math.sin(k * 2.1) * 0.2, -Math.cos(k * 2.1) * 0.2); fc(0.08, 0.06, 0.9, INK, 8.6, 1.35, -8.6, 10, 1.2); circL(8.6, -8.4, 0.45, true);
  fc(0.3, 0.3, 0.5, OAK, 9.2, 0.25, 2.6, 10); fc(0.04, 0.04, 1.2, STEEL, 9.2, 1.1, 2.6, 6); fc(0.22, 0.3, 0.3, PAPER, 9.2, 1.8, 2.6, 10); circL(9.2, 2.6, 0.35, true);
  F0.mesh(FG);
  const winM = new THREE.MeshBasicMaterial({ map: CT(1024, 288, lakeArt) }); planeT(null, 9.8, 2.6, 4.7, 1.95, -9.84, 0, FG, winM);
  const viewM = new THREE.MeshBasicMaterial({ map: CT(512, 256, lakeArt) }); planeT(null, 3.2, 1.6, -5, 2.3, -9.78, 0, FG, viewM);
  const gullT = CT(128, 96, (g) => { g.fillStyle = PAPER; g.beginPath(); g.ellipse(56, 60, 34, 20, 0, 0, 7); g.fill(); g.beginPath(); g.arc(88, 40, 14, 0, 7); g.fill(); g.fillStyle = '#e07a1f'; g.fillRect(100, 40, 20, 6); g.fillStyle = STEEL; g.fillRect(28, 50, 42, 12); g.fillStyle = INK; g.fillRect(90, 35, 4, 4); g.fillStyle = '#e07a1f'; g.fillRect(48, 78, 4, 14); g.fillRect(62, 78, 4, 14); });
  const gullM = new THREE.MeshBasicMaterial({ map: gullT, transparent: true, depthWrite: false }), GULLS = [1.6, 7.8].map(x => planeT(null, 0.5, 0.38, x, 0.86, -9.83, 0, FG, gullM));
  planeT(plate('LAKESIDE APARTMENTS \u00b7 FLOOR 9', 512, 96, NAVY, PAPER, SKY), 2.6, 0.45, 0, 3.4, 9.8, Math.PI, FG); planeT(plate('LIFT \u00b7 LOBBY', 384, 96, INK, PAPER, RED), 1.5, 0.36, 0, 3.05, 9.78, Math.PI, FG);
  planeT(plate('LAKE LOUNGE', 384, 96, NAVY, PAPER, SKY), 1.6, 0.38, 5, 3.2, 3.62, 0, FG); planeT(plate('THIN WALL', 256, 96, INK, PAPER, RED), 0.9, 0.3, -2.4, 2.8, 3.66, 0, FG); planeT(plate('FLAT 9\u00bd \u00b7 CUPBOARD', 384, 96, INK, PAPER, GOLD), 0.95, 0.24, 1.4, 2.4, 3.67, 0, FG);
  DOORS.forEach(([x, z, s], i) => planeT(plate('FLAT 9' + LET[i], 256, 96, INK, PAPER, SKY), 0.7, 0.26, s ? x + s * 0.12 : x, 2.15, s ? z : z - 0.08, s ? s * Math.PI / 2 : Math.PI, FG));
  const foamG = new THREE.Group(); { const S = mk(); for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) S.box(0.42, 0.42, 0.06, (i + j) % 2 ? '#c9b36a' : '#b8a35c', -3.05 + i * 0.44, 0.65 + j * 0.44, 3.66); S.mesh(foamG); } FG.add(foamG); foamG.visible = false;
  // FLAT 9G door (locked until you rent), its sign, trophy cups
  const doorM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.1), new THREE.MeshLambertMaterial({ color: NAVY })); doorM.position.set(-5.3, 1.3, 3.5); FG.add(doorM); const doorCol = rectL(-6, -4.6, 3.38, 3.62, true);
  const signT = CT(384, 128, () => {}), sign = planeT(signT, 1.2, 0.4, -5.3, 2.75, 3.62, 0, FG);
  const drawSign = () => { const g = signT.userData.c.getContext('2d'), r = rented(); g.fillStyle = r ? NAVY : INK; g.fillRect(0, 0, 384, 128); g.fillStyle = SKY; g.fillRect(0, 0, 12, 128); g.fillStyle = PAPER; g.font = '900 46px Archivo, sans-serif'; g.fillText('FLAT 9G', 30, 56); g.fillStyle = r ? YEL : RED; const t2 = r ? (free() ? 'YOURS \u00b7 RENT FREE' : 'YOURS \u00b7 ' + daysLeft() + ' DAYS LEFT') : 'FOR RENT \u00b7 SEE THE MANAGER'; fitTxt(g, t2, 26, 340); g.fillText(t2, 30, 100); signT.needsUpdate = true; };
  const cupG = new THREE.CylinderGeometry(0.07, 0.045, 0.2, 10), cupM = new THREE.MeshLambertMaterial({ color: GOLD, emissive: '#7a5a1a', emissiveIntensity: 0.3 }), CUPS = [];
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(cupG, cupM); m.position.set(-9.55, 1.13 + Math.floor(i / 4) * 0.6, -3.6 + (i % 4) * 0.8); m.visible = false; FG.add(m); CUPS.push(m); }
  const shelfT = CT(512, 96, () => {}), shelfP = planeT(shelfT, 2.4, 0.45, -9.78, 2.85, -2.4, Math.PI / 2, FG);
  const GOLDS = () => Object.entries((save.data && save.data.items) || {}).filter(([id, n]) => n > 0 && /^gold|^golden|Trophy$/.test(id)).map(([id]) => id);
  const drawShelf = () => { const n = GOLDS().length, g = shelfT.userData.c.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, 512, 96); g.fillStyle = SKY; g.fillRect(0, 0, 14, 96); g.fillStyle = PAPER; g.font = '900 40px Archivo, sans-serif'; g.fillText('TROPHY SHELF \u00b7 ' + n, 32, 62); shelfT.needsUpdate = true; CUPS.forEach((c, i) => { c.visible = i < n; }); };
  const tuba = new THREE.Group(); { const S = mk(); S.cyl(0.05, 0.05, 0.3, GOLD, 0, 0.17, 0, 8); S.cyl(0.06, 0.16, 0.14, GOLD, 0, 0.39, 0, 12); S.cyl(0.02, 0.02, 0.14, GOLD, 0.09, 0.14, 0, 6, 0, 1.2); S.box(0.1, 0.06, 0.06, GOLD, 0, 0.06, 0); S.mesh(tuba); } tuba.position.set(1.8, 1.12, -6.4); G.add(tuba); tuba.visible = false;
  const bell = new THREE.Group(); { const S = mk(); S.cyl(0.04, 0.13, 0.18, '#b08a3a', 0, 0.2, 0, 12); S.sph(0.035, INK, 0, 0.1, 0); S.box(0.03, 0.08, 0.03, '#b08a3a', 0, 0.32, 0); S.mesh(bell); } bell.position.set(-1.8, 1.12, -6.4); G.add(bell); bell.visible = false;
  // ================= FOXES: the Building Manager (replaces the lobby's quiet keeper) + MR. HUSH (flat 9A, the lake lounge, hears everything) =================
  const old = LR.keeper; if (old && old.parent) old.parent.remove(old); LR.keeper = null;
  const MG0 = [0, -7.4, 0], HU0 = [8.2, -1.6, -Math.PI / 2];
  const keeper = kit.makeFox({ key: 'laptManager', name: 'Building Manager', torso: ['#2e4a6b', '#e7e4dc', '#9fc4e0'], outfit: 'coat', mood: 'warm' }); keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2]; keeper.userData.noCull = true; keeper.userData.rosterShop = 'LAKESIDE APARTMENTS'; keeper.userData.rosterRole = 'keeper'; G.add(keeper);
  const hush = kit.makeFox({ key: 'laptHush', name: 'Mr. Hush', torso: ['#7a5ab8', '#e2d2b4', '#3a2a5a'], outfit: 'robe', mood: 'warm' }); hush.position.set(HU0[0], 0, HU0[1]); hush.rotation.y = HU0[2]; hush.userData.noCull = true; FG.add(hush); circL(HU0[0], HU0[1], 0.45, true);
  const GAMES = [{ k: 'lift', name: 'Fix the Lift', color: RED }, { k: 'drips', name: 'Catch the Lake Drips', color: LAKE }, { k: 'tuba', name: 'Find the Tuba on Floor Nine', color: GOLD, F: true },
    { k: 'wall', name: 'Soundproof a Wall', color: PLUM, F: true }, { k: 'wipe', name: 'Wipe the Lake Windows', color: SKY, F: true }, { k: 'cupboard', name: 'Show the Cupboard Flat', color: OAK, F: true }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { lift: [-8.0, -1.4], drips: [6.4, 5.6], tuba: [-7.0, 5.0], wall: [-2.4, 4.7], wipe: [2.6, -8.4], cupboard: [1.4, 4.7] };
  const lampsOn = () => { const h = hour(); return h >= 19 || h < 7; };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'lkp', color: NAVY, boardTitle: 'Lakeside Apartments board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -3.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 2.8, z: 8.2, ry: 0 }, hiringLine: 'LIFT \u00b7 DRIPS \u00b7 TUBA \u00b7 WALLS \u00b7 WINDOWS \u00b7 CUPBOARD', sun: [{ x: 0, z: 7.4, w: 2.4, d: 2.0 }, { x: -3, z: 4, w: 2.4, d: 1.6 }],
    lamps: [[0, 3.6, -6], [0, 3.6, -0.5], [0, 3.6, 5]], lampsOn, browse: [[-5.6, 2.6, -Math.PI / 2], [3.6, 2.0, Math.PI / 2], [-3.0, -2.0, Math.PI]], looks: [LOOKS[1], LOOKS[2], LOOKS[3]], clock: { x: 3.6, y: 3.4, z: 9.83, ry: Math.PI } });
  const KF = shopKit({ THREE, G: FG, scene, kit, save, camera, touch, hour, isMuted, prefix: 'lkp', color: NAVY, room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], games: [],
    sun: [{ x: 3.0, z: -8.2, w: 3.4, d: 2.2 }, { x: 7.0, z: -7.6, w: 3.0, d: 2.2 }, { x: -5, z: -8.4, w: 2.4, d: 1.4 }], lamps: [[-5, RH - 0.6, -4], [0, RH - 0.6, 6.8], [-6, RH - 0.6, 6.8], [6, RH - 0.6, 6.8], [5, RH - 0.6, -4.5]], lampsOn, browse: [[3.6, -7.6, Math.PI], [6.8, -7.4, Math.PI]], looks: [LOOKS[0], LOOKS[2]] });
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
  const T_MG = { key: 'laptManager', name: 'Building Manager', role: 'LAKESIDE APARTMENTS', obj: keeper, ry: MG0[2], r: 6 }, mgLn = ln('Building Manager', 'LAKESIDE APARTMENTS');
  const T_HU = { key: 'laptHush', name: 'Mr. Hush', role: 'FLAT 9A \u00b7 FLOOR 9', obj: hush, ry: HU0[2], r: 4 }, huLn = ln('Mr. Hush', 'FLAT 9A \u00b7 FLOOR 9');
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;min-width:0;display:block;touch-action:none;background:#1f2f45;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = (t, attr = 'data-go') => '<button ' + attr + ' style="' + BTN + ';flex:1;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const sideBtn = (ic, tx, attr) => '<button ' + attr + ' style="' + BTN + ';flex:none;width:92px;display:flex;flex-direction:column;justify-content:center;gap:4px;font-size:16px;background:#ec3013;color:#fff;touch-action:none"><span style="font-size:30px;line-height:1">' + ic + '</span>' + tx + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = (down, up) => { const kd = e => { const k = down(e); if (k) { e.preventDefault(); e.stopPropagation(); } }, ku = e => { if (up && up(e)) { e.preventDefault(); e.stopPropagation(); } }; addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  // ---------- 1 FIX THE LIFT: the day dial spins; pull the lever while the needle is on TUESDAY, six relays (faster, then backwards) ----------
  const LFT = 8;
  GD.lift = { shot: () => [toW(-9.7, 1.5, -1.4), 2.4, 2.2, 0.15, 2.2, Math.PI / 2, 5],
    begin() { goRoom(-8.0, -1.4, -Math.PI / 2); J.list = [...Array(6)].map((_, i) => ({ sp: (2.0 + i * 0.45) * (i >= 3 && i % 2 ? -1 : 1) })); J.ci = 0; J.cueT = LFT; J.wait = 0.4; J.a = 2 + Math.random() * 3; J.flash = null; snapK = true;
      keyAct(e => { if (e.code === 'Space' || e.code === 'Enter') { if (!e.repeat) this.pull(); return true; } return false; }); this.draw(); },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('FIX THE LIFT \u00b7 RELAY ' + nOf(), goldR()) + body(c ? (wide() ? timeRow + '<div style="flex:1;min-height:0;display:flex;gap:8px">' + cvTag('1/1') + '<div style="flex:none;width:150px;display:flex">' + bigBtn('PULL THE LEVER') + '</div></div>' : cvTag('1/1') + timeRow + bigBtn('PULL THE LEVER')) : doneMsg('THE LIFT THINKS IT IS TUESDAY')) + tipBar('PULL THE LEVER WHEN THE NEEDLE IS ON TUESDAY'));
      const b = PANEL.querySelector('[data-go]'), cv = PANEL.querySelector('[data-cv]'); for (const el of [b, cv]) if (el) el.onpointerdown = e => { e.preventDefault(); this.pull(); }; },
    seg() { const s = Math.PI * 2 / 7, a = ((J.a % 6.2832) + 6.2832) % 6.2832; return Math.floor(a / s) % 7; },
    pull() { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; const k = this.seg();
      if (k === 1) { addGold(4); ding(); tone(80, 0.08, 0.3, 'sawtooth'); J.flash = ['ok', 0.7]; okTip('CLUNK \u00b7 RELAY ' + (J.ci + 1) + ' THINKS IT IS TUESDAY'); J.wait = 0.8; setTimeout(() => this.next(), 700); }
      else { J.flash = ['bad', 0.6]; missOne('THAT WAS ' + DAYS[k] + ' \u00b7 THE LIFT SULKS'); } },
    next() { roundNext(this, 'lift', LFT); },
    tick(dt) { const c = J.list[J.ci]; if (c && J.wait <= 0) J.a += c.sp * dt; if (J.flash && (J.flash[1] -= dt) <= 0) J.flash = null; roundTick(this, dt, LFT, 'TOO SLOW \u00b7 THE RELAY RESET', () => '[data-go]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')); if (!f || !J.list[J.ci]) return; const { g, w, h } = f, cx = w / 2, cy = h * 0.55, R = Math.min(w, h) * 0.38, s = Math.PI * 2 / 7;
      g.fillStyle = '#1f2f45'; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let i = 0; i < 7; i++) { const a0 = -Math.PI / 2 + i * s, am = a0 + s / 2; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0, a0 + s); g.closePath(); g.fillStyle = i === 1 ? RED : i % 2 ? CREAM : PAPER; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
        g.fillStyle = i === 1 ? '#fff' : INK; g.font = '900 ' + Math.round(R * 0.17) + 'px Archivo, sans-serif'; g.fillText(DAYS3[i], cx + Math.cos(am) * R * 0.68, cy + Math.sin(am) * R * 0.68); }
      const a = -Math.PI / 2 + J.a; g.strokeStyle = YEL; g.lineWidth = 6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R * 1.02, cy + Math.sin(a) * R * 1.02); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(cx, cy, R * 0.09, 0, 7); g.fill();
      if (J.flash) { g.strokeStyle = J.flash[0] === 'ok' ? YEL : RED; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, R * 1.08, 0, 7); g.stroke(); }
      const lw = Math.min(30, w / 9); for (let i = 0; i < 6; i++) { g.fillStyle = i < J.ci ? YEL : '#3a4a60'; g.fillRect(cx + (i - 3) * (lw + 6) + 3, h * 0.04, lw, 14); }
      g.textAlign = 'left'; g.textBaseline = 'alphabetic'; } };
  // ---------- 2 CATCH THE LAKE DRIPS: the lake leaks through 5 ceiling cracks; slide the bucket under each drop (14 drips, faster) ----------
  const DRN = 14, CRK = 5, crX = k => 0.14 + k * 0.18;
  GD.drips = { shot: () => [toW(7.6, 1.2, 5.6), 3.0, 2.8, 0.3, 2.4, -Math.PI / 2, 5],
    begin() { goRoom(6.4, 5.6, Math.PI / 2); let t = 1.0, last = -1; J.list = [...Array(DRN)].map((_, i) => { t += Math.max(0.75, 1.8 - i * 0.08); let k = Math.floor(Math.random() * CRK); if (k === last) k = (k + 1 + Math.floor(Math.random() * (CRK - 1))) % CRK; last = k; return { k, at: t, ft: Math.max(0.75, 1.15 - i * 0.025), st: 0, y: 0 }; });
      J.time = 0; J.bx = 0.5; J.tx = 0.5; J.dir = 0; J.drag = false; J.got = 0; J.fill = 0; J.splash = []; J.wait = 0.4; J.fin = false; snapK = true;
      keyAct(e => { if (e.code === 'ArrowLeft' || e.code === 'KeyA') { J.dir = -1; return true; } if (e.code === 'ArrowRight' || e.code === 'KeyD') { J.dir = 1; return true; } return false; }, e => { if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) { J.dir = 0; return true; } return false; }); this.draw(); },
    draw() { const end = J.list.every(d => d.st >= 2);
      showPanel(panelHead('CATCH THE LAKE DRIPS', goldR()) + body(!end ? (wide() ? '<div style="flex:1;min-height:0;display:flex;gap:8px">' + sideBtn('\u25c0', 'LEFT', 'data-l') + cvTag('4/3') + sideBtn('\u25b6', 'RIGHT', 'data-r') + '</div>' : cvTag('4/5') + '<div style="display:flex;gap:8px;flex:none">' + bigBtn('\u25c0 LEFT', 'data-l') + bigBtn('RIGHT \u25b6', 'data-r') + '</div>') : doneMsg('NOT ONE DROP ON THE CARPET')) + tipBar('SLIDE THE BUCKET UNDER EACH DRIP \u00b7 DRAG OR HOLD LEFT / RIGHT'));
      const hold = (s, d) => { const b = PANEL.querySelector(s); if (!b) return; b.onpointerdown = e => { e.preventDefault(); J.dir = d; J.idle = 0; J.drag = false; }; b.onpointerup = b.onpointercancel = b.onpointerleave = () => { if (J.dir === d) J.dir = 0; }; };
      hold('[data-l]', -1); hold('[data-r]', 1); const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = true; J.drag = true; this.aim(cv, e); }, e => this.aim(cv, e)); },
    aim(cv, e) { const r = cv.getBoundingClientRect(); J.tx = clamp((e.clientX - r.left) / r.width, 0.06, 0.94); J.idle = 0; },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) { J.wait -= dt; this.render(); return; } J.time += dt;
      if (J.dir) J.tx = clamp(J.bx + J.dir * 0.6, 0.06, 0.94); J.bx += (J.tx - J.bx) * Math.min(1, dt * (J.dir ? 3.2 : 9));
      for (const d of J.list) { if (d.st === 0 && J.time >= d.at - 0.8) d.st = 1; if (d.st === 1 && J.time >= d.at) d.st = 1.5;
        if (d.st === 1.5) { const q = Math.min(1, (J.time - d.at) / d.ft); d.y = 0.12 + 0.78 * q * q;
          if (d.y >= 0.88) { if (Math.abs(crX(d.k) - J.bx) < 0.1) { d.st = 2; J.got++; J.fill++; addGold(2); tone(1900, 0.04, 0.12, 'sine'); if (J.fill >= 5) { J.fill = 0; okTip('BUCKET FULL \u00b7 TIPPED BACK INTO THE LAKE'); } else okTip('PLINK \u00b7 ' + J.got + ' CAUGHT'); }
            else { d.st = 3; J.splash.push({ x: crX(d.k), t: 1.2 }); missOne('SPLASH \u00b7 THE CARPET IS WET'); } } } }
      J.splash = J.splash.filter(s => (s.t -= dt) > 0);
      if (!J.fin && J.list.every(d => d.st >= 2)) { J.fin = true; addGold(6); setTimeout(() => { if (J && J.g === 'drips') { this.draw(); setTimeout(finishGame, 600); } }, 500); }
      const nx = J.list.find(d => d.st === 1 || d.st === 1.5); if (J.idle > 3 && !J.hinted && nx) { J.hinted = true; pulse(PANEL.querySelector(crX(nx.k) > J.bx ? '[data-r]' : '[data-l]')); } this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')); if (!f) return; const { g, w, h } = f, t = performance.now() / 1000; g.fillStyle = '#e9e4d6'; g.fillRect(0, 0, w, h); g.fillStyle = '#cfc6b0'; g.fillRect(0, 0, w, h * 0.1); g.fillStyle = '#b9b2a2'; g.fillRect(0, h * 0.94, w, h * 0.06);
      g.strokeStyle = INK; g.lineWidth = 2; for (let k = 0; k < CRK; k++) { const x = crX(k) * w; g.beginPath(); g.moveTo(x - 14, h * 0.02); g.lineTo(x - 4, h * 0.06); g.lineTo(x + 6, h * 0.04); g.lineTo(x, h * 0.1); g.stroke(); }
      for (const d of J.list) { const x = crX(d.k) * w; if (d.st === 1) { const q = clamp(1 - (d.at - J.time) / 0.8, 0, 1), wob = Math.sin(t * 30) * 1.5 * q; g.fillStyle = LAKE; g.beginPath(); g.arc(x + wob, h * 0.1 + q * 6, 3 + q * 5, 0, 7); g.fill(); }
        else if (d.st === 1.5) { const y = d.y * h; g.fillStyle = LAKE; g.beginPath(); g.moveTo(x, y - 14); g.quadraticCurveTo(x + 9, y + 2, x, y + 8); g.quadraticCurveTo(x - 9, y + 2, x, y - 14); g.fill(); } }
      for (const s of J.splash) { g.fillStyle = 'rgba(63,127,168,' + (s.t / 1.2 * 0.8).toFixed(2) + ')'; g.beginPath(); g.ellipse(s.x * w, h * 0.95, 30 * (1.4 - s.t / 1.2 * 0.4), 7, 0, 0, 7); g.fill(); }
      const bx = J.bx * w, bw = w * 0.2, y0 = h * 0.86, fl = J.fill / 5; g.fillStyle = STEEL; g.beginPath(); g.moveTo(bx - bw / 2, y0); g.lineTo(bx + bw / 2, y0); g.lineTo(bx + bw * 0.4, h * 0.97); g.lineTo(bx - bw * 0.4, h * 0.97); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
      g.fillStyle = LAKE; g.fillRect(bx - bw * 0.38, h * (0.965 - 0.1 * fl), bw * 0.76, h * 0.1 * fl);
      g.fillStyle = INK; g.fillRect(0, 0, 200, 26); g.fillStyle = YEL; g.font = '900 14px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('CAUGHT ' + J.got + ' \u00b7 SPLASH ' + J.list.filter(d => d.st === 3).length + ' \u00b7 ' + DRN, 8, 18); } };
  // ---------- 3 FIND THE TUBA ON FLOOR NINE (walk): follow the sound (louder = closer, HOTTER / COLDER), knock on its door; 3 rounds, it moves each time ----------
  const TBN = 3, WRONG = ['NO TUBA HERE. JUST ME AND MY CAT.', 'TUBA? I PLAY THE TRIANGLE. QUIETLY.', 'WRONG DOOR. LISTEN HARDER.', 'IT IS NEVER ME. IT IS ALWAYS NEXT DOOR.', 'I WAS ASLEEP. WAS.'];
  GD.tuba = { errand: true,
    begin() { goRoom(-7.0, 5.0, Math.PI, true); J.list = pickN([0, 1, 2, 3, 4, 5], TBN).map(d => ({ d, tried: [] })); J.ci = 0; J.t0 = 0; J.beat = 0.5; J.prevD = null; J.hc = ''; J.hcT = 0; toast('LISTEN \u00b7 FOLLOW THE TUBA \u00b7 KNOCK (E) ON ITS DOOR', 2.6); },
    dpos(i) { const [x, z, s] = DOORS[i]; return s ? [x + s * 1.0, z] : [x, z - 1.0]; },
    knockAt(i) { const c = J.list[J.ci]; if (!c) return; knock();
      if (i !== c.d) { if (!c.tried.includes(i)) c.tried.push(i); missOne('FLAT 9' + LET[i] + ' \u00b7 ' + pick1(WRONG), 2.2); return; }
      addGold(5); tone(98, 0.08, 0.8, 'sawtooth'); tone(73, 0.06, 1.0, 'sawtooth', 0.3); toast('FOUND IT \u00b7 FLAT 9' + LET[i] + ' \u00b7 THE TUBA STOPS', 2.2); J.ci++; J.beat = 2.5; J.prevD = null; J.hc = '';
      if (J.ci >= J.list.length) { addGold(6); if (J.t0 < 90) addGold(10); setTimeout(finishGame, 900); } else setTimeout(() => toast('PARP! IT STARTED AGAIN \u00b7 SOMEWHERE ELSE', 2.2), 2400); },
    tick(dt) { J.t0 += dt; ARW.style.display = 'none'; const c = J.list[J.ci]; if (!c || !lastP) return; const onF = inFloor(lastP), p = toF(lastP), [dx, dz] = this.dpos(c.d), d = Math.hypot(p.x - dx, p.z - dz), lv = clamp(1 - d / 16, 0, 1);
      J.beat -= dt; if (J.beat <= 0 && onF) { J.beat = 1.0; const k = 0.008 + 0.1 * lv * lv, nt = [98, 110, 87, 131][Math.floor(J.t0) % 4]; tone(nt, k, 0.45, 'sawtooth'); tone(nt * 2, k * 0.3, 0.3, 'square'); }
      if ((J.hcT -= dt) <= 0) { J.hcT = 0.8; if (J.prevD != null) J.hc = d < J.prevD - 0.4 ? 'HOTTER' : d > J.prevD + 0.4 ? 'COLDER' : J.hc; J.prevD = d; }
      const tried = c.tried.map(i => '9' + LET[i]).join(' \u00b7 ');
      setCard('tb' + J.ci + (onF ? Math.round(lv * 20) : 'x') + J.hc + c.tried.length, head('FIND THE TUBA \u00b7 ' + Math.min(J.ci + 1, TBN) + ' / ' + TBN, goldR()) + '<div style="padding:8px 10px;font-size:13px;font-weight:900">'
        + (onF ? 'TUBA LOUDNESS<div style="height:10px;background:#e7e4dc;margin-top:4px"><div style="height:10px;width:' + Math.round(lv * 100) + '%;background:' + (lv > 0.8 ? RED : '#e07a1f') + '"></div></div>' + (J.hc ? '<div style="margin-top:4px;color:' + (J.hc === 'HOTTER' ? RED : NAVY) + '">' + J.hc + '</div>' : '') : 'BACK UP TO FLOOR 9')
        + (tried ? '<div style="margin-top:4px;font-size:11px">NOT HERE \u00b7 ' + tried + '</div>' : '') + '</div>' + foot('KNOCK ON A DOOR (E)')); } };
  // ---------- 4 SOUNDPROOF A WALL: noise pulses through some patches of the thin wall; foam only the noisy ones (foam = noisy + 1); 3 rounds ----------
  const WLT = 16, WC = 6, WR = 4, NOISES = ['THUMP', 'PARP', 'SNORE', 'BANG', 'YAP', 'HUM'];
  GD.wall = { F: true, shot: () => [toW(-2.4, 1.4, 3.6, true), 2.4, 2.4, 0.12, 2.2, 0, 5],
    begin() { goRoom(-2.4, 4.7, Math.PI, true); J.list = [3, 4, 5].map(n => ({ noisy: new Set(pickN([...Array(WC * WR).keys()], n)), foam: new Set(), left: n + 1 })); J.ci = 0; J.cueT = WLT; J.wait = 0.3; J.pt = 0.4; J.on = new Map(); J.onT = 0; snapK = true; this.draw(); },
    open(c) { return [...c.noisy].filter(k => !c.foam.has(k)); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('SOUNDPROOF THE WALL \u00b7 ' + nOf(), goldR()) + body(c ? '<div data-foam style="font-size:15px;font-weight:900"></div>' + timeRow + '<div style="display:grid;grid-template-columns:repeat(' + WC + ',minmax(0,1fr));grid-auto-rows:minmax(48px,1fr);gap:4px;flex:1;min-height:0">'
        + [...Array(WC * WR).keys()].map(k => '<button data-c="' + k + '" style="' + BTN + ';min-height:48px;padding:2px 4px;font-size:11px"></button>').join('') + '</div>' : doneMsg('NOT A PEEP')) + tipBar('WATCH WHERE THE NOISE COMES THROUGH \u00b7 TAP IT TO FOAM IT'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.tap(+b.dataset.c, b); }); this.paint(); },
    paint() { const c = J.list[J.ci]; if (!c) return; PANEL.querySelectorAll('[data-c]').forEach(b => { const k = +b.dataset.c, f = c.foam.has(k), on = J.on.get(k); b.style.background = f ? (c.noisy.has(k) ? '#c9b36a' : CREAM) : on ? YEL : '#fff'; b.textContent = f ? 'FOAM' : on || ''; });
      const fl = PANEL.querySelector('[data-foam]'); if (fl) fl.textContent = 'FOAM LEFT ' + c.left + ' \u00b7 NOISY PATCHES ' + this.open(c).length; },
    tap(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.foam.has(k) || c.left <= 0) return; J.idle = 0; c.left--; c.foam.add(k);
      if (c.noisy.has(k)) tone(260, 0.05, 0.15, 'triangle'); else { missOne('WASTED FOAM \u00b7 THAT PATCH WAS QUIET'); shake(el); }
      const rest = this.open(c).length; this.paint();
      if (!rest) { addGold(4); ding(); okTip('NOT A PEEP THROUGH THAT WALL'); J.wait = 0.9; setTimeout(() => this.next(), 800); return; }
      if (c.left < rest) { missOne('OUT OF FOAM \u00b7 THE NOISE GETS THROUGH'); J.wait = 1.0; setTimeout(() => this.next(), 900); } },
    next() { J.on = new Map(); roundNext(this, 'wall', WLT); },
    tick(dt) { const c = J.list[J.ci]; if (c && J.wait <= 0) { J.pt -= dt; if (J.pt <= 0) { J.pt = 1.3; const o = this.open(c); J.on = new Map(); for (const k of o) if (Math.random() < 0.55) J.on.set(k, pick1(NOISES)); if (!J.on.size && o.length) J.on.set(pick1(o), pick1(NOISES)); J.onT = 0.7; tone(80, 0.05, 0.12, 'square'); this.paint(); }
        if (J.onT > 0 && (J.onT -= dt) <= 0) { J.on = new Map(); this.paint(); } }
      roundTick(this, dt, WLT, 'TOO SLOW \u00b7 MR. HUSH BANGS ON THE WALL', () => { const o = c ? this.open(c) : []; return o.length ? '[data-c="' + o[0] + '"]' : null; }); } };
  // ---------- 5 WIPE THE LAKE WINDOWS: drag the fog off 3 panes; tap the gulls before they peck a fresh smudge ----------
  const WPT = 25, FW = 32, FH = 18, PANES = ['THE LOUNGE WINDOW', 'THE BIG PANE', 'THE TELESCOPE PANE'];
  GD.wipe = { F: true, shot: () => [toW(4.7, 1.9, -9.7, true), 5.2, 2.8, 0.08, 2.6, 0, 7],
    begin() { goRoom(2.6, -8.4, Math.PI, true); J.list = PANES.map(n => ({ n, fog: new Float32Array(FW * FH).fill(1), gulls: [], gt: 1.6, left: 1 })); J.ci = 0; J.cueT = WPT; J.wait = 0.4; J.down = null; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; showPanel(panelHead((c ? 'WIPE ' + c.n : 'WIPE THE LAKE WINDOWS') + ' \u00b7 ' + nOf(), goldR()) + body(c ? '<canvas data-cv style="width:100%;flex:1;min-height:140px;display:block;touch-action:none"></canvas>' + timeRow : doneMsg('YOU CAN SEE THE LAKE')) + tipBar('WIPE OFF THE FOG \u00b7 TAP A GULL BEFORE IT PECKS THE GLASS'));
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { const p = this.uv(cv, e); J.down = this.shoo(p) ? null : p; if (J.down) this.wipe(p, p); }, e => { const p = this.uv(cv, e); if (J.down) this.wipe(J.down, p); if (J) J.down = p; }); },
    uv(cv, e) { const r = cv.getBoundingClientRect(); return { u: (e.clientX - r.left) / r.width, v: (e.clientY - r.top) / r.height }; },
    shoo(p) { const c = J.list[J.ci]; if (!c || J.wait > 0) return false; const i = c.gulls.findIndex(q => Math.abs(q.x - p.u) < 0.08 && Math.abs(q.y - p.v) < 0.12); if (i < 0) return false; c.gulls.splice(i, 1); J.idle = 0; tone(1500, 0.04, 0.1, 'square'); tone(1100, 0.03, 0.1, 'square', 0.08); addGold(1); okTip('SHOO! THE GULL FLAPS OFF'); return true; },
    wipe(a, b) { const c = J.list[J.ci]; if (!c || J.wait > 0 || !a) return; J.idle = 0; const ax = a.u * FW, ay = a.v * FH, bx = b.u * FW, by = b.v * FH, n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / 0.5));
      for (let s = 0; s <= n; s++) { const x = ax + (bx - ax) * s / n, y = ay + (by - ay) * s / n; for (let j = Math.max(0, Math.floor(y - 2.2)); j <= Math.min(FH - 1, Math.ceil(y + 2.2)); j++) for (let i = Math.max(0, Math.floor(x - 2.2)); i <= Math.min(FW - 1, Math.ceil(x + 2.2)); i++) { const d = Math.hypot(i + 0.5 - x, j + 0.5 - y); if (d < 2.2) c.fog[j * FW + i] = Math.max(0, c.fog[j * FW + i] - 0.35 * (1 - d / 2.2)); } }
      let sum = 0; for (let k = 0; k < c.fog.length; k++) sum += c.fog[k]; c.left = sum / c.fog.length;
      if (c.left < 0.08) { addGold(4); ding(); okTip(c.n + ' \u00b7 CLEAR AS THE LAKE'); J.wait = 0.9; J.down = null; c.gulls = []; setTimeout(() => this.next(), 700); } },
    next() { J.down = null; roundNext(this, 'wipe', WPT); },
    tick(dt) { const c = J.list[J.ci];
      if (c && J.wait <= 0) { c.gt -= dt; if (c.gt <= 0) { c.gt = Math.max(1.4, 2.8 - J.ci * 0.5) + Math.random() * 1.4; if (c.gulls.length < 2) { const T = 2.4 - J.ci * 0.2; c.gulls.push({ x: rnd(0.12, 0.88), y: rnd(0.3, 0.8), t: T, T }); tone(1200, 0.03, 0.15, 'sawtooth'); } }
        for (let i = c.gulls.length - 1; i >= 0; i--) { const q = c.gulls[i]; q.t -= dt; if (q.t <= 0) { c.gulls.splice(i, 1); const gx = q.x * FW, gy = q.y * FH; for (let j = 0; j < FH; j++) for (let k = 0; k < FW; k++) if (Math.hypot(k + 0.5 - gx, j + 0.5 - gy) < 3.2) c.fog[j * FW + k] = 1; missOne('THE GULL PECKED \u00b7 A FRESH SMUDGE'); } } }
      roundTick(this, dt, WPT, 'TOO SLOW \u00b7 THE FOG ROLLS BACK IN', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f;
      if (!this.bg || this.bg.width !== Math.round(w) || this.bg.height !== Math.round(h)) { this.bg = document.createElement('canvas'); this.bg.width = Math.max(1, Math.round(w)); this.bg.height = Math.max(1, Math.round(h)); lakeArt(this.bg.getContext('2d'), this.bg.width, this.bg.height); }
      g.drawImage(this.bg, 0, 0, w, h); const cw = w / FW, ch = h / FH; for (let j = 0; j < FH; j++) for (let i = 0; i < FW; i++) { const a = c.fog[j * FW + i]; if (a > 0.02) { g.fillStyle = 'rgba(222,228,234,' + (a * 0.94).toFixed(2) + ')'; g.fillRect(i * cw, j * ch, cw + 1, ch + 1); } }
      g.fillStyle = STEEL; g.fillRect(w / 2 - 4, 0, 8, h); g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h);
      for (const q of c.gulls) { const x = q.x * w, y = q.y * h, s = Math.min(w, h) * 0.07, peck = Math.sin(performance.now() / 90) > 0.3; g.fillStyle = PAPER; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, s, s * 0.6, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.arc(x + s * 0.7, y - s * 0.5, s * 0.38, 0, 7); g.fill(); g.stroke();
        g.fillStyle = '#e07a1f'; g.fillRect(x + s * 1.0, y - s * (peck ? 0.4 : 0.55), s * 0.5, s * 0.16); g.fillStyle = STEEL; g.fillRect(x - s * 0.8, y - s * 0.2, s * 1.1, s * 0.3); g.fillStyle = INK; g.fillRect(x + s * 0.75, y - s * 0.62, 3, 3);
        g.strokeStyle = RED; g.lineWidth = 3; g.beginPath(); g.arc(x, y, s * 1.5, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(q.t / q.T, 0, 1)); g.stroke(); }
      g.fillStyle = INK; g.fillRect(0, h - 26, 130, 26); g.fillStyle = YEL; g.font = '900 14px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('FOG ' + Math.round(c.left * 100) + ' %', 12, h - 8); } };
  // ---------- 6 SHOW THE CUPBOARD FLAT: prove the new tenant's furniture fits FLAT 9½ (4 x 5 squares, keep the door square clear); 3 tenants ----------
  const CBT = 30, CW = 4, CH = 5, DOORC = 16;
  const PCS = { BED: [2, 3, NAVY], WARDROBE: [1, 2, OAK], DESK: [2, 1, DKW], 'TUBA CASE': [1, 2, '#b08a3a'], PLANT: [1, 1, LEAF], SOFA: [3, 1, '#7a1d2a'], BOOKCASE: [1, 3, DKW], LAMP: [1, 1, '#c99a2a'], BATH: [2, 2, LAKE], STOOL: [1, 1, OAK] };
  const CB_R = [['BED', 'WARDROBE', 'DESK', 'TUBA CASE', 'PLANT'], ['BED', 'BOOKCASE', 'DESK', 'LAMP', 'SOFA', 'PLANT'], ['BED', 'BATH', 'SOFA', 'TUBA CASE', 'STOOL', 'LAMP']];
  GD.cupboard = { F: true, shot: () => [toW(1.4, 1.3, 3.6, true), 2.2, 2.4, 0.12, 2.2, 0, 5],
    begin() { goRoom(1.4, 4.7, Math.PI, true); J.list = CB_R.map(names => ({ names, i: 0, rot: false, grid: Array(CW * CH).fill(null) })); J.ci = 0; J.cueT = CBT; J.wait = 0.3; snapK = true; this.draw(); },
    dims(c) { const p = PCS[c.names[c.i]]; return c.rot ? [p[1], p[0]] : [p[0], p[1]]; },
    fits(c, x, y, wd, ht) { if (x + wd > CW || y + ht > CH) return false; for (let j = y; j < y + ht; j++) for (let i = x; i < x + wd; i++) { const k = j * CW + i; if (k === DOORC || c.grid[k]) return false; } return true; },
    draw() { const c = J.list[J.ci];
      if (!c) { showPanel(panelHead('SHOW THE CUPBOARD FLAT', goldR()) + body(doneMsg('IT ALL FITS. JUST.')) + tipBar('THREE TENANTS SIGNED')); return; }
      const nm = c.names[c.i], dd = nm ? this.dims(c) : [0, 0], wd = dd[0], ht = dd[1], p = nm && PCS[nm];
      const shape = nm ? '<div style="display:grid;grid-template-columns:repeat(' + wd + ',16px);gap:2px;flex:none">' + Array(wd * ht).fill('<div style="width:16px;height:16px;background:' + p[2] + ';border:1px solid #201e1d"></div>').join('') + '</div>' : '';
      const cells = c.grid.map((v, k) => { const isD = k === DOORC, bg = isD ? INK : v ? PCS[v][2] : '#fff', fg = isD ? YEL : v ? '#fff' : INK; return '<button data-c="' + k + '" style="' + BTN + ';min-height:44px;padding:2px 4px;font-size:10px;background:' + bg + ';color:' + fg + '">' + (isD ? 'DOOR' : v || '') + '</button>'; }).join('');
      const side = '<div style="display:flex;flex-direction:column;gap:6px;flex:none;' + (wide() ? 'width:42%' : '') + '"><div style="display:flex;align-items:center;gap:10px;font-size:15px;font-weight:900;border:2px solid #201e1d;background:#fff;padding:8px">' + shape + '<span>' + (nm ? nm + ' \u00b7 ' + (c.i + 1) + ' / ' + c.names.length : 'ALL IN') + '</span></div>'
        + '<div style="display:flex;gap:6px"><button data-rot style="' + BTN + ';flex:1">ROTATE</button><button data-clr style="' + BTN + ';flex:1">START OVER</button></div></div>';
      const grid = '<div style="display:grid;grid-template-columns:repeat(' + CW + ',minmax(0,1fr));grid-auto-rows:minmax(44px,1fr);gap:3px;flex:1;' + (wide() ? 'min-height:0' : 'min-height:250px') + '">' + cells + '</div>';
      showPanel(panelHead('SHOW THE CUPBOARD FLAT \u00b7 TENANT ' + nOf(), goldR()) + body(timeRow + (wide() ? '<div style="display:flex;gap:10px;flex:1;min-height:0">' + grid + side + '</div>' : side + grid)) + tipBar('TAP THE TOP-LEFT SQUARE FOR EACH PIECE \u00b7 KEEP THE DOOR CLEAR'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.place(+b.dataset.c, b); }); const r = PANEL.querySelector('[data-rot]'), cl = PANEL.querySelector('[data-clr]');
      if (r) r.onclick = () => { c.rot = !c.rot; J.idle = 0; blip(); this.draw(); }; if (cl) cl.onclick = () => { if (J.wait > 0) return; c.grid.fill(null); c.i = 0; c.rot = false; this.draw(); missOne('START OVER \u00b7 THE TENANT SIGHS'); }; },
    place(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.i >= c.names.length) return; J.idle = 0; const dd = this.dims(c), x = k % CW, y = Math.floor(k / CW);
      if (!this.fits(c, x, y, dd[0], dd[1])) { missOne('IT DOES NOT FIT THERE \u00b7 TRY ROTATE'); shake(el); return; }
      const nm = c.names[c.i]; for (let j = y; j < y + dd[1]; j++) for (let i = x; i < x + dd[0]; i++) c.grid[j * CW + i] = nm; c.i++; c.rot = false; tone(420, 0.05, 0.12, 'triangle');
      if (c.i >= c.names.length) { addGold(4); ding(); this.draw(); okTip('EVERYTHING FITS \u00b7 THE TENANT SIGNS'); J.wait = 0.9; setTimeout(() => this.next(), 900); return; } this.draw(); },
    hintCell() { const c = J.list[J.ci]; if (!c || c.i >= c.names.length) return null; const dd = this.dims(c); for (let k = 0; k < CW * CH; k++) if (this.fits(c, k % CW, Math.floor(k / CW), dd[0], dd[1])) return '[data-c="' + k + '"]'; return '[data-rot]'; },
    next() { roundNext(this, 'cupboard', CBT); },
    tick(dt) { roundTick(this, dt, CBT, 'TOO SLOW \u00b7 THE TENANT WALKS OFF', () => this.hintCell()); } };
  // ================= PRIZES (building-themed) =================
  const SUIT = { outfit: 'coat', torso: ['#2e4a6b', '#f3f2f2', '#9fc4e0'], name: 'LAKESIDE PEACOAT' };
  const GIFT = { suit: 'A LAKESIDE PEACOAT. Warm, navy, slightly damp. The Tailor has a copy.', half: 'Three jobs. FLAT 9G is half price now. Do not tell floor nine.', trophy: 'All six. The GOLDEN TUBA, 60 gold, and FLAT 9G rent free. Got a minute?' };
  function giveGift() { save.setStat('lkpClears', save.stat('lkpClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('lkpSuit', false)) { save.setStat('lkpSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 3 && !save.stat('lkpHalf', false)) { save.setStat('lkpHalf', true); return 'half'; }
    if (nd >= GAMES.length && !save.stat('lkpAll', false)) { save.setStat('lkpAll', true); save.give('goldTuba'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function bellCheck(then) { if (!allThree() || save.stat('lkpBell', false)) { then && then(); return false; } save.setStat('lkpBell', true); save.addRelic('tuesdayBell'); bell.visible = true; ding();
    sayTo(T_MG, [mgLn('Three stars on every job. Take THE TUESDAY BELL. It rings once a week. Guess when.')], () => { toast('RELIC \u00b7 THE TUESDAY BELL', 2.6); then && then(); }); return true; }
  // ================= FLAT 9G: rent per game week (lake view costs extra), sleep, chest, trophy shelf =================
  const free = () => !!save.stat('lkpAll', false), price = () => (free() ? 0 : save.stat('lkpHalf', false) ? 25 : 50);
  const rented = () => free() || save.stat('lkpRentTo', 0) >= today(), daysLeft = () => Math.max(0, save.stat('lkpRentTo', 0) - today() + 1);
  function rentFlat() { const p = price(); if (p > 0 && !save.spend(p)) { sayTo(T_MG, [mgLn(p + ' gold a week. The lake view is not cheap. Come back richer.')]); return; }
    coin(); const from = Math.max(today(), save.stat('lkpRentTo', 0) + 1); save.setStat('lkpRentTo', from + 6); if (!save.count('laptKey')) save.give('laptKey'); drawSign();
    sayTo(T_MG, [mgLn((save.stat('lkpRented', 0) ? 'Renewed. Seven more days of lake. ' : 'FLAT 9G is yours for the week. Key. ') + 'Lift on the left, floor nine.')]); save.setStat('lkpRented', save.stat('lkpRented', 0) + 1); }
  function flatMenu() { const r = rented(), ch = [];
    if (free()) ch.push({ text: 'THANK YOU FOR THE FREE FLAT', pick: () => sayTo(T_MG, [mgLn('You earned it. Keep the window shut at night. Gulls.')]) });
    else ch.push({ text: (r ? 'RENEW \u00b7 +7 DAYS \u00b7 ' : 'RENT FLAT 9G \u00b7 ') + price() + ' G A WEEK', pick: rentFlat });
    ch.push({ text: 'WHAT DOES THE FLAT HAVE?', pick: () => sayTo(T_MG, [mgLn('A bed, a chest, a trophy shelf, and the lake. The lake is the extra.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(T_MG, [{ ...mgLn(free() ? 'FLAT 9G is yours, rent free, for good.' : r ? 'FLAT 9G is yours for ' + daysLeft() + ' more day' + (daysLeft() === 1 ? '' : 's') + '. Renew any time.' : 'FLAT 9G, floor nine. Lake view. ' + price() + ' gold a week.'), choices: ch }]); }
  const lab = id => (ITEM_LABELS[id] || String(id).replace(/([A-Z])/g, ' $1')).toUpperCase(), chestIn = () => save.stat('lkpChest', null) || {};
  const T_CH = () => ({ key: 'laptChest', name: 'YOUR CHEST', role: 'FLAT 9G', obj: FG, r: 3 }), chLn = ln('YOUR CHEST', 'FLAT 9G');
  function chest() { const bag = Object.entries((save.data && save.data.items) || {}).filter(q => q[1] > 0 && q[0] !== 'laptKey').sort((a, b) => b[1] - a[1]).slice(0, 5), box2 = Object.entries(chestIn()).filter(q => q[1] > 0).slice(0, 5);
    const ch = [...bag.map(([id, n]) => ({ text: 'STORE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { if (!save.take(id, n)) return; const L = { ...chestIn() }; L[id] = (L[id] || 0) + n; save.setStat('lkpChest', L); tone(330, 0.05, 0.2); toast('STORED \u00b7 ' + lab(id), 2); drawShelf(); } })),
      ...box2.map(([id, n]) => ({ text: 'TAKE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { const L = { ...chestIn() }; delete L[id]; save.setStat('lkpChest', L); save.give(id, n); tone(440, 0.05, 0.2); toast('TAKEN \u00b7 ' + lab(id), 2); drawShelf(); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(T_CH(), [{ ...chLn(box2.length ? 'Your chest. ' + box2.length + ' kind' + (box2.length > 1 ? 's' : '') + ' of thing inside. Slightly damp.' : 'Your chest. Empty. Store what you like.'), choices: ch }]); }
  function sleepHere() { fade(() => { const d = sleep(); heal(9999); window.__m2yawn = 1;   /* s627: wake up with a yawn + stretch */ goRoom(-7.8, -5.6, Math.PI, true); toast('GOOD MORNING \u00b7 DAY ' + (d || today()) + ' \u00b7 ' + DAYS[dayIx()] + ' \u00b7 FULL HEALTH', 3); drawSign(); drawDay(); }); }
  function useItem(id) { if (id === 'goldTuba' && save.count('goldTuba')) { tone(98, 0.06, 0.8, 'sawtooth'); toast('THE GOLDEN TUBA \u00b7 SIX FOR SIX AT LAKESIDE \u00b7 NOT AT MIDNIGHT', 2.4); return true; }
    if (id === 'laptKey' && save.count('laptKey')) { toast(rented() ? 'FLAT 9G KEY \u00b7 ' + (free() ? 'RENT FREE' : daysLeft() + ' DAYS LEFT') : 'FLAT 9G KEY \u00b7 THE RENT RAN OUT \u00b7 SEE THE MANAGER', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { lift: 'The lift only works on Tuesdays. Pull the lever on Tuesday, six times. Then it thinks every day is.',
    drips: 'The lake leaks through the ceiling again. Catch every drip in the bucket. The mop quit.',
    tuba: 'Someone on this floor plays the tuba. Follow the sound and knock on the right door. Please.',
    wall: 'These walls are paper. Watch where the noise comes through and foam it. Foam is not free.',
    wipe: 'The lake fog sticks to the windows. Wipe it off. Shoo the gulls before they peck.',
    cupboard: 'A tenant wants the cupboard flat. Prove their furniture fits. Keep the door clear.' };
  const DONE = { lift: 'It hums. It thinks it is Tuesday. Nobody tell it.', drips: 'A dry carpet. First time this year.', tuba: 'The tuba is found. Three times. It will be back.', wall: 'Quiet. I can hear myself sigh.', wipe: 'Clear glass. You can see the lake. And the gulls can see us.', cupboard: 'Signed. They think it is cosy. It is a cupboard.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const nextF = () => { const d = done(), f = GAMES.filter(q => q.F), n = f.find(q => !d[q.k]); return (n || f.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const inLobby = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inFloor = P => !!P && Math.abs(P.x - FOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const T = inFloor(lastP) && GN[g].F ? T_HU : T_MG; sayTo(T, [(T === T_HU ? huLn : mgLn)(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('lkpVisits', save.stat('lkpVisits', 0) + 1); J = { g, miss: 0, gold: 0, t: 0, F: !!GN[g].F }; busy = GD[g].errand ? 'errand' : 'job'; ding(); fade(() => GD[g].begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('lkpDone', d); save.setStat('lkpLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none'; drawDay(); foamG.visible = !!done().wall;
    const say = () => { const L1 = [mgLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(mgLn(GIFT[gift])); K.finish(g, stars, gold, first); drawSign(); for (let k = 0; k < 4; k++) tone(1200 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T_MG, L1, () => { if (busy === 'end') { busy = null; J = null; } bellCheck(); }); };
    fade(() => { cleanup(); goRoom(0, -4.4, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; } hidePanel(); hideCard(); ARW.style.display = 'none'; keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2]; }
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
  const nearMg = p => nearL(p, 0, -5, 2.4), atLiftL = p => nearL(p, LLIFT[0], LLIFT[1], 1.6), atLiftF = p => nearL(p, 0, 9.0, 1.2), nearHu = p => nearL(p, HU0[0] - 1.2, HU0[1], 1.6);
  const doorAt = p => DOORS.findIndex(([x, z, s]) => nearL(p, s ? x + s * 1.0 : x, s ? z : z - 1.0, 1.1)), atFlatDoor = p => nearL(p, -5.3, 4.6, 1.1), spotAt = p => Object.keys(SPOTS).find(k => nearL(p, SPOTS[k][0], SPOTS[k][1], 0.9));
  const sceneReady = () => save.stat('lkpAll', false) && !save.stat('lkpScene', false);
  function prompt(P) {
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) return 'LIFT \u00b7 UP TO FLOOR 9'; return null; }
      if (inFloor(P)) { const p = toF(P); if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY'; const d = doorAt(p); if (d >= 0) return 'KNOCK \u00b7 FLAT 9' + LET[d]; } return null; }
    if (busy) return null;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftL(p)) return 'LIFT \u00b7 FLOOR 9 \u00b7 FLATS + LAKE LOUNGE';
      if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearMg(p)) return sceneReady() ? 'TALK \u00b7 BUILDING MANAGER \u00b7 A WORD' : 'TALK \u00b7 BUILDING MANAGER'; return null; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY';
      if (atFlatDoor(p) && !rented()) return 'FLAT 9G \u00b7 FOR RENT \u00b7 SEE THE MANAGER'; const s = spotAt(p); if (s && rented()) return s === 'bed' ? 'BED \u00b7 SLEEP TILL MORNING' : s === 'chest' ? 'YOUR CHEST \u00b7 STORE + TAKE' : 'TROPHY SHELF';
      if (nearHu(p)) return 'TALK \u00b7 MR. HUSH'; return null; }
    return null; }
  let talkM = save.stat('lkpTalked', 0), talkH = 0;
  const MG_HI = ['Back again. The lift says hello. It does not mean it.', 'Floor nine played the tuba till three. I counted every note.', 'The lake is lovely. The leaks are also the lake.'];
  function mMenu() { const first = !talkM; talkM++; save.setStat('lkpTalked', talkM); if (bellCheck()) return;
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) }, { text: 'PICK A JOB', pick: () => sayTo(T_MG, [{ ...mgLn('Which one? The tuba, the walls, the windows and the cupboard are up on nine.'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase() + (q.F ? ' \u00b7 FLOOR 9' : ''), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'YOUR FLAT \u00b7 FLAT 9G', pick: flatMenu }];
    if (sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneLift() });
    ch.push({ text: 'WHY ONLY TUESDAYS?', pick: () => sayTo(T_MG, [mgLn('Nobody knows. The Salt family owns the building. Nobody asks them either.')]) });
    if (save.stat('lkpScene', false)) ch.push({ text: 'THE CRATES?', pick: () => sayTo(T_MG, [mgLn('Still going down the shaft at night. Still not asking. Still fixing leaks.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_MG, [mgLn('Goodbye. Mind the puddle.')]) });
    sayTo(T_MG, [{ ...mgLn(first ? 'Lakeside Apartments. Six jobs, one flat with a lake view. The lift is your first problem.' : sceneReady() ? 'Six for six. I owe you the truth. Got a minute?' : MG_HI[(talkM - 2) % MG_HI.length]), choices: ch }]); }
  function sceneLift() { busy = 'scene'; save.setStat('lkpScene', true);
    const end = () => { busy = null; save.setStat('storyLakeLift', true); toast('STORY \u00b7 SALT CRATES RIDE THE LIFT', 2.6); bellCheck(); };
    sayTo(T_MG, [mgLn('You fixed what nobody fixes. So here is the truth about the lift.'), { ...mgLn('It is not broken. Salt men switch it off and lower crates down the shaft to the lake.'), choices: [
      { text: 'WHAT IS IN THE CRATES?', pick: () => sayTo(T_MG, [mgLn('Heavy things. Wet things. I do not ask. I fix leaks.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T_MG, [mgLn('Quietly, please. The walls here are very thin.')], end) }] }]); }
  const HU_LINES = ['Shh. Hear that? The tuba. Or my neighbour. Or both.', 'I can hear 9C brushing his teeth. Every night. Both rows.', 'Lake views are lovely. Lake sounds are not. The gulls argue.', 'Foam my wall and I will owe you. Quietly.'];
  function hMenu() { talkH++; sayTo(T_HU, [{ ...huLn(HU_LINES[(talkH - 1) % HU_LINES.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextF()) }, { text: 'WHO PLAYS THE TUBA?', pick: () => sayTo(T_HU, [huLn('Nobody admits it. It moves flat to flat. A tuba ghost.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const upLift = () => { liftDing(); if (!liftFixed() && !isTue()) setTimeout(() => toast('THE LIFT GROANS \u00b7 IT IS ' + DAYS[dayIx()] + ' \u00b7 UP IT GOES ANYWAY', 2.4), 400); fade(() => goRoom(0, 7.6, Math.PI, true)); setTimeout(() => KF.chime(), 500); };
  const downLift = () => { liftDing(); fade(() => go(OX + LLIFT[0] + 0.6, LY, LZ + LLIFT[1], Math.PI / 2)); };
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true;
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) { upLift(); return true; } return false; }
      if (inFloor(P)) { const p = toF(P); if (atLiftF(p)) { downLift(); return true; } const d = doorAt(p); if (d >= 0) { GD.tuba.knockAt(d); return true; } } return false; }
    if (busy) return false;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) { startGame(r.k); return true; } if (atLiftL(p)) { upLift(); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; } if (nearMg(p)) { tone(1320, 0.05, 0.5); mMenu(); return true; } return false; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) { startGame(r.k); return true; } if (atLiftF(p)) { downLift(); return true; }
      if (atFlatDoor(p) && !rented()) { toast('FLAT 9G \u00b7 ' + price() + ' G A WEEK \u00b7 SEE THE MANAGER IN THE LOBBY', 2.6); return true; }
      const s = spotAt(p); if (s && rented()) { if (s === 'bed') sleepHere(); else if (s === 'chest') chest(); else { const n = GOLDS().length; toast(n ? 'TROPHY SHELF \u00b7 ' + n + ' GOLDEN PRIZE' + (n > 1 ? 'S' : '') : 'TROPHY SHELF \u00b7 EMPTY \u00b7 WIN SOME GOLD', 2.4); } return true; }
      if (nearHu(p)) { tone(1320, 0.05, 0.5); hMenu(); return true; } return false; }
    return false; }
  // ================= per frame =================
  const WALL_LINES = ['WHO ATE MY CHEESE?', 'IS IT TUESDAY YET?', 'THE GULL IS BACK!', 'PARP. PARP. PAAARP.', 'I CAN HEAR YOU WALKING.', 'TURN THAT TUBA DOWN!'];
  let dayCheck = 0, amb = 8, spawned = !/[?&]spawn=(lakeapts|lakefloor)(&|$)/.test(location.search), spawnT = 0, wasR = null;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; const f = /spawn=lakefloor/.test(location.search); goRoom(0, 7.6, Math.PI, f); }
    const inL = inLobby(P), inF = inFloor(P); G.visible = inL || (busy === 'job' && !!J && !J.F); FG.visible = inF || (busy === 'job' && !!J && J.F);
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; const r = rented(); if (r !== wasR) { wasR = r; doorM.visible = !r; doorCol.y0 = r ? 999 : LY - 3; drawSign(); }
      if (inL) { drawDay(); tuba.visible = !!save.stat('lkpAll', false); bell.visible = !!save.stat('lkpBell', false); }
      if (inF) { drawShelf(); foamG.visible = !!done().wall; const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); const tint = n ? '#3a4a78' : dusk ? '#f0c8a0' : '#ffffff'; winM.color.set(tint); viewM.color.set(tint); gullM.opacity = n ? 0 : 1; } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('lakeside apts job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; if (!busy) m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
    for (const k in spotMeshes) spotMeshes[k].visible = !busy && rented();
    if (G.visible) { bell.rotation.z = Math.sin(t * 1.4) * 0.15; dripT += dt; const q = dripT % 1.7; if (q < 0.5) { drip.position.y = 3.4; dripHit = false; } else { drip.position.y = Math.max(0.42, 3.4 - 4.9 * (q - 0.5) * (q - 0.5)); if (drip.position.y <= 0.42 && !dripHit) { dripHit = true; if (inL && !busy) tone(2200, 0.012, 0.08); } } drip.visible = drip.position.y > 0.42; }
    if (FG.visible) { const p = toF(P); kit.animFox(hush, dt, 0, false); if (!busy && nearL(p, hush.position.x, hush.position.z, 3.5)) turnTo(hush, Math.atan2(p.x - hush.position.x, p.z - hush.position.z), dt, 3); else { turnTo(hush, HU0[2], dt, 2); armUp(hush, 0, 2.6 + Math.sin(t * 1.3) * 0.1, 0); }
      GULLS.forEach((m, i) => { m.position.y = 0.86 + Math.abs(Math.sin(t * 1.7 + i * 2)) * 0.05; m.position.x = (i ? 7.8 : 1.6) + Math.sin(t * 0.3 + i) * 0.4; });
      if (inF && !busy && (amb -= dt) <= 0) { const quiet = !!done().wall; amb = (quiet ? 50 : 24) + Math.random() * 14; tone(70, 0.05, 0.12, 'square'); tone(70, 0.05, 0.12, 'square', 0.2); toast((quiet ? '(MUFFLED) ' : '(THROUGH THE WALL) ') + pick1(WALL_LINES), 2.4); } }
    K.tick(dt, toL(P), { inShop: inL, busy: !!busy, near: 0, talking: false, clear: endClear > 0 ? [0, -4.4, 2.6] : null });
    KF.tick(dt, toF(P), { inShop: inF, busy: !!busy, near: 0, talking: false }); }
  drawShelf(); drawDay();
  const API = { group: G, floor: FG, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading, rented: rented(), price: price(), day: DAYS[dayIx()] }),
    spawn: { lakeapts: [OX, LZ + 7.6, Math.PI, LY], lakefloor: [FOX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), scene: sceneLift, up: upLift, down: downLift, rent: rentFlat, keeper, hush,
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    _view(p, l, F = false, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p, F)); c.lookAt(toW(...l, F)); c.updateMatrixWorld(); return c; },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); KF.dispose(); } };
  window.__lakeApts = API; return API;
}
