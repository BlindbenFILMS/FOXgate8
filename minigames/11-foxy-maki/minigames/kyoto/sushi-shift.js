// 8 GATES — KYOTO (Gaya) · FOXY MAKI: THE SHIFT [kyotoMerchant]. Ben works the chef's ring-shaped SUSHI BAR under four lanterns (NOW HIRING; the shift pays for the room off the south court).
// Built on the Foxy Blends / Luxor Deli / Meru Burgers engine + engine/restaurant-kit.js. Steps follow the original 2D game FOXY MAKI (base64 inside the Gaya world file, opened by the chef's "sushi:kSushi" act):
//   SLICE the fish (swipe) → NORI on the mat → RICE (rub it across, stop at JUST RIGHT) → FILLINGS (tap) → ROLL (swipe up) → CUT 5 times = 6 pieces → PLATE: ginger + wasabi (tap) → SOY (hold, stop at the line) → SERVE → PAY.
//   NIGIRI (day 2+): tap the rice tub on an empty mat, PRESS 3 TIMES ("three moves and stop — four moves and it is a ball of rice with a fish on it"), lay the sliced fish on top.
// Stations: FISH (ice tray + cutting board) · ROLL (nori, rice tub, bamboo mat, filling bins) · PLATE (geta, ginger, wasabi, soy) · SERVE (the pass + diners round the ring + register). Save keys kyoto.sushi.*, flags sushiUniform, kyoto.sushiShift.
// MERGE: buildSushiBar(ctx) builds the interior at an origin (10 x 11 m, ring bar centred); createSushiShift({ container }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { PLAYER_FEMALE } from '../../fox-kit.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { sushiAudio } from './sushi-audio.js';

export const MAKI = { name: 'FOXY MAKI · THE SHIFT', room: 'kyotoMerchant', shift: 180 };
export const FISH = { tuna: { name: 'TUNA', col: '#d23a48', dark: '#9a2432', fat: '#f08a94' }, salmon: { name: 'SALMON', col: '#f08a4b', dark: '#c4612a', fat: '#fde0c8' }, yellowtail: { name: 'YELLOWTAIL', col: '#f4dcc0', dark: '#d9a46a', fat: '#fff6ea' } };
export const FILLS = { cucumber: { name: 'CUCUMBER', col: '#4f8a2a', core: '#cfe8a8' }, avocado: { name: 'AVOCADO', col: '#9cc95a', core: '#e3f0b0' }, tamago: { name: 'TAMAGO', col: '#f6d04a', core: '#f6d04a' }, crab: { name: 'CRAB', col: '#f6f1ea', core: '#e2453f' } };
const FK = Object.keys(FISH), BK = Object.keys(FILLS), ING = k => FISH[k] || FILLS[k];
export const RECIPES = [
  { id: 'kappa', name: 'KAPPA MAKI', kind: 'maki', day: 1, fill: ['cucumber'], price: 4 },
  { id: 'tunaCuke', name: 'TUNA CUCUMBER', kind: 'maki', day: 1, fill: ['tuna', 'cucumber'], price: 5 },
  { id: 'salmonAvo', name: 'SALMON AVOCADO', kind: 'maki', day: 1, fill: ['salmon', 'avocado', 'cucumber'], price: 6 },
  { id: 'nTuna', name: 'TUNA NIGIRI', kind: 'nigiri', day: 2, fish: 'tuna', price: 5 },
  { id: 'nSalmon', name: 'SALMON NIGIRI', kind: 'nigiri', day: 2, fish: 'salmon', price: 5 },
  { id: 'tunaTamago', name: 'TUNA TAMAGO', kind: 'maki', day: 3, fill: ['tuna', 'tamago', 'cucumber'], price: 7 },
  { id: 'nYellow', name: 'YELLOWTAIL NIGIRI', kind: 'nigiri', day: 3, fish: 'yellowtail', price: 6 },
  { id: 'california', name: 'CALIFORNIA', kind: 'maki', day: 4, fill: ['crab', 'avocado', 'cucumber', 'tamago'], price: 8 },
  { id: 'rainbow', name: 'FOX RAINBOW', kind: 'maki', day: 5, fill: ['tuna', 'salmon', 'yellowtail', 'avocado'], price: 11 }];
export const UPGRADES = [
  { id: 'sharp', name: 'SHARP YANAGIBA', cost: 40, line: 'Fish slices in 2 swipes, not 3.' },
  { id: 'paddle', name: 'WIDE RICE PADDLE', cost: 30, line: 'Rice spreads 50% faster.' },
  { id: 'mat', name: 'MASTER MAKISU', cost: 35, line: 'Rolls close in 2 pushes, not 3.' },
  { id: 'fridge', name: 'BIG FISH FRIDGE', cost: 50, line: 'Fish trays hold 10 blocks, not 6.' },
  { id: 'radio', name: 'KOTO RADIO', cost: 60, line: 'Happy diners wait 20% longer.' }];
// the five diners of the 2D Sushi Bar (kSeatS1-5, their own lines) + Kyoto townsfolk
const CUSTOMERS = [
  { name: 'CARPENTER', role: 'North gate', torso: ['#7a5a86', '#3d3448', '#c9a227'], outfit: 'robe', line: 'The rice. Everybody says the fish. It is the rice.' },
  { name: 'MINISTRY CLERK', role: 'Ministry', torso: ['#5a7a86', '#3d3448', '#c9a227'], outfit: 'robe', fur: '#e6e4de', furDark: '#a8a6a0', line: 'Do not ask us. We are not speaking.' },
  { name: 'TRAVELLER', role: 'Mountain road', torso: ['#86765a', '#3d3448', '#c9a227'], outfit: 'dress', female: true, line: 'Nine miles for this and I would do it again.' },
  { name: 'SAMURAI', role: 'Off duty', torso: ['#4e5a7a', '#3d3448', '#c9a227'], outfit: 'robe', fur: '#9a6f4a', furDark: '#6b4a2c', line: 'He puts it down in front of you before you know you wanted it.' },
  { name: 'SMALL BOY', role: 'Townsfolk', torso: ['#7a5a5a', '#3d3448', '#c9a227'], outfit: 'vest', small: true, line: 'I am ALLOWED to sit here.' },
  { name: 'SUZU', role: 'Teahouse', torso: ['#c0392b', '#f6c7d8', '#2f4f7a'], outfit: 'dress', female: true, fur: '#f0dcbe', furDark: '#c2a577' },
  { name: 'TEA MASTER', role: 'Teahouse', torso: ['#3f5244', '#e8ddc6', '#b8863a'], outfit: 'robe', elder: true },
  { name: 'LANDLADY', role: 'Apartment', torso: ['#3f4a5a', '#e8ddc6', '#2f5d8a'], outfit: 'dress', female: true, fur: '#dedcd6', furDark: '#a8a6a0' },
  { name: 'HIRO', role: 'Apartment', torso: ['#2f5d8a', '#e8ddc6', '#1f3350'], outfit: 'vest' },
  { name: 'PILGRIM', role: 'Mountain road', torso: ['#b8863a', '#f2e6cd', '#5e3a1e'], outfit: 'robe', fur: '#c9682a', furDark: '#8a4213' }];
const LINES = { order: ['Whatever the chef says is good today.', 'I have been thinking about this all afternoon.', 'Not too much wasabi. Actually, some wasabi.', 'Is the rice warm? Good.', 'For the counter, please.'], angry: ['The rice has gone cold waiting.', 'I will eat noodles instead.'] };
const SAVE = { day: 'kyoto.sushi.day', best: 'kyoto.sushi.best', upg: 'kyoto.sushi.upg.', stars: 'kyoto.sushi.stars' };
const RICE = [0.7, 1.0], SOY = [0.6, 0.85], CUTS_N = 5, SHAPE_N = 3;
const RECIPE = id => RECIPES.find(r => r.id === id);
const fillsOf = r => r.kind === 'nigiri' ? [r.fish] : r.fill;

// ---------------- food art ----------------
function fishBlock(T3, toon, k, outline) { const g = new T3.Group(), F = FISH[k]; const b = new T3.Mesh(new T3.BoxGeometry(0.17, 0.07, 0.1), toon(F.col)); b.position.y = 0.035; b.castShadow = true; if (outline) outline(b, 0.006); g.add(b);
  for (let i = 0; i < 4; i++) { const l = new T3.Mesh(new T3.BoxGeometry(0.006, 0.072, 0.102), toon(F.fat)); l.position.set(-0.06 + i * 0.04, 0.035, 0); l.rotation.y = 0.5; g.add(l); } return g; }
function fishSlab(T3, toon, k, outline) { const F = FISH[k], m = new T3.Mesh(new T3.BoxGeometry(0.11, 0.012, 0.05), toon(F.col)); m.castShadow = true; if (outline) outline(m, 0.004); const l = new T3.Mesh(new T3.BoxGeometry(0.004, 0.013, 0.051), toon(F.fat)); l.position.x = 0.02; l.rotation.y = 0.4; m.add(l); const l2 = l.clone(); l2.position.x = -0.025; m.add(l2); return m; }
function fillStrip(T3, toon, k) { const F = ING(k), L = 0.36; let m;
  if (k === 'cucumber') m = new T3.Mesh(new T3.BoxGeometry(L, 0.018, 0.018), toon(F.col));
  else if (k === 'avocado') m = new T3.Mesh(new T3.BoxGeometry(L, 0.016, 0.03), toon(F.col));
  else if (k === 'tamago') m = new T3.Mesh(new T3.BoxGeometry(L, 0.022, 0.022), toon(F.col));
  else if (k === 'crab') { m = new T3.Mesh(new T3.BoxGeometry(L, 0.018, 0.022), toon(F.col)); const t = new T3.Mesh(new T3.BoxGeometry(L, 0.006, 0.022), toon('#e2453f')); t.position.y = 0.011; m.add(t); }
  else m = new T3.Mesh(new T3.BoxGeometry(L, 0.02, 0.026), toon(F.col));
  return m; }
// one cut maki piece standing on its end: nori wall, rice face, filling dots in the middle
function makiPiece(T3, toon, fills, outline) { const g = new T3.Group(); const w = new T3.Mesh(new T3.CylinderGeometry(0.048, 0.048, 0.058, 18), toon('#1d2a22')); w.position.y = 0.029; w.castShadow = true; if (outline) outline(w, 0.004, 0.048); g.add(w);
  const face = new T3.Mesh(new T3.CircleGeometry(0.043, 18), toon('#f7f4ec')); face.rotation.x = -Math.PI / 2; face.position.y = 0.0585; g.add(face);
  const n = fills.length; fills.forEach((k, i) => { const a = i / Math.max(1, n) * Math.PI * 2, rad = n > 1 ? 0.014 : 0, d = new T3.Mesh(new T3.CircleGeometry(n > 2 ? 0.011 : 0.014, 10), toon(ING(k).core || ING(k).col)); d.rotation.x = -Math.PI / 2; d.position.set(Math.cos(a) * rad, 0.059, Math.sin(a) * rad); g.add(d); });
  return g; }
function nigiriPiece(T3, toon, k, outline, squash = 0) { const g = new T3.Group(); const r = new T3.Mesh(new T3.SphereGeometry(0.045, 14, 10), toon('#f7f4ec')); r.scale.set(1.35, 0.6 - squash * 0.2, 0.85 + squash * 0.25); r.position.y = 0.026; r.castShadow = true; if (outline) outline(r, 0.004, 0.045); g.add(r);
  if (k) { const f = fishSlab(T3, toon, k, outline); f.position.y = 0.054; f.rotation.z = 0.04; g.add(f); } return g; }
function gingerArt(T3, toon) { const g = new T3.Group(); for (let i = 0; i < 4; i++) { const p = new T3.Mesh(new T3.SphereGeometry(0.03, 8, 5), toon('#f4b2b0')); p.scale.set(1, 0.22, 0.7); p.position.set(Math.cos(i * 1.6) * 0.012, 0.012 + i * 0.006, Math.sin(i * 1.6) * 0.012); p.rotation.y = i; g.add(p); } return g; }
function wasabiArt(T3, toon) { const g = new T3.Group(); const m = new T3.Mesh(new T3.SphereGeometry(0.03, 10, 8), toon('#8fbf3a')); m.scale.set(1, 0.7, 0.8); m.position.y = 0.014; g.add(m); const t = new T3.Mesh(new T3.ConeGeometry(0.014, 0.025, 8), toon('#9fcf4a')); t.position.y = 0.034; g.add(t); return g; }

// ---------------- the sushi bar interior ----------------
export function buildSushiBar(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 10, D = 11, H = 4.2, lac = toon('#c0392b'), lacD = toon('#8a2a20'), hinoki = toon('#e6cb9a'), wood = toon('#b8945f'), woodD = toon('#5e3f2a'), ink = toon('#201e1d'), indigo = toon('#2f4f7a'), cream = toon('#f2e6cd'), white = toon('#fbf8ec'), chrome = toon('#d7dde3');
  // floor: warm planks + a tatami runner round the ring
  const floorT = CTX(256, 256, c => { c.fillStyle = '#8a6a48'; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 8; y++) { c.fillStyle = y % 2 ? '#7f6040' : '#94724e'; c.fillRect(0, y * 32, 256, 31); c.fillStyle = '#6b4f34'; c.fillRect(((y * 97) % 256), y * 32, 3, 31); c.fillRect(((y * 97 + 128) % 256), y * 32, 3, 31); } }); floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2, D / 2);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  { const tt = CTX(128, 128, c => { c.fillStyle = '#d8cf9a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#c4ba84'; c.lineWidth = 2; for (let x = 0; x < 128; x += 6) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 128); c.stroke(); } }); tt.wrapS = tt.wrapT = T3.RepeatWrapping; tt.repeat.set(10, 1);
    const tat = new T3.Mesh(new T3.RingGeometry(3.05, 3.75, 64, 1), new T3.MeshToonMaterial({ map: tt, gradientMap: ctx.grad })); tat.rotation.x = -Math.PI / 2; tat.position.y = 0.004; tat.receiveShadow = true; root.add(tat);
    const edge = new T3.Mesh(new T3.RingGeometry(3.72, 3.78, 64, 1), toon('#2f4f7a')); edge.rotation.x = -Math.PI / 2; edge.position.y = 0.006; root.add(edge); }
  const wallT = CTX(256, 256, c => { c.fillStyle = '#f2e6cd'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#5e3f2a'; c.fillRect(0, 0, 256, 10); c.fillRect(0, 150, 256, 8); for (let x = 0; x < 256; x += 128) c.fillRect(x, 0, 10, 256); c.fillStyle = '#c0392b'; c.fillRect(0, 158, 256, 98); c.fillStyle = '#8a2a20'; for (let x = 0; x < 256; x += 32) c.fillRect(x, 158, 3, 98); }); wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1);
  const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad });
  const cut = []; for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); if (!ry) cut.push(m); }
  { const fw = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); fw.position.set(0, H / 2, D / 2); fw.rotation.y = Math.PI; root.add(fw); }
  cut.push(M(new T3.BoxGeometry(W, 0.2, D), toon('#5e3f2a'), 0, H + 0.1, 0, root, 0));
  for (const x of [-3, 0, 3]) cut.push(M(new T3.BoxGeometry(0.22, 0.22, D), woodD, x, H - 0.12, 0, root, 0));
  // FRONT wall (beyond the diners in the work view): noren doorway, NOW HIRING, menu plaques
  const front = [], booths = []; { const fc = root.children.length;
    const norenT = CTX(256, 192, c => { c.fillStyle = '#2f4f7a'; c.fillRect(0, 0, 256, 192); c.fillStyle = '#f7f4ec'; c.beginPath(); c.arc(128, 86, 44, 0, 7); c.fill(); c.fillStyle = '#2f4f7a'; c.beginPath(); c.moveTo(98, 78); c.lineTo(110, 50); c.lineTo(122, 74); c.lineTo(134, 74); c.lineTo(146, 50); c.lineTo(158, 78); c.quadraticCurveTo(128, 124, 98, 78); c.fill(); c.fillStyle = '#1f3350'; for (const x of [85, 171]) c.fillRect(x, 0, 2, 192); c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.fillStyle = '#f7f4ec'; c.fillText('FOXY MAKI', 128, 172); });
    M(new T3.BoxGeometry(2.0, 2.7, 0.06), toon('#2a1c14'), 0, 1.35, D / 2 - 0.03, root, 0); const nr = new T3.Mesh(new T3.PlaneGeometry(1.8, 1.0), new T3.MeshBasicMaterial({ map: norenT })); nr.position.set(0, 2.1, D / 2 - 0.08); nr.rotation.y = Math.PI; root.add(nr); M(new T3.CylinderGeometry(0.03, 0.03, 2.0, 8), woodD, 0, 2.62, D / 2 - 0.1, root, 0.006).rotation.z = Math.PI / 2;
    const hireT = CTX(256, 128, c => { c.fillStyle = '#f2e6cd'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#c0392b'; c.fillRect(0, 0, 256, 18); c.fillRect(0, 110, 256, 18); c.fillStyle = '#201e1d'; c.font = '900 44px Archivo, Arial'; c.textAlign = 'center'; c.fillText('NOW', 128, 60); c.fillText('HIRING', 128, 100); });
    const hire = new T3.Mesh(new T3.PlaneGeometry(0.8, 0.4), new T3.MeshBasicMaterial({ map: hireT })); hire.position.set(1.6, 1.6, D / 2 - 0.05); hire.rotation.y = Math.PI; root.add(hire);
    RECIPES.forEach((r, i) => { const pt = CTX(128, 384, c => { c.fillStyle = '#e6cb9a'; c.fillRect(0, 0, 128, 384); c.fillStyle = '#5e3f2a'; c.fillRect(0, 0, 128, 8); c.fillRect(0, 376, 128, 8); c.fillStyle = '#201e1d'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.save(); c.translate(64, 190); c.rotate(Math.PI / 2); c.fillText(r.name, 0, -6); c.restore(); c.fillStyle = '#c0392b'; c.font = '900 30px Archivo, Arial'; c.fillText(r.price + 'g', 64, 360); });
      const side = i < 5 ? -1 : 1, j = i < 5 ? i : i - 5, x = side * (1.45 + j * 0.42) + (side < 0 ? 0 : 0.0), p = new T3.Mesh(new T3.PlaneGeometry(0.36, 1.08), new T3.MeshBasicMaterial({ map: pt })); p.position.set(x, 3.15, D / 2 - 0.05); p.rotation.y = Math.PI; root.add(p); });
    front.push(...root.children.slice(fc)); }
  // BACK wall (seen in the welcome shot): FOXY MAKI board, shelf of sake bottles, a wave painting
  { const sb = CTX(512, 128, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 512, 128); c.strokeStyle = '#c9a227'; c.lineWidth = 6; c.strokeRect(8, 8, 496, 112); c.fillStyle = '#f7f4ec'; c.font = 'italic 900 70px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FOXY MAKI', 256, 68); });
    const b = new T3.Mesh(new T3.PlaneGeometry(3.2, 0.8), new T3.MeshBasicMaterial({ map: sb })); b.position.set(0, 3.25, -D / 2 + 0.06); root.add(b); cut.push(b);
    cut.push(M(new T3.BoxGeometry(3.6, 0.06, 0.32), woodD, 0, 2.2, -D / 2 + 0.17, root, 0.008)); for (let i = 0; i < 9; i++) { const bt = M(new T3.CylinderGeometry(0.06, 0.07, 0.3, 10), toon(['#2f6d36', '#f2e6cd', '#3a2a20', '#2f4f7a'][i % 4]), -1.5 + i * 0.375, 2.38, -D / 2 + 0.17, root, 0.006, 0.07); cut.push(bt, M(new T3.CylinderGeometry(0.025, 0.04, 0.1, 8), toon('#201e1d'), bt.position.x, 2.58, bt.position.z, root, 0)); }
    const waveT = CTX(256, 256, c => { c.fillStyle = '#f2e6cd'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#2f4f7a'; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.fill(); c.strokeStyle = '#f7f4ec'; c.lineWidth = 7; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(60 + i * 36, 180 - (i % 2) * 20, 34, Math.PI, Math.PI * 1.9); c.stroke(); } c.fillStyle = '#c0392b'; c.beginPath(); c.arc(170, 78, 26, 0, 7); c.fill(); });
    for (const x of [-3.4, 3.4]) { const wv = new T3.Mesh(new T3.CircleGeometry(0.75, 32), new T3.MeshBasicMaterial({ map: waveT })); wv.position.set(x, 2.5, -D / 2 + 0.05); root.add(wv); cut.push(wv); } }
  // THE RING: lacquered counter with a hinoki top, a gap at the back where the chef steps in
  const RI = 2.1, RO = 2.9, A0 = -2.72, A1 = 2.72, CT = 1.02;
  const ringShape = (ri, ro) => { const sh = new T3.Shape(), N = 56; for (let i = 0; i <= N; i++) { const a = A0 + (A1 - A0) * i / N, x = Math.sin(a) * ro, y = -Math.cos(a) * ro; i ? sh.lineTo(x, y) : sh.moveTo(x, y); } for (let i = N; i >= 0; i--) { const a = A0 + (A1 - A0) * i / N; sh.lineTo(Math.sin(a) * ri, -Math.cos(a) * ri); } sh.closePath(); return sh; };
  { const bodyG = new T3.ExtrudeGeometry(ringShape(RI + 0.06, RO - 0.12), { depth: CT - 0.08, bevelEnabled: false, curveSegments: 4 }); bodyG.rotateX(-Math.PI / 2); M(bodyG, lac, 0, 0, 0, root, 0);
    const topG = new T3.ExtrudeGeometry(ringShape(RI, RO), { depth: 0.08, bevelEnabled: false }); topG.rotateX(-Math.PI / 2); M(topG, hinoki, 0, CT - 0.08, 0, root, 0);
    for (const r of [RI, RO]) { const e = new T3.Mesh(new T3.TorusGeometry(r, 0.012, 4, 80, A1 - A0), ink); e.rotation.set(Math.PI / 2, 0, Math.PI / 2 - A1); e.position.y = CT; root.add(e); }
    const kick = new T3.ExtrudeGeometry(ringShape(RO - 0.18, RO - 0.1), { depth: 0.12, bevelEnabled: false }); kick.rotateX(-Math.PI / 2); M(kick, ink, 0, 0, 0, root, 0); }
  // stools round the ring (9), the three nearest the camera-far side are the order spots
  const STOOL_A = [-2.4, -1.8, -1.2, -0.6, 0, 0.6, 1.2, 1.8, 2.4], RS = 3.35;
  STOOL_A.forEach(a => { const x = Math.sin(a) * RS, z = Math.cos(a) * RS; M(new T3.CylinderGeometry(0.05, 0.07, 0.62, 8), woodD, x, 0.31, z, root, 0); M(new T3.CylinderGeometry(0.22, 0.2, 0.08, 14), lac, x, 0.66, z, root, 0.01, 0.22); M(new T3.CylinderGeometry(0.2, 0.2, 0.02, 14), toon('#2f4f7a'), x, 0.71, z, root, 0);
    const cx = Math.sin(a) * 2.62, cz = Math.cos(a) * 2.62; M(new T3.CylinderGeometry(0.06, 0.06, 0.012, 14), white, cx, CT + 0.006, cz, root, 0.004, 0.06); const bt = M(new T3.CylinderGeometry(0.018, 0.024, 0.08, 8), toon('#3a1f12'), cx + Math.cos(a) * 0.14, CT + 0.04, cz - Math.sin(a) * 0.14, root, 0.003); M(new T3.CylinderGeometry(0.012, 0.016, 0.03, 8), lac, bt.position.x, CT + 0.095, bt.position.z, root, 0); });
  // the inner prep table (stations), seen from the chef's side
  const KZ = -0.85, T = 0.95, K = { root, z: KZ, top: T, ct: CT, cut, front, booths, RI, RO, RS };
  M(new T3.BoxGeometry(3.04, T - 0.06, 1.2), woodD, 0, (T - 0.06) / 2, KZ + 0.1, root, 0.02); M(new T3.BoxGeometry(3.1, 0.06, 1.26), hinoki, 0, T - 0.03, KZ + 0.1, root, 0.012);
  // FISH (+x, screen left): ice tray with three blocks, cutting board
  K.board = { x: 1.05, z: KZ - 0.1 }; M(new T3.BoxGeometry(0.62, 0.04, 0.42), toon('#efe2c4'), K.board.x, T + 0.02, K.board.z, root, 0.01); for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.6, 0.002, 0.004), toon('#d9c79f'), K.board.x, T + 0.041, K.board.z - 0.15 + i * 0.1, root, 0);
  M(new T3.BoxGeometry(0.74, 0.05, 0.3), chrome, 1.05, T + 0.025, KZ + 0.48, root, 0.008); { const ice = new T3.Mesh(new T3.PlaneGeometry(0.68, 0.24), toon('#e4f4f8')); ice.rotation.x = -Math.PI / 2; ice.position.set(1.05, T + 0.052, KZ + 0.48); root.add(ice); }
  K.blocks = {}; K.blockPiles = {}; FK.forEach((k, i) => { const x = 0.82 + i * 0.23, z = KZ + 0.48; for (let j = 0; j < 2; j++) { const b = fishBlock(T3, toon, k, ctx.addOutline); b.scale.setScalar(0.85); b.position.set(x, T + 0.05 + j * 0.06, z + (j ? 0.01 : 0)); b.rotation.y = j * 0.2; root.add(b); (K.blockPiles[k] = K.blockPiles[k] || []).push(b); } K.blocks[k] = { x, z }; });
  // ROLL (centre): bamboo mat, rice tub, nori stack, four filling bins, scrap bin
  K.mat = { x: 0.05, z: KZ - 0.1 }; for (let i = 0; i < 13; i++) M(new T3.CylinderGeometry(0.014, 0.014, 0.46, 6), toon(i % 2 ? '#c9b47a' : '#d8c48a'), K.mat.x, T + 0.014, K.mat.z - 0.2 + i * 0.0333, root, 0).rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) M(new T3.BoxGeometry(0.004, 0.004, 0.42), toon('#2f4f7a'), K.mat.x + s * 0.17, T + 0.03, K.mat.z, root, 0);
  K.tub = { x: 0.5, z: KZ - 0.12 }; M(new T3.CylinderGeometry(0.17, 0.15, 0.1, 22), toon('#c99a5a'), K.tub.x, T + 0.05, K.tub.z, root, 0.008, 0.17); M(new T3.TorusGeometry(0.168, 0.008, 6, 24), toon('#8a6a3a'), K.tub.x, T + 0.03, K.tub.z, root, 0).rotation.x = Math.PI / 2; M(new T3.TorusGeometry(0.168, 0.008, 6, 24), toon('#8a6a3a'), K.tub.x, T + 0.08, K.tub.z, root, 0).rotation.x = Math.PI / 2;
  { const rice = new T3.Mesh(new T3.SphereGeometry(0.15, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f7f4ec')); rice.scale.y = 0.3; rice.position.set(K.tub.x, T + 0.09, K.tub.z); root.add(rice); const pad = M(new T3.BoxGeometry(0.05, 0.012, 0.2), toon('#e6cb9a'), K.tub.x + 0.06, T + 0.13, K.tub.z, root, 0.004); pad.rotation.set(0.1, 0.6, 0.3); }
  K.nori = { x: 0.42, z: KZ + 0.48 }; for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.2, 0.006, 0.17), toon(i % 2 ? '#1d2a22' : '#24352a'), K.nori.x, T + 0.006 + i * 0.007, K.nori.z, root, i ? 0 : 0.006);
  K.bins = {}; BK.forEach((k, i) => { const x = 0.17 - i * 0.22, z = KZ + 0.48; M(new T3.BoxGeometry(0.2, 0.07, 0.22), chrome, x, T + 0.035, z, root, 0.006); for (let j = 0; j < 4; j++) { const s = fillStrip(T3, toon, k); s.scale.x = 0.45; s.position.set(x, T + 0.06 + (j % 2) * 0.012, z - 0.06 + j * 0.04); root.add(s); } K.bins[k] = { x, z }; });
  K.trash = { x: -0.42, z: KZ - 0.32 }; M(new T3.CylinderGeometry(0.1, 0.085, 0.09, 14), toon('#3a3836'), K.trash.x, T + 0.045, K.trash.z, root, 0.006, 0.1);
  // PLATE (-x, screen right): geta board, soy dish, ginger, wasabi, soy bottle
  K.geta = { x: -1.0, z: KZ - 0.1 }; M(new T3.BoxGeometry(0.52, 0.03, 0.24), toon('#d9b98a'), K.geta.x, T + 0.045, K.geta.z, root, 0.008); for (const s of [-1, 1]) M(new T3.BoxGeometry(0.04, 0.03, 0.22), toon('#b8945f'), K.geta.x + s * 0.18, T + 0.015, K.geta.z, root, 0);
  K.getaTop = T + 0.06; K.dish = { x: -1.38, z: KZ - 0.12 }; M(new T3.CylinderGeometry(0.075, 0.06, 0.025, 18), white, K.dish.x, T + 0.012, K.dish.z, root, 0.005, 0.075);
  K.ginger = { x: -0.76, z: KZ + 0.46 }; M(new T3.CylinderGeometry(0.09, 0.07, 0.04, 16), white, K.ginger.x, T + 0.02, K.ginger.z, root, 0.005, 0.09); { const gg = gingerArt(T3, toon); gg.scale.setScalar(1.5); gg.position.set(K.ginger.x, T + 0.03, K.ginger.z); root.add(gg); }
  K.wasabi = { x: -1.0, z: KZ + 0.46 }; M(new T3.CylinderGeometry(0.08, 0.065, 0.04, 16), white, K.wasabi.x, T + 0.02, K.wasabi.z, root, 0.005, 0.08); { const w = wasabiArt(T3, toon); w.scale.set(1.6, 1.3, 1.6); w.position.set(K.wasabi.x, T + 0.03, K.wasabi.z); root.add(w); }
  K.soy = { x: -1.26, z: KZ + 0.46 };
  // the pass (where finished plates wait, on the ring top facing the diners) + register on the right of the ring
  K.pass = { x: 0, z: RI + 0.16, y: CT }; M(new T3.BoxGeometry(1.0, 0.012, 0.22), toon('#2f4f7a'), K.pass.x, CT + 0.006, K.pass.z, root, 0);
  K.register = { x: -2.55, z: 0.6 }; M(new T3.BoxGeometry(0.42, 0.3, 0.34), ink, K.register.x, CT + 0.15, K.register.z, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), lac, K.register.x, CT + 0.34, K.register.z - 0.17, root, 0);
  K.spots = [-0.6, 0, 0.6].map(a => ({ a, x: Math.sin(a) * RS, z: Math.cos(a) * RS, cx: Math.sin(a) * 2.6, cz: Math.cos(a) * 2.6 }));
  // four paper lanterns over the bar (the 2D map's four lamps)
  K.lamps = []; for (const [x, z] of [[1.8, 1.8], [-1.8, 1.8], [-1.8, -1.8], [1.8, -1.8]]) { cut.push(M(new T3.CylinderGeometry(0.008, 0.008, 0.9, 4), ink, x, H - 0.45, z, root, 0)); const l = M(new T3.SphereGeometry(0.28, 16, 12), toon('#e8624a', { emissive: new T3.Color('#c0392b'), emissiveIntensity: 0.45 }), x, H - 1.15, z, root, 0.012, 0.28); l.scale.y = 1.25; for (const dy of [-0.34, 0.34]) cut.push(M(new T3.CylinderGeometry(0.13, 0.13, 0.05, 12), ink, x, H - 1.15 + dy, z, root, 0)); K.lamps.push(l); cut.push(l); }
  // potted pine + noren side banners
  { const p = new T3.Group(); p.position.set(4.2, 0, 4.4); root.add(p); M(new T3.CylinderGeometry(0.3, 0.24, 0.45, 14), toon('#3a3836'), 0, 0.22, 0, p, 0.01); M(new T3.CylinderGeometry(0.05, 0.07, 1.0, 8), woodD, 0, 0.9, 0, p, 0.006); for (let i = 0; i < 4; i++) M(new T3.SphereGeometry(0.32 - i * 0.04, 10, 8), toon('#3f6b2a'), Math.cos(i * 2) * 0.25, 1.2 + i * 0.25, Math.sin(i * 2) * 0.25, p, 0.01).scale.y = 0.5; booths.push(p); }
  for (const x of [-W / 2 + 0.04, W / 2 - 0.04]) { const bn = M(new T3.BoxGeometry(0.02, 2.0, 0.6), indigo, x, 2.4, 1.2, root, 0.006); booths.push(bn); }
  // shoji windows glowing on both side walls (lit paper + lattice) and red tassels under the lanterns
  { const sj = CTX(256, 128, c => { const g = c.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#fff3d6'); g.addColorStop(1, '#f6dcae'); c.fillStyle = g; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#5e3f2a'; c.lineWidth = 3; for (let x = 0; x <= 256; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 128); c.stroke(); } for (let y = 0; y <= 128; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); } c.lineWidth = 10; c.strokeRect(0, 0, 256, 128); c.fillStyle = 'rgba(94,63,42,0.18)'; c.beginPath(); c.ellipse(70, 92, 40, 12, -0.3, 0, 7); c.fill(); c.fillRect(66, 40, 5, 50); });
    for (const sx of [-1, 1]) for (const z of [-2.4, 2.0]) { const w = new T3.Mesh(new T3.PlaneGeometry(2.6, 1.3), new T3.MeshBasicMaterial({ map: sj })); w.position.set(sx * (W / 2 - 0.03), 2.0, z); w.rotation.y = -sx * Math.PI / 2; root.add(w); } }
  K.lamps.forEach(l => { const t = M(new T3.CylinderGeometry(0.03, 0.05, 0.22, 8), lac, l.position.x, l.position.y - 0.5, l.position.z, root, 0.006); cut.push(t); });
  cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K; }

// ---------------- the stand-alone game ----------------
export async function createSushiShift({ container, onState = () => {}, onExit = null, onShiftEnd = null }) {
  const ST = createStage(container, { bg: '#2a1c14' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, puff, smokeS } = ST;
  // sound: the shop's own synth (sushi-audio.js) replaces the kit's Ambience (no wind loop indoors)
  const AU = sushiAudio(), tone = AU.tone, audio = { init() { AU.init(); }, burst: AU.burst }, BUZZ = { slice: 12, chop: 18, roll: 10, press: 10, squash: 40, bad: 30 };
  const sfx = (n, o) => { AU.play(n, o); if (BUZZ[n] && AU.muted().sfx) try { navigator.vibrate && navigator.vibrate(BUZZ[n]); } catch (e) {} }; AU.setMode('calm');
  scene.fog = new THREE.Fog('#2a1c14', 12, 26);
  const K = buildSushiBar({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.top;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb27a, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending })); s.position.copy(l.position); s.scale.setScalar(1.6); scene.add(s); return s; });
  const knife = (() => { const g = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.006, 0.05), toon('#d7dde3')); bl.position.x = 0.17; addOutline(bl, 0.004); g.add(bl); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8), toon('#e6cb9a')); h.rotation.z = Math.PI / 2; h.position.x = -0.07; addOutline(h, 0.004, 0.018); g.add(h); g.visible = false; scene.add(g); return g; })();
  const paddle = (() => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.012, 0.16), toon('#e6cb9a')); addOutline(b, 0.004); g.add(b); const h = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.012, 0.14), toon('#d9b98a')); h.position.z = -0.14; g.add(h); g.visible = false; scene.add(g); return g; })();

  // ---------- cast ----------
  const chef = kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#d9733a', furDark: '#9a4a22' }, torso: ['#f7f4ec', '#f2ede2', '#2f4f7a'], outfit: 'robe', crest: '', gear: 'none', mood: 'happy' });
  const CP = chef.userData.P; if (CP.sword) CP.sword.visible = false; if (CP.gun) CP.gun.visible = false; const CHEF_HOME = V3(0.6, 0, -1.75), CHEF_WORK = V3(1.9, 0, 0.3); chef.position.copy(CHEF_HOME); chef.rotation.y = 0; scene.add(chef);
  const chefAt = work => { chef.visible = true; chef.position.copy(work ? CHEF_WORK : CHEF_HOME); chef.rotation.y = work ? Math.atan2(-CHEF_WORK.x, -0.8 - CHEF_WORK.z) : 0; chef.userData.mood = 'happy'; };
  const CHEF_SAYS = { thrilled: ['CHEF: "Yes. Exactly that."', 'CHEF: "The carpenter will hear about that one."'], insulted: ['CHEF: "Four moves. We talked about this."', 'CHEF: "Listen to the ticket, then listen again."'] };
  function chefReact(level) { const u = chef.userData; u.moodT = 2.6; if (level === 'thrilled') { u.mood = 'excited'; u.hop = 1; if (!DM.on && Math.random() < 0.6) say(pick(CHEF_SAYS.thrilled), 2.6); } else if (level === 'happy') u.mood = 'happy'; else if (level === 'insulted' || level === 'unhappy') { u.mood = 'sad'; if (!DM.on && level === 'insulted') say(pick(CHEF_SAYS.insulted), 2.6); } else u.mood = 'neutral'; }
  { const hb = new THREE.Mesh(new THREE.TorusGeometry(0.392, 0.04, 8, 36), toon('#f7f4ec')); hb.rotation.x = Math.PI / 2; hb.position.y = 0.13; CP.head.add(hb); }
  const ben = kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#2f4f7a'], crest: '', gear: 'none', mood: 'happy' }); const BEN_AT = V3(0.9, 0, 3.75); ben.position.copy(BEN_AT); ben.rotation.y = 0.3; const BP = ben.userData.P; if (BP.sword) BP.sword.visible = false; if (BP.gun) BP.gun.visible = false; scene.add(ben);
  const uniform = new THREE.Group(); {
    const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 96); g.scale(1.14, 1.14); g.lineWidth = 8; g.strokeStyle = '#201e1d';
        // one big salmon nigiri: rice bed, salmon slab draped over it, white fat stripes
        g.lineJoin = 'round'; g.fillStyle = '#f7f4ec'; g.beginPath(); g.ellipse(0, 22, 92, 34, 0, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = '#e4dfd2'; for (let i = 0; i < 16; i++) { const a = i * 2.4, r = 30 + (i % 4) * 14; g.save(); g.translate(Math.cos(a) * r, 30 + Math.sin(a) * 12); g.rotate(a); g.fillRect(-5, -2, 10, 4); g.restore(); }
        g.fillStyle = '#f08a4b'; g.beginPath(); g.moveTo(-108, 14); g.bezierCurveTo(-96, -40, 60, -62, 112, -6); g.bezierCurveTo(118, 6, 108, 18, 94, 16); g.bezierCurveTo(40, 6, -40, 14, -92, 30); g.bezierCurveTo(-104, 32, -112, 26, -108, 14); g.closePath(); g.fill(); g.stroke();
        g.save(); g.clip(); g.strokeStyle = '#fde0c8'; g.lineWidth = 9; for (let i = 0; i < 6; i++) { const x = -78 + i * 34; g.beginPath(); g.moveTo(x - 10, 34); g.quadraticCurveTo(x + 6, -8, x + 34, -50); g.stroke(); } g.restore();
        g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.beginPath(); g.moveTo(-108, 14); g.bezierCurveTo(-96, -40, 60, -62, 112, -6); g.bezierCurveTo(118, 6, 108, 18, 94, 16); g.bezierCurveTo(40, 6, -40, 14, -92, 30); g.bezierCurveTo(-104, 32, -112, 26, -108, 14); g.closePath(); g.stroke();
        g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.ellipse(-30, -18, 26, 6, -0.25, 0, Math.PI * 2); g.fill();
        g.restore(); g.save(); g.translate(128, 196); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-122, -24); g.lineTo(126, -30); g.lineTo(116, 34); g.lineTo(-130, 30); g.closePath(); g.fill(); g.fillStyle = '#c0392b'; g.beginPath(); g.moveTo(-114, -18); g.lineTo(118, -24); g.lineTo(110, 26); g.lineTo(-121, 23); g.closePath(); g.fill();
        g.font = 'italic 900 38px Archivo, "Arial Black", Arial, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('FOXY MAKI', 0, 2); g.fillStyle = '#f7f4ec'; g.fillText('FOXY MAKI', 0, 2); g.restore(); });
    uniform.userData.parts = dinerUniform(ST, ben, { print, printY: 1.12, printSize: 0.53, hat: 'band', bandCol: '#2f4f7a', towelCol: '#2f4f7a' }).parts; }
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push({ m }); });
  const setUniform = on => { uniform.userData.parts.forEach(p => p.visible = on); crestSlots.forEach(s => { s.m.visible = !on; }); };
  setUniform(true);
  const custFox = CUSTOMERS.map(cu => { const look0 = cu.female ? PLAYER_FEMALE : CAST.player.look, look = cu.fur ? { ...look0, fur: cu.fur, furDark: cu.furDark } : cu.elder ? { ...look0, elder: 1, fur: '#d9733a', furDark: '#9a4a22' } : look0;
    const f = kit.makeFox({ ...CAST.player, look, torso: cu.torso, outfit: cu.outfit || 'robe', crest: '', gear: 'none', mood: 'happy' }); const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; if (cu.small) f.scale.setScalar(0.72); f.visible = false; scene.add(f); return f; });

  // ---------- cameras ----------
  const CAM = { pos: V3(), look: V3(), from: null, t: 1, dur: 1 };
  const { SAFE, shotFor } = cameraFit(ST);
  const wideShot = () => { const port = CW() < CHh(), b = BEN_AT, benBox = [V3(b.x - 0.5, 0.05, b.z), V3(b.x + 0.5, 0.05, b.z), V3(b.x - 0.5, 2.25, b.z), V3(b.x + 0.5, 2.25, b.z)];
    return port ? shotFor('wideP', () => [...benBox, V3(b.x, 2.5, b.z)], 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL', () => [...benBox, V3(b.x, 2.5, b.z)], 0.12, Math.PI - 0.3, 0.05); };
  const FOCUS = { all: 1, fish: 1, roll: 1, plate: 1, serve: 1 };
  function workShot(id = S.focus || 'all') { const port = CW() < CHh(); return shotFor('w:' + id, () => shotPoints(id), id === 'serve' ? (port ? 0.95 : 0.7) : id === 'all' ? (port ? 1.0 : 0.85) : port ? 1.2 : 0.92, 0, id === 'all' ? 0.03 : 0.05); }
  function setFocus(id) { if (!FOCUS[id] || S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }
  function shotPoints(id) { const P = (x, z, y = T) => V3(x, y, z), out = [];
    if (id === 'fish') { out.push(P(K.board.x - 0.34, K.board.z - 0.24), P(K.board.x + 0.34, K.board.z + 0.24), P(K.board.x, K.board.z, T + 0.25)); for (const b of Object.values(K.blocks)) out.push(P(b.x - 0.12, b.z + 0.16), P(b.x + 0.12, b.z - 0.1, T + 0.2)); }
    else if (id === 'roll') { out.push(P(K.mat.x - 0.26, K.mat.z - 0.24), P(K.mat.x + 0.26, K.mat.z + 0.24), P(K.tub.x + 0.18, K.tub.z - 0.18), P(K.tub.x + 0.18, K.tub.z + 0.18, T + 0.2), P(K.nori.x + 0.12, K.nori.z + 0.12), P(K.trash.x - 0.1, K.trash.z - 0.1), ...Object.values(K.bins).map(b => P(b.x, b.z + 0.13, T + 0.1)), P(K.mat.x, K.mat.z, T + 0.3)); }
    else if (id === 'plate') { out.push(P(K.geta.x - 0.3, K.geta.z - 0.18), P(K.geta.x + 0.3, K.geta.z + 0.18), P(K.dish.x - 0.1, K.dish.z - 0.1), P(K.soy.x - 0.08, K.soy.z + 0.1, T + 0.3), P(K.ginger.x + 0.1, K.ginger.z + 0.1), P(K.wasabi.x, K.wasabi.z + 0.12), P(K.geta.x, K.geta.z, T + 0.35)); }
    else if (id === 'serve') { out.push(P(K.pass.x - 0.55, K.pass.z - 0.15, K.ct), P(K.pass.x + 0.55, K.pass.z - 0.15, K.ct), ...K.spots.flatMap(s => [P(s.x - 0.4, s.z, 2.25), P(s.x + 0.4, s.z, 2.25), P(s.x, s.z, 0.85)])); }
    else out.push(P(-1.55, K.z - 0.5), P(1.55, K.z - 0.5), P(-1.55, K.z + 0.62), P(1.55, K.z + 0.62), ...K.spots.flatMap(s => [P(s.x, s.z, 1.0), P(s.x, s.z, 2.2)]));
    return out; }
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  camera.position.set(0.9, 2.1, 7.0); CAM.look.set(0.4, 1.25, 2); camera.lookAt(CAM.look);

  // ---------- game state ----------
  const S = { focus: 'all', phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, next: 3, done: null, combo: 0, hold: null };
  const upg = id => !!save.stat(SAVE.upg + id, 0), SLICES = () => upg('sharp') ? 2 : 3, PUSHES = () => upg('mat') ? 2 : 3, CAP = () => upg('fridge') ? 10 : 6, RUB = () => upg('paddle') ? 0.165 : 0.11;
  const orders = [], tray = []; let drag = null, idSeq = 1;
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const avail = () => RECIPES.filter(r => r.day <= S.day), itemName = it => (RECIPE(it.r) || { name: 'MYSTERY ROLL' }).name;
  const sameSet = (a, b) => [...a].sort().join(',') === [...b].sort().join(',');
  const matchRecipe = (kind, fills) => { const r = RECIPES.find(q => q.kind === kind && sameSet(fillsOf(q), fills)); return r ? r.id : 'custom'; };

  // ---------- the work on the mat (W) and the plate on the geta (PL) ----------
  const W = { kind: null, rice: 0, riceLock: false, fills: [], rolled: 0, cuts: [], shaped: 0, fish: null };
  const matG = new THREE.Group(); matG.position.set(K.mat.x, T + 0.03, K.mat.z); scene.add(matG);
  const NW = 0.4, ND = 0.34; let rollMesh = null;
  const riceTex = canvasTex(128, 128, c => { c.fillStyle = '#f7f4ec'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#e4dfd2'; for (let i = 0; i < 260; i++) { c.save(); c.translate(Math.random() * 128, Math.random() * 128); c.rotate(Math.random() * 3); c.fillRect(-3, -1, 6, 2.4); c.restore(); } });
  const riceMat = new THREE.MeshToonMaterial({ map: riceTex, gradientMap: grad });
  function rebuildMat() { while (matG.children.length) matG.remove(matG.children[0]); rollMesh = null; if (!W.kind) return;
    if (W.kind === 'maki') { const k = Math.min(1, W.rolled / PUSHES()), rolled = W.rolled >= PUSHES();
      if (!rolled) { const flatD = ND * (1 - k * 0.85), z0 = -ND / 2 + (ND - flatD); const sh = new THREE.Mesh(new THREE.BoxGeometry(NW, 0.004, flatD), toon('#1d2a22')); sh.position.set(0, 0.002, z0 + flatD / 2); matG.add(sh);
        const cov = Math.min(1, W.rice), thick = W.rice > 1 ? 0.012 + (W.rice - 1) * 0.04 : 0.012, rd = (ND - 0.07) * cov * (1 - k * 0.85);
        if (W.rice > 0.02) { const r = new THREE.Mesh(new THREE.BoxGeometry(NW - 0.02, thick, Math.max(0.005, rd)), riceMat); r.position.set(0, 0.004 + thick / 2, z0 + 0.005 + Math.max(0.005, rd) / 2); matG.add(r); }
        if (!k) W.fills.forEach((f, i) => { const s = fillStrip(THREE, toon, f); s.scale.x = 1; s.position.set(0, 0.022 + (i % 2) * 0.006, -ND / 2 + 0.06 + i * 0.03); matG.add(s); });
        if (k > 0) { const rad = 0.022 + k * 0.026, cy = new THREE.Mesh(new THREE.CylinderGeometry(rad, rad, NW, 20), toon('#1d2a22')); cy.rotation.z = Math.PI / 2; cy.position.set(0, rad, -ND / 2 + rad + (ND - 0.06) * k * 0.15); addOutline(cy, 0.004, rad); matG.add(cy); } }
      else { const L = NW, edges = [-L / 2, ...W.cuts.map(c => c).sort((a, b) => a - b), L / 2]; rollMesh = new THREE.Group(); matG.add(rollMesh);
        for (let i = 0; i < edges.length - 1; i++) { const a = edges[i], b = edges[i + 1], gap = W.cuts.length ? 0.006 : 0, len = Math.max(0.01, b - a - gap), cy = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, len, 20), toon('#1d2a22')); cy.rotation.z = Math.PI / 2; cy.position.set((a + b) / 2 + (W.cuts.length ? (i - (edges.length - 2) / 2) * 0.006 : 0), 0.048, 0); addOutline(cy, 0.004, 0.048); rollMesh.add(cy);
          if (W.cuts.length) for (const sx of [-1, 1]) { const f = new THREE.Mesh(new THREE.CircleGeometry(0.043, 16), toon('#f7f4ec')); f.rotation.y = sx * Math.PI / 2; f.position.set(cy.position.x + sx * (len / 2 + 0.0005), 0.048, 0); rollMesh.add(f); } }
        // guide ticks on the mat edge: where five even cuts go
        for (let i = 1; i <= CUTS_N; i++) { const x = -L / 2 + L * i / (CUTS_N + 1), tk = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.003, 0.05), new THREE.MeshBasicMaterial({ color: W.cuts.some(c => Math.abs(c - x) < 0.02) ? 0x22c55e : 0xec3013 })); tk.position.set(x, 0.002, 0.1); matG.add(tk); } } }
    else if (W.kind === 'nigiri') { const sq = W.shaped > SHAPE_N ? 1 : 0; for (const dx of [-0.07, 0.07]) { const n = nigiriPiece(THREE, toon, W.fish, addOutline, sq); const k = Math.min(1, W.shaped / SHAPE_N); n.scale.set((1.15 - k * 0.15) * 1.3, (0.7 + k * 0.3) * 1.3, (1.1 - k * 0.1) * 1.3); n.position.set(dx * 1.2, 0, 0); matG.add(n); } } }
  function resetMat() { Object.assign(W, { kind: null, rice: 0, riceLock: false, fills: [], rolled: 0, cuts: [], shaped: 0, fish: null }); S.rub = false; rebuildMat(); }

  const getaG = new THREE.Group(); getaG.position.set(K.geta.x, K.getaTop, K.geta.z); scene.add(getaG);
  const dishG = new THREE.Group(); dishG.position.set(K.dish.x, T + 0.02, K.dish.z); scene.add(dishG); const soyFill = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.05, 1, 18).translate(0, 0.5, 0), toon('#3a1f12')); soyFill.scale.y = 0.0001; soyFill.visible = false; dishG.add(soyFill);
  for (const v of SOY) { const ln = new THREE.Mesh(new THREE.TorusGeometry(0.05 + v * 0.012, 0.0025, 4, 24), new THREE.MeshBasicMaterial({ color: 0xec3013 })); ln.rotation.x = Math.PI / 2; ln.position.y = v * 0.02; dishG.add(ln); }
  let PL = null;  // { r, kind, fills, fish, ginger, wasabi, soy, soyDone, notes:{} }
  function rebuildPlate() { while (getaG.children.length) getaG.remove(getaG.children[0]); soyFill.visible = !!PL && PL.soy > 0.01; soyFill.scale.y = PL ? Math.max(0.0001, PL.soy * 0.02) : 0.0001; if (!PL) return;
    if (PL.kind === 'maki') for (let i = 0; i < 6; i++) { const p = makiPiece(THREE, toon, PL.fills, addOutline); p.position.set(-0.12 + (i % 3) * 0.1, 0, -0.045 + Math.floor(i / 3) * 0.09); p.rotation.y = i; getaG.add(p); }
    else for (const dx of [-0.08, 0.08]) { const n = nigiriPiece(THREE, toon, PL.fish, addOutline, PL.squash ? 1 : 0); n.scale.setScalar(1.3); n.position.set(dx * 1.15, 0, 0); n.rotation.y = 0.15; getaG.add(n); }
    if (PL.ginger) { const g = gingerArt(THREE, toon); g.scale.setScalar(1.3); g.position.set(0.2, 0, 0.045); getaG.add(g); }
    if (PL.wasabi) { const w = wasabiArt(THREE, toon); w.position.set(0.2, 0, -0.06); getaG.add(w); } }
  // the soy bottle: red cap, tilts over the dish while you hold it
  const soyB = new THREE.Group(); { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.16, 14), new THREE.MeshToonMaterial({ color: '#3a1f12', gradientMap: grad })); b.position.y = 0.08; addOutline(b, 0.005, 0.05); soyB.add(b); const n = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.06, 14), toon('#e6e2da')); n.position.y = 0.19; soyB.add(n); const cp = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 0.05, 12), toon('#c0392b')); cp.position.y = 0.235; addOutline(cp, 0.004, 0.035); soyB.add(cp); }
  soyB.position.set(K.soy.x, T, K.soy.z); scene.add(soyB);
  const stream = (() => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 1, 8), new THREE.MeshBasicMaterial({ color: 0x3a1f12 })); st.visible = false; scene.add(st); return st; })();
  // the pass: finished plates waiting for the diners
  const passG = new THREE.Group(); passG.position.set(K.pass.x, K.ct + 0.012, K.pass.z); scene.add(passG);
  const miniPlate = it => { const g = new THREE.Group(), r = RECIPE(it.r) || { kind: 'maki', fill: ['cucumber'] }, b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.14), toon('#d9b98a')); b.position.y = 0.01; addOutline(b, 0.004); g.add(b);
    if (r.kind === 'maki') for (let i = 0; i < 3; i++) { const p = makiPiece(THREE, toon, r.fill, null); p.scale.setScalar(0.8); p.position.set(-0.09 + i * 0.065, 0.02, 0); g.add(p); } else for (const dx of [-0.05, 0.05]) { const n = nigiriPiece(THREE, toon, r.fish, null); n.scale.setScalar(0.8); n.position.set(dx, 0.02, 0); g.add(n); } return g; };
  const cups = K.spots.map(sp => { const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.032, 0.075, 14), toon('#5e7a5a')); c.position.y = 0.038; addOutline(c, 0.004, 0.038); g.add(c); const tea = new THREE.Mesh(new THREE.CircleGeometry(0.032, 14), toon('#b8a24a')); tea.rotation.x = -Math.PI / 2; tea.position.y = 0.07; g.add(tea); g.position.set(sp.cx + Math.cos(sp.a) * 0.24, K.ct, sp.cz - Math.sin(sp.a) * 0.24); g.visible = false; scene.add(g); return g; });
  { const warm = new THREE.PointLight(0xffb27a, 7, 11, 1.4); warm.position.set(0, 3.0, 0.8); scene.add(warm); }
  function rebuildPass() { while (passG.children.length) passG.remove(passG.children[0]); tray.forEach((it, i) => { const g = miniPlate(it); g.position.set(-0.33 + (i % 3) * 0.33, 0, (Math.floor(i / 3)) * -0.16); passG.add(g); }); }

  // ---------- fish stock + slicing ----------
  const stock = {}; FK.forEach(k => stock[k] = 0);
  const outT = canvasTex(128, 64, c => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#fff'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OUT', 64, 34); });
  const outTags = {}; for (const k of FK) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: outT, depthTest: false })); sp.scale.set(0.2, 0.1, 1); sp.position.set(K.blocks[k].x, T + 0.3, K.blocks[k].z); sp.renderOrder = 26; sp.visible = false; scene.add(sp); outTags[k] = sp; }
  const setStock = (k, n) => { stock[k] = Math.max(0, n); (K.blockPiles[k] || []).forEach((m, i) => m.visible = stock[k] > i * 3); outTags[k].visible = stock[k] <= 0 && S.phase === 'shift'; };
  const restock = k => { if (S.restock && S.restock[k]) return; (S.restock = S.restock || {})[k] = 1; say('CHEF: "Out of ' + FISH[k].name.toLowerCase() + '? Keep rolling. I will cut you another block."', 4); setTimeout(() => { if (!S.restock || !S.restock[k]) return; delete S.restock[k]; setStock(k, CAP()); sfx('restock'); flash('FRESH ' + FISH[k].name + ' · +' + CAP(), '#22c55e', 1.4); }, 9000); };
  const slabs = [];
  function needCut(k) { if (S.cut) return; setStock(k, stock[k] - 1); const m = fishBlock(THREE, toon, k, addOutline); m.scale.setScalar(1.6); m.position.set(K.board.x + 0.04, T + 0.04, K.board.z); scene.add(m); S.cut = { k, cuts: 0, mesh: m, last: 0 }; sfx('restock'); }
  function clearSliced() { if (!S.sliced) return; scene.remove(S.sliced.g); S.sliced = null; }
  function slicedPile(k) { const g = new THREE.Group(); for (let i = 0; i < 4; i++) { const s = fishSlab(THREE, toon, k, addOutline); s.position.set(-0.08 + i * 0.05, 0.008 + i * 0.004, (i % 2) * 0.02); s.rotation.y = 0.3; g.add(s); } return g; }
  function makeSliced(k) { clearSliced(); const g = slicedPile(k); g.position.set(K.board.x, T + 0.045, K.board.z); scene.add(g); S.sliced = { k, g }; }
  function cutOnce() { const C = S.cut; const now = performance.now() / 1000; if (!C || now - C.last < 0.08) return; C.last = now; C.cuts++; sfx('slice', { pitch: 0.95 + C.cuts * 0.04 });
    const p = fishSlab(THREE, toon, C.k, addOutline); p.position.set(K.board.x - 0.18 + C.cuts * 0.04, T + 0.045, K.board.z - 0.1 + (C.cuts % 2) * 0.16); p.rotation.y = rr(-0.4, 0.4); scene.add(p); slabs.push(p); C.mesh.scale.x = Math.max(0.5, 1.6 * (1 - C.cuts / SLICES() * 0.6)); C.mesh.position.x = K.board.x + 0.04 + C.cuts * 0.03; puff(K.board.x, T + 0.15, K.board.z, 0xffffff, 1);
    if (C.cuts >= SLICES()) { scene.remove(C.mesh); slabs.forEach(s2 => scene.remove(s2)); slabs.length = 0; S.cut = null; knife.visible = false; makeSliced(C.k); flash(FISH[C.k].name + ' SLICED · TAP IT ONTO THE ' + (W.kind === 'nigiri' ? 'RICE' : 'ROLL'), '#22c55e', 1.6); sfx('sliced'); } }

  // ---------- building the item ----------
  const busyPlate = () => !!PL;
  function startMaki() { if (W.kind) { flash('THE MAT IS BUSY · FINISH IT OR TAP THE SCRAP BIN', '#ffffff', 1.4); return false; } Object.assign(W, { kind: 'maki', rice: 0, riceLock: false, fills: [], rolled: 0, cuts: [], shaped: 0, fish: null }); rebuildMat(); sfx('nori'); flash('NORI ON THE MAT · TAP THE RICE TUB', '#22c55e', 1.1); return true; }
  function tubTap() { if (!W.kind) { if (S.day < 2) { flash('LAY A NORI SHEET FIRST · TAP THE NORI', '#ffffff', 1.3); return; } Object.assign(W, { kind: 'nigiri', shaped: 0, fish: null }); rebuildMat(); sfx('scoop'); flash('NIGIRI · PRESS THE RICE 3 TIMES', '#22c55e', 1.3); return; }
    if (W.kind === 'nigiri') { pressNigiri(); return; }
    if (W.riceLock) { flash('THE RICE IS DONE · ADD THE FILLINGS', '#ffffff', 1.1); return; } S.rub = true; sfx('scoop'); puff(K.tub.x, T + 0.15, K.tub.z, 0xffffff, 2); flash('RUB THE RICE ACROSS THE NORI', '#22c55e', 1.2); }
  function rubOnce() { if (!S.rub || W.kind !== 'maki' || W.riceLock) return; W.rice = Math.min(1.3, W.rice + RUB()); rebuildMat(); S.rubT = 0.9; sfx('rub'); if (W.rice >= 1.3) { S.rub = false; flash('TOO THICK · THE ROLL WILL NOT CLOSE', '#ec3013', 1.3); sfx('bad'); } }
  function lockRice() { if (W.riceLock) return; W.riceLock = true; S.rub = false; const v = W.rice; W.riceOk = v >= RICE[0] && v <= RICE[1]; flash('RICE · ' + riceZone(v), W.riceOk ? '#22c55e' : '#e6b45a', 1); }
  const riceZone = v => v < RICE[0] ? 'THIN' : v <= RICE[1] ? 'JUST RIGHT' : 'TOO THICK';
  function addFill(k) {
    if (W.kind === 'nigiri') { if (!FISH[k]) { flash('NIGIRI TAKES FISH ONLY', '#ffffff', 1.1); return false; } if (W.fish) { flash('FISH IS ALREADY ON', '#ffffff', 1); return false; } if (W.shaped < 1) { flash('PRESS THE RICE FIRST · TAP IT', '#ffffff', 1.1); return false; } if (busyPlate()) { flash('GETA IS BUSY · FINISH THAT PLATE FIRST', '#ec3013', 1.4); return false; }
      W.fish = k; W.shapeOk = W.shaped === SHAPE_N; rebuildMat(); sfx('plop', { pitch: 0.8 }); setTimeout(() => toGeta(), 350); return true; }
    if (W.kind !== 'maki') { flash('TAP THE NORI FOR A ROLL' + (S.day >= 2 ? ' (OR THE RICE TUB FOR NIGIRI)' : ''), '#ffffff', 1.4); return false; }
    if (W.rice < 0.3) { flash('RICE FIRST · TAP THE TUB, THEN RUB', '#ffffff', 1.2); return false; }
    if (W.rolled > 0) { flash('ALREADY ROLLING', '#ffffff', 1); return false; } if (W.fills.length >= 4) { flash('THAT IS ENOUGH FILLING', '#ffffff', 1); return false; }
    lockRice(); W.fills.push(k); rebuildMat(); sfx('plop', { pitch: 0.9 + W.fills.length * 0.1 }); puff(K.mat.x, T + 0.12, K.mat.z, 0xffffff, 1); return true; }
  function pushRoll() { if (W.kind !== 'maki' || !W.fills.length || W.rolled >= PUSHES()) return; W.rolled++; rebuildMat(); sfx('roll'); if (W.rolled >= PUSHES()) sfx('rolled'), flash('ROLLED · NOW CUT IT · 5 CUTS = 6 PIECES', '#22c55e', 1.5); }
  function cutRoll(x) { if (W.kind !== 'maki' || W.rolled < PUSHES() || W.cuts.length >= CUTS_N) return; if (Math.abs(x) > NW / 2 - 0.02 || W.cuts.some(c => Math.abs(c - x) < 0.022)) return; if (W.cuts.length === CUTS_N - 1 && busyPlate()) { flash('GETA IS BUSY · FINISH THAT PLATE FIRST', '#ec3013', 1.4); return; }
    W.cuts.push(x); rebuildMat(); sfx('chop', { pan: -x * 2 });
    if (W.cuts.length >= CUTS_N) { const e = [-NW / 2, ...W.cuts.slice().sort((a, b) => a - b), NW / 2], w = []; for (let i = 1; i < e.length; i++) w.push(e[i] - e[i - 1]); const mean = NW / (CUTS_N + 1), dev = Math.max(...w.map(v => Math.abs(v - mean))); W.cutOk = dev < 0.024; flash(W.cutOk ? 'SIX EVEN PIECES' : 'UNEVEN PIECES', W.cutOk ? '#22c55e' : '#e6b45a', 1); setTimeout(() => toGeta(), 400); } }
  function pressNigiri() { if (W.kind !== 'nigiri' || W.fish) return; W.shaped++; rebuildMat(); if (W.shaped > SHAPE_N) sfx('squash'); else sfx('press', { pitch: 0.9 + W.shaped * 0.12 }); puff(K.mat.x, T + 0.08, K.mat.z, 0xffffff, 1);
    if (W.shaped === SHAPE_N) flash('THREE MOVES · STOP! LAY THE FISH ON', '#22c55e', 1.4); else if (W.shaped > SHAPE_N) { flash('SQUASHED · FOUR MOVES IS A BALL OF RICE', '#ec3013', 1.6); W.shaped = SHAPE_N + 1; } else flash('PRESS ' + W.shaped + ' / ' + SHAPE_N, '#ffffff', 0.7); }
  function dumpMat() { if (W.kind || W.rice) { resetMat(); flash('MAT CLEARED', '#ffffff', 1); sfx('bin'); puff(K.trash.x, T + 0.12, K.trash.z, 0xffffff, 3); return; } if (tray.length) { const it = tray.pop(); rebuildPass(); flash(itemName(it) + ' BINNED', '#ec3013', 1.1); sfx('bin'); return; } flash('NOTHING TO BIN', '#ffffff', 0.9); }
  function toGeta() { if (!W.kind) return; const kind = W.kind, fills = kind === 'nigiri' ? [W.fish] : W.fills.slice(); PL = { r: matchRecipe(kind, fills), kind, fills, fish: W.fish, ginger: false, wasabi: false, soy: 0, soyDone: false, riceOk: kind === 'maki' ? !!W.riceOk : true, cutOk: kind === 'maki' ? !!W.cutOk : true, shapeOk: kind === 'nigiri' ? !!W.shapeOk : true, squash: kind === 'nigiri' && W.shaped > SHAPE_N };
    resetMat(); rebuildPlate(); sfx('plate'); for (let i = 0; i < 4; i++) puff(K.geta.x + rr(-0.15, 0.15), T + 0.12, K.geta.z, 0xfff3d0, 1);
    if (PL.r === 'custom') { flash('NOT ON THE MENU · PLATE BINNED', '#ec3013', 1.6); sfx('bad'); PL = null; rebuildPlate(); return; }
    flash('PLATE IT · GINGER' + (needWasabi() === false ? ' (NO WASABI!)' : ' + WASABI') + ' + SOY', '#ffd23a', 1.6); }
  function needWasabi() { if (!PL) return null; for (const o of orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)) { const TF = trayFor(o); for (let j = 0; j < o.items.length; j++) if (!TF.covered[j] && o.items[j].r === PL.r) return o.items[j].wasabi; } return null; }
  function addGarnish(k) { if (!PL) { flash('NOTHING ON THE GETA YET', '#ffffff', 1); return; } if (PL[k]) return; PL[k] = true; rebuildPlate(); sfx('garnish', { pitch: k === 'ginger' ? 1 : 1.25 }); puff(K.geta.x + 0.2, T + 0.1, K.geta.z, k === 'ginger' ? 0xffd0d0 : 0xd8f0a0, 2); if (k === 'wasabi' && needWasabi() === false) flash('THIS ONE SAID NO WASABI!', '#ec3013', 1.4); maybeFinish(); }
  function maybeFinish() { if (!PL || !PL.soyDone || !PL.ginger) return; const nw = needWasabi(); if (nw !== false && !PL.wasabi) return; setTimeout(() => finishPlate(), 250); }
  function finishPlate() { if (!PL || S.reveal) return; const nw = needWasabi(); const it = { r: PL.r, wasabi: !!PL.wasabi, clean: !!(PL.riceOk && PL.cutOk && PL.shapeOk && PL.soyOk && PL.ginger), notes: { rice: PL.riceOk, cut: PL.cutOk, shape: PL.shapeOk, soy: PL.soyOk, ginger: PL.ginger, kind: PL.kind } };
    S.reveal = { it, t: 0, ...revealInfo(it) }; S.flash = null; sfx(it.clean ? 'good' : 'neutral'); for (let i = 0; i < 6; i++) puff(K.geta.x + rr(-0.2, 0.2), T + rr(0.1, 0.35), K.geta.z + rr(-0.1, 0.1), 0xffe7a0, 1); }

  // ---------- HOLD: soy ----------
  const HOLD_DEF = {
    soy: { label: 'SOY', max: 1.1, zones: [['LOW', 0, SOY[0], '#9ca3af'], ['AT THE LINE', SOY[0], SOY[1], '#22c55e', 'line'], ['HIGH', SOY[1], 1.0, '#e6b45a'], ['SPILL', 1.0, 1.1, '#ec3013']] },
    rice: { label: 'RICE', max: 1.3, zones: [['THIN', 0, RICE[0], '#9ca3af'], ['JUST RIGHT', RICE[0], RICE[1], '#22c55e', 'right'], ['TOO THICK', RICE[1], 1.3, '#ec3013']] } };
  const zoneAt = (k, v) => { const z = HOLD_DEF[k].zones; return (z.find(q => v < q[2]) || z[z.length - 1])[0]; };
  function startSoy() { if (!PL) { flash('PLATE SOMETHING FIRST', '#ffffff', 1); return; } if (PL.soyDone) { flash('THE SOY IS POURED', '#ffffff', 0.9); return; } S.hold = { kind: 'soy', t: 0 }; AU.loopStart('pour'); }
  function stepHold(dt) { const H = S.hold; if (!H) return; H.t += dt; if (H.kind === 'soy' && PL) { PL.soy = Math.min(1.1, PL.soy + dt * 0.42); rebuildPlateSoy(); if (PL.soy >= 1.08) releaseHold(); } }
  const rebuildPlateSoy = () => { soyFill.visible = true; soyFill.scale.y = Math.max(0.0001, Math.min(1, PL.soy) * 0.02); };
  function releaseHold() { const H = S.hold; if (!H) return; S.hold = null; AU.loopStop('pour'); if (H.kind !== 'soy' || !PL) return; const v = PL.soy; if (v < 0.12) { flash('KEEP HOLDING TO POUR', '#ffffff', 0.9); return; }
    PL.soyDone = true; PL.soyOk = v >= SOY[0] && v <= SOY[1]; if (v >= 1.0) { PL.soy = 1; flash('SPILLED · MESSY PLATE', '#ec3013', 1.3); sfx('bad'); puff(K.dish.x, T + 0.1, K.dish.z, 0x6a4a3a, 3); } else if (PL.soyOk) { flash('RIGHT AT THE LINE!', '#22c55e', 1); sfx('good'); } else flash(v > SOY[1] ? 'A BIT HIGH' : 'A BIT SHORT', '#e6b45a', 1); rebuildPlateSoy(); maybeFinish(); }

  // ---------- customers + orders ----------
  function newOrder() { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i)); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)), ci = pick(pool);
    const rec = avail(), d = S.day, n = d >= 3 && Math.random() < 0.25 ? 2 : 1, items = Array.from({ length: n }, () => { const r = pick(rec.slice(-Math.min(rec.length, 3 + d))); return { r: r.id, wasabi: d >= 2 ? Math.random() > 0.3 : true }; });
    const total = items.reduce((s, it) => s + RECIPE(it.r).price, 0), patMax = (84 - Math.min(18, (d - 1) * 4)) * (upg('radio') ? 1.2 : 1);
    const f = custFox[ci], sp = K.spots[free]; f.visible = true; f.position.set(0, 0, 5.0); f.rotation.y = Math.PI; f.userData.mood = 'happy';
    orders.push({ id: idSeq++, ci, spot: free, items, total, pat: patMax, patMax, st: 'walk', f, line: CUSTOMERS[ci].line || pick(LINES.order), plates: null }); }
  const exact = (a, b) => a.r === b.r && !!a.wasabi === !!b.wasabi;
  function trayFor(o, pool0 = tray) { const pool = pool0.slice(), covered = o.items.map(() => false); o.items.forEach((it, j) => { let i = pool.findIndex(x => exact(x, it)); if (i < 0) i = pool.findIndex(x => x.r === it.r); if (i >= 0) { covered[j] = true; pool.splice(i, 1); } }); return { covered, made: covered.filter(Boolean).length, next: covered.indexOf(false), extra: pool }; }
  function takeFor(o) { const got = []; o.items.forEach(it => { let i = tray.findIndex(x => exact(x, it)); if (i < 0) i = tray.findIndex(x => x.r === it.r); if (i >= 0) got.push(tray.splice(i, 1)[0]); }); rebuildPass(); return got; }
  function grade(o, got) { let want = 0, hit = 0; o.miss = 0; o.sloppy = 0; const pool = got.slice(); o.items.forEach(it => { want++; let i = pool.findIndex(x => exact(x, it)); if (i < 0) { i = pool.findIndex(x => x.r === it.r); if (i >= 0) o.miss++; } if (i >= 0) { hit++; if (!pool[i].clean) o.sloppy++; pool.splice(i, 1); } }); return want ? hit / want : 0; }
  function servePlates(o, got) { if (o.plates) scene.remove(o.plates); const g = new THREE.Group(), sp = K.spots[o.spot]; got.forEach((it, i) => { const m = miniPlate(it); m.position.set((i - (got.length - 1) / 2) * 0.32, 0, 0); g.add(m); }); g.position.set(sp.cx, K.ct + 0.012, sp.cz); g.rotation.y = -sp.a; scene.add(g); o.plates = g; }
  function serve(o) { if (!o || o.st !== 'wait') return false; const TF = trayFor(o); if (TF.made < o.items.length) { flash('THE PASS IS MISSING PART OF ' + CUSTOMERS[o.ci].name + "'S ORDER", '#ffffff', 1.4); return false; }
    const got = takeFor(o); servePlates(o, got); const q = grade(o, got), pq = o.pat / o.patMax, stars = q >= 1 ? (o.miss || o.sloppy ? 2 : pq > 0.5 ? 3 : 2) : q >= 0.5 ? 1 : 0;
    if (stars === 0) { startReact(o, 'insulted', 0, null); return false; }
    o.st = 'pay'; o.stars = stars; const level = stars === 3 ? (pq > 0.72 ? 'thrilled' : 'happy') : stars === 2 ? 'neutral' : 'unhappy'; o.tip = level === 'thrilled' ? Math.ceil(o.total * 0.4) + 3 : level === 'happy' ? Math.ceil(o.total * 0.25) + 1 : level === 'neutral' ? 1 : 0;
    const bill = [5, 10, 20, 50].find(b => b > o.total + (Math.random() < 0.3 ? 4 : 0)) || 50; startReact(o, level, stars, { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 }); return true; }
  function servePass(o) { if (o) return serve(o); const ready = orders.filter(q => q.st === 'wait' && trayFor(q).made >= q.items.length).sort((a, b) => a.pat - b.pat); if (ready.length) return serve(ready[0]); flash(tray.length ? 'NO ORDER IS COMPLETE ON THE PASS YET' : 'THE PASS IS EMPTY', '#ffffff', 1.2); return false; }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['The rice is right. Somebody taught you.', 'Warm as a hand. Exactly.', 'I will tell the whole square about this counter.'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Very good. Thank you.', 'Just how I like it.', 'Clean cuts, good fish.'] }, neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['It is fine. The chef would have done it differently.', 'Hm. The soy is not where I like it.', 'A bit untidy, but it will do.'] }, unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['Half my order is missing...', 'This is not what I asked for.', 'I waited for this?'] }, insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'angry', lines: ['That is NOT my order!', 'Is this a ball of rice with a fish on it?', 'Are you even listening?'] } };
  function startReact(o, level, stars, pay) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; S.react = { o, level, stars, pay, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: CUSTOMERS[o.ci].name, tip: o.tip || 0 }; S.focus = 'all';
    sfx(level); chefReact(level); if (level === 'thrilled') { for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; if (r.pay) { S.pay = r.pay; payProps(r.pay); S.payOut = null; sfx('drawer'); } else { if (r.o.plates) { scene.remove(r.o.plates); r.o.plates = null; } r.o.pat = Math.max(4, r.o.pat - 6); } }
  const REG = V3(K.register.x, K.ct, K.register.z), RG = registerKit(ST, REG, { open: 'FOXY MAKI  ·  OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; coinDrop(v); regDraw(P); sfx('coin', { pitch: 1.12 - v * 0.012 }); if (P.given === P.owed) payDone(); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; sfx('bad'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone() { const P = S.pay, o = orders.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); if (!o) return; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars); S.combo = o.stars === 3 ? S.combo + 1 : 0;
    flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + pts + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : ''), '#ffd23a', 1.8); sfx('register'); o.st = 'eat'; o.t = 0; }
  function revealInfo(it) { const want = orders.filter(o => o.st === 'wait').sort((a, b) => a.pat - b.pat);
    for (const o of want) { const TF = trayFor(o), still = o.items.filter((_, j) => !TF.covered[j]); let hi = still.findIndex(q => exact(q, it)); if (hi < 0) hi = still.findIndex(q => q.r === it.r); if (hi < 0) continue; const w = still[hi]; still.splice(hi, 1);
      return { oid: o.id, who: CUSTOMERS[o.ci].name, wasabiOk: !!w.wasabi === !!it.wasabi, wantWasabi: !!w.wasabi, completes: !still.length, missing: still.map(q => itemName(q) + (q.wasabi ? '' : ' · NO WASABI')) }; }
    return { oid: null, who: null, completes: false, missing: [] }; }
  function revealDone(choice = 'tray') { const r = S.reveal; S.reveal = null; getaG.rotation.y = 0; getaG.scale.setScalar(1); PL = null; rebuildPlate();
    if (choice === 'bin') { flash('PLATE BINNED', '#ec3013', 1); sfx('bin'); return; }
    tray.push(r.it); rebuildPass(); sfx('plate', { pitch: 0.85 });
    if (choice === 'serve') { const o = orders.find(q => q.id === r.oid && q.st === 'wait'); if (o) serve(o); } }

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T + 0.06)), hit = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const TARGETS = () => { const t = [];
    for (const [k, b] of Object.entries(K.blocks)) t.push({ kind: 'block', k, p: V3(b.x, T + 0.1, b.z), r: 40 });
    t.push({ kind: S.sliced ? 'sliced' : 'board', p: V3(K.board.x, T + 0.06, K.board.z), r: 66 });
    t.push({ kind: 'nori', p: V3(K.nori.x, T + 0.04, K.nori.z), r: 40 }, { kind: 'tub', p: V3(K.tub.x, T + 0.1, K.tub.z), r: 44 }, { kind: 'mat', p: V3(K.mat.x, T + 0.05, K.mat.z), r: 70 }, { kind: 'trash', p: V3(K.trash.x, T + 0.08, K.trash.z), r: 36 });
    for (const [k, b] of Object.entries(K.bins)) t.push({ kind: 'bin', k, p: V3(b.x, T + 0.07, b.z), r: 36 });
    t.push({ kind: 'geta', p: V3(K.geta.x, T + 0.08, K.geta.z), r: 50 }, { kind: 'ginger', p: V3(K.ginger.x, T + 0.05, K.ginger.z), r: 40 }, { kind: 'wasabi', p: V3(K.wasabi.x, T + 0.05, K.wasabi.z), r: 40 }, { kind: 'soy', p: V3(K.soy.x, T + 0.14, K.soy.z), r: 44 });
    if (tray.length) t.push({ kind: 'pass', p: V3(K.pass.x, K.ct + 0.06, K.pass.z), r: 60 });
    orders.forEach(o => o.st === 'wait' && t.push({ kind: 'cust', o, p: V3(o.f.position.x, 1.45, o.f.position.z), r: 70 })); return t; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * scale() && d < bd) { bd = d; best = t; } } return best; }
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const STATION = { block: 'fish', board: 'fish', sliced: 'fish', nori: 'roll', tub: 'roll', mat: 'roll', trash: 'roll', bin: 'roll', geta: 'plate', ginger: 'plate', wasabi: 'plate', soy: 'plate', pass: 'serve', cust: 'serve' };
  const matMode = () => W.kind === 'maki' ? (W.rolled >= PUSHES() ? 'cut' : W.fills.length ? 'roll' : S.rub ? 'rub' : 'idle') : W.kind === 'nigiri' ? 'press' : 'empty';
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (S.phase !== 'shift' || S.pay || DM.on || S.reveal || S.react || S.hold) return; const { x, y } = local(e); let t = pickAt(x, y);
    if (S.cut && (!t || t.kind === 'board')) { e.preventDefault(); setFocus('fish'); S.stroke = { kind: 'fish', x, y }; strokeMove(x, y); return; }
    const mm = matMode(); if ((mm === 'rub' || mm === 'roll' || mm === 'cut') && (!t || t.kind === 'mat' || t.kind === 'tub' || (mm !== 'rub' && t.kind === 'nori'))) { e.preventDefault(); setFocus('roll'); S.stroke = { kind: mm, x, y, x0: x, y0: y, done: false }; strokeMove(x, y); return; }
    if (!t) return; e.preventDefault();
    if (S.focus === 'all' && !['soy', 'pass', 'sliced', 'cust'].includes(t.kind)) setFocus(STATION[t.kind]);
    if (t.kind === 'block') { if (S.sliced && S.sliced.k === t.k) { flash('ALREADY SLICED · TAP IT ONTO THE MAT', '#ffffff', 1.2); return; } if (S.cut || S.sliced) { flash('THE BOARD IS BUSY', '#ffffff', 1); setFocus('fish'); return; } if (stock[t.k] <= 0) { flash('OUT OF ' + FISH[t.k].name + ' · THE CHEF IS ON IT', '#ec3013', 1.5); restock(t.k); return; } needCut(t.k); setFocus('fish'); }
    else if (t.kind === 'board') flash('TAP A FISH BLOCK TO SLICE ONE', '#ffffff', 1);
    else if (t.kind === 'sliced') { const k = S.sliced.k; S.sliced.g.visible = false; const m = slicedPile(k); m.scale.setScalar(0.8); drag = { kind: 'fish', mesh: m, k, x0: x, y0: y }; scene.add(m); m.position.copy(S.sliced.g.position); }
    else if (t.kind === 'nori') startMaki();
    else if (t.kind === 'tub') tubTap();
    else if (t.kind === 'mat') { if (mm === 'press') pressNigiri(); else if (mm === 'idle') flash('TAP THE RICE TUB FOR RICE', '#ffffff', 1.1); else flash('TAP THE NORI FOR A ROLL' + (S.day >= 2 ? ' · THE RICE TUB FOR NIGIRI' : ''), '#ffffff', 1.3); }
    else if (t.kind === 'trash') dumpMat();
    else if (t.kind === 'bin') addFill(t.k);
    else if (t.kind === 'geta') { if (!PL) flash('ROLLS AND NIGIRI LAND HERE', '#ffffff', 1); else if (!PL.soyDone) flash('HOLD THE SOY BOTTLE TO POUR', '#ffffff', 1.1); else finishPlate(); }
    else if (t.kind === 'ginger' || t.kind === 'wasabi') addGarnish(t.kind);
    else if (t.kind === 'soy') { setFocus('plate'); startSoy(); }
    else if (t.kind === 'pass') servePass();
    else if (t.kind === 'cust') { if (trayFor(t.o).made >= t.o.items.length) serve(t.o); else flash(CUSTOMERS[t.o.ci].name + ' · WAITING FOR ' + t.o.items.map(itemName).join(' + '), '#ffffff', 1.4); } }
  function onMove(e) { if (S.stroke) { const { x, y } = local(e); strokeMove(x, y); return; } if (!drag) return; const { x, y } = local(e); ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) drag.mesh.position.set(hit.x, T + 0.16, hit.z); }
  function onUp(e) { if (S.stroke) { S.stroke = null; knife.visible = false; paddle.visible = false; return; } if (S.hold && !DM.on) { releaseHold(); return; } if (!drag) return; const { x, y } = local(e), d = drag; drag = null; const tap = Math.hypot(x - d.x0, y - d.y0) < 14;
    if (d.kind === 'fish') { scene.remove(d.mesh); const onMat = tap || pickAt(x, y, ['mat', 'tub', 'bin']); if (onMat && addFill(d.k)) { clearSliced(); flash(FISH[d.k].name + (W.kind === 'nigiri' || !W.kind ? ' ON THE RICE' : ' ON THE ROLL'), '#22c55e', 0.9); } else if (S.sliced) S.sliced.g.visible = true; } }
  const matScr = () => scr(V3(K.mat.x, T + 0.06, K.mat.z));
  function strokeMove(x, y) { const st = S.stroke; if (!st) return;
    if (st.kind === 'fish') { const C = S.cut; if (!C) return; const v = scr(V3(K.board.x + 0.04, T + 0.1, K.board.z)), R = 70 * scale(), sxa = st.x - v.x, sxb = x - v.x, sya = st.y - v.y, syb = y - v.y;
      if ((sxa * sxb < 0 && Math.abs(y - v.y) < R) || (sya * syb < 0 && Math.abs(x - v.x) < R)) cutOnce(); st.x = x; st.y = y; toolAt(knife, x, y, -0.1, Math.PI / 2 + 0.15, -0.25); return; }
    const v = matScr(), R = 80 * scale();
    if (st.kind === 'rub') { if (((st.x - v.x) * (x - v.x) < 0 && Math.abs(y - v.y) < R) || ((st.y - v.y) * (y - v.y) < 0 && Math.abs(x - v.x) < R)) rubOnce(); st.x = x; st.y = y; toolAt(paddle, x, y, 0, 0.2, 0); return; }
    if (st.kind === 'roll') { if (!st.done && st.y0 - y > 46 * scale() && Math.abs(x - st.x0) < (st.y0 - y) * 0.9) { st.done = true; pushRoll(); } st.x = x; st.y = y; return; }
    if (st.kind === 'cut') { const rv = scr(V3(K.mat.x, T + 0.08, K.mat.z)); if ((st.y - rv.y) * (y - rv.y) < 0) { const k = (rv.y - st.y) / ((y - st.y) || 1), cx = st.x + (x - st.x) * k; ndc.set(cx / CW() * 2 - 1, -(rv.y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) cutRoll(hit.x - K.mat.x); } st.x = x; st.y = y; toolAt(knife, x, y, -0.1, Math.PI / 2, -0.3); } }
  function toolAt(tool, x, y, dz, ry, rz) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) { tool.visible = true; tool.position.set(hit.x, T + 0.12, hit.z + dz); tool.rotation.set(0, ry, rz); } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp);

  // ---------- flow ----------
  function clearAll() { S.hold = null; AU.loopStop('pour'); stream.visible = false; clearSliced(); knife.visible = false; paddle.visible = false; if (S.cut) { scene.remove(S.cut.mesh); S.cut = null; } slabs.forEach(s2 => scene.remove(s2)); slabs.length = 0; S.reveal = null; S.react = null; S.restock = null; S.stroke = null;
    orders.forEach(o => { o.f.visible = false; if (o.plates) scene.remove(o.plates); }); orders.length = 0; tray.length = 0; rebuildPass(); PL = null; rebuildPlate(); resetMat(); drag = null; }
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done') return; S.payOut = null; payProps(null); if (!S.demo && DM.on) demoStop(); audio.init && audio.init(); clearAll(); Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.5, done: null, pay: null, combo: 0 });
    FK.forEach(k => setStock(k, 0)); S.focus = 'all'; setUniform(!!save.flag('sushiUniform')); chefAt(true); ben.visible = false; glideTo(workShot(), 1.6); sfx('noren'); AU.setMode('shift'); S.lastTick = 0; say('CHEF: "Rice is warm, the fish is cut, and there are four people waiting."', 6); S.glideT = 1.65; }
  function endShift() { S.phase = 'done'; S.hold = null; stream.visible = false; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 5 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = []; try { save.addGold(total); save.best(SAVE.best, total); if (S.served >= 3 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = RECIPES.filter(r => r.day === nd).map(r => r.name); if (nd === 2) unlock.push('NO-WASABI ORDERS'); } if (!save.flag('sushiUniform') && S.served >= 3) { save.setFlag('sushiUniform'); setUniform(true); unlock.push('MAKI UNIFORM (headband + towel + tee)'); } if (S.served >= 3 && !save.flag('kyoto.sushiShift')) { save.setFlag('kyoto.sushiShift'); unlock.push('THE ROOM OFF THE SOUTH COURT · TELL THE CHEF'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold };
    if (newDay) S.day += 1; sfx('gong'); AU.setMode('calm'); AU.loopStop('pour'); chefAt(false); try { onShiftEnd && onShiftEnd({ ...S.done, roomShift: !!save.flag('kyoto.sushiShift'), uniform: !!save.flag('sushiUniform') }); } catch (e) {} glideTo(wideShot(), 1.4); say(eod ? 'CHEF: "Employee of the day. The carpenter noticed."' : S.served >= 3 ? 'CHEF: "You did. The carpenter says the rice was right."' : 'CHEF: "Turn up on time and we will never discuss it again."', 6); orders.forEach(o => { o.st = 'leave'; o.t = 0; }); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); sfx('upgrade'); if (S.done) S.done.gold = save.data.gold; return true; }

  // ---------- DEMO: an autopilot plays a real shift with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, anim: null, day0: 1, holdTo: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 20; scene.add(hand);
  const handTo = (p, f) => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.5); if (f) setFocus(f); DM.hint = { p: p.clone().setY(Math.max(T, p.y - 0.15)), r: 0.16 }; };
  const cap = (id, key, text) => { if (DM.seen[id]) return; DM.seen[id] = true; DM.cap = text; DM.key = key; DM.cd = Math.max(DM.cd, 1.6); };
  function slide(mesh, from, to, dur, done) { scene.add(mesh); mesh.position.copy(from); DM.anim = { mesh, from: from.clone(), to: to.clone(), t: 0, dur, done }; }
  const wrongMat = rec => { if (!W.kind) return false; if (W.kind !== rec.kind) return true; if (W.kind === 'nigiri') return W.shaped > SHAPE_N || (W.fish && W.fish !== rec.fish); const left = rec.fill.slice(); return W.fills.some(k => { const i = left.indexOf(k); if (i < 0) return true; left.splice(i, 1); return false; }); };
  const missingFill = rec => { if (rec.kind === 'nigiri') return W.fish ? [] : [rec.fish]; const left = rec.fill.slice(); for (const k of W.fills) { const i = left.indexOf(k); if (i >= 0) left.splice(i, 1); } return left; };
  const matP = (dy = 0.08) => V3(K.mat.x, T + dy, K.mat.z);
  function demoFish(k, why) { if (S.sliced && S.sliced.k === k) { cap('lay', 'TAP', why); const from = V3(K.board.x, T + 0.1, K.board.z); handTo(from, 'roll'); clearSliced(); slide(slicedPile(k), from, matP(0.12), 0.55, () => { addFill(k); }); return 0.8; }
    if (S.sliced) clearSliced();
    if (S.cut) { cap('slice', 'SWIPE', 'SWIPE ACROSS THE ' + FISH[S.cut.k].name + ' BLOCK TO SLICE IT'); handTo(V3(K.board.x + 0.04, T + 0.12, K.board.z), 'fish'); knife.visible = true; knife.position.set(K.board.x - 0.04 + (S.cut.cuts % 2 ? 0.12 : -0.12), T + 0.14, K.board.z - 0.1); knife.rotation.set(0, Math.PI / 2 + 0.15, -0.25); cutOnce(); if (!S.cut) knife.visible = false; return 0.45; }
    cap('block', 'TAP', 'THE TICKET NEEDS ' + FISH[k].name + ': TAP THE BLOCK ON THE ICE'); handTo(V3(K.blocks[k].x, T + 0.12, K.blocks[k].z), 'fish'); if (stock[k] <= 0) setStock(k, CAP()); needCut(k); return 0.8; }
  function demoAct() { const o = orders.find(q => q.st === 'wait');
    if (S.pay) { const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); if (!DM.seen.pay) { cap('pay', 'COINS', 'THEY PAID ' + P.paid + 'g FOR A ' + P.total + 'g BILL. TAP COINS TO GIVE ' + P.owed + 'g CHANGE'); return 1.8; } DM.cap = 'GIVE ' + P.owed + 'g CHANGE · ' + (P.given + v) + ' / ' + P.owed + 'g'; DM.key = v + 'g'; giveCoin(v); if (!S.pay) { DM.served++; DM.cap = 'EXACT CHANGE! THE COINS GO TO THE DINER'; DM.key = '✓'; return 1.6; } return 0.85; }
    if (!o) return 0.4;
    if (trayFor(o).made >= o.items.length) { cap('pass', 'TAP', 'ORDER COMPLETE ON THE PASS? TAP THE PASS TO SERVE IT'); handTo(V3(K.pass.x, K.ct + 0.08, K.pass.z), 'serve'); serve(o); return 1.0; }
    if (PL) { const nw = needWasabi(); if (!PL.ginger) { cap('ginger', 'TAP', 'PLATE IT: TAP THE GINGER'); handTo(V3(K.ginger.x, T + 0.1, K.ginger.z), 'plate'); addGarnish('ginger'); return 0.7; }
      if (nw !== false && !PL.wasabi) { cap('wasabi', 'TAP', 'TAP THE WASABI (UNLESS THE TICKET SAYS NO WASABI)'); handTo(V3(K.wasabi.x, T + 0.1, K.wasabi.z), 'plate'); addGarnish('wasabi'); return 0.7; }
      if (!PL.soyDone) { cap('soy', 'HOLD', 'HOLD THE SOY BOTTLE. LET GO BETWEEN THE RED LINES'); handTo(V3(K.soy.x, T + 0.2, K.soy.z), 'plate'); startSoy(); DM.holdTo = (SOY[0] + SOY[1]) / 2; return 0.1; }
      finishPlate(); return 0.5; }
    const TF = trayFor(o); if (TF.next < 0) return 0.4; const it = o.items[TF.next], rec = RECIPE(it.r);
    if (wrongMat(rec)) { cap('trash', 'TAP', 'WRONG THING ON THE MAT? TAP THE SCRAP BIN TO CLEAR IT'); handTo(V3(K.trash.x, T + 0.1, K.trash.z), 'roll'); dumpMat(); return 0.7; }
    if (rec.kind === 'nigiri') {
      if (!W.kind) { cap('nigiri', 'TAP', 'NIGIRI: TAP THE RICE TUB WITH THE MAT EMPTY'); handTo(V3(K.tub.x, T + 0.12, K.tub.z), 'roll'); tubTap(); return 0.8; }
      if (W.shaped < SHAPE_N) { cap('press', 'TAP ×3', 'PRESS THE RICE THREE TIMES, THEN STOP. FOUR AND IT IS A BALL OF RICE'); handTo(matP(), 'roll'); pressNigiri(); return 0.55; }
      return demoFish(rec.fish, 'TAP THE SLICED FISH ONTO THE RICE'); }
    if (!W.kind) { cap('nori', 'TAP', 'THE TICKET SAYS ' + rec.name + ': TAP THE NORI FOR A SHEET'); handTo(V3(K.nori.x, T + 0.06, K.nori.z), 'roll'); startMaki(); return 0.8; }
    if (!W.riceLock && W.rice < 0.85) { if (!S.rub) { cap('tub', 'TAP', 'TAP THE RICE TUB TO PICK UP RICE'); handTo(V3(K.tub.x, T + 0.12, K.tub.z), 'roll'); tubTap(); return 0.7; } cap('rub', 'RUB', 'RUB BACK AND FORTH ACROSS THE NORI. STOP IN THE GREEN'); handTo(matP(), 'roll'); paddle.visible = true; paddle.position.set(K.mat.x + (Math.random() < 0.5 ? 0.1 : -0.1), T + 0.1, K.mat.z); rubOnce(); return 0.3; }
    paddle.visible = false;
    const miss = missingFill(rec); if (miss.length) { const k = miss[0]; if (FISH[k]) return demoFish(k, 'TAP THE SLICED FISH ONTO THE RICE'); cap('bin', 'TAP', 'TAP THE ' + FILLS[k].name + ' BIN TO LAY A STRIP'); handTo(V3(K.bins[k].x, T + 0.1, K.bins[k].z), 'roll'); addFill(k); return 0.6; }
    if (W.rolled < PUSHES()) { cap('roll', 'SWIPE ↑', 'SWIPE UP ACROSS THE MAT TO ROLL IT · ' + PUSHES() + ' PUSHES'); handTo(matP(), 'roll'); pushRoll(); return 0.6; }
    if (W.cuts.length < CUTS_N) { cap('cut', 'SWIPE', 'SWIPE DOWN ACROSS THE ROLL AT THE RED MARKS · 5 CUTS'); const i = W.cuts.length + 1, x = -NW / 2 + NW * i / (CUTS_N + 1); handTo(V3(K.mat.x + x, T + 0.1, K.mat.z), 'roll'); knife.visible = true; knife.position.set(K.mat.x + x, T + 0.12, K.mat.z - 0.1); knife.rotation.set(0, Math.PI / 2, -0.3); cutRoll(x); if (W.cuts.length >= CUTS_N || !W.kind) knife.visible = false; return 0.45; }
    return 0.4; }
  function demoStep(dt) { if (DM.anim) { const a = DM.anim; a.t += dt / a.dur; const k = Math.min(1, a.t), p = a.from.clone().lerp(a.to, smooth(0, 1, k)); p.y += Math.sin(k * Math.PI) * 0.25; a.mesh.position.copy(p); hand.position.copy(p); if (k >= 1) { DM.anim = null; scene.remove(a.mesh); a.done && a.done(); } return; }
    if (S.hold && DM.holdTo != null) { if (PL && PL.soy >= DM.holdTo) { DM.holdTo = null; releaseHold(); DM.cd = 0.7; } return; }
    hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.6)); if (S.phase !== 'shift' || S.reveal || S.react || S.payOut) return; DM.cd -= dt; if (DM.cd > 0) return; const f0 = S.focus; DM.cd = demoAct(); if (S.focus !== f0) DM.cd += 0.5;
    if (DM.served >= 2 || S.t > 170) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.served = 0; DM.anim = null; DM.holdTo = null; DM.cd = 2.2; DM.day0 = S.day; S.day = Math.max(S.day, 2); DM.cap = 'WATCH A SHIFT AT FOXY MAKI'; DM.key = ''; S.phase = 'intro'; S.done = null; S.demo = true; S.demoN = 0; startShift(); S.next = 0.8; }
  function demoStop() { if (!DM.on) return; S.payOut = null; payProps(null); DM.on = false; S.demo = false; hand.visible = false; paddle.visible = false; knife.visible = false; if (DM.anim) { scene.remove(DM.anim.mesh); DM.anim = null; } S.day = DM.day0; S.pay = null; S.phase = 'intro'; S.done = null; clearAll(); ben.visible = true; chefAt(false); AU.setMode('calm'); ben.position.copy(BEN_AT); ben.rotation.y = 0.3; glideTo(wideShot(), 1.2); }

  // ---------- NEXT-STEP HINT ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'shift' || S.pay) return null; const P3 = (x, z, y = T) => V3(x, y, z), Hh = (p, station, text, r = 0.16) => ({ p, station, text, r });
    if (S.hold) return Hh(P3(K.dish.x, K.dish.z), 'plate', 'LET GO AT THE LINE · SOY');
    const o = orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)[0]; if (!o) return null; const who = CUSTOMERS[o.ci].name;
    const TF = trayFor(o); if (TF.made >= o.items.length) return Hh(P3(K.pass.x, K.pass.z, K.ct), 'serve', 'TAP THE PASS TO SERVE ' + who, 0.4);
    if (PL) { const nw = needWasabi(); if (!PL.ginger) return Hh(P3(K.ginger.x, K.ginger.z), 'plate', 'TAP THE GINGER', 0.13); if (nw !== false && !PL.wasabi) return Hh(P3(K.wasabi.x, K.wasabi.z), 'plate', 'TAP THE WASABI', 0.13); if (!PL.soyDone) return Hh(P3(K.soy.x, K.soy.z), 'plate', 'HOLD THE SOY BOTTLE · STOP AT THE RED LINES' + (nw === false ? ' · NO WASABI ON THIS ONE' : ''), 0.13); return Hh(P3(K.geta.x, K.geta.z), 'plate', 'TAP THE GETA TO FINISH THE PLATE', 0.22); }
    const it = o.items[TF.next], rec = RECIPE(it.r);
    if (wrongMat(rec)) return Hh(P3(K.trash.x, K.trash.z), 'roll', 'WRONG ON THE MAT: TAP THE SCRAP BIN', 0.13);
    const fishStep = k => { if (S.sliced && S.sliced.k === k) return Hh(P3(K.board.x, K.board.z), 'fish', 'TAP THE SLICED ' + FISH[k].name + ' ONTO THE ' + (rec.kind === 'nigiri' ? 'RICE' : 'ROLL'), 0.24); if (S.cut) return Hh(P3(K.board.x + 0.04, K.board.z), 'fish', 'SWIPE ACROSS THE ' + FISH[S.cut.k].name + ' TO SLICE · ' + S.cut.cuts + ' / ' + SLICES(), 0.24); if (S.sliced) return Hh(P3(K.board.x, K.board.z), 'fish', 'TAP THE SLICED ' + FISH[S.sliced.k].name + ' FIRST (OR THE SCRAP BIN)', 0.24); return Hh(P3(K.blocks[k].x, K.blocks[k].z), 'fish', 'TAP THE ' + FISH[k].name + ' BLOCK · ' + rec.name, 0.12); };
    if (rec.kind === 'nigiri') { if (!W.kind) return Hh(P3(K.tub.x, K.tub.z), 'roll', 'NIGIRI: TAP THE RICE TUB · ' + rec.name, 0.18); if (W.shaped < SHAPE_N) return Hh(P3(K.mat.x, K.mat.z), 'roll', 'TAP THE RICE TO PRESS IT · ' + W.shaped + ' / ' + SHAPE_N + ' · THEN STOP', 0.2); return fishStep(rec.fish); }
    if (!W.kind) return Hh(P3(K.nori.x, K.nori.z), 'roll', 'TAP THE NORI · ' + rec.name + ' FOR ' + who, 0.13);
    if (!W.riceLock && W.rice < RICE[0]) return S.rub ? Hh(P3(K.mat.x, K.mat.z), 'roll', 'RUB BACK AND FORTH ACROSS THE NORI · ' + Math.round(W.rice * 100) + '%', 0.24) : Hh(P3(K.tub.x, K.tub.z), 'roll', 'TAP THE RICE TUB', 0.18);
    const miss = missingFill(rec); if (miss.length) { const k = miss[0]; if (FISH[k]) return fishStep(k); return Hh(P3(K.bins[k].x, K.bins[k].z), 'roll', 'TAP THE ' + FILLS[k].name + ' BIN', 0.12); }
    if (W.rolled < PUSHES()) return Hh(P3(K.mat.x, K.mat.z), 'roll', 'SWIPE UP ACROSS THE MAT TO ROLL · ' + W.rolled + ' / ' + PUSHES(), 0.24);
    return Hh(P3(K.mat.x, K.mat.z), 'roll', 'SWIPE DOWN ACROSS THE ROLL AT THE RED MARKS · ' + W.cuts.length + ' / ' + CUTS_N, 0.24); }
  let HINT = null, hintT = 0;
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === 'all' || S.focus === HINT.station) return; if (drag || S.hold || S.stroke || S.reveal || S.react || S.pay) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 0.9 && performance.now() - (S.userFocusT || 0) > 2500) S.focus = HINT.station; }
  function updHint(dt) { hintT += dt; HINT = DM.on ? (DM.hint && !DM.anim ? DM.hint : null) : nextHint(); RINGS.place(HINT && !S.reveal && !S.react ? HINT : null, hintT, dt); }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const lerpCam = (sh, k) => { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); };
  function step(dt) {
    if (S.reveal) { S.reveal.t += dt; const r = S.reveal, sh = shotFor('reveal', () => { const p = K.geta; return [V3(p.x - 0.3, T, p.z - 0.15), V3(p.x + 0.3, T, p.z + 0.15), V3(K.dish.x - 0.08, T, K.dish.z), V3(p.x, T + 0.25, p.z)]; }, 0.62, 0.18, 0.12); lerpCam(sh, Math.min(1, dt * 6)); getaG.scale.setScalar(1 + Math.sin(Math.min(1, r.t / 0.35) * Math.PI) * 0.12); if (DM.on && r.t > 1.8) revealDone(r.completes ? 'serve' : r.oid ? 'tray' : 'bin'); }
    else if (S.pay || S.payOut) { const port = CW() < CHh(), sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0.25, 0.07); lerpCam(sh, Math.min(1, dt * 5)); regDisp.scale.set(port ? 0.36 : 0.46, port ? 0.133 : 0.17, 1); }
    else if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position, sp = K.spots[o.spot], hs = o.f.scale.y, sh = shotFor('react' + o.spot + '|' + hs, () => [V3(f.x - 0.45 * hs, 1.15 * hs, f.z), V3(f.x + 0.45 * hs, 1.15 * hs, f.z), V3(f.x, 2.65 * hs, f.z), V3(sp.cx, K.ct, sp.cz)], 0.14, -sp.a, 0.1); lerpCam(sh, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.0 : 2.4)) reactDone(); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (S.phase === 'shift' || S.phase === 'glide') lerpCam(workShot(), Math.min(1, dt * 3.2));
    { const hide = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !hide); K.booths.forEach(m => m.visible = !hide); }
    camera.lookAt(CAM.look);
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; if (S.rubT > 0) S.rubT -= dt;
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    lampGl.forEach((s, i) => s.material.opacity = 0.55 + Math.sin(clock.elapsedTime * 2 + i) * 0.05);
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { FK.forEach(k => setStock(k, S.demo ? 99 : CAP())); S.phase = 'shift'; S.next = S.demo ? 0.5 : 1.5; flash('NOREN UP · DOORS OPEN!', '#22c55e', 1.4); sfx('start'); } }
    { const hide = (S.phase === 'shift' || S.phase === 'glide') && (CAM.t > 0.35 || !CAM.from); K.cut.forEach(m => m.visible = !hide); lampGl.forEach(s => s.visible = !hide); }
    const work = S.phase === 'shift';
    if (work) { S.t += dt; if (S.t >= MAKI.shift && !DM.on) endShift(); else if (!DM.on) { const left = MAKI.shift - S.t, sec = Math.ceil(left); AU.setMode(left < 30 ? 'rush' : 'shift'); if (left < 10 && sec !== S.lastTick) { S.lastTick = sec; sfx('tick', { pitch: left < 4 ? 1.25 : 1 }); } } }
    if (work) { S.steamT = (S.steamT || 0) - dt; if (S.steamT <= 0) { S.steamT = 0.55; puff(K.tub.x + rr(-0.06, 0.06), T + 0.16, K.tub.z, 0xffffff, 1); } }
    cups.forEach((c, i) => { const o = orders.find(q => q.spot === i && (q.st === 'wait' || q.st === 'pay' || q.st === 'eat')); c.visible = !!o; });
    { const u = chef.userData; if (u.moodT > 0) { u.moodT -= dt; if (u.moodT <= 0) u.mood = 'happy'; } u.talking = /^CHEF/.test(S.say) && S.sayT > 0; if (chef.visible && S.phase === 'shift') chef.rotation.y = damp(chef.rotation.y, Math.atan2(-CHEF_WORK.x, -0.8 - CHEF_WORK.z) + Math.sin(clock.elapsedTime * 0.4) * 0.35, 3, dt); }
    if (work) stepHold(dt);
    if (DM.on) demoStep(dt);
    updHint(dt); if (work) autoFollow();
    // soy bottle tilts over the dish while pouring
    { const pouring = S.hold && S.hold.kind === 'soy', tgt = pouring ? V3(K.dish.x + 0.13, T + 0.12, K.dish.z) : V3(K.soy.x, T, K.soy.z); soyB.position.lerp(tgt, Math.min(1, dt * 10)); soyB.rotation.z = damp(soyB.rotation.z, pouring ? 1.6 : 0, 10, dt);
      stream.visible = !!pouring && soyB.rotation.z > 1.2; if (stream.visible) { const top = soyB.position.y + 0.05, bot = T + 0.025 + Math.min(1, PL ? PL.soy : 0) * 0.02, h = Math.max(0.02, top - bot); stream.scale.set(1, h, 1); stream.position.set(K.dish.x + 0.02, bot + h / 2, K.dish.z); } }
    regDisp.visible = !!(S.pay || S.payOut);
    drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; sfx('coin', { vol: 0.35, pitch: 1.25 }); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const sp = K.spots[o.spot], to = V3(sp.cx * 1.08, K.ct + 0.03, sp.cz * 1.08); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    // diners
    if (work) { S.next -= dt; const maxQ = Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st === 'walk' || o.st === 'wait').length < maxQ && S.t < MAKI.shift - 12) { newOrder(); S.next = Math.max(10, 20 - S.day * 1.5) * rr(0.8, 1.2); } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot]; o.t = (o.t || 0) + dt; const moving = o.st === 'walk' || o.st === 'leave'; kit.animFox && kit.animFox(o.f, dt, moving ? 2 : 0);
      if (o.st === 'walk') { const dx = sp.x - o.f.position.x, dz = sp.z - o.f.position.z, d = Math.hypot(dx, dz); if (d > 0.05) { const v = Math.min(d, dt * 2.2); o.f.position.x += dx / d * v; o.f.position.z += dz / d * v; o.f.rotation.y = Math.atan2(dx, dz); } else { o.f.position.set(sp.x, 0, sp.z); o.st = 'wait'; say(CUSTOMERS[o.ci].name + ': "' + o.line + '"', 3.5); sfx('chime', { pan: -sp.x / 3 }); } }
      else if (o.st === 'wait' || o.st === 'pay' || o.st === 'eat') { o.f.rotation.y = damp(o.f.rotation.y, sp.a + Math.PI, 6, dt); if (o.st === 'wait' && work) { o.pat -= DM.on ? 0 : dt; o.f.userData.mood = o.pat / o.patMax < 0.3 ? 'angry' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; S.combo = 0; flash(CUSTOMERS[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); sfx('leave'); } }
        if (o.st === 'eat') { o.f.userData.mood = 'happy'; if (o.plates && o.t > 1.2) o.plates.scale.setScalar(Math.max(0.01, 1 - (o.t - 1.2) / 2.5)); if (o.t > 4) { o.st = 'leave'; o.t = 0; } } }
      else if (o.st === 'leave') { if (o.plates) { scene.remove(o.plates); o.plates = null; } const dx = 0 - o.f.position.x, dz = 5.2 - o.f.position.z, d = Math.hypot(dx, dz); if (d > 0.05) { const v = Math.min(d, dt * 2.4); o.f.position.x += dx / d * v; o.f.position.z += dz / d * v; o.f.rotation.y = Math.atan2(dx, dz); } if (o.t > 4 || d < 0.1) { o.f.visible = false; orders.splice(i, 1); } } }
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.rotation.y = damp(ben.rotation.y, 0.3, 4, dt); ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox && (kit.animFox(ben, dt, 0), kit.animFox(chef, dt, 0));
    if (greet && BP.arms && BP.arms[0]) { const w = performance.now() / 1000, arm = BP.arms[0]; arm.rotation.set(-0.25, 0, -2.55 + Math.sin(w * 7) * 0.32); }
  }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() {
    const ticket = o => ({ id: o.id, name: CUSTOMERS[o.ci].name, role: CUSTOMERS[o.ci].role, items: o.items.map(it => { const r = RECIPE(it.r); return { name: r.name, kind: r.kind === 'nigiri' ? 'NIGIRI · 2 PIECES' : 'MAKI · 6 PIECES', fills: fillsOf(r).map(k => ING(k).name.toLowerCase()).join(' · '), wasabi: !!it.wasabi }; }), total: o.total, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait' });
    const H = S.hold, rubbing = W.kind === 'maki' && !W.riceLock && (S.rub || (S.rubT > 0)) && W.rice > 0;
    const press = H && H.kind === 'soy' && PL ? meter('soy', PL.soy) : rubbing ? meter('rice', W.rice) : null;
    const mm = matMode(), wk = W.kind;
    return { phase: S.phase, day: S.day, left: Math.max(0, MAKI.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), tray: tray.map(it => itemName(it) + (it.wasabi ? '' : ' · no wasabi')),
      mat: !wk ? '' : wk === 'nigiri' ? 'Nigiri · pressed ' + Math.min(W.shaped, 9) + ' / ' + SHAPE_N + (W.fish ? ' · ' + FISH[W.fish].name.toLowerCase() : '') : 'Maki · rice ' + Math.round(W.rice * 100) + '%' + (W.fills.length ? ' · ' + W.fills.map(k => ING(k).name.toLowerCase()).join(' + ') : '') + (W.rolled ? ' · rolled ' + W.rolled + ' / ' + PUSHES() : '') + (W.cuts.length ? ' · cuts ' + W.cuts.length + ' / ' + CUTS_N : ''),
      plate: PL ? { name: itemName(PL), ginger: PL.ginger, wasabi: PL.wasabi, soy: PL.soyDone } : null,
      pay: S.pay ? { ...S.pay } : null, flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, uniform: !!save.flag('sushiUniform'),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), audio: AU.muted(), canExit: !!onExit, menu: avail().map(r => ({ name: r.name, price: r.price })), demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null, focus: S.focus, press,
      hint: HINT && HINT.text && !S.reveal && !S.react ? { text: HINT.text, station: HINT.station } : null,
      reveal: S.reveal ? { name: itemName(S.reveal.it), wasabi: S.reveal.it.wasabi, notes: S.reveal.it.notes, clean: S.reveal.it.clean, wasabiOk: S.reveal.wasabiOk !== false, wantWasabi: !!S.reveal.wantWasabi, who: S.reveal.who, completes: S.reveal.completes, missing: S.reveal.missing, ok: !!S.reveal.oid } : null,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip } : null, stock: { ...stock },
      badges: { fish: S.cut ? S.cut.cuts + ' / ' + SLICES() : S.sliced ? 'SLICED' : FK.some(k => stock[k] <= 0) && work() ? 'OUT' : '', roll: mm === 'rub' ? 'RICE ' + Math.round(W.rice * 100) + '%' : mm === 'roll' ? (W.rolled ? 'ROLL ' + W.rolled + ' / ' + PUSHES() : 'FILL ' + W.fills.length) : mm === 'cut' ? 'CUT ' + W.cuts.length + ' / ' + CUTS_N : mm === 'press' ? 'PRESS ' + Math.min(W.shaped, 9) + ' / ' + SHAPE_N : mm === 'idle' ? 'NORI' : '', plate: H && H.kind === 'soy' ? 'POURING' : PL ? (PL.soyDone ? 'READY' : 'GARNISH') : '', serve: tray.length ? 'PASS ' + tray.length : '', all: orders.filter(o => o.st === 'wait').length ? orders.filter(o => o.st === 'wait').length + ' WAIT' : '' } }; }
  function meter(k, v) { const D = HOLD_DEF[k]; return { label: D.label, d: v / D.max, zone: zoneAt(k, v), want: D.zones.find(z => z[4])[0], zones: D.zones.map(z => ({ name: z[0], w: Math.round((z[2] - z[1]) / D.max * 100), col: z[3], want: !!z[4] })) }; }
  const work = () => S.phase === 'shift';
  function emit() { onState(hud()); }
  rebuildMat(); frame();
  return { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } }, revealChoice: c => S.reveal && revealDone(c), setFocus(id) { if (S.focus !== id) sfx('ui', { vol: 0.6 }); setFocus(id); }, setMute: m => AU.setMute(m), audioState: () => AU.muted(), initAudio: () => AU.init(), canExit: !!onExit, exit() { AU.setMode('off'); AU.loopStop('pour'); onExit && onExit(); }, demoStart, demoStop, startShift, endShift, giveCoin, buyUpgrade, hud, setPaused(v) { PAUSE = !!v; },
    toIntro() { S.phase = 'intro'; S.done = null; setUniform(true); ben.visible = true; chefAt(false); AU.setMode('calm'); sfx('ui'); ben.position.copy(BEN_AT); ben.rotation.y = 0.3; glideTo(wideShot(), 1); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, MAKI.shift - t); }, _state: () => S,
    _auto() { return { orders, tray, W, K, get plate() { return PL; }, startMaki, tubTap, rubOnce, addFill, pushRoll, cutRoll, pressNigiri, addGarnish, startSoy, releaseHold, finishPlate, needCut, cutOnce, setStock, scr, serve, servePass }; },
    destroy() { AU.destroy(); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
