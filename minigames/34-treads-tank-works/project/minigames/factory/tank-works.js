// 8 GATES — SGT. TREAD'S TANK WORKS [treadTankWorks]. A JOB location (Boatworks is the reference): Ben makes tank parts, one work order at a time, no clock, scored on quality.
// Ben's answers: owner SGT. TREAD (the Tank Range sergeant) · work orders, no clock · jobs CAST + FORGE, WELD, BOLT + DRILL, PAINT + STAMP.
// Flow: a customer walks in with a WORK ORDER → the part is made down the LINE, station by station (CAST → FORGE → WELD → BOLT → PAINT → STAMP)
//   → SHIP IT → the customer reacts (THRILLED / HAPPY / OKAY / GRUMPY) + pays + tips → carries the crate out. 3 orders = a day → day card (wage, stars, upgrades, uniform).
// Gestures (one per job, thumb sized):
//   CAST  hold to tip the crucible and pour, let go in the green (short = top up, costs a little; over = spill)
//   FORGE a ring shrinks around the hot part: tap when it turns GREEN, the power hammer strikes (4–5 good hits)
//   WELD  drag along the glowing seam; stay on the line, don't rush (too fast = splatter)
//   BOLT  tap each mark to drill it, then draw circles on the bolt to spin it tight; let go in the green, don't strip it
//   PAINT pick the camo on the order, spray it on with swipes (the real pattern appears where you spray)
//   STAMP hold the QC stamp down, let go in the green
// Parts: ROAD WHEEL · ARMOUR PLATE · TURRET HATCH · GUN BARREL. Save keys tank.works.*, flag tankWorksUniform.
// WALK MODE: when not on shift the player walks around the hall with the standard Game HUD (joystick, 3 = jump, TALK to Sgt. Tread → Put me to work).
// MERGE: buildWorks(ctx) builds the hall at an origin (returns spots, stations, colliders, walk(x,z), door) so any world can drop it into a building;
//        createTankWorks({ container, onState }) runs it stand-alone and returns the page API + the Game HUD engine contract.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST as FOXCAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { vehicleKit } from '../../engine/vehicle-kit.js';

export const TANKWORKS = { name: "SGT. TREAD'S TANK WORKS", room: 'treadTankWorks', perDay: 3 };
export const CAMO = {
  desert: { name: 'DESERT', cols: ['#c9a86a', '#8a6a3e', '#ead7a4'], sw: '#c9a86a' },
  forest: { name: 'FOREST', cols: ['#5b7a3a', '#2f4224', '#9a9a52'], sw: '#5b7a3a' },
  snow: { name: 'SNOW', cols: ['#e8ecef', '#9aa3ab', '#5f6a74'], sw: '#e8ecef' },
  night: { name: 'NIGHT', cols: ['#2c3a56', '#111827', '#55648a'], sw: '#2c3a56' } };
const CK = Object.keys(CAMO);
export const PARTS = {
  wheel: { name: 'ROAD WHEEL', price: 14, tasks: ['cast', 'forge', 'bolt', 'paint', 'stamp'] },
  plate: { name: 'ARMOUR PLATE', price: 18, tasks: ['cast', 'forge', 'weld', 'bolt', 'paint', 'stamp'] },
  hatch: { name: 'TURRET HATCH', price: 16, tasks: ['cast', 'weld', 'bolt', 'paint', 'stamp'] },
  barrel: { name: 'GUN BARREL', price: 20, tasks: ['cast', 'forge', 'weld', 'paint', 'stamp'] } };
export const TASKS = { cast: { label: 'CAST', name: 'Pour the steel into the mould' }, forge: { label: 'FORGE', name: 'Hammer it into shape' }, weld: { label: 'WELD', name: 'Weld the seams' }, bolt: { label: 'BOLT', name: 'Drill + bolt it' }, paint: { label: 'PAINT', name: 'Spray the camo' }, stamp: { label: 'STAMP', name: 'QC stamp' } };
const ORDER = ['cast', 'forge', 'weld', 'bolt', 'paint', 'stamp'];
export const UPGRADES = [
  { id: 'ladle', name: 'BIG LADLE', cost: 35, line: 'The pour has a wider green zone.' },
  { id: 'hammer', name: 'STEAM HAMMER', cost: 40, line: 'The forge ring is slower and the green is wider.' },
  { id: 'torch', name: 'STEADY TORCH', cost: 35, line: 'Welds forgive wobbles and speed.' },
  { id: 'driver', name: 'IMPACT DRIVER', cost: 30, line: 'Bolts spin tight twice as fast.' },
  { id: 'nozzle', name: 'WIDE NOZZLE', cost: 30, line: 'Paint sprays a much wider cloud.' },
  { id: 'radio', name: 'FACTORY RADIO', cost: 60, line: 'Customers tip 25% more.' }];
const CUSTOMERS = [
  { name: 'CPL. GRIT', from: 'TANK RANGE', torso: ['#5b6b3a', '#d9cfa8', '#3f4a28'], outfit: 'armor' },
  { name: 'CAPTAIN BRASS', from: 'CASTLE GUARD', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#1f3a5f', '#e6b45a', '#16263c'], outfit: 'coat' },
  { name: 'DOC SPROCKET', from: 'ARENA GARAGE', fur: '#9a9a9e', furDark: '#6a6a70', torso: ['#3a3836', '#ec3013', '#201e1d'], outfit: 'vest' },
  { name: 'PVT. PIP', from: 'TANK RANGE', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#6b7d4a', '#f2e8c8', '#4a5a30'], outfit: 'armor' },
  { name: 'MAJOR OAKLEY', from: 'CASTLE GUARD', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#7a1f1f', '#e6b45a', '#4a1212'], outfit: 'coat' },
  { name: 'WREN', from: 'SCRAP YARD', fur: '#c9682a', furDark: '#8a4213', torso: ['#2f9a8f', '#f2d970', '#1f6a62'], outfit: 'vest' }];
const HELLO = ['The Tank Range chewed up another one.', 'Sgt. Tread says you have steady paws.', 'Read the camo on the card. Twice.', 'Make it tough. It is going up against the Iron Warden.', 'No rush, recruit. Just make it right.', 'Last one rattled loose on the first bump. Not this time.'];
// Sgt. Tread's look + talk, exported so a world can place him in its own copy of the hall (lines are the same in both)
export const TREAD_FOX = { torso: ['#5b6b3a', '#d9cfa8', '#3f4a28'], outfit: 'armor', crest: 'T', gear: 'none', mood: 'happy', fur: '#9a9a9e', furDark: '#5f5f66', cap: true };
export const TREAD_TALK = { hello: { text: 'At ease, recruit! Every tank in Meru rolls on parts made in this hall. Want a shift?', ch: [['Put me to work.', 'work'], ['What do you make here?', 'make'], ['Who buys the parts?', 'buy'], ['Just looking around.', 'bye']] },
  make: { text: 'Road wheels, armour plates, turret hatches and gun barrels. Cast it, forge it, weld it, bolt it, paint it, stamp it. One part at a time, done right.', ch: [['Put me to work.', 'work'], ['Who buys the parts?', 'buy'], ['Just looking around.', 'bye']] },
  buy: { text: 'The Tank Range, the Castle Guard, the Arena garage, even the scrap yard. Clean work gets paid. Perfect work gets tipped.', ch: [['Put me to work.', 'work'], ['What do you make here?', 'make'], ['Just looking around.', 'bye']] } };
export const STATION_INFO = { cast: 'Station 1 · CAST. The furnace melts scrap steel; the crucible pours it into a sand mould. Hold to pour, let go in the green.', forge: 'Station 2 · FORGE. The power hammer beats the hot part into shape. Strike on the green ring.', weld: 'Station 3 · WELD. Brackets and hinges are clamped on here. Trace each glowing seam with the torch.', bolt: 'Station 4 · BOLT. Drill the red marks, then spin each bolt tight in little circles.', paint: 'Station 5 · PAINT. Spray booth. Four camo patterns: Desert, Forest, Snow and Night.', stamp: 'Station 6 · STAMP. Quality control. Nothing leaves without the Sergeant\'s stamp.', tank: 'MK-8 BATTLE TANK. Road wheels, armour, hatch and barrel: every part on it came off this line.' };
const SAVE = { day: 'tank.works.day', best: 'tank.works.best', upg: 'tank.works.upg.', stars: 'tank.works.stars', shipped: 'tank.works.shipped' };
const LY = 1.0, ST_X = { cast: -9, forge: -5.4, weld: -1.8, bolt: 1.8, paint: 5.4, stamp: 9 }, LINE_IN = -12.6, SHIP_X = 11.9;
const POUR = () => [0.76, 0.92], STAMPZ = [0.5, 0.78], TORQ = [0.68, 0.88];
const HALL = { x0: -14, x1: 14, z0: -8, z1: 7.5, h: 7 };

// ================= the hall =================
export function buildWorks(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const Y = { root, walls: [], colliders: [], lamps: [], glow: [] }, ink = toon('#201e1d'), steel = toon('#5b5f66'), steelL = toon('#8b9096'), yel = toon('#f2c94c'), red = toon('#c42d3c'), olive = toon('#5b6b3a'), brick = toon('#8a4a32'), conc = toon('#9a958c');
  const col = (x0, x1, z0, z1) => Y.colliders.push([x0 + origin.x, x1 + origin.x, z0 + origin.z, z1 + origin.z]);
  // floor: concrete slabs + yellow safety walkway lines
  const floorT = CTX(512, 512, c => { c.fillStyle = '#a7a299'; c.fillRect(0, 0, 512, 512); for (let i = 0; i < 400; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(80,74,66,0.10)' : 'rgba(255,255,255,0.08)'; c.fillRect(Math.random() * 512, Math.random() * 512, 3 + Math.random() * 10, 2 + Math.random() * 4); } c.strokeStyle = '#7f7a71'; c.lineWidth = 4; c.strokeRect(2, 2, 508, 508); c.fillStyle = 'rgba(40,36,30,0.18)'; c.beginPath(); c.ellipse(330, 210, 60, 26, 0.4, 0, 7); c.fill(); });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(7, 4);
  { const ap = new T3.Mesh(new T3.PlaneGeometry(120, 120), toon('#7d7a73')); ap.rotation.x = -Math.PI / 2; ap.position.y = -0.02; root.add(ap); }
  const floor = new T3.Mesh(new T3.PlaneGeometry(HALL.x1 - HALL.x0, HALL.z1 - HALL.z0), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, (HALL.z0 + HALL.z1) / 2); floor.receiveShadow = true; root.add(floor);
  const stripe = (x0, x1, z0, z1, m = yel) => { const s = new T3.Mesh(new T3.PlaneGeometry(x1 - x0, z1 - z0), m); s.rotation.x = -Math.PI / 2; s.position.set((x0 + x1) / 2, 0.012, (z0 + z1) / 2); root.add(s); };
  const yb = new T3.MeshBasicMaterial({ color: 0xf2c94c }); stripe(-13.6, 13.6, 1.05, 1.17, yb); stripe(-13.6, 13.6, 6.9, 7.02, yb);
  const hazT = CTX(128, 32, c => { c.fillStyle = '#f2c94c'; c.fillRect(0, 0, 128, 32); c.fillStyle = '#201e1d'; for (let x = -32; x < 160; x += 32) { c.beginPath(); c.moveTo(x, 32); c.lineTo(x + 16, 0); c.lineTo(x + 32, 0); c.lineTo(x + 16, 32); c.fill(); } }); hazT.wrapS = T3.RepeatWrapping; hazT.repeat.set(30, 1);
  stripe(-13.6, 11.6, 0.82, 1.0, new T3.MeshBasicMaterial({ map: hazT }));
  // walls: corrugated steel, tall windows; each wall can hide when the camera is on its outside
  const wallT = CTX(256, 256, c => { c.fillStyle = '#6e7c86'; c.fillRect(0, 0, 256, 256); for (let x = 0; x < 256; x += 16) { c.fillStyle = '#5d6a73'; c.fillRect(x, 0, 6, 256); c.fillStyle = '#82909a'; c.fillRect(x + 8, 0, 2, 256); } c.fillStyle = 'rgba(120,60,30,0.25)'; for (let i = 0; i < 18; i++) c.fillRect((i * 67) % 256, 200 + (i * 13) % 56, 6, 14); }); wallT.wrapS = T3.RepeatWrapping;
  const wallM = (rep) => { const t = wallT.clone(); t.needsUpdate = true; t.wrapS = T3.RepeatWrapping; t.repeat.set(rep, 1); return new T3.MeshToonMaterial({ map: t, gradientMap: ctx.grad, side: T3.DoubleSide }); };
  const winT = CTX(128, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#d6eef8'); gr.addColorStop(1, '#9fc6dc'); c.fillStyle = gr; c.fillRect(0, 0, 128, 256); c.fillStyle = '#3a3f45'; c.fillRect(0, 0, 128, 8); c.fillRect(0, 248, 128, 8); c.fillRect(0, 0, 8, 256); c.fillRect(120, 0, 8, 256); for (let y = 62; y < 256; y += 62) c.fillRect(0, y, 128, 5); c.fillRect(61, 0, 6, 256); c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(14, 240); c.lineTo(50, 14); c.lineTo(66, 14); c.lineTo(30, 240); c.fill(); });
  const winM = new T3.MeshBasicMaterial({ map: winT });
  function wall(axis, at, from, to, side) { const g = new T3.Group(); root.add(g); const len = to - from, mid = (from + to) / 2;
    const m = new T3.Mesh(new T3.PlaneGeometry(len, HALL.h), wallM(len / 4)); g.add(m);
    if (axis === 'z') { m.position.set(mid, HALL.h / 2, at); } else { m.position.set(at, HALL.h / 2, mid); m.rotation.y = Math.PI / 2; }
    for (let k = from + 3; k < to - 2; k += 4.5) { const w = new T3.Mesh(new T3.PlaneGeometry(1.5, 2.6), winM); if (axis === 'z') { w.position.set(k, 4.6, at + side * 0.03); if (side < 0) w.rotation.y = Math.PI; } else { w.position.set(at + side * 0.03, 4.6, k); w.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2; } g.add(w); }
    const kick = M(axis === 'z' ? new T3.BoxGeometry(len, 0.5, 0.12) : new T3.BoxGeometry(0.12, 0.5, len), toon('#3a3f45'), axis === 'z' ? mid : at + side * 0.05, 0.25, axis === 'z' ? at + side * 0.05 : mid, g, 0);
    Y.walls.push({ g, axis, at: at + (axis === 'z' ? origin.z : origin.x), side }); return g; }
  wall('z', HALL.z0, HALL.x0, HALL.x1, 1); const front = wall('z', HALL.z1, HALL.x0, HALL.x1, -1); wall('x', HALL.x0, HALL.z0, HALL.z1, 1); wall('x', HALL.x1, HALL.z0, HALL.z1, -1);
  // front door (customers come and go here)
  Y.door = { x: 8 + origin.x, z: HALL.z1 - 0.6 + origin.z };
  { const d = M(new T3.BoxGeometry(2.4, 3.2, 0.14), toon('#2f3a44'), 8, 1.6, HALL.z1 - 0.02, front, 0.02); const dl = M(new T3.BoxGeometry(2.6, 0.3, 0.2), yel, 8, 3.35, HALL.z1 - 0.05, front, 0.01); }
  // side roller door + raw ore bins (left), the line comes in through a hatch
  { const rd = CTX(256, 256, c => { c.fillStyle = '#9aa3ab'; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 14) { c.fillStyle = '#7d868e'; c.fillRect(0, y, 256, 4); } }); const m = new T3.Mesh(new T3.PlaneGeometry(4, 4.2), new T3.MeshToonMaterial({ map: rd, gradientMap: ctx.grad })); m.position.set(HALL.x0 + 0.04, 2.1, -4.5); m.rotation.y = Math.PI / 2; root.add(m); }
  // sign over the back wall
  const signT = CTX(1024, 180, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 180); c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 1024, 14); c.fillRect(0, 166, 1024, 14); c.fillStyle = '#f3f2f2'; c.font = '900 88px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("TREAD'S TANK WORKS", 512, 92); c.fillStyle = '#ec3013'; c.fillRect(40, 70, 26, 44); c.fillRect(958, 70, 26, 44); });
  { const s = new T3.Mesh(new T3.PlaneGeometry(9, 1.6), new T3.MeshBasicMaterial({ map: signT })); s.position.set(0, 6.0, HALL.z0 + 0.06); s.name = 'sign'; root.add(s); }
  // roof trusses (open roof: light from above, nothing blocks the view) + overhead crane rail
  for (let x = -12; x <= 12; x += 4) { const t = M(new T3.BoxGeometry(0.22, 0.32, HALL.z1 - HALL.z0), steel, x, HALL.h - 0.16, (HALL.z0 + HALL.z1) / 2, root, 0.01); t.castShadow = false; }
  for (const z of [-4.5, -1.2]) { const r = M(new T3.BoxGeometry(HALL.x1 - HALL.x0, 0.36, 0.3), yel, 0, 6.2, z, root, 0.015); r.castShadow = false; }
  { const cr = M(new T3.BoxGeometry(0.5, 0.5, 3.6), toon('#ec3013'), -3, 5.9, -2.85, root, 0.015); cr.castShadow = false; const hk = M(new T3.CylinderGeometry(0.02, 0.02, 2.2, 5), ink, -3, 4.6, -2.85, root, 0); M(new T3.TorusGeometry(0.16, 0.05, 6, 12, Math.PI * 1.4), ink, -3, 3.45, -2.85, root, 0); }
  // hanging lamps
  for (let x = -10.5; x <= 10.5; x += 5.25) for (const z of [-1.2, 3.4]) { M(new T3.CylinderGeometry(0.012, 0.012, 1.4, 4), ink, x, HALL.h - 0.9, z, root, 0).castShadow = false; const sh = M(new T3.ConeGeometry(0.42, 0.36, 14, 1, true), toon('#2f3a44', { side: T3.DoubleSide }), x, HALL.h - 1.7, z, root, 0.01); sh.castShadow = false; const b = new T3.Mesh(new T3.SphereGeometry(0.13, 10, 8), new T3.MeshBasicMaterial({ color: 0xfff1c4 })); b.position.set(x, HALL.h - 1.82, z); root.add(b); Y.lamps.push(b); }

  // ---- THE LINE: roller conveyor from the in-hatch to the shipping end ----
  { const len = SHIP_X - LINE_IN + 1.2, cx = (SHIP_X + LINE_IN) / 2 + 0.3;
    for (const z of [-0.62, 0.62]) M(new T3.BoxGeometry(len, 0.16, 0.1), toon('#3a3f45'), cx, LY - 0.1, z, root, 0.012);
    for (let x = LINE_IN - 0.2; x < SHIP_X + 0.8; x += 2.2) for (const z of [-0.55, 0.55]) M(new T3.BoxGeometry(0.1, LY - 0.18, 0.1), toon('#3a3f45'), x, (LY - 0.18) / 2, z, root, 0);
    const rg = new T3.CylinderGeometry(0.055, 0.055, 1.18, 8).rotateX(Math.PI / 2), n = Math.floor(len / 0.32), rm = new T3.InstancedMesh(rg, toon('#b8bec4'), n), q = new T3.Object3D();
    for (let i = 0; i < n; i++) { q.position.set(LINE_IN - 0.3 + i * 0.32, LY - 0.06, 0); q.updateMatrix(); rm.setMatrixAt(i, q.matrix); } root.add(rm); Y.rollers = rm;
    col(LINE_IN - 1.2, SHIP_X + 0.9, -0.75, 0.75);
    // in-hatch on the left wall end
    M(new T3.BoxGeometry(0.4, 2.2, 1.8), toon('#3a3f45'), LINE_IN - 1.1, 1.1, 0, root, 0.02); const hm = M(new T3.BoxGeometry(0.42, 1.0, 1.3), ink, LINE_IN - 1.08, LY + 0.5, 0, root, 0); }
  // station plates on the floor in front of each station (big painted numbers)
  ORDER.forEach((k, i) => { const t = CTX(256, 128, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#ffd23a'; c.font = '900 64px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText(String(i + 1), 18, 68); c.fillStyle = '#f3f2f2'; c.font = '900 46px Archivo, Arial'; c.fillText(TASKS[k].label, 74, 68); }); const p = new T3.Mesh(new T3.PlaneGeometry(1.5, 0.75), new T3.MeshBasicMaterial({ map: t })); p.rotation.x = -Math.PI / 2; p.position.set(ST_X[k], 0.015, 1.6); root.add(p);
    const sg = new T3.Mesh(new T3.PlaneGeometry(1.3, 0.65), new T3.MeshBasicMaterial({ map: t })); sg.position.set(ST_X[k] + 1.05, 3.6, -2.0); root.add(sg); });
  const S = Y.st = {};
  // 1 CAST: furnace + crucible arm + mould on the line
  { const x = ST_X.cast, g = new T3.Group(); g.position.set(x, 0, 0); root.add(g); S.cast = g;
    M(new T3.BoxGeometry(2.2, 2.6, 1.7), brick, -0.2, 1.3, -2.4, g, 0.03); M(new T3.BoxGeometry(2.4, 0.3, 1.9), toon('#3a3836'), -0.2, 2.75, -2.4, g, 0.02); M(new T3.CylinderGeometry(0.35, 0.45, 3.4, 12), toon('#3a3836'), -0.8, 4.6, -2.6, g, 0.02, 0.45);
    const mouth = new T3.Mesh(new T3.PlaneGeometry(1.0, 0.7), new T3.MeshBasicMaterial({ color: 0xff7a1a })); mouth.position.set(-0.2, 1.1, -1.54); g.add(mouth); Y.glow.push(mouth);
    const bricksT = CTX(128, 64, c => { c.fillStyle = '#8a4a32'; c.fillRect(0, 0, 128, 64); c.strokeStyle = '#5a2e1e'; c.lineWidth = 3; for (let y = 0; y < 64; y += 16) { c.beginPath(); c.moveTo(0, y); c.lineTo(128, y); c.stroke(); for (let x = (y / 16) % 2 * 16; x < 128; x += 32) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 16); c.stroke(); } } });
    const bf = new T3.Mesh(new T3.PlaneGeometry(2.2, 2.6), new T3.MeshToonMaterial({ map: bricksT, gradientMap: ctx.grad })); bf.position.set(-0.2, 1.3, -1.545); g.add(bf); mouth.position.z = -1.53;
    // pivot post + arm + crucible over the line
    M(new T3.CylinderGeometry(0.12, 0.14, 4.0, 10), steel, 1.0, 2.0, -1.3, g, 0.012, 0.14); M(new T3.BoxGeometry(0.16, 0.16, 1.3), steel, 1.0, 3.95, -0.65, g, 0.012);
    const piv = new T3.Group(); piv.position.set(0.55, 3.45, 0); g.add(piv); Y.crucible = piv;
    M(new T3.BoxGeometry(0.1, 0.5, 0.1), steel, 0.45, 0.25, 0, piv, 0.01); M(new T3.BoxGeometry(0.5, 0.1, 0.1), steel, 0.2, 0.45, 0, piv, 0.01);
    const pot = M(new T3.CylinderGeometry(0.34, 0.26, 0.55, 16), toon('#3a3836'), 0, 0, 0, piv, 0.02, 0.34); const melt = new T3.Mesh(new T3.CircleGeometry(0.3, 16), new T3.MeshBasicMaterial({ color: 0xffa23a })); melt.rotation.x = -Math.PI / 2; melt.position.y = 0.26; piv.add(melt); Y.glow.push(melt);
    M(new T3.ConeGeometry(0.08, 0.14, 8), toon('#3a3836'), -0.35, 0.22, 0, piv, 0.006).rotation.z = Math.PI / 2;
    const stream = new T3.Mesh(new T3.CylinderGeometry(0.05, 0.035, 1, 8), new T3.MeshBasicMaterial({ color: 0xffb347 })); stream.visible = false; g.add(stream); Y.stream = stream;
    // ingot stack + tongs
    for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.5, 0.16, 0.22), steelL, -1.9 + (i % 2) * 0.1, 0.08 + i * 0.16, -1.3, g, 0.008).rotation.y = i % 2 ? 0.2 : -0.1;
    col(x - 1.4, x + 1.2, -3.3, -1.4); }
  // 2 FORGE: power hammer frame over the line + quench tank
  { const x = ST_X.forge, g = new T3.Group(); g.position.set(x, 0, 0); root.add(g); S.forge = g;
    for (const sx of [-0.95, 0.95]) M(new T3.BoxGeometry(0.34, 3.7, 0.5), toon('#2f3a44'), sx, 1.85, -0.95, g, 0.02);
    M(new T3.BoxGeometry(2.3, 0.6, 0.7), toon('#2f3a44'), 0, 3.8, -0.95, g, 0.02); M(new T3.BoxGeometry(2.3, 0.08, 0.72), yel, 0, 3.52, -0.95, g, 0);
    M(new T3.BoxGeometry(0.5, 0.9, 0.5), toon('#2f3a44'), 0, 3.6, -0.3, g, 0.02);
    const ram = new T3.Group(); ram.position.set(0, 3.0, 0); g.add(ram); Y.ram = ram; M(new T3.CylinderGeometry(0.08, 0.08, 1.2, 8), steelL, 0, 0.6, 0, ram, 0.006); M(new T3.BoxGeometry(0.75, 0.42, 0.62), toon('#3a3836'), 0, 0, 0, ram, 0.02); M(new T3.BoxGeometry(0.78, 0.07, 0.64), toon('#ec3013'), 0, 0.14, 0, ram, 0);
    M(new T3.BoxGeometry(1.4, 0.8, 0.9), toon('#3f5d6e'), 0.6, 0.4, -2.3, g, 0.02); const w = new T3.Mesh(new T3.PlaneGeometry(1.3, 0.8), new T3.MeshBasicMaterial({ color: 0x4fb0d4 })); w.rotation.x = -Math.PI / 2; w.position.set(0.6, 0.79, -2.3); g.add(w);
    M(new T3.BoxGeometry(0.6, 0.9, 0.5), toon('#3a3836'), -0.9, 0.45, -2.3, g, 0.015); M(new T3.CylinderGeometry(0.28, 0.32, 0.5, 14), toon('#4b5563'), -0.9, 1.15, -2.3, g, 0.015, 0.32);
    col(x - 1.4, x + 1.4, -2.9, -0.7); }
  // 3 WELD: amber curtain, gas bottles, welding arm
  { const x = ST_X.weld, g = new T3.Group(); g.position.set(x, 0, 0); root.add(g); S.weld = g;
    const cm = new T3.MeshToonMaterial({ color: '#d98a1a', gradientMap: ctx.grad, transparent: true, opacity: 0.7, side: T3.DoubleSide }); const cur = new T3.Mesh(new T3.PlaneGeometry(2.6, 2.4), cm); cur.position.set(0, 1.5, -1.3); g.add(cur);
    M(new T3.BoxGeometry(2.7, 0.08, 0.08), steel, 0, 2.72, -1.3, g, 0); for (const sx of [-1.3, 1.3]) M(new T3.BoxGeometry(0.08, 2.75, 0.08), steel, sx, 1.37, -1.3, g, 0);
    for (const [bx, c] of [[-0.9, '#2f6d36'], [-0.45, '#c42d3c']]) { M(new T3.CylinderGeometry(0.17, 0.17, 1.3, 12), toon(c), bx, 0.65, -2.0, g, 0.01, 0.17); M(new T3.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(c), bx, 1.3, -2.0, g, 0); M(new T3.CylinderGeometry(0.04, 0.04, 0.16, 6), steelL, bx, 1.52, -2.0, g, 0); }
    M(new T3.BoxGeometry(0.8, 0.6, 0.5), toon('#2f3a44'), 0.6, 0.3, -2.0, g, 0.015); M(new T3.BoxGeometry(0.5, 0.15, 0.04), new T3.MeshBasicMaterial({ color: 0x5cff8a }), 0.6, 0.45, -1.74, g, 0);
    col(x - 1.4, x + 1.4, -2.4, -1.2); }
  // 4 BOLT: drill press + bolt bins + tool board
  { const x = ST_X.bolt, g = new T3.Group(); g.position.set(x, 0, 0); root.add(g); S.bolt = g;
    M(new T3.BoxGeometry(0.9, 0.12, 0.8), toon('#2f3a44'), 0.7, 0.06, -2.0, g, 0.01); M(new T3.CylinderGeometry(0.08, 0.08, 2.4, 10), steelL, 0.7, 1.2, -2.2, g, 0.01, 0.08); M(new T3.BoxGeometry(0.5, 0.45, 0.8), toon('#c42d3c'), 0.7, 2.1, -1.95, g, 0.015); M(new T3.CylinderGeometry(0.03, 0.03, 0.4, 6), steelL, 0.7, 1.7, -1.7, g, 0);
    const binT = CTX(128, 64, c => { c.fillStyle = '#2563eb'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#f3f2f2'; c.font = '900 26px Archivo, Arial'; c.fillText('M12', 30, 42); });
    for (let i = 0; i < 6; i++) { const b = M(new T3.BoxGeometry(0.34, 0.22, 0.4), toon('#2563eb'), -1.1 + (i % 3) * 0.38, 0.9 + Math.floor(i / 3) * 0.26, -1.6, g, 0.008); }
    M(new T3.BoxGeometry(1.3, 0.8, 0.5), toon('#3a3f45'), -0.72, 0.4, -1.65, g, 0.015);
    const peg = CTX(256, 128, c => { c.fillStyle = '#c9a06a'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#9a7444'; for (let y = 8; y < 128; y += 14) for (let x = 8; x < 256; x += 14) c.fillRect(x, y, 2, 2); c.fillStyle = '#201e1d'; c.fillRect(20, 20, 10, 80); c.fillRect(10, 20, 30, 16); c.fillRect(60, 30, 80, 10); c.beginPath(); c.arc(180, 60, 26, 0, 7); c.lineWidth = 8; c.strokeStyle = '#201e1d'; c.stroke(); c.fillRect(220, 20, 10, 90); });
    const pb = new T3.Mesh(new T3.PlaneGeometry(2.2, 1.1), new T3.MeshBasicMaterial({ map: peg })); pb.position.set(-0.3, 2.2, -2.5); g.add(pb);
    col(x - 1.4, x + 1.2, -2.6, -1.35); }
  // 5 PAINT: spray booth with filter roof, camo test panels
  { const x = ST_X.paint, g = new T3.Group(); g.position.set(x, 0, 0); root.add(g); S.paint = g; const bm = toon('#d7dde3');
    M(new T3.BoxGeometry(2.8, 3.0, 0.12), bm, 0, 1.5, -1.5, g, 0.015); for (const sx of [-1.4, 1.4]) M(new T3.BoxGeometry(0.12, 3.0, 1.0), bm, sx, 1.5, -1.0, g, 0.012); M(new T3.BoxGeometry(2.9, 0.2, 1.1), toon('#9aa3ab'), 0, 3.1, -1.0, g, 0.012);
    const filt = CTX(128, 128, c => { c.fillStyle = '#9aa3ab'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#6b737b'; for (let y = 4; y < 128; y += 10) c.fillRect(4, y, 120, 4); }); const fp = new T3.Mesh(new T3.PlaneGeometry(2.0, 1.6), new T3.MeshBasicMaterial({ map: filt })); fp.position.set(0, 1.8, -1.43); g.add(fp);
    CK.forEach((k, i) => { const t = camoTex(CTX, k, 128); const p = new T3.Mesh(new T3.PlaneGeometry(0.42, 0.42), new T3.MeshBasicMaterial({ map: t })); p.position.set(-0.9 + i * 0.6, 2.75, -1.42); g.add(p); });
    for (let i = 0; i < 3; i++) M(new T3.CylinderGeometry(0.16, 0.16, 0.34, 12), toon(['#c9a86a', '#5b7a3a', '#2c3a56'][i]), -0.9 + i * 0.36, 0.17, -2.0, g, 0.008, 0.16);
    col(x - 1.5, x + 1.5, -2.3, -0.9); }
  // 6 STAMP: QC desk + approved board, then the shipping counter
  { const x = ST_X.stamp, g = new T3.Group(); g.position.set(x, 0, 0); root.add(g); S.stamp = g;
    M(new T3.BoxGeometry(1.8, 0.95, 0.9), toon('#3a3f45'), 0, 0.475, -1.6, g, 0.015); M(new T3.BoxGeometry(1.9, 0.06, 1.0), toon('#9aa3ab'), 0, 0.97, -1.6, g, 0.006);
    M(new T3.BoxGeometry(0.4, 0.06, 0.3), toon('#ec3013'), -0.5, 1.03, -1.6, g, 0.006); M(new T3.BoxGeometry(0.5, 0.03, 0.35), toon('#f3f2f2'), 0.3, 1.02, -1.55, g, 0.004);
    const qcT = CTX(256, 256, c => { c.fillStyle = '#f3f2f2'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#ec3013'; c.lineWidth = 14; c.strokeRect(20, 20, 216, 216); c.fillStyle = '#ec3013'; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.fillText('QC', 128, 110); c.font = '900 30px Archivo, Arial'; c.fillText('APPROVED', 128, 170); });
    const qb = new T3.Mesh(new T3.PlaneGeometry(0.9, 0.9), new T3.MeshBasicMaterial({ map: qcT })); qb.position.set(0, 2.2, -2.0); g.add(qb);
    col(x - 1.0, x + 1.0, -2.1, -1.1); }
  // shipping counter + crate stack at the end of the line
  { const cx = 12.5; M(new T3.BoxGeometry(1.4, 1.05, 2.6), toon('#7a5a3a'), cx, 0.525, 1.4, root, 0.02); M(new T3.BoxGeometry(1.5, 0.08, 2.7), toon('#b8945f'), cx, 1.07, 1.4, root, 0.01);
    const shipT = CTX(256, 96, c => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, 256, 96); c.fillStyle = '#fff'; c.font = '900 50px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText('PICK-UP', 18, 50); }); const sp = new T3.Mesh(new T3.PlaneGeometry(1.1, 0.41), new T3.MeshBasicMaterial({ map: shipT })); sp.position.set(13.9, 3.2, 1.4); sp.rotation.y = -Math.PI / 2; root.add(sp);
    for (const [px, pz, py] of [[13.3, -0.6, 0.35], [13.3, -1.4, 0.35], [13.3, -1.0, 1.05]]) M(new T3.BoxGeometry(0.7, 0.7, 0.7), toon('#b8945f'), px, py, pz, root, 0.015);
    col(cx - 0.72, cx + 0.72, 0.1, 2.7); col(12.9, 13.8, -1.8, -0.2); }
  Y.crateSpot = { x: 12.5, y: 1.11, z: 1.0 };
  // Sgt. Tread's desk + chalk board (front left)
  { M(new T3.BoxGeometry(1.8, 0.85, 0.9), toon('#5b6b3a'), -11.4, 0.425, 3.0, root, 0.02); M(new T3.BoxGeometry(1.9, 0.07, 1.0), toon('#3f4a28'), -11.4, 0.88, 3.0, root, 0.01); M(new T3.BoxGeometry(0.3, 0.32, 0.24), ink, -11.9, 1.07, 2.9, root, 0.01); M(new T3.CylinderGeometry(0.08, 0.07, 0.18, 10), toon('#f3f2f2'), -10.9, 1.0, 2.8, root, 0.006, 0.08);
    const bc = document.createElement('canvas'); bc.width = 512; bc.height = 384; const bt = new T3.CanvasTexture(bc); bt.colorSpace = T3.SRGBColorSpace; Y.boardCv = bc; Y.boardTex = bt;
    const bd = new T3.Mesh(new T3.PlaneGeometry(2.6, 1.95), new T3.MeshBasicMaterial({ map: bt })); bd.position.set(HALL.x0 + 0.08, 2.4, 3.0); bd.rotation.y = Math.PI / 2; root.add(bd); M(new T3.BoxGeometry(0.06, 2.1, 2.75), toon('#7a5a3a'), HALL.x0 + 0.04, 2.4, 3.0, root, 0.008);
    col(-12.35, -10.45, 2.5, 3.5); }
  Y.drawBoard = (lines) => { const c = Y.boardCv.getContext('2d'); c.fillStyle = '#2f3b33'; c.fillRect(0, 0, 512, 384); c.strokeStyle = '#c9a06a'; c.lineWidth = 12; c.strokeRect(6, 6, 500, 372); c.fillStyle = '#f3f2f2'; c.font = '900 40px Archivo, Arial'; c.fillText('TODAY', 34, 66); c.fillStyle = '#ffd23a'; c.fillRect(34, 80, 150, 5); c.font = '800 30px Archivo, Arial'; lines.forEach((l, i) => { c.fillStyle = l[1] || '#f3f2f2'; c.fillText(l[0], 34, 134 + i * 46); }); Y.boardTex.needsUpdate = true; };
  Y.drawBoard([['SAFETY FIRST'], ['GOGGLES ON'], ['MEASURE TWICE'], ['- SGT. TREAD', '#ffd23a']]);
  // finished tank on show (back right, behind the line)
  { const vk = vehicleKit({ THREE: T3, M, toon }), tk = vk.make('tank'); tk.position.set(10.0, 0, -5.4); tk.rotation.y = -Math.PI / 2; root.add(tk); Y.tank = tk;
    M(new T3.BoxGeometry(6.0, 0.1, 4.0), toon('#4b5563'), 10.0, 0.05, -5.4, root, 0); col(7.2, 12.8, -7.2, -3.6);
    const pl = CTX(512, 128, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#ffd23a'; c.font = '900 46px Archivo, Arial'; c.fillText('MK-8 · BUILT HERE', 22, 80); }); const pm = new T3.Mesh(new T3.PlaneGeometry(2.2, 0.55), new T3.MeshBasicMaterial({ map: pl })); pm.position.set(10, 0.6, -3.3); pm.rotation.x = -0.4; root.add(pm); }
  // oil drums + spare tread coil (front right corner, decor)
  for (const [x, z, c] of [[13.2, 4.8, '#c42d3c'], [12.6, 5.5, '#2f6d36'], [13.3, 5.7, '#c42d3c']]) { M(new T3.CylinderGeometry(0.32, 0.32, 0.9, 14), toon(c), x, 0.45, z, root, 0.012, 0.32); col(x - 0.35, x + 0.35, z - 0.35, z + 0.35); }
  { const t = M(new T3.TorusGeometry(0.55, 0.16, 8, 20), toon('#1f2023'), -12.8, 0.18, 6.2, root, 0.012); t.rotation.x = Math.PI / 2; col(-13.5, -12.1, 5.5, 6.9); }

  // ---- polish: columns, pipes, posters, clock, extinguishers, floor bays + stains, light shafts, dust ----
  { const colM = toon('#4b5563'), baseM = toon('#f2c94c');
    for (let x = -12; x <= 12; x += 4) { M(new T3.BoxGeometry(0.36, HALL.h, 0.36), colM, x, HALL.h / 2, HALL.z0 + 0.25, root, 0.015); M(new T3.BoxGeometry(0.44, 0.5, 0.44), baseM, x, 0.25, HALL.z0 + 0.25, root, 0.01); }
    // pipes along the back wall + drops
    const pipe = (y, z, r, c) => { const m = M(new T3.CylinderGeometry(r, r, HALL.x1 - HALL.x0 - 0.6, 12).rotateZ(Math.PI / 2), toon(c), 0, y, z, root, 0.01, r); for (let x = -12.5; x <= 12.5; x += 2.5) M(new T3.BoxGeometry(0.08, 0.06, r * 2 + 0.24), steel, x, y, z, root, 0); return m; };
    pipe(5.05, HALL.z0 + 0.5, 0.11, '#b8452f'); pipe(4.7, HALL.z0 + 0.48, 0.07, '#9aa3ab'); pipe(4.45, HALL.z0 + 0.46, 0.06, '#2f6d36');
    for (const x of [-9.6, -5.8, 5.8]) { M(new T3.CylinderGeometry(0.07, 0.07, 4.45, 10), toon('#9aa3ab'), x, 2.22, HALL.z0 + 0.48, root, 0.008, 0.07); M(new T3.CylinderGeometry(0.14, 0.14, 0.18, 10), toon('#ec3013'), x, 1.6, HALL.z0 + 0.48, root, 0.006, 0.14); }
    // posters
    const poster = (x, y, z, ry, w, h, draw) => { const t = CTX(256, Math.round(256 * h / w), c => draw(c, 256, Math.round(256 * h / w))); const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: t })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };
    poster(-7.6, 2.9, HALL.z0 + 0.07, 0, 1.3, 1.7, (c, w, h) => { c.fillStyle = '#f2c94c'; c.fillRect(0, 0, w, h); c.fillStyle = '#201e1d'; c.fillRect(10, 10, w - 20, 70); c.fillStyle = '#f2c94c'; c.font = '900 40px Archivo, Arial'; c.fillText('SAFETY', 30, 60); c.fillStyle = '#201e1d'; c.font = '900 30px Archivo, Arial'; c.fillText('DAYS WITHOUT', 22, 130); c.fillText('AN ACCIDENT', 26, 166); c.fillStyle = '#fff'; c.fillRect(48, 186, 160, 110); c.fillStyle = '#ec3013'; c.font = '900 100px Archivo, Arial'; c.fillText('08', 70, 280); });
    poster(3.8, 3.0, HALL.z0 + 0.07, 0, 1.2, 1.2, (c, w, h) => { c.fillStyle = '#1f3a5f'; c.fillRect(0, 0, w, h); c.strokeStyle = '#fff'; c.lineWidth = 10; c.beginPath(); c.ellipse(90, 110, 40, 30, 0, 0, 7); c.ellipse(170, 110, 40, 30, 0, 0, 7); c.stroke(); c.fillRect(128, 104, 4, 4); c.fillStyle = '#fff'; c.font = '900 38px Archivo, Arial'; c.fillText('GOGGLES', 44, 196); c.fillText('ON!', 100, 236); });
    poster(HALL.x1 - 0.07, 3.1, -4.6, -Math.PI / 2, 1.4, 1.0, (c, w, h) => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, w, h); c.fillStyle = '#ec3013'; c.fillRect(0, 0, w, 40); c.fillStyle = '#fff'; c.font = '900 28px Archivo, Arial'; c.fillText('MK-8 SPEC', 12, 30); c.fillStyle = '#ffd23a'; c.font = '800 20px Archivo, Arial'; ['12 ROAD WHEELS', '6 ARMOUR PLATES', '1 TURRET HATCH', '1 GUN BARREL'].forEach((t, i) => c.fillText('▸ ' + t, 14, 76 + i * 30)); });
    // clock
    { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const ct = new T3.CanvasTexture(cv); ct.colorSpace = T3.SRGBColorSpace; const cm = new T3.Mesh(new T3.CircleGeometry(0.42, 28), new T3.MeshBasicMaterial({ map: ct })); cm.position.set(-1.2, 4.0, HALL.z0 + 0.08); root.add(cm); M(new T3.TorusGeometry(0.43, 0.04, 6, 28), ink, -1.2, 4.0, HALL.z0 + 0.1, root, 0);
      Y.drawClock = (hr, mn) => { const c = cv.getContext('2d'); c.fillStyle = '#fbfbf7'; c.beginPath(); c.arc(64, 64, 64, 0, 7); c.fill(); c.fillStyle = '#201e1d'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillRect(64 + Math.sin(a) * 50 - 3, 64 - Math.cos(a) * 50 - 3, 6, 6); } c.lineCap = 'round'; const hand = (a, l, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.sin(a) * l, 64 - Math.cos(a) * l); c.stroke(); }; hand((hr % 12 + mn / 60) / 12 * Math.PI * 2, 30, 7, '#201e1d'); hand(mn / 60 * Math.PI * 2, 44, 4, '#ec3013'); ct.needsUpdate = true; }; Y.drawClock(10, 8); }
    // fire extinguishers
    for (const [x, z] of [[-12.6, HALL.z0 + 0.5], [4.9, HALL.z0 + 0.5], [13.6, 3.6]]) { M(new T3.CylinderGeometry(0.12, 0.12, 0.55, 12), toon('#ec3013'), x, 0.85, z, root, 0.008, 0.12); M(new T3.CylinderGeometry(0.05, 0.05, 0.1, 8), ink, x, 1.17, z, root, 0); M(new T3.BoxGeometry(0.4, 0.5, 0.02), new T3.MeshBasicMaterial({ color: 0xec3013 }), x, 1.75, z + (z > 0 ? 0 : -0.2), root, 0); }
    // floor: painted station bays, oil stains, drain grates
    const bay = (x0, x1, z0, z1) => { for (const [a, b, c, d] of [[x0, x1, z0, z0 + 0.07], [x0, x1, z1 - 0.07, z1], [x0, x0 + 0.07, z0, z1], [x1 - 0.07, x1, z0, z1]]) stripe(a, b, c, d, yb); };
    for (const k of Object.keys(ST_X)) bay(ST_X[k] - 1.55, ST_X[k] + 1.55, -2.95, -0.8);
    bay(7.0, 13.0, -7.5, -3.3);
    const stainT = CTX(128, 128, c => { const g = c.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(30,26,22,0.55)'); g.addColorStop(0.6, 'rgba(30,26,22,0.25)'); g.addColorStop(1, 'rgba(30,26,22,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(64, 64, 62, 46, 0.3, 0, 7); c.fill(); });
    const stM = new T3.MeshBasicMaterial({ map: stainT, transparent: true, depthWrite: false });
    for (const [x, z, s] of [[-5.2, 2.3, 1.4], [2.6, 4.4, 1.0], [9.8, 2.2, 1.6], [-10.5, 5.6, 0.9], [0.5, 1.8, 0.8]]) { const m = new T3.Mesh(new T3.PlaneGeometry(s, s * 0.8), stM); m.rotation.x = -Math.PI / 2; m.rotation.z = s; m.position.set(x, 0.014, z); root.add(m); }
    const grT = CTX(128, 64, c => { c.fillStyle = '#3a3f45'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#16181b'; for (let x = 8; x < 128; x += 12) c.fillRect(x, 8, 6, 48); });
    for (const x of [-7.2, 0, 7.2]) { const m = new T3.Mesh(new T3.PlaneGeometry(1.2, 0.5), new T3.MeshBasicMaterial({ map: grT })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.016, 4.2); root.add(m); }
    // light shafts from the back windows + dust
    const shM = new T3.MeshBasicMaterial({ color: 0xfff1c4, transparent: true, opacity: 0.07, depthWrite: false, side: T3.DoubleSide, blending: T3.AdditiveBlending }); Y.shaftM = shM;
    for (let k = HALL.x0 + 3; k < HALL.x1 - 2; k += 4.5) { const g = new T3.PlaneGeometry(1.5, 6.2); const m = new T3.Mesh(g, shM); m.position.set(k + 0.6, 3.0, HALL.z0 + 2.0); m.rotation.x = -0.62; root.add(m); }
    const dn = 140, dp = new Float32Array(dn * 3); for (let i = 0; i < dn; i++) { dp[i * 3] = rr(HALL.x0 + 1, HALL.x1 - 1); dp[i * 3 + 1] = rr(0.5, 6); dp[i * 3 + 2] = rr(HALL.z0 + 0.5, HALL.z1 - 1); }
    const dg = new T3.BufferGeometry(); dg.setAttribute('position', new T3.BufferAttribute(dp, 3)); Y.dust = new T3.Points(dg, new T3.PointsMaterial({ color: 0xfff6dc, size: 0.05, transparent: true, opacity: 0.55, depthWrite: false })); root.add(Y.dust);
  }

  // soft shading where walls and machines meet the floor (reads as ambient occlusion on phones without shadows)
  { const aoT = CTX(4, 64, c => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(20,18,16,0.45)'); g.addColorStop(1, 'rgba(20,18,16,0)'); c.fillStyle = g; c.fillRect(0, 0, 4, 64); }), aoM = new T3.MeshBasicMaterial({ map: aoT, transparent: true, depthWrite: false });
    const strip = (x, z, w, ry) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, 1.1), aoM); m.rotation.set(-Math.PI / 2, 0, ry); m.position.set(x, 0.013, z); root.add(m); };
    strip(0, HALL.z0 + 0.55, HALL.x1 - HALL.x0, 0); strip(HALL.x0 + 0.55, (HALL.z0 + HALL.z1) / 2, HALL.z1 - HALL.z0, -Math.PI / 2); strip(HALL.x1 - 0.55, (HALL.z0 + HALL.z1) / 2, HALL.z1 - HALL.z0, Math.PI / 2);
    Y.blobT = CTX(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(15,13,12,0.5)'); g.addColorStop(1, 'rgba(15,13,12,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
    const blob = (x, z, w, d) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, d), new T3.MeshBasicMaterial({ map: Y.blobT, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z); root.add(m); };
    for (const k of Object.keys(ST_X)) blob(ST_X[k], -1.9, 3.6, 2.4); blob(-11.4, 3.0, 2.6, 1.6); blob(12.5, 1.4, 2.0, 3.4); blob(10, -5.4, 6.4, 4.4); blob(0, 0, 26, 2.2); }
  // spots (local to the hall)
  Y.spots = { ben: { x: -9.6, z: 3.4 }, tread: { x: -11.4, z: 3.9 }, treadWatch: { x: -10.3, z: 3.8 }, counter: { x: 12.5, z: 3.25 }, door: { x: 8, z: HALL.z1 - 0.7 }, walkIn: { x: 6.5, z: 4.8 } };
  Y.overhead = root.children.filter(o => o.position.y > 5.4 && o.name !== 'sign' && !Y.walls.some(w => w.g === o) && o !== Y.dust);
  Y.stations = ST_X; Y.lineY = LY; Y.bounds = { x0: HALL.x0 + 0.5 + origin.x, x1: HALL.x1 - 0.5 + origin.x, z0: HALL.z0 + 0.5 + origin.z, z1: HALL.z1 - 0.5 + origin.z };
  Y.walk = (x, z) => x > Y.bounds.x0 && x < Y.bounds.x1 && z > Y.bounds.z0 && z < Y.bounds.z1 && !Y.colliders.some(c => x > c[0] && x < c[1] && z > c[2] && z < c[3]);
  return Y;
}

// Ambient life for a world's copy of the hall: call every frame while the player is inside (cheap).
// animateWorks(Y, t, dt, camera) → furnace flicker, drifting dust, breathing light shafts, walls on the camera side hidden, roof hidden from high cameras.
export function animateWorks(Y, t, dt, camera) {
  Y.glow.forEach((g, i) => g.material.color.setHSL(0.07 + Math.sin(t * 6 + i) * 0.01, 1, 0.55 + Math.sin(t * 8 + i) * 0.04));
  const dp = Y.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i++) { let y = dp.getY(i) + dt * 0.05; if (y > 6.2) y = 0.4; dp.setY(i, y); } dp.needsUpdate = true; Y.shaftM.opacity = 0.06 + Math.sin(t * 0.4) * 0.015;
  if (camera) { const c = camera.position; for (const w of Y.walls) w.g.visible = w.axis === 'z' ? (w.side > 0 ? c.z > w.at : c.z < w.at) : (w.side > 0 ? c.x > w.at : c.x < w.at); const top = c.y > 5.0 + (Y.root.position.y || 0); Y.overhead.forEach(o => o.visible = !top); }
}

export function camoTex(CTX, key, size = 512) {
  const C = CAMO[key].cols; let seed = key.length * 977 + size; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  return CTX(size, size, c => { c.fillStyle = C[0]; c.fillRect(0, 0, size, size); const s = size / 512;
    for (const [cc, n, r] of [[C[1], 26, 46], [C[2], 22, 34]]) { c.fillStyle = cc; for (let i = 0; i < n; i++) { const x = rnd() * size, y = rnd() * size; for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(x + (rnd() - 0.5) * 60 * s, y + (rnd() - 0.5) * 40 * s, (r * 0.6 + rnd() * r) * s, (r * 0.4 + rnd() * r * 0.6) * s, rnd() * 3, 0, 7); c.fill(); } } } });
}

// ================= one part on its cradle =================
let PART_ID = 1;
function makePart(ST, type, job) {
  const { M, toon, addOutline, scene, V3, grad } = ST, g = new THREE.Group(); scene.add(g);
  const P = { id: PART_ID++, type, D: PARTS[type], g, job, seams: [], bolts: [], samples: [], beads: [], splats: [] };
  // cradle (moves down the line with the part)
  M(new THREE.BoxGeometry(1.5, 0.12, 0.9), toon('#2f3a44'), 0, 0.06, 0, g, 0.012); M(new THREE.BoxGeometry(1.52, 0.03, 0.92), toon('#f2c94c'), 0, 0.125, 0, g, 0);
  for (const sx of [-0.5, 0.5]) M(new THREE.BoxGeometry(0.08, 0.32, 0.08), toon('#3a3836'), sx, 0.28, -0.3, g, 0.006);
  // the paint skin: one canvas the camo is sprayed onto
  const pc = document.createElement('canvas'); pc.width = pc.height = 256; const px = pc.getContext('2d'); px.fillStyle = '#8b9096'; px.fillRect(0, 0, 256, 256); for (let i = 0; i < 260; i++) { px.fillStyle = Math.random() < 0.5 ? 'rgba(60,64,70,0.25)' : 'rgba(200,205,210,0.18)'; px.fillRect(Math.random() * 256, Math.random() * 256, 2 + Math.random() * 7, 1 + Math.random() * 3); }
  const ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace; P.pc = pc; P.ptex = ptex;
  const mat = new THREE.MeshToonMaterial({ map: ptex, gradientMap: grad, emissive: new THREE.Color('#ff3a00'), emissiveIntensity: 0 }); P.mat = mat;
  const dark = toon('#3a3f45'), rubber = toon('#1f2023');
  const body = new THREE.Group(); g.add(body); P.body = body; const paintable = []; P.paintable = paintable;
  const PM = (geo, x, y, z) => { const m = M(geo, mat, x, y, z, body, 0.025); paintable.push(m); return m; };
  const seamLine = (a, b, n) => { const o = []; for (let i = 0; i <= n; i++) o.push(V3().lerpVectors(a, b, i / n)); return o; };
  const seamArc = (cx, cy, cz, r, a0, a1, n, axis = 'x') => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push(axis === 'x' ? V3(cx, cy + Math.sin(a) * r, cz + Math.cos(a) * r) : V3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, cz)); } return o; };
  const disc = (r, zf) => { const o = []; for (let y = -r; y <= r + 1e-6; y += r / 3) for (let x = -r; x <= r + 1e-6; x += r / 3) if (x * x + y * y <= r * r * 1.02) o.push(V3(x, y, zf)); return o; };
  if (type === 'wheel') { const cy = 0.62, R = 0.55; body.position.y = 0.12 + cy; P.h = 2 * R;
    PM(new THREE.CylinderGeometry(R, R, 0.24, 32).rotateX(Math.PI / 2), 0, 0, 0);
    M(new THREE.TorusGeometry(R, 0.075, 8, 32), rubber, 0, 0, 0, body, 0.012);
    M(new THREE.CylinderGeometry(0.19, 0.19, 0.36, 18).rotateX(Math.PI / 2), dark, 0, 0, 0, body, 0.012, 0.19);
    for (let k = 0; k < 5; k++) { const a = Math.PI / 2 + k * Math.PI * 2 / 5; P.bolts.push({ p: V3(Math.cos(a) * 0.33, Math.sin(a) * 0.33, 0.125) }); }
    P.stampAt = V3(0, -0.4, 0.125); P.samples = disc(0.48, 0.12); P.uvSpan = [1.1, 1.1]; P.lump = [1.14, 0.84, 1.35]; }
  else if (type === 'plate') { const cy = 0.6; body.position.y = 0.12 + cy; P.h = 0.92;
    PM(new THREE.BoxGeometry(1.4, 0.92, 0.14), 0, 0, 0);
    const br = PM(new THREE.BoxGeometry(0.5, 0.22, 0.22), 0, 0.2, 0.18); br.visible = false; P.extra = br;
    const nS = job.day <= 2 ? 2 : 3; P.seams.push(seamLine(V3(-0.27, 0.075, 0.08), V3(0.27, 0.075, 0.08), 12)); P.seams.push(seamLine(V3(-0.27, 0.075, 0.08), V3(-0.27, 0.33, 0.08), 7)); if (nS > 2) P.seams.push(seamLine(V3(0.27, 0.075, 0.08), V3(0.27, 0.33, 0.08), 7));
    for (const [x, y] of [[-0.56, 0.33], [0.56, 0.33], [-0.56, -0.33], [0.56, -0.33]]) P.bolts.push({ p: V3(x, y, 0.072) });
    P.stampAt = V3(0.05, -0.2, 0.072); for (let y = -0.38; y <= 0.4; y += 0.19) for (let x = -0.62; x <= 0.63; x += 0.207) if (!(Math.abs(x) < 0.3 && y > 0.05 && y < 0.33)) P.samples.push(V3(x, y, 0.07)); P.uvSpan = [1.4, 0.92]; P.lump = [0.84, 1.22, 1.7]; }
  else if (type === 'hatch') { const cy = 0.66; body.position.y = 0.12 + cy; P.h = 1.16;
    PM(new THREE.CylinderGeometry(0.56, 0.58, 0.14, 32).rotateX(Math.PI / 2), 0, 0, 0);
    const hg = PM(new THREE.BoxGeometry(0.62, 0.14, 0.16), 0, 0.43, 0.13); hg.visible = false; const hd = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 6, 14, Math.PI), dark); hd.position.set(0, -0.26, 0.09); addOutline(hd, 0.006, 0.16); hd.visible = false; body.add(hd); P.extra = hg; P.extra2 = hd;
    P.seams.push(seamLine(V3(-0.33, 0.35, 0.075), V3(0.33, 0.35, 0.075), 14)); P.seams.push(seamLine(V3(-0.2, -0.29, 0.075), V3(0.2, -0.29, 0.075), 8));
    for (const a of [20, 160, 200, 250, 290, 340]) { const r = a * Math.PI / 180; P.bolts.push({ p: V3(Math.cos(r) * 0.46, Math.sin(r) * 0.46, 0.072) }); }
    P.stampAt = V3(0, 0.06, 0.072); P.samples = disc(0.5, 0.07); P.uvSpan = [1.15, 1.15]; P.lump = [1.16, 0.86, 1.7]; }
  else { const cy = 0.42; body.position.y = 0.12 + cy; P.h = 0.4;
    PM(new THREE.CylinderGeometry(0.16, 0.19, 1.9, 24).rotateZ(Math.PI / 2), 0, 0, 0);
    const mb = PM(new THREE.BoxGeometry(0.3, 0.3, 0.34), 1.08, 0, 0); mb.visible = false; const cl = PM(new THREE.CylinderGeometry(0.235, 0.235, 0.14, 20).rotateZ(Math.PI / 2), -0.88, 0, 0); cl.visible = false; P.extra = mb; P.extra2 = cl;
    P.seams.push(seamArc(0.93, 0, 0, 0.2, -1.25, 1.25, 12)); P.seams.push(seamArc(-0.8, 0, 0, 0.215, -1.25, 1.25, 12));
    P.stampAt = V3(0.25, 0.0, 0.19); for (let x = -0.8; x <= 0.81; x += 0.2) for (const a of [-0.8, 0, 0.8]) P.samples.push(V3(x, Math.sin(a) * 0.18, Math.cos(a) * 0.18)); P.uvSpan = [1.1, 1.9]; P.lump = [0.8, 1.4, 1.4]; }
  P.top = body.position.y + P.h / 2 + (type === 'hatch' ? 0.07 : 0);
  // seam markers (dashed glow) — beads are added as you weld
  P.seamMk = P.seams.map(s => { const grp = new THREE.Group(); body.add(grp); s.forEach((p, i) => { if (i % 2) return; const d = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.01), new THREE.MeshBasicMaterial({ color: 0xffd23a })); d.position.copy(p); grp.add(d); }); grp.visible = false; return grp; });
  P.seamProg = P.seams.map(() => 0); P.seamDone = P.seams.map(() => false);
  // bolts: a red drill mark, then a hole + loose bolt, then tight
  for (const b of P.bolts) { const grp = new THREE.Group(); grp.position.copy(b.p); body.add(grp);
    const mk = new THREE.Mesh(new THREE.RingGeometry(0.035, 0.055, 16), new THREE.MeshBasicMaterial({ color: 0xec3013 })); mk.position.z = 0.003; grp.add(mk);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), new THREE.MeshBasicMaterial({ color: 0x111111 })); hole.position.z = 0.002; hole.visible = false; grp.add(hole);
    const bolt = new THREE.Group(); bolt.visible = false; grp.add(bolt); const hx = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 6).rotateX(Math.PI / 2), toon('#c9ced3')); addOutline(hx, 0.005, 0.05); hx.position.z = 0.025; bolt.add(hx); const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.1, 8).rotateX(Math.PI / 2), toon('#9aa3ab')); sh.position.z = -0.02; bolt.add(sh);
    const wsh = new THREE.Mesh(new THREE.RingGeometry(0.03, 0.065, 16), toon('#b8bec4')); wsh.position.z = 0.004; wsh.visible = false; grp.add(wsh);
    Object.assign(b, { grp, mk, hole, bolt, hx, wsh, st: job.tasks.includes('bolt') ? 'mark' : 'tight', v: 0, q: 1, drillT: 0 });
    if (b.st === 'tight') { mk.visible = false; hole.visible = true; bolt.visible = true; wsh.visible = true; } }
  // QC stamp decal
  const stT = canvasTex(256, 128, c => { c.clearRect(0, 0, 256, 128); c.strokeStyle = '#ec3013'; c.lineWidth = 10; c.strokeRect(8, 8, 240, 112); c.fillStyle = '#ec3013'; c.font = '900 44px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('QC ✓ TREAD', 128, 54); c.font = '800 22px Archivo, Arial'; c.fillText('TANK WORKS · MERU', 128, 96); });
  P.decal = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.17), new THREE.MeshBasicMaterial({ map: stT, transparent: true, opacity: 0, depthWrite: false })); P.decal.position.copy(P.stampAt).add(V3(0, 0, 0.006)); body.add(P.decal);
  P.cast = job.tasks.includes('cast') ? 'empty' : 'done'; P.fill = 0; P.pours = 0; P.castQ = 1;
  P.forge = { hits: 0, need: job.day >= 3 ? 5 : 4, miss: 0, perf: 0 }; P.paintCov = P.samples.map(() => null); P.stamp = { done: !job.tasks.includes('stamp'), q: 1 };
  if (job.tasks.includes('forge')) body.scale.set(...P.lump);
  if (!job.tasks.includes('weld')) { [P.extra, P.extra2].forEach(e => e && (e.visible = true)); P.seamDone = P.seams.map(() => true); P.seamProg = P.seams.map(s => s.length - 1); }
  if (P.cast === 'empty') body.visible = false;
  return P;
}

// ================= the stand-alone game =================
export async function createTankWorks({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#c9d3d8' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#9fb4c2'); gr.addColorStop(1, '#d8dfe2'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); }); scene.fog = new THREE.Fog('#c9d3d8', 30, 70);
  const Y = buildWorks({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline });
  const fireL = new THREE.PointLight(0xff7a2a, 2.2, 9, 1.6); fireL.position.set(ST_X.cast - 0.2, 1.6, -1.2); scene.add(fireL);
  // ---------- SOUND: a small synth for the factory (no audio files) ----------
  // Bus: every voice → (pan) → dry + hall reverb send → compressor → master. Music runs on its own gain into the same compressor.
  // SFX.at(x) sets the stereo position for the next sounds from a world x (left/right of the camera), so stations are heard where they are.
  const SFX = (() => {
    const A = () => (audio.ctx && !audio.muted ? audio.ctx : null); let bus = null, rev = null, mus = null, amb = null, panX = 0; const loops = {};
    function chain() { const c = audio.ctx; if (!c) return null; if (bus) return bus; const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.2; comp.connect(audio.master);
      bus = c.createGain(); bus.gain.value = 1; bus.connect(comp);
      const len = Math.floor(c.sampleRate * 2.2), ir = c.createBuffer(2, len, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) { const k = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 3.2) * (i < c.sampleRate * 0.012 ? 0.3 : 1); } }
      const conv = c.createConvolver(); conv.buffer = ir; const rlp = c.createBiquadFilter(); rlp.type = 'lowpass'; rlp.frequency.value = 3800; rev = c.createGain(); rev.gain.value = 0.5; rev.connect(conv); conv.connect(rlp); rlp.connect(comp);
      mus = c.createGain(); mus.gain.value = MUS.on ? MUS.vol : 0; mus.connect(comp); return bus; }
    const env = (g, t, a, v, d) => { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); };
    function route(c, node, wet, pan, dest) { let n = node; if (pan && c.createStereoPanner) { const p = c.createStereoPanner(); p.pan.value = clamp(pan, -0.9, 0.9); node.connect(p); n = p; } n.connect(dest || bus); if (wet > 0 && !dest) { const w = c.createGain(); w.gain.value = wet; n.connect(w); w.connect(rev); } }
    function osc(type, f0, f1, dur, vol, dl = 0, o2 = {}) { const c = A(); if (!c || !chain()) return; const t = Math.max(c.currentTime, c.currentTime + dl), o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(Math.min(15000, f0), t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.min(15000, Math.max(1, f1)), t + dur); if (o2.det) o.detune.value = o2.det; const att = o2.att || 0.004; env(g, t, att, vol, dur); o.connect(g);
      if (o2.lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(o2.lp, t); if (o2.lp2) f.frequency.exponentialRampToValueAtTime(o2.lp2, t + dur); f.Q.value = o2.q || 1; g.connect(f); route(c, f, o2.wet ?? 0.15, o2.pan ?? panX, o2.mus ? mus : null); } else route(c, g, o2.wet ?? 0.15, o2.pan ?? panX, o2.mus ? mus : null); o.start(t); o.stop(t + dur + att + 0.05); }
    function nz(dur, type, f0, f1, q, vol, dl = 0, o2 = {}) { const c = A(); if (!c || !audio.noise || !chain()) return; const t = Math.max(c.currentTime, c.currentTime + dl), s = c.createBufferSource(), b = c.createBiquadFilter(), g = c.createGain(); s.buffer = audio.noise; b.type = type; b.Q.value = q; b.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) b.frequency.exponentialRampToValueAtTime(f1, t + dur); env(g, t, o2.att || 0.002, vol, dur); s.connect(b); b.connect(g); route(c, g, o2.wet ?? 0.15, o2.pan ?? panX, o2.mus ? mus : null); s.start(t, Math.random()); s.stop(t + dur + 0.06); }
    // struck metal: inharmonic partials, slightly detuned pairs + a bright noise click
    const metal = (f, dur, vol, dl = 0, wet = 0.35) => { nz(0.012, 'highpass', 5000, 5000, 0.7, vol * 0.8, dl, { wet }); [[1, 1], [2.76, 0.55], [5.4, 0.3], [8.93, 0.16], [13.3, 0.07]].forEach(([k, a]) => { if (f * k < 14000) { osc('sine', f * k, f * k * 0.996, dur / Math.sqrt(k), vol * a, dl, { wet }); osc('sine', f * k * 1.004, f * k, dur / Math.sqrt(k) * 0.8, vol * a * 0.4, dl, { wet }); } }); };
    function setLoop(key, vol, build, mod) { const c = A(); if (!c || !chain()) return; let L = loops[key]; if (!L && vol > 0) { const g = c.createGain(); g.gain.value = 0.0001; route(c, g, 0.12, 0); L = loops[key] = { g, parts: build(c, g) }; } if (!L) return; L.g.gain.setTargetAtTime(Math.max(0.0001, vol), c.currentTime, vol > 0 ? 0.03 : 0.08); if (mod) mod(L.parts, c.currentTime); }
    const noiseSrc = (c, filters, dest) => { const s = c.createBufferSource(); s.buffer = audio.noise; s.loop = true; let n = s; for (const f of filters) { n.connect(f); n = f; } n.connect(dest); s.start(0, Math.random()); return s; };
    const bq = (c, type, f, q = 0.7) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
    let stepAlt = 0;
    // ---------- MUSIC: "Line Shift" — a looping factory groove (Em · C · Am · B7), anvil percussion, bass, chord stabs, a little lead ----------
    const MUS = { on: (() => { try { return localStorage.getItem('tank.works.music') !== '0'; } catch (e) { return true; } })(), vol: 0.5, mood: 'chill', next: 0, step: 0, bar: 0, iv: null };
    const BPM = 98, SIX = 60 / BPM / 4, CH = [[64, 67, 71, 74], [60, 64, 67, 71], [57, 60, 64, 67], [59, 63, 66, 69]], BASS = [40, 36, 33, 35], mtof = m => 440 * Math.pow(2, (m - 69) / 12);
    const LEAD = [[0, 76], [3, 79], [6, 78], [8, 76], [10, 74], [12, 71], [14, 74]], LEAD2 = [[0, 79], [2, 78], [4, 76], [7, 74], [10, 76], [12, 71]];
    function note(t, s, bar) { const c = audio.ctx, dl = t - c.currentTime, m = MUS.mood, full = m === 'work', party = m === 'party', ch = CH[bar % 4], root = BASS[bar % 4], O = { mus: true, wet: 0.12 };
      if (full || party) { if (s % 4 === 0 || (s === 10 && bar % 2)) { osc('sine', 130, 42, 0.32, 0.5, dl, { ...O, wet: 0.02 }); nz(0.02, 'lowpass', 2000, 800, 1, 0.12, dl, O); }
        if (s === 4 || s === 12) { nz(0.16, 'bandpass', 1900, 1200, 0.8, 0.28, dl, { ...O, wet: 0.3 }); osc('triangle', 210, 160, 0.09, 0.12, dl, O); } }
      if (s % 2 === 1 || m === 'chill' && s % 4 === 2) nz(0.035, 'highpass', 8000, 8000, 0.7, s % 4 === 3 ? 0.07 : 0.04, dl, { ...O, pan: 0.3 });
      if ((full || party) && (s === 3 || s === 11 || (s === 14 && bar % 2))) { [[1, 1], [2.76, 0.5], [5.4, 0.25]].forEach(([k, a]) => osc('sine', 1046 * k, 1046 * k, 0.25 / k, 0.05 * a, dl, { ...O, pan: -0.4, wet: 0.3 })); }
      const bassPat = full || party ? [0, 3, 6, 8, 10, 14] : [0, 8]; if (bassPat.includes(s)) { const n = s === 6 || s === 14 ? root + 12 : s === 10 ? root + 7 : root; osc('sawtooth', mtof(n), mtof(n), full ? 0.18 : 0.5, full ? 0.22 : 0.16, dl, { ...O, lp: 900, lp2: 180, q: 4, wet: 0.05 }); }
      if (s === 0 && m === 'chill') ch.forEach((n, i) => osc('triangle', mtof(n), mtof(n), SIX * 15, 0.035, dl + i * 0.02, { ...O, att: 0.25, wet: 0.5 }));
      if ((full || party) && (s === 2 || s === 7 || s === 13)) ch.slice(0, 3).forEach(n => osc('square', mtof(n), mtof(n), 0.12, 0.03, dl, { ...O, lp: 2400, lp2: 600, wet: 0.2 }));
      if ((full && bar % 4 >= 2) || party) { const L = bar % 2 ? LEAD2 : LEAD; for (const [st, n] of L) if (st === s) { osc('triangle', mtof(n), mtof(n), SIX * 1.8, 0.07, dl, { ...O, wet: 0.35 }); osc('sine', mtof(n + 12), mtof(n + 12), SIX * 1.2, 0.02, dl, O); } } }
    function tick() { const c = A(); if (!c || !chain()) return; if (MUS.next < c.currentTime) MUS.next = c.currentTime + 0.05; while (MUS.next < c.currentTime + 0.15) { if (MUS.on) note(MUS.next, MUS.step, MUS.bar); MUS.step = (MUS.step + 1) % 16; if (MUS.step === 0) MUS.bar++; MUS.next += SIX * (MUS.step % 2 ? 0.94 : 1.06); } }
    const S = {
      at(x) { panX = x == null ? 0 : clamp((x - camera.position.x) / 7, -0.75, 0.75); return S; },
      music: { start() { if (MUS.iv) return; MUS.iv = setInterval(tick, 30); }, set(on) { MUS.on = !!on; try { localStorage.setItem('tank.works.music', on ? '1' : '0'); } catch (e) {} if (mus && audio.ctx) mus.gain.setTargetAtTime(on ? MUS.vol : 0, audio.ctx.currentTime, 0.2); }, get on() { return MUS.on; }, mood(m) { MUS.mood = m; }, duck(t = 1.2) { if (mus && audio.ctx && MUS.on) { const n = audio.ctx.currentTime; mus.gain.cancelScheduledValues(n); mus.gain.setTargetAtTime(MUS.vol * 0.3, n, 0.05); mus.gain.setTargetAtTime(MUS.vol, n + t, 0.4); } }, stop() { clearInterval(MUS.iv); MUS.iv = null; } },
      ambience() { const c = A(); if (!c || amb || !chain()) return; if (audio.wind && audio.wind.gain) audio.wind.gain.value = 0; amb = c.createGain(); amb.gain.value = 0.9; amb.connect(bus); S.music.start();
        const hum = c.createGain(); hum.gain.value = 0.014; hum.connect(amb); for (const [f, v] of [[60, 1], [120, 0.5], [180, 0.25]]) { const o = c.createOscillator(); o.frequency.value = f; const gg = c.createGain(); gg.gain.value = v; o.connect(gg); gg.connect(hum); o.start(); }
        const roar = c.createGain(); roar.gain.value = 0.045; const rp = c.createStereoPanner ? c.createStereoPanner() : null; if (rp) { roar.connect(rp); rp.connect(amb); S._roarPan = rp; } else roar.connect(amb); noiseSrc(c, [bq(c, 'lowpass', 220), bq(c, 'peaking', 90, 1)], roar); const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.35; lg.gain.value = 0.018; lfo.connect(lg); lg.connect(roar.gain); lfo.start();
        const vent = c.createGain(); vent.gain.value = 0.01; vent.connect(amb); noiseSrc(c, [bq(c, 'bandpass', 1400, 0.4)], vent); },
      frame() { if (S._roarPan && audio.ctx) S._roarPan.pan.setTargetAtTime(clamp((ST_X.cast - camera.position.x) / 9, -0.8, 0.8), audio.ctx.currentTime, 0.1); },
      far() { const p = rr(-0.8, 0.8), r = Math.random(); if (r < 0.4) metal(rr(300, 700), 1.2, 0.02, 0, 0.8); else if (r < 0.7) { nz(0.25, 'bandpass', 900, 500, 2, 0.025, 0, { pan: p, wet: 0.7 }); nz(0.25, 'bandpass', 900, 500, 2, 0.02, 0.3, { pan: p, wet: 0.7 }); } else osc('square', 90, 70, 0.4, 0.012, 0, { pan: p, lp: 400, wet: 0.6 }); },
      whistle(long = 1.2) { S.music.duck(long + 0.6); const O = { att: 0.09, wet: 0.6, pan: 0 }; osc('sine', 440, 452, long, 0.08, 0, O); osc('sine', 554, 566, long, 0.065, 0, O); osc('sine', 660, 668, long, 0.04, 0, O); osc('sine', 880, 884, long, 0.015, 0, O); nz(long, 'bandpass', 3000, 2600, 1.5, 0.045, 0, { att: 0.06, wet: 0.6 }); },
      doorbell() { S.at(8); metal(1318, 1.0, 0.05, 0, 0.5); metal(1046, 1.1, 0.05, 0.22, 0.5); },
      step() { stepAlt ^= 1; nz(0.045, 'bandpass', stepAlt ? 900 : 1150, 380, 1.4, 0.045, 0, { pan: 0, wet: 0.25 }); osc('sine', stepAlt ? 95 : 85, 55, 0.05, 0.03, 0, { pan: 0, wet: 0 }); nz(0.08, 'highpass', 4000, 2500, 0.7, 0.008, 0.02, { pan: 0 }); },
      jump() { osc('triangle', 220, 520, 0.18, 0.07, 0, { pan: 0 }); nz(0.12, 'bandpass', 600, 1800, 1.2, 0.03, 0, { pan: 0 }); }, land() { nz(0.1, 'lowpass', 600, 180, 1, 0.08, 0, { pan: 0 }); osc('sine', 85, 40, 0.14, 0.08, 0, { pan: 0, wet: 0.1 }); },
      swing() { nz(0.2, 'bandpass', 500, 2600, 1.6, 0.08, 0, { pan: 0 }); }, blip() { osc('square', 880, 990, 0.05, 0.025, 0, { pan: 0, lp: 3000 }); osc('square', 1320, 1320, 0.04, 0.018, 0.05, { pan: 0, lp: 3000 }); },
      dialog() { osc('triangle', 520, 620, 0.06, 0.05, 0, { pan: 0 }); osc('triangle', 780, 780, 0.07, 0.04, 0.06, { pan: 0 }); },
      conveyor(on) { setLoop('conv', on ? 0.1 : 0, (c, g) => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = 42; const lp = bq(c, 'lowpass', 160); o.connect(lp); lp.connect(g); o.start(); const rattle = c.createGain(); rattle.gain.value = 0.6; rattle.connect(g); const am = c.createOscillator(), ag = c.createGain(); am.frequency.value = 11; ag.gain.value = 0.5; am.connect(ag); ag.connect(rattle.gain); am.start(); noiseSrc(c, [bq(c, 'bandpass', 1800, 3)], rattle); return {}; }); },
      clunk() { osc('sine', 110, 50, 0.3, 0.14, 0, { wet: 0.3 }); nz(0.12, 'lowpass', 1100, 300, 1, 0.1); metal(240, 0.6, 0.025, 0.02); nz(0.05, 'bandpass', 3000, 2000, 3, 0.03, 0.06); },
      done() { metal(880, 0.9, 0.06); metal(1318, 1.0, 0.06, 0.14); },
      creak() { osc('sawtooth', 70, 110, 0.55, 0.022, 0, { lp: 600 }); nz(0.5, 'bandpass', 400, 900, 7, 0.03); },
      pour(on, fill = 0) { setLoop('pour', on ? 0.15 : 0, (c, g) => { const fz = bq(c, 'bandpass', 2600, 0.8), lo = bq(c, 'lowpass', 300); noiseSrc(c, [fz], g); const gl = c.createGain(); gl.gain.value = 1.4; gl.connect(g); noiseSrc(c, [lo], gl); const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 7; lg.gain.value = 1.2; lfo.connect(lg); lg.connect(gl.gain); lfo.start(); return { fz, lfo }; }, (p, t) => { p.fz.frequency.setTargetAtTime(1800 + fill * 2600, t, 0.05); p.lfo.frequency.setTargetAtTime(6 + fill * 9, t, 0.1); }); },
      glug(fill) { const f = 140 + fill * 220 + rr(-20, 20); osc('sine', f, f * 1.6, 0.07, 0.07, 0, { wet: 0.2 }); },
      green() { osc('sine', 1568, 1568, 0.14, 0.05, 0, { pan: 0, wet: 0.3 }); osc('sine', 2093, 2093, 0.16, 0.04, 0.06, { pan: 0, wet: 0.3 }); },
      castOk() { nz(1.1, 'highpass', 3200, 1000, 0.7, 0.11, 0, { wet: 0.4 }); [784, 988, 1175, 1568].forEach((f, i) => osc('triangle', f, f, 0.2, 0.05, i * 0.07, { pan: 0, wet: 0.35 })); },
      castShort() { osc('sine', 300, 190, 0.2, 0.07); nz(0.1, 'lowpass', 600, 300, 1, 0.05); },
      spill() { nz(0.8, 'highpass', 2200, 600, 0.7, 0.15, 0, { wet: 0.4 }); for (let i = 0; i < 6; i++) nz(0.06, 'bandpass', rr(1500, 3500), 800, 4, 0.07, i * 0.07); },
      mouldOpen() { nz(0.65, 'bandpass', 280, 950, 3, 0.11); osc('sawtooth', 55, 90, 0.55, 0.025, 0, { lp: 500 }); nz(1.2, 'highpass', 2600, 800, 0.6, 0.09, 0.25, { wet: 0.5 }); },
      tick(green) { if (green) osc('sine', 1760, 1760, 0.06, 0.035, 0, { pan: 0, wet: 0.1 }); else osc('sine', 660, 660, 0.03, 0.018, 0, { pan: 0, wet: 0 }); },
      strike(q) { osc('sine', 100, 38, 0.4, 0.26, 0, { wet: 0.25 }); nz(0.07, 'lowpass', 3500, 400, 1, 0.16); nz(0.4, 'lowpass', 300, 80, 1, 0.08, 0.02, { wet: 0.5 });
        if (q === 2) { metal(330, 1.6, 0.11); osc('sine', 2637, 2637, 0.3, 0.035, 0.02, { wet: 0.5 }); } else if (q === 1) metal(262, 1.1, 0.08); else { nz(0.22, 'lowpass', 500, 200, 1, 0.12); osc('triangle', 180, 110, 0.32, 0.05); osc('sine', 330, 240, 0.38, 0.035, 0.1); } },
      torch(on, move = 0) { setLoop('torch', on ? 0.045 + move * 0.12 : 0, (c, g) => { const hp = bq(c, 'highpass', 2200), cr = c.createGain(); cr.gain.value = 1; noiseSrc(c, [hp], cr); cr.connect(g); const buzz = c.createOscillator(), bg = c.createGain(); buzz.type = 'sawtooth'; buzz.frequency.value = 120; bg.gain.value = 0.14; buzz.connect(bg); bg.connect(g); buzz.start(); return { cr }; }, (p, t) => p.cr.gain.setValueAtTime(0.4 + Math.random() * 1.4, t)); },
      guide(on, near = 0) { setLoop('guide', on ? 0.035 + near * 0.05 : 0, (c, g) => { const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = 300; o.connect(g); o.start(); return { o }; }, (p, t) => p.o.frequency.setTargetAtTime(260 + near * 620, t, 0.04)); },
      crackle() { nz(0.03, 'highpass', rr(3000, 6500), 2000, 1, 0.06); if (Math.random() < 0.2) nz(0.012, 'highpass', 8000, 8000, 1, 0.08); }, splat() { nz(0.09, 'bandpass', 1200, 380, 3, 0.12); osc('sine', 420, 110, 0.12, 0.05); },
      seamDone() { osc('sawtooth', 1800, 300, 0.16, 0.035, 0, { lp: 4000 }); osc('sine', 2400, 2400, 0.4, 0.025, 0.4, { wet: 0.4 }); osc('sine', 2900, 2900, 0.3, 0.02, 0.55, { wet: 0.4 }); },
      drill() { osc('sawtooth', 180, 760, 0.42, 0.045, 0, { lp: 3000 }); osc('square', 90, 380, 0.42, 0.022, 0, { lp: 1500 }); nz(0.42, 'bandpass', 2000, 4200, 2, 0.05); osc('sawtooth', 760, 200, 0.14, 0.035, 0.42, { lp: 2500 }); nz(0.05, 'bandpass', 3500, 3500, 4, 0.04, 0.42); },
      ratchet(v) { nz(0.02, 'bandpass', 3000 + v * 3000, 2500, 6, 0.09); osc('square', 1200 + v * 1400, 900, 0.015, 0.022, 0, { lp: 5000 }); },
      tight() { nz(0.03, 'bandpass', 4200, 3000, 5, 0.1); osc('sine', 230, 150, 0.18, 0.1, 0.03, { wet: 0.2 }); metal(1500, 0.4, 0.03, 0.03); },
      strip() { nz(0.4, 'bandpass', 800, 2600, 2, 0.13); osc('sine', 900, 110, 0.65, 0.065, 0.15, { wet: 0.3 }); },
      rattle() { for (let i = 0; i < 7; i++) { nz(0.03, 'bandpass', 2600, 2000, 4, 0.08, i * 0.055); osc('sine', 1900, 1700, 0.02, 0.018, i * 0.055); } nz(0.12, 'highpass', 5000, 3000, 0.7, 0.04, 0.42); },
      spray(on) { setLoop('spray', on ? 0.11 : 0, (c, g) => { noiseSrc(c, [bq(c, 'highpass', 3500), bq(c, 'lowpass', 9000)], g); return {}; }); },
      cover(k) { const sc = [0, 2, 4, 7, 9, 12, 14, 16], n = 72 + sc[Math.min(sc.length - 1, Math.floor(k * sc.length))]; osc('sine', mtof(n), mtof(n), 0.09, 0.02, 0, { pan: 0, wet: 0.2 }); },
      press(on, v = 0) { setLoop('press', on ? 0.045 : 0, (c, g) => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 80; const lp = bq(c, 'lowpass', 600); o.connect(lp); lp.connect(g); o.start(); return { o }; }, (p, t) => p.o.frequency.setTargetAtTime(80 + v * 260, t, 0.05)); },
      thunk(q) { osc('sine', 140, 42, 0.4, 0.26, 0, { wet: 0.3 }); nz(0.08, 'lowpass', 2500, 300, 1, 0.18); if (q === 2) { nz(0.15, 'bandpass', 3000, 1500, 2, 0.05, 0.08); osc('triangle', 1046, 1046, 0.14, 0.05, 0.12, { pan: 0, wet: 0.3 }); osc('triangle', 1568, 1568, 0.22, 0.05, 0.2, { pan: 0, wet: 0.3 }); } else if (q === 0) nz(0.32, 'lowpass', 900, 200, 1, 0.1, 0.05); },
      tap() { osc('sine', 300, 220, 0.08, 0.08); nz(0.04, 'lowpass', 1200, 400, 1, 0.06); },
      cash() { S.at(12.5); metal(2093, 0.6, 0.045, 0, 0.3); metal(2637, 0.7, 0.045, 0.08, 0.3); nz(0.15, 'bandpass', 4000, 2000, 2, 0.045, 0.15); },
      react(level) { S.music.duck(1.6); const O = { pan: 0, wet: 0.35 }, seq = { thrilled: [[523, 0], [659, 0.1], [784, 0.2], [1046, 0.3], [1318, 0.42]], happy: [[523, 0], [659, 0.12], [784, 0.24]], okay: [[440, 0], [415, 0.18]], grumpy: [[392, 0], [370, 0.3], [349, 0.6], [330, 0.9]] }[level];
        if (level === 'grumpy') seq.forEach(([f, d], i) => osc('sawtooth', f, i === 3 ? f * 0.85 : f, i === 3 ? 0.8 : 0.28, 0.045, d, { ...O, lp: 1400 })); else seq.forEach(([f, d]) => { osc('triangle', f, f, 0.28, 0.065, d, O); osc('sine', f * 2, f * 2, 0.22, 0.022, d, O); }); },
      fanfare() { S.music.duck(2.4); [[523, 0], [523, 0.12], [523, 0.24], [784, 0.4], [659, 0.7], [784, 0.85], [1046, 1.05]].forEach(([f, d]) => osc('square', f, f, 0.18, 0.03, d, { pan: 0, lp: 3000, wet: 0.4 })); },
      sparkle() { [2093, 2637, 3136, 4186].forEach((f, i) => osc('sine', f, f, 0.25, 0.025, i * 0.06, { pan: rr(-0.5, 0.5), wet: 0.5 })); },
      stopAll() { for (const k of Object.keys(loops)) setLoop(k, 0); } };
    return S; })();
  const buzz = n => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  // SGT. TREAD: grey veteran in olive armour + peaked cap (so he never reads as the player)
  const tread = strip(kit.makeFox({ ...FOXCAST.player, look: { ...FOXCAST.player.look, fur: '#9a9a9e', furDark: '#5f5f66' }, torso: ['#5b6b3a', '#d9cfa8', '#3f4a28'], outfit: 'armor', crest: 'T', gear: 'none', mood: 'happy' }));
  { const TP = tread.userData.P, hs = TP.head.scale.x || 1, cap = new THREE.Group(); cap.position.set(0, TP.head.position.y + 0.22 * hs, 0.04); cap.scale.setScalar(hs); TP.body.add(cap);
    M(new THREE.CylinderGeometry(0.27, 0.3, 0.16, 18), toon('#3f4a28'), 0, 0.02, -0.02, cap, 0.012, 0.3); M(new THREE.CylinderGeometry(0.33, 0.29, 0.07, 18), toon('#4f5d33'), 0, 0.12, -0.04, cap, 0.01, 0.33); const pk = M(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 16, 1, false, -Math.PI / 2, Math.PI), toon('#201e1d'), 0, -0.04, 0.2, cap, 0.006); pk.scale.z = 0.7; M(new THREE.BoxGeometry(0.1, 0.08, 0.02), toon('#e6b45a'), 0, 0.08, 0.3, cap, 0.004); }
  // BEN: the player from engine/cast.js (8-crest armour) + the works' yellow hard hat and a red rag
  const ben = strip(kit.makeFox({ ...FOXCAST.player, gear: 'none', mood: 'happy' })); const BP = ben.userData.P;
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  const uniform = (() => { const hs = BP.head.scale.x || 1, hat = new THREE.Group(); hat.position.set(0, BP.head.position.y + 0.21 * hs, 0.06); hat.scale.setScalar(hs); hat.rotation.x = 0.05; BP.body.add(hat);
    const hy = toon('#f2c94c'); M(new THREE.SphereGeometry(0.31, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), hy, 0, 0, -0.02, hat, 0.014); M(new THREE.CylinderGeometry(0.37, 0.39, 0.035, 22), hy, 0, 0.01, 0.03, hat, 0.01, 0.39); M(new THREE.BoxGeometry(0.07, 0.05, 0.62), toon('#e0b43a'), 0, 0.3, -0.02, hat, 0.004);
    const logo = canvasTex(128, 128, g => { g.clearRect(0, 0, 128, 128); g.translate(64, 64); g.fillStyle = '#201e1d'; for (let i = 0; i < 8; i++) { g.save(); g.rotate(i * Math.PI / 4); g.fillRect(-8, -48, 16, 16); g.restore(); } g.beginPath(); g.arc(0, 0, 36, 0, 7); g.fill(); g.fillStyle = '#f2c94c'; g.font = '900 40px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 0, 3); });
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: logo, transparent: true, depthWrite: false })); lg.position.set(0, 0.17, 0.27); lg.rotation.x = -0.55; hat.add(lg);
    const chk = canvasTex(64, 64, c => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#fbfbf7' : '#ec3013'; c.fillRect(x * 16, y * 16, 16, 16); } }), rm = new THREE.MeshToonMaterial({ map: chk, gradientMap: ST.grad });
    const rag = new THREE.Group(); rag.position.set(0.2, 0.74, -0.27); BP.body.add(rag); const r1 = M(new THREE.BoxGeometry(0.15, 0.3, 0.025), rm, 0, 0, 0, rag, 0.006); r1.rotation.z = 0.15;
    return [hat, rag]; })();
  const setUniform = on => { uniform.forEach(p => p.visible = on); }; setUniform(true);
  const custFox = CUSTOMERS.map(o => { const f = strip(kit.makeFox({ ...FOXCAST.player, look: o.fur ? { ...FOXCAST.player.look, fur: o.fur, furDark: o.furDark } : FOXCAST.player.look, torso: o.torso, outfit: o.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; return f; });
  place(ben, Y.spots.ben, -0.5); place(tread, Y.spots.tread, 0.6);
  const blobM = new THREE.MeshBasicMaterial({ map: Y.blobT, transparent: true, depthWrite: false }), blobs = [ben, tread, ...custFox].map(f => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.1), blobM); m.rotation.x = -Math.PI / 2; m.renderOrder = 2; scene.add(m); return { f, m }; });
  // crate the finished part ships in
  const crate = new THREE.Group(); { const ct = canvasTex(128, 128, c => { c.fillStyle = '#b8945f'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#6b4a2c'; c.lineWidth = 8; c.strokeRect(4, 4, 120, 120); c.beginPath(); c.moveTo(4, 4); c.lineTo(124, 124); c.stroke(); c.fillStyle = '#201e1d'; c.font = '900 26px Archivo, Arial'; c.fillText('MK-8', 34, 72); }); const cm = new THREE.MeshToonMaterial({ map: ct, gradientMap: ST.grad }); const b = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.5, 0.5), cm); addOutline(b, 0.012); b.position.y = 0.25; crate.add(b); } crate.visible = false; scene.add(crate);
  // mould at the CAST station
  const mould = new THREE.Group(); mould.position.set(ST_X.cast, LY + 0.12, 0); scene.add(mould); const sand = toon('#c2a77a'), frameM = toon('#3a3836');
  const halves = [-1, 1].map(s => { const h = new THREE.Group(); h.position.x = s * 0.45; mould.add(h); M(new THREE.BoxGeometry(0.9, 1.5, 1.0), sand, 0, 0.75, 0, h, 0.02); M(new THREE.BoxGeometry(0.94, 0.12, 1.04), frameM, 0, 1.44, 0, h, 0); M(new THREE.BoxGeometry(0.94, 0.12, 1.04), frameM, 0, 0.06, 0, h, 0); for (const z of [-0.47, 0.47]) M(new THREE.BoxGeometry(0.06, 0.08, 0.06), frameM, s * 0.44, 0.75, z, h, 0); return h; });
  M(new THREE.ConeGeometry(0.17, 0.26, 12, 1, true), toon('#8a7350', { side: THREE.DoubleSide }), 0.25, 1.62, 0, halves[1], 0).rotation.x = Math.PI; halves[1].children[halves[1].children.length - 1].position.x = -0.2;
  const gSlot = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.1), new THREE.MeshBasicMaterial({ color: 0x201e1d })); gSlot.position.set(0.1, 0.75, 0.505); halves[1].add(gSlot);
  const gBar = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 1), new THREE.MeshBasicMaterial({ color: 0xff8a1a })); gBar.position.set(0.1, 0.25, 0.51); halves[1].add(gBar);
  const gMark = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.03), new THREE.MeshBasicMaterial({ color: 0x22c55e })); gMark.position.set(0.1, 0.25, 0.512); halves[1].add(gMark); const gMark2 = gMark.clone(); halves[1].add(gMark2);
  const SPRUE = () => V3(ST_X.cast + 0.25, LY + 0.12 + 1.66, 0);
  // tools: driver (drill/bolt), torch glow, spray nozzle glow, QC stamp, forge rings
  const driver = new THREE.Group(); { M(new THREE.BoxGeometry(0.16, 0.16, 0.26), toon('#f2c94c'), 0, 0, 0.22, driver, 0.01); M(new THREE.BoxGeometry(0.1, 0.24, 0.1), toon('#201e1d'), 0, -0.16, 0.26, driver, 0.008); const bit = M(new THREE.CylinderGeometry(0.02, 0.012, 0.16, 6).rotateX(Math.PI / 2), toon('#d7dde3'), 0, 0, 0.04, driver, 0.004); driver.userData.bit = bit; } driver.visible = false; scene.add(driver);
  const glowS = c => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: c, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); s.renderOrder = 35; s.visible = false; scene.add(s); return s; };
  const torch = glowS(0x9fd8ff), nozzle = glowS(0xffffff);
  const stampT = new THREE.Group(); { M(new THREE.CylinderGeometry(0.05, 0.05, 0.36, 10).rotateX(Math.PI / 2), toon('#7a5a3a'), 0, 0, 0.32, stampT, 0.008, 0.05); M(new THREE.SphereGeometry(0.09, 12, 8), toon('#7a5a3a'), 0, 0, 0.52, stampT, 0.008, 0.09); M(new THREE.BoxGeometry(0.4, 0.22, 0.12), toon('#201e1d'), 0, 0, 0.1, stampT, 0.01); M(new THREE.BoxGeometry(0.38, 0.2, 0.03), toon('#ec3013'), 0, 0, 0.025, stampT, 0); } stampT.visible = false; scene.add(stampT);
  const ringM = (c, o) => { const m = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 48), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: o, depthTest: false, depthWrite: false })); m.renderOrder = 34; m.visible = false; scene.add(m); return m; };
  const ringT = ringM(0x22c55e, 0.85), ringO = ringM(0xffffff, 0.95);
  // ---------- FX: sparks (streaks with gravity), furnace embers, hot-part halo, pour light ----------
  const sparkM = new THREE.MeshBasicMaterial({ color: 0xffc04a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), sparkG = new THREE.BoxGeometry(0.012, 0.012, 1);
  const SP = []; for (let i = 0; i < 90; i++) { const m = new THREE.Mesh(sparkG, sparkM.clone()); m.visible = false; m.renderOrder = 33; scene.add(m); SP.push({ m, v: V3(), life: 0 }); } let spI = 0;
  function sparks(p, n = 10, spd = 4, col = 0xffc04a, up = 0.6) { for (let i = 0; i < n; i++) { const s = SP[spI = (spI + 1) % SP.length]; s.m.position.copy(p); s.v.set(rr(-1, 1), rr(-0.2, 1) + up, rr(-0.3, 1)).normalize().multiplyScalar(spd * rr(0.4, 1.1)); s.life = rr(0.35, 0.8); s.m.material.color.setHex(col); s.m.visible = true; } }
  const EM = []; { const em = new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a2a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); for (let i = 0; i < 26; i++) { const s = new THREE.Sprite(em.clone()); s.scale.setScalar(0.08); scene.add(s); EM.push({ s, v: V3(), life: 0 }); } }
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff7a2a, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); halo.renderOrder = 32; scene.add(halo);
  const pourL = new THREE.PointLight(0xff8a2a, 0, 6, 1.5); scene.add(pourL); const splash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffb347, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(splash);
  let rollA = 0; const rollQ = new THREE.Object3D();
  function fxStep(dt, t) { for (const s of SP) { if (s.life <= 0) { s.m.visible = false; continue; } s.life -= dt; s.v.y -= 9 * dt; s.m.position.addScaledVector(s.v, dt); if (s.m.position.y < 0.02) { s.m.position.y = 0.02; s.v.y *= -0.35; s.v.x *= 0.6; s.v.z *= 0.6; } const sp = s.v.length(); s.m.scale.set(1, 1, Math.min(0.35, sp * 0.03) + 0.02); s.m.lookAt(s.m.position.x + s.v.x, s.m.position.y + s.v.y, s.m.position.z + s.v.z); s.m.material.opacity = Math.min(1, s.life * 2.5); }
    for (const e of EM) { if (e.life <= 0) { if (Math.random() < dt * 3) { e.life = rr(1.2, 2.4); e.s.position.set(ST_X.cast - 0.2 + rr(-0.4, 0.4), 1.0, -1.45); e.v.set(rr(-0.2, 0.2), rr(0.5, 1.1), rr(0.15, 0.4)); } else { e.s.material.opacity = 0; continue; } } e.life -= dt; e.s.position.addScaledVector(e.v, dt); e.s.position.x += Math.sin(t * 3 + e.v.x * 40) * dt * 0.2; e.s.material.opacity = Math.min(1, e.life) * 0.9; }
    if (Math.random() < dt * 1.2) puff(ST_X.cast - 0.8 + rr(-0.1, 0.1), 6.4, -2.6, 0x8a8f96, 1); if (Math.random() < dt * 0.8) puff(ST_X.forge + 0.6 + rr(-0.4, 0.4), 0.9, -2.3, 0xffffff, 1);
    // dust drifts, light shafts breathe, overhead hides when the walk camera rises into it
    const dp = Y.dust.geometry.attributes.position; for (let i = 0; i < dp.count; i++) { let y = dp.getY(i) + dt * 0.05; if (y > 6.2) y = 0.4; dp.setY(i, y); dp.setX(i, dp.getX(i) + Math.sin(t * 0.3 + i) * dt * 0.04); } dp.needsUpdate = true; Y.shaftM.opacity = 0.06 + Math.sin(t * 0.4) * 0.015;
    const hideTop = S.phase === 'walk' && camera.position.y > 5.0; Y.overhead.forEach(o => o.visible = !hideTop);
    if ((S.clockT = (S.clockT || 0) - dt) <= 0) { S.clockT = 20; const d = new Date(); Y.drawClock(d.getHours(), d.getMinutes()); }
    // rollers spin while something rides the line
    if (S.move || S.phase === 'arrive') { rollA -= dt * 9; for (let i = 0; i < Y.rollers.count; i++) { Y.rollers.getMatrixAt(i, rollQ.matrix); rollQ.matrix.decompose(rollQ.position, rollQ.quaternion, rollQ.scale); rollQ.rotation.set(0, 0, rollA); rollQ.updateMatrix(); Y.rollers.setMatrixAt(i, rollQ.matrix); } Y.rollers.instanceMatrix.needsUpdate = true; }
    // hot part halo + pour glow
    if (P && P.body.visible && (P.heat || 0) > 0.02) { const c = wp(P.body); halo.position.set(c.x, c.y, c.z + 0.25); halo.scale.setScalar((P.type === 'barrel' ? 2.6 : 2.0) * (0.7 + P.heat * 0.5)); halo.material.opacity = P.heat * 0.32; } else halo.material.opacity = 0;
    const pouring = S.hold && S.hold.kind === 'cast' && Y.crucible.rotation.z > 0.6, sp = SPRUE(); pourL.position.set(sp.x, sp.y + 0.3, sp.z + 0.6); pourL.intensity = damp(pourL.intensity, pouring ? 2.6 + Math.sin(t * 30) * 0.4 : 0, 8, dt); splash.position.copy(sp).add(V3(0, 0.05, 0.1)); splash.scale.setScalar(0.5 + Math.sin(t * 25) * 0.08); splash.material.opacity = pouring ? 0.9 : 0; if (pouring && Math.random() < dt * 14) sparks(sp, 2, 2.2, 0xffa23a, 0.9); }

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), orderN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, flash: null, flashT: 0, say: '', sayT: 0, hold: null, twist: null, ptr: null, react: null, done: null, phT: 0, confirm: 0, move: null, forgeT: 0, strikeT: 0, lastStrike: 0, toast: null, toastT: 0, dlg: null, near: null };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  let P = null, cust = null, CU = null, lastCust = -1;
  const wp = o => o.getWorldPosition(new THREE.Vector3()), lp = v => { P.g.updateMatrixWorld(true); return P.body.localToWorld(v.clone()); };
  const pourZ = () => upg('ladle') ? [0.72, 0.95] : POUR();
  function newJob() { const d = S.day, type = S.forceType || pick(d <= 1 ? ['wheel', 'hatch', 'wheel', 'plate'] : ['wheel', 'plate', 'hatch', 'barrel']), D = PARTS[type];
    const mid = D.tasks.filter(t => t !== 'cast' && t !== 'stamp'), n = d <= 1 ? 1 : d <= 2 ? 2 : mid.length; const pickd = mid.slice().sort(() => Math.random() - 0.5).slice(0, n);
    const tasks = ['cast', ...mid.filter(t => S.forceType ? true : pickd.includes(t)), 'stamp'].filter(t => D.tasks.includes(t)); tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    let ci; do { ci = Math.floor(Math.random() * CUSTOMERS.length); } while (ci === lastCust); lastCust = ci;
    return { type, tasks, camo: pick(CK), cust: ci, day: d, line: pick(HELLO), serial: 'MK8-' + (100 + Math.floor(Math.random() * 900)) }; }
  function nextOrder() { if (P) { scene.remove(P.g); P = null; } const job = newJob(); P = makePart(ST, job.type, job); CU = CUSTOMERS[job.cust]; cust = custFox[job.cust]; custFox.forEach(f => f.visible = f === cust); cust.userData.hold = null;
    P.g.position.set(LINE_IN - 1.0, LY, 0); place(cust, Y.spots.door, Math.PI); SFX.doorbell(); SFX.conveyor(true); S.phase = 'arrive'; S.phT = 0; S.tool = null; S.brush = null; S.confirm = 0; S.doneSeen = {}; S.move = null; S.advance = null; crate.visible = false;
    mould.visible = P.cast === 'empty'; halves.forEach((h, i) => { h.position.set(i ? 0.45 : -0.45, 0, 0); h.visible = true; }); gBar.scale.y = 0.001; gBar.position.y = 0.2; const [a, b] = pourZ(); gMark.position.y = 0.2 + a * 1.0; gMark2.position.y = 0.2 + b * 1.0; tone(110, 0.4, 0.03, 'square'); }

  // ---------- task progress ----------
  const forgeQ = () => clamp(1 - P.forge.miss * 0.12, 0.45, 1);
  function info(id) { if (!P) return { done: false, q: 0, prog: 0, txt: '' };
    if (id === 'cast') { const d = P.cast === 'done'; return { done: d, q: P.castQ, prog: d ? 1 : Math.min(1, P.fill), txt: d ? 'DONE' : P.fill > 0 ? Math.round(P.fill * 100) + '%' : 'POUR' }; }
    if (id === 'forge') { const F = P.forge, d = F.hits >= F.need; return { done: d, q: forgeQ(), prog: F.hits / F.need, txt: d ? 'DONE' : F.hits + ' / ' + F.need }; }
    if (id === 'weld') { const l = P.seamDone.filter(x => !x).length; return { done: !l, q: clamp(1 - P.splats.length * 0.07, 0.5, 1), prog: P.seams.length ? 1 - l / P.seams.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'bolt') { const l = P.bolts.filter(b => b.st !== 'tight').length, q = P.bolts.length ? P.bolts.reduce((s, b) => s + b.q, 0) / P.bolts.length : 1; return { done: !l, q, prog: P.bolts.length ? 1 - l / P.bolts.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'paint') { const n = P.samples.length, c = P.paintCov.filter(Boolean).length, ok = P.paintCov.filter(k => k === P.job.camo).length, d = c / n >= 0.9; return { done: d, q: ok / Math.max(1, c), prog: c / n, txt: d ? (ok / c > 0.95 ? 'DONE' : 'WRONG CAMO') : Math.round(c / n * 100) + '%' }; }
    if (id === 'stamp') return { done: P.stamp.done, q: P.stamp.q, prog: P.stamp.done ? 1 : 0, txt: P.stamp.done ? 'DONE' : 'PRESS' };
    return { done: true, q: 1 }; }
  const allDone = () => P && P.job.tasks.every(t => info(t).done);
  const curTask = () => P && P.job.tasks.find(t => !info(t).done);
  function setTool(id) { if (S.phase !== 'work' || !P || !P.job.tasks.includes(id)) return; const c = curTask(); if (info(id).done) { flash(TASKS[id].label + ' IS DONE ✓', '#22c55e', 1); return; }
    if (id !== c) { flash('IT\'S A LINE · ' + TASKS[c].label + ' COMES FIRST', '#e6b45a', 1.6); tone(220, 0.12, 0.04, 'sawtooth'); return; } S.tool = id; }
  function checkDone() { if (!P) return; for (const t of P.job.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); SFX.done(); buzz(30);
        const b = wp(P.body); for (let i = 0; i < 6; i++) puff(b.x + rr(-0.6, 0.6), b.y + rr(0, 0.6), 0.6, 0xffe7a0, 1);
        if (t === 'paint') paintFill(); if (t === 'forge') { P.body.scale.set(1, 1, 1); }
        S.hold = null; S.twist = null; S.ptr = null; const nx = curTask(); if (!nx) { S.tool = null; say('TREAD: "Line work done, recruit. SHIP IT to ' + CU.name + '!"', 4); } else S.advance = { t: 0.9, task: nx }; } } }
  function moveTo(task) { if (!P) return; const tx = ST_X[task]; S.tool = task; if (Math.abs(P.g.position.x - tx) < 0.01) { arrive(task); return; } S.move = { from: P.g.position.x, to: tx, t: 0, task }; SFX.conveyor(true); }
  function arrive(task) { if (task === 'weld') { [P.extra, P.extra2].forEach(e => e && (e.visible = true)); P.seamMk.forEach((m, i) => m.visible = !P.seamDone[i]); flash('PARTS CLAMPED ON · WELD THE SEAMS', '#ffffff', 1.4); }
    if (task === 'forge') S.forgeT = 0; if (task === 'paint' && !S.brush) flash('PICK THE CAMO ON THE ORDER BELOW', '#ffffff', 1.6); }

  // ---------- CAST ----------
  function startPour() { if (P.cast !== 'empty' && P.cast !== 'short') return; S.hold = { kind: 'cast', t: 0 }; SFX.creak(); S.greenSeen = false; }
  function endPour() { const H = S.hold; S.hold = null; if (!H) return; const [a, b] = pourZ(), f = P.fill; P.pours++;
    if (f < a) { P.cast = 'short'; flash(P.pours > 1 ? 'STILL SHORT · TOP IT UP AGAIN' : 'SHORT POUR · HOLD AGAIN TO TOP IT UP', '#ffffff', 1.6); SFX.pour(false); SFX.castShort(); return; }
    P.castQ = clamp((f <= b ? 1 : f < 1 ? 0.8 : 0.5) - Math.max(0, P.pours - 2) * 0.08, 0.4, 1);
    flash(f <= b ? (P.pours <= 2 ? 'PERFECT POUR!' : 'FULL · A BIT PATCHY') : f < 1 ? 'A BIT OVER · FLASH TRIMMED' : 'SPILLED OVER!', f <= b ? '#22c55e' : f < 1 ? '#e6b45a' : '#ec3013', 1.4); SFX.pour(false); if (f < 1) SFX.castOk(); else SFX.spill(); setTimeout(() => SFX.mouldOpen(), 250); buzz(40);
    P.cast = 'open'; P.openT = 0; P.body.visible = true; P.heat = 1; }
  // ---------- FORGE ----------
  const forgeP = () => upg('hammer') ? 1.6 : 1.25, forgeG = () => upg('hammer') ? 0.13 : 0.09;
  function strike() { const now = performance.now(); if (now - S.lastStrike < 280) return; S.lastStrike = now; S.strikeT = 1; const F = P.forge, T = forgeP(), t = S.forgeT, e = Math.min(T - t, t), late = t < T / 2;
    const b = wp(P.body);
    if (e <= forgeG()) { F.hits++; F.perf++; flash('PERFECT STRIKE!', '#22c55e', 0.8); SFX.strike(2); buzz(25); }
    else if (e <= forgeG() * 2) { F.hits++; flash('GOOD STRIKE', '#ffffff', 0.7); SFX.strike(1); buzz(20); }
    else { F.miss++; flash(late ? 'LATE · OFF THE BEAT' : 'EARLY · WAIT FOR GREEN', '#e6b45a', 0.9); SFX.strike(0); }
    const k = Math.min(1, F.hits / F.need); P.body.scale.set(...P.lump.map(v => v + (1 - v) * k)); P.squash = 1; P.heat = Math.max(0.25, 1 - F.hits * 0.14);
    for (let i = 0; i < 6; i++) puff(b.x + rr(-0.5, 0.5), LY + P.top + rr(0, 0.2), 0.3, 0xffb347, 1); sparks(V3(b.x, LY + P.top, 0.25), e <= forgeG() * 2 ? 22 : 8, 5.5, 0xffb347, 0.8); S.forgeT = 0; checkDone(); }
  // ---------- WELD ----------
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const curSeam = () => P.seamDone.findIndex(d => !d);
  const beadM = new THREE.MeshBasicMaterial({ color: 0xffb347 }), beadCool = toon('#6b6f75');
  function addBead(si, i) { const p = P.seams[si][i], m = new THREE.Mesh(new THREE.SphereGeometry(0.032, 8, 6), beadM); m.position.copy(p); m.scale.set(1.2, 1.2, 0.7); P.body.add(m); P.beads.push({ m, si }); }
  function weldAdvance(si, to) { const S0 = P.seams[si]; to = Math.min(to, S0.length - 1); while (P.seamProg[si] < to) { P.seamProg[si]++; addBead(si, P.seamProg[si]); } if (Math.random() < 0.6) SFX.crackle(); S.torchT = 0.15; const p = lp(S0[P.seamProg[si]]); puff(p.x, p.y, p.z + 0.05, 0xfff1c4, 1); sparks(p.clone().add(V3(0, 0, 0.05)), 4, 3.2, 0xbfe6ff, 0.5);
    if (P.seamProg[si] >= S0.length - 1 && !P.seamDone[si]) { P.seamDone[si] = true; P.seamMk[si].visible = false; flash('SEAM ' + (si + 1) + ' WELDED', '#22c55e', 1); SFX.seamDone(); const bl = P.beads.filter(b => b.si === si); setTimeout(() => bl.forEach(b => b.m.material = beadCool), 1100); const nx = curSeam(); if (nx >= 0) P.seamMk[nx].visible = true; checkDone(); } }
  function weldMove(x, y, d, dtMs) { const si = curSeam(); if (si < 0) return; const pts = P.seams[si], R = (upg('torch') ? 40 : 28) * scale(), i0 = P.seamProg[si]; let best = -1;
    for (let j = i0; j <= Math.min(pts.length - 1, i0 + 4); j++) { const s = scr(lp(pts[j])); if (Math.hypot(s.x - x, s.y - y) < R) best = j; }
    const spd = dtMs > 0 ? d / dtMs * 1000 : 0, lim = (upg('torch') ? 1400 : 950) * scale();
    if (best > i0) { if (spd > lim && performance.now() - (S.splatT || 0) > 220) { S.splatT = performance.now(); const p = pts[best], m = new THREE.Mesh(new THREE.CircleGeometry(0.03, 7), new THREE.MeshBasicMaterial({ color: 0x3a3836 })); m.position.copy(p).add(V3(rr(-0.08, 0.08), rr(-0.08, 0.08), 0.004)); P.body.add(m); P.splats.push(m); flash('TOO FAST · SPLATTER', '#e6b45a', 0.9); SFX.splat(); }
      weldAdvance(si, best); }
    { const s0 = scr(lp(pts[Math.min(pts.length - 1, P.seamProg[si] + 1)])); S.guideNear = clamp(1 - Math.hypot(s0.x - x, s0.y - y) / (R * 4), 0, 1); }
    if (best <= i0) { const s = scr(lp(pts[i0])); if (Math.hypot(s.x - x, s.y - y) > R * 2.4 && performance.now() - (S.offT || 0) > 1600) { S.offT = performance.now(); flash('STAY ON THE GLOWING LINE', '#ffffff', 1); } } }
  // ---------- BOLT ----------
  const boltAt = (x, y, r, st) => { let best = null, bd = r * scale(); for (const b of P.bolts) { if (st && !st.includes(b.st)) continue; const s = scr(wp(b.grp)), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = b; } } return best; };
  function drill(b) { b.st = 'drill'; b.drillT = 0; SFX.drill(); buzz(60); }
  function twistMove(x, y) { const T = S.twist, b = T.b, s = scr(wp(b.grp)), dx = x - s.x, dy = y - s.y; if (Math.hypot(dx, dy) < 10) return; const a = Math.atan2(dy, dx); if (T.a == null) { T.a = a; return; } let da = a - T.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; T.a = a;
    b.v = Math.min(1.1, b.v + Math.abs(da) / (Math.PI * 2 * 2.6) * (upg('driver') ? 2 : 1)); b.bolt.rotation.z -= Math.abs(da) * 1.4; b.bolt.position.z = 0.05 * (1 - Math.min(1, b.v));
    T.acc = (T.acc || 0) + Math.abs(da); if (T.acc > 0.45) { T.acc = 0; SFX.ratchet(Math.min(1, b.v)); if (b.v >= TORQ[0] && !T.gs) { T.gs = 1; SFX.green(); } } if (b.v >= 1.1) { endTwist(); } }
  function endTwist() { const T = S.twist; S.twist = null; if (!T) return; const b = T.b, v = b.v;
    if (v < TORQ[0]) { if (v > 0.05) flash('STILL LOOSE · KEEP TWISTING', '#ffffff', 1.1); return; }
    b.st = 'tight'; b.q = v <= TORQ[1] ? 1 : v < 1 ? 0.8 : 0.4; b.wsh.visible = true; b.hx.material = toon(v <= TORQ[1] ? '#c9ced3' : v < 1 ? '#d9c08a' : '#ec3013');
    flash(v <= TORQ[1] ? 'TIGHT ✓' : v < 1 ? 'A BIT TOO TIGHT' : 'STRIPPED THE THREAD!', v <= TORQ[1] ? '#22c55e' : v < 1 ? '#e6b45a' : '#ec3013', 1); if (v < 1) SFX.tight(); else SFX.strip(); buzz(v <= TORQ[1] ? 30 : 120); checkDone(); }
  // ---------- PAINT ----------
  const camoImg = {}; const camoCanvas = k => (camoImg[k] = camoImg[k] || camoTex(canvasTex, k, 256).image);
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const brushW = () => upg('nozzle') ? 0.27 : 0.17;
  function sprayAtHit(hit) { const k = S.brush, c = P.pc.getContext('2d'), [us, vs] = P.uvSpan, rx = brushW() / us * 256 * 1.25, ry = brushW() / vs * 256 * 1.25;
    if (hit.uv) { const u = hit.uv.x * 256, v = (1 - hit.uv.y) * 256; c.save(); c.beginPath(); c.ellipse(u, v, rx, ry, 0, 0, 7); c.clip(); c.drawImage(camoCanvas(k), 0, 0); c.restore(); P.ptex.needsUpdate = true; }
    const L = P.body.worldToLocal(hit.point.clone()); let fresh = 0; P.samples.forEach((s, i) => { if (s.distanceTo(L) < brushW() * 1.15) { if (P.paintCov[i] !== k) fresh++; P.paintCov[i] = k; } }); if (fresh && performance.now() - (S.covT || 0) > 70) { S.covT = performance.now(); SFX.cover(P.paintCov.filter(c => c === P.job.camo).length / P.samples.length); }
    if (Math.random() < 0.5) puff(hit.point.x, hit.point.y, hit.point.z + 0.1, new THREE.Color(CAMO[k].cols[Math.floor(Math.random() * 3)]).getHex(), 1); S.sprayT = 0.12;
    nozzle.visible = true; nozzle.position.copy(hit.point).add(V3(0, 0, 0.12)); nozzle.scale.setScalar(brushW() * 2.6); S.nozT = 0.15; checkDone(); }
  function paintMove(x, y) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(P.paintable.filter(m => m.visible), false)[0]; if (hit) sprayAtHit(hit); }
  function paintFill() { const k = P.job.camo, ok = P.paintCov.every(c => c === k); if (!ok) return; const c = P.pc.getContext('2d'); c.drawImage(camoCanvas(k), 0, 0); P.ptex.needsUpdate = true; }
  function setBrush(k) { if (!CAMO[k] || !P) return; S.brush = k; SFX.rattle(); flash('CAMO · ' + CAMO[k].name + (k === P.job.camo ? '' : ' · ORDER SAYS ' + CAMO[P.job.camo].name), k === P.job.camo ? '#22c55e' : '#e6b45a', 1.3); }
  // ---------- STAMP ----------
  function startStamp() { if (P.stamp.done) return; S.hold = { kind: 'stamp', v: 0 }; S.greenSeen = false; }
  function endStamp() { const H = S.hold; S.hold = null; if (!H) return; const v = H.v;
    if (v < STAMPZ[0]) { P.decal.material.opacity = Math.max(P.decal.material.opacity, 0.25); P.stamp.tries = (P.stamp.tries || 0) + 1; flash('TOO LIGHT · PRESS AGAIN, HARDER', '#ffffff', 1.3); SFX.press(false); SFX.tap(); return; }
    P.stamp.done = true; P.stamp.q = clamp((v <= STAMPZ[1] ? 1 : v < 1 ? 0.8 : 0.55) - (P.stamp.tries || 0) * 0.1, 0.4, 1); P.decal.material.opacity = 1; if (v >= 1) { P.decal.scale.set(1.15, 1.3, 1); P.decal.rotation.z = 0.12; P.decal.material.color.set('#ff8a7a'); }
    flash(v <= STAMPZ[1] ? 'CRISP STAMP!' : v < 1 ? 'A BIT HEAVY' : 'SMUDGED!', v <= STAMPZ[1] ? '#22c55e' : v < 1 ? '#e6b45a' : '#ec3013', 1.2); SFX.press(false); SFX.thunk(v <= STAMPZ[1] ? 2 : v < 1 ? 1 : 0); buzz(80); const p = wp(P.decal); for (let i = 0; i < 5; i++) puff(p.x + rr(-0.2, 0.2), p.y + rr(-0.1, 0.1), p.z + 0.15, 0xffffff, 1); checkDone(); }

  // ---------- input ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function onDown(e) { audio.init && audio.init(); SFX.ambience(); S.lastInput = performance.now(); if (DM.on || S.phase !== 'work' || !P || S.move || S.hold) return; const { x, y } = local(e); e.preventDefault(); const T = S.tool; S.ptr = { x, y, kind: null, t: performance.now() };
    if (T === 'cast') { if (P.cast === 'empty' || P.cast === 'short') startPour(); }
    else if (T === 'forge') strike();
    else if (T === 'weld') { S.ptr.kind = 'weld'; torch.visible = true; weldMove(x, y, 0, 0); }
    else if (T === 'bolt') { const lb = boltAt(x, y, 70, ['loose']); if (lb) { S.twist = { b: lb, a: null }; S.ptr.kind = 'twist'; return; } const mb = boltAt(x, y, 52, ['mark']); if (mb) { drill(mb); return; } flash(P.bolts.some(b => b.st === 'mark') ? 'TAP A RED MARK TO DRILL IT' : 'PUT YOUR FINGER ON A BOLT AND DRAW CIRCLES', '#ffffff', 1.2); }
    else if (T === 'paint') { if (!S.brush) { flash('PICK A CAMO BELOW', '#ffffff', 1.2); return; } S.ptr.kind = 'paint'; paintMove(x, y); }
    else if (T === 'stamp') startStamp(); }
  function onMove(e) { const Pt = S.ptr; if (!Pt || !Pt.kind || !P) return; const { x, y } = local(e), d = Math.hypot(x - Pt.x, y - Pt.y), now = performance.now(); if (d < 1) return;
    if (Pt.kind === 'weld') { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const h = ray.intersectObjects(P.paintable.filter(m => m.visible), false)[0]; if (h) torch.position.copy(h.point).add(V3(0, 0, 0.06)); torch.scale.setScalar(0.35); weldMove(x, y, d, now - Pt.t); }
    else if (Pt.kind === 'twist') twistMove(x, y);
    else if (Pt.kind === 'paint') { const n = Math.ceil(d / 14); for (let i = 1; i <= n; i++) paintMove(Pt.x + (x - Pt.x) * i / n, Pt.y + (y - Pt.y) * i / n); }
    Pt.x = x; Pt.y = y; Pt.t = now; }
  function onUp() { if (S.hold && S.hold.kind === 'cast') endPour(); else if (S.hold && S.hold.kind === 'stamp') endStamp(); if (S.twist) endTwist(); torch.visible = false; S.ptr = null; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- flow ----------
  function drawBoard() { const n = save.stat(SAVE.shipped, 0); Y.drawBoard([['DAY ' + S.day + ' · ' + TANKWORKS.perDay + ' ORDERS'], ['PARTS SHIPPED ' + n, '#ffd23a'], ['NEXT MK-8 · ' + (n % 20) + ' / 20 PARTS', '#7dd3fc'], ['EMPLOYEE STARS ' + save.stat(SAVE.stars, 0)]]); } drawBoard();
  function startDay() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; audio.init && audio.init(); SFX.ambience(); S.dlg = null; Object.assign(S, { orderN: 0, earned: 0, tips: 0, starList: [], done: null, react: null }); setUniform(true); ben.visible = false; place(tread, Y.spots.tread, 0.9); SFX.whistle(1.0); say('TREAD: "Order coming in, recruit! The card says what it needs. Work the line, do it right."', 5); nextOrder(); }
  function shipIt() { if (S.phase !== 'work' || !P || S.move) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP SHIP IT AGAIN TO SEND IT', '#e6b45a', 2.2); return; } S.hold = null; S.twist = null; S.ptr = null; S.tool = null; S.phase = 'ship'; S.phT = 0; S.move = { from: P.g.position.x, to: SHIP_X, t: 0, ship: true }; SFX.conveyor(true); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['That is factory perfect!', 'Tread trained you well, recruit!', 'Built like a fortress!'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Solid work. It will hold.', 'Good part. Thanks, recruit!', 'Ready for the range.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['It will do. Some rough spots.', 'Hmm. Tread would not ship that.', 'Passable, recruit.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half of it is not done!', 'This will fall off on the first bump!', 'I am telling the Sergeant.'] } };
  function finishJob() { const T = P.job.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const made = T.filter(t => info(t).done).length, pay = P.D.price + made * 3, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('radio') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; cust.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: CU.name + ' · ' + CU.from, stars, tip, pay, t: 0 };
    scene.remove(P.g); crate.visible = true; crate.position.set(Y.crateSpot.x, Y.crateSpot.y, Y.crateSpot.z); crate.rotation.set(0, 0.2, 0); S.phase = 'react'; S.phT = 0;
    SFX.cash(); setTimeout(() => SFX.react(level), 350); if (stars === 3) { setTimeout(() => SFX.sparkle(), 900); const cc = [0xffd23a, 0xec3013, 0x22c55e, 0x7dd3fc, 0xffffff]; for (let i = 0; i < 5; i++) sparks(V3(cust.position.x, 2.4, cust.position.z + 0.3), 8, 5, cc[i], 1.4); for (let i = 0; i < 10; i++) puff(cust.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), cust.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; if (P) { scene.remove(P.g); P = null; } custFox.forEach(f => f.visible = false); crate.visible = false; ben.visible = true; place(ben, Y.spots.ben, -0.5); place(tread, Y.spots.tread, 0.6);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.shipped, save.stat(SAVE.shipped, 0) + S.starList.length); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('tankWorksUniform')) { save.setFlag('tankWorksUniform'); unlock.push('TANK WORKS HARD HAT + RAG (yours to keep)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    SFX.whistle(1.8); if (eod) setTimeout(() => SFX.fanfare(), 1600); S.done = { day: S.day, made: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1; drawBoard();
    const shipped = save.stat(SAVE.shipped, 0), mk = Math.floor(shipped / 20) > Math.floor((shipped - S.starList.length) / 20); if (mk) { S.done.mk8 = Math.floor(shipped / 20); setTimeout(() => SFX.fanfare(), 2600); }
    say(mk ? 'TREAD: "That makes 20 parts. Another MK-8 rolls out of the Tank Works!"' : eod ? 'TREAD: "Employee of the day! Outstanding, recruit."' : avg >= 2 ? 'TREAD: "Solid shift. Same time tomorrow."' : 'TREAD: "Rough one. Slow down and do each step right."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); SFX.cash(); return true; }
  function toIntro() { S.phase = 'intro'; S.done = null; S.dlg = null; ben.visible = true; place(ben, Y.spots.ben, -0.5); place(tread, Y.spots.tread, 0.6); }

  // ---------- WALK MODE (Game HUD) ----------
  const W = { yaw: 0, dist: 11, pitch: 0.55, vy: 0, y: 0, stick: { x: 0, y: 0 }, keys: new Set(), swing: 0, pad: false };
  const canStand = (x, z) => { const r = 0.32; return Y.walk(x - r, z - r) && Y.walk(x + r, z - r) && Y.walk(x - r, z + r) && Y.walk(x + r, z + r); };
  function startWalk() { audio.init && audio.init(); SFX.ambience(); if (P) { scene.remove(P.g); P = null; } custFox.forEach(f => f.visible = false); crate.visible = false; mould.visible = false; S.move = null; S.hold = null; S.twist = null; SFX.stopAll(); S.phase = 'walk'; S.done = null; S.dlg = null; ben.visible = true; place(ben, { x: Y.spots.ben.x, z: Y.spots.ben.z + 0.6 }, Math.PI * 0.85); place(tread, Y.spots.tread, 0.6); W.yaw = -0.35; W.y = 0; W.vy = 0; toast('Walk around the works. Talk to SGT. TREAD to start a shift.', 4); }
  const toast = (t, s = 3) => { S.toast = t; S.toastT = s; };
  const TALKS = [
    { id: 'tread', name: 'Talk to SGT. TREAD', at: () => tread.position, r: 2.6 },
    { id: 'tank', name: 'Look at the MK-8', at: () => V3(10, 0, -3.1), r: 2.4 },
    ...ORDER.map((k, i) => ({ id: 'st:' + k, name: 'Read the ' + TASKS[k].label + ' station', at: () => V3(ST_X[k], 0, 1.6), r: 1.1 }))];
  const STN = STATION_INFO;
  const TREAD_D = TREAD_TALK;
  function openTread(k = 'hello') { const D = TREAD_D[k]; S.dlg = { name: 'SGT. TREAD', role: 'TANK WORKS', text: D.text, choices: D.ch.map(c => ({ text: c[0], go: c[1] })) }; tread.userData.talking = true; tread.rotation.y = Math.atan2(ben.position.x - tread.position.x, ben.position.z - tread.position.z); SFX.dialog(); }
  function talk() { if (S.phase !== 'walk' || S.dlg) return; const n = S.near; if (!n) return; if (n.id === 'tread') openTread();
    else if (n.id === 'tank') toast(STATION_INFO.tank, 4.5); else toast(STN[n.id.slice(3)], 5); }
  function choose(i) { const d = S.dlg; if (!d || !d.choices || !d.choices[i]) return; const go = d.choices[i].go; SFX.blip(); if (go === 'work') { S.dlg = null; tread.userData.talking = false; toIntro(); return; } if (go === 'bye') { closeDialog(); return; } openTread(go); }
  function closeDialog() { S.dlg = null; tread.userData.talking = false; }
  function walkStep(dt) { const k = W.keys, kx = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0), ky = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    let sx = W.stick.x + kx, sy = W.stick.y + ky; const m = Math.hypot(sx, sy); if (m > 1) { sx /= m; sy /= m; } if (S.dlg) { sx = sy = 0; }
    const fx = -Math.sin(W.yaw), fz = -Math.cos(W.yaw), rx = Math.cos(W.yaw), rz = -Math.sin(W.yaw), vx = (rx * sx + fx * sy) * 4.4, vz = (rz * sx + fz * sy) * 4.4, sp = Math.hypot(vx, vz);
    const nx = ben.position.x + vx * dt, nz = ben.position.z + vz * dt; if (canStand(nx, ben.position.z)) ben.position.x = nx; if (canStand(ben.position.x, nz)) ben.position.z = nz;
    if (sp > 0.3) { const a = Math.atan2(vx, vz); let d = a - ben.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; ben.rotation.y += d * Math.min(1, dt * 12); }
    const wasAir = W.y > 0.02; W.vy -= 22 * dt; W.y = Math.max(0, W.y + W.vy * dt); if (W.y === 0) W.vy = 0; ben.position.y = W.y; if (wasAir && W.y === 0) SFX.land(); if (W.y === 0 && sp > 0.5) { W.stepD = (W.stepD || 0) + sp * dt; if (W.stepD > 0.85) { W.stepD = 0; SFX.step(); } }
    kit.animFox(ben, dt, sp, W.y > 0.02); if (W.swing > 0) { W.swing = Math.max(0, W.swing - dt * 3); BP.arms[1].rotation.x = -2.4 * Math.sin(W.swing * Math.PI); }
    let best = null, bd = 1e9; for (const t of TALKS) { const p = t.at(), d = Math.hypot(p.x - ben.position.x, p.z - ben.position.z); if (d < t.r && d < bd) { bd = d; best = t; } } S.near = best;
    if (!S.dlg && best && best.id === 'tread') tread.rotation.y = damp(tread.rotation.y, Math.atan2(ben.position.x - tread.position.x, ben.position.z - tread.position.z), 4, dt);
    const tg = V3(ben.position.x, 1.3 + W.y * 0.5, ben.position.z), cp = Math.cos(W.pitch), want = V3(tg.x + Math.sin(W.yaw) * cp * W.dist, tg.y + Math.sin(W.pitch) * W.dist, tg.z + Math.cos(W.yaw) * cp * W.dist);
    camera.position.lerp(want, Math.min(1, dt * 5)); CAM.look.lerp(tg, Math.min(1, dt * 6)); camera.lookAt(CAM.look); }
  const onKD = e => { if (S.phase !== 'walk') return; if (S.dlg) { const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[e.code]; if (n != null) { choose(n); e.preventDefault(); } else if (e.code === 'Escape') closeDialog(); return; }
    if (e.code === 'KeyE' || e.code === 'Enter') { talk(); e.preventDefault(); return; } if (e.code === 'Space') { api.jump(); e.preventDefault(); return; } if (e.code === 'Digit1') { api.melee(); return; } if (e.code === 'Digit2') { api.range(); return; } W.keys.add(e.code); };
  const onKU = e => W.keys.delete(e.code), onBlur = () => W.keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- camera ----------
  // camera fit: frames the subject inside the FREE screen area (between the top bar / job card / bottom bar), then shifts the
  // lens centre onto that area (setViewOffset) so a big left column in landscape doesn't shrink the part.
  const { SAFE, fitShot } = cameraFit(ST), CAM = { look: V3(-9, 1.4, 2) }, FOV = 50, TAN = Math.tan(FOV * Math.PI / 360), fitC = new THREE.PerspectiveCamera(FOV, 1, 0.05, 80), fitCache = new Map(), _q = V3(), PP = { x: null, y: null };
  const region = () => { const W = CW(), H = CHh(); return { W, H, x0: Math.min(SAFE.left, W * 0.6), x1: W, y0: Math.min(SAFE.top, H * 0.5), y1: H - Math.min(SAFE.bottom, H * 0.45) }; };
  function fit2(pts, el, yaw, margin) { const R = region(), rw = Math.max(60, R.x1 - R.x0), rh = Math.max(60, R.y1 - R.y0); fitC.aspect = rw / rh; fitC.fov = 2 * Math.atan(TAN * rh / R.H) * 180 / Math.PI; fitC.updateProjectionMatrix();
    const dir = V3(Math.sin(yaw) * Math.cos(el), Math.sin(el), -Math.cos(yaw) * Math.cos(el)), tgt = V3(); pts.forEach(p => tgt.add(p)); tgt.multiplyScalar(1 / pts.length); const lim = 1 - margin * 1.2;
    const bounds = d => { fitC.position.copy(tgt).addScaledVector(dir, d); fitC.lookAt(tgt); fitC.updateMatrixWorld(); let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const p of pts) { _q.copy(p).project(fitC); if (_q.z > 1) return null; x0 = Math.min(x0, _q.x); x1 = Math.max(x1, _q.x); y0 = Math.min(y0, _q.y); y1 = Math.max(y1, _q.y); } return { x0, x1, y0, y1 }; };
    let d = 4; for (let it = 0; it < 5; it++) { let lo = 0.4, hi = 40; for (let k = 0; k < 22; k++) { const m = (lo + hi) / 2, b = bounds(m); if (b && b.x0 >= -lim && b.x1 <= lim && b.y0 >= -lim && b.y1 <= lim) hi = m; else lo = m; } d = hi; const b = bounds(d); if (!b) break;
      const th = Math.tan(fitC.fov * Math.PI / 360) * d, right = V3().setFromMatrixColumn(fitC.matrixWorld, 0), up = V3().setFromMatrixColumn(fitC.matrixWorld, 1); tgt.addScaledVector(right, (b.x0 + b.x1) / 2 * th * fitC.aspect).addScaledVector(up, (b.y0 + b.y1) / 2 * th); }
    return { pos: tgt.clone().addScaledVector(dir, d), look: tgt }; }
  function shotFor(key, ptsFn, el, yaw, margin = 0.06) { const R = region(), ck = key + '|' + R.W + 'x' + R.H + '|' + Math.round(R.x0) + '|' + Math.round(R.y0) + '|' + Math.round(R.y1); if (!fitCache.has(ck)) { if (fitCache.size > 80) fitCache.clear(); fitCache.set(ck, fit2(ptsFn(), el, yaw, margin)); } return fitCache.get(ck); }
  function lens(dt, free) { const W = CW(), H = CHh(); if (free) { if (camera.view && camera.view.enabled) camera.clearViewOffset(); camera.fov = FOV; camera.aspect = W / H; camera.updateProjectionMatrix(); PP.x = null; return; }
    const R = region(), cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2; if (PP.x == null) { PP.x = W / 2; PP.y = H / 2; } const r = Math.min(1, dt * 4); PP.x += (cx - PP.x) * r; PP.y += (cy - PP.y) * r;
    const fw = 2 * Math.max(PP.x, W - PP.x), fh = 2 * Math.max(PP.y, H - PP.y); camera.aspect = fw / fh; camera.fov = 2 * Math.atan(TAN * fh / H) * 180 / Math.PI; camera.setViewOffset(fw, fh, fw / 2 - PP.x, fh / 2 - PP.y, W, H); camera.updateProjectionMatrix(); }
  camera.position.set(-6, 3, 9); camera.lookAt(CAM.look);
  const bb = new THREE.Box3();
  function partPts(pad = 0.12) { P.g.updateMatrixWorld(true); bb.setFromObject(P.body); const a = bb.min, b = bb.max; return [V3(a.x - pad, a.y - pad, b.z), V3(b.x + pad, a.y - pad, b.z), V3(a.x - pad, b.y + pad, b.z), V3(b.x + pad, b.y + pad, b.z), V3((a.x + b.x) / 2, a.y - 0.14, a.z)]; }
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; for (const s of [Y.spots.ben, Y.spots.tread]) o.push(V3(s.x - 0.5, 0, s.z), V3(s.x + 0.5, 0, s.z), V3(s.x, 2.5, s.z)); if (!port) o.push(V3(-7.5, LY + 1.6, 0), V3(-13.6, 3.6, 3)); return o; }, 0.16, Math.PI - 0.55, port ? 0.1 : 0.05);
    if (!P) return shotFor('hall' + k, () => [V3(-13, 0, 0), V3(13, 0, 0), V3(0, 4, -2)], 0.2, Math.PI, 0.05);
    if (S.phase === 'arrive') return shotFor('arrive' + k, () => [V3(-13.5, LY, 0), V3(-7.5, LY + 2.2, 0), V3(-8, 0, 1.6)], 0.18, Math.PI - 0.2, 0.06);
    if (S.phase === 'leave') return shotFor('leave' + k, () => [V3(Y.spots.counter.x, 0, Y.spots.counter.z), V3(Y.spots.door.x, 0, Y.spots.door.z), V3(Y.spots.counter.x, 2.6, Y.spots.counter.z), V3(Y.spots.door.x, 2.6, Y.spots.door.z)], 0.3, Math.PI + 0.35, 0.08);
    if (S.phase === 'react') { const f = cust.position; return shotFor('react' + k + P.id, () => [V3(f.x - 1.1, 0.3, f.z), V3(f.x + 1.1, 0.3, f.z), V3(f.x, 2.7, f.z), V3(Y.crateSpot.x, Y.crateSpot.y + 0.5, Y.crateSpot.z)], 0.12, Math.PI + 0.5, 0.1); }
    if (S.move) { const x = Math.round(P.g.position.x * 2) / 2; return shotFor('mv' + k + P.id + ':' + x, () => partPts(0.6), 0.16, Math.PI, 0.08); }
    const T = S.tool; if (!T) return shotFor('st' + k + P.id + ':' + Math.round(P.g.position.x), () => partPts(0.5), 0.16, Math.PI, 0.08);
    const gx = P.g.position.x;
    if (T === 'cast') return shotFor('cast' + k + P.id + ':' + P.cast, () => P.cast === 'open' || P.cast === 'done' ? partPts(0.4) : [V3(gx - 0.95, LY + 0.1, 0.55), V3(gx + 0.95, LY + 0.1, 0.55), V3(gx - 0.95, LY + 1.7, 0.55), V3(gx + 0.95, 3.95, 0), V3(gx - 0.3, 3.95, 0)], 0.1, Math.PI, 0.06);
    if (T === 'forge') return shotFor('forge' + k + P.id, () => [...partPts(0.3), V3(gx, 3.25, 0), V3(gx - 0.9, LY, 0.5), V3(gx + 0.9, LY, 0.5)], 0.08, Math.PI, 0.06);
    return shotFor(T + k + P.id, () => partPts(T === 'paint' ? 0.16 : 0.08), 0.1, Math.PI, 0.06); }
  function hideWalls() { const c = camera.position; for (const w of Y.walls) w.g.visible = w.axis === 'z' ? (w.side > 0 ? c.z > w.at : c.z < w.at) : (w.side > 0 ? c.x > w.at : c.x < w.at); }

  // ---------- DEMO: autopilot makes one armour plate (every job) with captions; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {} };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.4); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = (p, j = 0) => { hand.visible = true; hand.position.copy(p).add(V3(j, 0, 0.2)); hand.scale.setScalar(0.6); };
  const cap = (id, key, text, wait = 1.9) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  function demoAct() { if (!P || S.move) return 0.3; const T = curTask();
    if (!T) { DM.cap = 'EVERY JOB DONE: TAP SHIP IT'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.ship) { DM.seen.ship = 1; return 1.6; } shipIt(); return 1; }
    if (T === 'cast') { if (S.hold) return 0.05; const w = cap('cast', 'HOLD', 'HOLD TO POUR THE STEEL. LET GO WHEN THE GAUGE IS IN THE GREEN'); if (w) return w; handAt(SPRUE()); startPour(); DM.pourTo = 0.84; return 0.05; }
    if (T === 'forge') { const w = cap('forge', 'TAP', 'TAP WHEN THE WHITE RING MEETS THE GREEN ONE. THE HAMMER STRIKES'); if (w) return w; DM.forge = true; hand.visible = false; return 0.5; }
    if (T === 'weld') { const si = curSeam(); const w = cap('weld', 'DRAG', 'DRAG ALONG THE GLOWING SEAM. STAY ON IT, DON\'T RUSH'); if (w) return w; const p = lp(P.seams[si][Math.min(P.seams[si].length - 1, P.seamProg[si] + 1)]); handAt(p); torch.visible = true; torch.position.copy(p).add(V3(0, 0, 0.06)); torch.scale.setScalar(0.35); weldAdvance(si, P.seamProg[si] + 1); return 0.07; }
    if (T === 'bolt') { torch.visible = false; const m = P.bolts.find(b => b.st === 'mark'); if (m) { const w = cap('drill', 'TAP', 'TAP EACH RED MARK TO DRILL A HOLE'); if (w) return w; handAt(wp(m.grp)); drill(m); return 0.6; }
      if (P.bolts.some(b => b.st === 'drill')) return 0.2; const b = P.bolts.find(q => q.st === 'loose'); if (!b) return 0.3; const w = cap('twist', 'CIRCLE', 'DRAW CIRCLES ON A BOLT TO SPIN IT. LET GO IN THE GREEN'); if (w) return w; handAt(wp(b.grp), Math.sin(performance.now() / 90) * 0.06); if (!S.twist) S.twist = { b, a: null }; b.v += 0.07; b.bolt.rotation.z -= 0.6; b.bolt.position.z = 0.05 * (1 - Math.min(1, b.v)); if (b.v >= 0.78) endTwist(); return 0.06; }
    if (T === 'paint') { if (S.brush !== P.job.camo) { const w = cap('camo', CAMO[P.job.camo].name, 'THE ORDER SAYS ' + CAMO[P.job.camo].name + ': PICK THAT CAMO BELOW', 2.2); if (w) return w; hand.visible = false; setBrush(P.job.camo); return 0.9; }
      const i = P.paintCov.findIndex(c => c !== P.job.camo); if (i < 0) return 0.3; const w = cap('spray', 'SWIPE', 'SWIPE OVER THE PART TO SPRAY THE CAMO ON'); if (w) return w; const p = lp(P.samples[i]); handAt(p); const s = scr(p); paintMove(s.x, s.y); if (P.paintCov[i] !== P.job.camo) P.paintCov[i] = P.job.camo; checkDone(); return 0.08; }
    if (T === 'stamp') { if (S.hold) return 0.05; const w = cap('stamp', 'HOLD', 'HOLD THE QC STAMP DOWN. LET GO IN THE GREEN'); if (w) return w; handAt(wp(P.decal)); startStamp(); DM.stampTo = 0.64; return 0.05; }
    return 0.5; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.35, hand.scale.x - dt * 0.8));
    if (S.hold && S.hold.kind === 'cast' && DM.pourTo != null) { if (P.fill >= DM.pourTo) { DM.pourTo = null; endPour(); DM.cd = 1.2; } return; }
    if (S.hold && S.hold.kind === 'stamp' && DM.stampTo != null) { if (S.hold.v >= DM.stampTo) { DM.stampTo = null; endStamp(); DM.cd = 1; } return; }
    if (DM.forge && S.tool === 'forge' && P && !S.move) { const T = forgeP(); if (T - S.forgeT < 0.03) { handAt(wp(P.body)); strike(); } if (info('forge').done) DM.forge = false; return; }
    if (S.phase === 'arrive') { DM.cap = 'A CUSTOMER BRINGS A WORK ORDER. THE PART STARTS AT THE FURNACE'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'ship') { DM.cap = 'THE PART ROLLS TO THE PICK-UP COUNTER'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE CUSTOMER CHECKS YOUR WORK. CLEAN JOBS EARN STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || (S.phase !== 'intro' && S.phase !== 'done')) return; audio.init && audio.init(); SFX.ambience(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.forge = false; DM.pourTo = DM.stampTo = null; DM.cap = 'WATCH A WORK ORDER AT THE TANK WORKS'; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 3; S.forceType = 'plate'; startDay(); S.forceType = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; SFX.stopAll(); hand.visible = false; torch.visible = false; S.hold = null; S.twist = null; S.ptr = null; S.react = null; S.flash = null; S.day = DM.day0; if (P) { scene.remove(P.g); P = null; } custFox.forEach(f => f.visible = false); crate.visible = false; mould.visible = false; Object.assign(S, { phase: 'intro', done: null, orderN: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, move: null }); toIntro(); }

  // ---------- hint ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !P || S.move) return null; const T = S.tool, H = (p, text, v = true) => ({ p, text, tool: T, r: 0.22, v });
    if (!T) return allDone() ? { text: 'ALL DONE · TAP SHIP IT', tool: 'ship' } : null;
    if (T === 'cast') { if (P.cast === 'open') return null; return S.hold ? { text: 'POURING · LET GO IN THE GREEN', tool: T } : H(SPRUE(), P.cast === 'short' ? 'SHORT · HOLD AGAIN TO TOP IT UP' : 'HOLD ANYWHERE TO POUR THE STEEL', false); }
    if (T === 'forge') return { text: 'TAP WHEN THE RING TURNS GREEN · ' + P.forge.hits + ' / ' + P.forge.need, tool: T };
    if (T === 'weld') { const si = curSeam(); if (si < 0) return null; return H(lp(P.seams[si][P.seamProg[si]]), 'DRAG ALONG THE GLOWING SEAM · ' + (si + 1) + ' / ' + P.seams.length); }
    if (T === 'bolt') { const m = P.bolts.find(b => b.st === 'mark'), l = P.bolts.find(b => b.st === 'loose'); if (S.twist) return { text: 'DRAW CIRCLES · LET GO IN THE GREEN', tool: T }; if (l) return H(wp(l.grp), 'FINGER ON THE BOLT · DRAW CIRCLES TO TIGHTEN'); if (m) return H(wp(m.grp), 'TAP THE RED MARK TO DRILL IT'); return null; }
    if (T === 'paint') { if (!S.brush) return { text: 'PICK ' + CAMO[P.job.camo].name + ' CAMO BELOW', tool: T }; const i = P.paintCov.findIndex(c => c !== P.job.camo); if (i < 0) return null; return H(lp(P.samples[i]), S.brush !== P.job.camo ? 'WRONG CAMO · ORDER SAYS ' + CAMO[P.job.camo].name : 'SWIPE TO SPRAY · ' + Math.round(info('paint').prog * 100) + '%'); }
    if (T === 'stamp') return S.hold ? { text: 'PRESSING · LET GO IN THE GREEN', tool: T } : H(wp(P.decal), 'HOLD ANYWHERE TO PRESS THE STAMP');
    return null; }
  let HINT = null, hintT = 0;

  function soundStep(dt) { if (!audio.ctx) return; const H = S.hold, work = S.phase === 'work' && P; SFX.at(P ? P.g.position.x : null); SFX.frame();
    SFX.music.mood(DM.on || ['arrive', 'work', 'ship', 'react', 'leave'].includes(S.phase) ? 'work' : S.phase === 'done' ? 'party' : 'chill');
    if (H && H.kind === 'cast' && P && Y.crucible.rotation.z > 0.6 && Math.random() < dt * 9) SFX.glug(P.fill);
    SFX.guide(!!(S.ptr && S.ptr.kind === 'weld'), S.guideNear || 0);
    if (H && H.kind === 'cast' && P) { SFX.pour(Y.crucible.rotation.z > 0.5, P.fill); if (P.fill >= pourZ()[0] && !S.greenSeen) { S.greenSeen = true; SFX.green(); } } else SFX.pour(false);
    if (H && H.kind === 'stamp') { SFX.press(true, H.v); if (H.v >= STAMPZ[0] && !S.greenSeen) { S.greenSeen = true; SFX.green(); } } else SFX.press(false);
    S.torchT = Math.max(0, (S.torchT || 0) - dt); SFX.torch(!!(S.ptr && S.ptr.kind === 'weld') || (DM.on && work && S.tool === 'weld' && S.torchT > 0), S.torchT > 0 ? 1 : 0);
    S.sprayT = Math.max(0, (S.sprayT || 0) - dt); SFX.spray(S.sprayT > 0);
    if (work && S.tool === 'forge' && !S.move && !info('forge').done) { const T = forgeP(), g = T - S.forgeT <= forgeG(), ph = S.forgeT < (S.lastFT || 0); if (ph) SFX.tick(false); if (g && !S.fGreen) SFX.tick(true); S.fGreen = g; S.lastFT = S.forgeT; }
    if (S.phase !== 'intro' && Math.random() < dt / 7) SFX.far(); }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const walkTo = (f, a, b, k) => { f.position.set(a.x + (b.x - a.x) * k, 0, a.z + (b.z - a.z) * k); f.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); };
  function step(dt) { const t = clock.elapsedTime; S.phT += dt;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; S.toastT -= dt; if (S.toastT <= 0) S.toast = null;
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    fireL.intensity = 2 + Math.sin(t * 9) * 0.25 + Math.sin(t * 23) * 0.15; Y.glow.forEach((g, i) => g.material.color.setHSL(0.07 + Math.sin(t * 6 + i) * 0.01, 1, 0.55 + Math.sin(t * 8 + i) * 0.04));
    if (S.advance) { S.advance.t -= dt; if (S.advance.t <= 0) { const a = S.advance; S.advance = null; if (P && S.phase === 'work') moveTo(a.task); } }
    fxStep(dt, t); soundStep(dt);
    for (const B of blobs) { B.m.visible = B.f.visible; if (!B.f.visible) continue; const h = B.f.position.y; B.m.position.set(B.f.position.x, 0.015, B.f.position.z); B.m.scale.setScalar(Math.max(0.4, 1 - h * 0.35)); B.m.material.opacity = 1; }
    if (S.nozT > 0) { S.nozT -= dt; if (S.nozT <= 0) nozzle.visible = false; }
    // crucible + stream
    const pouring = S.hold && S.hold.kind === 'cast'; Y.crucible.rotation.z = damp(Y.crucible.rotation.z, pouring ? 1.05 : 0, 6, dt);
    if (pouring && Y.crucible.rotation.z > 0.6) { const lip = Y.crucible.localToWorld(V3(-0.35, 0.24, 0)), sp = SPRUE(), L = lip.distanceTo(sp); Y.stream.visible = true; Y.stream.position.copy(lip).lerp(sp, 0.5).sub(Y.st.cast.position); Y.stream.scale.set(1, L, 1); Y.stream.lookAt(sp); Y.stream.rotateX(Math.PI / 2); Y.stream.position.copy(lip).lerp(sp, 0.5).sub(Y.st.cast.position); }
    else Y.stream.visible = false;
    if (P) { const g = P.g;
      if (S.phase === 'arrive') { const k = Math.min(1, S.phT / 3); g.position.x = LINE_IN - 1 + (ST_X.cast - LINE_IN + 1) * smooth(0, 1, k); const kc = Math.min(1, S.phT / 2.8); walkTo(cust, Y.spots.door, Y.spots.counter, kc); kit.animFox(cust, dt, kc < 1 ? 3 : 0); if (kc >= 1) cust.rotation.y = Math.PI - 0.6;
        if (S.phT > 3.1) { SFX.conveyor(false); SFX.clunk(); S.phase = 'work'; S.tool = 'cast'; arrive('cast'); say(CU.name + ' (' + CU.from + '): "' + P.job.line + '"', 4.5); tone(880, 0.08, 0.04); } }
      else { if (cust.visible && S.phase !== 'leave') { cust.position.set(Y.spots.counter.x, 0, Y.spots.counter.z); cust.rotation.y = S.phase === 'react' ? Math.atan2(camera.position.x - cust.position.x, camera.position.z - cust.position.z) : Math.PI - 0.6; kit.animFox(cust, dt, 0); } }
      if (S.move) { const M0 = S.move, dur = Math.abs(M0.to - M0.from) / 3.2 + 0.3; M0.t = Math.min(1, M0.t + dt / dur); g.position.x = M0.from + (M0.to - M0.from) * smooth(0, 1, M0.t);
        if (M0.t >= 1) { S.move = null; SFX.conveyor(false); SFX.clunk(); if (M0.ship) finishJob(); else arrive(M0.task); } }
      // pour + mould
      if (pouring) { S.hold.t += dt; P.fill = Math.min(1.08, P.fill + dt * (0.22 + 0.35 * Math.min(S.hold.t, 1.2))); if (Math.random() < dt * 12) { const sp = SPRUE(); puff(sp.x, sp.y + 0.1, sp.z, 0xffa040, 1); } if (P.fill >= 1.08) { for (let i = 0; i < 6; i++) puff(ST_X.cast + rr(-0.6, 0.6), LY + 1.7, rr(-0.3, 0.3), 0xff7a1a, 1); endPour(); } }
      gBar.scale.y = Math.max(0.001, Math.min(1.08, P.fill)); gBar.position.y = 0.2 + gBar.scale.y / 2; gBar.material.color.set(P.fill > pourZ()[1] ? 0xff4a1a : 0xff8a1a);
      if (P.cast === 'open') { P.openT += dt; const k = smooth(0, 1, Math.min(1, P.openT / 1.0)); halves[0].position.x = -0.45 - k * 1.0; halves[1].position.x = 0.45 + k * 1.0; halves.forEach(h => h.position.y = -k * 0.2); if (Math.random() < dt * 20) puff(ST_X.cast + rr(-0.5, 0.5), LY + rr(0.4, 1.5), 0.3, 0xffffff, 1); if (P.openT > 1.2) { mould.visible = false; P.cast = 'done'; checkDone(); } }
      // heat + forge
      if (P.heat > 0) { const hot = S.tool === 'forge' && !info('forge').done; P.heat = Math.max(hot ? 0.25 : 0, P.heat - dt * (hot ? 0.02 : info('forge').done || !P.job.tasks.includes('forge') ? 0.35 : 0.06)); } P.mat.emissiveIntensity = (P.heat || 0) * 0.75; P.mat.color.setRGB(1, 1 - (P.heat || 0) * 0.35, 1 - (P.heat || 0) * 0.6);
      const forging = S.phase === 'work' && S.tool === 'forge' && !S.move && !info('forge').done;
      if (forging) { const T = forgeP(); if (!DM.on || true) { S.forgeT += dt; if (S.forgeT > T) S.forgeT -= T; } const c = wp(P.body).add(V3(0, 0, 0.7)), R = Math.max(0.55, Math.max(P.h, P.type === 'barrel' ? 1.0 : 0.7) * 0.62), k = S.forgeT / T, near = T - S.forgeT <= forgeG();
        for (const r of [ringT, ringO]) { r.visible = true; r.position.copy(c); r.quaternion.copy(camera.quaternion); } ringT.scale.setScalar(R); ringO.scale.setScalar(R * (1 + 1.5 * (1 - k))); ringO.material.color.set(near ? 0x22c55e : 0xffffff); ringT.material.opacity = near ? 1 : 0.6; }
      else { ringT.visible = ringO.visible = false; }
      P.squash = Math.max(0, (P.squash || 0) - dt * 5); if (S.tool === 'forge' || P.squash > 0) { const k = Math.min(1, P.forge.hits / P.forge.need), base = P.lump.map(v => v + (1 - v) * k); P.body.scale.set(base[0] * (1 + P.squash * 0.08), base[1] * (1 - P.squash * 0.12), base[2]); }
      if (S.strikeT > 0) S.strikeT = Math.max(0, S.strikeT - dt * 4); { const rest = 3.0, bot = P ? LY + P.top + 0.21 : rest, k = S.strikeT > 0 ? Math.sin((1 - S.strikeT) * Math.PI) : 0; Y.ram.position.y = rest + (bot - rest) * k; }
    // bolts
      let drv = null; for (const b of P.bolts) { if (b.st === 'drill') { b.drillT += dt; drv = b; if (Math.random() < dt * 20) { const p = wp(b.grp); puff(p.x, p.y, p.z + 0.08, 0xc9ced3, 1); if (Math.random() < 0.5) sparks(p.clone().add(V3(0, 0, 0.06)), 2, 2.4, 0xffd27a, 0.3); } if (b.drillT > 0.5) { b.st = 'loose'; b.mk.visible = false; b.hole.visible = true; b.bolt.visible = true; b.bolt.position.z = 0.05; tone(880, 0.06, 0.04); checkDone(); } } }
      if (S.twist) drv = S.twist.b; driver.visible = !!drv && S.tool === 'bolt'; if (drv) { const p = wp(drv.grp); driver.position.copy(p).add(V3(0, 0, 0.12 + (drv.st === 'drill' ? 0.06 * (1 - Math.min(1, drv.drillT / 0.5)) : 0.04))); driver.userData.bit.rotation.z += dt * 40; }
      // stamp tool
      const stOn = S.tool === 'stamp' && !P.stamp.done && !S.move; stampT.visible = stOn; if (stOn) { const v = S.hold && S.hold.kind === 'stamp' ? S.hold.v : 0, p = wp(P.decal); stampT.position.copy(p).add(V3(0, 0, 0.45 * (1 - Math.min(1, v / 0.5)) + 0.02)); stampT.scale.set(1, 1, v > 0.5 ? 1 - Math.min(0.35, (v - 0.5) * 0.6) : 1); }
      if (S.hold && S.hold.kind === 'stamp') { S.hold.v = Math.min(1.1, S.hold.v + dt * 0.55); if (S.hold.v >= 1.1) endStamp(); }
      if (P.decal.material.opacity > 0 && P.stamp.done) P.decal.material.opacity = 1; }
    else { ringT.visible = ringO.visible = false; driver.visible = false; stampT.visible = false; }
    if (S.phase === 'react') { if (S.react) S.react.t += dt; if (S.phT > 3.0) { S.react = null; S.phase = 'leave'; S.phT = 0; cust.userData.hold = { left: true, right: true }; } }
    if (S.phase === 'leave') { const k = Math.min(1, S.phT / 2.6); walkTo(cust, Y.spots.counter, Y.spots.door, k); kit.animFox(cust, dt, 3); crate.position.copy(cust.position).add(V3(Math.sin(cust.rotation.y) * 0.45, 0.85, Math.cos(cust.rotation.y) * 0.45)); crate.rotation.y = cust.rotation.y;
      if (k >= 1) { SFX.doorbell(); cust.visible = false; crate.visible = false; if (DM.on) { demoStop(); return; } S.orderN++; if (S.orderN >= TANKWORKS.perDay) endDay(); else nextOrder(); } }
    // camera
    if (S.phase === 'walk') { lens(dt, true); walkStep(dt); } else { lens(dt, false); const sh = shot(), r = Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2)); camera.position.lerp(sh.pos, r); CAM.look.lerp(sh.look, r); camera.lookAt(CAM.look); }
    hideWalls();
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt); const vr = vis && vis.v ? Math.PI / 2 : 0; RINGS.pulse.rotation.x = RINGS.pulse2.rotation.x = vr; if (vis && vis.v) { RINGS.pulse.position.z += 0.06; RINGS.pulse2.position.z += 0.06; RINGS.pulse.scale.multiplyScalar(0.35); RINGS.pulse2.scale.multiplyScalar(0.35); RINGS.arrow.visible = false; }
    const greet = S.phase === 'intro' || S.phase === 'done'; if (S.phase !== 'walk') { kit.animFox(ben, dt, 0); ben.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); }
    tread.userData.talking = !!S.dlg || (!!S.say && S.say.startsWith('TREAD')); kit.animFox(tread, dt, 0); if (S.phase === 'work' || S.phase === 'arrive') { const tx = P ? P.g.position.x : 0; tread.rotation.y = damp(tread.rotation.y, Math.atan2(tx - tread.position.x, 0 - tread.position.z), 3, dt); } }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); PP.x = null; } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function press() { const H = S.hold, Tw = S.twist; if (H && H.kind === 'cast') { const [a, b] = pourZ(), v = P.fill; return { label: 'POUR · LET GO IN THE GREEN', v: v / 1.08, seg: [a, b - a, 1 - b, 0.08], zone: v < a ? 'SHORT' : v <= b ? 'JUST RIGHT' : v < 1 ? 'A BIT OVER' : 'SPILLING', ok: v >= a && v <= b, bad: v >= 1 }; }
    if (H && H.kind === 'stamp') { const v = H.v; return { label: 'STAMP · LET GO IN THE GREEN', v: v / 1.1, seg: [STAMPZ[0], STAMPZ[1] - STAMPZ[0], 1 - STAMPZ[1], 0.1], zone: v < STAMPZ[0] ? 'TOO LIGHT' : v <= STAMPZ[1] ? 'CRISP' : v < 1 ? 'HEAVY' : 'SMUDGE', ok: v >= STAMPZ[0] && v <= STAMPZ[1], bad: v >= 1 }; }
    if (Tw) { const v = Tw.b.v; return { label: 'TORQUE · LET GO IN THE GREEN', v: v / 1.1, seg: [TORQ[0], TORQ[1] - TORQ[0], 1 - TORQ[1], 0.1], zone: v < TORQ[0] ? 'LOOSE' : v <= TORQ[1] ? 'TIGHT' : v < 1 ? 'TOO TIGHT' : 'STRIPPING', ok: v >= TORQ[0] && v <= TORQ[1], bad: v >= 1 }; }
    return null; }
  function stdHud() { return { hp: 100, hpMax: 100, en: 100, gold: save.data.gold, hour: 10, day: 1, items: Object.entries(save.data.items || {}).filter(([, n]) => n > 0).map(([id, n]) => ({ id, n, label: id })), place: 'Tank Works', quest: { text: "SGT. TREAD'S TANK WORKS · TALK TO SGT. TREAD FOR A SHIFT" }, prompt: S.phase !== 'walk' || S.dlg ? null : S.near ? S.near.name : null, toast: S.phase === 'walk' ? S.toast : null, muted: false, weather: 'Clear', boat: false, inCave: false, weapons: [], dialog: S.dlg ? { name: S.dlg.name, role: S.dlg.role, text: S.dlg.text, choices: S.dlg.choices } : null, vehicles: [], vehAmmo: [] }; }
  function hud() { const J = P && P.job;
    return { phase: S.phase, day: S.day, orderN: S.orderN, perDay: TANKWORKS.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { cust: CU.name, from: CU.from, part: PARTS[J.type].name, serial: J.serial, camo: J.camo, camoName: CAMO[J.camo].name, camoCol: CAMO[J.camo].sw, cur: curTask() || null, tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt }; }) } : null,
      tool: S.tool, moving: !!S.move, brush: S.brush, allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500, press: press(),
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('tankWorksUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null, musicOn: SFX.music.on, std: stdHud(), camos: CK.map(k => ({ k, name: CAMO[k].name, col: CAMO[k].sw })) }; }
  frame();
  const api = {
    // page
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } }, setTool, setBrush, shipIt, startDay, startWalk, toIntro, demoStart, demoStop, buyUpgrade, hud, setMusic(on) { audio.init && audio.init(); SFX.ambience(); SFX.music.set(on); },
    // Game HUD engine contract (walk mode)
    start() {}, talk, choose, closeDialog, nextLine() { closeDialog(); }, clearToast() { S.toast = null; },
    melee() { if (S.phase === 'walk' && !S.dlg) { W.swing = 1; SFX.swing(); } }, meleeUp() {}, range() { if (S.phase === 'walk') toast('No blasters on the factory floor. Sergeant\'s rules!', 2.5); },
    jump() { if (S.phase === 'walk' && !S.dlg && W.y <= 0.001) { W.vy = 7.2; SFX.jump(); } }, useItem() { toast('Save it for after your shift.', 2); }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; }, setHudPad(v) { W.pad = !!v; },
    setStick(x, y) { W.stick.x = x; W.stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy(dx, dy) { W.yaw -= (dx || 0) * 0.006; W.pitch = clamp(W.pitch + (dy || 0) * 0.004, 0.15, 1.25); }, zoomBy(f) { W.dist = clamp(W.dist * (f || 1), 5, 16); }, getCam() { return { dist: W.dist, pitch: W.pitch }; }, setCam(d, pt) { if (d != null && isFinite(d)) W.dist = clamp(d, 5, 16); if (pt != null && isFinite(pt)) W.pitch = clamp(pt, 0.15, 1.25); }, setMinimap() {}, toggleSound() { audio.setMuted && audio.setMuted(!audio.muted); if (audio.muted) SFX.stopAll(); }, cycleWeather() {},
    mapData() { return { p: [ben.position.x, ben.position.z, ben.rotation.y], b: ORDER.map(k => [TASKS[k].label, ST_X[k], 0]).concat([['PICK-UP', 12.5, 1.4], ['MK-8', 10, -5.4]]), f: [[tread.position.x, tread.position.z]], e: [], q: [tread.position.x, tread.position.z, 'SGT. TREAD'] }; },
    // tests
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _force(t) { S.forceType = t; }, _state: () => S, _part: () => P, _info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geo: renderer.info.memory.geometries, tex: renderer.info.memory.textures }), _pts: () => partPts(0.3).map(v => v.toArray()), _fit: () => { const s = fit2(partPts(0.08), 0.1, Math.PI, 0.06); return [s.pos.toArray(), s.look.toArray(), SAFE]; }, _cam: () => ({ pos: camera.position.toArray(), look: CAM.look.toArray(), shot: (() => { const s = shot(); return [s.pos.toArray(), s.look.toArray()]; })() }), _scr: scr, _wp: wp, _lp: v => lp(v),
    destroy() { SFX.stopAll(); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
