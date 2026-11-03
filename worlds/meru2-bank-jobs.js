// MERU 2.0 — s80 BANK DELUXE POLISH + JOBS (Ben's picks): the Bank of Meru [meruBank] gets the interior rules, 12 job games and a deluxe look pass.
// Built in the bank's ORIGINAL frame (worlds/meru2-layout.js bank f 62..110 × -125..-80, door S (86, -80); the vault corridor under it at y -3.6,
// worlds/meru2-backrooms.js). meru2-walk.js adds API.group to the bank's moved group (RL.MV 'bank'), ticks it with the RL.P(mB) proxy, camFix in RL.camWrap.
// KEEPERS: MR. FARTHING (jolly old money fox, gold watch chain, coin facts) = shopKit keeper, upstairs jobs + menu · TUMBLER (the vault fox, bankVault from
// worlds/meru2-civic.js, moved downstairs) runs the 3 vault-corridor jobs + receives the cash cart. The teller (bankTeller) keeps deposit / withdraw.
// JOBS (gentle, stars by mistakes 0 = 3, ≤ 2 = 2): TELLER (count out exact change, count a deposit) · COIN SORTER (drag coins into tubes, roll them) ·
// SPOT THE FAKE (hold for UV: stripe + watermark) · SAFE-DEPOSIT (find the box, bank key then theirs, drawer to the table) · OPEN THE VAULT (dial R-L-R, bolts,
// spin the wheel) · CASH CART RUN (walk: the cart rolls behind you, down the stairs to the cage) · GOLD BARS (weigh, keep or recast, stamp, stack) ·
// CHEQUE CHECK (signature + words = number, pay or refuse) · NEW ACCOUNT (fill the form from what they say, stamp) · ATM REFILL (outside: cassettes to their
// colour, shut, test) · PIGGY BANK DAY (pop the cork, count the coins, junior passbook) · LOCK-UP (walk: shutters, lamps, then the alarm in order).
// PRIZES: 1st clear BANKER'S WAISTCOAT + green visor (worn + Tailor wardrobe) · 2 jobs COIN CHOCOLATES ×3 (+30 HP) · 3 jobs STAFF RATE 3 % a day (bkRate,
// worlds/meru2-law.js) · 5 jobs +6 LOCKER SLOTS (bkSlots) · 8 jobs GOLDEN PIGGY BANK (Home shelf) · all 12 STAMPED GOLD INGOT (Home shelf) + 60 gold.
// LOOK: painted coffered SKYLIGHT (sky by the hour) + sunbeam, BRASS REVOLVING DOOR inside the front doors, the VAULT door opens at 9 and shuts at 18 (red lights
// at night), GOLD + INTEREST TICKER over the counter, NOW SERVING queue display + ding, 8 GATES world clocks, coin WISHING WELL, outside ATM + NIGHT DEPOSIT,
// coin twinkles + dust in the sunbeam.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { dueAt, rosterFoxes, ROSTER } from './meru2-roster.js';
export function buildBankJobs({ THREE, scene, kit, cols, save, law, touch, sayTo, camera, wear, hour, isMuted, refs }) {
  const X0 = 62, X1 = 110, Z0 = -125, Z1 = -80, Y = -3.6, CEIL = 8.95;
  const G = new THREE.Group(); G.name = 'bankJobs'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; }, pickR = a => a[Math.random() * a.length | 0];
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 10, 8), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const S = mk(), SD = mk(), GLO = mk();   // S = upstairs + outside, SD = the vault corridor (renderOrder -2 like the backrooms)
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const redrawT = (t, fn) => { const c = t.userData.c; fn(c.getContext('2d'), c.width, c.height); t.needsUpdate = true; };
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 10) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const plane = (map, w, h, x, y, z, ry = 0, par = G, extra = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...extra })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const flatP = (map, w, h, x, y, z, ry = 0, extra = {}) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, ...extra })); m.position.set(x, y, z); m.rotation.set(-Math.PI / 2, ry, 0, 'YXZ'); G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const ringC = (x, z, r, y0, y1) => cols.push(y0 == null ? { c: [x, z, r] } : { c: [x, z, r], y0, y1 }), rect = (a, b, c2, d, y0, y1) => cols.push(y0 == null ? { f: [a, b, c2, d] } : { f: [a, b, c2, d], y0, y1 });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GREEN = '#2f7a4a', BLUE = '#2f6fd6', GOLD = '#c9a227', BR = '#b08d3c', BANKG = '#1f5a3e', STEEL = '#9aa0a6', DSTEEL = '#5c6670', WOOD = '#5a3d26', MARBLE = '#ece6d8', BARG = '#e0b23a';
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const pts = (list, size, color, op, add = true) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(list.flat()), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ map: glowT, size, color, transparent: true, opacity: op, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); p.frustumCulled = false; G.add(p); return p; };
  const hour0 = () => (hour ? hour() : 12), isNight = () => { const h = hour0(); return h >= 20 || h < 6; };
  // ================= money: coins + notes =================
  const COIN = { 1: { c: '#b87333', r: 0.045, n: 'COPPER' }, 5: { c: '#c9ced3', r: 0.055, n: 'SILVER' }, 10: { c: BARG, r: 0.065, n: 'GOLD' } };
  const NOTE = { 5: '#4f8a5c', 10: '#2f6fd6', 20: '#c42d3c', 50: '#7c4dc4' }, noteTx = {};
  const noteTex = v => noteTx[v] || (noteTx[v] = CT(128, 64, (g, W, H) => { g.fillStyle = NOTE[v]; g.fillRect(0, 0, W, H); g.strokeStyle = '#f3f2f2'; g.lineWidth = 4; g.strokeRect(5, 5, W - 10, H - 10); g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(v + ' G', 14, H / 2 + 2); g.beginPath(); g.arc(W - 26, H / 2, 13, 0, 7); g.fill(); }));
  const coinMesh = v => { const m = new THREE.Mesh(new THREE.CylinderGeometry(COIN[v].r, COIN[v].r, 0.014, 16), new THREE.MeshPhongMaterial({ color: COIN[v].c, shininess: 80, specular: 0x886622 })); m.userData.v = v; return m; };
  const noteMesh = v => { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ map: noteTex(v), side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; g.add(m); g.userData.v = v; return g; };
  const cashMesh = v => (v === 1 ? coinMesh(1) : noteMesh(v));
  // ================= the deluxe look =================
  // --- SKYLIGHT: a painted coffered ring round a glass oculus; the sky inside follows the hour; a sunbeam by day ---
  const SKX = 86, SKZ = -90, SKR = 4.2;
  const skyDay = CT(256, 256, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 10, W / 2, W / 2, W / 2); r.addColorStop(0, '#d8efff'); r.addColorStop(1, '#6fb0e6'); g.fillStyle = r; g.fillRect(0, 0, W, W); g.fillStyle = 'rgba(255,255,255,0.75)'; for (const [x, y, s] of [[70, 90, 34], [110, 80, 26], [170, 160, 40], [150, 175, 28], [60, 190, 22]]) { g.beginPath(); g.arc(x, y, s, 0, 7); g.arc(x + s * 0.9, y + 4, s * 0.8, 0, 7); g.fill(); } });
  const skyNight = CT(256, 256, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 10, W / 2, W / 2, W / 2); r.addColorStop(0, '#24345e'); r.addColorStop(1, '#0d1430'); g.fillStyle = r; g.fillRect(0, 0, W, W); g.fillStyle = '#ffffff'; for (let i = 0; i < 70; i++) { const s = Math.random() < 0.15 ? 2.4 : 1.2; g.fillRect(Math.random() * W, Math.random() * W, s, s); } g.fillStyle = '#fff4d0'; g.beginPath(); g.arc(178, 74, 16, 0, 7); g.fill(); });
  const skyM = new THREE.MeshBasicMaterial({ map: skyDay }), skyNM = new THREE.MeshBasicMaterial({ map: skyNight, transparent: true, opacity: 0, depthWrite: false });
  { const d = new THREE.Mesh(new THREE.CircleGeometry(SKR, 48), skyM); d.rotation.x = Math.PI / 2; d.position.set(SKX, CEIL - 0.06, SKZ); G.add(d); const n = new THREE.Mesh(new THREE.CircleGeometry(SKR, 48), skyNM); n.rotation.x = Math.PI / 2; n.position.set(SKX, CEIL - 0.07, SKZ); n.renderOrder = 1; G.add(n); }
  const cofT = CT(1024, 128, (g, W, H) => { g.fillStyle = '#1d2c52'; g.fillRect(0, 0, W, H); g.fillStyle = GOLD; g.fillRect(0, 0, W, 8); g.fillRect(0, H - 8, W, 8); for (let i = 0; i < 16; i++) { const x = i * W / 16; g.fillStyle = '#25386a'; g.fillRect(x + 8, 16, W / 16 - 16, H - 32); g.strokeStyle = GOLD; g.lineWidth = 4; g.strokeRect(x + 8, 16, W / 16 - 16, H - 32); g.fillStyle = i % 2 ? GOLD : '#f3d77a'; g.beginPath(); g.arc(x + W / 32, H / 2, 20, 0, 7); g.fill(); g.fillStyle = '#7a5a12'; g.font = '900 24px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(i % 2 ? '8' : 'M', x + W / 32, H / 2 + 1); } });
  { const ringG = new THREE.RingGeometry(SKR + 0.15, SKR + 1.55, 64, 1), uv = ringG.attributes.uv, p = ringG.attributes.position; for (let i = 0; i < p.count; i++) { const a = Math.atan2(p.getY(i), p.getX(i)), r = Math.hypot(p.getX(i), p.getY(i)); uv.setXY(i, (a / (Math.PI * 2) + 1) % 1 * 3, (r - SKR - 0.15) / 1.4); }
    cofT.wrapS = THREE.RepeatWrapping; const m = new THREE.Mesh(ringG, new THREE.MeshBasicMaterial({ map: cofT, side: THREE.DoubleSide })); m.rotation.x = Math.PI / 2; m.position.set(SKX, CEIL - 0.05, SKZ); G.add(m); }
  for (const R of [SKR, SKR + 0.15, SKR + 1.6]) S.put(new THREE.TorusGeometry(R, 0.07, 6, 48), SKX, CEIL - 0.1, SKZ, GOLD, 0, Math.PI / 2);
  S.put(new THREE.TorusGeometry(1.0, 0.06, 6, 32), SKX, CEIL - 0.12, SKZ, GOLD, 0, Math.PI / 2);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; S.box(0.08, 0.08, SKR - 1.0, GOLD, SKX + Math.sin(a) * (SKR + 1) / 2, CEIL - 0.12, SKZ + Math.cos(a) * (SKR + 1) / 2, a); }
  const beamM = new THREE.MeshBasicMaterial({ color: '#fff0c8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(SKR * 0.92, SKR * 0.75, CEIL - 0.2, 32, 1, true), beamM); beam.position.set(SKX, (CEIL - 0.2) / 2 + 0.05, SKZ - 1.2); beam.rotation.x = 0.12; G.add(beam);
  // --- BRASS REVOLVING DOOR just inside the front doors (wings spin as you pass; open N + S, so the walkway stays straight) ---
  const RVX = 86, RVZ = -82.6, RVR = 1.6, RVH = 3.0;
  const rvGlass = new THREE.MeshPhongMaterial({ color: 0xcfe9ff, transparent: true, opacity: 0.28, shininess: 120, depthWrite: false, side: THREE.DoubleSide });
  const RVA = []; for (const th of [Math.PI / 2, Math.PI * 1.5]) { const arc = new THREE.Mesh(new THREE.CylinderGeometry(RVR, RVR, RVH, 24, 1, true, th - 0.9, 1.8), rvGlass); arc.position.set(RVX, RVH / 2, RVZ); G.add(arc); RVA.push(arc);
    for (const e of [th - 0.9, th + 0.9]) S.cyl(0.06, 0.06, RVH, BR, RVX + Math.sin(e) * RVR, RVH / 2, RVZ + Math.cos(e) * RVR, 8); }
  S.cyl(RVR + 0.12, RVR + 0.12, 0.3, BR, RVX, RVH + 0.15, RVZ, 32); S.cyl(RVR + 0.14, RVR + 0.14, 0.04, GOLD, RVX, RVH + 0.32, RVZ, 32); S.cyl(RVR + 0.05, RVR + 0.05, 0.03, BR, RVX, 0.07, RVZ, 32);
  rect(RVX + 0.98, RVX + 1.7, RVZ - 1.3, RVZ + 1.3); rect(RVX - 1.7, RVX - 0.98, RVZ - 1.3, RVZ + 1.3);
  const wings = new THREE.Group(); wings.position.set(RVX, 0, RVZ); G.add(wings);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, w = new THREE.Group(); w.rotation.y = a; wings.add(w); const gp = new THREE.Mesh(new THREE.PlaneGeometry(RVR - 0.1, RVH - 0.2), rvGlass); gp.position.set((RVR - 0.1) / 2, RVH / 2, 0); w.add(gp);
    for (const [x, y, ww, hh] of [[(RVR - 0.1) / 2, 0.12, RVR - 0.1, 0.08], [(RVR - 0.1) / 2, RVH - 0.1, RVR - 0.1, 0.06], [RVR - 0.12, RVH / 2, 0.06, RVH - 0.2], [(RVR - 0.1) / 2, 1.05, RVR - 0.1, 0.05]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(ww, hh, 0.06), LM(BR)); b.position.set(x, y, 0); w.add(b); } }
  { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, RVH, 10), LM(BR)); c.position.y = RVH / 2; wings.add(c); }
  let rvSpin = 0;
  // --- GOLD + INTEREST TICKER over the counter, NOW SERVING display ---
  const tickT = CT(2048, 64, () => {}); tickT.wrapS = THREE.RepeatWrapping; tickT.repeat.x = 0.55;
  let tickKey = ''; const goldPrice = d => 400 + Math.round(30 * Math.sin(d * 1.7) + 14 * Math.sin(d * 0.6 + 1));
  function drawTicker() { const d = law ? law.day() : 1, bal = law ? law.bank() : 0, rate = save.stat('bkRate', false) ? 3 : 2, p = goldPrice(d), up = p >= goldPrice(d - 1), key = d + '_' + bal + '_' + rate; if (key === tickKey) return; tickKey = key;
    redrawT(tickT, (g, W, H) => { g.fillStyle = '#0d0f0c'; g.fillRect(0, 0, W, H); g.textBaseline = 'middle'; g.font = '900 36px Archivo, sans-serif'; let x = 20;
      for (const [t, c] of [['BANK OF MERU', '#ffd23a'], ['\u00b7 GOLD BAR ' + p + ' G ' + (up ? '\u25b2' : '\u25bc'), up ? '#7cff9b' : '#ff7a6a'], ['\u00b7 SAVINGS ' + rate + '% A DAY', '#ffd23a'], ['\u00b7 YOUR SAVINGS ' + bal + ' G', '#ffffff'], ['\u00b7 DAY ' + d, '#ffffff'], ['\u00b7 OPEN 9:00 \u2013 18:00', '#ffd23a'], ['\u00b7 MERU COPPER 1 \u00b7 SILVER 5 \u00b7 GOLD 10', '#ffffff'], ['\u00b7', '#ffd23a']]) { g.fillStyle = c; g.fillText(t, x, H / 2 + 2); x += g.measureText(t).width + 26; } }); }
  const TKY = 4.7; plane(tickT, 13.6, 0.44, 86, TKY, -100.3, 0); S.box(13.9, 0.62, 0.12, INK, 86, TKY, -100.38); S.box(13.96, 0.06, 0.16, GOLD, 86, TKY + 0.33, -100.38); S.box(13.96, 0.06, 0.16, GOLD, 86, TKY - 0.33, -100.38);
  for (const s of [-1, 1]) S.box(0.04, CEIL - TKY - 0.3, 0.04, BR, 86 + s * 6.4, (CEIL + TKY + 0.3) / 2, -100.38);
  const qT = CT(256, 112, () => {}); let qNum = 40 + (Math.random() * 20 | 0), qWin = 3, qT0 = 6;
  const drawQ = () => redrawT(qT, (g, W, H) => { g.fillStyle = '#0d0f0c'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd23a'; g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText('NOW SERVING', 14, 10); g.fillStyle = '#ff5a3a'; g.font = '900 52px Archivo, sans-serif'; g.fillText('A ' + String(qNum).padStart(3, '0'), 14, 34); g.fillStyle = '#ffffff'; g.font = '900 20px Archivo, sans-serif'; g.fillText('WINDOW ' + qWin, 168, 54); }); drawQ();
  plane(qT, 1.6, 0.7, 73.6, 3.1, -100.3, 0); S.box(1.72, 0.82, 0.1, INK, 73.6, 3.1, -100.37); for (const s of [-1, 1]) S.box(0.03, CEIL - 3.5, 0.03, BR, 73.6 + s * 0.7, (CEIL + 3.5) / 2, -100.37);
  // --- 8 GATES WORLD CLOCKS on a walnut rail over the front doors (Meru follows the game hour) ---
  const WORLDS = [['MERU', 0], ['GAYA', 3], ['JIDDA', -2], ['KUFA', 5], ['LUXOR', 7], ['NEBO', -4], ['UR', 9], ['ZION', -6]], CLK = [];
  S.box(38.4, 1.7, 0.1, WOOD, 86, 7.85, -80.42); S.box(38.6, 0.08, 0.16, GOLD, 86, 8.72, -80.4); S.box(38.6, 0.08, 0.16, GOLD, 86, 6.98, -80.4);
  WORLDS.forEach(([n, off], i) => { const t = CT(128, 160, () => {}), x = 69.2 + i * 4.8; CLK.push({ t, n, off }); plane(t, 0.92, 1.15, x, 7.86, -80.36, Math.PI); });
  let clkKey = '';
  function drawClocks() { const h = hour0(), key = Math.floor(h * 12); if (key === clkKey) return; clkKey = key;
    for (const c of CLK) redrawT(c.t, (g, W, H) => { const hh = ((h + c.off) % 24 + 24) % 24, a = (hh % 12) / 12 * Math.PI * 2, m = (hh % 1) * Math.PI * 2; g.clearRect(0, 0, W, H); g.fillStyle = GOLD; g.beginPath(); g.arc(64, 62, 60, 0, 7); g.fill(); g.fillStyle = hh >= 6 && hh < 19 ? '#f6f1e4' : '#1d2c52'; g.beginPath(); g.arc(64, 62, 52, 0, 7); g.fill();
      g.fillStyle = hh >= 6 && hh < 19 ? INK : '#ffd23a'; for (let k = 0; k < 12; k++) { const q = k / 12 * Math.PI * 2; g.fillRect(64 + Math.sin(q) * 44 - 2, 62 - Math.cos(q) * 44 - 2, 4, 4); }
      g.strokeStyle = g.fillStyle; g.lineCap = 'round'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 62); g.lineTo(64 + Math.sin(a) * 26, 62 - Math.cos(a) * 26); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(64, 62); g.lineTo(64 + Math.sin(m) * 40, 62 - Math.cos(m) * 40); g.stroke();
      g.fillStyle = RED; g.beginPath(); g.arc(64, 62, 5, 0, 7); g.fill(); g.fillStyle = INK; g.fillRect(4, 126, 120, 30); g.fillStyle = c.n === 'MERU' ? '#ffd23a' : '#ffffff'; g.font = '900 22px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c.n, 64, 142); }); }
  // --- COIN WISHING WELL (west of the hall): marble basin, a little jet, coins on the bottom; E = toss a coin ---
  const WX = 67.4, WZ = -90.2;
  S.cyl(1.3, 1.4, 0.7, MARBLE, WX, 0.35, WZ, 28); S.put(new THREE.TorusGeometry(1.3, 0.09, 6, 28), WX, 0.72, WZ, BR, 0, Math.PI / 2); S.cyl(0.18, 0.24, 0.9, MARBLE, WX, 0.7, WZ, 12); S.cyl(0.42, 0.3, 0.12, MARBLE, WX, 1.18, WZ, 16);
  for (let i = 0; i < 26; i++) { const a = Math.random() * 7, r = 0.35 + Math.random() * 0.7; S.cyl(0.05, 0.05, 0.01, i % 3 ? BARG : '#c9ced3', WX + Math.cos(a) * r, 0.42, WZ + Math.sin(a) * r, 10); }
  const waterM = new THREE.MeshPhongMaterial({ color: 0x5fb8d6, transparent: true, opacity: 0.55, shininess: 120, depthWrite: false });
  { const w = new THREE.Mesh(new THREE.RingGeometry(0.26, 1.22, 32), waterM); w.rotation.x = -Math.PI / 2; w.position.set(WX, 0.6, WZ); G.add(w); }
  const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.7, 8, 1, true), new THREE.MeshBasicMaterial({ color: '#cdeeff', transparent: true, opacity: 0.6, depthWrite: false })); jet.position.set(WX, 1.58, WZ); G.add(jet);
  const SPRN = 16, spray = pts([...Array(SPRN)].map(() => [WX, 1.9, WZ]), 0.08, '#e6f6ff', 0.8), sprD = [...Array(SPRN)].map((_, i) => ({ a: i / SPRN * 7, t: Math.random() }));
  ringC(WX, WZ, 1.45); { const t = CT(256, 64, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd23a'; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MAKE A WISH \u00b7 1 G', 14, H / 2 + 2); }); plane(t, 1.1, 0.28, WX + 1.42, 0.5, WZ, Math.PI / 2); }
  const WISH = ['A wish for a full belly. The well gurgles kindly.', 'A wish for sunny skies. A coin winks back.', 'A wish for the 8 Gates. The water hums.', 'A wish for Hope and Noble. Ripples spread out wide.', 'A wish for a lucky day. Something sparkles below.'];
  // --- OUTSIDE: ATM + NIGHT DEPOSIT on the front wall, east of the doors ---
  const AX = 93.8, AZ = -79.6;
  S.box(1.3, 2.2, 0.5, '#2e4a6b', AX, 1.1, AZ + 0.02); S.box(1.4, 0.1, 0.6, BR, AX, 2.25, AZ + 0.05); S.box(1.0, 0.6, 0.02, INK, AX, 1.62, AZ + 0.28); S.box(0.5, 0.3, 0.16, BR, AX + 0.15, 1.12, AZ + 0.32, 0, 0.5);
  for (let q = 0; q < 9; q++) S.box(0.08, 0.025, 0.05, '#e9e3d6', AX + 0.05 + (q % 3) * 0.1, 1.15, AZ + 0.36 - (q / 3 | 0) * 0.04, 0, 0.5); S.box(0.22, 0.03, 0.03, INK, AX - 0.32, 1.12, AZ + 0.3);
  rect(AX - 0.7, AX + 0.7, AZ - 0.25, AZ + 0.32);
  const atmT = CT(256, 160, () => {}); const atmScr = plane(atmT, 0.9, 0.52, AX, 1.62, AZ + 0.295, 0);
  const drawAtm = (l1, l2, c = '#7cff9b') => redrawT(atmT, (g, W, H) => { g.fillStyle = '#0d1d14'; g.fillRect(0, 0, W, H); g.fillStyle = c; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'top'; fitTxt(g, l1, 14, 24, W - 28, 30); g.font = '800 22px Archivo, sans-serif'; fitTxt(g, l2 || '', 14, 84, W - 28, 22, 800); }); drawAtm('BANK OF MERU', 'WELCOME \u00b7 INSERT CARD');
  const atmDoor = new THREE.Group(); atmDoor.position.set(AX - 0.6, 0, AZ + 0.29); G.add(atmDoor); { const d = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.04), LM('#24405e')); d.position.set(0.6, 0.62, 0); atmDoor.add(d); const h = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.2, 0.05), LM(BR)); h.position.set(1.08, 0.62, 0.03); atmDoor.add(h); }
  const CASS = [5, 10, 20, 50], ASLOT = CASS.map((v, i) => ({ x: AX - 0.42 + i * 0.28, y: 0.62, z: AZ + 0.2 }));
  for (const s of ASLOT) S.box(0.24, 0.5, 0.02, INK, s.x, s.y, AZ + 0.12);
  const NDX = 91.6; S.box(0.7, 0.9, 0.12, BR, NDX, 1.35, AZ - 0.17); S.box(0.5, 0.1, 0.04, INK, NDX, 1.55, AZ - 0.1); S.box(0.56, 0.06, 0.1, GOLD, NDX, 1.62, AZ - 0.08);
  { const t = CT(256, 96, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = '#ffd23a'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NIGHT DEPOSIT', 14, 32); g.fillStyle = '#ffffff'; g.font = '800 20px Archivo, sans-serif'; g.fillText('E \u00b7 BANK ALL YOUR GOLD', 14, 70); }); plane(t, 0.7, 0.26, NDX, 1.05, AZ - 0.1, 0); }
  // --- VAULT: door by the hour (open 9-18), red lights + a red strip when shut at night; coin twinkles on the gold ---
  const VD = refs && refs.door, VC = V(92.6, 2.6, -112.4); let doorA = VD ? VD.rotation.y : -1.2, doorJob = null, holdOpen = 0;
  const redStrip = new THREE.Mesh(new THREE.BoxGeometry(14, 0.08, 0.06), new THREE.MeshBasicMaterial({ color: '#ff2a1a' })); redStrip.position.set(97, 4.1, -111.9); redStrip.visible = false; G.add(redStrip);
  const RLT = pts([90.4, 93.2, 96, 98.8, 101.6, 104].map(x => [x, 4.1, -111.8]), 0.9, '#ff3a2a', 0.9); RLT.visible = false;
  const TW1 = pts([...Array(14)].map(() => [rnd(94, 102.6), rnd(0.35, 0.95), rnd(-120.2, -116.2)]), 0.12, '#fff3b0', 1), TW2 = pts([...Array(10)].map(() => [WX + rnd(-0.8, 0.8), 0.62, WZ + rnd(-0.8, 0.8)]), 0.1, '#fff3b0', 1);
  // vault door parts we animate (children of the civic door group): combination dial, 8 bolt heads, a spinning wheel
  let dialM = null, BOLTS = [], wheel = null; const DIALL = V(3.55, -1.05, 0.34);
  if (VD) { const dT = CT(256, 256, (g, W) => { g.fillStyle = '#2a2e33'; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 2, 0, 7); g.fill(); g.strokeStyle = GOLD; g.lineWidth = 10; g.stroke(); g.fillStyle = '#e9e3d6'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let k = 0; k < 40; k++) { const a = k / 40 * Math.PI * 2, r0 = k % 5 ? 104 : 96; g.fillRect(W / 2 + Math.sin(a) * r0 - 2, W / 2 - Math.cos(a) * r0 - 2, 4, k % 5 ? 8 : 14); if (k % 5 === 0) { g.font = '900 22px Archivo, sans-serif'; g.fillText(String(k), W / 2 + Math.sin(a) * 74, W / 2 - Math.cos(a) * 74); } }
      g.fillStyle = '#9aa0a6'; g.beginPath(); g.arc(W / 2, W / 2, 34, 0, 7); g.fill(); });
    dialM = new THREE.Mesh(new THREE.CircleGeometry(0.36, 40), new THREE.MeshBasicMaterial({ map: dT })); dialM.position.copy(DIALL); VD.add(dialM);
    const ptrM = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.1, 3), new THREE.MeshBasicMaterial({ color: RED })); ptrM.rotation.z = Math.PI; ptrM.position.set(DIALL.x, DIALL.y + 0.42, DIALL.z); VD.add(ptrM);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8, m = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 12), new THREE.MeshLambertMaterial({ color: '#c42d3c' })); m.rotation.x = Math.PI / 2; m.position.set(2.4 + Math.cos(a) * 2.02, Math.sin(a) * 2.02, 0.36); VD.add(m); BOLTS.push({ m, a, out: true }); }
    wheel = new THREE.Group(); wheel.position.set(2.4, 0, 0.52); VD.add(wheel); { const t = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.07, 8, 32), LM(GOLD)); wheel.add(t); for (let i = 0; i < 3; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 0.08), LM(GOLD)); sp.rotation.z = i * Math.PI / 3; wheel.add(sp); } const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.14, 14), LM(BR)); hub.rotation.x = Math.PI / 2; wheel.add(hub); } }
  // --- shutters (lock-up) inside the front wall + lamp caps ---
  const SHUT = [70.2, 76.8, 95.2, 101.8].map(x => { const g = new THREE.Group(); g.position.set(x, 4.7, -80.62); G.add(g); const t = CT(64, 256, (c, W, H) => { c.fillStyle = '#8e939a'; c.fillRect(0, 0, W, H); c.fillStyle = '#6c7178'; for (let y = 0; y < H; y += 12) c.fillRect(0, y, W, 3); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 4.6), new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide })); m.position.y = -2.3; g.add(m); g.scale.y = 0.001; g.visible = false; S.box(4.8, 0.3, 0.3, DSTEEL, x, 4.85, -80.6); return { x, g, k: 0, want: 0 }; });
  const LAMPS = [[71.8, 1.555, -100.6, 0.44, 0.12], [84.6, 1.555, -100.6, 0.44, 0.12], [97.4, 1.555, -100.6, 0.44, 0.12], [78.5, 1.312, -91.5, 2.0, 0.13], [93.5, 1.312, -91.5, 2.0, 0.13]].map(([x, y, z, w, d]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), LM('#3a352c')); m.position.set(x, y, z); m.visible = false; G.add(m); return { x, z, m, off: false }; });
  const ALX = 83.0, ALZ = -80.36, alT = CT(128, 192, () => {}); const drawAl = on => redrawT(alT, (g, W, H) => { g.fillStyle = '#e9e3d6'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = on ? '#ff2a1a' : '#2f7a4a'; g.beginPath(); g.arc(W / 2, 34, 16, 0, 7); g.fill(); g.fillStyle = INK; for (let i = 0; i < 9; i++) g.fillRect(26 + (i % 3) * 28, 70 + (i / 3 | 0) * 28, 20, 20); g.font = '900 16px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText(on ? 'ARMED' : 'ALARM', W / 2, 172); }); drawAl(false);
  plane(alT, 0.42, 0.63, ALX, 1.55, ALZ, Math.PI);
  // ================= JOB STATIONS (static props) =================
  const RINGS = { teller: [92.4, -101.9], fake: [82.4, -102.7], cheque: [88.8, -102.7], vault: [93.6, -109.4], cart: [98.6, -105.6], account: [93.5, -90.1], piggy: [78.5, -90.1], lockup: [ALX, -81.5], atm: [AX, -78.0], coins: [85.0, -120.3], deposit: [66.6, -121.1], gold: [98.2, -120.6] };
  const DOWN = { coins: 1, deposit: 1, gold: 1 }, OUT = { atm: 1 };
  for (const [k, [x, z]] of Object.entries(RINGS)) { const y = DOWN[k] ? Y + 0.085 : OUT[k] ? 0.17 : 0.085, B = DOWN[k] ? SD : S; B.cyl(0.5, 0.5, 0.012, YEL, x, y, z, 22); B.cyl(0.42, 0.42, 0.014, INK, x, y + 0.002, z, 22); }
  // teller: the cash drawer behind window 4 (4 compartments: 1 · 5 · 10 · 20)
  const DRW = [1, 5, 10, 20].map((v, i) => ({ v, p: V(91.95 + i * 0.3, 1.06, -101.25) }));
  S.box(1.3, 0.1, 0.45, WOOD, 92.4, 0.98, -101.25); S.box(1.3, 0.5, 0.06, WOOD, 92.4, 0.75, -101.02); for (let i = 0; i < 3; i++) S.box(0.02, 0.06, 0.4, INK, 92.1 + i * 0.3, 1.06, -101.25); S.box(0.06, 1.0, 0.06, INK, 91.8, 0.48, -101.25); S.box(0.06, 1.0, 0.06, INK, 93.0, 0.48, -101.25);
  DRW.forEach((d, i) => { for (let k = 0; k < 4; k++) { if (d.v === 1) S.cyl(0.045, 0.045, 0.012, COIN[1].c, d.p.x - 0.05 + (k % 2) * 0.1, 1.04 + (k / 2 | 0) * 0.014, d.p.z, 12); else S.box(0.2, 0.012, 0.1, NOTE[d.v], d.p.x, 1.04 + k * 0.012, d.p.z); } });
  rect(91.7, 93.1, -101.5, -101.0);
  const drwTag = DRW.map(d => { const t = CT(96, 48, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6); g.fillStyle = INK; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(d.v + ' G', W / 2, H / 2 + 2); }); return plane(t, 0.2, 0.1, d.p.x, 1.16, d.p.z + 0.24, 0); });
  // fake + cheque desks: a UV lamp on desk 2
  S.box(0.12, 0.3, 0.12, INK, 83.3, 0.95, -104.4); S.box(0.3, 0.06, 0.16, '#3a2a5a', 83.2, 1.12, -104.3); const uvGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.36), new THREE.MeshBasicMaterial({ color: '#8a5cff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); uvGlow.rotation.x = -Math.PI / 2; uvGlow.position.set(82.4, 0.83, -104.0); G.add(uvGlow);
  // cash cart (cart run) — rests by the teller desks upstairs
  const CART = new THREE.Group(); G.add(CART); { const B2 = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), LM(c)); m.position.set(x, y, z); CART.add(m); };
    B2(1.3, 0.05, 0.75, DSTEEL, 0, 0.32, 0); B2(1.3, 0.05, 0.75, DSTEEL, 0, 0.86, 0); for (const [dx, dz] of [[-0.62, -0.34], [0.62, -0.34], [-0.62, 0.34], [0.62, 0.34]]) { B2(0.04, 0.9, 0.04, STEEL, dx, 0.6, dz); B2(0.1, 0.12, 0.06, INK, dx, 0.07, dz); }
    B2(0.04, 0.36, 0.7, STEEL, 0.74, 1.12, 0); for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) B2(0.22, 0.14, 0.2, (i + j) % 3 ? '#4f7a4a' : '#5f8f58', -0.48 + i * 0.24, 0.96, -0.24 + j * 0.24); }
  const CART0 = [98.6, 0, -107.2, Math.PI / 2]; const cartHome = () => { CART.position.set(CART0[0], CART0[1], CART0[2]); CART.rotation.y = CART0[3]; }; cartHome();
  // ---- downstairs: coin sorter on the cash-cage counting desk; strongroom box numbers; gold bar station ----
  const DY = Y + 0.82, TUBE = [1, 5, 10].map((v, i) => ({ v, x: 84.2 + i * 0.3, z: -118.82, n: 0, rolled: false }));
  for (const t of TUBE) { SD.cyl(0.07, 0.07, 0.02, INK, t.x, DY + 0.01, t.z, 14); SD.box(0.1, 0.04, 0.02, COIN[t.v].c, t.x, DY + 0.36, t.z - 0.07); }
  const tubeGlass = new THREE.MeshPhongMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
  for (const t of TUBE) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.32, 14, 1, true), tubeGlass); m.position.set(t.x, DY + 0.17, t.z); G.add(m); }
  SD.box(0.95, 0.025, 0.32, '#3a5a46', 84.55, DY + 0.012, -119.22);
  const boxT = CT(576, 294, (g, W, H) => { const cw = W / 9, rh = H / 7; for (let r = 0; r < 7; r++) for (let c = 0; c < 9; c++) { const n = r * 9 + c + 1, x = c * cw, y = r * rh; g.fillStyle = (r + c) % 2 ? '#b08d3c' : '#a07d30'; g.fillRect(x, y, cw, rh); g.strokeStyle = '#4a3a14'; g.lineWidth = 3; g.strokeRect(x + 1.5, y + 1.5, cw - 3, rh - 3);
      g.fillStyle = '#f6efd8'; g.fillRect(x + cw / 2 - 20, y + 8, 40, 20); g.fillStyle = INK; g.font = '900 17px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(n), x + cw / 2, y + 19); g.fillStyle = '#2a2016'; g.beginPath(); g.arc(x + cw / 2, y + rh - 11, 4, 0, 7); g.fill(); } });
  const BW = { x0: 64.09, cw: 0.62, yTop: Y + 3.03, rh: 0.42, z: -123.92 }; plane(boxT, 5.58, 2.94, BW.x0 + 2.79, BW.yTop - 1.47, BW.z, 0);
  const boxPos = n => { const r = (n - 1) / 9 | 0, c = (n - 1) % 9; return V(BW.x0 + (c + 0.5) * BW.cw, BW.yTop - (r + 0.5) * BW.rh, BW.z); };
  const TABLE = V(66.6, Y + 0.9, -118.6);
  const SCALE = V(97.2, DY + 0.06, -118.6), PRESS = V(98.5, DY + 0.06, -118.6), BINP = V(95.9, Y + 0.55, -119.7), BCART = V(100.1, Y + 0.74, -118.7), PAL = V(98.6, Y + 0.2, -115.5);
  SD.box(0.9, 0.8, 0.7, '#3f4854', 97.2, Y + 0.4, -118.6); SD.box(0.6, 0.06, 0.5, STEEL, 97.2, DY + 0.03, -118.6); SD.box(0.5, 0.5, 0.06, INK, 97.2, DY + 0.35, -118.28);
  SD.box(0.9, 0.8, 0.7, '#3f4854', 98.5, Y + 0.4, -118.6); SD.box(0.5, 0.06, 0.4, DSTEEL, 98.5, DY + 0.03, -118.6); SD.box(0.1, 1.0, 0.1, DSTEEL, 98.5, DY + 0.5, -118.28); SD.box(0.36, 0.08, 0.5, DSTEEL, 98.5, DY + 1.0, -118.5);
  SD.box(0.8, 0.7, 0.7, '#c42d3c', BINP.x, Y + 0.35, BINP.z); SD.box(0.84, 0.05, 0.74, INK, BINP.x, Y + 0.72, BINP.z);
  SD.box(1.2, 0.08, 0.7, DSTEEL, BCART.x, Y + 0.66, BCART.z); for (const [dx, dz] of [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]]) SD.box(0.04, 0.66, 0.04, STEEL, BCART.x + dx, Y + 0.33, BCART.z + dz);
  SD.box(2.4, 0.15, 1.6, '#9a7550', PAL.x, Y + 0.075, PAL.z);
  rect(96.7, 99.0, -118.95, -118.25, Y - 1, Y + 2.5); rect(BINP.x - 0.42, BINP.x + 0.42, BINP.z - 0.38, BINP.z + 0.38, Y - 1, Y + 2.5); rect(BCART.x - 0.62, BCART.x + 0.62, BCART.z - 0.36, BCART.z + 0.36, Y - 1, Y + 2.5); rect(PAL.x - 1.2, PAL.x + 1.2, PAL.z - 0.8, PAL.z + 0.8, Y - 1, Y + 2.5);
  const scT = CT(128, 128, (g, W) => { g.fillStyle = '#f6f1e4'; g.beginPath(); g.arc(W / 2, W / 2, 60, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; g.stroke(); g.fillStyle = INK; for (let k = 0; k <= 10; k++) { const a = -2.2 + k / 10 * 4.4; g.fillRect(W / 2 + Math.sin(a) * 46 - 2, W / 2 - Math.cos(a) * 46 - 2, 4, 6); } g.fillStyle = '#2f7a4a'; g.fillRect(W / 2 + 24, 22, 16, 8); });
  const scDial = plane(scT, 0.44, 0.44, 97.2, DY + 0.35, -118.32, Math.PI), needle = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.18), new THREE.MeshBasicMaterial({ color: RED })); needle.geometry.translate(0, 0.08, 0); needle.position.set(0, 0, 0.005); scDial.add(needle); needle.rotation.z = 2.2;
  const pressHead = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.2, 0.3), LM(INK)); pressHead.position.set(98.5, DY + 0.86, -118.6); G.add(pressHead);
  // ---------- merge ----------
  G.add(new THREE.Mesh(S.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  { const m = new THREE.Mesh(SD.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })); m.renderOrder = -2; G.add(m); }
  G.add(new THREE.Mesh(GLO.geo(), new THREE.MeshBasicMaterial({ vertexColors: true })));
  // ================= keepers =================
  const chainOn = body => { const ch = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.012, 5, 14, Math.PI), new THREE.MeshPhongMaterial({ color: '#ffd23a', shininess: 90 })); ch.rotation.z = Math.PI; ch.position.set(0.04, 1.0, 0.41); body.add(ch); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.02, 14), new THREE.MeshPhongMaterial({ color: '#ffd23a', shininess: 90 })); w.rotation.x = Math.PI / 2; w.position.set(0.15, 0.96, 0.42); body.add(w); };
  const far = kit.makeFox({ key: 'bankManager', torso: ['#3a2f4a', GOLD, '#241d2e'], outfit: 'suit', mood: 'happy', look: { elder: 1, fur: '#c98a4a', furDark: '#8a5a2b', muzzle: '#f6ead8' } });
  { const P = far.userData && far.userData.P; if (P && P.body) chainOn(P.body); } far.scale.setScalar(1.06);
  const FAR0 = [86, -96.0, 0]; far.position.set(FAR0[0], 0, FAR0[1]); far.rotation.y = FAR0[2]; G.add(far); ringC(FAR0[0], FAR0[1], 0.5);
  const tum = refs && refs.fox; if (tum && !tum.name) tum.name = 'bankTumbler'; const TUM0 = [73.4, -116.6, 2.6];
  if (tum) { tum.position.set(TUM0[0], Y, TUM0[1]); tum.rotation.y = TUM0[2]; tum.traverse(o => { o.renderOrder = -2; }); const P = tum.userData && tum.userData.P; if (P && P.body) { const k = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.015, 6, 14), LM(BR)); k.position.set(0.3, 0.72, 0.12); k.rotation.y = 1.2; P.body.add(k); } }
  const fmT = { key: 'bankManager', name: 'Mr. Farthing', role: 'BANK OF MERU', obj: far, ry: FAR0[2], r: 3 }, fmE = { key: 'bankManagerEnd', name: 'Mr. Farthing', role: 'BANK OF MERU', obj: far, ry: FAR0[2], r: 6 };
  const tmT = { key: 'bankTumbler', name: 'Tumbler', role: 'THE VAULT', obj: tum || far, ry: TUM0[2], r: 3 }, tmE = { key: 'bankTumblerEnd', name: 'Tumbler', role: 'THE VAULT', obj: tum || far, ry: TUM0[2], r: 6 };
  const lnF = text => ({ who: 'mr. farthing', role: 'BANK OF MERU', text }), lnT = text => ({ who: 'tumbler', role: 'THE VAULT', text });
  const GAMES = [{ k: 'teller', name: 'Teller Window', color: BANKG, gold: 24 }, { k: 'coins', name: 'Coin Sorter', color: '#b87333', gold: 20, down: 1 }, { k: 'fake', name: 'Spot the Fake', color: '#7c4dc4', gold: 22 },
    { k: 'deposit', name: 'Safe-Deposit', color: BR, gold: 24, down: 1 }, { k: 'vault', name: 'Open the Vault', color: DSTEEL, gold: 28 }, { k: 'cart', name: 'Cash Cart Run', color: '#4f7a4a', gold: 26, walk: true },
    { k: 'gold', name: 'Gold Bars', color: BARG, gold: 26, down: 1 }, { k: 'cheque', name: 'Cheque Check', color: '#2f6fd6', gold: 22 }, { k: 'account', name: 'New Account', color: '#2e4a6b', gold: 22 },
    { k: 'atm', name: 'ATM Refill', color: '#24405e', gold: 24 }, { k: 'piggy', name: 'Piggy Bank Day', color: '#e87ba0', gold: 20 }, { k: 'lockup', name: 'Lock-Up', color: RED, gold: 26, walk: true }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const rFox = rosterFoxes({ THREE, kit, cap: 4 }), cFox = rosterFoxes({ THREE, kit, cap: 3 }); let endClear = 0, custN = 0, lastCus = null;
  const pickCus = () => { const pool = ROSTER.filter(r => r !== lastCus); const r = pool[(custN++ * 7 + (Math.random() * 5 | 0)) % pool.length]; lastCus = r; return r; };
  const putCus = (x, y, z, ry) => { const r = pickCus(), f = cFox(r, G); f.visible = true; f.position.set(x, y, z); f.rotation.y = ry; if (y < -1) f.traverse(o => { o.renderOrder = -2; }); J.cf = f; J.C = { name: r.name.toUpperCase(), r }; return r; };
  const visitors = h => (h >= 8.5 && h < 18.5 ? dueAt('bank', h) : []);
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'bk', color: BANKG, boardTitle: "Mr. Farthing's best", toWorld: toW,
    room: { X0: 62.4, X1: 109.6, Z0: -124.6, Z1: -80.4 }, door: [86, -80.8], keeper: far, keeperRy: FAR0[2], games: GAMES, board: { x: 91.6, y: 3.3, z: -80.34, ry: Math.PI, w: 1.15 }, clock: { x: 80.4, y: 3.4, z: -80.34, ry: Math.PI }, hiring: { x: 89.6, z: -81.7, ry: -Math.PI / 2 }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: 86, z: -90.6, w: 6.4, d: 6.4 }, { x: 70.2, z: -81.8, w: 3.6, d: 2.2 }, { x: 76.8, z: -81.8, w: 3.6, d: 2.2 }, { x: 95.2, z: -81.8, w: 3.6, d: 2.2 }, { x: 101.8, z: -81.8, w: 3.6, d: 2.2 }],
    lamps: [[79, 5.2, -90], [93, 5.2, -90], [71.8, 1.6, -100.6], [84.6, 1.6, -100.6], [97.4, 1.6, -100.6], [78.5, 1.4, -91.5], [93.5, 1.4, -91.5]],
    browse: [[83.2, -97.0, Math.PI], [69.2, -90.4, -Math.PI / 2], [100.6, -93.6, Math.PI], [72.4, -86.4, 0], [99.0, -85.6, 0], [64.4, -104.2, -Math.PI / 2]], slots: 2, visitors, visitorFox: r => rFox(r, G),
    onVisit: (e, inside) => { if (inside && !busy) toast(e.r.name.toUpperCase() + ' \u00b7 ' + e.r.role.toUpperCase() + ' \u00b7 ' + (e.kind === 'through' ? 'ON THE BEAT' : 'BANK RUN, ' + e.why), 2.4); } });
  // ================= state, sound, UI (Modernist card + pick panel) =================
  let toastTxt = '', toastT = 0, talkedF = 0, talkedT = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), coin = (at = 0) => { tone(2400, 0.04, 0.15, 'triangle', at); tone(3200, 0.03, 0.12, 'triangle', at + 0.03); };
  const click = () => tone(2600, 0.04, 0.05, 'square'), clunk = () => { tone(110, 0.1, 0.35, 'square'); noise(0.25, 0.05, 400); }, swish = () => noise(0.2, 0.025, 2000), stampS = () => { tone(140, 0.09, 0.15, 'square'); noise(0.08, 0.04, 1200); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + BANKG + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, walk) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (walk ? 'MR. FARTHING \u00b7 STOP' : (touch ? '3' : 'SPACE') + ' \u00b7 STOP') + '</span></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' \u00b7 ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>', big = (t, c = '#201e1d') => '<div style="font-size:30px;font-weight:900;line-height:1.1;color:' + c + '">' + t + '</div>';
  const quote = t => '<div style="font-size:14px;font-weight:800;line-height:1.35;border-left:0;padding:2px 0 6px">\u201c' + t + '\u201d</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  let pickKey = ''; const showPick = (key, title, right, html, opts, grid) => { if (key === pickKey) return; pickKey = key; pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (html || '') + '</div>'; const body = pick.lastChild;
    const wrap = document.createElement('div'); wrap.style.cssText = grid ? 'display:grid;grid-template-columns:repeat(' + grid + ',minmax(0,1fr));gap:6px' : ''; body.appendChild(wrap);
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on) + (grid ? ';margin-top:0' : ''); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); wrap.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; pickKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitZ = z => ray().intersectPlane(new THREE.Plane(V(0, 0, 1), -z), hitP) ? hitP.clone() : null;
  const hitY = y => ray().intersectPlane(new THREE.Plane(V(0, 1, 0), -y), hitP) ? hitP.clone() : null;
  const wpos = o => { o.updateWorldMatrix(true, false); const w = o.getWorldPosition(V()); G.updateWorldMatrix(true, false); return G.worldToLocal(w); };
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); if (J && J.down) o.traverse(q => { q.renderOrder = -2; }); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(256, 72, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 16, H / 2 + 2, W - 32, 40); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.42) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: false })); sp.scale.set(s, s * 0.28, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (sub, after, t = 1.0) => { J.sub = sub; J.pause = t; J.after = after; };
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED, depthTest: false })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 7; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  const sparkle = pts([...Array(10)].map(() => [0, -60, 0]), 0.12, '#fff3b0', 1); let sparkT = 0, sparkAt = V();
  const shine = at => { sparkT = 0.9; sparkAt.copy(at); };
  const clink = () => { tone(2900, 0.04, 0.3, 'triangle'); tone(4100, 0.02, 0.4, 'triangle'); }, beep = () => tone(1800, 0.05, 0.12, 'square');
  const meter = (f, c) => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (clamp(f, 0, 1) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  // ================= prizes: banker's waistcoat + green visor =================
  const COAT = { outfit: 'vest', torso: ['#3d3b3a', GOLD, '#201e1d'], name: "BANKER'S WAISTCOAT" };
  const coatOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === COAT.name); };
  const done = () => save.stat('bkDone', null) || {};
  function giveGift() { const n = save.stat('bkClears', 0) + 1; save.setStat('bkClears', n); const d = done(), nd = GAMES.filter(q => d[q.k]).length;
    if (!save.stat('bkCoat', false)) { save.setStat('bkCoat', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === COAT.name)) save.setStat('tailorOutfits', [...list, COAT]);
      save.setStat('bkPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(COAT); wear && wear(COAT); return 'coat'; }
    if (nd >= 2 && !save.stat('bkChoc1', false)) { save.setStat('bkChoc1', true); for (let i = 0; i < 3; i++) save.give('coinChoc'); return 'choc'; }
    if (nd >= 3 && !save.stat('bkRate', false)) { save.setStat('bkRate', true); return 'rate'; }
    if (nd >= 5 && !save.stat('bkSlots', false)) { save.setStat('bkSlots', true); return 'slots'; }
    if (nd >= 8 && !save.stat('bkPiggy', false)) { save.setStat('bkPiggy', true); save.give('goldenPiggy'); return 'piggy'; }
    if (nd >= GAMES.length && !save.stat('bkAll', false)) { save.setStat('bkAll', true); save.give('goldIngot'); save.addGold(60); return 'all'; }
    if (n % 3 === 0) { save.give('coinChoc'); return 'choc1'; } return null; }
  let worn = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const on = coatOn();
    if (worn && worn.on === on && worn.fox === fox && (!worn.m || worn.m.parent === P.head)) return; if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, fox, m: null }; if (!on) return;
    const g = new THREE.Group(), band = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.225, 0.07, 16, 1, true), new THREE.MeshLambertMaterial({ color: '#1f6b45', side: THREE.DoubleSide })); band.position.y = 0.28; g.add(band);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.015, 0.22), new THREE.MeshLambertMaterial({ color: '#2fae6a', transparent: true, opacity: 0.72 })); brim.position.set(0, 0.255, 0.22); brim.rotation.x = 0.22; g.add(brim); g.traverse(o => { o.renderOrder = 2; }); P.head.add(g); worn.m = g; }
  // ================= GAME 1: TELLER WINDOW (count out exact change · count a deposit) =================
  const TCUS = V(92.4, 0, -98.9), TRAY = V(92.4, 1.34, -100.15);
  const T1 = {
    begin() { J.round = 0; J.kinds = ['w', 'd', 'w']; this.cus(); },
    cus() { putCus(TCUS.x, 0, TCUS.z, Math.PI); J.tray = []; J.sum = 0; J.k = J.kinds[J.round]; J.wrong = 0;
      if (J.k === 'w') { J.want = pickR([17, 23, 28, 31, 36, 42, 47, 54]); J.sub = 'give'; toast(J.C.name + ': "' + J.want + ' GOLD, PLEASE."', 2.4); }
      else { const vs = shuffle([20, 10, 5, 5, 1, 1, 10, 20, 5]).slice(0, 4 + (Math.random() * 3 | 0)); J.pile = vs.map((v, i) => { const m = own(cashMesh(v)); m.position.set(TRAY.x - 0.2 + (i % 3) * 0.2, TRAY.y + (i / 3 | 0) * 0.016, TRAY.z + (i % 2 ? 0.05 : -0.05)); m.rotation.y = rnd(-0.3, 0.3); return { v, m, done: false }; });
        J.want = vs.reduce((a, b) => a + b, 0); J.counted = []; J.sub = 'count'; toast(J.C.name + ': "INTO MY SAVINGS, PLEASE."', 2.4); } },
    press() { if (J.flies.length) return;
      if (J.sub === 'give') { const d = nearestOf(DRW, q => q.p, 1.4); if (!d) return; const m = own(cashMesh(d.v)); m.position.copy(d.p); const n = J.tray.length; J.tray.push(m); J.sum += d.v; (d.v === 1 ? coin : swish)();
        fly(m, V(TRAY.x - 0.18 + (n % 4) * 0.12, TRAY.y + (n / 4 | 0) * 0.014, TRAY.z), 0.3, 0.15, null);
        if (J.sum > J.want) { miss('MR. FARTHING: "TOO MUCH! ' + J.want + ' ONLY. LET\'S COUNT AGAIN."', 2.2); const t = J.tray; J.tray = []; J.sum = 0; NEXT('give', () => t.forEach(o => { o.visible = false; }), 0.7); }
        else if (J.sum === J.want) { ding(); addGold(6); NEXT('hand', () => this.hand(false), 0.6); } return; }
      if (J.sub === 'count') { const q = nearestOf(J.pile.filter(p => !p.done), p => p.m.position, 1.3); if (!q) return; q.done = true; J.counted.push(q.v); (q.v === 1 ? coin : swish)(); const dd = DRW.find(d => d.v === q.v) || DRW[0];
        fly(q.m, dd.p.clone().add(V(0, 0.03, 0)), 0.3, 0.12, () => { q.m.visible = false; }); if (J.pile.every(p => p.done)) NEXT('total', () => {}, 0.4); } },
    choose(n) { if (J.sub !== 'total') return; if (n !== J.want) { miss('MR. FARTHING: "NOT QUITE. ADD THEM UP: ' + J.counted.join(' + ') + '."', 2.6); J.wrong++; return; } ding(); coin(); addGold(8); hidePick(); NEXT('hand', () => this.hand(true), 0.4); },
    hand(dep) { const to = V(TCUS.x, 1.3, TCUS.z + 0.2); if (!dep) J.tray.forEach(m => fly(m, to, 0.4, 0.2, () => { m.visible = false; })); toast(J.C.name + (dep ? ': "LOVELY, ALL SAVED."' : ': "EXACTLY RIGHT. THANK YOU!"'), 1.8);
      NEXT('next', () => { if (J.cf) J.cf.visible = false; if (++J.round < 3) this.cus(); else finishGame(); }, 1.3); },
    ui() { if (J.sub !== 'total') return false; const key = 'tt' + J.round + '_' + J.wrong; if (pickKey === key) return true; const a = J.want, opts = shuffle([a, a + pickR([5, 10]), Math.max(1, a - pickR([4, 9]))]);
      showPick(key, 'HOW MUCH?', 'FOR ' + J.C.name, lab('YOU COUNTED: ' + J.counted.map(v => v + ' G').join(' \u00b7 ')), opts.map(n => ({ label: n + ' GOLD', go: () => this.choose(n) })), 3); return true; },
    card() { const hd = lab('CUSTOMER ' + (J.round + 1) + ' / 3 \u00b7 ' + (J.C ? J.C.name : ''));
      if (J.sub === 'give' || (J.k === 'w' && J.sub !== 'next')) return ['TAP THE DRAWER \u00b7 MAKE ' + J.want + ' G', big(J.sum + ' / ' + J.want + ' G', J.sum === J.want ? GREEN : INK) + hd, 'g' + J.sum + J.sub];
      if (J.sub === 'count') return ['TAP EACH ONE TO COUNT IT', lab('COUNTED: ' + (J.counted.join(' \u00b7 ') || '\u2014')) + row(INK, 'ON THE TRAY', J.pile.filter(p => !p.done).length + ' LEFT', false) + hd, 'c' + J.counted.length];
      return ['NEXT CUSTOMER', hd, 'x' + J.sub + J.round]; },
    hint() { if (J.sub === 'give') { const rem = J.want - J.sum, d = DRW.slice().reverse().find(q => q.v <= rem); return d ? [d.p, 'TAP ' + d.v + ' G'] : null; } if (J.sub === 'count') { const q = J.pile.find(p => !p.done); return q ? [q.m.position.clone(), 'TAP'] : null; } return null; },
    shot() { return [V(92.4, 1.55, -100.5), 2.6, 2.8, 0.62, 2.4, Math.PI, 5.0, 0.5]; } };
  // ================= GAME 2: COIN SORTER (downstairs, the cash-cage desk: drag each coin to its tube, then roll the tubes) =================
  const T2 = {
    begin() { const vs = shuffle([1, 1, 1, 1, 5, 5, 5, 5, 10, 10, 10, 10]); J.coins = vs.map((v, i) => { const m = own(coinMesh(v)), p = V(84.15 + (i % 6) * 0.16, DY + 0.034, -119.3 + (i / 6 | 0) * 0.13); m.position.copy(p); return { v, m, home: p.clone(), done: false }; });
      TUBE.forEach(t => { t.n = 0; t.rolled = false; }); J.rolls = []; J.sub = 'sort'; toast('DRAG EACH COIN INTO ITS TUBE', 2.2); },
    press() { if (J.sub === 'sort') { const q = nearestOf(J.coins.filter(c => !c.done), c => c.m.position, 1.0); if (q) J.held = q; return; }
      if (J.sub === 'roll') { const t = nearestOf(TUBE.filter(q => !q.rolled), q => V(q.x, DY + 0.17, q.z), 1.6); if (!t) return; t.rolled = true; const r = own(new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.09, 14), LM(t.v === 1 ? '#c98a5a' : t.v === 5 ? '#9aa4b0' : '#d9b040')));
        r.position.set(t.x, DY + 0.06, t.z); r.scale.y = 0.01; J.rolls.push(r); pop(); if (TUBE.every(q => q.rolled)) { ding(); addGold(10); NEXT('done', finishGame, 1.0); } } },
    drag() { if (!J.held || !ptr.down) return; const p = hitY(DY + 0.08); if (!p) return; J.held.m.position.set(clamp(p.x, 83.9, 85.2), DY + 0.08, clamp(p.z, -119.45, -118.6)); },
    release() { const q = J.held; if (!q) return; J.held = null; const p = q.m.position, t = TUBE.find(u => Math.hypot(p.x - u.x, p.z - u.z) < 0.14);
      if (!t) { fly(q.m, q.home, 0.2, 0.03, null); return; }
      if (t.v !== q.v) { miss('TUMBLER: "THAT\'S ' + COIN[q.v].n + ' ' + q.v + '. IT GOES IN THE ' + COIN[q.v].n + ' TUBE."', 2); fly(q.m, q.home, 0.25, 0.05, null); return; }
      q.done = true; coin(); fly(q.m, V(t.x, DY + 0.03 + t.n * 0.016, t.z), 0.18, 0.08, null); t.n++;
      if (J.coins.every(c => c.done)) { ding(); addGold(6); NEXT('roll', () => toast('TAP EACH TUBE TO ROLL IT', 2), 0.6); } },
    tick(dt) { for (const r of J.rolls) r.scale.y = Math.min(1, r.scale.y + dt * 4); },
    card() { if (J.sub === 'roll' || J.rolls.length) return ['TAP A TUBE TO ROLL IT', lst(TUBE.map(t => [COIN[t.v].c, 'ROLL THE ' + COIN[t.v].n, t.rolled ? '\u2713' : '', t.rolled])), 'r' + TUBE.map(t => +t.rolled).join('')];
      return ['DRAG EACH COIN TO ITS TUBE', lst(TUBE.map(t => [COIN[t.v].c, COIN[t.v].n + ' ' + t.v, t.n + ' / 4', t.n >= 4])), 's' + TUBE.map(t => t.n).join('')]; },
    hint() { if (J.sub === 'sort') { if (J.held) { const t = TUBE.find(u => u.v === J.held.v); return [V(t.x, DY + 0.2, t.z), 'DROP HERE']; } const c = J.coins.find(q => !q.done); if (!c) return null; const t = TUBE.find(u => u.v === c.v); return [c.m.position.clone(), 'DRAG TO ' + COIN[t.v].n]; }
      if (J.sub === 'roll') { const t = TUBE.find(q => !q.rolled); return t ? [V(t.x, DY + 0.17, t.z), 'TAP'] : null; } return null; },
    shot() { return [V(84.55, DY + 0.1, -119.0), 1.25, 0.8, 0.95, 1.1, Math.PI, 2.4, 0.5]; } };
  // ================= GAME 3: SPOT THE FAKE (hold for UV: a real note glows a stripe + a fox watermark) =================
  const NOTEP = V(82.4, 0.815, -104.0);
  const fakeTex = (v, stripe, mark, uv) => CT(256, 128, (g, W, H) => { g.fillStyle = uv ? '#2a1d4a' : NOTE[v]; g.fillRect(0, 0, W, H); g.strokeStyle = uv ? '#5a4a8a' : '#f3f2f2'; g.lineWidth = 6; g.strokeRect(6, 6, W - 12, H - 12); g.fillStyle = uv ? '#6a5a9a' : '#ffffff'; g.textBaseline = 'middle';
    g.font = '900 44px Archivo, sans-serif'; g.fillText(v + ' G', 20, H / 2 + 6); g.font = '800 14px Archivo, sans-serif'; g.fillText('BANK OF MERU', 20, 26);
    if (uv) { if (stripe) { g.fillStyle = '#b8ff5a'; g.fillRect(150, 10, 16, H - 20); } if (mark) { g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.moveTo(186, 52); g.lineTo(192, 30); g.lineTo(202, 46); g.lineTo(212, 46); g.lineTo(222, 30); g.lineTo(228, 52); g.lineTo(207, 92); g.closePath(); g.fill(); } }
    else { g.fillStyle = 'rgba(255,255,255,0.16)'; g.beginPath(); g.arc(207, 62, 24, 0, 7); g.fill(); } });
  const T3 = {
    begin() { const n = 6, nf = 2 + (Math.random() < 0.5 ? 1 : 0), fk = shuffle([...Array(n).keys()]).slice(0, nf); J.notes = [...Array(n)].map((_, i) => { const fake = fk.includes(i), kind = fake ? pickR(['stripe', 'mark', 'both']) : null; return { v: pickR([5, 10, 20, 50]), fake, stripe: !fake || kind === 'mark', mark: !fake || kind === 'stripe' }; });
      J.i = 0; this.show(); toast('HOLD THE SCREEN TO SWITCH ON THE UV LAMP', 2.4); },
    show() { const q = J.notes[J.i]; q.tN = fakeTex(q.v, q.stripe, q.mark, false); q.tU = fakeTex(q.v, q.stripe, q.mark, true); const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.22), new THREE.MeshBasicMaterial({ map: q.tN }))); m.rotation.x = -Math.PI / 2; m.position.copy(NOTEP).add(V(0, 0, 0.3)); fly(m, NOTEP, 0.3, 0.05, null); q.m = m; J.seen = false; J.sub = 'judge'; },
    press() { if (J.sub === 'judge') { J.seen = true; tone(120, 0.02, 0.3, 'sawtooth'); } },
    tick() { const q = J.notes[J.i]; if (!q || !q.m) return; const on = ptr.down && J.sub === 'judge'; q.m.material.map = on ? q.tU : q.tN; uvGlow.material.opacity = on ? 0.35 : 0; },
    choose(saysFake) { if (J.sub !== 'judge') return; const q = J.notes[J.i];
      if (saysFake !== q.fake) miss('MR. FARTHING: "' + (q.fake ? 'UNDER UV: ' + (!q.stripe && !q.mark ? 'NO STRIPE, NO FOX.' : !q.stripe ? 'NO GLOWING STRIPE.' : 'NO FOX WATERMARK.') + ' FAKE!' : 'STRIPE AND FOX ARE BOTH THERE. IT\'S REAL!') + '"', 2.6); else { ding(); addGold(4); }
      J.sub = 'move'; hidePick(); fly(q.m, q.fake ? V(83.2, 0.83, -103.7) : V(81.6, 0.82 + J.i * 0.004, -103.85), 0.35, 0.1, null); NEXT('nx', () => { if (++J.i < J.notes.length) this.show(); else finishGame(); }, 0.7); },
    ui() { if (J.sub !== 'judge') return false; const key = 'fk' + J.i; if (pickKey === key) return true;
      showPick(key, 'REAL OR FAKE?', 'NOTE ' + (J.i + 1) + ' / ' + J.notes.length, lab('HOLD THE SCREEN FOR UV') + lab('REAL = GLOWING STRIPE + FOX WATERMARK'), [{ label: 'REAL \u00b7 PAY IT IN', go: () => this.choose(false) }, { label: 'FAKE \u00b7 KEEP IT', primary: true, go: () => this.choose(true) }], 2); return true; },
    card() { return ['NEXT NOTE', lab('NOTE ' + Math.min(J.notes.length, J.i + 1) + ' / ' + J.notes.length), 'm' + J.i]; },
    hint() { return J.sub === 'judge' && !J.seen ? [NOTEP.clone(), 'HOLD FOR UV'] : null; },
    shot() { return [V(82.4, 0.82, -104.0), 0.8, 0.5, 1.15, 0.85, 0, 1.8, 0.5]; },
    end() { uvGlow.material.opacity = 0; } };
  // ================= GAME 4: SAFE-DEPOSIT (downstairs strongroom: find the box, bank key then theirs, drawer to the table, lift the lid) =================
  const ITEMS = [['A WAR MEDAL', GOLD], ['A PEARL NECKLACE', '#f6f1ea'], ['OLD LOVE LETTERS', '#e9dcc3'], ['A SILVER WATCH', '#c9ced3'], ['A RUBY RING', '#c42d3c'], ['A FAMILY PHOTO', '#8a7a64'], ["GRANDAD'S PIPE", '#5a3d26']];
  const T4 = {
    begin() { J.ci = 0; J.used = []; this.cus(); },
    cus() { putCus(68.9, Y, -120.6, -2.2); let n; do { n = 1 + (Math.random() * 63 | 0); } while (J.used.includes(n)); J.used.push(n); J.box = n; J.bm = 0; J.sub = 'find'; J.it = pickR(ITEMS); if (J.ringS) J.ringS.visible = false; toast(J.C.name + ': "BOX ' + n + ', PLEASE."', 2.4); },
    mark() { if (!J.ringS) { J.ringS = own(new THREE.Mesh(new THREE.RingGeometry(0.2, 0.27, 24), new THREE.MeshBasicMaterial({ color: YEL, depthTest: false }))); J.ringS.renderOrder = 7; } J.ringS.position.copy(boxPos(J.box)).add(V(0, 0, 0.03)); J.ringS.visible = true; },
    keys() { if (J.ringS) J.ringS.visible = false; const p = boxPos(J.box), top = Math.random() < 0.5; J.k = 0; J.keys = [['BANK KEY', YEL], ['THEIR KEY', '#ffffff']].map(([t, c], i) => { const s = own(tagSprite(t, c, INK, 0.36)); s.position.set(p.x, p.y + ((i === 0) === top ? 0.13 : -0.13), p.z + 0.1); return { i, s, done: false }; }); J.sub = 'keys'; toast('TURN THE BANK KEY FIRST, THEN THEIRS', 2.2); },
    press() { if (J.flies.length) return;
      if (J.sub === 'find') { let best = 0, bd = RAD() * 1.2; for (let n = 1; n <= 63; n++) { const d = dist(scrW(boxPos(n))); if (d < bd) { bd = d; best = n; } } if (!best) return;
        if (best !== J.box) { miss('TUMBLER: "THAT\'S BOX ' + best + '. WE WANT ' + J.box + '."', 1.8); if (++J.bm >= 2) this.mark(); return; } pop(); this.keys(); return; }
      if (J.sub === 'keys') { const k = nearestOf(J.keys.filter(q => !q.done), q => q.s.position, 1.4); if (!k) return; if (k.i !== J.k) { miss('TUMBLER: "BANK KEY FIRST. OURS, THEN THEIRS."', 1.8); return; } k.done = true; k.s.visible = false; click(); tone(900, 0.04, 0.2, 'triangle'); J.k++;
        if (J.k >= 2) { clunk(); const p = boxPos(J.box), d = own(new THREE.Group()), b = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.36, 0.5), LM(BR)); d.add(b); const lid = new THREE.Group(); lid.position.set(0, 0.18, -0.25); d.add(lid); const lm = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.03, 0.5), LM('#a07d30')); lm.position.z = 0.25; lid.add(lm);
          d.traverse(o => { o.renderOrder = -2; }); d.position.set(p.x, p.y, p.z - 0.2); J.dr = d; J.lid = lid; fly(d, V(p.x, p.y, p.z + 0.32), 0.5, 0, null); J.sub = 'carry'; toast('TAP THE DRAWER \u00b7 CARRY IT TO THE TABLE', 2); } return; }
      if (J.sub === 'carry') { if (dist(scrW(J.dr.position)) > RAD() * 2.2) return; pop(); J.sub = 'move'; fly(J.dr, V(TABLE.x, TABLE.y + 0.18, TABLE.z), 0.6, 0.3, () => { if (J && J.g === 'deposit') { J.sub = 'lid'; toast('LIFT THE LID FOR ' + J.C.name, 2); } }); return; }
      if (J.sub === 'lid') { if (dist(scrW(J.dr.position)) > RAD() * 2.4) return; J.sub = 'open'; J.lidT = 0; const it = own(new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 8), LM(J.it[1]))); it.position.set(TABLE.x, TABLE.y + 0.3, TABLE.z); it.scale.set(1.3, 0.5, 1); shine(it.position); ding(); addGold(7);
        toast(J.C.name + ': "' + J.it[0] + '. STILL SAFE. THANK YOU!"', 2.4); NEXT('next', () => { J.dr.visible = false; it.visible = false; if (J.cf) J.cf.visible = false; if (++J.ci < 3) this.cus(); else finishGame(); }, 2.0); } },
    tick(dt) { if (J.lid && (J.sub === 'open' || J.sub === 'next')) { J.lidT += dt; J.lid.rotation.x = -Math.min(1.3, J.lidT * 3); } },
    card() { const hd = lab('CUSTOMER ' + (J.ci + 1) + ' / 3 \u00b7 ' + (J.C ? J.C.name : ''));
      if (J.sub === 'find') return ['FIND BOX ' + J.box, big('BOX ' + J.box) + hd, 'f' + J.box + J.bm];
      if (J.sub === 'keys') return ['BANK KEY, THEN THEIR KEY', lst([[YEL, 'BANK KEY', J.k > 0 ? '\u2713' : '', J.k > 0], ['#ffffff', 'THEIR KEY', J.k > 1 ? '\u2713' : '', J.k > 1]]) + hd, 'k' + J.k];
      return [J.sub === 'carry' ? 'TAP THE DRAWER' : J.sub === 'lid' ? 'LIFT THE LID' : 'BOX ' + J.box, big('BOX ' + J.box) + hd, 'o' + J.sub]; },
    hint() { if (J.sub === 'find') return J.bm ? [boxPos(J.box), 'BOX ' + J.box] : null; if (J.sub === 'keys') { const k = J.keys.find(q => q.i === J.k); return k ? [k.s.position.clone(), 'TAP'] : null; } if (J.sub === 'carry' || J.sub === 'lid') return [J.dr.position.clone(), 'TAP']; return null; },
    shot() { return J.sub === 'move' || J.sub === 'lid' || J.sub === 'open' || J.sub === 'next' ? [V(TABLE.x, TABLE.y + 0.2, TABLE.z), 1.5, 1.1, 0.7, 1.4, Math.PI, 2.6, 0.5] : [V(66.88, Y + 1.56, -123.9), 6.2, 3.3, 0.1, 2.4, 0, 5.6, 0.8]; } };
  // ================= GAME 5: OPEN THE VAULT (dial R-L-R, pull the 8 bolts, spin the wheel) =================
  const T5 = {
    begin() { if (!VD) { NEXT('done', finishGame, 0.5); return; } const ns = shuffle([...Array(36).keys()].map(n => n + 3)).slice(0, 3); J.combo = [['R', ns[0]], ['L', ns[1]], ['R', ns[2]]]; J.ci = 0; J.dialA = 0; J.dir = null; J.trav = 0; dialM.rotation.z = 0;
      BOLTS.forEach(b => this.bolt(b, true)); J.wacc = 0; doorJob = doorA; J.sub = doorA < -0.1 ? 'shut' : 'dial'; toast(J.sub === 'shut' ? 'TUMBLER SHUTS THE DOOR \u00b7 NOW YOU OPEN IT' : 'TURN THE DIAL \u00b7 DRAG LEFT AND RIGHT', 2.4); },
    bolt(b, out) { b.out = out; const r = out ? 2.02 : 1.72; b.m.position.set(2.4 + Math.cos(b.a) * r, Math.sin(b.a) * r, 0.36); b.m.material.color.set(out ? '#c42d3c' : '#2f7a4a'); },
    num() { const st = Math.PI * 2 / 40; return ((-Math.round(J.dialA / st)) % 40 + 40) % 40; },
    green() { const c = J.combo && J.combo[J.ci]; return !!c && J.sub === 'dial' && this.num() === c[1] && J.dir === c[0] && J.trav >= 3; },
    press() { if (J.sub === 'dial') { J.px = ptr.x; J.moved = 0; return; }
      if (J.sub === 'bolts') { const b = nearestOf(BOLTS.filter(q => q.out), q => wpos(q.m), 1.5); if (!b) return; this.bolt(b, false); clunk(); if (BOLTS.every(q => !q.out)) { ding(); addGold(6); J.sub = 'wheel'; toast('SPIN THE WHEEL \u00b7 DRAG ROUND IN A CIRCLE', 2.4); } return; }
      if (J.sub === 'wheel') { const c = scrW(wpos(wheel)); J.wc = c; J.wa = Math.atan2(ptr.y - c[1], ptr.x - c[0]); } },
    drag() { if (!ptr.down) return;
      if (J.sub === 'dial' && J.px != null) { const dx = ptr.x - J.px; J.px = ptr.x; if (Math.abs(dx) < 0.5) return; J.dialA += dx * 0.01; const dir = dx > 0 ? 'R' : 'L'; if (dir !== J.dir) { J.dir = dir; J.trav = 0; } J.moved += Math.abs(dx); dialM.rotation.z = -J.dialA;
        const n = this.num(); if (n !== J.lastN) { J.lastN = n; J.trav++; const gr = this.green(); tone(gr ? 1800 : 3200, gr ? 0.05 : 0.012, 0.03, 'square'); } return; }
      if (J.sub === 'wheel' && J.wc) { const a = Math.atan2(ptr.y - J.wc[1], ptr.x - J.wc[0]); let d = a - J.wa; d = Math.atan2(Math.sin(d), Math.cos(d)); J.wa = a; J.wacc += Math.abs(d); wheel.rotation.z -= d; if ((J.wt = (J.wt || 0) + Math.abs(d)) > 0.6) { J.wt = 0; tone(300, 0.03, 0.08, 'square'); }
        if (J.wacc > Math.PI * 2.4) { J.sub = 'swing'; clunk(); toast('THE VAULT SWINGS OPEN!', 2); } } },
    release() { if (J.sub !== 'dial') return; if (this.green()) { click(); tone(1400, 0.06, 0.3, 'triangle'); J.ci++; J.dir = null; J.trav = 0; if (J.ci >= 3) { ding(); addGold(8); J.sub = 'bolts'; toast('PULL BACK THE 8 BOLTS \u00b7 TAP EACH ONE', 2.4); } }
      else if (J.moved > 80) { const c = J.combo[J.ci]; miss('MR. FARTHING: "' + (J.dir !== c[0] ? 'WRONG WAY! TURN ' + (c[0] === 'R' ? 'RIGHT' : 'LEFT') + ' TO ' + c[1] : 'LET GO ON ' + c[1] + ' WHEN IT GOES GREEN') + '."', 2.2); } J.moved = 0; },
    tick(dt) { if (J.sub === 'shut') { doorJob = Math.min(0, doorJob + dt * 0.9); if (doorJob >= 0) { clunk(); J.sub = 'dial'; toast('TURN THE DIAL \u00b7 DRAG LEFT AND RIGHT', 2.4); } }
      if (J.sub === 'swing') { doorJob = Math.max(-1.2, doorJob - dt * 0.6); if (doorJob <= -1.2) { ding(); addGold(10); holdOpen = 90; J.sub = 'opened'; NEXT('done', finishGame, 0.8); } } },
    card() { if (J.sub === 'dial' || J.sub === 'shut') { const n = J.sub === 'dial' ? this.num() : 0, gr = this.green(); return ['DRAG \u00b7 LET GO ON GREEN', big(String(n).padStart(2, '0'), gr ? GREEN : INK) + lab("THE COMBINATION (MR. FARTHING'S BOOK)") + lst(J.combo.map((c, i) => [DSTEEL, (c[0] === 'R' ? 'RIGHT \u2192 ' : 'LEFT \u2190 ') + c[1], i < J.ci ? '\u2713' : '', i < J.ci])), 'd' + n + J.ci + (gr ? 'g' : '') + J.sub]; }
      if (J.sub === 'bolts') { const n = BOLTS.filter(b => !b.out).length; return ['TAP EACH RED BOLT', row('#c42d3c', 'BOLTS BACK', n + ' / 8', n >= 8), 'b' + n]; }
      return ['DRAG ROUND IN A CIRCLE', lab('SPIN THE WHEEL') + meter((J.wacc || 0) / (Math.PI * 2.4), GOLD), 'w' + Math.round((J.wacc || 0) * 4) + J.sub]; },
    hint() { if (J.sub === 'dial') { const c = J.combo[J.ci]; return [wpos(dialM), this.green() ? 'LET GO' : c[0] === 'R' ? 'DRAG RIGHT' : 'DRAG LEFT']; } if (J.sub === 'bolts') { const b = BOLTS.find(q => q.out); return b ? [wpos(b.m), 'TAP'] : null; } if (J.sub === 'wheel') return [wpos(wheel), 'DRAG ROUND']; return null; },
    shot() { return J.sub === 'dial' ? [wpos(dialM), 1.3, 1.1, 0.1, 1.3, 0, 2.6, 0.5] : [V(92.6, 2.4, -112.0), 5.6, 5.2, 0.12, 4.2, 0.2, 8.0, 0.6]; },
    end() { doorJob = null; } };
  // ================= GAME 6: CASH CART RUN (walk: the cart rolls behind you, down the stairs to the cash cage) =================
  const WP = [[71.4, -120.9, 0, 'TO THE VAULT STAIRS'], [76.4, -120.9, 1, 'DOWN THE STAIRS'], [83.3, -116.3, 1, 'TO THE CASH CAGE'], [84.4, -121.9, 1, 'PARK IN THE BAY']];
  const T6 = { walk: true,
    begin(P) { J.trail = [[P.x, P.y || 0, P.z]]; J.wi = 0; J.t0 = J.t; J.ro = 0; if (tum) { tum.position.set(85.6, Y, -121.4); tum.rotation.y = -Math.PI / 2; } toast('THE CART ROLLS BEHIND YOU \u00b7 TAKE IT DOWN TO TUMBLER', 2.6); },
    goal() { const w = WP[J.wi]; return [w[0], w[1], w[2] ? Y : 0]; },
    tick(dt) { const P = J.P; if (!P) return; const py = P.y || 0, L = J.trail[J.trail.length - 1]; if (Math.hypot(P.x - L[0], P.z - L[2]) > 0.12) { J.trail.push([P.x, py, P.z]); if (J.trail.length > 90) J.trail.shift(); }
      let need = 1.6, px = P.x, pz = P.z, at = J.trail[0]; for (let i = J.trail.length - 1; i >= 0; i--) { const q = J.trail[i], d = Math.hypot(q[0] - px, q[2] - pz); if (d >= need) { at = q; break; } need -= d; px = q[0]; pz = q[2]; }
      const k = Math.min(1, dt * 8); CART.position.x += (at[0] - CART.position.x) * k; CART.position.z += (at[2] - CART.position.z) * k; CART.position.y += (at[1] - CART.position.y) * k;
      const dx = P.x - CART.position.x, dz = P.z - CART.position.z; if (Math.hypot(dx, dz) > 0.3) CART.rotation.y = Math.atan2(-dz, dx);
      const ro = CART.position.y < -1 ? -2 : 0; if (ro !== J.ro) { J.ro = ro; CART.traverse(o => { o.renderOrder = ro; }); }
      const w = WP[J.wi]; if (J.wi < WP.length - 1 && Math.hypot(P.x - w[0], P.z - w[1]) < 1.6 && (!w[2] || py < -2)) { J.wi++; pop(); } },
    prompt(P) { const w = WP[WP.length - 1]; return J.wi === WP.length - 1 && (P.y || 0) < -2 && Math.hypot(P.x - w[0], P.z - w[1]) < 1.7 ? 'PARK THE CART \u00b7 HAND IT TO TUMBLER' : null; },
    talk(P) { if (!this.prompt(P)) return false; const t = J.t - J.t0; addGold(14 + Math.max(0, Math.round(30 - t / 3))); J.miss = t <= 50 ? 0 : t <= 90 ? 1 : 3; coin(); coin(0.15); finishGame(); return true; },
    card() { const t = Math.round(J.t - J.t0); return [WP[J.wi][3], lst(WP.map((w, i) => ['#4f7a4a', w[3], i < J.wi ? '\u2713' : '', i < J.wi])) + lab('TIME ' + t + ' S \u00b7 UNDER 50 S = 3 STARS'), J.wi + '_' + Math.floor(t / 5)]; },
    end() { cartHome(); CART.traverse(o => { o.renderOrder = 0; }); if (tum) { tum.position.set(TUM0[0], Y, TUM0[1]); tum.rotation.y = TUM0[2]; } } };
  // ================= GAME 7: GOLD BARS (downstairs bullion store: weigh, keep or recast, stamp, stack) =================
  const decalT = CT(64, 64, (g, W) => { g.clearRect(0, 0, W, W); g.fillStyle = '#7a5a12'; g.font = '900 48px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', W / 2, W / 2 + 3); });
  const T7 = {
    begin() { const ws = shuffle([12.4, 12.5, 12.4, 11.6, 11.8]); J.bars = ws.map((w, i) => { const m = own(this.bar()); m.position.set(BCART.x - 0.4 + (i % 3) * 0.4, BCART.y + 0.07 + (i / 3 | 0) * 0.11, BCART.z + (i / 3 | 0) * 0.1); return { w, m }; }); J.i = 0; J.slot = 0; this.next(); },
    bar() { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.1, 4, 1), new THREE.MeshPhongMaterial({ color: BARG, shininess: 90, specular: 0x886622 })); m.geometry.rotateY(Math.PI / 4); m.scale.set(1, 1, 0.55); return m; },
    next() { const b = J.bars[J.i]; J.sub = 'weigh'; fly(b.m, V(SCALE.x, SCALE.y + 0.05, SCALE.z), 0.5, 0.25, () => { if (J && J.g === 'gold') { J.sub = 'judge'; tone(700, 0.03, 0.2); } }); },
    choose(keep) { if (J.sub !== 'judge') return; const b = J.bars[J.i], ok = b.w >= 12.4; if (keep !== ok) miss('TUMBLER: "' + (ok ? b.w.toFixed(1) + ' KG IS A FULL BAR. KEEP IT."' : 'ONLY ' + b.w.toFixed(1) + ' KG. TOO LIGHT, RECAST IT."'), 2.4); else { ding(); addGold(3); } hidePick(); J.sub = 'move';
      if (ok) fly(b.m, V(PRESS.x, PRESS.y + 0.05, PRESS.z), 0.4, 0.15, () => { if (J && J.g === 'gold') { J.sub = 'stamp'; toast('TAP THE STAMP', 1.6); } });
      else fly(b.m, V(BINP.x, BINP.y + 0.25, BINP.z), 0.5, 0.35, () => { b.m.visible = false; tone(140, 0.08, 0.3, 'square'); this.after(); }); },
    press() { if (J.flies.length) return; const b = J.bars[J.i];
      if (J.sub === 'stamp') { if (dist(scrW(pressHead.position)) > RAD() * 2.6 && dist(scrW(b.m.position)) > RAD() * 2.6) return; J.sub = 'slam'; J.pt = 0; J.stamped = false; return; }
      if (J.sub === 'stack') { if (dist(scrW(b.m.position)) > RAD() * 2.6) return; J.sub = 'move'; const sl = [[-0.4, 0], [0, 0], [0.4, 0], [-0.2, 1], [0.2, 1]][J.slot++ % 5]; fly(b.m, V(PAL.x + sl[0], PAL.y + 0.07 + sl[1] * 0.11, PAL.z), 0.6, 0.4, () => { clink(); this.after(); }); } },
    after() { if (++J.i < J.bars.length) this.next(); else { ding(); addGold(8); NEXT('done', finishGame, 0.8); } },
    tick(dt) { const b = J.bars[J.i], on = b && (J.sub === 'judge' || (J.sub === 'weigh' && !J.flies.length)), a = on ? -2.2 + clamp((b.w - 10) / 3.5, 0, 1) * 4.4 : -2.2; needle.rotation.z += (-a - needle.rotation.z) * Math.min(1, dt * 6);
      if (J.sub === 'slam') { J.pt += dt; pressHead.position.y = DY + 0.86 - Math.sin(Math.min(1, J.pt / 0.32) * Math.PI) * 0.6; if (J.pt > 0.16 && !J.stamped) { J.stamped = true; stampS(); const d = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: decalT, transparent: true })); d.rotation.x = -Math.PI / 2; d.position.y = 0.052; b.m.add(d); shine(b.m.position); }
        if (J.pt >= 0.32) { pressHead.position.y = DY + 0.86; J.sub = 'stack'; toast('TAP THE BAR \u00b7 STACK IT ON THE PALLET', 1.8); } } },
    ui() { if (J.sub !== 'judge') return false; const b = J.bars[J.i], key = 'gb' + J.i; if (pickKey === key) return true;
      showPick(key, 'KEEP OR RECAST?', 'BAR ' + (J.i + 1) + ' / ' + J.bars.length, big(b.w.toFixed(1) + ' KG') + lab('A FULL BAR IS 12.4 KG OR MORE'), [{ label: 'KEEP \u00b7 STAMP IT', go: () => this.choose(true) }, { label: 'RECAST \u00b7 TOO LIGHT', primary: true, go: () => this.choose(false) }], 2); return true; },
    card() { return [J.sub === 'stamp' ? 'TAP THE STAMP' : J.sub === 'stack' ? 'TAP THE BAR TO STACK IT' : 'WEIGHING\u2026', lst(J.bars.map((b, i) => [BARG, 'BAR ' + (i + 1), i < J.i ? (b.w >= 12.4 ? 'KEPT' : 'RECAST') : i === J.i ? '\u2026' : '', i < J.i])), J.i + J.sub]; },
    hint() { const b = J.bars[J.i]; if (J.sub === 'stamp') return [pressHead.position.clone(), 'TAP']; if (J.sub === 'stack' && b) return [b.m.position.clone(), 'TAP']; return null; },
    shot() { return [V(98.1, DY + 0.2, -118.2), 3.8, 1.8, 0.78, 2.4, Math.PI, 4.2, 0.6]; },
    end() { pressHead.position.y = DY + 0.86; } };
  // ================= GAME 8: CHEQUE CHECK (signature matches the card · words = the number; pay or refuse) =================
  const CHQ = V(88.6, 0.815, -103.98), SIGC = V(89.38, 0.816, -104.22);
  const rng = s => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const sig = (g, x, y, w, h, seed, alt) => { const R = rng(seed), R2 = rng(seed * 7 + 3); g.strokeStyle = '#1d2c6a'; g.lineWidth = Math.max(2, h / 12); g.lineCap = 'round'; g.beginPath(); let px = x, py = y; g.moveTo(px, py);
    for (let k = 0; k < 7; k++) { const r = alt && k >= 2 && k <= 4 ? R2 : R, nx = x + (k + 1) / 7 * w, ny = y + (r() - 0.5) * h; g.bezierCurveTo(px + r() * w / 5, py - r() * h, nx - r() * w / 5, ny + r() * h * 0.8, nx, ny); px = nx; py = ny; if (alt && k >= 2 && k <= 4) { R(); R(); R(); R(); R(); } }
    if (!alt) { g.moveTo(x, y + h * 0.5); g.quadraticCurveTo(x + w / 2, y + h * 0.8, x + w, y + h * 0.35); } g.stroke(); };
  const ONES = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'], TENS = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY', 'ONE HUNDRED'];
  const words = n => n < 20 ? ONES[n] : TENS[n / 10 | 0] + (n % 10 ? '-' + ONES[n % 10] : '');
  const T8 = {
    begin() { J.list = shuffle([null, null, null, 'sig', 'amt']); J.i = 0; this.show(); },
    show() { const bad = J.list[J.i], r = pickCus(), amt = 12 + (Math.random() * 80 | 0), seed = 1000 + (Math.random() * 1e6 | 0); let wd = amt; if (bad === 'amt') { wd = amt + pickR([-10, 10, 9, -9]); if (wd < 1 || wd > 99) wd = amt > 50 ? amt - 10 : amt + 10; } const name = r.name.toUpperCase(); J.q = { bad, amt, name };
      const t1 = CT(512, 224, (g, W, H) => { g.fillStyle = '#f3efe2'; g.fillRect(0, 0, W, H); g.fillStyle = BANKG; g.fillRect(0, 0, W, 36); g.fillStyle = '#ffd23a'; g.font = '900 22px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('BANK OF MERU \u00b7 CHEQUE', 14, 19); g.fillStyle = INK; g.font = '800 20px Archivo, sans-serif'; g.fillText('PAY: THE BEARER', 14, 64);
        fitTxt(g, words(wd) + ' GOLD', 14, 104, 340, 24); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(370, 84, 128, 42); g.font = '900 28px Archivo, sans-serif'; g.fillText(amt + ' G', 384, 106); g.font = '800 16px Archivo, sans-serif'; g.fillText('FROM: ' + name, 14, 152); g.fillRect(300, 200, 196, 2); sig(g, 304, 178, 186, 30, seed, bad === 'sig'); });
      const t2 = CT(320, 192, (g, W) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, 192); g.strokeStyle = INK; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, 186); g.fillStyle = INK; g.font = '900 18px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('SIGNATURE CARD', 14, 24); g.font = '800 16px Archivo, sans-serif'; fitTxt(g, name, 14, 52, W - 28, 16, 800); g.fillRect(14, 166, W - 28, 2); sig(g, 34, 132, 250, 40, seed, false); });
      const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.27), new THREE.MeshBasicMaterial({ map: t1 }))); m.rotation.x = -Math.PI / 2; m.position.copy(CHQ).add(V(0, 0, 0.4)); fly(m, CHQ, 0.3, 0.05, null);
      if (!J.sc) { J.sc = own(new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.2), new THREE.MeshBasicMaterial({ map: t2 }))); J.sc.rotation.x = -Math.PI / 2; J.sc.position.copy(SIGC); } else J.sc.material.map = t2;
      J.cm = m; J.t1 = t1; J.sub = 'judge'; },
    choose(pay) { if (J.sub !== 'judge') return; const q = J.q, ok = !q.bad; if (pay !== ok) miss('MR. FARTHING: "' + (q.bad === 'sig' ? 'COMPARE THE SIGNATURES. THEY DON\'T MATCH!' : q.bad === 'amt' ? 'THE WORDS AND THE BOX DISAGREE. REFUSE IT.' : 'SIGNATURE MATCHES, WORDS MATCH. PAY IT!') + '"', 2.6); else { ding(); addGold(4); }
      stampS(); redrawT(J.t1, g => { g.save(); g.translate(250, 150); g.rotate(-0.2); g.strokeStyle = ok ? '#2f7a4a' : '#c42d3c'; g.fillStyle = g.strokeStyle; g.lineWidth = 6; g.strokeRect(-86, -28, 172, 56); g.font = '900 32px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ok ? 'PAID' : 'REFUSED', 0, 2); g.restore(); });
      hidePick(); J.sub = 'move'; const m = J.cm, i0 = J.i; NEXT('nx', () => { fly(m, V(87.9, 0.82 + i0 * 0.003, -103.8), 0.3, 0.05, null); if (++J.i < J.list.length) NEXT('nx2', () => this.show(), 0.35); else NEXT('done', finishGame, 0.6); }, 0.9); },
    ui() { if (J.sub !== 'judge') return false; const key = 'cq' + J.i; if (pickKey === key) return true;
      showPick(key, 'PAY OR REFUSE?', 'CHEQUE ' + (J.i + 1) + ' / ' + J.list.length, lab('SIGNATURE MATCHES THE CARD?') + lab('WORDS = THE NUMBER IN THE BOX?'), [{ label: 'PAY IT', go: () => this.choose(true) }, { label: 'REFUSE', primary: true, go: () => this.choose(false) }], 2); return true; },
    card() { return ['NEXT CHEQUE', lab('CHEQUE ' + Math.min(J.list.length, J.i + 1) + ' / ' + J.list.length), 'm' + J.i + J.sub]; },
    shot() { return [V(88.95, 0.82, -104.08), 1.6, 0.75, 1.2, 1.1, 0, 2.6, 0.8]; } };
  // ================= GAME 9: NEW ACCOUNT (fill the form from what they say, stamp it) =================
  const homeTxt = h => { const [b, n] = String(h).split(' '); return (b === 'crest' ? 'CRESTVIEW ' : b === 'lake' ? 'LAKESIDE ' : 'BARRACKS BUNK ') + n; };
  const TYPES = ['SAVINGS', 'EVERYDAY', 'BUSINESS'], FORM = V(93.5, 1.066, -91.35), STAMPP = V(94.3, 1.1, -91.2);
  const T9 = {
    begin() { J.ci = 0; const st = own(new THREE.Group()); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.12, 10), LM(RED)); h.position.y = 0.08; st.add(h); const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.04, 0.07), LM(INK)); st.add(b); st.position.copy(STAMPP); J.st = st; this.cus(); },
    cus() { const r = putCus(93.5, 0, -92.95, 0), others = shuffle(ROSTER.filter(q => q !== r)), home = homeTxt(r.home), amt = pickR([20, 30, 40, 50, 60, 80]), type = pickR(TYPES); const homes = [home]; for (const q of shuffle(ROSTER.slice())) { const hh = homeTxt(q.home); if (!homes.includes(hh)) homes.push(hh); if (homes.length >= 3) break; }
      const nice = home.charAt(0) + home.slice(1).toLowerCase().replace(/ (\w)/g, (m0, c) => ' ' + c.toUpperCase());
      J.F = [{ k: 'NAME', want: r.name.toUpperCase(), opts: shuffle([r.name.toUpperCase(), others[0].name.toUpperCase(), others[1].name.toUpperCase()]) }, { k: 'HOME', want: home, opts: shuffle(homes) }, { k: 'ACCOUNT', want: type, opts: TYPES.slice() }, { k: 'FIRST DEPOSIT', want: amt + ' G', opts: shuffle([amt, amt + 10, amt - 10 >= 10 ? amt - 10 : amt + 20]).map(n => n + ' G') }];
      J.fi = 0; J.fm = 0; J.got = []; J.say = "I'm " + r.name + ', ' + nice + '. A ' + type.toLowerCase() + ' account, please, with ' + amt + ' gold.';
      if (!J.fT) { J.fT = CT(256, 340, () => {}); const m = own(new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.56), new THREE.MeshBasicMaterial({ map: J.fT }))); m.rotation.x = -Math.PI / 2; m.position.copy(FORM); } J.stamped = false; this.draw(); J.sub = 'form'; toast(J.C.name + ': "' + J.say.toUpperCase() + '"', 3); },
    draw() { redrawT(J.fT, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.fillStyle = BANKG; g.fillRect(0, 0, W, 40); g.fillStyle = '#ffd23a'; g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('NEW ACCOUNT', 14, 21);
      J.F.forEach((f, i) => { const y = 64 + i * 62; g.fillStyle = '#8a857e'; g.font = '800 14px Archivo, sans-serif'; g.fillText(f.k, 14, y); g.fillStyle = INK; g.fillRect(14, y + 34, W - 28, 2); g.font = '900 18px Archivo, sans-serif'; if (J.got[i]) fitTxt(g, J.got[i], 14, y + 22, W - 28, 18); });
      if (J.stamped) { g.save(); g.translate(W / 2, H - 34); g.rotate(-0.15); g.strokeStyle = '#2f7a4a'; g.fillStyle = '#2f7a4a'; g.lineWidth = 5; g.strokeRect(-80, -20, 160, 40); g.font = '900 24px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('APPROVED', 0, 2); g.restore(); } }); },
    choose(o) { if (J.sub !== 'form') return; const f = J.F[J.fi]; if (o !== f.want) { J.fm++; miss('MR. FARTHING: "' + (J.fm >= 2 ? f.k + ' IS ' + f.want + '.' : 'NOT WHAT THEY SAID. READ IT AGAIN.') + '"', 2.2); return; }
      pop(); J.got.push(o); J.fi++; J.fm = 0; this.draw(); if (J.fi >= J.F.length) { hidePick(); J.sub = 'stamp'; toast('TAP THE STAMP', 1.6); } },
    press() { if (J.sub !== 'stamp' || J.flies.length) return; if (dist(scrW(J.st.position)) > RAD() * 2.4 && dist(scrW(FORM)) > RAD() * 2.4) return; J.sub = 'move'; fly(J.st, V(FORM.x, FORM.y + 0.03, FORM.z + 0.12), 0.25, 0.15, () => { stampS(); J.stamped = true; this.draw(); ding(); addGold(8); fly(J.st, STAMPP, 0.3, 0.1, null);
        toast(J.C.name + ': "MY VERY OWN ACCOUNT. SPLENDID!"', 1.8); NEXT('next', () => { if (J.cf) J.cf.visible = false; if (++J.ci < 2) this.cus(); else finishGame(); }, 1.6); }); },
    ui() { if (J.sub !== 'form') return false; const f = J.F[J.fi], key = 'ac' + J.ci + '_' + J.fi + '_' + J.fm; if (pickKey === key) return true;
      showPick(key, 'NEW ACCOUNT', f.k, quote(J.say) + lab('FILL IN: ' + f.k), f.opts.map(o => ({ label: o, go: () => this.choose(o) })), 0); return true; },
    card() { return [J.sub === 'stamp' ? 'TAP THE STAMP' : 'NEXT CUSTOMER', lab('CUSTOMER ' + (J.ci + 1) + ' / 2'), 's' + J.sub + J.ci]; },
    hint() { return J.sub === 'stamp' ? [J.st.position.clone(), 'TAP'] : null; },
    shot() { return J.sub === 'stamp' || J.sub === 'move' ? [V(93.75, 1.05, -91.3), 1.2, 0.8, 1.0, 1.1, 0, 2.2, 0.4] : [V(93.5, 1.3, -91.9), 2.4, 2.2, 0.6, 2.1, 0, 3.8, 0.5]; } };
  // ================= GAME 10: ATM REFILL (outside: service mode, cassettes to their colour, shut, test) =================
  const T10 = {
    begin() { J.sub = 'start'; J.door = 0; J.loaded = 0; J.order = shuffle(CASS.slice()); drawAtm('SERVICE MODE', 'TAP THE SCREEN', '#ffd23a');
      const cart = own(new THREE.Group()); { const B2 = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), LM(c)); m.position.set(x, y, z); cart.add(m); }; B2(0.8, 0.05, 0.8, DSTEEL, 0, 0.78, 0); for (const [dx, dz] of [[-0.36, -0.36], [0.36, -0.36], [-0.36, 0.36], [0.36, 0.36]]) B2(0.04, 0.78, 0.04, STEEL, dx, 0.39, dz); } cart.position.set(95.3, 0, -78.25);
      J.cs = CASS.map((v, i) => { const m = own(new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.42, 0.3), LM(NOTE[v]))); const tg = tagSprite(v + ' G', '#ffffff', INK, 0.26); tg.position.set(0, 0.3, 0); m.add(tg); const home = V(95.15 + (i % 2) * 0.3, 1.02, -78.42 + (i / 2 | 0) * 0.36); m.position.copy(home); return { v, m, home, done: false }; });
      J.slotM = ASLOT.map((s, i) => { const t = own(new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.46), new THREE.MeshBasicMaterial({ color: NOTE[J.order[i]], transparent: true, opacity: 0.55 }))); t.position.set(s.x, s.y, AZ + 0.135); t.visible = false; t.userData.full = false; return t; }); toast('TAP THE ATM SCREEN', 1.8); },
    press() { if (J.flies.length) return;
      if (J.sub === 'start' && dist(scrW(atmScr.position)) < RAD() * 3) { beep(); J.sub = 'opening'; drawAtm('OPEN THE SAFE', 'LOAD 4 CASSETTES', '#ffd23a'); return; }
      if (J.sub === 'load') { const c = nearestOf(J.cs.filter(q => !q.done), q => q.m.position, 1.4); if (c) J.held = c; return; }
      if (J.sub === 'shut' && dist(scrW(V(AX, 0.62, AZ + 0.8))) < RAD() * 3.4) { J.sub = 'closing'; return; }
      if (J.sub === 'test' && dist(scrW(atmScr.position)) < RAD() * 3) { J.sub = 'cash'; beep(); drawAtm('TEST \u00b7 20 G', 'COUNTING\u2026'); const n = own(noteMesh(20)); n.position.set(AX - 0.32, 1.12, AZ + 0.3); n.rotation.x = Math.PI / 2; fly(n, V(AX - 0.32, 1.1, AZ + 0.55), 0.6, 0, null); swish();
        NEXT('done', () => { drawAtm('BANK OF MERU', 'WELCOME \u00b7 INSERT CARD'); ding(); addGold(10); finishGame(); }, 1.4); } },
    drag() { if (!J.held || !ptr.down) return; const p = hitZ(AZ + 0.5); if (!p) return; J.held.m.position.set(clamp(p.x, AX - 0.7, 95.9), clamp(p.y, 0.3, 1.7), AZ + 0.5); },
    release() { const c = J.held; if (!c) return; J.held = null; const p = c.m.position; let bi = -1, bd = 0.24; ASLOT.forEach((s, i) => { if (J.slotM[i].userData.full) return; const d = Math.hypot(p.x - s.x, p.y - s.y); if (d < bd) { bd = d; bi = i; } });
      if (bi < 0) { fly(c.m, c.home, 0.25, 0.05, null); return; } if (J.order[bi] !== c.v) { miss('MR. FARTHING: "THAT SLOT TAKES ' + J.order[bi] + 'S. MATCH THE COLOUR."', 2); fly(c.m, c.home, 0.25, 0.05, null); return; }
      c.done = true; J.slotM[bi].userData.full = true; clunk(); fly(c.m, V(ASLOT[bi].x, ASLOT[bi].y, AZ + 0.2), 0.2, 0, null); J.loaded++; if (J.loaded >= 4) { ding(); addGold(6); J.sub = 'shut'; drawAtm('SHUT THE SAFE', 'TAP THE DOOR', '#ffd23a'); toast('TAP THE DOOR TO SHUT IT', 1.6); } },
    tick(dt) { if (J.sub === 'opening') { J.door = Math.min(1, J.door + dt * 2); if (J.door >= 1) { J.sub = 'load'; J.slotM.forEach(m => { m.visible = true; }); toast('DRAG EACH CASSETTE INTO ITS COLOUR', 2.2); } }
      if (J.sub === 'closing') { J.door = Math.max(0, J.door - dt * 2); if (J.door <= 0) { clunk(); J.sub = 'test'; J.slotM.forEach(m => { m.visible = false; }); drawAtm('READY', 'TAP TO TEST 20 G'); toast('TAP THE SCREEN TO TEST IT', 1.8); } } atmDoor.rotation.y = -J.door * 1.7; },
    card() { const st = { start: 'TAP THE SCREEN', opening: 'OPENING\u2026', load: 'DRAG EACH TO ITS COLOUR', shut: 'TAP THE DOOR', closing: 'SHUTTING\u2026', test: 'TAP THE SCREEN TO TEST', cash: 'TESTING\u2026' }[J.sub] || 'ATM';
      return [st, lst(CASS.map(v => { const c = J.cs.find(q => q.v === v); return [NOTE[v], v + ' G CASSETTE', c.done ? '\u2713' : '', c.done]; })), J.sub + J.loaded]; },
    hint() { if (J.sub === 'start' || J.sub === 'test') return [atmScr.position.clone(), 'TAP']; if (J.sub === 'shut') return [V(AX, 0.62, AZ + 0.6), 'TAP THE DOOR'];
      if (J.sub === 'load') { if (J.held) { const i = J.order.indexOf(J.held.v); return [V(ASLOT[i].x, ASLOT[i].y, AZ + 0.2), 'DROP HERE']; } const c = J.cs.find(q => !q.done); return c ? [c.m.position.clone(), 'DRAG'] : null; } return null; },
    shot() { return [V(94.5, 1.0, -79.1), 3.8, 2.4, 0.3, 3.0, 0.3, 5.6, 0.8]; },
    end() { atmDoor.rotation.y = 0; drawAtm('BANK OF MERU', 'WELCOME \u00b7 INSERT CARD'); } };
  // ================= GAME 11: PIGGY BANK DAY (pop the cork, count the coins, a junior passbook) =================
  let kidF = null; const PIG = V(79.05, 1.21, -91.6);
  const T11 = {
    kid() { if (!kidF) { kidF = kit.makeFox({ key: 'bankKid', torso: ['#ffd23a', '#e0b23a', '#a87a12'], outfit: 'tee', mood: 'happy' }); kidF.scale.setScalar(0.62); G.add(kidF); } return kidF; },
    begin() { const kid = this.kid(); kid.visible = true; kid.position.set(78.5, 0, -92.85); kid.rotation.y = 0; J.kn = pickR(['PIP', 'TIBBY', 'NUTMEG', 'SPROUT']); J.C = { name: J.kn };
      const pg = own(new THREE.Group()); pg.position.copy(PIG); const pink = LM('#f2a0b8'), dk = LM('#e8869f'), add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); pg.add(m); return m; };
      add(new THREE.SphereGeometry(0.15, 14, 10), pink, 0, 0, 0).scale.set(1.3, 1, 1); add(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 12), dk, -0.2, 0, 0).rotation.z = Math.PI / 2;
      for (const s of [-1, 1]) { add(new THREE.ConeGeometry(0.04, 0.07, 6), dk, -0.1, 0.14, s * 0.07); for (const t of [-1, 1]) add(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), dk, t * 0.09, -0.15, s * 0.07); }
      add(new THREE.BoxGeometry(0.08, 0.01, 0.015), LM(INK), 0, 0.15, 0); const cork = add(new THREE.CylinderGeometry(0.035, 0.03, 0.05, 10), LM('#a87a4a'), 0.2, 0, 0); cork.rotation.z = Math.PI / 2; J.cork = cork; J.pig = pg;
      J.vals = shuffle([10, 10, 5, 5, 5, 1, 1, 1, 1, 10, 5]).slice(0, 8 + (Math.random() * 3 | 0)); J.total = J.vals.reduce((a, b) => a + b, 0); J.sub = 'cork'; J.cnt = { 1: 0, 5: 0, 10: 0 }; J.wr = 0; toast(J.kn + ': "I SAVED ALL YEAR! CAN I HAVE A REAL ACCOUNT?"', 2.6); },
    press() { if (J.flies.length) return;
      if (J.sub === 'cork') { if (dist(scrW(wpos(J.cork))) > RAD() * 2.2 && dist(scrW(J.pig.position)) > RAD() * 2.2) return; pop(); tone(900, 0.05, 0.15); J.cork.visible = false;
        J.coins = J.vals.map((v, i) => { const m = own(coinMesh(v)); m.position.copy(J.pig.position).add(V(0.2, 0, 0)); fly(m, V(78.3 + Math.random() * 1.0, 1.066, -91.75 + Math.random() * 0.4), 0.4 + i * 0.05, 0.12, null); return { v, m, done: false }; }); J.sub = 'count'; coin(); coin(0.1); return; }
      if (J.sub === 'count') { const q = nearestOf(J.coins.filter(c => !c.done), c => c.m.position, 1.2); if (!q) return; q.done = true; coin(); fly(q.m, V({ 1: 77.75, 5: 78.0, 10: 78.25 }[q.v], 1.066 + J.cnt[q.v] * 0.015, -91.25), 0.25, 0.08, null); J.cnt[q.v]++; if (J.coins.every(c => c.done)) NEXT('total', () => {}, 0.4); return; }
      if (J.sub === 'book') { if (dist(scrW(J.book.position)) > RAD() * 2.4) return; J.sub = 'give'; fly(J.book, V(78.5, 1.0, -92.6), 0.5, 0.2, () => { J.book.visible = false; }); ding(); addGold(8); toast(J.kn + ': "MY OWN BANK BOOK! THANK YOU!"', 2.2); NEXT('done', finishGame, 1.6); } },
    choose(n) { if (J.sub !== 'total') return; if (n !== J.total) { J.wr++; miss('MR. FARTHING: "COUNT THE PILES: COPPER 1, SILVER 5, GOLD 10."', 2.4); return; } ding(); addGold(6); J.sub = 'sticker'; },
    stick(i) { if (J.sub !== 'sticker') return; pop(); hidePick(); const t = CT(128, 160, (g, W, H) => { g.fillStyle = '#2e4a6b'; g.fillRect(0, 0, W, H); g.fillStyle = GOLD; g.fillRect(0, 0, W, 26); g.fillStyle = INK; g.font = '900 15px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('JUNIOR SAVER', 10, 14);
        g.fillStyle = '#ffffff'; g.font = '900 22px Archivo, sans-serif'; g.fillText(J.kn, 10, 50); g.font = '800 16px Archivo, sans-serif'; g.fillText(J.total + ' G', 10, 76); const cx = 64, cy = 120;
        if (i === 0) { g.fillStyle = '#ffd23a'; g.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 11 : 26; g.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); g.fill(); }
        else if (i === 1) { g.fillStyle = '#ec3013'; g.beginPath(); g.moveTo(cx, cy - 28); g.lineTo(cx + 13, cy + 14); g.lineTo(cx - 13, cy + 14); g.closePath(); g.fill(); g.fillStyle = '#ffd23a'; g.fillRect(cx - 6, cy + 14, 12, 10); }
        else { g.fillStyle = '#e8792b'; g.beginPath(); g.arc(cx, cy + 4, 20, 0, 7); g.fill(); g.beginPath(); g.moveTo(cx - 20, cy - 4); g.lineTo(cx - 14, cy - 30); g.lineTo(cx - 4, cy - 14); g.fill(); g.beginPath(); g.moveTo(cx + 20, cy - 4); g.lineTo(cx + 14, cy - 30); g.lineTo(cx + 4, cy - 14); g.fill(); } });
      const side = LM('#2e4a6b'), b = own(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.02, 0.26), [side, side, new THREE.MeshBasicMaterial({ map: t }), side, side, side])); b.position.set(78.6, 1.075, -91.25); J.book = b; J.sub = 'book'; toast('TAP THE BANK BOOK TO HAND IT OVER', 2); },
    ui() { if (J.sub === 'total') { const key = 'pg' + J.wr; if (pickKey === key) return true; const a = J.total, opts = shuffle([a, a + 5, Math.max(1, a - 4)]);
        showPick(key, 'HOW MUCH?', J.kn + "'S SAVINGS", lab('COPPER ' + J.cnt[1] + ' \u00b7 SILVER ' + J.cnt[5] + ' \u00b7 GOLD ' + J.cnt[10]) + lab('COPPER = 1 \u00b7 SILVER = 5 \u00b7 GOLD = 10'), opts.map(n => ({ label: n + ' GOLD', go: () => this.choose(n) })), 3); return true; }
      if (J.sub === 'sticker') { if (pickKey === 'pgs') return true; showPick('pgs', 'PICK A STICKER', 'FOR THE BANK BOOK', '', ['GOLD STAR', 'ROCKET', 'LITTLE FOX'].map((l, i) => ({ label: l, go: () => this.stick(i) })), 0); return true; } return false; },
    card() { if (J.sub === 'cork') return ['TAP THE CORK', lab(J.kn + "'S PIGGY BANK"), 'cork'];
      return [J.sub === 'book' ? 'TAP THE BANK BOOK' : 'TAP EACH COIN TO COUNT IT', lst([[COIN[1].c, 'COPPER \u00b7 1', String(J.cnt[1]), false], [COIN[5].c, 'SILVER \u00b7 5', String(J.cnt[5]), false], [COIN[10].c, 'GOLD \u00b7 10', String(J.cnt[10]), false]]), 'c' + J.cnt[1] + J.cnt[5] + J.cnt[10] + J.sub]; },
    hint() { if (J.sub === 'cork') return [wpos(J.cork), 'TAP THE CORK']; if (J.sub === 'count') { const c = J.coins.find(q => !q.done); return c ? [c.m.position.clone(), 'TAP'] : null; } if (J.sub === 'book') return [J.book.position.clone(), 'TAP']; return null; },
    shot() { return [V(78.6, 1.12, -91.55), 1.7, 1.2, 0.8, 1.5, 0, 3.0, 0.5]; },
    end() { if (kidF) kidF.visible = false; } };
  // ================= GAME 12: LOCK-UP (walk: 4 shutters + 5 lamps, then the alarm in order) =================
  let lockHold = 0; const resetLock = () => { lockHold = 0; SHUT.forEach(s => { s.want = 0; }); LAMPS.forEach(l => { l.off = false; }); drawAl(false); };
  const T12 = { walk: true,
    begin() { J.todo = [...SHUT.map((s, i) => ({ k: 's', i, x: s.x, z: -81.7, n: 'SHUTTER ' + (i + 1) })), ...LAMPS.map((l, i) => ({ k: 'l', i, x: l.x, z: i < 3 ? -99.1 : -90.2, n: i < 3 ? 'COUNTER LAMP ' + (i + 1) : 'DESK LAMPS ' + (i - 2) }))]; J.todo.forEach(t => { t.done = false; });
      J.seq = [...shuffle(['VAULT', 'DOORS', 'MOTION']), 'ARM']; J.btnO = shuffle(J.seq.slice()); J.si = 0; J.sub = 'walk'; toast('LOCK UP: SHUTTERS, LAMPS, THEN THE ALARM BY THE DOOR', 2.8); },
    left() { return J.todo.filter(t => !t.done); },
    goal() { const l = this.left(); if (!l.length) return [ALX, ALZ - 1.2, 0]; const P = J.P; let b = l[0], bd = 1e9; for (const t of l) { const d = Math.hypot(P.x - t.x, P.z - t.z); if (d < bd) { bd = d; b = t; } } return [b.x, b.z, 0]; },
    near(P) { return this.left().find(t => Math.hypot(P.x - t.x, P.z - t.z) < 1.6); },
    atPanel(P) { return Math.hypot(P.x - ALX, P.z - (ALZ - 1.1)) < 1.6; },
    prompt(P) { if (J.sub === 'alarm') return null; const t = this.near(P); if (t) return (t.k === 's' ? 'LOWER \u00b7 ' : 'SWITCH OFF \u00b7 ') + t.n; return this.atPanel(P) ? 'SET THE ALARM' : null; },
    talk(P) { if (J.sub === 'alarm') return true; const t = this.near(P); if (t) { t.done = true; if (t.k === 's') { SHUT[t.i].want = 1; tone(220, 0.04, 0.6, 'sawtooth'); } else { LAMPS[t.i].off = true; click(); } addGold(2); toast(this.left().length ? t.n + ' \u2713' : 'ALL DONE \u00b7 NOW THE ALARM BY THE DOOR', 1.8); return true; }
      if (this.atPanel(P)) { if (this.left().length) { miss('MR. FARTHING: "SHUTTERS AND LAMPS FIRST, THEN THE ALARM."', 2); return true; } J.sub = 'alarm'; beep(); return true; } return false; },
    press4(s) { if (J.sub !== 'alarm' || J.seq.indexOf(s) < J.si) return; if (s !== J.seq[J.si]) { miss('MR. FARTHING: "' + J.seq[J.si] + ' NEXT. FOLLOW THE ORDER."', 1.8); return; } tone(1200 + J.si * 200, 0.05, 0.15, 'square');
      if (++J.si >= 4) { hidePick(); drawAl(true); lockHold = 25; ding(); addGold(10); finishGame(); } },
    ui() { if (J.sub !== 'alarm') return false; const key = 'al' + J.si + '_' + J.miss; if (pickKey === key) return true;
      showPick(key, 'SET THE ALARM', 'STEP ' + (J.si + 1) + ' / 4', lab('IN ORDER: ' + J.seq.map((s, i) => (i < J.si ? '\u2713 ' : '') + s).join(' \u2192 ')), J.btnO.map(s => ({ label: s, on: J.seq.indexOf(s) < J.si, go: () => this.press4(s) })), 2); return true; },
    card() { const l = this.left(); return [l.length ? 'WALK UP + E \u00b7 ' + l.length + ' LEFT' : 'THE ALARM BY THE DOOR', lst(J.todo.map(t => [t.k === 's' ? DSTEEL : '#ffd27a', t.n, t.done ? '\u2713' : '', t.done])), l.length + '_' + J.sub]; },
    end() { if (J.si < 4) resetLock(); } };
  const GD = { teller: T1, coins: T2, fake: T3, deposit: T4, vault: T5, cart: T6, gold: T7, cheque: T8, account: T9, atm: T10, piggy: T11, lockup: T12 };
  // ================= run a game =================
  let lastP = null, outT = 0;
  function startGame(g, P) { if (busy) return; save.setStat('bkVisits', save.stat('bkVisits', 0) + 1); const q = GN[g];
    J = { g, C: null, miss: 0, gold: 0, objs: [], flies: [], att: [], t: 0, sub: '', pause: 0, P, down: !!q.down }; busy = 'job';
    if (P && RINGS[g] && !q.walk) Object.assign(P, { x: RINGS[g][0], z: RINGS[g][1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, q = GN[g], stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('bkDone', d); save.setStat('bkN_' + g, save.stat('bkN_' + g, 0) + 1); const gift = giveGift(); K.finish(g, stars, gold, first); const P0 = J.P, walk = q.walk, dn = !!q.down; stop(); endClear = 7;
    if (P0 && !walk && g !== 'atm') { if (dn) Object.assign(P0, { x: 75.4, z: -118.0, sp: 0, yaw: -0.96 }); else Object.assign(P0, { x: 86, z: -93.6, sp: 0, yaw: Math.PI }); }
    const vault = dn || g === 'cart', k = save.stat('bkClears', 1) % 4;
    const OPEN = vault ? ['Hm. Good work.', 'Clean as a new coin.', 'The vault approves.', 'Not bad. Not bad at all.'][k] : ['Splendid work!', 'Ho ho! Sharp as a new penny!', "That's banking, that is!", 'Polished like a gold bar!'][k];
    const GIFT = { coat: " Your banker's waistcoat and visor! The Tailor keeps them too.", choc: ' Three coin chocolates! Each heals 30.', choc1: ' A coin chocolate for you.', rate: ' Staff rate now: 3% a day on your savings.', slots: ' Six more locker slots for you.', piggy: ' The Golden Piggy Bank, for your Home shelf!', all: ' All twelve jobs! A stamped gold ingot, plus 60 gold.' }[gift] || '';
    sayTo(vault ? tmE : fmE, [(vault ? lnT : lnF)(OPEN + ' ' + gold + ' gold.' + GIFT)]); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.att.forEach(o => o.parent && o.parent.remove(o)); if (J.cf) J.cf.visible = false; }
    if (kidF) kidF.visible = false; doorJob = null; uvGlow.material.opacity = 0; busy = null; J = null; ptr.down = false; hideCard(); hidePick(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g]; if (g.ui && g.ui()) { hideCard(); return; } hidePick(); const c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : J.C ? 'FOR ' + J.C.name : 'BANK OF MERU') + foot(c[0], g.walk) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.P = P; if (J.flies.length) flyTick(dt); const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return;
    if (g.goal) { const go = g.goal(), y0 = go[2] || 0; arrowM.visible = true; beacon.visible = true; arrowM.position.set(go[0], y0 + 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], y0 + 0.09, go[1]); }
    drawCard(); }
  // ---------- camera (each tap job frames its station; portrait = wide lens + subject slid under the card) ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99, offK = 1]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * offK * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GD[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.06; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const g = J.g, p = camCur.pos; if (DOWN[g]) p.set(clamp(p.x, 64.3, 105.7), clamp(p.y, Y + 0.35, -0.45), clamp(p.z, -124.1, -113.3)); else if (OUT[g]) p.set(clamp(p.x, 86, 101), clamp(p.y, 0.6, 5), clamp(p.z, AZ + 0.6, -70)); else p.set(clamp(p.x, 62.6, 109.4), clamp(p.y, 0.6, 8.4), clamp(p.z, -124.4, -80.7));
    cam.position.copy(p); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inBank = P => P.x > X0 && P.x < X1 && P.z > Z0 && P.z < Z1 - 0.2 && (P.y || 0) > -5 && (P.y || 0) < 2.5;
  const atFront = P => P.x > 86 && P.x < 101 && P.z > -80 && P.z < -72 && (P.y || 0) < 2;
  const upL = P => (P.y || 0) > -1.5, downL = P => (P.y || 0) < -2;
  const ringAt = P => GAMES.find(q => Math.hypot(P.x - RINGS[q.k][0], P.z - RINGS[q.k][1]) < 1.05 && (DOWN[q.k] ? downL(P) : upL(P)));
  const nearFar = P => upL(P) && Math.hypot(P.x - far.position.x, P.z - far.position.z) < 2.3;
  const nearTum = P => !!tum && downL(P) && Math.hypot(P.x - tum.position.x, P.z - tum.position.z) < 2.3;
  const nearWell = P => upL(P) && inBank(P) && Math.hypot(P.x - WX, P.z - WZ) < 2.3, nearND = P => atFront(P) && Math.hypot(P.x - NDX, P.z - (AZ + 0.9)) < 1.3;
  function prompt(P) { const iB = inBank(P), iO = atFront(P); if (!iB && !iO) return null;
    if (J && GD[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearFar(P) ? 'MR. FARTHING \u00b7 STOP THE JOB' : null); } if (busy) return null;
    const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (iB && upL(P) && K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (nearFar(P)) return 'TALK \u00b7 MR. FARTHING'; if (nearTum(P)) return 'TALK \u00b7 TUMBLER';
    if (nearWell(P)) return 'TOSS A COIN \u00b7 1 G'; if (nearND(P)) return 'NIGHT DEPOSIT \u00b7 BANK ' + save.data.gold + ' G'; return null; }
  const HELLO = ['Ho ho! Ambrose Farthing, manager. Twelve jobs in my bank, each a little treasure. Work?', 'Back again! Coins love a steady paw. What shall it be?', 'Splendid timing! The ledgers are waiting. Ready?', 'Every penny counts, my friend. Shall we count some?'];
  const FACTS = ['The first Meru coins were copper. The king\u2019s face wore off, so now they show a fox.', 'Gold never rusts. That\u2019s why it sleeps so well in the vault.', 'A full gold bar weighs twelve and a half kilos. Mind your toes!', 'Real notes glow under UV light. Fakers always forget the stripe.', 'A deposit box needs two keys: ours and yours. Neither works alone.', 'Save it here and lose a fight, and your savings stay safe.', 'Tumbler downstairs has four jobs of his own. Tell him I sent you.'];
  const T_HELLO = ['Tumbler. I keep the vault. Quiet down here. Four jobs, if you want them.', 'Back down? Mind the gate.', 'The gold is restless today. Work?'];
  const STORIES = ['Forty years down here. Not one lost coin. One lost sandwich, though.', 'That vault door weighs more than six tanks. I oil the hinges every week.', 'Every drawer has a story. Most of them are grandad\u2019s medals.', 'Tap a gold bar and it sings. Ever so faintly. Listen.'];
  const nextJob = down => { const d = done(), list = GAMES.filter(q => !!q.down === down || (down && q.k === 'cart')); return (list.find(q => !d[q.k]) || list.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const farMenu = first => { const go = k => () => { if (!busy) startGame(k, lastP); };
    const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(false), lastP); } }, { text: 'THE TELLER WINDOW', pick: go('teller') }, { text: 'OPEN THE VAULT', pick: go('vault') }, { text: 'LOCK UP FOR THE NIGHT', pick: go('lockup') },
      { text: 'A COIN FACT, PLEASE', pick: () => sayTo(fmT, [lnF(FACTS[talkedF % FACTS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(fmT, [{ ...lnF(first ? HELLO[0] : HELLO[1 + (talkedF % 3)]), choices: ch }]); };
  const tumMenu = first => { const go = k => () => { if (!busy) startGame(k, lastP); };
    const ch = [{ text: CHOICE_WORK, pick: () => { if (busy) return; const k = nextJob(true); if (k === 'cart') sayTo(tmT, [lnT('Bring me the cash cart from upstairs. It waits behind the teller desks.')]); else startGame(k, lastP); } }, { text: 'THE STRONGROOM', pick: go('deposit') }, { text: 'THE BULLION', pick: go('gold') },
      { text: 'A VAULT STORY, PLEASE', pick: () => sayTo(tmT, [lnT(STORIES[talkedT % STORIES.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(tmT, [{ ...lnT(first ? T_HELLO[0] : T_HELLO[1 + (talkedT % 2)]), choices: ch }]); };
  let wc = null; const wishCoin = coinMesh(10); wishCoin.visible = false; G.add(wishCoin);
  function wish(P) { if (!save.spend(1)) { toast('NO GOLD FOR A WISH', 1.6); return; } wc = { t: 0, from: V(P.x, 1.5, P.z), to: V(WX + rnd(-0.5, 0.5), 0.5, WZ + rnd(-0.5, 0.5)) }; wishCoin.visible = true; coin(); const n = save.stat('bkWish', 0) + 1; save.setStat('bkWish', n); toast(WISH[n % WISH.length].toUpperCase(), 2.6); }
  function talk(P) { lastP = P; if (J && GD[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearFar(P)) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; }
    if (busy) return true; if (!inBank(P) && !atFront(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (inBank(P) && upL(P) && K.atHiring(P)) { ding(); startGame(nextJob(false), P); return true; }
    if (nearFar(P)) { tone(1320, 0.05, 0.6); farMenu(!talkedF++); return true; } if (nearTum(P)) { tone(880, 0.05, 0.6); tumMenu(!talkedT++); return true; }
    if (nearWell(P)) { wish(P); return true; }
    if (nearND(P)) { const n = law ? law.deposit(save.data.gold) : 0; if (n) { coin(); coin(0.12); toast('NIGHT DEPOSIT \u00b7 ' + n + ' G BANKED \u00b7 SAVINGS ' + law.bank() + ' G', 2.6); } else toast('NO GOLD TO DEPOSIT', 1.6); return true; } return false; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ---------- the look, every frame ----------
  let tkT = 0, lastPP = null, wasIn = false;
  function lookTick(dt, t, P) { const h = hour0(), up = upL(P), iB = inBank(P);
    skyNM.opacity = 1 - clamp(Math.min(h - 6, 19.5 - h) / 1.5, 0, 1); beamM.opacity = (h < 7 || h > 18.5 ? 0 : clamp(Math.min(h - 7, 18.5 - h) / 2, 0, 1)) * 0.06; beam.visible = beamM.opacity > 0.003;
    let sp = 0; if (lastPP) sp = Math.hypot(P.x - lastPP[0], P.z - lastPP[1]) / Math.max(dt, 1e-3); lastPP = [P.x, P.z];
    let want = up && Math.hypot(P.x - RVX, P.z - RVZ) < 2.4 && sp > 0.3 ? 1.6 : 0; for (const c of K.customers) if (c.f && c.f.visible && Math.hypot(c.f.position.x - RVX, c.f.position.z - RVZ) < 2.2) want = Math.max(want, 1.1);
    rvSpin += (want - rvSpin) * Math.min(1, dt * 2); wings.rotation.y += rvSpin * dt;
    { G.updateWorldMatrix(true, false); const cl = G.worldToLocal(camera.position.clone()), inD = Math.hypot(cl.x - RVX, cl.z - RVZ) < RVR + 0.6 && cl.y < RVH + 0.6; wings.visible = !inD; RVA.forEach(a => { a.visible = !inD; }); }
    tickT.offset.x = (tickT.offset.x + dt * 0.035) % 1; if ((tkT -= dt) <= 0) { tkT = 2; drawTicker(); drawClocks(); }
    if (iB && up && h >= 9 && h < 18) { qT0 -= dt; if (qT0 <= 0) { qT0 = rnd(16, 30); qNum = qNum % 999 + 1; qWin = 1 + (Math.random() * 5 | 0); drawQ(); tone(1046, 0.04, 0.5); tone(784, 0.04, 0.7, 'sine', 0.25); } }
    holdOpen = Math.max(0, holdOpen - dt); const open = (h >= 9 && h < 18) || holdOpen > 0, tgt = doorJob != null ? doorJob : open ? -1.2 : 0, prev = doorA;
    doorA += (tgt - doorA) * Math.min(1, dt * (doorJob != null ? 20 : 0.8)); if (VD) VD.rotation.y = doorA; if (prev < -0.05 && doorA >= -0.05 && doorJob == null && iB && up) clunk();
    if (!(J && J.g === 'vault')) { const shut = doorA > -0.3; for (const b of BOLTS) if (b.out !== shut) T5.bolt(b, shut); }
    const nightShut = doorA > -0.1 && !open && !(J && J.g === 'vault'); redStrip.visible = RLT.visible = nightShut; if (nightShut) RLT.material.opacity = 0.5 + 0.4 * Math.sin(t * 3);
    TW1.visible = up; TW1.material.opacity = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.3)); TW1.material.size = 0.07 + 0.07 * Math.abs(Math.sin(t * 3.1)); TW2.material.opacity = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + 1)); TW2.material.size = 0.06 + 0.06 * Math.abs(Math.sin(t * 2.6 + 2));
    jet.scale.y = 1 + 0.08 * Math.sin(t * 9); { const a = spray.geometry.attributes.position.array; sprD.forEach((s, i) => { s.t = (s.t + dt * 0.9) % 1; a[i * 3] = WX + Math.cos(s.a) * s.t * 0.42; a[i * 3 + 1] = 1.95 + Math.sin(s.t * Math.PI) * 0.22 - s.t * 0.7; a[i * 3 + 2] = WZ + Math.sin(s.a) * s.t * 0.42; }); spray.geometry.attributes.position.needsUpdate = true; }
    if (sparkT > 0) { sparkT -= dt; const a = sparkle.geometry.attributes.position.array; for (let i = 0; i < 10; i++) { a[i * 3] = sparkAt.x + rnd(-0.2, 0.2); a[i * 3 + 1] = sparkAt.y + rnd(0, 0.3); a[i * 3 + 2] = sparkAt.z + rnd(-0.2, 0.2); } sparkle.geometry.attributes.position.needsUpdate = true; sparkle.visible = true; sparkle.material.opacity = Math.min(1, sparkT * 2); } else sparkle.visible = false;
    SHUT.forEach(s => { s.k += (s.want - s.k) * Math.min(1, dt * 1.5); s.g.visible = s.k > 0.01; s.g.scale.y = Math.max(0.001, s.k); }); LAMPS.forEach(l => { l.m.visible = l.off; });
    if (lockHold > 0 && !busy) { lockHold -= dt; if (lockHold <= 0 || (wasIn && !iB)) resetLock(); } wasIn = iB;
    if (wc) { wc.t += dt / 0.6; const k = Math.min(1, wc.t); wishCoin.position.lerpVectors(wc.from, wc.to, k); wishCoin.position.y += Math.sin(k * Math.PI) * 0.8; wishCoin.rotation.x += dt * 14; if (k >= 1) { wishCoin.visible = false; wc = null; noise(0.3, 0.04, 1500); tone(520, 0.03, 0.3); shine(V(WX, 0.7, WZ)); } } }
  // ---------- per frame ----------
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - 86, P.z + 102); G.visible = d < (touch ? 75 : 140); toastT -= dt; applyWear(fox); lastP = P;
    if (busy === 'job' && J) { const ok = OUT[J.g] ? atFront(P) || inBank(P) : inBank(P); outT = ok ? 0 : outT + dt; if (outT > (GD[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GD[J.g].walk && fox) fox.visible = false;
    if (!G.visible) return; if (busy === 'job' && J) jobTick(dt, P); hintTick(t); lookTick(dt, t, P);
    if (busy === 'job' && J && !GD[J.g].walk) far.rotation.y += Math.atan2(Math.sin(FAR0[2] - far.rotation.y), Math.cos(FAR0[2] - far.rotation.y)) * Math.min(1, dt * 3);
    if (tum && !(J && J.g === 'cart')) { const dd = Math.hypot(P.x - tum.position.x, P.z - tum.position.z), a = downL(P) && dd < 4.5 ? Math.atan2(P.x - tum.position.x, P.z - tum.position.z) : TUM0[2] + Math.sin(t * 0.5) * 0.15; tum.rotation.y += Math.atan2(Math.sin(a - tum.rotation.y), Math.cos(a - tum.rotation.y)) * Math.min(1, dt * 3); }
    endClear -= dt; K.tick(dt, P, { inShop: inBank(P) && upL(P), busy: !!busy, near: Math.hypot(P.x - 86, P.z + 90), talking: false, clear: endClear > 0 ? [86, -94.8, 3.0] : null }); }
  drawTicker(); drawClocks();
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GD[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), far, tum, GD, RINGS, toW,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) { if (busy === 'job' && J && lastP) jobTick(dt, lastP); if (lastP) lookTick(dt, performance.now() / 1000, lastP); } }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), _box: () => (J && J.box ? boxPos(J.box) : null), scr: v => scrW(v), finish: () => finishGame(), pick, card,
    dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__bank = API; return API;
}
