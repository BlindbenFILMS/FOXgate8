// 8 GATES — TUG OF WAR [tugOfWar]. Minigame #61 (Strength & Spectacle). A building interior that fits any world:
// the page passes ?theme=hall|stone|tech|sand and ?place=<label> so a world can dress the room as its own hall.
//
// HOW IT PLAYS
//   Tap PULL on the HEAVE beat (the ring closing on the button). PERFECT / GOOD / SLIP.
//   Timed pulls build your COMBO; your CPU teammates fall into rhythm with you as it grows.
//   Hold DIG IN to brace: the rope barely moves against you and your breath (stamina) comes back fast.
//   Rival teams SURGE (red warning one beat ahead): be dug in on that beat to BLOCK it.
//   Drag the red ribbon past your tape to take the round. Best of 3.
//
// MODES  solo ladder (4 rivals, DRAFT names) · 2 players on one phone · online 2–5 players (two teams, CPU fills to 4 v 4).
// ONLINE uses engine/duel-net.js (connectDuel, same as Skate Park) with game 'tugWar'. If that file can't load,
//        it falls back to BroadcastChannel so it can be tested in two tabs of one browser.
//        Host = lowest id in the match; the host runs the rope, every phone judges its own beat and sends its pull.
//
// SHARED FILES used read-only: vendor/three, fox-kit.js, engine/cast.js, engine/save.js, engine/textures.js.
// The small stage helpers below (toon gradient, outline, M(), fitShot, synth audio) are COPIED from engine/restaurant-kit.js
// and village-game.js on purpose (parallel rules): this module touches no shared file.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { crestTex } from '../../engine/textures.js';

export const TUG = { key: 'tugWar', name: 'TUG OF WAR', room: 'tugOfWar', number: 61 };
// DRAFT for Ben: rival names, colours, gold.
export const RIVALS = [
  { id: 'pups', name: 'THE PUPS', line: 'Four young foxes. Loud, keen, a bit wobbly.', skill: 0.42, surge: 0, brace: 0.15, col: '#38bdf8', fur: '#f59e57', gold: 10 },
  { id: 'mill', name: 'MILL HANDS', line: 'Strong arms from the lumber mill. They surge now and then.', skill: 0.56, surge: 0.09, brace: 0.35, col: '#22c55e', fur: '#b8622a', gold: 20 },
  { id: 'iron', name: 'IRON TAILS', line: 'Guards on their day off. Big surges, hard to move.', skill: 0.68, surge: 0.14, brace: 0.55, col: '#a78bfa', fur: '#8a5a3a', gold: 35 },
  { id: 'anchors', name: 'THE ANCHORS', line: 'The champions. Beat them for the Golden Rope.', skill: 0.8, surge: 0.18, brace: 0.75, col: '#ffd23a', fur: '#e8e1d8', gold: 60, trophy: 'tugWarTrophy' },
];
export const NET_TEAMS = [['RED', '#ec3013'], ['BLUE', '#38bdf8']];
export const THEMES = {
  hall: { name: 'THE HALL', bg: '#2a2320', floor: '#b07a46', floor2: '#9c6a3b', wall: '#efe4d2', trim: '#7a4a26', mat: '#3b6b4a', light: 0xfff1dc },
  stone: { name: 'THE KEEP', bg: '#1d1f26', floor: '#8b8a93', floor2: '#7a7983', wall: '#bdb8b0', trim: '#4a4652', mat: '#7a2e2e', light: 0xffe6c8 },
  tech: { name: 'THE DECK', bg: '#060b18', floor: '#28344f', floor2: '#202a42', wall: '#1a2440', trim: '#38bdf8', mat: '#0f1a30', light: 0xd8ecff },
  sand: { name: 'THE COURT', bg: '#3a2414', floor: '#e2c48e', floor2: '#d6b47a', wall: '#e9cfa4', trim: '#b4532a', mat: '#c2410c', light: 0xffe9c4 },
};
export const SAVE_KEYS = ['tugWar.beat.<rivalId>', 'tugWar.wins', 'tugWar.bestCombo', 'tugWar.perfects', 'tugWar.onlineWins', 'tugWar.sound'];

const WIN = 1.6, ROUND_T = 45, PER_TEAM = 4, GAP = 0.86, FIRST = 1.25, K = 0.085;
const Q = { perfect: { imp: 1, col: '#22c55e', txt: 'PERFECT' }, good: { imp: 0.62, col: '#ffd23a', txt: 'GOOD' }, miss: { imp: 0.12, col: '#ec3013', txt: 'SLIP' } };
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, pick = a => a[Math.floor(Math.random() * a.length)];

// ---------- tiny synth (copied idea from village-game Ambience: tone(f, dur, vol, type) + stereo pan) ----------
function synth() {
  let ac = null, on = true, quiet = false; try { on = save.stat('tugWar.sound', 1) !== 0; } catch (e) {}
  const ctx = () => { if (!ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ac = null; } } if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); return ac; };
  function tone(f, d = 0.12, v = 0.06, type = 'triangle', pan = 0, slide = 0) { if (!on || quiet) return; const a = ctx(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + d); let n = g; if (a.createStereoPanner) { const p = a.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); g.connect(p); n = p; } o.connect(g); n.connect(a.destination); o.start(t); o.stop(t + d + 0.02); }
  let nbuf = null;
  function noise(d = 0.4, v = 0.05, f = 900, q = 0.7, pan = 0) { if (!on || quiet) return; const a = ctx(); if (!a) return;
    if (!nbuf) { nbuf = a.createBuffer(1, Math.floor(a.sampleRate * 1.5), a.sampleRate); const ch = nbuf.getChannelData(0); for (let i = 0; i < ch.length; i++) ch[i] = Math.random() * 2 - 1; }
    const t = a.currentTime, src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain(); src.buffer = nbuf; src.loop = true; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = q;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.2, d * 0.3)); g.gain.exponentialRampToValueAtTime(0.0001, t + d); src.connect(bp); bp.connect(g); let n = g;
    if (a.createStereoPanner) { const pn = a.createStereoPanner(); pn.pan.value = clamp(pan, -1, 1); g.connect(pn); n = pn; } n.connect(a.destination); src.start(t, Math.random()); src.stop(t + d + 0.05); }
  return { tone, noise, unlock: ctx, set quiet(v) { quiet = !!v; }, get on() { return on; }, set on(v) { on = !!v; try { save.setStat('tugWar.sound', on ? 1 : 0); } catch (e) {} } };
}
let BUZZ_OFF = false; const buzz = ms => { if (BUZZ_OFF) return; try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };

// ---------- network: engine/duel-net.js when present, else a same-browser BroadcastChannel stand-in ----------
async function connect({ code, onJoin, onLeave, onMsg, onStatus }) {
  try { const mod = await import(new URL('engine/duel-net.js', document.baseURI).href); if (mod && mod.connectDuel) return await mod.connectDuel({ game: 'tugWar', code, onJoin, onLeave, onMsg, onStatus }); } catch (e) {}
  if (typeof BroadcastChannel === 'undefined') { onStatus && onStatus('offline'); return null; }
  let bc; try { bc = new BroadcastChannel('8gates-tugWar-' + code); } catch (e) { onStatus && onStatus('offline'); return null; } const id = Math.random().toString(36).slice(2, 10), seen = new Set();
  bc.onmessage = e => { const m = e.data || {}; if (!m.from || m.from === id || (m.to && m.to !== id)) return; if (!seen.has(m.from)) { seen.add(m.from); onJoin && onJoin(m.from); } if (m.t === '__bye') { seen.delete(m.from); onLeave && onLeave(m.from); return; } onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => onStatus && onStatus('local'), 0);
  return { id, send: (t, d, to) => { try { bc.postMessage({ from: id, to: to || null, t, d }); } catch (e) {} }, leave: () => { try { bc.postMessage({ from: id, t: '__bye' }); bc.close(); } catch (e) {} } };
}

export async function createTugOfWar({ container, onState = () => {}, theme = 'hall', place = '' }) {
  const TH = THEMES[theme] || THEMES.hall;
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.5 : 2)); renderer.setSize(CW(), CH());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color(TH.bg); scene.fog = new THREE.Fog(TH.bg, 24, 55);
  const camera = new THREE.PerspectiveCamera(42, CW() / CH(), 0.1, 80), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  // toon + ink outline (copied from restaurant-kit createStage)
  const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 170, 170, 170, 255, 255, 255, 255, 255]), t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; return t; })();
  const cache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  const au = synth();

  // ---------- the room ----------
  scene.add(new THREE.HemisphereLight(TH.light, 0x5a4a44, 1.2)); const sun = new THREE.DirectionalLight(TH.light, 1.5); sun.position.set(2, 9, 6); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 6, bottom: -6 }); scene.add(sun);
  const RW = 28, RD = 15, RH = 6;
  { const cv = document.createElement('canvas'); cv.width = cv.height = 256; const g = cv.getContext('2d'); g.fillStyle = TH.floor; g.fillRect(0, 0, 256, 256); g.fillStyle = TH.floor2; for (let i = 0; i < 8; i++) if (i % 2) g.fillRect(0, i * 32, 256, 32); g.fillStyle = 'rgba(0,0,0,0.12)'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 32, 256, 2); for (let i = 0; i < 8; i++) g.fillRect(((i * 97) % 256), i * 32, 2, 32);
    const tx = new THREE.CanvasTexture(cv); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(RW / 4, RD / 4); tx.colorSpace = THREE.SRGBColorSpace;
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), new THREE.MeshToonMaterial({ map: tx, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl); }
  const wallM = toon(TH.wall), trimM = toon(TH.trim);
  // walls are one-sided planes facing in: when the camera swings outside the room (portrait view) they simply vanish
  const wallIn = new THREE.MeshToonMaterial({ color: TH.wall, gradientMap: grad, side: THREE.FrontSide }), trimIn = new THREE.MeshToonMaterial({ color: TH.trim, gradientMap: grad, side: THREE.FrontSide });
  const plane = (w, h, mat, x, y, z, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat); m.position.set(x, y, z); m.rotation.y = ry; m.receiveShadow = !touch; scene.add(m); return m; };
  plane(RW, RH, wallIn, 0, RH / 2, -RD / 2, 0); plane(RW, 0.5, trimIn, 0, 0.25, -RD / 2 + 0.01, 0);
  [-1, 1].forEach(s => { plane(RD, RH, wallIn, s * RW / 2, RH / 2, 0, -s * Math.PI / 2); plane(RD, 0.5, trimIn, s * (RW / 2 - 0.01), 0.25, 0, -s * Math.PI / 2); });
  // pull mat, tapes, centre line
  M(new THREE.BoxGeometry(11.4, 0.02, 2.2), toon(TH.mat), 0, 0.01, 0, null, 0);
  const tape = (x, col, w = 0.12) => M(new THREE.BoxGeometry(w, 0.025, 2.0), toon(col), x, 0.022, 0, null, 0);
  tape(0, '#f6f3ee', 0.06); const tapeL = tape(-WIN, '#ec3013'), tapeR = tape(WIN, '#38bdf8');
  // wall banners: team colours + a big rope crest; recoloured per match
  const banner = (x, col) => { const g = new THREE.Group(); g.position.set(x, 2.6, -RD / 2 + 0.13); scene.add(g); const cl = M(new THREE.BoxGeometry(1.5, 2.2, 0.04), toon(col), 0, 0, 0, g, 0.02); M(new THREE.BoxGeometry(1.7, 0.1, 0.1), toon('#3a2a1e'), 0, 1.15, 0.03, g, 0.01); return cl; };
  const banL = banner(-4.2, '#ec3013'), banR = banner(4.2, '#38bdf8'); banner(-9.5, TH.trim); banner(9.5, TH.trim);
  { const g = new THREE.Group(); g.position.set(0, 3.1, -RD / 2 + 0.12); scene.add(g); M(new THREE.TorusGeometry(0.55, 0.09, 10, 28), toon('#c9a26a'), 0, 0, 0, g, 0.02, 0.55); M(new THREE.BoxGeometry(2.6, 0.12, 0.12), toon('#c9a26a'), 0, -0.85, 0, g, 0.015); }
  if (theme === 'tech') [-6, -2, 2, 6].forEach(x => M(new THREE.BoxGeometry(1.4, 0.06, 0.05), new THREE.MeshBasicMaterial({ color: 0x38bdf8 }), x, 4.2, -RD / 2 + 0.12, null, 0));
  // benches along the back for a little life (cheap: boxes only)
  [-11.2, 11.2].forEach(x => { M(new THREE.BoxGeometry(2.2, 0.12, 0.5), trimM, x, 0.5, -RD / 2 + 0.7, null, 0.015); [-0.9, 0.9].forEach(dx => M(new THREE.BoxGeometry(0.1, 0.5, 0.4), trimM, x + dx, 0.25, -RD / 2 + 0.7, null, 0)); });

  // ---------- the mud pit: the losing team's front fox ends up in it ----------
  { const mudM = new THREE.MeshToonMaterial({ color: '#5b3a21', gradientMap: grad }), mudHi = new THREE.MeshToonMaterial({ color: '#80583a', gradientMap: grad });
    const mud = M(new THREE.CylinderGeometry(1, 1, 0.03, 28), mudM, 0, 0.026, 0, null, 0); mud.scale.set(0.95, 1, 1.02);
    [[0.32, -0.38, 0.2], [-0.36, 0.3, 0.15], [0.12, 0.5, 0.11]].forEach(([x, z, r]) => { const h = M(new THREE.CylinderGeometry(r, r, 0.031, 14), mudHi, x, 0.028, z, null, 0); h.scale.z = 0.6; });
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3, b = M(new THREE.SphereGeometry(0.13, 7, 5), mudM, Math.cos(a) * 0.95, 0.02, Math.sin(a) * 1.02, null, 0); b.scale.y = 0.3; } }

  // ---------- the crowd: instanced (8 draw calls for ~44 fans), cheering for the side they sit on ----------
  const crowd = (() => {
    const fans = [], add = (x, y, z) => fans.push({ x, y, z, t: x < 0 ? 0 : 1, off: rr(0, 6.3), w: rr(5.5, 8), fur: new THREE.Color(pick(['#f2741f', '#e0662a', '#d9733a', '#c96a2a', '#b8622a', '#f59e57', '#9a6a44', '#e8e1d8'])), flag: false, ex: 0.3 });
    // two bleacher tiers along the back wall, and standing fans down both side walls
    const t1 = M(new THREE.BoxGeometry(19.5, 0.36, 0.95), trimM, 0, 0.18, -RD / 2 + 1.45, null, 0.02), t2 = M(new THREE.BoxGeometry(19.5, 0.76, 0.95), trimM, 0, 0.38, -RD / 2 + 0.5, null, 0.02);
    for (let x = -8.6; x <= 8.61; x += 1.15) if (Math.abs(x) > 0.5) add(x + rr(-0.12, 0.12), 0.36, -RD / 2 + 1.45);
    for (let x = -9.1; x <= 9.11; x += 1.3) add(x + rr(-0.12, 0.12), 0.76, -RD / 2 + 0.5);
    [-1, 1].forEach(sd => { for (let z = -3.4; z <= 3.0; z += 1.6) { add(sd * 9.2, 0, z + rr(-0.2, 0.2)); add(sd * 10.4, 0, z + 0.8 + rr(-0.2, 0.2)); } });
    fans.forEach((f, i) => { f.flag = i % 3 === 1; f.yaw = Math.atan2(-f.x, -f.z * 0.6 + 2); });
    const N = fans.length, nF = fans.filter(f => f.flag).length, white = c => new THREE.MeshToonMaterial({ color: c, gradientMap: grad });
    const inst = (geo, mat, n) => { const m = new THREE.InstancedMesh(geo, mat, n); m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.frustumCulled = false; scene.add(m); return m; };
    const sph = new THREE.SphereGeometry(1, 10, 8), body = inst(sph, white('#ffffff'), N), head = inst(sph, white('#ffffff'), N), ears = inst(new THREE.ConeGeometry(1, 1, 4), white('#ffffff'), N * 2),
      eyes = inst(new THREE.SphereGeometry(1, 6, 4), new THREE.MeshBasicMaterial({ color: 0x14121c }), N * 2), arms = inst(new THREE.BoxGeometry(1, 1, 1), white('#ffffff'), N * 2), flags = inst(new THREE.BoxGeometry(1, 1, 1), white('#ffffff'), nF),
      bodyO = inst(sph, outlineMat, N), headO = inst(sph, outlineMat, N);
    fans.forEach((f, i) => { head.setColorAt(i, f.fur); ears.setColorAt(i * 2, f.fur); ears.setColorAt(i * 2 + 1, f.fur); });
    function recolor(cols) { let k = 0; fans.forEach((f, i) => { const c = new THREE.Color(cols[f.t]); body.setColorAt(i, c); arms.setColorAt(i * 2, f.fur); arms.setColorAt(i * 2 + 1, f.fur); if (f.flag) flags.setColorAt(k++, c); });
      [body, head, ears, arms, flags].forEach(m => { if (m.instanceColor) m.instanceColor.needsUpdate = true; }); }
    const o = new THREE.Object3D(), root = new THREE.Object3D(), mA = new THREE.Matrix4(), mB = new THREE.Matrix4(); root.rotation.order = 'YXZ';
    function put(mesh, k, lx, ly, lz, sx, sy, sz, rx = 0, rz = 0) { o.position.set(lx, ly, lz); o.rotation.set(rx, 0, rz); o.scale.set(sx, sy, sz); o.updateMatrix(); o.matrix.premultiply(root.matrix); mesh.setMatrixAt(k, o.matrix); }
    function update(time, dt, exc, cam, look) { let k = 0; const dL = Math.hypot(cam.x - look.x, cam.z - look.z) * 0.8;
      fans.forEach((f, i) => { f.ex = damp(f.ex, exc[f.t], 3, dt); const hide = Math.hypot(cam.x - f.x, cam.z - f.z) < dL; // fans between the camera and the rope would block the view
        if (hide) { root.position.set(0, -50, 0); root.rotation.set(0, 0, 0); root.scale.setScalar(0.0001); } else root.scale.setScalar(1); const ex = f.ex, hop = Math.max(0, Math.sin(time * f.w + f.off)) * 0.2 * clamp(ex * 1.3 - 0.25, 0, 1), slump = ex < 0.12 ? 0.18 : 0;
        if (!hide) { root.position.set(f.x, f.y + hop, f.z); root.rotation.set(slump, f.yaw, 0); } root.updateMatrix();
        put(body, i, 0, 0.36, 0, 0.26, 0.36, 0.22); put(bodyO, i, 0, 0.36, 0, 0.29, 0.39, 0.25); put(head, i, 0, 0.86 - slump * 0.3, 0.02, 0.2, 0.19, 0.2); put(headO, i, 0, 0.86 - slump * 0.3, 0.02, 0.225, 0.215, 0.225);
        put(ears, i * 2, -0.11, 1.04 - slump * 0.3, 0, 0.07, 0.17, 0.06, 0, 0.25); put(ears, i * 2 + 1, 0.11, 1.04 - slump * 0.3, 0, 0.07, 0.17, 0.06, 0, -0.25);
        put(eyes, i * 2, -0.07, 0.9 - slump * 0.3, 0.18, 0.03, 0.04, 0.02); put(eyes, i * 2 + 1, 0.07, 0.9 - slump * 0.3, 0.18, 0.03, 0.04, 0.02);
        const up = clamp(ex * 1.5 - 0.35, 0, 1), wave = Math.sin(time * f.w * 1.3 + f.off) * 0.35 * up;
        [-1, 1].forEach((sd, a) => { const ang = sd * (0.25 + up * 2.45) + wave * sd; o.position.set(sd * 0.26, 0.55, 0); o.rotation.set(0, 0, ang); o.scale.set(1, 1, 1); o.updateMatrix();
          mA.makeTranslation(0, -0.5, 0).premultiply(mB.makeScale(0.07, 0.3, 0.07)).premultiply(o.matrix).premultiply(root.matrix); arms.setMatrixAt(i * 2 + a, mA);
          if (f.flag && a === 1) { mA.makeScale(0.42, 0.26, 0.02).premultiply(mB.makeTranslation(0.22, -0.42, 0)).premultiply(mB.makeRotationZ(Math.sin(time * 9 + f.off) * 0.3 * (0.3 + up))).premultiply(o.matrix).premultiply(root.matrix); flags.setMatrixAt(k++, mA); } }); });
      [body, bodyO, head, headO, ears, eyes, arms, flags].forEach(m => m.instanceMatrix.needsUpdate = true); }
    return { update, recolor, N };
  })();

  // ---------- rope + ribbon ----------
  const rope = new THREE.Group(); scene.add(rope); let ROPE_Y = 1.0;
  const ropeLen = 2 * (FIRST + (PER_TEAM - 1) * GAP + 1.0), ropeMat = new THREE.MeshToonMaterial({ color: '#c9a26a', gradientMap: grad, emissive: 0x000000 });
  const ropeMesh = M(new THREE.CylinderGeometry(0.04, 0.04, ropeLen, 10), ropeMat, 0, 0, 0, rope, 0.012, 0.04); ropeMesh.rotation.z = Math.PI / 2;
  for (let i = -6; i <= 6; i++) { if (!i) continue; const b = M(new THREE.TorusGeometry(0.045, 0.012, 5, 10), toon('#a5804e'), i * 0.42, 0, 0, rope, 0); b.rotation.y = Math.PI / 2; }
  const ribbon = new THREE.Group(); rope.add(ribbon); M(new THREE.BoxGeometry(0.06, 0.06, 0.06), toon('#ec3013'), 0, 0, 0, ribbon, 0.01); const rib = M(new THREE.BoxGeometry(0.04, 0.42, 0.16), toon('#ec3013'), 0, -0.24, 0, ribbon, 0.01);

  // ---------- referee (centre back) ----------
  const ref = kit.makeFox({ ...CAST.player, look: { ...PLAYER_MALE, fur: '#9a6a44', furDark: '#6b4428' }, torso: ['#f6f3ee', '#d8d4cc', '#201e1d'], outfit: 'tee', crest: '', gear: 'none', mood: 'neutral' });
  ref.position.set(0, 0, -2.1); ref.rotation.y = 0; hideGear(ref);
  function hideGear(f) { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; }

  // ---------- teams of foxes ----------
  const FURS = ['#f2741f', '#e0662a', '#d9733a', '#f08a3a', '#c96a2a', '#b8622a', '#f59e57'];
  let foxes = [[], []];
  function buildFoxes(cfg) { // cfg[t][i] = { me, look, col, mood }
    foxes.flat().forEach(f => { scene.remove(f); f.traverse(o => { if (o.geometry && o.material !== outlineMat) o.geometry.dispose(); }); }); foxes = [[], []];
    for (let t = 0; t < 2; t++) for (let i = 0; i < PER_TEAM; i++) { const c = cfg[t][i], col = c.col;
      const base = c.me ? { ...CAST.player } : { ...CAST.player, look: { ...(i % 2 ? PLAYER_FEMALE : PLAYER_MALE), fur: c.fur || FURS[(i * 3 + t * 2) % FURS.length] } };
      const f = kit.makeFox({ ...base, torso: [col, '#' + new THREE.Color(col).multiplyScalar(0.72).getHexString(), '#201e1d'], outfit: 'tee', crest: '', gear: 'none', mood: 'determined' });
      hideGear(f); f.userData.tug = { t, i, side: i % 2 ? 1 : -1, pullA: 0, brace: 0, step: rr(0, 6), zOff: 0 }; f.rotation.y = t ? -Math.PI / 2 : Math.PI / 2; foxes[t].push(f); }
    // measure: pose once, find where the gripping hand is, then sit the rope there and offset each fox sideways onto it
    const f0 = foxes[0][0]; f0.position.set(0, 0, 0); f0.userData.tug.side = -1; poseFox(f0, 0.016, 0, 0); f0.updateMatrixWorld(true); const h = handPos(f0);
    ROPE_Y = clamp(h.y, 0.7, 1.4); const zA = h.z; f0.userData.tug.side = 1; poseFox(f0, 0.016, 0, 0); f0.updateMatrixWorld(true); const zB = handPos(f0).z; f0.userData.tug.side = -1;
    foxes.forEach((T, t) => T.forEach((f, i) => { const u = f.userData.tug, s = i % 2 ? 1 : -1; u.side = s; const hz = s === -1 ? zA : zB; u.zOff = t ? hz : -hz; }));
    foxes.flat().forEach(slim); rope.position.y = ROPE_Y; placeFoxes(0); FOXBOX.makeEmpty(); foxes.flat().forEach(f => { f.updateMatrixWorld(true); FOXBOX.expandByObject(f); });
  }
  const FOXBOX = new THREE.Box3();
  // phone budget: ten foxes are ~950 draw calls; ink outlines on tiny parts (fingers, teeth, buckles) are sub-pixel on a phone,
  // so hide them there. Silhouette outlines (head, body, limbs, tail) stay. Saves ~200 draw calls.
  function slim(root) { if (!touch) return; root.traverse(o => { if (!o.isMesh || o.material !== outlineMat) return; const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); if (g.boundingSphere.radius < 0.08) o.visible = false; }); }
  const _h = V3();
  function handPos(f) { const P = f.userData.P, a = P.arms[f.userData.tug.side === -1 ? 0 : 1]; return a.localToWorld(_h.set(0, -0.55, 0.05)).clone(); }
  function placeFoxes(x) { foxes.forEach((T, t) => T.forEach((f, i) => { const s = t ? 1 : -1; f.position.set(x + s * (FIRST + i * GAP), 0, f.userData.tug.zOff); })); }
  function poseFox(f, dt, ropeV, mood) {
    const u = f.userData, P = u.P, g = u.tug, tsign = g.t ? 1 : -1; kit.animFox(f, dt, 0);
    g.pullA = Math.max(0, g.pullA - dt * 3.2); const pa = Math.sin(Math.min(1, g.pullA) * Math.PI);
    const away = ropeV * tsign; // >0 = rope moving toward this team (they step back)
    const lean = 0.32 + pa * 0.22 + g.brace * 0.18; P.body.rotation.x = -lean; P.body.position.y = -g.brace * 0.08;
    const armRel = -1.45 + lean - pa * 0.15; const near = g.side === -1 ? 0 : 1;
    P.arms[near].rotation.x = armRel; P.arms[near].rotation.z = g.side === -1 ? 0.18 : -0.18;
    P.arms[1 - near].rotation.x = armRel - 0.08; P.arms[1 - near].rotation.z = g.side === -1 ? -0.55 : 0.55;
    g.step += dt * (Math.abs(ropeV) * 22 + (g.brace ? 0 : 0.6)); const st = Math.sin(g.step) * clamp(Math.abs(ropeV) * 6, 0, 0.5);
    P.legs[0].rotation.x = -0.6 + lean + st; P.legs[1].rotation.x = 0.15 + lean - st - g.brace * 0.2;
    if (mood && u.mood !== mood) u.mood = mood;
  }

  // ---------- camera fit (copied from restaurant-kit cameraFit, trimmed) ----------
  const SAFE = { top: 0, bottom: 0 }, fitCam = new THREE.PerspectiveCamera(42, 1, 0.1, 80), _p = V3(); let shot = null, shotKey = '';
  function fitShot(pts, el, yaw, margin = 0.05) { const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const yT = 1 - 2 * SAFE.top / H - margin, yB = -1 + 2 * SAFE.bottom / H + margin, xR = 1 - margin, xL = -1 + margin, sx = 0, sy = (yT + yB) / 2;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    const fits = d => { const b = bounds(d); return b && b.x0 >= xL && b.x1 <= xR && b.y0 >= yB && b.y1 <= yT; };
    let d = 6; for (let it = 0; it < 4; it++) { let lo = 1, hi = 40; for (let k = 0; k < 20; k++) { const m = (lo + hi) / 2; if (fits(m)) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, th = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitCam.matrixWorld, 0), up = V3().setFromMatrixColumn(fitCam.matrixWorld, 1);
      tgt.addScaledVector(right, (cx - sx) * th * fitCam.aspect).addScaledVector(up, (cy - sy) * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt }; }
  function wantShot() { const W = CW(), H = CH(), port = H > W * 1.05, key = [W, H, SAFE.top, SAFE.bottom, port, S.mode, S.myTeam].join('|');
    if (key === shotKey && shot) return shot; shotKey = key;
    // frame the real fox bounds, plus the slide the camera does not follow (it follows half of the rope's travel)
    const B = FOXBOX.isEmpty() ? new THREE.Box3(V3(-4.6, 0, -0.8), V3(4.6, 2.5, 0.8)) : FOXBOX, slack = port && S.mode !== 'local' ? 0.25 : WIN * 0.5, x0 = B.min.x - slack, x1 = B.max.x + slack, y1 = B.max.y, z0 = B.min.z, z1 = B.max.z;
    const pts = [V3(x0, 0, z0), V3(x0, y1, z0), V3(x0, 0, z1), V3(x0, y1, z1), V3(x1, 0, z0), V3(x1, y1, z0), V3(x1, 0, z1), V3(x1, y1, z1)];
    // portrait: look down the rope from behind your team so the foxes stay big; landscape / 2 players: square side view
    const yaw = port && S.mode !== 'local' ? (S.myTeam ? 1.2 : -1.2) : 0, el = port ? (S.mode === 'local' ? 0.55 : 0.4) : 0.2;
    shot = fitShot(pts, el, yaw, port ? 0.03 : 0.04); return shot; }

  // ---------- dust puffs ----------
  const dustTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const puffs = []; for (let i = 0; i < 18; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xe8dcc8, transparent: true, opacity: 0, depthWrite: false })); scene.add(s); puffs.push({ s, life: 0, v: V3() }); } let pI = 0;
  const puff = (x, z, n = 2, col = 0xe8dcc8, up = 1, size = 1) => { for (let i = 0; i < n; i++) { const p = puffs[pI = (pI + 1) % puffs.length]; p.s.position.set(x + rr(-0.15, 0.15), 0.08, z + rr(-0.15, 0.15)); p.s.material.color.set(col); p.life = 1; p.sz = size; p.v.set(rr(-0.5, 0.5) * up, rr(0.3, 0.6) * up * (up > 1 ? 2.2 : 1), rr(-0.4, 0.4) * up); } };
  for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xe8dcc8, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; scene.add(s); puffs.push({ s, life: 0, v: V3(), sz: 1 }); }

  // ---------- pop-up words over your fox (PERFECT ×5, SLIP!, BLOCKED!, FRENZY!) ----------
  const popTex = new Map(); function popT(txt, col) { const k = txt + col; if (popTex.has(k)) return popTex.get(k); if (popTex.size > 40) { popTex.forEach(t => t.dispose()); popTex.clear(); }
    const c = document.createElement('canvas'); c.width = 512; c.height = 128; const g = c.getContext('2d'); g.font = '900 76px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.lineWidth = 16; g.strokeStyle = '#000'; g.strokeText(txt, 256, 66); g.fillStyle = col; g.fillText(txt, 256, 66); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; popTex.set(k, t); return t; }
  const pops = []; let popI = 0; for (let i = 0; i < 5; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false })); sp.visible = false; sp.renderOrder = 10; scene.add(sp); pops.push({ s: sp, life: 0, big: 1 }); }
  function pop(txt, col, x, y, z, big = 1) { const p = pops[popI = (popI + 1) % pops.length]; p.s.material.map = popT(txt, col); p.s.material.needsUpdate = true; p.s.position.set(x, y, z); p.life = 1; p.big = big; p.s.visible = true; }

  // ---------- confetti for a round win (one instanced draw call) ----------
  const CONF = touch ? 90 : 150, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.09, 0.14), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONF); conf.frustumCulled = false; conf.visible = false; scene.add(conf);
  const cf = Array.from({ length: CONF }, () => ({ p: V3(), v: V3(), r: V3(), w: V3() })); let confT = 0; const _cm = new THREE.Object3D();
  function confetti(x, cols) { cf.forEach((c, i) => { c.p.set(x + rr(-2.5, 2.5), rr(3.2, 4.6), rr(-1.5, 1.5)); c.v.set(rr(-1.2, 1.2), rr(-0.5, 1.5), rr(-1, 1.4)); c.r.set(rr(0, 6), rr(0, 6), rr(0, 6)); c.w.set(rr(-8, 8), rr(-8, 8), rr(-8, 8)); conf.setColorAt(i, new THREE.Color(pick([...cols, '#ffd23a', '#ffffff']))); }); conf.instanceColor.needsUpdate = true; confT = 3.2; conf.visible = true; }

  // ================= GAME STATE =================
  // members: { t, i, kind: 'me'|'p2'|'remote'|'cpu', id, name, combo, best, stam, brace, slipT, lastBeat, pc, q, qT, perfects, goods, misses, blocks }
  const S = { mode: 'menu', phase: 'menu', rival: 0, round: 1, score: [0, 0], x: 0, xv: 0, t: 0, cd: 0, phT: 0, period: 0.72, drive: [0, 0], members: [], locals: [], myTeam: 0,
    teamName: ['YOUR TEAM', 'RIVALS'], teamCol: ['#ec3013', '#38bdf8'], surge: null, lastBeat: -1, result: null, flash: null, help: false, roundWin: -1, cpuBraceT: 0, host: true, netStarted: false, demo: false, shake: 0, frenzy: [false, false], exc: [0.3, 0.3] };
  const mk = (t, i, kind, id = null, name = '') => ({ t, i, kind, id, name, combo: 0, best: 0, stam: 100, brace: false, braceT: -9, slipT: 0, lastBeat: -99, pc: 0, q: null, qT: 0, perfects: 0, goods: 0, misses: 0, blocks: 0, skill: 0.5 });
  function setup(mode, opts = {}) {
    S.demo = !!opts.demo; BUZZ_OFF = S.demo; au.quiet = S.demo; S.mode = mode; S.round = 1; S.score = [0, 0]; S.result = null; S.members = []; S.locals = []; S.myTeam = 0; S.surge = null;
    const cfg = [[], []];
    if (mode === 'solo') { const R = RIVALS[opts.rival || 0]; S.rival = opts.rival || 0; S.period = 0.78 - S.rival * 0.04; S.teamName = ['YOUR TEAM', R.name]; S.teamCol = ['#ec3013', R.col];
      for (let i = 0; i < PER_TEAM; i++) { const m = mk(0, i, i ? 'cpu' : 'me', null, i ? '' : 'YOU'); m.skill = 0.5; S.members.push(m); cfg[0].push({ me: !i, col: '#ec3013' }); }
      for (let i = 0; i < PER_TEAM; i++) { const m = mk(1, i, 'cpu'); m.skill = R.skill; S.members.push(m); cfg[1].push({ col: R.col, fur: i % 2 ? R.fur : FURS[(i + 3) % FURS.length] }); }
      S.locals = [S.members[0]]; }
    else if (mode === 'local') { S.period = 0.72; S.teamName = ['P1 · RED', 'P2 · BLUE']; S.teamCol = ['#ec3013', '#38bdf8'];
      for (let t = 0; t < 2; t++) for (let i = 0; i < PER_TEAM; i++) { const m = mk(t, i, i ? 'cpu' : t ? 'p2' : 'me', null, i ? '' : t ? 'P2' : 'P1'); m.skill = 0.5; S.members.push(m); cfg[t].push({ me: !t && !i, col: S.teamCol[t] }); }
      S.locals = [S.members[0], S.members[PER_TEAM]]; }
    else if (mode === 'online') { const pl = opts.players; S.period = 0.72; S.teamName = NET_TEAMS.map(x => x[0]); S.teamCol = NET_TEAMS.map(x => x[1]); const me = opts.me;
      const byTeam = [pl.filter(p => p.team === 0), pl.filter(p => p.team === 1)]; S.myTeam = (pl.find(p => p.id === me) || { team: 0 }).team;
      for (let t = 0; t < 2; t++) for (let i = 0; i < PER_TEAM; i++) { const p = byTeam[t][i], m = mk(t, i, p ? (p.id === me ? 'me' : 'remote') : 'cpu', p ? p.id : null, p ? p.name : ''); m.skill = 0.55; S.members.push(m); cfg[t].push({ me: p && p.id === me, col: S.teamCol[t] }); if (m.kind === 'me') S.locals = [m]; } }
    crowd.recolor(S.teamCol); banL.material = toon(S.teamCol[0]); banR.material = toon(S.teamCol[1]); tapeL.material = toon(S.teamCol[0]); tapeR.material = toon(S.teamCol[1]); rib.material = toon('#ec3013');
    buildFoxes(cfg); shotKey = ''; snapCam = true; resetRound(); push(true);
  }
  function resetRound() { S.x = 0; S.xv = 0; S.t = 0; S.drive = [0, 0]; S.lastBeat = -1; S.surge = null; S.cd = 3.2; S.phase = 'count'; S.roundWin = -1; S.lastCd = 4; S.members.forEach(m => { m.stam = 100; m.brace = m.kind === 'cpu' ? false : m.brace; m.slipT = 0; m.lastBeat = -99; m.combo = 0; m.q = null; }); placeFoxes(0); }
  const team = t => S.members.filter(m => m.t === t), humans = t => S.members.filter(m => m.t === t && m.kind !== 'cpu');
  const FRENZY = 8, kick = v => { S.shake = Math.max(S.shake, v); }, inFrenzy = t => humans(t).some(m => m.combo >= FRENZY);
  function syncBonus(t) { const H = humans(t); if (!H.length) return 0; return H.reduce((a, m) => a + Math.min(m.combo, 10), 0) / H.length * 0.028; }
  function addImpulse(t, imp) { S.drive[t] += imp * 4; }
  function bracedFrac(t) { const H = humans(t); if (H.length) return H.filter(m => m.brace).length / H.length; return team(t).some(m => m.brace) ? 1 : 0; }

  // ---------- a local human pulls ----------
  function judge(m) {
    if (S.phase !== 'play' || !m) return null;
    if (m.slipT > 0) { au.tone(140, 0.08, 0.04, 'square'); return null; }
    const b = Math.round(S.t / S.period), err = Math.abs(S.t - b * S.period);
    let q = err < 0.075 ? 'perfect' : err < 0.16 ? 'good' : 'miss'; if (b === m.lastBeat) q = 'miss'; if (b < 1) q = 'miss';
    m.lastBeat = b; let imp = Q[q].imp, tired = m.stam < 12;
    if (q === 'miss') { m.combo = 0; m.slipT = 0.35; m.misses++; } else { m.combo += q === 'perfect' ? 1 : 0; if (q === 'good') m.combo = Math.max(0, m.combo); m.best = Math.max(m.best, m.combo); q === 'perfect' ? m.perfects++ : m.goods++; }
    imp *= 1 + Math.min(m.combo, 10) * 0.06; if (m.combo >= FRENZY) imp *= 1.35; if (tired) imp *= 0.45; if (m.brace) imp *= 0.35;
    m.stam = Math.max(0, m.stam - (q === 'perfect' ? 5 : q === 'good' ? 7 : 4)); m.q = tired && q !== 'miss' ? 'tired' : q; m.qT = 0.9; m.pc++;
    const f = foxOf(m); if (f) { f.userData.tug.pullA = 1; if (q === 'perfect') puff(f.position.x, f.position.z, 3);
      const px = f.position.x, pz = f.position.z;
      if (q === 'perfect' && m.combo === FRENZY) { pop('FRENZY!', '#ff7a00', px, 2.35, pz, 1.35); flash('FRENZY!', '#ff7a00'); kick(0.12); au.noise(1.4, 0.07, 700, 0.5); au.noise(1.1, 0.035, 1700, 1); [392, 523, 659, 784].forEach((fq, i) => setTimeout(() => au.tone(fq, 0.12, 0.06, 'square'), i * 55)); buzz([30, 20, 60]); }
      else if (q === 'perfect') { pop(m.combo >= 2 ? 'PERFECT ×' + m.combo : 'PERFECT', m.combo >= FRENZY ? '#ff9a3a' : '#5ef08a', px, 2.2, pz, 1 + Math.min(m.combo, 10) * 0.03); kick(m.combo >= FRENZY ? 0.04 : 0.022); }
      else if (q === 'good') pop('GOOD', '#ffd23a', px, 2.15, pz, 0.85);
      else { pop(m.combo === 0 && m.best >= FRENZY ? 'SLIP! FRENZY OVER' : 'SLIP!', '#ff6a55', px, 2.15, pz, 0.9); kick(0.05); } }
    const pan = m.t ? 0.6 : -0.6; if (q === 'perfect') { au.tone(880, 0.1, 0.07, 'triangle', pan); au.tone(1320, 0.14, 0.05, 'triangle', pan); buzz(25); } else if (q === 'good') au.tone(660, 0.1, 0.06, 'triangle', pan); else { au.tone(150, 0.22, 0.07, 'sawtooth', pan, 0.6); buzz([10, 30, 10]); }
    return { q, imp };
  }
  function pull(li = 0) { const m = S.locals[li]; au.unlock(); const r = judge(m); if (!r) return; if (S.mode === 'online' && !S.host) netSend('in', { k: 'pull', imp: r.imp, q: r.q, c: m.combo, s: slotOf(m) }); else addImpulse(m.t, r.imp); push(true); }
  function brace(li = 0, on = true) { const m = S.locals[li]; if (!m) return; au.unlock(); if (m.brace === !!on) return; m.brace = !!on; if (on) { m.braceT = S.t; au.tone(110, 0.12, 0.06, 'square'); } if (S.mode === 'online' && !S.host) netSend('in', { k: 'br', on: !!on, s: slotOf(m) }); push(true); }
  const slotOf = m => S.members.indexOf(m), foxOf = m => foxes[m.t] && foxes[m.t][m.i];

  // ---------- simulation (host / offline) ----------
  function onBeat(b) {
    // beat sound + haptic for everyone (clients too); rope position earcon every 4 beats, panned to where the ribbon is
    au.tone(b % 4 === 0 ? 98 : 82, 0.12, 0.09, 'sine', 0, 0.5); au.tone(b % 4 === 0 ? 1760 : 1320, 0.03, 0.025, 'square'); if (touch) buzz(8);
    if (b % 4 === 2) au.tone(440 + S.x * 60, 0.18, 0.035, 'sine', clamp(S.x / WIN, -1, 1));
    { const BASS = [55, 55, 73.42, 65.41, 55, 55, 82.41, 73.42], fr = S.frenzy[0] || S.frenzy[1], ms = S.period * 1000;
      au.tone(BASS[b % 8] * (fr ? 2 : 1), S.period * 0.7, 0.05, 'triangle'); setTimeout(() => S.phase === 'play' && au.noise(0.045, 0.02, 8000, 1.3), ms / 2);
      if (fr) { setTimeout(() => S.phase === 'play' && au.noise(0.035, 0.014, 9000, 1.3), ms / 4); setTimeout(() => S.phase === 'play' && au.noise(0.035, 0.014, 9000, 1.3), ms * 3 / 4); }
      if (b % 4 === 0) { const ex = Math.max(S.exc[0], S.exc[1]); au.noise(S.period * 3.6, 0.008 + ex * 0.03, 650, 0.45); }
      [0, 1].forEach(t => { if (S.frenzy[t]) foxes[t].forEach(f => puff(f.position.x, f.position.z, 1, 0xff8a2a, 1.4, 0.8)); }); }
    if (!S.host) return;
    // CPU pulls, a touch late so they read as separate foxes
    for (const m of S.members) { if (m.kind !== 'cpu') continue; const sk = clamp(m.skill + (m.t === S.myTeam || S.mode !== 'solo' ? syncBonus(m.t) : 0), 0.1, 0.97);
      if (m.brace) continue; const r = Math.random(), q = r < sk * 0.72 ? 'perfect' : r < sk * 0.72 + 0.28 ? 'good' : 'miss';
      setTimeout(() => { if (S.phase !== 'play') return; addImpulse(m.t, Q[q].imp * 0.8); m.pc++; m.q = q; const f = foxOf(m); if (f) f.userData.tug.pullA = 1; }, rr(10, 90)); }
    // the rival surge (solo only): warn one beat early, land on the next
    if (S.mode === 'solo') { const R = RIVALS[S.rival];
      if (S.surge && S.surge.b === b) { const blk = humans(0).some(m => m.brace && S.t - m.braceT > -0.1);
        if (blk) { addImpulse(1, 0.6); const me = S.locals[0]; me.blocks++; me.combo += 2; me.stam = Math.min(100, me.stam + 15); flash('BLOCKED!', '#22c55e'); au.tone(523, 0.1, 0.07); au.tone(784, 0.18, 0.06); au.noise(0.9, 0.05, 800, 0.6, -0.4); buzz(40); kick(0.07); const f = foxOf(me); if (f) pop('BLOCKED!', '#5ef08a', f.position.x, 2.3, f.position.z, 1.2); }
        else { addImpulse(1, 3.2); flash('THEY HEAVED!', '#ec3013'); kick(0.16); au.noise(0.8, 0.05, 600, 0.6, 0.5); { const f = foxes[1][0]; if (f) pop('HEAVE!', '#ff6a55', f.position.x + 1, 2.4, f.position.z, 1.2); } au.tone(90, 0.35, 0.1, 'sawtooth', 0.6, 0.5); buzz([60, 30, 60]); team(1).forEach(m => { const f = foxOf(m); if (f) f.userData.tug.pullA = 1.2; }); }
        S.surge = null; }
      else if (!S.surge && b > 3 && Math.random() < R.surge) { S.surge = { b: b + 2 }; au.tone(220, 0.25, 0.07, 'square', 0.6); au.tone(196, 0.3, 0.06, 'square', 0.6); push(true); }
      // the rival digs in when the ribbon nears their tape... wait, near YOUR tape means they're winning; they brace when losing
      if (S.x < -WIN * 0.55 && Math.random() < R.brace * 0.5) { S.cpuBraceT = S.period * rr(1.5, 3); }
      team(1).forEach(m => m.brace = S.cpuBraceT > 0); }
  }
  let lastCdShown = 4;
  function step(dt) {
    if (S.phase === 'count') { S.cd -= dt; const c = Math.ceil(S.cd); if (c !== lastCdShown && c >= 0) { lastCdShown = c; if (c > 0) au.tone(c === 1 ? 660 : 440, 0.12, 0.07); push(true); } if (S.cd <= 0) { S.phase = 'play'; S.t = 0; lastCdShown = 4; au.tone(880, 0.25, 0.08, 'square'); au.tone(2900, 0.1, 0.04, 'sine'); setTimeout(() => au.tone(3150, 0.22, 0.04, 'sine'), 110); refWave = 1.2; flash('HEAVE!', '#ffd23a'); push(true); } return; }
    if (S.phase === 'round') { S.phT -= dt; if (S.phT <= 0) { if (S.score[0] >= 2 || S.score[1] >= 2) finish(); else { S.round++; resetRound(); push(true); } } return; }
    if (S.phase !== 'play') return;
    S.t += dt; const b = Math.floor(S.t / S.period); if (b !== S.lastBeat) { S.lastBeat = b; if (b >= 1) onBeat(b); }
    for (const m of S.members) { if (m.slipT > 0) m.slipT -= dt; if (m.qT > 0) m.qT -= dt; m.stam = Math.min(100, m.stam + dt * (m.brace ? 22 : 6)); }
    if (S.cpuBraceT > 0) S.cpuBraceT -= dt;
    if (S.demo) demoDrive();
    if (!S.host) return;
    let dx = (S.drive[1] - S.drive[0]) * K * dt; // + toward the right team (they pull it right)
    const bf = dx > 0 ? bracedFrac(0) : bracedFrac(1); dx *= 1 - 0.7 * bf;
    S.x += dx; S.xv = dx / Math.max(dt, 1e-3); S.drive[0] *= Math.exp(-dt / 0.25); S.drive[1] *= Math.exp(-dt / 0.25);
    if (S.x <= -WIN || S.x >= WIN || S.t >= ROUND_T) { const w = S.x < 0 ? 0 : 1; if (S.t >= ROUND_T && Math.abs(S.x) < 0.04) return; endRound(w); }
  }
  // ---------- DEMO (attract mode): the game plays your fox so a preview shows real play; any tap hands it over ----------
  let demoB = -1, demoErr = 0;
  function demoDrive() { const m = S.locals[0]; if (!m) return;
    const wantBrace = !!S.surge || (m.brace ? m.stam < 45 : m.stam < 14); if (wantBrace !== m.brace) brace(0, wantBrace);
    if (m.brace) return; const b = Math.round(S.t / S.period); if (b < 1 || b === demoB) return;
    if (S.t >= b * S.period + demoErr) { demoB = b; pull(0); const r = Math.random(); demoErr = r < 0.7 ? rr(-0.05, 0.05) : r < 0.93 ? rr(0.08, 0.13) : 0.2; } }
  function startDemo() { au.quiet = true; S.host = true; setup('solo', { rival: 1, demo: true }); demoB = -1; demoErr = 0; }
  function endRound(w) { S.score[w]++; S.roundWin = w; S.phase = 'round'; S.phT = 3.0; const mine = w === S.myTeam; roundFx(w);
    if (S.mode === 'local') { flash(S.teamName[w] + ' TAKES ROUND ' + S.round, S.teamCol[w]); au.tone(784, 0.2, 0.08); }
    else { flash(mine ? 'ROUND ' + S.round + ' · YOURS' : 'ROUND ' + S.round + ' · THEIRS', mine ? '#22c55e' : '#ec3013'); if (mine) { au.tone(659, 0.12, 0.07); au.tone(988, 0.3, 0.07); } else au.tone(196, 0.4, 0.07, 'sawtooth', 0, 0.7); }
    push(true); }
  function finish() {
    const w = S.score[0] >= 2 ? 0 : 1, me = S.locals[0], won = w === S.myTeam; S.phase = 'done';
    const rows = [], res = { won, w, title: '', kicker: '', rows, gold: 0, item: '', next: null, mode: S.mode };
    if (S.demo) { res.kicker = 'DEMO'; res.title = won ? 'YOUR TEAM WINS' : 'RIVALS WIN'; rows.push(['ROUNDS', S.score[0] + ' – ' + S.score[1]], ['PERFECT PULLS', String(me.perfects)], ['BEST COMBO', '×' + me.best]); S.result = res; S.phase = 'done'; setTimeout(() => { if (S.demo && S.phase === 'done') startDemo(); }, 3500); push(true); return; }
    if (S.mode === 'local') { res.kicker = 'TWO PLAYERS'; res.title = S.teamName[w] + ' WINS'; S.locals.forEach((m, k) => rows.push(['P' + (k + 1) + ' PERFECT · BEST COMBO', m.perfects + ' · ×' + m.best])); rows.push(['ROUNDS', S.score[0] + ' – ' + S.score[1]]); }
    else { res.kicker = S.mode === 'solo' ? 'VS ' + RIVALS[S.rival].name : 'ONLINE · ' + S.teamName[S.myTeam] + ' TEAM'; res.title = won ? 'YOU WIN' : 'YOU LOSE';
      rows.push(['ROUNDS', S.score[S.myTeam] + ' – ' + S.score[1 - S.myTeam]], ['PERFECT PULLS', String(me.perfects)], ['BEST COMBO', '×' + me.best]); if (S.mode === 'solo') rows.push(['SURGES BLOCKED', String(me.blocks)]);
      try { save.best('tugWar.bestCombo', me.best); save.setStat('tugWar.perfects', save.stat('tugWar.perfects') + me.perfects);
        if (won && S.mode === 'solo') { const R = RIVALS[S.rival], first = !save.flag('tugWar.beat.' + R.id); res.gold = first ? R.gold : Math.ceil(R.gold / 4); save.addGold(res.gold); save.addXp(10 * (S.rival + 1)); save.setFlag('tugWar.beat.' + R.id); save.setStat('tugWar.wins', save.stat('tugWar.wins') + 1);
          if (first && R.trophy) { save.give(R.trophy); res.item = 'THE GOLDEN ROPE'; } if (S.rival < RIVALS.length - 1) res.next = S.rival + 1; rows.push(['GOLD', '+' + res.gold + (first ? ' · FIRST WIN' : '')]); }
        if (won && S.mode === 'online') { res.gold = 10; save.addGold(10); save.setStat('tugWar.onlineWins', save.stat('tugWar.onlineWins') + 1); rows.push(['GOLD', '+10']); } } catch (e) {} }
    S.result = res; S.locals.forEach(m => m.brace = false);
    foxes.forEach((T, t) => T.forEach(f => f.userData.mood = t === w ? 'excited' : 'sad'));
    if (won || S.mode === 'local') { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => au.tone(f, 0.22, 0.07), i * 120)); } else au.tone(220, 0.6, 0.07, 'sawtooth', 0, 0.6);
    if (S.mode === 'online' && S.host) netSend('ev', { k: 'end', w, sc: S.score });
    if (S.mode === 'online') { S.net && (S.net.st = 'room', S.net.ready = false); netSend('ev', { k: 'playing', on: false }); }
    push(true);
  }
  function roundFx(w) { kick(0.22); confetti(w ? 3.5 : -3.5, [S.teamCol[w]]); au.noise(2.2, 0.08, 700, 0.45, w ? 0.5 : -0.5); au.noise(1.8, 0.04, 1800, 0.9, w ? 0.5 : -0.5); buzz([50, 40, 90]); }
  function flash(txt, col) { S.flash = { txt, col, t: 1.3 }; }
  function toMenu() { S.demo = false; BUZZ_OFF = false; au.quiet = false; if (S.mode === 'online') netLeave(); S.mode = 'menu'; S.phase = 'menu'; S.result = null; push(true); }
  function startSolo(i) { const unlocked = i === 0 || save.flag('tugWar.beat.' + RIVALS[i - 1].id); if (!unlocked) return false; au.unlock(); S.host = true; setup('solo', { rival: i }); return true; }
  function startLocal() { au.unlock(); S.host = true; setup('local'); }
  function again() { if (S.mode === 'online') { netReady(); return; } if (S.mode === 'solo') setup('solo', { rival: S.rival }); else setup('local'); }

  // ================= ONLINE (2–5 players; host = lowest id in the match) =================
  let N = null, nTimer = 0, snT = 0, lastSeen = {}, matchIds = null, netTok = 0;
  S.net = null;
  const netSend = (t, d, to) => { if (N) N.send(t, d, to); };
  function netOpen() { S.net = { st: 'menu', code: '', codeIn: '', peers: {}, ready: false, j: 0, status: '', msg: '', ping: null, copied: false }; push(true); }
  function members() { const n = S.net; if (!n || !N) return []; const all = [{ id: N.id, j: n.j, ready: n.ready, playing: n.st === 'play', me: true }, ...Object.entries(n.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, 5); }
  const inRoom = () => members().some(m => m.me);
  function hostId(match = true) { let m = members(); if (match && matchIds) m = m.filter(x => matchIds.includes(x.id)); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : N ? N.id : null; }
  function playerList(ids) { return ids.map((id, k) => ({ id, team: k % 2, name: (k % 2 ? 'BLUE ' : 'RED ') + (Math.floor(k / 2) + 1) })); }
  async function netJoin(code) { code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (!S.net) netOpen(); if (code.length < 4) { S.net.msg = 'Type the 4-letter room code from your friend.'; push(true); return; }
    netLeave(true); lastSeen = {}; Object.assign(S.net, { st: 'room', code, status: 'connecting', peers: {}, ready: false, j: Date.now(), msg: '', copied: false, ping: null }); push(true);
    const tok = ++netTok; const c = await connect({ code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => nMsg(t, d, id), onStatus: s => { if (S.net) { S.net.status = s; push(true); } } });
    if (!c) { S.net.status = 'offline'; S.net.msg = 'Online play could not start here.'; push(true); return; }
    if (tok !== netTok) { c.leave(); return; } N = c; hello(); clearInterval(nTimer); nTimer = setInterval(nTick, 1000);
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {} push(true); }
  function netLeave(keepCard) { netTok++; clearInterval(nTimer); if (N) { N.send('ev', { k: 'bye' }); N.leave(); } N = null; matchIds = null; lastSeen = {};
    try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {}
    if (!keepCard) S.net = null; if (S.mode === 'online') { S.mode = 'menu'; S.phase = 'menu'; } push(true); }
  function hello(to) { if (!N || !S.net) return; N.send('hi', { v: 1, j: S.net.j, ready: S.net.ready, playing: S.net.st === 'play' }, to); }
  function peerSet(id, p) { if (!S.net) return; S.net.peers[id] = { ...(S.net.peers[id] || {}), ...p }; push(true); }
  function gone(id) { if (!lastSeen[id]) return; delete lastSeen[id]; if (S.net) delete S.net.peers[id]; if (matchIds && matchIds.includes(id) && S.mode === 'online' && S.phase !== 'done') { const was = hostId(true); matchIds = matchIds.filter(x => x !== id);
      const m = S.members.find(x => x.id === id); if (m) m.kind = 'cpu', m.brace = false; if (id === was || !S.host) { S.host = hostId(true) === (N && N.id); if (S.host) flash('HOST LEFT · YOU RUN THE ROPE', '#ffd23a'); } } push(true); }
  function nTick() { if (!N) return; N.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(lastSeen)) if (now - lastSeen[id] > 25000) gone(id); }
  function nMsg(t, d, id) { if (!S.net || !N || !d) return; const now = performance.now(), known = !!lastSeen[id];
    if (t === 'hi') { lastSeen[id] = now; peerSet(id, { j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }); if (!known) setTimeout(() => hello(id), 0); setTimeout(maybeStart, 0); return; }
    if (!known) return; lastSeen[id] = now; const inMatch = !!(matchIds && matchIds.includes(id));
    if (t === 'pg') { if (d.t != null) N.send('pg', { e: d.t }, id); else if (d.e != null) { S.net.ping = Math.max(1, Math.round(now - d.e)); } return; }
    if (t === 'in' && inMatch && S.host && S.mode === 'online') { const m = S.members[d.s]; if (!m || m.id !== id) return; if (d.k === 'pull' && S.phase === 'play') { addImpulse(m.t, clamp(+d.imp || 0, 0, 2)); m.combo = +d.c || 0; m.q = d.q; m.pc++; const f = foxOf(m); if (f) f.userData.tug.pullA = 1; } else if (d.k === 'br') m.brace = !!d.on; return; }
    if (t === 'sn' && inMatch && !S.host && S.mode === 'online') { applySnap(d); return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { peerSet(id, { ready: !!d.on }); setTimeout(maybeStart, 0); }
    else if (d.k === 'start') nStart(d);
    else if (d.k === 'playing') peerSet(id, { playing: !!d.on });
    else if (d.k === 'bye') gone(id);
    else if (d.k === 'end' && inMatch && !S.host && S.mode === 'online' && S.phase !== 'done') { S.score = d.sc; finish(); } }
  function maybeStart() { const n = S.net; if (!n || !N || n.st !== 'room' || !inRoom() || hostId(false) !== N.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    const d = { k: 'start', ids: m.map(x => x.id), mid: Date.now() }; N.send('ev', d); nStart(d); }
  function nStart(d) { if (!S.net || !N || !Array.isArray(d.ids)) return; if (!d.ids.includes(N.id)) { S.net.msg = 'A match started without you. You join the next one.'; push(true); return; }
    matchIds = d.ids.slice(); S.host = hostId(true) === N.id; S.net.st = 'play'; S.net.ready = false; Object.values(S.net.peers).forEach(p => { p.ready = false; }); d.ids.forEach(id => { if (S.net.peers[id]) S.net.peers[id].playing = true; });
    au.unlock(); setup('online', { players: playerList(d.ids), me: N.id }); }
  function netReady() { const n = S.net; if (!n || !N) return; n.ready = !n.ready; N.send('ev', { k: 'ready', on: n.ready }); if (S.mode === 'online' && S.phase === 'done') { S.mode = 'menu'; S.phase = 'menu'; } push(true); setTimeout(maybeStart, 0); }
  function snap() { return { x: +S.x.toFixed(3), v: +S.xv.toFixed(3), t: +S.t.toFixed(3), ph: S.phase, cd: +S.cd.toFixed(2), rd: S.round, sc: S.score, rw: S.roundWin, m: S.members.map(m => [m.pc, m.brace ? 1 : 0, m.kind === 'cpu' ? 1 : 0, m.combo]) }; }
  function applySnap(d) { const lat = ((S.net && S.net.ping) || 80) / 2000; S.netX = d.x + d.v * lat; S.xv = d.v;
    if (d.ph === 'play') { const tt = d.t + lat; if (S.phase !== 'play' || Math.abs(tt - S.t) > 0.25) S.t = tt; else S.t += (tt - S.t) * 0.1; }
    if (d.ph !== S.phase) { if (d.ph === 'round' && S.phase === 'play') { S.score = d.sc; S.round = d.rd; endRoundClient(d.rw); } else if (d.ph === 'count' && S.phase !== 'count') { S.round = d.rd; S.score = d.sc; resetRound(); S.cd = d.cd; } else if (d.ph === 'play') { S.phase = 'play'; flash('HEAVE!', '#ffd23a'); } }
    if (S.phase === 'count') S.cd = d.cd;
    d.m.forEach(([pc, br, cpu, cb], k) => { const m = S.members[k]; if (!m || m.kind === 'me') return; m.combo = +cb || 0; if (pc !== m.pc) { m.pc = pc; const f = foxOf(m); if (f) f.userData.tug.pullA = 1; } m.brace = !!br; if (cpu && m.kind === 'remote') m.kind = 'cpu'; }); }
  function endRoundClient(w) { S.phase = 'round'; S.phT = 99; S.roundWin = w; roundFx(w); const mine = w === S.myTeam; flash(mine ? 'ROUND ' + S.round + ' · YOURS' : 'ROUND ' + S.round + ' · THEIRS', mine ? '#22c55e' : '#ec3013'); push(true); }

  // ================= HUD state for the page =================
  let pushT = 0, dirty = true; const els = { get: () => ({}) };
  function push(now) { dirty = true; if (now) pushT = 0; }
  function hud() {
    const n = S.net, m = n && N ? members() : [], full = !!n && n.st !== 'menu' && !!N && members().length === 5 && !m.some(x => x.me), pl = playerList(m.map(x => x.id));
    const L = S.locals.map((x, k) => ({ combo: x.combo, stam: Math.round(x.stam), brace: x.brace, q: x.qT > 0 && x.q ? (x.q === 'tired' ? { txt: 'TIRED', col: '#ff9a8a' } : Q[x.q]) : null, tired: x.stam < 12, team: x.t, col: S.teamCol[x.t], frenzy: x.combo >= FRENZY }));
    const rivals = RIVALS.map((R, i) => ({ i, name: R.name, line: R.line, col: R.col, beaten: save.flag('tugWar.beat.' + R.id), locked: !(i === 0 || save.flag('tugWar.beat.' + RIVALS[i - 1].id)), gold: R.gold }));
    return { mode: S.mode, phase: S.phase, round: S.round, score: S.score.slice(), myTeam: S.myTeam, teamName: S.teamName.slice(), teamCol: S.teamCol.slice(), x: S.x, win: WIN,
      time: Math.max(0, Math.ceil(ROUND_T - S.t)), count: S.phase === 'count' ? Math.max(1, Math.ceil(S.cd)) : 0, flash: S.flash && S.flash.t > 0 ? { txt: S.flash.txt, col: S.flash.col } : null,
      surge: !!S.surge && S.phase === 'play', demo: S.demo, locals: L, result: S.result, rivals, sound: au.on, place: place || TH.name, theme, host: S.host,
      net: n ? { st: n.st, code: n.code, codeIn: n.codeIn, status: n.status, msg: n.msg, ping: n.ping, copied: n.copied, ready: n.ready, full, connected: !!N,
        rows: m.map(x => { const p = pl.find(q => q.id === x.id) || {}; return { name: (p.name || '') + (x.me ? ' · YOU' : ''), col: NET_TEAMS[p.team || 0][1], host: x.id === hostId(false), ready: !!x.ready, playing: !!x.playing && !x.me }; }),
        count: m.length, readyCount: m.filter(x => x.ready).length, racing: n.st !== 'play' && m.some(x => !x.me && x.playing) } : null };
  }

  // ================= loop =================
  let refWave = 0; const clock = new THREE.Clock(); let raf = 0, alive = true, dispX = 0; var snapCam = true; let camFollow = 0, camTen = 0; const _tp = V3(), _tl = V3();
  function frame() { if (!alive) return; raf = requestAnimationFrame(frame); const dt = Math.min(clock.getDelta(), 0.05);
    const W = CW(), H = CH(); if (renderer.domElement.width !== Math.floor(W * renderer.getPixelRatio()) || renderer.domElement.height !== Math.floor(H * renderer.getPixelRatio())) { renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); shotKey = ''; snapCam = true; }
    if (S.mode !== 'menu') step(dt);
    if (S.mode === 'online' && !S.host && S.netX != null) S.x = damp(S.x, S.netX, 10, dt);
    if (S.mode === 'online' && S.host && N && matchIds) { snT -= dt; if (snT <= 0) { snT = 1 / 15; N.send('sn', snap()); } }
    if (S.flash) { S.flash.t -= dt; if (S.flash.t <= 0) { S.flash = null; push(true); } }
    // 3D
    const pv = (S.x - dispX) / Math.max(dt, 1e-3); dispX = damp(dispX, S.x, 14, dt); placeFoxes(dispX); rope.position.x = dispX; rope.position.y = ROPE_Y + Math.sin(clock.elapsedTime * 9) * 0.004 * Math.min(1, Math.abs(pv));
    ribbon.rotation.x = Math.sin(clock.elapsedTime * 3) * 0.15; ribbon.rotation.z = clamp(-pv * 0.6, -0.5, 0.5);
    const win = S.phase === 'done' && S.result ? S.result.w : S.phase === 'round' ? S.roundWin : -1, time = clock.elapsedTime;
    [0, 1].forEach(t => { const was = S.frenzy[t]; S.frenzy[t] = S.phase === 'play' && inFrenzy(t); if (was !== S.frenzy[t]) push(true); });
    // crowd excitement per side: the side that is gaining, in FRENZY or winning goes wild; the losing side slumps
    [0, 1].forEach(t => { const gain = clamp((t ? pv : -pv) * 2.5, 0, 1); S.exc[t] = win >= 0 ? (win === t ? 1 : 0.05) : S.mode === 'menu' ? 0.2 : S.phase === 'count' ? 0.45 : clamp(0.3 + gain * 0.5 + (S.frenzy[t] ? 0.45 : 0) + Math.abs(dispX) / WIN * 0.15, 0, 1); });
    crowd.update(time, dt, S.exc, camera.position, camera.userData.look || V3());
    { const fr = S.frenzy[0] || S.frenzy[1], bfx = S.phase === 'play' ? (S.t / S.period) % 1 : 0, e = fr ? 0.35 + 0.4 * (1 - bfx) : 0; ropeMat.emissive.setRGB(e, e * 0.42, 0); }
    foxes.forEach((T, t) => T.forEach((f, i) => { const m = S.members.find(x => x.t === t && x.i === i); const g = f.userData.tug; g.brace = damp(g.brace, m && m.brace ? 1 : 0, 12, dt);
      if (win >= 0) { f.userData.mood = t === win ? 'excited' : 'sad'; } else if (m && m.kind !== 'cpu' && m.qT > 0 && m.q === 'miss') f.userData.mood = 'surprised'; else f.userData.mood = 'determined';
      poseFox(f, dt, pv, null); if (Math.abs(pv) > 0.25 && Math.random() < dt * 4) puff(f.position.x, f.position.z, 1);
      // losers: the front fox goes face-first into the mud, the rest stumble; winners jump with their arms up
      const P = f.userData.P, lose = win >= 0 && t !== win, inward = t ? -1 : 1; g.fall = damp(g.fall || 0, lose ? 1 : 0, lose ? 4.5 : 8, dt);
      if (g.fall > 0.01) { const k = g.fall * (i === 0 ? 1 : 0.4 / i); P.body.rotation.x = P.body.rotation.x * (1 - k) + 1.3 * k; P.arms[0].rotation.x = P.arms[1].rotation.x = -1.5 * k + P.arms[0].rotation.x * (1 - k);
        f.position.x += inward * (i === 0 ? 0.45 : 0.15) * k; f.position.y = -0.18 * k * (i === 0 ? 1 : 0.2);
        if (i === 0 && g.fall > 0.6 && !g.splashed) { g.splashed = true; const inMud = Math.abs(f.position.x) < 1.2; puff(f.position.x + inward * 0.5, f.position.z, inMud ? 9 : 4, inMud ? 0x5b3a21 : 0xe8dcc8, inMud ? 2.2 : 1, 1.3); if (inMud) { pop('SPLAT!', '#c58a5a', f.position.x + inward * 0.4, 1.4, f.position.z, 1.1); au.noise(0.35, 0.09, 380, 0.8); au.tone(140, 0.25, 0.06, 'sine', 0, 0.5); kick(0.1); } } }
      else g.splashed = false;
      if (win >= 0 && t === win) { f.position.y = Math.abs(Math.sin(time * 7 + i * 1.3)) * 0.28; P.arms[0].rotation.x = -2.7 + Math.sin(time * 9 + i) * 0.25; P.arms[1].rotation.x = -2.7 - Math.sin(time * 9 + i) * 0.25; P.arms[0].rotation.z = -0.35; P.arms[1].rotation.z = 0.35; P.body.rotation.x = 0.05; } }));
    { const u = ref.userData, P = u.P; kit.animFox(ref, dt, 0); u.lookAt = V3(dispX, ROPE_Y, 0); if (refWave > 0) { refWave -= dt; P.arms[1].rotation.x = -2.9 + Math.sin(refWave * 14) * 0.3; P.arms[1].rotation.z = 0.3; } if (win >= 0) { const a = win ? 1 : 0; P.arms[a].rotation.x = -2.6; P.arms[a].rotation.z = a ? 0.5 : -0.5; } }
    puffs.forEach(p => { p.s.visible = p.life > 0; if (p.life <= 0) { p.s.material.opacity = 0; return; } p.life -= dt * 1.6; p.v.y -= dt * 2.2 * (p.v.y > 1 ? 1 : 0.2); p.s.position.addScaledVector(p.v, dt); if (p.s.position.y < 0.05) p.s.position.y = 0.05; p.s.scale.setScalar((0.25 + (1 - p.life) * 0.5) * (p.sz || 1)); p.s.material.opacity = Math.max(0, p.life) * 0.6; });
    pops.forEach(p => { if (p.life <= 0) { p.s.visible = false; return; } p.life -= dt * 1.15; p.s.position.y += dt * 0.55; const inn = smooth(0.78, 1, p.life), e = p.big * (1 + inn * 0.55) * (p.life < 0.15 ? p.life / 0.15 : 1); p.s.scale.set(1.5 * e, 0.375 * e, 1); p.s.material.opacity = Math.min(1, p.life * 3); });
    if (confT > 0) { confT -= dt; cf.forEach((c, i) => { c.v.y -= dt * 3.2; c.v.multiplyScalar(1 - dt * 1.2); c.p.addScaledVector(c.v, dt); if (c.p.y < 0.03) { c.p.y = 0.03; c.v.set(0, 0, 0); } c.r.addScaledVector(c.w, dt); _cm.position.copy(c.p); _cm.rotation.set(c.r.x, c.r.y, c.r.z); _cm.scale.setScalar(confT < 0.5 ? confT * 2 : 1); _cm.updateMatrix(); conf.setMatrixAt(i, _cm.matrix); }); conf.instanceMatrix.needsUpdate = true; if (confT <= 0) conf.visible = false; }
    const sh = wantShot(); camFollow = damp(camFollow, dispX * 0.5, 3, dt); _tp.copy(sh.pos); _tp.x += camFollow; _tl.copy(sh.look); _tl.x += camFollow;
    { const ten = S.phase === 'play' ? smooth(0.45, 1, Math.abs(dispX) / WIN) * 0.12 + ((S.frenzy[0] || S.frenzy[1]) ? 0.04 : 0) : 0; camTen = damp(camTen, ten, 2.5, dt); _tp.lerp(_tl, camTen); }
    if (snapCam || !camera.userData.look) { snapCam = false; camera.position.copy(_tp); camera.userData.look = _tl.clone(); } else { camera.position.lerp(_tp, 1 - Math.exp(-6 * dt)); camera.userData.look.lerp(_tl, 1 - Math.exp(-6 * dt)); } camera.lookAt(camera.userData.look);
    if (S.shake > 0.002) { const a = S.shake; camera.position.x += rr(-a, a); camera.position.y += rr(-a, a) * 0.7; camera.rotation.z += rr(-a, a) * 0.15; S.shake = damp(S.shake, 0, 9, dt); }
    renderer.render(scene, camera);
    // fast DOM bits (beat rings, rope meter, stamina) — the page hands us its elements
    const E = els.get() || {}; const bf = S.phase === 'play' ? ((S.t / S.period) % 1) : 0, ringS = 1 + (1 - bf) * (CH() > CW() ? 0.5 : 0.75), ringO = S.phase === 'play' ? 0.25 + bf * 0.75 : 0;
    [E.ring0, E.ring1].forEach(r => { if (r) { r.style.transform = 'scale(' + ringS.toFixed(3) + ')'; r.style.opacity = ringO.toFixed(2); const fz = S.locals[0] && S.locals[0].combo >= FRENZY; r.style.borderColor = bf > 0.86 || bf < 0.06 ? '#22c55e' : fz ? '#ff7a00' : '#ffd23a'; } });
    if (E.mark) E.mark.style.left = (50 + clamp(dispX / (WIN * 1.25), -1, 1) * 50).toFixed(2) + '%';
    [E.stam0, E.stam1].forEach((s, k) => { const m = S.locals[k]; if (s && m) { s.style.width = m.stam.toFixed(0) + '%'; s.style.background = m.stam < 12 ? '#ec3013' : m.brace ? '#22c55e' : '#ffd23a'; } });
    pushT -= dt; if (dirty || pushT <= 0) { if (pushT <= 0) { pushT = 0.12; dirty = false; onState(hud()); } }
  }
  slim(ref); setup('solo', { rival: 0 }); S.mode = 'menu'; S.phase = 'menu'; frame();

  return {
    hud, pull, brace, startSolo, startDemo, startLocal, again, toMenu, nextRival: () => { const r = S.result; if (r && r.next != null) startSolo(r.next); },
    setSafe(top, bottom) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3) { SAFE.top = top; SAFE.bottom = bottom; shotKey = ''; } },
    bindEls(fn) { els.get = fn; }, toggleSound() { au.on = !au.on; push(true); return au.on; },
    netOpen, netJoin, netCreate() { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; netJoin(k); }, netLeave: () => netLeave(false), netReady,
    netCodeIn(v) { if (S.net) { S.net.codeIn = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); S.net.msg = ''; push(true); } },
    netCopied(v) { if (S.net) { S.net.copied = v; push(true); } },
    destroy() { alive = false; cancelAnimationFrame(raf); netLeave(); renderer.dispose(); renderer.domElement.remove(); },
    _S: S, _scene: scene, _step: dt => step(dt), _foxes: () => foxes.map(T => T.map(f => [f.position.x.toFixed(2), f.position.z.toFixed(2), f.userData.tug.side])), _ropeY: () => ROPE_Y, _info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, cam: camera.position.toArray().map(v => +v.toFixed(2)), safe: { ...SAFE } }),
  };
}
