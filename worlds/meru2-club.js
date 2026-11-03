// MERU 2.0 — s60 TOWN 2 INTERIOR 18: MERU COUNTRY CLUB [meruClub] (shell f 288..326 × 62..82, front door N (307, 62), back door S (307, 82) onto the terrace + the green
// behind (green f 288..326 × 86..128: town2.js putting green + bunker + flag); a VALET LOT on the west side, x 266..288). SIR PERCY FAIRWAY (club captain, silver fox,
// navy blazer, white flat cap). SEVEN SHORT GAMES, one per yellow ring (Ben's pick: 7 of 8, gentle, no fail): CADDIE (pick the right club, 5 lies on the 18th) ·
// DRIVING RANGE · SERVE THE TERRACE (carry the tray out the back door) · CROQUET ON THE LAWN · POLISH THE TROPHIES · VALET PARKING · POOL LIFEGUARD.
// The MEMBERSHIP board ticks each; all 7 = FULL MEMBERSHIP +60 gold + the SILVER CUP. Prizes per clear in turn: CLUB BLAZER (+ white flat cap, worn; MY BLAZER hook
// toggles) → CLUB SANDWICH ×3 (+35 HP) → then +20 gold, a CLUB SANDWICH every 3rd clear.
import { floraRemove } from './meru2-flora.js';
// s74 INTERIOR POLISH 18: shopKit (Sir Percy = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board for all 7 jobs; badge), NOW HIRING inside the front door,
// ONE-box menu with choices, 1-box intros + end line, hint hand (from targets()), touch radius 44, portrait lens, cameras clamped inside each indoor room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
export function buildClub({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false }) {
  try { floraRemove((x, z) => x > 265 && x < 327.5 && z > 57 && z < 128.6 && !(x > 287.5 && z < 82.5)); for (let i = cols.length - 1; i >= 0; i--) { const q = cols[i]; if (q && q.c && q.c[2] < 1.6 && q.c[0] > 265 && q.c[0] < 327.5 && q.c[1] > 57 && q.c[1] < 128.6 && !(q.c[0] > 287.5 && q.c[1] < 82.5)) cols.splice(i, 1); } } catch (e) {}   // trees / tufts off the valet lot, terrace, pool, lawn + range
  const X0 = 288.4, X1 = 325.6, Z0 = 62.4, Z1 = 81.6, CEIL = 5.0, OX = 300, OZ = 92;
  const G = new THREE.Group(); G.name = 'club'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const putM = (geo, m4, hex) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(m4); const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => putM(geo, new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)), hex);
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, putM, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 10, 7), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), RG = mk(), { box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c, fn }; return t; };
  const redraw = (t, fn) => { const c = t.userData.c; fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; };
  const rect = (a, b, c2, d) => { const o = { f: [a, b, c2, d] }; cols.push(o); return o; };
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', BLUE = '#2e86b8', GREEN = '#3f9a5e', STEEL = '#9aa3ab', DARK = '#3d3b3a', WOOD = '#8a6440';
  const GOLD = '#e6b45a', CREAM = '#efe8da', SILVER = '#d4dade', SAND = '#e3cc94', MAHOG = '#6b3f2a', BRASS = '#c9a03a', FOREST = '#2f5a3a', ORANGE = '#f28c28';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 10) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0, par = G, rx = 0, tr = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, transparent: tr, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); par.add(m); return m; };
  const plane2 = (map, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.MeshBasicMaterial({ map }); for (const k of [0, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); p.rotation.y = ry + k * Math.PI; p.position.set(x + Math.sin(ry) * (k ? -0.006 : 0.006), y, z + Math.cos(ry) * (k ? -0.006 : 0.006)); par.add(p); } };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, s = 14) => new THREE.CylinderGeometry(a, b, h, s), Sp = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b), Co = (r, h, s = 8) => new THREE.ConeGeometry(r, h, s);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const subMesh = R => new THREE.Mesh(R.geo(), new THREE.MeshLambertMaterial({ vertexColors: true }));
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false });
  const mkRing = (r = 0.12, w = 0.025, par = G, mat = ringM) => { const m = mm(new THREE.TorusGeometry(r, w, 6, 24), mat); m.renderOrder = 3; m.visible = false; par.add(m); return m; };
  const cap = s => s.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
  // ================= FLOORS (oak planks, navy runner + crest in the lobby, green carpet in the trophy room, tartan in the pro shop) =================
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#8a5d34' : '#a87445'; g.fillRect(0, i * 32, W, 32); g.fillStyle = '#5f3e20'; g.fillRect(0, i * 32, W, 2); g.fillRect((i * 97) % 256, i * 32, 3, 32); g.fillRect((i * 97 + 128) % 256, i * 32, 3, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 2.4, (Z1 - Z0) / 2.4); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set((X0 + X1) / 2, 0.07, (Z0 + Z1) / 2); G.add(f);
    box(2.4, 0.01, Z1 - Z0 - 0.2, NAVY, 307, 0.078, (Z0 + Z1) / 2); for (const x of [305.85, 308.15]) box(0.08, 0.012, Z1 - Z0 - 0.2, GOLD, x, 0.08, (Z0 + Z1) / 2);
    cyl(1.4, 1.4, 0.012, GOLD, 307, 0.084, 71.6, 28); cyl(1.2, 1.2, 0.014, NAVY, 307, 0.086, 71.6, 28);
    const cr = CT(256, 256, (g, W, H) => { g.clearRect(0, 0, W, H); g.fillStyle = GOLD; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 120px Archivo, sans-serif'; g.fillText('MC', W / 2, H / 2 - 10); g.font = '900 30px Archivo, sans-serif'; g.fillText('EST. 1902', W / 2, H / 2 + 72); });
    plane(cr, 2.0, 2.0, 307, 0.09, 71.6, 0, G, -Math.PI / 2, true);
    box(X1 - 313.3, 0.01, 72 - Z0 - 0.3, FOREST, (313.2 + X1) / 2, 0.078, (Z0 + 72) / 2);
    const tt = CT(128, 128, (g, W, H) => { g.fillStyle = '#7a2222'; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(32,40,60,0.55)'; g.fillRect(0, 40, W, 28); g.fillRect(40, 0, 28, H); g.fillStyle = 'rgba(230,180,90,0.7)'; g.fillRect(0, 100, W, 4); g.fillRect(100, 0, 4, H); });
    tt.wrapS = tt.wrapT = THREE.RepeatWrapping; tt.repeat.set(5, 4); const f2 = new THREE.Mesh(new THREE.PlaneGeometry(X1 - 313.4, Z1 - 72.3), new THREE.MeshLambertMaterial({ map: tt })); f2.rotation.x = -Math.PI / 2; f2.position.set((313.2 + X1) / 2, 0.08, (72 + Z1) / 2); G.add(f2); }
  // ================= WALLS (ink skirting, navy panelling, gold rail, cream) + partitions + ceiling =================
  const wall = (len, x, z, ry) => { box(len, 0.15, 0.07, INK, x, 0.075, z, ry); box(len, 1.1, 0.06, NAVY, x, 0.7, z, ry); box(len, 0.08, 0.09, GOLD, x, 1.29, z, ry); box(len, CEIL - 1.33, 0.06, CREAM, x, 1.33 + (CEIL - 1.33) / 2, z, ry); };
  for (const [a, b] of [[X0, 305.6], [308.4, X1]]) { wall(b - a, (a + b) / 2, Z0 + 0.03, 0); wall(b - a, (a + b) / 2, Z1 - 0.03, 0); } wall(Z1 - Z0, X0 + 0.03, (Z0 + Z1) / 2, Math.PI / 2); wall(Z1 - Z0, X1 - 0.03, (Z0 + Z1) / 2, Math.PI / 2);
  function part(ax, a, b, c, gaps) { const T = 0.07; let s = a; for (const [g0, g1] of [...gaps, [b, b]]) { if (g0 - s > 0.05) { const L2 = g0 - s, m = (s + g0) / 2;
      if (ax === 'x') { wall(L2, m, c - T, 0); wall(L2, m, c + T, 0); box(L2, 0.05, 0.14, CREAM, m, CEIL - 0.03, c); rect(s, g0, c - 0.1, c + 0.1); } else { wall(L2, c - T, m, Math.PI / 2); wall(L2, c + T, m, Math.PI / 2); box(0.14, 0.05, L2, CREAM, c, CEIL - 0.03, m); rect(c - 0.1, c + 0.1, s, g0); } } s = g1; }
    for (const [g0, g1] of gaps) { const L2 = g1 - g0, m = (g0 + g1) / 2, hh = CEIL - 2.6; if (ax === 'x') { box(L2, hh, 0.2, CREAM, m, 2.6 + hh / 2, c); box(L2 + 0.1, 0.12, 0.24, GOLD, m, 2.6, c); } else { box(0.2, hh, L2, CREAM, c, 2.6 + hh / 2, m); box(0.24, 0.12, L2 + 0.1, GOLD, c, 2.6, m); } } }
  part('z', Z0, Z1, 301, [[65.5, 71.5], [76.5, 80.5]]); part('z', Z0, Z1, 313, [[65.5, 69.5], [75.0, 78.5]]); part('x', 313, X1, 72, [[318, 320.5]]);
  { const sh = new THREE.Shape(); sh.moveTo(X0, Z0); sh.lineTo(X1, Z0); sh.lineTo(X1, Z1); sh.lineTo(X0, Z1); sh.lineTo(X0, Z0); const cm = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshLambertMaterial({ color: '#efe9de' })); cm.rotation.x = Math.PI / 2; cm.position.y = CEIL; G.add(cm);
    const lm2 = new THREE.MeshBasicMaterial({ color: '#fff3d6' }), lg = new THREE.CircleGeometry(0.32, 14); for (let x = 291.5; x < X1; x += 4.6) for (let z = 65.5; z < Z1; z += 4.4) { if (Math.abs(x - 307) < 2 && Math.abs(z - 71.6) < 2) continue; const p = new THREE.Mesh(lg, lm2); p.rotation.x = Math.PI / 2; p.position.set(x, CEIL - 0.01, z); G.add(p); }
    // lobby chandelier (gold ring + glowing drops)
    cyl(0.012, 0.012, 1.0, GOLD, 307, CEIL - 0.5, 71.6, 5); const ch = new THREE.Group(); ch.add(mm(new THREE.TorusGeometry(0.75, 0.04, 6, 24), LM(GOLD), 0, 0, 0, Math.PI / 2), mm(new THREE.TorusGeometry(0.4, 0.03, 6, 18), LM(GOLD), 0, -0.25, 0, Math.PI / 2));
    const dm = new THREE.MeshBasicMaterial({ color: '#fff6dc' }); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ch.add(mm(Sp(0.07, 8, 6), dm, Math.cos(a) * 0.75, 0.08, Math.sin(a) * 0.75)); } for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; ch.add(mm(Sp(0.06, 8, 6), dm, Math.cos(a) * 0.4, -0.18, Math.sin(a) * 0.4)); }
    ch.position.set(307, CEIL - 1.05, 71.6); G.add(ch); }
  plane2(label('MERU COUNTRY CLUB · MEMBERS + GUESTS', NAVY, '#ffffff', 1024, 64, 34), 3.6, 0.3, 307, 3.5, 65.6); for (const s of [-1, 1]) cyl(0.01, 0.01, CEIL - 3.65, INK, 307 + s * 1.6, 3.65 + (CEIL - 3.65) / 2, 65.6, 4);
  const doorSign = (txt, x, z, ry, y = 2.9) => plane2(label(txt, NAVY, GOLD, 256, 48, 28), 1.5, 0.28, x, y, z, ry);
  doorSign('THE 19TH HOLE', 301, 68.5, Math.PI / 2); doorSign('TO THE PASS', 301, 78.5, Math.PI / 2); doorSign('TROPHY ROOM', 313, 67.5, Math.PI / 2); doorSign('PRO SHOP', 313, 76.75, Math.PI / 2); doorSign('TERRACE · POOL · COURSE', 307, Z1 - 0.12, 0, 3.2);
  // ================= LOBBY: members' desk, sofa, the founders' portrait, MEMBERSHIP board, MY BLAZER hook =================
  box(3.4, 1.05, 0.8, MAHOG, 310.9, 0.525, 65.6); box(3.5, 0.05, 0.9, '#c9a77a', 310.9, 1.075, 65.6); box(3.42, 0.12, 0.02, GOLD, 310.9, 0.86, 66.01); rect(309.2, 312.6, 65.2, 66.0);
  plane(label('MEMBERS · GUESTS · SIGN IN', NAVY, '#ffffff', 512, 48, 28), 2.6, 0.22, 310.9, 0.5, 66.02);
  cyl(0.07, 0.08, 0.02, BRASS, 309.8, 1.11, 65.75, 12); sph(0.055, BRASS, 309.8, 1.12, 65.75, 1, 0.8, 1); box(0.44, 0.03, 0.32, '#5a2a1a', 311.0, 1.11, 65.7, 0.1); box(0.42, 0.034, 0.02, WHITE, 311.0, 1.12, 65.86, 0.1);
  cyl(0.07, 0.09, 0.03, BRASS, 312.2, 1.115, 65.5, 10); cyl(0.012, 0.012, 0.32, BRASS, 312.2, 1.27, 65.5, 6); G.add(mm(new THREE.CylinderGeometry(0.04, 0.12, 0.1, 12, 1, true), new THREE.MeshBasicMaterial({ color: '#3f9a5e', side: THREE.DoubleSide }), 312.2, 1.43, 65.5));
  box(0.9, 0.45, 2.2, '#7a2a1a', 312.35, 0.225, 72.3); box(0.25, 0.75, 2.2, '#7a2a1a', 312.75, 0.6, 72.3); for (const z of [71.15, 73.45]) box(0.9, 0.62, 0.2, '#7a2a1a', 312.35, 0.31, z); rect(311.85, 312.95, 71.1, 73.5);
  box(0.7, 0.04, 1.0, '#c9a77a', 310.9, 0.46, 72.3); for (const sx of [-1, 1]) for (const sz of [-1, 1]) box(0.04, 0.44, 0.04, MAHOG, 310.9 + sx * 0.3, 0.22, 72.3 + sz * 0.45); rect(310.5, 311.3, 71.75, 72.85); box(0.3, 0.02, 0.22, GREEN, 310.85, 0.49, 72.2, 0.3);
  { const t = CT(512, 384, (g, W, H) => { g.fillStyle = '#3a4a3a'; g.fillRect(0, 0, W, H); g.fillStyle = '#5f7a5a'; g.fillRect(0, 250, W, 134); g.fillStyle = '#e6c890'; g.fillRect(0, 0, W, 30);
      for (const [x, s, c] of [[140, 1.1, '#9a9490'], [260, 1.25, '#c87a3a'], [380, 1.0, '#8a6a4a']]) { g.fillStyle = c; g.beginPath(); g.ellipse(x, 300 - 90 * s, 40 * s, 75 * s, 0, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x, 300 - 190 * s, 32 * s, 0, Math.PI * 2); g.fill(); for (const e of [-1, 1]) { g.beginPath(); g.moveTo(x + e * 12 * s, 300 - 212 * s); g.lineTo(x + e * 28 * s, 300 - 250 * s); g.lineTo(x + e * 32 * s, 300 - 200 * s); g.fill(); } g.fillStyle = NAVY; g.fillRect(x - 40 * s, 300 - 150 * s, 80 * s, 110 * s); }
      g.fillStyle = GOLD; g.font = '900 26px Archivo, sans-serif'; g.fillText('THE FOUNDERS · 1902', 140, 360); });
    plane(t, 2.2, 1.65, 301.12, 2.7, 74.0, Math.PI / 2); box(0.06, 1.85, 2.4, GOLD, 301.09, 2.7, 74.0); }
  const DOING = [['caddie', 'CADDIE'], ['range', 'DRIVING RANGE'], ['waiter', 'SERVE THE TERRACE'], ['croquet', 'CROQUET'], ['trophies', 'POLISH THE TROPHIES'], ['valet', 'VALET PARKING'], ['lifeguard', 'POOL LIFEGUARD']];
  const doneMap = () => { const d = save.stat('ccDone', null); return d && typeof d === 'object' ? d : {}; };
  const boardFn = (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = NAVY; g.fillRect(0, 0, W, 60); g.fillStyle = GOLD; g.textBaseline = 'middle'; g.font = '900 32px Archivo, sans-serif'; g.fillText('MEMBERSHIP CARD', 16, 32); const d = doneMap();
    DOING.forEach(([k, n], i) => { const y = 88 + i * 40; g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(18, y - 13, 26, 26); if (d[k]) { g.strokeStyle = GREEN; g.lineWidth = 7; g.beginPath(); g.moveTo(22, y); g.lineTo(30, y + 9); g.lineTo(44, y - 13); g.stroke(); } g.fillStyle = INK; g.font = '800 24px Archivo, sans-serif'; g.fillText(n, 58, y + 2); });
    g.fillStyle = d.full ? GREEN : '#9a948c'; g.font = '900 20px Archivo, sans-serif'; g.fillText(d.full ? 'FULL MEMBER · BEN' : 'ALL 7 = FULL MEMBERSHIP', 18, H - 18); };
  const boardTex = CT(512, 400, boardFn); box(0.06, 1.62, 2.0, GOLD, 312.9, 2.35, 72.3); plane(boardTex, 1.9, 1.48, 312.86, 2.35, 72.3, -Math.PI / 2);
  cyl(0.03, 0.03, 0.2, BRASS, 301.18, 2.0, 63.6, 6, 0, Math.PI / 2);
  const hookU = new THREE.Group(); hookU.add(mm(Bx(0.52, 0.78, 0.12), LM(NAVY), 0, -0.44, 0), mm(Bx(0.06, 0.6, 0.13), LM(GOLD), 0.2, -0.42, 0), mm(Sp(0.1, 10, 6), LM(WHITE), 0, 0.02, 0.02)); for (let i = 0; i < 3; i++) hookU.add(mm(Sp(0.02, 6, 4), LM(GOLD), 0.08, -0.25 - i * 0.15, 0.065)); hookU.children[2].scale.set(1, 0.45, 1.05);
  hookU.position.set(301.24, 2.0, 63.6); hookU.rotation.y = Math.PI / 2; G.add(hookU); plane(label('MY BLAZER', NAVY, GOLD, 256, 48, 30), 0.6, 0.12, 301.16, 2.32, 63.6, Math.PI / 2);
  // ================= THE 19TH HOLE (west wing): bar, 3 round tables, the kitchen PASS on the west wall =================
  box(8, 1.05, 0.7, MAHOG, 294.5, 0.525, 63.25); box(8.1, 0.05, 0.8, '#c9a77a', 294.5, 1.075, 63.25); rect(290.5, 298.5, 62.8, 63.65); box(8, 0.06, 0.32, MAHOG, 294.5, 1.7, 62.6); box(8, 0.06, 0.32, MAHOG, 294.5, 2.2, 62.6);
  for (let i = 0; i < 14; i++) for (const y of [1.84, 2.34]) cyl(0.04, 0.045, 0.24, [GREEN, '#7a2a1a', GOLD, '#2a3a48'][(i + (y > 2 ? 1 : 0)) % 4], 291 + i * 0.52, y, 62.6, 8);
  plane(label('THE 19TH HOLE', NAVY, GOLD, 512, 64, 40), 3.0, 0.38, 294.5, 2.9, 62.48);
  for (const [x, z] of [[293.6, 68.6], [297.6, 72.2], [294.2, 79.4]]) { cyl(0.6, 0.6, 0.04, WHITE, x, 0.78, z, 18); cyl(0.62, 0.55, 0.2, WHITE, x, 0.66, z, 18); cyl(0.05, 0.08, 0.6, INK, x, 0.3, z, 8); cyl(0.04, 0.04, 0.16, GOLD, x, 0.88, z, 6); sph(0.05, RED, x, 0.98, z); rect(x - 0.55, x + 0.55, z - 0.55, z + 0.55);
    for (const a of [0, Math.PI]) { box(0.42, 0.06, 0.42, '#7a2a1a', x + Math.cos(a) * 0.85, 0.46, z + Math.sin(a) * 0.85); box(0.42, 0.5, 0.06, '#7a2a1a', x + Math.cos(a) * 1.05, 0.7, z, a + Math.PI / 2); } }
  box(1.4, 1.0, 4.4, '#cfd6da', 289.3, 0.5, 76.4); box(1.44, 0.04, 4.44, STEEL, 289.3, 1.0, 76.4); rect(288.6, 290.0, 74.2, 78.6); plane(label('THE PASS · ORDERS UP', RED, '#ffffff', 512, 48, 28), 2.4, 0.2, 290.01, 0.7, 76.4, Math.PI / 2);
  { const t = CT(512, 160, (g, W, H) => { g.fillStyle = '#ffe6b0'; g.fillRect(0, 0, W, H); g.fillStyle = '#c9c4bc'; g.fillRect(0, 110, W, 50); g.fillStyle = DARK; g.fillRect(30, 70, 150, 50); g.fillStyle = ORANGE; for (const x of [65, 140]) { g.beginPath(); g.arc(x, 70, 20, Math.PI, 0); g.fill(); } g.fillStyle = STEEL; g.fillRect(220, 20, 80, 100); g.fillRect(330, 60, 140, 14);
      g.fillStyle = WHITE; for (const x of [360, 400, 440]) { g.beginPath(); g.arc(x, 44, 14, 0, Math.PI * 2); g.fill(); } g.fillStyle = INK; g.font = '900 26px Archivo, sans-serif'; g.fillText('KITCHEN', 230, 148); });
    plane(t, 3.6, 1.1, 288.46, 1.75, 76.4, Math.PI / 2); for (const y of [1.18, 2.32]) box(0.12, 0.08, 3.74, INK, 288.48, y, 76.4); for (const z of [74.55, 78.25]) box(0.12, 1.2, 0.08, INK, 288.48, 1.75, z); for (const z of [75.4, 77.4]) { box(0.5, 0.06, 0.2, DARK, 289.1, 2.42, z); RG.box(0.44, 0.03, 0.16, '#ff7a3a', 289.1, 2.38, z); } }
  const MENU = [{ n: 'ICED TEA', c: '#b5651d' }, { n: 'LEMONADE', c: '#f2d64b' }, { n: 'CLUB SANDWICH', c: '#e8c48a' }, { n: 'GARDEN SALAD', c: '#5aa83a' }, { n: 'SCONES', c: '#d9a066' }, { n: 'TOMATO SOUP', c: '#c0392b' }];
  function food3D(k) { const g = new THREE.Group(), w = LM(WHITE); g.add(mm(Cy(0.11, 0.1, 0.015, 14), w, 0, 0.008, 0));
    if (k === 0 || k === 1) { g.add(mm(Cy(0.04, 0.034, 0.15, 10), LM(MENU[k].c), 0, 0.09, 0), mm(Cy(0.042, 0.042, 0.01, 10), LM(WHITE), 0, 0.165, 0), mm(Cy(0.03, 0.03, 0.008, 8), LM(k ? '#f7e27a' : YEL), 0.035, 0.16, 0, 0, 0, 1.2)); }
    else if (k === 2) { for (const [x, ry] of [[-0.03, 0.4], [0.035, -0.6]]) { const m = mm(Cy(0.07, 0.07, 0.07, 3), LM(MENU[2].c), x, 0.05, 0, 0, ry); g.add(m); g.add(mm(Cy(0.068, 0.068, 0.012, 3), LM(GREEN), x, 0.05, 0, 0, ry)); } g.add(mm(Cy(0.004, 0.004, 0.08, 4), LM(RED), 0, 0.12, 0)); }
    else if (k === 3) { g.add(mm(Cy(0.08, 0.05, 0.05, 12), w, 0, 0.035, 0)); for (let i = 0; i < 5; i++) g.add(mm(Sp(0.03, 6, 4), LM(i === 2 ? RED : MENU[3].c), Math.cos(i * 1.3) * 0.03, 0.065, Math.sin(i * 1.3) * 0.03)); }
    else if (k === 4) { for (const x of [-0.035, 0.035]) g.add(mm(new THREE.SphereGeometry(0.04, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LM(MENU[4].c), x, 0.015, 0)); g.add(mm(Sp(0.018, 6, 4), LM('#a8202a'), 0, 0.03, 0.05)); }
    else { g.add(mm(Cy(0.07, 0.045, 0.05, 12), w, 0, 0.035, 0), mm(Cy(0.064, 0.064, 0.004, 12), LM(MENU[5].c), 0, 0.058, 0)); }
    G.add(g); return g; }
  const FOODP = k => V(289.05, 1.02, 74.75 + k * 0.62);
  MENU.forEach((_, k) => { const g = food3D(k); g.position.copy(FOODP(k)); });
  const TRAY = new THREE.Group(); TRAY.add(mm(Bx(0.5, 0.02, 0.34), LM(SILVER)), mm(Bx(0.52, 0.04, 0.02), LM(STEEL), 0, 0.02, 0.17), mm(Bx(0.52, 0.04, 0.02), LM(STEEL), 0, 0.02, -0.17)); const TRAYH = V(289.66, 1.03, 76.3); TRAY.position.copy(TRAYH); TRAY.rotation.y = Math.PI / 2; G.add(TRAY);
  const TSLOT = [V(-0.12, 0.012, 0.06), V(0.12, 0.012, 0.06), V(0, 0.012, -0.08)];
  // ================= TROPHY ROOM (north-east): glass case on the east wall (6 slots, engraved plates), polishing table, honours board =================
  box(0.1, 2.6, 8.0, MAHOG, 325.5, 1.3, 67.2); box(0.7, 0.95, 8.0, MAHOG, 325.2, 0.475, 67.2); box(0.7, 0.2, 8.0, MAHOG, 325.2, 2.5, 67.2); for (const z of [63.2, 71.2]) box(0.7, 2.6, 0.1, MAHOG, 325.2, 1.3, z); RG.box(0.02, 1.9, 7.8, '#cfe8f0', 324.84, 1.5, 67.2); for (const y of [0.98, 1.68, 2.4]) box(0.66, 0.05, 7.9, '#e8e2d6', 325.15, y, 67.2); rect(324.8, X1, 63.2, 71.2);
  const SY = [1.0, 1.7], SZ = [64.4, 67.2, 70.0], SLOT = s => V(325.15, SY[s / 3 | 0] + 0.02, SZ[s % 3]);
  const TROPH = [{ n: 'CLUB CHAMPION', k: 0 }, { n: "LADIES' CUP", k: 0 }, { n: 'JUNIOR SHIELD', k: 1 }, { n: "CAPTAIN'S SHIELD", k: 1 }, { n: 'GOLDEN GOLFER', k: 2 }, { n: 'THE IRON TEE', k: 2 }];
  const plateTex = TROPH.map(o => label(o.n, NAVY, GOLD, 512, 64, 34)); const PLATES = [0, 1, 2, 3, 4, 5].map(s => { const p = SLOT(s); return plane(plateTex[0], 1.3, 0.17, 324.8, p.y - 0.1, p.z, -Math.PI / 2); });
  box(1.8, 0.86, 1.1, MAHOG, 319, 0.43, 67.2); box(1.7, 0.03, 1.0, '#6a1a2a', 319, 0.875, 67.2); rect(318.1, 319.9, 66.65, 67.75); box(0.4, 0.06, 0.25, WHITE, 318.2, 0.9, 67.0, 0.3); cyl(0.05, 0.05, 0.12, '#c9c4bc', 319.75, 0.95, 66.9, 10);
  { const t = CT(512, 512, (g, W, H) => { g.fillStyle = MAHOG; g.fillRect(0, 0, W, H); g.fillStyle = GOLD; g.textBaseline = 'middle'; g.font = '900 34px Archivo, sans-serif'; g.fillText('CLUB CHAMPIONS', 24, 40); g.fillRect(24, 66, W - 48, 3); g.font = '800 26px Archivo, sans-serif';
      [['1902', 'P. FAIRWAY'], ['1931', 'M. LINKS'], ['1958', 'H. BOGEY'], ['1977', 'J. SANDS'], ['1994', 'BIRDIE (JNR)'], ['2011', 'P. FAIRWAY'], ['2026', '. . .']].forEach(([y, n], i) => { g.fillText(y, 30, 110 + i * 54); g.fillText(n, 150, 110 + i * 54); }); });
    plane(t, 2.0, 2.0, 316.0, 2.5, 62.48); box(2.1, 2.1, 0.05, GOLD, 316.0, 2.5, 62.45); }
  const SILV = new THREE.MeshPhongMaterial({ color: SILVER, shininess: 90, specular: '#ffffff' }), GOLDM = new THREE.MeshPhongMaterial({ color: '#f2c04a', shininess: 80, specular: '#fff2c0' }), WOODM = LM(MAHOG);
  const SPOTO = [[[0.08, 0.38, 0.12], [-0.07, 0.31, 0.11], [0.0, 0.44, 0.13], [-0.11, 0.41, 0.09], [0.02, 0.21, 0.035], [0.11, 0.3, 0.08]],
    [[0.08, 0.41, 0.035], [-0.09, 0.34, 0.035], [0.0, 0.48, 0.035], [-0.1, 0.44, 0.035], [0.1, 0.31, 0.035], [0.03, 0.27, 0.035]],
    [[0.045, 0.22, 0.06], [-0.045, 0.27, 0.06], [0.0, 0.38, 0.05], [0.03, 0.15, 0.065], [-0.06, 0.06, 0.095], [0.06, 0.06, 0.095]]];
  function trophy3D(k) { const g = new THREE.Group();
    if (k === 0) { g.add(mm(Bx(0.2, 0.1, 0.2), WOODM, 0, 0.05, 0), mm(Cy(0.025, 0.04, 0.12, 10), SILV, 0, 0.16, 0), mm(Cy(0.14, 0.07, 0.22, 16), SILV, 0, 0.33, 0), mm(new THREE.TorusGeometry(0.14, 0.012, 6, 18), SILV, 0, 0.44, 0, Math.PI / 2));
      for (const s of [-1, 1]) g.add(mm(new THREE.TorusGeometry(0.06, 0.012, 6, 12), SILV, s * 0.15, 0.35, 0)); }
    else if (k === 1) { g.add(mm(Bx(0.26, 0.08, 0.12), WOODM, 0, 0.04, 0), mm(Cy(0.02, 0.02, 0.12, 6), SILV, 0, 0.14, 0), mm(Cy(0.18, 0.18, 0.03, 22), SILV, 0, 0.38, 0, Math.PI / 2), mm(Cy(0.06, 0.06, 0.035, 14), GOLDM, 0, 0.38, 0.012, Math.PI / 2)); }
    else { g.add(mm(Bx(0.18, 0.12, 0.18), WOODM, 0, 0.06, 0), mm(Cy(0.05, 0.065, 0.18, 10), GOLDM, 0, 0.22, 0), mm(Sp(0.05, 10, 8), GOLDM, 0, 0.36, 0), mm(Cy(0.008, 0.008, 0.26, 5), GOLDM, 0.06, 0.2, 0.04, 0, 0, 0.6)); }
    const spots = SPOTO[k].map(o => { const m = mm(Sp(0.024, 8, 6), new THREE.MeshLambertMaterial({ color: '#4f6a2a', transparent: true }), o[0], o[1], o[2]); m.scale.set(1, 1, 0.45); m.visible = false; g.add(m); return { m, k: 0 }; });
    G.add(g); return { g, spots }; }
  const TR = TROPH.map((o, i) => ({ ...o, i, ...trophy3D(o.k), slot: i }));
  const homeTrophy = T => { T.g.position.copy(SLOT(T.slot)); T.g.rotation.set(0, -Math.PI / 2, 0); T.g.scale.setScalar(1.6); T.g.visible = true; T.spots.forEach(s => { s.m.visible = false; s.k = 0; }); };
  const dealSlots = () => { const ord = shuffle([0, 1, 2, 3, 4, 5]); TR.forEach((T, i) => { T.slot = ord[i]; homeTrophy(T); PLATES[T.slot].material.map = plateTex[i]; PLATES[T.slot].material.needsUpdate = true; }); };
  dealSlots();
  // ================= PRO SHOP (south-east): counter, club rack, shirts, ball pyramid, bag stands =================
  box(2.6, 1.0, 0.7, MAHOG, 316.0, 0.5, 74.0); box(2.7, 0.05, 0.8, '#c9a77a', 316.0, 1.025, 74.0); rect(314.7, 317.3, 73.65, 74.35); box(0.3, 0.26, 0.26, DARK, 315.3, 1.18, 74.0); plane(label('PRO SHOP', NAVY, GOLD, 256, 48, 30), 1.2, 0.22, 316.0, 0.6, 74.36);
  box(6.0, 0.08, 0.3, WOOD, 320.0, 1.2, 81.3); for (let i = 0; i < 18; i++) { const x = 317.3 + i * 0.32; cyl(0.008, 0.008, 1.0, STEEL, x, 0.9, 81.25, 4); box(0.08, 0.05, 0.05, [SILVER, INK, RED, BLUE][i % 4], x, 0.42, 81.22); } rect(317.0, 323.0, 81.0, X1);
  for (let i = 0; i < 6; i++) box(0.5, 0.65, 0.05, [WHITE, NAVY, RED, GREEN, YEL, '#c2456a'][i], 325.25, 1.4, 74.0 + i * 0.62, Math.PI / 2); box(0.04, 0.04, 4.0, STEEL, 325.3, 1.75, 75.6); rect(325.0, X1, 73.6, 77.6);
  for (let r = 0; r < 4; r++) for (let i = 0; i < 4 - r; i++) for (let j = 0; j < 4 - r; j++) sph(0.06, WHITE, 321.3 + (i - (3 - r) / 2) * 0.12, 0.9 + r * 0.1, 74.4 + (j - (3 - r) / 2) * 0.12); box(0.7, 0.84, 0.7, NAVY, 321.3, 0.42, 74.4); rect(320.9, 321.7, 74.0, 74.8);
  for (const [x, z, c] of [[314.2, 80.6, NAVY], [315.0, 80.8, RED], [323.8, 78.2, GREEN]]) { cyl(0.16, 0.14, 0.9, c, x, 0.45, z, 10); for (let i = 0; i < 4; i++) cyl(0.008, 0.008, 0.4, STEEL, x - 0.06 + i * 0.04, 1.05, z, 4); rect(x - 0.18, x + 0.18, z - 0.18, z + 0.18); }
  // ================= OUTSIDE BACK: the TERRACE (6 tables), paving to the green, the POOL + lifeguard chair =================
  box(15.5, 0.14, 7.4, '#b08a5a', 296.75, 0.07, 85.4); for (let x = 289.4; x < 304.5; x += 0.7) box(0.02, 0.005, 7.4, '#8a6a40', x, 0.142, 85.4);
  for (let x = 289.2; x <= 304.4; x += 1.9) box(0.08, 0.9, 0.08, WHITE, x, 0.45, 89.15); box(15.4, 0.06, 0.1, WHITE, 296.8, 0.92, 89.15); for (let z = 82.2; z < 89.2; z += 1.75) box(0.08, 0.9, 0.08, WHITE, 289.05, 0.45, z); box(0.1, 0.06, 7.2, WHITE, 289.05, 0.92, 85.6);
  rect(289.0, 304.5, 89.05, 89.3); rect(288.85, 289.15, 81.7, 89.3);
  const TB = [[291.4, 84.0], [295.8, 84.0], [300.2, 84.0], [291.4, 87.4], [295.8, 87.4], [300.2, 87.4]].map(([x, z], i) => { cyl(0.5, 0.5, 0.04, WHITE, x, 1.14, z, 16); cyl(0.04, 0.06, 1.0, INK, x, 0.64, z, 6); cyl(0.025, 0.025, 2.6, WHITE, x, 1.4, z, 5); R0.put(Co(1.25, 0.5, 8), x, 2.75, z, i % 2 ? WHITE : NAVY); rect(x - 0.45, x + 0.45, z - 0.45, z + 0.45);
    for (const a of [Math.PI / 2, -Math.PI / 2]) { box(0.54, 0.05, 0.54, WHITE, x + Math.cos(a) * 0.9, 0.78, z + Math.sin(a) * 0.9); box(0.54, 0.6, 0.05, WHITE, x + Math.cos(a) * 0.9, 1.1, z + Math.sin(a) * 1.15); }   /* s181 FOX SCALE: seat 0.66 m above the deck (was 0.46) */
    plane2(label('TABLE ' + (i + 1), NAVY, '#ffffff', 128, 48, 28), 0.28, 0.1, x - 0.2, 1.24, z + 0.1); return { x, z, n: i + 1 }; });
  box(2.8, 0.1, 8.4, '#d8d2c8', 307, 0.05, 86.2);
  const PX0 = 311, PX1 = 324.5, PZ0 = 83.6, PZ1 = 91.8, PWY = 0.26, PCX = (PX0 + PX1) / 2, PCZ = (PZ0 + PZ1) / 2;
  box(16, 0.1, 11.4, '#e8e4dc', 317.4, 0.05, 87.7); box(PX1 - PX0, 0.02, PZ1 - PZ0, '#2a7aa8', PCX, 0.11, PCZ);
  for (const [w, d, x, z] of [[PX1 - PX0 + 0.6, 0.3, PCX, PZ0 - 0.15], [PX1 - PX0 + 0.6, 0.3, PCX, PZ1 + 0.15], [0.3, PZ1 - PZ0, PX0 - 0.15, PCZ], [0.3, PZ1 - PZ0, PX1 + 0.15, PCZ]]) box(w, 0.34, d, WHITE, x, 0.17, z); rect(PX0 - 0.3, PX1 + 0.3, PZ0 - 0.3, PZ1 + 0.3);
  const waterT = CT(256, 256, (g, W, H) => { g.fillStyle = '#4fc0e0'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = 4; for (let i = 0; i < 9; i++) { g.beginPath(); for (let x = 0; x <= W; x += 16) g.lineTo(x, i * 30 + Math.sin(x / 30 + i) * 8); g.stroke(); } });
  waterT.wrapS = waterT.wrapT = THREE.RepeatWrapping; waterT.repeat.set(3, 2); const water = new THREE.Mesh(new THREE.PlaneGeometry(PX1 - PX0, PZ1 - PZ0), new THREE.MeshLambertMaterial({ map: waterT, transparent: true, opacity: 0.86, depthWrite: false })); water.rotation.x = -Math.PI / 2; water.position.set(PCX, PWY, PCZ); water.renderOrder = 2; G.add(water);
  const LANEZ = [84.8, 86.6, 88.6, 90.6]; for (const z of [85.7, 87.6, 89.6]) for (let x = PX0 + 0.3; x < PX1 - 0.2; x += 0.4) sph(0.05, Math.round((x - PX0) / 0.4) % 2 ? RED : WHITE, x, PWY + 0.01, z, 1, 0.6, 1);
  for (const s of [-1, 1]) { cyl(0.02, 0.02, 0.9, STEEL, PX0 + 0.25, 0.6, PCZ + s * 0.3, 5); } plane2(label('POOL · NO RUNNING', RED, '#ffffff', 256, 48, 28), 1.2, 0.22, 309.9, 1.6, 83.0, Math.PI / 2); cyl(0.02, 0.02, 1.5, WHITE, 309.9, 0.75, 83.0, 5);
  for (const z of [94.1, 95.5]) { box(1.8, 0.12, 0.65, WHITE, 323.3, 0.3, z); box(0.5, 0.5, 0.65, WHITE, 324.3, 0.55, z, 0, 0, -0.6); for (const sx of [-0.8, 0.8]) box(0.05, 0.3, 0.6, STEEL, 323.3 + sx, 0.15, z); rect(322.4, 324.4, z - 0.33, z + 0.33); }
  cyl(0.03, 0.03, 2.3, WHITE, 321.6, 1.15, 94.8, 6); R0.put(Co(1.2, 0.5, 10), 321.6, 2.4, 94.8, RED);
  const CHAIR = V(310.1, 0, 92.7); for (const [sx, sz] of [[-0.35, -0.35], [0.35, -0.35], [-0.35, 0.35], [0.35, 0.35]]) box(0.07, 1.6, 0.07, WHITE, CHAIR.x + sx, 0.8, CHAIR.z + sz); for (const y of [0.5, 1.0]) box(0.76, 0.05, 0.06, WHITE, CHAIR.x, y, CHAIR.z + 0.36);
  box(0.8, 0.07, 0.8, WHITE, CHAIR.x, 1.6, CHAIR.z); box(0.8, 0.7, 0.07, WHITE, CHAIR.x, 1.98, CHAIR.z + 0.38); plane2(label('LIFEGUARD', RED, '#ffffff', 256, 48, 30), 0.72, 0.16, CHAIR.x, 2.12, CHAIR.z + 0.42, 0); rect(CHAIR.x - 0.42, CHAIR.x + 0.42, CHAIR.z - 0.42, CHAIR.z + 0.42);
  const BUOY = mm(new THREE.TorusGeometry(0.2, 0.06, 8, 18), LM(ORANGE)), BUOYH = V(CHAIR.x + 0.42, 1.25, CHAIR.z); BUOY.position.copy(BUOYH); BUOY.rotation.y = Math.PI / 2; G.add(BUOY);
  // ================= THE GREEN: croquet lawn, driving range strip, the 18th tee + caddie bag =================
  const LX0 = 311.2, LX1 = 324.8, LZ0 = 100.6, LZ1 = 118.6, LCX = (LX0 + LX1) / 2, LCZ = (LZ0 + LZ1) / 2;
  box(LX1 - LX0, 0.02, LZ1 - LZ0, '#6cc25a', LCX, 0.075, LCZ); for (let i = 0; i < 6; i++) if (i % 2) box(LX1 - LX0, 0.022, 3, '#5fb04e', LCX, 0.078, LZ0 + 1.5 + i * 3);
  for (const [w, d, x, z] of [[LX1 - LX0, 0.1, LCX, LZ0], [LX1 - LX0, 0.1, LCX, LZ1], [0.1, LZ1 - LZ0, LX0, LCZ], [0.1, LZ1 - LZ0, LX1, LCZ]]) box(w, 0.12, d, WHITE, x, 0.06, z);
  const HOOPS = [V(314.2, 0, 112.6), V(321.8, 0, 112.6), V(321.8, 0, 106.0), V(314.2, 0, 106.0)], PEG = V(318, 0, 109.3), CBS = V(314.2, 0, 116.8);
  HOOPS.forEach((h, i) => { for (const s of [-1, 1]) cyl(0.03, 0.03, 0.5, WHITE, h.x + s * 0.4, 0.25, h.z, 6); box(0.86, 0.05, 0.05, i === 0 ? '#2e86b8' : WHITE, h.x, 0.5, h.z); plane2(label(String(i + 1), INK, '#ffffff', 64, 64, 44), 0.18, 0.18, h.x + 0.62, 0.22, h.z); });
  for (let i = 0; i < 4; i++) cyl(0.03, 0.03, 0.16, [BLUE, RED, INK, YEL][i], PEG.x, 0.08 + i * 0.16, PEG.z, 8); rect(PEG.x - 0.05, PEG.x + 0.05, PEG.z - 0.05, PEG.z + 0.05);
  plane2(label('CROQUET LAWN', GREEN, '#ffffff', 256, 48, 30), 1.4, 0.26, 312.4, 1.3, LZ1 + 0.6); cyl(0.02, 0.02, 1.2, WHITE, 311.7, 0.6, LZ1 + 0.6, 5); cyl(0.02, 0.02, 1.2, WHITE, 313.1, 0.6, LZ1 + 0.6, 5);
  for (let i = 0; i < 4; i++) { cyl(0.015, 0.015, 0.9, WOOD, 310.6 + i * 0.12, 0.5, LZ1 + 0.4, 5, 0.12); box(0.22, 0.07, 0.07, [BLUE, RED, INK, YEL][i], 310.6 + i * 0.12, 0.08, LZ1 + 0.3, Math.PI / 2); }
  const TEE = V(291.0, 0.12, 122.4), TGT = [{ x: 300.5, r: 1.6, n: '50 YD', c: WHITE }, { x: 310.5, r: 1.8, n: '100 YD', c: YEL }, { x: 320.5, r: 2.0, n: '150 YD', c: RED }], RNG = 34;
  box(1.6, 0.03, 1.6, '#3f8a46', 291.0, 0.08, 122.4); box(1.2, 0.035, 0.6, '#2f7a3a', 291.0, 0.085, 122.4); cyl(0.2, 0.16, 0.26, RED, 290.1, 0.13, 121.4, 10); for (let i = 0; i < 6; i++) sph(0.05, WHITE, 290.05 + Math.cos(i) * 0.09, 0.28, 121.4 + Math.sin(i) * 0.09);
  TGT.forEach(T => { R0.put(new THREE.RingGeometry(T.r - 0.12, T.r, 32).rotateX(-Math.PI / 2), T.x, 0.09, 122.4, T.c); R0.put(new THREE.CircleGeometry(0.5, 20).rotateX(-Math.PI / 2), T.x, 0.092, 122.4, T.c); cyl(0.02, 0.02, 1.6, WHITE, T.x, 0.8, 122.4 + T.r + 0.2, 5);
    plane2(label(T.n, T.c === WHITE ? INK : T.c, T.c === YEL ? INK : '#ffffff', 128, 64, 34), 0.6, 0.3, T.x + 0.31, 1.45, 122.4 + T.r + 0.2); });
  plane2(label('DRIVING RANGE', NAVY, '#ffffff', 256, 48, 30), 1.4, 0.26, 289.6, 1.4, 120.2, Math.PI / 2); cyl(0.02, 0.02, 1.3, WHITE, 289.6, 0.65, 120.9, 5); cyl(0.02, 0.02, 1.3, WHITE, 289.6, 0.65, 119.5, 5);
  const LIES = [V(290.8, 0, 126.4), V(311.5, 0, 125.4), V(323.4, 0, 120.9), V(317.2, 0, 96.9), V(303.4, 0, 108.6)], CUP = V(299.4, 0, 111.2), LIEN = ['TEE', 'FAIRWAY', 'ROUGH', 'BUNKER', 'GREEN'];
  for (const s of [-1, 1]) sph(0.08, RED, 290.8 + s * 0.8, 0.1, 126.6); plane2(label('18TH TEE · CADDIES', NAVY, '#ffffff', 256, 48, 28), 1.3, 0.24, 292.8, 1.3, 127.6); cyl(0.02, 0.02, 1.2, WHITE, 292.2, 0.6, 127.6, 5); cyl(0.02, 0.02, 1.2, WHITE, 293.4, 0.6, 127.6, 5);
  const CLUBS = [{ n: 'DRIVER', t: 'D', c: RED, rule: 'TEE SHOT' }, { n: '5 IRON', t: '5', c: BLUE, rule: '150 TO 200 YD' }, { n: '9 IRON', t: '9', c: GREEN, rule: '80 TO 149 YD' }, { n: 'SAND WEDGE', t: 'SW', c: YEL, rule: 'IN THE SAND' }, { n: 'PUTTER', t: 'P', c: '#7a8088', rule: 'ON THE GREEN' }];
  const BAG = new THREE.Group(); BAG.add(mm(Cy(0.17, 0.15, 0.9, 12), LM(NAVY), 0, 0.55, 0), mm(Cy(0.175, 0.175, 0.06, 12), LM(GOLD), 0, 0.95, 0), mm(Cy(0.175, 0.175, 0.06, 12), LM(GOLD), 0, 0.2, 0)); for (const s of [-1, 1]) BAG.add(mm(Cy(0.012, 0.012, 0.7, 5), LM(STEEL), s * 0.12, 0.3, -0.16, 0.3, 0, s * 0.2));
  const CLUBM = CLUBS.map((c, i) => { const a = -0.6 + i * 0.3, ox = Math.sin(a) * 0.1, oz = 0.02, g = new THREE.Group(); g.add(mm(Cy(0.01, 0.01, 0.6, 5), LM(STEEL), 0, 0.25, 0), i === 4 ? mm(Bx(0.1, 0.04, 0.04), LM(SILVER), 0.03, 0.57, 0) : mm(i === 0 ? Sp(0.065, 8, 6) : Bx(0.05, 0.09, 0.03), LM(c.c), 0, 0.58, 0));
    g.position.set(ox, 0.9, oz); g.rotation.z = a * 0.3; g.userData.home = g.position.clone(); g.userData.rz = g.rotation.z; BAG.add(g);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: label(c.t, c.c, c.c === YEL ? INK : '#ffffff', 128, 64, 44), depthTest: false })); sp.scale.set(0.24, 0.12, 1); sp.position.set(ox * 5.5, 1.74 + (i % 2) * 0.17, oz); sp.renderOrder = 4; sp.visible = false; BAG.add(sp); return { g, sp }; });
  const BAGH = V(289.4, 0, 127.3); BAG.position.copy(BAGH); G.add(BAG); const bagCol = { c: [BAGH.x, BAGH.z, 0.25] }; cols.push(bagCol);
  // ================= VALET: podium + key board at the front, the members' VALET LOT west of the club =================
  const VS = V(300.5, 0, 56.4), AISLE = 277, BZ = [64.2, 67.8, 71.4, 75.0, 78.6], BAYP = b => (b < 5 ? V(271.5, 0, BZ[b]) : V(282.5, 0, BZ[b - 5]));
  { const t = CT(1024, 1024, (g, W, H) => { g.fillStyle = '#4a4c50'; g.fillRect(0, 0, W, H); const u = x => (x - 266.5) / 21 * W, v = z => (z - 61.5) / 21 * H; g.strokeStyle = '#ffffff'; g.lineWidth = 8;
      for (let i = 0; i <= 5; i++) { const z = 62.4 + i * 3.6; g.beginPath(); g.moveTo(u(268.2), v(z)); g.lineTo(u(274.6), v(z)); g.stroke(); g.beginPath(); g.moveTo(u(279.4), v(z)); g.lineTo(u(285.8), v(z)); g.stroke(); }
      g.fillStyle = '#ffffff'; g.font = '900 54px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; for (let b = 0; b < 10; b++) { const p = BAYP(b); g.fillText(String(b + 1), u(b < 5 ? 269.4 : 284.6), v(p.z)); }
      g.fillStyle = YEL; for (let z = 62; z < 82; z += 2.4) g.fillRect(u(276.85), v(z), 10, 40); g.font = '900 44px Archivo, sans-serif'; g.fillStyle = '#ffffff'; g.fillText('MEMBERS', u(277), v(81.2)); });
    const lot = new THREE.Mesh(new THREE.PlaneGeometry(21, 21), new THREE.MeshLambertMaterial({ map: t })); lot.rotation.x = -Math.PI / 2; lot.position.set(277, 0.075, 72.0); G.add(lot);
    box(5.0, 0.02, 4.0, '#4a4c50', 277, 0.07, 59.6); for (const x of [268.2, 285.8]) for (const z of [61.8, 82.2]) cyl(0.06, 0.06, 4.2, INK, x, 2.1, z, 6);
    plane2(label('VALET PARKING · MEMBERS', NAVY, '#ffffff', 512, 64, 32), 3.4, 0.42, 277, 3.6, 61.8); for (const s of [-1, 1]) cyl(0.07, 0.07, 3.8, WHITE, 277 + s * 1.8, 1.9, 61.8, 8); rect(275.1, 275.3, 61.7, 61.9); rect(278.7, 278.9, 61.7, 61.9); }
  box(0.7, 1.1, 0.5, NAVY, 295.6, 0.55, 60.7); box(0.8, 0.05, 0.6, GOLD, 295.6, 1.12, 60.7); rect(295.2, 296.0, 60.4, 61.0); plane2(label('VALET', NAVY, GOLD, 128, 48, 32), 0.6, 0.2, 295.6, 1.5, 60.7, 0); cyl(0.015, 0.015, 0.3, INK, 295.6, 1.27, 60.7, 4);
  box(0.9, 0.7, 0.06, MAHOG, 294.8, 1.5, 61.1); for (let i = 0; i < 10; i++) { cyl(0.008, 0.008, 0.04, BRASS, 294.45 + (i % 5) * 0.17, 1.62 - (i / 5 | 0) * 0.3, 61.06, 4, Math.PI / 2); box(0.06, 0.1, 0.01, GOLD, 294.45 + (i % 5) * 0.17, 1.52 - (i / 5 | 0) * 0.3, 61.06); }
  // ================= SIR PERCY FAIRWAY =================
  function capOn(head, col = WHITE, y = 0.33) { const g = new THREE.Group(); const cr = mm(Sp(0.13, 12, 8), LM(col), 0, 0.02, -0.01); cr.scale.set(1, 0.42, 1.08); g.add(cr, mm(Bx(0.2, 0.02, 0.12), LM(col), 0, 0.0, 0.13), mm(Cy(0.012, 0.012, 0.02, 6), LM(INK), 0, 0.075, 0)); g.position.set(0, y, 0); head.add(g); g.traverse(o => { o.renderOrder = 2; }); return g; }
  const PC = { fur: '#c8c4c0', furDark: '#8f8a86', muzzle: '#f4f0ec', snout: '#ece6e0', chin: '#ffffff', fluff: '#ffffff' };
  const percy = kit.makeFox({ key: 'sirPercy', torso: [NAVY, '#24405e', '#1a2e44'], outfit: 'suit', mood: 'happy', eyes: ['#3a2a1a', '#3a2a1a'], look: PC }); percy.scale.multiplyScalar(1.1);
  { const P = percy.userData && percy.userData.P; if (P && P.head) capOn(P.head, WHITE); if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; }
  G.add(percy); const pCol = { c: [0, 0, 0.5] }; cols.push(pCol);
  const KS = { idle: [310.9, 64.1, 0], waiter: [291.6, 78.9, -2.4], trophies: [321.2, 69.4, -2.5], range: [289.2, 120.6, 1.9], caddie: [293.6, 128.4, 2.6], croquet: [310.6, 119.8, 2.4], lifeguard: [312.4, 94.4, 2.6], valet: [294.0, 59.9, 2.6] };
  const placeK = g => { const a = KS[g] || KS.idle; percy.position.set(a[0], 0, a[1]); percy.rotation.y = percy.userData.face0 = a[2]; pCol.c[0] = a[0]; pCol.c[1] = a[1]; }; placeK('idle');
  const mT = { key: 'sirPercy', obj: percy, ry: 0, r: 3.0 }, endM = { key: 'percyEnd', obj: percy, ry: 0, r: 80 };
  const lp = text => ({ who: 'SIR PERCY', role: 'CLUB CAPTAIN', text }), lx = (who, text) => ({ who, role: 'MEMBER', text });
  const turnTo = (o, a, dt) => { o.rotation.y += Math.atan2(Math.sin(a - o.rotation.y), Math.cos(a - o.rotation.y)) * Math.min(1, dt * 6); };
  // ================= members (town foxes, made when first needed) =================
  const CUS = [{ name: 'OTTO', look: { fur: '#8a6a4a', furDark: '#5f4630', muzzle: '#ece0d0' }, torso: ['#3f9a5e', '#2e7a48', '#1f5a34'], outfit: 'suit' },
    { name: 'MARLA', look: { fur: '#b07a5a', furDark: '#80563c', muzzle: '#f4e4d8', lashes: 1 }, torso: ['#e8e0f0', '#c8c0d8', '#a8a0b8'], outfit: 'dress' },
    { name: 'PELL', look: { fur: '#c9743a', furDark: '#9a5426', muzzle: '#f6e2cc' }, torso: ['#5a8ac8', '#3d6aa0', '#2a4a70'], outfit: 'vest' },
    { name: 'KIA', look: { fur: '#a86a9a', furDark: '#7a4a70', muzzle: '#f4e4f0', lashes: 1 }, torso: ['#c75b9b', '#9a4078', '#6a2a50'], outfit: 'dress' },
    { name: 'MICHAEL JAY', look: { fur: '#5a4a3a', furDark: '#3a2e22', muzzle: '#e0d4c4' }, torso: [RED, '#b8250f', '#7a1808'], outfit: 'vest' },
    { name: 'FLICK', look: { fur: '#e07a30', furDark: '#b05a1e', muzzle: '#fff0e0' }, torso: [YEL, '#c9a020', '#8a6a10'], outfit: 'vest' }];
  const cf = []; let kidF = null;
  const mkP = (key, o, par = G) => { const f = kit.makeFox({ key, torso: o.torso, outfit: o.outfit, mood: 'happy', eyes: ['#3a2a1a', '#3a2a1a'], look: o.look }); const P = f.userData && f.userData.P; if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false; const H = new THREE.Group(); H.add(f); H.visible = false; par.add(H); return { H, f, P, name: o.name }; };
  const cus = i => cf[i % 6] || (cf[i % 6] = mkP('ccCus' + (i % 6), CUS[i % 6]));
  const kid = () => kidF || (kidF = (() => { const k = mkP('ccKid', { name: 'PIP', torso: [ORANGE, '#c96a1e', '#8a4a10'], outfit: 'vest', look: { fur: '#e08a40', furDark: '#b06a2a', muzzle: '#fff0e0' } }); k.H.scale.setScalar(0.62); return k; })());
  const standAt = (p, x, z, yaw, y = 0) => { p.H.visible = true; p.H.position.set(x, y, z); p.H.rotation.y = yaw; };
  const walkTo = (p, x, z, dur, then) => { p.H.rotation.y = Math.atan2(x - p.H.position.x, z - p.H.position.z); fly(p.H, V(x, p.H.position.y, z), dur, 0, then); };
  const hideC = () => { cf.forEach(p => { if (p) { p.H.visible = false; p.H.scale.setScalar(1); p.H.position.y = 0; } }); if (kidF) kidF.H.visible = false; };
  const cT = { key: 'ccCus', obj: percy, ry: 0, r: 80 }; const sayC = (p, lines, then) => { cT.obj = p.H; sayTo(cT, lines.map(t => lx(p.name, t)), then || null, true); };
  const nextCus = () => { const n = save.stat('ccCusN', 0); save.setStat('ccCusN', n + 1); return cus(n); };
  // ================= state, toast, sound =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.9); tone(2093, 0.04, 0.9); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), jingle = () => { for (let i = 0; i < 4; i++) tone(2400 + i * 300, 0.02, 0.12, 'triangle', i * 0.05); },
    thwack = () => { tone(240, 0.12, 0.12, 'triangle', 0, 90); tone(1800, 0.03, 0.05, 'square'); }, clack = () => tone(900, 0.08, 0.07, 'square', 0, 500), whistle = () => { tone(2900, 0.05, 0.35, 'square'); tone(3100, 0.03, 0.35, 'square', 0.04); },
    splash = () => tone(320, 0.05, 0.35, 'sawtooth', 0, 70), cheer = () => { tone(784, 0.05, 0.3); tone(988, 0.05, 0.3, 'sine', 0.1); tone(1175, 0.05, 0.4, 'sine', 0.2); }, horn = () => tone(440, 0.05, 0.25, 'square');
  // ================= prizes + what you wear =================
  const CUR = { outfit: 'suit', torso: [NAVY, '#24405e', '#1a2e44'], name: 'CLUB BLAZER' };
  const ownB = () => !!save.stat('ccBlazer', false), bOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === CUR.name); };
  const putOn = on => { if (on) { if (!bOn()) save.setStat('ccPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(CUR); wear && wear(CUR); } else { const p = save.stat('ccPrevOutfit', null), o = p && p.name !== CUR.name ? p : null; save.setOutfit(o); wear && wear(o); } };
  function giveGift() { const n = save.stat('ccClears', 0) + 1; save.setStat('ccClears', n);
    if (!ownB()) { save.setStat('ccBlazer', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === CUR.name)) save.setStat('tailorOutfits', [...list, CUR]); putOn(true); return { kind: 'blazer', label: 'CLUB BLAZER + CAP' }; }
    if (!save.stat('ccSand1', false)) { save.setStat('ccSand1', true); for (let i = 0; i < 3; i++) save.give('clubSandwich'); return { kind: 'sand', label: 'CLUB SANDWICH ×3' }; }
    if (n % 3 === 0) { save.give('clubSandwich'); return { kind: 'sand1', label: 'CLUB SANDWICH' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const on = ownB() && bOn(), key = on ? 1 : 0;
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox))) { if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; if (on && U.P.head) worn.parts.push(capOn(U.P.head, WHITE, 0.35)); } }
  // ================= card (Modernist) — LEFT, same spot as the other shops =================
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head2 = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = (next, stop = true) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stop ? '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span>' : '') + '</div>';
  const bar = (k, c = '#ffd23a', band) => '<div style="height:14px;border:2px solid #201e1d;margin:4px 0;background:#fff;position:relative">' + (band ? '<div style="position:absolute;top:0;bottom:0;left:' + Math.round(band[0] * 100) + '%;width:' + Math.max(2, Math.round((band[1] - band[0]) * 100)) + '%;background:#bfe6c8"></div>' : '') + '<div style="position:absolute;left:0;top:3px;bottom:3px;width:' + Math.round(clamp(k, 0, 1) * 100) + '%;background:' + c + '"></div>' + (band ? '<div style="position:absolute;top:-2px;bottom:-2px;width:2px;background:#201e1d;left:' + Math.round((band[0] + band[1]) / 2 * 100) + '%"></div>' : '') + '</div>';
  const big = (txt, bg, fg = '#fff') => '<div style="background:' + bg + ';color:' + fg + ';font-weight:900;font-size:17px;padding:7px 10px;margin:2px 0 6px;border:2px solid #201e1d">' + txt + '</div>';
  const small = t => '<div style="font-size:11px;font-weight:900;padding-top:4px">' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; fitCard(); };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ================= input (only while a game holds the camera; the terrace walk leaves the stick + HUD alone) =================
  const ptr = { down: false, x: 0, y: 0, id: null, lx: 0, ly: 0, sx: 0, sy: 0 };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label],[data-ans]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = ptr.lx = ptr.sx = e.clientX; ptr.y = ptr.ly = ptr.sy = e.clientY; e.stopPropagation(); press(); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); ptr.lx = ptr.x; ptr.ly = ptr.y; }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700), MIN = () => Math.min(innerWidth, innerHeight);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearest = (list, f, lim) => { let b = -1, bd = lim; list.forEach((o, i) => { const p = f(o, i); if (!p) return; const d = dist(scrW(p)); if (d < bd) { bd = d; b = i; } }); return b; };
  const RC = new THREE.Raycaster(), NDC = new THREE.Vector2(), PL0 = new THREE.Plane();
  const onPlane = (n, p0) => { NDC.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); RC.setFromCamera(NDC, camera); PL0.setFromNormalAndCoplanarPoint(n, p0); const o = V(); return RC.ray.intersectPlane(PL0, o) ? o : null; };
  const FLIES = []; function fly(obj, to, dur, arc, then) { for (let i = FLIES.length - 1; i >= 0; i--) if (FLIES[i].obj === obj) FLIES.splice(i, 1); FLIES.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of FLIES.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { const i = FLIES.indexOf(F); if (i >= 0) FLIES.splice(i, 1); F.then && F.then(); } } }
  const PART = []; for (let i = 0; i < 40; i++) { const m = mm(Sp(0.03, 6, 4), new THREE.MeshBasicMaterial({ color: YEL, transparent: true })); m.visible = false; scene.add(m); PART.push({ m, v: V(), life: 0 }); }
  const burst = (p, n, col, sp = 0.8, upk = 1) => { let k = 0; for (const q of PART) { if (q.life > 0) continue; q.m.visible = true; q.m.material.color.set(col); q.m.position.copy(p); q.v.set(rnd(-1, 1), rnd(0.2, 1.4) * upk, rnd(-1, 1)).multiplyScalar(sp); q.life = rnd(0.5, 0.9); if (++k >= n) break; } };
  const partTick = dt => { for (const q of PART) { if (q.life <= 0) continue; q.life -= dt; q.m.position.addScaledVector(q.v, dt); q.v.y -= dt * 1.4; q.m.material.opacity = clamp(q.life * 1.6, 0, 1); if (q.life <= 0) q.m.visible = false; } };
  const HI = mkRing(0.1, 0.02), HI2 = mkRing(0.16, 0.025), ALERT = mkRing(0.22, 0.04, G, new THREE.MeshBasicMaterial({ color: RED, depthTest: false }));
  const hi = (r, p, face = true) => { r.visible = true; r.position.copy(p); r.scale.setScalar(1 + 0.15 * Math.sin(performance.now() / 120)); if (face) r.lookAt(camera.position); };
  const ARROW = new THREE.Group(); { const a = mm(Co(0.22, 0.5, 4), new THREE.MeshBasicMaterial({ color: YEL, depthTest: false }), 0, 0, 0.1, Math.PI / 2); a.renderOrder = 5; ARROW.add(a); } ARROW.visible = false; G.add(ARROW);
  const BEACON = mm(Cy(0.5, 0.5, 4.2, 16, 1, true), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); BEACON.visible = false; G.add(BEACON); const RTGT = mkRing(0.8, 0.06); RTGT.rotation.x = Math.PI / 2;
  // ================= station rings =================
  const SPOT = { waiter: { x: 290.9, z: 76.3, r: 0.8 }, trophies: { x: 319, z: 68.6, r: 0.9 }, range: { x: 290.4, z: 120.6, r: 0.9 }, caddie: { x: 293.2, z: 126.4, r: 0.9 }, croquet: { x: 312.6, z: 119.8, r: 0.9 },
    lifeguard: { x: 309.0, z: 94.4, r: 0.9 }, valet: { x: 297.4, z: 60.3, r: 0.8 }, hook: { x: 301.9, z: 63.6, r: 0.7 } };
  const RS = {}; for (const k in SPOT) { const s = SPOT[k], m = mm(new THREE.TorusGeometry(s.r * 0.75, 0.06, 6, 28), ringM, s.x, 0.16, s.z, Math.PI / 2); m.renderOrder = 3; G.add(m); RS[k] = m; }
  // ================= shared game bits =================
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const GN = Object.fromEntries(DOING);
  const PARTS = { caddie: ['TEE', 'FAIRWAY', 'ROUGH', 'BUNKER', 'GREEN'], range: ['1', '2', '3', '4', '5', '6', '7', '8'], waiter: ['ORDER 1', 'ORDER 2', 'ORDER 3'], croquet: ['HOOP 1', 'HOOP 2', 'HOOP 3', 'HOOP 4', 'PEG'],
    trophies: ['TROPHY 1', 'TROPHY 2', 'TROPHY 3'], valet: ['PARK', 'PARK', 'FETCH'], lifeguard: ['1', '2', '3', '4', '5', '6'] };
  const INTRO = {   // s74: one box each (≤ 20 words)
    caddie: n => [lp(n ? 'A member wants a caddie for the 18th, old bean. Bag\u2019s by the tee.' : 'Caddie the 18th! Tap the club the chart says, replace the divots, rake the bunker.')],
    range: n => [lp(n ? 'Eight balls on the range. Mind the flags.' : 'Eight balls! Tap to tee up, hold to swing, let go in the green. Hit the called flag.')],
    waiter: n => [lp(n ? 'The terrace is full, old bean. Tickets at the pass.' : 'Lunch on the terrace! Tap the ticket\u2019s plates onto the tray, then carry it out. Walk, never run.')],
    croquet: n => [lp(n ? 'Croquet! Four hoops, then the peg.' : 'Croquet! Drag back from the ball and let go. Hoops one to four, then the striped peg.')],
    trophies: n => [lp(n ? 'The trophies have gone dull again. Cloth\u2019s on the table.' : 'Rub the green spots off, buff it till it shines, then find its engraved plate in the case.')],
    valet: n => [lp(n ? 'Cars arriving, old bean. Valet stand by the steps.' : 'Valet! Tap the car, hold to drive, let go to stop on the bay number. No kerbs.')],
    lifeguard: n => [lp(n ? 'Up the chair, lifeguard. Eyes on the water.' : 'Lifeguard! Tap a swimmer calling for help. Tap a youngster running on the deck for the whistle.')] };
  const inStation = P => P.x > 262 && P.x < 330 && P.z > 50 && P.z < 130 && (P.y || 0) < 6;
  function startGame(g) { if (busy || J) return false; const vk = 'ccN_' + g, n = save.stat(vk, 0); save.setStat(vk, n + 1); save.setStat('ccVisits', save.stat('ccVisits', 0) + 1);
    J = { g, step: 0, sub: 'intro', gold: 0, pause: 0, t: 0, clean: 0, miss: 0, held: null, n }; busy = 'job'; placeK(g); hideC(); pop(); sayTo(mT, INTRO[g](n), null, true); NEXT('intro', BEGIN[g], n ? 1.4 : 2.2); return true; }
  // ---- CADDIE: 5 lies on the 18th · tap the right club · replace the divot · rake the bunker ----
  const CB = mm(Sp(0.05, 8, 6), LM('#ffffff')); CB.visible = false; G.add(CB);
  const DIV = mm(Bx(0.22, 0.05, 0.14), LM('#4f9a3f')), DHOLE = mm(Bx(0.2, 0.012, 0.12), LM('#6b4a2a')); DIV.visible = DHOLE.visible = false; G.add(DIV, DHOLE);
  const FPS = [...Array(5)].map(() => { const m = mm(new THREE.CircleGeometry(0.1, 10), new THREE.MeshBasicMaterial({ color: '#a8905a', transparent: true }), 0, 0, 0, -Math.PI / 2); m.scale.set(0.7, 1.3, 1); m.visible = false; G.add(m); return { m, k: 0 }; });
  const RAKE = new THREE.Group(); RAKE.add(mm(Bx(0.5, 0.04, 0.06), LM(WOOD)), mm(Cy(0.012, 0.012, 1.3, 5), LM(WOOD), 0, 0.45, 0.4, 0.9)); for (let i = 0; i < 7; i++) RAKE.add(mm(Bx(0.012, 0.06, 0.012), LM(DARK), -0.22 + i * 0.073, -0.04, 0)); RAKE.visible = false; G.add(RAKE);
  function beginCaddie() { const p = nextCus(); J.p = p; const dd = () => { let d = 90 + Math.round(rnd(0, 10)) * 10; if (d === 150) d = 160; return d; }, d1 = dd(), d2 = dd();
    J.dist = [Math.round(rnd(22, 27)) * 10, d1, d2, Math.round(rnd(2, 4)) * 10, Math.round(rnd(4, 12))]; J.ans = [0, d1 >= 150 ? 1 : 2, d2 >= 150 ? 1 : 2, 3, 4]; J.li = 0; CB.visible = true; CB.position.copy(LIES[0]).setY(0.13); caPlace(); }
  const caDir = i => { const to = i < 4 ? LIES[i + 1] : CUP; return V(to.x - LIES[i].x, 0, to.z - LIES[i].z).normalize(); };
  function caPlace() { const i = J.li, b = LIES[i], d = caDir(i), pp = V(-d.z, 0, d.x), p = J.p; J.dir = d; J.perp = pp; standAt(p, b.x + pp.x * 0.75, b.z + pp.z * 0.75, Math.atan2(-pp.x, -pp.z));
    BAG.position.set(b.x - d.x * 0.7 - pp.x * 1.0, 0, b.z - d.z * 0.7 - pp.z * 1.0); BAG.rotation.y = Math.atan2(-d.z, d.x); bagCol.c[0] = BAG.position.x; bagCol.c[1] = BAG.position.z;
    J.step = i + 1; J.sub = 'pick'; J.wrong = 0; CLUBM.forEach(c => { c.g.visible = true; c.sp.visible = true; });
    sayC(p, [i === 0 ? 'The eighteenth. ' + J.dist[0] + ' yards, off the tee. What shall I hit, caddie?' : i < 3 ? J.dist[i] + ' yards from the ' + LIEN[i].toLowerCase() + '. Your call, caddie.' : i === 3 ? 'Oh, bother. The sand. What do I need?' : J.dist[4] + ' feet on the green. Hand me the right one.']); toast('TAP THE CLUB IN THE BAG', 1.8); }
  const caWhy = (k, i) => { const want = CLUBS[J.ans[i]]; if (i === 0) return 'Off the tee we want distance, old bean. The DRIVER.'; if (i === 3) return 'In the sand, always the SAND WEDGE. Look for SW.'; if (i === 4) return 'On the green we roll it. The PUTTER, please.';
    return J.dist[i] + ' yards. The chart says ' + (J.ans[i] === 1 ? '150 to 200 is the 5 IRON.' : '80 to 149 is the 9 IRON.') + (k === 0 ? ' The driver is only for the tee.' : ''); };
  function caPress() { const s = J.sub;
    if (s === 'pick') { const i = nearest(CLUBM, c => (c.sp.visible ? c.sp.getWorldPosition(V()) : null), RAD() * 1.7); if (i < 0) { toast('TAP A CLUB TAG IN THE BAG', 1); return; }
      if (i !== J.ans[J.li]) { nope(); J.miss++; J.wrong++; sayTo(mT, [lp(caWhy(i, J.li))], null, true); return; }
      pop(); addGold(J.wrong ? 3 : 6); if (!J.wrong) J.clean++; J.club = i; CLUBM.forEach(c => { c.sp.visible = false; }); const g = CLUBM[i].g; G.attach(g); J.sub = 'hand';
      fly(g, J.p.H.position.clone().add(V(0, 0.9, 0)), 0.5, 0.25, () => { g.visible = false; BAG.attach(g); g.position.copy(g.userData.home); g.rotation.set(0, 0, g.userData.rz); }); NEXT('hand', () => { J.sub = 'swing'; J.sw = 0; }, 0.6); }
    else if (s === 'divot') { if (dist(scrW(DIV.position)) > RAD() * 2.2) { toast('TAP THE DIVOT', 1); return; } pop(); J.sub = 'divoted'; fly(DIV, DHOLE.position.clone().add(V(0, 0.02, 0)), 0.5, 0.3, () => { DIV.visible = false; DHOLE.visible = false; burst(DHOLE.position.clone(), 5, '#7ac46a', 0.4); }); addGold(3); J.clean++; NEXT('divoted', caWalk, 0.9); }
    else if (s === 'rake') caDrag(); }
  function caDrag() { if (J.sub !== 'rake') return; const p = onPlane(V(0, 1, 0), V(0, 0.1, 0)); if (!p) return; RAKE.position.set(p.x, 0.12, p.z); const mv = Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly) / RAD() * 0.35 + 0.02;
    for (const F of FPS) { if (F.k <= 0) continue; if (Math.hypot(F.m.position.x - p.x, F.m.position.z - p.z) < 0.38) { F.k = Math.max(0, F.k - mv); F.m.material.opacity = F.k; if (F.k <= 0) { F.m.visible = false; tone(500, 0.03, 0.1, 'triangle'); burst(F.m.position.clone(), 3, SAND, 0.3); } } }
    if (FPS.every(F => F.k <= 0)) { J.sub = 'raked'; RAKE.visible = false; addGold(4); J.clean++; ding(); NEXT('raked', caWalk, 0.8); } }
  function caTick(dt) { const s = J.sub;
    if (s === 'swing') { J.sw += dt; J.p.H.rotation.y += Math.sin(J.sw * 14) * dt * 3; if (J.sw > 0.45) { thwack(); J.sub = 'fly'; J.ft = 0; J.from = CB.position.clone(); const to = J.li < 4 ? LIES[J.li + 1] : CUP; J.to = V(to.x, 0.13, to.z); J.arc = [9, 6, 4.5, 3, 0][J.club]; J.dur = J.club === 4 ? 1.8 : 1.6; if (J.li === 3) { burst(CB.position.clone(), 12, SAND, 1.2); splash(); } } }
    else if (s === 'fly') { J.ft += dt / J.dur; const k = Math.min(1, J.ft), e = J.club === 4 ? 1 - (1 - k) * (1 - k) : k; CB.position.lerpVectors(J.from, J.to, e); CB.position.y = 0.13 + Math.sin(k * Math.PI) * J.arc;
      if (k >= 1) { const prev = J.li; if (prev === 4) { CB.visible = false; ding(); cheer(); sayC(J.p, ['In the hole! Splendid caddying. Here\u2019s a little something.']); addGold(8); NEXT('end', () => finishGame([lp('A tidy round and a tidy course. You\u2019ll make a fine caddie, old bean.')]), 1.8); return; }
        if (prev === 1) { const a = LIES[1]; DHOLE.visible = DIV.visible = true; DHOLE.position.set(a.x - J.dir.x * 0.25, 0.085, a.z - J.dir.z * 0.25); DIV.position.set(a.x + J.dir.x * 0.9 + J.perp.x * 0.3, 0.1, a.z + J.dir.z * 0.9 + J.perp.z * 0.3); DIV.rotation.set(0.3, 0.6, 0.2); J.sub = 'divot'; toast('REPLACE THE DIVOT · TAP IT', 1.8); }
        else if (prev === 3) { const a = LIES[3]; FPS.forEach((F, i) => { const an = i / 5 * Math.PI * 2 + rnd(-0.3, 0.3), r = rnd(0.5, 1.4); F.m.position.set(a.x + Math.cos(an) * r, 0.1, a.z + Math.sin(an) * r); F.m.rotation.z = rnd(0, 3); F.k = 1; F.m.material.opacity = 1; F.m.visible = true; }); RAKE.visible = true; RAKE.position.set(a.x + 1.6, 0.12, a.z); J.sub = 'rake'; toast('RAKE THE BUNKER · DRAG OVER THE FOOTPRINTS', 2); }
        else caWalk(); } } }
  function caWalk() { J.li++; J.sub = 'walk'; const i = J.li, b = LIES[i], d = caDir(i), pp = V(-d.z, 0, d.x); walkTo(J.p, b.x + pp.x * 0.75, b.z + pp.z * 0.75, 1.4, null); fly(BAG, V(b.x - d.x * 0.7 - pp.x * 1.0, 0, b.z - d.z * 0.7 - pp.z * 1.0), 1.4, 0.2, null); BAG.rotation.y = Math.atan2(-d.z, d.x); NEXT('walk', caPlace, 1.5); }
  // ---- DRIVING RANGE: 8 balls · tap to tee up · hold to swing, let go in the target's green band ----
  const RB = mm(Sp(0.05, 8, 6), LM('#ffffff')); RB.visible = false; G.add(RB);
  const CLUBP = new THREE.Group(); { const sh = new THREE.Group(); sh.add(mm(Cy(0.012, 0.012, 0.95, 5), LM(STEEL), 0, -0.475, 0), mm(Bx(0.1, 0.05, 0.05), LM(DARK), 0.03, -0.95, 0)); sh.rotation.x = 0.45; CLUBP.add(sh); } CLUBP.position.set(291.0, 1.02, 122.95); CLUBP.visible = false; G.add(CLUBP);
  const raBand = T => [(T.x - 291 - T.r) / RNG, (T.x - 291 + T.r) / RNG];
  function beginRange() { J.bi = 0; J.res = []; CLUBP.visible = true; raNext(); }
  function raNext() { J.step = J.bi + 1; J.tg = J.bi < 3 ? J.bi : Math.floor(Math.random() * 3); J.sub = 'tee'; J.pow = 0; RB.visible = false; toast('TAP TO TEE UP · ' + TGT[J.tg].n, 1.4); }
  function raPress() { if (J.sub === 'tee') { RB.visible = true; RB.position.set(290.1, 0.35, 121.4); fly(RB, TEE, 0.4, 0.2, null); pop(); J.sub = 'aim'; return; } if (J.sub === 'aim') { J.sub = 'swing'; J.pow = 0; } }
  function raRelease() { if (J.sub !== 'swing') return; if (J.pow < 0.04) { J.sub = 'aim'; return; } thwack(); J.land = V(291 + J.pow * RNG, 0.12, 122.4 + rnd(-0.3, 0.3)); J.from = TEE.clone(); J.ft = 0; J.arc = 2 + J.pow * 7; J.sub = 'fly'; }
  function raTick(dt) { const s = J.sub; if (s === 'swing' && ptr.down) J.pow = Math.min(1, J.pow + dt * 0.55); CLUBP.rotation.z = s === 'swing' ? -J.pow * 2.4 : s === 'fly' ? Math.min(2.0, CLUBP.rotation.z + dt * 14) : CLUBP.rotation.z * Math.max(0, 1 - dt * 4);
    if (s === 'fly') { J.ft += dt / 1.3; const k = Math.min(1, J.ft); RB.position.lerpVectors(J.from, J.land, k); RB.position.y = 0.12 + Math.sin(k * Math.PI) * J.arc;
      if (k >= 1) { const T = TGT[J.tg], e = Math.hypot(J.land.x - T.x, J.land.z - 122.4); let r, gg; if (e < 0.55) { r = 'BULLSEYE'; gg = 6; J.clean++; ding(); burst(RB.position.clone(), 10, YEL, 0.8); } else if (e < T.r) { r = 'ON THE TARGET'; gg = 4; pop(); burst(RB.position.clone(), 6, '#ffffff', 0.5); } else { const o = TGT.find(q => Math.hypot(J.land.x - q.x, J.land.z - 122.4) < q.r); r = o ? 'WRONG TARGET · ' + o.n : J.land.x < T.x ? 'A BIT SHORT' : 'A BIT LONG'; gg = 1; J.miss++; tone(300, 0.04, 0.2, 'triangle'); }
        addGold(gg); J.res.push(r); toast(r + ' · +' + gg, 1.2); J.bi++; NEXT('landed', J.bi < 8 ? raNext : () => finishGame([lp(J.res.filter(x => x === 'BULLSEYE').length + ' bullseyes! You\u2019ve a lovely swing, old bean.')]), 1.2); } } }
  // ---- SERVE THE TERRACE: plates onto the tray → carry it out the back door → the table → back to the pass ----
  function beginWaiter() { J.orders = shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3).map(t => ({ t, items: shuffle([0, 1, 2, 3, 4, 5]).slice(0, Math.random() < 0.5 ? 2 : 3) })); J.oi = 0; J.onTray = []; wtNext(); }
  function wtNext() { busy = 'job'; J.step = J.oi + 1; J.sub = 'items'; J.got = []; J.onTray.forEach(o => o.parent && o.parent.remove(o)); J.onTray = []; G.attach(TRAY); TRAY.position.copy(TRAYH); TRAY.rotation.set(0, Math.PI / 2, 0); placeK('waiter'); const O = J.orders[J.oi]; J.O = O; const T = TB[O.t];
    if (J.p) J.p.H.visible = false; J.p = nextCus(); standAt(J.p, T.x + 0.8, T.z, -Math.PI / 2, 0.14); tone(988, 0.05, 0.2); tone(784, 0.05, 0.2, 'sine', 0.2); toast('TABLE ' + T.n + ' · ' + J.p.name + ' · TAP THE PLATES', 2.2); }
  function wtPress() { const O = J.O; if (J.sub === 'items') { const k = nearest(MENU, (_, i) => FOODP(i).add(V(0, 0.06, 0)), RAD() * 1.3); if (k < 0) { toast('TAP A PLATE ON THE PASS', 1); return; }
      if (!O.items.includes(k) || J.got.includes(k)) { nope(); J.miss++; toast(J.got.includes(k) ? 'ALREADY ON THE TRAY' : MENU[k].n + ' IS NOT ON THE TICKET', 1.4); return; }
      J.got.push(k); pop(); const g = food3D(k); g.position.copy(FOODP(k)); const to = TRAY.position.clone().add(TSLOT[J.onTray.length]); J.onTray.push(g); fly(g, to, 0.45, 0.2, () => { TRAY.attach(g); });
      if (J.got.length >= O.items.length) NEXT('loaded', () => { J.sub = 'lift'; toast('TAP THE TRAY TO PICK IT UP', 1.6); }, 0.6); }
    else if (J.sub === 'lift') { if (dist(scrW(TRAY.position)) > RAD() * 2.2) { toast('TAP THE TRAY', 1); return; } pop(); const T = TB[O.t]; J.sub = 'walk'; busy = 'walk'; J.steady = 1; J.wt = 0; J.lp = null; J.par = 14 + Math.hypot(T.x - SPOT.waiter.x, T.z - SPOT.waiter.z) / 2.5;
      toast('OUT THE BACK DOOR · TABLE ' + T.n, 2.6); placeK('idle'); } }
  function aim(P, D) { ARROW.visible = true; ARROW.position.set(P.x, (P.y || 0) + 2.7, P.z); ARROW.rotation.y = Math.atan2(D.x - P.x, D.z - P.z); BEACON.visible = RTGT.visible = true; BEACON.position.set(D.x, (D.y || 0) + 2.1, D.z); RTGT.position.set(D.x, (D.y || 0) + 0.18, D.z); }
  function wtWalk(dt, P, fox) { const yaw = fox ? fox.rotation.y : 0, fx = Math.sin(yaw), fz = Math.cos(yaw), py = P.y || 0;
    if (J.sub === 'walk') { TRAY.position.set(P.x + fx * 0.45, py + 1.05, P.z + fz * 0.45); TRAY.rotation.set(0, yaw, 0); J.wt += dt;
      if (J.lp) { const sp = Math.hypot(P.x - J.lp[0], P.z - J.lp[1]) / Math.max(dt, 1e-3); if (sp > 11) { J.steady = Math.max(0, J.steady - dt * 0.18); TRAY.rotation.z = Math.sin(J.t * 18) * 0.08; } } J.lp = [P.x, P.z];
      const T = TB[J.O.t]; aim(P, { x: T.x, z: T.z }); if (Math.hypot(P.x - T.x, P.z - T.z) < 1.5) wtTable(T); }
    else if (J.sub === 'back') { aim(P, SPOT.waiter); if (Math.hypot(P.x - SPOT.waiter.x, P.z - SPOT.waiter.z) < SPOT.waiter.r && py < 1) wtNext(); } }
  function wtTable(T) { J.sub = 'served'; ARROW.visible = BEACON.visible = RTGT.visible = false; const ontime = J.wt <= J.par, tip = 6 + Math.round(J.steady * 6) + (ontime ? 4 : 0); if (ontime && J.steady > 0.8) J.clean++;
    fly(TRAY, V(T.x, 1.18, T.z), 0.5, 0.1, null); addGold(tip); ding(); const p = J.p;
    sayC(p, [pick(['Splendid, a proper lunch! Have a tip.', 'Still cold! The iced tea, I mean. Lovely.', 'Service on the terrace! Marvellous.', 'Scones? No. Oh well, it\u2019s all delicious.']) + ' +' + tip + ' gold.']);
    NEXT('served', () => { J.onTray.forEach(o => { if (o.parent) o.parent.remove(o); }); J.onTray = []; G.attach(TRAY); TRAY.position.copy(TRAYH); TRAY.rotation.set(0, Math.PI / 2, 0);
      J.oi++; if (J.oi < 3) { J.sub = 'back'; toast('BACK TO THE PASS FOR THE NEXT TICKET', 2); } else { J.sub = 'last'; busy = 'walk'; finishGame([lp('Three tables, not a drop spilled. The terrace sings your praises, old bean.')]); } }, 2.2); }
  // ---- CROQUET: drag back + let go · hoops 1-4 in order · then the peg ----
  const CBL = mm(Sp(0.11, 12, 8), LM(BLUE)); CBL.visible = false; G.add(CBL);
  const MAL = new THREE.Group(); MAL.add(mm(Cy(0.06, 0.06, 0.26, 10), LM(WOOD), 0, 0.07, 0, Math.PI / 2), mm(Cy(0.012, 0.012, 0.85, 5), LM(WOOD), 0, 0.5, 0.0)); MAL.visible = false; G.add(MAL);
  const DOTS = [...Array(8)].map(() => { const m = mm(Sp(0.035, 6, 4), new THREE.MeshBasicMaterial({ color: YEL })); m.visible = false; G.add(m); return m; });
  const HW = () => (J && J.helped ? 0.8 : 0.4);
  function beginCroquet() { J.target = 0; J.strokes = 0; J.at = 0; J.helped = false; J.bv = V(); CBL.visible = MAL.visible = true; CBL.position.copy(CBS).setY(0.18); J.dir = V(0, 0, -1); J.step = 1; J.sub = 'aim'; toast('DRAG BACK FROM THE BALL · LET GO', 2); }
  function crPress() { if (J.sub !== 'aim') return; const p = onPlane(V(0, 1, 0), V(0, 0.16, 0)); if (!p) return; J.p0 = p; J.held = 'aim'; J.pow = 0; }
  function crDrag() { if (J.held !== 'aim') return; const p = onPlane(V(0, 1, 0), V(0, 0.16, 0)); if (!p) return; const d = V(J.p0.x - p.x, 0, J.p0.z - p.z), L = d.length(); J.pow = clamp(L / 2.2, 0, 1); if (L > 0.02) J.dir = d.normalize();
    DOTS.forEach((m, i) => { m.visible = J.pow > 0.04; m.position.set(CBL.position.x + J.dir.x * (0.25 + i * 0.32 * (0.3 + J.pow)), 0.16, CBL.position.z + J.dir.z * (0.25 + i * 0.32 * (0.3 + J.pow))); }); }
  function crRelease() { if (J.held !== 'aim') return; J.held = null; DOTS.forEach(m => { m.visible = false; }); if (J.pow < 0.05) return; clack(); J.bv.copy(J.dir).multiplyScalar(0.8 + J.pow * 6.2); J.strokes++; J.at++; J.sub = 'roll'; J.swing = 0.25; }
  function crTick(dt) { if (J.sub === 'aim' || J.sub === 'roll') { const d = J.dir, b = CBL.position; MAL.position.set(b.x - d.x * (0.28 + (J.held === 'aim' ? J.pow * 0.35 : 0)), 0.02, b.z - d.z * (0.28 + (J.held === 'aim' ? J.pow * 0.35 : 0))); MAL.rotation.y = Math.atan2(d.x, d.z) + Math.PI / 2; }
    if (J.sub !== 'roll') return; const b = CBL.position, v = J.bv; const n = 4, h = dt / n;
    for (let s = 0; s < n; s++) { const ox = b.x, oz = b.z; b.x += v.x * h; b.z += v.z * h; const sp = v.length(), ns = Math.max(0, sp - 1.7 * h); if (sp > 0) v.multiplyScalar(ns / sp);
      if (b.x < LX0 + 0.15) { b.x = LX0 + 0.15; v.x = Math.abs(v.x) * 0.6; clack(); } if (b.x > LX1 - 0.15) { b.x = LX1 - 0.15; v.x = -Math.abs(v.x) * 0.6; clack(); } if (b.z < LZ0 + 0.15) { b.z = LZ0 + 0.15; v.z = Math.abs(v.z) * 0.6; clack(); } if (b.z > LZ1 - 0.15) { b.z = LZ1 - 0.15; v.z = -Math.abs(v.z) * 0.6; clack(); }
      if (J.target < 4) { const H = HOOPS[J.target]; if ((oz - H.z) * (b.z - H.z) <= 0 && oz !== b.z) { const k = (H.z - oz) / (b.z - oz), xc = ox + (b.x - ox) * k; if (Math.abs(xc - H.x) < HW()) crHoop(); } }
      const dp = Math.hypot(b.x - PEG.x, b.z - PEG.z); if (dp < 0.13) { if (J.target === 4) { crPeg(); return; } const nx = (b.x - PEG.x) / dp, nz = (b.z - PEG.z) / dp, dot = v.x * nx + v.z * nz; if (dot < 0) { v.x -= 2 * dot * nx; v.z -= 2 * dot * nz; v.multiplyScalar(0.6); clack(); } b.x = PEG.x + nx * 0.13; b.z = PEG.z + nz * 0.13; } }
    CBL.rotation.x += v.z * dt * 8; CBL.rotation.z -= v.x * dt * 8;
    if (v.length() < 0.05) { v.set(0, 0, 0); J.sub = 'aim'; if (J.at >= 7 && J.target < 4) { const H = HOOPS[J.target]; b.set(H.x, 0.16, H.z - 0.5); sayTo(mT, [lp('Allow me, old bean. Through you go.')], null, true); crHoop(true); }
      else if (J.at >= 4 && !J.helped) { J.helped = true; toast('THE HOOP GOT WIDER · HAVE ANOTHER GO', 1.8); } } }
  function crHoop(given) { const H = HOOPS[J.target]; ding(); burst(V(H.x, 0.4, H.z), 10, YEL, 0.7); addGold(given ? 1 : J.at <= 1 ? 6 : J.at <= 3 ? 4 : 2); if (J.at <= 1 && !given) J.clean++; J.target++; J.at = 0; J.helped = false; J.step = J.target + 1; toast(J.target < 4 ? 'HOOP ' + J.target + '! NOW HOOP ' + (J.target + 1) : 'ALL FOUR! NOW HIT THE PEG', 1.6); }
  function crPeg() { J.bv.set(0, 0, 0); J.sub = 'pegged'; clack(); ding(); burst(V(PEG.x, 0.6, PEG.z), 14, YEL, 0.9); const par = 9, bonus = Math.max(4, 22 - Math.max(0, J.strokes - par) * 2); addGold(bonus); cheer();
    NEXT('end', () => finishGame([lp(J.strokes + ' strokes' + (J.strokes <= par ? '. Under par! Splendid croquet.' : '. A gentle game, gently played. Jolly good.'))]), 1.6); }
  // ---- POLISH THE TROPHIES: rub off the spots · buff it · tap the plate in the case ----
  const TTBL = V(319, 0.89, 67.2);
  function beginTrophies() { const pickK = k => pick(TR.filter(T => T.k === k)); J.list = shuffle([pickK(0), pickK(1), pickK(2)]); J.list.forEach(T => { T.g.visible = false; }); J.ti = 0; trNext(); }
  function trNext() { J.step = J.ti + 1; const T = J.list[J.ti]; J.T = T; T.g.visible = true; T.g.position.copy(TTBL); T.g.rotation.set(0, 0, 0); T.g.scale.setScalar(1.9); T.spots.forEach(s => { s.k = 1; s.m.visible = true; s.m.material.opacity = 1; }); J.shine = 0; J.wrong = 0; J.sub = 'rub'; toast(T.n + ' · RUB OFF THE GREEN SPOTS', 2); }
  function trDrag() { const T = J.T; if (J.sub === 'rub') { const mv = Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly) / RAD() * 0.3 + 0.03;
      for (const s of T.spots) { if (s.k <= 0) continue; if (dist(scrW(s.m.getWorldPosition(V()))) < RAD() * 1.3) { s.k = Math.max(0, s.k - mv); s.m.material.opacity = s.k; if (s.k <= 0) { s.m.visible = false; tone(700, 0.03, 0.08, 'triangle'); burst(s.m.getWorldPosition(V()), 3, '#ffffff', 0.3); } } }
      if (T.spots.every(s => s.k <= 0)) { addGold(4); J.clean++; NEXT('rubbed', () => { J.sub = 'buff'; toast('NOW BUFF IT · RUB BACK AND FORTH', 1.6); }, 0.5); } }
    else if (J.sub === 'buff') { const c = T.g.position.clone().add(V(0, 0.55, 0)); if (dist(scrW(c)) > RAD() * 5) return; J.shine = Math.min(1, J.shine + Math.hypot(ptr.x - ptr.lx, ptr.y - ptr.ly) / (MIN() * 2.0)); if (Math.random() < 0.3) burst(c.clone().add(V(rnd(-0.2, 0.2), rnd(-0.3, 0.3), 0.2)), 1, '#ffffff', 0.3);
      if (J.shine >= 1) { ding(); addGold(4); J.sub = 'shone'; burst(c, 12, YEL, 0.7); NEXT('shone', () => { J.sub = 'place'; toast('TAP ITS PLATE IN THE CASE', 1.8); }, 0.8); } } }
  function trPress() { if (J.sub === 'rub' || J.sub === 'buff') { trDrag(); return; } if (J.sub !== 'place') return; const T = J.T, free = J.list.slice(J.ti).map(q => q.slot);
    const s = nearest(free, sl => SLOT(sl).add(V(0, 0.15, 0)), RAD() * 2.4); if (s < 0) { const any = nearest([0, 1, 2, 3, 4, 5], sl => SLOT(sl).add(V(0, 0.15, 0)), RAD() * 2.4); toast(any >= 0 ? 'THAT SHELF IS TAKEN · FIND AN EMPTY PLATE' : 'TAP AN EMPTY PLATE IN THE CASE', 1.4); return; }
    const sl = free[s]; if (sl !== T.slot) { nope(); J.miss++; J.wrong++; const other = TR.find(q => q.slot === sl); sayTo(mT, [lp('That plate says ' + other.n + ', old bean. We\u2019re holding the ' + T.n + '.')], null, true); return; }
    ding(); addGold(J.wrong ? 2 : 5); if (!J.wrong) J.clean++; J.sub = 'placed'; T.g.scale.setScalar(1.6); T.g.rotation.set(0, -Math.PI / 2, 0); fly(T.g, SLOT(T.slot), 0.8, 0.4, () => { burst(SLOT(T.slot).add(V(0, 0.3, 0)), 8, YEL, 0.5); });
    J.ti++; NEXT('placed', J.ti < 3 ? trNext : () => finishGame([lp('Gleaming! The trophy room hasn\u2019t looked this smart since 1902.')]), 1.4); }
  // ---- POOL LIFEGUARD: 6 events · TAP a swimmer in trouble (ring buoy) · TAP a runner (whistle) ----
  const headOf = s => s.p.H.position.clone().add(V(0, 1.2, 0));
  function beginLifeguard() { J.sw = [0, 1, 2, 3].map(i => { const p = cus(i); const x = rnd(PX0 + 1, PX1 - 1); standAt(p, x, LANEZ[i], 0, -0.74); p.H.scale.setScalar(0.9); return { p, x, dir: Math.random() < 0.5 ? 1 : -1, sp: rnd(0.55, 0.9), st: 'swim', ph: rnd(0, 6) }; });
    J.ev = ['T', 'R', 'T', 'T', 'R', 'T']; J.ei = 0; J.wait = 2.0; J.cur = null; J.step = 1; J.sub = 'watch'; toast('WATCH THE POOL', 1.6); }
  function lgEvent() { const type = J.ev[J.ei]; if (type === 'T') { const s = pick(J.sw.filter(q => q.st === 'swim')); s.st = 'help'; J.cur = { type, s, t: 0 }; splash(); sayC(s.p, [pick(['Help! Cramp!', 'Help! I swallowed half the pool!', 'Help! Too deep!'])]); toast('SOMEONE NEEDS HELP · TAP THEM', 1.8); }
    else { const k = kid(); standAt(k, PX0 - 0.6, PZ0 - 0.75, Math.PI / 2, 0.1); J.cur = { type, t: 0, kx: PX0 - 0.6, kd: 1 }; toast('NO RUNNING! TAP THE KID', 1.8); } }
  function lgPress() { if (J.sub !== 'watch') return; const c = J.cur; if (!c || c.done) { toast('EYES ON THE WATER', 0.8); return; }
    if (c.type === 'T') { if (dist(scrW(headOf(c.s))) < RAD() * 2.4) lgRescue(true); else toast('TAP THE SPLASHING SWIMMER', 0.9); }
    else { if (dist(scrW(kidF.H.position.clone().add(V(0, 0.5, 0)))) < RAD() * 2.4) lgWhistle(true); else toast('TAP THE RUNNING KID', 0.9); } }
  function lgRescue(ok) { const c = J.cur, s = c.s; c.done = true; whistle(); const g = ok ? (c.t < 2.5 ? 8 : 6) : 1; addGold(g); if (ok && c.t < 2.5) J.clean++; if (!ok) { J.miss++; sayTo(endM, [lp('I\u2019ll get this one, old bean. Ring buoy away!')], null, true); }
    fly(BUOY, headOf(s).add(V(0, -0.85, 0)), 0.6, 1.2, () => { splash(); s.st = 'tow'; fly(s.p.H, V(s.p.H.position.x, -0.74, PZ1 - 0.45), 1.2, 0, () => { sayC(s.p, [pick(['Thank you, lifeguard!', 'Phew. Saved by the ring!', 'I\u2019ll stay in the shallow end.'])]); s.st = 'swim'; s.x = s.p.H.position.x; BUOY.position.copy(BUOYH); lgNext(); }); }); }
  function lgWhistle(ok) { const c = J.cur; c.done = true; c.walk = true; whistle(); const g = ok ? (c.t < 2.5 ? 7 : 5) : 1; addGold(g); if (ok && c.t < 2.5) J.clean++; if (!ok) { J.miss++; sayTo(endM, [lp('WALK, young fox! Walk!')], null, true); } sayC(kidF, ['Sorry! Walking now!']); NEXT('watch', lgNext, 1.6); J.sub = 'watch'; }
  function lgNext() { J.cur = null; J.ei++; if (kidF) kidF.H.visible = false; if (J.ei >= J.ev.length) { NEXT('end', () => { hideC(); finishGame([lp('Not a single soggy member lost. Six for six, lifeguard!')]); }, 1.4); return; } J.step = J.ei + 1; J.wait = 2.4; J.sub = 'watch'; }
  function lgTick(dt) { const t = J.t; if (!Array.isArray(J.sw)) return; for (const s of J.sw) { const H = s.p.H; if (s.st === 'swim') { s.x += s.dir * s.sp * dt; if (s.x > PX1 - 0.7) { s.x = PX1 - 0.7; s.dir = -1; } if (s.x < PX0 + 0.7) { s.x = PX0 + 0.7; s.dir = 1; } H.position.x = s.x; H.position.y = -0.74 + Math.sin(t * 2 + s.ph) * 0.03; H.rotation.y = s.dir > 0 ? Math.PI / 2 : -Math.PI / 2; }
      else if (s.st === 'help') { H.position.y = -0.74 + Math.sin(t * 12) * 0.1 - 0.06; H.rotation.y += dt * 2; if (Math.random() < dt * 5) burst(headOf(s).add(V(0, -0.9, 0)), 3, '#e8f8ff', 0.6); } }
    waterT.offset.x = (t * 0.03) % 1; waterT.offset.y = (t * 0.02) % 1;
    if (J.sub !== 'watch' && J.sub !== 'intro') return;
    const c = J.cur; if (!c) { if (J.sub === 'watch' && J.pause <= 0) { J.wait -= dt; if (J.wait <= 0) lgEvent(); } return; }
    c.t += dt; if (c.type === 'T') { if (!c.done) { ALERT.visible = true; ALERT.position.copy(headOf(c.s)).add(V(0, 0.45, 0)); ALERT.lookAt(camera.position); ALERT.scale.setScalar(1 + 0.2 * Math.sin(t * 10)); if (c.t > 6) lgRescue(false); } }
    else { const k = kidF.H; if (!c.walk) { c.kx += c.kd * 4 * dt; if (c.kx > PX1 + 0.4) { c.kx = PX1 + 0.4; c.kd = -1; } if (c.kx < PX0 - 0.6) { c.kx = PX0 - 0.6; c.kd = 1; } k.position.x = c.kx; k.rotation.y = c.kd > 0 ? Math.PI / 2 : -Math.PI / 2; ALERT.visible = true; ALERT.position.copy(k.position).add(V(0, 1.25, 0)); ALERT.lookAt(camera.position); if (c.t > 6) lgWhistle(false); }
      else { c.kx -= 1 * dt; k.position.x = c.kx; k.rotation.y = -Math.PI / 2; } } }
  // ---- VALET PARKING: a car pulls up · tap it · hold to drive to the bay, crawl, let go on the number · ×2 · then fetch one back ----
  const CARC = [['RED', RED], ['BLUE', BLUE], ['YELLOW', YEL], ['GREEN', GREEN], ['WHITE', '#e8e8ea'], ['BLACK', '#2a2827']];
  const CARS = []; function ensureCars() { if (CARS.length) return; for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.visible = false; G.add(g); const c1 = { c: [9999, 9999, 0.1] }, c2 = { c: [9999, 9999, 0.1] }; cols.push(c1, c2); CARS.push({ g, ci: 0, plate: '', bay: -1, c1, c2, own: null }); } }
  function paintCar(C, ci, plate) { const g = C.g; while (g.children.length) g.remove(g.children[0]); C.ci = ci; C.plate = plate; const m = LM(CARC[ci][1]);
    g.add(mm(Bx(1.8, 0.55, 3.9), m, 0, 0.55, 0), mm(Bx(1.62, 0.5, 2.0), LM('#2a3a48'), 0, 1.07, -0.25), mm(Bx(1.66, 0.06, 2.04), m, 0, 1.35, -0.25), mm(Bx(1.84, 0.12, 3.94), LM(DARK), 0, 0.3, 0));
    for (const sx of [-1, 1]) for (const sz of [-1.25, 1.25]) g.add(mm(Cy(0.34, 0.34, 0.24, 12), LM(INK), sx * 0.86, 0.34, sz, 0, 0, Math.PI / 2));
    for (const sx of [-0.6, 0.6]) g.add(mm(Bx(0.32, 0.14, 0.04), LM('#fff6c8'), sx, 0.66, 1.96), mm(Bx(0.32, 0.12, 0.04), LM('#ff3a2a'), sx, 0.68, -1.96));
    const tx = label(plate, '#ffffff', INK, 256, 64, 40); for (const s of [-1, 1]) { const pl = mm(new THREE.PlaneGeometry(0.62, 0.16), new THREE.MeshBasicMaterial({ map: tx }), 0, 0.46, s * 1.975, 0, s < 0 ? Math.PI : 0, 0); g.add(pl); }
    const rt = label(plate, CARC[ci][1], ci === 2 || ci === 4 ? INK : '#ffffff', 256, 64, 40); const rp = mm(new THREE.PlaneGeometry(1.2, 0.3), new THREE.MeshBasicMaterial({ map: rt }), 0, 1.385, -0.25, -Math.PI / 2, 0, 0); g.add(rp); }
  const carCol = C => { if (!C.g.visible || C.bay < 0) { C.c1.c[0] = C.c2.c[0] = 9999; C.c1.c[1] = C.c2.c[1] = 9999; return; } const y = C.g.rotation.y, fx = Math.sin(y), fz = Math.cos(y), p = C.g.position; C.c1.c[0] = p.x + fx * 1.0; C.c1.c[1] = p.z + fz * 1.0; C.c1.c[2] = 1.0; C.c2.c[0] = p.x - fx * 1.0; C.c2.c[1] = p.z - fz * 1.0; C.c2.c[2] = 1.0; };
  const parkAt = (C, b) => { const p = BAYP(b); C.g.position.set(p.x, 0, p.z); C.g.rotation.y = b < 5 ? -Math.PI / 2 : Math.PI / 2; C.bay = b; carCol(C); };
  const roundPath = (pts, r = 2.6) => { const out = [pts[0]]; for (let i = 1; i < pts.length - 1; i++) { const a = pts[i - 1], b = pts[i], c = pts[i + 1], d1 = b.clone().sub(a), d2 = c.clone().sub(b), rr = Math.min(r, d1.length() / 2, d2.length() / 2); d1.normalize(); d2.normalize();
      const p0 = b.clone().addScaledVector(d1, -rr), p2 = b.clone().addScaledVector(d2, rr); for (let k = 0; k <= 8; k++) { const t = k / 8; out.push(p0.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(b, 2 * t * (1 - t)).addScaledVector(p2, t * t)); } }
    out.push(pts[pts.length - 1]); const L = [0]; for (let i = 1; i < out.length; i++) L.push(L[i - 1] + out[i].distanceTo(out[i - 1])); return { p: out, L, len: L[L.length - 1] }; };
  const atS = (P, s) => { s = clamp(s, 0, P.len); let i = 1; while (i < P.L.length - 1 && P.L[i] < s) i++; const a = P.p[i - 1], b = P.p[i], k = (s - P.L[i - 1]) / Math.max(1e-6, P.L[i] - P.L[i - 1]); return { x: a.x + (b.x - a.x) * k, z: a.z + (b.z - a.z) * k, yaw: Math.atan2(b.x - a.x, b.z - a.z) }; };
  const plateN = () => 'MRU ' + (10 + Math.floor(Math.random() * 89));
  function beginValet() { ensureCars(); const cc6 = shuffle([0, 1, 2, 3, 4, 5]), bays = shuffle([...Array(10).keys()]), p0 = plateN(); let p2 = plateN(); while (p2 === p0) p2 = plateN();
    paintCar(CARS[0], cc6[0], p0); paintCar(CARS[1], cc6[1], plateN()); paintCar(CARS[2], cc6[0], p2); paintCar(CARS[3], cc6[2], plateN()); paintCar(CARS[4], cc6[3], plateN());
    CARS.forEach(C => { C.g.visible = false; C.bay = -1; C.own = null; carCol(C); }); [2, 3, 4].forEach((k, i) => { const C = CARS[k]; C.g.visible = true; parkAt(C, bays[i]); }); J.free = bays.slice(3); J.k = 0; J.ret = false; vaArrive(); }
  function vaArrive() { J.step = J.k + 1; const C = CARS[J.k]; J.car = C; C.bay = -1; C.g.visible = true; C.g.position.set(345, 0, VS.z); C.g.rotation.y = -Math.PI / 2; horn(); J.sub = 'arrive'; J.wrong = 0;
    fly(C.g, VS, 2.4, 0, () => { if (!J || J.g !== 'valet') return; const p = nextCus(); C.own = p; standAt(p, VS.x - 0.4, 58.3, Math.PI); J.bay = J.free.shift(); J.sub = 'tapcar';
      sayC(p, [pick(['Park her nicely, would you? Bay ' + (J.bay + 1) + '.', 'Keys! Bay ' + (J.bay + 1) + ', please. No scratches.', 'Here you are. Bay ' + (J.bay + 1) + ', there\u2019s a good fox.'])]); toast('TAP THE CAR · BAY ' + (J.bay + 1), 2); }); }
  function vaPress() { const s = J.sub;
    if (s === 'tapcar') { const C = J.car; if (dist(scrW(C.g.position.clone().add(V(0, 0.9, 0)))) > RAD() * 4) { toast('TAP THE CAR', 1); return; } pop(); jingle(); const p = C.own; walkTo(p, 307, 62.6, 1.8, () => { p.H.visible = false; });
      const B = BAYP(J.bay), endX = J.bay < 5 ? B.x - 1.6 : B.x + 1.6; J.path = roundPath([V(VS.x, 0, VS.z), V(AISLE, 0, VS.z), V(AISLE, 0, B.z), V(endX, 0, B.z)]); J.st = J.path.len - 1.6; J.s = 0; J.v = 0; J.moved = false; J.sub = 'drive'; toast('HOLD TO DRIVE · LET GO TO STOP', 2.2); }
    else if (s === 'fetch') { const list = CARS.filter(C => C.g.visible && C.bay >= 0), i = nearest(list, C => C.g.position.clone().add(V(0, 0.9, 0)), RAD() * 4); if (i < 0) { toast('TAP A CAR IN THE LOT', 1); return; } const C = list[i], W = CARS[0];
      if (C !== W) { nope(); J.miss++; J.wrong++; sayC(J.own, ['Not that one! That\u2019s ' + C.plate + '. Mine\u2019s the ' + CARC[W.ci][0].toLowerCase() + ' one, plate ' + W.plate + '.']); return; }
      pop(); addGold(J.wrong ? 2 : 5); if (!J.wrong) J.clean++; J.car = C; const B = BAYP(C.bay); J.bz = B.z; C.bay = -1; carCol(C); J.outT = 0; J.outFrom = C.g.position.clone(); J.outYaw = C.g.rotation.y; J.sub = 'out'; toast('BACKING OUT\u2026', 1.2); } }
  function vaStop(res) { J.sub = 'parked'; const g = { perfect: 8, good: 5, far: 3, bump: 2 }[res]; addGold(g); if (res === 'perfect') { J.clean++; ding(); } else if (res === 'bump') { J.miss++; } else pop();
    toast({ perfect: 'PERFECT PARK · +8', good: 'NICELY DONE · +5', far: 'A BIT FAR · SIR PERCY STRAIGHTENS IT', bump: 'BUMP! GENTLY NEXT TIME' }[res], 1.6); const q = atS(J.path, J.st), C = J.car; fly(C.g, V(q.x, 0, q.z), 0.4, 0, null); C.g.rotation.y = q.yaw;
    if (!J.ret) { NEXT('parked', () => { C.bay = J.bay; carCol(C); jingle(); J.k++; if (J.k < 2) vaArrive(); else vaFetch(); }, 1.3); }
    else { const p = J.own; NEXT('parked', () => { walkTo(p, C.g.position.x - 0.4, C.g.position.z + 1.2, 0.8, () => { p.H.visible = false; }); const tip = 8 + (J.clean >= 2 ? 4 : 0); addGold(tip); sayC(p, ['Not a scratch! Here\u2019s ' + tip + ' gold for you.']);
      NEXT('home', () => { horn(); fly(C.g, V(345, 0, VS.z), 2.4, 0, () => { C.g.visible = false; }); finishGame([lp('Three cars and not a single dent. The finest valet in Meru, old bean.')]); }, 1.6); }, 1.0); } }
  function vaFetch() { J.k = 2; J.step = 3; J.ret = true; J.wrong = 0; const p = CARS[0].own; J.own = p; standAt(p, 307, 62.6, Math.PI); J.sub = 'calling';
    walkTo(p, VS.x - 0.4, 58.4, 1.8, () => { if (!J || J.g !== 'valet') return; sayC(p, ['Lovely round! My car, please. The ' + CARC[CARS[0].ci][0].toLowerCase() + ' one, plate ' + CARS[0].plate + '.']); J.sub = 'fetch'; toast('TAP THEIR CAR IN THE LOT', 2); }); }
  function vaTick(dt) { const s = J.sub, C = J.car;
    if (s === 'drive') { const zone = J.s > J.st - 4.5, vmax = zone ? 1.6 : 7; if (ptr.down) { J.v = J.v > vmax ? Math.max(vmax, J.v - dt * 8) : Math.min(vmax, J.v + dt * 5); J.moved = true; } else J.v = Math.max(0, J.v - dt * (zone ? 10 : 6));
      J.s += J.v * dt; let bump = false; if (J.s >= J.path.len) { J.s = J.path.len; J.v = 0; bump = true; } const q = atS(J.path, J.s); C.g.position.set(q.x, 0, q.z); C.g.rotation.y = q.yaw;
      if (bump) { tone(120, 0.12, 0.2, 'square'); vaStop('bump'); return; } if (!ptr.down && J.v === 0 && zone && J.moved && J.s >= J.st - 0.9) vaStop(Math.abs(J.s - J.st) <= 0.35 ? 'perfect' : J.s <= J.st + 0.9 ? 'good' : 'far'); }
    else if (s === 'out') { J.outT = Math.min(1, J.outT + dt / 1.4); const k = J.outT * J.outT * (3 - 2 * J.outT); C.g.position.lerpVectors(J.outFrom, V(AISLE, 0, J.bz), k); C.g.rotation.y = J.outYaw + Math.atan2(Math.sin(Math.PI - J.outYaw), Math.cos(Math.PI - J.outYaw)) * k;
      if (J.outT >= 1) { J.path = roundPath([V(AISLE, 0, J.bz), V(AISLE, 0, VS.z), V(VS.x + 1.6, 0, VS.z)]); J.st = J.path.len - 1.6; J.s = 0; J.v = 0; J.moved = false; J.sub = 'drive'; toast('HOLD TO DRIVE IT ROUND · STOP AT THE STEPS', 2); } } }
  // ---- finish (all games) ----
  function finishGame(lines) { const g = J.g; addGold(10); if (J.clean >= 2 && !J.miss) { addGold(8); toast('IMMACULATE · +8 GOLD', 2); }
    J.sub = 'pay'; const d = doneMap(), first = !d[g]; d[g] = true; let full = false; if (DOING.every(([k]) => d[k]) && !d.full) { d.full = true; full = true; } save.setStat('ccDone', { ...d }); redraw(boardTex, boardFn);
    if (J.gold > save.stat('ccBest_' + g, 0)) save.setStat('ccBest_' + g, J.gold); const g2 = giveGift(); if (full) { save.addGold(60); save.give('silverCup'); }
    const l0 = lines[0] && lines[0].text, op = l0 && l0.split(/\s+/).length <= 8 ? l0 : ['Jolly good show, old bean!', 'Splendid work!', 'Top drawer, that.', 'The committee approves!'][save.stat('ccClears', 0) % 4];
    const pz = g2.kind === 'blazer' ? ' Your club blazer and cap! The lobby hook swaps them.' : g2.kind === 'sand' ? ' Three club sandwiches for your bag.' : g2.kind === 'sand1' ? ' A club sandwich too.' : ' Twenty bonus gold!', stars = !J.miss ? 3 : J.miss <= 2 ? 2 : 1;
    sayTo(endM, [lp(op + ' ' + J.gold + ' gold.' + pz), ...(full ? [lp('ALL SEVEN! Full member! Sixty gold and the SILVER CUP.')] : [])], null, true); SK.finish(g, stars, J.gold, first); cheer(); NEXT('pay', () => stop(), 1.2); }
  // ---- input dispatch ----
  function press() { if (!J || J.pause > 0) return; const g = J.g, s = J.sub; if (s === 'intro' || s === 'pay') return;
    if (g === 'caddie') caPress(); else if (g === 'range') raPress(); else if (g === 'waiter') wtPress(); else if (g === 'croquet') crPress(); else if (g === 'trophies') trPress(); else if (g === 'valet') vaPress(); else if (g === 'lifeguard') lgPress(); }
  function drag() { if (!J) return; const g = J.g; if (g === 'caddie') caDrag(); else if (g === 'croquet') crDrag(); else if (g === 'trophies') trDrag(); }
  function release() { if (!J) return; const g = J.g; if (g === 'range') raRelease(); else if (g === 'croquet') crRelease(); }
  // ---- the game card ----
  const strip = (names, n) => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + names.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 1px;font-size:9px;font-weight:900;border:2px solid #201e1d;overflow:hidden;text-align:left;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  const NEXTS = { pick: 'TAP THE RIGHT CLUB', hand: 'HERE YOU ARE', swing: 'FORE!', fly: 'WATCH IT GO\u2026', divot: 'TAP THE DIVOT', divoted: 'TIDY!', rake: 'DRAG THE RAKE OVER THE PRINTS', raked: 'SMOOTH!', walk: 'TO THE NEXT SHOT\u2026',
    tee: 'TAP TO TEE UP', aim: 'HOLD TO SWING BACK', swing2: 'LET GO IN THE GREEN', landed: 'NEXT BALL\u2026', items: 'TAP THE PLATES', lift: 'TAP THE TRAY', walkT: 'CARRY IT · FOLLOW THE ARROW', back: 'BACK TO THE PASS', served: 'SERVED!', loaded: 'TRAY READY',
    roll: 'ROLLING\u2026', aimC: 'DRAG BACK · LET GO', pegged: 'PEG!', rub: 'RUB THE GREEN SPOTS', buff: 'RUB TO BUFF IT', rubbed: 'CLEAN!', shone: 'GLEAMING!', place: 'TAP ITS PLATE', placed: 'BACK IN THE CASE', watch: 'WATCH THE POOL',
    arrive: 'A CAR IS COMING\u2026', tapcar: 'TAP THE CAR', drive: 'HOLD = DRIVE · LET GO = STOP', parked: 'PARKED!', calling: 'A MEMBER IS COMING\u2026', fetch: 'TAP THEIR CAR', out: 'BACKING OUT\u2026', home: 'DELIVERED!', end: 'WELL PLAYED!' };
  function drawCard() { if (!J) return; const s = J.sub, g = J.g, names = PARTS[g], hr = J.gold ? J.gold + ' G' : ''; let det = '', key = g + s + J.step + '_' + J.gold;
    const hd = GN[g] + (J.step && names.length > 1 ? ' · ' + Math.min(J.step, names.length) + '/' + names.length : ''), next = s === 'intro' ? 'LISTEN TO SIR PERCY' : s === 'pay' ? 'ALL DONE' : (g === 'croquet' && s === 'aim' ? NEXTS.aimC : g === 'range' && s === 'swing' ? NEXTS.swing2 : g === 'waiter' && s === 'walk' ? NEXTS.walkT : NEXTS[s]) || 'NEXT\u2026';
    if (s === 'intro') det = row(NAVY, 'STARTING SOON', '', false); else if (s === 'pay') det = big('+' + J.gold + ' GOLD', GREEN);
    else if (g === 'caddie') { const i = J.li, dt = i < 3 ? J.dist[i] + ' YD' : i === 3 ? 'IN THE SAND' : J.dist[4] + ' FT'; key += i + '_' + J.wrong + '_' + FPS.filter(F => F.k > 0).length;
      det = big(LIEN[i] + ' · ' + dt, NAVY) + (s === 'rake' ? row(SAND, 'FOOTPRINTS LEFT', FPS.filter(F => F.k > 0).length + '/5', false) : s === 'divot' ? row('#4f9a3f', 'THE DIVOT', 'TAP IT', false) : small('THE CADDIE CHART') + CLUBS.map((c, k) => row(c.c, c.t + ' · ' + c.n, c.rule, J.wrong >= 2 && k === J.ans[i])).join('')); }
    else if (g === 'range') { const T = TGT[J.tg]; key += J.bi + '_' + Math.round(J.pow * 50); det = big('HIT THE ' + T.n + ' FLAG', T.c === WHITE ? INK : T.c, T.c === YEL ? INK : '#fff') + row(YEL, 'SWING', Math.round(J.pow * 100) + '%', false) + bar(J.pow, YEL, raBand(T)) + row(RED, 'BULLSEYES', String(J.res.filter(x => x === 'BULLSEYE').length), false) + small('HOLD · LET GO IN THE GREEN BAND'); }
    else if (g === 'waiter') { const O = J.O, T = TB[O.t]; key += J.got.length + '_' + Math.round((J.steady || 0) * 10) + '_' + Math.ceil(Math.max(0, (J.par || 0) - (J.wt || 0))); det = big('TABLE ' + T.n + ' · ' + (J.p ? J.p.name : ''), NAVY) + O.items.map(k => row(MENU[k].c, MENU[k].n, J.got.includes(k) ? '\u2713' : '', J.got.includes(k))).join('');
      if (s === 'walk') { const left = Math.max(0, J.par - J.wt); det += row(YEL, 'STEADY TRAY', Math.round(J.steady * 100) + '%', J.steady > 0.8) + bar(J.steady, YEL) + small(left > 0 ? Math.ceil(left) + ' S · ON-TIME TIP' : 'LATE IS FINE · KEEP GOING'); } if (s === 'back') det = row(YEL, 'NEXT TICKET', 'AT THE PASS', false) + small('E AT THE PASS = END THE ROUND'); }
    else if (g === 'croquet') { key += J.target + '_' + J.strokes + '_' + Math.round((J.pow || 0) * 20) + (J.held ? 'h' : ''); det = big(J.target < 4 ? 'THROUGH HOOP ' + (J.target + 1) : 'HIT THE PEG', J.target === 0 ? BLUE : NAVY) + row(BLUE, 'STROKES', String(J.strokes), false) + row(GREEN, 'PAR', '9', false) + (J.held === 'aim' ? bar(J.pow, YEL) : '') + small(J.helped ? 'THE HOOP IS WIDER NOW' : 'DRAG BACK FROM ANYWHERE · LET GO'); }
    else if (g === 'trophies') { const T = J.T, left = T ? T.spots.filter(q => q.k > 0).length : 0; key += left + '_' + Math.round((J.shine || 0) * 20) + '_' + J.wrong; det = T ? big('ENGRAVED: ' + T.n, NAVY) + row('#5a6a3a', 'GREEN SPOTS', left + '/6', left === 0) + row(SILVER, 'SHINE', Math.round(J.shine * 100) + '%', J.shine >= 1) + bar(J.shine, SILVER) + (s === 'place' ? small('FIND THE PLATE THAT SAYS ' + T.n) : '') : ''; }
    else if (g === 'valet') { const C = J.car, W = CARS[0]; key += Math.round((J.s || 0) * 2) + (J.s > J.st - 4.5 ? 'z' : '') + J.wrong;
      if (J.ret && (s === 'fetch' || s === 'calling')) det = big('FETCH · ' + CARC[W.ci][0] + ' · ' + W.plate, CARC[W.ci][1], W.ci === 2 || W.ci === 4 ? INK : '#fff') + small('TAP THAT CAR IN THE LOT');
      else { det = (J.ret ? big('TO THE STEPS', NAVY) : big('BAY ' + (J.bay == null ? '?' : J.bay + 1), NAVY)) + (C ? row(CARC[C.ci][1], CARC[C.ci][0] + ' · ' + C.plate, '', false) : ''); if (s === 'drive') det += J.s > J.st - 4.5 ? big('CRAWL · LET GO ON THE MARK', YEL, INK) : row(YEL, 'HOLD TO DRIVE', Math.round(J.v * 3.6) + ' KM/H', false); } }
    else if (g === 'lifeguard') { const c = J.cur; key += J.ei + (c ? c.type + (c.done ? 'd' : '') : ''); det = (c && !c.done ? big(c.type === 'T' ? 'HELP! TAP THE SWIMMER' : 'RUNNING! TAP THE KID', RED) : big('ALL CALM', BLUE)) + row(BLUE, 'SWIMMERS', '4', false) + row(ORANGE, 'RING BUOY', 'READY', false) + small('TAP = RING BUOY OR WHISTLE'); }
    setCard(key, head2(hd, hr) + foot(next, !(g === 'waiter' && (s === 'walk' || s === 'back'))) + '<div style="padding:8px 10px 10px">' + (names.length > 1 && J.step ? strip(names, Math.min(J.step, names.length)) : '') + det + '</div>'); }
  function stop() { busy = null; J = null; ptr.down = false; FLIES.length = 0; hideCard(); placeK('idle'); hideC(); HI.visible = HI2.visible = ALERT.visible = false; ARROW.visible = BEACON.visible = RTGT.visible = false;
    G.attach(TRAY); TRAY.position.copy(TRAYH); TRAY.rotation.set(0, Math.PI / 2, 0); while (TRAY.children.length > 3) TRAY.remove(TRAY.children[3]);
    CB.visible = RB.visible = CBL.visible = MAL.visible = CLUBP.visible = DIV.visible = DHOLE.visible = RAKE.visible = false; FPS.forEach(F => { F.m.visible = false; }); DOTS.forEach(m => { m.visible = false; }); CLUBP.rotation.z = 0;
    BAG.position.copy(BAGH); BAG.rotation.y = 0; bagCol.c[0] = BAGH.x; bagCol.c[1] = BAGH.z; CLUBM.forEach(c => { BAG.attach(c.g); c.g.visible = true; c.g.position.copy(c.g.userData.home); c.g.rotation.set(0, 0, c.g.userData.rz); c.sp.visible = false; });
    TR.forEach(homeTrophy); BUOY.position.copy(BUOYH); CARS.forEach(C => { C.g.visible = false; C.bay = -1; carCol(C); }); }
  // ================= camera =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT2 = Math.tan(vf), asp = camera.aspect || 1, wT = hT2 * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT2) : h / 2 / hT2, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT2 * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub, g = J.g, port = (camera.aspect || 1) < 1;
    if (g === 'waiter') return [V(289.3, 1.05, 76.3), 3.2, 1.3, 0.55, 1.6, Math.PI / 2, 4.4];
    if (g === 'trophies') return s === 'place' || s === 'placed' ? [V(325.0, 1.45, 67.2), 7.4, 2.0, 0.1, 3, -Math.PI / 2, 9] : [V(319, 1.4, 67.2), 2.2, 1.6, 0.28, 2.4, 0, 4];
    if (g === 'range') return { pos: port ? V(283.0, 5.6, 126.4) : V(285.4, 3.4, 125.4), look: V(306, 0.3, 122.2) };
    if (g === 'caddie') { if (!J.dir) return [V(290.8, 0.9, 126.4), 3.4, 2.2, 0.3, 3, -2.0, 6]; const yb = Math.atan2(-J.dir.x, -J.dir.z);
      if (s === 'fly') return { pos: J.from.clone().addScaledVector(J.dir, -5).add(V(0, J.club === 4 ? 2.4 : 3.4, 0)), look: CB.position.clone() };
      if (s === 'divot' || s === 'divoted') return [DIV.position.clone(), 2.2, 1.6, 0.9, 2.4, yb, 5]; if (s === 'rake' || s === 'raked') return [LIES[3].clone(), 3.6, 3.2, 1.0, 3.5, yb, 7];
      const m = BAG.position.clone().lerp(J.p.H.position, 0.45).add(V(0, 0.9, 0)), ys = Math.atan2(-J.perp.x, -J.perp.z) + 0.35; return [m, 3.6, 2.3, 0.38, 4.2, ys, 7]; }
    if (g === 'croquet') { const b = CBL.position, T = J.target < 4 ? HOOPS[J.target] : PEG, d = Math.max(1.5, Math.hypot(T.x - b.x, T.z - b.z)), m = V((b.x + T.x) / 2, 0.2, (b.z + T.z) / 2); return [m, Math.max(5.5, d + 3), Math.max(3.6, d * 0.7 + 2), 0.9, 6.5, Math.atan2(b.x - T.x, b.z - T.z), 20]; }
    if (g === 'lifeguard') return [V(317.8, 0.4, 87.8), 15, 9.5, 0.78, 8, 0.3, 26];
    if (g === 'valet') { const C = J.car;
      if ((s === 'drive' || s === 'out' || s === 'parked') && C) { const y = C.g.rotation.y, f = V(Math.sin(y), 0, Math.cos(y)), p = C.g.position, zone = s === 'parked' || (J.path && J.s > J.st - 4.5); return zone ? { pos: p.clone().addScaledVector(f, -4.5).add(V(0, 7.5, 0)), look: p.clone().addScaledVector(f, 1.2) } : { pos: p.clone().addScaledVector(f, -7.5).add(V(0, 4.2, 0)), look: p.clone().addScaledVector(f, 3.5).add(V(0, 0.4, 0)) }; }
      if (s === 'fetch') return [V(277, 0, 71.5), 19, 20, 1.05, 12, Math.PI, 40]; return [V(VS.x - 0.6, 0.9, 57.3), 11, 3.6, 0.36, 8, Math.PI - 0.35, 14]; }
    return null; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  const ROOMB = [[301, 313, Z0, Z1], [X0, 301, Z0, Z1], [313, X1, Z0, 72], [313, X1, 72, Z1]];   // lobby · 19th hole · trophy room · pro shop
  function camFix(cam, dt, fox) { if (fox) { applyWear(fox); if (busy === 'job' && J) { const g = J.g; fox.visible = false;
        if (g === 'range') { fox.visible = true; fox.position.set(291.0, 0, 123.3); fox.rotation.y = Math.PI; }
        else if (false && g === 'croquet' && CBL.visible) { const d = J.dir || V(0, 0, -1); fox.visible = true; fox.position.set(CBL.position.x - d.x * 0.3 - d.z * 1.0, 0, CBL.position.z - d.z * 0.3 + d.x * 1.0); fox.rotation.y = Math.atan2(d.z, -d.x); }
        else if (g === 'lifeguard') { fox.visible = true; fox.position.set(CHAIR.x, 1.63, CHAIR.z); fox.rotation.y = Math.atan2(PCX - CHAIR.x, PCZ - CHAIR.z); }
        else if (false && g === 'caddie' && J.perp && J.sub !== 'fly') { fox.visible = true; fox.position.set(BAG.position.x - J.dir.x * 0.9, 0, BAG.position.z - J.dir.z * 0.9); fox.rotation.y = Math.atan2(J.perp.x, J.perp.z); } } }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    if (v.pos) { camT.pos.copy(v.pos); camT.look.copy(v.look); } else { fitCam(v); const tg = v[0], b = ROOMB.find(r => tg.x >= r[0] && tg.x <= r[1] && tg.z >= r[2] && tg.z <= r[3]); if (b) { camT.pos.x = clamp(camT.pos.x, b[0] + 0.35, b[1] - 0.35); camT.pos.z = clamp(camT.pos.z, b[2] + 0.35, b[3] - 0.35); camT.pos.y = Math.min(camT.pos.y, CEIL - 0.4); } }   // indoor shots stay in their room
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * (J && J.g === 'valet' && J.sub === 'drive' ? 5 : 3.2)); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer on the first of targets() ----------
  const HAND = document.createElement('div'); HAND.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HAND.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.340l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HAND); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { let h = null; if (performance.now() - lastIn > 3000 && busy === 'job' && J && J.pause <= 0 && !ptr.down && !FLIES.length && !['intro', 'pay'].includes(J.sub)) { const q = API.targets()[0]; h = q && typeof q === 'object' ? (q.from || q) : null; }
    if (!h || !(h[2] < 1)) { if (HAND.style.display !== 'none') HAND.style.display = 'none'; return; } const lab = NEXTS[J.sub] || 'TAP HERE';
    const sc = t % 1.1 < 0.18 ? 0.82 : 1; HAND.style.display = 'block'; HAND.style.transform = 'translate(' + Math.round(h[0] - 17) + 'px,' + Math.round(h[1] - 4) + 'px) scale(' + sc + ')'; const l = HAND.lastElementChild; if (l.textContent !== lab) l.textContent = lab; };
  // ================= talk + prompt =================
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r && (P.y || 0) < 2, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r && (P.y || 0) < 2;
  const PROMPTS = { caddie: 'CADDIE · THE 18TH TEE', range: 'DRIVING RANGE', waiter: 'SERVE THE TERRACE · THE PASS', croquet: 'CROQUET ON THE LAWN', trophies: 'POLISH THE TROPHIES', valet: 'VALET PARKING', lifeguard: 'POOL LIFEGUARD' };
  function prompt(P) { if (busy === 'job' || !inStation(P) || P.skate) return null; if (J) { if (J.g === 'waiter' && at(P, SPOT.waiter) && J.sub !== 'walk') return 'END TERRACE SERVICE'; return null; }
    for (const k in PROMPTS) if (at(P, SPOT[k])) return PROMPTS[k] + (doneMap()[k] ? ' \u2713' : '');
    if (ownB() && at(P, SPOT.hook)) return 'MY BLAZER ' + (bOn() ? 'OFF' : 'ON'); if (SK.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, mT)) return 'TALK · SIR PERCY'; return null; }
  // s74: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const TALK_M = ['The croquet lawn is older than the club. The peg is older than me. Nearly.', 'Waiters walk, caddies rake, lifeguards whistle. That\u2019s the whole rulebook, really.', 'Birdie from the minigolf next door was our junior champion. Lovely putter. Terrible loser.', 'Mind the bunker on the 18th. It has eaten better golfers than both of us.', 'The membership card by the sofa. Tick all seven and you\u2019re one of us.'];
  const ORDER = DOING.map(([k]) => k), nextJob = () => ORDER.find(k => !doneMap()[k]) || ORDER[save.stat('ccVisits', 0) % ORDER.length];
  let lastP = null; const goJob = (k, P) => { if (busy || J) return; if (P) Object.assign(P, { x: SPOT[k].x, z: SPOT[k].z, sp: 0 }); startGame(k); };
  const jc = (k, t) => ({ text: t, pick: () => goJob(k, lastP) });
  const mMenu = first => sayTo(mT, [{ ...lp(first ? 'Welcome to the Meru Country Club! Sir Percy Fairway, club captain. Seven jobs, seven yellow rings.' : ['Old bean! Jolly good to see you.', 'Back for more? Splendid.', 'Ah, a keen one! What\u2019ll it be?'][talked % 3]),
    choices: [jc(nextJob(), CHOICE_WORK), jc('waiter', 'SERVE THE TERRACE'), jc('range', 'THE DRIVING RANGE'), jc('valet', 'VALET PARKING'), { text: 'A CLUB STORY, PLEASE', pick: () => sayTo(mT, [lp(TALK_M[talked % TALK_M.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }] }]);
  function talk(P) { lastP = P; if (busy === 'job') return true; if (!inStation(P) || P.skate) return false;
    if (J) { if (J.g === 'waiter' && at(P, SPOT.waiter) && J.sub !== 'walk') { stop(); toast('TERRACE SERVICE ENDED · GOLD KEPT', 2); return true; } if (near(P, mT)) { sayTo(mT, [lp('Chop chop, old bean! Follow the arrow.')]); return true; } return false; }
    for (const k in PROMPTS) if (at(P, SPOT[k])) { startGame(k); return true; }
    if (ownB() && at(P, SPOT.hook)) { const on = !bOn(); putOn(on); pop(); toast(on ? 'BLAZER ON' : 'BLAZER OFF', 1.6); return true; }
    if (SK.atHiring(P)) { pop(); goJob(nextJob(), P); return true; }
    if (near(P, mT)) { pop(); mMenu(!talked++); return true; }
    return false; }
  function quit() { stop(); toast('BACK TO THE CLUB LATER · GOLD KEPT', 2); }
  function useItem(id) { return false; }
  // ================= tick =================
  const BEGIN = { caddie: beginCaddie, range: beginRange, waiter: beginWaiter, croquet: beginCroquet, trophies: beginTrophies, valet: beginValet, lifeguard: beginLifeguard };
  const SK = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'club', color: NAVY, boardTitle: "Percy's best",
    room: { X0: 301, X1: 313, Z0, Z1 }, door: [307, Z0 - 0.2], keeper: percy, keeperRy: KS.idle[2],
    games: DOING.map(([k, n]) => ({ k, name: n.charAt(0) + n.slice(1).toLowerCase(), color: NAVY })), board: { x: 311.0, y: 2.95, z: Z0 + 0.09, ry: 0, w: 1.1 },
    hiring: { x: 304.4, z: 64.2, ry: Math.PI / 2 }, hiringLine: '7 JOBS · PICK ANY', clock: { x: 303.6, y: 2.6, z: Z1 - 0.09, ry: Math.PI },
    sun: [{ x: 307, z: 63.8, w: 2.4, d: 2.8 }],
    lamps: [[305.3, CEIL - 0.6, 65.5], [309.9, CEIL - 0.6, 65.5], [309.9, CEIL - 0.6, 69.9], [305.3, CEIL - 0.6, 74.3], [309.9, CEIL - 0.6, 74.3], [305.3, CEIL - 0.6, 78.7], [309.9, CEIL - 0.6, 78.7]],
    browse: [[301.9, 74.0, -Math.PI / 2], [311.9, 69.9, Math.PI / 2], [309.4, 67.2, Math.PI], [302.2, 78.5, -Math.PI / 2]] });
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, dH = Math.hypot(P.x - OX, P.z - OZ); G.visible = dH < (touch ? 70 : 120) || !!J; toastT -= dt;
    if (J && !inStation(P)) { stop(); toast('YOU LEFT THE CLUB · GOLD KEPT', 2); }
    if (FLIES.length) flyTick(dt);
    if (J) { J.t += dt; if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } }
      if (J) { HI.visible = HI2.visible = ALERT.visible = false; const g = J.g; if (g === 'waiter' && busy === 'walk') wtWalk(dt, P, fox); else if (g === 'caddie') caTick(dt); else if (g === 'range') raTick(dt); else if (g === 'croquet') crTick(dt); else if (g === 'lifeguard') lgTick(dt); else if (g === 'valet') vaTick(dt); }
      if (J) { const s = J.sub, g = J.g;
        if (g === 'caddie') { if (s === 'pick' && J.wrong >= 2) hi(HI2, CLUBM[J.ans[J.li]].sp.getWorldPosition(V()).add(V(0, 0.12, 0))); if (s === 'divot') hi(HI2, DIV.position.clone().add(V(0, 0.15, 0))); }
        if (g === 'range' && s === 'tee') hi(HI2, TEE.clone().add(V(0, 0.15, 0)));
        if (g === 'waiter') { if (s === 'items') { const k = J.O.items.find(q => !J.got.includes(q)); if (k != null) hi(HI, FOODP(k).add(V(0, 0.18, 0))); } if (s === 'lift') hi(HI2, TRAY.position.clone().add(V(0, 0.12, 0))); }
        if (g === 'croquet' && J.target < 4 && J.helped) hi(HI2, HOOPS[J.target].clone().add(V(0, 0.45, 0)));
        if (g === 'trophies' && s === 'place' && J.wrong >= 2) hi(HI2, SLOT(J.T.slot).add(V(0, 0.45, 0)));
        if (g === 'valet') { if (s === 'tapcar') hi(HI2, J.car.g.position.clone().add(V(0, 1.9, 0))); if (s === 'fetch' && J.wrong >= 2) hi(HI2, CARS[0].g.position.clone().add(V(0, 1.9, 0))); }
        drawCard(); } }
    partTick(dt); hintTick(t);
    if (!G.visible) return;
    for (const k in RS) RS[k].visible = !J && !busy && (k !== 'hook' || ownB()); hookU.visible = ownB() && !bOn();
    if (!J) { waterT.offset.x = (t * 0.03) % 1; waterT.offset.y = (t * 0.02) % 1; }
    { const work = !!J && !['walk', 'back'].includes(J.sub), inS = P.x > 301 && P.x < 313 && P.z > Z0 && P.z < Z1 && (P.y || 0) < 2; SK.tick(dt, P, { inShop: inS, busy: !!J, near: dH, talking: work }); if (work) turnTo(percy, percy.userData.face0 ?? 0, dt * 0.5); }   // s74: shop kit runs Percy's idle / wave / look-at
    cf.forEach(p => { if (p && p.H.visible) kit.animFox && kit.animFox(p.f, dt, 0); }); if (kidF && kidF.H.visible) kit.animFox && kit.animFox(kidF.f, dt, J && J.cur && J.cur.type === 'R' && !J.cur.walk ? 4 : 0); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy === 'walk' ? null : busy), toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startGame, useItem, percy, camera, save, CARS, TR, CLUBM, LIES, HOOPS, PEG, TGT, BAYP,
    tap(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = ptr.sx = ptr.lx = x; ptr.y = ptr.sy = ptr.ly = y; press(); }, dragTo(x, y) { ptr.down = true; ptr.lx = ptr.x; ptr.ly = ptr.y; ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    hold(on) { if (on) { ptr.down = true; if (J && J.g === 'range') press(); } else { ptr.down = false; release(); } }, skip() { if (J && J.pause > 0) J.pause = 0.001; }, scr: v => scrW(v),
    shoot(dx, dz, k) { if (!J || J.g !== 'croquet' || J.sub !== 'aim') return false; J.dir = V(dx, 0, dz).normalize(); J.pow = k; J.held = 'aim'; crRelease(); return true; },
    aimHoop(k = 0.5) { if (!J || J.g !== 'croquet') return false; const T = J.target < 4 ? HOOPS[J.target] : PEG, b = CBL.position, onSide = J.target < 4 && Math.abs(b.z - T.z) < 0.25; const tgt = onSide ? V(T.x, 0, T.z + (b.z < T.z ? -0.8 : 0.8)) : J.target < 4 ? V(T.x, 0, T.z + (b.z > T.z ? -0.6 : 0.6)) : T; return API.shoot(tgt.x - b.x, tgt.z - b.z, k); },
    ball: () => CBL.position.clone(),
    targets() { if (!J) return []; const s = J.sub, g = J.g, S = v => scrW(v);
      if (g === 'caddie') return s === 'pick' ? [S(CLUBM[J.ans[J.li]].sp.getWorldPosition(V()))] : s === 'divot' ? [S(DIV.position)] : s === 'rake' ? FPS.filter(F => F.k > 0).map(F => S(F.m.position)) : [];
      if (g === 'waiter') return s === 'items' ? J.O.items.filter(k => !J.got.includes(k)).map(k => S(FOODP(k).add(V(0, 0.06, 0)))) : s === 'lift' ? [S(TRAY.position)] : [];
      if (g === 'trophies') return s === 'rub' ? J.T.spots.filter(q => q.k > 0).map(q => S(q.m.getWorldPosition(V()))) : s === 'buff' ? [S(J.T.g.position.clone().add(V(0, 0.55, 0)))] : s === 'place' ? [S(SLOT(J.T.slot).add(V(0, 0.15, 0)))] : [];
      if (g === 'valet') return s === 'tapcar' ? [S(J.car.g.position.clone().add(V(0, 0.9, 0)))] : s === 'fetch' ? [S(CARS[0].g.position.clone().add(V(0, 0.9, 0)))] : [];
      if (g === 'lifeguard') { const c = J.cur; return c && !c.done ? [c.type === 'T' ? S(headOf(c.s)) : S(kidF.H.position.clone().add(V(0, 0.5, 0)))] : []; }
      return []; },
    dispose() { card.remove(); HAND.remove(); SK.dispose(); } };
  G.add(subMesh(R0)); { const gm = new THREE.Mesh(RG.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.28, depthWrite: false })); gm.renderOrder = 2; G.add(gm); }
  window.__club = API; return API;
}
