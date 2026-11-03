// 8 GATES — GAYA · OPA'S CANDLE WORKS: THE SHIFT [gayaCandleWorks]. Ben works a shift making the Temple of Gaya's candles for Keeper Opa.
// WALK: before and between shifts Ben walks the works with the standard Game HUD (joystick, 1/2/3, TALK near Opa). Tap a wall sconce or a
//   display candle to light or snuff it. TALK to Keeper Opa (or the welcome card) → PUT ME TO WORK.
// SHIFT (3 minutes): Gaya church folk order candles at the pickup counter. Stations:
//   DIP    · tap a wax vat to pick the colour, then tap (or swipe down and up) to dip the taper pair. Each dip adds a layer.
//            Wait for the glow to fade before dipping again (too hot = the layer slides off), don't hold it under (melts a layer). 6 layers = perfect. CUT ▸ BENCH.
//   POUR   · tap PILLAR or JAR moulds, tap a wax pot, HOLD the mould to pour and let go at the gold line. It sets, then tap to unmould.
//   FINISH · swipe across the wicks to trim, tap a candle to stamp the Gaya crest.
//   PACK   · drag a finished candle (or tap it, then tap the crate) into the customer's crate. A full crate goes home with them.
// Pay = wage + prices + tips in gold. EMPLOYEE OF THE DAY, the TEMPLE APRON uniform, upgrades. Save keys gaya.candles.*, flag gayaCandleUniform.
// MERGE: buildCandleWorks(ctx) builds the interior at ctx.origin from a Meru-style ctx ({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin })
// and returns K (colliders, door, spawn, Opa's spot, sconces) so ANY world building can use it as its interior (quick fade in).
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { createCandleAudio } from './candle-audio.js';

export const CANDLES = { name: 'TEMPLE CANDLES · THE SHIFT', room: 'gayaCandleWorks', shift: 180 };
export const WAX = {
  white: { name: 'WHITE', col: '#f4eedf', day: 1 }, gold: { name: 'GOLD', col: '#e9b43c', day: 2 },
  rose: { name: 'ROSE', col: '#ec8fab', day: 3 }, blue: { name: 'GATE BLUE', col: '#5fa8e4', day: 4 } };
export const KINDS = {
  taper: { name: 'TAPERS', one: 'TAPER PAIR', price: 4, day: 1, station: 'dip' },
  pillar: { name: 'PILLAR', one: 'PILLAR', price: 6, day: 1, station: 'pour' },
  jar: { name: 'JAR', one: 'JAR', price: 7, day: 2, station: 'pour' } };
export const UPGRADES = [
  { id: 'fan', name: 'COOLING FAN', cost: 35, line: 'Wax sets a third faster: dip sooner, unmould sooner.' },
  { id: 'ladle', name: 'BIG LADLE', cost: 30, line: 'Pour twice as fast.' },
  { id: 'shears', name: 'TEMPLE SHEARS', cost: 40, line: 'One swipe trims every wick on the bench.' },
  { id: 'stamp', name: 'BRASS STAMP', cost: 45, line: 'One tap stamps every trimmed candle.' },
  { id: 'choir', name: 'TEMPLE CHOIR', cost: 60, line: 'Customers wait 20% longer.' }];
const TARGET = 6; // perfect taper layers
const CUSTOMERS = [
  { name: 'VESPER', role: 'High Priest', torso: ['#f6f1e4', '#d9a93a', '#5b3d7a'], outfit: 'robe' }, { name: 'QUILL', role: 'Reader', torso: ['#5b3d7a', '#e8dff5', '#2e1d44'], outfit: 'robe' },
  { name: 'EMBER', role: 'Acolyte', torso: ['#c2412d', '#f6e3c8', '#6a1d12'], outfit: 'robe' }, { name: 'ASH', role: 'Novice', torso: ['#e7e3dc', '#9a948c', '#4a4640'], outfit: 'robe' },
  { name: 'RILL', role: 'Priest of the water', torso: ['#3a8fc4', '#e0f2fe', '#0b3a52'], outfit: 'robe' }, { name: 'LET', role: 'Warden of the Gate', torso: ['#ffffff', '#e7edf4', '#6b7d93'], outfit: 'armor' },
  { name: 'GRANT', role: 'Steward of Gaya', torso: ['#7a1d5a', '#d9a93a', '#3a0d2a'], outfit: 'royal' }, { name: 'PLUM', role: 'Town Square', torso: ['#8e4a9c', '#f3e6f7', '#4a1f55'], outfit: 'vest' },
  { name: 'IRIS', role: 'Town Square', torso: ['#7c6fd8', '#ede9fe', '#3b2f8a'], outfit: 'dress' }, { name: 'BROTHER CINNABAR', role: 'Church', torso: ['#b5371f', '#f6e3c8', '#5a1a0e'], outfit: 'robe' },
  { name: 'SISTER DAMSON', role: 'Church', torso: ['#4a2a5e', '#e8dff5', '#22132e'], outfit: 'robe' }, { name: 'SORREL', role: 'Tavern', torso: ['#a8692e', '#f6e3c8', '#4a2a10'], outfit: 'vest' }];
const LINES = { order: ['For the evening vespers.', 'The altar is running low.', 'Light for the Gate, please.', 'Opa says you are quick.', 'The nave is dark without these.', 'For the shrine, please.'],
  thrilled: ['They will burn for days!', 'Gaya shines tonight.', 'Perfect wicks. Perfect crest.', 'The altar will glow!'], happy: ['Lovely work.', 'Just what we needed.', 'Thank you, Ben.'],
  okay: ['They will do.', 'A little lumpy, but they will burn.'], grumpy: ['Not quite what I hoped for.', 'Hm. Opa makes them smoother.'], angry: ['The vespers start without me.', 'Too slow. I will pray in the dark.'] };
const OPA_SAY = ['Steady hands, slow hearts.', 'Let the glow fade before you dip again.', 'A short wick is a calm flame.', 'Every Temple candle wears the crest.', 'Pour to the gold line, never past it.', 'The Gate is watching. No pressure.'];
const SAVE = { day: 'gaya.candles.day', best: 'gaya.candles.best', upg: 'gaya.candles.upg.' };
const REACT = { thrilled: { word: 'THRILLED', col: '#22c55e', mood: 'excited' }, happy: { word: 'HAPPY', col: '#ffd23a', mood: 'happy' }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral' }, grumpy: { word: 'GRUMPY', col: '#ec3013', mood: 'angry' } };
export const itemName = (kind, col) => WAX[col].name + ' ' + KINDS[kind].one;

// ---------------- the interior (stand-alone page and any world building) ----------------
export function buildCandleWorks(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 16, D = 14, H = 5.2, KZ = -3.2, PZ = -0.6, T = 1.0;
  const plaster = '#efe4cf', violet = toon('#5b3d7a'), gold = toon('#d9a93a'), wood = toon('#7a4e2c'), darkWood = toon('#4a2e1a'), stone = toon('#b9ab93'), iron = toon('#3a3836'), cream = toon('#f6f1e4');
  const K = { root, KZ, PZ, top: T, W, D, H, back: [], colliders: [], flames: [], sconces: [] };
  // floor: warm stone flags
  const floorT = CTX(256, 256, c => { c.fillStyle = '#8f8270'; c.fillRect(0, 0, 256, 256); const cols = ['#d6c8ad', '#cbbd9f', '#dccfb6', '#c4b597']; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = cols[(x * 3 + y * 5) % 4]; c.fillRect(x * 64 + (y % 2) * 32 + 3, y * 64 + 3, 58, 58); c.fillRect((x * 64 + (y % 2) * 32 + 3) - 256, y * 64 + 3, 58, 58); } });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2.4, D / 2.4);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  // walls: plaster over a violet wainscot with a gold rail
  const wallT = CTX(256, 256, c => { c.fillStyle = plaster; c.fillRect(0, 0, 256, 256); c.fillStyle = '#e6d8bd'; for (let i = 0; i < 40; i++) c.fillRect((i * 97) % 256, (i * 53) % 150, 18, 3); c.fillStyle = '#5b3d7a'; c.fillRect(0, 168, 256, 88); c.fillStyle = '#d9a93a'; c.fillRect(0, 160, 256, 8); c.fillStyle = '#4a2f66'; for (let i = 0; i < 256; i += 64) c.fillRect(i, 176, 3, 80); });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(5, 1); const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad });
  const wall = (x, z, w, ry) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); return m; };
  K.back.push(wall(0, -D / 2, W, 0)); wall(-W / 2, 0, D, Math.PI / 2); wall(W / 2, 0, D, -Math.PI / 2); wall(0, D / 2, W, Math.PI);
  const ceil = M(new T3.BoxGeometry(W, 0.2, D), toon('#e8dcc4'), 0, H + 0.1, 0, root, 0); K.back.push(ceil);
  for (let i = -3; i <= 3; i++) K.back.push(M(new T3.BoxGeometry(0.22, 0.26, D), darkWood, i * 2.2, H - 0.13, 0, root, 0.01));
  // back wall: three tall arched violet windows + drying racks of tapers
  const winT = CTX(128, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#c9b6f0'); g.addColorStop(1, '#f7e2b8'); c.fillStyle = g; c.fillRect(0, 0, 128, 256); c.strokeStyle = '#3a2350'; c.lineWidth = 6; c.strokeRect(0, 0, 128, 256); c.beginPath(); c.moveTo(64, 0); c.lineTo(64, 256); c.moveTo(0, 128); c.lineTo(128, 128); c.stroke(); });
  for (const x of [-4.8, 0, 4.8]) { const w = new T3.Mesh(new T3.PlaneGeometry(1.5, 2.7), new T3.MeshBasicMaterial({ map: winT })); w.position.set(x, 3.0, -D / 2 + 0.03); root.add(w); K.back.push(w); const a = new T3.Mesh(new T3.CircleGeometry(0.75, 20, 0, Math.PI), new T3.MeshBasicMaterial({ color: 0xc9b6f0 })); a.position.set(x, 4.35, -D / 2 + 0.03); root.add(a); K.back.push(a); K.back.push(M(new T3.BoxGeometry(1.7, 0.1, 0.12), gold, x, 1.62, -D / 2 + 0.06, root, 0.01)); }
  for (const x of [-2.4, 2.4]) { const g = new T3.Group(); g.position.set(x, 0, -D / 2 + 0.5); root.add(g); K.back.push(g); M(new T3.BoxGeometry(1.8, 0.08, 0.08), darkWood, 0, 2.6, 0, g, 0.01); M(new T3.BoxGeometry(0.08, 2.6, 0.08), darkWood, -0.9, 1.3, 0, g, 0.01); M(new T3.BoxGeometry(0.08, 2.6, 0.08), darkWood, 0.9, 1.3, 0, g, 0.01); const cs = ['#f4eedf', '#e9b43c', '#ec8fab', '#5fa8e4']; for (let i = 0; i < 8; i++) { const t = M(new T3.CylinderGeometry(0.035, 0.05, 0.62, 8), toon(cs[i % 4]), -0.74 + i * 0.21, 2.22, 0, g, 0.008); t.castShadow = false; } }
  // WORK COUNTER (long, back): stone top, wood body
  const CX0 = -4.0, CX1 = 6.2, cw = CX1 - CX0, ccx = (CX0 + CX1) / 2;
  M(new T3.BoxGeometry(cw, T - 0.06, 1.3), wood, ccx, (T - 0.06) / 2, KZ, root, 0.03); M(new T3.BoxGeometry(cw + 0.1, 0.08, 1.38), stone, ccx, T - 0.02, KZ, root, 0.015);
  M(new T3.BoxGeometry(cw + 0.12, 0.08, 0.06), gold, ccx, T - 0.16, KZ + 0.7, root, 0); K.colliders.push([CX0 - 0.1, CX1 + 0.1, KZ - 0.72, KZ + 0.72]);
  // DIP: four sunk vats + a gantry with the taper rack
  K.vats = {}; ['white', 'gold', 'rose', 'blue'].forEach((k, i) => { const x = 5.35 - i * 0.6, z = KZ;
    M(new T3.CylinderGeometry(0.27, 0.27, 0.1, 22), iron, x, T + 0.03, z, root, 0.012, 0.27); const wax = new T3.Mesh(new T3.CircleGeometry(0.235, 22), new T3.MeshToonMaterial({ color: WAX[k].col, gradientMap: ctx.grad, emissive: WAX[k].col, emissiveIntensity: 0.25 })); wax.rotation.x = -Math.PI / 2; wax.position.set(x, T + 0.085, z); root.add(wax);
    K.vats[k] = { x, z, y: T + 0.085, wax }; });
  K.gantry = { x0: 2.85, x1: 5.95, y: 2.45, z: KZ }; for (const x of [K.gantry.x0, K.gantry.x1]) M(new T3.BoxGeometry(0.1, 2.45 - T, 0.1), darkWood, x, (2.45 + T) / 2, KZ + 0.45, root, 0.01);
  M(new T3.BoxGeometry(K.gantry.x1 - K.gantry.x0 + 0.2, 0.1, 0.1), darkWood, (K.gantry.x0 + K.gantry.x1) / 2, 2.48, KZ + 0.45, root, 0.01); M(new T3.BoxGeometry(K.gantry.x1 - K.gantry.x0, 0.05, 0.5), darkWood, (K.gantry.x0 + K.gantry.x1) / 2, 2.52, KZ + 0.2, root, 0.008);
  // POUR: mould stacks, four wax pots on a warmer, two pour spots
  K.moulds = { pillar: { x: 2.35, z: KZ - 0.32 }, jar: { x: 2.35, z: KZ + 0.3 } };
  M(new T3.BoxGeometry(0.5, 0.05, 1.1), darkWood, 2.35, T + 0.025, KZ, root, 0.008);
  for (let i = 0; i < 3; i++) { M(new T3.CylinderGeometry(0.1, 0.1, 0.22, 14), toon('#a9b3bd'), -2.35 + (i - 1) * 0.0, T + 0.16 + i * 0.0, KZ - 0.32 + (i - 1) * 0.0, root, 0.008, 0.1).position.set(2.28 + i * 0.07, T + 0.16 + i * 0.015, KZ - 0.32 + (i % 2) * 0.04); }
  for (let i = 0; i < 3; i++) { const j = new T3.Mesh(new T3.CylinderGeometry(0.1, 0.09, 0.18, 14, 1, true), new T3.MeshToonMaterial({ color: '#cfe9ef', gradientMap: ctx.grad, transparent: true, opacity: 0.75, side: T3.DoubleSide })); j.position.set(2.28 + i * 0.07, T + 0.14 + i * 0.012, KZ + 0.3 + (i % 2) * 0.04); root.add(j); }
  K.warmer = M(new T3.BoxGeometry(1.75, 0.06, 0.46), iron, 1.15, T + 0.03, KZ + 0.33, root, 0.01);
  K.pots = {}; ['white', 'gold', 'rose', 'blue'].forEach((k, i) => { const x = 1.8 - i * 0.43, z = KZ + 0.33, g = new T3.Group(); g.position.set(x, T + 0.06, z); root.add(g);
    M(new T3.CylinderGeometry(0.12, 0.1, 0.22, 16), toon('#c9a24a'), 0, 0.11, 0, g, 0.008, 0.12); const top = new T3.Mesh(new T3.CircleGeometry(0.105, 16), new T3.MeshToonMaterial({ color: WAX[k].col, gradientMap: ctx.grad, emissive: WAX[k].col, emissiveIntensity: 0.3 })); top.rotation.x = -Math.PI / 2; top.position.y = 0.2; g.add(top);
    M(new T3.ConeGeometry(0.04, 0.09, 8), toon('#c9a24a'), 0.12, 0.2, 0, g, 0).rotation.z = -Math.PI / 2; M(new T3.TorusGeometry(0.06, 0.015, 6, 12, Math.PI), darkWood, -0.12, 0.13, 0, g, 0).rotation.z = Math.PI / 2;
    K.pots[k] = { x, z, home: g.position.clone(), g }; });
  K.slots = [1.5, 0.75].map(x => ({ x, z: KZ - 0.28 })); for (const s of K.slots) M(new T3.CylinderGeometry(0.2, 0.2, 0.02, 18), toon('#d8cbb0'), s.x, T + 0.01, s.z, root, 0.006, 0.2);
  // REMELT pot
  K.remelt = { x: -0.15, z: KZ }; M(new T3.CylinderGeometry(0.28, 0.24, 0.32, 20), iron, -0.15, T + 0.16, KZ, root, 0.015, 0.28); { const w = new T3.Mesh(new T3.CircleGeometry(0.25, 20), new T3.MeshToonMaterial({ color: '#e9dcc0', gradientMap: ctx.grad, emissive: '#ffb84a', emissiveIntensity: 0.25 })); w.rotation.x = -Math.PI / 2; w.position.set(-0.15, T + 0.3, KZ); root.add(w); }
  // FINISH bench: violet felt with four spots, the shears and the crest stamp
  M(new T3.BoxGeometry(2.6, 0.02, 0.8), violet, -2.05, T + 0.01, KZ - 0.1, root, 0.006); K.bench = [-1.15, -1.75, -2.35, -2.95].map(x => ({ x, z: KZ - 0.15 }));
  K.stampHome = new T3.Vector3(-3.6, T, KZ + 0.35); M(new T3.CylinderGeometry(0.12, 0.14, 0.06, 16), darkWood, K.stampHome.x, T + 0.03, K.stampHome.z, root, 0.006);
  // PICKUP COUNTER (front, violet with gold trim)
  M(new T3.BoxGeometry(8.8, 1.0, 0.7), violet, 0, 0.5, PZ, root, 0.03); M(new T3.BoxGeometry(8.9, 0.07, 0.8), gold, 0, 1.035, PZ, root, 0.012); K.pass = { z: PZ, y: 1.07 };
  K.colliders.push([-4.5, 4.5, PZ - 0.42, PZ + 0.42]);
  K.spots = [-2.6, 0, 2.6].map(x => ({ x, z: PZ + 1.0 })); K.crates = K.spots.map(s => ({ x: s.x, z: PZ, y: 1.07 }));
  // showroom: shrine of Gaya (big flame), display tables, benches, side shelves
  const flame = (x, y, z, s = 1, lit = true, parent = root) => { const g = new T3.Group(); g.position.set(x, y, z); parent.add(g); const c = new T3.Mesh(new T3.ConeGeometry(0.035 * s, 0.13 * s, 8), new T3.MeshBasicMaterial({ color: 0xffd36a })); c.position.y = 0.06 * s; g.add(c); const c2 = new T3.Mesh(new T3.ConeGeometry(0.018 * s, 0.07 * s, 8), new T3.MeshBasicMaterial({ color: 0xffffff })); c2.position.y = 0.04 * s; g.add(c2); const f = { g, c, s, lit, glow: null, ph: Math.random() * 9 }; g.visible = lit; K.flames.push(f); return f; };
  K.flame = flame;
  const candle = (x, z, y, col, h = 0.4, r = 0.07, lit = true) => { M(new T3.CylinderGeometry(r, r * 1.05, h, 12), toon(col), x, y + h / 2, z, root, 0.008, r).castShadow = false; M(new T3.CylinderGeometry(0.006, 0.006, 0.05, 4), iron, x, y + h + 0.02, z, root, 0); return flame(x, y + h + 0.04, z, 1, lit); };
  { const sx = -6.2, sz = 5.0; M(new T3.CylinderGeometry(0.8, 0.95, 0.7, 8), stone, sx, 0.35, sz, root, 0.02, 0.9); M(new T3.CylinderGeometry(0.55, 0.65, 0.5, 8), stone, sx, 0.95, sz, root, 0.02, 0.65); M(new T3.CylinderGeometry(0.42, 0.42, 0.06, 16), gold, sx, 1.23, sz, root, 0.01, 0.42);
    const big = flame(sx, 1.26, sz, 4.2, true); big.big = true; K.shrine = { x: sx, z: sz, f: big }; K.colliders.push([sx - 1.0, sx + 1.0, sz - 1.0, sz + 1.0]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; candle(sx + Math.cos(a) * 0.72, sz + Math.sin(a) * 0.72, 0.7, ['#f4eedf', '#e9b43c'][i % 2], 0.18 + (i % 3) * 0.05, 0.04, true); } }
  for (const [x, z] of [[-6.4, 1.6], [6.6, -0.6], [6.6, 1.6], [6.6, 3.8]]) { M(new T3.BoxGeometry(1.0, 0.8, 1.6), wood, x, 0.4, z, root, 0.02); M(new T3.BoxGeometry(1.06, 0.05, 1.66), cream, x, 0.82, z, root, 0.01); K.colliders.push([x - 0.6, x + 0.6, z - 0.9, z + 0.9]);
    const cs = ['#f4eedf', '#e9b43c', '#ec8fab', '#5fa8e4']; for (let i = 0; i < 5; i++) { const s = K.sconces.length + i; K.sconces.push(candle(x + (i % 2 - 0.5) * 0.4, z - 0.6 + i * 0.3, 0.845, cs[((i + Math.round(z)) % 4 + 4) % 4], 0.22 + (i % 3) * 0.12, 0.055 + (i % 2) * 0.02, (s % 3) !== 0)); } }
  for (const x of [-2.6, 0]) { M(new T3.BoxGeometry(1.8, 0.1, 0.5), wood, x, 0.48, 5.4, root, 0.015); for (const dx of [-0.75, 0.75]) M(new T3.BoxGeometry(0.1, 0.45, 0.42), darkWood, x + dx, 0.22, 5.4, root, 0); K.colliders.push([x - 0.95, x + 0.95, 5.1, 5.7]); }
  // wall sconces (tap to light / snuff)
  for (const [x, z, ry] of [[-7.9, -4, 1], [-7.9, 0.2, 1], [-7.9, 3, 1], [7.9, -4.5, -1], [7.9, 0, -1], [7.9, 5.6, -1], [-3.6, 6.9, 0], [1.2, 6.9, 0]]) { const g = new T3.Group(); g.position.set(x, 2.1, z); if (ry) g.rotation.y = ry * Math.PI / 2; else g.rotation.y = Math.PI; root.add(g);
    M(new T3.BoxGeometry(0.16, 0.36, 0.05), gold, 0, 0, 0.02, g, 0.006); M(new T3.BoxGeometry(0.1, 0.04, 0.3), gold, 0, -0.08, 0.17, g, 0.004); M(new T3.CylinderGeometry(0.05, 0.05, 0.26, 10), toon('#f4eedf'), 0, 0.07, 0.28, g, 0.006, 0.05); const wp = new T3.Vector3(0, 0.21, 0.28); g.updateMatrixWorld(); K.sconces.push(flame(wp.x, wp.y, wp.z, 1.2, true, g)); }
  // chandeliers: rings of candles over the showroom
  for (const [x, z] of [[-2.6, 2.6], [2.6, 2.6]]) { const g = new T3.Group(); g.position.set(x, 3.7, z); root.add(g); K.back.push(g); M(new T3.TorusGeometry(0.7, 0.04, 6, 24), gold, 0, 0, 0, g, 0).rotation.x = Math.PI / 2; M(new T3.CylinderGeometry(0.012, 0.012, 1.4, 4), iron, 0, 0.7, 0, g, 0); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, cx = Math.cos(a) * 0.7, cz = Math.sin(a) * 0.7; M(new T3.CylinderGeometry(0.035, 0.035, 0.18, 8), toon('#f4eedf'), cx, 0.09, cz, g, 0); flame(cx, 0.2, cz, 0.9, true, g); } }
  // the sign on the front wall (the backdrop while you work) + Gaya banners
  const signT = CTX(1024, 256, c => { c.fillStyle = '#2e1d44'; c.fillRect(0, 0, 1024, 256); c.strokeStyle = '#d9a93a'; c.lineWidth = 10; c.strokeRect(10, 10, 1004, 236); c.fillStyle = '#ffd23a'; c.font = '900 92px Archivo, Arial'; c.textAlign = 'center'; c.fillText('TEMPLE CANDLES', 512, 120); c.fillStyle = '#f6f1e4'; c.font = '800 44px Archivo, Arial'; c.fillText("OPA'S CANDLE WORKS · GAYA", 512, 196); });
  { const s = new T3.Mesh(new T3.PlaneGeometry(5.2, 1.3), new T3.MeshBasicMaterial({ map: signT })); s.position.set(-0.6, 3.7, D / 2 - 0.05); s.rotation.y = Math.PI; root.add(s); }
  const banT = CTX(128, 256, c => { c.fillStyle = '#5b3d7a'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#d9a93a'; c.fillRect(0, 0, 128, 12); c.beginPath(); c.arc(64, 96, 36, 0, 7); c.lineWidth = 10; c.strokeStyle = '#d9a93a'; c.stroke(); c.beginPath(); c.arc(64, 160, 40, 0, 7); c.stroke(); c.fillStyle = '#5b3d7a'; c.beginPath(); c.moveTo(0, 256); c.lineTo(64, 226); c.lineTo(128, 256); c.fill(); });
  for (const x of [-6.6, 3.0]) { const b = new T3.Mesh(new T3.PlaneGeometry(0.9, 1.8), new T3.MeshToonMaterial({ map: banT, gradientMap: ctx.grad, side: T3.DoubleSide })); b.position.set(x, 3.4, D / 2 - 0.06); b.rotation.y = Math.PI; root.add(b); }
  // the door (front wall, right)
  K.door = { x: 4.6, z: D / 2 - 0.3 }; { const d = new T3.Mesh(new T3.PlaneGeometry(1.6, 2.6), new T3.MeshBasicMaterial({ color: 0xf7e2b8 })); d.position.set(K.door.x, 1.3, D / 2 - 0.03); d.rotation.y = Math.PI; root.add(d); M(new T3.BoxGeometry(1.9, 0.14, 0.14), gold, K.door.x, 2.66, D / 2 - 0.06, root, 0.01); for (const dx of [-0.88, 0.88]) M(new T3.BoxGeometry(0.14, 2.6, 0.14), gold, K.door.x + dx, 1.3, D / 2 - 0.06, root, 0.01); }
  K.spawn = { x: 4.6, z: 5.6, yaw: Math.PI }; K.opaWalk = { x: -3.4, z: 1.7 }; K.opaWork = { x: -5.3, z: PZ - 1.05 };
  K.bounds = [-W / 2 + 0.45, W / 2 - 0.45, -D / 2 + 0.45, D / 2 - 0.45];
  K.back.forEach(m => m.traverse && m.traverse(o => o.castShadow = false));
  return K;
}

// ---------------- the stand-alone game ----------------
export async function createCandleWorks({ container, onState = () => {}, onExit = null }) {
  const ST = createStage(container, { bg: '#2a1d36' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS, canvasTex } = ST;
  const { SAFE, shotFor, setSafe } = cameraFit(ST), RINGS = hintRings(ST);
  scene.fog = null; ST.sun.intensity = 1.1; ST.sun.color.set('#ffe2b0');
  const K = buildCandleWorks({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline }), T = K.top;
  const warm = new THREE.PointLight(0xffb05a, 1.4, 14, 1.6); warm.position.set(-1, 3.2, K.KZ + 1); scene.add(warm); const shrineL = new THREE.PointLight(0xffa040, 1.6, 9, 1.8); shrineL.position.set(K.shrine.x, 2.2, K.shrine.z); scene.add(shrineL);

  // ---------- polish FX: steam, drips + ripples, sparkles, dust motes, shrine embers, window light ----------
  const FX = { steam: [], drips: [], ripples: [], sparks: [], steamT: 0 };
  { const mk = (col, op) => new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, opacity: op, blending: THREE.AdditiveBlending }));
    for (let i = 0; i < 14; i++) { const sp = mk(0xfff3e0, 0); sp.visible = false; scene.add(sp); FX.steam.push({ s: sp, life: 0, v: V3() }); }
    for (let i = 0; i < 18; i++) { const sp = mk(0xffd23a, 0); sp.visible = false; sp.renderOrder = 27; sp.material.depthTest = false; scene.add(sp); FX.sparks.push({ s: sp, life: 0, v: V3() }); }
    const dg = new THREE.SphereGeometry(0.018, 6, 4); for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(dg, new THREE.MeshBasicMaterial({ color: 0xffffff })); m.visible = false; scene.add(m); FX.drips.push({ m, v: 0, floor: 0, on: false }); }
    const rg = new THREE.RingGeometry(0.6, 1, 24).rotateX(-Math.PI / 2); for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; scene.add(m); FX.ripples.push({ m, t: 1 }); } }
  function steamAt(x, y, z, col = 0xfff3e0) { const p = FX.steam.find(q => q.life <= 0); if (!p) return; p.life = 1; p.s.visible = true; p.s.material.color.setHex(col); p.s.position.set(x + rr(-0.12, 0.12), y, z + rr(-0.12, 0.12)); p.v.set(rr(-0.03, 0.03), rr(0.22, 0.36), rr(-0.03, 0.03)); }
  function sparkle(p, n = 6) { for (let i = 0; i < n; i++) { const q = FX.sparks.find(k => k.life <= 0); if (!q) return; q.life = 1; q.s.visible = true; q.s.position.copy(p); q.v.set(rr(-0.8, 0.8), rr(0.6, 1.4), rr(-0.8, 0.8)); } }
  function ripple(v) { const r = FX.ripples.find(q => q.t >= 1) || FX.ripples[0]; r.t = 0; r.m.visible = true; r.m.position.set(v.x, v.y + 0.006, v.z); r.m.material.color.set(WAX[rack.col].col).offsetHSL(0, 0, 0.15); }
  function drips() { const y0 = rackY() - 0.58; [-0.09, 0.09].forEach((dx, i) => { const d = FX.drips.find(q => !q.on); if (!d) return; d.on = true; d.m.visible = true; d.m.material.color.set(WAX[rack.col].col); d.m.position.set(rack.x + dx, y0, K.KZ); d.v = -0.2 - i * 0.3; d.floor = K.vats[rack.col].y; d.wait = 0.15 + i * 0.25; }); }
  // dust motes drifting through the window light (one Points object, very cheap)
  const motes = (() => { const n = 70, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-7, 7); pos[i * 3 + 1] = rr(0.6, 4.6); pos[i * 3 + 2] = rr(-6.5, 6.5); } g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, color: 0xffe6b0, size: 0.09, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(m); return m; })();
  const embers = (() => { const n = 18, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), life = new Float32Array(n); for (let i = 0; i < n; i++) life[i] = Math.random(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, color: 0xffa040, size: 0.12, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(m); m.userData.life = life; return m; })();
  // god rays from the three back windows (visible while walking), a violet runner rug from the door, an order sign on the pickup counter
  const rays = []; { const rt = canvasTex(64, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,236,190,0.55)'); g.addColorStop(1, 'rgba(255,236,190,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); });
    for (const x of [-4.8, 0, 4.8]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 5.2), new THREE.MeshBasicMaterial({ map: rt, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, opacity: 0.55 })); m.position.set(x + 0.4, 2.0, -K.D / 2 + 1.9); m.rotation.set(-0.75, 0.25, 0); scene.add(m); rays.push(m); K.back.push(m); } }
  { const rugT = canvasTex(128, 512, c => { c.fillStyle = '#4a2f66'; c.fillRect(0, 0, 128, 512); c.strokeStyle = '#d9a93a'; c.lineWidth = 6; c.strokeRect(10, 10, 108, 492); c.fillStyle = '#5b3d7a'; for (let y = 40; y < 490; y += 60) { c.beginPath(); c.moveTo(64, y); c.lineTo(84, y + 20); c.lineTo(64, y + 40); c.lineTo(44, y + 20); c.closePath(); c.fill(); } c.fillStyle = '#d9a93a'; for (let y = 50; y < 490; y += 60) c.fillRect(61, y + 7, 6, 6); });
    const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 6.2), new THREE.MeshToonMaterial({ map: rugT, gradientMap: ST.grad })); rug.rotation.x = -Math.PI / 2; rug.position.set(K.door.x - 0.2, 0.006, 3.6); rug.receiveShadow = true; scene.add(rug);
    const sgT = canvasTex(512, 96, c => { c.fillStyle = '#2e1d44'; c.fillRect(0, 0, 512, 96); c.strokeStyle = '#d9a93a'; c.lineWidth = 6; c.strokeRect(4, 4, 504, 88); c.fillStyle = '#ffd23a'; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TEMPLE ORDERS', 256, 50); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.41), new THREE.MeshBasicMaterial({ map: sgT })); sg.position.set(0, 0.62, K.PZ + 0.36); scene.add(sg); }
  K.flames.forEach(f => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb84a, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.42 * f.s); s.position.y = 0.06 * f.s; f.g.add(s); f.glow = s; });
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const SND = createCandleAudio(audio), SFX = SND.sfx; const wake = () => { SND.init(); if (SND.music.mode === 'off') SND.music.setMode(S.phase === 'shift' || S.phase === 'glide' ? 'work' : 'calm'); };
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, left: CANDLES.shift, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.5, done: null, focus: 'all', flash: null, react: null, say: '', sayT: 0, demo: false, combo: 0, sel: null, pot: null, userFocusT: 0, lastInput: 0 };
  let PAUSE = false, raf = 0, hudT = 0, hintT = 0, HINT = null, drag = null, stroke = null;
  const clock = new THREE.Clock();

  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const opa = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#d8c8b0', furDark: '#9a8a74' }, torso: ['#d9a93a', '#5b3d7a', '#2e1d44'], outfit: 'robe', crest: '', gear: 'none', mood: 'happy' }));
  opa.position.set(K.opaWalk.x, 0, K.opaWalk.z); opa.rotation.y = 0.6; scene.add(opa);
  const ben = strip(kit.makeFox({ ...CAST.player, gear: 'none' })); ben.position.set(K.spawn.x, 0, K.spawn.z); ben.rotation.y = K.spawn.yaw; scene.add(ben);
  // the TEMPLE APRON uniform (unlocked after 3 served): violet cap + towel + a candle print, worn while inside the works
  const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.fillStyle = '#5b3d7a'; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.fill(); g.lineWidth = 10; g.strokeStyle = '#d9a93a'; g.stroke(); g.fillStyle = '#f6f1e4'; g.fillRect(100, 104, 56, 104); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.strokeRect(100, 104, 56, 104); g.fillStyle = '#201e1d'; g.fillRect(125, 86, 6, 20); g.fillStyle = '#ffd23a'; g.beginPath(); g.moveTo(128, 34); g.quadraticCurveTo(156, 70, 128, 92); g.quadraticCurveTo(100, 70, 128, 34); g.fill(); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(128, 76, 7, 12, 0, 0, 7); g.fill(); g.fillStyle = '#d9a93a'; g.font = '900 34px Archivo, Arial'; g.textAlign = 'center'; g.fillText('GAYA', 128, 168); });
  const uni = dinerUniform(ST, ben, { print, stripe: '#5b3d7a', towelCol: '#5b3d7a', printY: 1.17 });
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uni.parts.forEach(p => p.visible = on); uni.print.visible = on; crestSlots.forEach(m => m.visible = !on); };
  setUniform(save.flag('gayaCandleUniform'));
  const custFox = CUSTOMERS.map(cu => { const f = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: pick(['#d9772e', '#c96a2a', '#e08a3a', '#b8682e']) }, torso: cu.torso, outfit: cu.outfit || 'robe', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });

  // ---------- labels (world sprites) ----------
  const labCache = new Map();
  function labelTex(txt, col = '#ffd23a') { const k = txt + col; if (labCache.has(k)) return labCache.get(k); const c = document.createElement('canvas'); c.width = 256; c.height = 56; const g = c.getContext('2d'); g.font = '900 30px Archivo, Arial'; const w = Math.min(248, g.measureText(txt).width + 24); g.fillStyle = '#000'; g.fillRect((256 - w) / 2, 4, w, 48); g.fillStyle = col; g.fillRect((256 - w) / 2, 46, w, 6); g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 27); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; labCache.set(k, t); return t; }
  function makeLabel() { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelTex(' '), depthTest: false, transparent: true })); s.renderOrder = 26; s.scale.set(0.62, 0.136, 1); s.visible = false; scene.add(s); s.userData.txt = ''; return s; }
  function setLabel(s, txt, col, p) { if (!txt) { s.visible = false; return; } if (s.userData.txt !== txt + col) { s.material.map = labelTex(txt, col); s.userData.txt = txt + col; } s.visible = true; if (p) s.position.copy(p); }

  // ---------- candle meshes ----------
  function candleMesh(kind, col, opts = {}) { const g = new THREE.Group(), c = WAX[col].col;
    if (kind === 'taper') { for (const dx of [-0.09, 0.09]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.056, 0.5, 12), toon(c)); m.position.set(dx, 0.25, 0); addOutline(m, 0.008, 0.056); g.add(m); } }
    else if (kind === 'pillar') { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.34, 18), toon(c)); m.position.y = 0.17; addOutline(m, 0.01, 0.13); g.add(m); }
    else { const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 0.26, 18, 1, true), new THREE.MeshToonMaterial({ color: '#cfe9ef', transparent: true, opacity: 0.55, gradientMap: ST.grad, side: THREE.DoubleSide })); glass.position.y = 0.13; g.add(glass); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.11, 0.2, 18), toon(c)); w.position.y = 0.1; g.add(w); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.012, 6, 20), toon('#d9a93a')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.26; g.add(rim); }
    const wy = kind === 'taper' ? 0.5 : kind === 'pillar' ? 0.34 : 0.2, wicks = [];
    for (const dx of kind === 'taper' ? [-0.09, 0.09] : [0]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.16, 5), toon('#201e1d')); w.position.set(dx, wy + 0.08, 0); g.add(w); wicks.push(w); }
    const crest = new THREE.Mesh(new THREE.CircleGeometry(kind === 'taper' ? 0.03 : 0.06, 16), new THREE.MeshBasicMaterial({ color: 0xd9a93a })); crest.position.set(kind === 'taper' ? -0.09 : 0, kind === 'taper' ? 0.2 : kind === 'pillar' ? 0.18 : 0.13, kind === 'taper' ? -0.05 : -0.135); crest.rotation.y = Math.PI; crest.visible = false; g.add(crest);
    if (kind === 'taper') { const c2 = crest.clone(); c2.position.x = 0.09; g.add(c2); g.userData.crest2 = c2; }
    g.userData = { ...g.userData, wicks, crest, wy, kind, col }; return g; }
  function trimMesh(m) { m.userData.wicks.forEach(w => { w.scale.y = 0.35; w.position.y = m.userData.wy + 0.028; }); }
  function stampMesh(m) { m.userData.crest.visible = true; if (m.userData.crest2) m.userData.crest2.visible = true; }

  // ---------- DIP rack ----------
  const rack = { col: 'white', layers: 0, dipY: 0, hot: 0, sag: 0, inT: 0, wasIn: false, enteredHot: false, auto: null, x: K.vats.white.x, g: new THREE.Group(), tapers: [], mats: [] };
  { const carriage = M(new THREE.BoxGeometry(0.2, 0.12, 0.2), toon('#3a3836'), 0, 0, 0, rack.g, 0.01); carriage.position.y = 0; scene.add(rack.g); rack.rod = M(new THREE.CylinderGeometry(0.015, 0.015, 1, 6), toon('#3a3836'), 0, 0, 0, rack.g, 0); rack.bar = M(new THREE.BoxGeometry(0.4, 0.05, 0.06), toon('#7a4e2c'), 0, 0, 0, rack.g, 0.008);
    for (const dx of [-0.09, 0.09]) { const mat = new THREE.MeshToonMaterial({ color: '#f4eedf', gradientMap: ST.grad, emissive: '#ffb84a', emissiveIntensity: 0 }); const m = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.25, 0.5, 12), mat); m.position.x = dx; rack.g.add(m); rack.tapers.push(m); rack.mats.push(mat); const w = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.56, 4), toon('#201e1d')); w.position.x = dx; rack.g.add(w); m.userData.wick = w; } }
  const rackLab = makeLabel();
  const rackY = () => 2.05 - rack.dipY * 1.0;
  function placeRack(dt = 0) { const tx = K.vats[rack.col].x; rack.x = dt ? damp(rack.x, tx, 8, dt) : tx; const y = rackY(); rack.g.position.set(rack.x, 2.42, K.KZ); rack.rod.scale.y = 2.42 - y; rack.rod.position.y = -(2.42 - y) / 2; rack.bar.position.y = y - 2.42;
    const r = rack.layers ? 0.012 + rack.layers * 0.0075 : 0.004; rack.tapers.forEach((m, i) => { m.visible = rack.layers > 0; m.scale.set(r, 1, r); m.position.y = y - 2.42 - 0.3; m.userData.wick.position.y = y - 2.42 - 0.26; rack.mats[i].color.set(WAX[rack.col].col); rack.mats[i].emissiveIntensity = rack.hot * 0.9; m.rotation.z = rack.sag ? Math.sin(i + 1) * 0.04 * rack.sag : 0; }); }
  placeRack();
  function setRackCol(k) { if (S.phase !== 'shift') return; if (!avail().cols.includes(k)) { flash(WAX[k].name + ' UNLOCKS ON DAY ' + WAX[k].day, '#ffffff', 1.1); return; } if (rack.layers > 0 && k !== rack.col) { flash('CUT THIS PAIR FIRST', '#ffffff', 1); return; } rack.col = k; SFX.select(); }
  function dipEnter() { rack.wasIn = true; rack.inT = 0; rack.enteredHot = rack.layers > 0 && rack.hot > 0.32; SFX.dipIn(); ripple(K.vats[rack.col]); }
  function dipExit() { rack.wasIn = false; const v = K.vats[rack.col]; puff(v.x, T + 0.3, v.z, 0xffffff, 2);
    if (rack.enteredHot) { rack.sag++; flash('TOO HOT · THE LAYER SLID OFF', '#ec3013', 1.1); SFX.bad(); rack.hot = 0.8; }
    else { rack.layers++; rack.hot = 1; SFX.dipOut(); SFX.layer(rack.layers); drips(); if (rack.layers === TARGET) { flash('6 LAYERS · PERFECT · CUT IT DOWN', '#22c55e', 1.2); SFX.perfect(); } else if (rack.layers > TARGET + 1) flash('TOO THICK', '#ec3013', 0.9); } }
  function autoDip() { if (S.phase !== 'shift' || rack.auto || drag) return; rack.auto = { t: 0 }; }
  function cutRack() { if (S.phase !== 'shift' || rack.layers < 1 || rack.dipY > 0.05) return false; const i = benchFree(); if (i < 0) { flash('BENCH FULL · PACK OR REMELT', '#ec3013', 1.2); return false; }
    const d = Math.abs(rack.layers - TARGET), q = Math.max(0.1, (d === 0 ? 1 : d === 1 ? 0.75 : d === 2 ? 0.45 : 0.2) - rack.sag * 0.15);
    addBench(i, 'taper', rack.col, q, V3(rack.x, rackY() - 0.55, K.KZ)); rack.layers = 0; rack.sag = 0; rack.hot = 0; SFX.snip(); return true; }

  // ---------- POUR ----------
  const slots = K.slots.map(s => ({ ...s, st: 'empty', kind: null, col: null, fill: 0, cool: 0, q: 0, g: null, wax: null, lab: makeLabel() }));
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 1, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); stream.visible = false; scene.add(stream);
  let pourI = -1;
  const setT = () => upg('fan') ? 2.6 : 4.0;
  function selectPot(k) { if (S.phase !== 'shift') return; if (!avail().cols.includes(k)) { flash(WAX[k].name + ' UNLOCKS ON DAY ' + WAX[k].day, '#ffffff', 1.1); return; } S.pot = k; SFX.select(); }
  function placeMould(kind) { if (S.phase !== 'shift') return false; if (!avail().kinds.includes(kind)) { flash('JARS UNLOCK ON DAY 2', '#ffffff', 1.1); return false; } const i = slots.findIndex(s => s.st === 'empty' && !s.kind); if (i < 0) { flash('BOTH POUR SPOTS IN USE', '#ffffff', 1); return false; }
    const s = slots[i]; s.kind = kind; s.col = null; s.fill = 0; s.g = new THREE.Group(); s.g.position.set(s.x, T + 0.02, s.z); scene.add(s.g);
    if (kind === 'pillar') { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.38, 18, 1, true), new THREE.MeshToonMaterial({ color: '#a9b3bd', gradientMap: ST.grad, side: THREE.DoubleSide })); m.position.y = 0.19; addOutline(m, 0.008, 0.15); s.g.add(m); }
    else { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.115, 0.26, 18, 1, true), new THREE.MeshToonMaterial({ color: '#cfe9ef', gradientMap: ST.grad, transparent: true, opacity: 0.6, side: THREE.DoubleSide })); m.position.y = 0.13; s.g.add(m); }
    const lineM = new THREE.Mesh(new THREE.TorusGeometry(kind === 'pillar' ? 0.152 : 0.128, 0.008, 4, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a })); lineM.rotation.x = Math.PI / 2; lineM.position.y = (kind === 'pillar' ? 0.38 : 0.26) * 0.8; s.g.add(lineM);
    s.wax = new THREE.Mesh(new THREE.CylinderGeometry(kind === 'pillar' ? 0.14 : 0.118, kind === 'pillar' ? 0.14 : 0.11, 1, 18), new THREE.MeshToonMaterial({ color: '#ffffff', gradientMap: ST.grad, emissive: '#ffb84a', emissiveIntensity: 0.5 })); s.wax.visible = false; s.g.add(s.wax); s.h = kind === 'pillar' ? 0.38 : 0.26;
    SFX.click(); SFX.pack(); return true; }
  function pourStart(i) { const s = slots[i]; if (!s || S.phase !== 'shift') return false; if (!s.kind) { flash('TAP PILLAR OR JAR MOULDS FIRST', '#ffffff', 1); return false; } if (s.st === 'cool' || s.st === 'set') return false;
    if (s.st === 'spill') { clearSlot(i); flash('SPILL SCRAPED · TRY AGAIN', '#ffffff', 0.9); return false; }
    if (!S.pot) { flash('TAP A WAX POT FIRST', '#ffffff', 1); return false; } if (s.col && s.col !== S.pot) { flash('ONE COLOUR PER CANDLE', '#ffffff', 1); return false; }
    s.col = S.pot; s.st = 'pour'; pourI = i; s.wax.material.color.set(WAX[s.col].col); SFX.pour.start(); return true; }
  function pourStop() { SFX.pour.stop(); if (pourI < 0) return; const s = slots[pourI]; pourI = -1; stream.visible = false; if (s.st !== 'pour') return;
    if (s.fill < 0.3) { flash('KEEP POURING TO THE GOLD LINE', '#ffffff', 0.9); return; }
    const d = Math.abs(s.fill - 0.8); s.q = d < 0.03 ? 1 : d < 0.07 ? 0.75 : d < 0.12 ? 0.45 : 0.2; s.st = 'cool'; s.cool = 0;
    flash(d < 0.03 ? 'RIGHT ON THE LINE' : s.fill > 0.8 ? 'A LITTLE OVER' : 'A LITTLE SHORT', d < 0.03 ? '#22c55e' : d < 0.07 ? '#ffd23a' : '#ff9a8a', 0.9); if (d < 0.03) SFX.perfect(); else if (d >= 0.07) SFX.bad(); }
  function clearSlot(i) { const s = slots[i]; if (s.g) scene.remove(s.g); Object.assign(s, { st: 'empty', kind: null, col: null, fill: 0, cool: 0, q: 0, g: null, wax: null }); s.lab.visible = false; }
  function unmould(i) { const s = slots[i]; if (!s || s.st !== 'set') return false; const b = benchFree(); if (b < 0) { flash('BENCH FULL · PACK OR REMELT', '#ec3013', 1.2); return false; }
    addBench(b, s.kind, s.col, s.q, V3(s.x, T + 0.05, s.z)); puff(s.x, T + 0.3, s.z, 0xffffff, 3); SFX.unmould(); clearSlot(i); return true; }

  // ---------- FINISH bench ----------
  const bench = K.bench.map(b => ({ ...b, it: null }));
  const benchFree = () => bench.findIndex(b => !b.it);
  const anims = [];
  function slide(mesh, from, to, dur, done) { mesh.position.copy(from); anims.push({ mesh, from: from.clone(), to: to.clone(), t: 0, dur, done }); }
  function addBench(i, kind, col, q, from) { const m = candleMesh(kind, col); scene.add(m); const b = bench[i]; b.it = { kind, col, q, trim: false, stamp: false, m }; slide(m, from, V3(b.x, T + 0.02, b.z), 0.45); }
  const benchPos = i => V3(bench[i].x, T + 0.02, bench[i].z);
  const ready = it => it && it.trim && it.stamp;
  function trim(i) { const it = bench[i] && bench[i].it; if (!it || it.trim) return false; const all = upg('shears') ? bench.filter(b => b.it && !b.it.trim) : [bench[i]]; all.forEach(b => { b.it.trim = true; trimMesh(b.it.m); puff(b.x, T + b.it.m.userData.wy + 0.1, b.z, 0x201e1d, 1); }); SFX.snip(); return true; }
  const stampTool = (() => { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.035, 0.035, 0.26, 10), toon('#7a4e2c'), 0, 0.2, 0, g, 0.006); M(new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16), toon('#d9a93a'), 0, 0.04, 0, g, 0.006, 0.08); g.position.copy(K.stampHome); scene.add(g); return g; })();
  let stampAnim = null;
  function stamp(i) { const it = bench[i] && bench[i].it; if (!it) return false; if (!it.trim) { flash('TRIM THE WICK FIRST · SWIPE ACROSS IT', '#ffffff', 1.1); return false; } if (it.stamp) return false;
    const all = upg('stamp') ? bench.filter(b => b.it && b.it.trim && !b.it.stamp) : [bench[i]]; all.forEach(b => { b.it.stamp = true; stampMesh(b.it.m); }); stampAnim = { t: 0, x: bench[i].x, z: bench[i].z - 0.18, y: T + 0.2 }; SFX.stamp(); setTimeout(() => all.forEach(b => b.it && sparkle(V3(b.x, T + 0.4, b.z), 4)), 220); return true; }
  function remelt(i) { const b = bench[i]; if (!b || !b.it) return false; const m = b.it.m; b.it = null; slide(m, m.position, V3(K.remelt.x, T + 0.2, K.remelt.z), 0.4, () => { scene.remove(m); puff(K.remelt.x, T + 0.4, K.remelt.z, 0xffd8a0, 3); }); flash('REMELTED', '#ffd23a', 0.8); SFX.melt(); if (S.sel === i) S.sel = null; return true; }

  // ---------- orders / customers ----------
  const orders = []; let oid = 0;
  const crates = K.crates.map(c => ({ ...c, g: null }));
  function avail() { const d = S.day, cols = Object.keys(WAX).filter(k => WAX[k].day <= d), kinds = Object.keys(KINDS).filter(k => KINDS[k].day <= d); return { cols, kinds }; }
  function crateMesh(n) { const g = new THREE.Group(), wd = toon('#b07f4a'); const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.5), wd); base.position.y = 0.025; addOutline(base, 0.008); g.add(base);
    for (const [x, z, w, d] of [[0, 0.24, 0.9, 0.04], [0, -0.24, 0.9, 0.04], [0.44, 0, 0.04, 0.5], [-0.44, 0, 0.04, 0.5]]) { const s = new THREE.Mesh(new THREE.BoxGeometry(w, 0.2, d), wd); s.position.set(x, 0.12, z); addOutline(s, 0.006); g.add(s); }
    const straw = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.04, 0.44), toon('#e8cf7a')); straw.position.y = 0.07; g.add(straw); g.userData.n = n; g.userData.items = []; return g; }
  function newOrder() { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i)); if (free < 0) return; const used = orders.map(o => o.ci), ci = pick(CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)));
    const A = avail(), nLines = S.demo ? 2 : clamp(1 + Math.floor(Math.random() * Math.min(3, 1 + Math.ceil(S.day / 2))), 1, 3), lines = [];
    for (let i = 0; i < nLines; i++) { let kind = pick(A.kinds), col = pick(A.cols); if (S.demo) { kind = i ? 'pillar' : 'taper'; col = i ? 'gold' : 'white'; } lines.push({ kind, col, done: false }); }
    const total = lines.reduce((a, l) => a + KINDS[l.kind].price, 0), patMax = (52 + nLines * 26 - Math.min(16, S.day * 2)) * (upg('choir') ? 1.2 : 1) * (S.demo ? 3 : 1);
    const f = custFox[ci]; f.visible = true; f.position.set(K.door.x, 0, K.door.z); f.userData.mood = 'happy';
    const c = crates[free]; c.g = crateMesh(nLines); c.g.position.set(c.x, c.y, c.z); scene.add(c.g);
    orders.push({ id: ++oid, ci, spot: free, lines, total, pat: patMax, patMax, st: 'walk', f, say: pick(LINES.order), q: [], tip: 0 }); SFX.order(); }
  function orderFor(spot) { return orders.find(o => o.spot === spot && o.st === 'wait'); }
  function pack(bi, spot) { const b = bench[bi], it = b && b.it, o = orderFor(spot); if (!it) return false; if (!o) { flash('NOBODY AT THAT CRATE YET', '#ffffff', 1); return false; }
    if (!ready(it)) { flash(!it.trim ? 'TRIM IT FIRST · SWIPE ACROSS THE WICK' : 'STAMP THE CREST FIRST · TAP IT', '#ffffff', 1.2); return false; }
    const L = o.lines.find(l => !l.done && l.kind === it.kind && l.col === it.col); if (!L) { flash(CUSTOMERS[o.ci].name + " DIDN'T ORDER A " + itemName(it.kind, it.col), '#ec3013', 1.3); SFX.bad(); return false; }
    L.done = true; o.q.push(it.q); b.it = null; if (S.sel === bi) S.sel = null; const cg = crates[spot].g, n = cg.userData.items.length; const m = it.m; slide(m, m.position, V3(cg.position.x - 0.28 + n * 0.28, cg.position.y + 0.07, cg.position.z), 0.4, () => { scene.remove(m); m.position.set(-0.28 + n * 0.28, 0.07, 0); m.scale.setScalar(0.85); cg.add(m); cg.userData.items.push(m); });
    SFX.pack(); if (it.q >= 0.85) setTimeout(() => { sparkle(V3(cg.position.x, cg.position.y + 0.3, cg.position.z), 8); SFX.sparkle(); }, 380); if (o.lines.every(l => l.done)) setTimeout(() => serve(o), 480); return true; }
  function serve(o) { if (o.st !== 'wait') return; const avg = o.q.reduce((a, b) => a + b, 0) / o.q.length, pq = o.pat / o.patMax, stars = avg >= 0.85 ? (pq > 0.4 ? 3 : 2) : avg >= 0.55 ? 2 : 1;
    const level = stars === 3 ? 'thrilled' : stars === 2 ? (avg >= 0.7 ? 'happy' : 'okay') : 'grumpy', tip = stars === 3 ? Math.round(o.total * 0.4) + Math.min(4, S.combo) : stars === 2 ? Math.round(o.total * 0.15) : 0;
    o.tip = tip; o.stars = stars; if (S.demo) DM.served++; S.earned += o.total; S.tips += tip; S.served++; S.starList.push(stars); S.combo = stars === 3 ? S.combo + 1 : 0;
    const R = REACT[level]; o.f.userData.mood = R.mood; S.react = { t: 0, word: R.word, col: R.col, line: pick(LINES[level]), who: CUSTOMERS[o.ci].name, stars, tip };
    o.st = 'leave'; const cg = crates[o.spot].g; crates[o.spot].g = null; scene.remove(cg); cg.position.set(0, 1.0, 0.42); cg.scale.setScalar(0.7); o.f.add(cg); o.carry = cg; SFX.served(stars); if (stars === 3) o.f.userData.hop = 1; if (S.served === 3 && !save.flag('gayaCandleUniform') && !S.demo) { save.setFlag('gayaCandleUniform'); setUniform(true); S.unlockNow = true; } }
  function walkOut(o) { o.st = 'leave'; o.f.userData.mood = 'angry'; S.lost++; S.combo = 0; S.say = CUSTOMERS[o.ci].name + ': ' + pick(LINES.angry); S.sayT = 3; const cg = crates[o.spot].g; if (cg) scene.remove(cg); crates[o.spot].g = null; flash(CUSTOMERS[o.ci].name + ' LEFT', '#ec3013', 1.2); SFX.walkout(); }

  // ---------- flash ----------
  function flash(txt, col = '#ffd23a', dur = 1) { S.flash = { txt, col, t: dur }; }

  // ---------- cameras ----------
  const CAM = { look: V3(0, 1.4, 0), from: null, to: null, t: 1, dur: 1 };
  const FOCUS_PTS = {
    all: () => [V3(-4.0, T, K.KZ - 0.6), V3(6.0, T, K.KZ - 0.6), V3(6.0, 2.5, K.KZ), V3(-3.5, T, K.PZ + 0.3), V3(3.5, T, K.PZ + 0.3), V3(0, 2.2, K.spots[1].z)],
    dip: () => [V3(5.75, T, K.KZ - 0.45), V3(3.0, T, K.KZ - 0.45), V3(5.75, 2.5, K.KZ), V3(3.0, 2.5, K.KZ), V3(4.4, T, K.KZ + 0.45)],
    pour: () => [V3(2.65, T, K.KZ - 0.55), V3(0.4, T, K.KZ - 0.55), V3(2.65, T + 0.3, K.KZ + 0.6), V3(0.4, T + 0.7, K.KZ + 0.6)],
    finish: () => [V3(-0.6, T, K.KZ - 0.55), V3(-3.75, T, K.KZ - 0.55), V3(-0.6, T + 0.7, K.KZ + 0.4), V3(-3.75, T + 0.5, K.KZ + 0.5)],
    pack: () => [V3(-0.6, T, K.KZ - 0.5), V3(-3.4, T, K.KZ - 0.5), V3(-3.1, T + 0.3, K.PZ), V3(3.1, T + 0.3, K.PZ), V3(0, 1.9, K.spots[1].z)] };
  const workShot = (id = S.focus) => { const port = CW() < CHh(); return shotFor('w:' + id, FOCUS_PTS[id] || FOCUS_PTS.all, port ? (id === 'all' || id === 'pack' ? 0.95 : 0.9) : (id === 'all' || id === 'pack' ? 0.7 : id === 'dip' ? 1.0 : 0.86), 0, id === 'all' ? 0.03 : 0.05); };
  const inRoom = sh => { const p = sh.pos.clone(), L = sh.look, lim = (v, a, b) => v >= a && v <= b; for (let i = 0; i < 40 && !(lim(p.x, -K.W / 2 + 0.4, K.W / 2 - 0.4) && lim(p.z, -K.D / 2 + 0.4, K.D / 2 - 0.4) && p.y < K.H - 0.4); i++) p.lerp(L, 0.06); return { pos: p, look: L }; };
  const introShot = () => { const b = ben.position, o = opa.position, mid = V3((b.x + o.x) / 2, 1.15, (b.z + o.z) / 2), W = CW(), H = CHh(), port = H > W;
    const C = V3(clamp(mid.x + (port ? 4.2 : 3.0), -7.3, 7.3), port ? 2.0 : 2.1, clamp(mid.z + (port ? 5.0 : 3.0), -6.3, 6.3)), f = mid.clone().sub(C).normalize(), r = V3().crossVectors(f, V3(0, 1, 0)).normalize(), u = V3().crossVectors(r, f);
    const th = Math.tan(camera.fov * Math.PI / 360), cx = (-1 + 2 * SAFE.left / W + 1) / 2, cy = ((1 - 2 * SAFE.top / H) + (-1 + 2 * SAFE.bottom / H)) / 2;
    const L = f.clone().addScaledVector(r, -cx * th * W / H).addScaledVector(u, -cy * th).normalize(); return { pos: C, look: C.clone().addScaledVector(L, C.distanceTo(mid)) }; };
  function glideTo(shot, dur = 1.4) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  function setFocus(id) { if (!FOCUS_PTS[id]) return; S.focus = id; S.userFocusT = performance.now(); }
  // walk camera (behind Ben, clamped inside the room)
  const WC = { yaw: 0, pitch: 0.5, dist: 5.6, look: 0, eye: 0 };

  // ---------- walk ----------
  const stick = { x: 0, y: 0 }, keys = new Set(); let jumpV = 0, jumpY = 0;
  const near = (a, x, z, r) => Math.hypot(a.position.x - x, a.position.z - z) < r;
  const nearOpa = () => near(ben, opa.position.x, opa.position.z, 2.1);
  function collide(p) { const r = 0.38, B = K.bounds; p.x = clamp(p.x, B[0], B[1]); p.z = clamp(p.z, B[2], B[3]); for (const [x0, x1, z0, z1] of K.colliders) { if (p.x > x0 - r && p.x < x1 + r && p.z > z0 - r && p.z < z1 + r) { const dl = p.x - (x0 - r), dr = x1 + r - p.x, dn = p.z - (z0 - r), df = z1 + r - p.z, m = Math.min(dl, dr, dn, df); if (m === dl) p.x = x0 - r; else if (m === dr) p.x = x1 + r; else if (m === dn) p.z = z0 - r; else p.z = z1 + r; } } const od = Math.hypot(p.x - opa.position.x, p.z - opa.position.z); if (od < 0.7 && S.phase === 'walk') { p.x = opa.position.x + (p.x - opa.position.x) / od * 0.7; p.z = opa.position.z + (p.z - opa.position.z) / od * 0.7; } }
  function walkStep(dt) { let x = stick.x, y = stick.y; if (keys.has('KeyW') || keys.has('ArrowUp')) y += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) y -= 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1;
    const mag = Math.min(1, Math.hypot(x, y)), fy = WC.yaw + Math.PI; let sp = 0;
    if (mag > 0.08) { const fx = -Math.sin(WC.yaw), fz = -Math.cos(WC.yaw), rx = Math.cos(WC.yaw), rz = -Math.sin(WC.yaw), dx = (fx * y + rx * x) / Math.max(1, Math.hypot(x, y)), dz = (fz * y + rz * x) / Math.max(1, Math.hypot(x, y)); sp = 4.2 * mag; const p = ben.position.clone(); p.x += dx * sp * dt; p.z += dz * sp * dt; collide(p); ben.position.x = p.x; ben.position.z = p.z; const want = Math.atan2(dx, dz); let d = want - ben.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); ben.rotation.y += d * Math.min(1, dt * 12); }
    if (jumpY > 0 || jumpV > 0) { jumpV -= 14 * dt; jumpY = Math.max(0, jumpY + jumpV * dt); if (jumpY === 0) jumpV = 0; } ben.position.y = jumpY;
    if (sp > 0.5 && jumpY === 0) { WC.stepD = (WC.stepD || 0) + sp * dt; if (WC.stepD > 0.75) { WC.stepD = 0; WC.side = !WC.side; SFX.step(WC.side); } }
    if (nearOpa() && !S.greeted) { S.greeted = true; S.toast = 'OPA: Ah, Ben! The Temple needs light. Talk to me when you are ready to work.'; S.toastT = 3.5; }
    kit.animFox(ben, dt, sp, jumpY > 0); const ov = nearOpa(); const want = ov ? Math.atan2(ben.position.x - opa.position.x, ben.position.z - opa.position.z) : 0.6; let d = want - opa.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); opa.rotation.y += d * Math.min(1, dt * 4); opa.userData.mood = ov ? 'excited' : 'happy';
    // camera
    const yaw = WC.yaw + WC.look, tgt = V3(ben.position.x, 1.5 + jumpY * 0.4, ben.position.z), cp = V3(tgt.x + Math.sin(yaw) * Math.cos(WC.pitch) * WC.dist, tgt.y + Math.sin(WC.pitch) * WC.dist, tgt.z + Math.cos(yaw) * Math.cos(WC.pitch) * WC.dist);
    cp.x = clamp(cp.x, -K.W / 2 + 0.3, K.W / 2 - 0.3); cp.z = clamp(cp.z, -K.D / 2 + 0.3, K.D / 2 - 0.3); const hd = Math.hypot(cp.x - tgt.x, cp.z - tgt.z); if (hd < 3) cp.y = Math.max(cp.y, tgt.y + (3 - hd) * 1.1); cp.y = Math.min(cp.y, K.H - 0.4);
    if (mag > 0.1 && y > -0.3 && !WC.eye) { let dy = (ben.rotation.y + Math.PI) - WC.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); WC.yaw += dy * Math.min(1, dt * 1.6 * mag); }
    camera.position.lerp(cp, Math.min(1, dt * 6)); CAM.look.lerp(tgt, Math.min(1, dt * 8)); camera.lookAt(CAM.look); WC.look = damp(WC.look, 0, WC.eye ? 0 : 3, dt); }
  const nearDoor = () => near(ben, K.door.x, K.door.z - 0.3, 1.5);
  function talk() { if (S.phase !== 'walk') return; if (nearOpa()) { toIntro(); return; } if (nearDoor()) { SFX.click(); if (onExit) onExit({ gold: save.data.gold, day: S.day }); else { S.toast = 'THIS DOOR LEADS BACK TO GAYA ONCE THE WORKS IS IN A WORLD'; S.toastT = 2.5; } } }
  function lookAround() { if (S.phase !== 'intro' && S.phase !== 'done') return; if (DM.on) demoStop(); S.phase = 'walk'; S.done = null; ben.visible = true; ben.position.set(K.opaWalk.x + 1.6, 0, K.opaWalk.z + 1.2); ben.rotation.y = Math.PI; WC.yaw = 0; WC.look = 0; wake(); SFX.click(); SND.music.setMode('calm'); }
  function toIntro() { if (DM.on) demoStop(); SND.music.setMode('calm'); S.phase = 'intro'; S.done = null; ben.visible = true; stick.x = stick.y = 0; ben.position.set(K.opaWalk.x + 1.15, 0, K.opaWalk.z - 0.95); ben.rotation.y = 0.55; jumpY = jumpV = 0; glideTo(introShot(), 1.0); }

  // ---------- shift ----------
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; if (!S.demo && DM.on) demoStop(); audio.init && audio.init();
    resetLine(); Object.assign(S, { phase: 'glide', t: 0, left: CANDLES.shift, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.2, done: null, combo: 0, focus: 'all', sel: null, pot: null, react: null, say: '', unlockNow: false });
    ben.visible = false; K.back.forEach(m => m.visible = false); opa.position.set(K.opaWork.x, 0, K.opaWork.z); opa.rotation.y = Math.PI - 0.5; glideTo(workShot('all'), 1.4); wake(); SFX.order(); SND.music.setMode('work'); }
  function resetLine() { orders.forEach(o => { o.f.visible = false; if (o.carry) o.f.remove(o.carry); }); orders.length = 0; crates.forEach(c => { if (c.g) scene.remove(c.g); c.g = null; }); bench.forEach(b => { if (b.it) scene.remove(b.it.m); b.it = null; }); slots.forEach((_, i) => clearSlot(i)); anims.length = 0;
    Object.assign(rack, { layers: 0, dipY: 0, hot: 0, sag: 0, wasIn: false, auto: null, col: 'white' }); pourI = -1; stream.visible = false; drag = null; stroke = null; }
  function endShift() { S.phase = 'done'; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 3 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips, newDay = S.served >= 2 + S.day;
    const unlock = []; if (S.unlockNow) unlock.push('TEMPLE APRON · yours to wear in the works');
    if (!S.demo) { save.addGold(total); save.best(SAVE.best, total); if (newDay) { save.setStat(SAVE.day, S.day + 1); const nd = S.day + 1; Object.keys(WAX).filter(k => WAX[k].day === nd).forEach(k => unlock.push(WAX[k].name + ' WAX')); Object.keys(KINDS).filter(k => KINDS[k].day === nd).forEach(k => unlock.push(KINDS[k].name + ' MOULDS')); } if (eod) save.addXp(25); }
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: avg ? avg.toFixed(1) : '–', stars: S.starList.reduce((a, b) => a + b, 0), wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, gold: save.data.gold };
    if (newDay && !S.demo) S.day++; resetLine(); K.back.forEach(m => m.visible = true); opa.position.set(K.opaWalk.x, 0, K.opaWalk.z); ben.visible = true; ben.position.set(K.opaWalk.x + 1.15, 0, K.opaWalk.z - 0.95); ben.rotation.y = 0.55; glideTo(introShot(), 1.4); SFX.endShift(); SND.music.setMode('calm'); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); SFX.upgrade(); if (S.done) S.done.gold = save.data.gold; return true; }

  // ---------- planner: the next useful step (hints + the demo autopilot) ----------
  function plan() { if (S.phase !== 'shift') return null; const want = []; orders.filter(o => o.st === 'wait').sort((a, b) => a.pat - b.pat).forEach(o => o.lines.forEach(l => { if (!l.done) want.push({ o, l }); })); if (!want.length) return null;
    const used = new Set(), match = (kind, col) => want.find(w => !used.has(w) && w.l.kind === kind && w.l.col === col);
    // 1. ready on the bench → pack it
    for (let i = 0; i < bench.length; i++) { const it = bench[i].it; if (!it) continue; const w = match(it.kind, it.col); if (!w) continue; used.add(w); if (ready(it)) return { station: 'pack', p: benchPos(i).add(V3(0, 0.3, 0)), r: 0.3, text: 'DRAG THE ' + itemName(it.kind, it.col) + ' TO ' + CUSTOMERS[w.o.ci].name + "'S CRATE", act: () => pack(i, w.o.spot) };
      if (!it.trim) return { station: 'finish', p: benchPos(i).add(V3(0, it.m.userData.wy + 0.1, 0)), r: 0.22, text: 'SWIPE ACROSS THE WICK TO TRIM IT', act: () => trim(i) };
      return { station: 'finish', p: benchPos(i).add(V3(0, 0.2, 0)), r: 0.22, text: 'TAP THE CANDLE TO STAMP THE CREST', act: () => stamp(i) }; }
    // 2. set in a mould → unmould; pouring/cooling → keep going
    for (let i = 0; i < slots.length; i++) { const s = slots[i]; if (!s.col || (s.st !== 'set' && s.st !== 'cool')) continue; const w = match(s.kind, s.col); if (!w) continue; used.add(w); if (s.st === 'set') return { station: 'pour', p: V3(s.x, T + 0.2, s.z), r: 0.24, text: 'SET! TAP IT TO UNMOULD', act: () => unmould(i) }; }
    // 3. the rack
    if (rack.layers > 0) { const w = match('taper', rack.col); if (w) { used.add(w); if (rack.layers >= TARGET) return { station: 'dip', p: V3(rack.x, rackY() - 0.3, K.KZ), r: 0.3, text: 'CUT ▸ BENCH', act: () => cutRack() }; return { station: 'dip', p: V3(rack.x, T + 0.08, K.KZ), r: 0.3, text: rack.hot > 0.32 ? 'WAIT FOR THE GLOW TO FADE…' : 'DIP AGAIN · LAYER ' + (rack.layers + 1) + ' / ' + TARGET, act: () => { if (rack.hot <= 0.25) autoDip(); return true; }, wait: rack.hot > 0.25 }; } }
    // 4. something new to make
    const w = want.find(x => !used.has(x)); if (!w) { const cooling = slots.find(s => s.st === 'cool'); return cooling ? { station: 'pour', p: V3(cooling.x, T + 0.2, cooling.z), r: 0.24, text: 'SETTING… ' + Math.round(cooling.cool / setT() * 100) + '%', act: () => true, wait: true } : null; }
    const { kind, col } = w.l;
    if (kind === 'taper') { if (rack.layers > 0) return { station: 'dip', p: V3(rack.x, rackY() - 0.3, K.KZ), r: 0.3, text: 'CUT THIS PAIR DOWN (OR DIP IT ON)', act: () => cutRack() }; if (rack.col !== col) return { station: 'dip', p: V3(K.vats[col].x, T + 0.08, K.KZ), r: 0.28, text: 'TAP THE ' + WAX[col].name + ' VAT', act: () => setRackCol(col) }; return { station: 'dip', p: V3(K.vats[col].x, T + 0.08, K.KZ), r: 0.28, text: 'TAP OR SWIPE DOWN TO DIP THE TAPERS', act: () => autoDip() }; }
    const si = slots.findIndex(s => s.kind === kind && (s.st === 'empty' || s.st === 'pour') && (!s.col || s.col === col)), pourMsg = 'HOLD THE MOULD TO POUR · LET GO AT THE GOLD LINE';
    if (si < 0) { if (!slots.some(s => !s.kind)) { const sp = slots.findIndex(s => s.st === 'spill'); if (sp >= 0) return { station: 'pour', p: V3(slots[sp].x, T + 0.2, slots[sp].z), r: 0.24, text: 'TAP THE SPILL TO SCRAPE IT', act: () => pourStart(sp) }; return { station: 'pour', p: V3(slots[0].x, T + 0.2, slots[0].z), r: 0.24, text: 'WAIT FOR A POUR SPOT…', act: () => true, wait: true }; } return { station: 'pour', p: V3(K.moulds[kind].x, T + 0.2, K.moulds[kind].z), r: 0.22, text: 'TAP THE ' + KINDS[kind].name + ' MOULDS', act: () => placeMould(kind) }; }
    if (S.pot !== col) return { station: 'pour', p: V3(K.pots[col].x, T + 0.25, K.pots[col].z), r: 0.2, text: 'TAP THE ' + WAX[col].name + ' WAX POT', act: () => selectPot(col) };
    return { station: 'pour', p: V3(slots[si].x, T + 0.2, slots[si].z), r: 0.24, text: pourMsg, act: () => { if (pourI < 0) pourStart(si); return true; }, pour: si }; }

  // ---------- pointer ----------
  const el = renderer.domElement, ray = new THREE.Raycaster();
  const local = e => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const pxR = (p, r) => { const a = scr(p), b = scr(p.clone().add(V3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(r))); return Math.max(24, Math.hypot(a.x - b.x, a.y - b.y)); };
  function targets() { const t = [], F = S.focus, any = F === 'all';
    if (any || F === 'dip') { Object.entries(K.vats).forEach(([k, v]) => t.push({ kind: 'vat', k, p: V3(v.x, v.y, v.z), r: 0.27 })); t.push({ kind: 'rack', p: V3(rack.x, rackY() - 0.3, K.KZ), r: 0.3 }); }
    if (any || F === 'pour') { Object.entries(K.moulds).forEach(([k, v]) => t.push({ kind: 'mould', k, p: V3(v.x, T + 0.18, v.z), r: 0.2 })); Object.entries(K.pots).forEach(([k, v]) => t.push({ kind: 'pot', k, p: V3(v.x, T + 0.2, v.z), r: 0.18 })); slots.forEach((s, i) => t.push({ kind: 'slot', i, p: V3(s.x, T + 0.15, s.z), r: 0.24 })); }
    if (any || F === 'finish' || F === 'pack') { bench.forEach((b, i) => b.it && t.push({ kind: 'bench', i, p: V3(b.x, T + 0.2, b.z), r: 0.22 })); t.push({ kind: 'remelt', p: V3(K.remelt.x, T + 0.3, K.remelt.z), r: 0.28 }); }
    if (any || F === 'pack' || F === 'finish') crates.forEach((c, i) => c.g && t.push({ kind: 'crate', i, p: V3(c.x, c.y + 0.12, c.z), r: 0.45 }));
    return t; }
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of targets()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y), R = pxR(t.p, t.r); if (d < R && d / R < bd) { bd = d / R; best = t; } } return best; }
  const planeY = new THREE.Plane(V3(0, 1, 0), -(T + 0.35)), hitP = V3();
  function worldAt(x, y, plane = planeY) { ray.setFromCamera({ x: x / CW() * 2 - 1, y: -(y / CHh()) * 2 + 1 }, camera); return ray.ray.intersectPlane(plane, hitP) ? hitP.clone() : null; }
  let down = null;
  function onDown(e) { wake(); S.lastInput = performance.now(); const { x, y } = local(e);
    if (S.phase === 'walk') { tapWorld(x, y); return; }
    if (S.phase !== 'shift' || DM.on || S.react && S.react.t < 0.3) return; e.preventDefault(); try { el.setPointerCapture(e.pointerId); } catch (er) {}
    const t = pickAt(x, y); down = { x, y, t, moved: false, t0: performance.now() };
    if (t && t.kind === 'slot') { const s = slots[t.i]; if (s.st === 'empty' || s.st === 'pour' || s.st === 'spill') { if (pourStart(t.i)) down.pour = true; } }
    if ((!t || t.kind === 'rack' || t.kind === 'vat' && t.k === rack.col) && (S.focus === 'dip' || t && (t.kind === 'rack' || t.kind === 'vat'))) down.dip = { y0: y, d0: rack.dipY };
    if ((!t || t.kind === 'bench') && (S.focus === 'finish' || S.focus === 'pack' || t)) stroke = { x, y }; }
  function onMove(e) { if (!down) return; const { x, y } = local(e), dist = Math.hypot(x - down.x, y - down.y); if (dist > 10) down.moved = true;
    if (down.dip && down.moved && !rack.auto && Math.abs(y - down.y) > Math.abs(x - down.x) * 0.8) { rack.dipY = clamp(down.dip.d0 + (y - down.dip.y0) / (CHh() * 0.28), 0, 1); down.dipping = true; stroke = null; return; }
    const t = down.t; if (t && t.kind === 'bench' && down.moved && !drag) { const it = bench[t.i].it; if (it && ready(it)) { drag = { i: t.i, m: it.m, home: benchPos(t.i) }; stroke = null; } }
    if (drag) { const w = worldAt(x, y); if (w) drag.m.position.set(w.x, T + 0.3, w.z); const hc = pickAt(x, y, ['crate', 'remelt']); drag.over = hc; return; }
    if (stroke && down.moved) { bench.forEach((b, i) => { if (!b.it || b.it.trim) return; const w = scr(benchPos(i).add(V3(0, b.it.m.userData.wy + 0.08, 0))), R = pxR(benchPos(i), 0.16); if (segDist(stroke.x, stroke.y, x, y, w.x, w.y) < R && Math.abs(x - stroke.x) > 4) trim(i); }); stroke = { x, y }; } }
  function onUp(e) { if (!down) return; const d = down; down = null; stroke = null; try { el.releasePointerCapture(e.pointerId); } catch (er) {}
    if (d.pour) { pourStop(); return; }
    if (d.dipping) { if (rack.dipY < 0.5) rack.dipY = 0; else { rack.auto = { t: 0.42 }; } return; }
    if (drag) { const { x, y } = local(e), hit = pickAt(x, y, ['crate', 'remelt']), dr = drag; drag = null; if (hit && hit.kind === 'crate' && pack(dr.i, hit.i)) return; if (hit && hit.kind === 'remelt' && remelt(dr.i)) return; slide(dr.m, dr.m.position, dr.home, 0.25); return; }
    if (d.moved) return; const t = d.t;
    if (!t) { if (S.focus === 'dip') autoDip(); return; }
    if (t.kind === 'vat') { if (t.k === rack.col) autoDip(); else setRackCol(t.k); }
    else if (t.kind === 'rack') autoDip();
    else if (t.kind === 'mould') placeMould(t.k);
    else if (t.kind === 'pot') selectPot(t.k);
    else if (t.kind === 'slot') { if (slots[t.i].st === 'set') unmould(t.i); else if (slots[t.i].st === 'cool') flash('STILL SETTING…', '#ffffff', 0.7); }
    else if (t.kind === 'bench') { const it = bench[t.i].it; if (!it) return; if (!it.trim) flash('SWIPE ACROSS THE WICK TO TRIM', '#ffffff', 1); else if (!it.stamp) stamp(t.i); else { S.sel = S.sel === t.i ? null : t.i; SFX.select(); } }
    else if (t.kind === 'crate') { if (S.sel != null) pack(S.sel, t.i); else flash('TAP A FINISHED CANDLE, THEN THE CRATE', '#ffffff', 1.1); }
    else if (t.kind === 'remelt') { if (S.sel != null) remelt(S.sel); else flash('DRAG A CANDLE HERE TO REMELT IT', '#ffffff', 1); } }
  function segDist(ax, ay, bx, by, px, py) { const dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy || 1, t = clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1); return Math.hypot(ax + dx * t - px, ay + dy * t - py); }
  // walk mode: tap a sconce / display candle to light or snuff it, tap Opa to talk
  function tapWorld(x, y) { let best = null, bd = 1e9; K.sconces.forEach(f => { const p = f.g.getWorldPosition(V3()); const s = scr(p); if (s.z > 1) return; const d = Math.hypot(s.x - x, s.y - y); if (d < Math.max(30, pxR(p, 0.25)) && d < bd) { bd = d; best = f; } });
    const op = scr(opa.position.clone().add(V3(0, 1.3, 0))); if (Math.hypot(op.x - x, op.y - y) < pxR(opa.position.clone().add(V3(0, 1.3, 0)), 0.8) && nearOpa()) { talk(); return; }
    if (best) { best.lit = !best.lit; best.g.visible = best.lit; const p = best.g.getWorldPosition(V3()); if (best.lit) { SFX.light(); sparkle(p, 3); } else { puff(p.x, p.y + 0.1, p.z, 0xcccccc, 2); SFX.snuff(); } S.toast = best.lit ? 'LIT A CANDLE' : 'SNUFFED IT'; S.toastT = 1.2; } }
  el.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- DEMO (autopilot that plays the shift with captions) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', served: 0, day0: 1, pourTo: -1 };
  const hand = new THREE.Group(); { const m = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false })); m.renderOrder = 32; hand.add(m); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthTest: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.5); s.renderOrder = 31; hand.add(s); hand.visible = false; scene.add(hand); }
  const KEYS = { dip: 'DIP', pour: 'POUR', finish: 'FINISH', pack: 'PACK' };
  function demoStart() { if (DM.on) return; wake(); DM.on = true; DM.served = 0; DM.cd = 1.8; DM.day0 = S.day; S.day = Math.max(S.day, 2); DM.cap = "WATCH A SHIFT AT OPA'S CANDLE WORKS"; DM.key = ''; S.demo = true; S.phase = 'intro'; startShift(); S.next = 0.6; }
  function demoStop() { if (!DM.on) return; DM.on = false; SND.music.setMode('calm'); S.demo = false; hand.visible = false; pourStop(); S.day = DM.day0; resetLine(); K.back.forEach(m => m.visible = true); opa.position.set(K.opaWalk.x, 0, K.opaWalk.z); S.phase = 'intro'; S.done = null; S.react = null; ben.visible = true; glideTo(introShot(), 1.0); }
  function demoStep(dt) { if (S.phase !== 'shift') return; if (DM.pourTo >= 0) { const s = slots[DM.pourTo]; if (!s || s.fill >= 0.795 || s.st !== 'pour') { DM.pourTo = -1; pourStop(); DM.cd = 1.0; } return; }
    DM.cd -= dt; if (DM.cd > 0) return; const h = plan(); if (!h) { DM.cap = orders.length ? 'WAITING FOR THE NEXT ORDER…' : 'THE TEMPLE FOLK ARE ON THEIR WAY…'; DM.key = ''; DM.cd = 0.5; hand.visible = false; return; }
    S.focus = h.station; DM.cap = h.text; DM.key = KEYS[h.station] || ''; hand.visible = true; hand.position.copy(h.p).add(V3(0, 0.05, 0)); if (h.wait) { DM.cd = 0.3; return; }
    if (h.pour != null) { pourStart(h.pour); DM.pourTo = h.pour; return; } const ok = h.act(); DM.cd = h.station === 'dip' && /DIP/.test(h.text) ? 0.25 : 1.15; if (ok === false) DM.cd = 0.6; }

  // ---------- frame ----------
  function step(dt) {
    S.t += dt; hintT += dt; if (S.flash && (S.flash.t -= dt) <= 0) S.flash = null; if (S.sayT > 0 && (S.sayT -= dt) <= 0) S.say = ''; if (S.toastT > 0 && (S.toastT -= dt) <= 0) S.toast = null;
    // flames flicker
    for (const f of K.flames) { if (!f.lit) continue; f.ph += dt * (7 + f.s); const k = 1 + Math.sin(f.ph) * 0.08 + Math.sin(f.ph * 2.7) * 0.05; f.c.scale.set(1, k, 1); f.glow.material.opacity = (f.big ? 0.75 : 0.5) + Math.sin(f.ph * 1.3) * 0.08; }
    shrineL.intensity = 1.5 + Math.sin(S.t * 6) * 0.1 + Math.sin(S.t * 13) * 0.06;
    for (let i = anims.length - 1; i >= 0; i--) { const a = anims[i]; a.t += dt / a.dur; const k = Math.min(1, a.t), p = a.from.clone().lerp(a.to, smooth(0, 1, k)); p.y += Math.sin(k * Math.PI) * 0.2; a.mesh.position.copy(p); if (k >= 1) { anims.splice(i, 1); a.done && a.done(); } }
    for (const p of smokeS) if (p.life > 0) { p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, p.life) * 0.5; p.s.scale.setScalar(0.25 + (1 - p.life) * 0.5); }
    // FX
    FX.steam.forEach(p => { if (p.life <= 0) return; p.life -= dt * 0.55; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, Math.sin(p.life * Math.PI)) * 0.22; p.s.scale.setScalar(0.3 + (1 - p.life) * 0.7); if (p.life <= 0) p.s.visible = false; });
    FX.sparks.forEach(p => { if (p.life <= 0) return; p.life -= dt * 1.4; p.v.y -= dt * 2.4; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, p.life); p.s.scale.setScalar(0.12 + p.life * 0.12); if (p.life <= 0) p.s.visible = false; });
    FX.drips.forEach(d => { if (!d.on) return; if (d.wait > 0) { d.wait -= dt; return; } d.v -= 9.8 * dt; d.m.position.y += d.v * dt; if (d.m.position.y <= d.floor) { d.on = false; d.m.visible = false; const r = FX.ripples.find(q => q.t >= 1); if (r) { r.t = 0; r.m.visible = true; r.m.position.set(d.m.position.x, d.floor + 0.006, d.m.position.z); r.m.material.color.copy(d.m.material.color); } } });
    FX.ripples.forEach(r => { if (r.t >= 1) return; r.t = Math.min(1, r.t + dt * 1.8); r.m.scale.setScalar(0.03 + r.t * 0.17); r.m.material.opacity = (1 - r.t) * 0.8; if (r.t >= 1) r.m.visible = false; });
    FX.steamT -= dt; if (FX.steamT <= 0) { FX.steamT = 0.35; const vs = Object.values(K.vats); const v = vs[Math.floor(Math.random() * vs.length)]; steamAt(v.x, T + 0.15, v.z); if (Math.random() < 0.5) steamAt(K.remelt.x, T + 0.4, K.remelt.z, 0xffd8a0); slots.forEach(q => q.st === 'cool' && Math.random() < 0.6 && steamAt(q.x, T + 0.35, q.z)); }
    { const a = motes.geometry.attributes.position, A2 = a.array; for (let i = 0; i < A2.length; i += 3) { A2[i] += Math.sin(S.t * 0.3 + i) * dt * 0.05; A2[i + 1] += Math.sin(S.t * 0.2 + i * 0.7) * dt * 0.04; A2[i + 2] += Math.cos(S.t * 0.25 + i) * dt * 0.05; } a.needsUpdate = true; motes.material.opacity = 0.4 + Math.sin(S.t * 0.7) * 0.12; }
    { const a = embers.geometry.attributes.position, L = embers.userData.life; for (let i = 0; i < L.length; i++) { L[i] -= dt * 0.45; if (L[i] <= 0) { L[i] = 1; a.array[i * 3] = K.shrine.x + rr(-0.15, 0.15); a.array[i * 3 + 1] = 1.45; a.array[i * 3 + 2] = K.shrine.z + rr(-0.15, 0.15); } a.array[i * 3] += Math.sin(S.t * 3 + i) * dt * 0.12; a.array[i * 3 + 1] += dt * 0.55; } a.needsUpdate = true; }
    rays.forEach((m, i) => m.material.opacity = 0.42 + Math.sin(S.t * 0.4 + i * 1.7) * 0.1);
    SND.update();
    if (stampAnim) { const a = stampAnim; a.t += dt / 0.5; const k = Math.min(1, a.t), dn = Math.sin(Math.min(1, k * 1.6) * Math.PI); stampTool.position.set(a.x, a.y + 0.15 - dn * 0.12, a.z); stampTool.rotation.x = -1.2 * Math.min(1, k * 4) * (1 - Math.max(0, k - 0.75) * 4); if (k >= 1) { stampAnim = null; stampTool.position.copy(K.stampHome); stampTool.rotation.x = 0; } }
    if (S.phase === 'walk') { walkStep(dt); kit.animFox(opa, dt, 0); return; }
    // camera glide / work cam
    if (CAM.to) { CAM.t += dt / CAM.dur; const k = smooth(0, 1, Math.min(1, CAM.t)); camera.position.copy(CAM.from.pos).lerp(CAM.to.pos, k); CAM.look.copy(CAM.from.look).lerp(CAM.to.look, k); if (CAM.t >= 1) { CAM.to = null; if (S.phase === 'glide') S.phase = 'shift'; } }
    else if (S.phase === 'shift') { const sh = workShot(); camera.position.lerp(sh.pos, Math.min(1, dt * 4)); CAM.look.lerp(sh.look, Math.min(1, dt * 4)); }
    else if (S.phase === 'intro' || S.phase === 'done') { const sh = introShot(); camera.position.lerp(sh.pos, Math.min(1, dt * 3)); CAM.look.lerp(sh.look, Math.min(1, dt * 3)); }
    camera.lookAt(CAM.look);
    kit.animFox(opa, dt, 0); kit.animFox(ben, dt, 0);
    if (S.phase === 'intro' || S.phase === 'done') { const o = opa.position; let d = Math.atan2(camera.position.x - o.x, camera.position.z - o.z) + 0.35 - opa.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); opa.rotation.y += d * Math.min(1, dt * 4); opa.userData.mood = 'excited'; }
    if (S.phase !== 'shift' && S.phase !== 'glide') return;
    if (S.react) { S.react.t += dt; if (S.react.t > 2.2) S.react = null; }
    if (S.phase === 'shift') { const pl = S.left; S.left -= dt; if (Math.ceil(S.left) !== Math.ceil(pl) && S.left < 10 && S.left > 0) SFX.tick(S.left < 4); if (S.left < 30 && pl >= 30 && !S.demo) { SND.music.setMode('rush'); flash('30 SECONDS LEFT', '#ffd23a', 1.2); } if (S.left <= 0) { S.left = 0; if (S.demo) { demoStop(); return; } endShift(); return; }
      S.next -= dt; if (S.next <= 0) { newOrder(); S.next = S.demo ? 24 : rr(13, 20) - Math.min(5, S.day); }
      if (!S.say && Math.random() < dt / 14) { S.say = 'OPA: ' + pick(OPA_SAY); S.sayT = 4; } }
    // rack
    if (rack.auto) { const a = rack.auto; a.t += dt; const k = a.t; rack.dipY = k < 0.28 ? smooth(0, 1, k / 0.28) : k < 0.46 ? 1 : k < 0.74 ? 1 - smooth(0, 1, (k - 0.46) / 0.28) : 0; if (k >= 0.74) rack.auto = null; }
    if (!rack.wasIn && rack.dipY > 0.85) dipEnter(); if (rack.wasIn) { rack.inT += dt; if (rack.inT > 1.4 && rack.layers > 0) { rack.layers--; rack.inT = 0.7; flash('HELD TOO LONG · A LAYER MELTED', '#ec3013', 1); SFX.melt(); } if (rack.dipY < 0.15) dipExit(); }
    rack.hot = Math.max(0, rack.hot - dt / (upg('fan') ? 0.7 : 1.05)); placeRack(dt);
    setLabel(rackLab, rack.layers ? (rack.hot > 0.32 ? 'HOT · WAIT' : rack.layers + ' / ' + TARGET + ' LAYERS') : '', rack.hot > 0.32 ? '#ec3013' : rack.layers >= TARGET ? '#22c55e' : '#ffd23a', V3(rack.x, rackY() + 0.22, K.KZ));
    // pour
    for (const k in K.pots) { const P = K.pots[k], sel = S.pot === k; P.g.position.y = damp(P.g.position.y, T + 0.06 + (sel ? 0.1 : 0), 10, dt); }
    if (pourI >= 0) { const s = slots[pourI], P = K.pots[s.col]; s.fill += dt * (upg('ladle') ? 0.62 : 0.32); SFX.pour.set(s.fill); P.g.position.set(s.x - 0.22, T + 0.62, s.z); P.g.rotation.z = -0.9; stream.visible = true; stream.material.color.set(WAX[s.col].col); const top = T + 0.66, bot = T + 0.02 + s.fill * s.h; stream.scale.y = Math.max(0.01, top - bot); stream.position.set(s.x - 0.08, (top + bot) / 2, s.z);
      if (s.fill > 1.0) { s.st = 'spill'; s.q = 0; pourI = -1; stream.visible = false; flash('SPILLED · TAP IT TO SCRAPE', '#ec3013', 1.2); SFX.pour.stop(); SFX.spill(); puff(s.x, T + 0.4, s.z, 0xffd8a0, 4); } }
    else for (const k in K.pots) { const P = K.pots[k]; P.g.position.x = damp(P.g.position.x, P.home.x, 10, dt); P.g.position.z = damp(P.g.position.z, P.home.z, 10, dt); P.g.rotation.z = damp(P.g.rotation.z, 0, 10, dt); }
    slots.forEach(s => { if (!s.kind) { s.lab.visible = false; return; } if (s.wax) { s.wax.visible = s.fill > 0.01; s.wax.scale.y = Math.max(0.001, Math.min(1, s.fill) * s.h); s.wax.position.y = Math.min(1, s.fill) * s.h / 2; }
      if (s.st === 'cool') { s.cool += dt; s.wax.material.emissiveIntensity = 0.5 * (1 - s.cool / setT()); if (s.cool >= setT()) { s.st = 'set'; SFX.set(s.kind); } }
      const lp = V3(s.x, T + 0.62, s.z); if (s.st === 'cool') setLabel(s.lab, 'SETTING ' + Math.round(s.cool / setT() * 100) + '%', '#ffd23a', lp); else if (s.st === 'set') setLabel(s.lab, 'TAP ▸ UNMOULD', '#22c55e', lp); else if (s.st === 'spill') setLabel(s.lab, 'SPILL · TAP', '#ec3013', lp); else if (s.st === 'pour') setLabel(s.lab, Math.round(s.fill / 0.8 * 100) + '%', '#ffd23a', lp); else setLabel(s.lab, s.kind === 'pillar' ? 'PILLAR MOULD' : 'JAR', '#ffffff', lp); });
    // bench: selected candle bobs
    bench.forEach((b, i) => { if (!b.it || (drag && drag.i === i) || anims.some(a => a.mesh === b.it.m)) return; b.it.m.position.y = damp(b.it.m.position.y, T + 0.02 + (S.sel === i ? 0.12 : 0), 10, dt); });
    // customers
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot], f = o.f; let mv = 0;
      if (o.st === 'walk') { const dx = sp.x - f.position.x, dz = sp.z - f.position.z, d = Math.hypot(dx, dz); if (d < 0.08) { o.st = 'wait'; S.say = CUSTOMERS[o.ci].name + ': ' + o.say; S.sayT = 3; } else { const v = Math.min(d, 3.2 * dt); f.position.x += dx / d * v; f.position.z += dz / d * v; f.rotation.y = Math.atan2(dx, dz); mv = 3.2; } }
      else if (o.st === 'wait') { f.rotation.y = damp(f.rotation.y, Math.PI, 6, dt); f.userData.mood = o.pat / o.patMax < 0.3 ? 'angry' : 'happy'; o.pat -= dt; if (o.pat <= 0) walkOut(o); }
      else if (o.st === 'leave') { const dx = K.door.x - f.position.x, dz = K.door.z - f.position.z, d = Math.hypot(dx, dz); if (d < 0.2) { f.visible = false; if (o.carry) { f.remove(o.carry); o.carry = null; } orders.splice(i, 1); continue; } const v = Math.min(d, 3.4 * dt); f.position.x += dx / d * v; f.position.z += dz / d * v; f.rotation.y = Math.atan2(dx, dz); mv = 3.4; }
      kit.animFox(f, dt, mv); }
    if (DM.on) demoStep(dt);
    HINT = DM.on ? null : plan(); RINGS.place(HINT && !S.react && !drag ? HINT : null, hintT, dt); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const KMAP = { Digit1: 'melee', Digit2: 'range', Space: 'jump', KeyE: 'talk' };
  const onKD = e => { if (S.phase === 'walk') { if (KMAP[e.code]) { e.preventDefault(); if (!e.repeat) api[KMAP[e.code]](); return; } keys.add(e.code); return; }
    if (S.phase === 'shift' && !DM.on) { const fk = { Digit1: 'dip', Digit2: 'pour', Digit3: 'finish', Digit4: 'pack', Digit0: 'all' }[e.code]; if (fk) setFocus(fk); if (e.code === 'Space' && S.focus === 'dip') { e.preventDefault(); autoDip(); } } };
  const onVis = () => { const h = document.hidden; SND.suspend(h); if (h) SFX.pour.stop(); }; document.addEventListener('visibilitychange', onVis);
  const onKU = e => keys.delete(e.code), onBlur = () => keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- HUD state ----------
  function hud() { const A = avail(), working = S.phase === 'shift' || S.phase === 'glide';
    const badges = {}; if (working) { badges.dip = rack.layers ? (rack.hot > 0.32 ? 'HOT' : rack.layers >= TARGET ? 'CUT ▸' : rack.layers + '/' + TARGET) : ''; const ss = slots.find(s => s.st === 'set'), sc = slots.find(s => s.st === 'cool'), sp = slots.find(s => s.st === 'spill'); badges.pour = sp ? 'SPILL' : ss ? 'SET ▸' : sc ? 'SETTING' : '';
      const nt = bench.filter(b => b.it && !ready(b.it)).length, nr = bench.filter(b => ready(b.it)).length; badges.finish = nt ? nt + ' TO DO' : ''; badges.pack = nr ? nr + ' READY' : ''; if (HINT && !DM.on && HINT.station !== S.focus) badges[HINT.station] = 'NEXT ▸'; }
    return { phase: S.phase, day: S.day, left: S.left, earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? (S.starList.reduce((a, b) => a + b, 0) / S.starList.length).toFixed(1) : null,
      orders: orders.filter(o => o.st !== 'leave').map(o => ({ name: CUSTOMERS[o.ci].name, role: CUSTOMERS[o.ci].role, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait', total: o.total, lines: o.lines.map(l => ({ t: WAX[l.col].name.replace('GATE ', '') + ' ' + KINDS[l.kind].name, done: l.done, col: WAX[l.col].col })) })),
      focus: S.focus, badges, hint: HINT && !DM.on ? { station: HINT.station, text: HINT.text } : null, flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, toast: S.toast || null,
      dip: working && (S.focus === 'dip' || rack.layers > 0 && S.focus === 'all') ? { col: WAX[rack.col].name, colHex: WAX[rack.col].col, layers: rack.layers, target: TARGET, hot: rack.hot, sag: rack.sag, canCut: rack.layers > 0 && rack.dipY < 0.05 } : null,
      pour: working && pourI >= 0 ? { fill: slots[pourI].fill, line: 0.8, col: WAX[slots[pourI].col].name, kind: KINDS[slots[pourI].kind].name } : null, pot: S.pot ? WAX[S.pot].name : null, potHex: S.pot ? WAX[S.pot].col : null,
      sel: S.sel != null && bench[S.sel].it ? itemName(bench[S.sel].it.kind, bench[S.sel].it.col) : null,
      making: [...new Set(A.kinds.flatMap(k => A.cols.map(c => itemName(k, c))))].length, kinds: A.kinds.map(k => KINDS[k].name), cols: A.cols.map(c => WAX[c].name), uniform: save.flag('gayaCandleUniform'),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served } : null, nearOpa: S.phase === 'walk' && nearOpa(), nearDoor: S.phase === 'walk' && !nearOpa() && nearDoor(), muted: SND.muted, best: save.stat(SAVE.best, 0) }; }
  function emit() { onState(hud()); }
  ben.visible = true; ben.position.set(K.opaWalk.x + 1.15, 0, K.opaWalk.z - 0.95); ben.rotation.y = 0.55; glideTo(introShot(), 0.01); frame();
  const api = { toast(t, d = 2.5) { S.toast = t; S.toastT = d; }, startShift, endShift, toIntro, lookAround, talk, setFocus, buyUpgrade, demoStart, demoStop, cutRack, autoDip, setRackCol, selectPot, placeMould, pourStart, pourStop, unmould, trim, stamp, pack, remelt, hud,
    setSafe(top, bottom, left) { setSafe(top, bottom, left); },
    // ENGINE CONTRACT for Game HUD (walk mode)
    start() {}, choose() {}, closeDialog() {}, nextLine() {}, clearToast() { S.toast = null; }, closeWheel() {}, skipTime() {}, setHudPad() {}, setMinimap() {}, cycleWeather() {},
    melee() { if (S.phase !== 'walk') return; if (nearOpa()) talk(); else { S.toast = 'NO SWORDS IN THE CANDLE WORKS'; S.toastT = 1.4; } }, meleeUp() {},
    range() { if (S.phase !== 'walk') return; if (nearOpa()) talk(); else { const f = K.sconces.filter(s => !s.lit).sort((a, b) => a.g.getWorldPosition(V3()).distanceTo(ben.position) - b.g.getWorldPosition(V3()).distanceTo(ben.position))[0]; if (f && f.g.getWorldPosition(V3()).distanceTo(ben.position) < 3.5) { f.lit = true; f.g.visible = true; SFX.light(); S.toast = 'LIT A CANDLE'; S.toastT = 1.2; } else { S.toast = 'TAP A CANDLE TO LIGHT IT'; S.toastT = 1.4; } } },
    jump() { if (S.phase === 'walk' && jumpY === 0) { jumpV = 5.2; jumpY = 0.001; SFX.jump(); } },
    useItem() { S.toast = 'SAVE IT FOR OUTSIDE'; S.toastT = 1.2; }, setStick(x, y) { stick.x = x; stick.y = y; }, setPaused(v) { PAUSE = !!v; },
    eyeLook(dx) { WC.eye = 1; WC.look = clamp(WC.look + dx * 0.01, -2.5, 2.5); }, eyeRelease() { WC.eye = 0; }, togglePov() { return false; },
    lookBy(dx, dy) { WC.yaw -= dx * 0.006; WC.pitch = clamp(WC.pitch + (dy || 0) * 0.004, 0.12, 1.0); }, zoomBy(d) { WC.dist = clamp(WC.dist * (d > 0 ? 1.1 : 0.9), 3, 7.5); }, getCam() { return { dist: WC.dist, pitch: WC.pitch }; }, setCam(dist, pitch) { if (dist) WC.dist = clamp(dist, 3, 7.5); if (pitch != null) WC.pitch = clamp(pitch, 0.12, 1.0); },
    toggleSound() { SND.setMuted(!SND.muted); }, setMuted(v) { SND.setMuted(v); }, isMuted: () => SND.muted,
    mapData() { return { p: [ben.position.x, ben.position.z, ben.rotation.y], b: [['DIP VATS', 4.4, K.KZ], ['POUR', 1.2, K.KZ], ['FINISH', -2.0, K.KZ], ['PICKUP', 0, K.PZ], ['SHRINE', K.shrine.x, K.shrine.z], ['DOOR', K.door.x, K.door.z]], f: [[opa.position.x, opa.position.z]], e: [], q: [opa.position.x, opa.position.z, 'KEEPER OPA'] }; },
    _state: () => S, _intro: () => { const sh = introShot(); return { pos: sh.pos.toArray(), look: sh.look.toArray(), safe: { ...SAFE }, cam: camera.position.toArray(), ben: ben.position.toArray(), opa: opa.position.toArray() }; }, _rack: rack, _slots: slots, _bench: bench, _orders: orders, _plan: plan, _scr: p => scr(p), _K: K, _ben: ben,
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis); SND.music.setMode('off'); SFX.pour.stop(); el.removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
