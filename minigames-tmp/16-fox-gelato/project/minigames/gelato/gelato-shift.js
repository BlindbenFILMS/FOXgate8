// 8 GATES — FOX GELATO [foxGelato]: a gelato parlour that drops into ANY FOX world building, plus its shift game.
// Rebuilt in 3D from the 2D gelato minigame (carve the scoop to size, stack it without toppling, drizzle, sprinkle, serve).
//   buildParlour(ctx)            → the whole interior from a Meru-style ctx { THREE, M, toon, canvasTex, scene, grad, addOutline, origin }
//                                  returns K: anchors (tubs, holder, bottles, spots, door, keeper), walk colliders, wall groups, cut-away list.
//   createGelatoShift({ container, onState, opts }) → stand-alone page: WALK AROUND the parlour (standard Game HUD, vehicle="gelato":
//                                  1 WAVE · 2 TASTE · 3 HOP) or PUT ME TO WORK for a 3-minute shift. opts: { keeper, customers, onExit }.
// Shift stations (one touch gesture each): CONES/CUPS tap · SCOOP drag round in a tub until the ball fills the ghost bubble ·
// STACK the scoop swings over the cone, tap to drop it, keep the balance line over the cone · SAUCE press a bottle + drag over the scoops ·
// SPRINKLES hold the shaker and SHAKE it side to side · WAFER tap · SERVE drag the cone to the customer · PAY exact change.
// Save keys gelato.parlour.* · flag gelatoUniform · stat gelato.parlour.stars (employee of the day).
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { PLAYER_MALE, PLAYER_FEMALE } from '../../fox-kit.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { createGelatoAudio } from './gelato-audio.js';

export const GELATO = { name: 'FOX GELATO', room: 'foxGelato', shift: 180 };
// flavours: colours from the 2D game (pistachio, strawberry, mint, chocolate, lemon) + three more for later days
export const FLAVOURS = {
  strawberry: { name: 'STRAWBERRY', col: '#f0a0b0', dark: '#d97e90', bits: '#c42d3c', day: 1 },
  pistachio: { name: 'PISTACHIO', col: '#b9cf8a', dark: '#8fa860', bits: '#6f8a3a', day: 1 },
  chocolate: { name: 'CHOCOLATE', col: '#8a6448', dark: '#6b4a2c', bits: '#3e2a18', day: 1 },
  lemon: { name: 'LEMON', col: '#f0d878', dark: '#d4ba52', bits: '#fff6c8', day: 1 },
  mint: { name: 'MINT CHIP', col: '#a8d8c8', dark: '#84bfab', bits: '#3e2a18', day: 2 },
  vanilla: { name: 'VANILLA', col: '#f6efdc', dark: '#e0d2b0', bits: '#2a1a10', day: 3 },
  blueberry: { name: 'BLUEBERRY', col: '#aaa6e8', dark: '#8582c9', bits: '#4a3a8a', day: 4 },
  mango: { name: 'MANGO', col: '#f6b04a', dark: '#d98f2a', bits: '#fff0c0', day: 5 } };
export const FLAV_KEYS = Object.keys(FLAVOURS);
export const SAUCES = { choc: { name: 'CHOCOLATE SAUCE', short: 'CHOC SAUCE', col: '#4a2c18', day: 2 }, berry: { name: 'BERRY SAUCE', short: 'BERRY SAUCE', col: '#d8405a', day: 4 }, caramel: { name: 'CARAMEL', short: 'CARAMEL', col: '#d08a2a', day: 4 } };
export const VESSELS = { cone: { name: 'CONE', day: 1, price: 2 }, cup: { name: 'CUP', day: 2, price: 2 } };
const EXTRAS = { sprinkles: { name: 'SPRINKLES', day: 3 }, wafer: { name: 'WAFER', day: 4 } };
const SPRINKLE_COLS = ['#ec3013', '#f0d060', '#2f7d6a', '#f472b6', '#6b4a2c', '#38bdf8', '#fbfbf7'];
export const UPGRADES = [
  { id: 'scooper', name: 'WIDE SCOOPER', cost: 35, line: 'The just-right zone for a scoop is 50% wider.' },
  { id: 'holder', name: 'STEADY HOLDER', cost: 40, line: 'Stacks can lean 40% further before they topple.' },
  { id: 'cold', name: 'COLD CASE', cost: 30, line: 'Scoops melt half as fast.' },
  { id: 'shaker', name: 'BIG SHAKER', cost: 25, line: 'Twice the sprinkles per shake.' },
  { id: 'radio', name: 'PARLOUR RADIO', cost: 60, line: 'Happy customers wait 20% longer.' }];
// the 2D game's four regulars (fur + clothes from gelato.html CUSTOMERS); a world can pass its own list in opts.customers
export const REGULARS = [
  { name: 'YUZU', role: 'Regular', fur: '#ee7d24', furDark: '#b8531a', inner: '#f9ecd9', torso: ['#1f3350', '#e8eef6', '#16263c'], look: 'f' },
  { name: 'MOCHI', role: 'Regular', fur: '#e6e4de', furDark: '#a8a6a0', inner: '#fbfaf7', torso: ['#4a3a5c', '#ede9fe', '#332745'], look: 'm' },
  { name: 'KUMA', role: 'Regular', fur: '#c9682a', furDark: '#8a4213', inner: '#f2e0c8', torso: ['#3f5d47', '#e2efe4', '#2b4232'], look: 'm' },
  { name: 'HANA', role: 'Regular', fur: '#f0dcbe', furDark: '#c2a577', inner: '#fff6ea', torso: ['#8f2b1e', '#fde7e2', '#661a10'], look: 'f' }];
const KEEPER = { name: 'PIPPA', role: 'Gelato maker', fur: '#f2c39a', furDark: '#c98a5a', inner: '#fff4e6', torso: ['#5cc6b0', '#e9fbf5', '#2f7d6a'], look: 'f' };
const LINES = { order: ['Ciao! I know exactly what I want.', 'Is it gelato o’clock? It is.', 'Make it a tall one, please!', 'Ooh, they all look so good.', 'My usual, please!'],
  angry: ['Too slow, it is melting in my imagination!', 'I am going for a smoothie instead.'] };
const SAVE = { day: 'gelato.parlour.day', best: 'gelato.parlour.best', upg: 'gelato.parlour.upg.', stars: 'gelato.parlour.stars' };
export const foxLookOf = c => ({ ...(c.look === 'm' ? PLAYER_MALE : PLAYER_FEMALE), fur: c.fur, furDark: c.furDark, paw: c.fur, tailBase: c.furDark, tailMid: c.fur, muzzle: c.inner, chin: c.inner, snout: c.inner });

// ---------------- gelato art (shared by the tubs, the scooper, the build and the demo) ----------------
const _geoCache = new Map();
function ballGeo(T3, seed = 0) { const k = 'ball' + (seed % 4); if (_geoCache.has(k)) return _geoCache.get(k);
  const g = new T3.SphereGeometry(1, 22, 16), p = g.attributes.position; // soft lumpy scoop with a ruffled lower edge
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), lump = 1 + 0.045 * Math.sin(a * 5 + seed) * Math.cos(y * 4 + seed) + 0.03 * Math.sin(y * 9 + a * 3);
    const skirt = y < -0.25 ? 1 + 0.09 * Math.max(0, Math.sin(a * 9 + seed)) * smooth(-0.25, -0.75, y) : 1; const s = lump * skirt; p.setXYZ(i, x * s, y < -0.55 ? -0.55 - (y + 0.55) * 0.35 : y * s, z * s); }
  g.computeVertexNormals(); _geoCache.set(k, g); return g; }
export function makeScoop(T3, toon, key, r, outline, seed = 0) {
  const F = FLAVOURS[key], g = new T3.Group(), m = new T3.Mesh(ballGeo(T3, seed), toon(F.col)); m.scale.setScalar(r); m.castShadow = true; if (outline) outline(m, 0.012 / r, 1); g.add(m); g.userData.ball = m;
  if (F.bits) for (let i = 0; i < 9; i++) { const a = i * 2.39 + seed, y = -0.15 + (i % 4) * 0.25, rr2 = Math.sqrt(Math.max(0.05, 1 - y * y)) * r * 1.0; const b = new T3.Mesh(new T3.BoxGeometry(0.012, 0.008, 0.012), toon(F.bits)); b.position.set(Math.cos(a) * rr2, y * r, Math.sin(a) * rr2); b.rotation.set(a, a * 2, 0); g.add(b); }
  return g; }
export function coneMesh(T3, toon, CTX, grad, outline) {
  const tex = CTX(128, 128, c => { c.fillStyle = '#e0a85a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#b07a36'; c.lineWidth = 5; for (let i = -128; i < 256; i += 22) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + 128, 128); c.stroke(); c.beginPath(); c.moveTo(i + 128, 0); c.lineTo(i, 128); c.stroke(); } });
  tex.wrapS = tex.wrapT = T3.RepeatWrapping; tex.repeat.set(3, 1.5);
  const g = new T3.Group(), body = new T3.Mesh(new T3.CylinderGeometry(0.068, 0.006, 0.2, 20, 1, true), new T3.MeshToonMaterial({ map: tex, gradientMap: grad, side: T3.DoubleSide })); body.position.y = 0.1; if (outline) outline(body, 0.008); g.add(body);
  const rim = new T3.Mesh(new T3.TorusGeometry(0.066, 0.01, 6, 22), toon('#d0944a')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.2; g.add(rim); g.userData.rimY = 0.2; g.userData.rimR = 0.06; return g; }
export function cupMesh(T3, toon, CTX, grad, outline) {
  const tex = CTX(128, 64, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#fbfbf7' : '#5cc6b0'; c.fillRect(i * 16, 0, 16, 64); } c.fillStyle = '#ec3013'; c.fillRect(0, 50, 128, 8); });
  tex.wrapS = T3.RepeatWrapping; tex.repeat.set(2, 1);
  const g = new T3.Group(), body = new T3.Mesh(new T3.CylinderGeometry(0.08, 0.058, 0.1, 22, 1, true), new T3.MeshToonMaterial({ map: tex, gradientMap: grad, side: T3.DoubleSide })); body.position.y = 0.05; if (outline) outline(body, 0.008); g.add(body);
  const base = new T3.Mesh(new T3.CylinderGeometry(0.058, 0.058, 0.006, 20), toon('#fbfbf7')); base.position.y = 0.003; g.add(base); const sp = new T3.Mesh(new T3.BoxGeometry(0.012, 0.004, 0.13), toon('#ec3013')); sp.position.set(0.05, 0.11, 0); sp.rotation.set(0.3, 0.4, -0.6); g.add(sp);
  g.userData.rimY = 0.1; g.userData.rimR = 0.075; return g; }
export function waferMesh(T3, toon) { const g = new T3.Group(), m = new T3.Mesh(new T3.CylinderGeometry(0.012, 0.012, 0.16, 10), toon('#e8b86a')); m.position.y = 0.08; g.add(m); for (let i = 0; i < 4; i++) { const s = new T3.Mesh(new T3.CylinderGeometry(0.0125, 0.0125, 0.008, 10), toon('#6b4a2c')); s.position.y = 0.03 + i * 0.035; g.add(s); } return g; }

// ---------------- the parlour interior (stand-alone page AND any FOX world building) ----------------
export function buildParlour(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, grad, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 12, D = 10, H = 4.2, KZ = -2.75, CZ = -1.1, TOP = 1.0;
  const cream = toon('#fbf3e6'), mint = toon('#a8dccb'), mintD = toon('#5cc6b0'), pink = toon('#f4a6b8'), berry = toon('#d8405a'), choc = toon('#6b4a2c'), chrome = toon('#d7dde3'), ink = toon('#201e1d'), wood = toon('#c99a62'), gold = toon('#e6b45a');
  const K = { root, W, D, H, z: KZ, caseZ: CZ, top: TOP, cut: [], walls: {}, colliders: [], circles: [], tubs: [], lamps: [], front: [], deco: [] };
  // floor: mint + cream checks; ceiling
  const floorT = CTX(256, 256, c => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#fbf3e6' : '#a8dccb'; c.fillRect(x * 32, y * 32, 32, 32); } }); floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 1.4, D / 1.4);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  // walls: pink + cream stripes, a chocolate drip border, mint wainscot (each wall is its own group so a walk camera can cut it away)
  const wallT = CTX(256, 256, c => { c.fillStyle = '#fbf3e6'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#f7c9d4'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 0, 16, 160); c.fillStyle = '#a8dccb'; c.fillRect(0, 168, 256, 88); c.fillStyle = '#6b4a2c'; c.fillRect(0, 150, 256, 14); for (let i = 0; i < 256; i += 32) { const h = 10 + (i * 7) % 18; c.fillRect(i + 8, 160, 9, h); c.beginPath(); c.arc(i + 12.5, 160 + h, 4.5, 0, 7); c.fill(); } c.fillStyle = '#84bfab'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 176, 2, 80); });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1); const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: grad });
  for (const [key, x, z, w, ry, nx, nz] of [['back', 0, -D / 2, W, 0, 0, 1], ['front', 0, D / 2, W, Math.PI, 0, -1], ['left', -W / 2, 0, D, Math.PI / 2, 1, 0], ['right', W / 2, 0, D, -Math.PI / 2, -1, 0]]) {
    const g = new T3.Group(); root.add(g); const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; g.add(m); K.walls[key] = { g, n: [nx, nz], p: [x, z] }; }
  const ceil = M(new T3.BoxGeometry(W, 0.2, D), toon('#f6ead8'), 0, H + 0.1, 0, root, 0); K.ceil = ceil; K.cut.push(ceil);
  const WB = K.walls.back.g, WF = K.walls.front.g, WL = K.walls.left.g, WR = K.walls.right.g;
  // FRONT: big window + glass door onto the street (customers come in here). The street outside is painted, so any world can host it.
  const street = (w, h, seed) => CTX(w, h, c => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#9fd8f2'); g.addColorStop(0.62, '#dff3fb'); g.addColorStop(0.63, '#cdbfa8'); g.addColorStop(1, '#b6a68c'); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const cols = ['#f4c48a', '#f2a6a0', '#b9d9a8', '#f6e3a2', '#c9b8e8', '#9fd1c9'], bw = w / 5; for (let i = -1; i < 6; i++) { const x = i * bw + ((seed * 37) % bw), top = h * (0.14 + ((i * 7 + seed) % 5) * 0.04); c.fillStyle = cols[(i + seed + 6) % cols.length]; c.fillRect(x, top, bw - 6, h * 0.63 - top);
      c.fillStyle = 'rgba(255,255,255,0.75)'; for (let wy = top + 14; wy < h * 0.5; wy += 34) for (let wx = x + 10; wx < x + bw - 26; wx += 30) c.fillRect(wx, wy, 16, 20);
      for (let s = 0; s < 6; s++) { c.fillStyle = s % 2 ? '#fbf3e6' : ['#d8405a', '#5cc6b0', '#e6b45a'][(i + 7) % 3]; c.beginPath(); c.moveTo(x + s * (bw - 6) / 6, h * 0.5); c.lineTo(x + (s + 1) * (bw - 6) / 6, h * 0.5); c.lineTo(x + (s + 0.5) * (bw - 6) / 6, h * 0.56); c.fill(); } }
    c.fillStyle = '#5aa83a'; for (let i = 0; i < 3; i++) { const tx = (i * 0.37 + seed * 0.2) % 1 * w; c.fillStyle = '#7a5236'; c.fillRect(tx - 4, h * 0.42, 8, h * 0.22); c.fillStyle = i % 2 ? '#86d44e' : '#5aa83a'; c.beginPath(); c.arc(tx, h * 0.38, 34, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.beginPath(); c.moveTo(w * 0.1, 0); c.lineTo(w * 0.32, 0); c.lineTo(w * 0.12, h); c.lineTo(-w * 0.1, h); c.fill(); });
  { const win = new T3.Mesh(new T3.PlaneGeometry(5.6, 2.1), new T3.MeshBasicMaterial({ map: street(1024, 384, 1) })); win.position.set(-2.2, 1.85, D / 2 - 0.02); win.rotation.y = Math.PI; WF.add(win);
    for (const x of [-5.0, -2.2, 0.6]) M(new T3.BoxGeometry(0.12, 2.2, 0.12), mintD, x, 1.85, D / 2 - 0.06, WF, 0.01); for (const y of [0.8, 2.9]) M(new T3.BoxGeometry(5.7, 0.12, 0.14), mintD, -2.2, y, D / 2 - 0.06, WF, 0.01);
    const decal = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); c.font = 'italic 900 78px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 10; c.strokeStyle = '#fbf3e6'; c.strokeText('GELATO', 256, 66); c.fillStyle = '#d8405a'; c.fillText('GELATO', 256, 66); });
    const dm = new T3.Mesh(new T3.PlaneGeometry(2.6, 0.65), new T3.MeshBasicMaterial({ map: decal, transparent: true, depthWrite: false })); dm.position.set(-2.2, 2.3, D / 2 - 0.05); dm.rotation.y = Math.PI; WF.add(dm);
    const door = new T3.Mesh(new T3.PlaneGeometry(1.6, 2.6), new T3.MeshBasicMaterial({ map: street(256, 416, 3) })); door.position.set(4, 1.3, D / 2 - 0.02); door.rotation.y = Math.PI; WF.add(door); M(new T3.BoxGeometry(1.8, 0.14, 0.14), mintD, 4, 2.64, D / 2 - 0.06, WF, 0.01); for (const x of [3.12, 4.88]) M(new T3.BoxGeometry(0.1, 2.64, 0.12), mintD, x, 1.32, D / 2 - 0.06, WF, 0.01);
    M(new T3.BoxGeometry(0.06, 0.5, 0.06), chrome, 3.4, 1.15, D / 2 - 0.16, WF, 0.006); K.door = { x: 4, z: D / 2 - 0.6 }; }
  // BACK WALL: striped scalloped awning, menu board, back counter with the waffle iron, cone tower and topping jars
  { const awT = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#fbf3e6' : '#f4a6b8'; c.fillRect(i * 32, 0, 32, 92); c.beginPath(); c.arc(i * 32 + 16, 92, 16, 0, Math.PI); c.fill(); } c.fillStyle = '#d8405a'; c.fillRect(0, 0, 512, 10); });
    const aw = new T3.Mesh(new T3.PlaneGeometry(W - 0.4, 0.9), new T3.MeshToonMaterial({ map: awT, transparent: true, gradientMap: grad, side: T3.DoubleSide })); aw.position.set(0, 3.55, -D / 2 + 0.32); aw.rotation.x = 0.5; WB.add(aw);
    const menuT = CTX(1024, 440, c => { c.fillStyle = '#2b2420'; c.fillRect(0, 0, 1024, 440); c.strokeStyle = '#e6b45a'; c.lineWidth = 8; c.strokeRect(10, 10, 1004, 420); c.fillStyle = '#ffd23a'; c.font = 'italic 900 70px Archivo, Arial'; c.fillText('FOX GELATO', 40, 88); c.font = '700 34px Archivo, Arial';
      FLAV_KEYS.forEach((k, i) => { const x = 44 + (i % 2) * 490, y = 150 + Math.floor(i / 2) * 58; c.fillStyle = FLAVOURS[k].col; c.beginPath(); c.arc(x + 14, y - 12, 15, 0, 7); c.fill(); c.fillStyle = '#f6f1e8'; c.fillText(FLAVOURS[k].name, x + 42, y); });
      c.fillStyle = '#f7c9d4'; c.font = '700 30px Archivo, Arial'; c.fillText('CONE OR CUP 2g · EACH SCOOP 3g · TOPPINGS 1g', 44, 404); });
    const mb = new T3.Mesh(new T3.PlaneGeometry(3.7, 1.6), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(0, 2.45, -D / 2 + 0.06); WB.add(mb); M(new T3.BoxGeometry(3.86, 1.76, 0.06), wood, 0, 2.45, -D / 2 + 0.02, WB, 0.01);
    M(new T3.BoxGeometry(W - 0.6, 0.95, 0.8), cream, 0, 0.475, -D / 2 + 0.55, WB, 0.03); M(new T3.BoxGeometry(W - 0.5, 0.06, 0.86), mintD, 0, 0.98, -D / 2 + 0.55, WB, 0.012); K.colliders.push([-W / 2 + 0.3, -D / 2, W / 2 - 0.3, -D / 2 + 0.98]);
    // waffle iron + cone tower + jars
    M(new T3.BoxGeometry(0.5, 0.12, 0.42), ink, -3.6, 1.07, -D / 2 + 0.55, WB, 0.01); M(new T3.CylinderGeometry(0.2, 0.2, 0.05, 18), toon('#3a3836'), -3.6, 1.16, -D / 2 + 0.55, WB, 0.006, 0.2);
    for (let i = 0; i < 5; i++) { const c = coneMesh(T3, toon, CTX, grad, ctx.addOutline); c.position.set(-2.6, 1.0 + i * 0.05, -D / 2 + 0.55); c.scale.setScalar(1.1); WB.add(c); }
    SPRINKLE_COLS.slice(0, 4).forEach((col, i) => { M(new T3.CylinderGeometry(0.11, 0.11, 0.3, 14), toon('#e8f6fb', { transparent: true, opacity: 0.55 }), 2.4 + i * 0.32, 1.16, -D / 2 + 0.55, WB, 0.008, 0.11); M(new T3.CylinderGeometry(0.1, 0.1, 0.2, 14), toon(col), 2.4 + i * 0.32, 1.12, -D / 2 + 0.55, WB, 0); M(new T3.CylinderGeometry(0.115, 0.115, 0.04, 14), mintD, 2.4 + i * 0.32, 1.33, -D / 2 + 0.55, WB, 0); });
    M(new T3.BoxGeometry(0.34, 0.5, 0.34), toon('#f4a6b8'), 4.6, 1.25, -D / 2 + 0.55, WB, 0.01); M(new T3.CylinderGeometry(0.12, 0.09, 0.32, 14), toon('#e8f6fb', { transparent: true, opacity: 0.6 }), 4.6, 1.66, -D / 2 + 0.55, WB, 0.008); }
  // LEFT WALL: neon GELATO sign + a mirror ; RIGHT WALL: pint freezer + radio
  { const neonT = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); c.font = 'italic 900 84px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff6aa8'; c.shadowBlur = 26; c.strokeStyle = '#ff7ab6'; c.lineWidth = 8; c.strokeText('gelato', 256, 66); c.fillStyle = '#fff'; c.fillText('gelato', 256, 66); });
    const n = new T3.Mesh(new T3.PlaneGeometry(3.0, 0.75), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); n.position.set(-W / 2 + 0.04, 2.95, 1.6); n.rotation.y = Math.PI / 2; WL.add(n);
    M(new T3.BoxGeometry(1.7, 0.85, 0.75), toon('#e9fbf5'), W / 2 - 0.5, 0.425, -1.4, WR, 0.02); M(new T3.BoxGeometry(1.72, 0.06, 0.77), mintD, W / 2 - 0.5, 0.87, -1.4, WR, 0.01); K.colliders.push([W / 2 - 1.0, -1.85, W / 2, -0.95]);
    const pintT = CTX(128, 128, c => { c.fillStyle = '#fbf3e6'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#d8405a'; c.fillRect(0, 44, 128, 40); c.fillStyle = '#fff'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.fillText('PINTS', 64, 74); });
    { const s = new T3.Mesh(new T3.PlaneGeometry(0.5, 0.5), new T3.MeshBasicMaterial({ map: pintT })); s.position.set(W / 2 - 1.36, 0.45, -1.4); s.rotation.y = -Math.PI / 2; WR.add(s); }
    const rad = new T3.Group(); rad.position.set(W / 2 - 0.3, 0, 1.6); rad.rotation.y = -Math.PI / 2; WR.add(rad); M(new T3.BoxGeometry(0.9, 1.3, 0.45), toon('#f4a6b8'), 0, 0.65, 0, rad, 0.02); M(new T3.CylinderGeometry(0.45, 0.45, 0.45, 18, 1, false, 0, Math.PI), toon('#ffd23a'), 0, 1.3, 0, rad, 0.02).rotation.set(Math.PI / 2, 0, Math.PI / 2); M(new T3.CylinderGeometry(0.22, 0.22, 0.04, 18), toon('#3a3836'), 0, 0.85, 0.24, rad, 0.006).rotation.x = Math.PI / 2; K.colliders.push([W / 2 - 0.55, 1.1, W / 2, 2.1]); K.radio = { x: W / 2 - 0.6, z: 1.6 }; }
  // WORK COUNTER (behind the case): cone holder, cone + cup stacks, sauce bottles, sprinkle shaker, wafer jar, bin
  M(new T3.BoxGeometry(4.2, 0.95, 0.75), cream, 0.15, 0.475, KZ, root, 0.03); M(new T3.BoxGeometry(4.3, 0.06, 0.82), chrome, 0.15, 0.98, KZ, root, 0.015); M(new T3.BoxGeometry(4.3, 0.12, 0.05), mintD, 0.15, 0.8, KZ + 0.39, root, 0); K.colliders.push([-2.0, KZ - 0.4, 2.3, KZ + 0.4]);
  K.holder = { x: 0, z: KZ + 0.2 }; M(new T3.CylinderGeometry(0.11, 0.13, 0.03, 20), chrome, K.holder.x, TOP + 0.015, K.holder.z, root, 0.006, 0.13); K.holderRing = new T3.Group(); root.add(K.holderRing); for (let i = 0; i < 3; i++) { const a = i * 2.09; M(new T3.CylinderGeometry(0.006, 0.006, 0.13, 6), chrome, K.holder.x + Math.cos(a) * 0.05, TOP + 0.08, K.holder.z + Math.sin(a) * 0.05, K.holderRing, 0); } { const ring = M(new T3.TorusGeometry(0.052, 0.008, 6, 20), chrome, K.holder.x, TOP + 0.14, K.holder.z, K.holderRing, 0); ring.rotation.x = Math.PI / 2; }
  K.cones = { x: 0.42, z: KZ + 0.02 }; for (let i = 0; i < 6; i++) { const c = coneMesh(T3, toon, CTX, grad, ctx.addOutline); c.position.set(K.cones.x, TOP + 0.005 + i * 0.03, K.cones.z); root.add(c); }
  K.cups = { x: 0.76, z: KZ + 0.02 }; K.cupPile = []; for (let i = 0; i < 6; i++) { const c = cupMesh(T3, toon, CTX, grad, ctx.addOutline); c.children[2].visible = false; c.position.set(K.cups.x, TOP + i * 0.022, K.cups.z); root.add(c); K.cupPile.push(c); }
  K.bin = { x: 1.14, z: KZ + 0.05 }; M(new T3.CylinderGeometry(0.15, 0.12, 0.26, 16), mintD, K.bin.x, TOP + 0.13, K.bin.z, root, 0.01, 0.15); M(new T3.CylinderGeometry(0.16, 0.16, 0.03, 16), chrome, K.bin.x, TOP + 0.27, K.bin.z, root, 0.006, 0.16);
  K.bottles = Object.keys(SAUCES).map((k, i) => { const x = -0.38 - i * 0.22, z = KZ - 0.06, g = new T3.Group(); g.position.set(x, TOP, z); root.add(g); M(new T3.CylinderGeometry(0.05, 0.055, 0.2, 14), toon(SAUCES[k].col), 0, 0.1, 0, g, 0.008, 0.055); M(new T3.CylinderGeometry(0.052, 0.052, 0.04, 14), cream, 0, 0.14, 0, g, 0); M(new T3.ConeGeometry(0.035, 0.07, 12), toon(SAUCES[k].col), 0, 0.235, 0, g, 0.006); M(new T3.CylinderGeometry(0.006, 0.006, 0.04, 6), toon(SAUCES[k].col), 0, 0.285, 0, g, 0); return { k, x, z, g, home: g.position.clone() }; });
  K.shaker = (() => { const x = -1.1, z = KZ - 0.05, g = new T3.Group(); g.position.set(x, TOP, z); root.add(g); M(new T3.CylinderGeometry(0.06, 0.06, 0.18, 16), toon('#e8f6fb', { transparent: true, opacity: 0.6 }), 0, 0.09, 0, g, 0.008, 0.06); for (let i = 0; i < 14; i++) M(new T3.BoxGeometry(0.016, 0.006, 0.006), toon(SPRINKLE_COLS[i % SPRINKLE_COLS.length]), rr(-0.035, 0.035), 0.02 + (i % 7) * 0.016, rr(-0.035, 0.035), g, 0).rotation.y = i; M(new T3.CylinderGeometry(0.064, 0.064, 0.05, 16), toon('#f4a6b8'), 0, 0.2, 0, g, 0.006); return { x, z, g, home: g.position.clone() }; })();
  K.wafers = { x: -1.36, z: KZ - 0.02 }; M(new T3.CylinderGeometry(0.07, 0.07, 0.14, 14), toon('#e8f6fb', { transparent: true, opacity: 0.55 }), K.wafers.x, TOP + 0.07, K.wafers.z, root, 0.008, 0.07); for (let i = 0; i < 5; i++) { const w = waferMesh(T3, toon); w.position.set(K.wafers.x + Math.cos(i * 1.3) * 0.03, TOP + 0.01, K.wafers.z + Math.sin(i * 1.3) * 0.03); w.rotation.z = (i - 2) * 0.12; root.add(w); }
  // THE CASE (vetrina): 8 tubs in two rows, a sloped glass front, scalloped pink front panel; counters left + right; register on the right
  { const frontT = CTX(512, 128, c => { c.fillStyle = '#f4a6b8'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#fbf3e6'; for (let i = 0; i < 16; i++) { c.beginPath(); c.arc(i * 32 + 16, 0, 15, 0, Math.PI); c.fill(); } c.fillStyle = '#d8405a'; c.fillRect(0, 112, 512, 16); c.fillStyle = '#fbf3e6'; c.font = 'italic 900 46px Archivo, Arial'; c.textAlign = 'center'; c.fillText('fresh every morning', 256, 84); });
    M(new T3.BoxGeometry(3.4, 0.92, 0.95), cream, 0, 0.46, CZ, root, 0.03); const fp = new T3.Mesh(new T3.PlaneGeometry(3.36, 0.84), new T3.MeshToonMaterial({ map: frontT, gradientMap: grad })); fp.position.set(0, 0.46, CZ + 0.48); root.add(fp);
    M(new T3.BoxGeometry(3.44, 0.06, 1.0), chrome, 0, 0.95, CZ, root, 0.012); M(new T3.BoxGeometry(3.3, 0.02, 0.86), toon('#cfe9f2'), 0, 0.93, CZ, root, 0);
    const glass = new T3.Mesh(new T3.PlaneGeometry(3.4, 0.62), new T3.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.22, depthWrite: false, side: T3.DoubleSide })); glass.position.set(0, 1.21, CZ + 0.43); glass.rotation.x = -0.22; root.add(glass); K.glass = glass;
    M(new T3.BoxGeometry(3.44, 0.04, 0.1), chrome, 0, 1.43, CZ + 0.38, root, 0.01); for (const x of [-1.7, 1.7]) M(new T3.BoxGeometry(0.04, 0.46, 0.12), chrome, x, 1.2, CZ + 0.42, root, 0.006);
    { const strip = M(new T3.BoxGeometry(3.3, 0.025, 0.05), toon('#e8fbff', { emissive: new T3.Color('#bfefff'), emissiveIntensity: 0.9 }), 0, 1.405, CZ + 0.38, root, 0); strip.castShadow = false; K.caseStrip = strip; }
    const slots = [-1.2, -0.4, 0.4, 1.2];
    FLAV_KEYS.forEach((k, i) => { const x = slots[i % 4], z = CZ + (i < 4 ? -0.2 : 0.2), F = FLAVOURS[k]; M(new T3.BoxGeometry(0.72, 0.1, 0.36), chrome, x, TOP - 0.06, z, root, 0.006);
      const surf = M(new T3.BoxGeometry(0.66, 0.04, 0.31), toon(F.col), x, TOP - 0.02, z, root, 0); const mg = new T3.Group(); root.add(mg); const mound = new T3.Mesh(moundGeo(T3, i), toon(F.col)); mound.scale.set(0.3, 0.085, 0.14); mound.position.set(x - 0.03, TOP - 0.012, z); mg.add(mound); if (ctx.addOutline) ctx.addOutline(mound, 0.006);
      if (F.bits) for (let j = 0; j < 7; j++) { const a = j * 2.4 + i, rr2 = 0.05 + (j % 3) * 0.05; const b = new T3.Mesh(new T3.BoxGeometry(0.014, 0.008, 0.014), toon(F.bits)); b.position.set(x - 0.03 + Math.cos(a) * rr2 * 1.8, TOP + 0.045 - rr2 * 0.25, z + Math.sin(a) * rr2 * 0.8); b.rotation.set(a, a, 0); mg.add(b); }
      const lab = CTX(256, 48, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 48); c.fillStyle = F.col; c.fillRect(0, 0, 14, 48); c.fillStyle = '#fff'; c.font = '900 28px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText(F.name, 24, 26); });
      const lm = new T3.Mesh(new T3.PlaneGeometry(0.44, 0.083), new T3.MeshBasicMaterial({ map: lab })); lm.position.set(x, TOP + 0.005, z - 0.205); lm.rotation.set(-Math.PI / 2 + 0.95, Math.PI, 0); lm.rotation.order = 'YXZ'; lm.rotation.set(-0.62, Math.PI, 0); root.add(lm);
      const flag = CTX(128, 64, c => { c.fillStyle = '#fbf3e6'; c.fillRect(0, 0, 128, 64); c.fillStyle = F.dark; c.fillRect(0, 50, 128, 14); c.fillStyle = '#201e1d'; c.font = '900 20px Archivo, Arial'; c.textAlign = 'center'; c.fillText(F.name.split(' ')[0], 64, 34); });
      const fm = new T3.Mesh(new T3.PlaneGeometry(0.22, 0.11), new T3.MeshBasicMaterial({ map: flag })); fm.position.set(x + 0.2, TOP + 0.14, z + 0.06); root.add(fm); M(new T3.CylinderGeometry(0.003, 0.003, 0.16, 4), chrome, x + 0.2, TOP + 0.07, z + 0.06, root, 0);
      const lid = M(new T3.BoxGeometry(0.72, 0.03, 0.36), toon('#cfd6dc'), x, TOP + 0.01, z, root, 0.006); const soon = CTX(128, 48, c => { c.fillStyle = '#cfd6dc'; c.fillRect(0, 0, 128, 48); c.fillStyle = '#5b5753'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('DAY ' + F.day, 64, 25); }); const sm = new T3.Mesh(new T3.PlaneGeometry(0.3, 0.11), new T3.MeshBasicMaterial({ map: soon })); sm.rotation.set(-Math.PI / 2, 0, Math.PI); sm.position.y = 0.016; lid.add(sm);
      K.tubs.push({ k, x, z, w: 0.66, d: 0.31, lid, surf, mound: mg }); });
    M(new T3.BoxGeometry(1.6, 1.05, 0.95), cream, -2.5, 0.525, CZ, root, 0.03); M(new T3.BoxGeometry(1.66, 0.06, 1.0), mintD, -2.5, 1.08, CZ, root, 0.012);
    M(new T3.BoxGeometry(1.6, 1.05, 0.95), cream, 2.5, 0.525, CZ, root, 0.03); M(new T3.BoxGeometry(1.66, 0.06, 1.0), mintD, 2.5, 1.08, CZ, root, 0.012);
    for (const x of [-2.5, 2.5]) { const p = new T3.Mesh(new T3.PlaneGeometry(1.56, 0.9), new T3.MeshToonMaterial({ map: frontT, gradientMap: grad })); p.position.set(x, 0.5, CZ + 0.481); root.add(p); }
    K.colliders.push([-3.3, CZ - 0.5, 3.3, CZ + 0.5]);
    K.register = { x: 2.55, z: CZ }; M(new T3.BoxGeometry(0.42, 0.3, 0.34), ink, K.register.x, 1.11 + 0.15, K.register.z - 0.05, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), toon('#22c55e'), K.register.x, 1.11 + 0.34, K.register.z - 0.22, root, 0);
    // a napkin box + spoon jar on the left counter
    M(new T3.BoxGeometry(0.22, 0.12, 0.16), toon('#fbfbf7'), -2.2, 1.17, CZ, root, 0.006); M(new T3.CylinderGeometry(0.06, 0.06, 0.14, 12), toon('#e8f6fb', { transparent: true, opacity: 0.6 }), -2.75, 1.18, CZ, root, 0.006); for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.01, 0.16, 0.004), toon(SPRINKLE_COLS[i]), -2.75 + (i - 2) * 0.012, 1.24, CZ, root, 0).rotation.z = (i - 2) * 0.1; }
  K.spots = [-1.2, 0, 1.2].map(x => ({ x, z: CZ + 1.3 }));
  K.workSpot = { x: 0, z: KZ - 0.7 }; K.keeper = { x: 0.6, z: CZ - 0.87 };
  // pendant globe lamps over the case
  for (const x of [-1.2, 0, 1.2]) { K.cut.push(M(new T3.CylinderGeometry(0.008, 0.008, 1.2, 4), ink, x, H - 0.6, CZ - 0.1, root, 0)); const gl = M(new T3.SphereGeometry(0.2, 16, 12), toon('#fff4d8'), x, H - 1.3, CZ - 0.1, root, 0.01, 0.2); K.lamps.push(gl); K.cut.push(gl); }
  // DINING ROOM: café tables with wire chairs, a window bench, plants, the giant cone
  K.tables = [[-4.1, 3.5], [-1.7, 3.6], [-4.4, 1.2]].map(([x, z]) => { const g = new T3.Group(); g.position.set(x, 0, z); root.add(g); M(new T3.CylinderGeometry(0.42, 0.42, 0.04, 22), cream, 0, 0.76, 0, g, 0.01, 0.42); M(new T3.CylinderGeometry(0.035, 0.035, 0.74, 8), chrome, 0, 0.38, 0, g, 0); M(new T3.CylinderGeometry(0.22, 0.25, 0.03, 16), chrome, 0, 0.015, 0, g, 0);
    for (const a of [0.3, 0.3 + Math.PI]) { const c = new T3.Group(); c.position.set(Math.cos(a) * 0.72, 0, Math.sin(a) * 0.72); c.rotation.y = -a + Math.PI / 2; g.add(c); M(new T3.CylinderGeometry(0.2, 0.2, 0.04, 16), pink, 0, 0.46, 0, c, 0.008, 0.2); for (const [dx, dz] of [[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]]) M(new T3.CylinderGeometry(0.01, 0.01, 0.46, 5), chrome, dx, 0.23, dz, c, 0); const back = M(new T3.TorusGeometry(0.17, 0.012, 5, 16, Math.PI), chrome, 0, 0.62, -0.18, c, 0); back.scale.y = 1.1; }
    K.circles.push([x, z, 0.55]); return { x, z, g }; });
  { const g = new T3.Group(); g.position.set(-5.15, 0, 4.25); root.add(g); const c = coneMesh(T3, toon, CTX, grad, ctx.addOutline); c.scale.setScalar(8.5); c.rotation.x = Math.PI; c.position.y = 1.8; g.add(c); // giant 3-scoop cone (cone points down into a pot)
    M(new T3.CylinderGeometry(0.45, 0.35, 0.3, 18), mintD, 0, 0.15, 0, g, 0.02, 0.45); const cn = new T3.Mesh(new T3.ConeGeometry(0.52, 1.6, 22, 1, true), c.children[0].material); cn.rotation.x = Math.PI; cn.position.y = 1.1; g.add(cn); g.remove(c);
    [['strawberry', 0.55, 2.15], ['pistachio', 0.48, 2.75], ['chocolate', 0.42, 3.25]].forEach(([k, r, y], i) => { const s = makeScoop(T3, toon, k, r, ctx.addOutline, i); s.position.set((i - 1) * 0.04, y, 0); g.add(s); }); M(new T3.SphereGeometry(0.1, 12, 10), toon('#c42d3c'), 0, 3.72, 0, g, 0.01, 0.1); K.circles.push([-5.15, 4.25, 0.62]); K.deco.push(g); }
  for (const [x, z] of [[-5.5, -0.6], [-5.5, 2.4], [5.4, -3.4]]) { const g = new T3.Group(); g.position.set(x, 0, z); root.add(g); M(new T3.CylinderGeometry(0.22, 0.17, 0.4, 14), toon('#d8405a'), 0, 0.2, 0, g, 0.012, 0.22); for (let i = 0; i < 6; i++) { const l = M(new T3.SphereGeometry(0.2, 10, 8), toon(i % 2 ? '#5aa83a' : '#86d44e'), Math.cos(i) * 0.12, 0.6 + (i % 3) * 0.15, Math.sin(i) * 0.12, g, 0.01, 0.2); l.scale.set(1, 1.3, 1); } K.circles.push([x, z, 0.3]); }
  // BUNTING: pastel flags strung across the dining room
  { const flagCols = ['#f4a6b8', '#a8dccb', '#f0d878', '#c9b8e8', '#f6b04a', '#fbf3e6'], fg = new T3.BufferGeometry(); fg.setAttribute('position', new T3.Float32BufferAttribute([-0.11, 0, 0, 0.11, 0, 0, 0, -0.22, 0], 3)); fg.computeVertexNormals();
    for (const [x0, z0, x1, z1] of [[-5.9, 0.6, 5.9, 0.6], [-5.9, 3.2, 5.9, 3.2], [-3.6, -0.2, -3.6, 4.9]]) { const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / 0.36); for (let i = 0; i <= n; i++) { const k = i / n, sag = Math.sin(k * Math.PI) * 0.45, f = new T3.Mesh(fg, new T3.MeshBasicMaterial({ color: flagCols[i % flagCols.length], side: T3.DoubleSide }));
      f.position.set(x0 + (x1 - x0) * k, H - 0.35 - sag, z0 + (z1 - z0) * k); f.rotation.y = Math.atan2(x1 - x0, z1 - z0) + Math.PI / 2; root.add(f); (K.bunting = K.bunting || []).push(f); } } }
  // the flap in the counter line (left end) is open: the keeper's side is reachable on foot
  cutShadows(K.cut);
  return K; }
// a heaped tub of gelato: a dome with swirled ridges, like it was just scraped with a paddle
function moundGeo(T3, seed) { const g = new T3.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), r = Math.hypot(x, z), ridge = 1 + 0.07 * Math.sin(a * 5 + r * 9 + seed) * Math.min(1, r * 3), h = y * (1 + 0.25 * Math.sin(a * 3 + seed * 2) * r); p.setXYZ(i, x * ridge, h, z * ridge); }
  g.computeVertexNormals(); return g; }
function cutShadows(list) { list.forEach(m => m.traverse(o => o.castShadow = false)); }

// ---------------- the stand-alone game: walk around the parlour, or work a shift ----------------
export async function createGelatoShift({ container, onState = () => {}, opts = {} }) {
  const ST = createStage(container, { bg: '#f7e9de' }), { touch, CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, puff, smokeS } = ST;
  const AU = createGelatoAudio(audio), tone = (f, d, v, type) => AU.blip(f, d, v, type), sfx = (n, o) => AU.sfx(n, o);
  const K = buildParlour({ THREE, M, toon, canvasTex, scene, grad, addOutline }), TOP = K.top;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe2b0, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending })); s.position.copy(l.position); s.scale.setScalar(1.3); scene.add(s); return s; });
  const CUST = (opts.customers && opts.customers.length ? opts.customers : REGULARS), KP = { ...KEEPER, ...(opts.keeper || {}) };
  const vib = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const mkFox = (c, extra = {}) => hideGear(kit.makeFox({ ...CAST.player, look: foxLookOf(c), torso: c.torso, outfit: 'vest', crest: '', gear: 'none', mood: 'happy', ...extra }));

  // ---------- the uniform print: a three-scoop cone under a GELATO banner ----------
  const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#e0a85a'; g.beginPath(); g.moveTo(92, 150); g.lineTo(164, 150); g.lineTo(128, 238); g.closePath(); g.fill(); st(); g.strokeStyle = '#b07a36'; g.lineWidth = 4; for (const d of [0, 18, 36]) { g.beginPath(); g.moveTo(100 + d, 150); g.lineTo(140 + d * 0.2, 214); g.stroke(); }
    [['#f0a0b0', 96, 140, 34], ['#b9cf8a', 158, 140, 34], ['#8a6448', 127, 92, 38]].forEach(([c, x, y, r]) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); st(); g.fillStyle = 'rgba(255,255,255,0.55)'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, 7); g.fill(); });
    g.fillStyle = '#c42d3c'; g.beginPath(); g.arc(127, 50, 11, 0, 7); g.fill(); st();
    g.save(); g.translate(128, 176); g.rotate(-0.08); g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-118, -22); g.lineTo(122, -28); g.lineTo(112, 28); g.lineTo(-126, 24); g.closePath(); g.fill(); g.fillStyle = '#d8405a'; g.beginPath(); g.moveTo(-110, -16); g.lineTo(114, -22); g.lineTo(106, 21); g.lineTo(-117, 18); g.closePath(); g.fill();
    g.font = 'italic 900 52px Archivo, "Arial Black", Arial, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('GELATO', 3, 4); g.fillStyle = '#fbf3e6'; g.fillText('GELATO', 0, 0); g.restore(); });
  const uniformOn = (f, on) => { if (!f.userData.uni) f.userData.uni = dinerUniform(ST, f, { print, stripe: '#5cc6b0', towelCol: '#f4a6b8', printY: 1.17 }).parts; f.userData.uni.forEach(p => p.visible = on); };

  // ---------- cast: Ben (walking = the real cast look; working = tee + uniform), the keeper, the regulars ----------
  const benWalk = hideGear(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' })); scene.add(benWalk); benWalk.visible = false;
  const benWork = hideGear(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#5cc6b0'], crest: '', gear: 'none', mood: 'excited' })); scene.add(benWork); uniformOn(benWork, true);
  const keeper = mkFox(KP, { outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#5cc6b0'] }); uniformOn(keeper, true); scene.add(keeper); keeper.position.set(K.keeper.x, 0, K.keeper.z); keeper.rotation.y = 0;
  const custFox = CUST.map(c => { const f = mkFox(c); f.visible = false; scene.add(f); return f; });
  // name tags over customers in the queue, so 'drag it to MOCHI' always points somewhere (they go red when patience runs low)
  const nameTags = CUST.map(c => { const t = canvasTex(256, 64, g => { g.fillStyle = '#000'; g.fillRect(0, 0, 256, 64); g.strokeStyle = '#ffd23a'; g.lineWidth = 6; g.strokeRect(3, 3, 250, 58); g.fillStyle = '#fff'; g.font = '900 34px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(c.name, 128, 35); }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); s.scale.set(0.56, 0.14, 1); s.renderOrder = 22; s.visible = false; scene.add(s); return s; });
  // two regulars relax at the tables while you walk around (separate foxes from the queue)
  const handCone = (key, k2) => { const g = new THREE.Group(), c = coneMesh(THREE, toon, canvasTex, grad, addOutline); c.scale.setScalar(0.8); g.add(c); const s = makeScoop(THREE, toon, key, 0.07, addOutline, 1); s.position.y = 0.2; g.add(s); if (k2) { const s2 = makeScoop(THREE, toon, k2, 0.062, addOutline, 2); s2.position.y = 0.29; g.add(s2); } return g; };
  const idlers = [[1, 0, 'pistachio', 'pistachio'], [3, 2, 'strawberry', 'chocolate']].filter(([ci]) => CUST[ci]).map(([ci, ti, k1, k2]) => { const T = K.tables[ti], f = mkFox(CUST[ci]); const a = 0.3 + Math.PI / 2 + (ti ? Math.PI : 0); f.position.set(T.x + 0.8 * Math.cos(a), 0, T.z + 0.8 * Math.sin(a)); f.rotation.y = Math.atan2(T.x - f.position.x, T.z - f.position.z); scene.add(f); const cone = handCone(k1, k2); cone.position.set(-0.36, 1.05, 0.3); f.userData.P.body.add(cone); f.userData.hold = { right: true }; return { f, ci, name: CUST[ci].name, cone, t: rr(0, 3), flav: [k1, k2] }; });

  // soft contact shadows under every fox (phones run without real shadows) + a confetti burst for big moments
  const blobTex = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(40,24,30,0.42)'); g.addColorStop(1, 'rgba(40,24,30,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }), blobGeo = new THREE.PlaneGeometry(0.95, 0.95).rotateX(-Math.PI / 2);
  const castFoxes = () => [benWalk, benWork, keeper, ...custFox, ...idlers.map(d => d.f)];
  castFoxes().forEach(f => { const m = new THREE.Mesh(blobGeo, blobMat); m.renderOrder = 1; scene.add(m); f.userData.blob = m; });
  const confetti = [], CONF_COLS = [0xf4a6b8, 0xa8dccb, 0xf0d878, 0xc9b8e8, 0xf6b04a, 0xec3013, 0x38bdf8], confGeo = new THREE.PlaneGeometry(0.035, 0.05);
  for (let i = 0; i < 90; i++) { const m = new THREE.Mesh(confGeo, new THREE.MeshBasicMaterial({ color: CONF_COLS[i % CONF_COLS.length], side: THREE.DoubleSide, transparent: true })); m.visible = false; scene.add(m); confetti.push({ m, v: V3(), s: V3(), life: 0 }); } let confI = 0;
  function burstConfetti(p, n = 40) { for (let i = 0; i < n; i++) { const c = confetti[confI = (confI + 1) % confetti.length]; c.m.visible = true; c.m.position.copy(p).add(V3(rr(-0.2, 0.2), rr(0, 0.2), rr(-0.2, 0.2))); c.v.set(rr(-1.2, 1.2), rr(1.2, 2.8), rr(-1.2, 1.2)); c.s.set(rr(-9, 9), rr(-9, 9), rr(-9, 9)); c.life = rr(1.8, 2.6); c.m.material.opacity = 1; } }
  function stepFx(dt) { for (const f of castFoxes()) { const b = f.userData.blob; b.visible = f.visible; if (f.visible) b.position.set(f.position.x, 0.012, f.position.z); }
    for (const c of confetti) { if (c.life <= 0) continue; c.life -= dt; c.v.y -= 3.2 * dt; c.v.multiplyScalar(1 - dt * 1.2); c.m.position.addScaledVector(c.v, dt); c.m.rotation.x += c.s.x * dt; c.m.rotation.y += c.s.y * dt; if (c.m.position.y < 0.02) { c.m.position.y = 0.02; c.v.set(0, 0, 0); } c.m.material.opacity = Math.min(1, c.life * 2); if (c.life <= 0) c.m.visible = false; } }

  // ---------- cameras ----------
  const { SAFE, fitShot, shotFor } = cameraFit(ST);
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 };
  const wideShot = () => { const port = CW() < CHh(), bx = benWork.position.x, bz = benWork.position.z, box = [V3(bx - 0.5, 0.05, bz), V3(bx + 0.5, 0.05, bz), V3(bx - 0.5, 2.3, bz), V3(bx + 0.5, 2.3, bz)];
    return port ? shotFor('wideP', () => [...box, V3(bx, 2.6, bz)], 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL', () => [...box, V3(bx, 2.6, bz)], 0.12, Math.PI - 0.3, 0.05); };
  const P = (x, z, y = TOP) => V3(x, y, z), H0 = K.holder;
  function shotPoints(id) { const out = [], T2 = TOP;
    if (id === 'case') { for (const t of K.tubs) out.push(P(t.x - 0.33, t.z - 0.15), P(t.x + 0.33, t.z + 0.15)); out.push(P(H0.x - 0.1, H0.z), P(H0.x + 0.1, H0.z, TOP + 0.3)); }
    else if (id === 'cone') { out.push(P(H0.x - 0.24, H0.z), P(H0.x + 0.24, H0.z), P(H0.x - 0.2, H0.z, TOP + 0.82), P(H0.x + 0.2, H0.z, TOP + 0.82), P(K.cones.x - 0.06, K.cones.z), P(K.cups.x - 0.08, K.cups.z), P(K.bin.x - 0.12, K.bin.z, TOP + 0.2)); }
    else if (id === 'tops') { out.push(P(H0.x - 0.22, H0.z), P(H0.x + 0.22, H0.z), P(H0.x - 0.18, H0.z, TOP + 0.72), P(H0.x + 0.18, H0.z, TOP + 0.72), ...K.bottles.flatMap(b => [P(b.x, b.z, TOP + 0.3), P(b.x, b.z + 0.06)]), P(K.shaker.x, K.shaker.z, TOP + 0.25), P(K.shaker.x, K.shaker.z + 0.06), P(K.wafers.x - 0.08, K.wafers.z, TOP + 0.18), P(K.wafers.x - 0.08, K.wafers.z + 0.07)); }
    else if (id === 'serve') { out.push(P(H0.x - 0.3, H0.z), P(H0.x + 0.3, H0.z, TOP + 0.6), ...K.spots.flatMap(s => [P(s.x - 0.42, s.z, 2.1), P(s.x + 0.42, s.z, 2.1), P(s.x, s.z, 1.0)])); }
    else { out.push(P(K.bin.x - 0.15, K.z), P(K.wafers.x + 0.1, K.z), P(-1.62, K.caseZ - 0.35), P(1.62, K.caseZ - 0.35), P(-1.62, K.caseZ + 0.3), P(1.62, K.caseZ + 0.3), ...K.spots.map(s => P(s.x, s.z, 1.55))); }
    return out; }
  const EL = { all: [1.0, 0.9], case: [1.2, 1.05], cone: [0.5, 0.42], tops: [0.72, 0.68], serve: [0.62, 0.55] };
  function workShot(id = S.focus || 'all') { const port = CW() < CHh(), e = EL[id] || EL.all; return shotFor('w:' + id, () => shotPoints(id), port ? e[0] : e[1], 0, id === 'all' ? 0.03 : 0.05); }
  function setFocus(id) { if (!EL[id] || S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }
  function glideTo(shot, dur = 1.4) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }

  // ---------- state ----------
  const S = { phase: 'intro', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, payOut: null, next: 3, done: null, combo: 0, react: null };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const orders = []; let idSeq = 1;
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const flavAvail = () => FLAV_KEYS.filter(k => FLAVOURS[k].day <= S.day), sauceAvail = () => Object.keys(SAUCES).filter(k => SAUCES[k].day <= S.day), vesAvail = () => Object.keys(VESSELS).filter(k => VESSELS[k].day <= S.day);
  const refreshLids = () => K.tubs.forEach(t => { const on = FLAVOURS[t.k].day <= S.day; t.lid.visible = !on; t.mound.visible = on; });
  refreshLids();

  // ---------- THE BUILD: a cone or cup in the holder, the scoops on it, sauce, sprinkles, wafer ----------
  const buildG = new THREE.Group(); buildG.position.set(H0.x, TOP + 0.02, H0.z); scene.add(buildG); const BUILD_HOME = buildG.position.clone();
  const B = { vessel: null, vMesh: null, rimY: 0, rimR: 0, scoops: [], sauce: null, sauceMix: false, cells: new Set(), blobs: 0, spr: 0, wafer: null, topples: 0 };
  let held = null, carve = null, tool = null; const falling = [], debris = [], loose = [];
  const L_LEAN = () => 0.062 * (upg('holder') ? 1.4 : 1), R_TARGET = 0.085, R_MAX = 0.135, R_BAND = () => 0.011 * (upg('scooper') ? 1.5 : 1);
  // the scooper: a chrome bowl whose mouth faces the worker (the ball curls into it), handle up and back toward you
  const scooper = (() => { const g = new THREE.Group(); const bowl = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#d7dde3', { side: THREE.DoubleSide })); bowl.rotation.x = Math.PI / 2; addOutline(bowl, 0.08, 1); g.add(bowl);
    const h = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 4.2, 8), toon('#5cc6b0')); h.position.set(0, 2.0, -1.4); h.rotation.x = -0.6; addOutline(h, 0.06); g.add(h); g.visible = false; scene.add(g); return g; })();
  const placeScooper = (c, r) => { scooper.scale.setScalar(r * 1.12); scooper.position.set(c.x, c.y + r * 0.05, c.z + r * 0.42); scooper.rotation.set(0, 0, 0); };
  const ghost = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false })); ghost.visible = false; ghost.renderOrder = 12; scene.add(ghost);
  const ghostRing = new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 6, 36), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthTest: false })); ghostRing.visible = false; ghostRing.renderOrder = 13; scene.add(ghostRing);
  const guide = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 1, 6), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.85, depthTest: false })); guide.renderOrder = 14; guide.visible = false; scene.add(guide);
  const balLine = new THREE.Mesh(new THREE.BoxGeometry(0.008, 1, 0.008), new THREE.MeshBasicMaterial({ color: 0x22c55e, depthTest: false, transparent: true })); balLine.renderOrder = 15; balLine.visible = false; scene.add(balLine);
  const balDot = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), balLine.material); balDot.renderOrder = 15; scene.add(balDot);
  const digs = []; for (let i = 0; i < 48; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 5), toon('#ffffff')); d.scale.set(0.03, 0.006, 0.018); d.visible = false; scene.add(d); digs.push(d); } let digI = 0;
  const stackTopL = () => B.scoops.length ? B.scoops[B.scoops.length - 1].y + B.scoops[B.scoops.length - 1].r * 0.9 : B.rimY;
  const topX = () => B.scoops.length ? B.scoops[B.scoops.length - 1].x : 0;
  const comOf = list => { let s = 0, w = 0; for (const q of list) { const m = q.r * q.r * q.r; s += q.x * m; w += m; } return w ? s / w : 0; };
  function clearBuild() { while (buildG.children.length) buildG.remove(buildG.children[0]); Object.assign(B, { vessel: null, vMesh: null, rimY: 0, rimR: 0, scoops: [], sauce: null, sauceMix: false, cells: new Set(), blobs: 0, spr: 0, wafer: null }); buildG.position.copy(BUILD_HOME); buildG.rotation.set(0, 0, 0); K.holderRing.visible = true; }
  function setVessel(k) { if (B.vessel) { flash(B.vessel === k ? 'ONE ' + VESSELS[k].name + ' AT A TIME' : 'TAP THE BIN TO SWAP IT', '#ffffff', 1.2); return false; } if (!vesAvail().includes(k)) { flash('CUPS FROM DAY ' + VESSELS[k].day, '#ffffff', 1.1); return false; }
    const m = k === 'cone' ? coneMesh(THREE, toon, canvasTex, grad, addOutline) : cupMesh(THREE, toon, canvasTex, grad, addOutline); buildG.add(m); m.position.y = 0.18; m.userData.drop = 0.18; B.vessel = k; B.vMesh = m; B.rimY = m.userData.rimY; B.rimR = m.userData.rimR; K.holderRing.visible = k === 'cone'; sfx(k === 'cone' ? 'cone' : 'cup'); puff(H0.x, TOP + 0.2, H0.z, 0xfff3d0, 2); return true; }
  function binBuild(why) { if (!B.vessel && !held) { flash('NOTHING TO BIN', '#ffffff', 0.9); return; } if (held) { scene.remove(held.mesh); held = null; } const n = B.scoops.length; clearBuild(); flash(why || (n ? 'IN THE BIN · START AGAIN' : 'BINNED'), '#ec3013', 1.1); sfx('bin'); }

  // SCOOP: press inside a tub and drag. The ball grows with the distance you drag; turning sharply makes it ragged.
  function tubAt(wp) { for (const t of K.tubs) if (Math.abs(wp.x - t.x) <= t.w / 2 + 0.03 && Math.abs(wp.z - t.z) <= t.d / 2 + 0.03) return t; return null; }
  function carveStart(t, wp, sp) { if (held || carve || falling.length) return false; if (t.lid.visible) { flash(FLAVOURS[t.k].name + ' FROM DAY ' + FLAVOURS[t.k].day, '#ffffff', 1.1); return false; }
    if (!B.vessel) { flash('GRAB A CONE OR A CUP FIRST', '#ffd23a', 1.3); sfx('wrong'); return false; } if (B.scoops.length >= 4) { flash('FOUR IS THE LIMIT!', '#ffffff', 1); return false; }
    const ball = makeScoop(THREE, toon, t.k, 1, null, B.scoops.length); ball.scale.setScalar(0.02); scene.add(ball); carve = { t, key: t.k, len: 0, turn: 0, last: wp.clone(), acc: V3(), dir: null, ball, r: 0.02, step: 0, wp: wp.clone(), sp: sp ? { ...sp } : null }; scooper.visible = true; ghost.visible = ghostRing.visible = true; sfx('cone'); carveMove(wp); return true; }
  // touch: the ball grows with how far your FINGER travels on screen (so small phone tubs still work); the demo drives it in metres
  const PX_M = 0.00125;
  function carveMove(wp, sp) { const C = carve; if (!C) return; const t = C.t; if (wp) { wp.x = clamp(wp.x, t.x - t.w / 2 + 0.05, t.x + t.w / 2 - 0.05); wp.z = clamp(wp.z, t.z - t.d / 2 + 0.04, t.z + t.d / 2 - 0.04); C.wp.copy(wp); }
    let dx, dz, d; if (sp && C.sp) { dx = (sp.x - C.sp.x) * PX_M; dz = (sp.y - C.sp.y) * PX_M; d = Math.hypot(dx, dz); } else { dx = C.wp.x - C.last.x; dz = C.wp.z - C.last.z; d = Math.hypot(dx, dz); }
    if (d >= 0.012) { if (sp) C.sp = { ...sp }; const dir = Math.atan2(dz, dx); if (C.dir !== null) { let dd = dir - C.dir; while (dd > Math.PI) dd -= Math.PI * 2; while (dd < -Math.PI) dd += Math.PI * 2; C.turn += Math.abs(dd); } C.dir = dir; C.len += d; C.last.copy(C.wp); C.step += d; const wp2 = C.wp;
      C.ball.rotation.x += dz * 22; C.ball.rotation.z -= dx * 22; const dg = digs[digI = (digI + 1) % digs.length]; dg.visible = true; dg.material = toon(FLAVOURS[C.key].dark); dg.position.set(wp2.x, TOP - 0.0, wp2.z); dg.rotation.y = -C.dir; dg.userData.t = 7;
      if (C.step > 0.07) { C.step = 0; vib(5); } }
    C.r = Math.min(R_MAX, 0.022 + C.len * 0.055); placeCarve(); }
  function placeCarve() { const C = carve; if (!C) return; const r = C.r, p = C.wp; C.ball.scale.setScalar(r); C.ball.position.set(p.x, TOP + r * 0.85, p.z); placeScooper(C.ball.position, r);
    ghost.position.set(p.x, TOP + r * 0.85, p.z); ghost.scale.setScalar(R_TARGET + R_BAND() * 0.5); const st = carveZone(r); ghost.material.color.setHex(st === 'ok' ? 0x22c55e : st === 'big' ? 0xec3013 : 0xffffff); ghost.material.opacity = st === 'ok' ? 0.32 : 0.2;
    ghostRing.position.copy(ghost.position); ghostRing.scale.setScalar(R_TARGET + R_BAND() * 0.5); ghostRing.quaternion.copy(camera.quaternion); ghostRing.material.color.setHex(st === 'ok' ? 0x22c55e : st === 'big' ? 0xec3013 : 0xffd23a); }
  const carveZone = r => r < R_TARGET - R_BAND() ? 'small' : r > R_TARGET + R_BAND() ? 'big' : 'ok';
  function carveEnd() { const C = carve; if (!C) return; carve = null; scooper.visible = false; ghost.visible = ghostRing.visible = false;
    if (C.r < 0.045) { scene.remove(C.ball); flash('KEEP DRAGGING · THE BALL GROWS AS YOU GO', '#ffffff', 1.4); return; }
    const z = carveZone(C.r), size = clamp(100 - Math.max(0, Math.abs(C.r - R_TARGET) - R_BAND()) / 0.0065 * 16, 0, 100), jerk = C.turn / Math.max(1, C.len * 24), sm = clamp(100 - jerk * 30, 0, 100), q = size * 0.6 + sm * 0.4;
    scene.remove(C.ball); const mesh = makeScoop(THREE, toon, C.key, C.r, addOutline, B.scoops.length + 1); mesh.position.copy(C.ball.position); scene.add(mesh);
    held = { key: C.key, r: C.r, q, size, sm, mesh, c: topX(), t: 0, fly: 0, from: C.ball.position.clone() };
    flash(z === 'ok' ? (sm >= 60 ? 'JUST RIGHT!' : 'GOOD SIZE · A BIT RAGGED') : z === 'big' ? 'TOO BIG!' : 'A BIT SMALL', z === 'ok' ? '#22c55e' : '#ffd23a', 1.1); AU.scrape(false); sfx('pop'); sfx('fly', { delay: 0.06 }); if (z === 'ok') sfx('happy', { delay: 0.12 }); vib(z === 'ok' ? 20 : 10);
    if (S.phase === 'shift') { S.focus = 'cone'; S.userFocusT = performance.now(); } }
  // STACK: the held scoop swings over the cone; tap (or drag + let go) to drop it
  const swingA = () => Math.min(0.075, 0.026 + 0.011 * B.scoops.length + 0.003 * Math.min(6, S.day));
  const heldX = () => held ? held.c + Math.sin(held.t * (2.4 + 0.18 * B.scoops.length)) * swingA() * (held.k ?? 1) : 0;
  function landY(x, r) { if (!B.scoops.length) return B.rimY + r * 0.5; const b = B.scoops[B.scoops.length - 1]; return b.y + b.r * 0.78 + r * 0.62; }
  function predict(x, r) { const b = B.scoops[B.scoops.length - 1]; if (!b) return Math.abs(x) > B.rimR * 0.8 ? 'miss' : 'ok'; if (Math.abs(x - b.x) > b.r * 0.85) return 'slide'; const c = Math.abs(comOf([...B.scoops, { x, r }])); return c > L_LEAN() ? 'topple' : c > L_LEAN() * 0.6 ? 'lean' : 'ok'; }
  function dropHeld() { if (!held) return; if (held.fly < 1) { held.dropQ = true; S.aim = null; return; } const h = held, x = heldX(); held = null; S.aim = null; const from = h.mesh.position.clone(); falling.push({ h, x, from, t: 0 }); sfx('flip'); }
  function land(f) { const h = f.h, x = f.x, pr = predict(x, h.r), wp = buildG.localToWorld(V3(x, landY(x, h.r), 0));
    if (pr === 'miss' || pr === 'slide') { flash(pr === 'miss' ? 'MISSED THE ' + (B.vessel === 'cup' ? 'CUP' : 'CONE') + '!' : 'IT SLID OFF!', '#ec3013', 1.2); sfx('slide'); vib(40); h.mesh.position.copy(wp); debris.push({ m: h.mesh, v: V3(Math.sign(x - topX() || 1) * rr(0.5, 0.9), rr(0.3, 0.6), rr(-0.2, 0.2)), spin: V3(rr(-6, 6), 0, rr(-6, 6)), col: FLAVOURS[h.key].col }); return; }
    buildG.add(h.mesh); h.mesh.position.set(x, landY(x, h.r), 0); h.mesh.rotation.set(0, rr(0, 6), 0); h.mesh.userData.squash = 1;
    B.scoops.push({ key: h.key, r: h.r, q: h.q, size: h.size, sm: h.sm, x, y: h.mesh.position.y, melt: 0, drips: 0, mesh: h.mesh }); sfx('plop', { size: h.r / 0.085 }); puff(wp.x, wp.y, wp.z, 0xffffff, 2); vib(12);
    if (pr === 'topple') topple(); else if (pr === 'lean') { flash('LEANING! CAREFUL', '#e6b45a', 1); sfx('lean', { delay: 0.15 }); } else if (S.phase === 'shift' && !DM.on) S.autoBack = 0.55; }
  function topple() { flash('TOPPLED!', '#ec3013', 1.6); sfx('topple'); vib([60, 40, 60]); const dir = Math.sign(comOf(B.scoops)) || 1;
    B.scoops.forEach((q, i) => { const wp = q.mesh.getWorldPosition(V3()); buildG.remove(q.mesh); scene.add(q.mesh); q.mesh.position.copy(wp); debris.push({ m: q.mesh, v: V3(dir * rr(0.5, 1.1) * (1 + i * 0.3), rr(0.2, 0.7), rr(-0.25, 0.25)), spin: V3(rr(-5, 5), 0, dir * -rr(3, 7)), col: FLAVOURS[q.key].col }); });
    B.scoops = []; B.cells = new Set(); B.blobs = 0; B.spr = 0; B.sauce = null; B.sauceMix = false; B.wafer = null; B.topples++; S.topples = (S.topples || 0) + 1; }
  const splats = []; function splat(p, col) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 6), toon(col)); m.scale.set(rr(0.07, 0.1), 0.012, rr(0.06, 0.09)); m.position.copy(p); scene.add(m); splats.push(m); if (splats.length > 40) scene.remove(splats.shift()); return m; }
  // SAUCE: press a bottle, drag over the scoops. Every new spot you cover counts; sauce that misses lands on the counter.
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), _v = V3(), _c = V3();
  const rayAt = p => { ndc.set(p.x / CW() * 2 - 1, -(p.y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray; };
  const onPlaneY = (p, y) => { const r = rayAt(p), t = (y - r.origin.y) / r.direction.y; return t > 0 ? r.origin.clone().addScaledVector(r.direction, t) : null; };
  const onPlaneZ = (p, z) => { const r = rayAt(p), t = (z - r.origin.z) / r.direction.z; return t > 0 ? r.origin.clone().addScaledVector(r.direction, t) : null; };
  function hitScoop(rr0) { let best = null; B.scoops.forEach((q, i) => { q.mesh.getWorldPosition(_c); const R = q.r * 1.04, oc = _v.copy(rr0.origin).sub(_c), b = oc.dot(rr0.direction), c = oc.lengthSq() - R * R, disc = b * b - c; if (disc < 0) return; const t = -b - Math.sqrt(disc); if (t > 0 && (!best || t < best.t)) best = { i, t, p: rr0.origin.clone().addScaledVector(rr0.direction, t), c: _c.clone() }; }); return best; }
  function addSauce(i, wp, k) { const q = B.scoops[i]; if (!q) return false; const lp = q.mesh.worldToLocal(wp.clone()), n = lp.clone().normalize(); const key = i + ':' + Math.round(n.x * 2) + ':' + Math.round(n.y * 2) + ':' + Math.round(n.z * 2);
    if (!B.sauce) B.sauce = k; else if (B.sauce !== k) B.sauceMix = true; const fresh = !B.cells.has(key); B.cells.add(key);
    if (B.blobs < 140 && (fresh || Math.random() < 0.25)) { B.blobs++; const m = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), toon(SAUCES[k].col)); m.scale.set(0.022, 0.007, 0.022); m.position.copy(n).multiplyScalar(q.r * 1.0); m.quaternion.setFromUnitVectors(V3(0, 1, 0), n); q.mesh.add(m);
      if (n.y < 0.4 && Math.random() < 0.45) { const d = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, rr(0.015, 0.04), 3, 6), toon(SAUCES[k].col)); d.position.copy(m.position).add(V3(0, -0.02, 0)); q.mesh.add(d); } }
    if (fresh) { sfx('drop', { gap: 0.045 }); vib(3); } return fresh; }
  const coverage = () => B.scoops.length ? Math.min(1, B.cells.size / (7 * B.scoops.length)) : 0;
  // SPRINKLES: hold the shaker over the cone and SHAKE it; every change of direction throws a pinch
  const sprGeo = new THREE.CapsuleGeometry(0.0035, 0.012, 2, 4);
  function shakeOut(jarPos) { if (B.spr + loose.length >= 40) { if (!S.flash) flash('PLENTY OF SPRINKLES!', '#22c55e', 0.8); return; } const n = upg('shaker') ? 8 : 4; for (let i = 0; i < n; i++) { const m = new THREE.Mesh(sprGeo, toon(pick(SPRINKLE_COLS))); m.position.copy(jarPos).add(V3(rr(-0.03, 0.03), -0.06, rr(-0.03, 0.03))); m.rotation.set(rr(0, 6), rr(0, 6), 0); scene.add(m); loose.push({ m, v: V3(rr(-0.25, 0.25), rr(-0.4, -0.1), rr(-0.2, 0.2)) }); } sfx('rattle'); vib(6); }
  function stepLoose(dt) { for (let i = loose.length - 1; i >= 0; i--) { const L = loose[i]; L.v.y -= 6 * dt; L.m.position.addScaledVector(L.v, dt); L.m.rotation.x += dt * 9; let stuck = false;
      for (const q of B.scoops) { q.mesh.getWorldPosition(_c); const d = L.m.position.distanceTo(_c); if (d < q.r * 1.02) { const lp = q.mesh.worldToLocal(L.m.position.clone()).normalize().multiplyScalar(q.r * 1.0); scene.remove(L.m); L.m.position.copy(lp); q.mesh.add(L.m); B.spr++; stuck = true; break; } }
      if (stuck) { loose.splice(i, 1); continue; } if (L.m.position.y < TOP + 0.005) { L.m.position.y = TOP + 0.005; loose.splice(i, 1); splats.push(L.m); if (splats.length > 60) scene.remove(splats.shift()); } } }
  const SPR_WANT = 9;
  function addWafer() { if (!B.scoops.length) { flash('SCOOPS FIRST, THEN THE WAFER', '#ffffff', 1.1); return; } if (B.wafer) { flash('ONE WAFER IS PLENTY', '#ffffff', 0.9); return; } const q = B.scoops[B.scoops.length - 1], w = waferMesh(THREE, toon); w.position.set(q.r * 0.25, q.r * 0.45, 0); w.rotation.z = -0.45; q.mesh.add(w); B.wafer = w; sfx('wafer'); puff(H0.x, TOP + stackTopL(), H0.z, 0xfff3d0, 2); vib(10); }
  function stepBuild(dt) { if (carve) { const sp = (carve.len - (carve.prevLen || 0)) / Math.max(dt, 1e-3); carve.prevLen = carve.len; carve.spd = damp(carve.spd || 0, Math.min(1, sp / 0.9), 12, dt); AU.scrape(true, carve.spd); } else AU.scrape(false);
    // held scoop: fly up from the tub, then swing over the cone
    if (held) { held.t += dt; held.k = damp(held.k ?? 1, S.aim ? 0.2 : 1, 3, dt); const hy = stackTopL() + held.r + 0.17, x = heldX(), to = buildG.localToWorld(V3(x, hy, 0)); if (held.fly < 1) { held.fly = Math.min(1, held.fly + dt / 0.35); const k = smooth(0, 1, held.fly); held.mesh.position.lerpVectors(held.from, to, k); held.mesh.position.y += Math.sin(k * Math.PI) * 0.25; } else held.mesh.position.copy(to);
      scooper.visible = true; placeScooper(held.mesh.position, held.r);
      const pr = predict(x, held.r), top = buildG.localToWorld(V3(x, landY(x, held.r) , 0)); guide.visible = held.fly >= 1; guide.position.set(to.x, (to.y + top.y) / 2, to.z); guide.scale.set(1, Math.max(0.01, to.y - top.y - held.r), 1); guide.material.color.setHex(pr === 'ok' ? 0x22c55e : pr === 'lean' ? 0xe6b45a : 0xec3013); if (held.fly >= 1 && held.dropQ) { held.dropQ = false; dropHeld(); } }
    else { guide.visible = false; if (!carve) scooper.visible = false; }
    for (let i = falling.length - 1; i >= 0; i--) { const f = falling[i]; f.t = Math.min(1, f.t + dt / 0.2); const to = buildG.localToWorld(V3(f.x, landY(f.x, f.h.r), 0)); f.h.mesh.position.lerpVectors(f.from, to, f.t * f.t); if (f.t >= 1) { falling.splice(i, 1); land(f); } }
    // the stack leans toward its centre of mass; the balance line shows where it is
    const com = comOf(B.scoops), lean = Math.abs(com) / L_LEAN(); buildG.rotation.z = damp(buildG.rotation.z, -clamp(com * 2.6, -0.18, 0.18) + (lean > 0.6 ? Math.sin(performance.now() / 90) * 0.02 * lean : 0), 10, dt);
    balLine.visible = balDot.visible = B.scoops.length > 0 && S.phase === 'shift' && (S.focus === 'cone' || S.focus === 'case' || !!held); if (balLine.visible) { const top = buildG.localToWorld(V3(com, stackTopL(), 0)), bot = buildG.localToWorld(V3(com, B.rimY - 0.02, 0)); balLine.position.copy(top).add(bot).multiplyScalar(0.5); balLine.scale.y = top.distanceTo(bot); balLine.rotation.z = buildG.rotation.z; balDot.position.copy(bot); balLine.material.color.setHex(lean < 0.6 ? 0x22c55e : lean < 1 ? 0xe6b45a : 0xec3013); }
    for (const q of B.scoops) { const b = q.mesh.userData.ball; if (q.mesh.userData.squash > 0) { q.mesh.userData.squash = Math.max(0, q.mesh.userData.squash - dt * 5); const s = q.mesh.userData.squash; q.mesh.scale.set(1 + s * 0.18, 1 - s * 0.25, 1 + s * 0.18); }
      if (S.phase === 'shift' && !DM.on) { q.melt = Math.min(1, q.melt + dt / (upg('cold') ? 120 : 60)); b.scale.y = q.r * (1 - 0.14 * q.melt); const want = q.melt > 0.85 ? 3 : q.melt > 0.6 ? 2 : q.melt > 0.35 ? 1 : 0;
        while (q.drips < want) { q.drips++; const a = rr(0, 6.28), d = new THREE.Mesh(new THREE.CapsuleGeometry(q.r * 0.12, q.r * rr(0.3, 0.6), 3, 6), toon(FLAVOURS[q.key].col)); d.position.set(Math.cos(a) * q.r * 0.88, -q.r * 0.45, Math.sin(a) * q.r * 0.88); q.mesh.add(d); sfx('drip', { gap: 0.6 }); } } }
    for (let i = debris.length - 1; i >= 0; i--) { const d = debris[i]; d.v.y -= 7 * dt; d.m.position.addScaledVector(d.v, dt); d.m.rotation.x += d.spin.x * dt; d.m.rotation.z += d.spin.z * dt; const onCounter = Math.abs(d.m.position.z - K.z) < 0.4 && Math.abs(d.m.position.x - 0.15) < 2.1, floor = onCounter ? TOP : 0.01;
      if (d.m.position.y < floor) { d.m.position.y = floor; splat(d.m.position.clone(), d.col); scene.remove(d.m); debris.splice(i, 1); sfx('splat', { gap: 0.07 }); } }
    stepLoose(dt); for (const d of digs) if (d.visible) { d.userData.t -= dt; if (d.userData.t <= 0) d.visible = false; }
    // the vessel drops into the holder
    if (B.vMesh && B.vMesh.position.y > 0) B.vMesh.position.y = Math.max(0, B.vMesh.position.y - dt * 1.2); }

  // ---------- customers + orders ----------
  function newOrder(spec) { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i)); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUST.map((_, i) => i).filter(i => !used.includes(i)); if (!pool.length) return; const ci = pick(pool), d = S.day;
    const fl = flavAvail(), n = spec ? spec.flavours.length : d <= 1 ? (Math.random() < 0.6 ? 1 : 2) : d === 2 ? (Math.random() < 0.5 ? 2 : 1) : pick(d >= 5 ? [2, 2, 3, 3] : [1, 2, 2, 3]);
    const flavours = spec ? spec.flavours.slice() : Array.from({ length: n }, () => pick(fl));
    const vessel = spec ? spec.vessel : vesAvail().includes('cup') && Math.random() < 0.4 ? 'cup' : 'cone', sv = sauceAvail(), sauce = spec ? spec.sauce : sv.length && Math.random() < (d >= 4 ? 0.55 : 0.45) ? pick(sv) : null;
    const sprinkles = spec ? !!spec.sprinkles : d >= EXTRAS.sprinkles.day && Math.random() < 0.45, wafer = spec ? !!spec.wafer : d >= EXTRAS.wafer.day && Math.random() < 0.35;
    const total = VESSELS[vessel].price + 3 * flavours.length + (sauce ? 1 : 0) + (sprinkles ? 1 : 0) + (wafer ? 1 : 0), patMax = (68 + 9 * flavours.length - Math.min(20, (d - 1) * 5)) * (upg('radio') ? 1.2 : 1);
    const f = custFox[ci]; f.visible = true; f.position.set(K.door.x, 0, K.door.z + 0.4); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.userData.hold = null;
    sfx('bell'); orders.push({ id: idSeq++, ci, spot: free, vessel, flavours, sauce, sprinkles, wafer, total, pat: patMax, patMax, st: 'walk', f, line: pick(LINES.order), t: 0 }); }
  function need(o) { // what is still missing on the build for this order (in the order a player should do it)
    const out = []; if (B.vessel !== o.vessel) out.push(B.vessel ? 'wrongVessel' : 'vessel'); const have = B.scoops.map(q => q.key), want = o.flavours.slice(); for (const k of have) { const i = want.indexOf(k); if (i >= 0) want.splice(i, 1); else out.push('wrongScoop'); }
    want.forEach(k => out.push('scoop:' + k)); if (o.sauce && (B.sauce !== o.sauce || B.sauceMix || coverage() < 0.55)) out.push(B.sauce && B.sauce !== o.sauce ? 'wrongSauce' : 'sauce'); if (o.sprinkles && B.spr < SPR_WANT) out.push('sprinkles'); if (o.wafer && !B.wafer) out.push('wafer'); return out; }
  function grade(o) { let want = 1, got = B.vessel === o.vessel ? 1 : 0; const have = B.scoops.map(q => q.key), miss = []; if (!got) miss.push(VESSELS[o.vessel].name);
    for (const k of o.flavours) { want++; const i = have.indexOf(k); if (i >= 0) { got++; have.splice(i, 1); } else miss.push(FLAVOURS[k].name); }
    if (o.sauce) { want++; if (B.sauce === o.sauce && !B.sauceMix && coverage() >= 0.45) got++; else miss.push(SAUCES[o.sauce].short); } if (o.sprinkles) { want++; if (B.spr >= 6) got++; else miss.push('SPRINKLES'); } if (o.wafer) { want++; if (B.wafer) got++; else miss.push('WAFER'); }
    const q = Math.max(0, got / want - have.length * 0.15), sc = B.scoops, scoopQ = sc.length ? sc.reduce((a, s) => a + s.q, 0) / sc.length / 100 : 0, bal = clamp(1 - Math.abs(comOf(sc)) / L_LEAN(), 0, 1), melt = sc.length ? sc.reduce((a, s) => a + s.melt, 0) / sc.length : 0, sauceQ = o.sauce ? coverage() : 1;
    const craft = scoopQ * 0.45 + bal * 0.25 + sauceQ * 0.15 + (1 - melt) * 0.15; return { q, craft, miss, scoopQ, bal, melt, sauceQ }; }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['This is the best gelato in all the worlds!', 'Look at that tower! I need a photo.', 'Bellissimo!'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Yum! Thank you!', 'Just how I like it.', 'Perfect scoops!'] }, neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['It is fine. A bit wobbly.', 'Okay. Thanks.', 'Hm. Not bad.'] }, unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['Half my order is missing...', 'This is not what I asked for.', 'It is all drippy...'] }, insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'stern', lines: ['That is NOT my order!', 'Do I look like I ordered that?', 'Are you even listening?'] } };
  function serve(o) { const G = grade(o), pq = o.pat / o.patMax, stars = G.q < 0.5 ? 0 : G.q < 1 ? 1 : G.craft >= 0.72 && pq > 0.4 ? 3 : 2;
    const note = 'SCOOPS ' + Math.round(G.scoopQ * 100) + ' · BALANCE ' + Math.round(G.bal * 100) + (o.sauce ? ' · SAUCE ' + Math.round(G.sauceQ * 100) + '%' : '') + (G.melt > 0.15 ? ' · MELTED ' + Math.round(G.melt * 100) + '%' : '') + (G.miss.length ? ' · MISSING ' + G.miss.join(', ') : '');
    if (stars === 0) { startReact(o, 'insulted', 0, null, note); return false; }
    o.st = 'pay'; o.stars = stars; const level = stars === 3 ? (pq > 0.7 && G.craft > 0.85 ? 'thrilled' : 'happy') : stars === 2 ? 'neutral' : 'unhappy'; o.tip = level === 'thrilled' ? Math.ceil(o.total * 0.4) + 3 : level === 'happy' ? Math.ceil(o.total * 0.25) + 1 : level === 'neutral' ? 1 : 0;
    // hand the cone over: it moves into the customer's paw and leaves with them
    const g = new THREE.Group(); while (buildG.children.length) g.add(buildG.children[0]); g.position.set(-0.34, 0.98, 0.32); g.rotation.set(0, 0, 0); g.scale.setScalar(0.85); o.f.userData.P.body.add(g); o.f.userData.hold = { right: true }; o.cone = g; K.holderRing.visible = true;
    Object.assign(B, { vessel: null, vMesh: null, rimY: 0, rimR: 0, scoops: [], sauce: null, sauceMix: false, cells: new Set(), blobs: 0, spr: 0, wafer: null }); buildG.position.copy(BUILD_HOME); buildG.rotation.set(0, 0, 0);
    const bill = [5, 10, 20, 50].find(b => b > o.total + (Math.random() < 0.3 ? 4 : 0)) || 50; startReact(o, level, stars, { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 }, note); return true; }
  function startReact(o, level, stars, pay, note) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; if (level === 'thrilled') o.f.userData.hop = 1; speak(CUST[o.ci].name + ' is ' + R.word.toLowerCase().replace('!', ''), true); S.react = { o, level, stars, pay, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: CUST[o.ci].name, tip: o.tip || 0, note }; S.focus = 'all';
    sfx(level); if (level === 'thrilled') { burstConfetti(o.f.position.clone().setY(2.0), 40); for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xf4a6b8, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; if (r.pay) { S.pay = r.pay; payProps(r.pay); S.payOut = null; sfx('till'); } else { r.o.pat = Math.max(4, r.o.pat - 8); flash('NOT THEIR ORDER · FIX IT OR BIN IT', '#ec3013', 1.6); } }
  // ---------- REGISTER close-up (shared kit): drawer, bill, change dish, coins ----------
  const REG = V3(K.register.x, TOP + 0.11, K.register.z), RG = registerKit(ST, REG, { open: 'FOX GELATO  ·  OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const Pp = S.pay; if (!Pp) return; Pp.given += v; coinDrop(v); regDraw(Pp); sfx('coin', { v }); vib(6); if (Pp.given === Pp.owed) payDone(); else if (Pp.given > Pp.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); Pp.given = 0; sfx('wrong'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(Pp); } }
  function payDone() { const Pp = S.pay, o = orders.find(q => q.id === Pp.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...Pp, given: Pp.owed }); if (!o) return; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars); S.combo = o.stars === 3 ? S.combo + 1 : 0; const bonus = S.combo >= 2 ? S.combo - 1 : 0; S.tips += bonus;
    flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + (pts + bonus) + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : '') + (bonus ? ' · COMBO ×' + S.combo : ''), '#ffd23a', 1.8); sfx('serve'); if (bonus) sfx('combo', { delay: 0.25 }); o.st = 'leave'; o.t = 0; if (DM.on) DM.served++; }

  // ---------- input: tap tools, drag in tubs, tap/drag to drop, press-drag sauce, shake sprinkles, drag to serve ----------
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const uiScale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const TARGETS = () => { const t = [], W = (x, z, y) => V3(x, y, z);
    t.push({ kind: 'cone', p: W(K.cones.x, K.cones.z, TOP + 0.16), r: 42 }, { kind: 'cup', p: W(K.cups.x, K.cups.z, TOP + 0.1), r: 42 }, { kind: 'bin', p: W(K.bin.x, K.bin.z, TOP + 0.18), r: 44 });
    K.bottles.forEach(b => t.push({ kind: 'bottle', b, p: W(b.x, b.z, TOP + 0.14), r: 36 })); t.push({ kind: 'shaker', p: W(K.shaker.x, K.shaker.z, TOP + 0.12), r: 38 }, { kind: 'wafer', p: W(K.wafers.x, K.wafers.z, TOP + 0.1), r: 36 });
    if (B.vessel && !held) t.push({ kind: 'build', p: buildG.localToWorld(V3(0, Math.max(0.12, stackTopL() * 0.6), 0)), r: 56 });
    orders.forEach(o => o.st === 'wait' && t.push({ kind: 'cust', o, p: V3(o.f.position.x, 1.35, o.f.position.z), r: 74 })); return t; };
  function pickAt(p, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - p.x, s.y - p.y); if (d < t.r * uiScale() && d < bd) { bd = d; best = t; } } return best; }
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const pxPerM = () => { const a = scr(buildG.localToWorld(V3(0, stackTopL(), 0))), b = scr(buildG.localToWorld(V3(0.1, stackTopL(), 0))); return Math.max(60, Math.hypot(b.x - a.x, b.y - a.y) * 10); };
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 1, 6), toon('#4a2c18')); stream.visible = false; scene.add(stream);
  const STATION = { cone: 'cone', cup: 'cone', bin: 'cone', bottle: 'tops', shaker: 'tops', wafer: 'tops', build: 'serve', cust: 'serve' };
  function toolStart(kind, b, p) { tool = { kind, b, p0: { ...p }, last: { ...p }, acc: 0, dir: null, t: 0 }; if (kind === 'sauce') { stream.material = toon(SAUCES[b.k].col); tone(400, 0.06, 0.03); } if (kind === 'shake') sfx('rattle'); if (kind === 'serve') { tone(600, 0.06, 0.03); } }
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (S.phase === 'walk') return; if (S.phase !== 'shift' || S.pay || DM.on || S.react) return; const p = local(e);
    if (held) { if (pickAt(p, ['bin'])) { binBuild(); return; } e.preventDefault(); S.aim = { x0: p.x, c0: held.c, t0: performance.now(), px: pxPerM() }; return; }
    const t = pickAt(p), wp = onPlaneY(p, TOP), tub = wp && tubAt(wp);
    if (tub && (!t || t.kind === 'build' || t.kind === 'cust')) { e.preventDefault(); carveStart(tub, wp, p); return; }
    if (!t) return; e.preventDefault(); if (S.focus === 'all' && STATION[t.kind] && t.kind !== 'build' && t.kind !== 'cust') setFocus(STATION[t.kind]);
    if (t.kind === 'cone' || t.kind === 'cup') setVessel(t.kind);
    else if (t.kind === 'bin') binBuild();
    else if (t.kind === 'bottle') { if (!SAUCES[t.b.k] || SAUCES[t.b.k].day > S.day) { flash(SAUCES[t.b.k].name + ' FROM DAY ' + SAUCES[t.b.k].day, '#ffffff', 1.1); return; } if (!B.scoops.length) { flash('SCOOPS FIRST, THEN THE SAUCE', '#ffffff', 1.1); return; } toolStart('sauce', t.b, p); onMove(e); }
    else if (t.kind === 'shaker') { if (S.day < EXTRAS.sprinkles.day) { flash('SPRINKLES FROM DAY ' + EXTRAS.sprinkles.day, '#ffffff', 1.1); return; } if (!B.scoops.length) { flash('SCOOPS FIRST, THEN SPRINKLES', '#ffffff', 1.1); return; } toolStart('shake', K.shaker, p); }
    else if (t.kind === 'wafer') { if (S.day < EXTRAS.wafer.day) { flash('WAFERS FROM DAY ' + EXTRAS.wafer.day, '#ffffff', 1.1); return; } addWafer(); }
    else if (t.kind === 'build') { if (!B.scoops.length) { flash('ADD SOME SCOOPS FIRST', '#ffffff', 1); return; } toolStart('serve', null, p); }
    else if (t.kind === 'cust') flash(B.scoops.length ? 'DRAG THE ' + (B.vessel === 'cup' ? 'CUP' : 'CONE') + ' TO ' + CUST[t.o.ci].name : 'MAKE ' + CUST[t.o.ci].name + '’S ORDER FIRST', '#ffffff', 1.2); }
  function onMove(e) { if (S.phase !== 'shift') return; const p = local(e);
    if (carve) { carveMove(onPlaneY(p, TOP), p); return; }
    if (S.aim && held) { held.c = clamp(S.aim.c0 + (p.x - S.aim.x0) / S.aim.px * 0.4, -0.2, 0.2); return; }
    if (!tool) return; tool.t = performance.now();
    if (tool.kind === 'sauce') { const steps = Math.max(1, Math.ceil(Math.hypot(p.x - tool.last.x, p.y - tool.last.y) / 6)); let any = null;
      for (let s = 1; s <= steps; s++) { const q = { x: tool.last.x + (p.x - tool.last.x) * s / steps, y: tool.last.y + (p.y - tool.last.y) * s / steps }, h = hitScoop(rayAt(q)); if (h) { addSauce(h.i, h.p, tool.b.k); any = h; } }
      tool.hit = any; if (!any && (performance.now() - (tool.missT || 0)) > 160) { tool.missT = performance.now(); const fp = onPlaneY(p, TOP); if (fp && Math.abs(fp.x - H0.x) < 0.5 && Math.abs(fp.z - H0.z) < 0.4) { B.miss = (B.miss || 0) + 1; splat(fp.setY(TOP + 0.002), SAUCES[tool.b.k].col).scale?.set(0.03, 0.004, 0.03); } }
      tool.aimP = any ? any.p.clone() : onPlaneZ(p, H0.z); tool.last = p; return; }
    if (tool.kind === 'shake') { const dx = p.x - tool.last.x, dy = p.y - tool.last.y, d = Math.hypot(dx, dy); if (d < 2) return; const dir = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) * 2 : Math.sign(dy); if (tool.dir !== null && dir !== tool.dir && tool.acc > 14) { shakeOut(K.shaker.g.position.clone()); tool.acc = 0; tool.shook = (tool.shook || 0) + 1; } if (dir !== tool.dir) tool.acc = 0; tool.dir = dir; tool.acc += d; tool.jx = clamp((tool.jx || 0) + dx * 0.0007, -0.05, 0.05); tool.jz = clamp((tool.jz || 0) + dy * 0.0005, -0.04, 0.04); tool.last = p; return; }
    if (tool.kind === 'serve') { const fp = onPlaneY(p, TOP + 0.12); if (fp) { tool.to = V3(clamp(fp.x, -2.2, 2.2), TOP + 0.12 + Math.max(0, fp.z - (K.caseZ - 0.5)) * 0.6, clamp(fp.z, H0.z, K.spots[0].z - 0.35)); } tool.last = p; } }
  function onUp(e) { if (carve) { carveEnd(); return; } if (S.aim) { S.aim = null; dropHeld(); return; } if (!tool) return; const T0 = tool; tool = null; stream.visible = false;
    if (T0.kind === 'sauce' || T0.kind === 'shake') { if (T0.kind === 'sauce' && B.cells.size) flash(SAUCES[T0.b.k].short + ' · ' + Math.round(coverage() * 100) + '% COVERED', coverage() > 0.55 ? '#22c55e' : '#ffd23a', 1.1); if (T0.kind === 'shake' && B.spr) flash(B.spr + ' SPRINKLES ON', B.spr >= SPR_WANT ? '#22c55e' : '#ffd23a', 1); return; }
    if (T0.kind === 'serve') { const p = e ? local(e) : T0.last; let o = null, bd = 1e9; for (const q of orders) { if (q.st !== 'wait') continue; const s = scr(V3(q.f.position.x, 1.2, q.f.position.z)), d = Math.hypot(s.x - p.x, s.y - p.y); if (d < 120 * uiScale() && d < bd) { bd = d; o = q; } }
      if (!o && buildG.position.z > K.caseZ - 0.2) { for (const q of orders) { if (q.st !== 'wait') continue; const d = Math.abs(q.f.position.x - buildG.position.x); if (d < bd) { bd = d; o = q; } } }
      if (o) serve(o); else { flash('DROP IT ON A CUSTOMER', '#ffffff', 1); } buildG.position.copy(BUILD_HOME); } }
  function stepTools(dt) { const T0 = tool;
    K.bottles.forEach(b => { const on = T0 && T0.kind === 'sauce' && T0.b === b; if (on && T0.aimP) { const to = T0.aimP.clone().add(V3(0, 0.2, -0.04)); b.g.position.lerp(to, Math.min(1, dt * 18)); b.g.rotation.x = damp(b.g.rotation.x, -2.5, 12, dt); }
      else { b.g.position.lerp(b.home, Math.min(1, dt * 10)); b.g.rotation.x = damp(b.g.rotation.x, 0, 10, dt); } });
    if (T0 && T0.kind === 'sauce' && T0.aimP) { const tip = K.bottles.find(b => b === T0.b).g.localToWorld(V3(0, 0.3, 0)), end = T0.hit ? T0.hit.p : T0.aimP.clone().setY(TOP); stream.visible = true; stream.position.copy(tip).add(end).multiplyScalar(0.5); stream.scale.set(1, Math.max(0.01, tip.distanceTo(end)), 1); stream.quaternion.setFromUnitVectors(V3(0, 1, 0), tip.clone().sub(end).normalize()); AU.pour(true, T0.hit ? 1 : 0.3); } else { stream.visible = false; AU.pour(false); }
    { const J = K.shaker.g; if (T0 && T0.kind === 'shake') { const top = buildG.localToWorld(V3(topX(), stackTopL(), 0)), to = V3(top.x + (T0.jx || 0), top.y + 0.24, top.z + (T0.jz || 0)); T0.jx = damp(T0.jx || 0, 0, 2, dt); J.position.lerp(to, Math.min(1, dt * 14)); J.rotation.z = damp(J.rotation.z, Math.PI * 0.85 + (T0.dir || 0) * 0.12, 16, dt); } else { J.position.lerp(K.shaker.home, Math.min(1, dt * 10)); J.rotation.z = damp(J.rotation.z, 0, 10, dt); } }
    if (T0 && T0.kind === 'serve' && T0.to) { buildG.position.lerp(T0.to, Math.min(1, dt * 16)); } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- NEXT-STEP HINT: bobbing arrow + pulsing ring over the next thing to do, and which station it is ----------
  const RINGS = hintRings(ST); let HINT = null, hintT = 0;
  const topOrder = () => orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)[0];
  function nextHint() { if (S.phase !== 'shift' || S.pay || S.react) return null; const Hh = (p, station, text, r = 0.16) => ({ p, station, text, r }), W = (x, z, y = TOP) => V3(x, y, z);
    if (held) return Hh(buildG.localToWorld(V3(0, B.rimY, 0)), 'cone', 'TAP WHEN THE SCOOP SWINGS OVER THE ' + (B.vessel === 'cup' ? 'CUP' : 'CONE'), 0.14);
    const o = topOrder(); if (!o) return B.scoops.length ? null : null; const nd = need(o), who = CUST[o.ci].name;
    if (nd.includes('wrongVessel') || nd.includes('wrongScoop') || nd.includes('wrongSauce')) return Hh(W(K.bin.x, K.bin.z), 'cone', (nd.includes('wrongVessel') ? who + ' WANTS A ' + VESSELS[o.vessel].name : nd.includes('wrongScoop') ? 'WRONG FLAVOUR' : 'WRONG SAUCE') + ' · TAP THE BIN', 0.2);
    if (nd.includes('vessel')) { const v = o.vessel === 'cone' ? K.cones : K.cups; return Hh(W(v.x, v.z), 'cone', 'TAP THE ' + (o.vessel === 'cone' ? 'CONES' : 'CUPS') + ' · ' + who + ' WANTS A ' + VESSELS[o.vessel].name, 0.14); }
    const sc = nd.find(x => x.startsWith('scoop:')); if (sc) { const k = sc.slice(6), t = K.tubs.find(q => q.k === k); return Hh(W(t.x, t.z), 'case', 'DRAG ROUND IN THE ' + FLAVOURS[k].name + ' TUB · FILL THE BUBBLE', 0.3); }
    if (nd.includes('sauce')) { const b = K.bottles.find(q => q.k === o.sauce); return Hh(W(b.x, b.z), 'tops', 'HOLD THE ' + SAUCES[o.sauce].name + ' AND DRAG IT OVER THE SCOOPS', 0.12); }
    if (nd.includes('sprinkles')) return Hh(W(K.shaker.x, K.shaker.z), 'tops', 'HOLD THE SHAKER · SHAKE IT SIDE TO SIDE · ' + B.spr + ' / ' + SPR_WANT, 0.12);
    if (nd.includes('wafer')) return Hh(W(K.wafers.x, K.wafers.z), 'tops', 'TAP THE WAFERS', 0.12);
    const melt = B.scoops.some(q => q.melt > 0.55); return Hh(W(o.f.position.x, o.f.position.z, 1.0), 'serve', (melt ? 'MELTING! ' : '') + 'DRAG THE ' + (o.vessel === 'cup' ? 'CUP' : 'CONE') + ' TO ' + who, 0.45); }
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === 'all' || S.focus === HINT.station) return; if (tool || carve || held || S.aim || S.pay || S.react) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 1.1 && performance.now() - (S.userFocusT || 0) > 2600) S.focus = HINT.station; }
  function updHint(dt) { hintT += dt; HINT = DM.on ? (DM.hint || null) : nextHint(); RINGS.place(HINT && !S.react && !carve ? HINT : null, hintT, dt); }

  // ---------- WALK MODE: Ben walks in and around the parlour with the standard Game HUD (1 WAVE · 2 TASTE · 3 HOP · TALK) ----------
  const WK = { p: V3(), yaw: Math.PI, stick: { x: 0, y: 0 }, keys: new Set(), camYaw: 0.2, pitch: 0.66, dist: 5.4, en: 100, wave: 0, dialog: null, toast: null, toastT: 0, near: null, tasteT: 0, look: V3(), music: true };
  const talkers = () => [{ key: 'keeper', f: keeper, name: KP.name, role: KP.role, r: 2.5 }, ...idlers.map((d, i) => ({ key: 'idler' + i, f: d.f, name: d.name, role: CUST[d.ci].role || 'Regular', r: 1.9, d })), { key: 'door', p: V3(K.door.x, 0, K.door.z), name: 'Leave the parlour', r: 1.3 }, { key: 'radio', p: V3(K.radio.x, 0, K.radio.z), name: WK.music ? 'Turn the radio off' : 'Turn the radio on', r: 1.6 }];
  const toast = (t, s = 3.2) => { WK.toast = t; WK.toastT = s; };
  function openDialog(d) { WK.dialog = { ...d, i: 0 }; if (d.f) d.f.userData.talking = true; sfx('talk'); }
  function closeDialog() { const D = WK.dialog; if (D && D.f) D.f.userData.talking = false; WK.dialog = null; }
  const keeperChoices = () => [{ text: 'Sounds DELICIOUS! Put me to work.', go: () => { closeDialog(); api.toIntro(); } }, { text: 'How do I carve a good scoop?', go: () => openDialog({ f: keeper, name: KP.name, role: KP.role, lines: ['Press inside a tub and drag round and round, like drawing a snail.', 'The ball grows as you go. Let go when it fills the ghost bubble.', 'Then tap when it swings right over the cone. Steady paws, tall towers!'], choices: keeperChoices() }) }, { text: 'Bye for now.', bye: true, go: closeDialog }];
  function interact(n) { if (!n) return;
    if (n.key === 'keeper') openDialog({ f: keeper, name: KP.name, role: KP.role, lines: ['Ciao, ' + CAST.player.name + '! Welcome to ' + GELATO.name + '.', 'Eight tubs, three sauces, and I need one very steady pair of paws behind this counter.'], choices: keeperChoices() });
    else if (n.d) { const d = n.d, [k1, k2] = d.flav; openDialog({ f: d.f, name: n.name, role: n.role, lines: k2 && k2 !== k1 ? [FLAVOURS[k1].name + ' on the bottom, ' + FLAVOURS[k2].name + ' on top. The best tower in town.', 'Ask ' + KP.name + ' for a job. She is always short of scoopers.'] : [FLAVOURS[k1].name + '. Every. Single. Day.', 'The trick is the drizzle. Not too much, not too little.'] }); }
    else if (n.key === 'door') { if (opts.onExit) opts.onExit(); else toast('This door leads back out to the world map. Here it is just the parlour.'); }
    else if (n.key === 'radio') { WK.music = !WK.music; toast(WK.music ? 'RADIO ON · PARLOUR TUNES' : 'RADIO OFF'); sfx('ui'); } }
  function dlgView() { const D = WK.dialog; if (!D) return null; const end = D.i >= D.lines.length - 1; return { name: D.name, role: D.role, text: D.lines[D.i], step: D.i + 1, total: D.lines.length, more: false, choices: end && D.choices ? D.choices.map(c => ({ text: c.text, bye: !!c.bye })) : null, required: false }; }
  function resolveWalk(p) { const R = 0.32, W2 = K.W / 2 - 0.35, D2 = K.D / 2 - 0.35; p.x = clamp(p.x, -W2, W2); p.z = clamp(p.z, -D2, D2);
    for (const [x0, z0, x1, z1] of K.colliders) { const cx = clamp(p.x, x0, x1), cz = clamp(p.z, z0, z1), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz); if (d < R) { if (d > 1e-4) { p.x = cx + dx / d * R; p.z = cz + dz / d * R; } else { const l = p.x - x0, r = x1 - p.x, t = p.z - z0, b = z1 - p.z, m = Math.min(l, r, t, b); if (m === l) p.x = x0 - R; else if (m === r) p.x = x1 + R; else if (m === t) p.z = z0 - R; else p.z = z1 + R; } } }
    for (const [x, z, r0] of [...K.circles, ...[keeper, ...idlers.map(d => d.f)].filter(f => f.visible).map(f => [f.position.x, f.position.z, 0.3])]) { const dx = p.x - x, dz = p.z - z, d = Math.hypot(dx, dz), m = r0 + R; if (d < m && d > 1e-4) { p.x = x + dx / d * m; p.z = z + dz / d * m; } } }
  function stepWalk(dt) { const kx = (WK.keys.has('KeyD') || WK.keys.has('ArrowRight') ? 1 : 0) - (WK.keys.has('KeyA') || WK.keys.has('ArrowLeft') ? 1 : 0), ky = (WK.keys.has('KeyW') || WK.keys.has('ArrowUp') ? 1 : 0) - (WK.keys.has('KeyS') || WK.keys.has('ArrowDown') ? 1 : 0);
    let sx = clamp(WK.stick.x + kx, -1, 1), sy = clamp(WK.stick.y + ky, -1, 1); if (WK.dialog) sx = sy = 0; const cy = WK.camYaw, fx = -Math.sin(cy), fz = -Math.cos(cy), rx = Math.cos(cy), rz = -Math.sin(cy);
    const mx = fx * sy + rx * sx, mz = fz * sy + rz * sx, ml = Math.min(1, Math.hypot(mx, mz)), sp = 3.1 * ml;
    if (ml > 0.08) { WK.p.x += mx / Math.hypot(mx, mz) * sp * dt; WK.p.z += mz / Math.hypot(mx, mz) * sp * dt; const want = Math.atan2(mx, mz); let dd = want - WK.yaw; while (dd > Math.PI) dd -= Math.PI * 2; while (dd < -Math.PI) dd += Math.PI * 2; WK.yaw += dd * Math.min(1, dt * 12); WK.stride = (WK.stride || 0) + sp * dt; if (WK.stride > 0.62) { WK.stride = 0; WK.foot = !WK.foot; sfx('step', { alt: WK.foot }); } }
    resolveWalk(WK.p); benWalk.position.copy(WK.p); benWalk.rotation.y = WK.yaw; kit.animFox && kit.animFox(benWalk, dt, sp);
    if (WK.wave > 0) { WK.wave -= dt; const arm = benWalk.userData.P.arms[0]; arm.rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32); }
    // who can I talk to?
    let best = null, bd = 1e9; for (const n of talkers()) { const p = n.f ? n.f.position : n.p, d = Math.hypot(p.x - WK.p.x, p.z - WK.p.z); if (d < n.r && d < bd) { bd = d; best = n; } } WK.near = best;
    const head = V3(WK.p.x, 1.6, WK.p.z); keeper.userData.lookAt = Math.hypot(keeper.position.x - WK.p.x, keeper.position.z - WK.p.z) < 4.5 ? head : null; idlers.forEach(d => d.f.userData.lookAt = Math.hypot(d.f.position.x - WK.p.x, d.f.position.z - WK.p.z) < 3 ? head : null);
    WK.tasteT = Math.max(0, WK.tasteT - dt); if (WK.toastT > 0) { WK.toastT -= dt; if (WK.toastT <= 0) WK.toast = null; } WK.en = Math.min(100, WK.en + dt * 0.2);
    // third-person camera with wall cut-away
    WK.look.lerp(V3(WK.p.x, 1.15, WK.p.z), Math.min(1, dt * 8)); const dEff = WK.dist * clamp(CHh() / CW(), 1.05, 1.75); const cp = Math.cos(WK.pitch) * dEff; const want = V3(WK.look.x + Math.sin(cy) * cp, WK.look.y + Math.sin(WK.pitch) * dEff, WK.look.z + Math.cos(cy) * cp); camera.position.lerp(want, Math.min(1, dt * 7)); CAM.look.copy(WK.look); }
  const nearCase = () => Math.abs(WK.p.x) < 1.95 && WK.p.z > K.caseZ - 1.0 && WK.p.z < K.caseZ + 1.7;
  const walkApi = {
    melee() { if (S.phase !== 'walk' || WK.dialog) return; WK.wave = 1.3; sfx('wave'); let who = null, bd = 4.5; for (const f of [keeper, ...idlers.map(d => d.f)]) { const d = Math.hypot(f.position.x - WK.p.x, f.position.z - WK.p.z); if (f.visible && d < bd) { bd = d; who = f; } } if (who) { who.userData.waveT = 1.3; who.userData.hop = 1; const nm = who === keeper ? KP.name : idlers.find(d => d.f === who).name; toast(nm + ': "Ciao, ' + CAST.player.name + '!"', 2.2); } },
    range() { if (S.phase !== 'walk' || WK.dialog || WK.tasteT > 0) return; if (!nearCase()) { toast('TASTE AT THE GELATO CASE', 1.8); return; } const k = pick(flavAvail()); WK.tasteT = 1.2; WK.en = Math.min(100, WK.en + 10); toast('TASTING SPOON · ' + FLAVOURS[k].name + '! ' + pick(['Brain freeze... worth it.', 'Mmm, so creamy.', 'Can I have a job here?', 'That is the good stuff.']), 2.6); puff(WK.p.x, 1.5, WK.p.z, new THREE.Color(FLAVOURS[k].col).getHex(), 4); sfx('taste'); vib(15); },
    jump() { if (S.phase !== 'walk' || WK.dialog) return; benWalk.userData.hop = 1; sfx('hop'); }, meleeUp() {},
    talk() { if (S.phase !== 'walk') return; if (WK.dialog) { walkApi.nextLine(); return; } interact(WK.near); },
    nextLine() { const D = WK.dialog; if (!D) return; if (D.i < D.lines.length - 1) { D.i++; sfx('talk'); } else if (!D.choices) closeDialog(); },
    choose(i) { const D = WK.dialog; if (!D || !D.choices || D.i < D.lines.length - 1) return; const c = D.choices[i]; c && c.go(); }, closeDialog,
    clearToast() { WK.toast = null; }, useItem() { toast('NO ITEMS IN THE PARLOUR · TRY THE TASTING SPOON (2)', 2); }, closeWheel() {}, skipTime() {}, setHudPad() {}, start() {},
    setStick(x, y) { WK.stick.x = x; WK.stick.y = y; }, eyeLook(dx, dy) { walkApi.lookBy(dx, dy); }, eyeRelease() {}, togglePov() { return false; },
    lookBy(dx, dy) { WK.camYaw -= dx * 0.006; WK.pitch = clamp(WK.pitch + dy * 0.004, 0.12, 1.15); }, zoomBy(f) { WK.dist = clamp(WK.dist * f, 2.6, 8); },
    getCam() { return { dist: WK.dist * 2.5, pitch: WK.pitch }; }, setCam(d, p) { if (d != null) WK.dist = clamp(d / 2.5, 2.6, 8); if (p != null) WK.pitch = clamp(p, 0.12, 1.15); },
    mapData() { return { p: [WK.p.x, WK.p.z, WK.yaw], b: [['GELATO CASE', 0, K.caseZ], ['DOOR', K.door.x, K.door.z], ['RADIO', K.radio.x, K.radio.z]], f: [[keeper.position.x, keeper.position.z], ...idlers.map(d => [d.f.position.x, d.f.position.z])], e: [], q: [keeper.position.x, keeper.position.z, 'WORK A SHIFT'] }; },
    setMinimap() {}, toggleSound() { audio.setMuted && audio.setMuted(!audio.muted); }, cycleWeather() {} };
  const onKD = e => { if (S.phase !== 'walk') return; if (/^(Key[WASD]|Arrow)/.test(e.code)) { WK.keys.add(e.code); e.preventDefault(); } }, onKU = e => WK.keys.delete(e.code), onBlur = () => WK.keys.clear();
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  // parlour radio: the café band in gelato-audio.js (calm in the parlour, faster while you work, faster still in the last 30 s)
  function stepMusic() { const work = S.phase === 'shift' || S.phase === 'glide'; AU.music.tick(WK.music && !PAUSE && !document.hidden ? (work ? 'shift' : 'parlour') : null, { hurry: work && GELATO.shift - S.t < 30 && !DM.on, duck: !!S.react || !!S.pay }); }

  // ---------- DEMO: an autopilot works two real orders with captions and a glowing hand (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, act: null, hint: null, day0: 1, specs: [] };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.3); hand.visible = false; hand.renderOrder = 20; scene.add(hand);
  const handTo = (p, f) => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.42); if (f) S.focus = f; DM.hint = { p: p.clone().setY(Math.max(TOP, p.y - 0.15)), r: 0.16, station: f }; };
  const cap = (id, key, text) => { if (DM.seen[id]) return; DM.seen[id] = true; DM.cap = text; DM.key = key; DM.cd = Math.max(DM.cd, 1.6); };
  function demoAct() { const o = topOrder();
    if (S.pay) { const Pp = S.pay, left = Pp.owed - Pp.given, v = [10, 5, 2, 1].find(c => c <= left); if (!DM.seen.pay) { cap('pay', 'COINS', 'THEY PAID ' + Pp.paid + 'g FOR A ' + Pp.total + 'g CONE. TAP COINS TO GIVE ' + Pp.owed + 'g CHANGE'); return 1.8; } DM.cap = 'GIVE ' + Pp.owed + 'g CHANGE · ' + (Pp.given + v) + ' / ' + Pp.owed + 'g'; DM.key = v + 'g'; giveCoin(v); if (!S.pay) { DM.cap = 'EXACT CHANGE! THE COINS GO TO THE CUSTOMER'; DM.key = '✓'; return 1.6; } return 0.8; }
    if (!o) return 0.4; const nd = need(o), who = CUST[o.ci].name;
    if (held) { if (held.fly < 1) return 0.1; if (!DM.seen.drop) { cap('drop', 'TAP', 'THE SCOOP SWINGS OVER THE CONE. TAP WHEN IT IS RIGHT ABOVE IT'); handTo(buildG.localToWorld(V3(0, stackTopL() + 0.25, 0)), 'cone'); return 1.6; } const x = heldX(), tx = topX(), dx = x - tx, cross = DM.pdx != null && Math.sign(dx) !== Math.sign(DM.pdx); DM.pdx = dx; if (Math.abs(dx) < 0.008 || cross) { DM.pdx = null; DM.key = 'TAP'; handTo(held.mesh.position.clone(), 'cone'); dropHeld(); return 0.9; } return 0.01; }
    if (nd.includes('wrongVessel') || nd.includes('wrongScoop') || nd.includes('wrongSauce')) { cap('bin', 'TAP', 'WRONG ONE? TAP THE BIN AND START AGAIN'); handTo(V3(K.bin.x, TOP + 0.2, K.bin.z), 'cone'); binBuild(); return 1; }
    if (nd.includes('vessel')) { cap('vessel', 'TAP', who + ' WANTS A ' + VESSELS[o.vessel].name + '. TAP THE ' + (o.vessel === 'cone' ? 'CONES' : 'CUPS') + ': ONE GOES IN THE HOLDER'); const v = o.vessel === 'cone' ? K.cones : K.cups; handTo(V3(v.x, TOP + 0.18, v.z), 'cone'); setVessel(o.vessel); return 1.1; }
    const sc = nd.find(x => x.startsWith('scoop:')); if (sc) { const k = sc.slice(6), t = K.tubs.find(q => q.k === k); cap('carve' + B.scoops.length, 'DRAG', B.scoops.length ? 'NEXT SCOOP: ' + FLAVOURS[k].name + '. ROUND AND ROUND AGAIN' : 'PRESS IN THE ' + FLAVOURS[k].name + ' TUB AND DRAG ROUND AND ROUND. THE BALL GROWS. LET GO WHEN IT FILLS THE BUBBLE'); S.focus = 'case'; DM.act = { kind: 'carve', tub: t, a: 0, t: 0, wait: 0.9 }; return 0.1; }
    if (nd.includes('sauce')) { const b = K.bottles.find(q => q.k === o.sauce); cap('sauce', 'HOLD', 'HOLD THE ' + SAUCES[o.sauce].name + ' BOTTLE AND DRAG IT OVER THE SCOOPS. COVER THEM!'); S.focus = 'tops'; handTo(V3(b.x, TOP + 0.2, b.z), 'tops'); DM.act = { kind: 'sauce', b, t: 0, wait: 1.2 }; return 0.1; }
    if (nd.includes('sprinkles')) { cap('spr', 'SHAKE', 'HOLD THE SHAKER OVER THE CONE AND SHAKE IT SIDE TO SIDE'); S.focus = 'tops'; handTo(V3(K.shaker.x, TOP + 0.2, K.shaker.z), 'tops'); DM.act = { kind: 'shake', t: 0, wait: 1.0, n: 0 }; return 0.1; }
    if (nd.includes('wafer')) { cap('wafer', 'TAP', 'TAP THE WAFERS: ONE STICKS IN THE TOP SCOOP'); handTo(V3(K.wafers.x, TOP + 0.2, K.wafers.z), 'tops'); addWafer(); return 1.2; }
    cap('serve' + DM.served, 'DRAG', 'DONE! DRAG IT OVER THE COUNTER TO ' + who); S.focus = 'serve'; DM.act = { kind: 'serve', o, t: 0, wait: 1.2, from: buildG.position.clone() }; return 0.1; }
  function demoStep(dt) { const A = DM.act; if (!A || A.kind !== 'carve') hand.scale.setScalar(Math.max(0.28, hand.scale.x - dt * 0.6));
    if (A) { if (A.wait > 0) { A.wait -= dt; return; } A.t += dt;
      if (A.kind === 'carve') { A.a += dt * 7.5; const T = A.tub, wp = V3(T.x + Math.cos(A.a) * 0.13, TOP, T.z + Math.sin(A.a) * 0.08); if (!carve) { if (!carveStart(T, wp)) { DM.act = null; return; } } else carveMove(wp); hand.visible = true; hand.position.copy(wp).add(V3(0, 0.05, -0.12)); hand.scale.setScalar(0.16); DM.hint = null; if (carve && carve.r >= R_TARGET) { carveEnd(); DM.act = null; DM.cd = 0.7; DM.cap = 'JUST RIGHT! IT FLIES TO THE CONE'; DM.key = '✓'; } return; }
      if (A.kind === 'sauce') { if (!tool) toolStart('sauce', A.b, { x: 0, y: 0 }); const n = B.scoops.length, i = Math.floor(A.t * 3) % n, q = B.scoops[i], ang = A.t * 9, nrm = V3(Math.sin(ang) * 0.9, 0.55 + 0.4 * Math.cos(A.t * 5), Math.cos(ang) * 0.5 + 0.55).normalize(), c = q.mesh.getWorldPosition(V3()), wp = c.clone().addScaledVector(nrm, q.r); addSauce(i, wp, A.b.k); tool.aimP = wp; tool.hit = { p: wp }; hand.position.copy(wp).add(V3(0, 0.2, 0)); DM.hint = null;
        if (coverage() >= 0.8 || A.t > 5) { tool = null; stream.visible = false; DM.act = null; DM.cd = 0.6; flash(SAUCES[A.b.k].short + ' · ' + Math.round(coverage() * 100) + '% COVERED', '#22c55e', 1); } return; }
      if (A.kind === 'shake') { if (!tool) toolStart('shake', K.shaker, { x: 0, y: 0 }); tool.jx = Math.sin(A.t * 14) * 0.05; tool.dir = Math.cos(A.t * 14) > 0 ? 2 : -2; if (Math.floor(A.t * 14 / Math.PI) !== A.n) { A.n = Math.floor(A.t * 14 / Math.PI); shakeOut(K.shaker.g.position.clone()); } hand.position.copy(K.shaker.g.position).add(V3(0, 0.12, 0)); DM.hint = null;
        if (B.spr >= SPR_WANT + 2 || A.t > 4) { tool = null; DM.act = null; DM.cd = 0.8; flash(B.spr + ' SPRINKLES ON', '#22c55e', 1); } return; }
      if (A.kind === 'serve') { const o = A.o, to = V3(o.f.position.x, TOP + 0.35, K.spots[0].z - 0.4), k = Math.min(1, A.t / 1.0); buildG.position.lerpVectors(A.from, to, smooth(0, 1, k)); buildG.position.y += Math.sin(k * Math.PI) * 0.2; hand.position.copy(buildG.position).add(V3(0, 0.3, 0)); DM.hint = null; if (k >= 1) { DM.act = null; serve(o); buildG.position.copy(BUILD_HOME); DM.cd = 1; } return; } return; }
    if (S.phase !== 'shift' || S.react || S.payOut) return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct();
    if (DM.served >= 2 && !S.pay && !S.react) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.served = 0; DM.act = null; DM.cd = 2.2; DM.day0 = S.day; S.day = Math.max(S.day, 4); refreshLids();
    DM.specs = [{ vessel: 'cone', flavours: ['strawberry', 'chocolate'], sauce: 'choc', sprinkles: true, wafer: false }, { vessel: 'cup', flavours: ['pistachio'], sauce: null, sprinkles: false, wafer: true }];
    DM.cap = 'WATCH A SHIFT AT ' + GELATO.name; DM.key = ''; S.phase = 'intro'; S.done = null; S.demo = true; startShift(); S.next = 0.6; }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; DM.act = null; tool = null; stream.visible = false; S.day = DM.day0; refreshLids(); resetShiftStuff(); S.phase = 'intro'; S.done = null; showIntroCast(); glideTo(wideShot(), 1.2); }

  // ---------- flow ----------
  const INTRO = { x: -0.75, z: K.caseZ + 1.65 };
  function showIntroCast() { benWork.visible = true; benWalk.visible = false; benWork.position.set(INTRO.x, 0, INTRO.z); benWork.rotation.y = 0.3; uniformOn(benWork, true); keeper.visible = true; keeper.position.set(K.keeper.x, 0, K.keeper.z); keeper.rotation.y = 0; idlers.forEach(d => d.f.visible = true); }
  function resetShiftStuff() { nameTags.forEach(s => s.visible = false); orders.forEach(o => { o.f.visible = false; o.f.userData.hold = null; if (o.cone) { o.cone.parent && o.cone.parent.remove(o.cone); } }); orders.length = 0; if (held) { scene.remove(held.mesh); held = null; } if (carve) { scene.remove(carve.ball); carve = null; } tool = null; S.aim = null; stream.visible = false; scooper.visible = ghost.visible = ghostRing.visible = false;
    falling.forEach(f => scene.remove(f.h.mesh)); falling.length = 0; debris.forEach(d => scene.remove(d.m)); debris.length = 0; loose.forEach(l => scene.remove(l.m)); loose.length = 0; splats.forEach(m => scene.remove(m)); splats.length = 0; digs.forEach(d => d.visible = false); clearBuild(); B.topples = 0; S.topples = 0;
    S.pay = null; S.payOut = null; payProps(null); S.react = null; coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; }
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; closeDialog(); if (!S.demo && DM.on) demoStop(); audio.init && audio.init(); if (audio.wind) audio.wind.gain.value = 0; resetShiftStuff(); refreshLids(); sfx('ui');
    Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 0.8, done: null, combo: 0, focus: 'all' }); benWork.visible = benWalk.visible = keeper.visible = false; idlers.forEach(d => d.f.visible = false);
    glideTo(workShot('all'), 1.6); say(KP.name + ': "Cones and cups on the left, sauces on the right, the case right in front of you. Andiamo!"', 6); S.glideT = 1.65; }
  function endShift() { S.phase = 'done'; sfx('fanfare'); AU.scrape(false); AU.pour(false); const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 5 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = []; try { save.addGold(total); save.best(SAVE.best, total); if (S.served >= 3 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...FLAV_KEYS.filter(k => FLAVOURS[k].day === nd).map(k => FLAVOURS[k].name), ...Object.values(SAUCES).filter(v => v.day === nd).map(v => v.name), ...Object.values(VESSELS).filter(v => v.day === nd).map(v => v.name + 'S'), ...Object.values(EXTRAS).filter(v => v.day === nd).map(v => v.name)]; }
      if (!save.flag('gelatoUniform') && S.served >= 3) { save.setFlag('gelatoUniform'); unlock.push('GELATO UNIFORM (paper hat, towel + cone tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    if (eod) setTimeout(() => { burstConfetti(V3(benWork.position.x, 2.6, benWork.position.z), 70); sfx('thrilled'); }, 1300);
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold, topples: S.topples || 0 };
    if (newDay) S.day += 1; refreshLids(); if (held) { scene.remove(held.mesh); held = null; } if (carve) { scene.remove(carve.ball); carve = null; } tool = null; S.aim = null; clearBuild(); showIntroCast(); glideTo(wideShot(), 1.4);
    say(eod ? KP.name + ': "EMPLOYEE OF THE DAY! Look at those towers!"' : S.served >= 3 ? KP.name + ': "Good shift. Same time tomorrow?"' : KP.name + ': "Rough one. The gelato forgives you."', 6); orders.forEach(o => { if (o.st !== 'leave') { o.st = 'leave'; o.t = 0; } }); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); sfx('buy'); if (S.done) S.done.gold = save.data.gold; return true; }

  // ---------- VOICE HINTS (accessibility): speaks new orders, the next step and how customers felt. Saved per player (flag gelatoVoice). ----------
  const VO = { on: !!save.flag('gelatoVoice'), last: '', pend: '', t: 0 };
  const speak = (txt, now) => { if (!VO.on || !window.speechSynthesis || !txt) return; try { if (now) speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt.toLowerCase().replace(/·/g, ',').replace(/\bg\b/g, ' gold')); u.rate = 1.08; u.pitch = 1.05; speechSynthesis.speak(u); } catch (e) {} };
  function stepVoice(dt) { if (!VO.on) return; const t = DM.on ? (DM.cap || '') : HINT && HINT.text && S.phase === 'shift' ? HINT.text : ''; if (t !== VO.pend) { VO.pend = t; VO.t = 0; } VO.t += dt; if (VO.pend && VO.pend !== VO.last && VO.t > 0.7) { VO.last = VO.pend; speak(VO.pend.replace(/ · \d+ \/ \d+$/, '')); } }
  const sayOrder = o => speak(CUST[o.ci].name + ' wants a ' + VESSELS[o.vessel].name + ' with ' + o.flavours.map(k => FLAVOURS[k].name).join(' and ') + (o.sauce ? ', ' + SAUCES[o.sauce].name : '') + (o.sprinkles ? ', sprinkles' : '') + (o.wafer ? ', and a wafer' : ''));

  // ---------- per frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false; const _cam = V3();
  function step(dt) { const walk = S.phase === 'walk', lr = k => Math.min(1, dt * k);
    if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position, sh = shotFor('react' + o.spot, () => [V3(f.x - 0.45, 1.2, f.z), V3(f.x + 0.45, 1.2, f.z), V3(f.x, 2.35, f.z), V3(f.x, 1.5, f.z - 0.3)], 0.12, 0.12, 0.1); camera.position.lerp(sh.pos, lr(5)); CAM.look.lerp(sh.look, lr(5)); if (S.react.t > (DM.on ? 2.0 : 2.6)) reactDone(); }
    else if (carve && S.phase === 'shift') { const t = carve.t, sh = shotFor('tub' + t.k, () => [V3(t.x - 0.36, TOP, t.z - 0.2), V3(t.x + 0.36, TOP, t.z - 0.2), V3(t.x - 0.36, TOP, t.z + 0.2), V3(t.x + 0.36, TOP, t.z + 0.2), V3(t.x, TOP + 0.3, t.z)], 1.0, 0, 0.12); camera.position.lerp(sh.pos, lr(3)); CAM.look.lerp(sh.look, lr(3)); }
    else if (S.pay || S.payOut) { const port = CW() < CHh(), sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0.25, 0.07); camera.position.lerp(sh.pos, lr(5)); CAM.look.lerp(sh.look, lr(5)); regDisp.scale.set(port ? 0.36 : 0.46, port ? 0.133 : 0.17, 1); }
    else if (CAM.t < 1 && CAM.from && !walk) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if (walk) stepWalk(dt);
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) { const w = wideShot(); camera.position.lerp(w.pos, lr(4)); CAM.look.lerp(w.look, lr(4)); }
    else if (S.phase === 'shift' || S.phase === 'glide') { const w = workShot(); camera.position.lerp(w.pos, lr(4)); CAM.look.lerp(w.look, lr(4)); }
    camera.lookAt(CAM.look); _cam.copy(camera.position);
    // cut-away: any wall the camera is behind disappears (so a world camera, a walk camera or the work camera all see in)
    for (const w of Object.values(K.walls)) w.g.visible = (_cam.x - w.p[0]) * w.n[0] + (_cam.z - w.p[1]) * w.n[1] > -0.05;
    const inside = Math.abs(_cam.x) < K.W / 2 && Math.abs(_cam.z) < K.D / 2 && _cam.y < K.H - 0.1, work = S.phase === 'shift' || S.phase === 'glide';
    K.ceil.visible = inside && !work; K.cut.forEach(m => { if (m !== K.ceil) m.visible = !work || (CAM.t < 0.35 && !!CAM.from); }); lampGl.forEach(s => s.visible = !work); { const bv = !work && _cam.y < 3.1; if (K.bunting[0].visible !== bv) K.bunting.forEach(f => f.visible = bv); } K.glass.visible = !work || S.focus === 'all' || S.focus === 'serve';
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    lampGl.forEach((s, i) => s.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 2 + i) * 0.04);
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) S.phase = 'shift'; }
    const shift = S.phase === 'shift'; if (shift) { S.t += dt; const left = Math.ceil(GELATO.shift - S.t); if (!DM.on && left <= 10 && left > 0 && left !== S.tick) { S.tick = left; sfx('tick', { hi: left <= 3 }); } if (S.t >= GELATO.shift && !DM.on) endShift(); }
    if (DM.on) demoStep(dt);
    stepBuild(dt); stepTools(dt);
    if (S.autoBack > 0) { S.autoBack -= dt; if (S.autoBack <= 0 && !held && !tool && !carve) { const h = nextHint(); if (h && h.station === 'case') S.focus = 'case'; } }
    updHint(dt); if (shift) autoFollow();
    regDisp.visible = !!(S.pay || S.payOut); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; sfx('coin', { v: 1, gap: 0.03 }); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, K.top + 0.11, K.caseZ + 0.35); coinsOut.forEach(m => m.position.lerp(to, lr(4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), lr(6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    // customers
    if (shift) { S.next -= dt; const maxQ = DM.on ? 1 : Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st !== 'leave').length < maxQ && S.t < GELATO.shift - 12) { newOrder(DM.on ? DM.specs.shift() : null); S.next = DM.on ? 1.5 : Math.max(8, 17 - S.day * 1.5) * rr(0.8, 1.2); } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot], f = o.f; o.t += dt; let spd = 0;
      if (o.st === 'walk') { const dx = sp.x - f.position.x, dz = sp.z - f.position.z, d = Math.hypot(dx, dz); if (d > 0.04) { const v = Math.min(d, 2.4 * dt); f.position.x += dx / d * v; f.position.z += dz / d * v; f.rotation.y = Math.atan2(dx, dz); spd = 2; } else { o.st = 'wait'; say(CUST[o.ci].name + ': "' + o.line + '"', 3); sfx('order'); sayOrder(o); } }
      else if (o.st === 'wait' || o.st === 'pay') { f.rotation.y = damp(f.rotation.y, Math.PI, 8, dt); if (o.st === 'wait' && shift) { o.pat -= DM.on ? 0 : dt; f.userData.mood = o.pat / o.patMax < 0.3 ? 'stern' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; S.combo = 0; flash(CUST[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); sfx('unhappy'); } } }
      else if (o.st === 'leave') { const tx = K.door.x, tz = K.door.z + 0.6, dx = tx - f.position.x, dz = tz - f.position.z, d = Math.hypot(dx, dz); if (o.t > 0.6 && d > 0.15) { const v = Math.min(d, 1.9 * dt); f.position.x += dx / d * v; f.position.z += dz / d * v; f.rotation.y = Math.atan2(dx, dz); spd = 2; } if (d <= 0.15 || o.t > 9) { f.visible = false; nameTags[o.ci].visible = false; f.userData.hold = null; if (o.cone) o.cone.parent && o.cone.parent.remove(o.cone); orders.splice(i, 1); continue; } }
      { const tg = nameTags[o.ci]; tg.visible = shift && !S.react && !S.pay && o.st !== 'leave'; tg.position.set(f.position.x, 2.5, f.position.z); tg.material.color.set(o.st === 'wait' && o.pat / o.patMax < 0.3 ? '#ff6a5a' : '#ffffff'); }
      kit.animFox && kit.animFox(f, dt, spd); if (o.cone && Math.sin(o.t * 3) > 0.95) f.userData.P.head.rotation.x = 0.25; }
    // the cast idles: Ben waves on the welcome card, regulars lick their cones, anyone who was waved at waves back
    const greet = S.phase === 'intro' || S.phase === 'done';
    if (benWork.visible) { kit.animFox && kit.animFox(benWork, dt, 0); benWork.userData.mood = greet ? 'excited' : 'happy'; if (greet) benWork.userData.P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32); }
    if (keeper.visible) { kit.animFox && kit.animFox(keeper, dt, 0); if (!walk) keeper.userData.lookAt = benWork.visible ? V3(benWork.position.x, 1.6, benWork.position.z) : null; }
    for (const d of idlers) { if (!d.f.visible) continue; d.t += dt; kit.animFox && kit.animFox(d.f, dt, 0); const lick = (d.t % 3.2) < 0.5; d.f.userData.P.head.rotation.x = lick ? 0.32 : d.f.userData.P.head.rotation.x; d.cone.rotation.x = damp(d.cone.rotation.x, lick ? -0.5 : 0, 10, dt); }
    for (const f of [keeper, ...idlers.map(d => d.f)]) if (f.userData.waveT > 0) { f.userData.waveT -= dt; f.userData.P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 8) * 0.35); }
    stepFx(dt); stepMusic(); stepVoice(dt); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE && !document.hidden) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } const onVis = () => { try { if (!audio.ctx) return; if (document.hidden) audio.ctx.suspend(); else audio.ctx.resume(); } catch (e) {} }; document.addEventListener('visibilitychange', onVis);
  addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- what the page draws ----------
  function hud() { const o0 = topOrder(), com = comOf(B.scoops), lean = B.scoops.length ? Math.abs(com) / L_LEAN() : 0;
    const ticket = o => ({ id: o.id, name: CUST[o.ci].name, vessel: VESSELS[o.vessel].name, scoops: o.flavours.map(k => ({ t: FLAVOURS[k].name, col: FLAVOURS[k].col })), extras: [...(o.sauce ? [SAUCES[o.sauce].short] : []), ...(o.sprinkles ? ['SPRINKLES'] : []), ...(o.wafer ? ['WAFER'] : [])], total: o.total, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait', top: o === o0 });
    const badges = { all: orders.filter(o => o.st === 'wait').length ? orders.filter(o => o.st === 'wait').length + ' WAIT' : '', case: carve ? 'CARVING' : held ? 'DROP IT' : '', cone: B.vessel ? B.scoops.length + ' ON' + (B.scoops.length && lean > 0.6 ? ' · WOBBLY' : '') : '', tops: B.sauce ? Math.round(coverage() * 100) + '%' + (B.spr ? ' · ' + B.spr : '') : B.spr ? B.spr + ' SPR' : '', serve: o0 && B.scoops.length && !need(o0).length ? 'READY' : B.scoops.some(q => q.melt > 0.55) ? 'MELTING' : '' };
    return { phase: S.phase, day: S.day, left: Math.max(0, GELATO.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), shop: GELATO.name, keeper: KP.name,
      build: { vessel: B.vessel ? VESSELS[B.vessel].name : '', scoops: B.scoops.map(q => ({ t: FLAVOURS[q.key].name, col: FLAVOURS[q.key].col })), sauce: B.sauce ? SAUCES[B.sauce].short : '', cov: Math.round(coverage() * 100), spr: B.spr, wafer: !!B.wafer, lean: Math.round(lean * 100), melt: B.scoops.length ? Math.round(Math.max(...B.scoops.map(q => q.melt)) * 100) : 0 },
      carve: carve ? { r: carve.r, zone: carveZone(carve.r), lo: (R_TARGET - R_BAND()) / R_MAX, hi: (R_TARGET + R_BAND()) / R_MAX, v: carve.r / R_MAX, name: FLAVOURS[carve.key].name } : null,
      held: held ? { name: FLAVOURS[held.key].name, pr: predict(heldX(), held.r) } : null,
      flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, muted: !!audio.muted, voice: VO.on, best: save.stat(SAVE.best, 0), embed: !!opts.embed, uniform: !!save.flag('gelatoUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })),
      menu: flavAvail().map(k => FLAVOURS[k].name), extras: [...vesAvail().map(k => VESSELS[k].name + 'S'), ...sauceAvail().map(k => SAUCES[k].short), ...Object.keys(EXTRAS).filter(k => EXTRAS[k].day <= S.day).map(k => EXTRAS[k].name)],
      demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null, focus: S.focus, hint: HINT && HINT.text && !S.react ? { text: HINT.text, station: HINT.station } : null, badges,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip, note: S.react.note } : null, pay: S.pay ? { ...S.pay } : null,
      walk: S.phase === 'walk' ? { prompt: !WK.dialog && WK.near ? (WK.near.f ? 'Talk to ' + WK.near.name : WK.near.name) : null, dialog: dlgView(), toast: WK.toast, en: Math.round(WK.en), quest: nearCase() ? 'GELATO CASE · PRESS 2 TO TASTE A FLAVOUR' : 'TALK TO ' + KP.name + ' TO WORK A SHIFT', place: GELATO.name } : null }; }
  function emit() { onState(hud()); }
  frame();
  const api = { ...walkApi, setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setFocus, demoStart, demoStop, startShift, endShift, giveCoin, buyUpgrade, hud, setPaused(v) { PAUSE = !!v; }, toggleSound() { audio.init && audio.init(); audio.setMuted && audio.setMuted(!audio.muted); }, setVoice(v) { VO.on = !!v; save.setFlag('gelatoVoice', VO.on); if (VO.on) { VO.last = ''; speak('Voice hints on', true); } else try { speechSynthesis.cancel(); } catch (e) {} },
    toIntro() { closeDialog(); if (DM.on) demoStop(); resetShiftStuff(); S.phase = 'intro'; S.done = null; showIntroCast(); glideTo(wideShot(), 1); },
    startWalk(at) { closeDialog(); if (DM.on) demoStop(); resetShiftStuff(); S.done = null; showIntroCast(); benWork.visible = false; benWalk.visible = true; audio.init && audio.init(); if (audio.wind) audio.wind.gain.value = 0;
      if (at === 'here') { WK.p.set(INTRO.x, 0, INTRO.z); WK.yaw = Math.PI; } else { WK.p.set(K.door.x - 0.3, 0, K.door.z - 1.7); WK.yaw = Math.PI; } WK.camYaw = 0.15; WK.look.set(WK.p.x, 1.15, WK.p.z); CAM.from = null; CAM.t = 1; S.phase = 'walk'; },
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, GELATO.shift - t); }, _order: spec => { S.next = 999; newOrder(spec); }, _held: () => held ? { x: heldX(), c: held.c, fly: held.fly, top: topX() } : null, _state: () => S, _cam: () => ({ p: camera.position.toArray().map(v => +v.toFixed(2)), l: CAM.look.toArray().map(v => +v.toFixed(2)), safe: { ...SAFE } }), _B: B, _K: K, _WK: WK, _scr: p => { const r = renderer.domElement.getBoundingClientRect(), s = scr(p); return { x: r.left + s.x, y: r.top + s.y }; }, V3,
    destroy() { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  { const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); camera.lookAt(CAM.look); } showIntroCast();
  return api; }
