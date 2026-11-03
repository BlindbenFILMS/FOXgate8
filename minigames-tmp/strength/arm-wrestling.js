// 8 GATES — ARM WRESTLING · THE IRON TABLE [armWrestle] · minigame #54 (STRENGTH & SPECTACLE)
// A building interior that fits any world: a back-room table under one lamp, a chalk ladder on the wall, a small crowd.
// PLAY: mash the PUSH pad to drive the clasped hands to the rival's side. Every tap costs STAMINA (the bar on the pad);
// tired arms push weakly, so burst and breathe. When the rival winds up a SURGE a ring closes on the pad: tap as it lands = COUNTER.
// First tap right on GRIP! = QUICK START. Best of 3 pins.
// MODES: LADDER (5 rivals, gold + XP, the belt) · QUICK MATCH (any rival you reached) · 2 PLAYERS · ONE PHONE (a pad each)
//        · ONLINE · KING OF THE TABLE (up to 4 in a room; winner stays, loser to the back of the line; the rest watch and cheer).
// MERGE: createArmWrestling({ container, onState, world }) stands alone; buildRoom(ctx) is split out so a world can drop the
// table into any existing interior later. No static imports: every shared file is loaded with load(), which finds the repo
// root next to this file, or the Design canvas's project paths (where files are packed one by one and ../ links break).
// Online uses the repo's engine/duel-net.js (same connectDuel API as Skate Park); without it, rooms work between tabs on one device.
// DEMO: demoStart() (or ?demo=1) plays one round by itself with captions that teach each move: QUICK START, PUSH, STAMINA, REST, COUNTER, PIN.
// Names, lines, prices of the rivals are DRAFT for Ben.

export const GAME = 'armWrestle';
export const ARM = { key: GAME, number: 54, name: 'ARM WRESTLING', room: 'armWrestle' };

// ---------- where shared files live ----------
function rootURL() {
  try { const u = import.meta.url; if (u && !/^(blob|data):/i.test(u)) return new URL('../../', u).href; } catch (e) {}
  try { if (typeof window !== 'undefined' && (window.__dcFiles || window.__dcRootPath != null)) return new URL('/appifact/', document.baseURI).href; } catch (e) {}
  return new URL('./', document.baseURI).href;
}
const ROOT = rootURL();
const load = p => import(ROOT + p);
const PATHS = { three: 'vendor/three/three.module.js', fox: 'fox-kit.js', cast: 'engine/cast.js', chair: 'engine/chair.js', save: 'engine/save.js', net: 'engine/duel-net.js' };

// ---------- rivals (DRAFT) ----------
// rate = taps per second at full stamina · surge = seconds between wind-ups · surgeK = shove size · cost = stamina use per tap (x)
export const RIVALS = [
  { id: 'pip', name: 'PIP', title: 'THE ROOKIE', rate: 4.6, surge: [8, 11], surgeK: 1.7, cost: 1, gold: 5, xp: 10,
    hi: 'First time at the big table. Go easy? No. Don’t.', win: 'I WON? I WON!', lose: 'Good grip. I’ll be back.',
    fox: { outfit: 'tee', torso: '#38bdf8', look: { fur: '#f59e0b', furDark: '#b45309', bodyScale: 0.92 }, mood: 'happy' } },
  { id: 'hope', cast: 'hope', name: 'HOPE', title: 'READS YOUR GRIP', rate: 5.5, surge: [5.5, 7.5], surgeK: 2.3, cost: 0.95, gold: 8, xp: 15,
    hi: 'I can hear your grip slip before you feel it.', win: 'Told you. Your wrist talks.', lose: 'Strong. Again sometime?' },
  { id: 'bruno', name: 'BRUNO', title: 'DOCK HAND', rate: 6.3, surge: [4.5, 6.5], surgeK: 2.7, cost: 0.95, gold: 12, xp: 20,
    hi: 'I lift crates all day. You’re a small crate.', win: 'Back to the docks with you.', lose: 'Huh. Heavier than you look.',
    fox: { outfit: 'vest', torso: '#2f5d2a', look: { fur: '#8a8f99', furDark: '#4b5563', tailMid: '#9ca3af', bodyScale: 1.08 }, mood: 'stern' } },
  { id: 'noble', cast: 'noble', name: 'NOBLE', title: 'CHAIR CHAMPION', rate: 6.9, surge: [4, 6], surgeK: 3.0, cost: 0.9, gold: 16, xp: 30,
    hi: 'All my strength lives up top. Ready?', win: 'Wheels down, arm up. My table.', lose: 'Clean pin. I respect it.' },
  { id: 'tusk', name: 'IRON TUSK', title: 'KING OF THE TABLE', rate: 7.5, surge: [3.4, 5], surgeK: 3.4, cost: 0.82, gold: 25, xp: 50,
    hi: 'Nobody has taken this table in nine years.', win: 'Nine years and a day.', lose: 'Take the belt. You earned it.',
    fox: { outfit: 'vest', torso: '#3a3836', look: { fur: '#5b4636', furDark: '#2e2219', muzzle: '#c9a98a', chin: '#e6d5c3', tailMid: '#6b5240', bodyScale: 1.16 }, eyes: ['#ec3013', '#ec3013'], mood: 'stern' } },
];
export const MAX_ROOM = 4;   // King of the Table: 2 wrestle, the rest wait in line (Ben's rule: rooms hold up to 4)
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PURPLE', '#a78bfa']];
// one table, any building: ?world= picks the room colours and the sign
export const WORLDS = {
  meru: { name: 'MERU', sign: 'THE IRON TABLE', wall: '#7a4a2e', wall2: '#5e3822', floor: '#9a6a3c', trim: '#e6b45a', table: '#6b4226', bg: '#1c120c', lamp: '#ffd9a0' },
  zion: { name: 'ZION', sign: 'GOLD DUST SALOON', wall: '#a8643a', wall2: '#7c4524', floor: '#b07a46', trim: '#f2c14e', table: '#5a3420', bg: '#22140a', lamp: '#ffcf8a' },
  luxor: { name: 'LUXOR', sign: 'BASALT PIT', wall: '#3b3a3f', wall2: '#2a292e', floor: '#55524f', trim: '#e6b45a', table: '#2f2b28', bg: '#0e0d10', lamp: '#ffc27a' },
  nebo: { name: 'NEBO', sign: 'LUMBER HALL', wall: '#4f6b3a', wall2: '#3a5129', floor: '#8a6a44', trim: '#d9c27a', table: '#6e4f2c', bg: '#101a0c', lamp: '#fff0b0' },
  jidda: { name: 'JIDDA', sign: 'DOCKSIDE TABLE', wall: '#3a7ca5', wall2: '#2b5f80', floor: '#c9b28a', trim: '#f4e3c0', table: '#7a5a3a', bg: '#0b1a24', lamp: '#fff2d0' },
  station: { name: 'DEEP SPACE FOX', sign: 'QUIRK’S TABLE', wall: '#3a4a5c', wall2: '#283545', floor: '#4b5868', trim: '#38bdf8', table: '#2a3442', bg: '#070b12', lamp: '#bfe8ff' },
};
const CODE_CH = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

// ---------- small helpers (copied in; the world engines keep their own) ----------
const rr = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (e0, e1, x) => { const t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));

// ---------- tuning ----------
const TUNE = { K: 0.34, decay: 3, cost: 0.028, regenIdle: 0.32, regenBusy: 0.06, minPow: 0.35, round: 25, quick: 0.35, quickK: 1.3, counterK: 2.6, ring: 0.95, win: 0.3 };

// ---------- a stand-in save (only if engine/save.js could not load: keeps to our own keys) ----------
function localSave() {
  const K = GAME + '.local'; let d = { gold: 0, stats: {}, flags: {}, items: {} }; try { d = { ...d, ...JSON.parse(localStorage.getItem(K) || '{}') }; } catch (e) {}
  const put = () => { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} };
  return { get data() { return d; }, stat: (k, v = 0) => d.stats[k] ?? v, setStat(k, v) { d.stats[k] = v; put(); }, best(k, v) { if (v > (d.stats[k] || 0)) { d.stats[k] = v; put(); return true; } return false; },
    flag: k => !!d.flags[k], setFlag(k, v = true) { d.flags[k] = !!v; put(); }, addGold(n) { d.gold += n; put(); return d.gold; }, addXp() {}, give(id, n = 1) { d.items[id] = (d.items[id] || 0) + n; put(); }, count: id => d.items[id] || 0 };
}

// ---------- online without the repo's duel-net: tabs on one device (BroadcastChannel) ----------
function localDuel({ game, code, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10); let bc = null;
  try { bc = new BroadcastChannel('8g-' + game + '-' + code); } catch (e) {}
  if (!bc) { setTimeout(() => onStatus && onStatus('offline'), 0); return { id, send() {}, leave() {} }; }
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return; onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => onStatus && onStatus('local'), 0);
  return { id, send(t, d, to) { try { bc.postMessage({ t, d, to: to || null, from: id }); } catch (e) {} }, leave() { try { bc.close(); } catch (e) {} } };
}

// =====================================================================================================
export async function createArmWrestling({ container, onState = () => {}, world = 'meru', embed = false, inWorld = null } = {}) {   // s477 inWorld { renderer, camera, parent }: the room builds into parent, no own renderer / render
  const W = WORLDS[world] || WORLDS.meru;
  let save = localSave(); load(PATHS.save).then(m => { if (m && m.save) { save = m.save; emit(true); } }).catch(() => {});
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;

  // ---------- the bout (index 0 = near side / you, 1 = far side) ----------
  const S = { phase: 'menu', mode: null, rival: 0, sc: [0, 0], round: 1, a: 0, p: [0, 0], st: [1, 1], last: [-9, -9], first: [true, true], t: 0, goT: 0, cd: 0, tl: TUNE.round,
    surge: null, surgeN: 0, nextSurge: 6, ai: { next: 0, rest: 0, des: false }, flash: null, flashN: 0, end: 0, result: null, taps: [], tapsBest: 0, cheer: 0, shake: 0, winner: -1 };
  let sel = clamp(save.stat(GAME + '.ladder', 0), 0, RIVALS.length - 1), lastEmit = 0, R = null, R2 = null, dead = false;
  const ladder = () => save.stat(GAME + '.ladder', 0);   // rivals beaten in order (0..5)
  // ---------- DEMO: the game plays one round itself and explains each move ----------
  const D = { on: false, stage: '', t: 0, next: 0, cap: '', key: '', n: 0, tapN: 0, end: 0 };
  const DEMO_STEPS = ['count', 'quick', 'mash', 'burn', 'rest', 'surge', 'finish', 'done'];
  const DEMO_CAP = {
    count: ['ARM WRESTLING · BEST OF 3 PINS', 'WATCH: THIS ROUND PLAYS ITSELF', 'DEMO'],
    quick: ['TAP RIGHT ON GRIP!', 'THE FIRST TAP ON TIME = A FREE SHOVE', 'TAP'],
    mash: ['TAP THE PUSH PAD FAST', 'THE YELLOW MARK SHOWS WHO IS WINNING', 'TAP TAP'],
    burn: ['EVERY TAP COSTS STAMINA', 'WATCH THE BAR ON THE PAD EMPTY · EMPTY ARMS PUSH WEAK', 'TAP'],
    rest: ['STOP FOR A MOMENT', 'STAMINA REFILLS FAST WHEN YOU REST', 'REST'],
    surge: ['RED RING = RIVAL WINDS UP', 'TAP WHEN IT TURNS GREEN TO COUNTER', 'WAIT…'],
    finish: ['NOW FINISH IT', 'PIN THE HAND TO THE PAD TO WIN THE ROUND', 'TAP TAP'],
    done: ['YOUR TURN!', 'BEAT 5 RIVALS FOR THE BELT · OR PLAY A FRIEND', 'GO'] };
  function demoStage(k) { D.stage = k; D.t = 0; D.n = DEMO_STEPS.indexOf(k) + 1; const c = DEMO_CAP[k]; D.cap = c[0]; D.sub = c[1]; D.key = c[2]; emit(true); }
  function demoStart() { if (NET.N) netLeave(true); startMatch('solo', 2); D.on = true; D.tapN = 0; D.next = 0; S.nextSurge = 999; demoStage('count'); }
  function demoStop(toMenu = true) { if (!D.on) return; D.on = false; if (toMenu) { S.phase = 'menu'; S.mode = null; S.result = null; S.flash = null; S.surge = null; if (R) R.cast(castFor()); } emit(true); }
  function demoTap() { D.tapN++; applyTap(0, true); }
  function demoStep(dt) {
    D.t += dt; const st = D.stage;
    if (st === 'count') { if (S.phase === 'pull') { demoTap(); demoStage('quick'); } return; }
    if (S.phase === 'roundEnd' && st !== 'done') { demoStage('done'); D.end = 3.2; return; }
    if (st === 'done') { D.end -= dt; if (D.end <= 0) demoStop(); return; }
    if (S.phase !== 'pull') return;
    S.p[1] *= Math.exp(-0.9 * dt);                      // the demo rival goes easy so the lesson always lands
    if (S.a < -0.5) S.a = -0.5; if (st !== 'finish' && S.a > 0.55) S.a = 0.55;   // keep it close until the lesson reaches the pin
    const mash = rate => { D.next -= dt; if (D.next <= 0) { demoTap(); D.next = 1 / rate; } };
    if (st === 'quick') { if (D.t > 1.4) demoStage('mash'); return; }
    if (st === 'mash') { mash(8.5); if (S.st[0] < 0.45 && D.t > 2.5) demoStage('burn'); return; }
    if (st === 'burn') { mash(8.5); if (S.st[0] < 0.1 || D.t > 3.5) demoStage('rest'); return; }
    if (st === 'rest') { if (S.st[0] > 0.9 && D.t > 1.6) { demoStage('surge'); D.surged = false; } return; }
    if (st === 'surge') { if (!D.surged) { if (D.t > 1.3) { D.surged = true; S.surge = { k: 0, done: null, id: ++S.surgeN }; flash('BRACE! ' + rv().name + ' WINDS UP', '#ff9a8a'); sfx.surge(); } return; }
      if (S.surge && !S.surge.done && S.surge.k >= 0.82) demoTap(); if (!S.surge) { S.nextSurge = 999; demoStage('finish'); } return; }
    if (st === 'finish') { mash(D.t < 1.2 ? 4 : 7.5); return; }
  }
  const flash = (txt, col = '#ffd23a', big = false) => { S.flash = { txt, col, big, id: ++S.flashN }; S.flashT = big ? 1.6 : 1.1; };

  // ---------- audio (made on the first tap) ----------
  let AC = null; const ac = () => { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume().catch(() => {}); return AC; };
  function tone(f, d = 0.08, v = 0.12, type = 'triangle', slide = 0) { const c = ac(); if (!c) return; const o = c.createOscillator(), g = c.createGain(), t = c.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + d); o.connect(g).connect(c.destination); o.start(t); o.stop(t + d + 0.02); }
  function noise(d = 0.4, v = 0.08, hp = 600) { const c = ac(); if (!c) return; const n = Math.floor(c.sampleRate * d), b = c.createBuffer(1, n, c.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); f.type = 'highpass'; f.frequency.value = hp; g.gain.value = v; s.buffer = b; s.connect(f).connect(g).connect(c.destination); s.start(); }
  const sfx = { tap: () => tone(rr(110, 140), 0.06, 0.1, 'square', -40), surge: () => tone(180, 0.5, 0.12, 'sawtooth', -110), counter: () => { tone(520, 0.12, 0.14, 'square'); setTimeout(() => tone(780, 0.18, 0.12, 'square'), 70); },
    go: () => tone(660, 0.25, 0.14, 'square'), beep: () => tone(440, 0.1, 0.1, 'square'), pin: () => { tone(90, 0.35, 0.22, 'sawtooth', -50); noise(0.9, 0.12, 400); }, cheer: () => noise(0.7, 0.06, 900) };
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

  // ---------- bout control ----------
  function resetRound() { Object.assign(S, { a: 0, p: [0, 0], st: [1, 1], last: [-9, -9], first: [true, true], surge: null, tl: TUNE.round, phase: 'count', cd: 3.2, winner: -1, taps: [] }); S.ai = { next: 0.4, rest: 0, des: false }; S.nextSurge = rr(...(rv().surge || [6, 8])); }
  const rv = () => RIVALS[S.rival] || RIVALS[0];
  function startMatch(mode, rival = sel) {
    D.on = false; if (NET.N && mode !== 'online') netLeave();
    S.mode = mode; S.rival = clamp(rival, 0, RIVALS.length - 1); S.sc = [0, 0]; S.round = 1; S.result = null; S.flash = null;
    if (R) R.cast(castFor()); resetRound(); ac(); emit(true);
  }
  function toMenu() { D.on = false; if (S.mode === 'online') { S.phase = 'lobby'; emit(true); return; } S.phase = 'menu'; S.mode = null; S.result = null; S.flash = null; if (R) R.cast(castFor()); emit(true); }

  // a tap from side i (0 near / 1 far). Online: you only tap your own side, the host applies it.
  function tap(i = 0) {
    ac(); if (D.on) return;
    if (S.mode === 'online') { netTap(); return; }
    if (S.mode !== 'duo' && i !== 0) return;
    applyTap(i, true);
  }
  function applyTap(i, local) {
    if (S.phase === 'count') { if (S.cd < 1.1 && local && i === 0) flash('WAIT FOR GRIP!', '#cfcac4'); return; }
    if (S.phase !== 'pull') return;
    const pow = TUNE.minPow + (1 - TUNE.minPow) * S.st[i];
    S.p[i] += pow; S.st[i] = Math.max(0, S.st[i] - TUNE.cost * (i === 1 && S.mode === 'solo' ? rv().cost : 1)); S.last[i] = S.t;
    if (S.first[i]) { S.first[i] = false; if (S.t - S.goT < TUNE.quick) { S.p[i] += TUNE.quickK; if (local || S.mode === 'online') flash(S.mode === 'solo' && i === 1 ? rv().name + ' QUICK START' : 'QUICK START', i === 0 ? '#22c55e' : '#ff9a8a'); } }
    if (i === 0 || S.mode === 'duo') { S.taps.push(S.t); S.tapN = (S.tapN || 0) + 1; if (local) { sfx.tap(); buzz(8); } }
    if (i === 0 && S.surge && S.surge.k >= 1 - TUNE.win / TUNE.ring && !S.surge.done) { S.surge.done = 'counter'; S.p[0] += TUNE.counterK; S.p[1] *= 0.35; flash('COUNTER!', '#22c55e', true); sfx.counter(); buzz(30); S.shake = 0.5; S.cheer = 1; }
  }

  function aiStep(dt) {
    const r = rv(), A = S.ai;
    if (A.rest > 0) { A.rest -= dt; if (S.a < -0.72) A.rest = 0; return; }
    if (S.st[1] < 0.22 && S.a > -0.6) { A.rest = rr(0.7, 1.3); return; }
    const des = S.a < -0.65 ? 1.22 : 1;
    A.next -= dt; if (A.next <= 0) { applyTap(1, false); A.next = 1 / (r.rate * des * rr(0.85, 1.15)); }
    // the surge: a wind-up the player can counter
    if (!S.surge) { S.nextSurge -= dt; if (S.nextSurge <= 0) { S.surge = { k: 0, done: null, id: ++S.surgeN }; flash('BRACE! ' + r.name + ' WINDS UP', '#ff9a8a'); sfx.surge(); } }
    else { S.surge.k += dt / TUNE.ring; if (S.surge.k >= 1 + 0.08 / TUNE.ring) { if (!S.surge.done) { S.p[1] += r.surgeK; flash('SURGE!', '#ec3013', true); S.shake = 0.6; buzz(40); } S.surge = null; S.nextSurge = rr(...r.surge); } }
  }

  function step(dt) {
    S.t += dt; if (S.flash) { S.flashT -= dt; if (S.flashT <= 0) S.flash = null; } S.shake = Math.max(0, S.shake - dt * 1.6); S.cheer = Math.max(0, S.cheer - dt * 0.8);
    if (S.mode === 'online' && !netIsHost()) return;   // guests just draw the host's snapshots
    if (D.on && (S.phase === 'count' || S.phase === 'roundEnd')) demoStep(dt);
    if (S.phase === 'count') { const before = Math.ceil(S.cd); S.cd -= dt; const now = Math.ceil(S.cd); if (now !== before && now > 0) sfx.beep(); if (S.cd <= 0) { S.phase = 'pull'; S.goT = S.t; flash('GRIP!', '#ffd23a', true); sfx.go(); } return; }
    if (S.phase === 'roundEnd') { S.end -= dt; if (S.end <= 0) nextRound(); return; }
    if (S.phase === 'break') { netBreak(dt); return; }
    if (S.phase !== 'pull') return;
    for (let i = 0; i < 2; i++) { S.p[i] *= Math.exp(-TUNE.decay * dt); const idle = S.t - S.last[i] > 0.3; S.st[i] = Math.min(1, S.st[i] + (idle ? TUNE.regenIdle : TUNE.regenBusy) * dt); }
    if (D.on) demoStep(dt);
    if (S.mode === 'solo') aiStep(dt);
    S.a = clamp(S.a + (S.p[0] - S.p[1]) * TUNE.K * dt, -1, 1); S.tl -= dt;
    while (S.taps.length && S.t - S.taps[0] > 1) S.taps.shift();
    if (S.mode === 'solo' && S.st[0] < 0.08 && S.t - S.last[0] < 0.2 && !(S.flash && S.flashT > 0.5)) flash('ARM BURNING · EASE OFF', '#ff9a8a');
    if (S.a >= 1 || S.a <= -1 || S.tl <= 0) { const w = S.a > 0 ? 0 : S.a < 0 ? 1 : -1; endRound(w); }
  }
  function endRound(w) {
    if (w < 0) { flash('DEAD EVEN · AGAIN', '#ffd23a', true); resetRound(); return; }
    S.winner = w; S.sc[w]++; S.phase = 'roundEnd'; S.end = 1.9; S.a = w === 0 ? 1 : -1; S.surge = null; S.shake = 0.9; S.cheer = 1.5; sfx.pin(); buzz(60);
    const nm = S.mode === 'online' && NET.bout ? [colOf(NET.bout.A)[0], colOf(NET.bout.B)[0]] : sideNames(), you = nm[w] === 'YOU';
    flash((S.tl <= 0 ? 'TIME · ' : 'PINNED! ') + nm[w] + (S.sc[w] >= 2 ? (you ? ' WIN' : ' WINS') : (you ? ' TAKE THE ROUND' : ' TAKES THE ROUND')), S.mode === 'online' ? '#ffd23a' : w === 0 ? '#22c55e' : '#ec3013', true);
    if (S.mode === 'online') netRoundEnd(w);
  }
  function nextRound() {
    if (S.mode === 'online') { netNextRound(); return; }
    if (S.sc[0] >= 2 || S.sc[1] >= 2) { finish(S.sc[0] >= 2 ? 0 : 1); return; }
    S.round++; resetRound();
  }
  function finish(w) {
    S.phase = 'done'; const r = rv(), won = w === 0; let gold = 0, xp = 0, sub = '', belt = false;
    if (S.mode === 'solo') {
      save.setStat(GAME + (won ? '.wins' : '.losses'), save.stat(GAME + (won ? '.wins' : '.losses'), 0) + 1);
      if (won) { const fresh = S.rival === ladder(); gold = fresh ? r.gold : 3; xp = fresh ? r.xp : 5; save.addGold(gold); save.addXp && save.addXp(xp);
        if (fresh) { save.setStat(GAME + '.ladder', S.rival + 1); if (S.rival === RIVALS.length - 1) { save.setFlag(GAME + '.champ', true); save.give && save.give('armWrestleBelt', 1); belt = true; } }
        sub = fresh ? (S.rival < RIVALS.length - 1 ? 'NEXT UP: ' + RIVALS[S.rival + 1].name : 'YOU ARE KING OF THE TABLE') : 'REMATCH WIN'; }
      else sub = r.name + ' TAKES IT ' + S.sc[1] + '–' + S.sc[0];
      sel = clamp(won && S.rival < RIVALS.length - 1 && S.rival + 1 <= ladder() ? S.rival + 1 : S.rival, 0, RIVALS.length - 1);
      S.result = { won, title: won ? 'YOU WIN' : r.name + ' WINS', sub, gold, xp, belt, line: won ? r.lose : r.win, who: r.name, next: won && S.rival < RIVALS.length - 1 };
    } else { const nm = sideNames(); S.result = { won, title: nm[w] + ' WINS', sub: S.sc[0] + '–' + S.sc[1], gold: 0, xp: 0, line: '', who: '', next: false }; }
    emit(true);
  }
  function sideNames() {
    if (S.mode === 'duo') return ['PLAYER 1', 'PLAYER 2'];
    if (S.mode === 'online') return NET.view.names || ['?', '?'];
    return ['YOU', rv().name];
  }

  // =================================================================================================
  // ONLINE · KING OF THE TABLE (up to 4). Room = the 4 earliest joiners; host = the earliest joiner runs the bout and sends snapshots.
  const NET = { N: null, open: false, st: 'menu', code: '', codeIn: '', status: '', peers: {}, ready: false, j: 0, msg: '', ping: null, tok: 0, seen: {}, q: [], wins: {}, bout: null, boutN: 0, brk: 0, snT: 0, view: {}, copied: false, hostLast: null };
  const netIsHost = () => !!NET.N && netHost() === NET.N.id;
  function netMembers() { if (!NET.N) return []; const all = [{ id: NET.N.id, j: NET.j, ready: NET.ready, me: true }, ...Object.entries(NET.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, MAX_ROOM); }
  function netHost() { const m = netMembers(); return m.length ? m[0].id : null; }   // the earliest joiner hosts, so a newcomer never takes over mid-bout
  const colOf = id => { const ids = netMembers().map(m => m.id).sort(), k = Math.max(0, ids.indexOf(id)); return NET_COLS[k % NET_COLS.length]; };
  const nameOf = id => !NET.N ? '?' : id === NET.N.id ? 'YOU' : colOf(id)[0];
  function netOpen() { NET.open = true; if (!NET.N) { NET.st = 'menu'; NET.msg = ''; } emit(true); }
  function netClose() { NET.open = false; if (!NET.N) { S.mode = S.mode === 'online' ? null : S.mode; if (S.phase === 'lobby') S.phase = 'menu'; } emit(true); }
  function netMake() { let c = ''; for (let i = 0; i < 4; i++) c += CODE_CH[Math.floor(Math.random() * CODE_CH.length)]; netJoin(c); }
  async function netJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { NET.msg = 'Type the 4-letter room code from your friend.'; emit(true); return; }
    netLeave(true); const tok = ++NET.tok; Object.assign(NET, { open: true, st: 'room', code, status: 'connecting', peers: {}, ready: true, j: Date.now(), msg: '', ping: null, seen: {}, q: [], wins: {}, bout: null, brk: 0, hostLast: null });
    S.mode = 'online'; S.phase = 'lobby'; S.sc = [0, 0]; S.result = null; emit(true);
    let mod = null; try { mod = await load(PATHS.net); } catch (e) {}
    const opts = { game: GAME, code, onJoin: id => netHello(id), onLeave: id => netGone(id), onMsg: (t, d, id) => netMsg(t, d, id), onStatus: s => { NET.status = s; emit(true); } };
    let N; try { N = mod && mod.connectDuel ? await mod.connectDuel(opts) : localDuel(opts); } catch (e) { N = localDuel(opts); }
    if (tok !== NET.tok) { try { N.leave(); } catch (e) {} return; }
    NET.N = N; if (!mod || !mod.connectDuel) NET.status = NET.status || 'local'; netHello(); emit(true);
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(NET.timer); NET.timer = setInterval(netTick, 1000);
  }
  function netLeave(quiet) {
    NET.tok++; clearInterval(NET.timer); if (NET.N) { try { NET.N.send('ev', { k: 'bye' }); NET.N.leave(); } catch (e) {} }
    NET.N = null; NET.peers = {}; NET.seen = {}; NET.bout = null; NET.st = 'menu'; NET.view = {};
    try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {}
    if (!quiet && S.mode === 'online') { S.mode = null; S.phase = 'menu'; if (R) R.cast(castFor()); } if (!quiet) emit(true);
  }
  function netHello(to) { if (!NET.N) return; NET.N.send('hi', { v: 1, j: NET.j, ready: NET.ready }, to); }
  function netMsg(t, d, id) {
    if (!NET.N || !d) return; const now = performance.now(), known = !!NET.seen[id];
    if (t === 'hi') { NET.seen[id] = now; NET.peers[id] = { ...(NET.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready }; if (!known) setTimeout(() => netHello(id), 0); emit(true); return; }
    if (!known) return; NET.seen[id] = now;
    if (t === 'pg') { if (d.t != null) NET.N.send('pg', { e: d.t }, id); else if (d.e != null) NET.ping = Math.max(1, Math.round(now - d.e)); return; }
    if (t === 'sn') { if (id === netHost()) netApply(d); return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { if (NET.peers[id]) NET.peers[id].ready = !!d.on; emit(true); }
    else if (d.k === 'tap') { if (netIsHost() && NET.bout && d.b === NET.bout.id) { const side = id === NET.bout.A ? 0 : id === NET.bout.B ? 1 : -1; if (side >= 0) applyTap(side, false); } }
    else if (d.k === 'cheer') { S.cheer = 1.2; if (R) R.hop(); sfx.cheer(); flash(nameOf(id) + ' CHEERS', colOf(id)[1]); }
    else if (d.k === 'bye') netGone(id);
  }
  function netGone(id) {
    if (!NET.seen[id] && !NET.peers[id]) return; delete NET.seen[id]; delete NET.peers[id];
    if (netIsHost() && NET.bout && (id === NET.bout.A || id === NET.bout.B) && (S.phase === 'pull' || S.phase === 'count' || S.phase === 'roundEnd')) { const w = id === NET.bout.A ? 1 : 0; S.sc[w] = 2; netBoutEnd(w, 'FORFEIT'); }
    emit(true);
  }
  function netTick() { if (!NET.N) return; NET.N.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(NET.seen)) if (now - NET.seen[id] > 25000) netGone(id);
    // a new host picks up the line where the old one left it
    const h = netHost(); if (h !== NET.hostLast) { NET.hostLast = h; if (netIsHost() && NET.view.q) { NET.q = NET.view.q.slice(); NET.wins = { ...(NET.view.w || {}) }; if (S.phase !== 'lobby') { NET.bout = null; S.phase = 'break'; NET.brk = 2.5; } } } }
  function netReady() { NET.ready = !NET.ready; if (NET.N) NET.N.send('ev', { k: 'ready', on: NET.ready }); emit(true); }
  function netTap() {
    const me = NET.N && NET.N.id, b = NET.bout || NET.view; if (!me || !b || (me !== b.A && me !== b.B)) return;
    if (S.phase !== 'pull') { if (S.phase === 'count') flash('WAIT FOR GRIP!', '#cfcac4'); return; }
    sfx.tap(); buzz(8); S.taps.push(S.t); S.myTapFx = (S.myTapFx || 0) + 1;
    if (netIsHost()) applyTap(me === NET.bout.A ? 0 : 1, false); else NET.N.send('ev', { k: 'tap', b: b.id });
  }
  function netCheer() { if (!NET.N) return; NET.N.send('ev', { k: 'cheer' }); S.cheer = 1.2; if (R) R.hop(); sfx.cheer(); }
  // host only
  function netHostTick(dt) {
    if (!netIsHost()) return; const m = netMembers(), ready = m.filter(x => x.ready).map(x => x.id);
    if (NET.bout) { NET.q = NET.q.filter(id => ready.includes(id) || id === NET.bout.A || id === NET.bout.B); ready.forEach(id => { if (!NET.q.includes(id)) NET.q.push(id); }); }
    if (!NET.bout && (S.phase === 'lobby' || S.phase === 'break')) {
      if (S.phase === 'break') { NET.brk -= dt; if (NET.brk > 0) { netSnap(dt); return; } }
      NET.q = NET.q.filter(id => ready.includes(id)); ready.forEach(id => { if (!NET.q.includes(id)) NET.q.push(id); });
      if (NET.q.length >= 2) { NET.bout = { id: ++NET.boutN + Math.floor(Math.random() * 1e6) * 10, A: NET.q[0], B: NET.q[1] }; S.sc = [0, 0]; S.round = 1; S.result = null; resetRound(); }
      else if (S.phase === 'break') S.phase = 'lobby';
    }
    netSnap(dt, !!NET.bout && S.phase === 'count' && S.cd > 3.1);
  }
  function netRoundEnd() {}
  function netNextRound() { if (!netIsHost()) return; if (S.sc[0] >= 2 || S.sc[1] >= 2) netBoutEnd(S.sc[0] >= 2 ? 0 : 1); else { S.round++; resetRound(); } }
  function netBoutEnd(w, why) {
    const b = NET.bout; if (!b) return; const win = w === 0 ? b.A : b.B, lose = w === 0 ? b.B : b.A;
    NET.wins[win] = (NET.wins[win] || 0) + 1; NET.q = [win, ...NET.q.filter(id => id !== win && id !== lose), lose];
    NET.lastWin = { id: win, why: why || '' }; NET.bout = null; S.phase = 'break'; NET.brk = 4; netSnap(0, true);
  }
  function netBreak(dt) { /* timing runs in netHostTick */ }
  function netSnap(dt, force) {
    NET.snT -= dt; if (!force && NET.snT > 0) return; NET.snT = 1 / 15; if (!NET.N) return;
    const b = NET.bout, d = { b: b ? b.id : 0, A: b ? b.A : null, B: b ? b.B : null, ph: S.phase, a: +S.a.toFixed(3), st: S.st.map(v => +v.toFixed(2)), cd: +S.cd.toFixed(2), tl: +S.tl.toFixed(1), sc: S.sc, rd: S.round,
      q: NET.q, w: NET.wins, lw: NET.lastWin || null, brk: +NET.brk.toFixed(1), fl: S.flash ? { t: S.flash.txt, c: S.flash.col, g: S.flash.big, n: S.flash.id } : null, sv: S.surge ? 1 : 0, ch: +S.cheer.toFixed(2) };
    NET.view = { ...d, id: d.b }; NET.N.send('sn', d); viewNames();
  }
  function netApply(d) {
    const was = NET.view.b, prevPh = S.phase; NET.view = { ...d, id: d.b }; NET.q = d.q || []; NET.wins = d.w || {};
    S.phase = d.ph; S.a = d.a; S.st = d.st; S.cd = d.cd; S.tl = d.tl; S.sc = d.sc; S.round = d.rd; S.cheer = Math.max(S.cheer, d.ch || 0);
    if (d.fl && (!S.flash || S.flash.rid !== d.fl.n)) { S.flash = { txt: d.fl.t, col: d.fl.c, big: d.fl.g, id: ++S.flashN, rid: d.fl.n }; S.flashT = d.fl.g ? 1.6 : 1.1; if (/PINNED|TIME/.test(d.fl.t)) { sfx.pin(); S.shake = 0.9; } else if (d.fl.t === 'GRIP!') sfx.go(); }
    if (prevPh !== d.ph && d.ph === 'roundEnd') S.winner = d.a > 0 ? 0 : 1;
    viewNames(); emit();
  }
  function viewNames() { const v = NET.view; if (!v.A) { NET.view.names = ['?', '?']; return; } NET.view.names = [nameOf(v.A), nameOf(v.B)]; }

  // perspective: whoever you are, your side is drawn near you
  function persp() {
    if (S.mode !== 'online') return { flip: false };
    const v = NET.view, me = NET.N && NET.N.id; return { flip: !!(v.B && me === v.B), me, A: v.A, B: v.B, wrestling: !!me && (me === v.A || me === v.B) };
  }

  // ---------- the cast for the two seats ----------
  function castFor() {
    if (S.mode === 'online') { const P = persp(), v = NET.view; if (!v.A) return { near: { kind: 'player' }, far: { kind: 'empty' } };
      const ids = P.flip ? [v.B, v.A] : [v.A, v.B]; return { near: { kind: 'tint', col: colOf(ids[0])[1], key: ids[0] }, far: { kind: 'tint', col: colOf(ids[1])[1], key: ids[1] } }; }
    if (S.mode === 'duo') return { near: { kind: 'player' }, far: { kind: 'tint', col: '#38bdf8', key: 'p2', look: { fur: '#f59e0b' } } };
    const r = RIVALS[S.mode === 'solo' ? S.rival : sel]; return { near: { kind: 'player' }, far: r.cast ? { kind: r.cast } : { kind: 'rival', r } };
  }

  // ---------- main loop ----------
  let raf = 0, tPrev = performance.now();
  function frame(now) {
    if (dead) return; raf = requestAnimationFrame(frame); const dt = Math.min(0.1, (now - tPrev) / 1000); tPrev = now;
    if (S.mode === 'online') netHostTick(dt);
    const n = dt > 0.034 ? 2 : 1; for (let i = 0; i < n; i++) step(dt / n);
    if (S.mode === 'online' && R && NET.view.b !== R._b) { R._b = NET.view.b; R.cast(castFor()); }
    const v = view(); (R || R2) && (R || R2).draw(v, dt);
    if (now - lastEmit > 50) emit();
  }
  function view() {
    const P = persp(), f = P.flip;
    return { phase: S.phase, mode: S.mode, a: f ? -S.a : S.a, st: f ? [S.st[1], S.st[0]] : S.st, strain: f ? [S.p[1], S.p[0]] : S.p, shake: S.shake, cheer: S.cheer,
      winner: S.winner < 0 ? -1 : (f ? 1 - S.winner : S.winner), t: S.t, surge: S.surge ? S.surge.k : 0 };
  }

  // ---------- what the page draws ----------
  function hud() {
    const P = persp(), f = P.flip, rival = rv(), lad = ladder(), nm = sideNames(), names = f ? [nm[1], nm[0]] : nm;
    const sc = f ? [S.sc[1], S.sc[0]] : S.sc, st = f ? [S.st[1], S.st[0]] : S.st, a = f ? -S.a : S.a;
    const cols = S.mode === 'online' && NET.view.A ? (f ? [colOf(NET.view.B)[1], colOf(NET.view.A)[1]] : [colOf(NET.view.A)[1], colOf(NET.view.B)[1]]) : S.mode === 'duo' ? ['#f2741f', '#38bdf8'] : ['#f2741f', '#ec3013'];
    const m = netMembers(), host = netHost();
    return {
      phase: S.phase, mode: S.mode, world: W.name, sign: W.sign, embed, three: !!R, a, st, sc, round: S.round, tl: Math.max(0, Math.ceil(S.tl)), names, cols,
      cd: S.phase === 'count' ? Math.max(1, Math.ceil(S.cd - 0.2)) : 0, flash: S.flash, surge: S.surge && S.mode === 'solo' ? { id: S.surge.id, k: S.surge.k, hot: S.surge.k >= 1 - TUNE.win / TUNE.ring } : null,
      tps: S.taps.length, tapN: S.tapN || 0,
      demo: D.on ? { cap: D.cap, sub: D.sub, key: D.key, n: D.n + ' / ' + DEMO_STEPS.length, w: Math.round(D.n / DEMO_STEPS.length * 100) + '%', tapN: D.tapN, stage: D.stage } : null, rival: { name: rival.name, title: rival.title, hi: rival.hi, idx: S.rival }, ladder: lad, gold: save.data ? save.data.gold : 0,
      rivals: RIVALS.map((r, i) => ({ name: r.name, title: r.title, i, locked: i > lad, beaten: i < lad, sel: i === sel, gold: r.gold })), sel,
      result: S.result, canTap: S.mode !== 'online' || !!P.wrestling, spectating: S.mode === 'online' && !P.wrestling,
      net: { open: NET.open, on: !!NET.N, st: NET.st, code: NET.code, status: NET.status, msg: NET.msg, ping: NET.ping, ready: NET.ready, copied: NET.copied, host: host && NET.N && host === NET.N.id,
        full: !!NET.N && !m.some(x => x.me), rows: m.map(x => ({ id: x.id, me: x.me, name: (x.me ? 'YOU' : colOf(x.id)[0]), col: colOf(x.id)[1], ready: !!x.ready, host: x.id === host, wins: NET.wins[x.id] || 0, inLine: NET.q.indexOf(x.id) })),
        queue: NET.q.map((id, k) => ({ name: nameOf(id), col: colOf(id)[1], k, wins: NET.wins[id] || 0, me: NET.N && id === NET.N.id })), brk: NET.view.brk || NET.brk || 0,
        lastWin: NET.view.lw ? { name: nameOf(NET.view.lw.id), why: NET.view.lw.why } : null, myLine: NET.N ? NET.q.indexOf(NET.N.id) : -1, count: m.length },
    };
  }
  function emit() { lastEmit = performance.now(); try { onState(hud()); } catch (e) {}
    if (R && R.board) { const lad = ladder(); R.board(RIVALS.map((r, i) => ({ t: i < lad ? r.name + '  ✓' : i === lad ? r.name + '  ←' : '? ? ?', c: i < lad ? '#86efac' : i === lad ? '#ffd23a' : '#8a847e' }))); } }

  // ---------- renderers: a 2D one right away (never a black screen), the 3D room when it loads ----------
  R2 = inWorld ? null : flatRenderer(container, W);
  (async () => {
    try {
      const THREE = await load(PATHS.three); if (dead) return;
      let fk = null, castData = null, chair = null;
      try { fk = await load(PATHS.fox); } catch (e) { console.warn('[armWrestle] fox-kit did not load', e); }
      try { castData = (await load(PATHS.cast)).CAST; } catch (e) {}
      try { chair = await load(PATHS.chair); } catch (e) {}
      if (dead) return;
      R = await room3D({ THREE, fk, castData, chair, container, W, touch, rr, pick, clamp, smooth, damp, inWorld });
      if (dead) { R.destroy(); return; }
      R.cast(castFor()); if (R2) R2.destroy(); R2 = null; emit(true);
    } catch (e) { console.warn('[armWrestle] 3D room did not load, staying in 2D', e); }
  })();
  raf = requestAnimationFrame(frame);
  const onRs = () => { (R || R2) && (R || R2).resize(); }; addEventListener('resize', onRs);
  emit(true);
  { const rm = typeof location !== 'undefined' && /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) netJoin(rm[1]); else if (typeof location !== 'undefined' && /[?&]demo=1/.test(location.search)) setTimeout(demoStart, 600); }

  return {
    get camera() { return R && R.wcam ? R.wcam : null; }, get ready() { return !!R; },
    hud, tap, demoStart, demoStop: () => demoStop(true),
    play: () => startMatch('solo', Math.min(sel, ladder())),
    pickRival: i => { if (i <= ladder()) { sel = i; if (R && S.phase === 'menu') R.cast(castFor()); emit(true); } },
    quick: i => startMatch('solo', i), duo: () => startMatch('duo'), rematch: () => startMatch(S.mode === 'duo' ? 'duo' : 'solo', S.rival),
    next: () => startMatch('solo', sel), menu: toMenu, quit: () => { if (S.mode === 'online') netLeave(); toMenu(); },
    netOpen, netClose, netMake, netJoin, netLeave: () => netLeave(), netReady, netCheer,
    netShare: async (phone) => { if (!NET.code) return; let u; try { u = new URL(location.href); u.searchParams.set('room', NET.code); } catch (e) { return; }
      try { if (navigator.share && phone) await navigator.share({ title: '8 GATES · Arm Wrestling', text: 'Arm wrestle me in 8 GATES. Room ' + NET.code, url: u.href }); else { await navigator.clipboard.writeText(u.href); NET.copied = true; emit(true); setTimeout(() => { NET.copied = false; emit(true); }, 2000); } } catch (e) {} },
    setSafe: (top, bottom, left, right) => R && R.setSafe(top, bottom, left, right),
    destroy() { dead = true; cancelAnimationFrame(raf); removeEventListener('resize', onRs); netLeave(true); R && R.destroy(); R2 && R2.destroy(); try { AC && AC.close(); } catch (e) {} },
    _S: S, _tune: TUNE, _R: () => R,
  };
}

// =====================================================================================================
// 2D stand-in: draws the table and the two arms while the 3D room loads (or if it can't)
function flatRenderer(container, W) {
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none'; container.appendChild(cv);
  const g = cv.getContext('2d'); let w = 1, h = 1;
  function resize() { const dpr = Math.min(2, window.devicePixelRatio || 1); w = container.clientWidth || 1; h = container.clientHeight || 1; cv.width = w * dpr; cv.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); }
  resize();
  return {
    resize,
    draw(v) {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, W.wall2); gr.addColorStop(1, W.bg); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const cx = w / 2, ty = h * 0.58, s = Math.min(w, h) * 0.32;
      g.fillStyle = W.table; g.fillRect(cx - s * 1.5, ty, s * 3, s * 0.22); g.fillStyle = '#000'; g.fillRect(cx - s * 1.5, ty + s * 0.22, s * 3, 4);
      const th = v.a * Math.PI / 2 * 0.92, px = cx + Math.sin(th) * s, py = ty - Math.cos(th) * s;
      g.lineCap = 'round'; g.lineWidth = s * 0.16; g.strokeStyle = '#1a1626';
      g.beginPath(); g.moveTo(cx - s * 1.1, ty - s * 1.1); g.lineTo(cx, ty); g.lineTo(px, py); g.stroke();
      g.lineWidth = s * 0.12; g.strokeStyle = '#f2741f'; g.beginPath(); g.moveTo(cx - s * 1.1, ty - s * 1.1); g.lineTo(px, py); g.stroke();
      g.strokeStyle = '#ec3013'; g.beginPath(); g.moveTo(cx + s * 1.1, ty - s * 1.1); g.lineTo(px, py); g.stroke();
      g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(px, py, s * 0.1, 0, 7); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.5)'; g.font = '800 12px Archivo, sans-serif'; g.fillText('LOADING THE ROOM…', 14, h - 14);
    },
    destroy() { cv.remove(); },
  };
}

// =====================================================================================================
// 3D: the room, two seats, the crowd. buildRoom is exported so a world can put the table in its own interior.
export function buildRoom({ THREE, scene, toon, M, W, canvasTex }) {
  const g = new THREE.Group(); scene.add(g);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(9, 9), toon(W.floor)); floor.rotation.x = -Math.PI / 2; g.add(floor);
  for (let i = -4; i <= 4; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.005, 9), toon(W.wall2)); b.position.set(i * 0.5, 0.003, 0); g.add(b); }
  const wallM = toon(W.wall), wall2 = toon(W.wall2), trim = toon(W.trim);
  // walls are one-sided planes facing in, so a camera pulled back past them still sees the table
  const plane = (w, h, mat, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; g.add(m); return m; };
  plane(9, 4, wallM, 3.4, 2, 0, -Math.PI / 2); plane(9, 0.9, wall2, 3.38, 0.45, 0, -Math.PI / 2); plane(9, 4, wallM, -3.6, 2, 0, Math.PI / 2);
  [-1, 1].forEach(s => { plane(9, 4, wallM, 0, 2, s * 3.6, s > 0 ? Math.PI : 0); plane(9, 0.9, wall2, 0, 0.45, s * 3.58, s > 0 ? Math.PI : 0); });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(9, 0.06, 0.24), trim); rail.position.set(0, 0.92, -3.56); g.add(rail);
  // the chalk ladder + sign on the back wall
  const board = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.3), new THREE.MeshBasicMaterial({ map: canvasTex(512, 352, () => {}) })); board.position.set(-1.5, 2.05, -3.49); g.add(board);
  const frame = new THREE.Mesh(new THREE.BoxGeometry(2.02, 1.42, 0.06), toon('#3a2616')); frame.position.set(-1.5, 2.05, -3.52); g.add(frame);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.5), new THREE.MeshBasicMaterial({ map: canvasTex(768, 160, c => { c.fillStyle = '#141210'; c.fillRect(0, 0, 768, 160); c.strokeStyle = W.trim; c.lineWidth = 10; c.strokeRect(8, 8, 752, 144); c.fillStyle = W.trim; c.font = '900 76px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(W.sign, 384, 84); }) }));
  sign.position.set(0.7, 3.1, -3.49); g.add(sign);
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), new THREE.MeshBasicMaterial({ map: canvasTex(256, 352, c => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, 256, 352); c.fillStyle = '#000'; c.fillRect(14, 14, 228, 324); c.fillStyle = '#ffd23a'; c.font = '900 34px Archivo, Arial'; c.fillText('ARM', 28, 70); c.fillText('WRES-', 28, 110); c.fillText('TLING', 28, 150); c.fillStyle = '#fff'; c.font = '800 20px Archivo, Arial'; c.fillText('BEST OF 3', 28, 210); c.fillText('WINNER', 28, 250); c.fillText('STAYS ON', 28, 278); c.fillStyle = '#ec3013'; c.font = '900 64px Archivo, Arial'; c.fillText('#54', 28, 330); }) }));
  poster.position.set(2.3, 1.9, -3.49); g.add(poster);
  // barrels + crates for a back-room feel
  [[2.9, -2.9], [3.0, -2.2], [-3.0, -2.8]].forEach(([x, z], i) => { const b = M(new THREE.CylinderGeometry(0.32, 0.28, 0.85, 14), toon(i === 1 ? '#7a5230' : '#8a5e36'), x, 0.425, z, g, 0.02, 0.32); M(new THREE.TorusGeometry(0.31, 0.02, 5, 18), toon('#3a3836'), 0, 0.22, 0, b, 0).rotation.x = Math.PI / 2; });
  M(new THREE.BoxGeometry(0.6, 0.5, 0.6), toon('#a8743e'), -2.9, 0.25, -2.0, g, 0.02);
  // the table
  const top = toon(W.table), T = 0.95;
  M(new THREE.BoxGeometry(1.5, 0.09, 1.25), top, 0, T - 0.045, 0, g, 0.02);
  [[-0.62, -0.48], [0.62, -0.48], [-0.62, 0.48], [0.62, 0.48]].forEach(([x, z]) => M(new THREE.BoxGeometry(0.1, T - 0.09, 0.1), top, x, (T - 0.09) / 2, z, g, 0.015));
  const GZ = 0.36, pads = [-1, 1].map(s => { const p = M(new THREE.BoxGeometry(0.22, 0.03, 0.34), toon('#2a2826'), s * 0.46, T + 0.015, GZ, g, 0.008); return p; });
  const padGlow = pads.map(p => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.035, 0.3), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0 })); m.position.copy(p.position); m.position.y += 0.004; g.add(m); return m; });
  const elbow = M(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 20), toon('#3a3836'), 0, T + 0.01, GZ, g, 0.006, 0.16);
  [-1, 1].forEach(s => { const peg = M(new THREE.CylinderGeometry(0.035, 0.035, 0.22, 10), trim, 0.3 * s, T + 0.11, -0.2, g, 0.008, 0.035); peg.userData.k = 1; });
  // the lamp
  const lampY = 3.25; M(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 6), toon('#1a1626'), 0, lampY + 0.6, 0, g, 0);
  const shade = M(new THREE.ConeGeometry(0.34, 0.26, 18, 1, true), toon('#2f5d2a', { side: THREE.DoubleSide }), 0, lampY, 0, g, 0.015, 0.34);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 8), new THREE.MeshBasicMaterial({ color: W.lamp })); bulb.position.set(0, lampY - 0.1, 0); g.add(bulb);
  return { group: g, T, board, pads, padGlow, elbow, shade };
}

async function room3D({ THREE, fk, castData, chair, container, W, touch, rr, pick, clamp, smooth, damp, inWorld = null }) {
  const WD = inWorld, wel = WD && WD.renderer.domElement, CW = () => (wel || container).clientWidth || 1, CH = () => (wel || container).clientHeight || 1;
  let renderer; if (WD) renderer = WD.renderer; else { renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, touch ? 1.6 : 2)); renderer.setSize(CW(), CH());
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.domElement.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement); }
  let scene; if (WD) { scene = new THREE.Group(); scene.name = 'armWrestleWorld'; WD.parent.add(scene); } else { scene = new THREE.Scene(); scene.background = new THREE.Color(W.bg); scene.fog = new THREE.Fog(W.bg, 7, 14); }
  const camera = new THREE.PerspectiveCamera(48, CW() / CH(), 0.05, 40), wcam = WD ? new THREE.PerspectiveCamera(48, 1, 0.05, 200) : null, _wq = new THREE.Quaternion();
  // toon look (the same recipe as engine/restaurant-kit.js createStage)
  const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
  const cache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(Object.keys(extra)) + String(extra.side || '') : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide }), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c }; return t; };
  const crestTex = (letter, ring = '#38bdf8', fg = '#ffffff', bg = '#0b1430') => canvasTex(128, 128, c => { c.fillStyle = ring; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.fillStyle = bg; c.beginPath(); c.arc(64, 64, 50, 0, 7); c.fill(); c.fillStyle = fg; c.font = '900 72px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(letter, 64, 70); });

  scene.add(new THREE.HemisphereLight(0xfff2e0, 0x5a4034, 1.05));
  const key = new THREE.DirectionalLight(0xfff0d8, 1.25); key.position.set(-2, 6, 3); scene.add(key);
  const lamp = new THREE.PointLight(new THREE.Color(W.lamp), 2.2, 6, 1.6); lamp.position.set(0, 2.9, 0); scene.add(lamp);

  const ROOM = buildRoom({ THREE, scene, toon, M, W, canvasTex }), T = ROOM.T;
  // the chalk ladder
  function drawBoard(lines) { const t = ROOM.board.material.map, c = t.userData.c.getContext('2d'); c.fillStyle = '#23312b'; c.fillRect(0, 0, 512, 352); c.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 40; i++) c.fillRect(Math.random() * 512, Math.random() * 352, rr(20, 80), 2);
    c.fillStyle = '#f3f2f2'; c.font = '900 34px Archivo, Arial'; c.fillText('THE LADDER', 24, 48); c.fillStyle = '#ffd23a'; c.fillRect(24, 60, 200, 4);
    lines.forEach((l, i) => { c.fillStyle = l.c; c.font = '800 28px Archivo, Arial'; c.fillText((i + 1) + '. ' + l.t, 24, 104 + i * 50); }); t.needsUpdate = true; }

  // foxes
  let kit = null;
  if (fk && fk.foxKit) { try { kit = fk.foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }); } catch (e) { console.warn('[armWrestle] foxKit failed', e); kit = null; } }
  const CAST = castData || (fk ? { player: { key: 'player', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', look: fk.PLAYER_MALE, outfit: 'armor', eyes: ['#38bdf8', '#38bdf8'], mood: 'determined' },
    hope: { key: 'hope', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', bow: true, glasses: 'sun', legColor: '#38bdf8', outfit: 'armor', look: fk.HOPE_LOOK, eyes: ['#f472b6', '#2dd4bf'], mood: 'happy' },
    noble: { key: 'noble', torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', chair: true, legColor: '#38bdf8', outfit: 'armor', look: fk.PLAYER_MALE, eyes: ['#dc2626', '#dc2626'], mood: 'determined' } } : null);
  let chairK = null; if (chair && chair.chairKit) { try { chairK = chair.chairKit({ THREE, M, toon }); } catch (e) {} }
  let chairCfg = null; if (chair && chair.loadChair) chair.loadChair(document.baseURI).then(c => chairCfg = c).catch(() => {});
  const blobMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.28, depthWrite: false });
  function blobShadow(parent, r = 0.45) { const b = new THREE.Mesh(new THREE.CircleGeometry(r, 20), blobMat); b.rotation.x = -Math.PI / 2; b.position.y = 0.01; parent.add(b); return b; }
  // a simple stand-in fox (if fox-kit could not load)
  function plainFox(col) { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const P = { body };
    M(new THREE.CapsuleGeometry(0.28, 0.6, 4, 10), toon(col), 0, 1.0, 0, body, 0.025); P.head = new THREE.Group(); P.head.position.set(0, 1.62, 0); body.add(P.head); M(new THREE.SphereGeometry(0.3, 16, 12), toon('#f2741f'), 0, 0, 0, P.head, 0.03, 0.3); M(new THREE.ConeGeometry(0.12, 0.3, 10), toon('#f9a96a'), 0, -0.05, 0.3, P.head, 0.02).rotation.x = Math.PI / 2;
    [-1, 1].forEach(s => M(new THREE.ConeGeometry(0.1, 0.24, 4), toon('#1e293b'), s * 0.17, 0.3, 0, P.head, 0.02));
    P.arms = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.36, 1.37, 0); body.add(p); M(new THREE.CapsuleGeometry(0.075, 0.42, 4, 8), toon('#e2e8f0'), 0, -0.28, 0, p, 0.02); M(new THREE.SphereGeometry(0.09, 10, 8), toon('#f2741f'), 0, -0.56, 0, p, 0.015, 0.09); return p; });
    g.userData = { P, mood: 'determined', plain: true }; scene.add(g); return g; }
  function makeSeat(spec) {
    if (!spec || spec.kind === 'empty') return null;
    let f = null, extra = null;
    if (kit && CAST) {
      if (spec.kind === 'player') f = kit.makeFox({ ...CAST.player, gear: 'none' });
      else if (spec.kind === 'hope') { f = kit.makeFox({ ...CAST.hope, gear: 'none' }); extra = 'cane'; }   // she leans her cane on the table to wrestle
      else if (spec.kind === 'noble') { f = kit.makeFox({ ...CAST.noble, gear: 'none' }); if (chairK) try { f.userData.rig = chairK.attach(f, chairCfg || chair.CHAIR_DEFAULTS); } catch (e) {} }
      else if (spec.kind === 'rival') { const r = spec.r.fox; f = kit.makeFox({ key: spec.r.id, torso: r.torso, outfit: r.outfit, look: { ...fk.PLAYER_MALE, ...r.look }, eyes: r.eyes || ['#1e293b', '#1e293b'], mood: r.mood || 'determined' }); }
      else if (spec.kind === 'tint') f = kit.makeFox({ key: spec.key, torso: ['#ffffff', '#e7edf4', '#6b7d93'], crest: '8', outfit: 'armor', look: { ...fk.PLAYER_MALE, armorAccent: spec.col, ...(spec.look || {}) }, eyes: [spec.col, spec.col], mood: 'determined' });
    } else f = plainFox(spec.col || (spec.kind === 'player' ? '#e7edf4' : '#ec3013'));
    blobShadow(f);
    // measure the arm at rest: shoulder height + reach
    f.updateMatrixWorld(true); const arm = f.userData.P.arms[spec.arm ?? 1], box = new THREE.Box3().setFromObject(arm), sh = V3(); arm.getWorldPosition(sh);
    const ps = V3(); arm.parent.getWorldScale(ps); f.userData.reach = Math.max(0.35, sh.y - box.min.y - 0.04); f.userData.armBaseScale = arm.scale.clone(); f.userData.armLen0 = f.userData.reach / ps.y / arm.scale.y;
    if (extra === 'cane') { const cn = new THREE.Group(); M(new THREE.CylinderGeometry(0.014, 0.014, 1.25, 6), toon('#f8fafc'), 0, 0.62, 0, cn, 0.006); M(new THREE.CylinderGeometry(0.016, 0.016, 0.16, 6), toon('#dc2626'), 0, 0.06, 0, cn, 0.006); M(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), toon('#1e293b'), 0, 1.2, 0, cn, 0.006); cn.rotation.z = 0.2; f.userData.cane = cn; scene.add(cn); }
    return f;
  }
  // seat 0 = left on screen (x < 0, faces +x) · seat 1 = right (x > 0, faces -x). The camera watches from the side (+z), so
  // both wrestle with the arm nearest the camera (seat 0 its left, seat 1 its right) and the grip tips toward whoever is losing.
  const seats = [null, null], seatKey = ['', ''], ARM_OF = [0, 1], GZ = 0.36;
  const knot = M(new THREE.SphereGeometry(0.085, 14, 10), toon('#f2741f'), 0, T + 0.5, GZ, scene, 0.018, 0.085);
  function placeSeat(i) { const f = seats[i]; if (!f) return; const s = i === 0 ? -1 : 1; f.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2;
    // solve x so the shoulder sits one reach (a little under) from the upright grip
    const P = f.userData.P; P.body.rotation.x = 0.2; let x = s * 0.9; const sh = V3(), grip = V3(0, T + 0.48, GZ);
    for (let k = 0; k < 6; k++) { f.position.set(x, 0, 0); f.updateMatrixWorld(true); P.arms[ARM_OF[i]].getWorldPosition(sh); const flat = Math.hypot(sh.z - grip.z, sh.y - grip.y), want = f.userData.reach * 0.86, need = Math.sqrt(Math.max(0.01, want * want - flat * flat)); const cur = Math.abs(sh.x); x += s * (need - cur); x = s * clamp(Math.abs(x), 0.98, 1.4); }
    f.userData.baseX = x; f.position.set(x, 0, 0);
    if (f.userData.cane) f.userData.cane.position.set(x * 0.62, 0, -0.68); }
  function setCast(c) {
    ['near', 'far'].forEach((k, i) => { const spec = c[k], key = spec ? spec.kind + ':' + (spec.key || (spec.r && spec.r.id) || '') + ':' + (spec.col || '') : '';
      if (key === seatKey[i]) return; seatKey[i] = key; if (seats[i]) { if (seats[i].userData.cane) scene.remove(seats[i].userData.cane); scene.remove(seats[i]); } seats[i] = makeSeat(spec && { ...spec, arm: ARM_OF[i] }); placeSeat(i); });
  }
  // crowd: watchers behind the far seat (fewer on phones)
  const crowd = []; const CROWD = touch ? [['#a78bfa', -1.7, -1.9], ['#22c55e', 1.8, -2.1]] : [['#a78bfa', -1.8, -1.8], ['#22c55e', 1.9, -2.0], ['#e6b45a', -0.3, -2.6], ['#38bdf8', 2.8, -1.1]];
  CROWD.forEach(([col, x, z], i) => { let f; if (kit && fk) f = kit.makeFox({ key: 'crowd' + i, torso: col, outfit: pick(['vest', 'tee', 'coat']), look: { ...fk.DEFAULT_LOOK, fur: pick(['#f2741f', '#c2410c', '#d9a066', '#8a8f99']) }, mood: 'excited' }); else f = plainFox(col);
    f.position.set(x, 0, z); f.lookAt(0, 0, 0); f.userData.lookAt = V3(0, T + 0.5, 0); blobShadow(f, 0.4); crowd.push(f); });

  // camera framing: fit the key points inside the free screen area (the page reports its panels)
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }, fitCam = new THREE.PerspectiveCamera(48, 1, 0.05, 40), _p = V3();
  function fit(pts, yaw, el, margin = 0.05) { const Wd = CW(), H = CH(); fitCam.aspect = Wd / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const yT = 1 - 2 * Math.min(SAFE.top, H * 0.3) / H - margin, yB = -1 + 2 * Math.min(SAFE.bottom, H * 0.5) / H + margin, xR = 1 - 2 * Math.min(SAFE.right, Wd * 0.45) / Wd - margin, xL = -1 + 2 * Math.min(SAFE.left, Wd * 0.5) / Wd + margin, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 4; for (let it = 0; it < 3; it++) { let lo = 0.6, hi = 16; for (let k = 0; k < 16; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, ((b.x0 + b.x1) / 2 - sx) * th * fitCam.aspect).addScaledVector(up, ((b.y0 + b.y1) / 2 - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt }; }
  const shots = new Map(); const shot = (k, fn) => { const ck = k + '|' + CW() + 'x' + CH() + '|' + SAFE.top + '|' + SAFE.bottom + '|' + SAFE.left + '|' + SAFE.right; if (!shots.has(ck)) { if (shots.size > 40) shots.clear(); shots.set(ck, fn()); } return shots.get(ck); };
  // key points: the rival's head, the grip's whole swing, both pads (the near fox may sit partly off-frame, bottom-left)
  const P_BOUT = () => [V3(-1.25, 2.7, 0), V3(1.25, 2.7, 0), V3(-1.1, 0.3, 0.2), V3(1.1, 0.3, 0.2), V3(0, T, 0.66)];
  const P_ROOM = () => [V3(-1.3, 2.7, 0), V3(1.3, 2.7, 0), V3(-1.2, 0.2, 0), V3(1.2, 0.2, 0), V3(0, T, 0.7), V3(0, 3.2, -3.4)];
  const CAMB = { yaw: Math.PI - 0.1, el: 0.22 };
  const camPos = V3(-3, 2.2, 0.6), camLook = V3(0, 1.3, 0); let orbit = 0;

  const tmpW = V3(), tmpL = V3(), DOWN = V3(0, -1, 0), qA = new THREE.Quaternion();
  // s477 ELBOW JOINT (Ben: "their arms need to wrestle properly"): the wrestling arm is now TWO bones. The fox-kit arm (one stick) hides;
  // an upper arm runs shoulder → elbow (planted on the elbow pad, a hand-width from the centre), a forearm runs elbow → the clasped grip,
  // with an elbow ball + a fist. Sleeve / paw colours come from the fox's own arm, so armour, coats and fur all match.
  // s477b MUSCLE (Ben: "thicker and muscular"): lathe-turned bones: a bulging bicep on the upper arm, a thick forearm swelling below the elbow, a deltoid cap on the shoulder
  const lathe = pts => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 16);
  const UPY = V3(0, 1, 0), upG = lathe([[0, -0.02], [0.92, 0], [1.12, 0.14], [1.38, 0.42], [1.3, 0.58], [1.04, 0.78], [0.84, 0.94], [0.8, 1], [0, 1.02]]), foG = lathe([[0, -0.02], [0.86, 0], [1.22, 0.18], [1.18, 0.34], [0.98, 0.58], [0.76, 0.86], [0.7, 1], [0, 1.02]]), segG = upG, ballG = new THREE.SphereGeometry(1, 14, 10), _s = V3(), _e = V3(), _g = V3(), _d = V3();
  function ikOf(f, ai) { const u = f.userData; if (u.ik && u.ik.ai === ai) return u.ik; const arm = u.P.arms[ai], mats = []; arm.traverse(o => { if (o.isMesh && o.material && o.material.side !== THREE.BackSide) mats.push(o.material); });
    const sleeve = mats[0] || toon('#e7edf4'), paw = mats[mats.length - 1] || toon('#f2741f'), g = new THREE.Group(); f.add(g);
    const up = M(upG, sleeve, 0, 0, 0, g, 0.012), fo = M(foG, sleeve, 0, 0, 0, g, 0.012), delt = M(ballG, sleeve, 0, 0, 0, g, 0.012, 1), el = M(ballG, sleeve, 0, 0, 0, g, 0.012, 1), fist = M(ballG, paw, 0, 0, 0, g, 0.012, 1), cuff = M(ballG, paw, 0, 0, 0, g, 0);
    u.ik = { ai, g, up, fo, el, fist, cuff, delt, arm }; return u.ik; }
  function bone(m, a, b, r) { _d.subVectors(b, a); const L = Math.max(0.001, _d.length()); m.position.copy(a); m.quaternion.setFromUnitVectors(UPY, _d.multiplyScalar(1 / L)); m.scale.set(r, L, r); }
  function aimArm(f, target, ai, side = 0) { const P = f.userData.P, arm = P.arms[ai], ik = ikOf(f, ai); f.updateMatrixWorld(true); arm.visible = false;
    arm.getWorldPosition(_s); const s = Math.sign(f.position.x) || (side || 1); _e.set(s * 0.075, T + 0.07, GZ); _g.copy(target); scene.updateMatrixWorld(); scene.localToWorld(_e); scene.localToWorld(_g);   /* s477 world mode: the grip + elbow are in the room group's space */
    // keep the hands at a forearm's length from the elbow (a real arm can't stretch): slide the grip along the elbow → grip line
    const fl = 0.5; _d.subVectors(_g, _e); if (_d.length() > fl) _g.copy(_e).addScaledVector(_d.normalize(), fl);
    f.worldToLocal(_s); f.worldToLocal(_e); f.worldToLocal(_g); const sc = 1 / (f.scale.x || 1);
    const flex = 1 + 0.12 * clamp(f.userData.strain || 0, 0, 1);   // the bicep swells as they strain
    bone(ik.up, _s, _e, 0.1 * sc); ik.up.scale.x *= flex; ik.up.scale.z *= flex; bone(ik.fo, _e, _g, 0.092 * sc); ik.el.position.copy(_e); ik.el.scale.setScalar(0.086 * sc); ik.fist.position.copy(_g); ik.fist.scale.setScalar(0.112 * sc);
    ik.delt.position.copy(_s); ik.delt.scale.setScalar(0.13 * sc); ik.cuff.position.lerpVectors(_e, _g, 0.9); ik.cuff.scale.setScalar(0.078 * sc); }
  function restArm(f) { const P = f.userData.P; P.arms[1].scale.copy(f.userData.armBaseScale); P.arms[1].visible = true; if (f.userData.ik) f.userData.ik.g.visible = false; }

  let lastBoard = '';
  return {
    cast(c) { setCast(c); },
    hop() { crowd.forEach(f => { f.userData.hop = 1; }); },
    wcam,
    resize() { if (!WD) renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); shots.clear(); },
    setSafe(t, b, l = 0, r = 0) { t = Math.round(t); b = Math.round(b); l = Math.round(l); r = Math.round(r); if (Math.abs(SAFE.top - t) + Math.abs(SAFE.bottom - b) + Math.abs(SAFE.left - l) + Math.abs(SAFE.right - r) > 4) Object.assign(SAFE, { top: t, bottom: b, left: l, right: r }); },
    draw(v, dt) {
      if (camera.aspect !== CW() / CH()) this.resize();
      const th = v.a * Math.PI / 2 * 0.9, gr = V3(0.5 * Math.sin(th), T + 0.05 + 0.5 * Math.cos(th), GZ);
      const live = v.phase === 'pull' || v.phase === 'count' || v.phase === 'roundEnd';
      const menu = v.phase === 'menu' || v.phase === 'lobby' || v.phase === 'break' || v.phase === 'done';
      knot.position.lerp(menu && v.phase !== 'done' ? V3(0, T + 0.49, GZ) : gr, menu ? 0.1 : 0.6);
      seats.forEach((f, i) => { if (!f) return; const u = f.userData, P = u.P; const s = i === 0 ? 1 : -1;
        if (kit && !u.plain) kit.animFox(f, dt, 0); else { P.head.rotation.y = Math.sin(v.t * 1.3 + i) * 0.1; }
        const str = clamp(v.strain[i] / 3, 0, 1), losing = (i === 0 ? -v.a : v.a), wonRound = v.phase === 'roundEnd' || v.phase === 'done' ? (v.winner === i) : null;
        u.mood = wonRound === true ? 'excited' : wonRound === false ? 'sad' : live ? (losing > 0.55 ? 'surprised' : str > 0.6 ? 'stern' : 'determined') : (i === 1 ? 'smug' : 'happy');
        const push = i === 0 ? v.a : -v.a; P.body.rotation.x = live ? 0.2 + str * 0.06 + push * 0.08 : 0.16; P.body.rotation.z = 0;
        const jit = live && v.phase === 'pull' ? str * 0.012 : 0; f.position.x = u.baseX + (Math.random() - 0.5) * jit; f.position.z = (Math.random() - 0.5) * jit;
        // half toward the rival, half toward the camera so faces read from the side
        const other = seats[1 - i]; u.lookAt = V3(other ? other.position.x * 0.55 : 0, 1.75, 1.6);
        u.strain = live ? str : 0; aimArm(f, knot.position, ARM_OF[i]);
        // the free arm braces on the table; a round winner throws it up
        const fa = P.arms[1 - ARM_OF[i]]; fa.rotation.set(-1.1, 0, (ARM_OF[i] === 0 ? 0.2 : -0.2));
        if (wonRound === true && v.phase !== 'pull') fa.rotation.set(-2.7, 0, ARM_OF[i] === 0 ? -0.3 : 0.3);
      });
      // pads glow as the hand nears them
      ROOM.padGlow[1].material.opacity = clamp((v.a - 0.55) / 0.45, 0, 1) * 0.85; ROOM.padGlow[0].material.opacity = clamp((-v.a - 0.55) / 0.45, 0, 1) * 0.85;
      // crowd
      crowd.forEach((f, i) => { if (kit && !f.userData.plain) { if (v.cheer > 0.3 && Math.random() < dt * 2.2) f.userData.hop = 1; kit.animFox(f, dt, 0); } });
      // camera: over the near shoulder in a bout, a slow orbit in the menu, swing to the side on a pin
      let target;
      if (menu && v.phase !== 'done') { orbit += dt * 0.25; const sh = shot('menu', () => fit(P_ROOM(), Math.PI - 0.3, 0.26, 0.06)); const off = sh.pos.clone().sub(sh.look).applyAxisAngle(V3(0, 1, 0), Math.sin(orbit) * 0.35); target = { pos: sh.look.clone().add(off), look: sh.look }; }
      else if (v.phase === 'done' || (v.phase === 'roundEnd' && v.winner >= 0)) target = shot('side', () => fit([V3(-1.25, 2.7, 0), V3(1.25, 2.7, 0), V3(-1.1, 0.9, 0.2), V3(1.1, 0.9, 0.2), V3(0, T, 0.6)], Math.PI + 0.12, 0.16, 0.06));
      else target = shot('bout', () => fit(P_BOUT(), CAMB.yaw, CAMB.el, 0.07));
      const k = 1 - Math.exp(-dt * (menu ? 2 : 4)); camPos.lerp(target.pos, k); camLook.lerp(target.look, k);
      camera.position.copy(camPos); if (v.shake > 0) camera.position.add(V3((Math.random() - 0.5) * v.shake * 0.05, (Math.random() - 0.5) * v.shake * 0.05, (Math.random() - 0.5) * v.shake * 0.05)); camera.lookAt(camLook);
      lamp.intensity = 2.2 + Math.sin(v.t * 9) * 0.04;
      if (WD) { scene.updateWorldMatrix(true, false); camera.updateMatrixWorld(); wcam.position.copy(camera.position); scene.localToWorld(wcam.position); scene.getWorldQuaternion(_wq); wcam.quaternion.copy(_wq).multiply(camera.quaternion); wcam.fov = camera.fov; wcam.aspect = camera.aspect; wcam.updateProjectionMatrix(); wcam.updateMatrixWorld(); } else renderer.render(scene, camera);
    },
    board(lines) { const k = JSON.stringify(lines); if (k === lastBoard) return; lastBoard = k; drawBoard(lines); },
    destroy() { if (WD) { if (scene.parent) scene.parent.remove(scene); return; } renderer.dispose(); renderer.domElement.remove(); scene.traverse(o => { if (o.geometry) o.geometry.dispose(); }); },
  };
}
