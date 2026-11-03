// 8 GATES — UMMI REYHAN'S CAMEL PEN [kufaCamelPen]. Camel trainer + carer at the dead end of the Kufa bazaar lane, by the market.
// A job location like Jon's Boatworks: one camel at a time, no clock, scored on quality. 3 camels = a day, then the day card.
// Flow: an owner leads a camel in through the gate → CARE CARD → work the jobs in any order → HAND BACK → owner reacts, pays + tips → camel leaves.
// Jobs (each ONE touch gesture):
//   WATER  swipe up/down to work the pump; keep the trough in the green while she drinks (spills waste water: Kufa's gold)
//   FEED   drag food from the bins to her mouth; the card says what (wrong food = she SPITS at you)
//   BRUSH  swipe over burrs and sand patches in her coat
//   FEET   press a thorn and pull it out slowly (yank = OUCH), then rub balm in circles on the pad
//   TRAIN  swipe the command while she is LOOKING AT YOU (green): DOWN = HOOSH (kneel), UP = HUP (stand), SIDEWAYS = YALLA (walk on); then tap her nose for a date
//   LOAD   she kneels; drag sacks onto the left/right packs and keep the saddle level (BRUSH FIRST: sand under a saddle rubs sores)
// WALK MODE: when you are not working, Ben walks the pen with the standard Game HUD (stick, 1 PAT, 2 CALL, 3 JUMP, TALK to Ummi).
// Camels: DROMEDARY · BACTRIAN · CALF. Save keys kufa.pen.*, flag camelUniform. Built on engine/restaurant-kit.js.
// MERGE: buildCamelPen(ctx) builds the pen at an origin (+ walk colliders); createCamelPen({ container, onState }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { PLAYER_FEMALE } from '../../fox-kit.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { createPenAudio } from './pen-audio.js';

export const PEN = { name: "UMMI'S CAMEL PEN", room: 'kufaCamelPen', world: 'kufa', perDay: 3 };
export const CAMELS = {
  drom: { name: 'DROMEDARY', humps: 1, k: 1, fur: '#c99a5b', dark: '#8a6234', price: 16, thirst: 1, tasks: ['water', 'feed', 'brush', 'feet', 'train', 'load'] },
  bact: { name: 'BACTRIAN', humps: 2, k: 1.04, fur: '#8a5f3a', dark: '#5a3a22', shag: true, price: 20, thirst: 1.25, tasks: ['water', 'feed', 'brush', 'feet', 'train', 'load'] },
  calf: { name: 'CALF', humps: 1, k: 0.66, fur: '#e6cb9c', dark: '#b08a5a', price: 12, thirst: 0.7, tasks: ['water', 'feed', 'brush', 'feet', 'train'] } };
export const TASKS = { water: { label: 'WATER', name: 'Fill the trough, no spills' }, feed: { label: 'FEED', name: 'Feed what the card says' }, brush: { label: 'BRUSH', name: 'Brush out burrs and sand' }, feet: { label: 'FEET', name: 'Pull thorns, rub in balm' }, train: { label: 'TRAIN', name: 'Teach the commands' }, load: { label: 'LOAD', name: 'Pack her level' } };
const ORDER = ['water', 'feed', 'brush', 'feet', 'train', 'load'];
export const FOODS = { hay: { name: 'HAY', col: '#e0c35e' }, alfalfa: { name: 'ALFALFA', col: '#7fb24a' }, dates: { name: 'DATES', col: '#7a3a1a' }, salt: { name: 'SALT', col: '#f2efe8' } };
const FK = Object.keys(FOODS);
export const CMDS = { kneel: { word: 'HOOSH', name: 'KNEEL', dir: 'down', arrow: '↓' }, stand: { word: 'HUP', name: 'STAND', dir: 'up', arrow: '↑' }, walk: { word: 'YALLA', name: 'WALK ON', dir: 'side', arrow: '→' } };
export const UPGRADES = [
  { id: 'pump', name: 'DOUBLE PUMP', cost: 35, line: 'Every stroke moves twice the water.' },
  { id: 'comb', name: 'CURRY COMB', cost: 30, line: 'Sand patches come out in half the strokes.' },
  { id: 'pincers', name: "FARRIER'S PINCERS", cost: 40, line: 'Thorns come out with a shorter pull.' },
  { id: 'dates', name: 'MEDJOOL DATES', cost: 35, line: 'Camels pay attention for longer when you train them.' },
  { id: 'oud', name: 'OUD PLAYER', cost: 60, line: 'A musician joins the pen: fuller music, owners tip 25% more.' }];
// owners: Kufa folk from the 2D world file (torso colours + fur), lines in their voice
const OWNERS = [
  { name: 'GHAZI', role: 'Caravan Master', fur: '#e88a4a', furDark: '#a8400c', torso: ['#8fa8e0', '#4a5fa8', '#1e2450'], outfit: 'coat', line: 'She pulls my second wagon. Five weeks standing in the pen and she is bored out of her mind.' },
  { name: 'SURA', role: 'Well-rider', fur: '#f0b070', furDark: '#dd9648', torso: ['#d8b98a', '#a8843f', '#5a4218'], outfit: 'robe', line: 'She has carried every water map I ever drew. Treat her kindly.' },
  { name: 'BAHRI', role: 'Keeper of the Oasis', fur: '#e07a3a', furDark: '#c2410c', torso: ['#a8c98a', '#6f9a4a', '#33501e'], outfit: 'robe', line: 'Fresh from the oasis. Still, somehow, thirsty.' },
  { name: 'JIBRIL', role: 'Wagon hand', fur: '#c98a4a', furDark: '#a8762e', torso: ['#8c4a2a', '#5a2f18', '#43301c'], outfit: 'vest', line: 'Nineteen crossings. She walked every one of them. I mostly sat.' },
  { name: 'RUKAYA', role: 'Keeper of the Way Station', fur: '#d9a45a', furDark: '#b8863c', torso: ['#cbb07a', '#8a6a2c', '#43301c'], outfit: 'dress', line: 'All the way from the way station. She has earned a brushing.' },
  { name: 'JAMIL', role: 'The Creamery', fur: '#e0a060', furDark: '#b8863c', torso: ['#f2b7c6', '#d4879c', '#43301c'], outfit: 'vest', line: 'She hauls the ice for the creamery. Please do not tell her it melts.' },
  { name: 'CAPTAIN IDRIS', role: 'Barracks', fur: '#d97a3a', furDark: '#a8400c', torso: ['#8fa8e0', '#4a5fa8', '#1e2450'], outfit: 'coat', line: 'Barracks camel. Stubborn. Like everybody else in the barracks.' }];
const DAHAB = { name: 'DAHAB', role: 'Driver', fur: '#f08a40', furDark: '#ea580c', torso: ['#e0a48a', '#b06848', '#5e2f1c'], outfit: 'vest', line: 'She waited four months at the way station for me. Make her shine.' };
// UMMI REYHAN (2D key kufaUmmi, scene kufaBazaar, title "Camel Pen"): look + talk, exported so a world map can place her and reuse her talk
export const UMMI = { key: 'kufaUmmi', name: 'Ummi Reyhan', role: 'Camel Pen', torso: ['#d8b98a', '#a8843f', '#5a4218'], outfit: 'robe', fur: '#f0a860', furDark: '#dd9648', elder: true, wrap: ['#2f6d6a', '#e6b45a'] };
export const UMMI_TALK = {
  greet: [{ who: 'player', text: 'You have the quiet end of the market.' }, { who: 'npc', text: 'It is a dead end, which means everything that comes down here has to come back past me. I have never had to go looking for news in my life.' }], // 2D, verbatim
  again: 'Go on.', dahabDone: 'He is on the road home. Slowly, I am told, and eating everything he passes, which is how I know it is really him.', // 2D, verbatim
  topics: [
    { id: 'work', text: 'Put me to work with the camels.', replies: ['Good. My knees are forty years older than these camels and they both know it.', 'Water, feed, brush, feet, the lessons and the load. Every camel comes with a card. Do what the card says and the owner pays you.'], action: 'work' }, // new: opens the job
    { id: 'market', text: 'Who runs this market?', replies: ['The broker thinks he does. The stalls think they do.', 'It is the camels. Everything in Kufa moves at the speed of something that has to drink.'] }, // 2D, verbatim
    { id: 'pair', text: 'Who are these two?', replies: ['Qamar is the old one. She has walked to the way station more times than Ghazi has, and she complains less.', 'Zahra is young. She thinks she is a horse. Nobody has had the heart to tell her.'] }, // new
    { id: 'bye', text: 'Later, Ummi.', bye: true, replies: ['I am not going anywhere. Neither are they.'], action: 'close' }] }; // 2D, verbatim
const NAMES = ['SAFFRON', 'BISCUIT', 'OLD THUNDER', 'SULTANA', 'PEBBLE', 'MIRAGE', 'HONEY', 'TOFFEE', 'SHADOW', 'DUNE', 'NUTMEG', 'LANTERN'];
const SAVE = { day: 'kufa.pen.day', best: 'kufa.pen.best', upg: 'kufa.pen.upg.', stars: 'kufa.pen.stars', camels: 'kufa.pen.camels' };
const CP = { x: -0.4, z: -0.9 }; // the work spot: the camel stands here facing +x (head over the trough)

// ---------------- the camel ----------------
let CAMEL_ID = 1;
function limb(T3, M, mat, parent, ax, ay, bx, by, r, z = 0, outline = 0.012) { const L = Math.hypot(bx - ax, by - ay), m = M(new T3.CapsuleGeometry(r, Math.max(0.01, L), 4, 10), mat, (ax + bx) / 2, (ay + by) / 2, z, parent, outline); m.rotation.z = Math.atan2(-(bx - ax), by - ay); return m; }
let SHADOW_TEX = null;
export function blobShadow(T3, CTX, w = 1, d = 1, op = 0.32) { if (!SHADOW_TEX) SHADOW_TEX = CTX(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(60,40,20,1)'); g.addColorStop(0.55, 'rgba(60,40,20,0.55)'); g.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const m = new T3.Mesh(new T3.PlaneGeometry(w, d), new T3.MeshBasicMaterial({ map: SHADOW_TEX, transparent: true, opacity: op, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; m.renderOrder = 1; return m; }
export function makeCamel(ctx, type, { blanket = null, bells = false, fur: furO = null, dark: darkO = null } = {}) {
  const T3 = ctx.THREE || THREE, { M, toon } = ctx, D = { ...CAMELS[type], ...(furO ? { fur: furO } : {}), ...(darkO ? { dark: darkO } : {}) };
  const g = new T3.Group(), bodyG = new T3.Group(); g.add(bodyG); g.scale.setScalar(D.k);
  const fur = toon(D.fur), dark = toon(D.dark), padM = toon('#4a3626'), ink = toon('#201e1d'), white = toon('#fbf8ec');
  { const sh = blobShadow(T3, ctx.canvasTex || canvasTex, 3.0, 1.3, 0.34); g.add(sh); }
  const C = { id: CAMEL_ID++, type, D, g, bodyG, legs: [], burrs: [], dust: [], kn: 0, knT: 0, hd: 0, hdT: 0, turn: 0, turnT: 0, rear: 0, walkPh: Math.random() * 6, walkAmt: 0, chew: 0, chewT: 0, blink: rr(1, 4), ears: 0, earsT: 0, happy: 0, t: Math.random() * 9, lift: [0, 0, 0, 0], liftT: [0, 0, 0, 0], tiltT: 0, tilt: 0 };
  const body = M(new T3.SphereGeometry(1, 26, 16), fur, 0, 1.6, 0, bodyG, 0.025); body.scale.set(1.0, 0.5, 0.45); C.body = body;
  M(new T3.SphereGeometry(0.2, 12, 8), dark, 0.62, 1.2, 0, bodyG, 0.01).scale.set(1, 0.6, 1.1); // chest pad
  C.humps = [];
  if (D.humps === 2) { for (const x of [-0.4, 0.36]) { const h = M(new T3.SphereGeometry(0.36, 16, 12), fur, x, 2.0, 0, bodyG, 0.02); h.scale.set(0.9, 1.15, 0.85); C.humps.push(h); for (let i = 0; i < 5; i++) M(new T3.ConeGeometry(0.06, 0.18, 5), dark, x + rr(-0.15, 0.15), 2.38 + rr(-0.04, 0.04), rr(-0.12, 0.12), bodyG, 0).rotation.z = rr(-0.5, 0.5); } }
  else { const h = M(new T3.SphereGeometry(0.5, 18, 12), fur, -0.06, 2.02, 0, bodyG, 0.02); h.scale.set(0.95, 1.0, 0.8); C.humps.push(h); }
  if (D.shag) for (const [x, y] of [[0.55, 1.75], [0.7, 1.45], [-0.2, 1.15], [0.3, 1.12]]) for (const s of [-1, 1]) M(new T3.ConeGeometry(0.09, 0.26, 5), dark, x, y, s * 0.36, bodyG, 0).rotation.set(s * 0.4, 0, Math.PI + rr(-0.3, 0.3));
  // neck + head (head points +x)
  const neck = new T3.Group(); neck.position.set(0.8, 1.72, 0); bodyG.add(neck); C.neck = neck;
  limb(T3, M, fur, neck, 0, 0, 0.42, 0.5, 0.2); limb(T3, M, fur, neck, 0.42, 0.5, 0.64, 0.84, 0.15);
  if (D.shag) for (let i = 0; i < 5; i++) M(new T3.ConeGeometry(0.07, 0.22, 5), dark, 0.1 + i * 0.1, i * 0.13 - 0.05, 0, neck, 0).rotation.z = Math.PI * 0.75;
  const head = new T3.Group(); head.position.set(0.72, 0.86, 0); neck.add(head); C.head = head;
  M(new T3.SphereGeometry(0.2, 16, 12), fur, 0, 0, 0, head, 0.012).scale.set(1.1, 0.95, 0.85);
  limb(T3, M, fur, head, 0.06, -0.03, 0.4, -0.08, 0.12, 0, 0.012);
  const jaw = new T3.Group(); jaw.position.set(0.12, -0.13, 0); head.add(jaw); C.jaw = jaw; M(new T3.BoxGeometry(0.34, 0.06, 0.16), dark, 0.2, 0, 0, jaw, 0.006);
  for (const s of [-1, 1]) M(new T3.SphereGeometry(0.022, 6, 4), ink, 0.5, -0.04, s * 0.05, head, 0);
  C.lids = []; C.pupils = [];
  for (const s of [-1, 1]) { M(new T3.SphereGeometry(0.055, 10, 8), white, 0.08, 0.06, s * 0.155, head, 0.006); const p = M(new T3.SphereGeometry(0.034, 8, 6), ink, 0.1, 0.06, s * 0.192, head, 0); C.pupils.push(p);
    const lid = M(new T3.SphereGeometry(0.06, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), fur, 0.08, 0.065, s * 0.155, head, 0); lid.scale.y = 0.3; C.lids.push(lid);
    for (let i = 0; i < 3; i++) { const l = M(new T3.BoxGeometry(0.012, 0.05, 0.008), ink, 0.05 + i * 0.03, 0.12, s * 0.2, head, 0); l.rotation.z = -0.3 + i * 0.2; } }
  C.earsM = []; for (const s of [-1, 1]) { const e = M(new T3.ConeGeometry(0.045, 0.12, 6), dark, -0.12, 0.17, s * 0.11, head, 0.006); e.rotation.x = s * 0.5; C.earsM.push(e); }
  if (D.shag) M(new T3.SphereGeometry(0.1, 8, 6), dark, -0.05, 0.19, 0, head, 0.006).scale.set(1.2, 0.7, 1);
  const mouth = new T3.Object3D(); mouth.position.set(0.44, -0.12, 0); head.add(mouth); C.mouth = mouth;
  const nose = new T3.Object3D(); nose.position.set(0.44, 0.0, 0); head.add(nose); C.nose = nose;
  // halter
  M(new T3.TorusGeometry(0.13, 0.016, 6, 16), toon('#c42d3c'), 0.32, -0.06, 0, head, 0).rotation.y = Math.PI / 2;
  for (const [x, c] of [[0.2, '#e6b45a'], [0.3, '#1f3a5f'], [0.4, '#c42d3c']]) { M(new T3.SphereGeometry(0.03, 6, 4), toon(c), x, -0.2, 0.13, head, 0); M(new T3.ConeGeometry(0.025, 0.08, 5), toon(c), x, -0.25, 0.13, head, 0).rotation.x = Math.PI; }
  // tail
  const tail = new T3.Group(); tail.position.set(-0.98, 1.72, 0); bodyG.add(tail); C.tail = tail; limb(T3, M, fur, tail, 0, 0, -0.12, -0.55, 0.04, 0, 0.006); M(new T3.SphereGeometry(0.07, 8, 6), dark, -0.13, -0.62, 0, tail, 0.006).scale.set(0.8, 1.5, 0.8);
  // legs: 0 front-far · 1 front-near · 2 hind-far · 3 hind-near (near = +z = camera side)
  for (const fx of [0.62, -0.62]) for (const fz of [-0.24, 0.24]) {
    const hip = new T3.Group(); hip.position.set(fx, 1.38, fz); bodyG.add(hip); const front = fx > 0;
    M(new T3.CapsuleGeometry(front ? 0.1 : 0.13, 0.5, 4, 8), fur, 0, -0.34, 0, hip, 0.01);
    const knee = new T3.Group(); knee.position.y = -0.68; hip.add(knee); M(new T3.SphereGeometry(0.09, 8, 6), dark, 0, 0, 0, knee, 0.006);
    M(new T3.CapsuleGeometry(0.07, 0.5, 4, 8), fur, 0, -0.32, 0, knee, 0.01);
    const pad = new T3.Group(); pad.position.y = -0.62; knee.add(pad); const sole = M(new T3.CylinderGeometry(0.15, 0.14, 0.08, 14), padM, 0, 0, 0.0, pad, 0.008, 0.15); sole.scale.x = 1.15;
    for (const tx of [0.13, 0.13]) M(new T3.BoxGeometry(0.05, 0.05, 0.12), dark, tx, 0.0, 0, pad, 0);
    C.legs.push({ hip, knee, pad, sole, front, near: fz > 0, thorns: [], state: 'ok', balm: 0, q: 1 }); }
  // saddle + two packs (hidden until loading); bags hang on the packs
  const saddle = new T3.Group(); saddle.position.set(-0.06, 0, 0); bodyG.add(saddle); saddle.visible = false; C.saddle = saddle;
  const stripe = (ctx.canvasTex || canvasTex)(128, 64, c => { const cols = ['#c42d3c', '#f2e6c8', '#1f3a5f', '#f2e6c8', '#e6b45a', '#f2e6c8']; for (let i = 0; i < 16; i++) { c.fillStyle = cols[i % cols.length]; c.fillRect(i * 8, 0, 8, 64); } });
  const blanketM = new T3.MeshToonMaterial({ map: stripe, gradientMap: ctx.grad, side: T3.DoubleSide });
  { const bl = new T3.Mesh(new T3.CylinderGeometry(0.52, 0.52, 1.0, 20, 1, true, -Math.PI * 0.62, Math.PI * 1.24), blanketM); bl.rotation.z = Math.PI / 2; bl.position.y = 1.86; saddle.add(bl);
    for (const x of [-0.42, 0.42]) { const a = M(new T3.TorusGeometry(0.56, 0.05, 6, 18, Math.PI), toon('#7a5a3a'), x, 1.9, 0, saddle, 0.008); a.rotation.y = Math.PI / 2; } M(new T3.BoxGeometry(1.1, 0.07, 0.07), toon('#7a5a3a'), 0, 2.48, 0, saddle, 0.008); }
  C.pans = [-1, 1].map(s => { const pg = new T3.Group(); pg.position.set(0, 1.55, s * 0.66); saddle.add(pg); M(new T3.BoxGeometry(1.0, 0.06, 0.06), toon('#7a5a3a'), 0, 0.3, 0, pg, 0.006); for (const x of [-0.45, 0.45]) M(new T3.BoxGeometry(0.05, 0.62, 0.05), toon('#7a5a3a'), x, 0, 0, pg, 0.006); M(new T3.BoxGeometry(1.0, 0.05, 0.3), toon('#d9c08a'), 0, -0.3, s * 0.12, pg, 0.006); return { g: pg, side: s, bags: [] }; });
  if (blanket) { const bl = new T3.Mesh(new T3.CylinderGeometry(0.51, 0.51, 0.9, 20, 1, true, -Math.PI * 0.45, Math.PI * 0.9), new T3.MeshToonMaterial({ map: stripe, gradientMap: ctx.grad, side: T3.DoubleSide })); bl.rotation.z = Math.PI / 2; bl.position.set(-0.06, 1.88, 0); bodyG.add(bl); }
  if (bells) { M(new T3.TorusGeometry(0.2, 0.025, 6, 16), toon('#c42d3c'), 0.15, 0.4, 0, neck, 0).rotation.y = Math.PI / 2; const b = M(new T3.SphereGeometry(0.06, 8, 6), toon('#e6b45a'), 0.32, 0.22, 0.16, neck, 0.006); C.bell = b; }
  return C; }

// one function poses every camel from its parameters (kneel, head down, turn, walk, foot lifts, chewing)
export function camelPose(C, dt) {
  C.t += dt; const t = C.t;
  C.kn = damp(C.kn, C.knT, 3.2, dt); C.hd = damp(C.hd, C.hdT, 3.5, dt); C.turn = damp(C.turn, C.turnT, 4, dt); C.rear = Math.max(0, C.rear - dt * 1.8); C.ears = damp(C.ears, C.earsT, 6, dt); C.tilt = damp(C.tilt, C.tiltT, 4, dt);
  for (let i = 0; i < 4; i++) C.lift[i] = damp(C.lift[i], C.liftT[i], 5, dt);
  const kn = smooth(0, 1, C.kn), wa = C.walkAmt; C.walkPh += dt * 5.2 * wa;
  C.bodyG.position.y = -0.9 * kn + Math.abs(Math.sin(C.walkPh)) * 0.05 * wa; C.bodyG.rotation.z = Math.sin(kn * Math.PI) * 0.12 * (C.knDir || 1); C.bodyG.rotation.x = C.tilt * 0.3;
  C.saddle.rotation.x = C.tilt;
  C.legs.forEach((L, i) => { const sw = Math.sin(C.walkPh + (L.near ? 0 : Math.PI)) * 0.38 * wa, f = L.front ? 1 : -1, lift = smooth(0, 1, C.lift[i]);
    L.hip.rotation.z = f * 0.98 * kn + sw + (L.front ? 0.15 : -0.1) * lift; L.knee.rotation.z = -f * 2.55 * kn - f * Math.max(0, Math.sin(C.walkPh + (L.near ? 0 : Math.PI))) * 0.45 * wa;
    L.knee.rotation.x = -1.5 * lift; L.hip.rotation.x = -0.25 * lift; });
  const look = C.lookAt != null ? C.lookAt : 0;
  C.neck.rotation.z = -1.45 * smooth(0, 1, C.hd) + 0.42 * Math.sin(Math.min(1, C.rear) * Math.PI) + Math.sin(t * 1.1) * 0.03 + 0.25 * kn;
  C.neck.rotation.y = C.turn * 0.75 + look * 0.2; C.head.rotation.z = 0.32 * C.hd - 0.3 * Math.sin(Math.min(1, C.rear) * Math.PI) - 0.15 * kn; C.head.rotation.y = C.turn * 0.35;
  C.chew = Math.max(0, C.chew - dt); const ch = C.chew > 0 ? 1 : 0.25; C.jaw.rotation.z = -Math.abs(Math.sin(t * 9)) * 0.16 * ch; C.jaw.position.z = Math.sin(t * 4.5) * 0.02 * ch;
  C.blink -= dt; const bl = C.blink < 0.12 ? 1 : 0; if (C.blink < 0) C.blink = rr(2, 5); C.lids.forEach(l => l.scale.y = 0.3 + bl * 0.9 + (C.happy > 0 ? 0.5 : 0));
  C.happy = Math.max(0, C.happy - dt);
  C.earsM.forEach((e, i) => { e.rotation.z = -0.4 + C.ears * 0.8 + Math.sin(t * 7 + i) * 0.06 * (C.ears > 0.5 ? 1 : 0.3); });
  C.tail.rotation.z = Math.sin(t * 1.7) * 0.18; C.tail.rotation.x = Math.sin(t * 2.3) * 0.25;
  C.humps.forEach(h => h.position.y = (C.D.humps === 2 ? 2.0 : 2.02) + Math.sin(C.walkPh * 2) * 0.015 * wa);
  if (C.bell) C.bell.rotation.z = Math.sin(t * 6) * 0.3 * (0.3 + wa);
}

// ---------------- the pen (a walled yard: stalls, trough + pump, feed bins, Ummi's corner) ----------------
export function buildCamelPen(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const Y = { root, front: [], walls: [], canopy: [], cols: [] }, ink = toon('#201e1d'), wood = toon('#9a7444'), woodD = toon('#6b4a2c'), red = toon('#c42d3c'), cream = toon('#f2e6c8'), brass = toon('#e6b45a'), stone = toon('#b9a483');
  const mat = (tex, rep) => { if (rep) { tex.wrapS = tex.wrapT = T3.RepeatWrapping; tex.repeat.set(rep[0], rep[1]); } return new T3.MeshToonMaterial({ map: tex, gradientMap: ctx.grad }); };
  const sandT = CTX(256, 256, c => { c.fillStyle = '#e2c48e'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 900; i++) { c.fillStyle = ['#d6b47a', '#ecd3a2', '#caa76c'][i % 3]; c.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } c.strokeStyle = 'rgba(150,110,60,0.35)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const x = Math.random() * 256, y = Math.random() * 256; c.beginPath(); c.ellipse(x, y, 7, 9, 0, 0, 7); c.stroke(); c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x, y + 6); c.stroke(); } });
  const floor = new T3.Mesh(new T3.PlaneGeometry(20, 14), mat(sandT, [5, 3.5])); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -1); floor.receiveShadow = true; root.add(floor);
  const outT = CTX(64, 64, c => { c.fillStyle = '#e8cc96'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 80; i++) { c.fillStyle = '#d8b67e'; c.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } });
  const outside = new T3.Mesh(new T3.PlaneGeometry(160, 160), mat(outT, [30, 30])); outside.rotation.x = -Math.PI / 2; outside.position.y = -0.02; root.add(outside);
  const adobeT = CTX(256, 256, c => { c.fillStyle = '#d9b07a'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 500; i++) { c.fillStyle = ['#d0a46c', '#e2bd88', '#c99a60'][i % 3]; c.fillRect(Math.random() * 256, Math.random() * 256, 3, 3); } c.strokeStyle = '#b08250'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { let x = Math.random() * 256, y = Math.random() * 256; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += rr(-14, 14); y += rr(6, 16); c.lineTo(x, y); } c.stroke(); } c.fillStyle = '#b8875a'; for (let i = 0; i < 4; i++) { const x = Math.random() * 220, y = Math.random() * 220; for (let b = 0; b < 3; b++) c.fillRect(x + (b % 2) * 16, y + b * 10, 28, 8); } });
  const adobe = mat(adobeT, [3, 1]), H = 3.2;
  const wall = (x, z, w, d, h = H, list = null, side = null) => { const m = M(new T3.BoxGeometry(w, h, d), adobe, x, h / 2, z, root, 0.03); if (list) list.push(m); if (side) Y.walls.push({ m, side }); for (let i = 0, n = Math.floor(Math.max(w, d) / 1.2); i < n; i++) { const t = (i + 0.5) / n - 0.5, cb = M(new T3.BoxGeometry(w > d ? 0.5 : w + 0.06, 0.3, w > d ? d + 0.06 : 0.5), adobe, x + (w > d ? t * w : 0), h + 0.15, z + (w > d ? 0 : t * d), root, 0.015); if (i % 2) cb.visible = false; else if (side) Y.walls.push({ m: cb, side }); if (list) list.push(cb); } return m; };
  wall(0, -7.75, 18.8, 0.5, H, null, 'B'); wall(9.15, -1, 0.5, 14, H, null, 'R'); wall(-9.15, -5.25, 0.5, 5.5, H, null, 'L'); wall(-9.15, 3.45, 0.5, 5.1, H, null, 'L');
  { const fc = root.children.length; wall(0, 5.9, 18.8, 0.4, 0.9); Y.front.push(...root.children.slice(fc)); }
  // gate (west, onto the bazaar lane): pillars + lintel + rope + sign
  for (const z of [-2.5, 0.9]) Y.walls.push({ m: M(new T3.BoxGeometry(0.8, 3.8, 0.8), adobe, -9.15, 1.9, z, root, 0.03), side: 'L' });
  Y.walls.push({ m: M(new T3.BoxGeometry(0.9, 0.5, 4.2), adobe, -9.15, 3.85, -0.8, root, 0.03), side: 'L' });
  const signT = CTX(1024, 200, c => { c.fillStyle = '#5a2f18'; c.fillRect(0, 0, 1024, 200); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 1024, 12); c.fillRect(0, 188, 1024, 12); c.fillStyle = '#fbf3e0'; c.font = '900 76px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('UMMI REYHAN', 512, 66); c.fillStyle = '#e6b45a'; c.font = '800 54px Archivo, Arial'; c.fillText('CAMEL PEN · KUFA', 512, 142); });
  { const s = new T3.Mesh(new T3.PlaneGeometry(3.4, 0.66), new T3.MeshBasicMaterial({ map: signT })); s.position.set(-8.86, 3.0, -0.8); s.rotation.y = Math.PI / 2; root.add(s); Y.walls.push({ m: s, side: 'L' }); }
  // the bazaar lane outside the gate (glimpse): awnings, crates, a far dune
  const awnT = CTX(128, 64, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f2e6c8' : '#c42d3c'; c.fillRect(i * 16, 0, 16, 64); } }), awnM = new T3.MeshToonMaterial({ map: awnT, gradientMap: ctx.grad, side: T3.DoubleSide });
  const awnT2 = CTX(128, 64, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#f2e6c8' : '#2f9a8f'; c.fillRect(i * 16, 0, 16, 64); } }), awnM2 = new T3.MeshToonMaterial({ map: awnT2, gradientMap: ctx.grad, side: T3.DoubleSide });
  for (const [x, z, m] of [[-17, -5.5, awnM], [-21, 3.6, awnM2], [-25, -5.5, awnM2], [-17.5, 4.2, awnM]]) { const a = new T3.Mesh(new T3.PlaneGeometry(3.4, 2.2), m); a.rotation.x = -Math.PI / 2 + 0.3 * Math.sign(z); a.position.set(x, 2.6, z); root.add(a); for (const dx of [-1.6, 1.6]) M(new T3.CylinderGeometry(0.05, 0.05, 2.6, 6), woodD, x + dx, 1.3, z + Math.sign(z) * -0.9, root, 0); M(new T3.BoxGeometry(2.8, 0.9, 1.0), wood, x, 0.45, z + Math.sign(z) * 0.3, root, 0.02); }
  for (const [x, z, r, h] of [[-40, -30, 18, 6], [30, -40, 22, 7], [-10, -46, 16, 5], [44, 6, 14, 4], [-44, 14, 16, 5], [6, 40, 20, 6]]) { const d = M(new T3.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e8c88e'), x, -0.1, z, root, 0); d.scale.y = h / r; }
  // stalls (north-east): Ummi's own camels QAMAR + ZAHRA live here under a striped canopy
  { for (const x of [3.6, 6.35]) { M(new T3.BoxGeometry(0.12, 1.2, 0.12), woodD, x, 0.6, -4.25, root, 0.01); for (const y of [0.45, 1.05]) M(new T3.BoxGeometry(0.08, 0.1, 3.3), wood, x, y, -5.9, root, 0.008); M(new T3.BoxGeometry(0.12, 1.2, 0.12), woodD, x, 0.6, -7.5, root, 0.01); }
    for (const x of [3.6, 6.35, 8.85]) { const p = M(new T3.CylinderGeometry(0.08, 0.08, 3.5, 8), woodD, x, 1.75, -4.25, root, 0.01); Y.canopy.push(p); }
    const can = new T3.Mesh(new T3.PlaneGeometry(5.6, 3.8), awnM); can.rotation.x = -Math.PI / 2 + 0.12; can.position.set(6.25, 3.45, -5.95); root.add(can); Y.canopy.push(can);
    for (const [x, nm] of [[4.97, 'QAMAR'], [7.6, 'ZAHRA']]) { const t = CTX(256, 80, c => { c.fillStyle = '#6b4a2c'; c.fillRect(0, 0, 256, 80); c.fillStyle = '#fbf3e0'; c.font = '900 46px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(nm, 128, 42); }); const s = new T3.Mesh(new T3.PlaneGeometry(1.0, 0.31), new T3.MeshBasicMaterial({ map: t })); s.position.set(x, 1.42, -4.19); root.add(s);
      M(new T3.BoxGeometry(1.4, 0.5, 0.5), wood, x, 1.6, -7.35, root, 0.01); M(new T3.BoxGeometry(1.3, 0.3, 0.4), toon('#e0c35e'), x, 1.95, -7.35, root, 0.008); }
    M(new T3.BoxGeometry(5.3, 0.12, 0.08), wood, 6.25, 1.05, -4.25, root, 0.006); }
  // trough + pump (the work spot)
  const T = { x0: 0.85, x1: 2.15, z0: -1.35, z1: -0.45, top: 0.78 };
  M(new T3.BoxGeometry(T.x1 - T.x0, T.top, T.z1 - T.z0), stone, (T.x0 + T.x1) / 2, T.top / 2, (T.z0 + T.z1) / 2, root, 0.02);
  { const inner = M(new T3.BoxGeometry(T.x1 - T.x0 - 0.16, 0.05, T.z1 - T.z0 - 0.16), toon('#7a6648'), (T.x0 + T.x1) / 2, 0.2, (T.z0 + T.z1) / 2, root, 0); inner.castShadow = false; }
  const waterM = new T3.MeshToonMaterial({ color: '#5fb8d8', gradientMap: ctx.grad, transparent: true, opacity: 0.92 });
  const water = new T3.Mesh(new T3.BoxGeometry(T.x1 - T.x0 - 0.16, 0.04, T.z1 - T.z0 - 0.16), waterM); water.position.set((T.x0 + T.x1) / 2, 0.22, (T.z0 + T.z1) / 2); root.add(water); Y.water = water; Y.trough = T;
  // fill-line marks on the trough lip (green band)
  for (const [y, col] of [[0.22 + 0.5 * 0.35, '#22c55e'], [0.22 + 0.5 * 0.85, '#22c55e'], [0.22 + 0.5 * 1.0, '#ec3013']]) M(new T3.BoxGeometry(T.x1 - T.x0 + 0.02, 0.025, 0.02), toon(col), (T.x0 + T.x1) / 2, y, T.z1 + 0.005, root, 0);
  const pump = new T3.Group(); pump.position.set(2.65, 0, -1.55); root.add(pump); Y.pump = pump;
  M(new T3.BoxGeometry(0.7, 0.2, 0.7), stone, 0, 0.1, 0, pump, 0.01); M(new T3.CylinderGeometry(0.13, 0.16, 1.15, 12), toon('#3f5d47'), 0, 0.75, 0, pump, 0.012, 0.15);
  { const sp = M(new T3.CylinderGeometry(0.05, 0.05, 0.55, 8), toon('#3f5d47'), -0.3, 1.12, 0.12, pump, 0.008, 0.05); sp.rotation.z = Math.PI / 2 - 0.25; sp.rotation.y = -0.4; }
  M(new T3.SphereGeometry(0.15, 10, 8), toon('#3f5d47'), 0, 1.35, 0, pump, 0.01);
  const handle = new T3.Group(); handle.position.set(0.08, 1.38, 0); pump.add(handle); Y.handle = handle; M(new T3.BoxGeometry(0.9, 0.06, 0.06), toon('#2a3a2e'), 0.42, 0, 0, handle, 0.008); M(new T3.CylinderGeometry(0.05, 0.05, 0.22, 8), woodD, 0.86, 0, 0, handle, 0.006).rotation.x = Math.PI / 2;
  Y.handleTip = new T3.Object3D(); Y.handleTip.position.set(0.86, 0, 0); handle.add(Y.handleTip);
  { const st = new T3.Mesh(new T3.CylinderGeometry(0.035, 0.05, 0.6, 8), new T3.MeshBasicMaterial({ color: 0x8fd8f0, transparent: true, opacity: 0.8 })); st.position.set(2.25, 0.85, -1.28); st.visible = false; root.add(st); Y.stream = st; }
  // feed bins on a low bench in front of the camel
  M(new T3.BoxGeometry(2.9, 0.1, 0.62), wood, 3.8, 0.62, 0.35, root, 0.012); for (const x of [2.5, 5.1]) for (const z of [0.1, 0.6]) M(new T3.BoxGeometry(0.08, 0.62, 0.08), woodD, x, 0.31, z, root, 0.006);
  Y.bins = {}; FK.forEach((k, i) => { const x = 2.75 + i * 0.7, g = new T3.Group(); g.position.set(x, 0.67, 0.35); root.add(g); M(new T3.BoxGeometry(0.6, 0.3, 0.5), woodD, 0, 0.15, 0, g, 0.01); const f = foodMesh(T3, toon, k, M); f.position.y = 0.3; f.scale.setScalar(1.25); g.add(f);
    const lt = CTX(160, 56, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 160, 56); c.fillStyle = FOODS[k].col === '#7a3a1a' ? '#e0a070' : FOODS[k].col; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(FOODS[k].name, 80, 30); });
    const lb = new T3.Mesh(new T3.PlaneGeometry(0.56, 0.2), new T3.MeshBasicMaterial({ map: lt })); lb.position.set(0, 0.15, 0.255); g.add(lb); Y.bins[k] = g; });
  // Ummi's corner (north-west): rug, stool, tea, tally sticks, saddle rack, water jars
  const rugT = CTX(256, 160, c => { c.fillStyle = '#8f2b1e'; c.fillRect(0, 0, 256, 160); c.strokeStyle = '#e6b45a'; c.lineWidth = 8; c.strokeRect(14, 14, 228, 132); c.fillStyle = '#1f3a5f'; for (let i = 0; i < 5; i++) { c.save(); c.translate(48 + i * 40, 80); c.rotate(Math.PI / 4); c.fillRect(-12, -12, 24, 24); c.restore(); } c.fillStyle = '#f2e6c8'; for (let i = 0; i < 5; i++) c.fillRect(46 + i * 40, 78, 4, 4); });
  { const r = new T3.Mesh(new T3.PlaneGeometry(3.4, 2.2), new T3.MeshToonMaterial({ map: rugT, gradientMap: ctx.grad })); r.rotation.x = -Math.PI / 2; r.position.set(-5.6, 0.012, -5.6); root.add(r); }
  M(new T3.CylinderGeometry(0.3, 0.26, 0.4, 12), wood, -6.3, 0.2, -6.0, root, 0.01, 0.3); M(new T3.CylinderGeometry(0.42, 0.42, 0.06, 16), brass, -5.0, 0.26, -6.2, root, 0.008, 0.42); M(new T3.CylinderGeometry(0.06, 0.06, 0.26, 8), woodD, -5.0, 0.12, -6.2, root, 0);
  M(new T3.SphereGeometry(0.12, 10, 8), brass, -5.0, 0.38, -6.2, root, 0.006); M(new T3.ConeGeometry(0.03, 0.14, 6), brass, -4.88, 0.42, -6.2, root, 0).rotation.z = -1.1;
  for (let i = 0; i < 3; i++) M(new T3.CylinderGeometry(0.035, 0.03, 0.09, 8), toon('#d97757', { transparent: true, opacity: 0.85 }), -5.2 + i * 0.13, 0.34, -6.0, root, 0);
  for (const [x, z] of [[-6.6, -4.9], [-4.4, -5.0]]) M(new T3.BoxGeometry(0.6, 0.18, 0.6), toon('#c9a24a'), x, 0.09, z, root, 0.008);
  { const fc = root.children.length; M(new T3.BoxGeometry(1.6, 0.1, 0.12), woodD, -5.6, 2.1, -7.45, root, 0.006); for (let i = 0; i < 9; i++) { const s = M(new T3.BoxGeometry(0.05, 0.8, 0.04), toon('#c9a06a'), -6.25 + i * 0.16, 1.62, -7.42, root, 0.004); for (let n = 0; n < 2 + (i * 7) % 5; n++) M(new T3.BoxGeometry(0.055, 0.012, 0.045), ink, -6.25 + i * 0.16, 1.3 + n * 0.08, -7.4, root, 0); } }
  for (let i = 0; i < 3; i++) { const sx = -8.0 + i * 0.85; M(new T3.BoxGeometry(0.1, 1.3, 0.1), woodD, sx, 0.65, -7.2, root, 0.006); } M(new T3.BoxGeometry(2.0, 0.1, 0.1), woodD, -7.15, 1.25, -7.2, root, 0.006);
  for (const x of [-7.55, -6.75]) { const sd = new T3.Group(); sd.position.set(x, 1.35, -7.2); root.add(sd); M(new T3.CylinderGeometry(0.32, 0.32, 0.55, 14, 1, true, 0, Math.PI), new T3.MeshToonMaterial({ map: stripe2(CTX), gradientMap: ctx.grad, side: T3.DoubleSide }), 0, 0, 0, sd, 0).rotation.x = Math.PI / 2; }
  for (const [x, z, s] of [[-8.5, 2.4, 1], [-8.4, 3.3, 0.85], [-8.55, 4.2, 1.1], [8.4, 4.8, 1]]) { const j = M(new T3.SphereGeometry(0.32 * s, 14, 10), toon('#c46a3a'), x, 0.36 * s, z, root, 0.01, 0.32 * s); j.scale.y = 1.2; M(new T3.CylinderGeometry(0.12 * s, 0.16 * s, 0.2 * s, 10), toon('#c46a3a'), x, 0.8 * s, z, root, 0.006); }
  // hay bales + sacks (south-east), potted palms, lanterns
  for (const [x, y, z, r] of [[7.6, 0.3, 3.0, 0.1], [7.6, 0.3, 3.9, -0.05], [7.7, 0.9, 3.45, 0.2]]) { const b = M(new T3.BoxGeometry(1.1, 0.6, 0.8), toon('#e0c35e'), x, y, z, root, 0.015); b.rotation.y = r; M(new T3.BoxGeometry(1.12, 0.05, 0.05), toon('#8a6a2c'), x, y + 0.31, z, root, 0).rotation.y = r; }
  for (const [x, z] of [[-8.3, 5.2], [8.3, 5.2]]) { const fc = root.children.length; M(new T3.CylinderGeometry(0.35, 0.28, 0.6, 12), toon('#c46a3a'), x, 0.3, z, root, 0.01, 0.35); M(new T3.CylinderGeometry(0.07, 0.1, 2.2, 8), woodD, x, 1.6, z, root, 0.008); for (let i = 0; i < 7; i++) { const lf = M(new T3.BoxGeometry(1.0, 0.03, 0.22), toon('#4f8a3a'), x + Math.cos(i * 0.9) * 0.45, 2.6 - (i % 2) * 0.12, z + Math.sin(i * 0.9) * 0.45, root, 0); lf.rotation.y = -i * 0.9; lf.rotation.z = -0.4; } Y.front.push(...root.children.slice(fc)); }
  Y.lamps = []; for (const [x, z, ry] of [[-8.88, -4.5, Math.PI / 2], [8.88, 1.5, -Math.PI / 2], [-3, -7.48, 0], [2.4, -7.48, 0]]) { const l = new T3.Group(); l.position.set(x, 2.3, z); l.rotation.y = ry; root.add(l); M(new T3.BoxGeometry(0.06, 0.06, 0.3), ink, 0, 0.3, 0.15, l, 0); const lm = M(new T3.CylinderGeometry(0.11, 0.14, 0.3, 8), new T3.MeshBasicMaterial({ color: 0xffd98a }), 0, 0.1, 0.3, l, 0.006); M(new T3.ConeGeometry(0.15, 0.14, 8), brass, 0, 0.32, 0.3, l, 0.004); Y.lamps.push(lm); Y.walls.push({ m: l, side: z < -7 ? 'B' : x < 0 ? 'L' : 'R' }); }
  // ---------- polish: skyline, palms outside, bunting, doves, dust motes, lantern glow, trough ripples, straw + stones ----------
  { const sand = toon('#e3c08a'), sandD = toon('#c9a26a'), dome = toon('#2f9a8f'), domeG = toon('#e6b45a'), white = toon('#f4e6c8');
    const bld = (x, z, w, d, h, roofDome, col = sand) => { M(new T3.BoxGeometry(w, h, d), col, x, h / 2, z, root, 0.04); for (let i = 0; i < Math.floor(w / 1.4); i++) M(new T3.BoxGeometry(0.7, 0.5, 0.7), col, x - w / 2 + 0.7 + i * 1.4, h + 0.25, z + d / 2 - 0.4, root, 0); if (roofDome) { const r = Math.min(w, d) * 0.38; M(new T3.SphereGeometry(r, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), roofDome, x, h, z, root, 0.04); M(new T3.ConeGeometry(0.12, 0.9, 6), domeG, x, h + r + 0.35, z, root, 0); }
      for (let i = 0; i < 3; i++) M(new T3.BoxGeometry(0.5, 0.9, 0.08), toon('#5a3a22'), x - w / 4 + i * w / 4, h * 0.55, z + d / 2 + 0.03, root, 0); };
    bld(-6, -16, 6, 5, 6, dome); bld(2, -18, 7, 6, 8, null, sandD); bld(10, -15, 5, 5, 5.5, domeG); bld(-15, -13, 5, 5, 4.5, null); bld(17, -9, 5, 6, 5, dome, sandD); bld(-17, 8, 6, 5, 5, null, sandD);
    { const mn = new T3.Group(); mn.position.set(6.5, 0, -21); root.add(mn); M(new T3.CylinderGeometry(0.75, 0.9, 13, 10), white, 0, 6.5, 0, mn, 0.04); M(new T3.CylinderGeometry(1.15, 1.15, 0.4, 12), sandD, 0, 10.5, 0, mn, 0.02); M(new T3.CylinderGeometry(0.55, 0.65, 2.2, 10), white, 0, 12.3, 0, mn, 0.02); M(new T3.SphereGeometry(0.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), dome, 0, 13.4, 0, mn, 0.02); M(new T3.ConeGeometry(0.1, 1.0, 6), domeG, 0, 14.4, 0, mn, 0); }
    const palm = (x, z, h, lean) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.z = lean; root.add(g); for (let i = 0; i < 6; i++) M(new T3.CylinderGeometry(0.17 - i * 0.012, 0.2 - i * 0.012, h / 6, 8), toon(i % 2 ? '#8a6234' : '#7a5430'), 0, h / 12 + i * h / 6, 0, g, 0.01);
      for (let i = 0; i < 9; i++) { const lf = new T3.Group(); lf.position.y = h; lf.rotation.y = i * 0.7; g.add(lf); const b = M(new T3.BoxGeometry(2.0, 0.04, 0.42), toon(i % 2 ? '#4f8a3a' : '#3f7a2e'), 0.95, -0.3, 0, lf, 0.006); b.rotation.z = -0.5; } M(new T3.SphereGeometry(0.25, 8, 6), toon('#7a3a1a'), 0, h - 0.15, 0, g, 0.006); return g; };
    Y.palms = [palm(-13.5, 11, 6, 0.08), palm(12, -11.5, 7, -0.06), palm(-14, -13, 6.5, 0.1), palm(14.5, 6.5, 5.5, -0.1)];
    // bunting: two strings of pennants across the yard
    Y.buntingLines = []; Y.bunting = []; const penCols = ['#c42d3c', '#e6b45a', '#2f9a8f', '#f2e6c8', '#1f3a5f'];
    for (const [x0, z0, x1, z1, y] of [[-8.9, -6.8, 8.9, 2.0, 4.45], [-8.9, 3.0, 8.9, -5.0, 4.65]]) { const n = 16, line = new T3.Group(); root.add(line); for (const [px, pz] of [[x0, z0], [x1, z1]]) M(new T3.CylinderGeometry(0.05, 0.05, y - H + 0.1, 6), woodD, px, (y + H) / 2, pz, root, 0.006);
      for (let i = 0; i <= n; i++) { const k = i / n, sag = Math.sin(k * Math.PI) * 0.4, x = x0 + (x1 - x0) * k, z = z0 + (z1 - z0) * k; if (i < n) { const k2 = (i + 1) / n, xb = x0 + (x1 - x0) * k2, zb = z0 + (z1 - z0) * k2, yb = y - Math.sin(k2 * Math.PI) * 0.4, len = Math.hypot(xb - x, zb - z, yb - (y - sag)), seg = new T3.Mesh(new T3.CylinderGeometry(0.01, 0.01, len, 3), ink); seg.position.set((x + xb) / 2, (y - sag + yb) / 2, (z + zb) / 2); seg.lookAt(xb, yb, zb); seg.rotateX(Math.PI / 2); line.add(seg); }
        if (i > 0 && i < n) { const tri = new T3.Shape([new T3.Vector2(-0.16, 0), new T3.Vector2(0.16, 0), new T3.Vector2(0, -0.34)]), pm = new T3.Mesh(new T3.ShapeGeometry(tri), new T3.MeshToonMaterial({ color: penCols[i % penCols.length], gradientMap: ctx.grad, side: T3.DoubleSide })); const pg = new T3.Group(); pg.position.set(x, y - sag, z); pg.rotation.y = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2; pg.add(pm); line.add(pg); Y.bunting.push({ pg, ph: i * 0.7 }); } } Y.buntingLines.push(line); }
    // doves on the back wall
    Y.doves = []; for (let i = 0; i < 4; i++) { const d = new T3.Group(), home = new T3.Vector3(-6 + i * 3.3 + rr(-0.4, 0.4), H + 0.32, -7.72); d.position.copy(home); root.add(d); const b = M(new T3.SphereGeometry(0.13, 10, 8), toon('#d7dde3'), 0, 0, 0, d, 0.008); b.scale.set(1.4, 0.9, 0.9); const hd = M(new T3.SphereGeometry(0.075, 8, 6), toon('#c9ced6'), 0.15, 0.1, 0, d, 0.006); M(new T3.ConeGeometry(0.02, 0.06, 4), toon('#e6a050'), 0.23, 0.1, 0, d, 0).rotation.z = -Math.PI / 2; M(new T3.SphereGeometry(0.015, 4, 3), ink, 0.19, 0.13, 0.05, d, 0);
      const wings = [-1, 1].map(sd => { const w = M(new T3.BoxGeometry(0.22, 0.02, 0.18), toon('#b8bec8'), -0.02, 0.03, sd * 0.1, d, 0.004); return w; }); M(new T3.BoxGeometry(0.14, 0.02, 0.1), toon('#9aa0aa'), -0.2, 0.02, 0, d, 0); d.rotation.y = rr(-1, 1); Y.doves.push({ d, hd, wings, home, st: 'sit', t: rr(0, 5), fly: null }); }
    Y.scareDoves = () => Y.doves.forEach((v, i) => { if (v.st === 'sit') { v.st = 'fly'; v.t = 0; v.c = new T3.Vector3(rr(-4, 4), rr(6, 8), rr(-6, -2)); v.r = rr(3, 5); v.a0 = Math.atan2(v.home.z - v.c.z, v.home.x - v.c.x); v.dur = rr(4, 6); } });
    // dust motes in the sun
    { const n = 60, g = new T3.BufferGeometry(), pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-8, 8); pos[i * 3 + 1] = rr(0.3, 3.2); pos[i * 3 + 2] = rr(-7, 5); } g.setAttribute('position', new T3.BufferAttribute(pos, 3));
      const pt = new T3.Points(g, new T3.PointsMaterial({ color: 0xfff1c8, size: 0.06, transparent: true, opacity: 0.7, depthWrite: false })); root.add(pt); Y.motes = pt; }
    // lantern glow halos
    const glowT = CTX(64, 64, c => { const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,220,140,0.9)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); });
    Y.halos = Y.lamps.map(l => { const sp = new T3.Sprite(new T3.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0.55 })); sp.scale.setScalar(0.9); l.add(sp); return sp; });
    // trough water: rippling texture + drink rings
    const ripT = CTX(128, 128, c => { c.fillStyle = '#5fb8d8'; c.fillRect(0, 0, 128, 128); c.strokeStyle = 'rgba(220,245,255,0.55)'; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const x = (i * 37) % 128, y = (i * 53) % 128; c.beginPath(); c.ellipse(x, y, 10 + i % 4 * 4, 4 + i % 3, 0, 0, 7); c.stroke(); } }); ripT.wrapS = ripT.wrapT = T3.RepeatWrapping; ripT.repeat.set(2, 1);
    Y.water.material.map = ripT; Y.water.material.color.set('#ffffff'); Y.water.material.needsUpdate = true; Y.ripT = ripT;
    Y.rings = []; for (let i = 0; i < 3; i++) { const r = new T3.Mesh(new T3.RingGeometry(0.08, 0.1, 20).rotateX(-Math.PI / 2), new T3.MeshBasicMaterial({ color: 0xe8f8ff, transparent: true, opacity: 0, depthWrite: false })); root.add(r); Y.rings.push({ r, t: 1 }); }
    Y.ripple = (x, z, y) => { const R0 = Y.rings.find(q => q.t >= 1) || Y.rings[0]; R0.t = 0; R0.r.position.set(x, y + 0.03, z); };
    // straw, stones and hoof prints around the trough + bench
    for (let i = 0; i < 40; i++) { const st = M(new T3.BoxGeometry(0.18, 0.012, 0.015), toon(i % 3 ? '#e0c35e' : '#c9a24a'), rr(-3, 6), 0.008, rr(-2.5, 2.2), root, 0); st.rotation.y = rr(0, 3.14); st.castShadow = false; }
    for (let i = 0; i < 14; i++) { const r = rr(0.06, 0.16), st = M(new T3.DodecahedronGeometry(r, 0), toon(i % 2 ? '#b9a483' : '#a08a6a'), rr(-8.4, 8.4), r * 0.4, (i % 2 ? rr(3.5, 5.3) : rr(-6.8, -4.6)), root, 0.006); st.rotation.set(rr(0, 3), rr(0, 3), 0); }
    const hoofT = CTX(64, 64, c => { c.fillStyle = 'rgba(120,85,45,0.45)'; c.beginPath(); c.ellipse(22, 32, 12, 18, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(44, 32, 12, 18, 0, 0, 7); c.fill(); });
    for (let i = 0; i < 12; i++) { const h = new T3.Mesh(new T3.PlaneGeometry(0.34, 0.34), new T3.MeshBasicMaterial({ map: hoofT, transparent: true, depthWrite: false })); h.rotation.x = -Math.PI / 2; h.rotation.z = Math.PI / 2 + rr(-0.2, 0.2); h.position.set(-8 + i * 0.75, 0.011, CP.z + (i % 2 ? 0.25 : -0.25)); root.add(h); } }
  Y.anim = (dt, t) => { for (const b of Y.bunting) { b.pg.rotation.x = Math.sin(t * 2.2 + b.ph) * 0.35; }
    for (const v of Y.doves) { v.t += dt; if (v.st === 'sit') { v.hd.position.y = 0.1 + (Math.sin(v.t * 3) > 0.85 ? -0.06 : 0); v.wings.forEach(w => w.rotation.x = 0); if (Math.random() < dt * 0.05) v.d.rotation.y += rr(-1.2, 1.2); }
      else { const k = v.t / v.dur, a = v.a0 + k * Math.PI * 2, up = Math.sin(Math.min(1, k) * Math.PI); const tgt = k >= 1 ? v.home : new T3.Vector3(v.c.x + Math.cos(a) * v.r, v.home.y + (v.c.y - v.home.y) * up, v.c.z + Math.sin(a) * v.r); const prev = v.d.position.clone(); v.d.position.lerp(tgt, k >= 1 ? 0.2 : 0.35); const dir = v.d.position.clone().sub(prev); if (dir.lengthSq() > 1e-6) v.d.rotation.y = Math.atan2(-dir.z, dir.x);
        v.wings.forEach((w, i) => w.rotation.x = Math.sin(v.t * 28) * 0.9 * (i ? 1 : -1)); if (k >= 1 && v.d.position.distanceTo(v.home) < 0.05) { v.st = 'sit'; v.d.position.copy(v.home); } } }
    if (Y.motes) { const p = Y.motes.geometry.attributes.position; for (let i = 0; i < p.count; i++) { let y = p.getY(i) + dt * 0.05, x = p.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.08; if (y > 3.4) y = 0.3; p.setY(i, y); p.setX(i, x); } p.needsUpdate = true; }
    Y.halos.forEach((h, i) => { h.material.opacity = 0.45 + Math.sin(t * 6 + i * 2) * 0.08; });
    Y.ripT.offset.x += dt * 0.03; Y.ripT.offset.y = Math.sin(t * 0.7) * 0.05;
    for (const R0 of Y.rings) { if (R0.t < 1) { R0.t = Math.min(1, R0.t + dt * 1.2); R0.r.scale.setScalar(1 + R0.t * 3); R0.r.material.opacity = 0.8 * (1 - R0.t); } } };
  // walk map: room bounds + blocked boxes [x0, x1, z0, z1] + circles
  Y.bounds = { x0: -8.6, x1: 8.6, z0: -7.2, z1: 5.4 };
  Y.boxes = [[0.75, 3.05, -1.95, -0.35], [2.3, 5.3, 0.0, 0.7], [3.45, 9.2, -7.9, -4.1], [-6.7, -5.9, -6.35, -5.65], [-5.5, -4.5, -6.65, -5.75], [6.9, 8.4, 2.4, 4.5], [-8.9, -6.3, -7.9, -6.8], [-8.95, -8.0, 1.9, 4.6]];
  Y.spots = { camel: { x: CP.x, z: CP.z }, ummi: { x: -2.4, z: -3.1 }, ummiHome: { x: -4.5, z: -4.3 }, owner: { x: -4.6, z: 2.2 }, talk: { x: -2.2, z: 2.0 }, benIntro: { x: 0.2, z: 2.75 }, ummiIntro: { x: -1.2, z: 2.55 }, benSpawn: { x: -6.8, z: -0.8 }, gate: { x: -13, z: CP.z }, qamar: { x: 4.97, z: -5.6 }, zahra: { x: 7.6, z: -5.6 } };
  Y.walk = (x, z) => { const B = Y.bounds; if (x < B.x0 || x > B.x1 || z < B.z0 || z > B.z1) return false; return !Y.boxes.some(b => x > b[0] && x < b[1] && z > b[2] && z < b[3]); };
  return Y;
}
function stripe2(CTX) { return CTX(64, 64, c => { const cols = ['#1f3a5f', '#e6b45a', '#c42d3c', '#f2e6c8']; for (let i = 0; i < 8; i++) { c.fillStyle = cols[i % 4]; c.fillRect(0, i * 8, 64, 8); } }); }
export function foodMesh(T3, toon, k, M) {
  const g = new T3.Group(), add = (geo, col, x = 0, y = 0, z = 0, o = 0.006) => M(geo, toon(col), x, y, z, g, o);
  if (k === 'hay' || k === 'alfalfa') { const col = FOODS[k].col; for (let i = 0; i < 7; i++) { const s = add(new T3.CylinderGeometry(0.012, 0.012, 0.3, 4), col, rr(-0.06, 0.06), 0.04, rr(-0.05, 0.05), 0); s.rotation.z = Math.PI / 2 + rr(-0.4, 0.4); s.rotation.y = rr(-0.5, 0.5); } add(new T3.CylinderGeometry(0.07, 0.07, 0.22, 10), col, 0, 0.03, 0).rotation.z = Math.PI / 2; add(new T3.TorusGeometry(0.072, 0.012, 4, 12), k === 'hay' ? '#8a6a2c' : '#3f6b2a', 0, 0.03, 0, 0).rotation.y = Math.PI / 2; if (k === 'alfalfa') for (let i = 0; i < 4; i++) add(new T3.SphereGeometry(0.025, 5, 4), '#a8d860', rr(-0.08, 0.08), 0.08, rr(-0.04, 0.04), 0); }
  else if (k === 'dates') { for (let i = 0; i < 5; i++) { const d = add(new T3.CapsuleGeometry(0.025, 0.04, 3, 6), '#7a3a1a', rr(-0.06, 0.06), 0.03 + (i > 2 ? 0.04 : 0), rr(-0.04, 0.04)); d.rotation.z = Math.PI / 2 + rr(-0.6, 0.6); } }
  else { add(new T3.BoxGeometry(0.13, 0.1, 0.13), '#f2efe8', 0, 0.05, 0); add(new T3.BoxGeometry(0.05, 0.04, 0.05), '#ffffff', 0.04, 0.12, 0.02, 0); }
  return g; }

// MERGE HELPER: put Ummi's two camels in their stalls inside a world map (call update(dt) every frame; pat(i) / call(x, z) for the walk buttons)
export function addPenCamels(ctx, Y) {
  const T3 = ctx.THREE || THREE, q = makeCamel(ctx, 'drom', { blanket: true, bells: true, fur: '#b88a52', dark: '#7a5430' }), z = makeCamel(ctx, 'drom', { fur: '#e8d2a8', dark: '#b8966a' }); z.g.scale.setScalar(0.86);
  const list = [{ C: q, name: 'QAMAR', s: Y.spots.qamar }, { C: z, name: 'ZAHRA', s: Y.spots.zahra }];
  list.forEach(r => { r.C.g.position.set(r.s.x, 0, r.s.z); r.C.g.rotation.y = -Math.PI / 2; Y.root.add(r.C.g); });
  let t = 0; return { list, update(dt) { t += dt; list.forEach(r => { const Cm = r.C; if (r.callT > 0) r.callT -= dt; else { Cm.turnT = Math.sin(t * 0.3 + Cm.id) * 0.5; Cm.earsT = 0.3; } Cm.hdT = r.callT > 0 ? 0 : (Math.sin(t * 0.21 + Cm.id * 2) > 0.6 ? 0.55 : 0); if (Math.random() < dt * 0.15) Cm.chew = 2; camelPose(Cm, dt); }); },
    pat(i) { const r = list[i]; if (!r) return; r.C.happy = 2.2; r.C.earsT = 1; r.C.chew = 1.5; r.callT = 2.2; }, call() { list.forEach(r => { r.callT = 3; r.C.earsT = 1; }); } }; }

// ---------------- the stand-alone game ----------------
export async function createCamelPen({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#f3d9a6' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#8cc4e6'); gr.addColorStop(0.55, '#f6dcaa'); gr.addColorStop(1, '#f1cf98'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); }); scene.fog = new THREE.Fog('#f1d6a4', 34, 95);
  const ctx = { THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline };
  const Y = buildCamelPen(ctx);
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  const faceTo = (f, x, z) => { f.rotation.y = Math.atan2(x - f.position.x, z - f.position.z); };
  function headWrap(fox, a, b, tail = true) { const P = fox.userData.P, hs = P.head.scale.x || 1, w = new THREE.Group(); w.position.set(0, P.head.position.y + 0.12 * hs, 0); w.scale.setScalar(hs); P.body.add(w);
    const chk = canvasTex(64, 64, c => { c.fillStyle = a; c.fillRect(0, 0, 64, 64); c.strokeStyle = b; c.lineWidth = 4; for (let i = -64; i < 128; i += 12) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 64, 64); c.stroke(); c.beginPath(); c.moveTo(i + 64, 0); c.lineTo(i, 64); c.stroke(); } }), m = new THREE.MeshToonMaterial({ map: chk, gradientMap: ST.grad });
    const dome = M(new THREE.SphereGeometry(0.4, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), m, 0, 0.12, -0.04, w, 0.012); dome.scale.set(1.05, 0.62, 1.05);
    M(new THREE.TorusGeometry(0.36, 0.07, 8, 20), toon(b), 0, 0.14, -0.03, w, 0.01).rotation.x = Math.PI / 2;
    if (tail) { const t = M(new THREE.BoxGeometry(0.42, 0.62, 0.04), m, 0, -0.2, -0.36, w, 0.008); t.rotation.x = 0.18; } return w; }
  const ben = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#5a2f18', '#5a2f18', '#e6b45a'], crest: '', gear: 'none', mood: 'happy' })); const BP = ben.userData.P;
  const ummi = strip(kit.makeFox({ ...CAST.player, look: { ...PLAYER_FEMALE, elder: 1, fur: '#f0a860', furDark: '#dd9648', paw: '#dd9648', tailBase: '#dd9648', tailMid: '#f0a860', browColor: '#f4f1ec' }, torso: ['#d8b98a', '#a8843f', '#5a4218'], outfit: 'robe', crest: '', gear: 'none', mood: 'happy' }));
  headWrap(ummi, '#2f6d6a', '#e6b45a');
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 96); g.fillStyle = '#e6b45a';
      g.beginPath(); g.ellipse(-6, 10, 52, 26, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(-10, -12, 28, 24, 0, Math.PI, 0); g.fill(); g.fillRect(36, -40, 14, 50); g.beginPath(); g.ellipse(54, -42, 18, 10, 0, 0, 7); g.fill(); for (const x of [-42, -24, 18, 34]) g.fillRect(x, 28, 9, 40); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.05); g.fillStyle = '#e6b45a'; g.fillRect(-124, -26, 248, 52); g.font = 'italic 900 32px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#5a2f18'; g.fillText("UMMI'S CAMEL PEN", 0, 2); g.restore(); });
    const U = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#c42d3c', towelCol: '#c42d3c' }), hat = U.hat; hat.visible = false; const wrap = headWrap(ben, '#f2e6c8', '#c42d3c'); return [U.towel, U.print, wrap]; })();
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const ownerList = () => save.flag('w.dahabDone') ? [...OWNERS, DAHAB] : OWNERS;
  let musician = null;
  const foxShadow = f => { const sh = blobShadow(THREE, canvasTex, 1.1, 1.1, 0.32); f.add(sh); return f; }; foxShadow(ben); foxShadow(ummi);
  { const f = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#b8693a', furDark: '#7a3f1c', paw: '#7a3f1c', tailBase: '#7a3f1c', tailMid: '#b8693a' }, torso: ['#1f3a5f', '#e6b45a', '#16263c'], outfit: 'robe', crest: '', gear: 'none', mood: 'happy' })); headWrap(f, '#1f3a5f', '#e6b45a', false); foxShadow(f);
    f.position.set(-6.75, 0.0, -4.95); f.rotation.y = 0.9; f.scale.setScalar(0.92); const P = f.userData.P;
    const oud = new THREE.Group(); oud.position.set(0.05, 1.0, 0.3); oud.rotation.set(0.2, 0, 1.15); P.body.add(oud); { const bw = M(new THREE.SphereGeometry(0.26, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#8a4a1e'), 0, 0, 0, oud, 0.01); bw.rotation.x = -Math.PI / 2; bw.scale.set(1, 1.35, 0.6); M(new THREE.CylinderGeometry(0.26, 0.26, 0.02, 18), toon('#d9b37a'), 0, 0, 0.0, oud, 0.006).rotation.x = Math.PI / 2; M(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 10), toon('#3a2010'), 0, 0.02, 0.012, oud, 0).rotation.x = Math.PI / 2; const nk = M(new THREE.BoxGeometry(0.09, 0.42, 0.04), toon('#5a2f18'), 0, 0.45, 0, oud, 0.006); const pb = M(new THREE.BoxGeometry(0.1, 0.18, 0.05), toon('#5a2f18'), 0.04, 0.72, -0.04, oud, 0.006); pb.rotation.z = -0.9; }
    M(new THREE.CylinderGeometry(0.42, 0.45, 0.22, 14), toon('#c42d3c'), -6.75, 0.11, -4.95, null, 0.01, 0.45); f.position.y = -0.38; musician = f; musician.userData.oud = oud; musician.visible = false; }
  const ownerFox = [...OWNERS, DAHAB].map(o => { const f = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: o.fur, furDark: o.furDark, paw: o.furDark, tailBase: o.furDark, tailMid: o.fur }, torso: o.torso, outfit: o.outfit, crest: '', gear: 'none', mood: 'happy' })); f.visible = false; if (o.outfit === 'robe' || o.outfit === 'dress') headWrap(f, o.torso[0], o.torso[2], false); foxShadow(f); return f; });
  // Ummi's own camels in the stalls
  const qamar = makeCamel(ctx, 'drom', { blanket: true, bells: true, fur: '#b88a52', dark: '#7a5430' }), zahra = makeCamel(ctx, 'drom', { fur: '#e8d2a8', dark: '#b8966a' }); zahra.g.scale.setScalar(0.86);
  const RES = [{ C: qamar, name: 'QAMAR', s: Y.spots.qamar }, { C: zahra, name: 'ZAHRA', s: Y.spots.zahra }];
  RES.forEach(r => { r.C.g.position.set(r.s.x, 0, r.s.z); r.C.g.rotation.y = -Math.PI / 2; scene.add(r.C.g); });
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.4); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const attRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x22c55e, transparent: true, depthWrite: false, depthTest: false })); attRing.visible = false; attRing.renderOrder = 35; scene.add(attRing);
  const treatM = foodMesh(THREE, toon, 'dates', M); treatM.scale.setScalar(1.6); treatM.visible = false; scene.add(treatM);
  const brushG = new THREE.Group(); { M(new THREE.BoxGeometry(0.34, 0.08, 0.14), toon('#9a7444'), 0, 0, 0, brushG, 0.008); for (let i = 0; i < 10; i++) M(new THREE.BoxGeometry(0.02, 0.08, 0.02), toon('#3a2a1a'), -0.14 + (i % 5) * 0.07, -0.07, i < 5 ? -0.03 : 0.03, brushG, 0); } brushG.visible = false; scene.add(brushG);

  // ---------- state ----------
  const S = { audioOn: false, phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), camN: 0, earned: 0, tips: 0, starList: [], tool: null, flash: null, flashT: 0, say: '', sayT: 0, ptr: null, held: null, react: null, done: null, phT: 0, confirm: 0, doneSeen: {}, spit: 0, fly: [], dlg: null, toast: null, toastT: 0, stick: { x: 0, y: 0 }, keys: new Set(), handleA: 0, streamT: 0, met: false, asked: {} };
  const W = { yaw: 0.35, pitch: 0.5, dist: 8.2, look: V3(), pov: false };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const toast = (s, t = 2.6) => { S.toast = s; S.toastT = t; };
  let C = null, owner = null, OWN = null, lastOwner = -1;
  const wp = o => o.getWorldPosition(new THREE.Vector3());
  const SFX = createPenAudio(audio), buzz = n => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };
  const panOf = p => { if (!p) return 0; const v = p.clone().project(camera); return Math.max(-0.8, Math.min(0.8, v.x * 0.7)); };
  const wake = () => { S.audioOn = true; SFX.ensure(); };
  function setOud() { const on = upg('oud'); SFX.music.oud(on); if (musician) musician.visible = on; }
  const sfx = (n, o = {}) => SFX.play(n, o), camPan = () => C ? panOf(wp(C.head)) : 0;
  const grumble = (v = 0.05) => sfx(v >= 0.04 ? 'groan' : 'grumble', { pan: camPan(), vol: 0.8 + v * 4 });
  const hum = () => sfx('hum', { pan: camPan() });

  // ---------- jobs ----------
  function partition(ws) { const n = ws.length, tot = ws.reduce((a, b) => a + b, 0); if (tot % 2) return null; for (let m = 0; m < (1 << n); m++) { let s = 0; for (let i = 0; i < n; i++) if (m & (1 << i)) s += ws[i]; if (s === tot / 2) return ws.map((_, i) => m & (1 << i) ? 1 : -1); } return null; }
  function trainSeq(n) { const out = []; let kneel = false; for (let i = 0; i < n; i++) { const c = kneel ? 'stand' : (i === 0 || Math.random() < 0.6 ? 'kneel' : 'walk'); out.push(c); if (c === 'kneel') kneel = true; if (c === 'stand') kneel = false; } if (n >= 3 && !out.includes('walk')) { if (out[out.length - 1] === 'stand') out.push('walk'); else out[out.length - 1] = 'stand', out.push('walk'); } return out; }
  function newJob() { const d = S.day, type = S.forceType || pick(d <= 1 ? ['drom', 'calf', 'drom'] : ['drom', 'bact', 'calf', 'drom']), D = CAMELS[type];
    const pool = D.tasks.slice(), n = Math.min(pool.length, d <= 1 ? 2 : d <= 2 ? 3 : d <= 4 ? 3 + (Math.random() < 0.5 ? 1 : 0) : 4 + (Math.random() < 0.5 ? 1 : 0)), tasks = [];
    if (Math.random() < 0.75) tasks.push('water'); while (tasks.length < n) { const t = pick(pool.filter(q => !tasks.includes(q))); tasks.push(t); }
    if (S.forceType) { tasks.length = 0; tasks.push(...pool); } tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    const kinds = d <= 1 ? [pick(['hay', 'alfalfa'])] : [pick(['hay', 'alfalfa']), pick(['dates', 'salt'])], food = {}; let tot = d <= 1 ? 2 : 3 + (d > 3 ? 1 : 0); kinds.forEach((k, i) => { const c = i === kinds.length - 1 ? tot : Math.max(1, tot - 1); food[k] = c; tot -= c; }); if (tot > 0) food[kinds[0]] += tot;
    let bags, sol; do { bags = Array.from({ length: d <= 2 ? 3 : 4 + (d > 4 && Math.random() < 0.5 ? 1 : 0) }, () => pick([1, 2, 2, 3])); sol = partition(bags); } while (!sol);
    const feet = type === 'calf' || d <= 2 ? [pick([1, 3])] : [1, 3], thorns = feet.map(() => d <= 2 ? 1 + (Math.random() < 0.5 ? 1 : 0) : 2 + (Math.random() < 0.5 ? 1 : 0));
    const L = ownerList(); let oi; do { oi = Math.floor(Math.random() * L.length); } while (oi === lastOwner && L.length > 1); lastOwner = oi; const O = L[oi];
    return { type, tasks, food, cmds: trainSeq(d <= 1 ? 2 : d <= 3 ? 3 : 4), bags, sol, feet, thorns, burrs: 3 + Math.min(4, d), dust: 2 + (d > 2 ? 1 : 0), owner: O, ownerIx: [...OWNERS, DAHAB].indexOf(O), name: pick(NAMES), day: d }; }
  function bodyPoint(u, v) { const s = 1 - u * u - v * v; if (s < 0.18) return null; const p = V3(u, 1.6 + v * 0.5, Math.sqrt(s) * 0.45), n = V3(p.x, (p.y - 1.6) / 0.25, p.z / 0.2025).normalize(); return { p, n }; }
  function dressCamel(C, J) {
    const pts = []; const far = p => pts.every(q => q.distanceTo(p) > 0.2);
    for (let i = 0, guard = 0; i < J.burrs && guard < 400; guard++) { const bp = bodyPoint(rr(-0.8, 0.72), rr(-0.55, 0.5)); if (!bp || !far(bp.p)) continue; pts.push(bp.p); i++;
      const b = M(new THREE.IcosahedronGeometry(0.06, 0), toon('#5a4020'), bp.p.x + bp.n.x * 0.04, bp.p.y + bp.n.y * 0.04, bp.p.z + bp.n.z * 0.04, C.bodyG, 0.008); for (let k = 0; k < 5; k++) { const sp = M(new THREE.ConeGeometry(0.012, 0.07, 4), toon('#3a2a14'), 0, 0, 0, b, 0); const a = k * 1.26; sp.position.set(Math.cos(a) * 0.05, Math.sin(a) * 0.05, 0.02); sp.rotation.z = a - Math.PI / 2; } C.burrs.push(b); }
    for (let i = 0, guard = 0; i < J.dust && guard < 400; guard++) { const bp = bodyPoint(rr(-0.7, 0.6), rr(-0.4, 0.42)); if (!bp || !far(bp.p)) continue; pts.push(bp.p); i++;
      const d = new THREE.Mesh(new THREE.CircleGeometry(0.2, 14), new THREE.MeshBasicMaterial({ map: dustTex, color: 0xe2c48e, transparent: true, opacity: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); d.position.copy(bp.p).addScaledVector(bp.n, 0.015); d.quaternion.setFromUnitVectors(V3(0, 0, 1), bp.n); d.scale.set(1.3, 0.9, 1); d.userData.cover = 1; C.bodyG.add(d); C.dust.push(d); }
    J.feet.forEach((li, fi) => { const L = C.legs[li]; L.state = 'thorns'; L.sole.material = L.sole.material.clone(); L.solCol = L.sole.material.color.clone();
      for (let k = 0; k < J.thorns[fi]; k++) { const x = J.thorns[fi] === 1 ? 0.02 : -0.07 + k * (0.14 / (J.thorns[fi] - 1)) + rr(-0.015, 0.015), z = rr(-0.06, 0.06);
        const sore = new THREE.Mesh(new THREE.CircleGeometry(0.035, 10), new THREE.MeshBasicMaterial({ color: 0xe2453f })); sore.rotation.x = Math.PI / 2; sore.position.set(x, -0.043, z); L.pad.add(sore);
        const th = M(new THREE.ConeGeometry(0.02, 0.13, 5), toon('#f2e6c8'), x, -0.1, z, L.pad, 0.006); th.rotation.x = Math.PI; th.userData = { sore, out: false, pull: 0, y0: -0.1 }; L.thorns.push(th); } });
    C.water = { lvl: 0, thirst: C.D.thirst, th0: C.D.thirst, spilled: 0 }; C.fed = {}; C.wrong = 0; C.tr = { i: 0, att: 'away', t: 1.6, act: null, treat: 0, fed: 0, miss: 0, kneel: false }; C.bags = null; }
  const dustTex = canvasTex(64, 64, c => { const gr = c.createRadialGradient(32, 32, 4, 32, 32, 31); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); c.fillStyle = 'rgba(160,120,70,0.6)'; for (let i = 0; i < 40; i++) c.fillRect(10 + Math.random() * 44, 10 + Math.random() * 44, 3, 3); });
  function nextCamel() { if (C) { scene.remove(C.g); C = null; } const J = newJob(); C = makeCamel(ctx, J.type); C.job = J; dressCamel(C, J); scene.add(C.g);
    OWN = J.owner; owner = ownerFox[J.ownerIx]; ownerFox.forEach(f => f.visible = f === owner); C.g.position.set(Y.spots.gate.x, 0, CP.z); C.g.rotation.y = 0; owner.position.set(Y.spots.gate.x + 2.2, 0, CP.z + 1.0); owner.rotation.y = Math.PI / 2;
    S.phase = 'arrive'; S.phT = 0; S.tool = null; S.confirm = 0; S.doneSeen = {}; Y.water.visible = false; S.handleA = 0; sfx('jingle', { pan: -0.8, vol: 0.7 }); }

  // ---------- task progress ----------
  function info(id) { if (!C || !C.job) return { done: false, q: 0, prog: 0, txt: '' }; const J = C.job;
    if (id === 'water') { const w = C.water, done = w.thirst <= 0; return { done, q: clamp(1 - w.spilled * 1.4, 0.3, 1), prog: 1 - w.thirst / w.th0, txt: done ? 'DONE' : Math.round((1 - w.thirst / w.th0) * 100) + '%' }; }
    if (id === 'feed') { let want = 0, got = 0; for (const k in J.food) { want += J.food[k]; got += Math.min(J.food[k], C.fed[k] || 0); } return { done: got >= want, q: clamp(1 - C.wrong * 0.25, 0.25, 1), prog: got / want, txt: got >= want ? 'DONE' : (want - got) + ' LEFT' }; }
    if (id === 'brush') { const n = C.burrs.length + C.dust.length + (C.brushN0 || 0), l = C.burrs.filter(b => b.parent).length + C.dust.filter(d => d.parent).length; if (!C.brushN0) C.brushN0 = 0; const tot = Math.max(1, C.job.burrs + C.job.dust); return { done: !l, q: 1, prog: 1 - l / tot, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'feet') { const Ls = J.feet.map(i => C.legs[i]), l = Ls.filter(L => L.state !== 'done').length; return { done: !l, q: Ls.reduce((s, L) => s + L.q, 0) / Ls.length, prog: Ls.reduce((s, L) => s + (L.state === 'done' ? 1 : L.state === 'balm' ? 0.5 + L.balm * 0.5 : 0.5 * L.thorns.filter(t => t.userData.out).length / Math.max(1, L.thorns.length)), 0) / Ls.length, txt: l ? l + (l > 1 ? ' FEET' : ' FOOT') : 'DONE' }; }
    if (id === 'train') { const T = C.tr, n = J.cmds.length, done = T.i >= n; return { done, q: clamp(1 - T.miss * 0.1 - (done ? (n - T.fed) * 0.15 : 0), 0.35, 1), prog: T.i / n, txt: done ? 'DONE' : T.i + ' / ' + n }; }
    if (id === 'load') { const B = C.bags, n = J.bags.length; if (!B) return { done: false, q: 0, prog: 0, txt: '0 / ' + n }; const on = B.filter(b => b.side).length, df = Math.abs(bal()), done = on === n; return { done, q: df === 0 || (df === 1 && upg('scale')) ? 1 : df === 1 ? 0.75 : df === 2 ? 0.55 : 0.35, prog: on / n, txt: done ? (df ? 'TILTED' : 'DONE') : on + ' / ' + n }; }
    return { done: true, q: 1, prog: 1, txt: '' }; }
  const bal = () => C && C.bags ? C.bags.reduce((s, b) => s + b.side * b.w, 0) : 0;
  const locked = id => !!(C && C.job && id === 'load' && C.job.tasks.includes('brush') && !info('brush').done);
  const allDone = () => C && C.job && C.job.tasks.every(t => info(t).done);
  const nextTask = () => C && C.job && C.job.tasks.find(t => !info(t).done && !locked(t)) || C && C.job && C.job.tasks.find(t => !info(t).done);
  function setTool(id) { if (S.phase !== 'work' || !C || !C.job.tasks.includes(id)) return; if (S.held) dropHeld(); S.tool = id; S.userToolT = performance.now(); S.ptr = null; audio.init && audio.init(); wake(); sfx('tap', { vol: 0.5 });
    if (id === 'load' && locked('load')) { flash('BRUSH HER FIRST · SAND UNDER A SADDLE RUBS SORES', '#ec3013', 2.2); grumble(0.03); }
    else if (id === 'load' && !C.bags) setupLoad(); else if (id === 'load') say('UMMI: "Keep her level. A lopsided load walks crooked for forty miles."', 3.5);
    if (id === 'train' && C.tr.i === 0 && !C.tr.started) { C.tr.started = 1; say('UMMI: "Wait until she looks at you. Then ask. Then pay her."', 4); } }
  function checkDone() { if (!C || !C.job) return; for (const t of C.job.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; if (!DM.on || true) flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); sfx('done'); buzz(15);
        const h = wp(C.head); for (let i = 0; i < 6; i++) puff(h.x + rr(-1.2, 0.4), rr(1.2, 2.6), h.z + 0.6, 0xffe7a0, 1);
        const nx = nextTask(); if (!nx) say('UMMI: "That is everything on the card. Hand her back to ' + OWN.name.split(' ').pop() + '."', 4); else { const was = S.tool; setTimeout(() => { if (S.phase === 'work' && S.tool === was && !S.ptr && !S.held) setTool(nx); }, 1200); } } } }

  // ---------- screen helpers ----------
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const sdist = (p, x, y) => { const s = scr(p); return Math.hypot(s.x - x, s.y - y); };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(), camDir = V3();
  function onPlane(x, y, pt) { camera.getWorldDirection(camDir); plane.setFromNormalAndCoplanarPoint(camDir, pt); ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const o = V3(); return ray.ray.intersectPlane(plane, o) ? o : pt.clone(); }

  // ---------- WATER ----------
  function pumpBy(dy) { if (!C || info('water').done) { if (C && performance.now() - (S.wdT || 0) > 1500) { S.wdT = performance.now(); flash('SHE HAS HAD ENOUGH WATER', '#ffffff', 1.2); } return; }
    const a0 = S.handleA; S.handleA = clamp(S.handleA + dy * 0.007, -0.6, 0.6); const moved = Math.abs(S.handleA - a0) + (Math.abs(dy) > 0 && Math.abs(S.handleA) >= 0.6 ? 0 : 0); if (!moved) return;
    const add = Math.abs(dy) / (upg('pump') ? 380 : 650), W0 = C.water; W0.lvl += add; S.streamT = 0.25; const dir = Math.sign(dy); if (dir && dir !== S.pumpDir) { S.pumpDir = dir; sfx('creak', { pitch: dir > 0 ? 1 : 1.2, pan: 0.3 }); if (dir > 0) sfx('clank', { vol: 0.5, pan: 0.3 }); }
    if (W0.lvl > 1) { W0.spilled += W0.lvl - 1; W0.lvl = 1; const T = Y.trough; for (let i = 0; i < 2; i++) puff(rr(T.x0, T.x1), 0.8, T.z1 + 0.05, 0x9fdcf0, 1); if (performance.now() - (S.splT || 0) > 250) { S.splT = performance.now(); sfx('splash', { pan: 0.1 }); } if (performance.now() - (S.spillT || 0) > 1600) { S.spillT = performance.now(); flash('SPILLING! WATER IS GOLD IN KUFA', '#ec3013', 1.4); } } }

  // ---------- FEED ----------
  const binAt = (x, y) => { let best = null, bd = 70 * scale(); for (const k of FK) { const d = sdist(wp(Y.bins[k]).add(V3(0, 0.25, 0)), x, y); if (d < bd) { bd = d; best = k; } } return best; };
  function grabFood(k, x, y) { const m = foodMesh(THREE, toon, k, M); m.scale.setScalar(1.5); const p = wp(Y.bins[k]).add(V3(0, 0.4, 0)); m.position.copy(p); scene.add(m); S.held = { kind: 'food', k, m, p0: p }; sfx('rustle', { pan: panOf(p) }); }
  function dropHeld() { const H = S.held; if (!H) return; S.held = null; if (H.kind === 'food') { scene.remove(H.m); puff(H.m.position.x, H.m.position.y, H.m.position.z, 0xf2e6c8, 1); } else if (H.kind === 'bag') { homeBag(H.b); } }
  function eat(k) { const J = C.job; if ((C.fed[k] || 0) < (J.food[k] || 0) && C.chew <= 0.3) { C.fed[k] = (C.fed[k] || 0) + 1; C.chew = 1.4; C.happy = 0.6; const m = wp(C.mouth); puff(m.x, m.y, m.z, 0xe0c35e, 2); sfx('munch', { pan: panOf(m) });
      flash('MUNCH · ' + FOODS[k].name + ' ' + C.fed[k] + ' / ' + J.food[k], '#22c55e', 1.1); checkDone(); return true; }
    if (C.chew > 0.3 && (C.fed[k] || 0) < (J.food[k] || 0)) { flash('STILL CHEWING · WAIT A MOMENT', '#ffffff', 1.1); return false; }
    spit(J.food[k] ? 'SHE IS FULL OF ' + FOODS[k].name : 'SHE DID NOT WANT ' + FOODS[k].name); return false; }
  function spit(why) { C.wrong++; C.rear = 1; S.spit = 1.3; const m = wp(C.mouth); const b = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xb8e08a, transparent: true, depthWrite: false })); b.scale.setScalar(0.35); b.position.copy(m); scene.add(b); const v = camera.position.clone().sub(m).normalize().multiplyScalar(7); v.y += 1.5; S.fly.push({ m: b, v, life: 0.7, g: 4, grow: 1.5 });
    sfx('spit', { pan: panOf(m), vol: 1.2 }); setTimeout(() => sfx('snort', { pan: panOf(m) }), 450); buzz(60); flash('PTOO! ' + why, '#ec3013', 1.6); }

  // ---------- BRUSH ----------
  function brushAt(x, y, d) { let hit = false; for (const b of C.burrs) { if (!b.parent || sdist(wp(b), x, y) > 34 * scale()) continue; const p = wp(b); b.parent.remove(b); hit = true; puff(p.x, p.y, p.z + 0.1, 0xd8b67e, 2); sfx('pop', { pan: panOf(p) }); }
    for (const s of C.dust) { if (!s.parent || sdist(wp(s), x, y) > 62 * scale()) continue; hit = true; s.userData.cover -= d / (upg('comb') ? 120 : 240); s.material.opacity = Math.max(0, s.userData.cover) * 0.95; if (Math.random() < 0.35) { const p = wp(s); puff(p.x + rr(-0.1, 0.1), p.y, p.z + 0.12, 0xe8d2a0, 1); } if (performance.now() - (S.scrT || 0) > 70) { S.scrT = performance.now(); sfx('scratch', { pan: panOf(wp(s)), vol: 0.9 }); } if (s.userData.cover <= 0.05) { s.parent.remove(s); sfx('tap', { vol: 0.6 }); } }
    if (hit) { C.happy = 0.8; if (Math.random() < 0.04) hum(); checkDone(); } }

  // ---------- FEET ----------
  const curLeg = () => C && C.job ? C.legs[C.job.feet.find(i => C.legs[i].state !== 'done') ?? -1] || null : null;
  function pullTo(th, d, t0) { const need = (upg('pincers') ? 45 : 80) * scale(), U = th.userData; U.pull = Math.min(1, d / need); th.scale.set(1, 1 + U.pull * 0.8, 1); th.position.y = U.y0 - U.pull * 0.07; U.sore.material.color.setHex(U.pull > 0.5 ? 0xff2a1a : 0xe2453f); if (performance.now() - (S.thT || 0) > 90) { S.thT = performance.now(); sfx('thornCreak', { k: U.pull }); }
    if (U.pull >= 1) popThorn(th, performance.now() - t0 < 260); }
  function popThorn(th, fast) { const L = curLeg(), U = th.userData; if (U.out) return; U.out = true; const p = wp(th); th.parent.remove(th); th.position.copy(p); th.scale.setScalar(C.g.scale.x); scene.add(th); S.fly.push({ m: th, v: V3(rr(-1, 1), 3, 2.2), life: 1.2, g: 9, spin: 12 }); U.sore.material.color.setHex(0xf2a0a0); S.ptr && (S.ptr.kind = null);
    sfx('plink'); if (fast) { L.q = Math.max(0.4, L.q - 0.25); C.rear = 0.7; sfx('ouch', { pan: camPan() }); buzz(40); flash('OUCH! PULL SLOWER', '#ec3013', 1.4); } else { flash('THORN OUT ✓', '#22c55e', 1); }
    if (L.thorns.every(t => t.userData.out)) { L.state = 'balm'; setTimeout(() => S.phase === 'work' && flash('NOW RUB BALM IN · SMALL CIRCLES', '#ffffff', 1.6), 700); } }
  function balmMove(L, x, y) { const c = scr(wp(L.pad)), dx = x - c.x, dy = y - c.y, r = Math.hypot(dx, dy); if (r < 6 || r > 140 * scale()) { S.ptr.a = null; return; } const a = Math.atan2(dy, dx); if (S.ptr.a != null) { let da = a - S.ptr.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; balmAdd(L, Math.abs(da) / (Math.PI * 4)); } S.ptr.a = a; }
  function balmAdd(L, v) { L.balm = Math.min(1, L.balm + v); L.sole.material.color.copy(L.solCol).lerp(new THREE.Color('#c08a5a'), L.balm); if (Math.random() < 0.25) { const p = wp(L.pad); puff(p.x + rr(-0.1, 0.1), p.y + rr(-0.1, 0.1), p.z + 0.1, 0xfff2c0, 1); } if (performance.now() - (S.sqT || 0) > 160) { S.sqT = performance.now(); sfx('squish', { vol: 0.8 }); }
    if (L.balm >= 1 && L.state === 'balm') { L.state = 'done'; L.thorns.forEach(t => t.userData.sore.visible = false); C.happy = 1.2; hum(); flash('FOOT DONE ✓', '#22c55e', 1.2); checkDone(); } }

  // ---------- TRAIN ----------
  function trainSwipe(dir) { const T = C.tr, cmd = C.job.cmds[T.i]; if (!cmd || T.act || T.treat > 0) return;
    if (T.att !== 'on') { T.miss++; sfx('snort', { pan: camPan() }); flash('SHE IS NOT LOOKING · WAIT FOR THE GREEN', '#ffffff', 1.5); return; }
    if (dir !== CMDS[cmd].dir) { T.miss++; C.rear = 0.4; grumble(0.04); buzz(30); flash('WRONG SIGN · ' + CMDS[cmd].arrow + ' ' + CMDS[cmd].word + ' IS ' + (CMDS[cmd].dir === 'side' ? 'SIDEWAYS' : CMDS[cmd].dir.toUpperCase()), '#ec3013', 1.6); return; }
    T.act = { cmd, t: 0 }; T.att = 'busy'; sfx('chime'); if (cmd === 'kneel') setTimeout(() => sfx('groan', { pan: camPan(), pitch: 0.9 }), 250); if (cmd === 'stand') setTimeout(() => sfx('grumble', { pan: camPan() }), 200); flash(CMDS[cmd].word + '! · ' + CMDS[cmd].name, '#22c55e', 1.2);
    if (cmd === 'kneel') T.kneel = true; if (cmd === 'stand') T.kneel = false; }
  function trainTreat() { const T = C.tr; if (T.treat <= 0) return false; T.treat = 0; T.fed++; T.i++; T.att = 'away'; T.t = 0.9; C.happy = 1.5; C.chew = 1.2; treatM.visible = false; const n = wp(C.nose); for (let i = 0; i < 6; i++) puff(n.x + rr(-0.3, 0.3), n.y + rr(0, 0.5), n.z + rr(-0.2, 0.3), 0xff7aa8, 1); sfx('treat', { pan: panOf(n) }); setTimeout(() => sfx('munch', { pan: panOf(n), vol: 0.6 }), 300); flash('GOOD CAMEL! ♥ ' + T.i + ' / ' + C.job.cmds.length, '#22c55e', 1.2); checkDone(); return true; }

  // ---------- LOAD ----------
  function bagMesh(w) { const g = new THREE.Group(), s = 0.8 + w * 0.17; const b = M(new THREE.SphereGeometry(0.22, 14, 10), toon(['#c9a46a', '#b8945f', '#a8844f'][w - 1]), 0, 0.2 * s, 0, g, 0.01); b.scale.set(s, s * 1.05, s * 0.85); M(new THREE.CylinderGeometry(0.05 * s, 0.08 * s, 0.1, 8), toon('#8a6a2c'), 0, 0.44 * s, 0, g, 0.006);
    const lt = canvasTex(64, 64, c => { c.fillStyle = '#201e1d'; c.beginPath(); c.arc(32, 32, 30, 0, 7); c.fill(); c.fillStyle = '#ffd23a'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(w), 32, 35); });
    const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: lt, depthTest: false })); lab.scale.setScalar(0.24); lab.position.y = 0.62 * s; lab.renderOrder = 22; g.add(lab); g.userData.s = s; return g; }
  function setupLoad() { const n = C.job.bags.length; C.bags = C.job.bags.map((w, i) => { const m = bagMesh(w), home = V3(CP.x - 2.75 - (i % 2) * 0.35, 0, CP.z - 1.5 + i * (3.0 / Math.max(1, n - 1))); m.position.copy(home); scene.add(m); return { w, m, side: 0, home, i }; }); C.saddle.visible = true; sfx('groan', { pan: camPan(), pitch: 0.9 }); say('UMMI: "HOOSH! She is down. Number on the sack is its weight. Keep her level."', 4.5); }
  function bagAt(x, y) { let best = null, bd = 64 * scale(); for (const b of C.bags) { const d = sdist(wp(b.m).add(V3(0, 0.25, 0)), x, y); if (d < bd) { bd = d; best = b; } } return best; }
  function homeBag(b) { if (b.m.parent !== scene) { const p = wp(b.m); b.m.parent.remove(b.m); b.m.position.copy(p); b.m.scale.setScalar(1); scene.add(b.m); } b.side = 0; b.fly = { from: b.m.position.clone(), to: b.home.clone(), t: 0 }; restack(); }
  function hang(b, side) { const P = C.pans[side < 0 ? 0 : 1]; b.side = side; P.g.add(b.m); b.m.scale.setScalar(1 / C.g.scale.x); b.fly = null; restack(); sfx('thump', { pan: side < 0 ? -0.4 : 0.4 });
    const df = bal(); C.tiltT = clamp(df * 0.07, -0.32, 0.32); if (Math.abs(df) >= 3) { grumble(0.05); flash('SHE IS LEANING · BALANCE IT', '#ec3013', 1.4); } else if (C.bags.every(q => q.side)) { if (!df) flash('LEVEL! ✓', '#22c55e', 1.2); else flash('ALL ON · BUT SHE TILTS ' + (df > 0 ? 'TO THE NEAR SIDE' : 'TO THE FAR SIDE'), '#e6b45a', 1.8); } checkDone(); }
  function restack() { for (const P of C.pans) { const on = C.bags.filter(b => b.side === P.side); on.forEach((b, i) => b.m.position.set(-0.26 + (i % 2) * 0.52, -0.38 + Math.floor(i / 2) * 0.36, P.side * 0.2)); } C.tiltT = clamp(bal() * 0.07, -0.32, 0.32); }
  const panAt = (x, y) => { let best = null, bd = 160 * scale(); C.pans.forEach(P => { const d = sdist(wp(P.g), x, y); if (d < bd) { bd = d; best = P; } }); return best; };

  // ---------- input ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function onDown(e) { audio.init && audio.init(); wake(); S.lastInput = performance.now(); const { x, y } = local(e);
    if (S.phase === 'walk') { if (S.dlg) return; S.ptr = { kind: 'look', x, y, x0: x, y0: y, t0: performance.now() }; return; }
    if (DM.on || S.phase !== 'work' || !C) return; e.preventDefault(); const T = S.tool; S.ptr = { x, y, x0: x, y0: y, t0: performance.now(), kind: null };
    if (T === 'water') { S.ptr.kind = 'pump'; }
    else if (T === 'feed') { const k = binAt(x, y); if (k) { grabFood(k, x, y); S.ptr.kind = 'food'; } else flash('DRAG FOOD FROM A BIN TO HER MOUTH', '#ffffff', 1.1); }
    else if (T === 'brush') { S.ptr.kind = 'brush'; brushG.visible = true; brushAt(x, y, 20); }
    else if (T === 'feet') { const L = curLeg(); if (!L) return; if (L.state === 'thorns') { let th = null, bd = 44 * scale(); for (const t of L.thorns) { if (t.userData.out) continue; const d = sdist(wp(t), x, y); if (d < bd) { bd = d; th = t; } } if (th) { S.ptr.kind = 'pull'; S.ptr.th = th; } else flash('PRESS ON A THORN, THEN PULL IT OUT', '#ffffff', 1.1); } else if (L.state === 'balm') { S.ptr.kind = 'balm'; S.ptr.a = null; } }
    else if (T === 'train') { S.ptr.kind = 'swipe'; }
    else if (T === 'load') { if (locked('load')) { flash('BRUSH HER FIRST', '#ec3013', 1.2); return; } if (!C.bags) setupLoad(); const b = bagAt(x, y); if (!b) { flash('DRAG A SACK ONTO A PACK', '#ffffff', 1); return; } if (b.side) { homeBag(b); flash('TAKEN OFF', '#ffffff', 0.8); sfx('rustle'); checkDone(); return; } const p = wp(b.m); if (b.m.parent !== scene) { b.m.parent.remove(b.m); scene.add(b.m); } b.m.position.copy(p); b.fly = null; S.held = { kind: 'bag', b, p0: p.clone().add(V3(0, 0.3, 0)) }; S.ptr.kind = 'bag'; sfx('rustle', { pan: panOf(p) }); } }
  function onMove(e) { const P = S.ptr; if (!P || !P.kind) return; const { x, y } = local(e), d = Math.hypot(x - P.x, y - P.y); if (d < 0.5) return;
    if (P.kind === 'look') { lookBy(x - P.x, y - P.y); P.x = x; P.y = y; return; }
    if (!C) return;
    if (P.kind === 'pump') pumpBy(y - P.y);
    else if (P.kind === 'food' && S.held) S.held.m.position.copy(onPlane(x, y, S.held.p0));
    else if (P.kind === 'bag' && S.held) S.held.b.m.position.copy(onPlane(x, y, S.held.p0)).add(V3(0, -0.25, 0));
    else if (P.kind === 'brush') { const n = Math.ceil(d / 12); for (let i = 1; i <= n; i++) brushAt(P.x + (x - P.x) * i / n, P.y + (y - P.y) * i / n, d / n); brushG.position.copy(onPlane(x, y, C.g.localToWorld(V3(0, 1.6, 0.6)))); brushG.rotation.z = Math.sin(performance.now() / 60) * 0.3; }
    else if (P.kind === 'pull') pullTo(P.th, Math.hypot(x - P.x0, y - P.y0), P.t0);
    else if (P.kind === 'balm') { const L = curLeg(); if (L) balmMove(L, x, y); }
    P.x = x; P.y = y; }
  function onUp(e) { const P = S.ptr; S.ptr = null; brushG.visible = false; if (!P) return; const x = e && e.clientX != null ? local(e).x : P.x, y = e && e.clientY != null ? local(e).y : P.y, moved = Math.hypot(x - P.x0, y - P.y0);
    if (P.kind === 'look') { if (moved < 10 && performance.now() - P.t0 < 400) walkTap(x, y); return; }
    if (!C) return;
    if (P.kind === 'food' && S.held) { if (sdist(wp(C.mouth), x, y) < 90 * scale() || S.held.m.position.distanceTo(wp(C.mouth)) < 0.45) { const k = S.held.k; scene.remove(S.held.m); S.held = null; eat(k); } else dropHeld(); }
    else if (P.kind === 'bag' && S.held) { const b = S.held.b, pan = panAt(x, y); S.held = null; if (pan) hang(b, pan.side); else homeBag(b); }
    else if (P.kind === 'pull' && P.th && !P.th.userData.out) { const U = P.th.userData; U.pull = 0; P.th.scale.set(1, 1, 1); P.th.position.y = U.y0; U.sore.material.color.setHex(0xe2453f); if (moved > 12) flash('KEEP PULLING · IT IS NOT OUT YET', '#ffffff', 1); }
    else if (P.kind === 'swipe') { const dx = x - P.x0, dy = y - P.y0; if (C.tr.treat > 0 && moved < 24) { if (sdist(wp(C.nose), x, y) < 110 * scale()) trainTreat(); else flash('TAP HER NOSE TO GIVE THE DATE', '#ffd23a', 1); return; } if (moved < 40 * Math.min(1, scale())) { if (C.tr.treat <= 0) flash('SWIPE THE SIGN · ' + (C.job.cmds[C.tr.i] ? CMDS[C.job.cmds[C.tr.i]].arrow + ' ' + CMDS[C.job.cmds[C.tr.i]].word : ''), '#ffffff', 1); return; } trainSwipe(Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 'down' : 'up') : 'side'); } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const KM = { KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  const onKD = e => { const tg = e.target && e.target.tagName; if (tg === 'INPUT' || tg === 'TEXTAREA') return; wake(); if (S.phase !== 'walk') return; if (KM[e.code]) { S.keys.add(e.code); e.preventDefault(); return; } if (e.repeat) return; if (e.code === 'KeyE' || e.code === 'Enter') talk(); else if (e.code === 'Digit1') api.melee(); else if (e.code === 'Digit2') api.range(); else if (e.code === 'Space') { e.preventDefault(); api.jump(); } };
  const onKU = e => S.keys.delete(e.code), onBlur = () => S.keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- WALK MODE (Ben in the pen, standard HUD) ----------
  function toWalk() { wake(); if (DM.on) demoStop(); if (C) { scene.remove(C.g); C = null; } if (C === null) ownerFox.forEach(f => f.visible = false); S.phase = 'walk'; S.done = null; S.react = null; S.tool = null; S.flash = null; S.say = ''; ben.visible = true; setUniform(!!save.flag('camelUniform'));
    place(ben, Y.spots.benSpawn, Math.PI / 2); place(ummi, Y.spots.ummiHome, 0.6); W.yaw = -0.62; W.pitch = 0.46; W.dist = CW() < CHh() ? 10.5 : 8.8; W.look.set(ben.position.x, 1.3, ben.position.z); Y.water.visible = false; save.where && save.where('kufa', PEN.room); toast('KUFA · CAMEL PEN', 2); }
  const nearRes = (r = 3.0) => { let best = null, bd = r; for (const R of RES) { const d = Math.hypot(ben.position.x - R.s.x, ben.position.z - (R.s.z + 1.6)); if (d < bd) { bd = d; best = R; } } return best; };
  const nearUmmi = () => Math.hypot(ben.position.x - ummi.position.x, ben.position.z - ummi.position.z) < 2.4;
  function promptTxt() { if (S.phase !== 'walk' || S.dlg) return null; if (nearUmmi()) return 'Talk to Ummi Reyhan'; const R = nearRes(); if (R) return R.name + ' · 1 PAT · 2 CALL'; return null; }
  function lookToward(Cm, x, z) { const g = Cm.g, ry = g.rotation.y, dx = x - g.position.x, dz = z - g.position.z, lx = dx * Math.cos(ry) - dz * Math.sin(ry), lz = dx * Math.sin(ry) + dz * Math.cos(ry); Cm.turnT = clamp(Math.atan2(-lz, lx) / 0.75, -1.1, 1.1); }
  function pat(R) { R = R || nearRes(); if (!R) { flash('WALK UP TO A CAMEL TO PAT HER', '#ffffff', 1.2); return; } R.C.happy = 2.2; R.C.earsT = 1; R.C.chew = 1.5; R.callT = 2.2; const h = wp(R.C.head); for (let i = 0; i < 7; i++) puff(h.x + rr(-0.3, 0.3), h.y + rr(0, 0.6), h.z + rr(-0.3, 0.3), 0xff7aa8, 1); sfx('pat', { pan: panOf(h) }); setTimeout(() => sfx('hum', { pan: panOf(h), pitch: R.C === zahra ? 1.2 : 0.95 }), 250); if (R.C.bell) sfx('bells', { pan: panOf(h), vol: 0.5 }); S.patT = 0.7; faceTo(ben, R.s.x, R.s.z); flash(R.name + ' LIKES THAT ♥', '#22c55e', 1.3); }
  function whistle() { sfx('whistle'); Y.scareDoves(); setTimeout(() => sfx('rustle', { vol: 0.6, pan: -0.3 }), 200); setTimeout(() => sfx('jingle', { pan: 0.6, vol: 0.5 }), 700); for (const R of RES) { R.callT = 3; R.C.earsT = 1; } setTimeout(() => sfx('grumble', { pan: 0.6, vol: 0.7 }), 500); flash('WHISTLE · THE CAMELS LOOK UP', '#ffd23a', 1.2); }
  function walkTap(x, y) { if (S.dlg) return; for (const R of RES) { if (sdist(wp(R.C.head), x, y) < 90 * scale()) { if (Math.hypot(ben.position.x - R.s.x, ben.position.z - R.s.z) < 4.6) pat(R); else toast('WALK CLOSER TO ' + R.name); return; } } if (sdist(wp(ummi).add(V3(0, 1.4, 0)), x, y) < 80 * scale()) { if (nearUmmi()) talk(); else toast('WALK UP TO UMMI TO TALK'); } }
  function walkStep(dt) { let sx = S.stick.x, sy = S.stick.y; for (const k of S.keys) { const v = KM[k]; if (v) { sx += v[0]; sy += v[1]; } } const m = Math.hypot(sx, sy); if (m > 1) { sx /= m; sy /= m; }
    let speed = 0; if (!S.dlg && !PAUSE && m > 0.08) { const fx = -Math.sin(W.yaw), fz = -Math.cos(W.yaw), rx = Math.cos(W.yaw), rz = -Math.sin(W.yaw), vx = (fx * sy + rx * sx) * 3.6, vz = (fz * sy + rz * sx) * 3.6; speed = Math.hypot(vx, vz);
      const nx = ben.position.x + vx * dt, nz = ben.position.z + vz * dt, okU = (x, z) => Y.walk(x, z) && Math.hypot(x - ummi.position.x, z - ummi.position.z) > 0.6; if (okU(nx, nz)) { ben.position.x = nx; ben.position.z = nz; } else if (okU(nx, ben.position.z)) ben.position.x = nx; else if (okU(ben.position.x, nz)) ben.position.z = nz;
      const ry = Math.atan2(vx, vz); let d = ry - ben.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; ben.rotation.y += d * Math.min(1, dt * 12); }
    kit.animFox(ben, dt, speed); { const ph = Math.floor(ben.userData.phase / Math.PI); if (speed > 0.5 && ph !== S.stepPh) sfx('step', { vol: 0.9 }); S.stepPh = ph; } if (S.patT > 0) { S.patT -= dt; BP.arms[1].rotation.x = -1.6 + Math.sin(performance.now() / 90) * 0.25; }
    if (nearUmmi() || S.dlg) { faceTo(ummi, ben.position.x, ben.position.z); ummi.userData.talking = !!S.dlg; } else ummi.rotation.y = damp(ummi.rotation.y, 0.6, 2, dt);
    W.look.lerp(V3(ben.position.x, 1.3, ben.position.z), Math.min(1, dt * 6)); const cp = Math.cos(W.pitch); camera.position.set(W.look.x + Math.sin(W.yaw) * cp * W.dist, W.look.y + Math.sin(W.pitch) * W.dist, W.look.z + Math.cos(W.yaw) * cp * W.dist); camera.lookAt(W.look); }
  function lookBy(dx, dy) { W.yaw -= dx * 0.006; W.pitch = clamp(W.pitch + dy * 0.004, 0.12, 1.15); }
  // ---------- talk (Ummi) — her lines from the Kufa world file + the job offer ----------
  const UMMI = { name: 'UMMI REYHAN', role: 'Camel Pen' };
  const TOPICS = UMMI_TALK.topics.map(T => ({ ...T, after: T.action === 'work' ? () => { closeDialog(); toIntro(); } : T.action === 'close' ? () => closeDialog() : null }));
  function openUmmi() { const pages = S.met ? [{ who: 'npc', text: UMMI_TALK.again }] : UMMI_TALK.greet.map(q => ({ ...q })); if (save.flag('w.dahabDone') && !S.met) pages.push({ who: 'npc', text: UMMI_TALK.dahabDone }); S.met = true; S.dlg = { pages, i: 0, choices: false, after: null }; sfx('tap'); }
  function talk() { if (S.phase !== 'walk') return; if (S.dlg) { if (!S.dlg.choices) nextLine(); return; } if (nearUmmi()) openUmmi(); else { const R = nearRes(); if (R) pat(R); } }
  function nextLine() { const D = S.dlg; if (!D || D.choices) return; if (D.i < D.pages.length - 1) { D.i++; return; } if (D.after) { const f = D.after; D.after = null; f(); return; } D.choices = true; }
  function choose(i) { const D = S.dlg; if (!D || !D.choices) return; const T = TOPICS[i]; if (!T) return; S.asked[T.id] = 1; S.dlg = { pages: [{ who: 'player', text: T.text }, ...T.replies.map(t => ({ who: 'npc', text: t }))], i: 1, choices: false, after: T.after || null }; }
  function closeDialog() { S.dlg = null; ummi.userData.talking = false; }
  function dialogHud() { const D = S.dlg; if (!D) return null; if (D.choices) return { name: UMMI.name, role: UMMI.role, text: 'Go on.', choices: TOPICS.map(T => ({ text: T.text, asked: !!S.asked[T.id] && !T.bye && T.id !== 'work', bye: !!T.bye })), more: false, step: 1, total: 1 };
    const pg = D.pages[D.i], me = pg.who === 'player'; ummi.userData.talking = !me; return { name: me ? 'BEN' : UMMI.name, role: me ? 'You' : UMMI.role, text: pg.text, choices: null, more: true, step: D.i + 1, total: D.pages.length }; }

  // ---------- flow ----------
  function toIntro() { if (DM.on) return; if (C) { scene.remove(C.g); C = null; } ownerFox.forEach(f => f.visible = false); S.phase = 'intro'; S.done = null; S.react = null; S.dlg = null; ben.visible = true; setUniform(true); place(ben, Y.spots.benIntro, -0.5); place(ummi, Y.spots.ummiIntro, 0.5); Y.water.visible = false; }
  function startDay() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; audio.init && audio.init(); wake(); S.dlg = null; Object.assign(S, { camN: 0, earned: 0, tips: 0, starList: [], done: null, react: null }); setUniform(!!save.flag('camelUniform')); ben.visible = false; place(ummi, Y.spots.ummi, -0.8); say('UMMI: "Here comes the first. Read the card. Do not rush her. Nothing in Kufa rushes."', 5); nextCamel(); }
  function handBack() { if (S.phase !== 'work' || !C) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND BACK AGAIN TO SEND HER', '#e6b45a', 2.2); return; } finishJob(); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['She is humming! I have never heard her hum.', 'Best-kept camel in the whole bazaar!', 'Look at that coat shine!'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Thank you. She looks content.', 'Good work. She is ready for the road.', 'Ummi trained you well.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['Hm. A few things were missed.', 'She will do. Just about.', 'Not your best day, is it?'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half of the card is not done!', 'She is still unhappy, and so am I.', 'Ummi would never have handed her back like this.'] } };
  function finishJob() { if (S.held) dropHeld(); const T = C.job.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const done = T.filter(t => info(t).done).length, pay = C.D.price + done * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('oud') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; owner.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: OWN.name, stars, tip, pay, t: 0 }; owner.position.set(Y.spots.talk.x, 0, Y.spots.talk.z); owner.rotation.y = 0.35; S.phase = 'react'; S.phT = 0; S.ptr = null; S.tool = null; treatM.visible = false;
    if (level === 'grumpy') { sfx('fail'); SFX.music.flourish('sad'); } else { sfx(stars === 3 ? 'cheer' : 'coins', { n: 4 }); if (stars === 3) SFX.music.flourish('happy'); } if (stars === 3) { for (let i = 0; i < 10; i++) puff(owner.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), owner.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; if (C) { scene.remove(C.g); C = null; } ownerFox.forEach(f => f.visible = false); ben.visible = true; place(ben, Y.spots.benIntro, -0.5); place(ummi, Y.spots.ummiIntro, 0.5); Y.water.visible = false;
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.camels, save.stat(SAVE.camels, 0) + S.starList.length); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('camelUniform')) { save.setFlag('camelUniform'); setUniform(true); unlock.push('CAMEL PEN UNIFORM (head wrap, sash + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    SFX.music.flourish('day'); sfx('coins', { n: 10, delay: 0.5 }); S.done = { day: S.day, cared: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    say(eod ? 'UMMI: "Employee of the day. Even Qamar approves, and Qamar approves of nobody."' : avg >= 2 ? 'UMMI: "Good day. Same time tomorrow. The camels will be."' : 'UMMI: "Slowly. They can tell when you are in a hurry."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); sfx('coins', { n: 5 }); if (id === 'oud') setOud(); return true; }

  // ---------- camera ----------
  const { SAFE, shotFor } = cameraFit(ST), CAM = { look: V3(0, 1.2, 0) };
  camera.position.set(0, 3, 10); camera.lookAt(CAM.look);
  const box = (p, r, out) => { out.push(V3(p.x - r, p.y - r, p.z), V3(p.x + r, p.y + r, p.z)); return out; };
  const cw = (x, y, z) => C.g.localToWorld(V3(x, y, z));
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; for (const s of [Y.spots.benIntro, Y.spots.ummiIntro]) o.push(V3(s.x - 0.5, 0, s.z), V3(s.x + 0.5, 0, s.z), V3(s.x, 2.4, s.z)); o.push(V3(2.0, 0.9, -1.2), V3(-2.6, 2.6, -1.5)); return o; }, 0.13, Math.PI - 0.22, port ? 0.12 : 0.06);
    if (!C || S.phase === 'arrive' || S.phase === 'leave' || S.phase === 'greet') return shotFor('yard' + k, () => [V3(-7.5, 0, CP.z), V3(3.2, 0, CP.z), V3(-2, 3.0, CP.z), V3(-4.6, 0, 2.4), V3(2.6, 1.6, -1.6)], 0.24, Math.PI - 0.12, 0.05);
    if (S.phase === 'react') { const f = owner.position; return shotFor('react' + k + C.id, () => [V3(f.x - 0.9, 0.3, f.z), V3(f.x + 0.9, 0.3, f.z), V3(f.x, 2.6, f.z), V3(f.x + 1.4, 1.2, f.z)], 0.12, Math.PI - 0.45, 0.1); }
    const T = S.tool, kn = C.kn > 0.5 ? 'k' : 's';
    if (!T || S.phase !== 'work') return shotFor('camel' + k + C.id, () => [cw(-1.15, 0, 0.3), cw(2.15, 2.7, 0), cw(0, 2.65, 0), cw(0.6, 0, 0.5)], 0.14, Math.PI - 0.15, 0.06);
    if (T === 'water') return shotFor('water' + k + C.id, () => { const t = Y.trough, o = [V3(t.x0, 0.85, t.z1), V3(t.x1, 0.0, t.z1), V3(t.x0, 0, t.z0), V3(2.65, 1.6, -1.55), wp(Y.handleTip).add(V3(0, 0.3, 0)), wp(Y.handleTip).add(V3(0, -0.4, 0)), cw(1.3, 2.75, 0), cw(0.4, 1.6, 0.4)]; return o; }, 0.45, Math.PI - 0.25, 0.06);
    if (T === 'feed') return shotFor('feed' + k + C.id, () => [V3(2.4, 0.6, 0.65), V3(5.2, 0.6, 0.65), V3(3.8, 1.15, 0.35), cw(2.05, 2.85, 0), cw(1.2, 2.2, 0.3)], 0.16, Math.PI - 0.12, 0.06);
    if (T === 'brush') { const items = [...C.burrs.filter(b => b.parent), ...C.dust.filter(d => d.parent)]; let list = items; if (port && items.length) { const xs = list.map(it => wp(it).x), x0 = Math.min(...xs); list = list.filter((_, i) => xs[i] < x0 + 1.0); } return shotFor('brush' + k + C.id + ':' + items.length, () => { const o = []; if (!list.length) { o.push(cw(-1, 1.1, 0.45), cw(1, 2.4, 0.45)); return o; } for (const it of list) box(wp(it), port ? 0.42 : 0.5, o); if (o.length < 6) box(wp(list[0]), 0.8, o); return o; }, 0.1, Math.PI - 0.06, 0.06); }
    if (T === 'feet') { const L = curLeg(); if (!L) return shotFor('camel' + k + C.id, () => [cw(-1.15, 0, 0.3), cw(2.15, 2.7, 0), cw(0, 2.65, 0)], 0.14, Math.PI - 0.15, 0.06); const li = C.legs.indexOf(L); return shotFor('feet' + k + C.id + ':' + li, () => { const p = C.g.localToWorld(V3(L.front ? 0.62 : -0.62, 0.68, 0.24 + 0.66)); return [V3(p.x - 0.42, p.y - 0.38, p.z), V3(p.x + 0.42, p.y + 0.42, p.z), V3(p.x, p.y + 0.75, p.z - 0.5)]; }, 0.18, Math.PI - 0.05, 0.08); }
    if (T === 'train') return shotFor('train' + k + C.id + kn, () => [cw(-1.2, 0, 0), cw(3.1, 0, 0.3), cw(2.2, 3.0, 0), cw(0, 2.65, 0), cw(0, 0, 0.6)], 0.12, Math.PI - 0.55, 0.07);
    if (T === 'load') return shotFor('load' + k + C.id, () => { const o = [cw(0, 2.6, 0), cw(0, 0.6, 1.0), cw(0, 0.6, -1.0), cw(1.4, 1.3, 0)]; if (C.bags) C.bags.forEach(b => o.push(b.home.clone(), b.home.clone().add(V3(0, 0.75, 0)))); else o.push(V3(CP.x - 3.1, 0, CP.z - 1.6), V3(CP.x - 3.1, 0.8, CP.z + 1.6)); return o; }, 0.3, -Math.PI / 2 - 0.42, 0.06);
    return shotFor('camel' + k + C.id, () => [cw(-1.15, 0, 0.3), cw(2.15, 2.7, 0), cw(0, 2.65, 0)], 0.14, Math.PI - 0.15, 0.06); }

  // ---------- DEMO: autopilot cares for one dromedary (every job) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, sub: 0 };
  const handAt = (p, j = 0) => { hand.visible = true; hand.position.copy(p).add(V3(j, 0, 0.15)); hand.scale.setScalar(0.6); };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  function demoAct() { if (!C) return 0.5; const T = nextTask();
    if (!T) { DM.cap = 'EVERY JOB DONE: TAP HAND BACK'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handBack(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'JOB ' + (C.job.tasks.indexOf(T) + 1) + ' OF ' + C.job.tasks.length + ': TAP ' + TASKS[T].label + ' AT THE BOTTOM'; DM.key = 'TAP'; hand.visible = false; return 1.5; }
    if (T === 'water') { const w = cap('water', 'SWIPE', 'SWIPE UP AND DOWN TO PUMP. KEEP THE TROUGH IN THE GREEN, NO SPILLS'); if (w) return w; handAt(wp(Y.handleTip)); if (C.water.lvl < 0.62) { DM.sub = (DM.sub || 1) * -1; pumpBy(DM.sub * 70); pumpBy(DM.sub * 40); } return 0.12; }
    if (T === 'feed') { const k = Object.keys(C.job.food).find(q => (C.fed[q] || 0) < C.job.food[q]); if (C.chew > 0.3) return 0.2; if (!S.held) { const w = cap('feed', 'DRAG', 'THE CARD SAYS WHAT SHE EATS. DRAG IT FROM A BIN TO HER MOUTH'); if (w) return w; grabFood(k); handAt(S.held.m.position); return 0.6; } S.held.m.position.copy(wp(C.mouth)); handAt(S.held.m.position); const kk = S.held.k; scene.remove(S.held.m); S.held = null; eat(kk); return 0.9; }
    if (T === 'brush') { const w = cap('brush', 'SWIPE', 'SWIPE OVER THE BURRS AND SAND PATCHES IN HER COAT'); if (w) return w; const b = C.burrs.find(q => q.parent) || C.dust.find(q => q.parent); if (!b) return 0.3; const p = wp(b); DM.sub = (DM.sub || 1) * -1; handAt(p, DM.sub * 0.1); const s = scr(p); brushAt(s.x, s.y, 70); return 0.12; }
    if (T === 'feet') { const L = curLeg(); if (!L) return 0.4; if (L.state === 'thorns') { const th = L.thorns.find(t => !t.userData.out); const w = cap('pull', 'PULL', 'PRESS A THORN AND PULL IT OUT. SLOW AND STEADY, OR SHE SAYS OUCH'); if (w) return w; DM.pt = (DM.pt || 0) + 22; handAt(wp(th)); pullTo(th, DM.pt * scale(), performance.now() - 1000); if (th.userData.out) DM.pt = 0; return 0.1; }
      const w = cap('balm', 'RUB', 'RUB BALM INTO THE PAD IN SMALL CIRCLES'); if (w) return w; DM.ang = (DM.ang || 0) + 0.9; handAt(wp(L.pad), Math.cos(DM.ang) * 0.12); balmAdd(L, 0.9 / (Math.PI * 4)); return 0.08; }
    if (T === 'train') { const Tr = C.tr, cmd = C.job.cmds[Tr.i]; if (Tr.treat > 0) { const w = cap('treat', 'TAP', 'SHE DID IT! TAP HER NOSE TO GIVE HER A DATE'); if (w) return w; handAt(wp(C.nose)); trainTreat(); return 0.8; }
      if (Tr.act) return 0.2; if (Tr.att !== 'on') { const w = cap('wait', 'WAIT', 'WAIT UNTIL SHE LOOKS AT YOU. THE GREEN LIGHT MEANS SHE IS LISTENING', 2.2); if (w) return w; DM.cap = 'WAIT FOR THE GREEN…'; DM.key = 'WAIT'; return 0.15; }
      DM.cap = 'SWIPE ' + CMDS[cmd].arrow + ' FOR ' + CMDS[cmd].word + ' (' + CMDS[cmd].name + ')'; DM.key = CMDS[cmd].arrow; handAt(wp(C.head)); trainSwipe(CMDS[cmd].dir); return 0.6; }
    if (T === 'load') { if (!C.bags) setupLoad(); const b = C.bags.find(q => !q.side); if (!b) return 0.4; const w = cap('load', 'DRAG', 'DRAG EACH SACK ONTO A PACK. THE NUMBER IS ITS WEIGHT: KEEP BOTH SIDES EVEN', 2.4); if (w) return w; handAt(wp(b.m).add(V3(0, 0.4, 0))); hang(b, C.job.sol[b.i]); return 0.9; }
    return 0.5; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.35, hand.scale.x - dt * 0.8));
    if (S.phase === 'arrive' || S.phase === 'greet') { DM.cap = 'OWNERS LEAD THEIR CAMELS IN THROUGH THE GATE'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE OWNER CHECKS YOUR WORK. CAREFUL JOBS EARN STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk')) return; audio.init && audio.init(); wake(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.pt = 0; DM.cap = "WATCH A CAMEL'S CARE AT UMMI'S PEN"; DM.key = ''; S.done = null; S.dlg = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 3; S.forceType = 'drom'; startDay(); S.forceType = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; hand.visible = false; S.ptr = null; S.held && dropHeld(); S.react = null; S.flash = null; S.day = DM.day0; if (C) { if (C.bags) C.bags.forEach(b => b.m.parent && b.m.parent.remove(b.m)); scene.remove(C.g); C = null; } ownerFox.forEach(f => f.visible = false); Object.assign(S, { phase: 'intro', done: null, camN: 0, earned: 0, tips: 0, starList: [], tool: null }); treatM.visible = false; attRing.visible = false; setUniform(true); ben.visible = true; place(ben, Y.spots.benIntro, -0.5); place(ummi, Y.spots.ummiIntro, 0.5); Y.water.visible = false; }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !C) return null; const T = S.tool, H = (p, text, tool = T, v = true, r = 0.22) => ({ p, text, tool, r, v });
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : { text: 'ALL DONE · TAP HAND BACK', tool: 'hand' }; }
    if (locked(T)) return { text: 'BRUSH HER FIRST · TAP BRUSH BELOW', tool: 'brush' };
    if (T === 'water') { const w = C.water; return H(wp(Y.handleTip), w.lvl > 0.85 ? 'NEARLY FULL · LET HER DRINK' : w.lvl < 0.3 ? 'SWIPE UP AND DOWN TO PUMP' : 'GOOD · KEEP IT IN THE GREEN', T, true); }
    if (T === 'feed') { const k = Object.keys(C.job.food).find(q => (C.fed[q] || 0) < C.job.food[q]); if (S.held) return H(wp(C.mouth), 'DROP IT ON HER MOUTH'); return k ? H(wp(Y.bins[k]).add(V3(0, 0.3, 0)), 'DRAG ' + FOODS[k].name + ' TO HER MOUTH · ' + (C.fed[k] || 0) + ' / ' + C.job.food[k], T, false, 0.36) : null; }
    if (T === 'brush') { const b = C.burrs.find(q => q.parent) || C.dust.find(q => q.parent); return b ? H(wp(b), 'SWIPE THE BURRS AND SAND OUT · ' + info(T).txt) : null; }
    if (T === 'feet') { const L = curLeg(); if (!L) return null; if (L.state === 'thorns') { const th = L.thorns.find(t => !t.userData.out); return H(wp(th), 'PRESS THE THORN AND PULL IT OUT · SLOWLY'); } return H(wp(L.pad), 'RUB BALM IN CIRCLES · ' + Math.round(L.balm * 100) + '%'); }
    if (T === 'train') { const Tr = C.tr, cmd = C.job.cmds[Tr.i]; if (Tr.treat > 0) return H(wp(C.nose), 'TAP HER NOSE · GIVE HER THE DATE'); if (Tr.act) return { text: 'GOOD…', tool: T }; return { text: Tr.att === 'on' ? 'SHE IS LISTENING · SWIPE ' + CMDS[cmd].arrow + ' NOW' : 'WAIT FOR HER TO LOOK AT YOU', tool: T }; }
    if (T === 'load') { if (!C.bags) return null; const b = C.bags.find(q => !q.side); if (S.held) return { text: 'DROP IT ON THE LEFT OR RIGHT PACK', tool: T }; return b ? H(wp(b.m), 'DRAG A SACK ONTO A PACK · KEEP IT LEVEL', T, false, 0.4) : { text: bal() ? 'TILTED · TAP A SACK TO TAKE IT OFF' : 'LEVEL', tool: T }; }
    return null; }
  let HINT = null, hintT = 0;

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  function step(dt) { const t = clock.elapsedTime; S.phT += dt;
    if (S.audioOn) { SFX.music.mood(S.phase === 'walk' ? 'walk' : S.phase === 'intro' || S.phase === 'done' ? 'intro' : 'work'); SFX.tick(dt); SFX.water(S.streamT > 0 ? 1 : 0); }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; S.toastT -= dt; if (S.toastT <= 0) S.toast = null; S.spit = Math.max(0, S.spit - dt);
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    for (let i = S.fly.length - 1; i >= 0; i--) { const f = S.fly[i]; f.life -= dt; f.v.y -= (f.g || 9) * dt; f.m.position.addScaledVector(f.v, dt); if (f.spin) f.m.rotation.z += f.spin * dt; if (f.grow) f.m.scale.multiplyScalar(1 + f.grow * dt); if (f.life <= 0) { scene.remove(f.m); S.fly.splice(i, 1); } }
    Y.lamps.forEach((l, i) => l.material.color.setHSL(0.11, 1, 0.72 + Math.sin(t * 7 + i * 2) * 0.04)); Y.anim(dt, t); for (const pm of Y.palms) pm.visible = Math.hypot(camera.position.x - pm.position.x, camera.position.z - pm.position.z) > 4.5; { const close = S.phase === 'work' || S.phase === 'react', cp = camera.position; Y.buntingLines.forEach(b => { b.visible = !close; if (!close) b.children.forEach(c => c.visible = c.position.distanceTo(cp) > 4.2); }); }
    // residents
    RES.forEach(R => { const Cm = R.C; if (R.callT > 0) { R.callT -= dt; if (S.phase === 'walk') lookToward(Cm, ben.position.x, ben.position.z); } else { Cm.turnT = Math.sin(t * 0.3 + Cm.id) * 0.5; Cm.earsT = 0.3; } Cm.hdT = R.callT > 0 ? 0 : (Math.sin(t * 0.21 + Cm.id * 2) > 0.6 ? 0.55 : 0); if (Math.random() < dt * 0.15) Cm.chew = 2; camelPose(Cm, dt); });
    // the work camel
    if (C) { const g = C.g;
      if (S.phase === 'arrive') { g.position.x = Math.min(CP.x, g.position.x + dt * 2.3); C.walkAmt = damp(C.walkAmt, g.position.x < CP.x - 0.05 ? 1 : 0, 6, dt); owner.position.set(g.position.x + 2.3 * C.D.k, 0, CP.z + 1.05); owner.rotation.y = Math.PI / 2; kit.animFox(owner, dt, 2.3);
        if (g.position.x >= CP.x) { S.phase = 'greet'; S.phT = 0; say(OWN.name + ': "' + OWN.line + '"', 4.5); sfx('groan', { pan: camPan(), vol: 0.7 }); } }
      else if (S.phase === 'greet') { C.walkAmt = damp(C.walkAmt, 0, 6, dt); const k = smooth(0, 1, Math.min(1, S.phT / 1.6)), a = V3(CP.x + 2.3 * C.D.k, 0, CP.z + 1.05), b = V3(Y.spots.owner.x, 0, Y.spots.owner.z); owner.position.lerpVectors(a, b, k); faceTo(owner, k < 0.95 ? b.x : 0, k < 0.95 ? b.z : CP.z); kit.animFox(owner, dt, k < 1 ? 3 : 0); if (S.phT > 1.7) { S.phase = 'work'; S.tool = C.job.tasks[0]; sfx('tap'); if (S.tool === 'load' && !locked('load')) setupLoad(); } }
      else if (S.phase === 'work') { faceTo(owner, CP.x, CP.z); kit.animFox(owner, dt, 0); }
      else if (S.phase === 'react') { if (S.react) S.react.t += dt; kit.animFox(owner, dt, 0); if (S.phT > 2.8) { S.react = null; S.phase = 'leave'; S.phT = 0; C.tr.kneel = false; } }
      else if (S.phase === 'leave') { const turn = Math.min(1, S.phT / 1.0); g.rotation.y = Math.PI * smooth(0, 1, turn); C.walkAmt = damp(C.walkAmt, 1, 4, dt); if (turn >= 1) g.position.x -= dt * 2.4; owner.position.set(g.position.x - 2.3 * C.D.k, 0, CP.z + (turn >= 1 ? 1.05 : 1.05)); owner.rotation.y = -Math.PI / 2; kit.animFox(owner, dt, turn >= 1 ? 2.4 : 0);
        if (g.position.x < Y.spots.gate.x) { if (C.bags) C.bags.forEach(b => b.m.parent && b.m.parent.remove(b.m)); if (DM.on) { demoStop(); return; } S.camN++; if (S.camN >= PEN.perDay) endDay(); else nextCamel(); } }
      if (C) { const work = S.phase === 'work', T = work ? S.tool : null, Tr = C.tr;
        // pose targets by tool
        C.knT = T === 'load' && C.bags ? 1 : T === 'train' ? (Tr.kneel ? 1 : 0) : S.phase === 'leave' || S.phase === 'arrive' ? 0 : C.knT && !work ? 0 : 0;
        if (S.phase === 'react' && C.bags && C.bags.length) C.knT = 0;
        const L = curLeg(), li = L ? C.legs.indexOf(L) : -1; for (let i = 0; i < 4; i++) C.liftT[i] = T === 'feet' && i === li && L.state !== 'done' ? 1 : 0;
        C.earsT = T === 'train' && Tr.att === 'on' ? 1 : C.happy > 0 ? 0.8 : 0.3;
        let hd = 0; if (T === 'feed') hd = 0.18; const drink = T === 'water' && C.water.lvl > 0.04 && C.water.thirst > 0; if (drink) { hd = 1; C.water.thirst = Math.max(0, C.water.thirst - dt * 0.16); C.water.lvl = Math.max(0, C.water.lvl - dt * 0.2); C.gulpT = (C.gulpT || 0) - dt; if (C.gulpT <= 0) { C.gulpT = rr(0.45, 0.65); sfx('gulp', { pan: panOf(wp(C.head)) }); const m = wp(C.mouth); Y.ripple(m.x, m.z, Y.water.position.y); } if (C.water.thirst <= 0) { checkDone(); say('UMMI: "That is a camel who has had enough. You can tell by the sigh."', 3.5); } }
        else if (T === 'water' && C.water.thirst > 0 && C.water.lvl <= 0.04) hd = 0.5;
        C.hdT = hd; if (T !== 'train' && T !== 'feet') C.turnT = T === 'water' || T === 'feed' ? 0 : Math.sin(t * 0.4) * 0.2;
        // train: attention cycle
        attRing.visible = false; treatM.visible = false;
        if (T === 'train' && Tr.i < C.job.cmds.length) {
          if (Tr.act) { Tr.act.t += dt; const cm = Tr.act.cmd, dur = cm === 'walk' ? 2.6 : 1.5; if (cm === 'walk') { const k = Math.min(1, Tr.act.t / dur); g.position.x = CP.x + Math.sin(k * Math.PI) * 1.3 * C.D.k; C.walkAmt = damp(C.walkAmt, k < 0.95 ? 1 : 0, 6, dt); } C.turnT = 0; if (Tr.act.t >= dur) { Tr.act = null; Tr.treat = 2.8; Tr.att = 'treat'; g.position.x = CP.x; } }
          else if (Tr.treat > 0) { Tr.treat -= dt; lookToward(C, camera.position.x, camera.position.z); treatM.visible = true; const n = wp(C.nose), toCam = camera.position.clone().sub(n).normalize(); treatM.position.copy(n).addScaledVector(toCam, 0.45).add(V3(0, Math.sin(t * 6) * 0.04 - 0.1, 0)); if (Tr.treat <= 0) { Tr.i++; Tr.att = 'away'; Tr.t = 1.0; flash('NO DATE? SHE NOTICED.', '#e6b45a', 1.4); sfx('snort', { pan: camPan() }); checkDone(); } }
          else { Tr.t -= dt; if (Tr.t <= 0) { if (Tr.att === 'on') { Tr.att = 'away'; Tr.t = rr(1.0, 2.0); Tr.side = Math.random() < 0.5 ? -1 : 1; } else { Tr.att = 'on'; Tr.t = upg('dates') ? 2.0 : 1.4; sfx('ding', { pan: camPan() }); } }
            if (Tr.att === 'on') { lookToward(C, camera.position.x, camera.position.z); attRing.visible = true; const h = wp(C.head); attRing.position.set(h.x, h.y + 0.55 * C.D.k, h.z); attRing.scale.setScalar(0.5 + Math.sin(t * 10) * 0.06); } else { lookToward(C, camera.position.x, camera.position.z); C.turnT = -C.turnT * 0.9 + Math.sin(t * 0.9) * 0.15; C.earsT = 0.1; } } }
        else if (T === 'train') { lookToward(C, camera.position.x, camera.position.z); }
        if (T === 'feet' || (T === 'brush' && S.ptr)) { if (T === 'feet') lookToward(C, camera.position.x, camera.position.z); }
        if (S.phase === 'work' && T !== 'train') g.position.x = damp(g.position.x, CP.x, 6, dt);
        if (S.phase !== 'arrive' && S.phase !== 'leave' && !(Tr.act && Tr.act.cmd === 'walk')) C.walkAmt = damp(C.walkAmt, 0, 6, dt);
        if (T !== 'load' && !(C.bags && C.bags.some(b => b.side))) C.tiltT = 0;
        camelPose(C, dt); if (C.walkAmt > 0.4) { const k = Math.floor(C.walkPh / Math.PI); if (k !== C.stepK) sfx('camelStep', { pan: camPan(), vol: 0.9 }); C.stepK = k; }
        // bags flying home
        if (C.bags) for (const b of C.bags) { if (b.fly) { b.fly.t = Math.min(1, b.fly.t + dt * 3); b.m.position.lerpVectors(b.fly.from, b.fly.to, smooth(0, 1, b.fly.t)); b.m.position.y += Math.sin(b.fly.t * Math.PI) * 0.6; if (b.fly.t >= 1) b.fly = null; } }
        // trough + stream
        const lv = C.water.lvl; Y.water.visible = lv > 0.01; Y.water.position.y = 0.2 + lv * 0.5; }
    }
    S.streamT = Math.max(0, S.streamT - dt); Y.stream.visible = S.streamT > 0; Y.handle.rotation.z = damp(Y.handle.rotation.z, S.handleA, 18, dt);
    if (!S.ptr || S.ptr.kind !== 'pump') S.handleA = damp(S.handleA, 0, 1.5, dt);
    // cast animation
    if (S.phase === 'walk') walkStep(dt);
    else { const greet = S.phase === 'intro' || S.phase === 'done'; kit.animFox(ben, dt, 0); ben.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32);
      if (S.phase === 'work' || S.phase === 'greet' || S.phase === 'arrive' || S.phase === 'react' || S.phase === 'leave') { if (C) faceTo(ummi, wp(C.head).x, wp(C.head).z); } else faceTo(ummi, ben.position.x, ben.position.z + 0.6);
      const sh = shot(); camera.position.lerp(sh.pos, Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2))); CAM.look.lerp(sh.look, Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2))); camera.lookAt(CAM.look); }
    kit.animFox(ummi, dt, 0); ummi.userData.talking = ummi.userData.talking && !!S.dlg;
    if (musician && musician.visible) { kit.animFox(musician, dt, 0); const P = musician.userData.P; P.legs.forEach(l => l.rotation.x = -1.4); if (P.arms) { P.arms[1].rotation.set(-1.1 + Math.sin(t * 16) * 0.12, 0, 0.5); P.arms[0].rotation.set(-1.5, 0, -0.6); } musician.userData.mood = 'happy'; }
    // hide walls between the camera and the room; front wall + palms when close
    for (const w of Y.walls) { const cpos = camera.position; w.m.visible = !(w.side === 'L' && cpos.x < -9.2) && !(w.side === 'R' && cpos.x > 9.2) && !(w.side === 'B' && cpos.z < -7.8); }
    { const out = camera.position.z > 5.4, cp = camera.position; Y.front.forEach(m => m.visible = !out && Math.hypot(cp.x - m.position.x, cp.z - m.position.z) > 3.2); }
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt); const vr = vis && vis.v ? Math.PI / 2 : 0; RINGS.pulse.rotation.x = RINGS.pulse2.rotation.x = vr; if (vis && vis.v) { const toC = camera.position.clone().sub(vis.p).normalize().multiplyScalar(0.06); RINGS.pulse.position.add(toC); RINGS.pulse2.position.add(toC); RINGS.pulse.lookAt(camera.position); RINGS.pulse2.lookAt(camera.position); RINGS.pulse.rotateX(Math.PI / 2); RINGS.pulse2.rotateX(Math.PI / 2); RINGS.pulse.scale.multiplyScalar(0.35); RINGS.pulse2.scale.multiplyScalar(0.35); RINGS.arrow.visible = false; }
  }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function quest() { if (S.phase === 'walk') return save.flag('camelUniform') ? "UMMI'S CAMEL PEN · TALK TO UMMI FOR A DAY'S WORK" : 'TALK TO UMMI REYHAN · SHE NEEDS A HAND WITH THE CAMELS'; if (!C || !C.job) return "UMMI'S CAMEL PEN · DAY " + S.day; return 'CAMEL ' + Math.min(S.camN + 1, PEN.perDay) + ' / ' + PEN.perDay + ' · ' + C.job.name + (S.tool ? ' · ' + TASKS[S.tool].label : ''); }
  function hud() { const J = C && C.job, Tr = C && C.tr;
    return { phase: S.phase, day: S.day, camN: S.camN, perDay: PEN.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, quest: quest(),
      job: J ? { owner: OWN.name, role: OWN.role, camel: C.D.name, name: J.name, food: Object.entries(J.food).map(([k, n]) => ({ k, name: FOODS[k].name, n, got: Math.min(n, C.fed[k] || 0), col: FOODS[k].col })), cmds: J.cmds.map((c, i) => ({ arrow: CMDS[c].arrow, word: CMDS[c].word, done: Tr.i > i, now: Tr.i === i })), bags: J.bags.length, feet: J.feet.length,
        tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: locked(id) ? 'BRUSH FIRST' : I.txt, locked: locked(id) }; }) } : null,
      tool: S.tool, allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      water: C && S.phase === 'work' && S.tool === 'water' ? { lvl: C.water.lvl, thirst: C.water.th0 ? C.water.thirst / C.water.th0 : 0, spill: S.spillT && performance.now() - S.spillT < 900 } : null,
      load: C && S.phase === 'work' && S.tool === 'load' && C.bags ? { far: C.bags.filter(b => b.side < 0).reduce((s, b) => s + b.w, 0), near: C.bags.filter(b => b.side > 0).reduce((s, b) => s + b.w, 0), left: C.bags.filter(b => !b.side).length, bal: bal() } : null,
      train: C && S.phase === 'work' && S.tool === 'train' && Tr.i < J.cmds.length ? { arrow: CMDS[J.cmds[Tr.i]].arrow, word: CMDS[J.cmds[Tr.i]].word, name: CMDS[J.cmds[Tr.i]].name, att: Tr.act ? 'busy' : Tr.treat > 0 ? 'treat' : Tr.att, step: Tr.i + 1, of: J.cmds.length } : null,
      spit: S.spit, flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('camelUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      prompt: promptTxt(), dialog: dialogHud(), toast: S.toast, camels: save.stat(SAVE.camels, 0), muted: SFX.muted }; }
  frame();
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } }, setTool, handBack, startDay, demoStart, demoStop, buyUpgrade, hud, toIntro, toWalk,
    // ENGINE CONTRACT for the shared Game HUD (walk mode)
    start() {}, talk, choose, closeDialog, nextLine, clearToast() { S.toast = null; },
    melee() { if (S.phase === 'walk' && !S.dlg) pat(); }, range() { if (S.phase === 'walk' && !S.dlg) whistle(); }, jump() { if (S.phase === 'walk' && !S.dlg) { ben.userData.hop = 1; sfx('whoosh'); setTimeout(() => sfx('step', { vol: 1.4 }), 420); } }, meleeUp() {},
    useItem() { toast('NO ITEMS NEEDED IN THE PEN'); }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; }, setHudPad() {}, setStick(x, y) { S.stick.x = x; S.stick.y = y; },
    eyeLook(dx, dy) { lookBy(dx, dy); }, eyeRelease() {}, togglePov() { return false; }, lookBy, zoomBy(d) { W.dist = clamp(W.dist * (1 + d), 4, 13); }, getCam() { return { dist: W.dist, pitch: W.pitch }; }, setCam(dist, pitch) { if (dist) W.dist = clamp(dist, 4, 13); if (pitch != null) W.pitch = clamp(pitch, 0.12, 1.15); },
    mapData() { return { p: [ben.position.x, ben.position.z, ben.rotation.y], b: [['TROUGH', 1.5, -0.9], ['GATE', -9.2, -0.8], ['STALLS', 6.2, -5.9], ["UMMI'S CORNER", -5.6, -5.6], ['FEED', 1.0, 1.3]], f: [[ummi.position.x, ummi.position.z]], e: [], q: [ummi.position.x, ummi.position.z, 'UMMI REYHAN'] }; },
    setMinimap() {}, toggleSound() { wake(); SFX.setMuted(!SFX.muted); return !SFX.muted; }, cycleWeather() {},
    // test hooks
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _force(t) { S.forceType = t; }, _state: () => S, _camel: () => C, _scr: scr, _wp: wp, _ben: ben, _ummi: ummi, _Y: Y, _info: info, _safe: () => ({ ...SAFE }),
    _auto() { return { water() { C.water.thirst = 0; checkDone(); }, feed() { for (const k in C.job.food) C.fed[k] = C.job.food[k]; checkDone(); }, brush() { C.burrs.forEach(b => b.parent && b.parent.remove(b)); C.dust.forEach(d => d.parent && d.parent.remove(d)); checkDone(); }, feet() { C.job.feet.forEach(i => { const L = C.legs[i]; L.thorns.forEach(t => { t.userData.out = true; t.parent && t.parent.remove(t); }); L.state = 'done'; L.balm = 1; }); checkDone(); }, train() { C.tr.i = C.job.cmds.length; C.tr.fed = C.tr.i; C.tr.kneel = false; checkDone(); }, load() { if (!C.bags) setupLoad(); C.bags.forEach(b => hang(b, C.job.sol[b.i])); } }; },
    destroy() { SFX.destroy(); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  setOud(); toIntro(); onState(hud());
  return api;
}
