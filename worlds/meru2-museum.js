// MERU 2.0 — s56 TOWN 2 INTERIOR 14: MERU HISTORY MUSEUM [meruMuseum] (f 172..192 × -136..-100, front door W (172, -118), trail door E (192, -112)).
// PROF. QUILL (Ben's pick): scatter-brained historian, glasses always on her head, a pile of books in her arms.
// GAME 1 · THE BIG EVENING (one visit, all steps): 1 PUZZLE (pot shards back on the pot) · 2 DUST + POLISH the stone king · 3 SPOT THE FAKE ×3 ·
// 4 LABEL IT (plaques onto the 8 Gates cases) · 5 HANG THE PAINTING (level bubble) · 6 NIGHT AT THE MUSEUM (torch, find 5 things that moved).
// GAME 2 · THE TOUR (Ben's idea): lead 4 visitors to 4 exhibits, read the plaque on the way, answer their question at each stop. GENTLE: no fail.
// Prizes in turn: CURATOR OUTFIT (tweed jacket + monocle) → ANCIENT COIN (+25 % gold here) → FOSSIL (Home shelf) → DONOR PLAQUE → +20 gold.
// Room: rotunda + painted-sky dome over the FOXASAURUS REX, Armour Hall, Gallery of Kings, The 8 Gates hall, Old Meru model, Space Hall (Skyfox 1),
// gift shop, restoration workshop (staff only), info desk, tour podium, curator's stand, Friends of the Museum plaque.
// s72 INTERIOR POLISH 14: shopKit (Quill = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board EVENING + TOUR; badge), NOW HIRING by the front door,
// ONE-box menu with choices, 1-box lines, hint hand, touch radius 44, portrait lens, cameras clamped inside the room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildMuseum({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false }) {
  const X0 = 172.4, X1 = 191.6, Z0 = -135.6, Z1 = -100.4, CX = 182, CZ = -118, CEIL = 7.5, TOPW = 0.92;
  const G = new THREE.Group(); G.name = 'museum'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const putM = (geo, m4, hex) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m4); const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => putM(geo, new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)), hex);
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, putM, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 10, 7), x, y, z, hex, 0, 0, 0, sx, sy, sz),
      seg: (a, b, r, hex) => { const d = b.clone().sub(a), L = d.length(); putM(new THREE.CylinderGeometry(r, r * 0.85, L, 8), new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize()), V(1, 1, 1)), hex); } }; };
  const R0 = mk(), RG = mk(), { box, cyl, sph, seg } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c, fn }; return t; };
  const redraw = (t, fn) => { const c = t.userData.c; fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; };
  const rect = (a, b, c2, d) => { const o = { f: [a, b, c2, d] }; cols.push(o); return o; };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', BLUE = '#2e86b8', GREEN = '#3f9a5e', BRASS = '#c9a24a', CREAM = '#efe6d2', WOOD = '#8a6440', DARK = '#3d3b3a', STEEL = '#9aa3ab', GOLD = '#e6b45a', WINE = '#6e2a22', PLASTER = '#ece4d4', BONE = '#e8dcc0', STONE = '#cfcac3';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 10) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const label2 = (t1, t2, bg, fg, w = 256, h = 112) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, t1, 16, H * 0.36, W - 32, 44); fitTxt(g, t2, 16, H * 0.72, W - 32, 22, 800); });
  const plane = (map, w, h, x, y, z, ry = 0, par = G, rx = 0, tr = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: tr, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); par.add(m); return m; };
  const plane2 = (map, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.MeshBasicMaterial({ map }); for (const k of [0, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.y = ry + k * Math.PI; p.position.set(x + Math.sin(ry) * (k ? -0.006 : 0.006), y, z + Math.cos(ry) * (k ? -0.006 : 0.006)); par.add(p); } };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, s = 14) => new THREE.CylinderGeometry(a, b, h, s), Sp = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b), Co = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const subMesh = R => new THREE.Mesh(R.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  // fox head on a canvas (portraits, coins)
  function foxHead(g, cx, cy, s, fur, ears = true) { g.fillStyle = fur; if (ears) { for (const k of [-1, 1]) { g.beginPath(); g.moveTo(cx + k * 0.25 * s, cy - 0.2 * s); g.lineTo(cx + k * 0.48 * s, cy - 0.78 * s); g.lineTo(cx + k * 0.05 * s, cy - 0.38 * s); g.fill(); } }
    if (ears) { g.beginPath(); g.moveTo(cx - 0.55 * s, cy - 0.3 * s); g.lineTo(cx + 0.55 * s, cy - 0.3 * s); g.lineTo(cx, cy + 0.55 * s); g.fill(); } else { g.beginPath(); g.arc(cx, cy, 0.48 * s, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#fbf8f0'; g.beginPath(); g.moveTo(cx - 0.28 * s, cy + 0.02 * s); g.lineTo(cx + 0.28 * s, cy + 0.02 * s); g.lineTo(cx, cy + 0.55 * s); g.fill();
    g.fillStyle = INK; for (const k of [-1, 1]) { g.beginPath(); g.arc(cx + k * 0.2 * s, cy - 0.08 * s, 0.06 * s, 0, Math.PI * 2); g.fill(); } g.beginPath(); g.arc(cx, cy + 0.5 * s, 0.06 * s, 0, Math.PI * 2); g.fill(); }
  // ================= FLOOR (marble) + rotunda medallion =================
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#ece4d4' : '#d6ccb8'; g.fillRect(i * 64, j * 64, 64, 64); g.strokeStyle = 'rgba(120,110,95,0.25)'; g.lineWidth = 1; g.beginPath(); g.moveTo(i * 64 + 8, j * 64 + 50); g.bezierCurveTo(i * 64 + 26, j * 64 + 30, i * 64 + 40, j * 64 + 44, i * 64 + 60, j * 64 + 12); g.stroke(); }
      g.strokeStyle = 'rgba(32,30,29,0.45)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(W, i * 64); g.stroke(); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 3.2, (Z1 - Z0) / 3.2); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, (Z0 + Z1) / 2); G.add(f);
    const med = CT(512, 512, (g, W) => { const c = W / 2; g.clearRect(0, 0, W, W); g.fillStyle = INK; g.beginPath(); g.arc(c, c, 250, 0, Math.PI * 2); g.fill(); g.fillStyle = '#d6ccb8'; g.beginPath(); g.arc(c, c, 236, 0, Math.PI * 2); g.fill(); g.fillStyle = WINE; g.beginPath(); g.arc(c, c, 222, 0, Math.PI * 2); g.fill(); g.fillStyle = '#ece4d4'; g.beginPath(); g.arc(c, c, 196, 0, Math.PI * 2); g.fill();
      g.fillStyle = GOLD; g.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, r = i % 2 ? 70 : 190; g.lineTo(c + Math.sin(a) * r, c - Math.cos(a) * r); } g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(c, c, 52, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD; g.font = '900 64px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', c, c + 4); });
    plane(med, 10, 10, CX, 0.075, CZ, 0, G, -Math.PI / 2, true); }
  // ================= WALLS (ink skirting, wine wainscot, gold rail, plaster) + ceiling with the dome hole =================
  const wall = (len, x, z, ry, h = CEIL) => { box(len, 0.3, 0.07, INK, x, 0.15, z, ry); box(len, 1.2, 0.06, WINE, x, 0.9, z, ry); box(len, 0.1, 0.09, GOLD, x, 1.55, z, ry); box(len, h - 1.6, 0.06, PLASTER, x, 1.6 + (h - 1.6) / 2, z, ry); box(len, 0.25, 0.1, '#d9cfbd', x, h - 0.15, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(X1 - X0, CX, Z1 - 0.03, 0);
  for (const [a, b] of [[Z0, -119.4], [-116.6, Z1]]) wall(b - a, X0 + 0.03, (a + b) / 2, Math.PI / 2);
  for (const [a, b] of [[Z0, -113.4], [-110.6, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  box(1.4, 0.02, 2.6, RED, X0 + 0.8, 0.08, -118); box(1.4, 0.02, 2.6, RED, X1 - 0.8, 0.08, -112);
  plane(label('WELCOME · MERU HISTORY MUSEUM', INK, YEL, 1024, 64, 40), 4.6, 0.3, X0 + 0.07, 3.3, -118, Math.PI / 2);
  { const sh = new THREE.Shape(); sh.moveTo(X0, Z0); sh.lineTo(X1, Z0); sh.lineTo(X1, Z1); sh.lineTo(X0, Z1); sh.lineTo(X0, Z0); const hole = new THREE.Path(); hole.absarc(CX, CZ, 5.2, 0, Math.PI * 2, false); sh.holes.push(hole);
    const cm = new THREE.Mesh(new THREE.ShapeGeometry(sh, 32), new THREE.MeshLambertMaterial({ color: '#d9cfbd' })); cm.rotation.x = Math.PI / 2; cm.position.y = CEIL; G.add(cm); }
  R0.put(new THREE.TorusGeometry(5.2, 0.14, 6, 48), CX, CEIL - 0.08, CZ, GOLD, 0, Math.PI / 2);
  for (let i = 0; i < 6; i++) { const z = Z0 + 2 + i * 6.4; if (Math.abs(z - CZ) > 5.5) box(X1 - X0, 0.22, 0.18, '#c9bfa9', CX, CEIL - 0.11, z); }
  { const fr = CT(2048, 64, (g, W, H) => { g.fillStyle = CREAM; g.fillRect(0, 0, W, H); g.fillStyle = GOLD; g.fillRect(0, 0, W, 6); g.fillRect(0, H - 6, W, 6); g.fillStyle = INK; g.font = '900 32px Archivo, sans-serif'; g.textBaseline = 'middle'; const s = 'MERU HISTORY MUSEUM  ·  EVERY OLD THING HAS A STORY  ·  '; let x = 12; while (x < W) { g.fillText(s, x, H / 2 + 2); x += g.measureText(s).width; } });
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 1.2, 40, 1, true), new THREE.MeshBasicMaterial({ map: fr, side: THREE.BackSide })); drum.position.set(CX, CEIL + 0.6, CZ); G.add(drum);
    const sky = CT(1024, 512, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1f4f8a'); gr.addColorStop(0.55, '#4f8fd0'); gr.addColorStop(1, '#bfe0f5'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; g.fillStyle = 'rgba(255,255,255,0.85)'; for (let i = 0; i < 16; i++) { const x = r() * W, y = H * (0.45 + r() * 0.4); for (let k = 0; k < 4; k++) { g.beginPath(); g.ellipse(x + k * 26, y - (k % 2) * 10, 40, 18, 0, 0, Math.PI * 2); g.fill(); } }
      g.fillStyle = YEL; g.beginPath(); g.arc(W * 0.3, H * 0.62, 34, 0, Math.PI * 2); g.fill(); g.strokeStyle = YEL; g.lineWidth = 6; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.beginPath(); g.moveTo(W * 0.3 + Math.cos(a) * 44, H * 0.62 + Math.sin(a) * 44); g.lineTo(W * 0.3 + Math.cos(a) * 62, H * 0.62 + Math.sin(a) * 62); g.stroke(); }
      g.fillStyle = GOLD; for (let i = 0; i < 8; i++) { const x = (i + 0.5) / 8 * W, y = H * 0.16; g.beginPath(); for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, rr = k % 2 ? 7 : 20; g.lineTo(x + Math.sin(a) * rr, y - Math.cos(a) * rr); } g.fill(); } g.fillRect(0, H - 12, W, 12); });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(5.2, 40, 14, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ map: sky, side: THREE.BackSide })); dome.scale.y = 0.62; dome.position.set(CX, CEIL + 1.2, CZ); G.add(dome); }
  // ================= ROTUNDA: FOXASAURUS REX on its plinth =================
  box(3.0, 0.5, 7.4, STONE, CX, 0.25, CZ); box(3.1, 0.06, 7.5, INK, CX, 0.52, CZ); rect(180.5, 183.5, -121.7, -114.3);
  const rexL = label('FOXASAURUS REX · 66 MILLION YEARS OLD', INK, '#ffffff', 1024, 64, 34); plane(rexL, 2.8, 0.18, 180.47, 0.27, CZ, -Math.PI / 2); plane(rexL, 2.8, 0.18, 183.53, 0.27, CZ, Math.PI / 2);
  const SPN = new THREE.CatmullRomCurve3([V(CX, 3.75, -121.0), V(CX, 3.0, -119.8), V(CX, 3.15, -118.3), V(CX, 3.05, -116.9), V(CX, 2.55, -115.6), V(CX, 1.75, -114.7), V(CX + 0.5, 1.05, -114.1)]);
  for (let i = 0; i <= 30; i++) { const s = i / 30, p = SPN.getPoint(s), r = 0.17 - s * 0.11; sph(r, BONE, p.x, p.y, p.z, 1, 0.85, 0.75); if (i % 2 === 0 && s > 0.08 && s < 0.6) cyl(0.035, 0.02, 0.28, BONE, p.x, p.y + r + 0.1, p.z); }
  for (let i = 0; i < 7; i++) { const sp = SPN.getPoint(0.18 + i * 0.045), r = 0.72 - Math.abs(i - 2.5) * 0.07; R0.put(new THREE.TorusGeometry(r, 0.045, 6, 18, Math.PI * 1.72), CX, sp.y - r * 0.95, sp.z, BONE, 0, 0, Math.PI * 0.64, 0.95, 1, 1); }
  sph(0.32, BONE, CX, 2.9, -116.9, 1.4, 0.7, 1);
  for (const s of [-1, 1]) { seg(V(CX + s * 0.38, 2.6, -119.9), V(CX + s * 0.46, 2.1, -120.35), 0.045, BONE); cyl(0.02, 0.0, 0.12, BONE, CX + s * 0.46, 2.0, -120.4);
    seg(V(CX + s * 0.45, 2.95, -116.9), V(CX + s * 0.62, 1.75, -116.1), 0.11, BONE); seg(V(CX + s * 0.62, 1.75, -116.1), V(CX + s * 0.62, 0.95, -116.85), 0.08, BONE); seg(V(CX + s * 0.62, 0.95, -116.85), V(CX + s * 0.62, 0.6, -116.45), 0.06, BONE);
    box(0.28, 0.06, 0.4, BONE, CX + s * 0.62, 0.56, -116.25); for (const k of [-1, 0, 1]) cyl(0.025, 0.0, 0.12, BONE, CX + s * 0.62 + k * 0.09, 0.56, -116.0, 6, Math.PI / 2); }
  for (const z of [-119.6, -116.9, -115.0]) { const p = SPN.getPoint(z < -119 ? 0.2 : z < -116 ? 0.47 : 0.72); cyl(0.03, 0.03, p.y - 0.55, INK, CX, 0.55 + (p.y - 0.55) / 2, p.z); }
  const SKULL = new THREE.Group(); { const S = mk(); S.sph(0.36, BONE, 0, 0, 0, 0.9, 0.8, 1.1); S.box(0.34, 0.24, 0.62, BONE, 0, -0.06, -0.5); S.box(0.3, 0.08, 0.56, '#d8cbad', 0, -0.24, -0.42); for (const s of [-1, 1]) { S.put(Co(0.13, 0.32, 4), s * 0.2, 0.32, 0.05, BONE); S.sph(0.09, INK, s * 0.17, 0.06, -0.24); for (let k = 0; k < 4; k++) S.put(Co(0.025, 0.1, 5), s * 0.15, -0.2, -0.3 - k * 0.15, '#fbf8f0', 0, Math.PI); } S.sph(0.06, INK, 0, 0.03, -0.82);
    SKULL.add(subMesh(S)); SKULL.position.set(CX, 3.95, -121.45); G.add(SKULL); }
  // ================= ARMOUR HALL (north-west): 2 guard armours + the stone king statue + weapon wall =================
  function helmet(R, x, y, z) { R.sph(0.2, STEEL, x, y, z, 1, 0.95, 1.05); for (const s of [-1, 1]) R.put(Co(0.08, 0.22, 4), x + s * 0.12, y + 0.2, z, STEEL); R.box(0.3, 0.06, 0.04, INK, x, y - 0.02, z + 0.19); R.box(0.04, 0.16, 0.3, RED, x, y + 0.22, z - 0.02); }
  function armour(x, z, helm) { box(0.9, 0.3, 0.9, STONE, x, 0.15, z); cyl(0.03, 0.03, 1.3, INK, x, 0.95, z); R0.put(Cy(0.3, 0.24, 0.62, 10), x, 1.52, z, STEEL); box(0.5, 0.12, 0.36, BRASS, x, 1.2, z); R0.put(Cy(0.3, 0.36, 0.34, 10), x, 1.0, z, '#7f888f');
    for (const s of [-1, 1]) sph(0.16, STEEL, x + s * 0.34, 1.78, z, 1, 0.7, 1); cyl(0.14, 0.14, 0.02, RED, x, 1.55, z + 0.29, 20, Math.PI / 2);
    cyl(0.32, 0.32, 0.05, WOOD, x - 0.55, 1.2, z + 0.12, 18, Math.PI / 2); cyl(0.12, 0.12, 0.06, BRASS, x - 0.55, 1.2, z + 0.15, 12, Math.PI / 2); cyl(0.025, 0.025, 2.6, WOOD, x + 0.55, 1.4, z); R0.put(Co(0.06, 0.24, 4), x + 0.55, 2.8, z, STEEL);
    if (helm) helmet(R0, x, 2.06, z); rect(x - 0.5, x + 0.5, z - 0.5, z + 0.5); }
  armour(174.6, -133.9, false); armour(180.4, -133.9, true);
  const HELM = new THREE.Group(); { const S = mk(); helmet(S, 0, 0, 0); HELM.add(subMesh(S)); HELM.position.set(174.6, 2.06, -133.9); G.add(HELM); }
  box(0.08, 2.2, 3.6, WOOD, X0 + 0.08, 2.4, -130.6); for (let i = 0; i < 3; i++) { const z = -131.8 + i * 1.2; box(0.05, 0.9, 0.08, '#d9dee3', X0 + 0.16, 2.6, z); box(0.06, 0.06, 0.3, GOLD, X0 + 0.16, 2.1, z); box(0.06, 0.3, 0.06, INK, X0 + 0.16, 1.9, z); }
  for (const s of [-1, 1]) cyl(0.022, 0.022, 3.0, WOOD, X0 + 0.14, 3.0, -130.6, 6, s * 0.55);
  plane(label('ARMOUR OF THE OLD GUARD', INK, '#ffffff', 512, 64, 30), 2.4, 0.3, X0 + 0.14, 3.85, -130.6, Math.PI / 2);
  box(1.5, 0.7, 1.5, STONE, 177.5, 0.35, -133.7); box(1.56, 0.06, 1.56, INK, 177.5, 0.72, -133.7); rect(176.7, 178.3, -134.5, -132.9);
  plane(label('THE FIRST KING OF MERU', INK, '#ffffff', 512, 64, 30), 1.3, 0.16, 177.5, 0.38, -132.94);
  const STONE_LOOK = { fur: '#a9a49a', furDark: '#8a857b', muzzle: '#bdb8ae', snout: '#b5b0a6', chin: '#c2bdb3', fluff: '#c2bdb3', ear: '#77736b', earInner: '#8a857b', leg: '#a9a49a', boot: '#8a857b', paw: '#a9a49a', tailBase: '#8a857b', tailMid: '#a9a49a', tailTip: '#c2bdb3', nose: '#5a564f', ink: '#4a463f' };
  const statue = kit.makeFox({ key: 'msStatue', torso: ['#b0aba1', '#8f8a80', '#6f6a60'], outfit: 'royal', mood: 'neutral', eyes: ['#77736b', '#77736b'], look: STONE_LOOK }); statue.position.set(177.5, 0.72, -133.6); statue.scale.multiplyScalar(1.05); G.add(statue); statue.updateMatrixWorld(true); const SBB = new THREE.Box3().setFromObject(statue);
  { const P = statue.userData && statue.userData.P; if (P && P.sword) P.sword.visible = false; }
  // ================= GALLERY OF KINGS (north-east) =================
  const KINGS = [{ name: 'KING MIGHT', bg: NAVY, robe: RED, fur: '#e07a30' }, { name: 'THE OLD KING', bg: '#3f6a3a', robe: GOLD, fur: '#b0b0b0' }, { name: 'THE SAILOR QUEEN', bg: WINE, robe: BLUE, fur: '#d98a4a' }];
  const HANGK = [{ name: 'QUEEN OF THE LAKE', bg: BLUE, robe: '#f3f2f2', fur: '#c98a4a', x: 185.2 }, { name: 'THE BUILDER KING', bg: '#5a4430', robe: GREEN, fur: '#8a6440', x: 188.8 }];
  const paintTex = o => CT(256, 320, (g, W, H) => { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, o.bg); gr.addColorStop(1, '#201e1d'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = o.robe; g.beginPath(); g.moveTo(40, H); g.lineTo(80, 230); g.lineTo(176, 230); g.lineTo(216, H); g.fill(); g.fillStyle = '#fbf8f0'; g.fillRect(118, 230, 20, 90); foxHead(g, 128, 168, 120, o.fur, true);
    g.fillStyle = GOLD; g.beginPath(); g.moveTo(86, 108); g.lineTo(98, 70); g.lineTo(113, 96); g.lineTo(128, 62); g.lineTo(143, 96); g.lineTo(158, 70); g.lineTo(170, 108); g.fill(); });
  function portrait(o, w = 1.2, h = 1.5) { const g = new THREE.Group(); g.add(mm(Bx(w + 0.18, h + 0.18, 0.08), LM(GOLD)), mm(Bx(w + 0.04, h + 0.04, 0.09), LM('#7a5a2a'))); plane(paintTex(o), w, h, 0, 0, 0.05, 0, g); plane(label(o.name, INK, YEL, 512, 64, 32), 1.0, 0.13, 0, -h / 2 - 0.25, 0.04, 0, g); return g; }
  const PORTS = KINGS.map((o, i) => { const p = portrait(o); p.position.set(X1 - 0.07, 2.6, -133.6 + i * 2.6); p.rotation.y = -Math.PI / 2; G.add(p); return p; });
  const HP = HANGK.map(o => { const pv = new THREE.Group(), inner = portrait(o); inner.position.y = -0.95; pv.add(inner);
    const lvl = new THREE.Group(); lvl.add(mm(Bx(0.56, 0.07, 0.07), LM(YEL)), mm(Bx(0.06, 0.08, 0.08), LM(GREEN))); const bub = mm(Sp(0.026, 10, 6), new THREE.MeshBasicMaterial({ color: '#7be0ff' }), 0, 0.03, 0.04); lvl.add(bub); lvl.position.set(0, 0.88, 0.08); lvl.visible = false; inner.add(lvl);
    cyl(0.03, 0.03, 0.06, BRASS, o.x, 3.6, Z0 + 0.06, 8, Math.PI / 2); G.add(pv); return { o, pv, lvl, bub, a: 0 }; });
  const hangHome = h => { h.pv.position.set(h.o.x, 3.55, Z0 + 0.1); h.pv.rotation.set(0, 0, 0); }, hangLean = h => { h.pv.position.set(h.o.x, 1.8, Z0 + 0.14); h.pv.rotation.set(-0.2, 0, 0); };
  HP.forEach(h => (save.stat('msHung', false) ? hangHome(h) : hangLean(h)));
  box(2.4, 0.45, 0.6, WOOD, 187.4, 0.23, -130.2); box(2.5, 0.06, 0.66, '#5a3e28', 187.4, 0.47, -130.2); rect(186.2, 188.6, -130.5, -129.9);
  plane2(label('GALLERY OF KINGS', RED, '#ffffff', 512, 64, 34), 3.0, 0.38, 187.4, 4.3, -127.6); plane2(label('ARMOUR HALL', INK, '#ffffff', 512, 64, 34), 2.6, 0.33, 177.5, 4.3, -127.6);
  for (const x of [177.5, 187.4]) cyl(0.012, 0.012, CEIL - 4.5, INK, x, 4.5 + (CEIL - 4.5) / 2, -127.6, 4);
  // ================= THE 8 GATES HALL (east wall): one case per world =================
  const WORLDS = [{ w: 'MERU', s: "A GUARD'S SWORD" }, { w: 'KUFA', s: 'A NIGHT LANTERN' }, { w: 'GAYA', s: 'THE TENNIS OPEN', job: 1, hint: 'TENNIS NEEDS A RACKET' }, { w: 'JIDDA', s: 'THE SURF CONTEST', job: 1, hint: 'SURFING NEEDS A BOARD' },
    { w: 'NEBO', s: 'GLIDER RACES', job: 1, hint: 'A GLIDER HAS WINGS' }, { w: 'ZION', s: 'GOLD PANNING', job: 1, hint: 'PANNING NEEDS A PAN' }, { w: 'LUXOR', s: 'A GOLD MASK' }, { w: 'UR', s: 'AN ESPRESSO CUP' }];
  const CASE_X = 190.8, caseZ = i => -125.6 + i * 1.32, glassM = new THREE.MeshLambertMaterial({ color: '#cfe8f0', transparent: true, opacity: 0.22, depthWrite: false });
  const blankFn = (g, W, H) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, W, H); g.strokeStyle = '#cfcac3'; g.setLineDash([10, 8]); g.lineWidth = 4; g.strokeRect(8, 8, W - 16, H - 16); g.setLineDash([]); g.fillStyle = '#9a948c'; g.textBaseline = 'middle'; g.font = '800 22px Archivo, sans-serif'; g.fillText('LABEL HERE', 20, H / 2); };
  const labFn = o => (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = YEL; g.textBaseline = 'middle'; fitTxt(g, o.w, 16, H * 0.36, W - 32, 44); g.fillStyle = '#ffffff'; fitTxt(g, o.s, 16, H * 0.74, W - 32, 22, 800); };
  const SLOTS = WORLDS.map((o, i) => { const z = caseZ(i); box(0.9, 1.0, 1.0, '#2b2a29', CASE_X, 0.5, z); box(0.96, 0.06, 1.06, GOLD, CASE_X, 1.02, z); RG.box(0.86, 0.86, 0.96, '#cfe8f0', CASE_X, 1.48, z); box(0.9, 0.04, 1.0, GOLD, CASE_X, 1.93, z); rect(CASE_X - 0.48, X1, z - 0.52, z + 0.52);
    const tex = CT(256, 112, labFn(o)); plane(tex, 0.7, 0.3, CASE_X - 0.455, 0.72, z, -Math.PI / 2); return { ...o, i, z, tex, p: V(CASE_X - 0.46, 0.72, z), obj: V(CASE_X, 1.35, z), done: true }; });
  { const z = caseZ; box(0.04, 0.5, 0.08, '#d9dee3', CASE_X, 1.35, z(0)); box(0.2, 0.04, 0.06, GOLD, CASE_X, 1.12, z(0)); box(0.04, 0.14, 0.05, INK, CASE_X, 1.04, z(0));
    box(0.18, 0.24, 0.18, BRASS, CASE_X, 1.2, z(1)); box(0.12, 0.18, 0.2, YEL, CASE_X, 1.2, z(1)); cyl(0.0, 0.12, 0.1, BRASS, CASE_X, 1.37, z(1), 4);
    R0.put(new THREE.TorusGeometry(0.13, 0.02, 6, 18), CASE_X, 1.5, z(2), RED, Math.PI / 2, 0, 0); cyl(0.022, 0.022, 0.3, INK, CASE_X, 1.22, z(2)); for (let k = -1; k <= 1; k++) box(0.005, 0.24, 0.005, '#ffffff', CASE_X - 0.01, 1.5, z(2) + k * 0.06);
    box(0.7, 0.025, 0.16, '#f3f2f2', CASE_X, 1.42, z(4)); cyl(0.04, 0.03, 0.5, BLUE, CASE_X + 0.05, 1.38, z(4), 8, Math.PI / 2); box(0.02, 0.12, 0.2, BLUE, CASE_X + 0.28, 1.45, z(4)); cyl(0.02, 0.02, 0.36, INK, CASE_X, 1.2, z(4));
    R0.put(Cy(0.2, 0.15, 0.06, 18), CASE_X, 1.2, z(5), DARK, 0, 0, -0.6); for (let k = 0; k < 5; k++) sph(0.025, YEL, CASE_X - 0.04 + k * 0.01, 1.24 + k * 0.012, z(5) - 0.08 + k * 0.04);
    sph(0.16, GOLD, CASE_X, 1.32, z(6), 0.8, 1.1, 1); for (const s of [-1, 1]) R0.put(Co(0.06, 0.2, 4), CASE_X, 1.5, z(6) + s * 0.1, GOLD); sph(0.03, INK, CASE_X - 0.13, 1.36, z(6) - 0.05); sph(0.03, INK, CASE_X - 0.13, 1.36, z(6) + 0.05);
    cyl(0.14, 0.14, 0.02, '#fbf8f0', CASE_X, 1.12, z(7), 18); cyl(0.07, 0.055, 0.1, '#fbf8f0', CASE_X, 1.18, z(7), 14); cyl(0.06, 0.06, 0.012, '#5a361b', CASE_X, 1.235, z(7), 14); }
  const BOARD = new THREE.Group(); { BOARD.add(mm(Sp(0.3, 14, 8), LM(BLUE)), mm(Bx(0.012, 0.5, 0.05), LM(YEL), -0.03, 0, 0)); BOARD.children[0].scale.set(0.12, 1.0, 0.35); BOARD.position.set(CASE_X, 1.38, caseZ(3)); G.add(BOARD); }
  plane(label('THE 8 GATES · ONE CASE FOR EACH WORLD', RED, '#ffffff', 1024, 96, 46), 7.6, 0.7, X1 - 0.07, 3.0, (caseZ(0) + caseZ(7)) / 2, -Math.PI / 2);
  const TROL = V(188.3, 0.95, -121.3); box(0.8, 0.05, 1.7, STEEL, TROL.x, 0.9, TROL.z); for (const [dx, dz] of [[-0.35, -0.8], [0.35, -0.8], [-0.35, 0.8], [0.35, 0.8]]) { cyl(0.02, 0.02, 0.85, INK, TROL.x + dx, 0.45, TROL.z + dz, 6); cyl(0.06, 0.06, 0.04, INK, TROL.x + dx, 0.06, TROL.z + dz, 10, Math.PI / 2); } rect(TROL.x - 0.42, TROL.x + 0.42, TROL.z - 0.88, TROL.z + 0.88);
  const PLQ = SLOTS.filter(s => s.job).map(s => { const g = new THREE.Group(); g.add(mm(Bx(0.46, 0.035, 0.2), LM(INK))); plane(label2(s.w, s.s, INK, YEL), 0.44, 0.19, 0, 0.02, 0, -Math.PI / 2, g, -Math.PI / 2); g.visible = false; G.add(g); return { s, g, home: V(), placed: false }; });
  // ================= OLD MERU model (west, north of the desk) =================
  box(2.6, 0.85, 1.6, WOOD, 175.6, 0.43, -126.4); box(2.4, 0.06, 1.4, '#7aa860', 175.6, 0.89, -126.4); box(0.9, 0.02, 0.5, BLUE, 176.4, 0.93, -125.95); rect(174.3, 176.9, -127.2, -125.6);
  { let s = 3; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, rr = 0.42 + r() * 0.15, x = 175.4 + Math.cos(a) * rr * 1.5, z = -126.45 + Math.sin(a) * rr * 0.9; if (x > 176 && z > -126.2) continue; box(0.1, 0.1, 0.1, CREAM, x, 0.97, z); R0.put(Co(0.09, 0.08, 4), x, 1.06, z, RED, Math.PI / 4); }
    cyl(0.1, 0.12, 0.05, STONE, 175.4, 0.945, -126.45, 12); cyl(0.02, 0.02, 0.1, BLUE, 175.4, 1.0, -126.45, 6); R0.put(Co(0.4, 0.3, 10), 174.6, 1.07, -126.95, '#5f8a4a'); for (const dx of [-0.08, 0.08]) cyl(0.035, 0.035, 0.2, STONE, 174.6 + dx, 1.3, -126.95, 6); box(0.12, 0.08, 0.06, STONE, 174.6, 1.24, -126.95); }
  RG.box(2.5, 0.6, 1.5, '#cfe8f0', 175.6, 1.22, -126.4); plane(label('OLD MERU · 100 YEARS AGO', INK, '#ffffff', 512, 64, 30), 1.6, 0.2, 175.6, 0.6, -125.58);
  // ================= INFO DESK + Quill's book piles + DONOR plaque =================
  box(2.6, 0.95, 0.8, WOOD, 175.3, 0.48, -122.0); box(2.7, 0.05, 0.9, '#5a3e28', 175.3, 0.97, -122.0); rect(174.0, 176.6, -122.4, -121.6);
  plane(label('INFORMATION · PROF. QUILL', NAVY, YEL, 512, 64, 30), 2.2, 0.27, 175.3, 0.6, -121.58);
  const BK = ['#6e2a22', NAVY, GREEN, GOLD, '#7a5638', RED, '#4f6b4a', CREAM];
  { let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; const pile = (x, y, z, n) => { for (let i = 0; i < n; i++) box(0.32 + r() * 0.1, 0.06, 0.24 + r() * 0.06, BK[Math.floor(r() * BK.length)], x + (r() - 0.5) * 0.04, y + 0.03 + i * 0.06, z + (r() - 0.5) * 0.04, (r() - 0.5) * 0.5); };
    pile(174.4, 1.0, -122.1, 7); pile(174.9, 1.0, -121.9, 4); pile(176.4, 1.0, -122.1, 9); pile(173.3, 0.07, -123.2, 8); pile(177.3, 0.07, -123.5, 6); pile(173.1, 0.07, -124.2, 11); pile(188.0, 0.07, -101.2, 7); pile(189.4, 0.07, -107.8, 5);
    sph(0.14, BLUE, 175.6, 1.17, -122.1); cyl(0.02, 0.02, 0.1, BRASS, 175.6, 1.03, -122.1, 6); cyl(0.04, 0.035, 0.07, '#fbf8f0', 175.1, 1.03, -121.85, 10); }
  const donorFn = (g, W, H) => { g.fillStyle = '#7a5a2a'; g.fillRect(0, 0, W, H); g.strokeStyle = GOLD; g.lineWidth = 8; g.strokeRect(10, 10, W - 20, H - 20); g.fillStyle = GOLD; g.textBaseline = 'middle'; fitTxt(g, 'FRIENDS OF THE MUSEUM', 30, 52, W - 60, 34);
    const names = ['KING MIGHT', 'KIA', 'OTTO', 'MARLA', 'MICHAEL JAY'], me = !!save.stat('msDonor', false); g.font = '800 26px Archivo, sans-serif'; names.forEach((n, i) => { g.fillStyle = '#f3e3b8'; g.fillText(n, 34, 104 + i * 34); });
    if (me) { g.fillStyle = YEL; g.fillRect(28, 104 + 5 * 34 - 17, W - 56, 34); g.fillStyle = INK; g.font = '900 26px Archivo, sans-serif'; g.fillText('BEN · DONOR', 38, 104 + 5 * 34); } };
  const donorTex = CT(384, 300, donorFn); plane(donorTex, 1.3, 1.0, X0 + 0.07, 2.1, -121.8, Math.PI / 2); box(0.04, 1.08, 1.38, GOLD, X0 + 0.05, 2.1, -121.8);
  // ================= TOUR PODIUM + CURATOR'S STAND =================
  box(0.6, 1.0, 0.5, RED, 176.6, 0.5, -113.6); box(0.7, 0.06, 0.6, INK, 176.6, 1.03, -113.6, 0, -0.25); rect(176.25, 176.95, -113.9, -113.3); cyl(0.04, 0.04, 2.4, INK, 177.2, 1.2, -113.4, 8);
  plane2(label('TOURS · LEAD A GROUP · 4 STOPS', INK, YEL, 512, 64, 30), 1.7, 0.22, 177.2, 2.3, -113.4);
  const GEARP = V(173.1, 0, -113.6); cyl(0.035, 0.035, 1.9, WOOD, GEARP.x, 0.95, GEARP.z, 8); cyl(0.25, 0.25, 0.04, WOOD, GEARP.x, 0.04, GEARP.z, 12); for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2; cyl(0.015, 0.015, 0.2, BRASS, GEARP.x + Math.sin(a) * 0.08, 1.8, GEARP.z + Math.cos(a) * 0.08, 6, Math.cos(a) * 0.9, -Math.sin(a) * 0.9); }
  rect(GEARP.x - 0.25, GEARP.x + 0.25, GEARP.z - 0.25, GEARP.z + 0.25); plane2(label("CURATOR'S STAND", NAVY, '#ffffff', 256, 48, 24), 0.8, 0.15, GEARP.x, 2.05, GEARP.z, Math.PI / 2);
  const standJacket = new THREE.Group(); standJacket.add(mm(Bx(0.5, 0.62, 0.22), LM('#8a6a44'), 0, 1.45, 0), mm(Bx(0.12, 0.5, 0.23), LM('#efe6d2'), 0, 1.5, 0.0), mm(new THREE.TorusGeometry(0.04, 0.008, 6, 14), LM(GOLD), 0.1, 1.62, 0.13)); standJacket.position.copy(GEARP); standJacket.rotation.y = Math.PI / 2; G.add(standJacket);
  // ================= GIFT SHOP (south-west) =================
  box(2.6, 1.0, 0.7, WOOD, 175.6, 0.5, -106.4); box(2.7, 0.05, 0.8, '#5a3e28', 175.6, 1.02, -106.4); rect(174.3, 176.9, -106.75, -106.05); box(0.4, 0.3, 0.3, DARK, 176.5, 1.2, -106.4);
  for (let i = 0; i < 3; i++) { box(0.4, 0.04, 6.4, WOOD, X0 + 0.25, 0.6 + i * 0.55, -104.6); box(5.0, 0.04, 0.4, WOOD, 175.4, 0.6 + i * 0.55, Z1 + 0.25); }
  { let s = 5; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 3; i++) for (let k = 0; k < 9; k++) { const z = -107.4 + k * 0.7, y = 0.62 + i * 0.55, t = (i + k) % 3; if (t === 0) { box(0.16, 0.12, 0.26, BONE, X0 + 0.25, y + 0.08, z); sph(0.05, BONE, X0 + 0.25, y + 0.17, z - 0.12); } else if (t === 1) { cyl(0.05, 0.05, 0.11, k % 2 ? RED : WHITE, X0 + 0.25, y + 0.07, z, 10); } else { sph(0.07, '#bfe0f5', X0 + 0.25, y + 0.11, z); cyl(0.06, 0.06, 0.04, GOLD, X0 + 0.25, y + 0.03, z, 10); } }
    for (let i = 0; i < 3; i++) for (let k = 0; k < 7; k++) box(0.24 + r() * 0.08, 0.3 + r() * 0.06, 0.06, BK[(i * 7 + k) % BK.length], 173.4 + k * 0.62, 0.62 + i * 0.55 + 0.16, Z1 + 0.28); }
  cyl(0.03, 0.03, 1.6, INK, 177.8, 0.8, -102.0, 6); for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2; for (let j = 0; j < 3; j++) box(0.14, 0.2, 0.01, [YEL, BLUE, RED, GREEN][(k + j) % 4], 177.8 + Math.sin(a) * 0.12, 0.7 + j * 0.28, -102.0 + Math.cos(a) * 0.12, a); } rect(177.6, 178.0, -102.2, -101.8);
  sph(0.18, GREEN, 175.0, 1.25, -106.4, 1.3, 1, 1); sph(0.1, GREEN, 174.75, 1.42, -106.4); sph(0.03, INK, 174.66, 1.45, -106.35);
  plane2(label('GIFT SHOP', INK, YEL, 256, 64, 34), 1.6, 0.4, 175.6, 3.2, -108.6); cyl(0.012, 0.012, CEIL - 3.4, INK, 175.6, 3.4 + (CEIL - 3.4) / 2, -108.6, 4);
  // ================= SPACE HALL (south): SKYFOX 1 hanging + star wall + space suit =================
  const ROCKET = new THREE.Group(); { const S = mk(); S.put(Cy(0.5, 0.5, 4.2, 18), 0, 0, 0, '#f3f2f2', 0, 0, Math.PI / 2); for (const x of [-1.2, 0.6]) S.put(Cy(0.51, 0.51, 0.25, 18), x, 0, 0, RED, 0, 0, Math.PI / 2); S.put(Co(0.5, 1.2, 18), 2.7, 0, 0, RED, 0, 0, -Math.PI / 2);
    for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2; S.box(0.7, 0.04, 0.5, RED, -1.85, Math.cos(a) * 0.62, Math.sin(a) * 0.62, 0, -a); } S.put(Cy(0.32, 0.42, 0.4, 14), -2.3, 0, 0, DARK, 0, 0, Math.PI / 2); for (const z of [-1, 1]) S.sph(0.16, BLUE, 1.2, 0.18, z * 0.42, 1, 1, 0.4);
    ROCKET.add(subMesh(S)); const lt = label('SKYFOX 1', '#f3f2f2', RED, 256, 64, 40); for (const z of [-1, 1]) plane(lt, 1.6, 0.4, -0.2, 0.0, z * 0.52, z > 0 ? 0 : Math.PI, ROCKET); ROCKET.position.set(182.8, 5.0, -105.2); ROCKET.rotation.z = 0.22; G.add(ROCKET);
    for (const dx of [-1.2, 1.2]) { const y = 5.0 + dx * Math.sin(0.22) + 0.5; cyl(0.012, 0.012, CEIL - y, INK, 182.8 + dx * Math.cos(0.22), y + (CEIL - y) / 2, -105.2, 4); } }
  plane(CT(1024, 640, (g, W, H) => { g.fillStyle = '#0d1530'; g.fillRect(0, 0, W, H); let s = 9; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; g.fillStyle = '#ffffff'; for (let i = 0; i < 260; i++) { g.globalAlpha = 0.4 + r() * 0.6; g.fillRect(r() * W, r() * H, 2 + r() * 2, 2 + r() * 2); } g.globalAlpha = 1;
    g.fillStyle = '#e07a30'; g.beginPath(); g.arc(W * 0.75, H * 0.62, 120, 0, Math.PI * 2); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 10; g.beginPath(); g.ellipse(W * 0.75, H * 0.62, 190, 40, -0.3, 0, Math.PI * 2); g.stroke(); g.fillStyle = YEL; g.font = '900 72px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText('TO THE STARS', 50, 50); g.fillStyle = '#ffffff'; g.font = '800 30px Archivo, sans-serif'; g.fillText('THE MERU SPACE STORY', 54, 136); }), 7.2, 4.4, 182.9, 3.1, Z1 + 0.06, Math.PI);
  const SUIT = V(185.6, 0, -102.4); { const x = SUIT.x, z = SUIT.z; box(0.9, 0.2, 0.9, STONE, x, 0.1, z); for (const s of [-1, 1]) { cyl(0.1, 0.09, 0.7, '#f3f2f2', x + s * 0.13, 0.6, z, 10); box(0.18, 0.12, 0.28, INK, x + s * 0.13, 0.26, z + 0.03); cyl(0.07, 0.07, 0.55, '#f3f2f2', x + s * 0.34, 1.35, z, 10, 0, s * 0.25); }
    cyl(0.25, 0.22, 0.7, '#f3f2f2', x, 1.3, z, 12); box(0.4, 0.5, 0.2, STEEL, x, 1.35, z - 0.25); box(0.14, 0.1, 0.02, RED, x, 1.45, z + 0.24); cyl(0.18, 0.2, 0.06, STEEL, x, 1.7, z, 14); rect(x - 0.45, x + 0.45, z - 0.45, z + 0.45); }
  const SPHELM = new THREE.Group(); SPHELM.add(mm(Sp(0.24, 16, 10), LM('#dfe9ef')), mm(Sp(0.2, 14, 8), LM(GOLD), 0, 0, 0.07)); SPHELM.children[1].scale.set(0.95, 0.75, 0.9); SPHELM.position.set(SUIT.x, 1.93, SUIT.z); G.add(SPHELM);
  box(1.2, 0.9, 0.3, STONE, 180.4, 0.45, -108.8); plane(label2('SKYFOX 1', 'FLEW 8 KM UP · LANDED IN THE LAKE', INK, '#ffffff', 512, 112), 1.1, 0.24, 180.4, 0.7, -108.96, Math.PI); rect(179.8, 181.0, -108.95, -108.65);
  plane2(label('SPACE HALL', NAVY, YEL, 256, 64, 34), 1.8, 0.45, 182.9, 4.0, -110.6); cyl(0.012, 0.012, CEIL - 4.2, INK, 182.9, 4.2 + (CEIL - 4.2) / 2, -110.6, 4);
  // ================= RESTORATION WORKSHOP (south-east, staff only) =================
  for (const [a, b] of [[-108.2, -106.0], [-103.0, Z1]]) { wall(b - a, 187.0, (a + b) / 2, Math.PI / 2); rect(186.92, 187.08, a, b); }
  wall(X1 - 187.0, (187.0 + X1) / 2, -108.2, 0); rect(187.0, X1, -108.28, -108.12); box(0.06, CEIL - 2.8, 3.0, PLASTER, 187.0, (2.8 + CEIL) / 2, -104.5);
  plane(label('RESTORATION · STAFF ONLY', INK, YEL, 512, 64, 30), 2.6, 0.32, 186.95, 2.55, -104.5, -Math.PI / 2);
  box(1.0, 0.9, 6.0, WOOD, 190.9, 0.45, -104.1); box(1.06, 0.05, 6.06, '#d9cfbd', 190.9, TOPW - 0.02, -104.1); rect(190.4, X1, -107.1, -101.1);
  box(0.7, 0.03, 2.1, WINE, 190.75, TOPW + 0.015, -102.2);
  cyl(0.02, 0.02, 0.6, INK, 191.3, TOPW + 0.3, -104.6, 6); box(0.4, 0.02, 0.02, INK, 191.1, TOPW + 0.6, -104.6); cyl(0.0, 0.1, 0.12, YEL, 190.9, TOPW + 0.54, -104.6, 10);
  for (let k = 0; k < 4; k++) cyl(0.04, 0.04, 0.1, ['#c4683a', BLUE, GREEN, GOLD][k], 191.3, TOPW + 0.05, -103.4 + k * 0.12, 8);
  for (let i = 0; i < 2; i++) { box(4.2, 0.04, 0.35, WOOD, 189.3, 1.4 + i * 0.7, -108.0); for (let k = 0; k < 6; k++) R0.put(new THREE.LatheGeometry([[0.0, 0], [0.08, 0], [0.11, 0.08], [0.1, 0.18], [0.06, 0.24], [0.07, 0.28]].map(([r, y]) => new THREE.Vector2(r, y)), 10), 187.6 + k * 0.66, 1.42 + i * 0.7, -108.0, ['#c4683a', '#efe6d2', '#8a6440'][(i + k) % 3]); }
  box(0.7, 0.6, 0.7, '#b98a55', 188.0, 0.3, -107.4); box(0.6, 0.5, 0.6, '#b98a55', 187.9, 0.25, -101.3, 0.3); rect(187.6, 188.4, -107.8, -107.0);
  // ---------- merged meshes ----------
  G.add(subMesh(R0)); { const gm = new THREE.Mesh(RG.geo(), glassM); gm.renderOrder = 3; G.add(gm); }
  // ================= PROF. QUILL =================
  const QL = { fur: '#c98a4a', furDark: '#9a6430', muzzle: '#f3dcc0', snout: '#ecd2b2', chin: '#fff4e6', fluff: '#fff4e6', lashes: 1, blush: 0.28, eyeSize: 1.2, headWidth: 0.9, earInner: '#9d174d' };
  const quill = kit.makeFox({ key: 'quillMuseum', torso: ['#4f6b4a', '#e6b45a', '#2e3f2a'], outfit: 'coat', mood: 'happy', eyes: ['#5a3a1a', '#5a3a1a'], look: QL });
  { const P = quill.userData && quill.userData.P; if (P && P.head) { const gm = LM(INK), gl = new THREE.Group(); for (const s of [-1, 1]) gl.add(mm(new THREE.TorusGeometry(0.075, 0.012, 6, 18), gm, s * 0.11, 0, 0)); gl.add(mm(Bx(0.06, 0.012, 0.012), gm, 0, 0, 0)); gl.position.set(0, 0.42, 0.12); gl.rotation.x = -1.0; P.head.add(gl); gl.traverse(o => { o.renderOrder = 2; }); }
    if (P && P.body) { const bk = new THREE.Group(); [[0.34, '#6e2a22'], [0.3, NAVY], [0.32, GREEN], [0.26, GOLD]].forEach(([w, c], i) => bk.add(mm(Bx(w, 0.06, 0.22), LM(c), (i % 2 - 0.5) * 0.03, i * 0.06, 0, 0, (i - 1.5) * 0.12, 0))); bk.position.set(0, 0.88, 0.3); bk.traverse(o => { o.renderOrder = 2; }); P.body.add(bk); }
    if (P && P.sword) P.sword.visible = false; }
  G.add(quill); const qCol = { c: [0, 0, 0.45] }; cols.push(qCol);
  const QS = { idle: [175.3, -123.0, 0], pot: [189.3, -101.3, Math.PI], statue: [179.3, -132.6, -Math.PI / 2], fake: [189.5, -100.95, -Math.PI / 2], gates: [188.4, -124.8, -Math.PI / 2], gallery: [190.4, -133.4, -Math.PI / 2] };
  const placeQ = k => { const s = QS[k]; quill.position.set(s[0], 0, s[1]); quill.userData.face0 = s[2]; quill.rotation.y = s[2]; qCol.c[0] = s[0]; qCol.c[1] = s[1]; }; placeQ('idle');
  const qT = { key: 'quillMuseum', obj: quill, ry: 0, r: 3.0 }, endT = { key: 'quillEnd', obj: quill, ry: 0, r: 14 };
  const ln = text => ({ who: 'PROF. QUILL', role: 'HISTORIAN', text });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'museum', color: '#6e2a22', boardTitle: "Quill's best",
    room: { X0, X1, Z0, Z1 }, door: [172.9, -118], keeper: quill, keeperRy: 0,
    games: [{ k: 'evening', name: 'Big evening', color: '#6e2a22' }, { k: 'tour', name: 'Tour', color: NAVY }], board: { x: X0 + 0.08, y: 2.7, z: -114.6, ry: Math.PI / 2, w: 1.3 },
    hiring: { x: 173.2, z: -116.0, ry: Math.PI / 2 }, hiringLine: '6 JOBS · ONE EVENING', clock: { x: X0 + 0.08, y: 3.0, z: -124.6, ry: Math.PI / 2 },
    sun: [{ x: 173.8, z: -118, w: 2.4, d: 2.6 }, { x: 190.2, z: -112, w: 2.4, d: 2.6 }],
    lamps: [[176, 7.1, -130], [188, 7.1, -130], [176, 7.1, -106], [188, 7.1, -106], [176, 7.1, -118], [188, 7.1, -118]],
    browse: [[179.6, -118.0, Math.PI / 2], [175.6, -125.0, Math.PI], [175.6, -105.6, Math.PI], [177.5, -131.5, Math.PI], [179.5, -109.0, 0.4]] });
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, TR = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.9); tone(2093, 0.04, 0.9); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), clack = () => tone(240, 0.06, 0.1, 'triangle'), cheer = () => { tone(784, 0.05, 0.3); tone(988, 0.05, 0.3, 'sine', 0.1); tone(1175, 0.05, 0.4, 'sine', 0.2); };
  // ---------- prizes + what you wear ----------
  const CUR = { outfit: 'coat', torso: ['#efe6d2', '#8a6a44', '#5a4430'], name: 'CURATOR TWEED' };
  const own = () => ({ cur: !!save.stat('msCurator', false), coin: save.count('ancientCoin') > 0, fossil: save.count('fossil') > 0, donor: !!save.stat('msDonor', false) });
  const curOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === CUR.name); };
  const putOn = on => { if (on) { if (!curOn()) save.setStat('msPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(CUR); wear && wear(CUR); } else { const p = save.stat('msPrevOutfit', null), o = p && p.name !== CUR.name ? p : null; save.setOutfit(o); wear && wear(o); } };
  function giveGift() { save.setStat('msClears', save.stat('msClears', 0) + 1); const o = own();
    if (!o.cur) { save.setStat('msCurator', true); const have = save.stat('tailorOutfits', null); const list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === CUR.name)) save.setStat('tailorOutfits', [...list, CUR]); putOn(true); return { kind: 'cur', label: 'CURATOR OUTFIT · TWEED JACKET + MONOCLE' }; }
    if (!o.coin) { save.give('ancientCoin'); return { kind: 'coin', label: 'ANCIENT COIN' }; }
    if (!o.fossil) { save.give('fossil'); return { kind: 'fossil', label: 'A REAL FOSSIL' }; }
    if (!o.donor) { save.setStat('msDonor', true); redraw(donorTex, donorFn); return { kind: 'donor', label: 'YOUR NAME ON THE DONOR PLAQUE' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  function makeMonocle() { const g = new THREE.Group(); g.add(mm(new THREE.TorusGeometry(0.07, 0.013, 6, 18), LM(GOLD), 0.12, 0.05, 0.37), mm(Cy(0.062, 0.062, 0.006, 16), new THREE.MeshBasicMaterial({ color: '#d8eef5', transparent: true, opacity: 0.5 }), 0.12, 0.05, 0.37, Math.PI / 2), mm(Cy(0.006, 0.006, 0.3, 4), LM(GOLD), 0.19, -0.1, 0.33, 0, 0, 0.3)); return g; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const on = own().cur && curOn(), key = on ? 1 : 0;
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox))) { if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; if (on && U.P.head) { const m = makeMonocle(); U.P.head.add(m); worn.parts.push(m); } worn.parts.forEach(p => p.traverse(o => { o.renderOrder = 2; })); } }
  const goldK = () => (save.count('ancientCoin') > 0 ? 1.25 : 1);
  // ---------- card (Modernist) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head2 = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = (next, stop = true) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stop ? '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span>' : '') + '</div>';
  const bar = (k, c = '#ffd23a') => '<div style="height:12px;border:2px solid #201e1d;margin:4px 0;background:#fff;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:' + Math.round(clamp(k, 0, 1) * 100) + '%;background:' + c + '"></div></div>';
  const big = (txt, bg, fg = '#fff') => '<div style="background:' + bg + ';color:' + fg + ';font-weight:900;font-size:18px;padding:7px 10px;margin:2px 0 6px;border:2px solid #201e1d">' + txt + '</div>';
  const small = t => '<div style="font-size:11px;font-weight:900;padding-top:4px">' + t + '</div>';
  const setCard = (key, html, live = false) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; card.style.pointerEvents = live ? 'auto' : 'none'; if (live) { card.style.top = (innerHeight < 500 ? 70 : 100) + 'px'; card.style.maxHeight = 'none'; } else fitCard(); };
  const hideCard = () => { card.style.display = 'none'; card.style.pointerEvents = 'none'; cardKey = ''; };
  card.addEventListener('pointerdown', e => e.stopPropagation()); card.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-ans]'); if (b) answer(+b.getAttribute('data-ans')); });
  // ---------- night overlay (torch) ----------
  const night = document.createElement('div'); night.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;display:none;opacity:1;transition:opacity 0.8s'; document.body.appendChild(night);
  const glint = document.createElement('div'); glint.style.cssText = 'position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border:3px solid #ffd23a;z-index:3;pointer-events:none;display:none;box-sizing:border-box'; document.body.appendChild(glint);
  const NT = { x: innerWidth / 2, y: innerHeight / 2 };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null, lx: 0, ly: 0, sx: 0, sy: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label],[data-ans]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (!busy || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.lx = ptr.sx = e.clientX; ptr.y = ptr.ly = ptr.sy = e.clientY; e.stopPropagation(); if (busy === 'job') press(); }, true);
  addEventListener('pointermove', e => { if (busy === 'job' && J && J.sub === 'night') { NT.x = e.clientX; NT.y = e.clientY; } if (!busy || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); if (busy === 'job') drag(); ptr.lx = ptr.x; ptr.ly = ptr.y; }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  const RC = new THREE.Raycaster(), NDC = new THREE.Vector2(), PL = new THREE.Plane();
  const onPlane = (n, p0) => { NDC.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); RC.setFromCamera(NDC, camera); PL.setFromNormalAndCoplanarPoint(n, p0); const o = V(); return RC.ray.intersectPlane(PL, o) ? o : null; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  // particles (dust + sparkles)
  const PART = []; for (let i = 0; i < 28; i++) { const m = mm(Sp(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: '#b9a98a', transparent: true })); m.visible = false; G.add(m); PART.push({ m, v: V(), life: 0 }); }
  const burst = (p, n, col, sp = 0.8) => { let k = 0; for (const q of PART) { if (q.life > 0) continue; q.m.visible = true; q.m.material.color.set(col); q.m.position.copy(p); q.v.set(rnd(-1, 1), rnd(0.2, 1.4), rnd(-1, 1)).multiplyScalar(sp); q.life = rnd(0.5, 0.9); if (++k >= n) break; } };
  const partTick = dt => { for (const q of PART) { if (q.life <= 0) continue; q.life -= dt; q.m.position.addScaledVector(q.v, dt); q.v.y -= dt * 1.2; q.m.material.opacity = clamp(q.life * 1.6, 0, 1); if (q.life <= 0) q.m.visible = false; } };
  // ================= STEP PROPS =================
  // 1 PUZZLE: a lathe pot cut into 6 wedges (wedge 0 stays)
  const POT0 = V(190.7, TOPW, -106.3), PS = 1.35, PROF = [[0.0, 0], [0.16, 0], [0.2, 0.05], [0.25, 0.2], [0.26, 0.33], [0.2, 0.47], [0.12, 0.56], [0.13, 0.64], [0.17, 0.68]].map(([r, y]) => new THREE.Vector2(r * PS, y * PS));
  const potTex = CT(256, 128, (g, W, H) => { g.fillStyle = '#c4683a'; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(0, 22, W, 8); g.fillRect(0, 100, W, 8); g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); for (let x = 0; x <= W; x += 16) g.lineTo(x, (x / 16) % 2 ? 40 : 52); g.stroke(); foxHead(g, W / 2, 76, 34, INK, true); });
  const potM = new THREE.MeshLambertMaterial({ map: potTex, side: THREE.DoubleSide }), ghostM = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
  const NW = 6, SHARDS = []; for (let i = 0; i < NW; i++) { const p0 = i * Math.PI * 2 / NW, a = p0 + Math.PI / NW, geo = new THREE.LatheGeometry(PROF, 5, p0, Math.PI * 2 / NW), c = V(Math.sin(a) * 0.24 * PS, 0.34 * PS, Math.cos(a) * 0.24 * PS);
    const g = new THREE.Group(), m = new THREE.Mesh(geo, potM); m.position.copy(c).negate(); g.add(m); g.position.copy(POT0).add(c); G.add(g); if (!i) continue;
    const gh = new THREE.Mesh(geo, ghostM); gh.position.copy(POT0); gh.visible = false; gh.renderOrder = 4; G.add(gh); SHARDS.push({ i, g, gh, home: POT0.clone().add(c), bench: V(), br: new THREE.Euler(), placed: true }); }
  { const b = new THREE.Mesh(Cy(0.16 * PS, 0.16 * PS, 0.02, 18), potM); b.position.copy(POT0).add(V(0, 0.01, 0)); G.add(b); }
  const BSP = [[190.55, -105.15], [190.95, -104.7], [190.55, -104.25], [190.95, -103.8], [190.55, -103.4]];
  const shardsHome = () => SHARDS.forEach(s => { s.g.position.copy(s.home); s.g.rotation.set(0, 0, 0); s.gh.visible = false; s.placed = true; });
  // 2 DUST + POLISH: puffs on the statue + a duster / cloth that follows the finger
  const PUFFS = []; for (let i = 0; i < 12; i++) { const m = mm(Sp(0.1, 10, 6), new THREE.MeshLambertMaterial({ color: '#8c7b62', transparent: true, opacity: 0.92 })); m.scale.set(1, 1, 0.4); m.visible = false; m.renderOrder = 3; G.add(m); PUFFS.push({ m, hp: 0, p: V() }); }
  const RINGS = []; for (let i = 0; i < 4; i++) { const m = mm(new THREE.TorusGeometry(0.1, 0.014, 6, 20), new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true })); m.visible = false; m.renderOrder = 5; G.add(m); RINGS.push({ m, hp: 0 }); }
  const DUSTER = new THREE.Group(); { const f = mm(Co(0.09, 0.22, 8), LM('#f472b6'), 0, 0.14, 0); f.rotation.x = Math.PI; DUSTER.add(mm(Cy(0.015, 0.015, 0.3, 6), LM(WOOD), 0, -0.1, 0), f); const cl = mm(Bx(0.18, 0.04, 0.14), LM(YEL), 0, 0.0, 0); cl.visible = false; DUSTER.add(cl); DUSTER.userData.cloth = cl; DUSTER.userData.feather = f; DUSTER.visible = false; DUSTER.traverse(o => { o.renderOrder = 4; }); G.add(DUSTER); }
  const SBASE = V(177.5, 0.72, -133.6);
  function dustPoints() { statue.updateMatrixWorld(true); const bb = new THREE.Box3().setFromObject(statue), cxs = (bb.min.x + bb.max.x) / 2, h = bb.max.y - bb.min.y, out = [];
    for (const fy of [0.88, 0.75, 0.62, 0.5, 0.38, 0.24]) for (const dx of [-0.26, 0.26]) { const o = V(cxs + dx * (fy > 0.7 ? 0.7 : 1), bb.min.y + h * fy, bb.max.z + 1.5); RC.set(o, V(0, 0, -1)); const hit = RC.intersectObject(statue, true).find(q => q.object.material && q.object.material.side !== THREE.BackSide && q.object.visible);
      out.push(hit ? hit.point.clone().add(V(0, 0, 0.03)) : V(o.x, o.y, SBASE.z + 0.35)); } return out; }
  // 3 SPOT THE FAKE: statuettes, vases, coins on the velvet tray
  const TP = [-102.95, -102.2, -101.45].map(z => V(190.75, TOPW + 0.03, z));
  const markTex = c => label(c, INK, GOLD, 64, 32, 26);
  function statuette(diff) { const g = new THREE.Group(), B = LM('#b07a3a'); g.add(mm(Bx(0.26, 0.07, 0.26), LM('#2b2a29'), 0, 0.035, 0)); plane(markTex(diff === 'mark' ? '9' : '8'), 0.1, 0.05, -0.132, 0.035, 0, -Math.PI / 2, g);
    const body = mm(Sp(0.1), B, 0, 0.2, 0); body.scale.set(0.9, 1.3, 0.85); g.add(body, mm(Sp(0.085), B, -0.01, 0.37, 0), mm(Co(0.045, 0.1, 8), B, -0.1, 0.355, 0, 0, 0, Math.PI / 2));
    for (const s of diff === 'ears' ? [1] : [-1, 1]) g.add(mm(Co(0.035, 0.1, 6), B, 0.0, 0.47, s * 0.045)); for (const s of [-1, 1]) g.add(mm(Sp(0.012, 6, 4), LM(INK), -0.075, 0.39, s * 0.03));
    g.add(mm(Co(0.05, 0.22, 8), B, 0.12, 0.2, 0, 0, 0, -0.7), mm(Sp(0.04), diff === 'tail' ? LM('#f3f2f2') : LM(YEL), 0.19, 0.29, 0)); g.scale.setScalar(1.6); return g; }
  function vase(diff) { const g = new THREE.Group(), pr = [[0.0, 0], [0.07, 0], [0.1, 0.05], [0.12, 0.14], [0.11, 0.24], [0.07, 0.31], [0.06, 0.36], [0.08, 0.4]], rAt = y => { for (let i = 1; i < pr.length; i++) if (y <= pr[i][1]) { const k = (y - pr[i - 1][1]) / (pr[i][1] - pr[i - 1][1]); return pr[i - 1][0] + (pr[i][0] - pr[i - 1][0]) * k; } return 0.08; };
    g.add(mm(new THREE.LatheGeometry(pr.map(([r, y]) => new THREE.Vector2(r, y)), 18), new THREE.MeshLambertMaterial({ color: '#efe6d2', side: THREE.DoubleSide })));
    for (const y of diff === 'bands' ? [0.1, 0.26] : [0.1, 0.18, 0.26]) g.add(mm(new THREE.TorusGeometry(rAt(y) + 0.004, 0.012, 6, 24), LM(RED), 0, y, 0, Math.PI / 2));
    for (const s of diff === 'handles' ? [1] : [-1, 1]) g.add(mm(new THREE.TorusGeometry(0.045, 0.012, 6, 14), LM('#efe6d2'), 0, 0.3, s * 0.105, 0, Math.PI / 2, 0)); g.scale.setScalar(1.6); return g; }
  const coinTexC = {}; const coinTex = diff => coinTexC[diff] || (coinTexC[diff] = CT(256, 256, (g, W) => { const c = W / 2; g.clearRect(0, 0, W, W); g.fillStyle = '#b8892e'; g.beginPath(); g.arc(c, c, 124, 0, Math.PI * 2); g.fill(); g.fillStyle = GOLD; g.beginPath(); g.arc(c, c, 112, 0, Math.PI * 2); g.fill();
    foxHead(g, c, c - 6, 92, '#b8892e', diff !== 'fox'); g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 30px Archivo, sans-serif'; g.fillText('MERU', c, 40); g.fillText(diff === 'spell' ? '8 GATS' : '8 GATES', c, 214); }));
  function coin(diff) { const g = new THREE.Group(); for (const s of [-1, 1]) g.add(mm(Cy(0.008, 0.008, 0.3, 4), LM(INK), 0.05, 0.13, s * 0.08, 0, 0, -0.25)); g.add(mm(Cy(0.16, 0.16, 0.025, 28), LM('#c9a24a'), 0, 0.22, 0, 0, 0, Math.PI / 2)); plane(coinTex(diff), 0.31, 0.31, -0.015, 0.22, 0, -Math.PI / 2, g, 0, true); g.scale.setScalar(1.6); return g; }
  const FAKES = [{ kind: 'STATUETTES', make: statuette, diffs: ['ears', 'tail', 'mark'], cat: ['TWO EARS', 'A GOLD TAIL TIP', 'AN 8 ON THE BASE'], say: { ears: 'Count the ears.', tail: 'Look at the tail tip.', mark: 'Read the mark on the base.' } },
    { kind: 'VASES', make: vase, diffs: ['bands', 'handles'], cat: ['THREE RED BANDS', 'TWO HANDLES'], say: { bands: 'Count the red bands.', handles: 'Count the handles.' } },
    { kind: 'COINS', make: coin, diffs: ['spell', 'fox'], cat: ['IT SAYS 8 GATES', 'A FOX WITH TWO EARS'], say: { spell: 'Read the words. Slowly.', fox: 'Look at the fox. Ears!' } }];
  // 6 NIGHT: things that move about after dark
  const MOVED = [{ k: 'skull', o: SKULL, n: 'THE REX SKULL', p: V(180.1, 0.34, -120.3), r: [0.35, 0.9, 0.5] }, { k: 'helm', o: HELM, n: 'A GUARD HELMET', p: V(178.6, 0.24, -115.4), r: [0, 2.0, 0.9] },
    { k: 'space', o: SPHELM, n: 'THE SPACE HELMET', p: V(184.7, 0.26, -114.0), r: [0.2, 0, 0.3] }, { k: 'king', o: PORTS[1], n: 'A KING PORTRAIT', p: V(184.15, 0.86, -121.4), r: [0, -1.1, Math.PI] }, { k: 'board', o: BOARD, n: 'THE SURFBOARD', p: V(181.2, 0.85, -115.4), r: [0, 0.6, 0.35] }];
  MOVED.forEach(m => { m.home = m.o.position.clone(); m.homeR = m.o.rotation.clone(); });
  const movedHome = () => MOVED.forEach(m => { m.o.position.copy(m.home); m.o.rotation.copy(m.homeR); });
  // ================= THE BIG EVENING =================
  const addGold = n => { n = Math.max(0, Math.round(n * goldK())); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const STEP_N = ['PUZZLE', 'DUST', 'FAKE', 'LABEL', 'HANG', 'NIGHT'];
  function startVisit() { const n = save.stat('msVisits', 0); save.setStat('msVisits', n + 1);
    J = { step: 0, sub: 'intro', gold: 0, pause: 0, t: 0, flies: [], clean: 0, held: null, sel: null, wrong: 0 }; busy = 'job'; pop();
    sayTo(qT, [ln(n ? 'Back again! The big evening is tonight. Six jobs. First, the pot fell off the shelf again.' : 'A helper! Professor Quill. Six jobs before the big evening. First: a pot in five pieces. Five!')], null, true);
    NEXT('intro', beginPot, 2.6); }
  // ---- 1 PUZZLE ----
  function beginPot() { J.step = 1; J.sub = 'pot'; J.placed = 0; J.wrong = 0; placeQ('pot'); const spots = shuffle(BSP);
    SHARDS.forEach((s, i) => { s.placed = false; s.bench.set(spots[i][0], TOPW + 0.47, spots[i][1]); s.br.set(rnd(-0.2, 0.2), rnd(0, Math.PI * 2), rnd(-0.12, 0.12)); s.g.position.copy(s.bench); s.g.rotation.copy(s.br); s.gh.visible = true; s.miss = 0; });
    toast('STEP 1 OF 6 · PUZZLE · DRAG A PIECE ONTO ITS GAP', 2.4); }
  const shardBack = s => { s.g.rotation.copy(s.br); fly(s.g, s.bench, 0.3, 0.1); };
  function shardDrop(s) { const open = SHARDS.filter(q => !q.placed); let best = null, bd = RAD() * 2.4; for (const q of open) { const d = dist(scrW(q.home)); if (d < bd) { bd = d; best = q; } }
    J.sel = null; if (!best) { shardBack(s); return; }
    if (best === s) { s.placed = true; s.gh.visible = false; s.g.rotation.set(0, 0, 0); fly(s.g, s.home, 0.22, 0.04, () => { clack(); burst(s.home, 4, '#e6b45a', 0.5); }); addGold(Math.max(1, 4 - s.miss)); J.placed++;
      if (J.placed >= 5) { J.sub = 'potDone'; if (!J.wrong) J.clean++; sayTo(qT, [ln((J.wrong ? 'There. A few tries, but it is whole.' : 'Five for five! You can hardly see the cracks.') + ' Next, the dusty stone king.')], null, true); NEXT('potDone', beginDust, 1.8); } return; }
    s.miss++; J.wrong++; nope(); shardBack(s); toast(s.miss >= 2 ? 'ITS GAP IS GLOWING NOW' : 'THAT GAP IS FOR ANOTHER PIECE', 1.4); }
  function potPress() { const s = nearestOf(SHARDS.filter(q => !q.placed), q => q.g.position, 1.8); if (s) { J.held = s; J.sel = s; J.dragged = false; pop(); return; } if (J.sel) shardDrop(J.sel); }
  function potDrag() { const s = J.held; if (!s) return; if (Math.hypot(ptr.x - ptr.sx, ptr.y - ptr.sy) > 10) J.dragged = true; if (!J.dragged) return; const p = onPlane(V(0, 1, 0), V(0, TOPW + 0.62, 0)); if (p) s.g.position.set(clamp(p.x, 189.4, 191.4), TOPW + 0.62, clamp(p.z, -107.2, -102.8)); }
  function potRelease() { const s = J.held; J.held = null; if (!s) return; if (J.dragged) shardDrop(s); else { s.g.position.y = TOPW + 0.62; toast('NOW TAP ITS GAP ON THE POT', 1.4); } }
  // ---- 2 DUST + POLISH ----
  function beginDust() { J.step = 2; J.sub = 'dust'; J.t0 = J.t; placeQ('statue'); const pts = dustPoints(); PUFFS.forEach((q, i) => { q.p.copy(pts[i]); q.m.position.copy(q.p); q.hp = 70; q.m.visible = true; q.m.material.opacity = 0.92; q.m.scale.set(1, 1, 0.4); });
    DUSTER.userData.cloth.visible = false; DUSTER.userData.feather.visible = true; DUSTER.visible = false; toast('STEP 2 OF 6 · DUST · RUB THE DUST OFF THE KING', 2.4); }
  function rubAt(list, posOf, onHit) { const mv = Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly); if (mv < 0.5) return; for (const q of list) { if (q.hp <= 0) continue; if (dist(scrW(posOf(q))) < RAD() * 1.5) onHit(q, mv); } }
  function dustDrag() { const p = onPlane(V(0, 0, 1), V(0, 0, SBASE.z + 0.45)); if (p) { DUSTER.position.copy(p); DUSTER.visible = true; DUSTER.rotation.z = Math.sin(J.t * 18) * 0.4; }
    if (J.sub === 'dust') rubAt(PUFFS, q => q.p, (q, mv) => { q.hp -= mv; const k = clamp(q.hp / 70, 0, 1); q.m.material.opacity = 0.92 * k; q.m.scale.set(0.5 + 0.5 * k, 0.5 + 0.5 * k, 0.4); if (Math.random() < 0.25) burst(q.p, 1, '#b9a98a', 0.5);
      if (q.hp <= 0) { q.m.visible = false; burst(q.p, 4, '#b9a98a', 0.7); tone(900 + PUFFS.filter(z => z.hp <= 0).length * 40, 0.03, 0.08, 'triangle'); if (PUFFS.every(z => z.hp <= 0)) beginPolish(); } });
    else if (J.sub === 'polish') rubAt(RINGS, q => q.m.position, (q, mv) => { q.hp -= mv; q.m.scale.setScalar(0.4 + 0.6 * clamp(q.hp / 130, 0, 1)); if (Math.random() < 0.3) burst(q.m.position, 1, '#ffd23a', 0.4);
      if (q.hp <= 0) { q.m.visible = false; burst(q.m.position, 6, '#ffd23a', 0.9); ding(); if (RINGS.every(z => z.hp <= 0)) polishDone(); } }); }
  function beginPolish() { J.sub = 'polish'; addGold(12); [0, 4, 6, 9].forEach((i, k) => { const R = RINGS[k]; R.m.position.copy(PUFFS[i].p).add(V(0, 0, 0.02)); R.hp = 130; R.m.visible = true; R.m.scale.setScalar(1); }); DUSTER.userData.cloth.visible = true; DUSTER.userData.feather.visible = false; toast('NOW POLISH · RUB THE YELLOW RINGS', 2); }
  function polishDone() { J.sub = 'dustDone'; DUSTER.visible = false; const tt = J.t - J.t0; addGold(8 + (tt < 30 ? 6 : tt < 50 ? 3 : 0)); if (tt < 45) J.clean++; burst(V(SBASE.x, 2.2, SBASE.z + 0.4), 10, '#ffd23a', 1.2);
    sayTo(qT, [ln('He gleams! Back to the workshop. One of each three things is a fake.')], null, true); NEXT('dustDone', beginFake, 1.8); }
  // ---- 3 SPOT THE FAKE ----
  function clearFakes() { if (J && J.fobj) J.fobj.forEach(o => G.remove(o)); if (J) J.fobj = null; }
  function beginFake() { J.step = 3; J.round = 0; J.fw = 0; J.ok = 0; placeQ('fake'); nextRound(); }
  function nextRound() { clearFakes(); const F = FAKES[J.round]; J.fake = Math.floor(Math.random() * 3); J.diff = pick(F.diffs); J.rw = 0; J.fobj = TP.map((p, i) => { const o = F.make(i === J.fake ? J.diff : null); o.position.copy(p); G.add(o); return o; }); J.sub = 'fake';
    toast('ROUND ' + (J.round + 1) + ' OF 3 · ' + F.kind + ' · TAP THE FAKE', 2); }
  function fakePress() { const i = [0, 1, 2].find(k => dist(scrW(TP[k].clone().add(V(0, 0.32, 0)))) < RAD() * 2.4); if (i == null) return; const F = FAKES[J.round], o = J.fobj[i];
    if (i === J.fake) { ding(); J.ok++; addGold(J.rw ? 2 : 6); J.sub = 'fakeFound'; fly(o, o.position.clone(), 0.4, 0.25); burst(TP[i].clone().add(V(0, 0.4, 0)), 6, '#ec3013', 0.8); toast('FAKE! · ' + F.say[J.diff].toUpperCase(), 1.6);
      NEXT('fakeFound', () => { J.round++; if (J.round < 3) nextRound(); else { clearFakes(); if (!J.fw) J.clean++; J.sub = 'fakeDone'; sayTo(qT, [ln((J.fw ? 'All three fakes found. Sneaky.' : 'Three fakes, three first tries.') + ' Now the 8 Gates hall. The cases need labels.')], null, true); NEXT('fakeDone', beginLabel, 1.8); } }, 1.3); return; }
    nope(); J.rw++; J.fw++; fly(o, o.position.clone(), 0.3, 0.06); toast('THAT ONE IS REAL · ' + F.say[J.diff].toUpperCase(), 1.8); }
  // ---- 4 LABEL IT ----
  function beginLabel() { J.step = 4; J.sub = 'label'; J.lw = 0; J.lab = 0; placeQ('gates'); const order = shuffle(PLQ);
    order.forEach((q, i) => { q.placed = false; q.miss = 0; q.home.set(TROL.x, TROL.y + 0.02, TROL.z - 0.6 + i * 0.4); q.g.position.copy(q.home); q.g.visible = true; q.s.done = false; redraw(q.s.tex, blankFn); }); toast('STEP 4 OF 6 · LABEL IT · DRAG EACH PLAQUE TO ITS CASE', 2.4); }
  function plqDrop(q) { J.sel = null; const open = SLOTS.filter(s => s.job && !s.done); let best = null, bd = RAD() * 2.6; for (const s of open) { const d = Math.min(dist(scrW(s.p)), dist(scrW(s.obj))); if (d < bd) { bd = d; best = s; } }
    if (!best) { fly(q.g, q.home, 0.3, 0.08); return; }
    if (best === q.s) { q.placed = true; best.done = true; fly(q.g, best.p.clone().add(V(-0.05, 0, 0)), 0.3, 0.1, () => { q.g.visible = false; redraw(best.tex, labFn(best)); clack(); }); addGold(q.miss ? 2 : 5); J.lab++;
      if (J.lab >= 4) { J.sub = 'labelDone'; if (!J.lw) J.clean++; sayTo(qT, [ln('Every case labelled. Now two portraits in the Gallery of Kings. Straight, please. Kings hate crooked.')], null, true); NEXT('labelDone', beginHang, 1.8); } return; }
    q.miss++; J.lw++; nope(); fly(q.g, q.home, 0.3, 0.08); toast('NOT THAT CASE · ' + q.s.hint, 1.8); }
  function plqPress() { const q = nearestOf(PLQ.filter(p => !p.placed), p => p.g.position, 1.8); if (q) { J.held = q; J.sel = q; J.dragged = false; pop(); return; } if (J.sel) plqDrop(J.sel); }
  function plqDrag() { const q = J.held; if (!q) return; if (Math.hypot(ptr.x - ptr.sx, ptr.y - ptr.sy) > 10) J.dragged = true; if (!J.dragged) return; const p = onPlane(V(0, 1, 0), V(0, 1.05, 0)); if (p) q.g.position.set(clamp(p.x, 187.6, 190.4), 1.05, clamp(p.z, -124.2, -117.8)); }
  function plqRelease() { const q = J.held; J.held = null; if (!q) return; if (J.dragged) plqDrop(q); else { q.g.position.y = q.home.y + 0.1; toast('NOW TAP ITS CASE', 1.4); } }
  // ---- 5 HANG THE PAINTING ----
  function beginHang() { J.step = 5; J.hi = 0; J.hw = 0; placeQ('gallery'); HP.forEach(hangLean); startPainting(); }
  function startPainting() { J.sub = 'lift'; toast('STEP 5 OF 6 · TAP THE PAINTING TO HANG IT', 2); }
  function hangPress() { const h = HP[J.hi]; if (J.sub === 'lift') { pop(); h.a = (Math.random() < 0.5 ? -1 : 1) * rnd(0.14, 0.24); h.pv.rotation.set(0, 0, h.a); J.sub = 'lifting'; fly(h.pv, V(h.o.x, 3.55, Z0 + 0.1), 0.5, 0.15, () => { J.sub = 'level'; J.ht = 0; J.inB = 0; h.lvl.visible = true; toast('DRAG LEFT OR RIGHT · KEEP THE BUBBLE IN THE GREEN', 2.2); }); } }
  function hangDrag() { if (J.sub !== 'level') return; const h = HP[J.hi]; h.a = clamp(h.a - (ptr.x - ptr.lx) * 0.0016, -0.4, 0.4); }
  function hangTick(dt) { const h = HP[J.hi]; if (J.sub !== 'level') return; J.ht += dt; if (!ptr.down) h.a += Math.sin(J.t * 1.7) * 0.02 * dt; h.pv.rotation.z = h.a; h.bub.position.x = clamp(-h.a * 1.6, -0.24, 0.24);
    if (Math.abs(h.a) < 0.018) { J.inB += dt; if (J.inB > 0.7) { h.a = 0; h.pv.rotation.z = 0; h.lvl.visible = false; ding(); burst(V(h.o.x, 2.6, Z0 + 0.3), 6, '#ffd23a', 0.8); addGold(J.ht < 8 ? 10 : 8); if (J.ht >= 12) J.hw++; J.hi++;
      if (J.hi < HP.length) { J.sub = 'hung'; toast('STRAIGHT · NOW THE NEXT ONE', 1.4); NEXT('hung', startPainting, 1.2); } else { save.setStat('msHung', true); J.sub = 'hangDone'; if (!J.hw) J.clean++; sayTo(qT, [ln('Perfectly straight. Now we wait for the guests and... oh dear.')], null, true); NEXT('hangDone', beginNight, 1.8); } } } else J.inB = 0; }
  // ---- 6 NIGHT AT THE MUSEUM ----
  function beginNight() { J.step = 6; J.sub = 'nightIn'; placeQ('idle'); sayTo(qT, [ln('The lights! It is night already. Things have moved. Take the torch. Find five.')], null, true);
    NEXT('nightIn', () => { J.sub = 'night'; J.found = 0; J.lastF = J.t; MOVED.forEach(m => { m.f = false; m.o.position.copy(m.p); m.o.rotation.set(m.r[0], m.r[1], m.r[2]); }); NT.x = innerWidth / 2; NT.y = innerHeight / 2; night.style.transition = 'none'; night.style.opacity = '1'; night.style.display = 'block'; toast('STEP 6 OF 6 · MOVE THE TORCH · TAP WHAT MOVED', 2.6); }, 2.2); }
  const movedPt = m => m.o.position.clone().add(V(0, m.k === 'king' ? 0 : 0.1, 0));
  function nightPress() { NT.x = ptr.x; NT.y = ptr.y; const m = nearestOf(MOVED.filter(q => !q.f), movedPt, 2.4) || nearestOf(MOVED.filter(q => !q.f && q.k === 'king'), movedPt, 3.6); if (!m) return;
    m.f = true; J.found++; J.lastF = J.t; ding(); addGold(3); toast('FOUND · ' + m.n + ' · ' + J.found + '/5', 1.6); const hp = m.home.clone(); fly(m.o, hp, 0.9, 1.2, () => { m.o.rotation.copy(m.homeR); burst(hp, 4, '#ffd23a', 0.6); });
    if (J.found >= 5) { J.sub = 'nightDone'; glint.style.display = 'none'; if (J.t - J.nt0 < 60) J.clean++; addGold(5); NEXT('nightDone', () => { night.style.transition = 'opacity 0.8s'; night.style.opacity = '0'; setTimeout(() => { if (!J || J.sub !== 'night') night.style.display = 'none'; }, 900);
      sayTo(qT, [ln('Lights! All back. Who moves things at night? We do not have a cat. Do we?')], null, true); NEXT('nightOut', finishVisit, 2.0); }, 1.0); } }
  function nightTick() { if (J.nt0 == null) J.nt0 = J.t; const r = Math.min(innerWidth, innerHeight) * 0.17 + 40; night.style.background = 'radial-gradient(circle at ' + Math.round(NT.x) + 'px ' + Math.round(NT.y) + 'px, rgba(4,6,14,0) 0px, rgba(4,6,14,0) ' + Math.round(r * 0.5) + 'px, rgba(4,6,14,0.94) ' + Math.round(r) + 'px)';
    if (J.t - J.lastF > 10) { const m = MOVED.find(q => !q.f); if (m) { const s = scrW(movedPt(m)); glint.style.display = 'block'; glint.style.left = s[0] + 'px'; glint.style.top = s[1] + 'px'; const k = 1 + 0.25 * Math.sin(J.t * 8); glint.style.transform = 'scale(' + k + ')'; } } else glint.style.display = 'none'; }
  // ---- PAY + PRIZE ----
  function finishVisit() { J.sub = 'pay'; J.step = 6; placeQ('idle'); const b = save.stat('msBest', 0); if (J.gold > b) save.setStat('msBest', J.gold); if (J.clean >= 5) { addGold(15); toast('CLEAN EVENING · +15 GOLD', 2); }
    const g2 = giveGift(), tot = J.gold, first = !K.stars('evening'), op = ['What an evening!', 'A grand evening.', 'History, sorted.', 'Not one muddle left.'][save.stat('msVisits', 1) % 4];
    sayTo(endT, [ln(op + ' ' + tot + ' gold. ' + (g2.kind === 'cur' ? "A curator's jacket and monocle. The stand by the door swaps them." : g2.kind === 'coin' ? 'An ancient coin. A quarter more gold in here.' : g2.kind === 'fossil' ? 'A real fossil, for your shelf at home.' : g2.kind === 'donor' ? 'Your name is on the Friends plaque now. In gold!' : 'Twenty extra, for my favourite helper.'))], null, true);
    K.finish('evening', J.clean >= 5 ? 3 : J.clean >= 3 ? 2 : 1, tot, first);
    NEXT('pay', () => { stop(); }, 1.2); }
  // ---- input dispatch ----
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'pot') potPress(); else if (s === 'fake') fakePress(); else if (s === 'label') plqPress(); else if (s === 'lift') hangPress(); else if (s === 'night') nightPress(); else if (s === 'dust' || s === 'polish') dustDrag(); }
  function drag() { if (!J) return; const s = J.sub; if (s === 'pot') potDrag(); else if (s === 'label') plqDrag(); else if (s === 'level') hangDrag(); else if (s === 'dust' || s === 'polish') dustDrag(); else if (s === 'night') { NT.x = ptr.x; NT.y = ptr.y; } }
  function release() { if (!J) return; const s = J.sub; if (s === 'pot') potRelease(); else if (s === 'label') plqRelease(); else if (s === 'dust' || s === 'polish') DUSTER.visible = false; }
  // ---- the visit card ----
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 1px;font-size:9px;font-weight:900;border:2px solid #201e1d;overflow:hidden;text-align:left;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  const levelBar = a => { const x = clamp(50 - a * 200, 4, 96); return '<div style="height:22px;border:2px solid #201e1d;margin:6px 0;background:#ffd23a;position:relative"><div style="position:absolute;left:44%;width:12%;top:0;bottom:0;background:#3f9a5e"></div><div style="position:absolute;top:3px;width:12px;height:12px;margin-left:-6px;border-radius:50%;background:#7be0ff;border:2px solid #201e1d;left:' + x.toFixed(1) + '%"></div></div>'; };
  function drawCard() { if (!J) return; const s = J.sub, tall = innerHeight >= 720; let next = '', det = '', key = s + J.step + '_' + J.gold, hd = J.step ? 'STEP ' + J.step + ' OF 6 · ' + STEP_N[J.step - 1] : 'THE BIG EVENING', hr = J.gold ? J.gold + ' G' : '';
    if (s === 'intro') { next = 'LISTEN TO PROF. QUILL'; det = row(RED, 'SIX JOBS BEFORE THE GUESTS', '', false); }
    else if (J.step === 1) { key += J.placed + '_' + J.wrong + (J.sel ? 's' : ''); next = J.sel && !J.held ? 'TAP ITS GAP ON THE POT' : 'DRAG A PIECE ONTO ITS GAP'; det = row('#c4683a', 'PIECES', J.placed + '/5', J.placed > 0) + row('#cfcac3', 'MIX-UPS', String(J.wrong), false) + small('YELLOW = AN EMPTY GAP'); }
    else if (J.step === 2) { const dn = PUFFS.filter(q => q.hp <= 0).length, pn = RINGS.filter(q => q.hp <= 0).length; key += dn + '_' + pn + s; next = s === 'dust' ? 'RUB THE DUST OFF' : s === 'polish' ? 'RUB THE YELLOW RINGS' : 'GLEAMING'; det = row('#8c7b62', 'DUST', dn + '/12', dn >= 12) + (s !== 'dust' ? row(YEL, 'SHINE', pn + '/4', pn >= 4) : '') + bar(s === 'dust' ? dn / 12 : pn / 4); }
    else if (J.step === 3) { const F = FAKES[Math.min(2, J.round)]; key += J.round + '_' + J.fw; next = s === 'fake' ? 'TAP THE FAKE' : 'FOUND IT'; det = small('ROUND ' + Math.min(3, J.round + 1) + ' OF 3 · ' + F.kind) + big('THE REAL ONE HAS:<br>' + F.cat.join('<br>'), INK, YEL) + row(GREEN, 'FAKES FOUND', J.ok + '/3', J.ok > 0); }
    else if (J.step === 4) { key += J.lab + '_' + J.lw + (J.sel ? 's' : ''); next = J.sel && !J.held ? 'TAP ITS CASE' : 'DRAG A PLAQUE TO ITS CASE'; det = PLQ.map(q => row(q.placed ? INK : '#fbf8f0', q.s.w + ' · ' + q.s.s, q.placed ? '\u2713' : '\u2014', q.placed)).join(''); }
    else if (J.step === 5 && s !== 'pay') { const h = HP[Math.min(1, J.hi)]; key += J.hi + '_' + (s === 'level' ? Math.round(h.a * 300) : ''); next = s === 'lift' ? 'TAP THE PAINTING' : s === 'level' ? 'DRAG LEFT OR RIGHT' : 'STRAIGHT'; det = small('PAINTING ' + Math.min(2, J.hi + 1) + ' OF 2 · ' + h.o.name) + (s === 'level' ? levelBar(h.a) + small('HOLD THE BUBBLE IN THE GREEN') : ''); }
    else if (J.step === 6 && s !== 'pay') { key += (J.found || 0); next = s === 'night' ? 'MOVE THE TORCH · TAP WHAT MOVED' : s === 'nightIn' ? 'LIGHTS OUT\u2026' : 'LIGHTS ON'; det = MOVED.map(m => row(m.f ? GREEN : '#201e1d', m.n, m.f ? '\u2713' : '?', m.f)).join(''); }
    if (s === 'pay') { key = 'pay' + J.gold; hd = 'THE BIG EVENING · DONE'; next = 'ALL DONE'; det = row(GOLD, 'GOLD', J.gold + ' G', true) + row(GREEN, 'CLEAN STEPS', J.clean + '/6', J.clean >= 5); }
    setCard(key, head2(hd, hr) + foot(next) + '<div style="padding:8px 10px 10px">' + (tall && J.step ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { clearFakes(); J.flies.length = 0; } J = null; ptr.down = false; hideCard(); placeQ('idle'); shardsHome(); PUFFS.forEach(q => { q.m.visible = false; }); RINGS.forEach(q => { q.m.visible = false; }); DUSTER.visible = false;
    PLQ.forEach(q => { q.g.visible = false; q.s.done = true; redraw(q.s.tex, labFn(q.s)); }); HP.forEach(h => { h.lvl.visible = false; if (save.stat('msHung', false)) hangHome(h); else hangLean(h); }); movedHome(); night.style.display = 'none'; glint.style.display = 'none'; }
  // ================= THE TOUR (game 2) =================
  const EX = [{ k: 'rex', n: 'FOXASAURUS REX', x: 179.5, z: -118.7, look: [CX, 3, CZ], plaque: 'FOXASAURUS REX lived 66 million years ago. It had 42 teeth and ate mostly fish.', q: 'What did it eat?', a: ['FISH', 'ROCKS', 'PIES'] },
    { k: 'rocket', n: 'SKYFOX 1', x: 182.6, z: -109.6, look: [182.8, 4.5, -105.2], plaque: 'SKYFOX 1 was the first Meru rocket. It flew 8 km up and landed in the lake.', q: 'Where did it land?', a: ['IN THE LAKE', 'ON THE CASTLE', 'ON THE MOON'] },
    { k: 'armour', n: 'ARMOUR HALL', x: 177.5, z: -130.8, look: [177.5, 1.6, -133.8], plaque: 'Old Meru guards wore pointed helmets so their ears had room inside.', q: 'Why are the helmets pointy?', a: ['ROOM FOR EARS', 'TO LOOK TALL', 'TO KEEP OFF RAIN'] },
    { k: 'kings', n: 'GALLERY OF KINGS', x: 189.4, z: -130.8, look: [X1, 2.6, -131.0], plaque: 'Every ruler of Meru has a portrait here. King Might has the newest one.', q: 'Who has the newest portrait?', a: ['KING MIGHT', 'THE BUILDER KING', 'PROFESSOR QUILL'] },
    { k: 'gates', n: 'THE 8 GATES', x: 188.4, z: -118.2, look: [CASE_X, 1.3, -120.9], plaque: 'Meru is one of 8 worlds, each with its own gate. This hall has one case for each world.', q: 'How many gates are there?', a: ['8', '3', '100'] },
    { k: 'model', n: 'OLD MERU', x: 175.6, z: -124.6, look: [175.6, 1.0, -126.4], plaque: 'This is Meru 100 years ago. The fountain was already in the middle of town.', q: 'What was in the middle of town?', a: ['THE FOUNTAIN', 'A ROCKET', 'A SKATE PARK'] }];
  const VIS = [{ name: 'NANA FERN', torso: ['#9a6aa8', '#ede9fe', '#5b3d6b'], s: 1.0 }, { name: 'PIP', torso: ['#ffd23a', '#201e1d', '#a16207'], s: 0.72 }, { name: 'MR. HOLT', torso: ['#2e86b8', '#e0f2fe', '#0b3a52'], s: 1.04 }, { name: 'TOBY', torso: ['#3f9a5e', '#f3f2f2', '#1f4f30'], s: 0.7 }];
  const visCache = []; const visFox = i => { if (visCache[i]) return visCache[i]; const C = VIS[i], f = kit.makeFox({ key: 'msVis' + i, torso: C.torso, outfit: i % 2 ? 'vest' : 'coat', mood: 'happy' }); f.scale.multiplyScalar(C.s); { const P = f.userData && f.userData.P; if (P && P.sword) P.sword.visible = false; } f.visible = false; G.add(f); visCache[i] = f; return f; };
  const SPOT = { start: { x: 175.3, z: -120.5, r: 0.85 }, tour: { x: 176.6, z: -115.0, r: 0.85 }, gear: { x: 173.9, z: -114.4, r: 0.8 } };
  const ringMesh = (x, z, c = 0xffd23a) => { const m = mm(new THREE.TorusGeometry(0.55, 0.05, 6, 28), new THREE.MeshBasicMaterial({ color: c }), x, 0.09, z, Math.PI / 2); G.add(m); return m; };
  const RS = ringMesh(SPOT.start.x, SPOT.start.z), RT = ringMesh(SPOT.tour.x, SPOT.tour.z), RGr = ringMesh(SPOT.gear.x, SPOT.gear.z), RStop = ringMesh(0, 0); RStop.scale.setScalar(1.5); RStop.visible = false;
  const BEACON = mm(Cy(0.55, 0.55, 3.2, 16, 1), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.18, depthWrite: false }), 0, 1.6, 0); BEACON.visible = false; G.add(BEACON);
  const ARROW = new THREE.Group(); { const c = mm(Co(0.16, 0.42, 4), new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false }), 0, 0, 0, Math.PI / 2); c.renderOrder = 6; ARROW.add(c); ARROW.visible = false; G.add(ARROW); }
  function startTour() { if (busy || TR) return false; const stops = shuffle(EX).slice(0, 4);
    TR = { stops, i: 0, phase: 'walk', t: 0, trail: [[SPOT.tour.x, SPOT.tour.z]], vis: VIS.map((v, i) => { const f = visFox(i); f.visible = true; f.position.set(SPOT.tour.x - 0.8 - i * 0.6, 0, SPOT.tour.z + 0.9); f.rotation.y = 0; return { f, i }; }), gold: 0, right: 0, waitT: 0, gather: null, look: null };
    pop(); toast('THE TOUR · 4 VISITORS · FOLLOW THE ARROW · READ THE PLAQUES', 3); return true; }
  const tGold = n => { n = Math.max(0, Math.round(n * goldK())); TR.gold += n; save.addGold(n); return n; };
  const curStop = () => (TR.phase === 'home' || TR.phase === 'leave' ? { x: SPOT.tour.x, z: SPOT.tour.z, n: 'THE PODIUM' } : TR.stops[TR.i]);
  function arrive(P) { const s = curStop(); busy = 'quiz'; TR.phase = 'plaque'; TR.t = 0; TR.look = s.look; const ux = P.x - s.look[0], uz = P.z - s.look[2], L = Math.hypot(ux, uz) || 1, u = [ux / L, uz / L], w = [-u[1], u[0]];
    TR.gather = [-2.5, -1.4, 1.4, 2.5].map(k => [P.x - u[0] * (Math.abs(k) > 2 ? 0.2 : 0.6) + w[0] * k, P.z - u[1] * (Math.abs(k) > 2 ? 0.2 : 0.6) + w[1] * k]).map(([x, z]) => [clamp(x, X0 + 0.5, X1 - 0.5), clamp(z, Z0 + 0.5, Z1 - 0.5)]);
    TR.order = shuffle([0, 1, 2]); RStop.visible = false; BEACON.visible = false; pop(); }
  function answer(i) { if (!TR || TR.phase !== 'ask') return; const s = TR.stops[TR.i], right = TR.order[i] === 0, asker = VIS[TR.i % 4].name;
    if (right) { cheer(); TR.right++; const g = tGold(8 + (TR.askT < 6 ? 3 : 0)); toast('RIGHT · ' + asker + ' IS DELIGHTED · +' + g, 1.8); } else { nope(); tGold(2); toast('THE PLAQUE SAYS: ' + s.a[0], 2.2); }
    TR.i++; busy = null; TR.gather = null; TR.look = null; if (TR.i >= 4) { TR.phase = 'home'; toast('LEAD THEM BACK TO THE PODIUM', 2); } else TR.phase = 'walk'; }
  function finishTour() { const bonus = tGold(20), tot = TR.gold; save.setStat('msTours', save.stat('msTours', 0) + 1); if (tot > save.stat('msTourBest', 0)) save.setStat('msTourBest', tot); cheer(); TR.phase = 'leave'; TR.t = 0; busy = null;
    sayTo(endT, [ln((TR.right === 4 ? 'Four out of four! A natural.' : TR.right + ' out of 4. The plaques know everything.') + ' ' + tot + ' gold in tips. They clapped!')]); { const first = !K.stars('tour'); K.finish('tour', TR.right >= 4 ? 3 : TR.right >= 2 ? 2 : 1, tot, first); } toast('TOUR DONE · +' + tot + ' GOLD', 2.2); }
  function cancelTour(msg) { if (!TR) return; TR.vis.forEach(v => { v.f.visible = false; }); TR = null; if (busy === 'quiz') busy = null; RStop.visible = false; BEACON.visible = false; ARROW.visible = false; hideCard(); if (msg) toast(msg, 2); }
  const blocksCam = (p, P) => { const c = camera.position, ax = P.x - c.x, az = P.z - c.z, L2 = ax * ax + az * az || 1, t = ((p.x - c.x) * ax + (p.z - c.z) * az) / L2; if (t < -0.1 || t > 0.92) return false; return Math.hypot(c.x + ax * t - p.x, c.z + az * t - p.z) < 1.0; };
  function tourTick(dt, P) { if (!TR) return; const t = performance.now() / 1000; if (!inShop(P) && TR.phase !== 'leave') { cancelTour('THE GROUP STAYED INSIDE · TOUR ENDED'); return; }
    const last = TR.trail[TR.trail.length - 1]; if (Math.hypot(P.x - last[0], P.z - last[1]) > 0.3) { TR.trail.push([P.x, P.z]); if (TR.trail.length > 160) TR.trail.shift(); }
    TR.vis.forEach((v, i) => { let tx, tz; if (TR.phase === 'leave') { tx = X0 + 0.6; tz = -118 + (i - 1.5) * 0.5; } else if (TR.gather) { [tx, tz] = TR.gather[i]; } else { const n = TR.trail.length, D = i < 2 ? 1.9 : 3.3; let j = n - 1, acc = 0; while (j > 0 && acc < D) { acc += Math.hypot(TR.trail[j][0] - TR.trail[j - 1][0], TR.trail[j][1] - TR.trail[j - 1][1]); j--; } const q = TR.trail[j], q2 = TR.trail[Math.min(n - 1, j + 1)], dx0 = q2[0] - q[0], dz0 = q2[1] - q[1], L0 = Math.hypot(dx0, dz0) || 1, sd = i % 2 ? 1.1 : -1.1; tx = clamp(q[0] - dz0 / L0 * sd, X0 + 0.5, X1 - 0.5); tz = clamp(q[1] + dx0 / L0 * sd, Z0 + 0.5, Z1 - 0.5); }
      const dx = tx - v.f.position.x, dz = tz - v.f.position.z, d = Math.hypot(dx, dz), sp = d > 0.3 ? Math.min(4.6, d * 2.4) : 0; if (sp) { v.f.position.x += dx / d * sp * dt; v.f.position.z += dz / d * sp * dt; turnTo(v.f, Math.atan2(dx, dz), dt); } else if (TR.look) turnTo(v.f, Math.atan2(TR.look[0] - v.f.position.x, TR.look[2] - v.f.position.z), dt);
      kit.animFox && kit.animFox(v.f, dt, sp); v.f.visible = TR.phase === 'leave' && TR.t > 4 ? false : !blocksCam(v.f.position, P) && v.f.position.distanceTo(camera.position) > 1.7; });
    const s = curStop(), dS = Math.hypot(P.x - s.x, P.z - s.z);
    if (TR.phase === 'walk' || TR.phase === 'home') { RStop.position.set(s.x, 0.09, s.z); RStop.visible = true; BEACON.position.set(s.x, 1.6, s.z); BEACON.visible = TR.phase === 'walk'; ARROW.visible = dS > 2; ARROW.position.set(P.x, (P.y || 0) + 2.55 + Math.sin(t * 4) * 0.06, P.z); ARROW.rotation.y = Math.atan2(s.x - P.x, s.z - P.z); TR.waitT -= dt;
      if (dS < 1.0) { if (TR.phase === 'home') { ARROW.visible = false; RStop.visible = false; finishTour(); } else if (TR.vis.some(v => Math.hypot(v.f.position.x - P.x, v.f.position.z - P.z) > 7)) { if (TR.waitT <= 0) { toast('WAIT FOR YOUR GROUP', 1.2); TR.waitT = 2; } } else { ARROW.visible = false; arrive(P); } } }
    else if (TR.phase === 'plaque') { TR.t += dt; if (TR.t > 2.6) { TR.phase = 'ask'; TR.askT = 0; } } else if (TR.phase === 'ask') TR.askT += dt;
    else if (TR.phase === 'leave') { TR.t += dt; RStop.visible = false; ARROW.visible = false; if (TR.t > 4.5) { TR.vis.forEach(v => { v.f.visible = false; }); TR = null; hideCard(); return; } }
    drawTourCard(dS); }
  const btn = (i, txt) => '<button data-ans="' + i + '" style="display:block;width:100%;min-height:44px;margin:6px 0 0;padding:8px 10px;text-align:left;font:900 15px Archivo,sans-serif;color:#201e1d;background:#f3f2f2;border:2px solid #201e1d;border-radius:0;cursor:pointer">' + (i + 1) + ' · ' + txt + '</button>';
  function drawTourCard(dS) { if (!TR || (busy && busy !== 'quiz')) return; const n = Math.min(4, TR.i + 1), hr = TR.gold ? TR.gold + ' G' : '';
    if (TR.phase === 'leave') { setCard('trLeave' + TR.gold, head2('THE TOUR · DONE', hr) + '<div style="padding:8px 10px 10px">' + row(GREEN, 'RIGHT ANSWERS', TR.right + '/4', TR.right >= 3) + row(GOLD, 'TIPS', TR.gold + ' G', true) + '</div>'); return; }
    if (TR.phase === 'home') { setCard('trHome' + Math.round(dS), head2('THE TOUR · LAST BIT', hr) + foot('BACK TO THE PODIUM \u00b7 ' + Math.round(dS) + ' M', false) + '<div style="padding:8px 10px 10px">' + row(GREEN, 'RIGHT ANSWERS', TR.right + '/4', TR.right >= 3) + '</div>'); return; }
    const s = TR.stops[TR.i];
    if (TR.phase === 'ask') { setCard('trAsk' + TR.i, head2('THE TOUR · STOP ' + n + '/4', hr) + '<div style="padding:8px 10px 10px">' + small(VIS[TR.i % 4].name + ' ASKS:') + '<div style="font-weight:900;font-size:17px;padding:2px 0 2px">' + s.q + '</div>' + TR.order.map((k, i) => btn(i, s.a[k])).join('') + '</div>', true); return; }
    const showP = TR.phase === 'plaque' || dS < 8; setCard('trW' + TR.i + TR.phase + (showP ? 'p' : '') + Math.round(dS), head2('THE TOUR · STOP ' + n + '/4', hr) + foot(TR.phase === 'plaque' ? 'THE GROUP IS READING\u2026' : 'NEXT · ' + s.n + ' \u00b7 ' + Math.round(dS) + ' M', false) + '<div style="padding:8px 10px 10px">' + (showP ? small('THE PLAQUE') + '<div style="font-weight:800;font-size:14px;line-height:1.3;padding:2px 0 4px;text-wrap:pretty">' + s.plaque + '</div>' : row(YEL, 'FOLLOW THE ARROW', '', false) + small('READ THE PLAQUE WHEN YOU GET CLOSE')) + '</div>'); }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub, st = J.step, W = -Math.PI / 2;
    if (s === 'intro' || s === 'pay' || s === 'nightOut') return [V(175.3, 1.3, -122.6), 4.0, 2.6, 0.25, 3, 0, 6];
    if (st === 1) return [V(190.7, 1.2, -105.0), 2.9, 1.4, 0.55, 1.6, W, 3.2];
    if (st === 2) return [V(177.5, (SBB.min.y + SBB.max.y) / 2, -133.3), 2.6, SBB.max.y - SBB.min.y + 0.5, 0.1, 2.6, 0, 7.5];
    if (st === 3) return [V(190.7, 1.15, -102.2), 2.2, 0.9, 0.45, 1.3, W, 2.9];
    if (st === 4) return [V(189.6, 0.95, -121.0), 5.2, 2.2, 0.42, 3, W, 7];
    if (st === 5) { const h = HP[Math.min(1, J.hi)], lo = s === 'lift'; return [V(h.o.x, lo ? 1.5 : 2.5, Z0), 2.6, lo ? 3.6 : 3.4, 0.08, 2.5, 0, 6.5]; }
    if (st === 6) return [V(CX, 0.6, -117.6), 9, 7, 0.85, 6, 0, 7.8];
    return null; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } }; function camFix(cam, dt, fox) { if (fox) { applyWear(fox); if (busy === 'job' && fox) fox.visible = false; }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); } if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v); camT.pos.x = clamp(camT.pos.x, X0 + 0.35, X1 - 0.35); camT.pos.z = clamp(camT.pos.z, Z0 + 0.35, Z1 - 0.35); camT.pos.y = Math.min(camT.pos.y, CEIL - 0.5);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HAND = document.createElement('div'); HAND.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HAND.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HAND); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'pot') { if (J.sel && !J.held) return [J.sel.home.clone(), 'TAP ITS GAP']; const q = SHARDS.find(z => !z.placed); return q ? [q.g.position.clone(), 'DRAG IT TO ITS GAP'] : null; }
    if (s === 'dust') { const q = PUFFS.find(z => z.hp > 0); return q ? [q.p.clone(), 'RUB THE DUST'] : null; }
    if (s === 'polish') { const q = RINGS.find(z => z.hp > 0); return q ? [q.m.position.clone(), 'RUB THE RING'] : null; }
    if (s === 'fake') return J.rw >= 1 ? [TP[J.fake].clone().add(V(0, 0.32, 0)), 'THIS ONE'] : null;
    if (s === 'label') { if (J.sel && !J.held) return [J.sel.s.p.clone(), 'TAP ITS CASE']; const q = PLQ.find(z => !z.placed); return q ? [q.g.position.clone(), 'DRAG IT TO ITS CASE'] : null; }
    if (s === 'lift' || s === 'level') { const h = HP[J.hi]; if (!h) return null; return [h.pv.getWorldPosition(V()), s === 'lift' ? 'TAP THE PAINTING' : Math.abs(h.a) < 0.018 ? 'HOLD STILL' : h.a > 0 ? 'DRAG RIGHT' : 'DRAG LEFT']; }
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HAND.style.display !== 'none') HAND.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HAND.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HAND.style.display = 'block'; HAND.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HAND.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 6;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r && (P.y || 0) < 2, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r && (P.y || 0) < 2;
  function prompt(P) { if (busy || !inShop(P) || P.skate) return null; if (TR) { if (TR.phase !== 'leave' && at(P, SPOT.tour) && TR.phase !== 'home') return 'END THE TOUR'; return null; }
    if (at(P, SPOT.start)) return 'THE BIG EVENING · HELP PROF. QUILL'; if (at(P, SPOT.tour)) return 'LEAD A TOUR · 4 VISITORS · 4 STOPS';
    if (own().cur && at(P, SPOT.gear)) return 'CURATOR LOOK ' + (curOn() ? 'OFF' : 'ON'); if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, qT)) return 'TALK · PROF. QUILL'; return null; }
  // s72: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ['Professor Quill. History. Books. Help me get ready for the big evening, or lead a tour.', 'Oh, you! Have you seen my glasses? On my head. Of course.', 'Back! The museum is in a muddle again. Naturally.', 'Every old thing has a story. What will yours be today?'];
  const TIPS = ["The Foxasaurus had forty-two teeth. I counted them twice. I got forty-one the second time.","I have read every book in Meru. Some of them twice. One of them I wrote, and I still lost my place.","Skyfox 1 landed in the lake. The fish were very surprised.","Please do not touch the glass. Fingerprints are history too, but the boring kind.","My glasses? On my head. I know. I always know. Eventually.","The workshop is staff only. You are staff now. Congratulations. There is no pay. There is gold.","Read the plaques before a tour. The visitors always ask about them."];
  const goWork = P => { if (P) Object.assign(P, { x: SPOT.start.x, z: SPOT.start.z, sp: 0 }); startVisit(); };
  const goTour = P => { if (P) Object.assign(P, { x: SPOT.tour.x, z: SPOT.tour.z, sp: 0 }); startTour(); };
  const toggleCur = () => { const on = !curOn(); putOn(on); pop(); toast(on ? 'CURATOR LOOK ON · TWEED + MONOCLE' : 'CURATOR LOOK OFF', 1.6); };
  const qMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy && !TR) goWork(lastP); } }, { text: 'LEAD A TOUR', pick: () => { if (!busy && !TR) goTour(lastP); } }, ...(own().cur ? [{ text: 'MY CURATOR LOOK', pick: () => { if (!busy) toggleCur(); } }] : []),
      { text: 'A HISTORY FACT, PLEASE', pick: () => sayTo(qT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(qT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy === 'quiz') { toast('PICK AN ANSWER ON THE CARD', 1.4); return true; } if (busy) return true; if (!inShop(P) || P.skate) return false;
    if (TR) { if (at(P, SPOT.tour) && TR.phase !== 'leave' && TR.phase !== 'home') { cancelTour('TOUR ENDED · TIPS KEPT'); return true; } if (near(P, qT)) { sayTo(qT, [ln('You have a group! Go on, they are waiting for you. Follow the arrow.')]); return true; } return false; }
    if (at(P, SPOT.start)) { startVisit(); return true; } if (at(P, SPOT.tour)) { startTour(); return true; }
    if (own().cur && at(P, SPOT.gear)) { toggleCur(); return true; }
    if (K.atHiring(P)) { ding(); goWork(P); return true; }
    if (!near(P, qT)) return false; pop(); qMenu(!talked++); return true; }
  function quit() { if (busy === 'quiz') { toast('PICK AN ANSWER ON THE CARD', 1.4); return; } stop(); toast('THE EVENING CAN WAIT · GOLD KEPT', 2); }
  function useItem(id) { if (id === 'fossil' && save.count('fossil')) { toast('A REAL FOSSIL · IT GOES ON YOUR HOME SHELF', 2.2); return true; } if (id === 'ancientCoin' && save.count('ancientCoin')) { toast('ANCIENT COIN · +25 % GOLD AT THE MUSEUM', 2.2); return true; } return false; }
  // ---------- tick ----------
  stop();
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, dH = Math.hypot(P.x - CX, P.z - CZ); G.visible = dH < (touch ? 45 : 90); toastT -= dt; tourTick(dt, P);
    if (busy === 'job' && J && !inShop(P)) stop();
    if (busy === 'job' && J) { J.t += dt; if (J.flies.length) flyTick(dt);
      if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } }
      if (J && J.step === 5) hangTick(dt); if (J && J.sub === 'night') nightTick();
      if (J && J.step === 1) { const hint = SHARDS.find(s => !s.placed && s.miss >= 2), sel = J.sel; SHARDS.forEach(s => { if (!s.gh.visible) return; s.gh.material = ghostM; }); ghostM.opacity = hint ? 0.25 + 0.2 * Math.sin(t * 8) : sel ? 0.3 + 0.12 * Math.sin(t * 6) : 0.32; }
      if (J && J.sub === 'polish') RINGS.forEach(R => { if (R.m.visible) R.m.lookAt(camera.position); });
      if (J) drawCard(); }
    hintTick(t); partTick(dt); if (!G.visible) return;
    ROCKET.rotation.y = Math.sin(t * 0.3) * 0.05; RS.visible = !busy && !TR; RT.visible = !busy && (!TR || TR.phase === 'walk'); RGr.visible = !busy && !TR && own().cur; standJacket.visible = own().cur && !curOn();
    { const work = busy === 'job'; K.tick(dt, P, { inShop: inShop(P), busy: work || !!TR, near: dH, talking: work });   // s72: shop kit runs Quill's idle / wave / look-at
      if (work) turnTo(quill, quill.userData.face0 ?? 0, dt * 0.5); } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, tour: () => TR, startVisit, startTour, answer, useItem, quill, hangA: () => (J && HP[J.hi] ? HP[J.hi].a : null), camera, save,
    tap(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); release(); ptr.down = false; }, down(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); }, dragTo(x, y) { ptr.down = true; ptr.lx = ptr.x; ptr.ly = ptr.y; ptr.x = x; ptr.y = y; drag(); }, release() { release(); ptr.down = false; },
    targets() { if (!J) return []; const s = J.sub; if (s === 'pot') return SHARDS.filter(q => !q.placed).map(q => ({ from: scrW(q.g.position), to: scrW(q.home) })); if (s === 'dust') return PUFFS.filter(q => q.hp > 0).map(q => scrW(q.p)); if (s === 'polish') return RINGS.filter(q => q.hp > 0).map(q => scrW(q.m.position));
      if (s === 'fake') return [scrW(TP[J.fake].clone().add(V(0, 0.32, 0)))]; if (s === 'label') return PLQ.filter(q => !q.placed).map(q => ({ from: scrW(q.g.position), to: scrW(q.s.p) })); if (s === 'lift') return [[innerWidth / 2, innerHeight / 2]]; if (s === 'night') return MOVED.filter(q => !q.f).map(q => scrW(movedPt(q))); return []; },
    skipTo(s) { if (!J) startVisit(); J.pause = 0; J.after = null; J.flies.length = 0; shardsHome(); PUFFS.forEach(q => { q.m.visible = false; }); RINGS.forEach(q => { q.m.visible = false; }); clearFakes(); PLQ.forEach(q => { q.g.visible = false; });
      ({ pot: beginPot, dust: beginDust, fake: beginFake, label: beginLabel, hang: beginHang, night: beginNight, pay: finishVisit })[s](); },
    hiring: K, dispose() { card.remove(); night.remove(); glint.remove(); HAND.remove(); K.dispose(); } };
  window.__museum = API; return API;
}
