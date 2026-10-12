// 8 GATES · minigame #46 · COCONUT SHY / TIN CAN ALLEY
// A carnival stall interior that fits inside any building on any world. First-person: swipe up to throw.
// Three rounds: Tin Can Alley (can pyramids), Coconut Shy (coconuts in cups), The Runaway Shelf (moving pyramid + high coconuts).
// Play: solo · pass & play (2-5 on one phone) · online (2-5, engine/duel-net.js peer to peer, same seed, live scoreboard).
// Self-contained on purpose (PARALLEL RULES): the toon helpers it needs are copied in here, not imported from shared files.
// Save keys (engine/save.js): stats coconutShy.best, coconutShy.plays, coconutShy.wins · flags coconutShy.played, coconutShy.giantPlush
// Items: coconutShyPinwheel, coconutShyCoconut, coconutShyGiantPlush
import * as THREE from '../../vendor/three/three.module.js';
import { castKit, CAST, loadCastRigs } from '../../engine/cast.js';
import { foxKit, KING_MIGHT, PLAYER_FEMALE } from '../../fox-kit.js';
import { save } from '../../engine/save.js';
import { crestTex, canvasTex } from '../../engine/textures.js';

export const GAME = 'coconutShy';
export const MAX_PLAYERS = 5;
export const NET_COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['PINK', '#f472b6']];
export const ROUNDS = [
  { id: 'cans', name: 'TIN CAN ALLEY', line: 'Three pyramids of cans. Knock them all off the shelf.', balls: 6 },
  { id: 'coco', name: 'COCONUT SHY', line: 'Five coconuts in cups. Hit one square to knock it out. Every hit loosens it.', balls: 6 },
  { id: 'move', name: 'THE RUNAWAY SHELF', line: 'The shelf slides. Throw where the pyramid is going. Two coconuts up top.', balls: 8 },
];
// DRAFT for Ben: prize names, score lines and gold.
export const PRIZES = [
  { min: 600, id: 'coconutShyGiantPlush', name: 'GIANT FOX PLUSH' },
  { min: 400, id: 'coconutShyCoconut', name: 'A REAL COCONUT' },
  { min: 200, id: 'coconutShyPinwheel', name: 'PINWHEEL' },
];
export const ITEM_LABELS = { coconutShyGiantPlush: 'Giant Fox Plush', coconutShyCoconut: 'Coconut', coconutShyPinwheel: 'Pinwheel' };
const PTS = { can: 10, coco: 50, pyramid: 25, ball: 15 };
// DRAFT barker lines
const SAY = {
  intro: ['Roll up, roll up! Knock them off the shelf, win a prize!', 'Every throw is free for a fox with a good arm!', 'Cans, coconuts, a shelf that runs away. Step right up!'],
  hit: ['Down they go!', 'Ha! Lovely clang.', 'That one is in the next county!'],
  miss: ['Ooh, so close!', 'The net thanks you.', 'Aim a bit lower, friend.'],
  coco: ['A coconut! Nobody does that!', 'Off the cup! Take a bow!'],
  wobble: ['It wobbled! Hit it again.', 'Loose now. One more!'],
  hot: ['Hot hand! Keep it going!', 'You are on fire!'],
  done: ['That is a prize winner right there!', 'Come back any time, champ.'],
};

// ---------- small helpers (copied, see header) ----------
const rr = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt)), smooth = t => t * t * (3 - 2 * t), pick = a => a[Math.floor(Math.random() * a.length)];
function mulberry(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function makeGradient() { const t = new THREE.DataTexture(new Uint8Array([80, 170, 255]), 3, 1, THREE.RedFormat); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; }

// ---------- geometry of the stall (metres; thrower stands at z≈0 looking down -z) ----------
const G = 9.8, BR = 0.085, CR = 0.112, CH = 0.24, KR = 0.15;
const SPAWN = new THREE.Vector3(0.3, 1.5, 0.1);
const TZ = -4.4, NETZ = -5.15, WALLX = 2.25, SHELF_Y = 1.0;
const yaw0 = Math.atan2(-SPAWN.x, SPAWN.z - TZ); // a straight-up swipe goes to the middle of the stall

// ---------- tiny synth (no media files needed) ----------
function makeAudio() {
  let ctx = null, master = null, noiseBuf = null; const A = { on: true };
  A.ensure = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination); const n = ctx.sampleRate; noiseBuf = ctx.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; } catch (e) { ctx = null; } } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };
  const out = pan => { if (!pan || !ctx.createStereoPanner) return master; const p = ctx.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); p.connect(master); return p; };
  A.tone = (f, d = 0.15, v = 0.2, type = 'triangle', pan = 0, f2) => { if (!A.on || !A.ensure()) return; const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + d); o.connect(g); g.connect(out(pan)); o.start(t); o.stop(t + d + 0.02); };
  A.noise = (d = 0.2, v = 0.2, f = 1200, q = 1, pan = 0, f2) => { if (!A.on || !A.ensure()) return; const t = ctx.currentTime, s = ctx.createBufferSource(), bp = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.setValueAtTime(f, t); if (f2) bp.frequency.exponentialRampToValueAtTime(f2, t + d); bp.Q.value = q; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0008, t + d); s.connect(bp); bp.connect(g); g.connect(out(pan)); s.start(t, Math.random() * 0.5); s.stop(t + d + 0.02); };
  A.whoosh = () => A.noise(0.28, 0.22, 600, 1.2, 0, 2400);
  A.clang = (pan = 0, k = 1) => { A.tone(1350 * rr(0.9, 1.1), 0.22, 0.12 * k, 'square', pan); A.tone(2100 * rr(0.9, 1.1), 0.3, 0.07 * k, 'triangle', pan); A.noise(0.12, 0.18 * k, 4200, 2, pan); };
  A.thunk = (pan = 0) => { A.tone(170, 0.18, 0.35, 'sine', pan, 70); A.noise(0.08, 0.25, 500, 1, pan); };
  A.thud = (pan = 0) => { A.tone(110, 0.12, 0.18, 'sine', pan, 60); A.noise(0.06, 0.1, 300, 1, pan); };
  A.netHit = () => A.noise(0.18, 0.1, 900, 0.8);
  A.cheer = () => { for (let i = 0; i < 5; i++) setTimeout(() => A.noise(0.35, 0.09, rr(900, 2200), 0.6), i * 70); [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => A.tone(f, 0.22, 0.13, 'triangle'), i * 90)); };
  A.bell = () => { A.tone(988, 0.9, 0.18, 'sine'); A.tone(1976, 0.6, 0.06, 'sine'); };
  A.tick = (f, pan) => A.tone(f, 0.06, 0.07, 'sine', pan);
  A.beep = (f = 660) => A.tone(f, 0.12, 0.14, 'square');
  return A;
}

// ---------- online transport: engine/duel-net.js if the repo has it, else a same-browser test channel (tabs) ----------
async function connectNet(o) {
  try { const m = await import(new URL('../../engine/duel-net.js', import.meta.url).href); if (m && m.connectDuel) return await m.connectDuel(o); } catch (e) {}
  // fallback: BroadcastChannel between tabs of this browser (for testing without duel-net.js)
  const id = Math.random().toString(36).slice(2, 10); let bc = null;
  try { bc = new BroadcastChannel('8g-duel-' + o.game + '-' + o.code); } catch (e) { setTimeout(() => o.onStatus && o.onStatus('offline'), 0); return { id, send() {}, leave() {} }; }
  bc.onmessage = ev => { const m = ev.data; if (!m || m.from === id || (m.to && m.to !== id)) return; o.onMsg && o.onMsg(m.t, m.d, m.from); };
  setTimeout(() => o.onStatus && o.onStatus('local'), 0);
  return { id, send(t, d, to) { try { bc.postMessage({ from: id, to: to || null, t, d }); } catch (e) {} }, leave() { try { bc.close(); } catch (e) {} } };
}

export async function createCoconutShy({ container, onState, opts = {} }) {
  const touch = matchMedia('(pointer: coarse)').matches, CW = () => container.clientWidth || 1, CHh = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: !touch }); renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1.75 : 2)); renderer.setSize(CW(), CHh());
  renderer.shadowMap.enabled = !touch; renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#1c1226'); scene.fog = new THREE.Fog('#1c1226', 9, 22);
  const camera = new THREE.PerspectiveCamera(50, CW() / CHh(), 0.05, 60);
  const grad = makeGradient(), cache = new Map(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.04, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.02, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const kit = foxKit({ THREE, scene, toon, M, grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M, toon, makeFox: kit.makeFox }, rigs);
  const audio = makeAudio();

  // ---------- light ----------
  scene.add(new THREE.HemisphereLight(0xffe9c8, 0x40284a, 1.05));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.5); sun.position.set(2, 6, 3); sun.target.position.set(0, 0.5, -3); scene.add(sun.target); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 1, far: 14 }); scene.add(sun);
  const warm = new THREE.PointLight(0xffb45a, 1.4, 9, 1.4); warm.position.set(0, 2.6, -2.6); scene.add(warm);

  // ---------- textures ----------
  // canvas text needs the real face loaded first, or it silently falls back to a wider font and overruns its box
  try { await Promise.race([Promise.all(['900 64px Archivo', '800 64px Archivo'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 1500))]); } catch (e) {}
  const FONT = (wt, px) => wt + ' ' + px + 'px "Archivo","Arial Black",Arial,sans-serif';
  // largest size (<= maxPx) at which txt fits inside maxW, measured with the real face
  const fitPx = (g, txt, wt, maxPx, maxW, track = 0) => { let px = maxPx; for (; px > 8; px -= 2) { g.font = FONT(wt, px); if (g.measureText(txt).width + track * Math.max(0, txt.length - 1) <= maxW) break; } return px; };
  const setTrack = (g, px) => { try { g.letterSpacing = px + 'px'; } catch (e) {} };
  const stripes = (a, b, n = 8, w = 256, h = 256, rep) => canvasTex(w, h, (g, W, H) => { for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect(i * W / n, 0, W / n + 1, H); } g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(0, H - 10, W, 10); }, rep);
  const woodTex = canvasTex(256, 256, (g, W, H) => { g.fillStyle = '#7a4a2a'; g.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#86542f' : '#6f4325'; g.fillRect(0, i * 32, W, 30); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, i * 32 + 30, W, 2); for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(40,20,8,0.18)'; g.fillRect(Math.random() * W, i * 32 + Math.random() * 28, rr(20, 90), 1); } } }, [3, 4]);
  const SIGN_W = 1024, SIGN_H = 320;
  const signTex = canvasTex(SIGN_W, SIGN_H, (g, W, H) => {
    const rim = 22, pad = 64;
    g.fillStyle = '#1a1626'; g.fillRect(0, 0, W, H);                       // ink board
    g.fillStyle = '#ffd23a'; g.fillRect(rim, rim, W - 2 * rim, H - 2 * rim);  // yellow face
    g.strokeStyle = '#ec3013'; g.lineWidth = 6; g.strokeRect(rim + 12, rim + 12, W - 2 * rim - 24, H - 2 * rim - 24); // inner red pinline
    // marquee bulbs around the rim
    const bulb = (x, y, k) => { g.fillStyle = k % 2 ? '#ffb45a' : '#fff4c2'; g.beginPath(); g.arc(x, y, 6.5, 0, 7); g.fill(); };
    let k = 0; for (let x = 40; x <= W - 40; x += 48) { bulb(x, rim / 2, k); bulb(x, H - rim / 2, k + 1); k++; }
    for (let y = 56; y <= H - 56; y += 48) { bulb(rim / 2, y, k); bulb(W - rim / 2, y, k + 1); k++; }
    // title, fitted inside the pinline with a generous margin
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1a1626';
    setTrack(g, 2); const tp = fitPx(g, 'COCONUT SHY', '900', 132, W - 2 * (rim + pad), 2); g.font = FONT('900', tp); g.fillText('COCONUT SHY', W / 2, H * 0.42);
    // red ribbon with the subtitle
    const rw = Math.min(W - 2 * (rim + pad + 40), 620), rh = 58, ry = H * 0.74;
    g.fillStyle = '#ec3013'; g.fillRect(W / 2 - rw / 2, ry - rh / 2, rw, rh);
    g.beginPath(); g.moveTo(W / 2 - rw / 2, ry - rh / 2); g.lineTo(W / 2 - rw / 2 - 26, ry); g.lineTo(W / 2 - rw / 2, ry + rh / 2); g.fill();
    g.beginPath(); g.moveTo(W / 2 + rw / 2, ry - rh / 2); g.lineTo(W / 2 + rw / 2 + 26, ry); g.lineTo(W / 2 + rw / 2, ry + rh / 2); g.fill();
    setTrack(g, 6); const sp = fitPx(g, 'TIN CAN ALLEY', '900', 36, rw - 2 * 36, 6); g.font = FONT('900', sp); g.fillStyle = '#ffffff'; g.fillText('TIN CAN ALLEY', W / 2, ry + 2); setTrack(g, 0);
  });
  const netTex = canvasTex(128, 128, (g, W, H) => { g.clearRect(0, 0, W, H); g.strokeStyle = 'rgba(255,240,220,0.55)'; g.lineWidth = 3; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, H); g.stroke(); g.beginPath(); g.moveTo(0, i * 16); g.lineTo(W, i * 16); g.stroke(); } }, [10, 6]);
  const canLabels = [['#ec3013', '#ffffff', 'FOX'], ['#38bdf8', '#0b1430', 'BEAN'], ['#22c55e', '#ffffff', 'PEA'], ['#ffd23a', '#1a1626', '8']].map(([bg, fg, t]) => canvasTex(512, 196, (g, W, H) => {
    const rim = 16;
    g.fillStyle = '#c8ccd4'; g.fillRect(0, 0, W, H);                                   // tin
    g.fillStyle = 'rgba(26,22,38,0.28)'; g.fillRect(0, 6, W, 3); g.fillRect(0, H - 9, W, 3); // rim ridges
    g.fillStyle = bg; g.fillRect(0, rim, W, H - 2 * rim);                                 // paper label
    g.fillStyle = fg; g.globalAlpha = 0.45; g.fillRect(0, rim + 10, W, 4); g.fillRect(0, H - rim - 14, W, 4); g.globalAlpha = 1; // pinstripes
    g.textAlign = 'center'; g.textBaseline = 'middle';
    // the word sits on u = 0.25 and 0.75 (front and back once the can is turned to face you), within a quarter turn so it never wraps out of view
    const isBadge = t.length === 1, px = isBadge ? 84 : Math.min(...['FOX', 'BEAN', 'PEA'].map(w => fitPx(g, w, '900', 70, W * 0.3 - 20)));
    for (const cx of [W * 0.25, W * 0.75]) {
      if (isBadge) { g.lineWidth = 6; g.strokeStyle = fg; g.beginPath(); g.arc(cx, H / 2, 54, 0, 7); g.stroke(); }
      g.fillStyle = fg; g.font = FONT('900', px); g.fillText(t, cx, H / 2 + 3);
    }
    // small stars on the sides, between the two words
    g.fillStyle = fg; g.globalAlpha = 0.6; for (const cx of [0, W * 0.5, W]) { g.save(); g.translate(cx, H / 2); g.rotate(Math.PI / 4); g.fillRect(-7, -7, 14, 14); g.restore(); } g.globalAlpha = 1;
  }));
  const ringTex = canvasTex(128, 128, (g) => { g.strokeStyle = '#ffd23a'; g.lineWidth = 10; g.beginPath(); g.arc(64, 64, 52, 0, 7); g.stroke(); g.strokeStyle = '#1a1626'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 58, 0, 7); g.stroke(); g.beginPath(); g.arc(64, 64, 45, 0, 7); g.stroke(); });

  // ---------- the stall ----------
  const tent = toon('#fff4e0', { map: stripes('#ec3013', '#fff4e0', 10, 256, 256, [2, 1]) });
  M(new THREE.PlaneGeometry(9, 12).rotateX(-Math.PI / 2), toon('#ffffff', { map: woodTex }), 0, 0, -1.5, null, 0);
  M(new THREE.BoxGeometry(0.12, 3.4, 6.2), tent, -WALLX - 0.06, 1.7, -2.6, null, 0); M(new THREE.BoxGeometry(0.12, 3.4, 6.2), tent, WALLX + 0.06, 1.7, -2.6, null, 0);
  M(new THREE.PlaneGeometry(4.8, 3.6), toon('#2a1a30'), 0, 1.8, -5.6, null, 0);
  const netM = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 3.0), new THREE.MeshBasicMaterial({ map: netTex, transparent: true, depthWrite: false, color: 0xffffff })); netM.position.set(0, 1.5, NETZ - 0.02); scene.add(netM);
  M(new THREE.PlaneGeometry(2.1, 2.1 * SIGN_H / SIGN_W), new THREE.MeshBasicMaterial({ map: signTex }), 0, 2.36, NETZ + 0.04, null, 0);
  // counter between you and the stall
  const ctrTex = stripes('#ec3013', '#fff4e0', 16, 512, 128);
  M(new THREE.BoxGeometry(4.5, 1.0, 0.5), [toon('#fff4e0', { map: ctrTex }), toon('#fff4e0', { map: ctrTex }), toon('#8a5632'), toon('#8a5632'), toon('#fff4e0', { map: ctrTex }), toon('#fff4e0', { map: ctrTex })], 0, 0.5, -0.4, null, 0.02);
  M(new THREE.BoxGeometry(4.7, 0.07, 0.62), toon('#a8693a'), 0, 1.03, -0.4, null, 0.015);
  // front frame + valance
  M(new THREE.BoxGeometry(0.16, 3.4, 0.16), toon('#ffd23a'), -WALLX - 0.08, 1.7, -0.62); M(new THREE.BoxGeometry(0.16, 3.4, 0.16), toon('#ffd23a'), WALLX + 0.08, 1.7, -0.62);
  M(new THREE.BoxGeometry(4.9, 0.55, 0.12), toon('#fff4e0', { map: stripes('#ec3013', '#fff4e0', 18, 512, 64) }), 0, 3.1, -0.62);
  // bunting: one merged mesh
  { const pos = [], col = [], cols = ['#ec3013', '#ffd23a', '#38bdf8', '#22c55e', '#f472b6', '#ffffff'].map(c => new THREE.Color(c)); const flag = (a, b, sag, n, y0) => { for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 0.8) / n, P = t => a.clone().lerp(b, t).add(V3(0, -Math.sin(t * Math.PI) * sag, 0)); const p0 = P(t0), p1 = P(t1), pm = P((t0 + t1) / 2).add(V3(0, -0.2, 0)); [p0, p1, pm].forEach(p => pos.push(p.x, p.y + y0, p.z)); const c = cols[i % cols.length]; for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b); } };
    flag(V3(-WALLX, 3.0, -0.7), V3(WALLX, 3.0, -0.7), 0.2, 16, 0); flag(V3(-WALLX + 0.02, 2.9, -0.8), V3(-WALLX + 0.02, 2.9, -5.0), 0.3, 12, 0); flag(V3(WALLX - 0.02, 2.9, -0.8), V3(WALLX - 0.02, 2.9, -5.0), 0.3, 12, 0);
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); scene.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }))); }
  // bulbs
  const bulbG = new THREE.SphereGeometry(0.045, 8, 6), bulbs = [];
  for (let i = 0; i < 14; i++) { const t = i / 13, b = new THREE.Mesh(bulbG, new THREE.MeshBasicMaterial({ color: i % 2 ? 0xffe08a : 0xffffff })); b.position.set(-WALLX + t * WALLX * 2, 2.84 - Math.sin(t * Math.PI) * 0.14, -0.68); scene.add(b); bulbs.push(b); }
  // prizes hanging on the side walls
  const plushCols = ['#f2741f', '#38bdf8', '#f472b6', '#ffd23a', '#22c55e', '#a78bfa', '#ffffff', '#ec3013'];
  for (let i = 0; i < 8; i++) { const side = i < 4 ? -1 : 1, k = i % 4, g = new THREE.Group(); g.position.set(side * (WALLX - 0.18), 1.75 + (k % 2) * 0.5, -1.2 - k * 0.95); g.rotation.y = -side * Math.PI / 2; scene.add(g); const c = toon(plushCols[i]); M(new THREE.SphereGeometry(0.2, 12, 10), c, 0, 0, 0, g, 0.02, 0.2); M(new THREE.SphereGeometry(0.15, 12, 10), c, 0, 0.27, 0.02, g, 0.02, 0.15); M(new THREE.ConeGeometry(0.06, 0.14, 8), c, -0.08, 0.42, 0, g, 0.012); M(new THREE.ConeGeometry(0.06, 0.14, 8), c, 0.08, 0.42, 0, g, 0.012); M(new THREE.SphereGeometry(0.02, 6, 4), toon('#1a1626'), -0.05, 0.29, 0.14, g, 0); M(new THREE.SphereGeometry(0.02, 6, 4), toon('#1a1626'), 0.05, 0.29, 0.14, g, 0); }

  // ---------- foxes: the thrower (THE CAST) + the barker (DRAFT) ----------
  const FOXDEF = [
    () => cast.make('player', { gear: 'none' }),
    () => cast.make('hope', { gear: 'none' }),
    () => cast.make('noble', { gear: 'none' }),
    () => kit.makeFox({ ...CAST.player, look: PLAYER_FEMALE, outfit: 'vest', torso: ['#22c55e', '#16a34a', '#0b1430'], crest: '', gear: 'none', mood: 'happy' }),
    () => kit.makeFox({ ...CAST.player, look: { ...KING_MIGHT, elder: 0 }, outfit: 'vest', torso: ['#f472b6', '#db2777', '#1a1626'], crest: '', gear: 'none', mood: 'happy' }),
  ];
  const foxes = []; const foxOf = i => { i = i % FOXDEF.length; if (!foxes[i]) { let f; try { f = FOXDEF[i](); } catch (e) { f = kit.makeFox({ ...CAST.player, gear: 'none' }); } const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.visible = false; f.userData.mood = 'happy'; scene.add(f); foxes[i] = f; } return foxes[i]; };
  const barker = kit.makeFox({ ...CAST.player, look: { ...PLAYER_MALE_SAFE(), fur: '#b45a22', furDark: '#7c3a12' }, outfit: 'vest', torso: ['#ec3013', '#ffffff', '#1a1626'], crest: '', gear: 'none', mood: 'happy' });
  function PLAYER_MALE_SAFE() { return { ...(CAST.player.look || {}) }; }
  { const P = barker.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; }
  barker.position.set(-1.95, 0, -4.85); barker.rotation.y = 0.55; scene.add(barker);
  // striped boater hat for the barker
  { const h = new THREE.Group(); M(new THREE.CylinderGeometry(0.24, 0.24, 0.025, 20), toon('#ffe9a8'), 0, 0, 0, h, 0.01); M(new THREE.CylinderGeometry(0.15, 0.15, 0.1, 20), toon('#ffe9a8'), 0, 0.06, 0, h, 0.01); M(new THREE.CylinderGeometry(0.152, 0.152, 0.035, 20), toon('#ec3013'), 0, 0.04, 0, h, 0); const head = barker.userData.P.head; if (head) { h.position.set(0, 0.55, -0.02); h.rotation.x = -0.12; head.add(h); } }

  // ---------- targets ----------
  const canGeo = new THREE.CylinderGeometry(0.1, 0.1, CH, 16), canTop = toon('#d3d7de'), canMats = canLabels.map(t => [toon('#ffffff', { map: t }), canTop, canTop]);
  const cocoGeo = new THREE.SphereGeometry(KR, 14, 10), cocoMat = toon('#6b4423'), cocoEye = toon('#2a180c');
  const postMat = toon('#ffd23a'), cupMat = toon('#ec3013'), plankMat = toon('#ffffff', { map: woodTex });
  let world = new THREE.Group(); scene.add(world);
  let cans = [], cocos = [], planks = [], posts = [], groups = {};
  function clearWorld() { scene.remove(world); world = new THREE.Group(); scene.add(world); cans = []; cocos = []; planks = []; posts = []; groups = {}; }
  function addPlank(cx, y, z, w, d, moving) { const m = M(new THREE.BoxGeometry(w, 0.06, d), plankMat, cx, y - 0.03, z, world, 0.015); const pl = { cx, y, z, w, d, m, off: 0, vx: 0, moving: moving || null }; if (!moving) { M(new THREE.BoxGeometry(0.08, y, 0.08), postMat, cx - w / 2 + 0.15, y / 2, z, world, 0.01); M(new THREE.BoxGeometry(0.08, y, 0.08), postMat, cx + w / 2 - 0.15, y / 2, z, world, 0.01); } else { M(new THREE.BoxGeometry(4.2, 0.08, 0.1), toon('#3a3836'), 0, y - 0.1, z + d / 2 + 0.02, world, 0.01); M(new THREE.BoxGeometry(0.08, y - 0.1, 0.08), postMat, -2.05, (y - 0.1) / 2, z + d / 2 + 0.02, world, 0.01); M(new THREE.BoxGeometry(0.08, y - 0.1, 0.08), postMat, 2.05, (y - 0.1) / 2, z + d / 2 + 0.02, world, 0.01); } planks.push(pl); return pl; }
  function addPyramid(pl, cx, rows, gid, rnd) { const ids = []; groups[gid] = { ids, cleared: false }; const base = cans.length; let idx = 0; const rowStart = [];
    for (let r = 0; r < rows; r++) { const n = rows - r; rowStart.push(cans.length); for (let c = 0; c < n; c++) { const hx = cx + (c - (n - 1) / 2) * 0.212, hy = pl.y + CH / 2 + r * (CH + 0.002); const mesh = M(canGeo, canMats[Math.floor(rnd() * canMats.length)], hx, hy, pl.z, world, 0.012, 0.1); mesh.rotation.y = -Math.PI / 2 + (rnd() < 0.5 ? 0 : Math.PI) + (rnd() - 0.5) * 0.7; const can = { mesh, home: V3(hx, hy, pl.z), p: V3(hx, hy, pl.z), v: V3(), w: V3(), dyn: false, knocked: false, rest: false, row: r, pl, gid, sup: [] }; if (r > 0) { for (let j = rowStart[r - 1]; j < rowStart[r - 1] + n + 1; j++) if (Math.abs(cans[j].home.x - hx) < 0.15) can.sup.push(j); } cans.push(can); ids.push(cans.length - 1); idx++; } } return ids; }
  function addCoco(x, top, z, rnd) { const post = { x, z, top }; M(new THREE.CylinderGeometry(0.035, 0.045, top, 8), postMat, x, top / 2, z, world, 0.01); M(new THREE.CylinderGeometry(0.085, 0.05, 0.07, 12, 1, true), cupMat, x, top - 0.01, z, world, 0.01); posts.push(post);
    const mesh = M(cocoGeo, cocoMat, x, top + KR - 0.04, z, world, 0.015, KR); [[-0.05, 0.05], [0.05, 0.05], [0, -0.02]].forEach(([ex, ey]) => M(new THREE.SphereGeometry(0.024, 6, 4), cocoEye, ex, ey, KR - 0.012, mesh, 0));
    const ck = { mesh, home: V3(x, top + KR - 0.04, z), p: V3(x, top + KR - 0.04, z), v: V3(), spin: V3(), st: 'sit', grip: 7.0 + rnd() * 3.0, wob: 0, wobV: 0, knocked: false, post }; cocos.push(ck); return ck; }
  let rndRound = mulberry(1);
  function buildRound(ri, seed) { clearWorld(); const rnd = rndRound = mulberry((seed || 1) * 31 + ri * 977); const R = ROUNDS[ri];
    if (R.id === 'cans') { const pl = addPlank(0, SHELF_Y, TZ, 3.7, 0.42); addPyramid(pl, -1.12, 3, 'A', rnd); addPyramid(pl, 0, 3, 'B', rnd); addPyramid(pl, 1.12, 3, 'C', rnd); }
    else if (R.id === 'coco') { const xs = [-1.45, -0.72, 0, 0.72, 1.45], tops = [1.1, 1.3, 1.0, 1.3, 1.1]; xs.forEach((x, i) => addCoco(x, tops[i] + (rnd() - 0.5) * 0.08, TZ - 0.1, rnd)); }
    else { const pl = addPlank(0, SHELF_Y, TZ + 0.2, 1.05, 0.42, { amp: 1.05, w: 0.95 + rnd() * 0.2, ph: rnd() * 6.28 }); addPyramid(pl, 0, 4, 'M', rnd); addCoco(-1.5, 1.55, TZ - 0.45, rnd); addCoco(1.5, 1.55, TZ - 0.45, rnd); }
    planks.forEach(pl => updPlank(pl, 0)); }
  function updPlank(pl, t) { if (!pl.moving) return; const { amp, w, ph } = pl.moving, o = amp * Math.sin(w * t + ph); pl.vx = amp * w * Math.cos(w * t + ph); pl.off = o; pl.m.position.x = pl.cx + o; }
  const canPos = (c, out) => c.dyn ? out.copy(c.p) : out.set(c.home.x + c.pl.off, c.home.y, c.home.z);

  // ---------- balls + aim visuals ----------
  const ballGeo = new THREE.SphereGeometry(BR, 14, 10), ballMat = toon('#f6f1e6'), seamMat = toon('#ec3013');
  const mkBall = parent => { const m = M(ballGeo, ballMat, 0, 0, 0, parent || scene, 0.012, BR); const s = new THREE.Mesh(new THREE.TorusGeometry(BR * 0.98, 0.008, 4, 20), seamMat); s.rotation.y = 0.6; m.add(s); return m; };
  const balls = []; for (let i = 0; i < 10; i++) { const m = mkBall(); m.visible = false; balls.push({ m, p: V3(), v: V3(), alive: false, t: 0, th: null, idle: 0 }); }
  const handBall = mkBall(); handBall.visible = false; handBall.scale.setScalar(0.7);
  const dotMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false }), 60); dotMesh.count = 0; dotMesh.frustumCulled = false; dotMesh.renderOrder = 5; scene.add(dotMesh);
  const ring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex, depthTest: false, transparent: true })); ring.visible = false; ring.renderOrder = 6; scene.add(ring);
  // floating "+10" pops
  const POP_W = 512, POP_H = 144, POP_SY = 0.21;
  const popTex = new Map(), pops = []; const popT = (txt, col) => { const k = txt + col; if (!popTex.has(k)) popTex.set(k, canvasTex(POP_W, POP_H, (g, W, H) => { const stroke = 14, px = fitPx(g, txt, '900', 96, W - 2 * (28 + stroke)); g.font = FONT('900', px); g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = stroke; g.strokeStyle = '#1a1626'; g.strokeText(txt, W / 2, H / 2 + 2); g.fillStyle = col; g.fillText(txt, W / 2, H / 2 + 2); })); return popTex.get(k); };
  for (let i = 0; i < 8; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false })); s.visible = false; s.renderOrder = 7; s.scale.set(POP_SY * POP_W / POP_H, POP_SY, 1); scene.add(s); pops.push({ s, life: 0 }); } let popI = 0;
  const pop = (p, txt, col = '#ffd23a') => { const q = pops[popI = (popI + 1) % pops.length]; q.s.material.map = popT(txt, col); q.s.material.needsUpdate = true; const at = p.clone().add(V3(0, 0.2, 0));
    // lift above any pop still on screen nearby, so "+10 +10" never print over each other
    for (let n = 0; n < 6; n++) { const hit = pops.some(o => o !== q && o.life > 0.25 && Math.abs(o.s.position.x - at.x) < 0.55 && Math.abs(o.s.position.y - at.y) < POP_SY * 0.95 && Math.abs(o.s.position.z - at.z) < 0.6); if (!hit) break; at.y += POP_SY; }
    q.s.position.copy(at); q.s.visible = true; q.life = 1; };

  // ---------- state ----------
  const qs = new URLSearchParams(location.search);
  const S = { phase: 'intro', mode: 'solo', players: [], cur: 0, round: 0, score: 0, balls: 0, streak: 0, thrown: 0, throws: [], t: 0, endT: 0, flash: null, flashT: 0, say: '', sayT: 0, aim: null, cool: 0, aimHelp: true, seed: 1, rows: null, roundCard: null, done: null, demo: null, count: null, t0: 0, hintN: 0, lastHit: null, pyr: 0, cocoN: 0, canN: 0, leftBonus: 0 };
  try { const st = JSON.parse(localStorage.getItem('coconutShy.settings') || '{}'); if (st.aimHelp === false) S.aimHelp = false; if (st.sound === false) audio.on = false; } catch (e) {}
  const saveSettings = () => { try { localStorage.setItem('coconutShy.settings', JSON.stringify({ aimHelp: S.aimHelp, sound: audio.on })); } catch (e) {} };
  const say = (k, force) => { if (!force && S.sayT > 0 && Math.random() < 0.5) return; S.say = Array.isArray(k) ? pick(k) : pick(SAY[k] || [k]); S.sayT = 3.2; };
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; };
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const player = () => S.players[S.cur] || { name: 'YOU', col: '#ec3013', scores: [] };

  // ---------- throwing ----------
  const launchVel = (yaw, p, out) => { const e = -0.06 + p * 0.44, s = 8.2 + p * 3.8; return out.set(Math.cos(e) * Math.sin(yaw) * s, Math.sin(e) * s, -Math.cos(e) * Math.cos(yaw) * s); };
  const tv = V3(), tp = V3(), tq = V3(), tc = V3();
  // predicted flight against what is standing now: returns { pts, hit } (hit = a can/coconut it would strike first)
  function predict(yaw, p, maxPts = 60) { launchVel(yaw, p, tv); tp.copy(SPAWN); const pts = [], h = 1 / 60; let hit = null;
    for (let i = 0; i < 130; i++) { tv.y -= G * h; tp.addScaledVector(tv, h); if (i % 2 === 0 && pts.length < maxPts) pts.push(tp.clone());
      for (const c of cans) { if (c.knocked) continue; canPos(c, tc); if (tc.distanceToSquared(tp) < (BR + CR) ** 2) { hit = { kind: 'can', o: c, p: tc.clone() }; break; } }
      if (!hit) for (const k of cocos) { if (k.st !== 'sit') continue; if (k.p.distanceToSquared(tp) < (BR + KR) ** 2) { hit = { kind: 'coco', o: k, p: k.p.clone() }; break; } }
      if (hit || tp.y < BR || tp.z < NETZ) break;
      let onPl = false; for (const pl of planks) { const x0 = pl.cx + pl.off - pl.w / 2, x1 = x0 + pl.w; if (tp.x > x0 && tp.x < x1 && Math.abs(tp.z - pl.z) < pl.d / 2 && tp.y < pl.y + BR && tp.y > pl.y - 0.1) onPl = true; } if (onPl) break; }
    return { pts, hit, end: tp.clone() }; }
  function aimFrom(dx, dy) { const L = Math.max(CHh() * 0.36, 150), p = clamp(-dy / L, 0, 1), yaw = yaw0 + clamp(Math.atan2(dx, Math.max(-dy, 1)), -0.9, 0.9) * 0.5; return { yaw, p }; }
  function canThrow() { return (S.phase === 'play' || S.phase === 'demo') && S.balls > 0 && S.cool <= 0 && !S.endT; }
  function throwBall(yaw, p) { if (!canThrow() || p < 0.06) return false; const b = balls.find(x => !x.alive) || balls[0]; b.alive = true; b.t = 0; b.idle = 0; b.p.copy(SPAWN); launchVel(yaw, p, b.v); b.m.visible = true; b.m.position.copy(b.p);
    const resolved = S.throws.filter(t => t.res); const mult = 1 + 0.5 * Math.min(S.streak, 2); const th = { ball: b, hits: 0, mult, res: false, deadT: 0 }; b.th = th; S.throws.push(th); S.lastTh = th;
    S.balls--; S.thrown++; S.cool = 0.45; S.hintN++; audio.whoosh(); const f = curFox(); if (f) f.userData.throwT = 0.4; changed(); sendSnap(); return true; }
  const curFox = () => (S.players[S.cur] && S.players[S.cur].fox != null) ? foxOf(S.players[S.cur].fox) : null;

  // ---------- scoring ----------
  function credit(kind, pos) { const th = S.lastTh, mult = th ? th.mult : 1, add = Math.round(PTS[kind] * mult); S.score += add; if (th) th.hits++; pop(pos, '+' + add, kind === 'coco' ? '#ffd23a' : '#ffffff');
    if (kind === 'coco') { S.cocoN++; flash('COCONUT! +' + add, '#ffd23a'); say('coco', true); audio.cheer(); buzz(60); } else { S.canN++; buzz(15); }
    changed(); sendSnap(); }
  function checkGroups() { for (const gid in groups) { const g = groups[gid]; if (g.cleared) continue; if (g.ids.every(i => cans[i].knocked)) { g.cleared = true; S.pyr++; const th = S.lastTh, add = Math.round(PTS.pyramid * (th ? th.mult : 1)); S.score += add; flash('PYRAMID DOWN +' + add, '#22c55e'); audio.cheer(); const c = cans[g.ids[g.ids.length - 1]]; pop(c.home.clone().add(V3(c.pl.off, 0.3, 0)), 'CLEAR', '#22c55e'); changed(); sendSnap(); } } }
  const allDown = () => cans.every(c => c.knocked) && cocos.every(k => k.knocked);

  // ---------- physics ----------
  const tn = V3();
  function wake(c, vx = 0) { if (c.dyn) return; c.dyn = true; c.p.set(c.home.x + c.pl.off, c.home.y, c.home.z); c.v.set(vx + c.pl.vx * 0.6, 0, 0); c.rest = false; }
  function surfaces(p, r, v) { // shelves: land on top
    for (const pl of planks) { const x0 = pl.cx + pl.off - pl.w / 2, x1 = x0 + pl.w; if (p.x > x0 - 0.02 && p.x < x1 + 0.02 && Math.abs(p.z - pl.z) < pl.d / 2 + 0.02 && p.y - r < pl.y && p.y > pl.y - 0.12 && v.y <= 0) { p.y = pl.y + r; return pl; } } return null; }
  function walls(p, v, r, e = 0.3) { if (p.y < r) { p.y = r; if (v.y < 0) v.y = -v.y * e; v.x *= 0.82; v.z *= 0.82; return 'floor'; } let w = null; if (p.z < NETZ + r) { p.z = NETZ + r; if (v.z < 0) { v.z = -v.z * 0.12; v.x *= 0.4; v.y *= 0.5; w = 'net'; } } if (p.x < -WALLX + r) { p.x = -WALLX + r; v.x = Math.abs(v.x) * 0.4; } if (p.x > WALLX - r) { p.x = WALLX - r; v.x = -Math.abs(v.x) * 0.4; } if (p.z > -0.62 - r && p.z < -0.1 && p.y < 1.06 + r && v.z > 0) { p.z = -0.62 - r; v.z = -v.z * 0.3; } return w; }
  function step(h) {
    S.t += h; planks.forEach(pl => updPlank(pl, S.t));
    for (const b of balls) { if (!b.alive) continue; b.t += h; b.v.y -= G * h; b.p.addScaledVector(b.v, h);
      for (const c of cans) { canPos(c, tc); tn.subVectors(tc, b.p); const d = tn.length(); if (d < BR + CR && d > 1e-4) { tn.divideScalar(d); const rel = b.v.dot(tn) - (c.dyn ? c.v.dot(tn) : 0); if (rel > 0) { const mb = 1, mc = 0.42, j = 1.45 * rel / (1 / mb + 1 / mc); if (!c.dyn) wake(c); b.v.addScaledVector(tn, -j / mb); c.v.addScaledVector(tn, j / mc); c.v.y += rel * 0.18; c.w.set(rr(-1, 1), rr(-1, 1), rr(-1, 1)).multiplyScalar(rel * 2.2); if (rel > 1.2) audio.clang(clamp(tc.x / 2, -1, 1), clamp(rel / 8, 0.4, 1.2)); } b.p.addScaledVector(tn, -(BR + CR - d)); } }
      for (const k of cocos) { tn.subVectors(k.p, b.p); const d = tn.length(); if (d < BR + KR && d > 1e-4) { tn.divideScalar(d); const rel = b.v.dot(tn) - (k.st === 'fall' ? k.v.dot(tn) : 0); if (rel > 0) { if (k.st === 'sit') { const power = rel * (0.35 + 0.65 * Math.max(0, -tn.z)); S.lastPower = power; b.v.addScaledVector(tn, -1.55 * rel); audio.thunk(clamp(k.p.x / 2, -1, 1)); if (power > k.grip) { k.st = 'fall'; k.v.copy(tn).multiplyScalar(rel * 0.42).add(V3(0, 0.9, 0)); k.spin.set(rr(-6, 6), rr(-3, 3), rr(-6, 6)); } else { k.grip = Math.max(4, k.grip - 0.8 - power * 0.12); k.wobV += (tn.x >= 0 ? 1 : -1) * power * 0.5 + 1.5; if (b.th) b.th.wob = true; pop(k.p, 'WOBBLE', '#ff9a8a'); say('wobble'); } } else { b.v.addScaledVector(tn, -1.2 * rel); k.v.addScaledVector(tn, rel * 0.4); } } b.p.addScaledVector(tn, -(BR + KR - d)); } }
      for (const po of posts) { const dx = b.p.x - po.x, dz = b.p.z - po.z, d = Math.hypot(dx, dz); if (d < BR + 0.04 && b.p.y < po.top && d > 1e-4) { const nx = dx / d, nz = dz / d, vn = b.v.x * nx + b.v.z * nz; if (vn < 0) { b.v.x -= 1.5 * vn * nx; b.v.z -= 1.5 * vn * nz; } b.p.x = po.x + nx * (BR + 0.04); b.p.z = po.z + nz * (BR + 0.04); } }
      const pl = surfaces(b.p, BR, b.v); if (pl) { if (b.v.y < -1.5) audio.thud(); b.v.y = -b.v.y * 0.35; b.v.x *= 0.85; b.v.z *= 0.85; }
      const w = walls(b.p, b.v, BR, 0.45); if (w === 'net' && b.t < 2) audio.netHit();
      if (b.p.y <= BR + 0.001 && b.v.lengthSq() < 0.2) b.idle += h; if (b.t > 3.2 || b.idle > 0.4) { b.alive = false; b.m.visible = false; if (b.th) b.th.deadT = S.t; } }
    // cans
    for (let i = 0; i < cans.length; i++) { const c = cans[i]; if (!c.dyn) { // supported?
        for (const j of c.sup) { const s = cans[j]; if (s.dyn && s.p.distanceTo(tc.set(s.home.x + s.pl.off, s.home.y, s.home.z)) > 0.035) { wake(c, rr(-0.2, 0.2)); break; } } continue; }
      if (c.rest) continue; c.v.y -= G * h; c.p.addScaledVector(c.v, h);
      const pl = surfaces(c.p, CH / 2, c.v); if (pl) { c.v.y = Math.abs(c.v.y) > 0.6 ? -c.v.y * 0.25 : 0; const f = 1 - 6 * h; c.v.x = (c.v.x - pl.vx) * f + pl.vx; c.v.z *= f; c.w.multiplyScalar(1 - 4 * h); }
      const w = walls(c.p, c.v, 0.1, 0.3); if (w === 'floor') { c.w.multiplyScalar(0.9); if (c.v.y > 0.5) audio.clang(clamp(c.p.x / 2, -1, 1), 0.35); }
      c.mesh.rotation.x += c.w.x * h; c.mesh.rotation.z += c.w.z * h;
      if ((w === 'floor') && c.v.lengthSq() < 0.03 && Math.abs(c.w.x) + Math.abs(c.w.z) < 0.5) { c.rest = true; }
      if (!c.knocked && (c.p.distanceTo(tc.set(c.home.x + c.pl.off, c.home.y, c.home.z)) > 0.16 || c.p.y < c.pl.y - 0.05)) { c.knocked = true; if (S.phase === 'play' || S.phase === 'demo') { credit('can', c.p); checkGroups(); } } }
    for (let i = 0; i < cans.length; i++) for (let j = i + 1; j < cans.length; j++) { const a = cans[i], b = cans[j]; if (!a.dyn && !b.dyn) continue; canPos(a, tc); canPos(b, tq); tn.subVectors(tq, tc); const d = tn.length(), md = CR * 1.9; if (d < md && d > 1e-4) { tn.divideScalar(d); const rel = (a.dyn ? a.v.dot(tn) : 0) - (b.dyn ? b.v.dot(tn) : 0);
      if (!a.dyn && rel < -0.35) wake(a); if (!b.dyn && rel > 0.35) wake(b);
      if (rel > 0) { const j2 = 1.25 * rel / ((a.dyn ? 1 : 0) + (b.dyn ? 1 : 0) || 1); if (a.dyn) a.v.addScaledVector(tn, -j2 * (b.dyn ? 0.5 : 1)); if (b.dyn) b.v.addScaledVector(tn, j2 * (a.dyn ? 0.5 : 1)); if (a.dyn && b.dyn) { a.rest = b.rest = false; } }
      const pen = md - d; if (a.dyn && b.dyn) { a.p.addScaledVector(tn, -pen / 2); b.p.addScaledVector(tn, pen / 2); } else if (a.dyn) a.p.addScaledVector(tn, -pen); else if (b.dyn) b.p.addScaledVector(tn, pen); } }
    // coconuts
    for (const k of cocos) { if (k.st === 'sit') { k.wobV += (-k.wob * 60 - k.wobV * 5) * h; k.wob += k.wobV * h; continue; } if (k.st === 'rest') continue; k.v.y -= G * h; k.p.addScaledVector(k.v, h); const w = walls(k.p, k.v, KR, 0.35); if (w === 'floor' && Math.abs(k.v.y) > 0.6) audio.thud(clamp(k.p.x / 2, -1, 1)); k.mesh.rotation.x += k.spin.x * h; k.mesh.rotation.z += k.spin.z * h; if (w === 'floor') k.spin.multiplyScalar(0.92);
      if (!k.knocked && k.p.y < k.post.top - 0.1) { k.knocked = true; if (S.phase === 'play' || S.phase === 'demo') credit('coco', k.p); }
      if (w === 'floor' && k.v.lengthSq() < 0.05) k.st = 'rest'; }
  }

  // ---------- camera fit (phone first: the whole stall fits in portrait and landscape) ----------
  const camLook = V3(0, 1.3, TZ), D = 6.2; let camMode = 'intro', camK = 0;
  const safe = { top: 0, bot: 0, left: 0 };
  function fit() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); placeCamera(); }
  // play: the whole stall (3.8 m wide, 2.2 m tall at the targets) fits between the HUD bars · intro: fox + barker fit beside/above the menu panel
  const IPOS = V3(0.3, 1.8, 5.6), ILOOK = V3(-0.3, 1.4, -1.2), PPOS = V3(0, 1.72, TZ + D), PLOOK = V3(0, 1.3, TZ), PLOOK_L = V3(0, 1.48, TZ); // landscape looks a touch higher so the stall sign stays on screen
  function placeCamera(dt) { const w = CW(), h = CHh(), asp = w / h;
    const port = asp < 1, sT = port ? safe.top : 0, sB = port ? safe.bot : 0, fh = clamp(1 - (sT + sB) / h, 0.45, 1), tP = Math.max((port ? 2.2 : 2.5) / 2 / D / fh, 3.8 / 2 / (D * asp));
    const dI = IPOS.distanceTo(ILOOK), fhI = clamp(1 - safe.bot / h, 0.35, 1), fwI = clamp(1 - safe.left / w, 0.35, 1), tI = Math.max(3.3 / 2 / dI / fhI, 4.0 / 2 / (dI * asp * fwI));
    const k = camMode === 'play' ? 1 : 0; camK = dt == null ? k : damp(camK, k, 3.2, dt); const e = smooth(camK);
    camera.position.lerpVectors(IPOS, PPOS, e); camLook.lerpVectors(ILOOK, port ? PLOOK : PLOOK_L, e); camera.fov = Math.atan(tI + (tP - tI) * e) * 360 / Math.PI;
    const offX = -(safe.left / 2) * (1 - e), offY = (safe.bot / 2) * (1 - e) + ((sB - sT) / 2) * e;
    camera.setViewOffset(w, h, offX, offY, w, h); camera.lookAt(camLook); camera.updateProjectionMatrix(); }
  const ro = new ResizeObserver(() => { fit(); placeCamera(); }); ro.observe(container);

  // ---------- input: swipe up to throw (touch + mouse), arrows + space on desktop ----------
  const el = renderer.domElement; let drag = null;
  el.addEventListener('pointerdown', e => { audio.ensure(); if (S.phase !== 'play' || S.demo) return; if (!canThrow()) return; drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY }; try { el.setPointerCapture(e.pointerId); } catch (er) {} S.aim = { yaw: yaw0, p: 0, src: 'drag' }; changed(); });
  el.addEventListener('pointermove', e => { if (!drag || e.pointerId !== drag.id) return; drag.x = e.clientX; drag.y = e.clientY; S.aim = { ...aimFrom(drag.x - drag.x0, drag.y - drag.y0), src: 'drag' }; });
  const up = e => { if (!drag || e.pointerId !== drag.id) return; const a = aimFrom(drag.x - drag.x0, drag.y - drag.y0); drag = null; S.aim = null; if (a.p > 0.08) throwBall(a.yaw, a.p); else changed(); };
  el.addEventListener('pointerup', up); el.addEventListener('pointercancel', e => { drag = null; S.aim = null; changed(); });
  const keys = {}; let kAim = null;
  const onKey = e => { if (S.phase !== 'play' || S.demo) return; const k = e.code; if (/^Arrow|Space/.test(k)) { e.preventDefault(); } if (e.type === 'keydown') { if (!kAim && /^Arrow/.test(k) && canThrow()) kAim = { yaw: yaw0, p: 0.5 }; keys[k] = true; if (k === 'Space' && kAim) { const a = kAim; kAim = null; S.aim = null; throwBall(a.yaw, a.p); } } else keys[k] = false; };
  addEventListener('keydown', onKey); addEventListener('keyup', onKey);

  // ---------- flow ----------
  function setupPlayers(mode, n) { S.mode = mode; S.players = []; const N = mode === 'solo' ? 1 : clamp(n, 2, MAX_PLAYERS); for (let i = 0; i < N; i++) S.players.push({ name: mode === 'solo' ? 'YOU' : NET_COLS[i][0], col: NET_COLS[i][1], fox: i, scores: [] }); }
  function startRound(ri) { S.round = ri; buildRound(ri, S.seed); S.score = 0; S.balls = ROUNDS[ri].balls; S.streak = 0; S.throws = []; S.lastTh = null; S.thrown = 0; S.endT = 0; S.cool = 0.3; S.t = 0; S.pyr = 0; S.cocoN = 0; S.canN = 0; S.leftBonus = 0; S.roundCard = null; balls.forEach(b => { b.alive = false; b.m.visible = false; }); }
  function showTurn() { S.phase = 'turn'; camMode = 'intro'; showFox(S.players[S.cur].fox); say('intro', true); changed(); }
  function showFox(i) { foxes.forEach(f => f && (f.visible = false)); if (i == null) return; const f = foxOf(i); f.visible = true; f.position.set(0.55, 0, 0.75); f.rotation.y = -0.15; f.userData.mood = 'happy'; f.userData.hop = 1; }
  function beginPlay() { startRound(S.round); S.phase = 'play'; camMode = 'play'; foxes.forEach(f => f && (f.visible = false)); flash(ROUNDS[S.round].name, '#ffd23a', 1.6); changed(); sendSnap(); }
  const api = {};
  api.start = (mode = 'solo', n = 2) => { if (S.demo) api.demoStop(true); netEndMatch(); setupPlayers(mode, n); S.seed = Math.floor(Math.random() * 1e9); S.cur = 0; S.round = 0; S.done = null; startRound(0); if (mode === 'pass') showTurn(); else beginPlay(); };
  api.beginTurn = () => { if (S.phase === 'turn') beginPlay(); };
  function endRound() { const P = player(), R = ROUNDS[S.round]; if (allDown() && S.balls > 0) { S.leftBonus = S.balls * PTS.ball; S.score += S.leftBonus; }
    P.scores[S.round] = S.score; const total = P.scores.reduce((a, b) => a + (b || 0), 0);
    S.roundCard = { round: S.round, name: R.name, score: S.score, total, rows: [[R.id === 'coco' ? 'Coconuts down' : 'Cans down', R.id === 'coco' ? S.cocoN + ' / ' + cocos.length : S.canN + ' / ' + cans.length + (cocos.length ? ' · ' + S.cocoN + ' coconut' + (S.cocoN === 1 ? '' : 's') : '')], ...(groups && Object.keys(groups).length ? [['Pyramids cleared', S.pyr + ' / ' + Object.keys(groups).length]] : []), ['Balls thrown', String(S.thrown)], ...(S.leftBonus ? [['Balls left bonus', '+' + S.leftBonus]] : [])], last: false, who: P.name, col: P.col };
    // who plays next?
    if (S.mode === 'pass') { if (S.cur < S.players.length - 1) { S.roundCard.next = { kind: 'turn', who: S.players[S.cur + 1].name }; } else if (S.round < ROUNDS.length - 1) S.roundCard.next = { kind: 'round', who: S.players[0].name }; else S.roundCard.next = { kind: 'done' }; }
    else S.roundCard.next = S.round < ROUNDS.length - 1 ? { kind: 'round' } : { kind: 'done' };
    S.roundCard.standings = S.mode === 'pass' ? S.players.map(p => ({ name: p.name, col: p.col, v: p.scores.reduce((a, b) => a + (b || 0), 0), me: p === P })).sort((a, b) => b.v - a.v) : null;
    S.phase = 'round'; S.autoT = S.mode === 'online' ? 4 : 0; audio.bell(); sendSnap(); changed(); }
  api.next = () => { if (S.phase !== 'round' || !S.roundCard) return; const nx = S.roundCard.next; S.roundCard = null;
    if (nx.kind === 'turn') { S.cur++; startRound(S.round); showTurn(); }
    else if (nx.kind === 'round') { S.cur = 0; S.round++; startRound(S.round); if (S.mode === 'pass') showTurn(); else beginPlay(); }
    else finish(); };
  function finish() { const P = player(), sum = p => p.scores.reduce((a, b) => a + (b || 0), 0); S.phase = 'done'; camMode = 'intro';
    if (S.mode === 'pass') { const st = S.players.map(p => ({ name: p.name, col: p.col, v: sum(p), fox: p.fox })).sort((a, b) => b.v - a.v); showFox(st[0].fox); const w = st[0]; S.done = { kind: 'pass', title: w.name + ' WINS', sub: 'Pass & play · ' + S.players.length + ' players', standings: st, total: w.v, grade: '1ST', prize: prizeFor(w.v) }; audio.cheer(); changed(); return; }
    const total = sum(P), prize = prizeFor(total), gold = Math.floor(total / 10); let newBest = false;
    try { newBest = save.best(GAME + '.best', total); save.setStat(GAME + '.plays', save.stat(GAME + '.plays') + 1); save.setFlag(GAME + '.played'); if (gold) save.addGold(gold); if (prize) { save.give(prize.id, 1); if (prize.id === 'coconutShyGiantPlush') save.setFlag(GAME + '.giantPlush'); } save.addXp(Math.floor(total / 25)); } catch (e) {}
    showFox(P.fox != null ? P.fox : 0); say('done', true); audio.cheer();
    S.done = { kind: S.mode, title: prize ? prize.name : 'NO PRIZE THIS TIME', sub: (newBest ? 'NEW BEST' : 'BEST ' + bestScore()) + (gold ? ' · +' + gold + ' GOLD' : ''), total, grade: grade(total), prize, rows: ROUNDS.map((r, i) => [r.name, String(P.scores[i] || 0)]), gold, newBest };
    if (S.mode === 'online') { NT.fin = true; sendSnap(true); S.done.online = true; netCheckEnd(); }
    changed(); }
  const prizeFor = t => PRIZES.find(p => t >= p.min) || null;
  const grade = t => t >= 750 ? 'S' : t >= 600 ? 'A' : t >= 400 ? 'B' : t >= 200 ? 'C' : 'D';
  const bestScore = () => { try { return save.stat(GAME + '.best'); } catch (e) { return 0; } };
  api.toIntro = () => { if (S.demo) api.demoStop(true); netEndMatch(); S.phase = 'intro'; S.done = null; S.roundCard = null; camMode = 'intro'; showFox(0); S.players = []; S.cur = 0; startRound(0); say('intro', true); changed(); };
  api.setAimHelp = v => { S.aimHelp = v == null ? !S.aimHelp : !!v; saveSettings(); changed(); };
  api.setSound = v => { audio.on = v == null ? !audio.on : !!v; saveSettings(); if (audio.on) audio.beep(880); changed(); };
  api.setSafe = (top, bot, left) => { Object.assign(safe, { top, bot, left }); };

  // ---------- demo: the stall shows you how (finger drawn by the page) ----------
  const DEMO_CAPS = ['Put your thumb anywhere on the stall.', 'Swipe UP toward a pyramid and let go.', 'Longer swipe = higher, harder throw.', 'Swipe a little sideways to aim left or right.', 'Knock every can off for a bonus.'];
  api.demoStart = () => { if (S.mode === 'online' && NT.on) return; setupPlayers('solo'); S.seed = 7; S.cur = 0; startRound(0); S.phase = 'demo'; camMode = 'play'; foxes.forEach(f => f && (f.visible = false)); S.demo = { n: 0, of: 5, cap: DEMO_CAPS[0], t: 0, fx: 50, fy: 78, show: false, plan: null, i: 0 }; changed(); };
  api.demoStop = quiet => { if (!S.demo) return; S.demo = null; S.aim = null; if (!quiet) api.toIntro(); };
  function demoSolve() { const live = cans.filter(c => !c.knocked); if (!live.length) return null; const c = live.reduce((a, b) => (b.row < a.row || (b.row === a.row && Math.abs(b.home.x) < Math.abs(a.home.x))) ? b : a, live[0]); canPos(c, tc); const yaw = Math.atan2(tc.x - SPAWN.x, SPAWN.z - tc.z) + rr(-0.01, 0.01); let best = null; for (let p = 0.25; p <= 1; p += 0.02) { const r = predict(yaw, p); if (r.hit && r.hit.o === c) { best = { yaw, p }; break; } } return best || { yaw, p: 0.6 }; }
  function demoTick(dt) { const D0 = S.demo; D0.t += dt; const L = Math.max(CHh() * 0.36, 150);
    if (!D0.plan) { if (D0.t < 0.6) return; D0.plan = demoSolve(); D0.t = 0; D0.i++; D0.n = Math.min(D0.i, D0.of); D0.cap = DEMO_CAPS[Math.min(D0.i - 1, DEMO_CAPS.length - 1)]; if (!D0.plan || S.balls <= 0) { api.demoStop(); return; } }
    const pl = D0.plan, dy = -pl.p * L, dx = -dy * Math.tan((pl.yaw - yaw0) / 0.5), k = clamp((D0.t - 0.5) / 1.0, 0, 1), e = smooth(k);
    D0.show = true; D0.fx = 50 + (dx * e) / CW() * 100; D0.fy = 80 + (dy * e) / CHh() * 100; if (k > 0 && k < 1) S.aim = { yaw: yaw0 + (pl.yaw - yaw0) * Math.min(1, e * 1.2), p: pl.p * e, src: 'demo' };
    if (D0.t > 1.6 && !D0.thrown) { D0.thrown = true; S.aim = null; S.cool = 0; throwBall(pl.yaw, pl.p); }
    if (D0.t > 3.4) { D0.plan = null; D0.thrown = false; D0.t = 0; D0.show = false; if (D0.i >= D0.of || allDown()) { setTimeout(() => S.demo && api.demoStop(), 600); } } }

  // ---------- ONLINE (2-5): every phone plays its own stall on the same seed; scores stream live ----------
  const NT = { on: false, net: null, st: null, code: '', codeIn: '', peers: {}, j: 0, ready: false, status: '', msg: '', ping: null, ids: null, mid: 0, tok: 0, lastSeen: {}, fin: false, snaps: {}, timer: 0, copied: false };
  api.netOpen = () => { if (S.demo) api.demoStop(true); Object.assign(NT, { st: 'menu', msg: '', codeIn: '' }); changed(); };
  api.netClose = () => { netLeave(); NT.st = null; changed(); };
  api.netCodeIn = v => { NT.codeIn = String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); NT.msg = ''; changed(); };
  api.netCreate = () => { const A = 'ABCDEFGHJKMNPQRSTUVWXYZ'; let k = ''; for (let i = 0; i < 4; i++) k += A[Math.floor(Math.random() * A.length)]; api.netJoin(k); };
  api.netJoin = async code => { code = String(code || NT.codeIn || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); if (code.length < 4) { NT.msg = 'Type the 4-letter room code from your friend.'; changed(); return; }
    netLeave(); Object.assign(NT, { st: 'room', code, peers: {}, ready: false, j: Date.now(), msg: '', status: 'connecting', ping: null, lastSeen: {}, copied: false }); changed();
    const tok = ++NT.tok; const N = await connectNet({ game: GAME, code, onJoin: id => hello(id), onLeave: id => gone(id), onMsg: (t, d, id) => nMsg(t, d, id), onStatus: s => { NT.status = s; changed(); } });
    if (tok !== NT.tok) { N.leave(); return; } NT.net = N; hello(); clearInterval(NT.timer); NT.timer = setInterval(nTick, 1000); changed(); };
  function netLeave() { NT.tok++; clearInterval(NT.timer); if (NT.net) { try { NT.net.send('ev', { k: 'bye' }); NT.net.leave(); } catch (e) {} } NT.net = null; NT.ids = null; NT.on = false; NT.lastSeen = {}; NT.peers = {}; }
  api.netLeave = () => { netLeave(); NT.st = 'menu'; NT.code = ''; if (S.mode === 'online') api.toIntro(); changed(); };
  const members = () => { if (!NT.net || !NT.st || NT.st === 'menu') return []; const all = [{ id: NT.net.id, j: NT.j, ready: NT.ready, playing: NT.on && !NT.fin, me: true }, ...Object.entries(NT.peers).map(([id, p]) => ({ id, ...p, me: false }))]; all.sort((a, b) => a.j - b.j || (a.id < b.id ? -1 : 1)); return all.slice(0, MAX_PLAYERS); };
  const hostId = () => { const m = members(); return m.length ? m.reduce((a, b) => a.id < b.id ? a : b).id : null; };
  const playerList = ids => ids.slice().sort().map((id, slot) => ({ id, name: NET_COLS[slot][0], col: NET_COLS[slot][1], slot }));
  function hello(to) { if (!NT.net) return; NT.net.send('hi', { v: 1, j: NT.j, ready: NT.ready, playing: NT.on && !NT.fin }, to); }
  function nMsg(t, d, id) { if (!d) return; const now = performance.now(), known = !!NT.lastSeen[id];
    if (t === 'hi') { NT.lastSeen[id] = now; NT.peers[id] = { ...(NT.peers[id] || {}), j: +d.j || Date.now(), ready: !!d.ready, playing: !!d.playing }; if (!known) setTimeout(() => hello(id), 0); setTimeout(maybeStart, 0); changed(); return; }
    if (!known) return; NT.lastSeen[id] = now;
    if (t === 'sn') { NT.snaps[id] = { s: +d.s || 0, r: +d.r || 0, b: +d.b || 0, f: !!d.f, e: !!d.e, mid: d.mid }; netCheckEnd(); changed(); return; }
    if (t === 'pg') { if (d.t != null) NT.net.send('pg', { e: d.t }, id); else if (d.e != null) { NT.ping = Math.max(1, Math.round(now - d.e)); } return; }
    if (t !== 'ev') return;
    if (d.k === 'ready') { NT.peers[id] = { ...(NT.peers[id] || {}), ready: !!d.on }; setTimeout(maybeStart, 0); }
    else if (d.k === 'start') nStart(d);
    else if (d.k === 'playing') NT.peers[id] = { ...(NT.peers[id] || {}), playing: !!d.on };
    else if (d.k === 'bye') gone(id);
    changed(); }
  function gone(id) { if (!NT.lastSeen[id]) return; delete NT.lastSeen[id]; delete NT.peers[id]; if (NT.ids && NT.ids.includes(id)) { NT.snaps[id] = { ...(NT.snaps[id] || { s: 0 }), left: true, f: true }; netCheckEnd(); } changed(); }
  function nTick() { if (!NT.net) return; NT.net.send('pg', { t: performance.now() }); const now = performance.now(); for (const id of Object.keys(NT.lastSeen)) if (now - NT.lastSeen[id] > 25000) gone(id); if (NT.on) sendSnap(true); }
  function maybeStart() { if (!NT.net || NT.st !== 'room' || hostId() !== NT.net.id) return; const m = members(); if (m.length < 2 || !m.every(x => x.ready && !x.playing)) return; const d = { k: 'start', t0: Date.now() + 3500, ids: m.map(x => x.id), seed: Math.floor(Math.random() * 1e9), mid: ++NT.mid + Math.floor(Math.random() * 1000) * 100 }; NT.net.send('ev', d); nStart(d); }
  function nStart(d) { if (!NT.net || !Array.isArray(d.ids)) return; if (!d.ids.includes(NT.net.id)) { NT.msg = 'A game started without you. You join the next one.'; changed(); return; }
    if (S.demo) api.demoStop(true); NT.ids = d.ids.slice(); NT.on = true; NT.fin = false; NT.snaps = {}; NT.ready = false; NT.matchId = d.mid; Object.keys(NT.peers).forEach(k => { NT.peers[k].ready = false; NT.peers[k].playing = d.ids.includes(k); });
    const pl = playerList(d.ids), me = pl.find(p => p.id === NT.net.id); S.mode = 'online'; S.players = [{ name: me.name, col: me.col, fox: me.slot, scores: [], id: me.id }]; S.netList = pl; S.cur = 0; S.seed = (+d.seed || 1) >>> 0; S.round = 0; S.done = null;
    let t0 = +d.t0; const w = t0 - Date.now(); if (!(w >= 0 && w <= 6000)) t0 = Date.now() + 3000; S.t0 = t0; startRound(0); S.phase = 'count'; camMode = 'play'; foxes.forEach(f => f && (f.visible = false)); NT.st = 'play'; changed(); }
  let snapT = 0; function sendSnap(force) { if (!NT.on || !NT.net) return; const now = performance.now(); if (!force && now - snapT < 200) return; snapT = now; const P = S.players[0], tot = P ? P.scores.reduce((a, b) => a + (b || 0), 0) + (S.phase === 'play' || S.phase === 'count' ? S.score : 0) : 0; NT.net.send('sn', { s: tot, r: S.round, b: S.balls, f: NT.fin, mid: NT.matchId }); }
  function netCheckEnd() { if (!NT.on || !NT.fin || !NT.ids) return; const others = NT.ids.filter(id => id !== NT.net.id); if (others.every(id => NT.snaps[id] && NT.snaps[id].f)) { NT.on = false; NT.st = 'room'; if (NT.net) NT.net.send('ev', { k: 'playing', on: false }); const st = netStandings(); const meRow = st.find(r => r.me); if (S.done) { const myV = meRow ? meRow.v : 0, place = 1 + st.filter(r => r.v > myV).length; S.done.standings = st; S.done.won = place === 1; S.done.tie = place === 1 && st.filter(r => r.v === myV).length > 1; S.done.grade = ['1ST', '2ND', '3RD', '4TH', '5TH'][place - 1]; S.done.waiting = false; if (S.done.won) { try { save.setStat(GAME + '.wins', save.stat(GAME + '.wins') + 1); } catch (e) {} } } } else if (S.done) { S.done.waiting = true; S.done.standings = netStandings(); } changed(); }
  function netStandings() { const L = S.netList || []; return L.map(p => { const me = NT.net && p.id === NT.net.id, sn = NT.snaps[p.id]; const v = me ? S.players[0].scores.reduce((a, b) => a + (b || 0), 0) + (S.phase === 'play' ? S.score : 0) : sn ? sn.s : 0; return { name: p.name, col: p.col, v, me, sub: me ? 'YOU' : sn && sn.left ? 'LEFT' : sn && sn.f ? 'FINISHED' : sn ? 'ROUND ' + (sn.r + 1) + ' · ' + sn.b + ' BALLS' : 'STARTING' }; }).sort((a, b) => b.v - a.v); }
  function netEndMatch() { if (NT.on) { NT.on = false; NT.st = NT.net ? 'room' : null; if (NT.net) NT.net.send('ev', { k: 'playing', on: false }); } if (!NT.net) NT.st = null; }
  api.netReady = () => { if (!NT.net) return; NT.ready = !NT.ready; NT.net.send('ev', { k: 'ready', on: NT.ready }); if (S.phase === 'done' && S.mode === 'online') { /* rematch from the result card */ } setTimeout(maybeStart, 0); changed(); };
  api.netLobby = () => { if (NT.net) { NT.st = 'room'; S.phase = 'intro'; S.done = null; camMode = 'intro'; showFox(0); } changed(); };
  api.netCopied = v => { NT.copied = !!v; changed(); };
  api.netCode = () => NT.code;
  if (/^[A-Za-z0-9]{4}$/.test(qs.get('room') || '')) setTimeout(() => { api.netOpen(); api.netJoin(qs.get('room')); }, 300);

  // ---------- HUD out ----------
  let dirty = true; function changed() { dirty = true; }
  function hud() { const P = player(), R = ROUNDS[S.round], m = members(), host = hostId();
    const total = P.scores ? P.scores.reduce((a, b, i) => a + (i === S.round && (S.phase === 'play' || S.phase === 'demo') ? 0 : (b || 0)), 0) + ((S.phase === 'play' || S.phase === 'demo') ? S.score : 0) : 0;
    const net = NT.st ? { st: NT.st, code: NT.code, codeIn: NT.codeIn, status: NT.status, msg: NT.msg, ping: NT.ping, ready: NT.ready, copied: NT.copied, members: m.map(x => { const pl = playerList(m.map(y => y.id)).find(q => q.id === x.id); return { name: pl ? pl.name : '?', col: pl ? pl.col : '#fff', me: x.me, host: x.id === host, ready: !!x.ready, playing: !!x.playing && !x.me }; }), live: NT.on || (S.mode === 'online' && S.phase !== 'intro') ? netStandings() : null } : null;
    return { phase: S.phase, mode: S.mode, round: S.round, rounds: ROUNDS.length, roundName: R.name, roundLine: R.line, score: S.score, total, balls: S.balls, ballsMax: R.balls, mult: S.lastTh && !S.lastTh.res ? S.lastTh.mult : 1 + 0.5 * Math.min(S.streak, 2), streak: S.streak, player: { name: P.name, col: P.col }, nPlayers: S.players.length, flash: S.flashT > 0 ? S.flash : null, say: S.sayT > 0 ? S.say : '', hint: S.phase === 'play' && S.hintN < 2 && !S.aim, aiming: !!S.aim, power: S.aim ? S.aim.p : 0, count: S.phase === 'count' ? Math.max(0, Math.ceil((S.t0 - Date.now()) / 1000)) : null, roundCard: S.roundCard, done: S.done, demo: S.demo ? { cap: S.demo.cap, n: S.demo.n, of: S.demo.of, fx: S.demo.fx, fy: S.demo.fy, show: S.demo.show } : null, aimHelp: S.aimHelp, sound: audio.on, best: bestScore(), net, turnOf: S.phase === 'turn' ? { name: P.name, col: P.col, round: R.name, line: R.line, n: S.round + 1 } : null, auto: S.phase === 'round' && S.autoT > 0 ? Math.ceil(S.autoT) : 0, targetsLeft: cans.filter(c => !c.knocked).length + cocos.filter(k => !k.knocked).length }; }
  api.hud = hud;

  // ---------- loop ----------
  let last = performance.now(), raf = 0, hudT = 0, tickT = 0, lastHitKey = null; const mtx = new THREE.Matrix4();
  showFox(0); startRound(0); say('intro', true); fit();
  function frame(now) { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (S.phase === 'count' && Date.now() >= S.t0) { S.phase = 'play'; flash(ROUNDS[S.round].name, '#ffd23a', 1.6); changed(); }
    if (S.phase === 'demo' && S.demo) demoTick(dt);
    // keyboard aim
    if (kAim && S.phase === 'play') { if (keys.ArrowLeft) kAim.yaw -= dt * 0.35; if (keys.ArrowRight) kAim.yaw += dt * 0.35; if (keys.ArrowUp) kAim.p = clamp(kAim.p + dt * 0.5, 0, 1); if (keys.ArrowDown) kAim.p = clamp(kAim.p - dt * 0.5, 0, 1); kAim.yaw = clamp(kAim.yaw, yaw0 - 0.45, yaw0 + 0.45); S.aim = { ...kAim, src: 'key' }; }
    const sub = 4; for (let i = 0; i < sub; i++) step(dt / sub);
    S.cool = Math.max(0, S.cool - dt); if (S.flashT > 0) { S.flashT -= dt; if (S.flashT <= 0) changed(); } if (S.sayT > 0) { S.sayT -= dt; if (S.sayT <= 0) changed(); }
    // resolve throws → streak
    for (const th of S.throws) { if (th.res || th.ball.alive || !th.deadT || S.t - th.deadT < 0.8) continue; th.res = true; if (th.hits > 0) { S.streak++; if (S.streak === 2) { flash('HOT HAND ×2', '#ff9a8a'); say('hot', true); } else if (Math.random() < 0.4) say('hit'); } else { S.streak = 0; if (!th.wob && Math.random() < 0.5) say('miss'); } changed(); }
    // round end
    if ((S.phase === 'play' || S.phase === 'demo') && !S.endT) { const live = balls.some(b => b.alive), unres = S.throws.some(t => !t.res); if (allDown() && !live) S.endT = 1.2; else if (S.balls <= 0 && !live && !unres) S.endT = 0.8; }
    if (S.endT) { S.endT -= dt; if (S.endT <= 0) { S.endT = 0; if (S.phase === 'demo') { api.demoStop(); } else if (S.phase === 'play') endRound(); } }
    if (S.phase === 'round' && S.autoT > 0) { S.autoT -= dt; if (S.autoT <= 0) { S.autoT = 0; api.next(); } else if (Math.ceil(S.autoT) !== Math.ceil(S.autoT + dt)) changed(); }
    // meshes
    for (const b of balls) if (b.alive) { b.m.position.copy(b.p); b.m.rotation.x -= dt * 14; }
    for (const c of cans) { canPos(c, tc); c.mesh.position.copy(tc); }
    for (const k of cocos) { k.mesh.position.copy(k.p); if (k.st === 'sit') { k.mesh.rotation.z = k.wob * 0.5; k.mesh.position.y = k.home.y + Math.abs(k.wob) * 0.05; } }
    for (const q of pops) if (q.life > 0) { q.life -= dt * 0.9; q.s.position.y += dt * 0.5; q.s.material.opacity = Math.min(1, q.life * 2); if (q.life <= 0) q.s.visible = false; }
    bulbs.forEach((b, i) => b.material.color.setHex(((Math.floor(now / 400) + i) % 3) ? 0xffe08a : 0xffffff));
    // aim visuals
    const A = S.aim; dotMesh.count = 0; ring.visible = false;
    if (A && (S.phase === 'play' || S.phase === 'demo')) { const pr = predict(A.yaw, A.p); const full = S.aimHelp || A.src === 'demo'; const n = full ? pr.pts.length : Math.min(pr.pts.length, 9); for (let i = 0; i < n; i++) { mtx.makeTranslation(pr.pts[i].x, pr.pts[i].y, pr.pts[i].z); dotMesh.setMatrixAt(i, mtx); } dotMesh.count = n; dotMesh.instanceMatrix.needsUpdate = true;
      if (full && pr.hit) { ring.visible = true; ring.position.copy(pr.hit.p); const s = (pr.hit.kind === 'coco' ? 0.42 : 0.34) * (1 + 0.08 * Math.sin(now / 90)); ring.scale.set(s, s, 1); }
      // sound aim: hot/cold ticks, panned to where the throw lands (for low-vision players)
      tickT -= dt; if (S.aimHelp && A.src !== 'demo' && tickT <= 0) { tickT = pr.hit ? 0.11 : 0.22; const pan = clamp(pr.end.x / 2, -1, 1); if (pr.hit) audio.tick(1046, pan); else { let dmin = 9; for (const c of cans) if (!c.knocked) { canPos(c, tc); dmin = Math.min(dmin, tc.distanceTo(pr.end)); } for (const k of cocos) if (!k.knocked) dmin = Math.min(dmin, k.p.distanceTo(pr.end)); audio.tick(220 + 520 * (1 - Math.min(dmin, 1.2) / 1.2), pan); } }
      const key = pr.hit ? (pr.hit.o.home ? pr.hit.o.home.x + ',' + pr.hit.o.home.y : '') : null; if (key !== lastHitKey) { lastHitKey = key; } }
    // hand ball
    const showHand = (S.phase === 'play' || S.phase === 'demo') && S.balls > 0 && S.cool <= 0 && !S.endT; handBall.visible = showHand; if (showHand) { const p = A ? A.p : 0; handBall.position.set(SPAWN.x + 0.08 + 0.02 * Math.sin(now / 300), SPAWN.y - 0.32 - 0.05 * p, SPAWN.z + 0.25 + 0.15 * p); }
    // foxes
    for (const f of foxes) if (f && f.visible) { kit.animFox(f, dt, 0); f.userData.lookAt = camera.position; }
    barker.userData.talking = S.sayT > 0; barker.userData.mood = S.sayT > 0 ? 'excited' : 'happy'; barker.userData.lookAt = camera.position; kit.animFox(barker, dt, 0); if (S.sayT > 0 && barker.userData.P.arms) { barker.userData.P.arms[0].rotation.x = -1.2 + Math.sin(now / 160) * 0.3; }
    placeCamera(dt);
    renderer.render(scene, camera);
    hudT -= dt; if (dirty || hudT <= 0 || S.aim || S.demo || S.phase === 'count') { if (dirty || hudT <= 0 || S.aim || S.demo || S.phase === 'count') { dirty = false; hudT = 0.25; onState && onState(hud()); } } }
  raf = requestAnimationFrame(frame);
  api.destroy = () => { cancelAnimationFrame(raf); netLeave(); ro.disconnect(); removeEventListener('keydown', onKey); removeEventListener('keyup', onKey); renderer.dispose(); renderer.domElement.remove(); };
  api.debug = { aimAt: (o) => { const tgt = o.pl ? canPos(o, tc).clone() : o.p.clone(); const yaw = Math.atan2(tgt.x - SPAWN.x, SPAWN.z - tgt.z); const ok = []; for (let p = 0.2; p <= 1; p += 0.01) { const r = predict(yaw, p); if (r.hit && r.hit.o === o) ok.push(p); } return { yaw, p: ok.length ? ok[Math.floor(ok.length / 2)] : 0.6 }; }, S, get cans() { return cans; }, get cocos() { return cocos; }, predict, throwBall, aimFrom, yaw0, step, NT, scene, camera, THREE };
  onState && onState(hud());
  return api;
}
