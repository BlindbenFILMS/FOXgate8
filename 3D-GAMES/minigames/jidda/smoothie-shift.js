// 8 GATES — JIDDA · FOXY BLENDS: THE SHIFT [jSmoothie]. Ben works Julep's smoothie bar on the Jidda piers. Built on the Luxor Deli / Meru Burgers engine + engine/restaurant-kit.js.
// Steps follow the original 2D smoothie game: CHOP the fruit (swipe) → ICE (tap) → YOGURT (hold, stop in the band) → BLEND (hold, let go at CHUNKY / SMOOTH / SILKY) → POUR (hold, stop at the line) → topping → SERVE → PAY.
// Stations: FRUIT (crates + cutting board) · BLEND (ice bucket, yogurt tub, blender, sink) · POUR (glasses, pour mat, topping jars, tray) · SERVE (carrier stand + customers). Save keys jidda.smoothie.*, flag smoothieUniform.
// MERGE: buildBar(ctx) builds the interior at an origin; createSmoothieShift({ container }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';

export const BLENDS = { name: 'FOXY BLENDS · THE SHIFT', room: 'jSmoothie', shift: 180 };
export const FRUIT = {
  strawberry: { name: 'STRAWBERRY', col: '#e2453f', dark: '#a82c26', flesh: '#f07a72' }, mango: { name: 'MANGO', col: '#f0a03a', dark: '#c47a1e', flesh: '#f8c877' },
  blueberry: { name: 'BLUEBERRY', col: '#6b5b9a', dark: '#453a6b', flesh: '#8f7fbc' }, banana: { name: 'BANANA', col: '#f2d970', dark: '#c4a832', flesh: '#f8ecab' }, kiwi: { name: 'KIWI', col: '#8fae4e', dark: '#5f7c30', flesh: '#bcd483' } };
const FK = Object.keys(FRUIT);
export const TEX = { chunky: { name: 'CHUNKY', z: [0.3, 0.52], col: '#a8792e' }, smooth: { name: 'SMOOTH', z: [0.52, 0.74], col: '#0e7fb8' }, silky: { name: 'SILKY', z: [0.74, 0.95], col: '#8a2a8a' } };
const texOf = b => b < 0.3 ? 'lumpy' : b < 0.52 ? 'chunky' : b < 0.74 ? 'smooth' : b < 0.95 ? 'silky' : 'watery', TEX_NAME = k => (TEX[k] || { name: k === 'lumpy' ? 'LUMPY' : 'WATERY' }).name;
export const RECIPES = [
  { id: 'splash', name: 'STRAWBERRY SPLASH', day: 1, fruits: ['strawberry'], price: 4 },
  { id: 'tide', name: 'MANGO TIDE', day: 1, fruits: ['mango'], price: 4 },
  { id: 'reef', name: 'BERRY REEF', day: 1, fruits: ['strawberry', 'blueberry'], price: 6 },
  { id: 'break', name: 'BANANA BREAK', day: 2, fruits: ['banana', 'mango'], price: 6 },
  { id: 'kelp', name: 'KIWI KELP', day: 3, fruits: ['kiwi', 'banana'], price: 6 },
  { id: 'sunrise', name: 'JIDDA SUNRISE', day: 4, fruits: ['mango', 'strawberry', 'kiwi'], price: 8 },
  { id: 'wave', name: 'FIVE-FRUIT WAVE', day: 5, fruits: ['strawberry', 'mango', 'blueberry', 'banana', 'kiwi'], price: 11 }];
export const TOPS = { granola: { name: 'GRANOLA', day: 2, price: 1, col: '#c99a5a' }, coconut: { name: 'COCONUT', day: 2, price: 1, col: '#fbf8ec' }, mint: { name: 'MINT', day: 3, price: 1, col: '#4f9a4a' } };
export const UPGRADES = [
  { id: 'sharp', name: 'SHARP KNIFE', cost: 40, line: 'Fruit cuts in 3 swipes, not 4.' },
  { id: 'scoop', name: 'BIG ICE SCOOP', cost: 30, line: 'One tap drops 2 cubes.' },
  { id: 'fastPour', name: 'WIDE SPOUT', cost: 35, line: 'The jug pours 40% faster.' },
  { id: 'bigCrate', name: 'BIG CRATES', cost: 50, line: 'Fruit crates hold 10, not 6.' },
  { id: 'radio', name: 'UKULELE RADIO', cost: 60, line: 'Happy customers wait 20% longer.' }];
const CUSTOMERS = [
  { name: 'JORN', role: 'Crest skiff', torso: ['#1f3350', '#e6ecf4', '#16263c'] }, { name: 'JODY', role: 'Shuffleboard', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#e2453f', '#fbf8ec', '#a82c26'] },
  { name: 'JAGO', role: 'Piers', fur: '#c9682a', furDark: '#8a4213', torso: ['#3f5d47', '#e6b45a', '#2b4232'] }, { name: 'JETSAM', role: 'Piers', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'], outfit: 'coat' },
  { name: 'JARL', role: 'Armory', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#4a4a52', '#d7dde3', '#2a2a30'] }, { name: 'JIB', role: 'Surf shop', torso: ['#2f9a8f', '#f2d970', '#1f6a62'] },
  { name: 'NETTER PELL', role: 'Townsfolk', torso: ['#7a5a3a', '#efe2c4', '#4a3420'], outfit: 'coat' }, { name: 'COOPER WRAY', role: 'Townsfolk', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#8f2b1e', '#fce7f3', '#661a10'] },
  { name: 'MARRAM', role: 'Townsfolk', torso: ['#a78bfa', '#ede9fe', '#5b21b6'] }, { name: 'SISTER SHOAL', role: 'Townsfolk', fur: '#dedcd6', furDark: '#a8a6a0', torso: ['#cfe8e4', '#fbf8ec', '#2f4a44'], outfit: 'robe' }];
const LINES = { order: ['Something cold, please!', 'Big day on the waves.', 'Make it quick?', 'Smells like summer in here.', 'The usual!'], angry: ['Too slow!', 'I am going surfing instead.'] };
const SAVE = { day: 'jidda.smoothie.day', best: 'jidda.smoothie.best', upg: 'jidda.smoothie.upg.', stars: 'jidda.smoothie.stars' };
const ICE_N = 3, YOG = [0.45, 0.65], POUR = [0.72, 0.9];

// ---------------- fruit art (crates, cutting board, jug) ----------------
export function wholeFruit(T3, toon, k, outline) {
  const g = new T3.Group(), F = FRUIT[k], add = (geo, col, x = 0, y = 0, z = 0, o = 0.008) => { const m = new T3.Mesh(geo, toon(col)); m.position.set(x, y, z); m.castShadow = true; if (outline && o) outline(m, o); g.add(m); return m; };
  if (k === 'strawberry') { const b = add(new T3.ConeGeometry(0.075, 0.15, 14), F.col, 0, 0.075, 0); b.rotation.x = Math.PI; for (let i = 0; i < 9; i++) { const a = i * 2.3, y = 0.04 + (i % 3) * 0.03, r = 0.022 + (y - 0.02) * 0.4; add(new T3.SphereGeometry(0.006, 4, 3), '#f6e27a', Math.cos(a) * r, y, Math.sin(a) * r, 0); } for (let i = 0; i < 5; i++) add(new T3.BoxGeometry(0.05, 0.006, 0.018), '#4f8a2a', Math.cos(i * 1.26) * 0.03, 0.152, Math.sin(i * 1.26) * 0.03, 0).rotation.y = -i * 1.26; }
  else if (k === 'mango') { add(new T3.SphereGeometry(0.1, 16, 12), F.col, 0, 0.08, 0).scale.set(1.3, 0.8, 0.9); add(new T3.SphereGeometry(0.06, 10, 8), '#e2453f', -0.07, 0.11, 0, 0).scale.set(1, 0.6, 1.1); add(new T3.CylinderGeometry(0.006, 0.006, 0.03, 5), '#5e3a1e', 0.11, 0.13, 0, 0); }
  else if (k === 'blueberry') { add(new T3.BoxGeometry(0.2, 0.06, 0.16), '#fbf8ec', 0, 0.03, 0); for (let i = 0; i < 9; i++) add(new T3.SphereGeometry(0.03, 8, 6), F.col, -0.06 + (i % 3) * 0.06, 0.075 + (i % 2) * 0.01, -0.045 + Math.floor(i / 3) * 0.045, 0.004); }
  else if (k === 'banana') { const b = add(new T3.TorusGeometry(0.13, 0.034, 8, 18, Math.PI * 0.72), F.col, 0, 0.04, 0); b.rotation.x = Math.PI / 2; b.rotation.z = Math.PI * 0.64; b.scale.z = 0.9; add(new T3.SphereGeometry(0.014, 5, 4), '#5e3a1e', -0.115, 0.04, -0.06, 0); }
  else { add(new T3.SphereGeometry(0.075, 14, 10), '#8a6a3a', 0, 0.065, 0).scale.set(1.25, 0.85, 0.9); }
  return g; }
export function fruitPiece(T3, toon, k, outline) {
  const g = new T3.Group(), F = FRUIT[k], add = (geo, col, x = 0, y = 0, z = 0, o = 0.004) => { const m = new T3.Mesh(geo, toon(col)); m.position.set(x, y, z); m.castShadow = true; if (outline && o) outline(m, o); g.add(m); return m; };
  if (k === 'strawberry') { const h = add(new T3.SphereGeometry(0.035, 10, 6, 0, Math.PI), F.col, 0, 0.012, 0); h.rotation.x = -Math.PI / 2; h.scale.set(1, 1.3, 0.5); add(new T3.CircleGeometry(0.028, 10), F.flesh, 0, 0.0285, 0, 0).rotation.x = -Math.PI / 2; }
  else if (k === 'mango') add(new T3.BoxGeometry(0.05, 0.04, 0.05), F.flesh, 0, 0.02, 0).rotation.y = 0.5;
  else if (k === 'blueberry') { add(new T3.SphereGeometry(0.026, 8, 6), F.col, 0, 0.026, 0); add(new T3.SphereGeometry(0.024, 8, 6), F.col, 0.04, 0.024, 0.02); }
  else if (k === 'banana') { add(new T3.CylinderGeometry(0.034, 0.034, 0.016, 14), F.flesh, 0, 0.008, 0); add(new T3.CylinderGeometry(0.01, 0.01, 0.018, 6), '#e0c970', 0, 0.008, 0, 0); }
  else { add(new T3.CylinderGeometry(0.045, 0.045, 0.012, 16), '#7ab33a', 0, 0.006, 0); add(new T3.CylinderGeometry(0.014, 0.014, 0.014, 8), '#f4f1d8', 0, 0.006, 0, 0); for (let i = 0; i < 8; i++) add(new T3.SphereGeometry(0.004, 4, 3), '#201e1d', Math.cos(i * 0.785) * 0.024, 0.013, Math.sin(i * 0.785) * 0.024, 0); }
  return g; }
const mixCol = fr => { const c = new THREE.Color(0, 0, 0); if (!fr.length) return new THREE.Color('#f6f1e6'); fr.forEach(k => c.add(new THREE.Color(FRUIT[k].flesh))); c.multiplyScalar(1 / fr.length); return c.lerp(new THREE.Color('#f6f1e6'), 0.25); };

// ---------------- the smoothie bar interior ----------------
export function buildBar(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 12, D = 10, H = 4.2, teal = toon('#2f9a8f'), tealD = toon('#1f6a62'), coral = toon('#e2453f'), sand = toon('#efe2c4'), white = toon('#fbf8ec'), chrome = toon('#d7dde3'), ink = toon('#201e1d'), wood = toon('#b8945f'), woodD = toon('#8a6a3a');
  const floorT = CTX(256, 256, c => { c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#7cc4bb'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 32, y * 32, 32, 32); c.fillStyle = '#e2453f'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 32 + 13, y * 32 + 13, 6, 6); }); floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2, D / 2);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  { const kt = floorT.clone(); kt.needsUpdate = true; kt.repeat.set(W / 2, 8 / 2); const kf = new T3.Mesh(new T3.PlaneGeometry(W, 8), new T3.MeshToonMaterial({ map: kt, gradientMap: ctx.grad })); kf.rotation.x = -Math.PI / 2; kf.position.set(0, -0.002, -D / 2 - 4); root.add(kf); }
  const wallT = CTX(256, 256, c => { c.fillStyle = '#cfe8e4'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#b3d4cf'; c.lineWidth = 3; for (let y = 20; y < 130; y += 26) { c.beginPath(); for (let x = 0; x <= 256; x += 8) c.lineTo(x, y + Math.sin(x / 256 * Math.PI * 4) * 4); c.stroke(); } c.fillStyle = '#fbf8ec'; c.fillRect(0, 150, 256, 106); c.fillStyle = '#d9e6e3'; for (let i = 0; i < 256; i += 21) c.fillRect(i, 150, 2, 106); c.fillStyle = '#2f9a8f'; c.fillRect(0, 136, 256, 14); c.fillStyle = '#e2453f'; c.fillRect(0, 133, 256, 3); }); wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1);
  const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad });
  const cut = []; for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); if (!ry) cut.push(m); }
  { const fw = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); fw.position.set(0, H / 2, D / 2); fw.rotation.y = Math.PI; root.add(fw); }
  cut.push(M(new T3.BoxGeometry(W, 0.2, D), toon('#e8f2ef'), 0, H + 0.1, 0, root, 0));
  const front = [], booths = []; { const fc = root.children.length;
    const seaT = CTX(256, 128, c => { const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#bfe6f5'); gr.addColorStop(0.55, '#e8f6fb'); gr.addColorStop(0.56, '#3aa6c8'); gr.addColorStop(1, '#2a7fa0'); c.fillStyle = gr; c.fillRect(0, 0, 256, 128); c.fillStyle = '#ffffff'; for (let i = 0; i < 14; i++) c.fillRect(rr(0, 240), rr(76, 124), rr(8, 22), 2); });
    const win = new T3.Mesh(new T3.PlaneGeometry(6, 2), new T3.MeshBasicMaterial({ map: seaT })); win.position.set(-1.6, 1.9, D / 2 - 0.02); win.rotation.y = Math.PI; root.add(win); for (const x of [-4.6, -1.6, 1.4]) M(new T3.BoxGeometry(0.12, 2.1, 0.12), teal, x, 1.9, D / 2 - 0.06, root, 0.01); M(new T3.BoxGeometry(6.1, 0.12, 0.14), teal, -1.6, 2.92, D / 2 - 0.06, root, 0.01); M(new T3.BoxGeometry(6.1, 0.12, 0.14), teal, -1.6, 0.88, D / 2 - 0.06, root, 0.01);
    const hireT = CTX(256, 128, c => { c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#e2453f'; c.fillRect(0, 0, 256, 18); c.fillRect(0, 110, 256, 18); c.fillStyle = '#201e1d'; c.font = '900 44px Archivo, Arial'; c.textAlign = 'center'; c.fillText('NOW', 128, 60); c.fillText('HIRING', 128, 100); });
    const hire = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.35), new T3.MeshBasicMaterial({ map: hireT })); hire.position.set(-3.9, 1.3, D / 2 - 0.05); hire.rotation.y = Math.PI; root.add(hire);
    const door = new T3.Mesh(new T3.PlaneGeometry(1.6, 2.6), new T3.MeshBasicMaterial({ color: 0xe8f6fb })); door.position.set(4, 1.3, D / 2 - 0.02); door.rotation.y = Math.PI; root.add(door); M(new T3.BoxGeometry(1.8, 0.14, 0.14), teal, 4, 2.64, D / 2 - 0.06, root, 0.01); front.push(...root.children.slice(fc)); }
  const KZ = -2.6, K = { root, z: KZ, cut, front, booths };
  cut.push(M(new T3.BoxGeometry(W - 0.4, 0.9, 1.0), tealD, 0, 0.45, KZ - 1.4, root, 0.03));
  M(new T3.BoxGeometry(5.8, 0.95, 1.75), sand, 0, 0.475, KZ + 0.2, root, 0.03); M(new T3.BoxGeometry(5.9, 0.06, 1.85), white, 0, 0.98, KZ + 0.2, root, 0.015); M(new T3.BoxGeometry(5.9, 0.12, 0.06), teal, 0, 0.82, KZ + 1.13, root, 0);
  for (let i = 0; i < 12; i++) M(new T3.BoxGeometry(0.03, 0.8, 0.02), toon('#d9c79f'), -2.75 + i * 0.5, 0.42, KZ + 1.08, root, 0);
  K.top = 1.01; const T = K.top;
  // FRUIT: cutting board + five crates
  K.chop = { x: -2.0, z: KZ + 0.0 }; M(new T3.BoxGeometry(0.66, 0.04, 0.46), toon('#c99a62'), K.chop.x, T + 0.02, K.chop.z, root, 0.01); for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.64, 0.002, 0.004), toon('#b07f4a'), K.chop.x, T + 0.041, K.chop.z - 0.15 + i * 0.1, root, 0);
  K.crates = {}; K.cratePiles = {}; FK.forEach((k, i) => { const x = -2.72 + i * 0.36, z = KZ + 0.66; M(new T3.BoxGeometry(0.32, 0.1, 0.36), wood, x, T + 0.05, z, root, 0.008); M(new T3.BoxGeometry(0.33, 0.025, 0.37), woodD, x, T + 0.07, z, root, 0); M(new T3.BoxGeometry(0.2, 0.05, 0.004), toon(FRUIT[k].col), x, T + 0.05, z + 0.182, root, 0);
    for (let j = 0; j < 3; j++) { const f = wholeFruit(T3, toon, k, ctx.addOutline); f.scale.setScalar(k === 'blueberry' ? 0.6 : 0.72); f.position.set(x + (j - 1) * 0.08, T + 0.09 + (j === 1 ? 0.03 : 0), z - 0.06 + (j % 2) * 0.1); f.rotation.y = j * 1.3; root.add(f); (K.cratePiles[k] = K.cratePiles[k] || []).push(f); } K.crates[k] = { x, z }; });
  // BLEND: ice bucket, yogurt tub, blender, sink
  K.blender = { x: -0.25, z: KZ - 0.12 }; M(new T3.BoxGeometry(0.34, 0.18, 0.32), teal, K.blender.x, T + 0.09, K.blender.z, root, 0.01); M(new T3.CylinderGeometry(0.12, 0.13, 0.03, 18), chrome, K.blender.x, T + 0.195, K.blender.z, root, 0.006);
  K.blendBtn = { x: K.blender.x, z: K.blender.z + 0.17 }; M(new T3.CylinderGeometry(0.045, 0.045, 0.03, 16), coral, K.blendBtn.x, T + 0.09, K.blendBtn.z, root, 0.006).rotation.x = Math.PI / 2; K.baseTop = T + 0.21;
  K.ice = { x: -0.95, z: KZ + 0.6 }; M(new T3.CylinderGeometry(0.15, 0.13, 0.2, 18), chrome, K.ice.x, T + 0.1, K.ice.z, root, 0.008, 0.15); M(new T3.CylinderGeometry(0.135, 0.135, 0.01, 18), toon('#dbeef5'), K.ice.x, T + 0.2, K.ice.z, root, 0); for (let i = 0; i < 7; i++) M(new T3.BoxGeometry(0.05, 0.05, 0.05), toon('#eef8fb'), K.ice.x + Math.cos(i * 2.4) * 0.07, T + 0.215, K.ice.z + Math.sin(i * 2.4) * 0.07, root, 0.004).rotation.set(i, i * 0.7, 0);
  K.yog = { x: 0.3, z: KZ + 0.62 }; M(new T3.CylinderGeometry(0.13, 0.12, 0.2, 18), white, K.yog.x, T + 0.1, K.yog.z, root, 0.008, 0.13); M(new T3.CylinderGeometry(0.132, 0.132, 0.07, 18), teal, K.yog.x, T + 0.1, K.yog.z, root, 0); M(new T3.CylinderGeometry(0.118, 0.118, 0.01, 18), toon('#fbf6ea'), K.yog.x, T + 0.2, K.yog.z, root, 0);
  K.sink = { x: -1.1, z: KZ - 0.32 }; M(new T3.BoxGeometry(0.46, 0.06, 0.36), chrome, K.sink.x, T + 0.03, K.sink.z, root, 0.008); { const inr = new T3.Mesh(new T3.PlaneGeometry(0.38, 0.28), toon('#5a646d')); inr.rotation.x = -Math.PI / 2; inr.position.set(K.sink.x, T + 0.062, K.sink.z); root.add(inr); } M(new T3.CylinderGeometry(0.015, 0.015, 0.3, 8), chrome, K.sink.x, T + 0.18, K.sink.z - 0.17, root, 0.004); M(new T3.CylinderGeometry(0.013, 0.013, 0.14, 8), chrome, K.sink.x, T + 0.32, K.sink.z - 0.11, root, 0.004).rotation.x = Math.PI / 2;
  // POUR: glass stack, pour mat, toppings, tray
  K.pour = { x: 0.62, z: KZ - 0.05 }; M(new T3.BoxGeometry(0.26, 0.012, 0.26), coral, K.pour.x, T + 0.006, K.pour.z, root, 0);
  K.glasses = { x: 0.9, z: KZ + 0.62 }; for (let i = 0; i < 3; i++) { const gl = new T3.Mesh(new T3.CylinderGeometry(0.06, 0.05, 0.16, 14, 1, true), new T3.MeshToonMaterial({ color: '#d8efec', gradientMap: ctx.grad, transparent: true, opacity: 0.7, side: T3.DoubleSide })); gl.position.set(K.glasses.x, T + 0.08 + i * 0.035, K.glasses.z); root.add(gl); }
  K.tops = {}; Object.keys(TOPS).forEach((k, i) => { const x = 1.2 + i * 0.32, z = KZ - 0.22; const jar = new T3.Mesh(new T3.CylinderGeometry(0.09, 0.09, 0.2, 16), new T3.MeshToonMaterial({ color: '#e6f3f1', gradientMap: ctx.grad, transparent: true, opacity: 0.45 })); jar.position.set(x, T + 0.1, z); root.add(jar); M(new T3.CylinderGeometry(0.08, 0.08, 0.13, 16), toon(TOPS[k].col), x, T + 0.067, z, root, 0.004, 0.08); M(new T3.CylinderGeometry(0.095, 0.095, 0.04, 16), coral, x, T + 0.22, z, root, 0.006, 0.095); K.tops[k] = { x, z }; });
  K.tray = { x: 1.62, z: KZ + 0.42 }; M(new T3.BoxGeometry(0.62, 0.02, 0.42), coral, K.tray.x, T + 0.01, K.tray.z, root, 0);
  K.stand = { x: 2.55, z: KZ + 0.15 }; M(new T3.BoxGeometry(0.34, 0.06, 0.34), white, K.stand.x, T + 0.03, K.stand.z, root, 0.006); for (let i = 0; i < 3; i++) M(new T3.BoxGeometry(0.28, 0.025, 0.2), toon('#c9a06a'), K.stand.x, T + 0.07 + i * 0.026, K.stand.z, root, 0);
  K.register = { x: 2.3, z: KZ + 1.62 }; M(new T3.BoxGeometry(0.42, 0.3, 0.34), ink, K.register.x, T + 0.15, K.register.z - 0.62, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), toon('#2f9a8f'), K.register.x, T + 0.34, K.register.z - 0.79, root, 0);
  // customer-side pass counter + four stools
  M(new T3.BoxGeometry(5.6, 0.6, 0.5), woodD, 0, 0.3, KZ + 1.42, root, 0.03); M(new T3.BoxGeometry(5.5, 0.02, 0.45), sand, 0, 0.61, KZ + 1.42, root, 0); M(new T3.BoxGeometry(5.7, 0.06, 0.62), teal, 0, 1.08, KZ + 1.42, root, 0.015); K.pass = { z: KZ + 1.42, y: 1.11 };
  for (const x of [-2.78, 2.78]) M(new T3.BoxGeometry(0.06, 0.46, 0.5), teal, x, 0.83, KZ + 1.42, root, 0);
  for (let i = 0; i < 9; i++) { const k = FK[i % 5], f = wholeFruit(T3, toon, k, ctx.addOutline); f.scale.setScalar(0.9); f.position.set(-2.45 + i * 0.61, 0.62, KZ + 1.42); f.rotation.y = i; root.add(f); }
  K.spots = [-1.7, 0, 1.7].map(x => ({ x, z: KZ + 2.4 }));
  for (let i = 0; i < 4; i++) { const x = -2.55 + i * 1.7; M(new T3.CylinderGeometry(0.05, 0.07, 0.7, 8), chrome, x, 0.35, KZ + 2.95, root, 0); M(new T3.CylinderGeometry(0.24, 0.22, 0.12, 14), coral, x, 0.74, KZ + 2.95, root, 0.01); }
  for (const x of [-4.6, -2.6]) for (const z of [1.4, 3.4]) { const bc = root.children.length; M(new T3.CylinderGeometry(0.45, 0.45, 0.05, 20), white, x, 0.78, z, root, 0.01, 0.45); M(new T3.CylinderGeometry(0.05, 0.05, 0.75, 8), ink, x, 0.39, z, root, 0); M(new T3.CylinderGeometry(0.22, 0.25, 0.03, 12), ink, x, 0.015, z, root, 0); for (const sz of [-0.7, 0.7]) { M(new T3.CylinderGeometry(0.2, 0.2, 0.06, 14), teal, x, 0.47, z + sz, root, 0.01); M(new T3.CylinderGeometry(0.04, 0.04, 0.45, 6), chrome, x, 0.22, z + sz, root, 0); } booths.push(...root.children.slice(bc)); }
  { const bc = root.children.length, x = -3.6, z = 2.4; M(new T3.CylinderGeometry(0.03, 0.03, 2.4, 6), woodD, x, 1.2, z, root, 0.004); const um = M(new T3.ConeGeometry(1.1, 0.4, 8, 1, true), coral, x, 2.3, z, root, 0.01); um.material = toon('#e2453f', { side: THREE.DoubleSide }); booths.push(...root.children.slice(bc)); }
  { const p = new T3.Group(); p.position.set(5.2, 0, 3.6); root.add(p); M(new T3.CylinderGeometry(0.3, 0.24, 0.5, 14), toon('#e2453f'), 0, 0.25, 0, p, 0.01); M(new T3.CylinderGeometry(0.05, 0.07, 1.4, 8), toon('#8a6a3a'), 0, 1.1, 0, p, 0.006); for (let i = 0; i < 6; i++) { const lf = M(new T3.ConeGeometry(0.12, 0.9, 4), toon('#4f9a4a'), Math.cos(i) * 0.32, 1.85, Math.sin(i) * 0.32, p, 0.006); lf.rotation.set(Math.sin(i) * 1.1, 0, -Math.cos(i) * 1.1); } }
  { const sb = M(new T3.SphereGeometry(1, 20, 10), toon('#f2d970'), -W / 2 + 0.08, 2.2, -1.2, root, 0.02); sb.scale.set(0.04, 1.2, 0.3); sb.rotation.x = 0.15; const st = M(new T3.BoxGeometry(0.02, 2.2, 0.08), coral, -W / 2 + 0.11, 2.2, -1.2, root, 0); st.rotation.x = 0.15; }
  cut.push(M(new T3.BoxGeometry(5.2, 0.05, 0.3), woodD, 0, 1.9, -D / 2 + 0.2, root, 0.006)); for (let i = 0; i < 10; i++) { const f = wholeFruit(T3, toon, FK[i % 5], ctx.addOutline); f.position.set(-2.3 + i * 0.5, 1.93, -D / 2 + 0.2); root.add(f); cut.push(f); }
  const menuT = CTX(1024, 512, c => { c.fillStyle = '#2f4a44'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#f2d970'; c.font = '900 76px Archivo, Arial'; c.fillText('FOXY BLENDS', 40, 92); c.fillStyle = '#f7f6f2'; c.font = '700 32px Archivo, Arial'; RECIPES.forEach((r, i) => { const x = 40 + (i % 2) * 500, y = 170 + Math.floor(i / 2) * 64; c.fillText(r.name, x, y); c.fillText(r.price + 'g', x + 400, y); }); c.fillStyle = '#9fe0d6'; c.fillText('CHUNKY · SMOOTH · SILKY   TOPPINGS +1g', 40, 470); });
  { const mb = new T3.Mesh(new T3.PlaneGeometry(4.4, 2.2), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(0, 3.0, -D / 2 + 0.07); root.add(mb); cut.push(mb, M(new T3.BoxGeometry(4.6, 2.4, 0.06), wood, 0, 3.0, -D / 2 + 0.01, root, 0.01)); }
  const neonT = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); c.font = '900 80px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff6a5a'; c.shadowBlur = 26; c.strokeStyle = '#ff8a7a'; c.lineWidth = 8; c.strokeText('BLENDS', 256, 66); c.fillStyle = '#fff'; c.fillText('BLENDS', 256, 66); });
  { const n = new T3.Mesh(new T3.PlaneGeometry(3.2, 0.8), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); n.position.set(-W / 2 + 0.05, 3.5, 1.4); n.rotation.y = Math.PI / 2; root.add(n); }
  K.lamps = []; for (const x of [-1.8, 0, 1.8]) { cut.push(M(new T3.CylinderGeometry(0.01, 0.01, 1.1, 4), ink, x, H - 0.55, KZ + 0.6, root, 0)); const sh = M(new T3.ConeGeometry(0.3, 0.3, 14, 1, true), toon('#d9b27a', { side: THREE.DoubleSide }), x, H - 1.2, KZ + 0.6, root, 0.01); K.lamps.push(sh); cut.push(sh); }
  cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K; }

// ---------------- the stand-alone game ----------------
export async function createSmoothieShift({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#e8f2ef' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildBar({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.top;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe0b0, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending })); s.position.copy(l.position).add(V3(0, -0.25, 0)); s.scale.setScalar(1.4); scene.add(s); return s; });
  const knife = (() => { const g = new THREE.Group(); const bl = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.008, 0.07), toon('#d7dde3')); bl.position.x = 0.15; addOutline(bl, 0.005); g.add(bl); const h = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.03, 0.04), toon('#201e1d')); h.position.x = -0.06; addOutline(h, 0.005); g.add(h); g.visible = false; scene.add(g); return g; })();

  // ---------- cast ----------
  const julep = kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#f2c08a', furDark: '#c28a4a' }, torso: ['#2f9a8f', '#fbf8ec', '#1f6a62'], outfit: 'vest', crest: '8', gear: 'none', mood: 'happy' });
  const JP = julep.userData.P; if (JP.sword) JP.sword.visible = false; if (JP.gun) JP.gun.visible = false; julep.position.set(-2.95, 0, K.z - 0.9); julep.rotation.y = 0.5; scene.add(julep);
  const ben = kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#e2453f'], crest: '', gear: 'none', mood: 'happy' }); ben.position.set(-1.0, 0, K.z + 3.5); ben.rotation.y = 0.3; const BP = ben.userData.P; if (BP.sword) BP.sword.visible = false; if (BP.gun) BP.gun.visible = false; scene.add(ben);
  const drawGlass = (g, s) => { g.save(); g.scale(s, s); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#e2453f'; g.beginPath(); g.moveTo(-58, -40); g.lineTo(58, -40); g.lineTo(46, 76); g.lineTo(-46, 76); g.closePath(); g.fill(); st();
    g.fillStyle = '#f07a72'; g.beginPath(); g.moveTo(-58, -40); g.quadraticCurveTo(-30, -58, 0, -44); g.quadraticCurveTo(30, -60, 58, -40); g.closePath(); g.fill(); st();
    g.fillStyle = '#fbf8ec'; g.beginPath(); g.roundRect(22, -110, 14, 80, 4); g.fill(); st(); g.fillStyle = '#2f9a8f'; g.fillRect(24, -96, 10, 10); g.fillRect(24, -72, 10, 10);
    g.fillStyle = '#8fae4e'; g.beginPath(); g.ellipse(-30, -54, 22, 12, -0.4, 0, 7); g.fill(); st(); g.restore(); };
  const uniform = new THREE.Group(); {
    const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 98); drawGlass(g, 0.72); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-122, -24); g.lineTo(126, -30); g.lineTo(116, 34); g.lineTo(-130, 30); g.closePath(); g.fill(); g.fillStyle = '#2f9a8f'; g.beginPath(); g.moveTo(-114, -18); g.lineTo(118, -24); g.lineTo(110, 26); g.lineTo(-121, 23); g.closePath(); g.fill();
      g.font = 'italic 900 42px Archivo, "Arial Black", Arial, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('FOXY BLENDS', 0, 2); g.fillStyle = '#f2d970'; g.fillText('FOXY BLENDS', 0, 2); g.restore(); });
    uniform.userData.parts = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#2f9a8f', towelCol: '#e2453f' }).parts; }
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push({ m }); });
  const setUniform = on => { uniform.userData.parts.forEach(p => p.visible = on); crestSlots.forEach(s => { s.m.visible = !on; }); };
  setUniform(true);
  const custFox = CUSTOMERS.map(cu => { const f = kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' }); const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.visible = false; scene.add(f); return f; });

  // ---------- cameras ----------
  const CAM = { pos: V3(), look: V3(), from: null, t: 1, dur: 1 };
  const { SAFE, shotFor } = cameraFit(ST);
  const wideShot = () => { const port = CW() < CHh(), z = K.z, benBox = [V3(-1.5, 0.05, z + 3.5), V3(-0.5, 0.05, z + 3.5), V3(-1.5, 2.25, z + 3.5), V3(-0.5, 2.25, z + 3.5)];
    return port ? shotFor('wideP3', () => [...benBox, V3(-1.0, 2.5, z + 3.5)], 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL4', () => [...benBox, V3(-1.0, 2.5, z + 3.5)], 0.12, Math.PI - 0.3, 0.05); };
  const FOCUS = { all: 1, fruit: 1, blend: 1, pour: 1, serve: 1 };
  function workShot(id = S.focus || 'all') { const port = CW() < CHh(); return shotFor('w:' + id, () => shotPoints(id), port ? 1.2 : 0.92, 0, id === 'all' ? 0.03 : 0.05); }
  function setFocus(id) { if (!FOCUS[id] || S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }
  function shotPoints(id) { const P = (x, z, y = T) => V3(x, y, z), out = [];
    if (id === 'fruit') { out.push(P(K.chop.x - 0.36, K.chop.z - 0.26), P(K.chop.x + 0.36, K.chop.z + 0.26), P(K.chop.x, K.chop.z, T + 0.25)); for (const c of Object.values(K.crates)) out.push(P(c.x - 0.17, c.z + 0.2), P(c.x + 0.17, c.z - 0.2, T + 0.18)); }
    else if (id === 'blend') { out.push(P(K.ice.x - 0.16, K.ice.z + 0.16), P(K.yog.x + 0.16, K.yog.z + 0.16), P(K.blender.x, K.blender.z, T + 0.62), P(K.blender.x - 0.18, K.blender.z - 0.2), P(K.sink.x - 0.24, K.sink.z - 0.2), P(K.sink.x, K.sink.z, T + 0.36), P(K.blendBtn.x, K.blendBtn.z + 0.05)); }
    else if (id === 'pour') { out.push(P(K.pour.x - 0.3, K.pour.z - 0.2), P(K.pour.x, K.pour.z, T + 0.55), P(K.glasses.x + 0.1, K.glasses.z + 0.1, T + 0.2), P(K.tray.x + 0.32, K.tray.z + 0.22), ...Object.values(K.tops).map(t => P(t.x, t.z - 0.1, T + 0.24)), P(K.blender.x - 0.1, K.blender.z, T + 0.5)); }
    else if (id === 'serve') { out.push(P(K.stand.x - 0.2, K.stand.z - 0.2), P(K.stand.x + 0.2, K.stand.z + 0.2, T + 0.3), P(K.tray.x - 0.3, K.tray.z), ...K.spots.flatMap(s => [P(s.x - 0.45, s.z, 2.2), P(s.x + 0.45, s.z, 2.2), P(s.x - 0.45, s.z, 0.9), P(s.x + 0.45, s.z, 0.9)])); }
    else out.push(P(-2.9, K.z - 0.5), P(2.9, K.z - 0.5), P(-2.9, K.z + 0.86), P(2.9, K.register.z), ...K.spots.map(s => P(s.x, s.z, 1.3)));
    return out; }
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  camera.position.set(-0.6, 2.1, 3.0); CAM.look.set(0.6, 1.25, K.z); camera.lookAt(CAM.look);

  // ---------- game state ----------
  const S = { focus: 'all', phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, next: 3, done: null, combo: 0, hold: null };
  const upg = id => !!save.stat(SAVE.upg + id, 0), CUTS = () => upg('sharp') ? 3 : 4, CAP = () => upg('bigCrate') ? 10 : 6;
  const orders = [], tray = []; let carrier = null, drag = null, idSeq = 1, glass = null;
  const J = { ice: 0, yog: 0, fruits: [], blend: 0 };
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const avail = () => RECIPES.filter(r => r.day <= S.day), topsAvail = () => Object.keys(TOPS).filter(k => TOPS[k].day <= S.day), REC = id => RECIPES.find(r => r.id === id);
  const itemName = it => (REC(it.r) || { name: 'MYSTERY MIX' }).name;
  const sameSet = (a, b) => [...a].sort().join(',') === [...b].sort().join(',');
  const matchRecipe = fr => { const r = RECIPES.find(q => sameSet(q.fruits, fr)); return r ? r.id : 'custom'; };

  // ---------- jug ----------
  const jugGroup = new THREE.Group(); jugGroup.position.set(K.blender.x, K.baseTop, K.blender.z); scene.add(jugGroup);
  { const body = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.105, 0.36, 22, 1, true), new THREE.MeshToonMaterial({ color: '#e6f6f4', gradientMap: grad, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false })); body.position.y = 0.18; body.renderOrder = 3; jugGroup.add(body);
    for (const [y, r] of [[0.36, 0.135], [0.005, 0.105]]) { const rim = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 6, 26), toon('#7d9c98')); rim.rotation.x = Math.PI / 2; rim.position.y = y; jugGroup.add(rim); }
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 22), toon('#2f9a8f')); lid.position.y = 0.375; addOutline(lid, 0.006, 0.14); jugGroup.add(lid); const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.04, 10), toon('#e2453f')); kn.position.y = 0.405; jugGroup.add(kn);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.08, 0.016, 6, 14, Math.PI), toon('#2f9a8f')); hd.position.set(-0.15, 0.2, 0); hd.rotation.z = Math.PI / 2; addOutline(hd, 0.005); jugGroup.add(hd); }
  const jugIn = new THREE.Group(); jugGroup.add(jugIn); const blades = new THREE.Group(); { for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.006, 0.02), toon('#d7dde3')); b.rotation.y = i * Math.PI / 2; blades.add(b); } blades.position.y = 0.03; jugGroup.add(blades); }
  const liqGeo = new THREE.CylinderGeometry(0.1, 0.09, 1, 20).translate(0, 0.5, 0);
  let jugLiquid = null;
  const jugLevel = () => Math.min(0.32, J.ice * 0.022 + J.yog * 0.14 + J.fruits.length * 0.035);
  function rebuildJug() { while (jugIn.children.length) jugIn.remove(jugIn.children[0]); jugLiquid = null; const L = jugLevel();
    if (J.blend >= 0.3) { const m = new THREE.Mesh(liqGeo, toon('#' + mixCol(J.fruits).getHexString())); m.position.y = 0.01; m.scale.y = Math.max(0.01, L * 0.9); jugIn.add(m); jugLiquid = m; if (texOf(J.blend) === 'chunky') for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.02, 0.025), toon(FRUIT[J.fruits[i % J.fruits.length]].flesh)); c.position.set(Math.cos(i * 2.1) * 0.06, L * 0.9 + 0.005, Math.sin(i * 2.1) * 0.06); jugIn.add(c); } return; }
    let y = 0.012; if (J.yog > 0.01) { const m = new THREE.Mesh(liqGeo, toon('#f6f1e6')); m.position.y = y; m.scale.y = J.yog * 0.14; jugIn.add(m); y += J.yog * 0.14; }
    J.fruits.forEach((k, i) => { for (let j = 0; j < 3; j++) { const p = fruitPiece(THREE, toon, k, null); p.scale.setScalar(0.8); p.position.set(Math.cos(i * 1.9 + j * 2.1) * 0.05, Math.max(0.02, y - 0.02) + i * 0.03 + j * 0.008, Math.sin(i * 1.9 + j * 2.1) * 0.05); p.rotation.y = i + j; jugIn.add(p); } });
    for (let i = 0; i < J.ice; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.045), toon('#eef8fb')); addOutline(c, 0.003); c.position.set(Math.cos(i * 2.4) * 0.05, Math.max(0.03, y) + 0.02 + Math.floor(i / 3) * 0.03, Math.sin(i * 2.4) * 0.05); c.rotation.set(i, i * 0.7, 0); jugIn.add(c); } }
  function resetJug() { J.ice = 0; J.yog = 0; J.fruits = []; J.blend = 0; J.yogOk = false; rebuildJug(); }
  const stream = (() => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.02, 1, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); const so = new THREE.Mesh(st.geometry, new THREE.MeshBasicMaterial({ color: 0x201e1d, side: THREE.BackSide })); so.scale.set(1.35, 1, 1.35); st.add(so); st.visible = false; scene.add(st); return st; })();

  // ---------- glass on the pour mat ----------
  const glassGroup = new THREE.Group(); glassGroup.position.set(K.pour.x, T + 0.012, K.pour.z); scene.add(glassGroup); glassGroup.visible = false;
  const GH = 0.2; let glassFill, glassTop, glassStraw;
  { const gb = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.06, GH, 18, 1, true), new THREE.MeshToonMaterial({ color: '#e6f6f4', gradientMap: grad, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false })); gb.position.y = GH / 2; gb.renderOrder = 3; glassGroup.add(gb);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.006, 6, 24), toon('#7d9c98')); rim.rotation.x = Math.PI / 2; rim.position.y = GH; glassGroup.add(rim);
    glassFill = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.057, 1, 18).translate(0, 0.5, 0), toon('#f07a72')); glassFill.position.y = 0.004; glassFill.scale.y = 0.001; glassGroup.add(glassFill);
    for (const v of POUR) { const ln = new THREE.Mesh(new THREE.TorusGeometry(0.074 - v * 0.013, 0.004, 4, 24), new THREE.MeshBasicMaterial({ color: 0xec3013 })); ln.rotation.x = Math.PI / 2; ln.position.y = v * GH * 0.95; glassGroup.add(ln); }
    glassTop = new THREE.Group(); glassGroup.add(glassTop); glassStraw = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.26, 6), toon('#e2453f')); glassStraw.position.set(0.025, GH + 0.04, 0); glassStraw.rotation.z = 0.2; glassStraw.visible = false; glassGroup.add(glassStraw); }
  function showGlass() { glassGroup.visible = !!glass; if (!glass) return; glassFill.scale.y = Math.max(0.001, glass.fill * GH * 0.95); if (glass.col) glassFill.material = toon(glass.col); glassStraw.visible = !!glass.poured; while (glassTop.children.length) glassTop.remove(glassTop.children[0]);
    if (glass.top) for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(glass.top === 'mint' ? new THREE.SphereGeometry(0.016, 5, 3) : new THREE.BoxGeometry(0.016, 0.01, 0.016), toon(TOPS[glass.top].col)); if (glass.top === 'mint') m.scale.set(1.5, 0.4, 0.8); m.position.set(Math.cos(i * 2.4) * (0.015 + (i % 3) * 0.018), glass.fill * GH * 0.95 + 0.01, Math.sin(i * 2.4) * (0.015 + (i % 3) * 0.018)); m.rotation.y = i; glassTop.add(m); } }
  const smallGlass = it => { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.13, 12), toon('#' + mixCol((REC(it.r) || { fruits: [] }).fruits).getHexString())); b.position.y = 0.065; addOutline(b, 0.005, 0.05); g.add(b); const s = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12, 5), toon('#e2453f')); s.position.set(0.015, 0.16, 0); s.rotation.z = 0.2; g.add(s); return g; };
  const trayGroup = new THREE.Group(); trayGroup.position.set(K.tray.x, T + 0.02, K.tray.z); scene.add(trayGroup);
  function rebuildTray() { while (trayGroup.children.length) trayGroup.remove(trayGroup.children[0]); tray.forEach((it, i) => { const g = smallGlass(it); g.position.set(-0.2 + (i % 4) * 0.13, 0, -0.08 + Math.floor(i / 4) * 0.15); trayGroup.add(g); }); }
  const carrierMesh = (() => { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.06, 0.2), toon('#c9a06a')); b.position.y = 0.03; addOutline(b, 0.006); g.add(b); const h = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.18, 0.18), toon('#c9a06a')); h.position.y = 0.12; g.add(h); g.userData.cups = new THREE.Group(); g.add(g.userData.cups); g.visible = false; scene.add(g); return g; })();
  function showCarrier() { const cg = carrierMesh.userData.cups; while (cg.children.length) cg.remove(cg.children[0]); if (!carrier) { carrierMesh.visible = false; return; } carrier.forEach((it, i) => { const s = smallGlass(it); s.position.set(-0.08 + (i % 2) * 0.16, 0.03, 0); cg.add(s); }); carrierMesh.visible = true; }
  const parkCarrier = () => { carrierMesh.position.set(K.stand.x, T + 0.1, K.stand.z); };

  // ---------- fruit stock + cutting ----------
  const stock = {}; FK.forEach(k => stock[k] = 0);
  const outT = canvasTex(128, 64, c => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#fff'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OUT', 64, 34); });
  const outTags = {}; for (const k of FK) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: outT, depthTest: false })); sp.scale.set(0.22, 0.11, 1); sp.position.set(K.crates[k].x, T + 0.32, K.crates[k].z); sp.renderOrder = 26; sp.visible = false; scene.add(sp); outTags[k] = sp; }
  const setStock = (k, n) => { stock[k] = Math.max(0, n); (K.cratePiles[k] || []).forEach((m, i) => m.visible = stock[k] > i * 2); outTags[k].visible = stock[k] <= 0 && S.phase === 'shift'; };
  const restock = k => { if (S.restock && S.restock[k]) return; (S.restock = S.restock || {})[k] = 1; say('JULEP: "Out of ' + FRUIT[k].name.toLowerCase() + '? I will run to the market!"', 4); setTimeout(() => { if (!S.restock || !S.restock[k]) return; delete S.restock[k]; setStock(k, CAP()); flash('FRESH ' + FRUIT[k].name + ' · +' + CAP(), '#22c55e', 1.4); }, 9000); };
  const slices = [];
  function needCut(k) { if (S.cut) return; setStock(k, stock[k] - 1); const m = wholeFruit(THREE, toon, k, addOutline); m.scale.setScalar(1.3); m.position.set(K.chop.x + 0.04, T + 0.04, K.chop.z); scene.add(m); S.cut = { k, cuts: 0, mesh: m, last: 0 }; tone(500, 0.06, 0.03); }
  function clearChopped() { if (!S.chopped) return; scene.remove(S.chopped.g); S.chopped = null; }
  function chopPile(k) { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const p = fruitPiece(THREE, toon, k, addOutline); p.position.set(-0.12 + (i % 3) * 0.1, 0.0 + Math.floor(i / 3) * 0.02, (i % 2) * 0.07 - 0.03); p.rotation.y = i * 1.7; g.add(p); } return g; }
  function makeChopped(k) { clearChopped(); const g = chopPile(k); g.position.set(K.chop.x, T + 0.045, K.chop.z); scene.add(g); S.chopped = { k, g }; }
  function cutOnce() { const C = S.cut; const now = performance.now() / 1000; if (!C || now - C.last < 0.08) return; C.last = now; C.cuts++; tone(1800 + C.cuts * 120, 0.04, 0.05, 'square'); audio.burst && audio.burst(0.08, 4000, 0.1);
    const p = fruitPiece(THREE, toon, C.k, addOutline); p.position.set(K.chop.x - 0.2 + (C.cuts % 3) * 0.05, T + 0.045, K.chop.z - 0.08 + (C.cuts % 2) * 0.12); p.rotation.y = rr(0, 6); scene.add(p); slices.push(p); C.mesh.scale.x = Math.max(0.35, 1.3 * (1 - C.cuts / CUTS() * 0.7)); C.mesh.position.x = K.chop.x + 0.04 + C.cuts * 0.025; puff(K.chop.x, T + 0.15, K.chop.z, 0xffffff, 2);
    if (C.cuts >= CUTS()) { scene.remove(C.mesh); slices.forEach(s2 => scene.remove(s2)); slices.length = 0; S.cut = null; knife.visible = false; makeChopped(C.k); flash(FRUIT[C.k].name + ' CUT · TAP OR DRAG IT INTO THE JUG', '#22c55e', 1.6); tone(1175, 0.1, 0.05); setTimeout(() => tone(1568, 0.12, 0.05), 100); } }
  function addFruit(k) { if (J.blend > 0.05) { flash('ALREADY BLENDED · TAP THE SINK TO DUMP IT', '#ec3013', 1.4); return false; } J.fruits.push(k); rebuildJug(); tone(320, 0.11, 0.06, 'sine'); puff(K.blender.x, K.baseTop + 0.38, K.blender.z, 0xffffff, 2); return true; }
  function addIce() { if (J.blend > 0.05) { flash('ALREADY BLENDED', '#ffffff', 1); return; } const n = upg('scoop') ? 2 : 1; J.ice = Math.min(8, J.ice + n); rebuildJug(); tone(1500 + Math.random() * 500, 0.06, 0.03); audio.burst && audio.burst(0.09, 5200, 0.09); flash('ICE ' + J.ice + ' / ' + ICE_N + (J.ice > ICE_N + 1 ? ' · TOO MUCH ICE' : ''), J.ice > ICE_N + 1 ? '#ec3013' : '#ffffff', 0.8); }
  function dumpJug() { if (!J.ice && !J.yog && !J.fruits.length) { flash('THE JUG IS EMPTY', '#ffffff', 0.9); return; } resetJug(); flash('JUG RINSED', '#ffffff', 1); tone(260, 0.2, 0.04); puff(K.sink.x, T + 0.15, K.sink.z, 0xdbeef5, 4); }

  // ---------- HOLDS: yogurt, blend, pour ----------
  const HOLD_DEF = {
    yog: { label: 'YOGURT', max: 1, zones: [['NOT ENOUGH', 0, YOG[0], '#9ca3af'], ['JUST RIGHT', YOG[0], YOG[1], '#22c55e', 'right'], ['TOO MUCH', YOG[1], 1, '#ec3013']] },
    blend: { label: 'BLEND', max: 1.1, zones: [['LUMPY', 0, 0.3, '#9ca3af'], ['CHUNKY', 0.3, 0.52, '#e6b45a', 'chunky'], ['SMOOTH', 0.52, 0.74, '#7dd3fc', 'smooth'], ['SILKY', 0.74, 0.95, '#c4a5f0', 'silky'], ['WATERY', 0.95, 1.1, '#ec3013']] },
    pour: { label: 'POUR', max: 1.1, zones: [['LOW', 0, POUR[0], '#9ca3af'], ['AT THE LINE', POUR[0], POUR[1], '#22c55e', 'line'], ['HIGH', POUR[1], 1.0, '#e6b45a'], ['SPILL', 1.0, 1.1, '#ec3013']] } };
  const holdVal = k => k === 'yog' ? J.yog : k === 'blend' ? J.blend : glass ? glass.fill : 0;
  const zoneAt = (k, v) => { const z = HOLD_DEF[k].zones; return (z.find(q => v < q[2]) || z[z.length - 1])[0]; };
  function startHold(kind) {
    if (kind === 'yog') { if (J.blend > 0.05) { flash('ALREADY BLENDED · TAP THE SINK TO DUMP IT', '#ec3013', 1.3); return; } }
    if (kind === 'blend') { if (!J.fruits.length) { flash('CUT SOME FRUIT INTO THE JUG FIRST', '#ffffff', 1.2); return; } if (J.yog < 0.05) { flash('YOGURT FIRST · HOLD THE TUB', '#ffffff', 1.2); return; } if (J.blend <= 0.05) J.yogOk = J.yog >= YOG[0] && J.yog <= YOG[1]; }
    if (kind === 'pour') { if (J.blend < 0.3) { flash(J.fruits.length ? 'BLEND IT FIRST · HOLD THE BLENDER BUTTON' : 'NOTHING TO POUR YET', '#ffffff', 1.2); return; } if (!glass) { flash('TAP THE GLASSES FOR A GLASS', '#ffffff', 1.1); return; }
      if (glass.fill <= 0.001) Object.assign(glass, { rid: matchRecipe(J.fruits), tex: texOf(J.blend), col: '#' + mixCol(J.fruits).getHexString(), clean: J.yogOk && J.ice >= ICE_N && J.ice <= ICE_N + 1, fruits: J.fruits.slice() }); glassFill.material = toon(glass.col); stream.material.color.set(glass.col); }
    S.hold = { kind, t: 0 }; tone(kind === 'blend' ? 120 : 420, 0.3, 0.03, kind === 'blend' ? 'sawtooth' : 'sine'); }
  function stepHold(dt) { const H = S.hold; if (!H) return; H.t += dt;
    if (H.kind === 'yog') { J.yog = Math.min(1, J.yog + dt * 0.32); if (Math.random() < dt * 8) rebuildJug(); if (J.yog >= 1) releaseHold(); }
    else if (H.kind === 'blend') { J.blend = Math.min(1.1, J.blend + dt * 0.3); jugIn.rotation.y += dt * 30; blades.rotation.y += dt * 60; jugGroup.position.x = K.blender.x + Math.sin(H.t * 70) * 0.004; if (J.blend >= 0.3 && !jugLiquid) rebuildJug(); if (Math.random() < dt * 12) audio.burst && audio.burst(0.06, 900, 0.08); if (J.blend >= 1.1) releaseHold(); }
    else if (H.kind === 'pour') { glass.fill = Math.min(1.1, glass.fill + dt * (upg('fastPour') ? 0.56 : 0.4)); showGlass(); if (glass.fill >= 1.06) releaseHold(); } }
  function releaseHold() { const H = S.hold; if (!H) return; S.hold = null; jugGroup.position.x = K.blender.x; const v = holdVal(H.kind), z = zoneAt(H.kind, v);
    if (H.kind === 'yog') { rebuildJug(); const ok = v >= YOG[0] && v <= YOG[1]; flash('YOGURT · ' + z, ok ? '#22c55e' : v < YOG[0] ? '#ffffff' : '#ec3013', 1); tone(ok ? 1320 : 400, 0.08, 0.04); }
    else if (H.kind === 'blend') { rebuildJug(); flash(TEX_NAME(texOf(v)) + (v >= 0.95 ? ' · TOO THIN' : v < 0.3 ? ' · KEEP BLENDING' : ''), v >= 0.95 ? '#ec3013' : v < 0.3 ? '#ffffff' : '#22c55e', 1.1); tone(v >= 0.3 && v < 0.95 ? 1175 : 300, 0.1, 0.04); }
    else if (H.kind === 'pour') { const f = glass.fill; if (f >= 1.0) { glass.spill = true; glass.fill = 0.98; flash('SPILLED · MESSY GLASS', '#ec3013', 1.3); tone(180, 0.25, 0.05, 'sawtooth'); puff(K.pour.x, T + 0.2, K.pour.z, 0xffffff, 4); } else if (f >= POUR[0] && f <= POUR[1]) { flash('RIGHT AT THE LINE!', '#22c55e', 1); tone(1320, 0.08, 0.04); } else if (f > POUR[1]) flash('A BIT HIGH', '#e6b45a', 1); else if (f >= 0.6) flash('A BIT SHORT', '#e6b45a', 1);
      if (glass.fill >= 0.6) { glass.pourOk = !glass.spill && glass.fill >= POUR[0] && glass.fill <= POUR[1]; glass.poured = true; resetJug(); showGlass(); const need = needTop(); if (need && !glass.top) { say('JULEP: "This one gets ' + TOPS[need].name.toLowerCase() + ' on top!"', 3); } else finishGlass(); } else showGlass(); } }
  function needTop() { if (!glass) return ''; for (const o of orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)) { const TF = trayFor(o); for (let j = 0; j < o.items.length; j++) if (!TF.covered[j] && o.items[j].r === glass.rid && o.items[j].top) return o.items[j].top; } return ''; }
  function addTop(k) { if (!glass || !glass.poured) { flash('POUR A GLASS FIRST', '#ffffff', 1); return; } if (glass.top) return; glass.top = k; showGlass(); tone(990, 0.08, 0.04); puff(K.pour.x, T + 0.25, K.pour.z, 0xfff3d0, 2); finishGlass(); }
  function placeGlass() { if (glass) { flash(glass.poured ? 'TAP THE GLASS TO FINISH IT' : 'A GLASS IS ALREADY OUT', '#ffffff', 1); return; } glass = { fill: 0, top: '' }; showGlass(); tone(880, 0.06, 0.03); }
  function finishGlass() { if (!glass || !glass.poured) return; if (glass.rid === 'custom') { flash('NOT ON THE MENU · GLASS BINNED', '#ec3013', 1.6); tone(160, 0.2, 0.04); glass = null; showGlass(); return; }
    const it = { r: glass.rid, tex: glass.tex, top: glass.top || '', clean: !!(glass.clean && glass.pourOk) }; S.reveal = { it, t: 0, ...revealInfo(it) }; S.flash = null; tone(1175, 0.1, 0.05); setTimeout(() => tone(1568, 0.14, 0.05), 120); for (let i = 0; i < 6; i++) puff(K.pour.x + rr(-0.15, 0.15), T + rr(0.1, 0.35), K.pour.z + rr(-0.1, 0.1), 0xffe7a0, 1); }

  // ---------- customers + orders ----------
  function newOrder() { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i)); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)), ci = pick(pool);
    const rec = avail(), tops = topsAvail(), d = S.day, n = d >= 3 && Math.random() < 0.25 ? 2 : 1, items = Array.from({ length: n }, () => { const r = pick(rec.slice(-Math.min(rec.length, 3 + d))); return { r: r.id, tex: d <= 1 ? pick(['smooth', 'smooth', 'chunky']) : pick(['chunky', 'smooth', 'silky']), top: tops.length && Math.random() < 0.45 ? pick(tops) : '' }; });
    const total = items.reduce((s, it) => s + REC(it.r).price + (it.top ? TOPS[it.top].price : 0), 0), patMax = (78 - Math.min(18, (d - 1) * 4)) * (upg('radio') ? 1.2 : 1);
    const f = custFox[ci]; f.visible = true; f.position.set(K.spots[free].x + 6, 0, K.spots[free].z + 1.6); f.rotation.y = Math.PI; f.userData.mood = 'happy';
    orders.push({ id: idSeq++, ci, spot: free, items, total, pat: patMax, patMax, st: 'walk', f, line: pick(LINES.order) }); }
  const exact = (a, b) => a.r === b.r && a.tex === b.tex && (a.top || '') === (b.top || '');
  function trayFor(o, pool0 = tray) { const pool = pool0.slice(), covered = o.items.map(() => false); o.items.forEach((it, j) => { let i = pool.findIndex(x => exact(x, it)); if (i < 0) i = pool.findIndex(x => x.r === it.r); if (i >= 0) { covered[j] = true; pool.splice(i, 1); } }); return { covered, made: covered.filter(Boolean).length, next: covered.indexOf(false), extra: pool }; }
  function grade(o, got) { let want = 0, hit = 0; o.miss = 0; o.sloppy = 0; const pool = got.slice(); o.items.forEach(it => { want++; let i = pool.findIndex(x => exact(x, it)); if (i < 0) { i = pool.findIndex(x => x.r === it.r); if (i >= 0) o.miss++; } if (i >= 0) { hit++; if (!pool[i].clean) o.sloppy++; pool.splice(i, 1); } }); return want ? hit / want : 0; }
  function serve(o) { const q = grade(o, carrier), pq = o.pat / o.patMax, stars = q >= 1 ? (o.miss || o.sloppy ? 2 : pq > 0.5 ? 3 : 2) : q >= 0.5 ? 1 : 0;
    if (stars === 0) { startReact(o, 'insulted', 0, null); carrierMesh.visible = false; return false; }
    o.st = 'pay'; o.stars = stars; const level = stars === 3 ? (pq > 0.72 ? 'thrilled' : 'happy') : stars === 2 ? 'neutral' : 'unhappy'; o.tip = level === 'thrilled' ? Math.ceil(o.total * 0.4) + 3 : level === 'happy' ? Math.ceil(o.total * 0.25) + 1 : level === 'neutral' ? 1 : 0; carrier = null; showCarrier();
    const bill = [5, 10, 20, 50].find(b => b > o.total + (Math.random() < 0.3 ? 4 : 0)) || 50; startReact(o, level, stars, { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 }); return true; }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['Best smoothie on all of Jidda!', 'That tastes like the first wave of summer!', 'Wow. Just wow.'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['So fresh, thank you!', 'Just how I like it.', 'Great service!'] }, neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['It is fine. Not quite the texture I asked for.', 'Okay. Thanks.', 'Bit of a messy glass.'] }, unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['Half my order is missing...', 'This is not what I asked for.', 'I waited for this?'] }, insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'angry', lines: ['That is NOT my order!', 'Do I look like I ordered that?', 'Are you even listening?'] } };
  function startReact(o, level, stars, pay) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; S.react = { o, level, stars, pay, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: CUSTOMERS[o.ci].name, tip: o.tip || 0 }; S.focus = 'all';
    tone(level === 'insulted' ? 180 : level === 'unhappy' ? 300 : 880, 0.18, 0.05, level === 'insulted' || level === 'unhappy' ? 'sawtooth' : 'triangle'); if (level === 'thrilled') { setTimeout(() => tone(1175, 0.1, 0.05), 110); setTimeout(() => tone(1568, 0.16, 0.05), 220); for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; if (r.pay) { S.pay = r.pay; payProps(r.pay); S.payOut = null; tone(880, 0.1, 0.05); audio.burst && audio.burst(0.2, 3200, 0.08); } else { showCarrier(); parkCarrier(); r.o.pat = Math.max(4, r.o.pat - 6); } }
  const REG = V3(K.register.x, T, K.register.z - 0.62), RG = registerKit(ST, REG, { open: 'FOXY BLENDS  ·  OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; coinDrop(v); regDraw(P); tone(1400 + v * 40, 0.05, 0.03); if (P.given === P.owed) payDone(); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; tone(220, 0.2, 0.04, 'sawtooth'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone() { const P = S.pay, o = orders.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); if (!o) return; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars); S.combo = o.stars === 3 ? S.combo + 1 : 0;
    flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + pts + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : ''), '#ffd23a', 1.8); tone(1046, 0.1, 0.05); setTimeout(() => tone(1568, 0.12, 0.05), 90); o.st = 'leave'; o.t = 0; }
  function revealInfo(it) { const want = orders.filter(o => o.st === 'wait').sort((a, b) => a.pat - b.pat);
    for (const o of want) { const TF = trayFor(o), still = o.items.filter((_, j) => !TF.covered[j]); let hi = still.findIndex(q => exact(q, it)); if (hi < 0) hi = still.findIndex(q => q.r === it.r); if (hi < 0) continue; const w = still[hi]; still.splice(hi, 1);
      return { oid: o.id, who: CUSTOMERS[o.ci].name, texOk: w.tex === it.tex, wantTex: TEX_NAME(w.tex), topOk: (w.top || '') === (it.top || ''), wantTop: w.top ? TOPS[w.top].name : 'NO TOPPING', completes: !still.length, missing: still.map(q => itemName(q) + ' · ' + TEX_NAME(q.tex)) }; }
    return { oid: null, who: null, completes: false, missing: [] }; }
  function revealDone(choice = 'tray') { const r = S.reveal; S.reveal = null; glassGroup.rotation.y = 0; glassGroup.scale.setScalar(1); glass = null; showGlass();
    if (choice === 'bin') { flash('SMOOTHIE BINNED', '#ec3013', 1); tone(160, 0.2, 0.04); return; }
    tray.push(r.it); rebuildTray(); tone(990, 0.08, 0.04);
    if (choice === 'serve') { const o = orders.find(q => q.id === r.oid && q.st === 'wait'); if (!o) return; carrier = tray.splice(0); rebuildTray(); serve(o); } }

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T + 0.15)), hit = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const TARGETS = () => { const t = [];
    for (const [k, c] of Object.entries(K.crates)) t.push({ kind: 'crate', k, p: V3(c.x, T + 0.12, c.z), r: 38 });
    t.push({ kind: S.chopped ? 'chopped' : 'chopBoard', p: V3(K.chop.x, T + 0.06, K.chop.z), r: 70 });
    t.push({ kind: 'ice', p: V3(K.ice.x, T + 0.2, K.ice.z), r: 44 }, { kind: 'yog', p: V3(K.yog.x, T + 0.2, K.yog.z), r: 44 }, { kind: 'blendBtn', p: V3(K.blender.x, T + 0.2, K.blender.z + 0.08), r: 54 }, { kind: 'sink', p: V3(K.sink.x, T + 0.06, K.sink.z), r: 40 });
    t.push({ kind: 'glasses', p: V3(K.glasses.x, T + 0.14, K.glasses.z), r: 40 }); if (glass) t.push({ kind: 'glass', p: V3(K.pour.x, T + 0.12, K.pour.z), r: 50 });
    for (const [k, tp] of Object.entries(K.tops)) if (TOPS[k].day <= S.day) t.push({ kind: 'top', k, p: V3(tp.x, T + 0.2, tp.z), r: 34 });
    if (tray.length) t.push({ kind: 'tray', p: V3(K.tray.x, T + 0.08, K.tray.z), r: 46 });
    t.push({ kind: 'stand', p: V3(K.stand.x, T + 0.12, K.stand.z), r: 42 }); if (carrier) t.push({ kind: 'carrier', p: carrierMesh.position.clone().setY(T + 0.15), r: 46 });
    orders.forEach(o => o.st === 'wait' && t.push({ kind: 'cust', o, p: V3(o.f.position.x, 1.45, o.f.position.z), r: 70 })); return t; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * scale() && d < bd) { bd = d; best = t; } } return best; }
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const STATION = { crate: 'fruit', chopBoard: 'fruit', chopped: 'fruit', ice: 'blend', yog: 'blend', blendBtn: 'blend', sink: 'blend', glasses: 'pour', glass: 'pour', top: 'pour', tray: 'pour', stand: 'serve', carrier: 'serve', cust: 'serve' };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (S.phase !== 'shift' || S.pay || DM.on || S.reveal || S.react || S.hold) return; const { x, y } = local(e), t = pickAt(x, y);
    if (S.cut && (!t || t.kind === 'chopBoard')) { e.preventDefault(); setFocus('fruit'); S.stroke = { x, y }; strokeMove(x, y); return; } if (!t) return; e.preventDefault();
    if (S.focus === 'all' && !['crate', 'carrier', 'yog', 'blendBtn', 'glass', 'chopped'].includes(t.kind)) setFocus(STATION[t.kind]);
    if (t.kind === 'crate') { if (S.chopped && S.chopped.k === t.k) { flash('ALREADY CUT · TAP IT INTO THE JUG', '#ffffff', 1.2); setFocus('fruit'); return; } if (S.cut || S.chopped) { flash('CUTTING BOARD IS BUSY', '#ffffff', 1); setFocus('fruit'); return; } if (stock[t.k] <= 0) { flash('OUT OF ' + FRUIT[t.k].name + ' · JULEP IS ON IT', '#ec3013', 1.5); restock(t.k); return; } needCut(t.k); setFocus('fruit'); }
    else if (t.kind === 'chopBoard') flash('TAP A FRUIT CRATE TO CUT ONE', '#ffffff', 1);
    else if (t.kind === 'chopped') { const k = S.chopped.k; S.chopped.g.visible = false; const m = chopPile(k); m.scale.setScalar(0.7); drag = { kind: 'fruit', mesh: m, k, x0: x, y0: y }; scene.add(m); m.position.copy(S.chopped.g.position); }
    else if (t.kind === 'ice') addIce();
    else if (t.kind === 'yog') startHold('yog');
    else if (t.kind === 'blendBtn') startHold('blend');
    else if (t.kind === 'sink') dumpJug();
    else if (t.kind === 'glasses') placeGlass();
    else if (t.kind === 'glass') { if (glass.poured) finishGlass(); else startHold('pour'); }
    else if (t.kind === 'top') addTop(t.k);
    else if (t.kind === 'tray') { const it = tray.pop(); rebuildTray(); flash(itemName(it) + ' BINNED', '#ec3013', 1.1); tone(160, 0.2, 0.04); }
    else if (t.kind === 'stand') { if (carrier) return; if (!tray.length) { flash('TRAY IS EMPTY', '#ffffff', 0.9); return; } carrier = tray.splice(0); rebuildTray(); showCarrier(); parkCarrier(); tone(700, 0.08, 0.04); }
    else if (t.kind === 'carrier') { drag = { kind: 'carrier', mesh: carrierMesh, x0: x, y0: y }; }
    else if (t.kind === 'cust') { if (carrier) serve(t.o); else flash(CUSTOMERS[t.o.ci].name + ' · DRAG THE CARRIER HERE', '#ffffff', 1.2); } }
  function onMove(e) { if (S.stroke) { const { x, y } = local(e); strokeMove(x, y); return; } if (!drag) return; const { x, y } = local(e); ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) drag.mesh.position.set(hit.x, T + 0.18, hit.z); }
  function onUp(e) { if (S.stroke) { S.stroke = null; knife.visible = false; return; } if (S.hold && !DM.on) { releaseHold(); return; } if (!drag) return; const { x, y } = local(e), d = drag; drag = null; const tap = Math.hypot(x - d.x0, y - d.y0) < 14;
    if (d.kind === 'fruit') { scene.remove(d.mesh); const onJug = tap || pickAt(x, y, ['blendBtn', 'yog', 'ice']) || Math.hypot(scr(V3(K.blender.x, K.baseTop + 0.2, K.blender.z)).x - x, scr(V3(K.blender.x, K.baseTop + 0.2, K.blender.z)).y - y) < 80 * scale(); if (onJug && addFruit(d.k)) { clearChopped(); flash(FRUIT[d.k].name + ' IN THE JUG', '#22c55e', 0.9); } else if (S.chopped) S.chopped.g.visible = true; }
    else if (d.kind === 'carrier') { const t = pickAt(x, y, ['cust']); if (t) serve(t.o); if (carrier) parkCarrier(); } }
  function strokeMove(x, y) { const C = S.cut, st = S.stroke; if (!C || !st) return; const v = scr(V3(K.chop.x + 0.04, T + 0.1, K.chop.z)), R = 70 * scale(), sxa = st.x - v.x, sxb = x - v.x, sya = st.y - v.y, syb = y - v.y;
    if ((sxa * sxb < 0 && Math.abs(y - v.y) < R) || (sya * syb < 0 && Math.abs(x - v.x) < R)) cutOnce(); st.x = x; st.y = y;
    ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) { knife.visible = true; knife.position.set(hit.x, T + 0.14, hit.z - 0.1); knife.rotation.set(0, Math.PI / 2 + 0.15, -0.25); } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp);

  // ---------- flow ----------
  function clearAll() { S.hold = null; stream.visible = false; jugGroup.position.set(K.blender.x, K.baseTop, K.blender.z); jugGroup.rotation.set(0, 0, 0); clearChopped(); knife.visible = false; if (S.cut) { scene.remove(S.cut.mesh); S.cut = null; } slices.forEach(s2 => scene.remove(s2)); slices.length = 0; S.reveal = null; S.react = null; S.restock = null;
    orders.forEach(o => o.f.visible = false); orders.length = 0; carrier = null; showCarrier(); tray.length = 0; rebuildTray(); glass = null; showGlass(); resetJug(); drag = null; }
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done') return; S.payOut = null; payProps(null); if (!S.demo && DM.on) demoStop(); audio.init && audio.init(); clearAll(); Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.5, done: null, pay: null, combo: 0 });
    FK.forEach(k => setStock(k, 0)); S.focus = 'all'; setUniform(!!save.flag('smoothieUniform')); julep.visible = false; ben.visible = false; glideTo(workShot(), 1.6); say('JULEP: "Fruit on the right, blender in the middle, glasses on the left. Keep it cold!"', 6); S.glideT = 1.65; }
  function endShift() { S.phase = 'done'; S.hold = null; stream.visible = false; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 5 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = []; try { save.addGold(total); save.best(SAVE.best, total); if (S.served >= 3 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...RECIPES.filter(r => r.day === nd).map(r => r.name), ...Object.values(TOPS).filter(v => v.day === nd).map(v => v.name + ' TOPPING')]; } if (!save.flag('smoothieUniform') && S.served >= 3) { save.setFlag('smoothieUniform'); setUniform(true); unlock.push('BLENDS UNIFORM (cap + towel + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold };
    if (newDay) S.day += 1; glideTo(wideShot(), 1.4); say(eod ? 'JULEP: "EMPLOYEE OF THE DAY! The piers are buzzing!"' : S.served >= 3 ? 'JULEP: "Good shift. Same tide tomorrow?"' : 'JULEP: "Choppy one. Tomorrow will be calmer."', 6); orders.forEach(o => { o.st = 'leave'; o.t = 0; }); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); tone(1320, 0.1, 0.05); if (S.done) S.done.gold = save.data.gold; return true; }

  // ---------- DEMO: an autopilot plays a real shift with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, anim: null, day0: 1, holdTo: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 20; scene.add(hand);
  const handTo = (p, f) => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.5); if (f) setFocus(f); DM.hint = { p: p.clone().setY(Math.max(T, p.y - 0.15)), r: 0.18 }; };
  const cap = (id, key, text) => { if (DM.seen[id]) return; DM.seen[id] = true; DM.cap = text; DM.key = key; DM.cd = Math.max(DM.cd, 1.6); };
  function slide(mesh, from, to, dur, done) { scene.add(mesh); mesh.position.copy(from); DM.anim = { mesh, from: from.clone(), to: to.clone(), t: 0, dur, done }; }
  const missingFruit = rec => { const left = rec.fruits.slice(); for (const k of J.fruits) { const i = left.indexOf(k); if (i >= 0) left.splice(i, 1); } return left; };
  const wrongFruit = rec => { const left = rec.fruits.slice(); return J.fruits.some(k => { const i = left.indexOf(k); if (i < 0) return true; left.splice(i, 1); return false; }); };
  const traySatisfies = o => trayFor(o).made >= o.items.length;
  function demoAct() { const o = orders.find(q => q.st === 'wait');
    if (S.pay) { const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); if (!DM.seen.pay) { cap('pay', 'COINS', 'THEY PAID ' + P.paid + 'g FOR A ' + P.total + 'g BILL. TAP COINS TO GIVE ' + P.owed + 'g CHANGE'); return 1.8; } DM.cap = 'GIVE ' + P.owed + 'g CHANGE · ' + (P.given + v) + ' / ' + P.owed + 'g'; DM.key = v + 'g'; giveCoin(v); if (!S.pay) { DM.served++; DM.cap = 'EXACT CHANGE! COINS GO TO THE CUSTOMER'; DM.key = '✓'; return 1.6; } return 0.85; }
    if (!o) return 0.4;
    if (carrier) { cap('hand', 'DRAG', 'DRAG THE CARRIER ONTO THE CUSTOMER WHO ORDERED IT'); const to = V3(o.f.position.x, 1.3, o.f.position.z); handTo(to, 'serve'); carrierMesh.visible = false; const m = carrierMesh.clone(); m.visible = true; slide(m, carrierMesh.position.clone(), to, 0.7, () => { scene.remove(m); carrierMesh.visible = true; serve(o); }); return 1.0; }
    if (traySatisfies(o)) { cap('stand', 'TAP', 'ORDER READY? TAP THE CARRIER STAND TO PACK THE TRAY'); handTo(V3(K.stand.x, T + 0.15, K.stand.z), 'serve'); carrier = tray.splice(0); rebuildTray(); showCarrier(); parkCarrier(); tone(700, 0.08, 0.04); return 0.8; }
    if (glass && glass.poured) { const need = needTop(); if (need && !glass.top) { cap('top', 'TAP', 'THE TICKET SAYS ' + TOPS[need].name + ': TAP THE JAR TO SPRINKLE IT ON'); handTo(V3(K.tops[need].x, T + 0.25, K.tops[need].z), 'pour'); addTop(need); return 0.8; } finishGlass(); return 0.5; }
    const TF = trayFor(o); if (TF.next < 0) return 0.4; const it = o.items[TF.next], rec = REC(it.r);
    if (J.blend >= 0.3) { if (!glass) { cap('glass', 'TAP', 'TAP THE GLASSES: A GLASS GOES ON THE RED MAT'); handTo(V3(K.glasses.x, T + 0.15, K.glasses.z), 'pour'); placeGlass(); return 0.7; } cap('pour', 'HOLD', 'HOLD THE GLASS TO POUR. LET GO BETWEEN THE RED LINES'); handTo(V3(K.pour.x, T + 0.15, K.pour.z), 'pour'); startHold('pour'); DM.holdTo = (POUR[0] + POUR[1]) / 2; return 0.1; }
    if (wrongFruit(rec)) { cap('sink', 'TAP', 'WRONG FRUIT IN THE JUG? TAP THE SINK TO RINSE IT'); handTo(V3(K.sink.x, T + 0.1, K.sink.z), 'blend'); dumpJug(); return 0.7; }
    const miss = missingFruit(rec);
    if (miss.length) { const k = miss[0];
      if (S.chopped && S.chopped.k === k) { cap('jug', 'DRAG', 'TAP OR DRAG THE CUT FRUIT INTO THE BLENDER JUG'); const from = V3(K.chop.x, T + 0.12, K.chop.z); handTo(from, 'blend'); clearChopped(); slide(chopPile(k), from, V3(K.blender.x, K.baseTop + 0.4, K.blender.z), 0.55, () => { scene.remove(DM.animMesh); addFruit(k); }); DM.animMesh = DM.anim.mesh; return 0.8; }
      if (S.chopped) clearChopped();
      if (S.cut) { cap('cut', 'SWIPE', 'SWIPE ACROSS THE ' + FRUIT[S.cut.k].name + ' ON THE BOARD TO CUT IT'); handTo(V3(K.chop.x + 0.04, T + 0.12, K.chop.z), 'fruit'); knife.visible = true; knife.position.set(K.chop.x - 0.04 + (S.cut.cuts % 2 ? 0.12 : -0.12), T + 0.14, K.chop.z); knife.rotation.set(0, Math.PI / 2 + 0.15, -0.25); cutOnce(); if (!S.cut) knife.visible = false; return 0.4; }
      cap('crate', 'TAP', 'THE TICKET SAYS ' + rec.name + ': TAP THE ' + FRUIT[k].name + ' CRATE'); handTo(V3(K.crates[k].x, T + 0.15, K.crates[k].z), 'fruit'); if (stock[k] <= 0) setStock(k, CAP()); needCut(k); return 0.8; }
    if (J.ice < ICE_N) { cap('ice', 'TAP', 'TAP THE ICE BUCKET: ' + ICE_N + ' CUBES'); handTo(V3(K.ice.x, T + 0.2, K.ice.z), 'blend'); addIce(); return 0.45; }
    if (J.yog < YOG[0]) { cap('yog', 'HOLD', 'HOLD THE YOGURT TUB. LET GO IN THE GREEN BAND'); handTo(V3(K.yog.x, T + 0.2, K.yog.z), 'blend'); startHold('yog'); DM.holdTo = (YOG[0] + YOG[1]) / 2; return 0.1; }
    cap('blend', 'HOLD', 'HOLD THE RED BUTTON TO BLEND. LET GO AT ' + TEX[it.tex].name); handTo(V3(K.blendBtn.x, T + 0.1, K.blendBtn.z), 'blend'); startHold('blend'); DM.holdTo = (TEX[it.tex].z[0] + TEX[it.tex].z[1]) / 2; return 0.1; }
  function demoStep(dt) { if (DM.anim) { const a = DM.anim; a.t += dt / a.dur; const k = Math.min(1, a.t), p = a.from.clone().lerp(a.to, smooth(0, 1, k)); p.y += Math.sin(k * Math.PI) * 0.25; a.mesh.position.copy(p); hand.position.copy(p); if (k >= 1) { DM.anim = null; scene.remove(a.mesh); a.done && a.done(); } return; }
    if (S.hold && DM.holdTo != null) { if (holdVal(S.hold.kind) >= DM.holdTo) { DM.holdTo = null; releaseHold(); DM.cd = 0.7; } return; }
    hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.6)); if (S.phase !== 'shift' || S.reveal || S.react || S.payOut) return; DM.cd -= dt; if (DM.cd > 0) return; const f0 = S.focus; DM.cd = demoAct(); if (S.focus !== f0) DM.cd += 0.5;
    if (DM.served >= 3 || S.t > 150) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.served = 0; DM.anim = null; DM.holdTo = null; DM.cd = 2.2; DM.day0 = S.day; S.day = Math.max(S.day, 2); DM.cap = 'WATCH A SHIFT AT FOXY BLENDS'; DM.key = ''; S.phase = 'intro'; S.done = null; S.demo = true; startShift(); S.next = 0.8; }
  function demoStop() { if (!DM.on) return; S.payOut = null; payProps(null); DM.on = false; S.demo = false; hand.visible = false; if (DM.anim) { scene.remove(DM.anim.mesh); DM.anim = null; } S.day = DM.day0; S.pay = null; S.phase = 'intro'; S.done = null; clearAll(); ben.visible = true; julep.visible = true; ben.position.set(-1.0, 0, K.z + 3.5); ben.rotation.y = 0.3; glideTo(wideShot(), 1.2); }

  // ---------- NEXT-STEP HINT ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'shift' || S.pay) return null; const P3 = (x, z, y = T) => V3(x, y, z), Hh = (p, station, text, r = 0.16) => ({ p, station, text, r });
    if (S.hold) { const D = HOLD_DEF[S.hold.kind], o0 = orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)[0], TF0 = o0 && trayFor(o0), want = S.hold.kind === 'blend' && TF0 && TF0.next >= 0 ? TEX[o0.items[TF0.next].tex].name : S.hold.kind === 'yog' ? 'JUST RIGHT' : 'AT THE LINE'; return Hh(P3(K.blender.x, K.blender.z), S.hold.kind === 'pour' ? 'pour' : 'blend', 'LET GO AT ' + want + ' · ' + D.label); }
    const o = orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)[0]; if (!o) return null; const who = CUSTOMERS[o.ci].name;
    if (carrier) return Hh(P3(o.f.position.x, o.f.position.z, 0.02), 'serve', 'DRAG THE CARRIER TO ' + who, 0.45);
    const TF = trayFor(o); if (TF.made >= o.items.length) return Hh(P3(K.stand.x, K.stand.z), 'serve', TF.extra.length ? 'TAP THE CARRIER STAND (EXTRAS ARE FINE)' : 'TAP THE CARRIER STAND', 0.22);
    if (glass && glass.poured) { const need = needTop(); if (need && !glass.top) return Hh(P3(K.tops[need].x, K.tops[need].z), 'pour', 'TAP THE ' + TOPS[need].name + ' JAR', 0.13); return Hh(P3(K.pour.x, K.pour.z), 'pour', 'TAP THE GLASS TO FINISH IT', 0.14); }
    const it = o.items[TF.next], rec = REC(it.r);
    if (J.blend >= 0.3) { if (!glass) return Hh(P3(K.glasses.x, K.glasses.z), 'pour', 'TAP THE GLASSES', 0.14); return Hh(P3(K.pour.x, K.pour.z), 'pour', 'HOLD THE GLASS TO POUR · STOP AT THE RED LINES', 0.14); }
    if (wrongFruit(rec)) return Hh(P3(K.sink.x, K.sink.z), 'blend', 'WRONG FRUIT: TAP THE SINK TO RINSE THE JUG', 0.22);
    const miss = missingFruit(rec);
    if (miss.length) { const k = miss[0]; if (S.chopped && S.chopped.k === k) return Hh(P3(K.chop.x, K.chop.z), 'fruit', 'TAP THE CUT ' + FRUIT[k].name + ' INTO THE JUG', 0.24); if (S.cut) return Hh(P3(K.chop.x + 0.04, K.chop.z), 'fruit', 'SWIPE ACROSS THE ' + FRUIT[S.cut.k].name + ' TO CUT · ' + S.cut.cuts + ' / ' + CUTS(), 0.24); if (S.chopped) return Hh(P3(K.chop.x, K.chop.z), 'fruit', 'TAP THE CUT ' + FRUIT[S.chopped.k].name + ' INTO THE JUG FIRST', 0.24); return Hh(P3(K.crates[k].x, K.crates[k].z), 'fruit', 'TAP THE ' + FRUIT[k].name + ' CRATE · ' + rec.name, 0.15); }
    if (J.ice < ICE_N) return Hh(P3(K.ice.x, K.ice.z), 'blend', 'TAP THE ICE BUCKET · ' + J.ice + ' / ' + ICE_N, 0.17);
    if (J.yog < YOG[0]) return Hh(P3(K.yog.x, K.yog.z), 'blend', 'HOLD THE YOGURT TUB · LET GO IN THE GREEN', 0.16);
    return Hh(P3(K.blendBtn.x, K.blendBtn.z), 'blend', 'HOLD THE RED BUTTON · ' + who + ' WANTS ' + TEX[it.tex].name, 0.12); }
  let HINT = null, hintT = 0;
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === 'all' || S.focus === HINT.station) return; if (drag || S.hold || S.stroke || S.reveal || S.react || S.pay) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 0.9 && performance.now() - (S.userFocusT || 0) > 2500) S.focus = HINT.station; }
  function updHint(dt) { hintT += dt; HINT = DM.on ? (DM.hint && !DM.anim ? DM.hint : null) : nextHint(); RINGS.place(HINT && !S.reveal && !S.react ? HINT : null, hintT, dt); }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const lerpCam = (sh, k) => { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); };
  function step(dt) {
    if (S.reveal) { S.reveal.t += dt; const r = S.reveal, sh = shotFor('reveal', () => { const p = K.pour; return [V3(p.x - 0.14, T, p.z - 0.14), V3(p.x + 0.14, T, p.z + 0.14), V3(p.x - 0.12, T + 0.32, p.z), V3(p.x + 0.12, T + 0.32, p.z)]; }, 0.62, 0.18, 0.12); lerpCam(sh, Math.min(1, dt * 6)); glassGroup.rotation.y += dt * 1.6; glassGroup.scale.setScalar(1 + Math.sin(Math.min(1, r.t / 0.35) * Math.PI) * 0.12); if (DM.on && r.t > 1.8) revealDone(r.completes ? 'serve' : r.oid ? 'tray' : 'bin'); }
    else if (S.pay || S.payOut) { const port = CW() < CHh(), sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0.25, 0.07); lerpCam(sh, Math.min(1, dt * 5)); regDisp.scale.set(port ? 0.36 : 0.46, port ? 0.133 : 0.17, 1); }
    else if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position, sh = shotFor('react' + o.spot, () => [V3(f.x - 0.45, 1.25, f.z), V3(f.x + 0.45, 1.25, f.z), V3(f.x, 2.35, f.z), V3(f.x, 1.55, f.z - 0.3)], 0.12, 0.12, 0.1); lerpCam(sh, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.0 : 2.4)) reactDone(); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (S.phase === 'shift' || S.phase === 'glide') lerpCam(workShot(), Math.min(1, dt * 3.2));
    { const hide = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !hide); K.booths.forEach(m => m.visible = !hide); }
    camera.lookAt(CAM.look);
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    lampGl.forEach((s, i) => s.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 2 + i) * 0.04);
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { FK.forEach(k => setStock(k, S.demo ? 99 : CAP())); S.phase = 'shift'; S.next = S.demo ? 0.5 : 1.5; flash('DOORS OPEN!', '#22c55e', 1.4); } }
    { const hide = (S.phase === 'shift' || S.phase === 'glide') && (CAM.t > 0.35 || !CAM.from); K.cut.forEach(m => m.visible = !hide); lampGl.forEach(s => s.visible = !hide); }
    const work = S.phase === 'shift';
    if (work) { S.t += dt; if (S.t >= BLENDS.shift && !DM.on) endShift(); }
    if (work) stepHold(dt);
    if (DM.on) demoStep(dt);
    updHint(dt); if (work) autoFollow();
    // jug tilts over the glass while pouring
    { const pouring = S.hold && S.hold.kind === 'pour', tgt = pouring ? V3(K.pour.x - 0.2, T + 0.36, K.pour.z) : V3(K.blender.x, K.baseTop, K.blender.z); if (!(S.hold && S.hold.kind === 'blend')) jugGroup.position.lerp(tgt, Math.min(1, dt * 10)); jugGroup.rotation.z = damp(jugGroup.rotation.z, pouring ? -1.25 : 0, 10, dt);
      if (jugLiquid && glass) jugLiquid.scale.y = Math.max(0.01, jugLevel() * 0.9 * (1 - glass.fill * 0.85));
      stream.visible = !!pouring && jugGroup.rotation.z < -0.9; if (stream.visible) { const sx = K.pour.x - 0.035, top = jugGroup.position.y + 0.2, bot = T + 0.02 + glass.fill * GH * 0.95, h = Math.max(0.02, top - bot); stream.scale.set(1 + Math.sin(clock.elapsedTime * 40) * 0.12, h, 1); stream.position.set(sx, bot + h / 2, K.pour.z); if (Math.random() < dt * 5) puff(sx, bot + 0.02, K.pour.z, 0xffffff, 1); } }
    regDisp.visible = !!(S.pay || S.payOut);
    drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; tone(2400 + Math.random() * 400, 0.04, 0.03, 'square'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, K.pass.y + 0.03, K.pass.z); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    // customers
    if (work) { S.next -= dt; const maxQ = Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st !== 'leave').length < maxQ && S.t < BLENDS.shift - 12) { newOrder(); S.next = Math.max(9, 18 - S.day * 1.5) * rr(0.8, 1.2); } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot]; o.t = (o.t || 0) + dt; kit.animFox && kit.animFox(o.f, dt, o.st === 'walk' || o.st === 'leave' ? 2 : 0);
      if (o.st === 'walk') { o.f.position.x = damp(o.f.position.x, sp.x, 2.2, dt); o.f.position.z = damp(o.f.position.z, sp.z, 2.2, dt); o.f.rotation.y = Math.PI; if (Math.abs(o.f.position.x - sp.x) < 0.08) { o.st = 'wait'; say(CUSTOMERS[o.ci].name + ': "' + o.line + '"', 3); tone(1046, 0.06, 0.03); } }
      else if (o.st === 'wait' && work) { o.pat -= DM.on ? 0 : dt; o.f.userData.mood = o.pat / o.patMax < 0.3 ? 'angry' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; S.combo = 0; flash(CUSTOMERS[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); tone(180, 0.3, 0.05, 'sawtooth'); } }
      else if (o.st === 'leave') { o.f.rotation.y = Math.PI / 2 + Math.PI; o.f.position.x += dt * 2.4; if (o.t > 3.5) { o.f.visible = false; orders.splice(i, 1); } } }
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.rotation.y = damp(ben.rotation.y, 0.3, 4, dt); ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox && (kit.animFox(ben, dt, 0), kit.animFox(julep, dt, 0));
    if (greet && BP.arms && BP.arms[0]) { const w = performance.now() / 1000, arm = BP.arms[0]; arm.rotation.set(-0.25, 0, -2.55 + Math.sin(w * 7) * 0.32); }
  }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() {
    const ticket = o => ({ id: o.id, name: CUSTOMERS[o.ci].name, role: CUSTOMERS[o.ci].role, items: o.items.map(it => ({ name: itemName(it), tex: TEX[it.tex].name, texCol: TEX[it.tex].col, fruits: REC(it.r).fruits.map(k => FRUIT[k].name.toLowerCase()).join(' · '), top: it.top ? TOPS[it.top].name : '' })), total: o.total, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait' });
    const H = S.hold, o0 = orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)[0], TF0 = o0 && trayFor(o0), wantTex = TF0 && TF0.next >= 0 ? o0.items[TF0.next].tex : null;
    const press = H ? (() => { const D = HOLD_DEF[H.kind], v = holdVal(H.kind), want = H.kind === 'blend' ? wantTex : D.zones.find(z => z[4])[4]; return { label: D.label, d: v / D.max, zone: zoneAt(H.kind, v), want: H.kind === 'blend' ? (want ? TEX[want].name : '') : D.zones.find(z => z[4])[0], zones: D.zones.map(z => ({ name: z[0], w: Math.round((z[2] - z[1]) / D.max * 100), col: z[3], want: z[4] && z[4] === want })) }; })() : null;
    return { phase: S.phase, day: S.day, left: Math.max(0, BLENDS.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), tray: tray.map(it => itemName(it) + ' · ' + TEX_NAME(it.tex) + (it.top ? ' + ' + TOPS[it.top].name : '')), carrier: !!carrier,
      jug: { ice: J.ice, yog: Math.round(J.yog * 100), fruits: J.fruits.map(k => FRUIT[k].name), blend: J.blend >= 0.3 ? TEX_NAME(texOf(J.blend)) : '' }, glass: glass ? { fill: glass.fill, poured: !!glass.poured } : null,
      pay: S.pay ? { ...S.pay } : null, flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, uniform: !!save.flag('smoothieUniform'),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: avail().map(r => ({ name: r.name, price: r.price })), tops: topsAvail().map(k => TOPS[k].name), demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 3 } : null, focus: S.focus, press,
      hint: HINT && HINT.text && !S.reveal && !S.react ? { text: HINT.text, station: HINT.station } : null,
      reveal: S.reveal ? { name: itemName(S.reveal.it), tex: TEX_NAME(S.reveal.it.tex), top: S.reveal.it.top ? TOPS[S.reveal.it.top].name : '', clean: S.reveal.it.clean, texOk: !!S.reveal.texOk, wantTex: S.reveal.wantTex || '', topOk: S.reveal.topOk !== false, wantTop: S.reveal.wantTop || '', who: S.reveal.who, completes: S.reveal.completes, missing: S.reveal.missing, ok: !!S.reveal.oid } : null,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip } : null, stock: { ...stock },
      badges: { fruit: S.cut ? S.cut.cuts + ' / ' + CUTS() : S.chopped ? 'CUT' : FK.some(k => stock[k] <= 0) && work() ? 'OUT' : '', blend: H && H.kind !== 'pour' ? (H.kind === 'yog' ? 'POURING' : 'BLENDING') : J.blend >= 0.3 ? 'READY' : J.fruits.length || J.ice || J.yog ? 'JUG ' + (J.fruits.length + (J.ice ? 1 : 0) + (J.yog > 0.05 ? 1 : 0)) : '', pour: H && H.kind === 'pour' ? 'POURING' : glass && glass.poured ? 'TOPPING' : tray.length ? 'TRAY ' + tray.length : '', serve: carrier ? 'CARRIER!' : '', all: orders.filter(o => o.st === 'wait').length ? orders.filter(o => o.st === 'wait').length + ' WAIT' : '' } }; }
  const work = () => S.phase === 'shift';
  function emit() { onState(hud()); }
  rebuildJug(); frame();
  return { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } }, revealChoice: c => S.reveal && revealDone(c), setFocus, demoStart, demoStop, startShift, endShift, giveCoin, buyUpgrade, hud, setPaused(v) { PAUSE = !!v; },
    toIntro() { S.phase = 'intro'; S.done = null; setUniform(true); ben.visible = true; julep.visible = true; ben.position.set(-1.0, 0, K.z + 3.5); ben.rotation.y = 0.3; glideTo(wideShot(), 1); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, BLENDS.shift - t); }, _state: () => S,
    _auto() { return { orders, tray, J, K, get glass() { return glass; }, addFruit, addIce, startHold, releaseHold, placeGlass, addTop, finishGlass, needCut, cutOnce, setStock, scr }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
