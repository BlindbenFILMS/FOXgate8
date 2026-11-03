import { applyD, applyPose, neutralD, endPose, sampleAnim } from '../engine/fox-poses.js?v=s648k';   // s624 jointed fans, diners + party kids
// MERU 2.0 — s117 MERU LANES DELUXE PART C2: LOOK + LIFE (Ben's answers s114). Plugged into worlds/meru2-lanes-jobs.js as LF (old lanes frame).
// LOOK: COSMIC GLOW (9 PM - 1 AM on its own; the GLOW SWITCH on the shoe desk = AUTO / ON / OFF once mlnGlow is unlocked): the hall darkens,
// blacklight tubes, neon lane edges, glowing pins, confetti carpet glow, DISCO BALL spots · COSMIC BOWL neon (north wall) with flicker + buzz ·
// pinsetter clatter · TROPHY CASE (south wall; your own trophies join the bottom shelf) · DINER JUKEBOX (E = a song) · STRIKE! light show on the
// score screens (the 3D tenpin sends 8g:tenpinStrike; the roster bowlers' strikes too). ARCADE: ARCADE neon (east wall) + chase strips on the floor.
// LIFE: roster foxes bowl lanes 1-3 by the hour · LEAGUE NIGHT 6 PM - 11:30 PM: PIN PALS (red) vs ALLEY CATS (teal) in matching shirts + fans on
// the settees · KIDS' BIRTHDAY PARTY 1 - 5 PM at the west high tables · DINER CUSTOMERS on the high-table stools by the hour.
export function lnLife(X) {
  const { THREE, G, box, cyl, LM, CT, kit, cols, save, lanes, touch, hour, tone, noise, toast, inRoom, jobBusy } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', PINK = '#ff3fb4', CYAN = '#52e3ff', UV = '#9b5cff', GOLD = '#e6b45a';
  const hr = () => (((hour ? hour() : 12) % 24) + 24) % 24, rnd = (a, b) => a + Math.random() * (b - a);
  const st = (k, d) => save.stat('mln' + k, d), set = (k, v) => save.setStat('mln' + k, v);
  const LZ = (lanes && lanes.LZ) || [-36, -32.2, -28.4, -24.6, -20.8, -17], PAIRS = (lanes && lanes.PAIRS) || [-34.1, -26.5, -18.9], PS = (lanes && lanes.PS) || 1.5;
  const FOUL = 126.55, LEND = 143, ZC = -26.5;
  const LG = new THREE.Group(); LG.name = 'lanesLife'; G.add(LG); LG.visible = false;
  const colF = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const ADD = (c, op = 0) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
  const GLOW = [], glow = (geo, c, op, x, y, z, ry = 0) => { const m = new THREE.Mesh(geo, ADD(c)); m.position.set(x, y, z); m.rotation.y = ry; m.renderOrder = 50; m.userData.op = op; LG.add(m); GLOW.push(m); return m; };
  const flatG = (w, d) => new THREE.PlaneGeometry(w, d).rotateX(-Math.PI / 2);
  const neonTex = (w, h, fn) => CT(w, h, (c, W, H) => { c.clearRect(0, 0, W, H); c.textBaseline = 'middle'; fn(c, W, H); });
  const neonTxt = (c, t, x, y, fs, col) => { c.font = '900 ' + fs + 'px Archivo, sans-serif'; c.shadowColor = col; c.shadowBlur = 18; c.strokeStyle = col; c.lineWidth = 6; c.strokeText(t, x, y); c.shadowBlur = 0; c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.strokeText(t, x, y); };
  const plane = (tex, w, h, x, y, z, ry, add = false, ro = 50) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), add ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }) : new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; m.renderOrder = ro; LG.add(m); return m; };
  // ================= COSMIC GLOW =================
  const dark = new THREE.Mesh(new THREE.BoxGeometry(47, 8, 50), new THREE.MeshBasicMaterial({ color: '#120838', transparent: true, opacity: 0, side: THREE.BackSide, depthTest: false, depthWrite: false }));
  dark.position.set(127.5, 3.5, -14); dark.renderOrder = 40; dark.frustumCulled = false; dark.visible = false; LG.add(dark);
  const TUBES = [127.2, 133, 138.6].map(x => glow(new THREE.BoxGeometry(0.08, 0.06, 22.4), UV, 0.95, x, 4.18, ZC));
  const EDGE = ['#38bdf8', PINK, '#7cff9b'];
  LZ.forEach((z, i) => { for (const s of [-1, 1]) glow(new THREE.BoxGeometry(LEND - FOUL, 0.01, 0.05), EDGE[i % 3], 0.9, (FOUL + LEND) / 2, 0.118, z + s * 1.07); glow(new THREE.BoxGeometry(0.05, 0.01, 2.14), RED, 0.9, FOUL + 0.03, 0.119, z);
    for (let k = -3; k <= 3; k++) glow(new THREE.CircleGeometry(0.035, 8).rotateX(-Math.PI / 2), YEL, 0.8, FOUL + 2.2, 0.118, z + k * 0.27); });
  const confT = CT(256, 256, (c, w) => { c.fillStyle = '#000'; c.fillRect(0, 0, w, w); const C = [PINK, '#38bdf8', YEL, '#7cff9b', UV]; for (let i = 0; i < 70; i++) { c.strokeStyle = C[i % 5]; c.lineWidth = 3; c.beginPath(); const x = Math.random() * w, y = Math.random() * w, a = Math.random() * 6.3; c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a) * 9, y + Math.sin(a) * 9 + 6, x + Math.cos(a) * 16, y + Math.sin(a) * 16); c.stroke(); } });
  confT.wrapS = confT.wrapT = THREE.RepeatWrapping; confT.repeat.set(9, 6);
  for (const [w, d, x, z] of [[45, 24.8, 127.5, -2.5], [17.4, 22.8, 113.8, -26.5]]) { const m = glow(flatG(w, d), '#ffffff', 0.55, x, 0.085, z); m.material.map = touch ? null : confT; if (touch) m.userData.off = true; m.material.polygonOffset = true; m.material.polygonOffsetFactor = -4; }
  // glowing pins: every mesh on the shared pin geometry (lanes 1-4 instanced, the bowlers' pins, the tenpin's pins)
  const PGEO = lanes && lanes.pinGeo; let pinMs = [], scanT = 0, pinsLit = false;
  const scanPins = () => { pinMs = []; let r = G; while (r.parent) r = r.parent; r.traverse(o => { if (o.isMesh && PGEO && o.geometry === PGEO) pinMs.push(o); }); if (lanes && lanes.pinIM && !pinMs.includes(lanes.pinIM)) pinMs.push(lanes.pinIM); };
  function pinGlow(on) { for (const m of pinMs) { const mat = m.material; if (!mat || Array.isArray(mat)) continue;
      if (on) { if (!m.userData.lnRO) m.userData.lnRO = { ro: m.renderOrder }; if (!mat.userData.lnG) { mat.userData.lnG = { t: mat.transparent, e: mat.emissive ? mat.emissive.getHex() : 0 }; mat.transparent = true; if (mat.emissive) mat.emissive.set('#5a3cff'); mat.needsUpdate = true; } m.renderOrder = 50; }
      else { if (m.userData.lnRO) { m.renderOrder = m.userData.lnRO.ro; delete m.userData.lnRO; } if (mat.userData.lnG) { mat.transparent = mat.userData.lnG.t; if (mat.emissive) mat.emissive.setHex(mat.userData.lnG.e); delete mat.userData.lnG; mat.needsUpdate = true; } } } pinsLit = on; }
  // the disco ball over the middle truss + its spots on the floor
  const DB = new THREE.Group(); DB.position.set(133, 3.55, ZC); LG.add(DB); cyl(DB, 0.012, 0.012, 0.5, INK, 0, 0.6, 0, 4);
  const tiles = CT(256, 128, (c, w, h) => { for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) { const v = 140 + Math.random() * 110 | 0; c.fillStyle = 'rgb(' + v + ',' + v + ',' + (v + 12) + ')'; c.fillRect(x, y, 7, 7); } });
  const dball = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 14), new THREE.MeshPhongMaterial({ map: tiles, shininess: 140, specular: 0xffffff, emissive: 0x2a2a30 })); DB.add(dball);
  const sparkT = CT(64, 64, (c, w) => { const g = c.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(200,180,255,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, w, w); });
  const flare = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); flare.scale.setScalar(1.4); flare.renderOrder = 51; DB.add(flare);
  const SPOTC = [PINK, '#38bdf8', YEL, '#7cff9b', '#ffffff', UV], spotGeo = new THREE.CircleGeometry(0.2, 10).rotateX(-Math.PI / 2);
  const SPOTS = [...Array(touch ? 10 : 18)].map((_, i) => { const m = new THREE.Mesh(spotGeo, ADD(SPOTC[i % 6])); m.renderOrder = 52; m.userData = { a: Math.random() * 6.3, r: rnd(2, 9.5), w: rnd(0.8, 1.2) }; m.visible = false; LG.add(m); return m; });
  // the GLOW SWITCH on the east end of the shoe desk (faces the concourse)
  const SW = { x: 117.5, z: -10.05 }, swG = new THREE.Group(); swG.position.set(117.55, 1.11, -8.95); LG.add(swG);
  box(swG, 0.36, 0.26, 0.2, INK, 0, 0.13, 0); const lever = box(swG, 0.05, 0.16, 0.05, RED, 0, 0.2, -0.12); lever.geometry.translate(0, 0.06, 0);
  const swLab = plane(CT(128, 48, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); c.fillStyle = '#c4a8ff'; c.font = '900 30px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('GLOW', 10, h / 2 + 2); }), 0.3, 0.11, 0, 0.07, -0.105, Math.PI, false, 0); LG.remove(swLab); swG.add(swLab);
  const swLamp = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: '#3a3448' })); swLamp.position.set(0.13, 0.22, -0.1); swG.add(swLamp);
  const night = () => { const h = hr(); return h >= 21 || h < 1; };
  const mode = () => (st('Glow', false) ? st('GlowMode', 'auto') : 'auto');
  const glowWanted = () => { const m = mode(); return m === 'on' || (m === 'auto' && night()); };
  // ================= STRIKE! light show on the three score screens =================
  const SH = PAIRS.map((zc, i) => { const tex = CT(256, 144, () => {}); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.9), new THREE.MeshBasicMaterial({ map: tex, transparent: true }));
    m.position.set(126.985, 3.35, zc); m.rotation.y = -Math.PI / 2; m.renderOrder = 52; m.visible = false; LG.add(m); return { m, tex, t: 0, txt: 'STRIKE!' }; });
  const DECK = LZ.map(z => { const m = new THREE.Mesh(flatG(1.9, 2.0), ADD(YEL)); m.position.set(142.5, 0.125, z); m.renderOrder = 52; m.visible = false; LG.add(m); return m; });
  let burst = 0, shT = 0;
  function show(pairs, txt) { pairs.forEach(p => { if (SH[p]) { SH[p].t = 2.8; SH[p].txt = txt; } }); burst = Math.max(burst, 2.8); }
  function drawShow(S, t) { const c = S.tex.userData.c, g = c.getContext('2d'), w = 256, h = 144, cx = w / 2, cy = h / 2; g.fillStyle = '#0e1230'; g.fillRect(0, 0, w, h);
    for (let k = 0; k < 12; k++) { const a = t * 2.4 + k * Math.PI / 6; g.fillStyle = [PINK, '#38bdf8', YEL][k % 3]; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 200, a, a + 0.24); g.closePath(); g.fill(); }
    g.fillStyle = 'rgba(14,18,48,0.6)'; g.fillRect(0, cy - 32, w, 64); g.save(); g.translate(cx, cy); const s = 1 + 0.1 * Math.sin(t * 14); g.scale(s, s); g.fillStyle = (t * 6 | 0) % 2 ? YEL : WHITE;
    let fs = 50; g.font = '900 50px Archivo, sans-serif'; while (fs > 16 && g.measureText(S.txt).width > w - 34) { fs -= 2; g.font = '900 ' + fs + 'px Archivo, sans-serif'; } g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(S.txt, 0, 2); g.restore();
    g.strokeStyle = (t * 8 | 0) % 2 ? PINK : CYAN; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); S.tex.needsUpdate = true; }
  addEventListener('8g:tenpinStrike', e => { const n = (e.detail && e.detail.streak) || 1; show([0, 1, 2], n >= 3 ? (n === 3 ? 'TURKEY!' : n + ' IN A ROW!') : 'STRIKE!'); cheer(-1); });
  // ================= NEON: COSMIC BOWL (north wall over the lanes) + ARCADE (east wall) + chase strips by the cabinets =================
  const NEON = [];
  const neonSign = (x, y, z, ry, w, h, parts) => { const bd = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.2, h + 0.16), new THREE.MeshBasicMaterial({ color: '#0d0b18' })); bd.position.set(x, y, z); bd.rotation.y = ry; LG.add(bd);
    const n = Math.sin(ry), c = Math.cos(ry); parts.forEach(([tex, flick]) => { const m = plane(tex, w, h, x + n * 0.02, y, z + c * 0.02, ry, true, 53); NEON.push({ m, flick, ft: rnd(4, 9), f: 0, x, z }); }); };
  neonSign(133, 3.3, -37.86, 0, 3.6, 0.9, [[neonTex(1024, 256, (c, w, h) => neonTxt(c, 'COSMIC', 30, h / 2, 150, PINK)), false], [neonTex(1024, 256, (c, w, h) => { c.font = '900 150px Archivo, sans-serif'; const x = 60 + c.measureText('COSMIC ').width; neonTxt(c, 'BOWL', x, h / 2, 150, CYAN); }), true]]);
  neonSign(149.6, 3.5, -4.6, -Math.PI / 2, 3.0, 0.75, [[neonTex(1024, 256, (c, w, h) => neonTxt(c, 'ARCADE', 40, h / 2, 170, YEL)), true]]);
  const CHASE = [];
  for (const [x, z0, z1] of [[146.9, -10, -0.6], [107.3, -35, -23.6]]) { const n = touch ? 10 : 16, L = (z1 - z0) / n; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(flatG(0.1, L * 0.7), ADD(PINK, 0.85)); m.position.set(x, 0.09, z0 + (i + 0.5) * L); m.renderOrder = 50; LG.add(m); CHASE.push({ m, i }); } }
  // ================= TROPHY CASE (south wall, west of the jukebox) =================
  const TC = { x: 115, z: 9.3 }, tcG = new THREE.Group(); tcG.position.set(TC.x, 0, TC.z); tcG.rotation.y = Math.PI; LG.add(tcG);
  box(tcG, 3.0, 0.3, 0.5, INK, 0, 0.15, 0); box(tcG, 3.0, 0.08, 0.5, INK, 0, 2.0, 0); box(tcG, 3.0, 1.7, 0.04, '#2a1d14', 0, 1.15, -0.23); for (const s of [-1, 1]) box(tcG, 0.06, 1.7, 0.5, INK, s * 1.47, 1.15, 0);
  for (const y of [0.75, 1.3]) box(tcG, 2.9, 0.025, 0.44, '#c0c4cc', 0, y, 0);
  { const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 1.7), new THREE.MeshBasicMaterial({ color: '#dfefff', transparent: true, opacity: 0.12, depthWrite: false })); gl.position.set(0, 1.15, 0.245); tcG.add(gl);
    const lt = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.03, 0.04), new THREE.MeshBasicMaterial({ color: '#fff4d8' })); lt.position.set(0, 1.93, 0.15); tcG.add(lt);
    const lb = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.16), new THREE.MeshBasicMaterial({ map: CT(256, 40, (c, w, h) => { c.fillStyle = INK; c.fillRect(0, 0, w, h); c.fillStyle = GOLD; c.font = '900 24px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('TROPHY CASE', 10, h / 2 + 1); }) }));
    lb.position.set(0, 2.15, 0.2); tcG.add(lb); colF(TC.x - 1.55, TC.x + 1.55, TC.z - 0.3, 9.7); }
  const cupGeo = new THREE.LatheGeometry([[0, 0], [0.07, 0], [0.07, 0.025], [0.02, 0.045], [0.02, 0.12], [0.08, 0.15], [0.105, 0.3], [0.095, 0.3], [0.07, 0.17], [0, 0.165]].map(([a, b]) => new THREE.Vector2(a, b)), 14);
  const goldM = new THREE.MeshPhongMaterial({ color: GOLD, shininess: 120, specular: 0xffe7a0 }), silvM = new THREE.MeshPhongMaterial({ color: '#c8ccd4', shininess: 120, specular: 0xffffff });
  const cup = (x, y, s, mat) => { const m = new THREE.Mesh(cupGeo, mat); m.position.set(x, y, 0); m.scale.setScalar(s); tcG.add(m); return m; };
  const plaque = (x, y, t, col = GOLD) => { const g = new THREE.Group(); g.position.set(x, y, -0.12); tcG.add(g); box(g, 0.36, 0.26, 0.03, '#3d2a1c', 0, 0.13, 0); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.2), new THREE.MeshBasicMaterial({ map: CT(128, 88, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = INK; c.textBaseline = 'middle'; let fs = 22; c.font = '900 22px Archivo, sans-serif'; while (fs > 9 && c.measureText(t).width > w - 12) { fs--; c.font = '900 ' + fs + 'px Archivo, sans-serif'; } c.fillText(t, 6, h / 2); }) })); p.position.set(0, 0.13, 0.017); g.add(p); return g; };
  cup(-1.0, 1.33, 1.5, goldM); cup(-0.55, 1.33, 1.0, silvM); cup(0.95, 1.33, 1.25, goldM); plaque(0.25, 1.33, 'LEAGUE 1987');
  { const bl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), silvM); bl.position.set(-0.9, 0.92, 0); tcG.add(bl); cyl(tcG, 0.08, 0.1, 0.06, INK, -0.9, 0.79, 0, 10); plaque(-0.3, 0.78, 'ROOK · 11 YEARS', '#c8ccd4'); cup(0.4, 0.78, 0.9, goldM); plaque(1.0, 0.78, 'NERA · 212'); }
  const yours = plane(CT(128, 32, (c, w, h) => { c.fillStyle = RED; c.fillRect(0, 0, w, h); c.fillStyle = WHITE; c.font = '900 20px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('YOURS', 8, h / 2 + 1); }), 0.4, 0.1, 0, 0, 0, 0, false, 0); LG.remove(yours); yours.position.set(-1.15, 0.36, 0.2); tcG.add(yours);
  const MINE = { LeagueW: cup(-0.75, 0.33, 1.3, goldM), Rook: plaque(-0.2, 0.33, 'BEAT ROOK', '#c8ccd4'), Nera: plaque(0.3, 0.33, 'THE HOUSE'), Drills: plaque(0.85, 0.33, 'SPARE MASTER', '#7cff9b') };
  const drillsAll = () => ['7-10 SPLIT', '10 PIN', '7 PIN', 'THE BUCKET', 'BABY SPLIT'].every(n => (st('Drill_' + n.replace(/[^A-Z0-9]/g, ''), 0) || 0) >= 3);
  const mineRefresh = () => { MINE.LeagueW.visible = (st('LeagueW', 0) || 0) > 0; MINE.Rook.visible = !!st('Rook', false); MINE.Nera.visible = !!st('Nera', false); MINE.Drills.visible = drillsAll(); };
  // ================= DINER JUKEBOX (south wall, by the counter) =================
  const JB = { x: 121.6, z: 9.15 }, jbG = new THREE.Group(); jbG.position.set(JB.x, 0, JB.z); jbG.rotation.y = Math.PI; LG.add(jbG);
  box(jbG, 0.95, 1.25, 0.6, '#5a2a18', 0, 0.625, 0); { const top = new THREE.Mesh(new THREE.CylinderGeometry(0.475, 0.475, 0.6, 18, 1, false, -Math.PI / 2, Math.PI), LM('#5a2a18')); top.rotation.x = Math.PI / 2; top.position.set(0, 1.25, 0); jbG.add(top); }
  const jbTube = []; for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.15, 0.05), ADD(PINK, 0.95)); m.position.set(s * 0.42, 0.65, 0.3); m.renderOrder = 53; jbG.add(m); jbTube.push(m); }
  { const a = new THREE.Mesh(new THREE.TorusGeometry(0.44, 0.03, 6, 18, Math.PI), ADD(CYAN, 0.95)); a.position.set(0, 1.25, 0.3); a.renderOrder = 53; jbG.add(a); jbTube.push(a); }
  const win = new THREE.Mesh(new THREE.CircleGeometry(0.34, 18, 0, Math.PI), new THREE.MeshBasicMaterial({ color: '#1a1830' })); win.position.set(0, 1.12, 0.305); jbG.add(win);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), new THREE.MeshBasicMaterial({ map: CT(64, 64, (c, w) => { c.fillStyle = '#0a0a0a'; c.beginPath(); c.arc(32, 32, 32, 0, 7); c.fill(); c.fillStyle = RED; c.beginPath(); c.arc(32, 32, 11, 0, 7); c.fill(); c.fillStyle = YEL; c.fillRect(30, 22, 4, 8); }), transparent: true }));
  disc.position.set(0, 1.18, 0.31); jbG.add(disc);
  const grill = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.55), new THREE.MeshBasicMaterial({ map: CT(128, 100, (c, w, h) => { c.fillStyle = '#c9a25a'; c.fillRect(0, 0, w, h); c.fillStyle = '#3a2410'; for (let x = 6; x < w; x += 10) c.fillRect(x, 0, 4, h); c.fillStyle = INK; c.fillRect(0, 0, w, 14); c.fillStyle = YEL; c.font = '900 11px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('JUKEBOX \u00b7 1 SONG FREE', 4, 7); }) }));
  grill.position.set(0, 0.45, 0.305); jbG.add(grill); colF(JB.x - 0.52, JB.x + 0.52, JB.z - 0.35, 9.7);
  const SONGS = [
    { n: 'A1 \u00b7 STRIKE IT RICH', r: 261.63, bpm: 140, m: [0, 4, 7, 12, null, 7, 12, 14, 12, null, 7, 4, 5, 7, 4, null], b: [0, null, 0, null, -5, null, -5, null, -3, null, -3, null, -7, null, -5, null] },
    { n: 'B4 \u00b7 LANE FOUR LOVE', r: 293.66, bpm: 100, m: [7, null, 5, 4, 2, null, 4, null, 0, 2, 4, 7, 9, null, 7, null], b: [0, null, 7, null, -3, null, 4, null, -7, null, 0, null, -5, null, 2, null] },
    { n: 'C2 \u00b7 COSMIC GUTTER', r: 220, bpm: 150, m: [0, 0, 12, 0, 10, 0, 7, null, 0, 0, 12, 0, 15, 14, 12, null], b: [0, 0, 0, 0, -2, -2, -2, -2, -4, -4, -4, -4, -5, -5, -5, -5] },
    { n: 'D7 \u00b7 SEVEN-TEN SPLIT', r: 246.94, bpm: 120, m: [0, null, 3, 5, 7, null, 10, 7, 12, null, 10, 7, 5, 3, 0, null], b: [0, null, null, 0, -2, null, null, -2, -4, null, null, -4, -5, null, -7, null] }];
  let songI = 0, songT = 0;
  function playSong() { const S = SONGS[songI++ % SONGS.length], step = 60 / S.bpm / 2; let at = 0;
    for (let rep = 0; rep < 2; rep++) for (let i = 0; i < 16; i++, at += step) { const n = S.m[i], bn = S.b[i]; if (n != null) tone(S.r * Math.pow(2, n / 12), 0.03, step * 0.9, 'square', at); if (bn != null) tone(S.r / 2 * Math.pow(2, bn / 12), 0.045, step * 0.95, 'triangle', at); }
    songT = at + 0.2; return S.n; }
  const nearJB = P => Math.hypot(P.x - JB.x, P.z - (JB.z - 1.0)) < 1.15, nearSW = P => Math.hypot(P.x - SW.x, P.z - SW.z) < 1.1 && P.z < -9.45;
  // ================= FOXES: shared looks + poses =================
  const FURS = [{}, { fur: '#8a6a4a', furDark: '#5f4630', muzzle: '#ece0d0' }, { fur: '#a86a9a', furDark: '#7a4a70', muzzle: '#f4e4f0', lashes: 1 }, { fur: '#5a4a3a', furDark: '#3a2e22' }, { fur: '#c9743a', furDark: '#9a5426' }, { elder: 1 }];
  const LOOKS = [['#f97316', '#fff0e0', '#b05a1e', 'vest'], ['#5a8ac8', '#3d6aa0', '#2a4a70', 'coat'], ['#c75b9b', '#9a4078', '#6a2a50', 'dress', 1], ['#3f7a52', '#e9dcc4', '#22382a', 'vest'],
    ['#ffd23a', '#5c6670', INK, 'vest'], ['#7c3aed', '#ede9fe', '#4c1d95', 'coat'], ['#e07a30', '#fff0e0', '#b05a1e', 'dress', 1], ['#0e7fb8', '#e0f2fe', '#0b3a52', 'coat'], ['#52525b', '#e6ecf4', '#27272a', 'suit']];
  const mkFox = (key, lk, i, opt = {}) => { const f = kit.makeFox({ key, torso: lk.slice(0, 3), outfit: lk[3], female: !!lk[4], mood: i % 3 ? 'happy' : 'warm', look: FURS[i % FURS.length], ...opt }); f.visible = false; f.userData.ph = Math.random() * 10; LG.add(f); return f; };
  const Pof = f => f && f.userData && f.userData.P;
  // s624 JOINTED SEATED: casino SEAT legs (hips where the old pose had them), fans throw both fists up + cheer, diners lift a bite to the mouth
  const sitJ = (f, t, arm) => { const D = neutralD(), ph = f.userData.ph || 0; D.l = [[0.03, 0.44, 0.2], [0.03, 0.44, 0.2]]; D.lpole = [[0, 0.3, 1], [0, 0.3, 1]]; D.lean = 0.06; D.mood = 'happy';
    D.a = [[0.04, -0.36, 0.25], [0.04, -0.36, 0.25]]; D.palm = [[-0.3, 1, 0.2], [-0.3, 1, 0.2]]; D.g = [0.4, 0.4]; D.head = [0.05, Math.sin(t * 0.4 + ph) * 0.35, 0];
    if (arm === 'cheer') { const w = Math.sin(t * 9); D.a = [[0.2, 0.6 + 0.04 * w, 0.08], [0.2, 0.6 - 0.04 * w, 0.08]]; D.pole = [[0.6, -0.5, 0], [0.6, -0.5, 0]]; D.g = [1, 1]; D.palm = [[0, 0, 1], [0, 0, 1]]; D.mood = 'excited'; D.mp = { open: 0.7, smile: 0.9, teeth: 0.7, wide: 0.7 }; D.head[0] = -0.15; D.hop = 0.03 * Math.abs(w); }
    else if (arm === 'eat') { const k = (t + ph) % 7, b = k > 5.6 ? Math.sin((k - 5.6) / 1.4 * Math.PI) : 0; D.a[1] = [0.1 - 0.08 * b, -0.34 + 0.4 * b, 0.26 + 0.06 * b]; D.g[1] = 0.7; D.palm[1] = [-1, 0.2, 0.3]; D.head[0] = 0.12 - 0.1 * b; D.mp = b > 0.6 ? { open: 0.4, round: 0.4 } : null; }
    applyD(THREE, f, D, t, 1); };
  const sit = (f, dt, t, arm) => { kit.animFox(f, dt, 0, false); const P = Pof(f); if (!P) return; if (P.fore) { sitJ(f, t, arm); return; } if (P.legs) P.legs.forEach(l => { l.rotation.x = -1.45; }); if (!P.fore && P.hero && P.body) P.body.position.y = -P.hero.dL; if (P.head) P.head.rotation.y = Math.sin(t * 0.4 + f.userData.ph) * 0.35;
    if (P.arms && arm === 'cheer') P.arms.forEach((a, k) => { a.rotation.x = -2.7 + Math.sin(t * 9 + k) * 0.25; a.rotation.z = (k ? 1 : -1) * 0.3; });
    else if (P.arms && arm === 'eat' && P.arms[1]) { const k = (t + f.userData.ph) % 7, b = k > 5.6 ? Math.sin((k - 5.6) / 1.4 * Math.PI) : 0; P.arms[1].rotation.x = -0.7 - b * 1.4; } };
  // ================= ROSTER BOWLERS (lanes 1-3) + LEAGUE NIGHT =================
  const IM = lanes && lanes.pinIM, pbase = i => (lanes && lanes.pinBase ? lanes.pinBase(i) : -1);
  const m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), v4 = new THREE.Vector3(), S1 = new THREE.Vector3(1, 1, 1), S0 = new THREE.Vector3(0, 0, 0);
  const pinXZ = (li, n) => { let k = 0; for (let r = 0; r < 4; r++) for (let c = 0; c <= r; c++) if (k++ === n) return [142 + r * 0.28 * PS, LZ[li] + (c - r / 2) * 0.32 * PS]; return [142, LZ[li]]; };
  function pinsUp(li) { const b = pbase(li); if (!IM || b < 0) return; for (let n = 0; n < 10; n++) { const [x, z] = pinXZ(li, n); IM.setMatrixAt(b + n, m4.makeTranslation(x, 0.105, z)); } IM.instanceMatrix.needsUpdate = true; }
  function pinsKnock(li, strike) { const b = pbase(li); if (!IM || b < 0) return; const ids = [...Array(10).keys()].sort(() => Math.random() - 0.5), k = strike ? 10 : 3 + (Math.random() * 6 | 0);
    ids.slice(0, k).forEach(n => { const [x, z] = pinXZ(li, n); if (Math.random() < (strike ? 0.45 : 0.25)) m4.compose(v4.set(x, 0.1, z), q4.identity(), S0);
      else { e4.set(rnd(-0.3, 0.3), rnd(0, 6.28), -1.5); q4.setFromEuler(e4); m4.compose(v4.set(x + rnd(0.1, 0.5), 0.19, Math.max(LZ[li] - 0.9, Math.min(LZ[li] + 0.9, z + rnd(-0.3, 0.3)))), q4, S1); } IM.setMatrixAt(b + n, m4); });
    IM.instanceMatrix.needsUpdate = true; }
  const TEAMS = [{ n: 'PIN PALS', t: [RED, INK, '#7a1a0a', 'vest'], ball: RED }, { n: 'ALLEY CATS', t: ['#14b8a6', WHITE, '#0f5e57', 'vest'], ball: '#14b8a6' }];
  const ballGeo = new THREE.SphereGeometry(0.15, 14, 10), X0 = 123.4, XR = 125.9, REL = 126.3, LANE_ORDER = [0, 2, 1];
  const patch = f => { const P = Pof(f); if (P && P.body) { box(P.body, 0.1, 0.1, 0.02, WHITE, -0.14, 0.95, 0.31); box(P.body, 0.3, 0.06, 0.02, WHITE, 0, 0.75, -0.31); } };
  const BOWL = {};
  const getB = (li, league) => { const key = (league ? 'L' : 'D') + li; if (BOWL[key]) return BOWL[key]; const team = league ? [0, 1, 0][li] : -1;
    const lk = league ? TEAMS[team].t : LOOKS[li], f = mkFox('lnRos' + key, lk, li + (league ? 3 : 0), { joints: true }); if (league) patch(f);
    const bc = league ? TEAMS[team].ball : ['#7c3aed', '#22c55e', '#f472b6'][li], mat = new THREE.MeshPhongMaterial({ color: bc, shininess: 110, specular: 0x999999 });
    const ball = new THREE.Mesh(ballGeo, mat); ball.visible = false; LG.add(ball); const held = new THREE.Mesh(ballGeo, mat); const P = Pof(f); if (P && P.arms && P.arms[1]) { held.position.set(0, -0.52, 0.1); P.arms[1].add(held); }
    return (BOWL[key] = { li, f, ball, held, team, t: Math.random() * 7, dur: 11 + Math.random() * 2, rel: false, hit: false, reset: false, on: false }); };
  function bTick(B, dt, t, P) { B.t += dt; const u = B.t, f = B.f, z = LZ[B.li], Q = Pof(f); let sp = 0, x = X0, ry = Math.PI / 2;
    if (u >= 2 && u < 3.3) { x = X0 + (XR - X0) * (u - 2) / 1.3; sp = 2.2; } else if (u >= 3.3 && u < 6.4) x = XR; else if (u >= 6.4 && u < 8.2) { x = XR - (XR - X0) * (u - 6.4) / 1.8; sp = 1.6; ry = -Math.PI / 2; }
    f.position.set(x, 0, z); f.rotation.y = ry; kit.animFox(f, dt, sp, false);
    // s632 (Ben: "did you add our bowling animation?"): the roster + league bowlers on lanes 1-3 bowl with the lab's BOWLING: STRIKE moves
    // (same timing map as Dash, worlds/meru-bowler.js): set, push-away + swing on the approach, release at the ankle as the ball leaves,
    // follow-through + body English while it rolls, the strike celebration (or a slump on a leave), walking back keeps the walk
    if (Q && Q.fore) { const mT = (c, a0, a1, b0, b1) => b0 + (b1 - b0) * Math.max(0, Math.min(1, (c - a0) / (a1 - a0))); let D = null;
      if (u >= 1.4 && u < 2) D = sampleAnim('bowl', mT(u, 1.4, 2, 0.2, 0.8)); else if (u >= 2 && u < 3.3) D = sampleAnim('bowl', mT(u, 2, 3.3, 0.8, 2.38));
      else if (u >= 3.3 && u < 6.4) { if (!B.hit) D = sampleAnim('bowl', mT(u, 3.3, 5.0, 2.42, 4.4)); else if (B.strike) D = sampleAnim('bowl', mT(u, B.hitU, Math.min(6.4, B.hitU + 1.3), 4.55, 5.85)); else { D = sampleAnim('bowl', 4.3); D.mood = 'sad'; D.mp = { smile: -0.5, press: 0.3 }; D.head = [0.3, 0, 0]; } }
      if (D) { D.fwd = 0; D.rb = 0; D.hr = ''; D.hl = ''; D.mark = ''; applyD(THREE, f, D, u, 1); B.posed = true; } else if (B.posed) { B.posed = false; endPose(f); } }
    else if (Q && Q.arms && Q.arms[1] && u >= 2 && u < 4.2) { let a; if (u < 3.3) { const s = (u - 2) / 1.3; a = s < 0.6 ? 1.2 * s / 0.6 : 1.2 - 2.3 * (s - 0.6) / 0.4; } else a = -1.1 + (u - 3.3) * 0.5; Q.arms[1].rotation.x = a; }
    B.held.visible = u < 3.3 || u > 9.2;
    if (u >= 3.3 && !B.rel) { B.rel = true; B.bx = REL; B.cv = rnd(-0.45, 0.45); B.ball.visible = true; }
    if (B.ball.visible) { B.bx += dt * 6.6; const k = (B.bx - REL) / (141.8 - REL); B.ball.position.set(B.bx, 0.255, z + Math.sin(k * Math.PI) * B.cv); B.ball.rotation.z -= dt * 30;
      if (B.bx >= 141.8) { B.ball.visible = false; B.hit = true; const strike = Math.random() < (B.team >= 0 ? 0.4 : 0.3); B.strike = strike; B.hitU = u; pinsKnock(B.li, strike);
        const v = Math.max(0.15, 1 - Math.hypot(P.x - 142, P.z - z) / 32); noise(0.32, 0.05 * v, 1600); for (let i = 0; i < 5; i++) tone(rnd(700, 1400), 0.025 * v, 0.06, 'triangle', i * 0.045);
        if (strike) { show([B.li >> 1], 'STRIKE!'); cheer(B.team); } } }
    if (u >= 8.9 && !B.reset) { B.reset = true; pinsUp(B.li); }
    if (u >= B.dur) { B.t = 0; B.rel = B.hit = B.reset = false; B.dur = 10.5 + Math.random() * 3; } }
  const B_off = B => { B.on = false; B.f.visible = false; B.ball.visible = false; B.t = Math.random() * 2; B.rel = B.hit = B.reset = false; pinsUp(B.li); };
  const league = () => { const h = hr(); return h >= 18 && h < 23.5; };
  const rosterN = h => (league() ? (touch ? 2 : 3) : h >= 10 && h < 14 ? 1 : h >= 14 && h < 18 ? 2 : (h >= 23.5 || h < 1) ? 1 : 0);
  let rKey = '';
  function rosterSet(n, lg) { const k = n + '|' + lg; if (k === rKey) return; rKey = k; const want = new Set(LANE_ORDER.slice(0, n).map(li => (lg ? 'L' : 'D') + li));
    for (const key in BOWL) if (!want.has(key) && BOWL[key].on) B_off(BOWL[key]); want.forEach(key => { const B = getB(+key.slice(1), lg); if (!B.on) { B.on = true; B.f.visible = true; } }); }
  const FANS = [[PAIRS[0] - 0.7, 0], [PAIRS[0] + 0.7, 1], [PAIRS[1] - 0.7, 0], [PAIRS[1] + 0.7, 1]].slice(0, touch ? 2 : 4).map(([z, team], i) => ({ z, team, f: null, ch: 0, i }));
  function cheer(team) { FANS.forEach(F => { if (F.f && F.f.visible && (team < 0 || F.team === team)) F.ch = 2.2; }); }
  function fansSet(on) { FANS.forEach(F => { if (on && !F.f) { F.f = mkFox('lnFan' + F.i, TEAMS[F.team].t, F.i + 6, { joints: true }); patch(F.f); F.f.position.set(119.75, 0.04, F.z); F.f.rotation.y = Math.PI / 2; } if (F.f) F.f.visible = on; }); }
  // ================= DINER CUSTOMERS (high-table stools) + KIDS' PARTY =================
  const TABLES = [[127, 2], [135, 2], [112, 2], [118, 2], [112, 6.5], [118, 6.5]], SEATS = [];
  TABLES.forEach(([x, z], ti) => { for (const s of [-1, 1]) SEATS.push({ x: x + s * 0.8, z, ry: s < 0 ? Math.PI / 2 : -Math.PI / 2, ti, fx: x + s * 0.28 }); });
  { let s = 11; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = SEATS.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [SEATS[i], SEATS[j]] = [SEATS[j], SEATS[i]]; } }
  const FOOD = SEATS.map((S, i) => { const g = new THREE.Group(); g.position.set(S.fx, 1.045, S.z); g.visible = false; LG.add(g); cyl(g, 0.12, 0.12, 0.015, WHITE, 0, 0, 0, 12);
    if (i % 3 === 0) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 6), LM('#b8733f')); b.scale.y = 0.6; b.position.y = 0.04; g.add(b); } else if (i % 3 === 1) { for (let k = 0; k < 5; k++) box(g, 0.012, 0.08, 0.012, YEL, rnd(-0.04, 0.04), 0.045, rnd(-0.04, 0.04)); } else cyl(g, 0.04, 0.035, 0.16, '#f472b6', 0, 0.085, 0, 10);
    return g; });
  const DCUST = [], MAXD = touch ? 4 : 8;
  const party = () => { const h = hr(); return h >= 13 && h < 17; };
  const dinerN = h => Math.min(MAXD, h >= 11 && h < 14 ? 5 : h >= 17 && h < 22 ? 7 : h >= 7 && h < 11 ? 2 : h >= 14 && h < 17 ? 3 : h >= 22 ? 3 : 0);
  let dKey = '';
  function dinerSet(n, pt) { const k = n + '|' + pt; if (k === dKey) return; dKey = k; const free = SEATS.map((S, i) => i).filter(i => !(pt && SEATS[i].ti >= 4)).slice(0, n);
    SEATS.forEach((S, i) => { FOOD[i].visible = false; }); DCUST.forEach(f => { f.visible = false; });
    free.forEach((si, j) => { const S = SEATS[si]; const f = DCUST[j] || (DCUST[j] = mkFox('lnDin' + j, LOOKS[(j + 4) % LOOKS.length], j + 2, { joints: true })); f.position.set(S.x, 0.35, S.z); f.rotation.y = S.ry; f.visible = true; FOOD[si].visible = true; }); }
  const PT = new THREE.Group(); PT.visible = false; LG.add(PT); const KIDS = [];
  { const [ax, az] = TABLES[4], [bx, bz] = TABLES[5];
    const cake = new THREE.Group(); cake.position.set(ax, 1.045, az); PT.add(cake); cyl(cake, 0.2, 0.2, 0.14, WHITE, 0, 0.07, 0, 16); cyl(cake, 0.205, 0.205, 0.03, '#f472b6', 0, 0.13, 0, 16);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; cyl(cake, 0.012, 0.012, 0.08, ['#38bdf8', YEL, '#7cff9b', PINK][i], Math.sin(a) * 0.1, 0.18, Math.cos(a) * 0.1, 6); const fl = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.04, 6), new THREE.MeshBasicMaterial({ color: '#ffb04a' })); fl.position.set(Math.sin(a) * 0.1, 0.24, Math.cos(a) * 0.1); cake.add(fl); }
    box(PT, 0.22, 0.18, 0.22, RED, bx - 0.1, 1.135, bz); box(PT, 0.23, 0.03, 0.04, YEL, bx - 0.1, 1.2, bz); box(PT, 0.16, 0.14, 0.16, '#14b8a6', bx + 0.18, 1.115, bz + 0.1);
    const BAL = [PINK, '#38bdf8', YEL, '#7cff9b', RED, UV]; let bi = 0;
    for (const [tx, tz] of [[ax, az], [bx, bz]]) for (const [dx, dz] of [[-0.25, 0.3], [0.2, 0.32], [0, 0.4]]) { const by = 2.0 + (bi % 3) * 0.18; cyl(PT, 0.004, 0.004, by - 1.05, '#e6e1d3', tx + dx, (by + 1.05) / 2, tz + dz, 4);
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), new THREE.MeshPhongMaterial({ color: BAL[bi % 6], shininess: 90 })); b.scale.y = 1.15; b.position.set(tx + dx, by + 0.18, tz + dz); b.userData.y = by + 0.18; b.userData.ph = bi; PT.add(b); KIDS.push({ bal: b }); bi++; }
    const ban = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.7), new THREE.MeshBasicMaterial({ transparent: true, map: CT(840, 140, (c, w, h) => { c.clearRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 8); c.quadraticCurveTo(w / 2, 40, w, 8); c.stroke();
      for (let i = 0; i < 14; i++) { const x = 20 + i * 58, y = 8 + Math.sin(i / 13 * Math.PI) * 14; c.fillStyle = BAL[i % 6]; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y); c.lineTo(x + 20, y + 40); c.closePath(); c.fill(); }
      c.fillStyle = INK; c.fillRect(150, 66, 540, 64); c.fillStyle = YEL; c.font = '900 46px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText('HAPPY BIRTHDAY!', 172, 100); }) }));
    ban.position.set(115, 3.35, 9.52); ban.rotation.y = Math.PI; PT.add(ban); }
  const KIDSPOT = [[4, 0.3], [4, 2.6], [4, -2.4], [5, 0.3], [5, 2.7], [5, -2.5]].slice(0, touch ? 3 : 6);
  let kidsMade = false, parent = null, cheerKT = 4;
  function makeKids() { if (kidsMade) return; kidsMade = true; const HAT = [PINK, '#38bdf8', YEL, '#7cff9b', RED, UV];
    KIDSPOT.forEach(([ti, a], i) => { const [tx, tz] = TABLES[ti], f = mkFox('lnKid' + i, LOOKS[(i * 2) % LOOKS.length], i, { joints: true }); LG.remove(f); PT.add(f); f.visible = true; f.scale.setScalar(0.62);
      f.position.set(tx + Math.sin(a) * 0.75, 0, tz + Math.cos(a) * 0.75); f.rotation.y = a + Math.PI; const P = Pof(f); if (P && P.head) { const h = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.24, 8), LM(HAT[i % 6])); h.position.y = 0.42; P.head.add(h); } KIDS.push({ f }); });
    parent = mkFox('lnPartyMum', LOOKS[6], 2); LG.remove(parent); PT.add(parent); parent.visible = true; parent.position.set(115, 0, 5.2); parent.rotation.y = 0; }
  // ================= per frame =================
  let k = 0, wasIn = false, hT = 0, entryToast = false, clT = 3, chT = 0;
  function tick(dt, P) { const t = performance.now() / 1000, here = inRoom(P), busyJ = !!(jobBusy && jobBusy());
    if (here !== wasIn) { wasIn = here; LG.visible = here; if (!here) { for (const key in BOWL) if (BOWL[key].on) B_off(BOWL[key]); rKey = ''; if (pinsLit) pinGlow(false); k = 0; dark.visible = false; entryToast = false; } }
    if (!here) return;
    if ((hT -= dt) <= 0) { hT = 2; const h = hr(), lg = league(); rosterSet(busyJ ? 0 : rosterN(h), lg); fansSet(lg && !busyJ); const pt = party(); dinerSet(dinerN(h), pt); if (pt) makeKids(); PT.visible = pt; mineRefresh();
      const m = mode(); swLamp.material.color.set(m === 'on' ? '#7cff9b' : m === 'off' ? RED : st('Glow', false) ? YEL : '#3a3448'); lever.rotation.x = m === 'on' ? -0.6 : m === 'off' ? 0.6 : 0; }
    // glow fade
    const want = glowWanted() && !busyJ; k = Math.max(0, Math.min(1, k + (want ? dt : -dt) * 1.2));
    if (want && k > 0.5 && !entryToast) { entryToast = true; toast('COSMIC GLOW BOWLING', 2.4); } if (!want) entryToast = false;
    dark.visible = k > 0.01; dark.material.opacity = 0.62 * k; GLOW.forEach(m => { m.material.opacity = m.userData.op * k; m.visible = k > 0.01 && !m.userData.off; });
    if (k > 0.4) { if ((scanT -= dt) <= 0) { scanT = 3; if (pinsLit) pinGlow(false); scanPins(); pinGlow(true); } } else if (pinsLit) { pinGlow(false); scanT = 0; }
    // disco + show
    burst = Math.max(0, burst - dt); const bk = Math.min(1, burst / 0.6), sk = Math.max(k * 0.75, bk), spin = 0.35 + bk * 1.4;
    dball.rotation.y += dt * spin; flare.material.opacity = Math.max(k * (0.5 + 0.3 * Math.sin(t * 7)), bk);
    SPOTS.forEach(s => { s.visible = sk > 0.02; if (!s.visible) return; const u = s.userData; u.a += dt * spin * u.w; const x = 133 + Math.cos(u.a) * u.r, z = ZC + Math.sin(u.a) * u.r * 1.1; s.position.set(Math.max(106, Math.min(144, x)), x > FOUL && x < LEND && z < -15 ? 0.13 : 0.095, z); s.material.opacity = sk; });
    TUBES.forEach((m, i) => { if (bk > 0) m.material.color.setHSL((t * 1.5 + i * 0.33) % 1, 1, 0.6); else m.material.color.set(UV); });
    if ((shT -= dt) <= 0) shT = 0.08;
    SH.forEach((S, i) => { S.t = Math.max(0, S.t - dt); S.m.visible = S.t > 0; if (S.t > 0 && shT === 0.08) drawShow(S, t); const on = S.t > 0 && (t * 6 | 0) % 2 === 0; for (const li of [i * 2, i * 2 + 1]) { DECK[li].visible = S.t > 0; DECK[li].material.opacity = on ? 0.55 : 0.2; } });
    // neon flicker + buzz
    NEON.forEach(N => { if (!N.flick) { N.m.material.opacity = 1; return; } if (N.f > 0) { N.f -= dt; N.m.material.opacity = Math.random() < 0.5 ? 0.12 : 1; if (N.f <= 0) N.m.material.opacity = 1; }
      else if ((N.ft -= dt) <= 0) { N.ft = rnd(6, 16); N.f = rnd(0.4, 0.9); if (Math.hypot(P.x - N.x, P.z - N.z) < 13) { tone(120, 0.014, N.f, 'sawtooth'); noise(N.f * 0.6, 0.008, 4000); } } });
    CHASE.forEach(C => { const on = ((t * 8 | 0) - C.i) % 4 === 0; C.m.material.color.set(on ? YEL : [PINK, CYAN][C.i % 2]); C.m.material.opacity = on ? 1 : 0.5; });
    // pinsetter clatter behind the masking
    if ((clT -= dt) <= 0) { clT = rnd(5, 12); const v = Math.max(0.2, Math.min(1, (P.x - 108) / 30)); noise(0.2, 0.022 * v, 1800); for (let i = 0; i < 4; i++) tone(rnd(800, 1300), 0.012 * v, 0.05, 'square', 0.08 + i * 0.06); tone(90, 0.03 * v, 0.3, 'sine', 0.4); }
    // jukebox lights
    if (songT > 0) songT -= dt; const jp = songT > 0 ? 6 : 1.2; jbTube.forEach((m, i) => m.material.color.setHSL((t * jp * 0.08 + i * 0.3) % 1, 1, 0.6)); if (songT > 0) disc.rotation.z -= dt * 3.5;
    // people
    for (const key in BOWL) { const B = BOWL[key]; if (B.on) bTick(B, dt, t, P); }
    FANS.forEach(F => { if (!F.f || !F.f.visible) return; F.ch = Math.max(0, F.ch - dt); sit(F.f, dt, t, F.ch > 0 ? 'cheer' : null); });
    DCUST.forEach(f => f.visible && sit(f, dt, t, 'eat'));
    if (PT.visible) { cheerKT -= dt; const hop = cheerKT < 2; if (cheerKT <= 0) { cheerKT = rnd(6, 10); } if (hop && cheerKT > 1.95 && Math.hypot(P.x - 115, P.z - 6.5) < 9) [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.025, 0.18, 'triangle', i * 0.12));
      KIDS.forEach(K => { if (K.bal) { K.bal.position.y = K.bal.userData.y + Math.sin(t * 1.3 + K.bal.userData.ph) * 0.05; return; } const f = K.f; kit.animFox(f, dt, 0, false); const Q = Pof(f);
        f.position.y = hop ? Math.max(0, Math.sin(t * 8 + f.userData.ph)) * 0.12 : 0; if (Q && Q.fore) { if (hop) { applyPose(THREE, f, 'cheer', (t + f.userData.ph) % 3, 1); f.userData._kj = 1; } else if (f.userData._kj) { f.userData._kj = 0; endPose(f); } } else if (hop && Q && Q.arms) Q.arms.forEach((a, j) => { a.rotation.x = -2.6 + Math.sin(t * 8 + j) * 0.3; }); });
      if (parent) kit.animFox(parent, dt, 0, false); } }
  function prompt(P) { if (!inRoom(P)) return null; if (nearSW(P)) return st('Glow', false) ? 'GLOW SWITCH \u00b7 ' + ({ auto: 'AUTO', on: 'ON', off: 'OFF' }[mode()]) : 'GLOW SWITCH \u00b7 LOCKED'; if (nearJB(P)) return songT > 0 ? 'JUKEBOX \u00b7 NEXT SONG' : 'JUKEBOX \u00b7 PLAY A SONG'; return null; }
  function talk(P) { if (!inRoom(P)) return false;
    if (nearSW(P)) { if (!st('Glow', false)) { tone(196, 0.05, 0.25, 'square'); toast('GLOW SWITCH \u00b7 LOCKED \u00b7 DO 10 JOBS FOR MOTT', 2.6); return true; }
      const nx = { auto: 'on', on: 'off', off: 'auto' }[mode()] || 'auto'; set('GlowMode', nx); hT = 0; tone(140, 0.06, 0.12, 'square'); if (nx === 'on') { noise(0.5, 0.02, 600); tone(70, 0.05, 0.6, 'sawtooth', 0.05); }
      toast('COSMIC GLOW \u00b7 ' + (nx === 'on' ? 'ON' : nx === 'off' ? 'OFF' : 'AUTO \u00b7 9 PM - 1 AM'), 2.4); return true; }
    if (nearJB(P)) { const n = playSong(); toast('\u266A ' + n, 2.6); return true; } return false; }
  return { tick, prompt, talk, show, glowOn: () => k > 0.5, _k: () => k, _set: o => { if (o && o.burst) show([0, 1, 2], 'STRIKE!'); }, BOWL, SPOTS };
}
