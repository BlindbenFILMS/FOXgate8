import { applyD, lifeD } from '../engine/fox-poses.js?v=s648k';   // s630 life poses
// MERU 2.0 — s121 BURGERS DELUXE PART D (Ben's LOOK + LIFE list, s118). Built + ticked inside worlds/meru2-burger-jobs.js as LF. OLD frame (hall 70..103.4 × 32..64).
// LOOK: grill smoke + fryer steam with a looping sizzle (louder near the grill, busier in a rush) · the diner JUKEBOX (81.5, 56.4) is playable (E = a song, E again = next;
// strips cycle colour, the record spins) · NEON: SHAKES + DRIVE-THRU (new) and the old BURGERS signs flicker with a buzz · 3 CEILING FANS over the door lane ·
// MILKSHAKE BAR on the west wall south of the door (3 spindle mixers that whir by turns) · DRIVE-THRU hatch in the kitchen's south wall (x 82.2): cars pull up outside, ding-dong, the hatch slides, a bag goes out.
// LIFE: customers on the stools, in the booths (not your booth at x 86.5) and at the counter, eating; LUNCH RUSH 11-14 + DINNER RUSH 17-20 fill the house. Hidden while a job or the shift runs.
// (Sun patches + dust motes come from the shop kit since part A; Bun's delivery loop since part B.)
export function bgLife(X) {
  const { THREE, G, box, cyl, LM, CT, kit, cols, touch, hour, tone, noise, toast, isMuted, inRoom, busyQ } = X;
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', PINK = '#ff3fb4', CYAN = '#52e3ff', CHROME = '#cbd5e1', MINT = '#7fd1c7', ROSE = '#f6c6d8';
  const hr = () => (((hour ? hour() : 12) % 24) + 24) % 24, rnd = (a, b) => a + Math.random() * (b - a), muted = () => { try { return !!(isMuted && isMuted()); } catch (e) { return true; } };
  const rushQ = () => { const h = hr(); return h >= 11 && h < 14 ? 'LUNCH' : h >= 17 && h < 20 ? 'DINNER' : null; }, openQ = () => { const h = hr(); return h >= 7 && h < 23.5; };
  const SG = new THREE.Group(); SG.name = 'burgerLook'; G.add(SG);
  const LG = new THREE.Group(); LG.name = 'burgerLife'; G.add(LG); LG.visible = false;
  const colF = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] });
  const ADD = (c, op = 1) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
  const soft = CT(64, 64, (g, w) => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 31); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.5, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, w, w); });
  const neonTex = (w, h, t, fs, col) => CT(w, h, (c, W, H) => { c.clearRect(0, 0, W, H); c.textBaseline = 'middle'; c.font = '900 ' + fs + 'px Archivo, sans-serif'; c.shadowColor = col; c.shadowBlur = 18; c.strokeStyle = col; c.lineWidth = 6; c.strokeText(t, 14, H / 2); c.shadowBlur = 0; c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.strokeText(t, 14, H / 2); });
  const plane = (par, tex, w, h, x, y, z, ry, add) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), add ? new THREE.MeshBasicMaterial({ map: tex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }) : new THREE.MeshBasicMaterial({ map: tex, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const label = (t, bg, fg, w = 512, h = 96, fs = 44) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = '900 ' + fs + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(t, 16, H / 2 + 2); });
  // ================= GRILL SMOKE + FRYER STEAM + the sizzle loop =================
  const SRC = [{ x: 88.45, y: 1.12, z: 61.65, w: 1.0, c: '#d9d4cc' }, { x: 85.15, y: 1.2, z: 61.7, w: 0.5, c: '#f3f2f2' }];
  const NS = touch ? 6 : 11, SMK = [...Array(NS)].map((_, i) => { const S = SRC[i % 3 === 2 ? 1 : 0], s = new THREE.Sprite(new THREE.SpriteMaterial({ map: soft, color: S.c, transparent: true, opacity: 0, depthWrite: false }));
    s.userData = { S, t: (i / NS) * 2.8, dx: rnd(-0.45, 0.45), dz: rnd(-0.3, 0.3), ph: Math.random() * 6 }; LG.add(s); return s; });
  let AC = null, SZ = null, szTry = 0;
  function sizzleInit() { if (SZ || muted()) return; const ua = navigator.userActivation; if (ua && !ua.hasBeenActive) return;
    try { AC = new (window.AudioContext || window.webkitAudioContext)(); const n = AC.sampleRate * 2 | 0, bf = AC.createBuffer(1, n, AC.sampleRate), d = bf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() < 0.015 ? 1 : 0.3);
      const s = AC.createBufferSource(); s.buffer = bf; s.loop = true; const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 5200; f.Q.value = 0.6; const g = AC.createGain(); g.gain.value = 0; s.connect(f).connect(g).connect(AC.destination); s.start(); SZ = { g }; } catch (e) { SZ = { g: null }; } }
  const szVol = v => { if (!SZ || !SZ.g || !AC) return; try { if (AC.state === 'suspended' && v > 0 && (szTry -= 1) < 0) { szTry = 120; AC.resume(); } SZ.g.gain.setTargetAtTime(v, AC.currentTime, 0.2); } catch (e) {} };
  // ================= THE DINER JUKEBOX (from the diner model, its face looks east) =================
  const JB = { x: 81.5, z: 56.4, fx: 81.8 };
  const jbStrip = [-0.38, 0.38].map(dz => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.2, 0.05), ADD(PINK, 0.95)); m.position.set(JB.fx, 0.78, JB.z + dz); m.renderOrder = 6; LG.add(m); return m; });
  { const m = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.05, 0.8), ADD(CYAN, 0.95)); m.position.set(JB.fx, 1.42, JB.z); m.renderOrder = 6; LG.add(m); jbStrip.push(m); }
  const disc = plane(LG, CT(64, 64, (c) => { c.fillStyle = '#0a0a0a'; c.beginPath(); c.arc(32, 32, 32, 0, 7); c.fill(); c.strokeStyle = '#2a2a2a'; c.lineWidth = 1; for (let r = 14; r < 31; r += 4) { c.beginPath(); c.arc(32, 32, r, 0, 7); c.stroke(); } c.fillStyle = RED; c.beginPath(); c.arc(32, 32, 10, 0, 7); c.fill(); c.fillStyle = YEL; c.fillRect(30, 22, 4, 8); }), 0.34, 0.34, JB.fx + 0.004, 1.1, JB.z, Math.PI / 2);
  plane(LG, label('JUKEBOX \u00b7 PLAY A SONG', INK, YEL, 512, 96, 40), 0.66, 0.12, JB.fx + 0.004, 0.5, JB.z, Math.PI / 2);
  const SONGS = [
    { n: 'A1 \u00b7 SIZZLE SHUFFLE', r: 261.63, bpm: 136, m: [0, 4, 7, 9, 7, 4, null, 0, 5, 9, 12, 9, 7, null, 4, null], b: [0, null, 7, null, 0, null, 7, null, 5, null, 12, null, 7, null, 2, null] },
    { n: 'B2 \u00b7 SHAKE IT UP, BABY', r: 293.66, bpm: 150, m: [0, 0, 3, 5, 7, null, 5, 3, 0, null, 10, 7, 5, 3, 0, null], b: [0, 0, 0, 0, 5, 5, 5, 5, 7, 7, 5, 5, 0, 0, -5, -5] },
    { n: 'C3 \u00b7 DOUBLE PATTY BOP', r: 220, bpm: 120, m: [7, null, 7, 9, 7, 4, 0, null, 2, null, 4, 5, 4, 2, 0, null], b: [0, null, 4, null, 7, null, 4, null, 5, null, 9, null, 7, null, 11, null] },
    { n: 'D4 \u00b7 DRIVE-THRU DOO-WOP', r: 246.94, bpm: 84, m: [0, null, 4, null, 7, 9, 7, null, 5, null, 9, null, 7, 4, 2, null], b: [0, null, null, null, -3, null, null, null, -7, null, null, null, -5, null, null, null] }];
  let songI = 0, PL = null;
  function playNext() { const S = SONGS[songI++ % SONGS.length]; PL = { S, i: 0, next: performance.now() / 1000 + 0.05, step: 60 / S.bpm / 2, left: 64 }; return S.n; }
  const nearJB = P => P.x > JB.x + 0.3 && Math.hypot(P.x - (JB.x + 1.0), P.z - JB.z) < 1.2;
  // ================= NEON (flicker + buzz) =================
  const NEON = [];
  const addNeon = (m, x, z) => { NEON.push({ m, x, z, ft: rnd(4, 14), f: 0 }); return m; };
  // ================= CEILING FANS over the door lane =================
  const FANS = [76, 86.5, 97].map(x => { const g = new THREE.Group(); g.position.set(x, 0, 48); SG.add(g); cyl(g, 0.02, 0.02, 0.5, INK, 0, 3.95, 0, 6); cyl(g, 0.15, 0.12, 0.16, CHROME, 0, 3.66, 0, 12); cyl(g, 0.11, 0.07, 0.08, '#fff2cc', 0, 3.52, 0, 12);
    const bl = new THREE.Group(); bl.position.y = 3.6; g.add(bl); for (let k = 0; k < 4; k++) { const a = new THREE.Group(); a.rotation.y = k * Math.PI / 2; bl.add(a); box(a, 0.92, 0.025, 0.2, '#7a4a2a', 0.6, 0, 0); box(a, 0.22, 0.02, 0.05, CHROME, 0.16, 0.012, 0); } bl.rotation.y = Math.random() * 3; return bl; });
  // ================= MILKSHAKE BAR (west wall, south of the door) =================
  const MB = { x: 70.5, z: 52.5 };
  box(SG, 0.8, 0.95, 2.6, ROSE, MB.x, 0.475, MB.z); box(SG, 0.86, 0.05, 2.66, '#e6e1d3', MB.x, 0.975, MB.z); box(SG, 0.82, 0.08, 2.62, CHROME, MB.x, 0.06, MB.z); box(SG, 0.02, 0.12, 2.62, MINT, MB.x + 0.41, 0.7, MB.z); colF(70.0, 70.95, 51.15, 53.85);
  const MIX = [MINT, ROSE, YEL].map((c, i) => { const z = MB.z - 0.75 + i * 0.75; box(SG, 0.2, 0.52, 0.2, c, 70.3, 1.26, z); box(SG, 0.34, 0.13, 0.22, c, 70.42, 1.56, z); box(SG, 0.26, 0.04, 0.26, c, 70.38, 1.02, z);
    const sp = new THREE.Group(); sp.position.set(70.53, 1.4, z); SG.add(sp); cyl(sp, 0.008, 0.008, 0.2, CHROME, 0, 0, 0, 6); box(sp, 0.07, 0.01, 0.015, CHROME, 0, -0.1, 0);
    const cup = cyl(SG, 0.065, 0.05, 0.19, CHROME, 70.53, 1.14, z, 12); cyl(SG, 0.06, 0.06, 0.01, ['#fff7e6', '#f9a8d4', '#fde68a'][i], 70.53, 1.225, z, 12);
    return { sp, cup, z, on: Math.random() < 0.4, t: rnd(1, 4) }; });
  for (let i = 0; i < 4; i++) { const z = MB.z - 1.05 + i * 0.7; cyl(SG, 0.045, 0.035, 0.16, '#f8fafc', 70.78, 1.08, z, 10); cyl(SG, 0.006, 0.006, 0.12, RED, 70.79, 1.2, z + 0.01, 4); }
  addNeon(plane(SG, neonTex(512, 128, 'SHAKES', 92, PINK), 1.8, 0.45, 70.13, 2.4, MB.z, Math.PI / 2, true), MB.x, MB.z);
  plane(SG, label('VANILLA \u00b7 STRAWBERRY \u00b7 BANANA', INK, WHITE, 640, 72, 36), 1.8, 0.2, 70.13, 1.95, MB.z, Math.PI / 2);
  // ================= DRIVE-THRU (kitchen south wall, x 82.2) =================
  const HX = 82.2, HZI = 63.9, HZO = 64.42;
  const frame = (z) => { box(SG, 1.32, 0.07, 0.07, CHROME, HX, 2.08, z); box(SG, 1.32, 0.07, 0.07, CHROME, HX, 1.12, z); for (const s of [-1, 1]) box(SG, 0.07, 1.0, 0.07, CHROME, HX + s * 0.62, 1.6, z); };
  frame(HZI); frame(HZO);
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.92), new THREE.MeshBasicMaterial({ color: '#a9cfe2' })); m.position.set(HX, 1.6, HZI + 0.04); m.rotation.y = Math.PI; SG.add(m); }
  const glassM = new THREE.MeshBasicMaterial({ color: '#e6f4fb', transparent: true, opacity: 0.4, depthWrite: false });
  const fixedP = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.015), glassM); fixedP.position.set(HX + 0.3, 1.6, HZI - 0.01); SG.add(fixedP);
  const slider = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.015), glassM); slider.position.set(HX - 0.3, 1.6, HZI - 0.035); SG.add(slider); box(slider, 0.03, 0.9, 0.03, CHROME, 0.28, 0, 0);
  cyl(SG, 0.05, 0.06, 0.06, YEL, HX - 0.68, 2.16, HZI - 0.04, 10);
  addNeon(plane(SG, neonTex(640, 128, 'DRIVE-THRU \u2192', 80, CYAN), 1.6, 0.32, HX, 2.42, HZI - 0.02, Math.PI, true), HX, 62);
  plane(SG, label('DRIVE-THRU \u00b7 PAY + PICK UP', RED, WHITE, 640, 96, 46), 1.6, 0.24, HX, 2.4, HZO + 0.02, 0);
  const CAR = new THREE.Group(); CAR.visible = false; LG.add(CAR); const carM = new THREE.MeshLambertMaterial({ color: RED });
  { const b = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.55, 1.5), carM); b.position.y = 0.55; CAR.add(b); const c = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.36), carM); c.position.set(-0.15, 1.07, 0); CAR.add(c);
    box(CAR, 1.64, 0.34, 1.4, '#1f2b33', -0.15, 1.08, 0); box(CAR, 3.04, 0.08, 1.54, CHROME, 0, 0.36, 0); for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const w = cyl(CAR, 0.28, 0.28, 0.2, INK, sx * 1.0, 0.28, sz * 0.72, 12); w.rotation.x = Math.PI / 2; }
    for (const sz of [-0.5, 0.5]) { box(CAR, 0.04, 0.12, 0.26, '#fff7cc', 1.51, 0.62, sz); box(CAR, 0.04, 0.1, 0.24, RED, -1.51, 0.62, sz); } }
  const BAG = new THREE.Group(); BAG.visible = false; LG.add(BAG); box(BAG, 0.22, 0.28, 0.15, WHITE, 0, 0, 0); box(BAG, 0.225, 0.06, 0.155, RED, 0, 0.04, 0);
  const CARZ = 66.0, STOPX = HX + 0.2, CARC = [RED, '#38bdf8', YEL, '#3f9a3a', WHITE, '#7c3aed'];
  let car = { ph: 'away', t: rnd(4, 10), x: 72 };
  const sendCar = () => { car = { ph: 'in', t: 0, x: 72 }; carM.color.set(CARC[Math.random() * CARC.length | 0]); CAR.visible = true; CAR.position.set(72, 0, CARZ); };
  // ================= CUSTOMERS =================
  const FURS = [{}, { fur: '#8a6a4a', furDark: '#5f4630', muzzle: '#ece0d0' }, { fur: '#a86a9a', furDark: '#7a4a70', muzzle: '#f4e4f0', lashes: 1 }, { fur: '#5a4a3a', furDark: '#3a2e22' }, { fur: '#c9743a', furDark: '#9a5426' }, { elder: 1 }];
  const LOOKS = [['#f97316', '#fff0e0', '#b05a1e', 'vest'], ['#5a8ac8', '#3d6aa0', '#2a4a70', 'coat'], ['#c75b9b', '#9a4078', '#6a2a50', 'dress', 1], ['#3f7a52', '#e9dcc4', '#22382a', 'vest'],
    ['#ffd23a', '#5c6670', INK, 'vest'], ['#7c3aed', '#ede9fe', '#4c1d95', 'coat'], ['#e07a30', '#fff0e0', '#b05a1e', 'dress', 1], ['#0e7fb8', '#e0f2fe', '#0b3a52', 'coat'], ['#52525b', '#e6ecf4', '#27272a', 'suit']];
  const Pof = f => f && f.userData && f.userData.P;
  const TABLES = [...[75, 80.5, 86, 91.5, 97].flatMap(x => [[x, 38.4], [x, 42.8]]), [74.5, 54.6], [78.5, 54.6], [74.5, 58.6], [78.5, 58.6], [96.3, 54.6], [100.3, 54.6], [96.3, 58.6], [100.3, 58.6]];
  const SEATS = [];
  TABLES.forEach(([x, z]) => { for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.6, sx = x + Math.sin(a) * 0.95, sz = z + Math.cos(a) * 0.95; SEATS.push({ x: sx, y: 0.13, z: sz, ry: Math.atan2(x - sx, z - sz), px: x + Math.sin(a) * 0.33, py: 0.81, pz: z + Math.cos(a) * 0.33 }); } });
  for (const [xs, tz] of [[[73, 77.5, 82, 91, 95.5, 100], 33.6], [[73, 77.5, 95.5, 100], 62.4]]) for (const x of xs) for (const dx of [-1, 1]) SEATS.push({ x: x + dx * 1.2, y: 0.07, z: tz, ry: dx < 0 ? Math.PI / 2 : -Math.PI / 2, px: x + dx * 0.32, py: 0.795, pz: tz, booth: 1 });
  for (let i = 0; i < 6; i++) { const x = 86.7 + 2.4 - i * 0.95; SEATS.push({ x, y: 0.43, z: 58.65, ry: 0, px: x, py: 1.18, pz: 59.98, ctr: 1 }); }
  { let s = 7; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; for (let i = SEATS.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [SEATS[i], SEATS[j]] = [SEATS[j], SEATS[i]]; } }
  // booths + counter first in the quiet hours (they feel lived-in), the rest of the room fills in a rush
  const ORDER = [...SEATS.filter(s => s.booth || s.ctr), ...SEATS.filter(s => !s.booth && !s.ctr)];
  const quiet = [ORDER.find(s => s.booth), ORDER.find(s => s.ctr), ...ORDER.filter(s => s.booth).slice(1, 3), ORDER.find(s => !s.booth && !s.ctr)].filter(Boolean);
  const rushSeats = [...ORDER.filter(s => s.booth).slice(0, touch ? 2 : 4), ...ORDER.filter(s => s.ctr).slice(0, touch ? 2 : 3), ...ORDER.filter(s => !s.booth && !s.ctr)];
  const MAXC = touch ? 6 : 12, CUST = [], FOOD = [];
  const custN = h => (h >= 11 && h < 14) || (h >= 17 && h < 20) ? MAXC : h >= 7 && h < 11 ? 3 : h >= 14 && h < 17 ? 4 : h >= 20 && h < 23 ? 4 : h >= 23 ? 1 : 0;
  const mkFood = j => { const g = new THREE.Group(); g.visible = false; LG.add(g); cyl(g, 0.13, 0.12, 0.015, WHITE, 0, 0, 0, 14);
    if (j % 3 === 0) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 6), LM('#c98a4a')); b.scale.y = 0.55; b.position.y = 0.05; g.add(b); cyl(g, 0.07, 0.07, 0.02, '#5a3420', 0, 0.035, 0, 10); }
    else if (j % 3 === 1) { box(g, 0.1, 0.08, 0.06, RED, 0, 0.045, 0); for (let k = 0; k < 6; k++) box(g, 0.012, 0.09, 0.012, YEL, rnd(-0.035, 0.035), 0.1, rnd(-0.02, 0.02)); }
    else { cyl(g, 0.045, 0.035, 0.17, '#f9a8d4', 0, 0.09, 0, 10); cyl(g, 0.006, 0.006, 0.12, RED, 0.02, 0.2, 0, 4); } return g; };
  let cKey = '';
  function custSet(n, rush) { const k = n + '|' + (rush ? 1 : 0); if (k === cKey) return; cKey = k; const list = (n > quiet.length ? rushSeats : quiet).slice(0, n);
    CUST.forEach(f => { f.visible = false; }); FOOD.forEach(g => { g.visible = false; });
    list.forEach((S, j) => { const f = CUST[j] || (CUST[j] = (() => { const lk = LOOKS[(j * 5 + 1) % LOOKS.length], q = kit.makeFox({ joints: true, key: 'mbrCu' + j, torso: lk.slice(0, 3), outfit: lk[3], female: !!lk[4], mood: j % 3 ? 'happy' : 'warm', look: FURS[j % FURS.length] }); q.userData.ph = Math.random() * 10; LG.add(q); return q; })());
      f.position.set(S.x, S.y, S.z); f.rotation.y = S.ry; f.visible = true; const g = FOOD[j] || (FOOD[j] = mkFood(j)); g.position.set(S.px, S.py, S.pz); g.visible = true; }); }
  const sit = (f, dt, t) => { kit.animFox(f, dt, 0, false); const P = Pof(f); if (!P) return; if (P.legs) P.legs.forEach(l => { l.rotation.x = -1.45; }); if (!P.fore && P.hero && P.body) P.body.position.y = -P.hero.dL; if (P.head) P.head.rotation.y = Math.sin(t * 0.4 + f.userData.ph) * 0.35;
    if (P.fore) { applyD(THREE, f, lifeD('sitEat', t, { ph: f.userData.ph || 0 }), t, 1); return; }
    if (P.arms && P.arms[1]) { const k = (t + f.userData.ph) % 7, b = k > 5.6 ? Math.sin((k - 5.6) / 1.4 * Math.PI) : 0; P.arms[1].rotation.x = -0.7 - b * 1.4; } };
  // ================= per frame =================
  let wasIn = false, hT = 0, neonFound = false, lastRush = null, wasBusy = false;
  function findNeon() { neonFound = true; let r = G; while (r.parent) r = r.parent; let a = false, b = false;
    r.traverse(o => { if (!o.isMesh || !o.geometry || o.geometry.type !== 'PlaneGeometry') return; const p = o.geometry.parameters, q = o.position;
      if (!a && Math.abs(p.width - 5.4) < 0.01 && Math.abs(p.height - 1.2) < 0.01 && Math.abs(q.x - 103.2) < 0.05 && Math.abs(q.z - 41) < 0.05) { a = true; addNeon(o, 103.2, 41).userData.ext = 1; }
      else if (!b && Math.abs(p.width - 3.2) < 0.01 && Math.abs(p.height - 0.8) < 0.01 && Math.abs(q.x + 4.4) < 0.05 && Math.abs(q.y - 3.4) < 0.05) { b = true; addNeon(o, 91.1, 58.4).userData.ext = 1; } }); }
  function tick(dt, P) { const t = performance.now() / 1000, here = inRoom(P), bz = !!(busyQ && busyQ()), rush = rushQ(), open = openQ();
    if (!neonFound) findNeon();
    if (here !== wasIn) { wasIn = here; LG.visible = here; if (!here) { PL = null; szVol(0); NEON.forEach(N => { N.f = 0; N.m.visible = true; }); lastRush = null; return; } hT = 0; }
    FANS.forEach(b => { b.rotation.y += dt * (rush ? 7.5 : 5); });
    if (!here) return;
    if ((hT -= dt) <= 0 || bz !== wasBusy) { hT = 2; wasBusy = bz; custSet(bz ? 0 : custN(hr()), !!rush); if (rush !== lastRush) { if (rush && !bz) toast(rush + ' RUSH \u00b7 A FULL HOUSE', 2.4); lastRush = rush; } }
    CUST.forEach(f => { if (f.visible) sit(f, dt, t); });
    // smoke + sizzle
    const I = bz || rush ? 1 : open ? 0.6 : 0.12;
    SMK.forEach(s => { const u0 = s.userData; u0.t += dt; if (u0.t > 2.8) { u0.t -= 2.8; u0.dx = rnd(-0.45, 0.45); u0.dz = rnd(-0.3, 0.3); } const u = u0.t / 2.8, S = u0.S;
      s.position.set(S.x + u0.dx * S.w * (0.4 + u * 0.4) + Math.sin(t * 1.3 + u0.ph) * 0.12 * u, S.y + u * (S.w > 0.6 ? 1.7 : 1.1), S.z + u0.dz * (0.5 + u * 0.3) - u * 0.25); const sc = (0.22 + u * 0.8) * (S.w > 0.6 ? 1 : 0.7); s.scale.set(sc, sc, 1);
      s.material.opacity = Math.sin(u * Math.PI) * (S.w > 0.6 ? 0.3 : 0.2) * I; });
    sizzleInit(); const dg = Math.hypot(P.x - 88.45, P.z - 61.65); szVol(muted() ? 0 : 0.05 * Math.max(0, 1 - dg / 11) * I);
    // jukebox
    if (PL) { const now = t; while (PL && PL.next < now + 0.12) { const S = PL.S, k = PL.i % 16, n = S.m[k], bn = S.b[k], off = Math.max(0, PL.next - now), v = Math.max(0.3, 1 - Math.hypot(P.x - JB.x, P.z - JB.z) / 20);
      if (n != null) tone(S.r * Math.pow(2, n / 12), 0.026 * v, PL.step * 0.85, 'square', off); if (bn != null) tone(S.r / 2 * Math.pow(2, bn / 12), 0.04 * v, PL.step * 0.95, 'triangle', off); if (k % 4 === 0) noise(0.04, 0.012 * v, 6000);
      PL.next += PL.step; PL.i++; if (PL.i >= PL.left) PL = null; } }
    const jp = PL ? 6 : 1.2; jbStrip.forEach((m, i) => m.material.color.setHSL((t * jp * 0.08 + i * 0.3) % 1, 1, 0.6)); if (PL) disc.rotation.z -= dt * 3.5;
    // neon flicker + buzz
    NEON.forEach(N => { if (N.f > 0) { N.f -= dt; N.m.visible = Math.random() < 0.55; if (N.f <= 0) N.m.visible = true; }
      else if ((N.ft -= dt) <= 0) { N.ft = rnd(7, 18); N.f = rnd(0.35, 0.8); if (Math.hypot(P.x - N.x, P.z - N.z) < 12) { tone(120, 0.012, N.f, 'sawtooth'); noise(N.f * 0.6, 0.007, 4000); } } });
    // milkshake mixers
    const dm = Math.hypot(P.x - MB.x, P.z - MB.z);
    MIX.forEach(M => { if ((M.t -= dt) <= 0) { M.on = !M.on && open; M.t = M.on ? rnd(2.5, 5) : rnd(rush ? 1.5 : 4, rush ? 4 : 10); if (M.on && dm < 7) { const v = 1 - dm / 7; tone(190, 0.014 * v, M.t, 'sawtooth'); tone(380, 0.006 * v, M.t, 'square'); } }
      if (M.on) { M.sp.rotation.y += dt * 45; M.cup.position.x = 70.53 + Math.sin(t * 60) * 0.004; } });
    // drive-thru
    if (car.ph === 'away') { if (open && (car.t -= dt) <= 0) sendCar(); }
    else { car.t += dt; const dh = Math.hypot(P.x - HX, P.z - 62.5), v = Math.max(0, 1 - dh / 16);
      if (car.ph === 'in') { const k = Math.min(1, car.t / 4), e = 1 - (1 - k) * (1 - k); car.x = 72 + (STOPX - 72) * e; if (k >= 1) { car.ph = 'wait'; car.t = 0; if (v > 0) { tone(784, 0.05 * v, 0.5, 'sine'); tone(622, 0.05 * v, 0.7, 'sine', 0.4); } } }
      else if (car.ph === 'wait') { const op = car.t > 1 && car.t < 5.2 ? 1 : 0; slider.position.x += ((op ? HX + 0.3 : HX - 0.3) - slider.position.x) * Math.min(1, dt * 6);
        if (car.t > 2.4 && car.t < 3.6) { BAG.visible = true; const k = (car.t - 2.4) / 1.2; BAG.position.set(HX - 0.3, 1.3 + Math.sin(k * Math.PI) * 0.1, 63.6 + k * 1.6); } else BAG.visible = false;
        if (car.t > 3.6 && !car.paid) { car.paid = true; if (v > 0) tone(1318, 0.03 * v, 0.15, 'triangle'); }
        if (car.t > 6) { car.ph = 'out'; car.t = 0; if (v > 0) tone(70, 0.02 * v, 1.4, 'sawtooth'); } }
      else if (car.ph === 'out') { const k = Math.min(1, car.t / 4); car.x = STOPX + (97 - STOPX) * k * k; if (k >= 1) { CAR.visible = false; car = { ph: 'away', t: rush ? rnd(9, 18) : rnd(20, 40), x: 72 }; } }
      CAR.position.x = car.x; CAR.children.forEach(c => { if (c.geometry && c.geometry.type === 'CylinderGeometry') c.rotation.y -= (car.ph === 'wait' ? 0 : dt * 6); }); } }
  function prompt(P) { if (!inRoom(P)) return null; if (nearJB(P)) return PL ? 'JUKEBOX \u00b7 NEXT SONG' : 'JUKEBOX \u00b7 PLAY A SONG'; return null; }
  function talk(P) { if (!inRoom(P)) return false; if (nearJB(P)) { const n = playNext(); toast('\u266A ' + n, 2.6); return true; } return false; }
  return { tick, away: () => { if (wasIn) { wasIn = false; LG.visible = false; PL = null; szVol(0); lastRush = null; } }, prompt, talk, sendCar, play: playNext, stopSong: () => { PL = null; }, SEATS, CUST, NEON, car: () => car, _set: o => { if (o && o.n != null) { cKey = ''; custSet(o.n, !!o.rush); } } };
}
