// 8 GATES — ARCADE · PINBALL: GATE RUSH [arcadePinball]. Minigame #34 (Pinball).
// A full pinball machine standing in a small arcade room. The room has no world-specific dressing, so any building on any
// world can open it (in a panel with ?embed=1, or as an interior).
// Table: 3 pop bumpers, F-O-X top lanes (lane change on the flippers, skill shot on the plunge), 3 drop targets, 2 standups,
// left + right orbit loop, the GATE HOLE (3 locks = 3-ball MULTIBALL, then JACKPOTS), 8 GATES to open (all 8 = 100,000 + 30 s double score).
// Players: SOLO · PASS & PLAY (2–4, take turns ball by ball) · ONLINE (2–4, everyone plays their own table at once, live scores).
// Accessibility: SOUND BALL (a soft tone follows the ball: left/right = pan, high/low = pitch), AUTO FLIP assist, SPOKEN CALLS, phone buzz.
// Physics is 2D on the playfield plane (substepped, 600 Hz) and drawn in 3D (toon + ink outlines, like the rest of 8 GATES).
// Extras: EXTRA BALL (lit after 4 gates), inlane → orbit/hole COMBO, top-5 high scores, dot-matrix score display, synth music + sound.
// FILES: pinball.js (game, physics, rules, online) · pinball-machine.js (table layout + 3D cabinet + world prop) ·
//        pinball-audio.js (sound + music) · pinball-embed.js (open the game from a world). See pinball-MERGE.md.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit } from '../../fox-kit.js';
import { castKit } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { canvasTex, crestTex, FONT } from '../../engine/textures.js';
import { tableLayout, buildMachine, makeGradient, glowTex, TW, TH, BR, FL, S, SLOPE } from './pinball-machine.js';
import { PinballSound, PinballMusic } from './pinball-audio.js';

export const PINBALL = { name: 'GATE RUSH', room: 'arcadePinball', key: 'arcadePinball', balls: 3, maxPlayers: 4 };
// slot colours for pass & play and online (5 players)
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];
export const SAVE_KEYS = { top: 'arcadePinball.top', best: 'arcadePinball.best', games: 'arcadePinball.games', wins: 'arcadePinball.onlineWins', prefs: 'arcadePinball.prefs', wizard: 'arcadePinball.wizard' };
export const RULES = [
  ['FLIPPERS', 'Left side of the screen = left flipper. Right side = right flipper. Use both thumbs. Keys: Z / ← and M / →.'],
  ['LAUNCH', 'When the ball sits in the lane on the right, HOLD the right side to pull the plunger and LET GO to launch. Keys: SPACE.'],
  ['SKILL SHOT', 'One top lane blinks when you launch. Drop the ball into it for 10,000.'],
  ['F-O-X LANES', 'Light all three top lanes: bonus ×2, ×3 … up to ×5, and a GATE opens. Flippers move the lit lanes.'],
  ['TARGETS', 'Knock down all 3 yellow drop targets (left) or both red standups (right): a GATE opens.'],
  ['ORBITS', 'Shoot the ball all the way round the top, in one side lane and out the other. Every 2nd orbit opens a GATE.'],
  ['BUMPERS', 'Every 25 bumper hits opens a GATE.'],
  ['GATE HOLE', 'The hole in the middle: 3 shots = 3-ball MULTIBALL. In multiball every hole shot is a 25,000 JACKPOT.'],
  ['EXTRA BALL', 'Open 4 gates in one game and the hole lights EXTRA BALL. Shoot it to play the same ball again.'],
  ['COMBO', 'Roll through an inlane (beside a flipper), then make an orbit or the hole within 3 seconds: COMBO +10,000.'],
  ['8 GATES', 'Open all 8 GATES: 100,000 and DOUBLE SCORE for 30 seconds.'],
  ['NUDGE', 'NUDGE shakes the table (key N). Three hard shakes in a row = TILT and you lose the ball.'],
  ['BALL SAVE', 'If the ball drains in the first seconds, you get it back.']];

// ---------------- small helpers (the kit's village-game.js versions are not in the minigame kit, so they live here) ----------------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => v < a ? a : v > b ? b : v, pick = a => a[Math.floor(Math.random() * a.length)];
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const fmt = n => Math.round(n).toLocaleString('en-US');

// ---------------- table constants ----------------
const G = 19, SUB = 1 / 600, VMAX = 38;

// ---------------- 2D physics ----------------
function flipTip(f) { return [f.px + f.side * FL.len * Math.cos(f.a), f.py + FL.len * Math.sin(f.a)]; }
function colSeg(b, s, hit) {
  const dx = s.bx - s.ax, dy = s.by - s.ay, L2 = dx * dx + dy * dy; let t = ((b.x - s.ax) * dx + (b.y - s.ay) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = s.ax + dx * t, cy = s.ay + dy * t; let nx = b.x - cx, ny = b.y - cy; const d2 = nx * nx + ny * ny, R = BR + s.r; if (d2 >= R * R) return;
  const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d;
  if (s.one && (nx * s.nx + ny * s.ny < 0.2 || b.vx * s.nx + b.vy * s.ny > 0)) return;
  b.x += nx * (R - d); b.y += ny * (R - d);
  const vn = b.vx * nx + b.vy * ny; if (vn >= 0) return;
  b.vx -= (1 + s.e) * vn * nx; b.vy -= (1 + s.e) * vn * ny;
  const tx = -ny, ty = nx, vt = b.vx * tx + b.vy * ty; b.vx -= vt * tx * 0.012; b.vy -= vt * ty * 0.012;
  if (s.kick && -vn > 1.4) { const out = b.vx * nx + b.vy * ny; if (out < 11) { b.vx += (11 - out) * nx; b.vy += (11 - out) * ny; } }
  hit && hit(s, b, -vn);
}
function colBump(b, c, hit) {
  let nx = b.x - c.x, ny = b.y - c.y; const d2 = nx * nx + ny * ny, R = BR + c.r; if (d2 >= R * R) return;
  const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d; b.x += nx * (R - d); b.y += ny * (R - d);
  const vn = b.vx * nx + b.vy * ny; const out = Math.max(12.5, Math.abs(vn) * 0.8); b.vx += (out - vn) * nx; b.vy += (out - vn) * ny; hit && hit(c, b, Math.abs(vn));
}
function colFlip(b, f, hit) {
  const [tx, ty] = flipTip(f), dx = tx - f.px, dy = ty - f.py, L2 = dx * dx + dy * dy; let t = ((b.x - f.px) * dx + (b.y - f.py) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  const cx = f.px + dx * t, cy = f.py + dy * t, rad = FL.r0 + (FL.r1 - FL.r0) * t; let nx = b.x - cx, ny = b.y - cy; const d2 = nx * nx + ny * ny, R = BR + rad; if (d2 >= R * R) return;
  const d = Math.sqrt(d2) || 1e-6; nx /= d; ny /= d; b.x += nx * (R - d); b.y += ny * (R - d);
  const om = f.side * f.w, vfx = -om * (cy - f.py), vfy = om * (cx - f.px), rvn = (b.vx - vfx) * nx + (b.vy - vfy) * ny;
  if (rvn < 0) { b.vx -= (1 + FL.e) * rvn * nx; b.vy -= (1 + FL.e) * rvn * ny; hit && hit(f, b, -rvn); }
}
function colBalls(a, b) {
  let nx = b.x - a.x, ny = b.y - a.y; const d2 = nx * nx + ny * ny, R = 2 * BR; if (d2 >= R * R || d2 === 0) return;
  const d = Math.sqrt(d2); nx /= d; ny /= d; const pen = (R - d) / 2; a.x -= nx * pen; a.y -= ny * pen; b.x += nx * pen; b.y += ny * pen;
  const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rv < 0) { const j = -rv * 0.95; a.vx -= j * nx; a.vy -= j * ny; b.vx += j * nx; b.vy += j * ny; return j; } return 0;
}

// ---------------- ONLINE: engine/duel-net.js when the repo has it; a same-device BroadcastChannel stand-in otherwise (test with two tabs) ----------------
function localDuel({ game, code, onMsg, onStatus }) {
  const id = 'L' + Math.random().toString(36).slice(2, 9); let bc = null;
  try { bc = new BroadcastChannel('8g-' + game + '-' + code); } catch (e) { setTimeout(() => onStatus && onStatus('offline'), 0); return { id, send() {}, leave() {} }; }
  bc.onmessage = e => { const m = e.data; if (!m || m.from === id || (m.to && m.to !== id)) return; onMsg && onMsg(m.t, m.d, m.from); };
  setTimeout(() => onStatus && onStatus('local'), 0);
  return { id, send(t, d, to) { try { bc.postMessage({ t, d, to: to || null, from: id }); } catch (e) {} }, leave() { try { bc.close(); } catch (e) {} } };
}
async function connectNet(opts) {
  try { const mod = await import(new URL('engine/duel-net.js', document.baseURI).href); if (mod && mod.connectDuel) return await mod.connectDuel(opts); } catch (e) {}
  return localDuel(opts);
}

// =====================================================================================================================
// WORLD MODE (s100, Ben "pinball in world"): createPinball({ world: { renderer, camera, el, parent, yaw } }) plays on a machine that stands in a 3D map:
// no own renderer / room / lights / cast; the table is built into world.parent (the map's machine group), the game camera is a private camera
// the map copies (game.camera) after its own camera, pointer halves come from world.el, and nothing renders here (the map renders).
export async function createPinball({ container, onState, world: W = null }) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => (W ? innerWidth : container.clientWidth) || 1, CH = () => (W ? innerHeight : container.clientHeight) || 1;
  const renderer = W ? W.renderer : new THREE.WebGLRenderer({ antialias: !touch, powerPreference: 'high-performance' });
  if (!W) { renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.75 : 2)); renderer.setSize(CW(), CH()); renderer.shadowMap.enabled = !touch;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement); }
  let scene = W ? new THREE.Group() : new THREE.Scene(); if (!W) { scene.background = new THREE.Color('#14112a'); scene.fog = new THREE.Fog('#14112a', 10, 24); }   // world: the room, its lights and the cast go into a throw-away group
  const camera = new THREE.PerspectiveCamera(W ? (W.camera.fov || 55) : 46, CW() / CH(), 0.02, 60);
  const grad = makeGradient(THREE), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  scene.add(new THREE.HemisphereLight(0xf2eaff, 0x3a2a4a, 1.25));
  const sun = new THREE.DirectionalLight(0xfff2e0, 1.5); sun.position.set(1.5, 5, 2.5); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); sun.position.set(2, 7, 3.5); Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 0.5, far: 14 }); scene.add(sun);
  const snd = new PinballSound(), music = new PinballMusic(snd);

  // ---------------- room: a small arcade (no world dressing, so it fits any building) ----------------
  const carpet = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = '#120f26'; g.fillRect(0, 0, w, h); let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const cols = ['#ff4fd8', '#38bdf8', '#ffd23a', '#22c55e', '#a78bfa']; g.lineCap = 'round'; g.globalAlpha = 0.42;
    for (let i = 0; i < 46; i++) { const x = rnd() * w, y = rnd() * h, c = cols[i % cols.length], k = i % 4; g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 5; g.save(); g.translate(x, y); g.rotate(rnd() * 6.3);
      if (k === 0) { g.beginPath(); g.moveTo(-18, 0); for (let j = 1; j <= 4; j++) g.quadraticCurveTo(-18 + j * 9 - 4.5, j % 2 ? -10 : 10, -18 + j * 9, 0); g.stroke(); }
      else if (k === 1) { g.beginPath(); g.arc(0, 0, 9, 0, 7); g.stroke(); } else if (k === 2) { g.beginPath(); g.moveTo(0, -11); g.lineTo(10, 8); g.lineTo(-10, 8); g.closePath(); g.stroke(); } else { g.fillRect(-3, -3, 6, 6); }
      g.restore(); } }, [5, 5]);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshToonMaterial({ map: carpet, gradientMap: grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = !touch; scene.add(floor);
  const wallTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#2c2450'; g.fillRect(0, 0, w, h); g.fillStyle = '#382e66'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 16, h); g.fillStyle = '#ec3013'; g.fillRect(0, h - 10, w, 4); g.fillStyle = '#ffd23a'; g.fillRect(0, h - 4, w, 2); }, [4, 1]);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 5), new THREE.MeshToonMaterial({ map: wallTex, gradientMap: grad })); wall.position.set(0, 2.5, -3.6); scene.add(wall);
  for (const s of [-1, 1]) { const sw = new THREE.Mesh(new THREE.PlaneGeometry(10, 5), toon('#241d44')); sw.position.set(s * 4.6, 2.5, 1); sw.rotation.y = -s * Math.PI / 2; scene.add(sw); }
  const glow = glowTex(THREE);
  const neonSign = (txt, col, x, y, sc) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.5), new THREE.MeshBasicMaterial({ transparent: true, map: canvasTex(512, 128, (g, w, h) => { g.font = '900 86px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 24; g.fillStyle = '#ffffff'; g.fillText(txt, w / 2, h / 2 + 4); g.shadowBlur = 10; g.fillStyle = col; g.globalAlpha = 0.6; g.fillText(txt, w / 2, h / 2 + 4); }) })); m.scale.setScalar(sc); m.position.set(x, y, -3.58); scene.add(m);
    const hl = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); hl.scale.set(3.4 * sc, 1.4 * sc, 1); hl.position.set(x, y, -3.5); scene.add(hl); return { m, hl }; };
  const neonA = neonSign('ARCADE', '#ff4fd8', -1.6, 3.2, 1.5), neonB = neonSign('HIGH SCORE', '#38bdf8', 2.1, 3.35, 0.8);
  const neonL = new THREE.PointLight(0xff4fd8, 0.9, 5); neonL.position.set(-1.6, 3, -3.0); scene.add(neonL);
  // two background cabinets (lit screens flicker through colours)
  const bgScreens = [];
  for (const [x, col] of [[-1.9, '#38bdf8'], [1.9, '#22c55e']]) { const cb = new THREE.Group(); cb.position.set(x * 1.5, 0, -3.0); cb.scale.setScalar(1.45); scene.add(cb); M(new THREE.BoxGeometry(0.7, 1.75, 0.6), toon('#1b1733'), 0, 0.875, 0, cb, 0.015); M(new THREE.BoxGeometry(0.72, 0.18, 0.62), toon(col), 0, 1.84, 0, cb, 0.015);
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.42), new THREE.MeshBasicMaterial({ color: col })); scr.position.set(0, 1.35, 0.305); cb.add(scr); bgScreens.push({ m: scr, c: new THREE.Color(col) }); M(new THREE.BoxGeometry(0.7, 0.08, 0.3), toon('#2a2448'), 0, 0.98, 0.42, cb, 0.012);
    const sg = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: col, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending })); sg.scale.set(1.2, 1.0, 1); sg.position.set(0, 1.35, 0.35); cb.add(sg); }
  // ceiling light cones (soft additive pools)
  for (const x of [-2.4, 2.4]) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.1, 4.4, 20, 1, true), new THREE.MeshBasicMaterial({ color: '#ffe9c4', transparent: true, opacity: 0.045, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); c.position.set(x, 2.6, -0.8); scene.add(c); }

  const ROOM = scene; if (W) { scene = new THREE.Group(); scene.name = 'pinballWorld'; W.parent.add(scene); }
  // ---------------- the machine (pinball-machine.js) ----------------
  const MC = buildMachine({ THREE, toon, M, addOutline, grad, touch }, { layout: tableLayout(), scale: 1.45 });
  const { machine, table, backbox, TX, TZ, flipMeshes, bumpMeshes, dropMeshes, standMeshes, slingMats, plunger, spring, dmd, holeGlow } = MC, LAY = MC.LAY;
  scene.add(machine);
  // chrome ball: a tiny generated room for reflections (one-time PMREM)
  let ballMat;
  try {
    const envScene = new THREE.Scene(), envTex = canvasTex(256, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff6e8'); gr.addColorStop(0.35, '#5a4a9a'); gr.addColorStop(0.55, '#1a1430'); gr.addColorStop(1, '#2a1f4a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = '#ffffff'; g.fillRect(40, 8, 30, 10); g.fillRect(170, 8, 30, 10); g.fillStyle = '#ff4fd8'; g.fillRect(90, 52, 60, 8); g.fillStyle = '#38bdf8'; g.fillRect(0, 60, 30, 14); g.fillStyle = '#ffd23a'; g.fillRect(210, 64, 46, 6); });
    envTex.mapping = THREE.EquirectangularReflectionMapping; const sky = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 12), new THREE.MeshBasicMaterial({ map: envTex, side: THREE.BackSide })); envScene.add(sky);
    const pm = new THREE.PMREMGenerator(renderer), rt = pm.fromScene(envScene, 0.02); pm.dispose();
    ballMat = new THREE.MeshStandardMaterial({ color: '#e8edf3', metalness: 1, roughness: 0.16, envMap: rt.texture, envMapIntensity: 1.25 });
  } catch (e) { ballMat = new THREE.MeshPhongMaterial({ color: '#c9d2dc', specular: '#ffffff', shininess: 140 }); }
  const ballGeo = new THREE.SphereGeometry(BR, 24, 16);
  const shTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 2, 32, 32, 30); r.addColorStop(0, 'rgba(0,0,0,0.6)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const ballPool = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(ballGeo, ballMat); m.castShadow = !touch; addOutline(m, 0.03, BR); m.visible = false; table.add(m);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.visible = false; table.add(sh);
    const trail = [0, 1, 2, 3, 4].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, color: '#9fd8ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; table.add(s); return s; });
    return { m, sh, trail, hist: [] }; });
  // s100 (Ben): the LANE PLUNGER you can see: rod + spring + rubber tip under the ball (table units: the ball rests at y 0.9 → z = TZ(0.9))
  const laneP = new THREE.Group(); table.add(laneP); const TIP0 = TZ(0.9) + BR + 0.04;
  { const ch = toon('#dfe6ee'); M(new THREE.CylinderGeometry(0.11, 0.11, 2.2, 12), ch, 0, 0, 1.1, laneP, 0.02).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.3, 0.3, 0.26, 16), toon('#201e1d'), 0, 0, 0.13, laneP, 0.02).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) M(new THREE.TorusGeometry(0.2, 0.04, 6, 14), ch, 0, 0, 0.45 + i * 0.22, laneP, 0); }
  laneP.position.set(TX(9.5), BR, TIP0); let lanePz = 0, laneKick = 0, wasPull = false;
  // s100 (Ben): WORLD MODE score sign just above the rounded top of the playfield (the backbox DMD is out of the game camera): score + BALL n / 3
  let topSign = null, topKey = '';
  if (W) { const tex = canvasTex(1024, 200, () => {}), mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }), pl = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 1.875), mat);
    pl.rotation.x = -Math.PI / 2 + 0.55; pl.position.set(TX(5), 1.25, TZ(21.35)); pl.renderOrder = 4; table.add(pl); topSign = { tex, pl }; }
  function drawTop() { if (!topSign) return; const q = P(), key = q ? q.score + '|' + q.ball + '|' + st.phase + '|' + st.cur : st.phase; if (key === topKey) return; topKey = key; const g = topSign.tex.image.getContext('2d'), w = 1024, h = 200;
    g.clearRect(0, 0, w, h); g.fillStyle = 'rgba(18,8,4,0.92)'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ff8a1a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.textBaseline = 'middle';
    g.fillStyle = '#ff8a1a'; g.font = '900 96px Archivo, sans-serif'; g.textAlign = 'left'; g.fillText(q ? fmt(q.score) : 'GATE RUSH', 34, h / 2 + 4);
    g.textAlign = 'right'; g.font = '900 34px Archivo, sans-serif'; g.fillStyle = '#ffd23a'; g.fillText(q ? 'BALL ' + Math.min(PINBALL.balls, q.ball) + ' / ' + PINBALL.balls : '', w - 34, h / 2 - 20); g.font = '800 26px Archivo, sans-serif'; g.fillStyle = '#ffb877'; g.fillText(q && st.players.length > 1 ? q.name : (st.phase === 'over' ? 'GAME OVER' : 'PLAYER 1'), w - 34, h / 2 + 26); g.textAlign = 'left'; topSign.tex.needsUpdate = true; }
  // sparks
  const sparkTex = canvasTex(64, 64, g => { const r = g.createRadialGradient(32, 32, 1, 32, 32, 30); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.3, 'rgba(255,255,255,0.75)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const sparks = []; for (let i = 0; i < 32; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: sparkTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); s.visible = false; table.add(s); sparks.push({ s, life: 0, vx: 0, vy: 0, vz: 0 }); }
  let spI = 0; const spark = (x, y, n = 5, col = 0xffffff) => { for (let i = 0; i < n; i++) { const p = sparks[spI = (spI + 1) % sparks.length]; p.s.position.set(TX(x), 0.4, TZ(y)); p.s.material.color.setHex(col); p.s.visible = true; p.life = 1; const a = rr(0, 6.28), v = rr(2, 5.5); p.vx = Math.cos(a) * v; p.vz = Math.sin(a) * v; p.vy = rr(2, 4.5); } };
  // ---------------- the cast in the room: the player at the machine, Hope + Noble watching ----------------
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }), foxes = [];
  try {
    if (W) throw 0;   // world: the map's own player stands at the machine
    const ben = cast.make('player'); ben.position.set(0.05, 0, 1.95); ben.rotation.y = Math.PI; ben.userData.mood = 'excited'; scene.add(ben); foxes.push(ben);
    const hope = cast.make('hope'); hope.position.set(-1.75, 0, 0.7); hope.rotation.y = Math.PI * 0.62; hope.userData.mood = 'happy'; scene.add(hope); foxes.push(hope);
    const noble = cast.make('noble'); noble.position.set(1.8, 0, 0.75); noble.rotation.y = -Math.PI * 0.62; noble.userData.mood = 'happy'; scene.add(noble); foxes.push(noble);
  } catch (e) { if (e !== 0) console.warn('pinball: cast failed', e); }

  // =====================================================================================================================
  // GAME STATE
  const prefs = Object.assign({ soundBall: false, autoFlip: false, speech: false, haptics: true, sound: true, music: true }, (() => { try { return save.stat(SAVE_KEYS.prefs, null) || {}; } catch (e) { return {}; } })());
  const newPlayer = (name, col, me = true) => ({ name, col, me, score: 0, ball: 1, done: false, gates: Array(8).fill(false), locks: 0, fox: [0, 0, 0], stand: [0, 0], bumps: 0, orbits: 0, mult: 1, wizards: 0, opened: 0, extra: 0, extraLit: false, extraGiven: false, bt: { gates: 0, targ: 0, bumps: 0 } });
  const S0 = { phase: 'menu', mode: 'solo', players: [], cur: 0, balls: [], paused: false, msg: null, msgQ: [], saveT: 0, saveArm: false, tilt: 0, tilted: false, multi: false, wizard: 0, pow: 0, pulling: false, skill: -1, skillLive: 0, orbit: null, bonus: null, results: null, demo: false, timers: [], count: 0, gold: 0, newBest: false, combo: 0 };
  let G0 = { ...S0 };
  const st = G0; // live state (mutated)
  const P = () => st.players[st.cur];
  let stopped = false, lastEmit = 0, dirty = true, lampT = 0, lastT = performance.now(), tNow = 0, stuckT = 0;
  const timers = []; const later = (s, fn) => timers.push({ t: tNow + s, fn });
  const buzz = ms => { if (prefs.haptics && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };
  const sfx = (k, x, amt) => { if (prefs.sound) snd.play(k, x == null ? 0 : clamp((x - 4.5) / 5, -1, 1), amt); };
  snd.sfxOn = prefs.sound; snd.musicOn = prefs.music;
  const say = t => { if (!prefs.speech || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 1.1; music.setDuck(0.4); u.onend = u.onerror = () => music.setDuck(st.paused ? 0.3 : 1); speechSynthesis.speak(u); } catch (e) {} };
  function flash(t, sub = '', col = '#ffd23a', dur = 1.6, speak = true) { st.msgQ.push({ t, sub, col, dur }); if (speak) say(t.replace(/×/g, 'times ')); dirty = true; }
  const mul = () => st.wizard > 0 ? 2 : 1;
  function score(n) { if (st.demo) return; const p = P(); if (!p) return; p.score += n * mul(); dirty = true; }

  // ---------------- rules ----------------
  function openGate(why) {
    const p = P(); const i = p.gates.indexOf(false); if (i < 0) return; p.gates[i] = true; p.bt.gates++; p.opened++; score(2000 * (i + 1)); sfx('gate'); buzz(30);
    if (p.opened >= 4 && !p.extraGiven && !p.extraLit && !st.demo) { p.extraLit = true; later(1.7, () => { flash('EXTRA BALL IS LIT', 'SHOOT THE GATE HOLE', '#ff8a1a', 1.6); }); }
    if (p.gates.every(Boolean)) { p.wizards++; score(100000); st.wizard = 30; p.gates.fill(false); sfx('big'); buzz([40, 40, 80]); shake(0.6); flash('ALL 8 GATES OPEN', '+100,000 · DOUBLE SCORE 30 s', '#ffd23a', 2.6); if (!st.demo && p.me) try { save.setFlag(SAVE_KEYS.wizard, true); } catch (e) {} }
    else flash('GATE ' + (i + 1) + ' OPEN', why, '#ffd23a');
  }
  function onRoll(i, b) {
    const p = P(); sfx('roll', b.x);
    if (st.skillLive > 0 && st.skill >= 0) { const hitSkill = i === st.skill; st.skillLive = 0; st.skill = -1; if (hitSkill) { score(10000); flash('SKILL SHOT', '+10,000', '#7dd3fc'); sfx('skill'); shake(0.25); } }
    if (!p.fox[i]) { p.fox[i] = 1; score(500); } else score(100);
    if (p.fox.every(Boolean)) { p.mult = Math.min(5, p.mult + 1); later(0.6, () => { p.fox = [0, 0, 0]; dirty = true; }); flash('F-O-X', 'BONUS ×' + p.mult, '#7dd3fc', 1.2); openGate('F-O-X LANES'); }
    dirty = true;
  }
  function onHit(o, b, v) {
    const p = P(); if (!p) return;
    if (o.k === 'bump') { const bm = bumpMeshes[o.id]; bm.t = 1; spark(o.x, o.y, 6, 0xffd23a); sfx('bump', o.x, o.id); buzz(15); score(100); p.bumps++; p.bt.bumps++; if (p.bumps % 25 === 0) openGate('25 BUMPERS'); st.skillLive = 0; return; }
    if (o.k === 'sling') { if (v > 1.4) { slingMats[o.id].emissiveIntensity = 1; sfx('sling', b.x); buzz(10); score(10); spark(b.x, b.y, 3, 0xff8a5a); } return; }
    if (o.k === 'drop') { if (!o.on) return; o.on = false; sfx('drop', b.x); buzz(20); score(750); p.bt.targ++; spark(o.ax + 0.3, (o.ay + o.by) / 2, 4, 0xffd23a);
      if (LAY.drops.every(s => !s.on)) { score(5000); openGate('DROP TARGETS'); later(1.6, () => { for (const s of LAY.drops) s.on = true; dirty = true; }); } return; }
    if (o.k === 'stand') { if (v < 1) return; standMeshes[o.id].t = 1; sfx('stand', b.x); buzz(15); score(1000); p.bt.targ++; p.stand[o.id] = 1; if (p.stand.every(Boolean)) { later(0.8, () => { p.stand = [0, 0]; dirty = true; }); openGate('STANDUPS'); } dirty = true; return; }
    if (o.side) { return; }
    if (v > 3) sfx('wall', b.x, v);
  }
  function onSensor(id, b) {
    if (id.startsWith('fox')) return onRoll(+id[3], b);
    if (id === 'exit' && st.saveArm && b.x < 8.95) { st.saveArm = false; st.saveT = (prefs.autoFlip ? 14 : 9); }
    if ((id === 'orbL' || id === 'orbR') && b.vy > 0) { st.orbit = { from: id, t: 3, top: false }; return; }
    if (id === 'top' && st.orbit) { st.orbit.top = true; return; }
    if ((id === 'orbL' || id === 'orbR') && b.vy < 0 && st.orbit && st.orbit.top && st.orbit.from !== id) { const p = P(); p.orbits++; score(5000 + 1000 * Math.min(10, p.orbits)); sfx('roll', b.x); st.orbit = null; comboCheck();
      if (p.orbits % 2 === 0) openGate('ORBIT'); else flash('ORBIT', 'ONE MORE OPENS A GATE', '#a78bfa', 1.2); }
    if ((id === 'inL' || id === 'inR') && b.vy < 0) { st.combo = 3; st.comboSide = id; sfx('roll', b.x); score(250); }
    if (id === 'outL' || id === 'outR') { if (b.vy < 0) sfx('warn'); }
  }
  function comboCheck() { if (st.combo > 0) { st.combo = 0; score(10000); flash('COMBO', '+10,000', '#7dd3fc', 1.1); sfx('skill'); } }
  function onHole(b) {
    const p = P(); sfx('hole'); buzz(30); b.held = 1.3; b.vx = b.vy = 0; b.x = LAY.hole.x; b.y = LAY.hole.y; st.skillLive = 0; comboCheck(); spark(b.x, b.y, 8, 0xffd23a);
    if (p.extraLit) { p.extraLit = false; p.extraGiven = true; p.extra++; flash('EXTRA BALL', 'SHOOT AGAIN AFTER THIS BALL', '#ff8a1a', 1.8); later(0.25, () => sfx('knock')); shake(0.4); }
    if (st.multi) { score(25000); flash('JACKPOT', '+25,000', '#22c55e', 1.6); sfx('jackpot'); shake(0.5); return; }
    p.locks++; score(2500);
    if (p.locks >= 3) { p.locks = 0; st.multi = true; flash('MULTIBALL', '3 BALLS · HOLE = JACKPOT', '#22c55e', 2.2); sfx('big'); shake(0.5); buzz([30, 30, 60]); st.saveT = Math.max(st.saveT, 12);
      later(0.9, () => serve(true)); later(2.4, () => serve(true)); }
    else { flash('LOCK ' + p.locks, (3 - p.locks) + ' MORE FOR MULTIBALL', '#22c55e', 1.3); later(0.15, () => sfx('lock')); }
    dirty = true;
  }

  // ---------------- balls ----------------
  function serve(auto = false) {
    if (st.balls.length >= 4) return; const b = { x: 9.5, y: 0.9, vx: 0, vy: 0, held: 0, noCap: 0, zones: new Set(), still: 0 };
    st.balls.push(b); if (auto) later(0.5, () => { if (st.balls.includes(b) && b.x > 9 && b.y < 1.6) launch(b, rr(0.68, 0.95)); });
    dirty = true; return b;
  }
  function launch(b, pow) { b.vy = 18.5 + 13 * pow; b.vx = 0; sfx('launch', null, pow); buzz(20); st.skillLive = st.skill >= 0 ? 4 : 0; }
  function inLane(b) { return b.x > 9.02 && b.y < 1.6 && b.held <= 0; }
  function laneBall() { return st.balls.find(b => inLane(b) && Math.abs(b.vy) < 1.5); }
  function drained(b) {
    st.balls.splice(st.balls.indexOf(b), 1); dirty = true;
    if (st.demo) { if (!st.balls.length) serve(true); return; }
    if (st.saveT > 0 && !st.tilted) { flash('BALL SAVED', '', '#7dd3fc', 1.2); sfx('save'); serve(true); return; }
    if (st.balls.length === 1 && st.multi) { st.multi = false; flash('MULTIBALL OVER', '', '#cfcac4', 1.2, false); }
    if (!st.balls.length) endBall();
  }
  function startBall() {
    const p = P(); st.balls = []; st.multi = false; st.saveT = 0; st.saveArm = true; st.tilt = 0; st.tilted = false; st.orbit = null; st.pow = 0; st.pulling = false;
    p.mult = 1; st.combo = 0; p.bt = { gates: 0, targ: 0, bumps: 0 }; for (const s of LAY.drops) s.on = true; st.skill = Math.floor(rr(0, 3)); st.skillLive = 0;
    st.phase = 'play'; serve(false); if (st.demo) later(0.6, () => { const b = laneBall(); b && launch(b, rr(0.6, 1)); });
    const many = st.players.length > 1; flash((many ? p.name + ' · ' : '') + 'BALL ' + p.ball, laneHint(), p.col, 1.8); dirty = true;
  }
  const laneHint = () => touch ? 'HOLD THE RIGHT SIDE · LET GO TO LAUNCH' : 'HOLD SPACE · LET GO TO LAUNCH';
  function endBall() {
    const p = P(); sfx('drain'); buzz(60); st.wizard = Math.max(0, st.wizard);
    const base = p.bt.gates * 2000 + p.bt.bumps * 20 + p.bt.targ * 200, total = st.tilted ? 0 : base * p.mult;
    st.bonus = { lines: [['GATES OPENED', p.bt.gates + ' × 2,000'], ['BUMPERS', p.bt.bumps + ' × 20'], ['TARGETS', p.bt.targ + ' × 200'], ['MULTIPLIER', '× ' + p.mult]], total: st.tilted ? 'TILT · NO BONUS' : fmt(total) };
    for (let i = 0; i < 10; i++) later(0.35 + i * 0.12, () => sfx('tick', null, i));
    score(total / mul()); st.phase = 'bonus'; say(st.tilted ? 'Tilt' : 'Bonus ' + fmt(total)); dirty = true;
    later(2.3, nextBall);
  }
  function nextBall() {
    st.bonus = null; const p = P();
    if (p.extra > 0 && !st.tilted) { p.extra--; flash('SHOOT AGAIN', 'SAME PLAYER · SAME BALL', '#ff8a1a', 1.6); sfx('knock'); startBall(); return; }
    p.ball++; if (p.ball > PINBALL.balls) p.done = true;
    if (st.mode === 'online') { netScore(true); if (p.done) return gameOver(); startBall(); return; }
    if (st.players.every(q => q.done)) return gameOver();
    let n = st.cur; do { n = (n + 1) % st.players.length; } while (st.players[n].done); st.cur = n;
    if (st.players.length > 1) { st.msgQ.length = 0; st.msg = null; st.phase = 'turn'; say(P().name + ', ball ' + P().ball); dirty = true; } else startBall();
  }
  function gameOver() {
    st.balls = []; st.wizard = 0; snd.ball(false);
    if (st.mode === 'online') { st.phase = 'wait'; netScore(true); checkNetDone(); dirty = true; return; }
    finish();
  }
  function finish() {
    const list = (st.mode === 'online' ? netResults() : st.players.map(p => ({ name: p.name, col: p.col, score: p.score, me: true }))).sort((a, b) => b.score - a.score);
    list.forEach((r, i) => r.place = i + 1);
    const mine = st.mode === 'online' ? (list.find(r => r.me) || { score: 0 }) : list[0];
    let gold = Math.min(30, Math.floor(mine.score / 4000)); const won = st.mode === 'online' && list.length > 1 && list[0].me;
    if (won) gold += 10; st.gold = gold; st.newBest = false;
    try { const day = new Date().toISOString().slice(0, 10), top = (save.stat(SAVE_KEYS.top, null) || []).slice(); const add = st.mode === 'online' ? list.filter(r => r.me) : list; for (const r of add) if (r.score > 0) top.push({ n: r.name, s: r.score, d: day, m: st.mode }); top.sort((a, b) => b.s - a.s); save.setStat(SAVE_KEYS.top, top.slice(0, 5)); } catch (e) {}
    try { if (gold) save.addGold(gold); save.addXp(Math.min(40, Math.floor(mine.score / 10000))); st.newBest = save.best(SAVE_KEYS.best, mine.score); save.setStat(SAVE_KEYS.games, save.stat(SAVE_KEYS.games) + 1); if (won) save.setStat(SAVE_KEYS.wins, save.stat(SAVE_KEYS.wins) + 1); } catch (e) {}
    st.results = list; st.msgQ.length = 0; st.msg = null; st.phase = 'over'; sfx(st.newBest ? 'big' : 'gate'); say((list.length > 1 ? list[0].name + ' wins. ' : '') + 'Final score ' + fmt(mine.score)); dirty = true;
  }

  // ---------------- input ----------------
  const held = { L: new Set(), R: new Set() }; let plungeKey = false;
  function setFlip(side, on) { const f = LAY.flips[side === 'L' ? 0 : 1]; if (f.on === on) return; if (st.tilted && on) return;
    f.on = on; if (!on) sfx('flipUp', side === 'L' ? 1 : 8); if (on) { sfx('flip', side === 'L' ? 1 : 8); buzz(8); if (st.phase === 'play') { const p = P(); if (p) { p.fox = side === 'L' ? [p.fox[1], p.fox[2], p.fox[0]] : [p.fox[2], p.fox[0], p.fox[1]]; dirty = true; } } } }
  function press(side, id) { snd.wake(); if (st.phase !== 'play' || st.paused || st.demo) return; held[side].add(id); setFlip(side, true); if (side === 'R' && laneBall() && !st.pulling) { st.pulling = true; sfx('pull'); } }
  function release(side, id) { held[side].delete(id); if (!held[side].size) setFlip(side, false); if (side === 'R' && !held.R.size && !plungeKey) letGo(); }
  function letGo() { if (!st.pulling) return; st.pulling = false; const b = laneBall(); if (b) launch(b, Math.max(0.25, st.pow)); st.pow = 0; dirty = true; }
  const el = W ? W.el : renderer.domElement, pmap = new Map();
  const pd = e => { if (e.button > 0) return; e.preventDefault(); const r = el.getBoundingClientRect(), side = e.clientX - r.left < r.width / 2 ? 'L' : 'R'; pmap.set(e.pointerId, side); press(side, 'p' + e.pointerId); try { el.setPointerCapture(e.pointerId); } catch (er) {} };
  const pu = e => { const side = pmap.get(e.pointerId); if (!side) return; pmap.delete(e.pointerId); release(side, 'p' + e.pointerId); };
  el.addEventListener('pointerdown', pd); el.addEventListener('pointerup', pu); el.addEventListener('pointercancel', pu); el.addEventListener('contextmenu', e => e.preventDefault());
  const KL = ['ArrowLeft', 'KeyZ', 'ShiftLeft', 'KeyA'], KR = ['ArrowRight', 'KeyM', 'ShiftRight', 'Slash', 'KeyL'], KP = ['Space', 'ArrowDown', 'Enter'], KN = ['KeyN', 'ArrowUp'];
  const kd = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; snd.wake(); const c = e.code;
    if (st.phase !== 'play' || st.paused) return;
    if (KL.includes(c)) { e.preventDefault(); if (!e.repeat) press('L', 'k' + c); } else if (KR.includes(c)) { e.preventDefault(); if (!e.repeat) press('R', 'k' + c); }
    else if (KP.includes(c)) { e.preventDefault(); if (!e.repeat && laneBall() && !st.demo) { plungeKey = true; if (!st.pulling) sfx('pull'); st.pulling = true; } }
    else if (KN.includes(c)) { e.preventDefault(); if (!e.repeat) nudge(); } };
  const ku = e => { const c = e.code; if (KL.includes(c)) release('L', 'k' + c); else if (KR.includes(c)) release('R', 'k' + c); else if (KP.includes(c)) { plungeKey = false; letGo(); } };
  if (!W) { addEventListener('keydown', kd); addEventListener('keyup', ku); }   // world: the map forwards the keys (game.keyDown / keyUp) so its own key handlers never eat them
  const blurAll = () => { for (const s of ['L', 'R']) { held[s].clear(); setFlip(s, false); } pmap.clear(); plungeKey = false; st.pulling = false; };
  addEventListener('blur', blurAll);
  function nudge() {
    if (st.phase !== 'play' || st.tilted || st.demo) return; snd.wake(); buzz(40); sfx('kick'); shake(0.35);
    for (const b of st.balls) if (b.held <= 0 && !inLane(b)) { b.vx += rr(-2.2, 2.2); b.vy += rr(1.2, 2.4); }
    st.tilt += 1.25; if (st.tilt >= 3.6) { st.tilted = true; blurAll(); flash('TILT', 'FLIPPERS OFF THIS BALL', '#ec3013', 2.2); sfx('tilt'); } else if (st.tilt >= 2.3) { flash('DANGER', 'ONE MORE AND IT TILTS', '#ec3013', 1.2); sfx('warn'); }
  }

  // ---------------- physics loop ----------------
  function step(dt) {
    let n = Math.min(30, Math.ceil(dt / SUB)); const h = dt / n;
    for (let k = 0; k < n; k++) {
      for (const f of LAY.flips) { const tgt = f.on ? FL.up : FL.rest, prev = f.a; if (f.a < tgt) f.a = Math.min(tgt, f.a + FL.upSpd * h); else if (f.a > tgt) f.a = Math.max(tgt, f.a - FL.dnSpd * h); f.w = (f.a - prev) / h; }
      for (let i = st.balls.length - 1; i >= 0; i--) { const b = st.balls[i]; if (!b) continue;
        if (b.held > 0) continue;
        b.vy -= G * h; b.x += b.vx * h; b.y += b.vy * h;
        for (const s of LAY.segs) if (s.on) colSeg(b, s, onHit);
        for (const c of LAY.bumpers) colBump(b, c, onHit);
        for (const f of LAY.flips) colFlip(b, f, onHit);
        const sp = Math.hypot(b.vx, b.vy); if (sp > VMAX) { b.vx *= VMAX / sp; b.vy *= VMAX / sp; }
        if (b.noCap > 0) b.noCap -= h; else { const dx = b.x - LAY.hole.x, dy = b.y - LAY.hole.y; if (dx * dx + dy * dy < 0.36 * 0.36 && sp < 15) onHole(b); }
        for (const z of LAY.sensors) { const inZ = b.x >= z.x0 && b.x <= z.x1 && b.y >= z.y0 && b.y <= z.y1; if (inZ && !b.zones.has(z.id)) { b.zones.add(z.id); onSensor(z.id, b); } else if (!inZ && b.zones.has(z.id)) b.zones.delete(z.id); }
        if (b.y < -0.7 || b.x < -1 || b.x > 11 || b.y > 21.5) { if (b.y < -0.7 && b.x < 10) { drained(b); continue; } b.x = 9.5; b.y = 0.9; b.vx = b.vy = 0; }
      }
      for (let i = 0; i < st.balls.length; i++) for (let j = i + 1; j < st.balls.length; j++) if (st.balls[i].held <= 0 && st.balls[j].held <= 0) { const j2 = colBalls(st.balls[i], st.balls[j]); if (j2 > 3) sfx('clack', st.balls[i].x); }
    }
    // held balls in the hole: kick out to a flipper
    for (const b of st.balls) if (b.held > 0) { b.held -= dt; if (b.held <= 0) { const s = Math.random() < 0.5 ? -1 : 1; b.vx = s * rr(4.5, 6); b.vy = -rr(2.5, 4); b.noCap = 0.8; sfx('kick'); spark(b.x, b.y, 6, 0x22c55e); } }
    // stuck ball rescue (ball search)
    for (const b of st.balls) { if (b.held > 0 || inLane(b)) { b.still = 0; continue; } if (Math.hypot(b.vx, b.vy) < 0.25) { b.still += dt; if (b.still > 3) { b.vx = rr(-3, 3); b.vy = rr(4, 7); b.still = 0; } } else b.still = 0; }
  }
  function assist(dt) {
    const auto = st.demo || prefs.autoFlip; if (!auto || st.tilted) return;
    for (const [i, f] of LAY.flips.entries()) { const side = i ? 'R' : 'L'; if (held[side].size && !held[side].has('auto')) continue;
      let want = false; for (const b of st.balls) { if (b.held > 0) continue; const dx = (b.x - f.px) * f.side, dy = b.y - f.py; if (dx > 0.35 && dx < FL.len + 0.25 && dy > -0.5 && dy < 1.05 && b.vy < 1.5) want = true; }
      if (want && !f.on) { held[side].add('auto'); setFlip(side, true); f.autoT = 0.28; }
      if (f.autoT > 0) { f.autoT -= dt; if (f.autoT <= 0) { held[side].delete('auto'); if (!held[side].size) setFlip(side, false); } } }
    if (st.demo) { const b = laneBall(); if (b && !b.dl) { b.dl = 1; later(0.7, () => { if (st.balls.includes(b) && inLane(b)) launch(b, rr(0.55, 1)); }); } }
  }

  // ---------------- camera ----------------
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }; let view = 'menu', camShake = 0; const WD = W;
  function shake(a) { camShake = Math.max(camShake, a); }
  const fitCam = new THREE.PerspectiveCamera(46, 1, 0.05, 40), camPos = V3(0, 1.6, 2.6), camTgt = V3(0, 0.9, 0), wantPos = V3(), wantTgt = V3();
  function fitShot(pts, el, yaw = 0, margin = 0.04) {
    const W = CW(), H = CH(); fitCam.aspect = W / H; fitCam.fov = camera.fov; fitCam.updateProjectionMatrix();
    const xL = -1 + 2 * SAFE.left / W + margin, xR = 1 - 2 * SAFE.right / W - margin, yT = 1 - 2 * SAFE.top / H - margin, yB = -1 + 2 * SAFE.bottom / H + margin;
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length);
    const _p = V3(), bounds = d => { fitCam.position.copy(tgt).addScaledVector(dir, d); fitCam.lookAt(tgt); fitCam.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitCam); if (_p.z > 1) return null; x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { x0, x1, y0, y1 }; };
    let d = 3;
    for (let it = 0; it < 4; it++) {
      let lo = 0.3, hi = 30; for (let k = 0; k < 26; k++) { const m = (lo + hi) / 2, b = bounds(m); if (b && b.x1 - b.x0 <= xR - xL && b.y1 - b.y0 <= yT - yB) hi = m; else lo = m; } d = hi;
      const b = bounds(d); if (!b) break; const ox = (b.x0 + b.x1) / 2 - (xL + xR) / 2, oy = (b.y0 + b.y1) / 2 - (yB + yT) / 2;
      const hh = Math.tan(fitCam.fov * Math.PI / 360) * d, right = V3(1, 0, 0).applyQuaternion(fitCam.quaternion), up = V3(0, 1, 0).applyQuaternion(fitCam.quaternion);
      tgt.addScaledVector(right, ox * hh * fitCam.aspect).addScaledVector(up, oy * hh);
    }
    return { pos: tgt.clone().addScaledVector(dir, d), tgt };
  }
  let shotKey = '', shot = null;
  function tablePts() { const out = []; table.updateMatrixWorld(true); for (const [x, y] of [[-0.3, -0.7], [10.3, -0.7], [-0.3, 20.2], [10.3, 20.2], [5, 20.2]]) for (const hh of [0, 0.7]) out.push(table.localToWorld(V3(TX(x), hh, TZ(y)))); if (W) for (const x of [0.2, 9.8]) out.push(table.localToWorld(V3(TX(x), 2.1, TZ(21.9)))); return out; }
  function menuPts() { const out = tablePts(); machine.updateMatrixWorld(true); out.push(backbox.localToWorld(V3(-0.4, 0.97, 0)), backbox.localToWorld(V3(0.4, 0.97, 0)), V3(0, 0, 2.2), V3(-1.9, 2.4, 0.7), V3(1.95, 2.4, 0.75), V3(-1.9, 0, 0.7), V3(1.95, 0, 0.75), V3(0, 2.4, 2.0)); return out; }
  function updateShot() {
    const W = CW(), H = CH(), port = H > W, key = view + W + 'x' + H + JSON.stringify(SAFE); if (key === shotKey && shot) return shot; shotKey = key;
    const yw = WD ? (WD.yaw || 0) : 0;
    if (view === 'play' || WD) { const el = port ? 1.02 : (W / H > 1.9 ? 0.74 : 0.82); shot = fitShot(tablePts(), el, yw, port ? 0.02 : 0.03); }
    else shot = fitShot(menuPts(), port ? 0.82 : 0.6, port ? 0.0 : 0.42, 0.04);
    return shot;
  }

  // ---------------- render loop ----------------
  const tmpTip = [];
  function frame() {
    if (stopped) return; requestAnimationFrame(frame);
    const now = performance.now(); let dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; if (document.hidden) return;
    const live = st.phase === 'play' && !st.paused;
    if (!st.paused) { tNow += dt; for (let i = timers.length - 1; i >= 0; i--) if (timers[i].t <= tNow) { const t = timers.splice(i, 1)[0]; try { t.fn(); } catch (e) { console.warn(e); } } }
    if (live) {
      assist(dt); step(dt);
      if (st.pulling) { st.pow = Math.min(1, st.pow + dt / 1.1); dirty = true; }
      if (st.saveT > 0) { st.saveT = Math.max(0, st.saveT - dt); }
      if (st.wizard > 0) st.wizard = Math.max(0, st.wizard - dt);
      if (st.skillLive > 0) st.skillLive = Math.max(0, st.skillLive - dt);
      if (st.orbit) { st.orbit.t -= dt; if (st.orbit.t <= 0) st.orbit = null; }
      st.tilt = Math.max(0, st.tilt - dt * 0.45);
    } else if (st.phase === 'menu' || st.phase === 'turn' || st.phase === 'over' || st.phase === 'wait') { for (const f of LAY.flips) { f.on = false; f.a = Math.max(FL.rest, f.a - FL.dnSpd * dt); } }
    // message queue
    if (st.msg) { st.msg.left -= dt; if (st.msg.left <= 0) { st.msg = null; dirty = true; } }
    if (!st.msg && st.msgQ.length) { const m = st.msgQ.shift(); st.msg = { ...m, left: m.dur }; dirty = true; }
    // sound ball
    if (prefs.soundBall && live && st.balls.length) { const b = st.balls.reduce((a, c) => c.y < a.y ? c : a, st.balls[0]); snd.ball(true, b.x, b.y, Math.hypot(b.vx, b.vy)); } else snd.ball(false);
    // ---- draw ----
    LAY.flips.forEach((f, i) => { flipMeshes[i].rotation.y = f.side > 0 ? f.a : Math.PI - f.a; });
    ballPool.forEach((p, i) => { const b = st.balls[i]; p.m.visible = p.sh.visible = !!b; if (!b) { p.hist.length = 0; p.trail.forEach(t => t.visible = false); return; } const sink = b.held > 0 ? -0.18 : 0; p.m.position.set(TX(b.x), BR + sink, TZ(b.y)); p.m.rotation.x -= b.vy * dt / BR * 0.5; p.m.rotation.z -= b.vx * dt / BR * 0.5; p.sh.position.set(TX(b.x) + 0.12, 0.015, TZ(b.y) - 0.05);
      const sp = Math.hypot(b.vx, b.vy); p.hist.unshift([TX(b.x), TZ(b.y)]); if (p.hist.length > 6) p.hist.length = 6; p.trail.forEach((t, j) => { const h = p.hist[j + 1]; const on = !!h && sp > 11 && b.held <= 0; t.visible = on; if (on) { t.position.set(h[0], BR, h[1]); t.scale.setScalar(BR * (2.6 - j * 0.35)); t.material.opacity = Math.min(1, (sp - 11) / 14) * (0.4 - j * 0.07); } }); });
    if (live || st.phase === 'bonus') bumpMeshes.forEach(bm => { bm.t = Math.max(0, bm.t - dt * 6); bm.capMat.emissiveIntensity = 0.2 + bm.t * 1.1; bm.cap.position.y = 0.58 - bm.t * 0.12; bm.ring.position.y = 0.2 - bm.t * 0.08; bm.halo.material.opacity = 0.18 + bm.t * 0.7; bm.halo.scale.setScalar(2.4 + bm.t * 1.2); });
    slingMats.forEach(m => m.emissiveIntensity = Math.max(0, m.emissiveIntensity - dt * 6));
    LAY.drops.forEach((s, i) => { const dm = dropMeshes[i]; dm.m.position.y = damp(dm.m.position.y, s.on ? 0.275 : -0.32, 18, dt); });
    standMeshes.forEach((sm, i) => { sm.t = Math.max(0, sm.t - dt * 5); sm.m.position.x = TX(LAY.stands[i].ax) + sm.t * 0.08; });
    for (const p of sparks) if (p.life > 0) { p.life -= dt * 2.4; p.s.position.x += p.vx * dt; p.s.position.y += p.vy * dt; p.s.position.z += p.vz * dt; p.vy -= 9 * dt; p.s.scale.setScalar(0.5 * p.life + 0.05); p.s.material.opacity = p.life; if (p.life <= 0) p.s.visible = false; }
    plunger.position.z = damp(plunger.position.z, 12.7 + (st.pulling ? st.pow * 0.9 : 0), st.pulling ? 30 : 60, dt);
    if (wasPull && !st.pulling) laneKick = 0.12; wasPull = st.pulling; laneKick = Math.max(0, laneKick - dt);   // let go: the tip snaps forward into the ball
    lanePz = st.pulling ? damp(lanePz, st.pow * 1.4, 20, dt) : laneKick > 0 ? damp(lanePz, -0.35, 80, dt) : damp(lanePz, 0, 14, dt); laneP.position.z = TIP0 + lanePz; laneP.children.forEach((c, i) => { if (i >= 2) c.position.z = 0.45 + (i - 2) * (0.22 + Math.max(0, lanePz) * 0.12); }); spring.scale.z = 3 * (1 - (plunger.position.z - 12.7) * 0.55);
    lampT += dt; drawLamps(dt); drawDMD(); drawTop(); roomTick(dt, now); audioTick();
    foxes.forEach(f => { f.visible = view !== 'play'; if (f.visible) try { kit.animFox(f, dt, 0); } catch (e) {} });
    // camera
    const sh = updateShot(); if (sh) { wantPos.copy(sh.pos); wantTgt.copy(sh.tgt); }
    const k = 1 - Math.exp(-4.5 * dt); camPos.lerp(wantPos, k); camTgt.lerp(wantTgt, k);
    camera.position.copy(camPos); camera.lookAt(camTgt); if (camShake > 0) { camShake = Math.max(0, camShake - dt * 1.4); const a = camShake * camShake * 0.035; camera.position.x += Math.sin(now * 0.083) * a; camera.position.y += Math.cos(now * 0.071) * a * 0.7; }
    if (!W) renderer.render(scene, camera); else if (camera.aspect !== CW() / CH()) { camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); shotKey = ''; }
    if (dirty && now - lastEmit > 90) { lastEmit = now; dirty = false; onState && onState(hud()); }
    else if (live && now - lastEmit > 250) { lastEmit = now; onState && onState(hud()); }
    if (st.mode === 'online' && st.phase === 'play' && now - lastNetSend > 450) netScore(false);
  }
  function drawLamps(dt) {
    const p = P(), blink = Math.floor(lampT * 4) % 2 === 0, fast = Math.floor(lampT * 8) % 2 === 0, attract = st.phase !== 'play' && st.phase !== 'bonus' && st.phase !== 'turn' && st.phase !== 'count';
    if (attract || !p) { MC.attract(dt); holeGlow.material.opacity = 0.2 + 0.2 * Math.sin(lampT * 3); return; }
    const set = MC.setLamp, nextGate = p.gates.indexOf(false);
    if (st.wizard > 0) { const i = Math.floor(lampT * 10); for (let g = 0; g < 8; g++) set('g' + g, (g + i) % 2 === 0); } else for (let i = 0; i < 8; i++) set('g' + i, p.gates[i] || (i === nextGate && blink));
    for (let i = 0; i < 3; i++) set('fox' + i, p.fox[i] || (st.skillLive > 0 && st.skill === i && fast));
    for (let m = 2; m <= 5; m++) set('x' + m, p.mult >= m);
    for (let i = 0; i < 3; i++) set('lock' + i, st.multi ? blink : p.locks > i);
    set('drop', LAY.drops.some(s => !s.on) ? blink : false); set('stand', p.stand.some(Boolean) ? blink : true);
    set('orbL', st.combo > 0 ? fast : p.orbits % 2 === 1 ? blink : true); set('orbR', st.combo > 0 ? fast : p.orbits % 2 === 1 ? blink : true);
    set('again', (st.saveT > 0 && (st.saveT > 2 || blink)) || p.extra > 0); set('jack', st.multi && blink); set('extra', p.extraLit && fast);
    set('inL', st.combo > 0 && st.comboSide === 'inL'); set('inR', st.combo > 0 && st.comboSide === 'inR');
    MC.lampTick(dt); holeGlow.material.opacity = st.multi || p.extraLit ? (blink ? 0.7 : 0.25) : 0.12;
    MC.slotMat.color.setHex(0xff3b2a);
  }
  // the orange dot-matrix display in the backbox
  let dmdT = 0;
  function drawDMD() {
    const p = P(), best = (() => { try { return save.stat(SAVE_KEYS.best, 0); } catch (e) { return 0; } })();
    if (st.phase === 'menu' || !p) { const k = Math.floor(lampT / 2.5) % 3; dmd.draw(k === 0 ? ['GATE RUSH'] : k === 1 ? ['HIGH SCORE', fmt(best)] : ['PRESS', 'START']); return; }
    if (st.phase === 'over') { dmd.draw(['GAME OVER', fmt(st.results && st.results[0] ? st.results[0].score : p.score)]); return; }
    if (st.phase === 'wait') { dmd.draw(['WAITING FOR', 'FRIENDS']); return; }
    if (st.phase === 'turn') { dmd.draw([p.name, 'BALL ' + p.ball]); return; }
    if (st.phase === 'count') { dmd.draw(['GET READY', String(st.count)]); return; }
    if (st.phase === 'bonus' && st.bonus) { dmd.draw(['BONUS', st.bonus.total]); return; }
    if (st.msg) { dmd.draw(st.msg.sub && st.msg.sub.length <= 18 ? [st.msg.t, st.msg.sub] : [st.msg.t]); return; }
    dmd.draw(['BALL ' + Math.min(PINBALL.balls, p.ball) + (p.mult > 1 ? '   ×' + p.mult : '') + (st.wizard > 0 ? '   2× ' + Math.ceil(st.wizard) : ''), fmt(p.score)]);
  }
  function roomTick(dt, now) {
    const t = now / 1000; bgScreens.forEach((b, i) => { const k = 0.6 + 0.4 * Math.sin(t * (3 + i) + i * 2) * Math.sin(t * 0.7 + i); b.m.material.color.copy(b.c).multiplyScalar(k); });
    const fl = Math.sin(t * 23) > 0.97 ? 0.4 : 1; neonA.m.material.opacity = fl; neonA.hl.material.opacity = 0.35 * fl; neonL.intensity = 0.9 * fl;
  }
  // music follows the game; the ball roll follows the fastest ball
  function audioTick() {
    if (!snd.live) return;
    const ph = st.phase, m = (ph === 'play' || ph === 'bonus' || ph === 'count') ? (st.wizard > 0 ? 'wizard' : st.multi ? 'multi' : 'play') : 'menu';
    if (prefs.music) music.setMode(m); music.setDuck(st.paused ? 0.3 : 1);
    if (ph === 'play' && !st.paused) { let sp = 0, n = 0; for (const b of st.balls) if (b.held <= 0 && !(b.x > 9.02 && b.y < 1.6)) { sp = Math.max(sp, Math.hypot(b.vx, b.vy)); n++; } snd.setRoll(sp, n); } else snd.setRoll(0, 0);
  }
  // ---------------- online (2–4 players, own tables, live scores) ----------------
  let N = null, netTok = 0, lastNetSend = 0, nTimer = 0; const peers = new Map(); // id → { j, ready, playing, score, ball, done, seen }
  const net = { st: null, code: '', status: '', j: 0, ready: false, msg: '', matchIds: null, ping: null };
  const netOn = () => !!net.st;
  function members() { if (!N) return []; const all = [{ id: N.id, j: net.j, ready: net.ready, playing: st.mode === 'online' && st.phase !== 'menu' && st.phase !== 'over', me: true }, ...[...peers.entries()].map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, PINBALL.maxPlayers); }
  function slotOf(ids, id) { const s = ids.slice().sort(); return s.indexOf(id); }
  function netOpen() { snd.wake(); Object.assign(net, { st: 'menu', code: '', status: '', msg: '', ready: false }); dirty = true; }
  function netCreate() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c = ''; for (let i = 0; i < 4; i++) c += A[Math.floor(Math.random() * A.length)]; return netJoin(c); }
  async function netJoin(code) {
    code = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { net.msg = 'Type the 4-letter room code from your friend.'; dirty = true; return; }
    netLeave(true); peers.clear(); Object.assign(net, { st: 'room', code, status: 'connecting', j: Date.now(), ready: false, msg: '', matchIds: null, ping: null }); dirty = true;
    const tok = ++netTok;
    const conn = await connectNet({ game: 'pinball', code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => nMsg(t, d, id), onStatus: s => { net.status = s; dirty = true; } });
    if (tok !== netTok) { conn.leave(); return; } N = conn; hello(); dirty = true;
    try { const u = new URL(location.href); u.searchParams.set('room', code); history.replaceState(null, '', u.href); } catch (e) {}
    clearInterval(nTimer); nTimer = setInterval(nTick, 1000);
  }
  function netLeave(keep) { netTok++; clearInterval(nTimer); if (N) { try { N.send('ev', { k: 'bye' }); N.leave(); } catch (e) {} } N = null; peers.clear(); net.matchIds = null;
    if (!keep) { net.st = null; try { const u = new URL(location.href); if (u.searchParams.has('room')) { u.searchParams.delete('room'); history.replaceState(null, '', u.href); } } catch (e) {} } dirty = true; }
  function hello(to) { if (!N) return; N.send('hi', { v: 1, j: net.j, ready: net.ready, playing: st.mode === 'online' && (st.phase === 'play' || st.phase === 'bonus' || st.phase === 'wait') }, to); }
  function nMsg(t, d, id) {
    if (!N || !d) return; const known = peers.has(id), now = performance.now();
    if (t === 'hi') { const p = peers.get(id) || { score: 0, ball: 1, done: false }; peers.set(id, { ...p, j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing, seen: now }); if (!known) setTimeout(() => hello(id), 0); setTimeout(maybeStart, 0); dirty = true; return; }
    if (!known) return; const p = peers.get(id); p.seen = now;
    if (t === 'pg') { if (d.t != null) N.send('pg', { e: d.t }, id); else if (d.e != null) { net.ping = Math.max(1, Math.round(now - d.e)); } return; }
    if (t === 'sc') { p.score = +d.s || 0; p.ball = +d.b || 1; p.done = !!d.d; dirty = true; if (st.phase === 'wait') checkNetDone(); return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { p.ready = !!d.on; setTimeout(maybeStart, 0); }
    else if (d.k === 'start') startOnline(d);
    else if (d.k === 'playing') p.playing = !!d.on;
    else if (d.k === 'bye') gone(id);
    dirty = true;
  }
  function gone(id) { if (!peers.has(id)) return; peers.delete(id); dirty = true; if (st.phase === 'wait') checkNetDone(); }
  function nTick() { if (!N) return; N.send('pg', { t: performance.now() }); const now = performance.now(); for (const [id, p] of peers) if (now - p.seen > 25000) gone(id); }
  function hostId() { const m = members(); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : null; }
  function maybeStart() { if (!N || net.st !== 'room') return; const m = members(); if (!m.some(x => x.me) || hostId() !== N.id) return; if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return;
    const d = { k: 'start', t0: Date.now() + 3500, ids: m.map(x => x.id) }; N.send('ev', d); startOnline(d); }
  function startOnline(d) {
    if (!N || !Array.isArray(d.ids)) return; if (!d.ids.includes(N.id)) { net.msg = 'A game started without you. You join the next one.'; dirty = true; return; }
    net.matchIds = d.ids.slice(); net.st = 'play'; net.ready = false; for (const [id, p] of peers) { p.ready = false; p.score = 0; p.ball = 1; p.done = false; p.playing = d.ids.includes(id); }
    let wait = (+d.t0 - Date.now()) / 1000; if (!(wait >= 0 && wait <= 5)) wait = 3;
    const me = slotOf(d.ids, N.id), C = NET_COLS[me] || NET_COLS[0];
    resetGame('online', [newPlayer(d.ids.length > 2 ? C[0] : 'YOU', C[1], true)]);
    st.phase = 'count'; st.count = Math.ceil(wait); view = 'play'; shotKey = '';
    const tick = () => { st.count = Math.max(0, Math.ceil(wait - (tNow - t0))); dirty = true; if (st.count > 0) { sfx('click'); later(0.25, tick); } else startBall(); }; const t0 = tNow; tick();
    N.send('ev', { k: 'playing', on: true }); dirty = true;
  }
  function netScore(force) { if (!N || st.mode !== 'online') return; const p = st.players[0]; if (!p) return; lastNetSend = performance.now(); N.send('sc', { s: p.score, b: Math.min(PINBALL.balls, p.ball), d: !!p.done }); }
  function netResults() { const ids = net.matchIds || []; return ids.map(id => { const slot = slotOf(ids, id), C = NET_COLS[slot] || NET_COLS[0]; if (N && id === N.id) return { id, name: ids.length > 2 ? C[0] : 'YOU', col: C[1], score: st.players[0] ? st.players[0].score : 0, me: true }; const p = peers.get(id); return { id, name: ids.length > 2 ? C[0] : 'RIVAL', col: C[1], score: p ? p.score : 0, me: false, left: !p }; }); }
  function checkNetDone() { if (st.phase !== 'wait') return; const ids = net.matchIds || []; const ok = ids.every(id => (N && id === N.id) || !peers.has(id) || peers.get(id).done); if (ok) { net.st = 'room'; if (N) N.send('ev', { k: 'playing', on: false }); finish(); } }
  function netReady() { if (!N) return; net.ready = !net.ready; N.send('ev', { k: 'ready', on: net.ready }); setTimeout(maybeStart, 0); dirty = true; }

  // ---------------- flow ----------------
  function resetGame(mode, players) {
    timers.length = 0; Object.assign(st, { ...S0, msgQ: [], mode, players, cur: 0, balls: [] }); for (const s of LAY.drops) s.on = true; blurAll(); dirty = true;
  }
  function startSolo() { snd.wake(); sfx('coin'); wake(true); netLeave(); resetGame('solo', [newPlayer('YOU', '#ec3013')]); view = 'play'; shotKey = ''; startBall(); }
  function startLocal(n) { snd.wake(); sfx('coin'); wake(true); netLeave(); n = clamp(n | 0, 2, PINBALL.maxPlayers); resetGame('local', Array.from({ length: n }, (_, i) => newPlayer('PLAYER ' + (i + 1), NET_COLS[i][1]))); view = 'play'; shotKey = ''; st.phase = 'turn'; say('Player 1, ball 1'); }
  function go() { snd.wake(); if (st.phase === 'turn') startBall(); }
  function toMenu() { wake(false); resetGame('solo', []); st.phase = 'menu'; view = 'menu'; shotKey = ''; if (net.st === 'play') net.st = 'room'; snd.ball(false); }
  function quit() { if (st.mode === 'online' && N) { const p = st.players[0]; if (p) { p.done = true; netScore(true); } N.send('ev', { k: 'playing', on: false }); net.st = 'room'; } toMenu(); }
  function demoStart() { snd.wake(); resetGame('solo', [newPlayer('DEMO', '#38bdf8')]); st.demo = true; view = 'play'; shotKey = ''; startBall(); }
  function demoStop() { toMenu(); }
  function setPref(k, v) { prefs[k] = v; try { save.setStat(SAVE_KEYS.prefs, { ...prefs }); } catch (e) {} if (k === 'soundBall' && !v) snd.ball(false); if (k === 'sound') { snd.setSfx(v); if (!v) snd.setRoll(0, 0); } if (k === 'music') music.setOn(v); if (v) { snd.wake(); sfx('click'); } dirty = true; }
  function pause(on) { if (st.phase !== 'play' && st.phase !== 'bonus') return; sfx('click'); if (st.mode === 'online') { st.paused = false; dirty = true; return; } st.paused = on; if (on) blurAll(); snd.ball(false); dirty = true; }

  function hud() {
    const p = P(), m = netOn() ? members() : [], ids = net.matchIds || [];
    const lane = st.phase === 'play' && !!laneBall() && !st.demo;
    const others = st.mode === 'online' ? netResults().filter(r => !r.me).map(r => { const q = peers.get(r.id); return { name: r.name, col: r.col, score: fmt(r.score), ball: q ? (q.done ? 'DONE' : 'BALL ' + q.ball) : 'LEFT', cur: false }; })
      : st.mode === 'local' ? st.players.map((q, i) => ({ name: q.name, col: q.col, score: fmt(q.score), ball: q.done ? 'DONE' : 'BALL ' + q.ball, cur: i === st.cur })) : [];
    return {
      phase: st.phase, mode: st.mode, paused: st.paused, demo: st.demo, touch, count: st.count,
      cur: p ? { name: p.name, col: p.col, score: fmt(p.score), ball: Math.min(PINBALL.balls, p.ball), balls: PINBALL.balls, mult: p.mult, extra: p.extra, extraLit: p.extraLit, gates: p.gates.slice(), gateN: p.gates.filter(Boolean).length, locks: p.locks, bumps: p.bumps % 25, wizards: p.wizards } : null,
      others, msg: st.msg ? { t: st.msg.t, sub: st.msg.sub, col: st.msg.col } : null,
      lane, pow: st.pow, pulling: st.pulling, save: Math.ceil(st.saveT), tilt: st.tilt >= 2.3 && !st.tilted, tilted: st.tilted, multi: st.multi, wizard: Math.ceil(st.wizard), balls: st.balls.length,
      bonus: st.bonus, results: st.results, gold: st.gold, newBest: st.newBest, best: (() => { try { return save.stat(SAVE_KEYS.best, 0); } catch (e) { return 0; } })(), goldNow: (() => { try { return save.data.gold; } catch (e) { return 0; } })(),
      prefs: { ...prefs }, combo: st.combo > 0, top: (() => { try { return (save.stat(SAVE_KEYS.top, null) || []).map(r => ({ n: r.n, s: fmt(r.s), d: r.d, m: r.m })); } catch (e) { return []; } })(),
      net: !net.st ? null : { st: net.st, code: net.code, status: net.status, msg: net.msg, ready: net.ready, ping: net.ping, host: N && hostId() === N.id,
        members: m.map(x => { const slot = slotOf(m.map(y => y.id), x.id), C = NET_COLS[slot] || NET_COLS[0]; return { name: m.length > 2 ? C[0] : x.me ? 'YOU' : 'RIVAL', col: C[1], me: x.me, ready: !!x.ready, playing: !!x.playing }; }),
        full: !!N && m.length >= PINBALL.maxPlayers && !m.some(x => x.me), waitN: st.phase === 'wait' ? ids.filter(id => peers.has(id) && !peers.get(id).done).length : 0 },
    };
  }
  // keep the phone screen on while playing; pause when the app is hidden (not online — the others keep going)
  let lock = null; async function wake(on) { try { if (on && !lock && navigator.wakeLock) { lock = await navigator.wakeLock.request('screen'); lock.addEventListener('release', () => { lock = null; }); } else if (!on && lock) { await lock.release(); lock = null; } } catch (e) { lock = null; } }
  const onVis = () => { if (document.hidden) { if ((st.phase === 'play' || st.phase === 'bonus') && st.mode !== 'online' && !st.demo) pause(true); blurAll(); music.setDuck(0); } else { if (st.phase === 'play' || st.phase === 'bonus' || st.phase === 'count') wake(true); music.setDuck(st.paused ? 0.3 : 1); } };
  document.addEventListener('visibilitychange', onVis);
  const firstTap = () => { snd.wake(); dirty = true; }; addEventListener('pointerdown', firstTap, true); addEventListener('keydown', firstTap, true);
  function setSafe(top, bottom, left = 0, right = 0) { if (SAFE.top === top && SAFE.bottom === bottom && SAFE.left === left && SAFE.right === right) return; Object.assign(SAFE, { top, bottom, left, right }); shotKey = ''; }
  const ro = new ResizeObserver(() => { if (!W) renderer.setSize(CW(), CH()); camera.aspect = CW() / CH(); camera.updateProjectionMatrix(); shotKey = ''; dirty = true; }); ro.observe(W ? document.documentElement : container);
  // first camera position = the menu shot (no glide in from nowhere)
  { const s0 = updateShot(); if (s0) { camPos.copy(s0.pos); camTgt.copy(s0.tgt); wantPos.copy(s0.pos); wantTgt.copy(s0.tgt); } }
  requestAnimationFrame(frame); setTimeout(() => onState && onState(hud()), 0);

  // test hook: run the physics fast (no rendering) — used by the build check
  function simulate(seconds, opts = {}) { const keep = prefs.autoFlip; prefs.autoFlip = opts.autoFlip ?? true; const t = Math.round(seconds * 120); for (let i = 0; i < t; i++) { tNow += 1 / 120; for (let k = timers.length - 1; k >= 0; k--) if (timers[k].t <= tNow) timers.splice(k, 1)[0].fn(); if (st.phase !== 'play') continue; assist(1 / 120); const lb = laneBall(); if (lb && !lb.simL) { lb.simL = 1; later(0.3, () => { if (st.balls.includes(lb) && inLane(lb)) launch(lb, rr(0.4, 1)); }); } step(1 / 120); if (st.saveT > 0) st.saveT = Math.max(0, st.saveT - 1 / 120); } prefs.autoFlip = keep; return hud(); }

  return {
    hud, setSafe, startSolo, startLocal, go, toMenu, quit, pause, nudge, demoStart, demoStop, setPref, simulate,
    netOpen, netCreate, netJoin, netLeave: () => netLeave(false), netReady, netBack: () => { if (net.st === 'menu') { net.st = null; dirty = true; } else netLeave(false); },
    press, release, keyDown: e => kd(e), keyUp: e => ku(e), state: st, layout: LAY, scene, camera, foxes, table, renderer,
    destroy() { stopped = true; ro.disconnect(); netLeave(false); wake(false); music.stop(); snd.stopAll(); removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('blur', blurAll); removeEventListener('pointerdown', firstTap, true); removeEventListener('keydown', firstTap, true); document.removeEventListener('visibilitychange', onVis); el.removeEventListener('pointerdown', pd); el.removeEventListener('pointerup', pu); el.removeEventListener('pointercancel', pu); if (W) { scene.parent && scene.parent.remove(scene); } else { renderer.dispose(); renderer.domElement.remove(); } },
    wake: () => snd.wake(), music, snd,
  };
}
