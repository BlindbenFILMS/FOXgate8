// 8 GATES — FOXY CAKES: THE SHIFT [foxyCakes]. "Baked fresh · fox-run". A cake bakery on the restaurant engine (Foxy Pies is the reference).
// Every cake: MIX (tap the recipe jars into the bowl) → WHISK (circle your finger in the bowl) → POUR (pull down to tilt the bowl, stop at the line)
// → BAKE (watch it rise, PULL IT OUT in the band) → FROST (the turntable spins, drag the spatula) → PIPE (trace the message or heart in frosting,
// pick the colour and tip, pipe a border for a style bonus) → TOPPERS (tap berries, candles, stars; drag sprinkles) → BOX + SERVE.
// Stage scores average into the customer's mood; DESIGN is the piping score. A shift = one day of orders → wage + prices + tips (engine/save.js).
// Save keys cakes.foxy.*, flag cakesUniform.
// INTERCHANGEABLE INTERIOR: buildCakery(ctx) builds the room at an origin and FITS ANY FOOTPRINT (ctx.size = { w, d }, min 7.5 x 7.5 m),
// with or without its own walls (ctx.shell = false inside a world's walk-in building). It returns stations, a work spot, a keeper spot, a door,
// seats and collider boxes (blocks), so engine/shop-slot.js can drop it into any building in any world. createCakeShift({ container, onState, opts })
// runs stand-alone, with a WALK mode so the FOX player can stroll the bakery between shifts.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { cakeAudio } from './cake-audio.js';
export { cakeAudio };

export const CAKES = { name: 'FOXY CAKES · THE SHIFT', room: 'foxyCakes', label: 'FOXY CAKES', tag: 'BAKED FRESH · FOX-RUN', size: { w: 10, d: 9 } };
const R = 0.17;                 // metres per cake unit: a round cake is 34 cm across
const G = 96;                   // scoring grid over the cake top, [-1.1, 1.1]²
export const FLAVORS = {
  vanilla: { name: 'VANILLA', batter: '#f3e1b0', sponge: '#f1d08a', jar: '#f7efd8', lid: '#c9a24a' },
  chocolate: { name: 'CHOCOLATE', batter: '#7a4a2e', sponge: '#6a3e24', jar: '#5a3424', lid: '#2a1810' },
  strawberry: { name: 'STRAWBERRY', batter: '#f4b6c2', sponge: '#ee9fb2', jar: '#f27a9a', lid: '#c42d5c' },
  lemon: { name: 'LEMON', batter: '#f8e48a', sponge: '#f1d35a', jar: '#f6d743', lid: '#7aa83a' },
  redvelvet: { name: 'RED VELVET', batter: '#b8323c', sponge: '#a02a34', jar: '#b8323c', lid: '#3a1418' } };
export const INGREDIENTS = { flour: { name: 'FLOUR', col: '#fbf6ea', jar: '#fbf6ea', lid: '#9a6a3e' }, sugar: { name: 'SUGAR', col: '#ffffff', jar: '#e8f4fb', lid: '#3b82f6' }, eggs: { name: 'EGGS', col: '#f6c453', jar: '#f3e3c4', lid: '#c99a62' }, butter: { name: 'BUTTER', col: '#f7dc6f', jar: '#fbeaa0', lid: '#e6b45a' } };
const BASE = ['flour', 'sugar', 'eggs', 'butter'], FLAV_KEYS = Object.keys(FLAVORS), JARS = [...BASE, ...FLAV_KEYS];
const jarInfo = k => INGREDIENTS[k] || { name: FLAVORS[k].name, col: FLAVORS[k].batter, jar: FLAVORS[k].jar, lid: FLAVORS[k].lid };
export const FROSTINGS = { white: { name: 'VANILLA WHITE', col: '#fbf7ef' }, pink: { name: 'PINK', col: '#f7a8c4' }, mint: { name: 'MINT', col: '#a8e6cf' }, choc: { name: 'CHOCOLATE', col: '#6b3f26' }, lemon: { name: 'LEMON', col: '#fbe58a' }, lavender: { name: 'LAVENDER', col: '#c9b6f2' }, sky: { name: 'SKY BLUE', col: '#a6d8f7' } };
export const PIPES = [{ id: 'white', name: 'WHITE', col: '#ffffff' }, { id: 'pink', name: 'PINK', col: '#ec4f8f' }, { id: 'blue', name: 'BLUE', col: '#2f74e8' }, { id: 'choc', name: 'CHOCOLATE', col: '#4a2716' }, { id: 'gold', name: 'GOLD', col: '#f2b632' }, { id: 'green', name: 'GREEN', col: '#2f9e4f' }];
export const TOPPERS = { strawberry: { name: 'STRAWBERRIES', short: 'BERRY', col: '#e0303c' }, cherry: { name: 'CHERRIES', short: 'CHERRY', col: '#b5121b' }, candle: { name: 'CANDLES', short: 'CANDLE', col: '#7dd3fc' }, blueberry: { name: 'BLUEBERRIES', short: 'BLUE', col: '#2f3c8f' }, star: { name: 'GOLD STARS', short: 'STAR', col: '#f2b632' }, sprinkles: { name: 'SPRINKLES', short: 'SPRNK', col: '#f472b6', scatter: true } };
const TOP_KEYS = ['strawberry', 'candle', 'cherry', 'sprinkles', 'blueberry', 'star'];
export const MESSAGES = ['HAPPY BIRTHDAY', 'I LOVE YOU', 'CONGRATS', 'THANK YOU', 'BEST MOM', 'BEST DAD', 'YAY!', 'GO TEAM', 'WELCOME', 'HAPPY DAY'];
// the owner, for a world that hosts the shop (story.js branch lines, same voice as the stand-alone walk mode)
export const KEEPER = { key: 'missCrumb', name: 'Miss Crumb', role: 'Foxy Cakes', outfit: 'coat', bow: true, torso: ['#f4a6c0', '#fff4e6', '#d9799c'], look: { fur: '#e8a06a', furDark: '#b8703a', blush: 0.5 }, mood: 'happy',
  greeting: 'Welcome to Foxy Cakes! Fancy an apron? The cakes will not frost themselves.',
  lines: ['Every cake tells a story. Yours just needs frosting.', 'Pipe a border round the edge. Customers adore a border!', 'Pull it out of the oven on time and the rest is easy.', 'The heart cakes sell out every Friday.', 'Write anything you like on a cake. Bake your own, no clock.'] };
export const NAMES = ['CLOUD NINE', 'SUNNY SIDE', 'PARTY STACK', 'SWEET HEART', 'BIG DAY', 'MOONBEAM'];
export const CUSTOMER_SETS = {
  station: [{ name: 'KIT VEGA', short: 'KIT', torso: ['#1f3350', '#e6ecf4', '#16263c'] }, { name: 'RANGER ASH', short: 'ASH', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#3f5d47', '#e6b45a', '#2b4232'], outfit: 'coat' },
    { name: 'CMDR. SABLE', short: 'SABLE', fur: '#3a3436', furDark: '#1c1a1b', torso: ['#e7edf4', '#c42d3c', '#6b7d93'], outfit: 'armor' }, { name: 'PIP OF DECK 9', short: 'PIP', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#f2c53d', '#201e1d', '#a8792e'] },
    { name: 'NINE-TAILS NELL', short: 'NELL', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#a78bfa', '#ede9fe', '#5b21b6'], outfit: 'robe' }],
  meru: [{ name: 'KIA', torso: ['#38bdf8', '#e0f2fe', '#0369a1'] }, { name: 'PELL', torso: ['#1f2937', '#e6b45a', '#111827'] }, { name: 'OTTO', torso: ['#2f5d2a', '#e6b45a', '#1a3318'] },
    { name: 'MARLA', torso: ['#f472b6', '#fce7f3', '#9d174d'] }, { name: 'MICHAEL JAY', short: 'JAY', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'] }, { name: 'THE FISHERMAN', short: 'FISH', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] },
    { name: 'THE SAGE', short: 'SAGE', torso: ['#a78bfa', '#ede9fe', '#5b21b6'], outfit: 'robe' }, { name: 'DOC BRAUN', short: 'DOC', torso: ['#f6f8fb', '#e2e8f0', '#94a3b8'], outfit: 'coat' }, { name: 'FLICK', torso: ['#c42d3c', '#f3f2f2', '#7a1d2a'], outfit: 'coat' }] };
export const UPGRADES = [
  { id: 'mixer', name: 'STAND MIXER', cost: 40, line: 'Every whisk turn counts one and a half.' },
  { id: 'therm', name: 'OVEN THERMOMETER', cost: 40, line: 'The ordered bake band is 30% wider.' },
  { id: 'spatula', name: 'OFFSET SPATULA', cost: 30, line: 'Frosting spreads in wider strokes.' },
  { id: 'tips', name: 'PRO PIPING TIPS', cost: 45, line: 'Fatter piping and 30% more time to pipe.' },
  { id: 'radio', name: 'MUSIC BOX', cost: 60, line: 'Tips +25%.' }];
const SAVE = { day: 'cakes.foxy.day', best: 'cakes.foxy.best', upg: 'cakes.foxy.upg.', stars: 'cakes.foxy.stars', made: 'cakes.foxy.made' };
const MOOD = [[90, 'DELIGHTED', 'THRILLED!', '#22c55e', 'excited', 3], [80, 'HAPPY', 'HAPPY', '#7dd3fc', 'happy', 3], [70, 'NEUTRAL', 'NEUTRAL', '#e6b45a', 'neutral', 2], [60, 'UNHAPPY', 'UNHAPPY', '#ff9a8a', 'sad', 1], [50, 'UPSET', 'UPSET', '#f27021', 'sad', 1], [-1, 'INSULTED', 'INSULTED!', '#ec3013', 'angry', 0]];
const moodOf = avg => MOOD.find(m => avg >= m[0]);
const REACT_LINES = { THRILLED: ['This is the most beautiful cake I have ever seen!', 'I almost don\'t want to eat it. Almost.', 'The whole party is going to cheer!', 'Look at that piping! You\'re an artist!'],
  HAPPY: ['It\'s perfect. Thank you!', 'Oh, they\'re going to love this.', 'That smells amazing.'], NEUTRAL: ['It\'s a cake. It\'ll do.', 'Hmm. Okay, thanks.', 'Not bad, not great.'],
  UNHAPPY: ['That\'s not quite what I asked for.', 'Hmm. The writing is a bit wobbly.', 'I guess I can scrape it off...'], UPSET: ['This is NOT my order.', 'What happened to it?!'], INSULTED: ['Is this a joke?', 'I\'m telling everyone at the party.'] };
const ORDER_LINES = ['It\'s a big day!', 'I need a cake, quick!', 'Could you bake me something special?', 'It\'s for a surprise party.', 'Make it pretty, please!'];
const doneName = v => v < 25 ? 'RAW' : v < 42 ? 'SOFT' : v < 62 ? 'GOLDEN' : v < 82 ? 'WELL BAKED' : 'BURNT';
const n3 = v => Math.round(v * 1000) / 1000;
const hexMix = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp(t, 0, 1)).getHexString();

// ---------------- cake shapes (cake units: round radius 1, local y = far side) ----------------
export function shapePoly(kind) {
  const pts = [];
  if (kind === 'heart') for (let i = 0; i < 84; i++) { const t = i / 84 * Math.PI * 2; pts.push({ x: 16 * Math.pow(Math.sin(t), 3) / 17 * 1.04, y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 * 1.04 + 0.1 }); }
  else if (kind === 'square') { const h = 0.86, r = 0.16; for (let c = 0; c < 4; c++) { const cx = c === 0 || c === 3 ? h - r : -(h - r), cy = c < 2 ? h - r : -(h - r); for (let i = 0; i <= 6; i++) { const a = c * Math.PI / 2 + i / 6 * Math.PI / 2; pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r }); } } }
  else for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; pts.push({ x: Math.cos(a), y: Math.sin(a) }); }
  return pts; }
const pip = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) c = !c; } return c; };
const inPoly = (poly, x, y, inset = 0) => pip(poly, x / (1 - inset), y / (1 - inset));
const shapeOf = (T3, poly, s = 1) => new T3.Shape(poly.map(p => new T3.Vector2(-p.x * R * s, -p.y * R * s)));   // after rotateX(-90°): world (-x·R, ·, y·R)

// ---------------- toppers, shared with display cakes ----------------
export function topperMesh(T3, toon, key, outline) {
  const g = new T3.Group(), add = (geo, col, x = 0, y = 0, z = 0, ol = 0.003) => { const m = new T3.Mesh(geo, typeof col === 'string' ? toon(col) : col); m.position.set(x, y, z); m.castShadow = true; if (outline && ol) outline(m, ol); g.add(m); return m; };
  if (key === 'strawberry') { const b = add(new T3.ConeGeometry(0.02, 0.036, 10), '#e0303c', 0, 0.022, 0); b.rotation.x = Math.PI; add(new T3.SphereGeometry(0.02, 10, 8), '#e0303c', 0, 0.036, 0, 0).scale.y = 0.6; for (let i = 0; i < 5; i++) add(new T3.BoxGeometry(0.018, 0.003, 0.006), '#3f8a2a', Math.cos(i * 1.26) * 0.01, 0.047, Math.sin(i * 1.26) * 0.01, 0).rotation.y = -i * 1.26; for (let i = 0; i < 6; i++) add(new T3.SphereGeometry(0.0022, 4, 3), '#ffe58a', Math.cos(i) * 0.016, 0.026 + (i % 3) * 0.006, Math.sin(i) * 0.016, 0); }
  else if (key === 'cherry') { add(new T3.SphereGeometry(0.018, 12, 10), '#b5121b', 0, 0.018, 0); const st = add(new T3.CylinderGeometry(0.0018, 0.0018, 0.04, 4), '#4f7a2a', 0.006, 0.05, 0, 0); st.rotation.z = -0.3; add(new T3.SphereGeometry(0.005, 6, 4), '#ffffff', -0.006, 0.026, 0.012, 0); }
  else if (key === 'blueberry') { add(new T3.SphereGeometry(0.013, 10, 8), '#2f3c8f', 0, 0.012, 0); add(new T3.TorusGeometry(0.004, 0.0015, 4, 8), '#1b2050', 0, 0.025, 0, 0).rotation.x = Math.PI / 2; }
  else if (key === 'star') { const s = new T3.Shape(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 2, r = i % 2 ? 0.011 : 0.026; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const m = add(new T3.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: false }), toon('#f2b632', { emissive: new T3.Color('#7a5200'), emissiveIntensity: 0.5 }), 0, 0.028, -0.004); m.rotation.y = Math.random() * 0.6 - 0.3; }
  else if (key === 'candle') { const cols = ['#7dd3fc', '#f472b6', '#fde047', '#86efac', '#c4b5fd']; const c = cols[Math.floor(Math.random() * cols.length)]; add(new T3.CylinderGeometry(0.006, 0.006, 0.07, 8), c, 0, 0.035, 0); for (let i = 0; i < 3; i++) add(new T3.TorusGeometry(0.0062, 0.0016, 4, 10), '#ffffff', 0, 0.015 + i * 0.02, 0, 0).rotation.x = Math.PI / 2; add(new T3.CylinderGeometry(0.0008, 0.0008, 0.008, 3), '#201e1d', 0, 0.074, 0, 0);
    const fl = add(new T3.SphereGeometry(0.007, 8, 6), toon('#ffb020', { emissive: new T3.Color('#ff8a00'), emissiveIntensity: 2 }), 0, 0.084, 0, 0); fl.scale.set(0.8, 1.6, 0.8); fl.castShadow = false; g.userData.flame = fl; }
  return g; }

// ---------------- the room ----------------
export function buildCakery(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, rotY = 0, shell = true } = ctx;
  const W = Math.max(7.5, (ctx.size && ctx.size.w) || CAKES.size.w), D = Math.max(7.5, (ctx.size && ctx.size.d) || CAKES.size.d), H = 3.8;
  const root = new T3.Group(); root.position.set(origin.x, ctx.y || 0, origin.z); root.rotation.y = rotY; (ctx.parent || scene).add(root);
  const pink = toon('#f4a6c0'), pinkD = toon('#d9799c'), cream = toon('#fff4e6'), mint = toon('#9fd8c4'), mintD = toon('#6fb8a2'), ink = toon('#201e1d'), wood = toon('#c99a62'), woodD = toon('#8a5a32'), marble = toon('#fbf6f2'), chrome = toon('#d7dde3'), choc = toon('#5a3424');
  const cut = [], front = [], booths = [], blocks = [], K = { root, W, D, H, cut, front, booths, blocks };
  const solid = (x0, x1, z0, z1, h, mat, ol = 0.025, y0 = 0) => { blocks.push([x0, x1, z0, z1]); return M(new T3.BoxGeometry(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2, root, ol); };
  if (shell) {
    const floorT = CTX(256, 256, c => { c.fillStyle = '#fff4e6'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#f4b8cc'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 32, y * 32, 32, 32); c.strokeStyle = 'rgba(120,60,80,0.12)'; c.lineWidth = 2; for (let i = 0; i <= 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } });
    floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2.4, D / 2.4);
    const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
    const wallT = CTX(256, 256, c => { c.fillStyle = '#fff4e6'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#fbd3e0'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 0, 16, 150); c.fillStyle = '#ffffff'; for (let x = 8; x < 256; x += 32) for (let y = 12; y < 150; y += 28) { c.beginPath(); c.arc(x + 16, y, 2.4, 0, 7); c.fill(); }
      c.fillStyle = '#9fd8c4'; c.fillRect(0, 150, 256, 106); c.fillStyle = '#86c6b0'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 150, 3, 106); c.fillStyle = '#f4a6c0'; c.fillRect(0, 138, 256, 12); c.fillStyle = '#ffffff'; for (let x = 0; x < 256; x += 16) { c.beginPath(); c.arc(x + 8, 138, 8, Math.PI, 0); c.fill(); } });
    wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(W / 3, 1); const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad });
    for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); if (!ry) { m.userData.wallItem = true; cut.push(m); } }
    { const fw = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); fw.position.set(0, H / 2, D / 2); fw.rotation.y = Math.PI; root.add(fw); front.push(fw); }
    cut.push(M(new T3.BoxGeometry(W, 0.2, D), toon('#fff4e6'), 0, H + 0.1, 0, root, 0));
    { const fc = root.children.length, streetT = CTX(256, 128, c => { const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#9fc9e8'); gr.addColorStop(0.6, '#e8f2f8'); gr.addColorStop(0.61, '#b9b2a6'); gr.addColorStop(1, '#8f877a'); c.fillStyle = gr; c.fillRect(0, 0, 256, 128); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(30, 10, 6, 60); c.fillRect(46, 10, 3, 60); });
      for (const x of [-W * 0.27, W * 0.27]) { const win = new T3.Mesh(new T3.PlaneGeometry(W * 0.3, 1.8), new T3.MeshBasicMaterial({ map: streetT })); win.position.set(x, 1.8, D / 2 - 0.02); win.rotation.y = Math.PI; root.add(win); M(new T3.BoxGeometry(W * 0.3 + 0.16, 0.12, 0.14), pinkD, x, 2.74, D / 2 - 0.06, root, 0.01); M(new T3.BoxGeometry(W * 0.3 + 0.16, 0.12, 0.14), pinkD, x, 0.86, D / 2 - 0.06, root, 0.01);
        const lt = CTX(256, 64, c => { c.clearRect(0, 0, 256, 64); c.fillStyle = '#ec4f8f'; c.font = 'italic 900 32px Archivo, Arial'; c.textAlign = 'center'; c.fillText('FOXY CAKES', 128, 44); }); const ld = new T3.Mesh(new T3.PlaneGeometry(1.6, 0.4), new T3.MeshBasicMaterial({ map: lt, transparent: true })); ld.position.set(x, 2.25, D / 2 - 0.04); ld.rotation.y = Math.PI; root.add(ld);
        // scalloped awning strip over each window
        for (let i = 0; i < 8; i++) { const sc = M(new T3.CylinderGeometry(0.11, 0.11, 0.05, 12, 1, false, 0, Math.PI), i % 2 ? cream : pink, x - W * 0.135 + 0.11 + i * (W * 0.27 / 7.5), 2.62, D / 2 - 0.08, root, 0); sc.rotation.set(Math.PI / 2, 0, Math.PI); } }
      const door = new T3.Mesh(new T3.PlaneGeometry(1.5, 2.5), new T3.MeshBasicMaterial({ color: 0xe8f2f8 })); door.position.set(0, 1.25, D / 2 - 0.02); door.rotation.y = Math.PI; root.add(door); M(new T3.BoxGeometry(1.7, 0.14, 0.14), pinkD, 0, 2.56, D / 2 - 0.06, root, 0.01);
      front.push(...root.children.slice(fc)); }
  }
  // ---- kitchen line: the deck oven (back wall, left), the prep counter (jars, bowl, pan board, turntable), the service pass with the cake case ----
  const back = -D / 2, KZ = back + 2.35, span = Math.min(W - 1.8, 6.2), T = 0.98; K.z = KZ; K.top = T; K.back = back;
  // DECK OVEN: two stacked ovens on a base; the bottom one has a glass door that drops open; the cake bakes on its rack (seen through the glass)
  const OX = clamp(-span * 0.36, -W / 2 + 1.1, 0), OZ = back + 0.55, OF = back + 1.08; K.oven = { x: OX, z: OZ, y: T + 0.1, front: OF };
  { solid(OX - 0.75, OX + 0.75, back + 0.04, OF, T, toon('#3a3836'), 0.03); M(new T3.BoxGeometry(1.5, 0.05, OF - back - 0.02), chrome, OX, T + 0.0, (back + OF) / 2, root, 0.01);
    const steel = toon('#c9d1d8'), dark = toon('#2a2624'), inner = toon('#5a463a', { side: T3.BackSide });
    const box = (x, y, z, w, h, d, m, ol = 0.01) => M(new T3.BoxGeometry(w, h, d), m, x, y, z, root, ol);
    const H1 = 0.62, y0 = T + 0.03;
    box(OX, y0 + H1 + 0.02, OZ, 1.5, 0.05, 1.0, steel); box(OX - 0.73, y0 + H1 / 2, OZ, 0.04, H1, 1.0, steel); box(OX + 0.73, y0 + H1 / 2, OZ, 0.04, H1, 1.0, steel); box(OX, y0 + H1 / 2, back + 0.07, 1.5, H1, 0.04, steel);
    { const inn = new T3.Mesh(new T3.BoxGeometry(1.4, H1 - 0.02, 0.92), inner); inn.position.set(OX, y0 + H1 / 2, OZ); root.add(inn); }
    for (let i = 0; i < 9; i++) M(new T3.CylinderGeometry(0.005, 0.005, 0.85, 4), chrome, OX - 0.6 + i * 0.15, T + 0.09, OZ, root, 0).rotation.x = Math.PI / 2;
    // the door: hinged at the bottom, a steel frame around a warm glass window, a chrome handle
    const door = new T3.Group(); door.position.set(OX, y0, OF); root.add(door); K.ovenDoor = door;
    const fr = toon('#c9d1d8'); for (const [x, y, w, h] of [[0, 0.03, 1.46, 0.06], [0, H1 - 0.05, 1.46, 0.1], [-0.68, H1 / 2, 0.1, H1], [0.68, H1 / 2, 0.1, H1]]) M(new T3.BoxGeometry(w, h, 0.05), fr, x, y, 0, door, 0.008);
    const glass = new T3.Mesh(new T3.PlaneGeometry(1.26, H1 - 0.16), new T3.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.22, depthWrite: false })); glass.position.set(0, H1 / 2 - 0.02, 0.005); door.add(glass); K.ovenGlass = glass;
    { const hd = M(new T3.CylinderGeometry(0.018, 0.018, 1.0, 10), chrome, 0, H1 - 0.05, 0.07, door, 0.006); hd.rotation.z = Math.PI / 2; for (const sx of [-0.45, 0.45]) M(new T3.BoxGeometry(0.03, 0.03, 0.07), chrome, sx, H1 - 0.05, 0.035, door, 0); }
    // top oven (closed), control strip with knobs and a temperature display
    const y1 = y0 + H1 + 0.05; box(OX, y1 + 0.27, OZ, 1.5, 0.54, 1.0, steel, 0.015); box(OX, y1 + 0.27, OF + 0.005, 1.26, 0.36, 0.02, dark, 0); box(OX, y1 + 0.47, OF + 0.03, 1.0, 0.04, 0.05, chrome, 0.006);
    const disp = CTX(256, 64, c => { c.fillStyle = '#0b1a14'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#ff6a3a'; c.font = '900 40px Archivo, monospace'; c.textAlign = 'center'; c.fillText('180°', 128, 48); });
    const dp = new T3.Mesh(new T3.PlaneGeometry(0.34, 0.085), new T3.MeshBasicMaterial({ map: disp })); dp.position.set(OX + 0.45, y1 + 0.62, OF + 0.012); root.add(dp); box(OX, y1 + 0.62, OF - 0.01, 1.5, 0.16, 0.04, toon('#3a3836'), 0.01);
    for (let i = 0; i < 3; i++) { const kn = M(new T3.CylinderGeometry(0.035, 0.035, 0.03, 14), ink, OX - 0.5 + i * 0.22, y1 + 0.62, OF + 0.02, root, 0.004, 0.035); kn.rotation.x = Math.PI / 2; }
    cut.push(box(OX, y1 + 0.95, OZ, 0.3, 0.5, 0.3, steel)); // vent
    K.ovenLightAt = { x: OX, y: T + 0.4, z: OZ };
    // baker's rack beside the oven: trays of cupcakes
    const rx = OX + 1.25; solid(rx - 0.32, rx + 0.32, back + 0.05, back + 0.55, 0.02, chrome, 0); for (const sx of [-0.3, 0.3]) for (const sz of [0.08, 0.52]) M(new T3.BoxGeometry(0.03, 1.8, 0.03), chrome, rx + sx, 0.9, back + sz, root, 0);
    for (let s = 0; s < 4; s++) { const sy = 0.35 + s * 0.42; M(new T3.BoxGeometry(0.62, 0.02, 0.46), chrome, rx, sy, back + 0.3, root, 0.004); for (let i = 0; i < 6; i++) { const cx = rx - 0.2 + (i % 3) * 0.2, cz = back + 0.2 + Math.floor(i / 3) * 0.2; M(new T3.CylinderGeometry(0.045, 0.035, 0.05, 10), toon(['#f4a6c0', '#9fd8c4', '#fde68a'][(i + s) % 3]), cx, sy + 0.035, cz, root, 0.004); M(new T3.SphereGeometry(0.05, 10, 8), toon(['#fbf7ef', '#f7a8c4', '#6b3f26', '#c9b6f2'][(i * 3 + s) % 4]), cx, sy + 0.07, cz, root, 0.004).scale.y = 0.7; } } }
  // PREP COUNTER (marble top): ingredient jars along the back edge, the mixing bowl, the pan board, the decorating turntable
  solid(-span / 2, span / 2, KZ - 0.55, KZ + 0.55, T - 0.04, mint, 0.03); M(new T3.BoxGeometry(span + 0.1, 0.06, 1.18), marble, 0, T - 0.01, KZ, root, 0.015);
  for (let i = 0; i < Math.floor(span / 0.5); i++) M(new T3.BoxGeometry(0.03, 0.8, 0.02), mintD, -span / 2 + 0.25 + i * 0.5, 0.42, KZ + 0.56, root, 0);
  const x0 = -span / 2 + 0.28; K.jars = {};
  JARS.forEach((k, i) => { const info = jarInfo(k), x = x0 + i * 0.27, z = KZ - 0.33, g = new T3.Group(); g.position.set(x, T, z); root.add(g);
    M(new T3.CylinderGeometry(0.1, 0.1, 0.2, 16), toon(info.jar), 0, 0.1, 0, g, 0.008, 0.1); M(new T3.CylinderGeometry(0.105, 0.105, 0.04, 16), toon(info.lid), 0, 0.22, 0, g, 0.006, 0.105); M(new T3.SphereGeometry(0.025, 8, 6), toon(info.lid), 0, 0.25, 0, g, 0.004);
    const lab = CTX(256, 96, c => { c.fillStyle = '#fffaf0'; c.fillRect(0, 0, 256, 96); c.strokeStyle = '#201e1d'; c.lineWidth = 6; c.strokeRect(3, 3, 250, 90); c.fillStyle = '#201e1d'; c.font = '900 ' + (info.name.length > 7 ? 30 : 40) + 'px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(info.name, 128, 50); });
    const lm = new T3.Mesh(new T3.PlaneGeometry(0.17, 0.064), new T3.MeshBasicMaterial({ map: lab })); lm.position.set(0, 0.11, -0.101); lm.rotation.y = Math.PI; g.add(lm);
    const lt = new T3.Mesh(new T3.CircleGeometry(0.085, 16), new T3.MeshBasicMaterial({ map: lab })); lt.rotation.x = -Math.PI / 2; lt.position.y = 0.242; lt.rotation.z = Math.PI; g.add(lt);
    K.jars[k] = { x, z, g, y: T }; });
  K.bowl = { x: -0.75, z: KZ + 0.16 }; K.board = { x: 0.2, z: KZ + 0.12 }; K.tt = { x: Math.min(1.25, span / 2 - 0.55), z: KZ + 0.08, y: T + 0.13 };
  M(new T3.CylinderGeometry(0.3, 0.3, 0.02, 30), wood, K.board.x, T + 0.01, K.board.z, root, 0.006, 0.3);
  { const tt = K.tt; M(new T3.CylinderGeometry(0.12, 0.16, 0.03, 20), toon('#e8e4da'), tt.x, T + 0.015, tt.z, root, 0.006, 0.16); M(new T3.CylinderGeometry(0.03, 0.03, 0.08, 10), chrome, tt.x, T + 0.07, tt.z, root, 0);
    const top = new T3.Group(); top.position.set(tt.x, T + 0.11, tt.z); root.add(top); K.ttTop = top; M(new T3.CylinderGeometry(0.26, 0.26, 0.02, 32), toon('#fbf7ef'), 0, 0.01, 0, top, 0.006, 0.26); for (let i = 0; i < 8; i++) M(new T3.BoxGeometry(0.02, 0.004, 0.08), pinkD, Math.sin(i * 0.785) * 0.23, 0.021, Math.cos(i * 0.785) * 0.23, top, 0).rotation.y = i * 0.785; }
  // decorating corner: frosting tubs, a cup of piping bags and spatulas, topper bowls
  K.tubs = {}; Object.entries(FROSTINGS).forEach(([k, f], i) => { const x = K.tt.x + 0.45 + (i % 4) * 0.2, z = KZ - 0.36 + Math.floor(i / 4) * 0.2; if (x > span / 2 - 0.08) return; M(new T3.CylinderGeometry(0.075, 0.07, 0.08, 14), chrome, x, T + 0.04, z, root, 0.005, 0.075); const s = M(new T3.SphereGeometry(0.07, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(f.col), x, T + 0.075, z, root, 0.004, 0.07); s.scale.y = 0.5; K.tubs[k] = { x, z }; });
  { const cx = K.tt.x - 0.42, cz = KZ - 0.36; M(new T3.CylinderGeometry(0.06, 0.05, 0.14, 12), pink, cx, T + 0.07, cz, root, 0.005); PIPES.slice(0, 4).forEach((p, i) => { const b = M(new T3.ConeGeometry(0.03, 0.2, 10), toon(p.col), cx + Math.cos(i * 1.6) * 0.025, T + 0.2, cz + Math.sin(i * 1.6) * 0.025, root, 0.004); b.rotation.set(Math.PI + Math.cos(i * 1.6) * 0.25, 0, Math.sin(i * 1.6) * 0.25); }); }
  K.topBowls = {}; TOP_KEYS.forEach((k, i) => { const x = K.board.x - 0.15 + i * 0.13, z = KZ + 0.47; if (k === 'sprinkles') { M(new T3.CylinderGeometry(0.045, 0.045, 0.1, 10), toon('#fbf7ef'), x, T + 0.05, z, root, 0.004); for (let j = 0; j < 8; j++) M(new T3.BoxGeometry(0.012, 0.004, 0.004), toon(['#f472b6', '#38bdf8', '#fde047', '#86efac'][j % 4]), x + rr(-0.03, 0.03), T + 0.101, z + rr(-0.03, 0.03), root, 0).rotation.y = j; }
    else { M(new T3.CylinderGeometry(0.055, 0.04, 0.035, 12), chrome, x, T + 0.018, z, root, 0.004); for (let j = 0; j < 3; j++) { const t = topperMesh(T3, toon, k, null); t.scale.setScalar(0.8); t.position.set(x + (j - 1) * 0.022, T + 0.025, z + (j % 2) * 0.015); if (k === 'candle') t.rotation.z = 1.4; root.add(t); } } K.topBowls[k] = { x, z }; });
  // shelf of flour sacks + a CAKES OF THE DAY board on the back wall (right)
  for (let i = 0; i < 3; i++) { const s = M(new T3.CylinderGeometry(0.2, 0.24, 0.55, 10), toon('#f4ead2'), W / 2 - 0.5 - (i % 2) * 0.42, 0.28 + Math.floor(i / 2) * 0.5, back + 0.45 + (i % 2) * 0.1, root, 0.01); s.scale.z = 0.7; }
  { const menuT = CTX(1024, 512, c => { c.fillStyle = '#3a2418'; c.fillRect(0, 0, 1024, 512); c.strokeStyle = '#f4a6c0'; c.lineWidth = 12; c.strokeRect(14, 14, 996, 484); c.fillStyle = '#f7a8c4'; c.font = 'italic 900 78px Archivo, Arial'; c.fillText('FOXY CAKES', 44, 104); c.fillStyle = '#fff4e6'; c.font = '700 34px Archivo, Arial'; NAMES.forEach((nm, i) => c.fillText(nm, 44 + (i % 2) * 480, 186 + Math.floor(i / 2) * 68)); c.fillStyle = '#9fd8c4'; c.font = '700 28px Archivo, Arial'; c.fillText('ROUND · HEART · SQUARE   ·   CUSTOM MESSAGES', 44, 452); });
    const mw = Math.min(3.2, W / 2 - 0.9), mb = new T3.Mesh(new T3.PlaneGeometry(mw, mw / 2), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(W / 4 + 0.2, 2.75, back + 0.06); root.add(mb); const mf = M(new T3.BoxGeometry(mw + 0.16, mw / 2 + 0.16, 0.05), woodD, W / 4 + 0.2, 2.75, back + 0.02, root, 0.01); mb.userData.wallItem = mf.userData.wallItem = true; cut.push(mb, mf); }
  // SERVICE PASS: a pink counter with a glass CAKE CASE on the left, the box stack + register on the right, customer spots in front
  const PZ = KZ + 1.45; K.pass = { z: PZ, y: 1.1 };
  solid(-span / 2, span / 2, PZ - 0.28, PZ + 0.28, 1.05, pink, 0.03); M(new T3.BoxGeometry(span + 0.12, 0.06, 0.66), cream, 0, 1.08, PZ, root, 0.012);
  for (let i = 0; i < Math.floor(span / 0.4); i++) { const sc = M(new T3.CylinderGeometry(0.1, 0.1, 0.03, 10, 1, false, 0, Math.PI), cream, -span / 2 + 0.2 + i * 0.4, 0.98, PZ + 0.29, root, 0); sc.rotation.set(Math.PI / 2, 0, Math.PI); }
  { const cx = -span / 2 + 1.0, cw = 1.6; K.case = { x: cx, z: PZ }; const caseG = new T3.Group(); caseG.position.set(cx, 1.11, PZ); root.add(caseG);
    const gl = new T3.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.18, depthWrite: false, side: T3.DoubleSide });
    for (const [x, y, z, w, h, d] of [[0, 0.3, 0.25, cw, 0.6, 0.01], [0, 0.3, -0.25, cw, 0.6, 0.01], [-cw / 2, 0.3, 0, 0.01, 0.6, 0.5], [cw / 2, 0.3, 0, 0.01, 0.6, 0.5], [0, 0.6, 0, cw, 0.01, 0.5]]) { const p = new T3.Mesh(new T3.BoxGeometry(w, h, d), gl); p.position.set(x, y, z); caseG.add(p); }
    for (const [x, z] of [[-cw / 2, 0.25], [cw / 2, 0.25], [-cw / 2, -0.25], [cw / 2, -0.25]]) M(new T3.BoxGeometry(0.025, 0.62, 0.025), toon('#e6b45a'), x, 0.31, z, caseG, 0);
    M(new T3.BoxGeometry(cw, 0.02, 0.5), toon('#e6b45a'), 0, 0.61, 0, caseG, 0.004);
    const dc = [['round', '#f7a8c4', '#ffffff', 'strawberry'], ['heart', '#fbf7ef', '#ec4f8f', 'cherry'], ['square', '#6b3f26', '#f2b632', 'star']];
    dc.forEach(([shp, fc, pc, tk], i) => { const g = new T3.Group(); g.position.set(-0.52 + i * 0.52, 0.02, 0); g.scale.setScalar(0.62); caseG.add(g); const poly = shapePoly(shp), sh = shapeOf(T3, poly), bg = new T3.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 3 }); bg.rotateX(-Math.PI / 2);
      const b = new T3.Mesh(bg, toon(fc)); b.scale.y = 0.1; b.castShadow = true; g.add(b); M(new T3.CylinderGeometry(0.24, 0.26, 0.015, 24), toon('#ffffff'), 0, -0.006, 0, g, 0.004);
      for (let k = 0; k < 18; k++) { const p = poly[Math.floor(k / 18 * poly.length)], s = M(new T3.SphereGeometry(0.016, 8, 6), toon(pc), -p.x * R * 0.92, 0.1, p.y * R * 0.92, g, 0); s.scale.y = 0.75; }
      for (let k = 0; k < 4; k++) { const t = topperMesh(T3, toon, tk, null), a = k / 4 * Math.PI * 2 + 0.4; t.position.set(Math.cos(a) * 0.08, 0.1, Math.sin(a) * 0.08); g.add(t); } });
    K.caseG = caseG; }
  K.box = { x: span / 2 - 1.1, z: PZ }; for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.44, 0.24, 0.44), toon(i % 2 ? '#f7c6d6' : '#f4a6c0'), span / 2 - 0.45, 1.23 + i * 0.245, PZ - 0.02, root, 0.006).rotation.y = i * 0.12;
  K.register = { x: span / 2 - 0.45, z: PZ };
  K.serve = { x: 0.35, z: PZ }; K.spots = [0.35, -1.0, 1.7].map((x, i) => ({ x: clamp(x, -span / 2 + 0.4, span / 2 - 0.4), z: PZ + 0.9 + (i ? 0.5 : 0) }));
  // the cook's place and the keeper's place, for a world that hosts the shop
  K.work = { x: K.board.x, z: KZ - 0.85, face: 0 }; K.keeper = { x: OX + 1.25, z: KZ - 0.95, face: 0.4 }; K.door = { x: 0, z: D / 2 };
  // DINING: round café tables with pink-check cloths and little cake stands, bunting, hanging lamps, a FOXY CAKES neon
  const clothT = CTX(64, 64, c => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#fff4e6' : '#f4a6c0'; c.fillRect(x * 16, y * 16, 16, 16); } }), clothM = new T3.MeshToonMaterial({ map: clothT, gradientMap: ctx.grad });
  const tz = Math.min(D / 2 - 1.1, PZ + 2.3), tables = W >= 9 ? [-W / 2 + 1.25, W / 2 - 1.25] : [W / 2 - 1.15]; K.seats = []; K.tables = [];
  for (const x of tables) { const bc = root.children.length; M(new T3.CylinderGeometry(0.5, 0.5, 0.06, 20), clothM, x, 0.78, tz, root, 0.01, 0.5); M(new T3.CylinderGeometry(0.05, 0.08, 0.76, 8), ink, x, 0.38, tz, root, 0); blocks.push([x - 0.5, x + 0.5, tz - 0.5, tz + 0.5]); K.tables.push({ x, z: tz });
    for (const sx of [-0.85, 0.85]) { M(new T3.BoxGeometry(0.42, 0.05, 0.42), toon('#fbf7ef'), x + sx, 0.46, tz, root, 0.008); M(new T3.BoxGeometry(0.05, 0.5, 0.42), pinkD, x + sx * 1.24, 0.72, tz, root, 0.006); for (const lx of [-0.17, 0.17]) for (const lz of [-0.17, 0.17]) M(new T3.BoxGeometry(0.04, 0.44, 0.04), toon('#e6b45a'), x + sx + lx, 0.22, tz + lz, root, 0); K.seats.push({ x: x + sx, z: tz, face: sx < 0 ? Math.PI / 2 : -Math.PI / 2 }); }
    M(new T3.CylinderGeometry(0.015, 0.06, 0.12, 10), toon('#ffffff'), x, 0.87, tz, root, 0.004); M(new T3.CylinderGeometry(0.14, 0.14, 0.012, 20), toon('#ffffff'), x, 0.935, tz, root, 0.004); const sl = M(new T3.CylinderGeometry(0.1, 0.1, 0.08, 16, 1, false, 0, Math.PI * 1.6), toon('#fbf7ef'), x, 0.98, tz, root, 0.006); sl.rotation.y = x;
    booths.push(...root.children.slice(bc)); }
  K.lamps = []; for (const x of [-span / 3, span / 3]) { cut.push(M(new T3.CylinderGeometry(0.01, 0.01, 1.0, 4), ink, x, H - 0.5, PZ + 1.7, root, 0)); const sh = M(new T3.SphereGeometry(0.24, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f4a6c0', { side: T3.DoubleSide }), x, H - 1.2, PZ + 1.7, root, 0.01); K.lamps.push(sh); cut.push(sh); }
  { const fl = []; for (let i = 0; i < 16; i++) { const x = -W / 2 + 0.4 + i * (W - 0.8) / 15, y = H - 0.3 - Math.sin(i / 15 * Math.PI) * 0.4; const sh = new T3.Shape([new T3.Vector2(-0.1, 0), new T3.Vector2(0.1, 0), new T3.Vector2(0, -0.2)]); const b = new T3.Mesh(new T3.ShapeGeometry(sh), toon(['#f4a6c0', '#9fd8c4', '#fde68a', '#c9b6f2'][i % 4], { side: T3.DoubleSide })); b.position.set(x, y, D / 2 - 1.7); root.add(b); fl.push(b); } cut.push(...fl); }
  { const neonT = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); c.font = 'italic 900 64px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff7ab0'; c.shadowBlur = 24; c.strokeStyle = '#ff9ac4'; c.lineWidth = 8; c.strokeText('FOXY CAKES', 256, 66); c.fillStyle = '#fff'; c.fillText('FOXY CAKES', 256, 66); });
    const nm = new T3.Mesh(new T3.PlaneGeometry(2.8, 0.7), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); nm.position.set(-W / 2 + 0.06, 2.9, PZ + 0.6); nm.rotation.y = Math.PI / 2; root.add(nm); }
  { const p = new T3.Group(); p.position.set(W / 2 - 0.5, 0, D / 2 - 0.55); root.add(p); M(new T3.CylinderGeometry(0.26, 0.2, 0.42, 12), toon('#f4a6c0'), 0, 0.21, 0, p, 0.01); for (let i = 0; i < 7; i++) M(new T3.SphereGeometry(0.2, 8, 6), toon(i % 2 ? '#6fb8a2' : '#9fd8c4'), Math.cos(i) * 0.14, 0.62 + (i % 3) * 0.14, Math.sin(i) * 0.14, p, 0.006); booths.push(p); blocks.push([W / 2 - 0.8, W / 2 - 0.2, D / 2 - 0.85, D / 2 - 0.25]); }
  blocks.push([W / 2 - 0.95, W / 2 - 0.05, back, back + 0.75]);   // flour sacks
  cut.forEach(m => m.traverse(o => o.castShadow = false));
  // world helpers for a host: room-local (x, z) → world, colliders as world AABBs, and every spot in world space
  K.toWorld = (x, z) => { const c = Math.cos(rotY), sn = Math.sin(rotY); return { x: root.position.x + x * c + z * sn, z: root.position.z - x * sn + z * c }; };
  K.worldBlocks = () => blocks.map(([x0, x1, z0, z1]) => { const a = K.toWorld(x0, z0), b = K.toWorld(x1, z1); return [Math.min(a.x, b.x), Math.max(a.x, b.x), Math.min(a.z, b.z), Math.max(a.z, b.z)]; });
  K.worldSpot = k => { const sp = K[k]; if (!sp) return null; const w = K.toWorld(sp.x, sp.z); return { x: w.x, z: w.z, face: (sp.face || 0) + rotY }; };
  return K; }

// ---------------- the stand-alone game ----------------
export async function createCakeShift({ container, onState = () => {}, opts = {} }) {
  const ST = createStage(container, { bg: '#fff4e6' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildCakery({ THREE, M, toon, canvasTex, scene, grad, addOutline, size: opts.size }), T = K.top;
  const CUST = CUSTOMER_SETS[opts.world] || CUSTOMER_SETS.meru, FORGIVE = opts.forgiveness || 1;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe0b0, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending })); s.position.copy(l.position).add(V3(0, -0.15, 0)); s.scale.setScalar(1.3); scene.add(s); return s; });
  // ---------- sound, music, vibration, voice guide (all optional, remembered in the save) ----------
  const AU = cakeAudio(audio), OPTK = 'cakes.foxy.opt.', OPT = { music: save.stat(OPTK + 'music', opts.music === false ? 0 : 1), sfx: save.stat(OPTK + 'sfx', 1), voice: save.stat(OPTK + 'voice', 0), haptics: save.stat(OPTK + 'haptics', 1) };
  AU.setOn({ sfx: !!OPT.sfx, music: !!OPT.music });
  const sx = (n, a) => { if (audio.ctx) AU.sfx(n, a); }, buzz = ms => { if (OPT.haptics && navigator.vibrate) try { navigator.vibrate(ms); } catch (e) {} };
  const speak = txt => { if (!OPT.voice || !window.speechSynthesis || !txt) return; try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(String(txt).toLowerCase().replace(/·/g, ',')); u.rate = 1.05; u.pitch = 1.1; speechSynthesis.speak(u); } catch (e) {} };
  const LP = {}, lp = k => LP[k] || (audio.ctx && AU.ready() ? (LP[k] = AU.loop(k)) : null), lset = (k, lv, x) => { const L = lp(k); if (L && (lv > 0 || L.level > 0)) L.set(lv, x); };
  function setOpt(k, v) { OPT[k] = v ? 1 : 0; save.setStat(OPTK + k, OPT[k]); AU.setOn({ sfx: !!OPT.sfx, music: !!OPT.music }); if (k === 'voice' && !v && window.speechSynthesis) speechSynthesis.cancel(); if (k === 'voice' && v) speak('Voice guide on'); if (k === 'haptics' && v) buzz(30); sx('tap'); }
  const onVis = () => { AU.suspend(document.hidden); if (document.hidden && window.speechSynthesis) speechSynthesis.cancel(); }; document.addEventListener('visibilitychange', onVis);
  // ---------- sparkles + confetti ----------
  const starTex = canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); const g = c.createRadialGradient(32, 32, 0, 32, 32, 30); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,0.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 6 : 31; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.closePath(); c.fill(); });
  const SPK = Array.from({ length: 48 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); s.visible = false; s.renderOrder = 26; scene.add(s); return { s, life: 0, v: V3() }; }); let spkI = 0;
  function sparkle(p, n = 8, cols = ['#fff6c0', '#f7a8c4', '#ffffff', '#a8e6cf'], spread = 0.18) { for (let i = 0; i < n; i++) { const q = SPK[spkI = (spkI + 1) % SPK.length]; q.s.visible = true; q.s.position.set(p.x + rr(-spread, spread), p.y + rr(0, 0.08), p.z + rr(-spread, spread)); q.s.material.color.set(pick(cols)); q.life = 1; q.v.set(rr(-0.15, 0.15), rr(0.25, 0.6), rr(-0.15, 0.15)); q.sz = rr(0.05, 0.11); } }
  const CONF = Array.from({ length: 90 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 0.05), new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })); m.visible = false; scene.add(m); return { m, life: 0, v: V3(), w: V3() }; }); let cfI = 0;
  function confetti(p, n = 40) { for (let i = 0; i < n; i++) { const q = CONF[cfI = (cfI + 1) % CONF.length]; q.m.visible = true; q.m.position.set(p.x + rr(-0.3, 0.3), p.y + rr(0, 0.3), p.z + rr(-0.3, 0.3)); q.m.material.color.set(pick(['#f472b6', '#38bdf8', '#fde047', '#86efac', '#c4b5fd', '#fb923c'])); q.life = 1; q.v.set(rr(-1.2, 1.2), rr(1.5, 3), rr(-1.2, 1.2)); q.w.set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); } }
  const ovenLight = new THREE.PointLight(0xff9a4a, 0.6, 2.2, 1.6); ovenLight.position.set(K.oven.x, T + 0.45, K.oven.z + 0.1); scene.add(ovenLight);
  const ovenEls = [-0.18, 0.18].map(dz => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.25, 8), new THREE.MeshBasicMaterial({ color: 0x5a2010 })); m.rotation.z = Math.PI / 2; m.position.set(K.oven.x, T + 0.6, K.oven.z + dz); scene.add(m); return m; });
  const ovenGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a3a, transparent: true, depthWrite: false, opacity: 0, blending: THREE.AdditiveBlending })); ovenGlow.position.set(K.oven.x, T + 0.32, K.oven.z); ovenGlow.scale.set(1.5, 0.7, 1); scene.add(ovenGlow);

  // ---------- cast: Ben in the Foxy Cakes uniform, Miss Crumb the owner, the customers ----------
  const ben = kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#f4a6c0'], crest: '', gear: 'none', mood: 'happy' }), BP = ben.userData.P; if (BP.sword) BP.sword.visible = false; if (BP.gun) BP.gun.visible = false;
  const BEN_AT = V3(-0.9, 0, K.pass.z + 1.5); ben.position.copy(BEN_AT); ben.rotation.y = 0.3; scene.add(ben);
  const drawCakeIcon = (g, s) => { g.save(); g.scale(s, s); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#f1d08a'; g.beginPath(); g.rect(-70, -10, 140, 70); g.fill(); st(); g.fillStyle = '#f7a8c4'; g.beginPath(); g.moveTo(-74, -10); g.lineTo(74, -10); g.lineTo(74, 14); for (let i = 0; i <= 6; i++) g.quadraticCurveTo(74 - i * 24.6 - 12, 34, 74 - (i + 1) * 24.6, 14); g.lineTo(-74, -10); g.closePath(); g.fill(); st();
    g.fillStyle = '#fff4e6'; g.fillRect(-72, -26, 144, 18); g.strokeRect(-72, -26, 144, 18); g.fillStyle = '#e0303c'; g.beginPath(); g.arc(0, -42, 15, 0, 7); g.fill(); st(); g.fillStyle = '#7dd3fc'; g.fillRect(-36, -64, 10, 40); g.fillStyle = '#ffb020'; g.beginPath(); g.ellipse(-31, -74, 6, 11, 0, 0, 7); g.fill(); g.restore(); };
  const uniform = { parts: [] }; {
    const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 96); drawCakeIcon(g, 0.95); g.restore();
      g.save(); g.translate(128, 212); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-122, -24); g.lineTo(126, -30); g.lineTo(116, 34); g.lineTo(-130, 30); g.closePath(); g.fill(); g.fillStyle = '#9fd8c4'; g.beginPath(); g.moveTo(-114, -18); g.lineTo(118, -24); g.lineTo(110, 26); g.lineTo(-121, 23); g.closePath(); g.fill();
        g.font = 'italic 900 40px Archivo, "Arial Black", Arial, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('FOXY CAKES', 0, 2); g.fillStyle = '#ec4f8f'; g.fillText('FOXY CAKES', 0, 2); g.restore(); });
    const U = dinerUniform(ST, ben, { print, printY: 1.13, printSize: 0.52, stripe: '#f4a6c0', towelCol: '#f4a6c0' });
    U.hat.visible = false; const hs = BP.head.scale.x || 1, toque = new THREE.Group(); toque.position.set(0, BP.head.position.y + 0.3 * hs, 0.04); toque.scale.setScalar(hs); toque.rotation.x = -0.06; BP.body.add(toque);
    { const wht = toon('#fbfbf7'), shade = toon('#e8e4da');
      M(new THREE.CylinderGeometry(0.25, 0.24, 0.2, 24), wht, 0, 0.08, 0, toque, 0.012, 0.25);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; M(new THREE.BoxGeometry(0.012, 0.19, 0.02), shade, Math.sin(a) * 0.252, 0.08, Math.cos(a) * 0.252, toque, 0).rotation.y = a; }
      M(new THREE.CylinderGeometry(0.255, 0.255, 0.035, 24), toon('#f4a6c0'), 0, 0.005, 0, toque, 0);
      const crown = M(new THREE.SphereGeometry(0.33, 20, 14), wht, 0, 0.36, 0, toque, 0.012, 0.33); crown.scale.set(1, 0.72, 1);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; M(new THREE.SphereGeometry(0.15, 12, 10), wht, Math.sin(a) * 0.2, 0.46 + (i % 2) * 0.04, Math.cos(a) * 0.2, toque, 0.008, 0.15); }
      M(new THREE.SphereGeometry(0.17, 12, 10), wht, 0, 0.56, 0, toque, 0.008, 0.17); }
    uniform.parts = [...U.parts.filter(q => q !== U.hat), toque]; }
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.parts.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const crumb = kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#e8a06a', furDark: '#b8703a', blush: 0.5, lashes: 1 }, torso: ['#f4a6c0', '#fff4e6', '#d9799c'], outfit: 'coat', crest: '', gear: 'none', mood: 'happy', bow: true });
  { const P = crumb.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; } crumb.position.set(K.keeper.x, 0, K.keeper.z); crumb.rotation.y = K.keeper.face; scene.add(crumb);
  const custFox = CUST.map(cu => { const f = kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' }); const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.visible = false; scene.add(f); return f; });

  // ---------- the bowl: a pink lathe bowl, ingredient lumps, the batter ----------
  const BW = new THREE.Group(); scene.add(BW); const bowlHome = V3(K.bowl.x, T, K.bowl.z);
  { const prof = []; for (let i = 0; i <= 10; i++) { const a = i / 10 * Math.PI / 2; prof.push(new THREE.Vector2(0.06 + Math.sin(a) * 0.17, 0.17 - Math.cos(a) * 0.17)); } prof.push(new THREE.Vector2(0.245, 0.175));
    const b = new THREE.Mesh(new THREE.LatheGeometry(prof, 28), toon('#f4a6c0', { side: THREE.DoubleSide })); b.castShadow = true; addOutline(b, 0.006, 0.23); BW.add(b); M(new THREE.TorusGeometry(0.235, 0.012, 6, 28), toon('#fbf7ef'), 0, 0.172, 0, BW, 0).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.08, 0.09, 0.02, 16), toon('#d9799c'), 0, 0.005, 0, BW, 0.004); }
  const batterM = toon('#f3e1b0'), batterDisk = new THREE.Mesh(new THREE.CircleGeometry(1, 28), batterM); batterDisk.rotation.x = -Math.PI / 2; BW.add(batterDisk);
  const swirlTex = canvasTex(128, 128, c => { c.clearRect(0, 0, 128, 128); c.strokeStyle = 'rgba(255,255,255,0.45)'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i < 160; i++) { const a = i / 18, r = i * 0.38; i ? c.lineTo(64 + Math.cos(a) * r, 64 + Math.sin(a) * r) : c.moveTo(64, 64); } c.stroke(); });
  const swirl = new THREE.Mesh(new THREE.CircleGeometry(1, 28), new THREE.MeshBasicMaterial({ map: swirlTex, transparent: true, depthWrite: false })); swirl.rotation.x = -Math.PI / 2; BW.add(swirl);
  const lumps = new THREE.Group(); BW.add(lumps);
  const lumpMesh = k => { const g = new THREE.Group(), c = jarInfo(k).col; if (k === 'eggs') { for (let i = 0; i < 2; i++) { const w = M(new THREE.SphereGeometry(0.05, 12, 8), toon('#fffaf0'), (i - 0.5) * 0.08, 0, 0, g, 0); w.scale.y = 0.25; M(new THREE.SphereGeometry(0.024, 10, 8), toon('#f6b62a'), (i - 0.5) * 0.08, 0.008, 0, g, 0); } }
    else if (k === 'butter') M(new THREE.BoxGeometry(0.06, 0.04, 0.05), toon(c), 0, 0.015, 0, g, 0.004); else { const m = M(new THREE.SphereGeometry(0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(c), 0, 0, 0, g, 0.004); m.scale.y = 0.55; } return g; };
  const whisk = (() => { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.0025, 4, 18), toon('#d7dde3')); t.scale.set(0.7, 1.6, 1); t.rotation.y = i / 6 * Math.PI; t.position.y = 0.07; g.add(t); } const h = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.014, 0.16, 10), toon('#f4a6c0')); h.position.y = 0.22; addOutline(h, 0.003); g.add(h); g.visible = false; scene.add(g); return g; })();
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.02, 1, 10), batterM); stream.visible = false; scene.add(stream);

  // ---------- the cake: pan, batter, body, a canvas top face, 3D piping beads, toppers, sprinkles ----------
  const CG = new THREE.Group(); scene.add(CG);
  const panM = toon('#b9c2ca'), panIn = toon('#8e979f', { side: THREE.DoubleSide }), spongeSide = toon('#f1d08a'), spongeCap = toon('#f1d08a');
  let pan = null, batter = null, body = null, topFace = null, lineRing = null;
  const topCv = document.createElement('canvas'); topCv.width = topCv.height = 512; const tctx = topCv.getContext('2d'); const topTex = new THREE.CanvasTexture(topCv); topTex.colorSpace = THREE.SRGBColorSpace; topTex.anisotropy = 4;
  const frostCv = document.createElement('canvas'); frostCv.width = frostCv.height = 512; const fctx = frostCv.getContext('2d');
  const guideCv = document.createElement('canvas'); guideCv.width = guideCv.height = 512; const gctx = guideCv.getContext('2d');
  const topMat = new THREE.MeshToonMaterial({ map: topTex, gradientMap: grad, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  const BEAD_MAX = 2600, beadGeo = new THREE.SphereGeometry(1, 10, 7), starGeo = (() => { const s = new THREE.Shape(); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, r = i % 2 ? 0.62 : 1; i ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, Math.sin(a) * r); } const g = new THREE.ExtrudeGeometry(s, { depth: 1.1, bevelEnabled: true, bevelThickness: 0.35, bevelSize: 0.2, bevelSegments: 2 }); g.translate(0, 0, -0.55); g.rotateX(Math.PI / 2); return g; })();
  const beadMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad });
  const beadsRound = new THREE.InstancedMesh(beadGeo, beadMat, BEAD_MAX), beadsStar = new THREE.InstancedMesh(starGeo, beadMat, BEAD_MAX); [beadsRound, beadsStar].forEach(b => { b.count = 0; b.castShadow = true; b.frustumCulled = false; b.instanceMatrix.setUsage(THREE.DynamicDrawUsage); CG.add(b); });
  const SPR_MAX = 400, sprinkles = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.0022, 0.008, 2, 5), new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: grad }), SPR_MAX); sprinkles.count = 0; sprinkles.frustumCulled = false; CG.add(sprinkles);
  const toppersG = new THREE.Group(); CG.add(toppersG);
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _c = new THREE.Color(), _s = V3(), _p = V3();
  const toCv = (x, y) => [(x + 1.1) / 2.2 * 512, (1.1 - y) / 2.2 * 512];
  const cell = v => Math.floor((v + 1.1) / 2.2 * G), cellC = i => (i + 0.5) / G * 2.2 - 1.1;
  function buildCake() {
    [pan, batter, body, topFace, lineRing].forEach(m => { if (m) { CG.remove(m); m.traverse(o => o.geometry && o.geometry.dispose()); } });
    const poly = P.poly = shapePoly(P.shape), sh = shapeOf(THREE, poly);
    // pan: walls (outline 1.08 with the cake shape as a hole) + a base plate
    const outer = shapeOf(THREE, poly, 1.08); outer.holes.push(new THREE.Path(poly.map(p => new THREE.Vector2(-p.x * R, -p.y * R)).reverse()));
    const wg = new THREE.ExtrudeGeometry(outer, { depth: 0.07, bevelEnabled: false, curveSegments: 3 }); wg.rotateX(-Math.PI / 2); pan = new THREE.Group(); const wm = new THREE.Mesh(wg, panM); wm.castShadow = true; addOutline(wm, 0.004); pan.add(wm);
    const bg = new THREE.ShapeGeometry(shapeOf(THREE, poly, 1.08)); bg.rotateX(-Math.PI / 2); const bm = new THREE.Mesh(bg, panIn); bm.position.y = 0.002; pan.add(bm); CG.add(pan);
    // fill line inside the pan
    const lp = poly.map(p => V3(-p.x * R * 0.995, 0, p.y * R * 0.995)); lp.push(lp[0].clone()); lineRing = new THREE.Line(new THREE.BufferGeometry().setFromPoints(lp), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 0.012, gapSize: 0.008, depthTest: false, transparent: true })); lineRing.computeLineDistances(); lineRing.renderOrder = 20; lineRing.position.y = 0.07 * P.fillTarget; CG.add(lineRing);
    const eg = new THREE.ExtrudeGeometry(shapeOf(THREE, poly, 0.99), { depth: 1, bevelEnabled: false, curveSegments: 3 }); eg.rotateX(-Math.PI / 2);
    batter = new THREE.Mesh(eg, [batterM, batterM]); batter.scale.y = 0.0001; batter.position.y = 0.004; batter.visible = false; CG.add(batter);
    const cg = new THREE.ExtrudeGeometry(sh, { depth: 1, bevelEnabled: false, curveSegments: 3 }); cg.rotateX(-Math.PI / 2); body = new THREE.Mesh(cg, [spongeCap, spongeSide]); body.castShadow = true; body.visible = false; addOutline(body, 0.005); CG.add(body);
    const tg = new THREE.ShapeGeometry(sh); tg.rotateX(-Math.PI / 2); { const pos = tg.attributes.position, uv = tg.attributes.uv; for (let i = 0; i < pos.count; i++) { const x = -pos.getX(i) / R, y = pos.getZ(i) / R; uv.setXY(i, (x + 1.1) / 2.2, (y + 1.1) / 2.2); } uv.needsUpdate = true; }
    topFace = new THREE.Mesh(tg, topMat); topFace.visible = false; topFace.renderOrder = 2; CG.add(topFace);
    // scoring masks
    P.shapeCells = new Uint8Array(G * G); P.border = new Uint8Array(G * G); for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const x = cellC(i), y = cellC(j); if (inPoly(poly, x, y)) { P.shapeCells[j * G + i] = 1; if (!inPoly(poly, x, y, 0.2)) P.border[j * G + i] = 1; } }
    P.shapeN = P.shapeCells.reduce((a, b) => a + b, 0); P.frostCells = new Uint8Array(G * G);
    if (cakeBoard) CG.remove(cakeBoard); cakeBoard = new THREE.Group(); { const lace = canvasTex(256, 256, c => { c.clearRect(0, 0, 256, 256); c.fillStyle = '#ffffff'; c.beginPath(); for (let i = 0; i <= 96; i++) { const a = i / 96 * Math.PI * 2, r = 124 - (i % 2) * 7; c.lineTo(128 + Math.cos(a) * r, 128 + Math.sin(a) * r); } c.fill(); c.globalCompositeOperation = 'destination-out'; for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 24 + ring * 6; i++) { const a = i / (24 + ring * 6) * Math.PI * 2, r = 112 - ring * 14; c.beginPath(); c.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 3.4 - ring * 0.6, 0, 7); c.fill(); } });
      const gold = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.32, R * 1.32, 0.008, 40), toon('#e6b45a')); gold.position.y = -0.004; addOutline(gold, 0.004, R * 1.32); cakeBoard.add(gold); const dl = new THREE.Mesh(new THREE.CircleGeometry(R * 1.28, 40), new THREE.MeshBasicMaterial({ map: lace, transparent: true, depthWrite: false })); dl.rotation.x = -Math.PI / 2; dl.position.y = 0.0015; cakeBoard.add(dl); }
    cakeBoard.visible = false; CG.add(cakeBoard); while (dripsG.children.length) dripsG.remove(dripsG.children[0]);
    fctx.clearRect(0, 0, 512, 512); gctx.clearRect(0, 0, 512, 512); beadsRound.count = beadsStar.count = 0; sprinkles.count = 0; while (toppersG.children.length) toppersG.remove(toppersG.children[0]); topDirty = true; }
  let topDirty = true, cakeBoard = null; const dripsG = new THREE.Group(); CG.add(dripsG);
  const polyPath = (c, poly, s = 1) => { c.beginPath(); poly.forEach((p, i) => { const [u, v] = toCv(p.x * s, p.y * s); i ? c.lineTo(u, v) : c.moveTo(u, v); }); c.closePath(); };
  function drawTop() { topDirty = false; const c = tctx; c.clearRect(0, 0, 512, 512); if (!P.poly) { topTex.needsUpdate = true; return; }
    c.save(); polyPath(c, P.poly, 1.02); c.clip(); const k = (P.cooked || 0) / 100, base = hexMix(FLAVORS[P.flavor].sponge, '#8a5a2a', Math.max(0, k - 0.45) * 1.4); c.fillStyle = base; c.fillRect(0, 0, 512, 512);
    const gr = c.createRadialGradient(256, 256, 60, 256, 256, 280); gr.addColorStop(0, 'rgba(255,255,255,0.08)'); gr.addColorStop(1, 'rgba(90,50,20,0.35)'); c.fillStyle = gr; c.fillRect(0, 0, 512, 512);
    c.fillStyle = 'rgba(80,40,10,0.15)'; for (let i = 0; i < 70; i++) { c.beginPath(); c.arc((i * 97) % 512, (i * 211) % 512, 2 + (i % 3), 0, 7); c.fill(); }
    c.drawImage(frostCv, 0, 0); if (P.frostCells && P.stageIndex >= 4) { const cov = P.frostCov != null ? P.frostCov : 0.5, hl = c.createRadialGradient(200, 170, 10, 200, 170, 230); hl.addColorStop(0, 'rgba(255,255,255,' + (0.22 * cov).toFixed(3) + ')'); hl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = hl; c.fillRect(0, 0, 512, 512); }
    if (P.showGuide) c.drawImage(guideCv, 0, 0); c.restore(); topTex.needsUpdate = true; }
  // ---------- frosting: a spatula smear with highlight swirls ----------
  function frostDab(x, y, ang) { const f = FROSTINGS[P.frost].col, r = (upg('spatula') ? 0.27 : 0.2) * FORGIVE ** 0.3, [u, v] = toCv(x, y), rp = r / 2.2 * 512, c = fctx;
    c.save(); c.translate(u, v); c.rotate(ang); c.fillStyle = f; c.beginPath(); c.ellipse(0, 0, rp * 1.15, rp * 0.85, 0, 0, 7); c.fill();
    c.strokeStyle = hexMix(f, '#ffffff', 0.55); c.globalAlpha = 0.75; c.lineWidth = 3.5; c.beginPath(); c.arc(0, -rp * 0.2, rp * 0.75, -2.6, -0.5); c.stroke();
    c.strokeStyle = hexMix(f, '#3a2418', 0.22); c.globalAlpha = 0.45; c.lineWidth = 2.5; c.beginPath(); c.arc(0, rp * 0.25, rp * 0.6, 0.6, 2.4); c.stroke(); c.restore();
    const ci = cell(x), cj = cell(y), rc = Math.ceil(r / 2.2 * G); for (let j = cj - rc; j <= cj + rc; j++) for (let i = ci - rc; i <= ci + rc; i++) { if (i < 0 || j < 0 || i >= G || j >= G) continue; if (Math.hypot(cellC(i) - x, cellC(j) - y) <= r) P.frostCells[j * G + i] = 1; }
    topDirty = true; }
  // ---------- piping: 3D beads (round tip = soft rope, star tip = twisted rosette rope) ----------
  function beadAdd(x, y) { const tip = P.tip, mesh = tip === 'star' ? beadsStar : beadsRound; if (P.beads.length >= BEAD_MAX * 1.6 || mesh.count >= BEAD_MAX) return;
    const r = (tip === 'star' ? 0.0105 : 0.0085) * (upg('tips') ? 1.25 : 1), col = PIPES.find(p => p.id === P.pipeCol).col, i = mesh.count, top = P.h;
    _p.set(-x * R, top + r * 0.55, y * R); _e.set(0, (P.beads.length * 0.55) % (Math.PI * 2), 0); _q.setFromEuler(_e); _s.set(r, r * (tip === 'star' ? 0.9 : 0.72), r); _m4.compose(_p, _q, _s); mesh.setMatrixAt(i, _m4); mesh.setColorAt(i, _c.set(col)); mesh.count = i + 1; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    P.beads.push({ x, y, col: P.pipeCol, tip }); }
  function pipeTo(p, first) { const last = P.pipeLast, sp = (P.tip === 'star' ? 0.034 : 0.04); if (first || !last) { beadAdd(p.x, p.y); P.pipeLast = { x: p.x, y: p.y }; sx('squish'); S.pipeT = 0.12; return; }
    const d = Math.hypot(p.x - last.x, p.y - last.y); if (d < sp) return; const n = Math.min(12, Math.floor(d / sp)); for (let k = 1; k <= n; k++) beadAdd(last.x + (p.x - last.x) * k / n, last.y + (p.y - last.y) * k / n); P.pipeLast = { x: p.x, y: p.y }; S.pipeT = 0.12; if ((P.beads.length % 5) === 0) sx('squish'); }
  function undoStroke() { if (stage() !== 'pipe' || !P.strokes.length) return; const from = P.strokes.pop(); const drop = P.beads.splice(from); for (const b of drop) { const mesh = b.tip === 'star' ? beadsStar : beadsRound; mesh.count = Math.max(0, mesh.count - 1); } sx('undo'); buzz(15); }
  // ---------- the guide: the ordered message or heart, as a dashed stencil, plus a scoring mask ----------
  function layoutText(txt) { const words = txt.split(' '), lines = []; let cur = ''; for (const w of words) { if (!cur) cur = w; else if ((cur + ' ' + w).length <= 8) cur += ' ' + w; else { lines.push(cur); cur = w; } } if (cur) lines.push(cur);
    const maxC = Math.max(...lines.map(l => l.length)), wide = P.shape === 'heart' ? 1.25 : 1.5, fs = Math.min(0.46, wide / (maxC * 0.68), 1.15 / (lines.length * 1.18)); return { lines, fs }; }
  function guidePaint(c, scale, mode) { c.save(); c.scale(scale, scale); const yc = P.shape === 'heart' ? 0.16 : 0;
    if (P.pipe.kind === 'heart') { const hs = 0.5, path = () => { c.beginPath(); for (let i = 0; i <= 80; i++) { const t = i / 80 * Math.PI * 2, x = 16 * Math.pow(Math.sin(t), 3) / 17 * hs, y = (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 * hs + yc + 0.04; const [u, v] = toCv(x, y); i ? c.lineTo(u, v) : c.moveTo(u, v); } c.closePath(); };
      if (mode === 'mask') { path(); c.strokeStyle = '#000'; c.lineWidth = 0.075 / 2.2 * 512; c.stroke(); }
      else { path(); c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.075 / 2.2 * 512; c.stroke(); c.setLineDash([9, 7]); c.strokeStyle = 'rgba(32,30,29,0.7)'; c.lineWidth = 2.5; c.stroke(); } }
    else { const { lines, fs } = layoutText(P.pipe.text), px = fs / 2.2 * 512, lh = fs * 1.18, y0 = yc + (lines.length - 1) * lh / 2; c.font = '900 ' + px.toFixed(1) + 'px Archivo, "Arial Black", Arial, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
      lines.forEach((ln, i) => { const [u, v] = toCv(0, y0 - i * lh); if (mode === 'mask') { c.fillStyle = '#000'; c.fillText(ln, u, v); } else { c.fillStyle = 'rgba(255,255,255,0.42)'; c.fillText(ln, u, v); c.setLineDash([6, 5]); c.strokeStyle = 'rgba(32,30,29,0.75)'; c.lineWidth = 2; c.strokeText(ln, u, v); c.setLineDash([]); } }); }
    c.restore(); }
  function buildGuide() { gctx.clearRect(0, 0, 512, 512); guidePaint(gctx, 1, 'show'); const mc = document.createElement('canvas'); mc.width = mc.height = G; const m = mc.getContext('2d'); guidePaint(m, G / 512, 'mask'); const d = m.getImageData(0, 0, G, G).data;
    P.guide = new Uint8Array(G * G); P.guideNear = new Uint8Array(G * G); for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) if (d[(j * G + i) * 4 + 3] > 90) P.guide[(G - 1 - j) * G + i] = 1;   // canvas rows run far→near; grid rows run near→far
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) if (P.guide[j * G + i]) for (let b = -3; b <= 3; b++) for (let a = -3; a <= 3; a++) { const ii = i + a, jj = j + b; if (ii >= 0 && jj >= 0 && ii < G && jj < G && a * a + b * b <= 10) P.guideNear[jj * G + ii] = 1; }
    P.guideN = P.guide.reduce((a, b) => a + b, 0); topDirty = true; }
  function pipeScore() { const B = P.beads; if (!B.length) return { sc: 0, cover: 0, border: 0 }; const dil = new Uint8Array(G * G), rc = 2 + (upg('tips') ? 1 : 0);
    for (const b of B) { const ci = cell(b.x), cj = cell(b.y); for (let j = cj - rc; j <= cj + rc; j++) for (let i = ci - rc; i <= ci + rc; i++) if (i >= 0 && j >= 0 && i < G && j < G && (i - ci) ** 2 + (j - cj) ** 2 <= rc * rc + 1) dil[j * G + i] = 1; }
    let cov = 0; for (let k = 0; k < G * G; k++) if (P.guide[k] && dil[k]) cov++; const cover = cov / Math.max(1, P.guideN);
    let mess = 0, onG = 0, match = 0; for (const b of B) { const k = cell(b.y) * G + cell(b.x); if (P.guideNear[k]) { onG++; if (b.col === P.pipe.col) match++; } else if (!P.border[k]) mess++; }
    let bc = 0, bn = 0; for (let k = 0; k < G * G; k++) if (P.border[k] && !P.guideNear[k]) { bn++; if (dil[k]) bc++; } const border = bn ? bc / bn : 0;
    const colorOk = S.free ? 1 : onG ? match / onG : 0, messF = Math.min(1, mess / Math.max(1, B.length) * 2.2);
    const sc = clamp(cover * 100 * 0.72 + (1 - messF) * 100 * 0.13 + colorOk * 100 * 0.15 + Math.min(1, border * 1.6) * 12, 0, 100); return { sc, cover, border, colorOk }; }
  // ---------- toppers ----------
  function addTopper(p, k) { if (P.tops.filter(t => t.key === k).length >= P.toppers[k]) { flash('THAT\'S ALL ' + P.toppers[k], '#ffd23a', 0.7); return; } if (!inPoly(P.poly, p.x, p.y, 0.1)) { flash('ON THE CAKE, PLEASE', '#ffffff', 0.7); return; }
    const m = topperMesh(THREE, toon, k, addOutline); m.position.set(-p.x * R, P.h, p.y * R); m.rotation.y = Math.random() * 6; m.userData.drop = 0; toppersG.add(m); P.tops.push({ key: k, x: p.x, y: p.y }); sx('plopTop', P.tops.length); if (k === 'candle') setTimeout(() => sx('candle'), 200); buzz(12); }
  const SPR_COLS = ['#f472b6', '#38bdf8', '#fde047', '#86efac', '#c4b5fd', '#fb923c', '#ffffff'];
  function scatter(p) { for (let n = 0; n < 3; n++) { if (sprinkles.count >= SPR_MAX) return; const a = Math.random() * 7, d = Math.random() * 0.13, x = p.x + Math.cos(a) * d, y = p.y + Math.sin(a) * d; if (!inPoly(P.poly, x, y, 0.03)) continue;
    _p.set(-x * R, P.h + 0.003, y * R); _e.set(Math.PI / 2, 0, Math.random() * 6); _q.setFromEuler(_e); _s.set(1, 1, 1); _m4.compose(_p, _q, _s); const i = sprinkles.count; sprinkles.setMatrixAt(i, _m4); sprinkles.setColorAt(i, _c.set(pick(SPR_COLS))); sprinkles.count = i + 1; P.spr.push({ x, y }); }
    sprinkles.instanceMatrix.needsUpdate = true; if (sprinkles.instanceColor) sprinkles.instanceColor.needsUpdate = true; if (Math.random() < 0.5) sx('sprinkle'); }
  function topperScore(k) { if (TOPPERS[k].scatter) { const n = P.spr.length, want = P.toppers[k]; const cnt = n <= want ? n / want : Math.max(0.5, 1 - (n - want * 1.6) / want); const q = [0, 0, 0, 0]; P.spr.forEach(s => q[(s.x > 0 ? 1 : 0) + (s.y > 0 ? 2 : 0)]++); const spread = q.filter(v => v >= n * 0.12).length / 4; return clamp(Math.min(1, cnt) * 70 + spread * 30, 0, 100); }
    const mine = P.tops.filter(t => t.key === k), want = P.toppers[k]; if (!mine.length) return 0; const count = Math.max(0, 100 - Math.abs(want - mine.length) * (100 / want));
    const bins = Math.min(6, want), b = new Array(bins).fill(0); mine.forEach(t => b[Math.floor(((Math.atan2(t.y, t.x) + Math.PI) / (Math.PI * 2)) * bins) % bins]++); const ideal = mine.length / bins, dev = b.reduce((a, v) => a + Math.abs(v - ideal), 0) / (2 * mine.length);
    const over = P.guideNear ? mine.filter(t => P.guideNear[cell(t.y) * G + cell(t.x)]).length / mine.length : 0; return clamp(count * 0.4 + (1 - dev) * 100 * 0.35 + (1 - over) * 100 * 0.25, 0, 100); }

  // ---------- props: spatula, piping bag, pastry box ----------
  const spatula = (() => { const g = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.004, 0.2), toon('#d7dde3')); bl.position.set(0, 0.004, 0.06); addOutline(bl, 0.003); g.add(bl); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.13, 8), toon('#f4a6c0')); h.rotation.x = Math.PI / 2 - 0.4; h.position.set(0, 0.04, 0.21); addOutline(h, 0.003); g.add(h); g.visible = false; scene.add(g); return g; })();
  const bagMat = toon('#ffffff'); const bag = (() => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 14), bagMat); c.rotation.x = Math.PI; c.position.y = 0.12; addOutline(c, 0.003); g.add(c); const tp = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.03, 8), toon('#d7dde3')); tp.rotation.x = Math.PI; tp.position.y = 0.025; g.add(tp); const tw = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), toon('#e8e4da')); tw.position.y = 0.23; tw.scale.y = 1.4; g.add(tw); g.rotation.x = -0.35; g.visible = false; scene.add(g); return g; })();
  const boxG = (() => { const g = new THREE.Group(), m = toon('#f7c6d6'), w = 0.5, h = 0.24; const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, w), m); base.position.y = 0.01; addOutline(base, 0.005); g.add(base);
    for (const [x, z, ry] of [[0, -w / 2, 0], [-w / 2, 0, Math.PI / 2], [w / 2, 0, Math.PI / 2]]) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.01), m); s.position.set(x, h / 2, z); s.rotation.y = ry; addOutline(s, 0.004); g.add(s); }
    const fr = new THREE.Group(); fr.position.set(0, 0, w / 2); g.add(fr); const fs = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.01), m); fs.position.y = h / 2; fs.geometry.translate(0, 0, 0); addOutline(fs, 0.004); fr.add(fs); fr.rotation.x = 1.5; g.userData.front = fr;
    const lid = new THREE.Group(); lid.position.set(0, h, -w / 2); g.add(lid); const lm = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, w), m); lm.position.z = w / 2; addOutline(lm, 0.004); lid.add(lm); lid.rotation.x = -1.9; g.userData.lid = lid;
    const lt = canvasTex(256, 256, c => { c.fillStyle = '#f7c6d6'; c.fillRect(0, 0, 256, 256); c.save(); c.translate(128, 110); drawCakeIcon(c, 0.7); c.restore(); c.fillStyle = '#c42d5c'; c.font = 'italic 900 34px Archivo, Arial'; c.textAlign = 'center'; c.fillText('FOXY CAKES', 128, 226); });
    const lp = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: lt })); lp.position.set(0, 0.007, w / 2); lp.rotation.set(-Math.PI / 2, 0, Math.PI); lid.add(lp);
    for (const ry of [0, Math.PI / 2]) { const rb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.014, w + 0.01), toon('#9fd8c4')); rb.position.set(0, 0.008, w / 2); rb.rotation.y = ry; lid.add(rb); } const bow = new THREE.Mesh(new THREE.TorusKnotGeometry(0.03, 0.01, 30, 6, 2, 3), toon('#9fd8c4')); bow.position.set(0, 0.03, w / 2); bow.scale.y = 0.5; lid.add(bow);
    g.visible = false; scene.add(g); return g; })();
  const steamS = []; for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(0.18); scene.add(s); steamS.push(s); }

  // ---------- shift + order state ----------
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, starList: [], scoreList: [], flash: null, flashT: 0, say: '', sayT: 0, done: null, combo: 0, card: null, react: null, oi: 0, ord: null, queue: [], demo: false, free: null, baking: false, spin: 0, spinOn: false, lastInput: 0 };
  const ordersToday = () => S.free ? 1 : 3 + Math.min(3, S.day - 1);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const P = {};
  const stage = () => (P.stages && P.stages[P.stageIndex]) || 'none';
  function cfg(lvl) { return { zoneWidth: Math.max(9, 22 - (lvl - 1) * 2) * FORGIVE * (upg('therm') ? 1.3 : 1), bakeSpeed: 11 + (lvl - 1) * 1.6, turns: 8 }; }
  function stageTime(st) { if (S.free) return 0; const tt = upg('tips') ? 1.3 : 1;
    if (st === 'mix') return 14; if (st === 'whisk') return 10; if (st === 'pour') return 10; if (st === 'frost') return 11;
    if (st === 'pipe') return Math.round((P.pipe.kind === 'heart' ? 15 : 9 + P.pipe.text.replace(/ /g, '').length * 1.7) * tt * FORGIVE);
    if (st.indexOf('top:') === 0) return 9; return 0; }
  function freshOrder(lvl, ci, free) { const c = cfg(lvl), fl = free ? free.flavor : pick(FLAV_KEYS.slice(0, Math.min(5, 2 + lvl))), shape = free ? free.shape : lvl <= 1 ? 'round' : pick(lvl <= 2 ? ['round', 'heart'] : ['round', 'heart', 'square']);
    const frost = free ? free.frost : pick(Object.keys(FROSTINGS).slice(0, Math.min(7, 3 + lvl))), fcol = FROSTINGS[frost].col;
    const okPipes = PIPES.filter(p => new THREE.Color(p.col).getHSL({}).l < 0.75 === new THREE.Color(fcol).getHSL({}).l >= 0.6 || Math.abs(new THREE.Color(p.col).getHSL({}).l - new THREE.Color(fcol).getHSL({}).l) > 0.3);
    const cu = CUST[ci] || {}, short = (cu.short || cu.name || 'FRIEND').split(' ')[0];
    let pipe; if (free) pipe = { kind: free.heart ? 'heart' : 'text', text: free.text || 'HAPPY BIRTHDAY', col: free.col || 'pink' };
    else { const kind = S.demo ? 'heart' : (S.oi === 0 && S.day === 1) ? 'heart' : Math.random() < 0.22 ? 'heart' : 'text'; const text = Math.random() < 0.3 && short.length <= 7 ? 'HI ' + short : pick(lvl <= 1 ? ['YAY!', 'I LOVE YOU', 'THANK YOU', 'HAPPY DAY'] : MESSAGES); pipe = { kind, text, col: pick(okPipes.length ? okPipes : PIPES).id }; }
    const nTop = lvl >= 3 ? 2 : 1, keys = []; const pool = TOP_KEYS.slice(0, Math.min(6, 2 + lvl)); if (free) { keys.push(free.topper || 'strawberry'); if (keys[0] !== 'sprinkles') keys.push('sprinkles'); } else while (keys.length < nTop) { const k = pick(pool); if (!keys.includes(k)) keys.push(k); }
    const toppers = {}; keys.forEach(k => toppers[k] = TOPPERS[k].scatter ? 50 : free ? 8 : k === 'candle' ? pick([4, 5, 6, 8]) : pick([5, 6, 8]));
    const doneTarget = free ? 55 : pick([48, 52, 55, 58, 62, 66]);
    return { lvl, ci, flavor: fl, shape, frost, pipe, toppers, keys, doneTarget, zoneWidth: c.zoneWidth, bakeSpeed: c.bakeSpeed, turns: 0, recipe: [...BASE, fl], added: [], wrong: 0, fill: 0, fillTarget: 0.62, tilt: 0, spill: 0, cooked: 0, rise: 0, h: 0.1, frostSpill: 0,
      tip: 'round', pipeCol: 'white', beads: [], strokes: [], pipeLast: null, tops: [], spr: [], scores: {}, labels: {}, stages: ['mix', 'whisk', 'pour', 'bake', 'frost', 'pipe', ...keys.map(k => 'top:' + k), 'serve'], stageIndex: 0, stageTime: 0, elapsed: 0,
      order: NAMES[(ci + lvl) % NAMES.length], showGuide: false }; }
  const LABEL = { mix: 'MIX', whisk: 'WHISK', pour: 'POUR', bake: 'BAKE', frost: 'FROST', pipe: 'DESIGN' };
  function commit(st, score) { const lb = st.indexOf('top:') === 0 ? TOPPERS[st.slice(4)].name : LABEL[st]; P.scores[lb] = Math.max(0, Math.min(100, Math.round(score))); sx('stage', P.scores[lb]); if (P.scores[lb] >= 90) { sparkle(CG.position.clone().setY(CG.position.y + (P.h || 0.08) + 0.04), 10); sx('sparkle'); } P.stageIndex = Math.min(P.stages.length - 1, P.stageIndex + 1); P.stageTime = stageTime(stage()); onStage(); }
  // ---------- stations ----------
  const AT = { board: () => V3(K.board.x, T + 0.02, K.board.z), oven: () => V3(K.oven.x, K.oven.y, K.oven.z), ovenMouth: () => V3(K.oven.x, K.oven.y + 0.02, K.oven.front + 0.25), tt: () => V3(K.tt.x, K.tt.y, K.tt.z), pass: () => V3(K.serve.x, 1.115, K.pass.z) };
  function moveTo(where, dur = 0.7, arc = 0.25, done) { const to = typeof where === 'string' ? AT[where]() : where; CG.userData.move = { from: CG.position.clone(), to, t: 0, dur, arc, done }; }
  function onStage() { const st = stage(); S.stageT = 0; whisk.visible = spatula.visible = bag.visible = false; P.showGuide = false;
    if (st === 'whisk') { say('MISS CRUMB: "Now whisk! Circle your finger around the bowl. Smooth, not too much."', 3.5); flash('CIRCLE TO WHISK', '#ffd23a', 1.2); }
    else if (st === 'pour') { pan.visible = true; lineRing.visible = true; batter.visible = true; BW.userData.go = 'pour'; flash('PULL DOWN TO TILT · STOP AT THE LINE', '#ffd23a', 1.8); }
    else if (st === 'bake') { BW.userData.go = 'home'; lineRing.visible = false; S.ovenStep = 'in'; K.ovenDoor.userData.open = 1; P.zoneRang = false; sx('doorOpen'); setTimeout(() => moveTo('ovenMouth', 0.8, 0.45, () => moveTo('oven', 0.5, 0, () => { K.ovenDoor.userData.open = 0; sx('doorClose'); S.baking = true; S.ovenStep = 'bake'; flash('PULL IT OUT AT ' + doneName(P.doneTarget), '#ffd23a', 1.8); })), 350); say('THE OVEN: Watch it rise. Pull it out when it\'s ' + doneName(P.doneTarget).toLowerCase() + '.', 3.5); }
    else if (st === 'frost') { S.spinOn = true; flash(FROSTINGS[P.frost].name + ' FROSTING · DRAG TO SPREAD', '#ffd23a', 1.6); }
    else if (st === 'pipe') { S.spinOn = false; P.showGuide = true; buildGuide(); flash(P.pipe.kind === 'heart' ? 'PIPE THE HEART IN ' + PIPES.find(p => p.id === P.pipe.col).name : 'PIPE "' + P.pipe.text + '" IN ' + PIPES.find(p => p.id === P.pipe.col).name, '#ffd23a', 2); finishFrost(); }
    else if (st.indexOf('top:') === 0) { S.spinOn = false; const k = st.slice(4); flash(TOPPERS[k].scatter ? 'DRAG TO SHOWER THE SPRINKLES' : 'TAP TO PLACE ' + P.toppers[k] + ' ' + TOPPERS[k].name, '#ffd23a', 1.5); }
    else if (st === 'serve') { S.spinOn = false; boxG.visible = true; boxG.position.copy(AT.pass()).add(V3(0, -0.005, 0)); boxG.userData.close = 0; moveTo(AT.pass().add(V3(0, 0.01, 0)), 0.9, 0.4, () => { boxG.userData.close = 1; sx('boxClose'); buzz(25); }); }
    if (st !== 'none') speak(stageSpeech(st)); }
  function stageSpeech(st) { if (st.indexOf('top:') === 0) { const k = st.slice(4); return TOPPERS[k].scatter ? 'Sprinkles. Drag to shower them.' : 'Place ' + P.toppers[k] + ' ' + TOPPERS[k].name + '. Tap around the cake.'; }
    return { mix: 'Mix. Tap ' + P.recipe.map(k => jarInfo(k).name).join(', '), whisk: 'Whisk. Circle your finger in the bowl.', pour: 'Pour. Press and pull down to tilt. Stop at the line.', bake: 'Bake until ' + doneName(P.doneTarget) + '. Listen for the bell, then pull it out.', frost: FROSTINGS[P.frost].name + ' frosting. Drag to spread it.', pipe: P.pipe.kind === 'heart' ? 'Pipe a heart in ' + PIPES.find(q => q.id === P.pipe.col).name : 'Pipe ' + P.pipe.text + ' in ' + PIPES.find(q => q.id === P.pipe.col).name, serve: 'Box it and serve.' }[st] || ''; }
  function finishFrost() { const cov = P.frostCells.reduce((a, b, i) => a + (b && P.shapeCells[i] ? 1 : 0), 0) / Math.max(1, P.shapeN); P.frostCov = cov; const f = FROSTINGS[P.frost].col; spongeSide.color.set(hexMix(FLAVORS[P.flavor].sponge, f, Math.min(1, cov * 1.25))); spongeCap.color.copy(spongeSide.color); }

  // ---------- stage actions ----------
  function addIng(k) { if (stage() !== 'mix' || P.added.includes(k) || S.jarAnim) return; const j = K.jars[k]; S.jarAnim = { k, t: 0, home: j.g.position.clone(), rot: 0 }; sx('jarLift'); buzz(10); }
  function landIng(k) { P.added.push(k); if (!P.recipe.includes(k)) { P.wrong++; flash('OOPS · ' + jarInfo(k).name + ' ISN\'T IN THIS ONE', '#ec3013', 1.1); sx('wrong'); buzz([30, 40, 30]); } else flash('+ ' + jarInfo(k).name, '#22c55e', 0.6);
    sx(k === 'flour' || k === 'sugar' ? 'pourDry' : k === 'eggs' ? 'eggCrack' : k === 'butter' ? 'plop' : 'glug');
    const l = lumpMesh(k); l.position.set(rr(-0.08, 0.08), 0.06 + lumps.children.length * 0.008, rr(-0.08, 0.08)); l.rotation.y = rr(0, 6); lumps.add(l); puff(BW.position.x, T + 0.2, BW.position.z, 0xfff3d0, 2);
    if (P.recipe.every(r => P.added.includes(r))) stageDone(); }
  function mixScore() { const miss = P.recipe.filter(r => !P.added.includes(r)).length; return Math.max(0, 100 - miss * 22 - P.wrong * 18); }
  function whiskScore() { const t = P.turns, n = cfg(P.lvl).turns; return t < n ? t / n * 85 : t <= n + 3.5 ? 100 : Math.max(35, 100 - (t - n - 3.5) * 12); }
  function pourScore() { const off = Math.abs(P.fill - P.fillTarget); return Math.max(0, 100 - off * 320 - P.spill * 30); }
  function pullOut() { if (stage() !== 'bake' || !S.baking) return; S.baking = false; const off = Math.abs(P.cooked - P.doneTarget), half = P.zoneWidth / 2, sc = off <= half ? 100 - (off / half) * 22 : Math.max(0, 76 - (off - half) * 2.4);
    flash(doneName(P.cooked) + (off <= half ? ' · PERFECT' : P.cooked < P.doneTarget ? ' · TOO SOON' : ' · TOO LATE'), off <= half ? '#22c55e' : '#ec3013', 1.3); sx('pullOut'); buzz(off <= half ? 40 : [20, 30, 20]); speak(doneName(P.cooked) + (off <= half ? ', perfect' : ''));
    P.labels.bake = sc; S.ovenStep = 'out'; K.ovenDoor.userData.open = 1; setTimeout(() => sx('doorOpen'), 120); setTimeout(() => moveTo('ovenMouth', 0.5, 0, () => { K.ovenDoor.userData.open = 0; sx('doorClose'); moveTo('tt', 0.9, 0.35, () => { depan(); commit('bake', P.labels.bake); }); }), 400); }
  function depan() { pan.visible = false; batter.visible = false; P.h = 0.05 + P.rise; body.visible = true; body.scale.y = P.h; topFace.visible = true; topFace.position.y = P.h + 0.0005; const k = P.cooked / 100;
    spongeSide.color.set(hexMix(FLAVORS[P.flavor].sponge, '#5a3418', Math.max(0, k - 0.6) * 2)); spongeCap.color.copy(spongeSide.color); topDirty = true; for (let i = 0; i < 6; i++) puff(CG.position.x + rr(-0.15, 0.15), CG.position.y + P.h, CG.position.z + rr(-0.15, 0.15), 0xffffff, 1); sx('depan'); buzz(30); cakeBoard.visible = true; }
  function stageDone() { const st = stage(); if (CG.userData.move) return;
    if (st === 'mix') { commit('mix', mixScore()); }
    else if (st === 'whisk') { commit('whisk', whiskScore()); whisk.visible = false; }
    else if (st === 'pour') { P.tilt = 0; commit('pour', pourScore()); }
    else if (st === 'frost') { finishFrost(); const sc = Math.min(100, P.frostCov * 108) - Math.min(30, P.frostSpill * 3); commit('frost', sc); flash('FROSTED · ' + Math.round(P.frostCov * 100) + '% COVERED', P.frostCov > 0.85 ? '#22c55e' : '#ffd23a', 1); }
    else if (st === 'pipe') { const r = pipeScore(); P.pipeRes = r; P.showGuide = false; topDirty = true; P.strokes = []; commit('pipe', r.sc); flash('DESIGN ' + Math.round(r.sc) + (r.border > 0.5 ? ' · BORDER BONUS!' : ''), r.sc >= 80 ? '#22c55e' : '#ffd23a', 1.4); }
    else if (st.indexOf('top:') === 0) commit(st, topperScore(st.slice(4))); }

  // ---------- customers + orders ----------
  function walkIn(ci, spot) { const f = custFox[ci], sp = K.spots[spot]; f.visible = true; f.position.set(sp.x + (spot === 2 ? 3 : -3), 0, K.D / 2 - 0.6); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.userData.lineMood = null; return { ci, f, spot, st: 'walk' }; }
  function nextCi(skip = []) { const used = [S.ord && S.ord.ci, ...S.queue.map(q => q.ci), ...skip]; const pool = CUST.map((_, i) => i).filter(i => !used.includes(i)); return pick(pool.length ? pool : CUST.map((_, i) => i)); }
  function resetBowl() { while (lumps.children.length) lumps.remove(lumps.children[0]); BW.position.copy(bowlHome); BW.rotation.set(0, 0, 0); BW.userData.go = null; P.bowlLevel = 0; batterM.color.set('#f3e1b0'); }
  function startOrder() { const lvl = Math.min(8, S.day + S.oi); let cu = null; if (!S.free) { const q = S.queue.shift(); cu = q ? q : walkIn(nextCi(), 0); cu.spot = 0; cu.st = 'walk'; }
    Object.keys(P).forEach(k => delete P[k]); Object.assign(P, freshOrder(lvl, cu ? cu.ci : 0, S.free)); P.stageTime = stageTime('mix'); S.ord = cu; S.card = null; S.react = null; boxG.visible = false; S.spin = 0; CG.rotation.y = 0; CG.position.copy(AT.board()); CG.visible = true;
    buildCake(); spongeSide.color.set(FLAVORS[P.flavor].sponge); spongeCap.color.set(FLAVORS[P.flavor].sponge); batterM.color.set(FLAVORS[P.flavor].batter); resetBowl(); pan.visible = true; lineRing.visible = false;
    if (!S.free && S.oi + 1 < ordersToday()) S.queue.push(walkIn(nextCi(), 1)); onStage(); if (S.free) say('MISS CRUMB: "Your cake, your rules. No clock. Have fun!"', 4); }
  function serve() { if (stage() !== 'serve' || S.react || S.card || CG.userData.move) return; const vals = Object.values(P.scores), avg = Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length)), m = moodOf(avg);
    if (S.free) { S.card = { word: m[2], mood: m[1], col: m[3], stars: m[5], who: 'YOUR CAKE', avg, price: 0, tip: 0, speed: 0, mult: 1, rows: Object.entries(P.scores).map(([k, v]) => ({ k, v })), free: true, design: P.scores.DESIGN || 0 }; S.served++; boxG.userData.close = 2; sx('cheer'); confetti(V3(CG.position.x, CG.position.y + 0.6, CG.position.z), 50); speak('Ta da! Design ' + (P.scores.DESIGN || 0)); return; }
    const speed = Math.max(0, Math.round(60 - P.elapsed * 0.4)), combo = avg >= 80 ? S.combo + 1 : 0, price = 10 + P.keys.length * 2 + (P.pipe.kind === 'text' ? Math.min(6, Math.ceil(P.pipe.text.length / 3)) : 2) + (P.shape !== 'round' ? 2 : 0), mult = (1 + combo * 0.15) * (upg('radio') ? 1.25 : 1), tipK = { THRILLED: 0.5, HAPPY: 0.3, NEUTRAL: 0.12 }[m[2].replace('!', '')] || 0, tip = Math.round(price * tipK * mult + (m[5] ? speed / 10 : 0));
    S.combo = combo; S.earned += price; S.tips += tip; S.served++; S.starList.push(m[5]); S.scoreList.push(avg);
    const o = S.ord, f = o.f; f.userData.mood = m[4]; f.userData.lineMood = m[4]; f.userData.hop = 1;
    S.react = { t: 0, word: m[2], mood: m[1], col: m[3], stars: m[5], who: CUST[o.ci].name, line: pick(REACT_LINES[m[2].replace('!', '')]), tip, price, avg, speed, mult };
    sx('serveBell'); setTimeout(() => sx(m[5] === 3 ? 'cheer' : m[5] === 2 ? 'happy' : m[5] === 1 ? 'meh' : 'sad'), 350); if (tip + price > 0) setTimeout(() => sx('coins', Math.min(10, 3 + Math.round(tip / 2))), 900); buzz(m[5] >= 2 ? [30, 50, 60] : 80); speak(m[2].replace('!', '') + '. ' + (tip ? 'Tip ' + tip + ' gold' : 'No tip'));
    if (m[5] === 3) { confetti(V3(f.position.x, 2.2, f.position.z), 50); for (let i = 0; i < 10; i++) puff(f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), f.position.z + rr(-0.2, 0.2), 0xf472b6, 1); } }
  function reactDone() { const r = S.react; S.react = null; S.card = { ...r, rows: Object.entries(P.scores).map(([k, v]) => ({ k, v })) }; const o = S.ord; o.st = 'leave'; o.t = 0; o.f.userData.lineMood = null; boxG.visible = false; CG.visible = false; }
  function nextOrder() { if (!S.card) return; sx('whoosh'); const free = S.card.free; S.card = null; CG.visible = true; if (free) { endFree(); return; } S.oi++; if (S.oi >= ordersToday()) endShift(); else startOrder(); }

  // ---------- flow ----------
  function clearAll() { S.baking = false; whisk.visible = spatula.visible = bag.visible = stream.visible = false; S.card = null; S.react = null; [S.ord, ...S.queue].forEach(o => o && (o.f.visible = false)); S.ord = null; S.queue = []; boxG.visible = false; CG.visible = true; CG.userData.move = null; S.jarAnim = null;
    Object.keys(P).forEach(k => delete P[k]); Object.assign(P, freshOrder(1, 0)); P.stages = ['none']; CG.position.copy(AT.board()); CG.rotation.y = 0; S.spin = 0; S.spinOn = false; buildCake(); resetBowl(); pan.visible = true; lineRing.visible = false; K.ovenDoor.userData.open = 0; seatDiners(false); }
  function startShift(free) { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; if (!S.demo && DM.on) demoStop(); audio.init && audio.init(); S.free = free || null; clearAll(); Object.assign(S, { phase: 'glide', t: 0, oi: 0, earned: 0, tips: 0, served: 0, starList: [], scoreList: [], done: null, combo: 0 });
    setUniform(!!save.flag('cakesUniform') || S.demo || !!S.free); ben.visible = false; glideTo(workShot(), 1.4); S.glideT = 1.45; if (!S.free) say('MISS CRUMB: "Mix it, whisk it, pour it, bake it, frost it, pipe it, top it! ' + ordersToday() + ' orders today!"', 5); }
  function endFree() { S.phase = 'intro'; S.free = null; toIntro(); }
  function endShift() { S.phase = 'done'; S.baking = false; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.5, wage = 12 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    if (!S.demo) try { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.made, save.stat(SAVE.made, 0) + S.served); if (avg >= 1.5) { save.setStat(SAVE.day, S.day + 1); newDay = true; unlock.push('DAY ' + (S.day + 1) + ' · NEW FLAVOURS, SHAPES + FROSTINGS'); }
      if (!save.flag('cakesUniform') && S.served >= 3) { save.setFlag('cakesUniform'); unlock.push('FOXY CAKES UNIFORM (toque + towel + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, avg: Math.round(avg * 10) / 10, avgScore: S.scoreList.length ? Math.round(S.scoreList.reduce((a, b) => a + b, 0) / S.scoreList.length) : 0, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) };
    if (newDay) S.day += 1; [S.ord, ...S.queue].forEach(o => { if (o) { o.st = 'leave'; o.t = 0; } }); S.queue = []; ben.visible = true; ben.position.copy(BEN_AT); setUniform(true); glideTo(wideShot(), 1.4); CG.visible = false;
    sx('fanfare', eod); if (eod) confetti(V3(BEN_AT.x, 2.6, BEN_AT.z), 70); speak('Shift over. ' + total + ' gold' + (eod ? '. Employee of the day!' : ''));
    say(eod ? 'MISS CRUMB: "EMPLOYEE OF THE DAY! Everyone\'s talking about your cakes!"' : avg >= 1.5 ? 'MISS CRUMB: "Lovely shift. Same time tomorrow?"' : 'MISS CRUMB: "A sticky one. Tomorrow will be sweeter."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); sx('wrong'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); sx('register'); buzz(40); return true; }
  function toIntro() { S.phase = 'intro'; S.done = null; S.free = null; ben.visible = true; ben.position.copy(BEN_AT); ben.rotation.y = 0.3; setUniform(true); CG.visible = true; seatDiners(false); glideTo(wideShot(), 1); }

  // ---------- WALK: the FOX player strolls the bakery between shifts ----------
  const WK = { stick: { x: 0, y: 0 }, keys: {}, yaw: 0, near: null, drag: null, sp: 0 };
  function seatDiners(on) { const seats = K.seats.slice(0, 2); seats.forEach((s, i) => { const f = custFox[(i * 3 + 1) % custFox.length]; if (!on) { if (!S.ord || S.ord.f !== f) f.visible = false; return; } f.visible = true; f.position.set(s.x, 0.12, s.z); f.rotation.y = s.face; f.userData.mood = 'happy'; f.userData.talking = i === 0; }); }
  function walkStart() { if (S.phase !== 'intro' && S.phase !== 'done') return; if (DM.on) demoStop(); audio.init && audio.init(); clearAll(); S.phase = 'walk'; S.done = null; setUniform(false); ben.visible = true; ben.position.set(K.door.x + 0.4, 0, K.pass.z + 2.0); ben.rotation.y = Math.PI; WK.yaw = 0; camera.position.set(ben.position.x, 3.0, Math.min(K.D / 2 - 0.25, ben.position.z + 2.6)); CAM.look.set(ben.position.x, 1.15, ben.position.z); CAM.from = null; CAM.t = 1; seatDiners(true); flash('WELCOME TO FOXY CAKES', '#f472b6', 1.6); sx('doorbell'); setTimeout(() => sx('talk', 1.35), 600); say('MISS CRUMB: "Come in, come in! Have a look around. The kitchen\'s at the back."', 4.5); }
  function walkStop() { if (S.phase !== 'walk') return; WK.stick.x = WK.stick.y = 0; toIntro(); }
  const SPOTS = () => [{ id: 'work', label: 'BAKE A CAKE', p: V3(K.work.x, 0, K.work.z), r: 1.1 }, { id: 'crumb', label: 'TALK', p: crumb.position, r: 1.3 }, { id: 'case', label: 'LOOK', p: V3(K.case.x, 0, K.pass.z + 0.6), r: 1.0 }, { id: 'oven', label: 'LOOK', p: V3(K.oven.x, 0, K.oven.front + 0.4), r: 0.9 }, { id: 'door', label: 'LEAVE', p: V3(K.door.x, 0, K.door.z - 0.45), r: 0.75 }];
  const CRUMB_LINES = ['Every cake tells a story. Yours just needs frosting.', 'Pipe a border round the edge. Customers adore a border!', 'Pull it out of the oven on time and the rest is easy.', 'The heart cakes sell out every Friday.', 'Try BAKE YOUR OWN on the welcome card and write anything you like!'];
  function walkAct() { if (S.phase !== 'walk' || !WK.near) return; const id = WK.near.id; sx('tap'); buzz(10);
    if (id === 'work') { startShift(); } else if (id === 'crumb') { crumb.userData.talking = true; sx('talk', 1.35); setTimeout(() => crumb.userData.talking = false, 2500); say('MISS CRUMB: "' + pick(CRUMB_LINES) + '"', 4); }
    else if (id === 'case') say('THE CAKE CASE: A pink round with strawberries, a heart with cherries, and a chocolate square with gold stars.', 4.5);
    else if (id === 'oven') say('THE DECK OVEN: 180° and toasty. The bottom deck has a window so you can watch the rise.', 4);
    else if (id === 'door') { flash('BACK TO TOWN', '#f472b6', 1.2); sx('doorbell'); walkStop(); } }
  function walkStep(dt) { const k = WK.keys; let kx = WK.stick.x + ((k.d || k.arrowright) ? 1 : 0) - ((k.a || k.arrowleft) ? 1 : 0), sy = WK.stick.y + ((k.s || k.arrowdown) ? 1 : 0) - ((k.w || k.arrowup) ? 1 : 0); const m = Math.min(1, Math.hypot(kx, sy));
    if (m > 0.08) { const a = Math.atan2(kx, -sy) + WK.yaw, sp = 2.6 * m; const dx = Math.sin(a) * sp * dt, dz = -Math.cos(a) * sp * dt; const tr = Math.atan2(Math.sin(a), -Math.cos(a)); ben.rotation.y = shortAng(ben.rotation.y + shortAng(tr - ben.rotation.y) * Math.min(1, dt * 12)); tryMove(dx, dz); WK.sp = sp; WK.stepD = (WK.stepD || 0) + sp * dt; if (WK.stepD > 0.62) { WK.stepD = 0; sx('step', Math.min(1, m + 0.3)); } } else WK.sp = 0;
    kit.animFox(ben, dt, WK.sp); WK.near = null; let best = 9; for (const s of SPOTS()) { const d = Math.hypot(ben.position.x - s.p.x, ben.position.z - s.p.z); if (d < s.r && d < best) { best = d; WK.near = s; } }
    crumb.userData.lookAt = Math.hypot(ben.position.x - crumb.position.x, ben.position.z - crumb.position.z) < 3 ? ben.position.clone().setY(1.5) : null;
    const port = CW() < CHh(), dist = port ? 5.0 : 4.0, tgt = V3(ben.position.x, 1.5, ben.position.z), off = V3(Math.sin(WK.yaw) * dist, port ? 2.3 : 1.9, Math.cos(WK.yaw) * dist), cp = tgt.clone().add(off); const cx0 = cp.x, cz0 = cp.z; cp.x = clamp(cp.x, -K.W / 2 + 0.25, K.W / 2 - 0.25); cp.z = clamp(cp.z, -K.D / 2 + 0.25, K.D / 2 - 0.25); cp.y = Math.min(cp.y + Math.hypot(cx0 - cp.x, cz0 - cp.z) * 0.6, K.H - 0.3);
    camera.position.lerp(cp, Math.min(1, dt * 5)); CAM.look.lerp(tgt, Math.min(1, dt * 6)); }
  const shortAng = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  function blocked(x, z) { const r = 0.32; if (x < -K.W / 2 + r || x > K.W / 2 - r || z < -K.D / 2 + r || z > K.D / 2 - r) return true; for (const [x0, x1, z0, z1] of K.blocks) if (x > x0 - r && x < x1 + r && z > z0 - r && z < z1 + r) return true; if (Math.hypot(x - crumb.position.x, z - crumb.position.z) < 0.55) return true; return false; }
  function tryMove(dx, dz) { const p = ben.position; if (!blocked(p.x + dx, p.z)) p.x += dx; if (!blocked(p.x, p.z + dz)) p.z += dz; }
  const onKey = (e, v) => { if (S.phase !== 'walk') return; const k = e.key.toLowerCase(); if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) { WK.keys[k] = v; e.preventDefault && e.preventDefault(); } if (v && (k === 'e' || k === ' ' || k === 'enter')) walkAct(); };
  const kd = e => onKey(e, true), ku = e => onKey(e, false); addEventListener('keydown', kd); addEventListener('keyup', ku);

  // ---------- cameras ----------
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 }, { SAFE, shotFor } = cameraFit(ST);
  const wideShot = () => { const z = BEN_AT.z, x = BEN_AT.x, box = [V3(x - 0.55, 0.05, z), V3(x + 0.55, 0.05, z), V3(x - 0.55, 2.25, z), V3(x + 0.55, 2.25, z), V3(x, 3.05, z)]; return CW() < CHh() ? shotFor('wideP2', () => box, 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL2', () => box, 0.12, Math.PI - 0.3, 0.05); };
  const cakeBox = (pad = 0.04, h = 0) => { const c = AT.tt(), r = R * 1.05 + pad; return [V3(c.x - r, c.y + h, c.z - r), V3(c.x + r, c.y + h, c.z + r), V3(c.x - r, c.y + h, c.z + r), V3(c.x + r, c.y + h, c.z - r)]; };
  function workShot() { const st = stage(), port = CW() < CHh();
    if (S.card) return shotFor('card' + (port ? 'P' : 'L'), () => [V3(K.oven.x - 0.8, T, K.oven.z), V3(K.oven.x, T + 1.0, K.oven.z), V3(K.tt.x + 0.5, T, K.tt.z), V3(-2.6, 1.1, K.pass.z), V3(2.6, 1.1, K.pass.z)], 0.32, Math.PI - 0.25, 0.04);
    if (st === 'mix' || st === 'none') { const j0 = K.jars[JARS[0]], j1 = K.jars[JARS[JARS.length - 1]]; return shotFor('mix' + (port ? 'P' : 'L'), () => [V3(j0.x - 0.1, T, j0.z - 0.1), V3(j1.x + 0.1, T + 0.26, j1.z), V3(K.bowl.x - 0.25, T, K.bowl.z + 0.25), V3(K.bowl.x + 0.25, T + 0.18, K.bowl.z + 0.25)], port ? 1.22 : 0.98, 0, 0.04); }
    if (st === 'whisk') return shotFor('whisk' + (port ? 'P' : 'L'), () => { const b = bowlHome; return [V3(b.x - 0.27, T, b.z - 0.27), V3(b.x + 0.27, T + 0.18, b.z + 0.27), V3(b.x - 0.27, T + 0.18, b.z + 0.27), V3(b.x + 0.27, T, b.z - 0.27)]; }, 1.05, 0, 0.06);
    if (st === 'pour') return shotFor('pour' + (port ? 'P' : 'L'), () => { const b = AT.board(); return [V3(b.x - 0.6, T, b.z - 0.25), V3(b.x + 0.25, T, b.z + 0.25), V3(b.x - 0.6, T + 0.55, b.z), V3(b.x + 0.25, T + 0.08, b.z)]; }, 0.5, 0.15, 0.06);
    if (st === 'bake') { const o = K.oven; return shotFor('oven' + (port ? 'P' : 'L'), () => [V3(o.x - 0.72, T, o.front), V3(o.x + 0.72, T, o.front), V3(o.x - 0.72, T + 0.7, o.front), V3(o.x + 0.72, T + 0.7, o.front), V3(o.x, T + 0.1, o.z)], 0.45, Math.PI, 0.05); }
    if (st === 'serve' && !S.react) { const p = AT.pass(), c = K.spots[0]; return shotFor('pass' + (port ? 'P' : 'L'), () => [V3(p.x - 0.3, p.y, p.z - 0.3), V3(p.x + 0.3, p.y + 0.25, p.z + 0.3), V3(c.x, 2.05, c.z), V3(c.x - 0.3, 1.6, c.z)], 0.6, 0, 0.06); }
    return shotFor('cake' + st.slice(0, 4) + (port ? 'P' : 'L'), () => cakeBox(st === 'pipe' ? 0 : 0.03, 0.1), st === 'pipe' ? 1.32 : port ? 1.12 : 1.05, 0, st === 'pipe' ? 0.02 : 0.04); }
  function glideTo(shot, dur = 1.4) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  function lerpCam(sh, k) { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); }
  camera.position.set(-0.6, 2.0, K.pass.z + 4.2); CAM.look.set(0, 1.2, K.pass.z); camera.lookAt(CAM.look);

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = V3();
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  function planeHit(x, y, h) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); plane.constant = -h; return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null; }
  function cakeAt(x, y) { const w = planeHit(x, y, CG.position.y + P.h); if (!w) return null; const l = CG.worldToLocal(w.clone()); return { x: -l.x / R, y: l.z / R, w }; }
  const canWork = () => S.phase === 'shift' && !DM.on && !S.react && !S.card && !CG.userData.move && (S.free || (S.ord && S.ord.st !== 'walk-x'));
  function nearestJar(x, y) { let best = null, bd = Math.min(CW(), CHh()) * 0.11; for (const k of JARS) { const j = K.jars[k], s = scr(V3(j.x, T + 0.14, j.z)), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = k; } } return best; }
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); const { x, y } = local(e);
    if (S.phase === 'walk') { WK.drag = { x, yaw: WK.yaw }; return; }
    if (!canWork()) return; const st = stage();
    if (st === 'mix') { const k = nearestJar(x, y); if (k) { e.preventDefault(); addIng(k); } return; }
    if (st === 'whisk') { const c = scr(V3(bowlHome.x, T + 0.12, bowlHome.z)); e.preventDefault(); P.drag = { kind: 'whisk', a: Math.atan2(y - c.y, x - c.x), c }; return; }
    if (st === 'pour') { e.preventDefault(); P.drag = { kind: 'pour', y0: y }; return; }
    if (st === 'bake') { const o = scr(V3(K.oven.x, T + 0.3, K.oven.front)); if (Math.hypot(o.x - x, o.y - y) < Math.min(CW(), CHh()) * 0.45) { e.preventDefault(); pullOut(); } return; }
    const p = cakeAt(x, y); if (!p) return;
    if (st === 'frost') { e.preventDefault(); P.drag = { kind: 'frost', last: p }; frostAt(p); }
    else if (st === 'pipe') { e.preventDefault(); P.drag = { kind: 'pipe' }; P.strokes.push(P.beads.length); P.pipeLast = null; pipeTo(p, true); }
    else if (st.indexOf('top:') === 0) { const k = st.slice(4); e.preventDefault(); if (TOPPERS[k].scatter) { P.drag = { kind: 'spr' }; scatter(p); } else addTopper(p, k); } }
  function frostAt(p) { if (!inPoly(P.poly, p.x, p.y, -0.08)) { P.frostSpill++; if (P.frostSpill % 4 === 1) { flash('ON THE CAKE!', '#ec3013', 0.6); sx('splat'); buzz(30); } addDrip(p); return; } S.smearT = 0.12; S.smearV = Math.min(1, (S.smearV || 0) * 0.7 + 0.35); const last = P.drag && P.drag.last, ang = last ? Math.atan2(p.y - last.y, p.x - last.x) : 0; frostDab(p.x, p.y, ang + S.spin); if (P.drag) P.drag.last = p; }
  function addDrip(p) { if (dripsG.children.length >= 28 || Math.hypot(p.x, p.y) > 1.6) return; let s = 1; while (s > 0.3 && !inPoly(P.poly, p.x * s, p.y * s)) s -= 0.03; const x = p.x * s, y = p.y * s, len = rr(0.02, 0.05);
    const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, len, 3, 6), toon(FROSTINGS[P.frost].col)); d.position.set(-x * R * 1.03, P.h - len / 2 - 0.004, y * R * 1.03); dripsG.add(d); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.012, 6, 4), toon(FROSTINGS[P.frost].col)); cap.position.set(-x * R * 1.0, P.h, y * R * 1.0); cap.scale.y = 0.5; dripsG.add(cap); }
  function onMove(e) { const { x, y } = local(e);
    if (S.phase === 'walk' && WK.drag) { WK.yaw = WK.drag.yaw - (x - WK.drag.x) / CW() * 4; return; }
    if (!P.drag || !canWork()) return; const st = stage(), d = P.drag;
    if (d.kind === 'whisk') { const a = Math.atan2(y - d.c.y, x - d.c.x); let da = a - d.a; if (da > Math.PI) da -= Math.PI * 2; if (da < -Math.PI) da += Math.PI * 2; d.a = a; const before = Math.floor(P.turns); P.turns += Math.abs(da) / (Math.PI * 2) * (upg('mixer') ? 1.5 : 1); if (Math.floor(P.turns) > before) { sx('turn', Math.floor(P.turns)); buzz(8); } d.sw = (d.sw || 0) + Math.abs(da); if (d.sw > 1.3) { d.sw = 0; sx('swish', Math.min(1.4, 0.6 + Math.abs(da) * 3)); } const w = planeHit(x, y, T + 0.1); if (w) { whisk.visible = true; const b = bowlHome; const dx = w.x - b.x, dz = w.z - b.z, dd = Math.hypot(dx, dz), lim = 0.13; whisk.position.set(b.x + (dd > lim ? dx / dd * lim : dx), T + 0.04, b.z + (dd > lim ? dz / dd * lim : dz)); } if (P.turns > cfg(P.lvl).turns + 3.5 && !d.warned) { d.warned = true; flash('CAREFUL · OVERMIXING', '#ec3013', 0.9); sx('overmix'); buzz([40, 30, 40]); } }
    else if (d.kind === 'pour') P.tilt = clamp((y - d.y0) / (CHh() * 0.22), 0, 1);
    else if (d.kind === 'frost') { const p = cakeAt(x, y); if (p) { frostAt(p); spatula.visible = true; spatula.position.copy(p.w).setY(CG.position.y + P.h + 0.006); spatula.rotation.y = damp(spatula.rotation.y, Math.atan2(p.w.x - CG.position.x, p.w.z - CG.position.z), 8, 0.016); } }
    else if (d.kind === 'pipe') { const p = cakeAt(x, y); if (p) { if (inPoly(P.poly, p.x, p.y, -0.02)) pipeTo(p); bag.visible = true; bag.position.copy(p.w).setY(CG.position.y + P.h + 0.01); } }
    else if (d.kind === 'spr') { const p = cakeAt(x, y); if (p) scatter(p); } }
  function onUp() { if (S.phase === 'walk') { WK.drag = null; return; } const d = P.drag; P.drag = null; if (!d) return; if (d.kind === 'pour') P.tilt = 0; spatula.visible = bag.visible = false; if (d.kind === 'whisk') whisk.visible = false; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- music: the Foxy Cakes waltz while you work, a music-box lullaby on the welcome card and while you walk (cake-audio.js) ----------
  function musicTick() { if (!audio.ctx) return; AU.ready(); const want = S.phase === 'shift' || S.phase === 'glide' || DM.on ? 'shift' : S.phase === 'intro' || S.phase === 'walk' || S.phase === 'done' ? 'lounge' : null; AU.music(OPT.music ? want : null); AU.tick(); }

  // ---------- DEMO: an autopilot bakes one whole heart cake with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, plan: null, planFor: '', made: 0 };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.22); hand.visible = false; hand.renderOrder = 24; scene.add(hand);
  const handTo = p => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.3); };
  const cap = (id, key, text) => { if (DM.seen[id]) return; DM.seen[id] = true; DM.cap = text; DM.key = key; };
  const toW = (x, y) => { const v = V3(-x * R, P.h + 0.01, y * R); return CG.localToWorld(v); };
  function frostPlan() { const out = []; for (let r = 0.86; r > 0.05; r -= 0.13) for (let i = 0; i < 22; i++) { const a = i / 22 * Math.PI * 2; out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * (P.shape === 'heart' ? 0.9 : 1) }); } out.push({ x: 0, y: 0 }); return out.filter(p => inPoly(P.poly, p.x, p.y, 0.02)); }
  function heartPlan() { const out = [], hs = 0.5, yc = P.shape === 'heart' ? 0.16 : 0; for (let i = 0; i <= 90; i++) { const t = i / 90 * Math.PI * 2; out.push({ x: 16 * Math.pow(Math.sin(t), 3) / 17 * hs, y: (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17 * hs + yc + 0.04 }); } return out; }
  function borderPlan() { const out = []; for (let i = 0; i <= P.poly.length; i++) { const p = P.poly[i % P.poly.length]; out.push({ x: p.x * 0.9, y: p.y * 0.9 }); } return out; }
  function topPlan(k) { const n = P.toppers[k], out = []; if (TOPPERS[k].scatter) { for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 0.25 + (i % 5) * 0.12; out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r * 0.9 }); } return out.filter(p => inPoly(P.poly, p.x, p.y, 0.05)); }
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + 0.3; let r = 0.72; while (r > 0.3 && !inPoly(P.poly, Math.cos(a) * r, Math.sin(a) * r, 0.12)) r -= 0.05; out.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); } return out; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.16, hand.scale.x - dt * 0.4));
    if (S.react || S.phase === 'glide') return; if (S.card) { DM.cd -= dt; cap('card', '★', 'Every stage scores 0-100. DESIGN is your piping. The average is the customer\'s mood.'); if (DM.cd <= 0 && !DM.endT) DM.endT = 4; if (DM.endT) { DM.endT -= dt; if (DM.endT <= 0) demoStop(); } return; }
    if (S.phase !== 'shift' || CG.userData.move || S.jarAnim) return; const st = stage(); DM.cd -= dt;
    if (st === 'mix') { cap('mix', '01', 'MIX: tap the jars on the ticket. Flour, sugar, eggs, butter and the flavour.'); if (DM.cd > 0) return; const k = P.recipe.find(r => !P.added.includes(r)); if (k) { const j = K.jars[k]; handTo(V3(j.x, T + 0.3, j.z)); addIng(k); DM.cd = 0.75; } return; }
    if (st === 'whisk') { cap('whisk', '02', 'WHISK: circle your finger round the bowl. 8 turns is smooth. Too many and it\'s tough.'); const tb = Math.floor(P.turns); P.turns += dt * 2.4; if (Math.floor(P.turns) > tb) { sx('turn', Math.floor(P.turns)); sx('swish'); } whisk.visible = true; const a = P.turns * Math.PI * 2; whisk.position.set(bowlHome.x + Math.cos(a) * 0.1, T + 0.04, bowlHome.z + Math.sin(a) * 0.1); if (P.turns >= 9) { whisk.visible = false; stageDone(); DM.cd = 0.6; } return; }
    if (st === 'pour') { cap('pour', '03', 'POUR: press and pull DOWN to tilt the bowl. Let go at the dashed line.'); if (DM.cd > 0) return; P.tilt = P.fill < P.fillTarget - 0.04 ? 0.85 : 0; if (P.fill >= P.fillTarget - 0.04 && P.fill > 0.1) { P.tilt = 0; DM.cd = 0.5; DM.pourDone = (DM.pourDone || 0) + 1; if (DM.pourDone > 1) { DM.pourDone = 0; stageDone(); } } return; }
    if (st === 'bake') { cap('bake', '04', 'BAKE: it rises behind the glass. PULL IT OUT when the marker is in the green.'); if (S.baking && P.cooked >= P.doneTarget) { handTo(V3(K.oven.x, T + 0.3, K.oven.front)); pullOut(); } return; }
    if (st === 'frost') { cap('frost', '05', 'FROST: the turntable spins. Drag the spatula over the top until it\'s all covered.'); if (DM.planFor !== 'frost') { DM.plan = frostPlan(); DM.planFor = 'frost'; P.drag = { kind: 'frost' }; } for (let n = 0; n < 3 && DM.plan.length; n++) { const p = DM.plan.shift(); const lp = { x: p.x, y: p.y }; frostDab(lp.x, lp.y, Math.random() * 6); S.smearT = 0.12; S.smearV = 0.7; spatula.visible = true; spatula.position.copy(toW(p.x, p.y)); } if (!DM.plan.length) { P.drag = null; spatula.visible = false; stageDone(); DM.cd = 0.5; } return; }
    if (st === 'pipe') { cap('pipe', '06', 'PIPE: trace the stencil in the ordered colour. Pipe a border round the edge for a style bonus!'); if (DM.planFor !== 'pipe') { P.pipeCol = P.pipe.col; DM.plan = heartPlan(); DM.plan2 = borderPlan(); DM.planFor = 'pipe'; P.strokes.push(P.beads.length); P.pipeLast = null; DM.first = true; }
      for (let n = 0; n < 3; n++) { if (DM.plan.length) { const p = DM.plan.shift(); pipeTo(p, DM.first); DM.first = false; bag.visible = true; bag.position.copy(toW(p.x, p.y)); } else if (DM.plan2.length) { if (!DM.b2) { DM.b2 = true; P.tip = 'star'; P.pipeCol = 'white'; P.strokes.push(P.beads.length); DM.first = true; } const p = DM.plan2.shift(); pipeTo(p, DM.first); DM.first = false; bag.position.copy(toW(p.x, p.y)); } }
      if (!DM.plan.length && !DM.plan2.length) { bag.visible = false; DM.b2 = false; stageDone(); DM.cd = 0.6; } return; }
    if (st.indexOf('top:') === 0) { const k = st.slice(4); cap('top:' + k, '07', TOPPERS[k].scatter ? 'SPRINKLES: drag to shower them all over.' : 'TOPPERS: tap to place them evenly, off the writing.'); if (DM.planFor !== st) { DM.plan = topPlan(k); DM.planFor = st; } if (DM.cd > 0) return; const p = DM.plan.shift(); if (p) { handTo(toW(p.x, p.y)); if (TOPPERS[k].scatter) scatter(p); else addTopper(p, k); DM.cd = TOPPERS[k].scatter ? 0.08 : 0.35; } else { stageDone(); DM.cd = 0.5; } return; }
    if (st === 'serve') { cap('serve', '08', 'SERVE: box it up and hand it over.'); if (DM.cd > 0) return; if (DM.made === 0) { DM.made = 1; DM.cd = 1.2; return; } serve(); DM.cd = 3; } }
  function demoStart() { if (DM.on) return; audio.init && audio.init(); Object.assign(DM, { on: true, seen: {}, plan: null, planFor: '', made: 0, cd: 1.4, cap: 'WATCH ONE CAKE AT FOXY CAKES', key: '', day0: S.day, endT: 0 }); S.phase = 'intro'; S.done = null; S.demo = true; startShift(); }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; whisk.visible = spatula.visible = bag.visible = false; S.day = DM.day0; S.phase = 'intro'; S.done = null; clearAll(); toIntro(); }

  // ---------- hints ----------
  const RINGS = hintRings(ST); let HINT = null, hintT = 0;
  function nextHint() { if (S.phase !== 'shift' || S.react || S.card || CG.userData.move || (!S.free && !S.ord)) return null; const st = stage();
    if (st === 'mix') { const k = P.recipe.find(r => !P.added.includes(r)); if (!k) return null; const j = K.jars[k]; return { p: V3(j.x, T + 0.27, j.z), r: 0.14, text: 'TAP THE ' + jarInfo(k).name + ' JAR' }; }
    if (st === 'whisk' && P.turns < 1) return { p: V3(bowlHome.x, T + 0.18, bowlHome.z), r: 0.26, text: 'CIRCLE YOUR FINGER IN THE BOWL' };
    if (st === 'pour' && P.fill < 0.05) return { p: V3(K.board.x, T + 0.08, K.board.z), r: 0.22, text: 'PRESS, THEN PULL DOWN TO TILT' };
    return null; }

  // ---------- the frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  function step(dt) { const st = stage(), work = S.phase === 'shift', walk = S.phase === 'walk';
    // camera
    if (walk) walkStep(dt);
    else if (S.react && S.ord) { S.react.t += dt; const f = S.ord.f.position, sh = shotFor('react' + S.ord.spot, () => [V3(f.x - 0.45, 1.25, f.z), V3(f.x + 0.45, 1.25, f.z), V3(f.x, 2.35, f.z), V3(f.x, 1.55, f.z - 0.3)], 0.12, 0.12, 0.1); lerpCam(sh, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.0 : 2.6)) reactDone(); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (work || S.phase === 'glide') lerpCam(workShot(), Math.min(1, dt * 3.2));
    camera.lookAt(CAM.look);
    { const greet = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !greet && !(work || S.phase === 'glide')); K.booths.forEach(m => m.visible = !greet); const hide = walk || ((work || S.phase === 'glide') && st !== 'bake' && (CAM.t > 0.35 || !CAM.from)); K.cut.forEach(m => m.visible = !hide || (walk && !!m.userData.wallItem)); lampGl.forEach(s => s.visible = !hide); }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { S.phase = 'shift'; flash(S.free ? 'BAKE YOUR OWN!' : 'DOORS OPEN!', '#22c55e', 1.2); if (!S.free) sx('doorbell'); startOrder(); } }
    // the cake on the move
    const mv = CG.userData.move; if (mv) { mv.t += dt / mv.dur; const k = Math.min(1, mv.t), e = smooth(0, 1, k); CG.position.lerpVectors(mv.from, mv.to, e); CG.position.y += Math.sin(k * Math.PI) * mv.arc; if (k >= 1) { CG.userData.move = null; mv.done && mv.done(); } }
    // oven door + glow
    { const d = K.ovenDoor, tgt = d.userData.open ? 1.45 : 0; d.rotation.x = damp(d.rotation.x, tgt, 7, dt); const tt = clock.elapsedTime, heat = S.baking ? 1 : 0.35; ovenLight.intensity = 0.4 + heat * 1.8 + Math.sin(tt * 9) * 0.1; K.ovenGlass.material.opacity = 0.16 + heat * 0.12; }
    // turntable
    if (S.spinOn) S.spin += dt * 1.25; else if (S.spin % (Math.PI * 2) > 0.001) { const tgt = Math.ceil(S.spin / (Math.PI * 2)) * Math.PI * 2; S.spin = damp(S.spin, tgt, 6, dt); if (tgt - S.spin < 0.002) S.spin = tgt; }
    K.ttTop.rotation.y = S.spin; if (P.stageIndex >= 4 || st === 'serve') CG.rotation.y = st === 'serve' ? damp(CG.rotation.y, 0, 6, dt) : S.spin;
    // ingredient jars flying to the bowl
    if (S.jarAnim) { const a = S.jarAnim, j = K.jars[a.k].g; a.t += dt / 0.7; const k = Math.min(1, a.t), up = Math.sin(k * Math.PI); const tgt = V3(bowlHome.x - 0.12, T + 0.32, bowlHome.z); j.position.lerpVectors(a.home, tgt, Math.min(1, k * 2.2) * (k < 0.75 ? 1 : (1 - k) * 4)); j.position.y = a.home.y + up * 0.38; j.rotation.z = -Math.sin(Math.min(1, k * 1.6) * Math.PI) * 1.9; if (k > 0.45 && !a.landed) { a.landed = true; landIng(a.k); } if (k >= 1) { j.position.copy(a.home); j.rotation.z = 0; S.jarAnim = null; } }
    // bowl: batter level, swirl and colour while whisking; tilt + stream while pouring
    { const mixK = st === 'mix' ? 0 : Math.min(1, P.turns / cfg(P.lvl).turns || 0), nIn = P.added ? P.added.length : 0, lvl = st === 'mix' || st === 'whisk' ? Math.min(1, nIn / 5) * (0.35 + mixK * 0.65) : P.bowlLevel || 0;
      if (st === 'whisk') P.bowlLevel = lvl; const r = 0.08 + lvl * 0.13; batterDisk.visible = swirl.visible = lvl > 0.02; batterDisk.position.y = swirl.position.y = 0.02 + lvl * 0.12; batterDisk.scale.setScalar(r); swirl.scale.setScalar(r * 0.95); swirl.rotation.z = -(P.turns || 0) * Math.PI * 2; swirl.material.opacity = st === 'whisk' ? 0.9 : 0.3;
      lumps.children.forEach(l => { const s = st === 'mix' ? 1 : Math.max(0, 1 - mixK); l.scale.setScalar(s); l.visible = s > 0.02; });
      const raw = st === 'mix' || st === 'whisk' || st === 'pour';
      if (P.flavor && raw) batterM.color.set(hexMix('#f6ead0', FLAVORS[P.flavor].batter, st === 'mix' ? 0.3 : 0.35 + mixK * 0.65));
      if (raw && P.turns > cfg(P.lvl).turns + 3.5) batterM.color.set(hexMix(FLAVORS[P.flavor].batter, '#8a7a60', Math.min(0.5, (P.turns - cfg(P.lvl).turns - 3.5) * 0.08)));
      const go = BW.userData.go; if (go === 'pour') { BW.position.lerp(V3(K.board.x - 0.42, T + 0.22, K.board.z), Math.min(1, dt * 6)); BW.rotation.z = damp(BW.rotation.z, -(0.25 + P.tilt * 1.15), 10, dt); } else if (go === 'home') { BW.position.lerp(bowlHome, Math.min(1, dt * 5)); BW.rotation.z = damp(BW.rotation.z, 0, 8, dt); }
      // pouring
      if (work && st === 'pour' && !CG.userData.move) { const rate = Math.pow(P.tilt, 1.4) * 0.34; if (rate > 0.01 && P.bowlLevel > 0.02) { P.fill += rate * dt; P.bowlLevel = Math.max(0, P.bowlLevel - rate * dt * 0.9); if (P.fill > 1) { P.spill += dt; P.fill = 1; if (!S.spillT || S.spillT < 0) { flash('IT\'S OVERFLOWING!', '#ec3013', 0.8); S.spillT = 0.8; sx('splash'); buzz(60); } } S.spillT = (S.spillT || 0) - dt;
          const lip = V3(0.24, 0.17, 0).applyMatrix4(BW.matrixWorld), bot = V3(CG.position.x, CG.position.y + 0.005 + P.fill * 0.07, CG.position.z); stream.visible = true; stream.position.copy(lip).lerp(bot, 0.5); const L = lip.distanceTo(bot); stream.scale.set(0.6 + P.tilt * 0.6, L, 0.6 + P.tilt * 0.6); stream.quaternion.setFromUnitVectors(V3(0, 1, 0), lip.clone().sub(bot).normalize()); if (Math.random() < dt * 20) tone(160 + Math.random() * 60, 0.05, 0.008, 'sine'); }
        else stream.visible = false; } else stream.visible = false;
      if (batter.visible) { const hh = st === 'bake' || S.ovenStep === 'out' ? P.fill * 0.07 * 0.85 + P.rise : P.fill * 0.07; batter.scale.y = Math.max(0.0001, hh); } }
    // timers + baking
    if (work && (S.free || S.ord)) {
      S.t += dt; if (!S.card && !S.react) P.elapsed += dt;
      const timed = !S.free && ['mix', 'whisk', 'pour', 'frost', 'pipe'].includes(st) || (!S.free && st.indexOf('top:') === 0);
      if (timed && !mv && !S.react && !S.jarAnim) { P.stageTime -= dt; const sec = Math.ceil(P.stageTime); if (sec <= 3 && sec >= 1 && sec !== S.lastSec) { S.lastSec = sec; sx('tick'); buzz(15); } if (P.stageTime <= 0) { P.stageTime = 0; S.lastSec = 0; flash('TIME!', '#ec3013', 0.9); sx('timeUp'); buzz(120); P.drag = null; stageDone(); } }
      if (S.baking) { P.cooked = Math.min(100, P.cooked + P.bakeSpeed * dt); P.rise = clamp(P.cooked / 55, 0, 1) * 0.055; const k = P.cooked / 100; batterM.color.set(hexMix(FLAVORS[P.flavor].batter, k < 0.62 ? FLAVORS[P.flavor].sponge : '#3a2414', k < 0.62 ? k / 0.62 : (k - 0.62) / 0.38)); if (P.cooked > 75 && Math.random() < dt * 5) puff(K.oven.x + rr(-0.3, 0.3), T + 0.5, K.oven.front, 0x6a6a6a, 1); { const half = P.zoneWidth / 2, inZ = Math.abs(P.cooked - P.doneTarget) <= half; if (inZ && !P.zoneRang) { P.zoneRang = true; sx('zone'); buzz([40, 60, 40]); speak('Now!'); sparkle(V3(K.oven.x, T + 0.4, K.oven.front + 0.05), 6, ['#fff6c0', '#ffd23a']); } if (!inZ && P.zoneRang && P.cooked > P.doneTarget && !P.lateRang) { P.lateRang = true; sx('alarm'); } }
        if (P.cooked >= 100) { flash('BURNT!', '#ec3013', 1.2); sx('alarm'); pullOut(); } }
    }
    // steam over a fresh cake; topper drops; candle flicker
    { const on = CG.visible && body && body.visible && (st === 'frost'); steamS.forEach((s, i) => { s.visible = on; if (!on) return; const k = (clock.elapsedTime * 0.45 + i / 3) % 1; s.position.set(CG.position.x + (i - 1) * 0.08, CG.position.y + P.h + 0.05 + k * 0.35, CG.position.z); s.material.opacity = 0.3 * Math.sin(k * Math.PI); s.scale.setScalar(0.1 + k * 0.18); }); }
    for (const m of toppersG.children) { if (m.userData.drop != null && m.userData.drop < 1) { const d = m.userData.drop = Math.min(1, m.userData.drop + dt / 0.22), e = 1 - Math.pow(1 - d, 3); m.position.y = P.h + (1 - e) * 0.12; m.scale.setScalar(d < 1 ? 1 + Math.sin(d * Math.PI) * 0.18 : 1); if (d >= 1) { const w = m.getWorldPosition(V3()); sparkle(w, 3, ['#ffffff', '#fff6c0'], 0.03); } } if (m.userData.flame) m.userData.flame.scale.set(0.8, 1.4 + Math.sin(clock.elapsedTime * 17 + m.id) * 0.3, 0.8); }
    if (boxG.visible) { const c = boxG.userData.close, lid = boxG.userData.lid, fr = boxG.userData.front; fr.rotation.x = damp(fr.rotation.x, c ? 0 : 1.5, 7, dt); lid.rotation.x = damp(lid.rotation.x, c === 1 ? 0 : -1.9, 6, dt); }
    // customers
    if (!walk) { const all = [S.ord, ...S.queue].filter(o => o && o.st !== 'gone'); for (const o of [...all, ...(S.leaving || [])]) { const sp = K.spots[o.spot]; o.t = (o.t || 0) + dt; kit.animFox && kit.animFox(o.f, dt, o.st === 'walk' || o.st === 'leave' ? 2 : 0);
      if (o.st === 'walk') { o.f.position.x = damp(o.f.position.x, sp.x, 2.4, dt); o.f.position.z = damp(o.f.position.z, sp.z, 2.4, dt); o.f.rotation.y = Math.PI; if (Math.hypot(o.f.position.x - sp.x, o.f.position.z - sp.z) < 0.08) { o.st = 'wait'; if (o === S.ord) { say(CUST[o.ci].name + ': "' + pick(ORDER_LINES) + ' ' + (P.pipe.kind === 'heart' ? 'A heart on top, please!' : 'Could it say ' + P.pipe.text + '?') + '"', 3.8); sx('talk', 0.9 + (o.ci % 4) * 0.12); } } }
      else if (o.st === 'leave') { o.f.rotation.y = 0; o.f.position.z += dt * 2.2; if (o.t > 2.6) { o.f.visible = false; o.gone = true; } } }
      if (S.ord && S.ord.st === 'leave') { (S.leaving = S.leaving || []).push(S.ord); S.ord = { ...S.ord, st: 'gone', f: S.ord.f }; } if (S.leaving) S.leaving = S.leaving.filter(o => !o.gone); }
    else K.seats.slice(0, 2).forEach((s, i) => kit.animFox(custFox[(i * 3 + 1) % custFox.length], dt, 0));
    // Ben waves on the welcome + day cards; Miss Crumb potters about
    if (!walk) { const greet = S.phase === 'intro' || S.phase === 'done'; ben.rotation.y = damp(ben.rotation.y, 0.3, 4, dt); ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox(ben, dt, 0);
      if (greet && BP.arms && BP.arms[0]) { const w = performance.now() / 1000; BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(w * 7) * 0.32); } crumb.userData.lookAt = null; }
    { const shiftish = S.phase === 'shift' || S.phase === 'glide', cx = shiftish ? K.W / 2 - 1.6 : K.keeper.x, cz = shiftish ? K.z + 0.78 : K.keeper.z; if (Math.hypot(crumb.position.x - cx, crumb.position.z - cz) > 0.05) { crumb.position.x = cx; crumb.position.z = cz; } }
    crumb.rotation.y = damp(crumb.rotation.y, S.phase === 'shift' ? 0.2 : walk && crumb.userData.lookAt ? Math.atan2(ben.position.x - crumb.position.x, ben.position.z - crumb.position.z) : K.keeper.face, 4, dt); kit.animFox(crumb, dt, 0);
    lampGl.forEach((s, i) => s.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 2 + i) * 0.04);
    // sound loops: oven hum (rises with the bake), the pouring stream, the spatula, the piping bag, the room
    if (audio.ctx) { lset('oven', S.baking ? 1 : 0, (P.cooked || 0) / 100); lset('pour', stream.visible ? 0.4 + P.tilt * 0.6 : 0, P.tilt || 0);
      S.smearT = (S.smearT || 0) - dt; S.smearV = (S.smearV || 0) * Math.pow(0.02, dt); lset('smear', S.smearT > 0 ? 0.5 + S.smearV * 0.5 : 0, S.smearV);
      S.pipeT = (S.pipeT || 0) - dt; lset('squeeze', S.pipeT > 0 ? 1 : 0, 0); lset('room', walk || S.phase === 'intro' || S.phase === 'done' ? 1 : work ? 0.4 : 0, 0); }
    // oven elements glow while baking
    { const heat = S.baking ? 1 : 0; ovenEls.forEach(m => m.material.color.setRGB(0.35 + heat * 0.65, 0.12 + heat * 0.25, 0.06)); ovenGlow.material.opacity = damp(ovenGlow.material.opacity, heat * (0.55 + Math.sin(clock.elapsedTime * 7) * 0.05), 4, dt); }
    // sparkles + confetti
    for (const q of SPK) { if (q.life <= 0) { q.s.visible = false; continue; } q.life -= dt * 1.4; q.s.position.addScaledVector(q.v, dt); q.v.y -= dt * 0.4; const k = Math.sin(Math.max(0, q.life) * Math.PI); q.s.scale.setScalar(q.sz * (0.4 + k)); q.s.material.opacity = k; q.s.material.rotation += dt * 3; }
    for (const q of CONF) { if (q.life <= 0) { q.m.visible = false; continue; } q.life -= dt * 0.35; q.v.y -= dt * 4.5; q.v.multiplyScalar(Math.pow(0.35, dt)); q.m.position.addScaledVector(q.v, dt); q.m.rotation.x += q.w.x * dt; q.m.rotation.y += q.w.y * dt; q.m.rotation.z += q.w.z * dt; if (q.m.position.y < 0.02) { q.m.position.y = 0.02; q.v.set(0, 0, 0); q.w.multiplyScalar(0.9); } }
    if (DM.on) demoStep(dt);
    hintT += dt; HINT = nextHint(); RINGS.place(HINT && !DM.on ? HINT : null, hintT, dt);
    if (topDirty) drawTop(); musicTick(); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.08; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- HUD state for the page ----------
  const STAGE_TXT = { mix: ['TAP THE JARS', 'Tap each ingredient on the ticket into the bowl.'], whisk: ['CIRCLE TO WHISK', 'Circle your finger round the bowl. Stop when it\'s smooth.'], pour: ['PULL DOWN TO POUR', 'Press and drag down to tilt. Let go at the dashed line.'], bake: ['WATCH IT RISE', 'Pull it out when the marker is in the green.'], frost: ['DRAG TO FROST', 'The turntable spins. Cover the whole top.'], pipe: ['PIPE THE DESIGN', 'Trace the stencil. A border round the edge earns a bonus.'], serve: ['BOX IT + SERVE', 'Hand it over.'] };
  const SHORT = s => s.indexOf('top:') === 0 ? TOPPERS[s.slice(4)].short : { mix: 'MIX', whisk: 'WHISK', pour: 'POUR', bake: 'BAKE', frost: 'FROST', pipe: 'PIPE', serve: 'SERVE' }[s] || '';
  function hud() { const st = stage(), isTop = st.indexOf('top:') === 0, tk = isTop ? st.slice(4) : null, live = S.phase === 'shift' && (S.free || S.ord) && P.stages && P.stages[0] !== 'none';
    let label = '', hint = ''; if (isTop) { label = TOPPERS[tk].scatter ? 'SHOWER THE SPRINKLES' : P.toppers[tk] + ' ' + TOPPERS[tk].name; hint = TOPPERS[tk].scatter ? 'Drag over the cake. Spread them everywhere.' : 'Tap to place. Space them round the cake, off the writing.'; } else if (STAGE_TXT[st]) [label, hint] = STAGE_TXT[st];
    if (st === 'pipe') label = P.pipe.kind === 'heart' ? 'PIPE A HEART' : 'PIPE "' + P.pipe.text + '"';
    const timed = !S.free && (['mix', 'whisk', 'pour', 'frost', 'pipe'].includes(st) || isTop), pc = PIPES.find(p => p.id === (P.pipe || {}).col) || PIPES[0];
    let status = ''; if (st === 'mix') status = (P.added || []).filter(k => P.recipe.includes(k)).length + ' OF ' + P.recipe.length + ' IN THE BOWL' + (P.wrong ? ' · ' + P.wrong + ' WRONG' : '');
    else if (st === 'whisk') status = (P.turns || 0).toFixed(1) + ' TURNS · ' + (P.turns < cfg(P.lvl).turns ? 'LUMPY' : P.turns <= cfg(P.lvl).turns + 3.5 ? 'SMOOTH!' : 'OVERMIXED');
    else if (st === 'pour') status = 'FILLED ' + Math.round(P.fill / P.fillTarget * 100) + '% OF THE LINE'; else if (st === 'bake') status = 'ORDERED ' + doneName(P.doneTarget) + ' · NOW ' + doneName(P.cooked);
    else if (st === 'frost') status = Math.round(P.frostCells.reduce((a, b, i) => a + (b && P.shapeCells[i] ? 1 : 0), 0) / Math.max(1, P.shapeN) * 100) + '% COVERED'; else if (st === 'pipe') status = 'ORDERED ' + pc.name + ' · ' + P.beads.length + ' DROPS PIPED';
    else if (isTop) status = TOPPERS[tk].scatter ? P.spr.length + ' SPRINKLES' : P.tops.filter(t => t.key === tk).length + ' OF ' + P.toppers[tk] + ' PLACED'; else if (live && S.ord) status = CUST[P.ci].name + ' IS WAITING';
    const vals = Object.values(P.scores || {}), avgNow = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0, md = moodOf(avgNow);
    const half = (P.zoneWidth || 0) / 2, z0 = Math.max(0, (P.doneTarget || 0) - half), z1 = Math.min(100, (P.doneTarget || 0) + half);
    const who = S.free ? 'YOU' : live ? CUST[P.ci].name : '';
    return { phase: S.phase, day: S.day, orderNo: Math.min(S.oi + 1, ordersToday()), orders: ordersToday(), earned: S.earned, tips: S.tips, served: S.served, combo: S.combo, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, gold: save.data.gold, free: !!S.free,
      ticket: live ? { who, pie: FLAVORS[P.flavor].name + ' · ' + P.shape.toUpperCase(), size: P.shape.toUpperCase(), done: doneName(P.doneTarget) + ' (' + P.doneTarget + '%)', frost: FROSTINGS[P.frost].name, msg: P.pipe.kind === 'heart' ? 'A HEART' : '"' + P.pipe.text + '"', msgCol: pc.col, msgColName: pc.name,
        reqs: [{ name: 'RECIPE ' + P.recipe.map(k => jarInfo(k).name).join(' · '), tally: '', col: FLAVORS[P.flavor].batter, state: P.stageIndex > 0 ? 'done' : st === 'mix' ? 'now' : 'todo' }, { name: FROSTINGS[P.frost].name + ' FROSTING', tally: '', col: FROSTINGS[P.frost].col, state: P.stageIndex > 4 ? 'done' : st === 'frost' ? 'now' : 'todo' },
          { name: (P.pipe.kind === 'heart' ? 'A HEART' : '"' + P.pipe.text + '"') + ' IN ' + pc.name, tally: '', col: pc.col, state: P.stageIndex > 5 ? 'done' : st === 'pipe' ? 'now' : 'todo' },
          ...P.keys.map(k => { const got = TOPPERS[k].scatter ? P.spr.length : P.tops.filter(t => t.key === k).length, passed = P.stages.indexOf('top:' + k) < P.stageIndex; return { name: TOPPERS[k].scatter ? 'SPRINKLES' : P.toppers[k] + ' ' + TOPPERS[k].name, tally: TOPPERS[k].scatter ? '' : got + '/' + P.toppers[k], col: TOPPERS[k].col, state: passed ? 'done' : tk === k ? 'now' : 'todo' }; })] } : null,
      stage: live ? { id: isTop ? 'top' : st, n: P.stageIndex + 1, of: P.stages.length, label, hint, timed, left: Math.ceil(P.stageTime), frac: timed ? Math.max(0, P.stageTime / Math.max(1, stageTime(st))) : 0, urgent: timed && P.stageTime <= 3,
        canDone: ['mix', 'whisk', 'pour', 'frost', 'pipe'].includes(st) || isTop ? !S.react && !CG.userData.move && !(st === 'pour' && P.fill < 0.05) : false,
        doneLabel: st === 'mix' ? 'MIX DONE' : st === 'whisk' ? 'WHISK DONE' : st === 'pour' ? 'POUR DONE' : st === 'frost' ? 'FROST DONE' : st === 'pipe' ? 'DESIGN DONE' : isTop ? TOPPERS[tk].short + ' DONE' : '',
        jars: st === 'mix' ? JARS.map(k => ({ k, name: jarInfo(k).name, col: jarInfo(k).jar, lid: jarInfo(k).lid, added: (P.added || []).includes(k), next: !DM.on && k === P.recipe.find(r => !P.added.includes(r)) })) : null,
        turns: st === 'whisk' ? (P.turns || 0).toFixed(1) : null, status, mood: md[1], moodCol: md[3], avgNow,
        pipe: st === 'pipe' ? { col: P.pipeCol, tip: P.tip, want: P.pipe.col, canUndo: P.strokes.length > 0, swatches: PIPES.map(p => ({ id: p.id, col: p.col, name: p.name, on: p.id === P.pipeCol, want: p.id === P.pipe.col })) } : null,
        strip: P.stages.map((s, i) => ({ t: SHORT(s), state: i < P.stageIndex ? 'done' : i === P.stageIndex ? 'now' : 'todo' })) } : null,
      bake: live && st === 'bake' ? { on: S.baking, d: P.cooked / 100, now: doneName(P.cooked), want: doneName(P.doneTarget), pct: Math.round(P.cooked), zones: [{ w: z0, col: '#5a5650', want: false }, { w: z1 - z0, col: '#22c55e', want: true }, { w: 100 - z1, col: '#ec3013', want: false }], inZone: P.cooked >= z0 && P.cooked <= z1 } : null,
      serveBtn: live && st === 'serve' && !S.react && !S.card && !CG.userData.move ? (S.free ? 'SEE MY CAKE' : 'SERVE ' + CUST[P.ci].name) : '',
      react: S.react ? { word: S.react.word, col: S.react.col, who: S.react.who, line: S.react.line, stars: S.react.stars, tip: S.react.tip } : null,
      card: S.card ? { word: S.card.word, mood: S.card.mood, col: S.card.col, who: S.card.who, avg: S.card.avg, price: S.card.price, tip: S.card.tip, speed: S.card.speed, mult: S.card.mult.toFixed(2), stars: S.card.stars, rows: S.card.rows, last: S.free || S.oi + 1 >= ordersToday(), free: !!S.card.free, design: S.card.free ? S.card.design : (S.card.rows.find(r => r.k === 'DESIGN') || { v: 0 }).v } : null,
      flash: S.flash, say: S.say, done: S.done, uniform: !!save.flag('cakesUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), music: !!OPT.music, opts: { ...OPT },
      walk: S.phase === 'walk' ? { act: WK.near ? WK.near.label : '', near: WK.near ? WK.near.id : '' } : null,
      demo: DM.on ? { cap: DM.cap, key: DM.key } : null, hint: HINT && !DM.on ? HINT.text : '' }; }
  function emit() { onState(hud()); }
  clearAll(); frame();
  return { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    startShift: () => startShift(), startFree: (o = {}) => { const text = String(o.text || '').toUpperCase().replace(/[^A-Z0-9 !?&'.,]/g, '').trim().slice(0, 18); startShift({ text: text || 'HAPPY BIRTHDAY', heart: !!o.heart, flavor: o.flavor || 'vanilla', shape: o.shape || 'round', frost: o.frost || 'pink', col: o.col || 'blue', topper: o.topper || 'strawberry' }); },
    demoStart, demoStop, toIntro, buyUpgrade, hud, nextOrder, serve, pullOut, undo: undoStroke, addIng: k => { if (canWork()) addIng(k); },
    stageDone: () => { if (canWork()) { const st = stage(); if (['mix', 'whisk', 'pour', 'frost', 'pipe'].includes(st) || st.indexOf('top:') === 0) { P.drag = null; stageDone(); } } },
    setPipeColor(id) { if (PIPES.find(p => p.id === id)) { P.pipeCol = id; sx('tap'); buzz(8); } }, setTip(t) { P.tip = t === 'star' ? 'star' : 'round'; sx('tap'); buzz(8); },
    walkStart, walkStop, walkAct, setStick(x, y) { WK.stick.x = clamp(x, -1, 1); WK.stick.y = clamp(y, -1, 1); }, turnView(d = 1) { WK.yaw += d * Math.PI / 4; },
    toggleMusic() { audio.init && audio.init(); setOpt('music', !OPT.music); }, setOpt(k, v) { audio.init && audio.init(); setOpt(k, v); }, setPaused(v) { PAUSE = !!v; }, K,
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _state: () => ({ S, P, DM, WK }),
    _auto() { return { addIng, stageDone, pullOut, serve, nextOrder, frostDab, pipeTo, beadAdd, addTopper, scatter, pipeScore, topperScore, cakeAt, scr, toW, heartPlan, borderPlan, frostPlan, topPlan, walkStep }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', kd); removeEventListener('keyup', ku); document.removeEventListener('visibilitychange', onVis); Object.values(LP).forEach(L => L.stop()); AU.music(null); try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
