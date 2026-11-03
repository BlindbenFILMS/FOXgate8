// 8 GATES — JIB'S SURF SHOP + BOARD FACTORY [jSurfShop] (Jidda). Room from the 2D world: "The surf shop. Boards to the ceiling and wax on every surface." Jib keeper.
// TWO MODES in one interior:
//   WALK  — Ben walks the shop floor and the factory with the standard Game HUD (stick, 1 USE · 2 SHAKA · 3 JUMP, E talk). Talk to Jib (or step on the shaping bay) to start a shift.
//   WORK  — the board-building job: a Jidda local orders a board at the counter, Ben builds it from a foam blank on the shaping stands, hands it over, the customer reacts + pays. 3 boards = a day. No clock, scored on quality.
// Tasks, one touch gesture each: CUT (trace the pencil outline with your finger) · PLANE (long swipes nose↔tail over the red high spots; swiping across = chatter)
//   · SAND (rub; small CIRCLES sand 3x faster) · ART (pick the card's colour, spray each zone) · GLASS (hold to pour resin, let go in the green, then swipe to spread)
//   · FINS (the board flips; pick the setup on the card, tap each glowing fin box) · WAX (cross-hatch: diagonal swipes one way, then the other).
// Order rules: cut first · plane before sand · sand before art · art + sand before glass · glass before fins and wax.
// Save keys jidda.surf.*, flag surfUniform. Built on engine/restaurant-kit.js (stage, camera fit, hint rings, uniform). Boatworks (minigames/boatyard/boat-repair.js) is the template.
// MERGE: buildSurfShop(ctx) builds the interior at an origin (spots, solids, talk points, door) so a Jidda map can drop it in like the restaurants;
//        createSurfShop({ container, onState }) runs it stand-alone and returns the Game HUD ENGINE CONTRACT + the job API.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { createSurfAudio } from './surf-audio.js';

export const SURFSHOP = { name: "JIB'S SURF SHOP", room: 'jSurfShop', world: 'Jidda', perDay: 3 };
export const PAINTS = { teal: { name: 'TEAL', col: '#2f9a8f' }, coral: { name: 'CORAL', col: '#f0705a' }, sunny: { name: 'SUNNY', col: '#f2c94c' }, navy: { name: 'NAVY', col: '#1f3a5f' } };
const PK = Object.keys(PAINTS);
export const FINSET = { 1: 'SINGLE', 2: 'TWIN', 3: 'THRUSTER', 4: 'QUAD' };
export const BOARDS = {
  short: { name: 'SHORTBOARD', len: "6'0\"", L: 2.6, W: 0.68, T: 0.075, fins: [3, 4], price: 18, nose: 'point', tail: 'squash' },
  fish: { name: 'FISH', len: "5'6\"", L: 2.3, W: 0.78, T: 0.08, fins: [2, 4], price: 16, nose: 'round', tail: 'swallow' },
  long: { name: 'LONGBOARD', len: "9'2\"", L: 3.5, W: 0.78, T: 0.085, fins: [1, 3], price: 24, nose: 'wide', tail: 'square' } };
export const TASKS = {
  cut: { label: 'CUT', name: 'Cut the outline out of the blank' }, plane: { label: 'PLANE', name: 'Plane down the high spots' }, sand: { label: 'SAND', name: 'Sand it smooth' },
  art: { label: 'ART', name: 'Spray the colour' }, glass: { label: 'GLASS', name: 'Pour + spread the resin' }, fins: { label: 'FINS', name: 'Set the fins' }, wax: { label: 'WAX', name: 'Cross-hatch the wax' } };
const ORDER = ['cut', 'plane', 'sand', 'art', 'glass', 'fins', 'wax'];
export const UPGRADES = [
  { id: 'planer', name: 'ELECTRIC PLANER', cost: 40, line: 'High spots shave twice as fast.' },
  { id: 'sander', name: 'ORBITAL SANDER', cost: 35, line: 'Sanding goes twice as fast.' },
  { id: 'gun', name: 'SPRAY GUN', cost: 35, line: 'One pass covers a whole zone.' },
  { id: 'resin', name: 'RESIN TIMER', cost: 30, line: 'A wider green zone when you pour.' },
  { id: 'radio', name: 'BEACH RADIO', cost: 60, line: 'Customers tip 25% more.' }];
// Jidda locals (looks match the Smoothie shop's customers; JOB + JOSS from the surf contest)
const CUSTOMERS = [
  { name: 'JOB', role: 'Champion of the break', torso: ['#3f9a8c', '#d8f3ef', '#2b6d63'], line: 'Make it like the ugly one. It knows the reef.' },
  { name: 'JOSS', role: 'Heat sheet', torso: ['#f0a63c', '#fff4e2', '#a85f17'], line: 'Never entered a heat. Might start.' },
  { name: 'JORN', role: 'Crest skiff', torso: ['#1f3350', '#e6ecf4', '#16263c'], line: 'Something for the days the pad is quiet.' },
  { name: 'JODY', role: 'Shuffleboard', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#e2453f', '#fbf8ec', '#a82c26'], line: 'I am leaving the long board for one afternoon. One.' },
  { name: 'JAGO', role: 'Piers', fur: '#c9682a', furDark: '#8a4213', torso: ['#3f5d47', '#e6b45a', '#2b4232'], line: 'A board that goes east. Not west. East.' },
  { name: 'JETSAM', role: 'Item shop', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], outfit: 'coat', line: 'Last one I found floated in. I want one that did not.' },
  { name: 'JARL', role: 'Armory', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#4a4a52', '#d7dde3', '#2a2a30'], line: 'Keep the rails sharp. I keep everything sharp.' },
  { name: 'JULEP', role: 'Smoothies', torso: ['#e2453f', '#f7f1e4', '#a82c26'], line: 'Lunch break surf. Make it fast to paddle.' },
  { name: 'MARRAM', role: 'Townsfolk', torso: ['#a78bfa', '#ede9fe', '#5b21b6'], line: 'My first board! Is that silly?' },
  { name: 'SISTER SHOAL', role: 'Townsfolk', fur: '#dedcd6', furDark: '#a8a6a0', torso: ['#cfe8e4', '#fbf8ec', '#2f4a44'], outfit: 'robe', line: 'Something gentle. The water and I are old friends.' }];
const JIB_LOOK = { fur: '#e0965c', furDark: '#b4622f' }, JIB_TORSO = ['#2f9a8f', '#f2d970', '#1f6a62'];
const JIB_LINES = [{ who: 'npc', text: 'Mind the rails. There is wax on everything in here and most of it is my thumbprint.' }, { who: 'player', text: 'You shaped Job’s board?' }, { who: 'npc', text: 'I shaped four of them. He rides the ugliest one. Says it knows the reef.' }, { who: 'player', text: 'Any work going?' }, { who: 'npc', text: 'Always. Blanks out back, orders at the counter. Cut it, shape it, glass it, hand it over. No clock in my shop. Just do it right.' }];
const JOSS_LINES = [{ who: 'player', text: 'You run the heats?' }, { who: 'npc', text: 'I run the sheet. The water runs the heats.' }, { who: 'npc', text: 'Jib says he is hiring. If your boards ride as well as they look on that rack, I will put them on the sheet.' }];
const SAVE = { day: 'jidda.surf.day', best: 'jidda.surf.best', upg: 'jidda.surf.upg.', stars: 'jidda.surf.stars', made: 'jidda.surf.made', wall: 'jidda.surf.wall' };
const POUR = [0.42, 0.72], STAND = 1.02, BAY = { x: 4.4, z: -1.6 };

// ---------------- board shapes (shared by the job board, the decor racks and the wall of fame) ----------------
export function boardWidth(type, u) { // u 0 = tail, 1 = nose → half-width factor 0..1
  const t = Math.abs(u - 0.48) / (u > 0.48 ? 0.52 : 0.48);
  if (type === 'short') return u > 0.48 ? Math.pow(Math.max(0, 1 - Math.pow(t, 2.1)), 0.62) : Math.max(0.5, Math.pow(Math.max(0, 1 - Math.pow(t, 2.6)), 0.5));
  if (type === 'fish') return u > 0.48 ? Math.pow(Math.max(0, 1 - Math.pow(t, 2.4)), 0.48) : Math.max(0.72, Math.pow(Math.max(0, 1 - Math.pow(t, 3)), 0.5));
  return u > 0.48 ? Math.pow(Math.max(0, 1 - Math.pow(t, 3.2)), 0.42) : Math.max(0.66, Math.pow(Math.max(0, 1 - Math.pow(t, 3.2)), 0.45)); }
export function boardOutline(type, L, W, n = 36) { // closed list of [x, y] in shape coords (x along the length, nose at +x)
  const top = [], bot = [], D = BOARDS[type] || BOARDS.short;
  for (let i = 0; i <= n; i++) { const u = 0.012 + 0.976 * i / n, w = W / 2 * boardWidth(type, u), x = (u - 0.5) * L; top.push([x, w]); bot.push([x, -w]); }
  const tipX = L / 2; const out = [...top, [tipX, 0], ...bot.reverse()];
  const tx = -L / 2 + 0.012 * L, tw = W / 2 * boardWidth(type, 0.012);
  if (D.tail === 'swallow') out.push([tx, -tw], [tx + L * 0.075, 0], [tx, tw]); else out.push([tx - 0.01, -tw * 0.7], [tx - 0.01, tw * 0.7]);
  return out; }
export const rockY = (L, x) => { const u = x / (L / 2); return u > 0 ? 0.13 * Math.pow(u, 2.4) * Math.min(1.2, L / 2) : 0.06 * Math.pow(-u, 2.2) * Math.min(1.2, L / 2); };
export function boardGeo(type, L, W, T, { bevel = true, rocker = true } = {}) {
  const pts = boardOutline(type, L, W), sh = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(sh, bevel ? { depth: T, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 2, curveSegments: 4 } : { depth: T, bevelEnabled: false });
  g.rotateX(-Math.PI / 2); if (rocker) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + rockY(L, p.getX(i))); p.needsUpdate = true; g.computeVertexNormals(); }
  return g; }
const decoCache = new Map();
export function decoBoard(T3, toon, type, col, stripe, outline, k = 1) { // small decor board, deck facing +y
  const D = BOARDS[type], key = type + '|' + k; if (!decoCache.has(key)) decoCache.set(key, boardGeo(type, D.L * k, D.W * k, 0.05 * k, { bevel: false }));
  const g = new T3.Group(), m = new T3.Mesh(decoCache.get(key), toon(col)); if (outline) outline(m, 0.012); g.add(m);
  if (stripe) { const s = new T3.Mesh(new T3.BoxGeometry(D.L * k * 0.82, 0.004, D.W * k * 0.14), toon(stripe)); s.position.y = 0.055 * k + rockY(D.L * k, 0) + 0.004; g.add(s); }
  return g; }

// ---------------- the shop + factory interior ----------------
export function buildSurfShop(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, addOutline } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const Y = { root, front: [], solids: [], lamps: [], wall: [], anim: [] }, ink = toon('#201e1d'), wood = toon('#b8945f'), woodD = toon('#7a5a3a'), white = toon('#fbf8ec'), teal = toon('#2f9a8f'), sand = toon('#e8d6a8');
  const noShadow = m => { m.castShadow = false; return m; };
  const solid = (x0, z0, x1, z1) => Y.solids.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]);
  // floors: shop planks (x < 0), factory concrete (x > 0)
  const plankT = CTX(256, 256, c => { c.fillStyle = '#c9a26a'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = i % 3 ? '#c09a62' : '#d4ae76'; c.fillRect(0, i * 32, 256, 30); c.fillStyle = '#7a5a3a'; c.fillRect(0, i * 32 + 30, 256, 2); c.fillRect((i * 97) % 256, i * 32, 2, 30); } });
  plankT.wrapS = plankT.wrapT = T3.RepeatWrapping; plankT.repeat.set(4, 6);
  const fl = new T3.Mesh(new T3.PlaneGeometry(9, 12), new T3.MeshToonMaterial({ map: plankT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.position.set(-4.5, 0, 0); fl.receiveShadow = true; root.add(fl);
  const concT = CTX(256, 256, c => { c.fillStyle = '#b9b6ae'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#a8a59d'; for (let i = 0; i < 60; i++) c.fillRect((i * 71) % 256, (i * 43) % 256, 6, 3); c.fillStyle = '#ffffff'; c.globalAlpha = 0.35; for (let i = 0; i < 90; i++) { c.beginPath(); c.arc((i * 59) % 256, (i * 113) % 256, 1 + (i % 3), 0, 7); c.fill(); } c.globalAlpha = 1; c.fillStyle = '#9a978f'; c.fillRect(0, 126, 256, 3); c.fillRect(126, 0, 3, 256); });
  concT.wrapS = concT.wrapT = T3.RepeatWrapping; concT.repeat.set(3, 4);
  const fl2 = new T3.Mesh(new T3.PlaneGeometry(9, 12), new T3.MeshToonMaterial({ map: concT, gradientMap: ctx.grad })); fl2.rotation.x = -Math.PI / 2; fl2.position.set(4.5, 0, 0); fl2.receiveShadow = true; root.add(fl2);
  { const pT = plankT.clone(); pT.needsUpdate = true; pT.wrapS = pT.wrapT = T3.RepeatWrapping; pT.repeat.set(8, 2); const porch = new T3.Mesh(new T3.PlaneGeometry(18.4, 4.5), new T3.MeshToonMaterial({ map: pT, color: '#9a8466', gradientMap: ctx.grad })); porch.rotation.x = -Math.PI / 2; porch.position.set(0, -0.02, 8.25); root.add(porch); M(new T3.BoxGeometry(18.4, 0.12, 0.2), toon('#5a4228'), 0, 0.04, 6.02, root, 0); }
  // walls (no front wall, no ceiling: dollhouse cutaway)
  const wallT = CTX(256, 256, c => { c.fillStyle = '#f2ead8'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 256; i += 32) { c.fillStyle = '#e4d9c0'; c.fillRect(i, 0, 3, 256); } c.fillStyle = '#4fb8e6'; c.fillRect(0, 0, 256, 10); });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(3, 1);
  const bayT = CTX(256, 256, c => { c.fillStyle = '#2f5f8a'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#28527a'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 0, 2, 256); });
  bayT.wrapS = T3.RepeatWrapping; bayT.repeat.set(3, 1);
  const wallMat = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad }), bayMat = new T3.MeshToonMaterial({ map: bayT, gradientMap: ctx.grad }), H = 3.6;
  const wall = (w, mat, x, z, ry) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), mat); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); return m; };
  wall(9, wallMat, -4.5, -6, 0); wall(9, bayMat, 4.5, -6, 0); wall(12, bayMat, 9, 0, -Math.PI / 2);
  // left wall with the door at z 2.5 (pier side, like the 2D room)
  wall(7.4, wallMat, -9, -2.3, Math.PI / 2); wall(2.4, wallMat, -9, 4.8, Math.PI / 2); { const t = new T3.Mesh(new T3.PlaneGeometry(2.2, 1.2), wallMat); t.position.set(-9, 3.0, 2.5); t.rotation.y = Math.PI / 2; root.add(t); }
  for (const z of [1.4, 3.6]) M(new T3.BoxGeometry(0.2, 2.4, 0.18), woodD, -8.95, 1.2, z, root, 0.012); M(new T3.BoxGeometry(0.2, 0.18, 2.4), woodD, -8.95, 2.4, 2.5, root, 0.012);
  const pierT = CTX(256, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#9fd8f2'); g.addColorStop(0.5, '#d6f0f8'); g.addColorStop(0.52, '#3aa0c4'); g.addColorStop(1, '#2f86a8'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); c.fillStyle = '#b8945f'; c.beginPath(); c.moveTo(80, 256); c.lineTo(176, 256); c.lineTo(140, 132); c.lineTo(116, 132); c.fill(); c.fillStyle = '#7a5a3a'; for (let y = 140; y < 256; y += 14) c.fillRect(0, y, 256, 0); c.fillStyle = '#5f8f4a'; c.beginPath(); c.ellipse(210, 128, 46, 14, 0, Math.PI, 0); c.fill(); });
  { const o = new T3.Mesh(new T3.PlaneGeometry(2.2, 2.4), new T3.MeshBasicMaterial({ map: pierT })); o.position.set(-9.25, 1.2, 2.5); o.rotation.y = Math.PI / 2; root.add(o); }
  { const d = M(new T3.BoxGeometry(0.06, 2.3, 1.05), toon('#2f9a8f'), -8.5, 1.15, 1.95, root, 0.01); d.rotation.y = -1.1; M(new T3.SphereGeometry(0.05, 8, 6), toon('#f2c94c'), -8.2, 1.1, 2.3, root, 0); }
  // skirting + top trim
  M(new T3.BoxGeometry(18, 0.16, 0.06), teal, 0, 0.08, -5.97, root, 0); M(new T3.BoxGeometry(0.06, 0.16, 12), teal, 8.97, 0.08, 0, root, 0);
  // divider between shop and factory: low wall with posts, open toward the front (x 0, z -6..1)
  { M(new T3.BoxGeometry(0.22, 1.1, 7), wood, 0, 0.55, -2.5, root, 0.015); M(new T3.BoxGeometry(0.3, 0.08, 7.1), woodD, 0, 1.12, -2.5, root, 0.01); for (const z of [-5.9, -2.5, 0.95]) M(new T3.BoxGeometry(0.16, 2.6, 0.16), woodD, 0, 1.3, z, root, 0.01); M(new T3.BoxGeometry(0.16, 0.16, 7), woodD, 0, 2.6, -2.5, root, 0.01); solid(-0.2, -6, 0.2, 1.05); }
  // back wall signs
  const signTex = (txt, sub, bg = '#1f3a5f', fg = '#fbf8ec', acc = '#f2c94c', w = 1024) => CTX(w, 200, c => { c.fillStyle = bg; c.fillRect(0, 0, w, 200); c.fillStyle = acc; c.fillRect(0, 0, w, 12); c.fillRect(0, 188, w, 12); c.fillStyle = fg; c.font = '900 92px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, sub ? 82 : 102); if (sub) { c.font = '800 34px Archivo, Arial'; c.fillStyle = acc; c.fillText(sub, w / 2, 152); } });
  { const s = new T3.Mesh(new T3.PlaneGeometry(4.6, 0.9), new T3.MeshBasicMaterial({ map: signTex("JIB'S SURF CO", 'SHAPED IN JIDDA · BOARDS · WAX · FINS') })); s.position.set(-4.4, 3.05, -5.96); root.add(s); }
  { const s = new T3.Mesh(new T3.PlaneGeometry(2.9, 0.56), new T3.MeshBasicMaterial({ map: signTex('SHAPING BAY', '', '#f2c94c', '#1f3a5f', '#1f3a5f') })); s.position.set(4.4, 3.0, -5.96); root.add(s); }
  // lagoon window (shop side)
  const winT = CTX(512, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#7fc4ea'); g.addColorStop(0.55, '#d6f0f8'); g.addColorStop(0.56, '#3fb2cf'); g.addColorStop(1, '#2a8cae'); c.fillStyle = g; c.fillRect(0, 0, 512, 256); c.strokeStyle = '#ffffff'; c.lineWidth = 4; for (let i = 0; i < 8; i++) { const x = (i * 83) % 512, y = 170 + (i * 29) % 70; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 14, y - 8, x + 30, y); c.stroke(); } c.fillStyle = '#5f8f4a'; c.beginPath(); c.ellipse(380, 142, 90, 26, 0, Math.PI, 0); c.fill(); c.fillStyle = '#e8d6a8'; c.fillRect(290, 140, 180, 4); c.fillStyle = '#7a5a3a'; c.fillRect(0, 0, 512, 12); c.fillRect(0, 244, 512, 12); c.fillRect(0, 0, 12, 256); c.fillRect(500, 0, 12, 256); c.fillRect(250, 0, 12, 256); });
  { const w = new T3.Mesh(new T3.PlaneGeometry(2.6, 1.3), new T3.MeshBasicMaterial({ map: winT })); w.position.set(-2.2, 1.85, -5.95); root.add(w); }

  // ---- SHOP SIDE ----
  // board rack: tall boards standing nose-up, deck facing the room — "boards to the ceiling"
  const COLS = ['#2f9a8f', '#f0705a', '#f2c94c', '#1f3a5f', '#fbf8ec', '#4fb8e6', '#e2453f', '#a78bfa', '#86d44e'], STR = ['#fbf8ec', '#201e1d', '#f2c94c', '#e2453f'];
  const stand = (type, col, str, x, y, z, k = 1, ry = 0, tilt = 0) => { const o = new T3.Group(), i = new T3.Group(); o.position.set(x, y, z); o.rotation.set(0, ry, Math.PI / 2 + tilt); i.rotation.x = Math.PI / 2; o.add(i); i.add(decoBoard(T3, toon, type, col, str, addOutline, k)); root.add(o); return o; };
  M(new T3.BoxGeometry(4.3, 0.25, 0.7), woodD, -6.4, 0.12, -5.55, root, 0.012); M(new T3.BoxGeometry(4.3, 0.1, 0.12), woodD, -6.4, 2.2, -5.85, root, 0.008); solid(-8.6, -6, -4.2, -5.1);
  for (let i = 0; i < 9; i++) { const type = ['long', 'short', 'fish'][i % 3], k = type === 'long' ? 0.93 : 1.0, D = BOARDS[type]; stand(type, COLS[(i * 4) % COLS.length], STR[i % 4], -8.2 + i * 0.46, D.L * k / 2 + 0.24, -5.55 + (i % 2) * 0.08, k, 0, (i % 3 - 1) * 0.04); }
  // counter with the till, wax pile, fin display; Jib behind it
  { M(new T3.BoxGeometry(3.4, 1.0, 0.75), toon('#2f9a8f'), -3.6, 0.5, -2.4, root, 0.02); M(new T3.BoxGeometry(3.6, 0.08, 0.95), wood, -3.6, 1.04, -2.4, root, 0.012); for (let i = 0; i < 6; i++) M(new T3.BoxGeometry(0.5, 0.86, 0.02), toon(i % 2 ? '#2a8a80' : '#35a89c'), -5.05 + i * 0.58, 0.48, -2.02, root, 0); solid(-5.4, -2.85, -1.8, -1.95);
    const till = M(new T3.BoxGeometry(0.42, 0.26, 0.34), toon('#3a3836'), -2.4, 1.21, -2.5, root, 0.01); M(new T3.BoxGeometry(0.3, 0.14, 0.04), new T3.MeshBasicMaterial({ color: 0x5cff8a }), -2.4, 1.38, -2.36, root, 0);
    const waxT = CTX(64, 64, c => { c.fillStyle = '#fbf3c8'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#e2453f'; c.font = '900 20px Archivo, Arial'; c.textAlign = 'center'; c.fillText('WAX', 32, 40); }), waxM = new T3.MeshToonMaterial({ map: waxT, gradientMap: ctx.grad });
    for (let i = 0; i < 10; i++) { const b = M(new T3.BoxGeometry(0.14, 0.08, 0.14), waxM, -4.9 + (i % 4) * 0.17, 1.12 + Math.floor(i / 4) * 0.085, -2.35 + (i % 2) * 0.04, root, 0.006); b.rotation.y = rr(-0.3, 0.3); }
    const fin = finGeo(); for (let i = 0; i < 4; i++) { const f = M(fin, toon(['#e2453f', '#1f3a5f', '#f2c94c', '#2f9a8f'][i]), -3.6 + i * 0.22, 1.08, -2.2, root, 0.006); f.rotation.y = 0.2; }
    { const n = new T3.Mesh(new T3.PlaneGeometry(1.2, 0.5), new T3.MeshBasicMaterial({ map: CTX(256, 108, c => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 256, 108); c.fillStyle = '#201e1d'; c.fillRect(6, 6, 244, 96); c.fillStyle = '#ffd23a'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NOW HIRING', 128, 40); c.font = '800 20px Archivo, Arial'; c.fillStyle = '#fbf8ec'; c.fillText('ASK JIB · SHAPERS WANTED', 128, 80); }) })); n.position.set(-3.6, 0.5, -2.015); root.add(n); } }
  // back shelf behind the counter: wax tubs + leashes
  M(new T3.BoxGeometry(3.0, 0.08, 0.4), wood, -3.6, 1.6, -5.78, root, 0.008); M(new T3.BoxGeometry(3.0, 0.08, 0.4), wood, -3.6, 1.1, -5.78, root, 0.008);
  for (let i = 0; i < 8; i++) M(new T3.CylinderGeometry(0.09, 0.09, 0.14, 12), toon(['#f2c94c', '#f0705a', '#4fb8e6', '#fbf8ec'][i % 4]), -4.8 + i * 0.34, 1.71, -5.75, root, 0.006, 0.09);
  for (let i = 0; i < 5; i++) M(new T3.TorusGeometry(0.13, 0.025, 6, 14), toon(['#201e1d', '#e2453f', '#2f9a8f'][i % 3]), -4.5 + i * 0.45, 1.3, -5.84, root, 0.004);
  // wall of fame (boards Ben made) on the left wall + its sign
  { const s = new T3.Mesh(new T3.PlaneGeometry(2.2, 0.42), new T3.MeshBasicMaterial({ map: signTex('WALL OF FAME', '', '#ec3013', '#ffffff', '#ffd23a') })); s.position.set(-8.2, 3.05, -2.6); s.rotation.y = Math.PI / 4; root.add(s); Y.wallSpot = { x: -8.2, z: -2.6 }; Y.wallSlots = []; for (let i = 0; i < 6; i++) Y.wallSlots.push({ x: -8.86, y: 1.75, z: -4.85 + i * 0.75 }); }
  // rug, plants, lounge chair, ukulele corner
  { const rug = new T3.Mesh(new T3.CircleGeometry(1.5, 32), new T3.MeshToonMaterial({ map: CTX(128, 128, c => { for (let i = 6; i > 0; i--) { c.fillStyle = ['#2f9a8f', '#f2c94c', '#f0705a', '#fbf8ec', '#4fb8e6', '#2f9a8f'][i - 1]; c.beginPath(); c.arc(64, 64, i * 10.6, 0, 7); c.fill(); } }), gradientMap: ctx.grad })); rug.rotation.x = -Math.PI / 2; rug.position.set(-5.4, 0.012, 1.2); rug.scale.set(1.3, 1, 1); rug.receiveShadow = true; root.add(rug); }
  const plant = (x, z) => { const fc = root.children.length; M(new T3.CylinderGeometry(0.28, 0.22, 0.5, 12), toon('#c9682a'), x, 0.25, z, root, 0.01, 0.28); for (let i = 0; i < 7; i++) { const l = M(new T3.ConeGeometry(0.09, 1.0, 5), toon(i % 2 ? '#5aa83a' : '#3f7a2a'), x, 0.85, z, root, 0.006); l.rotation.set(Math.cos(i * 0.9) * 0.5, 0, Math.sin(i * 0.9) * 0.5); } solid(x - 0.3, z - 0.3, x + 0.3, z + 0.3); if (z > 4) Y.front.push(...root.children.slice(fc)); };
  plant(-8.4, 5.3); plant(-0.7, -5.3); plant(8.4, 5.4);
  { const fc = root.children.length; M(new T3.BoxGeometry(1.6, 0.4, 0.7), toon('#f0705a'), -7.6, 0.3, 4.8, root, 0.015); M(new T3.BoxGeometry(1.6, 0.6, 0.18), toon('#f0705a'), -7.6, 0.6, 5.12, root, 0.012); for (const x of [-8.3, -6.9]) M(new T3.BoxGeometry(0.1, 0.12, 0.6), woodD, x, 0.06, 4.8, root, 0); solid(-8.45, 4.4, -6.75, 5.3); Y.front.push(...root.children.slice(fc)); }
  // lamps (warm, hanging)
  for (const [x, z] of [[2.4, -4.4], [6.4, -4.4], [-4.8, 3.6], [6.0, 3.6]]) { M(new T3.CylinderGeometry(0.008, 0.008, 0.6, 4), ink, x, 3.4, z, root, 0); M(new T3.ConeGeometry(0.3, 0.26, 14, 1, true), toon('#1f3a5f', { side: T3.DoubleSide }), x, 3.05, z, root, 0.008); const b = M(new T3.SphereGeometry(0.09, 8, 6), new T3.MeshBasicMaterial({ color: 0xfff0c0 }), x, 2.94, z, root, 0); Y.lamps.push(b); }

  // ---- FACTORY SIDE ----
  // shaping stands (the job board lies on these along x, nose toward -x)
  Y.stands = []; for (const dx of [-0.85, 0.85]) { const g = new T3.Group(); g.position.set(BAY.x + dx, 0, BAY.z); root.add(g); for (const s of [-1, 1]) { const l = M(new T3.BoxGeometry(0.09, STAND, 0.09), woodD, 0, STAND / 2, s * 0.26, g, 0.008); l.rotation.x = s * 0.18; } M(new T3.BoxGeometry(0.2, 0.1, 0.62), toon('#3a6ea5'), 0, STAND - 0.04, 0, g, 0.008); Y.stands.push(g); }
  solid(BAY.x - 1.3, BAY.z - 0.5, BAY.x + 1.3, BAY.z + 0.5);
  // side lights at board height (real shaping-bay lights) on the back wall
  for (const x of [2.4, 6.4]) { M(new T3.BoxGeometry(2.6, 0.12, 0.08), ink, x, 1.0, -5.92, root, 0); const l = new T3.Mesh(new T3.BoxGeometry(2.4, 0.06, 0.04), new T3.MeshBasicMaterial({ color: 0xfff6d8 })); l.position.set(x, 1.0, -5.86); root.add(l); Y.lamps.push(l); }
  // tool wall: pegboard with planer, sanding blocks, squeegee, spray gun silhouettes
  const pegT = CTX(512, 256, c => { c.fillStyle = '#c9a06a'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#9a7444'; for (let y = 12; y < 256; y += 20) for (let x = 12; x < 512; x += 20) c.fillRect(x, y, 3, 3); c.fillStyle = '#201e1d'; c.fillRect(30, 70, 110, 50); c.fillRect(50, 50, 30, 24); c.beginPath(); c.arc(120, 95, 20, 0, 7); c.fill(); c.fillStyle = '#e6b45a'; c.fillRect(180, 60, 70, 34); c.fillRect(180, 120, 70, 34); c.fillStyle = '#201e1d'; c.fillRect(290, 60, 12, 120); c.fillRect(260, 60, 72, 16); c.fillStyle = '#3a6ea5'; c.fillRect(370, 70, 60, 40); c.fillRect(390, 108, 16, 50); c.fillStyle = '#201e1d'; c.fillRect(430, 82, 46, 8); });
  { const p = new T3.Mesh(new T3.PlaneGeometry(3.2, 1.6), new T3.MeshBasicMaterial({ map: pegT })); p.position.set(4.4, 2.1, -5.95); root.add(p); }
  // resin table: buckets, cups, rolls of fibreglass
  { M(new T3.BoxGeometry(1.6, 0.9, 0.8), wood, 7.6, 0.45, -4.6, root, 0.015); M(new T3.BoxGeometry(1.7, 0.06, 0.9), woodD, 7.6, 0.92, -4.6, root, 0.008); solid(6.7, -5.1, 8.5, -4.1);
    M(new T3.CylinderGeometry(0.18, 0.16, 0.36, 14), toon('#e6b45a'), 7.2, 1.13, -4.6, root, 0.008, 0.18); M(new T3.CylinderGeometry(0.15, 0.13, 0.3, 14), toon('#fbf8ec'), 7.6, 1.1, -4.5, root, 0.008, 0.15);
    for (let i = 0; i < 3; i++) M(new T3.CylinderGeometry(0.05, 0.04, 0.1, 10), toon('#f2c94c'), 7.95 + i * 0.12, 1.0, -4.3, root, 0.004, 0.05);
    const roll = M(new T3.CylinderGeometry(0.14, 0.14, 1.2, 14), toon('#f4f1e8'), 7.6, 1.1, -4.95, root, 0.008, 0.14); roll.rotation.z = Math.PI / 2; }
  // spray booth: hanging plastic curtain + overspray on the wall
  { const ovT = CTX(256, 256, c => { c.fillStyle = '#2f5f8a'; c.fillRect(0, 0, 256, 256); const cs = ['#f0705a', '#f2c94c', '#2f9a8f', '#fbf8ec', '#a78bfa']; for (let i = 0; i < 60; i++) { c.fillStyle = cs[i % 5]; c.globalAlpha = 0.25; c.beginPath(); c.arc((i * 67) % 256, (i * 41) % 256, 10 + (i % 4) * 8, 0, 7); c.fill(); } c.globalAlpha = 1; });
    const ov = new T3.Mesh(new T3.PlaneGeometry(3.0, 2.6), new T3.MeshBasicMaterial({ map: ovT })); ov.position.set(8.95, 1.4, 3.0); ov.rotation.y = -Math.PI / 2; root.add(ov);
    const cm = new T3.MeshBasicMaterial({ color: 0xdff2f7, transparent: true, opacity: 0.35, side: T3.DoubleSide, depthWrite: false }); for (let i = 0; i < 4; i++) { const c = new T3.Mesh(new T3.PlaneGeometry(0.8, 2.6), cm); c.position.set(7.4, 1.4, 1.75 + i * 0.75); c.rotation.y = Math.PI / 2 + (i % 2 ? 0.15 : -0.15); root.add(c); }
    M(new T3.BoxGeometry(0.06, 0.06, 3.2), ink, 7.4, 2.75, 2.9, root, 0); }
  // stacked foam blanks waiting to be shaped + fin crate
  for (let i = 0; i < 5; i++) { const b = M(new T3.BoxGeometry(2.1, 0.1, 0.62), white, 3.6, 0.06 + i * 0.11, 4.6, root, 0.008); b.rotation.y = rr(-0.05, 0.05); } solid(2.5, 4.2, 4.7, 5.0);
  { M(new T3.BoxGeometry(0.8, 0.5, 0.6), wood, 1.4, 0.25, -5.4, root, 0.01); const fg = finGeo(); for (let i = 0; i < 8; i++) { const f = M(fg, toon(['#201e1d', '#e2453f', '#2f9a8f', '#f2c94c'][i % 4]), 1.12 + (i % 4) * 0.18, 0.5, -5.5 + Math.floor(i / 4) * 0.2, root, 0.005); f.rotation.y = Math.PI / 2; } solid(0.95, -5.75, 1.85, -5.05); }
  // foam dust drifts on the factory floor
  for (let i = 0; i < 6; i++) { const d = new T3.Mesh(new T3.CircleGeometry(rr(0.15, 0.32), 10), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, depthWrite: false })); d.rotation.x = -Math.PI / 2; d.position.set(BAY.x + rr(-1.8, 1.8), 0.014, BAY.z + rr(-1.2, 1.4)); root.add(d); }
  // ---- POLISH: wainscot, posters, string lights, wetsuits, light shafts, templates, work lamp, shop vac ----
  { const wsT = CTX(256, 128, c => { c.fillStyle = '#2f7f8a'; c.fillRect(0, 0, 256, 128); for (let x = 0; x < 256; x += 32) { c.fillStyle = '#28707a'; c.fillRect(x, 0, 3, 128); c.fillStyle = '#3a8f9a'; c.fillRect(x + 3, 0, 2, 128); } }); wsT.wrapS = T3.RepeatWrapping;
    const ws = (w, x, z, ry) => { const t = wsT.clone(); t.needsUpdate = true; t.wrapS = T3.RepeatWrapping; t.repeat.set(w / 2, 1); const m = new T3.Mesh(new T3.PlaneGeometry(w, 1.1), new T3.MeshToonMaterial({ map: t, gradientMap: ctx.grad })); m.position.set(x, 0.55, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); const r = M(new T3.BoxGeometry(w, 0.07, 0.05), white, 0, 0, 0, root, 0); r.position.set(x + Math.sin(ry) * 0.02, 1.12, z + Math.cos(ry) * 0.02); r.rotation.y = ry; };
    ws(9, -4.5, -5.985, 0); ws(7.4, -8.985, -2.3, Math.PI / 2); ws(2.4, -8.985, 4.8, Math.PI / 2); }
  const poster = (w, h, draw, x, y, z, ry) => { const p = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: CTX(256, Math.round(256 * h / w), draw) })); p.position.set(x, y, z); p.rotation.y = ry; root.add(p); const f = M(new T3.BoxGeometry(w + 0.08, h + 0.08, 0.03), ink, 0, 0, 0, root, 0); f.position.set(x - Math.sin(ry) * 0.02, y, z - Math.cos(ry) * 0.02); f.rotation.y = ry; };
  poster(1.3, 1.8, c => { const H = c.canvas.height, g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#f2c94c'); g.addColorStop(1, '#f0705a'); c.fillStyle = g; c.fillRect(0, 0, 256, H); c.fillStyle = '#fff3c8'; c.beginPath(); c.arc(128, 120, 54, 0, 7); c.fill(); c.fillStyle = '#1f3a5f'; c.beginPath(); c.moveTo(0, 250); c.bezierCurveTo(60, 150, 150, 140, 200, 210); c.bezierCurveTo(170, 190, 150, 220, 170, 250); c.lineTo(256, 250); c.lineTo(256, H); c.lineTo(0, H); c.fill(); c.fillStyle = '#1f3a5f'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.fillText('THE BREAK', 128, 46); c.font = '800 18px Archivo, Arial'; c.fillStyle = '#fbf8ec'; c.fillText('JIDDA SURF CONTEST', 128, H - 40); c.fillText('THREE WAVES · ONE HEAT', 128, H - 16); }, -8.97, 2.05, 4.7, Math.PI / 2);
  poster(1.1, 1.5, c => { const H = c.canvas.height; c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 256, H); c.fillStyle = '#ec3013'; c.fillRect(0, 0, 256, 56); c.fillStyle = '#fff'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.fillText('MASK ON', 128, 40); c.fillStyle = '#201e1d'; c.beginPath(); c.ellipse(128, 160, 60, 46, 0, 0, 7); c.fill(); c.fillStyle = '#fbf8ec'; c.fillRect(84, 150, 88, 20); c.fillStyle = '#201e1d'; c.font = '800 20px Archivo, Arial'; c.fillText('FOAM DUST + RESIN', 128, H - 50); c.fillText('KEEP THE BAY CLEAN', 128, H - 22); }, 8.97, 2.1, -4.6, -Math.PI / 2);
  // plywood shaping templates hanging on the factory wall
  for (let i = 0; i < 3; i++) { const type = ['short', 'fish', 'long'][i], o = new T3.Group(), inner = new T3.Group(); o.position.set(8.93, 2.1, -2.8 + i * 0.75); o.rotation.y = -Math.PI / 2; o.add(inner); inner.rotation.set(Math.PI / 2, 0, Math.PI / 2); inner.add(decoBoard(T3, toon, type, '#d9b886', null, addOutline, 0.55)); root.add(o); M(new T3.CylinderGeometry(0.02, 0.02, 0.1, 6), ink, 8.9, 2.1 + BOARDS[type].L * 0.275 + 0.05, -2.8 + i * 0.75, root, 0); }
  // wetsuit rack near the door
  { M(new T3.BoxGeometry(0.06, 2.0, 0.06), woodD, -8.1, 1.0, -0.4, root, 0.006); M(new T3.BoxGeometry(0.06, 2.0, 0.06), woodD, -8.1, 1.0, 1.1, root, 0.006); M(new T3.CylinderGeometry(0.025, 0.025, 1.6, 8), toon('#d7dde3'), -8.1, 1.95, 0.35, root, 0).rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const col = ['#201e1d', '#1f3a5f', '#201e1d', '#2f9a8f'][i], z = -0.15 + i * 0.34, g = new T3.Group(); g.position.set(-8.1, 1.25, z); root.add(g); M(new T3.CapsuleGeometry(0.14, 0.62, 4, 10), toon(col), 0, 0.1, 0, g, 0.01); M(new T3.CapsuleGeometry(0.05, 0.5, 3, 6), toon(col), 0, 0.12, 0.19, g, 0.006).rotation.x = 0.15; M(new T3.CapsuleGeometry(0.05, 0.5, 3, 6), toon(col), 0, 0.12, -0.19, g, 0.006).rotation.x = -0.15; M(new T3.BoxGeometry(0.29, 0.05, 0.08), toon('#f2c94c'), 0, 0.28, 0, g, 0); g.rotation.y = Math.PI / 2 + (i % 2 ? 0.1 : -0.1); }
    solid(-8.45, -0.6, -7.75, 1.3); }
  // doormat
  { const dm = new T3.Mesh(new T3.PlaneGeometry(1.2, 1.6), new T3.MeshToonMaterial({ map: CTX(128, 160, c => { c.fillStyle = '#7a5a3a'; c.fillRect(0, 0, 128, 160); c.fillStyle = '#9a7444'; for (let y = 6; y < 160; y += 10) c.fillRect(6, y, 116, 4); c.fillStyle = '#f2c94c'; c.font = '900 22px Archivo, Arial'; c.textAlign = 'center'; c.save(); c.translate(64, 80); c.rotate(-Math.PI / 2); c.fillText('ALOHA', 0, 8); c.restore(); }), gradientMap: ctx.grad })); dm.rotation.x = -Math.PI / 2; dm.position.set(-8.1, 0.013, 2.5); dm.receiveShadow = true; root.add(dm); }
  // clamp work lamp beside the stands + shop vac + foam piles
  { const x = BAY.x + 1.75, z = BAY.z - 0.7, fc0 = root.children.length; M(new T3.CylinderGeometry(0.22, 0.26, 0.06, 14), ink, x, 0.03, z, root, 0.008, 0.26); M(new T3.CylinderGeometry(0.025, 0.025, 1.9, 8), toon('#3a3836'), x, 0.95, z, root, 0); const arm = M(new T3.CylinderGeometry(0.022, 0.022, 0.8, 8), toon('#3a3836'), x - 0.3, 1.95, z + 0.1, root, 0); arm.rotation.z = 1.0;
    const sh = M(new T3.ConeGeometry(0.17, 0.24, 14, 1, true), toon('#f2c94c', { side: T3.DoubleSide }), x - 0.66, 1.78, z + 0.18, root, 0.008); sh.rotation.z = 0.5; const bl = M(new T3.SphereGeometry(0.07, 8, 6), new T3.MeshBasicMaterial({ color: 0xfff6d8 }), x - 0.6, 1.7, z + 0.18, root, 0); Y.lamps.push(bl); Y.workLamp = root.children.slice(fc0);
    const pool = new T3.Mesh(new T3.CircleGeometry(1.2, 28), new T3.MeshBasicMaterial({ color: 0xfff1c0, transparent: true, opacity: 0.07, depthWrite: false, blending: T3.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(BAY.x, 0.016, BAY.z); pool.scale.set(1.7, 1, 0.9); root.add(pool); solid(x - 0.3, z - 0.3, x + 0.3, z + 0.3); }
  { const x = 1.2, z = 3.6; M(new T3.CylinderGeometry(0.28, 0.26, 0.6, 16), toon('#e2453f'), x, 0.3, z, root, 0.01, 0.28); M(new T3.CylinderGeometry(0.29, 0.29, 0.12, 16), toon('#201e1d'), x, 0.64, z, root, 0.008, 0.29); const h = M(new T3.TorusGeometry(0.45, 0.04, 6, 18, Math.PI * 1.2), toon('#201e1d'), x + 0.45, 0.45, z, root, 0.005); h.rotation.y = Math.PI / 2; solid(x - 0.35, z - 0.35, x + 0.35, z + 0.35); }
  for (const [x, z, r] of [[BAY.x - 1.6, BAY.z + 0.9, 0.35], [BAY.x + 1.5, BAY.z + 0.8, 0.3]]) { const d = M(new T3.SphereGeometry(r, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#fbf8ec'), x, 0, z, root, 0); d.scale.y = 0.12; d.castShadow = false; }
  // light shafts from the lagoon window
  { const shM = new T3.MeshBasicMaterial({ color: 0xfff3c8, transparent: true, opacity: 0.09, depthWrite: false, side: T3.DoubleSide, blending: T3.AdditiveBlending }); for (let i = 0; i < 3; i++) { const s = new T3.Mesh(new T3.PlaneGeometry(0.7, 3.4), shM); s.position.set(-2.9 + i * 0.7, 1.2, -4.6); s.rotation.set(-0.75, 0.15, 0); root.add(s); } Y.shaft = shM; }
  // string lights across the shop (instanced bulbs, they twinkle)
  { const pts = []; const strand = (a, b, n, sag) => { for (let i = 0; i <= n; i++) { const k = i / n; pts.push(new T3.Vector3(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k - Math.sin(k * Math.PI) * sag, a[2] + (b[2] - a[2]) * k)); } };
    strand([-8.9, 3.4, -5.9], [-0.3, 3.3, -1.6], 22, 0.45); strand([-8.9, 3.4, -5.9], [-8.9, 3.4, 4.6], 18, 0.35); strand([0.3, 3.4, -5.9], [8.9, 3.4, -5.9], 18, 0.4);
    const im = new T3.InstancedMesh(new T3.SphereGeometry(0.055, 8, 6), new T3.MeshBasicMaterial({ color: 0xffffff }), pts.length), cols = ['#ffd23a', '#ff8a6a', '#7fd8f0', '#b8f28a', '#fff3c8'], m4 = new T3.Matrix4();
    pts.forEach((p, i) => { m4.makeTranslation(p.x, p.y - 0.06, p.z); im.setMatrixAt(i, m4); im.setColorAt(i, new T3.Color(cols[i % cols.length])); }); root.add(im); Y.bulbs = { im, n: pts.length, cols };
    const line = new T3.Line(new T3.BufferGeometry().setFromPoints(pts.slice(0, 23)), new T3.LineBasicMaterial({ color: 0x201e1d })); root.add(line); root.add(new T3.Line(new T3.BufferGeometry().setFromPoints(pts.slice(23, 42)), line.material)); root.add(new T3.Line(new T3.BufferGeometry().setFromPoints(pts.slice(42)), line.material)); }
  // floating dust motes (factory foam dust + window light)
  { const n = 36, g = new T3.BufferGeometry(), pos = new Float32Array(n * 3), seed = []; for (let i = 0; i < n; i++) { const f = i % 2 ? [BAY.x + rr(-2.5, 2.5), rr(0.5, 2.8), BAY.z + rr(-2, 2)] : [rr(-3.5, -0.6), rr(0.4, 2.6), rr(-5.5, -3)]; pos.set(f, i * 3); seed.push(f); } g.setAttribute('position', new T3.BufferAttribute(pos, 3));
    const pm = new T3.Points(g, new T3.PointsMaterial({ color: 0xfff6e0, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false })); root.add(pm); Y.motes = { g, seed, n }; }
  Y.spots = { ben: { x: -1.4, z: -0.9 }, jib: { x: -3.6, z: -3.4 }, jibWork: { x: 2.4, z: -3.2 }, counter: { x: -5.95, z: -2.45 }, door: { x: -8.3, z: 2.5 }, outside: { x: -10.6, z: 2.5 }, watch: { x: 1.4, z: 0.4 }, joss: { x: -6.6, z: -4.4 }, bay: { x: BAY.x, z: BAY.z + 1.3 }, walkIn: { x: -7.0, z: 2.5 }, start: { x: -7.4, z: 2.5 } };
  Y.talk = [{ id: 'jib', label: 'TALK · JIB', x: -3.6, z: -1.6, r: 1.6 }, { id: 'joss', label: 'TALK · JOSS', x: -6.6, z: -3.6, r: 1.4 }, { id: 'bay', label: 'SHAPING BAY · START A SHIFT', x: BAY.x, z: BAY.z + 1.3, r: 1.5 }, { id: 'wall', label: 'WALL OF FAME · YOUR BOARDS', x: -8.0, z: -2.6, r: 1.3 }, { id: 'door', label: 'DOOR · OUT TO THE PIER', x: -8.4, z: 2.5, r: 1.0 }];
  Y.bounds = [-8.75, -5.6, 8.7, 5.7];
  return Y;
}

function finGeo() { const sh = new THREE.Shape([new THREE.Vector2(-0.07, 0), new THREE.Vector2(0.07, 0), new THREE.Vector2(0.03, 0.06), new THREE.Vector2(-0.05, 0.13), new THREE.Vector2(-0.06, 0.07)]); const g = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }); g.translate(0, 0, -0.006); return g; }

// ---------------- the stand-alone game ----------------
export async function createSurfShop({ container, onState = () => {}, opts = {} }) {
  const ST = createStage(container, { bg: '#3a2f28' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS, sun } = ST;
  scene.background = canvasTex(4, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#1e2a33'); g.addColorStop(1, '#3a2f28'); c.fillStyle = g; c.fillRect(0, 0, 4, 256); });
  sun.position.set(-3, 11, 7); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 10, bottom: -10 }); sun.shadow.camera.updateProjectionMatrix && sun.shadow.camera.updateProjectionMatrix();
  const Y = buildSurfShop({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline });
  // ---------- sound + haptics ----------
  let musicUrl = opts.musicUrl; if (musicUrl === undefined) { try { musicUrl = /^https?:/.test(document.baseURI) ? new URL('jidda/jidda-shops.mp3', document.baseURI).href : null; } catch (e) { musicUrl = null; } }
  const SND = createSurfAudio(audio, { musicUrl }); if (SND.muted) audio.setMuted && audio.setMuted(true);
  const buzz = ms => { try { if (!SND.muted && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  const onVis = () => { SND.pause(document.hidden); }; document.addEventListener('visibilitychange', onVis);
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const jib = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, ...JIB_LOOK }, torso: JIB_TORSO, outfit: 'tee', crest: '', gear: 'none', mood: 'happy' }));
  const joss = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#e8a64c', furDark: '#c9741f' }, torso: CUSTOMERS[1].torso, outfit: 'vest', crest: '', gear: 'none', mood: 'curious' }));
  const benW = strip(kit.makeFox({ ...CAST.player, gear: 'none' }));
  const benJ = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#2f9a8f', '#2f9a8f', '#f2c94c'], crest: '', gear: 'none', mood: 'happy' })); const BP = benJ.userData.P;
  { // jib's sun-bleached headband
    const P = jib.userData.P, hs = P.head.scale.x || 1, hb = M(new THREE.TorusGeometry(0.33, 0.04, 6, 24), toon('#f2c94c'), 0, P.head.position.y + 0.1 * hs, 0.02, P.body, 0.006); hb.rotation.x = Math.PI / 2 - 0.12; hb.scale.set(hs, hs, hs * 0.9); }
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  place(jib, Y.spots.jib, 0); place(joss, Y.spots.joss, Math.PI); place(benJ, Y.spots.ben, -0.5); place(benW, Y.spots.start, Math.PI / 2); benW.visible = false;
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 96); g.strokeStyle = '#f2c94c'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(-70, 30); g.quadraticCurveTo(-40, -60, 20, -50); g.quadraticCurveTo(60, -40, 50, 0); g.quadraticCurveTo(20, -20, 0, 10); g.stroke(); g.beginPath(); g.moveTo(-80, 46); g.lineTo(80, 46); g.stroke(); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.05); g.fillStyle = '#f2c94c'; g.fillRect(-124, -26, 248, 52); g.font = 'italic 900 36px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1f3a5f'; g.fillText("JIB'S SURF CO", 0, 2); g.restore(); });
    const U = dinerUniform(ST, benJ, { print, printY: 1.17, stripe: '#f2c94c', towelCol: '#2f9a8f' }), hat = U.hat, hs = BP.head.scale.x || 1;
    while (hat.children.length) hat.remove(hat.children[0]); hat.scale.setScalar(hs); hat.position.y -= 0.06 * hs;   // bucket hat
    M(new THREE.CylinderGeometry(0.24, 0.29, 0.2, 18), toon('#f2c94c'), 0, 0.08, -0.02, hat, 0.012); M(new THREE.CylinderGeometry(0.45, 0.45, 0.025, 22), toon('#f2c94c'), 0, -0.02, -0.02, hat, 0.01); M(new THREE.CylinderGeometry(0.295, 0.295, 0.05, 18), toon('#2f9a8f'), 0, 0.0, -0.02, hat, 0);
    return U.parts; })();
  const crestSlots = []; benJ.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const custFox = CUSTOMERS.map(o => { const f = strip(kit.makeFox({ ...CAST.player, look: o.fur ? { ...CAST.player.look, fur: o.fur, furDark: o.furDark } : CAST.player.look, torso: o.torso, outfit: o.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; return f; });

  // ---------- polish: blob shadows (phones have no shadow map), bulbs, motes ----------
  const blobT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(20,14,10,0.55)'); g.addColorStop(1, 'rgba(20,14,10,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blobG = new THREE.PlaneGeometry(1.3, 1.3).rotateX(-Math.PI / 2), blobM = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false });
  const blobs = [benW, benJ, jib, joss, ...custFox].map(f => { const b = new THREE.Mesh(blobG, blobM); b.renderOrder = 1; scene.add(b); return { f, b }; });
  function polishStep(t, dt) { for (const { f, b } of blobs) { const on = f.visible && f.parent === scene; b.visible = on; if (on) b.position.set(f.position.x, 0.018, f.position.z); }
    if (Y.bulbs && Math.floor(t * 4) !== Y.bulbs.k) { Y.bulbs.k = Math.floor(t * 4); const c = new THREE.Color(); for (let i = 0; i < Y.bulbs.n; i++) { const tw = 0.65 + 0.35 * Math.abs(Math.sin(t * 1.3 + i * 1.7)); c.set(Y.bulbs.cols[i % Y.bulbs.cols.length]).multiplyScalar(tw); Y.bulbs.im.setColorAt(i, c); } Y.bulbs.im.instanceColor.needsUpdate = true; }
    if (Y.motes) { const a = Y.motes.g.attributes.position; for (let i = 0; i < Y.motes.n; i++) { const s0 = Y.motes.seed[i]; a.setXYZ(i, s0[0] + Math.sin(t * 0.3 + i) * 0.35, s0[1] + Math.sin(t * 0.21 + i * 2.1) * 0.3, s0[2] + Math.cos(t * 0.25 + i * 1.3) * 0.35); } a.needsUpdate = true; }
    if (Y.shaft) Y.shaft.opacity = 0.075 + Math.sin(t * 0.7) * 0.02; }

  // confetti for 3 stars + a gold sparkle when the glass goes on
  const CONF = (() => { const n = 70, im = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.07, 0.11), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide }), n), cols = ['#f2c94c', '#f0705a', '#2f9a8f', '#4fb8e6', '#fbf8ec', '#a78bfa'], P = []; for (let i = 0; i < n; i++) { im.setColorAt(i, new THREE.Color(cols[i % cols.length])); P.push({ p: V3(), v: V3(), r: V3(), w: V3(), life: 0 }); } im.count = 0; im.frustumCulled = false; scene.add(im); return { im, P, n, on: 0 }; })();
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s1 = V3(1, 1, 1);
  function confetti(at) { CONF.on = 3.2; CONF.P.forEach(c => { c.p.set(at.x + rr(-0.3, 0.3), 2.6, at.z + rr(-0.3, 0.3)); c.v.set(rr(-2.2, 2.2), rr(2.5, 5), rr(-2.2, 2.2)); c.r.set(rr(0, 6), rr(0, 6), rr(0, 6)); c.w.set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); c.life = rr(2.2, 3.2); }); CONF.im.count = CONF.n; }
  function confStep(dt) { if (CONF.on <= 0) return; CONF.on -= dt; CONF.P.forEach((c, i) => { c.life -= dt; c.v.y -= 6 * dt; c.v.multiplyScalar(1 - dt * 1.6); c.p.addScaledVector(c.v, dt); if (c.p.y < 0.02) { c.p.y = 0.02; c.v.set(0, 0, 0); } c.r.addScaledVector(c.w, dt); _q.setFromEuler(_e.set(c.r.x, c.r.y, c.r.z)); _m4.compose(c.p, _q, _s1.setScalar(c.life > 0 ? 1 : 0)); CONF.im.setMatrixAt(i, _m4); }); CONF.im.instanceMatrix.needsUpdate = true; if (CONF.on <= 0) CONF.im.count = 0; }
  function sparkle() { if (!B) return; for (let i = 0; i < 18; i++) { const x = rr(-0.45, 0.45) * B.L, p = B.g.localToWorld(V3(x, B.top(x) + 0.05, rr(-0.2, 0.2) * B.W)); puff(p.x, p.y, p.z, 0xfff1a8, 1); } }

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), boardN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, flash: null, flashT: 0, say: '', sayT: 0, hold: null, ptr: null, react: null, done: null, t: 0, phT: 0, confirm: 0,
    dlg: null, prompt: null, toast: null, toastT: 0, near: null, path: null, shaka: 0 };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  let B = null, cust = null, CU = null, lastCust = -1;
  const wp = o => o.getWorldPosition(new THREE.Vector3());

  // ---------- one board ----------
  const FOAM = new THREE.Color('#f6f3ea');
  function makeBoard(job) {
    const D = BOARDS[job.type], L = D.L, W = D.W, T = D.T, g = new THREE.Group(); g.position.set(BAY.x, STAND + 0.02, BAY.z); g.rotation.y = Math.PI; scene.add(g);
    const B = { job, D, L, W, T, g, flip: 0, flipTo: 0, has: t => job.tasks.includes(t) };
    // deck canvas: everything that happens on the deck is painted here
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 256; B.cv = cv; B.ctx = cv.getContext('2d'); B.tex = new THREE.CanvasTexture(cv); B.tex.colorSpace = THREE.SRGBColorSpace; B.tex.repeat.set(1 / L, 1 / W); B.tex.offset.set(0.5, 0.5); B.tex.anisotropy = 4;
    B.deckMat = new THREE.MeshToonMaterial({ map: B.tex, gradientMap: ST.grad }); B.railMat = new THREE.MeshToonMaterial({ color: '#f6f3ea', gradientMap: ST.grad });
    B.mesh = new THREE.Mesh(boardGeo(job.type, L, W, T), [B.deckMat, B.railMat]); B.mesh.castShadow = B.mesh.receiveShadow = true; addOutline(B.mesh, 0.012); g.add(B.mesh);
    B.top = x => T + 0.018 + rockY(L, x); B.bot = x => -0.018 + rockY(L, x);
    // zones (tail → nose) for sand / art / glass
    B.rough = [1, 1, 1, 1]; B.cover = [0, 0, 0, 0]; B.colZ = [null, null, null, null]; B.fromZ = [FOAM.clone(), FOAM.clone(), FOAM.clone(), FOAM.clone()]; B.spread = [0, 0, 0, 0]; B.wax = []; B.waxN = { a: 0, b: 0 }; B.chatter = 0; B.chatterN = 0;
    if (!B.has('sand')) B.rough = [0, 0, 0, 0];
    if (!B.has('art')) { B.cover = [1, 1, 1, 1]; B.colZ = Array(4).fill('old'); }
    if (!B.has('glass')) B.spread = [0, 0, 0, 0];
    B.dots = Array.from({ length: 220 }, () => [Math.random() * 1024, 16 + Math.random() * 224, 1 + Math.random() * 2.6]);
    // high spots
    B.bumps = []; if (B.has('plane')) { const n = 3 + Math.min(3, job.day); for (let i = 0; i < n; i++) { const x = (-0.38 + 0.76 * (i + rr(0.2, 0.8)) / n) * L, z = rr(-0.16, 0.16) * W, m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshToonMaterial({ color: '#e2453f', gradientMap: ST.grad })); m.position.set(x, B.top(x) - 0.004, z); m.scale.set(1.3, 0.32, 0.9); addOutline(m, 0.006); g.add(m); B.bumps.push({ x, z, h: 1, m }); } }
    // the foam blank around it (CUT)
    { const Lb = L + 0.18, Wb = W + 0.2, r = 0.12, sh = new THREE.Shape(); sh.moveTo(-Lb / 2 + r, -Wb / 2); sh.lineTo(Lb / 2 - r, -Wb / 2); sh.quadraticCurveTo(Lb / 2, -Wb / 2, Lb / 2, -Wb / 2 + r); sh.lineTo(Lb / 2, Wb / 2 - r); sh.quadraticCurveTo(Lb / 2, Wb / 2, Lb / 2 - r, Wb / 2); sh.lineTo(-Lb / 2 + r, Wb / 2); sh.quadraticCurveTo(-Lb / 2, Wb / 2, -Lb / 2, Wb / 2 - r); sh.lineTo(-Lb / 2, -Wb / 2 + r); sh.quadraticCurveTo(-Lb / 2, -Wb / 2, -Lb / 2 + r, -Wb / 2);
      const bg = new THREE.ExtrudeGeometry(sh, { depth: T + 0.05, bevelEnabled: false, curveSegments: 4 }); bg.rotateX(-Math.PI / 2); bg.translate(0, -0.018, 0); { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + rockY(L, Math.max(-L / 2, Math.min(L / 2, p.getX(i))))); p.needsUpdate = true; bg.computeVertexNormals(); }
      const bcv = document.createElement('canvas'); bcv.width = 1024; bcv.height = 256; B.bcv = bcv; B.bctx = bcv.getContext('2d'); B.btex = new THREE.CanvasTexture(bcv); B.btex.colorSpace = THREE.SRGBColorSpace; B.btex.repeat.set(1 / Lb, 1 / Wb); B.btex.offset.set(0.5, 0.5);
      B.blank = new THREE.Mesh(bg, [new THREE.MeshToonMaterial({ map: B.btex, gradientMap: ST.grad }), new THREE.MeshToonMaterial({ color: '#efeadc', gradientMap: ST.grad })]); B.blank.castShadow = true; addOutline(B.blank, 0.012); g.add(B.blank); B.Lb = Lb; B.Wb = Wb;
      // the pencil line: the board outline resampled to evenly spaced points
      const raw = boardOutline(job.type, L, W, 60), cum = [0]; for (let i = 1; i <= raw.length; i++) { const a = raw[i - 1], b = raw[i % raw.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
      const per = cum[cum.length - 1], N = Math.round(per / 0.09); B.line = []; let k = 0; for (let i = 0; i < N; i++) { const s = per * i / N; while (cum[k + 1] < s) k++; const a = raw[k], b = raw[(k + 1) % raw.length], f = (s - cum[k]) / Math.max(1e-6, cum[k + 1] - cum[k]); B.line.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); }
      B.cut = B.line.map(() => 0); B.cutGood = 0; B.cutAll = 0; }
    B.mesh.visible = false; B.bumps.forEach(b => b.m.visible = false);
    // glass puddle + fin slots
    B.puddle = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.7, depthWrite: false })); B.puddle.rotation.x = -Math.PI / 2; B.puddle.position.set(0, B.top(0) + 0.006, 0); B.puddle.visible = false; g.add(B.puddle); B.glassSt = 'pour'; B.pourQ = 0;
    B.finState = 'pick'; B.finWrong = 0; B.slots = [];
    drawBlank(B); drawDeck(B);
    return B; }
  const lerpCol = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
  function zoneCol(B, z) { const c = B.colZ[z]; if (c === 'old' || !c) return c === 'old' ? '#' + FOAM.getHexString() : '#' + B.fromZ[z].getHexString(); return '#' + B.fromZ[z].clone().lerp(new THREE.Color(PAINTS[c].col), B.cover[z]).getHexString(); }
  function drawDeck(B) { const c = B.ctx; c.clearRect(0, 0, 1024, 256);
    for (let z = 0; z < 4; z++) { c.fillStyle = zoneCol(B, z); c.fillRect(z * 256, 0, 256, 256); }
    c.fillStyle = 'rgba(122,90,58,0.35)'; c.fillRect(0, 126, 1024, 4);   // stringer
    // shaper's logo near the middle
    c.save(); c.translate(560, 128); c.scale(-1, 1); c.fillStyle = 'rgba(32,30,29,0.85)'; c.beginPath(); c.ellipse(0, 0, 54, 26, 0, 0, 7); c.fill(); c.fillStyle = '#f2c94c'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('JIB', 0, 1); c.restore();
    for (const d of B.dots) { const z = Math.min(3, Math.floor(d[0] / 256)), a = B.rough[z]; if (a <= 0.02) continue; c.fillStyle = 'rgba(150,140,120,' + (a * 0.85).toFixed(2) + ')'; c.fillRect(d[0], d[1], d[2] * 2, d[2]); }
    for (const b of B.bumps) { if (b.h <= 0) continue; const x = (b.x / B.L + 0.5) * 1024, y = (0.5 + b.z / B.W) * 256, gr = c.createRadialGradient(x, y, 4, x, y, 60); gr.addColorStop(0, 'rgba(226,69,63,' + (0.55 * b.h).toFixed(2) + ')'); gr.addColorStop(1, 'rgba(226,69,63,0)'); c.fillStyle = gr; c.fillRect(x - 60, y - 60, 120, 120); }
    for (let z = 0; z < 4; z++) { const s = Math.min(1, B.spread[z]); if (s <= 0) continue; c.strokeStyle = 'rgba(255,255,255,' + (0.45 * s).toFixed(2) + ')'; c.lineWidth = 9; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(z * 256 + 20 + i * 50, 230); c.lineTo(z * 256 + 70 + i * 50, 26); c.stroke(); } }
    c.strokeStyle = 'rgba(255,252,236,0.85)'; c.lineWidth = 7; c.lineCap = 'round'; for (const w of B.wax) { if (w.length < 2) continue; c.beginPath(); w.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
    B.tex.needsUpdate = true; const avg = new THREE.Color(zoneCol(B, 1)); B.railMat.color.copy(avg); B.dirty = false; }
  function drawBlank(B) { const c = B.bctx, X = x => (x / B.Lb + 0.5) * 1024, Yy = y => (0.5 - y / B.Wb) * 256; c.fillStyle = '#f6f3ea'; c.fillRect(0, 0, 1024, 256); c.fillStyle = 'rgba(122,90,58,0.3)'; c.fillRect(0, 126, 1024, 4);
    const n = B.line.length; c.lineCap = 'round';
    for (let i = 0; i < n; i++) { const a = B.line[i], b = B.line[(i + 1) % n], both = B.cut[i] && B.cut[(i + 1) % n]; c.strokeStyle = both ? '#c42d3c' : '#3a3836'; c.lineWidth = both ? 7 : 3; c.setLineDash(both ? [] : [10, 9]); c.beginPath(); c.moveTo(X(a[0]), Yy(a[1])); c.lineTo(X(b[0]), Yy(b[1])); c.stroke(); }
    c.setLineDash([]); B.btex.needsUpdate = true; B.bdirty = false; }
  const zoneOf = (B, x) => Math.max(0, Math.min(3, Math.floor((x / B.L + 0.5) * 4)));

  // ---------- jobs ----------
  function newJob() { const d = S.day, type = S.forceType || pick(d <= 1 ? ['short', 'fish', 'short'] : ['short', 'fish', 'long']), D = BOARDS[type];
    const pool = ORDER.slice(1), n = d <= 1 ? 2 : d <= 2 ? 3 : d <= 4 ? 4 : 5 + (Math.random() < 0.5 ? 1 : 0), tasks = ['cut'];
    if (S.forceType) tasks.push(...pool); else { if (Math.random() < 0.75) tasks.push('art'); while (tasks.length < n + 1) { const t = pick(pool.filter(q => !tasks.includes(q))); tasks.push(t); } }
    tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)); let oi; do { oi = Math.floor(Math.random() * CUSTOMERS.length); } while (oi === lastCust); lastCust = oi;
    return { type, tasks, paint: pick(PK), fins: pick(D.fins), owner: oi, day: d }; }
  function nextBoard() { if (B) { B.g.parent && B.g.parent.remove(B.g); B = null; } const job = newJob(); CU = CUSTOMERS[job.owner]; cust = custFox[job.owner]; custFox.forEach(f => f.visible = f === cust); S.job = job;
    place(cust, Y.spots.outside, Math.PI / 2); cust.userData.mood = 'happy'; S.phase = 'arrive'; S.phT = 0; S.tool = null; S.brush = null; S.confirm = 0; S.doneSeen = {};
    S.path = { f: cust, pts: [Y.spots.walkIn, { x: -6.1, z: 0.6 }, { x: -6.0, z: -1.2 }, Y.spots.counter], sp: 2.3 }; SND.sfx('bell'); }

  // ---------- task progress ----------
  function info(id) { if (!B) return { done: false, q: 0, prog: 0, txt: '' };
    if (id === 'cut') { const c = B.cut.filter(Boolean).length, n = B.cut.length, done = c >= n - 1 || B.cutDone; return { done, q: B.cutAll ? clamp((B.cutGood / B.cutAll - 0.35) / 0.5, 0.45, 1) : 1, prog: c / n, txt: done ? 'DONE' : Math.round(c / n * 100) + '%' }; }
    if (id === 'plane') { const l = B.bumps.filter(b => b.h > 0).length; return { done: !l, q: Math.max(0.6, 1 - B.chatterN * 0.1), prog: B.bumps.length ? 1 - l / B.bumps.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'sand') { const r = B.rough.reduce((a, b) => a + Math.max(0, b), 0) / 4; return { done: r <= 0.02, q: 1, prog: 1 - r, txt: r <= 0.02 ? 'DONE' : Math.round((1 - r) * 100) + '%' }; }
    if (id === 'art') { const c = B.cover.filter(v => v >= 1).length, ok = B.cover.filter((v, z) => v >= 1 && B.colZ[z] === B.job.paint).length; return { done: c === 4, q: ok / 4, prog: c / 4, txt: c === 4 ? (ok === 4 ? 'DONE' : 'WRONG COLOUR') : c + ' / 4' }; }
    if (id === 'glass') { const s = B.spread.reduce((a, b) => a + Math.min(1, b), 0) / 4, done = B.glassSt === 'spread' && s >= 0.999; return { done, q: B.pourQ || 0, prog: B.glassSt === 'pour' ? 0 : 0.3 + s * 0.7, txt: done ? 'DONE' : B.glassSt === 'pour' ? 'POUR' : Math.round(s * 100) + '%' }; }
    if (id === 'fins') { const p = B.slots.filter(s => s.on).length, done = B.finState === 'done'; return { done, q: Math.max(0.5, 1 - B.finWrong * 0.25), prog: done ? 1 : B.finState === 'pick' ? 0 : 0.3 + 0.7 * p / Math.max(1, B.slots.length), txt: done ? 'DONE' : B.finState === 'pick' ? 'PICK' : p + ' / ' + B.slots.length }; }
    if (id === 'wax') { const need = 3, a = Math.min(need, B.waxN.a), b = Math.min(need, B.waxN.b); return { done: a >= need && b >= need, q: 1, prog: (a + b) / (need * 2), txt: a >= need && b >= need ? 'DONE' : (a + b) + ' / ' + need * 2 }; }
    return { done: true, q: 1 }; }
  const allDone = () => B && B.job.tasks.every(t => info(t).done);
  function blocked(id) { if (!B) return null; const need = (t, msg) => B.has(t) && !info(t).done ? msg : null;
    if (id !== 'cut' && !info('cut').done) return 'CUT THE OUTLINE FIRST';
    if (id === 'sand') return need('plane', 'PLANE THE HIGH SPOTS FIRST');
    if (id === 'art') return need('plane', 'PLANE THE HIGH SPOTS FIRST') || need('sand', 'SAND IT SMOOTH FIRST');
    if (id === 'glass') return need('plane', 'PLANE IT FIRST') || need('sand', 'SAND IT BEFORE YOU GLASS') || need('art', 'COLOUR GOES ON BEFORE THE GLASS');
    if (id === 'fins' || id === 'wax') return need('glass', 'GLASS IT FIRST');
    return null; }
  const nextTask = () => B && B.job.tasks.find(t => !info(t).done && !blocked(t));
  function setTool(id) { if (S.phase !== 'work' || !B || !B.job.tasks.includes(id)) return; const bl = blocked(id); if (bl) { flash(bl, '#ec3013', 1.6); SND.sfx('wrong'); buzz(50); return; } if (S.tool !== id) SND.sfx('click'); S.tool = id; S.userToolT = performance.now(); S.ptr = null; const ft = id === 'fins' && B.finState !== 'done' ? 1 : 0; if (ft !== B.flipTo) SND.sfx('flip'); B.flipTo = ft; }
  function checkDone() { if (!B) return; for (const t of B.job.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); SND.sfx(t === 'cut' ? 'cutDone' : 'done'); buzz(t === 'cut' ? 40 : 25); const p = wp(B.g); for (let i = 0; i < 6; i++) puff(p.x + rr(-0.9, 0.9), p.y + rr(0.1, 0.6), p.z + rr(-0.3, 0.3), 0xffe7a0, 1);
        if (t === 'fins') setTimeout(() => { if (B && B.flipTo) { B.flipTo = 0; SND.sfx('flip'); } }, 900); if (t === 'glass') sparkle();
        const nx = nextTask(); if (!nx) say('JIB: "That is a board. Hand it over to ' + CU.name + '."', 4); else { const was = S.tool; setTimeout(() => { if (S.phase === 'work' && S.tool === was && !S.ptr) setTool(nx); }, 1100); } } } }

  // ---------- task actions (board-local coords: x along the board, z across) ----------
  function segDist(px, py, line) { let best = 9; for (let i = 0; i < line.length; i++) { const a = line[i], b = line[(i + 1) % line.length], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, t = l2 ? clamp(((px - a[0]) * dx + (py - a[1]) * dy) / l2, 0, 1) : 0; best = Math.min(best, Math.hypot(px - a[0] - dx * t, py - a[1] - dy * t)); } return best; }
  function cutAt(x, z) { if (B.cutDone) return; const sy = -z, d = segDist(x, sy, B.line); if (d < 0.26) { B.cutAll++; if (d < 0.05) B.cutGood++; } let n = 0;
    B.line.forEach((p, i) => { if (!B.cut[i] && Math.hypot(p[0] - x, p[1] - sy) < 0.085) { B.cut[i] = 1; n++; } }); SND.loop('saw', n ? 1 : 0.6); if (n) { B.bdirty = true; const p = B.g.localToWorld(V3(x, B.top(x) + 0.05, z)); puff(p.x, p.y, p.z, 0xffffff, 1); }
    if (info('cut').done) { B.cutDone = true; B.blank.visible = false; B.mesh.visible = true; B.bumps.forEach(b => b.m.visible = true); const p = wp(B.g); for (let i = 0; i < 14; i++) puff(p.x + rr(-1.1, 1.1), p.y + rr(0, 0.3), p.z + rr(-0.4, 0.4), 0xffffff, 1); SND.sfx('crack'); B.offcuts = [0, 1].map(s => { const m = new THREE.Mesh(new THREE.BoxGeometry(B.L * 0.8, 0.07, 0.05), toon('#f6f3ea')); m.position.copy(p).add(V3(0, 0.05, (s ? 1 : -1) * (B.W / 2 + 0.06))); scene.add(m); return { m, v: V3(0, 0.6, (s ? 1 : -1) * 0.8), t: 0 }; }); tone(330, 0.2, 0.04); checkDone(); } }
  function planeMove(a, b) { const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz); if (len < 0.003) return; const along = Math.abs(dx) > 1.4 * Math.abs(dz);
    if (!along) { B.chatter += len; SND.loop('planer', 0.5); if (B.chatter > 0.35) { B.chatter = 0; B.chatterN++; flash('CHATTER! PLANE ALONG THE BOARD · NOSE ↔ TAIL', '#ec3013', 1.6); SND.sfx('wrong'); buzz(60); } return; }
    SND.loop('planer', 0.75); let hit = false; for (const bp of B.bumps) { if (bp.h <= 0 || Math.abs(b.z - bp.z) > 0.13 || bp.x < Math.min(a.x, b.x) - 0.11 || bp.x > Math.max(a.x, b.x) + 0.11) continue; hit = true; bp.h = Math.max(0, bp.h - Math.abs(dx) * (upg('planer') ? 2.6 : 1.3)); bp.m.scale.y = 0.06 + 0.26 * bp.h; bp.m.material.color.set(lerpCol('#22c55e', '#e2453f', bp.h)); B.dirty = true; if (bp.h <= 0) { bp.m.visible = false; tone(990, 0.08, 0.04); const p = B.g.localToWorld(V3(bp.x, B.top(bp.x), bp.z)); puff(p.x, p.y + 0.05, p.z, 0xfff3d6, 3); checkDone(); } }
    if (hit) SND.loop('planer', 1); if (hit && Math.random() < 0.6) { const p = B.g.localToWorld(V3(b.x, B.top(b.x) + 0.05, b.z)); puff(p.x, p.y, p.z, 0xfff3d6, 1); if (Math.random() < 0.5) audio.burst && audio.burst(0.05, 1800, 0.06); } }
  function sandMove(x, dpx, circ) { const z = zoneOf(B, x); SND.loop('sander', circ ? 1 : 0.7); if (B.rough[z] <= 0) { return; } B.rough[z] = Math.max(0, B.rough[z] - dpx / (circ ? 280 : 840) * (upg('sander') ? 2 : 1)); B.dirty = true; if (Math.random() < 0.25) { const p = B.g.localToWorld(V3(x, B.top(x) + 0.05, 0)); puff(p.x, p.y, p.z + rr(-0.1, 0.1), 0xece6d6, 1); } if (Math.random() < 0.2) audio.burst && audio.burst(0.04, 2600, 0.05); if (B.rough[z] <= 0) { tone(880, 0.06, 0.04); checkDone(); } }
  function sprayAt(x, dpx) { const z = zoneOf(B, x); SND.loop('spray', 1); if (B.colZ[z] !== S.brush) { B.fromZ[z] = new THREE.Color(zoneCol(B, z)); B.colZ[z] = S.brush; B.cover[z] = 0; } if (B.cover[z] >= 1) return; B.cover[z] = Math.min(1, B.cover[z] + dpx / (upg('gun') ? 110 : 240)); B.dirty = true;
    if (Math.random() < 0.5) { const p = B.g.localToWorld(V3(x, B.top(x) + 0.12, rr(-0.15, 0.15))); puff(p.x, p.y, p.z, new THREE.Color(PAINTS[S.brush].col).getHex(), 1); } if (Math.random() < 0.15) audio.burst && audio.burst(0.05, 4000, 0.04); if (B.cover[z] >= 1) { tone(880, 0.06, 0.04); checkDone(); } }
  function setBrush(k) { if (!PAINTS[k] || !B) return; S.brush = k; SND.sfx('pick'); flash('SPRAY · ' + PAINTS[k].name + (k === B.job.paint ? '' : ' · CARD SAYS ' + PAINTS[B.job.paint].name), k === B.job.paint ? '#22c55e' : '#e6b45a', 1.3); }
  function startPour() { if (B.glassSt !== 'pour' || S.hold) return; S.hold = { v: 0, t0: performance.now() }; B.puddle.visible = true; B.puddle.scale.setScalar(0.05); tone(330, 0.3, 0.03, 'sine'); }
  const pourZone = () => { const g = upg('resin') ? 0.06 : 0; return [POUR[0] - g, POUR[1] + g]; };
  function releasePour() { const H = S.hold; if (!H) return; S.hold = null; const v = H.v, Z = pourZone();
    if (v < Z[0]) { B.puddle.visible = false; flash('TOO THIN · HOLD LONGER', '#ffffff', 1.3); tone(300, 0.1, 0.04); return; }
    B.pourQ = v <= Z[1] ? 1 : v < 1 ? 0.75 : 0.5; B.glassSt = 'spread'; SND.sfx('plop'); buzz(v <= Z[1] ? 25 : 60); flash(v <= Z[1] ? 'PERFECT POUR! NOW SWIPE TO SPREAD IT' : v < 1 ? 'A BIT MUCH · SWIPE TO SPREAD IT' : 'OVERFLOWED · RESIN ON THE FLOOR', v <= Z[1] ? '#22c55e' : v < 1 ? '#e6b45a' : '#ec3013', 1.8); tone(v <= Z[1] ? 1320 : 440, 0.1, 0.04); }
  function spreadAt(x, dpx) { if (B.glassSt !== 'spread') return; const z = zoneOf(B, x); SND.loop('squeegee', 1); if (B.spread[z] >= 1) return; B.spread[z] = Math.min(1, B.spread[z] + dpx / 300); B.dirty = true; const left = 1 - B.spread.reduce((a, b) => a + b, 0) / 4; B.puddle.scale.set(0.3 + left * 1.6, 0.3 + left * 0.8, 1); B.puddle.position.x = x * 0.6; if (left <= 0.001) B.puddle.visible = false; if (B.spread[z] >= 1) { tone(990, 0.06, 0.04); checkDone(); } }
  const FIN_POS = (n, L, W) => { const t = -L / 2; return n === 1 ? [[t + (L > 2.5 ? 0.36 : 0.2), 0, 0]] : n === 2 ? [[t + 0.26, W * 0.3, -0.12], [t + 0.26, -W * 0.3, 0.12]] : n === 3 ? [[t + 0.32, W * 0.31, -0.1], [t + 0.32, -W * 0.31, 0.1], [t + 0.1, 0, 0]] : [[t + 0.34, W * 0.33, -0.1], [t + 0.34, -W * 0.33, 0.1], [t + 0.18, W * 0.22, -0.06], [t + 0.18, -W * 0.22, 0.06]]; };
  const FIN_G = finGeo();
  function pickFins(n) { if (!B || B.finState !== 'pick') return; if (n !== B.job.fins) { B.finWrong++; flash(FINSET[n] + ' WON\'T DO · CARD SAYS ' + FINSET[B.job.fins], '#ec3013', 1.6); SND.sfx('wrong'); buzz(60); return; }
    B.finState = 'place'; SND.sfx('pick'); flash(FINSET[n] + ' · TAP EACH GLOWING FIN BOX', '#22c55e', 1.6);
    for (const [x, z, ry] of FIN_POS(n, B.L, B.W)) { const slot = new THREE.Mesh(new THREE.BoxGeometry(0.21, 0.014, 0.045), new THREE.MeshBasicMaterial({ color: 0xffd23a })); slot.position.set(x, B.bot(x) - 0.004, z); slot.rotation.y = ry; B.g.add(slot); const f = new THREE.Mesh(FIN_G, toon(B.job.paint === 'navy' ? '#f2c94c' : '#201e1d')); addOutline(f, 0.004); f.position.set(x, B.bot(x), z); f.rotation.set(Math.PI, ry, 0); f.scale.setScalar(1.3); f.visible = false; B.g.add(f); B.slots.push({ slot, f, on: false, x, z, pop: 0 }); } }
  function setFin(s) { if (!s || s.on) return; s.on = true; s.f.visible = true; s.pop = 0.01; s.slot.material.color.set(0x3a3836); SND.sfx('fin'); buzz(15); if (B.slots.every(q => q.on)) { B.finState = 'done'; checkDone(); } }
  function waxPoint(x, z, start) { const p = [(x / B.L + 0.5) * 1024, (0.5 + z / B.W) * 256]; if (start || !B.wax.length) B.wax.push([p]); else B.wax[B.wax.length - 1].push(p); if (B.wax.length > 60) B.wax.shift(); B.dirty = true; SND.loop('wax', 1); }
  function waxStroke(a, b) { if (!a || !b) return; const dx = b.x - a.x, dz = b.z - a.z; if (Math.hypot(dx, dz) < 0.18) return; const r = Math.abs(dz) / Math.max(1e-4, Math.abs(dx));
    if (r < 0.35 || r > 2.8) { flash('GO DIAGONAL · CROSS-HATCH ╳', '#e6b45a', 1.3); SND.sfx('wrong'); return; } const k = dx * dz > 0 ? 'a' : 'b'; B.waxN[k]++; tone(k === 'a' ? 880 : 1100, 0.06, 0.04);
    const need = 3; if (B.waxN[k] === need) flash(B.waxN[k === 'a' ? 'b' : 'a'] >= need ? 'BASECOAT ON' : 'GOOD · NOW THE OTHER DIAGONAL', '#22c55e', 1.4); checkDone(); }

  // ---------- tool props that follow your finger ----------
  const TOOLS = {}; { const mk = (k, f) => { const g = new THREE.Group(); f(g); g.visible = false; scene.add(g); TOOLS[k] = g; };
    mk('cut', g => { M(new THREE.BoxGeometry(0.2, 0.12, 0.08), toon('#f2c94c'), 0, 0.12, 0, g, 0.008); M(new THREE.BoxGeometry(0.06, 0.1, 0.06), toon('#201e1d'), -0.06, 0.22, 0, g, 0.006); g.userData.blade = M(new THREE.BoxGeometry(0.012, 0.14, 0.03), toon('#d7dde3'), 0.04, 0.0, 0, g, 0.004); });
    mk('plane', g => { M(new THREE.BoxGeometry(0.3, 0.1, 0.14), toon('#3a6ea5'), 0, 0.06, 0, g, 0.008); M(new THREE.BoxGeometry(0.08, 0.1, 0.05), toon('#201e1d'), -0.08, 0.15, 0, g, 0.006); M(new THREE.CylinderGeometry(0.04, 0.04, 0.12, 10), toon('#201e1d'), 0.08, 0.13, 0, g, 0.006, 0.04).rotation.x = Math.PI / 2; });
    mk('sand', g => { g.userData.pad = M(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 16), toon('#e6b45a'), 0, 0.02, 0, g, 0.006, 0.11); M(new THREE.CylinderGeometry(0.06, 0.08, 0.1, 12), toon('#f0705a'), 0, 0.09, 0, g, 0.006, 0.08); });
    mk('art', g => { M(new THREE.CylinderGeometry(0.045, 0.045, 0.2, 12), toon('#d7dde3'), 0, 0.2, 0, g, 0.006, 0.045); g.userData.cap = M(new THREE.CylinderGeometry(0.047, 0.047, 0.05, 12), toon('#f2c94c'), 0, 0.32, 0, g, 0.005, 0.047); });
    mk('glass', g => { M(new THREE.BoxGeometry(0.04, 0.05, 0.3), toon('#f2c94c'), 0, 0.03, 0, g, 0.006); M(new THREE.BoxGeometry(0.03, 0.12, 0.04), toon('#201e1d'), 0, 0.1, 0, g, 0.005); });
    mk('wax', g => { M(new THREE.BoxGeometry(0.12, 0.06, 0.12), toon('#fbf3c8'), 0, 0.03, 0, g, 0.006); }); }
  const showTool = (k, p) => { for (const t in TOOLS) TOOLS[t].visible = false; if (!k || !TOOLS[k] || !p) return; TOOLS[k].visible = true; TOOLS[k].position.copy(p); TOOLS[k].rotation.y = Math.PI / 2; };

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  function hitBoard(x, y) { if (!B) return null; ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const t = B.cutDone ? B.mesh : B.blank, h = ray.intersectObject(t, false)[0]; if (!h) return null; const p = B.g.worldToLocal(h.point.clone()); return { x: p.x, z: p.z, w: h.point.clone() }; }
  function floorAt(x, y) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const d = ray.ray.direction; if (d.y > -0.01) return null; const t = -ray.ray.origin.y / d.y; return ray.ray.origin.clone().addScaledVector(d, t); }
  function onDown(e) { SND.init(); S.lastInput = performance.now(); if (DM.on) return; const { x, y } = local(e);
    if (S.phase === 'walk') { S.ptr = { x, y, x0: x, y0: y, t0: performance.now(), walk: true }; return; }
    if (S.phase !== 'work' || !B || S.hold) return; e.preventDefault(); const T = S.tool, h = hitBoard(x, y); S.ptr = { x, y, kind: null, last: h, spin: 0, a: null };
    if (!T) return;
    if (T === 'cut') { S.ptr.kind = 'cut'; if (h) { cutAt(h.x, h.z); showTool('cut', h.w); } else flash('TRACE THE PENCIL LINE ON THE BLANK', '#ffffff', 1.1); }
    else if (T === 'plane') { S.ptr.kind = 'plane'; if (h) showTool('plane', h.w); }
    else if (T === 'sand') { S.ptr.kind = 'sand'; if (h) showTool('sand', h.w); }
    else if (T === 'art') { if (!S.brush) { flash('PICK A COLOUR BELOW', '#ffffff', 1.2); return; } S.ptr.kind = 'art'; if (h) { sprayAt(h.x, 14); showTool('art', h.w); } }
    else if (T === 'glass') { if (B.glassSt === 'pour') { if (!h) { flash('HOLD ON THE BOARD TO POUR', '#ffffff', 1.1); return; } startPour(); } else { S.ptr.kind = 'glass'; if (h) showTool('glass', h.w); } }
    else if (T === 'fins') { if (B.finState === 'pick') { flash('PICK THE FIN SETUP BELOW', '#ffffff', 1.2); return; } let best = null, bd = 64 * scale(); for (const s of B.slots) { if (s.on) continue; const q = scr(wp(s.slot)), d = Math.hypot(q.x - x, q.y - y); if (d < bd) { bd = d; best = s; } } if (best) setFin(best); else flash('TAP A GLOWING FIN BOX', '#ffffff', 1); }
    else if (T === 'wax') { S.ptr.kind = 'wax'; S.ptr.first = h; if (h) { waxPoint(h.x, h.z, true); showTool('wax', h.w); } } }
  function onMove(e) { const P = S.ptr; if (!P) return; const { x, y } = local(e), d = Math.hypot(x - P.x, y - P.y); if (d < 1) return;
    if (P.walk) { P.x = x; P.y = y; return; } if (!P.kind || !B) return;
    const h = hitBoard(x, y);
    if (P.kind === 'cut') { if (h) { const L0 = P.last || h, n = Math.max(1, Math.ceil(Math.hypot(h.x - L0.x, h.z - L0.z) / 0.03)); for (let i = 1; i <= n; i++) cutAt(L0.x + (h.x - L0.x) * i / n, L0.z + (h.z - L0.z) * i / n); TOOLS.cut.userData.blade.position.y = Math.sin(performance.now() / 20) * 0.02; } }
    else if (P.kind === 'plane') { if (h && P.last) planeMove(P.last, h); }
    else if (P.kind === 'sand') { if (h) { const a = Math.atan2(y - P.y, x - P.x); if (P.a != null) { let dA = a - P.a; while (dA > Math.PI) dA -= 2 * Math.PI; while (dA < -Math.PI) dA += 2 * Math.PI; P.spin = P.spin * 0.9 + dA; } P.a = a; const circ = Math.abs(P.spin) > 1.6; if (circ && !S.circSeen) { S.circSeen = 1; flash('CIRCLES! SANDING 3× FASTER', '#22c55e', 1.4); } sandMove(h.x, d, circ); TOOLS.sand.userData.pad.rotation.y += 0.6; } }
    else if (P.kind === 'art') { if (h) sprayAt(h.x, d); }
    else if (P.kind === 'glass') { if (h) spreadAt(h.x, d); }
    else if (P.kind === 'wax') { if (h) { waxPoint(h.x, h.z, !P.first); if (!P.first) P.first = h; } }
    if (h) { showTool(P.kind, h.w); P.last = h; } P.x = x; P.y = y; }
  function onUp() { const P = S.ptr; S.ptr = null; showTool(null);
    if (S.hold) releasePour();
    if (P && P.walk && performance.now() - P.t0 < 450 && Math.hypot(P.x - P.x0, P.y - P.y0) < 14) tapWalk(P.x0, P.y0);
    if (P && P.kind === 'wax' && B) waxStroke(P.first, P.last); }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const keys = new Set(), stick = { x: 0, y: 0 };
  const onKD = e => { if (DM.on) return; const c = e.code;
    if (S.phase === 'walk') { if (S.dlg) { if (S.dlg.choices && /^Digit[1-3]$/.test(c)) { choose(+c.slice(5) - 1); e.preventDefault(); } else if (['KeyE', 'Space', 'Enter'].includes(c) && !S.dlg.choices) { nextLine(); e.preventDefault(); } else if (c === 'Escape') closeDialog(); return; }
      if (['KeyE', 'Digit1', 'KeyJ'].includes(c)) { use(); e.preventDefault(); return; } if (['Digit2', 'KeyK'].includes(c)) { shaka(); return; } if (['Space', 'Digit3', 'KeyL'].includes(c)) { e.preventDefault(); hop(); return; } keys.add(c); return; }
    if (S.phase === 'work' && B) { const m = /^Digit([1-7])$/.exec(c); if (m) { const t = B.job.tasks[+m[1] - 1]; if (t) setTool(t); } else if (c === 'Enter') handBack(); } };
  const onKU = e => keys.delete(e.code), onBlur = () => keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- WALK mode: Ben on the shop floor ----------
  const PW = { x: Y.spots.walkIn.x, z: Y.spots.walkIn.z, face: Math.PI / 2, spd: 0 }, CAMW = { yaw: 0, zoom: 1, pitch: 0.62 };
  function collide(p, r = 0.34) { const [bx0, bz0, bx1, bz1] = Y.bounds; for (const [x0, z0, x1, z1] of Y.solids) { if (p.x > x0 - r && p.x < x1 + r && p.z > z0 - r && p.z < z1 + r) { const dl = p.x - (x0 - r), dr = x1 + r - p.x, dn = p.z - (z0 - r), df = z1 + r - p.z, m = Math.min(dl, dr, dn, df); if (m === dl) p.x = x0 - r; else if (m === dr) p.x = x1 + r; else if (m === dn) p.z = z0 - r; else p.z = z1 + r; } }
    const inDoor = Math.abs(p.z - 2.5) < 0.9; p.x = clamp(p.x, inDoor ? -8.9 : bx0, bx1); p.z = clamp(p.z, bz0, bz1); }
  const npcSolids = () => [[jib.position.x, jib.position.z], [joss.position.x, joss.position.z]];
  function walkStep(dt) { const kx = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0), ky = (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0) - (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0);
    let ix = clamp(stick.x + kx, -1, 1), iy = clamp(stick.y + ky, -1, 1); const mag = Math.min(1, Math.hypot(ix, iy)); if (S.dlg) ix = iy = 0;
    let mx = 0, mz = 0, sp = 0; const fy = CAMW.yaw, fx = -Math.sin(fy), fz = -Math.cos(fy), rx = Math.cos(fy), rz = -Math.sin(fy);
    if (mag > 0.12) { S.goto = null; mx = rx * ix + fx * iy; mz = rz * ix + fz * iy; const l = Math.hypot(mx, mz) || 1; mx /= l; mz /= l; sp = 3.4 * mag; }
    else if (S.goto) { const dx = S.goto.x - PW.x, dz = S.goto.z - PW.z, d = Math.hypot(dx, dz); if (d < 0.25) { const then = S.goto.then; S.goto = null; if (then) { S.near = Y.talk.find(t => t.id === then) || S.near; use(); } } else { mx = dx / d; mz = dz / d; sp = Math.min(3.0, d * 3); } }
    if (sp > 0) { const p = { x: PW.x + mx * sp * dt, z: PW.z + mz * sp * dt }; collide(p); for (const [nx, nz] of npcSolids()) { const dx = p.x - nx, dz = p.z - nz, d = Math.hypot(dx, dz); if (d < 0.6 && d > 1e-4) { p.x = nx + dx / d * 0.6; p.z = nz + dz / d * 0.6; } } PW.x = p.x; PW.z = p.z; PW.face = Math.atan2(mx, mz); }
    PW.spd = damp(PW.spd, sp, 10, dt); if (sp > 0) { PW.stepD = (PW.stepD || 0) + sp * dt; if (PW.stepD > 0.75) { PW.stepD = 0; SND.sfx('step'); } } benW.position.set(PW.x, 0, PW.z); let df = PW.face - benW.rotation.y; while (df > Math.PI) df -= 2 * Math.PI; while (df < -Math.PI) df += 2 * Math.PI; benW.rotation.y += df * Math.min(1, dt * 12);
    kit.animFox(benW, dt, PW.spd);
    // what's near: talk / use prompts
    let best = null, bd = 9; for (const t of Y.talk) { const d = Math.hypot(t.x - PW.x, t.z - PW.z); if (d < t.r && d < bd) { bd = d; best = t; } } S.near = best;
    jib.userData.lookAt = Math.hypot(jib.position.x - PW.x, jib.position.z - PW.z) < 5 ? V3(PW.x, 1.6, PW.z) : null; joss.userData.lookAt = Math.hypot(joss.position.x - PW.x, joss.position.z - PW.z) < 3.5 ? V3(PW.x, 1.6, PW.z) : null; }
  function tapWalk(x, y) { if (S.dlg) return; ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera);
    for (const [f, id] of [[jib, 'jib'], [joss, 'joss']]) { if (ray.intersectObject(f, true).length) { const t = Y.talk.find(q => q.id === id); S.goto = { x: t.x, z: t.z, then: id }; tone(880, 0.05, 0.03); return; } }
    if (B === null && Y.stands.some(s => ray.intersectObject(s, true).length)) { const t = Y.talk.find(q => q.id === 'bay'); S.goto = { x: t.x, z: t.z, then: 'bay' }; return; }
    const p = floorAt(x, y); if (!p) return; const t = Y.talk.find(q => Math.hypot(q.x - p.x, q.z - p.z) < 0.9); S.goto = t ? { x: t.x, z: t.z, then: t.id } : { x: clamp(p.x, -8.6, 8.6), z: clamp(p.z, -5.5, 5.6) }; S.tapMark = { p: p.clone(), t: 0.6 }; }
  function use() { SND.init(); const n = S.near; if (S.phase !== 'walk' || S.dlg || !n) return; SND.sfx('click');
    if (n.id === 'jib') { S.dlg = { who: 'jib', lines: S.talkedJib ? [{ who: 'npc', text: pick(['Back again. Blanks are out back, orders come to the counter.', 'Wax on everything. Did I say that already? Wax on everything.', 'Job came in asking who shaped the board on the wall. I said a new hand. He did not believe me.']) }] : JIB_LINES, i: 0, choices: null }; S.talkedJib = true; jib.userData.talking = true; }
    else if (n.id === 'joss') { S.dlg = { who: 'joss', lines: JOSS_LINES, i: 0, choices: null }; }
    else if (n.id === 'bay') { toIntro(); }
    else if (n.id === 'wall') { const W = wallList(); S.toast = W.length ? 'WALL OF FAME · ' + save.stat(SAVE.made, 0) + ' boards made · the last ' + W.length + ' good ones hang here' : 'WALL OF FAME · empty. Boards you build with 2 stars or more get hung here.'; S.toastT = 4; }
    else if (n.id === 'door') { if (opts.onExit) { SND.sfx('bell'); SND.music('off'); SND.stopLoops(); opts.onExit(); } else { S.toast = 'The pier back to Jidda Town Square. (It opens when the shop is placed in the Jidda map.)'; S.toastT = 3.5; } } }
  function shaka() { if (S.phase !== 'walk') return; S.shaka = 1.3; const n = [[jib, 'JIB', 'Shaka, brother!'], [joss, 'JOSS', 'Ha! Shaka.']].find(([f]) => Math.hypot(f.position.x - PW.x, f.position.z - PW.z) < 5); if (n) { n[0].userData.shaka = 1.3; S.toast = n[1] + ': "' + n[2] + '"'; S.toastT = 2.2; } SND.sfx('shaka'); }
  function hop() { if (S.phase !== 'walk') return; benW.userData.hop = 1; SND.sfx('hop'); }
  function dlgView() { const D = S.dlg; if (!D) return null; if (D.choices) return { name: 'JIB', role: 'Surf shop · shaper', text: 'So. Want to shape some boards?', choices: D.choices.map(t => ({ text: t })), step: D.lines.length, total: D.lines.length };
    const L = D.lines[D.i], npc = L.who === 'npc'; return { name: npc ? (D.who === 'jib' ? 'JIB' : 'JOSS') : CAST.player.name || 'BEN', role: npc ? (D.who === 'jib' ? 'Surf shop · shaper' : 'Heat sheet') : 'You', text: L.text, step: D.i + 1, total: D.lines.length, more: D.i + 1 < D.lines.length }; }
  function nextLine() { const D = S.dlg; if (!D || D.choices) return; D.i++; if (D.i >= D.lines.length) { if (D.who === 'jib') D.choices = ['PUT ME TO WORK', 'WATCH THE DEMO', 'JUST LOOKING']; else closeDialog(); } }
  function choose(i) { const D = S.dlg; if (!D || !D.choices) return; closeDialog(); if (i === 0) startDay(); else if (i === 1) demoStart(); }
  function closeDialog() { S.dlg = null; jib.userData.talking = false; }

  // ---------- flow ----------
  function wallList() { const w = save.stat(SAVE.wall, []); return Array.isArray(w) ? w : []; }
  const wallMeshes = []; function rebuildWall() { wallMeshes.forEach(m => m.parent && m.parent.remove(m)); wallMeshes.length = 0; wallList().slice(-6).forEach((b, i) => { const s = Y.wallSlots[i], hd = new THREE.Group(), o = new THREE.Group(), inner = new THREE.Group(); hd.position.set(s.x + 0.25, s.y, s.z); hd.rotation.y = -Math.PI / 4; hd.add(o); o.rotation.x = Math.PI; inner.rotation.z = -Math.PI / 2; o.add(inner); inner.add(decoBoard(THREE, toon, b.t, b.c, b.s >= 3 ? '#f2c94c' : null, addOutline, b.t === 'long' ? 0.5 : 0.66)); scene.add(hd); wallMeshes.push(hd); }); }
  rebuildWall();
  function hideJobCast() { custFox.forEach(f => f.visible = false); if (B) { B.g.parent && B.g.parent.remove(B.g); B = null; } S.path = null; S.job = null; }
  function startDay() { if (!['intro', 'done', 'walk'].includes(S.phase)) return; SND.init(); closeDialog(); Object.assign(S, { boardN: 0, earned: 0, tips: 0, starList: [], done: null, react: null }); setUniform(!!save.flag('surfUniform') || DM.on); benW.visible = false; benJ.visible = true; place(benJ, { x: -1.5, z: -0.6 }, -2.2); place(jib, Y.spots.jib, 0); say('JIB: "Customer! Take the order, then the blank is yours. No clock in here."', 4.5); nextBoard(); }
  function handBack() { if (S.phase !== 'work' || !B) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND OVER AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishJob(); }
  const REACT = { thrilled: { word: 'STOKED!', col: '#22c55e', mood: 'excited', lines: ['Look at those rails!', 'This is the best board on Jidda!', 'I am paddling out right now.'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Nice work, thank you!', 'She will ride.', 'Clean lines. I like it.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['It will float. Probably.', 'Hmm. A few things are off.', 'Thanks, I guess.'] }, grumpy: { word: 'WIPEOUT', col: '#ff9a8a', mood: 'sad', lines: ['Half of it is not done!', 'This is not what I ordered.', 'Jib would never hand this over.'] } };
  function finishJob() { const T = B.job.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const fixed = T.filter(t => info(t).done).length, pay = B.D.price + fixed * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('radio') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.tool = null; B.flipTo = 0; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; cust.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: CU.name, stars, tip, pay, t: 0 };
    S.path = null; place(cust, { x: BAY.x - 0.4, z: BAY.z - 1.15 }, 0); S.phase = 'react'; S.phT = 0; S.hold = null; S.ptr = null; showTool(null);
    if (!DM.on) try { save.setStat(SAVE.made, save.stat(SAVE.made, 0) + 1); if (stars >= 2) { const w = wallList().concat([{ t: B.job.type, c: zoneCol(B, 1), s: stars }]).slice(-6); save.setStat(SAVE.wall, w); rebuildWall(); } } catch (e) {}
    SND.sfx('kaching'); SND.sfx(level === 'grumpy' ? 'grumpy' : 'stoked', 0.35); if (stars === 3) { SND.sfx('stars', 0.7); buzz([30, 40, 30]); confetti(cust.position); cust.userData.hop = 1; for (let i = 0; i < 10; i++) puff(cust.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), cust.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; hideJobCast(); benJ.visible = true; place(benJ, Y.spots.ben, -0.5); place(jib, Y.spots.jib, 0);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('surfUniform')) { save.setFlag('surfUniform'); setUniform(true); unlock.push("SURF SHOP UNIFORM (bucket hat, towel + Jib's tee)"); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, fixed: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    SND.sfx('eod'); say(eod ? 'JIB: "Employee of the day. Job is going to want one of yours."' : avg >= 2 ? 'JIB: "Good boards. See you tomorrow."' : 'JIB: "Slow down. Foam forgives, customers do not."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); SND.sfx('upgrade'); buzz(20); return true; }
  function toIntro() { closeDialog(); hideJobCast(); S.phase = 'intro'; S.done = null; setUniform(true); benW.visible = false; benJ.visible = true; place(benJ, Y.spots.ben, -0.5); place(jib, Y.spots.jib, 0); }
  function toWalk(from) { closeDialog(); hideJobCast(); S.phase = 'walk'; S.done = null; S.goto = null; benJ.visible = false; benW.visible = true; place(jib, Y.spots.jib, 0);
    const s = from === 'door' ? Y.spots.walkIn : { x: benJ.position.x, z: benJ.position.z + 0.6 }; PW.x = s.x; PW.z = s.z; PW.face = from === 'door' ? Math.PI / 2 : 0; benW.position.set(PW.x, 0, PW.z); benW.rotation.y = PW.face; CAMW.yaw = 0; S.camSnap = true;
    if (from === 'door') { S.toast = "JIB'S SURF SHOP · walk with the stick (or tap the floor). Talk to Jib for work."; S.toastT = 4.5; } }

  // ---------- camera ----------
  const { SAFE, shotFor } = cameraFit(ST), CAM = { look: V3(-2, 1.2, -1) };
  camera.position.set(-2, 3, 7); camera.lookAt(CAM.look);
  const head = (f, out, w = 0.75) => { const p = f.position; out.push(V3(p.x - w, 0, p.z), V3(p.x + w, 0, p.z), V3(p.x, 2.4, p.z)); return out; };
  function boardPts() { const o = [], hl = B.cutDone ? B.L / 2 : B.Lb / 2, hw = B.cutDone ? B.W / 2 : B.Wb / 2; for (const sx of [-1, 1]) for (const sz of [-1, 1]) o.push(B.g.localToWorld(V3(sx * hl, B.flip > 0.5 ? B.bot(sx * hl * 0.9) - 0.1 : B.top(sx * hl * 0.9), sz * hw))); return o; }
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; head(benJ, o); head(jib, o); o.push(V3(-5.2, 1.0, -2.4), V3(-2.0, 1.0, -2.4)); return o; }, 0.3, Math.PI - 0.32, port ? 0.1 : 0.06);
    if (S.phase === 'arrive' || S.phase === 'order') return shotFor('order' + k + (S.phase === 'arrive' ? 'a' : 'o'), () => { const o = []; head(jib, o); o.push(V3(-5.2, 1, -2.4), V3(-1.8, 1, -2.4), V3(-1.5, 0, -0.6), V3(-1.5, 2.3, -0.6)); if (S.phase === 'arrive') o.push(V3(-7.2, 0, 2.6), V3(-7.2, 2.3, 2.6)); else o.push(V3(Y.spots.counter.x - 0.4, 0, Y.spots.counter.z), V3(Y.spots.counter.x, 2.6, Y.spots.counter.z)); return o; }, 0.24, Math.PI - 0.12, 0.06);
    if (S.phase === 'leave') return shotFor('leave' + k, () => [V3(-8.6, 0, 3.2), V3(-8.6, 2.4, 3.2), V3(1.8, 0, 1.0), V3(1.8, 2.4, 1.0), V3(-4, 0, 4)], 0.3, Math.PI - 0.15, 0.04);
    if (!B) return shotFor('room' + k, () => [V3(-8, 0, 4), V3(8, 0, 4), V3(0, 3, -6)], 0.35, Math.PI, 0.04);
    if (S.phase === 'react') { const f = cust.position; return shotFor('react' + k + B.job.owner, () => { const o = [V3(f.x - 0.7, 0.6, f.z), V3(f.x + 0.7, 0.6, f.z), V3(f.x, 3.0, f.z)]; o.push(...boardPts()); return o; }, 0.3, Math.PI - 0.15, 0.06); }
    const fl = B.flip > 0.5 ? 'f' : 'u', yaw = port ? Math.PI / 2 : Math.PI, el = port ? 1.12 : 1.22;
    if (!S.tool) return shotFor('board' + k + fl + B.cutDone, boardPts, el * 0.8, yaw, 0.08);
    return shotFor('tool' + k + fl + B.cutDone + B.job.type, boardPts, el, yaw, port ? 0.05 : 0.07); }
  const camBase = () => CW() < CHh() ? 12 : CHh() < 520 ? 10.5 : 8.6;
  function walkCam(dt) { const port = CW() < CHh(), d = camBase() * CAMW.zoom, p = CAMW.pitch + (CHh() < 520 && !port ? 0.08 : 0), tgt = V3(PW.x, CHh() < 520 && !port ? 2.3 : port ? 1.6 : 1.2, PW.z), pos = tgt.clone().add(V3(Math.sin(CAMW.yaw) * Math.cos(p) * d, Math.sin(p) * d, Math.cos(CAMW.yaw) * Math.cos(p) * d));
    pos.x = clamp(pos.x, -9.5, 9.5); pos.z = Math.max(pos.z, -4.5); const k = S.camSnap ? 1 : Math.min(1, dt * 4); S.camSnap = false; camera.position.lerp(pos, k); CAM.look.lerp(tgt, k); camera.lookAt(CAM.look); }

  // ---------- DEMO: autopilot builds one shortboard (every job) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, holdTo: null, i: 0 };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.4); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = (p, j = 0) => { hand.visible = true; hand.position.copy(p).add(V3(j, 0.06, 0)); hand.scale.setScalar(0.5); };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  const at = (x, z) => B.g.localToWorld(V3(x, B.top(x) + 0.02, z));
  function demoAct() { if (!B) return 0.5; const T = nextTask();
    if (!T) { DM.cap = 'EVERY JOB DONE: TAP HAND OVER'; DM.key = 'TAP'; hand.visible = false; showTool(null); if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handBack(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'JOB ' + (B.job.tasks.indexOf(T) + 1) + ' OF ' + B.job.tasks.length + ': TAP ' + TASKS[T].label + ' AT THE BOTTOM'; DM.key = 'TAP'; hand.visible = false; showTool(null); DM.i = 0; return 1.5; }
    if (T === 'cut') { const w = cap('cut', 'TRACE', 'TRACE THE PENCIL LINE WITH YOUR FINGER. THE SAW FOLLOWS YOU'); if (w) return w; const i = B.cut.findIndex(c => !c); if (i < 0) return 0.3; const p = B.line[i], q = B.line[(i + 2) % B.line.length]; cutAt(p[0], -p[1]); cutAt((p[0] + q[0]) / 2, -(p[1] + q[1]) / 2); cutAt(q[0], -q[1]); const ww = at(q[0], -q[1]); handAt(ww); showTool('cut', ww); return 0.06; }
    if (T === 'plane') { const b = B.bumps.find(q => q.h > 0); const w = cap('plane', 'SWIPE', 'SWIPE NOSE TO TAIL OVER THE RED HIGH SPOTS. ACROSS = CHATTER'); if (w) return w; DM.i = (DM.i || 1) * -1; const a = { x: b.x - 0.18 * DM.i, z: b.z }, c = { x: b.x + 0.18 * DM.i, z: b.z }; planeMove(a, c); const ww = at(c.x, c.z); handAt(ww); showTool('plane', ww); return 0.22; }
    if (T === 'sand') { const z = B.rough.findIndex(r => r > 0); const w = cap('sand', 'CIRCLES', 'RUB TO SAND. SMALL CIRCLES SAND 3× FASTER'); if (w) return w; const x = ((z + 0.5) / 4 - 0.5) * B.L; DM.i++; const a = DM.i * 0.9; sandMove(x, 40, true); const ww = at(x + Math.cos(a) * 0.08, Math.sin(a) * 0.08); handAt(ww); showTool('sand', ww); TOOLS.sand.userData.pad.rotation.y += 0.6; return 0.06; }
    if (T === 'art') { if (S.brush !== B.job.paint) { const w = cap('brush', PAINTS[B.job.paint].name, 'THE CARD SAYS ' + PAINTS[B.job.paint].name + ': PICK IT BELOW', 2.2); if (w) return w; hand.visible = false; setBrush(B.job.paint); return 1; }
      const z = B.cover.findIndex((c, i) => c < 1 || B.colZ[i] !== B.job.paint); if (z < 0) return 0.3; const w = cap('art', 'SWIPE', 'SWIPE OVER EACH ZONE TO SPRAY IT'); if (w) return w; DM.i = (DM.i || 1) * -1; const x = ((z + 0.5) / 4 - 0.5) * B.L; sprayAt(x, 50); const ww = at(x, DM.i * 0.12); handAt(ww); showTool('art', ww); return 0.07; }
    if (T === 'glass') { if (B.glassSt === 'pour') { const w = cap('pour', 'HOLD', 'HOLD ON THE BOARD TO POUR RESIN. LET GO IN THE GREEN'); if (w) return w; handAt(at(0, 0)); startPour(); DM.holdTo = 0.57; return 0.1; }
      const z = B.spread.findIndex(s => s < 1); if (z < 0) return 0.3; const w = cap('spread', 'SWIPE', 'NOW SWIPE THE SQUEEGEE TO SPREAD IT'); if (w) return w; DM.i = (DM.i || 1) * -1; const x = ((z + 0.5) / 4 - 0.5) * B.L; spreadAt(x, 50); const ww = at(x, DM.i * 0.15); handAt(ww); showTool('glass', ww); return 0.07; }
    if (T === 'fins') { if (B.flip < 0.95) return 0.2; if (B.finState === 'pick') { const w = cap('fins', FINSET[B.job.fins], 'THE BOARD FLIPS. THE CARD SAYS ' + FINSET[B.job.fins] + ': PICK IT BELOW', 2.2); if (w) return w; hand.visible = false; pickFins(B.job.fins); return 1; }
      const s = B.slots.find(q => !q.on); if (!s) return 0.4; const w = cap('finTap', 'TAP', 'TAP EACH GLOWING FIN BOX TO SET A FIN'); if (w) return w; handAt(wp(s.slot)); setFin(s); return 0.5; }
    if (T === 'wax') { const w = cap('wax', '╳', 'WAX: DIAGONAL SWIPES ONE WAY, THEN THE OTHER. A CROSS-HATCH'); if (w) return w; const k = B.waxN.a < 3 ? 1 : -1, n = B.waxN.a + B.waxN.b, x0 = (-0.3 + (n % 3) * 0.25) * B.L; const a = { x: x0, z: -0.18 * k }, b = { x: x0 + 0.3, z: 0.18 * k }; for (let i = 0; i <= 8; i++) waxPoint(a.x + (b.x - a.x) * i / 8, a.z + (b.z - a.z) * i / 8, i === 0); waxStroke(a, b); const ww = at(b.x, b.z); handAt(ww); showTool('wax', ww); return 0.45; }
    return 0.5; }
  function demoStep(dt) { if (S.hold && DM.holdTo != null) { if (S.hold.v >= DM.holdTo) { DM.holdTo = null; releasePour(); DM.cd = 0.9; } return; }
    hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.8));
    if (S.phase === 'arrive' || S.phase === 'order') { DM.cap = 'A LOCAL ORDERS A BOARD AT THE COUNTER. THE CARD SAYS WHAT TO BUILD'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE CUSTOMER CHECKS YOUR WORK. CLEAN JOBS EARN STARS AND TIPS'; DM.key = '★'; hand.visible = false; showTool(null); return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || !['intro', 'done', 'walk'].includes(S.phase)) return; audio.init && audio.init(); closeDialog(); if (S.phase === 'walk') toIntro(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.holdTo = null; DM.cap = "WATCH A BOARD GET BUILT AT JIB'S"; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 3; S.forceType = 'short'; startDay(); S.forceType = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; hand.visible = false; showTool(null); S.hold = null; S.ptr = null; S.react = null; S.flash = null; S.day = DM.day0; Object.assign(S, { boardN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null }); toIntro(); }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !B) return null; const T = S.tool, H = (p, text, tool = T) => ({ p, text, tool, r: 0.16 });
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : { text: 'ALL DONE · TAP HAND OVER', tool: 'hand' }; }
    if (T === 'cut') { const n = B.line.length; let i = B.cut.findIndex((c, k) => !c && B.cut[(k - 1 + n) % n]); if (i < 0) i = B.cut.findIndex(c => !c); const p = B.line[Math.max(0, i)]; return H(B.g.localToWorld(V3(p[0], B.top(p[0]) + 0.06, -p[1])), 'TRACE THE PENCIL LINE · ' + info('cut').txt); }
    if (T === 'plane') { const b = B.bumps.find(q => q.h > 0); return H(B.g.localToWorld(V3(b.x, B.top(b.x), b.z)), 'SWIPE NOSE ↔ TAIL OVER THE RED SPOTS · ' + info(T).txt); }
    if (T === 'sand') { const z = B.rough.findIndex(r => r > 0), x = ((z + 0.5) / 4 - 0.5) * B.L; return H(B.g.localToWorld(V3(x, B.top(x), 0)), 'RUB IN SMALL CIRCLES · ' + info(T).txt); }
    if (T === 'art') { if (!S.brush) return { text: 'PICK ' + PAINTS[B.job.paint].name + ' BELOW', tool: T }; const z = B.cover.findIndex((c, i) => c < 1 || B.colZ[i] !== B.job.paint); if (z < 0) return null; const x = ((z + 0.5) / 4 - 0.5) * B.L; return H(B.g.localToWorld(V3(x, B.top(x), 0)), B.cover[z] >= 1 ? 'WRONG COLOUR · SPRAY IT ' + PAINTS[B.job.paint].name : 'SWIPE TO SPRAY THIS ZONE'); }
    if (T === 'glass') { if (S.hold) return H(B.g.localToWorld(V3(0, B.top(0), 0)), 'LET GO IN THE GREEN'); if (B.glassSt === 'pour') return H(B.g.localToWorld(V3(0, B.top(0), 0)), 'HOLD ON THE BOARD TO POUR'); const z = B.spread.findIndex(s => s < 1), x = ((Math.max(0, z) + 0.5) / 4 - 0.5) * B.L; return H(B.g.localToWorld(V3(x, B.top(x), 0)), 'SWIPE TO SPREAD THE RESIN · ' + info(T).txt); }
    if (T === 'fins') { if (B.finState === 'pick') return { text: 'PICK ' + FINSET[B.job.fins] + ' BELOW', tool: T }; const s = B.slots.find(q => !q.on); return s ? H(wp(s.slot), 'TAP THE GLOWING FIN BOX · ' + info(T).txt) : null; }
    if (T === 'wax') { const a = B.waxN.a < 3; return H(B.g.localToWorld(V3(0, B.top(0), 0)), (a ? 'SWIPE DIAGONALLY ╲ · ' : 'NOW THE OTHER DIAGONAL ╱ · ') + info(T).txt); }
    return null; }
  let HINT = null, hintT = 0;

  // ---------- per-frame ----------
  function pathStep(dt) { const P = S.path; if (!P) return true; const f = P.f, tg = P.pts[0], dx = tg.x - f.position.x, dz = tg.z - f.position.z, d = Math.hypot(dx, dz);
    if (d < 0.06) { P.pts.shift(); if (!P.pts.length) { S.path = null; kit.animFox(f, dt, 0); return true; } return false; }
    const s = Math.min(d, P.sp * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; let df = Math.atan2(dx, dz) - f.rotation.y; while (df > Math.PI) df -= 2 * Math.PI; while (df < -Math.PI) df += 2 * Math.PI; f.rotation.y += df * Math.min(1, dt * 10); kit.animFox(f, dt, P.sp * 1.4); return false; }
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false, deckT = 0;
  function step(dt) { const t = clock.elapsedTime; S.phT += dt; S.t += dt;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; if (S.toastT > 0) { S.toastT -= dt; if (S.toastT <= 0) S.toast = null; }
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.12 + (1 - p.life) * 0.25); }
    Y.lamps.forEach((l, i) => l.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.03)); polishStep(t, dt); confStep(dt);
    SND.update(dt); SND.music(S.phase === 'done' ? 'party' : ['arrive', 'order', 'work', 'react', 'leave'].includes(S.phase) ? 'work' : 'walk'); if (S.hold) SND.loop('pour', S.hold.v);
    if (S.phase === 'react' && cust && S.react && S.react.stars === 3 && !(cust.userData.hop > 0) && Math.random() < dt * 2.5) cust.userData.hop = 1;
    if (S.phase === 'walk') walkStep(dt);
    else if (S.phase === 'arrive') { if (pathStep(dt)) { S.phase = 'order'; S.phT = 0; cust.rotation.y = 1.95; jib.rotation.y = -1.0; say(CU.name + ': "' + CU.line + '"', 3); jib.userData.lookAt = V3(cust.position.x, 1.6, cust.position.z); } }
    else if (S.phase === 'order') { kit.animFox(cust, dt, 0); const J = S.job; if (S.phT > 2.6 && !S.orderSaid) { S.orderSaid = 1; jib.userData.talking = true; say('JIB: "One ' + BOARDS[J.type].name + ', ' + BOARDS[J.type].len + (J.tasks.includes('fins') ? ', ' + FINSET[J.fins] + ' fins' : '') + (J.tasks.includes('art') ? ', ' + PAINTS[J.paint].name : '') + '. The blank is on the stands."', 3.4); }
      if (S.phT > 4.8) { S.orderSaid = 0; jib.userData.talking = false; jib.userData.lookAt = null; B = makeBoard(J); const p = wp(B.g); for (let i = 0; i < 10; i++) puff(p.x + rr(-1, 1), p.y + rr(0, 0.4), p.z + rr(-0.3, 0.3), 0xffffff, 1); tone(440, 0.1, 0.04); S.phase = 'work'; S.phT = 0; benJ.visible = false; setTool(J.tasks[0]); S.path = { f: cust, pts: [{ x: -6.0, z: -0.8 }, { x: -1.2, z: 1.7 }, { x: 1.0, z: 1.7 }, Y.spots.watch], sp: 2.2 }; jib.rotation.y = 0; } }
    else if (S.phase === 'work') { if (S.path) pathStep(dt); else { kit.animFox(cust, dt, 0); cust.rotation.y = damp(cust.rotation.y, Math.atan2(BAY.x - cust.position.x, BAY.z - cust.position.z), 4, dt); } }
    else if (S.phase === 'react') { kit.animFox(cust, dt, 0); if (S.react) S.react.t += dt; if (S.phT > 2.8) { S.react = null; S.phase = 'leave'; S.phT = 0; cust.add(B.g); B.g.position.set(0.62, 1.35, 0.05); B.g.rotation.set(0, 0, 1.32); B.g.scale.setScalar(B.L > 3 ? 0.82 : 1); S.path = { f: cust, pts: [{ x: 2.3, z: -2.6 }, { x: 1.6, z: 0.8 }, { x: 1.0, z: 1.7 }, { x: -1.2, z: 1.7 }, Y.spots.walkIn, Y.spots.outside], sp: 2.4 }; } }
    else if (S.phase === 'leave') { if (pathStep(dt)) { if (DM.on) { demoStop(); return; } S.boardN++; if (S.boardN >= SURFSHOP.perDay) endDay(); else nextBoard(); } }
    if (B && B.g.parent === scene) { B.flip = damp(B.flip, B.flipTo, 7, dt); if (Math.abs(B.flip - B.flipTo) < 0.002) B.flip = B.flipTo; B.g.rotation.x = Math.PI * B.flip; B.g.position.y = STAND + 0.02 + Math.sin(B.flip * Math.PI) * 0.35 + B.flip * (B.T + 0.04);
      for (const s of B.slots) { if (s.pop > 0 && s.pop < 1) { s.pop = Math.min(1, s.pop + dt * 4); s.f.scale.setScalar(1.3 * (1 + Math.sin(s.pop * Math.PI) * 0.5)); } if (!s.on) s.slot.material.color.setHSL(0.13, 1, 0.55 + Math.sin(t * 6) * 0.15); }
      if (B.offcuts) { for (const o of B.offcuts) { o.t += dt; o.v.y -= dt * 6; o.m.position.addScaledVector(o.v, dt); o.m.rotation.x += dt * 3 * Math.sign(o.v.z); if (o.m.position.y < 0.05) { o.m.position.y = 0.05; o.v.set(0, 0, 0); } } if (B.offcuts[0].t > 2.2) { B.offcuts.forEach(o => scene.remove(o.m)); B.offcuts = null; } } }
    deckT -= dt; if (B && deckT <= 0) { deckT = 0.05; if (B.dirty) drawDeck(B); if (B.bdirty) drawBlank(B); }
    if (S.hold) { S.hold.v = DM.on ? Math.min(1.1, S.hold.v + dt * 0.42) : Math.min(1.1, (performance.now() - S.hold.t0) / 1000 * 0.42); if (B) B.puddle.scale.setScalar(0.3 + S.hold.v * 1.3); if (S.hold.v >= 1.1) releasePour(); }
    if (!DM.on && S.phase === 'work' && S.tool && info(S.tool).done && !S.ptr && performance.now() - (S.userToolT || 0) > 3000 && performance.now() - (S.lastInput || 0) > 1200) { const nx = nextTask(); if (nx) setTool(nx); }
    Y.front.forEach(m => m.visible = S.phase === 'walk'); if (Y.workLamp) Y.workLamp.forEach(m => m.visible = S.phase !== 'work');
    if (S.phase === 'walk') walkCam(dt); else { const sh = shot(), k = Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2)); camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); camera.lookAt(CAM.look); }
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); RINGS.place(HINT && HINT.p ? HINT : null, hintT, dt); if (HINT && HINT.p) { RINGS.arrow.visible = false; }
    if (S.tapMark) { S.tapMark.t -= dt; RINGS.pulse.visible = S.tapMark.t > 0 || RINGS.pulse.visible; if (S.tapMark.t > 0 && !(HINT && HINT.p)) { RINGS.pulse.position.set(S.tapMark.p.x, 0.02, S.tapMark.p.z); RINGS.pulse.scale.setScalar(0.4 + (0.6 - S.tapMark.t)); RINGS.pulse.material.opacity = S.tapMark.t; } if (S.tapMark.t <= 0) S.tapMark = null; }
    // idles + emotes
    const greet = S.phase === 'intro' || S.phase === 'done'; if (benJ.visible) { kit.animFox(benJ, dt, 0); benJ.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); }
    kit.animFox(jib, dt, 0); kit.animFox(joss, dt, 0); { const ju = jib.userData, wipe = !ju.talking && !(ju.shaka > 0) && S.phase !== 'order' && (t % 9) < 2.2; if (wipe) { ju.P.arms[1].rotation.set(-1.05, 0, 0.35 + Math.sin(t * 9) * 0.35); } } if (S.phase !== 'walk' && joss.userData.lookAt) joss.userData.lookAt = null;
    for (const f of [jib, joss, benW]) { const u = f.userData, sk = f === benW ? S.shaka : u.shaka; if (sk > 0) { const P = u.P; P.arms[0].rotation.set(-0.2, 0, -2.4 + Math.sin(t * 16) * 0.25); if (f === benW) S.shaka -= dt; else u.shaka -= dt; } } }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() { const J = S.job, D = J && BOARDS[J.type];
    return { phase: S.phase, day: S.day, boardN: S.boardN, perDay: SURFSHOP.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { owner: CU.name, role: CU.role, board: D.name, len: D.len, type: J.type, fins: J.fins, finName: FINSET[J.fins], paint: J.paint, paintName: PAINTS[J.paint].name, paintCol: PAINTS[J.paint].col, hasFins: J.tasks.includes('fins'), hasArt: J.tasks.includes('art'),
        tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: !!B && I.done, txt: B ? I.txt : '', locked: !!B && !!blocked(id) }; }) } : null,
      tool: S.tool, brush: S.brush, swatch: !!(B && S.phase === 'work' && S.tool === 'art'), finPick: !!(B && S.phase === 'work' && S.tool === 'fins' && B.finState === 'pick' && B.flip > 0.6), allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      press: S.hold ? (() => { const Z = pourZone(), v = S.hold.v; return { v: v / 1.1, zone: v < Z[0] ? 'TOO THIN' : v <= Z[1] ? 'JUST RIGHT' : v < 1 ? 'A BIT MUCH' : 'OVERFLOW', g0: Z[0] / 1.1, g1: Z[1] / 1.1 }; })() : null,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('surfUniform'), made: save.stat(SAVE.made, 0), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      muted: SND.muted, walk: S.phase === 'walk', prompt: S.phase === 'walk' && !S.dlg && S.near ? S.near.label : null, dialog: S.phase === 'walk' ? dlgView() : null, toast: S.phase === 'walk' ? S.toast : null,
      quest: S.phase === 'walk' ? (S.talkedJib ? "JIB'S SURF SHOP · SHAPING BAY OR JIB = START A SHIFT" : "JIB'S SURF SHOP · TALK TO JIB ABOUT WORK") : 'SURF SHOP · DAY ' + S.day + ' · BOARD ' + Math.min(S.boardN + 1, SURFSHOP.perDay) + ' / ' + SURFSHOP.perDay }; }
  frame(); if (opts.startMode === 'walk') toWalk('door');
  return {
    // job API (page buttons)
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } }, setTool, setBrush, pickFins, handBack, startDay, demoStart, demoStop, buyUpgrade, hud, toIntro, toWalk,
    // Game HUD ENGINE CONTRACT (walk mode)
    start() {}, talk: use, choose, closeDialog, nextLine, clearToast() { S.toast = null; }, melee: use, range: shaka, jump: hop, meleeUp() {}, useItem() { S.toast = 'Save your items for outside. No snacks near the resin.'; S.toastT = 2.5; }, closeWheel() {}, skipTime() {},
    setPaused(v) { PAUSE = !!v; }, setHudPad() {}, setStick(x, y) { stick.x = x; stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; },
    lookBy(dx) { CAMW.yaw = clamp(CAMW.yaw - dx * 0.005, -0.9, 0.9); }, zoomBy(k) { CAMW.zoom = clamp(CAMW.zoom * (k || 1), 0.55, 1.6); }, getCam() { return { dist: camBase() * CAMW.zoom, pitch: CAMW.pitch }; }, setCam(d, p) { if (d != null && isFinite(d)) CAMW.zoom = clamp(d / camBase(), 0.55, 1.6); if (p != null && isFinite(p)) CAMW.pitch = clamp(p, 0.45, 1.1); },
    mapData() { return { p: [PW.x, PW.z, PW.face], b: [['COUNTER', -3.6, -2.4], ['SHAPING BAY', BAY.x, BAY.z], ['WALL OF FAME', -8.6, -2.6], ['DOOR', -9, 2.5], ['SPRAY BOOTH', 8.0, 3.0]], f: [[jib.position.x, jib.position.z], [joss.position.x, joss.position.z]], e: [], q: S.talkedJib ? [BAY.x, BAY.z, 'SHAPING BAY'] : [jib.position.x, jib.position.z, 'JIB'] }; },
    setMinimap() {}, toggleSound() { SND.init(); const m = SND.setMuted(!SND.muted); audio.setMuted && audio.setMuted(m); return m; }, cycleWeather() {}, isMuted: () => SND.muted,
    // test hooks
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _force(t) { S.forceType = t; }, _state: () => S, _board: () => B, _scr: scr, _wp: wp, _pw: PW, _info: info, _safe: () => ({ ...SAFE }), _size: () => { const b = new THREE.Box3().setFromObject(benW); return b.max.toArray().concat(b.min.toArray()).map(v => +v.toFixed(2)); }, _cam: () => [camera.position.toArray().map(v => +v.toFixed(2)), CAM.look.toArray().map(v => +v.toFixed(2)), camera.fov, camera.aspect],
    _auto() { return { cutAll() { B.cut.fill(1); cutAt(B.line[0][0], -B.line[0][1]); }, planeAll() { B.bumps.forEach(b => { b.h = 0; b.m.visible = false; }); B.dirty = true; checkDone(); }, sandAll() { B.rough = [0, 0, 0, 0]; B.dirty = true; checkDone(); }, artAll() { S.brush = B.job.paint; for (let z = 0; z < 4; z++) { B.colZ[z] = S.brush; B.cover[z] = 1; } B.dirty = true; checkDone(); }, glassAll() { B.glassSt = 'spread'; B.pourQ = 1; B.spread = [1, 1, 1, 1]; B.dirty = true; checkDone(); }, finsAll() { if (B.finState === 'pick') pickFins(B.job.fins); B.slots.forEach(setFin); }, waxAll() { B.waxN = { a: 3, b: 3 }; checkDone(); } }; },
    destroy() { SND.destroy(); document.removeEventListener('visibilitychange', onVis); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
