// MERU 2.0 — s100 ARCADE CABINET MENUS (Ben): E at a cabinet in Meru Lanes → the player steps up to the machine and puts both hands on the controls,
// the camera eases in OVER THE SHOULDER to the cabinet's own screen, and a live menu plays ON that screen:
//   1 PLAYER (starts the game straight away: the game's own PLAY button is pressed for you) · MULTIPLAYER (opens the share-link page) ·
//   OPTIONS / INSTRUCTIONS (how to play + every button on that game's own welcome card; pick one and the game opens on it).
// START = jingle + white flash + the camera pushes through the glass → the game panel (page) with its arcade load screen.
// When the panel closes you are back at the cabinet: GAME OVER (+ score if the game posts { type: '8gates:score', score }) and the cabinet's top 5.
// Controls: ↑ ↓ / W S / joystick = move · E / Enter / 1 / TALK / tap a line = pick · Esc / Space / 3 (JUMP) = back / leave.
export const CAB_TIPS = {
  'MARSH BLASTER': ['AIM WITH THE MOUSE OR YOUR FINGER', 'CLICK OR TAP TO FIRE A CORK', 'OUT OF CORKS? HIT RELOAD'],
  'DUSTY GULCH': ['AIM WITH THE MOUSE OR YOUR FINGER', 'CLICK OR TAP TO SHOOT', 'QUICK HANDS SCORE THE MOST'],
  'HUMAN COMBAT': ['BLOCK HIGH, MID OR LOW', 'STRIKE WHEN THEY OPEN UP', 'WIN THE ROUNDS TO WIN THE DUEL'],
  'TANK RANGE': ['DRIVE WITH THE STICK OR WASD', 'AIM AND FIRE AT THE TARGETS', 'BEAT THE CLOCK'],
  SUBMARINE: ['STEER WITH THE STICK OR WASD', 'TAP 1 TO GRAB · HOLD 1 FOR A TORPEDO', 'SPACE GOES UP · 2 GOES DOWN · R = SONAR'],
  SURF: ['POINT THE BOARD WITH THE STICK OR WASD', '1 = CARVE · 2 = TRICK', 'SPACE TO PADDLE AND JUMP'],
  PINBALL: ['LEFT SIDE / Z / \u2190 = LEFT FLIPPER · RIGHT SIDE / M / \u2192 = RIGHT', 'HOLD THE RIGHT SIDE TO PULL THE PLUNGER · LET GO TO LAUNCH', '3 LOCKS IN THE GATE HOLE = MULTIBALL'],
  'CLAW CRANE': ['MOVE THE CLAW WITH THE STICK, WASD OR ARROWS', 'TAP 1 OR PRESS SPACE TO DROP', 'GREEN RING = A GOOD GRAB · PRIZES GO ON YOUR SHELF'] };
export const CAB_LINES = {
  'MARSH BLASTER': 'The marsh is full of tin ducks. Pop them all.', 'DUSTY GULCH': 'Outlaws ride into town at sundown.', 'HUMAN COMBAT': 'Two blades. One winner.',
  'TANK RANGE': 'Treads down. Turret up. Targets ahead.', SUBMARINE: 'Dive deep. Watch the pressure.', SURF: 'The big swell is rolling in.', PINBALL: 'Three balls. One high score. Keep it on the table.', 'CLAW CRANE': 'Plush creatures, truck minis and rare fox heroes. Grab one.' };
// the buttons on each game's own welcome card (seeds from the game files; replaced by what the page reads off the real card after a first play: localStorage arcade.cards.v1)
export const CAB_CARD_SEED = {
  'MARSH BLASTER': [{ t: 'PLAY SOLO', p: 1 }, { t: 'PASS & PLAY', s: '2-4 players on one phone' }, { t: 'ONLINE', s: 'up to 4 friends' }, { t: 'ASSIST' }, { t: 'SOUND' }, { t: 'DEMO', s: 'watch' }, { t: 'HELP', s: 'how to' }],
  'HUMAN COMBAT': [{ t: 'STORY', s: 'the second', p: 1 }, { t: 'LADDER', s: '5 + boss' }, { t: 'PRACTICE', s: 'dummy' }, { t: 'ONLINE', s: '1v1 · room code' }, { t: 'DEMO' }, { t: 'MOVE LIST' }],
  SUBMARINE: [{ t: 'HOW TO PLAY · WATCH THE DEMO' }], 'CLAW CRANE': [{ t: 'PLAY', s: 'uses your tries', p: 1 }, { t: 'PRACTICE', s: 'free · nothing kept' }, { t: 'PASS & PLAY', s: '2 players · 3 tries each' }, { t: 'DEMO', s: 'watch' }], 'TANK RANGE': [], SURF: [], 'DUSTY GULCH': [] };
const YEL0 = '#ffd23a';
  // ---------- game art: a little scene + the stylised title (menu header + the load-screen poster) ----------
export function scene(g, name, x, y, s, acc, t) { g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round'; const ink = '#201e1d';
    if (name === 'DUSTY GULCH') { g.fillStyle = '#fff1c8'; g.beginPath(); g.arc(70, -10, 26, 0, 7); g.fill(); g.fillStyle = '#7a3a1a'; g.beginPath(); g.moveTo(-90, 40); g.lineTo(-60, 0); g.lineTo(-20, 0); g.lineTo(0, 40); g.fill();
      g.fillStyle = '#3f6b2a'; g.fillRect(26, -6, 12, 46); g.fillRect(12, 4, 8, 20); g.fillRect(12, 4, 16, 7); g.fillRect(44, -2, 8, 18); g.fillRect(36, 8, 16, 7); }
    else if (name === 'MARSH BLASTER') { g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(0, 10, 34, 20, 0, 0, 7); g.fill(); g.beginPath(); g.arc(28, -12, 14, 0, 7); g.fill(); g.fillStyle = '#ff8a1a'; g.beginPath(); g.moveTo(40, -12); g.lineTo(58, -8); g.lineTo(40, -4); g.fill(); g.fillStyle = ink; g.beginPath(); g.arc(31, -15, 3, 0, 7); g.fill();
      g.strokeStyle = '#3f6b2a'; g.lineWidth = 5; for (const [a, h] of [[-70, 50], [-56, 40], [64, 46], [78, 36]]) { g.beginPath(); g.moveTo(a, 40); g.lineTo(a + Math.sin(t * 2 + a) * 3, 40 - h); g.stroke(); } }
    else if (name === 'HUMAN COMBAT') { g.strokeStyle = '#e8eef4'; g.lineWidth = 7; for (const s2 of [-1, 1]) { g.save(); g.rotate(s2 * 0.75); g.beginPath(); g.moveTo(0, -58); g.lineTo(0, 30); g.stroke(); g.strokeStyle = acc; g.lineWidth = 9; g.beginPath(); g.moveTo(-16, 30); g.lineTo(16, 30); g.stroke(); g.strokeStyle = '#6b4a32'; g.beginPath(); g.moveTo(0, 32); g.lineTo(0, 50); g.stroke(); g.restore(); g.strokeStyle = '#e8eef4'; g.lineWidth = 7; } }
    else if (name === 'TANK RANGE') { g.fillStyle = acc; g.fillRect(-46, 0, 92, 22); g.fillRect(-26, -16, 46, 18); g.fillRect(18, -11, 50, 7); g.fillStyle = ink; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(-36 + i * 18, 26, 8, 0, 7); g.fill(); }
      g.strokeStyle = '#ffffff'; g.lineWidth = 4; g.beginPath(); g.arc(-74, -16, 16, 0, 7); g.stroke(); g.beginPath(); g.arc(-74, -16, 6, 0, 7); g.stroke(); }
    else if (name === 'SUBMARINE') { g.fillStyle = '#ffd23a'; g.beginPath(); g.ellipse(0, 10, 56, 20, 0, 0, 7); g.fill(); g.fillRect(-12, -16, 26, 16); g.fillRect(6, -34, 5, 20); g.fillRect(6, -34, 16, 5); g.fillStyle = '#0c3a5a'; for (const x2 of [-30, -10, 10, 30]) { g.beginPath(); g.arc(x2, 10, 5, 0, 7); g.fill(); }
      g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { const yy = -30 - ((t * 30 + i * 18) % 50); g.beginPath(); g.arc(-60 + i * 8, yy, 4 + i, 0, 7); g.stroke(); } }
    else if (name === 'SURF') { g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, 44, Math.PI * 0.9, Math.PI * 2.15); g.stroke(); g.lineWidth = 5; g.beginPath(); g.arc(14, -6, 22, Math.PI * 1.1, Math.PI * 2.1); g.stroke();
      g.fillStyle = acc; g.save(); g.rotate(-0.35); g.beginPath(); g.ellipse(-6, 38, 46, 8, 0, 0, 7); g.fill(); g.restore(); }
    else if (name === 'PINBALL') { g.fillStyle = '#ff4fd8'; g.beginPath(); g.arc(-34, -20, 16, 0, 7); g.fill(); g.fillStyle = '#38bdf8'; g.beginPath(); g.arc(30, -30, 13, 0, 7); g.fill(); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(4, 2, 11, 0, 7); g.fill();
      g.fillStyle = '#e8eef4'; for (const s2 of [-1, 1]) { g.save(); g.translate(s2 * 26, 40); g.rotate(s2 * 0.45); g.fillRect(s2 < 0 ? 0 : -40, -5, 40, 10); g.restore(); } g.fillStyle = '#ffffff'; g.beginPath(); g.arc(-4 + Math.sin(t * 2) * 30, 14 + Math.cos(t * 2.6) * 14, 7, 0, 7); g.fill(); }
    else if (name === 'CLAW CRANE') { const sx = Math.sin(t * 1.4) * 22; g.strokeStyle = '#e8eef4'; g.lineWidth = 4; g.beginPath(); g.moveTo(-54, -46); g.lineTo(54, -46); g.moveTo(sx, -46); g.lineTo(sx, -20); g.stroke(); g.fillStyle = '#ffd23a'; g.fillRect(sx - 10, -24, 20, 10);
      g.beginPath(); g.moveTo(sx - 8, -14); g.lineTo(sx - 17, 4); g.moveTo(sx + 8, -14); g.lineTo(sx + 17, 4); g.moveTo(sx, -14); g.lineTo(sx, 6); g.stroke();
      for (const [px, py, r, c] of [[-32, 34, 14, '#f472b6'], [-8, 38, 12, '#7dd3fc'], [16, 32, 15, '#22c55e'], [40, 38, 11, '#f97316'], [2, 22, 10, '#ec3013']]) { g.fillStyle = c; g.beginPath(); g.arc(px, py, r, 0, 7); g.fill(); g.strokeStyle = ink; g.lineWidth = 2; g.stroke(); } }
    else { g.fillStyle = acc; g.beginPath(); g.arc(0, 0, 30, 0, 7); g.fill(); }
    g.restore(); }
export function title(g, name, x, y, w, px, acc) { let s = px; g.font = 'italic 900 ' + s + 'px Archivo, sans-serif'; while (s > 14 && g.measureText(name).width > w) { s -= 2; g.font = 'italic 900 ' + s + 'px Archivo, sans-serif'; }
    g.textBaseline = 'alphabetic'; g.lineJoin = 'round'; g.lineWidth = Math.max(4, s * 0.16); g.strokeStyle = '#201e1d'; g.fillStyle = acc; g.fillText(name, x + s * 0.07, y + s * 0.07); g.strokeText(name, x, y); g.fillStyle = '#ffffff'; g.fillText(name, x, y);
    g.fillStyle = acc; g.fillRect(x, y + s * 0.18, Math.min(w, g.measureText(name).width), Math.max(3, s * 0.08)); g.textBaseline = 'middle'; return s; }

// the ATTRACT DEMO: an animated title screen for a cabinet game (the cabinet menu background + the load-screen picture box). img = a real screenshot if one was captured.
export function drawAttract(g, w, h, cab, t, img) { const sk = cab || {}, sc = sk.scr || [sk.body || '#120c22', sk.body || '#120c22', sk.acc || YEL0], acc = sk.acc || YEL0, name = sk.name || '';
  const q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, sc[0]); q.addColorStop(0.6, sc[1]); q.addColorStop(1, sc[2]); g.fillStyle = q; g.fillRect(0, 0, w, h);
  if (img && img.complete && img.naturalWidth) { const s = Math.max(w / img.naturalWidth, h / img.naturalHeight) * (1.08 + Math.sin(t * 0.25) * 0.04), iw = img.naturalWidth * s, ih = img.naturalHeight * s; g.drawImage(img, (w - iw) / 2 + Math.sin(t * 0.3) * w * 0.03, (h - ih) / 2, iw, ih); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, h * 0.68, w, h * 0.32); }
  else { g.save(); g.translate(w * 0.72, h * 0.42); g.rotate(t * 0.15); g.fillStyle = 'rgba(0,0,0,0.22)'; for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.fillRect(0, -h * 0.025, w, h * 0.05); } g.restore();
    g.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < 14; i++) { const x = (i * 97 + t * 14 * (1 + i % 3)) % w, y = (i * 53) % (h * 0.6), s2 = 1 + ((t * 3 + i) % 2 < 1 ? 1.5 : 0); g.fillRect(x, y, s2, s2); }
    g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, h * 0.68, w, h * 0.32); scene(g, name, w * 0.7, h * 0.42 + Math.sin(t * 2) * h * 0.012, h / 200, acc, t); }
  g.fillStyle = acc; g.fillRect(w * 0.055, h * 0.08, w * 0.25, h * 0.055); g.fillStyle = '#201e1d'; g.font = '900 ' + Math.round(h * 0.034) + 'px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(img ? 'SCREENSHOT' : '8 GATES ARCADE', w * 0.07, h * 0.108);
  title(g, name, w * 0.055, h * 0.87, w * 0.89, h * 0.17, acc);
  const L = Math.min(w, h) * 0.06; g.strokeStyle = acc; g.lineWidth = Math.max(3, h * 0.008); for (const [x, y, dx, dy] of [[8, 8, 1, 1], [w - 8, 8, -1, 1], [8, h - 8, 1, -1], [w - 8, h - 8, -1, -1]]) { g.beginPath(); g.moveTo(x, y + dy * L); g.lineTo(x, y); g.lineTo(x + dx * L, y); g.stroke(); }
  if ((t * 1.6 | 0) % 2 === 0) { g.fillStyle = '#ffffff'; g.font = '900 ' + Math.round(h * 0.036) + 'px Archivo, sans-serif'; g.fillText(img ? 'DEMO' : 'ATTRACT MODE', w * 0.72, h * 0.108); }
  g.fillStyle = 'rgba(0,0,0,0.1)'; for (let y = 0; y < h; y += 4) g.fillRect(0, y, w, 2); }
export function cabPoster(cab) { const c = document.createElement('canvas'); c.width = 640; c.height = 480; drawAttract(c.getContext('2d'), 640, 480, cab, 0.4, null); return c.toDataURL('image/jpeg', 0.85); }
export function cabMenu({ THREE, camera, save, touch, isMuted = () => false, pause = () => {}, onPlay = () => {}, onMulti = () => {}, player = () => null }) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), INK = '#201e1d', YEL = '#ffd23a';
  let M = null;
  const MAIN = ['1 PLAYER', 'MULTIPLAYER', 'OPTIONS / INSTRUCTIONS', 'BACK'];
  let ac = null; const beep = (f, len = 0.08, type = 'square', k = 0.035) => { if (isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(k, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(g).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const coin = () => { beep(988, 0.07); setTimeout(() => beep(1319, 0.22), 70); };
  const hiAll = () => save.stat('arcadeHi', null) || {}, hiOf = n => (hiAll()[n] || []).slice(0, 5);
  const pname = () => { try { return String(save.data.name || 'YOU').toUpperCase().slice(0, 10); } catch (e) { return 'YOU'; } };
  function addScore(n, s) { const all = { ...hiAll() }, L = [...(all[n] || []), { n: pname(), s: Math.round(s) }].sort((a, b) => b.s - a.s).slice(0, 5); all[n] = L; save.setStat('arcadeHi', all); return L.findIndex(q => q.s === Math.round(s) && q.n === pname()); }
  let lastScore = null; addEventListener('message', e => { const d = e.data; if (d && typeof d === 'object' && /score|minigame/.test(String(d.type || '')) && typeof d.score === 'number') lastScore = d.score; });
  const cardOf = n => { try { const c = JSON.parse(localStorage.getItem('arcade.cards.v1') || '{}')[n]; if (Array.isArray(c) && c.length) return c; } catch (e) {} return CAB_CARD_SEED[n] || []; };
  const items = () => M.view === 'opts' ? [...M.card.map(q => q.t), 'BACK'] : MAIN;
  // ---------- the menu drawn on the cabinet screen ----------
  const W = 512, H = 384;
  function draw() { if (!M) return; const g = M.tex.image.getContext('2d'), sk = M.cab.skin || {}, sc = sk.scr || [sk.body || '#120c22', sk.body || '#120c22', sk.acc || YEL], acc = sk.acc || YEL, t = M.t;
    const q = g.createLinearGradient(0, 0, 0, H); q.addColorStop(0, sc[0]); q.addColorStop(0.55, sc[1]); q.addColorStop(1, sc[2]); g.fillStyle = q; g.fillRect(0, 0, W, H); g.save(); g.translate(W * 0.78, H * 0.18); g.rotate(t * 0.15); g.fillStyle = 'rgba(0,0,0,0.2)'; for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.fillRect(0, -9, W, 18); } g.restore();
    g.fillStyle = 'rgba(255,255,255,0.75)'; for (let i = 0; i < 12; i++) { const x = (i * 97 + t * 16 * (1 + i % 3)) % W, y = (i * 41) % 130, s2 = (t * 3 + i) % 2 < 1 ? 3 : 1.5; g.fillRect(x, y, s2, s2); }
    g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(0, 128, W, H - 128); g.textBaseline = 'middle';
    { const L2 = 22; g.strokeStyle = acc; g.lineWidth = 4; for (const [x, y, dx, dy] of [[10, 12, 1, 1], [W - 10, 12, -1, 1], [10, H - 12, 1, -1], [W - 10, H - 12, -1, -1]]) { g.beginPath(); g.moveTo(x, y + dy * L2); g.lineTo(x, y); g.lineTo(x + dx * L2, y); g.stroke(); } }
    g.fillStyle = acc; g.fillRect(0, 0, W, 6); g.fillRect(0, H - 6, W, 6);
    const fit = (txt, x, y, mw, px, wt = 900, col = '#ffffff') => { let s = px; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; while (s > 9 && g.measureText(txt).width > mw) { s -= 2; g.font = wt + ' ' + s + 'px Archivo, sans-serif'; } g.fillStyle = col; g.fillText(txt, x, y); };
    if (M.view === 'opts') { fit(M.cab.name, 26, 40, W - 52, 40, 900); g.fillStyle = acc; g.fillRect(26, 66, 110, 4); }
    else { scene(g, M.cab.name, 400, M.view === 'over' ? 44 : 64, M.view === 'over' ? 0.62 : 0.95, acc, t); title(g, M.cab.name, 26, M.view === 'over' ? 60 : 92, 330, M.view === 'over' ? 34 : 48, acc); }
    const row = (i, y, h, label, sub) => { const on = i === M.sel; if (on) { g.fillStyle = YEL; g.fillRect(18, y, W - 36, h); g.fillStyle = INK; g.fillRect(18, y, 10, h); }
      fit((on ? '\u25b6 ' : '   ') + label, 40, y + (sub ? h * 0.36 : h / 2) + 1, W - 112, sub ? 20 : 24, 900, on ? INK : '#ffffff'); if (sub) fit(sub.toUpperCase(), 62, y + h * 0.74, W - 140, 12, 800, on ? INK : '#cfcac4'); return [y, y + h]; };
    if (M.view === 'main' || M.view === 'over') { let y0 = 140;
      if (M.view === 'over') { fit('GAME OVER', 26, 98, 300, 24, 900, acc); fit(M.score != null ? 'SCORE ' + M.score + (M.rank >= 0 ? ' · NEW HIGH SCORE #' + (M.rank + 1) : '') : 'THANKS FOR PLAYING', 26, 122, W - 52, 15, 800); y0 = 142; }
      const subs = ['START RIGHT NOW', '1 TO 4 PLAYERS · SHARE A LINK', 'HOW TO PLAY · MODES · SETTINGS', ''];
      M.rows = MAIN.map((it, i) => row(i, y0 + i * 50, i === 3 ? 34 : 44, M.view === 'over' && i === 0 ? '1 PLAYER · AGAIN' : it, subs[i]));
      const L = hiOf(M.cab.name); if (L.length && M.view === 'main') fit('HIGH SCORE  ' + L[0].n + '  ' + L[0].s, 26, H - 28, 300, 14, 900, YEL); }
    if (M.view === 'opts') { const tips = CAB_TIPS[M.cab.name] || ['PLAY WITH THE ON-SCREEN CONTROLS', 'SCORE AS MUCH AS YOU CAN', 'HAVE FUN'];
      fit('HOW TO PLAY', 26, 92, 200, 16, 900, acc); tips.forEach((s, i) => { const y = 114 + i * 24; g.fillStyle = acc; g.fillRect(26, y - 9, 18, 18); fit(String(i + 1), 31, y + 1, 12, 13, 900, INK); fit(s, 52, y, W - 78, 13, 800); });
      fit('GAME OPTIONS', 26, 196, 200, 16, 900, acc); const its = items(), n = its.length, vis = 4, top = Math.max(0, Math.min(n - vis, M.sel - 1));
      M.rows = []; for (let i = 0; i < n; i++) M.rows.push(null);
      for (let i = top; i < Math.min(n, top + vis); i++) { const c = M.card[i]; M.rows[i] = row(i, 212 + (i - top) * 40, 34, its[i], c && c.s ? c.s : ''); }
      if (n > vis) fit((top + vis < n ? '\u25bc MORE' : '') + (top > 0 ? '  \u25b2' : ''), W - 120, H - 24, 100, 12, 900, acc); }
    if (M.view === 'loading') { drawAttract(g, W, H, { ...sk, name: M.cab.name }, t, null); const p = Math.min(1, (t - (M.lt0 || t)) / 1.2); g.fillStyle = '#201e1d'; g.fillRect(26, H - 76, W - 52, 26); g.fillStyle = '#ec3013'; g.fillRect(28, H - 74, (W - 56) * p, 22); fit('LOADING\u2026', 34, H - 63, 200, 14, 900, '#ffffff'); M.tex.needsUpdate = true; return; }
    if ((t * 1.6 | 0) % 2 === 0 && M.view !== 'opts') fit(M.view === 'over' ? 'CREDIT 1' : 'INSERT COIN', W - 140, H - 28, 120, 15, 900, acc);
    g.fillStyle = 'rgba(0,0,0,0.12)'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 2);
    M.tex.needsUpdate = true; }
  // ---------- open: step up to the machine, hands on the controls ----------
  function open(spot) { const cab = spot && spot.cab; if (!cab || !cab.screen || M) return false; const scr = cab.screen; scr.updateWorldMatrix(true, false);
    const bb = new THREE.Box3().setFromObject(scr), ctr = bb.getCenter(V()), bsz = bb.getSize(V()), n = scr.getWorldDirection(V()), P = player(); let side = 1; { const ref = P ? V(P.x, ctr.y, P.z) : camera.position.clone(); side = Math.sign(ref.sub(ctr).dot(n)) || 1; } n.multiplyScalar(side).setY(0).normalize();
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const mesh = new THREE.Mesh(scr.geometry, new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); mesh.position.z = side * 0.004; if (side < 0) mesh.rotation.y = Math.PI; mesh.renderOrder = 3; scr.add(mesh);
    const stand = cab.standSpot && spot.x != null ? V(spot.x, 0, spot.z) : V(ctr.x + n.x * 0.62, 0, ctr.z + n.z * 0.62), yaw = Math.atan2(-n.x, -n.z);
    M = { spot, cab, mesh, tex, scr, n, ctr, sel: 0, view: 'main', t: 0, ph: 'in', k: 0, from: camera.position.clone(), fromLook: camera.position.clone().add(camera.getWorldDirection(V()).multiplyScalar(3)), rows: [], score: null, rank: -1,
      card: cardOf(cab.name), size: [Math.max(bsz.x, bsz.z), bsz.y], p0: P ? V(P.x, 0, P.z) : stand.clone(), stand, yaw, yaw0: P ? P.yaw : yaw };
    pause(true); coin(); draw(); return true; }
  function close() { if (!M) return; if (M.head) M.head.visible = true; if (M.cam && M.near0 != null) { M.cam.near = M.near0; M.cam.updateProjectionMatrix(); } M.mesh.parent && M.mesh.parent.remove(M.mesh); M.tex.dispose(); M.mesh.material.dispose(); M = null; flash(0); pause(false); beep(330, 0.1); }
  let FL = null; const flash = (op, col = '#ffffff', ms = 350) => { if (!FL) { FL = document.createElement('div'); FL.style.cssText = 'position:fixed;inset:0;z-index:58;opacity:0;pointer-events:none'; document.body.appendChild(FL); } FL.style.transition = 'opacity ' + ms + 'ms'; if (op > 0) FL.style.background = col; FL.style.opacity = String(op); };
  const payload = auto => { const sk = M.cab.skin || {}; let art = null; try { art = cabPoster({ ...sk, name: M.cab.name }); } catch (e) {}
    return { src: M.cab, name: M.cab.name, url: M.cab.url, body: sk.body, acc: sk.acc, scr: sk.scr, ctrl: sk.ctrl, art, tips: CAB_TIPS[M.cab.name] || [], line: CAB_LINES[M.cab.name] || '', auto }; };
  function start(auto) { if (M.cab.inworld) { beep(523, 0.08); setTimeout(() => beep(784, 0.08), 80); setTimeout(() => beep(1046, 0.3, 'triangle'), 160); M.ph = 'away'; M.auto = auto; lastScore = null; onPlay(payload(auto)); return; }
    M.view = 'loading'; M.auto = auto; M.lt0 = M.t; beep(523, 0.08); setTimeout(() => beep(784, 0.08), 80); setTimeout(() => beep(1046, 0.3, 'triangle'), 160); draw();
    setTimeout(() => { if (!M) return; M.ph = 'push'; M.k = 0; M.sent = false; }, 650); }
  function resume() { if (!M || M.ph !== 'away') return false; M.ph = 'in'; flash(0); if (M.cab.inworld) { M.k = 0; M.arrived = false; M.from = camera.position.clone(); M.fromLook = camera.position.clone().add(camera.getWorldDirection(V()).multiplyScalar(2)); } else { M.k = 1; M.arrived = true; } M.t = Math.max(M.t, T_IN); M.view = 'over'; M.sel = 0; M.card = cardOf(M.cab.name); M.score = lastScore; M.rank = lastScore != null ? addScore(M.cab.name, lastScore) : -1; pause(true); coin(); draw(); return true; }
  // ---------- input ----------
  const move = d => { if (!M || M.ph !== 'in') return; const n = items().length; M.sel = (M.sel + d + n) % n; beep(660, 0.04); draw(); };
  function select() { if (!M || M.ph !== 'in' || M.view === 'loading') return; if (!M.arrived) { M.k = 1; M.t = Math.max(M.t, T_IN); return; } const k = M.sel;
    if (M.view === 'opts') { if (k >= M.card.length) { M.view = M.wasOver ? 'over' : 'main'; M.sel = 2; beep(440, 0.05); draw(); return; } start({ label: M.card[k].t }); return; }
    if (k === 0) { start({ primary: true }); return; } if (k === 1) { beep(880, 0.06); onMulti(payload(null)); return; }
    if (k === 3) { close(); return; } M.wasOver = M.view === 'over'; M.view = 'opts'; M.sel = 0; beep(880, 0.05); draw(); }
  function back() { if (!M || M.ph !== 'in' || M.view === 'loading') return; if (M.view === 'opts') { M.view = M.wasOver ? 'over' : 'main'; M.sel = 2; beep(440, 0.05); draw(); return; } close(); }
  let stickY = 0; function stick(x, y) { if (!M) return; const s = y > 0.55 ? 1 : y < -0.55 ? -1 : 0; if (s && s !== stickY) move(-s); stickY = s; }
  addEventListener('keydown', e => { if (!M || M.ph === 'away' || document.querySelector('[data-cab-modal]')) return; const c = e.code; let used = true;
    if (c === 'ArrowUp' || c === 'KeyW') move(-1); else if (c === 'ArrowDown' || c === 'KeyS') move(1); else if (c === 'Enter' || c === 'KeyE' || c === 'Digit1' || c === 'NumpadEnter') select(); else if (c === 'Escape' || c === 'Backspace' || c === 'Space' || c === 'Digit3') back(); else used = false;
    if (used || /^(Key[ADQ]|Arrow)/.test(c)) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  addEventListener('keyup', e => { if (M && M.ph !== 'away' && /^(Key[WASDEQ]|Arrow|Space|Digit[13]|Enter|Escape)/.test(e.code)) e.stopImmediatePropagation(); }, true);
  const rc = new THREE.Raycaster(), nd = new THREE.Vector2();
  addEventListener('pointerdown', e => { if (!M || M.ph !== 'in') return; const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[data-cab-modal]')) return;
    nd.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); rc.setFromCamera(nd, camera); const hit = rc.intersectObject(M.mesh, false)[0]; if (!hit || !hit.uv) return; e.stopPropagation(); e.preventDefault();
    const y = (1 - hit.uv.y) * H, i = M.rows.findIndex(r => r && y >= r[0] - 3 && y <= r[1] + 3); if (i < 0) return; if (i === M.sel) select(); else { M.sel = i; beep(660, 0.04); draw(); setTimeout(select, 90); } }, true);
  // ---------- camera over the shoulder + the player at the controls (runs after the walk's own camera + fox pose) ----------
  const tv = V(), lk = V(), up = V(0, 1, 0);
  // CAMERA (Ben s100): E → the camera eases straight in while the player steps up → the CLOSE VIEW: the screen up top, the hands on the controls + the guns
  // at the bottom (head hidden so nothing blocks; near plane pulled in so the hands never clip). START pushes from there through the glass.
  const T_IN = 0.9;
  function camFix(cam, _dt, fox) { if (!M) return; const now = performance.now(), dt = M.lt ? Math.min(0.05, (now - M.lt) / 1000) : 0.016; M.lt = now; M.t += dt;
    if (M.near0 == null) { M.near0 = cam.near; M.cam = cam; cam.near = 0.02; cam.updateProjectionMatrix(); }
    if (M.ph === 'in' && ((M.t * 10) | 0) !== M.lastT) { M.lastT = (M.t * 10) | 0; if (M.lastT % 3 === 0) draw(); }
    const P = player(), U = fox && fox.userData && fox.userData.P; const wk = Math.min(1, M.t / T_IN), we = wk * wk * (3 - 2 * wk);
    if (P) { P.x = M.p0.x + (M.stand.x - M.p0.x) * we; P.z = M.p0.z + (M.stand.z - M.p0.z) * we; let dy = M.yaw - M.yaw0; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); P.yaw = M.yaw0 + dy * Math.min(1, we * 1.4); P.sp = 0;
      if (fox) { fox.position.x = P.x; fox.position.z = P.z; fox.rotation.y = P.yaw; const A = U && U.arms, L = U && U.legs, step = wk < 1 ? Math.sin(M.t * 13) : 0;
        if (L) L.forEach((l, i) => { l.rotation.x = wk < 1 ? (i ? -step : step) * 0.5 : 0; });
        if (A) A.forEach((q, i) => { const reach = Math.min(1, Math.max(0, (M.t - T_IN * 0.5) / 0.35)); q.rotation.x = -1.15 * reach + Math.sin(M.t * 1.6 + i) * 0.012 * reach; q.rotation.z = reach * (i ? 1 : -1) * 0.2; });   // slow, small breathing on the controls
        if (U && U.body && M.ph !== 'away') U.body.position.y = (U.body.userData.y0 != null ? U.body.userData.y0 : (U.body.userData.y0 = U.body.position.y)) + Math.sin(M.t * 1.6) * 0.004; } }
    const vf = THREE.MathUtils.degToRad(cam.fov || 55) / 2, asp = cam.aspect || 1, ws = M.scr.getWorldScale(V()), gp = M.scr.geometry.parameters || {}, sw = gp.width ? gp.width * ws.x : (M.size ? M.size[0] : 0.7), sh = gp.height ? gp.height * ws.y : (M.size ? M.size[1] : 0.52);
    const land = asp >= 1, dScr = Math.max((sh * (land ? 2.5 : 1.6) / 2) / Math.tan(vf), (sw / 2) / (Math.tan(vf) * asp * (land ? 0.7 : 0.96)));   // desktop / landscape: further back so the whole screen + the controls fit
    let close = V().copy(M.ctr).addScaledVector(M.n, dScr); close.y = M.ctr.y - sh * 0.08; let closeLk = V().copy(M.ctr); closeLk.y -= sh * (land ? 0.3 : 0.45);
    if (M.cab.standSpot) { const fy0 = P ? (P.y || 0) : 0; close = V().copy(M.ctr).addScaledVector(M.n, Math.max(0.9, (sh * (land ? 1.5 : 1.15) / 2) / Math.tan(vf), (sw / 2) / (Math.tan(vf) * asp * (land ? 0.8 : 0.94)))); close.y = M.ctr.y - sh * 0.35; closeLk = V().copy(M.ctr); closeLk.y -= sh * 0.05; }   // closer: the backglass fills the view, looking slightly up ·   // eyes at the flippers, looking up at the menu
    if (U && U.head) { M.head = U.head; U.head.visible = !(M.k > 0.55 || M.arrived); }
    if (fox && (M.k > 0.55 || M.arrived)) fox.visible = false;   // Ben s100: no player body in the cabinet view (the walk shows the fox again next frame)
    if (M.ph === 'push' && !M.sent && M.k > 0.72) { M.sent = true; M.ph = 'away'; lastScore = null; onPlay(payload(M.auto)); }
    if (M.view === 'loading' && ((M.t * 10) | 0) % 2 === 0) draw();
    if (M.ph === 'away' && M.cab.inworld) { cam.position.copy(close); cam.lookAt(closeLk); return; }   // the game blends the camera from here
    if (M.ph === 'push' || M.ph === 'away') { M.k = Math.min(1, M.k + dt * 1.6); const e = M.k * M.k * (3 - 2 * M.k), tgt = V().copy(M.ctr).addScaledVector(M.n, 0.12); cam.position.lerpVectors(close, tgt, e); cam.lookAt(V().copy(closeLk).lerp(M.ctr, e)); return; }
    if (!M.arrived) { M.k = Math.min(1, M.k + dt / T_IN); const e = M.k * M.k * (3 - 2 * M.k); cam.position.lerpVectors(M.from, close, e); cam.lookAt(V().copy(M.fromLook).lerp(closeLk, e)); if (M.k >= 1) M.arrived = true; return; }
    cam.position.copy(close); cam.lookAt(closeLk); }
  const prompt = () => (M && M.ph !== 'away' ? (M.view === 'opts' ? (M.sel >= M.card.length ? 'BACK' : 'START · ' + M.card[M.sel].t) : 'SELECT · ' + MAIN[M.sel]) : null);
  return { on: () => !!M, away: () => !!M && M.ph === 'away', open, close, select, back, stick, resume, camFix, prompt, addScore, hiOf };
}
