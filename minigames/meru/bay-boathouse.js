// MERU · SPEEDBOAT BAY [meruSpeedboatBay] — the BOATHOUSE (slip, docks, striped roof, name plate) + the chalk BLACKBOARD, lifted out of
// speedboat-bay.js (same split as the diner / the Tank Range hangar). The jetty and the fisherman stay in the game.
// buildBoathouse(ctx): ctx { THREE, M, toon, glowTex, grad, scene, solid?(x,z,r,h), origin {x,z}, rotY, mounted, boardAt {x,y,z,yaw} (local) }.
// mounted = inside a city shell: docks from z DZ0 (shorter), low (top 0.4 m) beside a small wet slip; no pilings, walls, roof, gable, wall rings
// or solids; the name plate hangs over the slip end. Returns { root, BH, DZ0, BD, board, boardCv, boardCvP, boardTex, coinP, boardURL, boardURLP, world(x,z), waterT }.
export const BH = { z0: -66, z1: -42 };
export function buildBoathouse(ctx) {
  const { THREE, M, toon, glowTex, grad, scene, origin = { x: 0, z: 0 }, rotY = 0, mounted = false, boardAt = { x: -16, y: 1.35, z: -22.5, yaw: Math.PI / 2 + 0.35 } } = ctx, solid = mounted ? () => {} : (ctx.solid || (() => {}));
  const DZ0 = mounted ? -60 : BH.z0, out = {};
  const root = new THREE.Group(); root.position.set(origin.x, 0, origin.z); root.rotation.y = rotY; scene.add(root);
  const red = toon('#ec3013'), white = toon('#f3f2f2'), wood = toon('#8a5a32'), V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const SPR = (mat, p, s) => { const sp = new THREE.Sprite(mat); if (p) sp.position.copy(p); if (s) sp.scale.copy(s); return sp; };
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const glow = (col, op = 0.8) => new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, opacity: op, blending: THREE.AdditiveBlending });
  let boardURL = '', boardURLP = '';
  // ---------- BOATHOUSE (start: the boat sits in the slip) ----------
  { const plank = toon('#b07a4a'), wallR = toon('#f3f2f2');
    const stripe = CT(256, 256, (g, w, h) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f3f2f2' : '#ec3013'; g.fillRect(i * 32, 0, 32, h); } }); stripe.wrapS = THREE.RepeatWrapping; stripe.repeat.set(3, 1);
    const roofM = new THREE.MeshToonMaterial({ map: stripe, gradientMap: grad });
    for (const sx of [-1, 1]) { M(new THREE.BoxGeometry(2.4, 0.3, BH.z1 - DZ0), plank, sx * 5.8, mounted ? 0.25 : 1.1, (DZ0 + BH.z1) / 2, root, 0.02); if (!mounted) for (let z = BH.z0 + 1; z < BH.z1; z += 4) M(new THREE.CylinderGeometry(0.18, 0.18, 2.4, 6), wood, sx * 6.8, 0, z, root, 0);
      if (mounted) continue;
      M(new THREE.BoxGeometry(0.4, 5.6, BH.z1 - BH.z0), wallR, sx * 7.1, 3.9, (BH.z0 + BH.z1) / 2, root, 0.03);
      const rf = M(new THREE.BoxGeometry(8.6, 0.3, BH.z1 - BH.z0 + 2), roofM, sx * 3.8, 7.9, (BH.z0 + BH.z1) / 2, root, 0.03); rf.rotation.z = -sx * 0.5;
      for (let z = BH.z0 + 1; z <= BH.z1 - 1; z += 2) solid(sx * 5.6, z, 1.1, 2); }
    if (mounted) { const wt = CT(256, 256, (g, w, h) => { g.fillStyle = '#2f7fa8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#7cc8e0'; g.lineWidth = 3; for (let i = 0; i < 14; i++) { const x = (i * 53) % w, y = (i * 97) % h; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 5, x + 22, y); g.stroke(); } }); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(1, 2);
      const wm = new THREE.Mesh(new THREE.PlaneGeometry(9.2, BH.z1 - DZ0).rotateX(-Math.PI / 2), new THREE.MeshToonMaterial({ map: wt, gradientMap: grad })); wm.position.set(0, 0.06, (DZ0 + BH.z1) / 2); root.add(wm); out.waterT = wt; }
    if (!mounted) { M(new THREE.BoxGeometry(14.6, 7, 0.4), wallR, 0, 3.5, BH.z0, root, 0.03); for (let x = -6; x <= 6; x += 2) solid(x, BH.z0 + 0.5, 1.1, 5);
    const gab = new THREE.Shape([new THREE.Vector2(-7.3, 0), new THREE.Vector2(7.3, 0), new THREE.Vector2(0, 3.6)]); const gm = new THREE.Mesh(new THREE.ShapeGeometry(gab), new THREE.MeshToonMaterial({ color: '#f3f2f2', gradientMap: grad, side: THREE.DoubleSide })); gm.position.set(0, 6.7, BH.z1 + 0.05); root.add(gm); }
    const nm = CT(1024, 128, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = '#f3f2f2'; g.font = '900 80px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU · SPEEDBOAT BAY', 34, 68); g.fillStyle = '#ec3013'; g.fillRect(0, h - 12, w, 12); });
    const np = new THREE.Mesh(new THREE.PlaneGeometry(11, 1.4), new THREE.MeshBasicMaterial({ map: nm })); np.position.set(0, mounted ? 5.4 : 7.6, mounted ? BH.z1 - 0.3 : BH.z1 + 0.12); if (mounted) np.rotation.y = Math.PI; root.add(np);
    for (let k = 0; k < 3; k++) root.add(SPR(glow(0xfff1c4, 0.6), V3(0, mounted ? 6.0 : 6.6, (mounted ? DZ0 : BH.z0) + 4 + k * 6), V3(4, 4, 1)));
    if (!mounted) for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) M(new THREE.TorusGeometry(0.35, 0.12, 6, 14), k % 2 ? white : red, sx * 6.9, 2.4 + k * 0.9, BH.z1 - 3 - k * 5, root, 0.01).rotation.y = Math.PI / 2; }

  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; drawBoard(boardCv.getContext('2d'));
  const boardTex = new THREE.CanvasTexture(boardCv); boardTex.colorSpace = THREE.SRGBColorSpace; boardTex.anisotropy = 8;
  const BD = { x: boardAt.x, z: boardAt.z }, bg = new THREE.Group(); bg.position.set(BD.x, boardAt.y, BD.z); bg.rotation.y = boardAt.yaw; out.board = bg; root.add(bg);
  for (const side of [1, -1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.6), new THREE.MeshBasicMaterial({ map: boardTex })); pl.position.set(0, 3.3, 0.08 * side); if (side < 0) pl.rotation.y = Math.PI; bg.add(pl); }
  M(new THREE.BoxGeometry(6.8, 4.0, 0.14), toon('#7a4f2a'), 0, 3.3, 0, bg, 0.03); for (const sx of [-1, 1]) M(new THREE.BoxGeometry(0.18, 5.4, 0.18), toon('#7a4f2a'), sx * 3.0, 2.5, -0.25, bg, 0.01);
  const coinP = { x: 0.46, y: 0.925 };
  function drawBoard(g, P = false) {
    const W0 = P ? 900 : 1600, H0 = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#7a4f2a'; g.fillRect(0, 0, W0, H0); g.strokeStyle = 'rgba(40,24,10,0.35)'; g.lineWidth = 2; for (let i = 0; i < 40; i++) { g.beginPath(); const y = Math.random() * H0; g.moveTo(0, y); g.bezierCurveTo(W0 * 0.3, y + J(8), W0 * 0.6, y + J(8), W0, y + J(6)); g.stroke(); }
    const x0 = 34, y0 = 34, w = W0 - 68, h = H0 - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 60 + Math.random() * 200, 20 + Math.random() * 60, Math.random() * 3, 0, 7); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BL = '#9fd8f5';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.fillStyle = col; g.globalAlpha = 0.92; g.fillText(s, x, y); g.globalAlpha = 0.28; g.fillText(s, x + 1.6, y - 1.2); g.globalAlpha = 1; };
    const HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive', hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const ln = (pts, col = CH, wd = 5, close) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.lineJoin = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); if (close) g.closePath(); g.stroke(); g.globalAlpha = 1; };
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; };
    const arrow = (x1, y1, x2, y2, col = YL) => { ln([[x1, y1], [(x1 + x2) / 2 + 12, (y1 + y2) / 2 - 10], [x2, y2]], col, 4); const a = Math.atan2(y2 - y1, x2 - x1); ln([[x2 - Math.cos(a - 0.5) * 22, y2 - Math.sin(a - 0.5) * 22], [x2, y2], [x2 - Math.cos(a + 0.5) * 22, y2 - Math.sin(a + 0.5) * 22]], col, 4); };
    { let ts = P ? 92 : 112; g.font = `900 ${ts}px Archivo, sans-serif`; const tw = g.measureText('SPEEDBOAT BAY').width, cap = W0 - 86 - 70; if (tw > cap) ts = Math.floor(ts * cap / tw); if (P) { ts = Math.floor(ts * 0.9); g.font = `900 ${ts}px Archivo, sans-serif`; txt('SPEEDBOAT BAY', (W0 - g.measureText('SPEEDBOAT BAY').width) / 2, 160, ts, CH, 900); } else txt('SPEEDBOAT BAY', 86, 160, ts, CH, 900); } if (P) { g.font = '800 32px Archivo, sans-serif'; const sw = g.measureText('MERU LAKE  ·  THE FISHERMAN').width; txt('MERU LAKE  ·  THE FISHERMAN', (W0 - sw) / 2, 214, 32, YL, 800); ln([[(W0 - 672) / 2, 238], [(W0 + 672) / 2, 234]], CH, 4); } else { txt('MERU LAKE  ·  THE FISHERMAN', 90, 214, 32, YL, 800); ln([[88, 238], [760, 234]], CH, 4); }
    g.save(); if (P) { g.translate(-590, 250); g.scale(0.92, 0.92); } else g.translate(0, 90);
    // the boat, side view, bow to the right, on chalk waves
    ln([[900, 330], [1420, 330], [1540, 300], [1470, 400], [960, 400]], CH, 6, true); ln([[940, 360], [1480, 360]], RD, 5);
    ln([[1120, 330], [1150, 250], [1260, 250], [1300, 330]], BL, 5); ln([[905, 330], [905, 250], [960, 250], [960, 330]], CH, 5); ln([[930, 400], [930, 450]], CH, 5);
    circ(1195, 225, 22, CH, 5); ln([[1178, 211], [1182, 185], [1194, 205]], CH, 4); ln([[1198, 205], [1210, 185], [1214, 211]], CH, 4);
    for (let k = 0; k < 6; k++) ln([[860 + k * 110, 440], [890 + k * 110, 428], [920 + k * 110, 440], [950 + k * 110, 452]], BL, 3);
    hw('1  Torpedo', 1300, 238, 34); arrow(1390, 246, 1460, 300);
    hw('2  Power turn', 880, 150, 34, RD); arrow(1000, 162, 1040, 318, RD); hw('3  Nitro', 700, 490, 40, BL); arrow(790, 455, 880, 380);
    hw('Rides the waves!', 1020, 512, 32, CH);
    g.restore();
    g.save(); if (P) { g.translate(-10, 470); g.scale(1.12, 1.12); }
    const rows = [['STICK', 'WASD', 'Steer + throttle', CH], ['1', 'J', 'Torpedo  ·  homes a little', RD], ['2', 'K', 'Power turn  ·  spin 180', YL], ['3', 'SPACE', 'Nitro  ·  uses a canister', BL], ['EYE', 'HOLD FOR 360 VIEW AND TAP FOR POV', 'Look around', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 330 + i * 104, cx = 150, cy = y - 14;
      if (k === 'STICK') { circ(cx, cy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx + 6, cy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; circ(cx + 6, cy - 9, 14, CH, 4); for (const [ax, ay, rot] of [[0, -44, 0], [0, 44, Math.PI], [-44, 0, -Math.PI / 2], [44, 0, Math.PI / 2]]) { const s = Math.sin(rot), c = Math.cos(rot), Q = (px, py) => [cx + ax + px * c - py * s, cy + ay + px * s + py * c]; ln([Q(-7, 5), Q(0, -3), Q(7, 5)], CH, 3); } }
      else if (k === 'EYE') { circ(cx, cy, 30, CH, 4); ln([[cx - 19, cy], [cx - 9, cy - 8], [cx, cy - 10], [cx + 9, cy - 8], [cx + 19, cy], [cx + 9, cy + 8], [cx, cy + 10], [cx - 9, cy + 8]], CH, 3, true); g.globalAlpha = 0.9; g.fillStyle = CH; g.beginPath(); g.arc(cx, cy, 4.5, 0, 7); g.fill(); g.globalAlpha = 1; }
      else { g.globalAlpha = 0.9; g.strokeStyle = col; g.lineWidth = 9; g.beginPath(); g.arc(cx, cy, 30, 0, 7); g.stroke(); g.globalAlpha = 1; circ(cx, cy, 22, CH, 2); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillStyle = CH; g.fillText(k, cx, cy + 12); g.textAlign = 'left'; }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); txt(d, 230, y + 4, 32, CH, 700); });
    g.restore();
    { const s = 'Slalom · ring · ramps · robots · race top 2  ·  grab tokens'; if (P) { const s1 = 'SLALOM · RING · RAMPS · RACE TOP 2', avail = 900 - 70 * 2; let sz = 46; g.font = `700 ${sz}px ${HF}`; let w1 = g.measureText(s1).width; if (w1 > avail) { sz = Math.floor(sz * avail / w1); g.font = `700 ${sz}px ${HF}`; w1 = g.measureText(s1).width; } hw(s1, (900 - w1) / 2, 1384, sz); g.font = `700 58px ${HF}`; const w2 = g.measureText('GRAB TOKENS').width, cw = 76, gap = 40, tot = w2 + gap + cw, x2 = (900 - tot) / 2; const mid = (1384 + 8 + 1536) / 2; hw('Grab tokens', x2, mid + 20, 58); coinP.x = (x2 + w2 + gap + cw / 2) / 900; coinP.y = mid / 1600; } else { const cap = 960, right = 1440, by = 778; let sz = 50; g.font = `700 ${sz}px ${HF}`; let wd = g.measureText(s.toUpperCase()).width; if (wd > cap) { sz = Math.floor(sz * cap / wd); g.font = `700 ${sz}px ${HF}`; wd = g.measureText(s.toUpperCase()).width; } hw(s, right - wd, by, sz); } }
    g.fillStyle = '#5e3c1f'; g.fillRect(0, H0 - 64, W0, 64); g.fillStyle = '#7a4f2a'; g.fillRect(0, H0 - 64, W0, 10); for (let k = 0; k < 4; k++) { g.fillStyle = ['#f2f1e8', '#f5e08a', '#ff9a8a', '#9fd8f5'][k]; g.fillRect(260 + k * 120, H0 - 48, 70, 16); }
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); }
  }
  const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600; drawBoard(boardCvP.getContext('2d'), true);
  boardURL = boardCv.toDataURL('image/jpeg', 0.92), boardURLP = boardCvP.toDataURL('image/jpeg', 0.92);
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); }
    const redo = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); boardTex.needsUpdate = true; boardURL = boardCv.toDataURL('image/jpeg', 0.92); boardURLP = boardCvP.toDataURL('image/jpeg', 0.92); };
    for (const ms of [300, 2500]) setTimeout(() => document.fonts.load('700 50px "Caveat"').then(fs => { if (fs && fs.length) redo(); }).catch(() => {}), ms); } catch (e) {}
  root.updateMatrixWorld(true); const v = new THREE.Vector3();
  return { root, BH, DZ0, BD, board: out.board, waterT: out.waterT, boardCv, boardCvP, boardTex, coinP, get boardURL() { return boardURL; }, get boardURLP() { return boardURLP; }, world: (x, z) => { v.set(x, 0, z); root.localToWorld(v); return { x: v.x, z: v.z }; } };
}
