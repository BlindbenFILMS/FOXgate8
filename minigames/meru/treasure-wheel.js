// 8 GATES — MERU TREASURE WHEEL [meruCasino · TREASURE WHEEL]. 3D minigame (master list #162 Prize wheel). Phones first.
// NO STATIC IMPORTS on purpose: the page passes THREE (vendor/three r160) and save (engine/save.js), so this one file runs
// in the repo AND in a Design canvas (where ../../ links between packed files break and leave a black screen).
// Room, fox builder, toon/ink helpers and card art are copied from minigames/meru/poker-stud.js (parallel rules: no shared edits).
//
// HOW IT PLAYS (all prizes DRAFT for Ben):
//  A TURN is up to 3 spins. Each spin adds its number to your POT. BANK any time to keep the pot.
//  BUST empties the pot and ends the turn. x2 doubles the pot. AGAIN is a free spin. JACKPOT adds the jackpot and banks.
//  SHUTTLE = bonus: pick one of three fox cards (NOBLE · HOPE · KING MIGHT); each hides +10, +25 or x2 (x2 on an empty pot pays +20).
//  Hold SPIN to charge (release at the top of the meter for a big spin), or swipe the wheel. A tap spins at medium power.
// Modes: GOLD (a turn costs COST gold, the pot pays gold, the jackpot grows) · PRACTICE (free) ·
//        PARTY (2-5 players pass one phone, 3 or 5 rounds, most points wins) · ONLINE (engine/duel-net.js, up to 5; host runs the wheel).
// Spins are exact maths (constant slow-down), so every phone in an online game shows the same landing.
// Music: a synth casino-lounge loop (swing jazz in F, 116 bpm) that livens up while the wheel spins. Starts on the first tap (browser rule).
// Save keys (all prefixed meruWheel.): stats meruWheel.turns · .bestBank · .jackpots · .busts · .jackpot (gold-table jackpot pool) · flags meruWheel.mute · .noMusic

export const MERU_WHEEL = { key: 'meruWheel', name: 'MERU TREASURE WHEEL', room: 'meruCasino', game: 'TREASURE WHEEL' };
export const RULES = { cost: 20, spins: 3, jackBase: 100, jackGrow: 3, partyJack: 100 }; // DRAFT
export const COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PURPLE', '#a78bfa']];
// 20 segments, clockwise from the top. DRAFT values.
export const SEGS = [ // w = slice width (1 = normal). The JACKPOT slice is thin.
  { t: '20', v: 20 }, { t: '5', v: 5 }, { t: 'BUST', bust: true }, { t: '10', v: 10 }, { t: '30', v: 30 },
  { t: '5', v: 5 }, { t: 'x2', dbl: true }, { t: '15', v: 15 }, { t: 'SHUTTLE', bonus: true }, { t: '5', v: 5 },
  { t: '25', v: 25 }, { t: 'BUST', bust: true }, { t: '10', v: 10 }, { t: '5', v: 5 }, { t: 'AGAIN', free: true },
  { t: '15', v: 15 }, { t: 'JACKPOT', jack: true, w: 0.3 }, { t: '10', v: 10 }, { t: 'BUST', bust: true }, { t: '5', v: 5 },
];
export const BONUS = [{ t: '+10', v: 10 }, { t: '+25', v: 25 }, { t: 'x2', dbl: true }];
const N = SEGS.length, TAU = Math.PI * 2;
const WSUM = SEGS.reduce((t, x) => t + (x.w || 1), 0), EDGE = []; { let a = 0; for (const x of SEGS) { EDGE.push(a); a += (x.w || 1) / WSUM * TAU; } EDGE.push(TAU); }
export const segSpan = j => [EDGE[j], EDGE[j + 1]]; // clockwise from the top, radians
const K = 2.6; // slow-down, rad/s²
export const segAt = th => { const a = ((th % TAU) + TAU) % TAU; for (let j = 0; j < N; j++) if (a < EDGE[j + 1]) return j; return N - 1; };
export const spinFrom = (a0, power, jitter) => { const v0 = 6 + 9 * Math.max(0, Math.min(1, power)) + jitter; return { a0, v0, dur: v0 / K, end: a0 + v0 * v0 / (2 * K) }; };
const angleAt = (s, t) => t >= s.dur ? s.end : s.a0 + s.v0 * t - K * t * t / 2;

// ---------------------------------------------------------------- the rules (plain data, runs on the host / locally)
// G = { kind, players:[{id,name,col,score}], cur, round, rounds, pot, used, phase, angle, spin, bonus, result, jackpot, winners, seq }
// phases: ready · spinning · bonus · turnEnd · pass (party hand-off) · done (solo: new turn?) · over (party/net end)
export function newGame({ kind, players, rounds = 3, jackpot = RULES.partyJack }) {
  return { kind, players: players.map(p => ({ ...p, score: 0, banks: 0, busts: 0 })), cur: 0, round: 1, rounds, pot: 0, used: 0, phase: kind === 'party' ? 'pass' : 'ready',
    angle: 0, spin: null, spinN: 0, bonus: null, result: null, resN: 0, jackpot, winners: [], log: kind === 'party' ? players[0].name + ' SPINS FIRST' : 'HOLD SPIN, LET GO AT THE TOP' };
}
const LINES = { // DRAFT host lines for LYRA
  bust: ['OOH! SO CLOSE.', 'THE WHEEL GIVETH, THE WHEEL TAKETH.', 'BUST! SHAKE IT OFF.'],
  jack: ['JACKPOT! THE WHOLE CASINO HEARD THAT!', 'RING THE BELLS! JACKPOT!'],
  bonus: ['THE SHUTTLE! PICK A FOX, ANY FOX.', 'BONUS TIME. TRUST YOUR NOSE.'],
  bank: ['SMART FOX.', 'SAFE IN THE BANK.', 'A FOX WHO KNOWS WHEN TO STOP.'],
  big: ['NOW WE ARE TALKING!', 'LOOK AT THAT POT GROW!'],
  free: ['ROUND AND ROUND SHE GOES!'], dbl: ['DOUBLE TROUBLE!'],
};
const sayLine = (G, k) => { const a = LINES[k]; G.say = 'LYRA · ' + a[(Math.random() * a.length) | 0]; };
const vb = (G, w) => G.kind === 'solo' ? w : w + 'S'; // YOU SPIN · RED SPINS
const res = (G, kicker, line, kind) => { G.resN++; G.result = { kicker, line, kind, n: G.resN }; };
export function canSpin(G) { return G.phase === 'ready' && G.used < RULES.spins; }
export function canBank(G) { return G.phase === 'ready' && G.used > 0 && G.pot > 0; }
export function doSpin(G, power, jitter) {
  if (!canSpin(G)) return false;
  const s = spinFrom(G.angle, power, jitter); G.spinN++; G.spin = { id: G.spinN, ...s, seg: segAt(s.end) };
  G.phase = 'spinning'; G.result = null; G.say = ''; G.log = G.players[G.cur].name + ' ' + vb(G, 'SPIN'); return true;
}
// called when the spin animation is over; returns 'turnEnd' | 'ready' | 'bonus'
export function resolveSpin(G) {
  if (G.phase !== 'spinning' || !G.spin) return null;
  const sg = SEGS[G.spin.seg], who = G.players[G.cur].name; G.angle = ((G.spin.end % TAU) + TAU) % TAU;
  if (sg.free) { sayLine(G, 'free'); G.phase = 'ready'; res(G, 'SPIN AGAIN', 'A FREE SPIN · IT DOES NOT COUNT', 'free'); G.log = who + ' ' + vb(G, 'GET') + ' A FREE SPIN'; return 'ready'; }
  G.used++;
  if (sg.bust) { sayLine(G, 'bust'); G.pot = 0; G.players[G.cur].busts++; res(G, 'BUST', 'THE POT IS GONE', 'bust'); G.log = who + ' ' + vb(G, 'BUST'); G.phase = 'turnEnd'; return 'turnEnd'; }
  if (sg.jack) { sayLine(G, 'jack'); G.pot += G.jackpot; res(G, 'JACKPOT', '+' + G.jackpot + ' · BANKED', 'jack'); G.log = who + ' ' + vb(G, 'HIT') + ' THE JACKPOT'; bank(G, true); return 'turnEnd'; }
  if (sg.bonus) {
    const pr = BONUS.slice(); for (let i = pr.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pr[i], pr[j]] = [pr[j], pr[i]]; }
    const faces = ['J', 'Q', 'K']; for (let i = 2; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [faces[i], faces[j]] = [faces[j], faces[i]]; }
    sayLine(G, 'bonus'); G.bonus = { prizes: pr, faces, pick: -1 }; G.phase = 'bonus'; res(G, 'SHUTTLE BONUS', 'PICK A FOX CARD', 'bonus'); G.log = who + ' ' + vb(G, 'PICK') + ' A CARD'; return 'bonus';
  }
  if (sg.dbl) { if (G.pot > 0) { sayLine(G, 'dbl'); G.pot *= 2; res(G, 'DOUBLE', 'POT DOUBLED TO ' + G.pot, 'win'); } else res(G, 'x2', 'NOTHING TO DOUBLE YET', 'meh'); }
  else { G.pot += sg.v; res(G, '+' + sg.v, 'POT ' + G.pot, 'win'); if (sg.v >= 25 || G.pot >= 50) sayLine(G, 'big'); }
  G.log = who + ' · POT ' + G.pot;
  if (G.used >= RULES.spins) { res(G, G.result.kicker, 'LAST SPIN · ' + G.pot + ' BANKED', G.result.kind); bank(G, true); return 'turnEnd'; }
  G.phase = 'ready'; return 'ready';
}
export function doPick(G, i) {
  if (G.phase !== 'bonus' || !G.bonus || G.bonus.pick >= 0 || !(i >= 0 && i < 3)) return false;
  G.bonus.pick = i; const pr = G.bonus.prizes[i];
  if (pr.dbl) { if (G.pot > 0) { G.pot *= 2; res(G, 'x2', 'POT DOUBLED TO ' + G.pot, 'win'); } else { G.pot += 20; res(G, 'x2 · +20', 'AN EMPTY POT GETS 20 INSTEAD', 'win'); } } else { G.pot += pr.v; res(G, pr.t, 'POT ' + G.pot, 'win'); }
  if (G.used >= RULES.spins) { bank(G, true); return true; }
  G.phase = 'ready'; return true;
}
export function bank(G, auto) {
  if (!auto && !canBank(G)) return false;
  const p = G.players[G.cur]; p.score += G.pot; if (G.pot > 0) p.banks++;
  if (!auto || !G.result || G.result.kind !== 'jack') res(G, G.pot > 0 ? 'BANKED ' + G.pot : 'NOTHING TO BANK', (G.kind === 'solo' ? 'TOTAL ' + p.score : p.name + ' · ' + p.score + ' POINTS'), G.pot > 0 ? 'bank' : 'meh');
  if (G.pot > 0 && !(G.result && G.result.kind === 'jack')) sayLine(G, 'bank'); G.lastBank = G.pot; G.phase = 'turnEnd'; G.log = p.name + ' ' + vb(G, 'BANK') + ' ' + G.pot; return true;
}
// after the turnEnd pause
export function nextTurn(G) {
  if (G.phase !== 'turnEnd') return;
  G.pot = 0; G.used = 0; G.bonus = null; G.spin = null; G.say = '';
  if (G.kind === 'solo') { G.phase = 'done'; return; }
  G.cur++; if (G.cur >= G.players.length) { G.cur = 0; G.round++; }
  if (G.round > G.rounds) { const top = Math.max(...G.players.map(p => p.score)); G.winners = G.players.map((p, i) => p.score === top ? i : -1).filter(i => i >= 0); G.phase = 'over'; G.result = null;
    G.log = G.winners.length > 1 ? 'A TIE AT ' + top : G.players[G.winners[0]].name + ' WINS WITH ' + top; return; }
  G.result = null; G.phase = G.kind === 'party' ? 'pass' : 'ready'; G.log = G.players[G.cur].name + "'S TURN · ROUND " + G.round + ' OF ' + G.rounds;
}

// ---------------------------------------------------------------- sound (copied from poker-stud.js, + coins)
const AU = { ctx: null, on: true };
function actx() { if (!AU.ctx) { try { AU.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AU.ctx = null; } } if (AU.ctx && AU.ctx.state === 'suspended') AU.ctx.resume().catch(() => {}); return AU.ctx; }
function tone(f, d = 0.08, type = 'triangle', v = 0.07, when = 0) { const c = AU.on && actx(); if (!c) return; const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.03); }
const SFX = {
  tick: () => tone(1500, 0.02, 'square', 0.02), flip: () => tone(660, 0.06, 'triangle', 0.05),
  win: () => [523, 659, 784].forEach((f, k) => tone(f, 0.16, 'triangle', 0.06, k * 0.08)), bust: () => [330, 262, 196, 147].forEach((f, k) => tone(f, 0.2, 'sawtooth', 0.035, k * 0.11)),
  bank: () => { for (let k = 0; k < 6; k++) tone(2200 + (k % 2) * 700, 0.04, 'square', 0.02, k * 0.06); },
  jack: () => [523, 659, 784, 1046, 1318, 1568, 2093].forEach((f, k) => tone(f, 0.24, 'square', 0.035, k * 0.08)),
  turn: () => { tone(880, 0.07, 'sine', 0.05); tone(1320, 0.09, 'sine', 0.04, 0.07); }, charge: p => tone(300 + p * 900, 0.03, 'sine', 0.015),
};

// ---------------------------------------------------------------- MUSIC (synth lounge loop; swap for a Meru jukebox MP3 later)
const MUS = { on: true, bus: null, filt: null, timer: 0, next: 0, step: 0, energy: 0, noise: null };
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
// 8 bars: Fmaj7 Dm7 Gm7 C7 | Am7 D7 Gm7 C7  (bass root, comp voicing)
const PROG = [[41, [57, 60, 64, 65]], [38, [57, 60, 62, 65]], [43, [58, 62, 65, 67]], [36, [58, 60, 64, 67]],
  [45, [55, 60, 64, 67]], [38, [54, 57, 60, 62]], [43, [58, 62, 65, 67]], [36, [58, 60, 64, 67]]];
const MEL = [72, 74, 76, 77, 79, 81, 84]; // F-major-ish vibes notes
function mNote(c, f, t, d, type, v, att = 0.005) { const o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g).connect(MUS.bus); o.start(t); o.stop(t + d + 0.05); }
function mHat(c, t, v) { if (!MUS.noise) { const b = c.createBuffer(1, (c.sampleRate * 0.06) | 0, c.sampleRate), a = b.getChannelData(0); for (let k = 0; k < a.length; k++) a[k] = (Math.random() * 2 - 1) * (1 - k / a.length); MUS.noise = b; }
  const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = v; s.buffer = MUS.noise; s.connect(f).connect(g).connect(MUS.bus); s.start(t); }
function mSched() {
  const c = AU.ctx; if (!c || !MUS.bus) return; if (document.hidden) { MUS.next = Math.max(MUS.next, c.currentTime + 0.05); return; }
  const E = 60 / 116 / 2; // one eighth
  while (MUS.next < c.currentTime + 0.25) {
    const st = MUS.step, bar = ((st / 8) | 0) % PROG.length, e = st % 8, [root, ch] = PROG[bar], t = MUS.next + (e % 2 ? E * 0.33 : 0);
    // walking bass on the beats: root · third · fifth · step to the next root
    if (e % 2 === 0) { const nx = PROG[(bar + 1) % PROG.length][0], q = e / 2, m = q === 0 ? root : q === 1 ? root + (ch[0] % 12 === (root + 3) % 12 ? 3 : 4) : q === 2 ? root + 7 : nx + (nx > root ? -1 : 1); mNote(c, mf(m), t, E * 1.7, 'triangle', 0.16, 0.01); }
    // rhodes-ish comp on the "and" of 2 and on 4
    if (e === 3 || e === 6) ch.forEach((m, k) => { mNote(c, mf(m), t + k * 0.008, E * (e === 3 ? 1.4 : 2.2), 'sine', 0.032, 0.012); mNote(c, mf(m) * 2, t + k * 0.008, E * 0.8, 'triangle', 0.007, 0.004); });
    // ride / hats: swung offbeats; more of them when the wheel is spinning
    if (e % 2 === 1 || MUS.energy > 0.5) mHat(c, t, (e % 2 ? 0.05 : 0.025) * (0.6 + MUS.energy * 0.6));
    if (e === 0) mHat(c, t, 0.03);
    // vibes: a few chord-friendly notes, busier with energy
    if (Math.random() < 0.16 + MUS.energy * 0.22) { const m = MEL[(Math.random() * MEL.length) | 0]; mNote(c, mf(m), t, 0.55, 'sine', 0.045, 0.004); mNote(c, mf(m) * 4, t, 0.12, 'sine', 0.006, 0.002); }
    MUS.step++; MUS.next += E;
  }
}
function musicStart() { const c = AU.on && MUS.on && actx(); if (!c || MUS.timer) return; if (!MUS.bus) { MUS.bus = c.createGain(); MUS.filt = c.createBiquadFilter(); MUS.filt.type = 'lowpass'; MUS.filt.frequency.value = 2200; MUS.bus.connect(MUS.filt).connect(c.destination); }
  MUS.bus.gain.cancelScheduledValues(c.currentTime); MUS.bus.gain.setValueAtTime(0.0001, c.currentTime); MUS.bus.gain.linearRampToValueAtTime(0.5, c.currentTime + 1.2); MUS.next = c.currentTime + 0.12; MUS.timer = setInterval(mSched, 60); }
function musicStop() { clearInterval(MUS.timer); MUS.timer = 0; const c = AU.ctx; if (c && MUS.bus) { MUS.bus.gain.cancelScheduledValues(c.currentTime); MUS.bus.gain.setTargetAtTime(0.0001, c.currentTime, 0.15); } }
function musicEnergy(e) { MUS.energy = e; const c = AU.ctx; if (c && MUS.filt) MUS.filt.frequency.setTargetAtTime(2200 + e * 4500, c.currentTime, 0.3); }
function musicDuck(on) { const c = AU.ctx; if (c && MUS.bus && MUS.timer) MUS.bus.gain.setTargetAtTime(on ? 0.18 : 0.5, c.currentTime, on ? 0.05 : 0.6); }

// ---------------------------------------------------------------- canvas art
const FONT = '"Archivo", "Arial Black", Arial, sans-serif';
function rrect(x, X, Y, W, H, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + W, Y, X + W, Y + H, r); x.arcTo(X + W, Y + H, X, Y + H, r); x.arcTo(X, Y + H, X, Y, r); x.arcTo(X, Y, X + W, Y, r); x.closePath(); }
const FACES = {
  J: { who: 'NOBLE', fur: '#e8742c', cheek: '#fff3e6', eye: '#ef1d1d', glow: true, coat: '#475569', trim: '#38bdf8', ear: '#1e293b' },
  Q: { who: 'HOPE', fur: '#f2741f', cheek: '#ffffff', eye: '#1c1917', shades: true, coat: '#e2e8f0', trim: '#38bdf8', ear: '#1c1917', bowArc: true },
  K: { who: 'KING MIGHT', fur: '#d9733a', cheek: '#f4f1ec', eye: '#1c1917', crown: true, beard: true, coat: '#c42d3c', trim: '#ffd23a', ear: '#1e293b' },
};
function drawFoxHead(x, f, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.lineJoin = 'round'; x.lineWidth = 3; x.strokeStyle = '#1c1917';
  x.fillStyle = f.coat; x.beginPath(); x.moveTo(-62, 70); x.quadraticCurveTo(-58, 40, -26, 34); x.lineTo(26, 34); x.quadraticCurveTo(58, 40, 62, 70); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = f.trim; x.fillRect(-26, 36, 52, 7); x.strokeRect(-26, 36, 52, 7);
  if (f.who === 'NOBLE') { x.fillStyle = '#cbd5e1'; x.beginPath(); x.moveTo(-14, 46); x.lineTo(14, 46); x.lineTo(10, 66); x.lineTo(-10, 66); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#0f172a'; x.font = '900 16px ' + FONT; x.textAlign = 'center'; x.fillText('8', 0, 62); }
  if (f.bowArc) { x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.beginPath(); x.arc(46, 20, 44, -1.9, 1.2); x.stroke(); x.strokeStyle = '#1c1917'; x.lineWidth = 3; }
  for (const sd of [-1, 1]) { x.fillStyle = f.fur; x.beginPath(); x.moveTo(sd * 18, -26); x.lineTo(sd * 40, -66); x.lineTo(sd * 44, -14); x.closePath(); x.fill(); x.stroke(); x.fillStyle = f.ear; x.beginPath(); x.moveTo(sd * 26, -26); x.lineTo(sd * 39, -54); x.lineTo(sd * 40, -22); x.closePath(); x.fill(); }
  x.fillStyle = f.fur; x.beginPath(); x.ellipse(0, -2, 40, 36, 0, 0, 7); x.fill(); x.stroke();
  x.fillStyle = f.cheek; x.beginPath(); x.moveTo(-40, 2); x.quadraticCurveTo(-30, 30, 0, 38); x.quadraticCurveTo(30, 30, 40, 2); x.quadraticCurveTo(20, 14, 0, 12); x.quadraticCurveTo(-20, 14, -40, 2); x.fill();
  if (f.beard) { x.fillStyle = '#eef0f4'; x.beginPath(); x.moveTo(-26, 18); x.quadraticCurveTo(0, 62, 26, 18); x.quadraticCurveTo(0, 30, -26, 18); x.fill(); x.stroke(); }
  x.fillStyle = f.cheek; x.beginPath(); x.ellipse(0, 14, 15, 11, 0, 0, 7); x.fill();
  x.fillStyle = '#0b0a12'; x.beginPath(); x.ellipse(0, 8, 6.5, 5, 0, 0, 7); x.fill();
  x.beginPath(); x.moveTo(0, 13); x.lineTo(0, 19); x.moveTo(-7, 22); x.quadraticCurveTo(0, 26, 7, 22); x.stroke();
  if (f.shades) { x.fillStyle = '#0b0a12'; rrect(x, -32, -16, 27, 14, 5); x.fill(); rrect(x, 5, -16, 27, 14, 5); x.fill(); x.fillRect(-6, -13, 12, 3); x.fillStyle = '#38bdf8'; x.fillRect(-27, -14, 8, 3); x.fillRect(10, -14, 8, 3); }
  else { for (const sd of [-1, 1]) { if (f.glow) { x.fillStyle = 'rgba(239,29,29,0.35)'; x.beginPath(); x.arc(sd * 16, -8, 11, 0, 7); x.fill(); } x.fillStyle = f.eye; x.beginPath(); x.ellipse(sd * 16, -8, 6, 7.5, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(sd * 16 + 2, -11, 2.2, 0, 7); x.fill(); } }
  if (f.beard) { x.strokeStyle = '#f8fafc'; x.lineWidth = 4; x.beginPath(); x.moveTo(-26, -20); x.lineTo(-8, -18); x.moveTo(8, -18); x.lineTo(26, -20); x.stroke(); x.strokeStyle = '#1c1917'; x.lineWidth = 3; }
  if (f.crown) { x.fillStyle = '#ffd23a'; x.beginPath(); x.moveTo(-26, -30); x.lineTo(-30, -58); x.lineTo(-14, -44); x.lineTo(0, -64); x.lineTo(14, -44); x.lineTo(30, -58); x.lineTo(26, -30); x.closePath(); x.fill(); x.stroke(); x.fillStyle = '#c42d3c'; for (const px of [-15, 0, 15]) { x.beginPath(); x.arc(px, -36, 3.5, 0, 7); x.fill(); } }
  x.restore();
}
function drawShuttle(x, cx, cy, s) {
  x.save(); x.translate(cx, cy); x.scale(s, s); x.lineJoin = 'round'; x.lineWidth = 3; x.strokeStyle = '#1c1917';
  x.fillStyle = '#ffb020'; x.beginPath(); x.moveTo(-10, 62); x.quadraticCurveTo(0, 104, 10, 62); x.fill(); x.fillStyle = '#ec3013'; x.beginPath(); x.moveTo(-6, 62); x.quadraticCurveTo(0, 88, 6, 62); x.fill();
  x.fillStyle = '#f8fafc'; x.beginPath(); x.moveTo(-14, -20); x.lineTo(-48, 46); x.lineTo(-14, 52); x.lineTo(14, 52); x.lineTo(48, 46); x.lineTo(14, -20); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#1c1917'; x.beginPath(); x.moveTo(-14, -20); x.lineTo(-48, 46); x.lineTo(-42, 47); x.lineTo(-11, -8); x.closePath(); x.fill(); x.beginPath(); x.moveTo(14, -20); x.lineTo(48, 46); x.lineTo(42, 47); x.lineTo(11, -8); x.closePath(); x.fill();
  x.fillStyle = '#f8fafc'; x.beginPath(); x.moveTo(-14, 60); x.lineTo(-14, -40); x.quadraticCurveTo(0, -78, 14, -40); x.lineTo(14, 60); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = '#1c1917'; x.beginPath(); x.moveTo(-9, -52); x.quadraticCurveTo(0, -78, 9, -52); x.closePath(); x.fill();
  x.fillStyle = '#38bdf8'; x.fillRect(-8, -44, 16, 6);
  x.restore();
}
// bright casino colours: number slices cycle a rainbow; specials stand apart (black BUST, white x2/AGAIN, navy SHUTTLE, gold JACKPOT)
const BRIGHT = ['#ff3b30', '#ff9500', '#30d158', '#0a84ff', '#ff2d92', '#32d4f5', '#bf5af2'];
const numIdx = SEGS.map((s, j) => s.v ? SEGS.slice(0, j).filter(x => x.v).length : -1);
const segCol = (s, j) => s.jack ? '#ffd23a' : s.bust ? '#111014' : s.bonus ? '#0b2a7a' : s.dbl || s.free ? '#ffffff' : BRIGHT[numIdx[j] % BRIGHT.length];
const segInk = s => s.jack ? '#1c1917' : s.bust ? '#ff3b30' : s.dbl ? '#16a34a' : s.free ? '#0a84ff' : '#ffffff';
function paintWheel() {
  const S = 1024, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'), c = S / 2, R = S / 2 - 6;
  for (let j = 0; j < N; j++) {
    const a0 = -Math.PI / 2 + EDGE[j], a1 = -Math.PI / 2 + EDGE[j + 1], s = SEGS[j];
    x.fillStyle = segCol(s, j); x.beginPath(); x.moveTo(c, c); x.arc(c, c, R, a0, a1); x.closePath(); x.fill();
    if (s.jack) { const gj = x.createRadialGradient(c, c, 120, c, c, R); gj.addColorStop(0, '#fff3b0'); gj.addColorStop(1, '#f5b700'); x.fillStyle = gj; x.fill(); }
    // gloss: lighter toward the rim so the colours read bright under the casino lights
    const gl = x.createRadialGradient(c, c, R * 0.25, c, c, R); gl.addColorStop(0, 'rgba(255,255,255,0)'); gl.addColorStop(0.75, 'rgba(255,255,255,0.10)'); gl.addColorStop(1, 'rgba(255,255,255,0.26)');
    if (!s.bust) { x.fillStyle = gl; x.fill(); }
    x.strokeStyle = '#fff1c2'; x.lineWidth = 7; x.stroke();
    x.save(); x.translate(c, c); x.rotate((a0 + a1) / 2);
    if (s.bonus) { x.save(); x.translate(R - 120, 0); x.rotate(Math.PI / 2); drawShuttle(x, 0, 0, 0.78); x.restore(); x.fillStyle = '#ffd23a'; x.textAlign = 'right'; x.font = '900 30px ' + FONT; x.fillText('SHUTTLE', R - 190, 11); }
    else {
      const big = s.t.length <= 2, fs = big ? 92 : s.t.length <= 4 ? 58 : s.w ? 34 : 44;
      const light = s.jack || s.dbl || s.free; x.fillStyle = segInk(s); x.textAlign = 'right'; x.font = '900 ' + fs + 'px ' + FONT;
      x.lineWidth = 8; x.lineJoin = 'round'; x.strokeStyle = light ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.55)'; x.strokeText(s.t, R - 34, fs * 0.36); x.fillText(s.t, R - 34, fs * 0.36);
    }
    x.restore();
  }
  x.strokeStyle = '#ffd23a'; x.lineWidth = 12; x.beginPath(); x.arc(c, c, R - 5, 0, 7); x.stroke();
  x.fillStyle = '#ffd23a'; x.beginPath(); x.arc(c, c, 120, 0, 7); x.fill(); x.fillStyle = '#c42d3c'; x.beginPath(); x.arc(c, c, 104, 0, 7); x.fill();
  x.strokeStyle = '#ffd23a'; x.lineWidth = 6; x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; x.lineTo(c + Math.cos(a) * 82, c + Math.sin(a) * 82); } x.closePath(); x.stroke();
  x.fillStyle = '#ffffff'; x.font = '900 104px ' + FONT; x.textAlign = 'center'; x.fillText('8', c, c + 36);
  return cv;
}
function blurOf(src) { // the wheel smeared round its centre, faded in at speed
  const S = 512, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d'); x.translate(S / 2, S / 2);
  for (let k = 0; k < 14; k++) { x.save(); x.rotate((k / 14) * 0.5); x.globalAlpha = 0.16; x.drawImage(src, -S / 2, -S / 2, S, S); x.restore(); }
  return cv;
}
function paintSign(t, w = 1024, h = 160, bg = '#1c1917', fg = '#ffd23a') {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const x = cv.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h); x.strokeStyle = fg; x.lineWidth = 8; x.strokeRect(8, 8, w - 16, h - 16);
  x.fillStyle = fg; x.textAlign = 'center'; x.font = '900 ' + Math.round(h * 0.5) + 'px ' + FONT; x.fillText(t, w / 2, h * 0.68); return cv;
}
function paintCarpet() {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const x = cv.getContext('2d');
  x.fillStyle = '#4a0f1a'; x.fillRect(0, 0, 128, 128); x.strokeStyle = '#b8862e'; x.lineWidth = 3;
  x.beginPath(); x.moveTo(64, 8); x.lineTo(120, 64); x.lineTo(64, 120); x.lineTo(8, 64); x.closePath(); x.stroke();
  x.fillStyle = '#1f3a2e'; x.beginPath(); x.arc(64, 64, 10, 0, 7); x.fill(); x.fillStyle = '#b8862e'; x.fillRect(0, 0, 6, 6); x.fillRect(122, 122, 6, 6); x.fillRect(122, 0, 6, 6); x.fillRect(0, 122, 6, 6);
  return cv;
}
function paintBack(W, H) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'), k = W / 256; x.scale(k, k);
  x.fillStyle = '#fbfaf5'; rrect(x, 2, 2, 252, 356, 18); x.fill();
  x.fillStyle = '#13213f'; rrect(x, 14, 14, 228, 332, 10); x.fill();
  x.strokeStyle = 'rgba(230,180,90,0.45)'; x.lineWidth = 2; for (let d = -360; d < 360; d += 26) { x.beginPath(); x.moveTo(14 + d, 14); x.lineTo(14 + d + 332, 346); x.moveTo(242 - d, 14); x.lineTo(242 - d - 332, 346); x.stroke(); }
  x.strokeStyle = '#e6b45a'; x.lineWidth = 5; rrect(x, 22, 22, 212, 316, 8); x.stroke();
  x.fillStyle = '#13213f'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; x.lineTo(128 + Math.cos(a) * 58, 180 + Math.sin(a) * 58); } x.closePath(); x.fill(); x.lineWidth = 5; x.stroke();
  x.fillStyle = '#ffd23a'; x.textAlign = 'center'; x.font = '900 64px ' + FONT; x.fillText('?', 128, 202); x.font = '900 18px ' + FONT; x.fillText('SHUTTLE', 128, 104); x.fillText('BONUS', 128, 272);
  return cv;
}
function paintBonusCard(face, prize, W, H) {
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d'), k = W / 256; x.scale(k, k); const F = FACES[face];
  x.fillStyle = '#fbfaf5'; rrect(x, 2, 2, 252, 356, 18); x.fill();
  x.fillStyle = F.coat; rrect(x, 14, 14, 228, 332, 10); x.fill();
  x.fillStyle = '#fbf3dc'; rrect(x, 20, 20, 216, 200, 8); x.fill();
  drawFoxHead(x, F, 128, 128, 1.15);
  x.fillStyle = '#1c1917'; x.fillRect(20, 224, 216, 30); x.fillStyle = '#ffd23a'; x.textAlign = 'center'; x.font = '900 ' + (F.who.length > 6 ? 20 : 24) + 'px ' + FONT; x.fillText(F.who, 128, 247);
  x.fillStyle = '#ffffff'; x.font = '900 70px ' + FONT; x.lineWidth = 8; x.strokeStyle = '#1c1917'; x.strokeText(prize, 128, 326); x.fillText(prize, 128, 326);
  return cv;
}

// ---------------------------------------------------------------- 3D helpers (copied from poker-stud.js)
function toonRamp(T) { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new T.DataTexture(d, 3, 1, T.RGBAFormat); t.minFilter = t.magFilter = T.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; }
function inkMat(T, w) { const m = new T.MeshBasicMaterial({ color: 0x15110e, side: T.BackSide }); m.onBeforeCompile = sh => { sh.vertexShader = sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed += normal * ' + w.toFixed(4) + ';'); }; return m; }
function merge(T, parts) {
  let n = 0; const gs = parts.map(p => { const g = (p.geo.index ? p.geo.toNonIndexed() : p.geo.clone()); g.applyMatrix4(p.m); n += g.attributes.position.count; return g; });
  const P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), C = new Float32Array(n * 3); let o = 0;
  gs.forEach((g, k) => { const c = parts[k].col, cnt = g.attributes.position.count; P.set(g.attributes.position.array, o * 3); Nn.set(g.attributes.normal.array, o * 3); for (let i = 0; i < cnt; i++) { C[(o + i) * 3] = c.r; C[(o + i) * 3 + 1] = c.g; C[(o + i) * 3 + 2] = c.b; } o += cnt; g.dispose(); });
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(P, 3)); geo.setAttribute('normal', new T.BufferAttribute(Nn, 3)); geo.setAttribute('color', new T.BufferAttribute(C, 3)); geo.computeBoundingSphere(); return geo;
}
// LYRA hosts beside the wheel (no contestant foxes: the podiums carry the player colours)
const LYRA = { fur: '#e07b39', chest: '#fff7ed', coat: '#111827', trim: '#e6b45a', eye: '#1c1917', hat: 'visor', bow: true };

// ---------------------------------------------------------------- the game
export async function createTreasureWheel({ THREE: T, container, save = null, onState = () => {}, opts = {} }) {
  const phone = opts.phone ?? (matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 500);
  try { if (document.fonts && document.fonts.load) await Promise.race([document.fonts.load('900 40px "Archivo"'), new Promise(r => setTimeout(r, 1200))]); } catch (e) {}
  const S = save, stat = (k, d = 0) => S ? S.stat('meruWheel.' + k, d) : d, setStat = (k, v) => S && S.setStat('meruWheel.' + k, v);
  AU.on = !(S && S.flag('meruWheel.mute')); MUS.on = !(S && S.flag('meruWheel.noMusic'));
  const firstTouch = () => { actx(); musicStart(); }; addEventListener('pointerdown', firstTouch, { capture: true }); addEventListener('keydown', firstTouch, { capture: true });

  // WORLD MODE (s101, Ben "casino: do the same for the fortune wheel"): opts.world = { renderer, camera, parent, pos } plays on the casino's wheel:
  // the wheel, bonus cards + confetti are built into world.parent (pos = where this file's room origin sits in it), the room, Lyra, pods + lights go to a
  // throw-away scene, the game camera is mirrored into world space (wcam, the map blends to it), no render, no swipe (the page has the buttons).
  const WD = opts.world || null; let STAGE = null; const stageQ = new T.Quaternion();
  if (WD) { STAGE = new T.Group(); STAGE.name = 'wheelWorld'; if (WD.pos) STAGE.position.copy(WD.pos); WD.parent.add(STAGE); STAGE.updateWorldMatrix(true, false); STAGE.getWorldQuaternion(stageQ); }
  const wcam = WD ? new T.PerspectiveCamera(WD.camera.fov || 50, 1, 0.05, 200) : null;
  const R = WD ? WD.renderer : new T.WebGLRenderer({ antialias: !phone, powerPreference: 'high-performance' });
  if (!WD) { R.setPixelRatio(Math.min(devicePixelRatio || 1, phone ? 1.75 : 2)); R.shadowMap.enabled = !phone; R.shadowMap.type = T.PCFSoftShadowMap;
    R.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none'; container.appendChild(R.domElement); }
  const scene = new T.Scene(); scene.background = new T.Color('#120a08'); scene.fog = new T.Fog('#120a08', 16, 34);
  const cam = new T.PerspectiveCamera(40, 1, 0.1, 80);
  const ramp = toonRamp(T), toon = (c, o = {}) => new T.MeshToonMaterial({ color: c, gradientMap: ramp, ...o }), ink = inkMat(T, 0.012), inkBig = inkMat(T, 0.03);
  scene.add(new T.HemisphereLight('#ffe6c4', '#3a1610', 1.15));
  const key = new T.DirectionalLight('#fff1d6', 1.5); key.position.set(3, 9, 6); scene.add(key);
  if (!phone) { key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -6, right: 6, top: 7, bottom: -2, near: 1, far: 24 }); key.shadow.bias = -0.0015; }
  const glow = new T.PointLight('#ffcf8a', 10, 9, 1.6); glow.position.set(0, 3, 1.4); scene.add(glow);
  const G3 = { sph: new T.SphereGeometry(1, 14, 10), cone: new T.ConeGeometry(1, 1, 12), cyl: new T.CylinderGeometry(1, 1, 1, 18), box: new T.BoxGeometry(1, 1, 1), card: new T.PlaneGeometry(0.9, 1.27) };
  const texs = [], tex = cv => { const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; texs.push(t); return t; };

  // ---- room
  const room = new T.Group(); scene.add(room);
  const carpet = tex(paintCarpet()); carpet.wrapS = carpet.wrapT = T.RepeatWrapping; carpet.repeat.set(16, 16);
  const floor = new T.Mesh(new T.PlaneGeometry(44, 44), new T.MeshLambertMaterial({ map: carpet })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; room.add(floor);
  const wallM = toon('#3b1d12'), goldM = toon('#d4a23a', { emissive: '#3a2600' }), darkM = toon('#1c1310');
  const backZ = -3.4;
  const wall = new T.Mesh(new T.PlaneGeometry(44, 12), wallM); wall.position.set(0, 6, backZ); room.add(wall);
  for (const y of [1.0, 7.7]) { const b = new T.Mesh(G3.box, goldM); b.scale.set(44, 0.1, 0.06); b.position.set(0, y, backZ + 0.03); room.add(b); }
  for (const px of [-7.6, -4.4, 4.4, 7.6]) { const p = new T.Mesh(G3.cyl, darkM); p.scale.set(0.3, 7.6, 0.3); p.position.set(px, 3.8, backZ + 0.35); room.add(p); const cap = new T.Mesh(G3.cyl, goldM); cap.scale.set(0.4, 0.22, 0.4); cap.position.set(px, 7.5, backZ + 0.35); room.add(cap); const lamp = new T.Mesh(G3.sph, new T.MeshBasicMaterial({ color: '#ffd28a' })); lamp.scale.setScalar(0.18); lamp.position.set(px, 4.2, backZ + 0.72); room.add(lamp); }
  const slotScreen = tex(paintSign('7  8  7', 256, 128, '#0b1530', '#ffd23a'));
  for (const px of [-6.1, -5.15, 5.15, 6.1]) { const g2 = new T.Group(); const body = new T.Mesh(G3.box, toon('#9f1239')); body.scale.set(0.8, 1.8, 0.65); body.position.y = 0.9; g2.add(body); const top = new T.Mesh(G3.box, goldM); top.scale.set(0.86, 0.24, 0.7); top.position.y = 1.9; g2.add(top); const scr = new T.Mesh(new T.PlaneGeometry(0.6, 0.36), new T.MeshBasicMaterial({ map: slotScreen })); scr.position.set(0, 1.32, 0.33); g2.add(scr); g2.position.set(px, 0, backZ + 0.7); room.add(g2); }
  // stage under the wheel
  const stage = new T.Mesh(G3.cyl, toon('#2a1712')); stage.scale.set(3.4, 0.24, 1.6); stage.position.set(0, 0.12, -1.6); stage.receiveShadow = true; room.add(stage);
  const stageRim = new T.Mesh(new T.TorusGeometry(1, 0.04, 6, 64), goldM); stageRim.rotation.x = Math.PI / 2; stageRim.scale.set(3.4, 1.6, 1); stageRim.position.set(0, 0.24, -1.6); room.add(stageRim);

  // ---- the wheel
  const WR = 2.0, WY = 3.15, WZ = -1.55;
  const wheel = new T.Group(); wheel.position.set(0, WY, WZ); (STAGE || room).add(wheel);
  const board = new T.Mesh(new T.CylinderGeometry(WR + 0.5, WR + 0.5, 0.16, 64), darkM); board.rotation.x = Math.PI / 2; board.position.z = -0.16; wheel.add(board);
  const boardRim = new T.Mesh(new T.TorusGeometry(WR + 0.5, 0.06, 8, 64), goldM); boardRim.position.z = -0.08; wheel.add(boardRim);
  const disc = new T.Group(); wheel.add(disc);
  const wheelTex = tex(paintWheel()); wheelTex.anisotropy = 8;
  const face = new T.Mesh(new T.CircleGeometry(WR, 80), new T.MeshBasicMaterial({ map: wheelTex })); face.position.z = 0.078; disc.add(face); { const ZO = (m, n) => { const M = m.material; M.polygonOffset = true; M.polygonOffsetFactor = -n; M.polygonOffsetUnits = -n * 2; m.renderOrder = n; }; ZO(face, 1); disc.userData.ZO = ZO; }   /* s643: layers only 4 mm apart flickered in Meru's big camera range */
  const blurM = new T.MeshBasicMaterial({ map: tex(blurOf(wheelTex.image)), transparent: true, opacity: 0, depthWrite: false });
  const blurFace = new T.Mesh(new T.CircleGeometry(WR, 80), blurM); blurFace.position.z = 0.082; disc.add(blurFace); disc.userData.ZO(blurFace, 2);
  const wedgeM = new T.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending });
  const wedge = new T.Mesh(new T.CircleGeometry(WR * 0.97, 12, 0, 0.3), wedgeM); wedge.position.z = 0.09; disc.add(wedge); disc.userData.ZO(wedge, 3);
  let wedgeSeg = -1, wedgeT = -9;
  const showWedge = j => { if (j !== wedgeSeg) { wedgeSeg = j; const [a, b] = segSpan(j); wedge.geometry.dispose(); wedge.geometry = new T.CircleGeometry(WR * 0.97, 12, Math.PI / 2 - b, b - a); } wedgeT = performance.now(); };
  const discBody = new T.Mesh(new T.CylinderGeometry(WR, WR, 0.12, 80), toon('#b8862e')); discBody.rotation.x = Math.PI / 2; disc.add(discBody);
  const rim = new T.Mesh(new T.TorusGeometry(WR, 0.08, 8, 80), goldM); rim.position.z = 0.07; disc.add(rim);
  const pegM = toon('#f4e3b0', { emissive: '#3a2600' });
  for (let j = 0; j < N; j++) { const a = Math.PI / 2 - EDGE[j]; const peg = new T.Mesh(G3.cyl, pegM); peg.scale.set(0.045, 0.2, 0.045); peg.rotation.x = Math.PI / 2; peg.position.set(Math.cos(a) * (WR - 0.06), Math.sin(a) * (WR - 0.06), 0.15); disc.add(peg); }
  const hub = new T.Mesh(G3.cyl, goldM); hub.scale.set(0.2, 0.3, 0.2); hub.rotation.x = Math.PI / 2; hub.position.z = 0.12; wheel.add(hub);
  // bulbs around the board
  const bulbs = [], bulbOn = new T.MeshBasicMaterial({ color: '#fffbe0' }), bulbOff = new T.MeshBasicMaterial({ color: '#a8741f' }), bulbRed = new T.MeshBasicMaterial({ color: '#ff5a3c' });
  for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, b = new T.Mesh(G3.sph, bulbOn); b.scale.setScalar(0.075); b.position.set(Math.cos(a) * (WR + 0.32), Math.sin(a) * (WR + 0.32), 0.0); wheel.add(b); bulbs.push(b); }
  // clapper (the flapper that ticks against the pegs) + pointer
  const clap = new T.Group(); clap.position.set(0, WR + 0.32, 0.22); wheel.add(clap);
  const flap = new T.Mesh(G3.cone, toon('#ec3013')); flap.scale.set(0.2, 0.5, 0.09); flap.rotation.z = Math.PI; flap.position.y = -0.12; clap.add(flap); clap.add(new T.Mesh(flap.geometry, ink).copy(flap)); clap.children[1].material = inkBig;
  const pin = new T.Mesh(G3.sph, goldM); pin.scale.setScalar(0.09); pin.position.y = 0.1; clap.add(pin);
  // light beams from the ceiling onto the wheel + a warm pool of light on the floor
  const beamM = new T.MeshBasicMaterial({ color: '#ffe3a3', transparent: true, opacity: 0.06, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  for (const sx of [-1, 1]) { const b = new T.Mesh(new T.ConeGeometry(1.6, 8, 24, 1, true), beamM); b.position.set(sx * 2.2, WY + 2.6, WZ + 0.9); b.rotation.z = sx * 0.42; room.add(b); }
  const poolCv = document.createElement('canvas'); poolCv.width = poolCv.height = 128; { const x = poolCv.getContext('2d'), g = x.createRadialGradient(64, 64, 4, 64, 64, 64); g.addColorStop(0, 'rgba(255,214,140,0.55)'); g.addColorStop(1, 'rgba(255,214,140,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  const pool = new T.Mesh(new T.PlaneGeometry(9, 5), new T.MeshBasicMaterial({ map: tex(poolCv), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.26, 0.2); room.add(pool);
  // stand
  const post = new T.Mesh(G3.box, goldM); post.scale.set(0.34, WY, 0.24); post.position.set(0, WY / 2, WZ - 0.3); room.add(post);
  const foot = new T.Mesh(G3.box, darkM); foot.scale.set(1.6, 0.18, 0.7); foot.position.set(0, 0.33, WZ - 0.3); room.add(foot);
  // sign
  const sign = new T.Mesh(new T.PlaneGeometry(4.2, 0.66), new T.MeshBasicMaterial({ map: tex(paintSign('TREASURE WHEEL')) })); sign.position.set(0, WY + WR + 1.5, WZ - 0.1); room.add(sign);
  const jackCv = document.createElement('canvas'); jackCv.width = 512; jackCv.height = 96; const jackTex = tex(jackCv);
  const jackSign = new T.Mesh(new T.PlaneGeometry(2.4, 0.45), new T.MeshBasicMaterial({ map: jackTex })); jackSign.position.set(0, WY + WR + 0.86, WZ - 0.05); room.add(jackSign);
  let jackShown = -1; const paintJack = v => { if (v === jackShown) return; jackShown = v; const x = jackCv.getContext('2d'); x.fillStyle = '#7a1424'; x.fillRect(0, 0, 512, 96); x.strokeStyle = '#ffd23a'; x.lineWidth = 6; x.strokeRect(4, 4, 504, 88); x.fillStyle = '#ffd23a'; x.textAlign = 'center'; x.font = '900 52px ' + FONT; x.fillText('JACKPOT ' + v, 256, 66); jackTex.needsUpdate = true; };

  // ---- bonus cards (Shuttle bonus)
  const CW = phone ? 200 : 256, CH = Math.round(CW * 360 / 256);
  const backTex = tex(paintBack(CW, CH));
  const bonusG = new T.Group(); bonusG.position.set(0, WY, WZ + 0.9); bonusG.visible = false; (STAGE || room).add(bonusG);
  const bonusCards = [0, 1, 2].map(i => {
    const g = new T.Group(), fl = new T.Group(); g.add(fl);
    const front = new T.Mesh(G3.card, new T.MeshBasicMaterial({ map: backTex })), back = new T.Mesh(G3.card, new T.MeshBasicMaterial({ map: backTex })); back.rotation.y = Math.PI; fl.add(front, back);
    g.position.set((i - 1) * 1.15, 0, 0); bonusG.add(g); return { g, fl, front, faceKey: '', want: Math.PI, cur: Math.PI };
  });

  // ---- confetti + coins (one instanced mesh, phone-cheap)
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CN = phone ? 110 : 180, conf = new T.InstancedMesh(new T.PlaneGeometry(0.075, 0.12), new T.MeshBasicMaterial({ side: T.DoubleSide }), CN);
  conf.instanceMatrix.setUsage(T.DynamicDrawUsage); conf.frustumCulled = false; (STAGE || room).add(conf);
  const parts = Array.from({ length: CN }, () => ({ life: 0, p: new T.Vector3(), v: new T.Vector3(), r: new T.Euler(), w: new T.Vector3(), s: 1 }));
  const zero = new T.Matrix4().makeScale(0, 0, 0), m4 = new T.Matrix4(), q4 = new T.Quaternion(), s4 = new T.Vector3(), cc = new T.Color();
  for (let i = 0; i < CN; i++) conf.setMatrixAt(i, zero);
  const RAIN = ['#ff3b30', '#ff9500', '#ffd23a', '#30d158', '#0a84ff', '#ff2d92', '#bf5af2', '#ffffff'];
  function burst(n, at, cols, up = 5, spread = 2.2, big = 1) {
    if (reduce) n = Math.min(n, 16); let k = 0;
    for (const P of parts) { if (k >= n) break; if (P.life > 0) continue; k++;
      P.life = 2.2 + Math.random() * 1.2; P.p.copy(at).add(new T.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.4, 0));
      P.v.set((Math.random() - 0.5) * spread * 2, up * (0.6 + Math.random() * 0.6), 1 + Math.random() * 2.2); P.r.set(Math.random() * 6, Math.random() * 6, Math.random() * 6); P.w.set((Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14); P.s = big * (0.8 + Math.random() * 0.6);
      conf.setColorAt(parts.indexOf(P), cc.set(cols[(Math.random() * cols.length) | 0])); }
    if (conf.instanceColor) conf.instanceColor.needsUpdate = true;
  }
  let shakeT = -9, punchT = -9, hostHop = -9;

  // ---- foxes
  function buildFox(L) {
    const C = h => new T.Color(h), body = [], head = [], tail = [];
    const add = (arr, g, col, p, r = [0, 0, 0], s = [1, 1, 1]) => arr.push({ geo: g, col: C(col), m: new T.Matrix4().compose(new T.Vector3(...p), new T.Quaternion().setFromEuler(new T.Euler(...r)), new T.Vector3(...s)) });
    const coat2 = '#1f2937', y0 = 0.35;
    add(body, G3.sph, L.coat, [0, 1.02 + y0, 0], [0, 0, 0], [0.34, 0.42, 0.28]);
    add(body, G3.sph, L.chest, [0, 1.1 + y0, 0.16], [0, 0, 0], [0.19, 0.27, 0.14]);
    add(body, G3.cyl, L.trim, [0, 1.36 + y0, 0], [0, 0, 0], [0.2, 0.05, 0.17]);
    if (L.bow) { add(body, G3.cone, '#e11d48', [-0.07, 1.35 + y0, 0.18], [0, 0, Math.PI / 2], [0.05, 0.1, 0.035]); add(body, G3.cone, '#e11d48', [0.07, 1.35 + y0, 0.18], [0, 0, -Math.PI / 2], [0.05, 0.1, 0.035]); }
    for (const sd of [-1, 1]) {
      add(body, G3.cyl, coat2, [sd * 0.13, 0.55, 0], [0, 0, 0], [0.09, 1.0, 0.09]); add(body, G3.sph, '#0f172a', [sd * 0.13, 0.06, 0.05], [0, 0, 0], [0.1, 0.06, 0.15]);
      add(body, G3.sph, L.coat, [sd * 0.3, 1.0 + y0, 0.18], [-0.9, 0, sd * 0.2], [0.09, 0.26, 0.09]);
      add(body, G3.sph, L.fur, [sd * 0.27, 0.9 + y0, 0.42], [0, 0, 0], [0.09, 0.07, 0.11]);
    }
    add(tail, G3.sph, L.fur, [0, 0, -0.18], [0.6, 0, 0], [0.14, 0.14, 0.3]); add(tail, G3.sph, L.fur, [0, 0.14, -0.42], [0.95, 0, 0], [0.15, 0.15, 0.24]); add(tail, G3.sph, '#ffffff', [0, 0.3, -0.56], [1.2, 0, 0], [0.11, 0.11, 0.14]);
    add(head, G3.sph, L.fur, [0, 0.22, 0], [0, 0, 0], [0.27, 0.25, 0.25]);
    for (const sd of [-1, 1]) {
      add(head, G3.sph, L.chest, [sd * 0.15, 0.12, 0.1], [0, 0, 0], [0.13, 0.1, 0.11]);
      add(head, G3.sph, L.eye, [sd * 0.1, 0.27, 0.2], [0, 0, 0], [0.045, 0.055, 0.03]); add(head, G3.sph, '#ffffff', [sd * 0.09 + 0.012, 0.29, 0.226], [0, 0, 0], [0.014, 0.014, 0.01]);
      add(head, G3.cone, L.fur, [sd * 0.15, 0.48, -0.02], [0, 0, -sd * 0.35], [0.1, 0.25, 0.07]); add(head, G3.cone, '#3f1d1d', [sd * 0.15, 0.46, 0.02], [0, 0, -sd * 0.35], [0.06, 0.17, 0.03]);
    }
    add(head, G3.cone, L.chest, [0, 0.14, 0.28], [Math.PI / 2, 0, 0], [0.11, 0.24, 0.09]); add(head, G3.sph, '#111111', [0, 0.15, 0.4], [0, 0, 0], [0.035, 0.03, 0.03]);
    if (L.hat === 'visor') { add(head, G3.cyl, '#15803d', [0, 0.38, 0.16], [0.35, 0, 0], [0.24, 0.015, 0.17]); add(head, G3.cyl, '#14532d', [0, 0.38, 0], [0, 0, 0], [0.26, 0.04, 0.24]); }
    if (L.hat === 'cap') { add(head, G3.sph, L.trim, [0, 0.4, 0], [0, 0, 0], [0.25, 0.12, 0.24]); add(head, G3.cyl, L.trim, [0, 0.37, 0.22], [0.15, 0, 0], [0.15, 0.02, 0.12]); }
    if (L.hat === 'bowler') { add(head, G3.cyl, '#111111', [0, 0.5, 0], [0, 0, 0], [0.17, 0.16, 0.17]); add(head, G3.cyl, '#111111', [0, 0.42, 0], [0, 0, 0], [0.27, 0.02, 0.27]); }
    if (L.hat === 'shades') { for (const sd of [-1, 1]) add(head, G3.box, '#0b0a12', [sd * 0.1, 0.27, 0.235], [0, 0, 0], [0.12, 0.06, 0.03]); add(head, G3.box, '#0b0a12', [0, 0.28, 0.24], [0, 0, 0], [0.08, 0.015, 0.02]); }
    const mat = toon('#ffffff', { vertexColors: true }), root = new T.Group();
    const mk = parts => { const g = merge(T, parts), m = new T.Mesh(g, mat), o = new T.Mesh(g, ink); m.castShadow = !phone; const gr = new T.Group(); gr.add(m, o); return gr; };
    const B = mk(body), H = mk(head), Tl = mk(tail); H.position.set(0, 1.42 + y0, 0.02); Tl.position.set(0, 0.62 + y0, -0.2);
    root.add(B, H, Tl); root.userData = { head: H, tail: Tl, body: B, mat, bob: Math.random() * 6, arm: 0 };
    return root;
  }
  const disposeFox = f => f.traverse(o => { if (o.isMesh && o.material !== ink && o.geometry && !Object.values(G3).includes(o.geometry)) o.geometry.dispose(); });
  const host = buildFox(LYRA); host.position.set(-2.95, 0, -0.9); host.rotation.y = 0.45; room.add(host);
  const podG = new T.Group(); scene.add(podG);
  let pods = [], podKey = '';
  const PODZ = 1.15;
  function podX(i, n) { const sp = portrait ? 1.0 : 1.25; return (i - (n - 1) / 2) * sp; }
  function layoutPods() {
    const G = st.G, ps = G ? G.players : [{ name: 'YOU', col: '#ec3013' }];
    const k = ps.map(p => p.col).join('|') + (portrait ? 'P' : 'L'); if (k === podKey) return; podKey = k;
    pods.forEach(p => podG.remove(p.g)); pods = [];
    ps.forEach((p, i) => {
      const g = new T.Group(), x = podX(i, ps.length); g.position.set(x, 0, PODZ);
      const box = new T.Mesh(G3.box, toon('#2a1712')); box.scale.set(0.82, 0.5, 0.6); box.position.y = 0.25; g.add(box);
      const stripe = new T.Mesh(G3.box, toon(p.col, { emissive: p.col, emissiveIntensity: 0.25 })); stripe.scale.set(0.84, 0.12, 0.62); stripe.position.y = 0.36; g.add(stripe);
      const top = new T.Mesh(G3.box, goldM); top.scale.set(0.9, 0.05, 0.66); top.position.y = 0.52; g.add(top);
      const lamp = new T.Mesh(G3.sph, new T.MeshBasicMaterial({ color: p.col })); lamp.scale.set(0.16, 0.16, 0.16); lamp.position.y = 0.66; g.add(lamp);
      podG.add(g); pods.push({ g, lamp });
    });
  }

  // ---- state
  const st = { mode: 'menu', G: null, local: true, me: 0, net: null, practice: false, charging: false, power: 0, chargeT: 0, angle: 0, anim: null, animId: 0, lastRes: 0, timers: [], gold: 0, msg: '' };
  st.msg = 'LYRA · STEP UP AND SPIN THE TREASURE WHEEL.';
  let insets = { top: 60, bottom: 200, left: 0, right: 0 }, dirty = true, raf = 0, last = performance.now(), Wpx = 1, Hpx = 1, camShift = [0, 0], portrait = false;
  const camBase = { p: new T.Vector3(0, 3, 10), t: new T.Vector3(0, 2.4, 0) }, camCur = { p: new T.Vector3(0, 3, 10), t: new T.Vector3(0, 2.4, 0) };
  const emit = () => { dirty = true; };
  const later = (ms, fn) => { const id = setTimeout(() => { st.timers = st.timers.filter(t => t !== id); fn(); }, ms); st.timers.push(id); return id; };
  const clearTimers = () => { st.timers.forEach(clearTimeout); st.timers = []; st.potShown = null; st.animId = 0; st.lastRes = 0; st.anim = null; st.lastBonus = null; };
  const jackNow = () => st.G ? st.G.jackpot : (S ? stat('jackpot', RULES.jackBase) : RULES.jackBase);

  // ---- camera fit (wheel + podiums inside the free area between the HUD panels)
  function fitCamera() {
    const w = Wpx, h = Hpx; cam.aspect = w / h; cam.fov = WD ? (WD.camera.fov || 50) : portrait ? 46 : 36; cam.updateProjectionMatrix();
    const sideM = portrait ? 0.04 : 0.04, xl = -1 + 2 * insets.left / w + sideM, xr = 1 - 2 * insets.right / w - sideM, yb = -1 + 2 * insets.bottom / h, yt = 1 - 2 * insets.top / h;
    const pts = []; for (let k = 0; k < 24; k++) { const a = k / 24 * TAU; pts.push(new T.Vector3(Math.cos(a) * (WR + 0.45), WY + Math.sin(a) * (WR + 0.45), WZ)); }
    pts.push(new T.Vector3(-2.1, WY + WR + 1.85, WZ), new T.Vector3(2.1, WY + WR + 1.85, WZ));
    const n = st.G ? st.G.players.length : 1; for (let i = 0; i < n; i++) { const x = podX(i, n); pts.push(new T.Vector3(x - 0.45, 0, PODZ + 0.3), new T.Vector3(x + 0.45, 0, PODZ + 0.3), new T.Vector3(x, 0.85, PODZ)); }
    if (!portrait) pts.push(new T.Vector3(-3.3, 2.0, -0.9), new T.Vector3(-3.3, 0, -0.9));
    const pitch = (portrait ? 14 : 9) * Math.PI / 180, dir = new T.Vector3(0, Math.sin(pitch), Math.cos(pitch)), tgt = new T.Vector3(0, 2.6, 0);
    let d = 12, bb = null; const v = new T.Vector3();
    const measure = () => { cam.position.copy(tgt).addScaledVector(dir, d); cam.lookAt(tgt); cam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { v.copy(p).project(cam); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); } return { x0, x1, y0, y1 }; };
    for (let it = 0; it < 6; it++) { bb = measure(); const s = Math.max((bb.x1 - bb.x0) / Math.max(0.2, xr - xl), (bb.y1 - bb.y0) / Math.max(0.2, yt - yb)); d = Math.max(4, Math.min(45, d * (1 + (s - 1) * 0.92))); }
    bb = measure(); camShift = [(xl + xr) / 2 - (bb.x0 + bb.x1) / 2, (yb + yt) / 2 - (bb.y0 + bb.y1) / 2];
    camBase.p.copy(cam.position); camBase.t.copy(tgt);
    if (WD) { const hh = Math.tan(cam.fov * Math.PI / 360) * d, rt = new T.Vector3(1, 0, 0).applyQuaternion(cam.quaternion), up = new T.Vector3(0, 1, 0).applyQuaternion(cam.quaternion), off = rt.multiplyScalar(-camShift[0] * hh * cam.aspect).add(up.multiplyScalar(-camShift[1] * hh)); camBase.p.add(off); camBase.t.add(off); camShift = [0, 0]; cam.updateProjectionMatrix(); }   // world: no skewed projection, move the camera instead
    else applyShift();
  }
  function applyShift() { cam.updateProjectionMatrix(); cam.projectionMatrix.elements[8] -= camShift[0]; cam.projectionMatrix.elements[9] -= camShift[1]; cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert(); }
  function resize() {
    const r = WD ? { width: innerWidth, height: innerHeight } : container.getBoundingClientRect(); Wpx = Math.max(1, r.width | 0); Hpx = Math.max(1, r.height | 0); if (!WD) R.setSize(Wpx, Hpx, false);
    const p = Hpx > Wpx * 1.05; if (p !== portrait) { portrait = p; podKey = ''; }
    layoutPods(); fitCamera(); camCur.p.copy(camBase.p); camCur.t.copy(camBase.t); emit();
  }

  // ---- local / host engine
  const isHost = () => st.local || (st.net && st.net.host);
  const myTurn = () => { const G = st.G; if (!G) return false; if (st.mode !== 'net') return true; return G.players[G.cur] && G.players[G.cur].id === st.net.me; };
  function changed() { // host: after any rule change
    const G = st.G; if (!G) return;
    if (st.mode === 'net' && st.net && st.net.host) st.net.send('sn', G);
    apply();
  }
  function apply() { // everyone: mirror G into the 3D scene
    const G = st.G; if (!G) return;
    if (G.spin && G.phase === 'spinning' && G.spin.id !== st.animId) { st.animId = G.spin.id; st.anim = { s: G.spin, t0: performance.now(), lastTick: segAt(G.spin.a0) }; }
    if (G.phase !== 'spinning' && st.anim) { st.anim = null; st.angle = G.angle; }
    if (!st.anim) st.angle = G.angle;
    if (G.result && G.result.n !== st.lastRes) { st.lastRes = G.result.n; const k = G.result.kind; (k === 'bust' ? SFX.bust : k === 'jack' ? SFX.jack : k === 'bank' ? SFX.bank : k === 'win' || k === 'free' ? SFX.win : k === 'bonus' ? SFX.turn : () => {})(); if (k === 'jack') st.party = performance.now(); if (k === 'bust') st.sad = performance.now();
      const now = performance.now(), top = new T.Vector3(0, WY + WR * 0.6, WZ + 0.4), pod = new T.Vector3(podX(G.cur, G.players.length), 0.9, PODZ);
      if (G.spin && (k === 'win' || k === 'bust' || k === 'jack' || k === 'free' || k === 'bonus' || k === 'meh')) showWedge(G.spin.seg);
      if (k === 'jack') { burst(CN, top, RAIN, 6.5, 3); punchT = now; hostHop = now; vib([40, 40, 90]); }
      else if (k === 'bank') { burst(phone ? 50 : 70, pod, ['#ffd23a', '#f5b700', '#fff3b0'], 4.5, 1.2, 1.3); hostHop = now; vib(25); }
      else if (k === 'win' && G.pot >= 40) { burst(30, top, RAIN, 4, 1.6); hostHop = now; }
      else if (k === 'bust') { shakeT = now; vib(70); }
      musicDuck(k === 'jack'); if (k === 'jack') later(2600, () => musicDuck(false)); }
    layoutPods(); emit();
  }
  const vib = p => { try { if (!reduce && navigator.vibrate) navigator.vibrate(p); } catch (e) {} };
  function hostAfterSpin() { // host schedules the result
    const G = st.G, s = G.spin; later(s.dur * 1000 + 450, () => { if (st.G !== G) return; const r = resolveSpin(G); afterRule(r); changed(); });
  }
  function afterRule(r) {
    const G = st.G; if (!G) return;
    if (G.phase === 'turnEnd') {
      const p = G.players[G.cur];
      if (G.kind === 'solo' && !st.practice && S) { if (G.lastBank > 0) S.addGold(G.lastBank); setStat('turns', stat('turns') + 1); S.best('meruWheel.bestBank', G.lastBank || 0); S.addXp(1);
        if (G.result && G.result.kind === 'jack') { setStat('jackpots', stat('jackpots') + 1); S.addXp(10); G.jackpot = RULES.jackBase; setStat('jackpot', G.jackpot); }
        if (G.result && G.result.kind === 'bust') setStat('busts', stat('busts') + 1); }
      later(G.kind === 'solo' ? 1500 : 2100, () => { if (st.G !== G) return; nextTurn(G); changed(); if (G.phase === 'ready' && st.mode === 'net') SFX.turn(); });
    }
  }
  function startTurnSolo() {
    const G = st.G; if (!G || G.kind !== 'solo' || (G.phase !== 'done' && G.phase !== 'ready')) return false;
    if (!st.practice) { if (!S || !S.spend(RULES.cost)) { st.msg = 'YOU NEED ' + RULES.cost + ' GOLD FOR A TURN. TRY THE PRACTICE WHEEL.'; G.log = st.msg; emit(); return false; } G.jackpot += RULES.jackGrow; setStat('jackpot', G.jackpot); }
    G.phase = 'ready'; G.pot = 0; G.used = 0; G.result = null; G.log = st.practice ? 'PRACTICE TURN · HOLD SPIN' : 'TURN PAID · ' + RULES.cost + ' GOLD · HOLD SPIN'; changed(); return true;
  }

  // ---- actions (local, or sent to the host online)
  function send(a) { if (st.mode === 'net' && st.net && !st.net.host) { st.net.send('ev', { k: 'act', ...a }, st.net.hostId()); return true; } return hostAct(a, st.mode === 'net' ? st.net.me : null); }
  function hostAct(a, from) {
    const G = st.G; if (!G) return false;
    if (st.mode === 'net' && from != null && (!G.players[G.cur] || G.players[G.cur].id !== from) && a.a !== 'ready') return false;
    if (a.a === 'spin') { const jit = (Math.random() - 0.5) * 1.4; if (!doSpin(G, a.p, jit)) return false; changed(); hostAfterSpin(); return true; }
    if (a.a === 'bank') { if (!bank(G)) return false; afterRule('turnEnd'); changed(); return true; }
    if (a.a === 'pick') { if (!doPick(G, a.i)) return false; if (G.phase === 'turnEnd') afterRule('turnEnd'); changed(); return true; }
    if (a.a === 'ready') { if (G.phase !== 'pass') return false; G.phase = 'ready'; G.result = null; changed(); SFX.turn(); return true; }
    return false;
  }
  // SPIN: hold to charge, release to spin. The meter rises and falls; top = biggest spin.
  function chargeStart() { const G = st.G; actx(); if (!G || !canSpin(G) || !myTurn() || st.charging) return false; st.charging = true; st.chargeT = performance.now(); st.power = 0; emit(); return true; }
  function chargeEnd() { if (!st.charging) return false; st.charging = false; const p = st.power; emit(); return spinPower(Math.max(0.12, p)); }
  function chargeCancel() { st.charging = false; emit(); }
  function spinPower(p) { const G = st.G; actx(); if (!G || !canSpin(G) || !myTurn()) return false; return send({ a: 'spin', p: Math.max(0, Math.min(1, p)) }); }
  // swipe the wheel (anywhere on the 3D view) to spin it
  let sw = null;
  if (!WD) R.domElement.addEventListener('pointerdown', e => { sw = { y: e.clientY, x: e.clientX, t: performance.now() }; });
  if (!WD) R.domElement.addEventListener('pointerup', e => {
    if (!sw) return; const dt = Math.max(16, performance.now() - sw.t), dy = e.clientY - sw.y, dx = e.clientX - sw.x, d = Math.hypot(dx, dy); const s0 = sw; sw = null;
    const G = st.G; if (!G) return;
    if (G.phase === 'bonus' && d < 12) { pickAt(e.clientX, e.clientY); return; }
    if (d > 40 && dt < 600 && canSpin(G) && myTurn()) spinPower(Math.min(1, (d / dt) / 2.4));
  });
  if (!WD) R.domElement.addEventListener('pointercancel', () => { sw = null; });
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  function pickAt(cx, cy) { const r = R.domElement.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height * 2 - 1)); ray.setFromCamera(ndc, cam); const hit = ray.intersectObjects(bonusCards.map(c => c.g), true)[0]; if (!hit) return; const i = bonusCards.findIndex(c => c.g === hit.object.parent.parent); if (i >= 0) pick(i); }
  function pick(i) { const G = st.G; if (!G || G.phase !== 'bonus' || !myTurn()) return false; SFX.flip(); return send({ a: 'pick', i }); }

  // ---- modes
  function startSolo({ practice = false } = {}) {
    clearTimers(); st.mode = 'solo'; st.practice = practice || !S; st.local = true; st.net = null;
    st.G = newGame({ kind: 'solo', players: [{ id: 'me', name: 'YOU', col: '#ec3013' }], jackpot: st.practice ? RULES.partyJack : stat('jackpot', RULES.jackBase) });
    st.G.phase = 'done'; st.G.angle = st.angle; podKey = ''; layoutPods(); fitCamera(); apply();
    return startTurnSolo();
  }
  function startParty({ players = 2, rounds = 3 } = {}) {
    clearTimers(); st.mode = 'party'; st.practice = true; st.local = true; st.net = null;
    const n = Math.max(2, Math.min(5, players)); st.G = newGame({ kind: 'party', players: COLS.slice(0, n).map((c, i) => ({ id: 'p' + i, name: c[0], col: c[1] })), rounds, jackpot: RULES.partyJack });
    st.G.angle = st.angle; podKey = ''; layoutPods(); fitCamera(); apply();
  }
  function leave() { clearTimers(); st.mode = 'menu'; st.G = null; st.anim = null; st.charging = false; st.net = null; st.msg = 'LYRA · COME BACK ANY TIME.'; podKey = ''; layoutPods(); fitCamera(); emit(); }
  // ONLINE (host = lowest id; the page owns the room; the host runs the rules and sends G to everyone)
  function netBegin({ me, players, isHost, send: sendFn, hostId }) {
    clearTimers(); st.mode = 'net'; st.practice = true; st.local = false; st.net = { me, host: isHost, send: sendFn, hostId };
    st.G = newGame({ kind: 'net', players: players.map(p => ({ id: p.id, name: p.name, col: p.col })), rounds: 3, jackpot: RULES.partyJack });
    podKey = ''; layoutPods(); fitCamera(); if (isHost) changed(); else apply();
  }
  function netRecv(t, d, from) {
    if (st.mode !== 'net' || !st.net) return;
    if (t === 'sn' && !st.net.host && d && d.players) { st.G = d; apply(); return; }
    if (t === 'ev' && st.net.host && d && d.k === 'act') hostAct(d, from);
  }
  function netDrop(id) { // a player left: the host skips them from now on
    const G = st.G; if (st.mode !== 'net' || !G || !st.net || !st.net.host) return;
    const i = G.players.findIndex(p => p.id === id); if (i < 0) return;
    const wasCur = i === G.cur; G.players.splice(i, 1); if (G.players.length < 1) { leave(); return; }
    if (i < G.cur || G.cur >= G.players.length) G.cur = Math.max(0, Math.min(G.cur - (i < G.cur ? 1 : 0), G.players.length - 1));
    if (wasCur) { clearTimers(); G.pot = 0; G.used = 0; G.bonus = null; G.spin = null; G.phase = 'ready'; G.log = G.players[G.cur].name + "'S TURN"; }
    podKey = ''; changed();
  }
  function netEnd() { if (st.mode === 'net') leave(); }

  // ---- HUD state for the page
  const lp = new T.Vector3();
  function hud() {
    const G = st.G, n = G ? G.players.length : 0;
    const players = G ? G.players.map((p, i) => { lp.set(podX(i, n), 0.27, PODZ + 0.31).project(cam); return { name: p.name, col: p.col, score: p.score, active: i === G.cur && G.phase !== 'over', me: st.mode === 'net' ? p.id === st.net.me : st.mode === 'solo', win: G.phase === 'over' && G.winners.includes(i), x: Math.round((lp.x + 1) * 500) / 10, y: Math.round((1 - lp.y) * 500) / 10 }; }) : [];
    const cur = G && G.players[G.cur];
    const ph = G ? G.phase : 'menu';
    const mine = !!G && myTurn();
    let wait = '';
    if (G && !mine && st.mode === 'net' && (ph === 'ready' || ph === 'bonus')) wait = cur.name + (ph === 'bonus' ? ' IS PICKING A CARD' : ' IS UP');
    const stand = G && ph === 'over' ? G.players.map((p, i) => ({ i, ...p })).sort((a, b) => b.score - a.score).map((p, k) => ({ place: k + 1, name: p.name, col: p.col, score: p.score, win: G.winners.includes(p.i) })) : [];
    return {
      mode: st.mode, phase: ph, practice: st.practice, gold: S ? S.data.gold : 0, cost: RULES.cost, jackpot: jackNow(), mute: !AU.on, portrait,
      players, cur: cur ? { name: cur.name, col: cur.col } : null, pot: G ? (st.potShown ?? G.pot) : 0, used: G ? G.used : 0, spinsMax: RULES.spins, say: G && G.say || '', music: MUS.on,
      canSpin: !!G && canSpin(G) && mine, canBank: !!G && canBank(G) && mine, canPick: !!G && ph === 'bonus' && mine && G.bonus && G.bonus.pick < 0, mine,
      charging: st.charging, power: st.power, result: G && G.result && ph !== 'spinning' ? G.result : null, log: G ? G.log : st.msg, msg: st.msg, wait,
      round: G ? G.round : 0, rounds: G ? G.rounds : 0, stand, net: st.mode === 'net', host: !!(st.net && st.net.host),
      best: { turns: stat('turns'), bank: stat('bestBank'), jackpots: stat('jackpots') },
    };
  }

  // ---- loop
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  let emitT = 0, flapV = 0, flapA = 0, chase = 0, lastPowSnd = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (document.hidden) { last = now; return; }
    const dt = Math.min(0.05, (now - last) / 1000); last = now; const tsec = now / 1000; const G = st.G;
    // wheel
    let speed = 0;
    if (st.anim) { const a = st.anim, t = (now - a.t0) / 1000; st.angle = angleAt(a.s, t); speed = Math.max(0, a.s.v0 - K * t); const tk = segAt(st.angle); if (tk !== a.lastTick && t < a.s.dur) { a.lastTick = tk; SFX.tick(); flapV = -6 - speed * 0.6; } }
    disc.rotation.z = st.angle;
    blurM.opacity = Math.max(0, Math.min(0.9, (speed - 2.5) / 8));
    const wa = (now - wedgeT) / 1000; wedgeM.opacity = wa < 2.6 ? (0.42 + Math.sin(wa * 12) * 0.18) * Math.min(1, (2.6 - wa) * 2) : 0;
    musicEnergy(st.anim ? Math.min(1, 0.4 + speed / 12) : st.charging ? 0.4 : 0);
    // confetti
    let live = false;
    for (let i = 0; i < CN; i++) { const P = parts[i]; if (P.life <= 0) continue; live = true; P.life -= dt; P.v.y -= 7.5 * dt; P.v.multiplyScalar(1 - 1.4 * dt); P.p.addScaledVector(P.v, dt);
      if (P.p.y < 0.03) { P.p.y = 0.03; P.v.set(0, 0, 0); P.w.multiplyScalar(0.9); }
      P.r.x += P.w.x * dt; P.r.y += P.w.y * dt; P.r.z += P.w.z * dt; const f = Math.min(1, P.life * 2) * P.s;
      m4.compose(P.p, q4.setFromEuler(P.r), s4.set(f, f, f)); conf.setMatrixAt(i, P.life > 0 ? m4 : zero); }
    if (live || conf.userData.wasLive) conf.instanceMatrix.needsUpdate = true; conf.userData.wasLive = live;
    // pot counter ticks up
    if (G) { const tgt = G.pot; if (st.potShown !== tgt) { st.potShown = st.potShown == null || tgt < st.potShown ? tgt : Math.min(tgt, st.potShown + Math.max(1, Math.ceil((tgt - st.potShown) * dt * 6))); dirty = true; } }
    flapV += (-flapA * 140 - flapV * 9) * dt; flapA += flapV * dt; clap.rotation.z = Math.max(-0.7, Math.min(0.4, flapA));
    // charge meter (triangle wave, 1.4 s up and down)
    if (st.charging) { const ph = ((now - st.chargeT) / 1400) % 1; st.power = ph < 0.5 ? ph * 2 : 2 - ph * 2; if (now - lastPowSnd > 70) { lastPowSnd = now; SFX.charge(st.power); } dirty = true; }
    // bulbs: chase, faster while spinning; all flash on a jackpot; red on a bust
    const party = st.party && now - st.party < 3500, sad = st.sad && now - st.sad < 1400;
    chase += dt * (2 + speed * 2.2 + (st.charging ? 6 * st.power : 0));
    bulbs.forEach((b, i) => { b.material = sad ? (((tsec * 6) | 0) % 2 ? bulbRed : bulbOff) : party ? (((tsec * 8) | 0) % 2 === i % 2 ? bulbOn : bulbRed) : (((i + (chase | 0)) % 4) < 2 ? bulbOn : bulbOff); });
    glow.intensity = party ? 18 + Math.sin(tsec * 20) * 6 : 10;
    paintJack(jackNow());
    // bonus cards
    const bon = G && G.phase === 'bonus' ? G.bonus : (G && G.result && G.result.kind !== 'bonus' && st.lastBonus && now - st.lastBonus.t < 2600 ? st.lastBonus.b : null);
    if (G && G.phase === 'bonus' && G.bonus) st.lastBonus = { b: G.bonus, t: now };
    bonusG.visible = !!bon;
    if (bon) bonusCards.forEach((c, i) => {
      const fk = bon.faces[i] + bon.prizes[i].t; if (c.faceKey !== fk) { c.faceKey = fk; if (c.front.material.map !== backTex) c.front.material.map.dispose(); c.front.material.map = tex(paintBonusCard(bon.faces[i], bon.prizes[i].t, CW, CH)); c.front.material.needsUpdate = true; }
      const shown = bon.pick === i || (bon.pick >= 0 && G.phase !== 'bonus'); c.want = shown ? 0 : Math.PI; c.cur = damp(c.cur, c.want, 8, dt); c.fl.rotation.y = c.cur;
      const lift = bon.pick === i ? 0.18 : 0; c.g.position.y = damp(c.g.position.y, lift + Math.sin(tsec * 2 + i) * 0.04, 6, dt); c.g.scale.setScalar(damp(c.g.scale.x, bon.pick === i ? 1.12 : 1, 6, dt));
    });
    // foxes: the active one bounces when winning, everyone looks at the wheel while it spins
    pods.forEach((p, i) => {
      const active = G && i === G.cur, res = G && G.result;
      const hop = active && res && (res.kind === 'win' || res.kind === 'bank' || res.kind === 'jack') ? Math.abs(Math.sin(tsec * 8)) * 0.1 : G && G.phase === 'over' && G.winners.includes(i) ? Math.abs(Math.sin(tsec * 7)) * 0.12 : 0;
      p.lamp.position.y = 0.66 + hop; p.lamp.visible = !!active || (G && G.phase === 'over' && G.winners.includes(i)) || !G; p.lamp.scale.setScalar(0.16 + (active ? Math.sin(tsec * 6) * 0.03 : 0));
      p.g.children[1].material.emissiveIntensity = active ? 0.55 + Math.sin(tsec * 6) * 0.25 : 0.12;
    });
    { const hh = (now - hostHop) / 1000; host.position.y = hh < 1.6 && !reduce ? Math.abs(Math.sin(hh * 9)) * 0.18 * (1.6 - hh) : 0; }
    host.userData.tail.rotation.y = Math.sin(tsec * (now - hostHop < 1600 ? 9 : 1.7)) * 0.3; host.userData.head.rotation.y = damp(host.userData.head.rotation.y, st.anim ? -0.6 : Math.sin(tsec * 0.4) * 0.3, 3, dt);
    // camera: closer on the wheel while it spins, on the cards for the bonus
    let wantP = camBase.p, wantT = camBase.t;
    if (G && G.phase === 'bonus') { wantT = new T.Vector3(0, WY, WZ + 0.9); wantP = new T.Vector3(0, WY + 0.2, WZ + 0.9 + (portrait ? 8.4 : 3.6)); }
    else if (st.anim) { const z = portrait ? 1 : 0.86; wantP = camBase.p.clone().lerp(new T.Vector3(0, WY, WZ), 0.12 * z); wantT = camBase.t.clone().lerp(new T.Vector3(0, WY, WZ), 0.3); }
    camCur.p.x = damp(camCur.p.x, wantP.x, 3, dt); camCur.p.y = damp(camCur.p.y, wantP.y, 3, dt); camCur.p.z = damp(camCur.p.z, wantP.z, 3, dt);
    camCur.t.x = damp(camCur.t.x, wantT.x, 3, dt); camCur.t.y = damp(camCur.t.y, wantT.y, 3, dt); camCur.t.z = damp(camCur.t.z, wantT.z, 3, dt);
    cam.position.copy(camCur.p);
    const sk = (now - shakeT) / 1000; if (sk < 0.45 && !reduce) { const a = (0.45 - sk) * 0.16; cam.position.x += Math.sin(now * 0.09) * a; cam.position.y += Math.cos(now * 0.11) * a; }
    const pk = (now - punchT) / 1000; if (pk < 1.2 && !reduce) cam.position.lerp(new T.Vector3(0, WY, WZ), Math.sin(Math.min(1, pk / 1.2) * Math.PI) * 0.08);
    cam.lookAt(camCur.t); cam.updateMatrixWorld();
    if (WD) { STAGE.updateWorldMatrix(true, false); wcam.position.copy(cam.position); STAGE.localToWorld(wcam.position); wcam.quaternion.copy(stageQ).multiply(cam.quaternion); wcam.fov = cam.fov; wcam.aspect = cam.aspect; wcam.updateProjectionMatrix(); }
    if (live) dirty = dirty || now - emitT > 200;
    if (st.anim || camCur.p.distanceToSquared(wantP) > 1e-4) dirty = dirty || now - emitT > 150;
    if (!WD) R.render(scene, cam);
    if (dirty && now - emitT > 60) { dirty = false; emitT = now; try { onState(hud()); } catch (e) { console.warn(e); } }
  }
  const ro = new ResizeObserver(() => resize()); ro.observe(WD ? document.documentElement : container);
  resize(); paintJack(jackNow()); raf = requestAnimationFrame(frame);

  return {
    camera: wcam || cam, snapCam() { camCur.p.copy(camBase.p); camCur.t.copy(camBase.t); },
    hud, startSolo, startParty, leave, newTurn: startTurnSolo, chargeStart, chargeEnd, chargeCancel, spinPower, bank: () => send({ a: 'bank' }), pick, ready: () => send({ a: 'ready' }),
    netBegin, netRecv, netDrop, netEnd, resize,
    setInsets(i) { const k = JSON.stringify(i); if (k === this._ik) return; this._ik = k; insets = { ...insets, ...i }; fitCamera(); camCur.p.copy(camBase.p); camCur.t.copy(camBase.t); emit(); },
    mute(on) { AU.on = on == null ? !AU.on : !on; if (S) S.setFlag('meruWheel.mute', !AU.on); if (AU.on) musicStart(); else musicStop(); emit(); },
    music(on) { MUS.on = on == null ? !MUS.on : !!on; if (S) S.setFlag('meruWheel.noMusic', !MUS.on); if (MUS.on) musicStart(); else musicStop(); emit(); },
    state: st, audio: () => ({ ctx: AU.ctx ? AU.ctx.state : "none", music: !!MUS.timer, step: MUS.step }),
    destroy() { clearTimers(); musicStop(); removeEventListener('pointerdown', firstTouch, { capture: true }); removeEventListener('keydown', firstTouch, { capture: true }); cancelAnimationFrame(raf); ro.disconnect(); texs.forEach(t => t.dispose()); if (WD) { STAGE.parent && STAGE.parent.remove(STAGE); } else { R.dispose(); R.domElement.remove(); } },
  };
}
