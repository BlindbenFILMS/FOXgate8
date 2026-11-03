// 8 GATES — MARLOW'S PET STORE [neboPetStore] · Nebo. An interior you can WALK AROUND as the fox, plus a PET GROOMING job.
// WALK: talk to Marlow (shop counter + the job), pet the puppies, Parsnip the truffle pig and Old Soot the shop cat, look in the aviary and the fish tank.
//   Game HUD (vehicle="petstore"): 1 PET · 2 TREAT · 3 JUMP, E = talk/use, stick or WASD to walk.
// JOB (like Jon's Boatworks): one pet at a time, no clock, scored on quality. 3 pets a day: DOG · CAT · TRUFFLE PIG.
//   Tasks, one touch gesture each: CALM (pet her head) · BRUSH (rub the knots) · SCRUB / MUD BATH (rub up a lather) · RINSE (drag the shower over the suds)
//   DRY (drag the dryer, the wet patches run away) · TRIM (trace the dotted line) · CLAWS (tap in the green) · HOOVES (rub to shine).
//   MOOD runs down while you work. Too low = WIGGLY: pet her head or flick a TREAT (drag from the jar and flick it at her mouth) to settle her.
// Save keys nebo.pets.*, flag petUniform. Built on engine/restaurant-kit.js (stage, camera fit, hint rings, uniform).
// MERGE: buildPetStore(ctx) builds the room at an origin (14 x 11 m, door on +z), returns colliders + interact spots + tick(); createPetGroom runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { createMusic } from './pet-music.js';
import { createSfx } from './pet-sfx.js';

export const PETSTORE = { name: "MARLOW'S PET STORE", room: 'neboPetStore', world: 'nebo', keeper: 'MARLOW', perDay: 3, size: { w: 14, d: 11 }, door: { x: 0, z: 5.5 } };
export const TASKS = {
  calm: { label: 'CALM', name: 'Calm her down first' }, brush: { label: 'BRUSH', name: 'Brush out the tangles' }, scrub: { label: 'SCRUB', name: 'Scrub up a lather' },
  mud: { label: 'MUD BATH', name: 'Rub on the warm mud' }, rinse: { label: 'RINSE', name: 'Rinse off the suds' }, dry: { label: 'DRY', name: 'Blow-dry the wet patches' },
  trim: { label: 'TRIM', name: 'Trim along the dotted line' }, claws: { label: 'CLAWS', name: 'Clip the claws' }, hooves: { label: 'HOOVES', name: 'Polish the hooves' } };
const ORDER = ['calm', 'brush', 'scrub', 'mud', 'rinse', 'dry', 'trim', 'claws', 'hooves'];
export const PET_TYPES = {
  dog: { kind: 'DOG', price: 14, decay: 0.010, mood0: 0.8, plan: [['brush', 'scrub', 'rinse', 'dry'], ['brush', 'scrub', 'rinse', 'dry', 'claws'], ['brush', 'scrub', 'rinse', 'dry', 'trim', 'claws']], names: ['BISCUIT', 'ACORN', 'MOSS', 'PEBBLE', 'CONKER'],
    looks: [{ fur: '#c98a3e', dark: '#8a5a24', belly: '#f3dcb0' }, { fur: '#6b4630', dark: '#3f2818', belly: '#d9b48a' }, { fur: '#ece6dc', dark: '#9a7a5a', belly: '#ffffff' }] },
  cat: { kind: 'CAT', price: 16, decay: 0.019, mood0: 0.16, plan: [['calm', 'brush', 'trim', 'claws'], ['calm', 'brush', 'trim', 'claws'], ['calm', 'brush', 'trim', 'claws']], names: ['THIMBLE', 'NUTMEG', 'WISP', 'SOOTY'],
    looks: [{ fur: '#8a8c94', dark: '#55575e', belly: '#ebe6de' }, { fur: '#e8913a', dark: '#b45f1c', belly: '#fbe3c6', stripes: '#b45f1c' }, { fur: '#3a3836', dark: '#1c1b1a', belly: '#6a6560' }] },
  pig: { kind: 'TRUFFLE PIG', price: 18, decay: 0.007, mood0: 0.85, plan: [['mud', 'rinse', 'hooves'], ['mud', 'rinse', 'dry', 'hooves'], ['mud', 'rinse', 'dry', 'hooves']], names: ['PARSNIP', 'TRUFFLE', 'RADISH'],
    looks: [{ fur: '#f2a7a0', dark: '#c97b74', belly: '#f9c9c2' }, { fur: '#e9b98f', dark: '#b8835a', belly: '#f6d6b6', spots: '#6a4a3a' }] } };
export const UPGRADES = [
  { id: 'brush', name: 'SOFT BOAR BRUSH', cost: 35, line: 'Tangles come out twice as fast.' },
  { id: 'shampoo', name: 'HONEYCOMB SHAMPOO', cost: 30, line: 'Suds and mud build twice as fast.' },
  { id: 'dryer', name: 'WARM-AIR DRYER', cost: 40, line: 'Wet patches dry faster and run less.' },
  { id: 'clippers', name: 'SHARP CLIPPERS', cost: 35, line: 'The green zone on CLAWS is wider.' },
  { id: 'pouch', name: 'TREAT POUCH', cost: 25, line: '+2 treats with every pet.' },
  { id: 'music', name: 'LANTERN MUSIC BOX', cost: 60, line: 'Owners tip 25% more.' }];
const OWNERS = [
  { name: 'ROWAN', torso: ['#3f6b4a', '#e6b45a', '#24402c'] }, { name: 'PICA', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#d9b45a', '#fbf8ec', '#8a6a2a'], outfit: 'coat' },
  { name: 'TARN', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#5a7a8c', '#d7dde3', '#2a3a44'] }, { name: 'ASPEN', torso: ['#9fd8b8', '#fbf8ec', '#357a55'] },
  { name: 'WREN', fur: '#c9682a', furDark: '#8a4213', torso: ['#a8532e', '#f2c94c', '#5a2a16'], outfit: 'coat' }, { name: 'FABLE', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#7a5aa8', '#ede9fe', '#3a2a5a'] },
  { name: 'NETTLE', torso: ['#2f6b55', '#d9b45a', '#1c4732'] }, { name: 'SEDGE', fur: '#9a9a9e', furDark: '#6a6a70', torso: ['#6a5a3a', '#e8d6a8', '#3a301e'], outfit: 'coat' }];
const HELLO = ['Rolled in something by the river again. Sorry!', 'Be gentle. This one is my best friend.', 'Marlow says you are the new hand. Make them shine!', 'No rush. Take your time.', 'Back from the woods, covered in burrs.'];
const PARSNIP_HELLO = 'Parsnip found three truffles and rolled in every puddle on the way back. She wants her spa day.';
const TIP = { calm: 'MARLOW: "Cats decide when the groom starts. Pet her head until she settles."', brush: 'MARLOW: "Rub over each knot until it pops out."', scrub: 'MARLOW: "Rub every dirty spot until it is all suds."',
  mud: 'MARLOW: "She LOVES the warm mud. Rub it on all over. Pigs are funny like that."', rinse: 'MARLOW: "Hold the shower over the suds. Never in the face!"', dry: 'MARLOW: "Wet patches run from the dryer. Chase them down!"',
  trim: 'MARLOW: "Start on the glowing dot and trace the line to the neck. Stay on it."', claws: 'MARLOW: "Tap when the needle is in the green. Too close and they yelp."', hooves: 'MARLOW: "Rub each hoof until it shines."' };
const SAVE = { day: 'nebo.pets.day', best: 'nebo.pets.best', upg: 'nebo.pets.upg.', stars: 'nebo.pets.stars', groomed: 'nebo.pets.groomed' };
export const SHOP = [
  { id: 'petTreats', label: 'Bag of Treats', price: 4 }, { id: 'squeakyAcorn', label: 'Squeaky Acorn', price: 8 }, { id: 'leafCollar', label: 'Leaf Collar', price: 15 },
  { id: 'erToGo', label: "Vet's Kit", price: 12 }, { id: 'chocolates', label: 'Sack of Feed', price: 15 }, { id: 'trufflePig', label: 'Parsnip the truffle pig, for the day', price: 30 }];
const TY = 1.05, CLAW_G = [0.42, 0.6], CLAW_G2 = [0.37, 0.65];

// ---------------- the room ----------------
export function buildPetStore(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, grad } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 7, D = 5.5, H = 4.4, Y = { root, front: [], colliders: [], anim: { birds: [], fish: [], bubbles: [], lamps: [], plants: [] }, W, D, H };
  const TT = (map, x = 1, y = 1) => { map.wrapS = map.wrapT = T3.RepeatWrapping; map.repeat.set(x, y); return new T3.MeshToonMaterial({ map, gradientMap: grad }); };
  const ink = toon('#201e1d'), wood = toon('#8a5a32'), woodL = toon('#c49a62'), woodD = toon('#4a2e18'), green = toon('#3f6b4a'), greenD = toon('#1c4732'), gold = toon('#d9b45a'), cream = toon('#fbf8ec'), steel = toon('#9aa3a8');
  const box = (w, h, d, mat, x, y, z, ol = 0.012, par = root) => M(new T3.BoxGeometry(w, h, d), mat, x, y, z, par, ol);
  const cyl = (r, h, mat, x, y, z, ol = 0.008, par = root, r2 = r, seg = 12) => M(new T3.CylinderGeometry(r, r2, h, seg), mat, x, y, z, par, ol, r);
  const col = (x0, x1, z0, z1) => Y.colliders.push({ x0, x1, z0, z1 });
  // floor: honey planks
  const plankT = CTX(256, 256, c => { c.fillStyle = '#c99a5e'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = ['#c49258', '#d2a468', '#bd8c52'][i % 3]; c.fillRect(0, i * 32, 256, 30); c.fillStyle = '#7a5230'; c.fillRect(0, i * 32 + 30, 256, 2); c.fillRect((i * 97) % 256, i * 32, 2, 30); c.fillStyle = '#a87a44'; for (let k = 0; k < 4; k++) c.fillRect((i * 53 + k * 71) % 256, i * 32 + 8 + k * 4, 18, 1); } });
  const floor = new T3.Mesh(new T3.PlaneGeometry(W * 2, D * 2), TT(plankT, 4, 4)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; root.add(floor);
  // log walls (round timber lodge), green wainscot with a gold rail
  const logT = CTX(256, 256, c => { for (let i = 0; i < 8; i++) { const y = i * 32, gr = c.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, '#6e4428'); gr.addColorStop(0.35, '#a8743f'); gr.addColorStop(0.7, '#8a5a32'); gr.addColorStop(1, '#4a2e18'); c.fillStyle = gr; c.fillRect(0, y, 256, 32); c.fillStyle = 'rgba(60,36,18,0.45)'; for (let k = 0; k < 6; k++) c.fillRect((i * 61 + k * 43) % 256, y + 10 + (k % 3) * 5, 26, 2); } });
  const wallM = TT(logT, 4, 1.4), wallMs = TT(logT.clone(), 3, 1.4); wallMs.map.needsUpdate = true;
  const back = new T3.Mesh(new T3.PlaneGeometry(W * 2, H), wallM); back.position.set(0, H / 2, -D); root.add(back);
  for (const s of [-1, 1]) { const w = new T3.Mesh(new T3.PlaneGeometry(D * 2, H), wallMs); w.position.set(s * W, H / 2, 0); w.rotation.y = -s * Math.PI / 2; root.add(w); }
  { const fc = root.children.length; for (const s of [-1, 1]) { const w = new T3.Mesh(new T3.PlaneGeometry(W - 1.2, H), wallMs); w.position.set(s * (1.2 + (W - 1.2) / 2), H / 2, D); w.rotation.y = Math.PI; root.add(w); } const top = new T3.Mesh(new T3.PlaneGeometry(2.4, H - 3), wallMs); top.position.set(0, 3 + (H - 3) / 2, D); top.rotation.y = Math.PI; root.add(top);
    for (const s of [-1, 1]) box(0.2, 3, 0.3, woodD, s * 1.22, 1.5, D, 0.01); box(2.64, 0.24, 0.3, woodD, 0, 3.05, D, 0.01); Y.front.push(...root.children.slice(fc)); }
  box(W * 2, 1.0, 0.06, green, 0, 0.5, -D + 0.03, 0); box(W * 2, 0.07, 0.1, gold, 0, 1.02, -D + 0.05, 0);
  for (const s of [-1, 1]) { box(0.06, 1.0, D * 2, green, s * (W - 0.03), 0.5, 0, 0); box(0.1, 0.07, D * 2, gold, s * (W - 0.05), 1.02, 0, 0); }
  Y.overhead = []; for (const z of [-2.6, 1.4]) Y.overhead.push(box(W * 2, 0.22, 0.26, woodD, 0, H - 0.11, z, 0.01));
  for (const [x, z] of [[-W + 0.15, -D + 0.15], [W - 0.15, -D + 0.15]]) box(0.3, H, 0.3, woodD, x, H / 2, z, 0.01);
  // window over the grooming table: dusk forest outside
  const winT = CTX(256, 160, c => { const gr = c.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, '#f6d58a'); gr.addColorStop(0.55, '#c9d79a'); gr.addColorStop(1, '#6e9a6a'); c.fillStyle = gr; c.fillRect(0, 0, 256, 160);
    c.fillStyle = '#2f4a32'; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(i * 42 + 10, 96 + (i % 2) * 12, 34, 0, 7); c.fill(); } c.fillStyle = '#1c2e1e'; for (let i = 0; i < 6; i++) c.fillRect(i * 46 + 18, 100, 8, 60); c.fillStyle = '#ffd27a'; c.beginPath(); c.arc(180, 112, 5, 0, 7); c.fill();
    c.fillStyle = '#4a2e18'; c.fillRect(0, 0, 256, 8); c.fillRect(0, 152, 256, 8); c.fillRect(0, 0, 8, 160); c.fillRect(248, 0, 8, 160); c.fillRect(124, 0, 8, 160); c.fillRect(0, 76, 256, 8); });
  { const w = new T3.Mesh(new T3.PlaneGeometry(2.3, 1.4), new T3.MeshBasicMaterial({ map: winT })); w.position.set(-3.6, 2.75, -D + 0.02); root.add(w); box(2.5, 0.1, 0.22, woodD, -3.6, 2.0, -D + 0.1, 0.008); }
  // sign + N banners
  const signT = CTX(1024, 200, c => { c.fillStyle = '#1c4732'; c.fillRect(0, 0, 1024, 200); c.fillStyle = '#d9b45a'; c.fillRect(0, 0, 1024, 12); c.fillRect(0, 188, 1024, 12); c.beginPath(); c.arc(100, 100, 62, 0, 7); c.fill(); c.fillStyle = '#1c4732'; c.font = '900 84px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', 100, 104); c.fillStyle = '#fbf8ec'; c.font = '900 80px Archivo, "Arial Black", Arial'; c.fillText("MARLOW'S PET STORE", 580, 104); });
  { const s = new T3.Mesh(new T3.PlaneGeometry(4.2, 0.82), new T3.MeshBasicMaterial({ map: signT })); s.position.set(3.6, 3.45, -D + 0.03); root.add(s); }
  const banT = CTX(128, 256, c => { c.fillStyle = '#2f6b55'; c.fillRect(0, 0, 128, 220); c.beginPath(); c.moveTo(0, 220); c.lineTo(64, 256); c.lineTo(128, 220); c.fill(); c.fillStyle = '#d9b45a'; c.fillRect(0, 0, 128, 10); c.font = '900 110px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', 64, 120); });
  for (const [x, z, ry] of [[-W + 0.04, -2.2, Math.PI / 2], [W - 0.04, 1.9, -Math.PI / 2]]) { const b = new T3.Mesh(new T3.PlaneGeometry(0.75, 1.5), new T3.MeshBasicMaterial({ map: banT, transparent: true })); b.position.set(x, 3.1, z); b.rotation.y = ry; root.add(b); }
  // rug + welcome mat
  const rugT = CTX(256, 256, c => { c.fillStyle = '#2f6b55'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = '#d9b45a'; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 108, 0, 7); c.stroke(); c.lineWidth = 3; c.beginPath(); c.arc(128, 128, 92, 0, 7); c.stroke(); c.fillStyle = '#d9b45a'; c.font = '900 120px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', 128, 134);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, x = 128 + Math.cos(a) * 100, y = 128 + Math.sin(a) * 100; c.beginPath(); c.arc(x, y, 7, 0, 7); c.fill(); } });
  { const r = new T3.Mesh(new T3.CircleGeometry(2.1, 40), new T3.MeshToonMaterial({ map: rugT, gradientMap: grad, transparent: true })); r.rotation.x = -Math.PI / 2; r.position.set(0.6, 0.012, 0.9); r.receiveShadow = true; root.add(r); }
  const matT = CTX(256, 128, c => { c.fillStyle = '#7a5230'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#d9b45a'; c.lineWidth = 6; c.strokeRect(8, 8, 240, 112); c.fillStyle = '#fbf8ec'; c.font = '900 40px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WELCOME', 128, 66); });
  { const m = new T3.Mesh(new T3.PlaneGeometry(2.0, 1.0), new T3.MeshToonMaterial({ map: matT, gradientMap: grad })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.014, 4.7); root.add(m); }
  // lanterns (hand-lit, Nebo)
  for (const [x, z] of [[-3.6, -1.4], [3.2, -1.4], [-1.6, 2.6], [2.4, 2.6]]) { const g = new T3.Group(); g.position.set(x, 3.45, z); root.add(g); cyl(0.015, H - 3.75, ink, 0, (H - 3.45) / 2 + 0.2, 0, 0, g, 0.015, 4);
    box(0.36, 0.06, 0.36, woodD, 0, 0.22, 0, 0.008, g); box(0.36, 0.06, 0.36, woodD, 0, -0.22, 0, 0.008, g); for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) box(0.04, 0.44, 0.04, woodD, a * 0.16, 0, b * 0.16, 0, g);
    const core = new T3.Mesh(new T3.BoxGeometry(0.26, 0.36, 0.26), new T3.MeshBasicMaterial({ color: 0xffd27a })); g.add(core); M(new T3.ConeGeometry(0.28, 0.2, 4), woodD, 0, 0.35, 0, g, 0.008).rotation.y = Math.PI / 4; Y.anim.lamps.push(core); (Y.lanterns = Y.lanterns || []).push(g); }
  // ---------- grooming station (back left) ----------
  const T = { x: -3.6, z: -3.0 }; Y.table = { ...T, y: TY };
  for (const [a, b] of [[-0.88, -0.48], [-0.88, 0.48], [0.88, -0.48], [0.88, 0.48]]) cyl(0.05, TY - 0.1, steel, T.x + a, (TY - 0.1) / 2, T.z + b, 0.006);
  box(2.0, 0.08, 1.15, toon('#2f6b55'), T.x, TY - 0.06, T.z, 0.015); box(1.9, 0.02, 1.05, greenD, T.x, TY - 0.01, T.z, 0);
  box(2.0, 0.1, 0.05, toon('#2f6b55'), T.x, TY + 0.03, T.z - 0.57, 0.006); for (const s of [-1, 1]) box(0.05, 0.1, 1.15, toon('#2f6b55'), T.x + s * 0.98, TY + 0.03, T.z, 0.006);
  box(1.8, 0.05, 0.9, steel, T.x, 0.32, T.z, 0.006); [['#e2453f', -0.6], ['#f2c94c', -0.2], ['#9fd8b8', 0.2], ['#fbf8ec', 0.6]].forEach(([c, x]) => box(0.34, 0.16, 0.5, toon(c), T.x + x, 0.43, T.z, 0.006));
  { const px = T.x - 0.92, pz = T.z - 0.5; cyl(0.04, 2.4, steel, px, TY + 1.2, pz, 0.006); box(0.9, 0.05, 0.05, steel, px + 0.45, TY + 2.38, pz, 0.006); M(new T3.TorusGeometry(0.12, 0.02, 6, 16), toon('#e2453f'), px + 0.85, TY + 2.15, pz, root, 0.004); }
  { const fx = T.x - 1.1; cyl(0.04, 0.5, steel, fx, 1.9, -D + 0.12, 0.006).rotation.x = Math.PI / 2; cyl(0.08, 0.08, toon('#e2453f'), fx, 1.9, -D + 0.38, 0.006).rotation.x = Math.PI / 2; for (let i = 0; i < 3; i++) M(new T3.TorusGeometry(0.2, 0.025, 6, 18), toon('#1f3a5f'), fx + 0.02 * i, 1.35 - i * 0.04, -D + 0.25, root, 0.004); }
  { const dx = T.x - 1.6, dz = T.z + 0.75; cyl(0.28, 0.06, steel, dx, 0.03, dz, 0.006); cyl(0.035, 1.7, steel, dx, 0.88, dz, 0.006); const hood = M(new T3.CylinderGeometry(0.12, 0.2, 0.42, 14), toon('#f2c94c'), dx + 0.15, 1.78, dz - 0.1, root, 0.008); hood.rotation.z = Math.PI / 2 + 0.3; col(dx - 0.3, dx + 0.3, dz - 0.3, dz + 0.3); }
  { const cx = T.x + 1.55, cz = T.z - 0.95; box(0.7, 0.05, 0.5, steel, cx, 0.9, cz, 0.006); box(0.7, 0.05, 0.5, steel, cx, 0.4, cz, 0.006); for (const [a, b] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) cyl(0.02, 0.9, steel, cx + a * 0.32, 0.45, cz + b * 0.22, 0);
    for (let i = 0; i < 3; i++) { cyl(0.06, 0.24, toon(['#f2c94c', '#e6b45a', '#9fd8b8'][i]), cx - 0.2 + i * 0.2, 1.05, cz, 0.006); cyl(0.03, 0.05, cream, cx - 0.2 + i * 0.2, 1.19, cz, 0); } col(cx - 0.4, cx + 0.4, cz - 0.3, cz + 0.3); }
  col(T.x - 1.05, T.x + 1.05, T.z - 0.62, T.z + 0.62); col(-W, T.x + 1.2, -D, T.z - 0.62);
  // ---------- counter (back right) ----------
  const C = { x: 3.6, z: -3.7 }; Y.counter = C;
  box(3.4, 1.05, 0.9, wood, C.x, 0.525, C.z, 0.015); box(3.2, 0.72, 0.02, green, C.x, 0.55, C.z + 0.46, 0); box(3.6, 0.08, 1.05, woodL, C.x, 1.09, C.z, 0.012);
  { const n = new T3.Mesh(new T3.CircleGeometry(0.26, 24), new T3.MeshBasicMaterial({ map: CTX(128, 128, c => { c.fillStyle = '#d9b45a'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.fillStyle = '#1c4732'; c.font = '900 88px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('N', 64, 70); }) })); n.position.set(C.x, 0.58, C.z + 0.475); root.add(n); }
  box(0.55, 0.32, 0.42, ink, C.x + 1.05, 1.29, C.z - 0.05, 0.008); box(0.4, 0.14, 0.04, toon('#22c55e'), C.x + 1.05, 1.5, C.z - 0.2, 0.004);
  const jarM = new T3.MeshBasicMaterial({ color: 0xdff2f8, transparent: true, opacity: 0.35, depthWrite: false });
  [['#e6b45a', -1.25], ['#e2453f', -0.8], ['#9fd8b8', -0.35]].forEach(([c, x]) => { const j = new T3.Mesh(new T3.CylinderGeometry(0.15, 0.15, 0.3, 14), jarM); j.position.set(C.x + x, 1.28, C.z + 0.1); root.add(j); cyl(0.13, 0.16, toon(c), C.x + x, 1.21, C.z + 0.1, 0); cyl(0.16, 0.04, woodD, C.x + x, 1.45, C.z + 0.1, 0.004); });
  { box(2.4, 1.0, 0.06, woodL, C.x, 2.15, -D + 0.05, 0.008); ['#e2453f', '#f2c94c', '#2f9a8f', '#7a5aa8', '#e6b45a', '#1f3a5f'].forEach((c, i) => { M(new T3.TorusGeometry(0.12, 0.03, 6, 16), toon(c), C.x - 0.95 + i * 0.38, 2.15, -D + 0.12, root, 0.004); box(0.03, 0.08, 0.06, steel, C.x - 0.95 + i * 0.38, 2.3, -D + 0.1, 0); }); }
  col(C.x - 1.8, C.x + 1.8, -D, C.z + 0.5);
  // ---------- shelves (back middle) ----------
  { const sx = -0.3, sz = -5.1; for (const s of [-1, 1]) box(0.08, 2.3, 0.7, woodD, sx + s * 1.5, 1.15, sz, 0.008); for (let i = 0; i < 4; i++) box(3.0, 0.06, 0.7, woodL, sx, 0.15 + i * 0.68, sz, 0.006);
    const sackT = CTX(128, 128, c => { c.fillStyle = '#d9c08a'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#2f6b55'; c.fillRect(0, 40, 128, 50); c.fillStyle = '#fbf8ec'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.fillText('FEED', 64, 76); }), sackM = new T3.MeshToonMaterial({ map: sackT, gradientMap: grad });
    for (let i = 0; i < 4; i++) box(0.5, 0.56, 0.35, sackM, sx - 1.1 + i * 0.72, 0.46, sz + 0.05, 0.01);
    ['#e2453f', '#f2c94c', '#2f9a8f', '#7a5aa8', '#e6b45a'].forEach((c, i) => M(new T3.SphereGeometry(0.12, 12, 8), toon(c), sx - 1.2 + i * 0.6, 0.98, sz + 0.1, root, 0.008, 0.12));
    for (let i = 0; i < 6; i++) { const b = box(0.3, 0.05, 0.08, cream, sx - 1.2 + i * 0.48, 1.55, sz + 0.1, 0.004); b.rotation.y = 0.4; }
    for (let i = 0; i < 5; i++) cyl(0.1, 0.3, toon(['#9fd8b8', '#f2c94c', '#e2453f', '#1f3a5f', '#e6b45a'][i]), sx - 1.2 + i * 0.6, 2.2, sz + 0.05, 0.006);
    col(sx - 1.6, sx + 1.6, -D, sz + 0.4); }
  // ---------- aviary (right wall) ----------
  { const x0 = 5.2, x1 = 6.95, z0 = -1.8, z1 = 1.4, h = 3.1, meshT = CTX(64, 64, c => { c.clearRect(0, 0, 64, 64); c.strokeStyle = '#2a2826'; c.lineWidth = 3; for (let i = 0; i <= 64; i += 16) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 64); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(64, i); c.stroke(); } });
    meshT.wrapS = meshT.wrapT = T3.RepeatWrapping; const mm = (w, hh) => { const t = meshT.clone(); t.needsUpdate = true; t.repeat.set(w * 4, hh * 4); return new T3.MeshBasicMaterial({ map: t, transparent: true, alphaTest: 0.3, side: T3.DoubleSide }); };
    const fx = new T3.Mesh(new T3.PlaneGeometry(z1 - z0, h), mm(z1 - z0, h)); fx.position.set(x0, h / 2, (z0 + z1) / 2); fx.rotation.y = Math.PI / 2; root.add(fx);
    for (const z of [z0, z1]) { const p = new T3.Mesh(new T3.PlaneGeometry(x1 - x0, h), mm(x1 - x0, h)); p.position.set((x0 + x1) / 2, h / 2, z); root.add(p); }
    for (const [x, z] of [[x0, z0], [x0, z1], [x0, -0.6], [x0, 0.2]]) box(0.1, h, 0.1, woodD, x, h / 2, z, 0.006); box(0.12, 0.12, z1 - z0, woodD, x0, h, (z0 + z1) / 2, 0.006); box(x1 - x0, 0.12, 0.12, woodD, (x0 + x1) / 2, h, z0, 0.006); box(x1 - x0, 0.12, 0.12, woodD, (x0 + x1) / 2, h, z1, 0.006);
    box(0.06, 0.08, 0.8, gold, x0 - 0.02, 1.0, -0.2, 0); const sg = new T3.Mesh(new T3.PlaneGeometry(1.1, 0.34), new T3.MeshBasicMaterial({ map: CTX(256, 80, c => { c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 256, 80); c.strokeStyle = '#1c4732'; c.lineWidth = 6; c.strokeRect(3, 3, 250, 74); c.fillStyle = '#1c4732'; c.font = '900 24px Archivo, Arial'; c.textAlign = 'center'; c.fillText('MIND THE', 128, 34); c.fillText('AVIARY DOOR', 128, 62); }) })); sg.position.set(x0 - 0.07, 2.35, -0.2); sg.rotation.y = -Math.PI / 2; root.add(sg);
    const perch = [[6.2, 1.1, -1.2, -0.2], [6.2, 1.8, -0.4, 1.0], [6.4, 2.5, -1.4, 0.6]]; perch.forEach(([x, y, a, b]) => cyl(0.03, b - a, woodL, x, y, (a + b) / 2, 0.004).rotation.x = Math.PI / 2);
    cyl(0.18, 0.1, gold, 6.5, 0.6, 0.6, 0.006); const slots = []; perch.forEach(([x, y, a, b]) => { for (let k = 0; k < 3; k++) slots.push(new T3.Vector3(x, y + 0.05, a + 0.2 + (b - a - 0.4) * k / 2)); });
    const birdC = [['#f2c94c', '#e6912a'], ['#38bdf8', '#1f3a5f'], ['#e2453f', '#8a1c14'], ['#7fc39c', '#2f6b55'], ['#fbf8ec', '#e2453f']];
    birdC.forEach(([a, b], i) => { const g = new T3.Group(); root.add(g); const bd = M(new T3.SphereGeometry(0.09, 10, 8), toon(a), 0, 0.07, 0, g, 0.01, 0.09); bd.scale.set(1.25, 1, 0.9); M(new T3.SphereGeometry(0.065, 10, 8), toon(a), 0.09, 0.16, 0, g, 0.008, 0.065); M(new T3.ConeGeometry(0.025, 0.07, 6), toon('#e6912a'), 0.17, 0.155, 0, g, 0).rotation.z = -Math.PI / 2;
      for (const s of [-1, 1]) { const e = new T3.Mesh(new T3.SphereGeometry(0.014, 6, 4), ink); e.position.set(0.12, 0.18, s * 0.045); g.add(e); } const tl = box(0.12, 0.02, 0.06, toon(b), -0.13, 0.1, 0, 0, g); tl.rotation.z = 0.4; const wings = [-1, 1].map(s => { const w = box(0.13, 0.02, 0.08, toon(b), -0.01, 0.1, s * 0.07, 0, g); return w; });
      const s0 = slots[(i * 2) % slots.length]; g.position.copy(s0); Y.anim.birds.push({ g, wings, slot: (i * 2) % slots.length, from: s0.clone(), to: s0.clone(), t: 1, wait: rr(1, 4), flap: 0 }); });
    Y.anim.birdSlots = slots; Y.anim.aviary = { x0: x0 + 0.2, x1: x1 - 0.2, z0: z0 + 0.2, z1: z1 - 0.2, y0: 0.6, y1: h - 0.4 };
    col(x0 - 0.1, W, z0 - 0.1, z1 + 0.1); }
  // ---------- fish tank (right wall, front) ----------
  { const x0 = 6.1, x1 = 6.95, z0 = 2.1, z1 = 4.7, y0 = 0.82, y1 = 1.85, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    box(x1 - x0 + 0.08, y0, z1 - z0 + 0.08, wood, cx, y0 / 2, cz, 0.012); box(x1 - x0 + 0.1, 0.06, z1 - z0 + 0.1, woodD, cx, y1 + 0.03, cz, 0.006);
    const water = new T3.Mesh(new T3.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), new T3.MeshBasicMaterial({ color: 0x5fb8d8, transparent: true, opacity: 0.32, depthWrite: false })); water.position.set(cx, (y0 + y1) / 2, cz); root.add(water);
    box(x1 - x0 - 0.02, 0.08, z1 - z0 - 0.02, toon('#e8d6a8'), cx, y0 + 0.04, cz, 0); const lid = new T3.Mesh(new T3.BoxGeometry(0.1, 0.04, z1 - z0 - 0.2), new T3.MeshBasicMaterial({ color: 0xe0f6ff })); lid.position.set(cx, y1 - 0.02, cz); root.add(lid);
    for (let i = 0; i < 6; i++) { const p = M(new T3.ConeGeometry(0.06, rr(0.3, 0.6), 5), toon(i % 2 ? '#3f8a4a' : '#5fae5a'), rr(x0 + 0.15, x1 - 0.1), y0 + 0.25, z0 + 0.2 + i * 0.42, root, 0.004); Y.anim.plants.push(p); }
    M(new T3.SphereGeometry(0.15, 8, 6), toon('#8a847e'), cx + 0.1, y0 + 0.12, cz - 0.4, root, 0.006, 0.15).scale.y = 0.6;
    ['#f2741f', '#f2c94c', '#38bdf8', '#e2453f', '#fbf8ec', '#f2741f', '#7fc39c'].forEach((c, i) => { const g = new T3.Group(); root.add(g); const b = new T3.Mesh(new T3.SphereGeometry(0.06, 8, 6), toon(c)); b.scale.set(1.6, 1, 0.55); g.add(b); const tl = new T3.Mesh(new T3.ConeGeometry(0.05, 0.08, 4), toon(c)); tl.rotation.z = Math.PI / 2; tl.position.x = -0.12; g.add(tl);
      Y.anim.fish.push({ g, cx, cz, rx: (x1 - x0) / 2 - 0.12, rz: (z1 - z0) / 2 - 0.15, y: y0 + 0.25 + (i % 4) * 0.17, sp: rr(0.4, 0.9) * (i % 2 ? 1 : -1), ph: i * 0.9, boost: 0 }); });
    for (let i = 0; i < 6; i++) { const b = new T3.Mesh(new T3.SphereGeometry(0.02, 6, 4), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); b.position.set(x0 + 0.3, y0 + 0.1 + i * 0.15, z0 + 0.3); root.add(b); Y.anim.bubbles.push({ m: b, y0: y0 + 0.1, y1: y1 - 0.1 }); }
    Y.anim.tank = { x0, x1, z0, z1, y0, y1 }; col(x0 - 0.1, W, z0 - 0.1, z1 + 0.1); }
  // ---------- cat tree (back right corner) ----------
  { const cx = 6.25, cz = -4.6; box(0.9, 0.1, 0.9, greenD, cx, 0.05, cz, 0.008); cyl(0.12, 1.6, toon('#d9c08a'), cx, 0.85, cz, 0.006); cyl(0.42, 0.08, green, cx, 0.85, cz + 0.1, 0.008, root, 0.42, 16); cyl(0.46, 0.08, green, cx, 1.62, cz, 0.008, root, 0.46, 16);
    M(new T3.TorusGeometry(0.3, 0.1, 8, 18), toon('#e2453f'), cx, 1.72, cz, root, 0.006).rotation.x = Math.PI / 2; Y.catTop = { x: cx, y: 1.68, z: cz }; col(cx - 0.55, W, -D, cz + 0.55); }
  // ---------- puppy pen + Parsnip's stall (left wall) ----------
  const fence = (x1, z0, z1, label) => { const fc = []; for (let z = z0; z <= z1 + 0.01; z += (z1 - z0) / 4) fc.push(cyl(0.05, 0.85, woodD, x1, 0.42, z, 0.005)); for (let x = -W + 0.3; x < x1; x += 0.8) for (const z of [z0, z1]) cyl(0.04, 0.75, woodD, x, 0.37, z, 0.004);
    for (const y of [0.35, 0.7]) { box(0.06, 0.07, z1 - z0, woodL, x1, y, (z0 + z1) / 2, 0.004); for (const z of [z0, z1]) box(x1 + W, 0.07, 0.06, woodL, (x1 - W) / 2, y, z, 0.004); }
    if (label) { const s = new T3.Mesh(new T3.PlaneGeometry(0.9, 0.26), new T3.MeshBasicMaterial({ map: CTX(256, 72, c => { c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 256, 72); c.strokeStyle = '#4a2e18'; c.lineWidth = 6; c.strokeRect(3, 3, 250, 66); c.fillStyle = '#4a2e18'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.fillText(label, 128, 48); }) })); s.position.set(x1 + 0.05, 0.55, (z0 + z1) / 2); s.rotation.y = Math.PI / 2; root.add(s); }
    col(-W, x1 + 0.1, z0 - 0.1, z1 + 0.1); };
  fence(-4.5, -1.3, 1.9, 'PUPPIES'); fence(-4.5, 2.6, 5.4, 'PARSNIP');
  M(new T3.TorusGeometry(0.35, 0.12, 8, 18), toon('#e2453f'), -6.3, 0.1, -0.6, root, 0.006).rotation.x = Math.PI / 2; cyl(0.32, 0.06, toon('#fbf8ec'), -6.3, 0.04, -0.6, 0);
  M(new T3.SphereGeometry(0.1, 10, 8), toon('#f2c94c'), -5.2, 0.1, 1.2, root, 0.006, 0.1);
  const strawT = CTX(128, 128, c => { c.fillStyle = '#e6c46a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#c9a24a'; c.lineWidth = 2; for (let i = 0; i < 70; i++) { const x = (i * 37) % 128, y = (i * 59) % 128; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 12, y + ((i % 3) - 1) * 5); c.stroke(); } });
  { const s = new T3.Mesh(new T3.PlaneGeometry(2.4, 2.7), TT(strawT, 2, 2)); s.rotation.x = -Math.PI / 2; s.position.set(-5.75, 0.016, 4.0); root.add(s); box(0.4, 0.25, 1.1, woodD, -6.6, 0.13, 4.6, 0.008); box(0.32, 0.05, 1.0, toon('#6a4a2a'), -6.6, 0.24, 4.6, 0); }
  Y.pen = { x0: -6.6, x1: -4.9, z0: -0.9, z1: 1.5 }; Y.stall = { x0: -6.5, x1: -4.9, z0: 3.0, z1: 5.0 };
  // ---------- polish: lantern halos, window light + dust, plants, mushrooms, a warm pool of light on the table ----------
  const glowT = CTX(64, 64, c => { const g0 = c.createRadialGradient(32, 32, 0, 32, 32, 32); g0.addColorStop(0, 'rgba(255,220,150,0.9)'); g0.addColorStop(0.4, 'rgba(255,190,110,0.35)'); g0.addColorStop(1, 'rgba(255,170,90,0)'); c.fillStyle = g0; c.fillRect(0, 0, 64, 64); });
  Y.lanterns.forEach(l => { const h = new T3.Sprite(new T3.SpriteMaterial({ map: glowT, transparent: true, depthWrite: false, blending: T3.AdditiveBlending })); h.scale.setScalar(1.5); l.add(h); });
  { const shaftT = CTX(64, 128, c => { const g0 = c.createLinearGradient(0, 0, 0, 128); g0.addColorStop(0, 'rgba(255,236,170,0.32)'); g0.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = g0; c.fillRect(0, 0, 64, 128); const g1 = c.createLinearGradient(0, 0, 64, 0); g1.addColorStop(0, 'rgba(0,0,0,1)'); g1.addColorStop(0.2, 'rgba(0,0,0,0)'); g1.addColorStop(0.8, 'rgba(0,0,0,0)'); g1.addColorStop(1, 'rgba(0,0,0,1)'); c.globalCompositeOperation = 'destination-out'; c.fillStyle = g1; c.fillRect(0, 0, 64, 128); });
    const sh = new T3.Mesh(new T3.PlaneGeometry(2.2, 3.2), new T3.MeshBasicMaterial({ map: shaftT, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide })); sh.position.set(-3.6, 1.9, -D + 1.1); sh.rotation.x = -0.75; root.add(sh); Y.shaft = sh;
    const moteT = CTX(16, 16, c => { c.fillStyle = 'rgba(255,240,200,0.9)'; c.beginPath(); c.arc(8, 8, 3, 0, 7); c.fill(); }); Y.anim.motes = [];
    for (let i = 0; i < 18; i++) { const m = new T3.Sprite(new T3.SpriteMaterial({ map: moteT, transparent: true, opacity: 0.7, depthWrite: false, blending: T3.AdditiveBlending })); m.scale.setScalar(0.035); m.position.set(-3.6 + rr(-1, 1), rr(0.9, 3.2), -D + rr(0.3, 2.4)); root.add(m); Y.anim.motes.push({ m, ph: rr(0, 6), sp: rr(0.1, 0.3) }); } }
  { const pool = new T3.Mesh(new T3.CircleGeometry(0.9, 28), new T3.MeshBasicMaterial({ map: glowT, transparent: true, opacity: 0.55, depthWrite: false, blending: T3.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(T.x, TY + 0.004, T.z); pool.scale.set(1.1, 0.7, 1); root.add(pool); }
  const potM = toon('#a8532e'), leafA = toon('#3f8a4a'), leafB = toon('#5fae5a');
  for (const [x, z, sc] of [[-1.7, 5.0, 1], [1.7, 5.0, 1], [1.55, -5.1, 0.8], [-6.55, 2.2, 0.85], [4.85, 4.95, 0.9]]) { const g = new T3.Group(); g.position.set(x, 0, z); g.scale.setScalar(sc); root.add(g); cyl(0.26, 0.42, potM, 0, 0.21, 0, 0.01, g, 0.2, 12); cyl(0.28, 0.06, toon('#7a3a1e'), 0, 0.43, 0, 0.006, g, 0.28, 12);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, lf = M(new T3.SphereGeometry(1, 8, 6), i % 2 ? leafA : leafB, Math.cos(a) * 0.18, 0.72, Math.sin(a) * 0.18, g, 0.008); lf.scale.set(0.09, 0.32, 0.16); lf.rotation.set(Math.sin(a) * 0.7, -a, -Math.cos(a) * 0.7); } M(new T3.SphereGeometry(0.16, 10, 8), leafB, 0, 0.62, 0, g, 0.008, 0.16); col(x - 0.3 * sc, x + 0.3 * sc, z - 0.3 * sc, z + 0.3 * sc); }
  for (const [x, z, sc] of [[-4.75, 2.45, 1], [-4.65, 2.3, 0.7], [-6.8, 5.2, 0.9], [6.8, -1.95, 0.8]]) { cyl(0.035 * sc, 0.16 * sc, cream, x, 0.08 * sc, z, 0.004); M(new T3.SphereGeometry(0.1 * sc, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#c42d3c'), x, 0.15 * sc, z, root, 0.006, 0.1 * sc); for (let k = 0; k < 3; k++) { const d = new T3.Mesh(new T3.SphereGeometry(0.016 * sc, 5, 4), cream); d.position.set(x + Math.cos(k * 2.1) * 0.06 * sc, 0.2 * sc, z + Math.sin(k * 2.1) * 0.06 * sc); root.add(d); } }
  Y.spots = { benWork: { x: -1.85, z: -2.25 }, marlowCounter: { x: 3.6, z: -4.6 }, marlowDay: { x: -1.0, z: -4.0 }, marlowIntro: { x: -0.55, z: -2.75 }, ownerWait: { x: -0.4, z: -1.6 }, hopFrom: { x: -2.9, z: -1.85 }, door: { x: 0, z: 5.2 }, mid: { x: 0.3, z: 1.4 }, walkStart: { x: 0, z: 4.0 } };
  Y.collide = (x, z, r) => { for (const c of Y.colliders) { if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) { const dl = x - (c.x0 - r), dr = c.x1 + r - x, dt = z - (c.z0 - r), db = c.z1 + r - z, m = Math.min(dl, dr, dt, db); if (m === dl) x = c.x0 - r; else if (m === dr) x = c.x1 + r; else if (m === dt) z = c.z0 - r; else z = c.z1 + r; } } return { x: clamp(x, -W + r, W - r), z: clamp(z, -D + r, D - r) }; };
  Y.tick = (t, dt) => { // ambient life: lanterns, fish, bubbles, plants, birds, dust in the window light
    if (Y.anim.motes) for (const m of Y.anim.motes) { m.ph += dt * m.sp; m.m.position.y += Math.sin(m.ph * 2) * 0.002 - dt * 0.03; m.m.position.x += Math.cos(m.ph) * 0.002; if (m.m.position.y < 0.9) m.m.position.y = 3.2; m.m.material.opacity = 0.35 + Math.sin(m.ph * 3) * 0.3; }
    Y.anim.lamps.forEach((l, i) => l.material.color.setHSL(0.11, 1, 0.72 + Math.sin(t * 7 + i * 2) * 0.03 + Math.sin(t * 13 + i) * 0.02));
    const tk = Y.anim.tank; for (const f of Y.anim.fish) { f.boost = Math.max(0, f.boost - dt * 0.5); f.ph += dt * f.sp * (1 + f.boost * 3); const x = f.cx + Math.cos(f.ph) * f.rx, z = f.cz + Math.sin(f.ph) * f.rz; f.g.position.set(x, f.y + Math.sin(f.ph * 3) * 0.04, z); f.g.rotation.y = Math.atan2(-(Math.cos(f.ph) * f.rz * Math.sign(f.sp)), -Math.sin(f.ph) * f.rx * Math.sign(f.sp)); }
    for (const b of Y.anim.bubbles) { b.m.position.y += dt * 0.35; if (b.m.position.y > b.y1) b.m.position.y = b.y0; } Y.anim.plants.forEach((p, i) => p.rotation.z = Math.sin(t * 1.4 + i) * 0.12);
    const av = Y.anim.aviary; for (const b of Y.anim.birds) { if (b.t < 1) { b.t = Math.min(1, b.t + dt * (b.free ? 0.9 : 1.6)); const k = smooth(0, 1, b.t); b.g.position.lerpVectors(b.from, b.to, k); b.g.position.y += Math.sin(k * Math.PI) * 0.35; b.flap += dt * 40; b.wings.forEach((w, i) => w.rotation.x = Math.sin(b.flap) * 0.9 * (i ? 1 : -1)); b.g.rotation.y = Math.atan2(-(b.to.z - b.from.z), b.to.x - b.from.x); }
      else { b.wings.forEach(w => w.rotation.x = 0); b.wait -= dt; b.g.position.y += Math.sin(t * 9 + b.flap) * 0.0008; if (b.wait <= 0) { b.from.copy(b.g.position); if (b.free > 0) { b.free--; b.to.set(rr(av.x0, av.x1), rr(av.y0, av.y1), rr(av.z0, av.z1)); b.wait = 0.05; } else { b.free = 0; let s; do { s = Math.floor(Math.random() * Y.anim.birdSlots.length); } while (Y.anim.birds.some(o => o !== b && o.slot === s)); b.slot = s; b.to.copy(Y.anim.birdSlots[s]); b.wait = rr(1.5, 5); } b.t = 0; } } } };
  // phone budget: bake every fixed, opaque mesh (and its ink outline) into one mesh per material
  Y.mergeStatic = () => { const skip = new Set([...Y.front, ...Y.overhead, ...Y.lanterns, ...Y.anim.plants, ...Y.anim.birds.map(b => b.g), ...Y.anim.fish.map(f => f.g), ...Y.anim.bubbles.map(b => b.m), ...Y.anim.lamps]); root.updateMatrixWorld(true); const inv = root.matrixWorld.clone().invert(), B = new Map(), mats = new Map();
    root.traverse(o => { if (!o.isMesh || Array.isArray(o.material) || o.material.transparent || !o.visible) return; for (let q = o; q && q !== root; q = q.parent) if (skip.has(q)) return; const g = o.geometry; if (!g.attributes.position || !g.attributes.normal) return; const k = o.material.uuid; if (!B.has(k)) { B.set(k, []); mats.set(k, o.material); } B.get(k).push(o); });
    let removed = 0; for (const [k, list] of B) { if (list.length < 2) continue; const pos = [], nor = [], uv = []; const m4 = new T3.Matrix4(), n3 = new T3.Matrix3();
      for (const o of list) { m4.multiplyMatrices(inv, o.matrixWorld); n3.getNormalMatrix(m4); const g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry, P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, v = new T3.Vector3();
        for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(m4); pos.push(v.x, v.y, v.z); v.fromBufferAttribute(N, i).applyMatrix3(n3).normalize(); nor.push(v.x, v.y, v.z); if (U) uv.push(U.getX(i), U.getY(i)); else uv.push(0, 0); } }
      const mg = new T3.BufferGeometry(); mg.setAttribute('position', new T3.Float32BufferAttribute(pos, 3)); mg.setAttribute('normal', new T3.Float32BufferAttribute(nor, 3)); mg.setAttribute('uv', new T3.Float32BufferAttribute(uv, 2)); const mm = new T3.Mesh(mg, mats.get(k)); mm.castShadow = true; mm.receiveShadow = true; mm.userData.merged = list.length; root.add(mm);
      for (const o of list) { if (o.parent) o.parent.remove(o); removed++; } }
    return removed; };
  Y.flutter = () => Y.anim.birds.forEach(b => { b.free = 3; b.wait = rr(0, 0.3); });
  Y.scatterFish = () => Y.anim.fish.forEach(f => f.boost = 1);
  return Y;
}

// ---------------- pets (dog / cat / pig), built facing +x, paws on y = 0 ----------------
const SHAPE = { dog: { rx: 0.62, ry: 0.34, rz: 0.33, legH: 0.42, legR: 0.085, hr: 0.27, hx: 0.6, hy: 0.36 }, cat: { rx: 0.5, ry: 0.26, rz: 0.24, legH: 0.34, legR: 0.065, hr: 0.24, hx: 0.5, hy: 0.3 }, pig: { rx: 0.66, ry: 0.4, rz: 0.38, legH: 0.24, legR: 0.1, hr: 0.3, hx: 0.64, hy: 0.12 } };
export function makePet(ctx, type, look, { trimLong = false, shag = true } = {}) {
  const { THREE: T3, M, toon, grad } = ctx, S0 = SHAPE[type], { rx, ry, rz, legH, hr } = S0, cy = legH + ry * 0.9;
  const g = new T3.Group(), body = new T3.Group(); g.add(body);
  const furMat = new T3.MeshToonMaterial({ color: look.fur, gradientMap: grad }), darkMat = new T3.MeshToonMaterial({ color: look.dark, gradientMap: grad }), bellyMat = toon(look.belly), ink = toon('#1a1626');
  const P = { type, g, body, S0, cy, look, furMat, darkMat, legs: [], paws: [], patches: [], trim: [], shag: [], ears: [], eyes: [], claws: [], hooves: [], base: new T3.Color(look.fur), baseD: new T3.Color(look.dark) };
  const torso = M(new T3.SphereGeometry(1, 22, 14), furMat, 0, cy, 0, body, 0.028); torso.scale.set(rx, ry, rz); P.torso = torso;
  const bel = new T3.Mesh(new T3.SphereGeometry(1, 16, 10), bellyMat); bel.scale.set(rx * 0.82, ry * 0.62, rz * 0.9); bel.position.set(0.02, cy - ry * 0.36, 0); body.add(bel);
  const surf = (u, ph, side = 1) => { const s = Math.sqrt(Math.max(0, 1 - u * u)); const p = new T3.Vector3(rx * u, cy + ry * s * Math.cos(ph), side * rz * s * Math.sin(ph)); const n = new T3.Vector3(p.x / (rx * rx), (p.y - cy) / (ry * ry), p.z / (rz * rz)).normalize(); return { p, n }; };
  const anchor = (p, n, par = body) => { const o = new T3.Object3D(); o.position.copy(p).addScaledVector(n, 0.012); o.userData.n = n.clone(); par.add(o); return o; };
  if (look.spots) for (const [u, ph] of [[-0.4, 0.8], [0.2, 1.3], [0.5, 0.5], [-0.1, 0.2]]) { const { p, n } = surf(u, ph); const s = new T3.Mesh(new T3.SphereGeometry(0.11, 10, 6), toon(look.spots)); s.position.copy(p).addScaledVector(n, -0.03); s.scale.set(1.2, 1, 0.55); s.lookAt(p.clone().add(n)); body.add(s); }
  if (look.stripes) for (let i = 0; i < 4; i++) { const { p, n } = surf(-0.5 + i * 0.3, 0.6); const s = new T3.Mesh(new T3.BoxGeometry(0.05, 0.02, 0.32), toon(look.stripes)); s.position.copy(p); s.lookAt(p.clone().add(n)); body.add(s); }
  // head
  const head = new T3.Group(); head.position.set(S0.hx, cy + S0.hy, 0); body.add(head); P.head = head;
  M(new T3.SphereGeometry(hr, 18, 12), furMat, 0, 0, 0, head, 0.022, hr);
  if (type === 'dog') { const mz = M(new T3.SphereGeometry(1, 14, 10), bellyMat, hr * 0.78, -hr * 0.28, 0, head, 0.012); mz.scale.set(hr * 0.62, hr * 0.42, hr * 0.5); M(new T3.SphereGeometry(hr * 0.17, 10, 8), ink, hr * 1.36, -hr * 0.16, 0, head, 0);
    for (const s of [-1, 1]) { const e = M(new T3.SphereGeometry(1, 12, 8), darkMat, -hr * 0.05, hr * 0.05, s * hr * 0.92, head, 0.01); e.scale.set(hr * 0.32, hr * 0.78, hr * 0.2); e.position.y -= hr * 0.35; P.ears.push(e); } }
  else if (type === 'cat') { const mz = M(new T3.SphereGeometry(1, 12, 8), bellyMat, hr * 0.72, -hr * 0.28, 0, head, 0.01); mz.scale.set(hr * 0.42, hr * 0.32, hr * 0.48); M(new T3.SphereGeometry(hr * 0.1, 8, 6), toon('#e88aa0'), hr * 1.06, -hr * 0.12, 0, head, 0);
    for (const s of [-1, 1]) { const e = M(new T3.ConeGeometry(hr * 0.38, hr * 0.7, 4), furMat, -hr * 0.05, hr * 0.82, s * hr * 0.5, head, 0.01); e.rotation.x = s * 0.35; P.ears.push(e); for (const k of [-1, 1]) { const w = new T3.Mesh(new T3.BoxGeometry(0.004, 0.004, hr * 0.9), ink); w.position.set(hr * 0.92, -hr * 0.2 + k * 0.03, s * hr * 0.5); w.rotation.y = s * 0.2; w.rotation.x = k * 0.15; head.add(w); } } }
  else { const sn = M(new T3.CylinderGeometry(hr * 0.42, hr * 0.46, hr * 0.5, 14), toon(look.belly), hr * 0.98, -hr * 0.12, 0, head, 0.012, hr * 0.44); sn.rotation.z = Math.PI / 2; const disc = new T3.Mesh(new T3.CircleGeometry(hr * 0.4, 16), toon('#e88a88')); disc.position.set(hr * 1.24, -hr * 0.12, 0); disc.rotation.y = Math.PI / 2; head.add(disc);
    for (const s of [-1, 1]) { const ns = new T3.Mesh(new T3.CircleGeometry(hr * 0.08, 8), ink); ns.scale.y = 1.6; ns.position.set(hr * 1.245, -hr * 0.12, s * hr * 0.15); ns.rotation.y = Math.PI / 2; head.add(ns); const e = M(new T3.ConeGeometry(hr * 0.32, hr * 0.5, 4), darkMat, hr * 0.15, hr * 0.85, s * hr * 0.55, head, 0.01); e.rotation.z = -0.7; e.rotation.x = s * 0.4; P.ears.push(e); } }
  for (const s of [-1, 1]) { const eg = new T3.Group(); eg.position.set(hr * 0.66, hr * 0.24, s * hr * 0.58); head.add(eg); const e = new T3.Mesh(new T3.SphereGeometry(hr * 0.17, 10, 8), ink); e.scale.z = 0.6; eg.add(e); const sh = new T3.Mesh(new T3.SphereGeometry(hr * 0.06, 6, 4), new T3.MeshBasicMaterial({ color: 0xffffff })); sh.position.set(hr * 0.06, hr * 0.06, s * hr * 0.06); eg.add(sh); P.eyes.push(eg); }
  P.mouth = new T3.Object3D(); P.mouth.position.set(hr * 1.25, -hr * 0.35, 0); head.add(P.mouth);
  { const mx = type === 'dog' ? hr * 1.12 : type === 'cat' ? hr * 0.92 : hr * 1.12, my = type === 'dog' ? -hr * 0.46 : type === 'cat' ? -hr * 0.34 : -hr * 0.44, F = { mouth: new T3.Group(), brows: [], blush: [] }; F.mouth.position.set(mx, my, 0); head.add(F.mouth);
    F.gap = new T3.Mesh(new T3.SphereGeometry(1, 12, 8), toon('#3a1218')); F.gap.scale.set(hr * 0.22, hr * 0.03, hr * 0.32); F.mouth.add(F.gap);
    F.tongue = new T3.Mesh(new T3.SphereGeometry(1, 10, 8), toon('#f07a92')); F.tongue.scale.set(hr * 0.16, hr * 0.06, hr * 0.15); F.tongue.position.set(hr * 0.1, -hr * 0.08, 0); F.tongue.visible = false; F.mouth.add(F.tongue);
    for (const s of [-1, 1]) { const b = new T3.Mesh(new T3.BoxGeometry(hr * 0.34, hr * 0.07, hr * 0.06), ink); b.position.set(hr * 0.64, hr * 0.5, s * hr * 0.6); head.add(b); F.brows.push(b);
      const bl = new T3.Mesh(new T3.CircleGeometry(hr * 0.16, 14), new T3.MeshBasicMaterial({ color: 0xff7a8a, transparent: true, opacity: 0, depthWrite: false })); bl.position.set(hr * 0.78, -hr * 0.12, s * hr * 0.74); bl.rotation.y = s > 0 ? 0.6 : Math.PI - 0.6; bl.scale.y = 0.6; head.add(bl); F.blush.push(bl); }
    const nsh = new T3.Mesh(new T3.SphereGeometry(hr * 0.05, 6, 4), new T3.MeshBasicMaterial({ color: 0xffffff })); nsh.position.set(type === 'dog' ? hr * 1.42 : type === 'cat' ? hr * 1.1 : hr * 1.25, type === 'pig' ? -hr * 0.02 : -hr * 0.08, hr * 0.06); head.add(nsh);
    if (type === 'dog') { for (const s of [-1, 1]) { const t = new T3.Mesh(new T3.SphereGeometry(1, 8, 6), toon(look.belly)); t.scale.set(hr * 0.22, hr * 0.12, hr * 0.2); t.position.set(-hr * 0.2, hr * 0.92, s * hr * 0.12); t.rotation.z = 0.5; head.add(t); } const ch = new T3.Mesh(new T3.SphereGeometry(1, 10, 8), toon(look.belly)); ch.scale.set(rx * 0.32, ry * 0.42, rz * 0.62); ch.position.set(rx * 0.72, cy - ry * 0.05, 0); body.add(ch); }
    if (type === 'cat') { const ch = new T3.Mesh(new T3.SphereGeometry(1, 10, 8), bellyMat); ch.scale.set(rx * 0.3, ry * 0.55, rz * 0.7); ch.position.set(rx * 0.74, cy, 0); body.add(ch); }
    P.face = F; }
  // tail
  const tail = new T3.Group(); tail.position.set(-rx * 0.9, cy + ry * 0.35, 0); body.add(tail); P.tail = tail;
  if (type === 'dog') { const t1 = M(new T3.CylinderGeometry(0.05, 0.08, 0.42, 8), furMat, 0, 0.18, 0, tail, 0.008); t1.position.set(-0.08, 0.17, 0); t1.rotation.z = 0.5; M(new T3.SphereGeometry(0.09, 10, 8), toon(look.belly), -0.2, 0.36, 0, tail, 0.008, 0.09); }
  else if (type === 'cat') { let par = tail; for (let i = 0; i < 3; i++) { const sgm = new T3.Group(); sgm.position.y = i ? 0.24 : 0; sgm.rotation.z = i ? -0.35 : 0.65; par.add(sgm); M(new T3.CylinderGeometry(0.04, 0.05, 0.26, 8), i === 2 ? darkMat : furMat, 0, 0.12, 0, sgm, 0.006); par = sgm; P['tail' + i] = sgm; } }
  else { const c = M(new T3.TorusGeometry(0.06, 0.018, 6, 14, Math.PI * 1.6), darkMat, -0.06, 0.02, 0, tail, 0.004); c.rotation.y = Math.PI / 2; }
  // legs + paws (near side first: front, back; then far side)
  [[0.5, 1], [-0.5, 1], [0.5, -1], [-0.5, -1]].forEach(([u, s], i) => { const hip = new T3.Group(); hip.position.set(rx * u + (s < 0 ? 0.07 : 0), cy - ry * 0.35, s * rz * 0.52); g.add(hip); const L = hip.position.y;
    M(new T3.CylinderGeometry(S0.legR, S0.legR * 0.9, L, 8), furMat, 0, -L / 2, 0, hip, 0.01); const paw = new T3.Object3D(); paw.position.set(S0.legR * 0.6, -L + 0.06, 0); hip.add(paw);
    if (type === 'pig') { const hm = new T3.MeshToonMaterial({ color: '#6a5a50', gradientMap: grad }); const hf = M(new T3.CylinderGeometry(S0.legR * 1.08, S0.legR * 1.15, 0.1, 10), hm, 0, -L + 0.05, 0, hip, 0.008); const sp = new T3.Mesh(new T3.SphereGeometry(0.03, 6, 4), new T3.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 })); sp.position.set(0.05, -L + 0.08, s * 0.08); hip.add(sp); P.hooves.push({ m: hf, mat: hm, sp, shine: 0 }); }
    else { M(new T3.SphereGeometry(S0.legR * 1.25, 10, 8), toon(look.belly), S0.legR * 0.35, -L + 0.06, 0, hip, 0.008, S0.legR * 1.25); const cl = []; for (let k = -1; k <= 1; k++) { const c = new T3.Mesh(new T3.ConeGeometry(0.014, 0.07, 5), toon('#f4efe6')); c.rotation.z = -Math.PI / 2; c.position.set(S0.legR * 1.5, -L + 0.03, k * S0.legR * 0.55); hip.add(c); cl.push(c); } P.claws.push({ cl, done: false, q: 0 }); }
    P.legs.push(hip); P.paws.push(paw); });
  // grooming patches on the near (+z) side: 4 along x by 3 around the body
  const U = [-0.62, -0.2, 0.22, 0.62], PH = [0.5, 1.08, 1.62]; U.forEach((u, i) => PH.forEach((ph, j) => { const { p, n } = surf(u, ph); P.patches.push({ a: anchor(p, n), i, j, k: P.patches.length }); }));
  // trim line along the back (tail → neck) with a fringe of long fur
  if (trimLong && type !== 'pig') { const nT = 9; for (let i = 0; i < nT; i++) { const u = -0.72 + i * 1.44 / (nT - 1), { p, n } = surf(u, type === 'cat' ? 0.42 : 0.36), a = anchor(p, n); const tf = M(new T3.SphereGeometry(1, 8, 6), i % 2 ? darkMat : furMat, 0, 0, 0, a, 0.006); tf.position.copy(n).multiplyScalar(0.06); tf.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), n); tf.userData.s = [0.05, 0.13, 0.06]; tf.scale.set(0.05, 0.13, 0.06); a.add(tf); P.trim.push({ a, tf, cut: false, dot: null }); } }
  if (type === 'dog' && shag) for (let i = 0; i < 16; i++) { const { p, n } = surf(rr(-0.78, 0.7), rr(0.5, 1.9)), tf = new T3.Mesh(new T3.SphereGeometry(1, 8, 6), i % 3 ? furMat : darkMat); tf.position.copy(p).addScaledVector(n, 0.01); tf.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), n); tf.scale.set(0.07, 0.05, 0.07); tf.userData.s = [0.07, 0.05, 0.07]; body.add(tf); P.shag.push(tf); }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });
  P.st = { ph: Math.random() * 6, wag: 0, look: null, petT: 0, wiggle: 0, chomp: 0, hop: 0, act: null, hyB: 0, hzB: 0, spin: 0, twitch: 0, emo: {} };
  return P;
}
const _v = new THREE.Vector3();
// body "acts" — little performances the pet plays while you groom it (petAct(P, 'kick', 1.1))
export function petAct(P, name, dur = 0.8) { const st = P.st; if (st.act && st.act.name === name && st.act.t < st.act.dur * 0.5) return; st.act = { name, t: 0, dur }; }
export function animPet(P, dt, { speed = 0, mood = 0.7, wiggly = false, lookAt = null, petting = false, sleep = false } = {}) {
  const st = P.st, now = performance.now() / 1000; st.ph += dt * (speed > 0.05 ? 9 + speed * 3 : 1.6); const t = st.ph;
  P.legs.forEach((l, i) => l.rotation.z = speed > 0.05 ? Math.sin(t + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)) * 0.5 : damp(l.rotation.z, 0, 10, dt));
  st.wiggle = damp(st.wiggle, wiggly ? 1 : 0, 6, dt); st.chomp = Math.max(0, st.chomp - dt * 3); st.hop = Math.max(0, st.hop - dt * 2.5); st.twitch = Math.max(0, st.twitch - dt * 6);
  const A = st.act; let ax = 0, by = 0, az = 0, hyA = 0, hzA = 0, mouthA = 0, eyeA = null, earA = 0, kick = 0, spin = 0, lick = 0, brow = 0;
  if (A) { A.t += dt; const k = Math.min(1, A.t / A.dur), e = Math.sin(k * Math.PI), T = A.t;
    switch (A.name) {
      case 'flinch': hzA = 0.3 * e; hyA = -0.25 * e; eyeA = 1.4; earA = 0.7 * e; brow = 1; ax = -0.08 * e; break;
      case 'giggle': by = Math.abs(Math.sin(T * 18)) * 0.05 * e; mouthA = 0.7 * e; eyeA = 0.25; hzA = 0.15 * e; break;
      case 'kick': kick = Math.sin(T * 34) * 0.9 * e; mouthA = 0.7 * e; eyeA = 0.25; hzA = 0.3 * e; ax = 0.06 * e; break;
      case 'shake': ax = Math.sin(T * 34) * 0.32 * e; hyA = Math.sin(T * 34 + 1) * 0.7 * e; earA = Math.sin(T * 34) * 1.1 * e; eyeA = 0.15; break;
      case 'sputter': hyA = Math.sin(T * 26) * 0.45 * e; eyeA = 0.1; earA = 0.8 * e; mouthA = 0.5 * e; brow = -1; break;
      case 'nervous': ax = Math.sin(T * 44) * 0.03; eyeA = 1.3; earA = 0.45; brow = 1; break;
      case 'yelp': by = e * 0.32; mouthA = e; eyeA = 1.6; earA = e; hzA = 0.35 * e; brow = 1; break;
      case 'relief': by = -0.04 * e; eyeA = 0.2; mouthA = 0.25 * e; hzA = -0.1 * e; break;
      case 'lean': az = -0.1 * e; eyeA = 0.18; hzA = 0.2 * e; mouthA = 0.3 * e; break;
      case 'yawn': mouthA = e; eyeA = 0.15; hzA = 0.35 * e; break;
      case 'sneeze': { const w = k < 0.65 ? k / 0.65 : 1 - (k - 0.65) / 0.35; hzA = k < 0.65 ? 0.3 * w : -0.45 * Math.sin((k - 0.65) / 0.35 * Math.PI); eyeA = 0.15; mouthA = k > 0.62 && k < 0.8 ? 0.8 : 0.1; break; }
      case 'spin': spin = smooth(0, 1, k) * Math.PI * 2; by = e * 0.28; mouthA = 0.6; eyeA = 0.25; break;
      case 'happy': by = Math.abs(Math.sin(T * 12)) * 0.1 * e; mouthA = 0.65; eyeA = 0.25; hyA = Math.sin(T * 10) * 0.15 * e; break;
      case 'love': eyeA = 0.12; hzA = 0.22 * e; hyA = Math.sin(T * 4) * 0.15 * e; mouthA = 0.3; break;
      case 'sniff': hzA = -0.25 * e; hyA = Math.sin(T * 7) * 0.35 * e; break;
      case 'lick': lick = e; hzA = -0.35 * e; mouthA = 0.4 * e; eyeA = 0.3; break;
      case 'angry': ax = Math.sin(T * 30) * 0.06; earA = 1; eyeA = 0.7; brow = -1; mouthA = 0.5; break; }
    if (A.t >= A.dur) st.act = null; }
  P.body.rotation.x = Math.sin(now * 26) * 0.13 * st.wiggle + ax; P.body.rotation.z = az; P.body.position.y = Math.abs(Math.sin(t * 0.5)) * 0.03 * (speed > 0.05 ? 1 : 0) + Math.sin(st.hop * Math.PI) * 0.25 + Math.abs(Math.sin(now * 13)) * 0.05 * st.wiggle + by;
  if (spin || st.spin) { P.g.rotation.y += spin - st.spin; st.spin = spin; }
  if (kick && P.legs[1]) { P.legs[1].rotation.z = kick; P.legs[1].position.y = P.cy - P.S0.ry * 0.35 + Math.abs(kick) * 0.06; } else if (P.legs[1]) P.legs[1].position.y = P.cy - P.S0.ry * 0.35;
  if (lick && P.legs[0]) P.legs[0].rotation.z = -1.5 * lick;
  P.torso.scale.y = P.S0.ry * (1 + Math.sin(t * (sleep ? 0.8 : 2)) * 0.025);
  const wag = (sleep ? 0.05 : 0.15 + mood * 0.6) * (1 + st.wiggle) * (A && (A.name === 'happy' || A.name === 'spin' || A.name === 'love') ? 1.6 : 1), wf = 3 + mood * 10; if (P.type === 'cat') { P.tail.rotation.x = Math.sin(t * 0.9) * wag * 0.6; if (P.tail1) P.tail1.rotation.x = Math.sin(t * 1.3 + 1) * 0.3 + (A && A.name === 'angry' ? Math.sin(now * 20) * 0.4 : 0); } else P.tail.rotation.x = Math.sin(now * wf) * wag;
  let hy = 0, hz = 0; if (lookAt && !sleep) { P.head.updateWorldMatrix(true, false); _v.copy(lookAt); P.body.worldToLocal(_v); _v.sub(P.head.position); hy = clamp(Math.atan2(-_v.z, _v.x), -0.7, 0.7); hz = clamp(Math.atan2(_v.y, Math.hypot(_v.x, _v.z)), -0.4, 0.5); }
  st.hyB = damp(st.hyB, hy, 7, dt); st.hzB = damp(st.hzB, hz + (sleep ? -0.35 : 0) + (petting ? Math.sin(t * 3) * 0.12 + 0.12 : 0), 7, dt);
  P.head.rotation.y = st.hyB + hyA + Math.sin(now * 20) * 0.25 * st.wiggle; P.head.rotation.z = st.hzB + hzA - st.chomp * 0.3 + st.twitch * 0.12;
  st.blink = (st.blink ?? Math.random() * 3) - dt; if (st.blink < -0.12) st.blink = 1.8 + Math.random() * 3.2; const bl = st.blink < 0 && eyeA == null && !sleep;
  const sq = bl ? 0.08 : eyeA != null ? eyeA : sleep ? 0.12 : petting ? 0.2 : wiggly ? 1.3 : 1; P.eyes.forEach(e => e.scale.y = bl ? 0.08 : damp(e.scale.y, sq, 16, dt));
  st.earT = (st.earT ?? Math.random() * 4) - dt; if (st.earT < 0) { st.earT = 2.5 + Math.random() * 4; st.flick = 0.25; } st.flick = Math.max(0, (st.flick || 0) - dt); if (st.flick > 0 && !sleep) earA += Math.sin(st.flick / 0.25 * Math.PI) * 0.6;
  if (P.type === 'cat') P.ears.forEach((e, i) => e.rotation.x = damp(e.rotation.x, (i ? 1 : -1) * (wiggly ? 0.9 : 0.35 + earA * 0.6), 10, dt));
  else if (P.type === 'dog') P.ears.forEach((e, i) => e.rotation.x = damp(e.rotation.x, (i ? 1 : -1) * (earA * 0.7 + (mood > 0.8 ? 0.12 : 0)), 12, dt));
  else P.ears.forEach((e, i) => e.rotation.z = damp(e.rotation.z, -0.7 + earA * 0.5, 10, dt));
  const F = P.face; if (F) { const pant = P.type === 'dog' && mood > 0.72 && !sleep && !A ? 0.45 + Math.sin(now * 9) * 0.12 : 0, open = Math.max(mouthA, st.chomp * 0.9, pant, petting && P.type === 'dog' ? 0.5 : 0);
    F.gap.scale.y = damp(F.gap.scale.y, P.S0.hr * (0.03 + open * 0.34), 18, dt); F.gap.scale.x = P.S0.hr * (0.22 + open * 0.12); F.tongue.visible = open > 0.25 && P.type !== 'pig'; F.tongue.position.y = -P.S0.hr * (0.08 + open * 0.24); F.tongue.scale.y = P.S0.hr * (0.06 + open * 0.08);
    const bw = brow || (wiggly ? -1 : mood < 0.35 ? 1 : 0); F.brows.forEach(b => { b.rotation.z = damp(b.rotation.z, bw * 0.45, 10, dt); b.position.y = P.S0.hr * (0.5 + (bw > 0 ? 0.05 : 0)); });
    const bo = petting || (A && (A.name === 'love' || A.name === 'happy' || A.name === 'spin')) || mood > 0.85 ? 0.55 : 0; F.blush.forEach(b => b.material.opacity = damp(b.material.opacity, bo, 6, dt)); }
}

// ---------------- the stand-alone game: walk the store + the grooming job ----------------
export async function createPetGroom({ container, onState = () => {}, start = 'intro' }) {
  const ST = createStage(container, { bg: '#2a2a22' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#1c2a20'); gr.addColorStop(1, '#3a3020'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); });
  scene.fog = new THREE.Fog('#2a2a22', 22, 46); ST.sun.position.set(-2, 9, 5); Object.assign(ST.sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
  { const warm = new THREE.PointLight(0xffd8a0, 0.6, 9, 1.6); warm.position.set(-3.4, 3.2, -1.8); scene.add(warm); }
  const ctx = { THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline }, Y = buildPetStore(ctx), T = Y.table; Y.mergeStatic();
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const benWalk = strip(kit.makeFox({ ...CAST.player, mood: 'happy' })), BW = benWalk.userData.P;
  const benWork = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#2f6b55', '#2f6b55', '#d9b45a'], crest: '', gear: 'none', mood: 'happy' })), BP = benWork.userData.P;
  const marlow = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#f8ab52', furDark: '#d9822b', muzzle: '#fdd9a4', snout: '#fdd9a4', tailBase: '#cf7a24', tailMid: '#fbcd93', paw: '#cf7a24' }, torso: ['#9fd8b8', '#4f9a72', '#1c4732'], outfit: 'vest', crest: '', gear: 'none', eyes: ['#3b2410', '#3b2410'], mood: 'happy' }));
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  const uniform = (() => { const print = canvasTex(256, 256, c => { c.clearRect(0, 0, 256, 256); c.save(); c.translate(128, 86); c.fillStyle = '#d9b45a'; c.beginPath(); c.ellipse(0, 18, 34, 28, 0, 0, 7); c.fill(); for (const [x, y] of [[-40, -22], [-14, -44], [14, -44], [40, -22]]) { c.beginPath(); c.ellipse(x, y, 13, 17, x * 0.01, 0, 7); c.fill(); } c.restore();
      c.save(); c.translate(128, 196); c.rotate(-0.05); c.fillStyle = '#d9b45a'; c.fillRect(-120, -26, 240, 52); c.font = 'italic 900 38px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#1c4732'; c.fillText("MARLOW'S", 0, 2); c.restore(); });
    const U = dinerUniform(ST, benWork, { print, printY: 1.17, stripe: '#d9b45a', towelCol: '#2f6b55' }), hat = U.hat, hs = BP.head.scale.x || 1;
    while (hat.children.length) hat.remove(hat.children[0]); hat.scale.setScalar(hs); hat.position.y -= 0.08 * hs;
    M(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#2f6b55'), 0, 0, -0.04, hat, 0.012); M(new THREE.BoxGeometry(0.34, 0.03, 0.26), toon('#d9b45a'), 0, 0.01, 0.3, hat, 0.008); M(new THREE.SphereGeometry(0.035, 8, 6), toon('#d9b45a'), 0, 0.3, -0.04, hat, 0);
    return U.parts; })();
  const crestSlots = []; benWork.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const ownerFox = new Map(), getOwner = i => { if (!ownerFox.has(i)) { const o = OWNERS[i]; ownerFox.set(i, strip(kit.makeFox({ ...CAST.player, look: o.fur ? { ...CAST.player.look, fur: o.fur, furDark: o.furDark } : CAST.player.look, torso: o.torso, outfit: o.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' }))); blob(ownerFox.get(i), 0.62); } return ownerFox.get(i); };
  // ambient animals: 2 puppies, Parsnip, Old Soot the shop cat
  const pups = [{ fur: '#f2c97a', dark: '#c98a3e', belly: '#fff3dc' }, { fur: '#3a3230', dark: '#1c1817', belly: '#d9cfc4' }].map((lk, i) => { const p = makePet(ctx, 'dog', lk, { shag: false }); p.g.scale.setScalar(0.55); p.g.position.set(-5.6 + i * 0.6, 0, i ? 0.8 : -0.2); scene.add(p.g); return { P: p, tx: p.g.position.x, tz: p.g.position.z, wait: rr(0.5, 2), sp: 0, hop: 0 }; });
  const parsnip = (() => { const p = makePet(ctx, 'pig', PET_TYPES.pig.looks[0]); p.g.scale.setScalar(0.8); p.g.position.set(-5.6, 0, 3.8); scene.add(p.g); return { P: p, tx: -5.6, tz: 3.8, wait: 1, sp: 0 }; })();
  const soot = (() => { const p = makePet(ctx, 'cat', { fur: '#3a3836', dark: '#1c1b1a', belly: '#6a6560' }); p.g.scale.setScalar(0.62); p.legs.forEach(l => l.visible = false); p.body.position.y = 0; p.g.position.set(Y.catTop.x - 0.05, Y.catTop.y - p.S0.legH * 0.62 + 0.04, Y.catTop.z + 0.05); p.g.rotation.y = -0.9; scene.add(p.g); return { P: p, awake: 0 }; })();
  // ---------- small fx: hearts, water drops, treats, the grabbing hand ----------
  const heartT = canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); c.translate(32, 34); c.fillStyle = '#ec3013'; c.strokeStyle = '#201e1d'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 20); c.bezierCurveTo(-30, 0, -22, -26, 0, -12); c.bezierCurveTo(22, -26, 30, 0, 0, 20); c.closePath(); c.stroke(); c.fill(); c.fillStyle = '#ff9a8a'; c.beginPath(); c.arc(-9, -6, 5, 0, 7); c.fill(); });
  const hearts = []; for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: heartT, transparent: true, opacity: 0, depthWrite: false, depthTest: false })); s.renderOrder = 35; scene.add(s); hearts.push({ s, life: 0, v: V3() }); } let hI = 0;
  const heart = (p, n = 1) => { for (let i = 0; i < n; i++) { const h = hearts[hI = (hI + 1) % hearts.length]; h.s.position.copy(p).add(V3(rr(-0.15, 0.15), rr(0, 0.15), rr(-0.1, 0.1))); h.life = 1; h.v.set(rr(-0.15, 0.15), rr(0.6, 0.9), 0); } };
  const drops = []; for (let i = 0; i < 46; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x6fc6ee, transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(0.07); scene.add(s); drops.push({ s, life: 0, v: V3() }); } let dI = 0;
  const drop = (p, v, col = 0x6fc6ee) => { const d = drops[dI = (dI + 1) % drops.length]; d.s.position.copy(p); d.v.copy(v); d.life = 1; d.s.material.color.setHex(col); };
  const treatMesh = () => { const g = new THREE.Group(); M(new THREE.BoxGeometry(0.16, 0.05, 0.05), toon('#c98a3e'), 0, 0, 0, g, 0.005); for (const a of [-1, 1]) for (const b of [-1, 1]) M(new THREE.SphereGeometry(0.035, 8, 6), toon('#c98a3e'), a * 0.08, b * 0.025, 0, g, 0.004, 0.035); scene.add(g); return g; };
  const flying = [];
  // music (Lantern Waltz) + phone buzz
  const MUS = createMusic(), SFX = createSfx(MUS), unlockAudio = () => { MUS.unlock(); };
  const onVis = () => { const c = MUS.ctx; if (!c) return; if (document.hidden) { SFX.stopAll(); c.suspend(); } else c.resume(); }; document.addEventListener('visibilitychange', onVis); addEventListener('pointerdown', unlockAudio, true); addEventListener('keydown', unlockAudio, true);
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  // the reward: a bandana (dog), a bow (cat) or a flower crown (pig) after a good groom
  function accessory(P, owner) { if (!P || P.acc) return; const hr = P.S0.hr, g = new THREE.Group(); P.acc = g; const col = owner && owner.torso ? owner.torso[0] : '#e2453f';
    if (P.type === 'dog') { const band = M(new THREE.TorusGeometry(hr * 0.95, hr * 0.17, 6, 18), toon(col), 0, 0, 0, g, 0.008); band.rotation.y = Math.PI / 2; const tri = M(new THREE.ConeGeometry(hr * 0.6, hr * 0.95, 3), toon(col), hr * 0.62, -hr * 0.55, 0, g, 0.008); tri.rotation.z = Math.PI * 0.85; for (let i = 0; i < 4; i++) M(new THREE.SphereGeometry(hr * 0.06, 6, 4), toon('#fbf8ec'), hr * 0.62, -hr * 0.35 - i * hr * 0.12, (i % 2 ? 1 : -1) * hr * 0.12, g, 0); g.position.set(P.S0.hx - hr * 0.45, P.cy + P.S0.hy - hr * 0.85, 0); g.rotation.z = -0.5; P.body.add(g); }
    else if (P.type === 'cat') { for (const s of [-1, 1]) { const l = M(new THREE.ConeGeometry(hr * 0.22, hr * 0.42, 4), toon('#f07a92'), 0, 0, s * hr * 0.2, g, 0.005); l.rotation.x = s * Math.PI / 2; } M(new THREE.SphereGeometry(hr * 0.12, 8, 6), toon('#e2453f'), 0, 0, 0, g, 0.004, hr * 0.12); g.position.set(-hr * 0.1, hr * 0.95, hr * 0.38); P.head.add(g); }
    else { for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, f = M(new THREE.SphereGeometry(hr * 0.13, 8, 6), toon(['#f2c94c', '#fbf8ec', '#e88aa0'][i % 3]), Math.cos(a) * hr * 0.55, 0, Math.sin(a) * hr * 0.55, g, 0.004, hr * 0.13); M(new THREE.SphereGeometry(hr * 0.05, 6, 4), toon('#e6912a'), Math.cos(a) * hr * 0.55, hr * 0.08, Math.sin(a) * hr * 0.55, g, 0); } g.position.set(-hr * 0.05, hr * 0.85, 0); P.head.add(g); }
    g.scale.setScalar(0.01); P.accT = 0; }
  // emote bubbles over a pet's head (one per pet, newest wins)
  const EMO = {}, emIcon = (c, k) => { c.clearRect(0, 0, 96, 96); c.lineWidth = 5; c.strokeStyle = '#201e1d'; c.fillStyle = '#fbfbf7'; c.beginPath(); c.arc(48, 46, 38, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(34, 78); c.lineTo(26, 93); c.lineTo(48, 83); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fbfbf7'; c.beginPath(); c.arc(48, 46, 35, 0, 7); c.fill();
    c.textAlign = 'center'; c.textBaseline = 'middle'; const T = (txt, col, sz = 58) => { c.fillStyle = col; c.font = '900 ' + sz + 'px Archivo, "Arial Black", Arial'; c.fillText(txt, 48, 50); };
    if (k === 'heart') { c.fillStyle = '#ec3013'; c.beginPath(); c.moveTo(48, 70); c.bezierCurveTo(14, 46, 24, 18, 48, 34); c.bezierCurveTo(72, 18, 82, 46, 48, 70); c.fill(); }
    else if (k === '!') T('!', '#ec3013', 64); else if (k === '?') T('?', '#1f3a5f', 60); else if (k === 'note') T('♪', '#2f6b55', 60); else if (k === 'zzz') T('Zz', '#1f3a5f', 44);
    else if (k === 'sweat') { c.fillStyle = '#38bdf8'; c.strokeStyle = '#1f3a5f'; c.lineWidth = 4; c.beginPath(); c.moveTo(48, 20); c.quadraticCurveTo(70, 52, 60, 64); c.arc(48, 58, 13, 0.4, Math.PI - 0.4); c.quadraticCurveTo(26, 52, 48, 20); c.fill(); c.stroke(); }
    else if (k === 'anger') { c.strokeStyle = '#ec3013'; c.lineWidth = 8; c.lineCap = 'round'; for (const [a, b] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) { c.beginPath(); c.arc(48 + a * 17, 46 + b * 17, 11, b > 0 ? (a > 0 ? Math.PI : -Math.PI / 2) : (a > 0 ? Math.PI / 2 : 0), b > 0 ? (a > 0 ? Math.PI * 1.5 : 0) : (a > 0 ? Math.PI : Math.PI / 2)); c.stroke(); } }
    else if (k === 'star' || k === 'sparkle') { c.fillStyle = '#f2c94c'; c.strokeStyle = '#a8792e'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i < (k === 'star' ? 10 : 8); i++) { const n = k === 'star' ? 10 : 8, r = i % 2 ? (k === 'star' ? 12 : 7) : 27, a = i / n * Math.PI * 2 - Math.PI / 2; c.lineTo(48 + Math.cos(a) * r, 47 + Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); }
    else if (k === 'drop') { c.fillStyle = '#4fb0e8'; for (const [x, y, r] of [[36, 40, 10], [58, 34, 8], [52, 60, 11]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } } };
  for (const k of ['heart', '!', '?', 'note', 'zzz', 'sweat', 'anger', 'star', 'sparkle', 'drop']) EMO[k] = canvasTex(96, 96, c => emIcon(c, k));
  const emoList = []; function emote(P, k, dur = 1.3) { if (!P || !EMO[k]) return; const now = performance.now(); if (now - (P.st.emo[k] || 0) < 900) return; P.st.emo[k] = now;
    if (!P.emoS) { P.emoS = new THREE.Sprite(new THREE.SpriteMaterial({ map: EMO[k], transparent: true, depthTest: false, depthWrite: false })); P.emoS.renderOrder = 38; scene.add(P.emoS); emoList.push(P); } P.emoS.material.map = EMO[k]; P.emoS.material.needsUpdate = true; P.emoS.userData = { life: dur, dur }; P.emoS.visible = true; }
  function voice(P, kind = 'happy') { if (P) SFX.voice(P.type, kind); }
  const react = (P, act, dur, emo, vox) => { if (!P) return; petAct(P, act, dur); if (emo) emote(P, emo); if (vox) voice(P, vox); };
  // soap bubbles + sparkles
  const bubT = canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); const g0 = c.createRadialGradient(32, 32, 18, 32, 32, 30); g0.addColorStop(0, 'rgba(200,235,255,0.08)'); g0.addColorStop(0.85, 'rgba(160,220,255,0.45)'); g0.addColorStop(1, 'rgba(255,255,255,0.9)'); c.fillStyle = g0; c.beginPath(); c.arc(32, 32, 30, 0, 7); c.fill(); c.fillStyle = 'rgba(255,255,255,0.95)'; c.beginPath(); c.ellipse(22, 20, 7, 4, -0.6, 0, 7); c.fill(); });
  const bubbles = []; for (let i = 0; i < 22; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubT, transparent: true, opacity: 0, depthWrite: false })); scene.add(s); bubbles.push({ s, life: 0, v: V3(), r: 0.08 }); } let bI = 0;
  const bubble = (p, n = 1) => { for (let i = 0; i < n; i++) { const b = bubbles[bI = (bI + 1) % bubbles.length]; b.s.position.copy(p).add(V3(rr(-0.1, 0.1), rr(0, 0.1), rr(0, 0.12))); b.v.set(rr(-0.15, 0.15), rr(0.25, 0.55), rr(0, 0.1)); b.life = rr(1.2, 2.2); b.r = rr(0.04, 0.11); } };
  const spkT = canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); c.fillStyle = '#fff6c8'; c.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 5 : 30, a = i / 8 * Math.PI * 2; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.closePath(); c.fill(); });
  const sparks = []; for (let i = 0; i < 24; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: spkT, color: 0xffe27a, transparent: true, opacity: 0, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); s.renderOrder = 36; scene.add(s); sparks.push({ s, life: 0, v: V3() }); } let kI = 0;
  const sparkle = (p, n = 6, spread = 0.5) => { for (let i = 0; i < n; i++) { const k = sparks[kI = (kI + 1) % sparks.length]; k.s.position.copy(p).add(V3(rr(-spread, spread), rr(-spread * 0.5, spread), rr(-spread * 0.4, spread * 0.6))); k.v.set(rr(-0.2, 0.2), rr(0.1, 0.5), 0); k.life = rr(0.6, 1.1); } };
  // soft blob shadows (phones have real shadows switched off)
  const blobT = canvasTex(64, 64, c => { const g0 = c.createRadialGradient(32, 32, 2, 32, 32, 31); g0.addColorStop(0, 'rgba(30,20,10,0.55)'); g0.addColorStop(1, 'rgba(30,20,10,0)'); c.fillStyle = g0; c.fillRect(0, 0, 64, 64); });
  const blobs = []; const blob = (obj, r) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.renderOrder = 1; scene.add(m); blobs.push({ m, obj, r }); return m; };
  const onTable = p => Math.abs(p.x - Y.table.x) < 1.0 && Math.abs(p.z - Y.table.z) < 0.6 && p.y > TY * 0.6;
  function stepBlobs() { for (const b of blobs) { const o = b.obj, vis = o.visible && (!o.parent || o.parent.visible !== false); b.m.visible = vis; if (!vis) continue; const p = o.getWorldPosition(_bp), base = onTable(p) ? TY : 0, h = Math.max(0, p.y - base); b.m.position.set(p.x, base + 0.014, p.z); b.m.scale.setScalar(Math.max(0.4, 1 - h * 0.6) * (o.scale.x || 1)); b.m.material.opacity = Math.max(0.25, 1 - h * 0.8); } }
  const _bp = V3(), _warm = new THREE.Color(0x2a2010), _black = new THREE.Color(0x000000);
  [benWalk, benWork, marlow].forEach(f => blob(f, 0.62)); pups.forEach(p => blob(p.P.g, 0.5)); blob(parsnip.P.g, 0.75);
  // ---------- state ----------
  const S = { mode: 'walk', phase: 'walk', day: Math.max(1, save.stat(SAVE.day, 1)), petN: 0, earned: 0, tips: 0, starList: [], tool: null, flash: null, flashT: 0, say: '', sayT: 0, ptr: null, react: null, done: null, t: 0, phT: 0, confirm: 0, treats: 3, mood: 0.8, wiggly: false, wiggles: 0, moodSum: 0, moodN: 0, calmed: false, claw: { v: 0, d: 1 }, toast: null, toastT: 0, dialog: null, prompt: null, near: null, stick: { x: 0, y: 0 } };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; }, toast = (s, t = 3.2) => { S.toast = s; S.toastT = t; };
  let J = null, PET = null, owner = null, OWN = null, lastOwner = -1, lastType = null;
  const wp = o => o.getWorldPosition(new THREE.Vector3());
  // ---------- WALK MODE ----------
  const BEN = { x: Y.spots.walkStart.x, z: Y.spots.walkStart.z, face: Math.PI, sp: 0 }, keys = new Set(), CAMW = { yaw: 0, pitch: 0.72, dist: 0 };
  const INTERACT = [
    { id: 'marlow', label: 'Talk to Marlow', x: 3.6, z: -2.75, r: 1.7 }, { id: 'groom', label: 'Work a grooming shift', x: -1.85, z: -2.2, r: 1.5 },
    { id: 'pups', label: 'Pet the puppies', x: -4.0, z: 0.3, r: 1.4, animal: true }, { id: 'parsnip', label: 'Pet Parsnip', x: -4.0, z: 4.0, r: 1.4, animal: true },
    { id: 'cat', label: 'Pet Old Soot (the shop cat)', x: 5.6, z: -2.75, r: 1.2, animal: true }, { id: 'aviary', label: 'Look in the aviary', x: 4.6, z: -0.2, r: 1.4 },
    { id: 'fish', label: 'Look at the fish tank', x: 5.3, z: 3.4, r: 1.4 }, { id: 'door', label: 'Leave the store', x: 0, z: 4.9, r: 0.9 }];
  function nearest() { let best = null, bd = 9; for (const it of INTERACT) { const d = Math.hypot(BEN.x - it.x, BEN.z - it.z); if (d < it.r && d < bd) { bd = d; best = it; } } return best; }
  function animalTarget(id) { if (id === 'pups') return pups.map(p => p.P); if (id === 'parsnip') return [parsnip.P]; if (id === 'cat') return [soot.P]; return []; }
  function petAnimal(id) { const L = animalTarget(id); L.forEach((P, i) => { P.st.hop = 1; P.st.petT = 1.6; heart(wp(P.head).add(V3(0, 0.3, 0)), 2); setTimeout(() => react(P, id === 'cat' ? 'love' : i ? 'spin' : 'happy', 1.1, 'heart'), i * 200); });
    if (id === 'pups') { toast('The puppies pile over each other to get to you.'); SFX.voice('dog', 'happy'); setTimeout(() => SFX.voice('dog', 'giggle'), 300); }
    else if (id === 'parsnip') { toast('Parsnip snuffles your pockets for truffles. She is cleverer than she looks.'); SFX.voice('pig', 'happy'); }
    else if (id === 'cat') { soot.awake = 3; toast('Old Soot purrs like a little engine, then goes back to sleep.'); SFX.voice('cat', 'love'); } }
  function useSpot(it) { if (!it) return; if (it.animal) return petAnimal(it.id);
    if (it.id === 'marlow') return openMarlow(); if (it.id === 'groom') return toIntro();
    if (it.id === 'aviary') { Y.flutter(); toast('"Mind the aviary door. Everything in there is faster than you — except the pig, and she is cleverer."'); for (let i = 0; i < 5; i++) setTimeout(() => tone(2200 + Math.random() * 900, 0.05, 0.03, 'sine'), i * 90); return; }
    if (it.id === 'fish') { Y.scatterFish(); toast('Pond fish from the Nebo river. Marlow knows every one of them by name.'); tone(520, 0.1, 0.03, 'sine'); return; }
    if (it.id === 'door') { toast('The door leads out to Nebo Town Square.'); return; } }
  // Marlow's dialogue (Game HUD standard: name, role, text, choices, step/total)
  const MAR = { name: 'MARLOW', role: 'PET STORE' };
  function openMarlow() { marlow.userData.talking = true; S.asked = S.asked || {}; S.dialog = { ...MAR, lines: ['Mind the aviary door. Everything in there is faster than you — except the pig, and she is cleverer.'], i: 0, menu: 'main' }; tone(660, 0.06, 0.03); }
  function menuFor(k) { const A = S.asked || {};
    if (k === 'main') return [{ text: 'Put me to work. I can groom!', act: 'work' }, { text: 'What do you sell?', act: 'shop', asked: A.shop }, { text: 'What is the pig for?', act: 'pig', asked: A.pig }, { text: 'Tell me about the store.', act: 'store', asked: A.store }, { text: 'Bye for now.', act: 'bye', bye: true }];
    if (k === 'shop') return [...SHOP.map(it => ({ text: it.label + ' · ' + it.price + 'g', act: 'buy:' + it.id })), { text: 'That is all, thanks.', act: 'main', bye: true }];
    return []; }
  function dialogHud() { const d = S.dialog; if (!d) return null; const atEnd = d.i >= d.lines.length - 1, ch = atEnd && d.menu ? menuFor(d.menu) : null;
    return { name: d.name, role: d.role, text: d.lines[Math.min(d.i, d.lines.length - 1)], choices: ch ? ch.map(c => ({ text: c.text, asked: !!c.asked, bye: !!c.bye })) : null, step: d.i + 1, total: d.lines.length, more: false, required: false }; }
  function choose(i) { const d = S.dialog; if (!d) return; const ch = menuFor(d.menu)[i]; if (!ch) return; tone(760, 0.05, 0.03); const A = S.asked;
    if (ch.act === 'bye') return closeDialog(); if (ch.act === 'work') { closeDialog(); return toIntro(); }
    if (ch.act === 'main') { S.dialog = { ...MAR, lines: ['Anything else?'], i: 0, menu: 'main' }; return; }
    if (ch.act === 'shop') { A.shop = 1; S.dialog = { ...MAR, lines: ['Treats, toys, collars, a vet\'s kit, feed — and Parsnip, by the day. You have ' + save.data.gold + 'g.'], i: 0, menu: 'shop' }; return; }
    if (ch.act === 'pig') { A.pig = 1; S.dialog = { ...MAR, lines: ['Parsnip? Truffles. She has a nose on her that would find one through a wall, and she will not be told where to look because she is already right.', 'I rent her by the day. Walk her where the trees are and do not help — helping is how people lose an afternoon.'], i: 0, menu: 'main' }; return; }
    if (ch.act === 'store') { A.store = 1; S.dialog = { ...MAR, lines: ['I keep the pens, the aviary and the pond. I know every animal in here by name, and half the ones outside.', 'The grooming table is mine too, but my back is not what it was. Step up to it any time and I will pay you for a shift.'], i: 0, menu: 'main' }; return; }
    if (ch.act.startsWith('buy:')) { const it = SHOP.find(q => q.id === ch.act.slice(4)); if (!save.spend(it.price)) { S.dialog = { ...MAR, lines: ['That one is ' + it.price + 'g and you have ' + save.data.gold + 'g. Work a shift at the table and come back.'], i: 0, menu: 'shop' }; tone(200, 0.15, 0.04, 'sawtooth'); return; }
      save.give(it.id, 1); tone(1320, 0.08, 0.04); setTimeout(() => tone(1760, 0.1, 0.04), 100); S.dialog = { ...MAR, lines: [it.id === 'trufflePig' ? 'Parsnip is yours for the day. Walk her where the trees are, and do not help.' : 'There you go: ' + it.label + '. ' + save.data.gold + 'g left.'], i: 0, menu: 'shop' }; } }
  function nextLine() { const d = S.dialog; if (!d) return; if (d.i < d.lines.length - 1) { d.i++; tone(620, 0.04, 0.02); } else if (!d.menu) closeDialog(); }
  function closeDialog() { S.dialog = null; marlow.userData.talking = false; }
  function talk() { if (S.mode !== 'walk') return; if (S.dialog) { const h = dialogHud(); if (!h.choices) nextLine(); return; } useSpot(S.near); }
  function tossTreatWalk() { if (S.dialog) return; let best = null, bd = 4.5; const cands = [...pups.map(p => ({ P: p.P, id: 'pups' })), { P: parsnip.P, id: 'parsnip' }, { P: soot.P, id: 'cat' }];
    for (const c of cands) { const p = wp(c.P.head), d = Math.hypot(p.x - BEN.x, p.z - BEN.z); if (d < bd) { bd = d; best = c; } }
    const fish = Math.hypot(BEN.x - 5.3, BEN.z - 3.4) < 2, birds = Math.hypot(BEN.x - 4.6, BEN.z - 0.2) < 2;
    if (!best && fish) { Y.scatterFish(); toast('You sprinkle a pinch of fish flakes. The whole tank goes mad for it.'); return; }
    if (!best && birds) { Y.flutter(); toast('You drop seed in the feeder. The birds mob it.'); return; }
    if (!best) { toast('No animal close enough for a treat. Walk up to one.'); return; }
    const from = wp(BW.arms ? BW.arms[1] : benWalk).add(V3(0, 0.2, 0)); throwTreat(from, best.P, { dur: 0.6, hit: true, walk: best.id }); }
  // ---------- JOB ----------
  function newJob() { const d = S.day, demo = !!S.forceType, ty = S.forceType || (d <= 1 ? ['dog', 'pig', 'cat'][S.petN % 3] : pick(['dog', 'cat', 'pig'].filter(t => t !== lastType))); lastType = ty;
    const PT = PET_TYPES[ty], tasks = (demo ? PT.plan[2] : PT.plan[Math.min(2, d - 1)]).slice(); let oi; do { oi = Math.floor(Math.random() * OWNERS.length); } while (oi === lastOwner); lastOwner = oi;
    const parsnipJob = ty === 'pig' && (d <= 1 || Math.random() < 0.5), name = parsnipJob ? 'PARSNIP' : pick(PT.names.filter(n => n !== 'PARSNIP') .concat(ty === 'pig' ? [] : [])), look = parsnipJob ? PT.looks[0] : pick(PT.looks);
    return { type: ty, PT, tasks, owner: oi, name, look, parsnip: parsnipJob, day: d, line: parsnipJob ? PARSNIP_HELLO : pick(HELLO), tangles: ty === 'dog' ? Math.min(7, 4 + d) : ty === 'cat' ? Math.min(5, 2 + d) : 0 }; }
  function nextPet() { clearPet(); J = newJob(); OWN = OWNERS[J.owner]; owner = getOwner(J.owner); ownerFox.forEach(f => f.visible = f === owner); owner.userData.mood = 'happy';
    PET = makePet(ctx, J.type, J.look, { trimLong: J.tasks.includes('trim') }); scene.add(PET.g); PET.blob = blob(PET.g, J.type === 'cat' ? 0.6 : 0.8); setupJob(); parsnip.P.g.visible = !J.parsnip;
    owner.position.set(Y.spots.door.x - 0.4, 0, Y.spots.door.z + 0.6); PET.g.position.set(Y.spots.door.x + 0.5, 0, Y.spots.door.z + 0.8);
    S.phase = 'arrive'; S.phT = 0; S.tool = null; SFX.door(); S.confirm = 0; S.doneSeen = {}; S.tipSeen = {}; S.mood = J.PT.mood0; S.wiggly = false; S.wiggles = 0; S.moodSum = 0; S.moodN = 0; S.calmed = !J.tasks.includes('calm'); S.treats = 3 + (upg('pouch') ? 2 : 0); S.slips = 0; S.claw = { v: 0, d: 1 }; tone(523, 0.1, 0.04); setTimeout(() => tone(659, 0.12, 0.04), 120); }
  function clearPet() { if (PET) { scene.remove(PET.g); if (PET.emoS) PET.emoS.visible = false; const bi = blobs.findIndex(b => b.obj === PET.g); if (bi >= 0) { scene.remove(blobs[bi].m); blobs.splice(bi, 1); } PET = null; } J = null; }
  function setupJob() { const P = PET, T0 = J.tasks, N = P.patches;
    const visible = N.filter(p => p.j < 2 || p.i % 2 === 0); P.soap = []; P.tangles = []; P.wetSpots = [];
    if (T0.includes('brush')) { const pool = visible.slice().sort(() => Math.random() - 0.5).slice(0, J.tangles); pool.forEach(pt => { const g = new THREE.Group(); g.position.copy(pt.a.userData.n).multiplyScalar(0.03); pt.a.add(g); for (let k = 0; k < 3; k++) M(new THREE.SphereGeometry(0.055, 7, 5), P.darkMat, rr(-0.05, 0.05), rr(-0.04, 0.04), rr(-0.02, 0.03), g, 0.008, 0.055); const sq = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.012, 4, 10), toon('#2a2018')); sq.position.z = 0.05; sq.lookAt(g.position.clone().add(pt.a.userData.n)); g.add(sq); g.quaternion.setFromUnitVectors(V3(0, 0, 1), pt.a.userData.n); P.tangles.push({ pt, g, hp: 1 }); }); }
    if (T0.includes('scrub') || T0.includes('mud')) { const mud = T0.includes('mud'), pool = visible.slice().sort(() => Math.random() - 0.5).slice(0, mud ? 7 : 6);
      pool.forEach(pt => { const dirt = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 6), toon(mud ? '#9a8c80' : '#7a5a3a')); dirt.scale.set(1.3, 1, 0.3); dirt.position.copy(pt.a.userData.n).multiplyScalar(-0.006); dirt.quaternion.setFromUnitVectors(V3(0, 0, 1), pt.a.userData.n); pt.a.add(dirt); if (mud) dirt.visible = false;
        const sud = new THREE.Group(); pt.a.add(sud); for (let k = 0; k < 4; k++) M(new THREE.SphereGeometry(rr(0.05, 0.085), 8, 6), toon(mud ? '#6b4a2c' : '#ffffff'), rr(-0.08, 0.08), rr(-0.06, 0.06), rr(0, 0.04), sud, 0.006); sud.quaternion.setFromUnitVectors(V3(0, 0, 1), pt.a.userData.n); sud.scale.setScalar(0.01); P.soap.push({ pt, dirt, sud, cover: 0, suds: 0, rinsed: false }); }); }
    if (T0.includes('trim')) P.trim.forEach((tr, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true })); d.renderOrder = 32; d.position.copy(tr.a.userData.n).multiplyScalar(0.2); tr.a.add(d); tr.dot = d; tr.cut = false; });
    P.trimI = 0; P.pawI = 0; }
  const soapId = () => J && (J.tasks.includes('mud') ? 'mud' : 'scrub');
  function info(id) { if (!PET) return { done: false, q: 0, left: 0, prog: 0, txt: '' }; const P = PET;
    if (id === 'calm') return { done: S.calmed, q: 1, left: S.calmed ? 0 : 1, prog: S.calmed ? 1 : Math.min(1, S.mood / 0.92), txt: S.calmed ? 'DONE' : Math.round(Math.min(1, S.mood / 0.92) * 100) + '%' };
    if (id === 'brush') { const l = P.tangles.filter(t => t.hp > 0).length, n = P.tangles.length; return { done: !l, q: 1, left: l, prog: n ? 1 - l / n : 1, txt: l ? l + ' KNOTS' : 'DONE' }; }
    if (id === 'scrub' || id === 'mud') { const n = P.soap.length, c = P.soap.filter(s => s.cover >= 1).length; return { done: c === n, q: 1, left: n - c, prog: n ? c / n : 1, txt: c === n ? 'DONE' : c + ' / ' + n }; }
    if (id === 'rinse') { const n = P.soap.length, l = P.soap.filter(s => !s.rinsed).length; return { done: !l && n > 0, q: 1, left: l, prog: n ? 1 - l / n : 1, txt: !info(soapId()).done ? 'LOCKED' : l ? l + ' LEFT' : 'DONE', locked: !info(soapId()).done }; }
    if (id === 'dry') { const n = P.wetSpots.length, l = P.wetSpots.filter(w => w.wet > 0).length, lock = !info('rinse').done; return { done: !lock && n > 0 && !l, q: 1, left: l, prog: n ? 1 - l / n : 0, txt: lock ? 'LOCKED' : l ? l + ' WET' : 'DONE', locked: lock }; }
    if (id === 'trim') { const n = P.trim.length, c = P.trim.filter(t => t.cut).length; return { done: c === n, q: Math.max(0.4, 1 - S.slips * 0.12), left: n - c, prog: c / n, txt: c === n ? 'DONE' : c + ' / ' + n }; }
    if (id === 'claws') { const n = P.claws.length, c = P.claws.filter(x => x.done).length; return { done: c === n, q: c ? P.claws.filter(x => x.done).reduce((a, x) => a + x.q, 0) / c : 0, left: n - c, prog: c / n, txt: c === n ? 'DONE' : c + ' / ' + n }; }
    if (id === 'hooves') { const n = P.hooves.length, c = P.hooves.filter(x => x.shine >= 1).length; return { done: c === n, q: 1, left: n - c, prog: c / n, txt: c === n ? 'DONE' : c + ' / ' + n }; }
    return { done: true, q: 1 }; }
  const locked = id => (!S.calmed && id !== 'calm') || !!info(id).locked;
  const allDone = () => J && J.tasks.every(t => info(t).done), nextTask = () => J && J.tasks.find(t => !info(t).done && !locked(t)) || (J && J.tasks.find(t => !info(t).done));
  function setTool(id) { if (S.phase !== 'work' || !J || !J.tasks.includes(id)) return; if (locked(id)) { flash(!S.calmed ? 'CALM HER FIRST · PET HER HEAD' : id === 'rinse' ? 'SCRUB FIRST, THEN RINSE' : 'RINSE FIRST, THEN DRY', '#e6b45a', 1.5); SFX.wrong(); return; } if (S.tool !== id) SFX.click(); S.tool = id; S.userToolT = performance.now(); S.ptr = null; if (!S.tipSeen[id]) { S.tipSeen[id] = 1; say(TIP[id], 4.5); } }
  function checkDone() { if (!J) return; for (const t of J.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); MUS.sting('done'); SFX.chime(); buzz(25); tone(1175, 0.1, 0.05); setTimeout(() => tone(1568, 0.14, 0.05), 110); heart(wp(PET.head).add(V3(0, 0.35, 0)), 2); sparkle(wp(PET.torso), 8, 0.6); if (t === 'rinse') { react(PET, 'shake', 1.4, 'drop'); S.shakeT = 1.4; SFX.splash(); } else if (t === 'dry') react(PET, 'spin', 1.1, 'sparkle', 'happy'); else if (t !== 'calm') react(PET, 'happy', 0.9, 'star', 'happy');
        if (t === 'rinse') afterRinse(); if (t === 'dry') { PET.st.hop = 1; for (let i = 0; i < 10; i++) puff(PET.g.position.x + rr(-0.6, 0.6), TY + rr(0.4, 1.0), PET.g.position.z + rr(0, 0.4), 0xfff4e0, 1); tone(880, 0.2, 0.04, 'sine'); }
        const nx = nextTask(); if (!nx || allDone()) say('MARLOW: "Lovely. Hand ' + J.name + ' back to ' + OWN.name + '!"', 4); else { const was = S.tool; setTimeout(() => { if (S.phase === 'work' && S.tool === was && !S.ptr && !locked(nx)) setTool(nx); }, 1100); } } } }
  function afterRinse() { const P = PET; if (!J.tasks.includes('dry')) { P.furMat.color.copy(P.base); return; } const pool = P.patches.filter(p => p.j < 2 || p.i % 2 === 0).sort(() => Math.random() - 0.5).slice(0, Math.min(7, 4 + J.day));
    P.wetSpots = pool.map(pt => { const m = new THREE.Group(); for (let k = 0; k < 3; k++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: 0x4fb0e8, transparent: true, opacity: 0.85 })); d.scale.y = 1.4; d.position.set(rr(-0.06, 0.06), rr(-0.05, 0.05), 0.03); m.add(d); } P.body.add(m); m.position.copy(pt.a.position); return { pt, m, wet: 1, cool: 0, move: null }; });
    P.furMat.color.copy(P.base).multiplyScalar(0.72); P.shag.forEach(s => s.scale.set(0.05, 0.02, 0.05)); }
  // ---------- gestures ----------
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const camRight = () => V3().setFromMatrixColumn(camera.matrixWorld, 0);
  const scrR = (p, r) => { const a = scr(p), b = scr(p.clone().addScaledVector(camRight(), r)); return Math.hypot(b.x - a.x, b.y - a.y); };
  const dist2 = (p, x, y) => { const s = scr(p); return Math.hypot(s.x - x, s.y - y); };
  const onHead = (x, y) => PET && dist2(wp(PET.head), x, y) < Math.max(34 * scale(), scrR(wp(PET.head), PET.S0.hr) * 1.15);
  const R = () => 42 * scale();
  function wigglyBlock() { if (!S.wiggly) return false; if (performance.now() - (S.wigT || 0) > 1500) { S.wigT = performance.now(); flash('TOO WIGGLY · PET HER HEAD OR FLICK A TREAT', '#ec3013', 1.6); SFX.wrong(); } return true; }
  function petHead(d) { S.mood = Math.min(1, S.mood + d / (J && J.type === 'cat' ? 520 : 700)); PET.st.petT = 0.6; if ((S.petAcc = (S.petAcc || 0) + d) > 70) { S.petAcc = 0; if (J.type === 'cat' && !S.calmed && S.mood < 0.45) { react(PET, 'angry', 0.7, 'anger'); if (Math.random() < 0.4) voice(PET, 'angry'); } else { heart(wp(PET.head).add(V3(0.05, 0.3, 0.1))); if (Math.random() < 0.35) react(PET, 'love', 1.0, 'heart', Math.random() < 0.5 ? 'love' : null); } tone(J.type === 'pig' ? 160 : J.type === 'cat' ? 90 : 700, 0.08, 0.03, J.type === 'cat' ? 'sawtooth' : 'triangle'); }
    if (!S.calmed && S.mood >= 0.92) { S.calmed = true; react(PET, 'love', 1.4, 'heart', 'love'); checkDone(); } if (S.wiggly && S.mood > 0.45) { S.wiggly = false; flash('SETTLED', '#22c55e', 1); } }
  function brushAt(x, y, d) { for (const t of PET.tangles) { if (t.hp <= 0 || dist2(wp(t.g), x, y) > R()) continue; t.hp -= d / (upg('brush') ? 140 : 280); t.g.rotation.z += 0.3; t.g.scale.setScalar(0.6 + t.hp * 0.4); if (Math.random() < 0.05) react(PET, 'flinch', 0.4, '!'); if (Math.random() < 0.3) { const p = wp(t.g); puff(p.x, p.y, p.z + 0.05, new THREE.Color(J.look.fur).getHex(), 1); } SFX.brush();
      if (t.hp <= 0) { const p = wp(t.g); t.g.visible = false; for (let i = 0; i < 4; i++) puff(p.x, p.y, p.z + 0.05, new THREE.Color(J.look.dark).getHex(), 1); flash('KNOT OUT!', '#22c55e', 0.8); buzz(15); SFX.knot(); react(PET, 'relief', 0.8, 'note'); checkDone(); } } }
  function soapAt(x, y, d) { const mud = J.tasks.includes('mud'); for (const s of PET.soap) { if (s.cover >= 1 || dist2(wp(s.pt.a), x, y) > R()) continue; s.cover = Math.min(1, s.cover + d / (upg('shampoo') ? 150 : 300)); s.suds = s.cover; s.sud.scale.setScalar(0.2 + s.cover * 0.8); if (!mud) s.dirt.scale.set(1.3 * (1 - s.cover * 0.9), 1 - s.cover * 0.9, 0.3);
      if (Math.random() < 0.25) { const p = wp(s.pt.a); drop(p.clone().add(V3(0, 0.05, 0.05)), V3(rr(-0.2, 0.2), rr(0.2, 0.5), 0.1), mud ? 0x6b4a2c : 0xffffff); if (!mud && Math.random() < 0.5) bubble(p, 1); } SFX.foam(mud ? 0.28 : 0.2);
      if (mud) { if (Math.random() < 0.05) react(PET, 'happy', 1, 'heart', 'happy'); } else if (s.pt.j === 2 && Math.random() < 0.07) { react(PET, 'kick', 1.2, 'note', 'giggle'); flash('TICKLISH SPOT!', '#7dd3fc', 0.9); } else if (Math.random() < 0.03) react(PET, 'giggle', 0.8, 'note', 'giggle');
      if (s.cover >= 1) { tone(880, 0.06, 0.04); if (mud) { heart(wp(PET.head).add(V3(0, 0.3, 0))); S.mood = Math.min(1, S.mood + 0.06); } checkDone(); } } if (mud) S.mood = Math.min(1, S.mood + d / 4000); }
  function rinseAt(x, y, dt) { let hit = false; for (const s of PET.soap) { if (s.rinsed || s.cover < 1) continue; if (dist2(wp(s.pt.a), x, y) > R() * 1.35) continue; hit = true; s.suds -= dt * 1.4; if (Math.random() < dt * 4) bubble(wp(s.pt.a), 1); if (Math.random() < dt * 0.6) react(PET, 'nervous', 0.8, 'sweat'); s.sud.scale.setScalar(Math.max(0.01, s.suds)); if (s.suds <= 0) { s.rinsed = true; s.sud.visible = false; s.dirt.visible = false; SFX.pop(0.3); checkDone(); } }
    if (onHead(x, y)) { S.mood -= dt * 0.25; if (performance.now() - (S.faceT || 0) > 1800) { S.faceT = performance.now(); flash('NOT IN THE FACE!', '#ec3013', 1.2); tone(260, 0.12, 0.04, 'sawtooth'); react(PET, 'sputter', 0.9, 'anger', 'angry'); } } return hit; }
  function dryAt(x, y, dt) { const r = R() * 1.1; for (const w of PET.wetSpots) { if (w.wet <= 0 || w.move) continue; const d = dist2(wp(w.m), x, y);
      if (d < r) { if (Math.random() < dt * 0.8) react(PET, 'lean', 1.1, 'heart'); w.wet -= dt * (upg('dryer') ? 1.5 : 0.95); w.m.scale.setScalar(0.4 + w.wet * 0.6); if (Math.random() < 0.3) { const p = wp(w.m); puff(p.x, p.y, p.z + 0.05, 0xffffff, 1); } if (w.wet <= 0) { w.m.visible = false; tone(1320, 0.06, 0.03); const l = PET.wetSpots.filter(q => q.wet > 0).length, n = PET.wetSpots.length; PET.furMat.color.copy(PET.base).multiplyScalar(0.72 + 0.28 * (1 - l / n)); if (!l) { PET.furMat.color.copy(PET.base); PET.shag.forEach(s => s.scale.set(0.085, 0.065, 0.085)); } flash('DRY!', '#22c55e', 0.7); checkDone(); } }
      else if (d < r * 2.4 && w.wet > 0.3 && (w.cool -= dt) <= 0) { const cur = w.pt, cand = PET.patches.filter(p => Math.abs(p.i - cur.i) + Math.abs(p.j - cur.j) === 1 && !PET.wetSpots.some(o => o !== w && o.wet > 0 && o.pt === p)); if (cand.length) { const best = cand.reduce((a, b) => dist2(wp(b.a), x, y) > dist2(wp(a.a), x, y) ? b : a); w.move = { from: w.m.position.clone(), to: best.a.position.clone(), t: 0 }; w.pt = best; w.cool = upg('dryer') ? 1.4 : 0.75; tone(1500, 0.04, 0.02, 'sine'); if (Math.random() < 0.5) react(PET, 'giggle', 0.6, 'note', Math.random() < 0.5 ? 'giggle' : null); } } }
    if (onHead(x, y)) { S.mood -= dt * 0.18; if (performance.now() - (S.faceT || 0) > 1800) { S.faceT = performance.now(); flash('NOT IN THE FACE!', '#ec3013', 1.2); tone(260, 0.12, 0.04, 'sawtooth'); react(PET, 'sputter', 0.8, 'anger'); } } }
  function trimMove(x, y) { const P = PET, tr = P.trim[P.trimI]; if (!tr) return; const nd = dist2(wp(tr.dot), x, y);
    if (nd < R() * 0.9) { cutTrim(); return; } const prev = P.trim[P.trimI - 1], a = prev ? scr(wp(prev.dot)) : null, b = scr(wp(tr.dot)); let off = nd; if (a) { const vx = b.x - a.x, vy = b.y - a.y, L2 = vx * vx + vy * vy || 1, k = clamp(((x - a.x) * vx + (y - a.y) * vy) / L2, 0, 1); off = Math.hypot(a.x + vx * k - x, a.y + vy * k - y); }
    if (off > R() * 2.4) { S.slips++; S.ptr && (S.ptr.kind = null); S.mood -= 0.06; flash('OFF THE LINE · START AGAIN ON THE GLOWING DOT', '#ec3013', 1.4); SFX.wrong(); react(PET, 'flinch', 0.5, '!'); } }
  function cutTrim() { const P = PET, tr = P.trim[P.trimI]; tr.cut = true; tr.tf.scale.set(0.05, 0.05, 0.06); tr.dot.visible = false; const p = wp(tr.a); puff(p.x, p.y + 0.1, p.z, new THREE.Color(J.look.dark).getHex(), 2); SFX.snip(); P.st.twitch = 1; if (Math.random() < 0.25) emote(P, 'sweat'); P.trimI++; if (P.trimI >= P.trim.length) { S.ptr && (S.ptr.kind = null); checkDone(); } }
  const clawZones = () => upg('clippers') ? CLAW_G2 : CLAW_G;
  function clawZone(v) { const [g0, g1] = clawZones(); return v < 0.24 ? 'LONG' : v < g0 ? 'OK' : v <= g1 ? 'CLEAN' : v < 0.82 ? 'OK' : 'QUICK'; }
  function clawTap() { const P = PET, c = P.claws[P.pawI]; if (!c) return; const z = clawZone(S.claw.v);
    if (z === 'LONG') { flash('STILL TOO LONG · WAIT FOR THE GREEN', '#ffffff', 1.1); tone(330, 0.06, 0.03); return; }
    c.done = true; c.q = z === 'CLEAN' ? 1 : z === 'OK' ? 0.7 : 0.35; c.cl.forEach(k => k.scale.set(1, z === 'QUICK' ? 0.35 : 0.5, 1)); SFX.clip();
    if (z === 'QUICK') { S.mood -= 0.35; P.st.hop = 1; flash('TOO CLOSE! YELP!', '#ec3013', 1.4); react(P, 'yelp', 0.8, 'anger', 'yelp'); MUS.sting('oops'); buzz(120); } else { flash(z === 'CLEAN' ? 'CLEAN CLIP!' : 'A BIT ROUGH', z === 'CLEAN' ? '#22c55e' : '#e6b45a', 1); react(P, z === 'CLEAN' ? 'relief' : 'flinch', 0.7, z === 'CLEAN' ? 'note' : '?'); }
    P.pawI++; S.claw.v = 0; S.claw.d = 1; checkDone(); }
  function hoofAt(x, y, d) { for (const h of PET.hooves) { if (h.shine >= 1 || dist2(wp(h.m), x, y) > R() * 1.05) continue; h.shine = Math.min(1, h.shine + d / 240); h.mat.color.set('#6a5a50').lerp(new THREE.Color('#2a1c18'), h.shine); if (Math.random() < 0.035) react(PET, 'happy', 0.9, 'note', Math.random() < 0.4 ? 'happy' : null); SFX.squeak(); if (h.shine >= 1) { h.sp.material.opacity = 1; const p = wp(h.m); for (let i = 0; i < 3; i++) drop(p.clone().add(V3(0, 0.1, 0.1)), V3(rr(-0.3, 0.3), rr(0.4, 0.8), 0.1), 0xfff2a0); flash('SHINY!', '#22c55e', 0.8); tone(1760, 0.08, 0.04); sparkle(p, 5, 0.12); checkDone(); } } }
  // treats: tap the jar = gentle toss (always lands) · drag and FLICK it at her mouth = CATCH bonus
  function throwTreat(from, P, { dur = 0.55, hit = true, flick = false, land = null, walk = null } = {}) { const m = treatMesh(); m.position.copy(from); const to = hit ? wp(P.mouth) : land; flying.push({ m, a: from.clone(), b: to, t: 0, dur, hit, flick, P, walk }); SFX.whoosh(); }
  function treatGrab(cx, cy) { if (S.mode !== 'job' || S.phase !== 'work' || !PET || DM.on) return; audio.init && audio.init(); if (S.treats <= 0) { flash('NO TREATS LEFT FOR THIS ONE', '#e6b45a', 1.2); return; } const r = renderer.domElement.getBoundingClientRect(), x = cx - r.left, y = cy - r.top; S.tdrag = { x0: x, y0: y, pts: [{ x, y, t: performance.now() }], m: treatMesh() }; placeOnPlane(S.tdrag.m, x, y, 0.5); }
  const plane = new THREE.Plane(), ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V3();
  function placeOnPlane(obj, x, y, toward = 0.3) { if (!PET) return null; const c = wp(PET.torso), n = V3().subVectors(camera.position, c).setY(0).normalize(); plane.setFromNormalAndCoplanarPoint(n, c); ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (!ray.ray.intersectPlane(plane, hitP)) return null; obj && obj.position.copy(hitP).addScaledVector(n, toward); return hitP.clone(); }
  function treatRelease() { const D0 = S.tdrag; S.tdrag = null; if (!D0) return; scene.remove(D0.m); if (!PET) return; const L = D0.pts, last = L[L.length - 1], moved = Math.hypot(last.x - D0.x0, last.y - D0.y0); S.treats--;
    const from = D0.m.position.lengthSq() > 0.01 ? D0.m.position.clone() : wp(PET.torso).add(V3(0.6, 0.4, 0.6)), mouth = scr(wp(PET.mouth));
    if (moved < 14) { throwTreat(from, PET, { dur: 0.55, hit: true }); return; }
    let k = L.length - 1; while (k > 0 && last.t - L[k - 1].t < 110) k--; const f = L[k], dtm = Math.max(16, last.t - f.t), vx = (last.x - f.x) / dtm * 1000, vy = (last.y - f.y) / dtm * 1000, sp = Math.hypot(vx, vy);
    if (sp > 420) { const want = Math.atan2(mouth.y - last.y, mouth.x - last.x), got = Math.atan2(vy, vx); let err = Math.abs(want - got); if (err > Math.PI) err = 2 * Math.PI - err; const ok = err < 0.42 || Math.hypot(mouth.x - last.x, mouth.y - last.y) < 50;
      if (ok) throwTreat(from, PET, { dur: 0.45, hit: true, flick: true }); else { const land = wp(PET.torso).add(V3(rr(-0.9, 0.9), -0.3, rr(0.3, 0.6))); land.y = TY + 0.03; throwTreat(from, PET, { dur: 0.5, hit: false, land }); } return; }
    if (Math.hypot(mouth.x - last.x, mouth.y - last.y) < Math.max(50, scrR(wp(PET.head), PET.S0.hr) * 1.4)) throwTreat(from, PET, { dur: 0.3, hit: true }); else { const land = from.clone(); land.y = TY + 0.03; throwTreat(from, PET, { dur: 0.35, hit: false, land }); } }
  // ---------- input ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (DM.on || S.mode !== 'job' || S.phase !== 'work' || !PET) return; const { x, y } = local(e); e.preventDefault(); const T0 = S.tool; S.ptr = { x, y, kind: null };
    const near = (L, f) => L && L.some(o => f(o) && dist2(f(o), x, y) < R()), tgt = T0 === 'brush' ? near(PET.tangles, o => o.hp > 0 && wp(o.g)) : T0 === 'scrub' || T0 === 'mud' ? near(PET.soap, o => o.cover < 1 && wp(o.pt.a)) : T0 === 'rinse' ? near(PET.soap, o => !o.rinsed && wp(o.pt.a)) : T0 === 'dry' ? near(PET.wetSpots, o => o.wet > 0 && wp(o.m)) : T0 === 'hooves' ? near(PET.hooves, o => o.shine < 1 && wp(o.m)) : false;
    if (T0 !== 'claws' && T0 !== 'trim' && !tgt && onHead(x, y)) { S.ptr.kind = 'pet'; return; }
    if (T0 === 'trim' && onHead(x, y) && PET.trimI === 0) { S.ptr.kind = 'pet'; return; }
    if (!T0) return; if (locked(T0)) { setTool(T0); return; } if (T0 === 'calm') { flash('PET HER HEAD', '#ffffff', 1); return; } if (wigglyBlock()) return;
    if (T0 === 'brush') { S.ptr.kind = 'rub'; brushAt(x, y, 10); } else if (T0 === 'scrub' || T0 === 'mud') { S.ptr.kind = 'rub'; soapAt(x, y, 10); } else if (T0 === 'hooves') { S.ptr.kind = 'rub'; hoofAt(x, y, 10); }
    else if (T0 === 'rinse' || T0 === 'dry') S.ptr.kind = 'spray';
    else if (T0 === 'trim') { const tr = PET.trim[PET.trimI]; if (tr && dist2(wp(tr.dot), x, y) < R() * 1.6) { S.ptr.kind = 'trim'; trimMove(x, y); } else flash('START ON THE GLOWING DOT', '#ffffff', 1.1); }
    else if (T0 === 'claws') clawTap(); }
  function onMove(e) { if (S.tdrag) { const { x, y } = local(e); S.tdrag.pts.push({ x, y, t: performance.now() }); if (S.tdrag.pts.length > 30) S.tdrag.pts.shift(); placeOnPlane(S.tdrag.m, x, y, 0.5); return; }
    S.hover = local(e); const P0 = S.ptr; if (!P0 || !P0.kind || !PET) return; const { x, y } = local(e), d = Math.hypot(x - P0.x, y - P0.y); if (d < 1) return; P0.lx = x; P0.ly = y;
    if (P0.kind === 'pet') { if (onHead(x, y)) petHead(d); }
    else if (P0.kind === 'rub') { if (S.wiggly) { wigglyBlock(); } else { const n = Math.ceil(d / 12); for (let i = 1; i <= n; i++) { const qx = P0.x + (x - P0.x) * i / n, qy = P0.y + (y - P0.y) * i / n, dd = d / n; if (S.tool === 'brush') brushAt(qx, qy, dd); else if (S.tool === 'hooves') hoofAt(qx, qy, dd); else soapAt(qx, qy, dd); } } }
    else if (P0.kind === 'trim') { if (S.wiggly) { wigglyBlock(); P0.kind = null; } else { const n = Math.ceil(d / 10); for (let i = 1; i <= n && P0.kind === 'trim'; i++) trimMove(P0.x + (x - P0.x) * i / n, P0.y + (y - P0.y) * i / n); } }
    P0.x = x; P0.y = y; }
  function onUp(e) { if (S.tdrag) { treatRelease(); return; } S.ptr = null; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);
  const onKD = e => { if (S.mode !== 'walk' || PAUSE) return; const c = e.code; if (c === 'KeyE' || c === 'Enter') { e.preventDefault(); if (!e.repeat) talk(); return; } if (c === 'Digit1') { if (!e.repeat) api.melee(); return; } if (c === 'Digit2') { if (!e.repeat) api.range(); return; } if (c === 'Space' || c === 'Digit3') { e.preventDefault(); if (!e.repeat) api.jump(); return; } keys.add(c); };
  const onKU = e => keys.delete(e.code), onBlur = () => keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  // ---------- flow ----------
  function toWalk(fromDoor = false) { if (DM.on) demoStop(); clearPet(); ownerFox.forEach(f => f.visible = false); parsnip.P.g.visible = true; S.mode = 'walk'; S.phase = 'walk'; S.done = null; S.react = null; S.flash = null; S.say = ''; S.tool = null;
    benWork.visible = false; benWalk.visible = true; if (fromDoor) { BEN.x = Y.spots.walkStart.x; BEN.z = Y.spots.walkStart.z; BEN.face = Math.PI; } else { BEN.x = Y.spots.benWork.x + 0.2; BEN.z = Y.spots.benWork.z + 0.9; BEN.face = Math.PI * 0.85; } benWalk.rotation.y = BEN.face; place(marlow, Y.spots.marlowCounter, 0); CAMW.yaw = 0; snapCam = true; }
  function toIntro() { if (DM.on) return; closeDialog(); S.mode = 'job'; S.phase = 'intro'; S.done = null; clearPet(); ownerFox.forEach(f => f.visible = false); parsnip.P.g.visible = true; setUniform(true); benWalk.visible = false; benWork.visible = true; place(benWork, Y.spots.benWork, -0.25); place(marlow, Y.spots.marlowIntro, -0.6); tone(523, 0.08, 0.03); }
  function startDay() { if (S.mode !== 'job' || (S.phase !== 'intro' && S.phase !== 'done')) return; audio.init && audio.init(); Object.assign(S, { petN: 0, earned: 0, tips: 0, starList: [], done: null, react: null }); benWork.visible = false; place(marlow, Y.spots.marlowDay, 0.3); say('MARLOW: "First one is coming in. The groom card says what they need. No clock — do it right."', 5); nextPet(); }
  function handBack() { if (S.phase !== 'work' || !PET) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND BACK AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishJob(); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['Look at that coat! Brand new!', 'Best groom in all of Nebo!', 'Smells like honey and moss. Perfect.'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Lovely work, thank you!', 'Soft as a lantern moth.', 'Good as new.'] },
    okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['Hmm. A few bits are still messy.', 'It will do for today.', 'Thanks, I suppose.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half of it is not done!', 'Still damp and still tangled!', 'Marlow would have done better.'] } };
  function finishJob() { const T0 = J.tasks, qs = T0.map(t => { const I = info(t); return I.done ? I.q : (I.prog || 0) * 0.4; }), avgMood = S.moodN ? S.moodSum / S.moodN : S.mood;
    let q = qs.reduce((a, b) => a + b, 0) / T0.length; q *= 0.82 + 0.18 * avgMood; q -= Math.min(0.15, S.wiggles * 0.04); const stars = q >= 0.88 ? 3 : q >= 0.68 ? 2 : 1, level = stars === 3 ? (q >= 0.95 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const done = T0.filter(t => info(t).done).length, pay = J.PT.price + done * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('music') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; setTimeout(() => SFX.coins(), 500); S.starList.push(stars); const Rr = REACT[level]; owner.userData.mood = Rr.mood; S.react = { word: Rr.word, col: Rr.col, line: pick(Rr.lines), who: OWN.name, pet: J.name, stars, tip, pay, t: 0 };
    S.phase = 'react'; S.phT = 0; S.ptr = null; S.hopT = 0; S.hopA = PET.g.position.clone(); setTimeout(() => { if (!PET) return; if (stars >= 2) { accessory(PET, OWN); sparkle(wp(PET.head), 10, 0.3); } if (stars === 3) { react(PET, 'spin', 1.2, 'sparkle', 'happy'); sparkle(wp(PET.torso), 14, 0.7); MUS.sting('star'); buzz([20, 40, 20]); } else if (stars === 2) react(PET, 'happy', 1.2, 'heart', 'happy'); else react(PET, 'flinch', 0.8, '?'); }, 750); tone(level === 'grumpy' ? 260 : 880, 0.18, 0.05, level === 'grumpy' ? 'sawtooth' : 'triangle'); if (stars === 3) { setTimeout(() => tone(1175, 0.1, 0.05), 110); setTimeout(() => tone(1568, 0.16, 0.05), 220); heart(owner.position.clone().add(V3(0, 2.5, 0)), 4); } }
  function endDay() { S.phase = 'done'; MUS.sting('day'); clearPet(); ownerFox.forEach(f => f.visible = false); parsnip.P.g.visible = true; benWork.visible = true; place(benWork, Y.spots.benWork, -0.25); place(marlow, Y.spots.marlowIntro, -0.6);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.groomed, save.stat(SAVE.groomed, 0) + S.starList.length); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('petUniform')) { save.setFlag('petUniform'); unlock.push("GROOMER'S UNIFORM (cap, towel + Marlow's tee)"); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, groomed: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    say(eod ? 'MARLOW: "Employee of the day! Every pet in Nebo will want you."' : avg >= 2 ? 'MARLOW: "Good, steady hands. Come back tomorrow."' : 'MARLOW: "Slow down. Keep them happy and the rest follows."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); tone(1320, 0.1, 0.05); return true; }
  // ---------- camera ----------
  const { SAFE, shotFor } = cameraFit(ST), CAM = { look: V3(0, 1.2, 0) }; let snapCam = true;
  camera.position.set(0, 7, 10); camera.lookAt(CAM.look);
  const bx = (p, r, o) => { o.push(V3(p.x - r, p.y - r, p.z), V3(p.x + r, p.y + r, p.z)); return o; };
  function petPts(full) { const P = PET, o = [], g = P.g.position, { rx, ry, rz } = P.S0, cy = P.cy; o.push(V3(g.x - rx - 0.15, g.y + cy - ry, g.z + rz), V3(g.x + rx, g.y + cy + ry + 0.05, g.z + rz)); const h = wp(P.head), hr = P.S0.hr; o.push(V3(h.x + hr * 1.5, h.y + hr * 1.6, h.z), V3(h.x + hr, h.y - hr, h.z)); if (full) o.push(V3(g.x, g.y, g.z + rz), V3(g.x - rx, g.y, g.z)); return o; }
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; for (const s of [Y.spots.benWork, Y.spots.marlowIntro]) o.push(V3(s.x - 0.5, 0, s.z), V3(s.x + 0.5, 0, s.z), V3(s.x, 2.5, s.z)); o.push(V3(T.x - 1, TY, T.z + 0.5), V3(T.x - 0.6, 2.6, T.z - 0.4)); return o; }, 0.2, Math.PI - 0.3, port ? 0.1 : 0.06);
    if (!PET) return shotFor('room' + k, () => [V3(-5, 0, -4), V3(0, 0, 0), V3(-2, 3, -5)], 0.4, Math.PI - 0.2, 0.05);
    if (S.phase === 'react') { const ow = Y.spots.ownerWait; return shotFor('react' + k, () => [V3(ow.x - 0.7, 0, ow.z), V3(ow.x + 1.6, 0, ow.z + 0.4), V3(ow.x, 2.7, ow.z), V3(ow.x + 1.2, 1.3, ow.z + 0.4)], 0.16, Math.PI - 0.12, 0.1); }
    if (S.phase === 'arrive' || S.phase === 'hop' || S.phase === 'leave') return shotFor('wait' + k + S.phase, () => [V3(T.x - 1, TY, T.z - 0.6), V3(T.x + 1, 0, T.z + 0.6), V3(Y.spots.ownerWait.x + 0.5, 0, Y.spots.ownerWait.z), V3(Y.spots.ownerWait.x, 2.6, Y.spots.ownerWait.z), V3(T.x, TY + 1.6, T.z)], 0.26, Math.PI - 0.25, 0.06);
    const T0 = S.tool, P = PET, id = P.g.id;
    if (T0 === 'claws' || T0 === 'hooves') return shotFor(T0 + k + id, () => { const o = []; P.paws.forEach(pw => { const p = wp(pw); o.push(V3(p.x - 0.12, p.y - 0.08, p.z), V3(p.x + 0.12, p.y + 0.25, p.z)); }); const h = wp(P.head), c = wp(P.torso); o.push(V3(h.x, h.y, h.z), V3(c.x, c.y + P.S0.ry, c.z)); return o; }, 0.12, Math.PI - 0.1, 0.08);
    if (T0 === 'calm') return shotFor('calm' + k + id, () => { const h = wp(P.head), o = []; bx(h, P.S0.hr * 1.8, o); o.push(wp(P.torso)); return o; }, 0.18, Math.PI - 0.15, 0.08);
    if (T0 === 'trim') return shotFor('trim' + k + id, () => { const o = []; P.trim.forEach(t => bx(wp(t.a), 0.2, o)); bx(wp(P.head), P.S0.hr, o); return o; }, 0.3, Math.PI - 0.06, 0.07);
    return shotFor('body' + k + id, () => petPts(false), 0.22, Math.PI - 0.1, 0.06); }
  function walkCam(dt) { const port = CW() < CHh(), d = (port ? 11.5 : 9.0) * (CAMW.zoom || 1), tgt = V3(BEN.x * 0.85, 1.1, BEN.z * 0.85 - 0.4), yaw = CAMW.yaw, pit = CAMW.pitch;
    const pos = V3(tgt.x + Math.sin(yaw) * Math.cos(pit) * d, tgt.y + Math.sin(pit) * d, tgt.z + Math.cos(yaw) * Math.cos(pit) * d); pos.x = clamp(pos.x, -6.5, 6.5); return { pos, look: tgt }; }
  // ---------- tool cursor (the 3D tool follows your finger) ----------
  const TOOL3 = {}; { const M = (geo, mat, x, y, z, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); par.add(m); return m; }; const mk = (fn) => { const g = new THREE.Group(); fn(g); g.visible = false; g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.depthTest = false; o.material.transparent = true; } o.renderOrder = 33; }); scene.add(g); return g; };
    TOOL3.brush = mk(g => { M(new THREE.BoxGeometry(0.32, 0.08, 0.14), toon('#b8945f'), 0, 0.06, 0, g, 0.006); for (let i = 0; i < 6; i++) M(new THREE.BoxGeometry(0.03, 0.07, 0.11), toon('#f2e6c8'), -0.12 + i * 0.048, 0, 0, g, 0); M(new THREE.CylinderGeometry(0.025, 0.025, 0.28, 8), toon('#8a5a32'), 0.26, 0.08, 0, g, 0.004).rotation.z = Math.PI / 2; });
    TOOL3.scrub = mk(g => { M(new THREE.BoxGeometry(0.26, 0.12, 0.16), toon('#f2c94c'), 0, 0, 0, g, 0.008); M(new THREE.BoxGeometry(0.26, 0.04, 0.16), toon('#3f8a4a'), 0, 0.08, 0, g, 0.004); });
    TOOL3.mud = mk(g => { M(new THREE.SphereGeometry(0.13, 10, 8), toon('#6b4a2c'), 0, 0, 0, g, 0.008, 0.13); });
    TOOL3.rinse = mk(g => { const h = M(new THREE.CylinderGeometry(0.12, 0.08, 0.08, 14), toon('#d7dde3'), 0, 0.3, 0, g, 0.006); h.rotation.x = 0; M(new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), toon('#d7dde3'), 0.1, 0.5, 0, g, 0.004).rotation.z = -0.5; });
    TOOL3.dry = mk(g => { M(new THREE.CylinderGeometry(0.07, 0.1, 0.3, 12), toon('#f2c94c'), 0, 0.35, 0, g, 0.006); M(new THREE.BoxGeometry(0.08, 0.22, 0.08), toon('#201e1d'), 0.08, 0.2, 0, g, 0.004); });
    TOOL3.trim = mk(g => { for (const s of [-1, 1]) { const b = M(new THREE.BoxGeometry(0.26, 0.025, 0.012), toon('#d7dde3'), 0.08, 0.02, s * 0.01, g, 0.003); b.rotation.z = s * 0.18; M(new THREE.TorusGeometry(0.04, 0.012, 6, 12), toon('#e2453f'), -0.08, -s * 0.05, 0, g, 0); } });
    TOOL3.hooves = mk(g => { M(new THREE.BoxGeometry(0.2, 0.06, 0.14), toon('#fbf8ec'), 0, 0, 0, g, 0.006); M(new THREE.BoxGeometry(0.2, 0.02, 0.14), toon('#e2453f'), 0, 0.04, 0, g, 0); });
    TOOL3.pet = mk(g => { M(new THREE.SphereGeometry(0.09, 10, 8), toon('#f2741f'), 0, 0, 0, g, 0.006, 0.09); for (let i = 0; i < 3; i++) M(new THREE.SphereGeometry(0.035, 8, 6), toon('#f2741f'), 0.08, 0.05, -0.05 + i * 0.05, g, 0.004, 0.035); }); }
  function toolCursor(dt) { for (const k in TOOL3) TOOL3[k].visible = false; if (S.mode !== 'job' || S.phase !== 'work' || !PET || DM.on && !DM.cur) return; const pt = DM.on ? DM.cur : S.ptr && S.ptr.kind ? { x: S.ptr.x, y: S.ptr.y } : (!ST.touch && S.hover ? S.hover : null); if (!pt) return;
    const kind = S.ptr && S.ptr.kind === 'pet' ? 'pet' : DM.on && DM.curKind ? DM.curKind : S.tool; const m = TOOL3[kind]; if (!m) return; const hp = placeOnPlane(null, pt.x, pt.y); if (!hp) return; const n = V3().subVectors(camera.position, hp).setY(0).normalize();
    m.visible = true; m.position.copy(hp).addScaledVector(n, 0.35); m.lookAt(camera.position); m.rotateY(Math.PI / 2); if (kind === 'brush' || kind === 'scrub' || kind === 'hooves' || kind === 'pet') m.position.y += Math.sin(performance.now() / 60) * 0.015;
    const spraying = (S.ptr && S.ptr.kind === 'spray') || (DM.on && DM.spray); if (spraying && (kind === 'rinse' || kind === 'dry')) { const tip = m.position.clone().add(V3(0, 0.3, 0)); if (kind === 'rinse') { for (let i = 0; i < 2; i++) drop(tip.clone().add(V3(rr(-0.05, 0.05), 0, rr(-0.05, 0.05))), V3().subVectors(hp, tip).multiplyScalar(2.2).add(V3(rr(-0.2, 0.2), 0, rr(-0.2, 0.2)))); if (Math.random() < 0.2) audio.burst && audio.burst(0.04, 3200, 0.03); } else if (Math.random() < 0.5) puff(tip.x, tip.y - 0.1, tip.z, 0xffffff, 1); } }
  // ---------- DEMO: autopilot grooms one dog (all six jobs) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, cur: null, curKind: null, spray: false };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  const at = (o, kind) => { const s = scr(o.isVector3 ? o : wp(o)); DM.cur = { x: s.x, y: s.y }; DM.curKind = kind; return s; };
  function demoAct() { if (!PET) return 0.5; const P = PET, T0 = nextTask(); DM.spray = false;
    if (S.mood < 0.58 && !DM.seen.treat && S.treats > 0) { const w = cap('treat', 'FLICK', 'GETTING WIGGLY! DRAG A TREAT FROM THE JAR AND FLICK IT AT HER MOUTH', 2.2); if (w) return w; S.treats--; const from = placeOnPlane(null, CW() * 0.85, CHh() * 0.7) || wp(P.torso); throwTreat(from.add(V3(0, 0, 0.4)), P, { dur: 0.45, hit: true, flick: true }); return 1.2; }
    if (S.mood < 0.5 && !DM.seen.pet2) { const w = cap('pet2', 'RUB', 'RUB HER HEAD ANY TIME TO KEEP HER HAPPY'); if (w) return w; }
    if (S.mood < 0.55 && DM.seen.pet2 && (DM.petting = (DM.petting || 0) + 1) < 14) { const s = at(P.head, 'pet'); DM.cur.x += Math.sin(DM.petting) * 16; petHead(26); return 0.07; } DM.petting = 0;
    if (!T0 || allDone()) { DM.cur = null; DM.cap = 'EVERY JOB DONE: TAP HAND BACK'; DM.key = 'TAP'; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handBack(); return 1; }
    if (S.tool !== T0) { setTool(T0); DM.cur = null; DM.cap = 'JOB ' + (J.tasks.indexOf(T0) + 1) + ' OF ' + J.tasks.length + ': TAP ' + TASKS[T0].label + ' AT THE BOTTOM'; DM.key = 'TAP'; return 1.4; }
    if (T0 === 'brush') { const t = P.tangles.find(q => q.hp > 0); const w = cap('brush', 'RUB', 'RUB BACK AND FORTH OVER EACH KNOT TO BRUSH IT OUT'); if (w) return w; DM.j = (DM.j || 1) * -1; const s = at(t.g, 'brush'); DM.cur.x += DM.j * 14; brushAt(s.x, s.y, 40); return 0.08; }
    if (T0 === 'scrub') { const s0 = P.soap.find(q => q.cover < 1); const w = cap('scrub', 'RUB', 'RUB EVERY DIRTY SPOT UNTIL IT IS ALL SUDS'); if (w) return w; DM.j = (DM.j || 1) * -1; const s = at(s0.pt.a, 'scrub'); DM.cur.x += DM.j * 14; soapAt(s.x, s.y, 45); return 0.08; }
    if (T0 === 'rinse') { const s0 = P.soap.find(q => !q.rinsed); const w = cap('rinse', 'HOLD', 'HOLD THE SHOWER OVER THE SUDS UNTIL THEY WASH AWAY'); if (w) return w; const s = at(s0.pt.a, 'rinse'); DM.spray = true; rinseAt(s.x, s.y, 0.12); return 0.1; }
    if (T0 === 'dry') { const w0 = P.wetSpots.find(q => q.wet > 0); const w = cap('dry', 'DRAG', 'DRAG THE DRYER ONTO THE WET PATCHES. THEY RUN AWAY, SO CHASE THEM', 2.2); if (w) return w; if (w0.move) return 0.1; const s = at(w0.m, 'dry'); DM.spray = true; dryAt(s.x, s.y, 0.14); return 0.1; }
    if (T0 === 'trim') { const w = cap('trim', 'TRACE', 'START ON THE GLOWING DOT AND TRACE THE LINE TO THE NECK'); if (w) return w; const tr = P.trim[P.trimI]; at(tr.dot, 'trim'); cutTrim(); return 0.22; }
    if (T0 === 'claws') { const w = cap('claws', 'TAP', 'WATCH THE NEEDLE. TAP WHEN IT IS IN THE GREEN', 2.0); if (w) return w; DM.cur = null; const z = clawZone(S.claw.v); if (z === 'CLEAN') { at(P.paws[P.pawI], 'trim'); clawTap(); return 0.7; } return 0.02; }
    return 0.5; }
  function demoStep(dt) { if (S.phase === 'arrive' || S.phase === 'hop') { DM.cap = J && J.parsnip ? 'PARSNIP IS BACK FROM THE WOODS' : 'PETS COME IN WITH THEIR OWNERS AND HOP UP ON THE TABLE'; DM.key = ''; DM.cur = null; return; }
    if (S.phase === 'react') { DM.cap = 'THE OWNER CHECKS YOUR WORK. HAPPY PETS EARN STARS AND TIPS'; DM.key = '★'; DM.cur = null; return; } if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || S.mode !== 'job' || (S.phase !== 'intro' && S.phase !== 'done')) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.cap = 'WATCH A GROOM AT MARLOW\'S'; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 3; S.forceType = 'dog'; startDay(); S.forceType = null; S.mood = 0.62; }
  function demoStop() { if (!DM.on) return; DM.on = false; DM.cur = null; S.ptr = null; S.react = null; S.flash = null; S.day = DM.day0; clearPet(); ownerFox.forEach(f => f.visible = false); parsnip.P.g.visible = true; Object.assign(S, { mode: 'job', phase: 'intro', done: null, petN: 0, earned: 0, tips: 0, starList: [], tool: null }); benWork.visible = true; place(benWork, Y.spots.benWork, -0.25); place(marlow, Y.spots.marlowIntro, -0.6); }
  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.mode !== 'job' || S.phase !== 'work' || !PET) return null; const T0 = S.tool, P = PET, H = (p, text, tool = T0) => ({ p, text, tool, r: 0.2, v: true });
    if (S.wiggly) return H(wp(P.head), 'SHE IS WIGGLY · PET HER HEAD OR FLICK A TREAT');
    if (!T0 || info(T0).done || locked(T0)) { const nx = nextTask(); return allDone() ? { text: 'ALL DONE · TAP HAND BACK', tool: 'hand' } : nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : null; }
    if (T0 === 'calm') return H(wp(P.head), 'RUB HER HEAD UNTIL SHE SETTLES · ' + info('calm').txt);
    if (T0 === 'brush') { const t = P.tangles.find(q => q.hp > 0); return H(wp(t.g), 'RUB OVER THE KNOT TO BRUSH IT OUT · ' + info(T0).left + ' LEFT'); }
    if (T0 === 'scrub' || T0 === 'mud') { const s = P.soap.find(q => q.cover < 1); return H(wp(s.pt.a), (T0 === 'mud' ? 'RUB ON THE WARM MUD · ' : 'RUB TO SCRUB UP SUDS · ') + info(T0).txt); }
    if (T0 === 'rinse') { const s = P.soap.find(q => !q.rinsed); return H(wp(s.pt.a), 'HOLD THE SHOWER OVER THE SUDS · ' + info(T0).left + ' LEFT'); }
    if (T0 === 'dry') { const w = P.wetSpots.find(q => q.wet > 0); return H(wp(w.m), 'DRAG THE DRYER ONTO THE WET PATCH · CHASE IT!'); }
    if (T0 === 'trim') { const t = P.trim[P.trimI]; return t ? H(wp(t.dot), P.trimI ? 'KEEP TRACING THE LINE · ' + info(T0).txt : 'PUT YOUR FINGER ON THE GLOWING DOT AND TRACE') : null; }
    if (T0 === 'claws') { const p = P.paws[P.pawI]; return p ? H(wp(p), 'TAP WHEN THE NEEDLE IS IN THE GREEN · PAW ' + (P.pawI + 1) + ' / 4') : null; }
    if (T0 === 'hooves') { const h = P.hooves.find(q => q.shine < 1); return h ? H(wp(h.m), 'RUB THE HOOF UNTIL IT SHINES · ' + info(T0).txt) : null; }
    return null; }
  let HINT = null, hintT = 0;
  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const walkTo = (f, tx, tz, dt, sp = 2.4, fox = true) => { const dx = tx - f.position.x, dz = tz - f.position.z, d = Math.hypot(dx, dz); if (d < 0.05) return true; const s = Math.min(d, sp * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; const want = fox ? Math.atan2(dx, dz) : Math.atan2(-dz, dx); let dr = want - f.rotation.y; while (dr > Math.PI) dr -= Math.PI * 2; while (dr < -Math.PI) dr += Math.PI * 2; f.rotation.y += dr * Math.min(1, dt * 10); return false; };
  function stepAmbient(t, dt) { Y.tick(t, dt);
    for (const p of pups) { const P = p.P, g = P.g, nearBen = S.mode === 'walk' && Math.hypot(BEN.x - g.position.x, BEN.z - g.position.z) < 3.2; p.wait -= dt; if (nearBen && p.wait < 0) { p.tx = clamp(BEN.x - 0.6, Y.pen.x0, Y.pen.x1); p.tz = clamp(BEN.z + rr(-0.5, 0.5), Y.pen.z0, Y.pen.z1); p.wait = 0.6; } else if (p.wait < 0) { p.tx = rr(Y.pen.x0, Y.pen.x1); p.tz = rr(Y.pen.z0, Y.pen.z1); p.wait = rr(1.5, 4); }
      const arrived = walkTo(g, p.tx, p.tz, dt, nearBen ? 2.2 : 1.2, false); animPet(P, dt, { speed: arrived ? 0 : 1.5, mood: 0.95, lookAt: nearBen ? benWalk.position.clone().add(V3(0, 1.5, 0)) : null, petting: P.st.petT > 0 }); P.st.petT = Math.max(0, P.st.petT - dt); }
    if (parsnip.P.g.visible) { const P = parsnip.P, g = P.g; parsnip.wait -= dt; if (parsnip.wait < 0) { parsnip.tx = rr(Y.stall.x0, Y.stall.x1); parsnip.tz = rr(Y.stall.z0, Y.stall.z1); parsnip.wait = rr(2, 5); } const arrived = walkTo(g, parsnip.tx, parsnip.tz, dt, 0.7, false); const nearBen = S.mode === 'walk' && Math.hypot(BEN.x - g.position.x, BEN.z - g.position.z) < 3;
      animPet(P, dt, { speed: arrived ? 0 : 0.8, mood: 0.8, lookAt: nearBen ? benWalk.position.clone().add(V3(0, 1.4, 0)) : null, petting: P.st.petT > 0 }); if (arrived) P.head.rotation.z = -0.35 + Math.sin(t * 6) * 0.06; P.st.petT = Math.max(0, P.st.petT - dt); if (Math.random() < dt * 0.15 && S.mode === 'walk' && nearBen) SFX.voice('pig', 'sniff'); }
    { soot.awake = Math.max(0, soot.awake - dt); animPet(soot.P, dt, { sleep: soot.awake <= 0, mood: 0.6, petting: soot.awake > 0 }); soot.P.st.hop = 0; } }
  function step(dt) { const t = clock.elapsedTime; S.t = t; S.phT += dt;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; S.toastT -= dt; if (S.toastT <= 0) S.toast = null;
    for (const p of smokeS) { p.s.visible = p.life > 0; if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.9; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.14 + (1 - p.life) * 0.25); }
    for (const h of hearts) { h.s.visible = h.life > 0; if (h.life <= 0) { h.s.material.opacity = 0; continue; } h.life -= dt * 0.8; h.s.position.addScaledVector(h.v, dt); h.s.material.opacity = Math.min(1, h.life * 2); h.s.scale.setScalar(0.22 + (1 - h.life) * 0.1); }
    for (const d of drops) { d.s.visible = d.life > 0; if (d.life <= 0) { d.s.material.opacity = 0; continue; } d.life -= dt * 1.6; d.v.y -= dt * 6; d.s.position.addScaledVector(d.v, dt); d.s.material.opacity = 0.9 * d.life; }
    for (const b of bubbles) { b.s.visible = b.life > 0; if (b.life <= 0) { b.s.material.opacity = 0; if (b.was) { b.was = false; if (Math.random() < 0.5) SFX.pop(0.12); } continue; } b.was = true; b.life -= dt; b.s.position.addScaledVector(b.v, dt); b.s.position.x += Math.sin(t * 6 + b.r * 50) * 0.003; b.s.material.opacity = Math.min(0.95, b.life * 2); b.s.scale.setScalar(b.r * (1 + (b.life < 0.12 ? (0.12 - b.life) * 6 : 0))); }
    for (const k of sparks) { k.s.visible = k.life > 0; if (k.life <= 0) { k.s.material.opacity = 0; continue; } k.life -= dt; k.s.position.addScaledVector(k.v, dt); k.s.material.opacity = Math.min(1, k.life * 2); k.s.scale.setScalar(0.12 * Math.sin(Math.min(1, k.life) * Math.PI) + 0.03); k.s.material.rotation += dt * 3; }
    for (const P of emoList) { const e = P.emoS; if (!e.visible) continue; e.userData.life -= dt; if (e.userData.life <= 0 || !P.g.parent) { e.visible = false; continue; } const sc = P.g.scale.x || 1, a = e.userData.dur - e.userData.life, pop = a < 0.18 ? 0.6 + a / 0.18 * 0.55 : a < 0.3 ? 1.15 - (a - 0.18) / 0.12 * 0.15 : 1; P.head.getWorldPosition(e.position); e.position.y += (P.S0.hr + 0.38) * sc + Math.sin(t * 5) * 0.02; e.position.x -= 0.12 * sc; e.scale.setScalar(0.4 * Math.max(0.6, sc) * pop * Math.min(1, e.userData.life * 3)); }
    if (S.shakeT > 0 && PET) { S.shakeT -= dt; for (let i = 0; i < 3; i++) drop(wp(PET.torso).add(V3(rr(-0.5, 0.5), rr(0, 0.3), rr(-0.1, 0.4))), V3(rr(-2.2, 2.2), rr(0.5, 2.2), rr(0.2, 2.2))); if (Math.random() < dt * 8) tone(1800 + Math.random() * 800, 0.02, 0.015, 'sine'); }
    stepBlobs();
    { const spr = S.mode === 'job' && S.phase === 'work' && !S.wiggly && ((S.ptr && S.ptr.kind === 'spray') || (DM.on && DM.spray && DM.cur)); SFX.loop('spray', spr && S.tool === 'rinse'); SFX.loop('dryer', spr && S.tool === 'dry'); }
    if (S.mode === 'walk') { const dd = Math.hypot(BEN.x - (S.lastX ?? BEN.x), BEN.z - (S.lastZ ?? BEN.z)); S.lastX = BEN.x; S.lastZ = BEN.z; S.stepAcc = (S.stepAcc || 0) + dd; if (S.stepAcc > 0.62) { S.stepAcc = 0; S.stepAlt = !S.stepAlt; SFX.step(0.12, S.stepAlt); } }
    if (PET && J && S.phase !== 'arrive') { const fresh = allDone(); PET.furMat.emissive.lerp(fresh ? _warm : _black, Math.min(1, dt * 2)); if (fresh && Math.random() < dt * 2.5) sparkle(wp(PET.torso).add(V3(rr(-0.5, 0.5), rr(-0.1, 0.3), rr(0, 0.3))), 1, 0.05); }
    if (PET && PET.acc && PET.accT < 1) { PET.accT = Math.min(1, PET.accT + dt * 2.5); const k = PET.accT, e = 1 + Math.sin(k * Math.PI) * 0.35; PET.acc.scale.setScalar(Math.max(0.01, k * e)); }
    MUS.setMode(S.mode === 'walk' ? 'walk' : (S.phase === 'intro' || S.phase === 'done') && !DM.on ? 'menu' : 'work');
    if (S.mode === 'walk' && Math.hypot(BEN.x - 6, BEN.z) < 5 && Math.random() < dt * 0.5) { const f = 2400 + Math.random() * 1200; tone(f, 0.05, 0.02, 'sine'); setTimeout(() => tone(f * 1.2, 0.06, 0.02, 'sine'), 70); }
    for (let i = flying.length - 1; i >= 0; i--) { const f = flying[i]; f.t += dt / f.dur; const k = Math.min(1, f.t); if (f.hit && f.P) f.b = wp(f.P.mouth); f.m.position.lerpVectors(f.a, f.b, k); f.m.position.y += Math.sin(k * Math.PI) * 0.45; f.m.rotation.z += dt * 14;
      if (k >= 1) { scene.remove(f.m); flying.splice(i, 1); const P = f.P; if (f.hit) { P.st.chomp = 1; heart(wp(P.head).add(V3(0, 0.3, 0)), f.flick ? 3 : 2); react(P, 'happy', 0.9, f.flick ? 'star' : 'heart', 'happy'); SFX.crunch(); tone(f.flick ? 1046 : 880, 0.08, 0.05); setTimeout(() => tone(f.flick ? 1568 : 1175, 0.1, 0.05), 90);
          if (f.walk) { P.st.hop = 1; P.st.petT = 1.2; if (f.walk === 'cat') soot.awake = 2.5; toast(f.walk === 'pups' ? 'Caught it mid-air! The other puppy looks betrayed.' : f.walk === 'parsnip' ? 'Parsnip crunches it up and checks you for more.' : 'Old Soot eats it without opening both eyes.'); }
          else if (PET && P === PET) { S.mood = Math.min(1, S.mood + (f.flick ? 0.55 : 0.38)); flash(f.flick ? 'CATCH! +MOOD' : 'YUM! +MOOD', '#22c55e', 1.1); if (S.wiggly && S.mood > 0.45) S.wiggly = false; if (!S.calmed && S.mood >= 0.92) { S.calmed = true; checkDone(); } } }
        else if (PET && P === PET) { S.mood = Math.min(1, S.mood + 0.12); flash('MISSED! SHE SNIFFED IT UP ANYWAY', '#e6b45a', 1.3); tone(330, 0.1, 0.04); react(P, 'sniff', 1.2, '?'); } } }
    stepAmbient(t, dt);
    if (S.mode === 'walk') { // ---- walk the store ----
      let ix = S.stick.x, iy = S.stick.y; if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1; if (keys.has('KeyW') || keys.has('ArrowUp')) iy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1;
      const m = Math.min(1, Math.hypot(ix, iy)), dlg = !!S.dialog; let sp = 0;
      if (m > 0.08 && !dlg) { const yaw = CAMW.yaw, fx = -Math.sin(yaw), fz = -Math.cos(yaw), rxv = Math.cos(yaw), rzv = -Math.sin(yaw), l = Math.hypot(ix, iy) || 1, mx = (rxv * ix + fx * iy) / l, mz = (rzv * ix + fz * iy) / l; sp = 3.6 * m; const nx = BEN.x + mx * sp * dt, nz = BEN.z + mz * sp * dt, c = Y.collide(nx, nz, 0.42); BEN.x = c.x; BEN.z = c.z; BEN.face = Math.atan2(mx, mz); }
      let dr = BEN.face - benWalk.rotation.y; while (dr > Math.PI) dr -= Math.PI * 2; while (dr < -Math.PI) dr += Math.PI * 2; benWalk.rotation.y += dr * Math.min(1, dt * 12); benWalk.position.set(BEN.x, 0, BEN.z);
      kit.animFox(benWalk, dt, sp); const it = nearest(); S.near = it; S.prompt = dlg ? null : it ? it.label : null;
      marlow.userData.lookAt = Math.hypot(BEN.x - marlow.position.x, BEN.z - marlow.position.z) < 4.5 ? benWalk.position.clone().add(V3(0, 1.6, 0)) : null; kit.animFox(marlow, dt, 0);
      const sh = walkCam(dt); if (snapCam) { camera.position.copy(sh.pos); CAM.look.copy(sh.look); snapCam = false; } camera.position.lerp(sh.pos, Math.min(1, dt * 4)); CAM.look.lerp(sh.look, Math.min(1, dt * 4)); camera.lookAt(CAM.look); camera.updateMatrixWorld(); Y.front.forEach(f => f.visible = false); Y.overhead.forEach(o => o.visible = false); { const b = scr(V3(BEN.x, 1.4, BEN.z)), lim = Math.min(CW(), CHh()) * 0.3; Y.lanterns.forEach(l => { const s = scr(l.position); l.visible = Math.hypot(s.x - b.x, s.y - b.y) > lim || s.y > b.y; }); } RINGS.place(null, 0, dt); toolCursor(dt); return; }
    // ---- the job ----
    Y.front.forEach(f => f.visible = false); Y.overhead.forEach(o => o.visible = S.phase === 'intro' || S.phase === 'done'); { const wide = S.phase === 'intro' || S.phase === 'done'; camera.updateMatrixWorld(); Y.lanterns.forEach(l => { const s = scr(l.position); l.visible = wide || s.z > 1 || s.x < -40 || s.x > CW() + 40 || s.y < -40 || s.y > CHh() + 40; }); } marlow.userData.lookAt = PET ? wp(PET.head) : null; kit.animFox(marlow, dt, 0);
    if (PET && owner) { const P = PET, g = P.g, ow = Y.spots.ownerWait;
      if (S.phase === 'arrive') { const mid = Y.spots.mid; const tgt = S.phT < 1.6 && Math.hypot(owner.position.x - mid.x, owner.position.z - mid.z) > 0.3 && owner.position.z > mid.z + 0.2 ? mid : ow; const ar = walkTo(owner, tgt.x, tgt.z, dt, 2.2); kit.animFox(owner, dt, ar ? 0 : 2.2);
        const pt = V3(owner.position.x + 0.8, 0, owner.position.z + 0.5), pa = walkTo(g, pt.x, pt.z, dt, 2.3, false); animPet(P, dt, { speed: pa ? 0 : 1.6, mood: S.mood, lookAt: owner.position.clone().add(V3(0, 1.5, 0)) });
        if (ar && tgt === ow) { owner.rotation.y = damp(owner.rotation.y, Math.atan2(T.x - ow.x, T.z - ow.z), 6, dt); if (S.phT > 0.5 && !S.helloSaid) { S.helloSaid = true; say(OWN.name + ': "' + J.line + '"', 4.5); } if (S.helloSaid) { S.phase = 'hop'; S.phT = 0; S.hopA = g.position.clone(); } } }
      else if (S.phase === 'hop') { kit.animFox(owner, dt, 0); const hf = Y.spots.hopFrom; if (S.phT < 1.2) { const ar = walkTo(g, hf.x, hf.z, dt, 2.2, false); animPet(P, dt, { speed: ar ? 0 : 1.6, mood: S.mood }); if (ar) S.phT = Math.max(S.phT, 1.2); S.hopA = g.position.clone(); }
        else { const k = Math.min(1, (S.phT - 1.2) / 0.6), e = smooth(0, 1, k); g.position.set(S.hopA.x + (T.x - S.hopA.x) * e, TY * e + Math.sin(k * Math.PI) * 0.7, S.hopA.z + (T.z - S.hopA.z) * e); g.rotation.y = damp(g.rotation.y, 0, 8, dt); animPet(P, dt, { mood: S.mood }); if (k >= 1) { g.position.set(T.x, TY, T.z); g.rotation.y = 0; react(P, J.type === 'cat' ? 'angry' : 'happy', 1.0, J.type === 'cat' ? 'anger' : 'note', J.type === 'cat' ? 'angry' : 'happy'); S.phase = 'work'; S.helloSaid = false; tone(660, 0.08, 0.04); setTool(nextTask()); if (J.type === 'cat') flash('SHE WON\'T LET YOU YET · CALM HER FIRST', '#e6b45a', 2.2); } } }
      else if (S.phase === 'work') { g.position.set(T.x, TY, T.z); g.rotation.y = P.st.spin || 0; owner.position.set(ow.x, 0, ow.z); owner.rotation.y = Math.atan2(T.x - ow.x, T.z - ow.z); kit.animFox(owner, dt, 0);
        const busy = S.ptr && S.ptr.kind && S.ptr.kind !== 'pet', dec = J.PT.decay * (1 + (S.day - 1) * 0.12) * (busy ? 1.6 : 1) * (J.tasks.includes('mud') && S.tool === 'mud' ? 0 : 1); if (!(DM.on && S.mood < 0.36)) S.mood = Math.max(0, S.mood - dec * dt);
        if (!S.wiggly && S.mood < 0.22 && S.calmed) { S.wiggly = true; S.wiggles++; MUS.sting('oops'); buzz(80); emote(P, 'anger', 2); voice(P, 'angry'); flash('WIGGLY! PET HER HEAD OR FLICK A TREAT', '#ec3013', 1.8); tone(330, 0.1, 0.04, 'sawtooth'); S.ptr && S.ptr.kind !== 'pet' && (S.ptr.kind = null); } if (S.wiggly && S.mood > 0.45) S.wiggly = false; S.moodSum += S.mood * dt; S.moodN += dt;
        if (S.ptr && S.ptr.kind === 'spray' && !S.wiggly) { if (S.tool === 'rinse') rinseAt(S.ptr.x, S.ptr.y, dt); else if (S.tool === 'dry') dryAt(S.ptr.x, S.ptr.y, dt); } else if (S.ptr && S.ptr.kind === 'spray' && S.wiggly) wigglyBlock();
        if (S.tool === 'claws' && P.claws[P.pawI]) { S.claw.v += S.claw.d * dt * (0.85 + S.day * 0.12); if (S.claw.v >= 1) { S.claw.v = 1; S.claw.d = -1; } if (S.claw.v <= 0) { S.claw.v = 0; S.claw.d = 1; } }
        for (const w of P.wetSpots) { if (!w.move) continue; w.move.t = Math.min(1, w.move.t + dt * 4); w.m.position.lerpVectors(w.move.from, w.move.to, w.move.t); w.m.position.addScaledVector(w.pt.a.userData.n, Math.sin(w.move.t * Math.PI) * 0.08); if (w.move.t >= 1) w.move = null; }
        P.trim.forEach((tr, i) => { if (tr.dot) { tr.dot.visible = S.tool === 'trim' && !tr.cut; const nx = i === P.trimI; tr.dot.scale.setScalar(nx ? 1.6 + Math.sin(t * 8) * 0.4 : 1); tr.dot.material.color.set(nx ? 0xffd23a : 0xffffff); } });
        const idle = !S.ptr && !DM.on && performance.now() - (S.lastInput || 0) > 2500 && !P.st.act && !S.wiggly;
        if (idle && (S.idleT = (S.idleT || 0) - dt) <= 0) { S.idleT = rr(3, 6); const pickA = pick(J.type === 'dog' ? ['yawn', 'sneeze', 'kick', 'sniff', 'happy'] : J.type === 'cat' ? ['lick', 'yawn', 'lick', 'sniff'] : ['sniff', 'sneeze', 'happy', 'yawn']); react(P, pickA, pickA === 'kick' ? 1.1 : pickA === 'lick' ? 1.6 : 1.3, pickA === 'yawn' ? 'zzz' : pickA === 'sneeze' ? '!' : pickA === 'happy' ? 'note' : null, pickA === 'yawn' || pickA === 'sneeze' || pickA === 'sniff' ? pickA : pickA === 'happy' ? 'happy' : null); if (pickA === 'sneeze') setTimeout(() => { if (PET) bubble(wp(PET.mouth), 3); }, 800); }
        if (S.tool === 'claws' && P.claws[P.pawI] && !P.st.act && Math.random() < dt * 1.5) react(P, 'nervous', 0.9, Math.random() < 0.3 ? 'sweat' : null);
        if (S.wiggly && Math.random() < dt * 0.6) emote(P, 'anger', 1.2);
        const lookAt = S.ptr && S.ptr.kind ? placeOnPlane(null, S.ptr.x, S.ptr.y) : idle && Math.sin(t * 0.7) > 0.3 ? camera.position.clone() : null; animPet(P, dt, { mood: S.mood, wiggly: S.wiggly, lookAt, petting: P.st.petT > 0 || (S.ptr && S.ptr.kind === 'pet') }); P.st.petT = Math.max(0, P.st.petT - dt);
        if (S.wiggly && Math.random() < dt * 3 && J.tasks.includes('rinse') && info('rinse').done && !info('dry').done) drop(wp(P.torso).add(V3(rr(-0.4, 0.4), 0.2, 0.3)), V3(rr(-1, 1), rr(1, 2), rr(0, 1))); }
      else if (S.phase === 'react') { if (S.react) S.react.t += dt; const k = Math.min(1, S.phT / 0.7), hf = V3(ow.x + 0.8, 0, ow.z + 0.4), e = smooth(0, 1, k); g.position.set(S.hopA.x + (hf.x - S.hopA.x) * e, TY * (1 - e) + Math.sin(k * Math.PI) * 0.6, S.hopA.z + (hf.z - S.hopA.z) * e); animPet(P, dt, { mood: 1, lookAt: owner.position.clone().add(V3(0, 1.5, 0)), petting: true }); kit.animFox(owner, dt, 0); owner.userData.lookAt = wp(P.head); owner.rotation.y = damp(owner.rotation.y, 0.55, 5, dt);
        if (S.react && S.react.stars >= 2 && Math.random() < dt * 3) heart(wp(P.head).add(V3(0, 0.3, 0))); if (S.phT > 3) { S.react = null; S.phase = 'leave'; S.phT = 0; owner.userData.lookAt = null; } }
      else if (S.phase === 'leave') { const dz = Y.spots.door, ar = walkTo(owner, dz.x, dz.z + 1.0, dt, 2.4), pa = walkTo(g, owner.position.x + 0.7, owner.position.z + 0.4, dt, 2.5, false); kit.animFox(owner, dt, ar ? 0 : 2.4); animPet(P, dt, { speed: pa ? 0 : 1.6, mood: 1 });
        if (ar || S.phT > 6) { if (DM.on) { demoStop(); return; } S.petN++; if (S.petN >= PETSTORE.perDay) endDay(); else nextPet(); } } }
    const greet = S.phase === 'intro' || S.phase === 'done'; kit.animFox(benWork, dt, 0); benWork.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32);
    if (!DM.on && S.phase === 'work' && S.tool && (info(S.tool).done) && !S.ptr && performance.now() - (S.userToolT || 0) > 3000 && performance.now() - (S.lastInput || 0) > 1200) { const nx = nextTask(); if (nx && !locked(nx)) setTool(nx); }
    const sh = shot(), rate = S.phase === 'work' ? 3.2 : 2.2; if (snapCam) { camera.position.copy(sh.pos); CAM.look.copy(sh.look); snapCam = false; } camera.position.lerp(sh.pos, Math.min(1, dt * rate)); CAM.look.lerp(sh.look, Math.min(1, dt * rate)); camera.lookAt(CAM.look);
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt);
    if (vis) { const n = V3().subVectors(camera.position, vis.p).normalize(); RINGS.pulse.lookAt(RINGS.pulse.position.clone().add(n)); RINGS.pulse2.quaternion.copy(RINGS.pulse.quaternion); RINGS.pulse.position.addScaledVector(n, 0.12); RINGS.pulse2.position.copy(RINGS.pulse.position); RINGS.pulse.scale.multiplyScalar(0.6); RINGS.pulse2.scale.multiplyScalar(0.6); RINGS.arrow.visible = false; }
    toolCursor(dt); }
  // RingGeometry in the kit is laid flat (rotateX); we orient the meshes to face the camera instead
  RINGS.pulse.geometry = new THREE.RingGeometry(0.8, 1, 40); RINGS.pulse2.geometry = RINGS.pulse.geometry;
  let FROZEN = false; function frame() { raf = requestAnimationFrame(frame); if (FROZEN) return; const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() { const P = PET;
    return { mode: S.mode, phase: S.phase, day: S.day, petN: S.petN, perDay: PETSTORE.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { owner: OWN.name, pet: J.name, kind: J.PT.kind, type: J.type, parsnip: J.parsnip, tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt, locked: locked(id) }; }) } : null,
      tool: S.tool, mood: S.mood, wiggly: S.wiggly, treats: S.treats, allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      claw: S.phase === 'work' && S.tool === 'claws' && P && P.claws[P.pawI] ? { v: S.claw.v, zone: clawZone(S.claw.v), g: clawZones(), paw: P.pawI + 1 } : null,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('petUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      walk: { prompt: S.mode === 'walk' ? S.prompt : null, dialog: S.mode === 'walk' ? dialogHud() : null, toast: S.mode === 'walk' ? S.toast : null, near: S.near ? S.near.id : null },
      groomed: save.stat(SAVE.groomed, 0), music: MUS.on }; }
  // ---------- the API (page buttons + the Game HUD engine contract) ----------
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setTool, handBack, startDay, demoStart, demoStop, buyUpgrade, hud, toIntro, toWalk, treatGrab, tossTreat() { if (S.mode === 'walk') return tossTreatWalk(); if (S.phase !== 'work' || !PET) return; if (S.treats <= 0) { flash('NO TREATS LEFT FOR THIS ONE', '#e6b45a', 1.2); return; } S.treats--; const from = placeOnPlane(null, CW() * 0.85, CHh() * 0.65) || wp(PET.torso); throwTreat(from.add(V3(0, 0, 0.4)), PET, { hit: true }); },
    // Game HUD contract (walk mode)
    start() {}, talk, choose, closeDialog, nextLine, clearToast() { S.toast = null; },
    melee() { if (S.mode !== 'walk') return; const it = S.near; if (it && it.animal) petAnimal(it.id); else if (it) useSpot(it); else toast('Walk up to an animal to pet it.'); },
    range() { if (S.mode === 'walk') tossTreatWalk(); }, jump() { if (S.mode === 'walk' && !S.dialog) { benWalk.userData.hop = 1; tone(520, 0.08, 0.03); } }, meleeUp() {},
    useItem(id) { const it = SHOP.find(q => q.id === id); toast(id === 'petTreats' ? 'Press 2 (TREAT) near an animal to toss one.' : it ? it.label + ': keep it for later.' : 'Not much use for that in here.'); }, closeWheel() {}, skipTime() {},
    setPaused(v) { PAUSE = !!v; }, setHudPad() {}, setStick(x, y) { S.stick.x = x; S.stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; },
    lookBy(dx, dy) { CAMW.yaw = clamp(CAMW.yaw - dx * 0.004, -0.7, 0.7); CAMW.pitch = clamp(CAMW.pitch + dy * 0.003, 0.35, 1.1); }, zoomBy(f) { CAMW.zoom = clamp((CAMW.zoom || 1) * f, 0.6, 1.4); }, getCam() { return { dist: (CAMW.zoom || 1) * 10, pitch: CAMW.pitch }; }, setCam(d, p) { if (p != null) CAMW.pitch = clamp(p, 0.35, 1.1); },
    mapData() { return { p: [BEN.x, BEN.z, benWalk.rotation.y], b: [['GROOMING', T.x, T.z], ['COUNTER', 3.6, -3.7], ['AVIARY', 6.1, -0.2], ['FISH TANK', 6.5, 3.4], ['PUPPIES', -5.7, 0.3], ['PARSNIP', -5.7, 4.0], ['DOOR', 0, 5.5]], f: [[marlow.position.x, marlow.position.z]], e: [], q: S.mode === 'walk' ? [3.6, -2.9, 'MARLOW'] : null }; },
    setMinimap() {}, toggleSound() { return MUS.toggle(); }, toggleMusic() { MUS.unlock(); return MUS.toggle(); }, cycleWeather() {},
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _freeze(v = true) { FROZEN = v; }, _info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures }), _audio: () => ({ state: MUS.ctx && MUS.ctx.state, on: MUS.on }), _sfx: SFX, _mus: MUS, _state: () => S, _pet: () => PET, _job: () => J, _scr: scr, _wp: wp, _ben: BEN, _force(t) { S.forceType = t; },
    _auto() { const P = PET; return { calm() { S.mood = 1; S.calmed = true; checkDone(); }, brush() { P.tangles.forEach(t => { t.hp = 0; t.g.visible = false; }); checkDone(); }, soap() { P.soap.forEach(s => { s.cover = 1; s.suds = 1; s.sud.scale.setScalar(1); }); checkDone(); }, rinse() { P.soap.forEach(s => { s.rinsed = true; s.sud.visible = false; s.dirt.visible = false; }); checkDone(); }, dry() { P.wetSpots.forEach(w => { w.wet = 0; w.m.visible = false; }); P.furMat.color.copy(P.base); checkDone(); }, trim() { while (P.trimI < P.trim.length) cutTrim(); }, claws() { P.claws.forEach(c => { c.done = true; c.q = 1; }); P.pawI = 4; checkDone(); }, hooves() { P.hooves.forEach(h => { h.shine = 1; }); checkDone(); } }; },
    destroy() { SFX.stopAll(); document.removeEventListener('visibilitychange', onVis); MUS.destroy(); removeEventListener('pointerdown', unlockAudio, true); removeEventListener('keydown', unlockAudio, true); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  if (start === 'walk') toWalk(true); else toIntro();
  frame();
  return api;
}
