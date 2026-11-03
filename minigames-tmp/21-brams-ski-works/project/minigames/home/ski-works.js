// 8 GATES — BRAM'S SKI WORKS [homeSkiWorks]. Home planet, off the Ski Lodge plaza (gayaMountainPath). Bram "waxes boards, digs out the racks,
// keeps the cocoa on. Never actually skis." Ski factory at the back, ski shop at the front. Job location like Jon's Boatworks: one customer at a time,
// no clock, scored on quality. 3 customers = a day.
// FLOW: a customer walks in → JOB CARD → work the tasks (any order, a few rules) → HAND OVER → reaction + pay + tip → the customer walks out with the skis.
// TASKS (one touch gesture each):
//   MEASURE  drag the marker up the height pole and let go at the customer's nose (the ski length)
//   PRESS    tap the 4 layers in order (BASE › EDGES › CORE › TOP SHEET), then HOLD to press and let go in the green (camber)
//   SHAPE    trace the dotted sidecut line from tail to tip with one finger; the router follows you
//   PAINT    pick the card's colour, swipe over the top sheets; the design appears when done
//   WAX      pick the wax for today's snow, RUB IN CIRCLES on the bases
//   BIND     TWIST the dial with a circular drag to the card's DIN number, then LOCK
// RULES: measure before you press; shape / paint / wax / bind need pressed skis.
// FREE WALK (not working): Ben walks the shop with the standard Game HUD (stick, 1 WAVE · 2 TRY SKIS · 3 HOP, TALK near someone).
//   Bram (counter, offers work + the shop), Perri (ski rack), Nix (cocoa stove). Lines from the 2D Gaya build (skiLodgeHand, skiInstructor, skiLiftPip).
// Save keys ski.works.*, flags skiUniform, skiOwnPair. Built on engine/restaurant-kit.js.
// MERGE: buildWorks(ctx) builds the interior at an origin; createSkiWorks({ container, onState, onExit }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { skiAudio } from './ski-audio.js';

export const SKIWORKS = { name: "BRAM'S SKI WORKS", room: 'homeSkiWorks', world: 'home', perDay: 3 };
export const TOPS = { lilac: { name: 'LILAC', col: '#9b7ee8' }, orange: { name: 'ORANGE', col: '#f08a24' }, teal: { name: 'TEAL', col: '#2f9a8f' }, navy: { name: 'NAVY', col: '#1f3a5f' } };
export const WAXES = { cold: { name: 'COLD', snow: 'COLD POWDER', col: '#3b82f6' }, mild: { name: 'MILD', snow: 'PACKED SNOW', col: '#a855f7' }, warm: { name: 'WARM', snow: 'SPRING SLUSH', col: '#ef4444' } };
export const SKIS = { kids: { name: 'KIDS', price: 14, W: 0.085 }, all: { name: 'ALL-MOUNTAIN', price: 18, W: 0.1 }, racer: { name: 'RACER', price: 24, W: 0.082 }, powder: { name: 'POWDER', price: 22, W: 0.13 } };
export const DESIGNS = ['FOX', 'STAR', 'PEAK', '8'];
export const TASKS = { measure: { label: 'MEASURE', name: 'Measure the customer' }, press: { label: 'PRESS', name: 'Stack the layers and press' }, shape: { label: 'SHAPE', name: 'Trace the sidecut' }, paint: { label: 'PAINT', name: 'Print the top sheets' }, wax: { label: 'WAX', name: 'Wax the bases' }, bind: { label: 'BIND', name: 'Set the bindings' } };
const ORDER = ['measure', 'press', 'shape', 'paint', 'wax', 'bind'];
export const LAYERS = [{ id: 'base', label: 'BASE', col: '#2a2a30' }, { id: 'edges', label: 'EDGES', col: '#c9d1d8' }, { id: 'core', label: 'CORE', col: '#d9b26a' }, { id: 'top', label: 'TOP SHEET', col: '#f4ecd8' }];
export const UPGRADES = [
  { id: 'hydro', name: 'HYDRAULIC PRESS', cost: 40, line: 'The green zone on the press is twice as wide.' },
  { id: 'guide', name: 'ROUTER GUIDE', cost: 35, line: 'The shaping line is twice as forgiving.' },
  { id: 'roller', name: 'WIDE ROLLER', cost: 35, line: 'Top sheets print in one swipe.' },
  { id: 'iron', name: 'HOT WAX IRON', cost: 30, line: 'Wax goes on in half the circles.' },
  { id: 'radio', name: 'LODGE RADIO', cost: 60, line: 'Customers tip 25% more.' }];
// the shop counter (free walk): Lift Pass + Hand Warmer are the Ski Lodge loot in the 2D build
// NPC talk for a world that places Bram / Perri / Nix outside (Ski Lodge plaza): greeting + [player line, answer] pairs, verbatim from the 2D Gaya build
export const SKI_NPCS = {
  bram: { key: 'skiLodgeHand', name: 'BRAM', torso: ['#4f9c84', '#2f6b58', '#17352c'], greet: 'Boards on the rack, not in the snow. And do not go up without telling somebody.' },
  perri: { key: 'skiInstructor', name: 'PERRI', torso: ['#5f8ad0', '#2f4a80', '#16233d'], greet: 'Knees soft, look where you want to go. And where you want to go is not at the ones with the arms.' },
  nix: { key: 'skiLiftPip', name: 'NIX', torso: ['#c94f5c', '#8f2f38', '#4a1418'], greet: 'Bar comes down, tips come up. And if you see one on the piste, ski round it, not past it.' } };
export const SHOP = [
  { id: 'liftPass', name: 'LIFT PASS', price: 6, line: 'Nix lets you on the chair. Bar comes down, tips come up.' },
  { id: 'handWarmer', name: 'HAND WARMER', price: 4, line: 'Warm paws all the way up the lift.' },
  { id: 'skiWax', name: 'GLIDE WAX', price: 3, line: 'One coat for your own skis.' },
  { id: 'skisRental', name: 'RENTAL SKIS', price: 15, line: 'Scuffed but honest. Good for the flat by the lodge.' },
  { id: 'skisPines', name: 'PINES POWDER SKIS', price: 45, line: 'Wide and floaty for the deep snow under The Pines.' },
  { id: 'skisRibbon', name: 'BLUE RIBBON RACERS', price: 60, line: 'Named for the fastest slalom run on the mountain.' }];
const CUSTOMERS = [
  { key: 'nix', name: 'NIX', torso: ['#c94f5c', '#8f2f38', '#4a1418'], outfit: 'coat', types: ['all', 'racer'] },
  { key: 'perri', name: 'PERRI', torso: ['#5f8ad0', '#2f4a80', '#16233d'], outfit: 'coat', types: ['all', 'powder'] },
  { name: 'PLUM', torso: ['#7c4a8a', '#c9a7e0', '#3d1f47'], outfit: 'vest', fur: '#d9a066', furDark: '#9a6a3a', types: ['all', 'powder', 'racer'] },
  { name: 'IRIS', torso: ['#6d7fd6', '#e6e9fb', '#2e3a7a'], outfit: 'dress', types: ['all', 'racer'] },
  { name: 'ORCHID', torso: ['#d36bb0', '#fbe3f3', '#7a2a5f'], outfit: 'coat', fur: '#f0dcbe', furDark: '#c2a577', types: ['powder', 'all'] },
  { name: 'BROTHER CINNABAR', torso: ['#f7f1e6', '#e3d8c4', '#b23a2a'], outfit: 'robe', fur: '#b0582a', furDark: '#7a3a18', types: ['all', 'powder'] },
  { name: "CUB · PERRI'S CLASS", kid: true, torso: ['#f2c94c', '#fbf8ec', '#a8792e'], outfit: 'coat', types: ['kids'] }];
const HELLO = ['Snow is coming in heavy. I need a pair that floats.', 'My old pair snapped on the Blue Ribbon. Again.', 'Make them fast. Make them pretty. In that order.', 'Bram says you are the new hand. No pressure.', 'First run is at eight. Can you do it by then?'];
const HELLO_KID = ['My first ever skis! Perri says knees soft!', 'Can they go really, really fast?', 'I want the fox on mine. The FOX!'];
const SAVE = { day: 'ski.works.day', best: 'ski.works.best', upg: 'ski.works.upg.', stars: 'ski.works.stars' };
const PRESS_Z = [0.5, 0.72], PRESS_ZH = [0.4, 0.82], MEAS_TOL = 0.05;

// ---------------- the building: factory at the back, shop at the front ----------------
export function buildWorks(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const Y = { root, walls: [], front: [], lamps: [], obst: [], st: {} }, grad = ctx.grad;
  const ink = toon('#201e1d'), wood = toon('#b8875a'), woodD = toon('#7a5236'), woodL = toon('#d4a777'), gold = toon('#e6b45a'), green = toon('#2f6b58'), greenD = toon('#17352c'), cream = toon('#f4ecd8'), yel = toon('#f2c94c'), steel = toon('#9aa3ab'), steelD = toon('#5a646d'), red = toon('#d8432f'), snowM = toon('#eef5fb');
  const TM = t => new T3.MeshToonMaterial({ map: t, gradientMap: grad });
  // floor + rug
  const plank = CTX(256, 256, c => { c.fillStyle = '#a87a4e'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = i % 3 ? '#a2744a' : '#b08254'; c.fillRect(0, i * 32, 256, 30); c.fillStyle = '#6b4a2c'; c.fillRect(0, i * 32 + 30, 256, 2); c.fillRect((i * 97) % 256, i * 32, 2, 30); } });
  plank.wrapS = plank.wrapT = T3.RepeatWrapping; plank.repeat.set(4, 4);
  { const f = new T3.Mesh(new T3.PlaneGeometry(16, 14), TM(plank)); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; root.add(f); }
  { const rug = CTX(256, 128, c => { c.fillStyle = '#7a3a5a'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#e6b45a'; c.fillRect(8, 8, 240, 6); c.fillRect(8, 114, 240, 6); c.fillStyle = '#b79be8'; for (let i = 0; i < 8; i++) { c.beginPath(); c.moveTo(20 + i * 30, 64); c.lineTo(32 + i * 30, 40); c.lineTo(44 + i * 30, 64); c.lineTo(32 + i * 30, 88); c.fill(); } });
    const r = new T3.Mesh(new T3.PlaneGeometry(4.4, 2.2), TM(rug)); r.rotation.x = -Math.PI / 2; r.position.set(-2.6, 0.01, 3.6); r.receiveShadow = true; root.add(r); }
  // snowy ground outside (seen when the camera is outside the front wall)
  { const s = new T3.Mesh(new T3.PlaneGeometry(70, 70), snowM); s.rotation.x = -Math.PI / 2; s.position.y = -0.02; root.add(s);
    const pine = (x, z, k) => { M(new T3.CylinderGeometry(0.12 * k, 0.15 * k, 0.6 * k, 6), woodD, x, 0.3 * k, z, root, 0); for (let i = 0; i < 3; i++) M(new T3.ConeGeometry((1.1 - i * 0.28) * k, 1.1 * k, 8), toon(i % 2 ? '#2f6b58' : '#3f7d62'), x, (0.9 + i * 0.6) * k, z, root, 0.02); M(new T3.ConeGeometry(0.36 * k, 0.35 * k, 8), snowM, x, 2.35 * k, z, root, 0); };
    for (const [x, z, k] of [[-11, 9, 1.4], [-9, 12, 1.1], [10, 9.5, 1.5], [12.5, 13, 1.2], [-14, 4, 1.6], [14, 3, 1.4], [-4, 13, 1], [5, 14, 1.2]]) pine(x, z, k); }
  // walls (log cabin) — each wall knows its inward normal so the camera can cut away the near ones
  const logT = CTX(256, 256, c => { c.fillStyle = '#8f6440'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#9a6c45' : '#8a5e3a'; c.fillRect(0, i * 32 + 2, 256, 27); c.fillStyle = '#5a3a22'; c.fillRect(0, i * 32 + 29, 256, 5); c.fillStyle = '#a67a52'; c.fillRect(0, i * 32 + 6, 256, 3); } });
  logT.wrapS = logT.wrapT = T3.RepeatWrapping;
  const H = 4.2;
  const wall = (w, x, z, ry, n, front, y0 = 0, h = H) => { const t = logT.clone(); t.needsUpdate = true; t.repeat.set(w / 4, h / 4); const m = new T3.Mesh(new T3.BoxGeometry(w, h, 0.25), TM(t)); m.position.set(x, y0 + h / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); const W0 = { ms: [m], n }; Y.walls.push(W0); if (front) Y.front.push(m); return W0; };
  const back = wall(16.5, 0, -7.1, 0, [0, 1]), left = wall(14.4, -8.1, 0, Math.PI / 2, [1, 0]), right = wall(14.4, 8.1, 0, Math.PI / 2, [-1, 0]);
  const fr = [wall(7.2, -4.6, 7.1, 0, [0, -1], true), wall(7.2, 4.6, 7.1, 0, [0, -1], true), wall(2.0, 0, 7.1, 0, [0, -1], true, 2.7, 1.5)];
  fr[0].ms.push(...fr[1].ms, ...fr[2].ms); Y.walls.splice(Y.walls.indexOf(fr[1]), 1); Y.walls.splice(Y.walls.indexOf(fr[2]), 1); Y.frontWall = fr[0];
  { const dg = new T3.Group(); dg.position.set(-0.95, 0, 7.12); root.add(dg); const dm = toon('#5f3c24'); M(new T3.BoxGeometry(1.9, 2.66, 0.08), dm, 0.95, 1.33, 0, dg, 0.012); for (const y of [0.6, 1.33, 2.1]) M(new T3.BoxGeometry(1.7, 0.08, 0.1), woodD, 0.95, y, 0, dg, 0); const dw = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.5), new T3.MeshBasicMaterial({ color: 0xcfe3f0 })); dw.position.set(0.95, 1.85, -0.05); dw.rotation.y = Math.PI; dg.add(dw); M(new T3.SphereGeometry(0.06, 8, 6), gold, 1.65, 1.15, -0.08, dg, 0.005); M(new T3.BoxGeometry(0.3, 0.38, 0.04), toon('#2f6b58'), 0.95, 2.35, -0.07, dg, 0.006); Y.door = dg; dg.traverse(o => o.isMesh && fr[0].ms.push(o)); }
  { const d = M(new T3.BoxGeometry(2.2, 0.2, 0.35), woodD, 0, 2.75, 7.1, root, 0.02); fr[0].ms.push(d); for (const x of [-1.05, 1.05]) fr[0].ms.push(M(new T3.BoxGeometry(0.16, 2.7, 0.35), woodD, x, 1.35, 7.1, root, 0.02)); }
  // windows with a mountain view + falling snow + lilac window boxes (home planet style)
  const viewT = CTX(512, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#7fb2e0'); g.addColorStop(1, '#dcecf8'); c.fillStyle = g; c.fillRect(0, 0, 512, 256);
    const mt = (x, w, h, col) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - w, 256); c.lineTo(x, 256 - h); c.lineTo(x + w, 256); c.fill(); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(x - w * 0.28, 256 - h * 0.72); c.lineTo(x, 256 - h); c.lineTo(x + w * 0.28, 256 - h * 0.72); c.lineTo(x + w * 0.1, 256 - h * 0.66); c.lineTo(x - w * 0.06, 256 - h * 0.74); c.fill(); };
    mt(120, 170, 200, '#6f8fb8'); mt(360, 200, 230, '#5f7fa8'); mt(250, 140, 140, '#8aa6c8'); c.fillStyle = '#2f6b58'; for (let i = 0; i < 40; i++) { const x = i * 13, h = 20 + (i * 37) % 26; c.beginPath(); c.moveTo(x - 7, 256); c.lineTo(x, 256 - h); c.lineTo(x + 7, 256); c.fill(); } c.fillStyle = '#ffffff'; c.fillRect(0, 248, 512, 8); });
  const flakeT = CTX(128, 128, c => { c.clearRect(0, 0, 128, 128); c.fillStyle = '#ffffff'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc((i * 53) % 128, (i * 29) % 128, 1.2 + (i % 3), 0, 7); c.fill(); } }); flakeT.wrapS = flakeT.wrapT = T3.RepeatWrapping; Y.flakeT = flakeT;
  const flakeM = new T3.MeshBasicMaterial({ map: flakeT, transparent: true, depthWrite: false });
  const windowAt = (x, y, z, ry, w, h, parentWall) => { const g = new T3.Group(); g.position.set(x, y, z); g.rotation.y = ry; root.add(g);
    const v = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: viewT })); v.position.z = 0.135; g.add(v); const f = new T3.Mesh(new T3.PlaneGeometry(w, h), flakeM); f.position.z = 0.14; g.add(f);
    for (const [bx, by, bw, bh] of [[0, h / 2, w + 0.2, 0.14], [0, -h / 2, w + 0.2, 0.14], [-w / 2, 0, 0.14, h], [w / 2, 0, 0.14, h], [0, 0, 0.07, h]]) M(new T3.BoxGeometry(bw, bh, 0.12), woodD, bx, by, 0.17, g, 0.01);
    M(new T3.BoxGeometry(w + 0.1, 0.24, 0.3), green, 0, -h / 2 - 0.2, 0.3, g, 0.015); for (let i = 0; i < 7; i++) M(new T3.SphereGeometry(0.09, 8, 6), toon(i % 2 ? '#b79be8' : '#d6c3f5'), -w / 2 + 0.15 + i * (w - 0.3) / 6, -h / 2 - 0.04, 0.3, g, 0.006, 0.09);
    if (parentWall) g.traverse(o => o.isMesh && parentWall.ms.push(o)); return g; };
  for (const x of [-3.6, 0, 3.6]) windowAt(x, 2.55, -7.1, 0, 1.6, 1.1, back);
  for (const z of [-1.5, 3.5]) windowAt(-8.1, 3.05, z, Math.PI / 2, 1.5, 0.9, left);
  for (const x of [-4.4, 4.4]) windowAt(x, 1.9, 7.1, Math.PI, 1.8, 1.2, fr[0]);
  // signs: gold-trimmed (home planet)
  const signTex = (txt, w = 1024, h = 180, bg = '#17352c', fs = 104) => CTX(w, h, c => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.strokeStyle = '#e6b45a'; c.lineWidth = 12; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#f4ecd8'; c.font = '900 ' + fs + 'px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, w / 2, h / 2 + 6); });
  { const s = new T3.Mesh(new T3.PlaneGeometry(5.6, 0.98), new T3.MeshBasicMaterial({ map: signTex("BRAM'S SKI WORKS") })); s.position.set(0, 3.62, -6.96); root.add(s); back.ms.push(s); }
  { const g = new T3.Group(); g.position.set(4.6, 3.2, 1.0); root.add(g); const s = new T3.Mesh(new T3.PlaneGeometry(2.6, 0.5), new T3.MeshBasicMaterial({ map: signTex('SKI SHOP', 512, 100, '#2f6b58', 64), side: T3.DoubleSide })); g.add(s); for (const x of [-1.1, 1.1]) M(new T3.CylinderGeometry(0.012, 0.012, 1.0, 4), ink, x, 0.75, 0, g, 0); Y.shopSign = g; }
  // ---- factory benches ----
  const bench = (x, z, w = 2.6, d = 1.25, h = 0.88) => { M(new T3.BoxGeometry(w, 0.1, d), woodL, x, h - 0.05, z, root, 0.02); for (const sx of [-1, 1]) for (const sz of [-1, 1]) M(new T3.BoxGeometry(0.12, h - 0.1, 0.12), woodD, x + sx * (w / 2 - 0.12), (h - 0.1) / 2, z + sz * (d / 2 - 0.12), root, 0.01); M(new T3.BoxGeometry(w - 0.3, 0.06, d - 0.3), woodD, x, 0.22, z, root, 0); Y.obst.push([x - w / 2, x + w / 2, z - d / 2, z + d / 2]); };
  const BZ = -5.2;
  // PRESS
  { const x = -5.4; bench(x, BZ, 2.7, 1.3); M(new T3.BoxGeometry(2.2, 0.08, 0.8), steelD, x, 0.92, BZ, root, 0.012);
    for (const sx of [-1, 1]) M(new T3.BoxGeometry(0.22, 2.6, 0.3), yel, x + sx * 1.22, 2.1, BZ, root, 0.02);
    M(new T3.BoxGeometry(2.8, 0.34, 0.42), yel, x, 3.45, BZ, root, 0.02); M(new T3.CylinderGeometry(0.16, 0.16, 0.6, 14), red, x, 3.0, BZ, root, 0.012, 0.16);
    const pl = new T3.Group(); pl.position.set(x, 2.45, BZ); root.add(pl); M(new T3.BoxGeometry(2.2, 0.14, 0.78), steel, 0, 0, 0, pl, 0.015); M(new T3.CylinderGeometry(0.07, 0.07, 1.0, 10), toon('#d7dde3'), 0, 0.55, 0, pl, 0.006, 0.07); Y.platen = pl;
    M(new T3.BoxGeometry(0.5, 0.35, 0.12), ink, x + 1.6, 1.4, BZ - 0.1, root, 0.01); Y.st.press = { x, z: BZ, y: 0.97, key: 'press' }; }
  // SHAPE: router on a gantry
  { const x = -1.8; bench(x, BZ); for (const sz of [-0.5, 0.5]) M(new T3.BoxGeometry(2.6, 0.06, 0.06), steelD, x, 1.42, BZ + sz, root, 0.006); for (const sx of [-1.25, 1.25]) for (const sz of [-0.5, 0.5]) M(new T3.BoxGeometry(0.06, 0.55, 0.06), steelD, x + sx, 1.15, BZ + sz, root, 0);
    const r = new T3.Group(); root.add(r); M(new T3.BoxGeometry(0.2, 0.3, 0.2), toon('#f08a24'), 0, 0.32, 0, r, 0.012); M(new T3.CylinderGeometry(0.03, 0.015, 0.16, 8), steel, 0, 0.1, 0, r, 0.005); M(new T3.BoxGeometry(0.06, 0.06, 1.0), steelD, 0, 0.5, 0, r, 0); r.position.set(x + 1.2, 0.94, BZ - 0.5); Y.router = r; Y.routerHome = r.position.clone();
    Y.st.shape = { x, z: BZ, y: 0.94, key: 'shape' }; }
  // PAINT: print bench, cans on a shelf, roller
  { const x = 1.8; bench(x, BZ); M(new T3.BoxGeometry(2.2, 0.06, 0.4), woodD, x, 1.55, -6.8, root, 0.01); Object.values(TOPS).forEach((p, i) => { M(new T3.CylinderGeometry(0.15, 0.15, 0.28, 12), toon(p.col), x - 0.8 + i * 0.52, 1.72, -6.78, root, 0.008, 0.15); M(new T3.CylinderGeometry(0.155, 0.155, 0.03, 12), steel, x - 0.8 + i * 0.52, 1.87, -6.78, root, 0); });
    const ro = new T3.Group(); root.add(ro); const cyl = M(new T3.CylinderGeometry(0.07, 0.07, 0.36, 12), cream, 0, 0.08, 0, ro, 0.008, 0.07); cyl.rotation.x = Math.PI / 2; Y.rollerCyl = cyl; M(new T3.BoxGeometry(0.03, 0.4, 0.03), ink, 0, 0.3, 0, ro, 0); ro.position.set(x + 1.1, 0.88, BZ - 0.35); Y.roller = ro; Y.rollerHome = ro.position.clone();
    Y.st.paint = { x, z: BZ, y: 0.94, key: 'paint' }; }
  // WAX: vises, wax blocks, iron
  { const x = 5.4; bench(x, BZ); for (const sx of [-0.7, 0.7]) M(new T3.BoxGeometry(0.16, 0.16, 0.7), steelD, x + sx, 1.0, BZ, root, 0.008);
    Object.values(WAXES).forEach((w, i) => M(new T3.BoxGeometry(0.22, 0.1, 0.12), toon(w.col), x - 0.9 + i * 0.3, 0.98, BZ - 0.5, root, 0.006));
    const ir = new T3.Group(); root.add(ir); M(new T3.BoxGeometry(0.26, 0.08, 0.16), toon('#d7dde3'), 0, 0.04, 0, ir, 0.006); M(new T3.BoxGeometry(0.2, 0.06, 0.06), ink, 0, 0.16, 0, ir, 0.004); M(new T3.BoxGeometry(0.04, 0.08, 0.04), ink, -0.08, 0.11, 0, ir, 0); M(new T3.SphereGeometry(0.02, 6, 4), new T3.MeshBasicMaterial({ color: 0xff4a2a }), 0.1, 0.09, 0.06, ir, 0); ir.position.set(x + 1.05, 0.88, BZ + 0.35); Y.iron = ir; Y.ironHome = ir.position.clone();
    Y.st.wax = { x, z: BZ, y: 1.2, key: 'wax' }; }
  // divider half-walls with a gap in the middle (STAFF ONLY)
  for (const [x0, x1] of [[-8, -1.3], [1.3, 2.2]]) { M(new T3.BoxGeometry(x1 - x0, 1.0, 0.18), woodD, (x0 + x1) / 2, 0.5, -3.0, root, 0.015); M(new T3.BoxGeometry(x1 - x0 + 0.1, 0.08, 0.3), woodL, (x0 + x1) / 2, 1.04, -3.0, root, 0.01); Y.obst.push([x0, x1, -3.15, -2.85]); }
  { const s = new T3.Mesh(new T3.PlaneGeometry(1.5, 0.28), new T3.MeshBasicMaterial({ map: signTex('WORKSHOP · STAFF', 512, 96, '#17352c', 46) })); s.position.set(-2.1, 0.62, -2.9); root.add(s); }
  // ---- shop: counter, register, binding jig, dial ----
  { M(new T3.BoxGeometry(4.4, 1.0, 0.8), wood, 4.6, 0.5, 1.0, root, 0.02); M(new T3.BoxGeometry(4.6, 0.08, 1.0), green, 4.6, 1.04, 1.0, root, 0.015); M(new T3.BoxGeometry(4.4, 0.12, 0.02), gold, 4.6, 0.86, 1.41, root, 0);
    M(new T3.BoxGeometry(0.5, 0.32, 0.4), ink, 6.2, 1.24, 0.9, root, 0.012); M(new T3.BoxGeometry(0.42, 0.18, 0.04), toon('#0b2a14'), 6.2, 1.46, 1.08, root, 0);
    for (const [mx, mc] of [[6.6, '#d8432f'], [2.8, '#f4ecd8']]) M(new T3.CylinderGeometry(0.06, 0.05, 0.12, 10), toon(mc), mx, 1.14, 1.2, root, 0.005, 0.06);
    Y.obst.push([2.4, 6.8, 0.55, 1.45]); Y.st.bind = { x: 3.9, z: 1.0, y: 1.1, key: 'bind' };
    Y.dialCv = document.createElement('canvas'); Y.dialCv.width = Y.dialCv.height = 256; Y.dialTex = new T3.CanvasTexture(Y.dialCv); Y.dialTex.colorSpace = T3.SRGBColorSpace;
    Y.dial = new T3.Sprite(new T3.SpriteMaterial({ map: Y.dialTex, depthTest: false })); Y.dial.renderOrder = 25; Y.dial.scale.setScalar(0.62); Y.dial.position.set(5.35, 1.5, 1.05); Y.dial.visible = false; root.add(Y.dial); }
  // height pole (MEASURE)
  { const g = new T3.Group(); g.position.set(1.3, 0, 2.6); root.add(g); const cm = CTX(64, 1024, c => { c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 64, 1024); c.fillStyle = '#201e1d'; for (let i = 0; i <= 250; i += 5) { const y = 1024 - i / 250 * 1024; c.fillRect(0, y - 1, i % 50 ? 18 : i % 10 ? 26 : 34, i % 50 ? 2 : 4); } c.font = '800 15px Archivo, Arial'; c.textAlign = 'right'; for (let i = 50; i < 250; i += 50) c.fillText(String(i), 60, 1024 - i / 250 * 1024 + 5); });
    const p = new T3.Mesh(new T3.BoxGeometry(0.12, 2.5, 0.06), [toon('#fbf8ec'), toon('#fbf8ec'), toon('#fbf8ec'), toon('#fbf8ec'), TM(cm), toon('#fbf8ec')]); p.position.y = 1.25; addOut(p); g.add(p);
    M(new T3.CylinderGeometry(0.3, 0.34, 0.06, 18), green, 0, 0.03, 0, g, 0.01, 0.3);
    const mk = new T3.Group(); g.add(mk); M(new T3.BoxGeometry(0.44, 0.04, 0.2), yel, 0.18, 0, 0.02, mk, 0.008); const tri = M(new T3.ConeGeometry(0.06, 0.14, 3), yel, 0.44, 0, 0.02, mk, 0.006); tri.rotation.z = -Math.PI / 2; mk.position.y = 0.9; Y.marker = mk;
    const band = new T3.Mesh(new T3.BoxGeometry(0.62, MEAS_TOL * 2, 0.24), new T3.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.45, depthWrite: false })); band.position.set(0.2, 1.6, 0.02); band.visible = false; g.add(band); Y.band = band; Y.pole = g; }
  function addOut(m) { if (ctx.addOutline) ctx.addOutline(m, 0.012); }
  // ski racks (left wall) + snowboards (right wall)
  { M(new T3.BoxGeometry(0.3, 0.12, 7.2), woodD, -7.85, 0.3, 2.0, root, 0.01); M(new T3.BoxGeometry(0.3, 0.12, 7.2), woodD, -7.85, 1.75, 2.0, root, 0.01);
    const cols = ['#d8432f', '#2f9a8f', '#f2c94c', '#9b7ee8', '#1f3a5f', '#f08a24', '#22c55e', '#ec4899'];
    cols.forEach((c, i) => { for (const dz of [-0.07, 0.07]) { const s = new T3.Group(); s.position.set(-7.78, 0.25, -1.2 + i * 0.9 + dz); s.rotation.z = -0.08; root.add(s); M(new T3.BoxGeometry(0.03, 1.75, 0.09), toon(c), 0, 0.875, 0, s, 0.008); const tip = M(new T3.BoxGeometry(0.03, 0.22, 0.09), toon(c), 0.05, 1.82, 0, s, 0.008); tip.rotation.z = -0.5; } });
    Y.obst.push([-8.0, -7.2, -1.8, 5.8]);
    ['#201e1d', '#2f6b58', '#ec3013', '#9b7ee8', '#e6b45a'].forEach((c, i) => { const b = M(new T3.CapsuleGeometry(0.15, 1.1, 4, 10), toon(c), 7.85, 0.95, 2.6 + i * 0.8, root, 0.012); b.scale.set(0.2, 1, 1); });
    M(new T3.BoxGeometry(0.3, 0.06, 2.0), woodD, 7.85, 2.35, -0.3, root, 0.008); for (let i = 0; i < 5; i++) { M(new T3.TorusGeometry(0.08, 0.025, 6, 12), toon(['#f2c94c', '#ec3013', '#38bdf8', '#9b7ee8', '#22c55e'][i]), 7.75, 2.48, -1.1 + i * 0.4, root, 0.004).rotation.y = Math.PI / 2; }
    Y.obst.push([7.3, 8.0, 2.0, 6.4]); }
  // cocoa stove (front-left corner)
  { const x = -6.6, z = 5.6; M(new T3.CylinderGeometry(0.45, 0.5, 0.9, 14), ink, x, 0.45, z, root, 0.02, 0.5); M(new T3.CylinderGeometry(0.1, 0.1, 3.4, 8), ink, x, 2.6, z, root, 0.008, 0.1); M(new T3.BoxGeometry(0.3, 0.2, 0.06), new T3.MeshBasicMaterial({ color: 0xff8a3a }), x + 0.3, 0.45, z + 0.3, root, 0).rotation.y = 0.8;
    M(new T3.CylinderGeometry(0.2, 0.17, 0.26, 12), toon('#7a3a22'), x, 1.03, z, root, 0.008, 0.2); Y.ember = new T3.Mesh(new T3.SphereGeometry(0.16, 10, 8), new T3.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.8, blending: T3.AdditiveBlending, depthWrite: false })); Y.ember.position.set(x + 0.32, 0.45, z + 0.32); Y.ember.scale.set(1.3, 0.8, 1.3); root.add(Y.ember); Y.steam = new T3.Vector3(x, 1.25, z); Y.obst.push([x - 0.55, x + 0.55, z - 0.55, z + 0.55]);
    M(new T3.BoxGeometry(0.9, 0.7, 0.6), woodD, x + 1.1, 0.35, z + 0.6, root, 0.012); for (let i = 0; i < 3; i++) M(new T3.CylinderGeometry(0.05, 0.045, 0.1, 8), toon(['#f4ecd8', '#d8432f', '#2f6b58'][i]), x + 0.85 + i * 0.22, 0.75, z + 0.6, root, 0.004, 0.05); Y.obst.push([x + 0.6, x + 1.6, z + 0.25, z + 0.95]); }
  // a bench by the door
  { M(new T3.BoxGeometry(1.8, 0.1, 0.5), woodL, -3.4, 0.5, 6.5, root, 0.012); for (const sx of [-0.8, 0.8]) M(new T3.BoxGeometry(0.1, 0.5, 0.45), woodD, -3.4 + sx, 0.25, 6.5, root, 0.006); Y.obst.push([-4.3, -2.5, 6.2, 6.8]); }
  // pendant lamps
  for (const [x, z] of [[-4, -4.4], [0, -4.4], [4, -4.4], [-3, 2.6], [4.6, 2.2]]) { M(new T3.CylinderGeometry(0.01, 0.01, 0.8, 4), ink, x, 3.8, z, root, 0); M(new T3.ConeGeometry(0.3, 0.26, 14, 1, true), toon('#2f6b58', { side: T3.DoubleSide }), x, 3.35, z, root, 0.008); Y.lamps.push(M(new T3.SphereGeometry(0.09, 8, 6), new T3.MeshBasicMaterial({ color: 0xfff0c0 }), x, 3.25, z, root, 0)); }
  Y.spots = { door: { x: 0, z: 8.2 }, inside: { x: 0, z: 5.4 }, cust: { x: 2.0, z: 2.6 }, benMeasure: { x: 0.6, z: 2.7 }, bramCounter: { x: 4.6, z: 0.05 }, bramWork: { x: -5.6, z: 4.7 }, benBind: { x: 3.0, z: 0.1 }, introBen: { x: 2.4, z: 3.3 }, introBram: { x: 3.6, z: 3.2 }, perri: { x: -6.7, z: 2.4 }, nix: { x: -5.3, z: 5.0 } };
  Y.benAt = { press: { x: -4.3, z: -6.3 }, shape: { x: -0.7, z: -6.3 }, paint: { x: 2.9, z: -6.3 }, wax: { x: 6.5, z: -6.3 }, bind: { x: 3.0, z: 0.1 }, measure: { x: -0.5, z: 2.1 } };
  return Y;
}

// ---------------- a pair of skis ----------------
function skiProfile(L, W, shaped) {
  const hw = x => { const t = 2 * x / L; let w = shaped ? W / 2 * (0.78 + 0.34 * t * t + (t > 0 ? 0.06 * t : 0)) : W / 2 * 1.22; const r = W * 0.9, r2 = W * 0.45;
    if (x > L / 2 - r) w *= Math.sqrt(Math.max(0, 1 - Math.pow((x - (L / 2 - r)) / r, 2))); if (x < -L / 2 + r2) w *= Math.sqrt(Math.max(0, 1 - Math.pow((-L / 2 + r2 - x) / r2, 2))); return Math.max(0.004, w); };
  const bend = (x, camber) => { const tipL = L * 0.15, tailL = L * 0.06; let y = camber * Math.cos(Math.PI * x / L); if (x > L / 2 - tipL) { const k = (x - (L / 2 - tipL)) / tipL; y += k * k * L * 0.07; } if (x < -L / 2 + tailL) { const k = (-L / 2 + tailL - x) / tailL; y += k * k * L * 0.025; } return y; };
  return { hw, bend };
}
function segGeo(L, W, shaped, camber, x0, x1, thick, yOff) {
  const { hw, bend } = skiProfile(L, W, shaped), N = 12, pts = [];
  for (let i = 0; i <= N; i++) { const x = x0 + (x1 - x0) * i / N; pts.push(new THREE.Vector2(x, hw(x))); }
  for (let i = N; i >= 0; i--) { const x = x0 + (x1 - x0) * i / N; pts.push(new THREE.Vector2(x, -hw(x))); }
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: thick, bevelEnabled: false }); g.rotateX(-Math.PI / 2); g.translate(0, yOff, 0);
  const p = g.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + bend(p.getX(i), camber)); g.computeVertexNormals(); return g;
}

// ---------------- the stand-alone game ----------------
export async function createSkiWorks({ container, onState = () => {}, onExit = null, startIn = 'intro' }) {
  const ST = createStage(container, { bg: '#cfe3f0' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS, sun } = ST;
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#8fbfe6'); gr.addColorStop(0.6, '#d8e9f5'); gr.addColorStop(1, '#f2f7fb'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); }); scene.fog = new THREE.Fog('#e6f0f7', 30, 70);
  const SND = skiAudio(audio), fx = (n, o) => SND.sfx(n, o), aInit = () => { audio.init && audio.init(); SND.init(); };
  const buzz = ms => { try { if (ST.touch && SND.level !== 'off' && navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  Object.assign(sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10 }); sun.shadow.camera.updateProjectionMatrix(); sun.position.set(3, 10, 6);
  const warm = new THREE.PointLight(0xffc27a, 1.2, 9, 1.6); warm.position.set(-6.3, 1.4, 5.4); scene.add(warm);
  const Y = buildWorks({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline });
  const flakes = []; { const fm = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false }); for (let i = 0; i < 70; i++) { const s = new THREE.Sprite(fm); s.scale.setScalar(rr(0.08, 0.16)); s.position.set(rr(-20, 20), rr(0, 9), rr(7.6, 20)); scene.add(s); flakes.push(s); } }
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const look = (fur, furDark) => fur ? { ...CAST.player.look, fur, furDark } : CAST.player.look;
  const bram = strip(kit.makeFox({ ...CAST.player, look: look('#e8a355', '#b8762c'), torso: ['#4f9c84', '#2f6b58', '#17352c'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' }));
  const benWalk = strip(kit.makeFox({ ...CAST.player, gear: 'none' }));
  const ben = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#2f6b58', '#2f6b58', '#e6b45a'], crest: '', gear: 'none', mood: 'happy' })); const BP = ben.userData.P, WP = benWalk.userData.P;
  const custFox = CUSTOMERS.map(o => { const f = strip(kit.makeFox({ ...CAST.player, look: look(o.fur, o.furDark), torso: o.torso, outfit: o.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); if (o.kid) f.scale.setScalar(0.72); f.visible = false; return f; });
  const perri = custFox[1], nix = custFox[0];
  { const bm = new THREE.MeshBasicMaterial({ color: 0x2a1a10, transparent: true, opacity: 0.22, depthWrite: false }); for (const f of [bram, benWalk, ben, ...custFox]) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.42, 20), bm); b.rotation.x = -Math.PI / 2; b.position.y = 0.012; b.renderOrder = 1; f.add(b); } }
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 96); g.strokeStyle = '#e6b45a'; g.lineWidth = 14; g.lineCap = 'round'; for (const s of [-1, 1]) { g.save(); g.rotate(s * 0.45); g.beginPath(); g.moveTo(0, 62); g.lineTo(0, -54); g.quadraticCurveTo(0, -70, s * -14, -74); g.stroke(); g.restore(); } g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(0, 4, 14, 0, 7); g.fill(); g.restore();
      g.save(); g.translate(128, 200); g.rotate(-0.04); g.fillStyle = '#e6b45a'; g.fillRect(-124, -24, 248, 48); g.font = 'italic 900 30px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#17352c'; g.fillText("BRAM'S SKI WORKS", 0, 2); g.restore(); });
    const U = dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#e6b45a', towelCol: '#2f6b58' }), hat = U.hat, hs = BP.head.scale.x || 1;
    while (hat.children.length) hat.remove(hat.children[0]); hat.scale.setScalar(hs); hat.position.y -= 0.1 * hs;
    M(new THREE.SphereGeometry(0.31, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#2f6b58'), 0, 0, -0.04, hat, 0.012); M(new THREE.CylinderGeometry(0.315, 0.315, 0.09, 16), toon('#e6b45a'), 0, 0.02, -0.04, hat, 0.008); M(new THREE.SphereGeometry(0.09, 10, 8), toon('#f4ecd8'), 0, 0.33, -0.04, hat, 0.008, 0.09);
    return U.parts; })();
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  // demo skis Ben can click on in free walk (button 2)
  const trySkis = new THREE.Group(); { for (const sx of [-0.15, 0.15]) { const s = new THREE.Group(); s.position.x = sx; trySkis.add(s); const top = new THREE.Mesh(segGeo(1.5, 0.1, true, 0.01, -0.75, 0.75, 0.025, 0.005), toon('#ec3013')); top.rotation.y = -Math.PI / 2; addOutline(top, 0.01); s.add(top); } trySkis.position.y = 0.02; trySkis.visible = false; benWalk.add(trySkis); }

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), custN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, waxK: null, flash: null, flashT: 0, say: '', sayT: 0, hold: null, ptr: null, react: null, done: null, t: 0, phT: 0, confirm: 0,
    walk: { x: 0, z: 5.4, vx: 0, vz: 0, face: Math.PI, skis: false, wave: 0 }, stick: { x: 0, y: 0 }, prompt: null, toast: '', toastT: 0, dialog: null, shop: false, en: 100, cam: { yaw: 0, pitch: 0.66, dist: 7.4 } };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const toast = (s, t = 3.2) => { S.toast = s; S.toastT = t; };
  let J = null, P = null, cust = null, CU = null, lastCust = -1; const door = { open: 0 };
  const wp = o => o.getWorldPosition(new THREE.Vector3());
  function newJob() { const d = S.day; let ci; do { ci = Math.floor(Math.random() * CUSTOMERS.length); } while (ci === lastCust); if (S.forceCust != null) ci = S.forceCust; lastCust = ci; const C = CUSTOMERS[ci];
    const type = S.forceType || pick(C.types), extra = ['measure', 'paint', 'wax', 'shape', 'bind'], n = S.forceAll ? 5 : Math.min(5, d <= 1 ? 2 : d <= 2 ? 3 : d <= 3 ? 4 : 4 + (Math.random() < 0.5 ? 1 : 0)), tasks = ['press'];
    const pool = d <= 1 ? ['measure', 'paint', 'wax'] : extra; while (tasks.length < n + 1 && pool.some(q => !tasks.includes(q))) tasks.push(pick(pool.filter(q => !tasks.includes(q))));
    tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    const din = type === 'kids' ? pick([3, 4]) : type === 'racer' ? pick([8, 9, 10]) : type === 'powder' ? pick([6, 7, 8]) : pick([5, 6, 7]);
    return { ci, type, tasks, top: pick(Object.keys(TOPS)), wax: pick(Object.keys(WAXES)), design: C.kid ? 'FOX' : pick(DESIGNS), din, day: d, line: pick(C.kid ? HELLO_KID : HELLO), len: 0, measured: false, mq: 1 }; }
  // ---------- the pair ----------
  const designTex = k => canvasTex(256, 128, c => { c.clearRect(0, 0, 256, 128); c.fillStyle = '#fbf8ec'; c.strokeStyle = '#201e1d'; c.lineWidth = 6; c.lineJoin = 'round'; c.save(); c.translate(128, 64);
    if (k === 'STAR') { c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 22 : 52, a = i * Math.PI / 5 - Math.PI / 2; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.stroke(); c.fill(); }
    else if (k === 'PEAK') { c.beginPath(); c.moveTo(-90, 40); c.lineTo(-30, -40); c.lineTo(5, 5); c.lineTo(35, -25); c.lineTo(90, 40); c.closePath(); c.stroke(); c.fill(); }
    else if (k === 'FOX') { c.beginPath(); c.moveTo(-50, -45); c.lineTo(-20, -15); c.lineTo(20, -15); c.lineTo(50, -45); c.lineTo(45, 5); c.lineTo(0, 50); c.lineTo(-45, 5); c.closePath(); c.stroke(); c.fill(); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(-16, 4, 6, 0, 7); c.arc(16, 4, 6, 0, 7); c.fill(); c.beginPath(); c.arc(0, 32, 7, 0, 7); c.fill(); }
    else { c.font = '900 100px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.strokeText('8', 0, 6); c.fillText('8', 0, 6); } c.restore(); });
  function makePair(job) { const T = SKIS[job.type], g = new THREE.Group(); scene.add(g); g.visible = false;
    const Q = { g, W: T.W, L: 1.6, shaped: !job.tasks.includes('shape'), camber: 0.02, skis: [], tops: [], bases: [], decals: [], binds: [], topM: [], baseM: [], dots: [], job, pressed: false };
    for (let i = 0; i < 3; i++) { const m = new THREE.MeshToonMaterial({ color: job.tasks.includes('paint') ? '#e9e4d8' : TOPS[job.top].col, gradientMap: ST.grad }); m.userData = { cover: job.tasks.includes('paint') ? 0 : 1, col: job.tasks.includes('paint') ? null : job.top, from: m.color.clone() }; Q.topM.push(m); }
    for (let i = 0; i < 3; i++) { const m = new THREE.MeshToonMaterial({ color: job.tasks.includes('wax') ? '#4a4846' : WAXES[job.wax].col, gradientMap: ST.grad }); m.userData = { cover: job.tasks.includes('wax') ? 0 : 1, col: job.tasks.includes('wax') ? null : job.wax, from: m.color.clone() }; Q.baseM.push(m); }
    Q.dTex = designTex(job.design); return Q; }
  function buildPair(Q) { const { L, W } = Q; Q.skis.forEach(s => { Q.g.remove(s); s.traverse(o => o.geometry && o.geometry.dispose()); }); Q.skis = []; Q.tops = []; Q.bases = []; Q.decals = []; Q.binds = [];
    const xs = [-L / 2, -L / 6, L / 6, L / 2], { bend } = skiProfile(L, W, Q.shaped);
    for (const sz of [-1, 1]) { const s = new THREE.Group(); s.position.z = sz * (W * 0.75 + 0.06); Q.g.add(s); Q.skis.push(s);
      for (let i = 0; i < 3; i++) { const top = new THREE.Mesh(segGeo(L, W, Q.shaped, Q.camber, xs[i], xs[i + 1], 0.024, 0.009), Q.topM[i]); top.castShadow = true; addOutline(top, 0.008); top.userData.i = i; s.add(top); Q.tops.push(top);
        const base = new THREE.Mesh(segGeo(L, W, Q.shaped, Q.camber, xs[i], xs[i + 1], 0.01, 0), Q.baseM[i]); base.userData.i = i; s.add(base); Q.bases.push(base); }
      const dc = new THREE.Mesh(new THREE.PlaneGeometry(W * 1.7, W * 0.85), new THREE.MeshBasicMaterial({ map: Q.dTex, transparent: true, depthWrite: false, opacity: Q.decalOn ? 1 : 0 })); dc.rotation.set(-Math.PI / 2, 0, Math.PI / 2); dc.position.set(0.02, 0.036 + bend(0.02, Q.camber), 0); dc.renderOrder = 5; s.add(dc); Q.decals.push(dc);
      const bg = new THREE.Group(); bg.visible = !!Q.bound; s.add(bg); const by = 0.034 + Q.camber; M(new THREE.BoxGeometry(0.16, 0.07, W * 0.95), toon('#3a3836'), 0.14, by + 0.035, 0, bg, 0.006); M(new THREE.BoxGeometry(0.06, 0.03, W * 0.8), toon('#ec3013'), 0.2, by + 0.08, 0, bg, 0.004); M(new THREE.BoxGeometry(0.2, 0.09, W * 0.95), toon('#3a3836'), -0.22, by + 0.045, 0, bg, 0.006); M(new THREE.BoxGeometry(0.08, 0.04, W * 0.8), toon('#e6b45a'), -0.3, by + 0.1, 0, bg, 0.004); Q.binds.push(bg); } }
  const pairAt = key => { const s = Y.st[key]; return key === 'wax' ? { x: s.x, y: s.y, z: s.z, flip: true } : key === 'cust' ? null : { x: s.x, y: s.y, z: s.z, flip: false }; };
  function movePair(key, instant) { if (!P) return; const to = pairAt(key); if (!to) return; if (P.at === key && !instant) return; P.at = key; if (instant) { P.g.position.set(to.x, to.y, to.z); P.g.rotation.set(to.flip ? Math.PI : 0, 0, 0); P.mv = null; return; } P.mv = { from: P.g.position.clone(), to: V3(to.x, to.y, to.z), r0: P.g.rotation.x, r1: to.flip ? Math.PI : 0, t: 0 }; fx('swish'); }
  // ---------- task progress ----------
  function info(id) { if (!J) return { done: false, q: 0, prog: 0, txt: '' };
    if (id === 'measure') return { done: J.measured, q: J.mq, prog: J.measured ? 1 : 0, txt: J.measured ? J.len + ' cm' : 'TO DO' };
    if (id === 'press') return { done: !!P && P.pressed, q: P ? P.pq || 1 : 0, prog: P && P.pressed ? 1 : (S.layers || 0) / 5, txt: P && P.pressed ? 'DONE' : S.layers >= 4 ? 'HOLD' : (S.layers || 0) + ' / 4' };
    if (id === 'shape') { const d = P && P.shaped; return { done: !!d, q: P ? P.sq || 1 : 0, prog: d ? 1 : P && P.trace ? P.trace.k / P.trace.n : 0, txt: d ? 'DONE' : P && P.trace ? Math.round(P.trace.k / P.trace.n * 100) + '%' : 'TO DO' }; }
    if (id === 'paint') { if (!P) return { done: false, q: 0, prog: 0, txt: 'TO DO' }; const c = P.topM.filter(m => m.userData.cover >= 1).length, ok = P.topM.filter(m => m.userData.cover >= 1 && m.userData.col === J.top).length; return { done: c === 3, q: ok / 3, prog: c / 3, txt: c === 3 ? (ok === 3 ? 'DONE' : 'WRONG COLOUR') : c + ' / 3' }; }
    if (id === 'wax') { if (!P) return { done: false, q: 0, prog: 0, txt: 'TO DO' }; const c = P.baseM.filter(m => m.userData.cover >= 1).length, ok = P.baseM.filter(m => m.userData.cover >= 1 && m.userData.col === J.wax).length; return { done: c === 3, q: ok / 3, prog: c / 3 + P.baseM.reduce((a, m) => a + (m.userData.cover < 1 ? m.userData.cover : 0), 0) / 3, txt: c === 3 ? (ok === 3 ? 'DONE' : 'WRONG WAX') : c + ' / 3' }; }
    if (id === 'bind') { const d = !!P && !!P.bound; return { done: d, q: d ? Math.max(0.5, 1 - (P.dinWrong || 0) * 0.25) : 0, prog: d ? 1 : 0, txt: d ? 'DIN ' + J.din : 'DIN ' + Math.round(S.din) }; }
    return { done: true, q: 1 }; }
  const allDone = () => J && J.tasks.every(t => info(t).done);
  const nextTask = () => J && J.tasks.find(t => !info(t).done);
  const needsPress = t => t !== 'measure' && t !== 'press' && (!P || !P.pressed);
  function setTool(id) { if (S.phase !== 'work' || !J || !J.tasks.includes(id)) return; if (S.hold) return; S.tool = id; S.userToolT = performance.now(); S.ptr = null; benTo(id);
    if (needsPress(id)) flash(J.tasks.includes('measure') && !J.measured ? 'MEASURE, THEN PRESS, FIRST' : 'PRESS THE SKIS FIRST', '#e6b45a', 1.6); else if (id !== 'measure' && id !== 'press') movePair(id); if (id === 'bind') S.din = S.din || 1; if (id === 'shape' && P && P.pressed && !P.shaped && !P.trace) startTrace(); }
  function benTo(id) { const st = Y.st[id]; if (st && id !== 'bind') { const sd = id === 'press' ? 1 : CW() < CHh() ? -1 : 1; ben.position.set(st.x + sd * (id === 'press' ? 1.95 : 1.75), 0, st.z + 0.15); ben.rotation.y = -sd * Math.PI / 2; return; } const s = Y.benAt[id]; if (s) { ben.position.set(s.x, 0, s.z); ben.rotation.y = id === 'measure' ? 0.5 : 0; } }
  function checkDone() { if (!J) return; for (const t of J.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); fx('done'); buzz([18, 40, 18]); ben.userData.hop = 1;
        if (t === 'paint' && P) { P.decalOn = true; P.decals.forEach(d => d.userData.fade = 1); }
        const nx = nextTask(); if (!nx) say('BRAM: "Lovely pair. Hand them over to ' + CU.name + '."', 4); else { const was = S.tool; setTimeout(() => { if (S.phase === 'work' && S.tool === was && !S.ptr && !S.hold) setTool(nx); }, 1100); } } } }

  // ---------- actions ----------
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), _pl = new THREE.Plane(), _hit = V3();
  const castAt = (x, y) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); return ray; };
  const onPlane = (x, y, n, p) => { _pl.setFromNormalAndCoplanarPoint(n, p); return castAt(x, y).ray.intersectPlane(_pl, _hit) ? _hit.clone() : null; };
  // MEASURE
  const noseY = () => cust ? wp(cust.userData.P.head).y + 0.02 * cust.scale.y : 1.6;
  function measureMove(x, y) { const h = onPlane(x, y, V3(0, 0, 1), V3(0, 0, Y.pole.position.z)); if (!h) return; Y.marker.position.y = clamp(h.y, 0.3, 2.45); const cm = Math.round(Y.marker.position.y * 20); if (cm !== S.lastCm) { S.lastCm = cm; const p = 1 - Math.min(1, Math.abs(Y.marker.position.y - noseY()) / 0.7); fx('measure', { p }); if (p > 0.93) buzz(8); } }
  function measureRelease() { const d = Math.abs(Y.marker.position.y - noseY());
    if (d > MEAS_TOL * 3) { flash('MISSED · DRAG IT TO ' + CU.name + "'S NOSE", '#ec3013', 1.6); fx('bad'); buzz(60); return; }
    J.measured = true; J.mq = d <= MEAS_TOL ? 1 : 0.75; J.len = Math.round(Y.marker.position.y * 100); fx(d <= MEAS_TOL ? 'dialMatch' : 'click'); flash(d <= MEAS_TOL ? 'SPOT ON! · ' + J.len + ' cm' : 'CLOSE ENOUGH · ' + J.len + ' cm', d <= MEAS_TOL ? '#22c55e' : '#e6b45a', 1.5); Y.band.visible = false; checkDone(); }
  // PRESS
  const pressZone = () => upg('hydro') ? PRESS_ZH : PRESS_Z;
  function pickLayer(id) { if (S.phase !== 'work' || S.tool !== 'press' || !J || (P && P.pressed)) return; if (J.tasks.includes('measure') && !J.measured) { flash('MEASURE ' + CU.name + ' FIRST', '#e6b45a', 1.5); return; }
    const want = LAYERS[S.layers || 0]; if (!want) return; if (id !== want.id) { S.layerWrong = (S.layerWrong || 0) + 1; flash(want.label + ' GOES IN NEXT', '#ec3013', 1.4); fx('bad'); buzz(60); return; }
    const st = Y.st.press, L = J.len / 100 * 0.98, i = S.layers || 0, sl = M(new THREE.BoxGeometry(L, 0.016, 0.42), toon(want.col), st.x, 1.9, st.z, scene, 0.004); sl.userData.ty = st.y + 0.01 + i * 0.018; S.slabs.push(sl); S.layers = i + 1; setTimeout(() => fx('layer', { i }), 180); buzz(12);
    if (S.layers >= 4) flash('STACKED · HOLD ANYWHERE TO PRESS', '#ffffff', 1.6); }
  function startPress() { S.hold = { kind: 'press', v: 0, inG: false }; fx('pressDown'); buzz(15); }
  function releasePress() { const H = S.hold; S.hold = null; if (!H) return; const v = H.v, [a, b] = pressZone();
    if (v < 0.32) { flash('TOO SOFT · HOLD LONGER', '#ffffff', 1.2); fx('hiss'); return; }
    const q = v >= a && v <= b ? 1 : v < 1 ? 0.75 : 0.5; P.pq = Math.max(0.5, q - (S.layerWrong || 0) * 0.1); P.camber = v < a ? 0.006 : v <= b ? 0.02 : v < 1 ? 0.035 : 0.06; P.pressed = true; P.L = J.len / 100 * 0.98; buildPair(P); movePair('press', true); P.g.visible = true;
    S.slabs.forEach(s => scene.remove(s)); S.slabs = []; for (let i = 0; i < 8; i++) puff(Y.st.press.x + rr(-1, 1), 1.1, Y.st.press.z + rr(-0.3, 0.3), 0xf2e6c8, 1);
    flash(q === 1 ? 'PERFECT CAMBER!' : v < a ? 'A BIT FLAT' : v < 1 ? 'A BIT STIFF' : 'OVERPRESSED · BANANA SKIS', q === 1 ? '#22c55e' : q > 0.6 ? '#e6b45a' : '#ec3013', 1.4); fx('pressPop', { good: q === 1 }); buzz(q === 1 ? [30, 30, 30] : 50); checkDone(); }
  // SHAPE: trace the dotted line
  function startTrace() { const s = P.skis[1], { hw, bend } = skiProfile(P.L, P.W, true), n = 14, pts = []; for (let i = 0; i < n; i++) { const x = -P.L / 2 + 0.06 + (P.L - 0.2) * i / (n - 1); pts.push(V3(x, 0.04 + bend(x, P.camber), -hw(x))); }
    P.dots.forEach(d => d.parent && d.parent.remove(d)); P.dots = pts.map(p => { const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, depthTest: false, transparent: true })); d.renderOrder = 30; d.position.copy(p); d.scale.setScalar(0.07); s.add(d); return d; }); P.trace = { k: 0, n, err: 0, cnt: 0 }; }
  const traceR = () => 34 * scale() * (upg('guide') ? 1.8 : 1);
  function traceMove(x, y) { const T = P.trace; if (!T || T.k >= T.n) return; const R = traceR(); let best = -1;
    for (let j = T.k; j < Math.min(T.n, T.k + 3); j++) { const s = scr(wp(P.dots[j])); if (Math.hypot(s.x - x, s.y - y) < R) best = j; }
    const cur = scr(wp(P.dots[Math.min(T.k, T.n - 1)])), prv = scr(wp(P.dots[Math.max(0, T.k - 1)])), dl = segDist(x, y, prv, cur); T.err += Math.min(dl, R * 2); T.cnt++;
    Y.router.position.copy(Y.root.worldToLocal(onPlane(x, y, V3(0, 1, 0), V3(0, 1.0, 0)) || wp(P.dots[T.k])).setY(0.98));
    if (Math.random() < 0.4) puff(Y.router.position.x, 1.0, Y.router.position.z, 0xe8d3a8, 1); 
    if (best >= 0) { for (let j = T.k; j <= best; j++) P.dots[j].material.color.set(0x22c55e); T.k = best + 1; fx('chip'); }
    else if (dl > R * 2.6 && performance.now() - (S.warnT || 0) > 1200) { S.warnT = performance.now(); flash('STAY ON THE LINE', '#ec3013', 1); S.ptr && (S.ptr.kind = null); }
    if (T.k >= T.n) finishTrace(); }
  const segDist = (x, y, a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy || 1, t = clamp(((x - a.x) * dx + (y - a.y) * dy) / l, 0, 1); return Math.hypot(x - a.x - dx * t, y - a.y - dy * t); };
  function finishTrace() { const T = P.trace, avg = T.cnt ? T.err / T.cnt : 0, R = traceR(); P.sq = clamp(1.15 - avg / R * 0.7, 0.5, 1); if (P.sq > 0.95) P.sq = 1; P.shaped = true; P.dots = []; P.trace = null; buildPair(P); movePair('shape', true); Y.router.position.copy(Y.routerHome); S.ptr = null;
    for (let i = 0; i < 10; i++) puff(Y.st.shape.x + rr(-0.8, 0.8), 1.05, Y.st.shape.z + rr(-0.3, 0.3), 0xe8d3a8, 1); flash(P.sq >= 1 ? 'CLEAN CUT! THE JIG COPIES IT TO EVERY EDGE' : P.sq > 0.7 ? 'A BIT WOBBLY · STILL GOOD' : 'ROUGH CUT', P.sq >= 1 ? '#22c55e' : P.sq > 0.7 ? '#e6b45a' : '#ec3013', 1.8); checkDone(); }
  // PAINT
  function paintMove(x, y, d) { const hit = castAt(x, y).intersectObjects(P.tops, false)[0]; Y.roller.visible = true; const h = onPlane(x, y, V3(0, 1, 0), V3(0, 1.0, 0)); if (h) Y.roller.position.copy(Y.root.worldToLocal(h)).setY(0.99); Y.rollerCyl.rotation.y += d * 0.02; if (!hit) return; paintOn(hit.object.material, d, hit.point); }
  function paintOn(m, d, point) { const U = m.userData; if (U.col !== S.brush) { U.col = S.brush; U.from = m.color.clone(); U.cover = 0; } if (U.cover >= 1) return; U.cover = Math.min(1, U.cover + d / (upg('roller') ? 150 : 280)); m.color.copy(U.from).lerp(new THREE.Color(TOPS[S.brush].col), U.cover); S.rollT = 0.18;
    if (U.cover >= 1) { m.color.set(TOPS[S.brush].col); point && puff(point.x, point.y + 0.05, point.z, 0xffffff, 2); fx('sparkle'); buzz(10); checkDone(); } }
  function setBrush(k) { if (!TOPS[k] || !J) return; S.brush = k; fx('click'); fx('paintDab'); flash('COLOUR · ' + TOPS[k].name + (k === J.top ? '' : ' · CARD SAYS ' + TOPS[J.top].name), k === J.top ? '#22c55e' : '#e6b45a', 1.3); }
  // WAX: rub in circles
  function setWax(k) { if (!WAXES[k] || !J) return; S.waxK = k; fx('click');  flash(WAXES[k].name + ' WAX' + (k === J.wax ? '' : ' · CARD SAYS ' + WAXES[J.wax].name), k === J.wax ? '#22c55e' : '#e6b45a', 1.3); }
  function waxMove(x, y) { const Pt = S.ptr, h = onPlane(x, y, V3(0, 1, 0), V3(0, Y.st.wax.y, 0)); if (h) Y.iron.position.copy(Y.root.worldToLocal(h)).setY(Y.st.wax.y + 0.05);
    const dx = x - Pt.x, dy = y - Pt.y; if (Math.hypot(dx, dy) < 5) return false; const a = Math.atan2(dy, dx); let turn = 0; if (Pt.a != null) { let da = a - Pt.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; if (Math.abs(da) < 1.3) turn = Math.abs(da); } Pt.a = a;
    const hit = castAt(x, y).intersectObjects(P.bases, false)[0]; if (hit && turn > 0) waxOn(hit.object.material, turn, hit.point); return true; }
  function waxOn(m, turn, point) { const U = m.userData; if (U.col !== S.waxK) { U.col = S.waxK; U.from = m.color.clone(); U.cover = 0; } if (U.cover >= 1) return; U.cover = Math.min(1, U.cover + turn / (Math.PI * 2 * (upg('iron') ? 0.8 : 1.6))); m.color.copy(U.from).lerp(new THREE.Color(WAXES[S.waxK].col), U.cover);
    if (Math.random() < 0.15) { point && puff(point.x, point.y + 0.04, point.z, 0xffffff, 1); } S.waxT = 0.18;
    if (U.cover >= 1) { m.color.set(WAXES[S.waxK].col); fx('sparkle'); buzz(10); flash('WAXED · NEXT SECTION', '#22c55e', 0.8); checkDone(); } }
  // BIND: twist the dial
  function drawDial() { const c = Y.dialCv.getContext('2d'), v = S.din || 1; c.clearRect(0, 0, 256, 256); c.fillStyle = '#000'; c.beginPath(); c.arc(128, 128, 122, 0, 7); c.fill(); c.strokeStyle = '#ffd23a'; c.lineWidth = 6; c.stroke();
    for (let i = 1; i <= 12; i++) { const a = (i - 1) * Math.PI / 6 - Math.PI / 2; c.strokeStyle = Math.round(v) === i ? '#ffd23a' : '#8a847e'; c.lineWidth = Math.round(v) === i ? 8 : 4; c.beginPath(); c.moveTo(128 + Math.cos(a) * 92, 128 + Math.sin(a) * 92); c.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112); c.stroke(); }
    const a = (v - 1) * Math.PI / 6 - Math.PI / 2; c.strokeStyle = '#ec3013'; c.lineWidth = 10; c.lineCap = 'round'; c.beginPath(); c.moveTo(128, 128); c.lineTo(128 + Math.cos(a) * 84, 128 + Math.sin(a) * 84); c.stroke();
    c.fillStyle = '#fff'; c.font = '900 64px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(Math.round(v)), 128, 132); c.fillStyle = '#ffd23a'; c.font = '800 20px Archivo, Arial'; c.fillText('DIN', 128, 182); Y.dialTex.needsUpdate = true; S.dialDrawn = Math.round(v * 20); }
  function dialMove(x, y) { const c = scr(wp(Y.dial)), a = Math.atan2(y - c.y, x - c.x), Pt = S.ptr; if (Math.hypot(x - c.x, y - c.y) < 12) return; if (Pt.a != null) { let da = a - Pt.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI; const before = Math.round(S.din); S.din = clamp(S.din + da / (Math.PI / 6), 1, 12); if (Math.round(S.din) !== before) dinFeedback(); } Pt.a = a; }
  function dinStep(n) { if (S.phase !== 'work' || S.tool !== 'bind') return; S.din = clamp(Math.round(S.din || 1) + n, 1, 12); dinFeedback(); }
  function dinFeedback() { const n = Math.round(S.din); fx('dialTick', { n }); buzz(6); if (J && n === J.din) { fx('dialMatch'); buzz([10, 30, 10]); } }
  function lockDin() { if (S.phase !== 'work' || S.tool !== 'bind' || !P || !P.pressed || P.bound) return; const v = Math.round(S.din); S.din = v;
    if (v !== J.din) { P.dinWrong = (P.dinWrong || 0) + 1; flash('DIN ' + v + ' IS WRONG · CARD SAYS ' + J.din, '#ec3013', 1.6); fx('bad'); buzz(60); return; }
    P.bound = true; P.binds.forEach(b => { b.visible = true; b.userData.drop = 1; }); fx('lock'); buzz([25, 30, 25]); for (let i = 0; i < 6; i++) puff(P.g.position.x + rr(-0.3, 0.3), P.g.position.y + 0.2, P.g.position.z, 0xffe7a0, 1); checkDone(); }

  // ---------- input (work) ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function onDown(e) { aInit(); S.lastInput = performance.now(); if (DM.on || S.phase !== 'work' || !J || S.hold) return; const { x, y } = local(e); e.preventDefault(); const T = S.tool; S.ptr = { x, y, kind: null };
    if (needsPress(T)) { flash(J.tasks.includes('measure') && !J.measured ? 'MEASURE, THEN PRESS, FIRST' : 'PRESS THE SKIS FIRST', '#e6b45a', 1.2); return; }
    if (T === 'measure') { if (J.measured) { flash('ALREADY MEASURED · ' + J.len + ' cm', '#ffffff', 1); return; } S.ptr.kind = 'measure'; measureMove(x, y); }
    else if (T === 'press') { if (J.tasks.includes('measure') && !J.measured) { flash('MEASURE ' + CU.name + ' FIRST', '#e6b45a', 1.4); return; } if (P.pressed) return; if ((S.layers || 0) < 4) { flash('STACK THE LAYERS BELOW, IN ORDER', '#ffffff', 1.2); return; } startPress(); }
    else if (T === 'shape') { if (P.shaped) return; if (!P.trace) startTrace(); const T0 = P.trace, s = scr(wp(P.dots[T0.k])); if (Math.hypot(s.x - x, s.y - y) > traceR() * 1.6) { flash(T0.k ? 'PICK UP WHERE THE LINE TURNS GREEN' : 'START AT THE TAIL: THE FIRST DOT', '#ffffff', 1.3); return; } S.ptr.kind = 'trace'; traceMove(x, y); }
    else if (T === 'paint') { if (!S.brush) { flash('PICK A COLOUR BELOW', '#ffffff', 1.2); return; } S.ptr.kind = 'paint'; paintMove(x, y, 20); }
    else if (T === 'wax') { if (!S.waxK) { flash('PICK A WAX BELOW', '#ffffff', 1.2); return; } S.ptr.kind = 'wax'; S.ptr.a = null; }
    else if (T === 'bind') { if (P.bound) return; const c = scr(wp(Y.dial)); if (Math.hypot(c.x - x, c.y - y) > 170 * scale()) { flash('TWIST THE DIAL: DRAG ROUND IT IN A CIRCLE', '#ffffff', 1.4); return; } S.ptr.kind = 'dial'; S.ptr.a = Math.atan2(y - c.y, x - c.x); } }
  function onMove(e) { const Pt = S.ptr; if (!Pt || !Pt.kind || !J) return; const { x, y } = local(e), d = Math.hypot(x - Pt.x, y - Pt.y); if (d < 1) return;
    if (Pt.kind === 'measure') measureMove(x, y);
    else if (Pt.kind === 'trace') { const n = Math.ceil(d / 10); for (let i = 1; i <= n && S.ptr && S.ptr.kind; i++) traceMove(Pt.x + (x - Pt.x) * i / n, Pt.y + (y - Pt.y) * i / n); }
    else if (Pt.kind === 'paint') paintMove(x, y, d);
    else if (Pt.kind === 'wax') { if (!waxMove(x, y)) return; }
    else if (Pt.kind === 'dial') dialMove(x, y);
    Pt.x = x; Pt.y = y; }
  function onUp() { if (S.hold && S.hold.kind === 'press') releasePress(); if (S.ptr && S.ptr.kind === 'measure') measureRelease(); S.ptr = null; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- flow ----------
  function showLocals(on) { bram.visible = true; perri.visible = nix.visible = on; if (on) { place(perri, Y.spots.perri, -Math.PI / 2); place(nix, Y.spots.nix, -0.6); } }
  function toIntro() { S.phase = 'intro'; S.done = null; S.dialog = null; S.shop = false; S.prompt = null; custFox.forEach(f => f.visible = false); if (P) { scene.remove(P.g); P = null; } J = null; showLocals(true); setUniform(true); ben.visible = true; benWalk.visible = false; place(ben, Y.spots.introBen, 0.2); place(bram, Y.spots.introBram, -0.25); }
  function toWalk() { if (DM.on) return; aInit(); S.phase = 'walk'; S.done = null; S.dialog = null; S.shop = false; if (P) { scene.remove(P.g); P = null; } J = null; custFox.forEach(f => f.visible = false); showLocals(true); ben.visible = false; benWalk.visible = true;
    Object.assign(S.walk, { x: Y.spots.inside.x, z: Y.spots.inside.z, vx: 0, vz: 0, face: Math.PI }); place(bram, Y.spots.bramCounter, 0); S.cam.yaw = 0; toast("BRAM'S SKI WORKS · walk round, talk to Bram to start a shift", 3.5); }
  function startDay() { if (!['intro', 'done', 'walk'].includes(S.phase)) return; aInit(); Object.assign(S, { custN: 0, earned: 0, tips: 0, starList: [], done: null, react: null, dialog: null, shop: false, prompt: null }); setUniform(!!save.flag('skiUniform')); benWalk.visible = false; ben.visible = true; trySkis.visible = S.walk.skis = false;
    perri.visible = nix.visible = false; place(bram, Y.spots.bramWork, 0.9); say('BRAM: "Customer coming in. The job card says what they want. Take your time and do it right."', 5); nextCustomer(); }
  function nextCustomer() { if (P) { scene.remove(P.g); P = null; } J = newJob(); CU = CUSTOMERS[J.ci]; cust = custFox[J.ci]; custFox.forEach(f => f.visible = f === cust); cust.userData.mood = 'happy'; cust.position.set(Y.spots.door.x, 0, Y.spots.door.z); cust.rotation.y = Math.PI;
    if (!J.tasks.includes('measure')) { J.len = Math.round(noseYFor(cust) * 100); J.measured = true; J.mq = 1; }
    P = makePair(J); if (!J.tasks.includes('press')) J.tasks.unshift('press'); Object.assign(S, { phase: 'arrive', phT: 0, tool: null, brush: null, waxK: null, confirm: 0, doneSeen: {}, layers: 0, layerWrong: 0, slabs: S.slabs || [], din: 1, hold: null, ptr: null }); Y.marker.position.y = 0.9; ben.position.set(Y.spots.benMeasure.x, 0, Y.spots.benMeasure.z); ben.rotation.y = 0.5; door.open = 1.6; fx('door'); }
  function noseYFor(f) { f.updateMatrixWorld(true); return wp(f.userData.P.head).y + 0.02 * f.scale.y; }
  function handBack() { if (S.phase !== 'work' || !J) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND OVER AGAIN TO SEND THEM OFF', '#e6b45a', 2.2); return; } finishJob(); }
  const REACT = { stoked: { word: 'STOKED!', col: '#22c55e', mood: 'excited', lines: ['These are the best skis on the whole mountain!', 'I could sleep in them. I might.', 'Wait till Perri sees these!'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Lovely work, thank you!', 'They feel just right.', 'First chair tomorrow, then.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['They will do. Not quite what I asked for.', 'Hmm. A few things are off.', 'Bram usually does it better.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half the job is not done!', 'I am not skiing on these.', 'Did anyone check the card?'] } };
  function finishJob() { const T = J.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'stoked' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const pay = SKIS[J.type].price + T.filter(t => info(t).done).length * 3, tip = Math.round((level === 'stoked' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('radio') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; cust.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: CU.name, stars, tip, pay, t: 0 };
    if (P && !P.pressed) { P.pressed = true; P.L = J.len / 100 * 0.98; buildPair(P); } if (P) { P.g.visible = true; P.bound = true; P.binds.forEach(b => b.visible = true); P.mv = null; }
    S.phase = 'react'; S.phT = 0; S.hold = null; S.ptr = null; S.tool = null; Y.dial.visible = false; Y.band.visible = false; ben.position.set(Y.spots.benMeasure.x - 0.2, 0, Y.spots.benMeasure.z + 0.2); ben.rotation.y = 0.9; place(cust, Y.spots.cust, -0.4);
    if (level === 'grumpy') fx('grumpy'); else { fx('kaching'); for (let i = 0; i < stars; i++) fx('star', { i, t: 0.45 + i * 0.16 }); } buzz(level === 'grumpy' ? 80 : [20, 40, 20, 40, 40]); if (stars === 3) { for (let i = 0; i < 10; i++) puff(cust.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), cust.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; if (P) { scene.remove(P.g); P = null; } J = null; custFox.forEach(f => f.visible = false); showLocals(true); ben.visible = true; place(ben, Y.spots.introBen, 0.2); place(bram, Y.spots.introBram, -0.25);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('skiUniform')) { save.setFlag('skiUniform'); setUniform(true); unlock.push('SKI WORKS UNIFORM (beanie, scarf + tee)'); } if (eod) { save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); if (!save.flag('skiOwnPair')) { save.setFlag('skiOwnPair'); save.give('skisBram', 1); unlock.push("BRAM'S CUSTOM SKIS · in your bag"); } } } catch (e) {}
    fx(eod ? 'fanfare' : 'done'); buzz(eod ? [40, 60, 40, 60, 80] : 30);
    S.done = { day: S.day, made: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    say(eod ? 'BRAM: "Employee of the day! I would ski on those myself. I will not. But I would."' : avg >= 2 ? 'BRAM: "Good day. Cocoa is on the stove."' : 'BRAM: "Rough one. Read the card, take your time."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); fx('kaching'); return true; }
  function buyItem(id) { const it = SHOP.find(q => q.id === id); if (!it) return false; if (!save.spend(it.price)) { toast('Not enough gold for the ' + it.name.toLowerCase() + '.', 2.2); fx('bad'); return false; } save.give(id, 1); toast(it.name + ' · in your bag', 2.2); fx('kaching'); return true; }

  // ---------- FREE WALK: talk, shop, cocoa, wave, try skis, hop ----------
  const NPC = {
    bram: { f: bram, name: 'BRAM', role: 'SKI WORKS', greet: 'Boards on the rack, not in the snow. And do not go up without telling somebody.', work: true,
      lines: [['People still ski with all this going on?', 'Every day. I have stopped being surprised. I put a shovel by the door and I keep the fire going.'], ['You make skis but you never ski?', 'Never. Somebody has to stay in, keep the press warm and the cocoa on. That somebody is me.'], ['Have you been up to the grotto lately?', 'Not in a year. Wren and Barrow are still down there, mind. Two of them, that age, in the dark, with those things.'], ['Are they alright?', 'They were always odd. Odd is fine. But odd and forgetting is different, and somebody ought to go and see. I keep meaning to. I keep not going.']] },
    perri: { f: perri, name: 'PERRI', role: 'SKI LODGE', greet: 'Knees soft, look where you want to go. And where you want to go is not at the ones with the arms.',
      lines: [['Is the mountain safe?', 'No. Is that going to stop anybody? Also no. I have a class of six at ten and all six will be here.'], ['Which ones are dangerous?', 'The still ones throw. The ones that come at you have icicles for arms. Learn the difference from far away, not near.'], ['Why is this happening?', 'Ask the church. Ask the sky. I teach snowplough turns.'], ['There is a fort out west.', 'There is. The rope goes all the way in, which I find the most upsetting part. Somebody roped it. Something roped it.']] },
    nix: { f: nix, name: 'NIX', role: 'SKI LODGE', greet: 'Bar comes down, tips come up. And if you see one on the piste, ski round it, not past it.',
      lines: [['There are snowmen out there.', 'There are. Nobody built them. They were not there at last light and they are there now, and that has been the arrangement for three weeks.'], ['And you still run the lift?', 'Something odd is going on out in the galaxy, friend. Something odd is always going on out in the galaxy. The chair runs at eight.'], ['That is not reassuring.', 'It is not meant to be reassuring. It is meant to be open.'], ['What is down the west trench?', 'A fort. Walls, towers, flags, the lot. Went up in a fortnight and none of us saw a soul do it.'], ['Has anyone been in?', 'Two went to look. Both came back. Neither has said much since, except that the one on the throne is wearing a crown.']] } };
  const TARGETS = () => [
    { id: 'bram', x: bram.position.x, z: bram.position.z + 1.9, r: 1.5, label: 'Talk to Bram' }, { id: 'bram', x: bram.position.x, z: bram.position.z, r: 1.4, label: 'Talk to Bram' },
    { id: 'shop', x: 6.1, z: 2.0, r: 1.15, label: 'Ski shop · skis + gear' },
    { id: 'perri', x: perri.position.x, z: perri.position.z, r: 1.5, label: 'Talk to Perri' }, { id: 'nix', x: nix.position.x, z: nix.position.z, r: 1.4, label: 'Talk to Nix' },
    { id: 'cocoa', x: -6.6, z: 4.8, r: 1.0, label: "Drink Bram's cocoa" }, { id: 'rack', x: -6.9, z: 0.0, r: 1.2, label: 'Look at the ski rack' },
    { id: 'press', x: -5.4, z: -4.0, r: 1.3, label: 'Look at the ski press' }, { id: 'door', x: 0, z: 6.8, r: 0.9, label: 'Out to the Ski Lodge' }];
  function nearest() { const w = S.walk; let best = null, bd = 9; for (const t of TARGETS()) { const d = Math.hypot(t.x - w.x, t.z - w.z); if (d < t.r && d < bd) { bd = d; best = t; } } return best; }
  function openTalk(id) { const N = NPC[id]; N.f.userData.talking = true; S.dialog = { id, mode: 'menu', text: N.greet, asked: S.dialog && S.dialog.id === id ? S.dialog.asked : new Set() }; const w = S.walk; N.f.rotation.y = Math.atan2(w.x - N.f.position.x, w.z - N.f.position.z); fx('talk'); }
  function talk() { if (S.phase !== 'walk') return; if (S.dialog) { if (S.dialog.mode === 'answer') { S.dialog.mode = 'menu'; S.dialog.text = 'Anything else?'; } return; } const t = nearest(); if (!t) return;
    if (NPC[t.id]) return openTalk(t.id);
    if (t.id === 'shop') { S.shop = true; fx('bell'); return; }
    if (t.id === 'cocoa') { S.en = 100; toast("Bram's cocoa. Hot, sweet, a bit too much cinnamon. Energy full.", 3); for (let i = 0; i < 6; i++) puff(Y.steam.x + rr(-0.1, 0.1), Y.steam.y, Y.steam.z, 0xffffff, 1); fx('sip'); return; }
    if (t.id === 'rack') { toast('Display pairs, every colour Bram has. Press 2 to click a pair on and glide round the shop.', 3.5); return; }
    if (t.id === 'press') { toast('The ski press. Layers go in, the platen comes down, skis come out with a bit of bend in them.', 3.5); return; }
    if (t.id === 'door') { if (onExit) onExit(); else toast('Out to the Ski Lodge plaza. This room drops into the home world when that map is built.', 3.5); } }
  function choices() { const D = S.dialog, N = NPC[D.id]; const L = N.lines.map(([q], i) => ({ text: q, asked: D.asked.has(i), i })); return [...(N.work ? [{ text: 'Put me to work.', act: 'work' }, { text: 'What do you sell?', act: 'shop' }] : []), ...L, { text: 'Bye.', bye: true, act: 'bye' }]; }
  function choose(i) { const D = S.dialog; if (!D || D.mode !== 'menu') return; const c = choices()[i]; if (!c) return; const N = NPC[D.id];
    if (c.act === 'bye') return closeDialog(); if (c.act === 'work') { closeDialog(); toIntro(); return; } if (c.act === 'shop') { closeDialog(); S.shop = true; return; }
    D.asked.add(c.i); D.mode = 'answer'; D.text = N.lines[c.i][1]; fx('talk'); }
  function closeDialog() { if (S.dialog) { NPC[S.dialog.id].f.userData.talking = false; S.dialog = null; } }
  function wave() { if (S.phase !== 'walk' || S.dialog) return; S.walk.wave = 1.6; const w = S.walk; for (const k of ['bram', 'perri', 'nix']) { const f = NPC[k].f; if (Math.hypot(f.position.x - w.x, f.position.z - w.z) < 4.5) { f.userData.waveT = 1.4; f.rotation.y = Math.atan2(w.x - f.position.x, w.z - f.position.z); toast(NPC[k].name + ' waves back.', 1.6); } } fx('whistle'); }
  function toggleSkis() { if (S.phase !== 'walk' || S.dialog) return; S.walk.skis = !S.walk.skis; trySkis.visible = S.walk.skis; toast(S.walk.skis ? 'Display skis on. Glide! Press 2 again to take them off.' : 'Skis back on the rack.', 2); fx(S.walk.skis ? 'lock' : 'thud'); }
  function hop() { if (S.phase !== 'walk' || S.dialog) return; benWalk.userData.hop = 1; fx('boing'); setTimeout(() => fx('land'), 380); }
  const keys = new Set();
  const onKD = e => { if (S.phase === 'work' && J && !DM.on) { const i = /^Digit([1-7])$/.exec(e.code); if (i) { const k = +i[1] - 1; if (k < J.tasks.length) setTool(J.tasks[k]); else handBack(); e.preventDefault(); return; } if (e.code === 'Enter') { handBack(); return; } if (S.tool === 'bind' && (e.code === 'ArrowRight' || e.code === 'ArrowUp' || e.code === 'BracketRight')) { dinStep(1); e.preventDefault(); return; } if (S.tool === 'bind' && (e.code === 'ArrowLeft' || e.code === 'ArrowDown' || e.code === 'BracketLeft')) { dinStep(-1); e.preventDefault(); return; } if (S.tool === 'bind' && e.code === 'KeyL') { lockDin(); return; } return; }
    if (S.phase !== 'walk' || S.shop) return; if (e.code === 'KeyE') { e.preventDefault(); S.dialog ? (S.dialog.mode === 'answer' ? talk() : null) : talk(); return; } if (S.dialog && /^Digit[1-9]$/.test(e.code)) { choose(+e.code.slice(5) - 1); return; } if (e.repeat) { keys.add(e.code); return; } if (e.code === 'Digit1') wave(); else if (e.code === 'Digit2') toggleSkis(); else if (e.code === 'Space') { e.preventDefault(); hop(); } keys.add(e.code); };
  const onKU = e => keys.delete(e.code), onBlur = () => keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  function collide(w) { const r = 0.34; w.x = clamp(w.x, -7.6, 7.6); const inDoor = Math.abs(w.x) < 0.8; w.z = clamp(w.z, -6.6, inDoor ? 7.3 : 6.6);
    for (const [x0, x1, z0, z1] of Y.obst) { if (w.x > x0 - r && w.x < x1 + r && w.z > z0 - r && w.z < z1 + r) { const dl = w.x - (x0 - r), dr = x1 + r - w.x, dn = w.z - (z0 - r), df = z1 + r - w.z, m = Math.min(dl, dr, dn, df); if (m === dl) { w.x = x0 - r; w.vx = -Math.abs(w.vx) * 0.4; } else if (m === dr) { w.x = x1 + r; w.vx = Math.abs(w.vx) * 0.4; } else if (m === dn) { w.z = z0 - r; w.vz = -Math.abs(w.vz) * 0.4; } else { w.z = z1 + r; w.vz = Math.abs(w.vz) * 0.4; } } }
    for (const f of [bram, perri, nix]) { if (!f.visible) continue; const dx = w.x - f.position.x, dz = w.z - f.position.z, d = Math.hypot(dx, dz); if (d < 0.7 && d > 0.001) { w.x = f.position.x + dx / d * 0.7; w.z = f.position.z + dz / d * 0.7; } } }
  function walkStep(dt) { const w = S.walk; let ix = S.stick.x, iy = S.stick.y; if (keys.has('KeyW') || keys.has('ArrowUp')) iy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1; if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1;
    const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; } if (S.dialog || S.shop) ix = iy = 0;
    const cy = S.cam.yaw, fx = -Math.sin(cy), fz = -Math.cos(cy), rx = Math.cos(cy), rz = -Math.sin(cy), dx = fx * iy + rx * ix, dz = fz * iy + rz * ix;
    if (w.skis) { w.vx += dx * 7 * dt; w.vz += dz * 7 * dt; const k = Math.exp(-0.7 * dt); w.vx *= k; w.vz *= k; const sp = Math.hypot(w.vx, w.vz); if (sp > 5.5) { w.vx *= 5.5 / sp; w.vz *= 5.5 / sp; } }
    else { const sp = 3.4; w.vx = damp(w.vx, dx * sp, 12, dt); w.vz = damp(w.vz, dz * sp, 12, dt); }
    const ox = w.x, oz = w.z; w.x += w.vx * dt; w.z += w.vz * dt; collide(w); if (w.skis && Math.hypot(w.x - ox - w.vx * dt, w.z - oz - w.vz * dt) > 0.02 && Math.hypot(w.vx, w.vz) > 1.5 && performance.now() - (S.bumpT || 0) > 300) { S.bumpT = performance.now(); fx('bump'); buzz(30); }
    const sp = Math.hypot(w.vx, w.vz); if (sp > 0.3) { let a = Math.atan2(w.vx, w.vz) - w.face; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; w.face += a * Math.min(1, dt * 12); }
    if (w.z > 6.1 && Math.abs(w.x) < 1.3) door.open = 0.4;
    if (w.z > 7.2 && Math.abs(w.x) < 0.8 && !S.exitT) { S.exitT = 1; talk(); setTimeout(() => S.exitT = 0, 2500); w.z = 7.0; }
    benWalk.position.set(w.x, 0, w.z); benWalk.rotation.y = w.face; kit.animFox && kit.animFox(benWalk, dt, w.skis ? 0 : sp); if (w.skis) { WP.body.rotation.z = damp(WP.body.rotation.z, clamp(-ix * 0.25, -0.3, 0.3), 6, dt); WP.body.rotation.x = 0.12; if (sp > 1.5 && Math.random() < dt * 10) puff(w.x, 0.05, w.z, 0xffffff, 1); } else WP.body.rotation.z = damp(WP.body.rotation.z, 0, 8, dt);
    if (w.wave > 0) { w.wave -= dt; WP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(w.wave * 14) * 0.32); }
    const t = nearest(); S.prompt = S.dialog || S.shop ? null : t ? t.label : null;
    S.en = Math.min(100, S.en + dt * 0.5); }

  // ---------- camera ----------
  const { SAFE, shotFor } = cameraFit(ST), CAM = { look: V3(0, 1.2, 0) };
  camera.position.set(0, 3, 9); camera.lookAt(CAM.look);
  const flatYaw = () => CW() < CHh() ? Math.PI / 2 : Math.PI;
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; for (const s of [Y.spots.introBen, Y.spots.introBram]) o.push(V3(s.x - 0.5, 0, s.z), V3(s.x + 0.5, 0, s.z), V3(s.x, 2.4, s.z)); o.push(V3(4.6, 3.3, 1.0)); return o; }, 0.16, Math.PI - 0.2, port ? 0.1 : 0.06);
    if (!J) return shotFor('shop' + k, () => [V3(-1, 0, 6), V3(6.5, 0, 1), V3(2, 3, 0)], 0.3, Math.PI - 0.15, 0.05);
    if (S.phase === 'arrive' || S.phase === 'leave') return shotFor('door' + k, () => [V3(-1, 0, 7.5), V3(4, 0, 1.5), V3(1, 2.6, 4), V3(2.5, 2.4, 2.6)], 0.28, Math.PI - 0.1, 0.05);
    if (S.phase === 'react') { const f = cust.position; return shotFor('react' + k + J.ci, () => [V3(f.x - 0.9, 0.3, f.z), V3(f.x + 0.9, 0.3, f.z), V3(f.x, 2.3, f.z), V3(f.x - 1.6, 1.2, f.z)], 0.12, Math.PI - 0.35, 0.1); }
    const T = S.tool; if (!T || (needsPress(T))) return shotFor('shop' + k, () => [V3(-1, 0, 6), V3(6.5, 0, 1), V3(2, 3, 0)], 0.3, Math.PI - 0.15, 0.05);
    if (T === 'measure') return shotFor('meas' + k + J.ci, () => { const p = Y.pole.position; const pw = port ? 0.9 : 0.5; return [V3(p.x - 0.5 - pw, 0, p.z), V3(p.x + 1.3 + pw, 0, p.z), V3(p.x - 0.5, 2.6, p.z), V3(p.x + 1.3, 2.6, p.z)]; }, 0.12, Math.PI - 0.05, 0.06);
    if (T === 'press') { const s = Y.st.press; const top = port ? 2.7 : 1.75; return shotFor('press' + k, () => [V3(s.x - 1.2, 0.85, s.z + 0.45), V3(s.x + 1.2, 0.85, s.z + 0.45), V3(s.x - 1.2, top, s.z - 0.3), V3(s.x + 1.2, top, s.z - 0.3)], port ? 0.5 : 0.62, Math.PI, 0.04); }
    if (T === 'bind') { const s = Y.st.bind, L = P.L; return shotFor('bind' + k + J.ci, () => [V3(s.x - L / 2 - 0.1, s.y, s.z - 0.3), V3(s.x + L / 2 + 0.1, s.y, s.z + 0.3), V3(5.7, 1.85, 1.05), V3(5.7, 1.15, 1.05)], port ? 1.05 : 0.9, Math.PI, 0.05); }
    const s = Y.st[T], L = P.L; return shotFor(T + k + J.ci + (P.shaped ? 's' : 'b'), () => [V3(s.x - L / 2 - 0.05, s.y, s.z - 0.35), V3(s.x + L / 2 + 0.05, s.y, s.z + 0.35), V3(s.x - L / 2, s.y + 0.15, s.z), V3(s.x + L / 2, s.y + 0.15, s.z)], port ? 1.25 : 1.05, port ? flatYaw() : Math.PI, 0.05); }
  function walkCam(dt) { const w = S.walk, port = CW() < CHh(), d = S.cam.dist * (port ? 1.45 : 1), p = S.cam.pitch, cy = S.cam.yaw, tgt = V3(w.x, 1.1, w.z);
    const pos = V3(tgt.x + Math.sin(cy) * Math.cos(p) * d, tgt.y + Math.sin(p) * d, tgt.z + Math.cos(cy) * Math.cos(p) * d); camera.position.lerp(pos, Math.min(1, dt * 5)); CAM.look.lerp(tgt, Math.min(1, dt * 6)); camera.lookAt(CAM.look); }
  function cutWalls() { const dir = V3().subVectors(camera.position, CAM.look).setY(0).normalize(), close = ['work', 'react', 'arrive', 'leave', 'intro', 'done'].includes(S.phase);
    for (const W0 of Y.walls) { const hide = dir.x * W0.n[0] + dir.z * W0.n[1] < -0.3 || (close && W0 === Y.frontWall); W0.ms.forEach(m => m.visible = !hide); } Y.shopSign.visible = !(S.phase === 'work' && (S.tool === 'bind' || S.tool === 'measure')); }

  // ---------- DEMO: autopilot makes one pair (every job) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, holdTo: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.4); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = (p, j = 0) => { hand.visible = true; hand.position.copy(p).add(V3(j, 0, 0.05)); hand.scale.setScalar(0.5); };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  function demoAct() { if (!J) return 0.5; const T = nextTask();
    if (!T) { DM.cap = 'EVERY JOB DONE: TAP HAND OVER'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handBack(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'JOB ' + (J.tasks.indexOf(T) + 1) + ' OF ' + J.tasks.length + ': TAP ' + TASKS[T].label + ' AT THE BOTTOM'; DM.key = 'TAP'; hand.visible = false; return 1.5; }
    if (T === 'measure') { const w = cap('meas', 'DRAG', 'DRAG THE YELLOW MARKER UP THE POLE. LET GO AT ' + CU.name + "'S NOSE"); if (w) return w; const ty = noseY(), y = Y.marker.position.y; Y.marker.position.y = Math.abs(ty - y) < 0.06 ? ty : y + Math.sign(ty - y) * 0.06; handAt(wp(Y.marker)); if (Y.marker.position.y === ty) { measureRelease(); return 1; } return 0.05; }
    if (T === 'press') { if ((S.layers || 0) < 4) { const w = cap('layers', 'TAP', 'STACK THE LAYERS IN ORDER: BASE, EDGES, CORE, TOP SHEET', 2.4); if (w) return w; hand.visible = false; pickLayer(LAYERS[S.layers || 0].id); return 0.6; }
      const w = cap('press', 'HOLD', 'HOLD ANYWHERE TO PRESS. LET GO IN THE GREEN', 2); if (w) return w; handAt(Y.platen.getWorldPosition(V3())); startPress(); DM.holdTo = (pressZone()[0] + pressZone()[1]) / 2; return 0.1; }
    if (T === 'shape') { if (!P.trace) startTrace(); const w = cap('shape', 'TRACE', 'TRACE THE DOTTED LINE FROM TAIL TO TIP. THE ROUTER CUTS WHERE YOUR FINGER GOES', 2.4); if (w) return w; const Tt = P.trace, p = wp(P.dots[Tt.k]); handAt(p); Y.router.position.copy(Y.root.worldToLocal(p.clone())).setY(0.98); P.dots[Tt.k].material.color.set(0x22c55e); Tt.k++; Tt.cnt++; puff(p.x, p.y, p.z, 0xe8d3a8, 1); fx('chip'); S.routT = 0.2; if (Tt.k >= Tt.n) finishTrace(); return 0.16; }
    if (T === 'paint') { if (S.brush !== J.top) { const w = cap('brush', TOPS[J.top].name, 'THE CARD SAYS ' + TOPS[J.top].name + ': PICK THAT COLOUR BELOW', 2.2); if (w) return w; hand.visible = false; setBrush(J.top); return 1; }
      const m = P.topM.find(q => q.userData.cover < 1); if (!m) return 0.4; const w = cap('paint', 'SWIPE', 'SWIPE OVER THE SKIS TO PRINT THE TOP SHEETS. THE DESIGN GOES ON AT THE END'); if (w) return w; const tp = P.tops.find(t => t.material === m), c = wp(tp); DM.j = (DM.j || 1) * -1; handAt(c, DM.j * 0.15); Y.roller.position.copy(Y.root.worldToLocal(c.clone())).setY(0.99); paintOn(m, 50, c); return 0.09; }
    if (T === 'wax') { if (S.waxK !== J.wax) { const w = cap('waxk', WAXES[J.wax].name, 'TODAY IS ' + WAXES[J.wax].snow + ': PICK ' + WAXES[J.wax].name + ' WAX BELOW', 2.2); if (w) return w; hand.visible = false; setWax(J.wax); return 1; }
      const m = P.baseM.find(q => q.userData.cover < 1); if (!m) return 0.4; const w = cap('wax', 'CIRCLES', 'RUB IN CIRCLES ON THE BASES TO IRON THE WAX IN'); if (w) return w; const b = P.bases.find(t => t.material === m), c = wp(b); DM.a = (DM.a || 0) + 0.9; handAt(c, Math.cos(DM.a) * 0.12); Y.iron.position.copy(Y.root.worldToLocal(c.clone().add(V3(Math.cos(DM.a) * 0.12, 0, Math.sin(DM.a) * 0.08)))).setY(Y.st.wax.y + 0.05); waxOn(m, 0.9, c); return 0.07; }
    if (T === 'bind') { if (Math.round(S.din) !== J.din) { const w = cap('dial', 'TWIST', 'TWIST THE DIAL: DRAG ROUND IT IN A CIRCLE TO DIN ' + J.din, 2.2); if (w) return w; handAt(wp(Y.dial)); dinStep(Math.sign(J.din - Math.round(S.din))); return 0.35; }
      const w = cap('lock', 'LOCK', 'DIN ' + J.din + ' MATCHES THE CARD: TAP LOCK', 1.8); if (w) return w; hand.visible = false; lockDin(); return 1; }
    return 0.5; }
  function demoStep(dt) { if (S.hold && DM.holdTo != null) { if (S.hold.v >= DM.holdTo) { DM.holdTo = null; releasePress(); DM.cd = 0.8; } return; } hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.8));
    if (S.phase === 'arrive') { DM.cap = 'A CUSTOMER WALKS IN WITH AN ORDER'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE CUSTOMER CHECKS YOUR WORK. CLEAN JOBS EARN STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || !['intro', 'done', 'walk'].includes(S.phase)) return; aInit(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.holdTo = null; DM.cap = "WATCH A JOB AT BRAM'S SKI WORKS"; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 4; S.forceType = 'all'; S.forceAll = true; S.forceCust = 2; startDay(); S.forceType = null; S.forceAll = false; S.forceCust = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; hand.visible = false; S.hold = null; S.ptr = null; S.react = null; S.flash = null; S.day = DM.day0; Object.assign(S, { custN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, waxK: null }); (S.slabs || []).forEach(s => scene.remove(s)); S.slabs = []; Y.dial.visible = Y.band.visible = false; toIntro(); }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !J) return null; const T = S.tool, H = (p, text, tool = T, v = false, r = 0.22) => ({ p, text, tool, r, v });
    if (S.hold) return { text: 'LET GO IN THE GREEN', tool: T };
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : { text: 'ALL DONE · TAP HAND OVER', tool: 'hand' }; }
    if (needsPress(T)) return { text: J.tasks.includes('measure') && !J.measured ? 'MEASURE FIRST · TAP MEASURE' : 'PRESS FIRST · TAP PRESS', tool: J.tasks.includes('measure') && !J.measured ? 'measure' : 'press' };
    if (T === 'measure') return H(wp(Y.marker), 'DRAG THE MARKER TO ' + CU.name + "'S NOSE · " + Math.round(Y.marker.position.y * 100) + ' cm', T, true, 0.3);
    if (T === 'press') { if (J.tasks.includes('measure') && !J.measured) return { text: 'MEASURE FIRST · TAP MEASURE', tool: 'measure' }; if ((S.layers || 0) < 4) return { text: 'TAP ' + LAYERS[S.layers || 0].label + ' BELOW · LAYER ' + ((S.layers || 0) + 1) + ' OF 4', tool: T }; return H(Y.platen.getWorldPosition(V3()).setY(1.0), 'HOLD ANYWHERE TO PRESS · LET GO IN THE GREEN', T, false, 0.8); }
    if (T === 'shape') { const k = P.trace ? P.trace.k : 0; return { text: k ? 'KEEP TRACING THE DOTS · ' + Math.round(k / P.trace.n * 100) + '%' : 'START AT THE TAIL: TRACE THE DOTTED LINE TO THE TIP', tool: T }; }
    if (T === 'paint') { if (!S.brush) return { text: 'PICK ' + TOPS[J.top].name + ' BELOW', tool: T }; const m = P.topM.find(q => q.userData.cover < 1 || q.userData.col !== J.top); if (!m) return null; return { text: m.userData.cover >= 1 ? 'WRONG COLOUR · PRINT IT ' + TOPS[J.top].name : 'SWIPE OVER THE SKIS TO PRINT · ' + info('paint').txt, tool: T }; }
    if (T === 'wax') { if (!S.waxK) return { text: WAXES[J.wax].snow + ' TODAY · PICK ' + WAXES[J.wax].name + ' WAX BELOW', tool: T }; return { text: 'RUB IN CIRCLES ON THE BASES · ' + Math.round(info('wax').prog * 100) + '%', tool: T }; }
    if (T === 'bind') return { text: 'TWIST THE DIAL TO DIN ' + J.din + ' · THEN TAP LOCK', tool: T };
    return null; }
  let HINT = null, hintT = 0;

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  function step(dt) { const t = clock.elapsedTime; S.phT += dt; S.t = t;
    { const ph = S.phase, mood = ph === 'work' || ph === 'arrive' || ph === 'react' || ph === 'leave' ? 'work' : 'lodge'; SND.music(mood);
      S.routT = Math.max(0, (S.routT || 0) - dt); S.rollT = Math.max(0, (S.rollT || 0) - dt); S.waxT = Math.max(0, (S.waxT || 0) - dt);
      SND.loop('router', S.routT > 0 ? 1 : 0); SND.loop('roller', S.rollT > 0 ? 1 : 0); SND.loop('sizzle', S.waxT > 0 ? 1 : 0);
      const w = S.walk, walking = ph === 'walk'; SND.loop('glide', walking && w.skis ? Math.min(1, Math.hypot(w.vx, w.vz) / 5) : 0);
      const fd = walking ? Math.hypot(w.x + 6.6, w.z - 5.6) : ph === 'work' ? 9 : 7; SND.loop('fire', clamp(1 - fd / 8, 0, 1) * 0.9 + 0.05);
      warm.intensity = 1.1 + Math.sin(t * 9) * 0.12 + Math.sin(t * 23) * 0.08 + (Math.random() - 0.5) * 0.1; Y.ember.material.opacity = 0.75 + Math.sin(t * 11) * 0.2;
      if (door.open > 0) door.open -= dt; Y.door.rotation.y = damp(Y.door.rotation.y, door.open > 0 ? -1.35 : 0, 5, dt);
      if (walking && !w.skis) { const sp = Math.hypot(w.vx, w.vz); if (sp > 0.6) { S.stepT = (S.stepT || 0) - dt * sp / 3.4; if (S.stepT <= 0) { S.stepT = 0.34; S.stepK = (S.stepK || 0) + 1; fx('step', { k: S.stepK }); } } } }
    Y.flakeT.offset.y += dt * 0.12; Y.flakeT.offset.x = Math.sin(t * 0.3) * 0.05; for (const f of flakes) { f.position.y -= dt * 0.9; f.position.x += Math.sin(t + f.position.z) * dt * 0.2; if (f.position.y < 0) f.position.y = 9; }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; S.toastT -= dt; if (S.toastT <= 0) S.toast = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    if (Math.random() < dt * 2) puff(Y.steam.x + rr(-0.05, 0.05), Y.steam.y, Y.steam.z, 0xffffff, 1);
    for (const f of [bram, perri, nix]) { if (!f.visible) continue; kit.animFox && kit.animFox(f, dt, 0); if (f.userData.waveT > 0) { f.userData.waveT -= dt; f.userData.P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(f.userData.waveT * 14) * 0.32); } }
    if (S.phase === 'walk') { walkStep(dt); walkCam(dt); }
    else {
      if (S.phase === 'arrive' && cust) { const path = [V3(0, 0, 4.2), V3(Y.spots.cust.x, 0, Y.spots.cust.z)], k = cust.userData.wpI || 0, to = path[k]; const d = V3(to.x - cust.position.x, 0, to.z - cust.position.z), l = d.length();
        if (l < 0.06) { if (k + 1 < path.length) cust.userData.wpI = k + 1; else { cust.userData.wpI = 0; cust.rotation.y = -0.35; S.phase = 'work'; S.phT = 0; say(CU.name + ': "' + J.line + '"', 4.5); setTool(J.tasks[0]); fx('page'); } }
        else { cust.position.addScaledVector(d.normalize(), Math.min(l, dt * 2.4)); cust.rotation.y = Math.atan2(d.x, d.z); } kit.animFox(cust, dt, l < 0.06 ? 0 : 2.4); }
      else if (S.phase === 'react') { if (S.react) S.react.t += dt; kit.animFox(cust, dt, 0); if (P) { P.g.position.lerp(V3(cust.position.x + 0.25, 1.5 * cust.scale.y, cust.position.z + 0.1), Math.min(1, dt * 4)); P.g.rotation.set(0, 0.3, 1.25); } if (S.phT > 3) { S.react = null; S.phase = 'leave'; S.phT = 0; door.open = 3.2; setTimeout(() => fx('door'), 900); } }
      else if (S.phase === 'leave') { const to = S.phT < 1.2 ? V3(0, 0, 4.4) : V3(0, 0, 9), d = V3(to.x - cust.position.x, 0, to.z - cust.position.z), l = d.length(); if (l > 0.05) { cust.position.addScaledVector(d.normalize(), Math.min(l, dt * 2.6)); cust.rotation.y = Math.atan2(d.x, d.z); } kit.animFox(cust, dt, 2.6);
        if (P) { P.g.position.set(cust.position.x + 0.25, 1.5 * cust.scale.y, cust.position.z + 0.1); P.g.rotation.set(0, cust.rotation.y + 0.3, 1.25); }
        if (cust.position.z > 8.6) { if (DM.on) { demoStop(); return; } S.custN++; if (S.custN >= SKIWORKS.perDay) endDay(); else nextCustomer(); } }
      else if (S.phase === 'work' && cust) kit.animFox(cust, dt, 0);
      if (P) { if (P.mv) { P.mv.t = Math.min(1, P.mv.t + dt * 2.2); const k = smooth(0, 1, P.mv.t); P.g.position.lerpVectors(P.mv.from, P.mv.to, k); P.g.position.y += Math.sin(k * Math.PI) * 0.7; P.g.rotation.x = P.mv.r0 + (P.mv.r1 - P.mv.r0) * k; if (P.mv.t >= 1) P.mv = null; }
        for (const d of P.decals) if (d.userData.fade && d.material.opacity < 1) d.material.opacity = Math.min(1, d.material.opacity + dt * 1.5); for (const b of P.binds) if (b.userData.drop > 0) { b.userData.drop = Math.max(0, b.userData.drop - dt * 3); b.position.y = b.userData.drop * 0.4; } }
      for (const s of (S.slabs || [])) s.position.y = damp(s.position.y, s.userData.ty, 10, dt);
      // station props follow the active task
      const work = S.phase === 'work'; Y.band.visible = work && S.tool === 'measure' && J && !J.measured; if (Y.band.visible) Y.band.position.y = noseY();
      Y.dial.visible = work && S.tool === 'bind' && P && P.pressed && !P.bound; if (Y.dial.visible && S.dialDrawn !== Math.round((S.din || 1) * 20)) drawDial();
      if (!(work && S.tool === 'shape' && S.ptr)) Y.router.position.lerp(Y.routerHome, Math.min(1, dt * 3)); if (!(work && S.tool === 'paint' && S.ptr)) Y.roller.position.lerp(Y.rollerHome, Math.min(1, dt * 3)); if (!(work && S.tool === 'wax' && S.ptr) && !DM.on) Y.iron.position.lerp(Y.ironHome, Math.min(1, dt * 3));
      const pv = S.hold && S.hold.kind === 'press' ? S.hold.v : 0; Y.platen.position.y = damp(Y.platen.position.y, 2.45 - Math.min(1, pv) * 1.38, 14, dt);
      if (S.hold) { S.hold.v = Math.min(1.1, S.hold.v + dt * 0.45); { const [za, zb] = pressZone(), inG = S.hold.v >= za && S.hold.v <= zb; if (inG && !S.hold.inG) { fx('dialMatch'); buzz(20); } S.hold.inG = inG; } if (S.hold.v >= 1.1) releasePress(); }
      // Ben: idle anim, little "working" arm loop while a gesture is active
      kit.animFox(ben, dt, 0); const greet = S.phase === 'intro' || S.phase === 'done'; ben.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); else if (S.ptr && S.ptr.kind) { BP.arms[0].rotation.x = -1.2 + Math.sin(t * 14) * 0.3; BP.arms[1].rotation.x = -1.2 - Math.sin(t * 14) * 0.3; }
      if (S.phase === 'work' || S.phase === 'arrive') bram.userData.P.arms[1].rotation.x = -1.6;
      if (!DM.on && S.phase === 'work' && S.tool && info(S.tool).done && !S.ptr && !S.hold && performance.now() - (S.userToolT || 0) > 3000 && performance.now() - (S.lastInput || 0) > 1200) { const nx = nextTask(); if (nx) setTool(nx); }
      if (S.phase === 'work' || S.phase === 'react') { const bp = ben.position.clone().setY(1.3); ben.visible = camera.position.distanceTo(bp) > 3.4 && !(S.tool === 'measure' && S.phase === 'work' && CW() < CHh()); } else if (S.phase !== 'walk') ben.visible = true;
      const sh = shot(), rate = S.phase === 'work' ? 3.2 : 2.2; camera.position.lerp(sh.pos, Math.min(1, dt * rate)); CAM.look.lerp(sh.look, Math.min(1, dt * rate)); camera.lookAt(CAM.look); }
    cutWalls();
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt); const vr = vis && vis.v ? Math.PI / 2 : 0; RINGS.pulse.rotation.x = RINGS.pulse2.rotation.x = vr; if (vis && vis.v) { RINGS.pulse.position.z += 0.06; RINGS.pulse2.position.z += 0.06; RINGS.pulse.scale.multiplyScalar(0.35); RINGS.pulse2.scale.multiplyScalar(0.35); RINGS.arrow.visible = false; } }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() { const D = S.dialog, N = D && NPC[D.id], ch = D && D.mode === 'menu' ? choices() : null, pz = pressZone();
    return { phase: S.phase, day: S.day, custN: S.custN, perDay: SKIWORKS.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { owner: CU.name, kid: !!CU.kid, type: SKIS[J.type].name, len: J.len, measured: J.measured, top: J.top, topName: TOPS[J.top].name, topCol: TOPS[J.top].col, design: J.design, wax: J.wax, waxName: WAXES[J.wax].name, snow: WAXES[J.wax].snow, waxCol: WAXES[J.wax].col, din: J.din,
        tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt, locked: needsPress(id) }; }) } : null,
      tool: S.tool, brush: S.brush, waxK: S.waxK, din: Math.round(S.din || 1),
      picker: S.phase !== 'work' || !J || needsPress(S.tool) ? null : S.tool === 'paint' && !info('paint').done ? 'paint' : S.tool === 'wax' && !info('wax').done ? 'wax' : S.tool === 'press' && P && !P.pressed && (S.layers || 0) < 4 && J.measured ? 'layers' : S.tool === 'bind' && P && !P.bound ? 'bind' : null,
      layers: LAYERS.map((l, i) => ({ ...l, done: i < (S.layers || 0), next: i === (S.layers || 0) })), allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      press: S.hold ? { v: S.hold.v / 1.1, zone: S.hold.v < 0.32 ? 'TOO SOFT' : S.hold.v < pz[0] ? 'FLAT' : S.hold.v <= pz[1] ? 'JUST RIGHT' : S.hold.v < 1 ? 'STIFF' : 'OVERPRESSED', segs: [[0.32, '#9ca3af'], [pz[0] - 0.32, '#e6b45a'], [pz[1] - pz[0], '#22c55e'], [1 - pz[1], '#e6b45a'], [0.1, '#ec3013']] } : null,
      sound: SND.level, flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('skiUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      walk: S.phase === 'walk' ? { prompt: S.prompt, toast: S.toast, en: Math.round(S.en), skis: S.walk.skis, dialog: D ? { name: N.name, role: N.role, text: D.text, choices: ch ? ch.map(c => ({ text: c.text, asked: !!c.asked, bye: !!c.bye })) : null, step: 1, total: 1, more: D.mode === 'answer' } : null, quest: S.dialog ? 'TALKING · ' + N.name : "BRAM'S SKI WORKS · TALK TO BRAM TO START A SHIFT" } : null,
      shop: S.shop ? SHOP.map(it => ({ ...it, own: save.count(it.id) })) : null, items: Object.entries(save.data.items || {}).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n, label: (SHOP.find(s => s.id === id) || {}).name || (id === 'skisBram' ? "BRAM'S CUSTOM SKIS" : id) })) }; }
  frame(); toIntro(); if (startIn === 'walk') toWalk();
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setTool, setBrush, setWax, pickLayer, dinStep, lockDin, handBack, startDay, toIntro, toWalk, demoStart, demoStop, buyUpgrade, buyItem, openShop() { if (S.phase === 'walk') S.shop = true; }, closeShop() { S.shop = false; }, hud,
    // Game HUD engine contract (free walk)
    start() {}, talk, choose, closeDialog, nextLine() { talk(); }, clearToast() { S.toast = ''; }, melee: wave, range: toggleSkis, jump: hop, meleeUp() {}, useItem(id) { toast(id === 'skisBram' ? "Bram's custom skis. Save them for the slopes." : 'Save it for the mountain.', 2); }, closeWheel() {}, skipTime() {},
    setPaused(v) { PAUSE = !!v; }, setHudPad() {}, setStick(x, y) { S.stick.x = x; S.stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy(dx = 0, dy = 0) { S.cam.yaw -= dx * 0.006; S.cam.pitch = clamp(S.cam.pitch + dy * 0.004, 0.25, 1.1); }, zoomBy(f = 1) { S.cam.dist = clamp(S.cam.dist * f, 3.5, 10); },
    getCam() { return { dist: S.cam.dist, pitch: S.cam.pitch }; }, setCam(dist, pitch) { if (dist) S.cam.dist = clamp(dist, 3.5, 10); if (pitch != null) S.cam.pitch = clamp(pitch, 0.25, 1.1); }, setMinimap() {}, toggleSound() { return SND.cycle() === 'off'; }, soundCycle() { aInit(); const l = SND.cycle(); fx('click'); return l; }, cycleWeather() {},
    mapData() { const w = S.walk; return { p: [w.x, w.z, w.face], b: [['PRESS', -5.4, -5.2], ['SHAPE', -1.8, -5.2], ['PAINT', 1.8, -5.2], ['WAX', 5.4, -5.2], ['COUNTER', 4.6, 1.0], ['COCOA', -6.6, 5.6], ['DOOR', 0, 7]], f: [[bram.position.x, bram.position.z], [perri.position.x, perri.position.z], [nix.position.x, nix.position.z]], e: [], q: null }; },
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => S, _job: () => J, _pair: () => P, _scr: scr, _wp: wp, _Y: Y, _force(o) { Object.assign(S, o); },
    _auto() { return { measureAll() { Y.marker.position.y = noseY(); measureRelease(); }, pressAll() { S.tool = 'press'; for (let i = 0; i < 4 && (S.layers || 0) < 4; i++) pickLayer(LAYERS[S.layers || 0].id); S.hold = { kind: 'press', v: 0.6 }; releasePress(); }, shapeAll() { if (!P.trace) startTrace(); P.trace.k = P.trace.n; finishTrace(); }, paintAll() { S.brush = J.top; P.topM.forEach(m => paintOn(m, 999)); }, waxAll() { S.waxK = J.wax; P.baseM.forEach(m => waxOn(m, 99)); }, bindAll() { S.din = J.din; lockDin(); } }; },
    destroy() { SND.destroy(); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
