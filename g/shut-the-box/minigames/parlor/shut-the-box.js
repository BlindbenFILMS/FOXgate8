// 8 GATES — SHUT THE BOX [shutBox]. Minigame #6 (CARDS & DICE). A wooden dice box on a tavern table that fits any building on any world.
// Rules: tiles 1–9 stand open. Roll two dice, then shut any open tiles that add up to the roll. Keep rolling until you can't.
// Once 7, 8 and 9 are all shut you may roll ONE die. Your score is what is left open (lower wins). Shut every tile = SHUT THE BOX (score 0).
// Modes: SOLO (beat your best) · VS FOXES (1–4 CPU foxes) · PASS & PLAY (2–5 on one phone) · ONLINE (2–5 friends, engine/duel-net.js, host-run).
// MERGE: createShutTheBox({ container, onState, theme }) stands alone. A world can mount it in any interior (it builds its own table + room);
// theme = a world key (meru, gaya, jidda, kufa, luxor, nebo, ur, zion, home, earth, station) recolours the felt, wood and walls.
// Only uses files that exist in the kit: vendor/three, fox-kit.js, engine/cast.js, engine/textures.js, engine/save.js. Save keys all start 'shutBox.'.
import * as THREE from '../../vendor/three/three.module.js';
import { foxKit, PLAYER_MALE, PLAYER_FEMALE, KING_MIGHT } from '../../fox-kit.js';
import { castKit, loadCastRigs } from '../../engine/cast.js';
import { crestTex, canvasTex, FONT } from '../../engine/textures.js';
import { save } from '../../engine/save.js';
import { bakeCreature } from '../../engine/bake.js';
import { makeAudio } from './shut-the-box-audio.js';

export const SHUT_BOX = { name: 'SHUT THE BOX', room: 'shutBox', key: 'shutBox', maxPlayers: 5, number: 6 };
export const SK = k => 'shutBox.' + k;   // every save stat/flag this game writes
export const COLS = [['RED', '#ec3013'], ['BLUE', '#38bdf8'], ['GOLD', '#ffd23a'], ['GREEN', '#22c55e'], ['VIOLET', '#a78bfa']];
// DRAFT for Ben: gold + XP
export const PAY = { shut: 20, firstShut: 'shutBoxTrophy', winPerRival: 10, soloLowAt: 9, soloLow: 5, xpMatch: 5, xpShut: 10 };
// DRAFT for Ben: the CPU table. Hope + Noble come from engine/cast.js, the rest are fox-kit looks with Meru names.
export const CPUS = [
  { key: 'hope', name: 'HOPE', cast: 'hope', skill: 0.92, win: 'Listen to those tiles fall!', lose: 'Next round is mine.' },
  { key: 'noble', name: 'NOBLE', cast: 'noble', skill: 0.85, win: 'Too easy.', lose: 'The dice hate me.' },
  { key: 'king', name: 'KING MIGHT', fox: { look: KING_MIGHT, torso: ['#7c3aed', '#e6b45a', '#3b0764'], outfit: 'royal', crown: true, mood: 'stern' }, skill: 0.97, win: 'A king never gambles. He wins.', lose: 'Hm. Well played.' },
  { key: 'marla', name: 'MARLA', fox: { look: PLAYER_FEMALE, torso: ['#f472b6', '#fce7f3', '#9d174d'], outfit: 'coat', mood: 'happy' }, skill: 0.6, win: 'Ha! Snap snap snap!', lose: 'Oh, rats.' },
  { key: 'otto', name: 'OTTO', fox: { look: PLAYER_MALE, torso: ['#2f5d2a', '#e6b45a', '#1a3318'], outfit: 'vest', mood: 'neutral' }, skill: 0.5, win: 'Beginner\'s luck. Mine.', lose: 'I was never good at sums.' }];
export const THEMES = {
  meru: { felt: '#1f6f4a', wood: '#7a4a26', woodD: '#4f2e16', trim: '#e6b45a', back: '#c42d3c', table: '#5a3a22', wall: ['#3a2a4a', '#1a1426'] },
  gaya: { felt: '#2b5a8a', wood: '#8a6a4a', woodD: '#5a4230', trim: '#e2e8f0', back: '#38bdf8', table: '#6a5240', wall: ['#2a3a5a', '#141a2c'] },
  jidda: { felt: '#0e7f8a', wood: '#c49a6c', woodD: '#8a6640', trim: '#ffd23a', back: '#0e7fb8', table: '#a4804e', wall: ['#2a5a6a', '#123038'] },
  kufa: { felt: '#8a3a2a', wood: '#b07a46', woodD: '#7a5028', trim: '#ffd23a', back: '#c2410c', table: '#8a6236', wall: ['#5a3a2a', '#2a1a12'] },
  luxor: { felt: '#2a2a2a', wood: '#5a4a3a', woodD: '#2a221a', trim: '#e6b45a', back: '#ec3013', table: '#3a302a', wall: ['#3a3434', '#141212'] },
  nebo: { felt: '#3a6a2a', wood: '#8a5a2a', woodD: '#5a3a18', trim: '#f6d27a', back: '#22c55e', table: '#6a4420', wall: ['#2a4030', '#121e16'] },
  ur: { felt: '#6a4a8a', wood: '#a88a5a', woodD: '#705a36', trim: '#e6b45a', back: '#7c3aed', table: '#806a44', wall: ['#4a3a5a', '#1e1628'] },
  zion: { felt: '#7a2a2a', wood: '#9a6a3a', woodD: '#643f1e', trim: '#ffd23a', back: '#b45309', table: '#7a5230', wall: ['#5a3a2a', '#24160e'] },
  home: { felt: '#1f5f6f', wood: '#8a5a3a', woodD: '#5a3a22', trim: '#f3f2f2', back: '#ec3013', table: '#6a4a30', wall: ['#3a3a4a', '#16161e'] },
  earth: { felt: '#1a5a3a', wood: '#6a4a3a', woodD: '#3a2a20', trim: '#d4d4d8', back: '#1e3a8a', table: '#4a3a30', wall: ['#30343e', '#121418'] },
  station: { felt: '#1e293b', wood: '#64748b', woodD: '#334155', trim: '#38bdf8', back: '#38bdf8', table: '#475569', wall: ['#0f1a2e', '#04070f'] } };

// ---------------- rules (pure, shared by every client) ----------------
export const N_TILES = 9;
const sum = a => a.reduce((s, x) => s + x, 0);
export const openList = tiles => tiles.reduce((r, o, i) => (o && r.push(i + 1), r), []);
export function combos(open, total) { const out = [], n = open.length; for (let m = 1; m < (1 << n); m++) { let s = 0; const c = []; for (let i = 0; i < n && s <= total; i++) if (m & (1 << i)) { s += open[i]; c.push(open[i]); } if (s === total) out.push(c); } return out; }
export const oneDieOk = tiles => !tiles[6] && !tiles[7] && !tiles[8];
export function scoreOf(tiles, scoring) { const o = openList(tiles); if (!o.length) return 0; return scoring === 'digits' ? +o.join('') : sum(o); }
export function cpuPick(tiles, total, skill = 0.8) { const cs = combos(openList(tiles), total); if (!cs.length) return null; if (Math.random() > skill) return cs[Math.floor(Math.random() * cs.length)];
  cs.sort((a, b) => a.length - b.length || Math.max(...b) - Math.max(...a)); return cs[0]; }
export function cpuDice(tiles) { return oneDieOk(tiles) && sum(openList(tiles)) <= 8 ? 1 : 2; }
const d6 = () => 1 + Math.floor(Math.random() * 6);
const fullBox = () => Array(N_TILES).fill(true);

export function newMatch({ players, rounds = 3, scoring = 'sum', mode = 'solo' }) {
  return { v: 1, mid: Math.floor(Math.random() * 1e9), seq: 0, mode, rounds, scoring, players: players.map(p => ({ gone: false, ...p, total: 0, scores: [] })), round: 1, turn: 0, tiles: fullBox(), dice: [], diceN: 2, rollId: 0, sel: [], phase: 'roll', res: null };
}
const firstLive = G => G.players.findIndex(p => !p.gone);
// apply one action to the match. Only the authority (the device, or the online host) calls this. Returns true if anything changed.
export function applyAct(G, a) {
  const P = G.players[G.turn], total = sum(G.dice);
  if (a.a === 'dice') { if (G.phase !== 'roll' || !oneDieOk(G.tiles)) return false; const n = a.n === 1 ? 1 : 2; if (n === G.diceN) return false; G.diceN = n; return true; }
  if (a.a === 'roll') { if (G.phase !== 'roll') return false; if (!oneDieOk(G.tiles)) G.diceN = 2; G.dice = Array.isArray(a.rig) && a.rig.length === G.diceN ? a.rig.slice() : G.diceN === 1 ? [d6()] : [d6(), d6()]; G.rollId++; G.sel = [];
    if (!combos(openList(G.tiles), sum(G.dice)).length) endTurn(G, false); else G.phase = 'pick'; return true; }
  if (a.a === 'sel') { const n = a.n | 0; if (G.phase !== 'pick' || n < 1 || n > N_TILES || !G.tiles[n - 1]) return false; const i = G.sel.indexOf(n); if (i >= 0) G.sel.splice(i, 1); else G.sel.push(n); G.sel.sort((x, y) => x - y); return true; }
  if (a.a === 'clear') { if (G.phase !== 'pick' || !G.sel.length) return false; G.sel = []; return true; }
  if (a.a === 'shut') { if (G.phase !== 'pick' || sum(G.sel) !== total) return false; G.sel.forEach(n => G.tiles[n - 1] = false); G.sel = []; if (!G.tiles.some(Boolean)) endTurn(G, true); else G.phase = 'roll'; return true; }
  if (a.a === 'quit') { if (G.phase !== 'roll' && G.phase !== 'pick') return false; endTurn(G, false); return true; }   // a dropped / timed-out player keeps what is left
  if (a.a === 'next') { if (a.at != null && a.at !== G.seq) return false;
    if (G.phase === 'over') { let k = G.turn + 1; while (k < G.players.length && G.players[k].gone) k++; if (k < G.players.length) { startTurn(G, k); return true; } G.phase = G.round < G.rounds ? 'round' : 'end'; G.res = null; return true; }
    if (G.phase === 'round') { G.round++; startTurn(G, firstLive(G)); return true; }
    return false; }
  return false;
  function startTurn(G, k) { G.turn = k; G.tiles = fullBox(); G.dice = []; G.diceN = 2; G.sel = []; G.res = null; G.phase = 'roll'; }
}
function endTurn(G, shut) { const P = G.players[G.turn], score = shut ? 0 : scoreOf(G.tiles, G.scoring); P.scores[G.round - 1] = score; P.total = sum(P.scores.filter(x => x != null)); G.res = { idx: G.turn, score, shut, left: openList(G.tiles) }; G.phase = 'over'; }
export function standings(G) { return G.players.map((p, i) => ({ ...p, i })).sort((a, b) => (a.gone - b.gone) || a.total - b.total || a.i - b.i); }

// ---------------- the DEMO script (you vs Hope). Each step: caption, the button it shows, the moves, then a pause. ----------------
const R = (...rig) => ({ a: 'roll', rig, pause: 900 }), SEL = n => ({ a: 'sel', n, pause: 700 }), SHUT = { a: 'shut', pause: 800 };
export const DEMO = [
  { cap: 'Nine tiles stand open. At the end of your turn, whatever is still open is your score. Lowest score wins.', wait: 3600 },
  { cap: 'Roll two dice.', key: 'ROLL', acts: [R(6, 3)], wait: 900 },
  { cap: '6 + 3 = 9. Flip down tiles that add up to 9. The 9 on its own works.', key: 'TAP 9 · SHUT', acts: [SEL(9), SHUT], wait: 1600 },
  { cap: 'Roll again. 4 + 4 = 8, so flip the 8.', key: 'ROLL · 8 · SHUT', acts: [R(4, 4), SEL(8), SHUT], wait: 1400 },
  { cap: '5 + 2 = 7. Flip the 7.', key: 'ROLL · 7 · SHUT', acts: [R(5, 2), SEL(7), SHUT], wait: 1600 },
  { cap: '7, 8 and 9 are down, so you may now roll ONE die. Big tiles are still open, so keep two dice.', key: 'TWO DICE', wait: 3800 },
  { cap: '6 + 5 = 11. No tile says 11, so use two tiles: 6 and 5. Green edges show tiles that still fit.', key: 'TAP 6 + 5 · SHUT', acts: [R(6, 5), SEL(6), SEL(5), SHUT], wait: 1800 },
  { cap: 'Only 1, 2, 3 and 4 are left. Switch to ONE die: small numbers are easier to hit.', key: 'ONE DIE', acts: [{ a: 'dice', n: 1, pause: 1200 }], wait: 2200 },
  { cap: 'Rolled a 4. Flip the 4.', key: 'ROLL · 4 · SHUT', acts: [R(4), SEL(4), SHUT], wait: 1400 },
  { cap: 'A 3 can be the 3 tile, or 1 + 2. Take 1 + 2 and keep the 3 for later.', key: 'TAP 1 + 2 · SHUT', acts: [R(3), SEL(1), SEL(2), SHUT], wait: 1600 },
  { cap: 'Another 3. Flip the last tile…', key: 'ROLL · 3 · SHUT', acts: [R(3), SEL(3), SHUT], wait: 1200 },
  { cap: 'SHUT THE BOX! Every tile is down: score 0. In a real game that is +20 gold.', wait: 4200 },
  { cap: "Hope's turn. Watch what happens when nothing fits.", key: 'NEXT', acts: [{ a: 'next', pause: 600 }], wait: 1800 },
  { cap: 'Hope rolls 12 and flips 9 + 3.', acts: [R(6, 6), SEL(9), SEL(3), SHUT], wait: 1200 },
  { cap: 'Then 10: she flips 8 + 2.', acts: [R(5, 5), SEL(8), SEL(2), SHUT], wait: 1200 },
  { cap: 'Then 12 again: 7 + 5.', acts: [R(6, 6), SEL(7), SEL(5), SHUT], wait: 1400 },
  { cap: 'Now she rolls 1 + 1 = 2. The 2 is already down, and 1, 4 and 6 cannot make 2.', acts: [R(1, 1)], wait: 3000 },
  { cap: 'Stuck, so her turn ends. Her score is what is still open: 1 + 4 + 6 = 11.', wait: 3800 },
  { cap: 'Lowest score wins: you beat Hope 0 to 11. Now try it yourself: tap EXIT DEMO, then PLAY.', key: 'EXIT DEMO', wait: 6000 }];

// ---------------- small helpers (fox-kit wants these) ----------------
const rr = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)], clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }, damp = (a, b, l, dt) => a + (b - a) * (1 - Math.exp(-l * dt));
const ease = t => 1 - Math.pow(1 - t, 3);

// ---------------- the game ----------------
export async function createShutTheBox({ container, onState = () => {}, theme = 'meru', music = true } = {}) {
  const TH = THEMES[theme] || THEMES.meru, touch = matchMedia('(pointer: coarse)').matches;
  const CW = () => container.clientWidth || 1, CH = () => container.clientHeight || 1;
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, touch ? 1.75 : 2)); renderer.setSize(CW(), CH()); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = !touch; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'display:block;width:100%;height:100%;touch-action:none;outline:none'; container.appendChild(renderer.domElement);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, 0.05, 60), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  // toon ramp + ink outline (same recipe as engine/restaurant-kit.js, copied so this file needs no world module)
  const grad = new THREE.DataTexture(new Uint8Array([110, 110, 110, 255, 190, 190, 190, 255, 255, 255, 255, 255]), 3, 1, THREE.RGBAFormat); grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const cache = new Map(), toon = (c, extra) => { const k = c + (extra ? JSON.stringify(extra) : ''); if (!cache.has(k)) cache.set(k, new THREE.MeshToonMaterial({ color: c, gradientMap: grad, ...extra })); return cache.get(k); };
  const outlineMat = new THREE.MeshBasicMaterial({ color: 0x1a1626, side: THREE.BackSide });
  function addOutline(mesh, t = 0.02, radius) { const g = mesh.geometry; g.computeBoundingBox(); const s = V3(); g.boundingBox.getSize(s); const o = new THREE.Mesh(g, outlineMat); if (radius) o.scale.setScalar(1 + t / radius); else o.scale.set(1 + 2 * t / Math.max(s.x, 0.01), 1 + 2 * t / Math.max(s.y, 0.01), 1 + 2 * t / Math.max(s.z, 0.01)); o.raycast = () => {}; mesh.add(o); return mesh; }
  function M(geo, mat, x = 0, y = 0, z = 0, parent, outline = 0.012, radius) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = !touch; if (outline) addOutline(m, outline, radius); (parent || scene).add(m); return m; }
  const sfx = makeAudio(); sfx.setMusic(music && save.stat(SK('music'), 1) !== 0);
  const RM = matchMedia('(prefers-reduced-motion: reduce)').matches, vib = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  try { if (document.fonts) await Promise.race([document.fonts.load('900 100px Archivo'), new Promise(r => setTimeout(r, 700))]); } catch (e) {}
  const texMat = (map, extra) => new THREE.MeshToonMaterial({ map, gradientMap: grad, ...extra });
  // procedural wood grain (long grain lines + a couple of knots)
  const woodTex = (base, dark, w = 256, h = 64, rep) => canvasTex(w, h, (g) => { g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 70; i++) { g.strokeStyle = i % 3 ? dark : '#ffffff'; g.globalAlpha = i % 3 ? rr(0.1, 0.3) : rr(0.05, 0.12); g.lineWidth = rr(0.6, 2.2); g.beginPath(); let y = rr(0, h); g.moveTo(0, y); for (let x = 0; x <= w; x += 16) { y += rr(-1, 1); g.lineTo(x, y + Math.sin(x * 0.03 + i) * 1.4); } g.stroke(); }
    for (let k = 0; k < 2; k++) { const cx = rr(30, w - 30), cy = rr(12, h - 12); g.strokeStyle = dark; for (let r = 2; r < 12; r += 2.5) { g.globalAlpha = 0.3; g.beginPath(); g.ellipse(cx, cy, r * 2.4, r * 0.7, 0, 0, 7); g.stroke(); } } g.globalAlpha = 1; }, rep);
  const blobTex = canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 4, 64, 64, 64); r.addColorStop(0, 'rgba(0,0,0,0.55)'); r.addColorStop(0.55, 'rgba(0,0,0,0.25)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); });
  const blob = (w, d, y, parent = scene, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.y = y; m.renderOrder = 1; parent.add(m); return m; };
  // rounded box: a box whose edges are pushed out to a radius (keeps the 6 face groups, so face textures still map)
  function roundedBox(w, h, d, r, s = 3) { const g = new THREE.BoxGeometry(w, h, d, s, s, s), p = g.attributes.position, v = V3(), c = V3(), hw = w / 2 - r, hh = h / 2 - r, hd = d / 2 - r;
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); c.set(clamp(v.x, -hw, hw), clamp(v.y, -hh, hh), clamp(v.z, -hd, hd)); const n = v.clone().sub(c); if (n.lengthSq() > 1e-10) v.copy(c).add(n.normalize().multiplyScalar(r)); p.setXYZ(i, v.x, v.y, v.z); } g.computeVertexNormals(); return g; }

  // ---- room + table ----
  scene.background = canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, TH.wall[0]); gr.addColorStop(1, TH.wall[1]); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.add(new THREE.HemisphereLight(0xfff2dc, 0x3a2a3a, 0.95));
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.45); sun.position.set(1.6, 6, 3.2); sun.castShadow = !touch; sun.shadow.mapSize.set(1024, 1024); sun.shadow.bias = -0.0005; Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3, near: 1, far: 14 }); scene.add(sun);
  const lamp = new THREE.PointLight(0xffc77a, 2.2, 9, 2); lamp.position.set(0.3, 2.3, 0.7); scene.add(lamp);   // the warm lamp over the table
  const tableTex = woodTex(TH.table, '#000000', 512, 512, [2, 2]);
  const table = new THREE.Mesh(new THREE.CylinderGeometry(3.3, 3.3, 0.12, 64), texMat(tableTex)); table.position.y = -0.06; table.receiveShadow = !touch; scene.add(table);
  M(new THREE.CylinderGeometry(3.34, 3.2, 0.1, 64), toon(TH.woodD), 0, -0.16, 0, scene, 0);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(TH.wall[1])); floor.rotation.x = -Math.PI / 2; floor.position.y = -1.9; scene.add(floor);
  const lampGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,220,150,0.85)'); r.addColorStop(1, 'rgba(255,220,150,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); }), transparent: true, depthWrite: false })); lampGlow.position.set(0, 3.4, -1.2); lampGlow.scale.set(7, 7, 1); scene.add(lampGlow);
  const tablePool = new THREE.Mesh(new THREE.CircleGeometry(2.6, 48), new THREE.MeshBasicMaterial({ map: canvasTex(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,214,140,0.22)'); r.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); tablePool.rotation.x = -Math.PI / 2; tablePool.position.y = 0.003; scene.add(tablePool);   // lamp light pooled on the table

  // ---- the box ----
  const BW = 2.3, BD = 1.5, box = new THREE.Group(); scene.add(box);
  blob(BW + 0.7, BD + 0.6, 0.004, scene, 0.9);   // soft contact shadow (works with shadows off on phones)
  const wallTex = woodTex(TH.wood, TH.woodD, 512, 64), baseTex = woodTex(TH.woodD, '#000000', 256, 128);
  const wood = texMat(wallTex, { color: new THREE.Color('#b9a690') }), woodD = texMat(baseTex), trim = toon(TH.trim, { emissive: new THREE.Color(TH.trim), emissiveIntensity: 0.08 });
  M(new THREE.BoxGeometry(BW, 0.06, BD), woodD, 0, 0.03, 0, box, 0.015);
  const feltTex = canvasTex(512, 320, (g, w, h) => { g.fillStyle = TH.felt; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0.09)' : 'rgba(255,255,255,0.06)'; g.fillRect(rr(0, w), rr(0, h), rr(1, 2), 1); }   // felt fibres
    const v = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.62); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.38)'); g.fillStyle = v; g.fillRect(0, 0, w, h);   // shade under the walls
    g.strokeStyle = TH.trim; g.globalAlpha = 0.55; g.lineWidth = 3; g.strokeRect(18, 18, w - 36, h - 36); g.lineWidth = 1.5; g.strokeRect(26, 26, w - 52, h - 52);
    g.globalAlpha = 0.15; g.fillStyle = TH.trim; g.font = `900 64px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SHUT THE BOX', w / 2, h * 0.64);
    g.font = `800 18px ${FONT}`; g.fillText('8 GATES · PARLOR', w / 2, h * 0.82); g.globalAlpha = 1; });
  feltTex.anisotropy = 8;
  const felt = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.16, BD - 0.16), texMat(feltTex)); felt.rotation.x = -Math.PI / 2; felt.position.y = 0.062; felt.receiveShadow = !touch; box.add(felt);
  for (const [x, z, w, d] of [[0, BD / 2 - 0.04, BW, 0.08], [0, -BD / 2 + 0.04, BW, 0.08], [BW / 2 - 0.04, 0, 0.08, BD], [-BW / 2 + 0.04, 0, 0.08, BD]]) { M(new THREE.BoxGeometry(w, 0.2, d), wood, x, 0.1, z, box, 0.012); M(new THREE.BoxGeometry(w + 0.004, 0.022, d + 0.004), trim, x, 0.2, z, box, 0); }
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { M(new THREE.BoxGeometry(0.12, 0.226, 0.12), trim, sx * (BW / 2 - 0.04), 0.11, sz * (BD / 2 - 0.04), box, 0.01); M(new THREE.SphereGeometry(0.018, 10, 6), toon('#5a4a2a'), sx * (BW / 2 - 0.04) + sx * 0.061, 0.11, sz * (BD / 2 - 0.04) + sz * 0.061, box, 0); }   // brass corner caps + rivets
  const RACK_Z = -BD / 2 + 0.22, TW = 0.205, TH_ = 0.34, TGAP = 0.018;
  M(new THREE.BoxGeometry(BW - 0.16, 0.13, 0.24), wood, 0, 0.12, RACK_Z - 0.02, box, 0.012);
  M(new THREE.BoxGeometry(BW - 0.16, 0.018, 0.03), trim, 0, 0.19, RACK_Z + 0.1, box, 0);
  M(new THREE.CylinderGeometry(0.012, 0.012, BW - 0.2, 8), trim, 0, 0.19, RACK_Z + 0.12, box, 0).rotation.z = Math.PI / 2;   // brass hinge rod
  const crest = new THREE.Mesh(new THREE.CircleGeometry(0.09, 32), new THREE.MeshBasicMaterial({ map: crestTex('8', TH.trim) })); crest.position.set(BW / 2 - 0.2, 0.065, BD / 2 - 0.2); crest.rotation.x = -Math.PI / 2; box.add(crest);
  // tiles: ivory with an engraved number; hinge at the front of the rack, flip toward you to shut (number face down)
  const ivory = (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fffaf0'); gr.addColorStop(1, '#efe3c8'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.globalAlpha = 0.06; for (let i = 0; i < 26; i++) { g.strokeStyle = '#8a6a3a'; g.lineWidth = rr(0.5, 1.5); g.beginPath(); const x = rr(0, w); g.moveTo(x, 0); g.bezierCurveTo(x + rr(-6, 6), h * 0.3, x + rr(-6, 6), h * 0.7, x + rr(-4, 4), h); g.stroke(); } g.globalAlpha = 1; };
  const numTex = n => canvasTex(256, 400, (g, w, h) => { ivory(g, w, h); g.fillStyle = '#2a211a'; g.fillRect(0, 0, w, 16); g.fillRect(0, h - 16, w, 16); g.fillStyle = TH.trim; g.fillRect(0, 16, w, 4); g.fillRect(0, h - 20, w, 4);
    g.font = `900 260px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = 'rgba(255,255,255,0.9)'; g.fillText(String(n), w / 2 + 4, h / 2 + 20); g.fillStyle = '#1d1712'; g.fillText(String(n), w / 2, h / 2 + 16);   // engraved: ink + a light lip
    if (n === 6 || n === 9) g.fillRect(w / 2 - 50, h - 64, 100, 14); });
  const backTex = canvasTex(128, 200, (g, w, h) => { g.fillStyle = TH.back; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 10, w, 10); g.strokeStyle = TH.trim; g.lineWidth = 4; g.strokeRect(14, 22, w - 28, h - 44); g.lineWidth = 1.5; g.strokeRect(22, 30, w - 44, h - 60);
    g.fillStyle = TH.trim; g.globalAlpha = 0.85; g.beginPath(); g.arc(w / 2, h / 2, 22, 0, 7); g.fill(); g.globalAlpha = 1; g.fillStyle = TH.back; g.font = `900 30px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', w / 2, h / 2 + 2); });
  const edgeM = toon('#ece1c7'), backM = texMat(backTex);
  const tiles = [], hitList = [];
  for (let i = 0; i < N_TILES; i++) {
    const x = (i - (N_TILES - 1) / 2) * (TW + TGAP), hinge = new THREE.Group(); hinge.position.set(x, 0.19, RACK_Z + 0.12); box.add(hinge);
    const faceM = texMat(numTex(i + 1), { emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0 });
    const tg = roundedBox(TW, TH_, 0.04, 0.012, 2), G0 = tg.groups; tg.clearGroups(); tg.addGroup(G0[0].start, G0[3].start + G0[3].count - G0[0].start, 0); tg.addGroup(G0[4].start, G0[4].count, 1); tg.addGroup(G0[5].start, G0[5].count, 2);   // 3 draw calls per tile, not 6
    const mesh = new THREE.Mesh(tg, [edgeM, faceM, backM]); mesh.position.set(0, TH_ / 2, -0.02); mesh.castShadow = !touch; addOutline(mesh, 0.01); hinge.add(mesh);
    const hint = new THREE.Mesh(new THREE.BoxGeometry(TW * 0.8, 0.012, 0.03), toon('#22c55e', { emissive: new THREE.Color('#22c55e'), emissiveIntensity: 0.6 })); hint.position.set(x, 0.07, RACK_Z + 0.3); hint.visible = false; box.add(hint);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(TW + TGAP, 0.6, 0.6), new THREE.MeshBasicMaterial({ visible: false })); hit.position.set(x, 0.25, RACK_Z + 0.15); hit.userData.n = i + 1; box.add(hit); hitList.push(hit);
    tiles.push({ hinge, mesh, faceM, hint, rot: 0, lift: 0, wasOpen: true });
  }
  const trayHit = new THREE.Mesh(new THREE.BoxGeometry(BW, 0.4, BD * 0.62), new THREE.MeshBasicMaterial({ visible: false })); trayHit.position.set(0, 0.2, 0.22); trayHit.userData.tray = true; box.add(trayHit); hitList.push(trayHit);
  // dice: rounded ivory with sunk pips (the one is red)
  const pipTex = v => canvasTex(256, 256, (g, w) => { const gr = g.createRadialGradient(w * 0.42, w * 0.38, 10, w / 2, w / 2, w * 0.75); gr.addColorStop(0, '#fffcf4'); gr.addColorStop(1, '#e9dcbd'); g.fillStyle = gr; g.fillRect(0, 0, w, w);
    const P = { 1: [[2, 2]], 2: [[1, 1], [3, 3]], 3: [[1, 1], [2, 2], [3, 3]], 4: [[1, 1], [3, 1], [1, 3], [3, 3]], 5: [[1, 1], [3, 1], [2, 2], [1, 3], [3, 3]], 6: [[1, 1], [3, 1], [1, 2], [3, 2], [1, 3], [3, 3]] }[v], R = v === 1 ? 36 : 24;
    for (const [a, b] of P) { const x = a * 64, y = b * 64; g.fillStyle = 'rgba(255,255,255,0.95)'; g.beginPath(); g.arc(x + 3, y + 3, R, 0, 7); g.fill(); const pg = g.createRadialGradient(x - R * 0.3, y - R * 0.3, 1, x, y, R); pg.addColorStop(0, v === 1 ? '#7a1408' : '#000000'); pg.addColorStop(1, v === 1 ? '#ec3013' : '#3a302a'); g.fillStyle = pg; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); } });
  const FACE = [3, 4, 1, 6, 2, 5], NORM = [V3(1, 0, 0), V3(-1, 0, 0), V3(0, 1, 0), V3(0, -1, 0), V3(0, 0, 1), V3(0, 0, -1)], DS = 0.19;
  const dieMats = FACE.map(v => texMat(pipTex(v))), dieGeo = roundedBox(DS, DS, DS, 0.03, 3);
  const dice = [0, 1].map(k => { const m = new THREE.Mesh(dieGeo, dieMats); m.castShadow = !touch; addOutline(m, 0.008); m.position.set(k ? 0.3 : -0.3, 0.062 + DS / 2, 0.3); scene.add(m); const sh = blob(DS * 2.1, DS * 2.1, 0.066, scene, 0.85); return { m, sh, anim: null, rest: m.position.clone() }; });
  const UP = V3(0, 1, 0), faceQuat = (v, yaw) => new THREE.Quaternion().setFromAxisAngle(UP, yaw).multiply(new THREE.Quaternion().setFromUnitVectors(NORM[FACE.indexOf(v)], UP));
  dice[0].m.quaternion.copy(faceQuat(5, 0.3)); dice[1].m.quaternion.copy(faceQuat(3, -0.4));
  const PARK = V3(BW / 2 + 0.35, DS / 2, 0.55);
  // confetti for SHUT THE BOX (one instanced mesh = one draw call)
  const CONF = 110, conf = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.035, 0.06), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), CONF); conf.visible = false; conf.frustumCulled = false; scene.add(conf);
  const cP = [], cV = [], cR = [], cS = [], CC = ['#ec3013', '#ffd23a', '#38bdf8', '#22c55e', '#f3f2f2', '#a78bfa'], dummy = new THREE.Object3D(); let confT = 0;
  for (let i = 0; i < CONF; i++) { cP.push(V3()); cV.push(V3()); cR.push(new THREE.Euler()); cS.push(V3()); conf.setColorAt(i, new THREE.Color(CC[i % CC.length])); }
  function confetti() { if (RM) return; conf.visible = true; confT = 3.2; for (let i = 0; i < CONF; i++) { cP[i].set(rr(-0.6, 0.6), 0.3, rr(-0.3, 0.3)); cV[i].set(rr(-1.6, 1.6), rr(2.4, 4.2), rr(-1.4, 0.9)); cR[i].set(rr(0, 6), rr(0, 6), rr(0, 6)); cS[i].set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); } }
  function stepConfetti(dt) { if (confT <= 0) return; confT -= dt; if (confT <= 0) { conf.visible = false; return; }
    for (let i = 0; i < CONF; i++) { const v = cV[i]; v.y -= 5.2 * dt; v.multiplyScalar(1 - 1.6 * dt); if (cP[i].y < 0.08) { cP[i].y = 0.08; v.set(0, 0, 0); } else cR[i].set(cR[i].x + cS[i].x * dt, cR[i].y + cS[i].y * dt, cR[i].z + cS[i].z * dt);
      cP[i].addScaledVector(v, dt); dummy.position.copy(cP[i]); dummy.rotation.copy(cR[i]); dummy.scale.setScalar(Math.min(1, confT / 0.6)); dummy.updateMatrix(); conf.setMatrixAt(i, dummy.matrix); } conf.instanceMatrix.needsUpdate = true; }

  // ---- foxes around the far side ----
  const kit = foxKit({ THREE, scene, toon, M: (geo, mat, x, y, z, parent, outline = 0.02, radius) => M(geo, mat, x, y, z, parent, outline, radius), grad, outlineMat, crestTex, rr, pick, clamp, smooth, damp });
  let rigs = {}; try { rigs = await loadCastRigs(); } catch (e) {}
  const cast = castKit({ THREE, M: (geo, mat, x, y, z, parent, outline = 0.02, radius) => M(geo, mat, x, y, z, parent, outline, radius), toon, makeFox: kit.makeFox }, rigs);
  const foxCache = new Map(), seats = [];
  function foxFor(spec) { const key = spec.key; if (foxCache.has(key)) return foxCache.get(key); let f;
    try { f = spec.cast ? cast.make(spec.cast) : kit.makeFox({ key, eyes: ['#38bdf8', '#38bdf8'], mood: 'neutral', outfit: 'armor', crest: '8', torso: spec.col || '#ec3013', look: PLAYER_MALE, ...(spec.fox || {}) }); } catch (e) { console.warn('shutBox fox', e); f = new THREE.Group(); scene.add(f); }
    try { (f.userData.P && f.userData.P.legs || []).forEach(l => l.visible = false); } catch (e) {}   // legs are under the table
    try { f.userData.joints = { P: f.userData.P, rig: f.userData.rig }; bakeCreature(THREE, f); delete f.userData.joints; } catch (e) {}   // phone budget: ~150 draw calls per fox → a few dozen
    f.visible = false; foxCache.set(key, f); return f; }
  function layoutSeats(list) { seats.length = 0; for (const f of foxCache.values()) f.visible = false; const n = list.length;
    list.forEach((s, i) => { const f = foxFor(s), a = n === 1 ? 0 : (i / (n - 1) - 0.5) * Math.min(1.25, 0.42 * (n - 1)), R = 2.6; const sc = n > 3 ? 0.58 : n > 2 ? 0.64 : 0.7; f.userData.seatY = -1.17 * sc; f.position.set(Math.sin(a) * R, f.userData.seatY, -Math.cos(a) * R); f.rotation.y = -a; f.scale.setScalar(sc); f.visible = true; f.userData.lookAt = LOOK_YOU; seats.push({ f, idx: s.idx, key: s.key }); }); fitCam(); }
  const LOOK_YOU = V3(0, 2.4, 4), LOOK_BOX = V3(0, 0.1, 0.2), seatOf = idx => seats.find(s => s.idx === idx);
  function foxMood(idx, mood, hop) { const s = seatOf(idx); if (!s) return; const u = s.f.userData; u.mood = mood; u.moodT = 2.5; if (hop) u.hop = 1; }

  // ---- camera: fit the box into the free part of the screen (between the HUD bars) ----
  const SAFE = { top: 0, bottom: 0, left: 0, right: 0 }, fitC = new THREE.PerspectiveCamera(38, 1, 0.05, 60), shot = { pos: V3(0, 3, 3), look: V3() };
  function fitCam() { const W = CW(), H = CH(), w = Math.max(80, W - SAFE.left - SAFE.right), h = Math.max(80, H - SAFE.top - SAFE.bottom), asp = w / h, port = asp < 0.9;
    camera.aspect = asp; camera.fov = port ? 44 : 36; camera.setViewOffset(w, h, -SAFE.left, -SAFE.top, W, H); camera.updateProjectionMatrix();
    fitC.aspect = asp; fitC.fov = camera.fov; fitC.updateProjectionMatrix();
    const el = port ? 0.9 : 0.86, dir = V3(0, Math.sin(el), Math.cos(el)), pts = [];
    for (const x of [-BW / 2, BW / 2]) for (const z of [-BD / 2, BD / 2]) pts.push(V3(x, 0, z), V3(x, 0.2, z)); pts.push(V3(-BW / 2, 0.55, RACK_Z), V3(BW / 2, 0.55, RACK_Z));
    if (port && seats.length) seats.forEach(s => pts.push(V3(clamp(s.f.position.x, -BW / 2, BW / 2), s.f.userData.seatY + 2.15 * s.f.scale.x, s.f.position.z)));
    const tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length); tgt.y = Math.min(tgt.y, 0.3);
    const _p = V3(), lim = 0.94, fits = d => { fitC.position.copy(tgt).addScaledVector(dir, d); fitC.lookAt(tgt); fitC.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _p.copy(p).project(fitC); x0 = Math.min(x0, _p.x); x1 = Math.max(x1, _p.x); y0 = Math.min(y0, _p.y); y1 = Math.max(y1, _p.y); } return { ok: x0 >= -lim && x1 <= lim && y0 >= -lim && y1 <= lim, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
    let d = 4; for (let it = 0; it < 3; it++) { let lo = 0.6, hi = 30; for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2; if (fits(m).ok) hi = m; else lo = m; } d = hi; const b = fits(d), th = Math.tan(fitC.fov * Math.PI / 360) * d;
      const right = V3().setFromMatrixColumn(fitC.matrixWorld, 0), up = V3().setFromMatrixColumn(fitC.matrixWorld, 1); tgt.addScaledVector(right, b.cx * th * asp).addScaledVector(up, b.cy * th); }
    shot.pos.copy(tgt).addScaledVector(dir, d); shot.look.copy(tgt); camera.position.copy(shot.pos); camera.lookAt(shot.look); }
  function resize() { renderer.setSize(CW(), CH()); fitCam(); }
  let ro = null; try { ro = new ResizeObserver(resize); ro.observe(container); } catch (e) { addEventListener('resize', resize); }

  // ---- match state + authority ----
  let G = null, net = null, plan = null, rollTm = 0, lastRolling = false, lastChange = performance.now(), animEnd = 0, voice = !!save.stat(SK('voice'), 0), flash = null, sayTxt = '', paid = new Set(), localPrev = null;
  const isAuth = () => !net || net.hostId() === net.me;
  const canAct = (p) => !demo && !!p && !p.gone && (p.kind === 'me' || p.kind === 'local' || (p.kind === 'net' && net && p.id === net.me));
  const meIdx = () => G ? G.players.findIndex(p => p.kind === 'me' || (p.kind === 'net' && net && p.id === net.me)) : -1;
  const busy = () => performance.now() < animEnd;

  function input(a) { sfx.on(); if (!G || demo) return; const P = G.players[G.turn];
    if (a.a !== 'next' && !canAct(P)) return; if (busy() && a.a !== 'next' && a.a !== 'dice') return;
    if (a.a === 'shut' && G.phase === 'pick' && sum(G.sel) !== sum(G.dice)) { sfx.bad(); flashMsg(G.sel.length ? 'NEEDS ' + sum(G.dice) + ' · YOU HAVE ' + sum(G.sel) : 'PICK TILES THAT MAKE ' + sum(G.dice), '#ff9a8a'); return; }
    if (a.a === 'sel' && G.phase === 'pick' && G.tiles[a.n - 1]) { if (G.sel.includes(a.n)) sfx.untick(); else sfx.tick(); vib(8); }
    if (a.a === 'next') a.at = G.seq;
    if (isAuth()) act(a); else net.send('ev', { k: 'in', mid: G.mid, ...a }, net.hostId()); }
  function act(a) { const prev = clone(G); if (!applyAct(G, a)) return false; G.seq++; changed(prev); return true; }
  const clone = o => JSON.parse(JSON.stringify(o));
  function changed(prev) { lastChange = performance.now(); effects(prev, G); if (net && isAuth()) net.send('st', G); emit(); }

  // things every client does when the match moves on (sound, dice roll, fox moods, rewards)
  function effects(A, B) {
    if (!B) return; const P = B.players[B.turn];
    if (!A || A.mid !== B.mid) { seatFoxes(); }
    if (A && A.mid === B.mid && B.rollId !== A.rollId) rollAnim(B.dice);
    if (A && A.mid === B.mid && A.turn === B.turn && A.tiles && B.tiles.some((o, i) => A.tiles[i] && !o)) { let k = 0; B.tiles.forEach((o, i) => { if (A.tiles[i] && !o) { sfx.knock(0.16 + k++ * 0.07, (i - 4) / 6); vib(15); } }); }
    if (B.phase === 'roll' && (!A || A.mid !== B.mid || A.turn !== B.turn || A.round !== B.round || A.phase === 'over' || A.phase === 'round')) { if (canAct(P)) { sfx.turn(); speak((P.kind === 'local' ? P.name + ', your turn.' : 'Your turn.') + ' Roll the dice.'); } else speak(P.name + "'s turn."); seatFoxes(); }
    if (B.phase === 'over' && (!A || A.phase !== 'over' || A.mid !== B.mid)) { const r = B.res, who = B.players[r.idx], mine = r.idx === meIdx() && who.kind !== 'local';
      setTimeout(() => { if (r.shut) { sfx.shutBox(); confetti(); vib([30, 40, 30, 40, 80]); flashMsg(who.name + ' SHUT THE BOX!', '#22c55e'); foxMood(r.idx, 'excited', true); speak((mine ? 'You' : who.name) + ' shut the box!'); }
        else { sfx.stuck(); vib(60); flashMsg('NO MOVE · ' + r.score + ' LEFT', '#ffd23a'); foxMood(r.idx, 'sad'); speak('No move. ' + (mine ? 'You score ' : who.name + ' scores ') + r.score + '.'); } emit(); }, Math.max(0, animEnd - performance.now()) + 120);
      if (mine && r.shut) reward('shut', B.mid + ':' + B.round); }
    if (B.phase === 'end' && (!A || A.phase !== 'end')) reward('end', String(B.mid));
  }
  function reward(kind, tag) { const k = kind + ':' + tag; if (paid.has(k) || !G || G.demo) return; paid.add(k);
    const mode = G.mode, mi = meIdx(); if (mi < 0 || mode === 'local') { if (kind === 'end') save.setStat(SK('played'), save.stat(SK('played')) + 1); return; }
    if (kind === 'shut') { save.addGold(PAY.shut); save.addXp(PAY.xpShut); save.setStat(SK('shuts'), save.stat(SK('shuts')) + 1); if (!save.flag(SK('firstShut'))) { save.setFlag(SK('firstShut')); save.give(PAY.firstShut); G.trophy = true; } return; }
    const st = standings(G), mine = G.players[mi], low = st[0].total, winners = st.filter(p => !p.gone && p.total === low), rivals = G.players.length - 1;
    let gold = 0; save.addXp(PAY.xpMatch); save.setStat(SK('played'), save.stat(SK('played')) + 1);
    const prevBest = save.stat(SK('bestLow'), -1), myBest = Math.min(...mine.scores.filter(x => x != null)); if (prevBest < 0 || myBest < prevBest) { save.setStat(SK('bestLow'), myBest); if (prevBest >= 0) setTimeout(() => flashMsg('NEW BEST ROUND · ' + myBest, '#22c55e'), 900); }
    if (rivals > 0 && winners.length === 1 && winners[0].i === mi) { gold = PAY.winPerRival * rivals; save.setStat(SK('wins'), save.stat(SK('wins')) + 1); if (mode === 'online') save.setStat(SK('onlineWins'), save.stat(SK('onlineWins')) + 1); }
    if (rivals === 0 && myBest <= PAY.soloLowAt) gold = PAY.soloLow;
    if (gold) { save.addGold(gold); setTimeout(() => sfx.gold(Math.min(8, 2 + Math.round(gold / 10))), 600); } endGold = gold; }
  let endGold = 0;
  function seatFoxes() { if (!G) { layoutSeats([{ key: 'hope', cast: 'hope', idx: -1 }]); return; }
    const list = [], mi = meIdx();
    G.players.forEach((p, i) => { if (G.mode !== 'local' && i === mi) return; if (p.gone) return; list.push({ key: p.cpu ? p.cpu : 'p' + i + (p.id || ''), cast: p.cpu ? CPUS.find(c => c.key === p.cpu).cast : null, fox: p.cpu ? CPUS.find(c => c.key === p.cpu).fox : null, col: p.col, idx: i }); });
    if (!list.length) list.push({ key: 'hope', cast: 'hope', idx: -1 });
    const sig = list.map(s => s.key + s.idx).join('|'); if (sig !== seatSig) { seatSig = sig; layoutSeats(list); } }
  let seatSig = '';

  // ---- dice animation ----
  function rollAnim(vals) { sfx.rattle(); vib(12); const n = vals.length, t0 = performance.now(), dur = 1150; animEnd = t0 + dur + 80; clearTimeout(rollTm); rollTm = setTimeout(() => { lastRolling = false; emit(); }, dur + 140);
    dice.forEach((d, k) => { if (k >= n) { d.anim = { park: true, from: d.m.position.clone(), t0, dur: 400 }; return; }
      const to = V3(n === 1 ? rr(-0.1, 0.1) : (k ? 1 : -1) * rr(0.2, 0.38), 0.062 + DS / 2, rr(0.08, 0.42)), from = V3(rr(0.6, 1.0), 0.9, BD / 2 + 0.6);
      d.anim = { from, to, t0, dur, axis: V3(rr(-1, 1), rr(-1, 1), rr(-1, 1)).normalize(), spin: rr(10, 16), q: faceQuat(vals[k], rr(-0.5, 0.5)), bounces: 3, hits: 0, wall: false }; d.rest.copy(to); }); }
  function stepDice(now) { for (const d of dice) { const A = d.anim; if (!A) continue; const t = clamp((now - A.t0) / A.dur, 0, 1);
      if (A.park) { d.m.position.lerpVectors(A.from, PARK, ease(t)); if (t >= 1) d.anim = null; continue; }
      const e = ease(t); d.m.position.lerpVectors(A.from, A.to, e); d.m.position.y = A.to.y + 0.75 * Math.pow(1 - t, 2) * Math.abs(Math.cos(Math.PI * A.bounces * t));
      d.m.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(A.axis, A.spin * Math.pow(1 - e, 1.4)).multiply(A.q));
      // sounds land on the real contacts: over the front wall (wood), each bounce on the felt, then a last settle; two dice close together click
      const pan = clamp(d.m.position.x / 1.2, -1, 1);
      if (!A.wall && t > 0.09) { A.wall = true; sfx.diceHit(0.55, pan, false); }
      while (A.hits < A.bounces && t >= (A.hits + 0.5) / A.bounces) { sfx.diceHit(1.15 * (1 - t) + 0.15, pan, true); A.hits++; if (A.hits === 1 && dice[0].anim && dice[1].anim && Math.random() < 0.6) sfx.diceHit(0.35, 0, false); }
      if (t >= 1) { d.anim = null; sfx.diceHit(0.12, pan, true); } } }
  function stepShadows() { for (const d of dice) { const h = Math.max(0, d.m.position.y - (0.062 + DS / 2)); d.sh.position.set(d.m.position.x, d.m.position.x > BW / 2 ? 0.004 : 0.066, d.m.position.z); d.sh.scale.setScalar(1 + h * 1.6); d.sh.material.opacity = clamp(0.85 - h * 1.1, 0.15, 0.85); } }

  // ---- HUD (what the DC page draws) ----
  function flashMsg(t, col = '#ffd23a') { flash = { t, col, until: performance.now() + 1900 }; emit(); }
  function speak(t) { sayTxt = t; if (!voice || !window.speechSynthesis) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.rate = 1.05; speechSynthesis.speak(u); } catch (e) {} }
  let emitQ = false; function emit() { if (emitQ) return; emitQ = true; queueMicrotask(() => { emitQ = false; onState(hud()); }); }
  function hud() {
    const base = { ready: true, music: sfx.music, demo: demo ? { cap: demo.cap, key: demo.key, n: demo.n, of: DEMO.length } : null, voice, gold: save.data.gold, best: save.stat(SK('bestLow'), -1), shuts: save.stat(SK('shuts')), wins: save.stat(SK('wins')), flash: flash && performance.now() < flash.until ? flash : null, say: sayTxt, online: !!net };
    if (!G) return { ...base, phase: 'menu', tiles: [] };
    const P = G.players[G.turn], rolling = busy(), total = sum(G.dice), selSum = sum(G.sel), mine = canAct(P), open = openList(G.tiles);
    const valid = G.phase === 'pick' && !rolling ? combos(open, total).filter(c => G.sel.every(n => c.includes(n))) : [], hintSet = new Set(valid.flat());
    const nextIdx = (() => { if (G.phase !== 'over') return -1; let k = G.turn + 1; while (k < G.players.length && G.players[k].gone) k++; return k < G.players.length ? k : -1; })(), nx = nextIdx >= 0 ? G.players[nextIdx] : null;
    const st = standings(G), mi = meIdx();
    return { ...base, phase: G.phase, mode: G.mode, round: G.round, rounds: G.rounds, scoring: G.scoring, seq: G.seq, rolling,
      players: G.players.map((p, i) => ({ name: p.name, col: p.col, total: p.total, last: p.scores[G.round - 1], active: i === G.turn && (G.phase === 'roll' || G.phase === 'pick' || G.phase === 'over'), me: i === mi && G.mode !== 'local', cpu: !!p.cpu, gone: p.gone })),
      active: { name: P.name, col: P.col, mine, cpu: !!P.cpu, me: G.turn === mi && G.mode !== 'local' },
      tiles: G.tiles.map((o, i) => ({ n: i + 1, open: o, sel: G.sel.includes(i + 1), hint: hintSet.has(i + 1) && !G.sel.includes(i + 1) && mine })),
      dice: rolling ? [] : G.dice.slice(), total: rolling ? 0 : total, selSum, diceN: G.diceN, oneDie: oneDieOk(G.tiles) && G.phase === 'roll',
      canRoll: mine && G.phase === 'roll' && !rolling, canPick: mine && G.phase === 'pick' && !rolling, canShut: mine && G.phase === 'pick' && !rolling && selSum === total, canClear: mine && G.phase === 'pick' && G.sel.length > 0,
      res: G.phase === 'over' && !rolling ? { name: G.players[G.res.idx].name, col: G.players[G.res.idx].col, score: G.res.score, shut: G.res.shut, left: G.res.left, roundEnd: !nx, next: nx ? { name: nx.name, col: nx.col, tap: G.mode === 'local' && nx.kind === 'local' } : null, last: G.round >= G.rounds && !nx } : null,
      board: st.map((p, k) => ({ place: k + 1, name: p.name, col: p.col, total: p.total, round: p.scores[G.round - 1], scores: p.scores.map(s => s == null ? '–' : s).join(' · '), me: p.i === mi && G.mode !== 'local', gone: p.gone })),
      winner: G.phase === 'end' ? st[0].name : '', tie: G.phase === 'end' && st.length > 1 && st[1].total === st[0].total && !st[1].gone, endGold, trophy: !!G.trophy,
      auto: G.mode !== 'local' };
  }

  // ---- authority driver: CPUs, auto-advance, AFK guard ----
  function drive(now) { if (!G || demo || !isAuth() || busy()) return; const P = G.players[G.turn], since = now - Math.max(lastChange, animEnd);
    if ((G.phase === 'roll' || G.phase === 'pick') && P.gone) { act({ a: 'quit' }); return; }
    const bot = P.cpu ? CPUS.find(c => c.key === P.cpu) : (P.kind === 'net' && net && since > 40000 ? { skill: 0.8 } : null);
    if (bot && G.phase === 'roll' && since > 750) { const n = cpuDice(G.tiles); if (oneDieOk(G.tiles) && n !== G.diceN) act({ a: 'dice', n }); else act({ a: 'roll' }); return; }
    if (bot && G.phase === 'pick') { if (!plan) plan = cpuPick(G.tiles, sum(G.dice), bot.skill) || []; const nextN = plan.find(n => !G.sel.includes(n));
      if (nextN && since > (G.sel.length ? 380 : 700)) act({ a: 'sel', n: nextN }); else if (!nextN && since > 500) { plan = null; act({ a: 'shut' }); } return; }
    plan = null;
    if (G.phase === 'over') { const nx = (() => { let k = G.turn + 1; while (k < G.players.length && G.players[k].gone) k++; return k < G.players.length ? G.players[k] : null; })();
      const wait = G.mode === 'local' && nx && nx.kind === 'local' ? Infinity : G.mode === 'local' ? Infinity : 2600; if (since > wait) act({ a: 'next' }); return; }
    if (G.phase === 'round' && G.mode !== 'local' && since > 4500) act({ a: 'next' }); }

  // ---- input on the 3D box ----
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function onDown(e) { sfx.on(); if (!G) return; const r = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
    const h = ray.intersectObjects(hitList, false)[0]; if (!h) return; const o = h.object;
    if (o.userData.n && G.phase === 'pick') input({ a: 'sel', n: o.userData.n }); else if (o.userData.tray && G.phase === 'roll') input({ a: 'roll' }); }
  renderer.domElement.addEventListener('pointerdown', onDown);
  const onVis = () => sfx.suspend(document.hidden); document.addEventListener('visibilitychange', onVis);

  // ---- frame loop ----
  let raf = 0, lastT = performance.now(), alive = true, skipF = false, tAcc = 0, hintSeq = -1, hintTiles = [];
  function frame(now) { if (!alive) return; raf = requestAnimationFrame(frame); const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now; tAcc += dt;
    if (document.hidden) return; if (touch && (skipF = !skipF)) { lastT = now - dt * 1000; return; }
    stepDice(now); stepShadows(); stepConfetti(dt); drive(now); const rolling = busy(); if (rolling !== lastRolling) { lastRolling = rolling; emit(); } if (flash && now > flash.until) { flash = null; emit(); }
    tiles.forEach((T, i) => { const open = G ? G.tiles[i] : true, sel = G && G.sel.includes(i + 1), hint = G && G.phase === 'pick' && !busy() && canAct(G.players[G.turn]); const rot = open ? (sel ? -0.12 : 0) : 1.52;
      T.rot = damp(T.rot, rot, open ? 14 : 9, dt); T.lift = damp(T.lift, sel ? 0.085 + Math.sin(tAcc * 5 + i) * 0.006 : 0, 14, dt); T.hinge.rotation.x = T.rot; T.hinge.position.y = 0.19 + T.lift; T.faceM.emissiveIntensity = sel ? 0.55 : 0; });
    if (G && G.phase === 'pick' && !rolling) { if (hintSeq !== G.seq) { hintSeq = G.seq; hintTiles = hud().tiles; } const hs = hintTiles; tiles.forEach((T, i) => { T.hint.visible = !!hs[i].hint; if (T.hint.visible) T.hint.material.emissiveIntensity = 0.4 + 0.4 * Math.sin(tAcc * 6); }); } else tiles.forEach(T => T.hint.visible = false);
    for (const s of seats) { const u = s.f.userData; if (u.moodT > 0) { u.moodT -= dt; if (u.moodT <= 0) u.mood = u.base || 'neutral'; } kit.animFox(s.f, dt, 0); const active = G && s.idx === G.turn && (G.phase === 'roll' || G.phase === 'pick'); s.f.userData.lookAt = active ? LOOK_BOX : LOOK_YOU; s.f.position.y = damp(s.f.position.y, s.f.userData.seatY + (active ? 0.1 : 0), 6, dt); }
    const sw = RM ? 0 : 1; camera.position.set(shot.pos.x + Math.sin(tAcc * 0.3) * 0.02 * sw, shot.pos.y + Math.sin(tAcc * 0.23) * 0.015 * sw, shot.pos.z); camera.lookAt(shot.look);
    renderer.render(scene, camera); }
  seatFoxes(); fitCam(); raf = requestAnimationFrame(frame); emit();

  // ---- DEMO: a scripted, captioned game (you vs Hope, 1 round) that teaches the rules. Dice are set, so it always plays the same way. ----
  let demo = null, demoTok = 0;
  const wait = ms => new Promise(r => setTimeout(r, ms)), settle = async () => { while (busy()) await wait(60); };
  async function demoRun(tok) {
    const ok = () => demo && tok === demoTok;
    for (let i = 0; i < DEMO.length; i++) { if (!ok()) return; const st = DEMO[i];
      demo.n = i + 1; demo.cap = st.cap; demo.key = st.key || ''; if (st.cap) speak(st.cap); emit();
      for (const a of st.acts || []) { if (!ok()) return; await settle(); await wait(a.pause ?? 650); if (!ok()) return; if (a.a === 'sel') sfx.tick(); act(a); }
      await settle(); await wait(st.wait ?? 2200); }
    if (ok()) api.demoStop();
  }

  // ---- public API (the DC page + a world call these) ----
  const api = {
    hud, input, isAuth, get state() { return G; }, _dbg: { scene, camera, renderer, SAFE },
    setSafe(top, bottom, left = 0, right = 0) { if ([top - SAFE.top, bottom - SAFE.bottom, left - SAFE.left, right - SAFE.right].some(v => Math.abs(v) > 2)) { Object.assign(SAFE, { top, bottom, left, right }); fitCam(); } },
    // offline: mode 'solo' | 'cpu' | 'local'. n = number of CPU foxes or local players.
    start({ mode = 'solo', n = 1, rounds = 3, scoring = 'sum', cpus } = {}) { sfx.on(); api.netEnd(true); let players;
      if (mode === 'local') players = Array.from({ length: clamp(n, 2, 5) }, (_, i) => ({ name: COLS[i][0], col: COLS[i][1], kind: 'local' }));
      else { players = [{ name: 'YOU', col: COLS[0][1], kind: 'me' }]; if (mode === 'cpu') { const pickC = (cpus && cpus.length ? cpus : CPUS.map(c => c.key)).slice(0, clamp(n, 1, 4)); pickC.forEach((k, i) => players.push({ name: CPUS.find(c => c.key === k).name, col: COLS[i + 1][1], kind: 'cpu', cpu: k })); } }
      const prev = G; G = newMatch({ players, rounds, scoring, mode }); endGold = 0; changed(prev); },
    rematch() { if (!G) return; if (net) return; api.start({ mode: G.mode, n: G.mode === 'local' ? G.players.length : G.players.length - 1, rounds: G.rounds, scoring: G.scoring, cpus: G.players.filter(p => p.cpu).map(p => p.cpu) }); },
    demoStart() { sfx.on(); api.netEnd(true); demoTok++; demo = { n: 0, cap: '', key: '' }; const prev = G; G = newMatch({ players: [{ name: 'YOU', col: COLS[0][1], kind: 'me' }, { name: 'HOPE', col: COLS[1][1], kind: 'cpu', cpu: 'hope' }], rounds: 1, mode: 'cpu' }); G.demo = true; changed(prev); demoRun(demoTok); },
    demoStop() { if (!demo) return; demo = null; demoTok++; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} api.toMenu(); },
    demoOn: () => !!demo,
    toMenu() { demo = null; demoTok++; api.netEnd(true); const prev = G; G = null; seatFoxes(); emit(); },
    setMusic(on) { sfx.on(); sfx.setMusic(on); save.setStat(SK('music'), on ? 1 : 0); emit(); },
    sound: () => sfx,
    setVoice(on) { voice = !!on; save.setStat(SK('voice'), voice ? 1 : 0); if (voice) speak('Voice on.'); else if (window.speechSynthesis) try { speechSynthesis.cancel(); } catch (e) {} emit(); },
    // ONLINE (the page runs the lobby with engine/duel-net.js; the host's device runs the match and sends the whole state, every change)
    netBegin({ me: myId, players, send, hostId, rounds = 3, scoring = 'sum' }) { net = { me: myId, send, hostId }; endGold = 0;
      if (isAuth()) { const prev = G; G = newMatch({ players: players.map(p => ({ id: p.id, name: p.name, col: p.col, kind: 'net' })), rounds, scoring, mode: 'online' }); changed(prev); }
      else { G = null; flashMsg('WAITING FOR THE HOST…', '#7dd3fc'); } },
    netRecv(t, d, from) { if (!net || !d) return;
      if (t === 'st') { if (isAuth() && G && from !== net.hostId()) return; if (G && d.mid === G.mid && d.seq <= G.seq) return; const prev = G; G = d; lastChange = performance.now(); effects(prev, G); emit(); return; }
      if (t === 'ev' && d.k === 'in' && isAuth() && G && d.mid === G.mid) { const P = G.players[G.turn]; if (d.a !== 'next' && (!P || P.id !== from)) return; act({ a: d.a, n: d.n, at: d.at }); } },
    netDrop(id) { if (!net || !G) return; const i = G.players.findIndex(p => p.id === id); if (i < 0 || G.players[i].gone) return;
      if (isAuth()) { const prev = clone(G); G.players[i].gone = true; if (i === G.turn && (G.phase === 'roll' || G.phase === 'pick')) applyAct(G, { a: 'quit' }); G.seq++; changed(prev); flashMsg(G.players[i].name + ' LEFT', '#ff9a8a'); } },
    netHostCheck() { if (net && G && isAuth()) { G.seq++; net.send('st', G); lastChange = performance.now(); } },   // call after the host changes so the new host re-sends
    netOn: () => !!net,
    netEnd(silent) { net = null; if (G && G.mode === 'online') { G = null; seatFoxes(); } if (!silent) emit(); },
    destroy() { alive = false; sfx.stop(); document.removeEventListener('visibilitychange', onVis); cancelAnimationFrame(raf); ro && ro.disconnect(); removeEventListener('resize', resize); renderer.domElement.removeEventListener('pointerdown', onDown); try { speechSynthesis && speechSynthesis.cancel(); } catch (e) {} renderer.dispose(); renderer.domElement.remove(); },
  };
  return api;
}
