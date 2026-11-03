// MERU · TANK RANGE [meruTankRange] — the HANGAR (start) + the two chalk BLACKBOARDS, lifted out of tank-range.js (same split as the diner).
// buildHangar(ctx): ctx { THREE, M, toon, glowTex, scene, solid?(x,z,r,h), origin {x,z}, rotY, mounted }. mounted = inside a city shell:
// no floor / walls / roof / roller door / solids; crest + name plate move onto the shell's back wall, lights drop under a 9 m roof.
// Returns { root, HZ0, HZ1, BOARDS, BD, boardCv, boardCvP, boardTex, coinP, boardURL, boardURLP, world(x,z) }.
export const HZ0 = -118, HZ1 = -100;
export function buildHangar(ctx) {
  const { THREE, M, toon, glowTex, scene, origin = { x: 0, z: 0 }, rotY = 0, mounted = false } = ctx, solid = mounted ? () => {} : (ctx.solid || (() => {}));
  const root = new THREE.Group(); root.position.set(origin.x, 0, origin.z); root.rotation.y = rotY; scene.add(root);
  const ink = toon('#201e1d'), red = toon('#ec3013'), white = toon('#f3f2f2'), steel = toon('#5b5f66'), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const SPR = (mat, p, s) => { const sp = new THREE.Sprite(mat); if (p) sp.position.copy(p); if (s) sp.scale.copy(s); return sp; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  let boardURL = '', boardURLP = '';
  // ---------- HANGAR (start) ----------
  { const wall = toon('#e9e6e1');
    if (!mounted) {
    M(new THREE.BoxGeometry(32, 0.08, 18), toon('#a8a39a'), 0, 0.04, (HZ0 + HZ1) / 2, root, 0).castShadow = false;
    M(new THREE.BoxGeometry(32.4, 12, 0.6), wall, 0, 6, HZ0 + 0.3, root, 0.04); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.6, 12, 18), wall, sx * 16, 6, (HZ0 + HZ1) / 2, root, 0.04);
    M(new THREE.BoxGeometry(33, 0.6, 19), toon('#8a8f96'), 0, 12.3, (HZ0 + HZ1) / 2, root, 0.04); for (let k = 0; k < 5; k++) M(new THREE.BoxGeometry(33.2, 0.5, 0.4), steel, 0, 12.7, HZ0 + 1.5 + k * 3.8, root, 0);
    M(new THREE.BoxGeometry(32.4, 3, 0.6), wall, 0, 10.5, HZ1 - 0.3, root, 0.04); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(2, 9, 0.9), red, sx * 15, 4.5, HZ1 - 0.3, root, 0.03);
    const drum = M(new THREE.CylinderGeometry(0.8, 0.8, 28, 16), steel, 0, 8.6, HZ1 - 0.2, root, 0.03); drum.rotation.z = Math.PI / 2; for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(28, 0.18, 0.12), toon('#9aa0a8'), 0, 7.6 - k * 0.22, HZ1 + 0.4, root, 0);
    }
    const hz = CT(512, 64, (g, w, h) => { for (let i = -2; i < 20; i++) { g.fillStyle = i % 2 ? '#201e1d' : '#ffd23a'; g.beginPath(); g.moveTo(i * 32, h); g.lineTo(i * 32 + 32, h); g.lineTo(i * 32 + 64, 0); g.lineTo(i * 32 + 32, 0); g.fill(); } }); hz.wrapS = THREE.RepeatWrapping; hz.repeat.set(4, 1);
    const hs = new THREE.Mesh(new THREE.PlaneGeometry(28, 0.8), new THREE.MeshBasicMaterial({ map: hz })); hs.rotation.x = -Math.PI / 2; hs.position.set(0, 0.09, HZ1 - 0.6); root.add(hs);
    const bay = new THREE.Mesh(new THREE.RingGeometry(4.4, 4.7, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xffd23a })); bay.rotation.x = -Math.PI / 2; bay.scale.set(1, 1.5, 1); bay.position.set(0, 0.09, -108); root.add(bay);
    const crest = CT(512, 512, (g, w) => { g.fillStyle = '#ec3013'; g.beginPath(); g.arc(256, 256, 240, 0, 7); g.fill(); g.lineWidth = 22; g.strokeStyle = '#f3f2f2'; g.beginPath(); g.arc(256, 256, 200, 0, 7); g.stroke(); g.fillStyle = '#f3f2f2'; g.font = '900 300px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 256, 270); });
    const cr = new THREE.Mesh(new THREE.CircleGeometry(3.2, 40), new THREE.MeshBasicMaterial({ map: crest })); cr.position.set(0, mounted ? 4.0 : 6.4, mounted ? HZ0 - 0.45 : HZ0 + 0.62); root.add(cr);
    const nm = CT(1024, 128, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3f2f2'; g.font = '900 78px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU TRAINING · TANK RANGE', 30, 68); g.fillStyle = '#ec3013'; g.fillRect(0, h - 12, w, 12); });
    const np = new THREE.Mesh(new THREE.PlaneGeometry(14, 1.75), new THREE.MeshBasicMaterial({ map: nm })); np.position.set(0, mounted ? 8.0 : 10.5, mounted ? HZ0 - 0.44 : HZ1 + 0.02); if (mounted) np.scale.setScalar(0.8); root.add(np);
    for (const sx of [-1, 1]) { for (let k = 0; k < 3; k++) { const b = M(new THREE.CylinderGeometry(0.45, 0.45, 1.1, 14), k % 2 ? red : toon('#4d5a2a'), sx * 13.5, 0.55, -114 + k * 1.1, root, 0.02); } M(new THREE.BoxGeometry(1.2, 4, 3.6), steel, sx * 15, 2, -106, root, 0.02); for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(1.25, 0.08, 3.5), ink, sx * 15, 0.8 + k * 1.2, -106, root, 0); }
    for (let k = 0; k < 3; k++) { const lp = M(new THREE.BoxGeometry(3, 0.25, 0.6), ink, 0, mounted ? 8.4 : 11.6, -115 + k * 5.5, root, 0); root.add(SPR(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff1c4, transparent: true, depthWrite: false, opacity: 0.7 }), V3(0, mounted ? 8.0 : 11.2, -115 + k * 5.5), V3(5, 5, 1))); }
    for (let z = HZ0 + 1; z <= HZ1 - 1; z += 2) for (const sx of [-1, 1]) solid(sx * 15.4, z, 1.1, 12); for (let x = -15; x <= 15; x += 2) solid(x, HZ0 + 0.8, 1.1, 12); for (const sx of [-1, 1]) solid(sx * 15, HZ1 - 0.3, 1.4, 12); }

  // ---------- BLACKBOARD + SGT. TREAD ----------
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; drawBoard(boardCv.getContext('2d'));
  const boardTex = new THREE.CanvasTexture(boardCv); boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = 8;
  const BOARDS = [{ x: -10.5, z: -88 }, { x: 10.5, z: -88 }].map(b => ({ ...b, yaw: Math.PI + Math.atan2(-b.x, 16) * 0.8 })), BD = BOARDS[0];
  for (const B of BOARDS) { const g = new THREE.Group(); g.position.set(B.x, 0, B.z); g.rotation.y = B.yaw; root.add(g); B.g = g; const wood = toon('#7a4f2a');
    for (const side of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.6), new THREE.MeshBasicMaterial({ map: boardTex })); pl.position.set(0, 3.5, 0.08 * side); if (side < 0) pl.rotation.y = Math.PI; g.add(pl); }
    M(new THREE.BoxGeometry(6.8, 4.0, 0.14), wood, 0, 3.5, 0, g, 0.03); M(new THREE.BoxGeometry(6.6, 0.12, 0.4), wood, 0, 1.6, 0.2, g, 0.01);
    for (const sx of [-1, 1]) { const lg = M(new THREE.BoxGeometry(0.18, 5.6, 0.18), wood, sx * 3.0, 2.6, -0.25, g, 0.01); lg.rotation.x = 0.12; }
    for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(0.22, 0.06, 0.06), white, -1 + k * 0.5, 1.7, 0.25, g, 0); M(new THREE.BoxGeometry(6.6, 0.12, 0.4), wood, 0, 1.6, -0.2, g, 0.01); solid(B.x, B.z, 1.6, 6); }
  const coinP = { x: 0.46, y: 0.925 };
  function drawBoard(g, P = false) {
    const W = P ? 900 : 1600, H = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W, H); g.strokeStyle = 'rgba(40,24,10,0.35)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); const y = Math.random() * H; g.moveTo(0, y); g.bezierCurveTo(W * 0.3, y + J(8), W * 0.6, y + J(8), W, y + J(6)); g.stroke(); }
    const x0 = 34, y0 = 34, w = W - 68, h = H - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y - 1.2); g.globalAlpha = 1; };
    const HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive', hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const ln = (pts, col = CH, wd = 5, close) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); g.stroke(); g.globalAlpha = 1; };
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; };
    const arrow = (x1, y1, x2, y2, col = YL) => { ln([[x1, y1], [(x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10], [x2, y2]], col, 4); const a = Math.atan2(y2 - y1, x2 - x1); ln([[x2 - Math.cos(a - 0.5) * 22, y2 - Math.sin(a - 0.5) * 22], [x2, y2], [x2 - Math.cos(a + 0.5) * 22, y2 - Math.sin(a + 0.5) * 22]], col, 4); };
    txt('TANK RANGE', 86, 160, P ? 100 : 112, CH, 900); txt('MERU TRAINING GROUNDS  ·  SGT. TREAD', 90, 214, 32, YL, 800); ln([[88, 238], [760, 234]], CH, 4);
    g.save(); if (P) { g.translate(-590, 250); g.scale(0.92, 0.92); } else g.translate(0, 90);
    // the tank, side view, facing right
    const TX = 0, TY = 0; ln([[930, 340], [1450, 340], [1490, 375], [1450, 420], [930, 420], [890, 375]], CH, 6, true);
    for (let k = 0; k < 6; k++) { circ(965 + k * 92, 380, 30, CH, 5); circ(965 + k * 92, 380, 8, CH, 4); }
    ln([[945, 338], [985, 270], [1425, 270], [1462, 338]], CH, 6); ln([[1060, 270], [1090, 208], [1290, 208], [1325, 270]], CH, 6);
    ln([[1300, 228], [1530, 228], [1530, 250], [1300, 250]], CH, 6); ln([[1515, 220], [1550, 220], [1550, 258], [1515, 258]], CH, 5, true);
    ln([[1110, 206], [1110, 150], [1240, 150], [1240, 206]], RD, 6); for (let k = 0; k < 4; k++) circ(1135 + k * 30, 178, 10, RD, 4);
    ln([[1085, 208], [1070, 150], [1050, 100]], CH, 3); circ(1048, 96, 6, CH, 3);
    circ(1275, 186, 22, CH, 5); ln([[1258, 172], [1262, 146], [1274, 166]], CH, 4); ln([[1278, 166], [1290, 146], [1294, 172]], CH, 4); g.fillStyle = CH; g.fillRect(1268, 182, 5, 5); g.fillRect(1282, 182, 5, 5);
    for (let k = 0; k < 3; k++) circ(860 - k * 30, 300 - k * 22, 14 + k * 6, '#cfd8d4', 3);
    { g.font = `700 34px ${HF}`; const rw = g.measureText('1  ROCKETS').width; hw('1  Rockets', 1175 - rw / 2, 108, 34); } 
    hw('2  Cannon', 1330, 166, 34); arrow(1420, 172, 1470, 222);
    hw('3  Turbo', 700, 490, 40); arrow(790, 452, 842, 330);
    hw('Tracks: turn on the spot!', 975, 474, 32, CH);
    // controls
    g.restore();
    // controls, drawn as the real on-screen pad: stick + round 1 / 2 / 3 buttons
    g.save(); if (P) { g.translate(-10, 470); g.scale(1.12, 1.12); }
    const BL = '#9fd8f5', rows = [['STICK', 'WASD', 'Drive. Stopped + sideways = spin', CH], ['1', 'J', 'Rocket  ·  grab AMMO CRATES', RD], ['2', 'K', 'Main cannon  ·  big boom', YL], ['3', 'SPACE', 'Turbo  ·  grab TURBO cans', BL], ['EYE', 'HOLD FOR 360 VIEW AND TAP FOR POV', 'Look around', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 330 + i * 104, cx = 150, cy = y - 14;
      if (k === 'STICK') { circ(cx, cy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx + 6, cy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; circ(cx + 6, cy - 9, 14, CH, 4); for (const [ax, ay, rot] of [[0, -44, 0], [0, 44, Math.PI], [-44, 0, -Math.PI / 2], [44, 0, Math.PI / 2]]) { const s = Math.sin(rot), c = Math.cos(rot), P = (px, py) => [cx + ax + px * c - py * s, cy + ay + px * s + py * c]; ln([P(-7, 5), P(0, -3), P(7, 5)], CH, 3); } }
      else if (k === 'EYE') { circ(cx, cy, 30, CH, 4); ln([[cx - 19, cy], [cx - 9, cy - 8], [cx, cy - 10], [cx + 9, cy - 8], [cx + 19, cy], [cx + 9, cy + 8], [cx, cy + 10], [cx - 9, cy + 8]], CH, 3, true); g.globalAlpha = 0.9; g.fillStyle = CH; g.beginPath(); g.arc(cx, cy, 4.5, 0, 7); g.fill(); g.globalAlpha = 1; }
      else { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; circ(cx, cy, 22, CH, 2); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + 12); g.textAlign = 'left'; }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); txt(d, 230, y + 4, 32, CH, 700); });
    g.restore();
    // course strip
    { const s = 'Wreck robots  ·  beat Sgt. Tread  ·  grab tokens'; if (P) { const s1 = 'WRECK ROBOTS  ·  BEAT SGT. TREAD', avail = 900 - 70 * 2; let s = 46; g.font = `700 ${s}px ${HF}`; let w1 = g.measureText(s1).width; if (w1 > avail) { s = Math.floor(s * avail / w1); g.font = `700 ${s}px ${HF}`; w1 = g.measureText(s1).width; } hw(s1, (900 - w1) / 2, 1384, s); g.font = `700 58px ${HF}`; const w2 = g.measureText('GRAB TOKENS').width, cw = 76, gap = 40, tot = w2 + gap + cw, x2 = (900 - tot) / 2; const mid = (1384 + 8 + 1536) / 2; hw('Grab tokens', x2, mid + 20, 58); coinP.x = (x2 + w2 + gap + cw / 2) / 900; coinP.y = mid / 1600; } else { const cap = 960, right = 1440, by = 778; let sz = 50; g.font = `700 ${sz}px ${HF}`; let wd = g.measureText(s.toUpperCase()).width; if (wd > cap) { sz = Math.floor(sz * cap / wd); g.font = `700 ${sz}px ${HF}`; wd = g.measureText(s.toUpperCase()).width; } hw(s, right - wd, by, sz); } }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H - 64, W, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H - 64, W, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#f2f1e8'][k]; g.fillRect(260 + k * 120, H - 48, 70, 16); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  }
  const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600; drawBoard(boardCvP.getContext('2d'), true);
  boardURL = boardCv.toDataURL('image/jpeg', 0.92), boardURLP = boardCvP.toDataURL('image/jpeg', 0.92);
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); }
    const redo = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); boardTex.needsUpdate = true; boardURL = boardCv.toDataURL('image/jpeg', 0.92); boardURLP = boardCvP.toDataURL('image/jpeg', 0.92); };
    setTimeout(() => document.fonts.load('700 50px "Caveat"').then(fs => { if (fs && fs.length) redo(); }).catch(() => {}), 300); setTimeout(() => document.fonts.load('700 50px "Caveat"').then(fs => { if (fs && fs.length) redo(); }).catch(() => {}), 2500); } catch (e) {}
  root.updateMatrixWorld(true); const v = new THREE.Vector3();
  return { root, HZ0, HZ1, BOARDS, BD, boardCv, boardCvP, boardTex, coinP, get boardURL() { return boardURL; }, get boardURLP() { return boardURLP; }, world: (x, z) => { v.set(x, 0, z); root.localToWorld(v); return { x: v.x, z: v.z }; } };
}
