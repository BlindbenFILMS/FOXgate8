// 8 GATES — EMBER'S SKEWER HOUSE [skewerHouse]. A shish-kabob grill house that drops into ANY FOX world building.
// Built like Meru Burgers (the restaurant reference) + the 2D skewer game (chop · thread · glaze · turn on the coals · serve).
//   buildSkewerHouse(ctx)          → the whole interior at ctx.origin from a Meru-style ctx { THREE, M, toon, canvasTex, scene, grad, addOutline, origin }.
//                                    Returns K: stations, colliders + bounds for walking, door, chef + work spots, cut-away lists.
//   createSkewerShift({ container, onState }) → stand-alone: WALK around the room (Game HUD contract), talk to CHEF EMBER, work a shift.
// THE SHIFT (3 min): THREAD the ticket's pieces onto a skewer (tap the bowls) → GRILL: kabobs lie on the coals; SWIPE ACROSS one to ROLL it
// (flick = it spins), TAP = a quarter turn, the side facing the coals chars; all four sides must land in the ticket's zone (LIGHT / MEDIUM / WELL).
// FAN: swipe back and forth on the palm fan = hotter coals. FLARE-UPS: tap the flames to spritz. GLAZE (day 3+): tap the honey pot, rub each side.
// Slide a kabob off the grill (drag along it) → PLATE: add RICE / PITA, drag the plate onto the customer. A bowl runs out → CHOP: swipe across.
// Days, wage + prices + tips in gold, employee of the day, the SKEWER uniform, kitchen upgrades. Save keys skewer.house.*, flag skewerUniform.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';

export const SKEWER = { name: "EMBER'S SKEWER HOUSE", short: 'SKEWER HOUSE', room: 'skewerHouse', chef: 'EMBER', shift: 180 };
// pieces: chunk size (x, y, z along the skewer), corner rounding, colour stops at char 0 · 38 · 57 · 76 · 96 (raw → light → medium → well → burnt)
export const ING = {
  lamb: { name: 'LAMB', size: [0.09, 0.086, 0.078], rnd: 0.8, cols: ['#bf4a3e', '#a65a3c', '#86492a', '#5c3118', '#1f140e'] },
  chicken: { name: 'CHICKEN', size: [0.088, 0.082, 0.076], rnd: 0.8, cols: ['#f3cdb6', '#ecc08a', '#dfa052', '#a8692a', '#2e1d10'] },
  pepper: { name: 'PEPPER', size: [0.104, 0.104, 0.03], rnd: 0.86, cols: ['#4fae3a', '#47a034', '#3c8a2a', '#2a6018', '#18200c'] },
  onion: { name: 'ONION', size: [0.098, 0.098, 0.036], rnd: 0.86, cols: ['#f3e8f0', '#ecd6bc', '#dcb27c', '#a87a44', '#2a1c12'] },
  tomato: { name: 'TOMATO', size: [0.084, 0.084, 0.08], rnd: 0.66, cols: ['#e0402e', '#d63a26', '#bf3220', '#8e2a14', '#2a120c'] },
  mushroom: { name: 'MUSHROOM', size: [0.084, 0.078, 0.07], rnd: 0.72, cols: ['#ecdfc8', '#d6bb8e', '#b9925e', '#7e5a34', '#24180e'] },
  pineapple: { name: 'PINEAPPLE', size: [0.094, 0.078, 0.062], rnd: 0.84, cols: ['#f6d23c', '#f0bf36', '#e3a02c', '#b06c1c', '#2e1c0c'] } };
export const BOWLS = ['lamb', 'chicken', 'pepper', 'onion', 'tomato', 'mushroom', 'pineapple'];
// seq[0] sits by the handle (threaded first), seq[4] at the tip
export const RECIPES = [
  { id: 'shish', name: 'LAMB SHISH', day: 1, seq: ['lamb', 'onion', 'lamb', 'pepper', 'lamb'], price: 8 },
  { id: 'garden', name: 'GARDEN SKEWER', day: 1, seq: ['pepper', 'tomato', 'mushroom', 'onion', 'pepper'], price: 7 },
  { id: 'tikka', name: 'CHICKEN TIKKA', day: 2, seq: ['chicken', 'onion', 'chicken', 'pepper', 'chicken'], price: 8 },
  { id: 'sunset', name: 'SUNSET SKEWER', day: 3, seq: ['chicken', 'pineapple', 'pepper', 'pineapple', 'chicken'], price: 9 },
  { id: 'ember', name: 'THE EMBER', day: 4, seq: ['lamb', 'pepper', 'chicken', 'onion', 'pineapple'], price: 11 },
  { id: 'works', name: 'THE WORKS', day: 5, seq: ['lamb', 'mushroom', 'chicken', 'tomato', 'lamb'], price: 12 }];
export const SIDES = { rice: { name: 'RICE', day: 2, price: 3 }, pita: { name: 'PITA', day: 2, price: 2 } };
export const GLAZE = { name: 'HONEY GLAZE', day: 3, price: 2, need: 60 };
// char zones on a 0–110 scale (BURNT from 86)
export const CHARZ = { LIGHT: { lo: 30, hi: 48 }, MEDIUM: { lo: 48, hi: 66 }, WELL: { lo: 66, hi: 86 } };
export const BURNT = 86;
export const ZONE_COL = { RAW: '#9ca3af', LIGHT: '#e6b45a', MEDIUM: '#c27a32', WELL: '#7a4520', BURNT: '#ec3013' };
export const zoneOf = v => v < 30 ? 'RAW' : v < 48 ? 'LIGHT' : v < 66 ? 'MEDIUM' : v < BURNT ? 'WELL' : 'BURNT';
export const UPGRADES = [
  { id: 'slot5', name: '5TH GRILL SPOT', cost: 40, line: 'Grill five kabobs at once.' },
  { id: 'bellows', name: 'BELLOWS FAN', cost: 35, line: 'Each wave of the fan heats the coals twice as much.' },
  { id: 'brush', name: 'BIG BRUSH', cost: 30, line: 'One dip glazes a whole kabob.' },
  { id: 'drip', name: 'DRIP TRAY', cost: 45, line: 'No more flare-ups.' },
  { id: 'oud', name: 'OUD PLAYER', cost: 60, line: 'Happy customers wait 20% longer.' }];
const CUSTOMERS = [
  { name: 'YUZU', torso: ['#1f3350', '#f9ecd9', '#16263c'] }, { name: 'MOCHI', torso: ['#4a3a5c', '#efe4f4', '#332745'] },
  { name: 'KUMA', torso: ['#3f5d47', '#e6f0e2', '#2b4232'] }, { name: 'HANA', torso: ['#8f2b1e', '#f8e2da', '#661a10'] },
  { name: 'SAFFRON', torso: ['#e0a21e', '#fff4d6', '#9a6a0c'] }, { name: 'BRAMBLE', torso: ['#6b3a5a', '#f3e0ec', '#40203a'], outfit: 'coat' },
  { name: 'OLLO', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] }, { name: 'PIP', torso: ['#f472b6', '#fce7f3', '#9d174d'] },
  { name: 'RUSK', torso: ['#5a4632', '#efe2d0', '#3a2a1a'], outfit: 'coat' }, { name: 'TAMSIN', torso: ['#2f7d3a', '#e8f5e9', '#1a4a22'] }];
const LINES = { order: ['Smells amazing!', 'One kabob, please.', 'I could smell the coals from the street.', 'Hungry!', 'The usual, please.'],
  happy: ['Perfect char!', 'Juicy all the way round!', 'Best skewers in town!', 'You really know your coals.'], meh: ['Hm, close enough.', 'Not quite how I asked.'],
  angry: ['Too slow!', 'I am going somewhere else.'], wrong: ['That is not what I ordered!', 'Not mine. I ordered something else.'] };
const SAVE = { day: 'skewer.house.day', best: 'skewer.house.best', upg: 'skewer.house.upg.' };
const FLAG_UNIFORM = 'skewerUniform';

// ---------------- a chunk of food: a rounded box whose four long sides (around the skewer) char separately ----------------
// side k (0..3) starts facing: 0 down (−y) · 1 +x · 2 up (+y) · 3 −x. BoxGeometry groups: +x 0, −x 1, +y 2, −y 3, +z 4, −z 5.
export const SIDE_GROUP = [3, 0, 2, 1];
export function pieceGeo(T3, k) {
  const I = ING[k], [sx, sy, sz] = I.size.map(v => v * 1.22), g = new T3.BoxGeometry(sx, sy, sz, 2, 2, 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const ux = Math.round(p.getX(i) / (sx / 2)), uy = Math.round(p.getY(i) / (sy / 2)), uz = Math.round(p.getZ(i) / (sz / 2)), n = Math.abs(ux) + Math.abs(uy) + Math.abs(uz), f = n === 3 ? I.rnd : n === 2 ? (1 + I.rnd) / 2 : 1; p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); }
  g.computeVertexNormals(); return g; }
const _ca = new THREE.Color(), _cb = new THREE.Color();
const STOPS = [0, 38, 57, 76, 96];
export function charColor(k, v, out = new THREE.Color()) { const C = ING[k].cols; v = clamp(v, 0, 96); let i = 0; while (i < 3 && v > STOPS[i + 1]) i++; const t = (v - STOPS[i]) / (STOPS[i + 1] - STOPS[i]); return out.set(C[i]).lerp(_ca.set(C[i + 1]), clamp(t, 0, 1)); }

// ---------------- the interior (stand-alone page and any world building) ----------------
export function buildSkewerHouse(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, grad, addOutline, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 12, D = 10, H = 4.2, KZ = -2.6, TOP = 1.01, ox = origin.x, oz = origin.z;
  const terra = toon('#c8693f'), plaster = toon('#f4ead8'), wood = toon('#8a5a32'), darkWood = toon('#5a3a22'), iron = toon('#2a2624'), brass = toon('#d9a441'), copper = toon('#c87a3e'), blue = toon('#2f6f8f'), stone = toon('#dccfb4'), steel = toon('#cfd6dc');
  // floor: terracotta squares, cream grout, little blue diamonds
  const floorT = CTX(256, 256, c => { c.fillStyle = '#e9dcc4'; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#c8693f' : '#b95d36'; c.fillRect(x * 64 + 3, y * 64 + 3, 58, 58); } c.fillStyle = '#2f6f8f'; for (let y = 0; y <= 4; y++) for (let x = 0; x <= 4; x++) { c.save(); c.translate(x * 64, y * 64); c.rotate(Math.PI / 4); c.fillRect(-7, -7, 14, 14); c.restore(); } });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 1.6, D / 1.6);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  { const kt = floorT.clone(); kt.needsUpdate = true; kt.repeat.set(W / 1.6, 8 / 1.6); const kf = new T3.Mesh(new T3.PlaneGeometry(W, 8), new T3.MeshToonMaterial({ map: kt, gradientMap: grad })); kf.rotation.x = -Math.PI / 2; kf.position.set(0, -0.002, -D / 2 - 4); root.add(kf); }
  // walls: warm plaster over a blue-tile dado with a terracotta band
  const wallT = CTX(256, 256, c => { c.fillStyle = '#f4ead8'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#efe2cc'; for (let i = 0; i < 40; i++) c.fillRect((i * 97) % 256, (i * 53) % 140, 18, 3); c.fillStyle = '#c8693f'; c.fillRect(0, 138, 256, 12);
    for (let y = 150; y < 256; y += 32) for (let x = 0; x < 256; x += 32) { c.fillStyle = ((x + y) / 32) % 2 ? '#2f6f8f' : '#3f8fa8'; c.fillRect(x, y, 32, 32); c.fillStyle = '#f4ead8'; c.beginPath(); c.moveTo(x + 16, y + 4); c.lineTo(x + 28, y + 16); c.lineTo(x + 16, y + 28); c.lineTo(x + 4, y + 16); c.closePath(); c.fill(); c.fillStyle = '#d9a441'; c.fillRect(x + 13, y + 13, 6, 6); } });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1);
  const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: grad });
  const cut = [], front = [], dining = [];
  for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); if (!ry) cut.push(m); }
  { const fw = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); fw.position.set(0, H / 2, D / 2); fw.rotation.y = Math.PI; root.add(fw); }
  const roof = [M(new T3.BoxGeometry(W, 0.2, D), toon('#e8dccb'), 0, H + 0.1, 0, root, 0)]; for (const x of [-4, 0, 4]) roof.push(M(new T3.BoxGeometry(0.24, 0.22, D), darkWood, x, H - 0.11, 0, root, 0)); cut.push(...roof);
  // arches painted on the side walls (blue niches with a lamp glow)
  const archT = CTX(128, 256, c => { c.clearRect(0, 0, 128, 256); c.fillStyle = '#c8693f'; c.beginPath(); c.moveTo(4, 256); c.lineTo(4, 70); c.arc(64, 70, 60, Math.PI, 0); c.lineTo(124, 256); c.closePath(); c.fill(); c.fillStyle = '#1f4f68'; c.beginPath(); c.moveTo(16, 256); c.lineTo(16, 72); c.arc(64, 72, 48, Math.PI, 0); c.lineTo(112, 256); c.closePath(); c.fill(); c.fillStyle = '#f0c060'; c.beginPath(); c.arc(64, 120, 14, 0, 7); c.fill(); });
  for (const z of [-0.5, 2.6]) for (const s of [-1, 1]) { const a = new T3.Mesh(new T3.PlaneGeometry(1.1, 2.2), new T3.MeshBasicMaterial({ map: archT, transparent: true })); a.position.set(s * (W / 2 - 0.02), 2.2, z); a.rotation.y = -s * Math.PI / 2; root.add(a); }
  // front: big window onto the street + the door
  { const fc = root.children.length; const win = new T3.Mesh(new T3.PlaneGeometry(5, 2), new T3.MeshBasicMaterial({ color: 0xbfe6ff })); win.position.set(-2.6, 1.95, D / 2 - 0.02); win.rotation.y = Math.PI; root.add(win);
    for (const x of [-5.1, -2.6, -0.1]) M(new T3.BoxGeometry(0.12, 2.1, 0.12), darkWood, x, 1.95, D / 2 - 0.06, root, 0.01); for (const y of [0.92, 2.98]) M(new T3.BoxGeometry(5.1, 0.12, 0.14), darkWood, -2.6, y, D / 2 - 0.06, root, 0.01);
    const door = new T3.Mesh(new T3.PlaneGeometry(1.5, 2.6), new T3.MeshBasicMaterial({ color: 0xd8f0ff })); door.position.set(4, 1.3, D / 2 - 0.02); door.rotation.y = Math.PI; root.add(door); M(new T3.BoxGeometry(1.7, 0.14, 0.14), terra, 4, 2.64, D / 2 - 0.06, root, 0.01);
    for (const x of [3.2, 4.8]) M(new T3.BoxGeometry(0.12, 2.6, 0.12), terra, x, 1.3, D / 2 - 0.06, root, 0.01);
    const mat = new T3.Mesh(new T3.PlaneGeometry(1.4, 0.8), toon('#7a3a20')); mat.rotation.x = -Math.PI / 2; mat.position.set(4, 0.004, D / 2 - 0.6); root.add(mat);
    front.push(...root.children.slice(fc)); }
  const K = { root, W, D, H, z: KZ, top: TOP, cut, front, dining, roof, ox, oz };
  // ---- KITCHEN ----
  // back counter (chop board lives here) + shelves of spice jars
  M(new T3.BoxGeometry(W - 0.4, TOP - 0.05, 0.7), toon('#3f8fa8'), 0, (TOP - 0.05) / 2, -4.3, root, 0.02); M(new T3.BoxGeometry(W - 0.36, 0.06, 0.76), wood, 0, TOP - 0.02, -4.3, root, 0.012);
  for (const y of [1.75, 2.35]) { cut.push(M(new T3.BoxGeometry(5, 0.05, 0.28), wood, -2.2, y, -4.84, root, 0.01)); for (let i = 0; i < 9; i++) { const jc = pick(['#c8693f', '#e0a21e', '#7a3a20', '#4f8a2a', '#b33a2a']); cut.push(M(new T3.CylinderGeometry(0.07, 0.07, 0.2, 10), toon(jc), -4.4 + i * 0.55, y + 0.13, -4.84, root, 0.006, 0.07)); } }
  // the island (work counter)
  { const tileT = CTX(128, 64, c => { for (let x = 0; x < 128; x += 16) for (let y = 0; y < 64; y += 16) { c.fillStyle = ((x + y) / 16) % 2 ? '#2f6f8f' : '#f4ead8'; c.fillRect(x, y, 16, 16); } }); tileT.wrapS = T3.RepeatWrapping; tileT.repeat.set(10, 1.5);
    const isl = M(new T3.BoxGeometry(6.5, TOP - 0.05, 1.6), new T3.MeshToonMaterial({ map: tileT, gradientMap: grad }), 0, (TOP - 0.05) / 2, -2.4, root, 0.03); isl.userData.island = true;
    M(new T3.BoxGeometry(6.6, 0.06, 1.7), stone, 0, TOP - 0.02, -2.4, root, 0.015); }
  // the GRILL (a long charcoal mangal), skewer rails, coal bed
  const G = K.grill = { x: 0, z: -2.45, y: TOP + 0.25, w: 2.3, d: 0.95, slots4: [-0.78, -0.26, 0.26, 0.78], slots5: [-0.88, -0.44, 0, 0.44, 0.88] }; G.d = 1.1;
  M(new T3.BoxGeometry(G.w, 0.2, G.d), iron, 0, TOP + 0.1, G.z, root, 0.02);
  for (const s of [-1, 1]) M(new T3.BoxGeometry(G.w + 0.04, 0.05, 0.05), iron, 0, TOP + 0.215, G.z + s * (G.d / 2 - 0.02), root, 0.008);
  for (const s of [-1, 1]) M(new T3.BoxGeometry(0.05, 0.05, G.d), iron, s * (G.w / 2 - 0.02), TOP + 0.215, G.z, root, 0.008);
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) M(new T3.BoxGeometry(0.04, 0.16, 0.04), iron, s * (G.w / 2 - 0.1) * (i % 2 ? 1 : 0.4) * (i < 2 ? 1 : -1), TOP + 0.08, G.z + s * 0.3, root, 0);
  G.coalMat = new T3.MeshToonMaterial({ color: '#3a2a22', emissive: new T3.Color('#ff5a1a'), emissiveIntensity: 0.6, gradientMap: grad });
  G.ashMat = new T3.MeshToonMaterial({ color: '#4a4440', gradientMap: grad });
  { const bed = new T3.Mesh(new T3.BoxGeometry(G.w - 0.12, 0.02, G.d - 0.12), G.ashMat); bed.position.set(0, TOP + 0.15, G.z); root.add(bed); const cg = new T3.DodecahedronGeometry(0.045, 0);
    G.coals = []; for (let i = 0; i < 70; i++) { const m = new T3.Mesh(cg, i % 3 ? G.coalMat : G.ashMat); m.position.set(rr(-G.w / 2 + 0.1, G.w / 2 - 0.1), TOP + 0.17 + rr(0, 0.025), G.z + rr(-G.d / 2 + 0.1, G.d / 2 - 0.1)); m.rotation.set(rr(0, 3), rr(0, 3), 0); m.scale.setScalar(rr(0.7, 1.3)); root.add(m); G.coals.push(m); } }
  // copper hood above the grill (cut away while working)
  { const hg = new T3.CylinderGeometry(0.35, 1.25, 0.7, 4, 1, true); hg.rotateY(Math.PI / 4); const hood = M(hg, copper, 0, 2.95, G.z - 0.1, root, 0.02); hood.scale.set(1.25, 1, 0.55); hood.material = toon('#c87a3e', { side: T3.DoubleSide }); cut.push(hood, M(new T3.BoxGeometry(0.4, H - 3.3, 0.4), copper, 0, 3.3 + (H - 3.3) / 2, G.z - 0.1, root, 0.01)); }
  // the palm FAN, standing in a holder at the grill's −x end
  { const f = new T3.Group(); f.position.set(-1.42, TOP, G.z); root.add(f); M(new T3.CylinderGeometry(0.06, 0.07, 0.08, 10), darkWood, 0, 0.04, 0, f, 0.006);
    const pivot = new T3.Group(); pivot.position.y = 0.06; f.add(pivot); M(new T3.CylinderGeometry(0.014, 0.014, 0.3, 6), darkWood, 0, 0.15, 0, pivot, 0.004);
    const fanT = CTX(128, 128, c => { c.clearRect(0, 0, 128, 128); c.translate(64, 120); for (let i = 0; i < 13; i++) { const a = -Math.PI * 0.92 + i * Math.PI * 0.84 / 12; c.strokeStyle = i % 2 ? '#d9b06a' : '#c4954a'; c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 110, Math.sin(a) * 110); c.stroke(); } c.strokeStyle = '#c8693f'; c.lineWidth = 8; c.beginPath(); c.arc(0, 0, 104, -Math.PI * 0.94, -Math.PI * 0.06); c.stroke(); });
    const blade = new T3.Mesh(new T3.PlaneGeometry(0.44, 0.44), new T3.MeshToonMaterial({ map: fanT, transparent: true, side: T3.DoubleSide, gradientMap: grad, alphaTest: 0.4 })); blade.position.y = 0.48; pivot.add(blade);
    K.fan = { x: -1.42, y: TOP + 0.4, z: G.z, pivot }; }
  // honey GLAZE pot + brush (front of the grill, thread side)
  { const pot = M(new T3.LatheGeometry([[0, 0], [0.09, 0], [0.11, 0.06], [0.1, 0.14], [0.08, 0.17], [0.09, 0.19]].map(([x, y]) => new T3.Vector2(x, y)), 20), toon('#8a4a2a', { side: T3.DoubleSide }), 1.32, TOP, -1.95, root, 0.008);
    const gl = new T3.Mesh(new T3.CircleGeometry(0.085, 18), toon('#e0961e')); gl.rotation.x = -Math.PI / 2; gl.position.set(1.32, TOP + 0.165, -1.95); root.add(gl);
    const brush = new T3.Group(); M(new T3.CylinderGeometry(0.012, 0.012, 0.3, 6), darkWood, 0, 0.15, 0, brush, 0.004); M(new T3.BoxGeometry(0.06, 0.07, 0.025), toon('#e8c070'), 0, -0.01, 0, brush, 0.004); brush.position.set(1.36, TOP + 0.2, -1.95); brush.rotation.z = -0.35; root.add(brush);
    K.glaze = { x: 1.32, z: -1.95, brush, pot }; }
  // THREAD board + skewer rack + the seven bowls
  M(new T3.BoxGeometry(0.5, 0.04, 1.0), toon('#e0c08a'), 2.2, TOP + 0.02, -2.6, root, 0.01); for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.004, 0.002, 0.98), toon('#c9a26a'), 2.06 + i * 0.07, TOP + 0.041, -2.6, root, 0);
  K.board = { x: 2.2, z: -2.6, y: TOP + 0.09 };
  { M(new T3.CylinderGeometry(0.07, 0.06, 0.2, 12), brass, 2.95, TOP + 0.1, -3.0, root, 0.008, 0.07); for (let i = 0; i < 6; i++) { const r = M(new T3.CylinderGeometry(0.006, 0.006, 0.62, 4), steel, 2.95 + Math.cos(i) * 0.025, TOP + 0.38, -3.0 + Math.sin(i) * 0.025, root, 0); r.rotation.set(Math.sin(i) * 0.12, 0, Math.cos(i) * 0.12); } K.rack = { x: 2.95, z: -3.0 }; }
  K.bowls = {}; const bowlG = new T3.LatheGeometry([[0, 0], [0.07, 0], [0.11, 0.03], [0.125, 0.08], [0.12, 0.085], [0.1, 0.035], [0, 0.03]].map(([x, y]) => new T3.Vector2(x, y)), 24);
  BOWLS.forEach((k, i) => { const x = 1.6 + i * 0.25, z = -1.85, b = new T3.Mesh(bowlG, toon(i % 2 ? '#2f6f8f' : '#3f8fa8', { side: T3.DoubleSide })); b.position.set(x, TOP, z); root.add(b); addOutline && addOutline(b, 0.006, 0.12);
    const pile = []; for (let j = 0; j < 3; j++) { const m = new T3.Mesh(pieceGeo(T3, k), toon(ING[k].cols[0])); m.scale.setScalar(0.5); m.position.set(x + (j - 1) * 0.035, TOP + 0.06 + (j === 1 ? 0.02 : 0), z + (j === 1 ? -0.02 : 0.015)); m.rotation.set(rr(-0.5, 0.5), rr(0, 3), rr(-0.4, 0.4)); root.add(m); pile.push(m); }
    K.bowls[k] = { x, z, pile }; });
  // PLATE station: plate · rice pot · pita basket · bin
  { const plate = new T3.Group(); M(new T3.CylinderGeometry(0.24, 0.2, 0.025, 28), toon('#f6f3ee'), 0, 0.012, 0, plate, 0.006, 0.24); const rim = new T3.Mesh(new T3.TorusGeometry(0.215, 0.012, 6, 28), toon('#2f6f8f')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.026; plate.add(rim); plate.position.set(-2.2, TOP, -2.5); root.add(plate);
    K.plate = { x: -2.2, z: -2.5, group: plate };
    M(new T3.CylinderGeometry(0.17, 0.15, 0.2, 18), copper, -2.95, TOP + 0.1, -2.85, root, 0.01, 0.17); { const r = new T3.Mesh(new T3.SphereGeometry(0.15, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#fbf7ee')); r.scale.y = 0.45; r.position.set(-2.95, TOP + 0.19, -2.85); root.add(r); }
    K.rice = { x: -2.95, z: -2.85 };
    M(new T3.CylinderGeometry(0.17, 0.13, 0.1, 14), toon('#c49a5a'), -2.95, TOP + 0.05, -2.25, root, 0.008, 0.17); for (let i = 0; i < 3; i++) { const p = M(new T3.CylinderGeometry(0.1, 0.1, 0.02, 3), toon('#e8c88a'), -2.95 + (i - 1) * 0.05, TOP + 0.12 + i * 0.012, -2.25, root, 0.004); p.rotation.set(-0.5, i * 1.1, 0.3); }
    K.pita = { x: -2.95, z: -2.25 };
    M(new T3.CylinderGeometry(0.15, 0.12, 0.3, 14, 1, true), toon('#8a9198', { side: T3.DoubleSide }), -2.95, TOP + 0.15, -1.72, root, 0.008); { const tr = new T3.Mesh(new T3.CircleGeometry(0.13, 14), toon('#2a2624')); tr.rotation.x = -Math.PI / 2; tr.position.set(-2.95, TOP + 0.05, -1.72); root.add(tr); }
    K.bin = { x: -2.95, z: -1.72 }; }
  // CHOP board on the back counter
  M(new T3.BoxGeometry(0.8, 0.04, 0.45), toon('#c99a62'), 1.8, TOP + 0.02, -4.3, root, 0.01); K.chop = { x: 1.8, z: -4.3, y: TOP + 0.04 };
  // FRONT COUNTER (customers stand on the dining side) + a low wall closing the −x side; the +x side is the way into the kitchen
  { const fT = CTX(128, 64, c => { c.fillStyle = '#c8693f'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#f4ead8'; for (let x = 0; x < 128; x += 32) { c.beginPath(); c.moveTo(x + 4, 64); c.lineTo(x + 4, 30); c.arc(x + 16, 30, 12, Math.PI, 0); c.lineTo(x + 28, 64); c.fill(); } }); fT.wrapS = T3.RepeatWrapping; fT.repeat.set(6, 1);
    const fm = new T3.MeshToonMaterial({ map: fT, gradientMap: grad });
    M(new T3.BoxGeometry(5.7, 1.04, 0.5), fm, 0, 0.52, -0.7, root, 0.03); M(new T3.BoxGeometry(5.8, 0.06, 0.62), wood, 0, 1.07, -0.7, root, 0.012);
    M(new T3.BoxGeometry(3.15, 1.04, 0.3), fm, -4.42, 0.52, -0.7, root, 0.02); M(new T3.BoxGeometry(3.15, 0.06, 0.4), wood, -4.42, 1.07, -0.7, root, 0.01);
    for (const [x, z] of [[5.4, -0.7], [4.7, -0.9]]) { M(new T3.BoxGeometry(0.6, 0.5, 0.5), toon('#a87a44'), x, 0.25, z, root, 0.01); }
    { const p = M(new T3.CylinderGeometry(0.28, 0.22, 0.5, 12), terra, 5.0, 0.75, -0.75, root, 0.01, 0.28); p.position.y = 0.75; for (let i = 0; i < 7; i++) { const l = M(new T3.SphereGeometry(0.22, 8, 6), toon(i % 2 ? '#4f8a2a' : '#6fae3a'), 5.0 + Math.cos(i) * 0.2, 1.25 + (i % 3) * 0.18, -0.75 + Math.sin(i) * 0.2, root, 0.008); l.scale.y = 1.3; } } }
  K.counterZ = -0.7; K.spots = [-1.7, 0, 1.7].map(x => ({ x, z: 0.3 }));
  // the sign over the counter (cut while working: it would sit between the camera and the customers)
  const sign = [];
  { const sT = CTX(1024, 192, c => { c.fillStyle = '#5a3a22'; c.fillRect(0, 0, 1024, 192); c.strokeStyle = '#d9a441'; c.lineWidth = 10; c.strokeRect(14, 14, 996, 164); c.fillStyle = '#ffd23a'; c.font = '900 92px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("EMBER'S SKEWER HOUSE", 512, 100); });
    const s = new T3.Mesh(new T3.PlaneGeometry(4.2, 0.79), new T3.MeshBasicMaterial({ map: sT })); s.position.set(0, 3.15, -0.68); root.add(s); cut.push(s); sign.push(s);
    for (const x of [-1.6, 1.6]) sign.push(M(new T3.CylinderGeometry(0.01, 0.01, H - 3.5, 4), iron, x, 3.55 + (H - 3.55) / 2, -0.68, root, 0)); cut.push(...sign.slice(1)); K.sign = sign; }
  // menu board on the back wall
  { const menuT = CTX(1024, 512, c => { c.fillStyle = '#1f2b27'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#ffd23a'; c.font = '900 64px Archivo, Arial'; c.fillText("EMBER'S SKEWERS", 40, 86); c.fillStyle = '#f2f1e8'; c.font = '700 38px Archivo, Arial'; RECIPES.forEach((r, i) => { const x = 40 + (i % 2) * 500, y = 168 + Math.floor(i / 2) * 64; c.fillText(r.name, x, y); c.fillText(r.price + 'g', x + 390, y); }); c.fillStyle = '#ff9a8a'; c.fillText('RICE 3g · PITA 2g · HONEY GLAZE 2g', 40, 462); });
    const mb = new T3.Mesh(new T3.PlaneGeometry(4.0, 2.0), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(2.6, 3.0, -D / 2 + 0.07); root.add(mb); cut.push(mb, M(new T3.BoxGeometry(4.2, 2.2, 0.06), wood, 2.6, 3.0, -D / 2 + 0.01, root, 0.01)); }
  // ---- DINING ROOM: low round tables on rugs with cushions, a window bar, plants, brass lanterns ----
  K.lamps = []; const rugT = CTX(128, 128, c => { c.fillStyle = '#8f2b1e'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#d9a441'; c.lineWidth = 6; c.strokeRect(8, 8, 112, 112); c.fillStyle = '#2f6f8f'; c.beginPath(); c.moveTo(64, 24); c.lineTo(104, 64); c.lineTo(64, 104); c.lineTo(24, 64); c.closePath(); c.fill(); c.fillStyle = '#f4ead8'; c.beginPath(); c.arc(64, 64, 12, 0, 7); c.fill(); });
  const tables = [[-4.3, 1.3], [-4.3, 3.4], [-1.9, 3.5]];
  for (const [x, z] of tables) { const dc = root.children.length; const rug = new T3.Mesh(new T3.PlaneGeometry(2.0, 1.6), new T3.MeshToonMaterial({ map: rugT, gradientMap: grad })); rug.rotation.x = -Math.PI / 2; rug.position.set(x, 0.006, z); root.add(rug);
    M(new T3.CylinderGeometry(0.55, 0.55, 0.06, 20), brass, x, 0.5, z, root, 0.01, 0.55); M(new T3.CylinderGeometry(0.08, 0.14, 0.47, 10), darkWood, x, 0.24, z, root, 0.006);
    for (const s of [-1, 1]) { const cu = M(new T3.CylinderGeometry(0.3, 0.32, 0.18, 14), toon(s > 0 ? '#2f6f8f' : '#c8693f'), x + s * 0.85, 0.09, z, root, 0.01, 0.32); cu.scale.z = 0.85; }
    for (let i = 0; i < 2; i++) M(new T3.CylinderGeometry(0.09, 0.08, 0.02, 14), toon('#f6f3ee'), x + (i ? 0.2 : -0.2), 0.54, z + 0.08, root, 0); dining.push(...root.children.slice(dc)); }
  { const dc = root.children.length; M(new T3.BoxGeometry(2.6, 0.06, 0.45), wood, -4.2, 1.1, 4.6, root, 0.01); for (const x of [-5.3, -3.1]) M(new T3.BoxGeometry(0.08, 1.07, 0.08), darkWood, x, 0.535, 4.6, root, 0); dining.push(...root.children.slice(dc)); }
  for (const [x, z] of [[-5.5, -1.3], [5.4, 4.5], [-0.5, 4.6]]) { const p = M(new T3.CylinderGeometry(0.26, 0.2, 0.46, 12), terra, x, 0.23, z, root, 0.01, 0.26); for (let i = 0; i < 6; i++) { const l = M(new T3.ConeGeometry(0.08, 0.8, 5), toon(i % 2 ? '#4f8a2a' : '#6fae3a'), x + Math.cos(i) * 0.08, 0.8, z + Math.sin(i) * 0.08, root, 0.006); l.rotation.set(Math.sin(i) * 0.4, 0, Math.cos(i) * 0.4); } dining.push(p); }
  for (const [x, z] of [...tables, [1.6, -0.2], [-1.6, -0.2], [0, -2.0]]) { const g = new T3.Group(); g.position.set(x, H - 1.1, z); root.add(g); M(new T3.CylinderGeometry(0.006, 0.006, 1.0, 4), iron, 0, 0.6, 0, g, 0); const lg = M(new T3.OctahedronGeometry(0.17, 0), brass, 0, 0, 0, g, 0.01); lg.scale.y = 1.4; M(new T3.ConeGeometry(0.12, 0.14, 6), brass, 0, 0.26, 0, g, 0.006); K.lamps.push(g); if (z < -1) cut.push(g); }
  cut.forEach(m => m.traverse(o => o.castShadow = false));
  // ---- walking: colliders (world AABBs) + room bounds ----
  const A = (x0, z0, x1, z1) => [x0 + ox, z0 + oz, x1 + ox, z1 + oz];
  K.colliders = [A(-3.3, -3.25, 3.3, -1.55), A(-6, -4.7, 6, -3.9), A(-2.9, -0.98, 2.9, -0.42), A(-6, -0.88, -2.82, -0.52), A(4.35, -1.2, 6, -0.4),
    ...tables.map(([x, z]) => A(x - 1.15, z - 0.6, x + 1.15, z + 0.6)), A(-5.55, 4.35, -2.85, 4.85), A(-5.8, -1.55, -5.2, -1.05), A(5.15, 4.25, 5.7, 4.8), A(-0.75, 4.35, -0.25, 4.85)];
  K.bounds = [-W / 2 + 0.3 + ox, -D / 2 + 0.3 + oz, W / 2 - 0.3 + ox, D / 2 - 0.3 + oz];
  K.door = { x: 4 + ox, z: D / 2 - 0.6 + oz }; K.chefSpot = { x: 0.7 + ox, z: -1.25 + oz }; K.workZone = { x0: -1.4 + ox, x1: 1.4 + ox, z0: -1.55 + oz, z1: -0.98 + oz };
  K.diners = [{ x: -4.9 + ox, z: 4.05 + oz }, { x: -3.6 + ox, z: 4.05 + oz }];
  return K; }

// ---------------- the stand-alone game: walk the room, then work a shift ----------------
export async function createSkewerShift({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#2a1c14' }), { touch, CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildSkewerHouse({ THREE, M, toon, canvasTex, scene, grad, addOutline });
  const CF = cameraFit(ST), { SAFE, shotFor } = CF, HR = hintRings(ST), TOP = K.top, PI2 = Math.PI / 2;
  const glow = (col, op = 0.5, s = 1) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, opacity: op, blending: THREE.AdditiveBlending })); sp.scale.setScalar(s); scene.add(sp); return sp; };
  const lampGl = K.lamps.map(l => { const s = glow(0xffc070, 0.5, 1.3); s.position.copy(l.position); return s; });
  const coalLight = new THREE.PointLight(0xff7a2a, 1.2, 4.5, 1.6); coalLight.position.set(0, TOP + 0.5, K.grill.z); scene.add(coalLight);
  const coalGl = [-0.8, -0.27, 0.27, 0.8].map(x => { const s = glow(0xff6a20, 0.4, 0.9); s.position.set(x, TOP + 0.2, K.grill.z); return s; });
  const flames = []; for (let i = 0; i < 10; i++) { const s = glow(0xff8a2a, 0, 0.3); s.position.set(-1 + i * 0.22, TOP + 0.24, K.grill.z + rr(-0.25, 0.25)); flames.push(s); }

  // ---------- cast ----------
  const noArms = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const emberPrint = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.lineJoin = 'round'; g.save(); g.translate(128, 112); g.rotate(-0.5);
      g.fillStyle = '#cfd6dc'; g.fillRect(-112, -5, 224, 10); g.strokeStyle = '#201e1d'; g.lineWidth = 5; g.strokeRect(-112, -5, 224, 10); g.beginPath(); g.arc(-122, 0, 12, 0, 7); g.stroke();
      ['#86492a', '#4fae3a', '#dfa052', '#f3e8f0', '#86492a'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.roundRect(-84 + i * 38, -22, 32, 44, 9); g.fill(); g.stroke(); }); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.06); g.fillStyle = '#201e1d'; g.fillRect(-118, -30, 236, 60); g.fillStyle = '#1f5f8b'; g.fillRect(-110, -23, 220, 46);
      g.font = 'italic 900 56px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('EMBER', 0, 2); g.fillStyle = '#ffd23a'; g.fillText('EMBER', 0, 2); g.restore(); });
  const ember = noArms(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#d9772e', furDark: '#9a4a18' }, torso: ['#1f5f8b', '#f2e8d8', '#123a56'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' }));
  dinerUniform(ST, ember, { print: emberPrint, stripe: '#1f5f8b', towelCol: '#c8641e', printY: 1.17 }); scene.add(ember);
  const ben = noArms(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' })); scene.add(ben);
  const benUni = dinerUniform(ST, ben, { print: emberPrint, stripe: '#1f5f8b', towelCol: '#c8641e', printY: 1.17 });
  const setUniform = on => benUni.parts.concat([benUni.print]).forEach(p => p.visible = on);
  const custFox = CUSTOMERS.map(cu => { const f = noArms(kit.makeFox({ ...CAST.player, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  const diners = K.diners.map((d, i) => { const f = noArms(kit.makeFox({ ...CAST.player, torso: CUSTOMERS[(i * 3 + 2) % CUSTOMERS.length].torso, outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); f.position.set(d.x, 0, d.z); f.rotation.y = i ? -0.5 : 0.5; scene.add(f); return f; });
  const animAll = (dt, extra = []) => { if (!kit.animFox) return; for (const f of [ember, ben, ...diners, ...extra]) if (f.visible) kit.animFox(f, dt, f.userData.spd || 0); };

  // ---------- state ----------
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const S = { phase: 'intro', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, left: SKEWER.shift, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.5, done: null,
    flash: null, flashT: 0, say: '', sayT: 0, heat: 0.35, brush: 0, react: null, reactT: 0, demo: false, bot: false, active: -1, flareCd: 12, fanAmp: 0, fanPh: 0, lastFanDir: 0,
    dialog: null, toast: null, toastT: 0, prompt: null, promptKind: null };
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 4) => { S.say = s; S.sayT = t; };
  const avail = () => RECIPES.filter(r => r.day <= S.day);
  const STOCK0 = 9, stock = {}; const outTags = {};
  const tagTex = canvasTex(128, 64, c => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#fff'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OUT', 64, 34); });
  BOWLS.forEach(k => { const nt = canvasTex(192, 64, c => { c.fillStyle = '#000'; c.fillRect(0, 0, 192, 64); c.fillStyle = ING[k].cols[0]; c.fillRect(0, 0, 14, 64); c.fillStyle = '#fff'; c.font = '900 ' + (ING[k].name.length > 7 ? 30 : 38) + 'px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ING[k].name, 103, 34, 172); }), ns = new THREE.Sprite(new THREE.SpriteMaterial({ map: nt })); ns.scale.set(0.245, 0.082, 1); ns.position.set(K.bowls[k].x, TOP + 0.03, K.bowls[k].z + 0.2); scene.add(ns); });
  BOWLS.forEach(k => { const t = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, depthTest: false })); t.scale.set(0.16, 0.08, 1); t.renderOrder = 25; t.position.set(K.bowls[k].x, TOP + 0.22, K.bowls[k].z); t.visible = false; scene.add(t); outTags[k] = t; });
  const setStock = (k, n) => { stock[k] = n; K.bowls[k].pile.forEach((m, i) => m.visible = n > i * 3); outTags[k].visible = n <= 0 && avail().some(r => r.seq.includes(k)); };
  BOWLS.forEach(k => setStock(k, STOCK0));
  const slots = () => upg('slot5') ? K.grill.slots5 : K.grill.slots4;
  let grill = [], board = null, plate = { sk: null, sides: [], sideMeshes: [], drag: false }, idSeq = 1, orders = [], custs = [];

  // ---------- skewers ----------
  const SIDE_PHI = [0, 1, 2, 3].map(k => -PI2 + k * PI2);
  const rodMat = toon('#cfd6dc'), honey = new THREE.Color('#d88a1e');
  function newSkewer() { const g = new THREE.Group(); scene.add(g); M(new THREE.BoxGeometry(0.016, 0.016, 1.0), rodMat, 0, 0, 0, g, 0.004); const ring = M(new THREE.TorusGeometry(0.042, 0.01, 6, 14), toon('#d9a441'), 0, 0, -0.55, g, 0.004); ring.rotation.y = PI2;
    const sk = { id: idSeq++, g, pieces: [], kinds: [], char: [0, 0, 0, 0], glaze: [0, 0, 0, 0], rot: 0, vel: 0, tgt: null, orderId: null, slips: 0, where: 'board', slot: -1, anim: null, flare: 0, dirty: true, lastQ: 0 };
    return sk; }
  function addPiece(sk, k, fromW) { const mats = [0, 1, 2, 3, 4, 5].map(() => new THREE.MeshToonMaterial({ color: ING[k].cols[0], gradientMap: grad })); const m = new THREE.Mesh(pieceGeo(THREE, k), mats); m.castShadow = true; addOutline(m, 0.006);
    const i = sk.pieces.length; m.position.set(0, 0, -0.24 + i * 0.12); sk.g.add(m); sk.pieces.push({ m, mats, k }); sk.kinds.push(k); sk.dirty = true;
    if (fromW) { sk.g.updateMatrixWorld(true); const l = sk.g.worldToLocal(fromW.clone()); m.userData.fly = { from: l, to: m.position.clone(), t: 0 }; m.position.copy(l); } }
  function paintSkewer(sk) { if (!sk.dirty) return; sk.dirty = false; const avg = sk.char.reduce((a, b) => a + b, 0) / 4;
    for (const p of sk.pieces) { for (let s = 0; s < 4; s++) { const mt = p.mats[SIDE_GROUP[s]], g = Math.min(1, sk.glaze[s] / 100); charColor(p.k, sk.char[s], mt.color); if (g > 0) { mt.color.lerp(honey, g * 0.3); mt.emissive.copy(honey).multiplyScalar(g * 0.16); } else mt.emissive.setRGB(0, 0, 0); }
      for (const e of [4, 5]) charColor(p.k, avg * 0.75, p.mats[e].color); } }
  const downSide = sk => ((Math.round(-sk.rot / PI2) % 4) + 4) % 4, topSide = sk => (downSide(sk) + 2) % 4;
  const slotPos = i => V3(slots()[i], K.grill.y, K.grill.z), platePos = () => V3(K.plate.x, TOP + 0.075, K.plate.z), boardPos = () => V3(K.board.x, K.board.y, K.board.z);
  function moveSk(sk, to, dur = 0.35, then) { sk.anim = { from: sk.g.position.clone(), to: to.clone(), t: 0, dur, then }; }
  function freshBoard() { board = newSkewer(); board.g.position.set(K.rack.x, TOP + 0.5, K.rack.z); board.g.rotation.x = -1.2; moveSk(board, boardPos(), 0.4); }
  const orderOf = sk => sk && orders.find(o => o.id === sk.orderId) || null;
  // slot labels: name + wanted char + the four side squares
  const labels = []; function ensureLabels() { while (labels.length < 5) { const cv = document.createElement('canvas'); cv.width = 224; cv.height = 96; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true })); sp.renderOrder = 26; sp.scale.set(0.46, 0.2, 1); sp.visible = false; scene.add(sp); labels.push({ cv, tx, sp, key: '' }); } }
  ensureLabels();
  function drawLabel(L, sk, i) { const o = orderOf(sk), want = o ? o.char : '', dn = downSide(sk), key = (o ? o.name : '?') + want + sk.char.map(v => zoneOf(v)).join('') + dn + sk.glaze.map(g => g >= GLAZE.need ? 1 : 0).join('') + (sk.flare > 0 ? 'F' : '') + (S.active === i ? 'A' : '');
    if (key === L.key) return; L.key = key; const c = L.cv.getContext('2d'); c.clearRect(0, 0, 224, 96); c.fillStyle = S.active === i ? '#ffd23a' : '#000'; c.fillRect(0, 0, 224, 96); c.fillStyle = S.active === i ? '#000' : '#ffd23a'; c.font = '900 26px Archivo, Arial'; c.textBaseline = 'top';
    c.fillText(((o ? o.name : 'NO TICKET') + (want ? ' · ' + (want === 'MEDIUM' ? 'MED' : want) : '')).slice(0, 15), 8, 6);
    for (let s = 0; s < 4; s++) { const z = zoneOf(sk.char[s]), x = 8 + s * 54; c.fillStyle = ZONE_COL[z]; c.fillRect(x, 42, 46, 46); if (want && z === want) { c.strokeStyle = '#22c55e'; c.lineWidth = 6; c.strokeRect(x + 3, 45, 40, 40); } if (s === dn) { c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x + 23, 84); c.lineTo(x + 13, 70); c.lineTo(x + 33, 70); c.fill(); } if (o && o.glaze && sk.glaze[s] >= GLAZE.need) { c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(x + 38, 50, 6, 0, 7); c.fill(); } }
    if (sk.flare > 0) { c.fillStyle = '#ec3013'; c.fillRect(150, 2, 74, 34); c.fillStyle = '#fff'; c.font = '900 22px Archivo'; c.fillText('FIRE', 158, 8); }
    L.tx.needsUpdate = true; }

  // ---------- hit targets (invisible boxes) ----------
  const hitMat = new THREE.MeshBasicMaterial({ visible: false }), hits = [];
  const hit = (type, id, x, y, z, w, h, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), hitMat); m.position.set(x, y, z); m.userData.hit = { type, id }; scene.add(m); hits.push(m); return m; };
  const slotHits = []; function buildSlotHits() { slotHits.forEach(m => { scene.remove(m); hits.splice(hits.indexOf(m), 1); }); slotHits.length = 0; slots().forEach((x, i) => slotHits.push(hit('slot', i, x, K.grill.y, K.grill.z, 0.42, 0.36, 1.15))); }
  buildSlotHits();
  hit('fan', 0, K.fan.x, TOP + 0.45, K.fan.z, 0.44, 0.8, 0.4); hit('pot', 0, K.glaze.x, TOP + 0.15, K.glaze.z, 0.28, 0.4, 0.28); hit('board', 0, K.board.x, TOP + 0.1, K.board.z, 0.55, 0.3, 1.05);
  BOWLS.forEach(k => hit('bowl', k, K.bowls[k].x, TOP + 0.1, K.bowls[k].z, 0.25, 0.3, 0.3));
  hit('plate', 0, K.plate.x, TOP + 0.1, K.plate.z, 0.55, 0.3, 0.9); hit('rice', 0, K.rice.x, TOP + 0.15, K.rice.z, 0.36, 0.4, 0.36); hit('pita', 0, K.pita.x, TOP + 0.12, K.pita.z, 0.36, 0.34, 0.36); hit('bin', 0, K.bin.x, TOP + 0.15, K.bin.z, 0.34, 0.4, 0.34);
  hit('chop', 0, K.chop.x, TOP + 0.1, K.chop.z, 0.85, 0.3, 0.5); K.spots.forEach((s, i) => hit('cust', i, s.x, 1.2, s.z, 1.0, 2.3, 1.0));
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  function pickAt(x, y, type) { const r = renderer.domElement.getBoundingClientRect(); ndc.set(x / r.width * 2 - 1, -(y / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); const hs = ray.intersectObjects(type ? hits.filter(h => h.userData.hit.type === type) : hits, false); return hs.length ? hs[0].object.userData.hit : null; }
  const _pl = new THREE.Plane(), _pv = V3();
  function planeAt(x, y, py) { const r = renderer.domElement.getBoundingClientRect(); ndc.set(x / r.width * 2 - 1, -(y / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); _pl.set(V3(0, 1, 0), -py); return ray.ray.intersectPlane(_pl, _pv) ? _pv.clone() : null; }

  // ---------- actions (touch, keys, demo and the test autopilot all go through these) ----------
  function setFocus(id) { if (!['all', 'thread', 'grill', 'plate', 'chop'].includes(id)) return; if (id === 'chop' && !chopNeed()) return; S.focus = id; }
  const hop = id => { if (S.focus !== 'all' && S.focus !== id) setFocus(id); };
  const pop = (f = 520) => tone(f, 0.08, 0.07, 'triangle');
  function threadPiece(k) {
    if (!board || board.anim) return false;
    if (stock[k] <= 0) { flash('OUT OF ' + ING[k].name + ' · CHOP MORE', '#ff9a8a', 1.6); if (S.focus !== 'all') setFocus('chop'); tone(180, 0.2, 0.06, 'square'); return false; }
    if (board.pieces.length >= 5) { flash('SKEWER IS FULL · TAP IT TO GRILL', '#ffd23a'); return false; }
    let o = orderOf(board); if (!o) { o = orders.find(x => !x.sk); if (!o) { flash('NO TICKETS WAITING', '#ffffff', 1.2); return false; } board.orderId = o.id; o.sk = board.id; }
    const need = o.seq[board.pieces.length]; if (k !== need) { board.slips++; flash('NEXT ON THE STICK: ' + ING[need].name, '#ff9a8a', 1.4); tone(160, 0.18, 0.06, 'square'); return false; }
    setStock(k, stock[k] - 1); addPiece(board, k, V3(K.bowls[k].x, TOP + 0.15, K.bowls[k].z)); pop(440 + board.pieces.length * 70);
    if (board.pieces.length === 5) { flash('LOADED · TAP THE SKEWER TO GRILL IT', '#22c55e', 1.6); }
    return true; }
  function undoPiece() { if (!board || !board.pieces.length || board.anim) return false; const p = board.pieces.pop(); board.kinds.pop(); board.g.remove(p.m); setStock(p.k, stock[p.k] + 1); pop(300); if (!board.pieces.length) { const o = orderOf(board); if (o) o.sk = null; board.orderId = null; } return true; }
  function sendToGrill(i) {
    if (!board || board.pieces.length < 5 || board.anim) { if (board && board.pieces.length < 5) flash('THREAD ALL 5 PIECES FIRST', '#ffffff', 1.2); return false; }
    if (i == null || grill[i]) i = slots().findIndex((x, j) => !grill[j]); if (i < 0) { flash('THE GRILL IS FULL', '#ff9a8a'); return false; }
    const sk = board; grill[i] = sk; sk.where = 'grill'; sk.slot = i; sk.rot = 0; sk.tgt = null; moveSk(sk, slotPos(i), 0.45, () => { tone(900, 0.25, 0.04, 'sawtooth', 0.3); puff(sk.g.position.x, TOP + 0.35, K.grill.z, 0xffffff, 3); });
    S.active = i; freshBoard(); hop('grill'); return true; }
  function turn(i, dir = -1) { const sk = grill[i]; if (!sk || sk.anim) return false; const base = sk.tgt != null ? sk.tgt : Math.round(sk.rot / PI2) * PI2; sk.tgt = base + dir * PI2; sk.vel = 0; S.active = i; tone(620, 0.05, 0.05, 'square'); return true; }
  function spritz(i) { const sk = grill[i]; if (!sk || sk.flare <= 0) return false; sk.flare = 0; for (let n = 0; n < 4; n++) puff(sk.g.position.x + rr(-0.1, 0.1), TOP + 0.3, K.grill.z + rr(-0.3, 0.3), 0xf2f2f2, 2); try { audio.burst && audio.burst(0.35, 5000, 0.12); } catch (e) {} flash('PSSHHT · FLARE OUT', '#7dd3fc', 1); return true; }
  function fanWave() { S.heat = Math.min(1, S.heat + (upg('bellows') ? 0.24 : 0.13)); S.fanAmp = 0.9; try { audio.burst && audio.burst(0.18, 900, 0.07); } catch (e) {} for (let n = 0; n < 2; n++) { const f = flames[(Math.random() * flames.length) | 0]; f.material.opacity = 0.9; } }
  function toggleBrush() { if (S.brush > 0) { S.brush = 0; return true; } S.brush = upg('brush') ? 260 : 140; tone(520, 0.12, 0.05, 'sine', 1.3); return true; }
  function brushOn(i, amt) { const sk = grill[i]; if (!sk || S.brush <= 0) return false; const s = topSide(sk), a = Math.min(amt, S.brush); sk.glaze[s] = Math.min(130, sk.glaze[s] + a); S.brush -= a; sk.dirty = true; S.active = i;
    if (Math.random() < 0.3) tone(rr(1800, 2400), 0.03, 0.015, 'sine'); if (S.brush <= 0) { S.brush = 0; flash('BRUSH IS DRY · DIP IT AGAIN', '#ffd23a', 1.2); } return true; }
  function liftOff(i) { const sk = grill[i]; if (!sk || sk.anim) return false; if (plate.sk || plate.drag) { flash('SERVE OR BIN THE PLATE FIRST', '#ff9a8a', 1.4); return false; }
    grill[i] = null; sk.where = 'plate'; sk.flare = 0; sk.vel = 0; sk.tgt = null; const r = Math.round(sk.rot / PI2) * PI2; sk.rot = r; plate.sk = sk; plate.sides = []; moveSk(sk, platePos(), 0.4, () => pop(700)); if (S.active === i) S.active = -1; hop('plate'); return true; }
  const sideMesh = k => { const g = new THREE.Group(); if (k === 'rice') { const r = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#fbf7ee')); r.scale.set(1, 0.6, 1.3); addOutline(r, 0.005, 0.09); g.add(r); g.position.set(0.13, 0.025, 0.02); } else { for (let i = 0; i < 2; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.018, 3), toon('#e8c88a')); p.position.set(0, 0.012 + i * 0.016, i * 0.04); p.rotation.y = i * 0.6; addOutline(p, 0.004); g.add(p); } g.position.set(-0.14, 0.02, -0.04); } K.plate.group.add(g); return g; };
  function addSide(k) { if (!plate.sk) { flash('PLATE A KABOB FIRST', '#ffffff', 1.2); return false; } if (plate.sides.includes(k)) { flash(SIDES[k].name + ' IS ON', '#ffffff', 1); return false; } if (SIDES[k].day > S.day) return false; plate.sides.push(k); plate.sideMeshes.push(sideMesh(k)); pop(560); return true; }
  function clearPlate() { if (plate.sk) { scene.remove(plate.sk.g); plate.sk = null; } plate.sideMeshes.forEach(m => K.plate.group.remove(m)); plate.sideMeshes = []; plate.sides = []; plate.drag = false; K.plate.group.position.set(K.plate.x, TOP, K.plate.z); }
  function binPlate() { if (!plate.sk) return false; const o = orderOf(plate.sk); if (o) o.sk = null; clearPlate(); tone(140, 0.25, 0.07, 'sawtooth', 0.5); flash('BINNED', '#ffffff', 1); return true; }
  // CHOP
  let chop = null; const knife = new THREE.Group(); { const bl = M(new THREE.BoxGeometry(0.26, 0.008, 0.07), toon('#d7dde3'), 0.13, 0, 0, knife, 0.005); const h = M(new THREE.BoxGeometry(0.13, 0.03, 0.04), toon('#201e1d'), -0.065, 0, 0, knife, 0.005); knife.rotation.y = -PI2; knife.visible = false; scene.add(knife); }
  const chopNeed = () => BOWLS.filter(k => stock[k] <= 0 && avail().some(r => r.seq.includes(k)));
  function chopStart() { const need = chopNeed(); if (!need.length) return null; if (chop && need.includes(chop.k)) return chop; if (chop) scene.remove(chop.g); const nb = board && orderOf(board) ? orderOf(board).seq[board.pieces.length] : null, k = need.includes(nb) ? nb : need[0];
    const g = new THREE.Group(), log = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.09, 0.12, 4, 1, 1), toon(ING[k].cols[0])); addOutline(log, 0.008); g.add(log); g.position.set(K.chop.x, K.chop.y + 0.05, K.chop.z); scene.add(g); chop = { k, g, cuts: [] }; return chop; }
  function chopCut(x) { if (!chop) chopStart(); if (!chop) return false; const lx = x - K.chop.x; if (Math.abs(lx) > 0.24 || chop.cuts.some(c => Math.abs(c - lx) < 0.045)) return false; chop.cuts.push(lx); const mk = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.1, 0.13), toon('#201e1d')); mk.position.x = lx; chop.g.add(mk); tone(rr(240, 300), 0.06, 0.08, 'square'); puff(x, K.chop.y + 0.1, K.chop.z, 0xffffff, 1);
    if (chop.cuts.length >= 5) { const k = chop.k; setStock(k, STOCK0); scene.remove(chop.g); chop = null; flash(ING[k].name + ' BOWL FULL', '#22c55e', 1.4); pop(880); if (!chopNeed().length) { if (S.focus === 'chop') setFocus('thread'); } else chopStart(); } return true; }
  // SERVE
  const adj = { LIGHT: ['MEDIUM'], MEDIUM: ['LIGHT', 'WELL'], WELL: ['MEDIUM'] };
  function judge(sk, o) { const z = sk.char.map(zoneOf), want = o.char; let sc = 0; z.forEach(q => sc += q === want ? 1 : adj[want].includes(q) ? 0.5 : 0);
    let stars = sc >= 3.75 ? 3 : sc >= 2.75 ? 2 : sc >= 1.5 ? 1 : 0; const notes = [];
    if (z.includes('BURNT')) { notes.push('One side burnt to carbon.'); stars = Math.min(stars, 1); } if (z.includes('RAW')) { notes.push('One side is still raw.'); stars = Math.min(stars, 1); }
    if (!notes.length && Math.max(...sk.char) - Math.min(...sk.char) > 30) notes.push('Turned unevenly. The sides do not match.');
    if (sc >= 3.75) notes.push('All four sides ' + want.toLowerCase() + '.');
    if (o.glaze && sk.glaze.some(g => g < GLAZE.need)) { stars = Math.max(0, stars - 1); notes.push('I asked for honey glaze all round.'); }
    const miss = o.sides.filter(k => !plate.sides.includes(k)); if (miss.length) { stars = Math.max(0, stars - miss.length); notes.push('Where is my ' + miss.map(k => SIDES[k].name.toLowerCase()).join(' and ') + '?'); }
    if (sk.slips) notes.push(sk.slips + ' wrong reach' + (sk.slips > 1 ? 'es' : '') + ' at the bowls.');
    return { stars, notes, sc, zones: z }; }
  function serveTo(o) { const sk = plate.sk; if (!sk || !o || !o.waiting) return false;
    if (sk.kinds.join() !== o.seq.join()) { flash(o.name + ': ' + pick(LINES.wrong), '#ff9a8a', 1.8); tone(160, 0.2, 0.06, 'square'); return false; }
    const prev = orderOf(sk); if (prev !== o) { const other = o.sk ? [board, ...grill].find(s => s && s.id === o.sk) : null; if (prev) prev.sk = other ? other.id : null; if (other) other.orderId = prev ? prev.id : null; }   // a matching kabob made for someone else: swap the tickets
    sk.orderId = o.id; o.sk = sk.id; const J = judge(sk, o), c = custs.find(c => c.o === o);
    const price = o.price, tip = J.stars >= 2 ? J.stars + Math.round(o.pat * 3) : J.stars === 1 ? 1 : 0;
    if (J.stars > 0) { S.earned += price; S.tips += tip; S.served++; S.starList.push(J.stars); } else S.lost++;
    const word = ['REFUSED', 'OKAY', 'HAPPY', 'DELIGHTED'][J.stars], col = ['#ec3013', '#e6b45a', '#ffd23a', '#22c55e'][J.stars];
    S.react = { who: o.name, word, col, stars: J.stars, tip, line: (J.stars >= 3 ? pick(LINES.happy) : J.stars ? pick(LINES.meh) : "I can't eat this.") + (J.notes.length ? ' ' + J.notes.slice(0, 2).join(' ') : '') }; S.reactT = 3;
    if (J.stars >= 2) tone(660, 0.12, 0.07, 'triangle'), setTimeout(() => tone(990, 0.16, 0.07, 'triangle'), 110); else tone(220, 0.25, 0.06, 'triangle', 0.7);
    if (c) { c.f.userData.mood = J.stars >= 2 ? 'excited' : J.stars ? 'neutral' : 'sad'; leave(c); }
    orders = orders.filter(x => x !== o); clearPlate(); if (S.demo) DM.served++; hop(board && board.pieces.length ? 'thread' : grill.some(Boolean) ? 'grill' : 'thread'); return true; }
  // CUSTOMERS
  function spawn() { const free = K.spots.map((s, i) => i).filter(i => !custs.some(c => c.spot === i)); if (!free.length) return; const spot = pick(free);
    const used = new Set(custs.map(c => c.ci)), ci = pick(CUSTOMERS.map((c, i) => i).filter(i => !used.has(i))), cu = CUSTOMERS[ci], f = custFox[ci];
    const list = avail(), r = list.length > 2 && Math.random() < 0.5 ? pick(list.filter(x => x.day >= S.day - 1)) : pick(list);
    const chars = S.day <= 1 ? ['MEDIUM', 'WELL'] : ['LIGHT', 'MEDIUM', 'WELL'], sides = Object.keys(SIDES).filter(k => SIDES[k].day <= S.day && Math.random() < 0.45), glaze = S.day >= GLAZE.day && Math.random() < 0.5;
    const o = { id: idSeq++, name: cu.name, recipe: r, seq: r.seq.slice(), char: pick(chars), glaze, sides, price: r.price + sides.reduce((a, k) => a + SIDES[k].price, 0) + (glaze ? GLAZE.price : 0), sk: null, waiting: false, pat: 1, patMax: Math.max(52, 86 - S.day * 5) * (upg('oud') ? 1.2 : 1) * (S.demo ? 2 : 1) };
    orders.push(o); f.visible = true; f.position.set(K.door.x, 0, K.door.z); f.userData.mood = 'happy'; const sp = K.spots[spot];
    custs.push({ f, ci, o, spot, path: [V3(sp.x + 0.4, 0, 1.6), V3(sp.x, 0, sp.z)], state: 'in' }); }
  function leave(c) { c.state = 'out'; c.path = [V3(c.f.position.x, 0, 1.6), V3(K.door.x, 0, K.door.z)]; c.o.waiting = false; }
  function stepCustomers(dt) {
    for (const c of custs) { const f = c.f, tg = c.path[0]; if (tg) { const dx = tg.x - f.position.x, dz = tg.z - f.position.z, d = Math.hypot(dx, dz), sp = 1.8; if (d < 0.06) { c.path.shift(); if (!c.path.length && c.state === 'in') { c.state = 'wait'; c.o.waiting = true; say(c.o.name + ': "' + pick(LINES.order) + '"', 3); } } else { const m = Math.min(d, sp * dt); f.position.x += dx / d * m; f.position.z += dz / d * m; f.rotation.y = damp(f.rotation.y, Math.atan2(dx, dz), 10, dt); } f.userData.spd = d < 0.06 ? 0 : 2.4; } else f.userData.spd = 0;
      if (c.state === 'wait') { f.rotation.y = damp(f.rotation.y, Math.PI, 8, dt); c.o.pat -= dt / c.o.patMax; f.userData.mood = c.o.pat < 0.3 ? 'sad' : 'happy';
        if (c.o.pat <= 0) { S.lost++; flash(c.o.name + ' WALKED OUT', '#ec3013', 1.6); say(c.o.name + ': "' + pick(LINES.angry) + '"', 3); [board, plate.sk, ...grill].forEach(s => { if (s && s.orderId === c.o.id) s.orderId = null; }); orders = orders.filter(x => x !== c.o); leave(c); } }
      if (c.state === 'out' && !c.path.length) { f.visible = false; c.gone = true; } }
    custs = custs.filter(c => !c.gone); }

  // ---------- touch / mouse ----------
  let drag = null; const R_ROLL = 44;
  const brushRest = () => { K.glaze.brush.position.set(K.glaze.x + 0.04, TOP + 0.2, K.glaze.z); K.glaze.brush.rotation.set(0, 0, -0.35); };
  function brushFollow(L) { const p = planeAt(L.x, L.y, K.grill.y + 0.1); if (!p) return; K.glaze.brush.position.set(p.x, p.y + 0.05, p.z); K.glaze.brush.rotation.set(0.5, 0, 0.2); }
  function knifeFollow(L) { const p = planeAt(L.x, L.y, K.chop.y + 0.12); if (p) knife.position.set(p.x, p.y, p.z); }
  function onDown(e) { try { audio.init && audio.init(); } catch (er) {} sound();
    const L = local(e);
    if (S.phase === 'walk') { drag = { type: 'look', x: L.x, y: L.y }; return; }
    if (S.phase !== 'shift' || S.demo) return; e.preventDefault && e.preventDefault();
    if (S.focus === 'chop' && chopNeed().length) { chopStart(); drag = { type: 'chop', last: planeAt(L.x, L.y, K.chop.y + 0.06) }; knife.visible = true; knifeFollow(L); return; }
    const h = pickAt(L.x, L.y); if (!h) return; const T = h.type;
    if (T === 'slot') { if (grill[h.id]) { S.active = h.id; drag = { type: 'grill', i: h.id, x0: L.x, y0: L.y, lx: L.x, lt: performance.now(), axis: null, vel: 0, wl: null }; if (S.brush > 0) brushFollow(L); } else if (board && board.pieces.length === 5) sendToGrill(h.id); else flash('THREAD A SKEWER FIRST', '#ffffff', 1.1); }
    else if (T === 'fan') { drag = { type: 'fan', lx: L.x, acc: 0, dir: 0 }; fanWave(); }
    else if (T === 'pot') { if (S.day < GLAZE.day) flash('HONEY GLAZE STARTS ON DAY ' + GLAZE.day, '#ffffff', 1.2); else toggleBrush(); }
    else if (T === 'board') { if (board && board.pieces.length === 5) sendToGrill(); else if (board && board.pieces.length) undoPiece(); else flash('TAP THE BOWLS IN THE TICKET ORDER', '#ffffff', 1.3); }
    else if (T === 'bowl') threadPiece(h.id);
    else if (T === 'plate') { if (plate.sk && !plate.sk.anim) drag = { type: 'plate', x0: L.x, y0: L.y, moved: false }; else flash('SLIDE A KABOB OFF THE GRILL FIRST', '#ffffff', 1.2); }
    else if (T === 'rice' || T === 'pita') { if (SIDES[T].day > S.day) flash(SIDES[T].name + ' STARTS ON DAY ' + SIDES[T].day, '#ffffff', 1.2); else addSide(T); }
    else if (T === 'bin') binPlate();
    else if (T === 'cust') { const c = custs.find(c => c.spot === h.id && c.state === 'wait'); if (c && plate.sk) serveTo(c.o); }
    else if (T === 'chop') { if (chopNeed().length) setFocus('chop'); } }
  function onMove(e) { const L = local(e);
    if (!drag) { if (S.phase === 'shift' && S.brush > 0 && !S.demo && e.pointerType === 'mouse') brushFollow(L); if (S.focus === 'chop' && e.pointerType === 'mouse') { knife.visible = !!chopNeed().length; knifeFollow(L); } return; }
    if (drag.type === 'look') { lookBy(L.x - drag.x, L.y - drag.y); drag.x = L.x; drag.y = L.y; return; }
    if (drag.type === 'grill') { const dx = L.x - drag.x0, dy = L.y - drag.y0; if (!drag.axis && Math.hypot(dx, dy) > 10) drag.axis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
      if (drag.axis === 'h') { if (S.brush > 0) { brushFollow(L); const p = planeAt(L.x, L.y, K.grill.y + 0.05); if (drag.wl && p) brushOn(drag.i, p.distanceTo(drag.wl) * 300); drag.wl = p; }
        else { const sk = grill[drag.i]; if (sk) { const d = (L.x - drag.lx) / R_ROLL, now = performance.now(), ddt = Math.max(8, now - drag.lt) / 1000; sk.rot += d; sk.tgt = null; sk.vel = 0; drag.vel = drag.vel * 0.5 + 0.5 * d / ddt; drag.lt = now; const q = Math.round(sk.rot / PI2); if (q !== sk.lastQ) { sk.lastQ = q; tone(560, 0.03, 0.04, 'square'); } } } drag.lx = L.x; }
      else if (drag.axis === 'v' && Math.abs(dy) > 38) { const i = drag.i; drag = null; liftOff(i); }
      return; }
    if (drag.type === 'fan') { const d = L.x - drag.lx; drag.lx = L.x; const s = Math.sign(d); if (s && s !== drag.dir) { if (drag.acc > 24) fanWave(); drag.acc = 0; drag.dir = s; } drag.acc += Math.abs(d); return; }
    if (drag.type === 'plate') { if (Math.hypot(L.x - drag.x0, L.y - drag.y0) > 8) drag.moved = true; if (!drag.moved) return; plate.drag = true; const p = planeAt(L.x, L.y, TOP + 0.14); if (p) K.plate.group.position.set(p.x, TOP + 0.14, p.z); return; }
    if (drag.type === 'chop') { knifeFollow(L); const p = planeAt(L.x, L.y, K.chop.y + 0.06), zc = K.chop.z; if (p && drag.last && (drag.last.z - zc) * (p.z - zc) < 0) { const t = (zc - drag.last.z) / (p.z - drag.last.z); chopCut(drag.last.x + (p.x - drag.last.x) * t); } drag.last = p; } }
  function onUp(e) { if (!drag) return; const L = local(e), d = drag; drag = null;
    if (d.type === 'grill') { const sk = grill[d.i]; if (!sk) return; if (!d.axis) { if (sk.flare > 0) spritz(d.i); else turn(d.i); } else if (d.axis === 'h' && S.brush <= 0) { sk.vel = clamp(d.vel, -26, 26); if (Math.abs(sk.vel) < 1) sk.vel = 0; } }
    else if (d.type === 'plate') { if (!d.moved) { const o = orderOf(plate.sk); flash('DRAG THE PLATE TO ' + (o ? o.name : 'THE CUSTOMER'), '#ffd23a', 1.3); return; }
      let ok = false; const h = pickAt(L.x, L.y, 'cust'); let c = h ? custs.find(c => c.spot === h.id && c.state === 'wait') : null;
      if (!c) { const p = K.plate.group.position; c = custs.filter(c => c.state === 'wait').find(c => Math.hypot(K.spots[c.spot].x - p.x, K.spots[c.spot].z - p.z) < 1.1 || (p.z > K.counterZ - 0.2 && Math.abs(K.spots[c.spot].x - p.x) < 0.8)); }
      if (c) ok = serveTo(c.o); if (!ok) { const p = K.plate.group.position; if (Math.hypot(p.x - K.bin.x, p.z - K.bin.z) < 0.4) ok = binPlate(); }
      if (!ok) { plate.drag = false; K.plate.group.position.set(K.plate.x, TOP, K.plate.z); } }
    else if (d.type === 'chop') { if (e.pointerType !== 'mouse') knife.visible = false; } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const keys = new Set(); const FOCUS_KEYS = { Digit1: 'all', Digit2: 'thread', Digit3: 'grill', Digit4: 'plate', Digit5: 'chop' };
  const onKD = e => { if (S.phase === 'shift' && !S.demo && FOCUS_KEYS[e.code]) { setFocus(FOCUS_KEYS[e.code]); return; } if (S.phase === 'walk') keys.add(e.code); }, onKU = e => keys.delete(e.code), onBlur = () => keys.clear();
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- sound: coal sizzle + a little oud loop (from the 2D stall) ----------
  let snd = null; const MUSIC = (() => { const scale = [62, 63, 66, 67, 69, 70, 74, 75, 78, 79], notes = [];
    [[0, 4], [0.5, 5], [1, 6], [2, 5], [3, 3], [4, 4], [5, 2], [6, 3], [7, 1], [8, 4], [8.5, 6], [9, 7], [10, 6], [11, 4], [12, 5], [13, 3], [14, 4], [15, 2], [16, 6], [16.5, 7], [17, 8], [18, 7], [19, 5], [20, 6], [21, 4], [22, 5], [23, 3], [24, 4], [24.5, 3], [25, 2], [26, 3], [27, 1], [28, 2], [29, 0], [30, 1], [31, 0]].forEach(([b, i]) => notes.push({ b, m: scale[i], v: 'pluck' }));
    [0, 4, 8, 12, 16, 20, 24, 28].forEach(b => { notes.push({ b, m: 38, v: 'bass' }); notes.push({ b: b + 2.5, m: 45, v: 'bass' }); }); for (let b = 0; b < 32; b++) notes.push({ b, m: b % 4 === 0 ? 84 : 90, v: 'drum' }); return { notes, beats: 32, spb: 0.33 }; })();
  let musB = 0; const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function sound() { const ctx = audio.ctx; if (!ctx || snd || !audio.noise) return; try { const s = ctx.createBufferSource(); s.buffer = audio.noise; s.loop = true; const b = ctx.createBiquadFilter(); b.type = 'bandpass'; b.frequency.value = 3800; b.Q.value = 0.5; const g = ctx.createGain(); g.gain.value = 0; s.connect(b); b.connect(g); g.connect(audio.master); s.start(); snd = { g }; } catch (e) {} }
  function stepSound(dt) { const ctx = audio.ctx; if (!ctx) return; if (!snd) sound(); const n = S.phase === 'shift' ? grill.filter(Boolean).length : 0; if (snd) snd.g.gain.setTargetAtTime(Math.min(0.09, 0.016 * n * (0.6 + S.heat)) + (S.phase === 'walk' ? 0.006 : 0), ctx.currentTime, 0.2);
    if (audio.muted || S.phase === 'glide') return; const pb = musB % MUSIC.beats; musB += dt / MUSIC.spb; const nb = musB % MUSIC.beats, play = b => nb >= pb ? b >= pb && b < nb : b >= pb || b < nb;
    for (const N of MUSIC.notes) if (play(N.b)) { if (N.v === 'pluck') tone(hz(N.m), 0.45, 0.022, 'triangle'); else if (N.v === 'bass') tone(hz(N.m), 0.4, 0.035, 'sine'); else try { audio.burst(0.04, N.m === 84 ? 900 : 2600, 0.02); } catch (e) {} } }

  // ---------- autopilot: the demo (with captions + a glowing hand) and the test bot ----------
  const DM = { on: false, cd: 0, served: 0, cap: '', key: '', p: null, day0: 1, t: 0 };
  const hand = glow(0xffd23a, 0.95, 0.3); hand.material.depthTest = false; hand.renderOrder = 30; hand.visible = false;
  const nextNeed = () => { if (!board || board.pieces.length >= 5) return null; const o = orderOf(board) || orders.find(x => !x.sk); return o ? o.seq[board.pieces.length] : null; };
  function botAct() { const A = (cap, key, p, st) => ({ cap, key, p, st });
    for (let i = 0; i < grill.length; i++) { const sk = grill[i]; if (sk && sk.flare > 0 && !sk.anim) { spritz(i); return A('FLARE-UP! TAP THE FLAMES TO SPRITZ THEM', 'TAP', slotPos(i), 'grill'); } }
    if (plate.sk && !plate.sk.anim) { const o = orderOf(plate.sk) || orders.find(x => x.waiting && x.seq.join() === plate.sk.kinds.join());
      if (!o) { binPlate(); return A('NOBODY ORDERED THAT ONE · DRAG IT TO THE BIN', 'DRAG', V3(K.bin.x, TOP + 0.2, K.bin.z), 'plate'); }
      const miss = o.sides.find(k => !plate.sides.includes(k)); if (miss) { addSide(miss); return A('ADD ' + SIDES[miss].name + ' · TAP THE ' + (miss === 'rice' ? 'RICE POT' : 'PITA BASKET'), 'TAP', V3(K[miss].x, TOP + 0.25, K[miss].z), 'plate'); }
      if (o.waiting) { const c = custs.find(c => c.o === o), p = V3(K.spots[c.spot].x, 1.5, K.spots[c.spot].z); serveTo(o); return A('DRAG THE PLATE ONTO ' + o.name, 'DRAG', p, 'plate'); } }
    for (let i = 0; i < grill.length; i++) { const sk = grill[i]; if (!sk || sk.anim) continue; const o = orderOf(sk), want = CHARZ[o ? o.char : 'MEDIUM'], dn = downSide(sk), mid = want.lo + (want.hi - want.lo) * 0.42, allIn = sk.char.every(v => v >= want.lo + 1), needG = o && o.glaze && sk.glaze.some(g => g < GLAZE.need), settled = sk.tgt == null ? Math.abs(sk.vel) < 0.1 : Math.abs(sk.rot - sk.tgt) < 0.08;
      if (allIn && !needG) { if (!plate.sk) { liftOff(i); return A('ALL FOUR SIDES DONE · DRAG ALONG THE KABOB TO SLIDE IT OFF', 'DRAG ↓', slotPos(i), 'grill'); } continue; }
      if (sk.char[dn] >= mid && !allIn) { turn(i); return A('SWIPE ACROSS THE KABOB TO ROLL IT · OR TAP FOR A QUARTER TURN', 'SWIPE ↔', slotPos(i), 'grill'); }
      if (needG && settled) { const ts = topSide(sk); if (sk.glaze[ts] < GLAZE.need) { if (S.brush <= 0) { toggleBrush(); return A('HONEY GLAZE · TAP THE POT TO DIP THE BRUSH', 'TAP', V3(K.glaze.x, TOP + 0.25, K.glaze.z), 'grill'); } brushOn(i, 75); return A('RUB THE BRUSH ALONG THE TOP SIDE', 'RUB ↔', slotPos(i), 'grill'); } else if (allIn) { turn(i); return A('ROLL IT TO GLAZE THE NEXT SIDE', 'TAP', slotPos(i), 'grill'); } } }
    if (S.brush > 0 && !grill.some(sk => sk && orderOf(sk) && orderOf(sk).glaze && sk.glaze.some(g => g < GLAZE.need))) toggleBrush();
    if (grill.some(Boolean) && S.heat < 0.42) { fanWave(); return A('SWIPE BACK AND FORTH ON THE FAN · HOTTER COALS', 'SWIPE ↔', V3(K.fan.x, TOP + 0.5, K.fan.z), 'grill'); }
    const nk = nextNeed(), free = slots().some((x, j) => !grill[j]);
    if (nk && stock[nk] <= 0) { const c = chopStart(), xs = [-0.2, -0.1, 0, 0.1, 0.2]; chopCut(K.chop.x + xs[c ? c.cuts.length : 0]); return A('OUT OF ' + ING[nk].name + ' · SWIPE ACROSS IT TO CHOP', 'SWIPE ↕', V3(K.chop.x, K.chop.y + 0.1, K.chop.z), 'chop'); }
    if (board && board.pieces.length === 5 && !board.anim && free) { sendToGrill(); return A('LOADED · TAP THE SKEWER TO PUT IT ON THE COALS', 'TAP', boardPos(), 'thread'); }
    if (nk && board && !board.anim && (free || board.pieces.length)) { threadPiece(nk); return A('TAP THE ' + ING[nk].name + ' BOWL · FOLLOW THE TICKET', 'TAP', V3(K.bowls[nk].x, TOP + 0.2, K.bowls[nk].z), 'thread'); }
    return null; }
  function stepBot(dt) { DM.cd -= dt; if (DM.cd > 0) return; const a = botAct(); DM.cd = a ? (S.demo ? 0.8 : 0.3) : 0.15;
    if (a && S.demo) { DM.cap = a.cap; DM.key = a.key; DM.p = a.p; if (CW() < CHh() || S.focus !== 'all') S.focus = a.st; } }
  function demoStart() { if (DM.on) return; try { audio.init && audio.init(); } catch (e) {} DM.on = true; DM.served = 0; DM.cd = 2; DM.day0 = S.day; DM.cap = "WATCH A SHIFT AT EMBER'S"; DM.key = ''; S.phase = 'intro'; S.done = null; S.day = 3; startShift(true); S.next = 0.6; DM.endT = 0; setStock('chicken', 2); setStock('lamb', 2); }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; resetKitchen(); S.day = DM.day0; S.phase = 'intro'; S.done = null; ben.visible = true; placeIntro(); }

  // ---------- walking (Game HUD contract) ----------
  const WK = { yaw: 0, pitch: 0.62, dist: 7, sx: 0, sy: 0, x: K.door.x, z: K.door.z - 0.6, face: Math.PI, lock: false };
  function collide() { const r = 0.32; for (const [x0, z0, x1, z1] of K.colliders) { const cx = clamp(WK.x, x0, x1), cz = clamp(WK.z, z0, z1), dx = WK.x - cx, dz = WK.z - cz, d = Math.hypot(dx, dz);
      if (d < r) { if (d > 1e-4) { WK.x = cx + dx / d * r; WK.z = cz + dz / d * r; } else { const pen = [[WK.x - x0 + r, -1, 0], [x1 - WK.x + r, 1, 0], [WK.z - z0 + r, 0, -1], [z1 - WK.z + r, 0, 1]].sort((a, b) => a[0] - b[0])[0]; WK.x += pen[1] * pen[0]; WK.z += pen[2] * pen[0]; } } }
    const [bx0, bz0, bx1, bz1] = K.bounds; WK.x = clamp(WK.x, bx0, bx1); WK.z = clamp(WK.z, bz0, bz1); }
  function stepWalk(dt) { let sx = WK.sx, sy = WK.sy; if (keys.has('KeyD') || keys.has('ArrowRight')) sx += 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) sx -= 1; if (keys.has('KeyW') || keys.has('ArrowUp')) sy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) sy -= 1;
    if (S.dialog) sx = sy = 0; const l = Math.hypot(sx, sy); if (l > 1) { sx /= l; sy /= l; }
    const sy0 = Math.sin(WK.yaw), cy0 = Math.cos(WK.yaw), vx = cy0 * sx - sy0 * sy, vz = -sy0 * sx - cy0 * sy, sp = 3.4 * Math.min(1, l);
    WK.x += vx * sp * dt; WK.z += vz * sp * dt; collide(); if (l > 0.05) WK.face = Math.atan2(vx, vz);
    ben.position.set(WK.x, 0, WK.z); ben.rotation.y = ben.rotation.y + Math.atan2(Math.sin(WK.face - ben.rotation.y), Math.cos(WK.face - ben.rotation.y)) * Math.min(1, dt * 12); ben.userData.spd = sp;
    const dE = Math.hypot(WK.x - K.chefSpot.x, WK.z - K.chefSpot.z), wz = K.workZone, inWork = WK.x > wz.x0 && WK.x < wz.x1 && WK.z > wz.z0 && WK.z < wz.z1, nearDoor = Math.hypot(WK.x - K.door.x, WK.z - K.door.z) < 1.2;
    S.promptKind = dE < 2.5 || inWork ? 'chef' : nearDoor ? 'door' : null; S.prompt = S.promptKind === 'chef' ? (inWork ? 'Work the grill' : 'Talk to CHEF EMBER') : S.promptKind === 'door' ? 'The street' : null;
    ember.userData.lookAt = dE < 5 ? V3(WK.x, 1.6, WK.z) : null; ember.userData.talking = !!S.dialog;
    if (!WK.lock && l < 0.05 && !drag) { /* gentle auto-follow: nothing */ }
    const dist = WK.dist * (port() ? 1.3 : 1), tgt = V3(WK.x, 1.45, WK.z), cp = Math.cos(WK.pitch), off = V3(Math.sin(WK.yaw) * cp, Math.sin(WK.pitch), Math.cos(WK.yaw) * cp).multiplyScalar(dist), want = tgt.clone().add(off);
    want.x = clamp(want.x, -K.W / 2 + 0.25 + K.ox, K.W / 2 - 0.25 + K.ox); want.z = clamp(want.z, -K.D / 2 + 0.25 + K.oz, K.D / 2 - 0.25 + K.oz); { const hz = Math.hypot(want.x - tgt.x, want.z - tgt.z); want.y = Math.max(want.y, tgt.y + Math.sqrt(Math.max(0, dist * dist - hz * hz))); } want.y = clamp(want.y, 0.6, 9);   // walls stop the camera going back: it climbs instead (the roof is lifted)
    camera.position.lerp(want, Math.min(1, dt * 8)); CAM.look.lerp(tgt, Math.min(1, dt * 10)); camera.lookAt(CAM.look); }
  function lookBy(dx, dy) { WK.yaw -= dx * 0.006; WK.pitch = clamp(WK.pitch + dy * 0.004, 0.08, 1.15); }
  const TALK = { root: () => "Welcome to the Skewer House! Lamb, chicken and the sweetest pineapple, all over real coals. Want to work the grill?",
    menu: () => 'On the grill today (day ' + S.day + '): ' + avail().map(r => r.name).join(', ') + '.' + (S.day >= SIDES.rice.day ? ' Rice and pita on the side.' : '') + (S.day >= GLAZE.day ? ' Some folks want honey glaze.' : ''),
    how: () => 'Swipe across a kabob to roll it, or tap it for a quarter turn. Only the side facing the coals cooks, so keep it rolling until all four sides match the ticket. Fan the coals when they go dull!' };
  const CHOICES = [{ text: 'Put me to work.', go: 'work' }, { text: "What's on the grill today?", go: 'menu' }, { text: 'How do I turn the kabobs?', go: 'how' }, { text: 'Just looking around.', go: 'bye', bye: true }];
  function openTalk(key = 'root', asked = []) { S.dialog = { name: 'CHEF EMBER', role: SKEWER.short, text: TALK[key](), choices: CHOICES.map(c => ({ ...c, asked: asked.includes(c.go) })), step: 1, total: 1, more: false, required: false, asked }; tone(700, 0.06, 0.04, 'triangle'); }
  function talk() { if (S.phase !== 'walk') return; if (S.dialog) { closeDialog(); return; } if (S.promptKind === 'chef') openTalk(); else if (S.promptKind === 'door') { S.toast = 'Out on the street is your world map. Drop this room into any building to link the door.'; S.toastT = 4; } }
  function choose(i) { const d = S.dialog; if (!d || !d.choices) return; const c = d.choices[i]; if (!c) return; if (c.go === 'work') { S.dialog = null; toIntro(); return; } if (c.go === 'bye') { S.dialog = null; return; } openTalk(c.go, [...d.asked, c.go]); }
  function closeDialog() { S.dialog = null; }

  // ---------- cameras ----------
  const CAM = { look: V3(0, 1.2, -2), from: null, to: null, t: 1, dur: 1 };
  const port = () => CW() < CHh();
  function shotPoints(id) { const T = TOP, P = (x, z, y = T) => V3(x, y, z), out = [];
    if (id === 'thread') out.push(P(1.95, -3.12), P(2.45, -2.08), P(1.45, -1.98, T + 0.12), P(3.25, -1.72), P(2.95, -3.0, T + 0.7), P(1.45, -3.12));
    else if (id === 'grill') out.push(P(-1.2, -3.05, K.grill.y), P(1.2, -3.05, K.grill.y), P(-1.2, -1.82, K.grill.y), P(1.2, -1.82, K.grill.y), P(-1.42, -2.45, T + 0.78), P(1.0, -1.9, T + 0.62), P(-1.0, -1.9, T + 0.62), P(1.45, -1.85, T + 0.2));
    else if (id === 'plate') { out.push(P(-2.55, -2.8), P(-1.85, -2.2), P(-3.15, -3.05), P(-3.15, -1.55, T + 0.3)); for (const s of K.spots) out.push(P(s.x - 0.4, s.z, 2.0), P(s.x + 0.4, s.z, 0.9)); }
    else if (id === 'chop') out.push(P(1.32, -4.55), P(2.28, -4.05), P(1.8, -4.3, T + 0.35));
    else { out.push(P(-3.3, -3.2), P(3.3, -3.2), P(-3.3, -1.6), P(3.3, -1.6)); for (const s of K.spots) out.push(P(s.x, s.z, 1.7)); }
    return out; }
  const workShot = (id = S.focus) => shotFor('w:' + id + (port() ? 'P' : 'L'), () => shotPoints(id), id === 'grill' ? (port() ? 1.0 : 0.86) : port() ? 1.2 : 0.92, 0, id === 'all' ? 0.03 : 0.05);
  const wideShot = () => { const e = K.chefSpot, b = V3(-0.4, 0, 0.55), pts = [V3(e.x - 0.5, 0.15, e.z), V3(e.x + 0.5, 2.35, e.z), V3(b.x - 0.5, 0.05, b.z), V3(b.x + 0.5, 2.35, b.z), V3(b.x, 2.5, b.z)];
    return port() ? shotFor('wideP', () => pts, 0.12, Math.PI - 0.22, 0.1) : shotFor('wideL', () => pts, 0.14, Math.PI - 0.32, 0.06); };
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  function camTo(shot, dt, k = 4) { if (CAM.from && CAM.t < 1) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const e = CAM.t * CAM.t * (3 - 2 * CAM.t); camera.position.lerpVectors(CAM.from.pos, shot.pos, e); CAM.look.lerpVectors(CAM.from.look, shot.look, e); if (CAM.t >= 1) CAM.from = null; }
    else { camera.position.lerp(shot.pos, Math.min(1, dt * k)); CAM.look.lerp(shot.look, Math.min(1, dt * k)); } camera.lookAt(CAM.look); }

  // ---------- phases ----------
  function placeIntro() { ember.visible = true; ember.position.set(K.chefSpot.x, 0, K.chefSpot.z); ember.rotation.y = -0.15; ember.userData.lookAt = null; ember.userData.mood = 'happy';
    ben.visible = true; ben.position.set(-0.4, 0, 0.55); ben.rotation.y = 0.25; ben.userData.spd = 0; setUniform(save.flag(FLAG_UNIFORM)); WK.x = -0.4; WK.z = 0.55; }
  function resetKitchen() { [board, ...grill].forEach(sk => sk && scene.remove(sk.g)); grill = new Array(slots().length).fill(null); board = null; clearPlate(); custs.forEach(c => c.f.visible = false); custs = []; orders = [];
    if (chop) { scene.remove(chop.g); chop = null; } S.brush = 0; S.heat = 0.35; S.active = -1; S.flash = null; S.react = null; S.say = ''; knife.visible = false; brushRest(); labels.forEach(L => { L.sp.visible = false; L.key = ''; }); drag = null; }
  function startShift(demo = false) { if (!['intro', 'done', 'walk'].includes(S.phase)) return; if (!demo && DM.on) demoStop(); try { audio.init && audio.init(); } catch (e) {} sound();
    S.dialog = null; resetKitchen(); BOWLS.forEach(k => setStock(k, STOCK0)); buildSlotHits(); grill = new Array(slots().length).fill(null);
    Object.assign(S, { phase: 'glide', demo, t: 0, left: SKEWER.shift, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.5, done: null, heat: 0.35, flareCd: 14, react: null, focus: port() || CHh() < 520 ? 'thread' : 'all' });
    freshBoard(); ben.visible = false; ember.visible = true; ember.position.set(-4.0, 0, -2.3); ember.rotation.y = Math.PI - 0.7; ember.userData.lookAt = null; ember.userData.mood = 'excited';
    glideTo(workShot(), 1.6); say('EMBER: "Thread on the left, coals in the middle, plates on the right. Keep those kabobs turning!"', 6); }
  function finish() { const day = S.day, served = S.served, sum = S.starList.reduce((a, b) => a + b, 0), avg = S.starList.length ? sum / S.starList.length : 0, wage = 10 + day * 2, total = wage + S.earned + S.tips, eod = served >= 3 && avg >= 2.5, unlock = [], newDay = served >= 3 + day;
    if (!S.demo) { save.addGold(total); save.best(SAVE.best, served); if (served >= 3 && !save.flag(FLAG_UNIFORM)) { save.setFlag(FLAG_UNIFORM); unlock.push('THE SKEWER HOUSE UNIFORM · hat, towel + EMBER shirt'); }
      if (newDay) { save.setStat(SAVE.day, day + 1); const nr = RECIPES.filter(r => r.day === day + 1).map(r => r.name); if (nr.length) unlock.push('NEW ON THE MENU · ' + nr.join(', ')); if (SIDES.rice.day === day + 1) unlock.push('RICE + PITA ON THE SIDE'); if (GLAZE.day === day + 1) unlock.push('HONEY GLAZE + THE BRUSH'); if (day + 1 === 2) unlock.push('FLARE-UPS · keep the spray handy'); S.day = day + 1; } }
    S.done = { day, served, lost: S.lost, avg: avg.toFixed(1), wage, earned: S.earned, tips: S.tips, total, eod, unlock, newDay, stars: sum };
    resetKitchen(); S.phase = 'done'; placeIntro(); }
  function toIntro() { if (DM.on) { demoStop(); return; } resetKitchen(); S.phase = 'intro'; S.done = null; S.dialog = null; placeIntro(); }
  function toWalk() { if (DM.on) demoStop(); if (navigator.userActivation && navigator.userActivation.isActive) { try { audio.init && audio.init(); } catch (e) {} sound(); } resetKitchen(); S.done = null; S.dialog = null; placeIntro(); setUniform(false); S.phase = 'walk'; WK.x = ben.position.x; WK.z = ben.position.z; WK.face = Math.PI; WK.yaw = 0.15; WK.pitch = 0.62; ben.rotation.y = Math.PI; ember.rotation.y = 0; }
  function buyUpgrade(id) { const u = UPGRADES.find(x => x.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ff9a8a'); return false; } save.setStat(SAVE.upg + id, 1); tone(880, 0.15, 0.07, 'triangle'); if (id === 'slot5') buildSlotHits(); return true; }

  // ---------- hints (yellow rings + NEXT on the station bar) ----------
  function hintNow() { const R = (station, text, p, r = 0.2) => ({ station, text, p, r }), at = (x, z, y = TOP + 0.03) => V3(x, y, z);
    for (let i = 0; i < grill.length; i++) if (grill[i] && grill[i].flare > 0) return R('grill', 'FIRE! TAP THE KABOB TO SPRITZ IT', at(slots()[i], K.grill.z, K.grill.y), 0.24);
    if (plate.sk && !plate.sk.anim) { const o = orderOf(plate.sk); if (!o) return R('plate', 'NOBODY ORDERED THAT · DRAG IT TO THE BIN', at(K.bin.x, K.bin.z, TOP + 0.3)); const miss = o.sides.find(k => !plate.sides.includes(k)); if (miss) return R('plate', 'TAP THE ' + (miss === 'rice' ? 'RICE POT' : 'PITA BASKET'), at(K[miss].x, K[miss].z, TOP + 0.22));
      if (o.waiting) { const c = custs.find(c => c.o === o); if (c) return R('plate', 'DRAG THE PLATE TO ' + o.name, at(K.spots[c.spot].x, K.spots[c.spot].z, 0.02), 0.55); } }
    for (let i = 0; i < grill.length; i++) { const sk = grill[i]; if (!sk || sk.anim) continue; const o = orderOf(sk), want = CHARZ[o ? o.char : 'MEDIUM'], dn = downSide(sk), allIn = sk.char.every(v => v >= want.lo), needG = o && o.glaze && sk.glaze.some(g => g < GLAZE.need), p = at(slots()[i], K.grill.z, K.grill.y);
      if (sk.char[dn] >= (want.lo + want.hi) / 2 && !allIn) return R('grill', 'THAT SIDE IS DONE · SWIPE ACROSS TO ROLL IT', p, 0.24);
      if (needG && allIn) return S.brush > 0 ? R('grill', 'RUB THE BRUSH ON IT · ROLL FOR THE NEXT SIDE', p, 0.24) : R('grill', 'GLAZE IT · TAP THE HONEY POT', at(K.glaze.x, K.glaze.z, TOP + 0.2));
      if (allIn && !needG) return R('grill', plate.sk ? 'READY · CLEAR THE PLATE FIRST' : 'READY · DRAG ALONG IT TO SLIDE IT OFF', p, 0.24); }
    if (board && board.pieces.length === 5 && !board.anim) return R('thread', 'TAP THE LOADED SKEWER TO GRILL IT', at(K.board.x, K.board.z, TOP + 0.06), 0.3);
    const nk = nextNeed(); if (nk) return stock[nk] <= 0 ? R('chop', 'OUT OF ' + ING[nk].name + ' · SWIPE ACROSS IT TO CHOP', at(K.chop.x, K.chop.z, TOP + 0.06), 0.3) : R('thread', 'TAP THE ' + ING[nk].name + ' BOWL', at(K.bowls[nk].x, K.bowls[nk].z, TOP + 0.03), 0.15);
    if (grill.some(Boolean) && S.heat < 0.3) return R('grill', 'THE COALS ARE COOLING · SWIPE THE FAN', at(K.fan.x, K.fan.z, TOP + 0.05), 0.25);
    return null; }

  // ---------- the loop ----------
  const flareSpr = []; for (let i = 0; i < 15; i++) { const s = glow(0xff6a1a, 0, 0.3); s.renderOrder = 15; flareSpr.push(s); }
  let lblT = 0, hintT = 0;
  function stepSk(sk, dt) { const g = sk.g;
    if (sk.anim) { const a = sk.anim; if (a.rx0 == null) a.rx0 = g.rotation.x; a.t += dt / a.dur; const e = Math.min(1, a.t), s = e * e * (3 - 2 * e); g.position.lerpVectors(a.from, a.to, s); g.position.y += Math.sin(Math.PI * s) * 0.22; g.rotation.x = a.rx0 * (1 - s); if (e >= 1) { sk.anim = null; g.position.copy(a.to); g.rotation.x = 0; a.then && a.then(); } }
    else if (sk === plate.sk) g.position.copy(K.plate.group.position).add(V3(0, 0.075, 0));
    const held = drag && drag.type === 'grill' && grill[drag.i] === sk && drag.axis === 'h' && S.brush <= 0;
    if (sk.where === 'grill' && !held) { if (sk.tgt != null) { sk.rot += (sk.tgt - sk.rot) * Math.min(1, dt * 14); if (Math.abs(sk.tgt - sk.rot) < 0.002) { sk.rot = sk.tgt; sk.tgt = null; } }
      else if (Math.abs(sk.vel) > 0.9) { sk.rot += sk.vel * dt; sk.vel *= Math.exp(-2.6 * dt); const q = Math.round(sk.rot / PI2); if (q !== sk.lastQ) { sk.lastQ = q; tone(560, 0.025, 0.03, 'square'); } }
      else { sk.vel = 0; const q = Math.round(sk.rot / PI2) * PI2; if (Math.abs(q - sk.rot) > 0.002) sk.tgt = q; } }
    g.rotation.z = sk.rot;
    for (const p of sk.pieces) { const f = p.m.userData.fly; if (!f) continue; f.t += dt / 0.24; const e = Math.min(1, f.t); p.m.position.lerpVectors(f.from, f.to, e); p.m.position.y += Math.sin(Math.PI * e) * 0.12; if (e >= 1) { p.m.position.copy(f.to); delete p.m.userData.fly; } }
    paintSkewer(sk); }
  function step(dt) { S.t += dt; if (S.flashT > 0 && (S.flashT -= dt) <= 0) S.flash = null; if (S.sayT > 0 && (S.sayT -= dt) <= 0) S.say = ''; if (S.toastT > 0 && (S.toastT -= dt) <= 0) S.toast = null; if (S.reactT > 0 && (S.reactT -= dt) <= 0) S.react = null; if (S.waveT > 0) { S.waveT -= dt; ben.userData.talking = S.waveT > 0; }
    const work = S.phase === 'shift' || S.phase === 'glide';
    // coals, fan, flames
    S.heat += (0.35 - S.heat) * Math.min(1, dt * (S.heat > 0.35 ? 0.09 : 0.5)); const fl = Math.sin(S.t * 7.3) * 0.06 + Math.sin(S.t * 17.1) * 0.04;
    K.grill.coalMat.emissiveIntensity = 0.35 + S.heat * 1.6 + fl; coalLight.intensity = 0.5 + S.heat * 2.2 + fl * 3; coalGl.forEach((s, i) => { s.material.opacity = 0.2 + S.heat * 0.45 + Math.sin(S.t * 5 + i) * 0.05; s.scale.setScalar(0.8 + S.heat * 0.6); });
    flames.forEach((f, i) => { const want = S.heat > 0.55 ? (S.heat - 0.55) * 1.6 * (0.6 + 0.4 * Math.sin(S.t * 11 + i * 2.1)) : 0; f.material.opacity = Math.max(want, f.material.opacity - dt * 2.5); f.scale.set(0.18 + S.heat * 0.16, 0.3 + S.heat * 0.35 + Math.sin(S.t * 13 + i) * 0.05, 1); f.position.y = TOP + 0.26 + S.heat * 0.08; });
    S.fanAmp = Math.max(0, S.fanAmp - dt * 1.6); S.fanPh += dt * 16; K.fan.pivot.rotation.z = Math.sin(S.fanPh) * 0.55 * S.fanAmp;
    // phases
    if (S.phase === 'walk') stepWalk(dt);
    else if (work) { camTo(workShot(), dt); if (S.phase === 'glide' && !CAM.from) S.phase = 'shift'; }
    else camTo(wideShot(), dt, 2.2);
    if (S.phase === 'shift') { S.left -= dt;
      S.next -= dt; const cap = S.day <= 1 ? 2 : 3; if (S.next <= 0 && custs.filter(c => c.state !== 'out').length < cap) { spawn(); S.next = S.demo ? 9 : Math.max(7, rr(13, 18) - S.day); }
      stepCustomers(dt);
      const hm = 0.55 + S.heat * 1.3;
      grill.forEach(sk => { if (!sk || sk.anim) return; for (let s = 0; s < 4; s++) { let w = Math.max(0, -Math.sin(SIDE_PHI[s] + sk.rot)); w *= w; sk.char[s] = Math.min(120, sk.char[s] + dt * (10 * hm * w * (sk.flare > 0 ? 2.6 : 1) + 0.35)); } sk.dirty = true; if (sk.flare > 0) sk.flare -= dt;
        if (Math.max(...sk.char) > BURNT && Math.random() < dt * 3) puff(sk.g.position.x, K.grill.y + 0.15, K.grill.z + rr(-0.2, 0.2), 0x3a3634, 1); else if (Math.random() < dt * 1.2) puff(sk.g.position.x, K.grill.y + 0.12, K.grill.z + rr(-0.2, 0.2), 0xf6f0e8, 1); });
      if ((S.day >= 2 && !upg('drip')) || S.demo) { S.flareCd -= dt * (0.6 + S.heat); if (S.flareCd <= 0) { const c = grill.map((s, i) => i).filter(i => grill[i] && !grill[i].anim && grill[i].flare <= 0 && grill[i].kinds.some(k => k === 'lamb' || k === 'chicken')); if (c.length) { const i = pick(c); grill[i].flare = 4; flash('FLARE-UP! TAP THE FIRE', '#ec3013', 1.4); tone(110, 0.45, 0.06, 'sawtooth', 1.6); } S.flareCd = rr(11, 18); } }
      if (S.demo || S.bot) stepBot(dt); if (S.demo) { DM.t += dt; if ((DM.served >= 2 || S.t > 120) && !DM.endT) DM.endT = S.t + 3.2; if (DM.endT && S.t > DM.endT) { demoStop(); return; } }
      hintT -= dt; if (hintT <= 0) { hintT = 0.2; S.hint = hintNow(); }
      if (S.left <= 0) { finish(); return; } }
    else S.hint = null;
    // flare flames
    let fi = 0; grill.forEach((sk, i) => { if (!sk || sk.flare <= 0) return; for (let n = 0; n < 3 && fi < flareSpr.length; n++, fi++) { const s = flareSpr[fi]; s.position.set(slots()[i] + rr(-0.05, 0.05), K.grill.y - 0.02 + n * 0.08, K.grill.z + (n - 1) * 0.22); s.material.opacity = 0.75 + Math.random() * 0.25; s.scale.set(0.22 + Math.random() * 0.1, 0.4 + Math.random() * 0.2, 1); } }); for (; fi < flareSpr.length; fi++) flareSpr[fi].material.opacity = 0;
    [board, ...grill, plate.sk].forEach(sk => sk && stepSk(sk, dt));
    // labels
    lblT -= dt; const showL = S.phase === 'shift'; slots().forEach((x, i) => { const L = labels[i], sk = grill[i]; L.sp.visible = showL && !!sk; if (sk && L.sp.visible) { L.sp.position.set(x, TOP + 0.56, K.grill.z + 0.6); if (lblT <= 0) drawLabel(L, sk, i); } }); for (let i = slots().length; i < labels.length; i++) labels[i].sp.visible = false; if (lblT <= 0) lblT = 0.12;
    HR.place(S.phase === 'shift' && S.hint && S.hint.p && !S.demo ? S.hint : null, S.t, dt);
    // demo hand
    hand.visible = !!(S.demo && DM.p); if (hand.visible) { hand.position.lerp(DM.p, Math.min(1, dt * 8)); hand.scale.setScalar(0.26 + Math.sin(S.t * 8) * 0.04); }
    if (S.focus !== 'chop' || S.phase !== 'shift') knife.visible = false;
    // brush rests in the pot unless loaded
    if (S.brush <= 0 && !(K.glaze.brush.position.x === K.glaze.x + 0.04)) brushRest();
    // smoke
    for (const p of smokeS) { if (p.life > 0) { p.life -= dt * 0.75; p.s.position.addScaledVector(p.v, dt); p.s.scale.setScalar(0.12 + (1 - p.life) * 0.45); p.s.material.opacity = Math.max(0, p.life) * 0.45; } else p.s.material.opacity = 0; }
    // what shows: cut-away walls while working, front + dining hidden in the wide shot
    { const hideCut = work && (!CAM.from || CAM.t > 0.35); K.cut.forEach(m => m.visible = !hideCut); if (S.phase === 'walk') { K.roof.forEach(m => m.visible = false); K.sign.forEach(m => m.visible = camera.position.y < 3.2); } const wide = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !wide); K.dining.forEach(m => m.visible = !wide); diners.forEach(f => f.visible = !wide); lampGl.forEach((s, i) => s.visible = !(hideCut && K.cut.includes(K.lamps[i])) && !(wide && K.lamps[i].position.z > 1)); }
    if (S.phase !== 'walk') { const greet = S.phase === 'intro' || S.phase === 'done'; ben.userData.mood = greet ? 'excited' : 'happy'; ember.userData.talking = greet && Math.sin(S.t * 0.7) > 0.6; }
    for (const f of diners) { f.userData.talking = Math.sin(S.t * 0.5 + f.position.x) > 0.5; }
    animAll(dt, custs.map(c => c.f));
    stepSound(dt); }

  // ---------- what the page draws ----------
  const statusOf = o => { const sk = [board, ...grill, plate.sk].find(s => s && s.id === o.sk); if (!sk) return 'NEW'; if (sk.where === 'board') return 'THREADING ' + sk.pieces.length + '/5'; if (sk.where === 'grill') return 'ON THE COALS'; return 'PLATED'; };
  function meterFor() { let i = S.active, sk = grill[i]; if (!sk) { i = grill.findIndex(Boolean); sk = grill[i]; } if (!sk) return null; const o = orderOf(sk), dn = downSide(sk);
    return { slot: i + 1, name: o ? o.name : 'NO TICKET', recipe: o ? o.recipe.name : '', want: o ? o.char : null, glazeWant: !!(o && o.glaze), flare: sk.flare > 0, sides: sk.char.map((v, s) => ({ v: Math.round(v), zone: zoneOf(v), down: s === dn, glazed: sk.glaze[s] >= GLAZE.need })) }; }
  function badges() { const b = {}; b.thread = board ? (board.pieces.length === 5 ? 'LOADED' : board.pieces.length ? board.pieces.length + ' / 5' : orders.some(o => !o.sk) ? 'NEW TICKET' : '') : '';
    const on = grill.filter(Boolean); b.grill = on.some(s => s.flare > 0) ? 'FIRE!' : on.some(s => s.char[downSide(s)] > BURNT - 6) ? 'BURNING' : on.some(s => { const o = orderOf(s); return s.char.every(v => v >= CHARZ[o ? o.char : 'MEDIUM'].lo); }) ? 'READY' : on.length ? on.length + ' ON' : '';
    b.plate = plate.sk ? (() => { const o = orderOf(plate.sk), m = o && o.sides.find(k => !plate.sides.includes(k)); return m ? '+ ' + SIDES[m].name : 'SERVE'; })() : ''; const cn = chopNeed(); b.chop = cn.length ? ING[cn[0]].name + ' OUT' : ''; return b; }
  function hud() { const sum = S.starList.reduce((a, b) => a + b, 0);
    return { phase: S.phase, day: S.day, left: Math.max(0, S.left), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? (sum / S.starList.length).toFixed(1) : '', gold: save.data.gold, focus: S.focus,
      orders: orders.map(o => ({ id: o.id, name: o.name, recipe: o.recipe.name, char: o.char, glaze: o.glaze, sides: o.sides.map(k => SIDES[k].name), seq: o.seq.map(k => ({ k, n: ING[k].name, col: ING[k].cols[0] })), pat: Math.max(0, o.pat), waiting: o.waiting, price: o.price, status: statusOf(o) })),
      chopOn: chopNeed().length > 0, badges: badges(), hint: S.hint ? { station: S.hint.station, text: S.hint.text } : null, flash: S.flash, say: S.say, react: S.react, brush: S.brush > 0 ? Math.round(S.brush / (upg('brush') ? 260 : 140) * 100) : 0, heat: Math.round(S.heat * 100),
      meter: S.phase === 'shift' ? meterFor() : null, board: board ? { n: board.pieces.length, next: nextNeed() ? ING[nextNeed()].name : '' } : null, plate: plate.sk ? { who: orderOf(plate.sk) ? orderOf(plate.sk).name : '', sides: plate.sides.map(k => SIDES[k].name) } : null,
      done: S.done, upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: avail().map(r => ({ name: r.name, price: r.price })), sides: Object.values(SIDES).filter(s => s.day <= S.day).map(s => s.name), glazeOn: S.day >= GLAZE.day, flaresOn: S.day >= 2 && !upg('drip'), uniform: save.flag(FLAG_UNIFORM),
      demo: S.demo ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null, walk: S.phase === 'walk' ? { prompt: S.prompt, dialog: S.dialog, toast: S.toast } : null, muted: !!audio.muted }; }

  // ---------- run ----------
  const clock = new THREE.Clock(); let raf = 0, PAUSE = false, hudT = 0;
  placeIntro(); { const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); camera.lookAt(CAM.look); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  frame();
  const api = {
    // the shift (page buttons)
    serveOrder(id) { if (S.phase !== 'shift' || S.demo) return false; const o = orders.find(x => x.id === id); if (!o) return false; if (!plate.sk) { flash('PLATE A KABOB FIRST', '#ffffff', 1.2); return false; } if (!o.waiting) { flash(o.name + ' IS STILL WALKING IN', '#ffffff', 1.2); return false; } return serveTo(o); },
    addSide: k => S.phase === 'shift' && !S.demo && addSide(k), binPlate: () => S.phase === 'shift' && !S.demo && binPlate(),
    startShift: () => startShift(false), demoStart, demoStop, toIntro, toWalk, buyUpgrade, setFocus, setSafe: CF.setSafe, hud,
    // Game HUD contract (walking around the room)
    start() {}, talk, choose, closeDialog, nextLine() { if (S.dialog && !S.dialog.choices) closeDialog(); }, clearToast() { S.toast = null; },
    melee() { if (S.phase !== 'walk') return; S.waveT = 1.2; if (Math.hypot(WK.x - K.chefSpot.x, WK.z - K.chefSpot.z) < 5) { S.toast = 'EMBER waves back: "Hungry, or here to work?"'; S.toastT = 2.5; ember.userData.mood = 'excited'; } },
    range() { if (S.phase === 'walk') { S.toast = 'No lasers in the kitchen!'; S.toastT = 2; } }, jump() { if (S.phase === 'walk' && !(ben.userData.hop > 0)) { ben.userData.hop = 1; tone(520, 0.1, 0.04, 'triangle', 1.5); } }, meleeUp() {},
    useItem() { S.toast = 'Save it for after your shift.'; S.toastT = 2; }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; }, setHudPad() {},
    setStick(x, y) { WK.sx = x; WK.sy = y; if ((x || y) && !(audio.ctx && audio.ctx.state === 'running')) { try { audio.init && audio.init(); } catch (e) {} sound(); } },
    eyeLook(dx, dy) { lookBy(dx, dy); }, eyeRelease() {}, togglePov() { return false; }, lookBy, zoomBy(r) { WK.dist = clamp(WK.dist * r, 2.4, 9); },
    getCam() { return { dist: WK.dist, pitch: WK.pitch }; }, setCam(d, p, lock) { if (d != null) WK.dist = clamp(d, 2.4, 9); if (p != null) WK.pitch = clamp(p, 0.08, 1.15); if (lock != null) WK.lock = !!lock; },
    mapData() { return { p: [WK.x, WK.z, ben.rotation.y], b: [['GRILL', K.grill.x, K.grill.z], ['COUNTER', 0, K.counterZ], ['DOOR', K.door.x, K.door.z]], f: [[K.chefSpot.x, K.chefSpot.z]], e: [], q: [K.chefSpot.x, K.chefSpot.z, 'CHEF EMBER'] }; },
    setMinimap() {}, toggleSound() { audio.setMuted(!audio.muted); return audio.muted; }, cycleWeather() {},
    // test hooks
    _bot(v = true) { S.bot = !!v; }, _screen(x, y, z) { const v = V3(x, y, z).project(camera), r = renderer.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; }, _sim(n, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => S, _K: K, _stock: (k, n) => setStock(k, n), _dbg: () => ({ cam: camera.position.toArray().map(v => +v.toFixed(2)), look: CAM.look.toArray().map(v => +v.toFixed(2)), ben: ben.position.toArray(), benVis: ben.visible, ember: ember.position.toArray(), WK }), _grill: () => grill, _board: () => board, _plate: () => plate, _orders: () => orders, _act: { threadPiece, undoPiece, sendToGrill, turn, spritz, fanWave, toggleBrush, brushOn, liftOff, addSide, serveTo, binPlate, chopCut, chopStart },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); renderer.domElement.removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
