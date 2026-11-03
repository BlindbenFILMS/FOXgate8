// MERU 2.0 — s54 TOWN 2 INTERIOR 12: BIRDIE'S MINIGOLF [meruMinigolf] (hut f 332..344 × 62..72, door N (338, 62), side door E (344, 67); course behind it x 330..350 × z 76..128).
// BIRDIE (Ben's pick): young show-off pro in a yellow visor, bets you she can beat you.
// ONE ROUND, ALL STEPS (Ben picked every extra): 1 PICK your putter (rack) + ball colour (bins) at the counter · 2 TRICK SHOTS on the practice green
// (3 targets, bank off the rails) + the indoor hole through the mini castle · 3 THE COURSE: 6 real holes outside vs Birdie (drag back, let go),
// the windmill JAMS first (tap each gear in when its ring goes green) · hole-in-one = ring the bell + a photo on the wall · 4 BALL WASH + SCORECARD.
// GENTLE: no fail. Prizes in turn: GOLF CAP + SWEATER VEST (worn) → YOUR OWN PUTTER (melee look) → LUCKY GOLF BALL (+25 % gold here) → GLOW BALLS
// (the green bin = the NIGHT GLOW ROUND: lit ball + glowing rails) → bonus gold. First ace = HOLE-IN-ONE TROPHY on the shelf.
// s71 INTERIOR POLISH 12: shopKit (Birdie = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board ROUND; badge), NOW HIRING by the side door,
// ONE-box menu with choices, 1-box lines, hint hand, touch radius 44, portrait lens, green camera inside the room.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildMinigolf({ THREE, scene, kit, cols, save, touch, sayTo, camera, inside, isNight, hour = () => 12, isMuted = () => false }) {
  const X0 = 332.4, X1 = 343.6, Z0 = 62.4, Z1 = 71.6, CX = 338, CZ = 67;
  const G = new THREE.Group(); G.name = 'minigolfHut'; scene.add(G);
  const CG = new THREE.Group(); CG.name = 'minigolfCourse'; scene.add(CG);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), R1 = mk(), { box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c, fn }; return t; };
  const redraw = (t, fn) => { const c = t.userData.c; fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; };
  const rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] }), ringC = (x, z, r) => cols.push({ c: [x, z, r] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', BLUE = '#2e86b8', GREEN = '#3f9a5e', DGREEN = '#2f7a48', PINK = '#f472b6', STEEL = '#c9ced3', GOLD = '#e6b45a', WOOD = '#8a6440', DARK = '#3d3b3a', LIME = '#b6ff3a';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0, par = G, rx = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); par.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const Bx = (w, h, d) => new THREE.BoxGeometry(w, h, d), Cy = (a, b, h, s = 14) => new THREE.CylinderGeometry(a, b, h, s), Sp = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // ---------- floor (turf with mow stripes) + walls (green wainscot, yellow rail, white plaster; gaps for both doors) ----------
  { const t = CT(256, 256, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#4a9a5c' : '#55a866'; g.fillRect(0, i * 32, W, 32); } for (let i = 0; i < 900; i++) { g.fillStyle = 'rgba(20,60,30,0.18)'; g.fillRect((i * 73) % W, (i * 151) % H, 2, 2); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 3, (Z1 - Z0) / 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  const wall = (len, x, z, ry) => { box(len, 0.3, 0.06, INK, x, 0.15, z, ry); box(len, 1.1, 0.05, GREEN, x, 0.62, z, ry); box(len, 0.1, 0.08, YEL, x, 1.2, z, ry); box(len, 3.4, 0.05, WHITE, x, 2.95, z, ry); };
  wall(X1 - X0, CX, Z1 - 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[X0, 336.6], [339.4, X1]]) wall(b - a, (a + b) / 2, Z0 + 0.03, 0);
  for (const [a, b] of [[Z0, 65.6], [68.4, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  box(2.4, 0.02, 1.2, RED, 338, 0.08, 63.1); box(1.2, 0.02, 2.4, RED, X1 - 0.7, 0.08, 67);
  // ================= COUNTER: ball bins by colour + till + scorecard clipboard; PUTTER RACK on the west wall =================
  box(0.7, 1.0, 3.6, GREEN, 333.6, 0.5, 64.8); box(0.76, 0.05, 3.66, YEL, 333.6, 1.02, 64.8); box(0.02, 0.12, 3.6, WHITE, 333.96, 0.85, 64.8); rect(333.2, 334.0, 62.95, 66.65);
  box(0.3, 0.22, 0.3, DARK, 333.55, 1.16, 63.2); box(0.26, 0.02, 0.18, '#7cff9b', 333.7, 1.24, 63.2, 0, 0, 0.5);
  const BALLS = [{ k: 'white', name: 'WHITE', c: '#f7f5f0' }, { k: 'red', name: 'RED', c: RED }, { k: 'yellow', name: 'YELLOW', c: YEL }, { k: 'blue', name: 'BLUE', c: BLUE }, { k: 'pink', name: 'PINK', c: PINK }, { k: 'glow', name: 'GLOW', c: LIME, glow: true }];
  const BINS = BALLS.map((b, i) => { const z = 63.6 + i * 0.34; box(0.3, 0.07, 0.3, INK, 333.6, 1.08, z); box(0.26, 0.02, 0.26, b.glow ? '#2a3a20' : '#5a5654', 333.6, 1.11, z);
    const g = new THREE.Group(); g.position.set(333.6, 1.12, z); const mat = b.glow ? new THREE.MeshBasicMaterial({ color: LIME }) : LM(b.c); for (let j = 0; j < 5; j++) g.add(mm(Sp(0.042, 10, 8), mat, Math.cos(j * 1.3) * 0.07, 0.035 + (j > 2 ? 0.05 : 0), Math.sin(j * 1.3) * 0.07)); G.add(g); return { ...b, g, p: V(333.6, 1.17, z), hop: 0 }; });
  const glowOwned = () => save.count('glowBalls') > 0; BINS[5].g.visible = glowOwned();
  box(0.05, 1.5, 2.1, WOOD, 332.47, 1.3, 64.8); box(0.08, 0.06, 2.1, INK, 332.5, 1.95, 64.8);
  const PUTTERS = [{ k: 'steel', name: 'CLASSIC STEEL', c: STEEL }, { k: 'red', name: 'RED HOT', c: RED }, { k: 'blue', name: 'BLUE STREAK', c: BLUE }, { k: 'gold', name: 'GOLD PRO', c: GOLD }];
  function makePutter(c, s = 1) { const g = new THREE.Group(); g.add(mm(Cy(0.016, 0.016, 0.18, 8), LM(INK), 0, -0.02, 0), mm(Cy(0.01, 0.01, 0.82, 6), LM(STEEL), 0, -0.5, 0), mm(Bx(0.05, 0.045, 0.17), LM(c), 0, -0.92, 0.05), mm(Bx(0.052, 0.012, 0.02), LM(INK), 0, -0.9, 0.14)); g.scale.setScalar(s); g.traverse(o => { o.renderOrder = 2; }); return g; }
  const RACK = PUTTERS.map((p, i) => { const z = 64.05 + i * 0.5, g = makePutter(p.c); g.position.set(332.6, 1.95, z); G.add(g); return { ...p, g, p: V(332.62, 1.45, z), hop: 0 }; });
  plane(label('PUTTERS', INK, YEL, 256, 64, 40), 1.0, 0.25, 332.51, 2.25, 64.8, Math.PI / 2);
  plane(label('BALLS · PICK A COLOUR', YEL, INK, 512, 64, 36), 1.4, 0.18, 333.97, 0.72, 64.4, Math.PI / 2);
  const cardTex = CT(256, 320, (g, W, H) => { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, W, H); }); { box(0.34, 0.02, 0.44, WOOD, 333.6, 1.055, 66.15); box(0.08, 0.03, 0.06, STEEL, 333.6, 1.07, 65.96); plane(cardTex, 0.3, 0.38, 333.6, 1.068, 66.17, Math.PI / 2, G, -Math.PI / 2); }
  // ================= PRACTICE GREEN (trick shots + the indoor hole through a mini castle) =================
  const PG = { x0: 333.05, x1: 341.15, z0: 68.55, z1: 71.15, y: 0.12, tee: [340.7, 69.85], cup: [333.8, 69.85] };
  box(8.2, 0.05, 2.7, '#4caf6a', 337.1, 0.095, 69.85); for (const z of [68.5, 71.2]) box(8.3, 0.14, 0.1, WHITE, 337.1, 0.14, z); for (const x of [333.0, 341.2]) box(0.1, 0.14, 2.8, WHITE, x, 0.14, 69.85); rect(332.9, 341.3, 68.4, 71.3);
  box(0.4, 0.01, 0.4, WHITE, PG.tee[0], 0.126, PG.tee[1]); cyl(0.075, 0.075, 0.012, INK, PG.cup[0], 0.124, PG.cup[1], 14); cyl(0.008, 0.008, 0.6, WHITE, PG.cup[0] - 0.1, 0.42, PG.cup[1] - 0.1, 5); box(0.22, 0.14, 0.01, RED, PG.cup[0] - 0.0, 0.66, PG.cup[1] - 0.1);
  { const SX = 335.4, ST = '#cfcac3'; box(0.3, 0.45, 0.9, ST, SX, 0.345, 69.0); box(0.3, 0.45, 0.9, ST, SX, 0.345, 70.7); box(0.3, 0.15, 0.8, ST, SX, 0.53, 69.85);
    for (let i = 0; i < 6; i++) box(0.3, 0.1, 0.16, ST, SX, 0.62, 68.65 + i * 0.47); for (const z of [68.6, 71.1, 69.38, 70.32]) { const big = z < 69 || z > 71; cyl(big ? 0.2 : 0.12, big ? 0.2 : 0.12, big ? 0.8 : 0.66, '#bfb8ae', SX, big ? 0.52 : 0.45, z, 10); R0.put(new THREE.ConeGeometry(big ? 0.25 : 0.16, 0.3, 10), SX, big ? 1.07 : 0.93, z, RED); }
    plane(label('MINI CASTLE', INK, YEL, 256, 64, 40), 0.7, 0.17, SX + 0.16, 0.36, 69.85, Math.PI / 2); }
  const TG = [[338.3, 68.95], [339.3, 70.8], [337.0, 70.75]];
  const tgtMat = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false }), TGM = TG.map(p => { const m = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.24, 24), tgtMat); m.rotation.x = -Math.PI / 2; m.position.set(p[0], 0.13, p[1]); m.visible = false; G.add(m); return m; });
  plane(label('PRACTICE GREEN · BANK IT', GREEN, WHITE, 512, 64, 36), 1.8, 0.22, 341.26, 0.4, 69.85, Math.PI / 2);
  // ================= SCOREBOARD (south wall, YOU in red) =================
  const SEED = [['BIRDIE', 14], ['FLICK', 17], ['KIA', 18], ['OTTO', 19], ['MARLA', 21], ['PELL', 23]];
  const boardTex = CT(512, 256, (g, W, H) => drawBoard(g, W, H)); plane(boardTex, 4.2, 2.1, 337.1, 3.05, Z1 - 0.07, Math.PI); box(4.36, 2.26, 0.04, INK, 337.1, 3.05, Z1 - 0.05);
  function drawBoard(g, W, H) { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = GREEN; g.fillRect(0, 0, W, 50); g.fillStyle = '#fff'; g.textBaseline = 'middle'; fitTxt(g, 'BEST ROUNDS · 6 HOLES · PAR 17', 14, 26, W - 28, 30);
    const best = save.stat('gfBest', 0), L = SEED.map(s => ({ n: s[0], v: s[1] })); if (best) L.push({ n: 'YOU', v: best, me: 1 }); L.sort((a, b) => a.v - b.v || (b.me ? 1 : -1));
    L.slice(0, 6).forEach((q, i) => { const y = 74 + i * 30; g.fillStyle = q.me ? RED : i % 2 ? '#2a2826' : '#33302e'; g.fillRect(8, y - 13, W - 16, 27); g.fillStyle = q.me ? '#fff' : YEL; fitTxt(g, (i + 1) + '. ' + q.n, 20, y + 1, 300, 22, 800); g.textAlign = 'right'; g.fillText(String(q.v), W - 22, y + 1); g.textAlign = 'left'; }); }
  // ================= TROPHY SHELF + FRAMED HOLE-IN-ONES (north wall, west of the door) =================
  for (const y of [1.6, 2.3]) box(3.6, 0.05, 0.3, WOOD, 334.5, y, Z0 + 0.2);
  for (const [x, s] of [[333.1, 0.8], [333.6, 1], [334.1, 0.9]]) { box(0.14 * s, 0.06, 0.14 * s, INK, x, 1.66, Z0 + 0.2); cyl(0.02, 0.03, 0.12 * s, GOLD, x, 1.75, Z0 + 0.2, 8); cyl(0.07 * s, 0.03, 0.12 * s, GOLD, x, 1.86 * 1, Z0 + 0.2, 12); }
  plane(label("BIRDIE'S CUPS", INK, YEL, 256, 64, 36), 0.9, 0.18, 333.6, 1.48, Z0 + 0.36);
  const TROPHY = new THREE.Group(); TROPHY.add(mm(Bx(0.32, 0.12, 0.24), LM(INK), 0, 0.06, 0), mm(Cy(0.03, 0.05, 0.22, 10), LM(GOLD), 0, 0.23, 0), mm(Cy(0.16, 0.06, 0.24, 16), LM(GOLD), 0, 0.46, 0), mm(Sp(0.05), LM(WHITE), 0, 0.64, 0));
  for (const s of [-1, 1]) { const h = mm(new THREE.TorusGeometry(0.07, 0.015, 6, 14, Math.PI), LM(GOLD), s * 0.16, 0.48, 0, 0, 0, s * Math.PI / 2); TROPHY.add(h); }
  TROPHY.position.set(335.5, 2.33, Z0 + 0.2); G.add(TROPHY); const trophyLbl = plane(label('HOLE IN ONE', GOLD, INK, 256, 64, 40), 0.5, 0.12, 335.5, 2.39, Z0 + 0.33);
  const FRAMES = []; for (let i = 0; i < 6; i++) { const x = 332.85 + i * 0.6; box(0.52, 0.42, 0.03, INK, x, 3.25, Z0 + 0.06); const t = CT(128, 96, (g, W, H) => drawFrame(g, W, H, null)); plane(t, 0.46, 0.36, x, 3.25, Z0 + 0.085); FRAMES.push(t); }
  plane(label('HOLE IN ONE WALL', YEL, INK, 512, 64, 40), 1.6, 0.2, 334.35, 3.68, Z0 + 0.07);
  function drawFrame(g, W, H, a) { if (!a) { g.fillStyle = '#d8d2c8'; g.fillRect(0, 0, W, H); g.fillStyle = '#8a8178'; g.textBaseline = 'middle'; fitTxt(g, 'YOUR ACE', 10, 36, W - 20, 20, 800); fitTxt(g, 'HERE', 10, 62, W - 20, 20, 800); return; }
    g.fillStyle = '#7ec4e8'; g.fillRect(0, 0, W, H); g.fillStyle = '#4caf6a'; g.fillRect(0, 56, W, 40); g.fillStyle = INK; g.beginPath(); g.ellipse(84, 70, 9, 4, 0, 0, 7); g.fill(); g.fillRect(84, 26, 2, 44); g.fillStyle = RED; g.fillRect(86, 26, 18, 11);
    g.fillStyle = '#d9813a'; g.beginPath(); g.ellipse(36, 50, 11, 15, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(26, 38); g.lineTo(30, 22); g.lineTo(36, 34); g.lineTo(42, 22); g.lineTo(46, 38); g.fill(); g.fillStyle = INK; g.fillRect(4, 4, W - 8, 16); g.fillStyle = YEL; g.textBaseline = 'middle'; fitTxt(g, 'ACE · HOLE ' + (a.h + 1), 8, 13, W - 16, 13, 900); }
  // ================= SNACK COUNTER (north-east): hot dog roller + slushie machine =================
  box(3.0, 1.0, 0.7, RED, 341.9, 0.5, 62.8); box(3.06, 0.05, 0.76, WHITE, 341.9, 1.02, 62.8); rect(340.35, 343.5, 62.4, 63.2);
  box(0.72, 0.08, 0.42, STEEL, 341.1, 1.08, 62.8); box(0.72, 0.3, 0.02, '#cfe6f2', 341.1, 1.25, 63.0); const DOGS = []; for (let i = 0; i < 5; i++) { const d = mm(Cy(0.025, 0.025, 0.36, 8), LM('#b5532a'), 341.1 - 0.24 + i * 0.12, 1.15, 62.8, Math.PI / 2, 0, 0); d.rotation.order = 'ZXY'; G.add(d); DOGS.push(d); }
  box(0.62, 0.28, 0.42, INK, 342.6, 1.18, 62.78); const PAD = []; [['#3fa7d6', 342.45], [RED, 342.77]].forEach(([c, x]) => { G.add(mm(Cy(0.13, 0.13, 0.46, 14), new THREE.MeshLambertMaterial({ color: c, transparent: true, opacity: 0.8 }), x, 1.55, 62.78)); const p = mm(Bx(0.2, 0.36, 0.015), LM(WHITE), x, 1.55, 62.78); G.add(p); PAD.push(p); });
  box(0.6, 0.05, 0.44, INK, 342.6, 1.81, 62.78); plane(label('SNACKS · HOT DOGS · SLUSHIES', INK, YEL, 768, 64, 36), 2.6, 0.22, 341.9, 2.3, Z0 + 0.07);
  // ================= BALL WASHER (by the counter) =================
  const WSH = { x: 334.45, z: 67.15 }; cyl(0.05, 0.06, 0.85, DGREEN, WSH.x, 0.5, WSH.z, 10); box(0.2, 0.32, 0.2, GREEN, WSH.x, 1.05, WSH.z); box(0.22, 0.04, 0.22, INK, WSH.x, 1.23, WSH.z); cyl(0.05, 0.05, 0.02, INK, WSH.x + 0.105, 1.05, WSH.z, 12, 0, Math.PI / 2); ringC(WSH.x, WSH.z, 0.25);
  const plunger = new THREE.Group(); plunger.add(mm(Cy(0.012, 0.012, 0.3, 6), LM(STEEL), 0, 0.15, 0), mm(Bx(0.18, 0.04, 0.05), LM(INK), 0, 0.3, 0)); plunger.position.set(WSH.x, 1.22, WSH.z); G.add(plunger);
  plane(label('BALL WASH', YEL, INK, 256, 64, 40), 0.36, 0.09, WSH.x + 0.105, 0.86, WSH.z, Math.PI / 2);
  const BUB = []; for (let i = 0; i < 8; i++) { const m = new THREE.Mesh(Sp(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; G.add(m); BUB.push({ m, t: 9, vx: 0, vz: 0 }); }
  // ================= GEAR PEG (west wall, once you own the cap) =================
  box(0.05, 0.6, 0.9, WOOD, 332.47, 1.75, 67.7); for (const z of [67.45, 67.95]) cyl(0.015, 0.015, 0.16, INK, 332.55, 1.8, z, 6, 0, Math.PI / 2);
  const pegCap = new THREE.Group(); pegCap.add(mm(new THREE.SphereGeometry(0.14, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), LM(DGREEN)), mm(Bx(0.15, 0.012, 0.12), LM(YEL), 0, 0, 0.15)); pegCap.position.set(332.62, 1.86, 67.45); pegCap.rotation.y = Math.PI / 2; G.add(pegCap);
  const argyle = CT(128, 128, (g, W, H) => { g.fillStyle = DGREEN; g.fillRect(0, 0, W, H); for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) { g.fillStyle = (x + y) % 2 ? YEL : '#e9e4d8'; g.beginPath(); const cx2 = x * 48 + ((y % 2) ? 24 : 0), cy = y * 48; g.moveTo(cx2, cy - 24); g.lineTo(cx2 + 20, cy); g.lineTo(cx2, cy + 24); g.lineTo(cx2 - 20, cy); g.fill(); } g.strokeStyle = '#fff'; g.lineWidth = 2; for (let i = -4; i < 8; i++) { g.beginPath(); g.moveTo(i * 24, 0); g.lineTo(i * 24 + 128, 128); g.stroke(); } });
  const pegVest = mm(Bx(0.4, 0.45, 0.04), new THREE.MeshLambertMaterial({ map: argyle }), 332.52, 1.55, 67.95, 0, Math.PI / 2, 0); G.add(pegVest);
  plane(label('MY GOLF GEAR', INK, YEL, 256, 64, 36), 0.7, 0.16, 332.51, 2.2, 67.7, Math.PI / 2);
  // ---------- hanging sign + lights ----------
  { const T = label("BIRDIE'S MINIGOLF", YEL, INK, 768, 96, 60); for (const ry of [0, Math.PI]) plane(T, 3.0, 0.38, 338, 3.55, 66.4 + (ry ? -0.01 : 0.01), ry); for (const x of [336.7, 339.3]) box(0.01, 1.0, 0.01, DARK, x, 4.2, 66.4); }
  const SPOT = { start: { x: 335.1, z: 64.6, r: 0.9 }, peg: { x: 333.25, z: 67.7, r: 0.6 } };
  cyl(0.5, 0.5, 0.012, YEL, SPOT.start.x, 0.075, SPOT.start.z, 22); cyl(0.42, 0.42, 0.014, INK, SPOT.start.x, 0.077, SPOT.start.z, 22);
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  { const M4 = new THREE.Matrix4(), lm = new THREE.InstancedMesh(Bx(0.25, 0.06, 2.6), new THREE.MeshBasicMaterial({ color: 0xfff8ec }), 4); [[335, 65], [341, 65], [335, 69.5], [341, 69.5]].forEach((p, i) => { M4.makeTranslation(p[0], 4.55, p[1]); lm.setMatrixAt(i, M4); }); G.add(lm); }
  // ================= THE COURSE (outside): 6 holes, geometry matches meru2-town2.js (centres x 335 / 345, z 82 / 98 / 114) =================
  const HOLES = [0, 1, 2, 3, 4, 5].map(i => { const cx = 335 + (i % 2) * 10, cz = 82 + Math.floor(i / 2) * 16; return { i, cx, cz, x0: cx - 3.47, x1: cx + 3.47, z0: cz - 5.97, z1: cz + 5.97, cup: [cx - 1.6, cz - 4], tee: [cx + 1.6, cz + 5.2], y: 0.14,
    par: [3, 3, 3, 3, 3, 2][i], name: ['THE WINDMILL', 'THE LOOP', 'THE BIG RED', 'THE BRIDGE', 'THE CASTLE', 'THE STRAIGHT'][i], circles: [], boxes: [] }; });
  { const h1 = HOLES[1]; h1.circles.push([h1.cx - 0.42, h1.cz, 0.09], [h1.cx + 0.42, h1.cz, 0.09]);
    const h2 = HOLES[2]; h2.boxes.push([h2.cx + 0.3, h2.cx + 2.1, h2.cz + 0.6, h2.cz + 2.4]);
    const h4 = HOLES[4], c4 = h4.cz + 3; h4.boxes.push([h4.cx - 2.5, h4.cx - 0.7, c4 - 0.4, c4 + 0.4], [h4.cx + 0.7, h4.cx + 2.5, c4 - 0.4, c4 + 0.4]); h4.circles.push([h4.cx - 2.7, c4, 0.9], [h4.cx + 2.7, c4, 0.9]);
    const h5 = HOLES[5]; h5.circles.push([h5.cx - 1.1, h5.cz + 0.6, 0.3], [h5.cx + 1.0, h5.cz - 1.6, 0.3]); }
  const H0 = HOLES[0], TW = { x: H0.cx, z: H0.cz + 3.2, r: 1.7 }, rAt = y => 1.7 - 0.5 * y / 5.2;
  // windmill tunnel door (south face) + 3 gear slots; bumpers on hole 6; the ace bell; Birdie's golf bag; glow strips on every rail
  const door = new THREE.Group(); door.add(mm(Bx(0.78, 0.6, 0.05), LM(WOOD), 0, -0.3, 0), mm(Bx(0.78, 0.06, 0.06), LM(INK), 0, -0.02, 0.01)); door.position.set(TW.x, 0.74, TW.z + rAt(0.4) + 0.04); CG.add(door);
  R1.box(0.84, 0.66, 0.02, INK, TW.x, 0.44, TW.z + rAt(0.4) + 0.01);
  const SLOTS = [[TW.x - 0.55, 1.45], [TW.x + 0.55, 1.45], [TW.x, 2.15]].map(([x, y]) => { const z = TW.z + rAt(y) + 0.03; R1.cyl(0.18, 0.18, 0.02, INK, x, y, z, 16, Math.PI / 2); const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.25, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false, side: THREE.DoubleSide })); ring.position.set(x, y, z + 0.03); ring.visible = false; CG.add(ring); return { p: V(x, y, z + 0.02), ring }; });
  function makeGear() { const g = new THREE.Group(); g.add(mm(Cy(0.15, 0.15, 0.05, 16), LM(GOLD), 0, 0, 0, Math.PI / 2), mm(Cy(0.04, 0.04, 0.06, 8), LM(INK), 0, 0, 0, Math.PI / 2)); for (let i = 0; i < 8; i++) { const t = mm(Bx(0.06, 0.07, 0.05), LM(GOLD)); t.position.set(Math.cos(i * Math.PI / 4) * 0.17, Math.sin(i * Math.PI / 4) * 0.17, 0); t.rotation.z = i * Math.PI / 4; g.add(t); } return g; }
  const GEARS = SLOTS.map(() => { const g = makeGear(); CG.add(g); return g; });
  const gearOut = i => V(TW.x - 1.1 + i * 1.1, 0.2, TW.z + 2.3 + (i % 2) * 0.3);
  for (const [x, z, r] of HOLES[5].circles) for (let k = 0; k < 4; k++) R1.cyl(r, r, 0.1, k % 2 ? WHITE : RED, x, 0.19 + k * 0.1, z, 14);
  const BELL = { x: 338.4, z: 74.3 }; R1.cyl(0.06, 0.07, 2.6, INK, BELL.x, 1.3, BELL.z, 8); R1.box(0.7, 0.06, 0.06, INK, BELL.x + 0.3, 2.55, BELL.z); ringC(BELL.x, BELL.z, 0.2);
  const bell = new THREE.Group(); bell.add(mm(Cy(0.08, 0.2, 0.3, 14), LM(GOLD), 0, -0.2, 0), mm(Sp(0.04), LM(INK), 0, -0.36, 0), mm(Cy(0.01, 0.01, 0.1, 4), LM(INK), 0, -0.02, 0)); bell.position.set(BELL.x + 0.55, 2.52, BELL.z); CG.add(bell);
  plane(label('HOLE IN ONE? RING IT!', RED, WHITE, 512, 64, 36), 1.3, 0.16, BELL.x, 1.9, BELL.z + 0.08, 0, CG);
  R1.cyl(0.14, 0.12, 0.8, RED, 339.4, 0.4, 74.5, 10, 0.12); for (let i = 0; i < 3; i++) R1.cyl(0.012, 0.012, 0.4, STEEL, 339.4 + (i - 1) * 0.05, 0.95, 74.45, 5);
  const glowM = new THREE.MeshBasicMaterial({ color: LIME }), glowG = []; for (const h of HOLES) { const gg = []; for (const s of [-1, 1]) { gg.push(mm(Bx(0.06, 0.02, 11.9), glowM, h.cx + s * 3.6, 0.31, h.cz)); gg.push(mm(Bx(7.2, 0.02, 0.06), glowM, h.cx, 0.31, h.cz + s * 6.1)); } gg.push(mm(new THREE.RingGeometry(0.15, 0.22, 20), glowM, h.cup[0], 0.17, h.cup[1], -Math.PI / 2)); gg.forEach(m => { m.visible = false; CG.add(m); glowG.push(m); }); }
  CG.add(new THREE.Mesh(R1.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  // ================= BIRDIE =================
  const BD_LOOK = { fur: '#d9813a', furDark: '#a85a22', muzzle: '#fbeee0', snout: '#f3e2cf', chin: '#ffffff', fluff: '#ffffff' };
  const birdie = kit.makeFox({ key: 'birdieGolf', torso: [WHITE, GREEN, INK], outfit: 'vest', mood: 'happy', eyes: ['#3a6a3a', '#3a6a3a'], look: BD_LOOK }); birdie.scale.multiply(V(0.94, 0.98, 0.94));
  { const P = birdie.userData && birdie.userData.P; if (P && P.head) { const g = new THREE.Group(); g.position.set(0, 0.2, 0.02); const band = mm(new THREE.TorusGeometry(0.3, 0.025, 6, 24, Math.PI * 1.3), LM(YEL)); band.rotation.set(Math.PI / 2, 0, Math.PI * 1.15 - Math.PI); g.add(band); g.add(mm(Bx(0.42, 0.02, 0.24), LM(YEL), 0, 0.02, 0.36, -0.15));
      g.traverse(o => { o.renderOrder = 2; }); P.head.add(g); }
    if (P && P.arms && P.arms[1]) { const pt = makePutter(GOLD); pt.position.set(0, -0.4, 0.04); P.arms[1].add(pt); } if (P && P.sword) P.sword.visible = false; }
  G.add(birdie); const bdCol = { c: [0, 0, 0.45] }; cols.push(bdCol);
  const BS = { idle: [334.55, 63.15, Math.PI * 0.6], green: [342.6, 71.0, -Math.PI / 2], washer: [335.2, 66.4, -Math.PI / 2] };
  const placeBirdie = (x, z, ry) => { if (birdie.parent !== G) G.add(birdie); birdie.position.set(x, x > 330 && z > 73 ? 0.14 : 0, z); birdie.userData.face0 = ry; birdie.rotation.y = ry; const inHut = z < Z1; bdCol.c[0] = inHut ? x : 0; bdCol.c[1] = inHut ? z : -9999; };
  const placeB = k => placeBirdie(...BS[k]); placeB('idle');
  const bdT = { key: 'birdieGolf', obj: birdie, ry: 0, r: 2.4 }, endT = { key: 'golfEnd', obj: birdie, ry: 0, r: 9 };
  const ln = text => ({ who: 'birdie', role: 'BIRDIE', text });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'golf', color: GREEN, boardTitle: "Birdie's best",
    room: { X0, X1, Z0, Z1 }, door: [338, 62.2], keeper: birdie, keeperRy: BS.idle[2],
    games: [{ k: 'round', name: 'Round', color: GREEN }], board: { x: X1 - 0.06, y: 2.6, z: 70.0, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: 343.0, z: 64.6, ry: -Math.PI / 2 }, hiringLine: '6 HOLES · BEAT BIRDIE',
    sun: [{ x: 338, z: 63.4, w: 2.4, d: 2.0 }, { x: 342.6, z: 67, w: 1.8, d: 2.4 }], lamps: [[335, 65], [341, 65], [335, 69.5], [341, 69.5]].map(p => [p[0], 4.45, p[1]]),
    browse: [[337.1, 67.9, 0], [335.8, 63.3, Math.PI], [341.6, 63.8, Math.PI], [339.6, 67.9, 0]],
    looks: [['#2e86b8', '#e0f2fe', '#1d4f6e'], ['#f472b6', '#fce7f3', '#9d174d']], clock: { x: X0 + 0.08, y: 2.9, z: 70.2, ry: Math.PI / 2 } });
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, lastP = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), clack = () => tone(1200, 0.04, 0.05, 'square'), plink = () => { tone(1320, 0.06, 0.25, 'triangle'); tone(990, 0.05, 0.35, 'triangle', 0.08); };
  const putt = () => { tone(900, 0.06, 0.06, 'square'); tone(300, 0.04, 0.1, 'triangle'); }, splash = () => tone(200, 0.06, 0.5, 'sawtooth', 0, 60), clunk = () => tone(120, 0.08, 0.2, 'square'), bellS = () => { for (let i = 0; i < 3; i++) { tone(1046, 0.08, 1.4, 'sine', i * 0.35); tone(1568, 0.05, 1.2, 'sine', i * 0.35); } };
  // ---------- prizes + what you wear ----------
  const lucky = () => save.count('luckyGolfBall') > 0;
  const own = () => ({ cap: !!save.stat('gfCap', false), putter: !!save.stat('gfPutter', false) });
  const wearNow = () => { const o = own(), w = save.stat('gfWear', null) || {}; return { cap: o.cap && w.cap !== false, vest: o.cap && w.vest !== false, putter: o.putter && !!w.putter }; };
  const setWear = (k, v) => { const w = { ...(save.stat('gfWear', null) || {}) }; w[k] = v; save.setStat('gfWear', w); };
  function giveGift() { save.setStat('gfClears', save.stat('gfClears', 0) + 1); const o = own();
    if (!o.cap) { save.setStat('gfCap', true); setWear('cap', true); setWear('vest', true); return { kind: 'cap', label: 'GOLF CAP + SWEATER VEST' }; }
    if (!o.putter) { save.setStat('gfPutter', true); save.setStat('gfPutterC', J ? J.putterC : GOLD); setWear('putter', true); return { kind: 'putter', label: 'YOUR OWN PUTTER' }; }
    if (!lucky()) { save.give('luckyGolfBall'); return { kind: 'lucky', label: 'LUCKY GOLF BALL' }; }
    if (!glowOwned()) { save.give('glowBalls'); return { kind: 'glow', label: 'GLOW BALLS' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  const meleeExtra = () => (own().putter ? [{ key: 'putter', name: 'PUTTER', line: "Birdie's spare putter. Same hit, more style.", on: wearNow().putter }] : []);
  function equipMelee(k) { if (!own().putter) return; setWear('putter', k === 'putter'); if (k === 'putter') toast('PUTTER EQUIPPED', 1.4); }
  function makeCap() { const g = new THREE.Group(); const dome = mm(new THREE.SphereGeometry(0.31, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), LM(DGREEN), 0, 0.18, 0); dome.scale.set(1, 0.72, 1.05); g.add(dome, mm(Cy(0.312, 0.312, 0.05, 16, 1), LM(WHITE), 0, 0.2, 0), mm(Bx(0.36, 0.025, 0.24), LM(YEL), 0, 0.2, 0.36, -0.1), mm(Sp(0.04, 8, 6), LM(YEL), 0, 0.41, 0)); return g; }
  function makeVest() { const g = new THREE.Group(), m = new THREE.MeshLambertMaterial({ map: argyle }); g.add(mm(Bx(0.56, 0.5, 0.025), m, 0, 1.0, 0.365, -0.08), mm(Bx(0.58, 0.56, 0.025), LM(DGREEN), 0, 0.99, -0.2)); for (const s of [-1, 1]) g.add(mm(Bx(0.025, 0.5, 0.52), LM(DGREEN), s * 0.33, 0.98, 0.08)); g.add(mm(Bx(0.56, 0.05, 0.03), LM(WHITE), 0, 0.76, 0.37)); return g; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const w = wearNow(), pc = J && J.putterC && J.showFox ? J.putterC : w.putter ? save.stat('gfPutterC', GOLD) : null, key = (w.cap ? 1 : 0) + '|' + (w.vest ? 1 : 0) + '|' + (pc || '');
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (!(worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox))) { if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [], putter: null }; const P = U.P;
      if (w.cap && P.head) { const c = makeCap(); P.head.add(c); worn.parts.push(c); }
      if (w.vest && P.body) { const v = makeVest(); P.body.add(v); worn.parts.push(v); }
      if (pc && P.arms && P.arms[1]) { const pt = makePutter(pc); pt.position.set(0, -0.4, 0.04); P.arms[1].add(pt); worn.parts.push(pt); worn.putter = pt; }
      worn.parts.forEach(p => p.traverse(o => { o.renderOrder = 2; })); }
    if (pc && U.P.sword) U.P.sword.visible = false;
    if (worn.putter) worn.putter.rotation.x = J && J.swing > 0 ? -Math.sin(J.swing / 0.35 * Math.PI) * 0.9 : 0; }
  // ---------- card (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const bar = (k, gold) => '<div style="height:12px;border:2px solid #201e1d;margin:4px 0;background:#fff;position:relative"><div style="position:absolute;left:0;top:0;bottom:0;width:' + Math.round(k * 100) + '%;background:' + (k > 0.85 ? '#ec3013' : '#ffd23a') + '"></div></div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (busy !== 'job' || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); }, true);
  addEventListener('pointermove', e => { if (busy !== 'job' || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (busy === 'job') release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  const ray = new THREE.Raycaster(), pl = new THREE.Plane(), hitP = V();
  const groundAt = (x, y, gy) => { ray.setFromCamera(new THREE.Vector2(x / innerWidth * 2 - 1, -(y / innerHeight) * 2 + 1), camera); pl.set(V(0, 1, 0), -gy); return ray.ray.intersectPlane(pl, hitP) ? hitP.clone() : null; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  // ---------- balls + aim dots ----------
  const BR = 0.055;
  const myBall = mm(Sp(BR, 14, 10), new THREE.MeshLambertMaterial({ color: 0xffffff })); myBall.visible = false; myBall.renderOrder = 3; scene.add(myBall);
  const halo = mm(Sp(0.16, 12, 8), new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); halo.visible = false; scene.add(halo);
  const bdBall = mm(Sp(BR, 14, 10), LM(PINK)); bdBall.visible = false; scene.add(bdBall);
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), DOTS = []; for (let i = 0; i < 10; i++) { const d = mm(Sp(0.03, 8, 6), dotM); d.renderOrder = 5; d.visible = false; scene.add(d); DOTS.push(d); }
  const hideDots = () => DOTS.forEach(d => { d.visible = false; });
  // ================= THE ROUND =================
  const addGold = n => { n = Math.max(0, Math.round(n * (lucky() ? 1.25 : 1))); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const STEP_N = ['PICK', 'TRICKS', 'COURSE', 'CARD'];
  function startRound() { const n = save.stat('gfVisits', 0); save.setStat('gfVisits', n + 1);
    J = { step: 1, sub: 'pick', gold: 0, pause: 0, t: 0, flies: [], putterK: null, putterC: null, ballK: null, glow: false, mode: null, B: null, aim: null, shots: 0, ti: 0, miss: 0, bank: 0, hole: 0, me: [], bd: [], aces: 0, loops: 0, gi: 0, gmiss: 0, wash: 0, rows: 0, swing: 0, showFox: false, fx: 0, fy: 0, fz: 0, fry: 0, clean: 0 };
    door.rotation.x = 0; GEARS.forEach((g, i) => { g.position.copy(gearOut(i)); g.rotation.set(-Math.PI / 2, 0, i); });
    redraw(cardTex, (g, W, H) => drawScore(g, W, H, 0)); BINS[5].g.visible = glowOwned();
    placeB('idle'); busy = 'job'; pop(); toast('STEP 1 OF 4 · PICK A PUTTER + A BALL', 2.2); }
  // ---- 1 PICK ----
  function pickPress() { if (!J.putterK) { const p = nearestOf(RACK, q => q.p, 2.2); if (!p) return; J.putterK = p.k; J.putterC = p.c; J.putterN = p.name; p.hop = 1; pop(); toast(p.name + ' · NOW TAP A BALL', 1.4); return; }
    const b = nearestOf(BINS.filter(q => !q.glow || glowOwned()), q => q.p, 1.8); if (!b) return; J.ballK = b.k; J.ballC = b.c; J.glow = !!b.glow; b.hop = 1; ding();
    myBall.material = b.glow ? new THREE.MeshBasicMaterial({ color: LIME }) : new THREE.MeshLambertMaterial({ color: b.c });
    toast(b.glow ? 'BIRDIE: "GLOW ROUND! OH, IT IS ON."' : 'BIRDIE: "' + b.name + '? BOLD. I LIKE IT."', 1.8); NEXT('picked', beginTrick, 1.4); }
  // ---- 2 TRICK SHOTS + the castle hole (practice green) ----
  const GREEN_GEO = { x0: PG.x0, x1: PG.x1, z0: PG.z0, z1: PG.z1, y: PG.y, circles: [], boxes: [[335.25, 335.55, 68.55, 69.45], [335.25, 335.55, 70.25, 71.15]], cup: PG.cup, cupR: 0.1, sinkV: 2.4, max: 4.6 };
  function beginTrick() { J.step = 2; J.mode = 'trick'; J.ti = 0; J.miss = 0; placeB('green'); setBall(PG.tee[0], PG.tee[1], GREEN_GEO); showTarget(); J.sub = 'aim'; J.showFox = true;
    sayTo(bdT, [ln('Trick shots! Bank off a rail, through the yellow ring. Drag back, let go.')], null, true); }
  function showTarget() { TGM.forEach((m, i) => { m.visible = J && J.mode === 'trick' && i === J.ti; }); }
  function beginCastle() { J.mode = 'castle'; J.shots = 0; showTarget(); setBall(PG.tee[0], PG.tee[1], GREEN_GEO); J.sub = 'aim'; toast('THE CASTLE HOLE · THROUGH THE GATE, INTO THE TINY CUP', 2.4); }
  // ---- 3 THE COURSE ----
  function beginCourse() { J.step = 3; J.mode = 'course'; J.hole = 0; J.sub = 'jam'; J.B = null; J.gi = 0; J.gt = 0; J.gmiss = 0; standAt(HOLES[0].tee[0] + 0.6, HOLES[0].tee[1] + 0.4, Math.PI); hideBall(); placeBirdie(340, TW.z + 1.6, -Math.PI / 2);
    glowG.forEach(m => { m.visible = J.glow; }); SLOTS[0].ring.visible = true;
    sayTo(bdT, [ln('Out back, six holes. Ugh, the windmill jammed. Tap each gear when its ring goes GREEN.')], null, true); }
  function jamPress() { const S = SLOTS[J.gi], k = ringK(); if (J.flies.length) return; const ok = k > 0.42 && k < 0.62 || J.gmiss >= 3;
    if (!ok) { J.gmiss++; clunk(); toast(J.gmiss >= 3 ? 'BIRDIE: "FINE. TAP IT ANY TIME."' : 'CLUNK · WAIT FOR THE GREEN', 1.2); return; }
    const g2 = addGold(J.gmiss ? 2 : 4); if (!J.gmiss) J.clean++; S.ring.visible = false; const G2 = GEARS[J.gi]; G2.rotation.set(0, 0, 0); fly(G2, S.p, 0.35, 0.4, () => { clack(); tone(500, 0.05, 0.12, 'square'); });
    J.gi++; J.gmiss = 0; J.gt = 0; toast('GEAR IN +' + g2 + (J.gi < 3 ? ' · ' + (3 - J.gi) + ' TO GO' : ''), 1);
    if (J.gi < 3) SLOTS[J.gi].ring.visible = true; else NEXT('jamdone', () => { J.doorT = 0; ding(); toast('BIRDIE: "THERE SHE GOES. THE TUNNEL IS OPEN."', 1.8); NEXT('jamdone', () => startHole(0), 1.6); }, 0.6); }
  const ringK = () => ((J.gt % 1.6) / 1.6);
  function startHole(i) { const H = HOLES[i]; J.hole = i; J.shots = 0; J.splashes = 0; J.sub = 'aim'; setBall(H.tee[0], H.tee[1], H); placeBirdie(340, H.cz, H.cx < 340 ? -Math.PI / 2 : Math.PI / 2); bdBall.visible = false;
    toast('HOLE ' + (i + 1) + ' · ' + H.name + ' · PAR ' + H.par, 2); }
  function holeDone(n) { const H = HOLES[J.hole], par = H.par; J.me[J.hole] = n; let g2 = addGold(8 + 4 * Math.max(0, par - n + 1)); if (n <= par) J.clean++;
    if (n === 1) { J.aces++; g2 += addGold(25); bellRing(); const A = (save.stat('gfAces', null) || []).slice(); A.push({ h: J.hole }); save.setStat('gfAces', A.slice(-6)); drawFrames();
      if (!save.stat('gfTrophy', false)) { save.setStat('gfTrophy', true); J.trophy = true; } toast('HOLE IN ONE! +' + g2 + ' · BIRDIE: "NO WAY. NO WAY!"', 3); }
    else toast((n < par ? 'UNDER PAR! ' : n === par ? 'PAR. ' : '') + n + ' STROKES +' + g2 + ' · ' + ['BIRDIE: "NOT BAD."', 'BIRDIE: "OKAY, OKAY. LUCKY."', 'BIRDIE: "MY TURN."'][J.hole % 3], 2);
    NEXT('sunk', birdieTurn, n === 1 ? 2.6 : 1.6); }
  function birdieTurn() { const H = HOLES[J.hole], r = Math.random(), n = r < 0.07 ? 1 : r < 0.3 ? H.par - 1 : r < 0.82 ? H.par : H.par + 1; J.bd[J.hole] = n; J.sub = 'birdie';
    const pts = []; for (let k = 1; k <= n; k++) { const f = k === n ? 1 : k / n * 0.85, jx = k === n ? 0 : (Math.random() - 0.5) * 2.2; pts.push(V(H.tee[0] + (H.cup[0] - H.tee[0]) * f + jx, H.y + BR, H.tee[1] + (H.cup[1] - H.tee[1]) * f)); }
    J.bq = { pts, k: 0, t: -0.5, from: V(H.tee[0] - 0.5, H.y + BR, H.tee[1]) }; bdBall.position.copy(J.bq.from); bdBall.visible = true; hideBall();
    toast(['BIRDIE: "WATCH AND LEARN."', 'BIRDIE: "TOO EASY."', 'BIRDIE: "EYES ON THE PRO."'][J.hole % 3], 1.6); }
  function birdieTick(dt) { const Q = J.bq; if (!Q) return; Q.t += dt; const B2 = bdBall.position;
    if (Q.t < 0) { placeBirdie(Q.from.x + 0.42, Q.from.z, -Math.PI / 2); return; }
    const to = Q.pts[Q.k], k = Math.min(1, Q.t / 1.0), e = 1 - Math.pow(1 - k, 3); B2.lerpVectors(Q.from, to, e);
    if (k >= 1) { if (Q.k === Q.pts.length - 1) { plink(); B2.y -= 0.1; bdBall.visible = false; J.bq = null; const n = J.bd[J.hole];
        toast('BIRDIE: ' + n + (n === 1 ? ' · "ACE! OBVIOUSLY."' : n < HOLES[J.hole].par ? ' · "BIRDIE ON A BIRDIE."' : n > HOLES[J.hole].par ? ' · "THE WIND. THERE WAS WIND."' : ' · "PAR. BORING. WORKS."'), 2);
        if (n === 1) bellRing(); NEXT('bddone', () => { if (J.hole < 5) startHole(J.hole + 1); else endCourse(); }, 1.8); return; }
      putt(); Q.from = to.clone(); Q.k++; Q.t = -0.45; placeBirdie(Q.from.x + 0.42, Q.from.z, -Math.PI / 2); } }
  function endCourse() { const me = J.me.reduce((a, b) => a + b, 0), bd = J.bd.reduce((a, b) => a + b, 0); J.tot = me; J.btot = bd; J.res = me < bd ? 'win' : me === bd ? 'tie' : 'lose'; const g2 = J.res === 'win' ? addGold(30) : J.res === 'tie' ? addGold(15) : 0;
    toast(J.res === 'win' ? 'YOU BEAT BIRDIE ' + me + ' TO ' + bd + ' · +' + g2 : J.res === 'tie' ? 'A TIE · ' + me + ' EACH · +' + g2 : 'BIRDIE WINS ' + bd + ' TO ' + me, 3);
    { const b = save.stat('gfBest', 0); if (!b || me < b) { save.setStat('gfBest', me); redraw(boardTex, drawBoard); } }
    NEXT('result', beginWash, 2.4); }
  // ---- 4 WASH + SCORECARD ----
  function beginWash() { J.step = 4; J.mode = null; J.sub = 'wash'; J.wash = 0; J.showFox = false; hideBall(); bdBall.visible = false; glowG.forEach(m => { m.visible = false; }); if (lastP) { lastP.x = 335.4; lastP.z = 66.2; lastP.yaw = -Math.PI / 2; } placeB('washer');
    myBall.visible = true; myBall.position.set(WSH.x, 1.3, WSH.z); toast('BALL WASH · TAP TO PUMP IT CLEAN', 1.8); }
  function washPress() { if (J.flies.length) return; J.wash++; J.plT = 0.25; tone(300 + J.wash * 60, 0.04, 0.2, 'triangle'); for (let i = 0; i < 2; i++) { const b = BUB.find(q => q.t > 1.2); if (b) { b.t = 0; b.m.visible = true; b.m.position.set(WSH.x + (Math.random() - 0.5) * 0.1, 1.25, WSH.z + (Math.random() - 0.5) * 0.1); b.vx = (Math.random() - 0.5) * 0.4; b.vz = (Math.random() - 0.5) * 0.4; } }
    if (J.wash >= 6) { const g2 = addGold(6); ding(); toast('SPARKLING +' + g2 + ' · NOW FILL IN YOUR CARD', 1.6); fly(myBall, V(333.6, 1.1, 65.75), 0.5, 0.2); NEXT('card', null, 1.0); } }
  function cardPress() { if (J.rows >= 7) return; J.rows++; tone(1400 + J.rows * 80, 0.03, 0.08, 'square'); redraw(cardTex, (g, W, H) => drawScore(g, W, H, J.rows));
    if (J.rows >= 7) { const g2 = addGold(6); ding(); toast('CARD SIGNED +' + g2, 1.4); NEXT('pay', endRound, 1.4); } }
  function drawScore(g, W, H, n) { g.fillStyle = '#fbf8f0'; g.fillRect(0, 0, W, H); g.fillStyle = GREEN; g.fillRect(0, 0, W, 40); g.fillStyle = '#fff'; g.textBaseline = 'middle'; fitTxt(g, "BIRDIE'S · SCORECARD", 10, 21, W - 20, 22);
    g.fillStyle = INK; g.font = '900 15px Archivo, sans-serif'; ['HOLE', 'PAR', 'YOU', 'BIRDIE'].forEach((t, i) => g.fillText(t, 10 + i * 62, 56)); g.fillRect(8, 66, W - 16, 2);
    for (let i = 0; i < 6; i++) { const y = 84 + i * 30; g.fillStyle = '#cfcac3'; g.fillRect(8, y + 14, W - 16, 1); g.fillStyle = INK; g.font = '800 16px Archivo, sans-serif'; g.fillText(String(i + 1), 14, y); g.fillText(String(HOLES[i].par), 72, y);
      if (J && i < n) { const m = J.me[i] || 0, b = J.bd[i] || 0; g.fillStyle = m === 1 ? RED : '#2a3fb0'; g.font = 'italic 900 20px Archivo, sans-serif'; g.fillText(String(m), 134, y); g.fillStyle = INK; g.font = '800 16px Archivo, sans-serif'; g.fillText(String(b), 196, y); } }
    if (J && n >= 7) { const y = 270; g.fillStyle = INK; g.fillRect(8, y - 14, W - 16, 2); g.font = '900 16px Archivo, sans-serif'; g.fillText('TOTAL', 14, y + 4); g.fillText('17', 72, y + 4); g.fillStyle = '#2a3fb0'; g.font = 'italic 900 22px Archivo, sans-serif'; g.fillText(String(J.tot), 134, y + 4); g.fillStyle = INK; g.font = '800 16px Archivo, sans-serif'; g.fillText(String(J.btot), 196, y + 4);
      g.strokeStyle = '#2a3fb0'; g.lineWidth = 2; g.beginPath(); g.moveTo(30, 304); for (let x = 0; x < 120; x += 8) g.lineTo(30 + x, 300 + Math.sin(x * 0.3) * 6); g.stroke(); } }
  function drawFrames() { const A = save.stat('gfAces', null) || []; FRAMES.forEach((t, i) => redraw(t, (g, W, H) => drawFrame(g, W, H, A[i] || null))); }
  function bellRing() { J && (J.bellT = 2.4); bellS(); }
  let bellT = 0;
  function endRound() { const gold = J.gold, res = J.res, tot = J.tot, btot = J.btot, aces = J.aces, troph = J.trophy, cl = J.clean, first = !K.stars('round'), gift = giveGift(); stop(); placeB('idle'); TROPHY.visible = trophyLbl.visible = !!save.stat('gfTrophy', false);
    K.finish('round', cl >= 8 ? 3 : cl >= 4 ? 2 : 1, gold, first);
    toast('ROUND DONE · +' + gold + ' GOLD · ' + gift.label, 3.5);
    const v = save.stat('gfClears', 0) % 2;   // s71: ONE box, opener rotates, prize named
    const RL = res === 'win' ? (v ? tot + ' to ' + btot + '. You beat me!' : 'You won, ' + tot + ' to ' + btot + '. Best of three?') : res === 'tie' ? (v ? 'A tie, ' + tot + ' each.' : tot + ' each. I will allow it.') : (v ? 'Told you. ' + btot + ' to ' + tot + '.' : btot + ' to ' + tot + '. You are getting better.');
    const XL = troph ? ' Trophy on the shelf!' : aces ? ' Your ace goes on the wall.' : '';
    const GL = { cap: ' Cap + vest for you. The peg swaps them.', putter: ' My spare putter, now in your WEAPONS.', lucky: ' Lucky ball: a quarter more gold here.', glow: ' Glow balls! Green bin, night round.', gold: ' Bonus gold. Earned it.' }[gift.kind];
    sayTo(endT, [ln(RL + XL + GL)], null, true); }
  // ---- ball handling ----
  function setBall(x, z, geo) { J.B = { x, z, vx: 0, vz: 0, y: geo.y, geo, rest: true, bounces: 0, sx: x, sz: z, loop: null, sink: 0, hitT: false }; myBall.visible = true; posBall(); }
  function hideBall() { myBall.visible = false; halo.visible = false; hideDots(); }
  function posBall() { const B = J.B; myBall.position.set(B.x, B.y + BR - B.sink, B.z); halo.visible = J.glow && myBall.visible; halo.position.copy(myBall.position); }
  function standAt(x, z, ry) { J.fx = x; J.fz = z; J.fry = ry; J.fy = J.mode === 'course' ? 0.14 : J.mode ? 0.12 : 0; if (lastP) { lastP.x = x; lastP.z = z; lastP.yaw = ry; } }
  function aimDir() { const B = J.B, geo = B.geo; if (J.aim && J.aim.k > 0.02) return [J.aim.dx, J.aim.dz]; const t = J.mode === 'trick' ? TG[J.ti] : geo.cup; const dx = t[0] - B.x, dz = t[1] - B.z, L = Math.hypot(dx, dz) || 1; return [dx / L, dz / L]; }
  function aimPress() { const B = J.B; if (!B || !B.rest || J.sub !== 'aim') return; J.aim = { x0: ptr.x, y0: ptr.y, k: 0, dx: 0, dz: 1 }; }
  function aimDrag() { const A = J.aim; if (!A) return; const B = J.B, a = groundAt(A.x0, A.y0, B.y), b = groundAt(ptr.x, ptr.y, B.y), px = Math.hypot(ptr.x - A.x0, ptr.y - A.y0); A.k = clamp(px / (0.3 * Math.min(innerWidth, innerHeight)), 0, 1);
    if (a && b) { const dx = a.x - b.x, dz = a.z - b.z, L = Math.hypot(dx, dz); if (L > 0.01) { A.dx = dx / L; A.dz = dz / L; } } }
  function aimRelease() { const A = J.aim; J.aim = null; hideDots(); if (!A) return; if (A.k < 0.05) { toast('DRAG BACK, THEN LET GO', 1.2); return; }
    const B = J.B, mx = B.geo.max || 7, v = 0.5 + A.k * (mx - 0.5); B.vx = A.dx * v; B.vz = A.dz * v; B.rest = false; B.bounces = 0; B.sx = B.x; B.sz = B.z; B.hitT = false; J.shots++; J.sub = 'roll'; J.swing = 0.35; putt(); }
  function bump(B) { B.bounces++; if (Math.hypot(B.vx, B.vz) > 0.4) clack(); }
  function physStep(B, h) { const g = B.geo, sp = Math.hypot(B.vx, B.vz); B.slope = false;
    const ns = Math.max(0, sp - (1.2 + 0.2 * sp) * h), k = sp > 0 ? ns / sp : 0; B.vx *= k; B.vz *= k; const px = B.x, pz = B.z; B.x += B.vx * h; B.z += B.vz * h;
    if (B.x < g.x0 + BR) { B.x = g.x0 + BR; B.vx = Math.abs(B.vx) * 0.78; bump(B); } if (B.x > g.x1 - BR) { B.x = g.x1 - BR; B.vx = -Math.abs(B.vx) * 0.78; bump(B); }
    if (B.z < g.z0 + BR) { B.z = g.z0 + BR; B.vz = Math.abs(B.vz) * 0.78; bump(B); } if (B.z > g.z1 - BR) { B.z = g.z1 - BR; B.vz = -Math.abs(B.vz) * 0.78; bump(B); }
    for (const [cx, cz, r] of g.circles) { const dx = B.x - cx, dz = B.z - cz, d = Math.hypot(dx, dz); if (d < r + BR && d > 1e-4) { const nx = dx / d, nz = dz / d; B.x = cx + nx * (r + BR); B.z = cz + nz * (r + BR); const vn = B.vx * nx + B.vz * nz; if (vn < 0) { B.vx -= 1.78 * vn * nx; B.vz -= 1.78 * vn * nz; bump(B); } } }
    for (const [a0, a1, b0, b1] of g.boxes) { if (B.x > a0 - BR && B.x < a1 + BR && B.z > b0 - BR && B.z < b1 + BR) { const pen = [B.x - (a0 - BR), (a1 + BR) - B.x, B.z - (b0 - BR), (b1 + BR) - B.z], m = Math.min(...pen), i = pen.indexOf(m);
      if (i === 0) { B.x = a0 - BR; B.vx = -Math.abs(B.vx) * 0.78; } else if (i === 1) { B.x = a1 + BR; B.vx = Math.abs(B.vx) * 0.78; } else if (i === 2) { B.z = b0 - BR; B.vz = -Math.abs(B.vz) * 0.78; } else { B.z = b1 + BR; B.vz = Math.abs(B.vz) * 0.78; } bump(B); } }
    if (g === HOLES[0]) { const dx = B.x - TW.x, dz = B.z - TW.z, d = Math.hypot(dx, dz);   // windmill: solid tower, a tunnel straight through the middle
      if (d < TW.r + BR) { if (Math.abs(px - TW.x) < 0.38 - BR + 0.01 && Math.abs(pz - TW.z) < TW.r + BR + 0.2) { if (Math.abs(dx) > 0.38 - BR) { B.x = TW.x + Math.sign(dx) * (0.38 - BR); B.vx = -B.vx * 0.7; bump(B); } }
        else { const nx = dx / d, nz = dz / d; B.x = TW.x + nx * (TW.r + BR); B.z = TW.z + nz * (TW.r + BR); const vn = B.vx * nx + B.vz * nz; if (vn < 0) { B.vx -= 1.78 * vn * nx; B.vz -= 1.78 * vn * nz; bump(B); } } } }
    if (g === HOLES[1] && !B.loop && Math.abs(B.x - g.cx) < 0.38 && (pz - g.cz) * (B.z - g.cz) <= 0 && Math.hypot(B.vx, B.vz) > 2.4) { B.loop = { t: 0, d: Math.sign(B.vz) || 1, sp: Math.hypot(B.vx, B.vz) }; }
    if (g === HOLES[3]) { const dx = B.x - g.cx, dz = B.z - g.cz;
      if (Math.abs(dz) < 1.8 && (Math.abs(px - g.cx) < 1) !== (Math.abs(dx) < 1)) { B.x = px; B.vx = -B.vx * 0.7; bump(B); }
      else if (Math.abs(dx) < 1 && Math.abs(dz) < 1.8) { const s = Math.PI * (dz + 1.8) / 3.6; B.y = g.y + 0.7 * Math.sin(s); B.vz -= 5 * 0.7 * Math.PI / 3.6 * Math.cos(s) * h; B.slope = Math.abs(Math.cos(s)) > 0.15; }
      else { B.y = g.y; if (Math.abs(dz) < 1.0) { B.splash = 1; } } }
    const dc = Math.hypot(B.x - g.cup[0], B.z - g.cup[1]), cupR = g.cupR || 0.13, sv = g.sinkV || 2.8;
    if (dc < cupR) { const s2 = Math.hypot(B.vx, B.vz); if (s2 < sv) { B.in = 1; } else if (!B.lipped) { B.lipped = 1; const a = 0.5 * (Math.random() < 0.5 ? -1 : 1), c = Math.cos(a), s = Math.sin(a); const vx = B.vx * c - B.vz * s, vz = B.vx * s + B.vz * c; B.vx = vx * 0.6; B.vz = vz * 0.6; clack(); toast('LIPPED OUT · TOO FAST', 1); } } else B.lipped = 0;
    if (J.mode === 'trick' && !B.hitT) { const t = TG[J.ti]; if (Math.hypot(B.x - t[0], B.z - t[1]) < 0.24) B.hitT = B.bounces > 0 ? 'bank' : 'plain'; } }
  function rollTick(dt) { const B = J.B; if (!B) return;
    if (B.loop) { const L = B.loop, g = B.geo; L.t += dt / 0.75; const th = Math.min(1, L.t) * Math.PI * 2; B.z = g.cz + L.d * 1.37 * Math.sin(th); B.y = Math.max(g.y, 1.85 - 1.37 * Math.cos(th) - BR); B.x = g.cx; posBall();
      if (L.t >= 1) { B.loop = null; B.y = g.y; B.vx = 0; B.vz = L.d * L.sp * 0.85; B.z = g.cz + L.d * 0.05; J.loops++; const g2 = addGold(5); tone(784, 0.05, 0.3); tone(1046, 0.05, 0.4, 'sine', 0.1); toast('LOOPED IT! +' + g2, 1.2); } return; }
    if (B.in) { B.sink = Math.min(0.12, B.sink + dt * 0.6); posBall(); if (B.sink >= 0.12 && !B.inDone) { B.inDone = 1; plink(); onSunk(); } return; }
    if (B.splash) { B.sink += dt * 0.25; posBall(); if (B.sink > 0.1) { splash(); B.splash = 0; B.sink = 0; J.splashes = (J.splashes || 0) + 1; const g = B.geo, help = J.splashes >= 2; B.x = help ? g.cx : B.sx; B.z = help ? g.cz + 2.1 : B.sz; B.vx = B.vz = 0; B.y = g.y; B.rest = true; J.sub = 'aim'; posBall(); toast(help ? 'SPLASH! · BIRDIE PUTS IT AT THE BRIDGE · "GO ON, OVER YOU GO."' : 'SPLASH! · BIRDIE: "THE BRIDGE IS RIGHT THERE."', 2); if (J.shots >= 7) { holeDone(7); } } return; }
    const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n; for (let i = 0; i < n; i++) { physStep(B, h); if (B.in || B.loop || B.splash) break; } posBall();
    if (!B.in && !B.loop && !B.splash && !B.slope && Math.hypot(B.vx, B.vz) < 0.05) { B.vx = B.vz = 0; B.rest = true; onRest(); } }
  function onRest() { const B = J.B;
    if (J.mode === 'trick') { const h = B.hitT; if (h || J.miss >= 4) { const bank = h === 'bank' || (!h && J.miss >= 4), g2 = addGold(6 + (bank ? 4 : 0)); if (h === 'bank') J.bank++; ding(); TGM[J.ti].visible = false; J.ti++; J.miss = 0;
        toast((h === 'bank' ? 'BANK SHOT! ' : h ? 'IN THE RING · NO BANK, BUT IT COUNTS. ' : 'BIRDIE: "CLOSE ENOUGH." ') + '+' + g2 + (J.ti < 3 ? ' · TARGET ' + (J.ti + 1) + ' OF 3' : ''), 1.6);
        if (J.ti >= 3) { if (J.bank >= 3) J.clean++; NEXT('trickdone', beginCastle, 1.4); return; } showTarget(); } else { J.miss++; nope(); toast(J.miss >= 4 ? 'BIRDIE: "ANY HIT COUNTS NOW."' : 'MISSED THE RING · ' + (J.miss >= 2 ? 'TRY OFF THE FAR RAIL' : 'BOUNCE IT OFF A RAIL'), 1.4); }
      NEXT('aim', () => setBall(PG.tee[0], PG.tee[1], GREEN_GEO), 0.8); return; }
    if (J.mode === 'castle' && J.shots >= 6) { toast('BIRDIE KICKS IT IN · "WE HAVE A COURSE TO PLAY."', 1.8); B.in = 1; return; }
    if (J.mode === 'course' && J.shots >= 7) { toast('BIRDIE: "PICK IT UP, PAL. SEVEN."', 1.8); holeDone(7); return; }
    J.sub = 'aim'; }
  function onSunk() { if (J.mode === 'castle') { const n = J.shots, g2 = addGold(Math.max(4, 14 - 2 * n)); if (n <= 2) J.clean++; ding(); toast((n === 1 ? 'THROUGH THE GATE IN ONE! ' : 'IN THE TINY CUP! ') + '+' + g2 + ' · BIRDIE: "NOW THE REAL THING."', 2); NEXT('castledone', beginCourse, 2.0); return; }
    if (J.mode === 'course') holeDone(J.shots); }
  // ---- input dispatch ----
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'pick') pickPress(); else if (s === 'jam') jamPress(); else if (s === 'wash') washPress(); else if (s === 'card') cardPress(); else if (s === 'aim') aimPress(); }
  function drag() { if (!J || !J.aim) return; aimDrag(); }
  function release() { if (!J || !J.aim) return; aimRelease(); }
  // ---- the round card ----
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 4px;font-size:10px;font-weight:900;border:2px solid #201e1d;overflow:hidden;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J) return; const s = J.sub, tall = innerHeight >= 720; let next = '', det = '', key = s + J.step + '_' + J.gold, hd = 'STEP ' + J.step + ' OF 4', hr = J.gold ? J.gold + ' G' : '';
    if (s === 'pick' || s === 'picked') { key += (J.putterK || '') + (J.ballK || ''); next = !J.putterK ? 'TAP A PUTTER ON THE RACK' : !J.ballK ? 'TAP A BALL COLOUR' : 'NICE PICK';
      det = row(J.putterC || '#cfcac3', 'PUTTER', J.putterN || '\u2014', !!J.putterK) + row(J.ballC || '#cfcac3', 'BALL', J.ballK ? J.ballK.toUpperCase() : '\u2014', !!J.ballK) + (glowOwned() ? '<div style="font-size:12px;padding-top:4px">GREEN BIN = NIGHT GLOW ROUND</div>' : ''); }
    else if (J.mode === 'trick' || J.mode === 'castle') { const k = J.aim ? J.aim.k : 0; key += J.mode + J.ti + '_' + J.miss + '_' + J.shots + '_' + Math.round(k * 10);
      next = s === 'aim' ? (J.aim ? 'LET GO TO PUTT' : 'DRAG BACK, LET GO') : s === 'roll' ? 'ROLLING\u2026' : 'NICE';
      det = J.mode === 'trick' ? [0, 1, 2].map(i => row(i < J.ti ? '#3f9a5e' : YEL, 'TARGET ' + (i + 1), i < J.ti ? '\u2713' : i === J.ti ? 'NOW' : '\u2014', i < J.ti)).join('') + row('#f3f2f2', 'BANKS', J.bank + '/3', J.bank >= 3) + row(INK, 'CASTLE HOLE', '\u2014', false)
        : [0, 1, 2].map(i => row('#3f9a5e', 'TARGET ' + (i + 1), '\u2713', true)).join('') + row(INK, 'CASTLE HOLE', J.shots + ' SHOTS', false);
      det += '<div style="font-size:11px;font-weight:900;padding-top:6px">POWER</div>' + bar(k); }
    else if (s === 'jam' || s === 'jamdone') { key += J.gi + '_' + J.gmiss; hd = 'THE WINDMILL'; next = J.gi < 3 ? 'TAP WHEN THE RING IS GREEN' : 'FIXED!'; det = [0, 1, 2].map(i => row(GOLD, 'GEAR ' + (i + 1), i < J.gi ? '\u2713' : i === J.gi ? 'NOW' : '\u2014', i < J.gi)).join(''); }
    else if (J.mode === 'course' && s !== 'result') { const H = HOLES[J.hole], k = J.aim ? J.aim.k : 0, me = J.me.reduce((a, b) => a + (b || 0), 0), bd = J.bd.reduce((a, b) => a + (b || 0), 0); key += J.hole + '_' + J.shots + '_' + Math.round(k * 10) + (J.bq ? 'b' : '');
      hd = 'HOLE ' + (J.hole + 1) + ' OF 6 · PAR ' + H.par; next = s === 'birdie' ? "BIRDIE'S TURN" : s === 'aim' ? (J.aim ? 'LET GO TO PUTT' : 'DRAG BACK, LET GO') : s === 'roll' ? 'ROLLING\u2026' : 'NICE';
      det = '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + H.name + '</div>' + row(J.ballC || WHITE, 'YOU · THIS HOLE', String(J.shots), false) + row(J.ballC || WHITE, 'YOU · TOTAL', String(me), false) + row(PINK, 'BIRDIE · TOTAL', String(bd), false);
      if (s === 'aim' || J.aim) det += '<div style="font-size:11px;font-weight:900;padding-top:6px">POWER</div>' + bar(k); }
    else if (s === 'result') { key += J.res; hd = 'FINAL SCORE'; next = 'BACK TO THE HUT'; det = row(J.ballC || WHITE, 'YOU', String(J.tot), J.res !== 'lose') + row(PINK, 'BIRDIE', String(J.btot), J.res === 'lose') + '<div style="font-weight:900;font-size:14px;padding-top:6px">' + (J.res === 'win' ? 'YOU WIN THE BET' : J.res === 'tie' ? 'A TIE' : 'BIRDIE WINS') + '</div>'; }
    else if (s === 'wash' || s === 'card' || s === 'pay') { key += J.wash + '_' + J.rows; next = s === 'wash' ? 'TAP TO PUMP · ' + J.wash + '/6' : s === 'card' ? 'TAP TO WRITE · ' + Math.min(J.rows, 6) + '/6' + (J.rows >= 6 ? ' · SIGN IT' : '') : 'ALL DONE';
      det = row(WHITE, 'BALL WASH', J.wash >= 6 ? '\u2713' : J.wash + '/6', J.wash >= 6) + row(WHITE, 'SCORECARD', J.rows >= 7 ? '\u2713' : Math.min(6, J.rows) + '/6', J.rows >= 7); }
    setCard(key, head(hd, hr) + foot(next) + '<div style="padding:8px 10px 10px">' + (tall ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { TGM.forEach(m => { m.visible = false; }); SLOTS.forEach(s => { s.ring.visible = false; }); glowG.forEach(m => { m.visible = false; }); } J = null; ptr.down = false; hideBall(); bdBall.visible = false; hideCard(); placeB('idle'); }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (busy !== 'job' || !J) return null; const s = J.sub;
    if (s === 'pick' || s === 'picked') return [V(333.15, 1.25, 64.8), 2.8, 1.5, 0.25, 2.0, Math.PI / 2, 3.6];
    if (J.mode === 'trick' || J.mode === 'castle') return [V(337.1, 0.12, 69.85), 8.6, 3.2, 1.28, 3, Math.PI, 10];
    if (s === 'jam' || s === 'jamdone') return [V(TW.x, 1.5, TW.z + 2.0), 4.4, 3.4, 0.25, 4.8, 0, 8];
    if (s === 'wash') return [V(WSH.x, 1.05, WSH.z), 2.4, 1.8, 0.4, 2.4, Math.PI / 2, 3.6];
    if (s === 'card' || s === 'pay') return [V(333.6, 1.06, 66.1), 0.8, 0.9, 1.15, 1.0, Math.PI / 2, 2.0];
    if (J.mode === 'course') { const H = HOLES[J.hole]; return J.hole === 0 ? [V(H.cx, 0.14, H.cz + 0.8), 8.4, 15, 1.2, 11, Math.PI, 28] : [V(H.cx, 0.14, H.cz + 0.3), 8.4, 15, 1.25, 11, 0, 28]; }
    return null; }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt, fox) { if (fox) { applyWear(fox); if (J && busy === 'job') { if (J.showFox) { if (J.B && J.B.rest && !J.B.loop && myBall.visible) { const [ax, az] = aimDir(), B = J.B, nx = -az, nz = ax; standAt(B.x - nx * 0.42, B.z - nz * 0.42, Math.atan2(nx, nz)); } fox.visible = true; fox.position.set(J.fx, J.fy, J.fz); fox.rotation.y = J.fry; } else fox.visible = false; } }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v); if (J.mode !== 'course' && J.mode !== 'trick' && J.mode !== 'castle') { camT.pos.x = clamp(camT.pos.x, X0 + 0.35, X1 - 0.35); camT.pos.z = clamp(camT.pos.z, Z0 + 0.35, Z1 - 0.35); camT.pos.y = clamp(camT.pos.y, 0.5, 4.0); }   // indoor shots stay inside the hut
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'pick') return !J.putterK ? [RACK[1].p.clone(), 'TAP A PUTTER'] : [BINS[0].p.clone(), 'TAP A BALL COLOUR'];
    if (s === 'aim' && J.B && J.B.rest && myBall.visible && !J.aim) return [myBall.position.clone(), 'DRAG BACK, LET GO'];
    if (s === 'jam' && SLOTS[J.gi]) return [SLOTS[J.gi].p.clone(), J.gmiss >= 3 ? 'TAP NOW' : 'TAP WHEN IT IS GREEN'];
    if (s === 'wash') return [plunger.position.clone().setY(1.5), 'TAP TO PUMP'];
    if (s === 'card') return [V(333.6, 1.07, 66.17), J.rows >= 6 ? 'TAP TO SIGN' : 'TAP TO WRITE'];
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 2.5;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  function prompt(P) { if (busy || !inShop(P) || P.skate) return null; if (at(P, SPOT.start)) return 'PLAY A ROUND · BEAT BIRDIE'; if (own().cap && at(P, SPOT.peg)) return 'MY GOLF GEAR · CAP + VEST ' + (wearNow().cap ? 'OFF' : 'ON'); if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, bdT)) return 'TALK · BIRDIE'; return null; }
  // s71: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ['Birdie. Club champ. Six holes out back, me against you. Yellow mark by the counter. Bet I win.', 'Back for more? The yellow mark by the counter is free.', 'Visor on. Putter polished. Ready to lose?', 'Windmill is fixed. Mostly. Round of six?'];
  const TIPS = ['Drag back further for more power. Too fast and the cup spits it out.', 'The windmill jams every Tuesday. It is always Tuesday somewhere.', 'Do not touch the visor. The visor is lucky.', 'Bank shots are just geometry with attitude.', 'The loop is optional. Looking cool is not.',
    'Glow balls at night. Best round in Meru. Trust me.', 'Flick says he beat me once. Flick is lying.', 'Hot dogs are free for anyone who aces hole six. Nobody has. Except me.'];
  const goWork = P => { if (P) Object.assign(P, { x: SPOT.start.x, z: SPOT.start.z, sp: 0 }); startRound(); };
  const togglePeg = () => { const on = !wearNow().cap; setWear('cap', on); setWear('vest', on); pop(); toast(on ? 'CAP + VEST ON' : 'CAP + VEST OFF', 1.4); };
  const bdMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) goWork(lastP); } }, ...(own().cap ? [{ text: 'MY GOLF GEAR', pick: () => { if (!busy) togglePeg(); } }] : []),
      { text: 'A GOLF TIP, PLEASE', pick: () => sayTo(bdT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(bdT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy) return true; if (!inShop(P) || P.skate) return false;
    if (at(P, SPOT.start)) { startRound(); return true; }
    if (own().cap && at(P, SPOT.peg)) { togglePeg(); return true; }
    if (K.atHiring(P)) { ding(); goWork(P); return true; }
    if (!near(P, bdT)) return false; pop(); bdMenu(!talked++); return true; }
  function quit() { stop(); toast('ROUND CANCELLED · GOLD KEPT', 2); }
  // ---------- tick ----------
  TROPHY.visible = trophyLbl.visible = !!save.stat('gfTrophy', false); drawFrames(); redraw(cardTex, (g, W, H) => drawScore(g, W, H, 0));
  function tick(dt, P, fox) { lastP = P; const t = performance.now() / 1000, dH = Math.hypot(P.x - CX, P.z - CZ), dC = Math.hypot(P.x - 340, P.z - 100); G.visible = dH < (touch ? 45 : 90) || (busy && J && J.mode === 'course'); CG.visible = dC < (touch ? 70 : 130); toastT -= dt;
    if (busy === 'job' && J && !J.mode && !inShop(P)) stop();
    if (busy === 'job' && J) { J.t += dt; if (J.flies.length) flyTick(dt); if (J.swing > 0) J.swing = Math.max(0, J.swing - dt);
      if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } }
      else { if (J.sub === 'roll') rollTick(dt); if (J.sub === 'birdie') birdieTick(dt); if (J.sub === 'jam') { J.gt += dt; const S = SLOTS[J.gi]; if (S) { const k = ringK(); S.ring.scale.setScalar(2.2 - 2.0 * k); S.ring.material.color.set(k > 0.42 && k < 0.62 ? 0x3fd36a : 0xffffff); } } }
      if (J.sub === 'aim' && J.B && J.B.rest && J.mode) { const [ax, az] = aimDir(), k = J.aim ? J.aim.k : 0, B = J.B; DOTS.forEach((d, i) => { d.visible = !!J.aim && k > 0.03; d.position.set(B.x + ax * (0.14 + i * (0.06 + k * 0.22)), B.y + BR, B.z + az * (0.14 + i * (0.06 + k * 0.22))); }); }
      if (J.doorT != null && J.doorT < 1) { J.doorT = Math.min(1, J.doorT + dt * 1.5); door.rotation.x = -J.doorT * 1.5; }
      if (J.plT > 0) { J.plT -= dt; plunger.position.y = 1.22 - Math.sin(J.plT / 0.25 * Math.PI) * 0.12; }
      if (J.mode === 'trick') { const m = TGM[J.ti]; if (m) m.scale.setScalar(1 + 0.12 * Math.sin(t * 6)); }
      if (J.bellT > 0) { bellT = J.bellT; J.bellT = 0; }
      drawCard(); }
    if (bellT > 0) { bellT -= dt; bell.rotation.z = Math.sin(t * 14) * 0.5 * Math.min(1, bellT); } else bell.rotation.z = 0;
    hintTick(t); if (!G.visible) return;
    DOGS.forEach(d => { d.rotation.y += dt * 2; }); PAD.forEach(p => { p.rotation.y += dt * 3; });
    for (const b of [...BINS, ...RACK]) if (b.hop > 0) { b.hop = Math.max(0, b.hop - dt * 3); b.g.position.y = (b.g === undefined ? 0 : (RACK.includes(b) ? 1.95 : 1.12)) + Math.sin(b.hop * Math.PI) * 0.06; }
    for (const s of BUB) if (s.t < 1.2) { s.t += dt; s.m.position.x += s.vx * dt; s.m.position.z += s.vz * dt; s.m.position.y += dt * 0.5; s.m.material.opacity = 0.8 * (1 - s.t / 1.2); if (s.t >= 1.2) s.m.visible = false; }
    pegCap.visible = pegVest.visible = own().cap && !wearNow().cap;
    { const work = !!busy; K.tick(dt, P, { inShop: inShop(P), busy: work, near: dH, talking: work });   // s71: shop kit runs Birdie's idle / wave / look-at
      if (work) { const f0 = birdie.userData.face0 ?? 0; birdie.rotation.y += Math.atan2(Math.sin(f0 - birdie.rotation.y), Math.cos(f0 - birdie.rotation.y)) * Math.min(1, dt * 3); } } }
  const API = { group: G, course: CG, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startRound, birdie, camera, save, meleeExtra, equipMelee, holes: HOLES,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); ptr.down = false; if (busy === 'job') release(); },
    down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); }, dragTo(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; if (busy === 'job') release(); },
    shoot(dx, dz, k) { if (!J || !J.B || !J.B.rest || J.sub !== 'aim') return false; const L = Math.hypot(dx, dz) || 1; J.aim = { k, dx: dx / L, dz: dz / L }; aimRelease(); return true; },   // test: aim + power directly
    aimAtCup(k) { if (!J || !J.B) return false; const g = J.B.geo, t = J.mode === 'trick' ? TG[J.ti] : g.cup; return API.shoot(t[0] - J.B.x, t[1] - J.B.z, k); },
    targets() { if (!J) return []; if (J.sub === 'pick') return !J.putterK ? RACK.map(q => scrW(q.p)) : BINS.filter(q => !q.glow || glowOwned()).map(q => scrW(q.p)); if (J.sub === 'jam') return [scrW(SLOTS[J.gi].p)]; return [[innerWidth / 2, innerHeight / 2]]; },
    ringGreen: () => !!J && J.sub === 'jam' && ringK() > 0.42 && ringK() < 0.62,
    skipTo(s) { if (!J) startRound(); J.pause = 0; J.after = null; J.flies.length = 0; if (!J.putterK) { J.putterK = 'gold'; J.putterC = GOLD; J.putterN = 'GOLD PRO'; J.ballK = 'white'; J.ballC = '#f7f5f0'; }
      if (s === 'trick') beginTrick(); else if (s === 'castle') { J.step = 2; J.showFox = true; J.ti = 3; beginCastle(); } else if (s === 'course') { J.showFox = true; beginCourse(); } else if (s === 'hole') { J.showFox = true; J.step = 3; J.mode = 'course'; J.gi = 3; J.doorT = 0; SLOTS.forEach((q, i) => { q.ring.visible = false; GEARS[i].position.copy(q.p); GEARS[i].rotation.set(0, 0, 0); }); startHole(0); }
      else if (s === 'wash') { J.mode = 'course'; for (let i = 0; i < 6; i++) { J.me[i] = HOLES[i].par; J.bd[i] = HOLES[i].par; } J.tot = 17; J.btot = 17; J.res = 'tie'; J.mode = null; beginWash(); } },
    hiring: K, dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__golf = API; return API;
}
