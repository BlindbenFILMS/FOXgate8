// MERU 2.0 — s147 DECO APARTMENTS [meruDecoApts] (cluster apartments 4 of 4; Ben's picks s143/s144: jobs unique to this building, all 6 ideas ·
// LIFT → FLOOR 3 (new room) with FLAT 3G for rent (the tenant who left with the doorknobs; pay per game week at the manager) · flat = SLEEP + STORAGE CHEST + TROPHY SHELF ·
// prizes: DECO TAILCOAT (1st clear, Tailor) · HALF RENT (3 jobs) · GOLDEN DOORKNOB + 60 G + FREE RENT (all 6) + the manager's SECOND SLOT scene · relic THE SUNBURST CLOCK (3 stars on all)).
// LOBBY jobs: COUNT THE RENT BOX (TWICE) · CHANGE THE LOCKS · POLISH THE ART DECO TRIM. FLOOR 3 jobs: PUT BACK THE DOORKNOBS (walk) · CATCH THE MIDNIGHT JUGGLERS · DELIVER THE RENT NOTICES.
// Made from worlds/meru2-spireapts.js (same kit). Stats prefix dca.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { ITEM_LABELS } from './meru-shops.js';
export function buildDecoApts({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, clusters, go, heal = () => {}, sleep = () => 1 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'decoApts'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, OX = LR.ox, RH = 4.4;
  const SR = clusters.addRoom({ key: 'decoFloor', room: 'meruDecoApts', title: 'DECO APARTMENTS \u00b7 FLOOR 3' }, RH); SR.out = LR.out; const FOX = SR.ox;
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#efe6d2', STEEL = '#9aa0a6', PLUM = '#3d2563', VIO = '#7c4dc4', GOLD = '#d7ad52', OAK = '#a77b4f', DKW = '#5a3d26', COPPER = '#b8733a', LEAF = '#4f8a3a', IVORY = '#f4ecd8', GLASS = '#9fd8e8', SLATE = PLUM, GUN = '#4a3a5a', GLOW = GOLD, ACC = PLUM;
  const rectL = (a, b, c, d, F) => { const o = { f: [(F ? FOX : OX) + a, (F ? FOX : OX) + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }; cols.push(o); return o; }, circL = (x, z, r, F) => cols.push({ c: [(F ? FOX : OX) + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'decoAptsLobby'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const FG = new THREE.Group(); FG.name = 'decoAptsFloor'; FG.position.set(FOX, LY, LZ); scene.add(FG); FG.visible = false;
  const toW = (x, y, z, F) => V((F ? FOX : OX) + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ }), toF = P => ({ x: P.x - FOX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('dcaDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#3d2563', '#d7ad52', '#201e1d'], ['#7c4dc4', '#e7e4dc', '#3d2563'], ['#a33a4a', '#f4ecd8', '#201e1d'], ['#2e4a6b', '#d7ad52', '#1f2f45']];
  const LET = 'ABCDEF';
  const fitTxt = (g, t, s, max) => { g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(t).width > max && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } };
  // the view from floor 3: dusk over stepped deco roofs, the Pepper Building with its gold crown
  const cityArt = (g, W, H) => { const sk = g.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#2a1f4a'); sk.addColorStop(0.7, '#8a5a7a'); sk.addColorStop(1, '#e0a878'); g.fillStyle = sk; g.fillRect(0, 0, W, H);
    for (let k = 0; k < 12; k++) { const x = k * W / 12 + ((k * 37) % 9), bw = W * 0.06, bh = H * (0.25 + ((k * 29) % 7) / 18); g.fillStyle = k % 3 ? '#3a2a4a' : '#4a3658'; g.fillRect(x, H - bh, bw, bh); g.fillRect(x + bw * 0.2, H - bh - H * 0.06, bw * 0.6, H * 0.06); g.fillRect(x + bw * 0.4, H - bh - H * 0.12, bw * 0.2, H * 0.06);
      g.fillStyle = YEL; for (let j = 0; j < 4; j++) if ((k + j) % 3) g.fillRect(x + bw * 0.3, H - bh + H * 0.06 + j * H * 0.08, bw * 0.4, Math.max(2, H * 0.025)); }
    const px = W * 0.4, pw = W * 0.08; g.fillStyle = '#1f1530'; g.fillRect(px, H * 0.12, pw, H * 0.88); g.fillStyle = GOLD; g.beginPath(); g.moveTo(px - pw * 0.1, H * 0.12); g.lineTo(px + pw / 2, H * 0.02); g.lineTo(px + pw * 1.1, H * 0.12); g.fill(); g.fillStyle = RED; g.fillRect(px + pw * 0.1, H * 0.2, pw * 0.8, H * 0.04); };
  const sunArt = (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); const cx = W / 2, cy = H; for (let i = 0; i < 13; i++) { const a0 = Math.PI + i * Math.PI / 13; g.fillStyle = i % 2 ? GOLD : '#8a6a2a'; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, Math.hypot(W, H), a0, a0 + Math.PI / 13); g.closePath(); g.fill(); }
    g.fillStyle = PLUM; g.beginPath(); g.arc(cx, cy, H * 0.28, Math.PI, 0); g.fill(); g.strokeStyle = GOLD; g.lineWidth = Math.max(3, H * 0.03); g.stroke(); g.strokeStyle = INK; g.lineWidth = 3; for (let k = 1; k <= 2; k++) g.strokeRect(k * 6, k * 6, W - k * 12, H - k * 12); };
  const trimArt = bright => (g, W, H) => { g.fillStyle = PLUM; g.fillRect(0, 0, W, H); g.strokeStyle = bright ? GOLD : '#7a6a4a'; g.lineWidth = bright ? 12 : 9; g.lineJoin = 'miter';
    g.beginPath(); for (let i = 0; i <= 6; i++) g.lineTo(W * (0.08 + i * 0.14), H * (i % 2 ? 0.12 : 0.3)); g.stroke();
    for (let i = 0; i < 7; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 7; g.beginPath(); g.moveTo(W / 2, H * 0.92); g.lineTo(W / 2 + Math.cos(a) * W * 0.42, H * 0.92 + Math.sin(a) * W * 0.42); g.stroke(); } g.lineWidth = 6; g.strokeRect(8, 8, W - 16, H - 16); };
  // ================= LOBBY extras: RENT BOX (left wall by the lifts), DECO TRIM panel (left front), LOCK BENCH (right front), sunburst over the desk =================
  const R0 = mk(), { box, cyl, sph } = R0;
  box(0.7, 1.0, 0.9, PLUM, -9.4, 0.5, -1.4); box(0.74, 0.06, 0.94, GOLD, -9.4, 1.02, -1.4); box(0.6, 0.5, 0.7, GOLD, -9.4, 1.3, -1.4); box(0.04, 0.04, 0.36, INK, -9.09, 1.45, -1.4); box(0.05, 0.16, 0.14, '#8a6a2a', -9.08, 1.2, -1.4); rectL(-9.85, -9.0, -1.9, -0.9);
  box(0.12, 2.3, 2.3, GOLD, -9.88, 1.7, 5.6); rectL(-9.98, -9.7, 4.4, 6.8);
  box(0.8, 0.9, 1.8, OAK, 9.5, 0.45, 5.6); box(0.84, 0.05, 1.84, GOLD, 9.5, 0.92, 5.6); for (let i = 0; i < 4; i++) cyl(0.07, 0.07, 0.14, GOLD, 9.4, 1.01, 5.0 + i * 0.4, 10); box(0.06, 1.0, 1.4, DKW, 9.86, 1.9, 5.6);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 5; i++) box(0.03, 0.12, 0.05, j === 1 && i === 2 ? RED : GOLD, 9.82, 2.2 - j * 0.3, 5.05 + i * 0.27); rectL(9.05, 9.98, 4.6, 6.6);
  R0.mesh(G);
  const trimT = CT(256, 256, trimArt(false)); planeT(trimT, 2.0, 2.0, -9.8, 1.7, 5.6, Math.PI / 2, G); let trimB = false; const drawTrim = b => { trimB = b; trimArt(b)(trimT.userData.c.getContext('2d'), 256, 256); trimT.needsUpdate = true; };
  planeT(CT(512, 256, sunArt), 3.2, 1.6, 4.6, 3.0, -9.83, 0, G);
  planeT(plate('COUNT THE RENT BOX', 384, 96, INK, PAPER, GOLD), 1.4, 0.34, -9.83, 2.9, -1.4, Math.PI / 2, G); planeT(plate('RENT BOX \u00b7 ALL OF IT \u00b7 PLEASE', 512, 96, PLUM, PAPER, GOLD), 1.5, 0.28, -9.83, 2.4, -1.4, Math.PI / 2, G);
  planeT(plate('POLISH THE TRIM', 384, 96, INK, PAPER, GOLD), 1.4, 0.34, -9.79, 3.15, 5.6, Math.PI / 2, G); planeT(plate('CHANGE THE LOCKS', 384, 96, INK, PAPER, RED), 1.4, 0.34, 9.82, 2.75, 5.6, -Math.PI / 2, G);
  planeT(plate('LIFT \u00b7 FLOOR 3 \u00b7 BALLROOM', 512, 96, PLUM, PAPER, GOLD), 1.7, 0.32, -9.74, 3.15, -4, Math.PI / 2, G);
  const LLIFT = [-8.4, -4];
  // ================= FLOOR 3: hall (south, FLATS 3A-3F), FLAT 3G (north-west, for rent), BALLROOM (north-east: parquet, piano, the midnight juggling club) =================
  const F0 = mk(), fb = F0.box, fc = F0.cyl, fs = F0.sph, WL = CREAM;
  fb(20, 0.1, 20, '#5e4636', 0, -0.05, 0); fb(20, 0.012, 6.4, PLUM, 0, 0.006, 6.8); for (const s of [-1, 1]) fb(20, 0.014, 0.08, GOLD, 0, 0.008, 6.8 + s * 3.1); for (let k = 0; k < 9; k++) fb(0.42, 0.016, 0.42, GOLD, -8 + k * 2, 0.012, 6.8, Math.PI / 4);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 7; j++) fb(2.1, 0.02, 1.91, (i + j) % 2 ? OAK : '#7a5232', 0.46 + i * 2.12, 0.012, -9.036 + j * 1.929);
  fb(20, 0.2, 20, IVORY, 0, RH + 0.1, 0); fb(20, RH, 0.3, WL, 0, RH / 2, -10); for (const s of [-1, 1]) fb(0.3, RH, 20, WL, s * 10, RH / 2, 0); for (const s of [-1, 1]) fb(8.4, RH, 0.3, WL, s * 5.8, RH / 2, 10); fb(3.2, RH - 3.0, 0.3, WL, 0, 3.0 + (RH - 3.0) / 2, 10);
  rectL(-10, 10, -10.3, -9.7, true); rectL(9.8, 10.3, -10, 10, true); rectL(-10.3, -9.8, -10, 10, true); rectL(-10, -1.6, 9.8, 10.3, true); rectL(1.6, 10, 9.8, 10.3, true); rectL(-1.6, 1.6, 9.9, 10.4, true);
  fb(1.8, 2.7, 0.06, GOLD, 0, 1.35, 9.82); fb(0.03, 2.7, 0.07, INK, 0, 1.35, 9.8); fb(2.1, 0.14, 0.12, PLUM, 0, 2.78, 9.8);
  for (const s of [-1, 1]) { fb(0.06, 0.24, 20, PLUM, s * 9.83, 0.12, 0); fb(0.06, 0.12, 20, GOLD, s * 9.83, RH - 0.35, 0); } fb(20, 0.24, 0.06, PLUM, 0, 0.12, -9.83); fb(20, 0.12, 0.06, GOLD, 0, RH - 0.35, -9.83);
  fb(4, RH, 0.2, WL, -8, RH / 2, 3.5); fb(1.4, RH - 2.6, 0.2, WL, -5.3, 2.6 + (RH - 2.6) / 2, 3.5); rectL(-10, -6, 3.4, 3.6, true);
  fb(8.8, RH, 0.2, WL, -0.2, RH / 2, 3.5); rectL(-4.6, 4.2, 3.4, 3.6, true); fb(4.2, RH, 0.2, WL, 7.9, RH / 2, 3.5); rectL(5.8, 10, 3.4, 3.6, true); fb(1.6, RH - 2.8, 0.2, WL, 5.0, 2.8 + (RH - 2.8) / 2, 3.5);
  fb(0.2, RH, 13.5, WL, -0.6, RH / 2, -3.25); rectL(-0.7, -0.5, -10, 3.5, true);
  const DOORS = [[-7.5, 9.8, 0], [-4, 9.8, 0], [4, 9.8, 0], [7.5, 9.8, 0], [-9.8, 6.5, 1], [9.8, 6.5, -1]];
  DOORS.forEach(([x, z, s]) => { if (!s) { fb(1.2, 2.4, 0.08, DKW, x, 1.2, 9.82); fb(1.4, 0.1, 0.1, GOLD, x, 2.45, 9.8); fs(0.022, INK, x + 0.42, 1.1, 9.76); } else { fb(0.08, 2.4, 1.2, DKW, x * 0.998, 1.2, z); fb(0.1, 0.1, 1.4, GOLD, x * 0.998, 2.45, z); fs(0.022, INK, x + s * 0.06, 1.1, z + 0.42); } });
  fb(1.3, 0.95, 0.04, DKW, -2.4, 1.6, 3.62); fb(1.16, 0.81, 0.02, IVORY, -2.4, 1.6, 3.645); fb(0.8, 0.12, 0.4, GOLD, -2.4, 0.95, 3.8); for (let k = 0; k < 4; k++) fb(0.5, 0.012, 0.32, k % 2 ? PAPER : '#f6c9c0', -2.4 + (k - 1.5) * 0.04, 1.02 + k * 0.014, 3.8); rectL(-2.9, -1.9, 3.6, 4.05, true);
  // FLAT 3G: bed, chest, trophy shelf (west wall), sofa, rug, window
  fb(2.2, 0.5, 2.6, PAPER, -7.8, 0.25, -7.8); fb(2.3, 0.2, 2.7, DKW, -7.8, 0.1, -7.8); fb(2.3, 1.1, 0.12, DKW, -7.8, 0.75, -9.1); fb(2.0, 0.14, 1.6, PLUM, -7.8, 0.55, -7.2); fb(0.7, 0.16, 0.4, PAPER, -8.3, 0.58, -8.6); fb(0.7, 0.16, 0.4, PAPER, -7.3, 0.58, -8.6); rectL(-9.0, -6.6, -9.2, -6.4, true);
  fb(1.1, 0.6, 0.6, DKW, -3.4, 0.3, -9.3); fb(1.14, 0.06, 0.64, GOLD, -3.4, 0.62, -9.3); rectL(-4.0, -2.8, -9.7, -8.9, true);
  for (const y of [1.0, 1.6, 2.2]) fb(0.4, 0.05, 3.0, DKW, -9.6, y, -2.4); fb(0.06, 1.8, 3.1, DKW, -9.8, 1.6, -2.4);
  fb(2.6, 0.45, 0.9, VIO, -4.8, 0.23, -1.0); fb(2.6, 0.6, 0.2, VIO, -4.8, 0.6, -0.6); rectL(-6.1, -3.5, -1.5, -0.5, true); fc(1.4, 1.4, 0.012, '#d8c9a8', -5, 0.012, -4.2, 20);
  fb(3.4, 1.8, 0.06, GOLD, -5, 2.3, -9.82);
  // BALLROOM: tall window (gold mullions), grand piano + bench, round table + 4 chairs, a floor lamp
  for (const x of [-0.3, 2.9, 6.5, 9.7]) fb(0.12, 1.8, 0.14, GOLD, x, 3.2, -9.8); fb(10.1, 0.12, 0.14, GOLD, 4.7, 4.1, -9.8); fb(10.1, 0.1, 0.4, IVORY, 4.7, 2.28, -9.7);
  fb(2.0, 0.9, 1.4, INK, 8.4, 0.75, -6.0); for (const [x, z] of [[7.5, -6.6], [9.3, -6.6], [8.4, -5.4]]) fc(0.06, 0.06, 0.3, INK, x, 0.15, z, 6); fb(2.0, 0.05, 1.4, INK, 8.4, 1.5, -6.3, 0, 0.5); fb(1.6, 0.06, 0.24, IVORY, 8.4, 1.21, -5.25); fb(1.0, 0.45, 0.4, PLUM, 8.4, 0.23, -4.5); rectL(7.4, 9.4, -6.7, -5.3, true); rectL(7.9, 8.9, -4.7, -4.3, true);
  fc(0.6, 0.6, 0.05, GOLD, 3, 0.75, -2, 20); fc(0.06, 0.06, 0.75, INK, 3, 0.37, -2, 8); for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { fb(0.45, 0.45, 0.45, PLUM, 3 + dx, 0.23, -2 + dz); fb(dx ? 0.08 : 0.45, 0.5, dz ? 0.08 : 0.45, GOLD, 3 + dx * 1.22, 0.7, -2 + dz * 1.22); } circL(3, -2, 1.5, true);
  fc(0.3, 0.3, 0.5, OAK, 9.2, 0.25, 2.6, 10); fc(0.04, 0.04, 1.2, GOLD, 9.2, 1.1, 2.6, 6); fc(0.22, 0.3, 0.3, IVORY, 9.2, 1.8, 2.6, 10); circL(9.2, 2.6, 0.35, true);
  F0.mesh(FG);
  const winM = new THREE.MeshBasicMaterial({ map: CT(1024, 192, cityArt) }); planeT(null, 9.8, 1.7, 4.7, 3.2, -9.84, 0, FG, winM);
  const viewM = new THREE.MeshBasicMaterial({ map: CT(512, 256, cityArt) }); planeT(null, 3.2, 1.6, -5, 2.3, -9.78, 0, FG, viewM);
  planeT(plate('DECO APARTMENTS \u00b7 FLOOR 3', 512, 96, PLUM, PAPER, GOLD), 2.6, 0.45, 0, 3.4, 9.8, Math.PI, FG); planeT(plate('LIFT \u00b7 LOBBY', 384, 96, INK, PAPER, RED), 1.5, 0.36, 0, 3.05, 9.78, Math.PI, FG);
  planeT(plate('BALLROOM', 384, 96, PLUM, PAPER, GOLD), 1.6, 0.38, 5, 3.2, 3.62, 0, FG); planeT(plate('RENT NOTICES \u00b7 UNDER THE DOORS', 512, 96, INK, PAPER, RED), 1.3, 0.24, -2.4, 2.32, 3.66, 0, FG);
  planeT(plate('NO JUGGLING AFTER MIDNIGHT', 512, 96, PAPER, INK, RED), 1.3, 0.26, 1.4, 2.0, 3.66, 0, FG); planeT(plate('MIDNIGHT JUGGLING CLUB \u00b7 NOT A THIEF SCHOOL', 512, 96, PLUM, PAPER, GOLD), 2.4, 0.3, -0.48, 2.6, -6, Math.PI / 2, FG);
  const STY = ['BRASS BALL', 'GLASS OCTAGON', 'CHROME LEVER', 'BLACK EGG', 'IVORY DISC', 'COPPER STAR'];
  DOORS.forEach(([x, z, s], i) => { planeT(plate('FLAT 3' + LET[i], 256, 96, PLUM, PAPER, GOLD), 0.7, 0.26, s ? x + s * 0.12 : x, 2.15, s ? z : z - 0.08, s ? s * Math.PI / 2 : Math.PI, FG); planeT(plate('KNOB \u00b7 ' + STY[i], 384, 80, IVORY, INK, GOLD), 0.8, 0.17, s ? x + s * 0.12 : x, 1.85, s ? z : z - 0.08, s ? s * Math.PI / 2 : Math.PI, FG); });
  // the doorknobs: one style per door (fitted on the doors once the knob job is done) + glinting pickups for the walk job
  const knobInto = (S, i) => { if (i === 0) S.sph(0.075, GOLD, 0, 0, 0.04); else if (i === 1) S.cyl(0.08, 0.08, 0.07, GLASS, 0, 0, 0.04, 8, Math.PI / 2); else if (i === 2) { S.cyl(0.03, 0.03, 0.08, STEEL, 0, 0, 0.03, 8, Math.PI / 2); S.box(0.18, 0.04, 0.04, STEEL, 0.07, 0, 0.07); }
    else if (i === 3) { S.sph(0.07, INK, 0, 0, 0.04); S.sph(0.055, INK, 0, 0, 0.09); } else if (i === 4) S.cyl(0.09, 0.09, 0.03, IVORY, 0, 0, 0.04, 14, Math.PI / 2); else for (let k = 0; k < 4; k++) S.box(0.18, 0.04, 0.03, COPPER, 0, 0, 0.04, 0, 0, k * Math.PI / 4); };
  const knobG = i => { const g = new THREE.Group(), S = mk(); knobInto(S, i); S.mesh(g); return g; };
  const ONDOOR = DOORS.map(([x, z, s], i) => { const g = knobG(i); g.position.set(s ? x + s * 0.06 : x + 0.42, 1.1, s ? z + 0.42 : 9.76); g.rotation.y = s ? s * Math.PI / 2 : Math.PI; g.visible = false; FG.add(g); return g; });
  const beamM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.35, depthWrite: false }), beamG = new THREE.CylinderGeometry(0.05, 0.05, 2.4, 8);
  const PICK = STY.map((_, i) => { const w = new THREE.Group(), k = knobG(i); k.scale.setScalar(1.8); w.add(k); const b = new THREE.Mesh(beamG, beamM); b.position.y = 1.2; w.add(b); w.userData.k = k; w.visible = false; FG.add(w); return w; });
  const knobsShow = () => { const k = !!done().knobs; ONDOOR.forEach(m => { m.visible = k; }); };
  // FLAT 3G door (locked until you rent), its sign, trophy cups
  const doorM = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.6, 0.1), new THREE.MeshLambertMaterial({ color: DKW })); doorM.position.set(-5.3, 1.3, 3.5); FG.add(doorM); const doorCol = rectL(-6, -4.6, 3.38, 3.62, true);
  const signT = CT(384, 128, () => {}); planeT(signT, 1.2, 0.4, -5.3, 2.75, 3.62, 0, FG);
  const drawSign = () => { const g = signT.userData.c.getContext('2d'), r = rented(); g.fillStyle = r ? PLUM : INK; g.fillRect(0, 0, 384, 128); g.fillStyle = GOLD; g.fillRect(0, 0, 12, 128); g.fillStyle = PAPER; g.font = '900 46px Archivo, sans-serif'; g.fillText('FLAT 3G', 30, 56); g.fillStyle = r ? YEL : RED; const t2 = r ? (free() ? 'YOURS \u00b7 RENT FREE' : 'YOURS \u00b7 ' + daysLeft() + ' DAYS LEFT') : 'FOR RENT \u00b7 SEE THE MANAGER'; fitTxt(g, t2, 26, 340); g.fillText(t2, 30, 100); signT.needsUpdate = true; };
  const cupG = new THREE.CylinderGeometry(0.07, 0.045, 0.2, 10), cupM = new THREE.MeshLambertMaterial({ color: GOLD, emissive: '#7a5a1a', emissiveIntensity: 0.3 }), CUPS = [];
  for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(cupG, cupM); m.position.set(-9.55, 1.13 + Math.floor(i / 4) * 0.6, -3.6 + (i % 4) * 0.8); m.visible = false; FG.add(m); CUPS.push(m); }
  const shelfT = CT(512, 96, () => {}); planeT(shelfT, 2.4, 0.45, -9.78, 2.85, -2.4, Math.PI / 2, FG);
  const GOLDS = () => Object.entries((save.data && save.data.items) || {}).filter(([id, n]) => n > 0 && /^gold|^golden|Trophy$/.test(id)).map(([id]) => id);
  const drawShelf = () => { const n = GOLDS().length, g = shelfT.userData.c.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, 512, 96); g.fillStyle = GOLD; g.fillRect(0, 0, 14, 96); g.fillStyle = PAPER; g.font = '900 40px Archivo, sans-serif'; g.fillText('TROPHY SHELF \u00b7 ' + n, 32, 62); shelfT.needsUpdate = true; CUPS.forEach((c, i) => { c.visible = i < n; }); };
  const gknob = new THREE.Group(); { const S = mk(); S.box(0.16, 0.1, 0.16, DKW, 0, -0.03, 0); S.cyl(0.03, 0.03, 0.1, GOLD, 0, 0.07, 0, 8); S.sph(0.09, GOLD, 0, 0.17, 0); S.mesh(gknob); } gknob.position.set(1.8, 1.12, -6.4); G.add(gknob); gknob.visible = false;
  const sclock = new THREE.Group(); { const S = mk(); S.box(0.3, 0.06, 0.12, DKW, 0, 0.03, 0); S.cyl(0.14, 0.14, 0.03, IVORY, 0, 0.22, 0, 16, Math.PI / 2); for (let k = 0; k < 8; k++) S.box(0.38, 0.025, 0.02, GOLD, 0, 0.22, -0.02, 0, 0, k * Math.PI / 8); S.box(0.012, 0.1, 0.01, INK, 0, 0.26, 0.02); S.mesh(sclock); } sclock.position.set(-1.8, 1.12, -6.4); G.add(sclock); sclock.visible = false;
  // ================= FOXES: the Building Manager (replaces the lobby's quiet keeper) + MISS GILT (flat 3A, polishes the ballroom) + the MIDNIGHT JUGGLERS (ballroom, 23:00-3:00) =================
  const old = LR.keeper; if (old && old.parent) old.parent.remove(old); LR.keeper = null;
  const MG0 = [0, -7.4, 0], GI0 = [8.2, -1.6, -Math.PI / 2];
  const keeper = kit.makeFox({ key: 'daptManager', name: 'Building Manager', torso: ['#3d2563', '#d7ad52', '#201e1d'], outfit: 'vest', mood: 'warm' }); keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2]; keeper.userData.noCull = true; keeper.userData.rosterShop = 'DECO APARTMENTS'; keeper.userData.rosterRole = 'keeper'; G.add(keeper);
  const gilt = kit.makeFox({ key: 'daptGilt', name: 'Miss Gilt', torso: ['#d7ad52', '#3d2563', '#201e1d'], outfit: 'dress', mood: 'warm' }); gilt.position.set(GI0[0], 0, GI0[1]); gilt.rotation.y = GI0[2]; gilt.userData.noCull = true; FG.add(gilt); circL(GI0[0], GI0[1], 0.45, true);
  const ballG = new THREE.SphereGeometry(0.07, 8, 6), BALLC = [RED, YEL, GLASS];
  const JUG = [[2.0, -6.4], [5.0, -6.4]].map((p, i) => { const f = kit.makeFox({ key: 'daptJuggler' + i, name: 'Midnight Juggler', torso: i ? ['#a33a4a', '#201e1d', '#f3f2f2'] : ['#2e4a6b', '#201e1d', '#f3f2f2'], outfit: 'vest', mood: 'warm' }); f.position.set(p[0], 0, p[1]); f.userData.noCull = true; f.visible = false; FG.add(f);
    const balls = BALLC.map(c => { const m = new THREE.Mesh(ballG, new THREE.MeshBasicMaterial({ color: c })); m.visible = false; FG.add(m); return m; }); return { f, balls, p }; });
  const jugNight = () => { const h = hour(); return h >= 23 || h < 3; };
  const GAMES = [{ k: 'rent', name: 'Count the Rent Box (Twice)', color: GOLD }, { k: 'locks', name: 'Change the Locks', color: RED }, { k: 'trim', name: 'Polish the Art Deco Trim', color: VIO },
    { k: 'knobs', name: 'Put Back the Doorknobs', color: COPPER, F: true }, { k: 'jugglers', name: 'Catch the Midnight Jugglers', color: PLUM, F: true }, { k: 'notices', name: 'Deliver the Rent Notices', color: LEAF, F: true }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { rent: [-8.0, -1.4], locks: [8.4, 5.6], trim: [-8.4, 5.6], knobs: [-7.0, 5.0], jugglers: [5.6, 0.4], notices: [-2.4, 4.7] };
  const lampsOn = () => { const h = hour(); return h >= 19 || h < 7; };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'dca', color: PLUM, boardTitle: 'Deco Apartments board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -3.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 2.8, z: 8.2, ry: 0 }, hiringLine: 'RENT BOX \u00b7 LOCKS \u00b7 TRIM \u00b7 DOORKNOBS \u00b7 JUGGLERS \u00b7 NOTICES', sun: [{ x: 0, z: 7.4, w: 2.4, d: 2.0 }, { x: -3, z: 4, w: 2.4, d: 1.6 }],
    lamps: [[0, 3.6, -6], [0, 3.6, -0.5], [0, 3.6, 5]], lampsOn, browse: [[-5.6, 2.6, -Math.PI / 2], [3.6, 2.0, Math.PI / 2], [-3.0, -2.0, Math.PI]], looks: [LOOKS[1], LOOKS[2], LOOKS[3]], clock: { x: 3.6, y: 3.4, z: 9.83, ry: Math.PI } });
  const KF = shopKit({ THREE, G: FG, scene, kit, save, camera, touch, hour, isMuted, prefix: 'dca', color: PLUM, room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], games: [],
    sun: [{ x: 3.0, z: -8.0, w: 3.4, d: 1.6 }, { x: 7.0, z: -7.6, w: 3.0, d: 1.6 }, { x: -5, z: -8.4, w: 2.4, d: 1.4 }], lamps: [[-5, RH - 0.6, -4], [0, RH - 0.6, 6.8], [-6, RH - 0.6, 6.8], [6, RH - 0.6, 6.8], [5, RH - 0.6, -4.5]], lampsOn, browse: [[7.0, -3.2, Math.PI], [1.4, 0.8, Math.PI / 2]], looks: [LOOKS[0], LOOKS[2]] });
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
  const T_MG = { key: 'daptManager', name: 'Building Manager', role: 'DECO APARTMENTS', obj: keeper, ry: MG0[2], r: 6 }, mgLn = ln('Building Manager', 'DECO APARTMENTS');
  const T_GI = { key: 'daptGilt', name: 'Miss Gilt', role: 'FLAT 3A \u00b7 FLOOR 3', obj: gilt, ry: GI0[2], r: 4 }, giLn = ln('Miss Gilt', 'FLAT 3A \u00b7 FLOOR 3');
  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;min-width:0;display:block;touch-action:none;background:#2a1f3a;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = (t, attr = 'data-go') => '<button ' + attr + ' style="' + BTN + ';flex:1;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const sideBtn = (t, attr) => '<button ' + attr + ' style="' + BTN + ';flex:none;width:76px;min-height:' + (wide() ? 56 : 72) + 'px;font-size:24px;touch-action:none">' + t + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = (down, up) => { const kd = e => { const k = down(e); if (k) { e.preventDefault(); e.stopPropagation(); } }, ku = e => { if (up && up(e)) { e.preventDefault(); e.stopPropagation(); } }; addEventListener('keydown', kd, true); addEventListener('keyup', ku, true); J.off = () => { removeEventListener('keydown', kd, true); removeEventListener('keyup', ku, true); }; };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  const holdBtn = (sel, d) => { const b = PANEL.querySelector(sel); if (!b) return; b.onpointerdown = e => { e.preventDefault(); J.dir = d; J.idle = 0; }; b.onpointerup = b.onpointercancel = b.onpointerleave = () => { if (J && J.dir === d) J.dir = 0; }; };
  // ---------- 1 COUNT THE RENT BOX (TWICE): watch the coins drop in, say the total; then count the tray again (watch for a paw); 3 boxes ----------
  const RNT = 9, CV = [1, 5, 10], CC = [COPPER, '#c9ced6', GOLD];
  const coinD = (g, x, y, r, v, hi) => { g.fillStyle = CC[v]; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = hi ? YEL : INK; g.lineWidth = hi ? 4 : 2; g.stroke(); g.fillStyle = INK; g.font = '900 ' + Math.round(r * 0.95) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(CV[v]), x, y + 1); g.textAlign = 'left'; g.textBaseline = 'alphabetic'; };
  GD.rent = { shot: () => [toW(-9.4, 1.3, -1.4), 2.4, 2.2, 0.15, 2.2, Math.PI / 2, 5],
    begin() { goRoom(-8.0, -1.4, -Math.PI / 2); J.list = [5, 7, 9].map((n, r) => { const c = [...Array(n)].map(() => Math.floor(Math.random() * 3)); return { c, skim: Math.random() < (r ? 0.8 : 0.5) ? Math.floor(Math.random() * n) : -1 }; }); J.ci = 0; J.flash = null; J.rOk = true; snapK = true; this.phase('drop'); },
    sum(c, skip) { return c.c.reduce((s, v, i) => s + (i === skip ? 0 : CV[v]), 0); },
    want() { const c = J.list[J.ci]; return c ? (J.ph === 'pick2' ? this.sum(c, c.skim) : this.sum(c, -1)) : 0; },
    opts(w) { const s = new Set([w]); for (const d of shuffle([1, -1, 5, -5, 10, -10, 2, -2, 4])) { if (s.size >= 4) break; if (w + d > 0) s.add(w + d); } return shuffle([...s]); },
    phase(p) { J.ph = p; J.k = 0; J.st = 0.6; J.step = Math.max(0.34, 0.62 - J.ci * 0.1); if (p === 'drop') { J.view = 'box'; J.rOk = true; J.grabT = -1; J.gone = false; } if (p === 'again') { J.view = 'tray'; J.grabT = -1; J.gone = false; }
      if (p === 'pick1' || p === 'pick2') { J.cueT = RNT; J.idle = 0; J.hinted = false; J.opts = this.opts(this.want()); } this.draw(); },
    draw() { const c = J.list[J.ci], pk = J.ph === 'pick1' || J.ph === 'pick2';
      const btns = '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;flex:none">' + [0, 1, 2, 3].map(i => '<button data-c="' + (pk ? J.opts[i] : -1) + '" style="' + BTN + ';min-height:52px;font-size:20px' + (pk ? '' : ';opacity:.35') + '">' + (pk ? J.opts[i] + ' G' : '\u2014') + '</button>').join('') + '</div>';
      const tip = J.ph === 'drop' ? 'WATCH THE COINS GO IN \u00b7 COPPER 1 \u00b7 SILVER 5 \u00b7 GOLD 10' : J.ph === 'again' ? 'COUNT IT AGAIN \u00b7 WATCH FOR PAWS' : J.ph === 'pick1' ? 'FIRST COUNT \u00b7 HOW MUCH WENT IN?' : 'SECOND COUNT \u00b7 HOW MUCH IS ON THE TRAY NOW?';
      showPanel(panelHead('COUNT THE RENT BOX \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('4/3') + timeRow + btns : doneMsg('COUNTED TWICE. EVERY TIME.')) + tipBar(tip));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.tap(+b.dataset.c, b); }); },
    tap(v, el) { if (!J || (J.ph !== 'pick1' && J.ph !== 'pick2') || v < 0) return; J.idle = 0; const w = this.want(), c = J.list[J.ci];
      if (v === w) { addGold(2); tone(1200, 0.05, 0.15, 'triangle'); J.flash = ['ok', 0.6]; okTip((J.ph === 'pick2' && c.skim >= 0 ? 'RIGHT \u00b7 ONE COIN SHORT \u00b7 ' : 'RIGHT \u00b7 ') + w + ' G'); }
      else { shake(el); J.rOk = false; J.flash = ['bad', 0.6]; missOne('WRONG \u00b7 IT WAS ' + w + ' G' + (J.ph === 'pick2' && c.skim >= 0 ? ' \u00b7 A PAW TOOK ONE' : '')); }
      this.after(); },
    after() { const ph = J.ph; J.ph = 'wait'; setTimeout(() => { if (!J || J.g !== 'rent') return; if (ph === 'pick1') { this.phase('again'); return; }
        if (J.rOk) addGold(4); J.ci++; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } this.phase('drop'); }, 850); },
    tick(dt) { const c = J.list[J.ci]; if (!c) return; J.idle = (J.idle || 0) + dt; if (J.flash && (J.flash[1] -= dt) <= 0) J.flash = null;
      if (J.ph === 'drop') { if ((J.st -= dt) <= 0) { if (J.k < c.c.length) { J.k++; J.st = J.step; tone(700 + c.c[J.k - 1] * 350, 0.04, 0.12, 'triangle', 0.12); } else this.phase('pick1'); } }
      else if (J.ph === 'again') { if (J.grabT > 0) { J.grabT = Math.max(0, J.grabT - dt); if (J.grabT < 0.5) J.gone = true; }
        if ((J.st -= dt) <= 0) { if (J.k < c.c.length) { J.k++; J.st = J.step * 0.7; blip(); if (c.skim >= 0 && J.grabT < 0 && J.k === Math.max(1, Math.floor(c.c.length / 2))) { J.grabT = 1.0; tone(160, 0.04, 0.3, 'sine'); } } else if (c.skim < 0 || J.grabT === 0) this.phase('pick2'); } }
      else if (J.ph === 'pick1' || J.ph === 'pick2') { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / RNT, J.cueT < 3); if (J.cueT <= 0) { J.rOk = false; missOne('TOO SLOW \u00b7 IT WAS ' + this.want() + ' G'); this.after(); return; }
        if (J.idle > 3 && !J.hinted) { J.hinted = true; pulse(PANEL.querySelector('[data-c="' + this.want() + '"]')); } }
      this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, n = c.c.length;
      g.fillStyle = '#2a1f3a'; g.fillRect(0, 0, w, h); g.fillStyle = PAPER; g.font = '900 13px Archivo, sans-serif';
      if (J.view === 'box') { const bw = w * 0.34, bh = h * 0.4, bx = w / 2 - bw / 2, by = h * 0.56, r = Math.min(w, h) * 0.1; g.fillStyle = GOLD; g.fillRect(bx, by, bw, bh); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(bx, by, bw, bh); g.fillStyle = INK; g.fillRect(w / 2 - bw * 0.3, by + 6, bw * 0.6, 8);
        g.fillStyle = PLUM; g.font = '900 ' + Math.round(bh * 0.13) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('RENT BOX', w / 2, by + bh * 0.5); g.font = '900 ' + Math.round(bh * 0.08) + 'px Archivo, sans-serif'; g.fillText('A PEPPER PROPERTY', w / 2, by + bh * 0.72);
        if (J.ph === 'drop' && J.k > 0) { const fr = 1 - J.st / J.step; if (fr < 0.75) coinD(g, w / 2, h * 0.14 + (by - h * 0.14) * Math.min(1, fr / 0.75), r, c.c[J.k - 1], false); }
        g.fillStyle = PAPER; g.font = '900 14px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(J.ph === 'drop' ? 'COIN ' + J.k + ' / ' + n : 'FIRST COUNT \u00b7 HOW MUCH?', 10, 20); }
      else { const r = Math.min(h * 0.11, w / (n * 2.6)), y = h * 0.58; g.fillStyle = '#2f4a3a'; g.fillRect(w * 0.04, y - r * 2, w * 0.92, r * 4); g.strokeStyle = GOLD; g.lineWidth = 3; g.strokeRect(w * 0.04, y - r * 2, w * 0.92, r * 4);
        const X = i => w / 2 + (i - (n - 1) / 2) * r * 2.4;
        c.c.forEach((v, i) => { if (i === c.skim && J.gone && !(J.grabT > 0)) return; if (i === c.skim && J.gone) return; coinD(g, X(i), y, r, v, J.ph === 'again' && i === J.k - 1); });
        if (c.skim >= 0 && J.grabT > 0) { const p = J.grabT > 0.5 ? (1 - J.grabT) / 0.5 : J.grabT / 0.5, px = X(c.skim), py = -h * 0.1 + (y + h * 0.1) * p; g.fillStyle = '#8a5a3a'; g.fillRect(px - r * 0.9, py - h * 0.5, r * 1.8, h * 0.5); for (let k = -1; k <= 1; k++) { g.beginPath(); g.arc(px + k * r * 0.6, py, r * 0.38, 0, 7); g.fill(); } if (J.gone) coinD(g, px, py - r * 0.2, r * 0.8, c.c[c.skim], false); }
        g.fillStyle = PAPER; g.font = '900 14px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(J.ph === 'again' ? 'SECOND COUNT \u00b7 COIN ' + J.k + ' / ' + n : 'SECOND COUNT \u00b7 HOW MUCH NOW?', 10, 20); }
      if (J.flash) { g.strokeStyle = J.flash[0] === 'ok' ? YEL : RED; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); } g.textAlign = 'left'; } };
  // ---------- 2 CHANGE THE LOCKS: raise each pin until it matches the new key's tooth, then TURN; 4 locks, 3 → 5 pins ----------
  const LKT = 14, LKN = [3, 4, 5, 5];
  GD.locks = { shot: () => [toW(9.5, 1.3, 5.6), 2.4, 2.2, 0.15, 2.2, -Math.PI / 2, 5],
    begin() { goRoom(8.4, 5.6, Math.PI / 2); J.list = LKN.map(n => { const key = [...Array(n)].map(() => 1 + Math.floor(Math.random() * 4)); let pins; do { pins = key.map(() => 1 + Math.floor(Math.random() * 4)); } while (pins.every((p, i) => p === key[i])); return { key, pins }; }); J.ci = 0; J.cueT = LKT; J.wait = 0.4; J.flash = null; snapK = true;
      keyAct(e => { const m = /^Digit([1-5])$/.exec(e.code); if (m) { if (!e.repeat) this.bump(+m[1] - 1); return true; } if (e.code === 'Space' || e.code === 'Enter') { if (!e.repeat) this.turn(); return true; } return false; }); this.draw(); },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('CHANGE THE LOCKS \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('4/3') + timeRow + '<div style="display:grid;grid-template-columns:repeat(' + c.key.length + ',minmax(0,1fr));gap:6px;flex:none">' + c.key.map((_, i) => '<button data-c="' + i + '" style="' + BTN + ';min-height:56px;font-size:15px">PIN ' + (i + 1) + ' \u25b2</button>').join('') + '</div><div style="display:flex;flex:none">' + bigBtn('TURN THE KEY') + '</div>' : doneMsg('NEW LOCKS. THE OLD KEYS OPEN NOTHING.')) + tipBar('TAP A PIN TO RAISE IT \u00b7 MATCH EVERY PIN TO THE NEW KEY \u00b7 THEN TURN'));
      PANEL.querySelectorAll('[data-c]').forEach(b => { b.onclick = () => this.bump(+b.dataset.c); }); const b = PANEL.querySelector('[data-go]'); if (b) b.onclick = () => this.turn(); },
    bump(i) { const c = J.list[J.ci]; if (!c || J.wait > 0 || i >= c.pins.length) return; J.idle = 0; c.pins[i] = c.pins[i] % 4 + 1; tone(500 + c.pins[i] * 140, 0.04, 0.06, 'square'); },
    turn() { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; const bad = c.pins.findIndex((p, i) => p !== c.key[i]);
      if (bad < 0) { addGold(4); ding(); J.flash = ['ok', 0.8]; okTip('CLICK \u00b7 LOCK ' + (J.ci + 1) + ' CHANGED'); J.wait = 0.9; setTimeout(() => this.next(), 800); }
      else { J.flash = ['bad', 0.6]; missOne('THE KEY STICKS \u00b7 PIN ' + (bad + 1) + ' IS ' + (c.pins[bad] < c.key[bad] ? 'TOO LOW' : 'TOO HIGH')); } },
    next() { roundNext(this, 'locks', LKT); },
    tick(dt) { if (J.flash && (J.flash[1] -= dt) <= 0) J.flash = null; roundTick(this, dt, LKT, 'TOO SLOW \u00b7 THE OLD TENANT STILL HAS A KEY', () => { const c = J.list[J.ci]; if (!c) return null; const b = c.pins.findIndex((p, i) => p !== c.key[i]); return b < 0 ? '[data-go]' : '[data-c="' + b + '"]'; }); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, n = c.key.length, x0 = w * 0.18, x1 = w * 0.94, sw = (x1 - x0) / n, u = h * 0.07, bh = h * 0.065, by = h * 0.28, ly = h * 0.97;
      g.fillStyle = '#2a1f3a'; g.fillRect(0, 0, w, h); g.fillStyle = GOLD; g.beginPath(); g.arc(w * 0.09, by - u, h * 0.13, 0, 7); g.fill(); g.fillStyle = '#2a1f3a'; g.beginPath(); g.arc(w * 0.09, by - u, h * 0.05, 0, 7); g.fill(); g.fillStyle = GOLD; g.fillRect(w * 0.14, by - u * 1.5, x1 - w * 0.14, u * 1.5);
      g.fillStyle = PAPER; g.font = '900 12px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('NEW KEY', 8, 16);
      for (let i = 0; i < n; i++) { const x = x0 + i * sw + sw * 0.18; g.fillStyle = GOLD; for (let k = 0; k < c.key[i]; k++) g.fillRect(x, by + k * bh, sw * 0.64, bh - 2); }
      g.fillStyle = '#8a6a2a'; g.fillRect(x0 - 6, h * 0.6, x1 - x0 + 12, ly - h * 0.6); g.fillStyle = PAPER; g.fillText('LOCK', 8, h * 0.6 + 14);
      for (let i = 0; i < n; i++) { const x = x0 + i * sw + sw * 0.18; g.fillStyle = '#2a1f3a'; g.fillRect(x - 2, h * 0.62, sw * 0.64 + 4, ly - h * 0.62 - 2); for (let k = 0; k < c.pins[i]; k++) { g.fillStyle = k === c.pins[i] - 1 ? YEL : STEEL; g.fillRect(x, ly - 4 - (k + 1) * bh, sw * 0.64, bh - 2); }
        g.fillStyle = PAPER; g.textAlign = 'center'; g.fillText(String(i + 1), x + sw * 0.32, h * 0.6 - 4); g.textAlign = 'left'; }
      if (J.flash) { g.strokeStyle = J.flash[0] === 'ok' ? YEL : RED; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); } } };
  // ---------- 3 POLISH THE ART DECO TRIM: rub along the dull gold lines (zigzag, ziggurat, sunburst); off the line while rubbing = SCRATCH ----------
  const TRT = 20, TRIMS = [[[[0.06, 0.72], [0.2, 0.28], [0.34, 0.72], [0.48, 0.28], [0.62, 0.72], [0.76, 0.28], [0.94, 0.72]]],
    [[[0.06, 0.86], [0.06, 0.66], [0.22, 0.66], [0.22, 0.46], [0.38, 0.46], [0.38, 0.24], [0.62, 0.24], [0.62, 0.46], [0.78, 0.46], [0.78, 0.66], [0.94, 0.66], [0.94, 0.86]]],
    [0, 1, 2, 3, 4, 5, 6].map(i => { const a = Math.PI + (i + 0.5) * Math.PI / 7; return [[0.5, 0.92], [0.5 + Math.cos(a) * 0.42, 0.92 + Math.sin(a) * 0.56]]; })];
  GD.trim = { shot: () => [toW(-9.8, 1.7, 5.6), 2.6, 2.4, 0.12, 2.2, Math.PI / 2, 5],
    begin() { goRoom(-8.4, 5.6, -Math.PI / 2); J.list = TRIMS.map(st => { const S = []; for (const p of st) for (let k = 1; k < p.length; k++) { const [x0, y0] = p[k - 1], [x1, y1] = p[k], m = Math.max(2, Math.ceil(Math.hypot((x1 - x0) * 1.33, y1 - y0) / 0.014)); for (let i = (k === 1 ? 0 : 1); i <= m; i++) S.push({ x: x0 + (x1 - x0) * i / m, y: y0 + (y1 - y0) * i / m, on: false }); } return { st, S }; });
      J.ci = 0; J.cueT = TRT; J.wait = 0.4; J.scr = 0; J.onL = false; J.fx = null; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('POLISH THE ART DECO TRIM \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('1/1') + timeRow + '<div data-pc style="font-size:15px;font-weight:900;flex:none"></div>' : doneMsg('IT SHINES. MISS GILT WEPT A LITTLE.')) + tipBar('DRAG ALONG THE GOLD LINES TO POLISH \u00b7 OFF THE LINE = SCRATCH'));
      const cv = PANEL.querySelector('[data-cv]'); if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.down = true; J.onL = false; J.idle = 0; this.rub(cv, e); };
      cv.onpointermove = e => { if (J && J.down) this.rub(cv, e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) { J.down = null; J.onL = false; J.fx = null; } }; },
    prog(c) { return c.S.filter(s => s.on).length / c.S.length; },
    rub(cv, e) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; const r = cv.getBoundingClientRect(), w = r.width, h = r.height, x = e.clientX - r.left, y = e.clientY - r.top, tol = Math.max(18, Math.min(w, h) * 0.06);
      let best = 1e9; for (const s of c.S) { const d = Math.hypot(s.x * w - x, s.y * h - y); if (d < best) best = d; if (d < tol * 1.1) s.on = true; } J.fx = [x / w, y / h];
      if (best < tol) { J.onL = true; if (Math.random() < 0.3) tone(2400 + Math.random() * 800, 0.012, 0.05, 'triangle'); }
      else if (J.onL && best > tol * 2.0 && J.scr <= 0) { J.scr = 1.0; J.onL = false; J.down = null; spark(); missOne('SCRATCH \u00b7 STAY ON THE GOLD LINE'); }
      if (this.prog(c) >= 0.94) { c.S.forEach(s => { s.on = true; }); J.down = null; addGold(4); ding(); okTip('GLEAMING \u00b7 TRIM ' + (J.ci + 1) + ' DONE'); J.wait = 0.9; setTimeout(() => this.next(), 800); } },
    next() { roundNext(this, 'trim', TRT); },
    tick(dt) { if (J.scr > 0) J.scr -= dt; roundTick(this, dt, TRT, 'TOO SLOW \u00b7 THE TRIM STAYS DULL', () => '[data-cv]'); const c = J.list[J.ci], pc = PANEL.querySelector('[data-pc]'); if (c && pc) pc.textContent = 'SHINE ' + Math.round(this.prog(c) * 100) + ' % \u00b7 NEED 94 %'; this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, t = performance.now() / 1000, lw = Math.max(10, Math.min(w, h) * 0.05);
      g.fillStyle = PLUM; g.fillRect(0, 0, w, h); g.strokeStyle = '#2a1840'; g.lineWidth = 2; g.strokeRect(8, 8, w - 16, h - 16); g.lineCap = 'round'; g.lineJoin = 'round';
      for (const p of c.st) { g.strokeStyle = '#6a5a3a'; g.lineWidth = lw; g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x * w, y * h) : g.moveTo(x * w, y * h))); g.stroke(); }
      g.fillStyle = GOLD; for (const s of c.S) if (s.on) { g.beginPath(); g.arc(s.x * w, s.y * h, lw * 0.55, 0, 7); g.fill(); }
      g.fillStyle = '#fff6d8'; for (let i = 0; i < c.S.length; i += 9) { const s = c.S[i]; if (s.on && Math.sin(t * 4 + i) > 0.85) { g.beginPath(); g.arc(s.x * w, s.y * h, lw * 0.18, 0, 7); g.fill(); } }
      if (J.fx && J.down) { g.fillStyle = '#e7e4dc'; g.fillRect(J.fx[0] * w - 14, J.fx[1] * h - 10, 28, 20); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(J.fx[0] * w - 14, J.fx[1] * h - 10, 28, 20); }
      if (J.scr > 0.6) { g.strokeStyle = RED; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); } g.lineCap = 'butt'; } };
  // ---------- 4 PUT BACK THE DOORKNOBS (walk): 5 knobs hidden round floor 3; pick one up (E), read the KNOB plates, fit it to its door (E) ----------
  const KNN = 5, KSPOTS = [[8.6, -3.7], [3.4, -8.8], [9.2, 1.6], [5.9, -2.6], [1.0, -8.4], [-9.2, 4.4], [9.2, 4.4], [3.0, 5.2], [-3.8, 6.4]];
  const doorFront = i => { const [x, z, s] = DOORS[i]; return s ? [x + s * 1.0, z] : [x, z - 1.0]; };
  GD.knobs = { errand: true,
    begin() { goRoom(-7.0, 5.0, Math.PI / 2, true); const st = pickN([0, 1, 2, 3, 4, 5], KNN), sp = pickN(KSPOTS, KNN); J.list = st.map((s, i) => ({ s, p: sp[i], st: 0 })); J.ci = 0; J.hold = -1; J.holdT = 0; J.t0 = 0;
      ONDOOR.forEach((m, i) => { m.visible = !st.includes(i); }); PICK.forEach(m => { m.visible = false; }); J.list.forEach(q => { PICK[q.s].position.set(q.p[0], 0, q.p[1]); PICK[q.s].visible = true; }); ding(); toast('THE DOORKNOBS ARE HIDING ON FLOOR 3 \u00b7 FIND THEM, READ THE DOOR PLATES', 2.8); },
    nearKnob(p) { return J.list.findIndex(q => q.st === 0 && Math.hypot(p.x - q.p[0], p.z - q.p[1]) < 1.2); },
    nearDoor(p) { for (let i = 0; i < DOORS.length; i++) { const f = doorFront(i); if (Math.hypot(p.x - f[0], p.z - f[1]) < 1.3) return i; } return -1; },
    label(p) { if (J.hold >= 0) { const d = this.nearDoor(p); if (d >= 0) return ONDOOR[d].visible ? 'FLAT 3' + LET[d] + ' \u00b7 HAS ITS KNOB' : 'FIT THE KNOB \u00b7 FLAT 3' + LET[d]; }
      const k = this.nearKnob(p); if (k >= 0) return J.hold >= 0 ? 'ONE KNOB AT A TIME' : 'PICK UP \u00b7 ' + STY[J.list[k].s] + ' KNOB'; return null; },
    act(p) { if (J.hold >= 0) { const d = this.nearDoor(p); if (d >= 0) { const q = J.list[J.hold];
          if (ONDOOR[d].visible) { toast('FLAT 3' + LET[d] + ' ALREADY HAS ITS KNOB', 1.6); return true; }
          if (d === q.s) { q.st = 2; ONDOOR[d].visible = true; J.hold = -1; J.ci++; addGold(5); ding(); tone(700, 0.05, 0.1, 'square', 0.1); toast('CLICK \u00b7 FLAT 3' + LET[d] + ' HAS ITS ' + STY[d] + ' BACK', 1.8);
            if (J.ci >= J.list.length) { addGold(6); if (J.t0 < 120) addGold(10); toast('EVERY DOOR HAS ITS KNOB \u00b7 THE TENANTS CAN GET OUT', 2.4); setTimeout(finishGame, 1100); } return true; }
          missOne('WRONG DOOR \u00b7 FLAT 3' + LET[d] + ' TAKES THE ' + STY[d], 2.2); return true; } }
      const k = this.nearKnob(p); if (k >= 0) { if (J.hold >= 0) { toast('ONE KNOB AT A TIME \u00b7 FIT THE ONE YOU HAVE', 1.8); return true; } const q = J.list[k]; q.st = 1; J.hold = k; J.holdT = 0; PICK[q.s].visible = false; tone(1500, 0.04, 0.12, 'triangle'); toast('GOT IT \u00b7 ' + STY[q.s] + ' KNOB \u00b7 WHICH DOOR?', 2); return true; } return false; },
    tick(dt) { J.t0 += dt; if (J.hold >= 0) J.holdT += dt; const onF = inFloor(lastP), t = performance.now() / 1000;
      PICK.forEach((m, i) => { if (m.visible) { m.userData.k.position.y = 0.25 + Math.sin(t * 3 + i) * 0.06; m.userData.k.rotation.y = t * 1.5; } });
      if (J.ci >= J.list.length) { ARW.style.display = 'none'; return; }
      if (onF) { const p = toF(lastP); if (J.hold >= 0) { const s = J.list[J.hold].s; if (J.holdT > 15) { const f = doorFront(s); arrowTo(toW(f[0], 1.6, f[1], true), 'FLAT 3' + LET[s]); } else ARW.style.display = 'none'; }
        else { let bi = -1, bd = 1e9; J.list.forEach((q, i) => { if (q.st === 0) { const d = Math.hypot(p.x - q.p[0], p.z - q.p[1]); if (d < bd) { bd = d; bi = i; } } }); if (bi >= 0) arrowTo(toW(J.list[bi].p[0], 0.8, J.list[bi].p[1], true), 'KNOB \u00b7 ' + Math.round(bd) + ' M'); else ARW.style.display = 'none'; } }
      else if (inLobby(lastP)) arrowTo(toW(LLIFT[0], 1.6, LLIFT[1]), 'LIFT \u00b7 FLOOR 3'); else ARW.style.display = 'none';
      const hq = J.hold >= 0 ? J.list[J.hold] : null;
      setCard('kn' + J.ci + '_' + J.hold + (onF ? 1 : 0), head('PUT BACK THE DOORKNOBS \u00b7 ' + J.ci + ' / ' + J.list.length, goldR()) + '<div style="padding:8px 10px;font-size:13px;font-weight:900">'
        + (!onF ? 'BACK UP TO FLOOR 3' : hq ? 'CARRYING<br><span style="font-size:17px">' + STY[hq.s] + '</span><div style="margin-top:4px;font-size:11px">EVERY DOOR HAS A PLATE: KNOB \u00b7 ITS STYLE</div>' : 'FIND A KNOB \u00b7 LOOK FOR THE YELLOW BEAMS')
        + '</div>' + foot(hq ? 'FIT IT (E) AT ITS DOOR' : 'PICK UP (E)')); } };
  // ---------- 5 CATCH THE MIDNIGHT JUGGLERS: masked jugglers pop out of the flat doors; tap them before they duck back; never the tenants in nightcaps; 16 pops ----------
  const JGN = 16;
  GD.jugglers = { F: true, shot: () => [toW(3.6, 1.4, -6.2, true), 6.0, 2.6, 0.18, 3, 0, 8],
    begin() { goRoom(5.6, 0.4, Math.PI, true); let last = -1; J.list = [...Array(JGN)].map((_, i) => { let d; do { d = Math.floor(Math.random() * 6); } while (d === last); last = d; return { d, ten: i > 1 && Math.random() < 0.3 }; }); J.ci = 0; J.cur = null; J.gap = 0.9; J.got = 0; snapK = true;
      keyAct(e => { const m = /^Digit([1-6])$/.exec(e.code); if (!m) return false; if (!e.repeat) this.tap(+m[1] - 1); return true; }); this.draw(); },
    draw() { showPanel(panelHead('CATCH THE MIDNIGHT JUGGLERS \u00b7 ' + nOf(), goldR()) + body(J.ci < J.list.length ? cvTag('1/1') + '<div data-pc style="font-size:15px;font-weight:900;flex:none"></div>' : doneMsg('CLUB CLOSED. EVERYONE TO BED.')) + tipBar('TAP A JUGGLER BEFORE THEY DUCK BACK IN \u00b7 NOT THE TENANTS IN NIGHTCAPS'));
      const cv = PANEL.querySelector('[data-cv]'); if (cv) cv.onpointerdown = e => { e.preventDefault(); const r = cv.getBoundingClientRect(), cx = Math.floor((e.clientX - r.left) / r.width * 3), cy = Math.floor((e.clientY - r.top) / r.height * 2); this.tap(clamp(cy, 0, 1) * 3 + clamp(cx, 0, 2)); }; },
    tap(d) { const c = J.cur; J.idle = 0; if (!c || c.res || c.d !== d) { blip(); return; }
      if (c.ten) { c.res = 'bad'; c.rt = 0.5; missOne('THAT WAS A TENANT \u00b7 SORRY! GO BACK TO BED'); }
      else { c.res = 'ok'; c.rt = 0.35; J.got++; addGold(2); tone(1400, 0.05, 0.12, 'triangle'); tone(1800, 0.04, 0.1, 'triangle', 0.06); okTip('CAUGHT \u00b7 ' + J.got + ' JUGGLERS'); } },
    adv() { J.cur = null; J.ci++; J.gap = rnd(0.3, 0.75); if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); } },
    tick(dt) { if (J.ci >= J.list.length) return; const c = J.cur;
      if (!c) { if ((J.gap -= dt) <= 0) { const q = J.list[J.ci]; J.cur = { ...q, t: 0, T: q.ten ? 1.4 : Math.max(1.0, 1.75 - J.ci * 0.045), res: null, rt: 0 }; tone(q.ten ? 330 : 660, 0.03, 0.08, 'triangle'); } }
      else if (c.res) { if ((c.rt -= dt) <= 0) this.adv(); }
      else if ((c.t += dt) >= c.T) { if (!c.ten) missOne('ONE GOT AWAY \u00b7 BACK TO THE CLUB'); this.adv(); }
      const pc = PANEL.querySelector('[data-pc]'); if (pc) pc.textContent = 'CAUGHT ' + J.got + (touch ? ' \u00b7 TAP THE DOOR' : ' \u00b7 KEYS 1-6 OR CLICK'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')); if (!f) return; const { g, w, h } = f, t = performance.now() / 1000, c = J.cur, cw = w / 3, ch = h / 2;
      g.fillStyle = '#1a1426'; g.fillRect(0, 0, w, h);
      for (let d = 0; d < 6; d++) { const cx = (d % 3) * cw + cw / 2, cy = Math.floor(d / 3) * ch, dw = cw * 0.5, dh = ch * 0.78, x = cx - dw / 2, y = cy + ch * 0.16;
        g.fillStyle = GOLD; g.fillRect(x - 5, y - 5, dw + 10, dh + 5); g.fillStyle = '#0d0a14'; g.fillRect(x, y, dw, dh);
        let open = 0; if (c && c.d === d) open = clamp(c.res ? c.rt / 0.4 : Math.min(1, c.t / 0.18, (c.T - c.t) / 0.18), 0, 1);
        if (open > 0) { g.globalAlpha = 0.25 * open; g.fillStyle = '#ffd98a'; g.fillRect(x, y, dw, dh); g.globalAlpha = 1; this.who(g, cx, y + dh * 0.55, Math.min(dw, dh) * 0.3, c, t); }
        g.fillStyle = DKW; g.fillRect(x, y, dw * (1 - open * 0.85), dh); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(x, y, dw * (1 - open * 0.85), dh);
        g.fillStyle = PAPER; g.font = '900 12px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText((touch ? '' : (d + 1) + ' \u00b7 ') + '3' + LET[d], cx, cy + ch * 0.11); }
      if (c && c.res) { const cx = (c.d % 3) * cw + cw / 2, cy = Math.floor(c.d / 3) * ch + ch / 2; g.fillStyle = c.res === 'ok' ? YEL : RED; g.font = '900 ' + Math.round(ch * 0.2) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText(c.res === 'ok' ? 'CAUGHT!' : 'OOPS', cx, cy); }
      g.textAlign = 'left'; },
    who(g, x, y, r, c, t) { if (c.ten) { g.fillStyle = '#9aa0a6'; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.fillStyle = '#2e4a8b'; g.beginPath(); g.moveTo(x - r, y - r * 0.5); g.lineTo(x + r * 1.2, y - r * 1.6); g.lineTo(x + r, y - r * 0.4); g.fill(); g.fillStyle = PAPER; g.beginPath(); g.arc(x + r * 1.2, y - r * 1.6, r * 0.18, 0, 7); g.fill();
        g.fillStyle = YEL; g.beginPath(); g.arc(x - r * 1.1, y + r * 0.6, r * 0.22 + Math.sin(t * 20) * 1.5, 0, 7); g.fill(); g.fillStyle = INK; g.fillRect(x - r * 0.45, y, r * 0.3, 3); g.fillRect(x + r * 0.15, y, r * 0.3, 3); return; }
      g.fillStyle = '#e07a1f'; g.beginPath(); g.moveTo(x - r * 0.9, y - r * 0.4); g.lineTo(x - r * 0.6, y - r * 1.3); g.lineTo(x - r * 0.1, y - r * 0.8); g.lineTo(x + r * 0.1, y - r * 0.8); g.lineTo(x + r * 0.6, y - r * 1.3); g.lineTo(x + r * 0.9, y - r * 0.4); g.fill(); g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      g.fillStyle = PAPER; g.beginPath(); g.arc(x, y + r * 0.35, r * 0.5, 0, Math.PI); g.fill(); g.fillStyle = INK; g.fillRect(x - r * 0.9, y - r * 0.3, r * 1.8, r * 0.3); g.fillStyle = PAPER; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.15, r * 0.09, 0, 7); g.fill(); g.beginPath(); g.arc(x + r * 0.35, y - r * 0.15, r * 0.09, 0, 7); g.fill();
      for (let k = 0; k < 3; k++) { const p = t * 6 + k * 2.09; g.fillStyle = BALLC[k]; g.beginPath(); g.arc(x + Math.sin(p) * r * 1.1, y - r * 1.4 - Math.abs(Math.cos(p)) * r * 0.9, r * 0.2, 0, 7); g.fill(); } } };
  // ---------- 6 DELIVER THE RENT NOTICES: pull the notice back and let go; it slides along the runner; under the right door, gently (green band); 6 notices, the mop bucket joins at 4 ----------
  const NTT = 12, NTN = 6, FK = 1.6, LINE = 0.2;
  GD.notices = { F: true, shot: () => [toW(-2.4, 1.0, 7.6, true), 7.0, 2.4, 0.3, 3, Math.PI, 8],
    begin() { goRoom(-2.4, 4.7, 0, true); J.list = [...Array(NTN)].map(() => ({ doors: pickN([0, 1, 2, 3, 4, 5], 3), tg: Math.floor(Math.random() * 3) })); J.ci = 0; J.cueT = NTT; J.wait = 0.4; J.aim = 0; J.aimD = 0; J.pw = 0; J.pwOn = false; J.pwD = 1; J.flash = null; snapK = true; this.reset();
      keyAct(e => { if (e.code === 'ArrowLeft' || e.code === 'KeyA') { J.aimD = -1; return true; } if (e.code === 'ArrowRight' || e.code === 'KeyD') { J.aimD = 1; return true; } if (e.code === 'Space') { if (!e.repeat && !J.n.mv && !J.n.gone) { J.pwOn = true; J.pw = 0; J.pwD = 1; } return true; } return false; },
        e => { if (['ArrowLeft', 'KeyA', 'ArrowRight', 'KeyD'].includes(e.code)) { J.aimD = 0; return true; } if (e.code === 'Space') { if (J.pwOn) { J.pwOn = false; this.launchKey(); } return true; } return false; }); this.draw(); },
    reset() { J.n = { x: (J.ar || 1.33) * 0.5, y: 0.86, vx: 0, vy: 0, mv: false, gone: false }; J.pull = null; },
    half() { return (J.ar || 1.33) * (0.1 - J.ci * 0.006); },
    doorAt(x) { const ar = J.ar || 1.33, hw = this.half(); for (let i = 0; i < 3; i++) if (Math.abs(x - ar * (0.2 + i * 0.3)) < hw) return i; return -1; },
    bucket() { if (J.ci < 3) return null; const ar = J.ar || 1.33; return { x: ar * 0.5 + Math.sin(J.t * 1.3) * ar * 0.3, y: 0.52, r: 0.07 }; },
    draw() { const c = J.list[J.ci]; showPanel(panelHead('DELIVER THE RENT NOTICES \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('4/5') + timeRow : doneMsg('EVERY FLAT HAS ITS NOTICE. EVERY FLAT GROANS.')) + tipBar(touch ? 'PULL THE NOTICE BACK + LET GO \u00b7 GREEN = SLIDES GENTLY UNDER THE DOOR' : 'PULL BACK + LET GO \u00b7 OR \u25c0 \u25b6 AIM + HOLD SPACE \u00b7 GREEN = GENTLE'));
      const cv = PANEL.querySelector('[data-cv]'); if (!cv) return; const P = e => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.height, y: (e.clientY - r.top) / r.height }; };
      cv.onpointerdown = e => { e.preventDefault(); if (J.wait > 0 || J.n.mv || J.n.gone) return; try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; const p = P(e); if (Math.hypot(p.x - J.n.x, p.y - J.n.y) < 0.32) J.pull = p; };
      cv.onpointermove = e => { if (J && J.pull) J.pull = P(e); };
      cv.onpointerup = cv.onpointercancel = () => { if (!J || !J.pull) return; const dx = J.n.x - J.pull.x, dy = J.n.y - J.pull.y, L = Math.hypot(dx, dy); J.pull = null; if (L > 0.03) this.launch(dx / L, dy / L, Math.min(L, 0.3)); }; },
    launch(ux, uy, len) { const v0 = len / 0.3 * 1.5 * FK; Object.assign(J.n, { vx: ux * v0, vy: uy * v0, mv: true }); tone(500, 0.03, 0.15, 'triangle'); J.idle = 0; },
    launchKey() { if (J.wait > 0 || J.n.mv || J.n.gone) return; this.launch(Math.sin(J.aim), -Math.cos(J.aim), Math.max(0.04, J.pw * 0.3)); },
    later(fn, ms) { setTimeout(() => { if (J && J.g === 'notices') fn(); }, ms); },
    next() { roundNext(this, 'notices', NTT); if (J && J.g === 'notices') this.reset(); },
    tick(dt) { const c = J.list[J.ci]; if (J.flash && (J.flash[1] -= dt) <= 0) J.flash = null; if (!c) return;
      if (J.aimD) J.aim = clamp(J.aim + J.aimD * 0.9 * dt, -0.9, 0.9); if (J.pwOn) { J.pw += J.pwD * 0.9 * dt; if (J.pw > 1) { J.pw = 1; J.pwD = -1; } if (J.pw < 0) { J.pw = 0; J.pwD = 1; } }
      const n = J.n, ar = J.ar || 1.33;
      if (n.mv) { const k = Math.exp(-FK * dt), oy = n.y; n.x += n.vx * dt; n.y += n.vy * dt; n.vx *= k; n.vy *= k;
        if (n.x < 0.05 || n.x > ar - 0.05) { n.vx = -n.vx * 0.6; n.x = clamp(n.x, 0.05, ar - 0.05); tone(200, 0.03, 0.08, 'square'); } if (n.y > 0.97) { n.vy = -Math.abs(n.vy) * 0.6; n.y = 0.97; }
        const Bk = this.bucket();
        if (Bk && Math.hypot(n.x - Bk.x, n.y - Bk.y) < Bk.r + 0.04) { n.mv = false; missOne('INTO THE MOP BUCKET \u00b7 SOGGY NOTICE'); J.wait = 0.6; this.later(() => this.reset(), 550); }
        else if (n.y <= LINE && oy > LINE) { const sp = Math.hypot(n.vx, n.vy), i = this.doorAt(n.x); n.mv = false;
          if (i < 0) { missOne('SPLAT \u00b7 STRAIGHT INTO THE WALL'); J.wait = 0.6; this.later(() => this.reset(), 550); }
          else if (i !== c.tg) { n.gone = true; missOne('WRONG FLAT \u00b7 THAT WAS 3' + LET[c.doors[i]]); J.wait = 0.8; this.later(() => this.next(), 700); }
          else if (sp / FK > 0.5) { n.gone = true; missOne('TOO HARD \u00b7 IT SHOT INTO THEIR SOUP'); J.wait = 0.8; this.later(() => this.next(), 700); }
          else { n.gone = true; addGold(3); ding(); J.flash = ['ok', 0.6]; okTip('SLID UNDER 3' + LET[c.doors[i]] + ' \u00b7 PERFECT'); J.wait = 0.8; this.later(() => this.next(), 700); } }
        else if (Math.hypot(n.vx, n.vy) < 0.04) { n.mv = false; okTip('TOO SOFT \u00b7 TRY AGAIN'); J.wait = 0.4; this.later(() => this.reset(), 400); } }
      roundTick(this, dt, NTT, 'TOO SLOW \u00b7 THE TENANT SAW YOU', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, S = h, n = J.n; J.ar = w / h; const ar = J.ar, hw = this.half();
      g.fillStyle = '#4a2f52'; g.fillRect(0, 0, w, h); g.fillStyle = PLUM; g.fillRect(w * 0.1, LINE * S, w * 0.8, h); g.fillStyle = GOLD; for (let k = 0; k < 6; k++) { const y = (0.3 + k * 0.13) * S; g.beginPath(); g.moveTo(w / 2, y - 7); g.lineTo(w / 2 + 7, y); g.lineTo(w / 2, y + 7); g.lineTo(w / 2 - 7, y); g.fill(); }
      g.fillStyle = CREAM; g.fillRect(0, 0, w, LINE * S);
      for (let i = 0; i < 3; i++) { const cx = ar * (0.2 + i * 0.3) * S, x = cx - hw * S, dw = hw * 2 * S, y0 = 0.02 * S; g.fillStyle = GOLD; g.fillRect(x - 4, y0 - 2, dw + 8, LINE * S - y0 + 2); g.fillStyle = DKW; g.fillRect(x, y0, dw, LINE * S - y0 - 6); g.fillStyle = '#0d0a14'; g.fillRect(x, LINE * S - 6, dw, 6);
        g.fillStyle = IVORY; g.fillRect(cx - 24, y0 + 6, 48, 20); g.fillStyle = INK; g.font = '900 13px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('3' + LET[c.doors[i]], cx, y0 + 16); }
      g.textBaseline = 'alphabetic';
      const Bk = this.bucket(); if (Bk) { g.fillStyle = STEEL; g.beginPath(); g.arc(Bk.x * S, Bk.y * S, Bk.r * S, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.fillStyle = '#6fa8c8'; g.beginPath(); g.arc(Bk.x * S, Bk.y * S, Bk.r * S * 0.7, 0, 7); g.fill(); g.fillStyle = OAK; g.fillRect(Bk.x * S - 2, Bk.y * S - Bk.r * S * 2.2, 4, Bk.r * S * 2); }
      const pull = J.pull ? { dx: n.x - J.pull.x, dy: n.y - J.pull.y } : J.pwOn ? { dx: Math.sin(J.aim) * J.pw * 0.3, dy: -Math.cos(J.aim) * J.pw * 0.3 } : null;
      if (!n.mv && !n.gone) { const tc = ar * (0.2 + c.tg * 0.3), D = Math.hypot(tc - n.x, LINE - n.y), lo = 0.2 * D, hi = Math.min(0.3, 0.2 * (D + 0.5));
        if (pull) { const PL = Math.hypot(pull.dx, pull.dy) || 1, L = Math.min(0.3, PL), good = L > lo && L < hi; g.strokeStyle = good ? '#7cff9b' : YEL; g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(n.x * S, n.y * S); g.lineTo((n.x + pull.dx / PL * L / 0.3 * 0.9) * S, (n.y + pull.dy / PL * L / 0.3 * 0.9) * S); g.stroke(); g.setLineDash([]); }
        else if (!touch) { g.strokeStyle = 'rgba(255,210,58,0.5)'; g.lineWidth = 2; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(n.x * S, n.y * S); g.lineTo((n.x + Math.sin(J.aim) * 0.3) * S, (n.y - Math.cos(J.aim) * 0.3) * S); g.stroke(); g.setLineDash([]); }
        const mx = w - 26, my0 = h * 0.3, mh = h * 0.6; g.fillStyle = INK; g.fillRect(mx, my0, 14, mh); g.fillStyle = LEAF; g.fillRect(mx, my0 + mh * (1 - hi / 0.3), 14, mh * Math.max(0, hi - lo) / 0.3);
        if (pull) { const L = Math.min(0.3, Math.hypot(pull.dx, pull.dy)); g.fillStyle = YEL; g.fillRect(mx - 4, my0 + mh * (1 - L / 0.3) - 2, 22, 4); } }
      if (!n.gone) { const x = n.x * S, y = n.y * S, nw = S * 0.11, nh = S * 0.08; g.save(); g.translate(x, y); g.rotate(n.mv ? Math.sin(J.t * 9) * 0.15 : 0); g.fillStyle = PAPER; g.fillRect(-nw / 2, -nh / 2, nw, nh); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(-nw / 2, -nh / 2, nw, nh); g.fillStyle = RED; g.fillRect(-nw / 2, -nh / 2, nw, nh * 0.3); g.restore();
        if (!n.mv) { g.fillStyle = PAPER; g.font = '900 14px Archivo, sans-serif'; g.textAlign = 'center'; const lb = 'RENT DUE \u00b7 FLAT 3' + LET[c.doors[c.tg]], hw2 = g.measureText(lb).width / 2 + 6; g.fillText(lb, Math.max(hw2, Math.min(w - hw2, x)), y - nh - 8); } }
      if (J.flash) { g.strokeStyle = YEL; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); } g.textAlign = 'left'; } };
  // ================= PRIZES (building-themed) =================
  const SUIT = { outfit: 'suit', torso: ['#3d2563', '#e7e4dc', '#d7ad52'], name: 'DECO TAILCOAT' };
  const GIFT = { suit: 'The DECO TAILCOAT. Very Pepper. Very purple. The Tailor has a copy.', half: 'Three jobs. FLAT 3G is half price now. Do not tell the Peppers.', trophy: 'All six. The GOLDEN DOORKNOB, 60 gold, and FLAT 3G rent free. Got a minute?' };
  function giveGift() { save.setStat('dcaClears', save.stat('dcaClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('dcaSuit', false)) { save.setStat('dcaSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 3 && !save.stat('dcaHalf', false)) { save.setStat('dcaHalf', true); return 'half'; }
    if (nd >= GAMES.length && !save.stat('dcaAll', false)) { save.setStat('dcaAll', true); save.give('goldenDoorknob'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function clockCheck(then) { if (!allThree() || save.stat('dcaClock', false)) { then && then(); return false; } save.setStat('dcaClock', true); save.addRelic('sunburstClock'); sclock.visible = true; ding();
    sayTo(T_MG, [mgLn('Three stars on every job. Take THE SUNBURST CLOCK. On it, it is always rent day.')], () => { toast('RELIC \u00b7 THE SUNBURST CLOCK', 2.6); then && then(); }); return true; }
  // ================= FLAT 3G: rent per game week (the doorknob tenant's old flat), sleep, chest, trophy shelf =================
  const free = () => !!save.stat('dcaAll', false), price = () => (free() ? 0 : save.stat('dcaHalf', false) ? 17 : 35);
  const rented = () => free() || save.stat('dcaRentTo', 0) >= today(), daysLeft = () => Math.max(0, save.stat('dcaRentTo', 0) - today() + 1);
  function rentFlat() { const p = price(); if (p > 0 && !save.spend(p)) { sayTo(T_MG, [mgLn(p + ' gold a week. The Peppers do not do discounts. Come back with more.')]); return; }
    coin(); const from = Math.max(today(), save.stat('dcaRentTo', 0) + 1); save.setStat('dcaRentTo', from + 6); if (!save.count('daptKey')) save.give('daptKey'); drawSign();
    sayTo(T_MG, [mgLn((save.stat('dcaRented', 0) ? 'Renewed. Seven more days on three. ' : 'FLAT 3G is yours for the week. Key. ') + 'Lift on the left, floor three.')]); save.setStat('dcaRented', save.stat('dcaRented', 0) + 1); }
  function flatMenu() { const r = rented(), ch = [];
    if (free()) ch.push({ text: 'THANK YOU FOR THE FREE FLAT', pick: () => sayTo(T_MG, [mgLn('You earned it. Paying the Peppers nothing. It feels nice, does it not?')]) });
    else ch.push({ text: (r ? 'RENEW \u00b7 +7 DAYS \u00b7 ' : 'RENT FLAT 3G \u00b7 ') + price() + ' G A WEEK', pick: rentFlat });
    ch.push({ text: 'WHAT DOES THE FLAT HAVE?', pick: () => sayTo(T_MG, [mgLn('A bed, a chest, a trophy shelf, a view of the Pepper Building. And doorknobs. Real ones.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} });
    sayTo(T_MG, [{ ...mgLn(free() ? 'FLAT 3G is yours, rent free, for good.' : r ? 'FLAT 3G is yours for ' + daysLeft() + ' more day' + (daysLeft() === 1 ? '' : 's') + '. Renew any time.' : 'FLAT 3G, floor three. The last tenant left in a hurry. ' + price() + ' gold a week.'), choices: ch }]); }
  const lab = id => (ITEM_LABELS[id] || String(id).replace(/([A-Z])/g, ' $1')).toUpperCase(), chestIn = () => save.stat('dcaChest', null) || {};
  const T_CH = () => ({ key: 'daptChest', name: 'YOUR CHEST', role: 'FLAT 3G', obj: FG, r: 3 }), chLn = ln('YOUR CHEST', 'FLAT 3G');
  function chest() { const bag = Object.entries((save.data && save.data.items) || {}).filter(q => q[1] > 0 && q[0] !== 'daptKey').sort((a, b) => b[1] - a[1]).slice(0, 5), box2 = Object.entries(chestIn()).filter(q => q[1] > 0).slice(0, 5);
    const ch = [...bag.map(([id, n]) => ({ text: 'STORE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { if (!save.take(id, n)) return; const L = { ...chestIn() }; L[id] = (L[id] || 0) + n; save.setStat('dcaChest', L); tone(330, 0.05, 0.2); toast('STORED \u00b7 ' + lab(id), 2); drawShelf(); } })),
      ...box2.map(([id, n]) => ({ text: 'TAKE \u00b7 ' + lab(id) + ' \u00d7' + n, pick: () => { const L = { ...chestIn() }; delete L[id]; save.setStat('dcaChest', L); save.give(id, n); tone(440, 0.05, 0.2); toast('TAKEN \u00b7 ' + lab(id), 2); drawShelf(); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(T_CH(), [{ ...chLn(box2.length ? 'Your chest. ' + box2.length + ' kind' + (box2.length > 1 ? 's' : '') + ' of thing inside. New lock, too.' : 'Your chest. Empty. Store what you like. New lock.'), choices: ch }]); }
  function sleepHere() { fade(() => { const d = sleep(); heal(9999); window.__m2yawn = 1;   /* s627: wake up with a yawn + stretch */ goRoom(-7.8, -5.6, Math.PI, true); toast('GOOD MORNING \u00b7 DAY ' + (d || today()) + ' \u00b7 THE JUGGLERS WENT HOME \u00b7 FULL HEALTH', 3); drawSign(); }); }
  function useItem(id) { if (id === 'goldenDoorknob' && save.count('goldenDoorknob')) { tone(1800, 0.05, 0.4, 'triangle'); toast('THE GOLDEN DOORKNOB \u00b7 SIX FOR SIX AT DECO APARTMENTS \u00b7 FITS EVERY DOOR, OPENS NONE', 2.6); return true; }
    if (id === 'daptKey' && save.count('daptKey')) { toast(rented() ? 'FLAT 3G KEY \u00b7 ' + (free() ? 'RENT FREE' : daysLeft() + ' DAYS LEFT') : 'FLAT 3G KEY \u00b7 THE RENT RAN OUT \u00b7 SEE THE MANAGER', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { rent: 'Rent goes in the box. The Peppers count it twice. You count it twice too. Watch for paws.',
    locks: 'The last tenant took the keys with the doorknobs. New locks. Match each pin to the new key.',
    trim: 'The art deco trim has gone dull. Rub along the gold lines. Off the line, it scratches.',
    knobs: 'The doorknobs are hidden all over floor three. Find each one, read the plates, fit the right door.',
    jugglers: 'Midnight juggling club, in the hall again. Catch the jugglers. Not the tenants in nightcaps.',
    notices: 'Rent notices. Slide each one under the right door. Not too soft. Not into their soup.' };
  const DONE = { rent: 'Counted twice. The Peppers will be thrilled. Or suspicious.', locks: 'New locks. The old keys open nothing now. Good.', trim: 'The trim shines. You can see your face in it. Mine looks worried.',
    knobs: 'Every door has its knob back. The tenants can finally get out.', jugglers: 'Club closed for the night. They juggled my keys on the way out.', notices: 'Every notice under the right door. Every tenant groaning. Perfect.' };
  const nextOf = () => { const d = done(), n = GAMES.find(q => !d[q.k]); return (n || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const nextF = () => { const d = done(), f = GAMES.filter(q => q.F), n = f.find(q => !d[q.k]); return (n || f.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const inLobby = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inFloor = P => !!P && Math.abs(P.x - FOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const T = inFloor(lastP) && GN[g].F ? T_GI : T_MG; sayTo(T, [(T === T_GI ? giLn : mgLn)(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('dcaVisits', save.stat('dcaVisits', 0) + 1); J = { g, miss: 0, gold: 0, t: 0, F: !!GN[g].F }; busy = GD[g].errand ? 'errand' : 'job'; ding(); fade(() => GD[g].begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('dcaDone', d); save.setStat('dcaLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const say = () => { const L1 = [mgLn(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) L1.push(mgLn(GIFT[gift])); K.finish(g, stars, gold, first); drawSign(); for (let k = 0; k < 4; k++) tone(1200 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T_MG, L1, () => { if (busy === 'end') { busy = null; J = null; } clockCheck(); }); };
    fade(() => { cleanup(); goRoom(0, -4.4, Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; J.dir = 0; J.pull = null; J.pwOn = false; } hidePanel(); hideCard(); ARW.style.display = 'none'; keeper.position.set(MG0[0], 0, MG0[1]); keeper.rotation.y = MG0[2]; PICK.forEach(m => { m.visible = false; }); knobsShow(); }
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
  const nearMg = p => nearL(p, 0, -5, 2.4), atLiftL = p => nearL(p, LLIFT[0], LLIFT[1], 1.6), atLiftF = p => nearL(p, 0, 9.0, 1.2), nearGi = p => nearL(p, GI0[0] - 1.2, GI0[1], 1.6);
  const nearJug = p => (jugNight() ? JUG.find(j => nearL(p, j.p[0], j.p[1] + 0.9, 1.4)) : null);
  const atFlatDoor = p => nearL(p, -5.3, 4.6, 1.1), spotAt = p => Object.keys(SPOTS).find(k => nearL(p, SPOTS[k][0], SPOTS[k][1], 0.9));
  const sceneReady = () => save.stat('dcaAll', false) && !save.stat('dcaScene', false);
  function prompt(P) {
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) return 'LIFT \u00b7 UP TO FLOOR 3'; return null; }
      if (inFloor(P)) { const p = toF(P), l = GD.knobs.label(p); if (l) return l; if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY'; } return null; }
    if (busy) return null;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftL(p)) return 'LIFT \u00b7 FLOOR 3 \u00b7 FLATS + BALLROOM';
      if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearMg(p)) return sceneReady() ? 'TALK \u00b7 BUILDING MANAGER \u00b7 A WORD' : 'TALK \u00b7 BUILDING MANAGER'; return null; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atLiftF(p)) return 'LIFT \u00b7 DOWN TO THE LOBBY';
      if (atFlatDoor(p) && !rented()) return 'FLAT 3G \u00b7 FOR RENT \u00b7 SEE THE MANAGER'; const s = spotAt(p); if (s && rented()) return s === 'bed' ? 'BED \u00b7 SLEEP TILL MORNING' : s === 'chest' ? 'YOUR CHEST \u00b7 STORE + TAKE' : 'TROPHY SHELF';
      if (nearGi(p)) return 'TALK \u00b7 MISS GILT'; if (nearJug(p)) return 'TALK \u00b7 MIDNIGHT JUGGLER'; return null; }
    return null; }
  let talkM = save.stat('dcaTalked', 0), talkG = 0, talkJ = 0;
  const MG_HI = ['Back again. Rent is due. It is always due.', 'The Peppers sent a letter. It just said RENT.', 'Someone juggled the lobby lamps last night. Again.'];
  function mMenu() { const first = !talkM; talkM++; save.setStat('dcaTalked', talkM); if (clockCheck()) return;
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) }, { text: 'PICK A JOB', pick: () => sayTo(T_MG, [{ ...mgLn('Which one? The doorknobs, the jugglers and the notices are up on three.'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase() + (q.F ? ' \u00b7 FLOOR 3' : ''), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'YOUR FLAT \u00b7 FLAT 3G', pick: flatMenu }];
    if (sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneRent() });
    ch.push({ text: 'WHO TOOK THE DOORKNOBS?', pick: () => sayTo(T_MG, [mgLn('The tenant in 3G. Left at midnight with the juggling club. Funny, that.')]) });
    if (save.stat('dcaScene', false)) ch.push({ text: 'THE SECOND SLOT?', pick: () => sayTo(T_MG, [mgLn('Still there. Still dripping coins to VAX. I count twice and say nothing.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_MG, [mgLn('Goodbye. Pay your rent on the way out. Joking. Mostly.')]) });
    sayTo(T_MG, [{ ...mgLn(first ? 'Deco Apartments, a Pepper property. Six jobs, one flat. The doorknobs are extra.' : sceneReady() ? 'Six for six. I owe you something true. Got a minute?' : MG_HI[(talkM - 2) % MG_HI.length]), choices: ch }]); }
  function sceneRent() { busy = 'scene'; save.setStat('dcaScene', true);
    const end = () => { busy = null; save.setStat('storyDecoRent', true); toast('STORY \u00b7 VAX SKIMS THE PEPPER RENT', 2.6); clockCheck(); };
    sayTo(T_MG, [mgLn('You counted the rent box twice. So do I. It never matches the Pepper books.'), { ...mgLn('The box has a second slot at the back. It drops into a pipe. The pipe goes to VAX.'), choices: [
      { text: 'VAX SKIMS PEPPER RENT?', pick: () => sayTo(T_MG, [mgLn('Half of every coin. The Peppers think their tenants are just cheap.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T_MG, [mgLn('Quietly. The Peppers would blame me. VAX would blame you.')], end) }] }]); }
  const GI_LINES = ['I polish the trim every morning. Then the jugglers smudge it.', 'Flat 3A since the building opened. The doorknobs were nicer then.', 'Midnight, every night. Thump, thump, catch. Thump, thump, drop.', 'The rent box clinks twice when the Peppers collect. Then a third time. Odd.'];
  function gMenu() { talkG++; sayTo(T_GI, [{ ...giLn(GI_LINES[(talkG - 1) % GI_LINES.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextF()) }, { text: 'WHO ARE THE JUGGLERS?', pick: () => sayTo(T_GI, [giLn('Young foxes. Very quick paws. They come in empty and leave with full pockets.')]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  const JUG_LINES = ['Juggling club. Totally normal. Nothing in our pockets.', 'Three balls, then wallets. I mean clubs. Juggling clubs.', 'Shh. Miss Gilt is asleep. We are very quiet jugglers.'];
  const T_JUG = j => ({ key: 'daptJuggler', name: 'Midnight Juggler', role: 'BALLROOM \u00b7 FLOOR 3', obj: j.f, r: 3 });
  const upLift = () => { liftDing(); fade(() => goRoom(0, 7.6, Math.PI, true)); setTimeout(() => KF.chime(), 500); };
  const downLift = () => { liftDing(); fade(() => go(OX + LLIFT[0] + 0.6, LY, LZ + LLIFT[1], Math.PI / 2)); };
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true;
    if (busy === 'errand' && J) { if (inLobby(P)) { const p = toL(P); if (atLiftL(p)) { upLift(); return true; } return false; }
      if (inFloor(P)) { const p = toF(P); if (GD.knobs.act(p)) return true; if (atLiftF(p)) { downLift(); return true; } } return false; }
    if (busy) return false;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) { startGame(r.k); return true; } if (atLiftL(p)) { upLift(); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; } if (nearMg(p)) { tone(1320, 0.05, 0.5); mMenu(); return true; } return false; }
    if (inFloor(P)) { const p = toF(P), r = ringAt(p, true); if (r) { startGame(r.k); return true; } if (atLiftF(p)) { downLift(); return true; }
      if (atFlatDoor(p) && !rented()) { toast('FLAT 3G \u00b7 ' + price() + ' G A WEEK \u00b7 SEE THE MANAGER IN THE LOBBY', 2.6); return true; }
      const s = spotAt(p); if (s && rented()) { if (s === 'bed') sleepHere(); else if (s === 'chest') chest(); else { const n = GOLDS().length; toast(n ? 'TROPHY SHELF \u00b7 ' + n + ' GOLDEN PRIZE' + (n > 1 ? 'S' : '') : 'TROPHY SHELF \u00b7 EMPTY \u00b7 WIN SOME GOLD', 2.4); } return true; }
      if (nearGi(p)) { tone(1320, 0.05, 0.5); gMenu(); return true; }
      const j = nearJug(p); if (j) { talkJ++; sayTo(T_JUG(j), [{ who: 'Midnight Juggler', role: 'BALLROOM \u00b7 FLOOR 3', text: JUG_LINES[(talkJ - 1) % JUG_LINES.length] }]); return true; } return false; }
    return false; }
  // ================= per frame =================
  const DAY_LINES = ['(MISS GILT HUMS AS SHE POLISHES)', '(A NOTICE SLIDES UNDER A DOOR) RENT AGAIN?', '(A TENANT GROANS) THE PEPPERS WANT MORE?', '(THE LIFT CREAKS) FLOOR THREE.'];
  const NIGHT_LINES = ['(THUMP, THUMP, CATCH)', '(THUMP, THUMP, DROP) OOPS.', '(WHISPER) THREE BALLS, THEN THE WALLET.', '(GIGGLING FROM THE BALLROOM)'];
  let dayCheck = 0, amb = 12, spawned = !/[?&]spawn=(decoapts|decofloor)(&|$)/.test(location.search), spawnT = 0, wasR = null;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; const f = /spawn=decofloor/.test(location.search); goRoom(0, 7.6, Math.PI, f); }
    const inL = inLobby(P), inF = inFloor(P); G.visible = inL || (busy === 'job' && !!J && !J.F); FG.visible = inF || (busy === 'job' && !!J && J.F);
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; const r = rented(); if (r !== wasR) { wasR = r; doorM.visible = !r; doorCol.y0 = r ? 999 : LY - 3; drawSign(); }
      if (inL) { gknob.visible = !!save.stat('dcaAll', false); sclock.visible = !!save.stat('dcaClock', false); const b = !!done().trim; if (b !== trimB) drawTrim(b); }
      if (inF) { drawShelf(); const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); const tint = n ? '#5a5488' : dusk ? '#f0d0b0' : '#ffffff'; winM.color.set(tint); viewM.color.set(tint); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('deco apts job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; if (!busy) m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
    for (const k in spotMeshes) spotMeshes[k].visible = !busy && rented();
    if (G.visible) sclock.rotation.y = Math.sin(t * 0.6) * 0.5;
    if (FG.visible) { const p = toF(P); kit.animFox(gilt, dt, 0, false); if (!busy && nearL(p, gilt.position.x, gilt.position.z, 3.5)) turnTo(gilt, Math.atan2(p.x - gilt.position.x, p.z - gilt.position.z), dt, 3); else { turnTo(gilt, GI0[2], dt, 2); armUp(gilt, 1, 0.5 + Math.sin(t * 2.6) * 0.3, -0.9); }
      const jOn = (jugNight() && !(busy === 'errand' && J && J.g === 'knobs')) || (busy === 'job' && J && J.g === 'jugglers');
      JUG.forEach((j, i) => { j.f.visible = jOn; j.balls.forEach(b => { b.visible = jOn; }); if (!jOn) return; kit.animFox(j.f, dt, 0, false); armUp(j.f, 0, -0.5 - Math.sin(t * 6 + i) * 0.2, -1.0); armUp(j.f, 1, 0.5 + Math.sin(t * 6 + i + 1.5) * 0.2, -1.0);
        j.balls.forEach((b, k) => { const ph = t * 5.5 + k * 2.09 + i; b.position.set(j.p[0] + Math.sin(ph) * 0.3, 1.25 + Math.abs(Math.cos(ph)) * 0.6, j.p[1] + 0.38); }); });
      if (inF && !busy && (amb -= dt) <= 0) { const nt = jugNight(); amb = (nt ? 24 : 42) + Math.random() * 14; if (nt) tone(110, 0.04, 0.2, 'sine'); toast(pick1(nt ? NIGHT_LINES : DAY_LINES), 2.4); } }
    K.tick(dt, toL(P), { inShop: inL, busy: !!busy, near: 0, talking: false, clear: endClear > 0 ? [0, -4.4, 2.6] : null });
    KF.tick(dt, toF(P), { inShop: inF, busy: !!busy, near: 0, talking: false }); }
  drawShelf(); knobsShow();
  const API = { group: G, floor: FG, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading, rented: rented(), price: price() }),
    spawn: { decoapts: [OX, LZ + 7.6, Math.PI, LY], decofloor: [FOX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), scene: sceneRent, up: upLift, down: downLift, rent: rentFlat, keeper, gilt, jugglers: JUG,
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    _view(p, l, F = false, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p, F)); c.lookAt(toW(...l, F)); c.updateMatrixWorld(); return c; },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); KF.dispose(); } };
  window.__decoApts = API; return API;
}
