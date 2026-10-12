// 8 GATES — DUNK TANK [meruDunkTank] · minigame #62 (STRENGTH & SPECTACLE).
// A carnival booth INTERIOR that drops into any building on any world: ?world=gaya (jidda, kufa, luxor, nebo, ur, zion, home, earth, station) re-themes it.
// Throw balls at the target: BULLSEYE drops whoever sits on the seat into the tank; ring hits fill the DUNK METER (full = dunk).
//   SOLO   3 rounds × 5 balls: STILL target → SLIDING target → SLIDE + BOB + WIND. Meru townsfolk take the seat.
//   PARTY  2–5 players pass one phone. The LEADER sits on the seat.
//   ONLINE 2–5 players, peer to peer (engine/duel-net.js, room code). The LEADER sits on the seat and can tap TAUNTS.
// Phone first: one finger drags the aim (arc preview), letting go throws. AIM SOUND: a tone that climbs and speeds up as the throw lines up
// with the bullseye, panned left/right, so the game can be played by ear.
// Saves (engine/save.js only): stats dunkTank.best · dunkTank.dunks · dunkTank.played · dunkTank.onlineWins, flag dunkTank.trophy, item dunkTankTrophy, gold + XP.
// Local prefs (not game save): localStorage dunkTank.prefs.
// PARALLEL RULES: no shared file is edited. Small helpers (rr, clamp, damp, gradient, glow, fitShot) are COPIES of village-game.js / restaurant-kit.js.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit } from '../../fox-kit.js';
import { castKit, loadCastRigs } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { crestTex, canvasTex } from '../../engine/textures.js';

// ---------------- copied helpers ----------------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), pick = a => a[Math.floor(Math.random() * a.length)];
function makeGradient() { const t = new THREE.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }
function glowTexture() { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------- data ----------------
export const DUNK = { key: 'dunkTank', name: 'DUNK TANK', room: 'meruDunkTank', rounds: 3, balls: 5, trophy: 1200 };
// world themes are DRAFT palettes for Ben (wall, stripe, trim, accent, floor planks, awning)
export const THEMES = {
  meru: { name: 'MERU', letter: 'M', wall: '#1b2350', wall2: '#232d63', trim: '#e6b45a', accent: '#c42d3c', floor: '#8a5a3a', floor2: '#7a4e32', awn: ['#c42d3c', '#f3efe6'], bg: '#0d1230' },
  gaya: { name: 'GAYA', letter: 'G', wall: '#2c4a2a', wall2: '#365a33', trim: '#c9b6f2', accent: '#8b5cf6', floor: '#9a7650', floor2: '#8a6844', awn: ['#8b5cf6', '#f3efe6'], bg: '#13220f' },
  jidda: { name: 'JIDDA', letter: 'J', wall: '#0e5a6b', wall2: '#11697c', trim: '#ffd23a', accent: '#ff8a1a', floor: '#c9a46a', floor2: '#b8935a', awn: ['#ff8a1a', '#f3efe6'], bg: '#062a33' },
  kufa: { name: 'KUFA', letter: 'K', wall: '#7a4a22', wall2: '#8a5528', trim: '#ffd9a0', accent: '#e2412e', floor: '#a8784a', floor2: '#966a40', awn: ['#e2412e', '#fbe9c8'], bg: '#2e1a0a' },
  luxor: { name: 'LUXOR', letter: 'L', wall: '#1f1d1c', wall2: '#2a2826', trim: '#e6b45a', accent: '#e6b45a', floor: '#5a4636', floor2: '#4e3c2e', awn: ['#e6b45a', '#1f1d1c'], bg: '#0b0a0a' },
  nebo: { name: 'NEBO', letter: 'N', wall: '#2f3d24', wall2: '#3a4a2c', trim: '#d9a64a', accent: '#c2410c', floor: '#8a6440', floor2: '#7a5636', awn: ['#c2410c', '#f3efe6'], bg: '#141c0e' },
  ur: { name: 'UR', letter: 'U', wall: '#6b2f1f', wall2: '#7a3824', trim: '#f2c48a', accent: '#38bdf8', floor: '#b07a52', floor2: '#9e6c48', awn: ['#38bdf8', '#f3efe6'], bg: '#2a110a' },
  zion: { name: 'ZION', letter: 'Z', wall: '#4a2e1a', wall2: '#55361f', trim: '#e6b45a', accent: '#c42d3c', floor: '#8a5a3a', floor2: '#7a4e32', awn: ['#c42d3c', '#f6e7c8'], bg: '#1e1208' },
  home: { name: 'HOME', letter: '8', wall: '#24324a', wall2: '#2b3b56', trim: '#f2741f', accent: '#38bdf8', floor: '#9a7650', floor2: '#8a6844', awn: ['#f2741f', '#f3efe6'], bg: '#0e1420' },
  earth: { name: 'EARTH', letter: 'E', wall: '#30475e', wall2: '#385470', trim: '#ffd23a', accent: '#22c55e', floor: '#9a7650', floor2: '#8a6844', awn: ['#22c55e', '#f3efe6'], bg: '#101a24' },
  station: { name: 'DEEP SPACE FOX', letter: '8', wall: '#0b1430', wall2: '#101c40', trim: '#7dd3fc', accent: '#38bdf8', floor: '#3a4a66', floor2: '#33415a', awn: ['#38bdf8', '#e0f2fe'], bg: '#04070f' },
};
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PURPLE', '#a78bfa']];
export const LEVELS = {
  still: { id: 'still', name: 'STILL', sub: 'TARGET STAYS PUT', A: 0, B: 0, w: 0, prev: 1, wind: 0, wob: 0 },
  swing: { id: 'swing', name: 'SLIDER', sub: 'TARGET SLIDES', A: 0.42, B: 0, w: 1.45, prev: 0.62, wind: 0, wob: 0.012 },
  wild: { id: 'wild', name: 'STORM', sub: 'SLIDE + BOB + WIND', A: 0.42, B: 0.26, w: 2.0, prev: 0.4, wind: 2.4, wob: 0.022 },
};
const SOLO_ROUNDS = [{ lv: 'still', title: 'WARM-UP', line: 'The target stays put. Full aim line.' }, { lv: 'swing', title: 'THE SLIDER', line: 'The target slides. Shorter aim line.' }, { lv: 'wild', title: 'STORM BOOTH', line: 'Slide, bob and wind. Watch the wind arrow.' }];
// Solo seat-sitters: names from Meru Burgers' townsfolk. LINES ARE DRAFT for Ben.
const NPCS = [
  { name: 'MICHAEL JAY', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], outfit: 'vest', look: { fur: '#e0823a', furDark: '#a8501c' } },
  { name: 'FLICK', torso: ['#c42d3c', '#f3f2f2', '#7a1d2a'], outfit: 'tee', look: { fur: '#8a5a3a', furDark: '#5a3a22' } },
  { name: 'DOC BRAUN', torso: ['#f6f8fb', '#e2e8f0', '#94a3b8'], outfit: 'coat', look: { fur: '#b0b4bc', furDark: '#6b7280', fluff: '#ffffff' } },
];
const TAUNTS = ['Is that all you’ve got?', 'My grandma throws harder!', 'Dry as a desert up here!', 'Over here! No, over HERE!', 'You couldn’t hit the tank!', 'Nice try, hatchling!', 'I could do this all day!'];
const QUICK_TAUNTS = ['MISS ME!', 'TOO SLOW!', 'NOT TODAY!'];
const DUNKED = ['BRRR! Lucky shot!', 'My fur! My beautiful fur!', 'Okay, okay, you got me!', 'Cold cold cold!'];
const CLOSE = ['Whoa, that was close!', 'Hey, careful!', 'Hah! Almost!'];
// geometry (metres). The thrower stands at the origin facing -Z; the target plane is Z_T.
const STAND_X = -0.85, R0 = new THREE.Vector3(STAND_X + 0.42, 1.72, -0.45), VZ = -13, Z_T = -6.95, Z_CAGE = -6.78, TX0 = 1.95, TY0 = 2.05, RINGS = [0.13, 0.25, 0.38];
const CAGE = { x: 1.15, y: 3.75, glass: 1.35 }, SEAT_Y = 2.0, SEAT_Z = -7.72, WATER_Y = 1.2, FOX_S = 0.74;
const vel = (ax, ay) => new THREE.Vector3(ax * 6.4, 0.6 + ay * 7.4, VZ);
const targetAt = (ph, lv) => ({ x: TX0 + lv.A * Math.sin(ph), y: TY0 + lv.B * Math.sin(ph * 2 + 0.6) });
// the whole throw is decided at release: same inputs → same result on every phone
export function solveThrow(ax, ay, ph, wind, lv) {
  const v = vel(ax, ay), at = (t) => ({ x: R0.x + v.x * t + 0.5 * wind * t * t, y: R0.y + v.y * t - 4.9 * t * t });
  const tg = (v.y + Math.sqrt(v.y * v.y + 2 * 9.8 * R0.y)) / 9.8;   // reaches the floor
  const tc = (Z_CAGE - R0.z) / v.z, pc = at(tc);
  if (tg < tc) return { kind: 'short', t: tg, r: 9 };
  if (Math.abs(pc.x) < CAGE.x && pc.y < CAGE.y) return { kind: pc.y < CAGE.glass ? 'glass' : 'cage', t: tc, r: 9, x: pc.x, y: pc.y };
  const tt = (Z_T - R0.z) / v.z, p = at(tt), c = targetAt(ph + lv.w * tt, lv), r = Math.hypot(p.x - c.x, p.y - c.y);
  const kind = r < RINGS[0] ? 'bull' : r < RINGS[1] ? 'inner' : r < RINGS[2] ? 'outer' : (p.y > c.y + RINGS[2] ? 'over' : p.y < c.y - RINGS[2] ? 'under' : p.x > c.x ? 'wide' : 'inside');
  return { kind, t: tt, r, x: p.x, y: p.y, dx: p.x - c.x, dy: p.y - c.y };
}
const HIT = { bull: 1, inner: 1, outer: 1 };

// ---------------- local tab link (used only when engine/duel-net.js is missing, e.g. in the kit) ----------------
function localDuel({ game, code, onJoin, onLeave, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10), bc = new BroadcastChannel('8g-' + game + '-' + code), seen = new Set();
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return;
    if (m.t === '__join') { if (!seen.has(m.from)) { seen.add(m.from); onJoin(m.from); } if (!m.re) bc.postMessage({ from: m.from === id ? null : id, t: '__join', re: 1 }); return; }
    if (m.t === '__leave') { seen.delete(m.from); onLeave(m.from); return; }
    if (!seen.has(m.from)) { seen.add(m.from); onJoin(m.from); } onMsg(m.t, m.d, m.from); };
  setTimeout(() => { onStatus('local'); bc.postMessage({ from: id, t: '__join' }); }, 30);
  return { id, send(t, d, to) { try { bc.postMessage({ from: id, to: to || null, t, d }); } catch (e) {} }, leave() { try { bc.postMessage({ from: id, t: '__leave' }); bc.close(); } catch (e) {} } };
}

// ---------------- the game ----------------
export async function createDunkTank({ container, onState = () => {}, world = 'meru', embed = false }) {
  const TH = THEMES[world] || THEMES.meru;
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1, V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.6 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none;-webkit-tap-highlight-color:transparent'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(TH.bg); scene.fog = new THREE.Fog(TH.bg, 16, 30);
  const camera = new THREE.PerspectiveCamera(46, CW() / CH(), 0.05, 60);
  const grad = makeGradient(), glowTex = glowTexture(), cache = new Map();
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);
  scene.add(new THREE.HemisphereLight(0xfff2e0, 0x5a4a5a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(4, 9, 3); sun.target.position.set(0.5, 0, -5); scene.add(sun.target); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 8, bottom: -6, far: 30 }); scene.add(sun);
  const fill = new THREE.PointLight(0xffd8a0, 18, 14, 1.6); fill.position.set(0.5, 4.3, -4.5); scene.add(fill);

  // ---------------- audio (all synth, no files) ----------------
  const A = { ctx: null, master: null, on: true, aim: null };
  const prefs = (() => { try { return { aimSound: true, aimMode: 'swipe', ...JSON.parse(localStorage.getItem('dunkTank.prefs') || '{}') }; } catch (e) { return { aimSound: true, aimMode: 'swipe' }; } })();
  const savePrefs = () => { try { localStorage.setItem('dunkTank.prefs', JSON.stringify(prefs)); } catch (e) {} };
  function unlock() { if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; } try { A.ctx = new (window.AudioContext || window.webkitAudioContext)(); A.master = A.ctx.createGain(); A.master.gain.value = 0.55; A.master.connect(A.ctx.destination); } catch (e) { A.ctx = null; } }
  function tone(f, d = 0.15, v = 0.2, type = 'triangle', slide = 0, pan = 0, when = 0) { const c = A.ctx; if (!c) return; const t = c.currentTime + when, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + d); let n = g; if (c.createStereoPanner && pan) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); n = p; } o.connect(g); n.connect(A.master); o.start(t); o.stop(t + d + 0.05); }
  let noiseBuf = null; function noise(d = 0.3, v = 0.3, f0 = 1200, f1 = 400, q = 0.8, when = 0) { const c = A.ctx; if (!c) return; if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const ch = noiseBuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; } const t = c.currentTime + when, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = noiseBuf; s.loop = true; fl.type = 'bandpass'; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(fl); fl.connect(g); g.connect(A.master); s.start(t); s.stop(t + d + 0.05); }
  const SFX = {
    throw: () => noise(0.22, 0.25, 600, 2400, 1.2), clang: () => { tone(880, 0.35, 0.22, 'square', -300); tone(1320, 0.25, 0.12, 'triangle'); }, thud: () => { tone(120, 0.18, 0.3, 'sine', -60); noise(0.08, 0.15, 400, 200); },
    bull: () => { tone(1046, 0.5, 0.25, 'triangle'); tone(1568, 0.6, 0.18, 'triangle', 0, 0, 0.06); }, cage: () => { noise(0.25, 0.25, 900, 300, 2); tone(220, 0.15, 0.12, 'sawtooth', -80); },
    glass: () => { tone(1760, 0.2, 0.12, 'sine'); tone(2350, 0.25, 0.08, 'sine', 0, 0, 0.02); }, splash: () => { noise(0.9, 0.5, 2400, 300, 0.6); noise(0.5, 0.25, 600, 120, 0.8, 0.1); },
    cheer: () => { noise(1.4, 0.18, 1800, 1400, 0.4); for (let i = 0; i < 5; i++) tone(rr(500, 900), 0.12, 0.05, 'triangle', rr(100, 300), rr(-0.6, 0.6), 0.1 + i * 0.12); },
    aww: () => tone(330, 0.5, 0.12, 'sine', -120), tick: () => tone(1400, 0.04, 0.08, 'square'), go: () => { tone(660, 0.12, 0.2); tone(990, 0.2, 0.2, 'triangle', 0, 0, 0.12); },
    pass: () => tone(520, 0.12, 0.14, 'triangle', 200), buzz: () => tone(140, 0.3, 0.2, 'sawtooth'),
  };
  // AIM SOUND: closer to the bullseye = higher pitch + faster beeps; pans to the side the throw would land
  const aimSnd = { next: 0 };
  function aimSoundTick(res, now) { if (!prefs.aimSound || !A.ctx || !res) return; if (now < aimSnd.next) return; const r = res.r, close = clamp(1 - r / 1.2, 0, 1), onBull = res.kind === 'bull', ring = !!HIT[res.kind];
    const f = 260 + close * 700 + (onBull ? 300 : 0), pan = clamp((res.dx || (res.x || 0) - TX0) / 1.2, -1, 1); tone(f, onBull ? 0.09 : 0.06, onBull ? 0.13 : 0.08, onBull ? 'square' : 'triangle', 0, pan); if (onBull) tone(f * 1.5, 0.09, 0.06, 'triangle', 0, pan);
    aimSnd.next = now + (onBull ? 0.11 : ring ? 0.16 : 0.18 + (1 - close) * 0.35); }

  // ---------------- the booth (interior, open toward the camera so it fits any building) ----------------
  const root = new THREE.Group(); scene.add(root);
  const planks = canvasTex(256, 256, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? TH.floor : TH.floor2; g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(0, i * 32 + 30, 256, 2); for (let k = 0; k < 2; k++) g.fillRect((i * 97 + k * 131) % 256, i * 32, 2, 32); } }, [5, 7]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 24), new THREE.MeshToonMaterial({ map: planks, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -2); floor.receiveShadow = true; root.add(floor);
  const stripes = canvasTex(256, 64, (g) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? TH.wall : TH.wall2; g.fillRect(i * 32, 0, 32, 64); } g.fillStyle = TH.trim; g.fillRect(0, 56, 256, 8); }, [6, 1]);
  const wallMat = new THREE.MeshToonMaterial({ map: stripes, gradientMap: grad });
  { const back = new THREE.Mesh(new THREE.PlaneGeometry(18, 7.5), wallMat); back.position.set(0, 3.75, -10.8); back.receiveShadow = true; root.add(back);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(18, 7.5), wallMat); w.rotation.y = -s * Math.PI / 2; w.position.set(s * 8.4, 3.75, -2); root.add(w); }
    M(new THREE.BoxGeometry(18, 0.35, 0.2), toon(TH.trim), 0, 0.17, -10.7, root, 0); }
  // tank
  const tank = new THREE.Group(); root.add(tank); const steel = toon('#c8d0da'), dark = toon('#2a2826'), red = toon(TH.accent), trim = toon(TH.trim);
  const TZ0 = -6.85, TZ1 = -8.45, TZC = (TZ0 + TZ1) / 2, TD = TZ0 - TZ1;
  M(new THREE.BoxGeometry(2.6, 0.18, 1.9), dark, 0, 0.09, TZC, tank, 0.02);
  const water = new THREE.Mesh(new THREE.BoxGeometry(2.24, WATER_Y - 0.18, TD - 0.06), new THREE.MeshToonMaterial({ color: '#2f9ee0', gradientMap: grad, transparent: true, opacity: 0.62, depthWrite: false })); water.position.set(0, 0.18 + (WATER_Y - 0.18) / 2, TZC); water.renderOrder = 2; tank.add(water);
  const surf = new THREE.Mesh(new THREE.PlaneGeometry(2.24, TD - 0.06, 16, 10), new THREE.MeshToonMaterial({ color: '#8fdcff', gradientMap: grad, transparent: true, opacity: 0.75, depthWrite: false })); surf.rotation.x = -Math.PI / 2; surf.position.set(0, WATER_Y, TZC); surf.renderOrder = 3; tank.add(surf);
  const surfBase = Float32Array.from(surf.geometry.attributes.position.array);
  const glassMat = new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.13, depthWrite: false, side: THREE.DoubleSide });
  for (const [w, x, z, ry] of [[2.3, 0, TZ0, 0], [TD, -1.15, TZC, Math.PI / 2], [TD, 1.15, TZC, Math.PI / 2]]) { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, CAGE.glass - 0.18), glassMat); g.position.set(x, 0.18 + (CAGE.glass - 0.18) / 2, z); g.rotation.y = ry; g.renderOrder = 4; tank.add(g); }
  for (const [x, w] of [[-0.6, 0.08], [-0.45, 0.04]]) { const hl = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false })); hl.position.set(x, 0.75, TZ0 + 0.01); hl.rotation.z = 0.5; hl.renderOrder = 5; tank.add(hl); }
  for (const x of [-1.17, 1.17]) for (const z of [TZ0, TZ1]) M(new THREE.CylinderGeometry(0.05, 0.05, CAGE.y, 10), steel, x, CAGE.y / 2, z, tank, 0.012, 0.05);
  for (const z of [TZ0, TZ1]) { M(new THREE.BoxGeometry(2.42, 0.1, 0.1), red, 0, CAGE.glass, z, tank, 0.012); M(new THREE.BoxGeometry(2.42, 0.12, 0.12), red, 0, CAGE.y, z, tank, 0.012); }
  for (const x of [-1.17, 1.17]) { M(new THREE.BoxGeometry(0.1, 0.1, TD), red, x, CAGE.glass, TZC, tank, 0.012); M(new THREE.BoxGeometry(0.12, 0.12, TD), red, x, CAGE.y, TZC, tank, 0.012); }
  { const netTex = canvasTex(128, 128, (g) => { g.clearRect(0, 0, 128, 128); g.strokeStyle = 'rgba(240,240,240,0.9)'; g.lineWidth = 3; for (let i = 0; i <= 128; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 128); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(128, i); g.stroke(); } }, [7, 7]);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(2.3, CAGE.y - CAGE.glass), new THREE.MeshBasicMaterial({ map: netTex, transparent: true, depthWrite: false, opacity: 0.55 })); net.position.set(0, (CAGE.y + CAGE.glass) / 2, Z_CAGE); net.renderOrder = 6; tank.add(net); }
  { const back = new THREE.Mesh(new THREE.PlaneGeometry(2.3, CAGE.y - CAGE.glass), toon(TH.wall2)); back.position.set(0, (CAGE.y + CAGE.glass) / 2, TZ1 - 0.02); tank.add(back);
    const sign = canvasTex(512, 160, (g, w, h) => { g.fillStyle = TH.accent; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.fillRect(8, 8, w - 16, h - 16); g.fillStyle = TH.accent; g.fillRect(16, 16, w - 32, h - 32); g.font = '900 92px "Archivo", "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 10; g.strokeStyle = '#201e1d'; g.strokeText('DUNK TANK', w / 2, h / 2 + 6); g.fillStyle = '#ffffff'; g.fillText('DUNK TANK', w / 2, h / 2 + 6); });
    const sg = M(new THREE.BoxGeometry(2.6, 0.81, 0.08), [toon(TH.accent), toon(TH.accent), toon(TH.accent), toon(TH.accent), new THREE.MeshToonMaterial({ map: sign, gradientMap: grad }), toon(TH.accent)], 0, CAGE.y + 0.55, TZ0 + 0.05, tank, 0.02); sg.castShadow = false; }
  // the seat: hinged at the back edge, drops on a dunk
  const seatPivot = new THREE.Group(); seatPivot.position.set(0, SEAT_Y, TZ1 + 0.2); tank.add(seatPivot);
  M(new THREE.BoxGeometry(1.1, 0.09, 0.62), toon('#c08a4a'), 0, -0.045, 0.31, seatPivot, 0.014); M(new THREE.BoxGeometry(1.1, 0.04, 0.04), red, 0, 0, 0.62, seatPivot, 0.008);
  M(new THREE.CylinderGeometry(0.035, 0.035, 2.3, 8), steel, 0, 0, 0, seatPivot, 0.008).rotation.z = Math.PI / 2;
  M(new THREE.BoxGeometry(0.5, 0.6, 0.06), toon('#ffd23a'), 0.9, SEAT_Y + 0.25, TZ1 + 0.02, tank, 0.012);
  // the target: a pole on a sliding carriage (rail on the floor) so it can SLIDE and BOB
  const tgt = new THREE.Group(); root.add(tgt); const tgtPole = M(new THREE.CylinderGeometry(0.05, 0.05, 1, 10), steel, 0, 0.5, 0, tgt, 0.012, 0.05);
  M(new THREE.BoxGeometry(0.5, 0.16, 0.4), dark, 0, 0.08, 0, tgt, 0.015);
  M(new THREE.BoxGeometry(1.4, 0.05, 0.12), toon('#5a544e'), TX0, 0.025, Z_T - 0.05, root, 0.008);
  const tgtTex = canvasTex(256, 256, (g) => { const c = 128, k = 128 / RINGS[2]; const ring = (r, col) => { g.fillStyle = col; g.beginPath(); g.arc(c, c, r * k, 0, 7); g.fill(); };
    ring(RINGS[2], '#201e1d'); ring(RINGS[2] - 0.015, '#ffffff'); ring(RINGS[1] + 0.012, '#201e1d'); ring(RINGS[1], TH.accent === '#e6b45a' ? '#c42d3c' : TH.accent); ring(RINGS[0] + 0.012, '#201e1d'); ring(RINGS[0], '#ffd23a');
    g.fillStyle = '#201e1d'; g.font = '900 22px "Archivo", Arial, sans-serif'; g.textAlign = 'center'; g.fillText('HIT ME', c, 34); });
  const disc = new THREE.Group(); tgt.add(disc);
  const discFace = M(new THREE.CylinderGeometry(RINGS[2], RINGS[2], 0.05, 40), [toon('#201e1d'), new THREE.MeshToonMaterial({ map: tgtTex, gradientMap: grad }), toon('#201e1d')], 0, 0, 0, disc, 0.014, RINGS[2]); discFace.rotation.x = Math.PI / 2; discFace.rotation.y = Math.PI;
  const discFlash = new THREE.Mesh(new THREE.CircleGeometry(RINGS[2] * 1.02, 40), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); discFlash.position.z = 0.03; disc.add(discFlash);
  // awning + string lights + prize shelf
  { const n = 12, w = 5.6 / n; for (let i = 0; i < n; i++) { const x = -2.6 + w * (i + 0.5); M(new THREE.BoxGeometry(w, 0.5, 0.06), toon(TH.awn[i % 2]), x, 4.85, -6.25, root, 0.01).rotation.x = -0.25; const sc = M(new THREE.CylinderGeometry(w / 2, w / 2, 0.06, 12, 1, false, 0, Math.PI), toon(TH.awn[i % 2]), x, 4.6, -6.19, root, 0.008); sc.rotation.set(Math.PI / 2, 0, Math.PI / 2); }
    M(new THREE.BoxGeometry(5.8, 0.1, 0.1), trim, 0.2, 5.1, -6.32, root, 0.01); for (const x of [-2.75, 3.15]) M(new THREE.CylinderGeometry(0.06, 0.06, 5.1, 8), trim, x, 2.55, -6.32, root, 0.01, 0.06); }
  const bulbs = []; { const bm = toon('#fff4d0', { emissive: new THREE.Color('#ffcf70'), emissiveIntensity: 1 }); for (const [z, y0] of [[-3.6, 5.2], [-9.4, 5.6]]) for (let i = 0; i < 10; i++) { const u = i / 9, x = -6.5 + u * 13, y = y0 - Math.sin(u * Math.PI) * 0.7; const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), bm); b.position.set(x, y, z); root.add(b); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: new THREE.Color(['#ffd8a0', TH.accent, TH.trim][i % 3]), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.8 })); s.position.copy(b.position); s.scale.setScalar(0.55); root.add(s); bulbs.push(s); } }
  { M(new THREE.BoxGeometry(2.4, 0.08, 0.6), toon('#7a4e32'), -4.6, 1.3, -9.9, root, 0.01); M(new THREE.BoxGeometry(2.4, 0.08, 0.6), toon('#7a4e32'), -4.6, 2.2, -9.9, root, 0.01);
    const plush = ['#f472b6', '#38bdf8', '#ffd23a', '#22c55e', '#a78bfa', '#f2741f']; plush.forEach((c, i) => { const p = new THREE.Group(), x = -5.5 + (i % 3) * 0.85, y = i < 3 ? 1.34 : 2.24; p.position.set(x, y, -9.85); root.add(p); M(new THREE.SphereGeometry(0.22, 12, 10), toon(c), 0, 0.2, 0, p, 0.014, 0.22); for (const s of [-1, 1]) M(new THREE.ConeGeometry(0.07, 0.16, 6), toon(c), s * 0.12, 0.42, 0, p, 0.01); M(new THREE.SphereGeometry(0.03, 6, 4), toon('#201e1d'), 0, 0.22, 0.2, p, 0); });
    const crest = new THREE.Mesh(new THREE.CircleGeometry(0.6, 32), new THREE.MeshBasicMaterial({ map: crestTex(TH.letter, TH.trim, TH.wall, '#ffffff') })); crest.position.set(-4.6, 3.3, -10.75); root.add(crest); }
  // throw line rail + ball bucket
  { for (let i = 0; i < 8; i++) M(new THREE.BoxGeometry(0.42, 0.1, 0.1), toon(i % 2 ? '#ffffff' : TH.accent), -1.6 + i * 0.44, 0.92, -0.95, root, 0.008); for (const x of [-1.8, 1.8]) M(new THREE.CylinderGeometry(0.04, 0.04, 0.92, 8), steel, x, 0.46, -0.95, root, 0.008); }
  const bucket = new THREE.Group(); bucket.position.set(STAND_X - 0.85, 0, -0.2); root.add(bucket); M(new THREE.CylinderGeometry(0.26, 0.2, 0.5, 16, 1, true), toon(TH.accent, { side: THREE.DoubleSide }), 0, 0.25, 0, bucket, 0.012);
  const ballGeo = new THREE.SphereGeometry(0.11, 16, 12), bucketBalls = []; for (let i = 0; i < 8; i++) { const b = M(ballGeo, toon('#f3efe6'), Math.cos(i * 2.4) * (i ? 0.13 : 0), 0.5 + Math.floor(i / 4) * 0.12, Math.sin(i * 2.4) * (i ? 0.13 : 0), bucket, 0.01, 0.11); bucketBalls.push(b); }

  // ---------------- foxes ----------------
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.scale.setScalar(FOX_S * (f.userData.P.body ? 1 : 1)); return f; };
  const player = hideGear(cast.make('player', { gear: 'none' }));
  const npcFox = NPCS.map(n => { const f = hideGear(kit.makeFox({ ...cast.CAST.player, look: { ...cast.CAST.player.look, ...n.look }, torso: n.torso, outfit: n.outfit, crest: '', gear: 'none', mood: 'happy', eyes: ['#22c55e', '#22c55e'] })); f.visible = false; return f; });
  const colFox = NET_COLS.map(([, c], i) => { const d = '#' + new THREE.Color(c).multiplyScalar(0.45).getHexString(); const f = hideGear(kit.makeFox({ ...cast.CAST.player, look: { ...cast.CAST.player.look, fur: ['#f2741f', '#e0823a', '#c96a2a', '#d98a3a', '#b8602a'][i] }, torso: [c, c, d], outfit: 'tee', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; return f; });
  const heldBall = new THREE.Mesh(ballGeo, toon('#f3efe6')); addOutline(heldBall, 0.01, 0.11); heldBall.visible = false; scene.add(heldBall);
  const flyBall = new THREE.Mesh(ballGeo, toon('#f3efe6')); addOutline(flyBall, 0.01, 0.11); flyBall.visible = false; flyBall.castShadow = true; scene.add(flyBall);
  const throwArm = f => f.userData.P.arms[0];   // arms[0] sits on the fox's right; facing -Z that is screen right, toward the target
  const SPEC = [[-3.0, -4.6, 0.6], [-3.9, -5.6, 0.7], [-2.4, -6.2, 0.7], [3.4, -2.6, -0.45], [3.6, -4.2, -0.6], [-3.6, -1.2, 0.45]];

  // ---------------- particles: splash droplets + ripples ----------------
  const drops = []; for (let i = 0; i < 44; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xbfe9ff, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; scene.add(s); drops.push({ s, v: V3(), life: 0 }); }
  function splash(x, z, n = 40, power = 1) { for (let i = 0; i < n; i++) { const d = drops[i % drops.length]; d.life = rr(0.8, 1.3); d.s.visible = true; d.s.position.set(x + rr(-0.4, 0.4), WATER_Y, z + rr(-0.4, 0.4)); d.v.set(rr(-1.6, 1.6), rr(3, 6.5) * power, rr(-0.6, 2.4)); d.s.scale.setScalar(rr(0.12, 0.26)); } }
  const ripples = []; for (let i = 0; i < 3; i++) { const r = new THREE.Mesh(new THREE.RingGeometry(0.8, 1, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); r.position.set(0, WATER_Y + 0.01, TZC); r.renderOrder = 7; tank.add(r); ripples.push({ m: r, t: 9 }); }
  const dots = []; { const dm = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true, opacity: 0.95 }), dg = new THREE.SphereGeometry(0.035, 8, 6); for (let i = 0; i < 26; i++) { const d = new THREE.Mesh(dg, dm); d.renderOrder = 40; d.visible = false; scene.add(d); dots.push(d); } }
  const aimRing = new THREE.Mesh(new THREE.RingGeometry(0.09, 0.13, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true, opacity: 0.9 })); aimRing.renderOrder = 41; aimRing.visible = false; scene.add(aimRing);

  // ---------------- camera fit (copy of restaurant-kit cameraFit) ----------------
  const SAFE = { top: 0, bottom: 0, left: 0 }, fitCam = new THREE.PerspectiveCamera(46, 1, 0.05, 80), _p = V3(); let shot = null;
  function fitShot(pts, el, yaw = 0, margin = 0.05) { const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const yT = 1 - 2 * SAFE.top / H - margin * 1.2, yB = -1 + 2 * SAFE.bottom / H + margin * 1.2, xR = 1 - margin, xL = -1 + 2 * SAFE.left / W + margin, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), c = V3(); pts.forEach(p => c.add(p)); c.multiplyScalar(1 / pts.length); const tg = c.clone();
    const bounds = d => { fitCam.position.copy(tg).addScaledVector(dir, d); fitCam.lookAt(tg); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.4, hi = 40; for (let k = 0; k < 18; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tg.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tg.clone().addScaledVector(dir, d), look: tg }; }
  function refit() { const W = CW(), H = CH(), port = H > W; camera.fov = port ? 52 : 44; camera.aspect = W / H; camera.updateProjectionMatrix();
    const pts = [V3(-CAGE.x - 0.1, 0.25, TZ0), V3(CAGE.x, 0.2, TZ0), V3(0, SEAT_Y + 2.05, SEAT_Z), V3(TX0 + 0.85, TY0 + 0.65, Z_T), V3(TX0 - 0.2, TY0 - 0.75, Z_T), V3(R0.x + 0.05, R0.y + 0.2, R0.z), V3(STAND_X - 0.3, 1.2, 0), V3(STAND_X, 2.05, 0.15), V3(0, CAGE.y + 0.95, TZ0)];
    shot = fitShot(pts, port ? 0.2 : 0.14, Math.PI - (port ? 0.1 : 0.06), 0.04); }
  function onRs() { renderer.setSize(CW(), CH()); refit(); }
  addEventListener('resize', onRs); let ro = null; try { ro = new ResizeObserver(onRs); ro.observe(container); } catch (e) {}
  refit();

  // ---------------- state ----------------
  const S = { phase: 'intro', mode: null, lvl: LEVELS.still, players: [], cur: 0, n: 0, round: 0, seat: null, meter: 0, ph: 0, wind: 0, t: 0, flash: null, say: null, timer: 0, count: 0, done: null, roundCard: null,
    setup: { n: 2, level: 'swing', balls: 5 }, seed: 1, help: false, shake: 0, dunk: null, dirty: true, aimRes: null, keys: {}, flight: null, queue: [], cheer: 0, sayHold: 0, msg: '' };
  const aim = { ax: 0.3, ay: 0.3, drag: null, cock: 0, rel: -1 };
  const me = () => S.players.find(p => p.me) || null, curP = () => S.players[S.cur] || null;
  const seatInfo = () => S.seat ? S.seat : null;
  function flash(txt, col = '#ffd23a', t = 1.4) { S.flash = { txt, col, t }; S.dirty = true; }
  function sayLine(text, hold = 2.6) { const s = seatInfo(); if (!s) return; S.say = { text, t: hold }; const u = s.fox.userData; u.say = { text, t: 0 }; u.talking = true; S.dirty = true; }

  // put foxes where the round needs them
  function layout() {
    [player, ...npcFox, ...colFox].forEach(f => { f.visible = false; f.userData.lookAt = null; f.userData.sit = false; f.userData.fall = null; f.position.set(0, 0, 0); f.rotation.set(0, 0, 0); });
    const th = curP(), seat = seatInfo(); let si = 0;
    const place = (f, role) => { f.visible = true; if (role === 'throw') { f.position.set(STAND_X, 0, 0); f.rotation.y = Math.PI; f.userData.lookAt = V3(TX0, TY0, Z_T); }
      else if (role === 'seat') { f.position.set(0, SEAT_Y - 0.5 * FOX_S * 1.25 + 0.02, SEAT_Z); f.rotation.y = 0; f.userData.sit = true; f.userData.lookAt = V3(R0.x, R0.y, 0); }
      else { const [x, z, ry] = SPEC[si++ % SPEC.length]; f.position.set(x, 0, z); f.rotation.y = Math.PI + ry; f.userData.lookAt = V3(1, 2, -7); } };
    if (S.mode === 'solo') { place(player, 'throw'); npcFox.forEach((f, i) => place(f, seat && seat.fox === f ? 'seat' : 'spec')); }
    else { S.players.forEach((p, i) => { if (p.gone) return; place(p.fox, i === S.cur ? 'throw' : seat && seat.fox === p.fox ? 'seat' : 'spec'); }); }
    if (S.phase === 'intro') { player.visible = true; place(player, 'throw'); const f = npcFox[0]; place(f, 'seat'); S.seat = S.seat || { fox: f, name: NPCS[0].name, col: '#ffd23a' }; }
    const th2 = S.mode === 'solo' || S.phase === 'intro' ? player : th && th.fox; heldBall.visible = !!th2 && !S.flight; if (th2) { throwArm(th2).add(heldBall); heldBall.position.set(0, -0.5, 0.07); heldBall.scale.setScalar(1 / 1.25); }
    seatPivot.rotation.x = 0; S.dirty = true;
  }
  function bucketShow(n) { bucketBalls.forEach((b, i) => b.visible = i < n); }
  function pickSeat() {
    if (S.mode === 'solo') { const n = SOLO_ROUNDS[S.round] ? S.round : 0; return { fox: npcFox[n], name: NPCS[n].name, col: '#ffd23a', npc: n }; }
    const live = S.players.map((p, i) => ({ p, i })).filter(o => !o.p.gone && o.i !== S.cur); if (!live.length) return null;
    const top = Math.max(...live.map(o => o.p.score)); const lead = live.filter(o => o.p.score === top);
    let best = lead[0]; if (lead.length > 1) { const N = S.players.length; for (let k = 1; k <= N; k++) { const o = lead.find(q => q.i === (S.cur + k) % N); if (o) { best = o; break; } } }
    return { fox: best.p.fox, name: best.p.name, col: best.p.col, pi: best.i, me: !!best.p.me };
  }
  function windFor(n) { if (!S.lvl.wind) return 0; const r = rng(S.seed * 7919 + n * 104729)(); return Math.round((r * 2 - 1) * S.lvl.wind * 10) / 10; }

  // ---------------- flow ----------------
  function startSolo() { unlock(); S.mode = 'solo'; S.round = 0; S.seed = (Math.random() * 1e9) | 0; S.players = [{ id: 'me', name: 'YOU', col: '#ffd23a', fox: player, me: true, score: 0, hits: 0, bulls: 0, dunks: 0, streak: 0, left: DUNK.balls, aim: { ax: 0.3, ay: 0.3 }, rs: 0 }]; S.n = 0; S.done = null; beginRound(); }
  function beginRound() { const R = SOLO_ROUNDS[S.round]; S.lvl = LEVELS[R.lv]; const p = S.players[0]; p.left = DUNK.balls; p.rs = 0; p.rh = 0; p.rb = 0; p.rd = 0; S.meter = 0; S.cur = 0; S.seat = pickSeat(); S.roundCard = null; S.phase = 'count'; S.count = 3; S.countT = 0.7; layout(); flash('ROUND ' + (S.round + 1) + ' · ' + R.title, '#ffd23a', 1.6); beginTurn(true); S.phase = 'count'; }
  function startParty() { unlock(); const n = clamp(S.setup.n, 2, 5); S.mode = 'party'; S.lvl = LEVELS[S.setup.level]; S.seed = (Math.random() * 1e9) | 0; S.players = Array.from({ length: n }, (_, i) => ({ id: 'p' + i, name: NET_COLS[i][0], col: NET_COLS[i][1], fox: colFox[i], me: false, score: 0, hits: 0, bulls: 0, dunks: 0, streak: 0, left: S.setup.balls, aim: { ax: 0.3, ay: 0.3 } })); S.n = 0; S.cur = 0; S.meter = 0; S.done = null; S.seat = pickSeat(); layout(); S.phase = 'pass'; S.dirty = true; }
  function beginTurn(silent) { const p = curP(); if (!p) return; const ns = pickSeat(); if (!S.seat || !ns || ns.fox !== S.seat.fox) { if (S.seat && ns && S.mode !== 'solo') { S.meter = 0; flash(ns.name + ' TAKES THE SEAT', ns.col, 1.4); } S.seat = ns; }
    aim.ax = p.aim.ax; aim.ay = p.aim.ay; aim.drag = null; aim.cock = 0; S.wind = windFor(S.n); S.timer = S.mode === 'online' ? 25 : 0; S.lastTick = 0; layout(); bucketShow(p.left);
    if (!silent) S.phase = 'play'; if (S.seat && Math.random() < 0.55) setTimeout(() => { if (S.phase === 'play' && !S.flight && S.seat && !S.seat.me) sayLine(pick(TAUNTS)); }, 500); S.dirty = true; }
  function canThrow() { const p = curP(); return S.phase === 'play' && !S.flight && !S.dunk && !!p && (S.mode !== 'online' || p.me) && !S.help; }

  function throwNow(remote) {
    let ax, ay; const p = curP(); if (!p) return;
    if (remote) { ax = remote.ax; ay = remote.ay; S.ph = remote.ph; S.wind = remote.wind; }
    else { if (!canThrow()) return; const w = wob(); ax = clamp(aim.ax + w.x, -1, 1); ay = clamp(aim.ay + w.y, 0, 1); p.aim = { ax: aim.ax, ay: aim.ay }; }
    const res = solveThrow(ax, ay, S.ph, S.wind, S.lvl);
    if (!remote && S.mode === 'online') netSend('ev', { k: 'throw', n: S.n, ax, ay, ph: S.ph, wind: S.wind, kind: res.kind });
    if (remote && remote.kind && remote.kind !== res.kind) res.kind = remote.kind;   // the thrower's phone decides; keeps every phone's score identical
    const v = vel(ax, ay); S.flight = { t: 0, v, a: V3(S.wind, -9.8, 0), p0: R0.clone(), res, hitDone: false, post: null, end: 0, who: S.cur, ph0: S.ph };
    flyBall.visible = true; flyBall.material = toon(S.mode === 'solo' ? '#f3efe6' : p.col); flyBall.position.copy(R0); heldBall.visible = false; aim.rel = 0; aim.cock = 0; aim.drag = null; p.left--; bucketShow(p.left); SFX.throw(); stopAimDots(); S.timer = 0; S.dirty = true;
  }
  function wob() { const k = S.lvl.wob, t = S.t; return { x: k * Math.sin(t * 3.1) + k * 0.6 * Math.sin(t * 7.3), y: k * 0.8 * Math.sin(t * 2.3 + 1) }; }
  const KIND_TXT = { short: ['TOO SHORT', '#ff9a8a'], cage: ['CAGE!', '#ff9a8a'], glass: ['CLUNK · THE GLASS', '#ff9a8a'], over: ['OVER', '#ff9a8a'], under: ['UNDER', '#ff9a8a'], wide: ['WIDE', '#ff9a8a'], inside: ['INSIDE · AIM RIGHT', '#ff9a8a'] };
  function resolve(F) {
    const p = S.players[F.who], k = F.res.kind; let pts = 0, dunk = false;
    if (k === 'bull') { pts = 100; dunk = true; p.bulls++; if (p.rb != null) p.rb++; } else if (k === 'inner') { pts = 50; S.meter += 0.5; } else if (k === 'outer') { pts = 25; S.meter += 0.34; }
    if (S.meter >= 0.99) dunk = true;
    if (pts) { p.streak++; pts += (p.streak - 1) * 10; p.hits++; if (p.rh != null) p.rh++; } else p.streak = 0;
    if (dunk) { pts += 50; p.dunks++; if (p.rd != null) p.rd++; S.meter = 0; }
    p.score += pts; if (p.rs != null) p.rs += pts;
    if (HIT[k]) { SFX.clang(); discKick = 1; if (k === 'bull') { SFX.bull(); discFlash.material.opacity = 1; } S.players.forEach(q => { if (q !== p && q.fox.visible && !(S.seat && S.seat.fox === q.fox)) q.fox.userData.hop = 1; }); if (S.mode === 'solo') npcFox.forEach(f => { if (f.visible && !(S.seat && S.seat.fox === f)) f.userData.hop = 1; }); }
    if (dunk) { flash(k === 'bull' ? 'BULLSEYE · DUNK!' : 'METER FULL · DUNK!', '#22c55e', 1.8); startDunk(); }
    else if (HIT[k]) { flash('+' + pts + (k === 'inner' ? ' · SO CLOSE' : ' · RING') + (p.streak > 1 ? ' · STREAK ×' + p.streak : ''), '#ffd23a'); if (S.seat && !S.seat.me && Math.random() < 0.7) sayLine(pick(CLOSE), 1.8); }
    else { const [t, c] = KIND_TXT[k] || ['MISS', '#ff9a8a']; flash(t, c); if (k === 'cage') SFX.cage(); else if (k === 'glass') SFX.glass(); else SFX.thud(); if (S.seat && !S.seat.me && Math.random() < 0.6) sayLine(pick(TAUNTS), 2); if (S.mode !== 'solo') SFX.aww(); }
    if (navigator.vibrate && touch) try { navigator.vibrate(dunk ? [40, 40, 80] : HIT[k] ? 25 : 0); } catch (e) {}
    S.dirty = true;
  }
  let discKick = 0;
  function startDunk() { const s = seatInfo(); if (!s) return; S.dunk = { t: 0, fox: s.fox, y0: s.fox.position.y, splashed: false }; s.fox.userData.mood = 'surprised'; SFX.cheer(); S.shake = 0.35; }
  function afterBall() {
    if (S.mode === 'online' && !S.players.some(p => p.me && !p.gone)) return;
    const p = curP();
    if (S.mode === 'solo') { if (p.left <= 0) { roundEnd(); return; } S.n++; beginTurn(); return; }
    S.n++; const nx = nextPlayer(S.cur); if (nx < 0) { finish(); return; } const changed = nx !== S.cur; S.cur = nx;
    if (S.mode === 'party' && changed) { S.seat = pickSeat(); layout(); S.phase = 'pass'; SFX.pass(); S.dirty = true; return; }
    beginTurn(); if (S.mode === 'online' && curP() && curP().me) { SFX.go(); flash('YOUR THROW', '#ffd23a', 1.1); }
  }
  function nextPlayer(from) { const N = S.players.length; for (let k = 1; k <= N; k++) { const i = (from + k) % N, q = S.players[i]; if (!q.gone && q.left > 0) return i; } return -1; }
  function roundEnd() { const p = S.players[0], last = S.round >= SOLO_ROUNDS.length - 1; S.phase = 'round'; save.setStat('dunkTank.dunks', save.stat('dunkTank.dunks', 0) + p.rd);
    S.roundCard = { kicker: 'ROUND ' + (S.round + 1) + ' / 3 · ' + SOLO_ROUNDS[S.round].title, title: p.rd ? p.rd + (p.rd === 1 ? ' DUNK' : ' DUNKS') + '!' : 'STILL DRY', rows: [['Hits', p.rh + ' / ' + DUNK.balls], ['Bullseyes', String(p.rb)], ['Dunks', String(p.rd)], ['Round points', String(p.rs)], ['Total', String(p.score)]], btn: last ? 'SEE RESULTS' : 'ROUND ' + (S.round + 2) + ' · ' + SOLO_ROUNDS[S.round + 1].title, next: last ? null : SOLO_ROUNDS[S.round + 1].line }; S.dirty = true; }
  function nextRound() { if (S.phase !== 'round') return; if (S.round >= SOLO_ROUNDS.length - 1) { finish(); return; } S.round++; beginRound(); }
  function finish() {
    S.phase = 'done'; S.flight = null; stopAimDots(); const ranked = S.players.map((p, i) => ({ ...p, i })).sort((a, b) => b.score - a.score || b.dunks - a.dunks);
    if (S.mode === 'solo') { const p = S.players[0], tot = p.score, grade = tot >= 1800 ? 'S' : tot >= 1200 ? 'A' : tot >= 800 ? 'B' : tot >= 400 ? 'C' : 'D', prev = save.stat('dunkTank.best', 0), nb = save.best('dunkTank.best', tot), gold = Math.floor(tot / 20), xp = Math.floor(tot / 10);
      save.addGold(gold); save.addXp(xp); save.setStat('dunkTank.played', save.stat('dunkTank.played', 0) + 1); let trophy = false; if (tot >= DUNK.trophy && !save.flag('dunkTank.trophy')) { save.setFlag('dunkTank.trophy'); save.give('dunkTankTrophy'); trophy = true; }
      S.done = { solo: true, grade, title: tot + ' POINTS', kicker: 'DUNK TANK · SOLO', sub: (nb ? 'NEW BEST' : 'BEST ' + prev) + ' · +' + gold + ' GOLD · +' + xp + ' XP', trophy, rows: [['Hits', p.hits + ' / 15'], ['Bullseyes', String(p.bulls)], ['Dunks', String(p.dunks)], ['Gold', '+' + gold], ['XP', '+' + xp]], total: tot, ranks: [] };
    } else { const top = ranked[0], tie = ranked.length > 1 && ranked[1].score === top.score && ranked[1].dunks === top.dunks, mine = me();
      const won = !!mine && !tie && top.id === mine.id; if (S.mode === 'online' && mine) { save.addXp(Math.floor(mine.score / 20)); if (won) save.setStat('dunkTank.onlineWins', save.stat('dunkTank.onlineWins', 0) + 1); }
      S.done = { solo: false, grade: tie ? 'TIE' : '1ST', title: tie ? 'IT’S A TIE' : top.name + (top.me ? ' (YOU)' : '') + ' WINS', kicker: 'DUNK TANK · ' + (S.mode === 'online' ? 'ONLINE' : 'PARTY'), sub: S.mode === 'online' && mine ? (won ? 'TANK CHAMP · ' : '') + '+' + Math.floor(mine.score / 20) + ' XP' : 'Pass the phone for a rematch', won, gradeCol: tie ? '#3a3836' : top.col,
        ranks: ranked.map((p, k) => ({ name: (k + 1) + '. ' + p.name + (p.me ? ' · YOU' : '') + (p.gone ? ' · LEFT' : ''), col: p.col, v: p.score + ' PTS · ' + p.dunks + ' DUNK' + (p.dunks === 1 ? '' : 'S') })), rows: [], total: top.score };
      if (S.mode === 'online') { NET.ready = false; netSend('ev', { k: 'playing', on: false }); } }
    SFX.cheer(); S.dirty = true;
  }
  function toIntro() { if (S.mode === 'online') netLeave(); S.mode = null; S.phase = 'intro'; S.players = []; S.flight = null; S.dunk = null; S.done = null; S.roundCard = null; S.seat = null; S.lvl = LEVELS.still; S.meter = 0; S.say = null; layout(); bucketShow(8); S.dirty = true; }
  function again() { if (S.mode === 'solo') startSolo(); else if (S.mode === 'party') startParty(); else if (S.mode === 'online') { netReadyToggle(true); } }
  function passGo() { if (S.phase !== 'pass') return; unlock(); beginTurn(); SFX.go(); }

  // ---------------- input ----------------
  const el = renderer.domElement;
  const R = () => Math.min(CW(), CH()) * (prefs.aimMode === 'pull' ? 0.5 : 0.55);
  el.addEventListener('pointerdown', e => { unlock(); if (!canThrow() || aim.drag) return; aim.drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, ax0: aim.ax, ay0: aim.ay, moved: 0 }; try { el.setPointerCapture(e.pointerId); } catch (er) {} S.dirty = true; });
  el.addEventListener('pointermove', e => { const d = aim.drag; if (!d || d.id !== e.pointerId) return; const sg = prefs.aimMode === 'pull' ? -1 : 1, dx = (e.clientX - d.x0) / R(), dy = (d.y0 - e.clientY) / R(); d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.x0, e.clientY - d.y0));
    aim.ax = clamp(d.ax0 + sg * dx * 1.15, -1, 1); aim.ay = clamp(d.ay0 + sg * dy * 0.9, 0, 1); });
  const up = e => { const d = aim.drag; if (!d || d.id !== e.pointerId) return; aim.drag = null; if (d.moved < 10) { flash(prefs.aimMode === 'pull' ? 'DRAG BACK TO AIM · LET GO TO THROW' : 'DRAG TO AIM · LET GO TO THROW', '#ffffff', 1.3); S.dirty = true; return; } throwNow(); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', e => { if (aim.drag && aim.drag.id === e.pointerId) aim.drag = null; });
  const onKey = e => { if (/INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) return; const down = e.type === 'keydown';
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS'].includes(e.code)) { S.keys[e.code] = down; if (canThrow()) e.preventDefault(); if (down) unlock(); }
    if (down && (e.code === 'Space' || e.code === 'Enter')) { if (S.phase === 'pass') { e.preventDefault(); passGo(); } else if (canThrow()) { e.preventDefault(); throwNow(); } }
    if (down && e.code === 'KeyH') { prefs.aimSound = !prefs.aimSound; savePrefs(); flash('AIM SOUND ' + (prefs.aimSound ? 'ON' : 'OFF'), '#7dd3fc'); } };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  const onHide = () => { if (NET.api) netLeave(true); }; addEventListener('pagehide', onHide);

  // ---------------- per-frame ----------------
  function stopAimDots() { dots.forEach(d => d.visible = false); aimRing.visible = false; }
  function drawAim() {
    if (!canThrow() && !(S.phase === 'play' && S.mode === 'online' && !S.flight)) { stopAimDots(); return; }
    const mine = canThrow(), w = mine ? wob() : { x: 0, y: 0 }, ax = clamp(aim.ax + w.x, -1, 1), ay = clamp(aim.ay + w.y, 0, 1), v = vel(ax, ay), res = solveThrow(ax, ay, S.ph, 0, S.lvl);
    if (!mine) { stopAimDots(); return; }
    S.aimRes = res; const tEnd = res.t * S.lvl.prev, n = dots.length;
    for (let i = 0; i < n; i++) { const t = (i + 1) / n * tEnd, d = dots[i]; d.visible = true; d.position.set(R0.x + v.x * t, R0.y + v.y * t - 4.9 * t * t, R0.z + v.z * t); const k = 0.7 + 0.6 * (i / n); d.scale.setScalar(k * (aim.drag ? 1.15 : 0.9)); }
    if (S.lvl.prev >= 1 && !/short|cage|glass/.test(res.kind)) { aimRing.visible = true; aimRing.position.set(res.x, res.y, Z_T + 0.06); aimRing.material.color.set(res.kind === 'bull' ? '#22c55e' : HIT[res.kind] ? '#ffd23a' : '#ff9a8a'); } else aimRing.visible = false;
    if (aim.drag || anyKey()) aimSoundTick(res, S.t);
  }
  const anyKey = () => Object.values(S.keys).some(Boolean);
  let last = performance.now(), raf = 0, emitT = 0;
  function frame(now) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; const ff = S.queue.length ? 4 : 1; for (let i = 0; i < ff; i++) { S.t += dt; step(dt); } render(dt); emitT -= dt; if (S.dirty || emitT <= 0) { emitT = 0.1; S.dirty = false; try { onState(hud()); } catch (e) {} } }
  function step(dt) {
    // keyboard aim
    if (canThrow()) { const K = S.keys, sp = dt * 0.45; if (K.ArrowLeft || K.KeyA) aim.ax = clamp(aim.ax - sp, -1, 1); if (K.ArrowRight || K.KeyD) aim.ax = clamp(aim.ax + sp, -1, 1); if (K.ArrowUp || K.KeyW) aim.ay = clamp(aim.ay + sp * 0.8, 0, 1); if (K.ArrowDown || K.KeyS) aim.ay = clamp(aim.ay - sp * 0.8, 0, 1); }
    // target motion (paused while a ball is in the air for observers: they follow the thrower's phase)
    S.ph += dt * S.lvl.w; const tp = targetAt(S.ph, S.lvl); tgt.position.set(tp.x, 0, Z_T - 0.05); tgtPole.scale.y = tp.y; tgtPole.position.y = tp.y / 2; disc.position.set(0, tp.y, 0.05);
    discKick = Math.max(0, discKick - dt * 2.2); disc.rotation.x = -Math.sin(discKick * Math.PI) * 0.7 * (discKick > 0 ? 1 : 0); discFlash.material.opacity = Math.max(0, discFlash.material.opacity - dt * 2.5);
    if (S.flash) { S.flash.t -= dt; if (S.flash.t <= 0) { S.flash = null; S.dirty = true; } }
    if (S.say) { S.say.t -= dt; if (S.say.t <= 0) { S.say = null; S.dirty = true; } }
    if (S.phase === 'count') { S.countT -= dt; if (S.countT <= 0) { S.count--; S.countT = 0.6; if (S.count <= 0) { S.phase = 'play'; SFX.go(); if (S.queue.length) { const q = S.queue.shift(); setTimeout(() => netApply(q), 0); } if (S.mode === 'online' && curP() && curP().me) flash('YOUR THROW', '#ffd23a', 1.1); } else SFX.tick(); S.dirty = true; } }
    if (S.phase === 'play' && S.mode === 'online' && S.timer > 0 && !S.flight && !S.dunk) { S.timer -= dt; const sec = Math.ceil(S.timer); if (sec !== S.lastTick) { S.lastTick = sec; S.dirty = true; if (sec <= 5 && curP() && curP().me) SFX.tick(); } if (S.timer <= 0 && curP() && curP().me) { aim.ax = rr(-0.1, 0.8); aim.ay = rr(0.15, 0.5); throwNow(); } }
    // flight
    const F = S.flight; if (F) { F.t += dt;
      if (!F.post) { const t = Math.min(F.t, F.res.t); flyBall.position.set(F.p0.x + F.v.x * t + 0.5 * F.a.x * t * t, F.p0.y + F.v.y * t - 4.9 * t * t, F.p0.z + F.v.z * t); flyBall.rotation.x -= dt * 14;
        if (F.t >= F.res.t) { resolve(F); const k = F.res.kind, vt = V3(F.v.x + F.a.x * F.res.t, F.v.y - 9.8 * F.res.t, F.v.z);
          if (HIT[k] || /cage|glass/.test(k)) vt.set(vt.x * 0.3 + rr(-0.5, 0.5), Math.max(1.2, vt.y * 0.2 + 1.5), -vt.z * 0.22); else if (k === 'short') vt.set(vt.x * 0.5, -vt.y * 0.35, vt.z * 0.5);
          F.post = { v: vt, t: 0 }; } }
      else { const P = F.post; P.t += dt; P.v.y -= 9.8 * dt; flyBall.position.addScaledVector(P.v, dt); if (flyBall.position.y < 0.11) { flyBall.position.y = 0.11; P.v.y = Math.abs(P.v.y) * 0.4; P.v.x *= 0.7; P.v.z *= 0.7; }
        if (flyBall.position.z < TZ1 + 0.3) { flyBall.position.z = TZ1 + 0.3; P.v.z = Math.abs(P.v.z) * 0.3; }
        if (Math.abs(flyBall.position.x) < CAGE.x && flyBall.position.z < TZ0 && flyBall.position.z > TZ1 && flyBall.position.y < WATER_Y + 0.1 && !P.wet) { P.wet = true; splash(flyBall.position.x, flyBall.position.z, 6, 0.4); P.v.multiplyScalar(0.2); }
        if (P.t > 1.0 && !S.dunk) { flyBall.visible = false; S.flight = null; const q = S.queue.shift(); afterBall(); if (q) setTimeout(() => netApply(q), 50); } } }
    // dunk: seat drops, fox falls, splash, climbs back up
    const D = S.dunk; if (D) { D.t += dt; const f = D.fox, u = f.userData;
      seatPivot.rotation.x = D.t < 0.12 ? D.t / 0.12 * 1.35 : D.t < 1.6 ? 1.35 : Math.max(0, 1.35 - (D.t - 1.6) * 2.5);
      if (D.t < 0.55) { const k = D.t / 0.55; f.position.y = D.y0 - k * k * (D.y0 - 0.05); f.rotation.x = -k * 0.6; u.sit = false; u.fall = true; }
      else if (D.t < 1.7) { if (!D.splashed) { D.splashed = true; splash(0, SEAT_Z, 44, 1.1); ripples.forEach((r, i) => r.t = -i * 0.15); SFX.splash(); u.mood = 'sad'; if (!(S.seat && S.seat.me)) setTimeout(() => sayLine(pick(DUNKED), 2.2), 350); } f.position.y = 0.05 + Math.sin(S.t * 3) * 0.04; f.rotation.x = damp(f.rotation.x, 0, 4, dt); }
      else if (D.t < 2.6) { const k = smooth(1.7, 2.6, D.t); f.position.y = 0.05 + k * (D.y0 - 0.05); f.position.z = SEAT_Z + Math.sin(k * Math.PI) * 0.15; u.fall = false; u.sit = k > 0.85; }
      else { f.position.y = D.y0; f.position.z = SEAT_Z; f.rotation.x = 0; u.sit = true; u.fall = false; u.mood = 'happy'; S.dunk = null; if (S.flight && S.flight.post && S.flight.post.t > 1.0) { flyBall.visible = false; S.flight = null; const q = S.queue.shift(); afterBall(); if (q) setTimeout(() => netApply(q), 50); } } }
    // droplets + ripples + water surface
    for (const d of drops) { if (d.life <= 0) continue; d.life -= dt; d.v.y -= 9.8 * dt; d.s.position.addScaledVector(d.v, dt); d.s.material.opacity = clamp(d.life * 1.4, 0, 0.9); if (d.life <= 0 || d.s.position.y < 0) { d.life = 0; d.s.visible = false; } }
    for (const r of ripples) { r.t += dt; const k = r.t / 1.2; r.m.visible = k >= 0 && k < 1; if (r.m.visible) { r.m.scale.setScalar(0.1 + k * 1.1); r.m.material.opacity = 0.8 * (1 - k); } }
    { const p = surf.geometry.attributes.position, amp = S.dunk ? 0.05 : 0.012; for (let i = 0; i < p.count; i++) { const x = surfBase[i * 3], y = surfBase[i * 3 + 1]; p.setZ(i, Math.sin(x * 4 + S.t * 3) * amp + Math.cos(y * 5 + S.t * 2.3) * amp); } p.needsUpdate = true; }
    bulbs.forEach((b, i) => b.material.opacity = 0.6 + 0.3 * Math.sin(S.t * 2 + i * 1.7));
    // foxes
    const thF = S.mode === 'solo' || S.phase === 'intro' ? player : curP() && curP().fox;
    for (const f of [player, ...npcFox, ...colFox]) { if (!f.visible) continue; const u = f.userData; kit.animFox(f, dt, 0, !!u.fall);
      const P = u.P; if (u.sit) { P.legs[0].rotation.x = P.legs[1].rotation.x = -1.45; P.legs[0].rotation.z = 0.1; P.legs[1].rotation.z = -0.1; const wave = u.talking ? Math.sin(S.t * 9) * 0.5 : 0; P.arms[0].rotation.x = -0.2; P.arms[0].rotation.z = -0.35; P.arms[1].rotation.x = u.talking ? -2.5 + wave : -0.2; P.arms[1].rotation.z = 0.35; }
      else if (u.fall) { P.arms[0].rotation.x = -2.8 + Math.sin(S.t * 18) * 0.4; P.arms[1].rotation.x = -2.8 - Math.sin(S.t * 18) * 0.4; P.legs[0].rotation.x = -1.2 + Math.sin(S.t * 14) * 0.5; P.legs[1].rotation.x = -1.2 - Math.sin(S.t * 14) * 0.5; }
      if (f === thF && !u.sit) { const arm = throwArm(f); const dragK = aim.drag ? 1 : 0; aim.cock = damp(aim.cock, dragK, 10, dt);
        if (aim.rel >= 0) { aim.rel += dt; const k = aim.rel; arm.rotation.x = k < 0.12 ? -3.5 + (k / 0.12) * 2.6 : damp(arm.rotation.x, -0.25, 6, dt); P.body.rotation.y = k < 0.12 ? 0.35 - k / 0.12 * 0.6 : damp(P.body.rotation.y, 0, 5, dt); if (k > 0.9) aim.rel = -1; }
        else { arm.rotation.x = -0.35 - aim.cock * 3.15; arm.rotation.z = -0.25 - aim.cock * 0.2; P.body.rotation.y = damp(P.body.rotation.y, aim.cock * 0.35, 8, dt); } } }
    if (S.shake > 0) S.shake = Math.max(0, S.shake - dt);
    drawAim();
  }
  function render() { if (shot) { camera.position.copy(shot.pos); if (S.shake > 0) camera.position.add(V3(rr(-1, 1), rr(-1, 1), 0).multiplyScalar(S.shake * 0.12)); camera.lookAt(shot.look); } renderer.render(scene, camera); }
  const hv = V3();
  function headScreen(f) { if (!f) return null; f.userData.P.head.getWorldPosition(hv); hv.y += 0.55; hv.project(camera); if (hv.z > 1) return null; return { x: (hv.x + 1) / 2 * CW(), y: (1 - hv.y) / 2 * CH() }; }

  // ---------------- online (2–5 players) over engine/duel-net.js ----------------
  const NET = { api: null, id: null, st: 'off', code: '', codeIn: '', peers: {}, ready: false, j: 0, status: '', msg: '', ping: null, lastSeen: {}, tok: 0, timer: 0, copied: false, set: { level: 'swing', balls: 5 }, matchIds: null, mid: 0 };
  const netSend = (t, d, to) => { if (NET.api) try { NET.api.send(t, d, to); } catch (e) {} };
  function members() { if (!NET.api) return []; const playing = S.mode === 'online' && !/intro|done|lobby/.test(S.phase); const all = [{ id: NET.id, j: NET.j, ready: NET.ready, playing, me: true }, ...Object.entries(NET.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, 5); }
  const hostId = () => { const m = members(); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : NET.id; };
  const isHost = () => !!NET.api && hostId() === NET.id;
  function netOpen() { unlock(); if (S.mode === 'online' && NET.api) return; S.mode = 'online'; S.phase = 'lobby'; Object.assign(NET, { st: 'menu', code: '', codeIn: NET.codeIn || '', peers: {}, ready: false, msg: '', ping: null, copied: false }); S.dirty = true; }
  async function netJoin(code) { code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { NET.msg = 'Type the 4-letter room code from your friend.'; S.dirty = true; return; }
    netLeave(true); S.mode = 'online'; S.phase = 'lobby'; Object.assign(NET, { st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '', ping: null, copied: false, lastSeen: {} }); S.dirty = true;
    const tok = NET.tok = NET.tok + 1; let api = null; const handlers = { game: 'dunkTank', code, onJoin: id => nHello(id), onLeave: id => nGone(id), onMsg: (t, d, id) => nMsg(t, d, id), onStatus: s => { NET.status = s; S.dirty = true; } };
    try { if (/[?&]net=local/.test(location.search)) throw new Error('local'); const mod = await import(new URL('../../engine/duel-net.js', import.meta.url).href); api = await mod.connectDuel(handlers); }
    catch (e) { try { api = localDuel(handlers); } catch (er) { NET.status = 'offline'; NET.msg = 'Online play could not load. Check your connection.'; S.dirty = true; return; } }
    if (tok !== NET.tok) { api.leave(); return; } NET.api = api; NET.id = api.id; nHello(); S.dirty = true;
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(NET.timer); NET.timer = setInterval(nTick, 1500); }
  function netLeave(quiet) { NET.tok++; clearInterval(NET.timer); if (NET.api) { netSend('ev', { k: 'bye' }); try { NET.api.leave(); } catch (e) {} } NET.api = null; NET.id = null; NET.peers = {}; NET.lastSeen = {}; NET.matchIds = null; NET.ready = false;
    try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} if (!quiet) S.dirty = true; }
  function nHello(to) { if (!NET.api) return; netSend('hi', { v: 1, j: NET.j, ready: NET.ready, playing: S.mode === 'online' && !/intro|done|lobby/.test(S.phase), set: isHost() ? NET.set : null }, to); }
  function nMsg(t, d, id) { if (!NET.api || !d) return; const now = performance.now(), known = !!NET.lastSeen[id];
    if (t === 'hi') { NET.lastSeen[id] = now; NET.peers[id] = { ...(NET.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }; if (d.set && id === hostId()) NET.set = { level: LEVELS[d.set.level] ? d.set.level : 'swing', balls: [3, 5, 8].includes(+d.set.balls) ? +d.set.balls : 5 }; if (!known) setTimeout(() => nHello(id), 0); S.dirty = true; setTimeout(nMaybeStart, 0); return; }
    if (!known) return; NET.lastSeen[id] = now;
    if (t === 'pg') { if (d.t != null) netSend('pg', { e: d.t }, id); else if (d.e != null) { NET.ping = Math.max(1, Math.round(now - d.e)); S.dirty = true; } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { if (NET.peers[id]) NET.peers[id].ready = !!d.on; S.dirty = true; setTimeout(nMaybeStart, 0); }
    else if (d.k === 'set') { if (id === hostId()) { NET.set = { level: LEVELS[d.level] ? d.level : 'swing', balls: [3, 5, 8].includes(+d.balls) ? +d.balls : 5 }; NET.ready = false; Object.values(NET.peers).forEach(p => p.ready = false); S.dirty = true; } }
    else if (d.k === 'start') nStart(d);
    else if (d.k === 'playing') { if (NET.peers[id]) NET.peers[id].playing = !!d.on; S.dirty = true; }
    else if (d.k === 'bye') nGone(id);
    else if (d.k === 'throw') { if (S.mode === 'online' && NET.matchIds && NET.matchIds.includes(id)) netApply({ ...d, from: id }); }
    else if (d.k === 'taunt') { const p = S.players.find(q => q.id === id); if (p && S.seat && S.seat.fox === p.fox) sayLine(QUICK_TAUNTS[d.i | 0] || QUICK_TAUNTS[0], 2); } }
  function netApply(d) { if (S.mode !== 'online' || S.phase === 'done') return; if (S.flight || S.dunk || S.phase === 'count') { if (!S.queue.some(q => q.n === d.n)) S.queue.push(d); return; } if (d.n !== S.n) { if (d.n < S.n) return; }
    const i = S.players.findIndex(p => p.id === d.from); if (i < 0) return; if (i !== S.cur) { S.cur = i; layout(); } if (S.phase !== 'play') S.phase = 'play'; S.n = d.n; throwNow(d); }
  function nGone(id) { if (!NET.lastSeen[id] && !NET.peers[id]) return; delete NET.lastSeen[id]; delete NET.peers[id]; S.dirty = true;
    if (S.mode === 'online' && NET.matchIds && NET.matchIds.includes(id) && !/done|lobby/.test(S.phase)) { const i = S.players.findIndex(p => p.id === id); if (i >= 0 && !S.players[i].gone) { const p = S.players[i]; p.gone = true; p.left = 0; flash(p.name + ' LEFT', '#ff9a8a');
      if (S.players.filter(q => !q.gone).length < 2) { finish(); return; } if (S.seat && S.seat.fox === p.fox) { S.seat = pickSeat(); layout(); }
      if (i === S.cur && !S.flight && !S.dunk) { const nx = nextPlayer(S.cur); if (nx < 0) finish(); else { S.cur = nx; beginTurn(); } } else layout(); } } }
  function nTick() { if (!NET.api) return; netSend('pg', { t: performance.now() }); nHello(); const now = performance.now(); for (const id of Object.keys(NET.lastSeen)) if (now - NET.lastSeen[id] > 20000) nGone(id); }
  function nMaybeStart() { if (!NET.api || S.phase !== 'lobby' || NET.st !== 'room' || !isHost()) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    NET.mid++; const d = { k: 'start', t0: Date.now() + 3200, level: NET.set.level, balls: NET.set.balls, ids: m.map(x => x.id), seed: (Math.random() * 1e9) | 0, mid: NET.mid }; netSend('ev', d); nStart(d); }
  function nStart(d) { if (!NET.api || !Array.isArray(d.ids)) return; if (!d.ids.includes(NET.id)) { NET.msg = 'A game started without you. You join the next one.'; S.dirty = true; return; }
    NET.matchIds = d.ids.slice(0, 5); S.mode = 'online'; S.lvl = LEVELS[d.level] || LEVELS.swing; S.seed = d.seed | 0; S.n = 0; S.cur = 0; S.meter = 0; S.queue = []; S.done = null; S.flight = null; S.dunk = null; NET.ready = false; Object.values(NET.peers).forEach(p => p.ready = false);
    S.players = NET.matchIds.map((id, i) => ({ id, name: NET_COLS[i][0], col: NET_COLS[i][1], fox: colFox[i], me: id === NET.id, score: 0, hits: 0, bulls: 0, dunks: 0, streak: 0, left: [3, 5, 8].includes(+d.balls) ? +d.balls : 5, aim: { ax: 0.3, ay: 0.3 } }));
    S.seat = pickSeat(); layout(); beginTurn(true); let w = (+d.t0 || 0) - Date.now(); if (!(w >= 0 && w <= 6000)) w = 3000; S.phase = 'count'; S.count = 3; S.countT = Math.max(0.3, w / 1000 - 1.8); netSend('ev', { k: 'playing', on: true }); S.dirty = true; }
  function netReadyToggle(force) { if (!NET.api) return; NET.ready = force ? true : !NET.ready; if (S.phase === 'done') { S.phase = 'lobby'; S.done = null; } netSend('ev', { k: 'ready', on: NET.ready }); S.dirty = true; setTimeout(nMaybeStart, 0); }
  function netSet(k, v) { if (!isHost()) return; if (k === 'level' && LEVELS[v]) NET.set.level = v; if (k === 'balls' && [3, 5, 8].includes(v)) NET.set.balls = v; NET.ready = false; Object.values(NET.peers).forEach(p => p.ready = false); netSend('ev', { k: 'set', ...NET.set }); S.dirty = true; }
  async function netShare() { if (!NET.code) return; let u; try { u = new URL(location.href); u.searchParams.set('room', NET.code); u.searchParams.delete('embed'); } catch (e) { return; }
    try { if (navigator.share && touch) await navigator.share({ title: '8 GATES · Dunk Tank', text: 'Come dunk me in 8 GATES. Room ' + NET.code, url: u.href }); else { await navigator.clipboard.writeText(u.href); NET.copied = true; S.dirty = true; setTimeout(() => { NET.copied = false; S.dirty = true; }, 2000); } } catch (e) {} }
  function taunt(i) { const m = me(); if (S.mode !== 'online' || !m || !S.seat || S.seat.fox !== m.fox) return; sayLine(QUICK_TAUNTS[i] || QUICK_TAUNTS[0], 2); netSend('ev', { k: 'taunt', i }); }
  function netBack() { if (NET.st === 'menu' || !NET.api) { toIntro(); return; } netLeave(); NET.st = 'menu'; NET.code = ''; S.phase = 'lobby'; S.dirty = true; }

  // ---------------- HUD state for the DC page ----------------
  function hud() {
    const p = curP(), mine = me(), seat = seatInfo(), W = CW(), H = CH();
    const m = NET.api ? members() : [], host = NET.api ? hostId() : null, full = !!NET.api && m.length === 5 && !m.some(x => x.me);
    const bubble = S.say && seat ? headScreen(seat.fox) : null;
    const turnName = p ? p.name : '', myTurn = canThrow(), onSeat = S.mode === 'online' && !!mine && !!seat && seat.fox === mine.fox;
    let hint = ''; if (S.phase === 'play') { if (S.flight || S.dunk) hint = ''; else if (S.mode === 'online' && p && !p.me) hint = p.name + ' IS THROWING' + (S.timer > 0 ? ' · ' + Math.ceil(S.timer) : ''); else hint = (S.mode === 'party' ? p.name + ' · ' : S.mode === 'online' ? 'YOUR THROW · ' + Math.ceil(S.timer) + ' · ' : '') + (touch ? (prefs.aimMode === 'pull' ? 'PULL BACK TO AIM · LET GO TO THROW' : 'DRAG TO AIM · LET GO TO THROW') : 'DRAG OR ARROWS TO AIM · SPACE TO THROW'); }
    const lvl = S.lvl, ballsMax = S.mode === 'solo' ? DUNK.balls : S.mode === 'online' ? NET.set.balls : S.setup.balls;
    return {
      phase: S.phase, mode: S.mode, world: TH.name, embed, touch, best: save.stat('dunkTank.best', 0), gold: save.data.gold, dunksTotal: save.stat('dunkTank.dunks', 0), trophy: save.flag('dunkTank.trophy'),
      aimSound: prefs.aimSound, aimMode: prefs.aimMode, help: S.help,
      label: S.mode === 'solo' ? 'ROUND ' + (S.round + 1) + ' / 3 · ' + (SOLO_ROUNDS[S.round] || {}).title : S.mode ? (S.mode === 'online' ? 'ONLINE' : 'PARTY') + ' · ' + lvl.name : '',
      score: p ? (S.mode === 'solo' ? p.score : (mine || p).score) : 0, scoreLbl: S.mode === 'solo' || !mine ? (S.mode === 'party' ? p && p.name : 'POINTS') : 'YOU',
      balls: p ? Array.from({ length: ballsMax }, (_, i) => ({ c: i < p.left - (S.flight && S.flight.who === S.cur ? 0 : 0) ? (S.mode === 'solo' ? '#f3efe6' : p.col) : '#3a3836' })) : [],
      meter: Math.round(S.meter * 100), meterSegs: Array.from({ length: 6 }, (_, i) => ({ c: S.meter * 6 > i + 0.01 ? '#22c55e' : '#3a3836' })),
      wind: lvl.wind ? S.wind : null, seatName: seat ? seat.name : '', seatCol: seat ? seat.col : '#ffd23a',
      players: S.mode && S.mode !== 'solo' ? S.players.map((q, i) => ({ name: q.name, col: q.col, score: q.score, left: q.left, me: !!q.me, turn: i === S.cur && !/done|lobby/.test(S.phase), seat: !!seat && seat.fox === q.fox, gone: !!q.gone })) : [],
      turnName, turnCol: p ? p.col : '#ffd23a', myTurn, hint, onSeat, taunts: onSeat && S.phase === 'play' ? QUICK_TAUNTS : [],
      flash: S.flash ? { txt: S.flash.txt, col: S.flash.col } : null, count: S.phase === 'count' ? S.count : null,
      say: S.say && seat ? { who: seat.name, text: S.say.text, col: seat.col, x: bubble ? clamp(bubble.x, 120, W - 120) : W / 2, y: bubble ? clamp(bubble.y, 60, H * 0.6) : 80 } : null,
      pass: S.phase === 'pass' && p ? { name: p.name, col: p.col, sub: 'BALL ' + (ballsMax - p.left + 1) + ' OF ' + ballsMax + ' · ' + p.score + ' PTS' + (seat ? ' · ' + seat.name + ' IS ON THE SEAT' : '') } : null,
      roundCard: S.roundCard, done: S.done, setup: { ...S.setup }, levels: Object.values(LEVELS).map(l => ({ id: l.id, name: l.name, sub: l.sub })),
      net: S.mode === 'online' ? { st: NET.st, code: NET.code, codeIn: NET.codeIn, status: NET.status, ping: NET.ping, msg: NET.msg, ready: NET.ready, copied: NET.copied, full, host: isHost(), set: { ...NET.set }, inMatch: !/lobby/.test(S.phase),
        members: m.map((x, i) => ({ name: NET_COLS[i][0] + (x.me ? ' · YOU' : ''), col: NET_COLS[i][1], sub: (x.id === host ? 'HOST' : 'PLAYER') + (x.me && NET.ping ? ' · ' + NET.ping + ' MS' : ''), tag: x.playing && !x.me ? 'PLAYING' : x.ready ? 'READY' : '', me: x.me })), count: m.length, readyCount: m.filter(x => x.ready).length } : null,
    };
  }

  layout(); bucketShow(8); raf = requestAnimationFrame(frame);
  { const rm = /[?&]room=([A-Za-z0-9]{4})/.exec(location.search); if (rm) setTimeout(() => { netOpen(); netJoin(rm[1]); }, 50); }
  return {
    hud, startSolo, nextRound, again, toIntro, passGo, taunt,
    openParty() { unlock(); S.mode = 'party'; S.phase = 'setup'; S.dirty = true; }, partySet(k, v) { if (k === 'n') S.setup.n = clamp(v, 2, 5); if (k === 'level' && LEVELS[v]) S.setup.level = v; if (k === 'balls' && [3, 5, 8].includes(v)) S.setup.balls = v; S.dirty = true; }, startParty,
    openOnline: netOpen, netJoin, netCreate() { const A2 = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A2[Math.floor(Math.random() * A2.length)]; netJoin(k); }, netCodeType(v) { NET.codeIn = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); NET.msg = ''; S.dirty = true; },
    netReady: () => netReadyToggle(), netSet, netShare, netBack, netLeave: () => { netLeave(); toIntro(); },
    toggleSound() { unlock(); prefs.aimSound = !prefs.aimSound; savePrefs(); flash('AIM SOUND ' + (prefs.aimSound ? 'ON' : 'OFF'), '#7dd3fc', 1); S.dirty = true; }, toggleAim() { prefs.aimMode = prefs.aimMode === 'pull' ? 'swipe' : 'pull'; savePrefs(); S.dirty = true; },
    setHelp(on) { S.help = !!on; S.dirty = true; }, quit() { if (S.mode === 'online') netLeave(); toIntro(); },
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; refit(); } },
    destroy() { cancelAnimationFrame(raf); netLeave(true); removeEventListener('resize', onRs); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); removeEventListener('pagehide', onHide); try { ro && ro.disconnect(); } catch (e) {} try { A.ctx && A.ctx.close(); } catch (e) {} renderer.dispose(); renderer.domElement.remove(); },
    _S: S, _aim: aim, _solve: solveThrow, _throw: throwNow,
  };
}
