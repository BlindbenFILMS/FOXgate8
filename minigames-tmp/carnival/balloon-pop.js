// 8 GATES — CARNIVAL · BALLOON POP [carnivalBalloonPop]. Minigame #47 (Balloon-and-dart pop), a carnival stall that fits inside any building on any world.
// Ben stands at the counter of a striped booth; a cork board of balloons hangs at the back. DRAG to aim (the ring sits just above your finger and
// wobbles like a real arm, more the longer you hold), LET GO to throw. Gold = 50, the pink star = 100, black BLAST pops its neighbours,
// the pale ICE balloon stops the wobble, the white PLUS gives a dart (or time). Hits in a row: x2, then x3.
// MODES: CLASSIC (6 darts, 2 gold, win tickets) · BLITZ (45 s, the rows slide, balloons grow back) · PARTY (pass the phone, 2-5 players)
//        · ONLINE RACE (2-5 phones, peer to peer, one shared board, first dart to a balloon gets it; host decides) · DEMO.
// Tickets buy prizes off the shelf (items in the shared save). Assist (accessibility): aim magnet, a tone for every balloon under the ring, half wobble.
// MERGE: createBalloonPop({ container, onState, opts }) stands alone. buildBooth(ctx) builds just the stall (no room) from a Meru-style ctx
// ({ THREE, M, toon, scene, theme }) so a world can drop the booth into one of its own interiors.
// SELF-CONTAINED on purpose (parallel rules): only vendor/three, fox-kit.js, engine/cast.js, engine/save.js, engine/textures.js are imported.
// Small helpers that live in village-game.js / restaurant-kit.js are copied here. Online uses engine/duel-net.js when the repo has it, else a same-device tab test.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit } from '../../fox-kit.js?v=s673';
import { CAST, castKit, loadCastRigs } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { canvasTex, crestTex, FONT } from '../../engine/textures.js';

export const BALLOON_POP = { num: 47, name: 'BALLOON POP', room: 'carnivalBalloonPop', key: 'balloonPop' };
export const SAVE = { best: 'balloonPop.best', bestBlitz: 'balloonPop.bestBlitz', tickets: 'balloonPop.tickets', rounds: 'balloonPop.rounds', pops: 'balloonPop.pops', wins: 'balloonPop.wins', assist: 'balloonPop.assist', muted: 'balloonPop.muted', jackpots: 'balloonPop.jackpots' };
export const COST = 2;
export const MAX_PLAYERS = 5;
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PURPLE', '#a78bfa']];
export const BARKER = 'ZIGGY';   // DRAFT name for the stall barker
export const PRIZES = [   // DRAFT prices (tickets)
  { id: 'balloonPopPinwheel', name: 'PINWHEEL', cost: 8, line: 'Spins in the wind.' },
  { id: 'balloonPopBalloonSword', name: 'BALLOON SWORD', cost: 15, line: 'Squeaks on every swing.' },
  { id: 'balloonPopFoxPlush', name: 'FOX PLUSH', cost: 25, line: 'A little orange friend for your home.' },
  { id: 'balloonPopStarHat', name: 'STAR HAT', cost: 40, line: 'Pink, sparkly, very carnival.' },
  { id: 'balloonPopGateBear', name: 'GIANT GATE BEAR', cost: 60, line: 'Top shelf. Almost nobody wins it.' }];
export const ITEM_LABELS = Object.fromEntries(PRIZES.map(p => [p.id, p.name.charAt(0) + p.name.slice(1).toLowerCase()]));
export const MODES = {
  classic: { name: 'CLASSIC', darts: 6, time: 0, moving: false, cost: COST },
  blitz: { name: 'BLITZ', darts: 0, time: 45, moving: true, cost: COST, reload: 0.42 },
  party: { name: 'PARTY', darts: 6, time: 0, moving: false, cost: 0 },
  race: { name: 'ONLINE RACE', darts: 0, time: 45, moving: true, cost: 0, reload: 0.42 },
  demo: { name: 'DEMO', darts: 6, time: 0, moving: false, cost: 0 } };
export const TYPES = {
  red: { pts: 10, col: '#e3342f', r: 1 }, blue: { pts: 10, col: '#2f7de3', r: 1 }, green: { pts: 10, col: '#2fae4a', r: 1 }, orange: { pts: 10, col: '#f28a1a', r: 1 }, purple: { pts: 10, col: '#9b4fd6', r: 1 },
  gold: { pts: 50, col: '#ffc927', r: 0.8, label: 'GOLD', shape: 'coin' }, star: { pts: 100, col: '#ff5fb0', r: 0.64, label: 'JACKPOT', shape: 'star' },
  blast: { pts: 10, col: '#2a2630', r: 1, label: 'BLAST', shape: 'burst' }, ice: { pts: 10, col: '#bfefff', r: 1, label: 'STEADY', shape: 'flake' }, plus: { pts: 10, col: '#fbfbf7', r: 1, label: 'PLUS', shape: 'plus' } };
// a building's world picks the stall colours (?world=meru); anything unknown falls back to the carnival look
export const THEMES = {
  carnival: { a: '#d62839', b: '#fbf3e4', trim: '#ffd23a', wall: '#34264a', floor: '#8a5a3a', label: 'CARNIVAL' },
  meru: { a: '#c42d3c', b: '#f3ecdf', trim: '#e6b45a', wall: '#1d2450', floor: '#7a5236', label: 'MERU' },
  gaya: { a: '#2f8f5b', b: '#f2f0e1', trim: '#e6b45a', wall: '#24372c', floor: '#6f5638', label: 'GAYA' },
  jidda: { a: '#0e7fb8', b: '#f6f1e2', trim: '#ffd23a', wall: '#123a52', floor: '#a07a4e', label: 'JIDDA' },
  kufa: { a: '#c9772a', b: '#f7ecd6', trim: '#2f5d8a', wall: '#4a3020', floor: '#a8814f', label: 'KUFA' },
  luxor: { a: '#8a2be2', b: '#f3ecdf', trim: '#e6b45a', wall: '#241a3a', floor: '#5a4632', label: 'LUXOR' },
  nebo: { a: '#3f7d3a', b: '#efe6d2', trim: '#f28a1a', wall: '#2a2a1e', floor: '#6a4a2a', label: 'NEBO' },
  ur: { a: '#b8862e', b: '#f6eedb', trim: '#1e3a8a', wall: '#3a2a18', floor: '#9a7a52', label: 'UR' },
  zion: { a: '#a0522d', b: '#f4e9d4', trim: '#ffd23a', wall: '#3a2216', floor: '#7a5030', label: 'ZION' },
  home: { a: '#f2741f', b: '#fbf3e4', trim: '#38bdf8', wall: '#22304a', floor: '#8a5a3a', label: 'HOME' },
  earth: { a: '#1e5bd6', b: '#f3f2f2', trim: '#ec3013', wall: '#1d1f2a', floor: '#6a5a4a', label: 'EARTH' },
  station: { a: '#38bdf8', b: '#e6ecf4', trim: '#a78bfa', wall: '#0f1424', floor: '#3a4256', label: 'DEEP SPACE FOX' } };
const LINES = {   // DRAFT barker lines
  intro: ['Step right up! Pop a balloon, win a prize!', 'Six darts, two gold! Every pop wins tickets!', 'Gold pays fifty! The pink star pays a hundred!', 'Bring your friends! Up to five can play!'],
  start: ['Nice and easy. Aim, then let go.', 'Show me that throwing arm!', 'The ring wobbles. Do not wait too long!'],
  hit: ['POP! Nice one!', 'Right on the button!', 'The crowd likes that!', 'Pop goes the balloon!'],
  streak: ['You are on fire!', 'In a row! Bigger points!', 'Somebody stop this fox!'],
  miss: ['Whoosh! So close!', 'The cork says thank you.', 'Shake it off. Next dart!', 'Almost had it!'],
  gold: ['GOLD! Fifty points!', 'A gold one! Shiny!'], star: ['THE JACKPOT STAR! I cannot believe it!'],
  blast: ['KA-BOOM! Look at them go!'], ice: ['Steady hands! The wobble stops for a bit.'], plus: ['A free dart, on the house!'], plusT: ['Three more seconds on the clock!'],
  good: ['What a round! Pick a prize!', 'Best throwing I have seen all week!'], meh: ['Not bad, not bad at all!', 'Come back and try again!'], bad: ['The balloons win this time. Again?'] };

// ---------- small helpers (copies, so this file runs on its own) ----------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, pick = a => a[Math.floor(Math.random() * a.length)];
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hash = (...n) => { let h = 2166136261; for (const x of n) { h ^= x & 0xffffffff; h = Math.imul(h, 16777619); } return h >>> 0; };
function makeGradient() { const t = new THREE.DataTexture(new Uint8Array([70, 160, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function glowTexture() { return canvasTex(64, 64, g => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }); }

// ---------- board layout (the same on every phone, so online boards match) ----------
export const BOARD = { cols: 5, rows: 4, sx: 0.6, sy: 0.58, y: 2.05, z: -2.95, r: 0.2, w: 3.5, h: 2.86 };
const HIT_Z = BOARD.z + 0.28;
const rowOff = (r, t) => 0.3 * Math.sin(t * (0.62 + 0.21 * r) + r * 1.7) * (r % 2 ? 1 : -1);
export function slotXY(i, t, moving, out = { x: 0, y: 0 }) { const c = i % BOARD.cols, r = Math.floor(i / BOARD.cols); out.x = (c - (BOARD.cols - 1) / 2) * BOARD.sx + (moving ? rowOff(r, t) : 0); out.y = BOARD.y + ((BOARD.rows - 1) / 2 - r) * BOARD.sy + 0.022 * Math.sin(t * 1.7 + i * 0.9); return out; }
export function typeFor(seed, slot, gen, mode) {
  const R = rng(hash(seed, slot * 31 + 7, gen * 977 + 3)), a = R(), b = R();
  if (a < 0.035) return 'star'; if (a < 0.115) return 'gold'; if (a < 0.17) return 'blast'; if (a < 0.215) return 'ice'; if (a < (mode === 'classic' || mode === 'party' || mode === 'demo' ? 0.255 : 0.265)) return 'plus';
  return ['red', 'blue', 'green', 'orange', 'purple'][Math.floor(b * 5)];
}
const neighbours = i => { const c = i % BOARD.cols, r = Math.floor(i / BOARD.cols), o = []; if (c > 0) o.push(i - 1); if (c < BOARD.cols - 1) o.push(i + 1); if (r > 0) o.push(i - BOARD.cols); if (r < BOARD.rows - 1) o.push(i + BOARD.cols); return o; };

// ---------- sound: everything synthesised, no files ----------
class Sfx {
  constructor() { this.ctx = null; this.muted = false; this.music = false; }
  ensure() { if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {}); return this.ctx; }
    try { const C = window.AudioContext || window.webkitAudioContext; this.ctx = new C(); this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.8; this.master.connect(this.ctx.destination);
      const n = this.ctx.sampleRate, b = this.ctx.createBuffer(1, n, n), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.nb = b; } catch (e) { this.ctx = null; } return this.ctx; }
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.value = m ? 0 : 0.8; }
  tone(f, d, v = 0.15, type = 'triangle', when = 0, f2) { const c = this.ctx; if (!c || this.muted) return; const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + d + 0.05); }
  noise(d, v, f0, f1, q = 1, when = 0, type = 'bandpass') { const c = this.ctx; if (!c || this.muted || !this.nb) return; const t = c.currentTime + when, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.nb; s.loop = true; f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05); }
  pop(k = 1) { this.noise(0.13, 0.7 * k, 3200, 500, 0.7); this.tone(220, 0.07, 0.25 * k, 'sine', 0, 90); }
  whoosh() { this.noise(0.22, 0.12, 500, 2600, 1.4); }
  thunk() { this.tone(130, 0.09, 0.3, 'sine', 0, 70); this.noise(0.05, 0.15, 900, 300, 1.2); }
  ding(n = 3) { [0, 4, 7, 12, 16].slice(0, n).forEach((s, i) => this.tone(660 * Math.pow(2, s / 12), 0.25, 0.12, 'triangle', i * 0.07)); }
  boom() { this.noise(0.5, 0.6, 900, 60, 0.6, 0, 'lowpass'); this.tone(90, 0.35, 0.3, 'sine', 0, 40); }
  blip(up = true) { this.tone(up ? 520 : 400, 0.08, 0.1, 'square', 0, up ? 900 : 220); }
  hover(i) { this.tone(440 * Math.pow(2, i / 12), 0.06, 0.05, 'sine'); }
  tick() { this.tone(1200, 0.03, 0.05, 'square'); }
  cheer() { this.noise(1.1, 0.12, 700, 1400, 0.4); for (let i = 0; i < 6; i++) this.noise(0.08, 0.06, 2400, 1800, 3, 0.1 + i * 0.14); }
  // a little original calliope waltz (C · C · G7 · G7 · C · F · G7 · C), oom-pah-pah
  startMusic() { if (this.music || !this.ctx) return; this.music = true; const c = this.ctx, BEAT = 60 / 152, mel = [[76, 79, 84], [83, 79, 76], [77, 79, 74], [71, 74, 77], [76, 79, 84], [81, 77, 72], [74, 77, 71], [72, 0, 0]], bass = [48, 48, 43, 43, 48, 41, 43, 48], chd = [[64, 67], [64, 67], [65, 71], [65, 71], [64, 67], [65, 69], [65, 71], [64, 67]];
    let next = c.currentTime + 0.1, step = 0; const mf = m => 440 * Math.pow(2, (m - 69) / 12);
    this.mTimer = setInterval(() => { if (!this.ctx) return; while (next < c.currentTime + 0.35) { const bar = Math.floor(step / 3) % 8, beat = step % 3, w = next - c.currentTime;
      if (!this.muted) { const m = mel[bar][beat]; if (m) { this.tone(mf(m), BEAT * 0.9, 0.045, 'triangle', w); this.tone(mf(m + 12), BEAT * 0.5, 0.012, 'sine', w); }
        if (beat === 0) this.tone(mf(bass[bar]), BEAT * 0.8, 0.06, 'triangle', w); else chd[bar].forEach(n => this.tone(mf(n), BEAT * 0.35, 0.018, 'square', w)); }
      next += BEAT; step++; } }, 90); }
  stopMusic() { this.music = false; clearInterval(this.mTimer); }
  close() { this.stopMusic(); try { this.ctx && this.ctx.close(); } catch (e) {} this.ctx = null; }
}

// ---------- online: engine/duel-net.js when present, else a same-device test over BroadcastChannel (two tabs) ----------
function localDuel({ game, code, onJoin, onLeave, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10); let bc;
  try { bc = new BroadcastChannel('8g-' + game + '-' + code); } catch (e) { setTimeout(() => onStatus && onStatus('offline'), 0); return { id, send() {}, leave() {} }; }
  const post = m => { try { bc.postMessage({ ...m, from: id }); } catch (e) {} };
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return; if (m.sys === 'join') { onJoin && onJoin(m.from); post({ sys: 'here', to: m.from }); } else if (m.sys === 'here') onJoin && onJoin(m.from); else if (m.sys === 'leave') onLeave && onLeave(m.from); else onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => { onStatus && onStatus('local'); post({ sys: 'join' }); }, 0);
  return { id, local: true, send(t, d, to) { post({ t, d, to }); }, leave() { post({ sys: 'leave' }); try { bc.close(); } catch (e) {} } };
}

// ---------- the stall (no room around it) ----------
export function buildBooth(ctx) {
  const { M, toon, scene, theme: T = THEMES.carnival } = ctx, G = new THREE.Group(); scene.add(G); const B = BOARD;
  const stripes = (a, b, n, w = 256, h = 64) => canvasTex(w, h, (g) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * w / n, 0, w / n + 1, h); } });
  const plank = (base) => canvasTex(256, 256, g => { g.fillStyle = base; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(0,0,0,${0.06 + (i % 3) * 0.04})`; g.fillRect(0, i * 32, 256, 2); g.fillStyle = `rgba(255,255,255,${0.03 + (i % 2) * 0.03})`; g.fillRect(0, i * 32 + 2, 256, 10); for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect((i * 97 + k * 83) % 256, i * 32, 2, 32); } } }, [2, 2]);
  const mat = (tex, extra) => new THREE.MeshToonMaterial({ map: tex, gradientMap: ctx.grad, ...extra });
  // counter (front, on the player's side)
  const ctr = M(new THREE.BoxGeometry(4.2, 0.95, 0.55), mat(stripes(T.a, T.b, 14, 512, 64)), 0, 0.475, 0.28, G, 0.02); ctr.material.map.repeat.set(1, 1);
  M(new THREE.BoxGeometry(4.4, 0.08, 0.7), toon('#c89a62'), 0, 0.99, 0.28, G, 0.015);
  // posts + roof frame
  const postM = toon(T.trim); for (const x of [-2.15, 2.15]) for (const z of [0.55, -3.15]) M(new THREE.CylinderGeometry(0.07, 0.08, 3.6, 10), postM, x, 1.8, z, G, 0.015, 0.08);
  // side walls (lower panels) + back wall of the stall
  const sideTex = stripes(T.b, T.a, 10, 256, 64); for (const x of [-2.15, 2.15]) { const w = M(new THREE.BoxGeometry(0.06, 1.2, 3.7), mat(sideTex), x, 0.6, -1.3, G, 0.01); w.material.map.repeat.set(1, 1); }
  M(new THREE.BoxGeometry(4.3, 3.6, 0.08), mat(stripes(T.a, T.b, 16, 512, 64)), 0, 1.8, -3.2, G, 0);
  // cork board + wood frame
  const cork = canvasTex(256, 256, g => { g.fillStyle = '#b98a55'; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 1600; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(90,55,25,0.35)' : 'rgba(240,200,140,0.3)'; g.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2); } }, [2, 2]);
  M(new THREE.BoxGeometry(B.w, B.h, 0.08), mat(cork), 0, B.y, B.z - 0.04, G, 0);
  const fr = toon('#6b3f1f'); M(new THREE.BoxGeometry(B.w + 0.24, 0.14, 0.14), fr, 0, B.y + B.h / 2 + 0.05, B.z, G, 0.015); M(new THREE.BoxGeometry(B.w + 0.24, 0.14, 0.14), fr, 0, B.y - B.h / 2 - 0.05, B.z, G, 0.015);
  for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.14, B.h + 0.24, 0.14), fr, s * (B.w / 2 + 0.05), B.y, B.z, G, 0.015);
  // pins where each balloon is tied
  const pinG = new THREE.SphereGeometry(0.022, 6, 4), pinM = toon('#d7dde3'); for (let i = 0; i < B.cols * B.rows; i++) { const p = slotXY(i, 0, false); const m = new THREE.Mesh(pinG, pinM); m.position.set(p.x, p.y - B.r * 1.25 - 0.2, B.z + 0.01); G.add(m); }
  // sign above the board
  const sign = canvasTex(1024, 256, g => { g.fillStyle = '#1a1220'; g.fillRect(0, 0, 1024, 256); g.strokeStyle = T.trim; g.lineWidth = 14; g.strokeRect(10, 10, 1004, 236);
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `italic 900 132px ${FONT}`; g.lineJoin = 'round'; g.lineWidth = 22; g.strokeStyle = '#000'; g.strokeText('BALLOON POP', 512, 132); const gr = g.createLinearGradient(0, 70, 0, 190); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.5, T.trim); gr.addColorStop(1, '#ff8a1a'); g.fillStyle = gr; g.fillText('BALLOON POP', 512, 128);
    g.fillStyle = '#ffffff'; for (let i = 0; i < 24; i++) { const x = 30 + i * 42; g.beginPath(); g.arc(x, 26, 7, 0, 7); g.fill(); g.beginPath(); g.arc(x, 230, 7, 0, 7); g.fill(); } });
  const signM = M(new THREE.PlaneGeometry(2.7, 0.66), new THREE.MeshBasicMaterial({ map: sign }), 0, B.y + B.h / 2 + 0.5, B.z + 0.02, G, 0);
  // price card on the board frame
  const price = canvasTex(256, 96, g => { g.fillStyle = '#fbf3e4'; g.fillRect(0, 0, 256, 96); g.strokeStyle = T.a; g.lineWidth = 8; g.strokeRect(4, 4, 248, 88); g.fillStyle = '#201e1d'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `900 34px ${FONT}`; g.fillText('6 DARTS · ' + COST + 'g', 128, 36); g.font = `800 22px ${FONT}`; g.fillStyle = T.a; g.fillText('EVERY POP WINS', 128, 70); });
  M(new THREE.PlaneGeometry(0.8, 0.3), new THREE.MeshBasicMaterial({ map: price }), -1.45, 0.62, 0.56, G, 0);
  // awning: striped valance with scallops across the front, a sloped roof behind it
  const val = canvasTex(1024, 160, g => { const n = 16, w = 1024 / n; for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? T.b : T.a; g.fillRect(i * w, 0, w + 1, 100); g.beginPath(); g.arc(i * w + w / 2, 100, w / 2, 0, Math.PI); g.fill(); } g.fillStyle = T.trim; g.fillRect(0, 0, 1024, 12); });
  const valM = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.72), new THREE.MeshToonMaterial({ map: val, gradientMap: ctx.grad, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); valM.position.set(0, 3.42, 0.62); G.add(valM);
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.9), new THREE.MeshToonMaterial({ map: stripes(T.a, T.b, 16, 512, 64), gradientMap: ctx.grad, side: THREE.DoubleSide })); roof.rotation.x = -Math.PI / 2 + 0.12; roof.position.set(0, 3.55, -1.3); G.add(roof);
  // prize shelves on both inside walls
  const shelfM = toon('#c89a62'), shelves = []; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const y = 1.35 + k * 0.62; M(new THREE.BoxGeometry(0.36, 0.05, 2.0), shelfM, s * 1.95, y, -1.7, G, 0.01); shelves.push({ x: s * 1.88, y: y + 0.03, s, k }); }
  const plush = [];
  shelves.forEach((sh, si) => { for (let j = 0; j < 3; j++) { const z = -2.4 + j * 0.7, kind = (si + j) % 4, g = new THREE.Group(); g.position.set(sh.x, sh.y, z); g.rotation.y = -sh.s * 1.2; G.add(g);
    if (kind === 0) { const c = toon('#f2741f'); M(new THREE.SphereGeometry(0.13, 12, 10), c, 0, 0.13, 0, g, 0.01, 0.13); M(new THREE.SphereGeometry(0.1, 12, 10), c, 0, 0.32, 0, g, 0.01, 0.1); for (const e of [-1, 1]) M(new THREE.ConeGeometry(0.04, 0.09, 6), toon('#1e293b'), e * 0.06, 0.44, 0, g, 0.006); M(new THREE.SphereGeometry(0.05, 8, 6), toon('#ffffff'), 0, 0.29, 0.08, g, 0); }
    else if (kind === 1) { const c = toon(['#a78bfa', '#38bdf8', '#f472b6'][si % 3]); M(new THREE.SphereGeometry(0.14, 12, 10), c, 0, 0.14, 0, g, 0.01, 0.14); M(new THREE.SphereGeometry(0.1, 12, 10), c, 0, 0.34, 0, g, 0.01, 0.1); for (const e of [-1, 1]) M(new THREE.SphereGeometry(0.04, 8, 6), c, e * 0.08, 0.43, 0, g, 0.006, 0.04); }
    else if (kind === 2) { const st = new THREE.Shape(); for (let q = 0; q < 10; q++) { const a = q / 10 * Math.PI * 2 + Math.PI / 2, r = q % 2 ? 0.07 : 0.16; q ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const m = M(new THREE.ExtrudeGeometry(st, { depth: 0.06, bevelEnabled: false }), toon('#ffd23a'), 0, 0.2, -0.03, g, 0.01); m.rotation.y = 0; }
    else { M(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), toon('#e7edf4'), 0, 0.2, 0, g, 0); const b = M(new THREE.SphereGeometry(0.12, 10, 8), toon(['#e3342f', '#2fae4a', '#9b4fd6'][si % 3]), 0, 0.46, 0, g, 0.008, 0.12); b.scale.y = 1.15; }
    plush.push(g); } });
  // string lights: along the valance and around the sign (one draw call)
  const bulbPts = []; for (let i = 0; i <= 22; i++) bulbPts.push([-2.25 + i * 4.5 / 22, 3.8 - 0.1 * Math.sin(i / 22 * Math.PI * 4) ** 2, 0.64]);
  for (let i = 0; i <= 14; i++) bulbPts.push([-1.4 + i * 2.8 / 14, B.y + B.h / 2 + 0.88, B.z + 0.05]);
  const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), bulbPts.length); const mtx = new THREE.Matrix4(), col = new THREE.Color();
  bulbPts.forEach((p, i) => { mtx.makeTranslation(p[0], p[1], p[2]); bulbs.setMatrixAt(i, mtx); bulbs.setColorAt(i, col.set(['#ffd23a', '#ff6b6b', '#7dd3fc', '#86efac'][i % 4])); }); bulbs.instanceColor.needsUpdate = true; G.add(bulbs);
  return { group: G, bulbs, bulbPts, plush, sign: signM, theme: T };
}

// ---------- the minigame ----------
export async function createBalloonPop({ container, onState = () => {}, opts = {} }) {
  const params = new URLSearchParams(location.search), worldKey = (opts.world || params.get('world') || 'carnival').toLowerCase(), theme = THEMES[worldKey] || THEMES.carnival;
  // WORLD MODE (s102, Ben: Arena Path games in world): opts.inWorld = { renderer, camera, parent } plays at Meru's own booth (parent = the booth group,
  // same local frame as buildBooth): no own renderer / room / lights / booth (they go to a throw-away scene LS), the balloons, darts, Ben, the barker
  // and fans live in a group under parent; the camera is mirrored to world (wcam) and never uses a view offset (it shifts instead).
  const WD = opts.inWorld || null, wel = WD && WD.renderer.domElement;
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => (wel || container).clientWidth || 1, CH = () => (wel || container).clientHeight || 1;
  let renderer; if (WD) renderer = WD.renderer; else { renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;-webkit-tap-highlight-color:transparent'; container.appendChild(renderer.domElement); }
  const LS = new THREE.Scene(); let scene = LS; if (WD) { scene = new THREE.Group(); scene.name = 'festWorld'; WD.parent.add(scene); } else { scene.background = new THREE.Color(theme.wall).multiplyScalar(0.55); scene.fog = new THREE.Fog(scene.background, 12, 26); }
  const camera = new THREE.PerspectiveCamera(46, CW() / CH(), 0.05, 60); LS.add(camera); const wcam = WD ? new THREE.PerspectiveCamera(50, 1, 0.02, 400) : null, _wq = new THREE.Quaternion();
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, m, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); me.castShadow = me.receiveShadow = !touch; if (outline) addOutline(me, outline, radius); (parent || scene).add(me); return me; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }), sfx = new Sfx();
  sfx.setMuted(!!save.stat(SAVE.muted, 0));

  // lights
  LS.add(new THREE.HemisphereLight(0xfff2e0, 0x5a4060, 1.25)); const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(2.5, 7, 6); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); LS.add(sun);
  const fill = new THREE.PointLight(0xffd8a0, 6, 9, 1.6); fill.position.set(0, 3.1, -1.2); LS.add(fill);

  // room shell (the building this stall sits in) unless a world brings its own
  if (opts.shell !== false && !WD) {
    const floorT = canvasTex(256, 256, g => { g.fillStyle = theme.floor; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(0,0,0,${0.08 + (i % 3) * 0.05})`; g.fillRect(i * 32, 0, 2, 256); for (let k = 0; k < 2; k++) { g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(i * 32, (i * 71 + k * 131) % 256, 32, 2); } } }, [6, 8]);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 20), new THREE.MeshToonMaterial({ map: floorT, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0, 3); fl.receiveShadow = !touch; scene.add(fl);
    const wallT = canvasTex(256, 256, g => { g.fillStyle = theme.wall; g.fillRect(0, 0, 256, 256); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 8; i++) g.fillRect(i * 32, 0, 14, 256); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 200, 256, 56); }, [4, 1]);
    const wm = new THREE.MeshToonMaterial({ map: wallT, gradientMap: grad }); const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 5), wm); back.position.set(0, 2.5, -3.7); scene.add(back);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(20, 5), wm); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 6.5, 2.5, 3); scene.add(w); }
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(14, 20), new THREE.MeshBasicMaterial({ color: new THREE.Color(theme.wall).multiplyScalar(0.4) })); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 5, 3); scene.add(ceil);
    // bunting across the ceiling (one draw call)
    const flags = new THREE.InstancedMesh(new THREE.ConeGeometry(0.13, 0.3, 3).rotateX(Math.PI), new THREE.MeshBasicMaterial({ color: 0xffffff }), 54), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), cl = new THREE.Color();
    for (let i = 0; i < 54; i++) { const line = Math.floor(i / 18), k = i % 18, x = -6 + k * 12 / 17, z = -1 + line * 2.6; m4.compose(V3(x, 4.55 - 0.35 * Math.sin(k / 17 * Math.PI), z), q.setFromEuler(new THREE.Euler(0, 0.3, 0)), V3(1, 1, 0.3)); flags.setMatrixAt(i, m4); flags.setColorAt(i, cl.set([theme.a, theme.trim, '#38bdf8', '#22c55e', theme.b][(k + line) % 5])); }
    flags.instanceColor.needsUpdate = true; scene.add(flags);
  }
  const K = buildBooth({ THREE, M, toon, scene: WD ? LS : scene, grad, theme });   /* world: Meru's booth is already standing there */

  // ---------- cast: Ben at the counter (over the shoulder), the barker, Hope + Noble cheering (wide screens) ----------
  const ben = kit.makeFox({ ...CAST.player, gear: 'none', mood: 'determined' }); const BP = ben.userData.P; if (BP.sword) BP.sword.visible = false; if (BP.gun) BP.gun.visible = false; scene.add(ben);
  ben.updateMatrixWorld(true); const headY = BP.head.getWorldPosition(V3()).y;
  const barker = kit.makeFox({ look: { ...CAST.player.look, fur: '#b8642a', furDark: '#7a3a12', tailMid: '#c9772a' }, torso: [theme.a, theme.b, '#2a1018'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy', eyes: ['#22c55e', '#22c55e'] });
  { const P = barker.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; const hs = P.head.scale.x || 1, hat = new THREE.Group(); hat.position.set(0, 0.36 * hs, 0.02); P.head.add(hat);
    M(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 20), toon('#f2d38a'), 0, 0, 0, hat, 0.01, 0.3); M(new THREE.CylinderGeometry(0.17, 0.18, 0.16, 18), toon('#f2d38a'), 0, 0.09, 0, hat, 0.01, 0.18); M(new THREE.CylinderGeometry(0.182, 0.182, 0.05, 18), toon(theme.a), 0, 0.05, 0, hat, 0); }
  scene.add(barker); barker.position.set(-1.85, 0, -0.45); barker.rotation.y = 0.6;
  const fans = []; try { const rigs = await loadCastRigs(); const CK = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs); const hope = CK.make('hope'), noble = CK.make('noble');
    [hope, noble].forEach((f, i) => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.position.set(2.7 + i * 0.8, 0, -2.75 + i * 0.55); f.rotation.y = -0.55 - i * 0.15; f.userData.mood = 'happy'; scene.add(f); fans.push(f); }); } catch (e) { console.warn('balloon pop: cast rigs', e); }

  // ---------- balloons ----------
  const bGeo = (() => { const g = new THREE.SphereGeometry(1, 16, 12), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = y < 0 ? 1 + y * 0.3 : 1; p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); p.setY(i, y < 0 ? y * 1.14 : y); } g.computeVertexNormals(); return g; })();
  const knotG = new THREE.ConeGeometry(0.06, 0.09, 8), strG = new THREE.CylinderGeometry(0.006, 0.006, 0.22, 4), shineG = new THREE.CircleGeometry(1, 12), shineM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, depthWrite: false }), strM = toon('#f3f2f2');
  const bMat = {}; for (const [k, t] of Object.entries(TYPES)) bMat[k] = toon(t.col, k === 'gold' ? { emissive: new THREE.Color('#7a5a00'), emissiveIntensity: 0.6 } : k === 'star' ? { emissive: new THREE.Color('#5a0a30'), emissiveIntensity: 0.5 } : undefined);
  const decal = {}; const drawShape = (g, s) => { g.translate(64, 64); g.lineJoin = 'round';
    if (s === 'plus') { g.fillStyle = '#ec3013'; g.fillRect(-14, -44, 28, 88); g.fillRect(-44, -14, 88, 28); }
    else if (s === 'star' || s === 'burst') { const n = s === 'star' ? 5 : 10, r1 = s === 'star' ? 50 : 52, r2 = s === 'star' ? 21 : 30; g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, r = i % 2 ? r2 : r1; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fillStyle = s === 'star' ? '#ffffff' : '#ffd23a'; g.fill(); if (s === 'burst') { g.fillStyle = '#ec3013'; g.beginPath(); g.arc(0, 0, 16, 0, 7); g.fill(); } }
    else if (s === 'flake') { g.strokeStyle = '#0e7fb8'; g.lineWidth = 9; g.lineCap = 'round'; for (let i = 0; i < 3; i++) { g.save(); g.rotate(i * Math.PI / 3); g.beginPath(); g.moveTo(0, -46); g.lineTo(0, 46); for (const y of [-28, 28]) { g.moveTo(0, y); g.lineTo(y > 0 ? 12 : -12, y + (y > 0 ? 12 : -12)); g.moveTo(0, y); g.lineTo(y > 0 ? -12 : 12, y + (y > 0 ? 12 : -12)); } g.stroke(); g.restore(); } }
    else if (s === 'coin') { g.fillStyle = '#7a4a00'; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('50', 0, 4); } };
  for (const [k, t] of Object.entries(TYPES)) if (t.shape) decal[k] = new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, g => drawShape(g, t.shape)), transparent: true, depthWrite: false });
  const decalG = new THREE.PlaneGeometry(1, 1);
  const NS = BOARD.cols * BOARD.rows, slots = [];
  for (let i = 0; i < NS; i++) { const g = new THREE.Group(); scene.add(g);
    const body = new THREE.Mesh(bGeo, bMat.red); body.castShadow = !touch; const ol = new THREE.Mesh(bGeo, outlineMat); ol.scale.setScalar(1.075); body.add(ol); g.add(body);
    const knot = new THREE.Mesh(knotG, bMat.red); knot.rotation.x = Math.PI; g.add(knot); const str = new THREE.Mesh(strG, strM); g.add(str);
    const sh = new THREE.Mesh(shineG, shineM); g.add(sh); const dc = new THREE.Mesh(decalG, decal.plus); dc.renderOrder = 3; g.add(dc);
    slots.push({ i, g, body, knot, str, sh, dc, type: 'red', gen: 0, alive: false, popT: -9, regrowAt: 0, grow: 0, hover: 0, wob: 0 }); }
  function dressSlot(s) { const T = TYPES[s.type], r = BOARD.r * T.r; s.body.material = bMat[s.type]; s.knot.material = bMat[s.type]; s.body.scale.set(r, r * 1.1, r * 0.92);
    s.knot.position.set(0, -r * 1.27, 0); s.knot.scale.setScalar(r / BOARD.r); s.str.position.set(0, -r * 1.27 - 0.13, -0.02); s.sh.scale.set(r * 0.22, r * 0.34, 1); s.sh.position.set(-r * 0.42, r * 0.38, r * 0.86); s.sh.rotation.z = 0.5;
    s.dc.visible = !!decal[s.type]; if (decal[s.type]) { s.dc.material = decal[s.type]; s.dc.scale.setScalar(r * 1.05); s.dc.position.set(0, 0.0, r * 0.95); } }

  // ---------- darts (pooled) ----------
  const shaftG = new THREE.CylinderGeometry(0.009, 0.009, 0.2, 6).rotateX(Math.PI / 2), barrelG = new THREE.CylinderGeometry(0.016, 0.013, 0.08, 8).rotateX(Math.PI / 2), tipG = new THREE.ConeGeometry(0.008, 0.07, 6).rotateX(-Math.PI / 2), flightG = new THREE.PlaneGeometry(0.075, 0.07);
  const metal = toon('#c9ced6'), flightMats = NET_COLS.map(([, c]) => new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }));
  const darts = []; for (let i = 0; i < 20; i++) { const g = new THREE.Group(); const sh = new THREE.Mesh(shaftG, toon('#f3f2f2')); sh.position.z = 0.1; g.add(sh); const ba = new THREE.Mesh(barrelG, metal); ba.position.z = -0.02; g.add(ba); const tp = new THREE.Mesh(tipG, metal); tp.position.z = -0.09; g.add(tp);
    const f1 = new THREE.Mesh(flightG, flightMats[0]); f1.position.z = 0.19; f1.rotation.y = Math.PI / 2; const f2 = f1.clone(); f2.rotation.set(0, Math.PI / 2, Math.PI / 2); g.add(f1, f2); g.visible = false; scene.add(g); darts.push({ g, f1, f2, on: false, fly: false, t: 0, from: V3(), to: V3(), dur: 0.36, owner: null, stuckAt: 0, onLand: null }); }
  let dartSeq = 0; const held = darts[darts.length - 1];   // the dart in Ben's paw
  function dartColor(d, slot) { const m = flightMats[clamp(slot | 0, 0, 4)]; d.f1.material = m; d.f2.material = m; }
  function freeDart() { let best = null; for (let i = 0; i < darts.length - 1; i++) { const d = darts[i]; if (!d.on) return d; if (!d.fly && (!best || d.stuckAt < best.stuckAt)) best = d; } return best || darts[0]; }
  function launch(from, to, slot, onLand) { const d = freeDart(); d.on = true; d.fly = true; d.t = 0; d.dur = 0.34 + from.distanceTo(to) * 0.012; d.from.copy(from); d.to.copy(to); d.onLand = onLand; dartColor(d, slot); d.g.visible = true; d.g.scale.setScalar(1); d.g.position.copy(from); return d; }
  const _a = V3(), _b = V3();
  function updDart(d, dt) { if (!d.on || !d.fly) return; d.t += dt / d.dur; const u = Math.min(1, d.t), h = 0.32 * 4 * u * (1 - u); _a.lerpVectors(d.from, d.to, u); _a.y += h; const u2 = Math.min(1, u + 0.04); _b.lerpVectors(d.from, d.to, u2); _b.y += 0.32 * 4 * u2 * (1 - u2); d.g.position.copy(_a); if (u < 1) d.g.lookAt(_a.x * 2 - _b.x, _a.y * 2 - _b.y, _a.z * 2 - _b.z);   // the tip is -z, so face +z backwards along the path d.g.rotateZ(dt * 9);
    if (u >= 1) { d.fly = false; d.stuckAt = ++dartSeq; d.g.position.set(d.to.x, d.to.y, BOARD.z + 0.08); d.g.rotation.set(rr(-0.15, 0.05), rr(-0.12, 0.12), rr(0, 6)); const f = d.onLand; d.onLand = null; f && f(); } }
  function clearDarts() { darts.forEach(d => { if (d !== held) { d.on = false; d.fly = false; d.g.visible = false; } }); }

  // ---------- confetti + score popups ----------
  const NC = 180, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.06, 0.035), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), NC); conf.frustumCulled = false; scene.add(conf);
  const cp = Array.from({ length: NC }, () => ({ p: V3(), v: V3(), r: V3(), w: V3(), life: 0 })), m4 = new THREE.Matrix4(), q4 = new THREE.Quaternion(), e4 = new THREE.Euler(), ccol = new THREE.Color(), zero = new THREE.Matrix4().makeScale(0, 0, 0); let ci = 0;
  for (let i = 0; i < NC; i++) { conf.setMatrixAt(i, zero); conf.setColorAt(i, ccol.set('#fff')); }
  function burst(x, y, z, colr, n = 16, power = 1) { for (let k = 0; k < n; k++) { const c = cp[ci = (ci + 1) % NC]; c.p.set(x, y, z); c.v.set(rr(-1.6, 1.6) * power, rr(-0.4, 2.2) * power, rr(0.2, 1.8) * power); c.r.set(rr(0, 6), rr(0, 6), rr(0, 6)); c.w.set(rr(-12, 12), rr(-12, 12), rr(-12, 12)); c.life = rr(0.7, 1.3); conf.setColorAt(ci, ccol.set(k % 4 === 0 ? '#ffffff' : k % 5 === 1 ? '#ffd23a' : colr)); } conf.instanceColor.needsUpdate = true; }
  function updConf(dt) { let any = false; for (let i = 0; i < NC; i++) { const c = cp[i]; if (c.life <= 0) continue; any = true; c.life -= dt; c.v.y -= 5.5 * dt; c.v.multiplyScalar(1 - 1.8 * dt); c.p.addScaledVector(c.v, dt); c.r.addScaledVector(c.w, dt); const s = c.life > 0 ? Math.min(1, c.life * 3) : 0; m4.compose(c.p, q4.setFromEuler(e4.set(c.r.x, c.r.y, c.r.z)), _a.set(s, s, s)); conf.setMatrixAt(i, m4); } if (any) conf.instanceMatrix.needsUpdate = true; }
  const pops = Array.from({ length: 6 }, () => { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 96; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.renderOrder = 40; s.scale.set(0.8, 0.3, 1); s.visible = false; scene.add(s); return { s, cv, tx, life: 0 }; }); let pi = 0;
  function popText(x, y, txt, col = '#ffd23a') { const p = pops[pi = (pi + 1) % pops.length], g = p.cv.getContext('2d'); g.clearRect(0, 0, 256, 96); g.font = `900 ${txt.length > 6 ? 46 : 60}px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#000'; g.strokeText(txt, 128, 50); g.fillStyle = col; g.fillText(txt, 128, 50); p.tx.needsUpdate = true; p.s.position.set(x, y, HIT_Z + 0.2); p.life = 1; p.s.visible = true; }

  // ---------- reticle ----------
  const ret = new THREE.Group(); { const rm = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true }), om = new THREE.MeshBasicMaterial({ color: 0x000000, depthTest: false, transparent: true, opacity: 0.6 });
    const add = (geo, m, x = 0, y = 0, o = 31) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, 0); me.renderOrder = o; ret.add(me); return me; };
    add(new THREE.RingGeometry(0.085, 0.13, 32), om, 0, 0, 30); ret.userData.ring = add(new THREE.RingGeometry(0.095, 0.118, 32), rm); add(new THREE.CircleGeometry(0.018, 10), rm);
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2, t = add(new THREE.PlaneGeometry(0.018, 0.06), rm, Math.cos(a) * 0.15, Math.sin(a) * 0.15); t.rotation.z = a + Math.PI / 2; }
    ret.userData.mat = rm; ret.visible = false; scene.add(ret); }

  // ---------- camera fit (keeps the whole board inside the free screen area) ----------
  const SAFE = { top: 0, bottom: 0, left: 0 }; let lastLayout = '';
  const fwd = V3(0, 0, -1);
  const at = (nx, ny, depth, out) => { const v = V3(nx, ny, 0.5).unproject(camera).sub(camera.position).normalize(); return out.copy(camera.position).addScaledVector(v, depth / v.dot(fwd)); };
  function layout(force) { const W = CW(), H = CH(), key = W + 'x' + H + '|' + SAFE.top + '|' + SAFE.bottom + '|' + SAFE.left; if (!force && key === lastLayout) return; lastLayout = key;
    if (!WD) renderer.setSize(W, H); camera.aspect = W / H; const port = H > W; camera.fov = WD ? WD.camera.fov : port ? 50 : 44; const t = Math.tan(camera.fov * Math.PI / 360);
    const aw = Math.max(W * 0.35, W - SAFE.left), ah = Math.max(H * 0.3, H - SAFE.top - SAFE.bottom), hw = BOARD.w / 2 + (port ? 0.12 : 0.3), hh = BOARD.h / 2 + 0.6;
    const d = Math.max(hh / (t * ah / H), hw / (t * aw / H)); camera.position.set(0, BOARD.y + 0.12, BOARD.z + d); camera.lookAt(0, BOARD.y + 0.12, BOARD.z);
    const dx = SAFE.left + aw / 2 - W / 2, dy = SAFE.top + ah / 2 - H / 2; if (WD) { const wpp = 2 * t * d / H; camera.position.x -= dx * wpp; camera.position.y += dy * wpp; camera.clearViewOffset(); } else camera.setViewOffset(W, H, -dx, -dy, W, H); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    // Ben: bottom-right corner, seen from behind, throwing arm on the screen side; always kept in front of the counter
    const want = port ? 3.9 : 3.8, D = clamp(Math.min(want, camera.position.z - 0.8), 0.6, want), bs = (port ? 0.62 : 0.66) * D / want; ben.scale.setScalar(bs); at(port ? 0.6 : 0.84, port ? -0.86 : -0.84, D, ben.position); ben.position.y -= headY * bs; ben.rotation.set(0, Math.PI, 0); ben.userData.baseY = ben.position.y;
    // the barker: left of the board on wide screens; on a phone held upright he stands bottom-left, facing you (Ben is bottom-right, from behind)
    if (port) { barker.scale.setScalar(bs); at(-0.56, -0.8, D, barker.position); barker.position.y -= headY * bs; barker.rotation.y = 0.25; } else { barker.scale.setScalar(1); barker.position.set(-1.85, 0, -0.45); barker.rotation.y = 0.6; }   // inside the stall, in front of the prize shelves, so no plank crosses his face
    const showFans = !port && W / H > 1.6; fans.forEach(f => f.visible = showFans);
    ben.updateMatrixWorld(true); const wa = BP.arms.map(a => a.getWorldPosition(V3()).x); throwArm = wa[0] > wa[1] ? 0 : 1; }
  let throwArm = 1, armX = 0, armZ = 0;

  // ---------- state ----------
  const S = { phase: 'menu', mode: 'classic', score: 0, darts: 0, dartsMax: 6, tLeft: 0, gt: 0, t0: 0, streak: 0, mult: 1, hits: 0, throws: 0, popped: 0, best1: 0, practice: false, seed: 1, flash: null, flashT: 0, say: '', sayT: 0, sayCd: 0, done: null, countT: 0, endT: 0, steadyT: 0, cool: 0,
    aiming: false, aimX: 0, aimY: BOARD.y, aimHold: 0, mouse: false, hover: -1, throwT: 0, assist: !!save.stat(SAVE.assist, 0), party: null, demo: null, idleT: 0, gold: 0, jackpot: false, perfect: false, specials: 0, extra: 0 };
  const mode = () => MODES[S.mode] || MODES.classic;
  const flash = (txt, col = '#ffd23a', t = 1.3) => { S.flash = { txt, col }; S.flashT = t; dirty = true; };
  function say(kind, force) { if (!force && S.sayCd > 0) return; const L = LINES[kind]; if (!L) return; const txt = pick(L); S.say = txt; S.sayT = 3.4; S.sayCd = kind === 'intro' ? 0 : 2.2; barker.userData.say = { text: txt, t: 0 }; barker.userData.lookAt = camera.position; dirty = true; }
  const tickets = () => save.stat(SAVE.tickets, 0);

  function resetBoard(seed, md) { S.seed = seed; slots.forEach((s, i) => { s.gen = 0; s.type = typeFor(seed, i, 0, md); s.alive = true; s.grow = 0; s.regrowAt = 0; s.popT = -9; s.wob = 0; s.g.visible = true; s.delay = 0.04 * ((i % BOARD.cols) + Math.floor(i / BOARD.cols)); dressSlot(s); }); }
  function startRound(md, { seed, practice = false, partyIdx = null } = {}) {
    sfx.ensure(); S.mode = md; const Md = mode(); S.done = null; S.score = 0; S.streak = 0; S.mult = 1; S.hits = 0; S.throws = 0; S.popped = 0; S.steadyT = 0; S.cool = 0; S.endT = 0; S.extra = 0; S.jackpot = false; S.specials = 0;
    S.darts = Md.darts; S.dartsMax = Md.darts; S.tLeft = Md.time; S.practice = practice; S.gt = 0; clearDarts(); resetBoard(seed != null ? seed : (Math.random() * 1e9) | 0, md);
    S.phase = 'count'; S.countT = md === 'race' ? 0 : 1.7; S.aiming = false; ret.visible = false; S.aimX = 0; S.aimY = BOARD.y; S.aimHold = 0; if (md !== 'demo' && md !== 'race') say('start', true); dirty = true; }
  function begin(md) { if (md === 'party' || md === 'race' || md === 'demo') return;
    const Md = MODES[md]; let practice = false; if (Md.cost) { if (!save.spend(Md.cost)) practice = true; } if (practice) flash('PRACTICE ROUND · NO TICKETS', '#7dd3fc', 2);
    S.demo = null; startRound(md, { practice }); }

  // ---------- aiming + throwing ----------
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(V3(0, 0, 1), -HIT_Z), ndc = new THREE.Vector2(), hitP = V3();
  function screenToBoard(cx, cy) { const r = renderer.domElement.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); if (!ray.ray.intersectPlane(plane, hitP)) return null; return { x: clamp(hitP.x, -BOARD.w / 2 - 0.2, BOARD.w / 2 + 0.2), y: clamp(hitP.y, BOARD.y - BOARD.h / 2 - 0.2, BOARD.y + BOARD.h / 2 + 0.2) }; }
  const swayAmp = () => S.steadyT > 0 ? 0.004 : (S.assist ? 0.5 : 1) * (0.032 + 0.085 * smooth(1.4, 4.5, S.aimHold));
  const swayAt = (t, out) => { const A = swayAmp(); out.x = A * (Math.sin(t * 1.9) + 0.5 * Math.sin(t * 4.3 + 1)); out.y = A * (Math.sin(t * 2.3 + 2) + 0.5 * Math.sin(t * 3.7)); return out; };
  const sw = { x: 0, y: 0 }, _p = { x: 0, y: 0 }; let wallT = 0;
  function aimPoint() { swayAt(wallT, sw); let x = S.aimX + sw.x, y = S.aimY + sw.y; if (S.assist) { let bd = 0.26, bi = -1; for (const s of slots) { if (!s.alive || s.grow < 0.6) continue; slotXY(s.i, S.gt, mode().moving, _p); const d = Math.hypot(_p.x - x, _p.y - y); if (d < bd) { bd = d; bi = s.i; } } if (bi >= 0) { slotXY(bi, S.gt, mode().moving, _p); x += (_p.x - x) * 0.6; y += (_p.y - y) * 0.6; } } return { x, y }; }
  function canThrow() { return S.phase === 'play' && S.cool <= 0 && (mode().darts === 0 || S.darts > 0) && !(S.net && S.net.st === 'play' && S.gt > MODES.race.time); }
  function handPos(out) { return out.copy(heldPos); }
  const heldPos = V3(), heldLook = V3();
  function hitTest(x, y, t) { let best = -1, bd = 9; const mv = mode().moving; for (const s of slots) { if (!s.alive || s.grow < 0.6) continue; slotXY(s.i, t, mv, _p); const R = BOARD.r * TYPES[s.type].r * 1.1, d = Math.hypot(x - _p.x, (y - _p.y) / 1.12); if (d < R && d < bd) { bd = d; best = s.i; } } return best; }
  function throwDart(force) { if (!canThrow() && !force) return false; const a = aimPoint(); S.throws++; S.cool = mode().reload || 0.32; if (mode().darts) S.darts--; S.aimHold = 0; S.throwT = 0.28; sfx.whoosh();
    const from = handPos(V3()), to = V3(a.x, a.y, HIT_Z), my = S.net && S.net.st === 'play' ? S.net.mySlot : (S.party ? S.party.cur : 0); const tl = S.gt + 0.36 + from.distanceTo(to) * 0.012;
    if (S.mode === 'race' && S.net) { netSend('ev', { k: 'th', x: +a.x.toFixed(3), y: +a.y.toFixed(3), tl: +tl.toFixed(3) }); if (netIsHost()) S.net.queue.push({ id: S.net.me, x: a.x, y: a.y, tl }); launch(from, to, my, () => sfx.thunk()); }
    else launch(from, to, my, () => landLocal(a.x, a.y, tl));
    dirty = true; return true; }
  function landLocal(x, y, tl) { const i = hitTest(x, y, tl); if (i < 0) { sfx.thunk(); S.streak = 0; S.mult = 1; if (S.mode !== 'demo') say('miss'); flash('MISS', '#ff9a8a', 0.8); return; } popSlot(i, true, tl); }
  function popSlot(i, mine, tl, net) { const s = slots[i]; if (!s.alive) return 0; const T = TYPES[s.type]; slotXY(i, tl, mode().moving, _p); s.alive = false; s.popT = S.gt; if (mode().time) s.regrowAt = tl + 2.2; s.g.visible = false;
    burst(_p.x, _p.y, HIT_Z, T.col, s.type === 'star' ? 30 : 18, s.type === 'blast' ? 1.4 : 1); sfx.pop(s.type === 'blast' ? 1.3 : 1); fans.forEach(f => { if (f.visible) f.userData.hop = 1; });
    if (net) return 0;   // online: points come from the host
    S.streak++; S.mult = S.streak >= 5 ? 3 : S.streak >= 3 ? 2 : 1; let gain = T.pts * S.mult; S.hits++; S.popped++;
    if (s.type === 'gold') { sfx.ding(3); say('gold', true); S.specials++; } else if (s.type === 'star') { sfx.ding(5); sfx.cheer(); say('star', true); S.jackpot = true; S.specials++; }
    else if (s.type === 'blast') { sfx.boom(); say('blast', true); S.specials++; for (const n of neighbours(i)) if (slots[n].alive) { slotXY(n, tl, mode().moving, _a); gain += TYPES[slots[n].type].pts; S.popped++; popText(_a.x, _a.y + 0.1, '+' + TYPES[slots[n].type].pts, '#ffffff'); popSlotQuiet(n, tl); } }
    else if (s.type === 'ice') { S.steadyT = 5; sfx.blip(true); say('ice', true); S.specials++; } else if (s.type === 'plus') { S.specials++; if (mode().time) { S.tLeft += 3; say('plusT', true); } else { S.darts++; S.extra++; say('plus', true); } sfx.blip(true); }
    else if (S.streak >= 3) say('streak'); else say('hit');
    S.score += gain; popText(_p.x, _p.y + 0.12, '+' + gain + (S.mult > 1 ? ' ×' + S.mult : ''), S.mult > 1 ? '#ffd23a' : '#ffffff');
    flash(T.label ? T.label + ' +' + gain : S.mult > 1 ? 'STREAK ×' + S.mult + ' · +' + gain : 'POP +' + gain, T.label ? '#ffd23a' : '#22c55e', 1.0); dirty = true; return gain; }
  function popSlotQuiet(n, tl) { const s = slots[n]; if (!s.alive) return; slotXY(n, tl, mode().moving, _a); s.alive = false; s.popT = S.gt; if (mode().time) s.regrowAt = tl + 2.2; s.g.visible = false; burst(_a.x, _a.y, HIT_Z, TYPES[s.type].col, 12); }

  // ---------- round end ----------
  function finish() { const md = S.mode, Md = mode(); S.phase = 'done'; S.aiming = false; ret.visible = false; dirty = true;
    if (md === 'demo') { S.demo = null; S.phase = 'menu'; S.done = null; say('intro', true); return; }
    if (md === 'party') { const P = S.party, pl = P.players[P.cur]; pl.score = S.score; pl.done = true; pl.pops = S.popped; if (P.cur < P.players.length - 1) { P.last = { name: pl.name, col: pl.col, score: S.score }; P.cur++; S.phase = 'pass'; return; }
      const rank = P.players.slice().sort((a, b) => b.score - a.score); S.done = { kind: 'party', ranking: rank.map((p, i) => ({ ...p, place: i + 1 })), winner: rank[0], tie: rank.length > 1 && rank[0].score === rank[1].score }; sfx.cheer(); return; }
    const perfect = md === 'classic' && S.hits >= Md.darts + S.extra && S.throws > 0, bestKey = md === 'blitz' ? SAVE.bestBlitz : SAVE.best, prevBest = save.stat(bestKey, 0), newBest = !S.practice && save.best(bestKey, S.score);
    let tk = 0, gold = 0; if (!S.practice) { tk = md === 'blitz' ? Math.floor(S.score / 25) : Math.floor(S.score / 10) + (perfect ? 10 : 0); gold = md === 'blitz' ? Math.floor(S.score / 150) : 0; save.setStat(SAVE.tickets, tickets() + tk); if (gold) save.addGold(gold); save.setStat(SAVE.rounds, save.stat(SAVE.rounds, 0) + 1); save.setStat(SAVE.pops, save.stat(SAVE.pops, 0) + S.popped); if (S.jackpot) save.setStat(SAVE.jackpots, save.stat(SAVE.jackpots, 0) + 1); }
    const acc = S.throws ? Math.round(S.hits / S.throws * 100) : 0, grade = S.score >= (md === 'blitz' ? 900 : 200) ? 'A' : S.score >= (md === 'blitz' ? 500 : 110) ? 'B' : S.score >= (md === 'blitz' ? 250 : 50) ? 'C' : 'D';
    say(grade === 'A' ? 'good' : grade === 'D' ? 'bad' : 'meh', true); if (grade === 'A' || newBest) sfx.cheer();
    S.done = { kind: 'solo', mode: md, title: perfect ? 'Perfect round!' : md === 'blitz' ? 'Time!' : 'Round over', kicker: (md === 'blitz' ? 'BLITZ' : 'CLASSIC') + ' · ' + (theme.label === 'CARNIVAL' ? 'CARNIVAL' : theme.label + ' CARNIVAL'), grade, total: S.score, newBest, best: Math.max(prevBest, S.score), practice: S.practice, tickets: tk, gold,
      rows: [['Balloons popped', String(S.popped)], ['Darts thrown', String(S.throws)], ['Accuracy', acc + '%'], ['Specials', String(S.specials)], ...(perfect ? [['Perfect bonus', '+10 tickets']] : []), ['Tickets won', S.practice ? 'PRACTICE' : '+' + tk], ...(gold ? [['Gold', '+' + gold + 'g']] : [])] }; }

  // ---------- party (pass the phone) ----------
  function partySetup(n) { n = clamp(n | 0, 2, MAX_PLAYERS); sfx.ensure(); S.demo = null; S.party = { n, cur: 0, seed: (Math.random() * 1e9) | 0, players: Array.from({ length: n }, (_, i) => ({ name: NET_COLS[i][0], col: NET_COLS[i][1], score: 0, done: false })), last: null }; S.done = null; S.phase = 'pass'; clearDarts(); resetBoard(S.party.seed, 'party'); dirty = true; }
  function partyGo() { if (!S.party || S.phase !== 'pass') return; startRound('party', { seed: S.party.seed }); }

  // ---------- demo (the stall plays itself, with captions) ----------
  const DEMO_CAPS = ['DRAG ANYWHERE TO AIM · THE RING SITS ABOVE YOUR FINGER', 'THE RING WOBBLES · HOLD TOO LONG AND IT WOBBLES MORE', 'LET GO TO THROW', 'GOLD 50 · PINK STAR 100 · HITS IN A ROW ×2 THEN ×3', 'BLACK BLAST POPS ITS NEIGHBOURS · ICE STOPS THE WOBBLE', 'WHITE PLUS = ONE MORE DART'];
  function demoStart() { sfx.ensure(); S.party = null; startRound('demo', {}); S.demo = { n: 0, of: 6, ai: 0, tgt: -1, cap: DEMO_CAPS[0] }; dirty = true; }
  function demoStop() { if (!S.demo) return; S.demo = null; clearDarts(); S.phase = 'menu'; S.aiming = false; ret.visible = false; resetBoard((Math.random() * 1e9) | 0, 'classic'); dirty = true; }
  function demoTick(dt) { const D = S.demo; if (!D || S.phase !== 'play') return; D.ai += dt; if (D.tgt < 0 || !slots[D.tgt].alive) { const alive = slots.filter(s => s.alive); const sp = alive.filter(s => TYPES[s.type].label); D.tgt = (sp.length && Math.random() < 0.7 ? pick(sp) : pick(alive) || slots[0]).i; D.ai = 0; }
    slotXY(D.tgt, S.gt, false, _p); S.aiming = true; ret.visible = true; S.aimX = damp(S.aimX, _p.x + 0.02, 5, dt); S.aimY = damp(S.aimY, _p.y - 0.02, 5, dt);
    if (D.ai > 1.25 && S.cool <= 0 && S.darts > 0) { throwDart(); D.n++; D.cap = DEMO_CAPS[Math.min(D.n, DEMO_CAPS.length - 1)]; D.tgt = -1; D.ai = 0; dirty = true; } }

  // ---------- online race (2-5 phones; first dart to a balloon gets it; the host decides) ----------
  function netSet(p) { if (S.net) Object.assign(S.net, p); dirty = true; }
  function netOpen() { S.net = { st: 'menu', code: '', status: '', peers: {}, ready: false, j: 0, msg: '', ping: null, me: null, players: [], mySlot: 0, queue: [], scores: {}, ended: false }; S.party = null; S.demo = null; dirty = true; }
  function members() { const N = S.net; if (!N || !NET) return []; const all = [{ id: NET.id, j: N.j, ready: N.ready, playing: N.st === 'play', me: true }, ...Object.entries(N.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, MAX_PLAYERS); }
  const inRoom = () => members().some(m => m.me);
  function hostId(match = true) { let m = members(); if (match && S.net && S.net.matchIds) m = m.filter(x => S.net.matchIds.includes(x.id)); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : NET && NET.id; }
  const netIsHost = () => !!NET && hostId(true) === NET.id;
  function playerList(ids) { const s = ids.slice().sort(); return s.map((id, slot) => ({ id, slot, name: NET_COLS[slot][0], col: NET_COLS[slot][1] })); }
  let NET = null, netTok = 0, nTimer = 0; const lastSeen = {};
  const netSend = (t, d, to) => { if (NET) NET.send(t, d, to); };
  async function netJoin(code) { code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { netSet({ msg: 'Type the 4-letter room code from your friend.' }); return; }
    netLeave(); if (!S.net) netOpen(); for (const k in lastSeen) delete lastSeen[k]; netSet({ st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '', ping: null });
    const tok = ++netTok; let connect = localDuel; try { const m = await import(new URL('engine/duel-net.js', document.baseURI).href); if (m && m.connectDuel) connect = m.connectDuel; } catch (e) {}
    const N = await connect({ game: 'balloonPop', code, onJoin: id => nHello(id), onLeave: id => nGone(id), onMsg: (t, d, id) => nMsg(t, d, id), onStatus: s => netSet({ status: s }) });
    if (tok !== netTok) { N.leave(); return; } NET = N; S.net.me = N.id; nHello(); clearInterval(nTimer); nTimer = setInterval(nTick, 1000); dirty = true;
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {} }
  function netLeave() { netTok++; clearInterval(nTimer); if (NET) { NET.send('ev', { k: 'bye' }); NET.leave(); } NET = null; if (S.net) { S.net.matchIds = null; if (S.net.st === 'play') { S.net.st = 'room'; } } for (const k in lastSeen) delete lastSeen[k];
    if (S.mode === 'race' && (S.phase === 'play' || S.phase === 'count')) { S.phase = 'menu'; clearDarts(); }
    try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} }
  function netClose() { netLeave(); S.net = null; if (S.phase !== 'play') { S.phase = 'menu'; S.done = null; } dirty = true; }
  function nHello(to) { const N = S.net; if (!NET || !N) return; NET.send('hi', { v: 1, j: N.j, ready: N.ready, playing: N.st === 'play' }, to); }
  function peerSet(id, p) { const N = S.net; if (!N) return; N.peers[id] = { ...(N.peers[id] || {}), ...p }; dirty = true; }
  function nGone(id) { if (!lastSeen[id]) return; delete lastSeen[id]; if (S.net) delete S.net.peers[id]; dirty = true; }
  function nTick() { if (!NET) return; NET.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(lastSeen)) if (now - lastSeen[id] > 25000) nGone(id); }
  function nMsg(t, d, id) { const N = S.net; if (!N || !NET || !d) return; const now = performance.now(), known = !!lastSeen[id];
    if (t === 'hi') { lastSeen[id] = now; peerSet(id, { j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }); if (!known) setTimeout(() => nHello(id), 0); setTimeout(nMaybeStart, 0); return; }
    if (!known) return; lastSeen[id] = now; const inMatch = !!(N.matchIds && N.matchIds.includes(id));
    if (t === 'pg') { if (d.t != null) NET.send('pg', { e: d.t }, id); else if (d.e != null) netSet({ ping: Math.max(1, Math.round(now - d.e)) }); return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { peerSet(id, { ready: !!d.on }); setTimeout(nMaybeStart, 0); }
    else if (d.k === 'start') nStart(d);
    else if (d.k === 'playing') peerSet(id, { playing: !!d.on });
    else if (d.k === 'bye') nGone(id);
    else if (d.k === 'th' && inMatch && S.mode === 'race' && S.phase !== 'menu') { const pl = N.players.find(p => p.id === id); if (pl) launch(V3(-1.6 + pl.slot * 0.8, 0.9, camera.position.z - 1.2), V3(+d.x, +d.y, HIT_Z), pl.slot, () => {}); if (netIsHost()) N.queue.push({ id, x: +d.x, y: +d.y, tl: +d.tl }); }
    else if (d.k === 'pop' && S.mode === 'race') applyPop(d);
    else if (d.k === 'end' && S.mode === 'race') raceEnd(d.scores); }
  function nMaybeStart() { const N = S.net; if (!N || !NET || N.st !== 'room' || !inRoom() || hostId(false) !== NET.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    const d = { k: 'start', wait: 3500, seed: (Math.random() * 1e9) | 0, ids: m.map(x => x.id) }; NET.send('ev', d); nStart(d); }
  function nStart(d) { const N = S.net; if (!N || !NET || !Array.isArray(d.ids)) return; if (!d.ids.includes(NET.id)) { netSet({ msg: 'A race started without you. You join the next one.' }); return; }
    N.matchIds = d.ids.slice(); N.players = playerList(d.ids); N.mySlot = (N.players.find(p => p.id === NET.id) || { slot: 0 }).slot; N.queue = []; N.scores = Object.fromEntries(d.ids.map(i => [i, 0])); N.streaks = {}; N.ended = false; N.st = 'play'; N.ready = false; N.msg = '';
    Object.keys(N.peers).forEach(k => { N.peers[k].ready = false; N.peers[k].playing = d.ids.includes(k); });
    const lat = N.ping ? N.ping / 2 : 0, wait = clamp(+d.wait || 3500, 1000, 5000); S.party = null; S.demo = null; startRound('race', { seed: d.seed >>> 0 }); S.t0 = performance.now() + wait - (NET.id === hostId(true) ? 0 : lat); S.phase = 'count'; dirty = true; }
  function hostResolve() { const N = S.net; if (!N || !netIsHost()) return; N.queue.sort((a, b) => a.tl - b.tl); while (N.queue.length && N.queue[0].tl <= S.gt) { const th = N.queue.shift(); const i = hitTest(th.x, th.y, th.tl), sk = N.streaks;
      if (i < 0) { sk[th.id] = 0; continue; } const s = slots[i], T = TYPES[s.type]; sk[th.id] = (sk[th.id] || 0) + 1; const mult = sk[th.id] >= 5 ? 3 : sk[th.id] >= 3 ? 2 : 1; let pts = T.pts * mult; const chain = s.type === 'blast' ? neighbours(i).filter(n => slots[n].alive).map(n => [n, slots[n].gen]) : [];
      chain.forEach(([n]) => pts += TYPES[slots[n].type].pts); if (s.type === 'plus') pts += 20; N.scores[th.id] = (N.scores[th.id] || 0) + pts;
      const msg = { k: 'pop', slot: i, gen: s.gen, by: th.id, pts, mult, tl: th.tl, chain, total: N.scores[th.id] }; NET.send('ev', msg); applyPop(msg); } }
  function applyPop(d) { const N = S.net; if (!N) return; const s = slots[d.slot]; if (!s) return; if (s.gen !== d.gen) { s.gen = d.gen; s.type = typeFor(S.seed, s.i, s.gen, 'race'); dressSlot(s); s.alive = true; s.grow = 1; s.g.visible = true; }
    const T = TYPES[s.type], mine = NET && d.by === NET.id, pl = N.players.find(p => p.id === d.by); slotXY(d.slot, S.gt, true, _p); popSlot(d.slot, mine, +d.tl, true);
    (d.chain || []).forEach(([n, g]) => { const sn = slots[n]; if (sn && sn.gen === g && sn.alive) popSlotQuiet(n, +d.tl); });
    N.scores[d.by] = +d.total || 0; popText(_p.x, _p.y + 0.12, '+' + d.pts, pl ? pl.col : '#fff');
    if (mine) { S.score = N.scores[d.by]; S.streak = d.mult >= 3 ? 5 : d.mult >= 2 ? 3 : 1; S.mult = d.mult; if (s.type === 'ice') S.steadyT = 5; flash((T.label ? T.label + ' ' : 'POP ') + '+' + d.pts, '#22c55e', 0.9); if (s.type === 'gold' || s.type === 'star') sfx.ding(s.type === 'star' ? 5 : 3); if (s.type === 'blast') sfx.boom(); }
    else if (pl) flash(pl.name + ' +' + d.pts, pl.col, 0.6); dirty = true; }
  function raceEnd(scores) { const N = S.net; if (!N || N.ended) return; N.ended = true; if (scores) Object.assign(N.scores, scores); const rank = N.players.map(p => ({ ...p, score: N.scores[p.id] || 0, me: NET && p.id === NET.id })).sort((a, b) => b.score - a.score);
    const me = rank.find(r => r.me), won = !!me && rank[0].id === me.id && (rank.length < 2 || rank[0].score > rank[1].score), tk = me ? Math.floor(me.score / 25) : 0, gold = won ? 5 : 0;
    if (me) { save.setStat(SAVE.tickets, tickets() + tk); if (gold) save.addGold(gold); if (won) save.setStat(SAVE.wins, save.stat(SAVE.wins, 0) + 1); }
    S.phase = 'done'; S.aiming = false; ret.visible = false; S.done = { kind: 'race', ranking: rank.map((r, i) => ({ ...r, place: i + 1 })), won, tickets: tk, gold, total: me ? me.score : 0 }; if (won) sfx.cheer(); say(won ? 'good' : 'meh', true);
    N.st = 'room'; if (NET) NET.send('ev', { k: 'playing', on: false }); dirty = true; }
  function netReadyToggle() { const N = S.net; if (!N || !NET) return; N.ready = !N.ready; NET.send('ev', { k: 'ready', on: N.ready }); dirty = true; setTimeout(nMaybeStart, 0); }

  // ---------- input ----------
  const el = renderer.domElement; let pid = null, downAt = 0;
  const touchLift = e => e.pointerType === 'touch' || e.pointerType === 'pen' ? Math.min(70, CH() * 0.08) : 0;
  function aimFrom(e) { const b = screenToBoard(e.clientX, e.clientY - touchLift(e)); if (!b) return; S.aimX = b.x; S.aimY = b.y; }
  function onDown(e) { sfx.ensure(); if (S.phase !== 'play' || S.demo) return; if (pid != null && e.pointerId !== pid) return; pid = e.pointerId; try { el.setPointerCapture(pid); } catch (er) {} S.mouse = e.pointerType === 'mouse'; if (!S.aiming) S.aimHold = 0; S.aiming = true; ret.visible = true; downAt = performance.now(); aimFrom(e); e.preventDefault(); }
  function onMove(e) { if (S.phase !== 'play' || S.demo) return; if (e.pointerType === 'mouse' && pid == null) { S.mouse = true; if (!S.aiming) { S.aiming = true; S.aimHold = 0; } ret.visible = true; aimFrom(e); return; } if (e.pointerId !== pid) return; aimFrom(e); }
  function onUp(e) { if (e.pointerId !== pid) return; pid = null; if (S.phase === 'play' && !S.demo) { aimFrom(e); throwDart(); if (e.pointerType !== 'mouse') { S.aiming = false; ret.visible = false; } } }
  function onCancel(e) { if (e.pointerId !== pid) return; pid = null; S.aiming = false; ret.visible = false; }
  function onLeaveEl(e) { if (e.pointerType === 'mouse' && pid == null) { S.aiming = false; ret.visible = false; } }
  const onDownW = e => { if (e.target !== el) return; e.preventDefault(); e.stopImmediatePropagation(); onDown(e); };   /* world: taps on the map canvas are the game's */
  if (WD) addEventListener('pointerdown', onDownW, true); else el.addEventListener('pointerdown', onDown); el.addEventListener('pointermove', onMove); el.addEventListener('pointerup', onUp); el.addEventListener('pointercancel', onCancel); el.addEventListener('pointerleave', onLeaveEl);
  el.addEventListener('contextmenu', e => e.preventDefault());
  const keys = {}; function onKey(e) { const tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA') return; const down = e.type === 'keydown';
    if (/^(Arrow|Key[WASD])/.test(e.code)) { keys[e.code] = down; if (S.phase === 'play' && !S.demo && down) { if (!S.aiming) { S.aiming = true; S.aimHold = 0; } ret.visible = true; } e.preventDefault(); }
    if (down && (e.code === 'Space' || e.code === 'Enter') && S.phase === 'play' && !S.demo) { e.preventDefault(); if (!S.aiming) { S.aiming = true; ret.visible = true; } throwDart(); } }
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const onResize = () => layout(); addEventListener('resize', onResize); let ro = null; try { ro = new ResizeObserver(() => layout()); if (!WD) ro.observe(container); } catch (e) {}

  // ---------- HUD for the page ----------
  let dirty = true, emitT = 0;
  function hud() { const Md = mode(), N = S.net, m = N && NET ? members() : [];
    const race = S.mode === 'race' && N && N.players.length ? N.players.map(p => ({ name: p.name, col: p.col, score: N.scores[p.id] || 0, me: NET && p.id === NET.id })) : null;
    return { phase: S.phase, mode: S.mode, modeName: Md.name, score: S.score, darts: S.darts, dartsMax: S.dartsMax + S.extra, timed: !!Md.time, tLeft: Math.max(0, S.tLeft), streak: S.streak, mult: S.mult, steady: S.steadyT > 0, steadyT: S.steadyT,
      flash: S.flash, say: S.sayT > 0 ? S.say : '', sayWho: BARKER, count: S.phase === 'count' ? (S.mode === 'race' ? Math.max(1, Math.ceil((S.t0 - performance.now()) / 1000)) : S.countT > 0.5 ? 'READY' : 'GO!') : null, practice: S.practice,
      gold: save.data.gold, tickets: tickets(), best: save.stat(SAVE.best, 0), bestBlitz: save.stat(SAVE.bestBlitz, 0), wins: save.stat(SAVE.wins, 0), assist: S.assist, muted: sfx.muted, hint: S.phase === 'play' && S.throws === 0 && !S.demo ? (touch ? 'DRAG TO AIM · LET GO TO THROW' : 'AIM WITH THE MOUSE · CLICK TO THROW') : '',
      party: S.party ? { n: S.party.n, cur: S.party.cur, last: S.party.last, players: S.party.players.map((p, i) => ({ ...p, cur: i === S.party.cur && S.phase !== 'done' })) } : null, race, done: S.done,
      demo: S.demo ? { cap: S.demo.cap, n: S.demo.n, of: S.demo.of } : null, world: theme.label, cost: COST,
      prizes: PRIZES.map(p => ({ ...p, owned: save.count(p.id), afford: tickets() >= p.cost })),
      net: N ? { st: N.st, code: N.code, status: N.status, msg: N.msg, ping: N.ping, ready: N.ready, host: NET ? hostId(false) === NET.id : false, full: N.st !== 'menu' && !!NET && m.length === MAX_PLAYERS && !m.some(x => x.me), members: (() => { const pl = playerList(m.map(x => x.id)); return m.map(x => { const p = pl.find(q => q.id === x.id) || { name: '', col: '#fff' }; return { name: p.name, col: p.col, me: x.me, ready: !!x.ready, playing: !!x.playing && !x.me, host: x.id === hostId(false) }; }); })() } : null }; }
  function emit(now) { if (!dirty && now - emitT < 120) return; dirty = false; emitT = now; try { onState(hud()); } catch (e) {} }

  // ---------- main loop ----------
  let raf = 0, last = performance.now(), dead = false, bulbT = 0; layout(true); resetBoard((Math.random() * 1e9) | 0, 'classic'); slots.forEach(s => s.grow = 1); say('intro', true);
  function frame(now) { if (dead) return; raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; wallT += dt; layout();
    // timers
    if (S.flashT > 0 && (S.flashT -= dt) <= 0) { S.flash = null; dirty = true; } if (S.sayT > 0 && (S.sayT -= dt) <= 0) { dirty = true; } S.sayCd -= dt; S.cool -= dt; if (S.steadyT > 0) S.steadyT -= dt;
    if (S.aiming) S.aimHold += dt;
    if (S.phase === 'count') { if (S.mode === 'race') { S.gt = (now - S.t0) / 1000; if (S.gt >= 0) { S.phase = 'play'; sfx.ding(2); dirty = true; } else if (Math.ceil(-S.gt) !== S.lastCount) { S.lastCount = Math.ceil(-S.gt); sfx.tick(); dirty = true; } }
      else { const before = S.countT; S.countT -= dt; if (before > 0.5 && S.countT <= 0.5) { sfx.ding(2); dirty = true; } if (S.countT <= 0) { S.phase = 'play'; dirty = true; } } }
    if (S.phase === 'play') { if (S.mode === 'race') S.gt = (now - S.t0) / 1000; else S.gt += dt; const Md = mode();
      if (Md.time) { S.tLeft = (S.mode === 'race' ? Md.time - S.gt : S.tLeft - dt); if (Math.ceil(S.tLeft) !== S.lastSec) { S.lastSec = Math.ceil(S.tLeft); dirty = true; if (S.tLeft <= 5 && S.tLeft > 0) sfx.tick(); } }
      if (S.mode === 'race') { hostResolve(); if (S.gt >= Md.time) { S.tLeft = 0; if (netIsHost() && S.gt >= Md.time + 0.7) { hostResolve(); NET.send('ev', { k: 'end', scores: S.net.scores }); raceEnd(S.net.scores); } else if (S.gt >= Md.time + 3.5) raceEnd(null); } }
      else if (Md.time && S.tLeft <= 0) { S.tLeft = 0; if (!darts.some(d => d.fly)) finish(); }
      else if (Md.darts && S.darts <= 0 && !darts.some(d => d.fly)) { S.endT += dt; if (S.endT > 0.9) finish(); }
      if (S.demo) demoTick(dt);
      // keyboard aim
      const kx = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0), ky = (keys.ArrowUp || keys.KeyW ? 1 : 0) - (keys.ArrowDown || keys.KeyS ? 1 : 0); if (kx || ky) { S.aimX = clamp(S.aimX + kx * dt * 1.5, -BOARD.w / 2, BOARD.w / 2); S.aimY = clamp(S.aimY + ky * dt * 1.5, BOARD.y - BOARD.h / 2, BOARD.y + BOARD.h / 2); }
    }
    // balloons: position, regrow, wobble, hover
    const Md = mode(), mv = Md.moving && (S.phase === 'play' || S.phase === 'count' || S.phase === 'done'), tt = S.phase === 'menu' || S.phase === 'pass' ? wallT : S.gt; const ap = S.aiming ? aimPoint() : null; let hov = -1;
    if (ap) hov = hitTest(ap.x, ap.y, S.gt);
    if (hov !== S.hover) { S.hover = hov; if (hov >= 0 && S.phase === 'play') { if (S.assist) { sfx.hover(['star', 'gold'].includes(slots[hov].type) ? 12 : 0); try { navigator.vibrate && navigator.vibrate(12); } catch (e) {} } } }
    for (const s of slots) { if (!s.alive && s.regrowAt && S.gt >= s.regrowAt && (S.phase === 'play' || S.phase === 'count')) { s.gen++; s.type = typeFor(S.seed, s.i, s.gen, S.mode); dressSlot(s); s.alive = true; s.grow = 0; s.regrowAt = 0; s.delay = 0; s.g.visible = true; }
      if (!s.alive) continue; if (s.delay > 0) { s.delay -= dt; s.g.scale.setScalar(0.001); continue; } s.grow = Math.min(1, s.grow + dt * 2.6); const gr = s.grow < 1 ? 1 - Math.pow(1 - s.grow, 3) * Math.cos(s.grow * 7) : 1;
      slotXY(s.i, tt, mv, _p); s.g.position.set(_p.x, _p.y, HIT_Z); s.hover = damp(s.hover, s.i === hov ? 1 : 0, 14, dt); s.g.scale.setScalar(Math.max(0.001, gr * (1 + s.hover * 0.08))); s.g.rotation.z = Math.sin(wallT * 1.3 + s.i) * 0.06; }
    // reticle
    if (ret.visible && ap) { ret.position.set(ap.x, ap.y, HIT_Z + 0.26); const rc = S.steadyT > 0 ? 0x7dd3fc : hov >= 0 ? 0x22c55e : 0xffffff; ret.userData.mat.color.setHex(rc); const sc = 1 + 0.6 * swayAmp() / 0.117 * 0.3; ret.scale.setScalar(sc); }
    // darts, confetti, popups
    darts.forEach(d => updDart(d, dt)); updConf(dt); pops.forEach(p => { if (p.life <= 0) return; p.life -= dt * 0.9; p.s.position.y += dt * 0.45; p.s.material.opacity = Math.min(1, p.life * 2.5); if (p.life <= 0) p.s.visible = false; });
    // Ben: wind up while aiming, snap forward on the throw, a dart in his paw
    const showBen = S.phase !== 'menu' || true; ben.visible = showBen; kit.animFox(ben, dt, 0); { const A = BP.arms[throwArm]; let tx = -0.35, tz = 0; if (S.throwT > 0) { S.throwT -= dt; const k = S.throwT / 0.28; tx = -2.6 + (1 - k) * 2.0; tz = 0.35 * k; } else if (S.aiming && S.phase === 'play') { tx = -2.5; tz = 0.25; } armX = damp(armX, tx, S.throwT > 0 ? 40 : 12, dt); armZ = damp(armZ, (throwArm === 1 ? 1 : -1) * tz, 10, dt); A.rotation.x = armX; A.rotation.z = armZ;
      if (ap) { const yaw = Math.atan2(ap.x - ben.position.x, -(HIT_Z - ben.position.z)) * 0.5; ben.rotation.y = damp(ben.rotation.y, Math.PI - yaw, 6, dt); } else ben.rotation.y = damp(ben.rotation.y, Math.PI, 4, dt);
      const canHold = S.phase === 'play' && S.cool <= 0.05 && (Md.darts === 0 || S.darts > 0) && !S.demo; held.g.visible = canHold || S.throwT > 0.2;
      // the dart in your hand: big, lower right of the screen, pulled back while you aim, always pointing at the ring
      { const port = CH() > CW(), pull = S.aiming && S.phase === 'play' ? 0.12 + 0.05 * Math.sin(wallT * 3) * smooth(1.4, 4.5, S.aimHold) : 0; at(port ? 0.1 : 0.42, port ? -0.6 : -0.55, 1.25 + (S.throwT > 0 ? 0.3 * (1 - S.throwT / 0.28) : -pull), heldPos); }
      if (held.g.visible) { held.on = true; dartColor(held, S.net && S.net.st === 'play' ? S.net.mySlot : S.party ? S.party.cur : 0); held.g.position.copy(heldPos); held.g.scale.setScalar(1.15); heldLook.copy(ap ? _a.set(ap.x, ap.y, HIT_Z) : _a.set(0, BOARD.y, HIT_Z)); held.g.lookAt(heldPos.x * 2 - heldLook.x, heldPos.y * 2 - heldLook.y, heldPos.z * 2 - heldLook.z); } }
    // barker + fans
    barker.userData.lookAt = S.aiming && ap ? _b.set(ap.x, ap.y, HIT_Z) : camera.position; kit.animFox(barker, dt, 0); fans.forEach(f => { if (f.visible) { if (f.userData.hop > 0) f.userData.mood = 'excited'; else f.userData.mood = 'happy'; f.userData.lookAt = K.sign.position; kit.animFox(f, dt, 0); } });
    // twinkle
    if ((bulbT += dt) > 0.22) { bulbT = 0; const cols = ['#ffd23a', '#ff6b6b', '#7dd3fc', '#86efac', '#ffffff']; const sh = Math.floor(wallT * 4.5); for (let i = 0; i < K.bulbPts.length; i++) K.bulbs.setColorAt(i, ccol.set(cols[(i + sh) % 5]).multiplyScalar((i + sh) % 3 === 0 ? 0.5 : 1)); K.bulbs.instanceColor.needsUpdate = true; }
    if (S.phase === 'menu' && !S.net) { S.idleT += dt; if (S.idleT > 9) { S.idleT = 0; say('intro'); } } else S.idleT = 0;
    if (WD) syncW(); else renderer.render(scene, camera); emit(now); }
  function syncW() { camera.updateMatrixWorld(); scene.updateWorldMatrix(true, false); wcam.position.copy(camera.position); scene.localToWorld(wcam.position); scene.getWorldQuaternion(_wq); wcam.quaternion.copy(_wq).multiply(camera.quaternion); wcam.fov = camera.fov; wcam.aspect = camera.aspect; wcam.updateProjectionMatrix(); wcam.updateMatrixWorld(); }
  raf = requestAnimationFrame(frame);
  if (!WD && save.stat(SAVE.muted, 0) === 0) { const startMusic = () => { sfx.ensure(); sfx.startMusic(); removeEventListener('pointerdown', startMusic); }; addEventListener('pointerdown', startMusic); }

  const api = {
    hud, begin, startClassic: () => begin('classic'), startBlitz: () => begin('blitz'), partySetup, partyGo, demoStart, demoStop,
    toMenu() { if (S.net && S.net.st === 'play') return; S.demo = null; S.party = null; S.done = null; S.phase = 'menu'; clearDarts(); resetBoard((Math.random() * 1e9) | 0, 'classic'); say('intro', true); dirty = true; },
    again() { const d = S.done; if (!d) return; if (d.kind === 'party' && S.party) partySetup(S.party.n); else if (d.kind === 'solo') begin(d.mode); },
    quitRound() { if (S.mode === 'race') return; S.demo = null; S.party = null; S.done = null; S.phase = 'menu'; S.aiming = false; ret.visible = false; clearDarts(); resetBoard((Math.random() * 1e9) | 0, 'classic'); dirty = true; },
    setAssist(on) { S.assist = !!on; save.setStat(SAVE.assist, S.assist ? 1 : 0); dirty = true; }, toggleAssist() { api.setAssist(!S.assist); },
    toggleMute() { sfx.ensure(); sfx.setMuted(!sfx.muted); save.setStat(SAVE.muted, sfx.muted ? 1 : 0); if (!sfx.muted) sfx.startMusic(); dirty = true; },
    buyPrize(id) { const p = PRIZES.find(x => x.id === id); if (!p) return false; const tk = tickets(); if (tk < p.cost) { flash('NEED ' + (p.cost - tk) + ' MORE TICKETS', '#ff9a8a'); return false; } save.setStat(SAVE.tickets, tk - p.cost); save.give(p.id); sfx.ding(4); flash(p.name + ' · YOURS!', '#22c55e', 1.8); barker.userData.say = { text: 'Enjoy your ' + p.name.toLowerCase() + '!', t: 0 }; S.say = 'Enjoy your ' + p.name.toLowerCase() + '!'; S.sayT = 3; dirty = true; return true; },
    throwAt(x, y) { if (S.phase !== 'play') return false; S.aimX = x; S.aimY = y; S.aiming = true; return throwDart(); }, slotPos: (i) => slotXY(i, S.gt, mode().moving, { x: 0, y: 0 }), slotsInfo: () => slots.map(s => ({ i: s.i, type: s.type, alive: s.alive, gen: s.gen })),
    netOpen, netCreate() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; netJoin(k); }, netJoin, netReadyToggle, netLeave() { netLeave(); if (S.net) { S.net = null; } S.phase = 'menu'; S.done = null; dirty = true; }, netBack() { if (!S.net) return; if (S.net.st === 'menu') { S.net = null; dirty = true; return; } netClose(); }, netLobby() { if (S.net) { S.done = null; S.phase = 'menu'; dirty = true; } },
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; layout(true); } },
    destroy() { dead = true; cancelAnimationFrame(raf); netLeave(); sfx.close(); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('resize', onResize); try { ro && ro.disconnect(); } catch (e) {} if (WD) { removeEventListener('pointerdown', onDownW, true); if (scene.parent) scene.parent.remove(scene); } else { renderer.dispose(); renderer.domElement.remove(); } },
    world: !!WD, key: e => onKey(e), snapCam() { layout(true); if (WD) syncW(); },
    get state() { return S; }, renderer, scene, get camera() { return wcam || camera; }, cast: { ben, barker, fans },
  };
  return api;
}
