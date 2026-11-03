// MERU 2.0 — s146 SPIRE APARTMENTS [meruSpireApts] (cluster apartments 3 of 4; Ben's picks s143/s144: jobs unique to this building, all 6 ideas ·
// LIFT → FLOOR 12 (new room) with FLAT 12G for rent (pay per game week at the manager) · flat = SLEEP + STORAGE CHEST + TROPHY SHELF ·
// prizes: FLEET COVERALLS (1st clear, Tailor) · HALF RENT (3 jobs) · GOLDEN SPANNER + 60 G + FREE RENT (all 6) + the manager's VAX BOTS scene · relic THE HUMMING COIL (3 stars on all)).
// LOBBY jobs: TUNE OUT THE HUM · RESET THE FUSE BOX · SORT THE ROBOT PARTS MAIL. FLOOR 12 jobs: NIGHT WATCH WITH A GUARD BOT (walk) · OIL THE TENANTS' DOORS · CHARGE THE BOTS.
// Made from worlds/meru2-lakeapts.js (same kit). Stats prefix spa.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { ITEM_LABELS } from './meru-shops.js';
export function buildSpireApts({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, clusters, go, heal = () => {}, sleep = () => 1 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'spireApts'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, OX = LR.ox, RH = 4.4;
  const SR = clusters.addRoom({ key: 'spireFloor', room: 'meruSpireApts', title: 'SPIRE APARTMENTS \u00b7 FLOOR 12' }, RH); SR.out = LR.out; const FOX = SR.ox;
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', SLATE = '#334155', GUN = '#5b6570', GLOW = '#3fd3ff', GOLD = '#d7ad52', OAK = '#a77b4f', DKW = '#5a3d26', COPPER = '#b8733a', LEAF = '#4f8a3a', ACC = SLATE;
  const rectL = (a, b, c, d, F) => { const o = { f: [(F ? FOX : OX) + a, (F ? FOX : OX) + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }; cols.push(o); return o; }, circL = (x, z, r, F) => cols.push({ c: [(F ? FOX : OX) + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'spireAptsLobby'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const FG = new THREE.Group(); FG.name = 'spireAptsFloor'; FG.position.set(FOX, LY, LZ); scene.add(FG); FG.visible = false;
  const toW = (x, y, z, F) => V((F ? FOX : OX) + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ }), toF = P => ({ x: P.x - FOX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('spaDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#334155', '#e7e4dc', '#3fd3ff'], ['#e07a1f', '#334155', '#201e1d'], ['#9aa0a6', '#f3f2f2', '#3a3f45'], ['#2e4a6b', '#f3f2f2', '#1f2f45']];
  const LET = 'ABCDEF';
  const fitTxt = (g, t, s, max) => { g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(t).width > max && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } };
  // the view from floor 12: dusk sky, the city, the Machine Fleet tower with its red lamp
  const towerArt = (g, W, H) => { const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#3a4a78'); sk.addColorStop(0.7, '#c9a0a8'); sk.addColorStop(1, '#f0c8a0'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    g.fillStyle = '#4a5468'; for (let k = 0; k < 14; k++) { const x = (k * 0.075 + ((k * 37) % 11) / 300) * W, bw = W * (0.04 + ((k * 13) % 5) / 160), bh = H * (0.18 + ((k * 29) % 7) / 28); g.fillRect(x, H - bh, bw, bh); }
    const tx = W * 0.62, tw = W * 0.07; g.fillStyle = '#2a3242'; g.fillRect(tx, H * 0.1, tw, H * 0.9); g.beginPath(); g.moveTo(tx, H * 0.1); g.lineTo(tx + tw / 2, H * 0.02); g.lineTo(tx + tw, H * 0.1); g.fill();
    g.fillStyle = GLOW; for (let j = 0; j < 8; j++) g.fillRect(tx + tw * 0.15, H * (0.16 + j * 0.1), tw * 0.7, Math.max(2, H * 0.012)); g.fillStyle = RED; g.beginPath(); g.arc(tx + tw / 2, H * 0.03, Math.max(3, W * 0.006), 0, 7); g.fill();
    g.fillStyle = YEL; for (let k = 0; k < 30; k++) g.fillRect(((k * 97) % 100) / 100 * W, H * (0.78 + ((k * 31) % 20) / 100), Math.max(2, W * 0.006), Math.max(2, H * 0.012)); };
  // a fleet robot (front = +z), merged into a mk() batch
  const botInto = (S, x, y, z, vis = GLOW) => { S.cyl(0.3, 0.34, 0.18, INK, x, y + 0.09, z, 12); S.box(0.5, 0.6, 0.4, STEEL, x, y + 0.5, z); S.box(0.3, 0.2, 0.02, GUN, x, y + 0.55, z + 0.21);
    S.box(0.38, 0.3, 0.32, '#b8bec4', x, y + 0.98, z); S.box(0.3, 0.08, 0.02, vis, x, y + 1.0, z + 0.17); S.cyl(0.012, 0.012, 0.22, INK, x + 0.1, y + 1.24, z, 5); S.sph(0.035, RED, x + 0.1, y + 1.36, z); for (const s of [-1, 1]) S.box(0.08, 0.36, 0.1, GUN, x + s * 0.3, y + 0.5, z); };
  // ================= LOBBY extras: HUM TRANSFORMER (left wall), ROBOT PARTS MAIL rack (left front), FUSE BOX (right front) =================
  const R0 = mk(), { box, cyl, sph } = R0;
  box(0.5, 1.8, 1.3, GUN, -9.6, 0.9, -1.4); for (let k = 0; k < 6; k++) box(0.04, 0.05, 1.1, INK, -9.33, 0.4 + k * 0.2, -1.4); box(0.06, 0.4, 0.5, INK, -9.32, 1.6, -1.4); cyl(0.05, 0.05, 2.6, GUN, -9.7, 3.1, -0.95, 6); cyl(0.05, 0.05, 2.6, GUN, -9.7, 3.1, -1.85, 6); rectL(-9.95, -9.3, -2.1, -0.7);
  box(0.4, 1.6, 2.1, OAK, -9.78, 1.2, 5.6); for (let j = 0; j < 4; j++) box(0.42, 0.04, 2.1, DKW, -9.76, 0.42 + j * 0.52, 5.6); for (let i = 0; i < 4; i++) box(0.42, 1.6, 0.04, DKW, -9.76, 1.2, 4.57 + i * 0.69);
  for (const [y, z] of [[0.62, 4.9], [1.14, 5.95], [0.62, 6.3], [1.66, 4.9], [1.14, 5.25]]) box(0.3, 0.26, 0.4, '#c9a77a', -9.68, y, z); rectL(-9.98, -9.5, 4.5, 6.7);
  box(0.25, 1.2, 0.95, GUN, -0 + 9.82, 1.6, 5.6); box(0.03, 1.0, 0.8, INK, 9.68, 1.6, 5.6); for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) box(0.04, 0.12, 0.08, j === 1 && i === 1 ? RED : PAPER, 9.65, 1.95 - j * 0.32, 5.35 + i * 0.25); box(0.04, 1.2, 0.9, GUN, 9.5, 1.6, 6.5, -1.2); rectL(9.55, 9.98, 5.1, 6.15);
  R0.mesh(G);
  const humM = new THREE.MeshBasicMaterial({ color: GLOW }); planeT(null, 1.1, 0.1, -9.33, 1.95, -1.4, Math.PI / 2, G, humM);
  planeT(plate('TUNE OUT THE HUM', 384, 96, INK, PAPER, GLOW), 1.4, 0.34, -9.83, 3.0, -1.4, Math.PI / 2, G); planeT(plate('ROBOT PARTS MAIL', 384, 96, INK, PAPER, GOLD), 1.5, 0.36, -9.83, 2.4, 5.6, Math.PI / 2, G);
  planeT(plate('RESET THE FUSES', 384, 96, INK, PAPER, RED), 1.4, 0.34, 9.83, 2.6, 5.6, -Math.PI / 2, G); planeT(plate('LIFT \u00b7 FLOOR 12 \u00b7 BY THE TOWER', 512, 96, SLATE, PAPER, GLOW), 1.7, 0.32, -9.74, 3.15, -4, Math.PI / 2, G);
  planeT(plate('HUM LEVEL \u00b7 NORMAL (THE FLEET SAYS)', 512, 96, SLATE, PAPER, RED), 1.6, 0.3, -9.74, 2.55, -1.4, Math.PI / 2, G);
  const LLIFT = [-8.4, -4];
  // ================= FLOOR 12: hall (south, FLATS 12A-12F), FLAT 12G (north-west, for rent), BOT BAY (north-east, 4 chargers + the tower window) =================
  const F0 = mk(), fb = F0.box, fc = F0.cyl, fs = F0.sph, WL = '#e4e6e8';
  fb(20, 0.1, 20, '#a9adb2', 0, -0.05, 0); fb(20, 0.012, 6.4, SLATE, 0, 0.006, 6.8); for (const s of [-1, 1]) fb(20, 0.014, 0.06, GLOW, 0, 0.008, 6.8 + s * 3.1);
  fb(10.4, 0.02, 13.4, '#8b929a', 4.7, 0.012, -3.3); for (let k = 0; k < 6; k++) fb(10.4, 0.016, 0.04, '#6e757d', 4.7, 0.022, -9 + k * 2.2);
  fb(20, 0.2, 20, CREAM, 0, RH + 0.1, 0); fb(20, RH, 0.3, WL, 0, RH / 2, -10); for (const s of [-1, 1]) fb(0.3, RH, 20, WL, s * 10, RH / 2, 0); for (const s of [-1, 1]) fb(8.4, RH, 0.3, WL, s * 5.8, RH / 2, 10); fb(3.2, RH - 3.0, 0.3, WL, 0, 3.0 + (RH - 3.0) / 2, 10);
  rectL(-10, 10, -10.3, -9.7, true); rectL(9.8, 10.3, -10, 10, true); rectL(-10.3, -9.8, -10, 10, true); rectL(-10, -1.6, 9.8, 10.3, true); rectL(1.6, 10, 9.8, 10.3, true); rectL(-1.6, 1.6, 9.9, 10.4, true);
  fb(1.8, 2.7, 0.06, STEEL, 0, 1.35, 9.82); fb(0.03, 2.7, 0.07, INK, 0, 1.35, 9.8); fb(2.1, 0.14, 0.12, GLOW, 0, 2.78, 9.8);
  for (const s of [-1, 1]) fb(0.06, 0.24, 20, SLATE, s * 9.83, 0.12, 0); fb(20, 0.24, 0.06, SLATE, 0, 0.12, -9.83);
  // partition z 3.5: wall x -10..-6, FLAT 12G door -6..-4.6, wall -4.6..4.2 (squeaky door 12H + night-watch board on its hall face), bot bay doorway 4.2..5.8, wall 5.8..10; flat/bay wall x -0.6
  fb(4, RH, 0.2, WL, -8, RH / 2, 3.5); fb(1.4, RH - 2.6, 0.2, WL, -5.3, 2.6 + (RH - 2.6) / 2, 3.5); rectL(-10, -6, 3.4, 3.6, true);
  fb(8.8, RH, 0.2, WL, -0.2, RH / 2, 3.5); rectL(-4.6, 4.2, 3.4, 3.6, true); fb(4.2, RH, 0.2, WL, 7.9, RH / 2, 3.5); rectL(5.8, 10, 3.4, 3.6, true); fb(1.6, RH - 2.8, 0.2, WL, 5.0, 2.8 + (RH - 2.8) / 2, 3.5);
  fb(0.2, RH, 13.5, WL, -0.6, RH / 2, -3.25); rectL(-0.7, -0.5, -10, 3.5, true);
  const DOORS = [[-7.5, 9.8, 0], [-4, 9.8, 0], [4, 9.8, 0], [7.5, 9.8, 0], [-9.8, 6.5, 1], [9.8, 6.5, -1]];
  DOORS.forEach(([x, z, s]) => { if (!s) { fb(1.2, 2.4, 0.08, GUN, x, 1.2, 9.82); fb(1.4, 0.1, 0.1, STEEL, x, 2.45, 9.8); fs(0.05, GOLD, x + 0.42, 1.1, 9.74); } else { fb(0.08, 2.4, 1.2, GUN, x * 0.998, 1.2, z); fb(0.1, 0.1, 1.4, STEEL, x * 0.998, 2.45, z); fs(0.05, GOLD, x - s * 0.08, 1.1, z + 0.42); } });
  fb(1.1, 2.3, 0.08, '#6b7480', -2.4, 1.15, 3.62); for (const y of [0.4, 1.15, 1.9]) fb(0.08, 0.2, 0.06, COPPER, -2.92, y, 3.67); fs(0.05, GOLD, -2.0, 1.1, 3.68);
  fb(1.3, 0.95, 0.04, OAK, 1.4, 1.6, 3.62); fb(1.16, 0.81, 0.02, PAPER, 1.4, 1.6, 3.645);
  fc(0.55, 0.55, 0.02, SLATE, -8.6, 0.01, 8.6, 20); fc(0.45, 0.45, 0.024, GLOW, -8.6, 0.012, 8.6, 20);
  // FLAT 12G: bed, chest, trophy shelf (west wall), sofa, rug, window
  fb(2.2, 0.5, 2.6, PAPER, -7.8, 0.25, -7.8); fb(2.3, 0.2, 2.7, DKW, -7.8, 0.1, -7.8); fb(2.3, 1.1, 0.12, DKW, -7.8, 0.75, -9.1); fb(2.0, 0.14, 1.6, SLATE, -7.8, 0.55, -7.2); fb(0.7, 0.16, 0.4, PAPER, -8.3, 0.58, -8.6); fb(0.7, 0.16, 0.4, PAPER, -7.3, 0.58, -8.6); rectL(-9.0, -6.6, -9.2, -6.4, true);
  fb(1.1, 0.6, 0.6, GUN, -3.4, 0.3, -9.3); fb(1.14, 0.06, 0.64, STEEL, -3.4, 0.62, -9.3); rectL(-4.0, -2.8, -9.7, -8.9, true);
  for (const y of [1.0, 1.6, 2.2]) fb(0.4, 0.05, 3.0, DKW, -9.6, y, -2.4); fb(0.06, 1.8, 3.1, DKW, -9.8, 1.6, -2.4);
  fb(2.6, 0.45, 0.9, SLATE, -4.8, 0.23, -1.0); fb(2.6, 0.6, 0.2, SLATE, -4.8, 0.6, -0.6); rectL(-6.1, -3.5, -1.5, -0.5, true); fc(1.4, 1.4, 0.012, '#c9ced6', -5, 0.012, -4.2, 20);
  fb(3.4, 1.8, 0.06, INK, -5, 2.3, -9.82);
  // BOT BAY: 4 charging docks on the north wall (bots on them), the tower window above, a parts workbench (east)
  const DOCKX = [1.6, 3.9, 6.2, 8.5];
  DOCKX.forEach(x => { fb(1.2, 0.08, 1.0, SLATE, x, 0.04, -9.0); fb(1.0, 2.0, 0.1, INK, x, 1.0, -9.75); fb(0.6, 0.3, 0.04, GUN, x, 1.6, -9.69); fc(0.02, 0.02, 0.8, INK, x - 0.36, 0.8, -9.5, 5, 0.6); botInto(F0, x, 0.08, -9.0); rectL(x - 0.55, x + 0.55, -9.8, -8.45, true); });
  for (const x of [-0.3, 2.9, 6.5, 9.7]) fb(0.12, 1.8, 0.14, STEEL, x, 3.2, -9.8); fb(10.1, 0.12, 0.14, STEEL, 4.7, 4.1, -9.8); fb(10.1, 0.1, 0.4, CREAM, 4.7, 2.28, -9.7);
  fb(0.8, 0.9, 2.2, OAK, 9.4, 0.45, -5.6); fb(0.84, 0.05, 2.24, STEEL, 9.4, 0.92, -5.6); fb(0.3, 0.2, 0.3, COPPER, 9.4, 1.04, -6.1); fb(0.2, 0.06, 0.5, INK, 9.35, 0.98, -5.2); fs(0.08, GLOW, 9.4, 1.03, -4.9); rectL(8.95, 9.85, -6.75, -4.45, true);
  fc(0.3, 0.3, 0.5, OAK, 9.2, 0.25, 2.6, 10); fc(0.04, 0.04, 1.2, STEEL, 9.2, 1.1, 2.6, 6); fc(0.22, 0.3, 0.3, PAPER, 9.2, 1.8, 2.6, 10); circL(9.2, 2.6, 0.35, true);
  F0.mesh(FG);
  const winM = new THREE.MeshBasicMaterial({ map: CT(1024, 192, towerArt) }); planeT(null, 9.8, 1.7, 4.7, 3.2, -9.84, 0, FG, winM);
  const viewM = new THREE.MeshBasicMaterial({ map: CT(512, 256, towerArt) }); planeT(null, 3.2, 1.6, -5, 2.3, -9.78, 0, FG, viewM);
  const lampG = new THREE.SphereGeometry(0.06, 8, 6), DLAMP = DOCKX.map(x => { const m = new THREE.Mesh(lampG, new THREE.MeshBasicMaterial({ color: GLOW })); m.position.set(x + 0.3, 1.6, -9.66); FG.add(m); return m; });
  planeT(plate('SPIRE APARTMENTS \u00b7 FLOOR 12', 512, 96, SLATE, PAPER, GLOW), 2.6, 0.45, 0, 3.4, 9.8, Math.PI, FG); planeT(plate('LIFT \u00b7 LOBBY', 384, 96, INK, PAPER, RED), 1.5, 0.36, 0, 3.05, 9.78, Math.PI, FG);
  planeT(plate('BOT BAY', 384, 96, SLATE, PAPER, GLOW), 1.6, 0.38, 5, 3.2, 3.62, 0, FG); planeT(plate('FLAT 12H \u00b7 SQUEAKS', 384, 96, INK, PAPER, COPPER), 1.1, 0.28, -2.4, 2.55, 3.66, 0, FG);
  planeT(plate('NIGHT WATCH \u00b7 BOT-7', 384, 96, INK, PAPER, RED), 1.15, 0.28, 1.4, 2.32, 3.66, 0, FG); planeT(plate('20:00 \u2192 6:00 \u00b7 ALL DOORS', 384, 96, PAPER, INK, GLOW), 1.1, 0.26, 1.4, 1.6, 3.66, 0, FG);
  DOORS.forEach(([x, z, s], i) => planeT(plate('FLAT 12' + LET[i], 256, 96, INK, PAPER, GLOW), 0.7, 0.26, s ? x + s * 0.12 : x, 2.15, s ? z : z - 0.08, s ? s * Math.PI / 2 : Math.PI, FG));
  // BOT-7: the night-watch guard bot (parks on its pad by the lift, patrols the hall at night, walks the night-watch job)
  const BOTPAD = [-8.6, 8.6], bot7 = new THREE.Group(); { const S = mk(); botInto(S, 0, 0, 0, RED); S.mesh(bot7); } bot7.name = 'saptBot7'; bot7.position.set(BOTPAD[0], 0, BOTPAD[1]); bot7.rotation.y = Math.PI / 2; FG.add(bot7);
  planeT(plate('BOT-7', 256, 96, INK, PAPER, RED), 0.36, 0.13, 0, 0.62, 0.215, 0, bot7);
  const scanM = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.1, 32), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.85, depthWrite: false })); scanM.rotation.x = -Math.PI / 2; scanM.position.y = 0.04; scanM.visible = false; FG.add(scanM);
  let patrolI = 0; const PATROL = [[-7.6, 6.8], [7.6, 6.8]];
  const moveBot = (x, z, dt, sp) => { const dx = x - bot7.position.x, dz = z - bot7.position.z, d = Math.hypot(dx, dz); if (d < 0.12) return true; const s = Math.min(d, sp * dt); bot7.position.x += dx / d * s; bot7.position.z += dz / d * s;
    let a = Math.atan2(dx, dz) - bot7.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a)); bot7.rotation.y += a * Math.min(1, dt * 6); bot7.rotation.z = Math.sin(performance.now() / 120) * 0.03; return false; };
  // FLAT 12G door (locked until you rent), its sign, trophy cups
  const doorM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.1), new THREE.MeshLambertMaterial({ color: GUN })); doorM.position.set(-5.3, 1.3, 3.5); FG.add(doorM); const doorCol = rectL(-6, -4.6, 3.38, 3.62, true);
  const signT = CT(384, 128, () => {}); planeT(signT, 1.2, 0.4, -5.3, 2.75, 3.62, 0, FG);
  const drawSign = () => { const g = signT.userData.c.getContext('2d'), r = rented(); g.fillStyle = r ? SLATE : INK; g.fillRect(0, 0, 384, 128); g.fillStyle = GLOW; g.fillRect(0, 0, 12, 128); g.fillStyle = PAPER; g.font = '900 46px Archivo, sans-serif'; g.fillText('FLAT 12G', 30, 56); g.fillStyle = r ? YEL : RED; const t2 = r ? (free() ? 'YOURS \u00b7 RENT FREE' : 'YOURS \u00b7 ' + daysLeft() + ' DAYS LEFT') : 'FOR RENT \u00b7 SEE THE MANAGER'; fitTxt(g, t2, 26, 340); g.fillText(t2, 30, 100); signT.needsUpdate = true; };
  const cupG = new THREE.CylinderGeometry(0.07, 0.045, 0.2, 10), cupM = new THREE.MeshLambertMaterial({ color: GOLD, emissive: '#7a5a1a', emissiveIntensity: 0.3 }), CUPS = [];
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(cupG, cupM); m.position.set(-9.55, 1.13 + Math.floor(i / 4) * 0.6, -3.6 + (i % 4) * 0.8); m.visible = false; FG.add(m); CUPS.push(m); }
  const shelfT = CT(512, 96, () => {}); planeT(shelfT, 2.4, 0.45, -9.78, 2.85, -2.4, Math.PI / 2, FG);
  const GOLDS = () => Object.entries((save.data && save.data.items) || {}).filter(([id, n]) => n > 0 && /^gold|^golden|Trophy$/.test(id)).map(([id]) => id);
  const drawShelf = () => { const n = GOLDS().length, g = shelfT.userData.c.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, 512, 96); g.fillStyle = GLOW; g.fillRect(0, 0, 14, 96); g.fillStyle = PAPER; g.font = '900 40px Archivo, sans-serif'; g.fillText('TROPHY SHELF \u00b7 ' + n, 32, 62); shelfT.needsUpdate = true; CUPS.forEach((c, i) => { c.visible = i < n; }); };
  const spanner = new THREE.Group(); { const S = mk(); S.box(0.36, 0.04, 0.06, GOLD, 0, 0.03, 0); S.cyl(0.06, 0.06, 0.04, GOLD, 0.2, 0.03, 0, 10); S.box(0.06, 0.05, 0.05, INK, 0.24, 0.035, 0); S.box(0.16, 0.12, 0.1, DKW, 0, -0.03, 0); S.mesh(spanner); } spanner.position.set(1.8, 1.12, -6.4); G.add(spanner); spanner.visible = false;
  const coil = new THREE.Group(); { const S = mk(); S.cyl(0.03, 0.03, 0.3, INK, 0, 0.17, 0, 8); for (let k = 0; k < 6; k++) S.cyl(0.08, 0.08, 0.03, COPPER, 0, 0.06 + k * 0.045, 0, 12); S.sph(0.04, GLOW, 0, 0.34, 0); S.mesh(coil); } coil.position.set(-1.8, 1.12, -6.4); G.add(coil); coil.visible = false;
  // ================= FOXES: the Building Manager (replaces the lobby's quiet keeper) + ENGINEER VOLT (flat 12A, works in the bot bay) =================
  const old = LR.keeper; if (old && old.parent) old.parent.remove(old); LR.keeper = null;
  const MG0 = [0, -7.4, 0], VO0 = [8.2, -1.6, -Math.PI / 2];
  const keeper = kit.makeFox({ key: 'saptManager', name: 'Building Manager', torso: ['#334155', '#e7e4dc', '#3fd3ff'], outfit: 'vest', mood: 'warm' }); keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2]; keeper.userData.noCull = true; keeper.userData.rosterShop = 'SPIRE APARTMENTS'; keeper.userData.rosterRole = 'keeper'; G.add(keeper);
  const volt = kit.makeFox({ key: 'saptVolt', name: 'Engineer Volt', torso: ['#e07a1f', '#334155', '#201e1d'], outfit: 'vest', mood: 'warm' }); volt.position.set(VO0[0], 0, VO0[1]); volt.rotation.y = VO0[2]; volt.userData.noCull = true; FG.add(volt); circL(VO0[0], VO0[1], 0.45, true);
  const GAMES = [{ k: 'hum', name: 'Tune Out the Hum', color: GLOW }, { k: 'fuse', name: 'Reset the Fuse Box', color: RED }, { k: 'mail', name: 'Sort the Robot Parts Mail', color: GOLD },
    { k: 'watch', name: 'Night Watch with a Guard Bot', color: SLATE, F: true }, { k: 'oil', name: "Oil the Tenants' Doors", color: COPPER, F: true }, { k: 'charge', name: 'Charge the Bots', color: LEAF, F: true }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { hum: [-8.0, -1.4], fuse: [8.4, 5.6], mail: [-8.4, 5.6], watch: [-7.0, 5.0], oil: [-2.4, 4.7], charge: [5.2, -6.0] };
  const lampsOn = () => { const h = hour(); return h >= 19 || h < 7; };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'spa', color: SLATE, boardTitle: 'Spire Apartments board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -3.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 2.8, z: 8.2, ry: 0 }, hiringLine: 'HUM \u00b7 FUSES \u00b7 MAIL \u00b7 NIGHT WATCH \u00b7 DOORS \u00b7 BOTS', sun: [{ x: 0, z: 7.4, w: 2.4, d: 2.0 }, { x: -3, z: 4, w: 2.4, d: 1.6 }],
    lamps: [[0, 3.6, -6], [0, 3.6, -0.5], [0, 3.6, 5]], lampsOn, browse: [[-5.6, 2.6, -Math.PI / 2], [3.6, 2.0, Math.PI / 2], [-3.0, -2.0, Math.PI]], looks: [LOOKS[1], LOOKS[2], LOOKS[3]], clock: { x: 3.6, y: 3.4, z: 9.83, ry: Math.PI } });
  const KF = shopKit({ THREE, G: FG, scene, kit, save, camera, touch, hour, isMuted, prefix: 'spa', color: SLATE, room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], games: [],
    sun: [{ x: 3.0, z: -8.0, w: 3.4, d: 1.6 }, { x: 7.0, z: -7.6, w: 3.0, d: 1.6 }, { x: -5, z: -8.4, w: 2.4, d: 1.4 }], lamps: [[-5, RH - 0.6, -4], [0, RH - 0.6, 6.8], [-6, RH - 0.6, 6.8], [6, RH - 0.6, 6.8], [5, RH - 0.6, -4.5]], lampsOn, browse: [[3.0, -6.6, Math.PI], [6.6, -6.4, Math.PI]], looks: [LOOKS[0], LOOKS[2]] });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const q of GAMES) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[q.k][0], 0.03, RINGS[q.k][1]); (q.F ? FG : G).add(m); ringMeshes[q.k] = m; }
  const greenM = new THREE.MeshBasicMaterial({ color: '#7cff9b', transparent: true, opacity: 0.8, depthWrite: false }), SPOTS = { bed: [-7.8, -5.8], chest: [-3.4, -8.2], shelf: [-8.6, -2.4] }, spotMeshes = {};
  for (const k in SPOTS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.64, 28), greenM); m.rotation.x = -Math.PI / 2; m.position.set(SPOTS[k][0], 0.03, SPOTS[k][1]); FG.add(m); spotMeshes[k] = m; }
  // ================= KIT: sound, toast, fade, card, panel, arrow =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const liftDing = () => { tone(1046, 0.06, 0.6); tone(1318, 0.05, 0.7, 'sine', 0.18); }, beep = () => { tone(1320, 0.05, 0.08, 'square'); tone(990, 0.05, 0.1, 'square', 0.1); }, spark = () => { tone(90, 0.07, 0.25, 'sawtooth'); tone(3000, 0.02, 0.1, 'square'); };
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
  const T_MG = { key: 'saptManager', name: 'Building Manager', role: 'SPIRE APARTMENTS', obj: keeper, ry: MG0[2], r: 6 }, mgLn = ln('Building Manager', 'SPIRE APARTMENTS');
  const T_VO = { key: 'saptVolt', name: 'Engineer Volt', role: 'FLAT 12A \u00b7 FLOOR 12', obj: volt, ry: VO0[2], r: 4 }, voLn = ln('Engineer Volt', 'FLAT 12A \u00b7 FLOOR 12');
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;min-width:0;display:block;touch-action:none;background:#1f2633;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = (t, attr = 'data-go') => '<button ' + attr + ' style="' + BTN + ';flex:1;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const sideBtn = (t, attr) => '<button ' + attr + ' style="' + BTN + ';flex:none;width:76px;min-height:' + (wide() ? 56 : 72) + 'px;font-size:24px;touch-action:none">' + t + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = (down, up) => { const kd = e => { const k = down(e); if (k) { e.preventDefault(); e.stopPropagation(); } }, ku = e => { if (up && up(e)) { e.preventDefault(); e.stopPropagation(); } }; addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  const holdBtn = (sel, d) => { const b = PANEL.querySelector(sel); if (!b) return; b.onpointerdown = e => { e.preventDefault(); J.dir = d; J.idle = 0; }; b.onpointerup = b.onpointercancel = b.onpointerleave = () => { if (J && J.dir === d) J.dir = 0; }; };
  // ---------- 1 TUNE OUT THE HUM: slide your wave until it matches the tower hum (the MIX goes flat), then LOCK IT; 5 hums, the last two drift ----------
  const HMT = 12, HMN = 5, HOK = 0.045;
  GD.hum = { shot: () => [toW(-9.6, 1.5, -1.4), 2.4, 2.2, 0.15, 2.2, Math.PI / 2, 5],
    begin() { goRoom(-8.0, -1.4, -Math.PI / 2); J.list = [...Array(HMN)].map((_, i) => ({ tg: Math.random() < 0.5 ? rnd(0.08, 0.36) : rnd(0.64, 0.92), drift: i >= 3 })); J.ci = 0; J.cueT = HMT; J.wait = 0.4; J.v = 0.5; J.dir = 0; J.flash = null; snapK = true;
      keyAct(e => { if (e.code === 'Space' || e.code === 'Enter') { if (!e.repeat) this.lock(); return true; } if (e.code === 'ArrowLeft' || e.code === 'KeyA') { J.dir = -1; return true; } if (e.code === 'ArrowRight' || e.code === 'KeyD') { J.dir = 1; return true; } return false; },
        e => { if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) { J.dir = 0; return true; } return false; }); this.draw(); },
    tg(c) { return c.drift ? clamp(c.tg + Math.sin(J.t * 0.9) * 0.1, 0.04, 0.96) : c.tg; }, off() { const c = J.list[J.ci]; return c ? Math.abs(J.v - this.tg(c)) : 1; },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('TUNE OUT THE HUM \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('4/3') + timeRow + '<div style="display:flex;gap:8px;flex:none">' + sideBtn('\u25c0', 'data-l') + bigBtn('LOCK IT') + sideBtn('\u25b6', 'data-r') + '</div>' : doneMsg('SILENCE. THE SPOONS STOP RATTLING.')) + tipBar('MATCH YOUR WAVE TO THE HUM \u00b7 LOCK IT WHEN THE MIX GOES FLAT'));
      holdBtn('[data-l]', -1); holdBtn('[data-r]', 1); const b = PANEL.querySelector('[data-go]'); if (b) b.onpointerdown = e => { e.preventDefault(); this.lock(); };
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = true; this.aim(cv, e); }, e => this.aim(cv, e)); },
    aim(cv, e) { const r = cv.getBoundingClientRect(); J.v = clamp((e.clientX - r.left) / r.width, 0, 1); J.idle = 0; },
    lock() { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0;
      if (this.off() < HOK) { addGold(4); ding(); J.flash = ['ok', 0.8]; okTip('QUIET \u00b7 HUM ' + (J.ci + 1) + ' CANCELLED'); J.wait = 0.9; setTimeout(() => this.next(), 800); }
      else { J.flash = ['bad', 0.6]; missOne('STILL HUMMING \u00b7 ' + (J.v < this.tg(c) ? 'GO HIGHER \u25b6' : '\u25c0 GO LOWER')); } },
    next() { roundNext(this, 'hum', HMT); },
    tick(dt) { if (J.dir && J.wait <= 0) J.v = clamp(J.v + J.dir * 0.28 * dt, 0, 1); if (J.flash && (J.flash[1] -= dt) <= 0) J.flash = null;
      roundTick(this, dt, HMT, 'TOO SLOW \u00b7 THE HUM WINS THIS ONE', () => { const c = J.list[J.ci]; return !c ? null : this.off() < HOK ? '[data-go]' : J.v < this.tg(c) ? '[data-r]' : '[data-l]'; }); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, t = performance.now() / 1000, tg = this.tg(c), fH = 3 + tg * 9, fY = 3 + J.v * 9, A = h * 0.07, ph = t * 5;
      g.fillStyle = '#1f2633'; g.fillRect(0, 0, w, h); g.strokeStyle = '#2f3a4a'; g.lineWidth = 1; for (let k = 1; k < 10; k++) { g.beginPath(); g.moveTo(k * w / 10, 0); g.lineTo(k * w / 10, h); g.stroke(); }
      const trace = (y0, col, fn, lw) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); for (let i = 0; i <= 120; i++) { const u = i / 120, y = y0 + fn(u) * A; if (i) g.lineTo(u * w, y); else g.moveTo(u * w, y); } g.stroke(); };
      const hum = u => Math.sin(u * fH * 6.283 - ph), you = u => Math.sin(u * fY * 6.283 - ph), quiet = this.off() < HOK;
      trace(h * 0.2, RED, hum, 3); trace(h * 0.48, GLOW, you, 3); trace(h * 0.78, quiet ? YEL : PAPER, u => (hum(u) - you(u)) / 2, quiet ? 5 : 3);
      g.fillStyle = PAPER; g.font = '900 13px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('THE HUM', 8, h * 0.2 - A - 6); g.fillText('YOUR WAVE', 8, h * 0.48 - A - 6); g.fillStyle = quiet ? YEL : PAPER; g.fillText(quiet ? 'MIX \u00b7 FLAT \u00b7 LOCK IT!' : 'MIX \u00b7 HUM LEFT ' + Math.round(Math.min(1, this.off() * 3) * 100) + ' %', 8, h * 0.78 - A - 6);
      g.fillStyle = GLOW; g.fillRect(J.v * w - 2, h - 10, 4, 10); if (J.flash) { g.strokeStyle = J.flash[0] === 'ok' ? YEL : RED; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); } } };
  // ---------- 2 RESET THE FUSE BOX: watch the order the fuses trip, then reset them backwards (last one first); 4 rounds, 3 → 6 fuses ----------
  const FST = 18, FUSES = ['LOBBY', 'LIFT', 'HALL', 'FLAT 12A', 'FLAT 12B', 'FLAT 12C', 'BOT BAY', 'BOILER', 'ROOF SIGN'];
  GD.fuse = { shot: () => [toW(9.7, 1.6, 5.6), 2.4, 2.2, 0.15, 2.2, -Math.PI / 2, 5],
    begin() { goRoom(8.4, 5.6, Math.PI / 2); J.list = [3, 4, 5, 6].map(n => ({ seq: pickN([...Array(FUSES.length).keys()], n) })); J.ci = 0; J.cueT = FST; snapK = true; this.show(0.7); this.draw(); },
    show(d) { J.trip = new Set(); J.mode = 'show'; J.k = 0; J.st = d; J.lit = -1; J.litT = 0; J.wait = 99; J.need = -1; },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('RESET THE FUSE BOX \u00b7 ' + nOf(), goldR()) + body(c ? '<div data-st style="font-size:15px;font-weight:900"></div>' + timeRow + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-auto-rows:minmax(56px,1fr);gap:6px;flex:1;min-height:0">'
        + FUSES.map((n, k) => '<button data-c="' + k + '" style="' + BTN + ';display:flex;flex-direction:column;justify-content:space-between;align-items:flex-start;font-size:13px"><span>' + n + '</span><span data-s style="font-size:11px"></span></button>').join('') + '</div>' : doneMsg('LIGHTS ON. LIFT ON. SIGN ON.')) + tipBar('WATCH THEM TRIP \u00b7 THEN RESET IN REVERSE \u00b7 LAST ONE FIRST'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.tap(+b.dataset.c, b); }); this.paint(); },
    paint() { const c = J.list[J.ci]; if (!c) return; PANEL.querySelectorAll('[data-c]').forEach(b => { const k = +b.dataset.c, tr = J.trip.has(k), lit = J.lit === k; b.style.background = lit ? YEL : tr ? RED : '#fff'; b.style.color = tr && !lit ? '#fff' : INK; const s = b.querySelector('[data-s]'); if (s) s.textContent = tr ? '\u25bc TRIPPED' : '\u25b2 ON'; });
      const st = PANEL.querySelector('[data-st]'); if (st) st.textContent = J.mode === 'show' ? 'WATCH \u00b7 TRIPPING\u2026 ' + J.k + ' / ' + c.seq.length : 'RESET \u00b7 ' + (J.need + 1) + ' LEFT \u00b7 LAST ONE FIRST'; },
    tap(k, el) { const c = J.list[J.ci]; if (!c || J.mode !== 'play' || J.wait > 0) return; J.idle = 0;
      if (k !== c.seq[J.need]) { spark(); shake(el); missOne(J.trip.has(k) ? 'WRONG ORDER \u00b7 ZAP! WATCH AGAIN' : 'THAT ONE WAS ON \u00b7 ZAP! WATCH AGAIN'); this.show(1.0); this.paint(); return; }
      J.trip.delete(k); tone(520 + (c.seq.length - J.need) * 80, 0.05, 0.15, 'triangle'); J.need--; this.paint();
      if (J.need < 0) { addGold(4); ding(); okTip('POWER BACK ON \u00b7 ROUND ' + (J.ci + 1)); J.wait = 0.9; J.mode = 'done'; setTimeout(() => this.next(), 800); } },
    next() { if (!J || J.g !== 'fuse') return; const last = J.ci + 1 >= J.list.length; J.trip = new Set(); J.mode = 'done'; roundNext(this, 'fuse', FST); if (!last && J) { this.show(0.7); this.paint(); } },
    tick(dt) { const c = J.list[J.ci]; if (!c) return;
      if (J.mode === 'show') { J.st -= dt; if (J.litT > 0 && (J.litT -= dt) <= 0) { J.lit = -1; this.paint(); }
        if (J.st <= 0) { if (J.k < c.seq.length) { const k = c.seq[J.k]; J.lit = k; J.litT = 0.4; J.trip.add(k); spark(); J.k++; J.st = Math.max(0.5, 0.7 - J.ci * 0.05); this.paint(); }
          else { J.mode = 'play'; J.need = c.seq.length - 1; J.lit = -1; J.wait = 0; J.idle = 0; J.hinted = false; okTip('RESET IN REVERSE \u00b7 LAST ONE TRIPPED FIRST'); this.paint(); } } return; }
      if (J.mode === 'play') roundTick(this, dt, FST, 'TOO SLOW \u00b7 THE LIFT IS STILL DARK', () => '[data-c="' + c.seq[J.need] + '"]'); } };
  // ---------- 3 SORT THE ROBOT PARTS MAIL: each flat on twelve wants one kind of part; read the parcel's picture, pick the box; FLEET stamps go down the chute; 12 parcels ----------
  const MLT = 6, MLN = 12, PARTS = ['GEARS', 'SPRINGS', 'BOLTS', 'CHIPS', 'WHEELS', 'ANTENNAS'];
  const icon = (g, k, x, y, s) => { g.strokeStyle = INK; g.fillStyle = INK; g.lineWidth = Math.max(2, s * 0.07); g.lineCap = 'round'; g.beginPath();
    if (k === 0) { for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.save(); g.translate(x, y); g.rotate(a); g.fillRect(-s * 0.07, -s * 0.46, s * 0.14, s * 0.16); g.restore(); } g.beginPath(); g.arc(x, y, s * 0.32, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x, y, s * 0.12, 0, 7); g.fill(); }
    else if (k === 1) { g.moveTo(x - s * 0.25, y - s * 0.42); for (let i = 0; i < 7; i++) g.lineTo(x + (i % 2 ? -0.25 : 0.25) * s, y - s * 0.42 + (i + 1) * s * 0.12); g.stroke(); }
    else if (k === 2) { for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; g.lineTo(x + Math.cos(a) * s * 0.26, y - s * 0.3 + Math.sin(a) * s * 0.14); } g.closePath(); g.fill(); g.fillRect(x - s * 0.08, y - s * 0.2, s * 0.16, s * 0.62); g.strokeStyle = '#fff'; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(x - s * 0.08, y + i * s * 0.12); g.lineTo(x + s * 0.08, y + i * s * 0.12 - s * 0.05); g.stroke(); } }
    else if (k === 3) { g.fillRect(x - s * 0.24, y - s * 0.24, s * 0.48, s * 0.48); for (let i = 0; i < 4; i++) { const o = -s * 0.18 + i * s * 0.12; g.fillRect(x - s * 0.4, y + o - 2, s * 0.16, 4); g.fillRect(x + s * 0.24, y + o - 2, s * 0.16, 4); } g.fillStyle = GLOW; g.fillRect(x - s * 0.1, y - s * 0.1, s * 0.2, s * 0.2); }
    else if (k === 4) { g.arc(x, y, s * 0.4, 0, 7); g.lineWidth = s * 0.12; g.stroke(); g.lineWidth = Math.max(2, s * 0.06); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * s * 0.36, y + Math.sin(a) * s * 0.36); g.stroke(); } g.beginPath(); g.arc(x, y, s * 0.08, 0, 7); g.fill(); }
    else { g.moveTo(x, y + s * 0.36); g.lineTo(x, y - s * 0.3); g.stroke(); g.beginPath(); g.arc(x, y - s * 0.36, s * 0.08, 0, 7); g.fillStyle = RED; g.fill(); g.fillStyle = INK; g.fillRect(x - s * 0.2, y + s * 0.32, s * 0.4, s * 0.1); g.beginPath(); g.arc(x, y - s * 0.36, s * 0.22, -2.4, -0.7); g.stroke(); } };
  GD.mail = { shot: () => [toW(-9.6, 1.3, 5.6), 2.6, 2.4, 0.15, 2.2, Math.PI / 2, 5],
    begin() { goRoom(-8.4, 5.6, -Math.PI / 2); J.map = shuffle([0, 1, 2, 3, 4, 5]); J.list = [...Array(MLN)].map((_, i) => ({ p: Math.floor(Math.random() * 6), fleet: i > 1 && Math.random() < 0.22 })); J.ci = 0; J.cueT = MLT; J.wait = 0.4; J.ok = null; snapK = true; this.draw(); },
    right(c) { return c.fleet ? 6 : J.map.indexOf(c.p); },
    draw() { const c = J.list[J.ci];
      const btns = [...Array(6).keys()].map(f => '<button data-c="' + f + '" style="' + BTN + ';min-height:48px;font-size:13px">12' + LET[f] + ' \u00b7 ' + PARTS[J.map[f]] + '</button>').join('') + '<button data-c="6" style="' + BTN + ';grid-column:1 / -1;min-height:48px;font-size:13px;background:#201e1d;color:#ffd23a">FLEET CHUTE \u00b7 RED STAMPS</button>';
      showPanel(panelHead('SORT THE ROBOT PARTS MAIL \u00b7 ' + nOf(), goldR()) + body(c ? (wide() ? '<div style="display:flex;gap:10px;flex:1;min-height:0"><div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0">' + cvTag('4/3') + timeRow + '</div><div style="flex:1.2;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;align-content:start">' + btns + '</div></div>'
        : cvTag('16/9') + timeRow + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;flex:none">' + btns + '</div>') : doneMsg('EVERY PARCEL IN THE RIGHT BOX')) + tipBar('LOOK AT THE PART ON THE PARCEL \u00b7 TAP ITS FLAT \u00b7 RED FLEET STAMP = CHUTE'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.tap(+b.dataset.c, b); }); },
    tap(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0;
      if (k === this.right(c)) { addGold(2); tone(c.fleet ? 300 : 700, 0.05, 0.12, 'triangle'); J.ok = ['ok', 0.4]; okTip(c.fleet ? 'DOWN THE CHUTE \u00b7 FOR THE FLEET' : 'SORTED \u00b7 ' + PARTS[c.p] + ' FOR 12' + LET[k]); J.wait = 0.35; setTimeout(() => this.next(), 300); }
      else { shake(el); J.ok = ['bad', 0.5]; missOne(c.fleet ? 'RED STAMP \u00b7 THAT ONE WAS FOR THE CHUTE' : 'WRONG BOX \u00b7 THAT WAS ' + PARTS[c.p]); J.wait = 0.6; setTimeout(() => this.next(), 550); } },
    next() { roundNext(this, 'mail', MLT); if (J && J.g === 'mail') J.cueT = Math.max(3.5, MLT - J.ci * 0.2); },
    tick(dt) { if (J.ok && (J.ok[1] -= dt) <= 0) J.ok = null; roundTick(this, dt, Math.max(3.5, MLT - J.ci * 0.2), 'TOO SLOW \u00b7 THE PARCEL PILES UP', () => { const c = J.list[J.ci]; return c ? '[data-c="' + this.right(c) + '"]' : null; }); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, t = performance.now() / 1000, s = Math.min(w, h) * 0.5, x = w / 2 + Math.sin(t * 22) * (J.wait > 0 ? 0 : 1.5), y = h / 2;
      g.fillStyle = '#1f2633'; g.fillRect(0, 0, w, h); g.fillStyle = '#c9a77a'; g.fillRect(x - s * 0.9, y - s * 0.62, s * 1.8, s * 1.24); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(x - s * 0.9, y - s * 0.62, s * 1.8, s * 1.24);
      g.fillStyle = '#e8d3a8'; g.fillRect(x - s * 0.08, y - s * 0.62, s * 0.16, s * 1.24); g.fillStyle = '#fff'; g.fillRect(x - s * 0.5, y - s * 0.42, s * 1.0, s * 0.84); g.strokeRect(x - s * 0.5, y - s * 0.42, s * 1.0, s * 0.84); icon(g, c.p, x, y, s * 0.7);
      if (c.fleet) { g.save(); g.translate(x + s * 0.55, y - s * 0.4); g.rotate(-0.3); g.strokeStyle = RED; g.lineWidth = 4; g.strokeRect(-s * 0.36, -s * 0.13, s * 0.72, s * 0.26); g.fillStyle = RED; g.font = '900 ' + Math.round(s * 0.17) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FLEET', 0, 2); g.restore(); }
      if (J.ok) { g.strokeStyle = J.ok[0] === 'ok' ? YEL : RED; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); } g.textAlign = 'left'; g.textBaseline = 'alphabetic'; } };
  // ---------- 4 NIGHT WATCH WITH A GUARD BOT (walk): BOT-7 rolls to a door and scans; get there and CHECK (E) before the scan ends; 6 checks ----------
  const WTN = 6, SCN = 7.5, CHECKS = () => [...DOORS.map(([x, z, s], i) => ({ n: 'FLAT 12' + LET[i], p: s ? [x + s * 1.0, z] : [x, z - 1.0] })), { n: 'THE LIFT', p: [0, 8.2] }, { n: 'THE BOT BAY', p: [5.0, 4.4] }, { n: 'FLAT 12G', p: [-5.3, 4.5] }, { n: 'FLAT 12H', p: [-2.4, 4.5] }];
  GD.watch = { errand: true,
    begin() { goRoom(-7.0, 5.0, Math.PI / 2, true); bot7.name = 'saptBot7'; bot7.position.set(BOTPAD[0], 0, BOTPAD[1]); J.list = pickN(CHECKS(), WTN).map(c => ({ ...c, st: 0, scan: 0 })); J.ci = 0; J.t0 = 0; beep(); toast('BOT-7 \u00b7 NIGHT WATCH \u00b7 FOLLOW ME \u00b7 CHECK (E) WHAT I SCAN', 2.8); },
    cur() { return J && J.list ? J.list[J.ci] : null; },
    near(p) { const c = this.cur(); return !!c && Math.hypot(p.x - c.p[0], p.z - c.p[1]) < 1.35; },
    check() { const c = this.cur(); if (!c) return; if (c.st === 0) { toast('WAIT FOR BOT-7 \u00b7 IT IS ON ITS WAY', 1.6); return; }
      if (c.st === 1) { c.st = 2; addGold(5); ding(); toast('CHECKED \u00b7 ' + c.n + ' \u00b7 ALL QUIET', 1.8); this.adv(); } },
    adv() { J.ci++; scanM.visible = false; if (J.ci >= J.list.length) { addGold(6); if (J.t0 < 100) addGold(10); beep(); toast('BOT-7 \u00b7 WATCH COMPLETE \u00b7 YOU ARE LOGGED PRESENT', 2.4); setTimeout(finishGame, 1100); } },
    tick(dt) { J.t0 += dt; const c = this.cur(); if (!c) { ARW.style.display = 'none'; return; } const onF = inFloor(lastP), t = performance.now() / 1000;
      if (c.st === 0) { if (moveBot(c.p[0], c.p[1], dt, 2.2)) { c.st = 1; c.scan = c.T = SCN - J.ci * 0.35; beep(); } }
      else if (c.st === 1) { c.scan -= dt; scanM.visible = true; scanM.position.set(c.p[0], 0.04, c.p[1]); scanM.scale.setScalar(1 + 0.08 * Math.sin(t * 8)); if (c.scan <= 0) { c.st = 3; missOne('BOT-7 LOGGED YOU ABSENT \u00b7 ' + c.n, 2.2); this.adv(); return; } }
      if (onF) arrowTo(toW(c.p[0], 1.4, c.p[1], true), c.st === 1 ? 'CHECK \u00b7 ' + c.n : 'BOT-7 \u2192 ' + c.n); else if (inLobby(lastP)) arrowTo(toW(LLIFT[0], 1.6, LLIFT[1]), 'LIFT \u00b7 FLOOR 12'); else ARW.style.display = 'none';
      const past = J.list.slice(0, J.ci).map(q => (q.st === 2 ? '\u2713 ' : '\u2717 ') + q.n).join(' \u00b7 ');
      setCard('wt' + J.ci + c.st + Math.ceil(c.scan || 0) + (onF ? 1 : 0), head('NIGHT WATCH \u00b7 ' + Math.min(J.ci + 1, WTN) + ' / ' + WTN, goldR()) + '<div style="padding:8px 10px;font-size:13px;font-weight:900">'
        + (!onF ? 'BACK UP TO FLOOR 12' : c.st === 0 ? 'BOT-7 IS ROLLING TO<br><span style="font-size:17px">' + c.n + '</span>' : 'BOT-7 SCANS <span style="font-size:17px">' + c.n + '</span><div style="height:10px;background:#e7e4dc;margin-top:4px"><div style="height:10px;width:' + Math.round(c.scan / c.T * 100) + '%;background:' + (c.scan < 3 ? RED : SLATE) + '"></div></div>')
        + (past ? '<div style="margin-top:4px;font-size:11px">' + past + '</div>' : '') + '</div>' + foot('CHECK (E) WHILE IT SCANS')); } };
  // ---------- 5 OIL THE TENANTS' DOORS: the door swings, a hinge squeaks; oil THAT hinge while it squeaks (tap its band); 4 doors x 3 hinges ----------
  const OLT = 14, OIL_D = ['FLAT 12A', 'FLAT 12C', 'FLAT 12E', 'FLAT 12H'], HNG = ['TOP', 'MIDDLE', 'BOTTOM'];
  GD.oil = { F: true, shot: () => [toW(-2.4, 1.2, 3.6, true), 2.2, 2.6, 0.12, 2.2, 0, 5],
    begin() { goRoom(-2.4, 4.7, Math.PI, true); J.list = OIL_D.map(n => ({ n, oil: [false, false, false] })); J.ci = 0; J.cueT = OLT; J.wait = 0.4; J.sq = null; J.sqT = 0.7; J.drops = []; snapK = true;
      keyAct(e => { const k = { Digit1: 0, Digit2: 1, Digit3: 2 }[e.code]; if (k == null) return false; if (!e.repeat) this.tap(k); return true; }); this.draw(); },
    draw() { const c = J.list[J.ci]; showPanel(panelHead((c ? "OIL THE DOOR \u00b7 " + c.n : "OIL THE TENANTS' DOORS") + ' \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('4/5') + timeRow : doneMsg('NOT ONE SQUEAK ON TWELVE')) + tipBar('WHEN A HINGE SQUEAKS, TAP ITS ROW \u00b7 TOP / MIDDLE / BOTTOM'));
      const cv = PANEL.querySelector('[data-cv]'); if (cv) cv.onpointerdown = e => { e.preventDefault(); const r = cv.getBoundingClientRect(); this.tap(clamp(Math.floor((e.clientY - r.top) / r.height * 3), 0, 2)); }; },
    tap(hI) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0;
      if (c.oil[hI]) { missOne('ALREADY OILED \u00b7 OIL ON THE CARPET'); return; }
      if (!J.sq || J.sq.h !== hI) { missOne('WAIT FOR THE SQUEAK \u00b7 OIL ON THE CARPET'); return; }
      c.oil[hI] = true; J.sq = null; J.drops.push({ h: hI, t: 0.8 }); addGold(2); tone(420, 0.05, 0.18, 'triangle'); okTip(HNG[hI] + ' HINGE \u00b7 QUIET');
      if (c.oil.every(Boolean)) { addGold(4); ding(); okTip(c.n + ' \u00b7 SILENT AS A SLEEPING BOT'); J.wait = 0.9; setTimeout(() => this.next(), 800); } },
    next() { J.sq = null; J.sqT = 0.8; J.drops = []; roundNext(this, 'oil', OLT); },
    tick(dt) { const c = J.list[J.ci]; J.drops = J.drops.filter(d => (d.t -= dt) > 0);
      if (c && J.wait <= 0) { if (J.sq && (J.sq.t -= dt) <= 0) J.sq = null; J.sqT -= dt;
        if (!J.sq && J.sqT <= 0) { const rust = [0, 1, 2].filter(i => !c.oil[i]); if (rust.length) { const hI = pick1(rust); J.sq = { h: hI, t: Math.max(0.55, 0.9 - J.ci * 0.1) }; J.sqT = rnd(0.9, 1.5); tone(1700 + hI * 400, 0.025, 0.3, 'sawtooth'); tone(2100 + hI * 400, 0.02, 0.2, 'sawtooth', 0.12); } } }
      roundTick(this, dt, OLT, 'TOO SLOW \u00b7 THE TENANT HEARD EVERY SQUEAK', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, t = performance.now() / 1000, a = 0.55 + 0.45 * Math.sin(t * 1.7), x0 = w * 0.2, dw = w * 0.5 * Math.cos(a), y0 = h * 0.06, y1 = h * 0.94;
      g.fillStyle = '#e4e6e8'; g.fillRect(0, 0, w, h); g.fillStyle = INK; g.fillRect(x0 - 8, y0 - 8, w * 0.54 + 16, y1 - y0 + 8); g.fillStyle = '#2a3242'; g.fillRect(x0, y0, w * 0.54, y1 - y0);
      g.fillStyle = '#6b7480'; g.fillRect(x0, y0, dw, y1 - y0); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x0, y0, dw, y1 - y0); g.fillStyle = GOLD; g.beginPath(); g.arc(x0 + dw * 0.85, h * 0.52, Math.max(4, w * 0.015), 0, 7); g.fill();
      for (let i = 0; i < 3; i++) { const yc = h * (0.18 + i * 0.32); g.fillStyle = 'rgba(32,30,29,0.06)'; if (i === 1) g.fillRect(0, h / 3, w, h / 3); g.fillStyle = c.oil[i] ? LEAF : COPPER; g.fillRect(x0 - 10, yc - h * 0.05, 20, h * 0.1); g.strokeRect(x0 - 10, yc - h * 0.05, 20, h * 0.1);
        g.fillStyle = INK; g.font = '900 13px Archivo, sans-serif'; g.textAlign = 'right'; g.fillText(HNG[i] + (c.oil[i] ? ' \u2713' : ''), w - 8, yc + 5); }
      if (J.sq) { const yc = h * (0.18 + J.sq.h * 0.32), j = Math.sin(t * 60) * 2; g.fillStyle = RED; g.fillRect(x0 + 18, yc - 18 + j, 92, 32); g.fillStyle = '#fff'; g.textAlign = 'left'; g.font = '900 18px Archivo, sans-serif'; g.fillText('EEEEK!', x0 + 26, yc + 5 + j); }
      for (const d of J.drops) { const yc = h * (0.18 + d.h * 0.32) + (0.8 - d.t) * 30; g.fillStyle = '#c9a032'; g.beginPath(); g.arc(x0, yc, 6, 0, 7); g.fill(); }
      g.textAlign = 'left'; } };
  // ---------- 6 CHARGE THE BOTS: four bots, one cable; HOLD a bot to charge it; keep all four awake for 30 s, never over 100 % ----------
  const CHT = 30, BOTS = ['BOT-1', 'BOT-2', 'BOT-3', 'BOT-4'];
  GD.charge = { F: true, shot: () => [toW(5.0, 0.9, -9.0, true), 8.2, 2.6, 0.22, 3, 0, 9],
    begin() { goRoom(5.2, -6.0, Math.PI, true); J.list = [0]; J.ci = 0; J.b = [0.72, 0.55, 0.85, 0.62]; J.r = shuffle([0.034, 0.046, 0.052, 0.062]); J.ch = -1; J.lock = -1; J.time = 0; J.fin = false; snapK = true;
      keyAct(e => { const k = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[e.code]; if (k == null) return false; if (!e.repeat) { J.ch = k; J.idle = 0; } return true; }, e => { const k = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[e.code]; if (k == null) return false; if (J.ch === k) { J.ch = -1; J.lock = -1; } return true; }); this.draw(); },
    draw() { showPanel(panelHead('CHARGE THE BOTS', goldR()) + body(!J.fin ? '<div data-left style="font-size:15px;font-weight:900"></div>' + timeRow + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-auto-rows:minmax(88px,1fr);gap:8px;flex:1;min-height:0">'
        + BOTS.map((n, i) => '<button data-c="' + i + '" style="' + BTN + ';display:flex;flex-direction:column;justify-content:space-between;gap:6px;touch-action:none"><span style="font-size:18px">' + n + '</span><span data-p style="font-size:13px"></span><span style="display:block;width:100%;height:14px;background:#e7e4dc;border:2px solid #201e1d;box-sizing:border-box"><span data-bar style="display:block;height:100%;width:50%;background:#4f8a3a"></span></span></button>').join('') + '</div>'
        : doneMsg('FOUR BOTS, ALL AWAKE, ALL HUMMING')) + tipBar('HOLD A BOT TO CHARGE IT \u00b7 ONE CABLE \u00b7 STOP BEFORE 100 %'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { const i = +b.dataset.c; b.onpointerdown = e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} J.ch = i; J.idle = 0; }; b.onpointerup = b.onpointercancel = () => { if (J && J.ch === i) { J.ch = -1; J.lock = -1; } }; }); this.paint(); },
    paint() { if (J.fin) return; PANEL.querySelectorAll('[data-c]').forEach(b => { const i = +b.dataset.c, v = J.b[i], on = J.ch === i && J.lock !== i; b.style.background = on ? YEL : v < 0.2 ? '#f6c9c0' : '#fff';
        const p = b.querySelector('[data-p]'), bar = b.querySelector('[data-bar]'); if (p) p.textContent = (on ? 'CHARGING \u00b7 ' : v < 0.2 ? 'LOW \u00b7 ' : '') + Math.round(v * 100) + ' %'; if (bar) { bar.style.width = (clamp(v, 0, 1) * 100).toFixed(0) + '%'; bar.style.background = v > 0.9 ? RED : v < 0.2 ? RED : LEAF; } });
      const l = PANEL.querySelector('[data-left]'); if (l) l.textContent = 'SHIFT LEFT ' + Math.max(0, Math.ceil(CHT - J.time)) + ' S'; },
    tick(dt) { if (J.fin) return; J.idle = (J.idle || 0) + dt; J.time += dt; const k = 1 + J.time / CHT * 0.9;
      for (let i = 0; i < 4; i++) { if (i === J.ch && J.lock !== i) J.b[i] += 0.3 * dt; else J.b[i] -= J.r[i] * k * dt;
        if (J.b[i] > 1) { J.b[i] = 0.82; J.lock = i; spark(); missOne(BOTS[i] + ' OVERCHARGED \u00b7 SPARKS! LET GO'); }
        if (J.b[i] <= 0) { J.b[i] = 0.4; tone(150, 0.05, 0.5, 'sine'); missOne(BOTS[i] + ' FELL ASLEEP \u00b7 SNORE'); } }
      timeBar(PANEL.querySelector('[data-time]'), 1 - J.time / CHT, J.time > CHT - 5); this.paint();
      if (J.idle > 3 && !J.hinted) { J.hinted = true; let lo = 0; for (let i = 1; i < 4; i++) if (J.b[i] < J.b[lo]) lo = i; pulse(PANEL.querySelector('[data-c="' + lo + '"]')); }
      if (J.time >= CHT) { J.fin = true; J.ci = 1; J.ch = -1; addGold(6 + J.b.filter(v => v > 0.25).length); ding(); this.draw(); setTimeout(finishGame, 800); } } };
  // ================= PRIZES (building-themed) =================
  const SUIT = { outfit: 'vest', torso: ['#334155', '#e7e4dc', '#3fd3ff'], name: 'FLEET COVERALLS' };
  const GIFT = { suit: 'FLEET COVERALLS. A pocket for every spanner. The Tailor has a copy.', half: 'Three jobs. FLAT 12G is half price now. The engineers will grumble.', trophy: 'All six. The GOLDEN SPANNER, 60 gold, and FLAT 12G rent free. Got a minute?' };
  function giveGift() { save.setStat('spaClears', save.stat('spaClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('spaSuit', false)) { save.setStat('spaSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 3 && !save.stat('spaHalf', false)) { save.setStat('spaHalf', true); return 'half'; }
    if (nd >= GAMES.length && !save.stat('spaAll', false)) { save.setStat('spaAll', true); save.give('goldenSpanner'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function coilCheck(then) { if (!allThree() || save.stat('spaCoil', false)) { then && then(); return false; } save.setStat('spaCoil', true); save.addRelic('hummingCoil'); coil.visible = true; ding();
    sayTo(T_MG, [mgLn('Three stars on every job. Take THE HUMMING COIL. It hums. Of course it hums.')], () => { toast('RELIC \u00b7 THE HUMMING COIL', 2.6); then && then(); }); return true; }
  // ================= FLAT 12G: rent per game week (by the tower), sleep, chest, trophy shelf =================
  const free = () => !!save.stat('spaAll', false), price = () => (free() ? 0 : save.stat('spaHalf', false) ? 22 : 45);
  const rented = () => free() || save.stat('spaRentTo', 0) >= today(), daysLeft = () => Math.max(0, save.stat('spaRentTo', 0) - today() + 1);
  function rentFlat() { const p = price(); if (p > 0 && !save.spend(p)) { sayTo(T_MG, [mgLn(p + ' gold a week. The engineers pay on time. Come back with more.')]); return; }
    coin(); const from = Math.max(today(), save.stat('spaRentTo', 0) + 1); save.setStat('spaRentTo', from + 6); if (!save.count('saptKey')) save.give('saptKey'); drawSign();
    sayTo(T_MG, [mgLn((save.stat('spaRented', 0) ? 'Renewed. Seven more days by the tower. ' : 'FLAT 12G is yours for the week. Key. ') + 'Lift on the left, floor twelve.')]); save.setStat('spaRented', save.stat('spaRented', 0) + 1); }
  function flatMenu() { const r = rented(), ch = [];
    if (free()) ch.push({ text: 'THANK YOU FOR THE FREE FLAT', pick: () => sayTo(T_MG, [mgLn('You earned it. BOT-7 will guard your door. Whether you like it or not.')]) });
    else ch.push({ text: (r ? 'RENEW \u00b7 +7 DAYS \u00b7 ' : 'RENT FLAT 12G \u00b7 ') + price() + ' G A WEEK', pick: rentFlat });
    ch.push({ text: 'WHAT DOES THE FLAT HAVE?', pick: () => sayTo(T_MG, [mgLn('A bed, a chest, a trophy shelf, and a view of the tower. The hum is free.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(T_MG, [{ ...mgLn(free() ? 'FLAT 12G is yours, rent free, for good.' : r ? 'FLAT 12G is yours for ' + daysLeft() + ' more day' + (daysLeft() === 1 ? '' : 's') + '. Renew any time.' : 'FLAT 12G, floor twelve. Tower view. ' + price() + ' gold a week.'), choices: ch }]); }
  const lab = id => (ITEM_LABELS[id] || String(id).replace(/([A-Z])/g, ' $1')).toUpperCase(), chestIn = () => save.stat('spaChest', null) || {};
  const T_CH = () => ({ key: 'saptChest', name: 'YOUR CHEST', role: 'FLAT 12G', obj: FG, r: 3 }), chLn = ln('YOUR CHEST', 'FLAT 12G');
  function chest() { const bag = Object.entries((save.data && save.data.items) || {}).filter(q => q[1] > 0 && q[0] !== 'saptKey').sort((a, b) => b[1] - a[1]).slice(0, 5), box2 = Object.entries(chestIn()).filter(q => q[1] > 0).slice(0, 5);
    const ch = [...bag.map(([id, n]) => ({ text: 'STORE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { if (!save.take(id, n)) return; const L = { ...chestIn() }; L[id] = (L[id] || 0) + n; save.setStat('spaChest', L); tone(330, 0.05, 0.2); toast('STORED \u00b7 ' + lab(id), 2); drawShelf(); } })),
      ...box2.map(([id, n]) => ({ text: 'TAKE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { const L = { ...chestIn() }; delete L[id]; save.setStat('spaChest', L); save.give(id, n); tone(440, 0.05, 0.2); toast('TAKEN \u00b7 ' + lab(id), 2); drawShelf(); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(T_CH(), [{ ...chLn(box2.length ? 'Your chest. ' + box2.length + ' kind' + (box2.length > 1 ? 's' : '') + ' of thing inside. It hums a little.' : 'Your chest. Empty. Store what you like.'), choices: ch }]); }
  function sleepHere() { fade(() => { const d = sleep(); heal(9999); goRoom(-7.8, -5.6, Math.PI, true); toast('GOOD MORNING \u00b7 DAY ' + (d || today()) + ' \u00b7 BOT-7 LOGGED YOU ASLEEP \u00b7 FULL HEALTH', 3); drawSign(); }); }
  function useItem(id) { if (id === 'goldenSpanner' && save.count('goldenSpanner')) { tone(1800, 0.05, 0.4, 'triangle'); toast('THE GOLDEN SPANNER \u00b7 SIX FOR SIX AT SPIRE APARTMENTS \u00b7 IT FITS NOTHING', 2.4); return true; }
    if (id === 'saptKey' && save.count('saptKey')) { toast(rented() ? 'FLAT 12G KEY \u00b7 ' + (free() ? 'RENT FREE' : daysLeft() + ' DAYS LEFT') : 'FLAT 12G KEY \u00b7 THE RENT RAN OUT \u00b7 SEE THE MANAGER', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { hum: 'The tower hums through every wall. Match the hum with your wave and lock it out. Five times.',
    fuse: 'The fuses tripped again. Watch the order they go, then reset them backwards. Last one first.',
    mail: 'Robot parts come in the post. Each flat wants one kind. Red fleet stamps go down the chute.',
    watch: 'Night watch with BOT-7. When it scans a door, go and check it too. It logs who is late.',
    oil: 'The doors on twelve squeak. Oil each hinge while it squeaks. Oil on the carpet costs us.',
    charge: 'Four bots on the chargers, one cable. Keep them all awake. Never overcharge. They sulk.' };
  const DONE = { hum: 'Quiet. The fleet says the hum is normal. Now it is gone. Normal.', fuse: 'Lights on. Lift on. The roof sign says SPIRE again, not PIRE.', mail: 'Every gear in the right box. The engineers are thrilled. Quietly.',
    watch: 'BOT-7 logged you present. Every door. It likes you. I think.', oil: 'Silent doors. Now nobody knows when anybody comes home.', charge: 'All four awake and topped up. They hummed at you. That means thank you.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const nextF = () => { const d = done(), f = GAMES.filter(q => q.F), n = f.find(q => !d[q.k]); return (n || f.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const inLobby = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inFloor = P => !!P && Math.abs(P.x - FOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const T = inFloor(lastP) && GN[g].F ? T_VO : T_MG; sayTo(T, [(T === T_VO ? voLn : mgLn)(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('spaVisits', save.stat('spaVisits', 0) + 1); J = { g, miss: 0, gold: 0, t: 0, F: !!GN[g].F }; busy = GD[g].errand ? 'errand' : 'job'; ding(); fade(() => GD[g].begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('spaDone', d); save.setStat('spaLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none'; scanM.visible = false;
    const say = () => { const L1 = [mgLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(mgLn(GIFT[gift])); K.finish(g, stars, gold, first); drawSign(); for (let k = 0; k < 4; k++) tone(1200 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T_MG, L1, () => { if (busy === 'end') { busy = null; J = null; } coilCheck(); }); };
    fade(() => { cleanup(); goRoom(0, -4.4, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; J.dir = 0; J.ch = -1; } hidePanel(); hideCard(); ARW.style.display = 'none'; scanM.visible = false; keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2];
    bot7.name = 'saptBot7'; bot7.position.set(BOTPAD[0], 0, BOTPAD[1]); bot7.rotation.set(0, Math.PI / 2, 0); DLAMP.forEach(m => m.material.color.set(GLOW)); }
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
  const nearMg = p => nearL(p, 0, -5, 2.4), atLiftL = p => nearL(p, LLIFT[0], LLIFT[1], 1.6), atLiftF = p => nearL(p, 0, 9.0, 1.2), nearVo = p => nearL(p, VO0[0] - 1.2, VO0[1], 1.6), nearBot = p => nearL(p, bot7.position.x, bot7.position.z, 1.4);
  const atFlatDoor = p => nearL(p, -5.3, 4.6, 1.1), spotAt = p => Object.keys(SPOTS).find(k => nearL(p, SPOTS[k][0], SPOTS[k][1], 0.9));
  const sceneReady = () => save.stat('spaAll', false) && !save.stat('spaScene', false);
  function prompt(P) {
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) return 'LIFT \u00b7 UP TO FLOOR 12'; return null; }
      if (inFloor(P)) { const p = toF(P), c = GD.watch.cur(); if (c && GD.watch.near(p)) return (c.st === 1 ? 'CHECK \u00b7 ' : 'WAIT FOR BOT-7 \u00b7 ') + c.n; if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY'; } return null; }
    if (busy) return null;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftL(p)) return 'LIFT \u00b7 FLOOR 12 \u00b7 FLATS + BOT BAY';
      if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearMg(p)) return sceneReady() ? 'TALK \u00b7 BUILDING MANAGER \u00b7 A WORD' : 'TALK \u00b7 BUILDING MANAGER'; return null; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY';
      if (atFlatDoor(p) && !rented()) return 'FLAT 12G \u00b7 FOR RENT \u00b7 SEE THE MANAGER'; const s = spotAt(p); if (s && rented()) return s === 'bed' ? 'BED \u00b7 SLEEP TILL MORNING' : s === 'chest' ? 'YOUR CHEST \u00b7 STORE + TAKE' : 'TROPHY SHELF';
      if (nearVo(p)) return 'TALK \u00b7 ENGINEER VOLT'; if (nearBot(p)) return 'TALK \u00b7 BOT-7'; return null; }
    return null; }
  let talkM = save.stat('spaTalked', 0), talkV = 0, talkB = 0;
  const MG_HI = ['Back again. The hum says hello. Every second.', 'BOT-7 logged you at the door. It logs everyone.', 'The engineers fixed the kettle. Now it walks.'];
  function mMenu() { const first = !talkM; talkM++; save.setStat('spaTalked', talkM); if (coilCheck()) return;
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) }, { text: 'PICK A JOB', pick: () => sayTo(T_MG, [{ ...mgLn('Which one? The night watch, the doors and the bots are up on twelve.'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase() + (q.F ? ' \u00b7 FLOOR 12' : ''), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'YOUR FLAT \u00b7 FLAT 12G', pick: flatMenu }];
    if (sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneBots() });
    ch.push({ text: 'WHAT IS THE HUM?', pick: () => sayTo(T_MG, [mgLn('The Machine Fleet tower. They say it is normal. They say that a lot.')]) });
    if (save.stat('spaScene', false)) ch.push({ text: 'THE NIGHT BOTS?', pick: () => sayTo(T_MG, [mgLn('Still on night watch. Still VAX plates. Still not asking.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_MG, [mgLn('Goodbye. Mind BOT-7. It does not brake.')]) });
    sayTo(T_MG, [{ ...mgLn(first ? 'Spire Apartments. Six jobs, one flat by the tower. Bring earplugs.' : sceneReady() ? 'Six for six. I owe you something true. Got a minute?' : MG_HI[(talkM - 2) % MG_HI.length]), choices: ch }]); }
  function sceneBots() { busy = 'scene'; save.setStat('spaScene', true);
    const end = () => { busy = null; save.setStat('storySpireBots', true); toast('STORY \u00b7 VAX BOTS WATCH THE SPIRE', 2.6); coilCheck(); };
    sayTo(T_MG, [mgLn('You know every bot in this building now. So look at BOT-7\'s back plate.'), { ...mgLn('It says VAX. The fleet never bought the night bots. VAX gave them away. Free.'), choices: [
      { text: 'WHY GIVE BOTS AWAY?', pick: () => sayTo(T_MG, [mgLn('Bots that watch at night see everything. Free is never free.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T_MG, [mgLn('Quietly. BOT-7 is listening. Probably.')], end) }] }]); }
  const VO_LINES = ['BOT-7 is my favourite. Do not tell the others. They can hear.', 'I build bots by day. By night I listen to the tower.', 'Charge them slowly. A fast charge makes them giddy.', 'The doors on twelve squeak in B flat. I checked.'];
  function vMenu() { talkV++; sayTo(T_VO, [{ ...voLn(VO_LINES[(talkV - 1) % VO_LINES.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextF()) }, { text: 'WHO OWNS THE NIGHT BOTS?', pick: () => sayTo(T_VO, [voLn('Not me. They came in a crate. Free. Free is nice.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const BOT_LINES = ['BEEP. NIGHT WATCH: 20:00 TO 6:00. YOU ARE LOGGED.', 'BEEP. ALL DOORS: QUIET. ONE DOOR: SQUEAKS.', 'BEEP BOOP. I DO NOT SLEEP. I CHARGE.', 'BEEP. HELLO, TENANT. OR VISITOR. LOGGING.'];
  const T_BOT = () => ({ key: 'saptBot7', name: 'BOT-7', role: 'NIGHT WATCH \u00b7 FLOOR 12', obj: bot7, r: 3 });
  const upLift = () => { liftDing(); fade(() => goRoom(0, 7.6, Math.PI, true)); setTimeout(() => KF.chime(), 500); };
  const downLift = () => { liftDing(); fade(() => go(OX + LLIFT[0] + 0.6, LY, LZ + LLIFT[1], Math.PI / 2)); };
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true;
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) { upLift(); return true; } return false; }
      if (inFloor(P)) { const p = toF(P); if (GD.watch.near(p)) { GD.watch.check(); return true; } if (atLiftF(p)) { downLift(); return true; } } return false; }
    if (busy) return false;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) { startGame(r.k); return true; } if (atLiftL(p)) { upLift(); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; } if (nearMg(p)) { tone(1320, 0.05, 0.5); mMenu(); return true; } return false; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) { startGame(r.k); return true; } if (atLiftF(p)) { downLift(); return true; }
      if (atFlatDoor(p) && !rented()) { toast('FLAT 12G \u00b7 ' + price() + ' G A WEEK \u00b7 SEE THE MANAGER IN THE LOBBY', 2.6); return true; }
      const s = spotAt(p); if (s && rented()) { if (s === 'bed') sleepHere(); else if (s === 'chest') chest(); else { const n = GOLDS().length; toast(n ? 'TROPHY SHELF \u00b7 ' + n + ' GOLDEN PRIZE' + (n > 1 ? 'S' : '') : 'TROPHY SHELF \u00b7 EMPTY \u00b7 WIN SOME GOLD', 2.4); } return true; }
      if (nearVo(p)) { tone(1320, 0.05, 0.5); vMenu(); return true; }
      if (nearBot(p)) { beep(); talkB++; sayTo(T_BOT(), [{ who: 'BOT-7', role: 'NIGHT WATCH \u00b7 FLOOR 12', text: BOT_LINES[(talkB - 1) % BOT_LINES.length] }]); return true; } return false; }
    return false; }
  // ================= per frame =================
  const HUM_LINES = ['THE SPOONS ARE RATTLING AGAIN.', 'MY TEETH ARE HUMMING.', 'IS THAT THE TOWER OR THE FRIDGE?', 'BOT-7 SAYS: ALL QUIET.', 'MMMMMMMMMMMMMMMM.'];
  let dayCheck = 0, amb = 10, spawned = !/[?&]spawn=(spireapts|spirefloor)(&|$)/.test(location.search), spawnT = 0, wasR = null;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; const f = /spawn=spirefloor/.test(location.search); goRoom(0, 7.6, Math.PI, f); }
    const inL = inLobby(P), inF = inFloor(P); G.visible = inL || (busy === 'job' && !!J && !J.F); FG.visible = inF || (busy === 'job' && !!J && J.F);
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; const r = rented(); if (r !== wasR) { wasR = r; doorM.visible = !r; doorCol.y0 = r ? 999 : LY - 3; drawSign(); }
      if (inL) { spanner.visible = !!save.stat('spaAll', false); coil.visible = !!save.stat('spaCoil', false); }
      if (inF) { drawShelf(); const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); const tint = n ? '#5a6488' : dusk ? '#f0d0b0' : '#ffffff'; winM.color.set(tint); viewM.color.set(tint); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('spire apts job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; if (!busy) m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
    for (const k in spotMeshes) spotMeshes[k].visible = !busy && rented();
    if (G.visible) { const q = done().hum ? 0.15 : 0.5; cc.set(GLOW).multiplyScalar(1 - q + q * Math.abs(Math.sin(t * 7.5))); humM.color.copy(cc); coil.rotation.y = t * 0.8; }
    if (FG.visible) { const p = toF(P); kit.animFox(volt, dt, 0, false); if (!busy && nearL(p, volt.position.x, volt.position.z, 3.5)) turnTo(volt, Math.atan2(p.x - volt.position.x, p.z - volt.position.z), dt, 3); else { turnTo(volt, VO0[2], dt, 2); armUp(volt, 1, 0.5 + Math.sin(t * 2.2) * 0.25, -0.9); }
      if (!(busy === 'errand' && J && J.g === 'watch')) { const h = hour(), night = h >= 20 || h < 6;
        if (night && !busy) { const w = PATROL[patrolI]; if (moveBot(w[0], w[1], dt, 0.9)) patrolI = 1 - patrolI; } else moveBot(BOTPAD[0], BOTPAD[1], dt, 1.2);
        if (!busy && nearL(p, bot7.position.x, bot7.position.z, 2.6) && Math.hypot(bot7.position.x - BOTPAD[0], bot7.position.z - BOTPAD[1]) < 0.2) turnTo(bot7, Math.atan2(p.x - bot7.position.x, p.z - bot7.position.z), dt, 3); }
      if (busy === 'job' && J && J.g === 'charge' && J.b) DLAMP.forEach((m, i) => m.material.color.set(J.b[i] < 0.2 ? RED : J.ch === i && J.lock !== i ? YEL : GLOW));
      else DLAMP.forEach((m, i) => m.material.color.set(Math.sin(t * 2 + i * 1.7) > 0.6 ? YEL : GLOW));
      if (inF && !busy && (amb -= dt) <= 0) { const quiet = !!done().hum; amb = (quiet ? 55 : 26) + Math.random() * 14; tone(55, 0.04, 1.2, 'sine'); toast((quiet ? '(A SOFT HUM) ' : '(THE TOWER HUMS) ') + pick1(HUM_LINES), 2.4); } }
    K.tick(dt, toL(P), { inShop: inL, busy: !!busy, near: 0, talking: false, clear: endClear > 0 ? [0, -4.4, 2.6] : null });
    KF.tick(dt, toF(P), { inShop: inF, busy: !!busy, near: 0, talking: false }); }
  drawShelf();
  const API = { group: G, floor: FG, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading, rented: rented(), price: price() }),
    spawn: { spireapts: [OX, LZ + 7.6, Math.PI, LY], spirefloor: [FOX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), scene: sceneBots, up: upLift, down: downLift, rent: rentFlat, keeper, volt, bot7,
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    _view(p, l, F = false, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p, F)); c.lookAt(toW(...l, F)); c.updateMatrixWorld(); return c; },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); KF.dispose(); } };
  window.__spireApts = API; return API;
}
