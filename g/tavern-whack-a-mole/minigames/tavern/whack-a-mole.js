// 8 GATES — TAVERN WHACK-A-MOLE [tavernMoles]. Master list #37. An arcade cabinet that drops into ANY tavern on ANY world.
// A 3 x 3 cabinet in a warm tavern corner (bar, barkeep, jukebox, dartboard, two regulars cheering). 60-second rounds.
//   MOLE +10 · HARD HAT (2 hits) +25 · GOLD MOLE (quick) +50 · HEDGEHOG: do NOT hit, -30 and your combo resets.
//   Every 5 hits in a row the multiplier goes up (x2, x3, x4). A miss, a hedgehog, or (solo) a mole that gets away resets it.
//   Last 10 seconds = FRENZY: faster moles, more gold.
// MODES: SOLO (pays gold + XP, medals, the Golden Mallet) · PARTY (2-5 players pass one phone, everyone gets the SAME moles)
//        · ONLINE (2-5 phones, peer to peer through engine/duel-net.js, one shared board: first mallet to land gets the mole).
// SOUND CUES: every hole has its own note (back row high, front row low) and sits left / centre / right in stereo,
//   so a player who can't see the board well can still play by ear. ASSIST keeps moles up longer and rings them in yellow.
// MERGE: createWhackAMole({ container, onState, opts: { world } }) stands alone. buildCabinet(ctx) is exported so a world's
//   tavern interior can place the same cabinet; ctx = { THREE, scene, toon, M, canvasTex, origin }.
// Keyboard: 7 8 9 / 4 5 6 / 1 2 3 (number pad layout) or Q W E / A S D / Z X C. Esc = pause.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { crestTex, canvasTex } from '../../engine/textures.js';
import { save } from '../../engine/save.js';

export const MOLES = { name: 'WHACK-A-MOLE', room: 'tavernMoles', key: 'tavernMoles', round: 60, partyRound: 30 };
export const MEDALS = [['GOLD', 2600, '#ffd23a'], ['SILVER', 1600, '#cfd6de'], ['BRONZE', 900, '#d08a4a']];
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PURPLE', '#a78bfa']];
export const MAX_PLAYERS = 5;
export const TYPES = { mole: { name: 'MOLE', pts: 10 }, helmet: { name: 'HARD HAT', pts: 25 }, gold: { name: 'GOLD MOLE', pts: 50 }, hedge: { name: 'HEDGEHOG', pts: -30 } };
// Save keys (all start with the game key, see the HANDOFF file)
const K = { best: 'tavernMoles.best', plays: 'tavernMoles.plays', combo: 'tavernMoles.bestCombo', golds: 'tavernMoles.goldMoles', wins: 'tavernMoles.onlineWins', partyBest: 'tavernMoles.partyBest', medal: 'tavernMoles.medal', mallet: 'tavernMoles.goldMallet', played: 'tavernMoles.played' };
const PREF_KEY = 'tavernMoles.prefs';   // local device settings only (sound, assist), not the shared save
// World skins: the cabinet is the same everywhere, the room takes the world's tavern colours + barkeep (from the design brief).
export const TAVERN_SKINS = {
  meru: { world: 'MERU', room: 'meruTavern', barkeep: 'BARKEEP', wall: '#c8642c', wall2: '#9a4420', wood: '#6b3d22', trim: '#e6b45a', lamp: '#ffb05a', floor: '#7a4a2a', regulars: ['ZIGGY', 'NIX'] },
  gaya: { world: 'GAYA', room: 'gayaTavern', barkeep: 'SORREL', wall: '#b8743a', wall2: '#7c4a26', wood: '#5a3a24', trim: '#e6b45a', lamp: '#ffc070', floor: '#6e4a2e', regulars: ['VOLLEY', 'PIP'] },
  jidda: { world: 'JIDDA', room: 'jTavern', barkeep: 'JAGO', wall: '#2f6f8a', wall2: '#1f4a5e', wood: '#5a4030', trim: '#f2c46a', lamp: '#ffd08a', floor: '#6a5038', regulars: ['JODY', 'JAMOS'] },
  kufa: { world: 'KUFA', room: 'kufaTavern', barkeep: 'NASRIN', wall: '#c9874a', wall2: '#9a5e2e', wood: '#6a4426', trim: '#2fa39a', lamp: '#ffc070', floor: '#8a5e3a', regulars: ['SURA', 'JIBRIL'] },
  luxor: { world: 'LUXOR', room: 'luxorTavern', barkeep: 'VESTA', wall: '#8a2a2a', wall2: '#5e1a1a', wood: '#3a2420', trim: '#e6b45a', lamp: '#ff7a5a', floor: '#4a3028', regulars: ['MELL', 'BOGE'] },
  nebo: { world: 'NEBO', room: 'neboTavern', barkeep: 'JUNIPER', wall: '#3f6b3a', wall2: '#2a4a26', wood: '#5a4028', trim: '#e6c46a', lamp: '#ffd890', floor: '#6a4e30', regulars: ['BARLEY', 'LINDEN'] },
  ur: { world: 'UR', room: 'urTavern', barkeep: 'SABRA', wall: '#b8583a', wall2: '#86402a', wood: '#5a3626', trim: '#38bdf8', lamp: '#ff9a6a', floor: '#7a4a32', regulars: ['UBARA', 'SHALA'] },
  zion: { world: 'ZION', room: 'zionTavern', barkeep: 'ODESSA', wall: '#a8642e', wall2: '#7a4420', wood: '#5a3a22', trim: '#ffd23a', lamp: '#ffc060', floor: '#6e4628', regulars: ['HOYT', 'SABLE'] },
};
// Barkeep lines: DRAFT for Ben (no whack-a-mole lines exist in the 2D tavern files).
const LINES = {
  intro: ['Moles got into the cabinet again. Knock them back down for me?', 'Sixty seconds. Mind the hedgehog, he bites back.', 'Beat the board and drinks are on the house. Well, the gold is.'],
  great: ['Now THAT is a mallet arm!', 'Ha! The moles are filing a complaint.', 'Put your name on the board, champ.'],
  good: ['Not bad at all. One more round?', 'Steady hands. The gold moles were quick tonight.'],
  low: ['They are faster than they look, eh?', 'Shake it off. Watch for the hard hats, two hits.'],
  hedge: ['Not the hedgehog!', 'Ouch. Leave the spiky one alone!'],
  frenzy: ['FRENZY! Swing, swing, swing!'],
  party: ['Pass it round! Same moles for everyone, so no excuses.'],
  online: ['A crowd! Same board, first mallet wins the mole.'] };

const TAU = Math.PI * 2;
const rr = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
function makeGradient() { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; }
function glowTexture() { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.45)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }

// ---------------- the mole schedule: the same seed gives the same moles on every phone (party turns + online) ----------------
export function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function makeSchedule(seed, len = 60, { assist = false } = {}) {
  const R = mulberry(seed), out = [], free = new Array(9).fill(0); let t = 1.0, id = 0;
  while (t < len - 0.5) {
    const k = t / len, frenzy = t > len - 10, slow = assist ? 1.4 : 1;
    let dur = (1.25 - 0.55 * k) * (frenzy ? 0.85 : 1) * slow;
    const roll = R(), gold = frenzy ? 0.14 : 0.07, hedge = t > 4 ? 0.1 : 0, helmet = t > 8 ? 0.13 : 0;
    const type = roll < gold ? 'gold' : roll < gold + hedge ? 'hedge' : roll < gold + hedge + helmet ? 'helmet' : 'mole';
    if (type === 'gold') dur *= 0.62; if (type === 'helmet') dur *= 1.35; if (type === 'hedge') dur *= 1.1;
    const open = []; for (let i = 0; i < 9; i++) if (free[i] <= t) open.push(i);
    if (open.length) { const hole = open[Math.floor(R() * open.length)]; out.push({ id: id++, hole, type, tUp: +t.toFixed(3), dur: +dur.toFixed(3) }); free[hole] = t + dur + 0.35; }
    let gap = (0.82 - 0.4 * k) * (frenzy ? 0.62 : 1) * (assist ? 1.15 : 1); gap *= 0.75 + R() * 0.5;
    if (R() < (frenzy ? 0.5 : 0.18 * k)) gap *= 0.25;   // doubles: two moles at nearly the same time
    t += gap;
  }
  return out;
}
const mult = streak => Math.min(4, 1 + Math.floor(streak / 5));
const newStats = () => ({ score: 0, streak: 0, best: 0, hits: 0, swings: 0, golds: 0, hedges: 0, helmets: 0 });
export const medalFor = s => MEDALS.find(m => s >= m[1]) || null;

// ---------------- audio: synth only (no files), per-hole notes + stereo for play by ear ----------------
function makeAudio() {
  let ctx = null, master = null, on = true, music = null, musicOn = false, tempo = 1;
  const ensure = () => { if (ctx) return ctx; try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination); } catch (e) { ctx = null; } return ctx; };
  const HOLE_NOTE = [72, 74, 76, 67, 69, 71, 60, 62, 64].map(n => 440 * Math.pow(2, (n - 69) / 12));   // back row high, front row low
  const PAN = [-0.75, 0, 0.75];
  function tone(f, d = 0.12, v = 0.2, type = 'triangle', { pan = 0, slide = 0, at = 0 } = {}) { if (!on || !ensure()) return; const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    let out = g; if (ctx.createStereoPanner && pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; } o.connect(g); out.connect(master); o.start(t); o.stop(t + d + 0.02); }
  function noise(d = 0.1, v = 0.2, { pan = 0, hp = 800 } = {}) { if (!on || !ensure()) return; const t = ctx.currentTime, b = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * d)), ctx.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / ch.length);
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = b; f.type = 'highpass'; f.frequency.value = hp; g.gain.value = v; s.connect(f); f.connect(g); let out = g; if (ctx.createStereoPanner && pan) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); out = p; } out.connect(master); s.start(t); }
  const A = {
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    set on(v) { on = !!v; if (!on) A.musicStop(); }, get on() { return on; },
    pop(h, type) { const f = HOLE_NOTE[h], pan = PAN[h % 3]; if (type === 'gold') { tone(f * 2, 0.18, 0.12, 'sine', { pan }); tone(f * 3, 0.22, 0.08, 'sine', { pan, at: 0.06 }); } else if (type === 'hedge') { tone(f / 2, 0.22, 0.13, 'sawtooth', { pan, slide: 0.8 }); } else if (type === 'helmet') tone(f, 0.14, 0.13, 'square', { pan, slide: 1.2 }); else tone(f, 0.12, 0.16, 'triangle', { pan, slide: 1.35 }); },
    bonk(h, m = 1) { const pan = PAN[h % 3]; tone(260 + m * 40, 0.12, 0.3, 'triangle', { pan, slide: 0.45 }); noise(0.05, 0.14, { pan, hp: 1400 }); },
    clang(h) { const pan = PAN[h % 3]; tone(1320, 0.25, 0.12, 'square', { pan, slide: 0.98 }); tone(1980, 0.2, 0.06, 'sine', { pan }); },
    gold(h) { const pan = PAN[h % 3]; [0, 0.06, 0.12, 0.18].forEach((a, i) => tone(880 * Math.pow(2, [0, 4, 7, 12][i] / 12), 0.2, 0.12, 'sine', { pan, at: a })); },
    ouch(h) { const pan = PAN[h % 3]; tone(180, 0.3, 0.22, 'sawtooth', { pan, slide: 0.6 }); noise(0.12, 0.1, { pan, hp: 300 }); },
    miss(h) { const pan = h == null ? 0 : PAN[h % 3]; tone(110, 0.08, 0.16, 'sine', { pan, slide: 0.7 }); },
    up(n) { tone(660 + n * 80, 0.09, 0.08, 'triangle'); },
    beep(hi) { tone(hi ? 1046 : 523, hi ? 0.32 : 0.12, 0.18, 'square'); },
    bell() { [0, 0.15, 0.3].forEach((a, i) => tone([784, 988, 1175][i], 0.5, 0.14, 'triangle', { at: a })); },
    other(h) { tone(420, 0.06, 0.06, 'triangle', { pan: PAN[h % 3], slide: 0.5 }); },
    musicStart() { if (!on || !ensure() || music) return; musicOn = true; let step = 0; const prog = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 56, 59]], hz = n => 440 * Math.pow(2, (n - 69) / 12);
      const tick = () => { if (!musicOn) return; const ch = prog[Math.floor(step / 8) % 4], s = step % 8; if (s === 0 || s === 4) tone(hz(ch[0] - 12), 0.22, 0.07, 'triangle'); if (s % 2 === 1) tone(hz(ch[(s >> 1) % 3] + 12), 0.1, 0.035, 'square'); step++; music = setTimeout(tick, 150 / tempo); }; tick(); },
    musicTempo(t) { tempo = t; },
    musicStop() { musicOn = false; clearTimeout(music); music = null; tempo = 1; },
  };
  return A;
}

// ---------------- peer to peer: engine/duel-net.js in the repo, or a same-device BroadcastChannel stand-in for testing ----------------
function localNet({ game, code, onJoin, onLeave, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10), ch = new BroadcastChannel('8g-' + game + '-' + code), known = new Set();
  ch.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return;
    if (m.sys === 'join') { if (!known.has(m.from)) { known.add(m.from); onJoin && onJoin(m.from); } ch.postMessage({ from: id, to: m.from, sys: 'here' }); return; }
    if (m.sys === 'here') { if (!known.has(m.from)) { known.add(m.from); onJoin && onJoin(m.from); } return; }
    if (m.sys === 'bye') { known.delete(m.from); onLeave && onLeave(m.from); return; }
    onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => { ch.postMessage({ from: id, sys: 'join' }); onStatus && onStatus('connected'); }, 30);
  return { id, local: true, send(t, d, to) { try { ch.postMessage({ from: id, to: to || null, t, d }); } catch (e) {} }, leave() { try { ch.postMessage({ from: id, sys: 'bye' }); ch.close(); } catch (e) {} } };
}

// ---------------- the cabinet (also usable from a world tavern: buildCabinet(ctx)) ----------------
export const HOLES = (() => { const a = []; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) a.push({ x: (c - 1) * 0.46, z: (r - 1) * 0.4 }); return a; })();   // row 0 = back
export const TOP_Y = 0.95;
export function buildCabinet({ THREE: T = THREE, scene, toon, M, canvasTex: CT = canvasTex, origin = new T.Vector3(), skin = TAVERN_SKINS.meru }) {
  const root = new T.Group(); root.position.copy(origin); scene.add(root);
  const red = toon('#c42d3c'), redD = toon('#8a1d2a'), ink = toon('#201e1d'), gold = toon(skin.trim || '#e6b45a'), panel = toon('#2a2a3a');
  // body + legs
  M(new T.BoxGeometry(1.62, 0.6, 1.4), red, 0, 0.59, 0, root, 0.02);
  M(new T.BoxGeometry(1.66, 0.06, 1.44), gold, 0, 0.27, 0, root, 0.01);
  M(new T.BoxGeometry(1.5, 0.24, 1.28), redD, 0, 0.12, 0, root, 0.015);
  const front = CT(512, 160, (g, w, h) => { g.fillStyle = '#c42d3c'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.font = '900 64px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WHACK-A-MOLE', w / 2, h / 2 + 4); g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); });
  const fp = new T.Mesh(new T.PlaneGeometry(1.4, 0.44), new T.MeshBasicMaterial({ map: front })); fp.position.set(0, 0.6, 0.705); root.add(fp);
  // top with 9 holes (extruded shape)
  const sh = new T.Shape(); sh.moveTo(-0.8, -0.69); sh.lineTo(0.8, -0.69); sh.lineTo(0.8, 0.69); sh.lineTo(-0.8, 0.69); sh.lineTo(-0.8, -0.69);
  HOLES.forEach(h => { const p = new T.Path(); p.absarc(h.x, -h.z, 0.165, 0, TAU, true); sh.holes.push(p); });
  const tg = new T.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false, curveSegments: 20 }); tg.rotateX(-Math.PI / 2);
  const top = M(tg, toon('#2f8a4a'), 0, TOP_Y - 0.06, 0, root, 0); top.receiveShadow = true;
  // rims + dark hole floors
  const rimM = toon('#7a5236'), holeM = new T.MeshBasicMaterial({ color: 0x120c08 });
  const rims = HOLES.map(h => { const r = new T.Mesh(new T.TorusGeometry(0.175, 0.028, 8, 28), rimM); r.rotation.x = Math.PI / 2; r.position.set(h.x, TOP_Y + 0.004, h.z); root.add(r);
    const d = new T.Mesh(new T.CircleGeometry(0.17, 24), holeM); d.rotation.x = -Math.PI / 2; d.position.set(h.x, TOP_Y - 0.05, h.z); root.add(d); return r; });
  // back marquee: sign + LED + chase bulbs
  M(new T.BoxGeometry(0.12, 1.25, 0.12), ink, -0.74, 1.5, -0.66, root, 0.01); M(new T.BoxGeometry(0.12, 1.25, 0.12), ink, 0.74, 1.5, -0.66, root, 0.01);
  M(new T.BoxGeometry(1.62, 0.78, 0.14), panel, 0, 1.92, -0.66, root, 0.02);
  const signTex = CT(512, 160, (g, w, h) => { g.fillStyle = '#1a1a2a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.font = '900 70px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('WHACK', w / 2 - 4, 52); g.fillStyle = '#ec3013'; g.font = '900 54px Archivo, "Arial Black", Arial'; g.fillText('A · MOLE', w / 2, 118); });
  const sign = new T.Mesh(new T.PlaneGeometry(1.44, 0.45), new T.MeshBasicMaterial({ map: signTex })); sign.position.set(0, 2.07, -0.585); root.add(sign);
  const ledC = document.createElement('canvas'); ledC.width = 512; ledC.height = 96; const ledT = new T.CanvasTexture(ledC); ledT.colorSpace = T.SRGBColorSpace;
  const led = new T.Mesh(new T.PlaneGeometry(1.44, 0.27), new T.MeshBasicMaterial({ map: ledT })); led.position.set(0, 1.7, -0.585); root.add(led);
  let ledKey = ''; const ledDraw = (a, b) => { const k = a + '|' + b; if (k === ledKey) return; ledKey = k; const g = ledC.getContext('2d'); g.fillStyle = '#0a1a0e'; g.fillRect(0, 0, 512, 96); g.font = '900 52px "Courier New", monospace'; g.textBaseline = 'middle'; g.fillStyle = '#5cff8a'; g.textAlign = 'left'; g.fillText(String(a), 18, 50); g.textAlign = 'right'; g.fillStyle = '#ffd23a'; g.fillText(String(b), 494, 50); ledT.needsUpdate = true; };
  ledDraw('INSERT', 'FUN');
  const bOn = new T.MeshBasicMaterial({ color: 0xfff2b0 }), bOff = new T.MeshBasicMaterial({ color: 0x8a6a3a }), bulbs = [];
  for (let i = 0; i < 22; i++) { const u = i / 22, per = 2 * (1.5 + 0.7); let d = u * per, x, y; if (d < 1.5) { x = -0.75 + d; y = 2.31; } else if (d < 2.2) { x = 0.75; y = 2.31 - (d - 1.5); } else if (d < 3.7) { x = 0.75 - (d - 2.2); y = 1.61; } else { x = -0.75; y = 1.61 + (d - 3.7); }
    const b = new T.Mesh(new T.SphereGeometry(0.028, 8, 6), bOff); b.position.set(x, y, -0.58); root.add(b); bulbs.push(b); }
  let chase = 0, chaseT = 0; const tickBulbs = (dt, fast) => { chaseT += dt; if (chaseT < (fast ? 0.06 : 0.14)) return; chaseT = 0; chase++; bulbs.forEach((b, i) => b.material = (i + chase) % 3 === 0 ? bOn : bOff); };
  return { root, rims, ledDraw, tickBulbs, sign };
}

// ---------------- the mole rig (one per hole; swaps look for gold / hard hat / hedgehog) ----------------
function moleRig(ST, toon, addOutline) {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const furM = toon('#7a5236'), goldM = toon('#ffc93a', { emissive: new THREE.Color('#7a5a10'), emissiveIntensity: 0.45 }), hedgeM = toon('#8a6a4a');
  const add = (geo, mat, x, y, z, o = 0.012, parent = body) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (o) addOutline(m, o); parent.add(m); return m; };
  const trunk = add(new THREE.CapsuleGeometry(0.125, 0.16, 6, 14), furM, 0, 0, 0, 0.014);
  const belly = add(new THREE.SphereGeometry(0.09, 12, 10), toon('#d9b48a'), 0, -0.03, 0.07, 0); belly.scale.set(1, 1.3, 0.5);
  const muzzle = add(new THREE.SphereGeometry(0.065, 12, 10), toon('#e8c9a0'), 0, 0.07, 0.1, 0.008); muzzle.scale.set(1.15, 0.8, 0.9);
  const nose = add(new THREE.SphereGeometry(0.032, 10, 8), toon('#f06a8a'), 0, 0.1, 0.165, 0.006); nose.userData.m = nose.material;
  const teeth = add(new THREE.BoxGeometry(0.04, 0.03, 0.01), toon('#ffffff'), 0, 0.03, 0.155, 0.004);
  const eyeM = toon('#120c08'), eyes = [-1, 1].map(s => { const e = add(new THREE.SphereGeometry(0.022, 10, 8), eyeM, s * 0.055, 0.14, 0.105, 0); const gl = new THREE.Mesh(new THREE.SphereGeometry(0.007, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); gl.position.set(0.006, 0.008, 0.017); e.add(gl); return e; });
  const ears = [-1, 1].map(s => add(new THREE.SphereGeometry(0.035, 8, 6), toon('#5a3a26'), s * 0.1, 0.19, 0.0, 0.006));
  const paws = [-1, 1].map(s => { const p = add(new THREE.SphereGeometry(0.04, 8, 6), toon('#e8c9a0'), s * 0.12, -0.04, 0.12, 0.006); p.scale.set(1.2, 0.7, 1); return p; });
  // hard hat
  const helmet = new THREE.Group(); helmet.position.y = 0.17; body.add(helmet);
  add(new THREE.SphereGeometry(0.135, 16, 10, 0, TAU, 0, Math.PI / 2), toon('#ffd23a'), 0, 0, 0, 0.01, helmet);
  add(new THREE.CylinderGeometry(0.17, 0.17, 0.015, 20), toon('#f2b81a'), 0, 0.002, 0.02, 0.006, helmet);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 10), new THREE.MeshBasicMaterial({ color: 0xfff6c0 }), 0, 0.08, 0.11, 0, helmet).rotation.x = Math.PI / 2;
  // hedgehog spikes (one merged mesh)
  const spikeGeo = (() => { const parts = []; for (let i = 0; i < 26; i++) { const a = (i * 2.399) % TAU, yy = 0.2 - (i / 26) * 0.32, rad = 0.13, c = new THREE.ConeGeometry(0.03, 0.11, 5).toNonIndexed(); const m = new THREE.Matrix4(), q = new THREE.Quaternion(), dir = new THREE.Vector3(Math.cos(a) * 0.8, 0.55 + (yy > 0 ? 0.3 : 0), Math.sin(a) * 0.8 - 0.55).normalize(); q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); m.compose(new THREE.Vector3(Math.cos(a) * rad * 0.8, yy, Math.sin(a) * rad * 0.8 - 0.05), q, new THREE.Vector3(1, 1, 1)); c.applyMatrix4(m); parts.push(c); }
    const n = parts.reduce((s, p) => s + p.attributes.position.count, 0), pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0; parts.forEach(p => { pos.set(p.attributes.position.array, o * 3); nor.set(p.attributes.normal.array, o * 3); o += p.attributes.position.count; });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return geo; })();
  const spikes = new THREE.Mesh(spikeGeo, toon('#3a2a1e')); body.add(spikes);
  // dizzy stars
  const stars = new THREE.Group(); stars.position.y = 0.32; body.add(stars);
  for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(0.03, 0), new THREE.MeshBasicMaterial({ color: 0xffd23a })); s.position.set(Math.cos(i * TAU / 3) * 0.12, 0, Math.sin(i * TAU / 3) * 0.12); stars.add(s); }
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.205, 0.275, 32), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.95, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.visible = false;
  function look(type) { trunk.material = type === 'gold' ? goldM : type === 'hedge' ? hedgeM : furM; helmet.visible = type === 'helmet'; spikes.visible = type === 'hedge'; teeth.visible = type !== 'hedge'; nose.material = type === 'hedge' ? eyeM : nose.userData.m; ears.forEach(e => e.visible = type !== 'hedge'); body.rotation.set(0, 0, 0); body.scale.set(1, 1, 1); stars.visible = false; eyes.forEach(e => e.scale.set(1, 1, 1)); }
  return { g, body, helmet, spikes, stars, eyes, ring, look };
}

// ---------------- THE GAME ----------------
export async function createWhackAMole({ container, onState = () => {}, opts = {} }) {
  const qs = new URLSearchParams(location.search);
  const worldKey = (opts.world || qs.get('world') || 'meru').toLowerCase(), skin = TAVERN_SKINS[worldKey] || TAVERN_SKINS.meru;
  const touch = matchMedia('(pointer: coarse)').matches || /[?&]phone=/.test(location.search);
  const CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.6 : 2)); renderer.setSize(CW(), CH()); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;-webkit-tap-highlight-color:transparent'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1a0f0a'); scene.fog = new THREE.Fog(0x2a160c, 9, 18);
  const camera = new THREE.PerspectiveCamera(48, CW() / CH(), 0.05, 60);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.02, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const audio = makeAudio();
  try { const p = JSON.parse(localStorage.getItem(PREF_KEY) || '{}'); audio.on = p.sound !== false; var assistPref = !!p.assist; } catch (e) { var assistPref = false; }
  const savePrefs = () => { try { localStorage.setItem(PREF_KEY, JSON.stringify({ sound: audio.on, assist: G.assist })); } catch (e) {} };

  // ---------- lights ----------
  scene.add(new THREE.HemisphereLight(0xffe8c8, 0x6a4a3a, 1.25));
  const sun = new THREE.DirectionalLight(0xffe0b8, 1.35); sun.position.set(2.5, 6, 4); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); scene.add(sun);
  const lampL = new THREE.PointLight(skin.lamp, 6, 7, 1.6); lampL.position.set(0, 3.1, 0.2); scene.add(lampL);

  // ---------- the tavern corner ----------
  const plank = canvasTex(256, 256, (g, w, h) => { g.fillStyle = skin.floor; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(0,0,0,${0.05 + (i % 3) * 0.04})`; g.fillRect(0, i * 32, w, 30); g.fillStyle = 'rgba(30,15,5,0.55)'; g.fillRect(0, i * 32 + 30, w, 2); g.fillRect(((i * 97) % 200) + 20, i * 32, 2, 30); } }, [6, 6]);
  { const f = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshToonMaterial({ map: plank, gradientMap: grad })); f.rotation.x = -Math.PI / 2; f.receiveShadow = !touch; scene.add(f); }
  const wallT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = skin.wall; g.fillRect(0, 0, w, h); for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(0,0,0,${Math.random() * 0.06})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); } }, [3, 1]);
  const wallM = new THREE.MeshToonMaterial({ map: wallT, gradientMap: grad }), wood = toon(skin.wood), woodD = toon('#3a2214'), trim = toon(skin.trim);
  M(new THREE.BoxGeometry(14, 4.2, 0.2), wallM, 0, 2.1, -4.2, null, 0); M(new THREE.BoxGeometry(14, 1.1, 0.24), toon(skin.wall2), 0, 0.55, -4.08, null, 0); M(new THREE.BoxGeometry(14, 0.08, 0.3), trim, 0, 1.12, -4.05, null, 0);
  M(new THREE.BoxGeometry(0.2, 4.2, 10), wallM, -5.2, 2.1, 0.8, null, 0); M(new THREE.BoxGeometry(0.24, 1.1, 10), toon(skin.wall2), -5.08, 0.55, 0.8, null, 0);
  M(new THREE.BoxGeometry(0.2, 4.2, 10), wallM, 5.2, 2.1, 0.8, null, 0); M(new THREE.BoxGeometry(0.24, 1.1, 10), toon(skin.wall2), 5.08, 0.55, 0.8, null, 0);
  for (const x of [-3.6, -1.2, 1.2, 3.6]) M(new THREE.BoxGeometry(0.22, 0.22, 10.4), woodD, x, 4.05, 0.6, null, 0);
  // bar counter (back left) + shelf of bottles
  M(new THREE.BoxGeometry(3.4, 1.05, 0.7), wood, -3.1, 0.525, -2.6, null, 0.02); M(new THREE.BoxGeometry(3.6, 0.08, 0.85), trim, -3.1, 1.09, -2.6, null, 0.01);
  M(new THREE.BoxGeometry(3.2, 0.06, 0.3), woodD, -3.1, 1.75, -3.95, null, 0.01); M(new THREE.BoxGeometry(3.2, 0.06, 0.3), woodD, -3.1, 2.35, -3.95, null, 0.01);
  ['#2f8a4a', '#c42d3c', '#e6b45a', '#38bdf8', '#7a3a8a', '#2f8a4a', '#f2741f', '#c42d3c', '#e6b45a', '#38bdf8'].forEach((c, i) => { const shelf = i < 5 ? 1.78 : 2.38, x = -4.4 + (i % 5) * 0.62 + (i > 4 ? 0.2 : 0); M(new THREE.CylinderGeometry(0.06, 0.07, 0.3, 8), toon(c), x, shelf + 0.15, -3.92, null, 0.008); M(new THREE.CylinderGeometry(0.025, 0.03, 0.12, 6), toon(c), x, shelf + 0.36, -3.92, null, 0); });
  for (const x of [-4.2, -3.1, -2.0]) { M(new THREE.CylinderGeometry(0.2, 0.18, 0.06, 14), toon('#c42d3c'), x, 0.78, -2.0, null, 0.01); M(new THREE.CylinderGeometry(0.04, 0.05, 0.75, 8), woodD, x, 0.38, -2.0, null, 0); }
  // jukebox (back right)
  { const jb = new THREE.Group(); jb.position.set(3.6, 0, -3.5); scene.add(jb); M(new THREE.BoxGeometry(1.0, 1.6, 0.6), wood, 0, 0.8, 0, jb, 0.02); const arch = M(new THREE.CylinderGeometry(0.5, 0.5, 0.6, 20, 1, false, 0, Math.PI), wood, 0, 1.6, 0, jb, 0.02); arch.rotation.set(Math.PI / 2, 0, Math.PI / 2);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.9), new THREE.MeshBasicMaterial({ map: canvasTex(64, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ff7a1a'); gr.addColorStop(0.5, '#ffd23a'); gr.addColorStop(1, '#ec3013'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.35)'; for (let i = 0; i < 8; i++) g.fillRect(8, 12 + i * 14, w - 16, 5); }) })); glow.position.set(0, 1.05, 0.31); jb.add(glow);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.set(0, 1.2, 0.5); s.scale.setScalar(2.2); jb.add(s); }
  // dartboard on the back wall
  { const t = canvasTex(256, 256, (g) => { const c = 128; const ring = (r, col) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r, 0, 7); g.fill(); }; ring(126, '#201e1d'); for (let i = 0; i < 20; i++) { g.fillStyle = i % 2 ? '#f3ead2' : '#201e1d'; g.beginPath(); g.moveTo(c, c); g.arc(c, c, 100, i / 20 * TAU, (i + 1) / 20 * TAU); g.fill(); } ring(64, '#c42d3c'); ring(56, '#f3ead2'); ring(16, '#2f8a4a'); ring(7, '#c42d3c'); });
    const d = new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), new THREE.MeshBasicMaterial({ map: t })); d.position.set(1.4, 2.0, -4.08); scene.add(d); }
  // barrels + lanterns
  for (const [x, z] of [[4.4, -1.6], [4.0, -0.9]]) { M(new THREE.CylinderGeometry(0.34, 0.34, 0.85, 14), wood, x, 0.425, z, null, 0.02); M(new THREE.TorusGeometry(0.345, 0.025, 6, 20), woodD, x, 0.2, z, null, 0).rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.345, 0.025, 6, 20), woodD, x, 0.65, z, null, 0).rotation.x = Math.PI / 2; }
  const lanterns = [[-2.4, 3.2, -1.2], [2.4, 3.2, -1.2], [0, 3.35, -2.8]].map(([x, y, z]) => { M(new THREE.CylinderGeometry(0.012, 0.012, 0.8, 4), woodD, x, y + 0.55, z, null, 0); const b = M(new THREE.CylinderGeometry(0.13, 0.15, 0.3, 8), toon(skin.lamp, { emissive: new THREE.Color(skin.lamp), emissiveIntensity: 0.9 }), x, y, z, null, 0.01); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(skin.lamp), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.position.set(x, y, z); s.scale.setScalar(1.4); scene.add(s); return s; });
  // world banner over the bar
  { const t = canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#151b3d'; g.fillRect(0, 0, w, h); g.fillStyle = skin.trim; g.font = '900 30px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(skin.world + ' TAVERN', w / 2, h / 2 + 2); }); const b = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.55), new THREE.MeshBasicMaterial({ map: t })); b.position.set(-3.1, 3.1, -4.08); scene.add(b); }

  // ---------- cabinet + moles + mallet ----------
  const cab = buildCabinet({ scene, toon, M, skin });
  const holeW = HOLES.map(h => V3(h.x, TOP_Y, h.z));
  const rigs = HOLES.map((h, i) => { const r = moleRig({}, toon, addOutline); r.g.position.set(h.x, TOP_Y, h.z); r.g.visible = false; scene.add(r.g); r.ring.position.set(h.x, TOP_Y + 0.012, h.z); scene.add(r.ring); return r; });
  const mallet = new THREE.Group(); scene.add(mallet); const malletArm = new THREE.Group(); mallet.add(malletArm);
  M(new THREE.CylinderGeometry(0.025, 0.03, 0.62, 8), toon('#a8792e'), 0, 0, -0.31, malletArm, 0.008).rotation.x = Math.PI / 2;
  const malletHeadM = toon('#c42d3c'), malletHead = M(new THREE.CylinderGeometry(0.095, 0.095, 0.26, 16), malletHeadM, 0, 0, -0.64, malletArm, 0.012); malletHead.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.098, 0.098, 0.03, 16), trim, s * 0.1, 0, -0.64, malletArm, 0).rotation.z = Math.PI / 2;
  mallet.position.set(0, 1.55, 0.95); malletArm.rotation.x = 0.9;
  const mal = { hole: 4, t: 1, pos: V3(0, 1.55, 0.95) };
  const otherFx = [];   // other players' hits (online): coloured rings
  for (let i = 0; i < 6; i++) { const r = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.25, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); r.rotation.x = -Math.PI / 2; scene.add(r); otherFx.push({ m: r, life: 0 }); }

  // ---------- foxes: barkeep + two regulars (fox-kit) ----------
  const barkeep = kit.makeFox({ torso: ['#f3f2f2', '#d9d4ca', '#6b5a48'], outfit: 'vest', look: { ...PLAYER_MALE, fur: '#c9763a', furDark: '#8a4a22' }, eyes: ['#2a1a0a', '#2a1a0a'], mood: 'warm' });
  barkeep.position.set(-3.1, 0, -3.3); barkeep.lookAt(0, 0, 0.8);
  const reg1 = kit.makeFox({ torso: '#2f6d9a', outfit: 'coat', look: { ...PLAYER_FEMALE, fur: '#e8a05a' }, eyes: ['#22c55e', '#22c55e'], mood: 'happy' });
  reg1.position.set(-3.1, 0, -1.1); reg1.lookAt(0, 0, 0);
  const reg2 = kit.makeFox({ torso: '#7a3a8a', outfit: 'tee', look: { ...PLAYER_MALE, fur: '#b8b0a8', furDark: '#7a726a', muzzle: '#f2efea' }, eyes: ['#f2741f', '#f2741f'], mood: 'curious' });
  reg2.position.set(3.0, 0, -1.3); reg2.lookAt(0, 0, 0);
  const foxes = [barkeep, reg1, reg2]; foxes.forEach(f => { f.userData.lookAt = V3(0, TOP_Y, 0); f.scale.multiplyScalar(0.92); });
  barkeep.userData.lookAt = V3(0, 1.2, 1.2);
  const cheer = (mood = 'excited', t = 1.4, hop = true) => { [reg1, reg2].forEach(f => { f.userData.mood = mood; f.userData.moodT = t; if (hop) f.userData.hop = 1; }); };

  // ---------- floating text + bursts ----------
  const floats = []; for (let i = 0; i < 10; i++) { const c = document.createElement('canvas'); c.width = 256; c.height = 96; const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.renderOrder = 40; s.visible = false; s.scale.set(0.6, 0.225, 1); scene.add(s); floats.push({ s, c, t, life: 0 }); }
  let fI = 0; function floatText(p, txt, col = '#ffd23a', big = 1) { const f = floats[fI = (fI + 1) % floats.length], g = f.c.getContext('2d'); g.clearRect(0, 0, 256, 96); g.font = '900 64px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#201e1d'; g.strokeText(txt, 128, 50); g.fillStyle = col; g.fillText(txt, 128, 50); f.t.needsUpdate = true; f.s.position.copy(p); f.s.visible = true; f.life = 1; f.big = big; }
  const sparks = []; for (let i = 0; i < 28; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; scene.add(s); sparks.push({ s, v: V3(), life: 0 }); }
  let sI = 0; function burst(p, col = 0xffd23a, n = 8) { for (let i = 0; i < n; i++) { const k = sparks[sI = (sI + 1) % sparks.length]; k.s.position.copy(p); k.s.material.color.setHex(col); k.v.set(rr(-1.4, 1.4), rr(1, 2.4), rr(-1.4, 1.4)); k.life = 1; k.s.visible = true; } }
  let shake = 0;

  // ---------- camera framing (copied from engine/restaurant-kit.js cameraFit, camera in front of the board) ----------
  const SAFE = { top: 0, bottom: 0, left: 0 }, fitCam = new THREE.PerspectiveCamera(48, 1, 0.05, 60), _p = V3();
  function fitShot(pts, el, yaw = 0, margin = 0.04) { const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const yT = 1 - 2 * SAFE.top / H - margin * 1.2, yB = -1 + 2 * SAFE.bottom / H + margin * 1.2, xR = 1 - margin, xL = -1 + 2 * SAFE.left / W + margin, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)), c = V3(); pts.forEach(p => c.add(p)); c.multiplyScalar(1 / pts.length); const tgt = c.clone();
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.4, hi = 30; for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt }; }
  const shots = new Map();
  function shot(kind) { const W = CW(), H = CH(), port = H > W, k = kind + W + 'x' + H + '|' + SAFE.top + '|' + SAFE.bottom + '|' + SAFE.left; if (shots.has(k)) return shots.get(k); if (shots.size > 40) shots.clear();
    let s; if (kind === 'board') { const pts = []; for (const x of [-0.78, 0.78]) for (const z of [-0.62, 0.68]) pts.push(V3(x, TOP_Y, z)); pts.push(V3(-0.6, TOP_Y + 0.36, -0.42), V3(0.6, TOP_Y + 0.36, -0.42)); const top0 = SAFE.top; if (port) SAFE.top = Math.max(top0, H * 0.26); s = fitShot(pts, port ? 1.08 : 0.74, 0, port ? 0.03 : 0.04); SAFE.top = top0; }
    else { const pts = port ? [V3(-1.4, 0, 0.9), V3(1.4, 0, 0.9), V3(-1.2, 2.45, -0.7), V3(1.2, 2.45, -0.7)] : [V3(-2.2, 0.1, 0.6), V3(2.2, 0.1, 0.6), V3(-1.8, 2.4, -0.7), V3(1.8, 2.4, -0.7), V3(-3.6, 1.9, -3.3)]; s = fitShot(pts, port ? 0.5 : 0.3, port ? -0.3 : -0.32, port ? 0.06 : 0.04); }
    shots.set(k, s); return s; }
  const camPos = V3(0, 3, 6), camLook = V3(0, 1, 0);

  // ---------- state ----------
  const G = { phase: 'intro', mode: 'solo', T: 0, len: MOLES.round, t0: 0, sched: [], next: 0, live: {}, me: newStats(), assist: assistPref, paused: false, flash: null, say: null, sayT: 0, count: 0, frenzy: false,
    party: null, net: null, result: null, lastCount: -1, seed: 1 };
  const NOW = () => performance.now() / 1000;
  const holeState = HOLES.map(() => ({ e: null, st: 'down', k: 0, hitT: 0 }));   // e = schedule entry

  // ---------- HUD out ----------
  let hudT = 0, hudDirty = true;
  function say(line, t = 3.2) { G.say = { who: skin.barkeep, line }; G.sayT = t; barkeep.userData.say = { text: line, t: 0 }; barkeep.userData.talking = true; hudDirty = true; }
  function flash(txt, col = '#ffd23a', t = 1.1) { G.flash = { txt, col, t }; hudDirty = true; }
  function sv() { const d = save.data || {}; return { gold: d.gold || 0, best: save.stat(K.best, 0), combo: save.stat(K.combo, 0), plays: save.stat(K.plays, 0), wins: save.stat(K.wins, 0), mallet: save.flag(K.mallet), medal: save.stat(K.medal, 0) }; }
  function hud() {
    const me = G.me, N = G.net, P = G.party;
    return { phase: G.phase, mode: G.mode, world: skin.world, room: skin.room, barkeep: skin.barkeep, left: clamp(G.len - G.T, 0, G.len), len: G.len, count: G.count, score: me.score, streak: me.streak, mult: mult(me.streak), best: me.best, hits: me.hits, frenzy: G.frenzy, paused: G.paused, assist: G.assist, sound: audio.on,
      flash: G.flash ? { txt: G.flash.txt, col: G.flash.col } : null, say: G.say, save: sv(), result: G.result, touch,
      party: P ? { n: P.n, len: P.len, turn: P.turn, players: P.players.map((p, i) => ({ name: p.name, col: p.col, score: p.done ? p.stats.score : null, done: p.done, now: i === P.turn })) } : null,
      net: N ? { st: N.st, code: N.code, status: N.status, msg: N.msg, ready: N.ready, ping: N.ping, local: !!(N.link && N.link.local), full: N.full, members: members().map((m, i) => ({ id: m.id, me: m.me, ready: !!m.ready, playing: !!m.playing, host: m.id === hostId(false), name: m.me ? 'YOU' : NET_COLS[i][0], col: NET_COLS[i][1] })),
        board: N.match ? N.match.players.map(p => ({ id: p.id, name: p.name, col: p.col, score: (N.match.sc[p.id] || {}).score || 0, me: p.id === N.link.id, gone: !!p.gone })).sort((a, b) => b.score - a.score) : [] } : null };
  }
  const push = () => { hudDirty = false; hudT = 0; try { onState(hud()); } catch (e) {} };

  // ---------- round control ----------
  function resetBoard() { holeState.forEach((h, i) => { h.e = null; h.st = 'down'; h.k = 0; rigs[i].g.visible = false; rigs[i].ring.visible = false; }); G.live = {}; G.next = 0; G.frenzy = false; audio.musicTempo(1); }
  function beginRound({ seed, len, t0 }) { resetBoard(); G.seed = seed; G.len = len; G.sched = makeSchedule(seed, len, { assist: G.mode !== 'online' && G.assist }); G.me = newStats(); G.T = -3; G.t0 = t0 != null ? t0 : NOW() + 3; G.phase = 'count'; G.lastCount = -1; G.result = null; G.paused = false; audio.unlock(); push(); }
  function startSolo() { G.mode = 'solo'; G.party = null; beginRound({ seed: (Math.random() * 1e9) | 0, len: MOLES.round }); say(pick(LINES.intro)); }
  function partySetup() { G.mode = 'party'; G.phase = 'partySetup'; G.party = { n: 2, len: MOLES.partyRound, turn: 0, seed: (Math.random() * 1e9) | 0, players: [] }; partyPlayers(); push(); }
  function partyPlayers() { const P = G.party; P.players = Array.from({ length: P.n }, (_, i) => ({ name: NET_COLS[i][0], col: NET_COLS[i][1], stats: null, done: false })); }
  function partyCount(n) { if (!G.party) return; G.party.n = clamp(n, 2, MAX_PLAYERS); partyPlayers(); push(); }
  function partyLen(s) { if (!G.party) return; G.party.len = s === 60 ? 60 : 30; push(); }
  function partyStart() { const P = G.party; if (!P) return; P.turn = 0; P.seed = (Math.random() * 1e9) | 0; P.players.forEach(p => { p.done = false; p.stats = null; }); G.phase = 'turn'; say(pick(LINES.party)); push(); }
  function turnGo() { const P = G.party; if (!P) return; malletHeadM.color.set(P.players[P.turn].col); beginRound({ seed: P.seed, len: P.len }); }
  function toIntro() { if (G.net && G.net.match) return; resetBoard(); G.phase = 'intro'; G.mode = 'solo'; G.party = null; G.result = null; malletHeadM.color.set('#c42d3c'); audio.musicStop(); push(); }
  function pause(on = !G.paused) { if (G.mode === 'online' || (G.phase !== 'play' && G.phase !== 'count')) return; G.paused = on; if (on) { G.pauseAt = NOW(); audio.musicStop(); } else { G.t0 += NOW() - G.pauseAt; if (G.phase === 'play') audio.musicStart(); } push(); }
  function quitRound() { G.paused = false; if (G.mode === 'party') { G.phase = 'partySetup'; resetBoard(); audio.musicStop(); push(); return; } toIntro(); }

  function endRound() {
    G.phase = 'done'; audio.musicStop(); audio.bell(); resetBoard();
    const me = G.me, acc = me.swings ? Math.round(me.hits / me.swings * 100) : 0;
    if (G.mode === 'solo') {
      const med = medalFor(me.score), gold = Math.min(50, Math.floor(me.score / 40)), xp = Math.floor(me.score / 20), newBest = save.best(K.best, me.score);
      save.best(K.combo, me.best); save.setStat(K.plays, save.stat(K.plays, 0) + 1); save.setStat(K.golds, save.stat(K.golds, 0) + me.golds); save.setFlag(K.played);
      if (gold) save.addGold(gold); if (xp) save.addXp(xp);
      const rank = med ? MEDALS.length - MEDALS.indexOf(med) : 0, unlock = []; if (rank > save.stat(K.medal, 0)) save.setStat(K.medal, rank);
      if (med && med[0] === 'GOLD' && !save.flag(K.mallet)) { save.setFlag(K.mallet); save.give('tavernMolesGoldMallet', 1); unlock.push('THE GOLDEN MALLET · in your bag'); }
      G.result = { kind: 'solo', score: me.score, medal: med ? med[0] : null, medalCol: med ? med[2] : null, gold, xp, newBest, unlock, rows: [['Moles bonked', String(me.hits)], ['Best combo', me.best + ' in a row'], ['Gold moles', String(me.golds)], ['Hedgehogs hit', String(me.hedges)], ['Accuracy', acc + '%']], next: nextMedal(me.score) };
      say(me.score >= MEDALS[1][1] ? pick(LINES.great) : me.score >= MEDALS[2][1] ? pick(LINES.good) : pick(LINES.low), 4);
      if (med) cheer('excited', 2.5);
    } else if (G.mode === 'party') {
      const P = G.party, p = P.players[P.turn]; p.stats = { ...me, acc }; p.done = true; save.best(K.partyBest, me.score);
      if (P.turn < P.n - 1) { P.turn++; G.phase = 'turn'; G.result = { kind: 'turn', score: me.score, who: p.name, col: p.col }; flash(p.name + ' · ' + me.score, p.col, 2); }
      else { const st = P.players.map(q => ({ name: q.name, col: q.col, score: q.stats.score, combo: q.stats.best })).sort((a, b) => b.score - a.score); G.result = { kind: 'party', standings: st, winner: st[0].score === (st[1] || {}).score ? null : st[0].name }; cheer('excited', 2.5); say(G.result.winner ? G.result.winner + ' takes the board!' : 'A tie! Rematch!', 4); }
    }
    malletHeadM.color.set(G.mode === 'party' && G.party && G.phase === 'turn' ? G.party.players[G.party.turn].col : '#c42d3c');
    push();
  }
  const nextMedal = s => { const m = [...MEDALS].reverse().find(x => s < x[1]); return m ? (m[1] - s) + ' more for ' + m[0] : 'Top medal. Can you beat ' + save.stat(K.best, s) + '?'; };

  // ---------- hits ----------
  function scoreHit(stats, e, holeIdx, local) {   // returns { pts, clang, type }  (authority: solo/party = this phone, online = the host)
    const live = G.live[e.id] || (G.live[e.id] = { hits: 0, done: false });
    if (live.done) return null;
    if (e.type === 'hedge') { live.done = true; stats.score = Math.max(0, stats.score - 30); stats.streak = 0; stats.hedges++; return { pts: -30, type: 'hedge' }; }
    if (e.type === 'helmet' && live.hits < 1) { live.hits++; return { clang: true, type: 'helmet' }; }
    live.done = true; stats.streak++; stats.best = Math.max(stats.best, stats.streak); stats.hits++; const m = mult(stats.streak), pts = TYPES[e.type].pts * m; stats.score += pts; if (e.type === 'gold') stats.golds++; if (e.type === 'helmet') stats.helmets++;
    return { pts, type: e.type, m };
  }
  function showHit(holeIdx, r, col) {   // visuals + sound for an awarded hit
    const h = holeState[holeIdx], rig = rigs[holeIdx], p = holeW[holeIdx].clone(); p.y += 0.45;
    if (!r) return;
    if (r.clang) { audio.clang(holeIdx); rig.helmet.visible = false; h.helmetOff = 0.5; burst(p, 0xfff2b0, 6); floatText(p, 'CLANG!', '#ffffff'); h.k = Math.max(h.k, 0.85); return; }
    h.st = 'hit'; h.hitT = 0; rig.stars.visible = r.type !== 'hedge';
    if (r.type === 'hedge') { audio.ouch(holeIdx); floatText(p, '-30', '#ff6a5a', 1.2); flash('OUCH! HEDGEHOG · −30', '#ec3013'); shake = 0.25; cheer('surprised', 1.2, false); if (Math.random() < 0.6) say(pick(LINES.hedge), 2); return; }
    audio.bonk(holeIdx, r.m || 1); if (r.type === 'gold') { audio.gold(holeIdx); burst(p, 0xffd23a, 14); shake = 0.15; flash('GOLD MOLE · +' + r.pts, '#ffd23a'); cheer('excited', 1.2); } else burst(p, 0xffffff, 6);
    floatText(p, '+' + r.pts, col || (r.m > 1 ? ['#ffffff', '#ffd23a', '#ff9a3a', '#ff5a8a'][r.m - 1] : '#ffffff'), r.m);
    if (r.m && r.m > 1 && G.me.streak % 5 === 0 && G.me.streak <= 15 && G.mode !== 'online') { audio.up(r.m); flash('COMBO x' + r.m, '#ffd23a', 0.9); if (r.m >= 3) cheer('excited', 1); }
  }
  function whack(holeIdx) {
    if (G.phase !== 'play' || G.paused || holeIdx == null) return;
    audio.unlock(); mal.hole = holeIdx; mal.t = 0; G.me.swings++;
    const h = holeState[holeIdx], e = h.e, up = e && (h.st === 'rise' || h.st === 'up') && h.k > 0.25;
    if (G.mode === 'online') { const N = G.net; if (up) { rigs[holeIdx].body.scale.set(1.08, 0.82, 1.08); audio.bonk(holeIdx); N.link.send('ev', { k: 'hit', m: e.id, h: holeIdx }); if (iAmHost()) { const me = N.link.id, mid = e.id; setTimeout(() => hostHit(me, mid), Math.min(150, (N.ping || 0) / 2)); } } else { audio.miss(holeIdx); G.me.streak = 0; N.link.send('ev', { k: 'miss' }); if (iAmHost()) hostMiss(N.link.id); } hudDirty = true; return; }
    if (!up) { audio.miss(holeIdx); if (G.me.streak >= 3) flash('MISS · COMBO LOST', '#cfcac4', 0.7); G.me.streak = 0; hudDirty = true; return; }
    showHit(holeIdx, scoreHit(G.me, e, holeIdx, true)); hudDirty = true;
  }

  // ---------- ONLINE (2-5 phones). Lobby + host-decides hits. Message types only 'hi' / 'pg' / 'ev' (same as Skate Park). ----------
  function members() { const N = G.net; if (!N || !N.link) return []; const all = [{ id: N.link.id, j: N.j, ready: N.ready, playing: !!N.match, me: true }, ...Object.entries(N.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, MAX_PLAYERS); }
  function inRoom() { return members().some(m => m.me); }
  function hostId(match = true) { let m = members(); const N = G.net; if (match && N && N.match) m = N.match.players.filter(p => !p.gone).map(p => ({ id: p.id })); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : (N && N.link ? N.link.id : null); }
  const iAmHost = () => !!(G.net && G.net.link && hostId(true) === G.net.link.id);
  function netOpen() { netLeave(); G.net = { st: 'menu', code: '', status: '', msg: '', ready: false, peers: {}, j: 0, ping: null, link: null, match: null, seen: {} }; G.phase = 'online'; G.mode = 'online'; push(); }
  function netCreate() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; return netJoin(k); }
  async function netJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (!G.net) netOpen(); const N = G.net; if (code.length < 4) { N.msg = 'Type the 4-letter room code from your friend.'; push(); return; }
    if (N.link) { N.link.leave(); N.link = null; } Object.assign(N, { st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '', seen: {}, match: null, full: false }); push(); audio.unlock();
    const tok = N.tok = (N.tok || 0) + 1, cb = { game: MOLES.key, code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => netMsg(t, d, id), onStatus: s => { if (G.net) { G.net.status = s; push(); } } };
    let link = null; if (!/[?&]localnet=1/.test(location.search)) { try { const mod = await import(new URL('../../engine/duel-net.js', import.meta.url).href); link = await mod.connectDuel(cb); } catch (e) { link = null; } }
    if (!link) { try { link = localNet(cb); N.msg = 'Test link: works between tabs on THIS device only. In the game, engine/duel-net.js connects phones.'; } catch (e) { N.status = 'offline'; N.msg = 'Online play could not load. Check your connection.'; push(); return; } }
    if (tok !== N.tok || G.net !== N) { link.leave(); return; } N.link = link; hello(); push();
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(N.timer); N.timer = setInterval(netTick, 1000);
  }
  function netLeave() { const N = G.net; if (!N) return; clearInterval(N.timer); if (N.link) { N.link.send('ev', { k: 'bye' }); N.link.leave(); } G.net = null; try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} }
  function netBack() { const N = G.net; if (N && N.st === 'room') { netLeave(); netOpen(); return; } netLeave(); toIntro(); }
  function hello(to) { const N = G.net; if (!N || !N.link) return; N.link.send('hi', { v: 1, j: N.j, ready: N.ready, playing: !!N.match }, to); }
  function gone(id) { const N = G.net; if (!N || !N.seen[id]) return; delete N.seen[id]; delete N.peers[id]; if (N.match) { const p = N.match.players.find(q => q.id === id); if (p) { p.gone = true; flash(p.name + ' LEFT', p.col, 1.4); } } push(); }
  function netTick() { const N = G.net; if (!N || !N.link) return; N.link.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(N.seen)) if (now - N.seen[id] > 25000) gone(id); N.full = !inRoom() && members().length >= MAX_PLAYERS; }
  function netReady() { const N = G.net; if (!N || !N.link || N.match) return; N.ready = !N.ready; N.link.send('ev', { k: 'ready', on: N.ready }); push(); setTimeout(maybeStart, 0); }
  function maybeStart() { const N = G.net; if (!N || !N.link || N.st !== 'room' || N.match || !inRoom() || hostId(false) !== N.link.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    const d = { k: 'start', delay: 3500, seed: (Math.random() * 1e9) | 0, ids: m.map(x => x.id), mid: (N.mid = (N.mid || 0) + 1) }; N.link.send('ev', d); netStart(d, true); }
  function netStart(d, self) { const N = G.net; if (!N || !N.link || !Array.isArray(d.ids)) return; if (!d.ids.includes(N.link.id)) { N.msg = 'A round started without you. You are in the next one.'; push(); return; }
    const ids = d.ids.slice(0, MAX_PLAYERS); N.match = { players: ids.map((id, i) => ({ id, name: id === N.link.id ? 'YOU' : NET_COLS[i][0], col: NET_COLS[i][1], slot: i })), sc: Object.fromEntries(ids.map(id => [id, newStats()])), claimed: {}, ended: false };
    Object.values(N.peers).forEach(p => { p.ready = false; }); N.ready = false; Object.keys(N.peers).forEach(k => { if (ids.includes(k)) N.peers[k].playing = true; });
    const meSlot = ids.indexOf(N.link.id); malletHeadM.color.set(NET_COLS[meSlot][1]);
    const oneWay = self ? 0 : Math.min(0.4, (N.ping || 80) / 2000); G.mode = 'online'; N.st = 'play'; say(pick(LINES.online));
    beginRound({ seed: d.seed >>> 0, len: MOLES.round, t0: NOW() + d.delay / 1000 - oneWay }); }
  function hostHit(by, mid) { const N = G.net, X = N && N.match; if (!X || X.ended) return; const e = G.sched[mid]; if (!e) return; const st = X.sc[by]; if (!st) return;
    if (G.T > e.tUp + e.dur + 0.45 || G.T < e.tUp - 0.2) return;   // too late / early
    const r = scoreHit(st, e, e.hole, false); if (!r) return; const d = { k: 'got', m: mid, h: e.hole, by, r, sc: Object.fromEntries(Object.entries(X.sc).map(([id, s]) => [id, { score: s.score, streak: s.streak, best: s.best, hits: s.hits, golds: s.golds, hedges: s.hedges }])) };
    G.net.link.send('ev', d); applyGot(d); }
  function hostMiss(by) { const X = G.net && G.net.match; if (X && X.sc[by]) X.sc[by].streak = 0; }
  function applyGot(d) { const N = G.net, X = N && N.match; if (!X) return; Object.entries(d.sc || {}).forEach(([id, s]) => { X.sc[id] = { ...(X.sc[id] || newStats()), ...s }; }); const me = X.sc[N.link.id]; if (me) Object.assign(G.me, { score: me.score, streak: me.streak, best: me.best, hits: me.hits, golds: me.golds, hedges: me.hedges });
    const p = X.players.find(q => q.id === d.by), mine = d.by === N.link.id, h = holeState[d.h];
    if (!d.r.clang) { G.live[d.m] = { hits: 2, done: true }; X.claimed[d.m] = d.by; } else { const L = G.live[d.m] || (G.live[d.m] = { hits: 0, done: false }); L.hits = Math.max(L.hits, 1); }
    if (h && h.e && h.e.id === d.m) { if (mine) showHit(d.h, d.r); else { showHit(d.h, d.r, p ? p.col : '#fff'); ringFx(d.h, p ? p.col : '#ffffff'); audio.other(d.h); } }
    if (mine && d.r.m > 1 && me && me.streak % 5 === 0 && me.streak <= 15) { audio.up(d.r.m); flash('COMBO x' + d.r.m, '#ffd23a', 0.9); }
    hudDirty = true; }
  function ringFx(hole, col) { const f = otherFx.find(o => o.life <= 0) || otherFx[0]; f.m.material.color.set(col); f.m.position.set(HOLES[hole].x, TOP_Y + 0.02, HOLES[hole].z); f.life = 1; }
  function netEnd() { const N = G.net, X = N && N.match; if (!X || X.ended) return; X.ended = true; resetBoard(); audio.musicStop(); audio.bell();
    const st = X.players.map(p => ({ id: p.id, name: p.name, col: p.col, score: (X.sc[p.id] || {}).score || 0, combo: (X.sc[p.id] || {}).best || 0, me: p.id === N.link.id, gone: p.gone })).sort((a, b) => b.score - a.score);
    const win = st.length > 1 && st[0].score > st[1].score ? st[0] : null, iWon = !!(win && win.me); let gold = 0;
    if (iWon) { gold = 10; save.addGold(gold); save.setStat(K.wins, save.stat(K.wins, 0) + 1); cheer('excited', 2.5); }
    save.setFlag(K.played); G.result = { kind: 'online', standings: st, winner: win ? win.name : null, iWon, gold };
    G.phase = 'done'; N.match = null; N.st = 'room'; N.link.send('ev', { k: 'playing', on: false }); hello(); say(win ? (iWon ? 'Champion of the cabinet!' : win.name + ' takes it!') : 'Dead heat! Again!', 4); push(); }
  function netMsg(t, d, id) { const N = G.net; if (!N || !N.link || !d) return; const now = performance.now(), known = !!N.seen[id];
    if (t === 'hi') { N.seen[id] = now; N.peers[id] = { ...(N.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }; if (!known) setTimeout(() => hello(id), 0); setTimeout(maybeStart, 0); push(); return; }
    if (!known) return; N.seen[id] = now;
    if (t === 'pg') { if (d.t != null) N.link.send('pg', { e: d.t }, id); else if (d.e != null) { N.ping = Math.max(1, Math.round(now - d.e)); } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { N.peers[id].ready = !!d.on; push(); setTimeout(maybeStart, 0); }
    else if (d.k === 'start') netStart(d, false);
    else if (d.k === 'playing') { N.peers[id].playing = !!d.on; push(); }
    else if (d.k === 'bye') gone(id);
    else if (d.k === 'hit') { if (iAmHost()) hostHit(id, +d.m); }
    else if (d.k === 'miss') { if (iAmHost()) hostMiss(id); }
    else if (d.k === 'got') { if (N.match && hostId(true) === id) applyGot(d); }
    else if (d.k === 'end') { if (N.match && d.sc) { Object.entries(d.sc).forEach(([pid, s]) => { N.match.sc[pid] = { ...(N.match.sc[pid] || newStats()), ...s }; }); netEnd(); } } }

  // ---------- input: nearest hole on screen (very forgiving on phones) ----------
  const ray = new THREE.Raycaster();
  function holeAt(cx, cy) { const r = renderer.domElement.getBoundingClientRect(), W = r.width, H = r.height, px = cx - r.left, py = cy - r.top; let best = null, bd = 1e9, gap = 1e9; const scr = holeW.map((p, i) => { const up = holeState[i].st !== 'down' ? 0.2 : 0.05; _p.set(p.x, p.y + up, p.z).project(camera); return [(_p.x + 1) / 2 * W, (1 - _p.y) / 2 * H]; });
    scr.forEach(([x, y], i) => { const d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; best = i; } }); for (let i = 0; i < 9; i++) for (let j = i + 1; j < 9; j++) gap = Math.min(gap, Math.hypot(scr[i][0] - scr[j][0], scr[i][1] - scr[j][1]));
    return bd < gap * 0.75 ? best : null; }
  const onDown = e => { if (G.phase !== 'play') { audio.unlock(); return; } e.preventDefault(); const h = holeAt(e.clientX, e.clientY); if (h == null) { audio.miss(null); return; } whack(h); };
  renderer.domElement.addEventListener('pointerdown', onDown, { passive: false });
  const KEYS = { Numpad7: 0, Numpad8: 1, Numpad9: 2, Numpad4: 3, Numpad5: 4, Numpad6: 5, Numpad1: 6, Numpad2: 7, Numpad3: 8, Digit7: 0, Digit8: 1, Digit9: 2, Digit4: 3, Digit5: 4, Digit6: 5, Digit1: 6, Digit2: 7, Digit3: 8, KeyQ: 0, KeyW: 1, KeyE: 2, KeyA: 3, KeyS: 4, KeyD: 5, KeyZ: 6, KeyX: 7, KeyC: 8 };
  const onKey = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.code === 'Escape' || e.code === 'KeyP') { pause(); return; } if (e.repeat) return; const h = KEYS[e.code]; if (h != null && G.phase === 'play') { e.preventDefault(); whack(h); } };
  addEventListener('keydown', onKey);

  // ---------- loop ----------
  const clock = new THREE.Clock(); let raf = 0, alive = true, idleT = 0, foxT = 0;
  function step() {
    if (!alive) return; raf = requestAnimationFrame(step); const dt = Math.min(0.05, clock.getDelta()); idleT += dt;
    if (renderer.domElement.width !== Math.floor(CW() * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(CH() * renderer.getPixelRatio())) { renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); }
    // round clock
    if ((G.phase === 'count' || G.phase === 'play') && !G.paused) {
      G.T = NOW() - G.t0;
      if (G.phase === 'count') { const c = Math.ceil(-G.T); if (c !== G.lastCount && c <= 3 && c >= 1) { G.lastCount = c; G.count = c; audio.beep(false); hudDirty = true; } if (G.T >= 0) { G.phase = 'play'; G.count = 0; audio.beep(true); audio.musicStart(); flash('GO!', '#22c55e', 0.7); } }
      if (G.phase === 'play') {
        if (!G.frenzy && G.T > G.len - 10) { G.frenzy = true; flash('FRENZY!', '#ff5a8a', 1.3); audio.musicTempo(1.5); if (G.mode !== 'online') say(pick(LINES.frenzy), 2); }
        while (G.next < G.sched.length && G.sched[G.next].tUp <= G.T) { const e = G.sched[G.next++], h = holeState[e.hole]; if (G.live[e.id] && G.live[e.id].done) continue; h.e = e; h.st = 'rise'; h.k = 0; h.helmetOff = 0; rigs[e.hole].look(e.type); rigs[e.hole].g.visible = true; rigs[e.hole].ring.visible = G.assist; rigs[e.hole].ring.material.color.set(e.type === 'hedge' ? '#ec3013' : '#ffd23a'); audio.pop(e.hole, e.type); }
        if (G.T >= G.len) { if (G.mode === 'online') { if (iAmHost() && G.net && G.net.match) { const X = G.net.match; G.net.link.send('ev', { k: 'end', sc: X.sc }); netEnd(); } else if (G.T > G.len + 3) netEnd(); else G.T = Math.min(G.T, G.len); } else endRound(); }
      }
    }
    // moles
    holeState.forEach((h, i) => { const rig = rigs[i]; if (h.st === 'down' || !h.e) return; const e = h.e;
      if (h.st === 'rise') { h.k = Math.min(1, h.k + dt / 0.11); if (h.k >= 1) h.st = 'up'; }
      if (h.st === 'up' && G.phase === 'play' && G.T > e.tUp + e.dur + (h.helmetOff > 0 ? 0.35 : 0)) { h.st = 'sink'; const L = G.live[e.id]; if (G.mode === 'solo' || G.mode === 'party') { if (!(L && L.done) && e.type !== 'hedge' && G.me.streak > 0) { if (G.me.streak >= 3) flash('ONE GOT AWAY', '#cfcac4', 0.7); G.me.streak = 0; hudDirty = true; } } }
      if (h.st === 'hit') { h.hitT += dt; rig.body.scale.set(1 + 0.25 * Math.max(0, 1 - h.hitT * 6), 1 - 0.35 * Math.max(0, 1 - h.hitT * 5), 1 + 0.25 * Math.max(0, 1 - h.hitT * 6)); rig.stars.rotation.y += dt * 9; rig.eyes.forEach(ey => ey.scale.y = 0.2); if (h.hitT > 0.28) h.st = 'sink'; }
      if (h.st === 'sink') { h.k = Math.max(0, h.k - dt / 0.14); if (h.k <= 0) { h.st = 'down'; h.e = null; rig.g.visible = false; rig.ring.visible = false; } }
      const y = -0.42 + 0.49 * (1 - Math.pow(1 - h.k, 3)); rig.body.position.y = y; rig.g.rotation.y = Math.sin(idleT * 3 + i) * 0.12; if (h.st === 'up') { rig.body.scale.x = damp(rig.body.scale.x, 1, 14, dt); rig.body.scale.y = damp(rig.body.scale.y, 1 + Math.sin(idleT * 9 + i) * 0.03, 14, dt); rig.body.scale.z = rig.body.scale.x; }
      if (e.type === 'hedge' && h.st === 'up') rig.spikes.rotation.y = Math.sin(idleT * 12) * 0.08; if (rig.ring.visible) rig.ring.material.opacity = 0.55 + 0.4 * Math.sin(idleT * 10); });
    // mallet
    { const hp = HOLES[mal.hole], playing = G.phase === 'play' || G.phase === 'count'; mal.t += dt; mallet.visible = playing && mal.t < 0.32;
      if (mal.t < 0.3) { mallet.position.set(hp.x, TOP_Y + 0.36, hp.z + 0.62); const sw = mal.t < 0.06 ? 0.9 - (mal.t / 0.06) * 1.0 : mal.t < 0.18 ? -0.1 + ((mal.t - 0.06) / 0.12) * 0.75 : 0.65; malletArm.rotation.x = sw; malletArm.rotation.z = hp.x * -0.3; }
      else { mallet.position.x = damp(mallet.position.x, 0.98, 10, dt); mallet.position.y = damp(mallet.position.y, TOP_Y + 0.05, 10, dt); mallet.position.z = damp(mallet.position.z, 0.95, 10, dt); malletArm.rotation.x = damp(malletArm.rotation.x, 1.25 + Math.sin(idleT * 2) * 0.03, 10, dt); malletArm.rotation.z = damp(malletArm.rotation.z, -0.35, 10, dt); } }
    otherFx.forEach(o => { if (o.life <= 0) return; o.life -= dt * 2.2; o.m.material.opacity = Math.max(0, o.life); o.m.scale.setScalar(1 + (1 - o.life) * 0.6); });
    floats.forEach(f => { if (f.life <= 0) { f.s.visible = false; return; } f.life -= dt * 1.6; f.s.position.y += dt * 0.7; f.s.material.opacity = Math.min(1, f.life * 2); const s = (0.36 + 0.05 * (f.big || 1)) * (1 + Math.max(0, f.life - 0.8) * 1.5); f.s.scale.set(s, s * 0.375, 1); });
    sparks.forEach(k => { if (k.life <= 0) { k.s.visible = false; return; } k.life -= dt * 2.2; k.v.y -= 6 * dt; k.s.position.addScaledVector(k.v, dt); k.s.scale.setScalar(0.12 * k.life + 0.02); k.s.material.opacity = k.life; });
    cab.tickBulbs(dt, G.frenzy && G.phase === 'play'); cab.ledDraw(G.phase === 'play' || G.phase === 'count' ? String(G.me.score).padStart(4, '0') : 'BEST ' + save.stat(K.best, 0), G.phase === 'play' ? Math.ceil(Math.max(0, G.len - G.T)) + 's' : G.phase === 'count' ? 'READY' : G.len + 's');
    lanterns.forEach((s, i) => s.material.opacity = 0.75 + 0.2 * Math.sin(idleT * (2.3 + i) + i * 2));
    // foxes (cheap: animate at ~30 fps on phones)
    foxT += dt; if (!touch || foxT > 1 / 30) { const fdt = foxT; foxT = 0; foxes.forEach(f => { const u = f.userData; if (u.moodT > 0) { u.moodT -= fdt; if (u.moodT <= 0) u.mood = u.base; } kit.animFox(f, fdt, 0); }); }
    if (G.sayT > 0) { G.sayT -= dt; if (G.sayT <= 0) { G.say = null; hudDirty = true; } }
    if (G.flash) { G.flash.t -= dt; if (G.flash.t <= 0) { G.flash = null; hudDirty = true; } }
    // camera
    const close = G.phase === 'play' || G.phase === 'count' || G.phase === 'turn' || (G.phase === 'done' && false), s = shot(close ? 'board' : 'room');
    const k = close ? 6 : 2.2; camPos.x = damp(camPos.x, s.pos.x + (close ? 0 : Math.sin(idleT * 0.15) * 0.25), k, dt); camPos.y = damp(camPos.y, s.pos.y, k, dt); camPos.z = damp(camPos.z, s.pos.z, k, dt); camLook.lerp(s.look, 1 - Math.exp(-k * dt));
    camera.position.copy(camPos); if (shake > 0) { shake -= dt; camera.position.x += rr(-1, 1) * shake * 0.08; camera.position.y += rr(-1, 1) * shake * 0.08; } camera.lookAt(camLook);
    renderer.render(scene, camera);
    hudT += dt; if (hudDirty || hudT > (G.phase === 'play' ? 0.1 : 0.4)) push();
  }
  // first frame: snap the camera
  { const s = shot('room'); camPos.copy(s.pos); camLook.copy(s.look); }
  step(); push(); setTimeout(() => say(pick(LINES.intro), 4), 600);
  const rm = /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) { netOpen(); netJoin(rm[1]); }

  const api = {
    hud, startSolo, partySetup, partyCount, partyLen, partyStart, turnGo, toIntro, pause, quitRound, whack,
    netOpen, netCreate, netJoin, netLeave, netBack, netReady, netRoom() { if (G.net && !G.net.match) { G.phase = 'online'; G.result = null; push(); } },
    setSound(v) { audio.on = v; savePrefs(); if (!v) audio.musicStop(); else if (G.phase === 'play' && !G.paused) audio.musicStart(); push(); },
    setAssist(v) { G.assist = !!v; savePrefs(); push(); },
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    holeAt, get state() { return G; }, schedule: () => G.sched, info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles }),
    destroy() { alive = false; cancelAnimationFrame(raf); audio.musicStop(); netLeave(); removeEventListener('keydown', onKey); renderer.domElement.removeEventListener('pointerdown', onDown); renderer.dispose(); renderer.domElement.remove(); },
  };
  return api;
}
