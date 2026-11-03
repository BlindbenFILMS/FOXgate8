// MERU 2.0 — s140 ART GALLERY + STUDIOS JOBS [meruGallery] ("4. LOBBY JOBS", Ben's picks s138): 4 jobs IN PLACE in the gallery lobby from the
// GALLERY OWNER (HANG IT STRAIGHT · SPOT THE FAKE · SELL A PAINTING · DUST THE SCULPTURES) + 2 in a NEW ROOM upstairs, THE STUDIOS, from the PAINTER
// (MIX THE PAINT · PAINT BY NUMBERS). Prizes: ARTIST SMOCK (1st clear) · YOUR FIRST PAINTING (2 jobs, item myPainting) · GOLDEN FRAME (all 6,
// item goldFrame, + 60 G) + the Owner's VAX cameras scene · relic THE FIRST BRUSH (3 stars on all). Stats prefix gah. Made from the woodshop kit.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildGallery({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, go, groundH = () => 0 }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'gallery'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, OX = LR.ox, RH = 5;
  const SR = clusters.addRoom({ key: 'galleryStudio', room: 'meruGalleryStudios', title: 'ART GALLERY \u00b7 STUDIOS' }, RH); SR.out = LR.out; const SOX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
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
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', CREAM = '#e7e4dc', STEEL = '#9aa0a6', BLACK = '#26292d', BLUE = '#2e86b8', GRN = '#2f7d5a', NAVY = '#2e4a6b', GOLD = '#d7ad52', OAK = '#a77b4f', PINE = '#c9a27a', DKW = '#5a3d26', WAL = '#7a5236', ACC = NAVY;
  const rectL = (a, b, c, d, S) => cols.push({ f: [(S ? SOX : OX) + a, (S ? SOX : OX) + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r, S) => cols.push({ c: [(S ? SOX : OX) + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'galleryJobs'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const SG = new THREE.Group(); SG.name = 'galleryStudios'; SG.position.set(SOX, LY, LZ); scene.add(SG); SG.visible = false;
  const toW = (x, y, z, S) => V((S ? SOX : OX) + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ }), toS = P => ({ x: P.x - SOX, y: (P.y || 0) - LY, z: P.z - LZ });
  const today = () => save.stat('meru2Day', 1), done = () => save.stat('gahDone', null) || {};
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]), pickN = (a, n) => shuffle(a).slice(0, n), pick1 = a => a[Math.floor(Math.random() * a.length)];
  const LOOKS = [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#5d6f82', '#e7e4dc', '#334155'], ['#4f7d3a', '#e2d2b4', '#2a3d20'], ['#7a1d2a', '#f3f2f2', '#3d1218'], ['#e07a1f', '#f3f2f2', '#7a3d1a']];
  // ================= the paintings: modernist abstracts (rects, circles, bars) + their fakes =================
  const PAL = ['#ec3013', '#2e4a6b', '#ffd23a', '#201e1d', '#2f7d5a', '#e07a1f', '#9fc4e0'], BGS = ['#f3f2f2', '#e7e4dc', '#ffd23a', '#2e4a6b', '#9fc4e0'];
  const artGen = (o = {}) => { const bg = o.bg || pick1(BGS), cl = PAL.filter(c => c !== bg), n = o.n || 4 + Math.floor(Math.random() * 3), sh = [];
    for (let i = 0; i < n; i++) { const t = i === n - 1 ? pick1(['rect', 'circ']) : pick1(['rect', 'rect', 'circ', 'bar']), s = rnd(0.16, 0.34); sh.push({ t, x: rnd(0.22, 0.78), y: rnd(0.22, 0.78), w: s, h: t === 'rect' ? s * rnd(0.6, 1.4) : s, c: o.main ? (i === n - 2 ? '#201e1d' : o.main) : pick1(cl), v: Math.random() < 0.5 }); }
    return { bg, sh, sig: 'FOX' }; };
  const drawArt = (g, A, x, y, w, h, frame = true) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); g.fillStyle = A.bg; g.fillRect(x, y, w, h); const m = Math.min(w, h);
    for (const s of A.sh) { g.fillStyle = s.c; const cx = x + s.x * w, cy = y + s.y * h;
      if (s.t === 'circ') { g.beginPath(); g.arc(cx, cy, m * s.w / 2, 0, 7); g.fill(); } else if (s.t === 'bar') { if (s.v) g.fillRect(cx - m * 0.03, y, m * 0.06, h); else g.fillRect(x, cy - m * 0.03, w, m * 0.06); } else g.fillRect(cx - s.w * w / 2, cy - s.h * h / 2, s.w * w, s.h * h); }
    g.fillStyle = A.bg === '#2e4a6b' ? '#f3f2f2' : '#201e1d'; g.font = 'italic 900 ' + Math.max(8, Math.round(h * 0.08)) + 'px Archivo, sans-serif'; g.textAlign = 'right'; g.fillText(A.sig, x + w * 0.95, y + h * 0.94); g.textAlign = 'left'; g.restore();
    if (frame) { g.strokeStyle = '#201e1d'; g.lineWidth = Math.max(3, w * 0.03); g.strokeRect(x, y, w, h); } };
  const cloneA = A => ({ bg: A.bg, sig: A.sig, sh: A.sh.map(s => ({ ...s })) });
  const FAKES = { colour: 'ONE SHAPE IS THE WRONG COLOUR', gone: 'A SHAPE IS MISSING', moved: 'A SHAPE HAS MOVED', size: 'A SHAPE IS THE WRONG SIZE', extra: 'ONE SHAPE TOO MANY' };
  const fakeOf = (A, kind) => { const F = cloneA(A), i = F.sh.length - 1, s = F.sh[i];   // the top shape changes, so the change is never hidden
    if (kind === 'colour') s.c = pick1(PAL.filter(c => c !== s.c && c !== F.bg)); else if (kind === 'gone') F.sh.splice(i, 1);
    else if (kind === 'moved') { s.x = s.x > 0.5 ? s.x - 0.2 : s.x + 0.2; s.y = s.y > 0.5 ? s.y - 0.12 : s.y + 0.12; }
    else if (kind === 'size') { const k = s.w > 0.25 ? 0.55 : 1.7; s.w *= k; s.h *= k; }
    else F.sh.push({ t: 'circ', x: rnd(0.25, 0.75), y: rnd(0.25, 0.75), w: 0.18, h: 0.18, c: pick1(PAL.filter(c => c !== F.bg)), v: false });
    return F; };
  const artTex = (A, w = 256, h = 192) => CT(w, h, (g, W, H) => drawArt(g, A, 0, 0, W, H));
  // ================= the LOBBY stations (walkway door → owner's desk stays clear) =================
  const R0 = mk(), { box, cyl, sph } = R0;
  [[-3.4, 0.16], [-0.4, -0.12], [2.6, 0.2]].forEach(([z, rz]) => { const m = planeT(artTex(artGen()), 1.6, 1.2, -9.8, 2.5, z, Math.PI / 2, G); m.rotation.z = rz; });
  box(0.6, 0.3, 0.34, RED, -9.3, 0.15, 1.2); box(0.5, 0.06, 0.08, YEL, -9.3, 0.33, 1.2); rectL(-9.7, -8.9, 0.9, 1.5);
  planeT(plate('HANG IT STRAIGHT', 384, 96, INK, PAPER, RED), 1.6, 0.38, -9.83, 3.9, -0.4, Math.PI / 2, G);
  box(0.5, 1.0, 0.4, WAL, 8.4, 0.5, 1.6); box(0.6, 0.05, 0.5, PAPER, 8.4, 1.03, 1.6, 0, 0, 0.2); rectL(8.1, 8.7, 1.3, 1.9);
  planeT(plate('SPOT THE FAKE', 384, 96, INK, PAPER, RED), 1.6, 0.38, 9.83, 3.9, -0.4, -Math.PI / 2, G);
  box(0.8, 0.06, 0.5, BLUE, -6.6, 0.75, 3.4); box(0.8, 0.06, 0.5, BLUE, -6.6, 0.25, 3.4); for (const dx of [-0.36, 0.36]) for (const dz of [-0.2, 0.2]) box(0.04, 0.75, 0.04, STEEL, -6.6 + dx, 0.4, 3.4 + dz);
  cyl(0.16, 0.13, 0.3, YEL, -6.8, 0.93, 3.4, 10); cyl(0.02, 0.02, 0.7, WAL, -6.35, 1.1, 3.4, 6, 0, 0.3); sph(0.12, '#f3e6c0', -6.24, 1.45, 3.4); rectL(-7.1, -6.1, 3.1, 3.7);
  planeT(plate('DUST THE SCULPTURES', 384, 96, INK, PAPER, RED), 1.4, 0.34, -6.6, 1.75, 3.67, 0, G);
  box(0.05, 1.8, 0.05, WAL, 6.6, 0.9, 6.25); box(0.05, 1.8, 0.05, WAL, 6.6, 0.9, 6.95); box(0.05, 1.8, 0.05, WAL, 7.0, 0.85, 6.6, 0, 0, 0.22); box(0.12, 0.05, 1.0, WAL, 6.6, 1.0, 6.6); circL(6.7, 6.6, 0.55);
  planeT(artTex(artGen()), 1.1, 0.85, 6.55, 1.46, 6.6, -Math.PI / 2, G);
  for (const z of [5.0, 8.2]) { const m = planeT(artTex(artGen()), 0.9, 0.7, 9.6, 0.4, z, -Math.PI / 2, G); m.rotation.x = 0; } rectL(9.3, 9.9, 4.5, 8.7);
  planeT(plate('SELL A PAINTING', 384, 96, INK, PAPER, RED), 1.6, 0.38, 9.83, 3.0, 6.6, -Math.PI / 2, G);
  box(0.08, 2.7, 1.8, INK, -9.82, 1.35, 6.4); for (const s of [-1, 1]) box(0.14, 2.8, 0.12, WAL, -9.8, 1.4, 6.4 + s * 0.95); box(0.14, 0.14, 2.0, WAL, -9.8, 2.8, 6.4);
  box(0.9, 0.16, 1.8, '#d9d4cc', -9.35, 0.08, 6.4); box(0.45, 0.32, 1.8, '#d9d4cc', -9.57, 0.16, 6.4); rectL(-10, -8.9, 5.4, 7.4);
  planeT(plate('STUDIOS \u00b7 UPSTAIRS', 512, 96, INK, PAPER, BLUE), 1.8, 0.32, -9.83, 3.2, 6.4, Math.PI / 2, G);
  R0.mesh(G);
  const gframe = planeT(CT(256, 192, (g, W, H) => { g.fillStyle = GOLD; g.fillRect(0, 0, W, H); g.fillStyle = '#f3e6c0'; g.fillRect(20, 20, W - 40, H - 40); g.fillStyle = INK; g.font = '900 22px Archivo, sans-serif'; g.fillText('THE GOLDEN FRAME', 34, H / 2 + 8); }), 1.4, 1.05, -6, 2.8, -9.83, 0, G); gframe.visible = false;
  const brush = new THREE.Group(); { const S = mk(); S.cyl(0.02, 0.025, 0.36, WAL, 0, 0, 0, 8, 0, Math.PI / 2); S.cyl(0.03, 0.022, 0.08, GOLD, 0.2, 0, 0, 8, 0, Math.PI / 2); S.box(0.07, 0.045, 0.05, RED, 0.27, 0, 0); S.mesh(brush); } brush.position.set(2.2, 1.17, -6.0); brush.rotation.y = 0.4; G.add(brush); brush.visible = false;
  // ================= THE STUDIOS (new room upstairs: skylights, Studio 1 = paint (west), Studio 2 = stone (east)) =================
  const S0 = mk(), sb = S0.box, scy = S0.cyl, ssp = S0.sph, SWL = '#f3f2f2', STONE = '#c9c4ba';
  sb(20, 0.1, 20, '#d8c3a0', 0, -0.05, 0); for (let x = -8.4; x <= 8.4; x += 1.2) sb(0.03, 0.012, 20, '#c2ab85', x, 0.006, 0);
  sb(20, 0.2, 20, CREAM, 0, RH + 0.1, 0); for (const z of [-5, 0, 5]) { for (const s of [-1, 1]) sb(4.4, 0.24, 0.12, INK, 0, RH - 0.12, z + s * 0.9); for (const s of [-1, 1]) sb(0.12, 0.24, 1.9, INK, s * 2.2, RH - 0.12, z); }
  sb(20, RH, 0.3, SWL, 0, RH / 2, -10); for (const s of [-1, 1]) sb(0.3, RH, 20, SWL, s * 10, RH / 2, 0); for (const s of [-1, 1]) sb(8.4, RH, 0.3, SWL, s * 5.8, RH / 2, 10); sb(3.2, RH - 3.0, 0.3, SWL, 0, 3.0 + (RH - 3.0) / 2, 10);
  sb(3.2, 3.0, 0.06, '#2a2622', 0, 1.5, 10.25); for (let k = 0; k < 4; k++) sb(3.0, 0.08, 0.3, '#5f5a52', 0, 0.3 - k * 0.1, 10.25 - k * 0.05);
  for (const s of [-1, 1]) sb(0.06, 0.3, 20, INK, s * 9.83, 0.15, 0); sb(20, 0.3, 0.06, INK, 0, 0.15, -9.83);
  rectL(-10, 10, -10.3, -9.7, true); rectL(9.8, 10.3, -10, 10, true); rectL(-10.3, -9.8, -10, 10, true); rectL(-10, -1.6, 9.8, 10.3, true); rectL(1.6, 10, 9.8, 10.3, true); rectL(-1.6, 1.6, 9.9, 10.4, true);
  sb(2.2, 0.012, 14.6, '#ece6d8', 0, 0.012, 1.6); for (const [x, z, c] of [[-0.5, 6, RED], [0.6, 3.2, BLUE], [-0.3, 0.4, YEL], [0.5, -2.6, GRN], [-6.6, 1.8, RED], [-4.4, -5.6, BLUE], [-7.8, 6.8, YEL], [-3.6, 2.6, GRN]]) scy(0.16, 0.16, 0.012, c, x, 0.02, z, 10);
  sb(4.6, 3.2, 0.1, INK, 0, 2.6, -9.8); sb(4.4, 3.0, 0.04, '#fbfaf7', 0, 2.6, -9.73); scy(0.07, 0.07, 0.02, INK, 0.4, 2.8, -9.7, 12, Math.PI / 2);
  sb(2.4, 0.08, 1.0, PINE, -6, 0.95, -3); for (const dx of [-1.1, 1.1]) for (const dz of [-0.4, 0.4]) sb(0.08, 0.95, 0.08, WAL, -6 + dx, 0.47, -3 + dz);
  [RED, YEL, NAVY, PAPER, INK].forEach((c, i) => { scy(0.13, 0.13, 0.2, c, -6.9 + i * 0.45, 1.09, -3.15, 10); scy(0.135, 0.135, 0.02, STEEL, -6.9 + i * 0.45, 1.2, -3.15, 10); }); sb(0.5, 0.02, 0.32, OAK, -6.0, 1.0, -2.72); rectL(-7.3, -4.7, -3.6, -2.4, true);
  sb(0.06, 1.0, 0.06, INK, -6, 1.5, -3.56);
  for (const x of [-6.6, -5.4]) sb(0.06, 2.0, 0.06, WAL, x, 1.0, 4.05); sb(0.06, 1.9, 0.06, WAL, -6, 0.95, 4.5, 0, -0.25); sb(1.7, 1.4, 0.05, PAPER, -6, 1.75, 4.0); sb(1.7, 0.06, 0.14, WAL, -6, 1.02, 4.05); circL(-6, 4.1, 0.6, true);
  sb(1.5, 1.7, 1.1, '#b9b4aa', 6.2, 0.85, -6.6); ssp(0.36, STONE, 6.2, 1.98, -6.6); for (const dx of [-0.2, 0.2]) sb(0.12, 0.3, 0.12, STONE, 6.2 + dx, 2.36, -6.6); rectL(5.4, 7.0, -7.2, -6.0, true);
  for (const [x, z] of [[8.4, 0.6], [8.4, 3.6], [5.4, 6.8]]) { sb(0.7, 0.9, 0.7, PAPER, x, 0.45, z); sb(0.3, 0.4, 0.3, STONE, x, 1.1, z); ssp(0.17, STONE, x, 1.45, z + 0.03); for (const dx of [-0.08, 0.08]) sb(0.05, 0.14, 0.05, STONE, x + dx, 1.62, z); sb(0.08, 0.08, 0.3, STONE, x, 0.95, z - 0.25); circL(x, z, 0.5, true); }
  sb(0.8, 0.08, 1.6, OAK, 8.6, 0.9, -2.6); for (const dz of [-0.7, 0.7]) sb(0.7, 0.9, 0.08, WAL, 8.6, 0.45, -2.6 + dz); for (const [dz, c] of [[-0.4, STEEL], [0, WAL], [0.4, STEEL]]) sb(0.05, 0.04, 0.3, c, 8.5, 0.96, -2.6 + dz); rectL(8.2, 9.8, -3.4, -1.8, true);
  S0.mesh(SG);
  const skyM = new THREE.MeshBasicMaterial({ color: '#e8f3ff' }); for (const z of [-5, 0, 5]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.7), skyM); m.rotation.x = Math.PI / 2; m.position.set(0, RH - 0.02, z); m.userData.noCull = true; SG.add(m); }
  const easelAt = (x, z, ry, A, w = 1.0, h = 0.8) => { const eg = new THREE.Group(); eg.position.set(x, 0, z); eg.rotation.y = ry; SG.add(eg); const E = mk(); E.box(0.05, 1.9, 0.05, WAL, -0.42, 0.95, 0, 0, 0, 0.08); E.box(0.05, 1.9, 0.05, WAL, 0.42, 0.95, 0, 0, 0, -0.08); E.box(0.05, 1.8, 0.05, WAL, 0, 0.88, -0.4, 0, -0.25); E.box(w + 0.1, 0.05, 0.14, WAL, 0, 1.0, 0.04); E.mesh(eg); planeT(artTex(A), w, h, 0, 1.03 + h / 2, 0.07, 0, eg); circL(x, z, 0.55, true); };
  easelAt(-8.4, -6.6, 0.5, artGen()); easelAt(-1.6, -7.6, 0.2, { bg: '#fbfaf7', sh: [{ t: 'circ', x: 0.55, y: 0.45, w: 0.05, h: 0.05, c: INK }], sig: 'FOX' }, 0.8, 0.6); easelAt(-8.2, 1.4, Math.PI / 2, artGen());
  const pbnTex = CT(256, 214, (g, W, H) => { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); const cs = W / 12; g.strokeStyle = '#b9b4aa'; g.lineWidth = 1; g.font = '700 11px Archivo, sans-serif'; g.fillStyle = '#8d877d'; for (let y = 0; y < 10; y++) for (let x = 0; x < 12; x++) { g.strokeRect(x * cs, y * cs * 0.87 + 4, cs, cs * 0.87); if ((x * 7 + y * 3) % 4 === 0) g.fillText(String(1 + (x + y) % 4), x * cs + 6, y * cs * 0.87 + 17); } g.fillStyle = '#e07a1f'; g.fillRect(cs * 2, 4, cs * 3, cs * 0.87 * 2); });
  planeT(pbnTex, 1.5, 1.25, -6, 1.75, 4.03, 0, SG);
  planeT(plate('MIX THE PAINT', 384, 96, INK, PAPER, BLUE), 1.4, 0.34, -6, 2.1, -3.52, 0, SG); planeT(plate('PAINT BY NUMBERS', 384, 96, INK, PAPER, BLUE), 1.5, 0.34, -6, 2.75, 4.03, 0, SG);
  planeT(plate('STUDIO 1 \u00b7 PAINT', 384, 96, INK, PAPER, BLUE), 1.8, 0.4, -9.83, 3.6, -1.0, Math.PI / 2, SG); planeT(plate('STUDIO 2 \u00b7 STONE', 384, 96, INK, PAPER, BLUE), 1.8, 0.4, 9.83, 3.6, -1.0, -Math.PI / 2, SG);
  planeT(plate('STAIRS \u00b7 THE GALLERY', 512, 96, INK, PAPER, RED), 1.8, 0.32, 0, 3.4, 9.83, Math.PI, SG); planeT(plate('DOT \u00b7 NOT FOR SALE', 384, 64, INK, PAPER), 1.2, 0.2, 2.9, 1.0, -9.83, 0, SG);
  // ================= FOXES: the Gallery Owner (replaces the lobby's quiet keeper) · the Painter (studio keeper) · the Sculptor =================
  const old = LR.keeper; if (old && old.parent) old.parent.remove(old); LR.keeper = null;
  const OW0 = [0, -7.4, 0], PT0 = [0, -6.8, 0], SC0 = [6.2, -5.2, Math.PI];
  const owner = kit.makeFox({ key: 'galleryOwner', name: 'Gallery Owner', torso: ['#2e4a6b', '#f3f2f2', '#16263c'], outfit: 'suit', mood: 'warm' }); owner.position.set(OW0[0], 0, OW0[1]); owner.rotation.y = OW0[2]; owner.userData.noCull = true; owner.userData.rosterShop = 'ART GALLERY'; owner.userData.rosterRole = 'keeper'; G.add(owner);
  const painter = kit.makeFox({ key: 'galleryPainter', name: 'Painter', torso: ['#f3f2f2', '#2e86b8', '#201e1d'], outfit: 'coat', mood: 'warm' }); painter.position.set(PT0[0], 0, PT0[1]); painter.rotation.y = PT0[2]; painter.userData.noCull = true; painter.userData.rosterShop = 'ART GALLERY STUDIOS'; painter.userData.rosterRole = 'keeper'; SG.add(painter); circL(PT0[0], PT0[1], 0.45, true);
  const sculptor = kit.makeFox({ key: 'gallerySculptor', name: 'Sculptor', torso: ['#b9b4aa', '#5d6f82', '#334155'], outfit: 'vest', mood: 'neutral' }); sculptor.position.set(SC0[0], 0, SC0[1]); sculptor.rotation.y = SC0[2]; sculptor.userData.noCull = true; sculptor.userData.rosterShop = 'ART GALLERY STUDIOS'; SG.add(sculptor); circL(SC0[0], SC0[1], 0.45, true);
  const GAMES = [{ k: 'hang', name: 'Hang It Straight', color: RED }, { k: 'fake', name: 'Spot the Fake', color: NAVY }, { k: 'sell', name: 'Sell a Painting', color: GOLD }, { k: 'dust', name: 'Dust the Sculptures', color: STEEL }, { k: 'mix', name: 'Mix the Paint', color: BLUE, S: true }, { k: 'pbn', name: 'Paint by Numbers', color: GRN, S: true }];
  const LGAMES = GAMES.filter(q => !q.S), SGAMES = GAMES.filter(q => q.S), GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { hang: [-7.8, -0.4], fake: [7.8, -0.4], dust: [-4.6, 3.4], sell: [4.8, 6.6], mix: [-6, -1.4], pbn: [-6, 5.6] };
  const lampsOn = () => { const h = hour(); return h >= 19 || h < 7; };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'gah', color: NAVY, boardTitle: 'Gallery board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper: owner, keeperRy: 0, games: LGAMES, toWorld: v => v.add(G.position),
    board: { x: -3.4, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 2.8, z: 8.2, ry: 0 }, hiringLine: 'HANG \u00b7 SPOT \u00b7 SELL \u00b7 DUST \u00b7 MIX \u00b7 PAINT', sun: [{ x: 0, z: 7.4, w: 2.4, d: 2.0 }, { x: -3, z: 4.4, w: 2.4, d: 1.6 }, { x: 3, z: -1.6, w: 2.4, d: 1.6 }],
    lamps: [[0, 4.6, -6], [0, 4.6, -0.5], [0, 4.6, 5]], lampsOn, browse: [[-7.4, -2.2, -Math.PI / 2], [7.6, -2.2, Math.PI / 2], [-2.6, 4.6, Math.PI]], looks: [LOOKS[1], LOOKS[3], LOOKS[4]], clock: { x: 3.6, y: 3.4, z: 9.83, ry: Math.PI } });
  const KS = shopKit({ THREE, G: SG, scene, kit, save, camera, touch, hour, isMuted, prefix: 'gah', color: BLUE, boardTitle: 'Studio board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.0], keeper: painter, keeperRy: 0, games: SGAMES, toWorld: v => v.add(SG.position),
    board: { x: -4.2, y: 2.5, z: 9.83, ry: Math.PI, w: 1.5 }, sun: [{ x: -1, z: -5, w: 3.4, d: 1.6 }, { x: 1, z: 0, w: 3.4, d: 1.6 }, { x: -1, z: 5, w: 3.4, d: 1.6 }],
    lamps: [[0, RH - 1, -5], [0, RH - 1, 0], [0, RH - 1, 5]], lampsOn, browse: [[3.2, 2.4, Math.PI / 2]], looks: [LOOKS[2]], clock: { x: 4.2, y: 3.4, z: 9.83, ry: Math.PI } });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); (GN[k].S ? SG : G).add(m); ringMeshes[k] = m; }
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
  const goRoom = (x, z, yaw, S) => go((S ? SOX : OX) + x, LY, LZ + z, yaw);
  const turnTo = (f, want, dt, k = 4) => { let d = want - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * k); };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const GD = {};
  // a quick "round" engine for the panel jobs: list, ci, cueT, wait, draw, next, tick with timer + hint after 3 s
  const roundTick = (D, dt, T, missMsg, hintSel) => { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / T, J.cueT < 3); if (J.cueT <= 0) { missOne(missMsg); D.next(); } }
    if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const s = hintSel(); if (s) pulse(PANEL.querySelector(s)); } };
  const roundNext = (D, g, T) => { if (!J || J.g !== g) return; J.ci++; J.cueT = T; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); D.draw(); setTimeout(finishGame, 800); return; } D.draw(); };
  const wrongBtn = (el, msg) => { missOne(msg); shake(el); el.disabled = true; el.style.opacity = '0.4'; };
  const goodBtn = el => { el.style.background = '#201e1d'; el.style.color = '#ffd23a'; };
  const nOf = () => Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, goldR = () => (J.gold ? J.gold + ' G' : 'GALLERY');
  const body = inner => '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">' + inner + '</div>';
  const wide = () => innerWidth > innerHeight * 1.1;

  const fitCv = cv => { if (!cv) return null; const dpr = Math.min(2, devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return null; if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); return { g, w, h }; };
  const cvTag = asp => '<canvas data-cv style="width:100%;display:block;touch-action:none;background:#e7e4dc;' + (wide() ? 'flex:1;min-height:100px' : 'aspect-ratio:' + asp + ';flex:none') + '"></canvas>';
  const bigBtn = t => '<button data-go style="' + BTN + ';flex:none;min-height:' + (wide() ? 56 : 72) + 'px;font-size:22px;background:#ec3013;color:#fff;touch-action:none">' + t + '</button>';
  const doneMsg = t => '<div style="font-size:22px;font-weight:900">' + t + '</div>';
  const keyAct = fn => { const kd = e => { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) fn(); } }; addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); };
  const drag = (cv, onDown, onMove) => { if (!cv) return; cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} J.idle = 0; onDown(e); }; cv.onpointermove = e => { if (J && J.down) onMove(e); }; cv.onpointerup = cv.onpointercancel = () => { if (J) J.down = null; }; };
  const grain = (g, x0, y0, w, h, base, seed = 1) => { g.fillStyle = base; g.fillRect(x0, y0, w, h); g.strokeStyle = 'rgba(122,82,54,.4)'; g.lineWidth = 1.5; for (let k = 0; k < 6; k++) { const yy = y0 + h * (0.1 + k * 0.16); g.beginPath(); g.moveTo(x0, yy); for (let x = x0; x <= x0 + w; x += 16) g.lineTo(x, yy + Math.sin(x * 0.025 + k * 1.7 + seed) * 2.5); g.stroke(); } };
  const thunk = () => { tone(140, 0.09, 0.12, 'square'); tone(90, 0.07, 0.2, 'triangle', 0.02); };

  const CX = () => (J && J.S ? SOX : OX);
  const T_OW = { key: 'galleryOwner', name: 'Gallery Owner', role: 'ART GALLERY', obj: owner, ry: OW0[2], r: 6 }, owLn = ln('Gallery Owner', 'ART GALLERY');
  const T_PT = { key: 'galleryPainter', name: 'Painter', role: 'STUDIO 1', obj: painter, ry: PT0[2], r: 6 }, ptLn = ln('Painter', 'STUDIO 1');
  // ---------- 1 HANG IT STRAIGHT: drag the frame (or ◀ ▶) until the bubble sits in the green, then HANG IT; later frames sway ----------
  const HGN = 6, HGT = 12;
  GD.hang = { panel: true, shot: () => [toW(-9.8, 2.5, -0.4), 3.2, 2.2, 0.15, 2.6, Math.PI / 2, 6],
    begin() { goRoom(-7.8, -0.4, -Math.PI / 2); J.list = [...Array(HGN)].map((_, i) => ({ A: artGen(), a: (Math.random() < 0.5 ? -1 : 1) * rnd(7, 16), sway: i < 2 ? 0 : 1.2 + (i - 2) * 0.9, wide: Math.random() < 0.5 })); J.ci = 0; J.cueT = HGT; J.wait = 0.4; J.down = null; J.hung = null; J.hold = 0; snapK = true;
      const kd = e => { if (!J || J.g !== 'hang') return; const c = e.code; if (c === 'ArrowLeft' || c === 'KeyA') { e.preventDefault(); e.stopPropagation(); this.nudge(-0.5); } else if (c === 'ArrowRight' || c === 'KeyD') { e.preventDefault(); e.stopPropagation(); this.nudge(0.5); } else if (c === 'Space' || c === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) this.hang(); } };
      addEventListener('keydown', kd, true); J.off = () => removeEventListener('keydown', kd, true); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('HANG IT STRAIGHT \u00b7 FRAME ' + nOf(), goldR()) + body(c ? cvTag('4/3') + timeRow + '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr) minmax(0,1fr);gap:6px;flex:none"><button data-l style="' + BTN + ';font-size:22px;touch-action:none">\u25c0</button>' + bigBtn('HANG IT') + '<button data-r style="' + BTN + ';font-size:22px;touch-action:none">\u25b6</button></div>' : doneMsg('EVERY FRAME LEVEL')) + tipBar('DRAG THE FRAME TO TURN IT \u00b7 BUBBLE IN THE GREEN \u00b7 HANG IT'));
      const hb = PANEL.querySelector('[data-go]'); if (hb) hb.onclick = () => this.hang();
      for (const [s, d] of [['[data-l]', -1], ['[data-r]', 1]]) { const b = PANEL.querySelector(s); if (b) { b.onpointerdown = e => { e.preventDefault(); J.idle = 0; J.hold = d; this.nudge(d * 0.5); }; b.onpointerup = b.onpointercancel = b.onpointerleave = () => { if (J) J.hold = 0; }; } }
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = { x: e.clientX }; }, e => { const dx = e.clientX - J.down.x; J.down.x = e.clientX; this.nudge(dx * 0.12); }); J.idle = 0; J.hinted = false; },
    nudge(d) { const c = J && J.list[J.ci]; if (!c || J.wait > 0 || J.hung) return; J.idle = 0; c.a = clamp(c.a + d, -25, 25); },
    hang() { const c = J.list[J.ci]; if (!c || J.wait > 0 || J.hung) return; const d = Math.abs(c.a); J.hung = { d }; J.wait = 0.9; tone(520, 0.05, 0.12, 'triangle');
      if (d <= 1) { addGold(4); ding(); okTip('DEAD LEVEL'); } else if (d <= 3) { addGold(2); okTip('NEARLY LEVEL \u00b7 ' + d.toFixed(1) + '\u00b0 OFF'); } else missOne('CROOKED BY ' + Math.round(d) + '\u00b0'); setTimeout(() => this.next(), 800); },
    next() { if (!J || J.g !== 'hang') return; J.hung = null; J.down = null; J.hold = 0; roundNext(this, 'hang', HGT); },
    tick(dt) { const c = J.list[J.ci]; if (c && J.wait <= 0 && !J.hung) { if (c.sway) c.a = clamp(c.a + Math.sin(J.t * 1.4 + J.ci) * c.sway * dt, -25, 25); if (J.hold) this.nudge(J.hold * dt * 6); }
      roundTick(this, dt, HGT, 'TOO SLOW \u00b7 THE DOORS ARE OPENING', () => (Math.abs(c && c.a || 0) <= 1 ? '[data-go]' : '[data-cv]')); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f; g.fillStyle = CREAM; g.fillRect(0, 0, w, h); g.fillStyle = '#d9d4cc'; g.fillRect(0, h * 0.86, w, h * 0.14);
      const pw = (c.wide ? 0.62 : 0.44) * w, ph = Math.min(h * 0.56, pw * (c.wide ? 0.7 : 1.25)), cx = w / 2, top = h * 0.1, r = c.a * Math.PI / 180;
      g.fillStyle = INK; g.beginPath(); g.arc(cx, top, 4, 0, 7); g.fill();
      g.save(); g.translate(cx, top); g.rotate(r); g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-pw * 0.32, h * 0.08); g.lineTo(0, 0); g.lineTo(pw * 0.32, h * 0.08); g.stroke();
      g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-pw / 2 + 5, h * 0.08 + 5, pw, ph); drawArt(g, c.A, -pw / 2, h * 0.08, pw, ph); g.restore();
      const lw = w * 0.5, lx = (w - lw) / 2, lh = Math.max(14, h * 0.07), ly = h * 0.93 - lh; g.fillStyle = YEL; g.fillRect(lx, ly, lw, lh); g.fillStyle = '#7cff9b'; g.fillRect(w / 2 - lw * 0.06, ly, lw * 0.12, lh); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(lx, ly, lw, lh);
      const bx = w / 2 - clamp(c.a / 12, -1, 1) * (lw / 2 - lh / 2); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(bx, ly + lh / 2, lh * 0.36, 0, 7); g.fill(); g.stroke();
      g.fillStyle = INK; g.font = '900 ' + Math.round(Math.max(12, h * 0.06)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(Math.abs(c.a).toFixed(1) + '\u00b0', 8, h * 0.07);
      if (J.hung) { g.textAlign = 'right'; g.fillStyle = J.hung.d <= 3 ? GRN : RED; g.fillText(J.hung.d <= 1 ? 'LEVEL' : J.hung.d <= 3 ? 'NEARLY' : 'CROOKED', w - 8, h * 0.07); g.textAlign = 'left'; } } };
  // ---------- 2 SPOT THE FAKE: two of the three on the wall match the catalogue; tap the one that does not ----------
  const SFN = 8, SFT = 12;
  GD.fake = { panel: true, shot: () => [toW(9.8, 2.6, -0.4), 3.2, 2.2, 0.15, 2.6, -Math.PI / 2, 6],
    begin() { goRoom(7.8, -0.4, Math.PI / 2); J.list = [...Array(SFN)].map((_, i) => { const A = artGen(), kind = i < 3 ? pick1(['colour', 'gone', 'extra']) : pick1(['colour', 'gone', 'extra', 'moved', 'size']); return { A, F: fakeOf(A, kind), kind, at: Math.floor(Math.random() * 3) }; }); J.ci = 0; J.cueT = SFT; J.wait = 0.4; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('SPOT THE FAKE', goldR()) + body(doneMsg('EVERY FAKE CAUGHT')) + tipBar('THE COLLECTION IS SAFE')); return; }
      const W2 = wide(), opt = i => '<button data-o="' + i + '" style="' + BTN + ';padding:4px;min-height:0;display:flex;flex-direction:column;gap:4px;align-items:stretch"><canvas data-art="' + i + '" style="width:100%;aspect-ratio:4/3;display:block"></canvas><span style="font-size:12px">WALL ' + (i + 1) + '</span></button>';
      showPanel(panelHead('SPOT THE FAKE \u00b7 ' + nOf(), goldR()) + body('<div style="display:' + (W2 ? 'grid;grid-template-columns:minmax(0,1fr) minmax(0,3fr);gap:8px;align-items:start' : 'flex;flex-direction:column;gap:8px') + '"><div data-cat style="display:flex;flex-direction:column;gap:4px;' + (W2 ? '' : 'width:48%') + '"><span style="font-size:11px;font-weight:900;color:#ec3013">CATALOGUE \u00b7 THE REAL ONE</span><canvas data-art="c" style="width:100%;aspect-ratio:4/3;display:block"></canvas></div><div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px">' + [0, 1, 2].map(opt).join('') + '</div></div>' + timeRow) + tipBar('ONE OF THE THREE ON THE WALL IS A FAKE \u00b7 TAP IT'));
      PANEL.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => this.tap(+b.dataset.o, b); }); J.idle = 0; J.hinted = false; this.paint(); },
    paint() { const c = J.list[J.ci]; if (!c) return; PANEL.querySelectorAll('[data-art]').forEach(cv => { const f = fitCv(cv); if (!f) return; const k = cv.dataset.art, A = k === 'c' ? c.A : +k === c.at ? c.F : c.A; drawArt(f.g, A, 0, 0, f.w, f.h); }); },
    tap(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0;
      if (i !== c.at) { wrongBtn(el, 'THAT ONE IS REAL \u00b7 CHECK THE CATALOGUE'); return; }
      goodBtn(el); addGold(3); ding(); okTip('FAKE! ' + FAKES[c.kind]); J.wait = 1.1; setTimeout(() => this.next(), 1000); },
    next() { roundNext(this, 'fake', SFT); },
    tick(dt) { roundTick(this, dt, SFT, 'TOO SLOW \u00b7 THE FAKE WAS SOLD', () => '[data-cat]'); } };
  // ---------- 3 SELL A PAINTING: find the one painting that fits the wish + budget, then TAKE the offer or ASK for the tag ----------
  const SLN = 6, SLT = 16, SCOL = { RED: '#ec3013', BLUE: '#2e4a6b', YELLOW: '#ffd23a', GREEN: '#2f7d5a' }, SUBJ = ['FOX', 'BOAT', 'CASTLE', 'DOTS', 'LAKE'];
  const SUBJ_T = { FOX: 'of a FOX', BOAT: 'of a BOAT', CASTLE: 'of the CASTLE', DOTS: 'with DOTS', LAKE: 'of the LAKE' };
  const BUYERS = ['A VAX BUYER', 'MRS. FENNEC', 'THE MAYOR\u2019S AIDE', 'A TOURIST', 'A SALT COUSIN', 'STERLING GLOSS'];
  const newWork = () => { const col = pick1(Object.keys(SCOL)), size = pick1(['SMALL', 'BIG']), subj = pick1(SUBJ); return { col, size, subj, price: (size === 'BIG' ? 180 : 80) + 10 * Math.floor(rnd(0, 7)), A: artGen({ main: SCOL[col], bg: '#f3f2f2' }) }; };
  const wishOf = stock => { for (let n = 0; n < 60; n++) { const tI = Math.floor(Math.random() * stock.length), T = stock[tI], keys = shuffle(['col', 'size', 'subj']).slice(0, 2), budget = T.price + 10 * Math.floor(rnd(1, 5));
      if (stock.filter(s => keys.every(k => s[k] === T[k]) && s.price <= budget).length === 1) return { tI, keys, budget, T }; } return null; };
  const wishTxt = w => { const T = w.T, adj = []; if (w.keys.includes('size')) adj.push(T.size); if (w.keys.includes('col')) adj.push(T.col); return 'I want a ' + (adj.length ? adj.join(', ') + ' ' : '') + 'painting' + (w.keys.includes('subj') ? ' ' + SUBJ_T[T.subj] : '') + '. Up to ' + w.budget + ' G.'; };
  GD.sell = { panel: true, shot: () => [toW(6.55, 1.45, 6.6), 2.4, 1.8, 0.2, 2.2, -Math.PI / 2, 5],
    begin() { goRoom(4.8, 6.6, Math.PI / 2); J.stock = [...Array(6)].map(newWork); J.list = BUYERS.slice(0, SLN).map(who => ({ who })); J.ci = 0; J.cueT = SLT; J.wait = 0.4; snapK = true; this.prep(0); this.draw(); },
    prep(i) { const c = J.list[i]; let w = null; for (let k = 0; k < 12 && !w; k++) { w = wishOf(J.stock); if (!w) J.stock = [...Array(6)].map(newWork); } if (!w) { const T = J.stock[0]; w = { tI: 0, keys: ['col', 'size', 'subj'], budget: T.price + 50, T }; }
      c.w = w; c.stage = 'pick'; const p = w.T.price; c.low = Math.random() < 0.5; c.offer = c.low ? Math.floor(p * rnd(0.5, 0.72) / 10) * 10 : Math.ceil(p * 0.92 / 10) * 10; },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('SELL A PAINTING', goldR()) + body(doneMsg('SIX HAPPY BUYERS')) + tipBar('THE WALLS HAVE GOOD GAPS NOW')); return; }
      const W2 = wide(), T = c.w.T, who = '<div style="background:#201e1d;color:#f3f2f2;padding:8px 10px;font-weight:900;font-size:15px;line-height:1.3;flex:none"><span style="color:#ffd23a">' + c.who + ' \u00b7 </span>' + (c.stage === 'pick' ? wishTxt(c.w) : 'I will give you ' + c.offer + ' G for it.') + '</div>';
      if (c.stage === 'pick') {
        showPanel(panelHead('SELL A PAINTING \u00b7 BUYER ' + nOf(), goldR()) + body(who + timeRow + '<div style="display:grid;grid-template-columns:repeat(' + (W2 ? 6 : 3) + ',minmax(0,1fr));gap:6px">' + J.stock.map((s, i) => '<button data-s="' + i + '" style="' + BTN + ';padding:4px;min-height:0;display:flex;flex-direction:column;gap:3px;align-items:stretch"><canvas data-art="' + i + '" style="width:100%;aspect-ratio:1/1;display:block"></canvas><span style="font-size:11px;line-height:1.2">' + s.size + ' \u00b7 ' + s.col + '<br>' + s.subj + ' \u00b7 ' + s.price + ' G</span></button>').join('') + '</div>') + tipBar('PICK THE ONE PAINTING THAT FITS THE WISH AND THE BUDGET'));
        PANEL.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => this.pickW(+b.dataset.s, b); });
      } else {
        showPanel(panelHead('SELL A PAINTING \u00b7 BUYER ' + nOf(), goldR()) + body(who + timeRow + '<div style="display:flex;gap:10px;align-items:center"><canvas data-art="' + c.w.tI + '" data-keep style="width:' + (W2 ? '22%' : '38%') + ';max-width:' + (W2 ? 110 : 180) + 'px;aspect-ratio:1/1;display:block;flex:none"></canvas><div style="font-weight:900;font-size:15px;line-height:1.4">TAG ' + T.price + ' G<br><span style="color:#ec3013">OFFER ' + c.offer + ' G</span><br><span style="font-size:12px">LOWEST WE TAKE \u00b7 ' + Math.ceil(T.price * 0.9) + ' G</span></div></div><div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px"><button data-h="take" style="' + BTN + '">TAKE ' + c.offer + ' G</button><button data-h="ask" style="' + BTN + '">ASK FOR ' + T.price + ' G</button></div>') + tipBar('NEVER SELL BELOW THE LOWEST \u00b7 NEVER TURN DOWN A FAIR OFFER'));
        PANEL.querySelectorAll('[data-h]').forEach(b => { b.onclick = () => this.haggle(b.dataset.h, b); }); }
      this.paint(); J.idle = 0; J.hinted = false; },
    paint() { const c = J.list[J.ci]; PANEL.querySelectorAll('[data-art]').forEach(cv => { const f = fitCv(cv), s = c && c.stage !== 'pick' ? c.w.T : J.stock[+cv.dataset.art]; if (!f || !s) return; const k = s.size === 'BIG' ? 0.92 : 0.6; f.g.fillStyle = CREAM; f.g.fillRect(0, 0, f.w, f.h); drawArt(f.g, s.A, f.w * (1 - k) / 2, f.h * (1 - k) / 2, f.w * k, f.h * k); }); },
    pickW(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.stage !== 'pick') return; J.idle = 0;
      if (i !== c.w.tI) { const s = J.stock[i], why = c.w.keys.find(k => s[k] !== c.w.T[k]); wrongBtn(el, why ? 'NOT THAT ONE \u00b7 WRONG ' + (why === 'subj' ? 'SUBJECT' : why === 'col' ? 'COLOUR' : 'SIZE') : 'NOT THAT ONE \u00b7 OVER THEIR BUDGET'); return; }
      blip(); c.stage = 'haggle'; this.draw(); },
    haggle(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0 || c.stage !== 'haggle') return; J.idle = 0; const T = c.w.T, right = c.low ? 'ask' : 'take';
      if (k !== right) { missOne(c.low ? 'TOO CHEAP \u00b7 THE OWNER WINCED' : 'THEY WALKED OFF \u00b7 IT WAS A FAIR OFFER'); shake(el); } else { addGold(c.low ? 5 : 4); goodBtn(el); ding(); okTip(c.low ? 'FINE, FINE. ' + T.price + ' G. SOLD.' : 'SOLD FOR ' + c.offer + ' G'); }
      c.stage = 'done'; J.stock[c.w.tI] = newWork(); J.wait = 1.0; setTimeout(() => this.next(), 900); },
    next() { if (!J || J.g !== 'sell') return; if (J.ci + 1 < J.list.length) this.prep(J.ci + 1); roundNext(this, 'sell', SLT); },
    tick(dt) { roundTick(this, dt, SLT, 'TOO SLOW \u00b7 THE BUYER LEFT', () => { const c = J.list[J.ci]; return c.stage === 'pick' ? '[data-s="' + c.w.tI + '"]' : '[data-h="' + (c.low ? 'ask' : 'take') + '"]'; }); } };
  // ---------- 4 DUST THE SCULPTURES: wipe off every speck; scrub too fast and it wobbles off the plinth ----------
  const DSN = 4, DST = 20;
  const rectP = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], circP = (cx, cy, r) => [...Array(22)].map((_, i) => [cx + Math.cos(i / 22 * Math.PI * 2) * r, cy + Math.sin(i / 22 * Math.PI * 2) * r]);
  const inPoly = (P, x, y) => { let k = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) k = !k; } return k; };
  const SCU = [['STONE BALL', [circP(0.5, 0.55, 0.3)]], ['FOX HEAD', [[[0.5, 0.84], [0.26, 0.62], [0.28, 0.38], [0.2, 0.12], [0.4, 0.28], [0.5, 0.3], [0.6, 0.28], [0.8, 0.12], [0.72, 0.38], [0.74, 0.62]]]],
    ['THE STACK', [rectP(0.28, 0.6, 0.44, 0.26), rectP(0.35, 0.37, 0.3, 0.23), rectP(0.42, 0.17, 0.16, 0.2)]], ['THE ARCH', [[[0.24, 0.86], [0.24, 0.36], [0.5, 0.12], [0.76, 0.36], [0.76, 0.86], [0.62, 0.86], [0.62, 0.44], [0.5, 0.32], [0.38, 0.44], [0.38, 0.86]]]]];
  GD.dust = { panel: true, shot: () => [toW(-4.6, 1.4, 1.8), 2.0, 2.0, 0.3, 2.0, 0, 5],
    begin() { goRoom(-4.6, 3.4, Math.PI); J.list = shuffle(SCU).slice(0, DSN).map(([n, polys], i) => { const sp = []; let guard = 0; while (sp.length < 6 + i && guard++ < 600) { const x = rnd(0.15, 0.85), y = rnd(0.1, 0.86); if (polys.some(P => inPoly(P, x, y))) sp.push({ x, y, r: rnd(0.05, 0.08), hp: 1 }); } return { n, polys, sp }; });
      J.ci = 0; J.cueT = DST; J.wait = 0.4; J.down = null; J.spd = 0; J.wob = 0; J.tip = 0; snapK = true; this.draw(); },
    sq(w, h) { const s = Math.min(w, h) * 0.94; return { s, x0: (w - s) / 2, y0: (h - s) / 2 }; },
    uv(cv, e) { const r = cv.getBoundingClientRect(), q = this.sq(r.width, r.height); return { u: (e.clientX - r.left - q.x0) / q.s, v: (e.clientY - r.top - q.y0) / q.s, t: performance.now() / 1000 }; },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead((c ? 'DUST \u00b7 ' + c.n : 'DUST THE SCULPTURES') + ' \u00b7 ' + nOf(), goldR()) + body(c ? cvTag('1/1') + timeRow : doneMsg('NOT A SPECK LEFT')) + tipBar('DRAG THE DUSTER OVER THE DUST \u00b7 GENTLY, OR IT WOBBLES'));
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = this.uv(cv, e); }, e => { const p = this.uv(cv, e); this.wipe(J.down, p); if (J) J.down = p; }); },
    wipe(a, b) { const c = J.list[J.ci]; if (!c || J.wait > 0 || !a) return; J.idle = 0; const d = Math.hypot(b.u - a.u, b.v - a.v), dt = Math.max(0.008, b.t - a.t); J.spd = J.spd * 0.6 + (d / dt) * 0.4;
      for (const s of c.sp) { if (s.hp <= 0) continue; if (Math.hypot(b.u - s.x, b.v - s.y) < s.r + 0.06) { s.hp -= d * 3.2; if (s.hp <= 0) tone(1500, 0.03, 0.08, 'triangle'); } }
      if (Math.random() < 0.2) tone(3000 + Math.random() * 900, 0.004, 0.04, 'triangle');
      if (c.sp.every(s => s.hp <= 0)) { addGold(4); ding(); okTip('SPOTLESS'); J.wait = 0.9; J.down = null; setTimeout(() => this.next(), 700); } },
    next() { if (!J || J.g !== 'dust') return; J.down = null; J.wob = 0; J.spd = 0; roundNext(this, 'dust', DST); },
    tick(dt) { J.tip -= dt; J.spd *= Math.exp(-dt * 6); if (J.down && J.wait <= 0 && J.spd > 3.2) J.wob += (J.spd - 3.2) * dt * 0.5; else J.wob = Math.max(0, J.wob - dt * 0.45);
      if (J.wob >= 1) { J.wob = 0; J.tip = 0.6; tone(150, 0.08, 0.3, 'square'); missOne('IT WOBBLED \u00b7 DUST GENTLY'); }
      roundTick(this, dt, DST, 'TOO SLOW \u00b7 THE VISITORS ARE COMING', () => '[data-cv]'); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, q = this.sq(w, h), X = u => q.x0 + u * q.s, Y = v => q.y0 + v * q.s, t = performance.now() / 1000;
      g.fillStyle = CREAM; g.fillRect(0, 0, w, h); g.fillStyle = PAPER; g.fillRect(X(0.22), Y(0.86), q.s * 0.56, q.s * 0.14); g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(X(0.22), Y(0.86), q.s * 0.56, q.s * 0.14);
      const ang = (J.wob * 0.12 + Math.max(0, J.tip) * 0.4) * Math.sin(t * 22); g.save(); g.translate(X(0.5), Y(0.86)); g.rotate(ang); g.translate(-X(0.5), -Y(0.86));
      g.fillStyle = '#e9e6df'; g.strokeStyle = INK; g.lineWidth = 2; for (const P of c.polys) { g.beginPath(); P.forEach(([u, v], i) => (i ? g.lineTo(X(u), Y(v)) : g.moveTo(X(u), Y(v)))); g.closePath(); g.fill(); g.stroke(); }
      for (const s of c.sp) { if (s.hp <= 0) continue; g.globalAlpha = 0.25 + 0.7 * s.hp; g.fillStyle = '#8d877d'; g.beginPath(); g.arc(X(s.x), Y(s.y), s.r * q.s, 0, 7); g.fill(); g.fillStyle = '#6e6960'; for (let k = 0; k < 8; k++) { const a = k * 2.3 + s.x * 7, rr = s.r * q.s * ((k * 37 % 10) / 11); g.fillRect(X(s.x) + Math.cos(a) * rr - 1.5, Y(s.y) + Math.sin(a) * rr - 1.5, 3, 3); } g.globalAlpha = 1; }
      g.restore();
      const mw = q.s * 0.3, my = q.y0 + q.s * 0.075; g.fillStyle = INK; g.font = '900 ' + Math.round(Math.max(12, q.s * 0.045)) + 'px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText('DUST ' + c.sp.filter(s => s.hp > 0).length + ' \u00b7 WOBBLE', q.x0 + 6, q.y0 + q.s * 0.055);
      g.fillStyle = '#d9d4cc'; g.fillRect(q.x0 + 6, my, mw, 10); g.fillStyle = J.wob > 0.6 ? RED : YEL; g.fillRect(q.x0 + 6, my, mw * clamp(J.wob, 0, 1), 10); g.strokeRect(q.x0 + 6, my, mw, 10);
      if (J.down) { const x = X(J.down.u), y = Y(J.down.v); g.fillStyle = WAL; g.fillRect(x - 3, y, 6, 34); g.fillStyle = '#f3e6c0'; g.beginPath(); g.arc(x, y, 15, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); } } };
  // ---------- 5 MIX THE PAINT (studio): add drops until your pot matches the target, then TRY IT ----------
  const PIG = { R: ['RED', [0.93, 0.19, 0.07]], Y: ['YELLOW', [1, 0.85, 0.15]], B: ['BLUE', [0.12, 0.3, 0.75]], W: ['WHITE', [0.97, 0.97, 0.96]], K: ['BLACK', [0.13, 0.12, 0.11]] };
  const MIXES = [['ORANGE', { R: 1, Y: 1 }], ['GREEN', { B: 1, Y: 1 }], ['PINK', { R: 1, W: 2 }], ['SKY BLUE', { B: 1, W: 2 }], ['GREY', { W: 2, K: 1 }], ['BROWN', { R: 1, Y: 1, B: 1 }], ['LIME', { Y: 2, B: 1 }], ['PEACH', { R: 1, Y: 1, W: 2 }], ['NAVY', { B: 2, K: 1 }], ['OLIVE', { Y: 2, K: 1 }]];
  const mixRGB = m => { let n = 0; const s = [0, 0, 0]; for (const k in m) { if (!m[k]) continue; n += m[k]; for (let i = 0; i < 3; i++) s[i] += m[k] * Math.log(PIG[k][1][i]); } return n ? s.map(v => Math.exp(v / n)) : null; };
  const css = c => 'rgb(' + c.map(v => Math.round(clamp(v, 0, 1) * 255)).join(',') + ')';
  const ratio = m => { const n = Object.values(m).reduce((a, b) => a + b, 0) || 1; return Object.fromEntries(Object.keys(PIG).map(k => [k, (m[k] || 0) / n])); };
  const MXT = 25;
  GD.mix = { S: true, panel: true, shot: () => [toW(-6, 1.0, -3, true), 2.4, 1.6, 0.6, 2.0, 0, 5],
    begin() { goRoom(-6, -1.4, Math.PI, true); J.list = [...pickN(MIXES.slice(0, 4), 2), ...pickN([MIXES[4], MIXES[6], MIXES[8], MIXES[9]], 2), MIXES[5], MIXES[7]].map(([n, r]) => ({ n, r })); J.ci = 0; J.cueT = MXT; J.wait = 0.4; J.m = {}; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('MIX THE PAINT', goldR()) + body(doneMsg('SIX COLOURS, SPOT ON')) + tipBar('THE PAINTER IS DELIGHTED. QUIETLY.')); return; }
      const mine = mixRGB(J.m), drops = Object.keys(PIG).flatMap(k => Array(J.m[k] || 0).fill(k)), SH = wide() ? 64 : 96;
      const sw = (lab, bg, inner) => '<div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:4px"><span style="font-size:11px;font-weight:900">' + lab + '</span><div style="height:' + SH + 'px;border:2px solid #201e1d;background:' + bg + ';display:flex;align-items:flex-end;flex-wrap:wrap;gap:3px;padding:4px;box-sizing:border-box">' + (inner || '') + '</div></div>';
      showPanel(panelHead('MIX THE PAINT \u00b7 ' + c.n + ' \u00b7 ' + nOf(), goldR()) + body('<div style="display:flex;gap:8px;flex:none">' + sw('TARGET \u00b7 ' + c.n, css(mixRGB(c.r))) + sw('YOUR MIX \u00b7 ' + drops.length + ' / 8 DROPS', mine ? css(mine) : 'repeating-linear-gradient(45deg,#f3f2f2 0 8px,#e7e4dc 8px 16px)', drops.map(k => '<span style="width:12px;height:12px;border:2px solid #201e1d;background:' + css(PIG[k][1]) + '"></span>').join('')) + '</div>' + timeRow
        + '<div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px;flex:none">' + Object.keys(PIG).map(k => '<button data-p="' + k + '" style="' + BTN + ';padding:4px 6px;font-size:12px;border-top:14px solid ' + css(PIG[k][1]) + '">' + PIG[k][0] + '</button>').join('') + '</div>'
        + '<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:6px;flex:none"><button data-clear style="' + BTN + '">CLEAR</button><button data-try style="' + BTN + ';background:#ec3013;color:#fff">TRY IT</button></div>') + tipBar('TAP THE POTS TO ADD DROPS \u00b7 MATCH THE TARGET \u00b7 TRY IT'));
      PANEL.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => this.add(b.dataset.p); }); PANEL.querySelector('[data-clear]').onclick = () => { J.m = {}; blip(); this.draw(); }; PANEL.querySelector('[data-try]').onclick = e => this.tryIt(e.currentTarget); J.idle = 0; J.hinted = false; },
    add(k) { if (!J || J.wait > 0) return; const n = Object.values(J.m).reduce((a, b) => a + b, 0); if (n >= 8) { okTip('THE POT IS FULL \u00b7 CLEAR IT OR TRY IT'); return; } J.m[k] = (J.m[k] || 0) + 1; tone(600 + n * 60, 0.03, 0.1, 'triangle'); this.draw(); },
    tryIt(el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; if (!Object.values(J.m).some(Boolean)) { okTip('ADD SOME DROPS FIRST'); return; }
      const a = ratio(J.m), b = ratio(c.r), ks = Object.keys(PIG);
      if (ks.every(k => Math.abs(a[k] - b[k]) < 0.02)) { addGold(5); ding(); goodBtn(el); okTip('SPOT ON \u00b7 ' + c.n); J.wait = 0.9; setTimeout(() => this.next(), 800); return; }
      const k = ks.slice().sort((p, q) => Math.abs(a[q] - b[q]) - Math.abs(a[p] - b[p]))[0]; shake(el); missOne(a[k] > b[k] ? 'NOT QUITE \u00b7 TOO MUCH ' + PIG[k][0] : 'NOT QUITE \u00b7 IT NEEDS MORE ' + PIG[k][0]); },
    next() { if (!J || J.g !== 'mix') return; J.m = {}; roundNext(this, 'mix', MXT); },
    tick(dt) { roundTick(this, dt, MXT, 'TOO SLOW \u00b7 THE PAINT SKINNED OVER', () => { const c = J.list[J.ci], k = Object.keys(c.r).find(q => (J.m[q] || 0) < c.r[q]); return k ? '[data-p="' + k + '"]' : '[data-try]'; }); } };
  // ---------- 6 PAINT BY NUMBERS (studio): pick a number, paint every square with that number ----------
  const PBT = 40, PICS = [['FOX', ['#9fc4e0', '#e07a1f', '#f3f2f2', '#201e1d'], ['122111111221', '122211112221', '122222222221', '122422224221', '122222222221', '112233332211', '111233332111', '111123321111', '111113311111', '111114411111']],
    ['SAILBOAT', ['#9fc4e0', '#f3f2f2', '#ec3013', '#2e4a6b', '#ffd23a'], ['111111111551', '111112111551', '111112211111', '111112221111', '111112222111', '111112222211', '111112111111', '133333333331', '113333333311', '444444444444']],
    ['THE CASTLE', ['#9fc4e0', '#9aa0a6', '#201e1d', '#2f7d5a', '#ec3013'], ['111115511111', '111112111111', '212111111212', '222111111222', '222121212222', '222222222222', '232222222232', '222223322222', '222223322222', '444444444444']]];
  GD.pbn = { S: true, panel: true, shot: () => [toW(-6, 1.75, 4.0, true), 2.2, 2.0, 0.25, 2.0, 0, 5],
    begin() { goRoom(-6, 5.6, Math.PI, true); J.list = shuffle(PICS).map(([n, pal, rows]) => ({ n, pal, rows, done: rows.map(r => [...r].map(() => 0)) })); J.ci = 0; J.cueT = PBT; J.wait = 0.4; J.sel = 1; J.down = null; J.flash = null; snapK = true; this.draw(); },
    left(c, k) { let n = 0; c.rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (+r[x] === k && !c.done[y][x]) n++; }); return n; },
    draw() { const c = J.list[J.ci]; if (!c) { showPanel(panelHead('PAINT BY NUMBERS', goldR()) + body(doneMsg('THREE PICTURES, NO SMUDGES')) + tipBar('FRAME THEM. NO, REALLY.')); return; }
      showPanel(panelHead('PAINT BY NUMBERS \u00b7 ' + c.n + ' \u00b7 ' + nOf(), goldR()) + body(cvTag('6/5') + timeRow + '<div style="display:grid;grid-template-columns:repeat(' + c.pal.length + ',minmax(0,1fr));gap:6px;flex:none">' + c.pal.map((col, i) => { const k = i + 1, on = J.sel === k; return '<button data-pal="' + k + '" style="' + BTN + ';padding:4px 6px;display:flex;gap:6px;align-items:center;' + (on ? 'background:#201e1d;color:#ffd23a' : '') + '"><span style="width:22px;height:22px;flex:none;border:2px solid ' + (on ? '#ffd23a' : '#201e1d') + ';background:' + col + '"></span>' + (this.left(c, k) ? k : '\u2713') + '</button>'; }).join('') + '</div>') + tipBar('PICK A NUMBER \u00b7 PAINT EVERY SQUARE WITH THAT NUMBER'));
      PANEL.querySelectorAll('[data-pal]').forEach(b => { b.onclick = () => { J.sel = +b.dataset.pal; blip(); this.draw(); }; });
      const cv = PANEL.querySelector('[data-cv]'); drag(cv, e => { J.down = 1; this.at(cv, e, true); }, e => this.at(cv, e, false)); J.idle = 0; J.hinted = false; },
    grid(w, h) { const cs = Math.min(w / 12.4, h / 10.4); return { cs, ox: (w - 12 * cs) / 2, oy: (h - 10 * cs) / 2 }; },
    at(cv, e, tap) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; J.idle = 0; const r = cv.getBoundingClientRect(), q = this.grid(r.width, r.height), x = Math.floor((e.clientX - r.left - q.ox) / q.cs), y = Math.floor((e.clientY - r.top - q.oy) / q.cs);
      if (x < 0 || y < 0 || x >= 12 || y >= 10 || c.done[y][x]) return; const d = +c.rows[y][x];
      if (d === J.sel) { c.done[y][x] = 1; if (Math.random() < 0.5) tone(900 + d * 80, 0.02, 0.05, 'triangle'); if (!this.left(c, d)) { ding(); const b = PANEL.querySelector('[data-pal="' + d + '"]'); if (b && b.lastChild) b.lastChild.textContent = '\u2713'; }
        if (c.done.every(rw => rw.every(Boolean))) { addGold(5); okTip('A FINE ' + c.n); J.wait = 1.0; J.down = null; setTimeout(() => this.next(), 900); } }
      else if (tap) { J.flash = { x, y, t: 0.5 }; missOne('WRONG NUMBER \u00b7 THAT SQUARE IS A ' + d); } },
    next() { if (!J || J.g !== 'pbn') return; J.down = null; J.sel = 1; roundNext(this, 'pbn', PBT); },
    tick(dt) { if (J.flash && (J.flash.t -= dt) <= 0) J.flash = null; roundTick(this, dt, PBT, 'TOO SLOW \u00b7 THE PAINT DRIED ON THE BRUSH', () => { const c = J.list[J.ci]; if (this.left(c, J.sel)) return '[data-cv]'; const k = c.pal.findIndex((_, i) => this.left(c, i + 1)) + 1; return k ? '[data-pal="' + k + '"]' : null; }); this.render(); },
    render() { const f = fitCv(PANEL.querySelector('[data-cv]')), c = J.list[J.ci]; if (!f || !c) return; const { g, w, h } = f, q = this.grid(w, h); g.fillStyle = CREAM; g.fillRect(0, 0, w, h); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 ' + Math.round(q.cs * 0.48) + 'px Archivo, sans-serif';
      for (let y = 0; y < 10; y++) for (let x = 0; x < 12; x++) { const d = +c.rows[y][x], X0 = q.ox + x * q.cs, Y0 = q.oy + y * q.cs;
        if (c.done[y][x]) { g.fillStyle = c.pal[d - 1]; g.fillRect(X0, Y0, q.cs + 0.5, q.cs + 0.5); } else { g.fillStyle = d === J.sel ? '#fff4c2' : PAPER; g.fillRect(X0 + 0.5, Y0 + 0.5, q.cs - 1, q.cs - 1); g.fillStyle = d === J.sel ? INK : '#8d877d'; g.fillText(String(d), X0 + q.cs / 2, Y0 + q.cs / 2 + 1); } }
      g.strokeStyle = INK; g.lineWidth = 2; g.strokeRect(q.ox, q.oy, 12 * q.cs, 10 * q.cs);
      if (J.flash) { g.strokeStyle = RED; g.lineWidth = 3; g.strokeRect(q.ox + J.flash.x * q.cs + 1.5, q.oy + J.flash.y * q.cs + 1.5, q.cs - 3, q.cs - 3); } g.textBaseline = 'alphabetic'; g.textAlign = 'left'; } };
  // ================= PRIZES (gallery-themed) =================
  const SUIT = { outfit: 'coat', torso: ['#f3f2f2', '#2e86b8', '#201e1d'], name: 'ARTIST SMOCK' };
  const GIFT = { suit: 'An ARTIST SMOCK, your size. Paint on it. That is what it is for.', painting: 'YOUR FIRST PAINTING, framed. Take it home. Hang it straight.' };
  function giveGift() { save.setStat('gahClears', save.stat('gahClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('gahSuit', false)) { save.setStat('gahSuit', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === SUIT.name)) save.setStat('tailorOutfits', [...list, SUIT]); save.setOutfit(SUIT); wear && wear(SUIT); return 'suit'; }
    if (nd >= 2 && !save.stat('gahPainting', false)) { save.setStat('gahPainting', true); save.give('myPainting'); return 'painting'; }
    if (nd >= GAMES.length && !save.stat('gahAll', false)) { save.setStat('gahAll', true); save.give('goldFrame'); save.addGold(60); return 'trophy'; } return null; }
  const allThree = () => GAMES.every(q => K.stars(q.k) >= 3);
  function brushCheck(then, T = T_OW) { if (!allThree() || save.stat('gahBrush', false)) { then && then(); return false; } save.setStat('gahBrush', true); save.addRelic('firstBrush'); brush.visible = true; ding();
    sayTo(T, [(T === T_PT ? ptLn : owLn)('Three stars on every job. Take THE FIRST BRUSH. Meru\u2019s first painting was made with it.')], () => { toast('RELIC \u00b7 THE FIRST BRUSH', 2.6); then && then(); }); return true; }
  function useItem(id) { if (id === 'myPainting' && save.count('myPainting')) { toast('YOUR FIRST PAINTING \u00b7 IT WAITS FOR YOUR HOME', 2.4); return true; } if (id === 'goldFrame' && save.count('goldFrame')) { toast('THE GOLDEN FRAME \u00b7 SIX FOR SIX AT THE GALLERY', 2.4); return true; } return false; }
  // ================= run a job =================
  const INTRO = { hang: 'Hang it straight. Drag the frame until the bubble sits in the green. Six frames.', fake: 'Spot the fake. Two match the catalogue, one does not. Tap the fake. Eight walls.',
    sell: 'Sell a painting. Find the one that fits the wish and the budget. Then take or ask.', dust: 'Dust the sculptures. Wipe off every speck. Too fast and it wobbles.',
    mix: 'Mix the paint. Add drops until your pot matches the target. Then TRY IT. Six colours.', pbn: 'Paint by numbers. Pick a number, paint every square with it. Three pictures.' };
  const DONE = { hang: 'Six frames, all level. The wall looks calmer already.', fake: 'Eight fakes caught. Somebody out there is busy with a brush.', sell: 'Six sold, six happy buyers. Good gaps on the walls.',
    dust: 'Spotless. The stone fox looks almost pleased.', mix: 'Six colours, spot on. I may let you near my dot.', pbn: 'Three pictures, no smudges. Frame them. No, really.' };
  const nextOf = (list = GAMES) => { const d = done(), n = list.find(q => !d[q.k]); return (n || list.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const inLobby = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inStudio = P => !!P && Math.abs(P.x - SOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  let introT = 0; function startGame(g) { if (busy) return; busy = 'intro'; introT = 0; const T = inStudio(lastP) ? T_PT : T_OW; sayTo(T, [(T === T_PT ? ptLn : owLn)(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('gahVisits', save.stat('gahVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], t: 0, S: !!GD[g].S }; busy = 'job'; ding(); fade(() => GD[g].begin()); }
  function finishGame() { if (!J || busy !== 'job') return; const g = J.g, S = J.S, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold; J.off && J.off(); J.off = null;
    const d = { ...done() }; d[g] = true; save.setStat('gahDone', d); save.setStat('gahLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); hideCard(); ARW.style.display = 'none';
    const T = S ? T_PT : T_OW, sl = S ? ptLn : owLn;
    const say = () => { const L1 = [sl(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift === 'trophy') L1.push(sl(S ? 'All six. The GOLDEN FRAME is yours, with 60 gold. The owner wants a word downstairs.' : 'All six. The GOLDEN FRAME is yours, with 60 gold. Stay a minute. I need a word.')); else if (gift) L1.push(sl(GIFT[gift]));
      (S ? KS : K).finish(g, stars, gold, first); for (let k = 0; k < 4; k++) tone(1200 + k * 200, 0.02, 0.06, 'triangle', k * 0.06);
      sayTo(T, L1, () => { if (busy === 'end') { busy = null; J = null; } brushCheck(null, T); }); };
    fade(() => { cleanup(); if (S) goRoom(0, -4.6, Math.PI, true); else goRoom(0, -4.4, Math.PI); endS = S; snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 40000); }
  let endS = false;
  function cleanup() { if (J) { J.off && J.off(); J.off = null; J.down = null; } hidePanel(); hideCard(); ARW.style.display = 'none'; owner.position.set(OW0[0], 0, OW0[1]); owner.rotation.y = OW0[2]; painter.position.set(PT0[0], 0, PT0[1]); painter.rotation.y = PT0[2]; }
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
  const ringAt = (p, S) => GAMES.find(q => !!q.S === !!S && nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearOw = p => nearL(p, 0, -5, 2.4), atStairs = p => nearL(p, -8.4, 6.4, 1.5), nearPt = p => nearL(p, 0, -5.2, 1.8), nearSc = p => nearL(p, SC0[0], SC0[1] + 1.2, 1.6), atDoorS = p => nearL(p, 0, 9.0, 1.1), atDot = p => nearL(p, 2.4, -8.6, 1.4);
  const sceneReady = () => save.stat('gahAll', false) && !save.stat('gahScene', false);
  function prompt(P) { if (busy) return null;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atStairs(p)) return 'STAIRS \u00b7 UP TO THE STUDIOS';
      if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearOw(p)) return sceneReady() ? 'TALK \u00b7 GALLERY OWNER \u00b7 A WORD' : 'TALK \u00b7 GALLERY OWNER'; return null; }
    if (inStudio(P)) { const p = toS(P), r = ringAt(p, true); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (atDoorS(p)) return 'STAIRS \u00b7 DOWN TO THE GALLERY';
      if (nearPt(p)) return 'TALK \u00b7 PAINTER'; if (nearSc(p)) return 'TALK \u00b7 SCULPTOR'; if (atDot(p)) return 'LOOK \u00b7 THE DOT'; return null; }
    return null; }
  let talkO = save.stat('gahTalked', 0), talkP = save.stat('gahTalkedP', 0), talkS = 0;
  const OW_HI = ['Back to work? The frames are crooked again. They are always crooked again.', 'Look with your eyes, not your paws. Unless you are dusting.', 'The painter upstairs moved the dot. Do not mention it.'];
  function oMenu() { const first = !talkO; talkO++; save.setStat('gahTalked', talkO); if (brushCheck()) return;
    const ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf()) }, { text: 'PICK A JOB', pick: () => sayTo(T_OW, [{ ...owLn('Which job? The last two are upstairs in the studios.'), choices: [...GAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase() + (q.S ? ' \u00b7 STUDIOS' : ''), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) }];
    if (sceneReady()) ch.push({ text: 'YOU WANTED A WORD?', pick: () => sceneCams() });
    ch.push({ text: 'WHO BUYS THIS ART?', pick: () => sayTo(T_OW, [owLn('VAX, mostly. A painting a week. They give them away as gifts.')]) });
    if (save.stat('gahScene', false)) ch.push({ text: 'THE VAX PAINTINGS?', pick: () => sayTo(T_OW, [owLn('A tiny hole in each canvas, a lens behind it. Both families hang them proudly.')]) });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_OW, [owLn('Goodbye. Look with your eyes on the way out.')]) });
    sayTo(T_OW, [{ ...owLn(first ? 'Gallery owner. Four jobs down here, two up in the studios. Paws off the paint.' : sceneReady() ? 'There you are. Six for six. Stay a minute.' : OW_HI[(talkO - 2) % OW_HI.length]), choices: ch }]); }
  function sceneCams() { busy = 'scene'; save.setStat('gahScene', true);
    const end = () => { busy = null; save.setStat('storyGalleryCams', true); toast('STORY \u00b7 VAX PAINTINGS HIDE CAMERAS', 2.6); brushCheck(); };
    sayTo(T_OW, [owLn('Level frames, caught fakes, clean stone, true colours. You have an eye.'), { ...owLn('VAX buys a painting a week as gifts. Salt HQ has three. Pepper HQ has four.'), choices: [
      { text: 'WHY GIVE ART AWAY?', pick: () => sayTo(T_OW, [owLn('Two came back for reframing. A tiny hole in each canvas. A camera lens behind it.')], end) },
      { text: 'I WILL LOOK INTO IT.', pick: () => sayTo(T_OW, [owLn('Look behind the canvas. A tiny lens. Both families are watched. Quietly, please.')], end) }] }]); }
  const PT_HI = ['Back again? Mind the dot. It is wet. It is always wet.', 'I mixed a new black today. It looks like the old black. I know the difference.', 'The sculptor hums when she carves. I paint to the humming.'];
  function pMenu() { const first = !talkP; talkP++; save.setStat('gahTalkedP', talkP); if (brushCheck(null, T_PT)) return;
    sayTo(T_PT, [{ ...ptLn(first ? 'Studio one. I paint the dot. Two jobs up here: mixing and numbers.' : PT_HI[(talkP - 2) % PT_HI.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf(SGAMES)) },
      { text: 'PICK A JOB', pick: () => sayTo(T_PT, [{ ...ptLn('Which one?'), choices: [...SGAMES.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'WHAT IS IT CALLED?', pick: () => sayTo(T_PT, [ptLn('Dot. VAX offered a fortune for it. I said not until it is finished.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_PT, [ptLn('Goodbye. Do not touch the dot.')]) }] }]); }
  const SC_LINES = ['Studio two. I carve foxes from stone. Hold still. No, you moved.', 'Stone is patient. I am not. We get along.', 'Dust my foxes downstairs gently. They are older than they look.', 'VAX wants a stone fox for every lift. Every lift. Odd.'];
  const upStairs = () => { tone(660, 0.04, 0.2, 'triangle'); fade(() => goRoom(0, 7.6, Math.PI, true)); setTimeout(() => KS.chime(), 500); };
  const downStairs = () => { tone(520, 0.04, 0.2, 'triangle'); fade(() => goRoom(-8.0, 6.4, Math.PI / 2)); };
  function talk(P) { lastP = P; if (busy === 'job' || busy === 'scene') return true; if (busy) return false;
    if (inLobby(P)) { const p = toL(P), r = ringAt(p, false); if (r) { startGame(r.k); return true; } if (atStairs(p)) { upStairs(); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf()); return true; } if (nearOw(p)) { tone(1320, 0.05, 0.5); oMenu(); return true; } return false; }
    if (inStudio(P)) { const p = toS(P), r = ringAt(p, true); if (r) { startGame(r.k); return true; } if (atDoorS(p)) { downStairs(); return true; } if (nearPt(p)) { tone(1320, 0.05, 0.5); pMenu(); return true; }
      if (nearSc(p)) { sayTo({ key: 'gallerySculptor', name: 'Sculptor', role: 'STUDIO 2', obj: sculptor, r: 4 }, [{ who: 'Sculptor', role: 'STUDIO 2', text: SC_LINES[talkS++ % SC_LINES.length] }]); return true; }
      if (atDot(p)) { toast('DOT \u00b7 THREE YEARS \u00b7 NOT FOR SALE', 2.4); return true; } return false; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, spawned = !/[?&]spawn=(gallery|studio)(&|$)/.test(location.search), spawnT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt;
    if (!spawned && P && (spawnT += dt) > 0.8) { spawned = true; goRoom(0, 7.6, Math.PI, /spawn=studio/.test(location.search)); }
    const inL = inLobby(P), inS = inStudio(P); G.visible = inL || (busy === 'job' && !!J && !J.S); SG.visible = inS || (busy === 'job' && !!J && J.S);
    if ((dayCheck -= dt) <= 0) { dayCheck = 0.5; if (inL) { gframe.visible = !!save.stat('gahAll', false); brush.visible = !!save.stat('gahBrush', false); } if (inS) { const h = hour(), n = h >= 20 || h < 6, dusk = !n && (h >= 18 || h < 7.5); skyM.color.set(n ? '#2a3450' : dusk ? '#f0c08a' : '#e8f3ff'); } }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'job' && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('gallery job: ' + (e && e.stack || e)); stop(); } }
    if (busy === 'job' && J && PANEL.style.display === 'none' && !fading && J.list && J.ci < J.list.length) GD[J.g].draw();
    for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; if (!busy) m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
    if (G.visible) brush.rotation.y = 0.4 + Math.sin(t * 0.8) * 0.15;
    if (SG.visible) { const p = toS(P); kit.animFox(sculptor, dt, 0, false); if (!busy && nearL(p, sculptor.position.x, sculptor.position.z, 3.5)) turnTo(sculptor, Math.atan2(p.x - sculptor.position.x, p.z - sculptor.position.z), dt, 3); else { turnTo(sculptor, SC0[2], dt, 2); armUp(sculptor, 1, 0.5 + Math.abs(Math.sin(t * 5)) * 0.35, -1.1); } }
    K.tick(dt, toL(P), { inShop: inL, busy: !!busy, near: 0, talking: false, clear: endClear > 0 && !endS ? [0, -4.4, 2.6] : null });
    KS.tick(dt, toS(P), { inShop: inS, busy: !!busy, near: 0, talking: false, clear: endClear > 0 && endS ? [0, -4.6, 2.6] : null }); }
  const API = { group: G, studio: SG, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? 'job' : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { gallery: [OX, LZ + 7.6, Math.PI, LY], studio: [SOX, LZ + 7.6, Math.PI, LY] }, finish: () => finishGame(), scene: sceneCams, up: upStairs, down: downStairs, owner, painter, sculptor,
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); PANEL.remove(); ARW.remove(); K.dispose(); KS.dispose(); } };
  window.__gallery = API; return API;
}
