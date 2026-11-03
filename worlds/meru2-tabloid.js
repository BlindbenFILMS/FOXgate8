// MERU 2.0 — s111 MERU BUZZ OFFICE [meruTabloid] (Ben s111 picks: BOTH keepers give jobs (RUMOUR REPORTER: RUMOUR HUNT · PAPARAZZI SNAP · HEADLINE WRITER · FACT CHECK;
// INTERN: BLURRY PHOTO · GOSSIP PHONE LINE · CLICKBAIT · COMMENTS MOD) · messy web office: wall of screens + live CLICK counter + PINBOARD with red string · GENTLE ·
// prizes: DISGUISE (trench coat, sunglasses, fake moustache; 1st clear), SPY CAMERA item (2), YOUR RUMOURS on the lobby screen + town ticker (3), TOWN GOSSIP about you (5),
// GOLD SCOOP + 60 gold (all 8) · then THE BIG SCOOP on the pinboard hints who sent the bandits (Salt) — and Salt owns Meru Buzz).
// The OFFICE = an extra room in the cluster lobby row (clusters.addRoom), through an OFFICE door in the Meru Buzz lobby back wall (quick fade).
// Kit pieces (card, panel, fade, marker, arrow, job camera) follow worlds/meru2-radio.js + meru2-tv.js. Stats prefix mbz.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { storyHeadlines } from './meru2-tips.js';
export function buildTabloidOffice({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, terrainAt = () => 0, go }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'tabloid'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, LOX = LR.ox, RH = 6;
  const SR = clusters.addRoom({ key: 'tabloidOffice', room: 'meruTabloid', title: 'MERU BUZZ \u00b7 OFFICE' }, RH); SR.out = LR.out; const OX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', NAVY = '#1d2a33', STEEL = '#9aa0a6', DARK = '#3d3b3a', BLACK = '#26292d', GREEN = '#3f9a5e', WOOD = '#7a5236', PURP = '#7c4dc4', PINK = '#ff7ab8';
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c })), BM = c => new THREE.MeshBasicMaterial({ color: c });
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
  const planeT = (tex, w, h, x, y, z, ry, parent, both = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: both ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.set(0, ry, 0); m.userData.noCull = true; parent.add(m); return m; };
  const rectL = (a, b, c, d) => cols.push({ f: [OX + a, OX + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'meruBuzzOffice'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const today = () => save.stat('meru2Day', 1);
  const done = () => save.stat('mbzDone', null) || {};
  const hash = n => { n = (n * 2654435761) >>> 0; n ^= n >>> 15; n = Math.imul(n, 2246822519) >>> 0; n ^= n >>> 13; return n >>> 0; };
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n);
  // ================= OFFICE SHELL (messy web office) =================
  const R0 = mk(), { box, cyl, sph } = R0, WALL = '#d6cfc2';
  box(20, 0.1, 20, '#56606a', 0, -0.05, 0); for (let x = -9; x <= 9; x += 2) box(0.03, 0.012, 20, '#4a535c', x, 0.006, 0); for (let z = -9; z <= 9; z += 2) box(20, 0.012, 0.03, '#4a535c', 0, 0.006, z);
  box(20, 0.2, 20, '#e6e2da', 0, RH + 0.1, 0);
  box(20, RH, 0.3, WALL, 0, RH / 2, -10); for (const s of [-1, 1]) { box(0.3, RH, 20, WALL, s * 10, RH / 2, 0); box(8.4, RH, 0.3, WALL, s * 5.8, RH / 2, 10); }
  box(3.2, RH - 3.2, 0.3, WALL, 0, 3.2 + (RH - 3.2) / 2, 10); box(3.2, 3.2, 0.05, '#141517', 0, 1.6, 10.12);
  for (const s of [-1, 1]) box(0.14, 3.3, 0.16, PURP, s * 1.66, 1.65, 9.8); box(3.46, 0.14, 0.16, PURP, 0, 3.27, 9.8);
  box(20, 0.3, 0.06, PURP, 0, 0.15, -9.82); for (const s of [-1, 1]) box(0.06, 0.3, 20, PURP, s * 9.82, 0.15, 0);   // skirting
  box(1.8, 0.02, 15.8, RED, 0, 0.012, 1.7); for (const s of [-1, 1]) box(0.06, 0.022, 15.8, INK, s * 0.9, 0.014, 1.7);   // runner: door → the reporter's desk
  rectL(-10, 10, -10.2, -9.8); rectL(9.8, 10.2, -10, 10); rectL(-10.2, -9.8, -10, 10); rectL(-10, -1.6, 9.8, 10.2); rectL(1.6, 10, 9.8, 10.2);
  // WALL OF SCREENS (north) + the reporter's desk under it
  box(9.4, 3.6, 0.2, INK, 0, 3.6, -9.8);
  box(4.4, 0.08, 1.3, '#c9ced3', 0, 1.0, -7.6); box(4.2, 0.95, 1.1, INK, 0, 0.48, -7.6); box(4.2, 0.95, 0.06, PURP, 0, 0.48, -7.02); rectL(-2.2, 2.2, -8.25, -6.95);
  for (const x of [-1.2, 1.2]) { box(0.9, 0.56, 0.05, BLACK, x, 1.42, -7.95, x < 0 ? 0.2 : -0.2); box(0.08, 0.16, 0.08, DARK, x, 1.1, -7.95); }
  for (let k = 0; k < 6; k++) box(0.32, 0.02 + (k % 3) * 0.04, 0.42, PAPER, -1.9 + k * 0.7 + (k % 2) * 0.1, 1.05 + (k % 3) * 0.02, -7.35 + (k % 2) * 0.12, k * 0.4);
  for (const [x, z] of [[0.2, -7.2], [-0.4, -7.4], [1.8, -7.3]]) { cyl(0.05, 0.04, 0.12, PAPER, x, 1.1, z, 8); cyl(0.051, 0.051, 0.03, RED, x, 1.12, z, 8); }
  // BLURRY PHOTO desk (NW) + CLICKBAIT LAB desk (NE): a desk each + a big monitor
  for (const s of [-1, 1]) { box(3.0, 0.08, 1.2, WOOD, s * 6, 0.9, -8.3); box(2.9, 0.86, 1.1, DARK, s * 6, 0.43, -8.3); rectL(s * 6 - 1.5, s * 6 + 1.5, -8.95, -7.7);
    box(1.9, 1.15, 0.08, INK, s * 6, 1.62, -8.75); box(0.1, 0.3, 0.1, DARK, s * 6, 1.05, -8.75); cyl(0.3, 0.3, 0.06, '#3a3d42', s * 6 + s * 1.1, 0.96, -8.0, 12); }
  // DESK PODS (middle): 4 monitors each, chairs, paper drifts
  for (const s of [-1, 1]) { const cx = s * 4.2; box(3.2, 0.08, 1.8, '#e8e4dc', cx, 0.9, -0.6); box(0.06, 0.86, 1.7, DARK, cx - 1.55, 0.43, -0.6); box(0.06, 0.86, 1.7, DARK, cx + 1.55, 0.43, -0.6); box(3.1, 0.3, 0.04, PURP, cx, 1.1, -0.6); rectL(cx - 1.6, cx + 1.6, -1.5, 0.3);
    for (const dx of [-0.8, 0.8]) for (const sz of [-1, 1]) { box(0.7, 0.44, 0.04, BLACK, cx + dx, 1.3, -0.6 + sz * 0.3); box(0.06, 0.12, 0.06, DARK, cx + dx, 1.0, -0.6 + sz * 0.3); box(0.5, 0.06, 0.5, '#5a6168', cx + dx, 0.5, -0.6 + sz * 1.3); box(0.5, 0.5, 0.06, '#5a6168', cx + dx, 0.8, -0.6 + sz * 1.55); } }
  // HOT LINE (west): the gossip phone desk · COFFEE (the intern) · COMMENTS desk
  box(1.2, 0.08, 2.0, WOOD, -9.0, 0.9, 0.8); box(1.1, 0.86, 1.9, DARK, -9.0, 0.43, 0.8); box(0.36, 0.12, 0.5, RED, -8.9, 1.0, 0.6); box(0.42, 0.06, 0.12, INK, -8.9, 1.1, 0.5); rectL(-9.6, -8.4, -0.2, 1.8);
  for (let k = 0; k < 5; k++) box(0.06, 0.12, 0.12, k % 2 ? RED : YEL, -9.55, 1.8 + k * 0.2, 1.4);
  box(0.8, 1.0, 1.2, DARK, -9.5, 0.5, 3.0); box(0.5, 0.6, 0.4, '#b6bcc2', -9.55, 1.3, 2.8); box(0.12, 0.12, 0.12, RED, -9.3, 1.45, 2.8); for (let k = 0; k < 4; k++) cyl(0.05, 0.04, 0.12, PAPER, -9.4, 1.06, 3.2 + k * 0.12, 8); rectL(-9.9, -9.1, 2.4, 3.6);
  box(1.2, 0.08, 2.2, '#e8e4dc', -9.0, 0.9, 5.2); box(1.1, 0.86, 2.1, DARK, -9.0, 0.43, 5.2); for (const z of [4.7, 5.7]) { box(0.05, 0.5, 0.8, BLACK, -9.3, 1.3, z); } rectL(-9.6, -8.4, 4.1, 6.3);
  // PINBOARD (east wall): cork in a frame, red string (canvas)
  box(0.12, 2.8, 4.6, '#5a3d2b', 9.82, 2.5, 0.6); rectL(9.6, 10, -1.8, 3.0);
  // mess: pizza boxes, beanbag, plant, water cooler, bins + paper balls, a filing cabinet, newspaper drifts
  for (let k = 0; k < 5; k++) box(0.5, 0.06, 0.5, k % 2 ? '#d8c6a0' : '#cdb88e', 8.6, 0.04 + k * 0.065, 6.4, k * 0.25);
  sph(0.62, RED, 8.0, 0.36, 4.0); sph(0.45, '#c42a12', 8.2, 0.6, 3.75); circL(8.0, 4.0, 0.7);
  cyl(0.28, 0.22, 0.5, WOOD, 9.2, 0.25, -5.6, 10); sph(0.55, '#4f7d3a', 9.2, 0.95, -5.6); sph(0.4, '#5f8d48', 9.0, 1.35, -5.4); circL(9.2, -5.6, 0.5);
  box(0.4, 1.2, 0.4, '#cfd5da', 9.4, 0.6, 8.6); cyl(0.16, 0.16, 0.4, '#7cc4ff', 9.4, 1.4, 8.6, 10); circL(9.4, 8.6, 0.35);
  for (const [x, z] of [[-6.4, -1.2], [6.4, -1.2], [-7.0, 6.8], [2.6, -7.8]]) { cyl(0.18, 0.15, 0.4, STEEL, x, 0.2, z, 10); for (let k = 0; k < 3; k++) sph(0.07, PAPER, x + Math.cos(k * 2.1) * 0.35, 0.07, z + Math.sin(k * 2.1) * 0.35); }
  box(0.6, 1.4, 0.7, '#8a9096', -9.5, 0.7, -4.6); box(0.6, 1.4, 0.7, '#8a9096', -9.5, 0.7, -3.8); for (let k = 0; k < 3; k++) box(0.04, 0.06, 0.3, DARK, -9.18, 0.3 + k * 0.42, -4.2); rectL(-9.9, -9.1, -5.0, -3.4);
  for (let k = 0; k < 26; k++) { const a = hash(k + 11) % 1000 / 1000, b = hash(k * 7 + 3) % 1000 / 1000, side = k % 2 ? 1 : -1, x = side * (2.0 + a * 6.6), z = -5.6 + b * 12.4; if (Math.abs(x) < 1.6) continue; box(0.3, 0.008, 0.4, k % 5 ? PAPER : YEL, x, 0.02 + (k % 3) * 0.004, z, a * 6); }
  // fluorescent strips
  const LAMPS = [[-5, -5], [5, -5], [-5, 2], [5, 2], [-5, 7], [5, 7], [0, -2], [0, 4]]; for (const [x, z] of LAMPS) box(0.36, 0.06, 2.6, '#f6f6f0', x, RH - 0.05, z);
  R0.mesh(G);
  // signs, logo, pinboard, screens
  const logoT = CT(1024, 160, (g, W, H) => { g.fillStyle = PURP; g.fillRect(0, 0, W, H); g.fillStyle = YEL; g.font = '900 104px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU BUZZ', 30, H / 2 + 6); g.fillStyle = '#fff'; g.font = '900 34px Archivo, sans-serif'; g.fillText('FIRST \u00b7 MOSTLY TRUE', W - 400, H / 2 + 4); });
  planeT(logoT, 5.2, 0.81, 0, 5.62, -9.83, 0, G);
  planeT(plate('LOBBY \u00b7 MERU BUZZ', 512, 96, INK, PAPER, RED), 2.4, 0.45, 0, 3.6, 9.83, Math.PI, G);
  planeT(plate('HOT LINE', 384, 96, INK, PAPER, RED), 1.5, 0.38, -9.83, 2.9, 0.8, Math.PI / 2, G);
  planeT(plate('COMMENTS', 384, 96, INK, PAPER, RED), 1.5, 0.38, -9.83, 2.9, 5.2, Math.PI / 2, G);
  planeT(plate('COFFEE', 256, 96, INK, PAPER, RED), 1.0, 0.36, -9.83, 2.4, 3.0, Math.PI / 2, G);
  planeT(plate('PINBOARD \u00b7 THE BIG ONE', 512, 96, INK, PAPER, RED), 2.4, 0.45, 9.74, 4.25, 0.6, -Math.PI / 2, G);
  planeT(plate('ENHANCE', 384, 96, INK, PAPER, RED), 1.4, 0.34, -6, 2.5, -8.72, 0, G);
  planeT(plate('CLICKBAIT LAB', 512, 96, INK, PAPER, RED), 1.7, 0.32, 6, 2.5, -8.72, 0, G);
  const blurT = CT(256, 160, (g, W, H) => { const s = document.createElement('canvas'); s.width = 16; s.height = 10; const q = s.getContext('2d'); q.fillStyle = '#7cc4ff'; q.fillRect(0, 0, 16, 10); q.fillStyle = '#2e86b8'; q.fillRect(0, 6, 16, 4); q.fillStyle = '#ffd23a'; q.fillRect(6, 4, 4, 3); q.fillStyle = '#e07a1f'; q.fillRect(10, 5, 2, 1); g.imageSmoothingEnabled = false; g.drawImage(s, 0, 0, W, H); g.fillStyle = RED; g.font = '900 22px Archivo, sans-serif'; g.fillText('LAKE MONSTER??', 10, 26); });
  planeT(blurT, 1.8, 1.08, -6, 1.62, -8.7, 0, G);
  const thumbT = CT(256, 160, (g, W, H) => { const c = [YEL, PINK, '#7cc4ff', RED]; for (let i = 0; i < 4; i++) { const x = (i % 2) * 128, y = Math.floor(i / 2) * 80; g.fillStyle = c[i]; g.fillRect(x + 2, y + 2, 124, 76); g.fillStyle = INK; g.font = '900 26px Archivo, sans-serif'; g.fillText(['WOW!', 'OMG', 'NO WAY', '?!'][i], x + 10, y + 46); g.fillStyle = RED; g.beginPath(); g.moveTo(x + 104, y + 20); g.lineTo(x + 120, y + 40); g.lineTo(x + 104, y + 60); g.fill(); } });
  planeT(thumbT, 1.8, 1.08, 6, 1.62, -8.7, 0, G);
  // the wall of screens: CLICKS TODAY (live), TRENDING, TOP STORY
  const scrT = CT(1024, 384, () => {}); planeT(scrT, 9.0, 3.375, 0, 3.6, -9.68, 0, G);
  const clicks = () => save.stat('mbzClicks', 41200) + Math.floor(clickDrift);
  let clickDrift = 0, scrKey = '';
  // the PINBOARD canvas (cards + red string; the strings fill in after THE BIG SCOOP)
  const pinT = CT(800, 460, () => {}); planeT(pinT, 4.2, 2.42, 9.74, 2.5, 0.6, -Math.PI / 2, G);
  // the GOLD SCOOP on the reporter's desk (all 8)
  const gold = new THREE.Group(); { const S = mk(); S.cyl(0.1, 0.14, 0.08, '#b08a2a', 0, 0.04, 0, 12); S.cyl(0.03, 0.03, 0.22, '#e0b84a', 0, 0.19, 0, 8); S.sph(0.13, '#e0b84a', 0, 0.36, 0); S.box(0.2, 0.06, 0.02, INK, 0, 0.06, 0.13); S.mesh(gold); } gold.position.set(-1.7, 1.04, -7.3); G.add(gold); gold.visible = false;
  const bulbs = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(LAMPS.flatMap(([x, z]) => [x, RH - 0.3, z]), 3)), new THREE.PointsMaterial({ size: 1.6, color: '#f6fbff', map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bulbs.frustumCulled = false; G.add(bulbs);
  // ================= LOBBY: OFFICE door + the BUZZ SCREEN =================
  const LG = new THREE.Group(); LG.position.set(LOX, LY, LZ); scene.add(LG); LG.visible = false;
  { const D = mk(); D.box(1.9, 2.9, 0.06, '#141517', 5.6, 1.45, -9.82); for (const s of [-1, 1]) D.box(0.12, 3.0, 0.12, PURP, 5.6 + s * 1.0, 1.5, -9.8); D.box(2.12, 0.12, 0.12, PURP, 5.6, 3.0, -9.8); D.box(1.6, 0.02, 1.0, RED, 5.6, 0.012, -9.1); D.mesh(LG);
    planeT(plate('OFFICE \u00b7 COME IN', 512, 96, INK, PAPER, RED), 2.0, 0.38, 5.6, 3.35, -9.83, 0, LG); }
  const lbT = CT(512, 296, () => {}); const RWx = GEO.RW / 2 - 0.29; planeT(lbT, 2.36, 1.36, RWx, 2.8, -3.6, -Math.PI / 2, LG);
  const LDOOR = [5.6, -8.6], SDOOR = [0, 8.8];
  const CBt = (L.CLUSTER_BUILDINGS || []).find(c => c.key === 'tabloid'), D0 = CBt && CBt.D;
  const OUTW = (lx, lz) => { const c = Math.cos(D0.ry), s = Math.sin(D0.ry); return [D0.x + lx * c + lz * s, D0.z - lx * s + lz * c]; };
  const doorOut = () => (D0 ? [...OUTW(0, 11), D0.ry] : LR.out ? [LR.out.x, LR.out.z, LR.out.yaw] : null);
  // ================= FOXES =================
  const RP0 = [0.6, -8.6, 0], IN0 = [-8.3, 3.0, Math.PI / 2];
  const rep = kit.makeFox({ key: 'tabReporter', name: 'Rumour Reporter', torso: ['#c084fc', '#f3f2f2', '#4a2a6b'], outfit: 'coat', mood: 'happy' }); rep.position.set(RP0[0], 0, RP0[1]); rep.rotation.y = RP0[2]; rep.userData.noCull = true; rep.userData.rosterShop = 'Meru Buzz'; G.add(rep);
  const intern = kit.makeFox({ key: 'tabIntern', name: 'Intern', torso: ['#7cc4ff', '#f3f2f2', '#2e4a6b'], outfit: 'vest', mood: 'happy' }); intern.position.set(IN0[0], 0, IN0[1]); intern.rotation.y = IN0[2]; intern.userData.noCull = true; intern.userData.rosterShop = 'Meru Buzz'; intern.userData.rosterRole = 'keeper'; G.add(intern); circL(IN0[0], IN0[1], 0.45);
  // sunglasses (+ a fake moustache) on any fox's head
  // sunglasses painted on the face (fox-kit face.sun, like Hope) + a fake moustache under the nose; returns { off() }
  const shadesOn = (f, tache = false) => { const u = f && f.userData, P = u && u.P; if (!P || !P.head) return null; if (u.face) { u.face.sun = true; u.face.key = ''; } let g = null;
    if (tache) { g = new THREE.Group(); const n = P.nose ? P.nose.position : V(0, -0.045, 0.45), m = LM('#4a3020'); g.position.set(n.x, n.y - 0.06, n.z - 0.04);
      for (const s2 of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.035, 0.04), m); e.position.set(s2 * 0.05, -0.006, 0); e.rotation.z = s2 * -0.32; g.add(e); const t2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.03, 0.035), m); t2.position.set(s2 * 0.11, -0.03, -0.012); t2.rotation.z = s2 * -0.9; g.add(t2); } P.head.add(g); }
    return { off() { if (u.face) { u.face.sun = false; u.face.key = ''; } if (g && g.parent) g.parent.remove(g); } }; };
  // ================= shopKit (the reporter = keeper; the intern has her own idle) =================
  const GAMES = [{ k: 'rumour', name: 'Rumour Hunt', color: PURP, who: 'rp' }, { k: 'papa', name: 'Paparazzi Snap', color: RED, who: 'rp' }, { k: 'headline', name: 'Headline Writer', color: '#e07a1f', who: 'rp' }, { k: 'fact', name: 'Fact Check', color: GREEN, who: 'rp' },
    { k: 'blurry', name: 'Blurry Photo', color: '#2e86b8', who: 'in' }, { k: 'phone', name: 'Gossip Phone Line', color: PINK, who: 'in' }, { k: 'click', name: 'Clickbait', color: YEL, who: 'in' }, { k: 'comments', name: 'Comments Mod', color: NAVY, who: 'in' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { rumour: [-3.0, 7.4], papa: [3.0, 7.4], headline: [-2.2, -5.4], fact: [2.2, -5.4], blurry: [-6.0, -6.4], click: [6.0, -6.4], phone: [-7.6, 0.8], comments: [-7.6, 5.2] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mbz', color: PURP, boardTitle: 'Meru Buzz board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.3], keeper: rep, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: -6.2, y: 2.4, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 6.2, z: 8.2, ry: 0 }, hiringLine: 'GOSSIP \u00b7 PHOTOS \u00b7 CLICKS', sun: [], lamps: LAMPS.map(([x, z]) => [x, RH - 0.3, z]), lampsOn: () => true,
    browse: [[4.2, 1.4, Math.PI], [-4.2, 1.4, Math.PI], [7.4, 2.0, Math.PI / 2]], looks: [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#4f7d3a', '#e2d2b4', '#2a3d20']], clock: { x: 0, y: 5.0, z: 9.83, ry: Math.PI } });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); G.add(m); ringMeshes[k] = m; }
  // ================= KIT: sound, toast, fade, card, panel, marker, arrow, snap button =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null, nb = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.1, k = 0.1, type = 'highpass', f = 5000, at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(); if (!nb) { nb = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain(), t = a.currentTime + at; s.buffer = nb; fl.type = type; fl.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); s.connect(fl).connect(gn).connect(a.destination); s.start(t, Math.random()); s.stop(t + len + 0.05); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const shutter = () => { noise(0.05, 0.25, 'highpass', 3000); noise(0.08, 0.2, 'bandpass', 1800, 0.06); tone(3200, 0.02, 0.05, 'square'); };
  const ringRing = () => { for (let i = 0; i < 2; i++) for (let k = 0; k < 6; k++) tone(k % 2 ? 1100 : 1320, 0.03, 0.05, 'square', i * 0.5 + k * 0.05); };
  let veil = null, fading = false; const fade = fn => { if (fading) { setTimeout(() => fade(fn), 380); return; } fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  const FLASH = document.createElement('div'); FLASH.style.cssText = 'position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:41;transition:opacity .35s'; document.body.appendChild(FLASH);
  const flash = () => { FLASH.style.transition = 'none'; FLASH.style.opacity = '0.85'; void FLASH.offsetWidth; FLASH.style.transition = 'opacity .35s'; FLASH.style.opacity = '0'; };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + PURP + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
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
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + PURP + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const tipBar = t => '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + t + '</div>';
  const showPanel = html => { fitPanel(); PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => quit(); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none' && J && GD[J.g] && GD[J.g].draw) { fitPanel(); GD[J.g].draw(); } fitSnap(); });
  const shake = el => { try { el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); } catch (e) {} };
  const pulse = el => { if (!el) return; el.style.outline = '4px solid #ffd23a'; try { el.animate([{ outlineColor: '#ffd23a', outlineWidth: '4px' }, { outlineColor: 'rgba(255,210,58,0)', outlineWidth: '8px' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  const BTN = 'min-width:0;min-height:56px;padding:6px 10px;text-align:left;background:#fff;color:#201e1d;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;line-height:1.15;cursor:pointer;outline:0 solid transparent';
  const tagT = (txt, bg, fg) => CT(64, 96, (g, W, H) => { g.fillStyle = bg; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(4, 4, W - 8, H - 8); g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = fg; g.font = '900 60px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(txt, W / 2, H / 2 + 3); });
  const bangT = tagT('!', YEL, INK), askT = tagT('?', YEL, INK), eyeT = tagT('\u25c9', RED, '#fff'), okT = tagT('\u2713', GREEN, '#fff'), dotsT = CT(128, 64, (g, W, H) => { g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 5; g.fillRect(4, 4, W - 8, H - 18); g.strokeRect(4, 4, W - 8, H - 18); g.fillStyle = INK; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(36 + i * 28, 27, 7, 0, 7); g.fill(); } });
  const beamM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const marker = (x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 16, 10, 1, true), beamM); b.position.y = 8; g.add(b); g.traverse(o => { o.userData.noCull = true; }); scene.add(g); return g; };
  const sprite = (map, w, h) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, depthTest: false, transparent: true })); s.scale.set(w, h, 1); s.renderOrder = 5; s.userData.noCull = true; return s; };
  const ARW = document.createElement('div'); ARW.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;background:#201e1d;color:#ffd23a;font-weight:900;font-size:15px;padding:6px 10px;border:2px solid #ffd23a;white-space:nowrap;transform:translate(-50%,-100%)';
  document.body.appendChild(ARW); const tmp = V();
  function arrowTo(w, label) { if (!w) { ARW.style.display = 'none'; return; } tmp.copy(w).project(camera); let x = (tmp.x + 1) / 2 * innerWidth, y = (1 - tmp.y) / 2 * innerHeight; const behind = tmp.z > 1; if (behind) { x = innerWidth - x; y = innerHeight - y; }
    const m = 120, mr = innerWidth < 600 ? 130 : 270, mt = innerHeight < 520 ? 60 : 130, mb = innerHeight < 520 ? 70 : 250, off = behind || x < m || x > innerWidth - mr || y < mt || y > innerHeight - mb, cx = innerWidth / 2, cy = innerHeight / 2;
    let ar = '\u25bc'; if (off) { const a = Math.atan2(y - cy, x - cx); x = clamp(x, m, innerWidth - mr); y = clamp(y, mt, innerHeight - mb); ar = '<span style="display:inline-block;transform:rotate(' + (a * 180 / Math.PI + 90).toFixed(0) + 'deg)">\u25b2</span>'; }
    ARW.style.display = 'block'; ARW.style.left = Math.round(x) + 'px'; ARW.style.top = Math.round(y) + 'px'; const h = ar + ' ' + label; if (ARW._h !== h) { ARW._h = h; ARW.innerHTML = h; } }
  const SNAP = document.createElement('button'); SNAP.textContent = 'SNAP'; SNAP.setAttribute('aria-label', 'Snap a photo');
  SNAP.style.cssText = 'position:fixed;z-index:31;display:none;width:128px;min-height:64px;padding:0 14px;text-align:left;background:#ec3013;color:#fff;border:2px solid #201e1d;border-radius:0;font:900 22px Archivo,sans-serif;cursor:pointer;touch-action:none';
  document.body.appendChild(SNAP); stopEv(SNAP); SNAP.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (J && J.g === 'papa') GD.papa.snap(); });
  const fitSnap = () => { const port = innerWidth < innerHeight, short = innerHeight < 520; Object.assign(SNAP.style, { left: Math.round(innerWidth / 2 - 64) + 'px', bottom: (touch && port ? 210 : short ? (touch ? 58 : 12) : touch ? 70 : 96) + 'px' }); }; fitSnap();
  // ================= state =================
  let busy = null, J = null, lastP = null, lastFox = null, snapK = false, endClear = 0;
  const addGold = n => { n = Math.max(0, Math.round(n)); if (!J) return 0; J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { if (!J) return; J.miss++; nope(); toast(msg, s); const tip = PANEL.style.display !== 'none' && PANEL.querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#ec3013'; tip.style.color = '#ffffff'; } };
  const timeBar = (el, f, warn) => { if (!el) return; el.style.width = (clamp(f, 0, 1) * 100).toFixed(1) + '%'; el.style.background = warn ? RED : INK; };
  const bump = n => { save.setStat('mbzClicks', save.stat('mbzClicks', 41200) + Math.round(n)); scrKey = ''; };
  // ================= talk targets =================
  const ln = (who, role) => text => ({ who, role, text });
  const T_RP = { key: 'tabReporter', name: 'Rumour Reporter', role: 'MERU BUZZ', obj: rep, ry: RP0[2], r: 6 }, rpLn = ln('Rumour Reporter', 'MERU BUZZ');
  const T_IN = { key: 'tabIntern', name: 'Intern', role: 'MERU BUZZ', obj: intern, ry: IN0[2], r: 6 }, inLn = ln('Intern', 'MERU BUZZ');
  const giver = g => (GN[g].who === 'in' ? [T_IN, inLn] : [T_RP, rpLn]);
  const goRoom = (x, z, yaw) => go(OX + x, LY, LZ + z, yaw);
  const place = (f, x, z, ry) => { f.position.set(x, 0, z); f.rotation.y = ry; };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const turnTo = (f, want, dt, k = 4) => { let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * k); };
  const GD = {};
  // town spots (copied from worlds/meru2-tv.js): free sidewalk points near the tower
  const freeAt = (x, z) => { if (L.outOfMap && L.outOfMap(x, z, 6)) return false; if (L.lakeF && L.lakeF(x, z) < 1.2) return false; if ((L.BUILDINGS || []).some(b => b.f && x > b.f[0] - 1 && x < b.f[1] + 1 && z > b.f[2] - 1 && z < b.f[3] + 1)) return false;
    return !cols.some(c => c.y0 == null && c.on !== false && (c.c ? Math.hypot(c.c[0] - x, c.c[1] - z) < c.c[2] + 2.2 : c.f && c.f[1] - c.f[0] < 300 && x > c.f[0] - 2.2 && x < c.f[1] + 2.2 && z > c.f[2] - 2.2 && z < c.f[3] + 2.2)); };
  function sidewalkSpots(cx, cz, r0, r1) { const out = []; for (const R of L.ROADS || []) { const p = R.p || []; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], len = Math.hypot(bx - ax, bz - az); if (len < 12) continue; const nx = -(bz - az) / len, nz = (bx - ax) / len, off = (R.w || 8) / 2 + 2.2;
      for (let s = 6; s < len - 6; s += 8) { const x0 = ax + (bx - ax) * s / len, z0 = az + (bz - az) * s / len; for (const sg of [-1, 1]) { const x = x0 + nx * off * sg, z = z0 + nz * off * sg, d = Math.hypot(x - cx, z - cz); if (d < r0 || d > r1 || !freeAt(x, z)) continue; out.push([x, z, nx * sg, nz * sg, (bx - ax) / len, (bz - az) / len]); } } } } return out; }
  const spread = (all, n, gap) => { const out = []; for (const s of shuffle(all)) { if (out.every(o => Math.hypot(o[0] - s[0], o[1] - s[1]) > gap)) out.push(s); if (out.length >= n) break; } return out; };
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#7c4dc4', '#e7e4dc', '#3d2563'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  const disguised = () => { const o = save.data && save.data.outfit; return !!(o && o.name === DISGUISE.name); };
  // ---------- 1 RUMOUR HUNT (walk the town): sneak up on 3 pairs of gossips, freeze when one looks round ----------
  const RUMOURS = ['THE FERRY CAPTAIN IS SCARED OF DUCKS.', 'STERLING GLOSS\u2019S HAIR HAS ITS OWN BODYGUARD.', 'GEARS TALKS TO HIS MODELS. THEY TALK BACK.', 'THE CASINO DICE ALL HAVE NAMES.', 'THE WEATHER FOX OWNS NINE UMBRELLAS.', 'THE MORNING DJ SINGS IN THE BATH. SONG FOUR.', 'SALT BOATS SAIL AT NIGHT WITH THE LIGHTS OFF.', 'BOLT HAS NEVER CALLED ANYONE BY THEIR NAME.'];
  const HUNTT = 120, LISTEN = 4, NEAR = 6;
  GD.rumour = { errand: true,
    begin() { const o = doorOut(); if (!o) { stop(); return; } const all = sidewalkSpots(o[0], o[1], 25, 85), sp = spread(all, 3, 18); const pick = pickN(RUMOURS.slice(0, 6), 2).concat(RUMOURS.slice(6, 7)); J.pairs = [];
      if (sp.length < 3) for (let i = sp.length; i < 3; i++) { const [x, z] = OUTW(-14 + i * 14, 30 + i * 6); sp.push([x, z, 0, 1, 1, 0]); }
      sp.forEach((s, i) => { const [x, z, ux, uz, tx, tz] = s, y = terrainAt(x, z) || 0, f = [-1, 1].map((sg, j) => { const fx = x + tx * 0.75 * sg, fz = z + tz * 0.75 * sg, fo = kit.makeFox({ key: 'buzzGossip' + i + j, name: 'Gossip', torso: LOOKS[(i * 2 + j) % LOOKS.length], outfit: ['coat', 'dress', 'vest', 'robe'][(i + j) % 4], mood: 'happy' });
          fo.position.set(fx, terrainAt(fx, fz) || y, fz); fo.rotation.y = Math.atan2(-tx * sg, -tz * sg); fo.userData.noCull = true; fo.userData.crowd = true; fo.userData.ry0 = fo.rotation.y; scene.add(fo); J.objs.push(fo); const c1 = { c: [fx, fz, 0.45] }; cols.push(c1); J.cols.push(c1); return fo; });
        const m = marker(x, y, z); J.objs.push(m); const tag = sprite(dotsT, 1.0, 0.5); tag.position.set(x, y + 2.9, z); scene.add(tag); J.objs.push(tag);
        J.pairs.push({ x, z, y, f, m, tag, prog: 0, heard: false, ph: 'talk', pt: rnd(2.5, 4.5), looker: i % 2, cool: 0, txt: pick[i] }); });
      J.t0 = performance.now(); J.pp = null; J.mv = 0; fade(() => { go(o[0], 0.6, o[1], o[2]); }); toast('FOLLOW THE YELLOW BEAMS', 2.2); },
    tick(dt, t) { const P = lastP; if (!P) return; if (J.pp) { const v = Math.hypot(P.x - J.pp.x, P.z - J.pp.z) / Math.max(dt, 0.001); J.mv += (v - J.mv) * Math.min(1, dt * 8); } J.pp = { x: P.x, z: P.z };
      const spotR = disguised() ? 5.5 : 9; let best = null, bd = 1e9;
      for (const p of J.pairs) { const d = Math.hypot(P.x - p.x, P.z - p.z); if (!p.heard && d < bd) { bd = d; best = p; } if (d > 70) continue;
        p.f.forEach(f => kit.animFox(f, dt, 0, false)); if (p.heard) continue; p.pt -= dt; p.cool -= dt; const lk = p.f[p.looker];
        if (p.ph === 'talk') { turnTo(lk, lk.userData.ry0, dt); armUp(p.f[1 - p.looker], 1, 0.4 + Math.sin(t * 6) * 0.3, -0.6); if (p.pt <= 0) { p.ph = 'warn'; p.pt = 1.0; p.tag.material.map = askT; p.tag.scale.set(0.5, 0.75, 1); p.tag.material.needsUpdate = true; tone(660, 0.03, 0.12, 'triangle'); } }
        else if (p.ph === 'warn') { if (p.pt <= 0) { p.ph = 'look'; p.pt = 1.6; p.tag.material.map = eyeT; p.tag.material.needsUpdate = true; } }
        else { turnTo(lk, Math.atan2(P.x - lk.position.x, P.z - lk.position.z), dt, 5); if (d < spotR && J.mv > 0.9 && p.cool <= 0) { p.cool = 3; p.prog = Math.max(0, p.prog - 0.4); missOne('SPOTTED! FREEZE WHEN THEY LOOK', 2); lk.userData.mood = 'angry'; }
          if (p.pt <= 0) { p.ph = 'talk'; p.pt = rnd(3, 5); p.looker = Math.random() < 0.5 ? 0 : 1; p.tag.material.map = dotsT; p.tag.scale.set(1.0, 0.5, 1); p.tag.material.needsUpdate = true; } }
        p.tag.position.y = p.y + 2.9 + Math.sin(t * 3) * 0.08;
        if (d < NEAR && !(p.ph === 'look' && p.cool > 1.5)) { p.prog += dt / LISTEN; if (p.prog >= 1) { p.heard = true; p.m.visible = false; p.tag.material.map = okT; p.tag.scale.set(0.5, 0.75, 1); p.tag.material.needsUpdate = true; addGold(5); ding(); toast('RUMOUR \u00b7 ' + p.txt, 3.4); J.got = (J.got || []).concat(p.txt); } } }
      const left = J.pairs.filter(p => !p.heard); if (!left.length) { ARW.style.display = 'none'; const sec = (performance.now() - J.t0) / 1000; if (sec < HUNTT) addGold(10); save.setStat('mbzRumours', [...(J.got || []), ...(save.stat('mbzRumours', null) || [])].slice(0, 6)); bump(2400); finishGame(); return; }
      const nearOne = left.find(p => Math.hypot(P.x - p.x, P.z - p.z) < NEAR);
      if (nearOne) arrowTo(V(nearOne.x, nearOne.y + 3.6, nearOne.z), nearOne.ph === 'look' ? 'FREEZE!' : 'LISTENING \u00b7 ' + Math.round(nearOne.prog * 100) + '%'); else if (best) arrowTo(V(best.x, best.y + 2.4, best.z), 'GOSSIP \u00b7 ' + Math.round(bd) + ' M'); },
    card() { const sec = Math.floor((performance.now() - J.t0) / 1000), n = J.pairs.filter(p => p.heard).length; return { key: 'r' + n + '|' + sec, right: Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), stop: true, next: 'GET CLOSE \u00b7 STAND STILL ON \u25c9',
      body: steps(J.pairs.map((p, i) => ['GOSSIP ' + (i + 1), p.heard])) + tipH('REPORTER', disguised() ? 'Nice disguise. They will not see you from far.' : 'When the red eye shows, stop moving.') }; } };
  // ---------- 2 PAPARAZZI SNAP (walk the town): find the celebrity, wait for the pose, snap from 5-16 m ----------
  const CELEBS = [{ n: 'LUNA LACE', r: 'POP STAR', torso: [PINK, '#f3f2f2', '#8a2a5a'], outfit: 'dress' }, { n: 'STERLING GLOSS', r: 'MERU TV', torso: ['#f3f2f2', '#2e4a6b', '#16263c'], outfit: 'suit' }, { n: 'CAPTAIN CORAL', r: 'YACHT OWNER', torso: ['#f3f2f2', '#2e86b8', '#1d2a33'], outfit: 'coat' }];
  const SHOTS = 3, PAPAT = 120;
  GD.papa = { errand: true,
    begin() { const o = doorOut(); if (!o) { stop(); return; } const n = save.stat('mbzPapaN', 0); save.setStat('mbzPapaN', n + 1); J.C = CELEBS[n % CELEBS.length];
      const all = sidewalkSpots(o[0], o[1], 30, 90); let s = all.length ? all[Math.floor(Math.random() * all.length)] : null; if (!s) { const [x, z] = OUTW(-10, 36); s = [x, z, 0, 1, 1, 0]; }
      const [x, z, , , tx, tz] = s; let A = [x - tx * 12, z - tz * 12], B = [x + tx * 12, z + tz * 12]; if (!freeAt(...A)) A = [x, z]; if (!freeAt(...B)) B = [x, z]; J.route = [A, B]; J.ri = 1;
      const c = kit.makeFox({ key: 'buzzCeleb', name: J.C.n, torso: J.C.torso, outfit: J.C.outfit, mood: 'happy' }); c.position.set(A[0], terrainAt(A[0], A[1]) || 0, A[1]); c.userData.noCull = true; scene.add(c); J.objs.push(c); J.c = c; shadesOn(c);
      const gd = kit.makeFox({ key: 'buzzGuard', name: 'Bodyguard', torso: ['#201e1d', '#3d3b3a', '#111111'], outfit: 'suit', mood: 'neutral' }); gd.position.copy(c.position).add(V(0, 0, -1.6)); gd.userData.noCull = true; scene.add(gd); J.objs.push(gd); J.gd = gd; shadesOn(gd);
      J.m = marker(c.position.x, c.position.y, c.position.z); J.objs.push(J.m); J.star = sprite(tagT('\u2605', YEL, INK), 0.5, 0.75); scene.add(J.star); J.objs.push(J.star);
      J.ph = 'walk'; J.pt = 5; J.shots = 0; J.cool = 0; J.posed = false; J.t0 = performance.now(); fitSnap(); fade(() => { go(o[0], 0.6, o[1], o[2]); }); },
    snap() { if (!J || J.g !== 'papa' || J.cool > 0 || !lastP) return; const c = J.c, d = Math.hypot(lastP.x - c.position.x, lastP.z - c.position.z); flash(); shutter(); J.cool = 0.6; J.idle = 0;
      if (d < 5) { missOne('NO PHOTOS! TOO CLOSE \u00b7 BACK OFF', 2); J.gd.userData.push = 1.2; J.cool = 2; return; } if (d > 16) { toast('TOO FAR \u00b7 GET CLOSER', 1.4); return; }
      if (J.ph !== 'pose' || J.posed) { toast(J.posed ? 'GOT THAT POSE \u00b7 WAIT FOR THE NEXT' : 'WAIT FOR THE POSE \u00b7 \u2605', 1.4); return; }
      J.posed = true; J.shots++; addGold(5); ding(); toast('GREAT SHOT \u00b7 ' + J.shots + ' / ' + SHOTS, 1.6); bump(900);
      if (J.shots >= SHOTS) { const sec = (performance.now() - J.t0) / 1000; if (sec < PAPAT) addGold(10); SNAP.style.display = 'none'; ARW.style.display = 'none'; setTimeout(() => { if (J && J.g === 'papa') { toast('FRONT PAGE! \u00b7 BACK TO THE OFFICE', 1.6); finishGame(); } }, 900); } },
    tick(dt, t) { const P = lastP, c = J.c, gd = J.gd; if (!P) return; J.cool -= dt; J.idle = (J.idle || 0) + dt; J.pt -= dt; const d = Math.hypot(P.x - c.position.x, P.z - c.position.z), far = d > 70;
      if (J.ph === 'walk') { const [tx, tz] = J.route[J.ri], dx = tx - c.position.x, dz = tz - c.position.z, dd = Math.hypot(dx, dz); if (dd < 0.3) J.ri = 1 - J.ri; else { const s = Math.min(dd, dt * 1.4); c.position.x += dx / dd * s; c.position.z += dz / dd * s; c.position.y = terrainAt(c.position.x, c.position.z) || c.position.y; turnTo(c, Math.atan2(dx, dz), dt, 6); }
        if (!far) kit.animFox(c, dt, 1.4); armUp(c, 1, 0.2); if (J.pt <= 0) { J.ph = 'pose'; J.pt = 3; J.posed = false; tone(1320, 0.03, 0.2, 'triangle'); } }
      else { if (d < 25) turnTo(c, Math.atan2(P.x - c.position.x, P.z - c.position.z), dt, 5); if (!far) kit.animFox(c, dt, 0, false); armUp(c, 1, 2.4 + Math.sin(t * 10) * 0.3); if (J.pt <= 0) { J.ph = 'walk'; J.pt = rnd(5, 7); } }
      const gx = c.position.x - Math.sin(c.rotation.y) * 1.6, gz = c.position.z - Math.cos(c.rotation.y) * 1.6; let wx = gx, wz = gz; if (gd.userData.push > 0) { gd.userData.push -= dt; wx = c.position.x + (P.x - c.position.x) / Math.max(d, 0.1) * 1.4; wz = c.position.z + (P.z - c.position.z) / Math.max(d, 0.1) * 1.4; armUp(gd, 0, -1.6, -1.4); }
      const gdx = wx - gd.position.x, gdz = wz - gd.position.z, gl = Math.hypot(gdx, gdz); if (gl > 0.2) { const s = Math.min(gl, dt * 3); gd.position.x += gdx / gl * s; gd.position.z += gdz / gl * s; gd.position.y = terrainAt(gd.position.x, gd.position.z) || gd.position.y; } turnTo(gd, Math.atan2(P.x - gd.position.x, P.z - gd.position.z), dt, 3); if (!far) kit.animFox(gd, dt, gl > 0.2 ? 2 : 0, false);
      J.m.position.copy(c.position); J.m.visible = d > 18; J.star.visible = J.ph === 'pose' && !J.posed; J.star.position.copy(c.position).add(V(0, 2.9 + Math.sin(t * 6) * 0.1, 0));
      const good = J.ph === 'pose' && !J.posed && d >= 5 && d <= 16; SNAP.style.display = d < 30 && J.shots < SHOTS ? 'block' : 'none'; SNAP.style.background = good ? '#ec3013' : '#5a5550';
      if (good && J.idle > 1.2 && !J.hinted) { J.hinted = true; pulse(SNAP); } if (!good) J.hinted = false;
      if (J.shots < SHOTS) arrowTo(V(c.position.x, c.position.y + 3.4, c.position.z), good ? 'SNAP NOW!' : d < 5 ? 'TOO CLOSE \u00b7 BACK OFF' : d <= 16 ? 'WAIT FOR THE \u2605 POSE' : J.C.n + ' \u00b7 ' + Math.round(d) + ' M'); },
    card() { const sec = Math.floor((performance.now() - J.t0) / 1000); return { key: 'p' + J.shots + '|' + sec, right: Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'), stop: true, next: (touch ? 'TAP SNAP' : 'SNAP \u00b7 E OR THE BUTTON') + ' ON THE \u2605',
      body: '<div style="font-size:13px;font-weight:900;margin-top:6px">' + J.C.n + ' \u00b7 ' + J.C.r + '</div>' + steps([1, 2, 3].map(i => ['SHOT ' + i, J.shots >= i])) + tipH('REPORTER', '5 to 16 metres. Closer and the bodyguard gets grumpy.') }; } };
  // ---------- 3 HEADLINE WRITER (panel): pick the silliest TRUE headline ----------
  const STORIES = [['A goose crossed Castle Road. Traffic waited ten minutes.', 'GOOSE HOLDS UP THE WHOLE TOWN FOR TEN MINUTES! HONK!', 'BIRD CROSSES ROAD', 'GIANT GOOSE EATS A BUS!'],
    ['Gears built a model plane. It flew straight into the fountain.', 'MODEL PLANE MAKES A SPLASH-LANDING IN THE FOUNTAIN!', 'MODEL PLANE FLIGHT ENDS', 'GEARS FLIES TO THE MOON IN A TOY PLANE!'],
    ['Sizzle made a burger as tall as a chair.', 'MEGA BURGER! SIZZLE STACKS ONE AS TALL AS A CHAIR!', 'LARGE BURGER MADE', 'BURGER SO BIG IT GETS ITS OWN HOUSE!'],
    ['The ferry was late. A duck was sitting on the rope.', 'DUCK HOLDS UP THE FERRY! (IT SAT ON THE ROPE)', 'FERRY RUNS LATE', 'DUCK STEERS THE FERRY TO THE ISLAND!'],
    ['The Spire lift got stuck for an hour. Everyone inside sang.', 'STUCK IN THE SPIRE LIFT, FOXES START A CHOIR!', 'LIFT REPAIRED AFTER DELAY', 'SPIRE LIFT SHOOTS INTO SPACE!'],
    ['Bolt washed every car at his station. Then it rained.', 'BOLT WASHES EVERY CAR. THE SKY SAYS: NOT TODAY!', 'CARS WASHED AT GAS STATION', 'BOLT\u2019S CARS MELT IN THE RAIN!'],
    ['A cat climbed the clock tower. It came down for a fish.', 'CAT CLIMBS CLOCK TOWER, DEMANDS FISH, GETS FISH!', 'CAT COMES DOWN FROM TOWER', 'CAT ELECTED MAYOR OF MERU!'],
    ['At Meru Lanes all ten pins fell at once.', 'TEN PINS GO ON STRIKE AT MERU LANES!', 'BOWLER KNOCKS DOWN PINS', 'BOWLING BALL ROLLS ALL THE WAY TO THE LAKE!']];
  const HLT = 12, HLN = 6;
  GD.headline = { panel: true, shot: () => [toW(-2.2, 1.4, -6.2), 3.2, 2.4, 0.15, 3.2, 0.3, 6],
    begin() { goRoom(-2.2, -6.2, Math.PI); J.list = pickN(STORIES, HLN).map(s => ({ s: s[0], ok: s[1], opts: shuffle([[s[1], 'ok'], [s[2], 'dull'], [s[3], 'lie']]) })); J.ci = 0; J.cueT = HLT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('HEADLINE WRITER \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, J.gold ? J.gold + ' G' : 'MERU BUZZ') + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">'
        + (c ? '<div style="border:2px solid #201e1d;padding:6px 10px"><div style="font-size:11px;font-weight:900;color:#ec3013">WHAT REALLY HAPPENED</div><div style="font-size:18px;font-weight:900;line-height:1.2;text-wrap:pretty">' + c.s + '</div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div>'
          + c.opts.map((o, i) => '<button data-i="' + i + '" style="' + BTN + ';flex:none;font-size:16px;text-wrap:balance">' + o[0] + '</button>').join('') : '<div style="font-size:22px;font-weight:900">ALL HEADLINES WRITTEN</div>')
        + '</div>' + tipBar('SILLY AND TRUE \u00b7 NOT BORING, NOT MADE UP'));
      PANEL.querySelectorAll('[data-i]').forEach(b => { b.onclick = () => this.pick(+b.dataset.i, b); }); J.idle = 0; J.hinted = false; },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; const k = c.opts[i][1]; if (k !== 'ok') { missOne(k === 'dull' ? 'TRUE, BUT YAWN \u00b7 NOBODY CLICKS' : 'TOO SILLY \u00b7 THAT NEVER HAPPENED'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; }
      addGold(4); blip(); bump(300); el.style.background = '#201e1d'; el.style.color = '#ffd23a'; J.wait = 0.8; setTimeout(() => this.next(), 700); },
    next() { if (!J || J.g !== 'headline') return; J.ci++; J.cueT = HLT; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); save.setStat('mbzHead', J.list[J.list.length - 1].ok); this.draw(); setTimeout(finishGame, 800); return; } this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / HLT, J.cueT < 3); if (J.cueT <= 0) { missOne('DEADLINE! THE PAGE WENT OUT BLANK'); this.next(); } }
      if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const c = J.list[J.ci]; pulse(PANEL.querySelector('[data-i="' + c.opts.findIndex(o => o[1] === 'ok') + '"]')); } kit.animFox(rep, dt, 0, false); } };
  // ---------- 4 FACT CHECK (panel): every rumour has one lie; the fact sheet catches it ----------
  const FACTS = ['THE SPIRE IS 200 M TALL', 'MERU RADIO IS 98.8 FM', 'THE FERRY GOES TO GARDEN ISLAND', 'SIZZLE RUNS THE BURGER GRILL', 'BOLT RUNS THE GAS STATION', 'STERLING GLOSS READS THE MERU TV NEWS', 'GEARS RUNS THE HOBBY SHOP'];
  const FCHK = [[['Sterling Gloss jogged up the Spire today.', 'All 400 metres of it.', 'Then he read the news, not even sweaty.'], 1], [['A fan rang Meru Radio this morning.', 'She tuned to 77.7 FM to do it.', 'She asked for Space Horse.'], 1],
    [['The ferry carried a piano today.', 'It sailed all the way to the Town Dump.', 'The piano got seasick.'], 1], [['Bolt sold a toy car to a duck.', 'The duck paid in bread.', 'Bolt was busy, so Gears ran the gas station.'], 2],
    [['Sizzle dropped a burger.', 'Gears caught it with a model crane.', 'Sizzle runs the bakery, so he baked a new one.'], 2], [['Gears fixed a robot dog.', 'It now fetches screws.', 'Bolt read the story on the Meru TV news.'], 2],
    [['The Spire is 200 metres tall.', 'Today a kite reached the top.', 'Sizzle\u2019s hobby shop sold the kite.'], 2]];
  const FCT = 14, FCN = 5;
  GD.fact = { panel: true, shot: () => [toW(2.2, 1.4, -6.2), 3.2, 2.4, 0.15, 3.2, -0.3, 6],
    begin() { goRoom(2.2, -6.2, Math.PI); J.list = pickN(FCHK, FCN); J.ci = 0; J.cueT = FCT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci], wide = innerWidth > innerHeight * 1.1;
      const sheet = '<div style="flex:' + (wide ? '0 0 38%' : 'none') + ';min-width:0;' + (wide ? 'overflow:auto;' : '') + 'border:2px solid #201e1d;background:#fffdf3;padding:6px 10px"><div style="font-size:11px;font-weight:900;color:#3f9a5e">FACT SHEET</div>' + FACTS.map(f => '<div style="font-size:13px;font-weight:800;line-height:1.35;border-bottom:1px dashed #cfcac3">' + f + '</div>').join('') + '</div>';
      showPanel(panelHead('FACT CHECK \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, J.gold ? J.gold + ' G' : 'MERU BUZZ') + '<div style="flex:1;min-height:0;display:flex;flex-direction:' + (wide ? 'row' : 'column') + ';gap:10px;padding:10px;box-sizing:border-box;overflow:auto">' + sheet
        + '<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px">' + (c ? '<div style="font-size:11px;font-weight:900;color:#ec3013">THE RUMOUR \u00b7 TAP THE LIE</div><div data-time style="height:8px;background:#201e1d;width:100%"></div>' + c[0].map((s, i) => '<button data-i="' + i + '" style="' + BTN + ';flex:none;font-size:16px;font-weight:800;text-wrap:pretty">' + s + '</button>').join('') : '<div style="font-size:22px;font-weight:900">ALL CHECKED</div>') + '</div></div>' + tipBar('ONE SENTENCE BREAKS THE FACT SHEET'));
      PANEL.querySelectorAll('[data-i]').forEach(b => { b.onclick = () => this.pick(+b.dataset.i, b); }); J.idle = 0; J.hinted = false; },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (i !== c[1]) { missOne('THAT PART IS TRUE \u00b7 CHECK THE SHEET'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; }
      addGold(4); ding(); el.style.background = '#ec3013'; el.style.color = '#fff'; el.style.textDecoration = 'line-through'; J.wait = 0.9; setTimeout(() => this.next(), 800); },
    next() { if (!J || J.g !== 'fact') return; J.ci++; J.cueT = FCT; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / FCT, J.cueT < 3); if (J.cueT <= 0) { missOne('TOO SLOW \u00b7 THE RUMOUR WENT ONLINE'); this.next(); } }
      if (J.idle > 4 && !J.hinted && J.ci < J.list.length) { J.hinted = true; pulse(PANEL.querySelector('[data-i="' + J.list[J.ci][1] + '"]')); } kit.animFox(rep, dt, 0, false); } };
  // ---------- 5 BLURRY PHOTO (panel): ENHANCE, then say what is really in the picture ----------
  const SCN = [{ claim: 'LAKE MONSTER?', a: 'A DUCK', opts: ['A DUCK', 'A LAKE MONSTER', 'A FLOATING BOOT'], d(g, W, H) { g.fillStyle = '#9fd3f5'; g.fillRect(0, 0, W, H); g.fillStyle = '#2e86b8'; g.fillRect(0, H * 0.55, W, H); g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(W * 0.5, H * 0.56, 48, 24, 0, 0, 7); g.fill(); g.beginPath(); g.arc(W * 0.62, H * 0.38, 18, 0, 7); g.fill(); g.fillStyle = '#e07a1f'; g.fillRect(W * 0.66, H * 0.37, 20, 8); g.fillStyle = INK; g.beginPath(); g.arc(W * 0.64, H * 0.35, 3, 0, 7); g.fill(); g.fillStyle = 'rgba(255,210,58,0.4)'; g.beginPath(); g.ellipse(W * 0.5, H * 0.7, 48, 10, 0, 0, 7); g.fill(); } },
    { claim: 'GHOST AT THE CASTLE?', a: 'SHEETS ON A LINE', opts: ['SHEETS ON A LINE', 'A GHOST', 'A SNOW FOX'], d(g, W, H) { g.fillStyle = '#5a6168'; g.fillRect(0, 0, W, H); g.fillStyle = '#7a8088'; for (let y = 0; y < H; y += 26) for (let x = (y / 26 % 2) * 20; x < W; x += 40) g.fillRect(x, y, 38, 24); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 50); g.lineTo(W, 56); g.stroke(); g.fillStyle = '#fff'; for (const x of [80, 190]) { g.beginPath(); g.moveTo(x, 52); g.lineTo(x + 70, 54); g.lineTo(x + 70, 150); for (let k = 0; k < 5; k++) g.lineTo(x + 70 - k * 14 - 7, 140 + (k % 2) * 12); g.lineTo(x, 150); g.fill(); } } },
    { claim: 'UFO OVER THE SPIRE?', a: 'A FRISBEE', opts: ['A FRISBEE', 'A UFO', 'A FLYING PIZZA'], d(g, W, H) { g.fillStyle = '#7cc4ff'; g.fillRect(0, 0, W, H); g.fillStyle = '#9aa0a6'; g.fillRect(W * 0.7, 30, 30, H); g.beginPath(); g.moveTo(W * 0.7, 30); g.lineTo(W * 0.7 + 15, 0); g.lineTo(W * 0.7 + 30, 30); g.fill(); g.fillStyle = RED; g.beginPath(); g.ellipse(W * 0.35, H * 0.4, 46, 12, -0.15, 0, 7); g.fill(); g.fillStyle = '#ff8a6a'; g.beginPath(); g.ellipse(W * 0.35, H * 0.38, 26, 5, -0.15, 0, 7); g.fill(); } },
    { claim: 'ROBOT IN THE PARK?', a: 'A BIN WITH A LID', opts: ['A BIN WITH A LID', 'A ROBOT', 'A TIN KNIGHT'], d(g, W, H) { g.fillStyle = '#9fd3f5'; g.fillRect(0, 0, W, H * 0.5); g.fillStyle = '#4f7d3a'; g.fillRect(0, H * 0.5, W, H); g.fillStyle = '#9aa0a6'; g.fillRect(W * 0.42, H * 0.3, 56, 80); g.fillStyle = '#7a8088'; g.fillRect(W * 0.4, H * 0.26, 66, 12); g.fillRect(W * 0.48, H * 0.2, 18, 8); g.fillStyle = INK; for (let k = 0; k < 3; k++) g.fillRect(W * 0.44 + k * 18, H * 0.4, 6, 50); } },
    { claim: 'FIRE AT THE BAKERY?', a: 'STEAM FROM A PIE', opts: ['STEAM FROM A PIE', 'A FIRE', 'A RAIN CLOUD INDOORS'], d(g, W, H) { g.fillStyle = '#e8dcc4'; g.fillRect(0, 0, W, H); g.fillStyle = WOOD; g.fillRect(0, H * 0.7, W, H); g.fillStyle = '#c97a3a'; g.beginPath(); g.ellipse(W * 0.5, H * 0.68, 60, 18, 0, 0, 7); g.fill(); g.fillStyle = '#e0a860'; g.beginPath(); g.ellipse(W * 0.5, H * 0.64, 54, 12, 0, 0, 7); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 6; for (const x of [-20, 0, 20]) { g.beginPath(); g.moveTo(W * 0.5 + x, H * 0.55); g.bezierCurveTo(W * 0.5 + x - 14, H * 0.42, W * 0.5 + x + 14, H * 0.32, W * 0.5 + x, H * 0.18); g.stroke(); } } }];
  const RES = [12, 22, 44, 320], BLT = 16;
  const blurDraw = (cv, sc, lv) => { const W = cv.width, H = cv.height, s = document.createElement('canvas'), w = RES[lv], h = Math.max(4, Math.round(w * H / W)); s.width = W; s.height = H; sc.d(s.getContext('2d'), W, H); const q = document.createElement('canvas'); q.width = w; q.height = h; const qq = q.getContext('2d'); qq.drawImage(s, 0, 0, w, h); const g = cv.getContext('2d'); g.imageSmoothingEnabled = lv >= 2; g.clearRect(0, 0, W, H); g.drawImage(q, 0, 0, W, H); };
  GD.blurry = { panel: true, shot: () => [toW(-6.0, 1.5, -7.6), 3.2, 2.4, 0.15, 3.2, 0.3, 6],
    begin() { goRoom(-6.0, -7.2, Math.PI); J.list = shuffle(SCN).map(sc => ({ sc, opts: shuffle(sc.opts.slice()) })); J.ci = 0; J.lv = 0; J.cueT = BLT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      const row = innerWidth > innerHeight * 1.1 && innerHeight < 640;
      showPanel(panelHead('BLURRY PHOTO \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, J.gold ? J.gold + ' G' : 'MERU BUZZ') + '<div style="flex:1;min-height:0;display:' + (row && c ? 'grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);align-content:start' : 'flex;flex-direction:column') + ';gap:8px;padding:10px;box-sizing:border-box;overflow:auto">'
        + (c ? '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap' + (row ? ';grid-column:2' : '') + '"><div><div style="font-size:11px;font-weight:900;color:#ec3013">A READER SAYS</div><div style="font-size:20px;font-weight:900">' + c.sc.claim + '</div></div><button data-enh style="' + BTN + ';flex:none;min-height:48px;background:#201e1d;color:#ffd23a">ENHANCE</button></div>'
          + (row ? '<div style="grid-column:1;grid-row:1 / span 3;display:flex;flex-direction:column;gap:6px;min-width:0">' : '') + '<canvas data-cv width="320" height="180" style="display:block;width:100%;max-height:' + (row ? 'calc(100vh - 150px)' : '34vh') + ';object-fit:contain;border:2px solid #201e1d;background:#201e1d;image-rendering:pixelated"></canvas><div data-time style="height:8px;background:#201e1d;width:100%"></div>' + (row ? '</div>' : '')
          + '<div style="display:grid;grid-template-columns:' + (row ? 'minmax(0,1fr);grid-column:2' : 'repeat(3,minmax(0,1fr))') + ';gap:8px">' + c.opts.map(o => '<button data-o="' + o + '" style="' + BTN + ';font-size:14px">' + o + '</button>').join('') + '</div>' : '<div style="font-size:22px;font-weight:900">ALL PHOTOS CHECKED</div>')
        + '</div>' + tipBar('ENHANCE IF YOU NEED TO \u00b7 FEWER = MORE GOLD'));
      if (c) { blurDraw(PANEL.querySelector('[data-cv]'), c.sc, J.lv); PANEL.querySelector('[data-enh]').onclick = () => this.enh(); PANEL.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => this.pick(b.dataset.o, b); }); } J.idle = 0; J.hinted = false; },
    enh() { const c = J.list[J.ci]; if (!c || J.lv >= RES.length - 1) return; J.lv++; J.idle = 0; tone(440 + J.lv * 220, 0.04, 0.2, 'square'); tone(660 + J.lv * 220, 0.03, 0.2, 'square', 0.08); blurDraw(PANEL.querySelector('[data-cv]'), c.sc, J.lv); if (J.lv >= RES.length - 1) { const b = PANEL.querySelector('[data-enh]'); if (b) { b.disabled = true; b.style.opacity = '0.4'; } } },
    pick(o, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (o !== c.sc.a) { missOne('NOT QUITE \u00b7 ENHANCE AND LOOK AGAIN'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; }
      addGold(2 + (RES.length - 1 - J.lv) * 2); ding(); el.style.background = '#201e1d'; el.style.color = '#ffd23a'; J.lv = RES.length - 1; blurDraw(PANEL.querySelector('[data-cv]'), c.sc, J.lv); J.wait = 1.3; setTimeout(() => this.next(), 1200); },
    next() { if (!J || J.g !== 'blurry') return; J.ci++; J.lv = 0; J.cueT = BLT; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / BLT, J.cueT < 4); if (J.cueT <= 0) { missOne('TOO SLOW \u00b7 NEXT PHOTO'); this.next(); } }
      if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; pulse(PANEL.querySelector(J.lv < RES.length - 1 ? '[data-enh]' : '[data-o="' + J.list[J.ci].sc.a + '"]')); } kit.animFox(intern, dt, 0, false); } };
  // ---------- 6 GOSSIP PHONE LINE (panel): real tip or prank call? ----------
  const CALLS = [['Psst. Old Salt bought a new hat. Very tall. Very shiny.', 1], ['Sterling Gloss uses two combs. One for each side.', 1], ['The Weather Fox said sun. It rained. She blamed a cloud.', 1], ['The DJ hums in the lift. Always song four.', 1],
    ['Chief Ember polishes the fire pole every morning. Twice.', 1], ['Gears glued his own paw to a model boat.', 1], ['A goose moved into the bank fountain.', 1], ['The tailor sewed a coat for a dog.', 1],
    ['The Spire fell over. Then it got back up.', 0], ['The moon is made of cheese. I licked it.', 0], ['Hello, I am the Mayor. Also I am a toaster.', 0], ['The lake drank itself. All of it. Gone.', 0], ['Robots are secretly big penguins.', 0], ['BEEP. IS THIS THE PIZZA SHOP. BEEP.', 0]];
  const PHT = 9;
  GD.phone = { panel: true, shot: () => [toW(-8.4, 1.4, 0.8), 3.0, 2.4, 0.15, 3.0, Math.PI / 2 + 0.3, 6],
    begin() { goRoom(-8.0, 0.8, -Math.PI / 2); J.list = shuffle([...pickN(CALLS.filter(c => c[1]), 5), ...pickN(CALLS.filter(c => !c[1]), 3)]); J.ci = 0; J.cueT = PHT; J.wait = 0.5; snapK = true; ringRing(); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('GOSSIP PHONE LINE \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, J.gold ? J.gold + ' G' : 'MERU BUZZ') + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:10px;padding:10px;box-sizing:border-box;overflow:auto">'
        + (c ? '<div style="border:2px solid #201e1d;padding:8px 10px;background:#fff"><div style="font-size:11px;font-weight:900;color:#ec3013">CALLER ' + (J.ci + 1) + ' WHISPERS</div><div style="font-size:21px;font-weight:900;line-height:1.2;text-wrap:pretty">\u201c' + c[0] + '\u201d</div><div data-time style="height:8px;background:#201e1d;margin-top:8px;width:100%"></div></div>'
          + '<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px"><button data-a="1" style="' + BTN + ';min-height:72px;font-size:20px;background:#3f9a5e;color:#fff">REAL TIP</button><button data-a="0" style="' + BTN + ';min-height:72px;font-size:20px;background:#201e1d;color:#ffd23a">PRANK</button></div>' : '<div style="font-size:22px;font-weight:900">LINES QUIET</div>')
        + '</div>' + tipBar('COULD IT REALLY HAPPEN? THEN IT IS A TIP'));
      PANEL.querySelectorAll('[data-a]').forEach(b => { b.onclick = () => this.pick(+b.dataset.a, b); }); J.idle = 0; J.hinted = false; },
    pick(a, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (a !== c[1]) { missOne(c[1] ? 'THAT ONE WAS TRUE \u00b7 A REAL TIP' : 'PRANKED! THAT COULD NEVER HAPPEN'); shake(el); } else { addGold(3); blip(); if (c[1]) bump(200); el.style.outline = '4px solid #ffd23a'; } J.wait = 0.8; setTimeout(() => this.next(), 700); },
    next() { if (!J || J.g !== 'phone') return; J.ci++; J.cueT = PHT; J.wait = 0.4; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } ringRing(); this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / PHT, J.cueT < 3); if (J.cueT <= 0) { missOne('THE CALLER HUNG UP'); this.next(); } }
      if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; pulse(PANEL.querySelector('[data-a="' + J.list[J.ci][1] + '"]')); } kit.animFox(intern, dt, 0, false); } };
  // ---------- 7 CLICKBAIT (panel): FACE + BIG WORDS + RED ARROW = the most clicks ----------
  const CBS = [['THE GOOSE ON CASTLE ROAD', 'HONK?!'], ['THE MEGA BURGER', 'HOW BIG?!'], ['THE SINGING LIFT', 'LA LA LIFT!'], ['THE CAT ON THE CLOCK', 'MEOW?!'], ['THE DUCK ON THE ROPE', 'QUACK!'], ['THE FROG IN THE FOUNTAIN', 'RIBBIT!'], ['TEN PINS ON STRIKE', 'NO WAY!']];
  const FACE = '<svg viewBox="0 0 40 40" style="position:absolute;left:6%;bottom:8%;width:38%;height:auto" aria-hidden="true"><polygon points="6,16 12,2 18,14" fill="#e07a1f"/><polygon points="22,14 28,2 34,16" fill="#e07a1f"/><circle cx="20" cy="22" r="14" fill="#e07a1f"/><ellipse cx="20" cy="28" rx="8" ry="6" fill="#fff"/><circle cx="14" cy="20" r="3" fill="#201e1d"/><circle cx="26" cy="20" r="3" fill="#201e1d"/><ellipse cx="20" cy="30" rx="3" ry="4" fill="#201e1d"/></svg>';
  const ARR = '<svg viewBox="0 0 40 40" style="position:absolute;right:5%;bottom:8%;width:24%;height:auto" aria-hidden="true"><polygon points="4,16 24,16 24,6 38,22 24,38 24,28 4,28" fill="#ec3013" stroke="#201e1d" stroke-width="2"/></svg>';
  const thumbH = (st, f) => '<div style="position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;container-type:inline-size;background:' + (f.big ? '#ffd23a' : '#d9d4cc') + ';border:2px solid #201e1d;box-sizing:border-box">' + (f.face ? FACE : '') + (f.arrow ? ARR : '')
    + '<div style="position:absolute;left:6%;right:6%;top:' + (f.big ? '8%' : '10%') + ';font:900 ' + (f.big ? 'clamp(13px,15cqw,30px)' : 'clamp(9px,7cqw,14px)') + ' Archivo,sans-serif;line-height:1;color:#201e1d;text-align:left' + (f.face ? ';left:46%' : '') + '">' + (f.big ? st[1] : st[0]) + '</div></div>';
  const CBT = 12, CBN = 6;
  GD.click = { panel: true, shot: () => [toW(6.0, 1.5, -7.6), 3.2, 2.4, 0.15, 3.2, -0.3, 6],
    begin() { goRoom(6.0, -7.2, Math.PI); const subs = [{ face: 1 }, { big: 1 }, { arrow: 1 }, { face: 1, big: 1 }, { face: 1, arrow: 1 }, { big: 1, arrow: 1 }, {}];
      J.list = pickN(CBS, CBN).map(st => ({ st, opts: shuffle([{ face: 1, big: 1, arrow: 1, win: 1 }, ...pickN(subs, 2)]) })); J.ci = 0; J.cueT = CBT; J.wait = 0.4; J.cl = 0; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('CLICKBAIT \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, (J.cl ? J.cl.toLocaleString('en-GB') + ' CLICKS' : 'MERU BUZZ')) + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">'
        + (c ? '<div style="border:2px solid #201e1d;padding:6px 10px"><div style="font-size:11px;font-weight:900;color:#ec3013">TODAY\u2019S STORY</div><div style="font-size:20px;font-weight:900">' + c.st[0] + '</div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div>'
          + (() => { const col = innerWidth < 520 && innerHeight > innerWidth; return '<div style="display:grid;grid-template-columns:' + (col ? 'minmax(0,1fr)' : 'repeat(3,minmax(0,1fr))') + ';gap:8px">' + c.opts.map((o, i) => '<button data-i="' + i + '" style="' + BTN + ';padding:4px;display:flex;flex-direction:' + (col ? 'row;align-items:center' : 'column') + ';gap:' + (col ? '10px' : '4px') + '">' + (col ? '<div style="flex:0 0 64%;min-width:0">' + thumbH(c.st, o) + '</div>' : thumbH(c.st, o)) + '<span style="font-size:' + (col ? '14px' : '11px') + '">THUMB ' + (i + 1) + '</span></button>').join(''); })() + '</div>' : '<div style="font-size:22px;font-weight:900">ALL POSTED</div>')
        + '<div data-live style="font-size:13px;font-weight:900;color:#5a5550">LIVE CLICKS TODAY \u00b7 ' + clicks().toLocaleString('en-GB') + '</div></div>' + tipBar('FACE + BIG WORDS + RED ARROW'));
      PANEL.querySelectorAll('[data-i]').forEach(b => { b.onclick = () => this.pick(+b.dataset.i, b); }); J.idle = 0; J.hinted = false; },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; const o = c.opts[i]; if (!o.win) { const n = 4 + Math.floor(Math.random() * 20); J.cl += n; bump(n); missOne('ONLY ' + n + ' CLICKS \u00b7 NEEDS FACE, BIG WORDS, ARROW'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; }
      const n = 1200 + Math.floor(Math.random() * 900); J.cl += n; bump(n); addGold(4); ding(); for (let k = 0; k < 6; k++) tone(1800 + k * 120, 0.02, 0.05, 'square', k * 0.05); el.style.outline = '4px solid #ffd23a'; J.wait = 0.9; setTimeout(() => this.next(), 800); },
    next() { if (!J || J.g !== 'click') return; J.ci++; J.cueT = CBT; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / CBT, J.cueT < 3); if (J.cueT <= 0) { missOne('TOO SLOW \u00b7 POSTED WITH NO PICTURE'); this.next(); } }
      const lv = PANEL.querySelector('[data-live]'); if (lv) lv.textContent = 'LIVE CLICKS TODAY \u00b7 ' + clicks().toLocaleString('en-GB');
      if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; pulse(PANEL.querySelector('[data-i="' + J.list[J.ci].opts.findIndex(o => o.win) + '"]')); } kit.animFox(intern, dt, 0, false); } };
  // ---------- 8 COMMENTS MOD (panel): delete the rude comments before they post ----------
  const NICE = ['Great story! My gran laughed.', 'The goose is my hero.', 'More cat news, please!', 'I was in that lift. We sang well.', 'Meru Buzz every morning. Love it.', 'Ha! Ten pins on strike!', 'This made my day.', 'Is the mega burger still there? Asking for me.'];
  const RUDE = ['YOUR WEBSITE SMELLS LIKE OLD FISH.', 'BOO! WORST NEWS EVER. YOU STINK.', 'THE WRITER HAS A HEAD LIKE A POTATO.', 'NOBODY READS THIS, DUMMIES.', 'YOU ARE ALL SILLY SAUSAGES. MEAN ONES.', 'UGH. I HATE THIS AND YOU.'];
  const CMN = 14, CMGAP = 1.9, CMLIFE = 7;
  GD.comments = { panel: true, shot: () => [toW(-8.4, 1.4, 5.2), 3.0, 2.4, 0.15, 3.0, Math.PI / 2 - 0.3, 6],
    begin() { goRoom(-8.0, 5.2, -Math.PI / 2); const rude = pickN(RUDE, 5), nice = pickN(NICE, CMN - 5), names = ['KIA', 'OTTO', 'MARLA', 'PELL', 'FLICK', 'NELL', 'GEARS', 'TOMO', 'BEA', 'LUNA', 'MOSS', 'PIP', 'RUBY', 'DUSTY'];
      J.q = shuffle([...rude.map(t => ({ t, rude: 1 })), ...nice.map(t => ({ t, rude: 0 }))]).map((c, i) => ({ ...c, id: i, who: names[i % names.length], age: 0 })); J.feed = []; J.spawnT = 0.6; J.n = 0; J.ok = 0; snapK = true; this.draw(); },
    draw() { showPanel(panelHead('COMMENTS MOD \u00b7 ' + J.n + ' / ' + CMN, J.gold ? J.gold + ' G' : 'MERU BUZZ') + '<div data-feed style="flex:1;min-height:0;' + (innerHeight < 520 ? 'display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-content:start' : 'display:flex;flex-direction:column') + ';gap:6px;padding:' + (innerHeight < 520 ? '8px' : '10px') + ';box-sizing:border-box;overflow:hidden"></div>' + tipBar('TAP A RUDE COMMENT TO DELETE IT \u00b7 LEAVE THE NICE ONES')); this.paint(); J.idle = 0; J.hinted = false; },
    paint() { const box = PANEL.querySelector('[data-feed]'); if (!box) return; const ids = J.feed.map(c => c.id).join(','); if (box.dataset.ids !== ids) { box.dataset.ids = ids;
        box.innerHTML = J.feed.map(c => '<button data-c="' + c.id + '" style="' + BTN + ';min-height:58px;flex:none;display:flex;flex-direction:column;gap:3px;position:relative;overflow:hidden"><span style="font-size:11px;color:#7c4dc4">' + c.who + ' \u00b7 COMMENTED</span><span style="font-size:' + (innerHeight < 520 ? 14 : 15) + 'px;font-weight:800;text-wrap:pretty">' + c.t + '</span><span data-age style="position:absolute;left:0;bottom:0;height:4px;background:#201e1d;width:100%"></span></button>').join('');
        box.querySelectorAll('[data-c]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); this.tap(+b.dataset.c, b); }; }); }
      J.feed.forEach(c => { const b = box.querySelector('[data-c="' + c.id + '"] [data-age]'); if (b) { b.style.width = ((1 - c.age / CMLIFE) * 100).toFixed(1) + '%'; b.style.background = c.age > CMLIFE - 2 ? RED : INK; } }); },
    tap(id, el) { const c = J.feed.find(q => q.id === id); if (!c || c.gone) return; J.idle = 0; if (!c.rude) { missOne('THAT ONE WAS NICE \u00b7 LEAVE IT'); shake(el); c.flag = 1; return; } c.gone = 1; J.feed = J.feed.filter(q => q !== c); addGold(3); noise(0.12, 0.15, 'highpass', 2500); tone(520, 0.04, 0.12, 'square'); this.paint(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; J.spawnT -= dt; if (J.spawnT <= 0 && J.q.length) { J.spawnT = CMGAP; const c = J.q.shift(); J.feed.unshift(c); J.n++; blip(); const h = PANEL.querySelector('span'); if (h) h.textContent = 'COMMENTS MOD \u00b7 ' + J.n + ' / ' + CMN; }
      for (const c of J.feed.slice()) { c.age += dt; if (c.age >= CMLIFE) { J.feed = J.feed.filter(q => q !== c); if (c.rude) missOne('A RUDE ONE GOT POSTED'); else { J.ok++; bump(40); } } }
      this.paint(); const rude = J.feed.find(c => c.rude && c.age > 2.2); if (rude && J.idle > 2.5 && !J.hinted) { J.hinted = true; pulse(PANEL.querySelector('[data-c="' + rude.id + '"]')); } if (!rude) J.hinted = false;
      if (!J.q.length && !J.feed.length && !J.ending) { J.ending = true; addGold(6); setTimeout(finishGame, 400); } kit.animFox(intern, dt, 0, false); } };
  // ================= THE BIG SCOOP (pinboard, after all 8): who sent the bandits? =================
  const CLUES = [['crates', 'BANDIT CRATES CAME IN BY BOAT'], ['boats', 'THE SALT FAMILY OWNS THE BOATS'], ['chips', 'BANDITS PAID IN CASINO CHIPS'], ['casino', 'THE SALTS RUN THE CASINO'], ['taken', 'BANDITS TOOK A SALT BUILDING TOO'], ['war', 'SOMEONE WANTS SALT AND PEPPER AT WAR']];
  const LINKS = [['crates', 'boats'], ['chips', 'casino'], ['taken', 'war']];
  const scoopDone = () => !!save.stat('mbzScoop', false), scoopOpen = () => !!save.stat('mbzAll', false) && !scoopDone();
  let scoop = null;
  function openScoop() { scoop = { sel: null, got: [] }; busy = 'scoop'; drawScoop(); }
  function drawScoop() { const S = scoop; if (!S) return; const wide = innerWidth > innerHeight;
    showPanel(panelHead('THE BIG SCOOP \u00b7 PINBOARD', S.got.length + ' / 3 STRINGS') + '<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(' + (wide ? 3 : 2) + ',minmax(0,1fr));gap:10px;padding:12px;box-sizing:border-box;overflow:auto;background:#b08a5a;align-content:start">'
      + CLUES.map(([k, t]) => { const n = S.got.findIndex(p => p.includes(k)); return '<button data-k="' + k + '" style="' + BTN + ';min-height:84px;position:relative;background:' + (S.sel === k ? '#ffd23a' : '#fffdf3') + ';border-color:' + (n >= 0 ? '#ec3013' : '#201e1d') + ';border-width:' + (n >= 0 ? 4 : 2) + 'px;font-size:15px;padding-top:14px;text-wrap:balance">'
        + '<span style="position:absolute;left:50%;top:-2px;width:14px;height:14px;margin-left:-7px;background:#ec3013;border:2px solid #201e1d;box-sizing:border-box"></span>' + t + (n >= 0 ? '<span style="display:block;margin-top:4px;font-size:11px;color:#ec3013">STRING ' + (n + 1) + '</span>' : '') + '</button>'; }).join('') + '</div>' + tipBar(S.sel ? 'NOW TAP THE CARD THAT GOES WITH IT' : 'TAP TWO CARDS THAT GO TOGETHER'));
    PANEL.querySelector('[data-stop]').onclick = () => { scoop = null; busy = null; hidePanel(); }; PANEL.querySelectorAll('[data-k]').forEach(b => { b.onclick = () => pickClue(b.dataset.k, b); }); }
  function pickClue(k, el) { const S = scoop; if (!S || S.got.some(p => p.includes(k))) return; if (!S.sel) { S.sel = k; blip(); drawScoop(); return; } if (S.sel === k) { S.sel = null; drawScoop(); return; }
    const L2 = LINKS.find(p => p.includes(S.sel) && p.includes(k)); if (!L2) { nope(); shake(el); toast('NO STRING THERE \u00b7 TRY ANOTHER PAIR', 1.6); S.sel = null; drawScoop(); return; }
    S.got.push(L2); S.sel = null; tone(330, 0.05, 0.3, 'sawtooth'); ding(); drawScoop(); if (S.got.length >= LINKS.length) setTimeout(scoopEnd, 700); }
  function scoopEnd() { hidePanel(); scoop = null; save.setStat('mbzScoop', true); save.setStat('storyBanditsSaltHint', true); save.addGold(40); coin(); drawPin(); busy = 'end';
    sayTo(T_RP, [rpLn('Salt boats brought the crates. The bandits got paid in Salt casino chips.'), rpLn('But bandits took a Salt building too. Why rob yourself?'), rpLn('So someone wants Salt blamed. Or Salt wants us to think that.'),
      inLn('Um. Boss? The Salt family owns Meru Buzz.'), rpLn('Then we don\u2019t print it. Yet. Take it to the Ace Reporter at the Meru Daily. Here\u2019s 40 gold.')], () => { busy = null; toast('STORY \u00b7 THE SALT LEAD', 2.6); }); }
  // ================= PRIZES =================
  const DISGUISE = { outfit: 'coat', torso: ['#b89a6a', '#e7dcc4', '#6b5638'], name: 'BUZZ DISGUISE' };
  const GIFT = { disguise: ['Your own DISGUISE! Trench coat, shades, moustache. The Tailor keeps a copy.', 'rp'], spy: ['A SPY CAMERA with a zoom lens. Use it from your bag.', 'in'],
    rumours: ['Your rumours go on the lobby screen now. And the town ticker!', 'rp'], gossip: ['You are famous now. Foxes in town gossip about YOU.', 'rp'], all: ['All eight! The GOLD SCOOP and 60 gold. Now come see my pinboard.', 'rp'] };
  function giveGift() { save.setStat('mbzClears', save.stat('mbzClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('mbzDisguise', false)) { save.setStat('mbzDisguise', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === DISGUISE.name)) save.setStat('tailorOutfits', [...list, DISGUISE]); save.setOutfit(DISGUISE); wear && wear(DISGUISE); return 'disguise'; }
    if (nd >= 2 && !save.stat('mbzSpy', false)) { save.setStat('mbzSpy', true); save.give('spyCamera'); return 'spy'; }
    if (nd >= 3 && !save.stat('mbzTicker', false)) { save.setStat('mbzTicker', true); return 'rumours'; }
    if (nd >= 5 && !save.stat('mbzGossip', false)) { save.setStat('mbzGossip', true); return 'gossip'; }
    if (nd >= GAMES.length && !save.stat('mbzAll', false)) { save.setStat('mbzAll', true); save.give('goldScoop'); save.addGold(60); return 'all'; } return null; }
  let wornP = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const on = disguised(); if (wornP && wornP.on === on && wornP.fox === fox) return; if (wornP && wornP.m) wornP.m.off(); wornP = { on, fox, m: on ? shadesOn(fox, true) : null }; }
  // SPY CAMERA (item): 3 s zoom lens + viewfinder, names the fox in the middle
  const VF = document.createElement('div'); VF.style.cssText = 'position:fixed;inset:0;z-index:28;pointer-events:none;display:none;font-family:Archivo,sans-serif';
  VF.innerHTML = '<div style="position:absolute;inset:14%;border:2px solid rgba(255,255,255,0.9)"></div><div style="position:absolute;left:50%;top:50%;width:40px;height:40px;margin:-20px 0 0 -20px;border:2px solid #ec3013"></div><div data-vf style="position:absolute;left:14%;top:14%;background:#201e1d;color:#ffd23a;font-weight:900;font-size:14px;padding:4px 8px">SPY CAMERA \u00b7 ZOOM \u00d74</div>';
  document.body.appendChild(VF); let zoomT = 0, zoomFov = null;
  function foxesNear(P, r) { const out = [], v = V(); scene.traverse(o => { const u = o.userData; if (!u || !u.P || o === lastFox || !o.visible) return; o.getWorldPosition(v); const d = Math.hypot(v.x - P.x, v.z - P.z); if (d < r && Math.abs(v.y - (P.y || 0)) < 6) out.push({ o, d, x: v.x, y: v.y, z: v.z, n: u.foxName || '' }); }); return out; }
  function useSpy() { if (!lastP || busy) return false; zoomT = 3; VF.style.display = 'block'; shutter(); flash(); setTimeout(() => { if (zoomT <= 0) return; const list = foxesNear(lastP, 80).map(f => { tmp.set(f.x, f.y + 1.6, f.z).project(camera); return { ...f, sd: tmp.z < 1 ? Math.hypot(tmp.x, tmp.y) : 9 }; }).filter(f => f.sd < 0.35).sort((a, b) => a.sd - b.sd)[0];
      const t = VF.querySelector('[data-vf]'); if (t) t.textContent = list ? 'SNAP \u00b7 ' + (list.n || 'A FOX').toUpperCase() + ' \u00b7 ' + Math.round(list.d) + ' M' : 'SNAP \u00b7 NOBODY IN THE MIDDLE'; toast(list ? 'SPY CAMERA \u00b7 ' + (list.n || 'A FOX').toUpperCase() + ', CAUGHT ON CAMERA' : 'SPY CAMERA \u00b7 A LOVELY PHOTO OF NOTHING', 2.4); }, 300); return true; }
  function useItem(id) { if (id === 'spyCamera' && save.count('spyCamera')) return useSpy(); if (id === 'goldScoop' && save.count('goldScoop')) { toast('THE GOLD SCOOP \u00b7 EIGHT FOR EIGHT AT MERU BUZZ', 2.4); return true; } return false; }
  // TOWN TICKER + TOWN GOSSIP (look extras, after prizes 3 + 5)
  let tickT = 80; function townTicker(dt) { if (busy || (!save.stat('mbzTicker', false) && !storyHeadlines(save, 'buzz').length)) return; if ((tickT -= dt) > 0) return; tickT = 150; const r = save.stat('mbzRumours', null) || [], h = save.stat('mbzHead', null), lines = [...r.map(x => 'RUMOUR \u00b7 ' + x), ...(h ? ['TODAY \u00b7 ' + h] : []), ...storyHeadlines(save, 'buzz').map(x => 'EXCLUSIVE \u00b7 ' + x)]; if (lines.length) toast('\u25cf MERU BUZZ \u00b7 ' + lines[Math.floor(Math.random() * lines.length)], 3.6); }
  const GOSS = ['PSST. IS THAT THE BUZZ REPORTER?', 'THAT ONE WROTE THE GOOSE STORY!', 'SHH. ANYTHING YOU SAY GOES ONLINE.', 'I SAW YOU ON THE LOBBY SCREEN!', 'NICE MOUSTACHE. IS IT REAL?', 'DON\u2019T LOOK. IT\u2019S THE GOSSIP FOX.'];
  const bubT = CT(512, 128, () => {}), bub = sprite(bubT, 3.2, 0.8); bub.visible = false; scene.add(bub); let bubF = null, bubLife = 0, gossT = 40;
  function townGossip(dt, P) { if (bubLife > 0) { bubLife -= dt; if (bubF) { bubF.getWorldPosition(bub.position); bub.position.y += 2.7; } if (bubLife <= 0) bub.visible = false; }
    if (busy || !save.stat('mbzGossip', false) || (gossT -= dt) > 0) return; gossT = 45; const f = foxesNear(P, 14).filter(q => q.d > 2.5).sort((a, b) => a.d - b.d)[0]; if (!f) { gossT = 12; return; }
    const txt = GOSS[Math.floor(Math.random() * GOSS.length)], g = bubT.userData.c.getContext('2d'); g.clearRect(0, 0, 512, 128); g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(4, 4, 504, 92); g.strokeRect(4, 4, 504, 92); g.beginPath(); g.moveTo(230, 96); g.lineTo(256, 124); g.lineTo(282, 96); g.fill(); g.stroke();
    g.fillStyle = INK; let s = 34; g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > 470 && s > 16) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.textBaseline = 'middle'; g.fillText(txt, 20, 52); bubT.needsUpdate = true;
    bubF = f.o; bubLife = 4; bub.visible = true; f.o.getWorldPosition(bub.position); bub.position.y += 2.7; tone(990, 0.02, 0.1, 'triangle'); tone(1240, 0.02, 0.1, 'triangle', 0.1); }
  // the wall of screens, the lobby screen, the pinboard
  function drawScreens() { const g = scrT.userData.c.getContext('2d'), W = 1024, H = 384, n = clicks(), live = busy && J ? GN[J.g].name.toUpperCase() : '', last = save.stat('mbzLast', null), rum = save.stat('mbzRumours', null) || [], key = [n, live, last && last.g, rum[0]].join('|'); if (key === scrKey) return; scrKey = key;
    g.fillStyle = '#141517'; g.fillRect(0, 0, W, H); const cell = (x, y, w, h, bg) => { g.fillStyle = bg; g.fillRect(x + 4, y + 4, w - 8, h - 8); };
    cell(0, 0, 512, 192, PURP); g.fillStyle = YEL; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('CLICKS TODAY', 24, 40); g.fillStyle = '#fff'; g.font = '900 92px Archivo, sans-serif'; g.fillText(n.toLocaleString('en-GB'), 22, 122); g.fillStyle = YEL; g.font = '800 22px Archivo, sans-serif'; g.fillText(live ? '\u25cf LIVE \u00b7 ' + live : '\u25b2 AND CLIMBING', 24, 168);
    cell(512, 0, 512, 192, INK); g.fillStyle = RED; g.font = '900 26px Archivo, sans-serif'; g.fillText('TRENDING', 536, 40); g.fillStyle = '#fff'; g.font = '800 24px Archivo, sans-serif'; const tr = [...rum.slice(0, 2), 'SALT OR PEPPER? WHO SENT THE BANDITS?', 'STERLING\u2019S HAIR: A SECOND OPINION'].slice(0, 4);
    tr.forEach((t, i) => { let s = 24; g.font = '800 ' + s + 'px Archivo, sans-serif'; while (g.measureText((i + 1) + '. ' + t).width > 460 && s > 13) { s -= 1; g.font = '800 ' + s + 'px Archivo, sans-serif'; } g.fillText((i + 1) + '. ' + t, 536, 80 + i * 30); });
    for (let i = 0; i < 4; i++) { const x = i * 256, c = [YEL, PINK, '#7cc4ff', '#3f9a5e'][i]; cell(x, 192, 256, 192, c); g.fillStyle = INK; g.font = '900 40px Archivo, sans-serif'; g.fillText(['WOW!', 'OMG', 'NO WAY', 'HONK?!'][i], x + 20, 260); g.font = '800 18px Archivo, sans-serif'; g.fillText(((hash(i + today()) % 900) + 100) + 'K VIEWS', x + 22, 330); g.fillStyle = RED; g.beginPath(); g.moveTo(x + 200, 230); g.lineTo(x + 236, 270); g.lineTo(x + 200, 310); g.fill(); }
    scrT.needsUpdate = true; }
  let lbKey = ''; function drawLobby() { const on = save.stat('mbzTicker', false), r = save.stat('mbzRumours', null) || [], last = save.stat('mbzLast', null), st = storyHeadlines(save, 'buzz'), key = [on, r[0], last && last.g, last && last.s, busy && J && J.g, st.length].join('|'); if (key === lbKey) return; lbKey = key; const g = lbT.userData.c.getContext('2d'), W = 512, H = 296;
    g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = PURP; g.fillRect(0, 0, W, 50); g.fillStyle = YEL; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(busy && J ? '\u25cf LIVE \u00b7 ' + GN[J.g].name.toUpperCase() : 'MERU BUZZ \u00b7 TRENDING', 16, 26);
    const lines = st.length || (on && r.length) ? [...st.slice(-2).reverse(), ...(on ? r : [])].slice(0, 3) : ['SALT SAYS PEPPER. PEPPER SAYS SALT.', 'STERLING\u2019S HAIR: STILL PERFECT?', 'GOOSE SPOTTED. AGAIN.']; g.fillStyle = '#fff';
    lines.forEach((t, i) => { let s = 24; g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(t).width > W - 36 && s > 12) { s -= 1; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.fillText(t, 18, 86 + i * 46); });
    g.fillStyle = on ? YEL : '#9aa0a6'; g.font = '800 18px Archivo, sans-serif'; g.fillText(on ? 'RUMOURS BY OUR NEWEST REPORTER: YOU' + (last ? ' \u00b7 ' + '\u2605'.repeat(last.s) : '') : 'GOT GOSSIP? THE OFFICE IS HIRING', 18, H - 22); lbT.needsUpdate = true; }
  let pinKey = ''; function drawPin() { const sd = scoopDone(), key = String(sd) + save.stat('mbzAll', false); if (key === pinKey) return; pinKey = key; const g = pinT.userData.c.getContext('2d'), W = 800, H = 460;
    g.fillStyle = '#b08a5a'; g.fillRect(0, 0, W, H); for (let i = 0; i < 300; i++) { g.fillStyle = 'rgba(80,50,20,0.18)'; g.fillRect(hash(i) % W, hash(i + 999) % H, 3, 3); }
    const pos = { crates: [30, 40], boats: [300, 30], chips: [560, 50], casino: [40, 260], taken: [310, 270], war: [560, 250] };
    if (sd) { g.strokeStyle = RED; g.lineWidth = 5; for (const [a, b] of LINKS) { g.beginPath(); g.moveTo(pos[a][0] + 100, pos[a][1] + 20); g.lineTo(pos[b][0] + 100, pos[b][1] + 20); g.stroke(); } }
    for (const [k, t] of CLUES) { const [x, y] = pos[k]; g.save(); g.translate(x + 100, y + 70); g.rotate(((hash(x + y) % 7) - 3) * 0.02); g.fillStyle = PAPER; g.fillRect(-100, -70, 200, 140); g.fillStyle = RED; g.fillRect(-8, -78, 16, 16); g.fillStyle = INK; g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'top';
      const words = (sd || k === 'crates' || k === 'war' ? t : '? ? ?').split(' '); let line = '', yy = -50; for (const w of words) { const tl = line ? line + ' ' + w : w; if (g.measureText(tl).width > 176) { g.fillText(line, -88, yy); line = w; yy += 24; } else line = tl; } g.fillText(line, -88, yy); g.restore(); }
    if (sd) { g.fillStyle = RED; g.fillRect(250, 196, 300, 56); g.fillStyle = '#fff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('SALT? OR A SET-UP?', 266, 226); } pinT.needsUpdate = true; }
  // ================= run a job =================
  const INTRO = { rumour: 'Three pairs of gossips in town. Get close and listen. Freeze when they look round.', headline: 'Pick the headline that is silly AND true. Boring is bad. Lies are worse.', fact: 'Every rumour has one lie. Check the fact sheet and tap it.',
    blurry: 'Readers sent blurry photos. Enhance them, then tell me what is really there.', phone: 'The gossip line is ringing! Real tip or prank? Quickly!', click: 'Pick the thumbnail that gets the most clicks. Faces, big words, red arrows!', comments: 'Delete the rude comments before they post. Leave the nice ones alone!' };
  const DONE = { rumour: 'Juicy! Three rumours, and nobody saw you. Mostly.', papa: 'Front page photos! The bodyguard is still grumpy.', headline: 'Silly, true, clickable. You are a natural.', fact: 'Lies caught. We are a tabloid with standards. Small ones.',
    blurry: 'No monsters. Just ducks and sheets. Still a story!', phone: 'Tips kept, pranks binned. My ear thanks you.', click: 'Clicks are through the roof! The counter needs a new digit.', comments: 'A clean comment section. First time ever.' };
  const nextOf = who => { const d = done(), list = GAMES.filter(q => !who || q.who === who), n = list.find(q => !d[q.k]); return (n || list.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const [T, l] = giver(g), C = CELEBS[save.stat('mbzPapaN', 0) % CELEBS.length]; sayTo(T, [l(g === 'papa' ? C.n + ' is out on the street! Get three photos. Not too close.' : INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('mbzVisits', save.stat('mbzVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], cols: [], t: 0 }; const D = GD[g]; busy = D.errand ? 'errand' : 'job'; ding(); scrKey = ''; lbKey = '';
    if (D.errand) { D.begin(); return; } fade(() => D.begin()); }
  function finishGame() { if (!J || (busy !== 'job' && busy !== 'errand')) return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('mbzDone', d); save.setStat('mbzLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none'; SNAP.style.display = 'none'; scrKey = ''; lbKey = '';
    const [T, l] = giver(g); const say = () => { const L1 = [l(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) { const [txt, who] = GIFT[gift]; L1.push((who === 'in' ? inLn : rpLn)(txt)); } K.finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(1600 + k * 200, 0.02, 0.06, 'square', k * 0.06);
      sayTo(T, L1, () => { if (busy === 'end') { busy = null; J = null; } }); };
    fade(() => { cleanup(); const inn = GN[g].who === 'in'; goRoom(inn ? -6.6 : 0, inn ? 3.0 : -5.0, inn ? -Math.PI / 2 : Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 30000); }
  function cleanup() { if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; J.cols.forEach(c => { const i = cols.indexOf(c); if (i >= 0) cols.splice(i, 1); }); J.cols = []; } hidePanel(); hideCard(); ARW.style.display = 'none'; SNAP.style.display = 'none';
    place(rep, RP0[0], RP0[1], RP0[2]); place(intern, IN0[0], IN0[1], IN0[2]); }
  function stop() { const away = J && GD[J.g].errand; cleanup(); busy = null; J = null; scrKey = ''; if (away) fade(() => goRoom(0, 6.0, Math.PI)); }
  function quit() { if (busy === 'intro') { busy = null; return; } if (busy === 'scoop') { scoop = null; busy = null; hidePanel(); return; } if (!J || busy === 'end') return; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ================= camera (job shots) + spy zoom =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { if (zoomT > 0) { zoomT -= dt; if (zoomFov == null) zoomFov = cam.fov; cam.fov = zoomFov / 4; cam.updateProjectionMatrix(); if (zoomT <= 0) { cam.fov = zoomFov; zoomFov = null; cam.updateProjectionMatrix(); VF.style.display = 'none'; } return; }
    const v = busy === 'job' && J && !fading && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on || snapK) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(snapK ? camT.pos : cam.position); } snapK = false; const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(clamp(camCur.pos.x, OX - 9.5, OX + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.4), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= talk + prompt =================
  const inRoom = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inLobby = P => !!P && Math.abs(P.x - LOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = p => GAMES.find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearRP = p => nearL(p, 0, -5.8, 1.3) || nearL(p, rep.position.x, rep.position.z, 1.6), nearIN = p => nearL(p, intern.position.x, intern.position.z, 1.9);
  const atPin = p => nearL(p, 8.6, 0.6, 1.8), atScreens = p => nearL(p, 0, -4.2, 1.0);
  function prompt(P) { if (busy === 'errand') return null; if (busy) return null;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; return nearL(p, LDOOR[0], LDOOR[1], 1.6) ? 'OFFICE \u00b7 COME IN' : nearL(p, GEO.RW / 2 - 1.4, -3.6, 1.8) ? 'MERU BUZZ \u00b7 TRENDING' : null; }
    if (!inRoom(P)) return null; const p = toL(P); if (nearL(p, SDOOR[0], SDOOR[1], 1.5)) return 'LOBBY \u00b7 MERU BUZZ'; const r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearRP(p)) return 'TALK \u00b7 RUMOUR REPORTER'; if (nearIN(p)) return 'TALK \u00b7 INTERN';
    if (atPin(p)) return scoopOpen() ? 'PINBOARD \u00b7 THE BIG SCOOP' : 'PINBOARD \u00b7 LOOK'; return null; }
  let talkR = save.stat('mbzTalkedR', 0), talkI = save.stat('mbzTalkedI', 0);
  const RP_HI = ['Back! Did you hear? No? I will tell you. Later.', 'Clicks are up. Thanks to you. Mostly you.', 'Got gossip? Whisper it. Then I shout it.'];
  const IN_HI = ['Hi again! I fixed one typo today. Then made two.', 'Coffee? It is mostly milk.', 'The boss says I am doing great. I think.'];
  function rpMenu() { const first = !talkR; talkR++; save.setStat('mbzTalkedR', talkR); const mine = GAMES.filter(q => q.who === 'rp'), ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf('rp')) },
      { text: 'PICK A JOB', pick: () => sayTo(T_RP, [{ ...rpLn('Which one?'), choices: [...mine.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'ANY GOSSIP?', pick: () => sayTo(T_RP, [rpLn('Psst. ' + RUMOURS[(today() + talkR) % 6].toLowerCase().replace(/^./, c => c.toUpperCase()))]) }];
    if (scoopOpen()) ch.push({ text: 'THE BIG SCOOP', pick: () => sayTo(T_RP, [rpLn('My pinboard, east wall. Connect the clues with red string.')], () => openScoop()) });
    else ch.push({ text: 'WHO SENT THE BANDITS?', pick: () => sayTo(T_RP, [rpLn(scoopDone() ? 'Salt boats, Salt chips. Or a set-up. We can\u2019t print it. Salt owns us.' : 'Rumour says boats at night. Do all eight jobs, then see my pinboard.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_RP, [rpLn('You didn\u2019t hear it from me!')]) });
    sayTo(T_RP, [{ ...rpLn(first ? 'Rumour reporter, Meru Buzz! Want to dig up gossip? I have four jobs. The intern has four.' : RP_HI[(talkR - 2) % RP_HI.length]), choices: ch }]); }
  function inMenu() { const first = !talkI; talkI++; save.setStat('mbzTalkedI', talkI); const mine = GAMES.filter(q => q.who === 'in');
    sayTo(T_IN, [{ ...inLn(first ? 'Hi! I am the intern. I make coffee and typos. I have four jobs!' : IN_HI[(talkI - 2) % IN_HI.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf('in')) },
      { text: 'PICK A JOB', pick: () => sayTo(T_IN, [{ ...inLn('Which one?'), choices: [...mine.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'COFFEE?', pick: () => { noise(0.8, 0.08, 'bandpass', 900); sayTo(T_IN, [inLn('One coffee! Mostly milk. A little typo on the cup.')]); } },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_IN, [inLn('Bye! Don\u2019t tell the boss I said bye.')]) }] }]); }
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scoop') return true; if (busy === 'errand' && J) { if (J.g === 'papa') { GD.papa.snap(); return true; } return false; } if (busy) return false;
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; if (nearL(p, LDOOR[0], LDOOR[1], 1.6)) { fade(() => { goRoom(0, 6.0, Math.PI); }); K.chime(); return true; } if (nearL(p, GEO.RW / 2 - 1.4, -3.6, 1.8)) { const r = save.stat('mbzRumours', null) || []; toast(save.stat('mbzTicker', false) && r.length ? 'TRENDING \u00b7 ' + r[0] : 'TRENDING \u00b7 SALT SAYS PEPPER, PEPPER SAYS SALT', 2.6); return true; } return false; }
    if (!inRoom(P)) return false; const p = toL(P);
    if (nearL(p, SDOOR[0], SDOOR[1], 1.5)) { fade(() => { go(LOX + LDOOR[0], LY, LZ + LDOOR[1] + 1.2, 0); }); return true; }
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf(null)); return true; }
    if (nearRP(p)) { tone(1320, 0.05, 0.5); rpMenu(); return true; } if (nearIN(p)) { tone(990, 0.05, 0.5); inMenu(); return true; }
    if (atPin(p)) { if (scoopOpen()) openScoop(); else toast(scoopDone() ? 'PINBOARD \u00b7 SALT? OR A SET-UP?' : 'PINBOARD \u00b7 HALF THE CARDS SAY ? ? ? \u00b7 DO ALL 8 JOBS', 2.6); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt; applyWear(fox);
    const inR = inRoom(P), inL = inLobby(P); G.visible = inR || busy === 'job' || busy === 'scoop'; LG.visible = inL;
    if (inR) clickDrift += dt * (busy === 'job' ? 9 : 2.5);
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; if (inR) { drawScreens(); drawPin(); gold.visible = !!save.stat('mbzAll', false); } if (inL) drawLobby(); }
    if (!inR && !inL) { townTicker(dt); townGossip(dt, P); } else if (bubLife > 0) { bubLife = 0; bub.visible = false; }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if ((busy === 'job' || busy === 'errand') && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('tabloid job: ' + (e && e.stack || e)); stop(); }
      if (J && D.card) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || (J.gold ? J.gold + ' G' : 'MERU BUZZ')) + foot(c.next, c.stop) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && GD[J.g].panel && !fading && GD[J.g].draw && (J.list ? J.ci < J.list.length : J.q && (J.q.length || J.feed.length))) GD[J.g].draw();
    if (G.visible) { for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      const job = busy === 'job' && J && GN[J.g].who === 'in';
      if (!job) { kit.animFox(intern, dt, 0, false); if (!busy) { const p = toL(P), dd = Math.hypot(p.x - intern.position.x, p.z - intern.position.z), want = dd < 4.5 ? Math.atan2(p.x - intern.position.x, p.z - intern.position.z) : IN0[2] + Math.sin(t * 0.5) * 0.3; turnTo(intern, want, dt, 3); armUp(intern, 1, 0.5 + Math.sin(t * 1.3) * 0.1, -0.9); } } }
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: inR ? 0 : 99, talking: busy === 'job', clear: endClear > 0 ? [0, -5.0, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' || busy === 'scoop' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { buzzoffice: [OX, LZ + 6.0, Math.PI, LY], buzz: D0 ? [...OUTW(0, 11), D0.ry, 0] : null }, finish: () => finishGame(), _go: go, _shades: shadesOn, useSpy, openScoop, rep, intern, snap: () => GD.papa.snap(),
    _view(p, l, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p)); c.lookAt(toW(...l)); c.updateMatrixWorld(); const v = G.visible; G.visible = true; renderer.render(scene, c); G.visible = v; return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); SNAP.remove(); VF.remove(); FLASH.remove(); scene.remove(bub); K.dispose(); } };
  window.__tabloid = API; return API;
}
