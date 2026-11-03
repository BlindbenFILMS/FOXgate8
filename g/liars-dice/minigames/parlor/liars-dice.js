// 8 GATES — LIAR'S DICE [liarsDice]. Minigame #8 (CARDS & DICE). Leather dice cups on a lamp-lit tavern table that fits any building on any world.
// Rules live in liars-dice-rules.js (pure, tested). This file is the 3D table (cups, dice, bid slate, foxes), sound, CPU timing, demo and online sync.
// Modes: VS FOXES (1–5 CPU foxes) · PASS & PLAY (2–6 on one phone, a cover screen hides each player's dice) · ONLINE (2–6, host-run, dice stay secret) · DEMO.
// MERGE: createLiarsDice({ container, onState, theme, music }) stands alone; it only needs vendor/three, fox-kit.js, engine/cast.js, engine/textures.js,
// engine/save.js, engine/bake.js. Save keys all start 'liarsDice.'.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE, KING_MIGHT } from '../../fox-kit.js';
import { castKit, loadCastRigs } from '../../engine/cast.js';
import { crestTex, canvasTex, FONT } from '../../engine/textures.js';
import { save } from '../../engine/save.js';
import { bakeCreature } from '../../engine/bake.js';
import { makeAudio } from './liars-dice-audio.js';
import * as R from './liars-dice-rules.js';
export * from './liars-dice-rules.js';

export const LIARS_DICE = { name: "LIAR'S DICE", room: 'liarsDice', key: 'liarsDice', maxPlayers: 6, number: 8 };
export const SK = k => 'liarsDice.' + k;
export const COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['VIOLET', '#a78bfa'], ['PINK', '#f472b6']];
// DRAFT for Ben: gold + XP
export const PAY = { winPerRival: 10, flawless: 10, goodCall: 2, trophy: 'liarsDiceCup', xpMatch: 6 };
// DRAFT for Ben: CPU table (skill = how well they judge odds, bluff = how often they bid on dice they do not hold)
export const CPUS = [
  { key: 'hope', name: 'HOPE', cast: 'hope', skill: 0.9, bluff: 0.2 },
  { key: 'noble', name: 'NOBLE', cast: 'noble', skill: 0.8, bluff: 0.45 },
  { key: 'king', name: 'KING MIGHT', fox: { look: KING_MIGHT, torso: ['#7c3aed', '#e6b45a', '#3b0764'], outfit: 'royal', crown: true, mood: 'stern' }, skill: 0.95, bluff: 0.3 },
  { key: 'marla', name: 'MARLA', fox: { look: PLAYER_FEMALE, torso: ['#f472b6', '#fce7f3', '#9d174d'], outfit: 'coat', mood: 'happy' }, skill: 0.6, bluff: 0.6 },
  { key: 'otto', name: 'OTTO', fox: { look: PLAYER_MALE, torso: ['#2f5d2a', '#e6b45a', '#1a3318'], outfit: 'vest', mood: 'neutral' }, skill: 0.55, bluff: 0.15 }];
export const THEMES = {
  meru: { felt: '#1f5f44', wood: '#7a4a26', woodD: '#4f2e16', trim: '#e6b45a', cup: '#5a2e18', table: '#5a3a22', wall: ['#3a2a4a', '#1a1426'] },
  gaya: { felt: '#2b5a8a', wood: '#8a6a4a', woodD: '#5a4230', trim: '#e2e8f0', cup: '#2a3a5a', table: '#6a5240', wall: ['#2a3a5a', '#141a2c'] },
  jidda: { felt: '#0e6f7a', wood: '#c49a6c', woodD: '#8a6640', trim: '#ffd23a', cup: '#6a4a2a', table: '#a4804e', wall: ['#2a5a6a', '#123038'] },
  kufa: { felt: '#7a3424', wood: '#b07a46', woodD: '#7a5028', trim: '#ffd23a', cup: '#7a3a1a', table: '#8a6236', wall: ['#5a3a2a', '#2a1a12'] },
  luxor: { felt: '#2a2a2a', wood: '#5a4a3a', woodD: '#2a221a', trim: '#e6b45a', cup: '#1a1a1a', table: '#3a302a', wall: ['#3a3434', '#141212'] },
  nebo: { felt: '#355f27', wood: '#8a5a2a', woodD: '#5a3a18', trim: '#f6d27a', cup: '#4a3218', table: '#6a4420', wall: ['#2a4030', '#121e16'] },
  ur: { felt: '#5f4580', wood: '#a88a5a', woodD: '#705a36', trim: '#e6b45a', cup: '#4a2a5a', table: '#806a44', wall: ['#4a3a5a', '#1e1628'] },
  zion: { felt: '#6f2828', wood: '#9a6a3a', woodD: '#643f1e', trim: '#ffd23a', cup: '#5a2a14', table: '#7a5230', wall: ['#5a3a2a', '#24160e'] },
  home: { felt: '#1f5565', wood: '#8a5a3a', woodD: '#5a3a22', trim: '#f3f2f2', cup: '#3a2a22', table: '#6a4a30', wall: ['#3a3a4a', '#16161e'] },
  earth: { felt: '#1a5236', wood: '#6a4a3a', woodD: '#3a2a20', trim: '#d4d4d8', cup: '#2a2420', table: '#4a3a30', wall: ['#30343e', '#121418'] },
  station: { felt: '#1e293b', wood: '#64748b', woodD: '#334155', trim: '#38bdf8', cup: '#1e293b', table: '#475569', wall: ['#0f1a2e', '#04070f'] } };
// pip layouts on a 3×3 grid (1–6), shared with the page for the dice icons
export const PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };

// ---------------- the DEMO (you vs Hope, 3 rounds with fixed dice) ----------------
export const DEMO_RIGS = [[[4, 4, 1, 6, 2], [4, 3, 5, 1, 2]], [[5, 5, 2, 3], [6, 6, 1, 3, 2]], [[2, 2, 5, 6, 3], [6, 1, 3, 3, 4]]];
export const DEMO = [
  { cap: "Liar's Dice: everyone rolls five dice in secret under a cup. Only you can see yours.", wait: 4200 },
  { cap: 'Your dice: 1, 2, 4, 4, 6. ONES ARE WILD: they count as any number. So right now you hold three 4s.', wait: 4600 },
  { cap: 'You start. A BID says how many of one number are on the WHOLE table, everyone\'s dice together. You bid "three 4s".', key: 'BID 3 × 4', acts: [{ a: 'bid', p: 0, q: 3, f: 4 }], wait: 3200 },
  { cap: 'Hope must bid higher: more dice, or the same count of a higher number. She says "four 4s".', acts: [{ a: 'bid', p: 1, q: 4, f: 4, pause: 1400 }], wait: 3400 },
  { cap: 'Is she lying? You hold three, so she needs just one 4 or 1. The ODDS meter says 87% true. You call LIAR anyway…', key: 'LIAR!', acts: [{ a: 'liar', p: 0 }], wait: 2600 },
  { cap: 'All cups lift. Count the 4s and the wild 1s: five. The bid was true, so the one who called LIAR, you, loses a die.', wait: 6200 },
  { cap: 'New round. The loser starts. You have four dice now: 2, 3, 5, 5. You bid "two 5s".', key: 'BID 2 × 5', acts: [{ a: 'next', rig: 1, pause: 400 }, { a: 'bid', p: 0, q: 2, f: 5, pause: 2600 }], wait: 2400 },
  { cap: 'Hope bids "three 5s". You need exactly one more 5 or 1 among her five dice. That is the single most likely count…', acts: [{ a: 'bid', p: 1, q: 3, f: 5, pause: 1400 }], wait: 3400 },
  { cap: '…so you call SPOT ON: you say the bid is EXACTLY right. If you are right you win a die back; if not, you lose one.', key: 'SPOT ON', acts: [{ a: 'spot', p: 0 }], wait: 2600 },
  { cap: 'Two 5s of yours plus Hope\'s wild 1: exactly three! You win your die back.', wait: 5400 },
  { cap: 'Round three. You bid "two 2s", you hold them. Hope jumps to "four 6s".', key: 'BID 2 × 2', acts: [{ a: 'next', rig: 2, pause: 400 }, { a: 'bid', p: 0, q: 2, f: 2, pause: 2600 }, { a: 'bid', p: 1, q: 4, f: 6, pause: 1600 }], wait: 2600 },
  { cap: 'You hold one 6. She would need three more among her five dice: the odds meter says 21%. Probably a bluff. LIAR!', key: 'LIAR!', acts: [{ a: 'liar', p: 0, pause: 1200 }], wait: 2600 },
  { cap: 'Only three 6s on the table (with her wild 1). She bluffed, so Hope loses a die.', wait: 5600 },
  { cap: 'Lose all your dice and you are out. The last fox with dice wins. Tap EXIT DEMO, then PLAY.', key: 'EXIT DEMO', wait: 6000 }];

const rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)], clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));

export async function createLiarsDice({ container, onState = () => {}, theme = 'meru', music = true } = {}) {
  const TH = THEMES[theme] || THEMES.meru, touch = matchMedia('(pointer: coarse)').matches, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.75 : 2)); renderer.setSize(CW(), CH()); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const grad = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const cache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.02, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); o.raycast = () => {}; mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.012, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const texMat = (map, extra) => new THREE.MeshToonMaterial({ map, gradientMap: grad, ...extra });
  const sfx = makeAudio(); sfx.setMusic(music && save.stat(SK('music'), 1) !== 0);
  const vib = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  try { if (document.fonts) await Promise.race([document.fonts.load('900 100px Archivo'), new Promise(r => setTimeout(r, 700))]); } catch (e) {}

  // ---- textures + helpers ----
  const woodTex = (base, dark, w = 256, h = 64, rep) => canvasTex(w, h, (g) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { g.strokeStyle = i % 3 ? dark : '#ffffff'; g.globalAlpha = i % 3 ? rr(0.1, 0.3) : rr(0.05, 0.12); g.lineWidth = rr(0.6, 2.2); g.beginPath(); let y = rr(0, h); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) { y += rr(-1, 1); g.lineTo(x, y + Math.sin(x * 0.03 + i) * 1.4); } g.stroke(); }
    for (let k = 0; k < 2; k++) { const cx = rr(30, w - 30), cy = rr(12, h - 12); g.strokeStyle = dark; for (let r = 2; r < 12; r += 2.5) { g.globalAlpha = 0.3; g.beginPath(); g.ellipse(cx, cy, r * 2.4, r * 0.7, 0, 0, 7); g.stroke(); } } g.globalAlpha = 1; }, rep);
  const blobTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(0,0,0,0.5)'); r.addColorStop(0.55, 'rgba(0,0,0,0.22)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const blob = (w, d, y, x = 0, z = 0, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1; scene.add(m); return m; };
  function roundedBox(w, h, d, r, s = 3) { const g = new THREE.BoxGeometry(w, h, d, s, s, s), p = g.attributes.position, v = V3(), c = V3(), hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.set(clamp(v.x, -hw, hw), clamp(v.y, -hh, hh), clamp(v.z, -hd, hd)); const n = v.clone().sub(c); if (n.lengthSq() > 1e-10) v.copy(c).add(n.normalize().multiplyScalar(r)); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }

  // ---- room + table ----
  scene.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, TH.wall[0]); gr.addColorStop(1, TH.wall[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.add(new THREE.HemisphereLight(0xfff2dc, 0x3a2a3a, 0.95));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.4); sun.position.set(1.6, 6, 3.2); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 14 }); scene.add(sun);
  const lamp = new THREE.PointLight(0xffc77a, 2.4, 9, 2); lamp.position.set(0.2, 2.2, 0.4); scene.add(lamp);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.12, 64), texMat(woodTex(TH.table, '#000000', 512, 512, [2, 2]))); table.position.y = -0.06; table.receiveShadow = !touch; scene.add(table);
  M(new THREE.CylinderGeometry(3.34, 3.2, 0.1, 64), toon(TH.woodD), 0, -0.16, 0, scene, 0);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(TH.wall[1])); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; scene.add(floor);
  const glow = (a) => canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, `rgba(255,214,150,${a})`); r.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow(0.85), transparent: true, depthWrite: false })); lampGlow.position.set(0, 3.4, -1.2); lampGlow.scale.set(7, 7, 1); scene.add(lampGlow);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(2.4, 48), new THREE.MeshBasicMaterial({ map: glow(0.24), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.003; scene.add(pool);
  // round felt mat
  const matTex = canvasTex(512, 512, (g, w, h) => { g.fillStyle = TH.felt; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.05)'; g.fillRect(rr(0, w), rr(0, h), rr(1, 2), 1); }
    const v = g.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.5); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.4)'); g.fillStyle = v; g.fillRect(0, 0, w, h);
    g.strokeStyle = TH.trim; g.globalAlpha = 0.55; g.lineWidth = 6; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 14, 0, 7); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(w / 2, h / 2, w / 2 - 26, 0, 7); g.stroke(); g.beginPath(); g.arc(w / 2, h / 2, w * 0.16, 0, 7); g.stroke(); g.globalAlpha = 1; });
  blob(3.0, 3.0, 0.002, 0, 0, 0.55);
  const mat = new THREE.Mesh(new THREE.CircleGeometry(1.42, 64), texMat(matTex)); mat.rotation.x = -Math.PI / 2; mat.position.y = 0.006; mat.receiveShadow = !touch; scene.add(mat);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.022, 8, 80), toon(TH.trim, { emissive: new THREE.Color(TH.trim), emissiveIntensity: 0.08 })); rim.rotation.x = Math.PI / 2; rim.position.y = 0.012; scene.add(rim);

  // ---- dice: one material per die (a 3×2 atlas of faces) so each die is one draw call and can glow on its own ----
  const DS = 0.1, FACE = [3, 4, 1, 6, 2, 5], NORM = [V3(1, 0, 0), V3(-1, 0, 0), V3(0, 1, 0), V3(0, -1, 0), V3(0, 0, 1), V3(0, 0, -1)];
  const atlas = canvasTex(384, 256, (g) => { for (let v = 1; v <= 6; v++) { const cx = ((v - 1) % 3) * 128, cy = Math.floor((v - 1) / 3) * 128; const gr = g.createRadialGradient(cx + 54, cy + 50, 6, cx + 64, cy + 64, 96); gr.addColorStop(0, '#fffcf4'); gr.addColorStop(1, '#e6d8b8'); g.fillStyle = gr; g.fillRect(cx, cy, 128, 128);
    const R2 = v === 1 ? 18 : 12; for (const [a, b] of PIPS[v]) { const x = cx + 32 + a * 32, y = cy + 32 + b * 32; g.fillStyle = 'rgba(255,255,255,0.9)'; g.beginPath(); g.arc(x + 2, y + 2, R2, 0, 7); g.fill(); const pg = g.createRadialGradient(x - R2 * 0.3, y - R2 * 0.3, 1, x, y, R2); pg.addColorStop(0, v === 1 ? '#7a1408' : '#000'); pg.addColorStop(1, v === 1 ? '#ec3013' : '#3a302a'); g.fillStyle = pg; g.beginPath(); g.arc(x, y, R2, 0, 7); g.fill(); } } });
  const dieGeo = (() => { const g = roundedBox(DS, DS, DS, 0.014, 3), uv = g.attributes.uv; g.groups.forEach((gr, k) => { const v = FACE[gr.materialIndex], col = (v - 1) % 3, row = Math.floor((v - 1) / 3); const idx = g.index.array; const seen = new Set();
    for (let i = gr.start; i < gr.start + gr.count; i++) { const vi = idx[i]; if (seen.has(vi)) continue; seen.add(vi); uv.setXY(vi, (col + 0.04 + uv.getX(vi) * 0.92) / 3, (1 - row) * 0.5 + (0.02 + uv.getY(vi) * 0.96) * 0.5); } }); g.clearGroups(); return g; })();
  const UP = V3(0, 1, 0), faceQuat = (v, yaw) => new THREE.Quaternion().setFromAxisAngle(UP, yaw).multiply(new THREE.Quaternion().setFromUnitVectors(NORM[FACE.indexOf(v)], UP));
  const OFF = [[0, 0], [0.105, 0.05], [-0.105, 0.05], [0.066, -0.097], [-0.066, -0.097]];

  // ---- cups: leather, stitched, with a brass band ----
  const cupTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = TH.cup; g.fillRect(0, 0, w, h); for (let i = 0; i < 2500; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.05)'; g.fillRect(rr(0, w), rr(0, h), rr(1, 3), rr(1, 2)); }
    g.strokeStyle = 'rgba(255,230,190,0.55)'; g.lineWidth = 2; g.setLineDash([6, 5]); for (const y of [14, h - 30]) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } g.setLineDash([]); }, [3, 1]);
  const cupMat = texMat(cupTex, { side: THREE.DoubleSide }), brass = toon(TH.trim, { emissive: new THREE.Color(TH.trim), emissiveIntensity: 0.1 });
  function makeCup() { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.235, 0.32, 28, 1, true), cupMat); body.position.y = 0.16; body.castShadow = !touch; addOutline(body, 0.01, 0.2); g.add(body);
    const top = new THREE.Mesh(new THREE.CircleGeometry(0.19, 28), cupMat); top.rotation.x = -Math.PI / 2; top.position.y = 0.32; g.add(top);
    const band = new THREE.Mesh(new THREE.TorusGeometry(0.232, 0.012, 6, 28), brass); band.rotation.x = Math.PI / 2; band.position.y = 0.02; g.add(band); const band2 = band.clone(); band2.scale.setScalar(0.81); band2.position.y = 0.305; g.add(band2); scene.add(g); return g; }

  // ---- bid slate in the middle of the table ----
  const slateCv = document.createElement('canvas'); slateCv.width = 320; slateCv.height = 200; const slateTex = new THREE.CanvasTexture(slateCv); slateTex.colorSpace = THREE.SRGBColorSpace; slateTex.anisotropy = 4;
  const slate = M(roundedBox(0.52, 0.03, 0.33, 0.01, 2), [toon(TH.woodD), toon(TH.woodD), texMat(slateTex), toon(TH.woodD), toon(TH.woodD), toon(TH.woodD)], 0, 0.02, 0, scene, 0.01); slate.rotation.y = 0;
  let slateKey = '', slatePop = 0;
  function drawSlate(b, col, name, note, cnt) { const key = JSON.stringify([b, col, name, note, cnt]); if (key === slateKey) return; slateKey = key; const g = slateCv.getContext('2d'), w = 320, h = 200;
    g.fillStyle = '#23201d'; g.fillRect(0, 0, w, h); g.strokeStyle = TH.trim; g.lineWidth = 8; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 400; i++) g.fillRect(Math.random() * w, Math.random() * h, 2, 1);
    if (b && cnt != null) { g.fillStyle = '#ffd23a'; g.fillRect(14, 14, w - 28, 26); g.fillStyle = '#000'; g.font = `900 20px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText('COUNTING · BID ' + b.q, 24, 28);
      g.fillStyle = cnt >= b.q ? '#22c55e' : '#f4efe2'; g.font = `900 110px ${FONT}`; g.textAlign = 'right'; g.fillText(String(Math.max(0, cnt)), 170, 124);
      const x0 = 200, y0 = 74, sz = 84; g.fillStyle = '#fbf6e8'; g.fillRect(x0, y0, sz, sz); g.fillStyle = b.f === 1 ? '#ec3013' : '#1d1712'; for (const [a, c] of PIPS[b.f]) { g.beginPath(); g.arc(x0 + 21 + a * 21, y0 + 21 + c * 21, 8, 0, 7); g.fill(); } slateTex.needsUpdate = true; return; }
    if (!b) { g.fillStyle = '#e8e2d4'; g.font = `900 40px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(note || 'NEW ROUND', w / 2, h / 2); }
    else { g.fillStyle = col || '#ffd23a'; g.fillRect(14, 14, w - 28, 26); g.fillStyle = '#000'; g.font = `900 20px ${FONT}`; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(name + ' BIDS', 24, 28);
      g.fillStyle = '#f4efe2'; g.font = `900 104px ${FONT}`; g.textAlign = 'right'; g.fillText(String(b.q), 150, 122); g.font = `900 52px ${FONT}`; g.fillText('×', 196, 126);
      const x0 = 210, y0 = 70, s = 92; g.fillStyle = '#fbf6e8'; g.fillRect(x0, y0, s, s); g.fillStyle = b.f === 1 ? '#ec3013' : '#1d1712'; for (const [a, c] of PIPS[b.f]) { g.beginPath(); g.arc(x0 + 23 + a * 23, y0 + 23 + c * 23, b.f === 1 ? 13 : 9, 0, 7); g.fill(); } }
    slateTex.needsUpdate = true; }
  drawSlate(null, null, '', "LIAR'S DICE");

  // ---- foxes (same seating as the other parlor games) ----
  const kit = foxKit({ THREE, scene, toon, M: (geo, mt, x, y, z, parent, outline = 0.02, radius) => M(geo, mt, x, y, z, parent, outline, radius), grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M: (geo, mt, x, y, z, parent, outline = 0.02, radius) => M(geo, mt, x, y, z, parent, outline, radius), toon, makeFox: kit.makeFox }, rigs);
  const foxCache = new Map(), LOOK_YOU = V3(0, 2.4, 4);
  function foxFor(spec) { const key = spec.key; if (foxCache.has(key)) return foxCache.get(key); let f;
    try { f = spec.cast ? cast.make(spec.cast) : kit.makeFox({ key, eyes: ['#38bdf8', '#38bdf8'], mood: 'neutral', outfit: 'armor', crest: '8', torso: spec.col || '#ec3013', look: PLAYER_MALE, ...(spec.fox || {}) }); } catch (e) { console.warn('liarsDice fox', e); f = new THREE.Group(); scene.add(f); }
    try { (f.userData.P && f.userData.P.legs || []).forEach(l => l.visible = false); } catch (e) {}
    try { f.userData.joints = { P: f.userData.P, rig: f.userData.rig }; bakeCreature(THREE, f); delete f.userData.joints; } catch (e) {}
    f.visible = false; foxCache.set(key, f); return f; }

  // ---- seats: each player has a cup + dice around the mat; the front seat is you ----
  const seats = []; let seatSig = '';
  const RC = 1.06;
  function buildSeats() { const n = G ? G.players.length : 2, front = G ? (G.mode === 'local' ? 0 : Math.max(0, myIdx())) : 0, sig = n + ':' + front + ':' + (G ? G.players.map(p => (p.cpu || 'p') + (p.id || '')).join(',') : 'menu');
    if (sig === seatSig) return; seatSig = sig; seats.forEach(s => { scene.remove(s.cup); s.dice.forEach(d => scene.remove(d.m)); scene.remove(s.sh); scene.remove(s.ring); scene.remove(s.plate); s.ptex.dispose(); if (s.fox) s.fox.visible = false; }); seats.length = 0; for (const f of foxCache.values()) f.visible = false;
    for (let i = 0; i < n; i++) { const k = (i - front + n) % n, a = Math.PI + (k / n) * Math.PI * 2, cx = Math.sin(a) * RC, cz = -Math.cos(a) * RC, inward = Math.atan2(-cx, -cz);
      const cup = makeCup(); cup.position.set(cx, 0, cz); const sh = blob(0.6, 0.6, 0.008, cx, cz, 0.7);
      const dice = Array.from({ length: 6 }, (_, j) => { const m = new THREE.Mesh(dieGeo, texMat(atlas, { emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0 })); m.castShadow = !touch; addOutline(m, 0.006); m.visible = false; scene.add(m); return { m, tp: V3(), tq: new THREE.Quaternion(), v: 0, yaw: rr(-0.6, 0.6), out: 0 }; });
      let fox = null; const p = G ? G.players[i] : null;
      if (k !== 0 || (G && G.mode === 'local')) { if (k !== 0) { const cp = p && p.cpu ? CPUS.find(c => c.key === p.cpu) : null; fox = foxFor({ key: cp ? cp.key : 'p' + i + (p && p.id || ''), cast: cp ? cp.cast : null, fox: cp ? cp.fox : null, col: p ? p.col : COLS[i % 6][1] });
        const sc = n > 4 ? 0.56 : n > 2 ? 0.62 : 0.7; fox.userData.seatY = -1.17 * sc; fox.position.set(Math.sin(a) * 1.8, fox.userData.seatY, -Math.cos(a) * 2.55 - Math.abs(Math.sin(a)) * 0.25); fox.rotation.y = -a; fox.scale.setScalar(sc); fox.visible = true; fox.userData.lookAt = LOOK_YOU; } }
      const col = p ? p.col : COLS[i % 6][1];
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.27, 0.31, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.2, depthWrite: false })); ring.rotation.x = -Math.PI / 2; ring.position.set(cx, 0.009, cz); ring.renderOrder = 2; scene.add(ring);
      const pcv = document.createElement('canvas'); pcv.width = 256; pcv.height = 64; const ptex = new THREE.CanvasTexture(pcv); ptex.colorSpace = THREE.SRGBColorSpace; ptex.anisotropy = 4;
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.1), new THREE.MeshBasicMaterial({ map: ptex, transparent: true, depthWrite: false })); plate.rotation.x = -Math.PI / 2; const pr = 0.6; plate.position.set(Math.sin(a) * pr, 0.012, -Math.cos(a) * pr); plate.renderOrder = 3; scene.add(plate);
      seats.push({ i, k, a, c: V3(cx, 0, cz), inward, cup, sh, dice, fox, lift: 0, shakeT: 0, peek: false, ring, plate, pcv, ptex, plateKey: '', col, tip: 0 }); }
    if (!G) { seats.forEach(s => { s.dice.forEach((d, j) => { if (j < 5) { d.v = 1 + ((j * 7 + s.i * 3) % 6); } }); }); }
    fitCam(); }
  const seatOf = i => seats.find(s => s.i === i);
  function drawPlate(s, name, n, out, turn) { const key = [name, n, out, turn].join('|'); if (key === s.plateKey) return; s.plateKey = key; const g = s.pcv.getContext('2d'), w = 256, h = 64;
    g.clearRect(0, 0, w, h); g.fillStyle = turn ? s.col : 'rgba(10,8,6,0.82)'; g.fillRect(0, 0, w, h); g.fillStyle = s.col; g.fillRect(0, 0, 12, h);
    g.fillStyle = turn ? '#000' : out ? '#7a746e' : '#f4efe2'; g.font = `900 30px ${FONT}`; g.textBaseline = 'middle'; g.textAlign = 'left'; g.fillText(out ? name + ' · OUT' : name, 24, 33, 150);
    if (!out) for (let k = 0; k < n; k++) { const x = w - 18 - k * 19; g.fillStyle = turn ? '#000' : '#fbf6e8'; g.fillRect(x - 7, 25, 14, 14); }
    s.ptex.needsUpdate = true; }
  function foxMood(i, mood, hop) { const s = seatOf(i); if (!s || !s.fox) return; const u = s.fox.userData; u.mood = mood; u.moodT = 2.5; if (hop) u.hop = 1; }

  // ---- camera ----
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }, fitC = new THREE.PerspectiveCamera(38, 1, 0.05, 60), shot = { pos: V3(0, 3, 3), look: V3() };
  function fitCam() { const W = CW(), H = CH(), w = Math.max(80, W - SAFE.left - SAFE.right), h = Math.max(80, H - SAFE.top - SAFE.bottom), asp = w / h, port = asp < 0.9;
    camera.aspect = asp; camera.fov = port ? 44 : 36; camera.setViewOffset(w, h, -SAFE.left, -SAFE.top, W, H); camera.updateProjectionMatrix(); fitC.aspect = asp; fitC.fov = camera.fov; fitC.updateProjectionMatrix();
    const el = port ? 0.98 : 1.0, dir = V3(0, Math.sin(el), Math.cos(el)), pts = [];
    for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) pts.push(V3(Math.sin(a) * 1.45, 0, -Math.cos(a) * 1.45));
    seats.forEach(s => { pts.push(s.c.clone().setY(0.32)); if (port && s.fox) pts.push(V3(clamp(s.fox.position.x, -1.5, 1.5), s.fox.userData.seatY + 2.15 * s.fox.scale.x, s.fox.position.z)); });
    const tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length); tgt.y = Math.min(tgt.y, 0.2);
    const _p = V3(), lim = 0.95, fits = d => { fitC.position.copy(tgt).addScaledVector(dir, d); fitC.lookAt(tgt); fitC.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitC); x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { ok: x0 >= -lim && x1 <= lim && y0 >= -lim && y1 <= lim, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    let d = 4; for (let it = 0; it < 3; it++) { let lo = 0.6, hi = 30; for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (fits(m).ok) hi = m; else lo = m; } d = hi; const b = fits(d), th = Math.tan(fitC.fov * Math.PI / 360) * d;
      const right = V3().setFromMatrixColumn(fitC.matrixWorld, 0), up = V3().setFromMatrixColumn(fitC.matrixWorld, 1); tgt.addScaledVector(right, b.cx * th * asp).addScaledVector(up, b.cy * th); }
    shot.pos.copy(tgt).addScaledVector(dir, d); shot.look.copy(tgt); camera.position.copy(shot.pos); camera.lookAt(shot.look); }
  function resize() { renderer.setSize(CW(), CH()); fitCam(); }
  let ro = null; try { ro = new ResizeObserver(resize); ro.observe(container); } catch (e) { addEventListener('resize', resize); }

  // ---- match state ----
  let G = null, net = null, demo = null, demoTok = 0, curtainAck = -1, lastViewer = 0, lastEv = 0, lastChange = performance.now(), flash = null, sayTxt = '', paid = new Set(), endGold = 0, endNote = '';
  let voice = !!save.stat(SK('voice'), 0), showOdds = save.stat(SK('odds'), 1) !== 0, revealAt = 0, revealSig = '', counted = 0, rollAt = 0;
  const isAuth = () => !net || net.hostId() === net.me;
  const clone = o => JSON.parse(JSON.stringify(o)), now = () => performance.now();
  const myIdx = () => !G ? -1 : net ? G.players.findIndex(p => p.id === net.me) : G.players.findIndex(p => p.kind === 'me');
  const actor = () => !G || G.phase !== 'bid' ? -1 : G.turn;
  function viewer() { if (!G) return -1; if (G.mode === 'local') { const a = actor(); if (a >= 0 && G.players[a].kind === 'local') lastViewer = a; return lastViewer; } return myIdx(); }
  const curtainFor = () => { if (!G || G.mode !== 'local' || demo) return -1; const a = actor(); return a >= 0 && G.players[a].kind === 'local' && a !== curtainAck ? a : -1; };
  const controls = p => !demo && G && p >= 0 && !G.players[p].gone && G.players[p].n > 0 && (G.mode === 'local' ? G.players[p].kind === 'local' && p === actor() && curtainFor() < 0 : p === myIdx());
  const pName = p => p === myIdx() && G.mode !== 'local' ? 'YOU' : G.players[p].name;
  const unknownFor = p => R.totalDice(G) - G.players[p].n;

  function input(a) { sfx.on(); if (!G || demo) return; const vi = viewer();
    if (a.a === 'reveal') { const c = curtainFor(); if (c >= 0) { curtainAck = c; sfx.lift(0); emit(); } return; }
    if (a.a === 'next') { send(vi, { a: 'next', at: G.seq }); return; }
    if (!controls(vi) || G.phase !== 'bid' || G.turn !== vi) return;
    if (a.a === 'bid') { const b = { q: a.q | 0, f: a.f | 0 }; if (!R.isRaise(G.bid, b, G.opts) || b.q > R.totalDice(G)) { sfx.bad(); flashMsg('BID HIGHER: MORE DICE, OR A HIGHER NUMBER', '#ff9a8a'); return; } send(vi, { a: 'bid', q: b.q, f: b.f }); return; }
    if (a.a === 'liar' || a.a === 'spot') { if (!G.bid) { flashMsg('NOTHING TO CALL YET · MAKE THE FIRST BID', '#ffd23a'); return; } if (a.a === 'spot' && !G.opts.spot) return; send(vi, { a: a.a }); return; } }
  function send(p, a) { if (isAuth()) act(p, a); else net.send('ev', { k: 'in', mid: G.mid, ...a }, net.hostId()); }
  function act(p, a) { if (a.a === 'next') resetReveal(); const prev = clone(G); if (!R.applyAct(G, p, a)) return false; G.seq++; changed(prev); return true; }
  function changed(prev) { lastChange = now(); effects(prev, G); broadcast(); emit(); }
  function broadcast() { if (!net || !isAuth() || !G) return; G.players.forEach((pl, i) => { if (pl.id && pl.id !== net.me && !pl.gone) net.send('st', R.viewFor(G, i), pl.id); }); }

  // ---- what every client does when the match moves on ----
  function effects(A, B) { if (!B) return;
    if (!A || A.mid !== B.mid) { lastEv = B.evId - 1; curtainAck = -1; buildSeats(); }
    for (const e of B.ev) { if (e.id <= lastEv) continue; lastEv = e.id;
      if (e.kind === 'roll') { rollAt = now(); curtainAck = -1; seats.forEach((s, k) => { s.shakeT = 0.9; setTimeout(() => sfx.shakeCup(clamp(s.c.x, -1, 1), 0.7), k * 60); setTimeout(() => sfx.slam(clamp(s.c.x, -1, 1)), 820 + k * 60); }); vib(20); drawSlate(null, null, '', 'ROUND ' + e.round);
        const t = B.players[B.turn]; speak('Round ' + e.round + '. ' + B.players.reduce((s, p) => s + p.n, 0) + ' dice on the table. ' + (pName(B.turn) === 'YOU' ? 'You start.' : pName(B.turn) + ' starts.')); }
      else if (e.kind === 'bid') { const b = { q: e.q, f: e.f }; sfx.bidTap(e.q); slatePop = 1; drawSlate(b, B.players[e.p].col, pName(e.p)); speak((pName(e.p) === 'YOU' ? 'You bid ' : pName(e.p) + ' bids ') + R.bidSay(b) + '.'); foxMood(e.p, 'determined'); }
      else if (e.kind === 'liar' || e.kind === 'spot') { if (e.kind === 'liar') sfx.liar(); else sfx.spot(); vib(40); flashMsg(pName(e.p) + (e.kind === 'liar' ? ': LIAR!' : ': SPOT ON!'), B.players[e.p].col); foxMood(e.p, 'surprised', true); speak((pName(e.p) === 'YOU' ? 'You call ' : pName(e.p) + ' calls ') + (e.kind === 'liar' ? 'liar!' : 'spot on!')); } }
    if (B.phase === 'reveal' && B.reveal) { const sig = B.mid + ':' + B.round; if (sig !== revealSig) { revealSig = sig; revealAt = now(); counted = 0; sfx.drumroll(0.8); seats.forEach((s, k) => setTimeout(() => sfx.lift(clamp(s.c.x, -1, 1)), 300 + k * 50)); } }
    if (B.phase === 'bid' && (!A || A.turn !== B.turn || A.phase !== 'bid')) { const t = B.turn; if (controls(t) || (B.mode === 'local' && B.players[t].kind === 'local')) { setTimeout(() => sfx.turn(), now() - rollAt < 1200 ? 1100 : 0); if (B.bid) speak((B.mode === 'local' ? B.players[t].name + ', your' : 'Your') + ' turn. Raise, or call liar.'); } }
    if (B.phase === 'end' && (!A || A.phase !== 'end')) onEnd(B); }
  function revealDone(B) { const r = B.reveal; if (!r || revDone) return; revDone = true; const lose = r.losers.map(pName), txt = r.kind === 'liar' ? (r.ok ? 'It was a lie! ' : 'It was true! ') : (r.ok ? 'Spot on! ' : 'Not exact. ');
    if (r.gainer >= 0) { sfx.gainDie(); flashMsg(pName(r.gainer) + ' WINS A DIE BACK', '#22c55e'); foxMood(r.gainer, 'excited', true); } else { sfx.loseDie(); flashMsg(lose.join(' + ') + ' LOSE' + (lose.length === 1 && lose[0] !== 'YOU' ? 'S' : '') + ' A DIE', '#ff9a8a'); r.losers.forEach(i => foxMood(i, 'sad')); const outs = r.losers.filter(i => B.players[i].n === 0); if (outs.length && B.phase !== 'end' && !(B.reveal && R.alive(B).length <= 1)) setTimeout(() => { sfx.out(); flashMsg(outs.map(pName).join(' + ') + (outs.map(pName).includes('YOU') ? ' ARE OUT' : ' IS OUT'), '#ff9a8a'); }, 1300); }
    speak(txt + r.count + ' on the table. ' + (r.gainer >= 0 ? (pName(r.gainer) === 'YOU' ? 'You win a die back.' : pName(r.gainer) + ' wins a die back.') : lose.map(x => x === 'YOU' ? 'You lose a die.' : x + ' loses a die.').join(' ')));
    const mi = myIdx(); if (!demo && B.mode !== 'local' && r.caller === mi && r.ok) { const k = 'call:' + B.mid + ':' + B.round; if (!paid.has(k)) { paid.add(k); save.setStat(SK('goodCalls'), save.stat(SK('goodCalls')) + 1); save.addGold(PAY.goodCall); } } }
  function onEnd(B) { const w = B.winner, mine = B.mode !== 'local' && w === myIdx(); setTimeout(() => { if (mine || B.mode === 'local') { sfx.win(); confetti(); foxMood(w, 'excited', true); } else sfx.lose(); emit(); }, 600);
    speak((B.mode === 'local' || !mine ? pName(w) + ' wins' : 'You win') + '!'); reward(B); }
  function reward(B) { const k = 'end:' + B.mid; if (paid.has(k) || demo || B.mode === 'local') return; paid.add(k); const mi = myIdx(); if (mi < 0) return;
    save.setStat(SK('played'), save.stat(SK('played')) + 1); save.addXp(PAY.xpMatch); endGold = 0; endNote = '';
    if (B.winner === mi) { endGold = PAY.winPerRival * (B.players.length - 1) + (B.lost[mi] === 0 ? PAY.flawless : 0); save.setStat(SK('wins'), save.stat(SK('wins')) + 1); if (B.mode === 'online') save.setStat(SK('onlineWins'), save.stat(SK('onlineWins')) + 1);
      if (!save.flag(SK('firstWin'))) { save.setFlag(SK('firstWin')); save.give(PAY.trophy); endNote = 'trophy'; } }
    if (endGold) { save.addGold(endGold); setTimeout(() => sfx.gold(Math.min(8, 2 + Math.round(endGold / 10))), 1100); } }

  // ---- confetti for the win (one instanced mesh) ----
  const CONF = 110, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.035, 0.06), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONF); conf.visible = false; conf.frustumCulled = false; scene.add(conf);
  const cP = [], cV = [], cR = [], cS = [], CCOL = ['#ec3013', '#ffd23a', '#38bdf8', '#22c55e', '#f3f2f2', '#a78bfa'], dummy = new THREE.Object3D(); let confT = 0;
  for (let i = 0; i < CONF; i++) { cP.push(V3()); cV.push(V3()); cR.push(new THREE.Euler()); cS.push(V3()); conf.setColorAt(i, new THREE.Color(CCOL[i % CCOL.length])); }
  function confetti() { if (RM) return; conf.visible = true; confT = 3.4; for (let i = 0; i < CONF; i++) { cP[i].set(rr(-0.6, 0.6), 0.3, rr(-0.4, 0.4)); cV[i].set(rr(-1.8, 1.8), rr(2.4, 4.4), rr(-1.4, 1.2)); cR[i].set(rr(0, 6), rr(0, 6), rr(0, 6)); cS[i].set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); } }
  function stepConfetti(dt) { if (confT <= 0) return; confT -= dt; if (confT <= 0) { conf.visible = false; return; }
    for (let i = 0; i < CONF; i++) { const v = cV[i]; v.y -= 5.2 * dt; v.multiplyScalar(1 - 1.6 * dt); if (cP[i].y < 0.04) { cP[i].y = 0.04; v.set(0, 0, 0); } else cR[i].set(cR[i].x + cS[i].x * dt, cR[i].y + cS[i].y * dt, cR[i].z + cS[i].z * dt);
      cP[i].addScaledVector(v, dt); dummy.position.copy(cP[i]); dummy.rotation.copy(cR[i]); dummy.scale.setScalar(Math.min(1, confT / 0.6)); dummy.updateMatrix(); conf.setMatrixAt(i, dummy.matrix); } conf.instanceMatrix.needsUpdate = true; }

  // ---- per-frame: cups, dice ----
  function stepSeats(t, dt) { const rolling = t - rollAt < 1100, vi = viewer(), rev = G && (G.phase === 'reveal' || G.phase === 'end') && G.reveal, cur = curtainFor(), sinceRoll = (t - rollAt) / 1000;
    const r = rev ? G.reveal : null, hitF = r ? r.bid.f : 0, revT = r ? (t - revealAt) / 1000 : 0;
    seats.forEach(s => { const p = G ? G.players[s.i] : null, n = p ? p.n : 5, vals = r ? (r.dice[s.i] || []) : p ? p.dice : s.dice.map(d => d.v);
      const mineSeen = G && s.i === vi && cur < 0 && G.phase === 'bid' && sinceRoll > 1.0, up = !G ? s.k === 0 : (rev && revT > 0.35) || mineSeen;
      // cup: shake at the roll, lift + tip toward its owner when open
      if (s.shakeT > 0) s.shakeT -= dt; const shaking = s.shakeT > 0.15 && !RM;
      s.lift = G && G.mode === 'local' && !up && !(rev) ? Math.min(s.lift, damp(s.lift, 0, 30, dt)) : damp(s.lift, up ? 1 : 0, 7, dt); /* pass & play: a cup closes at once when the turn moves on */ const out = V3(Math.sin(s.a), 0, -Math.cos(s.a)); // away from the centre, toward the owner
      const front = s.k === 0 && !(G && G.mode === 'local'), side = V3(Math.cos(s.a), 0, Math.sin(s.a));   // the front seat (you) sets the cup aside so it never hides your dice
      if (front) s.cup.position.set(s.c.x + 0.38 * s.lift + (shaking ? Math.sin(t * 0.05) * 0.02 : 0), 0.12 * Math.sin(Math.PI * clamp(s.lift, 0, 1)) + (shaking ? Math.abs(Math.sin(t * 0.04)) * 0.12 : 0), s.c.z + 0.06 * s.lift);
      else s.cup.position.set(s.c.x + out.x * 0.24 * s.lift + (shaking ? Math.sin(t * 0.05) * 0.02 : 0), 0.32 * s.lift + (shaking ? Math.abs(Math.sin(t * 0.04)) * 0.12 : 0), s.c.z + out.z * 0.24 * s.lift);
      s.cup.rotation.set(0, 0, 0); if (!front) s.cup.rotateOnWorldAxis(side, -1.15 * s.lift); if (shaking) s.cup.rotateOnWorldAxis(V3(1, 0, 0), Math.sin(t * 0.03) * 0.12);
      s.sh.position.set(s.cup.position.x, 0.008, s.cup.position.z);
      const isOut = !!(G && p && p.n === 0 && !(rev && r.losers.includes(s.i) && !revDone)), myTurnRing = G && G.phase === 'bid' && G.turn === s.i && !rolling;
      s.ring.material.opacity = myTurnRing ? 0.55 + Math.sin(t / 180) * 0.3 : isOut ? 0 : 0.18; s.ring.scale.setScalar(myTurnRing ? 1 + Math.sin(t / 180) * 0.04 : 1);
      if (G && p) drawPlate(s, s.i === myIdx() && G.mode !== 'local' ? 'YOU' : p.name, p.n, isOut, myTurnRing); s.plate.visible = !!G;
      s.tip = damp(s.tip, isOut ? 1 : 0, 5, dt); if (s.tip > 0.01) { s.cup.position.set(s.c.x, 0.2 * s.tip, s.c.z); s.cup.rotation.set(0, 0, 0); s.cup.rotateOnWorldAxis(side, Math.PI / 2 * s.tip); s.cup.rotateOnWorldAxis(V3(0, 1, 0), 0.6 * s.tip); }
      // dice under the cup
      const ca = Math.cos(s.inward), sa = Math.sin(s.inward);
      s.dice.forEach((d, j) => { const v = vals[j] || 0, showN = r ? (r.dice[s.i] || []).length : n; d.m.visible = j < showN && v > 0 && (s.lift > 0.25 || !G);
        if (!d.m.visible) return; const [ox, oz] = OFF[j] || [0, 0]; const hit = r && revT > 0.8 && R.matches(v, hitF, G.opts.wild); const order = r ? hitOrder(s.i, j) : -1, lit = hit && order < counted;
        d.tp.set(s.c.x + ox * ca + oz * sa, DS / 2 + 0.008 + (lit ? 0.05 : 0), s.c.z - ox * sa + oz * ca); if (d.v !== v) { d.v = v; d.yaw = rr(-0.5, 0.5); }
        d.tq.copy(faceQuat(v, s.inward + Math.PI + d.yaw));
        const loseIt = r && revDone && r.losers.includes(s.i) && j === (r.dice[s.i] || []).length - 1;
        d.out = damp(d.out, loseIt ? 1 : 0, 4, dt); d.m.position.x = damp(d.m.position.x, d.tp.x, 12, dt); d.m.position.z = damp(d.m.position.z, d.tp.z, 12, dt); d.m.position.y = damp(d.m.position.y, d.tp.y + d.out * 0.4, 12, dt);
        d.m.quaternion.slerp(d.tq, 1 - Math.exp(-12 * dt)); d.m.scale.setScalar(Math.max(0.001, 1 - d.out)); d.m.material.emissiveIntensity = damp(d.m.material.emissiveIntensity, lit ? 0.55 : r && revT > 0.8 && !hit ? 0 : 0, 10, dt);
        d.m.material.color.setScalar(r && revT > 0.8 && !hit ? 0.55 : 1); }); }); }
  let hitList = [], hitTotal = 0, revDone = false;
  function computeHits() { hitList = []; if (!G || !G.reveal) { hitTotal = 0; return; } const r = G.reveal; seats.slice().sort((a, b) => a.k - b.k).forEach(s => (r.dice[s.i] || []).forEach((v, j) => { if (R.matches(v, r.bid.f, G.opts.wild)) hitList.push(s.i + ':' + j); })); hitTotal = hitList.length; }
  const hitOrder = (i, j) => hitList.indexOf(i + ':' + j);

  // ---- HUD ----
  function flashMsg(t, col = '#ffd23a') { flash = { t, col, until: now() + 2100 }; emit(); }
  function speak(t) { sayTxt = t; if (!voice || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 1.05; speechSynthesis.speak(u); } catch (e) {} }
  let emitQ = false; function emit() { if (emitQ) return; emitQ = true; queueMicrotask(() => { emitQ = false; onState(hud()); }); }
  function hud() {
    const base = { ready: true, music: sfx.music, voice, showOdds, gold: save.data.gold, wins: save.stat(SK('wins')), played: save.stat(SK('played')), goodCalls: save.stat(SK('goodCalls')), online: !!net, say: sayTxt,
      flash: flash && now() < flash.until ? flash : null, demo: demo ? { cap: demo.cap, key: demo.key, n: demo.n, of: DEMO.length, paused: !!demo.paused } : null };
    if (!G) return { ...base, phase: 'menu' };
    const vi = viewer(), cur = curtainFor(), ph = G.phase, mine = controls(vi), total = R.totalDice(G), rolling = now() - rollAt < 1100;
    const myDice = vi >= 0 && cur < 0 && (ph === 'bid' || ph === 'reveal' || ph === 'end') && !rolling && G.players[vi].dice.every(v => v > 0) ? G.players[vi].dice.slice() : [];
    const bid = G.bid ? { q: G.bid.q, f: G.bid.f, name: pName(G.bid.p), col: G.players[G.bid.p].col } : null;
    const odds = bid && myDice.length && showOdds ? { t: R.oddsTrue(bid, myDice, unknownFor(vi), G.opts.wild), e: R.oddsExact(bid, myDice, unknownFor(vi), G.opts.wild) } : null;
    const r = G.reveal, revT = r ? (now() - revealAt) / 1000 : 0;
    const reveal = r && (ph === 'reveal' || ph === 'end') ? { kind: r.kind, caller: pName(r.caller), callerCol: G.players[r.caller].col, bidder: pName(r.bid.p), bid: r.bid, count: r.count, shown: Math.max(0, Math.min(counted, r.count)), done: revDone, ok: r.ok,
      losers: r.losers.map(pName), gainer: r.gainer >= 0 ? pName(r.gainer) : '', rows: G.players.map((p, i) => ({ name: pName(i), col: p.col, dice: (r.dice[i] || []).map((v, j) => ({ v, hit: R.matches(v, r.bid.f, G.opts.wild), lit: hitOrder(i, j) >= 0 && hitOrder(i, j) < counted })), lose: r.losers.includes(i), gain: r.gainer === i, out: p.n === 0 })) } : null;
    return { ...base, phase: ph, mode: G.mode, round: G.round, seq: G.seq, opts: G.opts, total, rolling,
      players: G.players.map((p, i) => ({ name: pName(i), col: p.col, n: p.n, turn: ph === 'bid' && G.turn === i, out: p.n === 0, gone: p.gone, me: i === myIdx() && G.mode !== 'local', cpu: !!p.cpu })),
      vi, viName: vi >= 0 ? pName(vi) : '', viCol: vi >= 0 ? G.players[vi].col : '#ffd23a', mine, myTurn: mine && ph === 'bid' && G.turn === vi, turnName: ph === 'bid' ? pName(G.turn) : '', turnCol: ph === 'bid' ? G.players[G.turn].col : '#ffd23a',
      curtain: cur >= 0 ? { name: G.players[cur].name, col: G.players[cur].col, why: G.bid ? pName(G.bid.p) + ' bid ' + R.bidSay(G.bid) + '. Raise, or call LIAR.' : 'You start the round. Make the first bid.' } : null,
      myDice, unknown: vi >= 0 ? unknownFor(vi) : 0, bid, odds, min: R.minRaise(G.bid, G.opts), minFace: R.minFace(G.opts), history: G.history.slice(-4).map(b => ({ name: pName(b.p), col: G.players[b.p].col, q: b.q, f: b.f })),
      canCall: mine && ph === 'bid' && G.turn === vi && !!G.bid, canSpot: mine && ph === 'bid' && G.turn === vi && !!G.bid && G.opts.spot,
      reveal, revealAuto: G.mode !== 'local',
      winner: ph === 'end' ? pName(G.winner) : '', winMine: ph === 'end' && G.mode !== 'local' && G.winner === myIdx(), endGold, endNote,
      board: G.players.map((p, i) => ({ i, name: pName(i), col: p.col, n: p.n, lost: G.lost[i], me: i === myIdx() && G.mode !== 'local' })).sort((a, b) => (a.i === G.winner ? -1 : b.i === G.winner ? 1 : b.n - a.n || a.lost - b.lost)) };
  }

  // ---- authority driver: CPUs, auto-advance, players who left ----
  function drive(t) { if (!G || demo || !isAuth()) return; const since = t - lastChange;
    if (G.phase === 'bid') { const p = G.players[G.turn], bot = p.cpu ? CPUS.find(c => c.key === p.cpu) : (p.gone || (p.kind === 'net' && since > 45000)) ? { skill: 0.7, bluff: 0.2 } : null;
      if (bot && since > (t - rollAt < 1500 ? 2300 : 1500) + Math.random() * 300) { const m = R.cpuMove(G, G.turn, bot.skill, bot.bluff); if (!act(G.turn, m)) act(G.turn, { a: 'liar' }); } return; }
    if (G.phase === 'reveal' && G.reveal) { const need = 1600 + hitTotal * 450 + (G.mode === 'local' ? 6000 : 3000); if (t - revealAt > need && since > 1500) act(-1, { a: 'next' }); } }

  // ---- frame loop ----
  let raf = 0, lastT = now(), alive = true, skipF = false, tAcc = 0, zoomK = 0;
  function frame(t) { if (!alive) return; raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (t - lastT) / 1000); lastT = t; tAcc += dt; if (document.hidden) return; if (touch && (skipF = !skipF)) { lastT = t - dt * 1000; return; }
    drive(t);
    if (G && G.reveal && (G.phase === 'reveal' || G.phase === 'end')) { if (!hitList.length) computeHits(); const want = Math.min(hitTotal, Math.max(0, Math.floor(((t - revealAt) / 1000 - 0.9) / 0.38) + 1));
      if (want > counted) { counted = want; sfx.count(counted); emit(); if (counted >= hitTotal) setTimeout(() => { if (G && G.reveal) { revealDone(G); emit(); } }, 500); } else if (hitTotal === 0 && !revDone && t - revealAt > 1300) { revealDone(G); emit(); } }
    if (flash && t > flash.until) { flash = null; emit(); }
    stepSeats(t, dt); stepConfetti(dt);
    slatePop = Math.max(0, slatePop - dt * 3); slate.scale.setScalar(1 + Math.sin(slatePop * Math.PI) * 0.12); slate.position.y = 0.02 + Math.sin(slatePop * Math.PI) * 0.05;
    if (G && G.reveal && (G.phase === 'reveal' || G.phase === 'end')) drawSlate(G.reveal.bid, null, '', '', Math.max(0, counted));
    else if (G && G.bid) drawSlate({ q: G.bid.q, f: G.bid.f }, G.players[G.bid.p].col, pName(G.bid.p));
    const push = G && G.reveal && G.phase === 'reveal' && !RM ? 1 : 0; zoomK = damp(zoomK, push, 2.5, dt);
    for (const s of seats) { if (!s.fox) continue; const u = s.fox.userData; if (u.moodT > 0) { u.moodT -= dt; if (u.moodT <= 0) u.mood = u.base || 'neutral'; } kit.animFox(s.fox, dt, 0); const active = G && G.phase === 'bid' && G.turn === s.i; u.lookAt = active ? V3(0, 0.1, 0) : LOOK_YOU; s.fox.position.y = damp(s.fox.position.y, u.seatY + (active ? 0.1 : 0) - (G && G.players[s.i] && G.players[s.i].n === 0 ? 0.25 : 0), 6, dt); }
    const sw = RM ? 0 : 1; camera.position.set(shot.pos.x + Math.sin(tAcc * 0.3) * 0.015 * sw, shot.pos.y + Math.sin(tAcc * 0.23) * 0.01 * sw, shot.pos.z).lerp(shot.look, 0.07 * zoomK); camera.lookAt(shot.look);
    renderer.render(scene, camera); }
  const onVis = () => sfx.suspend(document.hidden); document.addEventListener('visibilitychange', onVis);
  buildSeats(); fitCam(); raf = requestAnimationFrame(frame); emit();
  function resetReveal() { hitList = []; hitTotal = 0; counted = 0; revDone = false; }

  // ---- DEMO (pausable, with NEXT STEP) ----
  let skip = null; const wait = ms => new Promise(r => { let left = ms, last = performance.now(); const tk = () => { const t = performance.now(); if (!demo || !demo.paused) left -= t - last; last = t; if (left <= 0 || skip === 'go') { if (skip === 'go') skip = null; r(); } else setTimeout(tk, 50); }; setTimeout(tk, 50); });
  async function demoRun(tok) { const ok = () => demo && tok === demoTok;
    for (let i = 0; i < DEMO.length; i++) { if (!ok()) return; const st = DEMO[i]; demo.n = i + 1; demo.cap = st.cap; demo.key = st.key || ''; speak(st.cap); emit();
      for (const a of st.acts || []) { if (!ok()) return; await wait(a.pause ?? 900); if (!ok()) return;
        if (a.a === 'next') { resetReveal(); act(-1, { a: 'next', rig: DEMO_RIGS[a.rig] }); } else act(a.p, a.a === 'bid' ? { a: 'bid', q: a.q, f: a.f } : { a: a.a }); }
      await wait(st.wait ?? 2500); }
    if (ok()) api.demoStop(); }

  // ---- public API ----
  const api = {
    hud, input, isAuth, get state() { return G; }, _dbg: { scene, camera, renderer, SAFE },
    setSafe(top, bottom, left = 0, right = 0) { if ([top - SAFE.top, bottom - SAFE.bottom, left - SAFE.left, right - SAFE.right].some(v => Math.abs(v) > 2)) { Object.assign(SAFE, { top, bottom, left, right }); fitCam(); } },
    // offline: mode 'cpu' (n = CPU foxes 1–5) | 'local' (n = players 2–6). opts: { wild, spot, start }
    start({ mode = 'cpu', n = 2, opts = {}, cpus } = {}) { sfx.on(); api.netEnd(true); demo = null; demoTok++; let players;
      if (mode === 'local') players = Array.from({ length: clamp(n, 2, 6) }, (_, i) => ({ name: COLS[i][0], col: COLS[i][1], kind: 'local' }));
      else { players = [{ name: 'YOU', col: COLS[0][1], kind: 'me' }]; const ks = (cpus && cpus.length ? cpus : CPUS.map(c => c.key)).slice(0, clamp(n, 1, 5)); ks.forEach((k, i) => players.push({ name: CPUS.find(c => c.key === k).name, col: COLS[i + 1][1], kind: 'cpu', cpu: k })); }
      resetReveal(); const prev = G; G = R.newMatch({ players, opts, mode }); endGold = 0; endNote = ''; changed(prev); },
    rematch() { if (!G || net) return; api.start({ mode: G.mode, n: G.mode === 'local' ? G.players.length : G.players.length - 1, opts: G.opts, cpus: G.players.filter(p => p.cpu).map(p => p.cpu) }); },
    toMenu() { demo = null; demoTok++; api.netEnd(true); G = null; resetReveal(); buildSeats(); drawSlate(null, null, '', "LIAR'S DICE"); emit(); },
    demoStart() { sfx.on(); api.netEnd(true); demoTok++; demo = { n: 0, cap: '', key: '', paused: false }; resetReveal(); const prev = G;
      G = R.newMatch({ players: [{ name: 'YOU', col: COLS[0][1], kind: 'me' }, { name: 'HOPE', col: COLS[1][1], kind: 'cpu', cpu: 'hope' }], opts: { wild: true, spot: true, start: 5 }, mode: 'cpu' }); G.round = 0; G.starter = 0; R.startRound(G, DEMO_RIGS[0]); G.demo = true; changed(prev); demoRun(demoTok); },
    demoStop() { if (!demo) return; demo = null; demoTok++; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} api.toMenu(); },
    demoPause() { if (!demo) return; demo.paused = !demo.paused; if (window.speechSynthesis) try { demo.paused ? speechSynthesis.pause() : speechSynthesis.resume(); } catch (e) {} emit(); },
    demoNext() { if (!demo) return; demo.paused = false; skip = 'go'; emit(); },
    // HINT: what a strong fox would do now (a bid to make, or a call)
    hint() { sfx.on(); if (!G || demo) return null; const vi = viewer(); if (!controls(vi) || G.phase !== 'bid' || G.turn !== vi) return null; const m = R.cpuMove(G, vi, 1, 0);
      const t = m.a === 'bid' ? 'BID ' + m.q + ' × ' + m.f + ' (' + Math.round(R.oddsTrue(m, G.players[vi].dice, unknownFor(vi), G.opts.wild) * 100) + '% TRUE)' : m.a === 'liar' ? 'CALL LIAR' : 'CALL SPOT ON';
      flashMsg('HINT · ' + t, '#7dd3fc'); speak('Hint: ' + (m.a === 'bid' ? 'bid ' + R.bidSay(m) : m.a === 'liar' ? 'call liar' : 'call spot on') + '.'); emit(); return m; },
    setMusic(on) { sfx.on(); sfx.setMusic(on); save.setStat(SK('music'), on ? 1 : 0); emit(); },
    setVoice(on) { voice = !!on; save.setStat(SK('voice'), voice ? 1 : 0); if (voice) speak('Voice on.'); else if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} emit(); },
    setOdds(on) { showOdds = !!on; save.setStat(SK('odds'), on ? 1 : 0); emit(); },
    sound: () => sfx,
    // ONLINE: the page runs the lobby (engine/duel-net.js); the host's device runs the match and sends each player only their own dice
    netBegin({ me, players, send, hostId, opts = {} }) { net = { me, send, hostId }; endGold = 0; demo = null; resetReveal();
      if (isAuth()) { const prev = G; G = R.newMatch({ players: players.map(p => ({ id: p.id, name: p.name, col: p.col, kind: 'net' })), opts, mode: 'online' }); changed(prev); }
      else { G = null; flashMsg('WAITING FOR THE HOST…', '#7dd3fc'); } },
    netRecv(t, d, from) { if (!net || !d) return;
      if (t === 'st') { if (isAuth() && G && from !== net.hostId()) return; if (G && d.mid === G.mid && d.seq <= G.seq) return; const prev = G; if (!prev || prev.round !== d.round || prev.phase !== d.phase) resetReveal(); G = d; lastChange = now(); effects(prev, G); emit(); return; }
      if (t === 'ev' && d.k === 'in' && isAuth() && G && d.mid === G.mid) { const p = G.players.findIndex(x => x.id === from); if (p < 0 && d.a !== 'next') return; if (d.a === 'next') resetReveal(); act(p, { a: d.a, q: d.q, f: d.f, at: d.at }); } },
    netDrop(id) { if (!net || !G) return; const i = G.players.findIndex(p => p.id === id); if (i < 0 || G.players[i].gone) return; if (isAuth()) { const prev = clone(G); G.players[i].gone = true; G.seq++; changed(prev); flashMsg(G.players[i].name + ' LEFT · A FOX PLAYS FOR THEM', '#ff9a8a'); } },
    netHostCheck() { if (net && G && isAuth()) { G.seq++; broadcast(); lastChange = now(); } },
    netOn: () => !!net,
    netEnd(silent) { net = null; if (G && G.mode === 'online') { G = null; resetReveal(); buildSeats(); } if (!silent) emit(); },
    destroy() { alive = false; sfx.stop(); document.removeEventListener('visibilitychange', onVis); cancelAnimationFrame(raf); ro && ro.disconnect(); removeEventListener('resize', resize); try { speechSynthesis && speechSynthesis.cancel(); } catch (e) {} renderer.dispose(); renderer.domElement.remove(); },
  };
  return api;
}
