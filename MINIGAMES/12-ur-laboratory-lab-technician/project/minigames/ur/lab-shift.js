// 8 GATES — UR LABORATORY [urLab]. Ben works as a lab technician for Dr. Adapa. Kish signs the samples in at the desk.
// Job location like Jon's Boatworks: one sample at a time, no clock, scored on quality. 3 samples = a day.
// Townsfolk walk in with a sample → Ben works the JOB CARD → FILE REPORT → the client reacts (BRILLIANT / HAPPY / OKAY / GRUMPY), pays + tips → walks out.
// Tasks, one touch gesture each:
//   PIPETTE  hold to draw the sample, let go in the green (the card says how many mL)
//   MIX      tap the reagent bottles to drip the card's recipe, then swipe back and forth to shake the flask
//   HEAT     hold to turn the burner up, let go to cool; keep the thermometer in the green until the bar fills
//   SPIN     draw circles to spin the centrifuge up; hold the speed in the green
//   SCOPE    drag up/down to focus the microscope, then tap every cell the card asks you to count
// PIPETTE comes first: everything else needs the sample.
// WALK MODE: between shifts Ben walks around the lab with the standard Game HUD (talk to Adapa and Kish, spin the orrery, try the north door).
// Save keys ur.labjob.*, flags urLabCoat (uniform) + urLabShift1. Built on engine/restaurant-kit.js (stage, camera fit, hint rings).
// MERGE: buildLab(ctx) builds the room at an origin (with walk solids + interact spots); createLabShift({ container, onState }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { PLAYER_FEMALE } from '../../fox-kit.js';
import { createStage, cameraFit, hintRings } from '../../engine/restaurant-kit.js';

export const LAB = { name: 'UR LABORATORY', room: 'urLab', world: 'Ur', perDay: 3, w: 16, d: 12, h: 4.2 };
export const REAGENTS = { blue: { name: 'BLUE', col: '#2f7fd8' }, yellow: { name: 'YELLOW', col: '#f2c94c' }, red: { name: 'RED', col: '#e2453f' }, clear: { name: 'CLEAR', col: '#d9f2f2' } };
const RK = Object.keys(REAGENTS);
export const TASKS = { pipette: { label: 'PIPETTE', name: 'Draw the sample' }, mix: { label: 'MIX', name: 'Mix the reagents' }, heat: { label: 'HEAT', name: 'Heat it on the burner' }, spin: { label: 'SPIN', name: 'Spin it in the centrifuge' }, scope: { label: 'SCOPE', name: 'Count cells under the microscope' } };
const ORDER = ['pipette', 'mix', 'heat', 'spin', 'scope'];
export const CELLS = { blob: { name: 'GREEN BLOBS', one: 'GREEN BLOB', col: '#5fbf4a' }, spiky: { name: 'PURPLE SPIKIES', one: 'PURPLE SPIKY', col: '#9b5de5' }, rod: { name: 'ORANGE RODS', one: 'ORANGE ROD', col: '#f08a24' }, chip: { name: 'METAL CHIPS', one: 'METAL CHIP', col: '#9aa4b0' }, shard: { name: 'BLUE SHARDS', one: 'BLUE SHARD', col: '#38bdf8' } };
export const SAMPLES = {
  lake: { name: 'LAKE WATER', col: '#7fbf3a', price: 14, cells: ['blob', 'rod', 'chip'] },
  pond: { name: 'POND WATER', col: '#4a9a8a', price: 12, cells: ['blob', 'spiky', 'rod'] },
  runoff: { name: 'OUTFALL RUNOFF', col: '#a8c838', price: 16, cells: ['chip', 'rod', 'spiky'] },
  espresso: { name: 'ESPRESSO', col: '#6a3c1c', price: 10, cells: ['rod', 'blob'] },
  clay: { name: 'TABLET DUST', col: '#c8643c', price: 12, cells: ['shard', 'blob'] },
  scale: { name: 'SCALE SCRAPING', col: '#8aa05a', price: 18, cells: ['chip', 'spiky', 'shard'] },
  ale: { name: 'TAVERN ALE', col: '#d9a23a', price: 10, cells: ['blob', 'rod'] },
  well: { name: 'WELL WATER', col: '#8fd3e8', price: 10, cells: ['blob', 'shard'] } };
const HEATS = [['WARM', 40, 55], ['SIMMER', 52, 66], ['HOT', 65, 80]];
const SPINS = [['LOW', 0.32, 0.52], ['MEDIUM', 0.48, 0.7], ['HIGH', 0.66, 0.86]];
export const UPGRADES = [
  { id: 'pipette', name: 'STEADY PIPETTE', cost: 35, line: 'The green line on the pipette is twice as wide.' },
  { id: 'stirrer', name: 'MAGNETIC STIRRER', cost: 30, line: 'Flasks mix in half the shakes.' },
  { id: 'burner', name: 'DIGITAL BURNER', cost: 40, line: 'The temperature moves slower, easier to hold.' },
  { id: 'turbo', name: 'TURBO CENTRIFUGE', cost: 35, line: 'Every circle spins it up twice as much.' },
  { id: 'focus', name: 'AUTO-FOCUS SCOPE', cost: 45, line: 'The microscope starts almost sharp.' },
  { id: 'radio', name: 'LAB RADIO', cost: 60, line: 'Clients tip 25% more.' }];
const CLIENTS = [
  { name: 'ILKU', role: 'HAULER', sample: 'lake', fur: '#c9682a', furDark: '#8a4213', torso: ['#8a5a32', '#e6b45a', '#5a3a1c'], outfit: 'vest', line: 'From the far end of the lake. Dr. Adapa wants it done properly this time.' },
  { name: 'BEL-SHUNU', role: 'HUNTER', sample: 'pond', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#4f6b3a', '#c9b48a', '#2f4224'], outfit: 'coat', line: 'The pond by my hut has gone a funny colour. Tell me it is nothing.' },
  { name: 'NANSHE', role: 'PICKET', sample: 'runoff', torso: ['#e2453f', '#fbf8ec', '#a82c26'], outfit: 'vest', line: 'Straight off the outfall pipe. We want the result in writing.' },
  { name: 'KU-BAU', role: 'COFFEE', sample: 'espresso', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#5a3418', '#f2e3c6', '#3a200c'], outfit: 'vest', line: 'A customer says my espresso is alive. It is not. Prove it.' },
  { name: 'ENHEDU', role: 'ARCHIVIST', sample: 'clay', fur: '#9a9a9e', furDark: '#6a6a70', torso: ['#7a5aa8', '#e6d8f2', '#4a3470'], outfit: 'robe', line: 'Scraped off a tablet in the stacks. Gently. It is older than the city.' },
  { name: 'NAMMU', role: 'PEN HAND', sample: 'scale', torso: ['#3f5d47', '#e6b45a', '#2b4232'], outfit: 'vest', line: 'Off one of the runners. It shed in the pens. Wear the gloves.' },
  { name: 'SABRA', role: 'TAVERN', sample: 'ale', fur: '#e8a355', furDark: '#b8762c', torso: ['#c42d3c', '#f2e3c6', '#7f1d1d'], outfit: 'dress', line: 'Somebody says my ale is cloudy. Somebody is wrong.' },
  { name: 'SHALA', role: 'REGULAR', sample: 'well', torso: ['#2f9a8f', '#f2d970', '#1f6a62'], outfit: 'vest', line: 'From the square well. My tea tastes of pennies.' }];
const REACT = {
  thrilled: { word: 'BRILLIANT!', col: '#22c55e', mood: 'excited', lines: ['Clean bench, clean result. Adapa should give you her job.', 'Now THAT is a lab report. Every number filled in.', 'I can read every word of it. Thank you!'] },
  happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Good work. That answers it.', 'Thank you, that is what I needed.', 'Clear as the clean lake.'] },
  okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['Some of these numbers look guessed.', 'Hmm. It will do, I suppose.', 'There is a smudge where the result should be.'] },
  grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half of this report is blank!', 'I could have done this with a bucket.', 'Kish would have done better, and Kish is a desk.'] } };
const SAVE = { day: 'ur.labjob.day', best: 'ur.labjob.best', upg: 'ur.labjob.upg.', stars: 'ur.labjob.stars' };
const TOP = 0.95; // bench top height

// ======================================================================================
// THE ROOM. buildLab(ctx) → { root, st (stations), spots, solids, spots of interest, animate(t, dt) }
// Everything is placed in the root group's LOCAL space; a world drops the root at its origin.
// ======================================================================================
export function buildLab(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const L = { root, st: {}, anim: [], bubbles: [], tanks: [] };
  const ink = toon('#201e1d'), brass = toon('#d9a441'), brassD = toon('#a8792e'), white = toon('#f4f1ea'), slate = toon('#3a3f47'), terra = toon('#c8643c'), terraD = toon('#9a4a2a'), wood = toon('#8a5a32'), woodD = toon('#5a3a1c'), cream = toon('#f2e3c6');
  const glass = new T3.MeshToonMaterial({ color: '#cfeff2', transparent: true, opacity: 0.32, gradientMap: ctx.grad, depthWrite: false });
  L.glass = glass;
  const B = (w, h, d, mat, x, y, z, o = 0.015, parent = root) => M(new T3.BoxGeometry(w, h, d), mat, x, y, z, parent, o);
  const C = (rt, rb, h, mat, x, y, z, o = 0.01, parent = root, seg = 16) => M(new T3.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, parent, o, Math.max(rt, rb));
  const plane = (w, h, tex, x, y, z, ry = 0, basic = true) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), basic ? new T3.MeshBasicMaterial({ map: tex, transparent: true }) : new T3.MeshToonMaterial({ map: tex, gradientMap: ctx.grad })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
  const W2 = LAB.w / 2, D2 = LAB.d / 2;

  // ---------- floor: cream tiles, terracotta border, the U crest in the middle ----------
  const tileT = CTX(256, 256, c => { c.fillStyle = '#e9e1cf'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#f3ecdc'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if ((x + y) % 2) c.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); c.fillStyle = '#c9bfa8'; for (let i = 0; i <= 4; i++) { c.fillRect(i * 64 - 1, 0, 2, 256); c.fillRect(0, i * 64 - 1, 256, 2); } });
  tileT.wrapS = tileT.wrapT = T3.RepeatWrapping; tileT.repeat.set(LAB.w / 2, LAB.d / 2);
  const floor = new T3.Mesh(new T3.PlaneGeometry(LAB.w, LAB.d), new T3.MeshToonMaterial({ map: tileT, gradientMap: ctx.grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; root.add(floor);
  for (const [x, z, w, d] of [[0, -D2 + 0.2, LAB.w, 0.4], [0, D2 - 0.2, LAB.w, 0.4], [-W2 + 0.2, 0, 0.4, LAB.d], [W2 - 0.2, 0, 0.4, LAB.d]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, d), terra); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.004, z); m.receiveShadow = true; root.add(m); }
  const crestT = CTX(256, 256, c => { c.fillStyle = '#c8643c'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = '#eab308'; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 110, 0, 7); c.stroke(); c.fillStyle = '#eab308'; c.font = '900 150px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('U', 128, 138); });
  { const m = new T3.Mesh(new T3.CircleGeometry(1.0, 40), new T3.MeshToonMaterial({ map: crestT, gradientMap: ctx.grad, transparent: true })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.006, 2.4); root.add(m); }

  // ---------- walls: clay-brick lower half, cream plaster above, brass rail ----------
  const brickT = CTX(256, 128, c => { c.fillStyle = '#b5532e'; c.fillRect(0, 0, 256, 128); for (let y = 0; y < 8; y++) for (let x = -1; x < 9; x++) { c.fillStyle = (x * 7 + y * 3) % 5 ? '#c0603a' : '#a84a28'; c.fillRect(x * 32 + (y % 2) * 16 + 1, y * 16 + 1, 30, 14); } });
  brickT.wrapS = T3.RepeatWrapping;
  const plastT = CTX(128, 128, c => { c.fillStyle = '#f2e3c6'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#ead6b2'; for (let i = 0; i < 40; i++) c.fillRect((i * 37) % 128, (i * 53) % 128, 6, 2); });
  plastT.wrapS = plastT.wrapT = T3.RepeatWrapping;
  const wall = (len, x, z, ry, hLow = 1.3, hTop = LAB.h) => { const bt = brickT.clone(); bt.needsUpdate = true; bt.repeat.set(len / 2.4, 1); const pt = plastT.clone(); pt.needsUpdate = true; pt.repeat.set(len / 2, 1.5);
    const lo = new T3.Mesh(new T3.PlaneGeometry(len, hLow), new T3.MeshToonMaterial({ map: bt, gradientMap: ctx.grad })); lo.position.set(x, hLow / 2, z); lo.rotation.y = ry; root.add(lo);
    const hi = new T3.Mesh(new T3.PlaneGeometry(len, hTop - hLow), new T3.MeshToonMaterial({ map: pt, gradientMap: ctx.grad })); hi.position.set(x, hLow + (hTop - hLow) / 2, z); hi.rotation.y = ry; root.add(hi);
    const rail = B(len, 0.08, 0.06, brass, x, hLow, z, 0.006); rail.rotation.y = ry; return [lo, hi, rail]; };
  wall(LAB.w, 0, -D2, 0); L.westWall = wall(LAB.d, -W2, 0, Math.PI / 2); L.eastWall = wall(LAB.d, W2, 0, -Math.PI / 2);
  // south: low wall with the doorway (cut away so the camera can look in)
  L.front = [];
  for (const s of [-1, 1]) { const len = W2 - 1.0; const m = B(len, 0.9, 0.2, terraD, s * (1.0 + len / 2), 0.45, D2 - 0.1, 0.012); L.front.push(m); L.front.push(B(len, 0.06, 0.26, brass, s * (1.0 + len / 2), 0.92, D2 - 0.1, 0.004)); }
  for (const s of [-1, 1]) L.front.push(B(0.2, 1.1, 0.3, terraD, s * 1.05, 0.55, D2 - 0.1, 0.012));

  // ---------- north wall: shelves (west), the NORTH DOOR (middle), specimen tanks (east) ----------
  const signT = (txt, bg, fg, w = 1024, h = 160, size = 92) => CTX(w, h, c => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = fg; c.fillRect(0, 0, w, 10); c.fillRect(0, h - 10, w, 10); c.font = '900 ' + size + 'px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 4); });
  plane(5.2, 0.8, signT('UR LABORATORY', '#2a1606', '#eab308'), 0, 3.55, -D2 + 0.03);
  // north door
  B(1.5, 2.5, 0.12, toon('#2f4f5a'), 0, 1.25, -D2 + 0.08, 0.015); B(1.7, 0.16, 0.18, brassD, 0, 2.55, -D2 + 0.1, 0.01);
  for (const s of [-1, 1]) B(0.12, 2.6, 0.18, brassD, s * 0.8, 1.3, -D2 + 0.1, 0.01);
  plane(1.2, 0.34, signT('EMPLOYEES ONLY', '#ec3013', '#ffffff', 512, 140, 56), 0, 1.75, -D2 + 0.15);
  C(0.05, 0.05, 0.08, brass, 0.55, 1.1, -D2 + 0.18, 0.006).rotation.x = Math.PI / 2;
  L.doorLamp = M(new T3.SphereGeometry(0.09, 10, 8), new T3.MeshBasicMaterial({ color: 0xff3a2a }), 0, 2.85, -D2 + 0.12, root, 0.006);
  // shelves
  const bottleCols = ['#2f7fd8', '#f2c94c', '#e2453f', '#86d44e', '#9b5de5', '#f08a24', '#d9f2f2', '#38bdf8'];
  for (let r = 0; r < 3; r++) { B(5.0, 0.06, 0.45, wood, -4.4, 0.9 + r * 0.75, -D2 + 0.25, 0.01); for (let i = 0; i < 11; i++) { const x = -6.6 + i * 0.42 + (r % 2) * 0.12, col = bottleCols[(i * 3 + r * 5) % bottleCols.length], tall = (i + r) % 3 === 0;
    if ((i + r * 2) % 4 === 3) { C(0.11, 0.11, 0.22, glass, x, 0.93 + r * 0.75 + 0.11, -D2 + 0.27, 0.006); C(0.09, 0.09, 0.12, toon(col), x, 0.93 + r * 0.75 + 0.07, -D2 + 0.27, 0); C(0.115, 0.115, 0.04, brass, x, 0.93 + r * 0.75 + 0.24, -D2 + 0.27, 0); }
    else { C(0.07, 0.08, tall ? 0.34 : 0.24, toon(col), x, 0.93 + r * 0.75 + (tall ? 0.17 : 0.12), -D2 + 0.28, 0.006); C(0.03, 0.03, 0.08, toon('#f4f1ea'), x, 0.93 + r * 0.75 + (tall ? 0.38 : 0.28), -D2 + 0.28, 0); } } }
  for (const x of [-6.85, -1.95]) B(0.08, 2.4, 0.45, woodD, x, 1.2, -D2 + 0.25, 0.008);
  // specimen tanks: brass bases, green liquid, something asleep inside; bubbles rise
  [[2.3, false], [3.7, false], [5.1, true]].forEach(([x, eyes], i) => { const z = -D2 + 0.65, g = new T3.Group(); g.position.set(x, 0, z); root.add(g);
    C(0.55, 0.6, 0.35, brassD, 0, 0.175, 0, 0.012, g, 20); C(0.55, 0.55, 0.12, brass, 0, 2.55, 0, 0.012, g, 20);
    const liq = C(0.47, 0.47, 2.0, new T3.MeshBasicMaterial({ color: 0x6be36b, transparent: true, opacity: 0.28, depthWrite: false }), 0, 1.35, 0, 0, g, 20);
    const sil = new T3.Group(); sil.position.set(0, 1.2, 0); g.add(sil); const dark = new T3.MeshBasicMaterial({ color: 0x1d3a24, transparent: true, opacity: 0.75 });
    const body = new T3.Mesh(new T3.CapsuleGeometry(0.16, 0.6, 4, 10), dark); sil.add(body); const head = new T3.Mesh(new T3.SphereGeometry(0.15, 10, 8), dark); head.position.set(0, 0.5, 0.06); head.scale.z = 1.4; sil.add(head);
    const tail = new T3.Mesh(new T3.ConeGeometry(0.07, 0.6, 6), dark); tail.position.set(0, -0.55, -0.1); tail.rotation.x = Math.PI + 0.3; sil.add(tail);
    let eyeM = null; if (eyes) { eyeM = new T3.MeshBasicMaterial({ color: 0xffe14a, transparent: true, opacity: 0.0 }); for (const s of [-1, 1]) { const e = new T3.Mesh(new T3.SphereGeometry(0.025, 6, 4), eyeM); e.position.set(s * 0.06, 0.53, 0.25); sil.add(e); } }
    C(0.5, 0.5, 2.1, glass, 0, 1.4, 0, 0.012, g, 20);
    L.tanks.push({ g, sil, eyeM, ph: i * 2.1 });
    for (let k = 0; k < 5; k++) { const b = new T3.Mesh(new T3.SphereGeometry(0.035, 6, 4), new T3.MeshBasicMaterial({ color: 0xd8ffd8, transparent: true, opacity: 0.7 })); b.position.set(rr(-0.3, 0.3), rr(0.4, 2.3), rr(-0.3, 0.3)); g.add(b); L.bubbles.push(b); } });
  // brass pipes along the north wall top
  for (const y of [3.05, 3.2]) { const p = C(0.045, 0.045, LAB.w - 0.4, brassD, 0, y, -D2 + 0.12, 0.006, root, 8); p.rotation.z = Math.PI / 2; }

  // ---------- THE BENCH: white cabinets, slate top, a riser for the reagents ----------
  const bx0 = -3.9, bx1 = 3.9, bz = -1.6, bd = 0.95;
  B(bx1 - bx0, TOP - 0.06, bd, white, 0, (TOP - 0.06) / 2, bz, 0.02);
  for (let x = bx0 + 0.65; x < bx1; x += 1.3) { B(1.18, 0.7, 0.02, cream, x, 0.42, bz + bd / 2 + 0.01, 0.006); C(0.03, 0.03, 0.05, brass, x, 0.62, bz + bd / 2 + 0.04, 0.004).rotation.x = Math.PI / 2; }
  B(bx1 - bx0 + 0.1, 0.06, bd + 0.08, slate, 0, TOP - 0.03, bz, 0.012);
  B(bx1 - bx0, 0.5, 0.08, white, 0, TOP + 0.25, bz - bd / 2 + 0.04, 0.012);
  B(bx1 - bx0, 0.04, 0.22, slate, 0, TOP + 0.5, bz - bd / 2 + 0.12, 0.008);
  // stools
  for (const x of [-2.2, 0.1, 2.4]) { C(0.2, 0.2, 0.06, terra, x, 0.62, -0.55, 0.01); C(0.03, 0.03, 0.6, ink, x, 0.3, -0.55, 0); C(0.18, 0.2, 0.03, ink, x, 0.02, -0.55, 0); }

  const stations = L.st;
  // -- PIPETTE station: a rack with the sample vial, the pipette in a clamp stand over it
  { const x = -3.0, z = -1.42, g = new T3.Group(); g.position.set(x, TOP, z); root.add(g);
    B(0.42, 0.08, 0.16, wood, 0, 0.04, 0, 0.008, g); B(0.42, 0.03, 0.16, wood, 0, 0.16, 0, 0.006, g);
    for (const s of [-1, 1]) B(0.03, 0.18, 0.03, woodD, s * 0.19, 0.09, 0, 0, g);
    const vial = C(0.038, 0.038, 0.24, glass, 0.08, 0.14, 0, 0.006, g, 12); const vLiq = C(0.03, 0.03, 0.2, toon('#7fbf3a'), 0.08, 0.04, 0, 0, g, 12); vLiq.geometry.translate(0, 0.1, 0); vLiq.position.y = 0.04; vLiq.visible = false;
    C(0.038, 0.038, 0.24, glass, -0.08, 0.14, 0, 0.006, g, 12);
    // clamp stand
    B(0.22, 0.03, 0.22, ink, -0.24, 0.015, -0.05, 0.006, g); C(0.012, 0.012, 0.8, toon('#9aa4b0'), -0.32, 0.41, -0.05, 0.004, g, 6); B(0.42, 0.03, 0.03, toon('#9aa4b0'), -0.12, 0.62, -0.02, 0.004, g);
    const pip = new T3.Group(); pip.position.set(0.08, 0.3, 0); g.add(pip);
    const tube = C(0.018, 0.008, 0.42, glass, 0, 0.21, 0, 0.004, pip, 10);
    const pLiq = C(0.012, 0.012, 0.36, toon('#7fbf3a'), 0, 0.02, 0, 0, pip, 8); pLiq.geometry.translate(0, 0.18, 0); pLiq.scale.y = 0.001;
    const bulb = M(new T3.SphereGeometry(0.045, 12, 10), toon('#e2453f'), 0, 0.47, 0, pip, 0.006, 0.045); bulb.scale.set(1, 1.3, 1);
    for (let i = 1; i < 10; i++) B(0.02, 0.003, 0.003, ink, 0.016, 0.03 + i * 0.036, 0.008, 0, pip);
    stations.pipette = { g, vial, vLiq, pip, pLiq, bulb, p: new T3.Vector3(x + 0.08, TOP + 0.5, z) }; }
  // -- MIX station: four reagent bottles on the riser, the flask in front
  { const x = -1.5, z = -1.4, g = new T3.Group(); g.position.set(x, TOP, z); root.add(g);
    const lathe = pts => new T3.LatheGeometry(pts.map(([a, b]) => new T3.Vector2(a, b)), 20);
    const flask = M(lathe([[0, 0], [0.14, 0], [0.145, 0.02], [0.055, 0.21], [0.045, 0.24], [0.045, 0.31], [0.052, 0.32]]), glass, 0, 0, 0, g, 0.006);
    const fMat = toon('#d9f2f2'); const fLiq = M(lathe([[0, 0.006], [0.125, 0.006], [0.128, 0.02], [0.08, 0.11], [0, 0.11]]), new T3.MeshToonMaterial({ color: '#d9f2f2', gradientMap: ctx.grad }), 0, 0, 0, g, 0); fLiq.visible = false;
    const stopper = C(0.05, 0.04, 0.06, toon('#3a3836'), 0, 0.34, 0, 0.004, g, 10); stopper.visible = false;
    const bottles = RK.map((k, i) => { const bg = new T3.Group(); bg.position.set(-0.55 + i * 0.36, 0.5, -0.33); g.add(bg);
      const b = C(0.07, 0.08, 0.2, toon(REAGENTS[k].col), 0, 0.1, 0, 0.008, bg, 14); const neck = C(0.03, 0.03, 0.06, toon(REAGENTS[k].col), 0, 0.23, 0, 0.004, bg, 10);
      const cap = C(0.04, 0.04, 0.05, ink, 0, 0.28, 0, 0.004, bg, 10); const lab = new T3.Mesh(new T3.PlaneGeometry(0.11, 0.08), new T3.MeshBasicMaterial({ map: CTX(128, 96, c => { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, 128, 96); c.fillStyle = '#201e1d'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(REAGENTS[k].name.slice(0, 4), 64, 50); }) }));
      lab.position.set(0, 0.1, 0.081); bg.add(lab); [b, neck, cap, lab].forEach(m => m.userData.k = k); return { k, g: bg, b, hit: [b, neck, cap, lab] }; });
    stations.mix = { g, flask, fLiq, stopper, bottles, p: new T3.Vector3(x, TOP + 0.2, z) }; }
  // -- HEAT station: burner + tripod + beaker with a thermometer
  { const x = 0.15, z = -1.42, g = new T3.Group(); g.position.set(x, TOP, z); root.add(g);
    C(0.09, 0.11, 0.04, ink, 0, 0.02, 0, 0.006, g, 14); C(0.025, 0.03, 0.2, toon('#9aa4b0'), 0, 0.14, 0, 0.004, g, 10); C(0.012, 0.012, 0.25, toon('#e2453f'), 0.18, 0.03, 0, 0, g, 6).rotation.z = Math.PI / 2;
    const flameM = new T3.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: 0.85, depthWrite: false }), flameIn = new T3.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.9, depthWrite: false });
    const flame = new T3.Group(); flame.position.y = 0.24; g.add(flame); const f1 = new T3.Mesh(new T3.ConeGeometry(0.035, 0.16, 10), flameM); f1.position.y = 0.08; flame.add(f1); const f2 = new T3.Mesh(new T3.ConeGeometry(0.018, 0.09, 8), flameIn); f2.position.y = 0.05; flame.add(f2);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3, l = C(0.01, 0.01, 0.44, ink, Math.cos(a) * 0.14, 0.22, Math.sin(a) * 0.14, 0, g, 6); l.rotation.z = Math.cos(a) * 0.12; l.rotation.x = -Math.sin(a) * 0.12; }
    C(0.17, 0.17, 0.02, ink, 0, 0.44, 0, 0.004, g, 18); B(0.28, 0.006, 0.28, toon('#9aa4b0'), 0, 0.455, 0, 0, g);
    const beaker = C(0.1, 0.1, 0.2, glass, 0, 0.56, 0, 0.006, g, 18); const bLiq = C(0.088, 0.088, 0.11, new T3.MeshToonMaterial({ color: '#d9f2f2', gradientMap: ctx.grad }), 0, 0.52, 0, 0, g, 18); bLiq.visible = false;
    const thermo = C(0.008, 0.008, 0.34, toon('#fbfbf7'), 0.05, 0.66, 0.02, 0.003, g, 6); thermo.rotation.z = -0.25; const mercury = C(0.01, 0.01, 0.3, new T3.MeshBasicMaterial({ color: 0xec3013 }), 0, -0.15, 0, 0, thermo, 6); mercury.geometry.translate(0, 0.15, 0); mercury.scale.y = 0.2;
    stations.heat = { g, flame, f1, beaker, bLiq, mercury, p: new T3.Vector3(x, TOP + 0.35, z), bubbles: [] };
    for (let k = 0; k < 6; k++) { const b = new T3.Mesh(new T3.SphereGeometry(0.012, 6, 4), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })); b.position.set(rr(-0.06, 0.06), 0.48, rr(-0.06, 0.06)); b.visible = false; g.add(b); stations.heat.bubbles.push(b); } }
  // -- SPIN station: the centrifuge
  { const x = 1.75, z = -1.42, g = new T3.Group(); g.position.set(x, TOP, z); root.add(g);
    C(0.28, 0.3, 0.22, toon('#e8eef4'), 0, 0.11, 0, 0.012, g, 24); C(0.29, 0.29, 0.03, toon('#9aa4b0'), 0, 0.235, 0, 0.006, g, 24);
    const rotor = new T3.Group(); rotor.position.y = 0.25; g.add(rotor); C(0.2, 0.2, 0.03, toon('#5a646d'), 0, 0, 0, 0.004, rotor, 18);
    const tubes = []; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; const t = C(0.025, 0.02, 0.12, toon('#fbfbf7'), Math.cos(a) * 0.13, 0.05, Math.sin(a) * 0.13, 0.003, rotor, 8); t.rotation.z = Math.cos(a) * 0.5; t.rotation.x = -Math.sin(a) * 0.5; tubes.push(t); }
    const lid = M(new T3.SphereGeometry(0.27, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), glass, 0, 0.25, 0, g, 0.006, 0.27); lid.scale.y = 0.5;
    B(0.16, 0.08, 0.02, toon('#201e1d'), 0, 0.12, 0.29, 0.004, g); const led = M(new T3.SphereGeometry(0.02, 8, 6), new T3.MeshBasicMaterial({ color: 0x3a3836 }), 0.05, 0.12, 0.305, g, 0);
    stations.spin = { g, rotor, tubes, led, p: new T3.Vector3(x, TOP + 0.25, z) }; }
  // -- SCOPE station: the microscope
  { const x = 3.15, z = -1.45, g = new T3.Group(); g.position.set(x, TOP, z); g.rotation.y = -0.35; root.add(g);
    const ms = toon('#f4f1ea'), md = toon('#2f4f5a');
    B(0.3, 0.05, 0.36, md, 0, 0.025, 0, 0.008, g); const arm = B(0.08, 0.5, 0.08, ms, 0, 0.3, -0.12, 0.008, g); arm.rotation.x = 0.15;
    B(0.24, 0.025, 0.2, md, 0, 0.24, 0.04, 0.006, g); B(0.12, 0.004, 0.05, glass, 0, 0.256, 0.04, 0.002, g);
    const slide = B(0.06, 0.006, 0.035, toon('#d9f2f2'), 0, 0.26, 0.04, 0, g);
    const head = new T3.Group(); head.position.set(0, 0.56, -0.02); g.add(head); B(0.1, 0.1, 0.18, ms, 0, 0, 0, 0.008, head);
    C(0.025, 0.02, 0.14, toon('#9aa4b0'), 0, -0.12, 0.06, 0.004, head, 10); const ep = C(0.03, 0.03, 0.18, md, 0, 0.1, -0.06, 0.005, head, 10); ep.rotation.x = -0.6;
    const knob = C(0.05, 0.05, 0.03, ink, 0.06, 0.33, -0.12, 0.004, g, 12); knob.rotation.z = Math.PI / 2; const knob2 = knob.clone(); knob2.position.x = -0.06; g.add(knob2);
    for (let i = 0; i < 6; i++) B(0.034, 0.01, 0.006, brass, 0.077, 0.33 + Math.cos(i) * 0.03, -0.12 + Math.sin(i) * 0.03, 0, g);
    stations.scope = { g, slide, knob, head, p: new T3.Vector3(x, TOP + 0.4, z) }; }
  // sample drop-off tray at the west end of the bench
  B(0.4, 0.03, 0.3, toon('#9aa4b0'), -3.62, TOP + 0.015, -1.25, 0.006);

  // ---------- KISH'S DESK (sign-in counter, by the door) ----------
  { B(0.8, 1.05, 2.6, wood, -5.95, 0.525, 3.1, 0.02); B(0.95, 0.06, 2.7, woodD, -5.95, 1.08, 3.1, 0.01); for (let z = 2.1; z < 4.3; z += 0.66) B(0.02, 0.8, 0.5, woodD, -5.54, 0.5, z, 0);
    const book = B(0.36, 0.04, 0.26, toon('#7f1d1d'), -5.95, 1.13, 2.7, 0.006); book.rotation.y = 0.2; B(0.32, 0.01, 0.22, toon('#fbf8ec'), -5.95, 1.155, 2.7, 0).rotation.y = 0.2;
    C(0.05, 0.07, 0.04, brass, -5.9, 1.13, 3.5, 0.006); M(new T3.SphereGeometry(0.06, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), brass, -5.9, 1.15, 3.5, root, 0.006, 0.06);
    plane(0.9, 0.24, signT('SIGN IN', '#201e1d', '#eab308', 512, 136, 74), -5.53, 0.85, 3.1, Math.PI / 2);
    // a rack of the lab's spare keys (one hook empty)
    B(0.04, 0.4, 0.7, woodD, -W2 + 0.05, 1.7, 3.2, 0.006); for (let i = 0; i < 4; i++) if (i !== 2) { const k = C(0.015, 0.015, 0.12, brass, -W2 + 0.1, 1.62, 2.95 + i * 0.17, 0, root, 6); } }
  // ---------- ADAPA'S DESK (north-west corner) ----------
  { B(1.6, 0.75, 0.8, wood, -5.9, 0.375, -4.35, 0.02); B(1.7, 0.05, 0.9, woodD, -5.9, 0.775, -4.35, 0.01);
    for (let i = 0; i < 4; i++) { const p = B(0.3, 0.012, 0.4, toon('#fbf8ec'), -6.2 + i * 0.07, 0.81 + i * 0.012, -4.3, 0.003); p.rotation.y = rr(-0.3, 0.3); }
    C(0.08, 0.1, 0.03, brass, -5.4, 0.815, -4.55, 0.004); C(0.012, 0.012, 0.35, brass, -5.4, 0.98, -4.55, 0); const shade = C(0.04, 0.12, 0.12, toon('#2f4f5a'), -5.4, 1.15, -4.5, 0.006); shade.rotation.x = 0.4;
    C(0.24, 0.24, 0.06, terra, -5.9, 0.48, -5.05, 0.01); B(0.5, 0.6, 0.06, terra, -5.9, 0.8, -5.3, 0.01); }
  // blackboard on the west wall
  { const bbT = CTX(512, 256, c => { c.fillStyle = '#25332c'; c.fillRect(0, 0, 512, 256); c.strokeStyle = '#8a5a32'; c.lineWidth = 14; c.strokeRect(0, 0, 512, 256); c.fillStyle = '#e8efe6'; c.font = '700 30px Archivo, Arial'; c.fillText('LAKE  pH 4.1  ✗', 30, 60); c.fillText('WELL  pH 7.0  ✓', 30, 104); c.fillText('BATCH 19 → ???', 30, 148); c.font = 'italic 700 26px Archivo, Arial'; c.fillText('label EVERYTHING — A.', 30, 214); c.strokeStyle = '#e8efe6'; c.lineWidth = 3; c.beginPath(); c.arc(410, 110, 46, 0, 7); c.stroke(); c.beginPath(); c.arc(410, 110, 14, 0, 7); c.stroke(); });
    plane(2.2, 1.1, bbT, -W2 + 0.03, 2.1, -0.6, Math.PI / 2, false); }
  // ---------- THE ORRERY (east): brass sun, rings, little worlds ----------
  { const g = new T3.Group(); g.position.set(5.2, 0, 1.8); root.add(g);
    C(0.35, 0.45, 0.25, brassD, 0, 0.125, 0, 0.01, g, 18); C(0.08, 0.1, 1.0, brass, 0, 0.75, 0, 0.008, g, 10);
    const sun = M(new T3.SphereGeometry(0.16, 16, 12), new T3.MeshBasicMaterial({ color: 0xffc94a }), 0, 1.4, 0, g, 0.008, 0.16);
    const planets = []; [[0.35, '#c8643c', 0.05, 1.6], [0.55, '#38bdf8', 0.07, 1.1], [0.78, '#86d44e', 0.06, 0.75], [1.0, '#9b5de5', 0.08, 0.5]].forEach(([r, col, s, sp], i) => {
      const ring = M(new T3.TorusGeometry(r, 0.008, 4, 48), brass, 0, 1.4, 0, g, 0); ring.rotation.x = Math.PI / 2 + i * 0.05;
      const arm = new T3.Group(); arm.position.y = 1.4; g.add(arm); const pl = M(new T3.SphereGeometry(s, 12, 8), toon(col), r, 0, 0, arm, 0.006, s); arm.rotation.y = i * 1.7; planets.push({ arm, sp }); });
    L.orrery = { g, sun, planets, boost: 0 }; }
  // ---------- display cases (east wall) ----------
  [[-0.2], [2.8]].forEach(([z]) => { B(0.9, 0.9, 1.6, woodD, W2 - 0.6, 0.45, z, 0.015); B(0.85, 0.6, 1.55, glass, W2 - 0.6, 1.2, z, 0.008); });
  { const sh = M(new T3.OctahedronGeometry(0.14, 0), new T3.MeshBasicMaterial({ color: 0x7fe3ff }), W2 - 0.6, 1.15, -0.5, root, 0.008); sh.scale.y = 1.8; L.shard = sh;
    const col = M(new T3.TorusGeometry(0.16, 0.035, 8, 20), toon('#5a646d'), W2 - 0.6, 1.06, 0.25, root, 0.006); col.rotation.x = Math.PI / 2;
    for (let i = 0; i < 3; i++) C(0.06, 0.08, 0.16, toon(['#c8643c', '#e6b45a', '#9a4a2a'][i]), W2 - 0.6, 0.98, 2.3 + i * 0.4, 0.006); B(0.3, 0.04, 0.22, toon('#c8643c'), W2 - 0.6, 0.93, 3.4, 0.006); }
  // wall sconces + hanging pendants
  L.glows = [];
  for (const [x, z, ry] of [[-W2 + 0.08, -3, Math.PI / 2], [-W2 + 0.08, 1.4, Math.PI / 2], [W2 - 0.08, -3, -Math.PI / 2], [W2 - 0.08, 4.6, -Math.PI / 2]]) { const s = B(0.08, 0.3, 0.14, brass, x, 2.4, z, 0.006); s.rotation.y = ry; L.glows.push(M(new T3.SphereGeometry(0.09, 10, 8), new T3.MeshBasicMaterial({ color: 0xffe08a }), x + (x < 0 ? 0.1 : -0.1), 2.6, z, root, 0.006)); }
  // banners with the U crest
  const banT = CTX(128, 256, c => { c.fillStyle = '#c8643c'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#eab308'; c.fillRect(0, 0, 128, 10); c.beginPath(); c.moveTo(0, 220); c.lineTo(64, 256); c.lineTo(128, 220); c.lineTo(128, 256); c.lineTo(0, 256); c.fillStyle = '#00000000'; c.font = '900 90px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.fillStyle = '#eab308'; c.fillText('U', 64, 130); });
  for (const x of [-1.5, 1.5]) plane(0.6, 1.2, banT, x, 2.25, -D2 + 0.06);
  // potted reed plants by the door
  for (const x of [-2.0, 2.0]) { const fc = root.children.length; C(0.22, 0.17, 0.4, terra, x, 0.2, D2 - 0.6, 0.01); for (let i = 0; i < 7; i++) { const r = C(0.012, 0.02, rr(0.8, 1.3), toon(i % 2 ? '#5f8f4a' : '#86b84a'), x + rr(-0.08, 0.08), 0.85, D2 - 0.6 + rr(-0.08, 0.08), 0, root, 5); r.rotation.z = rr(-0.25, 0.25); r.rotation.x = rr(-0.25, 0.25); } L.front.push(...root.children.slice(fc)); }

  // ---------- walking: solids (x0, z0, x1, z1) + things to use ----------
  L.bounds = { x0: -W2 + 0.45, x1: W2 - 0.45, z0: -D2 + 0.45, z1: D2 - 0.4 };
  L.solids = [[bx0 - 0.05, -2.3, bx1 + 0.05, bz + bd / 2 + 0.02], [-W2, -D2, -1.85, -D2 + 0.55], [1.7, -D2, 5.8, -D2 + 1.3], [-0.85, -D2, 0.85, -D2 + 0.3], [-W2, 1.7, -5.45, 4.5], [-6.8, -4.85, -5.0, -3.85], [-6.2, -5.4, -5.6, -4.8], [4.75, 1.35, 5.65, 2.25], [W2 - 1.1, -1.1, W2, 0.7], [W2 - 1.1, 1.9, W2, 3.7], [-2.3, D2 - 0.85, -1.7, D2], [1.7, D2 - 0.85, 2.3, D2]];
  L.spots = { ben: { x: -0.85, z: 0.35, ry: 0.2 }, adapaIntro: { x: 0.85, z: 0.15, ry: -0.35 }, adapa: { x: -6.0, z: -3.25, ry: 0.5 }, kish: { x: -6.9, z: 3.0, ry: Math.PI / 2 }, drop: { x: -4.55, z: -1.2, ry: Math.PI / 2 }, door: { x: 0, z: D2 + 0.6 }, inside: { x: 0, z: D2 - 1.0 }, walkStart: { x: 0, z: 3.8, ry: Math.PI }, benchFront: { x: 0, z: -0.6 } };
  L.things = [
    { id: 'bench', label: 'CLOCK IN · LAB BENCH', near: p => p.z > -1.25 && p.z < 0.05 && p.x > bx0 && p.x < bx1 },
    { id: 'orrery', label: 'SPIN THE ORRERY', x: 5.2, z: 1.8, r: 1.35 },
    { id: 'north', label: 'NORTH DOOR', x: 0, z: -D2 + 0.6, r: 1.15 },
    { id: 'tanks', label: 'LOOK · SPECIMEN TANKS', x: 3.7, z: -D2 + 1.6, r: 1.25 },
    { id: 'cases', label: 'LOOK · DISPLAY CASES', x: W2 - 1.5, z: 1.3, r: 1.2 },
    { id: 'board', label: 'READ THE BLACKBOARD', x: -W2 + 0.9, z: -0.6, r: 1.1 },
    { id: 'exit', label: 'LEAVE · LAB PATH', x: 0, z: D2 - 0.55, r: 0.9 }];
  L.animate = (t, dt) => {
    const o = L.orrery; o.boost = Math.max(0, o.boost - dt * 0.6); for (const p of o.planets) p.arm.rotation.y += dt * p.sp * (0.35 + o.boost * 4); o.sun.scale.setScalar(1 + Math.sin(t * 2) * 0.04);
    for (const b of L.bubbles) { b.position.y += dt * 0.35; if (b.position.y > 2.35) b.position.y = 0.4; }
    for (const k of L.tanks) { k.sil.position.y = 1.2 + Math.sin(t * 0.6 + k.ph) * 0.06; k.sil.rotation.y = Math.sin(t * 0.25 + k.ph) * 0.4; if (k.eyeM) k.eyeM.opacity = Math.max(0, Math.sin(t * 0.7) * 2 - 1.3) + (k.stare || 0); }
    L.doorLamp.material.color.setHex(Math.sin(t * 3) > 0 ? 0xff3a2a : 0x7a1a12); L.shard.rotation.y += dt * 0.8; };
  return L;
}

// ======================================================================================
// THE GAME
// ======================================================================================
export async function createLabShift({ container, onState = () => {}, onExit = null }) {
  const ST = createStage(container, { bg: '#2a1606' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, M, kit, audio, tone, puff, smokeS } = ST;
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#3a2010'); gr.addColorStop(1, '#1a0e06'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); });
  ST.sun.position.set(2, 9, 5); ST.sun.intensity = 1.35; ST.sun.shadow.camera.left = -9; ST.sun.shadow.camera.right = 9; ST.sun.shadow.camera.top = 8; ST.sun.shadow.camera.bottom = -8; ST.sun.shadow.camera.updateProjectionMatrix();
  const L = buildLab({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline: ST.addOutline }), SP = L.spots, STN = L.st;

  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const place = (f, s, ry) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry != null ? ry : (s.ry || 0); };
  const benPlain = strip(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' }));
  const benCoat = strip(kit.makeFox({ ...CAST.player, outfit: 'coat', torso: ['#fbfbf7', '#e2e8f0', '#94a3b8'], crest: '', glasses: true, gear: 'none', mood: 'happy' }));
  { const BP = benCoat.userData.P, badge = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.11), new THREE.MeshBasicMaterial({ map: canvasTex(256, 140, c => { c.fillStyle = '#c8643c'; c.fillRect(0, 0, 256, 140); c.fillStyle = '#eab308'; c.fillRect(0, 0, 256, 10); c.font = '900 64px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff3c4'; c.fillText('UR LAB', 128, 80); }), depthTest: true }));
    badge.position.set(0.14, 1.12, 0.33); badge.rotation.x = -0.12; BP.body.add(badge); }
  const coatOn = () => !!save.flag('urLabCoat');
  let ben = coatOn() ? benCoat : benPlain; benPlain.visible = ben === benPlain; benCoat.visible = ben === benCoat;
  const swapBen = () => { const want = coatOn() ? benCoat : benPlain; if (want === ben) return; want.position.copy(ben.position); want.rotation.copy(ben.rotation); want.visible = ben.visible; ben.visible = false; ben = want; };
  const adapa = strip(kit.makeFox({ ...CAST.player, look: { ...PLAYER_FEMALE, fur: '#e8a355', furDark: '#cf7a24', tailMid: '#e8a355', tailBase: '#cf7a24' }, torso: ['#8fb4e0', '#3f6aa8', '#182f50'], outfit: 'coat', crest: '', glasses: true, gear: 'none', mood: 'warm' }));
  const kish = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#dd9648', furDark: '#b8762c', tailMid: '#dd9648' }, torso: ['#bcd2a8', '#7f9a5f', '#3b4c25'], outfit: 'vest', crest: '', gear: 'none', mood: 'neutral' }));
  place(kish, SP.kish);
  const clientFox = CLIENTS.map(o => { const f = strip(kit.makeFox({ ...CAST.player, look: o.fur ? { ...CAST.player.look, fur: o.fur, furDark: o.furDark, tailMid: o.fur } : CAST.player.look, torso: o.torso, outfit: o.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; return f; });
  // a little sample vial the client carries in
  const carry = M(new THREE.CylinderGeometry(0.035, 0.035, 0.2, 10), toon('#7fbf3a'), 0, 0, 0, scene, 0.006); carry.visible = false;
  const NPCS = [{ f: adapa, name: 'DR. ADAPA', role: 'LAB DIRECTOR', id: 'adapa' }, { f: kish, name: 'KISH', role: 'LAB DESK', id: 'kish' }];

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), n: 0, earned: 0, tips: 0, starList: [], tool: null, flash: null, flashT: 0, say: '', sayT: 0, ptr: null, react: null, done: null, phT: 0, confirm: 0, hold: false, wave: 0, hop: 0, dlg: null, stick: { x: 0, y: 0 }, keys: new Set() };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  let J = null, R = null, CL = null, cf = null, lastClient = -1, JOB_ID = 1;
  const wp = o => o.getWorldPosition(new THREE.Vector3());
  const col3 = c => new THREE.Color(c);

  function newJob() {
    const d = S.day; let ci; do { ci = Math.floor(Math.random() * CLIENTS.length); } while (ci === lastClient); lastClient = ci; if (S.forceClient != null) ci = S.forceClient;
    const C = CLIENTS[ci], smp = SAMPLES[C.sample], extra = ['mix', 'heat', 'spin', 'scope'], n = S.force ? 4 : d <= 1 ? 1 + (Math.random() < 0.4 ? 1 : 0) : d <= 2 ? 2 : d <= 3 ? 3 : 3 + (Math.random() < 0.5 ? 1 : 0);
    const tasks = ['pipette']; const pool = extra.slice(); if (!S.force && Math.random() < 0.75) { tasks.push('scope'); pool.splice(pool.indexOf('scope'), 1); } while (tasks.length < n + 1) { const t = pick(pool.filter(q => !tasks.includes(q))); tasks.push(t); }
    if (S.force) tasks.splice(0, tasks.length, ...ORDER); tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    const cols = RK.slice().sort(() => Math.random() - 0.5).slice(0, d >= 3 && Math.random() < 0.5 ? 3 : 2), recipe = {}; cols.forEach(k => recipe[k] = 1 + Math.floor(Math.random() * (d >= 2 ? 3 : 2)));
    const heat = HEATS[Math.floor(Math.random() * HEATS.length)], spin = SPINS[Math.floor(Math.random() * SPINS.length)], cell = pick(smp.cells);
    return { id: JOB_ID++, ci, C, smp, tasks, ml: 2 + Math.floor(Math.random() * 6), recipe, heat, spin, cell, count: 3 + Math.floor(Math.random() * Math.min(4, 1 + d)), line: C.line }; }
  function freshRun() {
    const sc = { phase: 'focus', focus: 0, target: rr(0.35, 0.7), cells: [], tagged: 0, wrong: 0, xT: 0, xs: [] };
    sc.focus = upg('focus') ? sc.target + (Math.random() < 0.5 ? -1 : 1) * 0.1 : (sc.target > 0.5 ? rr(0.02, 0.12) : rr(0.88, 0.98));
    const others = J.smp.cells.filter(c => c !== J.cell), mk = (type, i) => { let x, y, k = 0; do { const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.72; x = Math.cos(a) * r; y = Math.sin(a) * r; k++; } while (k < 40 && sc.cells.some(c => Math.hypot(c.x - x, c.y - y) < 0.2)); return { type, x, y, vx: rr(-0.02, 0.02), vy: rr(-0.02, 0.02), rot: rr(0, 6), vr: rr(-0.4, 0.4), s: rr(0.85, 1.15), tag: 0, bad: 0 }; };
    for (let i = 0; i < J.count; i++) sc.cells.push(mk(J.cell, i)); const nd = others.length ? 5 + Math.floor(Math.random() * 4) : 0; for (let i = 0; i < nd; i++) sc.cells.push(mk(others[i % others.length], i));
    return { pip: { v: 0, tries: 0, done: false, q: 1, hold: false }, mix: { drops: Object.fromEntries(RK.map(k => [k, 0])), state: 'drops', shake: 0, dumps: 0, done: false, q: 1, wob: 0 }, heat: { temp: 20, flame: 0.12, prog: 0, over: 0, done: false, q: 1, warnT: 0 }, spin: { rpm: 0, prog: 0, over: 0, done: false, q: 1 }, scope: sc }; }
  const NEED = { heat: 3.5, spin: 3 }, shakeNeed = () => upg('stirrer') ? 5 : 10;

  // ---------- sample visuals on the bench ----------
  function benchReset() { const s = STN; s.pipette.vLiq.visible = false; s.pipette.pLiq.scale.y = 0.001; s.mix.fLiq.visible = false; s.mix.stopper.visible = false; s.heat.bLiq.visible = false; s.spin.tubes.forEach(t => t.material = toon('#fbfbf7')); s.scope.slide.material = toon('#d9f2f2'); s.heat.mercury.scale.y = 0.2; }
  function sampleIn() { const c = J.smp.col; STN.pipette.vLiq.material = toon(c); STN.pipette.vLiq.visible = true; STN.pipette.vLiq.scale.y = 1; STN.pipette.pLiq.material = toon(c); }
  function sampleOut() { const c = J.smp.col; STN.mix.fLiq.visible = J.tasks.includes('mix'); STN.mix.fLiq.material.color.set(c); STN.heat.bLiq.visible = J.tasks.includes('heat'); STN.heat.bLiq.material.color.set(c);
    if (J.tasks.includes('spin')) STN.spin.tubes.forEach(t => t.material = toon(c)); if (J.tasks.includes('scope')) STN.scope.slide.material = toon(c); }
  const mixColor = () => { const m = R.mix, base = col3(J.smp.col); let n = 1; const out = base.clone(); for (const k of RK) if (m.drops[k]) { out.add(col3(REAGENTS[k].col).multiplyScalar(m.drops[k] * 0.8)); n += m.drops[k] * 0.8; } out.multiplyScalar(1 / n); const over = RK.some(k => m.drops[k] > (J.recipe[k] || 0)); if (over) out.lerp(col3('#5a544e'), 0.55); return out; };

  // ---------- task progress ----------
  function info(id) { if (!R) return { done: false, q: 0, prog: 0, txt: '' };
    if (id === 'pipette') { const p = R.pip; return { done: p.done, q: p.q, prog: p.done ? 1 : 0, txt: p.done ? 'DONE' : J.ml + ' mL' }; }
    if (id === 'mix') { const m = R.mix, need = Object.values(J.recipe).reduce((a, b) => a + b, 0), have = RK.reduce((a, k) => a + Math.min(m.drops[k], J.recipe[k] || 0), 0); return { done: m.done, q: m.q, prog: m.done ? 1 : m.state === 'shake' ? 0.5 + m.shake * 0.5 : have / need * 0.5, txt: m.done ? 'DONE' : m.state === 'shake' ? 'SHAKE ' + Math.round(m.shake * 100) + '%' : have + ' / ' + need + ' DROPS' }; }
    if (id === 'heat') { const h = R.heat; return { done: h.done, q: h.q, prog: h.done ? 1 : h.prog / NEED.heat, txt: h.done ? 'DONE' : Math.round(h.prog / NEED.heat * 100) + '%' }; }
    if (id === 'spin') { const s = R.spin; return { done: s.done, q: s.q, prog: s.done ? 1 : s.prog / NEED.spin, txt: s.done ? 'DONE' : Math.round(s.prog / NEED.spin * 100) + '%' }; }
    if (id === 'scope') { const c = R.scope; return { done: c.phase === 'done', q: clamp(1 - c.wrong * 0.15, 0.4, 1), prog: c.phase === 'done' ? 1 : c.tagged / J.count * 0.8 + (c.phase === 'count' ? 0.2 : 0), txt: c.phase === 'done' ? 'DONE' : c.phase === 'focus' ? 'FOCUS' : c.tagged + ' / ' + J.count }; }
    return { done: true, q: 1, prog: 1, txt: '' }; }
  const allDone = () => J && J.tasks.every(t => info(t).done);
  const nextTask = () => J && J.tasks.find(t => !info(t).done);
  function setTool(id) { if (S.phase !== 'work' || !J || !J.tasks.includes(id)) return; if (id !== 'pipette' && !R.pip.done) { flash('PIPETTE THE SAMPLE FIRST', '#e6b45a', 1.4); id = 'pipette'; } if (S.tool === 'heat' && id !== 'heat') R.heat.hold = false; S.tool = id; S.userToolT = performance.now(); S.ptr = null; S.hold = false; }
  function taskDone(t) { flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.3); tone(1175, 0.1, 0.05); setTimeout(() => tone(1568, 0.14, 0.05), 110); const p = STN[t].p; for (let i = 0; i < 6; i++) puff(p.x + rr(-0.2, 0.2), p.y + rr(0, 0.3), p.z + 0.15, 0xffe7a0, 1);
    if (!save.flag('urLabShift1')) save.setFlag('urLabShift1'); }

  // PIPETTE: hold to draw, release in the green
  const pipBand = () => upg('pipette') ? 0.08 : 0.045;
  function pipStart() { const p = R.pip; if (p.done || p.hold) return; p.hold = true; p.v = 0; tone(330, 0.2, 0.03, 'sine'); }
  function pipRelease() { const p = R.pip; if (!p.hold) return; p.hold = false; const tgt = J.ml / 10, err = Math.abs(p.v - tgt), band = pipBand();
    if (err <= band) { p.done = true; p.q = clamp(1 - p.tries * 0.15 - err / band * 0.08, 0.4, 1); flash('SPOT ON · ' + (p.v * 10).toFixed(1) + ' mL', '#22c55e', 1.4); sampleOut(); STN.pipette.vLiq.scale.y = 0.55; taskDone('pipette'); }
    else if (err <= band * 2.2) { p.done = true; p.q = clamp(0.68 - p.tries * 0.12, 0.4, 1); flash('CLOSE ENOUGH · ' + (p.v * 10).toFixed(1) + ' mL', '#e6b45a', 1.5); sampleOut(); STN.pipette.vLiq.scale.y = 0.55; taskDone('pipette'); }
    else { p.tries++; flash((p.v > tgt ? 'TOO MUCH' : 'TOO LITTLE') + ' · ' + (p.v * 10).toFixed(1) + ' mL · SQUEEZE IT BACK, TRY AGAIN', '#ec3013', 1.8); tone(180, 0.2, 0.05, 'sawtooth'); p.v = 0; } }
  // MIX: drops, then shake
  function addDrop(k) { const m = R.mix; if (!J || m.done || S.phase !== 'work') return; if (!R.pip.done) { flash('PIPETTE THE SAMPLE FIRST', '#e6b45a'); return; } if (m.state !== 'drops') { flash('STOPPER IS ON · SHAKE IT', '#ffffff', 1); return; }
    m.drops[k]++; const b = STN.mix.bottles.find(q => q.k === k); b.tilt = 1; drops.push({ k, t: 0, from: wp(b.b).add(V3(0, 0.25, 0)), to: wp(STN.mix.flask).add(V3(0, 0.34, 0)) }); tone(880 + RK.indexOf(k) * 120, 0.06, 0.05, 'sine');
    const want = J.recipe[k] || 0; if (m.drops[k] > want) { flash(want ? 'TOO MUCH ' + REAGENTS[k].name + ' · TAP DUMP' : 'NO ' + REAGENTS[k].name + ' ON THE CARD · TAP DUMP', '#ec3013', 1.8); tone(200, 0.2, 0.05, 'sawtooth'); return; }
    if (RK.every(q => m.drops[q] === (J.recipe[q] || 0))) { m.state = 'shake'; m.shake = 0; setTimeout(() => { if (R && R.mix === m) { STN.mix.stopper.visible = true; flash('RECIPE RIGHT · STOPPER ON · NOW SHAKE IT', '#22c55e', 1.8); } }, 450); } }
  function dump() { const m = R.mix; if (!J || m.done || S.phase !== 'work' || m.state !== 'drops' || !RK.some(k => m.drops[k])) return; RK.forEach(k => m.drops[k] = 0); m.dumps++; m.q = clamp(1 - m.dumps * 0.2, 0.4, 1); STN.mix.fLiq.material.color.set(J.smp.col); flash('FLASK RINSED · START THE DROPS AGAIN', '#ffffff', 1.4); const p = wp(STN.mix.flask); puff(p.x, p.y + 0.2, p.z, 0xbfe6f5, 4); tone(240, 0.15, 0.04, 'sine'); }
  function shakeStep() { const m = R.mix; if (m.state !== 'shake' || m.done) return; m.shake = Math.min(1, m.shake + 1 / shakeNeed()); m.wob = 1; tone(500 + m.shake * 500, 0.04, 0.03, 'triangle'); if (m.shake >= 1) { m.done = true; m.state = 'done'; STN.mix.stopper.visible = false; taskDone('mix'); } }
  // HEAT
  const heatK = () => upg('burner') ? 0.62 : 1;
  // SPIN
  function spinAdd(da) { const s = R.spin; if (s.done) return; s.rpm = Math.min(1.1, s.rpm + da / (Math.PI * 2) * (upg('turbo') ? 0.2 : 0.11)); }
  // SCOPE
  function scopeTap(x, y) { const c = R.scope, o = OV.rect; if (c.phase !== 'count') return; const ux = (x - o.cx) / o.r, uy = (y - o.cy) / o.r; let best = null, bd = 0.16;
    for (const q of c.cells) { if (q.tag) continue; const d = Math.hypot(q.x - ux, q.y - uy); if (d < bd) { bd = d; best = q; } }
    if (!best) return; if (best.type === J.cell) { c.tagged++; best.tag = c.tagged; tone(900 + c.tagged * 80, 0.07, 0.05, 'sine'); if (c.tagged >= J.count) { c.phase = 'done'; setTimeout(() => taskDone('scope'), 250); } }
    else { c.wrong++; best.bad = 1; c.xs.push({ x: best.x, y: best.y, t: 0.9 }); flash("THAT'S A " + CELLS[best.type].one + ' · COUNT ' + CELLS[J.cell].name, '#ec3013', 1.4); tone(180, 0.15, 0.05, 'sawtooth'); } }
  function focusBy(d) { const c = R.scope; if (c.phase !== 'focus') return; c.focus = clamp(c.focus + d, 0, 1); STN.scope.knob.rotation.x = c.focus * 8; if (Math.abs(c.focus - c.target) < 0.04) { c.phase = 'count'; c.focus = c.target; flash('SHARP! NOW TAP EVERY ' + CELLS[J.cell].one, '#22c55e', 1.8); tone(1320, 0.08, 0.05); setTimeout(() => tone(1760, 0.1, 0.04), 90); } }

  // ---------- microscope eyepiece overlay (2D canvas over the stage) ----------
  const OV = { cv: document.createElement('canvas'), on: false, rect: { cx: 0, cy: 0, r: 1, x: 0, y: 0, s: 1 } }; OV.cv.style.cssText = 'position:absolute;pointer-events:none;display:none;z-index:1'; container.style.position = container.style.position || 'relative'; container.appendChild(OV.cv); const og = OV.cv.getContext('2d');
  function cellPath(g, q, R0) { const t = q.type, r = R0 * q.s; g.beginPath();
    if (t === 'blob') { for (let i = 0; i <= 18; i++) { const a = i / 18 * Math.PI * 2, rr2 = r * (1 + Math.sin(a * 3 + q.rot) * 0.08); i ? g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : g.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } }
    else if (t === 'spiky') { for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI * 2 + q.rot, rr2 = r * (i % 2 ? 0.75 : 1.2); i ? g.lineTo(Math.cos(a) * rr2, Math.sin(a) * rr2) : g.moveTo(Math.cos(a) * rr2, Math.sin(a) * rr2); } }
    else if (t === 'rod') { g.save(); g.rotate(q.rot); g.moveTo(-r * 1.1, -r * 0.42); g.lineTo(r * 1.1, -r * 0.42); g.arc(r * 1.1, 0, r * 0.42, -Math.PI / 2, Math.PI / 2); g.lineTo(-r * 1.1, r * 0.42); g.arc(-r * 1.1, 0, r * 0.42, Math.PI / 2, Math.PI * 1.5); g.restore(); }
    else if (t === 'chip') { g.save(); g.rotate(q.rot); g.rect(-r * 0.75, -r * 0.75, r * 1.5, r * 1.5); g.restore(); }
    else { g.save(); g.rotate(q.rot); g.moveTo(0, -r * 1.2); g.lineTo(r * 0.6, 0); g.lineTo(0, r * 1.2); g.lineTo(-r * 0.6, 0); g.closePath(); g.restore(); } }
  function drawCell(g, q, R0) { const C = CELLS[q.type]; cellPath(g, q, R0); g.fillStyle = C.col; g.fill(); g.lineWidth = Math.max(2, R0 * 0.12); g.strokeStyle = 'rgba(20,18,16,0.85)'; g.stroke();
    if (q.type === 'blob' || q.type === 'spiky') { g.beginPath(); g.arc(R0 * 0.2, -R0 * 0.15, R0 * 0.32 * q.s, 0, 7); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fill(); }
    if (q.type === 'chip') { g.save(); g.rotate(q.rot); g.strokeStyle = '#e6b45a'; g.lineWidth = Math.max(1.5, R0 * 0.08); for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(-R0 * 0.75, i * R0 * 0.38); g.lineTo(R0 * 0.75, i * R0 * 0.38); g.stroke(); } g.restore(); } }
  function drawScope(dt) { const c = R && R.scope; const show = S.phase === 'work' && S.tool === 'scope' && c; OV.cv.style.display = show ? 'block' : 'none'; OV.on = !!show; if (!show) return;
    const W = CW(), H = CHh(), top = SAFE.top + 8, bot = H - SAFE.bottom - 8, avail = Math.max(120, bot - top), s = Math.round(Math.min(W - 16, avail, 560)), dpr = Math.min(2, devicePixelRatio || 1);
    const x = Math.round((W - s) / 2), y = Math.round(top + (avail - s) / 2); if (OV.cv.width !== Math.round(s * dpr)) { OV.cv.width = OV.cv.height = Math.round(s * dpr); } OV.cv.style.left = x + 'px'; OV.cv.style.top = y + 'px'; OV.cv.style.width = OV.cv.style.height = s + 'px';
    const r = s * 0.45; OV.rect = { cx: x + s / 2, cy: y + s / 2, r, x, y, s }; const g = og; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, s, s);
    // eyepiece barrel
    g.fillStyle = '#201e1d'; g.beginPath(); g.arc(s / 2, s / 2, r + s * 0.045, 0, 7); g.fill(); g.strokeStyle = '#d9a441'; g.lineWidth = 3; g.beginPath(); g.arc(s / 2, s / 2, r + s * 0.03, 0, 7); g.stroke();
    g.save(); g.beginPath(); g.arc(s / 2, s / 2, r, 0, 7); g.clip();
    const base = col3(J.smp.col).lerp(col3('#ffffff'), 0.72), gr = g.createRadialGradient(s / 2, s / 2, r * 0.1, s / 2, s / 2, r); gr.addColorStop(0, '#' + base.getHexString()); gr.addColorStop(1, '#' + base.clone().lerp(col3('#8a847e'), 0.35).getHexString()); g.fillStyle = gr; g.fillRect(0, 0, s, s);
    const err = Math.abs(c.focus - c.target), blur = c.phase === 'focus' ? clamp(err * 2.4, 0, 1) : 0, R0 = r * 0.085;
    // drift
    for (const q of c.cells) { q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt * 0.3; if (Math.hypot(q.x, q.y) > 0.82) { q.vx *= -1; q.vy *= -1; q.x *= 0.99; q.y *= 0.99; } if (Math.random() < dt * 0.3) { q.vx = rr(-0.025, 0.025); q.vy = rr(-0.025, 0.025); } }
    const draw = (ox, oy, a) => { g.globalAlpha = a; for (const q of c.cells) { g.save(); g.translate(s / 2 + q.x * r + ox, s / 2 + q.y * r + oy); drawCell(g, q, R0); g.restore(); } g.globalAlpha = 1; };
    if (blur > 0.02) { const o = blur * r * 0.12; draw(-o, -o * 0.3, 0.35); draw(o, o * 0.4, 0.35); draw(0, o * 0.6, 0.3); g.fillStyle = 'rgba(255,255,255,' + (blur * 0.35).toFixed(3) + ')'; g.fillRect(0, 0, s, s); } else draw(0, 0, 1);
    // tags
    for (const q of c.cells) if (q.tag) { const px = s / 2 + q.x * r, py = s / 2 + q.y * r; g.strokeStyle = '#ffd23a'; g.lineWidth = 4; g.beginPath(); g.arc(px, py, R0 * 1.75, 0, 7); g.stroke(); g.fillStyle = '#201e1d'; g.fillRect(px + R0 * 1.1, py - R0 * 2.2, R0 * 1.5, R0 * 1.3); g.fillStyle = '#ffd23a'; g.font = '900 ' + Math.round(R0 * 1.05) + 'px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(String(q.tag), px + R0 * 1.85, py - R0 * 1.55); }
    for (const X of c.xs) { X.t -= dt; const px = s / 2 + X.x * r, py = s / 2 + X.y * r; g.globalAlpha = clamp(X.t, 0, 1); g.strokeStyle = '#ec3013'; g.lineWidth = 5; g.beginPath(); g.moveTo(px - R0, py - R0); g.lineTo(px + R0, py + R0); g.moveTo(px + R0, py - R0); g.lineTo(px - R0, py + R0); g.stroke(); g.globalAlpha = 1; } c.xs = c.xs.filter(X => X.t > 0);
    // crosshair + vignette
    g.strokeStyle = 'rgba(32,30,29,0.25)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(s / 2 - r, s / 2); g.lineTo(s / 2 + r, s / 2); g.moveTo(s / 2, s / 2 - r); g.lineTo(s / 2, s / 2 + r); g.stroke();
    const vg = g.createRadialGradient(s / 2, s / 2, r * 0.7, s / 2, s / 2, r); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = vg; g.fillRect(0, 0, s, s); g.restore();
    // focus knob strip on the right (while focusing)
    if (c.phase === 'focus') { const fx = s - s * 0.07, fy0 = s * 0.18, fy1 = s * 0.82; g.fillStyle = '#000'; g.fillRect(fx - s * 0.03, fy0 - 8, s * 0.06, fy1 - fy0 + 16); g.strokeStyle = '#ffd23a'; g.lineWidth = 2; g.strokeRect(fx - s * 0.03, fy0 - 8, s * 0.06, fy1 - fy0 + 16);
      for (let i = 0; i <= 10; i++) { const yy = fy0 + (fy1 - fy0) * i / 10; g.fillStyle = '#5a544e'; g.fillRect(fx - s * 0.015, yy - 1, s * 0.03, 2); }
      const my = fy1 - (fy1 - fy0) * c.focus; g.fillStyle = blur < 0.2 ? '#22c55e' : '#ffd23a'; g.fillRect(fx - s * 0.04, my - 5, s * 0.08, 10); } }

  // ---------- input ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function bottleAt(x, y) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(STN.mix.bottles.flatMap(b => b.hit), false)[0]; return hit ? hit.object.userData.k : null; }
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (DM.on || S.phase !== 'work' || !J) return; const { x, y } = local(e); e.preventDefault(); const T = S.tool; S.ptr = { x, y, ax: x, ay: y, dx: 0, dy: 0, kind: null };
    if (T !== 'pipette' && !R.pip.done) { flash('PIPETTE THE SAMPLE FIRST', '#e6b45a', 1.4); setTool('pipette'); return; }
    if (T === 'pipette') { if (R.pip.done) { flash('SAMPLE DRAWN ✓ · PICK THE NEXT JOB BELOW', '#ffffff', 1.2); return; } S.ptr.kind = 'pip'; pipStart(); }
    else if (T === 'mix') { const m = R.mix; if (m.done) return; if (m.state === 'drops') { const k = bottleAt(x, y); if (k) addDrop(k); else flash('TAP A BOTTLE · OR PICK ONE BELOW', '#ffffff', 1.1); } else { S.ptr.kind = 'shake'; } }
    else if (T === 'heat') { if (R.heat.done) return; S.ptr.kind = 'heat'; R.heat.hold = true; }
    else if (T === 'spin') { if (R.spin.done) return; S.ptr.kind = 'spin'; const c = scr(STN.spin.p); S.ptr.c = c; S.ptr.ang = Math.atan2(y - c.y, x - c.x); }
    else if (T === 'scope') { const c = R.scope; if (c.phase === 'focus') S.ptr.kind = 'focus'; else if (c.phase === 'count') scopeTap(x, y); } }
  function onMove(e) { const P = S.ptr; if (!P || !P.kind || !J) return; const { x, y } = local(e);
    if (P.kind === 'shake') { for (const [ax, v] of [['ax', x], ['ay', y]]) { const d = v - P[ax]; if (Math.abs(d) > 22) { const s = Math.sign(d), key = ax === 'ax' ? 'dx' : 'dy'; if (s !== P[key]) { if (P[key]) shakeStep(); P[key] = s; } P[ax] = v; } } }
    else if (P.kind === 'spin') { const c = P.c, a = Math.atan2(y - c.y, x - c.x); let da = a - P.ang; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; P.ang = a; if (Math.hypot(x - c.x, y - c.y) > 16) spinAdd(Math.abs(da)); }
    else if (P.kind === 'focus') focusBy(-(y - P.y) / (CHh() * 0.6));
    P.x = x; P.y = y; }
  function onUp() { const P = S.ptr; if (P && P.kind === 'pip') pipRelease(); if (P && P.kind === 'heat' && R) R.heat.hold = false; S.ptr = null; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const onKD = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; audio.init && audio.init();
    if (S.phase === 'walk') { if (/^(Key[WASD]|Arrow)/.test(e.code)) { S.keys.add(e.code); e.preventDefault(); } return; }
    if (S.phase !== 'work' || !J || DM.on || e.repeat) return;
    if (e.code === 'Space') { e.preventDefault(); if (S.tool === 'pipette') pipStart(); else if (S.tool === 'heat' && R.pip.done) R.heat.hold = true; else if (S.tool === 'mix' && R.mix.state === 'shake') shakeStep(); else if (S.tool === 'spin' && R.pip.done) spinAdd(Math.PI * 0.9); }
    const n = +e.key; if (n >= 1 && n <= J.tasks.length) setTool(J.tasks[n - 1]); if (e.code === 'Enter') fileReport(); };
  const onKU = e => { S.keys.delete(e.code); if (e.code === 'Space' && S.phase === 'work' && R) { if (R.pip.hold) pipRelease(); R.heat.hold = false; } };
  const onBlur = () => { S.keys.clear(); if (R) R.heat.hold = false; };
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- flow ----------
  const drops = [];
  function startDay() { if (!['intro', 'done', 'walk'].includes(S.phase)) return; audio.init && audio.init(); S.dlg = null; Object.assign(S, { n: 0, earned: 0, tips: 0, starList: [], done: null, react: null }); swapBen(); ben.visible = false; place(adapa, SP.adapa); say('ADAPA: "Samples come to you. Read the card, do every job on it, file the report. Label everything."', 5); nextClient(); }
  function nextClient() { J = S.forceJob ? S.forceJob() : newJob(); R = freshRun(); CL = J.C; cf = clientFox[J.ci]; clientFox.forEach(f => f.visible = f === cf); cf.userData.mood = 'happy'; place(cf, SP.door, Math.PI); benchReset(); carry.visible = true; carry.material = toon(J.smp.col); S.phase = 'arrive'; S.phT = 0; S.tool = null; S.confirm = 0; S.seen = {}; tone(520, 0.1, 0.03); setTimeout(() => tone(660, 0.14, 0.03), 120); }
  function fileReport() { if (S.phase !== 'work' || !J) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP FILE REPORT AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishJob(); }
  function finishJob() { const T = J.tasks, q = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }).reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.9 ? 3 : q >= 0.68 ? 2 : 1, level = stars === 3 ? (q >= 0.97 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const fixed = T.filter(t => info(t).done).length, pay = J.smp.price + fixed * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('radio') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const RC = REACT[level]; cf.userData.mood = RC.mood; S.react = { word: RC.word, col: RC.col, line: pick(RC.lines), who: CL.name, stars, tip, pay }; S.phase = 'react'; S.phT = 0; S.ptr = null; S.tool = null; if (R) R.heat.hold = false;
    tone(level === 'grumpy' ? 260 : 880, 0.18, 0.05, level === 'grumpy' ? 'sawtooth' : 'triangle'); if (stars === 3) { setTimeout(() => tone(1175, 0.1, 0.05), 110); setTimeout(() => tone(1568, 0.16, 0.05), 220); for (let i = 0; i < 10; i++) puff(cf.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), cf.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; J = null; R = null; clientFox.forEach(f => f.visible = false); carry.visible = false; benchReset(); swapBen(); ben.visible = true; place(ben, SP.ben); place(adapa, SP.adapaIntro);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('urLabCoat')) { save.setFlag('urLabCoat'); unlock.push('LAB COAT + GOGGLES (with the UR LAB badge)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    swapBen(); place(ben, SP.ben);
    S.done = { day: S.day, fixed: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    say(eod ? 'ADAPA: "Employee of the day. I will be telling the college, which I never do."' : avg >= 2 ? 'ADAPA: "Tidy work. Same bench tomorrow."' : 'ADAPA: "Read the card twice. Pour once."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); tone(1320, 0.1, 0.05); return true; }
  function toIntro() { S.phase = 'intro'; S.done = null; S.dlg = null; J = null; R = null; clientFox.forEach(f => f.visible = false); carry.visible = false; benchReset(); swapBen(); ben.visible = true; place(ben, SP.ben); place(adapa, SP.adapaIntro); }
  function toWalk() { if (DM.on) return; S.phase = 'walk'; S.done = null; S.dlg = null; J = null; R = null; clientFox.forEach(f => f.visible = false); carry.visible = false; benchReset(); swapBen(); ben.visible = true; place(ben, SP.walkStart); place(adapa, SP.adapa); S.stick.x = S.stick.y = 0; audio.init && audio.init(); }

  // ---------- WALK MODE ----------
  const solidsW = L.solids, NPCR = 0.42;
  function collide(p) { const r = 0.32, b = L.bounds; p.x = clamp(p.x, b.x0, b.x1); p.z = clamp(p.z, b.z0, Math.abs(p.x) < 0.8 ? b.z1 + 0.6 : b.z1);
    for (const [x0, z0, x1, z1] of solidsW) { const cx = clamp(p.x, x0, x1), cz = clamp(p.z, z0, z1), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz); if (d < r) { if (d > 1e-4) { p.x = cx + dx / d * r; p.z = cz + dz / d * r; } else { p.z = z1 + r; } } }
    for (const n of NPCS) { const dx = p.x - n.f.position.x, dz = p.z - n.f.position.z, d = Math.hypot(dx, dz); if (d < NPCR + r && d > 1e-4) { p.x = n.f.position.x + dx / d * (NPCR + r); p.z = n.f.position.z + dz / d * (NPCR + r); } } }
  function nearest() { const p = ben.position; let best = null, bd = 9;
    for (const n of NPCS) { const d = Math.hypot(p.x - n.f.position.x, p.z - n.f.position.z); if (d < 1.6 && d < bd) { bd = d; best = { id: n.id, label: 'TALK · ' + n.name, npc: n }; } }
    if (best) return best;
    for (const t of L.things) { if (t.near) { if (t.near(p)) return { id: t.id, label: t.label }; continue; } const d = Math.hypot(p.x - t.x, p.z - t.z); if (d < t.r && d < bd) { bd = d; best = { id: t.id, label: t.label }; } } return best; }
  const DLG = {
    adapa: () => ({ name: 'DR. ADAPA', role: 'LAB DIRECTOR', npc: adapa, lines: coatOn() ? ['The coat suits you. Kish tells me you have stopped spilling things.', 'There are samples waiting. There are always samples waiting.'] : ['You are the new technician. Good. The bench is the long one, the samples come to you, and the results go in the book.', 'Everything in this room is labelled. Read the label before you pour anything. That is the whole of the training.'],
      choices: [{ text: 'Put me to work.', go: () => { closeDialog(); startDay(); } }, { text: 'What do you study here?', lines: ['Water, mostly. The lake, the wells, whatever the haulers bring up. The city drinks it, so somebody had better look at it.', 'And the occasional espresso. Ku-bau is very insistent.'] }, { text: 'What is in the tanks?', lines: ['Specimens.', 'They are asleep, they are fed, and they are not your department. The bench is your department.'] }, { text: 'Bye.', bye: true, go: () => closeDialog() }] }),
    kish: () => ({ name: 'KISH', role: 'LAB DESK', npc: kish, lines: ['Sign in. Do not open the north door. Both of those are rules.'],
      choices: [{ text: 'How does a shift work?', lines: ['Somebody walks in with a sample. You draw it, mix it, heat it, spin it, look at it. Whatever the card says.', 'Then you file the report and they pay you. If you were careful, they tip. If you were not careful, they tell me about it.'] }, { text: 'What is behind the north door?', lines: ['Storage.', '...', 'Do not open the north door.'] }, { text: 'Clock me in.', go: () => { closeDialog(); startDay(); } }, { text: 'Bye.', bye: true, go: () => closeDialog() }] }) };
  function openDialog(id) { const d = DLG[id](); S.dlg = { ...d, i: 0, base: d.lines, asked: {} }; d.npc.userData.talking = true; tone(660, 0.06, 0.03); }
  function closeDialog() { if (S.dlg && S.dlg.npc) { S.dlg.npc.userData.talking = false; } S.dlg = null; }
  function nextLine() { const d = S.dlg; if (!d) return; if (d.i < d.lines.length - 1) { d.i++; tone(560, 0.04, 0.02); return; } if (!d.choices) closeDialog(); }
  function choose(i) { const d = S.dlg; if (!d || d.i < d.lines.length - 1) return; const c = d.choices[i]; if (!c) return; if (c.go) { c.go(); return; } if (c.lines) { d.asked[i] = 1; d.lines = c.lines; d.i = 0; tone(600, 0.05, 0.03); } }
  function useThing() { if (S.phase !== 'walk') return; if (S.dlg) { nextLine(); return; } const n = nearest(); if (!n) { flash('NOTHING TO USE HERE · WALK UP TO SOMETHING', '#ffffff', 1.2); return; }
    if (n.npc) { openDialog(n.id); return; }
    if (n.id === 'bench') { startDay(); return; }
    if (n.id === 'orrery') { L.orrery.boost = 1.5; flash('THE ORRERY WHIRRS · BRASS WORLDS ROUND A BRASS SUN', '#e6b45a', 2); [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.12, 0.04, 'sine'), i * 90)); return; }
    if (n.id === 'north') { flash('LOCKED · EMPLOYEES ONLY · KISH IS WATCHING YOU', '#ec3013', 2.2); tone(140, 0.25, 0.05, 'square'); kish.userData.mood = 'stern'; setTimeout(() => kish.userData.mood = 'neutral', 2500); return; }
    if (n.id === 'tanks') { flash('SPECIMEN TANKS · SOMETHING IN THE FAR ONE OPENS AN EYE', '#7fe3ff', 2.4); L.tanks[2].stare = 1.2; setTimeout(() => L.tanks[2].stare = 0, 2200); tone(110, 0.5, 0.04, 'sine'); return; }
    if (n.id === 'cases') { flash('OLD BRASS TOOLS AND A CRYSTAL SHARD THAT HUMS', '#7fe3ff', 2.2); tone(880, 0.3, 0.02, 'sine'); return; }
    if (n.id === 'board') { flash('“LABEL EVERYTHING — A.” UNDERLINED THREE TIMES', '#ffffff', 2.2); return; }
    if (n.id === 'exit') { if (onExit) onExit(); else { flash('OUT TO LAB PATH · BACK INSIDE FOR NOW', '#ffffff', 1.6); toIntro(); } } }
  function doWave() { if (S.phase !== 'walk') return; S.wave = 1.3; tone(784, 0.08, 0.03); for (const n of [...NPCS]) if (n.f.position.distanceTo(ben.position) < 4.5) n.waveT = -0.4; }
  function doHop() { if (S.phase !== 'walk') return; ben.userData.hop = 1; tone(440, 0.08, 0.03, 'triangle'); }
  function walkStep(dt) { if (S.dlg) { kit.animFox(ben, dt, 0); const n = S.dlg.npc; const a = Math.atan2(n.position.x - ben.position.x, n.position.z - ben.position.z); ben.rotation.y = a; return; }
    let sx = S.stick.x, sy = S.stick.y; const K = S.keys; if (K.has('KeyA') || K.has('ArrowLeft')) sx = -1; if (K.has('KeyD') || K.has('ArrowRight')) sx = 1; if (K.has('KeyW') || K.has('ArrowUp')) sy = 1; if (K.has('KeyS') || K.has('ArrowDown')) sy = -1;
    const m = Math.min(1, Math.hypot(sx, sy)), spd = 3.4 * m; if (m > 0.08) { const vx = sx / Math.max(1, Math.hypot(sx, sy)), vz = -sy / Math.max(1, Math.hypot(sx, sy)); ben.position.x += vx * spd * dt; ben.position.z += vz * spd * dt; const a = Math.atan2(vx, vz); let da = a - ben.rotation.y; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; ben.rotation.y += da * Math.min(1, dt * 12); }
    collide(ben.position); kit.animFox(ben, dt, spd);
    if (ben.position.z > L.bounds.z1 + 0.4) { ben.position.z = L.bounds.z1 + 0.3; useThingId('exit'); } }
  function useThingId(id) { if (id === 'exit') { if (onExit) onExit(); else { flash('OUT TO LAB PATH · BACK INSIDE FOR NOW', '#ffffff', 1.6); toIntro(); } } }

  // ---------- camera ----------
  const { SAFE, shotFor } = cameraFit(ST), CAM = { look: V3(0, 1.2, 0) };
  camera.position.set(0, 3.2, 7); camera.lookAt(CAM.look);
  const fx = (f, o, h = 1.9) => { o.push(V3(f.position.x - 0.45, 0, f.position.z), V3(f.position.x + 0.45, 0, f.position.z), V3(f.position.x, h, f.position.z)); return o; };
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; fx({ position: V3(SP.ben.x, 0, SP.ben.z) }, o, 2.0); fx({ position: V3(SP.adapaIntro.x, 0, SP.adapaIntro.z) }, o, 2.0); o.push(V3(-2.2, TOP + 0.6, -1.6), V3(2.2, TOP + 0.6, -1.6)); return o; }, 0.16, Math.PI - 0.12, port ? 0.1 : 0.05);
    if (S.phase === 'walk') { const p = ben.position, d = port ? 10.5 : 7.6, h = port ? 9.6 : 4.8; const pos = V3(p.x * 0.8, h, p.z + d), look = V3(p.x * 0.92, 0.7, p.z - (port ? 1.6 : 2.2)); return { pos, look }; }
    if (S.phase === 'arrive' || S.phase === 'leave') return shotFor('room' + k, () => [V3(-5, 0, -1.6), V3(4, 0, -1.6), V3(-5, 2.2, -1.2), V3(0, 2.2, 5.6), V3(0, 0, 5.6), V3(4, TOP, -1.6)], 0.38, Math.PI - 0.15, 0.05);
    if (S.phase === 'react') { const f = cf.position; return shotFor('react' + k + J.id, () => { const o = []; fx(cf, o, 2.1); o.push(V3(f.x + 0.9, TOP, f.z + 0.2), V3(f.x - 0.6, 1.2, f.z)); return o; }, 0.16, Math.PI - 0.45, 0.1); }
    if (S.phase !== 'work' || !S.tool) return shotFor('bench' + k, () => [V3(-3.8, TOP, -1.4), V3(3.8, TOP, -1.4), V3(-3.8, TOP + 0.8, -1.9), V3(3.8, TOP + 0.8, -1.9), V3(-4.6, 1.9, -1.2)], 0.36, Math.PI - 0.06, 0.05);
    const T = S.tool, c = STN[T], b = (p, rx, ry, rz = 0.12) => [V3(p.x - rx, p.y - ry, p.z - rz), V3(p.x + rx, p.y + ry, p.z + rz)];
    if (T === 'pipette') { const p = V3(-3.0, TOP + 0.4, -1.42); return shotFor('pip' + k, () => [...b(p, port ? 0.24 : 0.36, 0.42), V3(-3.62, TOP, -1.25)], 0.2, Math.PI - 0.12, 0.08); }
    if (T === 'mix') { const p = V3(-1.5, TOP + 0.35, -1.6); return shotFor('mix' + k, () => [...b(p, port ? 0.62 : 0.7, 0.36, 0.3)], 0.32, Math.PI - 0.04, 0.06); }
    if (T === 'heat') { const p = V3(0.15, TOP + 0.45, -1.42); return shotFor('heat' + k, () => [...b(p, port ? 0.24 : 0.3, 0.48)], 0.2, Math.PI - 0.08, 0.08); }
    if (T === 'spin') { const p = V3(1.75, TOP + 0.2, -1.42); return shotFor('spin' + k, () => [...b(p, 0.34, 0.26, 0.3)], 0.62, Math.PI - 0.04, 0.08); }
    if (T === 'scope') { const p = V3(3.15, TOP + 0.35, -1.45); return shotFor('scope' + k, () => [...b(p, 0.5, 0.4)], 0.25, Math.PI - 0.3, 0.04); }
    return { pos: camera.position.clone(), look: CAM.look.clone() }; }

  // ---------- DEMO: autopilot works one sample with every job, with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {} };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.3); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = (p, j = 0) => { hand.visible = true; hand.position.copy(p).add(V3(j, 0, 0.15)); hand.scale.setScalar(0.45); };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  function demoAct() { if (!J) return 0.5; const T = nextTask();
    if (!T) { DM.cap = 'EVERY JOB DONE: TAP FILE REPORT'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.rep) { DM.seen.rep = 1; return 1.6; } fileReport(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'JOB ' + (J.tasks.indexOf(T) + 1) + ' OF ' + J.tasks.length + ': TAP ' + TASKS[T].label + ' AT THE BOTTOM'; DM.key = 'TAP'; hand.visible = false; return 1.4; }
    if (T === 'pipette') { const w = cap('pip', 'HOLD', 'HOLD TO DRAW THE SAMPLE. LET GO WHEN THE BAR HITS THE GREEN: ' + J.ml + ' mL', 2.2); if (w) return w; handAt(STN.pipette.p); if (!R.pip.hold) { pipStart(); DM.pip = true; } return 0.05; }
    if (T === 'mix') { const m = R.mix; if (m.state === 'drops') { const k = RK.find(q => m.drops[q] < (J.recipe[q] || 0)); const w = cap('mix', 'TAP', 'TAP THE BOTTLES TO DRIP IN THE RECIPE ON THE CARD', 2); if (w) return w; const bt = STN.mix.bottles.find(q => q.k === k); handAt(wp(bt.b).add(V3(0, 0.15, 0))); addDrop(k); return 0.65; }
      const w = cap('shake', 'SWIPE', 'STOPPER ON. SWIPE BACK AND FORTH TO SHAKE IT', 1.8); if (w) return w; DM.j = (DM.j || 1) * -1; handAt(wp(STN.mix.flask).add(V3(0, 0.2, 0)), DM.j * 0.15); shakeStep(); return 0.16; }
    if (T === 'heat') { const w = cap('heat', 'HOLD', 'HOLD TO TURN THE FLAME UP, LET GO TO COOL. KEEP IT IN THE GREEN', 2.2); if (w) return w; const h = R.heat, lo = J.heat[1], hi = J.heat[2]; handAt(STN.heat.p.clone().add(V3(0, -0.2, 0))); h.hold = h.temp < (lo + hi) / 2 - 2 ? true : h.temp > (lo + hi) / 2 + 2 ? false : h.hold; DM.key = h.hold ? 'HOLD' : 'LET GO'; return 0.05; }
    if (T === 'spin') { const w = cap('spin', 'CIRCLES', 'DRAW CIRCLES WITH YOUR FINGER TO SPIN IT UP. KEEP THE SPEED IN THE GREEN', 2.2); if (w) return w; const s = R.spin, mid = (J.spin[1] + J.spin[2]) / 2; DM.a = (DM.a || 0) + 0.9; handAt(STN.spin.p.clone().add(V3(Math.cos(DM.a) * 0.18, 0.05, Math.sin(DM.a) * 0.18))); if (s.rpm < mid) spinAdd(Math.PI * 0.55); return 0.08; }
    if (T === 'scope') { const c = R.scope; if (c.phase === 'focus') { const w = cap('focus', 'DRAG', 'DRAG UP OR DOWN TO FOCUS THE MICROSCOPE UNTIL IT IS SHARP', 2.2); if (w) return w; hand.visible = false; focusBy(Math.sign(c.target - c.focus) * 0.025); return 0.05; }
      const w = cap('count', 'TAP', 'NOW TAP EVERY ' + CELLS[J.cell].one + ' · THE CARD SAYS ' + J.count, 2.2); if (w) return w; const q = c.cells.find(z => !z.tag && z.type === J.cell); if (q) { const o = OV.rect; scopeTap(o.cx + q.x * o.r, o.cy + q.y * o.r); } return 0.7; }
    return 0.5; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.25, hand.scale.x - dt * 0.8));
    if (S.phase === 'arrive') { DM.cap = 'SAMPLES ARRIVE AT THE DOOR. KISH SIGNS THEM IN'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE CLIENT READS YOUR REPORT. CAREFUL WORK EARNS STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return;
    if (DM.pip && R.pip.hold) { if (R.pip.v >= J.ml / 10 - 0.005) { pipRelease(); DM.pip = false; DM.cd = 0.9; } return; }
    DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || !['intro', 'done', 'walk'].includes(S.phase)) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.cd = 1.4; DM.cap = 'WATCH A SAMPLE GET TESTED AT THE UR LAB'; DM.key = ''; S.done = null; S.dlg = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 3; S.force = true; S.forceClient = 5; startDay(); S.force = false; S.forceClient = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; DM.pip = false; hand.visible = false; S.ptr = null; S.react = null; S.flash = null; S.day = DM.day0; Object.assign(S, { n: 0, earned: 0, tips: 0, starList: [], tool: null }); toIntro(); }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !J) return null; const T = S.tool, H = (p, text, r = 0.14) => ({ p, text, tool: T, r });
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : { text: 'ALL DONE · TAP FILE REPORT', tool: 'report' }; }
    if (T === 'pipette') return H(STN.pipette.p, R.pip.hold ? 'LET GO IN THE GREEN · ' + J.ml + ' mL' : 'HOLD ANYWHERE TO DRAW ' + J.ml + ' mL');
    if (T === 'mix') { const m = R.mix; if (m.state === 'shake') return H(wp(STN.mix.flask).add(V3(0, 0.15, 0)), 'SWIPE BACK AND FORTH TO SHAKE · ' + Math.round(m.shake * 100) + '%');
      const over = RK.find(k => m.drops[k] > (J.recipe[k] || 0)); if (over) return { text: 'WRONG DROPS · TAP DUMP BELOW', tool: T }; const k = RK.find(q => m.drops[q] < (J.recipe[q] || 0)); const bt = STN.mix.bottles.find(q => q.k === k); return H(wp(bt.b).add(V3(0, 0.12, 0)), 'TAP ' + REAGENTS[k].name + ' · ' + m.drops[k] + ' / ' + J.recipe[k]); }
    if (T === 'heat') return H(STN.heat.p.clone().add(V3(0, -0.25, 0)), 'HOLD = FLAME UP · LET GO = COOL · STAY IN THE GREEN');
    if (T === 'spin') return H(STN.spin.p, 'DRAW CIRCLES TO SPIN · STAY IN THE GREEN', 0.2);
    if (T === 'scope') { const c = R.scope; return { text: c.phase === 'focus' ? 'DRAG UP OR DOWN TO FOCUS' : 'TAP EVERY ' + CELLS[J.cell].one + ' · ' + c.tagged + ' / ' + J.count, tool: T }; }
    return null; }
  let HINT = null, hintT = 0;

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const walkTo = (f, tx, tz, dt, spd = 2.2) => { const dx = tx - f.position.x, dz = tz - f.position.z, d = Math.hypot(dx, dz); if (d < 0.05) { kit.animFox(f, dt, 0); return true; } const s = Math.min(d, spd * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; f.rotation.y = Math.atan2(dx, dz); kit.animFox(f, dt, spd); return false; };
  function step(dt) { const t = clock.elapsedTime; S.phT += dt; L.animate(t, dt);
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.12 + (1 - p.life) * 0.22); }
    // reagent drops in flight + bottle tilt
    for (const d of drops) { d.t += dt * 2.4; } while (drops.length && drops[0].t >= 1) { const d = drops.shift(); if (R && J) { STN.mix.fLiq.material.color.copy(mixColor()); const p = d.to; puff(p.x, p.y - 0.1, p.z, 0xffffff, 1); } }
    if (!dropM.length) for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); m.visible = false; scene.add(m); dropM.push(m); }
    dropM.forEach((m, i) => { const d = drops[i]; m.visible = !!d; if (d) { m.material.color.set(REAGENTS[d.k].col); m.position.lerpVectors(d.from, d.to, d.t); m.position.y += Math.sin(d.t * Math.PI) * 0.18; } });
    for (const b of STN.mix.bottles) { b.tilt = Math.max(0, (b.tilt || 0) - dt * 2.5); b.g.rotation.z = Math.sin(b.tilt * Math.PI) * 0.9; b.g.position.y = 0.5 + Math.sin(b.tilt * Math.PI) * 0.12; }
    // the job's live apparatus
    if (R && J) {
      const P = R.pip; if (P.hold) { P.v = Math.min(1.08, P.v + dt * (upg('pipette') ? 0.24 : 0.3)); if (Math.random() < dt * 8) tone(300 + P.v * 500, 0.04, 0.015, 'sine'); if (P.v >= 1.07) { flash('OVERFLOW!', '#ec3013', 1); pipRelease(); } }
      STN.pipette.pLiq.scale.y = Math.max(0.001, P.done ? 0.001 : P.v * 0.92); STN.pipette.bulb.scale.set(P.hold ? 0.8 : 1, P.hold ? 1.05 : 1.3, P.hold ? 0.8 : 1); if (!P.done && J) STN.pipette.vLiq.scale.y = Math.max(0.15, 1 - P.v * 0.6);
      const Mx = R.mix; Mx.wob = Math.max(0, Mx.wob - dt * 4); STN.mix.flask.parent.rotation.z = Math.sin(t * 40) * Mx.wob * 0.12;
      const Hh = R.heat, live = S.phase === 'work' && S.tool === 'heat' && !Hh.done; Hh.flame = damp(Hh.flame, live && Hh.hold ? 1 : 0.12, 8, dt);
      if (S.phase === 'work' && J.tasks.includes('heat') && R.pip.done) { Hh.temp += (Hh.flame * 34 - (Hh.temp - 20) * 0.3) * dt * heatK(); Hh.temp = clamp(Hh.temp, 18, 115);
        if (live) { const lo = J.heat[1], hi = J.heat[2]; if (Hh.temp >= lo && Hh.temp <= hi) Hh.prog += dt; if (Hh.temp > hi + 8) { Hh.over += dt; Hh.warnT -= dt; if (Hh.warnT <= 0) { Hh.warnT = 1.2; flash('BOILING OVER · LET GO', '#ec3013', 1); } if (Math.random() < dt * 10) { const p = wp(STN.heat.beaker); puff(p.x, p.y + 0.15, p.z, 0xffffff, 1); } }
          Hh.q = clamp(1 - Hh.over * 0.22, 0.4, 1); if (Hh.prog >= NEED.heat) { Hh.done = true; Hh.hold = false; taskDone('heat'); } } }
      STN.heat.flame.scale.set(0.8 + Hh.flame * 0.6, 0.3 + Hh.flame * 1.6 + Math.sin(t * 30) * 0.05 * Hh.flame, 0.8 + Hh.flame * 0.6); STN.heat.f1.material.color.setHex(Hh.flame > 0.5 ? 0x5aa8ff : 0x7fb8ff);
      STN.heat.mercury.scale.y = clamp((Hh.temp - 10) / 100, 0.05, 1); STN.heat.bubbles.forEach((b, i) => { b.visible = STN.heat.bLiq.visible && Hh.temp > 50; if (b.visible) { b.position.y += dt * (0.1 + (Hh.temp - 50) / 200); if (b.position.y > 0.58) b.position.set(rr(-0.06, 0.06), 0.47, rr(-0.06, 0.06)); } });
      const Sp = R.spin; Sp.rpm = Math.max(0, Sp.rpm - dt * (0.09 + Sp.rpm * 0.1)); if (S.phase === 'work' && S.tool === 'spin' && !Sp.done) { const lo = J.spin[1], hi = J.spin[2]; if (Sp.rpm >= lo && Sp.rpm <= hi) Sp.prog += dt; if (Sp.rpm > 0.94) { Sp.over += dt; if (Math.random() < dt * 4) flash('TOO FAST · THE TUBES RATTLE', '#ec3013', 0.8); } Sp.q = clamp(1 - Sp.over * 0.25, 0.4, 1); if (Sp.prog >= NEED.spin) { Sp.done = true; taskDone('spin'); } }
      STN.spin.rotor.rotation.y += Sp.rpm * 38 * dt; STN.spin.g.position.x = 1.75 + (Sp.rpm > 0.94 ? Math.sin(t * 90) * 0.006 : 0); const inZ = Sp.rpm >= J.spin[1] && Sp.rpm <= J.spin[2]; STN.spin.led.material.color.setHex(Sp.done ? 0x22c55e : Sp.rpm < 0.05 ? 0x3a3836 : inZ ? 0x22c55e : Sp.rpm > J.spin[2] ? 0xec3013 : 0xffd23a);
      if (Sp.rpm > 0.1 && Math.random() < dt * 20) tone(120 + Sp.rpm * 300, 0.03, 0.01, 'sawtooth'); }
    // clients
    if (cf && J) { if (S.phase === 'arrive') { const w = S.phT < 0.6 ? walkTo(cf, SP.inside.x, SP.inside.z, dt) : walkTo(cf, SP.drop.x, SP.drop.z, dt);
        carry.position.copy(cf.position).add(V3(Math.sin(cf.rotation.y + 0.9) * 0.36, 0.95, Math.cos(cf.rotation.y + 0.9) * 0.36));
        if (w && S.phT > 0.8) { cf.rotation.y = SP.drop.ry; carry.visible = false; sampleIn(); const p = wp(STN.pipette.vial); puff(p.x, p.y + 0.15, p.z, 0xffe7a0, 3); S.phase = 'work'; S.phT = 0; S.tool = 'pipette'; say(CL.name + ': "' + J.line + '"', 4.5); tone(880, 0.08, 0.04); } }
      else if (S.phase === 'work') { cf.position.set(SP.drop.x, 0, SP.drop.z); cf.rotation.y = SP.drop.ry; kit.animFox(cf, dt, 0); }
      else if (S.phase === 'react') { cf.rotation.y = damp(cf.rotation.y, 0.45, 4, dt); kit.animFox(cf, dt, 0); if (S.react.stars === 3 && S.phT < 0.3) cf.userData.hop = 1; if (S.phT > 2.9) { S.react = null; S.phase = 'leave'; S.phT = 0; } }
      else if (S.phase === 'leave') { const w = walkTo(cf, S.phT < 1.6 ? SP.inside.x : SP.door.x, S.phT < 1.6 ? SP.inside.z + 0.5 : SP.door.z + 1, dt, 2.6); if (DM.on && S.phT > 2.4) { demoStop(); return; } if (S.phT > 2.6) { cf.visible = false; S.n++; if (S.n >= LAB.perDay) endDay(); else nextClient(); } } }
    // walk + NPC idle
    if (S.phase === 'walk') walkStep(dt); else if (ben.visible) kit.animFox(ben, dt, 0);
    for (const n of NPCS) { const f = n.f, home = n.id === 'kish' ? SP.kish : (S.phase === 'intro' || S.phase === 'done') ? SP.adapaIntro : SP.adapa;
      if (n.id === 'adapa' && Math.hypot(f.position.x - home.x, f.position.z - home.z) > 0.1 && S.phase !== 'walk') { walkTo(f, home.x, home.z, dt, 2); continue; }
      let face = home.ry; if (S.phase === 'walk' && ben.visible) { const d = Math.hypot(ben.position.x - f.position.x, ben.position.z - f.position.z); if (d < 3.5) face = Math.atan2(ben.position.x - f.position.x, ben.position.z - f.position.z); }
      else if (S.phase === 'work' && n.id === 'adapa') face = 1.2; let da = face - f.rotation.y; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; f.rotation.y += da * Math.min(1, dt * 4); kit.animFox(f, dt, 0);
      if (n.waveT != null) { n.waveT += dt; if (n.waveT > 0 && n.waveT < 1.2) f.userData.P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); if (n.waveT > 1.2) n.waveT = null; } }
    // greeting / wave poses
    const BP = ben.userData.P, greet = S.phase === 'intro' || S.phase === 'done'; ben.userData.mood = greet ? 'excited' : 'happy';
    if ((greet || S.wave > 0) && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); S.wave = Math.max(0, S.wave - dt);
    if (greet) { adapa.userData.mood = 'warm'; }
    // camera
    const sh = shot(), k = S.phase === 'walk' ? 5 : S.phase === 'work' ? 3.2 : 2.2; camera.position.lerp(sh.pos, Math.min(1, dt * k)); CAM.look.lerp(sh.look, Math.min(1, dt * k)); camera.lookAt(CAM.look);
    L.front.forEach(m => m.visible = S.phase === 'walk');
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p && !(S.tool === 'scope') ? HINT : null; RINGS.place(vis, hintT, dt); if (vis) { RINGS.pulse.rotation.x = RINGS.pulse2.rotation.x = Math.PI / 2; RINGS.pulse.position.z += 0.12; RINGS.pulse2.position.z += 0.12; RINGS.arrow.visible = false; }
    drawScope(dt); }
  const dropM = [];
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = gaugeLive() ? 0.04 : 0.1; onState(hud()); } }
  const gaugeLive = () => S.phase === 'work' && R && (S.tool === 'pipette' || S.tool === 'heat' || S.tool === 'spin' || (S.tool === 'scope' && R.scope.phase === 'focus'));
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function gauge() { if (S.phase !== 'work' || !R || !J) return null; const T = S.tool;
    if (T === 'pipette' && !R.pip.done) { const p = R.pip, tgt = J.ml / 10, b = pipBand(), v = p.v; return { title: 'PIPETTE · ' + J.ml + ' mL', v: v / 1.08, lo: (tgt - b) / 1.08, hi: (tgt + b) / 1.08, read: (v * 10).toFixed(1) + ' mL', zone: !p.hold ? 'HOLD TO DRAW' : v < tgt - b ? 'KEEP HOLDING' : v <= tgt + b ? 'LET GO NOW!' : 'TOO MUCH', zc: p.hold && Math.abs(v - tgt) <= b ? '#22c55e' : p.hold && v > tgt + b ? '#ec3013' : '#ffffff', prog: null }; }
    if (T === 'heat' && !R.heat.done && R.pip.done) { const h = R.heat, lo = J.heat[1], hi = J.heat[2], f = x => clamp((x - 20) / 90, 0, 1); return { title: 'HEAT · ' + J.heat[0] + ' ' + lo + '–' + hi + '°C', v: f(h.temp), lo: f(lo), hi: f(hi), read: Math.round(h.temp) + '°C', zone: h.temp < lo ? (h.hold ? 'WARMING UP…' : 'TOO COOL · HOLD') : h.temp <= hi ? 'JUST RIGHT' : h.temp <= hi + 8 ? 'TOO HOT · LET GO' : 'BOILING OVER!', zc: h.temp < lo ? '#ffffff' : h.temp <= hi ? '#22c55e' : '#ec3013', prog: h.prog / NEED.heat }; }
    if (T === 'spin' && !R.spin.done && R.pip.done) { const s = R.spin, lo = J.spin[1], hi = J.spin[2]; return { title: 'SPIN · ' + J.spin[0], v: clamp(s.rpm, 0, 1), lo, hi, read: Math.round(s.rpm * 4000) + ' RPM', zone: s.rpm < lo ? 'FASTER · DRAW CIRCLES' : s.rpm <= hi ? 'HOLD THAT SPEED' : s.rpm <= 0.94 ? 'EASE OFF' : 'TOO FAST!', zc: s.rpm < lo ? '#ffffff' : s.rpm <= hi ? '#22c55e' : '#ec3013', prog: s.prog / NEED.spin }; }
    return null; }
  function hud() { const port = CW() < CHh();
    const job = J ? { client: CL.name, role: CL.role, sample: J.smp.name, sampleCol: J.smp.col, ml: J.ml, heat: J.heat[0] + ' ' + J.heat[1] + '–' + J.heat[2] + '°C', spin: J.spin[0], cell: CELLS[J.cell].name, cellCol: CELLS[J.cell].col, count: J.count,
      recipe: RK.filter(k => J.recipe[k]).map(k => ({ k, name: REAGENTS[k].name, col: REAGENTS[k].col, n: J.recipe[k], have: R ? R.mix.drops[k] : 0 })), tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt, locked: id !== 'pipette' && R && !R.pip.done }; }) } : null;
    const nb = nearest && S.phase === 'walk' ? nearest() : null, d = S.dlg;
    return { phase: S.phase, day: S.day, n: S.n, perDay: LAB.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, job, tool: S.tool,
      mix: R && J && J.tasks.includes('mix') ? { state: R.mix.state, drops: { ...R.mix.drops }, over: RK.some(k => R.mix.drops[k] > (J.recipe[k] || 0)) } : null, picker: !!(R && S.phase === 'work' && S.tool === 'mix' && R.mix.state === 'drops' && R.pip.done),
      gauge: gauge(), scopeOn: OV.on, scopePhase: R ? R.scope.phase : null, allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: coatOn(), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      walk: S.phase === 'walk' ? { prompt: d ? null : nb ? nb.label : null, quest: nb ? nb.label : 'Walk up to the bench to clock in, or talk to Dr. Adapa', dialog: d ? { name: d.name, role: d.role, text: d.lines[d.i], step: d.i + 1, total: d.lines.length, more: d.i < d.lines.length - 1, choices: d.i >= d.lines.length - 1 && d.choices ? d.choices.map((c, i) => ({ text: c.text, asked: !!d.asked[i], bye: !!c.bye })) : null } : null } : null }; }
  frame();
  return {
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setTool, addDrop, dump, fileReport, startDay, demoStart, demoStop, buyUpgrade, hud, toIntro, toWalk, setPaused(v) { PAUSE = !!v; },
    // ----- Game HUD engine contract (walk mode) -----
    start() {}, talk() { useThing(); }, choose, closeDialog, nextLine, clearToast() {}, melee() { useThing(); }, range() { doWave(); }, jump() { doHop(); }, meleeUp() {},
    useItem() { flash('NO SNACKS AT THE BENCH', '#ffffff', 1.2); }, closeWheel() {}, skipTime() {}, setHudPad() {}, setStick(x, y) { S.stick.x = x; S.stick.y = y; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 8, pitch: 0.7 }; }, setCam() {}, setMinimap() {}, toggleSound() {}, cycleWeather() {},
    mapData() { const p = ben.position; return { p: [p.x, p.z, ben.rotation.y], b: [['BENCH', 0, -1.6], ['ADAPA', adapa.position.x, adapa.position.z], ['KISH', kish.position.x, kish.position.z], ['ORRERY', 5.2, 1.8], ['WAY OUT', 0, 5.8]], f: [], e: [], q: null }; },
    // ----- test hooks -----
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => S, _job: () => J, _run: () => R, _scr: scr, _wp: wp, _stn: STN, _ov: () => OV.rect, _ben: () => ben,
    _auto() { return { pipette() { R.pip.done = true; R.pip.q = 1; sampleOut(); }, mix() { RK.forEach(k => R.mix.drops[k] = J.recipe[k] || 0); R.mix.state = 'done'; R.mix.done = true; }, heat() { R.heat.done = true; }, spin() { R.spin.done = true; }, scope() { R.scope.phase = 'done'; } }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); OV.cv.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
