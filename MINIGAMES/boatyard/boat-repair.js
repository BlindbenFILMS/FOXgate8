// 8 GATES — JON'S BOATWORKS [jonBoatworks]. Ben fixes boats at Jon's floating workshop. One boat at a time, no clock, scored on quality. World not chosen yet.
// Boats come in by water, the lift raises them, Ben works the job card, hands the boat back, the owner reacts + pays, the boat leaves by water. 3 boats = a day.
// Tasks: SCRAPE (swipe barnacles) · PATCH (rub to sand, tap to patch, hold to seal and let go in the green) · PUMP (tap) · PROP (tap 3x to unscrew, pick the size on the card) · SAIL (swipe across tears to stitch) · PAINT (pick the colour, swipe each panel; the name goes on).
// Boats: SPEEDBOAT · SAILBOAT · JETSKI. Save keys boat.yard.*, flag boatUniform. Built on engine/restaurant-kit.js (stage, camera fit, hint rings, uniform).
// MERGE: buildYard(ctx) builds the workshop at an origin; createBoatRepair({ container, onState }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { PAINTS, PK, DY, RAISE, buildYard, propMesh } from './yard-room.js';
export { PAINTS, buildYard, propMesh };

export const BOATYARD = { name: "JON'S BOATWORKS", room: 'jonBoatworks', perDay: 3 };
export const BOATS = {
  speed: { name: 'SPEEDBOAT', L: 5, W: 1.9, H: 0.9, price: 16, tasks: ['scrape', 'patch', 'pump', 'prop', 'paint'] },
  sail: { name: 'SAILBOAT', L: 5.6, W: 2.0, H: 0.9, price: 20, tasks: ['scrape', 'patch', 'pump', 'prop', 'sail', 'paint'] },
  jet: { name: 'JETSKI', L: 3.0, W: 1.15, H: 0.6, price: 12, tasks: ['scrape', 'patch', 'prop', 'paint'] } };
export const TASKS = { scrape: { label: 'SCRAPE', name: 'Scrape off the barnacles' }, patch: { label: 'PATCH', name: 'Patch the hull holes' }, pump: { label: 'PUMP', name: 'Pump out the water' }, prop: { label: 'PROP', name: 'Replace the propeller' }, sail: { label: 'SAIL', name: 'Sew the sail' }, paint: { label: 'PAINT', name: 'Repaint + name the hull' } };
const ORDER = ['scrape', 'patch', 'pump', 'prop', 'sail', 'paint'];
export const UPGRADES = [
  { id: 'sander', name: 'POWER SANDER', cost: 40, line: 'Holes sand twice as fast.' },
  { id: 'pump', name: 'BIG BILGE PUMP', cost: 30, line: 'Each pump moves twice the water.' },
  { id: 'roller', name: 'WIDE ROLLER', cost: 35, line: 'Paint covers a panel in one swipe.' },
  { id: 'needle', name: 'SAIL NEEDLE', cost: 30, line: 'Tears close in 3 stitches, not 4.' },
  { id: 'radio', name: 'SEA SHANTY RADIO', cost: 60, line: 'Owners tip 25% more.' }];
const OWNERS = [
  { name: 'MARLO', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] }, { name: 'SKIPPER NELL', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#e2453f', '#fbf8ec', '#a82c26'], outfit: 'coat' },
  { name: 'GUS', fur: '#c9682a', furDark: '#8a4213', torso: ['#3f5d47', '#e6b45a', '#2b4232'] }, { name: 'CORAL', torso: ['#f07a72', '#fbf8ec', '#a82c26'] },
  { name: 'OLD BARNABY', fur: '#9a9a9e', furDark: '#6a6a70', torso: ['#4a4a52', '#d7dde3', '#2a2a30'], outfit: 'coat' }, { name: 'PIPPA', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#a78bfa', '#ede9fe', '#5b21b6'] },
  { name: 'FINN', torso: ['#2f9a8f', '#f2d970', '#1f6a62'] }, { name: 'ROSA REEF', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#f2c94c', '#fbf8ec', '#a8792e'] }];
const NAMES = ['SEA FOX', 'LUCKY TAIL', 'SALTY', 'WAVE DANCER', 'MOONFISH', 'GOLDFIN', 'SNAPPER', 'DRIFTWOOD', 'TIDY TIDE', 'SWIFT PAW'];
const HELLO = ['She took a beating out there.', 'Hit the rocks by the point. Can you fix her?', 'Be gentle, she is my pride and joy.', 'No rush. Make her shine.', 'Jon says you are the best new hand on the docks.'];
const SAVE = { day: 'boat.yard.day', best: 'boat.yard.best', upg: 'boat.yard.upg.', stars: 'boat.yard.stars' };
const SEAL = [0.45, 0.75];

// ---------------- one boat ----------------
let BOAT_ID = 1;
function makeBoat(ST, type, job) {
  const { M, toon, addOutline, scene, V3, grad } = ST, D = BOATS[type], { L, W, H } = D, g = new THREE.Group(); scene.add(g);
  const B = { id: BOAT_ID++, type, D, g, panels: [], holes: [], barnacles: [], tears: [], job };
  const hullMat = new THREE.MeshToonMaterial({ color: job.oldCol, gradientMap: grad }); B.hullMat = hullMat;
  const shape = s => { const sh = new THREE.Shape(), hw = W / 2 * s, xs = L / 2 - (1 - s) * 0.4, xb = -L * 0.2, xn = -L / 2 + (1 - s) * 0.7; sh.moveTo(xs, -hw); sh.lineTo(xs, hw); sh.lineTo(xb, hw); sh.quadraticCurveTo(xn + L * 0.1, hw * 0.92, xn, 0); sh.quadraticCurveTo(xn + L * 0.1, -hw * 0.92, xb, -hw); sh.closePath(); return sh; };
  const ext = (sh, depth) => new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 10 }).rotateX(-Math.PI / 2);
  const solid = type === 'jet', y0 = -0.2; B.floorY = solid ? H + y0 : y0 + 0.12;
  { const outer = shape(1); if (!solid) outer.holes.push(shape(0.86)); const w = M(ext(outer, H), hullMat, 0, y0, 0, g, 0.025); }
  if (!solid) { M(ext(shape(1), 0.12), toon('#8a6a4a'), 0, y0, 0, g, 0); const rim = shape(1); rim.holes.push(shape(0.86)); M(ext(rim, 0.06), toon('#fbf8ec'), 0, y0 + H, 0, g, 0.01); }
  { const rub = shape(1.03); rub.holes.push(shape(0.99)); M(ext(rub, 0.09), toon('#1f3a5f'), 0, y0 + H - 0.09, 0, g, 0.008); const boot = shape(1.025); boot.holes.push(shape(0.99)); M(ext(boot, 0.07), toon('#c42d3c'), 0, y0 + 0.005, 0, g, 0.006); }
  for (const z of [-1, 1]) { const nl = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.04), new THREE.MeshBasicMaterial({ color: z > 0 ? 0x22c55e : 0xec3013 })); nl.position.set(-L * 0.3, y0 + H - 0.04, z * (W / 2 * 0.9 + 0.03)); g.add(nl); }
  if (type !== 'jet') { const chrome = toon('#d7dde3'); for (const z of [-1, 1]) { const cv = new THREE.QuadraticBezierCurve3(V3(-L * 0.12, 0, z * W * 0.43), V3(-L * 0.4, 0, z * W * 0.36), V3(-L / 2 + 0.28, 0, 0)); const tb = M(new THREE.TubeGeometry(cv, 12, 0.022, 5), chrome, 0, y0 + H + 0.24, 0, g, 0); for (const t of [0, 0.5, 0.92]) { const p = cv.getPoint(t); M(new THREE.CylinderGeometry(0.016, 0.016, 0.24, 5), chrome, p.x, y0 + H + 0.12, p.z, g, 0); } } }
  { const k = new THREE.Shape([new THREE.Vector2(-W * 0.42, 0), new THREE.Vector2(W * 0.42, 0), new THREE.Vector2(0, -0.36)]); const kg = new THREE.ExtrudeGeometry(k, { depth: L * 0.72, bevelEnabled: false }).rotateY(Math.PI / 2).translate(-L * 0.3, y0, 0); M(kg, toon('#5a646d'), 0, 0, 0, g, 0.02); }
  // starboard panels (+z side): paint, holes, barnacles live on these
  const scuffT = canvasTex(128, 128, c => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#b8b2a8'; c.lineWidth = 2; for (let i = 0; i < 14; i++) { const x = (i * 37) % 128, y = (i * 59) % 128; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 14, y + 4); c.stroke(); } c.fillStyle = '#d0cac0'; for (let i = 0; i < 10; i++) c.fillRect((i * 41) % 128, (i * 23) % 128, 10, 6); });
  const N = 4, x0 = -L * 0.2 + 0.05, x1 = L / 2 - 0.06, pw = (x1 - x0) / N, ph = H * 0.9; B.pw = pw; B.ph = ph;
  for (let i = 0; i < N; i++) { const mat = new THREE.MeshToonMaterial({ color: job.oldCol, gradientMap: grad, map: job.tasks.includes('paint') ? scuffT : null }); const p = new THREE.Mesh(new THREE.PlaneGeometry(pw - 0.02, ph), mat); p.position.set(x0 + pw * (i + 0.5), H / 2 + y0, W / 2 + 0.012); g.add(p); p.userData = { i, cover: job.tasks.includes('paint') ? 0 : 1, col: job.tasks.includes('paint') ? null : 'old', from: new THREE.Color(job.oldCol) }; B.panels.push(p); }
  // name decal
  const dec = canvasTex(512, 96, c => { c.clearRect(0, 0, 512, 96); const dark = job.paint === 'yellow'; c.fillStyle = dark ? '#1f3a5f' : '#fbf8ec'; c.font = 'italic 900 64px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeStyle = dark ? '#fbf8ec' : '#201e1d'; c.lineWidth = 8; c.lineJoin = 'round'; c.strokeText(job.boatName, 256, 50); c.fillText(job.boatName, 256, 50); });
  B.decal = new THREE.Mesh(new THREE.PlaneGeometry(pw * 1.7, pw * 1.7 * 96 / 512), new THREE.MeshBasicMaterial({ map: dec, transparent: true, opacity: job.tasks.includes('paint') ? 0 : 1, depthWrite: false })); B.decal.position.set(x0 + pw * 2.2, y0 + H * 0.5 + ph * 0.32, W / 2 + 0.025); g.add(B.decal);
  // barnacles
  if (job.tasks.includes('scrape')) { const n = 6 + Math.min(4, job.day); for (let i = 0; i < n; i++) { const p = B.panels[i % N], b = new THREE.Group(); b.position.set(rr(-pw * 0.4, pw * 0.4), rr(-ph * 0.44, -ph * 0.22), 0.01); p.add(b); const c = new THREE.Mesh(new THREE.ConeGeometry(0.065, 0.08, 7), toon('#d8d2c4')); c.rotation.x = Math.PI / 2; c.position.z = 0.04; addOutline(c, 0.006); b.add(c); const t = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.02, 6), toon('#6a645a')); t.rotation.x = Math.PI / 2; t.position.z = 0.085; b.add(t); b.scale.setScalar(rr(0.8, 1.25)); B.barnacles.push(b); } }
  // holes
  if (job.tasks.includes('patch')) { const n = Math.min(3, 1 + Math.floor(job.day / 2) + (Math.random() < 0.4 ? 1 : 0)), idx = [0, 1, 2, 3].sort(() => Math.random() - 0.5).slice(0, n);
    for (const i of idx) { const p = B.panels[i], h = new THREE.Group(); h.position.set(rr(-pw * 0.2, pw * 0.2), rr(-ph * 0.12, ph * 0.02), 0.004); p.add(h);
      const ring = new THREE.Mesh(new THREE.CircleGeometry(0.2, 18), new THREE.MeshBasicMaterial({ color: 0xe8d9b8, transparent: true, opacity: 0 })); h.add(ring);
      const hole = new THREE.Mesh(new THREE.CircleGeometry(0.12, 9), new THREE.MeshBasicMaterial({ color: 0x201e1d })); hole.position.z = 0.002; hole.scale.set(1.2, 0.85, 1); hole.rotation.z = rr(0, 3); h.add(hole);
      const spl = new THREE.Group(); h.add(spl); for (let k = 0; k < 5; k++) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.025, 0.02), toon('#e8e2d6')); s.position.set(Math.cos(k * 1.25) * 0.13, Math.sin(k * 1.25) * 0.11, 0.01); s.rotation.z = k * 1.25 + 0.3; addOutline(s, 0.004); spl.add(s); }
      const patch = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.3, 0.02), toon('#cfd6da')); patch.position.z = 0.014; addOutline(patch, 0.006); patch.visible = false; h.add(patch);
      const seal = new THREE.Mesh(new THREE.RingGeometry(0.17, 0.21, 4, 1), new THREE.MeshBasicMaterial({ color: 0x9fb8c4 })); seal.rotation.z = Math.PI / 4; seal.position.z = 0.026; seal.scale.setScalar(0.01); h.add(seal);
      h.userData = { state: 'hole', sand: 0, q: 0, ring, hole, spl, patch, seal, anim: 0 }; B.holes.push(h); } }
  // type extras
  if (type === 'speed') { const ws = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, W * 0.8), new THREE.MeshToonMaterial({ color: '#cfe8f4', gradientMap: grad, transparent: true, opacity: 0.55 })); ws.position.set(-L * 0.08, y0 + H + 0.2, 0); ws.rotation.z = 0.5; g.add(ws); M(new THREE.TorusGeometry(0.15, 0.025, 6, 14), toon('#201e1d'), 0.05 - L * 0.08 + 0.35, y0 + H + 0.05, W * 0.22, g, 0).rotation.y = Math.PI / 2;
    for (const z of [-0.4, 0.4]) M(new THREE.BoxGeometry(0.5, 0.35, 0.55), toon('#fbf8ec'), L * 0.1, B.floorY + 0.18, z * W / 1.9, g, 0.01);
    M(new THREE.BoxGeometry(0.42, 0.55, 0.4), toon('#201e1d'), L / 2 + 0.12, y0 + H + 0.1, 0, g, 0.015); M(new THREE.BoxGeometry(0.12, 1.0, 0.1), toon('#3a3836'), L / 2 + 0.16, y0 - 0.15, 0, g, 0.008); B.propPos = V3(L / 2 + 0.16, y0 - 0.62, 0); }
  else if (type === 'jet') { M(new THREE.BoxGeometry(L * 0.42, 0.18, 0.42), toon('#201e1d'), L * 0.08, B.floorY + 0.09, 0, g, 0.012); M(new THREE.BoxGeometry(0.14, 0.45, 0.14), toon('#3a3836'), -L * 0.2, B.floorY + 0.22, 0, g, 0.01); M(new THREE.BoxGeometry(0.08, 0.06, 0.7), toon('#201e1d'), -L * 0.2, B.floorY + 0.46, 0, g, 0.008); B.propPos = V3(L / 2 + 0.12, y0 - 0.1, 0); M(new THREE.CylinderGeometry(0.1, 0.12, 0.3, 10), toon('#3a3836'), L / 2 - 0.1, y0 - 0.1, 0, g, 0.008).rotation.z = Math.PI / 2; }
  else { M(new THREE.BoxGeometry(L * 0.3, 0.45, W * 0.7), toon('#fbf8ec'), -L * 0.12, B.floorY + 0.5, 0, g, 0.015); const mx = -L * 0.1, my = B.floorY + 0.7; M(new THREE.CylinderGeometry(0.06, 0.07, 5.0, 8), toon('#8a6a3a'), mx, my + 2.5, 0, g, 0.008); M(new THREE.CylinderGeometry(0.045, 0.045, L * 0.52, 8), toon('#8a6a3a'), mx + L * 0.26, my + 0.5, 0, g, 0.006).rotation.z = Math.PI / 2;
    const sh = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(L * 0.5, 0), new THREE.Vector2(0, 4.4)]); const sail = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshToonMaterial({ color: '#f4f1e8', gradientMap: grad, side: THREE.DoubleSide })); sail.position.set(mx + 0.06, my + 0.55, 0.05); g.add(sail); B.sail = sail; { const fl = new THREE.Mesh(new THREE.ShapeGeometry(new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(0.5, -0.15), new THREE.Vector2(0, -0.3)])), toon('#ec3013', { side: THREE.DoubleSide })); fl.position.set(mx + 0.05, my + 5.0, 0); g.add(fl); B.flag = fl; }
    if (job.tasks.includes('sail')) { const n = 2 + (job.day >= 3 ? 1 : 0), spots = [[0.25, 0.25], [0.12, 0.55], [0.3, 0.12]]; for (let i = 0; i < n; i++) { const [fx, fy] = spots[i], tg = new THREE.Group(); tg.position.set(L * 0.5 * fx * (1 - fy) + 0.2, 4.4 * fy + 0.2, 0.012); tg.rotation.z = rr(-0.5, 0.5); sail.add(tg); const zig = []; for (let k = 0; k < 3; k++) { const z = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.09, 0.005), new THREE.MeshBasicMaterial({ color: 0x3a3836 })); z.position.set(-0.32 + k * 0.32, 0, 0); z.rotation.z = k % 2 ? 0.45 : -0.45; tg.add(z); zig.push(z); } tg.userData = { st: 0, zig, last: null }; B.tears.push(tg); } }
    B.propPos = V3(L / 2 - 0.55, y0 - 0.7, 0); M(new THREE.BoxGeometry(0.08, 0.55, 0.05), toon('#5a646d'), L / 2 - 0.75, y0 - 0.4, 0, g, 0.006); M(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 6), toon('#9aa3a8'), L / 2 - 0.75, y0 - 0.7, 0, g, 0).rotation.z = Math.PI / 2; }
  B.propN = job.propOld; B.prop = propMesh(THREE, toon, job.propOld, job.tasks.includes('prop'), addOutline); B.prop.position.copy(B.propPos); B.prop.scale.setScalar(type === 'jet' ? 0.8 : 1.4); g.add(B.prop); B.propState = job.tasks.includes('prop') ? 'bent' : 'on'; B.propTaps = 0; B.propWrong = 0;
  // bilge water + hand pump
  if (job.tasks.includes('pump')) { const wg = new THREE.ShapeGeometry(shape(0.84)).rotateX(-Math.PI / 2); B.water = new THREE.Mesh(wg, new THREE.MeshToonMaterial({ color: '#4fb0d4', gradientMap: grad, transparent: true, opacity: 0.85 })); g.add(B.water); B.waterLvl = 1;
    const pump = new THREE.Group(); pump.position.set(L * 0.28, y0 + H + 0.03, W / 2 - 0.12); g.add(pump); M(new THREE.CylinderGeometry(0.09, 0.1, 0.5, 12), toon('#f2c94c'), 0, 0.25, 0, pump, 0.008, 0.09); const hd = new THREE.Group(); hd.position.y = 0.5; pump.add(hd); M(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), toon('#9aa3a8'), 0, 0.2, 0, hd, 0); M(new THREE.BoxGeometry(0.36, 0.06, 0.06), toon('#201e1d'), 0, 0.4, 0, hd, 0.005);
    const hose = M(new THREE.TorusGeometry(0.3, 0.035, 6, 14, Math.PI), toon('#e2453f'), 0, 0.05, 0.3, pump, 0.005); hose.rotation.y = Math.PI / 2; B.pump = pump; B.pumpHd = hd; B.spout = V3(L * 0.28, y0 + H - 0.25, W / 2 + 0.62); }
  return B;
}

// ---------------- the stand-alone game ----------------
export async function createBoatRepair({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#bfe6f5' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#7fc4ea'); gr.addColorStop(0.6, '#bfe6f5'); gr.addColorStop(1, '#e6f4f8'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); }); scene.fog = new THREE.Fog('#d6eef6', 34, 85);
  const Y = buildYard({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline });
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const jon = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#a8a29a', furDark: '#6a6560' }, torso: ['#1f3a5f', '#f2c94c', '#16263c'], outfit: 'coat', crest: '', gear: 'none', mood: 'happy' }));
  const ben = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#1f3a5f', '#1f3a5f', '#f2c94c'], crest: '', gear: 'none', mood: 'happy' })); const BP = ben.userData.P;
  const place = (f, s, ry = 0) => { f.position.set(s.x, DY, s.z); f.rotation.y = ry; };
  place(ben, Y.spots.ben, -0.2); place(jon, Y.spots.jon, 0.35);
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 92); g.strokeStyle = '#f2c94c'; g.fillStyle = '#f2c94c'; g.lineWidth = 14; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, -60); g.lineTo(0, 50); g.stroke(); g.beginPath(); g.arc(0, -66, 14, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-34, -30); g.lineTo(34, -30); g.stroke(); g.beginPath(); g.arc(0, 8, 52, 0.25, Math.PI - 0.25); g.stroke(); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.05); g.fillStyle = '#f2c94c'; g.fillRect(-124, -26, 248, 52); g.font = 'italic 900 34px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#1f3a5f'; g.fillText("JON'S BOATWORKS", 0, 2); g.restore(); });
    const U = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#f2c94c', towelCol: '#1f3a5f' }), hat = U.hat, hs = BP.head.scale.x || 1;
    while (hat.children.length) hat.remove(hat.children[0]); hat.scale.setScalar(hs); hat.position.y -= 0.08 * hs;
    M(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#1f3a5f'), 0, 0, -0.04, hat, 0.012); M(new THREE.BoxGeometry(0.34, 0.03, 0.26), toon('#f2c94c'), 0, 0.01, 0.3, hat, 0.008); M(new THREE.SphereGeometry(0.035, 8, 6), toon('#f2c94c'), 0, 0.3, -0.04, hat, 0);
    return U.parts; })();
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const ownerFox = OWNERS.map(o => { const f = strip(kit.makeFox({ ...CAST.player, look: o.fur ? { ...CAST.player.look, fur: o.fur, furDark: o.furDark } : CAST.player.look, torso: o.torso, outfit: o.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; return f; });

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), boatN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, flash: null, flashT: 0, say: '', sayT: 0, hold: null, ptr: null, react: null, done: null, t: 0, phT: 0, confirm: 0 };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  let B = null, owner = null, OWN = null, lastOwner = -1;
  const W = V3(), wp = o => o.getWorldPosition(new THREE.Vector3());
  function newJob() { const d = S.day, type = S.forceType || pick(d <= 1 ? ['speed', 'jet', 'speed', 'sail'] : ['speed', 'sail', 'jet']), D = BOATS[type];
    const pool = D.tasks.slice(), n = Math.min(pool.length, d <= 1 ? 2 : d <= 2 ? 3 : d <= 4 ? 3 + (Math.random() < 0.5 ? 1 : 0) : 4 + (Math.random() < 0.5 ? 1 : 0)), tasks = [];
    if (Math.random() < 0.7 || n >= 3) tasks.push('paint'); if (type === 'sail' && n >= 2 && Math.random() < 0.7) tasks.push('sail'); while (tasks.length < n) { const t = pick(pool.filter(q => !tasks.includes(q))); tasks.push(t); }
    if (S.forceType) { tasks.length = 0; tasks.push(...pool); } tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b)); const paint = pick(PK), oldK = pick(PK.filter(k => k !== paint)), oldCol = '#' + new THREE.Color(PAINTS[oldK].col).lerp(new THREE.Color('#9a968c'), 0.55).getHexString();
    let oi; do { oi = Math.floor(Math.random() * OWNERS.length); } while (oi === lastOwner); lastOwner = oi;
    return { type, tasks, paint, oldCol, boatName: pick(NAMES), propWant: pick([2, 3, 4]), propOld: pick([2, 3]), owner: oi, day: d, line: pick(HELLO) }; }
  function nextBoat() { if (B) { scene.remove(B.g); B = null; } const job = newJob(); B = makeBoat(ST, job.type, job); OWN = OWNERS[job.owner]; owner = ownerFox[job.owner]; ownerFox.forEach(f => f.visible = f === owner); B.g.position.set(18, 0, 0); B.g.rotation.set(0, 0, 0); S.phase = 'arrive'; S.phT = 0; S.tool = null; S.brush = null; S.confirm = 0; S.doneSeen = {}; tone(90, 0.5, 0.03, 'sawtooth'); }
  const seatOf = () => V3(B.type === 'jet' ? 0.15 : B.D.L * 0.2, B.floorY, 0);

  // ---------- task progress ----------
  function info(id) { if (!B) return { done: false, q: 0, left: 0, prog: 0 };
    if (id === 'scrape') { const a = B.barnacles.filter(b => b.parent).length, n = B.barnacles.length; return { done: !a, q: 1, left: a, prog: n ? 1 - a / n : 1, txt: a ? a + ' LEFT' : 'DONE' }; }
    if (id === 'patch') { const h = B.holes, l = h.filter(x => x.userData.state !== 'sealed').length, q = h.length ? h.reduce((s, x) => s + x.userData.q, 0) / h.length : 1; return { done: !l, q, left: l, prog: h.length ? (h.length - l) / h.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'pump') { const v = B.waterLvl || 0; return { done: v <= 0, q: 1, left: v > 0 ? 1 : 0, prog: 1 - v, txt: v > 0 ? Math.round(v * 100) + '%' : 'DONE' }; }
    if (id === 'prop') { const on = B.propState === 'on'; return { done: on, q: Math.max(0.5, 1 - B.propWrong * 0.25), left: on ? 0 : 1, prog: on ? 1 : B.propState === 'off' ? 0.5 : B.propTaps / 6, txt: on ? 'DONE' : B.propState === 'off' ? 'PICK' : B.propTaps + ' / 3' }; }
    if (id === 'sail') { const l = B.tears.filter(t => t.userData.st < needSt()).length; return { done: !l, q: 1, left: l, prog: B.tears.length ? 1 - l / B.tears.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'paint') { const c = B.panels.filter(p => p.userData.cover >= 1).length, ok = B.panels.filter(p => p.userData.cover >= 1 && p.userData.col === B.job.paint).length; return { done: c === B.panels.length, q: ok / B.panels.length, left: B.panels.length - c, prog: c / B.panels.length, txt: c === B.panels.length ? (ok === c ? 'DONE' : 'WRONG COLOUR') : c + ' / ' + B.panels.length }; }
    return { done: true, q: 1 }; }
  const needSt = () => upg('needle') ? 3 : 4;
  const allDone = () => B && B.job.tasks.every(t => info(t).done);
  const nextTask = () => B && B.job.tasks.find(t => !info(t).done);
  function setTool(id) { if (S.phase !== 'work' || !B || !B.job.tasks.includes(id)) return; S.tool = id; S.userToolT = performance.now(); S.ptr = null; }
  function checkDone() { if (!B) return; for (const t of B.job.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); tone(1175, 0.1, 0.05); setTimeout(() => tone(1568, 0.14, 0.05), 110); for (let i = 0; i < 6; i++) puff(B.g.position.x + rr(-1.5, 1.5), B.g.position.y + rr(0.4, 1.2), B.D.W / 2 + 0.3, 0xffe7a0, 1);
        if (t === 'paint') { B.decal.userData.fade = 1; B.hullMat.color.set(PAINTS[B.job.paint].col); }
        const nx = nextTask(); if (!nx) say('JON: "Looks great. Hand her back to ' + OWN.name + '!"', 4); else { const was = S.tool; setTimeout(() => { if (S.phase === 'work' && S.tool === was && !S.ptr) S.tool = nx; }, 1100); } } } }

  // ---------- actions ----------
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const near = (obj, x, y, r) => { const s = scr(wp(obj)); return Math.hypot(s.x - x, s.y - y) < r * scale(); };
  function scrapeAt(x, y) { for (const b of B.barnacles) { if (!b.parent || !near(b, x, y, 30)) continue; const p = wp(b); b.parent.remove(b); puff(p.x, p.y, p.z + 0.1, 0xe8e2d6, 2); tone(900 + Math.random() * 600, 0.05, 0.04, 'square'); audio.burst && audio.burst(0.05, 3000, 0.08); } checkDone(); }
  const holeAt = (x, y) => B.holes.find(h => h.userData.state !== 'sealed' && near(h, x, y, 46)) || null;
  function sandMove(h, d) { const U = h.userData; U.sand = Math.min(1, U.sand + d / (upg('sander') ? 260 : 520)); U.ring.material.opacity = U.sand; U.spl.scale.setScalar(Math.max(0.01, 1 - U.sand)); if (Math.random() < 0.3) { const p = wp(h); puff(p.x + rr(-0.1, 0.1), p.y, p.z + 0.1, 0xf2e6c8, 1); } if (Math.random() < 0.25) audio.burst && audio.burst(0.05, 2200, 0.06);
    if (U.sand >= 1) { U.state = 'sanded'; U.spl.visible = false; flash('SANDED · TAP THE HOLE TO PATCH IT', '#22c55e', 1.3); tone(990, 0.08, 0.04); S.ptr && (S.ptr.kind = null); } }
  function placePatch(h) { const U = h.userData; U.state = 'patched'; U.patch.visible = true; U.anim = 0.01; tone(520, 0.08, 0.05); tone(260, 0.12, 0.03); flash('PATCH ON · HOLD IT TO SEAL', '#ffffff', 1.3); }
  function startSeal(h) { S.hold = { h, v: 0 }; tone(330, 0.3, 0.03, 'sine'); }
  function releaseSeal() { const H = S.hold; if (!H) return; S.hold = null; const U = H.h.userData, v = H.v;
    if (v < SEAL[0]) { U.seal.scale.setScalar(0.01); flash('TOO THIN · HOLD LONGER', '#ffffff', 1.2); tone(300, 0.1, 0.04); return; }
    U.state = 'sealed'; U.q = v <= SEAL[1] ? 1 : v < 1 ? 0.75 : 0.5; U.patch.material = toon(v <= SEAL[1] ? '#e8eef0' : '#d7dde3'); U.seal.material.color.set(v <= SEAL[1] ? 0x5a8a9a : 0xbcc6cc);
    flash(v <= SEAL[1] ? 'PERFECT SEAL!' : v < 1 ? 'A BIT DRIPPY' : 'OVERFLOWED · MESSY', v <= SEAL[1] ? '#22c55e' : v < 1 ? '#e6b45a' : '#ec3013', 1.2); tone(v <= SEAL[1] ? 1320 : 440, 0.1, 0.04); checkDone(); }
  function pumpStroke() { if (!B.waterLvl) return; B.waterLvl = Math.max(0, B.waterLvl - (upg('pump') ? 0.2 : 0.1)); B.pumpT = 1; tone(220 + B.waterLvl * 200, 0.08, 0.04, 'sine'); for (let i = 0; i < 3; i++) puff(B.spout.x + B.g.position.x, B.spout.y + B.g.position.y, B.spout.z, 0xbfe6f5, 1); if (B.waterLvl <= 0) B.water.visible = false; checkDone(); }
  function propTap() { if (B.propState !== 'bent') return; B.propTaps++; tone(700 + B.propTaps * 150, 0.06, 0.04, 'square'); B.prop.rotation.x -= 1.2; B.prop.position.x += 0.04;
    if (B.propTaps >= 3) { B.propState = 'off'; const old = B.prop; B.drop = { m: old, t: 0 }; flash('OLD PROP OFF · PICK A ' + B.job.propWant + '-BLADE BELOW', '#ffffff', 1.8); tone(300, 0.2, 0.04); } }
  function pickProp(n) { if (!B || B.propState !== 'off') return; if (n !== B.job.propWant) { B.propWrong++; flash(n + '-BLADE WON\'T FIT · CARD SAYS ' + B.job.propWant, '#ec3013', 1.6); tone(180, 0.2, 0.05, 'sawtooth'); return; }
    const p = propMesh(THREE, toon, n, false, addOutline); p.position.copy(B.propPos).add(V3(0.6, 0, 0)); p.scale.setScalar(B.type === 'jet' ? 0.8 : 1.4); B.g.add(p); B.prop = p; B.propIn = { t: 0 }; B.propState = 'on'; tone(990, 0.1, 0.05); setTimeout(() => tone(1320, 0.1, 0.05), 120); checkDone(); }
  function sailMove(x, y) { for (const t of B.tears) { const U = t.userData; if (U.st >= needSt() || !near(t, x, y, 52)) continue; if (!U.last) { U.last = { x, y }; continue; } if (Math.hypot(x - U.last.x, y - U.last.y) < 28) continue; U.last = { x, y }; addStitch(t); } }
  function addStitch(t) { const U = t.userData; if (U.st >= needSt()) return; U.st++;
      const s = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.2, 0.006), new THREE.MeshBasicMaterial({ color: 0xffffff })); s.position.set(-0.36 + U.st * 0.72 / (needSt() + 1), 0, 0.004); s.rotation.z = 0.3; const so = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.22, 0.004), new THREE.MeshBasicMaterial({ color: 0x201e1d })); so.position.z = -0.002; s.add(so); t.add(s); tone(1400 + U.st * 100, 0.05, 0.04);
      if (U.st >= needSt()) { U.zig.forEach(z => z.material.color.set(0xd8d2c4)); flash('TEAR SEWN', '#22c55e', 1); checkDone(); } }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function paintMove(x, y, d) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(B.panels, false)[0]; if (!hit) return; paintOn(hit.object, d, hit.point); }
  function paintOn(p, d, point) { const U = p.userData;
    if (B.barnacles.some(b => b.parent === p) || B.holes.some(h => h.parent === p && h.userData.state !== 'sealed')) { if (performance.now() - (S.warnT || 0) > 1500) { S.warnT = performance.now(); flash(B.barnacles.some(b => b.parent === p) ? 'SCRAPE THIS PANEL FIRST' : 'PATCH THIS PANEL FIRST', '#ec3013', 1.4); tone(220, 0.15, 0.04, 'sawtooth'); } return; }
    if (U.col !== S.brush) { U.col = S.brush; U.from = p.material.color.clone(); U.cover = 0; }
    if (U.cover >= 1) return; U.cover = Math.min(1, U.cover + d / (upg('roller') ? 160 : 300)); p.material.color.copy(U.from).lerp(new THREE.Color(PAINTS[S.brush].col), U.cover); if (Math.random() < 0.2) tone(500 + Math.random() * 200, 0.03, 0.02, 'sine');
    if (U.cover >= 1) { p.material.map = null; p.material.needsUpdate = true; p.material.color.set(PAINTS[S.brush].col); puff(point.x, point.y, point.z + 0.1, 0xffffff, 2); tone(880, 0.06, 0.04); B.holes.forEach(h => { if (h.parent === p) { h.userData.patch.material = toon('#' + new THREE.Color(PAINTS[S.brush].col).lerp(new THREE.Color('#ffffff'), 0.12).getHexString()); h.userData.seal.visible = false; h.userData.ring.visible = false; } }); if (B.decal.userData.fade) B.hullMat.color.set(PAINTS[S.brush].col); checkDone(); } }
  function setBrush(k) { if (!PAINTS[k]) return; S.brush = k; tone(660, 0.06, 0.04); flash('BRUSH · ' + PAINTS[k].name + (k === B.job.paint ? '' : ' · CARD SAYS ' + PAINTS[B.job.paint].name), k === B.job.paint ? '#22c55e' : '#e6b45a', 1.3); }

  // ---------- input ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (DM.on || S.phase !== 'work' || !B || S.hold) return; const { x, y } = local(e); e.preventDefault(); const T = S.tool; S.ptr = { x, y, kind: null };
    if (T === 'scrape') { S.ptr.kind = 'scrape'; scrapeAt(x, y); }
    else if (T === 'patch') { const h = holeAt(x, y); if (!h) { flash('TAP A HOLE IN THE HULL', '#ffffff', 1); return; } const st = h.userData.state; if (st === 'hole') S.ptr.kind = 'sand', S.ptr.h = h; else if (st === 'sanded') placePatch(h); else if (st === 'patched') startSeal(h); }
    else if (T === 'pump') pumpStroke();
    else if (T === 'prop') { if (B.propState === 'bent' && near(B.prop, x, y, 70)) propTap(); else if (B.propState === 'bent') flash('TAP THE BENT PROP', '#ffffff', 1); else if (B.propState === 'off') flash('PICK THE NEW PROP BELOW', '#ffffff', 1); }
    else if (T === 'sail') { S.ptr.kind = 'sail'; B.tears.forEach(t => t.userData.last = null); sailMove(x, y); }
    else if (T === 'paint') { if (!S.brush) { flash('PICK A COLOUR BELOW', '#ffffff', 1.2); return; } S.ptr.kind = 'paint'; paintMove(x, y, 20); } }
  function onMove(e) { const P = S.ptr; if (!P || !P.kind || !B) return; const { x, y } = local(e), d = Math.hypot(x - P.x, y - P.y); if (d < 1) return;
    if (P.kind === 'scrape') { const n = Math.ceil(d / 12); for (let i = 1; i <= n; i++) scrapeAt(P.x + (x - P.x) * i / n, P.y + (y - P.y) * i / n); }
    else if (P.kind === 'sand') { if (near(P.h, x, y, 70)) sandMove(P.h, d); }
    else if (P.kind === 'sail') sailMove(x, y);
    else if (P.kind === 'paint') paintMove(x, y, d);
    P.x = x; P.y = y; }
  function onUp() { if (S.hold) releaseSeal(); S.ptr = null; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- flow ----------
  function startDay() { if (S.phase !== 'intro' && S.phase !== 'done') return; audio.init && audio.init(); Object.assign(S, { boatN: 0, earned: 0, tips: 0, starList: [], done: null, react: null }); setUniform(!!save.flag('boatUniform')); ben.visible = false; place(jon, Y.spots.jonWork, 0.6); say('JON: "Boat coming in. The job card tells you what she needs. No rush, do it right."', 5); nextBoat(); }
  function handBack() { if (S.phase !== 'work' || !B) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND BACK AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishJob(); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['She looks brand new!', 'Best work on the whole waterfront!', 'I could cry. Look at her shine!'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Nice job, thank you!', 'She is ready for the water.', 'Good as new.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['It will do. Not your best work.', 'Hmm. A few things are off.', 'Thanks, I guess.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half the job is not done!', 'This is not what I paid for.', 'Jon would have done better.'] } };
  function finishJob() { const T = B.job.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const fixed = T.filter(t => info(t).done).length, pay = B.D.price + fixed * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('radio') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; owner.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: OWN.name, stars, tip, pay, t: 0 }; owner.position.set(Y.spots.talk.x, DY, Y.spots.talk.z); owner.rotation.y = 0.5; S.phase = 'react'; S.phT = 0; S.hold = null; S.ptr = null;
    tone(level === 'grumpy' ? 260 : 880, 0.18, 0.05, level === 'grumpy' ? 'sawtooth' : 'triangle'); if (stars === 3) { setTimeout(() => tone(1175, 0.1, 0.05), 110); setTimeout(() => tone(1568, 0.16, 0.05), 220); for (let i = 0; i < 10; i++) puff(owner.position.x + rr(-0.4, 0.4), DY + rr(1.4, 2.4), owner.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; if (B) { scene.remove(B.g); B = null; } ownerFox.forEach(f => f.visible = false); ben.visible = true; place(ben, Y.spots.ben, -0.2); place(jon, Y.spots.jon, 0.35);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false, unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('boatUniform')) { save.setFlag('boatUniform'); setUniform(true); unlock.push('BOATWORKS UNIFORM (cap, rag + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, fixed: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    say(eod ? 'JON: "Employee of the day! The whole harbour is talking."' : avg >= 2 ? 'JON: "Solid day. See you tomorrow."' : 'JON: "Rough one. Take your time with each job."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); tone(1320, 0.1, 0.05); return true; }

  // ---------- camera ----------
  const { SAFE, shotFor, fitShot } = cameraFit(ST), CAM = { look: V3(0, 1.2, 0) };
  camera.position.set(0, 2.4, 9); camera.lookAt(CAM.look);
  const box = (p, r, out) => { out.push(V3(p.x - r, p.y - r, p.z), V3(p.x + r, p.y + r, p.z)); return out; };
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; for (const s of [Y.spots.ben, Y.spots.jon]) o.push(V3(s.x - 0.5, DY, s.z), V3(s.x + 0.5, DY, s.z), V3(s.x, DY + 2.5, s.z)); o.push(V3(1.2, DY + 2.6, 2.3)); return o; }, 0.12, Math.PI - 0.25, port ? 0.12 : 0.06);
    if (!B) return shotFor('yard' + k, () => [V3(-4, 0, 0), V3(5, 0, 0), V3(0, 4.4, -2)], 0.2, Math.PI - 0.1, 0.05);
    if (S.phase === 'react') { const f = owner.position; return shotFor('react' + k + B.id, () => [V3(f.x - 0.9, DY + 0.3, f.z), V3(f.x + 0.9, DY + 0.3, f.z), V3(f.x, DY + 2.6, f.z), V3(f.x + 1.4, DY + 1.2, f.z)], 0.12, Math.PI - 0.45, 0.1); }
    if (S.phase !== 'work' || !S.tool) return shotFor('yard' + k + B.type, () => [V3(-4, -0.2, 1), V3(4, -0.2, 1), V3(-3, B.type === 'sail' ? 6.8 : 4.4, 0), V3(3, 1, 2)], 0.2, Math.PI - 0.1, 0.05);
    const T = S.tool, g = B.g, gp = g.position, L = B.D.L, Wd = B.D.W;
    if (T === 'pump') return shotFor('pump' + k + B.id, () => { const o = [V3(gp.x - L * 0.2, gp.y, Wd / 2), V3(gp.x + L / 2, gp.y, Wd / 2), V3(gp.x - L * 0.2, gp.y, -Wd / 2), V3(gp.x + L / 2, gp.y, -Wd / 2)]; o.push(wp(B.pump).add(V3(0, 1, 0.3))); return o; }, port ? 1.0 : 0.85, Math.PI - 0.15, 0.06);
    if (T === 'prop') return shotFor('prop' + k + B.id, () => { const p = wp(B.prop); return [V3(p.x, p.y - 0.55, p.z - 0.5), V3(p.x, p.y + 0.55, p.z + 0.5), V3(p.x - 0.8, p.y + 1.0, Wd / 2), V3(p.x - 0.8, p.y + 1.0, -Wd / 2)]; }, 0.08, Math.PI / 2 + 0.55, 0.12);
    if (T === 'sail') return shotFor('sail' + k + B.id, () => { const o = []; const s = B.sail, a = wp(s); o.push(a.clone(), a.clone().add(V3(L * 0.5, 0, 0)), a.clone().add(V3(0, 4.4, 0))); return o; }, 0.1, Math.PI - 0.08, 0.06);
    if (T === 'paint') { const todo = B.panels.filter(p => p.userData.cover < 1 || p.userData.col !== B.job.paint), set = port && todo.length ? B.panels.slice(Math.min(todo[0].userData.i, 2), Math.min(todo[0].userData.i, 2) + 2) : B.panels; return shotFor('paint' + k + B.id + ':' + set[0].userData.i, () => { const o = []; for (const p of set) { const c = wp(p); o.push(V3(c.x - B.pw / 2, c.y - B.ph / 2, c.z), V3(c.x + B.pw / 2, c.y + B.ph / 2, c.z)); } return o; }, 0.16, Math.PI - 0.08, 0.06); }
    const items = T === 'scrape' ? B.barnacles.filter(b => b.parent) : B.holes.filter(h => h.userData.state !== 'sealed');
    let list = items.length ? items : T === 'scrape' ? B.panels : B.holes; if (port && items.length) { const xs = list.map(it => wp(it).x), x0 = Math.min(...xs); list = list.filter((_, i) => xs[i] < x0 + 1.1); } return shotFor(T + k + B.id + ':' + items.length, () => { const o = []; for (const it of list) box(wp(it), port ? 0.42 : 0.5, o); if (o.length < 6) box(wp(list[0]), 0.9, o); return o; }, 0.16, Math.PI - 0.08, 0.06); }

  // ---------- DEMO: autopilot fixes one sailboat (every job) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, holdTo: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.4); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = (p, j = 0) => { hand.visible = true; hand.position.copy(p).add(V3(j, 0, 0.15)); hand.scale.setScalar(0.6); };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  function demoAct() { if (!B) return 0.5; const T = nextTask();
    if (!T) { DM.cap = 'EVERY JOB DONE: TAP HAND BACK'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handBack(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'JOB ' + (B.job.tasks.indexOf(T) + 1) + ' OF ' + B.job.tasks.length + ': TAP ' + TASKS[T].label + ' AT THE BOTTOM'; DM.key = 'TAP'; hand.visible = false; return 1.5; }
    if (T === 'scrape') { const b = B.barnacles.find(q => q.parent); const w = cap('scrape', 'SWIPE', 'SWIPE OVER THE BARNACLES TO KNOCK THEM OFF'); if (w) return w; const p = wp(b); handAt(p); const sp = scr(p); scrapeAt(sp.x, sp.y); return 0.3; }
    if (T === 'patch') { const h = B.holes.find(q => q.userData.state !== 'sealed'), U = h.userData, p = wp(h);
      if (U.state === 'hole') { const w = cap('sand' + B.holes.indexOf(h), 'RUB', B.holes.indexOf(h) ? 'NEXT HOLE: RUB TO SAND IT' : 'RUB BACK AND FORTH OVER A HOLE TO SAND IT', B.holes.indexOf(h) ? 0.8 : 1.8); if (w) return w; DM.j = (DM.j || 1) * -1; handAt(p, DM.j * 0.12); sandMove(h, 55); return 0.08; }
      if (U.state === 'sanded') { const w = cap('patch', 'TAP', 'TAP THE SANDED HOLE TO PUT A PATCH ON'); if (w) return w; handAt(p); placePatch(h); return 0.8; }
      const w = cap('seal', 'HOLD', 'HOLD THE PATCH TO SEAL IT. LET GO IN THE GREEN'); if (w) return w; handAt(p); startSeal(h); DM.holdTo = 0.6; return 0.1; }
    if (T === 'pump') { const w = cap('pump', 'TAP', 'TAP ANYWHERE TO WORK THE PUMP'); if (w) return w; handAt(wp(B.pumpHd).add(V3(0, 0.4, 0))); pumpStroke(); return 0.32; }
    if (T === 'prop') { if (B.propState === 'bent') { const w = cap('prop', 'TAP', 'TAP THE BENT PROP 3 TIMES TO UNSCREW IT'); if (w) return w; handAt(wp(B.prop)); propTap(); return 0.55; }
      if (B.propState === 'off') { const w = cap('pick', B.job.propWant + '-BLADE', 'THE CARD SAYS ' + B.job.propWant + '-BLADE: PICK IT BELOW', 2.2); if (w) return w; hand.visible = false; pickProp(B.job.propWant); return 1; } return 0.4; }
    if (T === 'sail') { const t = B.tears.find(q => q.userData.st < needSt()); const w = cap('sail', 'SWIPE', 'SWIPE BACK AND FORTH ACROSS A TEAR TO STITCH IT'); if (w) return w; DM.j = (DM.j || 1) * -1; handAt(wp(t), DM.j * 0.2); addStitch(t); return 0.35; }
    if (T === 'paint') { if (S.brush !== B.job.paint) { const w = cap('brush', PAINTS[B.job.paint].name, 'THE CARD SAYS ' + PAINTS[B.job.paint].name + ': PICK THAT COLOUR BELOW', 2.2); if (w) return w; hand.visible = false; setBrush(B.job.paint); return 1; }
      const p = B.panels.find(q => q.userData.cover < 1); if (!p) return 0.4; const w = cap('paint', 'SWIPE', 'SWIPE OVER EACH PANEL TO PAINT IT. THE NAME GOES ON AT THE END'); if (w) return w; DM.j = (DM.j || 1) * -1; const c = wp(p); handAt(c, DM.j * B.pw * 0.3); paintOn(p, 60, c); return 0.09; }
    return 0.5; }
  function demoStep(dt) { if (S.hold && DM.holdTo != null) { if (S.hold.v >= DM.holdTo) { DM.holdTo = null; releaseSeal(); DM.cd = 0.8; } return; }
    hand.scale.setScalar(Math.max(0.35, hand.scale.x - dt * 0.8));
    if (S.phase === 'arrive' || S.phase === 'lift') { DM.cap = 'BOATS COME IN BY WATER. JON\'S LIFT RAISES THEM'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE OWNER CHECKS YOUR WORK. CLEAN JOBS EARN STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'lower' || S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || (S.phase !== 'intro' && S.phase !== 'done')) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.holdTo = null; DM.cap = 'WATCH A JOB AT JON\'S BOATWORKS'; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 3; S.forceType = 'sail'; startDay(); S.forceType = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; hand.visible = false; S.hold = null; S.ptr = null; S.react = null; S.flash = null; S.day = DM.day0; if (B) { scene.remove(B.g); B = null; } ownerFox.forEach(f => f.visible = false); Object.assign(S, { phase: 'intro', done: null, boatN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null }); setUniform(true); ben.visible = true; place(ben, Y.spots.ben, -0.2); place(jon, Y.spots.jon, 0.35); }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !B) return null; const T = S.tool, H = (p, text, tool = T, v = true) => ({ p, text, tool, r: 0.22, v });
    if (S.hold) return H(wp(S.hold.h), 'LET GO IN THE GREEN');
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : { text: 'ALL DONE · TAP HAND BACK', tool: 'hand' }; }
    if (T === 'scrape') { const b = B.barnacles.find(q => q.parent); return H(wp(b), 'SWIPE OVER THE BARNACLES · ' + info(T).left + ' LEFT'); }
    if (T === 'patch') { const h = B.holes.find(q => q.userData.state !== 'sealed'), U = h.userData; return H(wp(h), U.state === 'hole' ? 'RUB THE HOLE TO SAND IT · ' + Math.round(U.sand * 100) + '%' : U.state === 'sanded' ? 'TAP THE HOLE TO PUT A PATCH ON' : 'HOLD THE PATCH TO SEAL · LET GO IN THE GREEN'); }
    if (T === 'pump') return H(wp(B.pumpHd).add(V3(0, 0.4, 0)), 'TAP ANYWHERE TO PUMP · WATER ' + Math.round(B.waterLvl * 100) + '%', T, false);
    if (T === 'prop') return B.propState === 'bent' ? H(wp(B.prop), 'TAP THE BENT PROP TO UNSCREW · ' + B.propTaps + ' / 3') : { text: 'PICK A ' + B.job.propWant + '-BLADE PROP BELOW', tool: T };
    if (T === 'sail') { const t = B.tears.find(q => q.userData.st < needSt()); return H(wp(t), 'SWIPE BACK AND FORTH ACROSS THE TEAR · ' + t.userData.st + ' / ' + needSt()); }
    if (T === 'paint') { if (!S.brush) return { text: 'PICK ' + PAINTS[B.job.paint].name + ' BELOW', tool: T }; const p = B.panels.find(q => q.userData.cover < 1 || q.userData.col !== B.job.paint); if (!p) return null; return H(wp(p), p.userData.cover >= 1 ? 'WRONG COLOUR · PAINT IT ' + PAINTS[B.job.paint].name : 'SWIPE OVER THE PANEL TO PAINT IT'); }
    return null; }
  let HINT = null, hintT = 0;

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  function step(dt) { const t = clock.elapsedTime; S.phT += dt;
    Y.waterT.offset.x += dt * 0.015; Y.waterT.offset.y += dt * 0.008; Y.foamM.opacity = 0.45 + Math.sin(t * 1.7) * 0.15; if (B && B.flag) B.flag.rotation.y = Math.sin(t * 3) * 0.35;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    if (B) { const g = B.g, bob = Math.sin(t * 1.6) * 0.04, inWater = S.phase === 'arrive' || S.phase === 'leave';
      if (S.phase === 'arrive') { g.position.x = damp(g.position.x, 0, 1.4, dt); g.position.y = bob; g.rotation.z = Math.sin(t * 1.3) * 0.02; owner.position.copy(g.localToWorld(seatOf())); owner.rotation.y = -Math.PI / 2; if (Math.random() < dt * 14) puff(g.position.x + B.D.L / 2 + 0.3, 0.05, rr(-0.6, 0.6), 0xffffff, 1); if (Math.abs(g.position.x) < 0.04) { g.position.x = 0; S.phase = 'lift'; S.phT = 0; say(OWN.name + ': "' + B.job.line + '"', 4); tone(140, 0.4, 0.03, 'square'); } }
      else if (S.phase === 'lift') { const k = smooth(0, 1, Math.min(1, S.phT / 2.4)); g.position.y = RAISE * k + bob * (1 - k); g.rotation.z = 0; const j = Math.min(1, S.phT / 0.9), a = g.localToWorld(seatOf()), b = V3(Y.spots.owner.x, DY, Y.spots.owner.z); owner.position.lerpVectors(a, b, smooth(0, 1, j)); owner.position.y += Math.sin(j * Math.PI) * 0.8; owner.rotation.y = Math.PI / 2; if (Math.random() < dt * 10 && k < 0.9) puff(rr(-2, 2), g.position.y - 0.5, rr(-0.8, 0.8), 0xbfe6f5, 1); if (S.phT > 2.5) { S.phase = 'work'; S.tool = B.job.tasks[0]; tone(880, 0.08, 0.04); } }
      else if (S.phase === 'react') { if (S.react) S.react.t += dt; if (S.phT > 2.8) { S.react = null; S.phase = 'lower'; S.phT = 0; } }
      else if (S.phase === 'lower') { const k = smooth(0, 1, Math.min(1, S.phT / 2)); g.position.y = RAISE * (1 - k) + bob * k; const j = Math.min(1, S.phT / 0.9), a = V3(Y.spots.talk.x, DY, Y.spots.talk.z), b = g.localToWorld(seatOf()); owner.position.lerpVectors(a, b, smooth(0, 1, j)); owner.position.y += Math.sin(j * Math.PI) * 0.8; if (S.phT > 2.1) { S.phase = 'leave'; S.phT = 0; tone(90, 0.6, 0.04, 'sawtooth'); } }
      else if (S.phase === 'leave') { g.position.x += dt * (1 + S.phT * 4); g.position.y = bob; owner.position.copy(g.localToWorld(seatOf())); owner.rotation.y = Math.PI / 2; if (Math.random() < dt * 20) puff(g.position.x - B.D.L / 2, 0.05, rr(-0.6, 0.6), 0xffffff, 1); if (g.position.x > 22 && DM.on) { demoStop(); return; } if (g.position.x > 22) { S.boatN++; if (S.boatN >= BOATYARD.perDay) endDay(); else nextBoat(); } }
      else if (S.phase === 'work') { g.position.y = RAISE; owner.position.set(Y.spots.owner.x, DY, Y.spots.owner.z); owner.rotation.y = Math.PI / 2; }
      if (B) { kit.animFox && kit.animFox(owner, dt, 0);
        if (B.pumpT > 0) { B.pumpT = Math.max(0, B.pumpT - dt * 4); B.pumpHd.position.y = 0.5 - Math.sin(B.pumpT * Math.PI) * 0.18; }
        if (B.water) B.water.position.y = B.floorY + 0.02 + B.waterLvl * B.D.H * 0.45;
        if (B.drop) { B.drop.t += dt; const m = B.drop.m; m.position.y -= dt * (1 + B.drop.t * 6); m.rotation.z += dt * 4; if (wp(m).y < 0) { B.g.remove(m); puff(wp(B.g).x + B.propPos.x, 0.05, 0, 0xffffff, 4); tone(160, 0.2, 0.05); B.drop = null; } }
        if (B.propIn) { B.propIn.t += dt * 2; const k = smooth(0, 1, Math.min(1, B.propIn.t)); B.prop.position.copy(B.propPos).add(V3(0.6 * (1 - k), 0, 0)); B.prop.rotation.x = -k * 6; if (k >= 1) B.propIn = null; }
        else if (B.propState === 'on' && (S.phase === 'leave' || S.phase === 'arrive')) B.prop.rotation.x += dt * 30;
        for (const h of B.holes) { const U = h.userData; if (U.anim > 0 && U.anim < 1) { U.anim = Math.min(1, U.anim + dt * 4); U.patch.scale.setScalar(1 + (1 - U.anim) * 1.5); U.patch.position.z = 0.014 + (1 - U.anim) * 0.4; } }
        if (B.decal.userData.fade && B.decal.material.opacity < 1) B.decal.material.opacity = Math.min(1, B.decal.material.opacity + dt * 1.5);
        for (const s of Y.slings) { const bot = g.position.y - 0.62, top = 4.3, z = B.D.W / 2 + 0.06; s.bot.position.set(s.x + g.position.x, bot, 0); s.bot.scale.z = B.D.W + 0.2; s.cabs.forEach((c, i) => { c.scale.y = Math.max(0.01, top - bot); c.position.set(s.x + g.position.x, (top + bot) / 2, i ? z : -z); }); const show = S.phase !== 'arrive' && S.phase !== 'leave', close = S.phase === 'work'; s.bot.visible = show; s.cabs.forEach(c => c.visible = show && !close); if (B.sail) B.sail.visible = !(close && S.tool === 'pump'); Y.liftFront.forEach(m => m.visible = !close); } } }
    else { Y.liftFront.forEach(m => m.visible = true); } if (!B) for (const s of Y.slings) { s.bot.position.set(s.x, 3.0, 0); s.bot.scale.z = 2; s.cabs.forEach((c, i) => { c.scale.y = 1.3; c.position.set(s.x, 3.65, i ? 1.0 : -1.0); c.visible = true; }); s.bot.visible = true; }
    if (S.hold) { S.hold.v = Math.min(1.1, S.hold.v + dt * 0.42); S.hold.h.userData.seal.scale.setScalar(0.3 + S.hold.v * 0.7); if (Math.random() < dt * 6) tone(300 + S.hold.v * 300, 0.05, 0.02, 'sine'); if (S.hold.v >= 1.1) releaseSeal(); }
    // auto-follow: idle on a finished tool → next task
    if (!DM.on && S.phase === 'work' && S.tool && info(S.tool).done && !S.ptr && performance.now() - (S.userToolT || 0) > 3000 && performance.now() - (S.lastInput || 0) > 1200) { const nx = nextTask(); if (nx) S.tool = nx; }
    const sh = shot(); camera.position.lerp(sh.pos, Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2))); CAM.look.lerp(sh.look, Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2))); camera.lookAt(CAM.look);
    { const close = S.phase === 'work' || S.phase === 'react'; Y.front.forEach(m => m.visible = !close); }
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt); const vr = vis && vis.v ? Math.PI / 2 : 0; RINGS.pulse.rotation.x = RINGS.pulse2.rotation.x = vr; if (vis && vis.v) { RINGS.pulse.position.z += 0.06; RINGS.pulse2.position.z += 0.06; RINGS.pulse.scale.multiplyScalar(0.35); RINGS.pulse2.scale.multiplyScalar(0.35); RINGS.arrow.visible = false; }
    const greet = S.phase === 'intro' || S.phase === 'done'; kit.animFox && (kit.animFox(ben, dt, 0), kit.animFox(jon, dt, 0)); ben.userData.mood = greet ? 'excited' : 'happy';
    if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() { const J = B && B.job;
    return { phase: S.phase, day: S.day, boatN: S.boatN, perDay: BOATYARD.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { owner: OWN.name, boat: BOATS[J.type].name, name: J.boatName, paint: J.paint, paintName: PAINTS[J.paint].name, paintCol: PAINTS[J.paint].col, propWant: J.propWant, tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt }; }) } : null,
      tool: S.tool, brush: S.brush, propPick: !!(B && S.phase === 'work' && S.tool === 'prop' && B.propState === 'off'), allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      press: S.hold ? { v: S.hold.v / 1.1, zone: S.hold.v < SEAL[0] ? 'TOO THIN' : S.hold.v <= SEAL[1] ? 'JUST RIGHT' : S.hold.v < 1 ? 'DRIPPY' : 'OVERFLOW' } : null,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('boatUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null }; }
  frame();
  return { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } }, setTool, setBrush, pickProp, handBack, startDay, demoStart, demoStop, buyUpgrade, hud, setPaused(v) { PAUSE = !!v; },
    toIntro() { S.phase = 'intro'; S.done = null; setUniform(true); ben.visible = true; place(ben, Y.spots.ben, -0.2); place(jon, Y.spots.jon, 0.35); },
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _force(t) { S.forceType = t; }, _state: () => S, _boat: () => B, _scr: scr, _wp: wp,
    _auto() { return { scrapeAll() { B.barnacles.forEach(b => b.parent && b.parent.remove(b)); checkDone(); }, patchAll() { B.holes.forEach(h => { const U = h.userData; U.state = 'sealed'; U.q = 1; U.patch.visible = true; U.spl.visible = false; U.ring.material.opacity = 1; U.seal.scale.setScalar(1); }); checkDone(); }, pumpAll() { if (B.waterLvl) { B.waterLvl = 0; B.water.visible = false; } checkDone(); }, propAll() { if (B.propState === 'bent') { B.propTaps = 2; propTap(); } pickProp(B.job.propWant); }, sailAll() { B.tears.forEach(t => { t.userData.st = needSt(); t.userData.zig.forEach(z => z.material.color.set(0xd8d2c4)); }); checkDone(); }, paintAll() { S.brush = B.job.paint; B.panels.forEach(p => { p.userData.col = S.brush; p.userData.cover = 1; p.material.map = null; p.material.needsUpdate = true; p.material.color.set(PAINTS[S.brush].col); }); checkDone(); } }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
