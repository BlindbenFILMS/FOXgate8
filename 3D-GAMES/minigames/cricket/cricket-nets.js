// 8 GATES — CRICKET NETS [cricketNets]. Indoor cricket in a netted hall that fits inside any building on any world.
// Ben (or Hope, or Noble: FOX SWAP on the HUD) bats against COACH BAILS, bowls to SKIPPER RUSTY, or plays friends.
//   createCricket({ container, onState }) → the engine object the Game HUD drives (melee/range/jump/setStick/setPaused/…)
//   plus the page API: start(mode, opts), menu(), net*(), passGo(), prefs.
// Indoor rules: hit the back net on the full = 6, after a bounce = 4; far side net = 2, near side net = 1;
// out (bowled, caught, caught behind) = −5 runs and you keep batting. Wide = +1 and the ball is bowled again.
// Hope bats with the BELL BALL (blind cricket): bowled underarm along the ground, a rattle you can hear move left/right.
// ONLINE: 2–5 friends (engine/duel-net.js, game 'cricket'); each friend bats one innings while the others take turns
// bowling at them. If duel-net.js is missing, the room works between tabs on one device (TEST · TABS).
// Self-contained on purpose: only vendor/three, fox-kit.js, engine/cast.js, engine/save.js and engine/textures.js.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit } from '../../fox-kit.js';
import { CAST, castKit, loadCastRigs } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { crestTex, canvasTex } from '../../engine/textures.js';

export const GAME_KEY = 'cricketNets';
export const TROPHY_ID = 'cricketNetsTrophy';
export const ITEM_LABELS = { cricketNetsTrophy: 'Cricket Nets Trophy' };
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['VIOLET', '#c4b5fd']];
export const MAX_PLAYERS = 5;
// DRAFT names for Ben: COACH BAILS (bowls to you), SKIPPER RUSTY (bats when you bowl)
export const MODES = [
  { id: 'nets', name: 'THE NETS', sub: '2 OVERS · COACH BAILS BOWLS · LEARN THE SHOTS', overs: 2 },
  { id: 'chase', name: 'RUN CHASE', sub: '3 OVERS · BEAT THE TARGET · TROPHY', overs: 3 },
  { id: 'bowl', name: 'BOWL', sub: '2 OVERS · KEEP SKIPPER RUSTY UNDER 16', overs: 2 },
  { id: 'pass', name: 'PASS & PLAY', sub: '2–5 PLAYERS · ONE PHONE · 1 OVER EACH', overs: 1 },
];

// ---------- small helpers (copied, so this file needs nothing outside the kit) ----------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const smooth = t => t * t * (3 - 2 * t), pick = a => a[Math.floor(Math.random() * a.length)];
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = R => { let u = 0, v = 0; while (!u) u = R(); while (!v) v = R(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); };
const hash01 = (...n) => { let h = 2166136261; for (const x of n) { h ^= Math.round(x * 1000); h = Math.imul(h, 16777619); } return ((h >>> 0) % 10000) / 10000; };
const PREFS_KEY = 'cricketNets.prefs.v1';
const loadPrefs = () => { try { return { assist: false, ring: true, players: 2, onlineOvers: 1, ...JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') }; } catch (e) { return { assist: false, ring: true, players: 2, onlineOvers: 1 }; } };

// ---------- the pitch (metres; a fox is ~1.9 m) ----------
const G = 9.8, Z_REL = -17.2, Z_CONTACT = -0.35, Z_STUMPS = 1.1, Z_BOWL_STUMPS = -18.7, NET_X = 5.2, NET_BACK = -23.5, NET_REAR = 4.2, NET_TOP = 5.6, BALL_R = 0.045;
const ZONE_SPLIT = -9;   // side nets: nearer than this = 1, farther = 2
const FIELD = [{ x: 3.7, z: -5.6, n: 'COVER' }, { x: -3.7, z: -5.6, n: 'MIDWICKET' }, { x: 2.7, z: -14.2, n: 'MID-OFF' }, { x: -2.7, z: -14.2, n: 'MID-ON' }];
const KEEPER = { x: 0.35, z: 3.3 };
// shots: timing windows (s) for PERFECT / GOOD / EDGE
const SHOTS = { drive: { win: [0.04, 0.085, 0.14], label: 'DRIVE' }, loft: { win: [0.032, 0.07, 0.12], label: 'LOFT' }, block: { win: [0.06, 0.12, 0.18], label: 'BLOCK' } };
const CONTACT_LAG = 0.12;   // press → bat meets ball

// A delivery: { x0, lineX, zb, v, turn, kind: 'pace'|'spin'|'yorker'|'bell', seed }. Returns analytic segments.
function buildDelivery(d) {
  const segs = []; let p, v;
  if (d.kind === 'bell') {   // underarm, along the ground (blind cricket): low release, several bounces
    p = new THREE.Vector3(d.x0, 0.55, Z_REL + 0.6); const vz = d.v, T = (0 - p.z) / vz, vx = (d.lineX - p.x) / T; v = new THREE.Vector3(vx, 1.2, vz);
  } else {
    p = new THREE.Vector3(d.x0, 2.15, Z_REL); const vz = d.v, zb = Math.min(d.zb, 3.5), t1 = (zb - p.z) / vz, vx = (d.lineX - p.x) / (0 - p.z) * vz;
    v = new THREE.Vector3(vx, (G * t1 * t1 / 2 - p.y) / t1, vz);
  }
  let t = 0, first = true;
  for (let k = 0; k < 8 && p.z < 6; k++) {
    // time to hit the ground: p.y + v.y τ − g τ²/2 = 0
    const a = G / 2, b = -v.y, c = -p.y, disc = b * b - 4 * a * c, tau = (-b + Math.sqrt(Math.max(0, disc))) / (2 * a);
    segs.push({ t0: t, p: p.clone(), v: v.clone(), dur: tau });
    t += tau; p = p.clone().addScaledVector(v, tau); p.y = 0; const vyAt = v.y - G * tau;
    const e = d.kind === 'bell' ? 0.5 : 0.58, hk = d.kind === 'spin' ? 0.82 : d.kind === 'bell' ? 0.93 : 0.9;
    v = new THREE.Vector3(v.x * hk, -vyAt * e, v.z * hk);
    if (first) { first = false; if (d.turn) v.x += d.turn * v.z / Math.max(1.2, -p.z + 0.6); }
    if (v.y < 0.4) { segs.push({ t0: t, p: p.clone(), v: new THREE.Vector3(v.x, 0, v.z), dur: 9, roll: true }); break; }
  }
  const pos = (tt, out = new THREE.Vector3()) => { let s = segs[0]; for (const q of segs) if (tt >= q.t0) s = q; const u = Math.max(0, tt - s.t0); out.copy(s.p).addScaledVector(s.v, u); if (!s.roll) out.y = s.p.y + s.v.y * u - G * u * u / 2; else out.y = 0; out.y = Math.max(0, out.y) + BALL_R; return out; };
  const timeAtZ = z => { for (const s of segs) { if (s.v.z <= 0) continue; const u = (z - s.p.z) / s.v.z; if (u >= 0 && (u <= s.dur || s.roll)) return s.t0 + u; } return segs[segs.length - 1].t0 + 1; };
  const tc = timeAtZ(Z_CONTACT), ts = timeAtZ(Z_STUMPS), tb = segs.length > 1 ? segs[1].t0 : tc;
  const pc = pos(tc), p0 = pos(timeAtZ(0)), pst = pos(ts);
  const wide = Math.abs(p0.x) > 1.15 || pc.y > 2.0, hitsStumps = Math.abs(pst.x) < 0.13 + BALL_R && pst.y < 0.74;
  return { d, segs, pos, tc, ts, tb, pc, wide, hitsStumps, high: pc.y > 1.9 };
}

// Where a hit ball goes. Deterministic from (contact point, shot, timing) so every phone in a room draws the same flight.
function simShot(pc, shot, del) {
  const k = shot.kind, ae = Math.abs(shot.e), W = SHOTS[k].win, q = ae <= W[0] ? 'perfect' : ae <= W[1] ? 'good' : 'edge';
  let power = q === 'perfect' ? 1 : q === 'good' ? 0.8 : 0.38;
  const h = pc.y; if (h < 0.28) power *= k === 'block' ? 1 : k === 'loft' ? 0.45 : 0.6; else if (h > 1.3 && k === 'drive') power *= 0.8;
  if (del.d.kind === 'spin' && q !== 'perfect') power *= 0.9;
  let ang = clamp(shot.e / 0.12, -1.25, 1.25) * 0.85 + (shot.ax || 0) * 0.42 + clamp(pc.x, -0.8, 0.8) * 0.35;
  let sp, vy;
  if (k === 'block') { sp = 2 + power * 2.5; vy = 0.2; ang *= 0.6; }
  else if (k === 'drive') { sp = 10 + 10 * power; vy = 0.35 + (h > 1 ? 0.9 : 0); }
  else { sp = 9 + 10 * power; vy = 4.0 + 2.9 * power; }
  let edgeBack = false;
  if (q === 'edge' && k !== 'block') { const r = hash01(shot.e, pc.x, pc.y); if (r < 0.3) { edgeBack = true; ang = Math.PI - (r - 0.15) * 3; sp = 7 + r * 8; vy = 1.2 + r * 4; } else { sp *= 0.7; ang += (r - 0.7) * 1.4; vy = k === 'loft' ? 8.5 : 2.4; } }
  ang = edgeBack ? ang : clamp(ang, -1.45, 1.45);
  const p = pc.clone(), v = new THREE.Vector3(Math.sin(ang) * sp, vy, -Math.cos(ang) * sp), path = [], dt = 1 / 120;
  const fl = [...FIELD.map(f => ({ ...f })), { x: 0.6, z: -15.2, n: 'BOWLER' }, { x: KEEPER.x, z: KEEPER.z, n: 'KEEPER', keeper: true }].map(f => ({ ...f, x0: f.x, z0: f.z }));
  let bounced = false, end = null, t = 0;
  for (let i = 0; i < 560 && !end; i++) {
    t += dt; v.y -= G * dt; p.addScaledVector(v, dt);
    if (p.y <= BALL_R) { p.y = BALL_R; if (v.y < -1.2) { v.y = -v.y * 0.42; bounced = true; v.x *= 0.82; v.z *= 0.82; } else { v.y = 0; bounced = true; const s = Math.hypot(v.x, v.z), ns = Math.max(0, s - 5.5 * dt); if (s > 0) { v.x *= ns / s; v.z *= ns / s; } } }
    if (p.y > NET_TOP) { p.y = NET_TOP; v.y = -Math.abs(v.y) * 0.3; v.x *= 0.5; v.z *= 0.5; }
    // fielders chase after a short reaction, then reach
    const hs = Math.hypot(v.x, v.z);
    for (const f of fl) { const react = f.keeper ? 0.12 : f.n === 'BOWLER' ? 0.5 : 0.3; if (t < react) continue; const dx = p.x - f.x, dz = p.z - f.z, dd = Math.hypot(dx, dz), spd = f.keeper ? 2 : f.n === 'BOWLER' ? 1.4 : 3.1; if (dd > 0.01) { const mv = Math.min(dd, spd * dt); f.x += dx / dd * mv; f.z += dz / dd * mv; }
      const grow = Math.min(0.4, (t - react) * 0.6), hd = Math.hypot(p.x - f.x, p.z - f.z);
      const air = !bounced && p.y > 0.45 && p.y < 2.45 && k !== 'block', ground = p.y < 0.55;
      const reach = f.keeper ? 0.85 : air ? 0.62 + grow : (hs > 15 ? 0.38 : hs > 9 ? 0.6 : 0.95) + grow * 0.6;
      if (hd < reach && (air || ground)) {
        if (air) end = { type: 'catch', out: true, how: f.keeper ? 'CAUGHT BEHIND' : 'CAUGHT · ' + f.n, runs: 0, f, t };
        else { const far = Math.hypot(p.x - pc.x, p.z - pc.z) > 9.5; end = { type: 'stop', runs: far ? 1 : 0, how: (far ? 'FIELDED · 1 RUN' : 'FIELDED') + ' · ' + f.n, f, t }; }
        break;
      } }
    if (end) break;
    if (p.z <= NET_BACK) end = { type: 'net', zone: 'back', runs: bounced ? 4 : 6, how: bounced ? 'BACK NET · FOUR' : 'BACK NET ON THE FULL · SIX', t };
    else if (Math.abs(p.x) >= NET_X) end = { type: 'net', zone: 'side', runs: p.z < ZONE_SPLIT ? 2 : 1, how: p.z < ZONE_SPLIT ? 'FAR SIDE NET · 2' : 'SIDE NET · 1', t };
    else if (p.z >= NET_REAR) end = { type: 'net', zone: 'rear', runs: 1, how: 'BEHIND · 1', t };
    else if (bounced && v.y === 0 && Math.hypot(v.x, v.z) < 0.25) { const far = p.z < ZONE_SPLIT; end = { type: 'stop', runs: far ? 1 : 0, how: far ? 'STOPPED DEEP · 1' : k === 'block' ? 'DEFENDED' : 'DOT BALL', t }; }
    if (i % 2 === 0 || end) path.push({ t, x: p.x, y: p.y, z: p.z, f: fl.map(f => [f.x, f.z]) });
  }
  if (!end) end = { type: 'stop', runs: 0, how: 'DOT BALL', t };
  if (end.type === 'net') { p.x = clamp(p.x, -NET_X, NET_X); p.z = clamp(p.z, NET_BACK, NET_REAR); }
  return { q, path, end, edgeBack, power };
}

// ---------- toon + outline (same look as restaurant-kit) ----------
function makeGradient() { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function glowTexture() { return canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }); }

// ---------- sound: tiny synth (no files) ----------
function makeAudio() {
  let ctx = null, master = null, rattle = null;
  const ok = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination); } catch (e) { return false; } } if (ctx.state === 'suspended') ctx.resume(); return true; };
  const noiseBuf = () => { const b = ctx.createBuffer(1, ctx.sampleRate * 1, ctx.sampleRate), d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; return b; };
  let nb = null; const noise = () => (nb = nb || noiseBuf());
  const A = {
    muted: false, unlock: () => ok(),
    tone(f, d = 0.12, v = 0.08, type = 'triangle', pan = 0, when = 0) { if (A.muted || !ok()) return; const t = ctx.currentTime + when, o = ctx.createOscillator(), g = ctx.createGain(), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null; o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0008, t + d); o.connect(g); if (p) { p.pan.value = clamp(pan, -1, 1); g.connect(p); p.connect(master); } else g.connect(master); o.start(t); o.stop(t + d + 0.05); },
    burst(d = 0.08, v = 0.2, f = 1800, q = 1, pan = 0) { if (A.muted || !ok()) return; const t = ctx.currentTime, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + d); s.connect(bp); bp.connect(g); let out = g; if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); out = p; } out.connect(master); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.05); },
    crack(power = 1) { A.burst(0.07, 0.35 * power + 0.1, 2400, 0.8); A.tone(900 + power * 500, 0.06, 0.12, 'square'); },
    thud() { A.burst(0.09, 0.18, 300, 1.5); },
    stumps() { A.burst(0.25, 0.3, 3200, 2); A.tone(1400, 0.1, 0.06, 'square'); A.tone(1100, 0.12, 0.05, 'square', 0, 0.05); },
    cheer(big = 1) { if (A.muted || !ok()) return; const t = ctx.currentTime, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise(); s.loop = true; bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 0.6; g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12 * big, t + 0.25); g.gain.exponentialRampToValueAtTime(0.001, t + 1.6 + big * 0.6); s.connect(bp); bp.connect(g); g.connect(master); s.start(t); s.stop(t + 2.4 + big); },
    groan() { A.tone(330, 0.5, 0.06, 'sawtooth'); A.tone(250, 0.6, 0.05, 'sawtooth', 0, 0.2); },
    rattleTick(pan, v = 0.12) { A.burst(0.025, v, 5200, 3, pan); },
  };
  return A;
}

// ---------- local-tabs room (fallback when engine/duel-net.js isn't there) ----------
function localRoom({ code, onJoin, onLeave, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10), known = new Set(); let bc = null;
  try { bc = new BroadcastChannel('8g-cricket-' + code); } catch (e) { onStatus && onStatus('offline'); return { id, send() {}, leave() {} }; }
  bc.onmessage = ev => { const m = ev.data || {}; if (m.from === id || (m.to && m.to !== id)) return;
    if (m.t === '__join' || m.t === '__here') { if (!known.has(m.from)) { known.add(m.from); onJoin && onJoin(m.from); } if (m.t === '__join') bc.postMessage({ from: id, to: m.from, t: '__here' }); return; }
    if (m.t === '__bye') { known.delete(m.from); onLeave && onLeave(m.from); return; }
    if (!known.has(m.from)) { known.add(m.from); onJoin && onJoin(m.from); }
    onMsg && onMsg(m.t, m.d, m.from); };
  bc.postMessage({ from: id, t: '__join' }); setTimeout(() => onStatus && onStatus('local'), 0);
  return { id, local: true, send(t, d, to) { try { bc.postMessage({ from: id, to: to || null, t, d }); } catch (e) {} }, leave() { try { bc.postMessage({ from: id, t: '__bye' }); bc.close(); } catch (e) {} } };
}
async function connectRoom(o) {
  try { const mod = await import(new URL('engine/duel-net.js', document.baseURI).href); if (mod && mod.connectDuel) return await mod.connectDuel({ game: 'cricket', ...o }); } catch (e) {}
  return localRoom(o);
}

// ---------- deliveries: Coach Bails' bowling + Skipper Rusty's batting brain ----------
function coachDelivery(R, level = 1, bell = false) {
  if (bell) return { x0: 0.35, lineX: clamp(gauss(R) * 0.25 + 0.05, -0.5, 0.6), zb: 0, v: 7.5 + R() * 2 * level, turn: 0, kind: 'bell', seed: Math.floor(R() * 1e9) };
  const kind = R() < 0.18 + level * 0.06 ? 'spin' : R() < 0.12 * level ? 'yorker' : 'pace';
  const v = kind === 'spin' ? 10 + R() * 1.6 : 12.2 + level * 1.9 + R() * 2;
  const zb = kind === 'yorker' ? -0.55 + R() * 0.4 : clamp(-4.8 + gauss(R) * 2.0, -9.5, -1.6);
  const lineX = clamp(0.16 + gauss(R) * 0.3, -0.55, 0.95), turn = kind === 'spin' ? (R() < 0.6 ? -1 : 1) * (0.12 + R() * 0.22) : 0;
  return { x0: 0.32, lineX, zb, v, turn, kind, seed: Math.floor(R() * 1e9) };
}
function cpuShot(del, R) {   // Skipper Rusty decides at release
  const d = del.d, onStumps = Math.abs(del.pc.x) < 0.2, good = d.zb > -6.8 && d.zb < -3.2, york = d.zb > -1.3 && d.zb < 0.6, short = d.zb < -7.5;
  if (Math.abs(del.pc.x) > 0.95 || del.wide) return null;
  let kind = 'drive'; const r = R(); if (york) kind = r < 0.55 ? 'block' : 'drive'; else if (good) kind = r < 0.25 ? 'block' : r < 0.75 ? 'drive' : 'loft'; else kind = r < 0.55 ? 'loft' : 'drive';
  const sd = 0.022 + (good ? 0.018 : 0) + (york ? 0.04 : 0) + (d.kind === 'spin' ? 0.01 : 0) + (onStumps && good ? 0.01 : 0) - (short ? 0.006 : 0);
  if (r > 0.985 && onStumps) return null;   // leaves one he shouldn't
  return { kind, e: gauss(R) * sd, ax: (R() - 0.5) * 1.4, cpu: true };
}
const DEMO_TIPS = ['The ring shrinks onto the ball. Tap 1 DRIVE when it turns green.', '2 LOFT goes in the air: back net on the full = 6. Fielders can catch it.', '3 BLOCK for yorkers at your toes. Safe, few runs.', 'Side nets: near = 1, far = 2. Back net after a bounce = 4.', 'Out = −5 runs and you keep batting. Hold the stick to aim the shot.', 'FOX SWAP: Hope bats with the bell ball, Noble from his chair.'];
export const _sim = { buildDelivery, simShot, coachDelivery, cpuShot, mulberry };
export async function createCricket({ container, onState }) {
  // ---------- stage ----------
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.6 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFSoftShadowMap; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1c2230'); scene.fog = new THREE.Fog('#1c2230', 30, 60);
  const camera = new THREE.PerspectiveCamera(50, CW() / CH(), 0.05, 120);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);
  const audio = makeAudio();

  // lights: a sports hall — cool fill + warm overhead panels
  scene.add(new THREE.HemisphereLight(0xe8f0ff, 0x3a3f4a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.5); sun.position.set(4, 14, 2); sun.target.position.set(0, 0, -9); scene.add(sun.target);
  sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 16, bottom: -16, near: 1, far: 40 }); scene.add(sun);

  // ---------- the hall ----------
  const hall = new THREE.Group(); scene.add(hall);
  const floorTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5b6474'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 32, w, 2); }, [6, 12]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 42), new THREE.MeshToonMaterial({ map: floorTex, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, -0.01, -6); floor.receiveShadow = true; hall.add(floor);
  const turfTex = canvasTex(256, 512, (g, w, h) => { g.fillStyle = '#2e8a4c'; g.fillRect(0, 0, w, h); for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.04)'; g.fillRect(0, i * 32, w, 32); } for (let i = 0; i < 3000; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; g.fillRect(Math.random() * w, Math.random() * h, 1, 2); } });
  const turf = new THREE.Mesh(new THREE.PlaneGeometry(NET_X * 2, NET_REAR - NET_BACK), new THREE.MeshToonMaterial({ map: turfTex, gradientMap: grad })); turf.rotation.x = -Math.PI / 2; turf.position.set(0, 0, (NET_REAR + NET_BACK) / 2); turf.receiveShadow = true; hall.add(turf);
  const pitchTex = canvasTex(128, 1024, (g, w, h) => { g.fillStyle = '#58b06f'; g.fillRect(0, 0, w, h); const zToY = z => (z - 2.6) / (-20.6 - 2.6) * h, line = (z, x0 = 0, x1 = w) => { g.fillRect(x0, zToY(z) - 2, x1 - x0, 4); }; g.fillStyle = '#ffffff'; line(0); line(Z_STUMPS, w * 0.12, w * 0.88); line(-17.6); line(Z_BOWL_STUMPS, w * 0.12, w * 0.88); g.fillRect(w * 0.12, zToY(2.0), 3, zToY(-1.0) - zToY(2.0)); g.fillRect(w * 0.88 - 3, zToY(2.0), 3, zToY(-1.0) - zToY(2.0)); g.fillRect(w * 0.12, zToY(-16.6), 3, zToY(-19.6) - zToY(-16.6)); g.fillRect(w * 0.88 - 3, zToY(-16.6), 3, zToY(-19.6) - zToY(-16.6)); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) g.fillRect(0, i * 26, w, 13); });
  const pitch = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 23.2), new THREE.MeshToonMaterial({ map: pitchTex, gradientMap: grad })); pitch.rotation.x = -Math.PI / 2; pitch.position.set(0, 0.006, (2.6 - 20.6) / 2); pitch.receiveShadow = true; hall.add(pitch);
  // walls + roof beams + light panels
  const wallMat = toon('#e7e2d8'), trimMat = toon('#c42d3c'), inkMat = toon('#201e1d');
  M(new THREE.BoxGeometry(0.3, 8, 41), wallMat, -7.6, 4, -6.2, hall, 0); M(new THREE.BoxGeometry(0.3, 8, 41), wallMat, 7.6, 4, -6.2, hall, 0);
  M(new THREE.BoxGeometry(15.4, 8, 0.3), wallMat, 0, 4, -26.4, hall, 0); M(new THREE.BoxGeometry(15.4, 8, 0.3), wallMat, 0, 4, 14, hall, 0);
  [-7.4, 7.4].forEach(x => M(new THREE.BoxGeometry(0.1, 0.5, 34), trimMat, x, 1.2, -9.5, hall, 0));
  M(new THREE.BoxGeometry(15, 0.5, 0.1), trimMat, 0, 1.2, -26.2, hall, 0);
  for (let z = -24; z <= 12; z += 6) { M(new THREE.BoxGeometry(15, 0.35, 0.35), inkMat, 0, 7.6, z, hall, 0); const pn = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 1.1), new THREE.MeshBasicMaterial({ color: 0xfff6dc })); pn.position.set(-3, 7.35, z + 1.5); hall.add(pn); const pn2 = pn.clone(); pn2.position.x = 3; hall.add(pn2); }
  M(new THREE.BoxGeometry(15.4, 0.2, 41), toon('#3a4150'), 0, 8, -6.2, hall, 0);
  // nets: one grid texture, alpha-tested, on poles
  const netTex = canvasTex(128, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(20,24,30,0.9)'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 16); g.lineTo(w, i * 16); g.stroke(); } });
  netTex.wrapS = netTex.wrapT = THREE.RepeatWrapping;
  const netMat = (rx, ry) => { const t = netTex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide, depthWrite: false, opacity: 0.85 }); };
  const netLen = NET_REAR - NET_BACK, netMid = (NET_REAR + NET_BACK) / 2, nets = {};
  [-1, 1].forEach(s => { const n = new THREE.Mesh(new THREE.PlaneGeometry(netLen, NET_TOP), netMat(netLen * 2, NET_TOP * 2)); n.rotation.y = Math.PI / 2; n.position.set(s * NET_X, NET_TOP / 2, netMid); hall.add(n); nets[s < 0 ? 'L' : 'R'] = n; });
  { const n = new THREE.Mesh(new THREE.PlaneGeometry(NET_X * 2, NET_TOP), netMat(NET_X * 4, NET_TOP * 2)); n.position.set(0, NET_TOP / 2, NET_BACK); hall.add(n); nets.B = n; }
  { const n = new THREE.Mesh(new THREE.PlaneGeometry(NET_X * 2, NET_TOP), netMat(NET_X * 4, NET_TOP * 2)); n.position.set(0, NET_TOP / 2, NET_REAR); n.visible = false; hall.add(n); nets.F = n; }
  { const n = new THREE.Mesh(new THREE.PlaneGeometry(NET_X * 2, netLen), netMat(NET_X * 2, netLen)); n.rotation.x = Math.PI / 2; n.position.set(0, NET_TOP, netMid); hall.add(n); }
  for (let z = NET_BACK; z <= NET_REAR + 0.01; z += netLen / 4) [-1, 1].forEach(s => M(new THREE.CylinderGeometry(0.06, 0.06, NET_TOP, 8), inkMat, s * NET_X, NET_TOP / 2, z, hall, 0));
  // scoring zones painted on the nets' kick boards (indoor cricket)
  const zoneBoard = (txt, sub, col, w) => canvasTex(512, 128, (g, W, H) => { g.fillStyle = col; g.fillRect(0, 0, W, H); g.fillStyle = '#201e1d'; g.fillRect(0, 0, W, 8); g.fillRect(0, H - 8, W, 8); g.font = '900 72px "Archivo","Arial Black",Arial,sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.fillText(txt, 24, H / 2 + 4); g.font = '800 30px "Archivo","Arial Black",Arial,sans-serif'; g.fillText(sub, 24 + g.measureText(txt).width * 2.4 + 20, H / 2 + 2); });
  const board = (tex, w, x, z, ry) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.7), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); b.position.set(x, 0.36, z); b.rotation.y = ry; hall.add(b); return b; };
  [-1, 1].forEach(s => { board(zoneBoard('1', 'RUN', '#7dd3fc'), NET_REAR - ZONE_SPLIT, s * (NET_X - 0.02), (NET_REAR + ZONE_SPLIT) / 2, -s * Math.PI / 2); board(zoneBoard('2', 'RUNS', '#ffd23a'), ZONE_SPLIT - NET_BACK, s * (NET_X - 0.02), (ZONE_SPLIT + NET_BACK) / 2, -s * Math.PI / 2); });
  board(zoneBoard('4', '· 6 ON THE FULL', '#ec3013'), NET_X * 2, 0, NET_BACK + 0.02, 0);
  // live scoreboard on the far wall (above the back net) — redrawn when the score changes
  const sbCanvas = document.createElement('canvas'); sbCanvas.width = 1024; sbCanvas.height = 384; const sbTex = new THREE.CanvasTexture(sbCanvas); sbTex.colorSpace = THREE.SRGBColorSpace;
  const sb = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 2.7), new THREE.MeshBasicMaterial({ map: sbTex })); sb.position.set(0, 5.6, -26.2); hall.add(sb); M(new THREE.BoxGeometry(7.5, 3.0, 0.15), inkMat, 0, 5.6, -26.3, hall, 0);
  let sbKey = '';
  function drawBoard(a, b, c) { const k = a + '|' + b + '|' + c; if (k === sbKey) return; sbKey = k; const g = sbCanvas.getContext('2d'); g.fillStyle = '#0b0a0a'; g.fillRect(0, 0, 1024, 384); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 1024, 14); g.font = '800 44px "Archivo","Arial Black",Arial,sans-serif'; g.fillStyle = '#ffd23a'; g.textBaseline = 'top'; g.fillText(a, 40, 40); g.font = '900 150px "Archivo","Arial Black",Arial,sans-serif'; g.fillStyle = '#ffffff'; g.fillText(b, 40, 100); g.font = '800 44px "Archivo","Arial Black",Arial,sans-serif'; g.fillStyle = '#cfcac4'; g.fillText(c, 40, 290); sbTex.needsUpdate = true; }
  drawBoard('8 GATES CRICKET CLUB', '0 / 0', 'INDOOR NETS');
  // club crest + benches + kit bags outside the side nets (decoration, cheap)
  { const cr = new THREE.Mesh(new THREE.CircleGeometry(1.1, 32), new THREE.MeshBasicMaterial({ map: crestTex('8', '#38bdf8') })); cr.position.set(-7.42, 4.4, -4); cr.rotation.y = Math.PI / 2; hall.add(cr); const c2 = cr.clone(); c2.position.set(7.42, 4.4, -4); c2.rotation.y = -Math.PI / 2; hall.add(c2); }
  [-1, 1].forEach(s => { for (let i = 0; i < 2; i++) { const z = -2 - i * 10; M(new THREE.BoxGeometry(0.5, 0.08, 2.6), toon('#8a5a32'), s * 6.6, 0.45, z, hall, 0.015); M(new THREE.BoxGeometry(0.4, 0.45, 0.08), inkMat, s * 6.6, 0.22, z - 1.1, hall, 0); M(new THREE.BoxGeometry(0.4, 0.45, 0.08), inkMat, s * 6.6, 0.22, z + 1.1, hall, 0); M(new THREE.BoxGeometry(0.4, 0.3, 0.7), toon(i ? '#1e3a8a' : '#c42d3c'), s * 6.6, 0.64, z + 0.4, hall, 0.012); } });

  // ---------- stumps at both ends ----------
  function makeStumps(z) { const g = new THREE.Group(); g.position.set(0, 0, z); const wood = toon('#f2e6c9'), st = [], bails = []; for (let i = -1; i <= 1; i++) { const s = M(new THREE.CylinderGeometry(0.018, 0.018, 0.71, 8), wood, i * 0.11, 0.355, 0, g, 0.008, 0.018); st.push(s); }
    for (let i = 0; i < 2; i++) { const b = M(new THREE.CylinderGeometry(0.01, 0.01, 0.11, 6), toon('#e6b45a'), (i - 0.5) * 0.11, 0.72, 0, g, 0); b.rotation.z = Math.PI / 2; bails.push(b); }
    scene.add(g); return { g, st, bails, fly: null }; }
  const stumpsBat = makeStumps(Z_STUMPS), stumpsBowl = makeStumps(Z_BOWL_STUMPS);
  function knockStumps(S0, dir = -1) { S0.fly = { t: 0, v: S0.bails.map((b, i) => V3(rr(-1.5, 1.5), rr(2.5, 4), dir * rr(1, 2.5) * (i ? 1 : 0.8))), r: S0.st.map(() => rr(-0.6, 0.6)) }; }
  function resetStumps(S0) { S0.fly = null; S0.bails.forEach((b, i) => { b.position.set((i - 0.5) * 0.11, 0.72, 0); b.rotation.set(0, 0, Math.PI / 2); }); S0.st.forEach(s => { s.rotation.set(0, 0, 0); s.position.y = 0.355; }); }

  // ---------- ball, bat, ring ----------
  const ballMat = toon('#c8102e'), bellMat = toon('#ffe14d');
  const ball = M(new THREE.SphereGeometry(BALL_R, 14, 10), ballMat, 0, -5, 0, scene, 0.012, BALL_R); ball.castShadow = true; ball.scale.setScalar(1.7);
  const seam = new THREE.Mesh(new THREE.TorusGeometry(BALL_R * 1.01, 0.006, 4, 18), toon('#f6f3ee')); ball.add(seam);
  const shadowBlob = new THREE.Mesh(new THREE.CircleGeometry(0.07, 14), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35, depthWrite: false })); shadowBlob.rotation.x = -Math.PI / 2; scene.add(shadowBlob);
  const trail = []; for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(0.12); scene.add(s); trail.push(s); }
  const ringTex = canvasTex(128, 128, (g) => { g.strokeStyle = '#ffffff'; g.lineWidth = 9; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke(); });
  const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, color: 0xffffff, transparent: true, depthTest: false, depthWrite: false })); ring.visible = false; ring.renderOrder = 10; scene.add(ring);
  const ringCore = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x22c55e, transparent: true, opacity: 0.6, depthTest: false, depthWrite: false })); ringCore.scale.setScalar(0.22); ringCore.visible = false; ringCore.renderOrder = 9; scene.add(ringCore);
  // bowling target (where the ball should land) + the wobbling "real" spot
  const aimGrp = new THREE.Group(); scene.add(aimGrp); aimGrp.visible = false;
  const aimRing = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 28), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.95, depthWrite: false })); aimRing.rotation.x = -Math.PI / 2; aimRing.position.y = 0.02; aimGrp.add(aimRing);
  const aimDot = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), new THREE.MeshBasicMaterial({ color: 0xec3013, depthWrite: false })); aimDot.rotation.x = -Math.PI / 2; aimDot.position.y = 0.025; scene.add(aimDot); aimDot.visible = false;
  const aimLine = new THREE.Mesh(new THREE.PlaneGeometry(0.04, 1), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.45, depthWrite: false })); aimLine.rotation.x = -Math.PI / 2; aimLine.position.y = 0.015; scene.add(aimLine); aimLine.visible = false;
  // a puff for net hits / dust
  const puffs = []; for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(s); puffs.push({ s, life: 0, v: V3() }); } let puffI = 0;
  const puff = (x, y, z, col = 0xffffff, n = 4, sz = 0.35) => { for (let i = 0; i < n; i++) { const p = puffs[puffI = (puffI + 1) % puffs.length]; p.s.position.set(x + rr(-0.1, 0.1), y + rr(-0.05, 0.1), z + rr(-0.1, 0.1)); p.s.material.color.setHex(col); p.s.scale.setScalar(sz); p.life = 1; p.v.set(rr(-0.6, 0.6), rr(0.3, 1.2), rr(-0.6, 0.6)); } };

  // ---------- the foxes ----------
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const whites = ['#fbfbf7', '#e9e6df', '#c9c3b8'];
  function makeBat() { const g = new THREE.Group(), blade = M(new THREE.BoxGeometry(0.12, 0.6, 0.05), toon('#d9a457'), 0, -0.44, 0, g, 0.016); M(new THREE.BoxGeometry(0.122, 0.22, 0.065), toon('#c48a3e'), 0, -0.54, -0.012, g, 0); g.scale.setScalar(1.25); M(new THREE.CylinderGeometry(0.017, 0.017, 0.3, 8), toon('#201e1d'), 0, -0.02, 0, g, 0.006); M(new THREE.BoxGeometry(0.114, 0.05, 0.047), toon('#c42d3c'), 0, -0.2, 0, g, 0); blade.userData.blade = true; return g; }
  let hero = 'player', batter = null, bat = makeBat(), batPivot = new THREE.Group(); scene.add(batPivot); batPivot.add(bat);
  function heroNow() { try { const v = localStorage.getItem('meru.combatHero.v1'); return v === 'hope' || v === 'noble' ? v : 'player'; } catch (e) { return 'player'; } }
  function buildBatter(h) {
    if (batter) scene.remove(batter); hero = h;
    if (h === 'noble') batter = cast.make('noble');
    else if (h === 'hope') batter = kit.makeFox({ ...CAST.hope, torso: whites, outfit: 'tee', crest: '', mood: 'determined' });   // her cane rests on the bench while she bats
    else batter = kit.makeFox({ ...CAST.player, torso: whites, outfit: 'tee', crest: '', gear: 'none', mood: 'determined', legColor: '#fbfbf7' });
    hideGear(batter); batter.position.set(-0.42, 0, 0.25); batter.rotation.y = Math.PI / 2 + 0.35; scene.add(batter);
  }
  buildBatter(heroNow());
  const coach = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#b85d2a', furDark: '#7a3a17', muzzle: '#f1d3b5', chin: '#f4ece2' }, torso: ['#1e3a8a', '#172c6b', '#0d1a40'], outfit: 'tee', crest: '', gear: 'none', mood: 'happy' }));
  coach.position.set(0.55, 0, -22); coach.rotation.y = 0; scene.add(coach);
  const keeper = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#d9a46a', furDark: '#9a6b3a' }, torso: ['#22c55e', '#178a42', '#0d4d25'], outfit: 'tee', crest: '', gear: 'none', mood: 'neutral' }));
  keeper.position.set(KEEPER.x, 0, KEEPER.z); keeper.rotation.y = Math.PI; scene.add(keeper);
  const FCOL = [['#fbfbf7', '#d9a46a'], ['#fbfbf7', '#8a5a32'], ['#fbfbf7', '#f2741f'], ['#fbfbf7', '#c96a2a']];
  const fielders = FIELD.map((f, i) => { const fx = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: FCOL[i][1] }, torso: ['#e9e6df', '#c9c3b8', '#8a847e'], outfit: 'tee', crest: '', gear: 'none', mood: 'neutral' })); fx.position.set(f.x, 0, f.z); fx.rotation.y = Math.atan2(-f.x, -f.z) + Math.PI; scene.add(fx); fx.userData.home = V3(f.x, 0, f.z); return fx; });
  // CPU batter for BOWL mode (Skipper Rusty) shares the batter spot
  const rusty = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#a8562a', furDark: '#6b3315' }, torso: ['#c42d3c', '#8f1f2b', '#4d1017'], outfit: 'tee', crest: '', gear: 'none', mood: 'determined' }));
  rusty.position.copy(batter.position); rusty.rotation.y = batter.rotation.y; rusty.visible = false; scene.add(rusty);
  // the human bowler (BOWL mode, online when you bowl): Ben in whites at the far end
  const myBowler = hideGear(kit.makeFox({ ...CAST.player, torso: whites, outfit: 'tee', crest: '', gear: 'none', mood: 'determined' })); myBowler.visible = false; scene.add(myBowler);

  // ---------- state ----------
  let prefs = loadPrefs(); audio.muted = !!prefs.muted;
  const savePrefs = () => { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} };
  const S = { phase: 'menu', paused: false, t: 0, stick: { x: 0, y: 0 }, keys: {}, pov: false, camDist: 1, camPitch: 0, flash: null, tip: '', say: null, hudPad: touch };
  let match = null, cur = null;   // cur = the ball in play
  const R0 = mulberry((Date.now() & 0xffffff) ^ 0x51ed);
  const name = p => p ? p.name : '';
  function newPlayer(id, nm, col, extra = {}) { return { id, name: nm, col, runs: 0, outs: 0, balls: 0, fours: 0, sixes: 0, log: [], ...extra }; }
  function batterP() { return match && match.players[match.batIdx]; }
  const ballsPer = () => match.overs * 6;

  // ---------- deliveries ----------
  // ---------- match flow ----------
  function hudItems() { const sv = save.data; return Object.entries(sv.items || {}).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n, label: ITEM_LABELS[id] || id })); }
  function start(mode, opt = {}) {
    audio.unlock(); clearTimeout(S.nextT); S.flash = null; S.tip = ''; cur = null; resetStumps(stumpsBat); resetStumps(stumpsBowl);
    S.demo = !!opt.demo; if (!S.demo && S.autoDemo) { S.auto = null; S.autoDemo = false; }
    const me = { player: 'BEN', hope: 'HOPE', noble: 'NOBLE' }[heroNow()]; buildBatter(heroNow());
    const m = { mode, overs: MODES.find(x => x.id === mode)?.overs || 1, players: [], batIdx: 0, ballNo: 0, over: [], seed: (opt.seed ?? Math.floor(R0() * 1e9)) >>> 0, target: null, done: null, online: mode === 'online' };
    m.R = mulberry(m.seed);
    if (mode === 'nets') m.players = [newPlayer('me', me, '#ffd23a')];
    if (mode === 'chase') { m.players = [newPlayer('me', me, '#ffd23a')]; m.target = 20 + Math.floor(m.R() * 9); }
    if (mode === 'bowl') { m.players = [newPlayer('cpu', 'SKIPPER RUSTY', '#ec3013', { cpu: true })]; m.target = 16; }
    if (mode === 'pass') { const n = clamp(opt.players || prefs.players || 2, 2, MAX_PLAYERS); m.overs = opt.overs || 1; m.players = Array.from({ length: n }, (_, i) => newPlayer('p' + i, NET_COLS[i][0], NET_COLS[i][1])); }
    if (mode === 'online') { m.overs = opt.overs || 1; m.players = opt.players.map(p => newPlayer(p.id, p.name, p.col, { hero: p.hero })); m.netEnd = opt.onEnd; m.seq = 0; m.waitT = 0; }
    match = m; S.phase = mode === 'pass' ? 'pass' : 'intro'; S.introT = 0; layoutForInnings();
    if (mode === 'nets') sayTip('COACH BAILS · Tap 1 DRIVE when the ring turns green.');
    if (mode === 'chase') sayTip('Score ' + m.target + ' in ' + m.overs + ' overs. Out = −5.');
    if (mode === 'bowl') sayTip('Move the yellow ring to aim. 1 PACE · 2 SPIN · 3 YORKER.');
    if (mode === 'online') sayTip(name(batterP()) + ' bats first.');
    if (mode !== 'pass') S.nextT = setTimeout(nextBall, 1400);
    push();
  }
  function sayTip(t) { S.tip = t; }
  function iAmBatter() { const b = batterP(); if (!b || !match) return false; if (match.online) return b.id === net.id; return !b.cpu; }
  function bowlerIdFor(n) { const others = match.players.filter((p, i) => i !== match.batIdx && !p.gone); return others.length ? others[n % others.length].id : null; }
  function iAmBowler() { if (!match) return false; if (match.mode === 'bowl') return true; if (!match.online) return false; return bowlerIdFor(match.ballNo + (match.extraN || 0)) === net.id; }
  function batterHero() { const b = batterP(); if (!match || !b) return 'player'; if (match.online) return b.id === net.id ? heroNow() : (b.hero || 'player'); if (match.mode === 'bowl') return 'player'; return heroNow(); }
  function layoutForInnings() {
    const cpuBat = match && match.mode === 'bowl'; rusty.visible = !!cpuBat; batter.visible = !cpuBat;
    if (match && !cpuBat) { const h = batterHero(); if (h !== hero) buildBatter(h); }
    const bowlMe = match && iAmBowler(); myBowler.visible = !!bowlMe; coach.visible = !bowlMe;
    resetBowler();
  }
  function resetBowler() { const b = bowlerFig(); b.position.set(0.55, 0, -22.4); b.rotation.y = 0; b.userData.run = 0; }
  const bowlerFig = () => myBowler.visible ? myBowler : coach;
  const batFig = () => rusty.visible ? rusty : batter;

  function nextBall() {
    clearTimeout(S.nextT); if (!match || match.done) return;
    if (match.online && cur && !cur.done) return;   // a friend's ball is already on its way: don't wipe it
    const b = batterP();
    if (match.ballNo >= ballsPer() || (match.mode === 'chase' && b.runs >= match.target)) return endInnings();
    resetStumps(stumpsBat); cur = null; S.flash = null; layoutForInnings(); fieldHome();
    if (match.online) { match.waitT0 = performance.now(); if (iAmBowler()) beginAim(); else { S.phase = 'wait'; sayTip(iAmBatter() ? playerName(bowlerIdFor(match.ballNo + (match.extraN || 0))) + ' is bowling to you…' : playerName(bowlerIdFor(match.ballNo + (match.extraN || 0))) + ' bowls to ' + name(b) + '.'); } push(); return; }
    if (match.mode === 'bowl') { beginAim(); push(); return; }
    const del = coachDelivery(match.R, match.mode === 'nets' ? 0.7 : match.mode === 'pass' ? 0.9 : 1.2, hero === 'hope');
    deliver(del); push();
  }
  // AIMING (you bowl)
  function beginAim() { S.phase = 'aim'; S.aim = S.aim || { x: 0.1, z: -4.6 }; S.aimT = 0; aimGrp.visible = true; aimDot.visible = true; aimLine.visible = true; S.bowlKind = null; sayTip(touch ? 'Drag or stick to aim. Bowl when the red dot sits in the ring.' : 'WASD or drag to aim. Bowl (1 · 2 · 3) when the red dot sits in the ring.'); }
  function wobble(kind) { const k = kind === 'spin' ? 0.55 : kind === 'yorker' ? 0.8 : 1, t = S.aimT; return { x: Math.sin(t * 2.4) * 0.2 * k + Math.sin(t * 5.3) * 0.05, z: Math.sin(t * 1.75 + 1) * 0.95 * k }; }
  function bowlNow(kind) {
    if (S.phase !== 'aim') return; const w = wobble(kind), a = S.aim, R = mulberry((Date.now() ^ 0x9e37) >>> 0);
    const bell = batterHero() === 'hope';
    const del = bell ? { x0: 0.35, lineX: clamp(a.x + w.x, -1.5, 1.5), zb: 0, v: kind === 'pace' ? 10 : 8, turn: 0, kind: 'bell', seed: Math.floor(R() * 1e9) }
      : { x0: 0.32, lineX: clamp(a.x + w.x, -1.6, 1.6), zb: kind === 'yorker' ? -0.5 + w.z * 0.5 : clamp(a.z + w.z, -10.5, -0.2), v: kind === 'spin' ? 10.4 : kind === 'yorker' ? 15.5 : 16.5, turn: kind === 'spin' ? -0.28 : 0, kind, seed: Math.floor(R() * 1e9) };
    aimGrp.visible = aimDot.visible = aimLine.visible = false;
    let n = 0; if (match.online) { n = ++match.seq; match.lastBowlN = n; net.room.send('ev', { k: 'bowl', n, bat: match.batIdx, ball: match.ballNo, ex: match.extraN || 0, d: del }); }
    deliver(del, n);
  }
  function deliver(d, n = 0) {
    const del = buildDelivery(d); cur = { del, n, t: -0.95, shot: null, resolved: false, res: null, hit: null, ht: 0, endT: null, remoteRes: null, swingT: null, beeps: [], bowlCam: iAmBowler() && !iAmBatter() };
    S.phase = 'runup'; ball.material = d.kind === 'bell' ? bellMat : ballMat; ball.position.set(0.5, -5, -22);
    if (match.mode === 'bowl') { const R = mulberry(d.seed); cur.shot = cpuShot(del, R); if (cur.shot) cur.shotAt = del.tc - CONTACT_LAG + cur.shot.e; }
    const bh = batterHero(); if (iAmBatter() && (prefs.assist || bh === 'hope')) { const ti = del.tc - CONTACT_LAG; cur.beeps = [ti - 0.6, ti - 0.3, ti].map((t, i) => ({ t, f: i === 2 ? 1320 : 880, done: false })); }
    if (S.demo && match.mode === 'nets') { const R = mulberry(d.seed ^ 0x5eed), k = d.kind === 'yorker' ? 'block' : R() < 0.25 ? 'loft' : 'drive', e = (R() - 0.5) * (R() < 0.8 ? 0.04 : 0.2); S.auto = { kind: k, off: e }; S.autoDemo = true;
      const L = DEMO_TIPS[(match.ballNo + (match.extraN || 0)) % DEMO_TIPS.length]; sayTip('DEMO · ' + L); push(); return; }
    if (iAmBatter()) sayTip(d.kind === 'bell' ? 'Listen: the bell ball rattles toward you. Swing on the high beep.' : d.kind === 'spin' ? 'Spinner! It turns after the bounce.' : d.kind === 'yorker' ? 'Yorker at your toes — BLOCK is safest.' : prefs.assist ? 'Swing on the high beep.' : 'Tap when the ring turns green. Hold the stick to aim.');
    push();
  }
  // ONLINE: the batter's phone owns the score. After every ball it sends the full innings state; everyone adopts it.
  function snapOf() { const b = batterP(); return { runs: b.runs, outs: b.outs, balls: b.balls, fours: b.fours, sixes: b.sixes, log: b.log.slice(-60), ballNo: match.ballNo, extraN: match.extraN || 0, over: match.over.slice() }; }
  function applySnap(s) { const b = batterP(); if (!b || !s) return; Object.assign(b, { runs: s.runs, outs: s.outs, balls: s.balls, fours: s.fours, sixes: s.sixes, log: s.log || b.log }); match.ballNo = s.ballNo; match.extraN = s.extraN; match.over = s.over || match.over; }
  function jumpInnings(bi) { const m = match; clearTimeout(S.nextT); while (m.batIdx < bi) { m.batIdx++; } m.ballNo = 0; m.extraN = 0; m.over = []; m.snap = null; cur = null; S.flash = null; layoutForInnings(); }
  function playerName(id) { const p = match && match.players.find(q => q.id === id); return p ? p.name : '?'; }

  // the human batter swings
  function swing(kind) {
    if (!cur || cur.shot || cur.resolved || !iAmBatter()) return;
    if (S.phase !== 'ball' && S.phase !== 'runup') return;
    const ideal = cur.del.tc - CONTACT_LAG, e = cur.t - ideal;
    if (e < -0.6) return;   // way too early (still in the run-up): ignore, don't waste the swing
    cur.shot = { kind, e, ax: clamp(S.stick.x, -1, 1) }; cur.shotAt = cur.t; cur.swingT = 0; audio.tone(260, 0.06, 0.05, 'triangle');
  }

  function resolveContact() {
    const c = cur, del = c.del; c.resolved = true; const sh = c.shot, inReach = Math.abs(del.pc.x) < 0.98 && del.pc.y < 1.95;
    let res;
    if (del.wide) res = { runs: 1, extra: true, out: false, how: del.high ? 'TOO HIGH · WIDE +1' : 'WIDE +1', type: 'wide' };
    else if (sh && inReach && Math.abs(sh.e) <= SHOTS[sh.kind].win[2]) {
      const sim = simShot(del.pc, sh, del); c.hit = sim; c.ht = 0;
      res = { runs: sim.end.out ? -5 : sim.end.runs, out: !!sim.end.out, how: sim.end.how, type: sim.end.type, q: sim.q };
      audio.crack(sim.q === 'edge' ? 0.3 : sim.power);
    } else if (del.hitsStumps) res = { runs: -5, out: true, how: sh ? 'BOWLED · MISSED IT' : 'BOWLED', type: 'bowled', q: sh ? (sh.e < 0 ? 'early' : 'late') : null };
    else res = { runs: 0, out: false, how: sh ? (sh.e < 0 ? 'TOO EARLY · DOT' : 'TOO LATE · DOT') : 'LEFT ALONE · DOT', type: 'miss', q: sh ? (sh.e < 0 ? 'early' : 'late') : null };
    res.kind = sh ? sh.kind : null;
    c.res = res; c.endT = c.hit ? c.hit.end.t + 0.5 : 1.0;
    if (match.online && iAmBatter()) { net.room.send('ev', { k: 'res', n: c.n || match.seq, bat: match.batIdx, ball: match.ballNo, ex: match.extraN || 0, shot: sh ? { kind: sh.kind, e: sh.e, ax: sh.ax } : null, res }); }
  }
  // spectators (online): apply the batter's result
  function applyRemote(m) {
    if (!cur || cur.resolved) return; const c = cur; c.resolved = true; c.res = m.res; c.shot = m.shot;
    if (m.shot && !['wide', 'bowled', 'miss'].includes(m.res.type)) { const sim = simShot(c.del.pc, m.shot, c.del); c.hit = sim; c.ht = 0; c.t = Math.max(c.t, c.del.tc); c.swingT = 0.12; audio.crack(sim.q === 'edge' ? 0.3 : sim.power); }
    c.endT = c.hit ? c.hit.end.t + 0.5 : 1.0; c.endClock = 0;
  }
  function finishBall() {
    const c = cur, r = c.res, b = batterP(); if (!b) return;
    S.phase = 'result'; c.done = true;
    const snap = match.online && !iAmBatter() && match.snap && match.snap.bat === match.batIdx && match.snap.n >= (c.n || 0) ? match.snap : null;
    if (snap) { applySnap(snap.s); match.snap = null; }
    else if (r.extra) { b.runs += r.runs; match.extraN = (match.extraN || 0) + 1; match.over.push('WD'); }
    else { b.runs += r.runs; b.balls++; match.ballNo++; if (r.out) { b.outs++; match.over.push('W'); } else { match.over.push(r.runs ? String(r.runs) : '·'); if (r.runs === 4) b.fours++; if (r.runs === 6) b.sixes++; } }
    if (match.over.filter(x => x !== 'WD').length > 6) match.over = match.over.slice(-1);
    if (!snap) b.log.push(r.extra ? 'WD' : r.out ? 'W' : String(r.runs));
    if (match.online && iAmBatter() && net.room) net.room.send('ev', { k: 'sync', n: c.n || match.seq, bat: match.batIdx, s: snapOf() });
    const big = r.runs >= 4 && !r.out, mine = iAmBatter(), cpuBat = match.mode === 'bowl';
    const headline = r.out ? 'OUT' : r.type === 'wide' ? 'WIDE' : r.runs === 6 ? 'SIX!' : r.runs === 4 ? 'FOUR!' : r.runs > 0 ? r.runs + (r.runs === 1 ? ' RUN' : ' RUNS') : r.type === 'stop' && r.kind === 'block' ? 'DEFENDED' : 'DOT';
    const col = r.out ? (cpuBat ? '#22c55e' : '#ec3013') : big ? (cpuBat ? '#ec3013' : '#ffd23a') : '#ffffff';
    S.flash = { txt: headline, sub: r.how + (r.out ? ' · −5' : '') + (r.q && !['early', 'late'].includes(r.q) && r.type !== 'wide' ? ' · ' + r.q.toUpperCase() : ''), col, t: 0 };
    if (r.out) { (cpuBat ? audio.cheer(0.7) : audio.groan()); } else if (big) audio.cheer(r.runs === 6 ? 1.4 : 1); else if (r.runs > 0) audio.tone(660, 0.1, 0.05);
    batFig().userData.mood = r.out ? 'sad' : big ? 'excited' : 'determined';
    if (mine && !r.out && r.q === 'edge') sayTip('Edged it. Wait a touch longer… or earlier.');
    else if (mine && r.q === 'early') sayTip('Early — swing a little later.'); else if (mine && r.q === 'late') sayTip('Late — swing a little sooner.');
    else if (mine && r.out && r.type === 'catch') sayTip('Caught! LOFT only when you time it perfectly.');
    else if (mine && r.runs >= 4) sayTip(r.runs === 6 ? 'Back net on the full. Huge.' : 'Into the back net.');
    S.nextT = setTimeout(() => { S.flash = null; if (!match) return; if (match.online && match.ballNo >= ballsPer()) return endInnings(); nextBall(); }, big || r.out ? 1900 : 1300);
    push();
  }
  function endInnings() {
    const m = match, b = batterP(); clearTimeout(S.nextT);
    if (m.mode === 'pass' || m.online) {
      // next batter that is still here
      let nx = m.batIdx + 1; while (nx < m.players.length && m.players[nx].gone) nx++;
      if (nx < m.players.length) { m.batIdx = nx; m.ballNo = 0; m.extraN = 0; m.over = []; cur = null; layoutForInnings(); if (m.mode === 'pass') { S.phase = 'pass'; } else { S.phase = 'intro'; sayTip(name(batterP()) + ' to bat.'); S.nextT = setTimeout(nextBall, 2200); } push(); return; }
    }
    finishMatch();
  }
  function finishMatch() {
    const m = match; S.phase = 'done'; cur = null; const P = m.players, b = P[0]; let done;
    if (S.demo) { S.phase = 'result'; m.done = null; S.flash = { txt: b.runs + ' RUNS', sub: 'DEMO OVER · TAP TO PLAY', col: '#ffd23a', t: 0 }; S.nextT = setTimeout(() => { if (S.demo && match === m) startDemo(); }, 3000); push(); return; }   // the demo never touches the save
    const rowsFor = p => [['RUNS', String(p.runs)], ['OUTS', p.outs + ' × −5'], ['BALLS', String(p.balls)], ['FOURS / SIXES', p.fours + ' / ' + p.sixes]];
    if (m.mode === 'nets') { const best = save.stat('cricketNets.best.nets', 0), nb = save.best('cricketNets.best.nets', b.runs), medal = b.runs >= 26 ? 'GOLD' : b.runs >= 18 ? 'SILVER' : b.runs >= 10 ? 'BRONZE' : ''; const gold = Math.max(0, Math.min(30, Math.floor(b.runs / 2))); if (gold) save.addGold(gold); save.addXp(10); if (medal) save.setFlag('cricketNets.medal');
      done = { kicker: 'THE NETS', title: medal ? medal + ' MEDAL' : 'KEEP PRACTISING', big: String(b.runs), bigLbl: 'RUNS', sub: (nb ? 'NEW BEST' : 'BEST ' + Math.max(best, b.runs)) + (gold ? ' · +' + gold + ' GOLD' : ''), rows: [...rowsFor(b), ['MEDALS', '10 BRONZE · 18 SILVER · 26 GOLD']], win: !!medal }; }
    if (m.mode === 'chase') { const won = b.runs >= m.target; let gold = 0, trophy = false; if (won) { gold = 50; save.addGold(gold); save.addXp(40); save.setStat('cricketNets.wins.chase', save.stat('cricketNets.wins.chase', 0) + 1); if (!save.flag('cricketNets.trophy')) { save.setFlag('cricketNets.trophy'); save.give(TROPHY_ID); trophy = true; } } else save.addXp(10); save.best('cricketNets.best.chase', b.runs);
      done = { kicker: 'RUN CHASE · TARGET ' + m.target, title: won ? 'CHASED IT DOWN' : 'SHORT BY ' + (m.target - b.runs), big: String(b.runs), bigLbl: 'OF ' + m.target, sub: won ? '+' + gold + ' GOLD' + (trophy ? ' · TROPHY WON' : '') : 'TRY AGAIN', rows: rowsFor(b), win: won, trophy }; }
    if (m.mode === 'bowl') { const won = b.runs < m.target; let gold = 0; if (won) { gold = 40; save.addGold(gold); save.addXp(30); save.setStat('cricketNets.wins.bowl', save.stat('cricketNets.wins.bowl', 0) + 1); } else save.addXp(10); save.best('cricketNets.best.bowlWickets', b.outs);
      done = { kicker: 'BOWL · DEFEND ' + m.target, title: won ? 'DEFENDED IT' : 'RUSTY GOT THEM', big: String(b.runs), bigLbl: 'RUSTY SCORED', sub: (won ? '+' + gold + ' GOLD · ' : '') + b.outs + ' WICKET' + (b.outs === 1 ? '' : 'S'), rows: [['RUSTY RUNS', String(b.runs)], ['WICKETS', String(b.outs)], ['BALLS', String(b.balls)], ['FOURS / SIXES', b.fours + ' / ' + b.sixes]], win: won }; }
    if (m.mode === 'pass' || m.online) { const order = P.filter(p => !p.gone || p.balls).slice().sort((a, c) => c.runs - a.runs || a.outs - c.outs), top = order[0], tie = order[1] && order[1].runs === top.runs && order[1].outs === top.outs, meWon = m.online && top && top.id === net.id && !tie;
      if (m.online) { save.addXp(meWon ? 25 : 10); if (meWon) save.setStat('cricketNets.wins.online', save.stat('cricketNets.wins.online', 0) + 1); }
      done = { kicker: m.online ? 'ONLINE · ' + P.length + ' PLAYERS' : 'PASS & PLAY', title: tie ? 'A TIE AT THE TOP' : (m.online && top.id === net.id ? 'YOU WIN' : top.name + ' WINS'), big: String(top.runs), bigLbl: 'TOP SCORE', sub: m.online ? (meWon ? '+25 XP' : '+10 XP') : 'PASS IT ON', rows: [], board: order.map((p, i) => ({ rank: String(i + 1), name: p.name + (m.online && p.id === net.id ? ' · YOU' : ''), col: p.col, runs: String(p.runs), sub: p.outs + ' OUT · ' + p.fours + '×4 · ' + p.sixes + '×6' })), win: m.online ? meWon : true }; }
    m.done = done; if (done.win) audio.cheer(1.2);
    batFig().userData.mood = done.win ? 'excited' : 'sad';
    if (m.online && m.netEnd) m.netEnd();
    push();
  }
  function startDemo() { try { localStorage.setItem('meru.combatHero.v1', 'player'); } catch (e) {} start('nets', { demo: true }); }
  function passGo() { if (!match || S.phase !== 'pass') return; audio.unlock(); S.phase = 'intro'; sayTip(name(batterP()) + ' bats. Tap 1 DRIVE · 2 LOFT · 3 BLOCK.'); buildBatter(heroNow()); S.nextT = setTimeout(nextBall, 900); push(); }
  function toMenu() { clearTimeout(S.nextT); if (S.autoDemo) { S.auto = null; S.autoDemo = false; } S.demo = false; if (match && match.online) netLeave(); match = null; cur = null; S.phase = 'menu'; S.flash = null; rusty.visible = false; batter.visible = true; myBowler.visible = false; coach.visible = true; aimGrp.visible = aimDot.visible = aimLine.visible = false; resetBowler(); push(); }

  function fieldHome() { fielders.forEach(f => { f.position.copy(f.userData.home); f.userData.dive = 0; }); keeper.position.set(KEEPER.x, 0, KEEPER.z); }

  // ---------- ONLINE ROOM (2–5) ----------
  // Room = the 5 earliest joiners; host = lowest id. Host starts the match; each player bats one innings,
  // the others take turns bowling to them. The batter's phone judges the shot and sends the result.
  let net = { id: null, room: null };
  const N = { st: null, code: '', peers: {}, ready: false, j: 0, status: '', msg: '', ping: null, overs: prefs.onlineOvers || 1, lastSeen: {} };
  function members() { if (!net.room) return []; const all = [{ id: net.id, j: N.j, ready: N.ready, playing: S.phase !== 'menu' && !!match && match.online, hero: heroNow(), me: true }, ...Object.entries(N.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, MAX_PLAYERS); }
  const inRoom = () => members().some(m => m.me), hostId = () => { const m = members(); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : net.id; };
  function hello(to) { if (!net.room) return; net.room.send('hi', { v: 1, j: N.j, ready: N.ready, overs: N.overs, oversSet: !!N.oversSet, hero: heroNow(), playing: !!(match && match.online) }, to); }
  async function netJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { N.msg = 'Type the 4-letter room code from your friend.'; push(); return; }
    netLeave(true); Object.assign(N, { st: 'room', code, peers: {}, ready: false, j: Date.now(), status: 'connecting', msg: '', ping: null, lastSeen: {} }); push();
    const tok = N.tok = (N.tok || 0) + 1;
    const room = await connectRoom({ code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => onMsg(t, d, id), onStatus: s => { N.status = s; push(); } });
    if (tok !== N.tok) { room.leave(); return; } net = { id: room.id, room }; if (room.local) N.status = 'local'; hello(); push();
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(N.timer); N.timer = setInterval(tick, 1000);
  }
  function netLeave(keepPanel) { N.tok = (N.tok || 0) + 1; clearInterval(N.timer); if (net.room) { net.room.send('ev', { k: 'bye' }); net.room.leave(); } net = { id: null, room: null }; N.peers = {}; N.lastSeen = {}; N.ready = false; if (!keepPanel) N.st = null;
    try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} push(); }
  function onMsg(t, d, id) {
    if (!net.room || !d) return; const now = performance.now(), known = !!N.lastSeen[id];
    if (t === 'hi') { N.lastSeen[id] = now; N.peers[id] = { ...(N.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready, hero: d.hero, playing: !!d.playing }; if (d.oversSet && !N.oversSet && +d.j < N.j) N.overs = clamp(+d.overs || 1, 1, 3); if (!known) setTimeout(() => hello(id), 0); setTimeout(maybeStart, 0); push(); return; }
    if (!known) return; N.lastSeen[id] = now;
    if (t === 'pg') { if (d.t != null) net.room.send('pg', { e: d.t }, id); else if (d.e != null) { N.ping = Math.max(1, Math.round(now - d.e)); push(); } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { N.peers[id] = { ...(N.peers[id] || {}), ready: !!d.on }; setTimeout(maybeStart, 0); push(); }
    else if (d.k === 'overs') { N.overs = clamp(+d.m || 1, 1, 3); N.oversSet = true; N.ready = false; Object.values(N.peers).forEach(p => p.ready = false); push(); }
    else if (d.k === 'start') netStart(d);
    else if (d.k === 'playing') { N.peers[id] = { ...(N.peers[id] || {}), playing: !!d.on }; push(); }
    else if (d.k === 'bye') gone(id);
    else if (match && match.online && match.ids.includes(id)) inMatch(d, id);
  }
  function gone(id) { if (!N.lastSeen[id]) return; delete N.lastSeen[id]; delete N.peers[id]; if (match && match.online) { const p = match.players.find(q => q.id === id); if (p && !p.gone) { p.gone = true; sayTip(p.name + ' left the nets.'); const bi = match.players.indexOf(p); if (bi === match.batIdx && S.phase !== 'done') { cur = null; endInnings(); } else if (S.phase === 'wait' && !match.players.some(q => !q.gone && q.id !== batterP().id)) finishMatch(); } } push(); }
  function tick() { if (!net.room) return; net.room.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(N.lastSeen)) if (now - N.lastSeen[id] > 25000) gone(id); }
  function maybeStart() { if (!net.room || N.st !== 'room' || !inRoom() || hostId() !== net.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    const d = { k: 'start', ids: m.map(x => x.id), heroes: m.map(x => x.hero || 'player'), overs: N.overs, seed: Math.floor(Math.random() * 1e9) }; net.room.send('ev', d); netStart(d); }
  function netStart(d) {
    if (!Array.isArray(d.ids) || !d.ids.includes(net.id)) { N.msg = 'A match started without you. You join the next one.'; push(); return; }
    N.st = 'play'; N.ready = false; Object.values(N.peers).forEach(p => p.ready = false);
    const players = d.ids.map((id, i) => ({ id, name: d.ids.length > 2 ? NET_COLS[i][0] : id === net.id ? 'YOU' : 'RIVAL', col: NET_COLS[i][1], hero: (d.heroes || [])[i] }));
    players.forEach(p => { if (d.ids.length > 2 && p.id === net.id) p.name = p.name; });
    start('online', { players, overs: d.overs, seed: d.seed, onEnd: () => { N.st = 'room'; if (net.room) net.room.send('ev', { k: 'playing', on: false }); } }); match.ids = d.ids.slice();
    net.room.send('ev', { k: 'playing', on: true });
  }
  function inMatch(d, id) {
    if (match.done) return;
    if (d.bat != null && d.bat < match.batIdx) return;   // from an innings that is already over here
    if (d.k === 'bowl') { if (d.n <= (match.lastBowlN || 0)) return; match.lastBowlN = d.n; match.seq = Math.max(match.seq, d.n);
      if (d.bat != null && d.bat > match.batIdx) jumpInnings(d.bat);
      clearTimeout(S.nextT); if (cur && cur.resolved && !cur.done) { finishBall(); clearTimeout(S.nextT); }   // finish the last ball first (slow phone)
      S.flash = null; if (S.phase === 'aim') { aimGrp.visible = aimDot.visible = aimLine.visible = false; } deliver(d.d, d.n); push(); }
    else if (d.k === 'res') { if (iAmBatter() || !cur || cur.resolved || cur.done || (d.n && cur.n && d.n !== cur.n)) return; if (cur.t < cur.del.tc) cur.pendingRes = d; else applyRemote(d); }
    else if (d.k === 'sync') { if (iAmBatter() || d.bat !== match.batIdx) return; if (cur && !cur.done && (cur.n || 0) === d.n) match.snap = d; else { applySnap(d.s); push(); } }
  }
  function netReady() { if (!net.room) return; N.ready = !N.ready; net.room.send('ev', { k: 'ready', on: N.ready }); setTimeout(maybeStart, 0); push(); }
  function netOvers(n) { N.overs = clamp(n, 1, 3); N.oversSet = true; N.ready = false; Object.values(N.peers).forEach(p => p.ready = false); prefs.onlineOvers = N.overs; savePrefs(); if (net.room) net.room.send('ev', { k: 'overs', m: N.overs }); push(); }
  function netOpen() { Object.assign(N, { st: 'menu', code: '', msg: '' }); push(); }
  function netCreate() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; netJoin(k); }
  function netClose() { if (net.room) netLeave(); N.st = null; push(); }
  function netAgain() { if (members().length >= 2) { match = null; S.phase = 'menu'; N.st = 'room'; netReady(); } }

  // ---------- input ----------
  function act(n) {
    audio.unlock(); if (S.paused) return; if (S.demo) { toMenu(); return; }
    if (S.phase === 'aim') { bowlNow(n === 1 ? 'pace' : n === 2 ? 'spin' : 'yorker'); return; }
    if (S.phase === 'pass') { passGo(); return; }
    swing(n === 1 ? 'drive' : n === 2 ? 'loft' : 'block');
  }
  const ray = new THREE.Raycaster(), groundPl = new THREE.Plane(V3(0, 1, 0), 0), ndc = new THREE.Vector2(), hitP = V3();
  function pointerAim(e) { if (S.phase !== 'aim') return false; const r = renderer.domElement.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); if (!ray.ray.intersectPlane(groundPl, hitP)) return false; S.aim = { x: clamp(hitP.x, -1.4, 1.4), z: clamp(hitP.z, -10, -0.4) }; return true; }
  let dragId = null;
  renderer.domElement.addEventListener('pointerdown', e => { audio.unlock(); if (pointerAim(e)) { dragId = e.pointerId; try { renderer.domElement.setPointerCapture(e.pointerId); } catch (er) {} } });
  renderer.domElement.addEventListener('pointermove', e => { if (dragId === e.pointerId) pointerAim(e); });
  renderer.domElement.addEventListener('pointerup', e => { if (dragId === e.pointerId) dragId = null; });
  const onKeyDown = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; S.keys[e.code] = true; if (S.paused || S.phase === 'menu') return;
    if (e.code === 'Digit1' || e.code === 'KeyJ') { act(1); e.preventDefault(); } else if (e.code === 'Digit2' || e.code === 'KeyK') { act(2); e.preventDefault(); } else if (e.code === 'Digit3' || e.code === 'KeyL' || e.code === 'Space') { act(3); e.preventDefault(); } };
  const onKeyUp = e => { S.keys[e.code] = false; };
  addEventListener('keydown', onKeyDown); addEventListener('keyup', onKeyUp);
  const stickNow = () => { const k = S.keys; let x = S.stick.x, y = S.stick.y; if (k.KeyA || k.ArrowLeft) x = -1; if (k.KeyD || k.ArrowRight) x = 1; if (k.KeyW || k.ArrowUp) y = 1; if (k.KeyS || k.ArrowDown) y = -1; return { x, y }; };

  // ---------- camera ----------
  const camPos = V3(0.5, 3.4, 6.5), camLook = V3(0, 0.8, -8), tmpV = V3(), tmpL = V3();
  function camTarget(dt) {
    const asp = CW() / CH(), port = asp < 0.85; S.viewOff = 0; keeper.visible = true; camera.fov = port ? 46 : asp < 1.4 ? 44 : 38;
    const zoom = S.camDist, pitchAdd = S.camPitch;
    if (S.phase === 'menu') { const a = Math.sin(S.t * 0.12) * 0.5; tmpV.set(Math.sin(a) * 3.5, port ? 6.2 : 4.6, 7.2); tmpL.set(0, 0, -10); return; }
    const bowlCam = S.phase === 'aim' || (cur && cur.bowlCam);
    nets.B.visible = !bowlCam; if (bowlCam) { camera.fov = port ? 40 : 34; S.viewOff = port ? 0.12 : 0.02;   // high, off to the left of the bowler's run-up so he never fills the screen
      if (port) { tmpV.set(-1.5, 4.9 + pitchAdd * 4, -25.4); tmpL.set(0.15, 0.2, -2); } else { camera.fov = 30; tmpV.set(-1.6, 5.2 + pitchAdd * 4, -24.6); tmpL.set(0.1, 0, -3); } return; }
    if (S.pov && batter.visible) { camera.fov = port ? 70 : 58; tmpV.set(-0.1, 1.55, 0.6); tmpL.set(0, 0.9, -12); return; }
    S.viewOff = port ? 0.1 : 0; keeper.visible = !!(cur && cur.hit && cur.hit.edgeBack); tmpV.set(0.15, (port ? 4.6 : 3.4) + pitchAdd * 4, (port ? 11.5 : 9.5) * zoom); tmpL.set(0, port ? 0.6 : 0.8, port ? -10 : -9);
    if (cur && cur.hit && cur.ht > 0.15) { const p = ball.position; tmpL.set(p.x * 0.55, Math.min(2.5, p.y * 0.5 + 0.5), Math.min(-4, p.z * 0.7 - 2)); }
  }

  // ---------- frame ----------
  const clock = new THREE.Clock(); let raf = 0, alive = true, pushT = 0;
  function frame() {
    if (!alive) return; raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, clock.getDelta()); S.t += dt;
    if (!S.paused) step(dt);
    camTarget(dt); camPos.x = damp(camPos.x, tmpV.x, 3.5, dt); camPos.y = damp(camPos.y, tmpV.y, 3.5, dt); camPos.z = damp(camPos.z, tmpV.z, 3.5, dt); camLook.x = damp(camLook.x, tmpL.x, 4, dt); camLook.y = damp(camLook.y, tmpL.y, 4, dt); camLook.z = damp(camLook.z, tmpL.z, 4, dt);
    camera.position.copy(camPos); camera.lookAt(camLook); { const w = CW(), h = CH(), off = S.viewOff || 0; if (off) camera.setViewOffset(w, h, 0, -off * h, w, h); else camera.clearViewOffset(); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const w = CW(), h = CH(); if (renderer.domElement.width !== Math.floor(w * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(h * renderer.getPixelRatio())) { renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    renderer.render(scene, camera);
    pushT += dt; if (pushT > 0.12) { pushT = 0; push(); }
  }
  const SWING_DUR = 0.42;
  function poseBatter(dt) {
    const f = batFig(), P = f.userData.P, c = cur, chairB = f === batter && hero === 'noble';
    kit.animFox(f, dt, 0); if (f === batter && hero === 'noble' && batter.userData.rig) {}
    // swing phase 0..1 (0 = backlift, ~0.3 = contact, 1 = follow-through)
    let sw = -1; if (c && c.swingT != null) sw = clamp(c.swingT / SWING_DUR, 0, 1);
    const ready = c && (S.phase === 'ball' || S.phase === 'runup') && !c.resolved;
    // bat pivot sits at the hands in front of the body; rotate around the batter's facing axis
    f.updateMatrixWorld(true); const yaw = f.rotation.y;
    const hands = V3(0.05, chairB ? 1.05 : 0.98, 0.32).applyAxisAngle(V3(0, 1, 0), yaw).add(f.position);
    batPivot.position.copy(hands); batPivot.rotation.set(0, 0, 0);
    let a; if (sw >= 0) { const k = sw < 0.3 ? sw / 0.3 : 1 + (sw - 0.3) / 0.7; a = k <= 1 ? -2.1 + smooth(k) * 2.5 : 0.4 + smooth(k - 1) * 2.0; }
    else a = ready ? -1.9 + Math.sin(S.t * 6) * 0.03 : -0.25;   // backlift while the ball comes, grounded otherwise
    // the bat swings in the vertical plane along the pitch (z), angled a little by the shot direction
    const aim = c && c.shot ? clamp((c.shot.e / 0.12) * 0.5 + (c.shot.ax || 0) * 0.3, -0.9, 0.9) : 0;
    batPivot.rotation.y = -aim * (sw > 0.3 ? 1 : 0.2); batPivot.rotation.x = a; batPivot.rotation.z = c && c.shot && c.shot.kind === 'loft' && sw > 0.3 ? -0.3 : 0;
    // arms reach toward the bat handle
    if (!f.userData.chair || true) { const armX = clamp(-0.9 - (sw >= 0 ? Math.sin(sw * Math.PI) * 0.8 : ready ? 0.5 : 0), -2.4, 0); P.arms[0].rotation.x = armX; P.arms[1].rotation.x = armX + 0.15; P.arms[0].rotation.z = -0.55; P.arms[1].rotation.z = 0.25; }
    P.body.rotation.y = sw >= 0 ? -0.7 + sw * 1.2 : ready ? -0.6 : -0.35;
    if (c && c.shot && c.shot.kind === 'block' && sw >= 0) batPivot.rotation.x = Math.min(a, -0.15);
  }
  function step(dt) {
    // hero swap from the HUD (only between balls)
    if (!(S.phase === 'ball' || S.phase === 'runup') && match && !match.online && match.mode !== 'bowl') { const h = heroNow(); if (h !== hero) buildBatter(h); }
    else if (!match) { const h = heroNow(); if (h !== hero) buildBatter(h); }
    // idle anims
    [coach, keeper, myBowler, ...fielders].forEach(f => f.visible && kit.animFox(f, dt, f.userData.spd || 0));
    fielders.forEach(f => { f.userData.spd = 0; if (f.userData.dive > 0) { f.userData.dive = Math.max(0, f.userData.dive - dt); f.userData.P.body.rotation.z = Math.sin(f.userData.dive / 0.6 * Math.PI) * 1.1; } else f.userData.P.body.rotation.z = 0; });
    poseBatter(dt);
    // stumps flying
    for (const st of [stumpsBat, stumpsBowl]) if (st.fly) { st.fly.t += dt; st.bails.forEach((b, i) => { const v = st.fly.v[i]; v.y -= G * dt; b.position.addScaledVector(v, dt); if (b.position.y < 0.01) { b.position.y = 0.01; v.set(v.x * 0.5, -v.y * 0.3, v.z * 0.5); } b.rotation.x += dt * 9; }); st.st.forEach((s, i) => { s.rotation.x = damp(s.rotation.x, st.fly.r[i] * 0.6 - 0.35, 6, dt); s.rotation.z = damp(s.rotation.z, st.fly.r[i], 6, dt); }); }
    // puffs
    puffs.forEach(p => { if (p.life <= 0) return; p.life -= dt * 1.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, p.life) * 0.6; });
    // aiming
    if (S.phase === 'aim') { S.aimT += dt; const st = stickNow(); S.aim.x = clamp(S.aim.x + st.x * 1.4 * dt, -1.4, 1.4); S.aim.z = clamp(S.aim.z - st.y * 5 * dt, -10, -0.4);
      aimGrp.position.set(S.aim.x, 0, S.aim.z); const w = wobble('pace'); aimDot.position.set(S.aim.x + w.x, 0.025, S.aim.z + w.z); aimRing.scale.setScalar(1 + Math.sin(S.t * 6) * 0.06);
      const dz = S.aim.z - (Z_REL), mid = (S.aim.z + Z_REL) / 2; aimLine.position.set((S.aim.x + 0.32) / 2, 0.015, mid); aimLine.scale.y = Math.abs(dz); aimLine.rotation.z = Math.atan2(S.aim.x - 0.32, dz) * -1;
}
    // online: host bowls for a bowler who is idle; host plays a dot if the batter's result never comes
    if (match && match.online && net.room && hostId() === net.id) {
      const nowR = performance.now();
      if ((S.phase === 'wait' || S.phase === 'aim') && !cur) { if (!match.waitT0) match.waitT0 = nowR; if (nowR - match.waitT0 > 15000) { match.waitT0 = nowR; const d = coachDelivery(mulberry(Date.now() >>> 0), 1, batterHero() === 'hope'); const n = ++match.seq; net.room.send('ev', { k: 'bowl', n, bat: match.batIdx, ball: match.ballNo, ex: match.extraN || 0, d, cpu: true }); match.lastBowlN = n; aimGrp.visible = aimDot.visible = aimLine.visible = false; deliver(d, n); sayTip('Auto-bowled (the bowler took too long).'); } }
      const bs = batterP() && N.lastSeen[batterP().id];
      if (cur && !cur.resolved && !iAmBatter() && cur.t > cur.del.tc + 1 && (!bs || nowR - bs > 8000)) { const d = { k: 'res', n: cur.n || match.seq, bat: match.batIdx, res: { runs: 0, out: false, how: 'NO SIGNAL · DOT', type: 'miss' }, shot: null }; net.room.send('ev', d); applyRemote(d); }
    }
    if (!cur) { ball.visible = false; shadowBlob.visible = false; ring.visible = ringCore.visible = false; trail.forEach(s => s.material.opacity = 0); runBowler(dt, null); return; }
    const c = cur; c.t += dt; if (c.swingT != null) c.swingT += dt;
    if (S.auto && iAmBatter() && !c.shot && !c.resolved && c.t >= c.del.tc - CONTACT_LAG + S.auto.off) swing(S.auto.kind);
    runBowler(dt, c);
    if (c.t < 0) { ball.visible = false; shadowBlob.visible = false; ring.visible = ringCore.visible = false; return; }
    if (S.phase === 'runup') { S.phase = 'ball'; audio.tone(c.del.d.kind === 'bell' ? 1600 : 520, 0.05, 0.04); }
    ball.visible = true; shadowBlob.visible = true;
    // the delivery
    if (!c.hit) {
      const tt = c.resolved && c.res && (c.res.type === 'bowled' || c.res.type === 'miss' || c.res.type === 'wide') ? Math.min(c.t, c.del.ts + 0.02) : c.t;
      if (c.res && c.res.type === 'miss' && c.t > c.del.ts) { // keeper takes it
        const kp = V3(keeper.position.x, 0.6, keeper.position.z - 0.35); ball.position.lerp(kp, Math.min(1, dt * 12)); }
      else c.del.pos(Math.min(tt, c.del.ts + (c.res && c.res.type === 'wide' ? 0.6 : 0)), ball.position);
      if (c.res && c.res.type === 'wide' && c.t > c.del.ts) { const kp = V3(keeper.position.x, 0.6, keeper.position.z - 0.35); ball.position.lerp(kp, Math.min(1, dt * 10)); }
    }
    // bounce + rattle
    if (!c.bounced && c.t >= c.del.tb && !c.hit) { c.bounced = true; audio.thud(); puff(ball.position.x, 0.05, ball.position.z, 0xcfe8d4, 3, 0.25); }
    if (c.del.d.kind === 'bell' && !c.hit && !c.resolved) { c.rt = (c.rt || 0) - dt; if (c.rt <= 0) { c.rt = 0.07; audio.rattleTick(clamp(ball.position.x / 1.2, -1, 1), 0.06 + clamp((c.t / c.del.tc), 0, 1) * 0.14); } }
    else if (c.del.d.kind !== 'bell' && hero === 'hope' && iAmBatter() && !c.hit && !c.resolved) { c.rt = (c.rt || 0) - dt; if (c.rt <= 0) { c.rt = 0.09; audio.rattleTick(clamp(ball.position.x / 1.2, -1, 1), 0.08); } }
    // assist beeps
    if (c.beeps) for (const b of c.beeps) if (!b.done && c.t >= b.t) { b.done = true; audio.tone(b.f, 0.08, 0.09, 'sine'); }
    // the timing ring (local batter only)
    const showRing = iAmBatter() && prefs.ring !== false && !c.resolved && !c.shot && c.t > 0;
    ring.visible = ringCore.visible = showRing;
    if (showRing) { const ideal = c.del.tc - CONTACT_LAG, dtI = ideal - c.t, W = SHOTS.drive.win; ring.position.set(c.del.pc.x, c.del.pc.y, Z_CONTACT); ringCore.position.copy(ring.position); const s = 0.26 + Math.max(0, dtI) * 0.7; ring.scale.setScalar(s);
      const col = Math.abs(dtI) <= W[1] ? 0x22c55e : dtI < -W[1] ? 0xec3013 : 0xffffff; ring.material.color.setHex(col); ringCore.material.opacity = Math.abs(dtI) <= W[1] ? 0.85 : 0.25; }
    // resolve at contact time
    if (!c.resolved) {
      const contactAt = c.shot ? Math.max(c.shotAt + CONTACT_LAG, 0) : c.del.tc + 0.02;
      const decided = match.online ? iAmBatter() : true;
      if (decided && c.t >= Math.min(contactAt, c.del.tc + 0.2)) {
        if (c.shot && match.mode === 'bowl') c.swingT = c.swingT ?? 0;
        resolveContact();
      }
      if (match.mode === 'bowl' && c.shot && c.swingT == null && c.t >= c.shotAt) c.swingT = 0;
    }
    if (c.pendingRes && c.t >= c.del.tc) { const d = c.pendingRes; c.pendingRes = null; applyRemote(d); }
    // hit ball flight
    if (c.hit) { c.ht += dt; const P = c.hit.path; let i = 0; while (i < P.length - 1 && P[i + 1].t < c.ht) i++; const a = P[i], b = P[Math.min(P.length - 1, i + 1)], u = b.t > a.t ? clamp((c.ht - a.t) / (b.t - a.t), 0, 1) : 1;
      ball.position.set(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u, a.z + (b.z - a.z) * u);
      fielders.forEach((f, k) => { const fp = a.f[k]; if (!fp) return; const nx = fp[0], nz = fp[1], d = Math.hypot(nx - f.position.x, nz - f.position.z); f.userData.spd = d / Math.max(dt, 1e-3) > 0.5 ? 3.5 : 0; f.position.x = nx; f.position.z = nz; f.lookAt(ball.position.x, 0, ball.position.z); });
      const e = c.hit.end; if (!c.endFx && c.ht >= e.t) { c.endFx = true; if (e.type === 'net') { audio.burst(0.12, 0.2, 700, 1); puff(ball.position.x, ball.position.y, ball.position.z, 0xffffff, 5); const n = e.zone === 'back' ? nets.B : e.zone === 'rear' ? nets.F : ball.position.x < 0 ? nets.L : nets.R; n.userData.wob = 0.5; } if (e.f && e.type === 'catch') { const fi = FIELD.findIndex(q => q.n === e.f.n); if (fi >= 0) fielders[fi].userData.dive = 0.6; audio.tone(500, 0.1, 0.05); } } if (c.ht >= e.t) { ball.position.y = Math.max(ball.position.y - dt * 2, BALL_R); }
    }
    // stumps
    if (c.res && c.res.type === 'bowled' && !c.stumpsHit && c.t >= c.del.ts) { c.stumpsHit = true; knockStumps(stumpsBat, 1); audio.stumps(); }
    // net wobble
    for (const k of ['L', 'R', 'B', 'F']) { const n = nets[k]; if (n.userData.wob > 0) { n.userData.wob -= dt; const s = Math.sin(n.userData.wob * 40) * n.userData.wob * 0.06; if (k === 'B' || k === 'F') n.position.z = (k === 'B' ? NET_BACK : NET_REAR) + s; else n.position.x = (k === 'L' ? -NET_X : NET_X) + s; } }
    // shadow + trail
    shadowBlob.position.set(ball.position.x, 0.012, ball.position.z); shadowBlob.material.opacity = clamp(0.4 - ball.position.y * 0.08, 0.08, 0.4);
    trail.forEach((s, i) => { const k = (i + 1) / trail.length; if (c.hit || S.phase === 'ball') { s.position.lerp(ball.position, 0.55 - k * 0.35); s.material.opacity = (1 - k) * 0.5; s.scale.setScalar(0.16 * (1 - k * 0.5)); } else s.material.opacity = 0; });
    ball.rotation.x += dt * 25;
    // ball over
    if (c.resolved && !c.done) { c.endClock = (c.endClock || 0) + dt; const until = c.hit ? c.hit.end.t + 0.45 : (c.res.type === 'bowled' ? 0.7 : 0.55); if ((c.hit ? c.ht : c.endClock) >= until) finishBall(); }
  }
  function runBowler(dt, c) {
    const b = bowlerFig(); if (!b.visible) return;
    if (!c) { b.position.x = damp(b.position.x, S.phase === 'aim' ? 1.5 : 0.55, 3, dt); b.position.z = damp(b.position.z, -22.4, 3, dt); b.rotation.y = 0; b.userData.spd = 0; b.userData.P.arms[1].rotation.x = 0; return; }
    const t = c.t, d = c.del.d;
    if (d.kind === 'bell') { // underarm: a few steps, then roll it
      const k = clamp((t + 0.95) / 0.95, 0, 1); b.position.set(0.55, 0, -21 + k * 3.2); b.userData.spd = k < 1 ? 2.5 : 0; b.userData.P.arms[1].rotation.x = k < 0.8 ? 0.8 : -0.9 + (1 - k) * 4; b.rotation.y = 0; return; }
    if (t < 0) { const k = (t + 0.95) / 0.95; b.position.set(0.55, 0, -22.4 + smooth(clamp(k, 0, 1)) * 5.0); b.userData.spd = 6; b.userData.P.arms[1].rotation.x = k > 0.75 ? -(k - 0.75) * 4 * Math.PI : 0.3; }
    else { const k = clamp(t / 0.6, 0, 1); b.position.set(0.55 + k * 0.5, 0, -17.4 + k * 2.2); b.userData.spd = 4 * (1 - k); b.userData.P.arms[1].rotation.x = -Math.PI - k * 2; }
  }

  // ---------- HUD state ----------
  function push() {
    const m = match, b = m && batterP(), ph = S.phase, port = CH() > CW();
    const over = m ? Math.floor(m.ballNo / 6) + '.' + (m.ballNo % 6) : '0.0';
    const pips = m ? Array.from({ length: 6 }, (_, i) => { const legal = m.over.filter(x => x !== 'WD'); const v = legal[i]; return { t: v || '', bg: v === 'W' ? '#ec3013' : v === '6' || v === '4' ? '#ffd23a' : v ? '#2a2826' : '#000000', fg: v === '6' || v === '4' ? '#000000' : '#ffffff' }; }) : [];
    if (m && b) drawBoard(m.mode === 'bowl' ? 'SKIPPER RUSTY · DEFEND ' + m.target : m.mode === 'chase' ? b.name + ' · TARGET ' + m.target : b.name + ' BATTING', b.runs + ' / ' + b.outs, 'OVERS ' + over + ' OF ' + m.overs + (m.players.length > 1 ? ' · ' + m.players.map(p => p.name + ' ' + p.runs).join('  ') : ''));
    else drawBoard('8 GATES CRICKET CLUB', 'NETS OPEN', 'BAT · BOWL · PLAY YOUR FRIENDS');
    const need = m && m.mode === 'chase' && b ? Math.max(0, m.target - b.runs) : null;
    const meBat = m && iAmBatter(), meBowl = m && iAmBowler(), ballsLeft = m ? ballsPer() - m.ballNo : 0;
    const h = {
      phase: ph, demo: !!S.demo, mode: m ? m.mode : null, online: !!(m && m.online), paused: S.paused, hero,
      card: m && b ? { place: (MODES.find(x => x.id === m.mode) || { name: 'ONLINE' }).name, who: b.name, whoCol: b.col, runs: b.runs, outs: b.outs, score: b.runs + ' / ' + b.outs, over: over + ' / ' + m.overs + '.0',
        tgtLbl: m.mode === 'chase' ? 'NEED' : m.mode === 'bowl' ? 'DEFEND' : m.players.length > 1 ? 'INNINGS' : 'BEST', tgt: m.mode === 'chase' ? need + ' OFF ' + ballsLeft : m.mode === 'bowl' ? 'UNDER ' + m.target : m.players.length > 1 ? (m.batIdx + 1) + ' OF ' + m.players.length : String(save.stat('cricketNets.best.nets', 0)),
        pips, role: m.online ? (meBat ? 'YOU BAT' : meBowl ? 'YOU BOWL' : 'WATCHING') : m.mode === 'bowl' ? 'YOU BOWL' : 'YOU BAT',
        table: m.players.length > 1 ? m.players.map((p, i) => ({ name: p.name + (m.online && p.id === net.id ? ' · YOU' : ''), col: p.col, v: p.gone ? 'LEFT' : String(p.runs), on: i === m.batIdx })) : [] } : null,
      tip: S.tip, flash: S.flash, aiming: ph === 'aim', swingOK: ph === 'ball' || ph === 'runup', meBat: !!meBat, meBowl: !!meBowl,
      btns: ph === 'aim' || (meBowl && !meBat) ? [['fireball', 'PACE'], ['shoot', 'SPIN'], ['smash', 'YORKER']] : [['drive', 'DRIVE'], ['lob', 'LOFT'], ['guard', 'BLOCK']],
      pass: ph === 'pass' && m ? { name: b.name, col: b.col, n: m.batIdx + 1, of: m.players.length } : null,
      done: m && m.done ? m.done : null, gold: save.data.gold, items: hudItems(), prefs: { ...prefs }, bell: hero === 'hope',
      net: N.st ? { st: N.st, code: N.code, status: N.status, msg: N.msg, ping: N.ping, ready: N.ready, overs: N.overs, me: net.id, host: net.room ? hostId() : null, members: members().map((x, i, arr) => ({ id: x.id, me: x.me, ready: !!x.ready, playing: !!x.playing && !x.me, hero: x.hero, col: NET_COLS[i][1], name: arr.length > 2 ? NET_COLS[i][0] : x.me ? 'YOU' : 'FRIEND' })), full: !!net.room && members().length >= MAX_PLAYERS && !members().some(x => x.me) } : null,
      port,
    };
    onState && onState(h);
  }

  // ---------- the engine object the Game HUD calls ----------
  const api = {
    // HUD contract
    setPaused(p) { S.paused = !!p; }, setHudPad(p) { S.hudPad = !!p; }, setStick(x, y) { S.stick.x = x; S.stick.y = y; },
    melee() { act(1); }, range() { act(2); }, jump() { act(3); }, meleeUp() {}, rangeUp() {}, jumpUp() {},
    useItem(id) { S.tip = id === TROPHY_ID ? 'The trophy lives on your shelf at home.' : 'Save it for on foot.'; push(); },
    mapData() { return null; }, setMinimap() {}, closeWheel() {}, skipTime() {},
    getCam() { return { dist: 13 * S.camDist, pitch: 0.38 + S.camPitch }; }, setCam(d, p) { if (d != null) S.camDist = clamp(d / 13, 0.75, 1.35); if (p != null) S.camPitch = clamp(p - 0.38, -0.2, 0.4); },
    zoomBy(f) { S.camDist = clamp(S.camDist * f, 0.75, 1.35); }, lookBy() {}, eyeLook() {}, eyeRelease() {},
    togglePov() { S.pov = !S.pov; return S.pov; },
    // page API
    start, menu: toMenu, passGo, act, demo: startDemo,
    setPref(k, v) { prefs[k] = v; if (k === 'muted') audio.muted = !!v; savePrefs(); push(); },
    netOpen, netJoin, netCreate, netLeave: netClose, netReady, netOvers, netAgain,
    state: () => S, match: () => match, unlockAudio: () => audio.unlock(),
    destroy() { alive = false; cancelAnimationFrame(raf); clearTimeout(S.nextT); netLeave(); removeEventListener('keydown', onKeyDown); removeEventListener('keyup', onKeyUp); renderer.dispose(); renderer.domElement.remove(); },
    // test hooks
    _debug: { buildDelivery, simShot, SHOTS, cur: () => cur, batPivot, bat, scene, camera, auto(kind, off = 0) { S.auto = kind ? { kind, off } : null; } },
  };
  frame(); push();
  return api;
}
