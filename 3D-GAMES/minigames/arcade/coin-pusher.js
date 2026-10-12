// 8 GATES — ARCADE · COIN PUSHER / PENNY FALLS [arcadeCoinPusher] — minigame #42 (ARCADE CABINETS).
// One cabinet in a small arcade room. It is world-neutral: createCoinPusher({ world }) re-skins the cabinet, sign and coins
// for any world (meru, gaya, jidda, kufa, luxor, nebo, ur, zion, home, earth, station), so any building can host it.
//
// HOW IT PLAYS (classic penny falls)
//   Drop a token down the back wall. It lands on the moving PUSHER SHELF. The back wall holds the coins while the shelf slides
//   back, so coins creep forward and fall off the shelf onto the BED. The shelf's front face shoves the bed forward and coins
//   tip over the front edge into your TRAY (won). Coins that slide into the two SIDE DRAINS are lost (they feed the jackpot pot).
//   The lit BONUS GATE slides along the back wall: drop a coin through it to spin the bonus reel
//   (COIN SHOWER · BIG COIN · WALLS UP · POWER PUSH · PRIZE DROP · JACKPOT).
//
// MODES
//   FREE PLAY  — your own token cup (shared save stat) and your own board, which is SAVED per world (it stays loaded between visits).
//   TOKEN RACE — online, 2-5 players. Every phone gets the SAME seeded board and 30 race tokens; 90 s; most tokens wins.
//                The jackpot POT is shared: every coin anyone loses to a drain goes into it, the first JACKPOT on the reel takes it.
//
// PHYSICS: a light 2.5D model built for phones (no physics engine): coins are discs on three surfaces (shelf top, bed, one
// stacked layer), pushed by position-based constraints; falling coins are simple ballistic bodies. All coins draw as ONE
// InstancedMesh (+ one outline instanced mesh), so ~250 coins cost 3 draw calls.
//
// MERGE: createCoinPusher({ container, onState, world }) stands alone. Engine files are only imported, never changed.
import * as THREE from '../../vendor/three/three.module.js';
import { save } from '../../engine/save.js';
import { foxKit } from '../../fox-kit.js';
import { castKit, loadCastRigs } from '../../engine/cast.js';
import { crestTex, canvasTex, FONT } from '../../engine/textures.js';

export const GAME = 'arcadeCoinPusher';
export const MAX_PLAYERS = 5;
export const NET_GAME = 'coinpusher';
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['VIOLET', '#a78bfa']];
// DRAFT economy for Ben: 5g buys 25 tokens; cash out 10 tokens = 1g (the house edge), at most 30g a day; first visit gets a free cup of 10.
export const ECON = { buyCost: 5, buyTokens: 25, cashRate: 10, cashCap: 30, welcome: 10, raceTokens: 30, raceSecs: 90, potStart: 20, racePot: 10 };
export const RACE_PRIZE = [{ gold: 15, xp: 25 }, { gold: 8, xp: 12 }, { gold: 3, xp: 5 }];   // DRAFT: 1st, 2nd, everyone else
export const ITEM_LABELS = { [GAME + '.charm']: 'Fox Charm (coin pusher prize)' };            // DRAFT item name
export const KEYS = { tokens: GAME + '.tokens', pot: GAME + '.pot', won: GAME + '.won', best: GAME + '.bestRace', welcome: GAME + '.welcome', cashDay: GAME + '.cashDay', cashToday: GAME + '.cashToday', board: GAME + '.board.v1.' };
export const THEMES = {
  meru: { place: 'MERU ARCADE', body: '#151b3d', trim: '#e6b45a', neon: '#38bdf8', bed: '#26346a', letter: 'M' },
  gaya: { place: 'GAYA ARCADE', body: '#24123a', trim: '#e9d5ff', neon: '#a78bfa', bed: '#3b2160', letter: 'G' },
  jidda: { place: 'JIDDA BOARDWALK', body: '#0b3a52', trim: '#fde68a', neon: '#2dd4bf', bed: '#0f4d6b', letter: 'J' },
  kufa: { place: 'KUFA BAZAAR', body: '#4a2c12', trim: '#fcd34d', neon: '#f59e0b', bed: '#6b4320', letter: 'K' },
  luxor: { place: 'LUXOR ARCADE', body: '#1f2937', trim: '#f3f2f2', neon: '#ef4444', bed: '#374151', letter: 'L' },
  nebo: { place: 'NEBO ARCADE', body: '#1a3318', trim: '#fef3c7', neon: '#84cc16', bed: '#2f5d2a', letter: 'N' },
  ur: { place: 'UR ARCADE', body: '#3b2a12', trim: '#fde68a', neon: '#eab308', bed: '#5c4320', letter: 'U' },
  zion: { place: 'ZION SALOON', body: '#3a1a10', trim: '#fed7aa', neon: '#fb923c', bed: '#5a2a18', letter: 'Z' },
  home: { place: 'HOME ARCADE', body: '#0f172a', trim: '#fce7f3', neon: '#f472b6', bed: '#1e293b', letter: 'H' },
  earth: { place: 'EARTH ARCADE', body: '#111827', trim: '#dcfce7', neon: '#22c55e', bed: '#1f2937', letter: 'E' },
  station: { place: 'DEEP SPACE FOX', body: '#0b1430', trim: '#e0f2fe', neon: '#7dd3fc', bed: '#13224a', letter: '8' },
};
export const BONUS = [
  { id: 'shower', name: 'COIN SHOWER', sub: '4 FREE COINS', w: 30, col: '#ffd23a' },
  { id: 'big', name: 'BIG COIN', sub: 'WORTH 8', w: 20, col: '#e2e8f0' },
  { id: 'walls', name: 'WALLS UP', sub: 'NO DRAINS · 20 S', w: 14, col: '#22c55e' },
  { id: 'push', name: 'POWER PUSH', sub: 'LONG PUSH · 12 S', w: 14, col: '#38bdf8' },
  { id: 'prize', name: 'PRIZE DROP', sub: 'GEM · BAR · CHARM', w: 13, col: '#f472b6' },
  { id: 'jackpot', name: 'JACKPOT', sub: 'TAKE THE POT', w: 9, col: '#ec3013' }];
// prizes ride the board like coins. race points: what each is worth on the race scoreboard
export const PRIZES = {
  gem: { name: 'GEM', r: 0.046, tokens: 5, pts: 5, line: '+5 TOKENS' },
  bar: { name: 'GOLD BAR', r: 0.05, gold: 3, pts: 15, line: '+3 GOLD' },
  charm: { name: 'FOX CHARM', r: 0.046, xp: 10, pts: 10, line: 'FOX CHARM · +10 XP' } };

// ---------------- machine dimensions (metres, machine-local; bed surface y = 0, +z toward the player) ----------------
const R = 0.036, TH = 0.013, HW = 0.33, ZW = -0.46, ZF = 0.34, PH = 0.055, PZ0 = -0.17, STROKE = 0.17, PERIOD = 3.6;
const DRAIN_W = 0.029, DRAIN_Z = ZF - 0.095, CHUTE_Y = 0.42, GATE_Y = 0.22, GATE_HALF = 0.022, GRAV = 5.5, SC = 1.5, TABLE = 1.4;   // SC: the cabinet is built in coin-metres and scaled to the cast (the fox is ~2.7 tall)
const BED = 0, STACK = 1, TOP = 2, AIR = 3, OUT = 4, DRAIN = 5, TRAY = 6;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// ---------------- online: engine/duel-net.js when the repo has it; a same-browser test channel (tabs) otherwise ----------------
export async function connectNet({ code, onJoin, onLeave, onMsg, onStatus }) {
  if (!/[?&]net=local/.test(location.search)) {
    try { const mod = await import(new URL('engine/duel-net.js', document.baseURI).href); if (mod && mod.connectDuel) return await mod.connectDuel({ game: NET_GAME, code, onJoin, onLeave, onMsg, onStatus }); } catch (e) {}
  }
  return localNet({ code, onJoin, onLeave, onMsg, onStatus });
}
function localNet({ code, onJoin, onLeave, onMsg, onStatus }) {
  const id = Math.random().toString(36).slice(2, 10); let bc;
  try { bc = new BroadcastChannel('8g.' + NET_GAME + '.' + code); } catch (e) { setTimeout(() => onStatus && onStatus('offline'), 0); return { id, send() {}, leave() {} }; }
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return; if (m.t === '__join') { onJoin && onJoin(m.from); return; } if (m.t === '__leave') { onLeave && onLeave(m.from); return; } onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => { onStatus && onStatus('local'); bc.postMessage({ from: id, t: '__join' }); }, 0);
  return { id, send(t, d, to) { try { bc.postMessage({ from: id, to, t, d }); } catch (e) {} }, leave() { try { bc.postMessage({ from: id, t: '__leave' }); bc.close(); } catch (e) {} } };
}

// ---------------- little synth (no media needed) ----------------
function makeSfx() {
  let ctx = null, master = null, muted = false;
  const ok = () => { if (muted) return false; if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.5; master.connect(ctx.destination); } catch (e) { return false; } } if (ctx.state === 'suspended') ctx.resume(); return true; };
  function tone(f, d = 0.08, v = 0.15, type = 'triangle', to = 0, at = 0) { if (!ok()) return; const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + d); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(master); o.start(t); o.stop(t + d + 0.02); }
  let lastClink = 0;
  return {
    wake: ok, setMuted(m) { muted = m; }, get muted() { return muted; },
    clink() { const n = performance.now(); if (n - lastClink < 45) return; lastClink = n; tone(2300 + Math.random() * 700, 0.05, 0.05, 'square'); },
    drop() { tone(1500, 0.06, 0.08, 'triangle', 900); },
    win(v = 1) { tone(1320, 0.09, 0.12, 'square'); tone(1760, 0.14, 0.1, 'square', 0, 0.07); if (v >= 5) tone(2640, 0.2, 0.08, 'square', 0, 0.15); },
    lost() { tone(180, 0.18, 0.12, 'sawtooth', 90); },
    tick() { tone(900, 0.03, 0.06, 'square'); },
    bonus() { [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.12, 0.12, 'square', 0, i * 0.07)); },
    jackpot() { [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.16, 0.14, 'square', 0, i * 0.09)); },
    buzz() { tone(140, 0.2, 0.1, 'sawtooth'); } };
}

// ---------------- camera fit (copied from engine/restaurant-kit.js cameraFit, plus a right inset) ----------------
function fitShot(camera, W, H, SAFE, pts, el, yaw = 0, margin = 0.05) {
  const fc = new THREE.PerspectiveCamera(camera.fov, W / H, 0.05, 80), _p = new THREE.Vector3();
  const yT = 1 - 2 * SAFE.top / H - margin * 1.2, yB = -1 + 2 * SAFE.bottom / H + margin * 1.2, xR = 1 - 2 * SAFE.right / W - margin, xL = -1 + 2 * SAFE.left / W + margin, sx = (xL + xR) / 2, sy = (yT + yB) / 2;
  const dir = new THREE.Vector3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)), tgt = new THREE.Vector3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
  const bounds = d => { fc.position.copy(tgt).addScaledVector(dir, d); fc.lookAt(tgt); fc.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fc); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
  const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
  let d = 3; for (let it = 0; it < 4; it++) { let lo = 0.3, hi = 30; for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
    const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fc.fov * Math.PI / 360) * d, right = new THREE.Vector3().setFromMatrixColumn(fc.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(fc.matrixWorld, 1);
    tgt.addScaledVector(right, (cx - sx) * th * fc.aspect).addScaledVector(up, (cy - sy) * th); }
  return { pos: tgt.clone().addScaledVector(dir, d), look: tgt };
}

// =====================================================================================================================
export async function createCoinPusher({ container, onState, world = 'meru' }) {
  const TH_ = THEMES[world] ? world : 'meru', THEME = THEMES[TH_];
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance', preserveDrawingBuffer: /[?&]pdb=1/.test(location.search) });   // pdb=1: only for headless screenshot tests
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CH()); renderer.shadowMap.enabled = !touch;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#140d22'); scene.fog = new THREE.Fog('#140d22', 9, 26);
  const camera = new THREE.PerspectiveCamera(42, CW() / CH(), 0.05, 60);
  // toon look (same recipe as the shared stage: gradient map + back-face ink outlines)
  const grad = new THREE.DataTexture(new Uint8Array([70, 70, 70, 255, 150, 150, 150, 255, 215, 215, 215, 255, 255, 255, 255, 255]), 4, 1, THREE.RGBAFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.generateMipmaps = false; grad.needsUpdate = true;
  const cache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const glow = c => { const k = 'glow' + c; if (!cache.has(k)) cache.set(k, new THREE.MeshBasicMaterial({ color: c, toneMapped: false })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.01, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = new THREE.Vector3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.01, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const Box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  scene.add(new THREE.HemisphereLight(0xfff0ff, 0x3a2a4a, 1.2)); const sun = new THREE.DirectionalLight(0xfff4e0, 1.5); sun.position.set(1.5, 4, 3); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -1.8, right: 1.8, top: 2.4, bottom: -1.8, near: 0.5, far: 12 }); sun.position.set(2, 6, 4.5); scene.add(sun);
  const fill = new THREE.PointLight(new THREE.Color(THEME.neon), 1.2, 3.2); fill.position.set(0, TABLE + 1.1, 0.6); fill.distance = 4.5; scene.add(fill);
  const sfx = makeSfx();

  // ---------------- the room (small, cheap: floor, back wall, two neighbour cabinets, a neon sign) ----------------
  const floorTex = canvasTex(256, 256, (g) => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { g.fillStyle = (x + y) % 2 ? '#2a1d3d' : '#1d1430'; g.fillRect(x * 32, y * 32, 32, 32); } g.fillStyle = THEME.neon; g.globalAlpha = 0.18; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); }, [6, 6]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshToonMaterial({ map: floorTex, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !touch; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), toon('#22173a')); wall.position.set(0, 3, -2.4); scene.add(wall);
  const neonSign = canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#0a0612'; g.fillRect(0, 0, w, h); g.strokeStyle = THEME.neon; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20); g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = THEME.neon; g.shadowBlur = 18; g.fillStyle = '#ffffff'; g.fillText(THEME.place, w / 2, h / 2 + 3); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.475), new THREE.MeshBasicMaterial({ map: neonSign, toneMapped: false })); sign.position.set(0, 3.75, -2.38); sign.scale.setScalar(1.4); scene.add(sign);
  for (const sx of [-2.7, 2.7]) { const cab = new THREE.Group(); cab.position.set(sx, 0, -1.2); cab.scale.setScalar(1.5); cab.rotation.y = -sx * 0.25; scene.add(cab); M(Box(0.7, 1.7, 0.6), toon(sx < 0 ? '#3a1d5c' : '#1d3a5c'), 0, 0.85, 0, cab, 0.012);
    const sc = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.4), glow(sx < 0 ? '#f472b6' : '#7dd3fc')); sc.position.set(0, 1.3, 0.302); cab.add(sc); M(Box(0.72, 0.16, 0.62), glow(THEME.neon), 0, 1.74, 0, cab, 0); }
  for (const sx of [-3.9, 3.9]) { const st = new THREE.Mesh(Box(0.07, 4.5, 0.07), glow(THEME.neon)); st.position.set(sx, 2.25, -2.35); scene.add(st); }

  // ---------------- the cabinet ----------------
  const mach = new THREE.Group(); mach.position.set(0, TABLE, 0); mach.scale.setScalar(SC); scene.add(mach);
  const bodyM = toon(THEME.body), trimM = toon(THEME.trim), chrome = toon('#c9d3df'), dark = toon('#0b0812'), neonM = glow(THEME.neon);
  const bedTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = THEME.bed; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); } });
  const bedD = ZF - ZW + 0.12; M(Box(2 * HW, 0.45, bedD), [bodyM, bodyM, new THREE.MeshToonMaterial({ map: bedTex, gradientMap: grad }), bodyM, bodyM, bodyM], 0, -0.225, ZF - bedD / 2, mach, 0);
  // front face under the bed edge (coins drop past it into the tray) + a red "WIN" lip light
  M(Box(2 * HW + 0.012, 0.012, 0.016), glow('#ffd23a'), 0, -0.006, ZF - 0.002, mach, 0);
  // the drains: black holes at the front corners, red lips
  const drainM = []; for (const s of [-1, 1]) { M(Box(DRAIN_W, 0.004, ZF - DRAIN_Z), dark, s * (HW - DRAIN_W / 2), 0.002, (DRAIN_Z + ZF) / 2, mach, 0); M(Box(0.006, 0.006, ZF - DRAIN_Z), glow('#ec3013'), s * (HW - DRAIN_W), 0.003, (DRAIN_Z + ZF) / 2, mach, 0);
    const guard = M(Box(0.012, 0.05, ZF - DRAIN_Z + 0.01), glow('#22c55e'), s * (HW + 0.006), 0.025, (DRAIN_Z + ZF) / 2, mach, 0); guard.visible = false; drainM.push(guard); }
  // lower body + tray
  M(Box(2 * HW + 0.2, 0.5, ZF - ZW + 0.5), bodyM, 0, -0.7, (ZF + ZW) / 2 + 0.06, mach, 0.012);
  const trayZ = ZF + 0.11; M(Box(2 * HW, 0.02, 0.2), dark, 0, -0.445, trayZ, mach, 0); M(Box(2 * HW + 0.04, 0.09, 0.02), trimM, 0, -0.41, trayZ + 0.105, mach, 0.006);
  for (const s of [-1, 1]) M(Box(0.02, 0.09, 0.22), trimM, s * (HW + 0.01), -0.41, trayZ, mach, 0.006);
  const panelTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = THEME.body; g.fillRect(0, 0, w, h); g.fillStyle = THEME.trim; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); g.font = `900 70px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = THEME.trim; g.fillText('PENNY FALLS', w / 2, h / 2 - 20); g.font = `800 30px ${FONT}`; g.fillStyle = THEME.neon; g.fillText('1 TOKEN · PUSH YOUR LUCK', w / 2, h / 2 + 52); });
  const panel = new THREE.Mesh(new THREE.PlaneGeometry(2 * HW + 0.2, 0.38), new THREE.MeshToonMaterial({ map: panelTex, gradientMap: grad })); panel.position.set(0, -0.72, ZF + 0.311); mach.add(panel);
  // side rails, glass (stops before the drain zone) and the green WALLS UP guards
  for (const s of [-1, 1]) { M(Box(0.1, 0.48, ZF - ZW + 0.06), bodyM, s * (HW + 0.05), -0.22, (ZF + ZW) / 2 - 0.03, mach, 0.01); M(Box(0.1, 0.014, ZF - ZW + 0.06), neonM, s * (HW + 0.05), 0.02, (ZF + ZW) / 2 - 0.03, mach, 0);
    const gl = new THREE.Mesh(Box(0.006, 0.3, DRAIN_Z - ZW), new THREE.MeshBasicMaterial({ color: THEME.neon, transparent: true, opacity: 0.12, depthWrite: false })); gl.position.set(s * (HW + 0.004), 0.15, (DRAIN_Z + ZW) / 2); mach.add(gl);
    M(Box(0.014, 0.3, 0.014), chrome, s * (HW + 0.007), 0.15, DRAIN_Z, mach, 0.004); M(Box(0.014, 0.014, DRAIN_Z - ZW), chrome, s * (HW + 0.007), 0.3, (DRAIN_Z + ZW) / 2, mach, 0.004); }
  // rear tower: back wall (holds the shelf coins), the bonus rail, the drop chute and the marquee
  const tower = new THREE.Group(); mach.add(tower);
  const backTex = canvasTex(256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, THEME.body); gr.addColorStop(1, '#05030a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = THEME.neon; g.globalAlpha = 0.5; for (let x = 8; x < w; x += 16) { g.beginPath(); g.arc(x, h * 0.36, 2.2, 0, 7); g.fill(); g.beginPath(); g.arc(x, h * 0.6, 2.2, 0, 7); g.fill(); } });
  const wallH = 0.56 - PH; M(Box(2 * HW, wallH, 0.02), [bodyM, bodyM, bodyM, bodyM, new THREE.MeshToonMaterial({ map: backTex, gradientMap: grad }), bodyM], 0, PH + 0.004 + wallH / 2, ZW - 0.01, tower, 0);
  M(Box(2 * HW + 0.2, 0.62, 0.16), bodyM, 0, 0.33, ZW - 0.1, tower, 0.012);
  M(Box(2 * HW, 0.006, 0.01), chrome, 0, GATE_Y - 0.036, ZW + 0.006, tower, 0); M(Box(2 * HW, 0.006, 0.01), chrome, 0, GATE_Y + 0.036, ZW + 0.006, tower, 0);
  const gate = new THREE.Group(); gate.position.set(0, GATE_Y, ZW + 0.008); tower.add(gate); const gw = GATE_HALF * 2 + 2 * R, gateGlow = glow('#ffd23a');
  for (const [w, h, x, y] of [[gw, 0.008, 0, 0.034], [gw, 0.008, 0, -0.034], [0.008, 0.076, -gw / 2, 0], [0.008, 0.076, gw / 2, 0]]) { const b = new THREE.Mesh(Box(w, h, 0.008), gateGlow); b.position.set(x, y, 0); gate.add(b); }
  const gateLbl = new THREE.Mesh(new THREE.PlaneGeometry(gw, gw * 0.25), new THREE.MeshBasicMaterial({ map: canvasTex(256, 64, (g, w, h) => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, w, h); g.fillStyle = '#000'; g.font = `900 46px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('BONUS', w / 2, h / 2 + 2); }), toneMapped: false }));
  gateLbl.position.set(0, 0.056, 0.002); gate.add(gateLbl);
  const gateFill = new THREE.Mesh(new THREE.PlaneGeometry(gw - 0.01, 0.06), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.18, depthWrite: false })); gate.add(gateFill);
  // chute rail + aim carriage + drop guide
  M(Box(2 * HW + 0.04, 0.016, 0.03), chrome, 0, CHUTE_Y + 0.03, ZW + 0.01, tower, 0.004);
  const carriage = new THREE.Group(); carriage.position.set(0, CHUTE_Y + 0.03, ZW + 0.03); tower.add(carriage);
  M(Box(0.09, 0.04, 0.04), trimM, 0, 0.01, 0, carriage, 0.006); const aimCone = M(new THREE.ConeGeometry(0.022, 0.05, 4), glow('#ffd23a'), 0, -0.05, 0.01, carriage, 0.004); aimCone.rotation.x = Math.PI;
  const guide = new THREE.Mesh(new THREE.PlaneGeometry(2 * R, CHUTE_Y - PH), new THREE.MeshBasicMaterial({ color: '#ffd23a', transparent: true, opacity: 0.14, depthWrite: false })); guide.position.set(0, (CHUTE_Y + PH) / 2, ZW + 0.04); tower.add(guide);
  const marqTex = canvasTex(512, 192, (g, w, h) => { g.fillStyle = '#07040d'; g.fillRect(0, 0, w, h); g.strokeStyle = THEME.trim; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = THEME.neon; g.shadowBlur = 16; g.fillStyle = '#ffffff'; g.font = `900 78px ${FONT}`; g.fillText('COIN PUSHER', w / 2, h * 0.44); g.shadowBlur = 0; g.fillStyle = THEME.neon; g.font = `800 30px ${FONT}`; g.fillText(THEME.place + ' · PENNY FALLS', w / 2, h * 0.8); });
  const marq = new THREE.Mesh(new THREE.PlaneGeometry(2 * HW + 0.16, (2 * HW + 0.16) * 0.375), new THREE.MeshBasicMaterial({ map: marqTex, toneMapped: false })); marq.position.set(0, 0.78, ZW - 0.02); tower.add(marq);
  M(Box(2 * HW + 0.2, 0.3, 0.1), bodyM, 0, 0.78, ZW - 0.08, tower, 0.012); M(Box(2 * HW + 0.22, 0.018, 0.12), neonM, 0, 0.94, ZW - 0.07, tower, 0);
  const emb = new THREE.Mesh(new THREE.CircleGeometry(0.05, 24), new THREE.MeshBasicMaterial({ map: crestTex(THEME.letter, THEME.trim, THEME.body), toneMapped: false })); emb.position.set(0, 0.515, ZW + 0.002); tower.add(emb);
  // the pusher shelf (front face at local z = 0, moves along z)
  const pusher = new THREE.Group(); mach.add(pusher); const pLen = 0.6;
  const shelfTex = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#d9e0ea'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,50,70,0.18)'; g.lineWidth = 2; for (let i = -h; i < w; i += 12) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + h, h); g.stroke(); } });
  M(Box(2 * HW - 0.004, PH, pLen), [chrome, chrome, new THREE.MeshToonMaterial({ map: shelfTex, gradientMap: grad }), chrome, trimM, chrome], 0, PH / 2, -pLen / 2, pusher, 0.004);
  M(Box(2 * HW - 0.01, 0.012, 0.004), neonM, 0, PH * 0.5, 0.0025, pusher, 0);

  // ---------------- coins: one InstancedMesh (+ ink outline) for tokens and big coins ----------------
  const faceTex = canvasTex(128, 128, (g, w) => { const c = w / 2; g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, w); g.fillStyle = '#d9d0b8'; g.beginPath(); g.arc(c, c, 54, 0, 7); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(c, c, 46, 0, 7); g.fill(); g.strokeStyle = '#b8a888'; g.lineWidth = 9; g.beginPath(); g.ellipse(c, c - 15, 13, 12, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(c, c + 16, 16, 15, 0, 0, 7); g.stroke(); });
  const coinGeo = new THREE.CylinderGeometry(R, R, TH, 22), MAXC = 320;
  const coinMats = [new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: grad }), new THREE.MeshToonMaterial({ color: '#ffffff', map: faceTex, gradientMap: grad }), new THREE.MeshToonMaterial({ color: '#ffffff', map: faceTex, gradientMap: grad })];
  const coinIM = new THREE.InstancedMesh(coinGeo, coinMats, MAXC); coinIM.castShadow = !touch; coinIM.receiveShadow = !touch; coinIM.frustumCulled = false; mach.add(coinIM);
  const coinOL = new THREE.InstancedMesh(coinGeo, outlineMat, MAXC); coinOL.frustumCulled = false; mach.add(coinOL);
  const COL_COIN = new THREE.Color('#f5b733'), COL_BIG = new THREE.Color('#dfe7f1'), COL_SHOWER = new THREE.Color('#ffd86a');
  for (let i = 0; i < MAXC; i++) coinIM.setColorAt(i, COL_COIN); coinIM.instanceColor.needsUpdate = true;
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _v = new THREE.Vector3();
  // prize meshes
  function prizeMesh(k) { const g = new THREE.Group();
    if (k === 'gem') { const m = M(new THREE.OctahedronGeometry(0.04, 0), toon('#22d3ee', { emissive: new THREE.Color('#0891b2'), emissiveIntensity: 0.4 }), 0, 0.03, 0, g, 0.004, 0.04); m.scale.set(1, 0.8, 1); }
    else if (k === 'bar') { M(Box(0.085, 0.032, 0.05), toon('#fbbf24', { emissive: new THREE.Color('#b45309'), emissiveIntensity: 0.3 }), 0, 0.016, 0, g, 0.004); const t = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.03), new THREE.MeshBasicMaterial({ map: crestTex('8', '#b45309', '#fbbf24', '#78350f'), transparent: true })); t.rotation.x = -Math.PI / 2; t.position.y = 0.0325; g.add(t); }
    else { M(new THREE.SphereGeometry(0.032, 14, 10), toon('#f2741f'), 0, 0.03, 0, g, 0.004, 0.032); for (const s of [-1, 1]) { const e = M(new THREE.ConeGeometry(0.014, 0.03, 8), toon('#1e293b'), s * 0.018, 0.064, 0, g, 0.003); e.rotation.z = -s * 0.3; } M(new THREE.SphereGeometry(0.012, 10, 8), toon('#ffe4c4'), 0, 0.022, 0.026, g, 0.002, 0.012); M(new THREE.TorusGeometry(0.014, 0.004, 6, 14), chrome, 0, 0.068, -0.012, g, 0); }
    mach.add(g); return g; }

  // ---------------- the player at the cabinet (THE CAST, engine/cast.js) ----------------
  let fox = null, animFox = null;
  (async () => { try { const rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
    const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp }); animFox = kit.animFox;
    const rigs = await loadCastRigs().catch(() => ({})); fox = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs).make('player', { mood: 'happy' });
    fox.position.set(-0.98, 0, 0.66); fox.rotation.y = 1.9; fox.visible = state.phase !== 'play' && state.phase !== 'race'; } catch (e) { console.warn('coin pusher: fox failed', e); } })();

  // ================================== GAME STATE ==================================
  const state = { phase: 'intro', mode: 'free', tokens: 0, won: 0, spent: 0, lost: 0, prizePts: 0, pot: ECON.potStart, aim: 0, bonus: null, flash: null, collected: [], race: null, results: null, demo: false };
  let simming = false, coins = [], PF = PZ0 + STROKE, ph = Math.PI, pushAmp = 1, t = 0, gateX = 0, dropCD = 0, holdOn = false, holdT = 0, bonusQ = [], showerQ = [], fx = { walls: 0, push: 0 }, saveT = 0, dirty = true, rng = Math.random;
  function mkCoin(k, x, z, lay) { const pr = PRIZES[k]; const c = { k, x, z, y: lay === TOP ? PH + TH / 2 : lay === STACK ? TH * 1.5 : TH / 2, lay, r: k === 'coin' || k === 'shower' ? R : k === 'big' ? R * 1.5 : pr.r, val: k === 'big' ? 8 : 1, vx: 0, vz: 0, vy: 0, px: x, pz: z, tilt: 0, tiltA: Math.random() * 6.28, spin: 0, spinV: 0, yaw: Math.random() * 6.28, t: 0, im: k === 'coin' || k === 'big' || k === 'shower' };
    if (!c.im) c.mesh = prizeMesh(k); coins.push(c); return c; }
  function killCoin(c) { c.dead = true; if (c.mesh) { mach.remove(c.mesh); c.mesh = null; } }
  function clearBoard() { coins.forEach(killCoin); coins = []; }
  // a full, believable board: shelf ~70% full, bed packed to the edge, a few stacks, one gem, one charm, one big coin
  function fillBoard(r = Math.random) { clearBoard(); ph = Math.PI; PF = PZ0 + STROKE; let row = 0;
    for (let z = ZW + R + 0.003; z < PF - R * 0.3; z += 0.0635, row++) for (let x = -HW + R + 0.003 + (row % 2) * R; x <= HW - R - 0.002; x += 2 * R + 0.003) if (r() < 0.7) mkCoin('coin', x + (r() - 0.5) * 0.008, z + (r() - 0.5) * 0.006, TOP);
    row = 0; for (let z = PF + R + 0.003; z < ZF - R * 0.55; z += 0.0635, row++) for (let x = -HW + R + 0.003 + (row % 2) * R; x <= HW - R - 0.002; x += 2 * R + 0.003) { if (z > DRAIN_Z - R && Math.abs(x) > HW - DRAIN_W - 0.01) continue; if (r() < 0.86) mkCoin('coin', x + (r() - 0.5) * 0.01, z + (r() - 0.5) * 0.008, BED); }
    const bed = coins.filter(c => c.lay === BED); for (let i = 0; i < 11; i++) { const b = bed[Math.floor(r() * bed.length)]; if (b && b.z < ZF - R * 1.2) { const s = mkCoin('coin', b.x + (r() - 0.5) * 0.03, b.z + (r() - 0.5) * 0.02, STACK); s.tilt = 0.08; } }
    mkCoin('gem', (r() - 0.5) * 0.3, ZF - 0.13, STACK); mkCoin('charm', (r() - 0.5) * 0.3, PF - 0.12, TOP); mkCoin('big', (r() - 0.5) * 0.3, PF + 0.09, STACK);
    for (let i = 0; i < 40; i++) settle(); dirty = true; }
  function settle() { const L = [[], [], []]; for (const c of coins) if (c.lay <= TOP) L[c.lay].push(c); resolve(L[TOP], 3, topCon); resolve(L[BED], 3, bedCon); resolve(L[STACK], 2, stkCon); }
  // ---- persistence (free play): one saved board per world ----
  function boardKey() { return KEYS.board + TH_; }
  function saveBoard() { if (state.mode !== 'free') return; try { const a = coins.filter(c => !c.dead && (c.lay <= TOP || c.lay === AIR)).map(c => [c.k, +c.x.toFixed(4), +c.z.toFixed(4), c.lay === AIR ? (c.z < PF ? TOP : STACK) : c.lay]); localStorage.setItem(boardKey(), JSON.stringify({ v: 1, ph: +ph.toFixed(3), c: a })); } catch (e) {} }
  function loadBoard() { try { const d = JSON.parse(localStorage.getItem(boardKey()) || 'null'); if (!d || !Array.isArray(d.c) || d.c.length < 40) return false; clearBoard(); ph = d.ph || Math.PI; PF = PZ0 + STROKE * (0.5 - 0.5 * Math.cos(ph));
    for (const [k, x, z, lay] of d.c) { if (!(k === 'coin' || k === 'big' || PRIZES[k])) continue; mkCoin(k === 'shower' ? 'coin' : k, clamp(x, -HW + 0.02, HW - 0.02), clamp(z, ZW + 0.03, ZF - 0.01), lay); } for (let i = 0; i < 10; i++) settle(); return true; } catch (e) { return false; } }

  // ================================== PHYSICS ==================================
  const CS = 0.09, grid = new Map();
  function gridBuild(list) { grid.clear(); for (const c of list) { const k = (Math.floor((c.x + 1) / CS) << 8) | Math.floor((c.z + 1) / CS); let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(c); } }
  function gridEach(x, z, fn) { const ix = Math.floor((x + 1) / CS), iz = Math.floor((z + 1) / CS); for (let i = ix - 1; i <= ix + 1; i++) for (let j = iz - 1; j <= iz + 1; j++) { const a = grid.get((i << 8) | j); if (a) for (const c of a) fn(c); } }
  function pairsOf(list) { gridBuild(list); const P = []; for (const a of list) gridEach(a.x, a.z, b => { if (b === a || b._i < a._i) return; const m = a.r + b.r + 0.006; if ((b.x - a.x) ** 2 + (b.z - a.z) ** 2 < m * m) P.push(a, b); }); return P; }
  const inv = c => c.k === 'coin' || c.k === 'shower' ? 1 : c.k === 'big' ? 0.55 : 0.5;
  function resolve(list, iters, con) { if (!list.length) return; list.forEach((c, i) => c._i = i); const P = pairsOf(list);
    for (let it = 0; it < iters; it++) { for (let p = 0; p < P.length; p += 2) { const a = P[p], b = P[p + 1]; let dx = b.x - a.x, dz = b.z - a.z; const m = a.r + b.r, d2 = dx * dx + dz * dz; if (d2 >= m * m) continue; let d = Math.sqrt(d2); if (d < 1e-6) { dx = Math.random() - 0.5; dz = Math.random() - 0.5; d = Math.hypot(dx, dz); }
        const pen = (m - d) / d, wa = inv(a), wb = inv(b), s = pen / (wa + wb); a.x -= dx * s * wa; a.z -= dz * s * wa; b.x += dx * s * wb; b.z += dz * s * wb; }
      for (const c of list) con(c); } return P; }
  const wallX = c => (c.z > DRAIN_Z && fx.walls <= 0 && c.lay !== TOP) ? HW - c.r * 0.6 : HW - c.r;
  function topCon(c) { if (c.z < ZW + c.r) c.z = ZW + c.r; const w = HW - c.r; if (c.x > w) c.x = w; else if (c.x < -w) c.x = -w; }
  function bedCon(c) { if (c.z < PF + c.r) c.z = PF + c.r; const w = wallX(c); if (c.x > w) c.x = w; else if (c.x < -w) c.x = -w; }
  const stkCon = bedCon;
  let stepPF = PF;
  function physStep(dt) {
    pushAmp = damp(pushAmp, fx.push > 0 ? 1.45 : 1, 2.5, dt); ph += dt * Math.PI * 2 / PERIOD * (fx.push > 0 ? 1.25 : 1); const pf0 = PF; PF = PZ0 + STROKE * pushAmp * (0.5 - 0.5 * Math.cos(ph)); const dPF = PF - pf0, pv = dPF / dt; stepPF = PF;
    const bed = [], stk = [], top = [], fly = [];
    for (const c of coins) { if (c.dead) continue; c.px = c.x; c.pz = c.z; if (c.lay === BED) bed.push(c); else if (c.lay === STACK) stk.push(c); else if (c.lay === TOP) top.push(c); else fly.push(c);
      if (c.lay <= TOP && (c.vx || c.vz)) { c.x += c.vx * dt; c.z += c.vz * dt; const f = Math.exp(-9 * dt); c.vx *= f; c.vz *= f; if (Math.abs(c.vx) + Math.abs(c.vz) < 0.002) c.vx = c.vz = 0; } }
    // shelf: coins ride the shelf, the back wall holds them
    for (const c of top) c.z += dPF;
    resolve(top, 3, topCon);
    for (const c of top) if (c.z > PF + 0.22 * c.r) { c.lay = AIR; c.vy = 0; c.vz = Math.max(0, pv) + 0.1; c.vx *= 0.3; c.spinV = 0; }
    // bed: the shelf front pushes, coins push coins
    const P = resolve(bed, 5, bedCon);
    // jammed coins ride up onto the coin in front (one stacked layer)
    if (P && stk.length < 48) for (let p = 0; p < P.length; p += 2) { const a = P[p], b = P[p + 1]; if (a.lay !== BED || b.lay !== BED) continue; const m = a.r + b.r, d = Math.hypot(b.x - a.x, b.z - a.z); if (d < m * 0.74) { const back = a.z < b.z ? a : b; if (back.k !== 'coin' && back.k !== 'shower') continue; back.lay = STACK; back.tilt = 0.12; stk.push(back); bed.splice(bed.indexOf(back), 1); } }
    // stacked coins move with what they rest on, drop when nothing is under them
    gridBuild(bed);
    for (const s of stk) { if (s.lay !== STACK) continue; let wx = 0, wz = 0, ws = 0; gridEach(s.x, s.z, b => { const lim = (s.r + b.r) * 0.86, d = Math.hypot(b.x - s.x, b.z - s.z); if (d < lim) { const w = lim - d; wx += (b.x - b.px) * w; wz += (b.z - b.pz) * w; ws += w; } });
      if (ws <= 0) { s.lay = BED; s.tilt = 0; continue; } s.x += wx / ws; s.z += wz / ws; s.tilt = damp(s.tilt, 0.07, 3, dt); }
    resolve(stk.filter(s => s.lay === STACK), 2, stkCon);
    // edges: front = won, side drains = lost
    for (const c of coins) { if (c.dead || (c.lay !== BED && c.lay !== STACK)) continue;
      if (c.z > ZF + 0.12 * c.r) { c.lay = OUT; c.vy = 0.05; c.vz = 0.22 + Math.random() * 0.06; c.spinV = 6 + Math.random() * 4; }
      else if (fx.walls <= 0 && c.z > DRAIN_Z && Math.abs(c.x) > HW - DRAIN_W) { c.lay = DRAIN; c.vy = 0; c.vx = Math.sign(c.x) * 0.12; c.vz = 0.02; c.spinV = 5; } }
    // flying coins
    for (const c of fly) { const y0 = c.y; c.vy -= GRAV * dt; c.y += c.vy * dt; c.x += c.vx * dt; c.z += c.vz * dt; c.spin += c.spinV * dt; c.t += dt;
      if (c.lay === AIR) { if (c.chute && !c.gated && y0 > GATE_Y && c.y <= GATE_Y) { c.gated = true; if (Math.abs(c.x - gateX) < GATE_HALF) gateHit(c); }
        const overShelf = c.z < PF && c.z > ZW, floorY = overShelf ? PH + TH / 2 : TH / 2;
        if (c.y <= floorY + (overShelf ? 0 : 0.012)) { if (overShelf) { c.lay = TOP; c.y = PH + TH / 2; } else if (c.z > ZF) { c.lay = OUT; c.vz = 0.2; } else { let on = false; gridEach(c.x, c.z, b => { if (Math.hypot(b.x - c.x, b.z - c.z) < (b.r + c.r) * 0.78) on = true; }); c.lay = on ? STACK : BED; if (!on) c.y = TH / 2; c.tilt = on ? 0.1 : 0; }
          if (c.lay !== OUT) { c.vx *= 0.25; c.vz = c.vz * 0.35 + (Math.random() - 0.5) * 0.02; c.spin = 0; c.spinV = 0; sfx.clink(); } } }
      else if (c.lay === OUT) { if (c.y < -0.4) { c.lay = TRAY; c.y = -0.43; c.x = clamp(c.x + (Math.random() - 0.5) * 0.05, -HW + 0.04, HW - 0.04); c.z = trayZ + (Math.random() - 0.5) * 0.12; c.t = 0; c.spin = 0; c.tilt = 0.25; award(c); } }
      else if (c.lay === DRAIN) { if (c.y < -0.3) { killCoin(c); drained(c); } }
      else if (c.lay === TRAY) { if (c.t > 1.3) killCoin(c); } }
    if (coins.length > 60 && coins.some(c => c.dead)) coins = coins.filter(c => !c.dead);
  }

  // ================================== RULES ==================================
  const now = () => performance.now() / 1000;
  function flash(txt, col = '#ffd23a', dur = 1.6) { state.flash = { txt, col, until: now() + dur }; emit(true); }
  function award(c) { if (state.phase !== 'play' && state.phase !== 'race' && state.phase !== 'final' && !state.demo) return;
    const pr = PRIZES[c.k];
    if (!pr) { state.tokens += c.val; state.won += c.val; sfx.win(c.val); if (c.val >= 5) flash('BIG COIN +' + c.val, '#e2e8f0'); }
    else { sfx.win(10); state.collected.push(pr.name);
      if (state.mode === 'race') { if (pr.tokens) { state.tokens += pr.tokens; state.won += pr.tokens; } else state.prizePts += pr.pts; flash(pr.name + ' · +' + pr.pts + ' POINTS', '#f472b6'); }
      else { if (pr.tokens) { state.tokens += pr.tokens; state.won += pr.tokens; } if (pr.gold) save.addGold(pr.gold); if (pr.xp) save.addXp(pr.xp); if (c.k === 'charm') save.give(GAME + '.charm', 1); flash(pr.name + ' · ' + pr.line, '#f472b6', 2.2); } }
    if (state.mode === 'free' && !simming) { save.setStat(KEYS.tokens, state.tokens); save.setStat(KEYS.won, save.stat(KEYS.won) + (pr ? 0 : c.val)); }
    emit(); }
  function drained(c) { if (state.phase !== 'play' && state.phase !== 'race' && state.phase !== 'final') return; state.lost += 1; sfx.lost();
    if (state.mode === 'race') { const R_ = state.race; if (R_) { if (isHost()) { R_.pot += 1; R_.send('ev', { k: 'pot', v: R_.pot }); } else R_.send('ev', { k: 'drain', n: 1 }); state.pot = R_.pot; } }
    else { state.pot += 1; if (!simming) save.setStat(KEYS.pot, state.pot); } emit(); }
  function pickBonus() { const tot = BONUS.reduce((a, b) => a + b.w, 0); let x = rng() * tot; for (const b of BONUS) { x -= b.w; if (x <= 0) return b; } return BONUS[0]; }
  function gateHit() { sfx.bonus(); bonusQ.push(pickBonus()); if (!state.bonus) nextBonus(); }
  function nextBonus() { const b = bonusQ.shift(); if (!b) { state.bonus = null; emit(true); return; } state.bonus = { id: b.id, name: b.name, sub: b.sub, col: b.col, spin: 1.35, idx: 0, shown: BONUS[0].name, done: false }; emit(true); }
  function applyBonus(b) {
    if (b.id === 'shower') { for (let i = 0; i < 4; i++) showerQ.push({ at: now() + 0.12 * i, k: 'shower' }); flash('COIN SHOWER · 4 FREE COINS', '#ffd23a'); }
    else if (b.id === 'big') { showerQ.push({ at: now(), k: 'big' }); flash('BIG COIN · WORTH 8', '#e2e8f0'); }
    else if (b.id === 'walls') { fx.walls = 20; flash('WALLS UP · NO DRAINS FOR 20 S', '#22c55e'); }
    else if (b.id === 'push') { fx.push = 12; flash('POWER PUSH · 12 S', '#38bdf8'); }
    else if (b.id === 'prize') { const ks = ['gem', 'bar', 'charm']; showerQ.push({ at: now(), k: ks[Math.floor(rng() * 3)] }); flash('PRIZE DROP', '#f472b6'); }
    else if (b.id === 'jackpot') jackpot();
  }
  function jackpot() { if (state.mode === 'race') { const R_ = state.race; if (!R_) return; if (isHost()) hostJack(R_.me); else R_.send('ev', { k: 'jack' }); flash('JACKPOT! CLAIMING THE POT…', '#ec3013'); return; }
    const v = Math.max(1, state.pot); state.tokens += v; state.won += v; state.pot = ECON.potStart; save.setStat(KEYS.pot, state.pot); save.setStat(KEYS.tokens, state.tokens); sfx.jackpot(); flash('JACKPOT · +' + v + ' TOKENS', '#ec3013', 2.6); }
  function spawnDrop(x, k = 'coin', chute = true) { const c = mkCoin(k, clamp(x, -HW + R + 0.002, HW - R - 0.002), ZW + R + 0.006 + Math.random() * 0.01, AIR); c.y = CHUTE_Y; c.vy = 0; c.vz = 0.035; c.chute = chute; c.spinV = 0; return c; }
  function drop() { if (!(state.phase === 'play' || state.phase === 'race')) return false; if (dropCD > 0) return false;
    if (state.tokens <= 0) { if (!state.flash || state.flash.until < now()) { sfx.buzz(); flash(state.mode === 'race' ? 'OUT OF RACE TOKENS · WATCH THE BOARD' : 'OUT OF TOKENS · BUY ' + ECON.buyTokens + ' FOR ' + ECON.buyCost + 'g', '#ec3013'); } return false; }
    sfx.wake(); state.tokens -= 1; state.spent += 1; dropCD = 0.16; spawnDrop(state.aim * (HW - R - 0.002)); sfx.drop(); if (state.mode === 'free') save.setStat(KEYS.tokens, state.tokens); emit(); return true; }
  function buy() { if (state.mode !== 'free') return false; if (!save.spend(ECON.buyCost)) { flash('NOT ENOUGH GOLD · ' + ECON.buyCost + 'g FOR ' + ECON.buyTokens, '#ec3013'); return false; } state.tokens += ECON.buyTokens; save.setStat(KEYS.tokens, state.tokens); sfx.win(5); flash('+' + ECON.buyTokens + ' TOKENS', '#ffd23a'); emit(true); return true; }
  const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  function cashLeft() { return save.stat(KEYS.cashDay) === today() ? Math.max(0, ECON.cashCap - save.stat(KEYS.cashToday)) : ECON.cashCap; }
  function cashOut() { if (state.mode !== 'free') return 0; const left = cashLeft(); const g = Math.min(left, Math.floor(state.tokens / ECON.cashRate)); if (left <= 0) { flash('CASH DESK CLOSED · ' + ECON.cashCap + 'g A DAY', '#ec3013'); return 0; } if (g <= 0) { flash('NEED ' + ECON.cashRate + ' TOKENS FOR 1g', '#ec3013'); return 0; }
    if (save.stat(KEYS.cashDay) !== today()) { save.setStat(KEYS.cashDay, today()); save.setStat(KEYS.cashToday, 0); } save.setStat(KEYS.cashToday, save.stat(KEYS.cashToday) + g); state.tokens -= g * ECON.cashRate; save.addGold(g); save.setStat(KEYS.tokens, state.tokens); sfx.win(10); flash('CASHED OUT · +' + g + 'g', '#ffd23a'); emit(true); return g; }

  // ================================== ONLINE TOKEN RACE ==================================
  function isHost() { const R_ = state.race; return !!R_ && R_.hostId() === R_.me; }
  function hostJack(id) { const R_ = state.race; if (!R_) return; const v = R_.pot; if (v <= 0) return; R_.pot = ECON.racePot; const d = { k: 'jackwin', id, v, pot: R_.pot }; R_.send('ev', d); onJackWin(d); }
  function onJackWin(d) { const R_ = state.race; if (!R_) return; R_.pot = d.pot; state.pot = d.pot; const p = R_.players.find(q => q.id === d.id);
    if (d.id === R_.me) { state.tokens += d.v; state.won += d.v; sfx.jackpot(); flash('JACKPOT · +' + d.v + ' TOKENS', '#ec3013', 2.6); } else flash((p ? p.name : 'A RIVAL') + ' TOOK THE JACKPOT · ' + d.v, p ? p.col : '#ec3013', 2.2); emit(true); }
  function raceScore() { return state.tokens + state.prizePts; }
  function raceBegin({ t0, seed, dur = ECON.raceSecs, players, me, send, hostId, onEnd }) {
    if (state.mode === 'free') saveBoard();
    state.mode = 'race'; state.phase = 'count'; state.results = null; state.bonus = null; bonusQ = []; showerQ = []; fx = { walls: 0, push: 0 }; rng = mulberry(seed >>> 0); fillBoard(mulberry((seed ^ 0x9e3779b9) >>> 0)); rng = mulberry(seed >>> 0);
    state.tokens = ECON.raceTokens; state.won = 0; state.spent = 0; state.lost = 0; state.prizePts = 0; state.collected = []; state.pot = ECON.racePot; state.aim = 0;
    state.race = { t0, dur, players, me, send, hostId, onEnd, pot: ECON.racePot, scores: Object.fromEntries(players.map(p => [p.id, { s: ECON.raceTokens, fin: false, gone: false }])), sendT: 0, ended: false, finalAt: 0, awarded: false };
    if (fox) fox.visible = false; emit(true); }
  function netRecv(t, d, id) { const R_ = state.race; if (!R_ || !d) return;
    if (t === 'sn') { const s = R_.scores[id]; if (s) { s.s = +d.s || 0; if (d.fin) s.fin = true; } return; }
    if (t !== 'ev') return;
    if (d.k === 'drain' && isHost()) { R_.pot += Math.max(0, Math.min(5, +d.n || 1)); state.pot = R_.pot; R_.send('ev', { k: 'pot', v: R_.pot }); emit(); }
    else if (d.k === 'pot') { R_.pot = +d.v || 0; state.pot = R_.pot; emit(); }
    else if (d.k === 'jack' && isHost()) hostJack(id);
    else if (d.k === 'jackwin') onJackWin(d);
    else if (d.k === 'final') { const s = R_.scores[id]; if (s) { s.s = +d.s || 0; s.fin = true; } } }
  function netDrop(id) { const R_ = state.race; if (!R_) return; const s = R_.scores[id]; if (s) s.gone = true; const p = R_.players.find(q => q.id === id); if (p && state.phase !== 'results') flash(p.name + ' LEFT', '#8a847e'); }
  function raceStandings() { const R_ = state.race; if (!R_) return []; return R_.players.map(p => { const sc = p.id === R_.me ? raceScore() : (R_.scores[p.id] || {}).s || 0, sv = R_.scores[p.id] || {}; return { id: p.id, name: p.name, col: p.col, s: sc, me: p.id === R_.me, gone: !!sv.gone }; }).sort((a, b) => b.s - a.s || (a.id < b.id ? -1 : 1)); }
  function raceTick(dt) { const R_ = state.race; if (!R_) return; const ms = Date.now();
    if (state.phase === 'count' && ms >= R_.t0) { state.phase = 'race'; sfx.bonus(); flash('GO! DROP TOKENS', '#22c55e', 1.2); }
    if (state.phase === 'race' && ms >= R_.t0 + R_.dur * 1000) { state.phase = 'final'; holdOn = false; R_.finalAt = ms + 5000; flash('TIME! LAST COINS STILL COUNT', '#ffd23a', 2.4); }
    if (state.phase === 'final' && ms >= R_.finalAt && !R_.ended) { R_.ended = true; R_.send('ev', { k: 'final', s: raceScore() }); R_.resultsAt = ms + 1200; }
    if (R_.ended && state.phase === 'final' && ms >= R_.resultsAt) raceResults();
    R_.sendT -= dt; if (R_.sendT <= 0 && state.phase !== 'results') { R_.sendT = 0.6; R_.send('sn', { s: raceScore(), fin: R_.ended }); } }
  function raceResults() { const R_ = state.race; state.phase = 'results'; const st = raceStandings(), mine = st.findIndex(r => r.me), solo = st.filter(r => !r.gone).length < 2;
    const pz = solo ? { gold: 0, xp: 5 } : RACE_PRIZE[Math.min(mine, 2)]; if (!R_.awarded) { R_.awarded = true; if (pz.gold) save.addGold(pz.gold); if (pz.xp) save.addXp(pz.xp); save.best(KEYS.best, raceScore()); }
    state.results = { place: mine + 1, of: st.length, rows: st, gold: pz.gold, xp: pz.xp, score: raceScore(), best: save.stat(KEYS.best), won: state.won, spent: state.spent, lost: state.lost, prizes: state.collected.slice() };
    if (fox) fox.visible = true; emit(true); try { R_.onEnd && R_.onEnd(state.results); } catch (e) {} }
  function netEnd() { if (state.mode !== 'race') return; state.race = null; toIntro(); }

  // ================================== MODES ==================================
  function loadFree() { state.mode = 'free'; rng = Math.random; state.race = null; state.results = null;
    if (!save.flag(KEYS.welcome)) { save.setFlag(KEYS.welcome); save.setStat(KEYS.tokens, save.stat(KEYS.tokens) + ECON.welcome); state.welcome = true; }
    state.tokens = save.stat(KEYS.tokens, 0); state.pot = save.stat(KEYS.pot, ECON.potStart) || ECON.potStart; if (!loadBoard()) fillBoard(); fx = { walls: 0, push: 0 }; bonusQ = []; showerQ = []; state.bonus = null; }
  function start() { if (state.mode !== 'free' || !coins.length) loadFree(); state.phase = 'play'; state.won = 0; state.spent = 0; state.lost = 0; state.collected = []; if (fox) fox.visible = false; sfx.wake(); emit(true); }
  function toIntro() { if (state.mode === 'free') saveBoard(); if (state.mode === 'race') loadFree(); state.phase = 'intro'; holdOn = false; if (fox) fox.visible = true; emit(true); }

  // ================================== INPUT ==================================
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(TABLE + PH * SC)), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
  function aimFromClient(cx, cy) { const r = renderer.domElement.getBoundingClientRect(); ndc.set((cx - r.left) / r.width * 2 - 1, -((cy - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); if (!ray.ray.intersectPlane(plane, hit)) return false; state.aim = clamp(hit.x / SC / (HW - R - 0.002), -1, 1); return true; }
  let pd = null; const playing = () => state.phase === 'play' || state.phase === 'race';
  const onDown = e => { if (!playing()) return; sfx.wake(); pd = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false }; aimFromClient(e.clientX, e.clientY); emit(); };
  const onMove = e => { if (!playing()) return; if (pd && e.pointerId === pd.id) { if (Math.hypot(e.clientX - pd.x, e.clientY - pd.y) > 10) pd.moved = true; aimFromClient(e.clientX, e.clientY); emit(); } else if (e.pointerType === 'mouse' && !pd && e.target === cv) { aimFromClient(e.clientX, e.clientY); dirty = true; } };
  const onUp = e => { if (!pd || e.pointerId !== pd.id) return; const quick = performance.now() - pd.t < 320 && !pd.moved; pd = null; if (quick && playing()) drop(); };
  const cv = renderer.domElement; cv.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const keys = {}; const onKey = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; const dn = e.type === 'keydown';
    if (/^(ArrowLeft|ArrowRight|KeyA|KeyD)$/.test(e.code)) { keys[e.code] = dn; if (playing()) e.preventDefault(); }
    if ((e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'KeyS') && playing()) { e.preventDefault(); if (dn && !e.repeat) { drop(); hold(true); } else if (!dn) hold(false); } };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);
  function hold(on) { holdOn = !!on && playing(); holdT = 0.32; }

  // ================================== CAMERA ==================================
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }, shotCache = new Map(); const V = (x, y, z) => mach.localToWorld(new THREE.Vector3(x, y, z));
  const PLAY_PTS = () => [V(-HW, 0, ZF + 0.02), V(HW, 0, ZF + 0.02), V(-HW, PH, ZW), V(HW, PH, ZW), V(-HW, CHUTE_Y + 0.06, ZW), V(HW, CHUTE_Y + 0.06, ZW)];
  const WIDE_PTS = () => [V(-HW - 0.1, -TABLE / SC, ZF + 0.3), V(HW + 0.1, -TABLE / SC, ZF + 0.3), V(-HW - 0.1, 0.95, ZW - 0.1), V(HW + 0.1, 0.95, ZW - 0.1), new THREE.Vector3(-1.1, 2.75, 0.66), new THREE.Vector3(-1.1, 0, 0.66)];
  function shot(kind) { const W = CW(), H = CH(), port = H > W, k = kind + W + 'x' + H + JSON.stringify(SAFE); if (!shotCache.has(k)) { if (shotCache.size > 40) shotCache.clear();
      shotCache.set(k, kind === 'play' ? fitShot(camera, W, H, SAFE, PLAY_PTS(), port ? 0.98 : 0.74, 0, 0.03) : fitShot(camera, W, H, SAFE, WIDE_PTS(), 0.3, 0.42, 0.05)); } return shotCache.get(k); }
  const camPos = new THREE.Vector3(0, 2.2, 2.6), camLook = new THREE.Vector3(0, TABLE, 0); let camInit = false;

  // ================================== LOOP ==================================
  let lastEmit = 0, raf = 0, last = performance.now(), acc = 0, alive = true;
  function hud() { const n = now(), R_ = state.race, ms = Date.now();
    return { phase: state.phase, mode: state.mode, world: TH_, place: THEME.place, neon: THEME.neon, tokens: state.tokens, won: state.won, spent: state.spent, lost: state.lost, pot: state.pot, gold: save.data.gold, aim: state.aim,
      bonus: state.bonus ? { name: state.bonus.done ? state.bonus.name : state.bonus.shown, sub: state.bonus.done ? state.bonus.sub : 'SPINNING…', col: state.bonus.done ? state.bonus.col : '#ffffff', done: state.bonus.done } : null,
      fx: { walls: Math.ceil(fx.walls), push: Math.ceil(fx.push) }, flash: state.flash && state.flash.until > n ? { txt: state.flash.txt, col: state.flash.col } : null, welcome: !!state.welcome, holding: holdOn,
      cashGold: Math.min(cashLeft(), Math.floor(state.tokens / ECON.cashRate)), cashLeft: cashLeft(), econ: ECON, best: save.stat(KEYS.best), lifetime: save.stat(KEYS.won), charms: save.count(GAME + '.charm'), muted: sfx.muted,
      race: R_ ? { count: state.phase === 'count' ? Math.max(1, Math.ceil((R_.t0 - ms) / 1000)) : 0, left: Math.max(0, Math.ceil((R_.t0 + R_.dur * 1000 - ms) / 1000)), score: raceScore(), rows: raceStandings(), host: isHost() } : null,
      results: state.results, collected: state.collected.slice(-4), coins: coins.length }; }
  function emit(force) { const n = performance.now(); if (!force && n - lastEmit < 110) { dirty = true; return; } lastEmit = n; dirty = false; try { onState && onState(hud()); } catch (e) {} }
  function render(dt) {
    // pusher, gate, carriage
    pusher.position.z = PF; gate.position.x = gateX; carriage.position.x = state.aim * (HW - R - 0.002); guide.position.x = carriage.position.x;
    const near = Math.abs(carriage.position.x - gateX) < GATE_HALF; gateFill.material.opacity = near ? 0.55 : 0.16 + 0.08 * Math.sin(t * 6); guide.material.opacity = playing() ? (near ? 0.3 : 0.14) : 0;
    drainM.forEach(g => { g.visible = fx.walls > 0; });
    // coins
    let n = 0; for (const c of coins) { if (c.dead) continue;
      if (c.lay === BED) c.y = damp(c.y, TH / 2, 22, dt); else if (c.lay === STACK) c.y = damp(c.y, TH * 1.5, 22, dt); else if (c.lay === TOP) c.y = damp(c.y, PH + TH / 2, 22, dt);
      if (c.lay === TRAY) c.y = -0.43 - smooth(0.8, 1.3, c.t) * 0.03;
      const tilt = c.lay === OUT || c.lay === DRAIN || c.lay === AIR ? 0 : c.tilt;
      if (c.mesh) { c.mesh.position.set(c.x, c.y - TH / 2, c.z); c.mesh.rotation.set(c.spin + tilt * Math.cos(c.tiltA), c.yaw, tilt * Math.sin(c.tiltA)); continue; }
      if (n >= MAXC) continue; const sc = c.k === 'big' ? 1.5 : 1;
      _e.set(c.spin + tilt * Math.cos(c.tiltA), c.yaw, tilt * Math.sin(c.tiltA)); _q.setFromEuler(_e); _v.set(c.x, c.y, c.z); _s.set(sc, c.k === 'big' ? 1.3 : 1, sc); _m.compose(_v, _q, _s); coinIM.setMatrixAt(n, _m);
      _s.set(sc * 1.09, (c.k === 'big' ? 1.3 : 1) * 1.45, sc * 1.09); _m.compose(_v, _q, _s); coinOL.setMatrixAt(n, _m);
      const col = c.k === 'big' ? COL_BIG : c.k === 'shower' ? COL_SHOWER : COL_COIN; if (c._col !== col || c._n !== n) { coinIM.setColorAt(n, col); c._col = col; c._n = n; coinIM.instanceColor.needsUpdate = true; } n++; }
    coinIM.count = coinOL.count = n; coinIM.instanceMatrix.needsUpdate = coinOL.instanceMatrix.needsUpdate = true;
    // camera
    const s = shot(playing() || state.phase === 'final' || state.phase === 'count' ? 'play' : 'wide'); if (!camInit) { camPos.copy(s.pos); camLook.copy(s.look); camInit = true; } camPos.lerp(s.pos, 1 - Math.exp(-4 * dt)); camLook.lerp(s.look, 1 - Math.exp(-4 * dt)); camera.position.copy(camPos); camera.lookAt(camLook);
    if (fox && fox.visible && animFox) { try { animFox(fox, dt, 0); } catch (e) {} }
    renderer.render(scene, camera); }
  function frame() { if (!alive) return; raf = requestAnimationFrame(frame); const tn = performance.now(); let dt = Math.min(0.05, (tn - last) / 1000); last = tn; t += dt;
    gateX = 0.27 * Math.sin(t * 1.25) * (0.85 + 0.15 * Math.sin(t * 0.37)); dropCD -= dt;
    if (keys.ArrowLeft || keys.KeyA) { state.aim = clamp(state.aim - dt * 1.4, -1, 1); dirty = true; } if (keys.ArrowRight || keys.KeyD) { state.aim = clamp(state.aim + dt * 1.4, -1, 1); dirty = true; }
    if (holdOn) { holdT -= dt; if (holdT <= 0) { holdT = 0.28; if (!drop()) holdOn = false; } }
    const tn2 = now(); while (showerQ.length && showerQ[0].at <= tn2) { const q = showerQ.shift(); spawnDrop((rng() * 2 - 1) * (HW - 0.06), q.k, false); }
    if (state.bonus && !state.bonus.done) { const b = state.bonus; b.spin -= dt; b.tk = (b.tk || 0) - dt; if (b.tk <= 0) { b.tk = 0.08 + (1.35 - Math.max(0, b.spin)) * 0.08; b.idx = (b.idx + 1) % BONUS.length; b.shown = BONUS[b.idx].name; sfx.tick(); emit(true); } if (b.spin <= 0) { b.done = true; b.hold = 1.3; applyBonus(b); emit(true); } }
    else if (state.bonus && state.bonus.done) { state.bonus.hold -= dt; if (state.bonus.hold <= 0) nextBonus(); }
    fx.walls = Math.max(0, fx.walls - dt); fx.push = Math.max(0, fx.push - dt);
    if (state.mode === 'race') raceTick(dt);
    acc += dt; let k = 0; while (acc >= 1 / 60 && k < 3) { physStep(1 / 60); acc -= 1 / 60; k++; } if (k === 3) acc = 0;
    if (state.mode === 'free' && state.phase === 'play') { saveT += dt; if (saveT > 8) { saveT = 0; saveBoard(); } }
    if (state.flash && state.flash.until < now() + 0 && state.flash.until < now()) { state.flash = null; dirty = true; }
    render(dt); if (dirty) emit(); }
  const onResize = () => { renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); shotCache.clear(); };
  let ro; try { ro = new ResizeObserver(onResize); ro.observe(container); } catch (e) { addEventListener('resize', onResize); }
  const onHide = () => saveBoard(); addEventListener('pagehide', onHide);
  loadFree(); frame(); emit(true);

  return {
    hud, start, toIntro, drop, hold, buy, cashOut, raceBegin, netRecv, netDrop, netEnd, netOn: () => state.mode === 'race',
    setAim(u) { state.aim = clamp(u, -1, 1); emit(); }, nudge(d) { state.aim = clamp(state.aim + d, -1, 1); emit(); },
    mute(m) { sfx.setMuted(m === undefined ? !sfx.muted : !!m); emit(true); },
    setSafe(top, bottom, left = 0, right = 0) { const ch = Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3 || Math.abs(SAFE.right - right) > 3; if (ch) { Object.assign(SAFE, { top, bottom, left, right }); shotCache.clear(); } },
    // debug / tuning: run the board for n seconds with auto-drops, report payout
    sim(sec = 60, every = 0.5) { simming = true; const keep = { ...state }; state.phase = 'play'; const t0 = { tok: state.tokens }; let dropped = 0, w0 = state.won, l0 = state.lost; state.tokens = 1e6; for (let s = 0; s < sec * 60; s++) { if (s % Math.round(every * 60) === 0) { spawnDrop((Math.random() * 2 - 1) * (HW - R)); dropped++; } physStep(1 / 60); }
      const out = { dropped, won: state.won - w0, lost: state.lost - l0, onBoard: coins.filter(c => !c.dead && c.lay <= TOP).length, stacked: coins.filter(c => c.lay === STACK).length }; state.tokens = t0.tok; state.won = keep.won; state.lost = keep.lost; state.pot = keep.pot; state.phase = keep.phase; simming = false; return out; },
    reset() { fillBoard(); saveBoard(); emit(true); },
    forceBonus(id) { const b = BONUS.find(q => q.id === id) || pickBonus(); sfx.bonus(); bonusQ.push(b); if (!state.bonus) nextBonus(); },   // console / tests: __coinPusher.forceBonus('jackpot')
    destroy() { alive = false; cancelAnimationFrame(raf); saveBoard(); try { ro && ro.disconnect(); } catch (e) {} removeEventListener('resize', onResize); removeEventListener('pagehide', onHide); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); renderer.dispose(); renderer.domElement.remove(); },
    get state() { return state; }, get coins() { return coins; }, get fox() { return fox; }, get safe() { return { ...SAFE }; }, get scene() { return scene; }, get camera() { return camera; } };
}
