// 8 GATES — FOXY GYOZA: THE SHIFT [foxyGyoza]. A gyoza house that drops into ANY world's building, plus the shift game behind its counter.
// Rebuilt in 3D from the 2D 'Foxy Gyoza' night-market cart (food-games/gyoza.html): fill the wrapper, pleat it shut, line the pan, fry the bottoms,
// water + LID ON fast, lid off inside the steam band, sauce to the red line. New in 3D: FLICK the pan to flip the gyoza onto the plate crust-up,
// WIGGLE across the seam to pleat, RUB over the plate to sprinkle scallions, two burners, real customers at the counter, a register for the change.
// WALK-IN: when no shift is running Ben walks around the room (Game HUD joystick on phones, WASD on desktop): talk to KIKO, sit at a table, read the menu.
// MERGE INTO A WORLD: buildGyoza(ctx) builds the whole room at ctx.origin (12 x 10 m, door in the middle of the FRONT wall, +z) and returns K:
//   K.colliders (boxes for walking), K.seats, K.talk points, K.door, K.cut (back wall + ceiling, hidden in the shift), K.front (front wall, hidden for the cutaway).
// createGyozaShift({ container, onState, options: { world, customers, owner, walk, onExit } }) runs it stand-alone and returns the API the page calls
// (and the Game HUD engine contract for walk mode). Save keys: foxy.gyoza.* · flag gyozaUniform.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { gyozaAudio } from './gyoza-audio.js';

export const GYOZA = { name: 'FOXY GYOZA · THE SHIFT', room: 'foxyGyoza', shift: 180, plate: 5, W: 12, D: 10 };
export const FILLINGS = {
  pork: { name: 'PORK', day: 1, price: 8, col: '#f0a0a8', dot: '#e0567a' },
  veg: { name: 'VEGGIE', day: 2, price: 7, col: '#9ad46a', dot: '#3f9a2a' },
  shrimp: { name: 'SHRIMP', day: 3, price: 10, col: '#ffb07a', dot: '#ff7a1a' } };
// crust zones come straight from the 2D cart (22-38 / 46-64 / 72-88 out of 100)
export const CRUST = {
  light: { name: 'LIGHT', day: 1, lo: 0.22, hi: 0.38, col: '#e2b878' },
  golden: { name: 'GOLDEN', day: 1, lo: 0.46, hi: 0.64, col: '#c98a3c' },
  dark: { name: 'DARK', day: 3, lo: 0.72, hi: 0.88, col: '#8a5a20' } };
export const EXTRAS = { chili: { name: 'CHILI OIL', day: 2, price: 1, need: 3 }, scallion: { name: 'SCALLIONS', day: 3, price: 1 } };
export const UPGRADES = [
  { id: 'burner2', name: 'SECOND BURNER', cost: 40, line: 'Two pans on the stove at once.' },
  { id: 'spoon', name: 'BIG SPOON', cost: 30, line: 'The green fill zone is wider.' },
  { id: 'press', name: 'PLEAT PRESS', cost: 35, line: 'Two fewer pleats to seal each gyoza.' },
  { id: 'bell', name: 'KITCHEN TIMER', cost: 30, line: 'A wider steam band, and a ping in every zone.' },
  { id: 'lanterns', name: 'PAPER LANTERNS', cost: 60, line: 'Happy customers wait 20% longer.' }];
// the 2D cart's four regulars first; a world can pass its own townsfolk in options.customers
export const DEFAULT_CUSTOMERS = [
  { name: 'YUZU', role: 'Regular', fur: '#ee7d24', furDark: '#b8531a', torso: ['#1f3350', '#e6ecf4', '#16263c'] },
  { name: 'MOCHI', role: 'Night owl', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#4a3a5c', '#ede9fe', '#332745'], outfit: 'robe' },
  { name: 'KUMA', role: 'Always hungry', fur: '#c9682a', furDark: '#8a4213', torso: ['#3f5d47', '#e6b45a', '#2b4232'] },
  { name: 'HANA', role: 'Food critic', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#8f2b1e', '#fce7f3', '#661a10'], outfit: 'dress' },
  { name: 'SORA', role: 'Lantern maker', fur: '#d9733a', furDark: '#9a4a22', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] },
  { name: 'TOMO', role: 'Night guard', fur: '#b85a22', furDark: '#7a3612', torso: ['#ffffff', '#e7edf4', '#6b7d93'], outfit: 'armor' },
  { name: 'NORI', role: 'Fisher', fur: '#3a3836', furDark: '#1c1b1a', torso: ['#2f5d2a', '#e6b45a', '#1a3318'], outfit: 'coat' },
  { name: 'PIP', role: 'Kit on an errand', fur: '#f2a24a', furDark: '#c2671a', torso: ['#f472b6', '#fce7f3', '#9d174d'] }];
const LINES = { order: ['Five gyoza, please!', 'Crispy bottoms, yes?', 'I could smell these from the street.', 'The usual!', 'Make them golden!', 'Starving. Go go go!'] , angry: ['Too slow!', 'I am going home hungry.', 'Forget it!'] };
const REACT = {
  thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['Crispy bottoms, juicy middles. PERFECT!', 'These are the best gyoza in the Nine Systems!', 'I am coming back tomorrow. And the day after.'] },
  happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Delicious, thank you!', 'Just how I like them.', 'Mmm. That crust!'] },
  neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['They are fine. Took a while.', 'Okay. Thanks.', 'Hm. Not bad.'] },
  unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['These are not what I asked for...', 'Soggy. Sad.', 'I waited for this?'] },
  insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'angry', lines: ['That is NOT my filling!', 'Do I look like I ordered that?', 'Are you even listening?'] } };
const SAVE = { day: 'foxy.gyoza.day', best: 'foxy.gyoza.best', upg: 'foxy.gyoza.upg.', stars: 'foxy.gyoza.stars' };
export const zoneOf = c => { for (const [k, z] of Object.entries(CRUST)) if (c >= z.lo - 0.04 && c <= z.hi + 0.04) return k; return c < CRUST.light.lo ? 'pale' : c > CRUST.dark.hi ? 'burnt' : c < CRUST.golden.lo ? 'light' : c < CRUST.dark.lo ? 'golden' : 'dark'; };
export const crustCol = c => { const s = [[0, '#f2e2bc'], [0.3, '#e2b878'], [0.55, '#c98a3c'], [0.8, '#8a5a20'], [1.05, '#2a1a10']]; for (let i = 1; i < s.length; i++) if (c <= s[i][0]) { const k = (c - s[i - 1][0]) / (s[i][0] - s[i - 1][0]); return '#' + new THREE.Color(s[i - 1][1]).lerp(new THREE.Color(s[i][1]), clamp(k, 0, 1)).getHexString(); } return s[s.length - 1][1]; };

// ---------------- gyoza art: flat wrapper with a filling mound, the folded crescent with its pleats, a crust you see when it is flipped ----------------
export function gyozaArt(T3, toon, outline) {
  const bend = (geo, k) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, p.getZ(i) + k * x * x - k * 0.006); } geo.computeVertexNormals(); return geo; };
  const domeG = bend((() => { const g = new T3.SphereGeometry(0.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2); g.scale(1.12, 0.72, 0.5); return g; })(), 5.5);
  const crustG = bend((() => { const g = new T3.CylinderGeometry(0.1, 0.1, 0.012, 24, 1); g.scale(1.1, 1, 0.48); g.translate(0, 0.004, 0); return g; })(), 5.5);
  const pleatG = new T3.SphereGeometry(0.017, 8, 6), wrapG = new T3.CylinderGeometry(0.115, 0.115, 0.006, 28), moundG = new T3.SphereGeometry(0.06, 14, 10), dotG = new T3.SphereGeometry(0.011, 8, 6);
  const skin = toon('#f8f0e0'), crustCache = new Map();
  const crustMat = c => { const k = Math.round(clamp(c, 0, 1.1) * 20); if (!crustCache.has(k)) { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const x = cv.getContext('2d'), mid = crustCol(k / 20), rim = crustCol(Math.min(1.1, k / 20 + 0.22)), gr = x.createRadialGradient(32, 32, 4, 32, 32, 32); gr.addColorStop(0, crustCol(Math.max(0, k / 20 - 0.08))); gr.addColorStop(0.55, mid); gr.addColorStop(1, rim); x.fillStyle = gr; x.fillRect(0, 0, 64, 64); for (let i = 0; i < 60; i++) { x.fillStyle = 'rgba(60,30,10,' + Math.random() * 0.35 + ')'; x.fillRect(Math.random() * 64, Math.random() * 64, 1.5, 1.5); } const t = new T3.CanvasTexture(cv); t.colorSpace = T3.SRGBColorSpace; crustCache.set(k, new T3.MeshToonMaterial({ map: t, gradientMap: skin.gradientMap })); } return crustCache.get(k); };
  function folded({ fill = 'pork', crust = 0, pleats = 7, shown = pleats, dot = true } = {}) {
    const g = new T3.Group(), body = new T3.Mesh(domeG, skin); body.castShadow = true; if (outline) outline(body, 0.008); g.add(body);
    const cr = new T3.Mesh(crustG, crustMat(crust)); g.add(cr); g.userData.crust = cr;
    const ps = []; for (let i = 0; i < pleats; i++) { const t = pleats > 1 ? i / (pleats - 1) : 0.5, x = (t - 0.5) * 0.17, m = new T3.Mesh(pleatG, skin); m.position.set(x, 0.066 - Math.abs(x) * 0.22, 5.5 * x * x - 0.033 - 0.002); m.scale.set(0.85, 0.7, 1.3); m.rotation.y = (i % 2 ? 0.5 : -0.5); m.visible = i < shown; if (outline) outline(m, 0.004, 0.017); g.add(m); ps.push(m); }
    g.userData.setPleats = n => ps.forEach((m, i) => m.visible = i < n);
    if (dot) { const d = new T3.Mesh(dotG, toon(FILLINGS[fill].dot)); d.position.set(0, 0.078, -0.03); g.add(d); }
    g.userData.setCrust = c => { cr.material = crustMat(c); };
    return g; }
  function wrapper(fill = 'pork') { const g = new T3.Group(), w = new T3.Mesh(wrapG, skin); w.castShadow = true; if (outline) outline(w, 0.006, 0.115); g.add(w); const m = new T3.Mesh(moundG, toon(FILLINGS[fill].col)); m.position.y = 0.004; m.scale.set(0.01, 0.01, 0.01); g.add(m); g.userData.mound = m; g.userData.setFill = v => { const s = Math.max(0.01, v); m.scale.set(s * 1.15, s * 0.55, s * 0.85); m.position.y = 0.004 + s * 0.012; }; g.userData.setFilling = f => { m.material = toon(FILLINGS[f].col); }; return g; }
  return { folded, wrapper };
}

// ---------------- the room (shared by the stand-alone page and any world) ----------------
export function buildGyoza(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, grad } = ctx, ox = origin.x || 0, oz = origin.z || 0;
  const root = new T3.Group(); root.position.set(ox, 0, oz); scene.add(root);
  const W = GYOZA.W, D = GYOZA.D, H = 3.8, KZ = -2.6, at = (x, z) => ({ x: x + ox, z: z + oz });
  const wood = toon('#7a4a2a'), woodD = toon('#4a2c1a'), woodL = toon('#b07a4a'), ink = toon('#201e1d'), red = toon('#c8102e'), indigo = toon('#1f2b4a'), cream = toon('#f3e9d6'), steel = toon('#c9ced4'), steelD = toon('#5b636b');
  const K = { root, z: KZ, W, D, H, cut: [], front: [], booths: [], colliders: [], seats: [], talk: {}, door: at(0, D / 2), origin: { x: ox, z: oz } };
  const box = (x0, z0, x1, z1) => K.colliders.push({ x0: Math.min(x0, x1) + ox, z0: Math.min(z0, z1) + oz, x1: Math.max(x0, x1) + ox, z1: Math.max(z0, z1) + oz });
  // floor: warm planks
  const floorT = CTX(256, 256, c => { c.fillStyle = '#8a5a34'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = ['#94623a', '#7e5030', '#8a5a34', '#9a6a40'][i % 4]; c.fillRect(0, i * 32, 256, 31); c.fillStyle = '#5a3820'; c.fillRect(0, i * 32 + 31, 256, 1); c.fillRect((i * 97) % 256, i * 32, 2, 32); } });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2.4, D / 2.4);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  // walls: cream plaster over a dark wood wainscot, posts every 2 m
  const wallT = CTX(256, 256, c => { c.fillStyle = '#efe2c8'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#4a2c1a'; c.fillRect(0, 168, 256, 88); c.fillStyle = '#6a4028'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 172, 3, 84); c.fillStyle = '#c8102e'; c.fillRect(0, 160, 256, 8); c.fillStyle = '#4a2c1a'; c.fillRect(0, 0, 256, 6); c.fillRect(0, 0, 8, 256); });
  wallT.wrapS = T3.RepeatWrapping; const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: grad }); const wallTS = wallT.clone(); wallTS.needsUpdate = true; wallTS.repeat.set(W / 2, 1); wallT.repeat.set(D / 2, 1); const wallMB = new T3.MeshToonMaterial({ map: wallTS, gradientMap: grad });
  { const b = new T3.Mesh(new T3.PlaneGeometry(W, H), wallMB); b.position.set(0, H / 2, -D / 2); root.add(b); K.cut.push(b); }
  for (const s of [-1, 1]) { const m = new T3.Mesh(new T3.PlaneGeometry(D, H), wallM); m.position.set(s * W / 2, H / 2, 0); m.rotation.y = -s * Math.PI / 2; root.add(m); }
  { const fc = root.children.length; for (const s of [-1, 1]) { const m = new T3.Mesh(new T3.PlaneGeometry(W / 2 - 0.9, H), wallMB.clone()); m.material.map = wallTS.clone(); m.material.map.needsUpdate = true; m.material.map.repeat.set((W / 2 - 0.9) / 2, 1); m.position.set(s * (W / 4 + 0.45), H / 2, D / 2); m.rotation.y = Math.PI; root.add(m); }
    M(new T3.BoxGeometry(1.8, H - 2.7, 0.12), woodD, 0, 2.7 + (H - 2.7) / 2, D / 2 - 0.02, root, 0.01);
    // front windows: warm lit lattice
    const latT = CTX(128, 128, c => { c.fillStyle = '#ffe9b8'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#4a2c1a'; for (let i = 0; i <= 128; i += 32) { c.fillRect(i - 3, 0, 6, 128); c.fillRect(0, i - 3, 128, 6); } });
    for (const s of [-1, 1]) { const w = new T3.Mesh(new T3.PlaneGeometry(2.6, 1.6), new T3.MeshBasicMaterial({ map: latT })); w.position.set(s * 3.4, 1.9, D / 2 - 0.03); w.rotation.y = Math.PI; root.add(w); M(new T3.BoxGeometry(2.8, 0.12, 0.14), woodD, s * 3.4, 1.06, D / 2 - 0.08, root, 0.01); }
    // noren curtain over the door (inside): indigo panels, a white dumpling circle
    const norT = CTX(256, 128, c => { c.fillStyle = '#1f2b4a'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#f3e9d6'; c.beginPath(); c.arc(128, 64, 40, 0, 7); c.fill(); c.fillStyle = '#1f2b4a'; c.beginPath(); c.ellipse(128, 74, 26, 14, 0, Math.PI, 0); c.fill(); c.strokeStyle = '#f3e9d6'; c.lineWidth = 3; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(128 + i * 9, 62); c.lineTo(128 + i * 9 + 4, 56); c.stroke(); } });
    for (let i = 0; i < 3; i++) { const p = new T3.Mesh(new T3.PlaneGeometry(0.56, 0.8), new T3.MeshToonMaterial({ map: norT, gradientMap: grad, side: T3.DoubleSide })); p.material.map = norT.clone(); p.material.map.needsUpdate = true; p.material.map.offset.set(i / 3, 0); p.material.map.repeat.set(1 / 3, 1); p.position.set(-0.58 + i * 0.58, 2.3, D / 2 - 0.12); p.rotation.y = Math.PI; root.add(p); }
    M(new T3.CylinderGeometry(0.025, 0.025, 1.9, 6), woodD, 0, 2.72, D / 2 - 0.12, root, 0).rotation.z = Math.PI / 2;
    K.front.push(...root.children.slice(fc)); }
  K.ceil = [M(new T3.BoxGeometry(W, 0.16, D), toon('#5a3a24'), 0, H + 0.08, 0, root, 0)];
  for (let i = -2; i <= 2; i++) K.ceil.push(M(new T3.BoxGeometry(0.18, 0.2, D), woodD, i * 2.4, H - 0.1, 0, root, 0)); K.cut.push(...K.ceil);
  // side windows (shoji, glowing)
  const shoT = CTX(128, 128, c => { c.fillStyle = '#fff4dc'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#6a4028'; for (let i = 0; i <= 128; i += 21) { c.fillRect(i - 2, 0, 4, 128); } for (let i = 0; i <= 128; i += 32) c.fillRect(0, i - 2, 128, 4); });
  for (const s of [-1, 1]) for (const z of [0.8, 3.2]) { const w = new T3.Mesh(new T3.PlaneGeometry(1.6, 1.5), new T3.MeshBasicMaterial({ map: shoT })); w.position.set(s * (W / 2 - 0.03), 1.95, z); w.rotation.y = -s * Math.PI / 2; root.add(w); }
  // ---------- KITCHEN (back): work counter, stove with two burners, fold station, sauce station, back counter ----------
  K.top = 1.01; const T = K.top;
  // surface textures: brushed steel tops, plank fronts, kitchen tiles, soft contact shadows
  const steelT = CTX(256, 256, c => { c.fillStyle = '#c9ced4'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 260; i++) { const y = Math.random() * 256, a = Math.random() * 0.12; c.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,' + a + ')' : 'rgba(80,90,100,' + a + ')'; c.fillRect(0, y, 256, 1 + Math.random() * 1.5); } }); steelT.wrapS = steelT.wrapT = T3.RepeatWrapping; steelT.repeat.set(4, 1);
  const steelTop = new T3.MeshToonMaterial({ map: steelT, gradientMap: grad });
  const plankT = CTX(256, 128, c => { c.fillStyle = '#4a2c1a'; c.fillRect(0, 0, 256, 128); for (let i = 0; i < 8; i++) { c.fillStyle = ['#53321e', '#46291a', '#4e2f1c', '#583520'][i % 4]; c.fillRect(i * 32 + 1, 0, 30, 128); c.fillStyle = 'rgba(0,0,0,0.35)'; c.fillRect(i * 32, 0, 2, 128); } c.fillStyle = '#c8102e'; c.fillRect(0, 0, 256, 7); c.fillStyle = '#e6b45a'; c.fillRect(0, 7, 256, 2); }); plankT.wrapS = T3.RepeatWrapping; plankT.repeat.set(6, 1);
  const plankM = new T3.MeshToonMaterial({ map: plankT, gradientMap: grad });
  { const tileT = CTX(128, 128, c => { c.fillStyle = '#2f3438'; c.fillRect(0, 0, 128, 128); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#3d444a' : '#353b40'; c.fillRect(x * 32 + 1, y * 32 + 1, 30, 30); } }); tileT.wrapS = tileT.wrapT = T3.RepeatWrapping; tileT.repeat.set(W / 1.2, 3.2 / 1.2);
    const kf = new T3.Mesh(new T3.PlaneGeometry(W, 3.2), new T3.MeshToonMaterial({ map: tileT, gradientMap: grad })); kf.rotation.x = -Math.PI / 2; kf.position.set(0, 0.003, -D / 2 + 1.6); kf.receiveShadow = true; root.add(kf); }
  const blobT = CTX(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  K.blobT = blobT; K.blob = (x, z, r, y = T + 0.002) => { const m = new T3.Mesh(new T3.PlaneGeometry(r * 2, r * 2), new T3.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x - ox, y, z - oz); m.renderOrder = 1; root.add(m); return m; };
  { const bc = M(new T3.BoxGeometry(W - 0.6, 0.92, 0.7), steel, 0, 0.46, KZ - 1.65, root, 0.02); K.cut.push(bc); box(-W / 2, KZ - 2.0, W / 2, KZ - 1.3);
    // back counter clutter: stock pot, rice cooker, a rack of ladles, shelves (all cut away in the shift)
    K.cut.push(M(new T3.CylinderGeometry(0.32, 0.3, 0.55, 18), steelD, 2.4, 0.92 + 0.275, KZ - 1.7, root, 0.015, 0.32));
    K.cut.push(M(new T3.CylinderGeometry(0.22, 0.24, 0.32, 16), toon('#f3e9d6'), -1.6, 0.92 + 0.16, KZ - 1.7, root, 0.012, 0.24));
    for (const y of [1.9, 2.5]) K.cut.push(M(new T3.BoxGeometry(W - 1.2, 0.06, 0.4), woodL, 0, y, -D / 2 + 0.22, root, 0.01));
    for (let i = 0; i < 9; i++) K.cut.push(M(new T3.CylinderGeometry(0.09, 0.09, 0.18, 10), toon(['#c8102e', '#f3e9d6', '#1f2b4a'][i % 3]), -4 + i, 2.02, -D / 2 + 0.22, root, 0.008, 0.09));
    for (let i = 0; i < 6; i++) K.cut.push(M(new T3.BoxGeometry(0.22, 0.34, 0.22), toon(['#e6b45a', '#3f6b2a', '#c98a3c'][i % 3]), -3.5 + i * 1.4, 2.73, -D / 2 + 0.22, root, 0.008)); }
  // the work counter (one block the customers face): wood front, steel top
  M(new T3.BoxGeometry(6.6, 0.95, 1.75), plankM, 0, 0.475, KZ + 0.2, root, 0.03); M(new T3.BoxGeometry(6.7, 0.06, 1.85), steelTop, 0, 0.98, KZ + 0.2, root, 0.015); M(new T3.BoxGeometry(6.72, 0.025, 0.03), toon('#8a939b'), 0, 1.0, KZ - 0.73, root, 0);
  box(-3.35, KZ - 0.72, 3.35, KZ + 1.7);
  // FOLD station (left): wrapper stack, folding board, three filling bowls, ready tray
  K.wrapStack = at(3.0, KZ - 0.35); M(new T3.CylinderGeometry(0.13, 0.13, 0.09, 24), toon('#f6efe0'), K.wrapStack.x - ox, T + 0.045, K.wrapStack.z - oz, root, 0.008, 0.13);
  for (let i = 0; i < 6; i++) M(new T3.CylinderGeometry(0.131, 0.131, 0.002, 24), toon('#e2d6be'), K.wrapStack.x - ox, T + 0.012 + i * 0.014, K.wrapStack.z - oz, root, 0);
  K.board = at(2.25, KZ + 0.02); M(new T3.BoxGeometry(0.72, 0.035, 0.6), new T3.MeshToonMaterial({ gradientMap: grad, map: CTX(128, 128, c => { c.fillStyle = '#e2c493'; c.fillRect(0, 0, 128, 128); c.fillStyle = 'rgba(160,110,60,0.25)'; for (let i = 0; i < 9; i++) c.fillRect(0, i * 14 + 3, 128, 2); for (let i = 0; i < 380; i++) { c.fillStyle = 'rgba(255,255,255,' + (Math.random() * 0.5) + ')'; const r = Math.random() * 2.2; c.fillRect(40 + Math.random() * 50 + (Math.random() - 0.5) * 40, 30 + Math.random() * 70, r, r); } }) }), K.board.x - ox, T + 0.018, K.board.z - oz, root, 0.01);
  for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.7, 0.002, 0.004), toon('#d4b98a'), K.board.x - ox, T + 0.036, K.board.z - oz - 0.21 + i * 0.14, root, 0);
  K.bowls = {}; ['pork', 'veg', 'shrimp'].forEach((k, i) => { const x = 2.85 - i * 0.6, z = KZ + 0.74; M(new T3.CylinderGeometry(0.2, 0.14, 0.13, 20), toon(['#f3e9d6', '#1f2b4a', '#c8102e'][i]), x, T + 0.065, z, root, 0.01, 0.2); const f = M(new T3.SphereGeometry(0.17, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(FILLINGS[k].col), x, T + 0.1, z, root, 0); f.scale.y = 0.45; M(new T3.BoxGeometry(0.03, 0.01, 0.28), steel, x + 0.08, T + 0.2, z - 0.06, root, 0.004).rotation.set(0.6, 0.3, 0); K.bowls[k] = at(x, z); });
  K.tray = at(1.1, KZ + 0.02); M(new T3.BoxGeometry(0.62, 0.03, 1.02), toon('#3a3836'), K.tray.x - ox, T + 0.015, K.tray.z - oz, root, 0.008); M(new T3.BoxGeometry(0.56, 0.006, 0.96), toon('#f0e6d0'), K.tray.x - ox, T + 0.033, K.tray.z - oz, root, 0);
  K.traySlots = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 2; c++) K.traySlots.push(at(K.tray.x - ox + (c ? 0.13 : -0.13), K.tray.z - oz - 0.38 + r * 0.19));
  // STOVE (centre): two burners, pans live on them; water jug between
  K.pans = [at(0.1, KZ + 0.05), at(-1.0, KZ + 0.05)];
  for (const p of K.pans) { M(new T3.BoxGeometry(0.96, 0.04, 0.96), ink, p.x - ox, T + 0.02, p.z - oz, root, 0.01); const ring = new T3.Mesh(new T3.TorusGeometry(0.24, 0.018, 6, 28), toon('#3a3836')); ring.rotation.x = Math.PI / 2; ring.position.set(p.x - ox, T + 0.045, p.z - oz); root.add(ring); M(new T3.CylinderGeometry(0.035, 0.035, 0.05, 10), red, p.x - ox + 0.36, T + 0.03, p.z - oz + 0.52, root, 0.006).rotation.x = Math.PI / 2; }
  K.jug = at(-0.45, KZ + 0.74);
  { const j = new T3.Group(); j.position.set(K.jug.x - ox, T, K.jug.z - oz); root.add(j); M(new T3.CylinderGeometry(0.09, 0.11, 0.24, 16), steel, 0, 0.12, 0, j, 0.008, 0.11); M(new T3.CylinderGeometry(0.085, 0.085, 0.005, 16), toon('#7fc8ff'), 0, 0.2, 0, j, 0); M(new T3.ConeGeometry(0.03, 0.08, 8), steel, 0, 0.21, -0.1, j, 0.005).rotation.x = -1.1; const h = new T3.Mesh(new T3.TorusGeometry(0.06, 0.012, 6, 12, Math.PI), steelD); h.position.set(0, 0.13, 0.1); h.rotation.set(0, Math.PI / 2, Math.PI / 2); j.add(h); K.jugMesh = j; }
  // SAUCE station (right): plate spot, plate stack, soy bottle, chili oil jar, scallion bowl
  K.plate = at(-2.22, KZ + 0.0); M(new T3.BoxGeometry(0.8, 0.012, 0.8), new T3.MeshToonMaterial({ gradientMap: grad, map: CTX(128, 128, c => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#c9a45e' : '#b8924c'; c.fillRect(0, i * 8, 128, 8); c.fillStyle = 'rgba(70,45,20,0.5)'; c.fillRect(0, i * 8 + 7, 128, 1); } c.fillStyle = '#1f2b4a'; c.fillRect(0, 0, 6, 128); c.fillRect(122, 0, 6, 128); }) }), K.plate.x - ox, T + 0.006, K.plate.z - oz, root, 0);
  K.plates = at(-1.72, KZ + 0.66); for (let i = 0; i < 5; i++) M(new T3.CylinderGeometry(0.26, 0.22, 0.022, 24), toon('#fbfbf7'), K.plates.x - ox, T + 0.012 + i * 0.024, K.plates.z - oz, root, 0.006, 0.22);
  K.soy = at(-2.98, KZ + 0.08); K.chili = at(-2.98, KZ - 0.4); K.scal = at(-2.25, KZ - 0.54);
  { const s = new T3.Group(); s.position.set(K.soy.x - ox, T, K.soy.z - oz); root.add(s); M(new T3.CylinderGeometry(0.06, 0.065, 0.2, 14), toon('#2a1a12'), 0, 0.1, 0, s, 0.008, 0.065); M(new T3.CylinderGeometry(0.035, 0.06, 0.06, 14), toon('#2a1a12'), 0, 0.23, 0, s, 0.006); M(new T3.CylinderGeometry(0.03, 0.03, 0.04, 12), red, 0, 0.28, 0, s, 0.005); M(new T3.CylinderGeometry(0.008, 0.008, 0.04, 6), red, 0, 0.315, -0.02, s, 0).rotation.x = -0.6; M(new T3.BoxGeometry(0.1, 0.07, 0.005), toon('#f3e9d6'), 0, 0.1, 0.064, s, 0); K.soyMesh = s; }
  { const c = new T3.Group(); c.position.set(K.chili.x - ox, T, K.chili.z - oz); root.add(c); M(new T3.CylinderGeometry(0.07, 0.07, 0.12, 14), toon('#e2453f', { transparent: true, opacity: 0.92 }), 0, 0.06, 0, c, 0.008, 0.07); M(new T3.CylinderGeometry(0.072, 0.072, 0.03, 14), toon('#201e1d'), 0, 0.135, 0, c, 0.005); M(new T3.BoxGeometry(0.02, 0.2, 0.02), steel, 0.03, 0.2, 0, c, 0.004).rotation.z = -0.3; K.chiliMesh = c; }
  { M(new T3.CylinderGeometry(0.13, 0.09, 0.08, 16), toon('#f3e9d6'), K.scal.x - ox, T + 0.04, K.scal.z - oz, root, 0.008, 0.13); for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.02 + (i % 4) * 0.022; M(new T3.CylinderGeometry(0.012, 0.012, 0.012, 6), toon(i % 3 ? '#5aa83a' : '#b8e08a'), K.scal.x - ox + Math.cos(a) * r, T + 0.085, K.scal.z - oz + Math.sin(a) * r, root, 0); } }
  for (const b of Object.values(K.bowls)) K.blob(b.x, b.z, 0.27); K.blob(K.jug.x, K.jug.z, 0.17); K.blob(K.soy.x, K.soy.z, 0.12); K.blob(K.chili.x, K.chili.z, 0.12); K.blob(K.scal.x, K.scal.z, 0.18); K.blob(K.plates.x, K.plates.z, 0.33); K.blob(K.wrapStack.x, K.wrapStack.z, 0.19);
  // REGISTER (front right of the work counter)
  K.register = at(-2.75, KZ + 0.95); M(new T3.BoxGeometry(0.42, 0.3, 0.34), ink, K.register.x - ox, T + 0.15, K.register.z - oz, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), toon('#22c55e'), K.register.x - ox, T + 0.34, K.register.z - oz - 0.17, root, 0);
  // the FRONT COUNTER / pass where customers stand: wood with a red lip, five stools
  M(new T3.BoxGeometry(6.4, 1.05, 0.5), plankM, 0, 0.525, KZ + 1.42, root, 0.03); M(new T3.BoxGeometry(6.5, 0.06, 0.62), woodL, 0, 1.08, KZ + 1.42, root, 0.015); M(new T3.BoxGeometry(6.4, 0.08, 0.02), red, 0, 0.9, KZ + 1.68, root, 0);
  K.pass = { z: KZ + 1.42 + oz, y: 1.11 }; K.passSlots = [1.6, 0.6, -0.4].map(x => at(x, KZ + 1.42));
  K.spots = [-1.7, 0, 1.7].map(x => at(x, KZ + 2.4));
  for (let i = 0; i < 5; i++) { const x = -2.6 + i * 1.3; M(new T3.CylinderGeometry(0.05, 0.07, 0.68, 8), woodD, x, 0.34, KZ + 2.95, root, 0); M(new T3.CylinderGeometry(0.23, 0.21, 0.1, 14), red, x, 0.72, KZ + 2.95, root, 0.01); box(x - 0.2, KZ + 2.75, x + 0.2, KZ + 3.15); K.seats.push({ ...at(x, KZ + 2.95), y: 0.77, ry: Math.PI, kind: 'stool' }); }
  // ---------- DINING ROOM: two low tables with benches, lanterns, a lucky fox, plants, the menu stand ----------
  K.tables = [];
  for (const s of [-1, 1]) { const tx = s * 3.7, tz = 2.7, bc = root.children.length; M(new T3.BoxGeometry(1.5, 0.07, 0.9), woodL, tx, 0.74, tz, root, 0.012); for (const dx of [-0.6, 0.6]) for (const dz of [-0.35, 0.35]) M(new T3.BoxGeometry(0.07, 0.72, 0.07), woodD, tx + dx, 0.36, tz + dz, root, 0);
    for (const sz of [-1, 1]) { M(new T3.BoxGeometry(1.5, 0.08, 0.4), wood, tx, 0.45, tz + sz * 0.78, root, 0.012); M(new T3.BoxGeometry(1.4, 0.42, 0.06), woodD, tx, 0.22, tz + sz * 0.78, root, 0); K.seats.push({ ...at(tx - 0.35, tz + sz * 0.78), y: 0.5, ry: sz > 0 ? Math.PI : 0, kind: 'bench' }, { ...at(tx + 0.35, tz + sz * 0.78), y: 0.5, ry: sz > 0 ? Math.PI : 0, kind: 'bench' }); }
    box(tx - 0.8, tz - 1.0, tx + 0.8, tz + 1.0); K.tables.push(at(tx, tz)); K.booths.push(...root.children.slice(bc)); }
  const decoC = root.children.length;
  // menu stand (A-frame by the door) — "Read the menu"
  const menuT = CTX(512, 640, c => { c.fillStyle = '#1f2b27'; c.fillRect(0, 0, 512, 640); c.fillStyle = '#ffd23a'; c.font = '900 60px Archivo, Arial'; c.fillText('FOXY GYOZA', 30, 78); c.fillStyle = '#f2f1e8'; c.font = '700 34px Archivo, Arial'; let y = 150; for (const f of Object.values(FILLINGS)) { c.fillText(f.name + ' GYOZA ×5', 30, y); c.fillText(f.price + 'g', 410, y); y += 56; } c.fillStyle = '#ff9a8a'; c.fillText('CRUST: LIGHT · GOLDEN · DARK', 30, y + 20); c.fillStyle = '#9ad46a'; c.fillText('+ CHILI OIL 1g', 30, y + 80); c.fillText('+ SCALLIONS 1g', 30, y + 130); c.fillStyle = '#f2f1e8'; c.font = '700 28px Archivo, Arial'; c.fillText('Fried on the bottom, steamed on top.', 30, 600); });
  { const g = new T3.Group(); g.position.set(1.7, 0, D / 2 - 1.2); g.rotation.y = Math.PI + 0.35; root.add(g); for (const s of [-1, 1]) { const p = M(new T3.BoxGeometry(0.62, 0.9, 0.04), woodD, 0, 0.5, s * 0.12, g, 0.01); p.rotation.x = s * 0.22; } const face = new T3.Mesh(new T3.PlaneGeometry(0.52, 0.66), new T3.MeshBasicMaterial({ map: menuT })); face.position.set(0, 0.52, 0.152); face.rotation.x = -0.22; g.add(face); box(1.4, D / 2 - 1.5, 2.0, D / 2 - 0.9); K.talk.menu = at(1.7, D / 2 - 1.75); }
  // the big menu board on the back wall (cut away in the shift)
  { const mb = new T3.Mesh(new T3.PlaneGeometry(3.4, 1.0), new T3.MeshBasicMaterial({ map: CTX(1024, 300, c => { c.fillStyle = '#1f2b27'; c.fillRect(0, 0, 1024, 300); c.fillStyle = '#ffd23a'; c.font = '900 88px Archivo, Arial'; c.fillText('FOXY GYOZA', 40, 110); c.fillStyle = '#f2f1e8'; c.font = '700 44px Archivo, Arial'; c.fillText('PORK 8g · VEGGIE 7g · SHRIMP 10g', 40, 200); c.fillStyle = '#ff9a8a'; c.fillText('CRISPY BOTTOMS · JUICY MIDDLES', 40, 268); }) })); mb.position.set(0, 3.15, -D / 2 + 0.05); root.add(mb); K.cut.push(mb, M(new T3.BoxGeometry(3.6, 1.2, 0.05), woodD, 0, 3.15, -D / 2 + 0.01, root, 0.01)); }
  // FOXY GYOZA sign (glowing) on the left wall
  { const st = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); c.font = '900 74px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff6a3a'; c.shadowBlur = 24; c.strokeStyle = '#ff8a5a'; c.lineWidth = 8; c.strokeText('FOXY GYOZA', 256, 66); c.fillStyle = '#fff6e0'; c.fillText('FOXY GYOZA', 256, 66); }); const n = new T3.Mesh(new T3.PlaneGeometry(3.0, 0.75), new T3.MeshBasicMaterial({ map: st, transparent: true, depthWrite: false })); n.position.set(-W / 2 + 0.05, 2.95, 2.0); n.rotation.y = Math.PI / 2; root.add(n); }
  // lucky fox on the front counter (a little waving cat, but a fox)
  { const g = new T3.Group(); g.position.set(2.9, 1.11, KZ + 1.42); g.rotation.y = 0.2; root.add(g); M(new T3.SphereGeometry(0.09, 12, 10), toon('#fbfbf7'), 0, 0.09, 0, g, 0.006, 0.09).scale.set(1, 1.1, 0.9); M(new T3.SphereGeometry(0.07, 12, 10), toon('#fbfbf7'), 0, 0.22, 0, g, 0.006, 0.07); for (const s of [-1, 1]) M(new T3.ConeGeometry(0.03, 0.07, 6), toon('#f2741f'), s * 0.04, 0.3, 0, g, 0.004); M(new T3.BoxGeometry(0.1, 0.02, 0.02), red, 0, 0.16, 0.07, g, 0); const arm = new T3.Group(); arm.position.set(0.07, 0.17, 0); g.add(arm); M(new T3.CapsuleGeometry(0.022, 0.07, 3, 6), toon('#fbfbf7'), 0, 0.05, 0, arm, 0.004); K.luckyArm = arm; }
  // plants by the door
  for (const s of [-1, 1]) { M(new T3.CylinderGeometry(0.22, 0.17, 0.42, 12), toon('#1f2b4a'), s * 1.5, 0.21, D / 2 - 0.45, root, 0.012, 0.22); for (let i = 0; i < 5; i++) { const l = M(new T3.SphereGeometry(0.2, 10, 8), toon(i % 2 ? '#3f8a3a' : '#5aa83a'), s * 1.5 + Math.cos(i * 1.3) * 0.1, 0.6 + i * 0.12, D / 2 - 0.45 + Math.sin(i * 1.3) * 0.1, root, 0.01, 0.2); l.scale.set(1, 1.4, 1); } box(s * 1.5 - 0.25, D / 2 - 0.7, s * 1.5 + 0.25, D / 2 - 0.2); }
  K.booths.push(...root.children.slice(decoC).filter(m => m.position.z > 2.5 + 0 && Math.abs(m.position.x) < 2.6 && m.position.y < 1.5));
  // red paper lanterns (glows added by the game)
  K.lanterns = []; for (const [x, z] of [[-3.7, 2.7], [3.7, 2.7], [-1.7, KZ + 1.9], [0, KZ + 1.9], [1.7, KZ + 1.9], [0, 3.6]]) { const g = new T3.Group(); g.position.set(x, H - 0.95, z); root.add(g); M(new T3.CylinderGeometry(0.005, 0.005, 0.6, 4), ink, 0, 0.6, 0, g, 0); const b = M(new T3.SphereGeometry(0.24, 14, 10), toon('#e8402a', { emissive: new T3.Color('#ff5a2a'), emissiveIntensity: 0.5 }), 0, 0.12, 0, g, 0.012, 0.24); b.scale.y = 1.25; for (const y of [-0.17, 0.41]) M(new T3.CylinderGeometry(0.12, 0.12, 0.05, 12), ink, 0, y, 0, g, 0); for (let i = 0; i < 3; i++) { const r = new T3.Mesh(new T3.TorusGeometry(0.235 - Math.abs(i - 1) * 0.06, 0.006, 4, 20), ink); r.rotation.x = Math.PI / 2; r.position.y = 0.12 + (i - 1) * 0.12; g.add(r); } K.lanterns.push(g); if (z < 0) K.cut.push(g); }
  // ---------- polish: table settings, wall plaques, a framed print, string lights ----------
  const tpC = root.children.length;
  for (const t of K.tables) { const x = t.x - ox, z = t.z - oz; M(new T3.CylinderGeometry(0.035, 0.04, 0.14, 10), toon('#2a1a12'), x + 0.45, 0.85, z - 0.1, root, 0.005); M(new T3.CylinderGeometry(0.02, 0.02, 0.03, 8), red, x + 0.45, 0.935, z - 0.1, root, 0);
    M(new T3.CylinderGeometry(0.045, 0.04, 0.12, 10), toon('#1f2b4a'), x + 0.55, 0.84, z + 0.08, root, 0.005); for (let i = 0; i < 5; i++) { const c = M(new T3.CylinderGeometry(0.005, 0.005, 0.22, 4), toon('#c9a45e'), x + 0.55 + (i % 3 - 1) * 0.012, 0.92, z + 0.08 + (i % 2 - 0.5) * 0.015, root, 0); c.rotation.z = (i - 2) * 0.06; }
    M(new T3.BoxGeometry(0.12, 0.08, 0.08), toon('#f3e9d6'), x - 0.55, 0.82, z, root, 0.005); }
  K.booths.push(...root.children.slice(tpC));
  { const dishes = ['PORK', 'VEGGIE', 'SHRIMP', 'CHILI', 'TEA']; dishes.forEach((d, i) => { const tx = CTX(64, 256, c => { c.fillStyle = '#c9a45e'; c.fillRect(0, 0, 64, 256); c.fillStyle = '#7a4a2a'; c.fillRect(0, 0, 64, 10); c.fillRect(0, 246, 64, 10); c.fillStyle = '#201e1d'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; [...d].forEach((ch, k) => c.fillText(ch, 32, 48 + k * 34)); });
      const m = new T3.Mesh(new T3.PlaneGeometry(0.26, 1.0), new T3.MeshToonMaterial({ map: tx, gradientMap: grad })); m.position.set(W / 2 - 0.04, 2.45, -1.7 + i * 0.32); m.rotation.y = -Math.PI / 2; root.add(m); }); }
  { const pr = CTX(256, 320, c => { c.fillStyle = '#4a2c1a'; c.fillRect(0, 0, 256, 320); c.fillStyle = '#f3e9d6'; c.fillRect(14, 14, 228, 292); c.fillStyle = '#e8402a'; c.beginPath(); c.arc(128, 120, 64, 0, 7); c.fill(); c.fillStyle = '#f2741f'; c.beginPath(); c.moveTo(70, 250); c.lineTo(128, 150); c.lineTo(186, 250); c.closePath(); c.fill(); c.fillStyle = '#201e1d'; c.beginPath(); c.moveTo(92, 170); c.lineTo(104, 140); c.lineTo(114, 170); c.fill(); c.beginPath(); c.moveTo(142, 170); c.lineTo(152, 140); c.lineTo(164, 170); c.fill(); c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.fillText('FOXY', 128, 290); });
    const m = new T3.Mesh(new T3.PlaneGeometry(0.8, 1.0), new T3.MeshToonMaterial({ map: pr, gradientMap: grad })); m.position.set(-W / 2 + 0.04, 2.3, -1.0); m.rotation.y = Math.PI / 2; root.add(m); }
  { const bm = toon('#fff1c2', { emissive: new T3.Color('#ffcf6a'), emissiveIntensity: 0.9 }), bg = new T3.SphereGeometry(0.035, 8, 6), wm = new T3.LineBasicMaterial({ color: 0x201e1d }); K.bulbs = [];
    for (const [ax, az, bx, bz] of [[-W / 2 + 0.25, -1.2, -W / 2 + 0.25, D / 2 - 0.3], [W / 2 - 0.25, -1.2, W / 2 - 0.25, D / 2 - 0.3]]) { const pts = []; for (let i = 0; i <= 24; i++) { const k = i / 24, y = H - 0.25 - Math.sin(k * Math.PI * 3) ** 2 * 0.35; pts.push(new T3.Vector3(ax + (bx - ax) * k, y, az + (bz - az) * k)); if (i % 2 === 0) { const b = new T3.Mesh(bg, bm); b.position.set(pts[i].x, y - 0.05, pts[i].z); root.add(b); K.bulbs.push(b); } } root.add(new T3.Line(new T3.BufferGeometry().setFromPoints(pts), wm)); } }
  // walk bounds + the door gap
  box(-W / 2 - 1, -D / 2 - 1, -W / 2 + 0.3, D / 2 + 1); box(W / 2 - 0.3, -D / 2 - 1, W / 2 + 1, D / 2 + 1); box(-W / 2, -D / 2 - 1, W / 2, -D / 2 + 0.3); box(-W / 2, D / 2 - 0.25, -0.85, D / 2 + 1); box(0.85, D / 2 - 0.25, W / 2, D / 2 + 1);
  K.talk.work = at(0, KZ - 1.0); K.talk.door = at(0, D / 2 - 0.6); K.talk.kiko = at(-2.2, KZ + 2.35);
  K.cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K; }

// ---------------- the stand-alone game (+ the walk-in) ----------------
export async function createGyozaShift({ container, onState = () => {}, options = {} }) {
  const OPT = { world: '', owner: 'KIKO', customers: DEFAULT_CUSTOMERS, walk: false, onExit: null, ...options };
  const ST = createStage(container, { bg: '#2a1c16' }), { touch, CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, puff, smokeS } = ST;
  // all sound goes through gyoza-audio.js (layered synth SFX + music); the kit's old beeps are silenced here
  const tone = () => {}, SND = gyozaAudio(audio), buzz = ms => { try { if (touch && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  const K = buildGyoza({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline }), T = K.top, ART = gyozaArt(THREE, toon, addOutline), CUST = OPT.customers;
  scene.fog = new THREE.Fog(0x2a1c16, 11, 26);
  { const warm = new THREE.PointLight(0xffb070, 1.3, 8, 1.4); warm.position.set(K.origin.x, 2.7, K.z + K.origin.z + 0.5); scene.add(warm); }
  const lampGl = K.lanterns.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa060, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); s.position.copy(l.position).add(V3(K.origin.x, 0.12, K.origin.z)); s.scale.setScalar(1.6); scene.add(s); return s; });

  // ---------- cast ----------
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const kiko = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#ece4d8', furDark: '#b9ad9c', paw: '#ece4d8', tailMid: '#ece4d8' }, torso: ['#1f2b4a', '#f3e9d6', '#141c33'], outfit: 'robe', crest: '', gear: 'none', mood: 'happy', eyes: ['#3a2414', '#3a2414'] }));
  kiko.position.set(K.talk.kiko.x, 0, K.talk.kiko.z); kiko.rotation.y = 0.5; scene.add(kiko);
  const ben = hideGear(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#c8102e'], crest: '', gear: 'none', mood: 'happy' })); scene.add(ben); const BP = ben.userData.P;
  const BEN_INTRO = V3(K.origin.x - 1.0, 0, K.origin.z + 0.75);
  ben.position.copy(BEN_INTRO); ben.rotation.y = -0.3;
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.lineJoin = 'round'; g.lineCap = 'round';
      // steam curls
      g.strokeStyle = '#201e1d'; g.lineWidth = 6; for (const x of [92, 128, 164]) { g.beginPath(); g.moveTo(x, 70); g.bezierCurveTo(x - 14, 56, x + 14, 44, x, 26); g.stroke(); }
      // three gyoza crescents
      const gy = (x, y, s, r) => { g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); g.fillStyle = '#f6efe0'; g.beginPath(); g.moveTo(-50, 8); g.quadraticCurveTo(0, -60, 50, 8); g.quadraticCurveTo(0, 24, -50, 8); g.fill(); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.stroke(); g.fillStyle = '#c98a3c'; g.beginPath(); g.moveTo(-46, 10); g.quadraticCurveTo(0, 26, 46, 10); g.quadraticCurveTo(0, 18, -46, 10); g.fill(); g.lineWidth = 4; for (let i = -3; i <= 3; i++) { g.beginPath(); g.moveTo(i * 10, -20 + Math.abs(i) * 3); g.lineTo(i * 10 + 5, -30 + Math.abs(i) * 4); g.stroke(); } g.restore(); };
      gy(84, 118, 0.8, -0.25); gy(172, 118, 0.8, 0.25); gy(128, 112, 1.0, 0);
      g.save(); g.translate(128, 172); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-118, -26); g.lineTo(122, -30); g.lineTo(114, 32); g.lineTo(-124, 28); g.closePath(); g.fill(); g.fillStyle = '#c8102e'; g.beginPath(); g.moveTo(-110, -20); g.lineTo(114, -24); g.lineTo(108, 24); g.lineTo(-116, 21); g.closePath(); g.fill();
      g.font = 'italic 900 60px Archivo, "Arial Black", Arial, sans-serif'; g.lineWidth = 14; g.strokeStyle = '#201e1d'; g.strokeText('GYOZA', 4, 5); g.fillStyle = '#201e1d'; g.fillText('GYOZA', 4, 5); g.strokeText('GYOZA', 0, 0);
      const gr = g.createLinearGradient(0, -24, 0, 24); gr.addColorStop(0, '#fff3a0'); gr.addColorStop(0.5, '#ffd23a'); gr.addColorStop(0.51, '#ffb020'); gr.addColorStop(1, '#ff8a1a'); g.fillStyle = gr; g.fillText('GYOZA', 0, 0); g.restore(); });
    return dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#c8102e', towelCol: '#1f2b4a' }); })();
  const setUniform = on => uniform.parts.concat([uniform.print]).forEach(p => p.visible = on);
  setUniform(true);
  const custFox = CUST.map(cu => { const f = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, ...(cu.fur ? { fur: cu.fur, furDark: cu.furDark || cu.fur, paw: cu.fur } : {}) }, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  // two diners already eating at the tables (life for the walk-in)
  const diners = [[0, 1], [1, 3]].map(([ti, si], n) => { const cu = DEFAULT_CUSTOMERS[(n * 3 + 2) % DEFAULT_CUSTOMERS.length], f = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: n ? '#d9733a' : '#f0dcbe', furDark: n ? '#9a4a22' : '#c2a577' }, torso: n ? ['#c8102e', '#f3e9d6', '#7a1d2a'] : ['#3f5d47', '#e6b45a', '#2b4232'], outfit: n ? 'coat' : 'dress', crest: '', gear: 'none', mood: 'happy' }));
    const seat = K.seats.filter(s => s.kind === 'bench')[ti * 4 + si]; f.position.set(seat.x, seat.y - 0.47, seat.z); f.rotation.y = seat.ry; scene.add(f); f.userData.seated = true;
    const pl = new THREE.Group(); pl.position.set(seat.x, 0.79, seat.z + (seat.ry ? -0.42 : 0.42)); scene.add(pl); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.17, 0.02, 20), toon('#fbfbf7')); addOutline(d, 0.006, 0.2); pl.add(d);
    for (let i = 0; i < 4; i++) { const gz = ART.folded({ fill: 'pork', crust: 0.55, pleats: 6, dot: false }); gz.rotation.set(0, 0, Math.PI); gz.position.set(-0.11 + i * 0.075, 0.08, 0); gz.rotation.y = 0.3; gz.scale.setScalar(0.85); pl.add(gz); }
    return { f, pl, t: rr(0, 4) }; });
  const seatPose = f => { const P = f.userData.P; P.legs.forEach(l => l.rotation.x = -1.45); };

  // ---------- cameras ----------
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 }, { SAFE, shotFor } = cameraFit(ST);
  const pansOn = () => upg('burner2') ? 2 : 1;
  function shotPoints(id) { const P = (x, z, y = T) => V3(x, y, z), out = [];
    if (id === 'fold') { out.push(P(K.board.x - 0.38, K.board.z - 0.32), P(K.board.x + 0.38, K.board.z + 0.32), P(K.wrapStack.x + 0.1, K.wrapStack.z), ...Object.values(K.bowls).flatMap(b => [P(b.x - 0.2, b.z + 0.2, T + 0.12), P(b.x + 0.2, b.z - 0.05)])); }
    else if (id === 'pan') { for (let i = 0; i < pansOn(); i++) { const p = K.pans[i]; out.push(P(p.x - 0.34, p.z - 0.34), P(p.x + 0.34, p.z + 0.3), P(p.x - 0.3, p.z + 0.5, T + 0.34), P(p.x + 0.3, p.z + 0.5, T + 0.34)); } out.push(P(K.jug.x, K.jug.z + 0.1, T + 0.26)); }
    else if (id === 'sauce') { out.push(P(K.plate.x - 0.36, K.plate.z - 0.36), P(K.plate.x + 0.36, K.plate.z + 0.36), P(K.soy.x - 0.12, K.soy.z - 0.1, T + 0.36), P(K.soy.x - 0.12, K.soy.z + 0.1), P(K.chili.x - 0.12, K.chili.z - 0.12, T + 0.2), P(K.scal.x, K.scal.z - 0.16)); }
    else if (id === 'pass') { out.push(...K.passSlots.map(s => P(s.x, s.z, K.pass.y)), P(K.register.x, K.register.z, T + 0.4), ...K.spots.flatMap(s => [P(s.x - 0.45, s.z, 2.2), P(s.x + 0.45, s.z, 2.2), P(s.x - 0.45, s.z, 0.9), P(s.x + 0.45, s.z, 0.9)])); }
    else { out.push(P(K.origin.x - 3.3, K.board.z - 0.6), P(K.origin.x + 3.2, K.board.z - 0.6), P(K.origin.x - 3.3, K.board.z + 0.8), P(K.origin.x + 3.2, K.register.z), ...K.spots.map(s => P(s.x, s.z, 1.4))); }
    return out; }
  function workShot(id = S.focus || 'all') { const port = CW() < CHh(); return shotFor('w:' + id + pansOn(), () => shotPoints(id), id === 'all' ? (port ? 1.18 : 0.92) : (port ? 1.08 : 0.86), 0, id === 'all' ? 0.03 : 0.025); }
  const wideShot = () => { const port = CW() < CHh(), b = BEN_INTRO, box = [V3(b.x - 0.5, 0.05, b.z), V3(b.x + 0.5, 0.05, b.z), V3(b.x - 0.5, 2.3, b.z), V3(b.x + 0.5, 2.3, b.z)], kk = kiko.position;
    return port ? shotFor('wideP', () => [...box, V3(b.x, 2.6, b.z)], 0.12, Math.PI + 0.3, 0.1) : shotFor('wideL', () => [...box, V3(kk.x, 2.2, kk.z), V3(kk.x, 0.1, kk.z), V3(b.x, 2.6, b.z)], 0.14, Math.PI + 0.35, 0.06); };
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  const STATIONS = ['all', 'fold', 'pan', 'sauce', 'pass'];
  function setFocus(id) { if (!STATIONS.includes(id) || S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }
  camera.position.set(K.origin.x + 1, 2.2, K.origin.z + 4.5); CAM.look.set(K.origin.x + 1, 1.2, K.origin.z); camera.lookAt(CAM.look);

  // ---------- state ----------
  const S = { phase: 'intro', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, next: 3, done: null, react: null, reveal: null };
  function upg(id) { return !!save.stat(SAVE.upg + id, 0); }
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const fillsAvail = () => Object.keys(FILLINGS).filter(k => FILLINGS[k].day <= S.day), crustsAvail = () => Object.keys(CRUST).filter(k => CRUST[k].day <= S.day), extrasAvail = () => Object.keys(EXTRAS).filter(k => EXTRAS[k].day <= S.day);
  const fillBand = () => upg('spoon') ? [0.56, 0.9] : [0.62, 0.86], pleatNeed = () => Math.max(4, (S.day >= 3 ? 8 : S.day >= 2 ? 7 : 6) - (upg('press') ? 2 : 0)), steamBand = () => upg('bell') ? [0.4, 0.7] : [0.46, 0.64];
  const orders = [], tray = [], pass = []; let idSeq = 1, drag = null, plate = null;
  const fold = { st: 'empty', fill: 0, filling: 'pork', pleats: 0, need: 6, mesh: null, q: 1, holding: false, wig: null };

  // ---------- FOLD: wrapper → hold to fill → wiggle to pleat → onto the ready tray ----------
  function spawnWrapper() { if (fold.mesh) scene.remove(fold.mesh); const w = ART.wrapper(fold.filling); w.position.set(K.board.x, T + 0.04, K.board.z); scene.add(w); Object.assign(fold, { st: 'fill', fill: 0, pleats: 0, mesh: w, holding: false, wig: null, need: pleatNeed() }); tone(700, 0.04, 0.03); }
  function selectFill(k) { if (!fillsAvail().includes(k)) { flash(FILLINGS[k].name + ' FROM DAY ' + FILLINGS[k].day, '#ffffff', 1.1); return; } if (fold.st === 'sealed') { flash('TRAY FULL · LINE A PAN FIRST', '#ffffff', 1.1); return; } if (fold.st === 'pleat' || (fold.st === 'fill' && fold.fill > 0.05)) { flash('FINISH THIS ONE FIRST', '#ffffff', 1); return; } fold.filling = k; SND.sfx('bowl'); if (fold.st === 'empty') spawnWrapper(); else fold.mesh.userData.setFilling(k); tone(880, 0.05, 0.03); puff(K.bowls[k].x, T + 0.2, K.bowls[k].z, 0xfff3d0, 1); }
  function fillRelease() { fold.holding = false; const [lo, hi] = fillBand(); if (fold.st !== 'fill') return; if (fold.fill < lo) { if (fold.fill > 0.02) flash('MORE FILLING · HOLD AGAIN', '#ffffff', 1); return; }
    const mid = (lo + hi) / 2; fold.q = fold.fill <= hi ? clamp(1 - Math.abs(fold.fill - mid) / ((hi - lo) / 2) * 0.25, 0.75, 1) : 0.6; if (fold.fill > hi) flash('A LITTLE FULL', '#e6b45a', 0.9); else { flash('GREEN!', '#22c55e', 0.7); tone(1320, 0.07, 0.04); }
    // fold it over into a crescent, ready to pleat
    scene.remove(fold.mesh); const g = ART.folded({ fill: fold.filling, crust: 0, pleats: fold.need, shown: 0 }); g.position.set(K.board.x, T + 0.036, K.board.z); g.scale.setScalar(1.6); g.userData.foldT = 0; scene.add(g); fold.mesh = g; fold.st = 'pleat'; fold.pleats = 0; SND.sfx('fold'); buzz(12); tone(520, 0.06, 0.03); }
  function burst() { flash('BURST! TOO MUCH FILLING', '#ec3013', 1.3); SND.sfx('burst'); buzz(70); tone(160, 0.25, 0.05, 'sawtooth'); for (let i = 0; i < 6; i++) puff(K.board.x + rr(-0.1, 0.1), T + 0.08, K.board.z + rr(-0.1, 0.1), new THREE.Color(FILLINGS[fold.filling].col).getHex(), 1); scene.remove(fold.mesh); fold.mesh = null; fold.st = 'empty'; fold.holding = false; setTimeout(() => { if (fold.st === 'empty' && S.phase === 'shift') spawnWrapper(); }, 500); }
  function addPleat() { if (fold.st !== 'pleat') return; fold.pleats++; SND.sfx('pleat', fold.pleats); buzz(8); fold.mesh.userData.setPleats(fold.pleats); tone(900 + fold.pleats * 70 + Math.random() * 60, 0.04, 0.035, 'triangle'); puff(K.board.x + (fold.pleats / fold.need - 0.5) * 0.25, T + 0.12, K.board.z, 0xffffff, 1);
    if (fold.pleats >= fold.need) sealed(); }
  function sealed() { if (tray.length >= K.traySlots.length) { flash('TRAY FULL · COOK SOME FIRST', '#ffffff', 1.3); fold.st = 'sealed'; return; }
    const g = fold.mesh, item = { fill: fold.filling, q: fold.q, mesh: g }; tray.push(item); fold.st = 'empty'; fold.mesh = null; g.userData.hop = { from: g.position.clone(), to: slotPos(tray.length - 1), t: 0, s0: 1.6, s1: 1 }; flash('SEALED · ' + FILLINGS[item.fill].name, '#22c55e', 0.8); SND.sfx('seal'); buzz(15); tone(1046, 0.08, 0.04); setTimeout(() => tone(1568, 0.1, 0.04), 80);
    setTimeout(() => { if (fold.st === 'empty' && S.phase === 'shift') spawnWrapper(); }, 250); }
  const slotPos = i => { const s = K.traySlots[i]; return V3(s.x, T + 0.036, s.z); };
  const relayTray = () => tray.forEach((it, i) => { if (!it.mesh.userData.hop) it.mesh.position.copy(slotPos(i)); else it.mesh.userData.hop.to = slotPos(i); });
  function morningBatch() { tray.forEach(it => scene.remove(it.mesh)); tray.length = 0; for (let i = 0; i < 5; i++) { const g = ART.folded({ fill: 'pork', pleats: 6 }); g.position.copy(slotPos(i)); g.rotation.y = rr(-0.08, 0.08); scene.add(g); tray.push({ fill: 'pork', q: 0.9, mesh: g }); } }

  // ---------- PANS: line it (5) → fry → water → LID ON → steam → lid off in the band → FLICK to flip onto the plate ----------
  const PAN_SLOTS = Array.from({ length: 5 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; return { x: Math.cos(a) * 0.165, z: Math.sin(a) * 0.165, ry: -a - Math.PI / 2 }; });
  const pans = K.pans.map((p, i) => { const g = new THREE.Group(); g.position.set(p.x, T + 0.04, p.z); scene.add(g);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.27, 0.05, 32), toon('#26282c')); base.position.y = 0.025; addOutline(base, 0.01, 0.31); g.add(base);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.305, 0.016, 6, 32), toon('#3a3d42')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.05; g.add(rim);
    const oil = new THREE.Mesh(new THREE.CircleGeometry(0.28, 28), toon('#6a5020')); oil.rotation.x = -Math.PI / 2; oil.position.y = 0.052; g.add(oil);
    const water = new THREE.Mesh(new THREE.CircleGeometry(0.27, 28), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.55, depthWrite: false })); water.rotation.x = -Math.PI / 2; water.position.y = 0.058; water.visible = false; g.add(water);
    const bubbles = []; { const bm = new THREE.MeshBasicMaterial({ color: 0xfff6d8, transparent: true, opacity: 0.75, depthWrite: false }), bg = new THREE.SphereGeometry(0.012, 6, 4); for (let k = 0; k < 18; k++) { const b = new THREE.Mesh(bg, bm); const a = rr(0, 6.28), r = rr(0.05, 0.27); b.position.set(Math.cos(a) * r, 0.058, Math.sin(a) * r); b.userData.ph = rr(0, 6.28); b.userData.sp = rr(5, 11); b.visible = false; g.add(b); bubbles.push(b); } }
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.035, 0.34), toon('#3a2618')); handle.position.set(0, 0.05, -0.47); addOutline(handle, 0.006); g.add(handle);
    const lid = new THREE.Group(); { const d = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshToonMaterial({ color: '#cfe8ff', gradientMap: ST.grad, transparent: true, opacity: 0.42, depthWrite: false })); d.scale.y = 0.42; lid.add(d); const rm = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.012, 6, 28), toon('#9aa3ab')); rm.rotation.x = Math.PI / 2; lid.add(rm); const kn = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), toon('#201e1d')); kn.position.y = 0.14; addOutline(kn, 0.005, 0.04); lid.add(kn); }
    lid.position.set(p.x, T + 0.75, p.z); lid.visible = false; scene.add(lid);
    const gc = document.createElement('canvas'); gc.width = 256; gc.height = 48; const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace; const gauge = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, depthTest: false, transparent: true })); gauge.renderOrder = 25; gauge.scale.set(0.62, 0.116, 1); gauge.position.set(p.x, T + 0.3, p.z + 0.5); gauge.visible = false; scene.add(gauge);
    g.visible = i === 0; return { i, g, bubbles, oil, water, lid, gauge, gc, gt, home: V3(p.x, T + 0.04, p.z), st: 'empty', items: [], crust: 0, steam: 0, waterT: 0, lidLat: null, crustAtWater: 0, steamAt: 0, lidY: T + 0.75, flip: null, want: null, lastG: '' }; });
  const panFill = pn => { const c = {}; pn.items.forEach(it => c[it.fill] = (c[it.fill] || 0) + 1); return Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || null; };
  function drawGauge(pn) { const c = pn.gc, x = c.getContext('2d'), W = c.width, H = c.height, sx = v => 6 + v * (W - 12); let key = pn.st + '|' + Math.round((pn.st === 'steam' ? pn.steam : pn.crust) * 200) + '|' + pn.want; if (key === pn.lastG) return; pn.lastG = key; x.clearRect(0, 0, W, H); x.fillStyle = '#201e1d'; x.fillRect(0, 8, W, H - 16);
    if (pn.st === 'steam' || pn.st === 'water') { const [lo, hi] = steamBand(); [[0, lo, '#9ca3af'], [lo, hi, '#22c55e'], [hi, 0.85, '#e6b45a'], [0.85, 1, '#ec3013']].forEach(([a, b, col]) => { x.fillStyle = col; x.fillRect(sx(a), 13, sx(b) - sx(a) - 2, H - 26); }); x.strokeStyle = '#ffd23a'; x.lineWidth = 4; x.strokeRect(sx(lo) - 1, 10, sx(hi) - sx(lo), H - 20); const m = sx(Math.min(1, pn.steam)); x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(m - 9, 0); x.lineTo(m + 9, 0); x.lineTo(m, 12); x.closePath(); x.fill(); x.fillRect(m - 2, 8, 4, H - 16); }
    else { const v = pn.crust / 1.05; [[0, CRUST.light.lo, '#9ca3af', null], [CRUST.light.lo, CRUST.light.hi, CRUST.light.col, 'light'], [CRUST.light.hi, CRUST.golden.lo, '#6b5a40', null], [CRUST.golden.lo, CRUST.golden.hi, CRUST.golden.col, 'golden'], [CRUST.golden.hi, CRUST.dark.lo, '#6b5a40', null], [CRUST.dark.lo, CRUST.dark.hi, CRUST.dark.col, 'dark'], [CRUST.dark.hi, 1.05, '#ec3013', null]].forEach(([a, b, col, k]) => { x.fillStyle = col; x.fillRect(sx(a / 1.05), 13, sx(b / 1.05) - sx(a / 1.05) - 1, H - 26); if (k && k === pn.want) { x.strokeStyle = '#ffd23a'; x.lineWidth = 5; x.strokeRect(sx(a / 1.05) - 1, 10, sx(b / 1.05) - sx(a / 1.05), H - 20); } });
      const m = sx(Math.min(1, v)); x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(m - 9, 0); x.lineTo(m + 9, 0); x.lineTo(m, 12); x.closePath(); x.fill(); x.fillRect(m - 2, 8, 4, H - 16); }
    pn.gt.needsUpdate = true; }
  function loadPan(pn, idx) { if (!pn.g.visible) return false; if (pn.st !== 'empty' && pn.st !== 'load') { return false; } if (!tray.length) { flash('NO GYOZA ON THE TRAY · FOLD SOME', '#ffffff', 1.2); return false; }
    let i = idx; if (i == null) { const want = panWant(pn), cur = panFill(pn); i = tray.findIndex(t => t.fill === (cur || want)); if (i < 0) i = tray.findIndex(t => t.fill === want); if (i < 0) i = tray.length - 1; }
    const it = tray.splice(i, 1)[0], sl = PAN_SLOTS[pn.items.length]; pn.items.push(it); const w = V3(); it.mesh.getWorldPosition(w); scene.remove(it.mesh); pn.g.add(it.mesh); it.mesh.position.copy(pn.g.worldToLocal(w)); it.mesh.scale.setScalar(1); it.mesh.userData.hop = { from: it.mesh.position.clone(), to: V3(sl.x, 0.056, sl.z), t: 0, local: true, ry: sl.ry }; relayTray();
    pn.st = 'load'; SND.sfx('plop'); (() => {})(0.12, 2600, 0.06);
    if (pn.items.length >= GYOZA.plate) { pn.st = 'fry'; pn.crust = 0; pn.want = panTargetCrust(pn); say('SIZZLE! The bottoms are frying.', 2); (() => {})(0.5, 3000, 0.12); }
    return true; }
  function panWant(pn) { const o = urgentFor(pn) || orders.filter(q => q.st === 'wait' || q.st === 'walk').sort((a, b) => a.pat - b.pat)[0]; return o ? o.fill : (tray[0] ? tray[0].fill : 'pork'); }
  function panTargetCrust(pn) { const o = claim().pan.get(pn); return o ? o.crust : null; }
  function addWater(pn) { if (!pn || pn.st !== 'fry') return false; SND.sfx('water'); buzz(25); pn.st = 'water'; pn.waterT = 0; pn.crustAtWater = pn.crust; pn.water.visible = true; pn.water.scale.setScalar(1); pn.steam = 0; tone(180, 0.5, 0.06, 'sine'); (() => {})(0.9, 6000, 0.19); for (let i = 0; i < 10; i++) puff(pn.home.x + rr(-0.2, 0.2), T + 0.12, pn.home.z + rr(-0.2, 0.2), 0xffffff, 1); flash('LID ON! FAST!', '#ffd23a', 1.1);
    const j = K.jugMesh; j.userData.tip = 1; return true; }
  function lidOn(pn) { if (pn.st !== 'water') return false; SND.sfx('lidOn'); buzz(35); pn.lidLat = pn.waterT; pn.st = 'steam'; pn.lid.visible = true; pn.lidY = T + 0.75; tone(420, 0.2, 0.07, 'triangle'); (() => {})(0.22, 2200, 0.13); if (pn.lidLat < 1.2) flash('SLAM! ' + pn.lidLat.toFixed(2) + ' s', '#22c55e', 0.9); else flash('LID A BIT SLOW', '#e6b45a', 0.9); return true; }
  function lidOff(pn) { if (pn.st !== 'steam') return false; SND.sfx('lidOff'); buzz(15); pn.steamAt = pn.steam; pn.st = 'crisp'; pn.crispT = 0; pn.water.visible = false; tone(620, 0.1, 0.05); for (let i = 0; i < 8; i++) puff(pn.home.x + rr(-0.15, 0.15), T + 0.2, pn.home.z + rr(-0.15, 0.15), 0xffffff, 1); const [lo, hi] = steamBand(); flash(pn.steam >= lo && pn.steam <= hi ? 'IN THE BAND!' : pn.steam < lo ? 'A BIT EARLY' : 'A BIT LATE', pn.steam >= lo && pn.steam <= hi ? '#22c55e' : '#e6b45a', 0.9); return true; }
  function binPan(pn) { SND.sfx('bin'); pn.items.forEach(it => pn.g.remove(it.mesh)); pn.items = []; pn.st = 'empty'; pn.crust = 0; pn.steam = 0; pn.water.visible = false; pn.lid.visible = false; pn.oil.material = toon('#6a5020'); flash('BURNT · IN THE BIN', '#ec3013', 1.2); tone(160, 0.2, 0.04); }
  function flipPan(pn, big) { if (pn.st !== 'crisp') return false; if (plate) { flash('PLATE STATION IS BUSY · SAUCE IT FIRST', '#ffffff', 1.3); return false; }
    plate = newPlate(pn); pn.flip = { t: 0, big: !!big }; SND.sfx('flip'); buzz(40); pn.st = 'flip'; tone(700, 0.08, 0.05); setTimeout(() => tone(990, 0.1, 0.05), 160); return true; }

  // ---------- PLATE + SAUCE ----------
  const plateBase = () => { const g = new THREE.Group(); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.29, 0.025, 32), toon('#fbfbf7')); d.position.y = 0.012; addOutline(d, 0.007, 0.34); g.add(d); const r = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.009, 4, 32), toon('#1f2b4a')); r.rotation.x = Math.PI / 2; r.position.y = 0.026; g.add(r);
    { const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.86), new THREE.MeshBasicMaterial({ map: K.blobT, transparent: true, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = -0.008; sh.renderOrder = 1; g.add(sh); }
    const dish = new THREE.Group(); dish.position.set(0.19, 0.025, 0.2); g.add(dish); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.035, 18, 1, true), toon('#f3e9d6', { side: THREE.DoubleSide })); b.position.y = 0.018; addOutline(b, 0.004, 0.07); dish.add(b); const bt = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), toon('#f3e9d6')); bt.rotation.x = -Math.PI / 2; bt.position.y = 0.002; dish.add(bt);
    const sauce = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.05, 1, 18), toon('#3a1c10')); sauce.position.y = 0.002; sauce.scale.y = 0.001; sauce.visible = false; dish.add(sauce); const line = new THREE.Mesh(new THREE.TorusGeometry(0.061, 0.0035, 4, 20), new THREE.MeshBasicMaterial({ color: 0xec3013 })); line.rotation.x = Math.PI / 2; line.position.y = 0.002 + 0.03 * 0.8; dish.add(line);
    g.userData = { dish, sauce, line, chili: [], scal: [] }; return g; };
  function newPlate(pn) { const g = plateBase(); g.position.set(K.plate.x, T + 0.012, K.plate.z); scene.add(g); const o = claim().pan.get(pn) || null;
    return { g, items: pn.items.slice(), fill: panFill(pn), crust: pn.crustAtWater, lidLat: pn.lidLat == null ? 9 : pn.lidLat, steamAt: pn.steamAt, q: pn.items.reduce((a, b) => a + b.q, 0) / pn.items.length, oid: o ? o.id : null, needChili: o && o.chili ? EXTRAS.chili.need : 0, needScal: !!(o && o.scallion), sauce: 0, sauceDone: false, chili: 0, scal: 0, st: 'land', pouring: false }; }
  const FAN = Array.from({ length: 5 }, (_, i) => ({ x: -0.19 + i * 0.085, z: -0.07 + Math.abs(i - 2) * 0.02, ry: (i - 2) * 0.12 }));
  function plateNeedsText(p) { const o = orders.find(q => q.id === p.oid), bits = ['SOY']; if (p.needChili) bits.push('CHILI ×' + p.needChili); if (p.needScal) bits.push('SCALLIONS'); return (o ? 'PLATE FOR ' + CUST[o.ci].name : 'PLATE') + ' · ' + bits.join(' + '); }
  function chiliDrop() { if (!plate || plate.st !== 'sauce') { flash('FLIP A PAN ONTO THE PLATE FIRST', '#ffffff', 1.1); return; } if (!extrasAvail().includes('chili')) { flash('CHILI OIL FROM DAY 2', '#ffffff', 1); return; } if (plate.chili >= 6) return; plate.chili++; const d = plate.g.userData, m = new THREE.Mesh(new THREE.SphereGeometry(0.013, 8, 6), toon('#e2453f')); const a = plate.chili * 2.1; m.position.set(Math.cos(a) * 0.025, 0.005 + 0.03 * Math.max(plate.sauce, 0.2), Math.sin(a) * 0.025); m.scale.y = 0.5; d.dish.add(m); d.chili.push(m); SND.sfx('drip'); buzz(6); tone(1500 - plate.chili * 90, 0.05, 0.04, 'square'); K.chiliMesh.userData.bob = 1; checkPlate(); }
  function scalRub(amount) { if (!plate || plate.st !== 'sauce') return; if (!extrasAvail().includes('scallion')) { flash('SCALLIONS FROM DAY 3', '#ffffff', 1); return; } const before = plate.scal; plate.scal = Math.min(1, plate.scal + amount); const want = Math.floor(plate.scal * 16), d = plate.g.userData; while (d.scal.length < want) { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.008, 6), toon(d.scal.length % 3 ? '#5aa83a' : '#b8e08a')); const f = FAN[d.scal.length % 5]; m.position.set(f.x + rr(-0.03, 0.03), 0.105, f.z + rr(-0.03, 0.03)); plate.g.add(m); d.scal.push(m); if (d.scal.length % 2 === 0) SND.sfx('sprinkle'); } if (before < 0.9 && plate.scal >= 0.9) { flash('SCALLIONS ON', '#22c55e', 0.8); checkPlate(); } }
  function soyRelease() { if (!plate || !plate.pouring) return; plate.pouring = false; plate.sauceDone = plate.sauce > 0.05; K.soyMesh.rotation.z = 0; if (soyStream) soyStream.visible = false; if (plate.sauce >= 0.72 && plate.sauce <= 0.9) { flash('RIGHT ON THE LINE', '#22c55e', 0.8); tone(1320, 0.07, 0.04); } else if (plate.sauce < 0.72) flash('A LITTLE SHORT', '#e6b45a', 0.8); checkPlate(); }
  function checkPlate() { const p = plate; if (!p || p.st !== 'sauce' || p.pouring) return; if (!p.sauceDone) return; if (p.chili < p.needChili) return; if (p.needScal && p.scal < 0.9) return; startReveal(); }
  const soyStream = (() => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 1, 8), new THREE.MeshBasicMaterial({ color: 0x3a1c10 })); s.visible = false; scene.add(s); return s; })();

  // ---------- which plate / pan is for which customer (most urgent first, by filling then crust) ----------
  function claim() { const res = { pan: new Map(), plate: null, pass: new Map(), order: new Map() }, ws = orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.pat - b.pat), taken = new Set();
    const pool = [...pass.map(p => ({ k: 'pass', p, fill: p.fill, crust: zoneOf(p.crust) })), ...(plate && plate.st !== 'gone' ? [{ k: 'plate', p: plate, fill: plate.fill, crust: zoneOf(plate.crust) }] : []), ...pans.filter(pn => pn.g.visible && pn.items.length && pn.st !== 'burnt' && pn.st !== 'flip').map(pn => ({ k: 'pan', p: pn, fill: panFill(pn), crust: pn.st === 'fry' || pn.st === 'load' ? null : zoneOf(pn.crustAtWater) }))];
    for (const o of ws) { let best = null; for (const r of pool) { if (taken.has(r) || r.fill !== o.fill) continue; const score = (r.crust === o.crust ? 2 : r.crust == null ? 1 : 0) + (r.k === 'pass' ? 0.3 : r.k === 'plate' ? 0.2 : 0); if (!best || score > best.s) best = { r, s: score }; } if (best) { taken.add(best.r); res.order.set(o, best.r); if (best.r.k === 'pan') res.pan.set(best.r.p, o); else if (best.r.k === 'plate') res.plate = o; else res.pass.set(best.r.p, o); } }
    return res; }
  const urgentFor = pn => claim().pan.get(pn) || null;

  // ---------- customers + orders ----------
  function newOrder(force) { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i)); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUST.map((_, i) => i).filter(i => !used.includes(i)), ci = pick(pool);
    const d = S.day, fill = force?.fill || (d <= 1 ? 'pork' : pick(fillsAvail())), crust = force?.crust || pick(crustsAvail().concat(d <= 2 ? ['golden'] : [])), chili = force ? !!force.chili : extrasAvail().includes('chili') && Math.random() < 0.45, scallion = force ? !!force.scallion : extrasAvail().includes('scallion') && Math.random() < 0.45;
    const total = FILLINGS[fill].price + (chili ? 1 : 0) + (scallion ? 1 : 0), patMax = Math.max(62, 100 - (d - 1) * 9) * (upg('lanterns') ? 1.2 : 1);
    const f = custFox[ci]; f.visible = true; f.position.set(K.spots[free].x + 2.6, 0, K.spots[free].z + 0.9); f.rotation.y = Math.PI; f.userData.mood = 'happy';
    orders.push({ id: idSeq++, ci, spot: free, fill, crust, chili, scallion, total, pat: patMax, patMax, st: 'walk', f, line: pick(LINES.order) }); }
  function grade(p, o) { const notes = [], n = p.items.length || 1, match = p.items.filter(it => it.fill === o.fill).length / n; if (match < 0.6) return { wrong: true, misses: 9, notes: ['Wrong filling: ' + CUST[o.ci].name + ' wanted ' + FILLINGS[o.fill].name + '.'] };
    let m = 0; if (match < 1) { m++; notes.push('Mixed plate: some are not ' + FILLINGS[o.fill].name + '.'); }
    const z = zoneOf(p.crust), wantZ = CRUST[o.crust]; if (z !== o.crust) { m++; notes.push(p.crust < wantZ.lo ? 'Pale bottoms: the water went in early (wanted ' + wantZ.name + ').' : 'Too dark: left too long (wanted ' + wantZ.name + ').'); }
    if (p.lidLat > 1.25) { m++; notes.push(p.lidLat > 2.4 ? 'The lid never went on in time: the steam got away.' : 'Slow with the lid (' + p.lidLat.toFixed(1) + ' s).'); }
    const [lo, hi] = steamBand(); if (p.steamAt < lo - 0.03) { m++; notes.push('Lid came off early: still cold inside.'); } else if (p.steamAt > hi + 0.06) { m++; notes.push('Steamed too long: the wrappers went gluey.'); }
    if (p.sauce < 0.6) { m++; notes.push('Sauce came up short of the line.'); } else if (p.sauce > 1.0) { m++; notes.push('Sauce overflowed the dish.'); }
    if (o.chili && p.chili < EXTRAS.chili.need) { m++; notes.push('Not enough chili oil.'); } if (o.scallion && p.scal < 0.9) { m++; notes.push('Needs more scallions.'); }
    if (p.q < 0.7) notes.push('A couple were a little overfilled.');
    return { wrong: false, misses: m, notes }; }
  function startReveal() { const p = plate; p.st = 'reveal'; const c = claim(); let o = c.plate; if (!o) o = orders.filter(q => q.st === 'wait').find(q => q.fill === p.fill) || null; const gr = o ? grade(p, o) : null;
    S.reveal = { t: 0, oid: o ? o.id : null, who: o ? CUST[o.ci].name : null, name: FILLINGS[p.fill].name + ' GYOZA · ' + (CRUST[zoneOf(p.crust)] ? CRUST[zoneOf(p.crust)].name : zoneOf(p.crust).toUpperCase()), ok: !!(o && !gr.wrong), notes: gr ? gr.notes.slice(0, 3) : ['Nobody in line ordered ' + FILLINGS[p.fill].name + '.'], perfect: !!(gr && !gr.wrong && !gr.misses), waiting: o ? o.st === 'wait' : false };
    S.flash = null; SND.sfx('reveal'); for (let i = 0; i < 6; i++) puff(K.plate.x + rr(-0.2, 0.2), T + rr(0.1, 0.35), K.plate.z + rr(-0.15, 0.15), 0xffe7a0, 1); }
  function revealChoice(choice) { const r = S.reveal, p = plate; if (!r || !p) return; S.reveal = null; plate = null;
    if (choice === 'bin') { scene.remove(p.g); flash('PLATE BINNED', '#ec3013', 1); tone(160, 0.2, 0.04); return; }
    if (choice === 'serve') { const o = orders.find(q => q.id === r.oid && q.st === 'wait'); if (o) { serve(p, o); return; } }
    if (pass.length >= K.passSlots.length) { const old = pass.shift(); scene.remove(old.g); flash('OLDEST PLATE WENT COLD · BINNED', '#ec3013', 1.4); }
    pass.push(p); p.st = 'pass'; layoutPass(); tone(990, 0.08, 0.04); }
  function layoutPass() { pass.forEach((p, i) => { const s = K.passSlots[i]; p.slide = { from: p.g.position.clone(), to: V3(s.x, K.pass.y, s.z), t: 0, dur: 0.45 }; }); }
  function serve(p, o) { const gr = grade(p, o), pq = o.pat / o.patMax; SND.sfx('slide'); p.st = 'out'; p.slide = { from: p.g.position.clone(), to: V3(o.f.position.x, 1.18, o.f.position.z - 0.25), t: 0, dur: 0.5, gone: true }; outPlates.push(p); const i = pass.indexOf(p); if (i >= 0) { pass.splice(i, 1); layoutPass(); }
    if (gr.wrong) { startReact(o, 'insulted', 0, null, gr.notes[0]); return false; }
    const stars = gr.misses === 0 ? (pq > 0.45 ? 3 : 2) : gr.misses === 1 ? 2 : 1; o.st = 'pay'; o.stars = stars; const level = stars === 3 ? (pq > 0.7 ? 'thrilled' : 'happy') : stars === 2 ? 'neutral' : 'unhappy';
    o.tip = level === 'thrilled' ? Math.ceil(o.total * 0.4) + 3 : level === 'happy' ? Math.ceil(o.total * 0.25) + 1 : level === 'neutral' ? 1 : 0;
    const bill = [5, 10, 20, 50].find(b => b > o.total + (Math.random() < 0.3 ? 4 : 0)) || 50; startReact(o, level, stars, { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 }, gr.notes[0]); return true; }
  function startReact(o, level, stars, pay, note) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; if (level === 'thrilled') o.f.userData.hop = 1; SND.sfx({ thrilled: 'thrilled', happy: 'happy', neutral: 'happy', unhappy: 'sad', insulted: 'angry' }[level]); S.react = { o, level, stars, pay, t: 0, word: R.word, col: R.col, line: pick(R.lines), note: stars === 3 ? '' : note || '', who: CUST[o.ci].name, tip: o.tip || 0 }; S.focus = 'all';
    tone(level === 'insulted' ? 180 : level === 'unhappy' ? 300 : 880, 0.18, 0.05, level === 'insulted' || level === 'unhappy' ? 'sawtooth' : 'triangle'); if (level === 'thrilled') { setTimeout(() => tone(1175, 0.1, 0.05), 110); setTimeout(() => tone(1568, 0.16, 0.05), 220); for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; if (r.pay) { S.pay = r.pay; payProps(r.pay); S.payOut = null; tone(880, 0.1, 0.05); } else { r.o.pat = Math.max(4, r.o.pat - 8); } }
  // ---------- REGISTER close-up (the shared kit) ----------
  const REG = V3(K.register.x, T, K.register.z), RG = registerKit(ST, REG, { open: 'FOXY GYOZA · OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; coinDrop(v); regDraw(P); SND.sfx('coin'); buzz(5); tone(1400 + v * 40, 0.05, 0.03); if (P.given === P.owed) payDone(); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); SND.sfx('error'); P.given = 0; tone(220, 0.2, 0.04, 'sawtooth'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone() { const P = S.pay, o = orders.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); SND.sfx('kaching'); if (!o) return; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars);
    flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + pts + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : ''), '#ffd23a', 1.8); tone(1046, 0.1, 0.05); setTimeout(() => tone(1568, 0.12, 0.05), 90); o.st = 'leave'; o.t = 0; }

  // ---------- input: tap / hold / wiggle / flick / rub / drag ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -(T + 0.2)), hit = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const TARGETS = () => { const t = [];
    for (const [k, b] of Object.entries(K.bowls)) t.push({ kind: 'bowl', k, p: V3(b.x, T + 0.12, b.z), r: 40 });
    t.push({ kind: 'board', p: V3(K.board.x, T + 0.05, K.board.z), r: 78 }, { kind: 'stack', p: V3(K.wrapStack.x, T + 0.08, K.wrapStack.z), r: 34 });
    tray.forEach((it, i) => t.push({ kind: 'tray', i, p: it.mesh.position.clone(), r: 24 }));
    pans.forEach(pn => pn.g.visible && t.push({ kind: 'pan', pn, p: V3(pn.home.x, T + 0.08, pn.home.z), r: 74 }));
    t.push({ kind: 'jug', p: V3(K.jug.x, T + 0.2, K.jug.z), r: 42 });
    if (plate && plate.st === 'sauce') t.push({ kind: 'plate', p: V3(K.plate.x, T + 0.06, K.plate.z), r: 72 });
    t.push({ kind: 'soy', p: V3(K.soy.x, T + 0.18, K.soy.z), r: 44 }, { kind: 'chili', p: V3(K.chili.x, T + 0.1, K.chili.z), r: 40 }, { kind: 'scal', p: V3(K.scal.x, T + 0.08, K.scal.z), r: 36 });
    pass.forEach(p => t.push({ kind: 'passPlate', pl: p, p: p.g.position.clone(), r: 50 }));
    orders.forEach(o => o.st === 'wait' && t.push({ kind: 'cust', o, p: V3(o.f.position.x, 1.45, o.f.position.z), r: 70 }));
    return t; };
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * scale() && d < bd) { bd = d; best = t; } } return best; }
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onPlane = (x, y, h) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); plane.constant = -h; return ray.ray.intersectPlane(plane, hit) ? hit.clone() : null; };
  const STATION = { bowl: 'fold', board: 'fold', stack: 'fold', tray: 'pan', pan: 'pan', jug: 'pan', plate: 'sauce', soy: 'sauce', chili: 'sauce', scal: 'sauce', passPlate: 'pass', cust: 'pass' };
  const G = { hold: null, wig: null, rub: null, flick: null, jug: null, drag: null };
  function onDown(e) { audio.init && audio.init(); SND.unlock(); S.lastInput = performance.now(); if (S.phase !== 'shift' || S.pay || DM.on || S.reveal || S.react) return; const { x, y } = local(e), t = pickAt(x, y);
    if (fold.st === 'pleat' && (S.focus === 'fold' || (t && t.kind === 'board'))) { if (!t || t.kind === 'board' || t.kind === 'tray' || t.kind === 'stack') { e.preventDefault(); G.wig = { x, y, ax: 0, ay: 0, dir: 0, moved: 0 }; setFocus('fold'); return; } }
    if (!t) return; e.preventDefault(); if (S.focus === 'all' && t.kind !== 'cust' && t.kind !== 'passPlate') setFocus(STATION[t.kind]);
    if (t.kind === 'bowl') selectFill(t.k);
    else if (t.kind === 'board' || t.kind === 'stack') { if (fold.st === 'empty') spawnWrapper(); else if (fold.st === 'fill') { fold.holding = true; G.hold = 'fill'; } else if (fold.st === 'sealed') sealed(); }
    else if (t.kind === 'tray') { const it = tray[t.i], pn = pans.find(p => p.g.visible && p.st === 'load' && panFill(p) === it.fill) || pans.find(p => p.g.visible && p.st === 'empty') || pans.find(p => p.g.visible && p.st === 'load'); if (pn) { loadPan(pn, t.i); setFocus('pan'); } else flash('BOTH PANS ARE BUSY', '#ffffff', 1); }
    else if (t.kind === 'pan') { const pn = t.pn; if (pn.st === 'empty' || pn.st === 'load') loadPan(pn); else if (pn.st === 'fry') flash('FRYING · TAP THE JUG FOR WATER AT ' + (pn.want ? CRUST[pn.want].name : 'GOLDEN'), '#ffffff', 1.3); else if (pn.st === 'water') { G.flick = { pn, y0: y, mode: 'lid' }; lidOn(pn); } else if (pn.st === 'steam') { G.flick = { pn, y0: y, mode: 'off', done: false }; } else if (pn.st === 'crisp') { G.flick = { pn, y0: y, mode: 'flip', done: false }; } else if (pn.st === 'burnt') binPan(pn); }
    else if (t.kind === 'jug') G.jug = { x, y, moved: 0 };
    else if (t.kind === 'soy') { if (!plate || plate.st !== 'sauce') flash('FLIP A PAN ONTO THE PLATE FIRST', '#ffffff', 1.1); else { plate.pouring = true; G.hold = 'soy'; } }
    else if (t.kind === 'chili') chiliDrop();
    else if (t.kind === 'scal') flash(plate && plate.st === 'sauce' ? 'RUB OVER THE PLATE TO SPRINKLE' : 'FLIP A PAN ONTO THE PLATE FIRST', '#ffffff', 1.1);
    else if (t.kind === 'plate') G.rub = { x, y };
    else if (t.kind === 'passPlate') G.drag = { pl: t.pl, x, y, moved: 0 };
    else if (t.kind === 'cust') { const C = claim(), p = [...C.pass].find(([, o]) => o === t.o); if (p) serve(p[0], t.o); else flash(CUST[t.o.ci].name + ' · NO PLATE UP YET', '#ffffff', 1.1); } }
  function onMove(e) { if (S.phase !== 'shift') return; const { x, y } = local(e);
    if (G.wig) { const W = G.wig, dx = x - W.x, dy = y - W.y; W.x = x; W.y = y; W.ax += dx; W.ay += dy; W.moved += Math.hypot(dx, dy); const th = 13 * scale(), a = Math.abs(W.ax) >= Math.abs(W.ay) ? W.ax : W.ay; if (Math.abs(a) > th) { const d = Math.sign(a); if (W.dir && d !== W.dir) addPleat(); W.dir = d; W.ax = 0; W.ay = 0; } return; }
    if (G.rub) { const d = Math.hypot(x - G.rub.x, y - G.rub.y); G.rub.x = x; G.rub.y = y; scalRub(d / (260 * scale())); return; }
    if (G.flick && !G.flick.done && G.flick.y0 - y > 28 * scale()) { const F = G.flick; F.done = true; if (F.mode === 'off') lidOff(F.pn); else if (F.mode === 'flip') flipPan(F.pn, true); return; }
    if (G.jug) { G.jug.moved += 1; const h = onPlane(x, y, T + 0.25); if (h && G.jug.moved > 3) { K.jugMesh.position.set(h.x - K.origin.x, T + 0.12, h.z - K.origin.z); } return; }
    if (G.drag) { G.drag.moved += 1; const h = onPlane(x, y, 1.3); if (h && G.drag.moved > 3) G.drag.pl.g.position.set(h.x, 1.3, h.z); } }
  function onUp(e) { if (S.phase !== 'shift') { G.hold = G.wig = G.rub = G.flick = G.jug = G.drag = null; return; } const { x, y } = local(e);
    if (G.hold === 'fill') fillRelease(); else if (G.hold === 'soy') soyRelease(); G.hold = null;
    if (G.wig) { if (G.wig.moved > 30 && fold.st === 'pleat' && fold.pleats === 0) flash('WIGGLE BACK AND FORTH ACROSS IT', '#ffffff', 1.2); G.wig = null; }
    G.rub = null;
    if (G.flick) { const F = G.flick; G.flick = null; if (!F.done) { if (F.mode === 'off') lidOff(F.pn); else if (F.mode === 'flip') flipPan(F.pn, false); } }
    if (G.jug) { const J = G.jug; G.jug = null; K.jugMesh.position.set(K.jug.x - K.origin.x, T, K.jug.z - K.origin.z); const t = J.moved > 3 ? pickAt(x, y, ['pan']) : null, pn = t ? t.pn : pans.filter(p => p.g.visible && p.st === 'fry').sort((a, b) => b.crust - a.crust)[0]; if (pn && pn.st === 'fry') addWater(pn); else flash('NOTHING IS FRYING YET', '#ffffff', 1); }
    if (G.drag) { const D = G.drag; G.drag = null; const t = D.moved > 3 ? pickAt(x, y, ['cust']) : null; if (t) serve(D.pl, t.o); else if (D.moved <= 3) { const C = claim(), o = C.pass.get(D.pl); if (o && o.st === 'wait') serve(D.pl, o); else { flash('DRAG IT TO A CUSTOMER', '#ffffff', 1.1); layoutPass(); } } else layoutPass(); } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- WALK-IN: Ben walks the room between shifts ----------
  const WK = { keys: new Set(), stick: { x: 0, y: 0 }, seat: null, dialog: null, toast: null, toastT: 0, near: null, met: !!save.flag('gyozaMetKiko'), pov: false };
  const KIKO_TIPS = ['Fill to the green, then wiggle across the seam until it is sealed. Even pleats keep the juice in.', 'Five in the pan, fry the bottoms to what the ticket says, then water and LID ON. Fast!', 'Lift the lid inside the steam band and flick the pan over onto the plate. Crust up, always.', 'Soy to the red line. Chili and scallions if they ask. Then hand it over with a smile.'];
  const kikoHello = () => ({ name: OPT.owner, role: 'Owner · Foxy Gyoza', text: !WK.met ? 'Welcome to Foxy Gyoza! I am ' + OPT.owner[0] + OPT.owner.slice(1).toLowerCase() + '. The pan is hot and the line is long. Want to help out?' : save.flag('gyozaUniform') ? 'There is my best folder! Ready for another shift?' : 'Back again! The pan is still hot.', choices: [{ text: 'Put me to work!' }, { text: 'Show me how first.' }, { text: 'What makes a good gyoza?' }, { text: 'Just looking around.', bye: true }] });
  function enterWalk() { if (DM.on) demoStop(); SND.unlock(); SND.setMusic('calm'); clearKitchen(); S.phase = 'walk'; S.done = null; ben.visible = true; kiko.visible = true; kiko.position.set(K.talk.kiko.x, 0, K.talk.kiko.z); ben.position.set(K.door.x, 0, K.door.z - 1.9); ben.rotation.y = Math.PI; setUniform(!!save.flag('gyozaUniform')); WK.seat = null; WK.dialog = null; WK.toast = null; tone(660, 0.06, 0.03); }
  const walkDir = () => { let x = WK.stick.x, y = WK.stick.y; const k = WK.keys; if (k.has('KeyW') || k.has('ArrowUp')) y += 1; if (k.has('KeyS') || k.has('ArrowDown')) y -= 1; if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1; if (k.has('KeyD') || k.has('ArrowRight')) x += 1; const m = Math.hypot(x, y); return m > 1 ? { x: x / m, y: y / m, m: 1 } : { x, y, m }; };
  function collide(p, r = 0.26) { for (const b of K.colliders) { const cx = clamp(p.x, b.x0, b.x1), cz = clamp(p.z, b.z0, b.z1), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz); if (d < r) { if (d > 1e-4) { p.x = cx + dx / d * r; p.z = cz + dz / d * r; } else { const l = p.x - b.x0, rr2 = b.x1 - p.x, f = p.z - b.z0, bk = b.z1 - p.z, mn = Math.min(l, rr2, f, bk); if (mn === l) p.x = b.x0 - r; else if (mn === rr2) p.x = b.x1 + r; else if (mn === f) p.z = b.z0 - r; else p.z = b.z1 + r; } } } }
  function walkStep(dt) { const d = walkDir(), u = ben.userData; let spd = 0;
    if (WK.seat) { if (d.m > 0.35 && !WK.dialog) standUp(); else { ben.position.set(WK.seat.x, WK.seat.y - 0.47, WK.seat.z); ben.rotation.y = WK.seat.ry; } }
    else if (!WK.dialog && d.m > 0.08) { const v = 2.7 * d.m, p = ben.position; p.x += d.x * v * dt; p.z -= d.y * v * dt; collide(p); spd = v * 1.4; WK.stepT = (WK.stepT || 0) - dt; if (WK.stepT <= 0) { WK.stepT = 0.36 / Math.max(0.5, d.m); SND.sfx('step'); } const want = Math.atan2(d.x, -d.y); let dr = want - ben.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); ben.rotation.y += dr * Math.min(1, dt * 12); }
    kit.animFox(ben, dt, spd); if (WK.seat) seatPose(ben); ben.position.y = WK.seat ? WK.seat.y - 0.47 : 0;
    // what is near?
    const bp = ben.position, dist = q => Math.hypot(bp.x - q.x, bp.z - q.z), KZw = K.z + K.origin.z; let near = null;
    if (WK.seat) near = { id: 'stand', label: 'Stand up' };
    else if (dist(kiko.position) < 1.7) near = { id: 'kiko', label: 'Talk to ' + OPT.owner };
    else if (Math.abs(bp.x - K.origin.x) < 3.4 && bp.z > KZw - 1.4 && bp.z < KZw - 0.6) near = { id: 'work', label: 'Start a shift' };
    else if (dist(K.talk.menu) < 0.95) near = { id: 'menu', label: 'Read the menu' };
    else if (dist(K.talk.door) < 0.9) near = { id: 'door', label: 'Leave' };
    else { const s = K.seats.map(s => ({ s, d: dist(s) })).filter(q => q.d < 0.85 && !diners.some(dn => Math.hypot(dn.f.position.x - q.s.x, dn.f.position.z - q.s.z) < 0.3)).sort((a, b) => a.d - b.d)[0]; if (s) near = { id: 'seat', label: 'Sit', seat: s.s }; }
    WK.near = near; kiko.userData.lookAt = dist(kiko.position) < 4 ? V3(bp.x, 1.5, bp.z) : null; kiko.userData.talking = !!WK.dialog; if (WK.toast) { WK.toastT -= dt; if (WK.toastT <= 0) WK.toast = null; }
    const port = CW() < CHh(), off = port ? V3(0, 6.2, 4.6) : V3(0, 4.6, 4.6), want = V3(clamp(bp.x, K.origin.x - 4.2, K.origin.x + 4.2), 0, clamp(bp.z, K.origin.z - 3.2, K.origin.z + 3.4)).add(off), look = V3(clamp(bp.x, K.origin.x - 4.6, K.origin.x + 4.6), 0.7, bp.z - (port ? 1.0 : 0.8));
    camera.position.lerp(want, Math.min(1, dt * 4)); CAM.look.lerp(look, Math.min(1, dt * 5)); }
  // lanterns between the camera and Ben fade out in the walk-in so he is never hidden
  function lanternFade() { const bp = ben.position; camera.updateMatrixWorld(); const bn = V3(bp.x, 1.2, bp.z).project(camera), bd = camera.position.distanceTo(bp); K.lanterns.forEach((l, i) => { const w = V3(); l.getWorldPosition(w); const pj = w.clone().project(camera), hide = camera.position.distanceTo(w) < bd - 0.3 && Math.abs(pj.x - bn.x) < 0.45 && pj.y > bn.y - 0.2 && pj.y < bn.y + 0.9; l.visible = !hide; if (lampGl[i]) lampGl[i].visible = !hide; }); }
  function sitDown(seat) { WK.seat = seat; SND.sfx('sit'); }
  function standUp() { const s = WK.seat; WK.seat = null; ben.position.set(s.x - Math.sin(s.ry) * 0.75, 0, s.z - Math.cos(s.ry) * 0.75); collide(ben.position); }
  function walkToast(t, s = 3.2) { WK.toast = t; WK.toastT = s; }
  function talk() { if (S.phase !== 'walk') return; SND.unlock(); if (WK.dialog) { nextLine(); return; } const n = WK.near; if (!n) return;
    if (n.id === 'kiko') { SND.sfx('talk'); WK.dialog = kikoHello(); if (!WK.met) { WK.met = true; save.setFlag('gyozaMetKiko'); } tone(880, 0.06, 0.03); }
    else if (n.id === 'work') startShift();
    else if (n.id === 'menu') walkToast('MENU · ' + fillsAvail().map(k => FILLINGS[k].name + ' ' + FILLINGS[k].price + 'g').join(' · ') + ' · crust LIGHT / GOLDEN' + (S.day >= 3 ? ' / DARK' : '') + (extrasAvail().length ? ' · + ' + extrasAvail().map(k => EXTRAS[k].name).join(', ') : ''), 4.5);
    else if (n.id === 'door') { if (OPT.onExit) OPT.onExit(); else walkToast('The street is out there. This room drops into any world\'s building.', 3.5); }
    else if (n.id === 'seat') sitDown(n.seat);
    else if (n.id === 'stand') standUp(); }
  function choose(i) { const d = WK.dialog; if (!d || !d.choices) return; WK.dialog = null;
    if (i === 0) startShift(); else if (i === 1) demoStart(); else if (i === 2) WK.dialog = { name: OPT.owner, role: 'Owner · Foxy Gyoza', text: KIKO_TIPS[0], lines: KIKO_TIPS, idx: 0, step: 1, total: KIKO_TIPS.length }; }
  function nextLine() { const d = WK.dialog; if (!d) return; SND.sfx('talk'); if (d.choices) return; if (d.lines && d.idx < d.lines.length - 1) { d.idx++; WK.dialog = { ...d, text: d.lines[d.idx], step: d.idx + 1 }; } else WK.dialog = { ...kikoHello(), text: 'Anything else?' }; }
  const KEYS_WALK = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
  function onKey(e) { const tag = (e.target && e.target.tagName) || ''; if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (S.phase === 'walk') { if (KEYS_WALK.has(e.code)) { WK.keys.add(e.code); e.preventDefault(); } else if (e.code === 'KeyE' && !e.repeat) talk(); else if (e.code === 'Space' && !e.repeat) { e.preventDefault(); jump(); } else if (e.code === 'Digit1' && !e.repeat) melee(); else if (/^Digit[1-4]$/.test(e.code) && WK.dialog && WK.dialog.choices) choose(+e.code.slice(5) - 1); }
    else if (S.phase === 'shift' && !e.repeat && /^Digit[1-5]$/.test(e.code)) setFocus(STATIONS[+e.code.slice(5) - 1]); }
  function onKeyUp(e) { WK.keys.delete(e.code); }
  addEventListener('keydown', onKey); addEventListener('keyup', onKeyUp);
  function melee() { if (S.phase !== 'walk') return; WK.wave = 1.2; SND.sfx('wave'); }
  function jump() { if (S.phase !== 'walk' || WK.seat) return; if (!(ben.userData.hop > 0)) { ben.userData.hop = 1; SND.sfx('hop'); } }

  // ---------- flow ----------
  function clearKitchen() { if (fold.mesh) scene.remove(fold.mesh); Object.assign(fold, { st: 'empty', fill: 0, pleats: 0, mesh: null, holding: false }); tray.forEach(it => scene.remove(it.mesh)); tray.length = 0;
    pans.forEach(pn => { pn.items.forEach(it => pn.g.remove(it.mesh)); Object.assign(pn, { items: [], st: 'empty', crust: 0, steam: 0, flip: null, lidLat: null, want: null }); pn.water.visible = false; pn.lid.visible = false; pn.gauge.visible = false; pn.g.position.copy(pn.home); pn.g.rotation.set(0, 0, 0); pn.oil.material = toon('#6a5020'); });
    if (plate) { scene.remove(plate.g); plate = null; } pass.forEach(p => scene.remove(p.g)); pass.length = 0; orders.forEach(o => o.f.visible = false); orders.length = 0; S.reveal = null; S.react = null; S.pay = null; S.payOut = null; payProps(null); G.hold = G.wig = G.rub = G.flick = G.jug = G.drag = null; soyStream.visible = false; K.soyMesh.rotation.z = 0; }
  function startShift() { if (!['intro', 'done', 'walk'].includes(S.phase)) return; if (!S.demo && DM.on) demoStop(); audio.init && audio.init(); SND.unlock(); SND.sfx('start'); SND.setMusic('shift'); WK.dialog = null; WK.seat = null; clearKitchen();
    Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 0.3, done: null }); pans[1].g.visible = upg('burner2'); morningBatch(); fold.filling = 'pork'; spawnWrapper();
    S.focus = 'all'; ben.visible = false; kiko.visible = false; glideTo(workShot(), 1.0); say(OPT.owner + ': "Morning batch is on the tray. Fold on the left, pans in the middle, sauce on the right. Go!"', 6); S.glideT = 1.05; }
  function endShift() { S.phase = 'done'; SND.sfx('gong'); SND.setMusic('calm'); SND.setSizzle(0); SND.setSteam(0); const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 3 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = []; try { save.addGold(total); save.best(SAVE.best, total); if (S.served >= 2 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...Object.values(FILLINGS).filter(f => f.day === nd).map(f => f.name + ' GYOZA'), ...Object.values(CRUST).filter(c => c.day === nd).map(c => c.name + ' CRUST'), ...Object.values(EXTRAS).filter(x => x.day === nd).map(x => x.name)]; } if (!save.flag('gyozaUniform') && S.served >= 3) { save.setFlag('gyozaUniform'); unlock.push('GYOZA UNIFORM (paper hat, towel + gyoza tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold, need: 2 + S.day };
    if (newDay) S.day += 1; clearKitchen(); ben.visible = true; kiko.visible = true; ben.position.copy(BEN_INTRO); ben.rotation.y = -0.3; setUniform(true); glideTo(wideShot(), 1.4);
    say(eod ? OPT.owner + ': "EMPLOYEE OF THE DAY! Look at those pleats!"' : S.served >= 3 ? OPT.owner + ': "Good shift. Same time tomorrow?"' : OPT.owner + ': "Rough one. Tomorrow the pan will be kinder."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); SND.sfx('error'); return false; } SND.sfx('upgrade'); save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); tone(1320, 0.1, 0.05); if (S.done) S.done.gold = save.data.gold; return true; }
  function toIntro() { if (DM.on) demoStop(); SND.setMusic('calm'); clearKitchen(); S.phase = 'intro'; S.done = null; setUniform(true); ben.visible = true; kiko.visible = true; kiko.position.set(K.talk.kiko.x, 0, K.talk.kiko.z); ben.position.copy(BEN_INTRO); ben.rotation.y = -0.3; glideTo(wideShot(), 1); }

  // ---------- DEMO: an autopilot works one full order with captions (nothing is saved) ----------
  const DM = { on: false, cap: '', key: '', gen: null, wait: 0, until: null, served: 0, day0: 1, hint: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 20; scene.add(hand);
  const handTo = (p, f) => { hand.visible = false; if (f) setFocus(f); DM.hint = { p: p.clone().setY(Math.max(T, p.y - 0.15)), r: 0.4 }; };
  const cap = (text, key) => { DM.cap = text; DM.key = key || ''; };
  function* demoScript() {
    cap('WATCH A SHIFT AT FOXY GYOZA'); yield 1.6;
    yield () => orders.some(o => o.st === 'wait'); const o = orders.find(q => q.st === 'wait'), who = CUST[o.ci].name;
    cap(who + ' WANTS ' + FILLINGS[o.fill].name + ' · ' + CRUST[o.crust].name + (o.chili ? ' + CHILI' : '') + '. THE TICKET UP TOP SAYS IT ALL', 'LOOK'); yield 2.6;
    setFocus('fold'); cap('THE MORNING BATCH IS ON THE TRAY. LET\'S FOLD ONE MORE: TAP A FILLING BOWL', 'TAP'); yield 1.0; handTo(V3(K.bowls[o.fill].x, T + 0.15, K.bowls[o.fill].z)); fold.filling = o.fill; if (fold.st === 'empty') spawnWrapper(); else fold.mesh.userData.setFilling(o.fill); yield 1.2;
    cap('HOLD THE WRAPPER: THE SPOON FILLS IT. LET GO IN THE GREEN', 'HOLD'); handTo(V3(K.board.x, T + 0.08, K.board.z)); fold.holding = true; yield () => fold.fill >= (fillBand()[0] + fillBand()[1]) / 2; fillRelease(); yield 0.8;
    cap('WIGGLE BACK AND FORTH ACROSS THE SEAM: EVERY TURN IS A PLEAT', 'WIGGLE'); while (fold.st === 'pleat') { handTo(V3(K.board.x + (fold.pleats % 2 ? 0.12 : -0.12), T + 0.1, K.board.z)); addPleat(); yield 0.26; } yield 0.9;
    setFocus('pan'); cap('TAP THE PAN: A GYOZA HOPS IN. FIVE MAKE A PLATE', 'TAP'); yield 0.8; const pn = pans[0]; for (let i = 0; i < 5; i++) { handTo(V3(pn.home.x, T + 0.12, pn.home.z)); loadPan(pn); yield 0.45; }
    cap('THE BOTTOMS FRY. WATCH THE BAR OVER THE PAN FOR ' + CRUST[o.crust].name, 'WAIT'); yield () => pn.crust >= (CRUST[o.crust].lo + CRUST[o.crust].hi) / 2;
    cap(CRUST[o.crust].name + '! TAP THE JUG TO ADD THE WATER', 'TAP'); handTo(V3(K.jug.x, T + 0.25, K.jug.z)); addWater(pn); yield 0.45;
    cap('LID ON, FAST! SWIPE DOWN ON THE PAN (OR TAP IT)', 'SWIPE ↓'); handTo(V3(pn.home.x, T + 0.3, pn.home.z)); lidOn(pn); yield () => pn.steam >= (steamBand()[0] + steamBand()[1]) / 2;
    cap('STEAM IN THE GREEN BAND: SWIPE UP TO LIFT THE LID', 'SWIPE ↑'); handTo(V3(pn.home.x, T + 0.3, pn.home.z)); lidOff(pn); yield 1.1;
    cap('FLICK UP ON THE PAN: IT FLIPS ONTO THE PLATE, CRUST UP', 'FLICK'); handTo(V3(pn.home.x, T + 0.2, pn.home.z)); flipPan(pn, true); yield () => plate && plate.st === 'sauce'; yield 0.5;
    setFocus('sauce'); cap('HOLD THE SOY BOTTLE. LET GO AT THE RED LINE', 'HOLD'); handTo(V3(K.soy.x, T + 0.25, K.soy.z)); plate.pouring = true; yield () => plate.sauce >= 0.8; soyRelease(); yield 0.6;
    if (plate && plate.needChili) { cap('CHILI OIL ON THE TICKET: TAP THE JAR ' + plate.needChili + ' TIMES', 'TAP'); for (let i = 0; i < plate.needChili; i++) { handTo(V3(K.chili.x, T + 0.15, K.chili.z)); chiliDrop(); yield 0.45; } }
    yield () => S.reveal; cap('PLATE UP! SERVE IT TO ' + who, 'SERVE'); yield 1.8; revealChoice(S.reveal.ok ? 'serve' : 'bin');
    yield () => S.pay; cap('THEY PAID ' + S.pay.paid + 'g FOR A ' + S.pay.total + 'g BILL. TAP COINS TO GIVE ' + S.pay.owed + 'g CHANGE', 'COINS'); yield 1.8;
    while (S.pay) { const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); DM.key = v + 'g'; giveCoin(v); yield 0.8; }
    DM.served++; cap('EXACT CHANGE! THAT IS A SHIFT AT FOXY GYOZA', '✓'); yield 2.0; cap('YOUR TURN! TAP PUT ME TO WORK', 'GO'); yield 2.4; demoStop(); }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.6)); if (!DM.gen) return; if (S.react || S.payOut) return; if (DM.until) { if (!DM.until()) return; DM.until = null; } if (DM.wait > 0) { DM.wait -= dt; return; }
    const r = DM.gen.next(); if (r.done) { DM.gen = null; return; } if (typeof r.value === 'function') DM.until = r.value; else DM.wait = r.value || 0; }
  function demoStart() { if (DM.on) return; audio.init && audio.init(); WK.dialog = null; DM.on = true; DM.served = 0; DM.day0 = S.day; S.day = Math.max(S.day, 2); S.done = null; S.demo = true; if (!['intro', 'done', 'walk'].includes(S.phase)) { clearKitchen(); S.phase = 'intro'; } startShift(); S.next = 99; setTimeout(() => { if (DM.on) newOrder({ fill: 'pork', crust: 'golden', chili: true, scallion: false }); }, 250); DM.gen = demoScript(); DM.wait = 0; DM.until = null; }
  function demoStop() { if (!DM.on) return; SND.setMusic('calm'); SND.setSizzle(0); SND.setSteam(0); DM.on = false; S.demo = false; DM.gen = null; hand.visible = false; DM.hint = null; S.day = DM.day0; clearKitchen(); S.phase = 'intro'; S.done = null; ben.visible = true; kiko.visible = true; ben.position.copy(BEN_INTRO); ben.rotation.y = -0.3; setUniform(true); glideTo(wideShot(), 1.2); }

  // ---------- NEXT-STEP HINT: pulsing rings over the next thing to do + the NEXT line ----------
  // NEXT-STEP marker: a thin ring drawn AROUND the thing to touch (never over it), gently breathing; the kit's expanding pulse washed over the pan in close-ups
  const RINGS = (() => { const g = new THREE.Group(); const yel = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 56), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false, side: THREE.DoubleSide })); const ink = new THREE.Mesh(new THREE.RingGeometry(1, 1.045, 56), new THREE.MeshBasicMaterial({ color: 0x201e1d, transparent: true, depthWrite: false, side: THREE.DoubleSide })); [yel, ink].forEach(m => { m.rotation.x = -Math.PI / 2; m.renderOrder = 28; g.add(m); });
    const ticks = []; for (let i = 0; i < 4; i++) { const t = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.004, 0.035), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); t.renderOrder = 28; g.add(t); ticks.push(t); }
    g.visible = false; scene.add(g);
    return { place(h, t) { g.visible = !!h; if (!h) return; const r = h.r, br = 1 + Math.sin(t * 5) * 0.04; g.position.set(h.p.x, h.p.y + 0.11, h.p.z); g.scale.set(r * br, 1, r * br); yel.material.opacity = 0.75 + Math.sin(t * 5) * 0.2; ink.material.opacity = 0.6; ticks.forEach((m, i) => { const a = i * Math.PI / 2 + t * 0.8; m.position.set(Math.cos(a) * 1.12, 0, Math.sin(a) * 1.12); m.rotation.y = -a; }); } }; })();
  function nextHint() { if (S.phase !== 'shift' || S.pay || S.reveal || S.react) return null; const P3 = (x, z, y = T) => V3(x, y, z), H = (p, station, text, r = 0.16) => ({ p, station, text, r: r + 0.06 });
    for (const pn of pans) { if (!pn.g.visible) continue; const pp = P3(pn.home.x, pn.home.z);
      if (pn.st === 'burnt') return H(pp, 'pan', 'BURNT · TAP THE PAN TO BIN IT', 0.32);
      if (pn.st === 'water') return H(pp, 'pan', 'LID ON! SWIPE DOWN ON THE PAN', 0.32);
      if (pn.st === 'steam' && pn.steam >= steamBand()[0]) return H(pp, 'pan', 'LIFT THE LID NOW · SWIPE UP ON THE PAN', 0.32);
      if (pn.st === 'fry') { const z = CRUST[pn.want || 'golden']; if (pn.crust >= z.lo) return H(P3(K.jug.x, K.jug.z), 'pan', z.name + '! TAP THE JUG TO ADD WATER', 0.18); } }
    if (plate && plate.st === 'sauce') { if (!plate.sauceDone) return H(P3(K.soy.x, K.soy.z), 'sauce', 'HOLD THE SOY BOTTLE · LET GO AT THE RED LINE', 0.14); if (plate.chili < plate.needChili) return H(P3(K.chili.x, K.chili.z), 'sauce', 'TAP THE CHILI OIL · ' + plate.chili + ' / ' + plate.needChili, 0.14); if (plate.needScal && plate.scal < 0.9) return H(P3(K.plate.x, K.plate.z), 'sauce', 'RUB OVER THE PLATE TO SPRINKLE SCALLIONS', 0.3); }
    const crisp = pans.find(pn => pn.g.visible && pn.st === 'crisp'); if (crisp && !plate) return H(P3(crisp.home.x, crisp.home.z), 'pan', 'FLICK UP ON THE PAN · FLIP IT ONTO THE PLATE', 0.32);
    const C = claim(), ws = orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat); if (!ws.length) return fold.st === 'pleat' ? H(P3(K.board.x, K.board.z), 'fold', 'WIGGLE ACROSS THE SEAM TO PLEAT · ' + fold.pleats + ' / ' + fold.need, 0.24) : null;
    for (const [p, o] of C.pass) if (o.st === 'wait') return H(p.g.position.clone().setY(K.pass.y), 'pass', 'TAP THE PLATE TO SERVE ' + CUST[o.ci].name, 0.24);
    const need = ws.find(q => !C.order.has(q));
    if (need) { const pn = pans.find(p => p.g.visible && p.st === 'load' && panFill(p) === need.fill) || pans.find(p => p.g.visible && p.st === 'empty'), have = tray.filter(t => t.fill === need.fill).length, fname = FILLINGS[need.fill].name;
      if (pn && have >= GYOZA.plate - pn.items.length) return H(P3(pn.home.x, pn.home.z), 'pan', 'TAP THE PAN TO LINE IT WITH ' + fname + ' · ' + pn.items.length + ' / 5', 0.32);
      if (fold.filling !== need.fill && (fold.st === 'empty' || (fold.st === 'fill' && fold.fill < 0.05))) return H(P3(K.bowls[need.fill].x, K.bowls[need.fill].z), 'fold', 'TAP THE ' + fname + ' BOWL', 0.22);
      if (fold.st === 'fill') return H(P3(K.board.x, K.board.z), 'fold', 'HOLD THE WRAPPER TO SPOON IN ' + FILLINGS[fold.filling].name + ' · ' + have + ' / 5 READY', 0.26);
      if (fold.st === 'pleat') return H(P3(K.board.x, K.board.z), 'fold', 'WIGGLE ACROSS THE SEAM TO PLEAT · ' + fold.pleats + ' / ' + fold.need, 0.26);
      if (fold.st === 'empty') return H(P3(K.wrapStack.x, K.wrapStack.z), 'fold', 'TAP THE WRAPPERS FOR A NEW ONE', 0.16); }
    const ld = pans.find(p => p.g.visible && p.st === 'load'); if (ld) { const f = panFill(ld), have = tray.filter(t => t.fill === f).length; if (have) return H(P3(ld.home.x, ld.home.z), 'pan', 'TAP THE PAN TO ADD GYOZA · ' + ld.items.length + ' / 5', 0.32); if (fold.st === 'pleat') return H(P3(K.board.x, K.board.z), 'fold', 'WIGGLE ACROSS THE SEAM TO PLEAT · ' + fold.pleats + ' / ' + fold.need, 0.26); return H(P3(K.board.x, K.board.z), 'fold', 'FOLD MORE ' + FILLINGS[f].name + ' · HOLD THE WRAPPER', 0.26); }
    if (fold.st === 'pleat') return H(P3(K.board.x, K.board.z), 'fold', 'WIGGLE ACROSS THE SEAM TO PLEAT · ' + fold.pleats + ' / ' + fold.need, 0.26);
    const fr = pans.find(p => p.g.visible && p.st === 'fry'); if (fr) return H(P3(fr.home.x, fr.home.z), 'pan', 'FRYING · ADD WATER AT ' + CRUST[fr.want || 'golden'].name, 0.32);
    const sm = pans.find(p => p.g.visible && p.st === 'steam'); if (sm) return H(P3(sm.home.x, sm.home.z), 'pan', 'STEAMING · LIFT THE LID IN THE GREEN BAND', 0.32);
    return null; }
  let HINT = null, hintT = 0;
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === 'all' || S.focus === HINT.station) return; if (G.hold || G.wig || G.rub || G.flick || G.jug || G.drag || S.reveal || S.react || S.pay) return; if (fold.st === 'pleat' && S.focus === 'fold') return; if (S.focus === 'pan' && pans.some(p => p.g.visible && (p.st === 'fry' || p.st === 'water' || p.st === 'steam' || p.st === 'crisp'))) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 1.2 && performance.now() - (S.userFocusT || 0) > 4500) S.focus = HINT.station; }
  function updHint(dt) { hintT += dt; HINT = DM.on ? (DM.hint || null) : nextHint(); RINGS.place(HINT && !S.reveal && !S.react && S.phase === 'shift' ? HINT : null, hintT, dt); }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false, claimT = 0;
  function hopStep(m, dt) { const h = m.userData.hop; if (!h) return; if (h.t === 0) { h.ry0 = m.rotation.y; h.rz0 = m.rotation.z; h.sc0 = m.scale.x; } h.t = Math.min(1, h.t + dt / (h.dur || 0.3)); const k = smooth(0, 1, h.t); m.position.lerpVectors(h.from, h.to, k); m.position.y += Math.sin(h.t * Math.PI) * (h.arc ?? 0.12);
    if (h.ry != null) m.rotation.y = h.ry0 + (h.ry - h.ry0) * k; if (h.rz != null) m.rotation.z = h.rz0 + (h.rz - h.rz0) * k; if (h.s1 != null) m.scale.setScalar(h.sc0 + (h.s1 - h.sc0) * k); if (h.t >= 1) m.userData.hop = null; }
  function camTo(sh, dt, k = 5) { camera.position.lerp(sh.pos, Math.min(1, dt * k)); CAM.look.lerp(sh.look, Math.min(1, dt * k)); }
  function step(dt) { const now = clock.elapsedTime, work = S.phase === 'shift';
    // camera
    if (S.reveal) { S.reveal.t += dt; camTo(shotFor('reveal', () => [V3(K.plate.x - 0.3, T, K.plate.z - 0.3), V3(K.plate.x + 0.3, T, K.plate.z + 0.3), V3(K.plate.x, T + 0.22, K.plate.z)], 0.75, 0.25, 0.14), dt, 6); if (plate && plate.g) plate.g.rotation.y += dt * 1.2; }
    else if (S.pay || S.payOut) { const port = CW() < CHh(); camTo(shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0.25, 0.07), dt); regDisp.scale.set(port ? 0.36 : 0.46, port ? 0.133 : 0.17, 1); }
    else if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position; camTo(shotFor('react' + o.spot, () => [V3(f.x - 0.45, 1.25, f.z), V3(f.x + 0.45, 1.25, f.z), V3(f.x, 2.35, f.z), V3(f.x, 1.55, f.z - 0.3)], 0.12, 0.12, 0.1), dt); if (S.react.t > (DM.on ? 2.0 : 2.6)) reactDone(); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if (S.phase === 'walk') walkStep(dt);
    else if (S.phase === 'intro' || S.phase === 'done') camTo(wideShot(), dt, 4);
    else if (S.phase === 'shift' || S.phase === 'glide') camTo(workShot(), dt, 3.2);
    if (S.phase === 'walk' && CAM.t < 1) walkStep(0);
    camera.lookAt(CAM.look);
    { const outside = S.phase === 'intro' || S.phase === 'done' || S.phase === 'walk'; K.front.forEach(m => m.visible = !outside); K.booths.forEach(m => m.visible = S.phase !== 'intro' && S.phase !== 'done'); diners.forEach(d => { d.f.visible = d.pl.visible = S.phase !== 'intro' && S.phase !== 'done'; }); }
    { const hide = (S.phase === 'shift' || S.phase === 'glide') && (CAM.t > 0.35 || !CAM.from); K.cut.forEach(m => m.visible = !hide); K.lanterns.forEach(l => { if (l.position.z >= 0 || !hide) l.visible = true; }); lampGl.forEach((s, i) => { s.visible = !hide || i < 2 || i === 5; s.material.opacity = 0.45 + Math.sin(now * 2.3 + i) * 0.05; }); if (S.phase === 'walk') { K.ceil.forEach(m => m.visible = false); lanternFade(); } }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.42 * p.life; p.s.scale.setScalar(0.2 + (1 - p.life) * 0.5); }
    if (K.luckyArm) K.luckyArm.rotation.z = -0.6 + Math.sin(now * 3) * 0.5;
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) S.phase = 'shift'; }
    if (work) { S.t += dt; const left = GYOZA.shift - S.t; if (!DM.on && left < 10.5 && Math.ceil(left) !== S.lastTick) { S.lastTick = Math.ceil(left); if (left > 0) SND.sfx('tick'); } if (S.t >= GYOZA.shift && !DM.on) endShift(); }
    { let siz = 0, st = 0; if (work) for (const pn of pans) { if (!pn.g.visible) continue; if (pn.st === 'fry') siz += 0.55 + pn.crust * 0.4; else if (pn.st === 'water') siz += 1.3; else if (pn.st === 'crisp') siz += 0.45; else if (pn.st === 'burnt') siz += 0.3; if (pn.st === 'steam') { st += 1; siz += 0.15; } } SND.setSizzle(Math.min(1.4, siz)); SND.setSteam(Math.min(1, st)); }
    SND.audT = (SND.audT || 0) - dt; if (SND.audT <= 0) { if (fold.st === 'fill' && fold.holding) { SND.sfx('scoop'); SND.audT = 0.13; } else if (plate && plate.pouring) { SND.sfx('glug'); SND.audT = 0.1; } else SND.audT = 0.05; }
    SND.step(dt);
    if (DM.on) demoStep(dt);
    updHint(dt); if (work) autoFollow();
    claimT -= dt; if (claimT <= 0) { claimT = 0.25; const C = claim(); pans.forEach(pn => { if (pn.st === 'fry' || pn.st === 'load') pn.want = (C.pan.get(pn) || {}).crust || null; }); }
    // register
    regDisp.visible = !!(S.pay || S.payOut); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; tone(2400 + Math.random() * 400, 0.04, 0.03, 'square'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, K.pass.y + 0.03, K.pass.z); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    // fold station
    if (fold.st === 'fill' && fold.holding) { fold.fill += dt * 0.8; fold.mesh.userData.setFill(fold.fill); if (Math.random() < dt * 6) tone(240 + Math.random() * 60, 0.05, 0.02, 'sine'); if (fold.fill > 1.0) burst(); }
    if (fold.mesh && fold.st === 'pleat') { const u = fold.mesh.userData; u.foldT = Math.min(1, (u.foldT || 0) + dt / 0.25); fold.mesh.scale.set(1.6, 1.6 * (0.3 + 0.7 * u.foldT), 1.6); }
    if (fold.mesh) hopStep(fold.mesh, dt); tray.forEach(it => hopStep(it.mesh, dt));
    // pans
    for (const pn of pans) { if (!pn.g.visible) continue; pn.items.forEach(it => hopStep(it.mesh, dt));
      if (pn.st === 'fry') { pn.crust += dt * 0.075; if (Math.random() < dt * 9) puff(pn.home.x + rr(-0.2, 0.2), T + 0.12, pn.home.z + rr(-0.2, 0.2), pn.crust > 0.9 ? 0x5a4a3a : 0xfff3d0, 1); if (Math.random() < dt * 5) (() => {})(0.06, 3200, 0.04); if (upg('bell') && pn.want && !pn.pinged && pn.crust >= CRUST[pn.want].lo) { pn.pinged = true; tone(1760, 0.1, 0.05); } if (pn.crust > 1.0) { pn.st = 'burnt'; pn.oil.material = toon('#2a1a10'); pn.items.forEach(it => it.mesh.userData.setCrust(1.1)); SND.sfx('burnt'); buzz(80); flash('BURNT! TAP THE PAN TO BIN IT', '#ec3013', 1.6); } }
      else if (pn.st === 'water') { pn.waterT += dt; if (Math.random() < dt * 16) puff(pn.home.x + rr(-0.22, 0.22), T + 0.14, pn.home.z + rr(-0.22, 0.22), 0xffffff, 1); pn.steam = Math.min(1, pn.steam + dt * 0.06); if (pn.waterT > 2.5) { pn.lidLat = 9; pn.st = 'steam'; pn.leak = true; flash('THE STEAM GOT AWAY · LID LATE', '#e6b45a', 1.2); } }
      else if (pn.st === 'steam') { pn.steam = Math.min(1, pn.steam + dt * (pn.lid.visible ? 0.15 : 0.075)); pn.water.scale.setScalar(Math.max(0.2, 1 - pn.steam * 0.8)); if (Math.random() < dt * 4) puff(pn.home.x + rr(-0.25, 0.25), T + 0.3, pn.home.z + rr(-0.25, 0.25), 0xffffff, 1); if (upg('bell') && !pn.spinged && pn.steam >= steamBand()[0]) { pn.spinged = true; tone(1760, 0.1, 0.05); } }
      else if (pn.st === 'crisp') { pn.crispT += dt; pn.crustAtWater = Math.min(1.05, pn.crustAtWater + dt * 0.012); if (Math.random() < dt * 4) puff(pn.home.x + rr(-0.2, 0.2), T + 0.12, pn.home.z + rr(-0.2, 0.2), 0xfff3d0, 1); }
      pn.lidY = damp(pn.lidY, pn.lid.visible && (pn.st === 'steam') ? T + 0.07 : T + 0.8, 14, dt); pn.lid.position.y = pn.lidY + (pn.st === 'steam' ? Math.sin(now * 30) * 0.002 : 0); if (pn.lid.visible && pn.st !== 'steam' && pn.lidY > T + 0.7) pn.lid.visible = false;
      if (pn.st === 'fry' || pn.st === 'load') pn.oil.material = toon(crustCol(Math.min(1, 0.15 + pn.crust * 0.8)));
      { const on = pn.st === 'fry' || pn.st === 'water' || pn.st === 'steam' || pn.st === 'crisp', amt = pn.st === 'water' ? 1 : pn.st === 'fry' ? 0.75 : 0.4; pn.bubbles.forEach((b, k) => { b.visible = on && k < pn.bubbles.length * amt; if (b.visible) { const q = Math.sin(now * b.userData.sp + b.userData.ph); b.scale.setScalar(Math.max(0.05, q) * (pn.st === 'water' ? 1.6 : 1)); } }); }
      pn.gauge.visible = (pn.st === 'fry' || pn.st === 'water' || pn.st === 'steam') && work; if (pn.gauge.visible) drawGauge(pn);
      if (pn.flip) { const F = pn.flip; F.t = Math.min(1, F.t + dt / (F.big ? 1.0 : 0.85)); const above = V3(K.plate.x, T + 0.55, K.plate.z);
        if (F.t < 0.5) { const k = smooth(0, 1, F.t / 0.5); pn.g.position.lerpVectors(pn.home, above, k); pn.g.position.y += Math.sin(k * Math.PI) * (F.big ? 0.35 : 0.2); pn.g.rotation.z = -Math.PI * smooth(0.35, 1, k); }
        else { if (!F.dropped) { F.dropped = true; const p = plate; pn.items.forEach((it, i) => { const w = V3(); it.mesh.getWorldPosition(w); pn.g.remove(it.mesh); p.g.add(it.mesh); it.mesh.position.copy(p.g.worldToLocal(w)); it.mesh.rotation.set(0, it.mesh.rotation.y, Math.PI); it.mesh.userData.setCrust(p.crust); const f = FAN[i]; it.mesh.userData.hop = { from: it.mesh.position.clone(), to: V3(f.x, 0.09, f.z), t: 0, dur: 0.28 + i * 0.04, arc: 0.06, ry: f.ry + Math.PI / 2, s1: 0.85 }; }); pn.items = []; SND.sfx('plate'); buzz(20); for (let i = 0; i < 8; i++) puff(K.plate.x + rr(-0.2, 0.2), T + 0.15, K.plate.z + rr(-0.2, 0.2), 0xfff3d0, 1); }
          const k = smooth(0, 1, (F.t - 0.5) / 0.5); pn.g.position.lerpVectors(above, pn.home, k); pn.g.rotation.z = -Math.PI * (1 - smooth(0, 0.6, k)); }
        if (F.t >= 1) { pn.flip = null; pn.g.position.copy(pn.home); pn.g.rotation.z = 0; Object.assign(pn, { st: 'empty', crust: 0, steam: 0, lidLat: null, pinged: false, spinged: false, leak: false }); pn.oil.material = toon('#6a5020'); if (plate) { plate.st = 'sauce'; flash('CRUST UP! NOW THE SAUCE', '#22c55e', 1.1); tone(1046, 0.08, 0.05); setTimeout(() => tone(1397, 0.1, 0.05), 90); } } } }
    // plate + sauce
    if (plate) { plate.g.children.forEach(m => hopStep(m, dt)); const d = plate.g.userData;
      if (plate.pouring) { plate.sauce = Math.min(1.12, plate.sauce + dt * 0.55); K.soyMesh.rotation.z = damp(K.soyMesh.rotation.z, 1.9, 10, dt); const w = V3(); d.dish.getWorldPosition(w); soyStream.visible = true; const top = T + 0.3, bot = w.y + 0.005 + 0.03 * Math.min(1, plate.sauce), h = Math.max(0.02, top - bot); soyStream.scale.set(1, h, 1); soyStream.position.set(w.x, bot + h / 2, w.z); if (plate.sauce > 1.0 && !plate.spilt) { plate.spilt = true; SND.sfx('spill'); flash('OVERFLOW!', '#ec3013', 0.9); tone(200, 0.2, 0.04, 'sawtooth'); } }
      else K.soyMesh.rotation.z = damp(K.soyMesh.rotation.z, 0, 10, dt);
      d.sauce.visible = plate.sauce > 0.01; d.sauce.scale.y = Math.max(0.001, 0.03 * Math.min(1.05, plate.sauce)); d.sauce.position.y = 0.002 + d.sauce.scale.y / 2; d.chili.forEach(m => m.position.y = 0.006 + 0.03 * Math.min(1, Math.max(plate.sauce, 0.15)));
      if (plate.st === 'sauce' && Math.random() < dt * 2) puff(plate.g.position.x + rr(-0.1, 0.1), T + 0.18, plate.g.position.z + rr(-0.1, 0.1), 0xffffff, 1); }
    if (!plate || !plate.pouring) soyStream.visible = false;
    K.chiliMesh.position.y = T + Math.max(0, Math.sin((K.chiliMesh.userData.bob || 0) * Math.PI)) * 0.06; if (K.chiliMesh.userData.bob > 0) K.chiliMesh.userData.bob = Math.max(0, K.chiliMesh.userData.bob - dt * 4);
    { const j = K.jugMesh; if (j.userData.tip > 0) { j.userData.tip = Math.max(0, j.userData.tip - dt * 1.6); j.rotation.x = -Math.sin(j.userData.tip * Math.PI) * 1.2; } }
    // pass plates sliding, served plates leaving
    for (const p of [...pass, ...outPlates]) { if (!p.slide) continue; const sl = p.slide; sl.t = Math.min(1, sl.t + dt / sl.dur); p.g.position.lerpVectors(sl.from, sl.to, smooth(0, 1, sl.t)); p.g.position.y += Math.sin(sl.t * Math.PI) * 0.15; if (sl.t >= 1) { p.slide = null; if (sl.gone) { scene.remove(p.g); outPlates.splice(outPlates.indexOf(p), 1); } } }
    // customers
    if (work || S.phase === 'glide') { S.next -= dt; const maxQ = Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st !== 'leave').length < maxQ && S.t < GYOZA.shift - 20) { newOrder(); S.next = Math.max(16, 30 - S.day * 2) * rr(0.8, 1.2); } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot]; o.t = (o.t || 0) + dt; kit.animFox(o.f, dt, o.st === 'walk' || o.st === 'leave' ? 2 : 0);
      if (o.st === 'walk') { o.f.position.x = damp(o.f.position.x, sp.x, 5, dt); o.f.position.z = damp(o.f.position.z, sp.z, 5, dt); o.f.rotation.y = Math.PI; if (Math.abs(o.f.position.x - sp.x) < 0.12) { o.st = 'wait'; say(CUST[o.ci].name + ': "' + o.line + '"', 3); SND.sfx('bell'); } }
      else if (o.st === 'wait' && work) { o.pat -= DM.on ? 0 : dt; o.f.userData.mood = o.pat / o.patMax < 0.3 ? 'angry' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; flash(CUST[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); SND.sfx('angry'); } }
      else if (o.st === 'leave') { o.f.rotation.y = Math.PI / 2 + Math.PI; o.f.position.x += dt * 2.4; if (o.t > 3.5) { o.f.visible = false; orders.splice(i, 1); } } }
    // cast
    const greet = S.phase === 'intro' || S.phase === 'done'; if (greet) { ben.position.y = 0; ben.rotation.y = damp(ben.rotation.y, -0.3, 4, dt); ben.userData.mood = 'excited'; kit.animFox(ben, dt, 0); } else if (S.phase !== 'walk') kit.animFox(ben, dt, 0);
    if ((greet || WK.wave > 0) && BP.arms && BP.arms[0]) { const arm = BP.arms[0]; arm.rotation.set(-0.25, 0, -2.55 + Math.sin(now * 7) * 0.32); } if (WK.wave > 0) WK.wave -= dt;
    kiko.userData.mood = 'happy'; if (S.phase !== 'walk') { kiko.userData.lookAt = greet ? camera.position.clone() : null; kiko.userData.talking = false; } kit.animFox(kiko, dt, 0);
    diners.forEach((dn, i) => { if (!dn.f.visible) return; dn.t += dt; dn.f.userData.talking = Math.sin(dn.t * 0.7 + i * 2) > 0.55; kit.animFox(dn.f, dt, 0); seatPose(dn.f); if (Math.random() < dt * 1.2) puff(dn.pl.position.x + rr(-0.08, 0.08), 0.95, dn.pl.position.z, 0xffffff, 1); }); }
  const outPlates = [];
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- what the page draws ----------
  function meter() {
    if (fold.st === 'fill' && fold.holding) { const [lo, hi] = fillBand(), mx = 1.15; return { title: 'FILL · ' + FILLINGS[fold.filling].name, zone: fold.fill < lo ? 'MORE…' : fold.fill <= hi ? 'GREEN! LET GO' : 'TOO FULL!', zoneCol: fold.fill < lo ? '#ffffff' : fold.fill <= hi ? '#22c55e' : '#ec3013', want: 'LET GO IN THE GREEN', segs: [[lo, '#9ca3af'], [hi - lo, '#22c55e', true], [1 - hi, '#e6b45a'], [mx - 1, '#ec3013']].map(([f, col, out]) => ({ f, col, out: !!out })), x: Math.min(1, fold.fill / mx) }; }
    if (fold.st === 'pleat' && (S.focus === 'fold' || G.wig)) return { title: 'PLEATS ' + fold.pleats + ' / ' + fold.need, zone: 'WIGGLE!', zoneCol: '#ffd23a', want: 'BACK AND FORTH ACROSS THE SEAM', segs: Array.from({ length: fold.need }, (_, i) => ({ f: 1, col: i < fold.pleats ? '#22c55e' : '#3a3836', out: false })), x: -1 };
    if (plate && plate.pouring) { const mx = 1.1; return { title: 'SOY', zone: plate.sauce < 0.72 ? 'POURING…' : plate.sauce <= 0.9 ? 'THE LINE! LET GO' : 'OVER!', zoneCol: plate.sauce < 0.72 ? '#ffffff' : plate.sauce <= 0.9 ? '#22c55e' : '#ec3013', want: 'STOP AT THE RED LINE', segs: [[0.72, '#9ca3af'], [0.18, '#22c55e', true], [0.1, '#e6b45a'], [mx - 1, '#ec3013']].map(([f, col, out]) => ({ f, col, out: !!out })), x: Math.min(1, plate.sauce / mx) }; }
    { const pn = pans.find(p => p.g.visible && (p.st === 'water' || p.st === 'steam')) || pans.find(p => p.g.visible && p.st === 'fry'); if (pn) { if (pn.st === 'fry') { const v = pn.crust, w = pn.want || 'golden', z = zoneOf(v); return { title: 'CRUST', zone: z === 'pale' ? 'PALE' : z === 'burnt' ? 'BURNING!' : CRUST[z] ? CRUST[z].name : '…', zoneCol: z === w ? '#22c55e' : z === 'burnt' ? '#ec3013' : '#ffffff', want: 'TICKET WANTS ' + CRUST[w].name, segs: [[0.22, '#9ca3af'], [0.16, CRUST.light.col, w === 'light'], [0.08, '#6b5a40'], [0.18, CRUST.golden.col, w === 'golden'], [0.08, '#6b5a40'], [0.16, CRUST.dark.col, w === 'dark'], [0.17, '#ec3013']].map(([f, col, out]) => ({ f, col, out: !!out })), x: Math.min(1, v / 1.05) }; }
      const [lo, hi] = steamBand(); return { title: pn.st === 'water' ? 'LID ON!' : 'STEAM', zone: pn.st === 'water' ? 'SWIPE DOWN!' : pn.steam < lo ? 'STEAMING…' : pn.steam <= hi ? 'LIFT THE LID!' : 'GOING GLUEY', zoneCol: pn.st === 'water' ? '#ffd23a' : pn.steam < lo ? '#ffffff' : pn.steam <= hi ? '#22c55e' : '#ec3013', want: pn.st === 'water' ? 'SLAM THE LID' : 'LIFT IN THE GREEN', segs: [[lo, '#9ca3af'], [hi - lo, '#22c55e', true], [0.85 - hi, '#e6b45a'], [0.15, '#ec3013']].map(([f, col, out]) => ({ f, col, out: !!out })), x: pn.steam }; } }
    return null; }
  function hud() {
    const ticket = o => ({ id: o.id, name: CUST[o.ci].name, role: CUST[o.ci].role, fill: FILLINGS[o.fill].name, fillCol: FILLINGS[o.fill].dot, crust: CRUST[o.crust].name, crustCol: CRUST[o.crust].col, extras: ['SOY', ...(o.chili ? ['CHILI'] : []), ...(o.scallion ? ['SCALLION'] : [])], total: o.total, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait' });
    const pansB = pans.filter(p => p.g.visible), bp = pansB.map(p => p.st);
    return { phase: S.phase, day: S.day, left: Math.max(0, GYOZA.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), trayN: tray.length, trayList: Object.entries(tray.reduce((c, t) => (c[t.fill] = (c[t.fill] || 0) + 1, c), {})).map(([k, n]) => n + ' ' + FILLINGS[k].name), plateTxt: plate && plate.st === 'sauce' ? plateNeedsText(plate) : '', passN: pass.length,
      flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, muted: SND.muted(), uniform: !!save.flag('gyozaUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: fillsAvail().map(k => FILLINGS[k].name + ' ' + FILLINGS[k].price + 'g'), crusts: crustsAvail().map(k => CRUST[k].name), extras: extrasAvail().map(k => EXTRAS[k].name),
      demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 1 } : null, focus: S.focus, meter: work() ? meter() : null, hint: HINT && HINT.text && !S.reveal && !S.react ? { text: HINT.text, station: HINT.station } : null,
      reveal: S.reveal ? { ...S.reveal } : null, react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip, note: S.react.note } : null, pay: S.pay ? { ...S.pay } : null,
      badges: { all: orders.filter(o => o.st === 'wait').length ? orders.filter(o => o.st === 'wait').length + ' WAIT' : '', fold: fold.st === 'pleat' ? 'PLEAT ' + fold.pleats + '/' + fold.need : tray.length ? tray.length + ' READY' : '', pan: bp.includes('burnt') ? 'BURNT' : bp.includes('water') ? 'LID!' : pansB.some(p => p.st === 'steam' && p.steam >= steamBand()[0]) ? 'LIFT!' : bp.includes('crisp') ? 'FLIP!' : bp.includes('steam') ? 'STEAM' : bp.includes('fry') ? 'FRYING' : bp.includes('load') ? pansB.find(p => p.st === 'load').items.length + ' / 5' : '', sauce: plate && plate.st === 'sauce' ? 'SAUCE!' : '', pass: pass.length ? pass.length + ' UP' : '' },
      walk: S.phase === 'walk' ? { prompt: WK.dialog ? null : WK.near ? WK.near.label : null, dialog: WK.dialog ? { name: WK.dialog.name, role: WK.dialog.role, text: WK.dialog.text, choices: WK.dialog.choices || null, step: WK.dialog.step || 1, total: WK.dialog.total || 1, more: !!WK.dialog.choices, required: false } : null, toast: WK.toast, seated: !!WK.seat } : null };
    function work() { return S.phase === 'shift'; } }
  function emit() { onState(hud()); }
  { const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); camera.lookAt(CAM.look); }
  const onVis = () => { if (document.hidden) { SND.suspend(); PAUSE = true; } else { PAUSE = false; SND.resume(); clock.getDelta(); } }; document.addEventListener('visibilitychange', onVis);
  frame();
  if (OPT.walk) enterWalk();
  const api = {
    setSafe(top, bottom, left = 0, right = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3 || Math.abs((SAFE.right || 0) - right) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; SAFE.right = right; } },
    revealChoice, setFocus, demoStart, demoStop, startShift, endShift, giveCoin, buyUpgrade, hud, toIntro, enterWalk, setPaused(v) { PAUSE = !!v; },
    // Game HUD engine contract (walk mode)
    start() {}, toggleSound() { SND.unlock(); return SND.toggle(); }, talk, choose, closeDialog() { WK.dialog = null; }, nextLine, clearToast() { WK.toast = null; }, melee, range() { walkToast('No lasers in the dining room!', 1.6); }, jump, meleeUp() {}, useItem() { walkToast('Save it for outside. In here we eat gyoza.', 2); }, closeWheel() {}, skipTime() {},
    setHudPad() {}, setStick(x, y) { WK.stick.x = x; WK.stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 5, pitch: 0.6 }; }, setCam() {}, setMinimap() {}, cycleWeather() {},
    mapData() { const b = ben.position; return { p: [b.x, b.z, ben.rotation.y], b: [['KITCHEN', K.origin.x, K.z + K.origin.z], ['DOOR', K.door.x, K.door.z], ['TABLES', K.tables[0].x, K.tables[0].z]], f: [[kiko.position.x, kiko.position.z]], e: [], q: [kiko.position.x, kiko.position.z, OPT.owner] }; },
    // test hooks
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, GYOZA.shift - t); }, _state: () => S, _scr: p => { const r = renderer.domElement.getBoundingClientRect(), s = scr(p); return { x: r.left + s.x, y: r.top + s.y }; },
    _auto: () => ({ K, fold, tray, pans, orders, pass, get plate() { return plate; }, ben, kiko, WK, newOrder, loadPan, addWater, lidOn, lidOff, flipPan, spawnWrapper, fillRelease, addPleat, selectFill, chiliDrop, scalRub, soyRelease, serve, claim }),
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKey); removeEventListener('keyup', onKeyUp); document.removeEventListener('visibilitychange', onVis); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
