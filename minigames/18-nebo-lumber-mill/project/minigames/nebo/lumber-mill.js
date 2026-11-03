// 8 GATES — NEBO · CEDAR'S LUMBER MILL [neboLumberMill]. A JOB LOCATION (Jon's Boatworks is the reference): one order at a time, no clock, scored on quality.
// A Nebo neighbour walks in with an order, a log rolls in from the forest, and Ben takes it down the line:
//   DEBARK (swipe along the rolling log to peel the bark) · CUT (drag the log until its end meets the yellow flag on the tape, let go = the cut-off saw drops)
//   SAW (band saw: HOLD to feed, slide left/right to keep the blade on the pencil line) · TURN (lathe: tap a yellow ring, hold to cut the groove, let go in the green)
//   PLANE (rub ALONG the grain over the rough spots; across the grain tears it) · STAIN (pick the stain on the order, swipe each section; Cedar's N brand burns on)
// Then HAND OVER: the neighbour reacts, pays + tips, and carries it out the door. 3 orders = a day → day card, upgrades, uniform.
// WALK MODE: when you're not working, Ben walks around the mill with the standard Game HUD (joystick, 1 CHOP, 2 WHISTLE, 3 HOP). Talk to CEDAR to start a shift.
// MERGE: buildMill(ctx) builds the interior at an origin inside ANY building (20 x 13 m, front door on +z), returns walls, colliders and spots;
//        createLumberMill({ container, onState }) runs it stand-alone. Save keys nebo.mill.*, flag millUniform. Built on engine/restaurant-kit.js.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { createMillAudio } from './mill-audio.js';

export const MILL = { name: "CEDAR'S LUMBER MILL", room: 'neboLumberMill', world: 'Nebo', perDay: 3, size: { w: 20, d: 13 }, door: { x: 0, z: 6.5 } };
export const WOODS = {
  pine: { name: 'PINE', bark: '#7a4a2e', barkD: '#4a2b18', wood: '#ecc58c', ring: '#c4914e' },
  spruce: { name: 'SPRUCE', bark: '#6e5c49', barkD: '#40352a', wood: '#f2dcaa', ring: '#cbae76' },
  oak: { name: 'OAK', bark: '#5f574d', barkD: '#34302a', wood: '#c99a5e', ring: '#94683a' },
  birch: { name: 'BIRCH', bark: '#efebe2', barkD: '#26221e', wood: '#f2dfb4', ring: '#d4ba88', birch: true } };
export const STAINS = { honey: { name: 'HONEY', col: '#d99a3a' }, walnut: { name: 'WALNUT', col: '#6b3f22' }, cherry: { name: 'CHERRY', col: '#a8442e' }, forest: { name: 'FOREST', col: '#2f6b45' } };
const SK = Object.keys(STAINS);
// Cedar's walk-mode talk (export it so a world can reuse the same NPC lines)
export const CEDAR_TALK = { hello: { text: 'Ben! Here to work, or just here to sniff the sawdust?', choices: [['Put me to work!', 'work'], ['How does the mill run?', 'how'], ['Who orders all this wood?', 'orders'], ['Just looking around.', 'bye']] },
    how: ['The river turns the big wheel out back. The wheel turns the shaft up there, and the shaft turns every saw in here. No smoke, no fuss.', 'Logs roll in the side door. Bark off, cut to length, square it on the band saw, turn it, plane it, stain it.', 'Mind your paws near the blades. I have all ten fingers and I mean to keep every one.'],
    orders: ['Fence posts for Fern. Planks for Hazel\'s garden beds. A staff for Brindle\'s drills, handles for Hob, a sign board for Barley.', 'Bryn wants glider struts as straight as a sunbeam. Every order is somebody\'s fence or bench or staff. Do it right and Nebo stands up straight.'] };
export const TASKS = { debark: { label: 'DEBARK', name: 'Peel the bark off' }, buck: { label: 'CUT', name: 'Cut it to length' }, rip: { label: 'SAW', name: 'Saw it square on the band saw' }, turn: { label: 'TURN', name: 'Turn the grooves on the lathe' }, plane: { label: 'PLANE', name: 'Plane it smooth' }, stain: { label: 'STAIN', name: "Stain it + Cedar's brand" } };
const ORDER = ['debark', 'buck', 'rip', 'turn', 'plane', 'stain'];
// who orders what (Nebo neighbours from the 2D world file)
export const ITEMS = {
  posts: { name: 'FENCE POST', who: 'FERN', role: 'Road Ranger', wood: 'pine', r: 0.2, len: [1.6, 2.0], after: 'post', tasks: ['debark', 'buck', 'rip', 'stain'], price: 14, line: 'Four lanterns on the Forest Path lean like drunks. I need a good straight post.', torso: ['#3f6b3a', '#e6b45a', '#2a4a27'], outfit: 'coat', fur: '#c9682a', furDark: '#8a4213' },
  planks: { name: 'GARDEN PLANKS', who: 'HAZEL', role: 'Garden Keeper', wood: 'spruce', r: 0.24, len: [1.8, 2.2], after: 'boards', tasks: ['debark', 'buck', 'rip', 'plane'], price: 16, line: 'The raised beds are rotting through. Smooth planks, please. No splinters for the carrots.', torso: ['#8a6a3a', '#f2d970', '#5a4424'], outfit: 'vest', fur: '#d9945a', furDark: '#9a5a2a' },
  staff: { name: 'LONGSTAFF', who: 'BRINDLE', role: 'Armorer', wood: 'oak', r: 0.17, len: [1.9, 2.2], after: 'post', rT: 0.08, grooves: 3, tasks: ['debark', 'buck', 'rip', 'turn', 'plane', 'stain'], price: 24, line: 'The Lodge drill wears out a staff a week. Make me one that lasts.', torso: ['#5a4632', '#c9a24a', '#3a2c1e'], outfit: 'coat', fur: '#9a6f4a', furDark: '#6b4a2c' },
  legs: { name: 'BENCH LEG', who: 'JUNIPER', role: 'Barkeep', wood: 'oak', r: 0.15, len: [0.9, 1.2], rT: 0.11, grooves: 3, tasks: ['buck', 'turn', 'stain'], price: 12, line: 'The tavern bench lost a leg in a shuffleboard argument. Nobody won.', torso: ['#2f6b45', '#f4f1e8', '#1f4a2f'], outfit: 'vest', fur: '#f0dcbe', furDark: '#c2a577' },
  strut: { name: 'GLIDER STRUT', who: 'BRYN', role: 'Glider Crew', wood: 'spruce', r: 0.18, len: [1.7, 1.7], after: 'board', tasks: ['debark', 'rip', 'plane'], price: 15, line: 'Light and dead straight, or the glider pulls left all the way down.', torso: ['#e6b45a', '#1f3a5f', '#a8792e'], outfit: 'vest', fur: '#e8803a', furDark: '#a8501a', glasses: 'sun' },
  handle: { name: 'TOOL HANDLE', who: 'HOB', role: 'Tool Shed', wood: 'birch', r: 0.12, len: [1.0, 1.3], rT: 0.065, grooves: 2, tasks: ['debark', 'buck', 'turn', 'plane'], price: 13, line: 'Every edge in my shed is sharp. Now every edge needs a handle.', torso: ['#3a3836', '#d7dde3', '#201e1d'], outfit: 'coat', fur: '#9a9a9e', furDark: '#6a6a70' },
  sign: { name: 'SIGN BOARD', who: 'BARLEY', role: 'Taverner', wood: 'pine', r: 0.25, len: [1.4, 1.7], after: 'board', tasks: ['buck', 'rip', 'plane', 'stain'], price: 18, line: 'A new board for the tavern sign. The old one says TAV, the rest blew away.', torso: ['#a8442e', '#f2d970', '#6b2a1c'], outfit: 'vest', fur: '#d9733a', furDark: '#9a4a22' } };
const IK = Object.keys(ITEMS);
export const UPGRADES = [
  { id: 'knife', name: 'SHARP DRAWKNIFE', cost: 30, line: 'Every swipe peels two strips of bark.' },
  { id: 'laser', name: 'LASER CUT LINE', cost: 45, line: 'A red line shows the cut. Twice the room for a perfect cut.' },
  { id: 'fence', name: 'RIP FENCE', cost: 40, line: 'The band saw pulls gently toward the line.' },
  { id: 'gouge', name: 'BIG GOUGE', cost: 35, line: 'The green zone on the lathe is wider.' },
  { id: 'kettle', name: 'HONEY TEA KETTLE', cost: 60, line: 'Customers tip 25% more. Nebo runs on honey tea.' }];
const SAVE = { day: 'nebo.mill.day', best: 'nebo.mill.best', upg: 'nebo.mill.upg.', stars: 'nebo.mill.stars' };
const TURN = [0.45, 0.75];
// stations (local mill coords; the machine line runs along x at Z0, the camera's side is +z)
const Z0 = -3.2, X_DECK = 9.25, X_DEB = 6.9, X_CUT = 3.4, X_BS = -1.6, X_LATHE = -6.5, PLANE = { x: -6.2, z: 1.3 }, FINISH = { x: -2.4, z: 1.6 }, COUNTER = { x: 4.6, z: 2.6 };
const H_DEB = 0.95, H_CUT = 0.95, H_BS = 0.92, H_LATHE = 1.22, H_PLANE = 0.92, H_FIN = 0.86, H_CTR = 1.08;
const BOX = { x0: -9.6, x1: 9.6, z0: -6.1, z1: 6.1 };

// ---------------- textures ----------------
function texKit(CTX) {
  const plank = (base, line, n = 8, w = 256) => CTX(w, 256, c => { c.fillStyle = base; c.fillRect(0, 0, w, 256); const pw = w / n; for (let i = 0; i < n; i++) { c.fillStyle = i % 3 ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'; c.fillRect(i * pw, 0, pw - 3, 256); c.fillStyle = line; c.fillRect(i * pw + pw - 3, 0, 3, 256); for (let k = 0; k < 3; k++) { c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(i * pw + 4 + ((i * 37 + k * 53) % (pw - 10)), (i * 71 + k * 97) % 256, 4, 4); } } });
  const grainV = CTX(128, 256, c => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 256); for (let i = 0; i < 22; i++) { c.strokeStyle = i % 3 ? 'rgba(120,80,40,0.16)' : 'rgba(120,80,40,0.3)'; c.lineWidth = 1 + (i % 2); const x = (i * 23) % 128; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= 256; y += 32) c.lineTo(x + Math.sin(y * 0.03 + i) * 3, y); c.stroke(); } c.fillStyle = 'rgba(110,70,30,0.35)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse((i * 47 + 20) % 128, (i * 83 + 40) % 256, 4, 7, 0, 0, 7); c.fill(); } });
  const grainH = CTX(256, 128, c => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 128); for (let i = 0; i < 18; i++) { c.strokeStyle = i % 3 ? 'rgba(120,80,40,0.15)' : 'rgba(120,80,40,0.3)'; c.lineWidth = 1 + (i % 2); const y = (i * 29) % 128; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= 256; x += 32) c.lineTo(x, y + Math.sin(x * 0.03 + i) * 3); c.stroke(); } c.fillStyle = 'rgba(110,70,30,0.35)'; for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse((i * 83 + 40) % 256, (i * 47 + 20) % 128, 7, 4, 0, 0, 7); c.fill(); } });
  const rings = W => CTX(128, 128, c => { c.fillStyle = W.wood; c.fillRect(0, 0, 128, 128); c.strokeStyle = W.ring; for (let r = 6; r < 62; r += 7) { c.lineWidth = r % 14 ? 1.5 : 2.5; c.beginPath(); c.arc(64 + Math.sin(r) * 1.5, 64, r, 0, 7); c.stroke(); } c.fillStyle = W.ring; c.beginPath(); c.arc(64, 64, 4, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,50,20,0.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(64, 64); c.lineTo(110, 30); c.stroke(); });
  const bark = W => CTX(128, 128, c => { c.fillStyle = W.bark; c.fillRect(0, 0, 128, 128);
    if (W.birch) { c.fillStyle = W.barkD; for (let i = 0; i < 16; i++) c.fillRect((i * 41) % 118, (i * 53) % 124, 10 + (i % 3) * 6, 3); c.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = 0; i < 8; i++) c.fillRect(0, (i * 17) % 128, 128, 2); }
    else { c.strokeStyle = W.barkD; for (let i = 0; i < 10; i++) { c.lineWidth = 3 + (i % 3) * 2; const x = (i * 13) % 128; c.beginPath(); c.moveTo(x, 0); for (let y = 0; y <= 128; y += 16) c.lineTo(x + Math.sin(y * 0.15 + i * 2) * 4, y); c.stroke(); } c.fillStyle = 'rgba(255,255,255,0.08)'; for (let i = 0; i < 10; i++) c.fillRect((i * 29) % 128 + 4, 0, 3, 128); } });
  const rough = CTX(64, 64, c => { c.clearRect(0, 0, 64, 64); const g = c.createRadialGradient(32, 32, 4, 32, 32, 31); g.addColorStop(0, 'rgba(90,60,30,0.75)'); g.addColorStop(0.7, 'rgba(90,60,30,0.55)'); g.addColorStop(1, 'rgba(90,60,30,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); c.strokeStyle = 'rgba(60,36,14,0.9)'; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const x = 12 + (i * 17) % 40, y = 12 + (i * 29) % 40; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + (i % 2 ? 3 : -3)); c.stroke(); } });
  const brand = CTX(128, 128, c => { c.clearRect(0, 0, 128, 128); c.strokeStyle = 'rgba(40,20,8,0.92)'; c.lineWidth = 9; c.lineJoin = 'round'; c.beginPath(); c.arc(64, 64, 50, 0, 7); c.stroke(); c.lineWidth = 12; c.beginPath(); c.moveTo(40, 92); c.lineTo(40, 36); c.lineTo(88, 92); c.lineTo(88, 36); c.stroke(); });
  return { plank, grainV, grainH, rings, bark, rough, brand };
}


// ---------- phone budget: bake every static mesh of a container into one mesh per material (≈1800 draw calls → ≈120) ----------
export function mergeStatic(T3, container, dyn = new Set()) {
  container.updateMatrixWorld(true); const inv = new T3.Matrix4().copy(container.matrixWorld).invert(), buckets = new Map(), kill = [];
  container.traverse(o => { if (!o.isMesh || o.isInstancedMesh || o === container || Array.isArray(o.material)) return;
    for (let p = o; p && p !== container; p = p.parent) { if (dyn.has(p)) return; if (p !== o && p.userData && p.userData.mergeRoot) return; }
    const g = o.geometry, A = g.attributes; if (!A.position || !A.normal || !A.uv) return;
    const geo = g.index ? g.toNonIndexed() : g.clone(); for (const k of Object.keys(geo.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') geo.deleteAttribute(k);
    geo.applyMatrix4(new T3.Matrix4().multiplyMatrices(inv, o.matrixWorld)); if (!buckets.has(o.material)) buckets.set(o.material, []); buckets.get(o.material).push(geo); kill.push(o); });
  kill.forEach(o => o.parent && o.parent.remove(o));
  for (const [mat, geos] of buckets) { let n = 0; geos.forEach(g => n += g.attributes.position.count); const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2); let k = 0;
    for (const g of geos) { pos.set(g.attributes.position.array, k * 3); nor.set(g.attributes.normal.array, k * 3); uv.set(g.attributes.uv.array, k * 2); k += g.attributes.position.count; g.dispose(); }
    const bg = new T3.BufferGeometry(); bg.setAttribute('position', new T3.BufferAttribute(pos, 3)); bg.setAttribute('normal', new T3.BufferAttribute(nor, 3)); bg.setAttribute('uv', new T3.BufferAttribute(uv, 2)); bg.computeBoundingSphere();
    const m = new T3.Mesh(bg, mat); m.castShadow = m.receiveShadow = !(mat.isMeshBasicMaterial && mat.side === T3.BackSide); m.userData.merged = true; container.add(m); }
  return kill.length; }

// ---------------- the mill (any building) ----------------
export function buildMill(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const TX = texKit(CTX), Y = { root, walls: {}, colliders: [], anim: {}, front: [], TX }, ink = toon('#201e1d'), green = toon('#2f6b45'), greenD = toon('#1f4a2f'), gold = toon('#e6b45a'), iron = toon('#4a4e54'), steel = toon('#c9d1d8'), red = toon('#c42d3c'), wood = toon('#a87a4a'), woodD = toon('#6b4a2c'), woodL = toon('#d2a86a'), cream = toon('#f4ecd8');
  const tm = (t, rep) => { const m = new T3.MeshToonMaterial({ map: t, gradientMap: ctx.grad }); if (rep) { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return m; };
  const flat = (m) => { m.castShadow = false; return m; };
  const col = (x0, z0, x1, z1) => Y.colliders.push([Math.min(x0, x1), Math.min(z0, z1), Math.max(x0, x1), Math.max(z0, z1)]);
  // outside: forest floor + a ring of pines (seen through the doors and when walls cut away)
  { const gT = CTX(256, 256, c => { c.fillStyle = '#4f7a3a'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 260; i++) { c.fillStyle = i % 3 ? '#5f8a46' : '#3f6a30'; c.fillRect((i * 53) % 256, (i * 97) % 256, 4, 3); } }); const g = new T3.Mesh(new T3.PlaneGeometry(90, 90), tm(gT, [18, 18])); g.rotation.x = -Math.PI / 2; g.position.y = -0.02; g.receiveShadow = true; root.add(g);
    const pineM = toon('#2f5a34'), pineL = toon('#3f7a42'), trunk = toon('#6b4a2c');
    for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2 + 0.2, rad = 16 + (i * 7) % 9, x = Math.cos(a) * rad * 1.25, z = Math.sin(a) * rad; if (z > 4 && Math.abs(x) < 17) continue; const s = 0.8 + (i % 4) * 0.25, t = new T3.Group(); t.position.set(x, 0, z); t.scale.setScalar(s); root.add(t); M(new T3.CylinderGeometry(0.25, 0.35, 2, 7), trunk, 0, 1, 0, t, 0); for (let k = 0; k < 3; k++) M(new T3.ConeGeometry(2.0 - k * 0.5, 2.4, 8), k % 2 ? pineL : pineM, 0, 2.6 + k * 1.3, 0, t, 0.03); } }
  // floor (planks + sawdust)
  { const fT = TX.plank('#b08a5a', '#7a5a38', 8); const f = new T3.Mesh(new T3.PlaneGeometry(20, 13), tm(fT, [5, 3])); f.rotation.x = -Math.PI / 2; f.position.y = 0.005; f.receiveShadow = true; root.add(f);
    const dust = new T3.MeshBasicMaterial({ color: 0xf2dcaa, transparent: true, opacity: 0.85 }); for (const [x, z, s] of [[X_BS, Z0 + 0.9, 1.2], [X_LATHE, Z0 + 0.9, 1.0], [X_CUT + 0.2, Z0 + 0.8, 0.9], [PLANE.x, PLANE.z + 0.9, 0.9], [X_DEB, Z0 + 0.9, 0.8]]) { const d = new T3.Mesh(new T3.CircleGeometry(s, 14), dust); d.rotation.x = -Math.PI / 2; d.position.set(x, 0.012, z); d.scale.set(1, 0.55, 1); root.add(d); const pile = M(new T3.SphereGeometry(s * 0.35, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#efd5a0'), x + s * 0.4, 0, z - 0.1, root, 0); pile.scale.y = 0.45; } }
  // walls: plank boards with a dark green skirting, each in its own group so the camera side can be cut away
  const wallT = TX.plank('#9a6e44', '#5a3c22', 10, 256), wallM = tm(wallT, [6, 1.5]), skirt = green, WH = 5.4;
  const wall = (key, parts) => { const g = new T3.Group(); root.add(g); Y.walls[key] = g; for (const [x, y, z, w, h, d] of parts) { const m = M(new T3.BoxGeometry(w, h, d), wallM, x, y, z, g, 0.02); flat(m); } return g; };
  wall('back', [[0, WH / 2, -6.6, 20.4, WH, 0.25]]); wall('east', [[10.1, WH / 2, 2.2, 0.25, WH, 8.8], [10.1, WH / 2, -6.0, 0.25, WH, 1.4], [10.1, 4.05, -3.2, 0.25, 2.7, 3.2]]); wall('west', [[-10.1, WH / 2, 0, 0.25, WH, 13.4]]);
  wall('front', [[-5.9, WH / 2, 6.6, 8.2, WH, 0.25], [5.9, WH / 2, 6.6, 8.2, WH, 0.25], [0, 4.4, 6.6, 3.6, 2.0, 0.25]]);
  for (const [k, x, z, w, d] of [['back', 0, -6.45, 20, 0.06], ['east', 9.95, 0, 0.06, 13], ['west', -9.95, 0, 0.06, 13], ['front', -5.9, 6.45, 8.2, 0.06], ['front', 5.9, 6.45, 8.2, 0.06]]) M(new T3.BoxGeometry(w, 0.5, d), skirt, x, 0.25, z, Y.walls[k], 0);
  col(-10.3, -6.8, 10.3, -6.45); col(9.95, -6.8, 10.3, -4.8); col(9.95, -1.6, 10.3, 6.8); col(-10.3, -6.8, -9.95, 6.8); col(-10.3, 6.45, -1.8, 6.8); col(1.8, 6.45, 10.3, 6.8);
  // door frames (front: forest path door · east: the log door)
  { const fr = toon('#5a3c22'); for (const x of [-1.8, 1.8]) M(new T3.BoxGeometry(0.22, 3.4, 0.4), fr, x, 1.7, 6.6, Y.walls.front, 0.01); M(new T3.BoxGeometry(3.8, 0.24, 0.4), fr, 0, 3.4, 6.6, Y.walls.front, 0.01);
    for (const z of [-4.8, -1.6]) M(new T3.BoxGeometry(0.4, 2.7, 0.22), fr, 10.1, 1.35, z, Y.walls.east, 0.01); M(new T3.BoxGeometry(0.4, 0.24, 3.4), fr, 10.1, 2.7, -3.2, Y.walls.east, 0.01);
    const bd = toon('#7a3a26'); for (const s of [-1, 1]) { const d = M(new T3.BoxGeometry(0.1, 2.5, 1.5), bd, 10.25 + 0.6, 1.25, -3.2 + s * 2.4, Y.walls.east, 0.01); for (const yy of [0.5, 2.0]) M(new T3.BoxGeometry(0.12, 0.12, 1.5), ink, 10.32 + 0.6, yy, -3.2 + s * 2.4, Y.walls.east, 0); } }
  // painted windows on the back wall (the river + the water wheel that drives the mill)
  const winT = CTX(256, 192, c => { const g = c.createLinearGradient(0, 0, 0, 192); g.addColorStop(0, '#9fd2e6'); g.addColorStop(1, '#e8f4e0'); c.fillStyle = g; c.fillRect(0, 0, 256, 192); c.fillStyle = '#3f6a30'; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(i * 32 - 10, 150); c.lineTo(i * 32 + 6, 40 + (i % 3) * 20); c.lineTo(i * 32 + 22, 150); c.fill(); } c.fillStyle = '#4fa0c4'; c.fillRect(0, 150, 256, 42); c.strokeStyle = '#bfe6f5'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(i * 44, 168); c.lineTo(i * 44 + 20, 166); c.stroke(); } c.fillStyle = '#5a3c22'; c.fillRect(0, 0, 256, 10); c.fillRect(0, 182, 256, 10); c.fillRect(0, 0, 10, 192); c.fillRect(246, 0, 10, 192); c.fillRect(123, 0, 10, 192); c.fillRect(0, 91, 256, 10); });
  for (const x of [-7.4, -3.8, 4.2, 7.6]) { const w = new T3.Mesh(new T3.PlaneGeometry(2.2, 1.65), new T3.MeshBasicMaterial({ map: winT })); w.position.set(x, 2.9, -6.46); Y.walls.back.add(w); M(new T3.BoxGeometry(2.4, 0.12, 0.3), woodD, x, 2.0, -6.36, Y.walls.back, 0.01); }
  // the big wooden cog (water wheel drive) on the back wall + the line shaft and belts overhead
  { const cog = new T3.Group(); cog.position.set(0.4, 2.9, -6.2); Y.walls.back.add(cog); M(new T3.CylinderGeometry(1.25, 1.25, 0.24, 24), woodD, 0, 0, 0, cog, 0.02).rotation.x = Math.PI / 2; M(new T3.CylinderGeometry(0.28, 0.28, 0.4, 12), iron, 0, 0, 0.05, cog, 0.01).rotation.x = Math.PI / 2; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, t = M(new T3.BoxGeometry(0.18, 0.26, 0.22), woodL, Math.cos(a) * 1.32, Math.sin(a) * 1.32, 0, cog, 0.008); t.rotation.z = a; } for (let i = 0; i < 4; i++) { const s = M(new T3.BoxGeometry(2.3, 0.16, 0.1), wood, 0, 0, 0.12, cog, 0.008); s.rotation.z = i * Math.PI / 4; } Y.anim.cog = cog; }
  { const shaft = M(new T3.CylinderGeometry(0.07, 0.07, 17.5, 10), steel, 0.4, 4.55, Z0, root, 0.008); shaft.rotation.z = Math.PI / 2; Y.anim.shaft = shaft; for (const x of [-7.5, -3, 1.5, 6]) { M(new T3.BoxGeometry(0.16, 0.5, 0.16), iron, x, 4.85, Z0, root, 0.008); }
    const beltT = CTX(16, 128, c => { c.fillStyle = '#5a3420'; c.fillRect(0, 0, 16, 128); c.fillStyle = '#7a4a2e'; for (let y = 0; y < 128; y += 16) c.fillRect(0, y, 16, 6); }); beltT.wrapS = beltT.wrapT = T3.RepeatWrapping; beltT.repeat.set(1, 4); Y.anim.beltT = beltT; const beltM = new T3.MeshToonMaterial({ map: beltT, gradientMap: ctx.grad });
    for (const [x, y1, z1] of [[X_BS + 0.55, 3.1, Z0 - 0.5], [X_LATHE - 1.2, 1.4, Z0 - 0.35], [X_DEB - 1.5, 1.0, Z0 - 0.4], [X_CUT + 0.9, 2.7, Z0 - 0.35]]) { const top = new T3.Vector3(x, 4.55, Z0), bot = new T3.Vector3(x, y1, z1), mid = top.clone().add(bot).multiplyScalar(0.5), len = top.distanceTo(bot); for (const dx of [-0.07, 0.07]) { const b = new T3.Mesh(new T3.BoxGeometry(0.1, len, 0.025), beltM); b.position.copy(mid); b.position.x += dx; b.lookAt(bot.x + dx, bot.y, bot.z); b.rotateX(Math.PI / 2); root.add(b); } M(new T3.CylinderGeometry(0.22, 0.22, 0.2, 14), wood, x, 4.55, Z0, root, 0.008).rotation.z = Math.PI / 2; } }
  // roof: trusses + boards (hidden when the camera rises above the eaves)
  { const g = new T3.Group(); root.add(g); Y.roof = g; for (let x = -9; x <= 9; x += 3) { M(new T3.BoxGeometry(0.22, 0.26, 13.2), woodD, x, 5.1, 0, g, 0.01); for (const s of [-1, 1]) { const r = M(new T3.BoxGeometry(0.2, 0.22, 7.2), woodD, x, 6.0, s * 3.2, g, 0.01); r.rotation.x = s * 0.27; } M(new T3.BoxGeometry(0.16, 1.9, 0.16), woodD, x, 6.0, 0, g, 0.01); }
    const rT = TX.plank('#6b4a2c', '#3a2614', 10); const rm = tm(rT, [8, 1]); for (const s of [-1, 1]) { const r = M(new T3.BoxGeometry(20.6, 0.14, 7.2), rm, 0, 6.15, s * 3.35, g, 0.02); r.rotation.x = s * 0.27; flat(r); } g.traverse(m => { m.castShadow = false; }); }
  // hanging lanterns (Nebo: hand-lit, warm)
  Y.lamps = []; { const glass = new T3.MeshBasicMaterial({ color: 0xffd98a }); for (const [x, z] of [[-4.2, -0.6], [0.9, -0.6], [5.4, -0.6], [-6, 3.8], [-1.2, 4.0], [4.4, 4.6]]) { const l = new T3.Group(); l.position.set(x, 0, z); root.add(l); M(new T3.CylinderGeometry(0.01, 0.01, 1.3, 4), ink, 0, 4.45, 0, l, 0); M(new T3.BoxGeometry(0.26, 0.34, 0.26), glass, 0, 3.65, 0, l, 0.012); M(new T3.ConeGeometry(0.24, 0.18, 4), greenD, 0, 3.92, 0, l, 0.008).rotation.y = Math.PI / 4; Y.lamps.push(l); } }
  // N crest banner + mill sign
  { const bT = CTX(256, 384, c => { c.fillStyle = '#2f6b45'; c.fillRect(0, 0, 256, 384); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 256, 14); c.fillRect(14, 14, 6, 340); c.fillRect(236, 14, 6, 340); c.beginPath(); c.moveTo(0, 340); c.lineTo(128, 384); c.lineTo(256, 340); c.lineTo(256, 384); c.lineTo(0, 384); c.fillStyle = '#e6b45a'; c.strokeStyle = '#e6b45a'; c.lineWidth = 16; c.lineJoin = 'round'; c.beginPath(); c.arc(128, 170, 84, 0, 7); c.stroke(); c.lineWidth = 22; c.beginPath(); c.moveTo(88, 220); c.lineTo(88, 120); c.lineTo(168, 220); c.lineTo(168, 120); c.stroke(); c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.fillText('NEBO', 128, 312); });
    for (const x of [-5.6, 6.0]) { const b = new T3.Mesh(new T3.PlaneGeometry(1.3, 1.95), new T3.MeshBasicMaterial({ map: bT })); b.position.set(x, 3.4, -6.44); Y.walls.back.add(b); }
    const sT = CTX(1024, 180, c => { c.fillStyle = '#1f4a2f'; c.fillRect(0, 0, 1024, 180); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 1024, 12); c.fillRect(0, 168, 1024, 12); c.fillStyle = '#fbf4e0'; c.font = '900 84px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("CEDAR'S LUMBER MILL", 512, 92); });
    const s = new T3.Mesh(new T3.PlaneGeometry(6.4, 1.12), new T3.MeshBasicMaterial({ map: sT })); s.position.set(-0.9, 4.95, -6.42); Y.walls.back.add(s); Y.sign = s; }
  // ---- LOG DECK: ramp in from the log door, logs lie across it ----
  { M(new T3.BoxGeometry(1.4, 0.5, 3.0), woodD, X_DECK, 0.25, Z0, root, 0.02); for (const z of [Z0 - 1.1, Z0 + 1.1]) { const r = M(new T3.BoxGeometry(3.6, 0.14, 0.16), wood, X_DECK + 1.3, 0.62, z, root, 0.01); r.rotation.z = -0.12; } for (let i = 0; i < 3; i++) M(new T3.CylinderGeometry(0.2, 0.2, 2.4, 10), toon(['#6e5c49', '#7a4a2e', '#5f574d'][i]), 12.0 + i * 0.5, 0.2, Z0 - 0.3 + i * 0.2, root, 0.015).rotation.x = Math.PI / 2; col(X_DECK - 0.7, Z0 - 1.5, 10.0, Z0 + 1.5); }
  // ---- DEBARKER: two powered rollers the log turns on ----
  { const rl = []; for (const dz of [-0.17, 0.17]) { const r = M(new T3.CylinderGeometry(0.09, 0.09, 2.9, 12), toon('#8a8f96'), X_DEB, H_DEB - 0.07, Z0 + dz, root, 0.008); r.rotation.z = Math.PI / 2; for (let i = 0; i < 6; i++) M(new T3.TorusGeometry(0.095, 0.012, 4, 12), ink, -1.2 + i * 0.48, 0, 0, r, 0).rotation.x = Math.PI / 2; rl.push(r); } Y.anim.rollers = rl;
    for (const x of [X_DEB - 1.4, X_DEB + 1.4]) { M(new T3.BoxGeometry(0.16, H_DEB, 0.7), green, x, H_DEB / 2 - 0.05, Z0, root, 0.012); } M(new T3.BoxGeometry(2.9, 0.1, 0.12), greenD, X_DEB, 0.2, Z0 - 0.3, root, 0); M(new T3.BoxGeometry(0.5, 0.5, 0.5), iron, X_DEB - 1.5, 0.75, Z0 - 0.5, root, 0.012);
    const bin = M(new T3.BoxGeometry(1.8, 0.45, 0.8), toon('#7a5a38'), X_DEB, 0.23, Z0 + 1.05, root, 0.015); M(new T3.BoxGeometry(1.7, 0.08, 0.7), toon('#5a3c22'), X_DEB, 0.4, Z0 + 1.05, root, 0); col(X_DEB - 1.5, Z0 - 0.6, X_DEB + 1.5, Z0 + 1.5); }
  // ---- CUT-OFF SAW: roller table with a tape measure, the round saw on a swing arm ----
  { M(new T3.BoxGeometry(4.6, 0.12, 0.62), woodD, X_CUT - 0.7, H_CUT - 0.1, Z0, root, 0.015); for (const x of [X_CUT - 2.8, X_CUT - 0.8, X_CUT + 1.3]) for (const dz of [-0.24, 0.24]) M(new T3.BoxGeometry(0.1, H_CUT - 0.1, 0.1), woodD, x, (H_CUT - 0.1) / 2, Z0 + dz, root, 0.008);
    for (let x = X_CUT - 2.85; x < X_CUT + 1.5; x += 0.42) { const r = M(new T3.CylinderGeometry(0.05, 0.05, 0.56, 10), steel, x, H_CUT - 0.02, Z0, root, 0.006); r.rotation.x = Math.PI / 2; }
    const tape = CTX(1024, 64, c => { c.fillStyle = '#f2c94c'; c.fillRect(0, 0, 1024, 64); c.fillStyle = '#201e1d'; c.font = '800 22px Archivo, Arial'; c.textBaseline = 'top'; for (let i = 0; i <= 25; i++) { const x = 1024 - i * 1024 / 2.6 * 0.1; c.fillRect(x - 1, 0, 2, i % 5 ? 14 : 26); if (i % 5 === 0) { c.textAlign = 'center'; c.fillText((i / 10).toFixed(1), Math.max(18, Math.min(1006, x)), 30); } } c.fillStyle = '#c42d3c'; c.fillRect(1018, 0, 6, 64); });
    const tp = new T3.Mesh(new T3.PlaneGeometry(2.6, 0.16), new T3.MeshBasicMaterial({ map: tape })); tp.position.set(X_CUT - 1.3, H_CUT - 0.08, Z0 + 0.315); root.add(tp);
    const arm = new T3.Group(); arm.position.set(X_CUT, H_CUT + 1.05, Z0 - 0.75); root.add(arm); M(new T3.BoxGeometry(0.22, 1.2, 0.22), green, X_CUT, (H_CUT + 1.05) / 2, Z0 - 0.75, root, 0.012); M(new T3.BoxGeometry(0.12, 0.12, 0.85), iron, 0, 0, 0.4, arm, 0.008); const hood = M(new T3.CylinderGeometry(0.42, 0.42, 0.12, 20, 1, false, 0, Math.PI), toon('#e6b45a'), 0, 0, 0.78, arm, 0.01); hood.rotation.z = Math.PI / 2; hood.rotation.y = Math.PI / 2;
    const blade = M(new T3.CylinderGeometry(0.38, 0.38, 0.02, 24), steel, 0, -0.02, 0.78, arm, 0.004); blade.rotation.z = Math.PI / 2; blade.rotation.y = Math.PI / 2; M(new T3.BoxGeometry(0.1, 0.1, 0.35), red, 0, 0.2, 0.62, arm, 0.006); Y.anim.cutArm = arm; Y.anim.cutBlade = blade;
    const laser = new T3.Mesh(new T3.PlaneGeometry(0.012, 0.7), new T3.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.85, depthWrite: false })); laser.rotation.x = -Math.PI / 2; laser.position.set(X_CUT, H_CUT + 0.002, Z0); laser.visible = false; root.add(laser); Y.laser = laser;
    const scrap = M(new T3.BoxGeometry(1.0, 0.5, 0.8), toon('#7a5a38'), X_CUT + 1.1, 0.25, Z0 + 1.1, root, 0.015); Y.scrap = { x: X_CUT + 1.1, z: Z0 + 1.1 }; col(X_CUT - 3.0, Z0 - 0.95, X_CUT + 1.6, Z0 + 1.55); }
  // ---- BAND SAW: two big wheels in a green frame, the blade, the carriage on rails ----
  { const fr = new T3.Group(); fr.position.set(X_BS, 0, Z0); root.add(fr); M(new T3.BoxGeometry(0.5, 3.4, 0.5), green, 0, 1.7, -0.75, fr, 0.02); M(new T3.BoxGeometry(0.5, 0.4, 1.0), green, 0, 3.2, -0.35, fr, 0.015); M(new T3.BoxGeometry(0.6, 0.5, 1.1), greenD, 0, 0.25, -0.4, fr, 0.015);
    const wh = []; for (const [y, z] of [[3.1, 0], [0.42, 0]]) { const w = M(new T3.CylinderGeometry(0.62, 0.62, 0.12, 24), toon('#3a3836'), 0.33, y, z - 0.05, fr, 0.012); w.rotation.z = Math.PI / 2; for (let i = 0; i < 3; i++) { const s = M(new T3.BoxGeometry(0.02, 1.1, 0.08), gold, 0.07, 0, 0, w, 0); s.rotation.x = i * Math.PI / 3; } wh.push(w); } Y.anim.bsWheels = wh;
    const bl = M(new T3.BoxGeometry(0.02, 2.7, 0.05), steel, 0, 1.75, 0, fr, 0.003); Y.anim.bsBlade = bl; M(new T3.BoxGeometry(0.16, 0.5, 0.14), toon('#e6b45a'), 0, H_BS + 0.95, 0, fr, 0.008);
    for (const dz of [-0.3, 0.3]) M(new T3.BoxGeometry(5.0, 0.08, 0.08), steel, -1.1, 0.5, dz, fr, 0.005); for (const x of [-3.4, -1.1, 1.1]) M(new T3.BoxGeometry(0.12, 0.5, 0.9), iron, x, 0.25, 0, fr, 0.008);
    const car = new T3.Group(); car.position.set(X_BS, 0, Z0); root.add(car); M(new T3.BoxGeometry(2.2, 0.1, 0.72), toon('#8a8f96'), 0, H_BS - 0.05, 0, car, 0.01); for (const dx of [-0.9, 0.9]) M(new T3.BoxGeometry(0.1, 0.24, 0.72), red, dx, H_BS + 0.07, 0, car, 0.006); M(new T3.BoxGeometry(0.4, H_BS - 0.5, 0.3), iron, 0, (H_BS - 0.1) / 2 + 0.2, 0, car, 0.008); Y.carriage = car;
    col(X_BS - 3.9, Z0 - 1.1, X_BS + 2.2, Z0 + 0.55); }
  // ---- LATHE: headstock, bed, tailstock, tool rest ----
  { const g = new T3.Group(); g.position.set(X_LATHE, 0, Z0); root.add(g); M(new T3.BoxGeometry(3.2, 0.18, 0.5), toon('#3a3836'), 0, H_LATHE - 0.42, 0, g, 0.015); for (const x of [-1.4, 1.4]) M(new T3.BoxGeometry(0.4, H_LATHE - 0.5, 0.5), green, x, (H_LATHE - 0.5) / 2, 0, g, 0.015);
    M(new T3.BoxGeometry(0.5, 0.62, 0.55), green, -1.45, H_LATHE, 0, g, 0.015); const chuck = M(new T3.CylinderGeometry(0.13, 0.13, 0.16, 6), steel, -1.15, H_LATHE, 0, g, 0.008); chuck.rotation.z = Math.PI / 2; Y.anim.chuck = chuck; M(new T3.CylinderGeometry(0.24, 0.24, 0.14, 16), wood, -1.75, H_LATHE + 0.12, 0, g, 0.008).rotation.z = Math.PI / 2;
    const tail = M(new T3.BoxGeometry(0.34, 0.44, 0.42), green, 1.4, H_LATHE - 0.1, 0, g, 0.012); Y.anim.tail = tail; M(new T3.ConeGeometry(0.05, 0.14, 8), steel, -0.2, 0.1, 0, tail, 0).rotation.z = Math.PI / 2;
    const rest = new T3.Group(); rest.position.set(0, H_LATHE - 0.2, 0.32); g.add(rest); M(new T3.BoxGeometry(0.9, 0.05, 0.06), iron, 0, 0.0, 0, rest, 0.006); M(new T3.BoxGeometry(0.08, 0.3, 0.08), iron, 0, -0.15, 0, rest, 0.006); Y.anim.rest = rest;
    col(X_LATHE - 1.8, Z0 - 0.5, X_LATHE + 1.7, Z0 + 0.6); }
  // ---- PLANING BENCH (front left) with a vice and a shavings bin ----
  { M(new T3.BoxGeometry(2.9, 0.12, 0.9), woodL, PLANE.x, H_PLANE - 0.06, PLANE.z, root, 0.015); for (const x of [-1.3, 1.3]) for (const dz of [-0.35, 0.35]) M(new T3.BoxGeometry(0.12, H_PLANE - 0.12, 0.12), woodD, PLANE.x + x, (H_PLANE - 0.12) / 2, PLANE.z + dz, root, 0.008); M(new T3.BoxGeometry(2.6, 0.08, 0.7), woodD, PLANE.x, 0.25, PLANE.z, root, 0.008); M(new T3.BoxGeometry(0.22, 0.24, 0.3), iron, PLANE.x - 1.5, H_PLANE - 0.08, PLANE.z + 0.35, root, 0.008);
    for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.3, 0.06, 0.12), toon(['#d2a86a', '#a87a4a', '#6b4a2c', '#c99a5e'][i]), PLANE.x - 0.9 + i * 0.6, 0.32, PLANE.z, root, 0.005); col(PLANE.x - 1.6, PLANE.z - 0.55, PLANE.x + 1.55, PLANE.z + 0.55); }
  // ---- FINISHING TABLE: stain pots (the four Nebo stains), rags ----
  { M(new T3.BoxGeometry(2.6, 0.1, 1.0), toon('#8a6a4a'), FINISH.x, H_FIN - 0.05, FINISH.z, root, 0.015); for (const x of [-1.15, 1.15]) for (const dz of [-0.4, 0.4]) M(new T3.BoxGeometry(0.1, H_FIN - 0.1, 0.1), woodD, FINISH.x + x, (H_FIN - 0.1) / 2, FINISH.z + dz, root, 0.008);
    Y.pots = SK.map((k, i) => { const p = new T3.Group(); p.position.set(FINISH.x - 0.75 + i * 0.5, H_FIN, FINISH.z - 0.62); root.add(p); M(new T3.CylinderGeometry(0.12, 0.12, 0.2, 14), toon('#d7dde3'), 0, 0.1, 0, p, 0.008, 0.12); M(new T3.CylinderGeometry(0.105, 0.105, 0.02, 14), toon(STAINS[k].col), 0, 0.2, 0, p, 0); M(new T3.BoxGeometry(0.03, 0.3, 0.03), woodD, 0.03, 0.3, 0, p, 0).rotation.z = -0.3; return p; });
    M(new T3.BoxGeometry(2.2, 0.16, 0.36), woodD, FINISH.x, H_FIN + 0.08, FINISH.z - 0.65, root, 0.008); col(FINISH.x - 1.35, FINISH.z - 0.85, FINISH.x + 1.35, FINISH.z + 0.55); }
  // ---- COUNTER (orders come in, work goes out) ----
  { M(new T3.BoxGeometry(2.8, H_CTR, 0.7), wood, COUNTER.x, H_CTR / 2, COUNTER.z, root, 0.02); M(new T3.BoxGeometry(3.0, 0.08, 0.86), woodL, COUNTER.x, H_CTR + 0.04, COUNTER.z, root, 0.01); M(new T3.BoxGeometry(2.6, 0.3, 0.02), green, COUNTER.x, H_CTR - 0.3, COUNTER.z + 0.36, root, 0);
    const bell = M(new T3.SphereGeometry(0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), gold, COUNTER.x + 1.15, H_CTR + 0.08, COUNTER.z + 0.1, root, 0.006); Y.bell = bell;
    const book = M(new T3.BoxGeometry(0.4, 0.05, 0.3), toon('#7a3a26'), COUNTER.x - 0.9, H_CTR + 0.1, COUNTER.z, root, 0.006); book.rotation.y = 0.2; col(COUNTER.x - 1.5, COUNTER.z - 0.45, COUNTER.x + 1.5, COUNTER.z + 0.45); }
  // ---- stove + kettle, chopping block + axe, firewood, lumber stacks, tool wall, the mill whistle ----
  { const sv = new T3.Group(); sv.position.set(8.8, 0, 1.6); root.add(sv); M(new T3.BoxGeometry(0.9, 0.8, 0.8), toon('#2a2826'), 0, 0.4, 0, sv, 0.015); M(new T3.CylinderGeometry(0.1, 0.1, 4.2, 8), toon('#2a2826'), 0, 2.9, -0.2, sv, 0.008); const fire = M(new T3.BoxGeometry(0.4, 0.22, 0.02), new T3.MeshBasicMaterial({ color: 0xff8a2a }), 0, 0.35, 0.41, sv, 0); Y.anim.fire = fire;
    const kt = new T3.Group(); kt.position.set(0.1, 0.8, 0.05); sv.add(kt); M(new T3.SphereGeometry(0.16, 12, 8), toon('#e6b45a'), 0, 0.12, 0, kt, 0.008).scale.y = 0.8; M(new T3.CylinderGeometry(0.02, 0.03, 0.18, 6), toon('#e6b45a'), 0.17, 0.16, 0, kt, 0).rotation.z = -0.9; Y.kettle = kt; kt.visible = false; col(8.3, 1.1, 9.4, 2.1); }
  { const cb = new T3.Group(); cb.position.set(7.6, 0, 4.6); root.add(cb); M(new T3.CylinderGeometry(0.42, 0.46, 0.6, 14), toon('#a87a4a'), 0, 0.3, 0, cb, 0.015, 0.44); const top = new T3.Mesh(new T3.CircleGeometry(0.42, 16), new T3.MeshToonMaterial({ map: TX.rings(WOODS.oak), gradientMap: ctx.grad })); top.rotation.x = -Math.PI / 2; top.position.y = 0.605; cb.add(top);
    const axe = new T3.Group(); axe.position.set(0.05, 0.62, 0.1); axe.rotation.z = 0.5; cb.add(axe); M(new T3.CylinderGeometry(0.03, 0.035, 0.85, 6), toon('#d2a86a'), 0, 0.4, 0, axe, 0.006); M(new T3.BoxGeometry(0.06, 0.18, 0.24), steel, 0, 0.78, 0.1, axe, 0.006); Y.axe = axe; Y.chop = cb;
    const fw = []; for (let i = 0; i < 8; i++) { const m = M(new T3.CylinderGeometry(0.11, 0.11, 0.5, 6), toon(i % 2 ? '#c99a5e' : '#a87a4a'), 8.6 + (i % 4) * 0.24, 0.12 + Math.floor(i / 4) * 0.21, 3.6, root, 0.006); m.rotation.x = Math.PI / 2; fw.push(m); } Y.firewood = fw; col(7.15, 4.15, 8.05, 5.05); col(8.4, 3.3, 9.6, 3.9); }
  { const stk = (x, z, n, w, ry = 0) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); for (let k = 0; k < n; k++) for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(2.8, 0.1, w), toon(['#d2a86a', '#c99a5e', '#e8c48a', '#b88a52'][(i + k) % 4]), 0, 0.1 + k * 0.13, -0.6 + i * (w + 0.05), g, 0.006); for (const dx of [-1, 0, 1]) for (let k = 0; k < n; k += 3) M(new T3.BoxGeometry(0.08, 0.04, 1.4), woodD, dx, 0.16 + k * 0.13, 0, g, 0); return g; };
    stk(-8.3, 4.6, 9, 0.3, Math.PI / 2); stk(-1.4, -5.6, 6, 0.26); stk(-7.6, -5.6, 7, 0.26); col(-9.0, 3.0, -7.6, 6.2); col(-2.9, -6.3, 0.1, -4.9); col(-9.1, -6.3, -6.1, -4.9); }
  { const tw = CTX(512, 256, c => { c.fillStyle = '#c9a06a'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#9a7444'; for (let y = 12; y < 256; y += 20) for (let x = 12; x < 512; x += 20) c.fillRect(x, y, 3, 3); c.fillStyle = '#201e1d'; c.fillRect(30, 40, 12, 170); c.fillRect(14, 40, 44, 34); c.save(); c.translate(120, 40); c.fillRect(0, 0, 150, 12); for (let i = 0; i < 12; i++) { c.beginPath(); c.moveTo(i * 12, 12); c.lineTo(i * 12 + 6, 22); c.lineTo(i * 12 + 12, 12); c.fill(); } c.fillRect(-14, -8, 18, 36); c.restore(); c.fillRect(300, 50, 10, 150); c.beginPath(); c.moveTo(310, 50); c.quadraticCurveTo(350, 70, 330, 110); c.lineTo(310, 100); c.fill(); c.fillRect(380, 40, 110, 14); c.fillRect(380, 70, 90, 14); c.fillRect(380, 100, 70, 14); c.fillStyle = '#2f6b45'; c.fillRect(120, 140, 160, 70); c.fillStyle = '#e6b45a'; c.font = '800 26px Archivo, Arial'; c.fillText('SAFETY FIRST', 124, 184); });
    const p = new T3.Mesh(new T3.PlaneGeometry(3.2, 1.6), new T3.MeshBasicMaterial({ map: tw })); p.position.set(-9.94, 2.4, -1.5); p.rotation.y = Math.PI / 2; Y.walls.west.add(p); }
  { const wh = new T3.Group(); wh.position.set(3.6, 0, -6.2); root.add(wh); M(new T3.CylinderGeometry(0.06, 0.06, 4.5, 8), toon('#8a8f96'), 0, 2.25, 0, wh, 0.006); M(new T3.CylinderGeometry(0.14, 0.1, 0.5, 10), gold, 0, 4.6, 0, wh, 0.008); const cord = M(new T3.CylinderGeometry(0.01, 0.01, 2.6, 4), toon('#d9c08a'), 0.25, 3.0, 0.1, wh, 0); M(new T3.SphereGeometry(0.06, 8, 6), red, 0.25, 1.7, 0.1, wh, 0); Y.whistle = wh; Y.whistleCord = cord; }
  // spots (local)
  Y.spots = { benIntro: { x: 1.7, z: 0.3 }, cedarIntro: { x: 0.1, z: 0.0 }, benCounter: { x: COUNTER.x, z: COUNTER.z - 0.85 }, cedarWork: { x: 8.2, z: -0.4 }, cust: { x: COUNTER.x, z: COUNTER.z + 1.05 }, door: { x: 0, z: 6.0 }, outside: { x: 0, z: 10 }, walkStart: { x: 0, z: 4.8 }, chop: { x: 7.6, z: 4.6 }, whistle: { x: 3.6, z: -6.2 } };
  // bake the static parts (pass ctx.merge === false to keep every mesh separate, e.g. for editing)
  if (ctx.merge !== false) { const A = Y.anim, dyn = new Set([A.cog, A.shaft, ...A.rollers, ...A.bsWheels, A.bsBlade, A.chuck, A.tail, A.rest, A.cutArm, A.fire, Y.carriage, Y.laser, Y.axe, Y.kettle, ...Y.lamps].filter(Boolean)); Object.values(Y.walls).forEach(w => w.userData.mergeRoot = true); Y.roof.userData.mergeRoot = true; Y.merged = mergeStatic(T3, root, dyn); Object.values(Y.walls).forEach(w => Y.merged += mergeStatic(T3, w, dyn)); Y.merged += mergeStatic(T3, Y.roof, dyn); }
  Y.stations = { Z0, X_DECK, X_DEB, X_CUT, X_BS, X_LATHE, PLANE, FINISH, COUNTER, H_DEB, H_CUT, H_BS, H_LATHE, H_PLANE, H_FIN, H_CTR, BOX };
  return Y;
}

// ---------------- the piece: a log that becomes the order ----------------
// P.g sits at the piece's centre (world), local +x along its length. P.core holds the wood (it spins on the debarker and the lathe).
// shape: 'log' (round, maybe barked) → after SAW: 'post' | 'boards' | 'board' → TURN makes it 'round' with grooves.
function makePiece(ST, job, TX) {
  const { THREE: T3, toon, addOutline, scene, grad } = ST, W = WOODS[job.wood], I = ITEMS[job.item];
  const g = new T3.Group(), core = new T3.Group(); g.add(core); scene.add(g);
  const mats = [0, 1, 2, 3].map(() => new T3.MeshToonMaterial({ color: W.wood, gradientMap: grad, map: TX.grainV }));
  const P = { g, core, job, W, I, len: job.L0, r: I.r, shape: 'log', bark: !!job.barked, strips: [], grooves: [], mats, cover: [0, 0, 0, 0], col: [null, null, null, null], hit: [], patches: [], kerf: null, brand: null, endM: new T3.MeshToonMaterial({ map: TX.rings(W), gradientMap: grad }), barkM: new T3.MeshToonMaterial({ map: TX.bark(W), gradientMap: grad }) };
  P.halfH = () => P.shape === 'post' ? P.side / 2 : P.shape === 'boards' ? P.bt * 1.5 + 0.01 : P.shape === 'board' ? P.bt / 2 : P.r;
  P.rebuild = () => {
    for (const m of [...core.children]) { core.remove(m); }
    P.hit = []; P.strips = []; const L = P.len, sec = x => clamp(Math.floor((x / L + 0.5) * 4), 0, 3);
    const add = (geo, mat, x, y, z, s, o = 0.012) => { const m = new T3.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; if (o) addOutline(m, o); m.userData.sec = s; core.add(m); P.hit.push(m); return m; };
    if (P.shape === 'log' || P.shape === 'round') {
      mats.forEach(m => { m.map = TX.grainV; m.needsUpdate = true; });
      // slices along x: grooves are their own short slices so the lathe can cut them in
      const cuts = []; P.grooves.forEach(G => cuts.push([G.x - 0.045, G.x + 0.045, G])); cuts.sort((a, b) => a[0] - b[0]);
      let x = -L / 2; const slices = []; for (const [a, b, G] of cuts) { if (a > x) slices.push([x, a, null]); slices.push([a, b, G]); x = b; } if (x < L / 2) slices.push([x, L / 2, null]);
      for (const [a, b, G] of slices) { const geo = new T3.CylinderGeometry(P.r, P.r, b - a, 18, 1, true).rotateZ(-Math.PI / 2); const m = add(geo, mats[sec((a + b) / 2)], (a + b) / 2, 0, 0, sec((a + b) / 2), G ? 0 : 0.012); if (G) { G.mesh = m; const k = 1 - G.v * 0.5; m.scale.set(1, k, k); } }
      for (const s of [-1, 1]) { const c = new T3.Mesh(new T3.CircleGeometry(P.r, 18), P.endM); c.rotation.y = s * Math.PI / 2; c.position.x = s * L / 2; core.add(c); }
      if (P.bark && P.shape === 'log') { const NA = 6, NL = 3; for (let i = 0; i < NL; i++) for (let j = 0; j < NA; j++) { const ts = j / NA * Math.PI * 2, geo = new T3.CylinderGeometry(P.r + 0.028, P.r + 0.028, L / NL - 0.004, 5, 1, true, ts, Math.PI * 2 / NA - 0.02).rotateZ(-Math.PI / 2); const m = new T3.Mesh(geo, P.barkM); m.position.x = -L / 2 + (i + 0.5) * L / NL; m.castShadow = true; addOutline(m, 0.01); m.userData = { strip: true, ring: i, j, ts }; core.add(m); P.strips.push(m); } }
    } else {
      mats.forEach(m => { m.map = TX.grainH; m.needsUpdate = true; });
      const boxes = P.shape === 'post' ? [[P.side, P.side, 0]] : P.shape === 'board' ? [[P.bt, P.bw, 0]] : [0, 1, 2].map(i => [P.bt, P.bw, (i - 1) * (P.bt + 0.01)]);
      for (const [h, w, y] of boxes) for (let i = 0; i < 4; i++) add(new T3.BoxGeometry(L / 4 - 0.002, h, w), mats[i], -L / 2 + (i + 0.5) * L / 4, y, 0, i, 0.01);
      for (const [h, w, y] of boxes) for (const s of [-1, 1]) { const c = new T3.Mesh(new T3.PlaneGeometry(w, h), P.endM); c.rotation.y = s * Math.PI / 2; c.position.set(s * (L / 2 + 0.002), y, 0); core.add(c); }
    }
    if (P.kerf) { core.add(P.kerf.mesh); } P.patches.forEach(p => core.add(p.m)); if (P.brand) core.add(P.brand);
  };
  P.peel = (m) => { if (!m.parent) return false; const wpos = m.getWorldPosition(new T3.Vector3()), wq = m.getWorldQuaternion(new T3.Quaternion()); core.remove(m); m.position.copy(wpos); m.quaternion.copy(wq); scene.add(m); const out = wpos.clone().sub(g.getWorldPosition(new T3.Vector3())); out.x = 0; out.normalize(); m.userData.fly = { v: out.multiplyScalar(2.2).add(new T3.Vector3(rr(-0.4, 0.4), 2.4, 0.6)), spin: new T3.Vector3(rr(-6, 6), rr(-3, 3), rr(-6, 6)), t: 0 }; return true; };
  P.barkLeft = () => P.strips.filter(s => s.parent === core).length;
  P.setStain = (i, colHex, cover) => { const c = new T3.Color(W.wood).lerp(new T3.Color(colHex), cover * 0.92); mats[i].color.copy(c); };
  P.rebuild();
  return P;
}
// pencil line for the band saw: piece-local z offset of the line at distance u along the cut (from the -x end)
const lineF = (job, u) => job.ripA * (Math.sin(u * job.ripK + job.ripP) * 0.7 + Math.sin(u * job.ripK * 2.3 + 1.7) * 0.3);
function kerfStrip(ST, P) {
  const { THREE: T3 } = ST, L = P.len, round = P.shape === 'log', cv = document.createElement('canvas'); cv.width = 96; cv.height = 512; const c = cv.getContext('2d'), tex = new T3.CanvasTexture(cv); tex.colorSpace = T3.SRGBColorSpace;
  const R = round ? P.r + (P.bark && P.barkLeft() ? 0.034 : 0.004) : 0, half = 0.17;
  let geo, toPx;
  if (round) { const TL = 2 * Math.asin(Math.min(0.95, half / R)); geo = new T3.CylinderGeometry(R, R, L, 12, 1, true, -Math.PI / 2 - TL / 2, TL).rotateZ(-Math.PI / 2); toPx = (u, z) => [(Math.asin(clamp(z / R, -0.99, 0.99)) / TL + 0.5) * 96, (L - u) / L * 511]; }
  else { const y = P.halfH() + 0.003; geo = new T3.PlaneGeometry(L, half * 2).rotateX(-Math.PI / 2).translate(0, y, 0); const pos = geo.attributes.position, uv = geo.attributes.uv; for (let i = 0; i < pos.count; i++) uv.setXY(i, pos.getZ(i) / (half * 2) + 0.5, pos.getX(i) / L + 0.5); uv.needsUpdate = true; toPx = (u, z) => [(z / (half * 2) + 0.5) * 96, (L - u) / L * 511]; }
  const mesh = new T3.Mesh(geo, new T3.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); mesh.renderOrder = 3;
  const K = { mesh, cv, c, tex, toPx, L, last: null };
  K.drawLine = () => { c.clearRect(0, 0, 96, 512); c.strokeStyle = 'rgba(32,30,29,0.9)'; c.lineWidth = 3; c.setLineDash([10, 8]); c.beginPath(); for (let i = 0; i <= 64; i++) { const u = i / 64 * L, [px, py] = toPx(u, lineF(P.job, u)); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); c.setLineDash([]); tex.needsUpdate = true; };
  K.mark = (u, z, colr) => { const [px, py] = toPx(u, z); c.strokeStyle = colr; c.lineWidth = 5; c.beginPath(); if (K.last) c.moveTo(K.last[0], K.last[1]); else c.moveTo(px, py); c.lineTo(px, py); c.stroke(); K.last = [px, py]; tex.needsUpdate = true; };
  K.drawLine(); return K;
}

// ---------------- the stand-alone game ----------------
export async function createLumberMill({ container, onState = () => {}, music = {} }) {
  const ST = createStage(container, { bg: '#cfe6d0' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, puff, smokeS } = ST;
  // sound: everything goes through mill-audio.js (the kit's old synth blips are switched off here)
  const SFX = createMillAudio({ music }), tone = () => {}, audio = { init: () => SFX.unlock() }, buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#8cc4dc'); gr.addColorStop(0.55, '#cfe6d0'); gr.addColorStop(1, '#e8f0dc'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); }); scene.fog = new THREE.Fog('#dcebd6', 32, 80);
  ST.sun.position.set(5, 14, 9); ST.sun.intensity = 1.3; Object.assign(ST.sun.shadow.camera, { left: -12, right: 12, top: 10, bottom: -10 }); ST.sun.shadow.camera.updateProjectionMatrix();
  const Y = buildMill({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline }), TX = Y.TX, sp = Y.spots;
  const lamp = new THREE.PointLight(0xffc878, 0.9, 16, 1.6); lamp.position.set(0, 3.4, 0); scene.add(lamp);
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const cedar = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, elder: 1, beard: '#eef0f4', fur: '#a8a29a', furDark: '#6a6560', fluff: '#f4f4f6', tailMid: '#bdb6ac', browColor: '#f8fafc', headTuft: 0.6 }, torso: ['#b8322a', '#2a2826', '#7a1e18'], outfit: 'coat', crest: '', gear: 'none', mood: 'happy' }));
  { const CP = cedar.userData.P, hs = CP.head.scale.x || 1, cap = new THREE.Group(); cap.position.set(0, CP.head.position.y + 0.2 * hs, 0.02); cap.scale.setScalar(hs); CP.body.add(cap); M(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#2f6b45'), 0, 0, -0.03, cap, 0.012); M(new THREE.BoxGeometry(0.36, 0.03, 0.24), toon('#2f6b45'), 0, 0.01, 0.28, cap, 0.008); M(new THREE.BoxGeometry(0.62, 0.05, 0.06), toon('#e6b45a'), 0, 0.03, 0.02, cap, 0); }
  const ben = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#2f6b45', '#2f6b45', '#e6b45a'], crest: '', gear: 'none', mood: 'happy' })); const BP = ben.userData.P;
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 88); g.strokeStyle = '#e6b45a'; g.lineWidth = 14; g.lineCap = 'round'; for (const s of [-1, 1]) { g.save(); g.rotate(s * 0.6); g.beginPath(); g.moveTo(0, 60); g.lineTo(0, -54); g.stroke(); g.fillStyle = '#e6b45a'; g.fillRect(s > 0 ? 0 : -34, -66, 34, 26); g.restore(); } g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.05); g.fillStyle = '#e6b45a'; g.fillRect(-124, -26, 248, 52); g.font = 'italic 900 32px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1f4a2f'; g.fillText("CEDAR'S MILL", 0, 2); g.restore(); });
    const U = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#e6b45a', towelCol: '#b8322a' }), hat = U.hat, hs = BP.head.scale.x || 1;
    while (hat.children.length) hat.remove(hat.children[0]); hat.scale.setScalar(hs); hat.position.y -= 0.06 * hs;
    M(new THREE.SphereGeometry(0.31, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e6b45a'), 0, 0, -0.04, hat, 0.012); M(new THREE.CylinderGeometry(0.315, 0.315, 0.08, 16), toon('#2f6b45'), 0, 0.03, -0.04, hat, 0.008); M(new THREE.SphereGeometry(0.08, 8, 6), toon('#2f6b45'), 0, 0.32, -0.04, hat, 0);
    return U.parts; })();
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const custFox = {}; for (const k of IK) { const I = ITEMS[k]; const f = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: I.fur, furDark: I.furDark, paw: I.fur }, torso: I.torso, outfit: I.outfit || 'vest', crest: '', gear: 'none', mood: 'happy', glasses: I.glasses })); f.visible = false; custFox[k] = f; }
  // tools that follow your finger
  const tool = {}; { const steel = toon('#c9d1d8'), hdl = toon('#d2a86a');
    tool.knife = new THREE.Group(); M(new THREE.BoxGeometry(0.5, 0.02, 0.08), steel, 0, 0, 0, tool.knife, 0.006); for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 6), hdl, s * 0.3, 0.06, -0.05, tool.knife, 0.005);
    tool.plane = new THREE.Group(); M(new THREE.BoxGeometry(0.34, 0.1, 0.12), toon('#b8322a'), 0, 0.05, 0, tool.plane, 0.008); M(new THREE.BoxGeometry(0.1, 0.12, 0.05), hdl, -0.1, 0.14, 0, tool.plane, 0.005); M(new THREE.SphereGeometry(0.04, 8, 6), hdl, 0.12, 0.12, 0, tool.plane, 0.004);
    tool.brush = new THREE.Group(); M(new THREE.BoxGeometry(0.16, 0.06, 0.05), toon('#e6b45a'), 0, 0.03, 0, tool.brush, 0.005); M(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 6), hdl, 0, 0.18, 0, tool.brush, 0.004); tool.bristle = M(new THREE.BoxGeometry(0.15, 0.05, 0.045), toon('#3a3836'), 0, -0.02, 0, tool.brush, 0);
    tool.chisel = new THREE.Group(); M(new THREE.BoxGeometry(0.03, 0.02, 0.32), steel, 0, 0, -0.16, tool.chisel, 0.004); M(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 6), hdl, 0, 0, 0.12, tool.chisel, 0.004).rotation.x = Math.PI / 2;
    for (const k in tool) if (tool[k].isGroup) { tool[k].visible = false; scene.add(tool[k]); } }
  // flying bits: shavings + chips
  const bits = []; { const curlG = new THREE.TorusGeometry(0.05, 0.012, 4, 10, Math.PI * 1.5); for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(curlG, toon('#f2dcaa')); m.visible = false; scene.add(m); bits.push({ m, t: 0, v: V3(), s: V3() }); } }
  let bitI = 0; const fling = (p, col, n = 2, up = 1.6) => { for (let i = 0; i < n; i++) { const b = bits[bitI = (bitI + 1) % bits.length]; b.m.material = toon(col); b.m.visible = true; b.m.position.copy(p); b.t = 1; b.v.set(rr(-0.8, 0.8), rr(0.6, 1.2) * up, rr(0.2, 0.9)); b.s.set(rr(-8, 8), rr(-8, 8), rr(-8, 8)); b.m.scale.setScalar(rr(0.7, 1.3)); } };
  const offcuts = [];

  // ---------- polish: blob shadows, dust in the light, window light shafts, lamp glow, wood chips, props, the order board ----------
  const blobT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(26,16,8,0.5)'); g.addColorStop(0.6, 'rgba(26,16,8,0.25)'); g.addColorStop(1, 'rgba(26,16,8,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blobs = [ben, cedar, ...Object.values(custFox)].map(f => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.25), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 1; scene.add(m); return { f, m }; });
  const dustN = 150, dustG = new THREE.BufferGeometry(), dustP = new Float32Array(dustN * 3), dustS = [];
  for (let i = 0; i < dustN; i++) { dustP[i * 3] = rr(-9, 9); dustP[i * 3 + 1] = rr(0.4, 4.6); dustP[i * 3 + 2] = rr(-6, 5); dustS.push(rr(0, 6.28)); }
  dustG.setAttribute('position', new THREE.BufferAttribute(dustP, 3));
  const dust = new THREE.Points(dustG, new THREE.PointsMaterial({ map: glowTex, color: 0xffe2a8, size: 0.08, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true })); scene.add(dust);
  const shaftT = canvasTex(64, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,236,190,0.95)'); g.addColorStop(0.55, 'rgba(255,230,180,0.35)'); g.addColorStop(1, 'rgba(255,230,180,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); const h = c.createLinearGradient(0, 0, 64, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.2, 'rgba(0,0,0,0)'); h.addColorStop(0.8, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = h; c.fillRect(0, 0, 64, 256); });
  const shafts = [-7.4, -3.8, 4.2, 7.6].map(x => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 5.7), new THREE.MeshBasicMaterial({ map: shaftT, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide })); m.position.set(x, 1.45, -3.95); m.rotation.x = -1.037; m.renderOrder = 2; scene.add(m); return m; });
  Y.lamps.forEach(l => { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffc070, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); g.position.y = 3.65; g.scale.setScalar(1.4); l.add(g); });
  { const SNs = Y.stations, spots = [[SNs.X_BS, SNs.Z0 + 0.9, 1.2, 60], [SNs.X_LATHE, SNs.Z0 + 0.8, 1.0, 45], [SNs.X_CUT, SNs.Z0 + 0.8, 0.9, 40], [SNs.PLANE.x, SNs.PLANE.z + 0.8, 1.0, 40], [SNs.X_DEB, SNs.Z0 + 0.8, 1.0, 30]], n = spots.reduce((a, b) => a + b[3], 0);
    const chips = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.012, 0.035), toon('#e8c48a'), n), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), sc = new THREE.Vector3(); let k = 0;
    for (const [x, z, r, c] of spots) for (let i = 0; i < c; i++) { const a = rr(0, 6.28), d = Math.sqrt(Math.random()) * r; e.set(0, rr(0, 6.28), 0); q.setFromEuler(e); sc.setScalar(rr(0.6, 1.4)); m4.compose(V3(x + Math.cos(a) * d * 1.3, 0.012, z + Math.sin(a) * d * 0.7), q, sc); chips.setMatrixAt(k++, m4); }
    scene.add(chips); }
  { const wd = toon('#a87a4a'), wdD = toon('#6b4a2c'), straw = toon('#d9b45a');
    const br = new THREE.Group(); br.position.set(-9.6, 0, -3.4); br.rotation.z = 0.22; scene.add(br); M(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 6), wd, 0, 0.95, 0, br, 0.005); M(new THREE.BoxGeometry(0.1, 0.3, 0.42), straw, 0, 0.15, 0, br, 0.008);
    for (const z of [0.6, 2.0]) { const sh = new THREE.Group(); sh.position.set(-9.0, 0, z); scene.add(sh); M(new THREE.BoxGeometry(0.12, 0.1, 1.0), wd, 0, 0.72, 0, sh, 0.008).rotation.x = Math.PI / 2 * 0; for (const dz of [-0.4, 0.4]) for (const s2 of [-1, 1]) { const lg = M(new THREE.BoxGeometry(0.06, 0.78, 0.06), wdD, s2 * 0.16, 0.36, dz, sh, 0.005); lg.rotation.z = s2 * 0.22; } }
    for (let i = 0; i < 3; i++) M(new THREE.BoxGeometry(0.16, 0.05, 2.0), toon(['#d2a86a', '#c99a5e', '#e8c48a'][i]), -9.0 - 0.18 + i * 0.18, 0.8 + (i % 2) * 0.05, 1.3, scene, 0.006);
    Y.colliders.push([-9.4, 0.0, -8.6, 2.6]);
    const mug = M(new THREE.CylinderGeometry(0.06, 0.055, 0.12, 12), toon('#2f6b45'), 3.75, 1.14 + 0.06, 2.75, scene, 0.006); M(new THREE.TorusGeometry(0.035, 0.012, 6, 10), toon('#2f6b45'), 3.82, 1.2, 2.75, scene, 0).rotation.y = Math.PI / 2;
    const spike = M(new THREE.CylinderGeometry(0.008, 0.008, 0.2, 4), toon('#9aa3a8'), 5.6, 1.18 + 0.1, 2.5, scene, 0); for (let i = 0; i < 3; i++) M(new THREE.BoxGeometry(0.14, 0.004, 0.1), toon('#fbf8ec'), 5.6, 1.13 + i * 0.03, 2.5, scene, 0).rotation.y = i * 0.5;
    const cart = new THREE.Group(); cart.position.set(12.4, 0, 0.6); scene.add(cart); M(new THREE.BoxGeometry(2.2, 0.15, 1.1), wd, 0, 0.6, 0, cart, 0.01); for (const s2 of [-1, 1]) { M(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 14), wdD, 0, 0.4, s2 * 0.6, cart, 0.01).rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(2.2, 0.3, 0.06), wd, 0, 0.8, s2 * 0.52, cart, 0.006); }
    for (let i = 0; i < 4; i++) M(new THREE.CylinderGeometry(0.17, 0.17, 2.0, 10), toon(['#6e5c49', '#7a4a2e', '#efebe2', '#5f574d'][i]), 0, 0.84 + Math.floor(i / 3) * 0.3, -0.3 + (i % 3) * 0.3, cart, 0.012).rotation.z = Math.PI / 2; }
  const boardCv = document.createElement('canvas'); boardCv.width = 512; boardCv.height = 340; const boardTex = new THREE.CanvasTexture(boardCv); boardTex.colorSpace = THREE.SRGBColorSpace;
  { const fr = new THREE.Group(); fr.position.set(9.93, 2.3, 4.3); fr.rotation.y = -Math.PI / 2; Y.walls.east.add(fr); M(new THREE.BoxGeometry(2.25, 1.55, 0.06), toon('#6b4a2c'), 0, 0, -0.02, fr, 0.01); const b = new THREE.Mesh(new THREE.PlaneGeometry(2.05, 1.36), new THREE.MeshBasicMaterial({ map: boardTex })); b.position.z = 0.02; fr.add(b); M(new THREE.BoxGeometry(2.1, 0.06, 0.12), toon('#6b4a2c'), 0, -0.74, 0.05, fr, 0.006); M(new THREE.BoxGeometry(0.12, 0.04, 0.04), toon('#fbf8ec'), 0.6, -0.69, 0.08, fr, 0); }
  let boardKey = '';
  function drawBoard() { const key = S.day + '|' + S.phase + '|' + (J ? J.item : '') + '|' + (S.log || []).map(l => l.who + l.stars).join(','); if (key === boardKey) return; boardKey = key; const c = boardCv.getContext('2d');
    c.fillStyle = '#25302a'; c.fillRect(0, 0, 512, 340); c.fillStyle = 'rgba(255,255,255,0.04)'; for (let i = 0; i < 30; i++) c.fillRect((i * 97) % 512, (i * 53) % 340, 60, 4);
    c.fillStyle = '#f2ecd8'; c.font = '700 34px "Archivo", Arial'; c.fillText("TODAY'S ORDERS", 26, 54); c.font = '600 22px "Archivo", Arial'; c.fillStyle = '#ffd23a'; c.fillText('DAY ' + S.day, 400, 54); c.fillStyle = '#f2ecd8'; c.fillRect(26, 68, 460, 3);
    const L = (S.log || []).slice(); for (let i = 0; i < MILL.perDay; i++) { const y = 120 + i * 62, l = L[i]; c.font = '700 28px "Archivo", Arial';
      if (l) { c.fillStyle = '#9fe0a8'; c.fillText('✓ ' + l.who + ' · ' + l.item, 30, y); c.fillStyle = '#ffd23a'; c.fillText('★'.repeat(l.stars) + '☆'.repeat(3 - l.stars), 380, y); }
      else if (i === L.length && J && (S.phase === 'arrive' || S.phase === 'order' || S.phase === 'work' || S.phase === 'react')) { c.fillStyle = '#ffffff'; c.fillText('➤ ' + J.who + ' · ' + ITEMS[J.item].name, 30, y); }
      else { c.fillStyle = 'rgba(242,236,216,0.35)'; c.fillText('·  ·  ·', 30, y); } }
    c.font = 'italic 600 20px "Archivo", Arial'; c.fillStyle = 'rgba(242,236,216,0.7)'; c.fillText('Measure twice, cut once. — C.', 26, 318); boardTex.needsUpdate = true; }

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), orderN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, flash: null, flashT: 0, say: '', sayT: 0, hold: null, ptr: null, react: null, done: null, t: 0, phT: 0, confirm: 0, travel: null, seen: {}, cut: null, buck: null, rip: null, ripDone: false, tear: 0, warnT: 0 };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  let P = null, J = null, cust = null, lastItem = null;
  const wp = o => o.getWorldPosition(new THREE.Vector3());
  const pool = d => d <= 1 ? ['legs', 'posts', 'strut', 'posts'] : d <= 2 ? ['legs', 'posts', 'strut', 'planks', 'handle', 'sign'] : IK;
  function newJob() { const d = S.day; let key = S.forceItem; if (!key) { const pl = pool(d).filter(k => k !== lastItem); key = pick(pl); } lastItem = key; const I = ITEMS[key];
    const want = Math.round(rr(I.len[0], I.len[1]) * 20) / 20, tasks = I.tasks.slice(), stain = pick(SK);
    const gN = I.grooves ? Math.min(4, I.grooves + (d >= 4 ? 1 : 0)) : 0;
    return { item: key, who: I.who, role: I.role, wood: I.wood, want, L0: tasks.includes('buck') ? Math.round((want + rr(0.55, 0.85)) * 100) / 100 : want, tasks, stain, barked: true, day: d, line: I.line,
      ripA: (0.028 + 0.009 * Math.min(d, 5)) * (key === 'strut' ? 0.6 : 1), ripK: rr(2.0, 3.0), ripP: rr(0, 6), gN, tol: d <= 1 ? 0.05 : d <= 3 ? 0.035 : 0.026 }; }
  const label = id => id === 'plane' && J && (ITEMS[J.item].rT) ? 'SAND' : TASKS[id].label;

  // ---------- task progress ----------
  function info(id) { if (!P || !J) return { done: false, q: 0, prog: 0, txt: '' };
    if (id === 'debark') { const n = P.strips.length, l = P.barkLeft(); return { done: !P.bark || !l, q: 1, prog: n ? 1 - l / n : 1, txt: !P.bark || !l ? 'DONE' : l + ' LEFT' }; }
    if (id === 'buck') { const c = S.cut; return { done: !!c, q: c ? c.q : 0, prog: c ? 1 : 0, txt: c ? 'DONE' : J.want.toFixed(2) + ' m' }; }
    if (id === 'rip') { const R = S.rip; return { done: S.ripDone, q: S.ripQ || 0, prog: S.ripDone ? 1 : R ? R.u / P.len : 0, txt: S.ripDone ? 'DONE' : R ? Math.round(R.u / P.len * 100) + '%' : 'READY' }; }
    if (id === 'turn') { const G = P.grooves, l = G.filter(g => !g.done).length; return { done: G.length > 0 && !l, q: G.length ? G.reduce((s, g) => s + (g.done ? g.q : 0), 0) / G.length : 0, prog: G.length ? (G.length - l) / G.length : 0, txt: !G.length ? J.gN + ' RINGS' : l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'plane') { const pt = P.patches, l = pt.filter(p => p.rough > 0).length; return { done: S.planeOn && !l, q: Math.max(0.5, 1 - S.tear * 0.12), prog: pt.length ? (pt.length - l) / pt.length : 0, txt: !S.planeOn ? 'READY' : l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'stain') { const c = P.cover.filter(v => v >= 1).length, ok = P.cover.filter((v, i) => v >= 1 && P.col[i] === J.stain).length; return { done: c === 4, q: ok / 4, prog: c / 4, txt: c === 4 ? (ok === 4 ? 'DONE' : 'WRONG STAIN') : c + ' / 4' }; }
    return { done: true, q: 1, prog: 1, txt: '' }; }
  const allDone = () => J && J.tasks.every(t => info(t).done);
  const nextTask = () => J && J.tasks.find(t => !info(t).done);
  const locked = id => { if (!J) return true; const i = J.tasks.indexOf(id); return J.tasks.slice(0, i).some(t => !info(t).done); };

  // ---------- where the piece sits at each station ----------
  const SN = Y.stations;
  function pose(T) { const h = P.halfH();
    if (T === 'deck') return { p: V3(SN.X_DECK, 0.62 + P.r, SN.Z0), ry: Math.PI / 2 };
    if (T === 'debark') return { p: V3(SN.X_DEB, SN.H_DEB + P.r * 0.92 + (P.bark ? 0.02 : 0), SN.Z0), ry: 0 };
    if (T === 'buck') { const XL = S.buck ? S.buck.XL : SN.X_CUT - 1; return { p: V3(XL + P.len / 2, SN.H_CUT + P.r + (P.bark && P.barkLeft() ? 0.028 : 0), SN.Z0), ry: 0 }; }
    if (T === 'rip') { const R = S.rip || { u: 0, c: 0 }; return { p: V3(SN.X_BS + P.len / 2 - R.u, SN.H_BS + h + (P.bark && P.barkLeft() ? 0.028 : 0), SN.Z0 + R.c), ry: 0 }; }
    if (T === 'turn') return { p: V3(SN.X_LATHE - 0.1, SN.H_LATHE, SN.Z0), ry: 0 };
    if (T === 'plane') return { p: V3(SN.PLANE.x, SN.H_PLANE + h, SN.PLANE.z), ry: 0 };
    if (T === 'stain') return { p: V3(SN.FINISH.x, SN.H_FIN + h + 0.04, SN.FINISH.z + 0.1), ry: 0 };
    return { p: V3(SN.COUNTER.x, SN.H_CTR + 0.08 + h, SN.COUNTER.z), ry: 0 }; }
  function travelTo(T, dur = 1.0) { const a = { p: P.g.position.clone(), ry: P.g.rotation.y }, b = pose(T); S.travel = { a, b, t: 0, dur, T }; S.ptr = null; S.hold = null; hideTools(); SFX.whoosh(); tone(330, 0.12, 0.03, 'sine'); }
  const hideTools = () => { for (const k of ['knife', 'plane', 'brush']) tool[k].visible = false; };

  // ---------- prepare each task (before the piece travels there) ----------
  function prepare(T) {
    if (T === 'buck') { const start = clamp(J.want - 0.5, 0.45, P.len - 0.3); S.buck = { XL: SN.X_CUT - start, drag: false }; }
    if (T === 'rip') { S.rip = { u: 0, c: 0, on: 0, near: 0, n: 0, tick: 0, hold: false }; S.ripDone = false; if (P.kerf) P.core.remove(P.kerf.mesh); P.kerf = kerfStrip(ST, P); P.core.add(P.kerf.mesh); }
    if (T === 'plane') { S.planeOn = true; S.tear = 0; const n = Math.min(4, 2 + (S.day >= 3 ? 1 : 0) + (P.len > 1.6 ? 1 : 0)), round = P.shape === 'round' || P.shape === 'log', a = round ? 0.62 : 0, top = round ? P.r : P.halfH();
      P.patches.forEach(p => P.core.remove(p.m)); P.patches = [];
      for (let i = 0; i < n; i++) { const x = -P.len / 2 + P.len * (0.18 + 0.64 * (n > 1 ? i / (n - 1) : 0.5)) + rr(-0.06, 0.06), m = new THREE.Mesh(new THREE.PlaneGeometry(0.34, round ? 0.14 : Math.min(0.26, (P.bw || P.side || 0.3) * 0.8)), new THREE.MeshBasicMaterial({ map: TX.rough, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }));
        m.rotation.x = a - Math.PI / 2; m.position.set(x, Math.cos(a) * (top + 0.004), Math.sin(a) * (top + 0.004)); m.renderOrder = 4; P.core.add(m); P.patches.push({ m, x, rough: 1 }); } }
    if (T === 'turn') roughRound();
  }
  function roughRound() { const I = ITEMS[J.item]; if (P.shape === 'round' && P.grooves.length) return;
    const was = P.shape; if (P.bark && P.barkLeft()) { P.strips.filter(s => s.parent === P.core).forEach(s => P.peel(s)); }
    P.shape = 'round'; P.bark = false; P.r = I.rT || P.r * 0.55; P.grooves = []; const n = J.gN; for (let i = 0; i < n; i++) P.grooves.push({ x: -P.len / 2 + P.len * (n === 1 ? 0.5 : 0.2 + 0.6 * i / (n - 1)), v: 0, done: false, q: 0 });
    if (P.kerf) { P.core.remove(P.kerf.mesh); P.kerf = null; } P.rebuild();
    if (P.rings) P.rings.forEach(r => P.g.remove(r)); P.rings = P.grooves.map(G => { const r = new THREE.Mesh(new THREE.TorusGeometry(P.r + 0.02, 0.012, 6, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a })); r.rotation.y = Math.PI / 2; r.position.x = G.x; P.g.add(r); G.ring = r; return r; });
    for (let i = 0; i < 6; i++) puff(P.g.position.x + rr(-P.len / 2, P.len / 2), P.g.position.y, P.g.position.z + 0.2, 0xf2dcaa, 1); if (was !== 'round') flash('ROUGHED ROUND · NOW CUT THE RINGS', '#ffffff', 1.6); }

  // ---------- the six jobs ----------
  const scaleK = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const castAt = (x, y, list) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObjects(list, false)[0] || null; };
  const planeAt = (x, y, h) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), -h), o = new THREE.Vector3(); return ray.ray.intersectPlane(pl, o) ? o : null; };
  // DEBARK
  function peelAt(x, y) { const live = P.strips.filter(s => s.parent === P.core); const h = castAt(x, y, live); if (!h) return false; const s = h.object; peelStrip(s, h.point); return true; }
  function peelStrip(s, pt) { if (!P.peel(s)) return; SFX.peel(); audio.burst && audio.burst(0.07, 2600, 0.09); fling(pt || wp(s), P.W.bark, 2, 1.2);
    if (upg('knife')) { const nb = P.strips.find(q => q.parent === P.core && q.userData.ring === s.userData.ring && Math.abs(((q.userData.j - s.userData.j + 6) % 6)) === 1); if (nb) P.peel(nb); }
    if (!P.barkLeft()) { P.bark = false; } checkDone(); }
  // CUT (buck)
  const buckLen = () => SN.X_CUT - S.buck.XL;
  function doCut() { const len = buckLen(), err = Math.abs(len - J.want), tol = J.tol * (upg('laser') ? 2 : 1);
    if (err > 0.3) { flash('LINE THE END UP WITH THE YELLOW FLAG · ' + J.want.toFixed(2) + ' m', '#ffffff', 1.8); SFX.nope(); return; }
    const q = err <= tol ? 1 : err <= tol * 2.5 ? 0.75 : 0.5; S.cut = { q, len, err }; S.cutAnim = 0.01;
    flash(q === 1 ? 'PERFECT CUT · ' + len.toFixed(2) + ' m' : (len > J.want ? 'A BIT LONG · ' : 'A BIT SHORT · ') + len.toFixed(2) + ' m', q === 1 ? '#22c55e' : q > 0.6 ? '#e6b45a' : '#ec3013', 1.6);
    SFX.cutoff(); buzz(40);
    // the offcut drops into the scrap bin
    const off = new THREE.Group(), oL = P.len - len; const bk = P.bark && P.barkLeft(); M(new THREE.CylinderGeometry(P.r + (bk ? 0.028 : 0), P.r + (bk ? 0.028 : 0), oL, 14).rotateZ(-Math.PI / 2), bk ? P.barkM : P.mats[3], 0, 0, 0, off, 0.012); off.position.set(SN.X_CUT + oL / 2 + 0.01, P.g.position.y, SN.Z0); scene.add(off); offcuts.push({ g: off, t: 0, v: V3(0.6, 1.2, 1.4), life: 3 });
    for (let i = 0; i < 8; i++) puff(SN.X_CUT, SN.H_CUT + P.r, SN.Z0 + rr(-0.2, 0.2), 0xf2dcaa, 1);
    P.len = len; P.rebuild(); P.g.position.x = SN.X_CUT - len / 2; checkDone(); }
  // SAW (rip)
  function ripStep(dt) { const R = S.rip; if (!R || S.ripDone) return; if (!R.hold) return; const v = 0.34 * (upg('fence') ? 1.1 : 1); R.u = Math.min(P.len, R.u + v * dt);
    if (upg('fence')) { const want = -lineF(J, R.u); R.c += (want - R.c) * Math.min(1, dt * 1.3); }
    const e = Math.abs(R.c + lineF(J, R.u)), on = e < 0.022, near = e < 0.05; R.n++; if (on) R.on++; else if (near) R.near++;
    P.kerf && P.kerf.mark(R.u, -R.c, on ? '#22c55e' : near ? '#e6b45a' : '#ec3013');
    R.tick -= dt; if (R.tick <= 0) { R.tick = 0.09; if (on && Math.random() < 0.35) SFX.lineTick(); fling(V3(SN.X_BS, SN.H_BS + P.halfH() * 2, SN.Z0 + 0.1), '#f2dcaa', 1, 0.8); puff(SN.X_BS, SN.H_BS + P.halfH() * 2, SN.Z0 + 0.12, 0xf2dcaa, 1); } R.lastE = e; R.state = on ? 'on' : near ? 'near' : 'off';
    if (R.u >= P.len) finishRip(); }
  function finishRip() { const R = S.rip, pct = R.n ? (R.on + R.near * 0.5) / R.n : 1; S.ripQ = pct >= 0.9 ? 1 : pct >= 0.7 ? 0.8 : pct >= 0.5 ? 0.6 : 0.45; S.ripDone = true; R.hold = false; S.ripPct = Math.round(pct * 100);
    const I = ITEMS[J.item]; // slabs fall off both sides, then the piece is square
    for (const s of [-1, 1]) { const off = new THREE.Group(); M(new THREE.CylinderGeometry(P.r, P.r, P.len, 12, 1, false, s > 0 ? 0 : Math.PI, Math.PI).rotateZ(-Math.PI / 2).rotateX(Math.PI / 2), P.bark && P.barkLeft() ? P.barkM : P.mats[1], 0, 0, s * 0.02, off, 0.01); off.position.copy(P.g.position); off.scale.set(1, 1, 0.35); scene.add(off); offcuts.push({ g: off, t: 0, v: V3(-0.3, 0.8, s * 1.4), life: 2.4 }); }
    P.shape = I.after || 'post'; P.bark = false; P.side = P.r * 1.42; P.bw = P.r * (P.shape === 'boards' ? 1.6 : 1.5); P.bt = P.shape === 'boards' ? 0.065 : 0.075; P.kerf && P.core.remove(P.kerf.mesh); const K = P.kerf; P.kerf = null; P.rebuild();
    if (K) { P.kerf = kerfStrip(ST, P); P.kerf.c.clearRect(0, 0, 96, 512); P.kerf.c.drawImage(K.cv, 0, 0); P.kerf.tex.needsUpdate = true; P.core.add(P.kerf.mesh); }
    SFX.slabs(); flash((S.ripQ >= 1 ? 'DEAD STRAIGHT · ' : S.ripQ >= 0.8 ? 'NICE AND TRUE · ' : 'A BIT WOBBLY · ') + S.ripPct + '% ON THE LINE', S.ripQ >= 0.8 ? '#22c55e' : '#e6b45a', 1.8); tone(880, 0.12, 0.05); checkDone(); }
  // TURN
  const turnZone = v => { const g = upg('gouge') ? [0.4, 0.8] : TURN; return v < g[0] ? 'TOO SHALLOW' : v <= g[1] ? 'JUST RIGHT' : v < 1 ? 'TOO DEEP' : 'CHIPPED'; };
  function grooveAt(x, y) { const open = P.grooves.filter(G => !G.done); if (!open.length) return null; let best = null, bd = 1e9; for (const G of open) { const s = scr(wp(G.ring)), d = Math.abs(s.x - x) + Math.abs(s.y - y) * 0.3; if (d < bd) { bd = d; best = G; } } return best; }
  function startTurn(G) { S.hold = { G, v: G.v, green: false }; tool.chisel.visible = true; SFX.click(); }
  function releaseTurn() { const H = S.hold; if (!H) return; S.hold = null; const G = H.G, z = turnZone(G.v);
    if (z === 'TOO SHALLOW') { flash('A BIT DEEPER · HOLD AGAIN', '#ffffff', 1.1); SFX.click(); return; }
    G.done = true; G.q = z === 'JUST RIGHT' ? 1 : z === 'TOO DEEP' ? 0.65 : 0.4; if (z === 'JUST RIGHT') SFX.chime(2); else if (z === 'CHIPPED') { SFX.chip(); buzz(60); } else SFX.nope(); buzz(20); G.ring.visible = false; flash(z === 'JUST RIGHT' ? 'CLEAN GROOVE!' : z === 'TOO DEEP' ? 'TOO DEEP · IT WILL DO' : 'CHIPPED IT!', z === 'JUST RIGHT' ? '#22c55e' : z === 'TOO DEEP' ? '#e6b45a' : '#ec3013', 1.2); tone(z === 'JUST RIGHT' ? 1320 : 440, 0.1, 0.05); checkDone(); }
  // PLANE / SAND
  function rubAt(x, y, dx, dy, sx = dx, sy = dy) { const h = castAt(x, y, P.hit); if (!h) { tool.plane.visible = false; return; } tool.plane.visible = true; tool.plane.position.copy(h.point).add(V3(0, 0.03, 0)); const lp = P.core.worldToLocal(h.point.clone());
    const cross = Math.abs(sy) > Math.abs(sx) * 1.4 && Math.hypot(sx, sy) > 14; let hitPatch = false;
    for (const pt of P.patches) { if (pt.rough <= 0 || Math.abs(lp.x - pt.x) > 0.24) continue; hitPatch = true;
      if (cross) { if (performance.now() - S.warnT > 700) { S.warnT = performance.now(); S.tear++; SFX.tear(); buzz(50); flash('ACROSS THE GRAIN TEARS IT · GO LEFT ⟷ RIGHT', '#ec3013', 1.4); tone(200, 0.15, 0.05, 'sawtooth'); fling(h.point, '#a87a4a', 2); } continue; }
      pt.rough = Math.max(0, pt.rough - Math.abs(dx) / 300); SFX.plane(Math.abs(dx)); pt.m.material.opacity = pt.rough; if (Math.random() < 0.5) fling(h.point, '#f2dcaa', 1, 1.3); if (Math.random() < 0.3) audio.burst && audio.burst(0.06, 4200, 0.05);
      if (pt.rough <= 0) { pt.m.visible = false; flash('SMOOTH ✓', '#22c55e', 0.8); SFX.smooth(); if (P.patches.every(p => p.rough <= 0) && P.kerf) { P.core.remove(P.kerf.mesh); P.kerf = null; } checkDone(); } }
    return hitPatch; }
  // STAIN
  function stainAt(x, y, d) { const h = castAt(x, y, P.hit); if (!h) { tool.brush.visible = false; return; } tool.brush.visible = true; tool.brush.position.copy(h.point).add(V3(0, 0.05, 0)); stainSec(h.object.userData.sec, d, h.point); }
  function stainSec(i, d, pt) { if (P.col[i] !== S.brush) { P.col[i] = S.brush; P.cover[i] = 0; P.from = null; }
    if (P.cover[i] >= 1) return; P.cover[i] = Math.min(1, P.cover[i] + d / 260); P.setStain(i, STAINS[S.brush].col, P.cover[i]); SFX.brush(d); if (Math.random() < 0.2) tone(500 + Math.random() * 200, 0.03, 0.02, 'sine');
    if (P.cover[i] >= 1) { tone(880, 0.06, 0.04); pt && puff(pt.x, pt.y + 0.05, pt.z, 0xffffff, 1); checkDone(); } }
  function setBrush(k) { if (!STAINS[k] || !J) return; S.brush = k; SFX.dip(); tool.bristle.material = toon(STAINS[k].col); flash('BRUSH · ' + STAINS[k].name + (k === J.stain ? '' : ' · ORDER SAYS ' + STAINS[J.stain].name), k === J.stain ? '#22c55e' : '#e6b45a', 1.3); }
  function brandOn() { if (P.brand) return; const round = P.shape === 'round' || P.shape === 'log', a = round ? 0.62 : 0, top = round ? P.r : P.halfH(), s = Math.min(0.22, (round ? P.r * 1.6 : (P.bw || P.side || 0.3) * 0.8));
    const m = new THREE.Mesh(new THREE.PlaneGeometry(s, s), new THREE.MeshBasicMaterial({ map: TX.brand, transparent: true, opacity: 0, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })); m.rotation.x = a - Math.PI / 2; m.position.set(P.len * 0.3, Math.cos(a) * (top + 0.005), Math.sin(a) * (top + 0.005)); m.renderOrder = 5; P.core.add(m); P.brand = m; m.userData.fade = 1; SFX.brand(); for (let i = 0; i < 5; i++) puff(wp(m).x, wp(m).y + 0.05, wp(m).z, 0x9a9a9a, 1); tone(180, 0.4, 0.04, 'sawtooth'); }

  function checkDone() { if (!J) return; for (const t of J.tasks) { const I = info(t); if (I.done && !S.seen[t]) { S.seen[t] = 1; if (t === 'stain') brandOn();
        flash(label(t) + ' DONE ✓', '#22c55e', 1.3); SFX.done(); buzz(25); setTimeout(() => tone(1568, 0.14, 0.05), 110); for (let i = 0; i < 6; i++) puff(P.g.position.x + rr(-0.8, 0.8), P.g.position.y + rr(0.2, 0.6), P.g.position.z + 0.3, 0xffe7a0, 1);
        S.ptr = null; S.advT = 1.0; } } }
  function advance() { const nx = nextTask(); hideTools(); tool.chisel.visible = false; if (nx) { S.tool = nx; prepare(nx); travelTo(nx, 1.1); } else { S.tool = null; travelTo('counter', 1.3); say('CEDAR: "Fine work. Hand it over to ' + J.who + '!"', 4); } }
  function setTool(id) { if (S.phase !== 'work' || !J || !J.tasks.includes(id)) return; if (info(id).done) { flash(label(id) + ' IS ALREADY DONE', '#ffffff', 1); return; } if (locked(id)) { SFX.nope(); const f = J.tasks.find(t => !info(t).done); flash(label(f) + ' FIRST · IT\'S A LINE', '#e6b45a', 1.4); return; } if (S.tool === id) return; SFX.click(); S.tool = id; prepare(id); travelTo(id); }

  // ---------- input ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const zAxis = () => { const y = SN.H_BS + P.halfH() * 2, a = scr(V3(SN.X_BS, y, SN.Z0)), b = scr(V3(SN.X_BS, y, SN.Z0 + 0.2)); let sx = (b.x - a.x) / 0.2, sy = (b.y - a.y) / 0.2; const l = Math.hypot(sx, sy); if (l < 40) { sx *= 40 / Math.max(l, 1e-3); sy *= 40 / Math.max(l, 1e-3); } return { sx, sy }; };
  const moveKnife = (x, y) => { const h = castAt(x, y, P.hit.concat(P.strips.filter(s => s.parent === P.core))); if (h) { tool.knife.visible = true; tool.knife.position.copy(h.point).add(V3(0, 0.06, 0.04)); } };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); const { x, y } = local(e);
    if (S.phase === 'walk') { W.drag = { x, y, id: e.pointerId }; W.dragT = performance.now(); return; }
    if (DM.on || S.phase !== 'work' || !P || S.travel || S.hold || !S.tool || info(S.tool).done) return; e.preventDefault(); const T = S.tool; S.ptr = { x, y, kind: T };
    if (T === 'debark') { moveKnife(x, y); peelAt(x, y); }
    else if (T === 'buck') { const w = planeAt(x, y, SN.H_CUT + P.r); S.ptr.wx = w ? w.x : null; S.buck.drag = true; tone(300, 0.05, 0.03, 'square'); }
    else if (T === 'rip') { S.rip.hold = true; }
    else if (T === 'turn') { const G = grooveAt(x, y); if (G) startTurn(G); S.ptr.kind = null; }
    else if (T === 'plane') rubAt(x, y, 0, 0);
    else if (T === 'stain') { if (!S.brush) { flash('PICK A STAIN BELOW', '#ffffff', 1.2); S.ptr = null; return; } stainAt(x, y, 20); } }
  function onMove(e) { const { x, y } = local(e);
    if (S.phase === 'walk') { if (W.drag && W.drag.id === e.pointerId) { lookBy(x - W.drag.x, y - W.drag.y); W.drag.x = x; W.drag.y = y; } return; }
    const Pt = S.ptr; if (!Pt || !Pt.kind || !P) return; const dx = x - Pt.x, dy = y - Pt.y, d = Math.hypot(dx, dy); if (d < 1) return;
    if (Pt.kind === 'debark') { const n = Math.ceil(d / 10); for (let i = 1; i <= n; i++) peelAt(Pt.x + dx * i / n, Pt.y + dy * i / n); moveKnife(x, y); }
    else if (Pt.kind === 'buck') { const w = planeAt(x, y, SN.H_CUT + P.r); if (w && Pt.wx != null) { const before = S.buck.XL; S.buck.XL = clamp(S.buck.XL + (w.x - Pt.wx), SN.X_CUT - P.len + 0.12, SN.X_CUT - 0.35); const e = Math.abs(buckLen() - J.want), tol = J.tol * (upg('laser') ? 2 : 1); SFX.near(Math.min(1, e / 0.6)); if (e <= tol && !S.onMark) { S.onMark = 1; SFX.onMark(); buzz(15); } else if (e > tol * 1.5) S.onMark = 0; } if (w) Pt.wx = w.x; }
    else if (Pt.kind === 'rip') { const R = S.rip, A = zAxis(); R.c = clamp(R.c + (dx * A.sx + dy * A.sy) / (A.sx * A.sx + A.sy * A.sy), -0.22, 0.22); }
    else if (Pt.kind === 'plane') { Pt.sx = (Pt.sx || 0) * 0.75 + dx; Pt.sy = (Pt.sy || 0) * 0.75 + dy; rubAt(x, y, dx, dy, Pt.sx, Pt.sy); }
    else if (Pt.kind === 'stain') stainAt(x, y, d);
    Pt.x = x; Pt.y = y; }
  function onUp(e) { if (W.drag && (!e || W.drag.id === e.pointerId)) W.drag = null; const Pt = S.ptr; S.ptr = null; if (S.hold) releaseTurn(); tool.chisel.visible = !!S.hold; if (!Pt) return;
    if (Pt.kind === 'buck' && S.buck && S.buck.drag) { S.buck.drag = false; if (!S.cut) doCut(); }
    if (Pt.kind === 'rip' && S.rip) S.rip.hold = false; hideTools(); }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- WALK MODE (standard Game HUD contract) ----------
  const W = { x: sp.walkStart.x, z: sp.walkStart.z, face: Math.PI, spd: 0, stick: { x: 0, y: 0 }, keys: new Set(), yaw: Math.PI, pitch: 0.58, dist: 7.5, drag: null, dragT: 0, dlg: null, toast: null, toastT: 0, swing: 0, wood: 0, pov: false };
  const DLG = CEDAR_TALK;
  const dist2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
  const near = () => { const me = { x: W.x, z: W.z }; if (dist2(me, cedar.position) < 2.5) return 'cedar'; if (dist2(me, sp.chop) < 1.7) return 'chop'; if (dist2(me, sp.whistle) < 1.9) return 'whistle'; return null; };
  function wToast(t, s = 2.6) { W.toast = t; W.toastT = s; }
  function enterWalk() { if (DM.on) return; audio.init && audio.init(); S.phase = 'walk'; S.done = null; ben.visible = true; W.x = sp.walkStart.x; W.z = sp.walkStart.z; W.face = Math.PI; W.yaw = Math.PI; place(ben, W, W.face); place(cedar, sp.benCounter, 0); setUniform(true); wToast('Walk around the mill. Talk to CEDAR at the counter when you want to work.', 4); }
  function talk() { if (S.phase !== 'walk') return; if (W.dlg) { nextLine(); return; } const n = near(); if (n === 'cedar') { W.dlg = { key: 'hello', i: 0 }; cedar.userData.talking = true; SFX.click(); } else if (n === 'chop') melee(); else if (n === 'whistle') range(); }
  function nextLine() { const D = W.dlg; if (!D) return; if (D.key === 'hello') return; D.i++; if (D.i >= DLG[D.key].length) W.dlg = { key: 'hello', i: 0 }; }
  function choose(i) { const D = W.dlg; if (!D || D.key !== 'hello') return; const c = DLG.hello.choices[i]; if (!c) return; if (c[1] === 'bye') return closeDialog(); if (c[1] === 'work') { closeDialog(); toIntro(); return; } W.dlg = { key: c[1], i: 0 }; }
  function closeDialog() { W.dlg = null; cedar.userData.talking = false; }
  function melee() { if (S.phase !== 'walk' || W.swing > 0) return; W.swing = 0.5; SFX.swing(); const n = near(); if (n === 'chop') { Y.axe.visible = false; setTimeout(() => { if (S.phase !== 'walk') return; W.wood++; SFX.chop(); buzz(30); const p = V3(sp.chop.x, 0.75, sp.chop.z); for (let i = 0; i < 2; i++) fling(p, '#c99a5e', 2, 1.4); audio.burst && audio.burst(0.12, 1800, 0.18); tone(140, 0.12, 0.05, 'square'); wToast('SPLIT! FIREWOOD × ' + W.wood + (W.wood === 5 ? ' · CEDAR: "Keep that up and the stove will love you."' : ''), 2.2); }, 230); setTimeout(() => { Y.axe.visible = true; }, 520); } else { audio.burst && audio.burst(0.08, 900, 0.06); } }
  function range() { if (S.phase !== 'walk') return; const n = near(); if (n === 'whistle') { W.steam = 1.6; SFX.millWhistle(); wToast('WHOOOO! · CEDAR: "Lunch already?"', 2.4); } else { SFX.whistleTune(); wToast('Ben whistles a little Nebo tune.', 1.6); } }
  function jump() { if (S.phase !== 'walk') return; if (!(ben.userData.hop > 0)) { ben.userData.hop = 1; SFX.hop(); } }
  function lookBy(dx, dy) { W.yaw -= dx * 0.008; W.pitch = clamp(W.pitch + dy * 0.004, 0.12, 1.1); W.dragT = performance.now(); }
  function walkStep(dt) { const k = W.keys; let sx = W.stick.x + ((k.has('KeyD') || k.has('ArrowRight')) ? 1 : 0) - ((k.has('KeyA') || k.has('ArrowLeft')) ? 1 : 0), sy = W.stick.y + ((k.has('KeyW') || k.has('ArrowUp')) ? 1 : 0) - ((k.has('KeyS') || k.has('ArrowDown')) ? 1 : 0); const m = Math.hypot(sx, sy); if (m > 1) { sx /= m; sy /= m; }
    if (W.dlg) { sx = sy = 0; } const fx = -Math.sin(W.yaw), fz = Math.cos(W.yaw), rx = -Math.cos(W.yaw), rz = -Math.sin(W.yaw); let vx = (rx * sx + fx * sy) * 4.2, vz = (rz * sx + fz * sy) * 4.2; W.spd = Math.hypot(vx, vz);
    let nx = W.x + vx * dt, nz = W.z + vz * dt; const R = 0.36; nx = clamp(nx, BOX.x0, BOX.x1); nz = clamp(nz, BOX.z0, BOX.z1);
    for (const [x0, z0, x1, z1] of Y.colliders) { const cx = clamp(nx, x0, x1), cz = clamp(nz, z0, z1), d = Math.hypot(nx - cx, nz - cz); if (d < R) { if (d > 1e-4) { nx = cx + (nx - cx) / d * R; nz = cz + (nz - cz) / d * R; } else { nx = W.x; nz = W.z; } } }
    { const c = cedar.position, d = Math.hypot(nx - c.x, nz - c.z); if (d < 0.7 && d > 1e-3) { nx = c.x + (nx - c.x) / d * 0.7; nz = c.z + (nz - c.z) / d * 0.7; } }
    W.x = nx; W.z = nz; if (W.spd > 0.3) { let df = Math.atan2(vx, vz) - W.face; df = Math.atan2(Math.sin(df), Math.cos(df)); W.face += df * Math.min(1, dt * 12); if (performance.now() - W.dragT > 1200) { let dy = -W.face - W.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); W.yaw += dy * Math.min(1, dt * 1.2) * Math.min(1, W.spd / 4); } }
    ben.position.set(W.x, 0, W.z); ben.rotation.y = W.face; kit.animFox(ben, dt, W.spd); { const ph = Math.floor((ben.userData.phase || 0) / Math.PI); if (W.spd > 0.5 && ph !== W.lastPh) SFX.step(ph); W.lastPh = ph; }
    if (W.swing > 0) { W.swing = Math.max(0, W.swing - dt); const k2 = Math.sin((1 - W.swing / 0.5) * Math.PI); BP.arms[1].rotation.x = -2.6 * k2; BP.arms[0].rotation.x = -2.4 * k2; }
    if (W.steam > 0) { W.steam -= dt; if (Math.random() < dt * 30) puff(sp.whistle.x + rr(-0.1, 0.1), 4.9, sp.whistle.z + 0.1, 0xffffff, 1); }
    if (W.dlg) { let df = Math.atan2(cedar.position.x - W.x, cedar.position.z - W.z) - W.face; df = Math.atan2(Math.sin(df), Math.cos(df)); W.face += df * Math.min(1, dt * 6); cedar.rotation.y = Math.atan2(W.x - cedar.position.x, W.z - cedar.position.z); } else cedar.rotation.y = damp(cedar.rotation.y, 0, 3, dt);
    W.toastT -= dt; if (W.toastT <= 0) W.toast = null;
    const tgt = V3(W.x, 1.45, W.z), cp = Math.cos(W.pitch); camera.position.set(W.x + Math.sin(W.yaw) * cp * W.dist, 1.45 + Math.sin(W.pitch) * W.dist, W.z - Math.cos(W.yaw) * cp * W.dist); if (camera.position.y > 5.0) camera.position.y = 5.0; camera.lookAt(tgt); CAM.look.copy(tgt); }

  // ---------- flow ----------
  function startDay() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; audio.init && audio.init(); closeDialog(); Object.assign(S, { orderN: 0, earned: 0, tips: 0, starList: [], done: null, react: null, streak: 0, log: [] }); setUniform(!!save.flag('millUniform')); ben.visible = false; place(cedar, sp.cedarWork, -0.6); say('CEDAR: "Here comes the first order. Take it down the line, one job at a time. No rush, do it right."', 5); nextOrder(); }
  function nextOrder() { clearPiece(); J = newJob(); P = makePiece(ST, J, TX); P.g.position.set(12.6, 0.62 + P.r, SN.Z0); P.g.rotation.y = Math.PI / 2; cust = custFox[J.item]; for (const k in custFox) custFox[k].visible = custFox[k] === cust; cust.position.set(sp.outside.x, 0, sp.outside.z); cust.rotation.y = Math.PI; cust.userData.mood = 'happy';
    SFX.door(); setTimeout(() => SFX.logRoll(), 400); Object.assign(S, { phase: 'arrive', phT: 0, tool: null, brush: null, confirm: 0, seen: {}, cut: null, buck: null, rip: null, ripDone: false, ripQ: 0, tear: 0, planeOn: false, travel: null, advT: 0, hold: null, ptr: null }); tone(90, 0.5, 0.03, 'sawtooth'); }
  function clearPiece() { if (P) { if (P.g.parent) P.g.parent.remove(P.g); P = null; } J = null; }
  function handOver() { if (S.phase !== 'work' || !J || S.travel) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND OVER AGAIN TO SEND IT', '#e6b45a', 2.2); return; } if (!allDone()) { S.tool = null; travelTo('counter', 0.8); } finishJob(); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['Straight as a pine! Cedar taught you well.', 'This will outlast me. Thank you!', 'Look at that brand. Nebo-made!'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Good work. Thank you!', 'That will do nicely.', 'Fine wood, fine work.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['It will do. Not your best work.', 'Hmm. A bit rough in places.', 'Thanks. I suppose.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half of it is not done!', 'This is not what I ordered.', 'Cedar would never send this out.'] } };
  function finishJob() { const T = J.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.72 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const fixed = T.filter(t => info(t).done).length, pay = ITEMS[J.item].price + fixed * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('kettle') ? 1.25 : 1));
    S.streak = stars === 3 ? (S.streak || 0) + 1 : 0; const streakB = S.streak >= 2 ? S.streak * 2 : 0; (S.log = S.log || []).push({ who: J.who, item: ITEMS[J.item].name, stars }); S.flash = null; S.say = ''; S.earned += pay; S.tips += tip + streakB; S.starList.push(stars); const R = REACT[level]; cust.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: J.who, stars, tip: tip + streakB, pay, streak: S.streak, t: 0 }; S.phase = 'react'; S.phT = 0; S.hold = null; S.ptr = null; cust.visible = true; hideTools(); tool.chisel.visible = false;
    SFX.react(level); SFX.pay(stars); if (stars === 3) { setTimeout(() => tone(1175, 0.1, 0.05), 110); setTimeout(() => tone(1568, 0.16, 0.05), 220); for (let i = 0; i < 10; i++) puff(cust.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), cust.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; clearPiece(); for (const k in custFox) custFox[k].visible = false; ben.visible = true; place(ben, sp.benIntro, -0.25); place(cedar, sp.cedarIntro, 0.35);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('millUniform')) { save.setFlag('millUniform'); unlock.push("MILL UNIFORM (beanie, flannel rag + Cedar's tee)"); } setUniform(true); if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    SFX.fanfare(eod); S.done = { day: S.day, fixed: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    say(eod ? 'CEDAR: "Employee of the day! The whole forest heard about that staff."' : avg >= 2 ? 'CEDAR: "Good honest day. See you tomorrow."' : 'CEDAR: "Rough one. Slow down and the wood will listen."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { SFX.nope(); flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); SFX.pay(1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); tone(1320, 0.1, 0.05); Y.kettle.visible = upg('kettle'); return true; }
  function toIntro() { if (DM.on) demoStop(); closeDialog(); S.phase = 'intro'; S.done = null; clearPiece(); for (const k in custFox) custFox[k].visible = false; setUniform(true); ben.visible = true; place(ben, sp.benIntro, -0.25); place(cedar, sp.cedarIntro, 0.35); }
  Y.kettle.visible = upg('kettle');

  // ---------- camera ----------
  const { SAFE, shotFor } = cameraFit(ST), CAM = { look: V3(0, 1.2, 0) };
  camera.position.set(0, 3, 12); camera.lookAt(CAM.look);
  const foxBox = (s, o) => { o.push(V3(s.x - 0.5, 0, s.z), V3(s.x + 0.5, 0, s.z), V3(s.x, 2.5, s.z)); return o; };
  const pieceBox = (o, pad = 0.12, round) => { const g = P.g.position, L = P.len, h = P.halfH() + pad; o.push(V3(g.x - L / 2, g.y - h, g.z - h), V3(g.x + L / 2, g.y + h, g.z + h), V3(g.x - L / 2, g.y + h, g.z + h), V3(g.x + L / 2, g.y - h, g.z - h)); return o; };
  const MIND = { debark: 3.1, buck: 3.3, rip: 2.0, turn: 3.0, plane: 2.9, stain: 3.0, counter: 3.4 };
  function shot() { const r = rawShot(), T = S.phase === 'work' ? (S.travel ? S.travel.T : S.tool || 'counter') : (S.phase === 'order' || S.phase === 'react') ? 'counter' : null; let m = T ? MIND[T] || 0 : 0; if (P && CW() > CHh() && (T === 'debark' || T === 'plane' || T === 'stain' || T === 'turn')) m = Math.max(m, P.len * 1.3); if (CW() < CHh() && (T === 'plane' || T === 'stain')) m = 1.6; const d = r.pos.distanceTo(r.look); if (!m || d >= m) return r; return { pos: r.look.clone().add(r.pos.clone().sub(r.look).multiplyScalar(m / Math.max(d, 1e-3))), look: r.look }; }
  function rawShot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; foxBox(sp.benIntro, o); foxBox(sp.cedarIntro, o); o.push(V3(SN.X_BS, 2.9, SN.Z0)); return o; }, 0.12, Math.PI - 0.22, port ? 0.1 : 0.06);
    if (S.phase === 'arrive') return shotFor('arr' + k, () => [V3(0.5, 0, 5.6), V3(10, 0, SN.Z0 - 1.2), V3(10.4, 2.4, SN.Z0), V3(4.6, 2.6, 4.2), V3(2, 2.6, 5.6)], 0.32, Math.PI - 0.5, 0.05);
    if (S.phase === 'leave') return shotFor('leave' + k, () => [V3(-1.8, 0, 6.4), V3(5.6, 0, 3.4), V3(1.8, 3.2, 6.4), V3(4.6, 2.6, 3.4)], 0.3, Math.PI - 0.3, 0.05);
    if (!P) return shotFor('room' + k, () => [V3(-9, 0, -5), V3(9, 0, -5), V3(0, 4, -5), V3(0, 0, 5)], 0.4, Math.PI, 0.05);
    const T = S.travel ? S.travel.T : S.phase === 'work' ? (S.tool || 'counter') : 'counter', key = T + k + J.item + P.len.toFixed(2) + P.shape;
    if (T === 'counter') return shotFor('ctr' + key, () => { const o = []; foxBox(sp.cust, o); o.push(V3(SN.COUNTER.x - 1.3, SN.H_CTR, SN.COUNTER.z), V3(SN.COUNTER.x + 1.3, SN.H_CTR, SN.COUNTER.z)); return o; }, 0.2, 0.55, port ? 0.08 : 0.06);
    if (T === 'debark') return shotFor(key, () => { const o = [], L = P.len; o.push(V3(SN.X_DEB - L / 2, SN.H_DEB - 0.1, SN.Z0 - 0.3), V3(SN.X_DEB + L / 2, SN.H_DEB + P.r * 2 + 0.15, SN.Z0 + 0.3)); if (port) o.push(V3(SN.X_DEB, SN.H_DEB + 1.0, SN.Z0)); return o; }, 0.38, Math.PI - 0.1, 0.05);
    if (T === 'buck') return shotFor(key + J.want, () => [V3(SN.X_CUT - J.want - 0.35, SN.H_CUT - 0.15, SN.Z0 + 0.4), V3(SN.X_CUT + 0.6, SN.H_CUT - 0.15, SN.Z0 + 0.4), V3(SN.X_CUT + 0.2, SN.H_CUT + 0.9, SN.Z0 - 0.3), V3(SN.X_CUT - J.want - 0.35, SN.H_CUT + 0.5, SN.Z0 - 0.3)], 0.5, Math.PI - 0.05, 0.05);
    if (T === 'rip') return shotFor(key, () => { const y = SN.H_BS + 0.15; return port ? [V3(SN.X_BS - 0.25, y, SN.Z0 - 0.3), V3(SN.X_BS - 0.25, y, SN.Z0 + 0.3), V3(SN.X_BS + 1.7, y, SN.Z0 - 0.3), V3(SN.X_BS + 1.7, y, SN.Z0 + 0.3)] : [V3(SN.X_BS - 0.6, y, SN.Z0 - 0.32), V3(SN.X_BS - 0.6, y, SN.Z0 + 0.32), V3(SN.X_BS + 1.3, y, SN.Z0 - 0.32), V3(SN.X_BS + 1.3, y, SN.Z0 + 0.32)]; }, port ? 0.92 : 1.05, port ? Math.PI / 2 : Math.PI, 0.05);
    if (T === 'turn') return shotFor(key, () => { const L = P.len, x = SN.X_LATHE - 0.1; return [V3(x - L / 2 - 0.15, SN.H_LATHE - 0.32, SN.Z0 + 0.3), V3(x + L / 2 + 0.15, SN.H_LATHE + 0.3, SN.Z0 + 0.3), V3(x, SN.H_LATHE + 0.3, SN.Z0 - 0.2)]; }, 0.22, Math.PI - 0.06, 0.06);
    if (T === 'plane') { const pi = Math.max(0, P.patches.findIndex(q => q.rough > 0)), cx = port && P.patches[pi] ? SN.PLANE.x + P.patches[pi].x : SN.PLANE.x, hw = port ? 0.55 : P.len / 2 + 0.1; return shotFor(key + ':' + (port ? pi : 0), () => { const o = [], y = SN.H_PLANE, z = SN.PLANE.z; o.push(V3(cx - hw, y, z - 0.3), V3(cx + hw, y, z + 0.3), V3(cx, y + P.halfH() * 2 + 0.15, z)); return o; }, 0.82, Math.PI, 0.06); }
    if (T === 'stain') { if (port) { const si = Math.max(0, P.cover.findIndex((v, k2) => v < 1 || P.col[k2] !== J.stain)), cx = SN.FINISH.x + (-P.len / 2 + (si + 0.5) * P.len / 4); return shotFor(key + ':' + si, () => { const y = SN.H_FIN + P.halfH() + 0.04, z = SN.FINISH.z + 0.1; return [V3(cx - 0.55, y - 0.1, z - 0.3), V3(cx + 0.55, y + 0.15, z + 0.3), V3(cx, y + 0.2, z - 0.7)]; }, 0.7, Math.PI - 0.05, 0.06); } return shotFor(key, () => { const o = []; pieceBox(o, 0.15); o.push(V3(SN.FINISH.x - 0.9, SN.H_FIN + 0.2, SN.FINISH.z - 0.65), V3(SN.FINISH.x + 0.9, SN.H_FIN + 0.2, SN.FINISH.z - 0.65)); return o; }, 0.62, Math.PI - 0.05, 0.06); }
    return shotFor('room' + k, () => [V3(-9, 0, -5), V3(9, 0, -5), V3(0, 4, -5), V3(0, 0, 5)], 0.4, Math.PI, 0.05); }
  // buck target flag + its label
  const flag = new THREE.Group(); { M(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 6), toon('#201e1d'), 0, 0.21, 0, flag, 0); const f = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-0.2, -0.07), new THREE.Vector2(0, -0.14)])), new THREE.MeshBasicMaterial({ color: 0xffd23a, side: THREE.DoubleSide })); f.position.y = 0.42; flag.add(f); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.09, 3), new THREE.MeshBasicMaterial({ color: 0xffd23a })); tri.rotation.x = Math.PI; tri.position.y = 0.0; flag.add(tri); flag.visible = false; scene.add(flag); }

  // ---------- DEMO: autopilot makes one LONGSTAFF (all six jobs) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, holdTo: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.4); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = (p, j = 0) => { hand.visible = true; hand.position.copy(p).add(V3(j, 0.05, 0.12)); hand.scale.setScalar(0.6); };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  const topStrip = () => { let best = null, by = -9; for (const s of P.strips) { if (s.parent !== P.core) continue; const y = wp(s).y + s.userData.ring * 0.001; if (y > by) { by = y; best = s; } } return best; };
  function demoAct() { if (!J) return 0.5; if (S.travel || S.advT > 0) return 0.25; const T = nextTask();
    if (!T) { DM.cap = 'EVERY JOB DONE: TAP HAND OVER'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handOver(); return 1; }
    if (S.tool !== T) { setTool(T); return 1.0; }
    if (T === 'debark') { const w = cap('debark', 'SWIPE', 'SWIPE ALONG THE LOG TO PEEL THE BARK. IT ROLLS AS YOU GO'); if (w) return w; const s = topStrip(); if (s) { const p = wp(s); handAt(p); peelStrip(s, p); } return 0.22; }
    if (T === 'buck') { if (S.cut) return 0.4; const w = cap('buck', 'DRAG', 'DRAG THE LOG UNTIL ITS END MEETS THE YELLOW FLAG. LET GO TO CUT', 2.2); if (w) return w; const goal = SN.X_CUT - J.want; S.buck.XL += (goal - S.buck.XL) * 0.3; handAt(V3(S.buck.XL + 0.3, SN.H_CUT + P.r * 2, SN.Z0)); if (Math.abs(S.buck.XL - goal) < 0.008) { S.buck.XL = goal; doCut(); return 1.2; } return 0.1; }
    if (T === 'rip') { const w = cap('rip', 'HOLD', 'HOLD TO FEED THE LOG. SLIDE LEFT AND RIGHT TO KEEP THE BLADE ON THE PENCIL LINE', 2.6); if (w) return w; S.rip.hold = true; hand.visible = false; return 0.5; }
    if (T === 'turn') { if (S.hold) return 0.1; const G = P.grooves.find(g => !g.done); if (!G) return 0.4; const w = cap('turn', 'HOLD', 'TAP A YELLOW RING, HOLD TO CUT THE GROOVE, LET GO IN THE GREEN', 2.4); if (w) return w; handAt(wp(G.ring)); startTurn(G); DM.holdTo = 0.6; return 0.1; }
    if (T === 'plane') { const pt = P.patches.find(p => p.rough > 0); if (!pt) return 0.4; const w = cap('plane', 'RUB', 'RUB LEFT AND RIGHT, ALONG THE GRAIN, OVER THE ROUGH SPOTS', 2.2); if (w) return w; DM.j = -(DM.j || 1); const p = wp(pt.m); handAt(p, DM.j * 0.15); tool.plane.visible = true; tool.plane.position.copy(p).add(V3(DM.j * 0.1, 0.03, 0)); pt.rough = Math.max(0, pt.rough - 0.2); pt.m.material.opacity = pt.rough; fling(p, '#f2dcaa', 1, 1.3); if (pt.rough <= 0) { pt.m.visible = false; if (P.patches.every(q => q.rough <= 0) && P.kerf) { P.core.remove(P.kerf.mesh); P.kerf = null; } checkDone(); } return 0.1; }
    if (T === 'stain') { if (S.brush !== J.stain) { const w = cap('brush', STAINS[J.stain].name, 'THE ORDER SAYS ' + STAINS[J.stain].name + ': PICK THAT STAIN BELOW', 2.2); if (w) return w; hand.visible = false; setBrush(J.stain); return 1; }
      const i = P.cover.findIndex((v, k) => v < 1 || P.col[k] !== J.stain); if (i < 0) return 0.4; const w = cap('stain', 'SWIPE', 'SWIPE OVER EACH SECTION. CEDAR\'S BRAND BURNS ON AT THE END'); if (w) return w; const m = P.hit.find(h => h.userData.sec === i), p = wp(m); DM.j = -(DM.j || 1); handAt(p, DM.j * 0.12); tool.brush.visible = true; tool.brush.position.copy(p).add(V3(DM.j * 0.1, P.halfH() + 0.05, 0)); stainSec(i, 70, p); return 0.09; }
    return 0.5; }
  function demoStep(dt) { if (S.hold && DM.holdTo != null) { if (S.hold.G.v >= DM.holdTo) { DM.holdTo = null; releaseTurn(); tool.chisel.visible = false; DM.cd = 0.7; } return; }
    hand.scale.setScalar(Math.max(0.35, hand.scale.x - dt * 0.8));
    if (S.rip && S.rip.hold) { const R = S.rip; R.c += (-lineF(J, R.u + 0.04) + Math.sin(S.t * 7) * 0.006 - R.c) * Math.min(1, dt * 7); }
    if (S.phase === 'arrive' || S.phase === 'order') { DM.cap = 'A NEIGHBOUR ORDERS SOMETHING. A LOG ROLLS IN FROM THE FOREST'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THEY CHECK YOUR WORK. CAREFUL JOBS EARN STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || (S.phase !== 'intro' && S.phase !== 'done')) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.cd = 1.4; DM.holdTo = null; DM.cap = 'WATCH A JOB AT CEDAR\'S MILL'; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 2; S.forceItem = 'staff'; startDay(); S.forceItem = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; hand.visible = false; S.hold = null; S.ptr = null; S.react = null; S.flash = null; S.day = DM.day0; clearPiece(); for (const k in custFox) custFox[k].visible = false; hideTools(); tool.chisel.visible = false; Object.assign(S, { phase: 'intro', done: null, orderN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, travel: null }); setUniform(true); ben.visible = true; place(ben, sp.benIntro, -0.25); place(cedar, sp.cedarIntro, 0.35); }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !J || !P || S.travel) return null; const T = S.tool, H = (p, text, tool = T, v = false) => ({ p, text, tool, r: 0.24, v });
    if (S.hold) return { text: 'LET GO IN THE GREEN', tool: T };
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · ' + label(nx), tool: nx } : { text: 'ALL DONE · TAP HAND OVER', tool: 'hand' }; }
    if (T === 'debark') { const s = topStrip(); return s ? H(wp(s), 'SWIPE ALONG THE LOG TO PEEL THE BARK · ' + P.barkLeft() + ' LEFT') : null; }
    if (T === 'buck') return { text: 'DRAG THE LOG ⟷ TO THE YELLOW FLAG · LET GO TO CUT', tool: T };
    if (T === 'rip') return { text: S.rip && S.rip.hold ? 'SLIDE ⟷ TO KEEP THE BLADE ON THE PENCIL LINE' : 'HOLD TO FEED · SLIDE ⟷ TO STEER', tool: T };
    if (T === 'turn') { const G = P.grooves.find(g => !g.done); return G ? H(wp(G.ring), 'TAP A YELLOW RING · HOLD TO CUT · LET GO IN THE GREEN') : null; }
    if (T === 'plane') { const pt = P.patches.find(p => p.rough > 0); return pt ? H(wp(pt.m), 'RUB LEFT ⟷ RIGHT OVER THE ROUGH SPOT') : null; }
    if (T === 'stain') { if (!S.brush) return { text: 'PICK ' + STAINS[J.stain].name + ' BELOW', tool: T }; const i = P.cover.findIndex((v, k) => v < 1 || P.col[k] !== J.stain); if (i < 0) return null; const m = P.hit.find(h => h.userData.sec === i); return H(wp(m), P.cover[i] >= 1 ? 'WRONG STAIN · USE ' + STAINS[J.stain].name : 'SWIPE OVER THE WOOD TO STAIN IT'); }
    return null; }
  let HINT = null, hintT = 0;

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const custSpot = V3(sp.cust.x, 0, sp.cust.z), doorSpot = V3(sp.door.x, 0, sp.door.z), outSpot = V3(sp.outside.x, 0, sp.outside.z);
  function walkTo(f, tgt, dt, speed = 2.4) { const dx = tgt.x - f.position.x, dz = tgt.z - f.position.z, d = Math.hypot(dx, dz); if (d < 0.05) { kit.animFox(f, dt, 0); return true; } const s = Math.min(d, speed * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; f.rotation.y = Math.atan2(dx, dz); kit.animFox(f, dt, speed); return false; }
  function step(dt) { const t = clock.elapsedTime; S.t = t; S.phT += dt;
    // the mill runs: water wheel cog, line shaft, belts, rollers, band saw wheels, lathe chuck, stove flicker
    const A = Y.anim, feeding = S.rip && S.rip.hold, turning = S.tool === 'turn' && !S.travel && S.phase === 'work';
    A.cog.rotation.z -= dt * 0.6; A.shaft.rotation.x += dt * 4; A.beltT.offset.y -= dt * 1.6; A.rollers.forEach(r => r.rotation.x += dt * 2.2); A.bsWheels.forEach(w => w.rotation.x += dt * (feeding ? 14 : 9)); A.chuck.rotation.x += dt * (turning ? 26 : 2); A.fire.material.color.setHSL(0.07 + Math.sin(t * 13) * 0.01, 1, 0.55 + Math.sin(t * 9.3) * 0.06);
    lamp.intensity = 0.85 + Math.sin(t * 2.3) * 0.04;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    for (const b of bits) { if (b.t <= 0) continue; b.t -= dt * 0.9; b.v.y -= dt * 6; b.m.position.addScaledVector(b.v, dt); b.m.rotation.x += b.s.x * dt; b.m.rotation.y += b.s.y * dt; if (b.m.position.y < 0.02) { b.m.position.y = 0.02; b.v.set(0, 0, 0); } if (b.t <= 0) b.m.visible = false; }
    for (let i = offcuts.length - 1; i >= 0; i--) { const o = offcuts[i]; o.t += dt; o.v.y -= dt * 7; o.g.position.addScaledVector(o.v, dt); if (o.g.position.y < 0.3) { o.g.position.y = 0.3; o.v.multiplyScalar(0.4); } o.g.rotation.x += dt * 2; if (o.t > o.life) { scene.remove(o.g); offcuts.splice(i, 1); } }
    if (P) { for (const s of [...P.strips]) { if (!s.userData.fly || s.parent !== scene) continue; const F = s.userData.fly; F.t += dt; F.v.y -= dt * 7; s.position.addScaledVector(F.v, dt); s.rotation.x += F.spin.x * dt; s.rotation.z += F.spin.z * dt; if (F.t > 1.3) scene.remove(s); } }
    if (S.phase === 'walk') { walkStep(dt); kit.animFox(cedar, dt, 0); }
    else if (S.phase === 'arrive') { const there = walkTo(cust, custSpot, dt, 2.6); if (P) { const k = smooth(0, 1, Math.min(1, S.phT / 2.2)); P.g.position.x = 12.6 + (SN.X_DECK - 12.6) * k; P.g.position.y = 0.62 + P.r + (1 - k) * 0.25; P.core.rotation.x -= dt * 3 * (1 - k); }
      if (there && S.phT > 2.3) { cust.rotation.y = Math.PI; S.phase = 'order'; S.phT = 0; say(J.who + ': "' + J.line + '"', 5); SFX.bell(); setTimeout(() => tone(1568, 0.3, 0.04, 'sine'), 160); } }
    else if (S.phase === 'order') { kit.animFox(cust, dt, 0); cust.userData.talking = S.phT < 3; if (S.phT > 3.2) { cust.userData.talking = false; S.phase = 'work'; S.phT = 0; const T = J.tasks[0]; S.tool = T; prepare(T); travelTo(T, 1.3); } }
    else if (S.phase === 'react') { kit.animFox(cust, dt, 0); if (S.react) S.react.t += dt; if (S.phT > 2.9) { S.react = null; S.phase = 'leave'; S.phT = 0; S.leg = 0; if (P) { cust.attach(P.g); P.g.position.set(0.42, 1.3, 0.05); P.g.rotation.set(0, -Math.PI / 2, 0); } cust.userData.mood = 'happy'; } }
    else if (S.phase === 'leave') { if (!S.leg) { if (walkTo(cust, doorSpot, dt, 2.8)) S.leg = 1; } else if (walkTo(cust, outSpot, dt, 2.8)) { S.leg = 0; cust.visible = false; if (DM.on) { demoStop(); return; } S.orderN++; if (S.orderN >= MILL.perDay) endDay(); else nextOrder(); } }
    if (S.phase !== 'walk') { kit.animFox(cedar, dt, 0); if (ben.visible) kit.animFox(ben, dt, 0); }
    // the piece travels between stations, then sits at its station
    if (P && S.phase === 'work') { if (S.travel) { const TR = S.travel; TR.t += dt / TR.dur; const k = smooth(0, 1, Math.min(1, TR.t)); P.g.position.lerpVectors(TR.a.p, TR.b.p, k); P.g.position.y += Math.sin(k * Math.PI) * 0.6; let dr = TR.b.ry - TR.a.ry; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); P.g.rotation.y = TR.a.ry + dr * k; if (TR.t >= 1) { S.travel = null; SFX.thud(0.16); S.bounce = 1; puff(P.g.position.x, P.g.position.y - P.halfH(), P.g.position.z + 0.2, 0xf2dcaa, 2); } }
      else if (S.tool) { const ps = pose(S.tool); if (S.tool === 'buck' && S.cutAnim) { } P.g.position.lerp(ps.p, Math.min(1, dt * 14)); P.g.rotation.y = ps.ry; }
      else { const ps = pose('counter'); P.g.position.lerp(ps.p, Math.min(1, dt * 8)); }
      if (!S.travel && S.tool === 'debark' && !info('debark').done) P.core.rotation.x += dt * 1.4; else if (!S.travel && S.tool === 'turn') P.core.rotation.x += dt * 22; else if (S.tool !== 'debark') P.core.rotation.x = damp(P.core.rotation.x, Math.round(P.core.rotation.x / (Math.PI * 2)) * Math.PI * 2, 6, dt);
      ripStep(dt); if (S.rip && S.tool === 'rip') { Y.carriage.position.x = P.g.position.x; Y.carriage.position.z = P.g.position.z; } else Y.carriage.position.x = damp(Y.carriage.position.x, SN.X_BS + 1.1, 3, dt), Y.carriage.position.z = damp(Y.carriage.position.z, SN.Z0, 3, dt);
      if (S.advT > 0) { S.advT -= dt; if (S.advT <= 0 && !DM.on) advance(); else if (S.advT <= 0 && DM.on) advance(); }
      // the cut-off saw drops on a cut
      if (S.cutAnim > 0) { S.cutAnim += dt * 2.4; const k = S.cutAnim < 1 ? Math.sin(S.cutAnim * Math.PI) : 0; Y.anim.cutArm.rotation.x = k * 0.55; if (S.cutAnim >= 1) S.cutAnim = 0; } Y.anim.cutBlade.rotation.x += dt * (S.tool === 'buck' ? 30 : 0);
      flag.visible = S.tool === 'buck' && !S.travel && !S.cut; if (flag.visible) flag.position.set(SN.X_CUT - J.want, SN.H_CUT - 0.02, SN.Z0 + 0.33); Y.laser.visible = flag.visible && upg('laser');
      // lathe: hold to cut the groove deeper
      if (S.hold) { const G = S.hold.G; G.v = Math.min(1.06, G.v + dt * 0.42); if (G.mesh) { const kk = 1 - G.v * 0.5; G.mesh.scale.set(1, kk, kk); } const gp = wp(G.ring); tool.chisel.visible = true; tool.chisel.position.set(gp.x, gp.y + 0.02, gp.z + P.r + 0.18 - G.v * P.r * 0.4); if (Math.random() < dt * 30) fling(V3(gp.x, gp.y + P.r * 0.6, gp.z + P.r * 0.6), '#f2dcaa', 1, 1.6); if (Math.random() < dt * 10) audio.tone && audio.tone(260 + G.v * 300, 0.06, 0.02, 'square'); if (G.v >= 1.06) releaseTurn(); }
      // auto-follow: idle on a finished task → the next one
    } else { flag.visible = false; Y.laser.visible = false; }
    // camera: walk = follow cam; job = fitted shots
    if (S.phase !== 'walk') { const sh = shot(), sp2 = S.phase === 'work' ? 3.0 : 2.2; camera.position.lerp(sh.pos, Math.min(1, dt * sp2)); CAM.look.lerp(sh.look, Math.min(1, dt * sp2)); camera.lookAt(CAM.look); }
    // cut-away: front wall + roof in job shots; in walk mode, hide whichever wall is between the camera and Ben
    const cp = camera.position, inWalk = S.phase === 'walk'; Y.walls.front.visible = cp.z < 6.3; Y.walls.back.visible = cp.z > -6.3; Y.walls.east.visible = cp.x < 9.8; Y.walls.west.visible = cp.x > -9.8; Y.roof.visible = cp.y < 4.9 && Math.abs(cp.x) < 9.8 && Math.abs(cp.z) < 6.3;
    if (!inWalk) { for (const l of Y.lamps) l.visible = Math.hypot(l.position.x - cp.x, l.position.z - cp.z) > 1.6 || cp.y < 3.0; const lk = CAM.look, dd = cp.distanceTo(lk), cullF = f => { const v = V3(f.position.x, 1.2, f.position.z), dc = v.distanceTo(cp); return S.phase === 'work' && dc < dd && v.distanceTo(lk) < dd + 0.5 && dc < 5; }; cedar.visible = !cullF(cedar); if (cust && S.phase === 'work') cust.visible = !cullF(cust); }
    else { Y.lamps.forEach(l => l.visible = true); cedar.visible = true; }
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt);
    // sound that follows play + polish animation
    { const work = S.phase === 'work' && !S.travel && P;
      SFX.bandsaw(work && S.tool === 'rip' && !S.ripDone ? (S.rip && S.rip.hold ? (S.rip.state || 'on') : 'idle') : null);
      SFX.lathe(!!(work && S.tool === 'turn' && !info('turn').done)); SFX.latheCut(S.hold ? S.hold.G.v : null);
      if (S.hold && !S.hold.green && turnZone(S.hold.G.v) === 'JUST RIGHT') { S.hold.green = true; SFX.green(); buzz(10); }
      SFX.music(S.phase === 'walk' || S.phase === 'intro' || S.phase === 'done' ? 'walk' : 'work'); SFX.duck(!!W.dlg || !!S.done);
      SFX.tick(dt, { stove: Math.hypot(camera.position.x - 8.8, camera.position.z - 1.6) }); }
    for (const b of blobs) { b.m.visible = b.f.visible && b.f.parent === scene; if (b.m.visible) b.m.position.set(b.f.position.x, 0.015, b.f.position.z); }
    { const a = dustG.attributes.position.array; for (let i = 0; i < dustN; i++) { const sd = dustS[i]; a[i * 3] += Math.sin(t * 0.21 + sd) * 0.0016; a[i * 3 + 1] += Math.sin(t * 0.17 + sd * 2) * 0.0012 + 0.0004; a[i * 3 + 2] += Math.cos(t * 0.19 + sd) * 0.0014; if (a[i * 3 + 1] > 4.8) a[i * 3 + 1] = 0.4; } dustG.attributes.position.needsUpdate = true; dust.material.opacity = 0.45 + Math.sin(t * 0.7) * 0.1; }
    shafts.forEach((m, i) => { m.visible = Y.walls.back.visible; m.material.opacity = 0.17 + Math.sin(t * 0.4 + i) * 0.03; });
    if (P && S.bounce > 0) { S.bounce = Math.max(0, S.bounce - dt * 3.2); P.g.scale.setScalar(1 + Math.sin(S.bounce * Math.PI) * 0.05); }
    drawBoard();
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onKD = e => { if (S.phase === 'work' && J && !DM.on && !e.repeat) { const n = /^Digit([1-7])$/.exec(e.code); if (n) { const id = J.tasks[+n[1] - 1]; if (id) setTool(id); else handOver(); return; } if (e.code === 'Enter') { handOver(); return; } } if (S.phase !== 'walk') return; const c = e.code; if (/^(Arrow|Key[WASD])/.test(c)) { W.keys.add(c); if (c.startsWith('Arrow')) e.preventDefault(); return; } if (e.repeat) return; if (c === 'KeyE' || c === 'Enter') { e.preventDefault(); talk(); } else if (c === 'Digit1') melee(); else if (c === 'Digit2') range(); else if (c === 'Space' || c === 'Digit3') { e.preventDefault(); jump(); } else if (c === 'Escape' && W.dlg) closeDialog(); };
  const onVis = () => SFX.suspend(document.hidden); document.addEventListener('visibilitychange', onVis);
  const onKU = e => W.keys.delete(e.code), onBlur = () => W.keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  function walkHud() { const n = near(), D = W.dlg; let dialog = null;
    if (D) { if (D.key === 'hello') dialog = { name: 'CEDAR', role: 'Owner · Cedar\'s Lumber Mill', text: DLG.hello.text, choices: DLG.hello.choices.map(([text, k]) => ({ text, bye: k === 'bye' })), step: 1, total: 1 }; else { const L = DLG[D.key]; dialog = { name: 'CEDAR', role: 'Owner · Cedar\'s Lumber Mill', text: L[D.i], step: D.i + 1, total: L.length, more: false }; } }
    return { prompt: D ? null : n === 'cedar' ? 'Talk to CEDAR' : n === 'chop' ? 'Chop firewood · 1' : n === 'whistle' ? 'Pull the mill whistle · 2' : null, dialog, toast: W.toast, quest: { text: W.wood ? 'FIREWOOD × ' + W.wood + ' · TALK TO CEDAR TO WORK' : 'LOOK AROUND · TALK TO CEDAR TO WORK' } }; }
  function hud() { const port = CW() < CHh(), B = S.buck && P && S.tool === 'buck' && !S.cut && !S.travel ? (() => { const len = buckLen(), e = len - J.want, tol = J.tol * (upg('laser') ? 2 : 1); return { len: len.toFixed(2), want: J.want.toFixed(2), zone: Math.abs(e) <= tol ? 'ON THE FLAG' : e > 0 ? 'TOO LONG' : 'TOO SHORT', ok: Math.abs(e) <= tol }; })() : null;
    const R = S.rip && S.tool === 'rip' && !S.ripDone && !S.travel ? { pct: S.rip.n ? Math.round((S.rip.on + S.rip.near * 0.5) / S.rip.n * 100) : 100, prog: Math.round(S.rip.u / P.len * 100), hold: !!S.rip.hold, state: S.rip.state || 'on' } : null;
    const g = upg('gouge') ? [0.4, 0.8] : TURN;
    return { phase: S.phase, day: S.day, orderN: S.orderN, perDay: MILL.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { who: J.who, role: J.role, item: ITEMS[J.item].name, wood: WOODS[J.wood].name, want: J.want, hasBuck: J.tasks.includes('buck'), stain: J.stain, stainName: STAINS[J.stain].name, stainCol: STAINS[J.stain].col, hasStain: J.tasks.includes('stain'), tasks: J.tasks.map(id => { const I = info(id); return { id, label: label(id), name: TASKS[id].name, done: I.done, txt: I.txt, locked: locked(id) }; }) } : null,
      tool: S.tool, travel: !!S.travel, brush: S.brush, stainPick: !!(J && S.phase === 'work' && S.tool === 'stain' && !S.travel && !info('stain').done), allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      press: S.hold ? { v: S.hold.G.v / 1.06, zone: turnZone(S.hold.G.v), g0: g[0] / 1.06, g1: g[1] / 1.06 } : null, buck: B, rip: R,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('millUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, sound: { sfx: SFX.prefs.sfx, music: SFX.prefs.music }, best: save.stat(SAVE.best, 0), streak: S.streak || 0, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      walk: S.phase === 'walk' ? walkHud() : null }; }
  place(ben, sp.benIntro, -0.25); place(cedar, sp.cedarIntro, 0.35);
  frame();
  return { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } }, setTool, setBrush, handOver, startDay, demoStart, demoStop, buyUpgrade, hud, toIntro, enterWalk,
    // ENGINE CONTRACT for the standard Game HUD (walk mode)
    start() {}, talk, choose, closeDialog, nextLine, clearToast() { W.toast = null; }, melee, range, jump, meleeUp() {}, useItem() { wToast('Save it for the forest.', 1.6); }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; }, setHudPad() {}, setStick(x, y) { W.stick.x = x; W.stick.y = y; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy, zoomBy(k) { W.dist = clamp(W.dist * k, 3.5, 12); }, getCam() { return { dist: W.dist, pitch: W.pitch }; }, setCam(d, p) { W.dist = clamp(d, 3.5, 12); W.pitch = clamp(p, 0.12, 1.1); }, setMinimap() {}, toggleSound() { return SFX.toggleAll(); }, sound() { return { sfx: SFX.prefs.sfx, music: SFX.prefs.music }; }, setSfx(v) { SFX.unlock(); SFX.setSfx(v); }, setMusic(v) { SFX.unlock(); SFX.setMusic(v); }, unlock() { SFX.unlock(); }, click() { SFX.unlock(); SFX.click(); }, cycleWeather() {},
    mapData() { return { p: [W.x, W.z, W.face], b: [['DEBARKER', SN.X_DEB, SN.Z0], ['CUT-OFF SAW', SN.X_CUT, SN.Z0], ['BAND SAW', SN.X_BS, SN.Z0], ['LATHE', SN.X_LATHE, SN.Z0], ['PLANING BENCH', SN.PLANE.x, SN.PLANE.z], ['FINISHING', SN.FINISH.x, SN.FINISH.z], ['COUNTER', SN.COUNTER.x, SN.COUNTER.z], ['DOOR', 0, 6.5]], f: [[cedar.position.x, cedar.position.z]], e: [], q: [cedar.position.x, cedar.position.z, 'CEDAR'] }; },
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _force(k) { S.forceItem = k; }, _state: () => S, _sfx: () => SFX, _planeAt: (x, y, h) => planeAt(x, y, h), _shot: () => { const r = shot(); return { pos: r.pos.toArray(), look: r.look.toArray(), safe: { ...SAFE }, W: CW(), H: CHh() }; }, _cast: () => ({ ben, cedar, custFox, camera, scene, renderer }), _piece: () => P, _job: () => J, _scr: scr, _wp: wp, _walk: () => W,
    _auto() { return { debarkAll() { P.strips.filter(s => s.parent === P.core).forEach(s => P.peel(s)); P.bark = false; checkDone(); }, cutAll() { S.buck.XL = SN.X_CUT - J.want; doCut(); }, ripAll() { const R = S.rip; while (!S.ripDone) { R.hold = true; R.c = -lineF(J, R.u); ripStep(1 / 30); } }, turnAll() { for (const G of P.grooves) { if (G.done) continue; S.hold = { G }; G.v = 0.6; releaseTurn(); } }, planeAll() { P.patches.forEach(p => { p.rough = 0; p.m.visible = false; }); if (P.kerf) { P.core.remove(P.kerf.mesh); P.kerf = null; } checkDone(); }, stainAll() { S.brush = J.stain; for (let i = 0; i < 4; i++) { P.col[i] = J.stain; P.cover[i] = 1; P.setStain(i, STAINS[J.stain].col, 1); } checkDone(); } }; },
    destroy() { cancelAnimationFrame(raf); SFX.bandsaw(null); SFX.lathe(false); SFX.suspend(true); document.removeEventListener('visibilitychange', onVis); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
