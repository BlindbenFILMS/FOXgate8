// 8 GATES — UR GROUNDS [urGrounds]. Groundskeeper job in the walled quad of the UNIVERSITY OF UR (Ur's College, the 2D urCollege).
// A JOB LOCATION like Jon's Boatworks: one work order at a time, no clock, scored on quality. 3 orders = a day.
// Flow: a teacher walks out of the College door with a WORK ORDER → overnight mess appears (grass shoots up, fig leaves fall, weeds pop,
//   urns go dry) → Ben works the tasks in any order → HAND IN → the teacher inspects (DELIGHTED / HAPPY / OKAY / GRUMPY) + pays + tips.
// Tasks, one touch gesture each:
//   MOW   drag the mower with your finger over the long grass (mind the red sprinkler heads)
//   RAKE  swipe the fig leaves into the tarp
//   TRIM  swipe along the hedge to snip the sprigs, then draw a circle round the topiary to shape it
//   WEED  press a weed and pull it UP slowly (yank too fast and the root snaps)
//   WATER hold on an urn, let go in the green
//   PLANT tap a bare spot 3x to dig, pick the colour on the card, tap to plant
// WALK MODE: when not on shift the player walks the quad (Game HUD joystick): 1 KICK the ball · 2 WHISTLE (the ibises fly) · 3 JUMP;
//   TALK to Head Groundskeeper NINGAL at the shed to start a shift; TALK to Shesh on the bench.
// MERGE: buildGrounds(ctx) builds the quad at ctx.origin from a Meru-style ctx (THREE, M, toon, canvasTex, scene, origin, grad, addOutline)
//   and returns { root, colliders, spots, bounds, door } so any world can drop it behind a building door (quick fade) and walk it.
//   createGroundsKeeper({ container, onState }) runs it stand-alone. Save keys ur.grounds.*, flag urGroundsUniform.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { bakeCreature } from '../../engine/bake.js';

export const UR_GROUNDS = { name: 'UR GROUNDS', place: 'UNIVERSITY OF UR', room: 'urGrounds', perDay: 3 };
export const SEEDS = { lilac: { name: 'LILAC', col: '#b48ae6' }, gold: { name: 'GOLD', col: '#f2c94c' }, crimson: { name: 'CRIMSON', col: '#d8432f' }, white: { name: 'WHITE', col: '#f4f1e8' } };
const SK = Object.keys(SEEDS);
export const TASKS = { mow: { label: 'MOW', name: 'Mow the long grass' }, rake: { label: 'RAKE', name: 'Rake up the fig leaves' }, trim: { label: 'TRIM', name: 'Trim the hedge + topiary' }, weed: { label: 'WEED', name: 'Pull the weeds' }, plant: { label: 'PLANT', name: 'Plant the bare spots' }, water: { label: 'WATER', name: 'Water the urns' } };
const ORDER = ['mow', 'rake', 'trim', 'weed', 'plant', 'water'];
export const UPGRADES = [
  { id: 'mower', name: 'WIDE-DECK MOWER', cost: 40, line: 'Cuts a strip half again as wide.' },
  { id: 'broom', name: 'LEAF BROOM', cost: 30, line: 'Each swipe sweeps a wider path.' },
  { id: 'gloves', name: 'GARDEN GLOVES', cost: 30, line: 'Roots hold on, even on a quick pull.' },
  { id: 'shears', name: 'SHARP SHEARS', cost: 35, line: 'Snip more sprigs per swipe.' },
  { id: 'nozzle', name: 'BRASS NOZZLE', cost: 35, line: 'The green zone on the hose is wider.' },
  { id: 'radio', name: 'KUR-FM RADIO', cost: 60, line: 'Teachers tip 25% more.' }];
// teachers who send work orders: the College cast (Archivist Enhedu, Kubatum, Ku-Bau) + the Dean and a professor
const CLIENTS = [
  { name: 'DEAN ZABABA', fur: '#9a9a9e', furDark: '#6a6a70', torso: ['#c8642e', '#f2e2c8', '#8a3a18'], outfit: 'robe' },
  { name: 'ARCHIVIST ENHEDU', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#8a6ac8', '#efe7fb', '#4a3478'], outfit: 'robe' },
  { name: 'PROFESSOR NIDABA', torso: ['#2f6d5a', '#e6b45a', '#1d4438'], outfit: 'coat' },
  { name: 'KU-BAU', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#6b3e22', '#f2e2c8', '#3e2414'], outfit: 'vest' },
  { name: 'KUBATUM', torso: ['#e2453f', '#fbf8ec', '#a82c26'], outfit: 'dress' }];
const WHY = ['Visiting scholars from Gaya at noon.', 'Graduation photos on the quad today.', 'The library board walks through after lunch.', 'Poetry reading by the fountain tonight.', 'Parents day. Every fox brings a camera.', 'The king of Ur tours the College today.', 'Exam week. The students need somewhere calm.'];
const HELLO = ['Make the quad shine, please.', 'Ningal says you have green paws.', 'No rush. Do it properly.', 'The whole College will be looking.', 'I would do it myself but my robe is clean.'];
const SAVE = { day: 'ur.grounds.day', best: 'ur.grounds.best', upg: 'ur.grounds.upg.', stars: 'ur.grounds.stars' };
export const SHESH = ['SHESH: "Shh. Exam tomorrow. I am memorising the whole Ur tablet list."', 'SHESH: "The Archivist says the old lake used to be blue. Somebody is dumping something."', 'SHESH: "Ningal has worked this quad longer than the College has had a roof."', 'SHESH: "If you kick that ball into the fountain again the Dean will hear."'];
const WATER_ZONE = [0.45, 0.75], WATER_ZONE_UP = [0.36, 0.84];

// NPCs for a world that merges the quad (positions are in QUAD.spots, local to the quad origin). hat: 'straw' = strawHat() below.
export const GROUNDS_NPCS = [
  { key: 'ningal', name: 'NINGAL', role: 'Head Groundskeeper', spot: 'ningal', ry: -0.5, look: { fur: '#b8a07a', furDark: '#7a6648' }, torso: ['#4a6a3a', '#e6b45a', '#2d4a22'], outfit: 'coat', hat: 'straw', talk: ['NINGAL: "Grass does not cut itself, young fox. Ready for a shift?"'], job: true },
  { key: 'shesh', name: 'SHESH', role: 'Student', spot: 'shesh', ry: Math.PI + 0.6, look: { fur: '#e8d2b0', furDark: '#b49a74' }, torso: ['#38bdf8', '#e0f2fe', '#0b3a52'], outfit: 'tee', talk: SHESH }];
// ---------------- layout (metres, x east, z south, quad centre = origin) ----------------
export const QUAD = {
  W: 13, D: 10,                                   // half sizes: walls at x ±13, z ±10
  mow: { x0: 2.0, x1: 8.8, z0: -7.8, z1: -2.0, nx: 14, nz: 12 },
  hedge: { x0: -8.8, x1: -3.4, z: -7.4, h: 1.0, d: 0.8 }, topiary: { x: -2.3, z: -7.4 },
  urns: [-8.3, -6.9, -5.5, -4.1, -2.7].map(x => ({ x, z: -3.5 })),
  bed: { x0: -8.8, x1: -3.6, z0: 2.4, z1: 6.8 }, plantRow: [-7.7, -6.2, -4.7].map(x => ({ x, z: 6.15 })),
  tree: { x: 5.4, z: 4.6 }, tarp: { x: 2.7, z: 7.5, r: 0.8 }, rake: { x0: 1.6, x1: 9.2, z0: 1.6, z1: 8.3 },
  shed: { x0: 10.0, x1: 12.8, z0: 5.6, z1: 9.6 },
  spots: { ningal: { x: 9.3, z: 7.3 }, benIntro: { x: 8.2, z: 7.7 }, client: { x: 2.2, z: 2.6 }, door: { x: 0, z: -9.3 }, walkStart: { x: 0.5, z: 6.6 }, shesh: { x: -1.9, z: 8.3 }, ball: { x: -2.2, z: 2.9 } },
  route: [[0, -9.3], [0, -3.4], [2.3, -2.3], [3.3, 0], [2.2, 2.6]],
};

// ---------------- the walled quad ----------------
export function buildGrounds(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, Q = QUAD, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const G = { root, front: { s: [], e: [], w: [] }, colliders: [], spots: Q.spots, bounds: { x0: -12.45, x1: 12.45, z0: -9.3, z1: 9.4 }, door: { x: 0, z: -9.6, to: 'urCollege' } };
  const box = (x0, x1, z0, z1) => G.colliders.push({ k: 'b', x0, x1, z0, z1 }), circ = (x, z, r) => G.colliders.push({ k: 'c', x, z, r });
  const grad = ctx.grad, tm = (tex, col = '#ffffff') => new T3.MeshToonMaterial({ map: tex, color: col, gradientMap: grad });
  const brick = toon('#c8642e'), brickD = toon('#9a4a22'), stone = toon('#efd9b4'), stoneD = toon('#d8bb8a'), ink = toon('#201e1d'), gold = toon('#e6b45a'), wood = toon('#7a4a2a'), green = toon('#3f7a34'), greenD = toon('#2d5e26');
  // ground: terracotta paving everywhere, lawns on top
  const paveT = CTX(256, 256, c => { c.fillStyle = '#d9925a'; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 8; y++) for (let x = 0; x < 4; x++) { c.fillStyle = ['#d68a52', '#dd9a62', '#cf844c', '#e0a068'][(x * 3 + y * 7) % 4]; c.fillRect(x * 64 + (y % 2) * 32 + 2, y * 32 + 2, 60, 28); } }, [13, 10]);
  { const out = new T3.Mesh(new T3.PlaneGeometry(160, 160), toon('#c98a5a')); out.rotation.x = -Math.PI / 2; out.position.y = -0.02; root.add(out); }
  const ground = new T3.Mesh(new T3.PlaneGeometry(26, 20), tm(paveT)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; root.add(ground);
  const lawnT = CTX(128, 128, c => { c.fillStyle = '#5aa83a'; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 260; i++) { c.fillStyle = i % 2 ? '#62b240' : '#4f9a34'; c.fillRect((i * 37) % 128, (i * 53) % 128, 2, 5); } }, [3, 3]);
  const lawnM = tm(lawnT); lawnM.side = T3.DoubleSide; const lawns = [[1.4, 9.4, -8.4, -1.4], [-9.4, -1.4, -8.4, -1.4], [-9.4, -1.4, 1.4, 8.4], [1.4, 9.4, 1.4, 8.4]];
  for (const [x0, x1, z0, z1] of lawns) { const s = new T3.Shape(); s.moveTo(x0, z0); s.lineTo(x1, z0); s.lineTo(x1, z1); s.lineTo(x0, z1); s.lineTo(x0, z0);
    const g = new T3.ShapeGeometry(s); g.rotateX(Math.PI / 2); const m = new T3.Mesh(g, lawnM); m.position.y = 0.02; m.receiveShadow = true; root.add(m);
    const kerb = (x, z, w, d) => M(new T3.BoxGeometry(w, 0.08, d), stoneD, x, 0.04, z, root, 0); kerb((x0 + x1) / 2, z0, x1 - x0, 0.1); kerb((x0 + x1) / 2, z1, x1 - x0, 0.1); kerb(x0, (z0 + z1) / 2, 0.1, z1 - z0); kerb(x1, (z0 + z1) / 2, 0.1, z1 - z0); }
  { const p = new T3.Mesh(new T3.CircleGeometry(3.05, 40), tm(CTX(256, 256, c => { c.fillStyle = '#e8c79a'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#c99a62'; c.lineWidth = 4; for (let r = 20; r < 128; r += 22) { c.beginPath(); c.arc(128, 128, r, 0, 7); c.stroke(); } }))); p.rotation.x = -Math.PI / 2; p.position.y = 0.09; root.add(p); M(new T3.TorusGeometry(3.05, 0.06, 4, 48), stoneD, 0, 0.06, 0, root, 0).rotation.x = Math.PI / 2; }
  // fountain: a little stepped ziggurat with a U crest and water
  { const f = new T3.Group(); root.add(f); M(new T3.CylinderGeometry(1.9, 1.95, 0.5, 28), stone, 0, 0.25, 0, f, 0.03, 1.9); const water = new T3.Mesh(new T3.CylinderGeometry(1.72, 1.72, 0.06, 28), new T3.MeshToonMaterial({ color: '#4fb6d8', gradientMap: grad, transparent: true, opacity: 0.88 })); water.position.y = 0.44; f.add(water); G.water = water;
    M(new T3.BoxGeometry(1.1, 0.5, 1.1), brick, 0, 0.7, 0, f, 0.02); M(new T3.BoxGeometry(0.75, 0.45, 0.75), brickD, 0, 1.15, 0, f, 0.02); M(new T3.BoxGeometry(0.44, 0.4, 0.44), brick, 0, 1.55, 0, f, 0.02); M(new T3.SphereGeometry(0.16, 12, 8), gold, 0, 1.86, 0, f, 0.01, 0.16);
    G.jets = []; for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2, s = new T3.Mesh(new T3.CylinderGeometry(0.04, 0.09, 1, 6), new T3.MeshBasicMaterial({ color: '#cfefff', transparent: true, opacity: 0.7 })); s.position.set(Math.cos(a) * 0.62, 1.0, Math.sin(a) * 0.62); s.rotation.z = Math.cos(a) * 0.9; s.rotation.x = -Math.sin(a) * 0.9; f.add(s); G.jets.push(s); }
    circ(0, 0, 1.98); }
  // walls: tall College façade (north) + terracotta brick walls with an arcade on E / W / S
  const brickT = CTX(256, 256, c => { c.fillStyle = '#b85a2a'; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 16; y++) for (let x = 0; x < 8; x++) { c.fillStyle = ['#c8642e', '#bf5e2a', '#d0703a', '#b25628'][(x + y * 3) % 4]; c.fillRect(x * 32 + (y % 2) * 16 + 1, y * 16 + 1, 30, 14); } });
  brickT.wrapS = brickT.wrapT = T3.RepeatWrapping;
  const wallM = (rx, ry) => { const t = brickT.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return tm(t); };
  const side = (key, x, z, len, rotY) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = rotY; root.add(g); const H = 3.4;
    const w = new T3.Mesh(new T3.BoxGeometry(len, H, 0.5), wallM(len / 2, H / 2)); w.position.y = H / 2; w.castShadow = w.receiveShadow = true; g.add(w); M(new T3.BoxGeometry(len + 0.3, 0.2, 0.7), stone, 0, H + 0.1, 0, g, 0.015);
    // arcade: columns + arches 1.8 m in front of the wall, roof slab between
    for (let i = -len / 2 + 1.4; i <= len / 2 - 1.3; i += 2.6) { M(new T3.CylinderGeometry(0.17, 0.2, 2.6, 10), stone, i, 1.3, 1.8, g, 0.02, 0.2); M(new T3.BoxGeometry(0.5, 0.18, 0.5), stoneD, i, 2.66, 1.8, g, 0.01); M(new T3.BoxGeometry(0.46, 0.1, 0.46), stoneD, i, 0.05, 1.8, g, 0.01); }
    M(new T3.BoxGeometry(len, 0.42, 0.42), brick, 0, 2.95, 1.8, g, 0.02); M(new T3.BoxGeometry(len, 0.12, 2.1), toon('#8f3a1e'), 0, 3.2, 0.95, g, 0.02);
    for (let i = -len / 2 + 2.7; i <= len / 2 - 2.6; i += 2.6) { const a = new T3.Mesh(new T3.TorusGeometry(1.1, 0.12, 6, 16, Math.PI), stoneD); a.position.set(i, 2.55, 1.82); a.scale.y = 0.35; g.add(a); }
    G.front[key] = g; return g; };
  side('s', 0, 9.75, 26, Math.PI); side('e', 12.75, 0, 19.6, -Math.PI / 2); side('w', -12.75, 0, 19.6, Math.PI / 2);
  for (const z of [-7.4, -4.8, -2.2, 2.2, 4.8, 7.4]) { circ(11.0, z, 0.32); circ(-11.0, z, 0.32); } for (const x of [-11.6, -9, -6.4, -3.8, 3.8, 6.4, 9, 11.6]) circ(x, 8.0, 0.32);
  { const g = new T3.Group(); g.position.set(0, 0, -10); root.add(g); const H = 7.2; // College façade
    const w = new T3.Mesh(new T3.BoxGeometry(26.4, H, 0.6), wallM(13, 3.6)); w.position.y = H / 2; w.receiveShadow = true; g.add(w);
    M(new T3.BoxGeometry(27, 0.3, 1.0), stone, 0, H + 0.15, 0, g, 0.02); for (let i = -12; i <= 12; i += 2) M(new T3.BoxGeometry(0.9, 0.5, 0.9), brickD, i, H + 0.5, 0, g, 0.01);
    M(new T3.BoxGeometry(26.2, 0.25, 0.9), stoneD, 0, 3.6, 0.4, g, 0.01);
    for (const x of [-10, -7, -4, 4, 7, 10]) for (const y of [1.7, 5.2]) { M(new T3.BoxGeometry(1.2, 1.7, 0.2), toon('#3a5a7a', { emissive: new T3.Color('#ffd89a'), emissiveIntensity: y > 3 ? 0.15 : 0.05 }), x, y, 0.32, g, 0.02); M(new T3.BoxGeometry(1.5, 0.16, 0.35), stone, x, y - 0.95, 0.4, g, 0.01); }
    // the College door: big arched oak door with stone surround and steps
    M(new T3.BoxGeometry(3.6, 4.2, 0.4), stone, 0, 2.1, 0.32, g, 0.02); { const ar = M(new T3.CylinderGeometry(1.8, 1.8, 0.4, 20, 1, false, 0, Math.PI), stone, 0, 4.2, 0.32, g, 0.02); ar.rotation.x = Math.PI / 2; ar.rotation.y = Math.PI / 2; }
    M(new T3.BoxGeometry(2.6, 3.6, 0.2), wood, 0, 1.8, 0.52, g, 0.02); { const ar = M(new T3.CylinderGeometry(1.3, 1.3, 0.2, 18, 1, false, 0, Math.PI), wood, 0, 3.6, 0.52, g, 0.02); ar.rotation.x = Math.PI / 2; ar.rotation.y = Math.PI / 2; }
    M(new T3.BoxGeometry(0.06, 3.6, 0.22), ink, 0, 1.8, 0.63, g, 0); for (const x of [-0.3, 0.3]) M(new T3.TorusGeometry(0.1, 0.025, 6, 12), gold, x, 1.7, 0.66, g, 0);
    for (let i = 0; i < 3; i++) M(new T3.BoxGeometry(4.4 - i * 0.4, 0.14, 0.5), stoneD, 0, 0.07 + i * 0.14, 1.3 - i * 0.35, g, 0.01);
    const sign = CTX(1024, 160, c => { c.fillStyle = '#efd9b4'; c.fillRect(0, 0, 1024, 160); c.strokeStyle = '#9a4a22'; c.lineWidth = 10; c.strokeRect(8, 8, 1008, 144); c.fillStyle = '#7a3418'; c.font = '900 88px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('UNIVERSITY OF UR', 512, 86); });
    const s = new T3.Mesh(new T3.PlaneGeometry(7, 1.1), new T3.MeshBasicMaterial({ map: sign })); s.position.set(0, 6.3, 0.32); g.add(s);
    const ban = CTX(128, 256, c => { c.fillStyle = '#d8642a'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 128, 14); c.beginPath(); c.moveTo(0, 230); c.lineTo(64, 256); c.lineTo(128, 230); c.lineTo(128, 256); c.lineTo(0, 256); c.fill(); c.fillStyle = '#fbf8ec'; c.font = '900 110px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('U', 64, 120); c.fillStyle = '#7a3418'; c.fillRect(0, 230, 128, 0); });
    G.banners = []; for (const x of [-2.6, 2.6, -8.5, 8.5]) { const bg2 = new T3.Group(); bg2.position.set(x, 6.1, 0.36); g.add(bg2); const b = new T3.Mesh(new T3.PlaneGeometry(1.1, 2.4), new T3.MeshToonMaterial({ map: ban, gradientMap: grad, side: T3.DoubleSide })); b.position.y = -1.2; bg2.add(b); G.banners.push(bg2); }
    G.facade = g; }
  // lamp posts lining every path
  G.lamps = []; const lampHead = toon('#fff2c8', { emissive: new T3.Color('#ffd89a'), emissiveIntensity: 0.6 });
  const lamp = (x, z) => { const g = new T3.Group(); g.position.set(x, 0, z); root.add(g); M(new T3.CylinderGeometry(0.06, 0.09, 2.6, 8), ink, 0, 1.3, 0, g, 0.01, 0.09); M(new T3.BoxGeometry(0.34, 0.08, 0.34), ink, 0, 2.62, 0, g, 0); M(new T3.BoxGeometry(0.24, 0.36, 0.24), lampHead, 0, 2.85, 0, g, 0.01); M(new T3.ConeGeometry(0.26, 0.2, 4), ink, 0, 3.12, 0, g, 0).rotation.y = Math.PI / 4; G.lamps.push(g); circ(x, z, 0.16); };
  for (const z of [-8.2, -5.0, 5.0, 8.2]) { lamp(-1.5, z); lamp(1.5, z); } for (const x of [-11.0, -7.0, -4.6, 4.6, 7.0, 11.0]) { lamp(x, -1.55); lamp(x, 1.55); }
  // benches
  const bench = (x, z, ry) => { const b = new T3.Group(); b.position.set(x, 0, z); b.rotation.y = ry; root.add(b); M(new T3.BoxGeometry(1.6, 0.08, 0.5), wood, 0, 0.48, 0, b, 0.012); M(new T3.BoxGeometry(1.6, 0.4, 0.07), wood, 0, 0.78, -0.24, b, 0.012); for (const s of [-0.7, 0.7]) M(new T3.BoxGeometry(0.08, 0.48, 0.46), ink, s, 0.24, 0, b, 0.008); const c = Math.abs(Math.cos(ry)); box(x - (c ? 0.85 : 0.3), x + (c ? 0.85 : 0.3), z - (c ? 0.3 : 0.85), z + (c ? 0.3 : 0.85)); return b; };
  bench(-2.9, -1.75, Math.PI); bench(2.9, 1.75, 0); bench(-9.6, -1.75, Math.PI);
  // hedge row + string line, the topiary in its planter
  { const H = Q.hedge, len = H.x1 - H.x0, cx = (H.x0 + H.x1) / 2; M(new T3.BoxGeometry(len, H.h, H.d), green, cx, H.h / 2, H.z, root, 0.03); for (let x = H.x0 + 0.3; x < H.x1; x += 0.55) M(new T3.SphereGeometry(0.32, 10, 8), greenD, x, H.h - 0.12, H.z + rr(-0.15, 0.15), root, 0, 0.32).scale.y = 0.55;
    for (const x of [H.x0 - 0.12, H.x1 + 0.12]) M(new T3.BoxGeometry(0.06, 1.3, 0.06), wood, x, 0.65, H.z + H.d / 2 + 0.05, root, 0.006); G.string = M(new T3.BoxGeometry(len + 0.24, 0.018, 0.018), toon('#ffd23a'), cx, H.h + 0.02, H.z + H.d / 2 + 0.05, root, 0);
    box(H.x0 - 0.15, H.x1 + 0.15, H.z - H.d / 2 - 0.05, H.z + H.d / 2 + 0.1);
    const T = Q.topiary; M(new T3.CylinderGeometry(0.42, 0.32, 0.5, 14), brick, T.x, 0.25, T.z, root, 0.02, 0.42); M(new T3.CylinderGeometry(0.06, 0.06, 0.5, 6), wood, T.x, 0.7, T.z, root, 0); circ(T.x, T.z, 0.6); }
  // urns
  G.urnMesh = Q.urns.map(u => { const g = new T3.Group(); g.position.set(u.x, 0, u.z); root.add(g); const pts = [[0, 0], [0.22, 0], [0.3, 0.12], [0.36, 0.42], [0.32, 0.66], [0.24, 0.76], [0.34, 0.86], [0.34, 0.92], [0, 0.92]].map(([a, b]) => new T3.Vector2(a, b));
    M(new T3.LatheGeometry(pts, 16), brick, 0, 0, 0, g, 0.02); M(new T3.CylinderGeometry(0.3, 0.3, 0.03, 16), toon('#6b4a2c'), 0, 0.9, 0, g, 0); M(new T3.TorusGeometry(0.34, 0.035, 6, 18), gold, 0, 0.89, 0, g, 0).rotation.x = Math.PI / 2; circ(u.x, u.z, 0.45); return g; });
  // the Dean's garden: raised brick bed with soil
  { const B = Q.bed, w = B.x1 - B.x0, d = B.z1 - B.z0, cx = (B.x0 + B.x1) / 2, cz = (B.z0 + B.z1) / 2; M(new T3.BoxGeometry(w + 0.3, 0.32, d + 0.3), brick, cx, 0.16, cz, root, 0.02);
    const soilT = CTX(128, 128, c => { c.fillStyle = '#6b4a2c'; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 300; i++) { c.fillStyle = i % 3 ? '#5a3e24' : '#7a5636'; c.fillRect((i * 29) % 128, (i * 61) % 128, 3, 3); } }, [3, 3]);
    const s = new T3.Mesh(new T3.PlaneGeometry(w, d), tm(soilT)); s.rotation.x = -Math.PI / 2; s.position.set(cx, 0.33, cz); s.receiveShadow = true; root.add(s); box(B.x0 - 0.2, B.x1 + 0.2, B.z0 - 0.2, B.z1 + 0.2);
    const pl = CTX(512, 128, c => { c.fillStyle = '#efd9b4'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#7a3418'; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText("THE DEAN'S GARDEN", 256, 66); });
    const p = new T3.Mesh(new T3.PlaneGeometry(1.6, 0.4), new T3.MeshBasicMaterial({ map: pl })); p.position.set(B.x1 - 0.9, 0.2, B.z1 + 0.16); root.add(p);
    G.bucket = M(new T3.CylinderGeometry(0.22, 0.17, 0.36, 12), toon('#8a9aa6'), B.x1 + 0.45, 0.18, B.z1 + 0.25, root, 0.012, 0.22); }
  // the old fig tree (canopy hides while you rake under it) + the leaf tarp
  { const T = Q.tree; M(new T3.CylinderGeometry(0.3, 0.45, 2.6, 10), toon('#6b4a2c'), T.x, 1.3, T.z, root, 0.03, 0.45); for (const [a, l] of [[0.6, 1.3], [2.4, 1.1], [4.2, 1.2]]) { const b = M(new T3.CylinderGeometry(0.1, 0.16, l, 6), toon('#6b4a2c'), T.x + Math.cos(a) * 0.4, 2.6, T.z + Math.sin(a) * 0.4, root, 0.01); b.rotation.z = Math.cos(a) * 0.7; b.rotation.x = -Math.sin(a) * 0.7; }
    G.canopy = new T3.Group(); root.add(G.canopy); for (const [dx, dy, dz, r, c] of [[0, 3.5, 0, 1.7, '#4f8a2a'], [1.2, 3.1, 0.5, 1.2, '#5aa83a'], [-1.1, 3.2, -0.4, 1.25, '#3f7a24'], [0.3, 3.0, -1.2, 1.1, '#5aa83a'], [-0.4, 3.1, 1.2, 1.1, '#4f8a2a']]) M(new T3.IcosahedronGeometry(r, 1), toon(c), T.x + dx, dy, T.z + dz, G.canopy, 0.04, r);
    circ(T.x, T.z, 0.5); const P = Q.tarp; G.tarp = M(new T3.CylinderGeometry(P.r, P.r, 0.02, 20), toon('#3a6ea5'), P.x, 0.035, P.z, root, 0.012, P.r);
    G.pile = M(new T3.SphereGeometry(0.62, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#c97a2a'), P.x, 0.03, P.z, root, 0.02, 0.62); G.pile.scale.set(1, 0.01, 1); G.pile.visible = false; }
  // the tool shed in the south-east corner (Ningal's)
  { const S = Q.shed, cx = (S.x0 + S.x1) / 2, cz = (S.z0 + S.z1) / 2, w = S.x1 - S.x0, d = S.z1 - S.z0; M(new T3.BoxGeometry(w, 2.5, d), toon('#5a7a4a'), cx, 1.25, cz, root, 0.03);
    const r = M(new T3.BoxGeometry(w + 0.5, 0.14, d + 0.5), toon('#8f3a1e'), cx, 2.6, cz, root, 0.02); r.rotation.z = -0.14; M(new T3.BoxGeometry(0.1, 1.9, 1.3), wood, S.x0 - 0.02, 0.95, cz + 0.6, root, 0.01);
    const sg = CTX(512, 128, c => { c.fillStyle = '#2d4a22'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#e6b45a'; c.font = '900 60px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('GROUNDS', 256, 66); });
    const s = new T3.Mesh(new T3.PlaneGeometry(1.8, 0.45), new T3.MeshBasicMaterial({ map: sg })); s.position.set(S.x0 - 0.04, 2.1, cz); s.rotation.y = -Math.PI / 2; root.add(s);
    for (let i = 0; i < 3; i++) { const t = M(new T3.CylinderGeometry(0.025, 0.025, 1.5, 5), wood, S.x0 - 0.12, 0.75, cz - 1.4 + i * 0.22, root, 0); t.rotation.x = 0.15; }
    const wb = new T3.Group(); wb.position.set(S.x0 - 0.9, 0, S.z0 + 0.1); root.add(wb); M(new T3.BoxGeometry(0.7, 0.32, 1.0), toon('#3a6ea5'), 0, 0.5, 0, wb, 0.012); M(new T3.CylinderGeometry(0.16, 0.16, 0.07, 12), ink, 0, 0.18, 0.55, wb, 0.01).rotation.z = Math.PI / 2;
    box(S.x0 - 0.1, S.x1, S.z0, S.z1); box(S.x0 - 1.3, S.x0 - 0.5, S.z0 - 0.45, S.z0 + 0.65); }
  // ---- polish: date palms, ivy, arcade lanterns, the U mosaic, lawn tufts + daisies ----
  const palm = (x, z, h = 4.4) => { const g = new T3.Group(); g.position.set(x, 0, z); root.add(g); const lean = 0.35;
    for (let i = 0; i < 9; i++) { const k = i / 9; M(new T3.CylinderGeometry(0.15 - k * 0.04, 0.2 - k * 0.04, h / 9 + 0.03, 8), toon(i % 2 ? '#9a6a3a' : '#7a5230'), lean * k * k, (i + 0.5) * h / 9, 0, g, 0.012); }
    const top = new T3.Group(); top.position.set(lean, h, 0); g.add(top);
    for (let k = 0; k < 9; k++) { const f = new T3.Group(); f.rotation.y = k / 9 * Math.PI * 2 + 0.2; top.add(f); const d = new T3.Group(); d.rotation.x = 0.35 + (k % 3) * 0.15; f.add(d); const leaf = M(new T3.BoxGeometry(0.34, 0.03, 1.7), toon(k % 2 ? '#5a9a2e' : '#3f7a24'), 0, 0, 0.85, d, 0.01); leaf.rotation.x = 0.18; }
    for (let k = 0; k < 6; k++) M(new T3.SphereGeometry(0.09, 6, 5), toon('#c8642e'), Math.cos(k) * 0.18, -0.15 - (k % 2) * 0.08, Math.sin(k) * 0.18, top, 0); circ(x, z, 0.32); };
  palm(-10.1, -8.7); palm(10.1, -8.7); palm(-10.1, 8.6); palm(10.1, 3.4);
  const ivyT = CTX(256, 256, c => { c.clearRect(0, 0, 256, 256); for (let i = 0; i < 26; i++) { const x = 30 + (i * 73) % 200, y0 = (i * 41) % 60; c.strokeStyle = '#3f6b2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y0); c.quadraticCurveTo(x + 20, 120, x - 10, 250); c.stroke(); for (let k = 0; k < 9; k++) { const yy = y0 + k * 24, xx = x + Math.sin(k + i) * 12; c.fillStyle = ['#4f8a2a', '#5aa83a', '#3f7a24'][(i + k) % 3]; c.beginPath(); c.ellipse(xx, yy, 11, 7, k + i, 0, 7); c.fill(); } } });
  const ivyM = new T3.MeshToonMaterial({ map: ivyT, gradientMap: grad, transparent: true, alphaTest: 0.4, side: T3.DoubleSide });
  const ivy = (parent, x, z, w = 2.4, h = 2.6) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), ivyM); m.position.set(x, 3.4 - h / 2, z); parent.add(m); };
  for (const k of ['s', 'e', 'w']) for (const x of [-6.2, 1.1, 7.6]) { if (k === 's' && Math.abs(x) < 2) continue; ivy(G.front[k], x, 0.27); }
  for (const x of [-11.4, -5.6, 5.6, 11.4]) ivy(G.facade, x, 0.32, 2.2, 3.2);
  const lanM = toon('#fff2c8', { emissive: new T3.Color('#ffc870'), emissiveIntensity: 0.7 });
  for (const k of ['s', 'e', 'w']) { const g = G.front[k], len = k === 's' ? 26 : 19.6; for (let i = -len / 2 + 2.7; i <= len / 2 - 2.6; i += 2.6) { M(new T3.CylinderGeometry(0.008, 0.008, 0.35, 4), ink, i, 2.95, 1.8, g, 0); M(new T3.BoxGeometry(0.18, 0.26, 0.18), lanM, i, 2.66, 1.8, g, 0.01); M(new T3.ConeGeometry(0.15, 0.12, 4), ink, i, 2.84, 1.8, g, 0).rotation.y = Math.PI / 4; } }
  { const mos = CTX(256, 256, c => { c.fillStyle = '#e8c79a'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.fillStyle = '#c8642e'; c.beginPath(); c.arc(128, 128, 110, 0, 7); c.fill(); c.fillStyle = '#e6b45a'; c.beginPath(); c.arc(128, 128, 96, 0, 7); c.fill(); c.fillStyle = '#7a3418'; c.font = '900 140px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('U', 128, 136); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; c.fillStyle = i % 2 ? '#fbf8ec' : '#7a3418'; c.fillRect(128 + Math.cos(a) * 103 - 4, 128 + Math.sin(a) * 103 - 4, 8, 8); } });
    const m = new T3.Mesh(new T3.CircleGeometry(1.05, 32), new T3.MeshToonMaterial({ map: mos, gradientMap: grad, transparent: true })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.015, -6.9); root.add(m); }
  { const spots = [], avoid = (x, z) => (x > 1.6 && x < 9.2 && z > -8.2 && z < -1.6) || (x > 1.4 && x < 9.4 && z > 1.4 && z < 8.4 && Math.hypot(x - Q.tree.x, z - Q.tree.z) < 3.3) || (x > -9 && x < -3.4 && z > 2.2 && z < 7) || Math.hypot(x, z) < 3.3 || (z < -6.8 && x < -2);
    for (const [x0, x1, z0, z1] of lawns) for (let i = 0; i < 70; i++) { const x = rr(x0 + 0.2, x1 - 0.2), z = rr(z0 + 0.2, z1 - 0.2); if (!avoid(x, z)) spots.push([x, z]); }
    const tg = new T3.ConeGeometry(0.09, 1, 4); tg.translate(0, 0.5, 0); const im = new T3.InstancedMesh(tg, toon('#3f8a28'), spots.length), dg = new T3.SphereGeometry(0.05, 6, 4), dm = new T3.InstancedMesh(dg, toon('#fbf8ec'), spots.length);
    const m4 = new T3.Matrix4(), q = new T3.Quaternion(), sc = new T3.Vector3(), ps = new T3.Vector3(); let nd = 0;
    spots.forEach(([x, z], i) => { const h = rr(0.12, 0.26); m4.compose(ps.set(x, 0.02, z), q.setFromEuler(new T3.Euler(rr(-0.2, 0.2), rr(0, 6), rr(-0.2, 0.2))), sc.set(1, h, 1)); im.setMatrixAt(i, m4); if (i % 4 === 0) { m4.compose(ps.set(x + 0.08, h + 0.03, z), q.identity(), sc.set(1, 0.6, 1)); dm.setMatrixAt(nd++, m4); } });
    dm.count = nd; root.add(im, dm); }
  // merge every static mesh into one mesh per material (outlines too): far fewer draw calls on phones
  root.userData.weak = [G.pile, G.water, G.bucket, G.string, G.tarp, ...G.jets]; try { G.baked = bakeCreature(T3, root); } catch (e) { console.warn('ur grounds bake skipped', e); }
  return G;
}

const near2 = (a, b) => (a.x - b.x) ** 2 + (a.z - b.z) ** 2;
export function pushOut(p, r, cols, B) { // circle vs colliders, then the bounds
  for (const c of cols) { if (c.k === 'c') { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + r; if (d < m) { if (d > 1e-4) { p.x = c.x + dx / d * m; p.z = c.z + dz / d * m; } else p.z = c.z + m; } }
    else { const qx = clamp(p.x, c.x0, c.x1), qz = clamp(p.z, c.z0, c.z1), dx = p.x - qx, dz = p.z - qz, d = Math.hypot(dx, dz);
      if (d < r) { if (d > 1e-4) { p.x = qx + dx / d * r; p.z = qz + dz / d * r; } else { const o = [p.x - c.x0, c.x1 - p.x, p.z - c.z0, c.z1 - p.z], i = o.indexOf(Math.min(...o)); if (i === 0) p.x = c.x0 - r; else if (i === 1) p.x = c.x1 + r; else if (i === 2) p.z = c.z0 - r; else p.z = c.z1 + r; } } } }
  if (B) { p.x = clamp(p.x, B.x0, B.x1); p.z = clamp(p.z, B.z0, B.z1); } return p; }

// straw sun hat (Ningal + the uniform)
export function strawHat(T3, M, toon, fox, band = '#3f6b2a') { const BP = fox.userData.P, hs = BP.head.scale.x || 1, hat = new T3.Group(); hat.position.set(0, BP.head.position.y + 0.25 * hs, 0.04); hat.scale.setScalar(hs); hat.rotation.x = 0.06; BP.body.add(hat);
  const straw = toon('#e6c27a'); M(new T3.CylinderGeometry(0.56, 0.58, 0.03, 22), straw, 0, 0, 0, hat, 0.012, 0.58); M(new T3.CylinderGeometry(0.25, 0.29, 0.24, 18), straw, 0, 0.13, 0, hat, 0.012, 0.29); M(new T3.CylinderGeometry(0.295, 0.295, 0.06, 18), toon(band), 0, 0.05, 0, hat, 0); return hat; }

export async function createGroundsKeeper({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#f6dcb0' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS, sun } = ST;
  scene.background = canvasTex(4, 256, c => { const gr = c.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#5a9ee0'); gr.addColorStop(0.55, '#a8cdeb'); gr.addColorStop(1, '#f6dcb0'); c.fillStyle = gr; c.fillRect(0, 0, 4, 256); });
  scene.fog = new THREE.Fog('#f0dcc0', 40, 95); camera.far = 140; camera.updateProjectionMatrix();
  sun.position.set(-6, 14, 8); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -16, far: 50 }); sun.shadow.camera.updateProjectionMatrix();
  const G = buildGrounds({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline }), Q = QUAD;
  // ---------- SFX: layered synth sounds through a shared room reverb (no files to load, nothing to fail on a phone) ----------
  const sfx = (() => { let bus = null; const A = audio;
    function ready() { if (!A.ctx || !A.master || A.muted) return false; if (!bus) { const c = A.ctx, dry = c.createGain(); dry.gain.value = 0.9; dry.connect(A.master); const rv = c.createConvolver(), len = Math.floor(c.sampleRate * 1.6), ir = c.createBuffer(2, len, c.sampleRate);
        for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2); } rv.buffer = ir; const wet = c.createGain(); wet.gain.value = 0.22; rv.connect(wet); wet.connect(A.master); bus = { dry, rv }; } return true; }
    const T = () => A.ctx.currentTime;
    function osc(type, f0, f1, dur, vol, { t = 0, att = 0.005, rev = 0.3, lp = 0, pan = 0 } = {}) { if (!ready()) return; const c = A.ctx, t0 = T() + t, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); let n = o; if (lp) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = lp; o.connect(f); n = f; } n.connect(g); route(g, rev, pan); o.start(t0); o.stop(t0 + dur + 0.05); }
    function noise(type, f0, f1, dur, vol, { t = 0, q = 1, att = 0.003, rev = 0.2, pan = 0 } = {}) { if (!ready() || !A.noise) return; const c = A.ctx, t0 = T() + t, sN = c.createBufferSource(); sN.buffer = A.noise; const f = c.createBiquadFilter(); f.type = type; f.Q.value = q; f.frequency.setValueAtTime(f0, t0); if (f1 && f1 !== f0) f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.linearRampToValueAtTime(vol, t0 + att); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); sN.connect(f); f.connect(g); route(g, rev, pan); sN.start(t0, Math.random() * 1.5); sN.stop(t0 + dur + 0.05); }
    function route(g, rev, pan) { let n = g; if (pan && A.ctx.createStereoPanner) { const p = A.ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); n = p; } n.connect(bus.dry); if (rev) { const s2 = A.ctx.createGain(); s2.gain.value = rev; n.connect(s2); s2.connect(bus.rv); } }
    let waterSrc = null;
    return {
      ui: (k = 0) => { osc('triangle', 1250 + k * 180, 1250 + k * 180, 0.05, 0.035, { rev: 0.1 }); osc('sine', 2500 + k * 300, 2500, 0.03, 0.015, { t: 0.01 }); },
      snip: () => { noise('highpass', 5000, 5000, 0.025, 0.12, { rev: 0.1 }); osc('sine', 3400, 2800, 0.05, 0.04); noise('highpass', 4200, 4200, 0.03, 0.1, { t: 0.07 }); osc('sine', 2900, 2500, 0.05, 0.03, { t: 0.07 }); },
      rustle: (k = 1) => noise('bandpass', 900, 2600, 0.2, 0.06 * k, { q: 0.7, att: 0.03, pan: Math.random() * 0.6 - 0.3 }),
      pop: () => { osc('sine', 700, 170, 0.14, 0.14, { rev: 0.15 }); noise('lowpass', 900, 300, 0.22, 0.09, { t: 0.04 }); osc('triangle', 1320, 1320, 0.08, 0.03, { t: 0.12, rev: 0.4 }); },
      snap: () => { noise('highpass', 2500, 2500, 0.03, 0.18); osc('square', 420, 160, 0.12, 0.05); osc('sawtooth', 300, 220, 0.25, 0.03, { t: 0.1, lp: 900 }); },
      dig: (n = 1) => { noise('lowpass', 1100, 350, 0.16, 0.13, { att: 0.01 }); osc('sine', 150 + n * 20, 60, 0.12, 0.12); noise('bandpass', 2400, 1200, 0.08, 0.04, { t: 0.05, q: 2 }); },
      plant: () => { noise('lowpass', 700, 250, 0.2, 0.08); [784, 1046, 1318].forEach((f, i) => osc('triangle', f, f, 0.25, 0.045, { t: 0.06 + i * 0.07, rev: 0.45 })); },
      waterOn: () => { if (!ready() || !A.noise || waterSrc) return; const c = A.ctx, sN = c.createBufferSource(); sN.buffer = A.noise; sN.loop = true; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.8; const g = c.createGain(); g.gain.setValueAtTime(0.0001, T()); g.gain.linearRampToValueAtTime(0.07, T() + 0.08);
        const l = c.createOscillator(); l.frequency.value = 9; const lg = c.createGain(); lg.gain.value = 600; l.connect(lg); lg.connect(f.frequency); sN.connect(f); f.connect(g); route(g, 0.15, 0); sN.start(); l.start(); waterSrc = { sN, l, g }; },
      waterOff: (q = 1) => { if (waterSrc) { const w = waterSrc; waterSrc = null; try { w.g.gain.setTargetAtTime(0.0001, T(), 0.05); setTimeout(() => { try { w.sN.stop(); w.l.stop(); } catch (e) {} }, 300); } catch (e) {} } if (q != null) noise('lowpass', 3000, 500, 0.35, q < 1 ? 0.12 : 0.06, { att: 0.01 }); },
      clunk: () => { [523, 1307, 2191, 3020].forEach((f, i) => osc('sine', f, f * 0.98, 0.5 - i * 0.08, 0.07 - i * 0.012, { rev: 0.4 })); noise('bandpass', 1800, 900, 0.08, 0.12, { q: 3 }); noise('highpass', 6000, 6000, 0.6, 0.05, { t: 0.08, att: 0.05 }); },
      squeak: (k = 0) => osc('sine', 1100 + k * 150, 1900 + k * 200, 0.11, 0.05, { rev: 0.25 }),
      giggle: () => { for (let i = 0; i < 5; i++) osc('sine', 1300 + (i % 2) * 260, 1700 + (i % 2) * 300, 0.07, 0.045, { t: i * 0.085, rev: 0.3 }); },
      molePop: () => { noise('lowpass', 700, 200, 0.3, 0.16, { att: 0.01 }); osc('sine', 110, 55, 0.2, 0.12); osc('sine', 1100, 1900, 0.12, 0.045, { t: 0.22, rev: 0.3 }); },
      boop: () => { osc('triangle', 1400, 1400, 0.04, 0.09); osc('sine', 320, 720, 0.12, 0.12, { t: 0.02, rev: 0.25 }); osc('sine', 720, 300, 0.3, 0.1, { t: 0.14, rev: 0.35 }); },
      chime: () => [784, 988, 1175, 1568].forEach((f, i) => { osc('triangle', f, f, 0.5, 0.06, { t: i * 0.075, rev: 0.6 }); osc('sine', f * 2, f * 2, 0.25, 0.015, { t: i * 0.075, rev: 0.6 }); }),
      coins: (n = 4) => { for (let i = 0; i < n; i++) { const f = 2200 + Math.random() * 1400; osc('sine', f, f, 0.18, 0.035, { t: i * 0.07, rev: 0.5 }); osc('sine', f * 1.5, f * 1.5, 0.1, 0.015, { t: i * 0.07 }); } },
      fanfare: () => [[523, 659, 784], [587, 740, 880], [784, 988, 1175]].forEach((ch, i) => ch.forEach(f => osc('sawtooth', f, f, i === 2 ? 0.8 : 0.22, 0.03, { t: i * 0.18, lp: 2200, att: 0.02, rev: 0.5 }))),
      sad: () => [392, 370, 349, 311].forEach((f, i) => osc('sawtooth', f, f * (i === 3 ? 0.9 : 1), i === 3 ? 0.6 : 0.22, 0.04, { t: i * 0.22, lp: 900, att: 0.02, rev: 0.3 })),
      kick: () => { osc('sine', 160, 45, 0.18, 0.2); noise('bandpass', 1500, 600, 0.05, 0.1, { q: 1.5 }); },
      bump: () => osc('sine', 200, 90, 0.08, 0.08),
      splash: () => { noise('lowpass', 4000, 400, 0.5, 0.14, { att: 0.01, rev: 0.3 }); for (let i = 0; i < 4; i++) osc('sine', 1200 + Math.random() * 900, 600, 0.06, 0.02, { t: 0.05 + i * 0.05 }); },
      whoosh: () => noise('bandpass', 400, 1600, 0.35, 0.06, { q: 0.6, att: 0.08 }),
      honk: () => { osc('sawtooth', 330, 280, 0.16, 0.035, { lp: 1200, rev: 0.4 }); osc('sawtooth', 300, 250, 0.18, 0.03, { t: 0.22, lp: 1200, rev: 0.4 }); },
      hop: () => { osc('sine', 300, 600, 0.12, 0.05); noise('lowpass', 800, 300, 0.06, 0.04); },
      land: () => noise('lowpass', 600, 200, 0.08, 0.07),
      step: (soft, pan = 0) => noise('lowpass', soft ? 420 : 1300, soft ? 250 : 600, 0.06, soft ? 0.05 : 0.04, { att: 0.004, rev: 0.05, pan }),
      pullTug: () => noise('bandpass', 300, 600, 0.12, 0.05, { q: 1.2 }),
      sparkle: () => [1568, 2093, 2637].forEach((f, i) => osc('sine', f, f, 0.3, 0.02, { t: i * 0.05, rev: 0.7 })),
      door: () => { noise('lowpass', 500, 200, 0.35, 0.08, { att: 0.05 }); osc('sine', 90, 70, 0.3, 0.06, { t: 0.25 }); },
    }; })();
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; scene.add(f); return f; };
  const mk = (o = {}) => strip(kit.makeFox({ ...CAST.player, crest: '', gear: 'none', mood: 'happy', ...o }));
  const lookOf = c => c.fur ? { ...CAST.player.look, fur: c.fur, furDark: c.furDark } : CAST.player.look;
  const ningal = mk({ look: { ...CAST.player.look, fur: '#b8a07a', furDark: '#7a6648' }, torso: ['#4a6a3a', '#e6b45a', '#2d4a22'], outfit: 'coat' }); strawHat(THREE, M, toon, ningal, '#c8642e');
  const walker = strip(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' }));
  const worker = mk({ outfit: 'tee', torso: ['#3f6b2a', '#3f6b2a', '#e6b45a'] }); const WP = worker.userData.P;
  const shesh = mk({ look: { ...CAST.player.look, fur: '#e8d2b0', furDark: '#b49a74' }, torso: ['#38bdf8', '#e0f2fe', '#0b3a52'], outfit: 'tee', mood: 'curious' });
  const clientFox = CLIENTS.map(c => { const f = mk({ look: lookOf(c), torso: c.torso, outfit: c.outfit }); f.visible = false; return f; });
  { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 86); g.fillStyle = '#e6b45a'; g.beginPath(); g.ellipse(0, 0, 34, 64, 0.5, 0, 7); g.fill(); g.strokeStyle = '#3f6b2a'; g.lineWidth = 7; g.beginPath(); g.moveTo(-26, 44); g.lineTo(24, -42); g.stroke(); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.05); g.fillStyle = '#e6b45a'; g.fillRect(-120, -26, 240, 52); g.font = 'italic 900 38px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2d4a22'; g.fillText('UR GROUNDS', 0, 2); g.restore(); });
    const U = dinerUniform(ST, worker, { print, printY: 1.17, stripe: '#3f6b2a', towelCol: '#3f6b2a' }); U.hat.visible = false; strawHat(THREE, M, toon, worker); }
  worker.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) m.visible = false; });
  const FOUNT = [{ k: 'c', x: 0, z: 0, r: 1.98 }];
  const place = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  const NPC_COL = [{ k: 'c', x: Q.spots.ningal.x, z: Q.spots.ningal.z, r: 0.4 }, { k: 'c', x: Q.spots.shesh.x, z: Q.spots.shesh.z, r: 0.4 }];
  place(ningal, Q.spots.ningal, -0.5); place(shesh, Q.spots.shesh, Math.PI + 0.6); place(walker, Q.spots.benIntro, -0.5); place(worker, Q.spots.benIntro, -0.5); worker.visible = false;
  // ibises by the fountain + the kickball
  const ibis = []; for (let i = 0; i < 4; i++) { const g = new THREE.Group(), wh = toon('#fbf8ec'), bk = toon('#201e1d'); M(new THREE.SphereGeometry(0.2, 10, 8), wh, 0, 0.5, 0, g, 0.012, 0.2).scale.set(0.8, 0.8, 1.4); const nk = M(new THREE.CylinderGeometry(0.035, 0.045, 0.32, 6), bk, 0, 0.72, 0.2, g, 0); nk.rotation.x = 0.5;
    const hd = M(new THREE.SphereGeometry(0.06, 8, 6), bk, 0, 0.86, 0.29, g, 0); const bl = M(new THREE.ConeGeometry(0.02, 0.26, 5), bk, 0, 0.8, 0.42, g, 0); bl.rotation.x = 2.1; for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.012, 0.012, 0.42, 4), bk, s * 0.06, 0.2, 0, g, 0);
    const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.14, 0.55, 0); g.add(w); M(new THREE.BoxGeometry(0.4, 0.02, 0.24), wh, s * 0.2, 0, 0, w, 0.006); M(new THREE.BoxGeometry(0.1, 0.022, 0.24), bk, s * 0.42, 0, 0, w, 0); return w; });
    const a = i * 1.7 + 0.4, home = { x: Math.cos(a) * 2.5, z: Math.sin(a) * 2.5 }; g.position.set(home.x, 0.09, home.z); scene.add(g); ibis.push({ g, wings, hd, home, fly: 0, t: rr(0, 6), a }); }
  const ball = M(new THREE.SphereGeometry(0.22, 14, 10), toon('#ec3013'), Q.spots.ball.x, 0.22, Q.spots.ball.z, scene, 0.015, 0.22); { const s = M(new THREE.TorusGeometry(0.222, 0.03, 4, 18), toon('#fbf8ec'), 0, 0, 0, ball, 0); s.rotation.y = Math.PI / 2; }
  const BALL = { x: Q.spots.ball.x, z: Q.spots.ball.z, y: 0, vx: 0, vz: 0, vy: 0 };
  // two students strolling the paths (walk / intro / day card only, so they never walk through a work shot)
  const ring = (a0, a1, n) => Array.from({ length: n }, (_, i) => { const a = a0 + (a1 - a0) * i / (n - 1); return [Math.cos(a) * 2.75, Math.sin(a) * 2.75]; });
  const STROLL = [{ name: 'GEME', look: { fur: '#d9a066', furDark: '#9a6a3a' }, torso: ['#b48ae6', '#efe7fb', '#5b21b6'], outfit: 'dress', path: [[-11.2, 0.75], [-3.1, 0.75], ...ring(Math.PI * 0.85, Math.PI * 0.15, 6), [3.1, 0.75], [11.2, 0.75]], lines: ['GEME: "The Dean says the quad has never looked this good."', 'GEME: "Did you see the moles in hard hats? I thought I was dreaming."', 'GEME: "Exam on the old Ur kings tomorrow. I keep mixing them up."'] },
    { name: 'ILU', look: { fur: '#8a8a90', furDark: '#5a5a60' }, torso: ['#2f6d5a', '#e6b45a', '#1d4438'], outfit: 'tee', path: [[0.75, -8.6], [0.75, -3.1], ...ring(-Math.PI * 0.35, Math.PI * 0.35, 6), [0.75, 3.1], [0.75, 9.0]], lines: ['ILU: "I come out here to read. It is quieter than the library."', 'ILU: "Kick the ball into the goal. Everyone does it."', 'ILU: "Ningal once grew a pumpkin the size of the fountain."'] }]
    .map(d => { const f = mk({ look: { ...CAST.player.look, ...d.look }, torso: d.torso, outfit: d.outfit, mood: 'happy' }); f.position.set(d.path[0][0], 0, d.path[0][1]); return { ...d, f, i: 1, dir: 1, wait: 0, li: 0 }; });
  function strollStep(dt) { const show = S.phase === 'walk' || S.phase === 'intro' || S.phase === 'done'; for (const d of STROLL) { d.f.visible = show; if (!show) continue; let spd = 0;
      if (d.talkT > 0) { d.talkT -= dt; d.f.userData.talking = true; const p = walker.position; d.f.rotation.y = Math.atan2(p.x - d.f.position.x, p.z - d.f.position.z); }
      else if (d.wait > 0) { d.wait -= dt; d.f.userData.talking = false; }
      else { d.f.userData.talking = false; const [tx, tz] = d.path[d.i], dx = tx - d.f.position.x, dz = tz - d.f.position.z, dd = Math.hypot(dx, dz); if (dd < 0.08) { d.i += d.dir; if (d.i >= d.path.length || d.i < 0) { d.dir *= -1; d.i += 2 * d.dir; d.wait = rr(2, 4); } }
        else { const s2 = Math.min(dd, 1.3 * dt); d.f.position.x += dx / dd * s2; d.f.position.z += dz / dd * s2; spd = 1.3; let r = Math.atan2(dx, dz) - d.f.rotation.y; while (r > Math.PI) r -= Math.PI * 2; while (r < -Math.PI) r += Math.PI * 2; d.f.rotation.y += r * Math.min(1, dt * 8); } }
      if (S.phase === 'walk' && Math.hypot(walker.position.x - d.f.position.x, walker.position.z - d.f.position.z) < 1.0) spd = 0; kit.animFox(d.f, dt, spd); } }
  // pollen drifting in the sunlight (one draw call)
  const POL = 70, polGeo = new THREE.BufferGeometry(), polA = new Float32Array(POL * 3), polV = []; for (let i = 0; i < POL; i++) { polA.set([rr(-11, 11), rr(0.4, 4), rr(-8.5, 8.5)], i * 3); polV.push(rr(0, 9)); } polGeo.setAttribute('position', new THREE.BufferAttribute(polA, 3));
  const pollen = new THREE.Points(polGeo, new THREE.PointsMaterial({ map: glowTex, color: 0xfff2c0, size: 0.16, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(pollen);
  function pollenStep(dt, t) { const a = polGeo.attributes.position.array; for (let i = 0; i < POL; i++) { const k = i * 3; a[k] += Math.sin(t * 0.4 + polV[i]) * dt * 0.25 + dt * 0.08; a[k + 1] += Math.sin(t * 0.7 + polV[i] * 2) * dt * 0.12; a[k + 2] += Math.cos(t * 0.3 + polV[i]) * dt * 0.2; if (a[k] > 11.5) a[k] = -11.5; } polGeo.attributes.position.needsUpdate = true; }
  // ---- polish: clouds, soft blob shadows, butterflies, rippling fountain water + droplets ----
  const cloudT = canvasTex(256, 128, c => { c.clearRect(0, 0, 256, 128); c.fillStyle = '#ffffff'; for (const [x, y, r] of [[70, 80, 40], [120, 60, 52], [175, 78, 40], [100, 92, 34], [150, 95, 32]]) { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); } c.fillStyle = 'rgba(214,226,240,0.9)'; c.fillRect(40, 100, 180, 20); });
  const clouds = []; for (let i = 0; i < 7; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: cloudT, fog: false, transparent: true, opacity: 0.92, depthWrite: false })); const a = i / 7 * Math.PI * 2; sp.position.set(Math.cos(a) * rr(42, 60), rr(20, 30), Math.sin(a) * rr(42, 60)); sp.scale.set(rr(16, 24), rr(7, 10), 1); scene.add(sp); clouds.push(sp); }
  const blobT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(40,24,10,0.55)'); g.addColorStop(1, 'rgba(40,24,10,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), blobs = [];
  const blob = (obj, r = 0.9) => { const m = new THREE.Mesh(blobGeo, new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false })); m.scale.setScalar(r); m.renderOrder = 2; scene.add(m); blobs.push({ m, obj, r }); };
  const groundY = (x, z) => Math.hypot(x, z) < 3.05 ? 0.1 : 0.045;
  const onGrass = (x, z) => Math.hypot(x, z) > 3.05 && [[1.4, 9.4, -8.4, -1.4], [-9.4, -1.4, -8.4, -1.4], [-9.4, -1.4, 1.4, 8.4], [1.4, 9.4, 1.4, 8.4]].some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
  const butterflies = []; for (let i = 0; i < 5; i++) { const g = new THREE.Group(), col = ['#f2c94c', '#b48ae6', '#fbf8ec', '#f07a72', '#7dd3fc'][i], wm = new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }); const wings = [-1, 1].map(s => { const w = new THREE.Group(); g.add(w); const m = new THREE.Mesh(new THREE.CircleGeometry(0.09, 8), wm); m.position.x = s * 0.08; m.rotation.x = -Math.PI / 2; w.add(m); return w; }); M(new THREE.CapsuleGeometry(0.012, 0.08, 2, 4), toon('#201e1d'), 0, 0, 0, g, 0).rotation.x = Math.PI / 2; scene.add(g);
    const c = [[-6.2, 4.6], [-5.5, -3.5], [-6, -6.5], [6, 6], [-2.6, 5]][i]; butterflies.push({ g, wings, c, t: rr(0, 9), sp: rr(0.5, 0.9) }); }
  const ripT = canvasTex(256, 256, c => { c.fillStyle = '#4fb6d8'; c.fillRect(0, 0, 256, 256); c.strokeStyle = 'rgba(220,248,255,0.55)'; c.lineWidth = 4; for (let r = 18; r < 128; r += 22) { c.beginPath(); c.arc(128, 128, r, 0.2 * r, 0.2 * r + 4); c.stroke(); } });
  ripT.center.set(0.5, 0.5); G.water.material.map = ripT; G.water.material.color.set('#ffffff'); G.water.material.needsUpdate = true;
  const drops = []; { const dm = new THREE.SpriteMaterial({ map: glowTex, color: 0xcfefff, transparent: true, depthWrite: false }); for (let i = 0; i < 20; i++) { const sp = new THREE.Sprite(dm); sp.scale.setScalar(0.12); scene.add(sp); drops.push({ sp, t: i / 20 }); } }
  // tools in Ben's paw (shears / trowel / watering can) for the close-up tasks
  const TOOLS = {}; { const hand = new THREE.Group(); hand.position.set(0, -0.44, 0.06); hand.scale.setScalar(0.8); WP.arms[1].add(hand); const steel = toon('#d7dde3'), grip = toon('#c42d3c'), ink2 = toon('#201e1d');
    const sh = new THREE.Group(); hand.add(sh); for (const s of [-1, 1]) { const b = new THREE.Group(); b.rotation.y = s * 0.18; sh.add(b); M(new THREE.BoxGeometry(0.04, 0.02, 0.42), steel, 0, 0, 0.26, b, 0.006); M(new THREE.TorusGeometry(0.05, 0.016, 5, 10), grip, s * 0.04, 0, -0.02, b, 0); TOOLS.blades = TOOLS.blades || []; TOOLS.blades.push(b); } sh.rotation.x = 1.2; TOOLS.trim = sh;
    const tr = new THREE.Group(); hand.add(tr); M(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), toon('#7a4a2a'), 0, 0, 0, tr, 0.006); const bl = M(new THREE.ConeGeometry(0.07, 0.22, 4), steel, 0, -0.18, 0, tr, 0.006); bl.rotation.x = Math.PI; bl.scale.z = 0.35; tr.rotation.x = 0.9; TOOLS.plant = tr; TOOLS.weed = null;
    const can = new THREE.Group(); hand.add(can); M(new THREE.CylinderGeometry(0.13, 0.15, 0.24, 12), toon('#3a8a5a'), 0, -0.12, 0.08, can, 0.01, 0.15); const sp2 = M(new THREE.CylinderGeometry(0.018, 0.026, 0.34, 6), toon('#3a8a5a'), 0, -0.06, 0.32, can, 0.006); sp2.rotation.x = -1.0; M(new THREE.CylinderGeometry(0.045, 0.02, 0.04, 8), steel, 0, 0.06, 0.47, can, 0).rotation.x = -1.0; M(new THREE.TorusGeometry(0.08, 0.015, 5, 10, Math.PI), ink2, 0, 0.02, 0.06, can, 0); TOOLS.water = can; const rk = new THREE.Group(); hand.add(rk); M(new THREE.CylinderGeometry(0.025, 0.025, 1.6, 6), toon('#7a4a2a'), 0, -0.3, 0.2, rk, 0.006).rotation.x = 0.5; const hd2 = new THREE.Group(); hd2.position.set(0, -0.98, 0.58); rk.add(hd2); M(new THREE.BoxGeometry(0.5, 0.04, 0.05), steel, 0, 0, 0, hd2, 0.006); for (let i = -4; i <= 4; i++) M(new THREE.BoxGeometry(0.02, 0.12, 0.02), steel, i * 0.06, -0.06, 0.02, hd2, 0); rk.visible = false; TOOLS.rake = rk;
    [TOOLS.trim, TOOLS.plant, TOOLS.water].forEach(t => t.visible = false); }

  // ---------- task props ----------
  // MOW: instanced grass tufts on a grid + a stripe overlay that shows which way you mowed + sprinkler heads
  const MW = Q.mow, cdx = (MW.x1 - MW.x0) / MW.nx, cdz = (MW.z1 - MW.z0) / MW.nz, cells = [];
  for (let j = 0; j < MW.nz; j++) for (let i = 0; i < MW.nx; i++) { const x = MW.x0 + (i + 0.5) * cdx, z = MW.z0 + (j + 0.5) * cdz; if (Math.hypot(x, z) < 3.4) continue; cells.push({ i, j, x, z, h: 0.06, cut: true, sp: false, ry: rr(0, 6), jx: rr(-0.08, 0.08), jz: rr(-0.08, 0.08), s: rr(0.85, 1.2) }); }
  [walker, worker, ningal, shesh, ...clientFox].forEach(f => blob(f, 1.0)); STROLL.forEach(d => blob(d.f, 1.0)); blob(ball, 0.5);
  const tuftGeo = new THREE.ConeGeometry(0.15, 1, 5); tuftGeo.translate(0, 0.5, 0); const tufts = new THREE.InstancedMesh(tuftGeo, toon('#4a9a30'), cells.length); tufts.castShadow = false; scene.add(tufts);
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _e = new THREE.Euler();
  const setTuft = (k) => { const c = cells[k]; _p.set(c.x + c.jx, 0.02, c.z + c.jz); _q.setFromEuler(_e.set(0, c.ry, 0)); _s.set(c.s, Math.max(0.001, c.sp ? 0.001 : c.h), c.s); _m.compose(_p, _q, _s); tufts.setMatrixAt(k, _m); };
  cells.forEach((_, k) => setTuft(k)); tufts.instanceMatrix.needsUpdate = true;
  const strCv = document.createElement('canvas'); strCv.width = MW.nx; strCv.height = MW.nz; const strG = strCv.getContext('2d'), strT = new THREE.CanvasTexture(strCv); strT.magFilter = THREE.NearestFilter; strT.colorSpace = THREE.SRGBColorSpace;
  const STRIPE = { long: '#3f8a28', x: '#86cc58', z: '#5fae3e' }; const paintCell = (c, k) => { strG.fillStyle = STRIPE[k]; strG.fillRect(c.i, c.j, 1, 1); strT.needsUpdate = true; };
  cells.forEach(c => paintCell(c, c.j % 2 ? 'x' : 'z'));
  { const o = new THREE.Mesh(new THREE.PlaneGeometry(MW.x1 - MW.x0, MW.z1 - MW.z0), new THREE.MeshToonMaterial({ map: strT, gradientMap: ST.grad, transparent: true, opacity: 0.85 })); o.rotation.x = -Math.PI / 2; o.position.set((MW.x0 + MW.x1) / 2, 0.03, (MW.z0 + MW.z1) / 2); scene.add(o); }
  const sprink = [0, 1, 2].map(() => { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.11, 0.13, 0.12, 12), toon('#ec3013'), 0, 0.06, 0, g, 0.01, 0.13); M(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 8), toon('#201e1d'), 0, 0.14, 0, g, 0); g.visible = false; scene.add(g); return g; });
  const mower = new THREE.Group(); { const red = toon('#c42d3c'), ink = toon('#201e1d'); M(new THREE.BoxGeometry(0.7, 0.22, 0.62), red, 0, 0.24, 0, mower, 0.015); M(new THREE.CylinderGeometry(0.2, 0.22, 0.16, 12), toon('#d7dde3'), 0, 0.42, 0.05, mower, 0.01, 0.22);
    for (const [x, z] of [[-0.34, -0.25], [0.34, -0.25], [-0.34, 0.25], [0.34, 0.25]]) M(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10), ink, x, 0.1, z, mower, 0.008, 0.1).rotation.z = Math.PI / 2;
    for (const s of [-1, 1]) { const h = M(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 5), ink, s * 0.24, 0.62, 0.55, mower, 0); h.rotation.x = 0.75; } M(new THREE.CylinderGeometry(0.025, 0.025, 0.56, 5), ink, 0, 0.95, 0.84, mower, 0).rotation.z = Math.PI / 2; }
  const MOWER_HOME = { x: 8.6, z: -1.9 }; mower.position.set(MOWER_HOME.x, 0, MOWER_HOME.z); mower.scale.setScalar(1.35); scene.add(mower); blob(mower, 1.1);
  // RAKE: fig leaves + the tarp
  const leafGeo = new THREE.PlaneGeometry(0.24, 0.15); leafGeo.rotateX(-Math.PI / 2); const leafMats = ['#c97a2a', '#e0a040', '#b8582a', '#d89a3a'].map(c => new THREE.MeshToonMaterial({ color: c, gradientMap: ST.grad, side: THREE.DoubleSide }));
  const leafPool = []; for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(leafGeo, leafMats[i % 4]); m.visible = false; scene.add(m); leafPool.push(m); }
  let leaves = [];
  // TRIM: sprigs on the hedge + the shaggy topiary
  const sprigGeo = new THREE.ConeGeometry(0.07, 0.34, 5); sprigGeo.translate(0, 0.17, 0); const sprigM = toon('#6fbf4a'); const sprigPool = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(sprigGeo, sprigM); addOutline(m, 0.01); m.visible = false; scene.add(m); sprigPool.push(m); }
  let sprigs = [];
  const topGeo = new THREE.IcosahedronGeometry(0.62, 3), topBase = topGeo.attributes.position.array.slice(), topN = new Float32Array(topBase.length / 3);
  for (let i = 0; i < topN.length; i++) { const x = topBase[i * 3], y = topBase[i * 3 + 1], z = topBase[i * 3 + 2], h = Math.sin(x * 23.1 + y * 17.3) * Math.cos(z * 19.7 - x * 7.1) + Math.sin(y * 41 + z * 13); topN[i] = h > 0.6 ? 0.42 : h > 0.1 ? 0.16 : -0.04; }
  const topiary = new THREE.Mesh(topGeo, toon('#3f7a34')); addOutline(topiary, 0.03, 0.62); topiary.position.set(Q.topiary.x, 1.5, Q.topiary.z); topiary.castShadow = true; scene.add(topiary);
  const setShag = k => { const a = topGeo.attributes.position.array; for (let i = 0; i < topN.length; i++) { const f = 1 + topN[i] * k; a[i * 3] = topBase[i * 3] * f; a[i * 3 + 1] = topBase[i * 3 + 1] * f; a[i * 3 + 2] = topBase[i * 3 + 2] * f; } topGeo.attributes.position.needsUpdate = true; topGeo.computeVertexNormals(); };
  const TOP = { shag: 0, done: true, q: 1, ang: 0, last: null, radii: [] }; setShag(0);
  // flowers: the Dean's garden rows, the plant row and the urns all use one builder
  const flowerGeo = { stem: new THREE.CylinderGeometry(0.025, 0.03, 1, 5).translate(0, 0.5, 0), petal: new THREE.SphereGeometry(0.075, 8, 6), eye: new THREE.SphereGeometry(0.055, 8, 6), leaf: new THREE.SphereGeometry(0.09, 6, 4) };
  const stemM = toon('#3f7a34'), eyeM = toon('#e6b45a');
  function flower(col, h = 0.5) { const g = new THREE.Group(), pv = new THREE.Group(); g.add(pv); const st = new THREE.Mesh(flowerGeo.stem, stemM); st.scale.y = h; pv.add(st); for (const s of [-1, 1]) { const l = new THREE.Mesh(flowerGeo.leaf, stemM); l.scale.set(1.4, 0.3, 0.6); l.position.set(s * 0.08, h * 0.35, 0); l.rotation.z = s * 0.5; pv.add(l); }
    const head = new THREE.Group(); head.position.y = h; pv.add(head); const pm = toon(col); for (let i = 0; i < 5; i++) { const p = new THREE.Mesh(flowerGeo.petal, pm); const a = i / 5 * Math.PI * 2; p.position.set(Math.cos(a) * 0.08, 0, Math.sin(a) * 0.08); p.scale.y = 0.5; head.add(p); } const e = new THREE.Mesh(flowerGeo.eye, eyeM); e.position.y = 0.02; head.add(e);
    g.userData = { pv, head, petals: head.children.slice(0, 5) }; return g; }
  const setBloom = (f, col) => { const m = toon(col); f.userData.petals.forEach(p => p.material = m); };
  const B = Q.bed, bedFlowers = []; for (const z of [3.05, 4.05, 5.05]) for (let x = B.x0 + 0.45; x < B.x1 - 0.2; x += 0.78) { const f = flower(SEEDS[SK[(bedFlowers.length * 3) % 4]].col, rr(0.4, 0.55)); f.position.set(x + rr(-0.06, 0.06), 0.33, z + rr(-0.06, 0.06)); scene.add(f); bedFlowers.push(f); }
  const plantSpots = Q.plantRow.map((p, i) => { const f = flower(SEEDS[SK[i % 4]].col, 0.45); f.position.set(p.x, 0.33, p.z); scene.add(f);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16), new THREE.MeshBasicMaterial({ color: '#2e1e10' })); hole.rotation.x = -Math.PI / 2; hole.position.set(p.x, 0.335, p.z); hole.visible = false; scene.add(hole);
    const mound = M(new THREE.SphereGeometry(0.16, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#7a5636'), p.x + 0.26, 0.33, p.z, scene, 0.008, 0.16); mound.visible = false;
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 20), new THREE.MeshBasicMaterial({ color: '#e6b45a', transparent: true, opacity: 0.7 })); ring.rotation.x = -Math.PI / 2; ring.position.set(p.x, 0.34, p.z); ring.visible = false; scene.add(ring);
    return { ...p, f, hole, mound, ring, st: 'tidy', dig: 0, col: null, anim: 1 }; });
  const urns = Q.urns.map((u, i) => { const f = flower(SEEDS[SK[(i + 1) % 4]].col, 0.62); f.position.set(u.x, 0.9, u.z); scene.add(f); const pud = new THREE.Mesh(new THREE.CircleGeometry(0.55, 18), new THREE.MeshBasicMaterial({ color: '#4fb6d8', transparent: true, opacity: 0.55, depthWrite: false })); pud.rotation.x = -Math.PI / 2; pud.position.set(u.x + 0.15, 0.035, u.z + 0.2); pud.visible = false; scene.add(pud); return { ...u, f, pud, lvl: 1, st: 'tidy', q: 1 }; });
  // WEED: weeds with roots
  const weedLeaf = new THREE.ConeGeometry(0.05, 0.3, 4); weedLeaf.rotateX(Math.PI / 2); weedLeaf.translate(0, 0, 0.15); const weedM = toon('#6a8a2a'), rootM = toon('#8a6a44');
  const weedPool = []; for (let i = 0; i < 8; i++) { const g = new THREE.Group(), top = new THREE.Group(); g.add(top); for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(weedLeaf, weedM); l.rotation.y = k * 1.05; l.rotation.x = -0.35; l.scale.x = 1.6; top.add(l); }
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.3, 4), weedM); st.position.y = 0.15; top.add(st); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 6), toon('#f2d94c')); hd.position.y = 0.32; top.add(hd); addOutline(hd, 0.01, 0.06);
    const root = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.36, 5), rootM); root.rotation.x = Math.PI; root.position.y = -0.17; top.add(root); g.visible = false; scene.add(g); weedPool.push({ g, top, root }); }
  let weeds = [];

  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), orderN: 0, earned: 0, tips: 0, starList: [], tool: null, seed: null, flash: null, flashT: 0, say: '', sayT: 0, hold: null, ptr: null, pull: null, react: null, done: null, phT: 0, confirm: 0, doneSeen: {}, job: null, grow: 1, mow: { tgt: null, drive: false, hits: 0, lastHit: 0, hd: 0 } };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  let client = null, CL = null, lastClient = -1;
  const wp = o => o.getWorldPosition(new THREE.Vector3());
  const WZ = () => upg('nozzle') ? WATER_ZONE_UP : WATER_ZONE;
  // ---------- mess for a new order (generated from the day) ----------
  function messUp(tasks, d) {
    if (tasks.includes('mow')) { const pool = cells.filter(c => c.i > 0 && c.i < MW.nx - 1 && c.j > 0 && c.j < MW.nz - 1), sp = d <= 1 ? 2 : 3; cells.forEach(c => { c.sp = false; c.cut = false; c.h0 = c.h; c.ht = rr(0.38, 0.55); paintCell(c, 'long'); });
      sprink.forEach((g, i) => { g.visible = i < sp; if (i < sp) { let c; do { c = pick(pool); } while (c.sp); c.sp = true; c.cut = true; g.position.set(c.x, 0.02, c.z); } }); S.mow.hits = 0; mower.position.set(MW.x1 - 0.3, 0, MW.z1 + 0.2); }
    if (tasks.includes('rake')) { leaves = []; const n = Math.min(28, 14 + d * 2), R = Q.rake; leafPool.forEach(m => m.visible = false); G.pile.visible = false; G.pile.scale.set(1, 0.01, 1);
      for (let i = 0; i < n; i++) { let x, z, k = 0; do { const a = rr(0, Math.PI * 2), r = rr(0.8, 2.9); x = Q.tree.x + Math.cos(a) * r; z = Q.tree.z + Math.sin(a) * r; k++; } while ((x < R.x0 || x > R.x1 || z < R.z0 || z > R.z1 || Math.hypot(x - Q.tarp.x, z - Q.tarp.z) < Q.tarp.r + 0.6) && k < 40);
        const m = leafPool[i]; m.visible = true; m.rotation.y = rr(0, 6); leaves.push({ m, x, z, y: rr(3, 4.5), in: false, spin: rr(-3, 3) }); } }
    if (tasks.includes('trim')) { sprigs = []; const n = Math.min(26, 12 + d * 2), H = Q.hedge; sprigPool.forEach(m => m.visible = false);
      for (let i = 0; i < n; i++) { const m = sprigPool[i], front = i % 3 === 2, x = H.x0 + 0.2 + (i + rr(0.1, 0.9)) * (H.x1 - H.x0 - 0.4) / n; if (front) { m.position.set(x, rr(0.75, 0.95), H.z + H.d / 2); m.rotation.set(1.25, 0, rr(-0.4, 0.4)); } else { m.position.set(x, H.h - 0.05, H.z + rr(-0.28, 0.28)); m.rotation.set(rr(-0.35, 0.35), 0, rr(-0.35, 0.35)); }
        m.visible = true; m.scale.setScalar(0.01); sprigs.push({ m, cut: false, fall: 0, s: rr(0.9, 1.3), p0: m.position.clone(), r0: m.rotation.clone() }); }
      Object.assign(TOP, { done: false, q: 1, ang: 0, last: null, radii: [], shag0: TOP.shag }); }
    if (tasks.includes('weed')) { weeds = []; const n = Math.min(7, 3 + Math.floor(d / 2)); weedPool.forEach(w => w.g.visible = false);
      for (let i = 0; i < n; i++) { let x, z, k = 0; do { x = rr(B.x0 + 0.3, B.x1 - 0.3); z = rr(B.z0 + 0.3, 5.6); k++; } while (k < 60 && (bedFlowers.some(f => Math.hypot(f.position.x - x, f.position.z - z) < 0.34) || weeds.some(w => Math.hypot(w.x - x, w.z - z) < 0.5)));
        const w = weedPool[i]; w.g.position.set(x, 0.33, z); w.g.rotation.y = rr(0, 6); w.top.position.set(0, 0, 0); w.top.rotation.set(0, 0, 0); w.root.scale.set(1, 1, 1); w.root.visible = true; w.g.visible = true; w.g.scale.setScalar(0.01); weeds.push({ ...w, x, z, st: 'in', lift: 0, fly: 0 }); } }
    if (tasks.includes('plant')) { const n = d <= 2 ? 2 : 3, ids = [0, 1, 2].sort(() => Math.random() - 0.5).slice(0, n); plantSpots.forEach((p, i) => { if (ids.includes(i)) { Object.assign(p, { st: 'empty', dig: 0, col: null }); p.f.visible = false; p.hole.visible = false; p.mound.visible = false; p.ring.visible = true; } else p.ring.visible = false; }); }
    if (tasks.includes('water')) { const n = Math.min(5, 3 + Math.floor(d / 3)), ids = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5).slice(0, n); urns.forEach((u, i) => { if (ids.includes(i)) Object.assign(u, { st: 'dry', lvl: 0, q: 0 }); u.pud.visible = false; }); }
  }
  // ---------- task progress ----------
  function info(id) {
    if (id === 'mow') { const tot = cells.filter(c => !c.sp).length, cut = cells.filter(c => !c.sp && c.cut).length, p = tot ? cut / tot : 1; return { done: p >= 1, q: Math.max(0.4, 1 - 0.2 * S.mow.hits), left: tot - cut, prog: p, txt: p >= 1 ? 'DONE' : Math.round(p * 100) + '%' }; }
    if (id === 'rake') { const l = leaves.filter(x => !x.in).length; return { done: !l, q: 1, left: l, prog: leaves.length ? 1 - l / leaves.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'trim') { const l = sprigs.filter(s => !s.cut).length, n = l + (TOP.done ? 0 : 1); return { done: !n, q: TOP.q, left: n, prog: sprigs.length ? (sprigs.length - l + (TOP.done ? 3 : 0)) / (sprigs.length + 3) : 1, txt: n ? (l ? l + ' SPRIGS' : 'TOPIARY') : 'DONE' }; }
    if (id === 'weed') { const l = weeds.filter(w => w.st === 'in').length, q = weeds.length ? weeds.reduce((s, w) => s + (w.st === 'out' ? 1 : w.st === 'snapped' ? 0.5 : 0), 0) / weeds.length : 1; return { done: !l, q: l ? q : q, left: l, prog: weeds.length ? 1 - l / weeds.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'plant') { const job = plantSpots.filter(p => p.st !== 'tidy'), l = job.filter(p => p.st !== 'planted').length, ok = job.filter(p => p.st === 'planted' && p.col === S.job.seed).length; return { done: !l, q: job.length ? ok / job.length : 1, left: l, prog: job.length ? 1 - l / job.length : 1, txt: l ? l + ' LEFT' : 'DONE' }; }
    if (id === 'water') { const job = urns.filter(u => u.st !== 'tidy'), l = job.filter(u => u.st === 'dry').length, q = job.length ? job.reduce((s, u) => s + (u.st === 'dry' ? 0 : u.q), 0) / job.length : 1; return { done: !l, q, left: l, prog: job.length ? 1 - l / job.length : 1, txt: l ? l + ' DRY' : 'DONE' }; }
    return { done: true, q: 1, left: 0, prog: 1, txt: '' }; }
  const allDone = () => S.job && S.job.tasks.every(t => info(t).done);
  const nextTask = () => S.job ? S.job.tasks.find(t => !info(t).done && !(t === 'plant' && S.job.tasks.includes('weed') && !info('weed').done)) || S.job.tasks.find(t => !info(t).done) : null;
  function setTool(id) { if (S.phase !== 'work' || !S.job || !S.job.tasks.includes(id)) return; if (S.tool !== id) sfx.ui(1); S.tool = id; S.userToolT = performance.now(); S.ptr = null; S.pull = null; }
  function setSeed(k) { if (!SEEDS[k] || !S.job) return; S.seed = k; sfx.ui(2); flash('SEEDLINGS · ' + SEEDS[k].name + (k === S.job.seed ? '' : ' · CARD SAYS ' + SEEDS[S.job.seed].name), k === S.job.seed ? '#22c55e' : '#e6b45a', 1.3); }
  function checkDone() { if (!S.job) return; for (const t of S.job.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); party(t); sfx.chime(); buzz([12, 40, 12]); } } }

  // ---------- gestures ----------
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh(), z: v.z }; };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
  const groundAt = (x, y, h = 0) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); plane.constant = -h; return ray.ray.intersectPlane(plane, hitP) ? hitP.clone() : null; };
  const segD = (px, py, ax, ay, bx, by) => { const vx = bx - ax, vy = by - ay, L = vx * vx + vy * vy, t = L ? clamp(((px - ax) * vx + (py - ay) * vy) / L, 0, 1) : 0; return Math.hypot(px - ax - vx * t, py - ay - vy * t); };
  // MOW
  function mowStep(dt) { const MS = S.mow; if (MS.stun > 0) { MS.stun -= dt; return 0; } if (!(MS.drive && MS.tgt)) return 0; const dx = MS.tgt.x - mower.position.x, dz = MS.tgt.z - mower.position.z, d = Math.hypot(dx, dz); if (d < 0.05) return 0;
    const sp = Math.min(d, 4.2 * dt), ox = mower.position.x, oz = mower.position.z; mower.position.x += dx / d * sp; mower.position.z += dz / d * sp; const p = mower.position; p.x = clamp(p.x, MW.x0 + 0.1, MW.x1 - 0.1); p.z = clamp(p.z, MW.z0 + 0.1, MW.z1 - 0.1); { const r = Math.hypot(p.x, p.z); if (r < 3.2) { p.x *= 3.2 / r; p.z *= 3.2 / r; } }
    const mvx = p.x - ox, mvz = p.z - oz; if (Math.abs(mvx) + Math.abs(mvz) > 1e-4) { MS.hd = Math.atan2(mvx, mvz); mower.rotation.y = MS.hd + Math.PI; }
    const R = upg('mower') ? 0.62 : 0.42, dir = Math.abs(mvx) > Math.abs(mvz) ? 'x' : 'z'; let n = 0;
    for (let k = 0; k < cells.length; k++) { const c = cells[k]; if (c.cut || c.sp) continue; if ((c.x - p.x) ** 2 + (c.z - p.z) ** 2 < R * R) { c.cut = true; c.h = 0.06; c.ht = 0.06; setTuft(k); paintCell(c, dir); n++; } }
    for (const h of molehills) if (h.visible && Math.hypot(h.position.x - p.x, h.position.z - p.z) < R + 0.15) { h.visible = false; for (let i = 0; i < 4; i++) puff(h.position.x, 0.25, h.position.z, 0x7a5636, 1); tone(180, 0.08, 0.05, 'square'); }
    if (n && info('mow').prog >= 0.95 && !info('mow').done) { cells.forEach((c, k) => { if (!c.cut && !c.sp) { c.cut = true; c.h = 0.06; setTuft(k); paintCell(c, dir); } }); flash('EDGES TIDIED', '#22c55e', 1); }
    if (n) { MS.cutAt = performance.now(); tufts.instanceMatrix.needsUpdate = true; for (let i = 0; i < 2; i++) puff(p.x - Math.sin(MS.hd) * 0.4 + rr(-0.2, 0.2), 0.3, p.z - Math.cos(MS.hd) * 0.4 + rr(-0.2, 0.2), i ? 0x86cc58 : 0x5fae3e, 1); checkDone(); }
    const now = performance.now(); for (const g of sprink) { if (!g.visible) continue; if (Math.hypot(g.position.x - p.x, g.position.z - p.z) < 0.36 && now - MS.lastHit > 900) { MS.lastHit = now; MS.hits++; p.x -= mvx / (Math.hypot(mvx, mvz) || 1) * 0.5; p.z -= mvz / (Math.hypot(mvx, mvz) || 1) * 0.5; MS.stun = 0.45; flash('CLUNK! MIND THE RED SPRINKLER HEADS', '#ec3013', 1.8); sfx.clunk(); buzz(70); for (let i = 0; i < 4; i++) puff(g.position.x, 0.3, g.position.z, 0x9fdcff, 1); } }
    return sp / dt; }
  // RAKE
  function pushLeaves(sx, sy, ex, ey, R) { const a = groundAt(sx, sy), b = groundAt(ex, ey); if (!a || !b) return 0; const dx = (b.x - a.x) * 0.95, dz = (b.z - a.z) * 0.95, RK = Q.rake, T = Q.tarp; let n = 0;
    for (const L of leaves) { if (L.in || L.y > 0.05) continue; const s = scr(V3(L.x, 0.03, L.z)); if (segD(s.x, s.y, sx, sy, ex, ey) > R) continue; n++;
      L.x = clamp(L.x + dx + rr(-0.04, 0.04), RK.x0, RK.x1); L.z = clamp(L.z + dz + rr(-0.04, 0.04), RK.z0, RK.z1); L.spin += rr(-4, 4); const tr = Math.hypot(L.x - Q.tree.x, L.z - Q.tree.z); if (tr < 0.55) { L.x = Q.tree.x + (L.x - Q.tree.x) / tr * 0.55; L.z = Q.tree.z + (L.z - Q.tree.z) / tr * 0.55; }
      if (Math.hypot(L.x - T.x, L.z - T.z) < T.r * 0.95) { L.in = true; const a2 = rr(0, 6), r2 = rr(0, T.r * 0.6); L.x = T.x + Math.cos(a2) * r2; L.z = T.z + Math.sin(a2) * r2; sfx.ui(Math.floor(Math.random() * 3)); } }
    if (n) { if (performance.now() - (S.rustleT || 0) > 120) { S.rustleT = performance.now(); sfx.rustle(Math.min(1.6, 0.6 + n * 0.15)); } if (!leaves.some(l => !l.in) && !S.bagged) bagLeaves(); } return n; }
  function bagLeaves() { S.bagged = true; G.pile.visible = true; G.pile.userData.t = 0; sfx.rustle(2); sfx.sparkle(); checkDone(); }
  // TRIM
  function snipAlong(sx, sy, ex, ey) { const R = upg('shears') ? 48 : 32; let n = 0; for (const s of sprigs) { if (s.cut) continue; const p = scr(wp(s.m).add(V3(0, 0.12, 0))); if (segD(p.x, p.y, sx, sy, ex, ey) > R) continue; s.cut = true; s.fall = 0.001; n++; const q = wp(s.m); puff(q.x, q.y + 0.15, q.z, 0x6fbf4a, 1); }
    if (n) { sfx.snip(); checkDone(); } return n; }
  function circleMove(x, y) { if (TOP.done || sprigs.some(s => !s.cut)) return; const c = scr(topiary.position), e = scr(topiary.position.clone().add(V3(0.62, 0, 0))), Rs = Math.max(20, Math.abs(e.x - c.x)), r = Math.hypot(x - c.x, y - c.y);
    if (r < Rs * 0.45 || r > Rs * 3.6) { TOP.ang = 0; TOP.last = null; TOP.radii = []; return; } const a = Math.atan2(y - c.y, x - c.x);
    if (TOP.last != null) { let d = a - TOP.last; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; TOP.ang += d; if (Math.abs(d) > 0.02 && Math.random() < 0.3) { sfx.snip(); const q = topiary.position; puff(q.x + rr(-0.5, 0.5), q.y + rr(-0.3, 0.5), q.z + 0.5, 0x6fbf4a, 1); } }
    TOP.last = a; TOP.radii.push(r); const k = Math.min(1, Math.abs(TOP.ang) / (Math.PI * 2 * 0.92)); setShag(1 - k); topiary.rotation.y = TOP.ang * 0.15; if (k >= 1) shapeTopiary(); }
  function shapeTopiary(q) { if (TOP.done) return; if (q == null) { const R = TOP.radii, m = R.reduce((a, b) => a + b, 0) / R.length, sd = Math.sqrt(R.reduce((a, b) => a + (b - m) ** 2, 0) / R.length), cv = sd / m; q = cv < 0.22 ? 1 : cv < 0.34 ? 0.8 : 0.6; }
    TOP.done = true; TOP.q = q; TOP.shag = 0; setShag(0); flash(q >= 1 ? 'PERFECT SPHERE!' : q >= 0.8 ? 'NICE AND ROUND' : 'A BIT LUMPY', q >= 1 ? '#22c55e' : '#e6b45a', 1.6); sfx.sparkle(); checkDone(); }
  // WEED
  const SNAP = () => upg('gloves') ? 2800 : 1300;
  function weedAt(x, y) { let best = null, bd = 52; for (const w of weeds) { if (w.st !== 'in') continue; const s = scr(V3(w.x, 0.45, w.z)), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = w; } } return best; }
  function flowerAt(x, y) { return bedFlowers.find(f => { const s = scr(wp(f.userData.head)); return Math.hypot(s.x - x, s.y - y) < 30; }); }
  function pullMove(y) { const P = S.pull; if (!P) return; const now = performance.now(), dt = Math.max(1, now - P.t), v = (P.y - y) / dt * 1000; P.t = now; P.y = y; P.v = P.v * 0.5 + Math.max(0, v) * 0.5; const w = P.w;
    w.lift = clamp((P.y0 - y) / 120, 0, 1); if (w.lift > 0.22 && P.v > SNAP()) { snapWeed(w); return; } if (w.lift >= 1) popWeed(w, 1); }
  function popWeed(w) { if (w.st !== 'in') return; w.st = 'out'; w.fly = 0.001; S.pull = null; flash('ROOT AND ALL ✓', '#22c55e', 1.1); sfx.pop(); buzz(15); puff(w.x, 0.5, w.z, 0x8a6a44, 3); checkDone(); }
  function snapWeed(w) { if (w.st !== 'in') return; w.st = 'snapped'; w.fly = 0.001; w.root.visible = false; S.pull = null; flash('SNAP! THE ROOT BROKE · PULL SLOWER', '#e6b45a', 1.8); sfx.snap(); buzz(40); puff(w.x, 0.45, w.z, 0x6a8a2a, 2); checkDone(); }
  // PLANT
  function spotAt(x, y) { let best = null, bd = 64; for (const p of plantSpots) { if (p.st === 'tidy' || p.st === 'planted') continue; const s = scr(V3(p.x, 0.34, p.z)), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = p; } } return best; }
  function digTap(p) { if (S.job.tasks.includes('weed') && !info('weed').done) { flash('WEED THE BED BEFORE YOU PLANT', '#e6b45a', 1.6); sfx.ui(-3); return; } p.dig++; puff(p.x, 0.45, p.z, 0x7a5636, 3); sfx.dig(p.dig); p.mound.visible = true; p.mound.scale.setScalar(p.dig / 3); if (p.dig >= 3) { p.st = 'hole'; p.hole.visible = true; flash('HOLE DUG · PICK A COLOUR, TAP TO PLANT', '#ffffff', 1.4); } }
  function plantAt(p) { if (!S.seed) { flash('PICK A COLOUR BELOW', '#ffffff', 1.2); return; } p.st = 'planted'; p.col = S.seed; setBloom(p.f, SEEDS[S.seed].col); p.f.visible = true; p.anim = 0.001; p.hole.visible = false; p.mound.visible = false; p.ring.visible = false; sfx.plant(); if (S.seed !== S.job.seed) flash('PLANTED ' + SEEDS[S.seed].name + ' · CARD SAYS ' + SEEDS[S.job.seed].name, '#e6b45a', 1.6); checkDone(); }
  // WATER
  function urnAt(x, y) { let best = null, bd = 72; for (const u of urns) { if (u.st !== 'dry') continue; const s = scr(V3(u.x, 0.95, u.z)), d = Math.hypot(s.x - x, s.y - y); if (d < bd) { bd = d; best = u; } } return best; }
  function startWater(u) { S.hold = { u }; sfx.waterOn(); }
  function releaseWater() { const H = S.hold; if (!H) return; S.hold = null; const u = H.u, Z = WZ(); sfx.waterOff(u.lvl < Z[0] ? null : u.lvl <= Z[1] ? 1 : 0.5); if (u.lvl < Z[0]) { flash('STILL DRY · HOLD AGAIN', '#ffffff', 1.2); return; } u.st = 'ok'; u.q = u.lvl <= Z[1] ? 1 : u.lvl < 1 ? 0.65 : 0.4; if (u.q < 1) u.pud.visible = true;
    flash(u.q >= 1 ? 'JUST RIGHT' : u.q > 0.5 ? 'SOGGY' : 'FLOODED', u.q >= 1 ? '#22c55e' : u.q > 0.5 ? '#e6b45a' : '#ec3013', 1.2); if (u.q >= 1) sfx.sparkle(); checkDone(); }

  // ---------- MOLES: the Ur College Dig Society. They pop up where you are working and make silly trouble. Tap one first: BOOP. ----------
  const mole = (() => { const g = new THREE.Group(), body = new THREE.Group(); g.add(body); const fur = toon('#6b5a52'), pink = toon('#f4a6b4'), ink2 = toon('#201e1d');
    M(new THREE.SphereGeometry(0.22, 14, 10), fur, 0, 0.2, 0, body, 0.015, 0.22).scale.set(1, 1.2, 0.95); M(new THREE.SphereGeometry(0.15, 12, 8), toon('#a8968a'), 0, 0.2, 0.1, body, 0).scale.set(1, 1.2, 0.8);
    M(new THREE.SphereGeometry(0.06, 10, 8), pink, 0, 0.3, 0.22, body, 0.008, 0.06); for (const sx of [-1, 1]) { M(new THREE.SphereGeometry(0.025, 6, 5), ink2, sx * 0.07, 0.37, 0.18, body, 0); for (const k of [-1, 1]) { const w = M(new THREE.BoxGeometry(0.12, 0.006, 0.006), ink2, sx * 0.1, 0.3 + k * 0.015, 0.2, body, 0); w.rotation.z = sx * k * 0.2; } }
    const paws = [-1, 1].map(sx => { const p = M(new THREE.SphereGeometry(0.07, 8, 6), pink, sx * 0.13, 0.18, 0.18, body, 0.008, 0.07); p.scale.set(1.2, 0.5, 1); for (let k = -1; k <= 1; k++) M(new THREE.ConeGeometry(0.012, 0.05, 4), toon('#fbf8ec'), k * 0.03, 0, 0.07, p, 0).rotation.x = Math.PI / 2; return p; });
    const hat = new THREE.Group(); hat.position.set(0, 0.42, 0); hat.rotation.x = -0.15; body.add(hat); M(new THREE.SphereGeometry(0.14, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f2c94c'), 0, 0, 0, hat, 0.01, 0.14); M(new THREE.CylinderGeometry(0.17, 0.17, 0.02, 14), toon('#f2c94c'), 0, 0, 0.02, hat, 0.006, 0.17); M(new THREE.CylinderGeometry(0.035, 0.035, 0.04, 8), toon('#fff6d0', { emissive: new THREE.Color('#ffe08a'), emissiveIntensity: 1 }), 0, 0.07, 0.13, hat, 0).rotation.x = Math.PI / 2;
    const loot = flower('#ffffff', 0.25); loot.position.set(0, 0.12, 0.24); loot.rotation.x = -0.6; loot.visible = false; body.add(loot);
    const mound = M(new THREE.SphereGeometry(0.3, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#7a5636'), 0, 0, 0, g, 0.012, 0.3); mound.scale.set(1, 0.4, 1);
    const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: canvasTex(64, 64, c => { c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(32, 32, 28, 0, 7); c.fill(); c.strokeStyle = '#201e1d'; c.lineWidth = 5; c.stroke(); c.fillStyle = '#201e1d'; c.font = '900 42px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('!', 32, 35); }), depthTest: false })); bub.scale.setScalar(0.32); bub.renderOrder = 35; bub.position.set(0, 0.9, 0); g.add(bub);
    const stars = []; for (let i = 0; i < 3; i++) { const st = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, depthTest: false, transparent: true })); st.scale.setScalar(0.14); st.renderOrder = 36; g.add(st); stars.push(st); }
    g.visible = false; scene.add(g); return { g, body, paws, hat, loot, mound, bub, stars, st: 'off', t: 0, kind: null, tgt: null, y0: 0, sc: 1 }; })();
  const molehills = []; for (let i = 0; i < 4; i++) { const m = M(new THREE.SphereGeometry(0.34, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#7a5636'), 0, 0.02, 0, scene, 0.012, 0.34); m.scale.set(1, 0.45, 1); m.visible = false; molehills.push(m); }
  const MOLE_T = { up: 0.35, act: 0.7, down: 0.45, bonk: 0.8 }, teaseT = () => S.phase === 'walk' ? 3.4 : S.day >= 4 ? 1.8 : 2.4;
  const moleOn = () => mole.st !== 'off';
  function moleSpot(T) { // where a mole can pop up for task T, and what it will mess with; null = nothing to mess with right now
    if (T === 'mow') { const c = cells.filter(c => c.cut && !c.sp && Math.hypot(c.x - mower.position.x, c.z - mower.position.z) > 1.4 && c.i > 0 && c.i < MW.nx - 1); if (!c.length) return null; const k = pick(c); return { x: k.x, z: k.z, y: 0.02 }; }
    if (T === 'rake') { const T2 = Q.tarp; return { x: clamp(T2.x + rr(0.6, 1.6), Q.rake.x0, Q.rake.x1), z: T2.z - rr(0.6, 1.2), y: 0.02 }; }
    if (T === 'trim') { const cut = sprigs.filter(q => q.cut); if (!cut.length && (TOP.done || sprigs.some(q => !q.cut))) return null; const x = cut.length ? pick(cut).p0.x : Q.topiary.x + 0.8; return { x: clamp(x, Q.hedge.x0 + 0.3, Q.hedge.x1 + 0.6), z: Q.hedge.z + 0.75, y: 0.02 }; }
    if (T === 'weed') { if (weeds.length >= weedPool.length) return null; for (let k = 0; k < 40; k++) { const x = rr(B.x0 + 0.3, B.x1 - 0.3), z = rr(B.z0 + 0.3, 5.6); if (!bedFlowers.some(f => Math.hypot(f.position.x - x, f.position.z - z) < 0.36) && !weeds.some(w => w.st === 'in' && Math.hypot(w.x - x, w.z - z) < 0.5)) return { x, z, y: 0.33 }; } return null; }
    if (T === 'plant') { const pl = plantSpots.filter(p => p.st === 'planted'), ho = plantSpots.filter(p => p.st === 'hole'), p = pl.length ? pick(pl) : ho.length ? pick(ho) : null; return p ? { x: p.x + 0.36, z: p.z - 0.1, y: 0.33, p } : null; }
    if (T === 'water') { const ok = urns.filter(u => u.st === 'ok'); if (!ok.length) return null; const u = pick(ok); return { x: u.x, z: u.z, y: 0.88, u, small: true }; }
    return null; }
  function spawnMole(T, at) { const sp = at || moleSpot(T); if (!sp) return false; Object.assign(mole, { st: 'up', t: 0, kind: T, tgt: sp, y0: sp.y, sc: sp.small ? 1.0 : 1.6 }); mole.g.position.set(sp.x, sp.y, sp.z); mole.g.scale.setScalar(mole.sc); mole.g.visible = true; mole.loot.visible = false; mole.bub.visible = false; mole.stars.forEach(x => x.visible = false); mole.mound.visible = !sp.small; mole.mound.scale.set(1, 0.4, 1);
    const c = camera.position; mole.g.rotation.y = Math.atan2(c.x - sp.x, c.z - sp.z); puff(sp.x, sp.y + 0.15, sp.z, 0x7a5636, 4); sfx.molePop();
    if (S.phase === 'work' && !S.moleSeen) { S.moleSeen = true; flash('A MOLE! TAP IT BEFORE IT MAKES TROUBLE', '#ffd23a', 2.2); } return true; }
  function bonkMole() { if (mole.st !== 'up' && mole.st !== 'tease') return false; mole.st = 'bonk'; mole.t = 0; mole.bub.visible = false; sfx.boop(); buzz(25);
    const p = mole.g.position; for (let i = 0; i < 6; i++) puff(p.x + rr(-0.2, 0.2), p.y + 0.5, p.z, 0xffd23a, 1);
    if (S.phase === 'walk') { WK.boops = (WK.boops || 0) + 1; say('BOOP! Moles booped: ' + WK.boops + '. They will be back.', 2.6); } else { S.boops = (S.boops || 0) + 1; S.dayBoops = (S.dayBoops || 0) + 1; flash('BOOP! +1g', '#22c55e', 1.1); } return true; }
  function moleMischief() { const T = mole.kind, sp = mole.tgt, laugh = () => sfx.giggle(); let msg = null;
    if (S.phase !== 'work' || !S.job) { laugh(); return; }
    if (T === 'mow') { let n = 0; cells.forEach((c, k) => { if (!c.sp && Math.hypot(c.x - sp.x, c.z - sp.z) < 0.8) { c.cut = false; c.h = c.ht = 0.48; setTuft(k); paintCell(c, 'long'); n++; } }); tufts.instanceMatrix.needsUpdate = true; const h = molehills.find(m => !m.visible); if (h) { h.position.set(sp.x, 0.02, sp.z); h.visible = true; } if (n) msg = 'A MOLE DUG UP YOUR LAWN!'; }
    else if (T === 'rake') { const inT = leaves.filter(l => l.in), pool = inT.length ? inT : leaves.filter(l => !l.in); const fl = pool.sort(() => Math.random() - 0.5).slice(0, 4); fl.forEach(L => { L.in = false; const a = rr(-Math.PI, 0.3), r = rr(1.6, 2.8); L.x = clamp(Q.tarp.x + Math.cos(a) * r + 1.2, Q.rake.x0, Q.rake.x1); L.z = clamp(Q.tarp.z + Math.sin(a) * r - 0.6, Q.rake.z0, Q.rake.z1); L.y = rr(0.8, 1.4); L.m.visible = true; }); if (fl.length) msg = inT.length ? 'A MOLE KICKED LEAVES OUT OF THE TARP!' : 'A MOLE SCATTERED THE LEAVES!'; }
    else if (T === 'trim') { const cut = sprigs.filter(q => q.cut).sort(() => Math.random() - 0.5).slice(0, 3); cut.forEach(q => { q.cut = false; q.fall = 0; q.m.position.copy(q.p0); q.m.rotation.copy(q.r0); q.m.visible = true; q.m.scale.setScalar(0.01); q.grow = 0.001; }); if (cut.length) msg = 'A MOLE TICKLED THE HEDGE · SPRIGS SPRANG BACK!'; else if (!TOP.done) { TOP.ang = 0; setShag(1); msg = 'A MOLE RUFFLED THE TOPIARY!'; } }
    else if (T === 'weed') { const w = weedPool.find(q => !weeds.some(x => x.g === q.g)); if (w) { w.g.position.set(sp.x, 0.33, sp.z); w.top.position.set(0, 0, 0); w.top.rotation.set(0, 0, 0); w.root.visible = true; w.g.visible = true; w.g.scale.setScalar(1); w.g.rotation.set(0, rr(0, 6), 0); weeds.push({ ...w, x: sp.x, z: sp.z, st: 'in', lift: 0, fly: 0 }); msg = 'A MOLE PLANTED A WEED!'; } }
    else if (T === 'plant' && sp.p) { const p = sp.p; if (p.st === 'planted') { setBloom(mole.loot, SEEDS[p.col].col); mole.loot.visible = true; Object.assign(p, { st: 'hole', col: null }); p.f.visible = false; p.hole.visible = true; p.ring.visible = true; msg = 'A MOLE STOLE A SEEDLING!'; } else if (p.st === 'hole') { Object.assign(p, { st: 'empty', dig: 0 }); p.hole.visible = false; p.mound.visible = false; msg = 'A MOLE FILLED IN YOUR HOLE!'; } }
    else if (T === 'water' && sp.u) { const u = sp.u; if (u.st === 'ok') { Object.assign(u, { st: 'dry', lvl: 0.12, q: 0 }); u.pud.visible = true; for (let i = 0; i < 8; i++) puff(u.x + rr(-0.4, 0.4), 1.0 + rr(0, 0.5), u.z + rr(-0.3, 0.3), 0x7fd0ff, 1); msg = 'A MOLE SPLASHED THE WATER OUT!'; } }
    laugh(); if (msg) { flash(msg, '#e6b45a', 2); S.moleTrouble = (S.moleTrouble || 0) + 1; } S.doneSeen[T] = 0; }
  function moleStep(dt, t) {
    // spawn: while working on an unfinished task, or now and then on the lawns in walk mode
    if (!moleOn()) { if (S.phase === 'work' && S.tool && !info(S.tool).done && (S.molesLeft || 0) > 0) { S.moleT -= dt; if (S.moleT <= 0) { S.moleT = rr(7, 12); if (spawnMole(S.tool)) S.molesLeft--; } }
      else if (S.phase === 'walk') { WK.moleT = (WK.moleT == null ? 6 : WK.moleT) - dt; if (WK.moleT <= 0) { WK.moleT = rr(7, 12); const p = walker.position, f = walker.rotation.y; for (let k = 0; k < 24; k++) { const a = f + rr(-0.9, 0.9), r = rr(3, 6.5), x = p.x + Math.sin(a) * r, z = p.z + Math.cos(a) * r; const onLawn = [[1.8, 9.2, -8.2, -1.6], [-9.2, -1.8, -6.6, -4.2], [1.8, 9.2, 1.8, 8.2], [-9.2, -1.8, 7.2, 8.2]].some(([x0, x1, z0, z1]) => x > x0 && x < x1 && z > z0 && z < z1) && Math.hypot(x, z) > 3.4 && Math.hypot(x - Q.tree.x, z - Q.tree.z) > 0.9; if (onLawn) { spawnMole('walk', { x, z, y: 0.02 }); break; } } } }
      return; }
    mole.t += dt; const M2 = mole, b = M2.body, k = M2.t;
    if (M2.st === 'up') { const u = smooth(0, 1, k / MOLE_T.up); b.position.y = -0.55 + u * 0.55; if (k >= MOLE_T.up) { M2.st = 'tease'; M2.t = 0; } }
    else if (M2.st === 'tease') { b.position.y = Math.abs(Math.sin(k * 9)) * 0.04; b.rotation.z = Math.sin(k * 12) * 0.12; M2.paws.forEach((p, i) => p.position.y = 0.18 + Math.sin(k * 16 + i * 3) * 0.04); M2.bub.visible = true; M2.bub.position.y = 0.9 + Math.sin(k * 6) * 0.06; if (Math.random() < dt * 2.5) sfx.squeak(Math.floor(Math.random() * 3));
      if (k >= teaseT()) { M2.st = 'act'; M2.t = 0; M2.bub.visible = false; if (M2.kind !== 'walk') moleMischief(); else sfx.giggle(); } }
    else if (M2.st === 'act') { b.rotation.z = Math.sin(k * 30) * 0.25; b.position.y = Math.abs(Math.sin(k * 14)) * 0.12; if (k >= MOLE_T.act) { M2.st = 'down'; M2.t = 0; } }
    else if (M2.st === 'down' || M2.st === 'bonk') { const T2 = M2.st === 'bonk' ? MOLE_T.bonk : MOLE_T.down, sq = M2.st === 'bonk' ? Math.max(0.55, 1 - k * 2) : 1; b.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq)); b.rotation.z = 0;
      if (M2.st === 'bonk') M2.stars.forEach((st, i) => { st.visible = k < T2 * 0.85; const a = k * 9 + i * 2.1; st.position.set(Math.cos(a) * 0.28, 0.62, Math.sin(a) * 0.28); });
      const u = smooth(T2 * 0.4, T2, k); b.position.y = -u * 0.6; M2.mound.scale.set(1 - u * 0.6, 0.4 * (1 - u * 0.7), 1 - u * 0.6);
      if (k >= T2) { M2.st = 'off'; M2.g.visible = false; b.scale.set(1, 1, 1); b.position.y = 0; M2.loot.visible = false; } }
  }
  function moleAt(x, y) { if (mole.st !== 'up' && mole.st !== 'tease') return false; const s2 = scr(mole.g.position.clone().add(V3(0, 0.3 * mole.sc, 0))); return Math.hypot(s2.x - x, s2.y - y) < 66; }

  // ---------- MUSIC: an original synth tune in D hijaz (an old Near-East scale, for Ur). Soft while walking, light drums on shift. ----------
  const MUS = { on: save.stat('ur.grounds.music', 1) !== 0, step: 0, next: 0, bus: null };
  const HIJAZ = [0, 1, 4, 5, 7, 8, 10], fq = d => { const o = Math.floor(d / 7), i = ((d % 7) + 7) % 7; return 293.66 * Math.pow(2, (HIJAZ[i] + 12 * o) / 12); };
  const _ = null, MEL = [[0, 2, 4, 2, 3, 4, 5, 4, 4, _, 3, 2, 1, 2, 0, _], [4, 5, 6, 7, 6, 5, 4, _, 3, 4, 5, 4, 2, 1, 0, _], [7, _, 6, 5, 4, 5, 6, _, 5, 4, 3, 4, 2, _, 0, _], [2, 3, 4, 6, 5, 4, 3, 2, 1, 2, 1, 0, -1, 0, _, _]].flat(), ROOTS = [0, 3, 6, 0, 3, 6, 0, 4];
  function musBus() { const A = audio; if (!A.ctx || !A.master) return null; if (!MUS.bus) { const c = A.ctx, g = c.createGain(); g.gain.value = 0; g.connect(A.master); const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200; lp.connect(g);
    const rv = c.createConvolver(), len = Math.floor(c.sampleRate * 2.2), ir = c.createBuffer(2, len, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); } rv.buffer = ir; const wet = c.createGain(); wet.gain.value = 0.32; lp.connect(rv); rv.connect(wet); wet.connect(g); MUS.bus = { g, lp }; } return MUS.bus; }
  // oud-ish pluck: bright saw through a lowpass that closes fast, plus a soft body tone
  function pluck(t, f, dur, vol) { const c = audio.ctx, o = c.createOscillator(), o2 = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o2.type = 'triangle'; o.frequency.setValueAtTime(f, t); o2.frequency.setValueAtTime(f * 1.003, t); fl.type = 'lowpass'; fl.Q.value = 3; fl.frequency.setValueAtTime(Math.min(9000, f * 9), t); fl.frequency.exponentialRampToValueAtTime(Math.max(300, f * 1.4), t + 0.25);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(fl); o2.connect(fl); fl.connect(g); g.connect(MUS.bus.lp); o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05); }
  // reed flute for the calm tune: sine + a little breath + delayed vibrato
  function flute(t, f, dur, vol) { const c = audio.ctx, o = c.createOscillator(), l = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f, t); l.frequency.value = 5.2; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.012, t + 0.25); l.connect(lg); lg.connect(o.frequency);
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.07); g.gain.setTargetAtTime(vol * 0.7, t + 0.1, 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(MUS.bus.lp); o.start(t); l.start(t); o.stop(t + dur + 0.05); l.stop(t + dur + 0.05); }
  const MEL2 = [[4, _, _, 5, 4, _, 2, _, 3, _, _, 2, 1, _, _, _], [0, _, 2, _, 4, _, 5, 4, 3, _, _, _, _, _, _, _], [4, _, _, 6, 7, _, 6, _, 5, _, 4, _, 3, _, _, _], [2, _, 3, 2, 1, _, -1, _, 0, _, _, _, _, _, _, _]].flat(), ROOTS2 = [0, 0, 3, 3, 4, 4, 0, 0];
  function note(t, f, dur, vol, type = 'triangle', att = 0.01) { const c = audio.ctx, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + att); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(MUS.bus.lp); o.start(t); o.stop(t + dur + 0.05); }
  function hit(t, f0, f1, dur, vol) { const c = audio.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(MUS.bus.lp); o.start(t); o.stop(t + dur + 0.02); }
  function shaker(t, vol) { const c = audio.ctx; if (!audio.noise) return; const sN = c.createBufferSource(); sN.buffer = audio.noise; const hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 6000; const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06); sN.connect(hp); hp.connect(g); g.connect(MUS.bus.lp); sN.start(t, Math.random()); sN.stop(t + 0.08); }
  function musicTick() { const bus = musBus(); if (!bus) return; const c = audio.ctx, want = MUS.on && !audio.muted && c.state === 'running' ? (S.phase === 'work' ? 1 : 0.8) : 0; bus.g.gain.setTargetAtTime(want * 0.9, c.currentTime, 0.4); if (!want) { MUS.next = 0; return; }
    const drums = S.phase === 'work' || S.phase === 'arrive' || S.phase === 'brief' || S.phase === 'react' || S.phase === 'leave', mode = drums ? 'work' : 'calm', E8 = 60 / (mode === 'work' ? 100 : 80) / 2; if (MUS.next < c.currentTime) MUS.next = c.currentTime + 0.05;
    if (mode !== MUS.mode) { MUS.mode = mode; MUS.step = 0; }
    while (MUS.next < c.currentTime + 0.35) { const t = MUS.next, i = MUS.step % 64, bar = Math.floor(i / 8), b8 = i % 8, loop = Math.floor(MUS.step / 64);
      if (mode === 'calm') { const r = ROOTS2[bar], m = MEL2[i]; if (m != null) flute(t, fq(m + 7), E8 * 3.2, 0.045); if (b8 === 0 && bar % 2 === 0) { note(t, fq(r - 14), E8 * 15, 0.07, 'sine', 0.1); [0, 2, 4].forEach(k => note(t, fq(r + k - 7), E8 * 15, 0.01, 'sawtooth', 0.8)); } if (b8 % 2 === 0) pluck(t, fq(r + [0, 4, 2, 4][(b8 >> 1)] ), E8 * 2.5, 0.022); MUS.step++; MUS.next += E8; continue; }
      const r = ROOTS[bar], m = MEL[i]; if (m != null) { pluck(t, fq(m + (loop % 2 && bar >= 4 ? 7 : 0)), E8 * 2.2, 0.055); note(t, fq(m) * 2.003, E8 * 0.9, 0.008, 'sine'); }
      if (b8 === 0) { note(t, fq(r - 14), E8 * 3.5, 0.09, 'sine', 0.02); [0, 2, 4].forEach(k => note(t, fq(r + k - 7), E8 * 7.5, 0.012, 'sawtooth', 0.4)); }
      if (b8 === 4) note(t, fq(r - 14 + 4), E8 * 2.5, 0.06, 'sine', 0.02);
      if (b8 % 2 === 1) note(t, fq(r + [0, 2, 4, 2][(b8 >> 1) % 4]), E8 * 0.7, 0.018, 'square');
      if (drums) { if (b8 === 0 || b8 === 3 || b8 === 6) hit(t, b8 ? 220 : 150, 70, 0.22, b8 ? 0.09 : 0.14); if (b8 % 2 === 1) shaker(t, 0.03); if (b8 === 4) hit(t, 520, 300, 0.08, 0.05); }
      MUS.step++; MUS.next += E8; } }
  // ---------- MOWER ENGINE: a little two-stroke putter (saw + square through a lowpass, chopped by a 'putt' LFO) + blade whirr noise ----------
  const ENG = { nodes: null, on: false, cut: 0 };
  function engNodes() { const A = audio; if (!A.ctx || !A.master) return null; if (ENG.nodes) return ENG.nodes; const c = A.ctx;
    const out = c.createGain(); out.gain.value = 0; out.connect(A.master);
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 650; lp.Q.value = 2; const am = c.createGain(); am.gain.value = 0.55; lp.connect(am); am.connect(out);
    const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 46; const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = 93; const g2 = c.createGain(); g2.gain.value = 0.45; o1.connect(lp); o2.connect(g2); g2.connect(lp);
    const lfo = c.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 15; const lg = c.createGain(); lg.gain.value = 0.4; lfo.connect(lg); lg.connect(am.gain);
    const cut = c.createGain(); cut.gain.value = 0; cut.connect(out); let ns = null; if (A.noise) { ns = c.createBufferSource(); ns.buffer = A.noise; ns.loop = true; const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.9; ns.connect(bp); bp.connect(cut); ns.start(); }
    o1.start(); o2.start(); lfo.start(); ENG.nodes = { out, lp, o1, o2, lfo, cut }; return ENG.nodes; }
  function engineTick(speed) { const want = (S.phase === 'work' && S.tool === 'mow') && !audio.muted; if (!want && !ENG.nodes) return; const N = engNodes(); if (!N) return; const c = audio.ctx, now = c.currentTime;
    if (want && !ENG.on) { ENG.on = true; ENG.startT = now; tone(90, 0.18, 0.06, 'sawtooth', 2.6); setTimeout(() => tone(140, 0.22, 0.06, 'sawtooth', 2.2), 200); } if (!want && ENG.on) { ENG.on = false; tone(70, 0.4, 0.04, 'sawtooth', 0.5); }
    const rpm = !want ? 0 : S.mow.stun > 0 ? 0.1 : Math.min(1, speed / 3.5), warm = want ? Math.min(1, (now - (ENG.startT || 0)) / 0.5) : 0, cutting = performance.now() - (S.mow.cutAt || 0) < 160;
    N.out.gain.setTargetAtTime(want ? (0.07 + rpm * 0.07) * warm : 0, now, want ? 0.12 : 0.2); N.o1.frequency.setTargetAtTime(42 + rpm * 30, now, 0.15); N.o2.frequency.setTargetAtTime(85 + rpm * 61, now, 0.15); N.lfo.frequency.setTargetAtTime(12 + rpm * 16, now, 0.15); N.lp.frequency.setTargetAtTime(520 + rpm * 700, now, 0.15);
    N.cut.gain.setTargetAtTime(want ? (cutting ? 0.22 : 0.03 + rpm * 0.05) : 0, now, 0.06); }
  function toggleMusic() { MUS.on = !MUS.on; save.setStat('ur.grounds.music', MUS.on ? 1 : 0); audio.init && audio.init(); flash(MUS.on ? 'MUSIC ON' : 'MUSIC OFF', '#ffffff', 1); }
  const AMB = { bird: 2 }; function ambTick(dt) { if (!audio.ctx || audio.muted) return; if (audio.water && !AMB.water) { AMB.water = true; try { audio.water.gain.value = 0.025; } catch (e) {} } AMB.bird -= dt; if (AMB.bird <= 0) { AMB.bird = rr(3, 8); const n = 2 + Math.floor(Math.random() * 3), f0 = rr(2300, 3200); for (let i = 0; i < n; i++) setTimeout(() => tone(f0 + i * 120, 0.07, 0.012, 'sine', 1.25), i * 110); } }
  // ---------- TIME OF DAY: order 1 morning, 2 midday, 3 golden afternoon ----------
  const hemi = scene.children.find(o => o.isHemisphereLight), sky3 = [['#6aa8e6', '#bcd8f0', '#f8e6c8'], ['#4b9be6', '#a8cdeb', '#f6dcb0'], ['#5a7ec8', '#e8b07a', '#ffc890']].map(c => canvasTex(4, 256, g => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, c[0]); gr.addColorStop(0.55, c[1]); gr.addColorStop(1, c[2]); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); }));
  const TOD = [{ sun: '#fff2dc', si: 1.55, pos: [-9, 12, 9], sky: '#fff6ea', gr: '#8a6a5a', hi: 1.15, fog: '#f2e4cc', lamp: 0.2 }, { sun: '#ffffff', si: 1.75, pos: [-2, 16, 5], sky: '#fffaf0', gr: '#8a7a5a', hi: 1.2, fog: '#f0dcc0', lamp: 0.1 }, { sun: '#ffd0a0', si: 1.65, pos: [11, 8, 7], sky: '#fff0dc', gr: '#9a7a5a', hi: 1.2, fog: '#f6d4b0', lamp: 0.9 }];
  let todI = -1; const todNow = () => S.phase === 'walk' || S.phase === 'intro' ? 1 : clamp(S.orderN || 0, 0, 2);
  const _c = new THREE.Color(), lampMats = new Set(), winMats = new Set(); G.lamps.forEach(l => l.traverse(m => { if (m.isMesh && m.material.emissive && m.material.emissiveIntensity > 0.3) lampMats.add(m.material); })); G.facade.traverse(m => { if (m.isMesh && m.material && m.material.emissive && m.material.emissiveIntensity < 0.3 && m.material.emissiveIntensity > 0) winMats.add(m.material); });
  function todStep(dt) { const i = todNow(), T = TOD[i], k = Math.min(1, dt * 1.2); if (i !== todI) { todI = i; scene.background = sky3[i]; }
    sun.color.lerp(_c.set(T.sun), k); sun.intensity += (T.si - sun.intensity) * k; sun.position.x += (T.pos[0] - sun.position.x) * k; sun.position.y += (T.pos[1] - sun.position.y) * k; sun.position.z += (T.pos[2] - sun.position.z) * k;
    if (hemi) { hemi.color.lerp(_c.set(T.sky), k); hemi.groundColor.lerp(_c.set(T.gr), k); hemi.intensity += (T.hi - hemi.intensity) * k; } scene.fog.color.lerp(_c.set(T.fog), k); lampMats.forEach(m => m.emissiveIntensity += (0.6 + T.lamp - m.emissiveIntensity) * k); winMats.forEach(m => m.emissiveIntensity += (0.08 + T.lamp * 0.5 - m.emissiveIntensity) * k); pollen.material.opacity += ((i === 2 ? 0.95 : 0.6) - pollen.material.opacity) * k; }
  // ---------- the goal on the lawn (walk mode: kick the ball in) ----------
  const GOAL = { x: 5.4, z: -8.45, w: 2.2 }; { const g = new THREE.Group(); g.position.set(GOAL.x, 0, GOAL.z); scene.add(g); const wh = toon('#fbf8ec');
    for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.06, 0.06, 1.3, 8), wh, sx * GOAL.w / 2, 0.65, 0, g, 0.01); M(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 6), wh, sx * GOAL.w / 2, 0.6, -0.33, g, 0).rotation.x = 0.55; }
    M(new THREE.CylinderGeometry(0.06, 0.06, GOAL.w + 0.12, 8), wh, 0, 1.3, 0, g, 0.01).rotation.z = Math.PI / 2;
    const netT = canvasTex(128, 64, c => { c.clearRect(0, 0, 128, 64); c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 2; for (let x = 0; x <= 128; x += 10) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 64); c.stroke(); } for (let y = 0; y <= 64; y += 10) { c.beginPath(); c.moveTo(0, y); c.lineTo(128, y); c.stroke(); } });
    const net = new THREE.Mesh(new THREE.PlaneGeometry(GOAL.w, 1.35), new THREE.MeshBasicMaterial({ map: netT, transparent: true, side: THREE.DoubleSide, depthWrite: false })); net.position.set(0, 0.62, -0.62); net.rotation.x = 0.5; g.add(net); GOAL.net = net; net.userData.t = 0;
    G.colliders.push({ k: 'c', x: GOAL.x - GOAL.w / 2, z: GOAL.z, r: 0.1 }, { k: 'c', x: GOAL.x + GOAL.w / 2, z: GOAL.z, r: 0.1 }, { k: 'b', x0: GOAL.x - GOAL.w / 2, x1: GOAL.x + GOAL.w / 2, z0: GOAL.z - 0.95, z1: GOAL.z - 0.8 }); }
  // ---------- topiary circle guide: a ring that fills as you draw ----------
  const ringGuide = new THREE.Mesh(new THREE.RingGeometry(0.98, 1.04, 48), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.45, depthTest: false })); ringGuide.renderOrder = 33; ringGuide.position.set(Q.topiary.x, 1.5, Q.topiary.z + 0.75); ringGuide.visible = false; scene.add(ringGuide);
  const ringFill = new THREE.Mesh(new THREE.RingGeometry(0.95, 1.07, 48, 1, Math.PI / 2, 0.001), new THREE.MeshBasicMaterial({ color: '#ffd23a', depthTest: false, side: THREE.DoubleSide })); ringFill.renderOrder = 34; ringFill.position.copy(ringGuide.position); ringFill.visible = false; scene.add(ringFill); let ringK = -1;
  function ringStep() { const on = S.phase === 'work' && S.tool === 'trim' && !TOP.done && sprigs.length && !sprigs.some(q => !q.cut); ringGuide.visible = ringFill.visible = !!on; if (!on) return; const k = Math.min(1, Math.abs(TOP.ang) / (Math.PI * 2 * 0.92)); if (Math.abs(k - ringK) > 0.015) { ringK = k; ringFill.geometry.dispose(); ringFill.geometry = new THREE.RingGeometry(0.95, 1.07, 48, 1, Math.PI / 2, Math.max(0.001, k * Math.PI * 2) * (TOP.ang < 0 ? -1 : 1)); } }
  // ---------- a little party when a task is done ----------
  const AREA = { mow: V3((MW.x0 + MW.x1) / 2, 0.5, (MW.z0 + MW.z1) / 2), rake: V3(Q.tarp.x, 0.5, Q.tarp.z), trim: V3(Q.topiary.x, 1.6, Q.topiary.z), weed: V3(-6.2, 0.8, 4.4), plant: V3(-6.2, 0.8, 6.15), water: V3(-5.5, 1.3, -3.5) };
  const CONF = [0xffd23a, 0xec3013, 0x7dd3fc, 0x22c55e, 0xb48ae6];
  function party(id) { const c = AREA[id]; if (!c) return; for (let i = 0; i < 14; i++) puff(c.x + rr(-1, 1), c.y + rr(0, 0.8), c.z + rr(-0.6, 0.6), CONF[i % 5], 1); worker.userData.hop = 1; worker.userData.lineMood = 'excited'; setTimeout(() => { worker.userData.lineMood = null; }, 1500); }

  // pointer → gestures (work phase only; walk mode belongs to the Game HUD)
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (DM.on || S.phase !== 'work' || !S.job || S.hold) return; const { x, y } = local(e); e.preventDefault(); if (moleAt(x, y)) { bonkMole(); return; } const T = S.tool; S.ptr = { x, y, kind: null };
    if (T === 'mow') { const g = groundAt(x, y); if (g) { S.mow.tgt = g; S.mow.drive = true; S.ptr.kind = 'mow'; } }
    else if (T === 'rake') { S.ptr.kind = 'rake'; S.rakeAt = groundAt(x, y); }
    else if (T === 'trim') { S.ptr.kind = 'trim'; TOP.last = null; TOP.ang = 0; TOP.radii = []; snipAlong(x, y, x, y); circleMove(x, y); }
    else if (T === 'weed') { const w = weedAt(x, y); if (w) { S.pull = { w, y0: y, y, t: performance.now(), v: 0 }; S.ptr.kind = 'pull'; sfx.pullTug(); } else if (flowerAt(x, y)) { flash("THAT'S A FLOWER · PULL THE WEEDS", '#e6b45a', 1.2); } else flash('PRESS ON A WEED, THEN PULL UP', '#ffffff', 1); }
    else if (T === 'plant') { const p = spotAt(x, y); if (!p) { flash('TAP A BARE SPOT IN THE FRONT ROW', '#ffffff', 1); return; } if (p.st === 'empty') digTap(p); else if (p.st === 'hole') plantAt(p); }
    else if (T === 'water') { const u = urnAt(x, y); if (u) startWater(u); else flash('PRESS AND HOLD A DRY URN', '#ffffff', 1); } }
  function onMove(e) { const P = S.ptr; if (!P || !P.kind) return; const { x, y } = local(e), d = Math.hypot(x - P.x, y - P.y); if (d < 1) return;
    if (P.kind === 'mow') { const g = groundAt(x, y); if (g) S.mow.tgt = g; }
    else if (P.kind === 'rake') { pushLeaves(P.x, P.y, x, y, upg('broom') ? 86 : 56); S.rakeAt = groundAt(x, y); }
    else if (P.kind === 'trim') { snipAlong(P.x, P.y, x, y); circleMove(x, y); }
    else if (P.kind === 'pull') pullMove(y);
    P.x = x; P.y = y; }
  function onUp() { if (S.hold) releaseWater(); if (S.pull) { S.pull = null; } S.mow.drive = false; S.ptr = null; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- flow ----------
  function newJob() { const d = S.day, n = S.forceAll ? 6 : Math.min(6, d <= 1 ? 2 : d <= 2 ? 3 : d <= 4 ? 3 + (Math.random() < 0.5 ? 1 : 0) : 4 + (Math.random() < 0.5 ? 1 : 0)), tasks = [];
    while (tasks.length < n) { const t = pick(ORDER.filter(q => !tasks.includes(q))); tasks.push(t); } tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    let ci; do { ci = Math.floor(Math.random() * CLIENTS.length); } while (ci === lastClient); lastClient = ci; return { tasks, seed: pick(SK), client: ci, why: pick(WHY), hello: pick(HELLO), day: d }; }
  function nextOrder() { if (client) client.visible = false; const job = S.job = newJob(); CL = CLIENTS[job.client]; client = clientFox[job.client]; client.visible = true; place(client, Q.spots.door, 0); S.ri = 1;
    Object.assign(S, { phase: 'arrive', phT: 0, tool: null, seed: null, confirm: 0, doneSeen: {}, bagged: false, grow: 0, hold: null, pull: null, ptr: null, boops: 0, molesLeft: DM.on ? 1 : S.day <= 1 ? 1 : S.day <= 3 ? 2 : 3, moleT: DM.on ? 4 : rr(5, 9) }); molehills.forEach(m => m.visible = false); if (moleOn()) { mole.st = 'off'; mole.g.visible = false; } S.mow.drive = false; messUp(job.tasks, S.day); sfx.door(); }
  function startDay() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; audio.init && audio.init(); Object.assign(S, { orderN: 0, earned: 0, tips: 0, starList: [], done: null, react: null, dayBoops: 0 }); walker.visible = false; worker.visible = true; place(worker, Q.spots.benIntro, -0.5);
    say('NINGAL: "Work orders come from the College door. Read the card, take your time, do it right."', 5); nextOrder(); }
  function handBack() { if (S.phase !== 'work' || !S.job) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND IN AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishJob(); }
  const REACT = { delighted: { word: 'DELIGHTED!', col: '#22c55e', mood: 'excited', lines: ['The quad looks like a temple garden!', 'I will tell the Dean about you.', 'Even the ibises look impressed.'] }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Lovely work, thank you.', 'That will do nicely.', 'Tidy as a fresh tablet.'] }, okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['Hmm. A few things are off.', 'It will pass. Just.', 'Ningal would have done it neater.'] }, grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half of it is not done!', 'The scholars will laugh at us.', 'This is not what the card said.'] } };
  function finishJob() { if (mole.st !== 'off') { mole.st = 'off'; mole.g.visible = false; } const T = S.job.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'delighted' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const fixed = T.filter(t => info(t).done).length, pay = 8 + T.length * 4 + fixed * 2 + (S.boops || 0), tip = Math.round((level === 'delighted' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('radio') ? 1.25 : 1));
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; client.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: (S.boops && stars >= 2 && Math.random() < 0.5) ? pick(['And you booped the moles! The Dig Society never learns.', 'Were those moles in hard hats? Never mind. Lovely work.']) : pick(R.lines), who: CL.name, stars, tip, pay, t: 0 }; S.phase = 'react'; S.phT = 0; S.hold = null; S.ptr = null; S.pull = null; S.mow.drive = false; S.tool = null;
    if (level === 'grumpy') sfx.sad(); else { sfx.coins(3 + stars * 2); if (level === 'delighted') sfx.fanfare(); } if (stars === 3) { for (let i = 0; i < 10; i++) puff(client.position.x + rr(-0.4, 0.4), rr(1.4, 2.4), client.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { S.phase = 'done'; if (client) client.visible = false; S.job = null; place(worker, Q.spots.benIntro, -0.5); place(ningal, Q.spots.ningal, -0.5);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('urGroundsUniform')) { save.setFlag('urGroundsUniform'); unlock.push('UR GROUNDS UNIFORM (straw hat, rag + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { boops: S.dayBoops || 0, day: S.day, fixed: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    setTimeout(() => { sfx.coins(8); if (eod) sfx.fanfare(); }, 300);
    say(eod ? 'NINGAL: "Employee of the day! Even the Dean stopped to look."' : avg >= 2 ? 'NINGAL: "Good day. Same time tomorrow."' : 'NINGAL: "Slow down. The grass is not going anywhere."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); sfx.coins(6); return true; }
  function toIntro() { if (mole.st !== 'off') { mole.st = 'off'; mole.g.visible = false; } DM.on = false; hand.visible = false; Object.assign(S, { phase: 'intro', done: null, react: null, job: null, tool: null, hold: null, pull: null, ptr: null }); if (client) client.visible = false; worker.visible = false; walker.visible = true; walker.position.y = 0; place(walker, Q.spots.benIntro, -0.5); place(ningal, Q.spots.ningal, -0.5); }
  function goWalk() { if (S.phase !== 'intro' && S.phase !== 'done') return; WK.moleT = 5; audio.init && audio.init(); Object.assign(S, { phase: 'walk', done: null }); worker.visible = false; walker.visible = true; place(walker, Q.spots.walkStart, Math.PI); WK.yaw = -walker.rotation.y; WK.pitch = 0.5; WK.dist = 8.5; WK.snap = true;
    say('Walk the quad. Talk to NINGAL at the shed for work.', 3.5); }

  // ---------- camera ----------
  const { SAFE, shotFor, fitShot } = cameraFit(ST), CAM = { look: V3(0, 1, 0) };
  camera.position.set(4, 6, 20); camera.lookAt(CAM.look);
  const bx = (x, z, r, y0, y1, o) => { o.push(V3(x - r, y0, z - r), V3(x + r, y0, z + r), V3(x - r, y1, z - r), V3(x + r, y1, z + r)); return o; };
  const winOf = (xs, x0, span) => Math.max(0, Math.floor((Math.min(...xs) - x0) / span));
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L';
    if (S.phase === 'intro' || S.phase === 'done') return shotFor('wide' + k, () => { const o = []; for (const s of [Q.spots.benIntro, Q.spots.ningal]) o.push(V3(s.x - 0.5, 0, s.z), V3(s.x + 0.5, 0, s.z), V3(s.x, 2.6, s.z)); o.push(V3(10, 2.8, 6.2), V3(6.4, 0, 8.4)); return o; }, 0.14, Math.PI + 0.5, port ? 0.1 : 0.06);
    if (S.phase === 'react') { const f = client.position; return shotFor('react' + k + S.orderN, () => [V3(f.x - 0.9, 0.0, f.z), V3(f.x + 0.9, 0.0, f.z), V3(f.x, 2.7, f.z), V3(f.x + 1.6, 1.2, f.z)], 0.22, Math.PI + 0.35, 0.08); }
    if (S.phase !== 'work' || !S.tool) return shotFor('quad' + k, () => [V3(-10, 0, -8.6), V3(10, 0, -8.6), V3(-10, 0, 8.4), V3(10, 0, 8.4), V3(0, 4.5, -9.6)], 0.62, Math.PI, 0.04);
    const T = S.tool;
    if (T === 'mow') return shotFor('mow' + k, () => [V3(MW.x0, 0, MW.z0), V3(MW.x1, 0, MW.z0), V3(MW.x0, 0, MW.z1), V3(MW.x1, 0, MW.z1), V3(MW.x0, 0.6, MW.z0)], port ? 1.12 : 1.0, Math.PI, 0.04);   // steep, so Ben behind the mower covers little grass
    if (T === 'rake') { const R = Q.rake; return shotFor('rake' + k, () => [V3(R.x0, 0, R.z0), V3(R.x1, 0, R.z0), V3(R.x0, 0, R.z1), V3(R.x1, 0, R.z1)], 1.05, Math.PI, 0.04); }
    if (T === 'trim') { const H = Q.hedge, left = sprigs.filter(s => !s.cut);
      if (!left.length) { const t = Q.topiary; return shotFor('top' + k, () => bx(t.x, t.z, 1.0, 0, 2.3, []), 0.3, Math.PI, 0.12); }
      if (!port) return shotFor('hedge' + k, () => [V3(H.x0 - 0.2, 0, H.z + 0.5), V3(H.x1 + 0.2, 0, H.z + 0.5), V3(H.x0 - 0.2, 1.5, H.z), V3(H.x1 + 0.2, 1.5, H.z)], 0.32, Math.PI, 0.05);
      const w = winOf(left.map(s => s.m.position.x), H.x0, 2.7), a = H.x0 + w * 2.7; return shotFor('hedge' + k + w, () => [V3(a - 0.2, 0, H.z + 0.5), V3(a + 2.9, 0, H.z + 0.5), V3(a - 0.2, 1.45, H.z), V3(a + 2.9, 1.45, H.z)], 0.32, Math.PI, 0.05); }
    if (T === 'weed') { const left = weeds.filter(w => w.st === 'in'); if (!port || !left.length) return shotFor('bed' + k, () => [V3(B.x0, 0.33, B.z0), V3(B.x1, 0.33, B.z0), V3(B.x0, 0.33, B.z1), V3(B.x1, 0.33, B.z1), V3(B.x0, 0.9, B.z0)], 0.95, Math.PI, 0.04);
      const w = winOf(left.map(q => q.x), B.x0, 2.6), a = B.x0 + w * 2.6; return shotFor('bed' + k + w, () => [V3(a - 0.1, 0.33, B.z0), V3(a + 2.7, 0.33, B.z0), V3(a - 0.1, 0.33, 6.0), V3(a + 2.7, 0.33, 6.0), V3(a, 0.9, B.z0)], 0.95, Math.PI, 0.04); }
    if (T === 'plant') return shotFor('plant' + k, () => { const o = []; for (const p of plantSpots) bx(p.x, p.z, 0.55, 0.33, 0.9, o); return o; }, 0.8, Math.PI, 0.08);
    if (T === 'water') { const left = urns.filter(u => u.st === 'dry'); if (!port || !left.length) return shotFor('urns' + k, () => { const o = []; for (const u of urns) bx(u.x, u.z, 0.5, 0, 1.75, o); return o; }, 0.38, Math.PI, 0.05);
      const w = winOf(left.map(u => u.x), -8.9, 2.8), a = -8.9 + w * 2.8; return shotFor('urns' + k + w, () => { const o = []; for (const u of urns) if (u.x >= a - 0.1 && u.x <= a + 2.9) bx(u.x, u.z, 0.55, 0, 1.75, o); if (!o.length) bx(left[0].x, left[0].z, 0.6, 0, 1.75, o); return o; }, 0.38, Math.PI, 0.06); }
    return shotFor('quad' + k, () => [V3(-10, 0, -8.6), V3(10, 0, 8.4)], 0.62, Math.PI, 0.04); }

  // ---------- DEMO: autopilot works one order with all six tasks; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, holdTo: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.5); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const handAt = p => { hand.visible = true; hand.position.copy(p).add(V3(0, 0.15, 0.15)); hand.scale.setScalar(0.75); };
  const cap = (id, key, text, wait = 1.8) => { if (DM.seen[id]) return 0; DM.seen[id] = 1; DM.cap = text; DM.key = key; return wait; };
  function demoAct() { if (!S.job) return 0.5; if (mole.st === 'up' || mole.st === 'tease') { const w = cap('mole', 'TAP', 'A MOLE! THEY POP UP WHERE YOU WORK. TAP IT BEFORE IT MAKES TROUBLE', 1.0); if (w) return w; handAt(mole.g.position.clone().add(V3(0, 0.4, 0))); bonkMole(); return 0.9; } const T = nextTask();
    if (!T) { DM.cap = 'EVERY TASK DONE: TAP HAND IN'; DM.key = 'TAP'; hand.visible = false; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handBack(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'TASK ' + (S.job.tasks.indexOf(T) + 1) + ' OF ' + S.job.tasks.length + ': TAP ' + TASKS[T].label + ' AT THE BOTTOM'; DM.key = 'TAP'; hand.visible = false; S.mow.drive = false; return 1.5; }
    if (T === 'mow') { const w = cap('mow', 'DRAG', 'DRAG YOUR FINGER: THE MOWER FOLLOWS IT. MISS THE RED SPRINKLERS', 2.2); if (w) return w; const p = mower.position, safe = c => sprink.every(g => !g.visible || Math.hypot(g.position.x - c.x, g.position.z - c.z) > 0.75);
      let best = null, bd = 1e9; for (const c of cells) { if (c.cut || c.sp || !safe(c)) continue; const d = (c.x - p.x) ** 2 * 0.4 + (c.z - p.z) ** 2; if (d < bd) { bd = d; best = c; } }
      if (!best) { cells.forEach((c, k) => { if (!c.cut && !c.sp) { c.cut = true; c.h = 0.06; setTuft(k); paintCell(c, 'x'); } }); tufts.instanceMatrix.needsUpdate = true; checkDone(); return 0.4; } S.mow.tgt = V3(best.x, 0, best.z); S.mow.drive = true; handAt(V3(best.x, 0.3, best.z)); return 0.12; }
    if (T === 'rake') { const L = leaves.filter(l => !l.in).sort((a, b) => Math.hypot(a.x - Q.tarp.x, a.z - Q.tarp.z) - Math.hypot(b.x - Q.tarp.x, b.z - Q.tarp.z))[0]; if (!L) return 0.3; const w = cap('rake', 'SWIPE', 'SWIPE THE LEAVES INTO THE BLUE TARP'); if (w) return w;
      const dx = Q.tarp.x - L.x, dz = Q.tarp.z - L.z, d = Math.hypot(dx, dz), st = Math.min(d, 1.1), a = scr(V3(L.x, 0.03, L.z)), b = scr(V3(L.x + dx / d * st, 0.03, L.z + dz / d * st)); handAt(V3(L.x, 0.1, L.z)); S.rakeAt = V3(L.x, 0, L.z); pushLeaves(a.x, a.y, b.x, b.y, 36); return 0.22; }
    if (T === 'trim') { const s = sprigs.find(q => !q.cut); if (s) { const w = cap('trim', 'SWIPE', 'SWIPE ALONG THE HEDGE TO SNIP THE SPRIGS'); if (w) return w; const p = scr(wp(s.m).add(V3(0, 0.12, 0))); handAt(wp(s.m)); snipAlong(p.x, p.y, p.x, p.y); return 0.16; }
      const w = cap('top', 'CIRCLE', 'THEN DRAW A CIRCLE ROUND THE TOPIARY TO SHAPE IT', 2); if (w) return w; DM.ta = (DM.ta || 0) + 0.9; const c = topiary.position; handAt(c.clone().add(V3(Math.cos(DM.ta) * 0.8, Math.sin(DM.ta) * 0.8, 0.4))); TOP.ang = DM.ta; setShag(Math.max(0, 1 - DM.ta / (Math.PI * 2 * 0.92))); topiary.rotation.y = DM.ta * 0.15; if (DM.ta >= Math.PI * 2 * 0.92) { DM.ta = 0; shapeTopiary(1); return 0.8; } return 0.1; }
    if (T === 'weed') { const wd = weeds.find(q => q.st === 'in'); if (!wd) return 0.3; const w = cap('weed', 'PULL', 'PRESS A WEED AND PULL UP SLOWLY. TOO FAST AND THE ROOT SNAPS', 2.2); if (w) return w; handAt(V3(wd.x, 0.5 + wd.lift * 0.3, wd.z)); wd.lift = Math.min(1, wd.lift + 0.2); if (wd.lift >= 1) { popWeed(wd); return 0.6; } return 0.12; }
    if (T === 'plant') { if (S.seed !== S.job.seed) { const w = cap('seed', SEEDS[S.job.seed].name, 'THE CARD SAYS ' + SEEDS[S.job.seed].name + ': PICK IT BELOW', 2.2); if (w) return w; setSeed(S.job.seed); return 1; }
      const p = plantSpots.find(q => q.st === 'empty' || q.st === 'hole'); if (!p) return 0.3; const w = cap('dig', 'TAP', 'TAP A BARE SPOT 3 TIMES TO DIG, THEN TAP TO PLANT'); if (w) return w; handAt(V3(p.x, 0.4, p.z)); if (p.st === 'empty') { digTap(p); return 0.35; } plantAt(p); return 0.8; }
    if (T === 'water') { const u = urns.find(q => q.st === 'dry'); if (!u) return 0.3; const w = cap('water', 'HOLD', 'HOLD ON A DRY URN. LET GO WHEN THE BAR IS GREEN'); if (w) return w; handAt(V3(u.x, 1.1, u.z)); startWater(u); DM.holdTo = (WZ()[0] + WZ()[1]) / 2; return 0.1; }
    return 0.5; }
  function demoStep(dt) { if (S.hold && DM.holdTo != null) { if (S.hold.u.lvl >= DM.holdTo) { DM.holdTo = null; releaseWater(); DM.cd = 0.8; } return; }
    hand.scale.setScalar(Math.max(0.45, hand.scale.x - dt * 0.8));
    if (S.phase === 'arrive' || S.phase === 'brief') { DM.cap = 'WORK ORDERS COME OUT OF THE COLLEGE DOOR. OVERNIGHT THE QUAD GETS MESSY'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE TEACHER CHECKS YOUR WORK. CLEAN WORK EARNS STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk')) return; audio.init && audio.init(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.holdTo = null; DM.ta = 0; DM.cap = 'WATCH A WORK ORDER AT THE UR GROUNDS'; DM.key = ''; S.done = null; S.phase = 'intro'; DM.day0 = S.day; S.day = 3; S.forceAll = true; startDay(); S.forceAll = false; }
  function demoStop() { if (!DM.on) return; S.day = DM.day0; toIntro(); }

  // ---------- hints ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'work' || !S.job) return null; const T = S.tool, H = (p, text, tool = T, r = 0.32) => ({ p, text, tool, r });
    if (mole.st === 'up' || mole.st === 'tease') return { text: 'A MOLE! TAP IT BEFORE IT MAKES TROUBLE', tool: T };
    if (S.hold) return H(V3(S.hold.u.x, 0.05, S.hold.u.z), 'LET GO WHEN THE BAR IS GREEN', T, 0.5);
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + TASKS[nx].label + ' BELOW', tool: nx } : { text: 'ALL DONE · TAP HAND IN', tool: 'hand' }; }
    if (T === 'mow') { const p = mower.position; let best = null, bd = 1e9; for (const c of cells) { if (c.cut || c.sp) continue; const d = (c.x - p.x) ** 2 + (c.z - p.z) ** 2; if (d < bd) { bd = d; best = c; } } return best ? H(V3(best.x, 0.05, best.z), 'DRAG THE MOWER OVER THE LONG GRASS · ' + info(T).txt, T, 0.3) : null; }
    if (T === 'rake') { const L = leaves.find(l => !l.in); return L ? H(V3(L.x, 0.05, L.z), 'SWIPE THE LEAVES INTO THE BLUE TARP · ' + info(T).left + ' LEFT', T, 0.3) : null; }
    if (T === 'trim') { const s = sprigs.find(q => !q.cut); if (s) return H(V3(s.m.position.x, 0.03, Q.hedge.z + 0.6), 'SWIPE ALONG THE HEDGE TO SNIP · ' + sprigs.filter(q => !q.cut).length + ' LEFT', T, 0.25); return H(V3(Q.topiary.x, 0.03, Q.topiary.z), 'DRAW A CIRCLE ROUND THE TOPIARY · ' + Math.round(Math.min(1, Math.abs(TOP.ang) / (Math.PI * 1.84)) * 100) + '%', T, 0.75); }
    if (T === 'weed') { const w = S.pull ? S.pull.w : weeds.find(q => q.st === 'in'); return w ? H(V3(w.x, 0.36, w.z), S.pull ? 'KEEP PULLING UP · SLOW AND STEADY' : 'PRESS A WEED AND PULL UP SLOWLY · ' + info(T).left + ' LEFT', T, 0.22) : null; }
    if (T === 'plant') { if (S.job.tasks.includes('weed') && !info('weed').done) return { text: 'WEED THE BED BEFORE YOU PLANT', tool: 'weed' }; const p = plantSpots.find(q => q.st === 'empty' || q.st === 'hole'); if (!p) return null;
      if (p.st === 'empty') return H(V3(p.x, 0.36, p.z), 'TAP THE BARE SPOT TO DIG · ' + p.dig + ' / 3', T, 0.26); return S.seed ? H(V3(p.x, 0.36, p.z), 'TAP THE HOLE TO PLANT ' + SEEDS[S.seed].name, T, 0.26) : { text: 'PICK ' + SEEDS[S.job.seed].name + ' BELOW', tool: T }; }
    if (T === 'water') { const u = urns.find(q => q.st === 'dry'); return u ? H(V3(u.x, 0.05, u.z), 'PRESS AND HOLD A DRY URN · ' + info(T).left + ' LEFT', T, 0.5) : null; }
    return null; }
  let HINT = null, hintT = 0;

  // ---------- WALK MODE (Game HUD drives it) ----------
  const WK = { yaw: Math.PI, pitch: 0.42, dist: 8, stick: { x: 0, y: 0 }, keys: new Set(), y: 0, vy: 0, kick: 0, prompt: null, near: null, sheshI: 0, whistle: 0 };
  const KEYS = { KeyW: [0, 1], ArrowUp: [0, 1], KeyS: [0, -1], ArrowDown: [0, -1], KeyA: [-1, 0], ArrowLeft: [-1, 0], KeyD: [1, 0], ArrowRight: [1, 0] };
  const onKD = e => { if (S.phase !== 'walk' || !KEYS[e.code]) return; WK.keys.add(e.code); }, onKU = e => WK.keys.delete(e.code), onBlur = () => WK.keys.clear();
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  function walkStep(dt) { let sx = WK.stick.x, sy = WK.stick.y; for (const k of WK.keys) { sx += KEYS[k][0]; sy += KEYS[k][1]; } const m = Math.min(1, Math.hypot(sx, sy)); let spd = 0;
    if (m > 0.08) { const fx = -Math.sin(WK.yaw), fz = Math.cos(WK.yaw), rx = -Math.cos(WK.yaw), rz = -Math.sin(WK.yaw), n = Math.hypot(sx, sy), mx = (fx * sy + rx * sx) / n, mz = (fz * sy + rz * sx) / n; spd = 4.4 * m;
      const p = walker.position, ox = p.x, oz = p.z; p.x += mx * spd * dt; p.z += mz * spd * dt; pushOut(p, 0.38, G.colliders.concat(NPC_COL, STROLL.map(d => ({ k: 'c', x: d.f.position.x, z: d.f.position.z, r: 0.4 }))), G.bounds); spd = Math.hypot(p.x - ox, p.z - oz) / dt;
      let d = Math.atan2(mx, mz) - walker.rotation.y; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; walker.rotation.y += d * Math.min(1, dt * 12); }
    const wasAir = WK.y > 0.05; WK.vy -= 15 * dt; WK.y = Math.max(0, WK.y + WK.vy * dt); if (WK.y <= 0) WK.vy = 0; walker.position.y = WK.y; if (wasAir && WK.y <= 0) sfx.land();
    if (spd > 0.5 && WK.y <= 0) { WK.stepD = (WK.stepD || 0) + spd * dt; if (WK.stepD > 0.95) { WK.stepD = 0; const p2 = walker.position; sfx.step(onGrass(p2.x, p2.z), (WK.stepS = -(WK.stepS || 0.15))); } }
    kit.animFox(walker, dt, spd, WK.y > 0.02); if (WK.kick > 0) { WK.kick -= dt; walker.userData.P.legs[0].rotation.x = -1.3 * Math.sin((1 - WK.kick / 0.35) * Math.PI); }
    // who is near
    const p = walker.position, dN = Math.hypot(p.x - ningal.position.x, p.z - ningal.position.z), dS = Math.hypot(p.x - shesh.position.x, p.z - shesh.position.z);
    const st2 = STROLL.find(d => Math.hypot(p.x - d.f.position.x, p.z - d.f.position.z) < 2.0); WK.near = dN < 2.5 ? 'ningal' : dS < 2.3 ? 'shesh' : st2 ? st2 : null; WK.prompt = WK.near === 'ningal' ? 'TALK · NINGAL · ASK FOR WORK' : WK.near === 'shesh' ? 'TALK · SHESH' : st2 ? 'TALK · ' + st2.name : null;
    ningal.userData.lookAt = dN < 5 ? V3(p.x, 1.6, p.z) : null; shesh.userData.lookAt = dS < 4 ? V3(p.x, 1.6, p.z) : null;
    // follow camera (Game HUD drag = lookBy, pinch = zoomBy)
    const tgt = V3(p.x, 1.3 + WK.y * 0.5, p.z), dir = V3(Math.sin(WK.yaw) * Math.cos(WK.pitch), Math.sin(WK.pitch), -Math.cos(WK.yaw) * Math.cos(WK.pitch)), want = tgt.clone().addScaledVector(dir, WK.dist * (CW() < CHh() ? 1.3 : 1)); want.z = Math.max(want.z, -9.0); want.y = Math.max(want.y, 0.8);
    { const SH = Q.shed; for (let i = 0; i < 12; i++) { if (want.x > SH.x0 - 0.4 && want.z > SH.z0 - 0.4 && want.y < 3.4) want.lerp(tgt, 0.12); else break; } }   // never inside the shed
    const segDist = (x, z) => { const ax = tgt.x, az = tgt.z, bx2 = camera.position.x, bz = camera.position.z, vx = bx2 - ax, vz = bz - az, L = vx * vx + vz * vz, u = L ? clamp(((x - ax) * vx + (z - az) * vz) / L, 0, 1) : 0; return u > 0.15 ? Math.hypot(x - ax - vx * u, z - az - vz * u) : 9; };
    G.lamps.forEach(l => l.visible = segDist(l.position.x, l.position.z) > 0.7); G.canopy.userData.hide = segDist(Q.tree.x, Q.tree.z) < 2.2;
    if (WK.snap) { camera.position.copy(want); CAM.look.copy(tgt); WK.snap = false; } camera.position.lerp(want, Math.min(1, dt * 6)); CAM.look.lerp(tgt, Math.min(1, dt * 8)); camera.lookAt(CAM.look); }
  function kickBall() { if ((mole.st === 'up' || mole.st === 'tease') && Math.hypot(mole.g.position.x - walker.position.x, mole.g.position.z - walker.position.z) < 2.0) { WK.kick = 0.35; bonkMole(); return; } const p = walker.position, dx = BALL.x - p.x, dz = BALL.z - p.z, d = Math.hypot(dx, dz); WK.kick = 0.35; if (d < 1.6) { const f = Math.sin(walker.rotation.y), g = Math.cos(walker.rotation.y); BALL.vx = (dx / (d || 1) * 0.4 + f * 0.6) * 9; BALL.vz = (dz / (d || 1) * 0.4 + g * 0.6) * 9; BALL.vy = 3.5; sfx.kick(); buzz(15); } else sfx.whoosh(); }
  function ballStep(dt) { if (Math.abs(BALL.vx) + Math.abs(BALL.vz) + Math.abs(BALL.vy) < 0.01 && BALL.y <= 0) return; const ox = BALL.x, oz = BALL.z; BALL.x += BALL.vx * dt; BALL.z += BALL.vz * dt; BALL.vy -= 14 * dt; BALL.y += BALL.vy * dt; if (BALL.y < 0) { BALL.y = 0; BALL.vy = Math.abs(BALL.vy) > 1.2 ? -BALL.vy * 0.5 : 0; }
    const f = Math.pow(BALL.y > 0 ? 0.9 : 0.35, dt); BALL.vx *= f; BALL.vz *= f; const q = { x: BALL.x, z: BALL.z }; pushOut(q, 0.22, BALL.y > 0.5 ? G.colliders.filter(c => c.k === 'b') : G.colliders.concat(NPC_COL), G.bounds);
    if (Math.abs(q.x - BALL.x) > 1e-4 || Math.abs(q.z - BALL.z) > 1e-4) { const nx = q.x - BALL.x, nz = q.z - BALL.z, nl = Math.hypot(nx, nz) || 1, ux = nx / nl, uz = nz / nl, dot = BALL.vx * ux + BALL.vz * uz; if (dot < 0) { BALL.vx -= 1.7 * dot * ux; BALL.vz -= 1.7 * dot * uz; } sfx.bump();
      if (Math.hypot(BALL.x, BALL.z) < 2.3) { for (let i = 0; i < 5; i++) puff(BALL.x, 0.6, BALL.z, 0x9fdcff, 1); sfx.splash(); say('SPLASH! The Dean is going to hear about that.', 2.4); } }
    BALL.x = q.x; BALL.z = q.z;
    if (!BALL.scored && BALL.z < GOAL.z - 0.15 && BALL.z > GOAL.z - 0.95 && Math.abs(BALL.x - GOAL.x) < GOAL.w / 2 - 0.1 && BALL.y < 1.1) { BALL.scored = true; WK.goals = (WK.goals || 0) + 1; say('GOAL! That makes ' + WK.goals + '. The ibises go wild.', 3); for (let i = 0; i < 16; i++) puff(GOAL.x + rr(-1, 1), rr(0.4, 1.6), GOAL.z + rr(-0.5, 0.2), CONF[i % 5], 1); sfx.fanfare(); sfx.coins(5); buzz([20, 60, 20]); ibis.forEach((b, i) => { if (!b.fly) b.fly = 0.001 + i * 0.1; }); GOAL.net.userData.t = 0.6;
      setTimeout(() => { Object.assign(BALL, { x: GOAL.x, z: -5.4, y: 1.5, vx: 0, vz: 0, vy: 0, scored: false }); puff(GOAL.x, 1.5, -5.4, 0xffffff, 3); }, 1600); }
    ball.position.set(BALL.x, 0.22 + BALL.y, BALL.z); ball.rotation.x += (BALL.z - oz) / 0.22; ball.rotation.z -= (BALL.x - ox) / 0.22; }
  function whistle() { tone(1500, 0.12, 0.05, 'sine', 1.4); setTimeout(() => tone(1900, 0.18, 0.05, 'sine', 0.8), 140); WK.whistle = 1; setTimeout(() => { sfx.whoosh(); sfx.honk(); }, 250); ibis.forEach((b, i) => { if (!b.fly) b.fly = 0.001 + i * 0.15; }); if (WK.near === 'shesh') say('SHESH: "Shh! Exam!"', 2); }
  function ibisStep(dt, t) { for (const b of ibis) { const g = b.g; if (b.fly > 0) { b.fly += dt; const k = b.fly, up = smooth(0, 1.2, k) * (1 - smooth(5.5, 7, k)), a = b.a + k * 0.9; g.position.set(Math.cos(a) * (2.5 + up * 3), 0.09 + up * 5, Math.sin(a) * (2.5 + up * 3)); g.rotation.y = -a; b.wings.forEach((w, i) => w.rotation.z = (i ? -1 : 1) * Math.sin(t * 14 + i) * 0.8 * (up > 0.05 ? 1 : 0)); if (k > 7) { b.fly = 0; g.position.set(b.home.x, 0.09, b.home.z); } }
    else { b.t += dt; b.hd.position.y = 0.86 - Math.max(0, Math.sin(b.t * 1.3)) * 0.25; g.rotation.y = b.a + Math.sin(b.t * 0.3) * 0.6; b.wings.forEach(w => w.rotation.z = 0); } } }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  function workerTarget() { const T = S.tool, c = client ? client.position : V3(), ST2 = { x: c.x + 1.1, z: c.z - 0.2, fx: c.x, fz: c.z };
    if (S.phase !== 'work' || !T) return ST2;
    if (T === 'mow') { const h = S.mow.hd, p = mower.position; return { x: p.x - Math.sin(h) * 1.5, z: p.z - Math.cos(h) * 1.5, fx: p.x, fz: p.z, snap: true }; }   // behind the handle, pushing
    if (T === 'rake') { const a = S.rakeAt || V3(Q.tarp.x, 0, Q.tarp.z); return { x: 8.1, z: 2.3, fx: a.x, fz: a.z }; }   // top-right corner of the shot, out of the leaves' way
    if (T === 'trim') { const s = sprigs.find(q => !q.cut), x = s ? clamp(s.m.position.x, Q.hedge.x0 + 0.3, Q.hedge.x1 - 0.3) : Q.hedge.x1 - 0.5; return { x, z: Q.hedge.z - 1.05, fx: x, fz: 0 }; }   // behind the hedge, trimming toward the camera
    if (T === 'weed' || T === 'plant') { const w = T === 'weed' ? (S.pull ? S.pull.w : weeds.find(q => q.st === 'in')) : plantSpots.find(q => q.st === 'empty' || q.st === 'hole'), x = w ? clamp(w.x, B.x0 + 0.3, B.x1 - 0.3) : -6; return { x, z: B.z0 - 0.65, fx: x, fz: 9 }; }   // north side of the bed
    if (T === 'water') { const u = S.hold ? S.hold.u : urns.find(q => q.st === 'dry') || urns[2]; return { x: u.x + 0.75, z: u.z - 0.95, fx: u.x, fz: u.z }; }   // behind the urn, to one side
    return ST2; }
  function step(dt) { const t = clock.elapsedTime; S.phT += dt;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    G.jets.forEach((j, i) => j.scale.y = 0.9 + Math.sin(t * 6 + i) * 0.1); G.water.position.y = 0.44 + Math.sin(t * 2) * 0.01;
    ibisStep(dt, t); ballStep(dt); moleStep(dt, t); musicTick(); ambTick(dt); todStep(dt); ringStep(); strollStep(dt); pollenStep(dt, t); G.banners.forEach((b2, i) => b2.rotation.x = Math.sin(t * 1.6 + i * 1.3) * 0.06 + 0.02);
    if (GOAL.net.userData.t > 0) { GOAL.net.userData.t -= dt; GOAL.net.position.z = -0.62 - Math.sin(GOAL.net.userData.t * 20) * 0.1 * GOAL.net.userData.t; }
    clouds.forEach((c, i) => { c.position.x += dt * (0.25 + i * 0.04); if (c.position.x > 70) c.position.x = -70; });
    for (const bl of blobs) { const o = bl.obj, vis = o.visible && (!o.parent || o.parent.visible !== false); bl.m.visible = vis; if (vis) { bl.m.position.set(o.position.x, groundY(o.position.x, o.position.z), o.position.z); const up = o === walker ? WK.y : o === ball ? BALL.y : 0; bl.m.scale.setScalar(bl.r * Math.max(0.5, 1 - up * 0.25)); } }
    for (const bf of butterflies) { bf.t += dt * bf.sp; const a = bf.t; bf.g.position.set(bf.c[0] + Math.sin(a * 1.3) * 1.4, 1.0 + Math.sin(a * 2.7) * 0.35, bf.c[1] + Math.sin(a * 0.9 + 1) * 1.1); bf.g.rotation.y = Math.atan2(Math.cos(a * 1.3) * 1.8, Math.cos(a * 0.9 + 1) * 1.0); bf.wings.forEach((w, i) => w.rotation.z = (i ? 1 : -1) * Math.abs(Math.sin(t * 18 + bf.c[0])) * 1.1); }
    ripT.rotation += dt * 0.15; for (const d of drops) { d.t += dt * 0.9; if (d.t > 1) d.t -= 1; const i = drops.indexOf(d) % 4, a = i * Math.PI / 2 + (drops.indexOf(d) % 5) * 0.08, r = 0.6 + d.t * 1.0; d.sp.position.set(Math.cos(a) * r, 1.45 + d.t * 0.6 - d.t * d.t * 1.5, Math.sin(a) * r); d.sp.material.opacity = 1 - d.t * 0.6; }
    { const T = S.phase === 'work' ? S.tool : null; ['trim', 'plant', 'water', 'rake'].forEach(k => TOOLS[k].visible = T === k && worker.visible); if (T === 'rake' && S.ptr && S.ptr.kind === 'rake') { WP.arms[1].rotation.x = -0.6 + Math.sin(t * 10) * 0.45; WP.arms[0].rotation.x = -0.6 + Math.sin(t * 10) * 0.45; } if (T === 'trim' && S.ptr) TOOLS.blades.forEach((b2, i) => b2.rotation.y = (i ? 1 : -1) * (0.08 + Math.abs(Math.sin(t * 20)) * 0.25)); if (T === 'water' && S.hold) TOOLS.water.rotation.x = -0.5; else TOOLS.water.rotation.x = 0; }
    for (const q of sprigs) if (q.grow > 0) { q.grow = Math.min(1, q.grow + dt * 3); q.m.scale.setScalar(Math.max(0.01, q.s * smooth(0, 1, q.grow))); if (q.grow >= 1) q.grow = 0; }
    // overnight mess grows in
    if (S.grow < 1) { S.grow = Math.min(1, S.grow + dt / 2.4); const k = smooth(0, 1, S.grow), J = S.job ? S.job.tasks : [];
      if (J.includes('mow')) { cells.forEach((c, i) => { if (!c.cut) { c.h = (c.h0 || 0.06) + (c.ht - (c.h0 || 0.06)) * k; setTuft(i); } }); tufts.instanceMatrix.needsUpdate = true; }
      if (J.includes('trim')) { sprigs.forEach(s => { if (!s.cut) s.m.scale.setScalar(Math.max(0.01, s.s * k)); }); setShag((TOP.shag0 || 0) + (1 - (TOP.shag0 || 0)) * k); TOP.shag = 1; }
      if (J.includes('weed')) weeds.forEach(w => w.g.scale.setScalar(Math.max(0.01, k))); }
    for (const L of leaves) { if (L.y > 0) { L.y = Math.max(0, L.y - dt * 1.6); L.m.position.set(L.x + Math.sin(t * 3 + L.spin) * 0.25 * Math.min(1, L.y), 0.035 + L.y, L.z); L.m.rotation.z = Math.sin(t * 5 + L.spin) * 0.6 * Math.min(1, L.y); } else { L.m.position.set(L.x, L.in ? 0.05 : 0.035, L.z); L.m.rotation.z = 0; L.m.rotation.y += L.spin * dt * 0.05; L.spin *= Math.pow(0.1, dt); } }
    if (G.pile.visible && G.pile.userData.t < 1) { G.pile.userData.t = Math.min(1, (G.pile.userData.t || 0) + dt * 1.5); G.pile.scale.set(1, Math.max(0.01, smooth(0, 1, G.pile.userData.t)), 1); if (G.pile.userData.t >= 1) leaves.forEach(l => l.m.visible = false); }
    for (const s of sprigs) if (s.fall > 0 && s.m.visible) { s.fall += dt; s.m.position.y -= dt * (1 + s.fall * 8); s.m.rotation.x += dt * 6; if (s.m.position.y < 0.05) s.m.visible = false; }
    for (const w of weeds) { if (w.st === 'in') { w.top.scale.y = 1 + w.lift * 0.35; w.root.scale.y = 1 + w.lift * 0.8; } else w.top.scale.y = 1; if (w.st === 'in') w.top.position.y = w.lift * 0.3 + (S.pull && S.pull.w === w ? Math.sin(t * 40) * 0.006 : 0); else if (w.fly > 0 && w.g.visible) { w.fly += dt * 1.8; const k = Math.min(1, w.fly), a = V3(w.x, 0.33, w.z), b = G.bucket.position.clone().add(V3(0, 0.3, 0)); w.g.position.lerpVectors(a, b, k); w.g.position.y += Math.sin(k * Math.PI) * 1.2; w.g.rotation.x += dt * 8; if (k >= 1) { w.g.visible = false; } } if (w.st === 'in' && !(S.pull && S.pull.w === w) && !DM.on) w.lift = Math.max(0, w.lift - dt * 1.5); }
    for (const p of plantSpots) if (p.anim > 0 && p.anim < 1) { p.anim = Math.min(1, p.anim + dt * 2.5); p.f.scale.setScalar(smooth(0, 1, p.anim)); }
    for (const p of plantSpots) if (p.ring.visible) p.ring.material.opacity = 0.45 + Math.sin(t * 4) * 0.25;
    if (S.hold) { const u = S.hold.u; u.lvl = Math.min(1.1, u.lvl + dt * 0.42); if (Math.random() < dt * 30) { const a = wp(WP.body).add(V3(0, 1.0, 0)), b = V3(u.x, 1.0, u.z), k = Math.random(), q = a.clone().lerp(b, k); q.y += Math.sin(k * Math.PI) * 0.7; puff(q.x, q.y, q.z, 0x7fd0ff, 1); }  if (u.lvl >= 1.1) releaseWater(); }
    for (const u of urns) { const k = u.st === 'tidy' ? 1 : clamp(u.lvl / WZ()[0], 0, 1); u.f.userData.pv.rotation.z = damp(u.f.userData.pv.rotation.z, (1 - k) * 1.15, 6, dt); }
    // the mower + client + worker
    const mv = (S.phase === 'work' && S.tool === 'mow') || DM.on ? mowStep(dt) : 0; engineTick(mv);
    if (client && client.visible) { const R = Q.route, sp = S.phase === 'arrive' ? 3.4 : 4.2; let moving = 0;
      if (S.phase === 'arrive' || S.phase === 'leave') { const tgtI = S.phase === 'arrive' ? S.ri : S.ri, T2 = R[tgtI], dx = T2[0] - client.position.x, dz = T2[1] - client.position.z, d = Math.hypot(dx, dz); if (d > 0.05) { const s2 = Math.min(d, sp * dt); client.position.x += dx / d * s2; client.position.z += dz / d * s2; client.rotation.y = Math.atan2(dx, dz); moving = sp; }
        else if (S.phase === 'arrive') { if (S.ri < R.length - 1) S.ri++; else if (S.grow >= 1) { S.phase = 'brief'; S.phT = 0; say(CL.name + ': "' + S.job.why + ' ' + S.job.hello + '"', 4.5); tone(1046, 0.06, 0.03); } }
        else { if (S.ri > 0) S.ri--; else { client.visible = false; if (DM.on) { demoStop(); return; } S.orderN++; if (S.orderN >= UR_GROUNDS.perDay) endDay(); else nextOrder(); } } }
      if (S.phase === 'brief' && S.phT > 1.8) { S.phase = 'work'; S.tool = nextTask(); tone(880, 0.08, 0.04); }
      if (S.phase === 'react') { if (S.react) S.react.t += dt; if (S.phT > 3.4) { S.react = null; S.phase = 'leave'; S.phT = 0; S.ri = Q.route.length - 1; client.userData.mood = 'happy'; } }
      if (S.phase === 'brief' || S.phase === 'work' || S.phase === 'react') { client.userData.lookAt = S.phase === 'react' ? null : wp(WP.body).add(V3(0, 1.5, 0)); client.rotation.y = damp(client.rotation.y, S.phase === 'react' ? -0.1 : Math.atan2(worker.position.x - client.position.x, worker.position.z - client.position.z), 4, dt); } else client.userData.lookAt = null;
      client.userData.talking = S.phase === 'brief' || S.phase === 'react'; kit.animFox(client, dt, moving); }
    if (worker.visible) { const W = workerTarget(), p = worker.position, dx = W.x - p.x, dz = W.z - p.z, d = Math.hypot(dx, dz); let spd = 0;
      if (W.snap && d < 1.3) { p.x = W.x; p.z = W.z; spd = mv; } else if (d > 0.12) { const s2 = Math.min(d, 5 * dt); p.x += dx / d * s2; p.z += dz / d * s2; spd = s2 / dt; pushOut(p, 0.36, FOUNT, null); }
      const face = spd > 0.4 && !(W.snap && d < 1.3) ? Math.atan2(dx, dz) : S.phase === 'react' ? -0.7 : Math.atan2(W.fx - p.x, W.fz - p.z); let df = face - worker.rotation.y; while (df > Math.PI) df -= Math.PI * 2; while (df < -Math.PI) df += Math.PI * 2; worker.rotation.y += df * Math.min(1, dt * 10);
      if (spd > 0.6 && !(S.tool === 'mow' && S.phase === 'work')) { WK.wStepD = (WK.wStepD || 0) + spd * dt; if (WK.wStepD > 1.0) { WK.wStepD = 0; sfx.step(onGrass(p.x, p.z), 0); } }
      kit.animFox(worker, dt, spd); worker.userData.mood = S.phase === 'done' ? 'excited' : 'happy'; if (S.hold || S.pull) { WP.arms[1].rotation.x = -1.2; WP.arms[0].rotation.x = -1.0; } if (S.phase === 'work' && S.tool === 'mow' && d < 1.3) { WP.arms.forEach((a, i) => { a.rotation.x = -1.25 + Math.sin(t * 9 + i) * 0.04 * Math.min(1, spd); a.rotation.z = (i ? 1 : -1) * 0.12; }); WP.body.rotation.x = 0.12; } }
    G.canopy.visible = !(S.phase === 'work' && S.tool === 'rake') && !(S.phase === 'walk' && G.canopy.userData.hide); { const close = S.phase === 'work' && !!S.tool; if (S.phase !== 'walk') G.lamps.forEach(l => l.visible = !(close || S.phase === 'react' || S.phase === 'brief')); if (worker.userData.on !== false) worker.visible = true && (S.phase !== 'intro' && S.phase !== 'walk'); }
    // camera
    if (S.phase === 'walk') walkStep(dt);
    else { if (walker.visible) kit.animFox(walker, dt, 0); const sh = shot(); const k = Math.min(1, dt * (S.phase === 'work' ? 3.2 : 2.2)); camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); camera.lookAt(CAM.look); }
    { const c = camera.position; G.front.s.visible = c.z < 8.6; G.front.e.visible = c.x < 10.6; G.front.w.visible = c.x > -10.6; }
    kit.animFox(ningal, dt, 0); kit.animFox(shesh, dt, 0); const greet = S.phase === 'intro' || S.phase === 'done'; if (greet) { const BP = (S.phase === 'done' ? worker : walker).userData.P; if (BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); ningal.userData.talking = S.sayT > 0; } else ningal.userData.talking = false;
    shesh.userData.talking = WK.sheshT > 0; WK.sheshT = (WK.sheshT || 0) - dt;
    // auto-follow: idle on a finished task → next task
    if (!DM.on && S.phase === 'work' && S.tool && info(S.tool).done && !S.ptr && performance.now() - (S.userToolT || 0) > 3000 && performance.now() - (S.lastInput || 0) > 1200) { const nx = nextTask(); if (nx) S.tool = nx; }
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt); if (vis && S.tool === 'trim') RINGS.arrow.visible = false; }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  function hud() { const J = S.job, Z = WZ(), plantOpen = !!(J && S.phase === 'work' && S.tool === 'plant' && plantSpots.some(p => p.st === 'empty' || p.st === 'hole'));
    return { phase: S.phase, day: S.day, orderN: S.orderN, perDay: UR_GROUNDS.perDay, earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J && CL ? { who: CL.name, why: J.why, seed: J.seed, seedName: SEEDS[J.seed].name, seedCol: SEEDS[J.seed].col, tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt }; }) } : null,
      tool: S.tool, seed: S.seed, seedPick: plantOpen, allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500,
      press: S.hold ? { v: S.hold.u.lvl / 1.1, z0: Z[0] / 1.1, z1: Z[1] / 1.1, zone: S.hold.u.lvl < Z[0] ? 'TOO DRY' : S.hold.u.lvl <= Z[1] ? 'JUST RIGHT' : S.hold.u.lvl < 1 ? 'SOGGY' : 'FLOODED' } : null,
      pull: S.pull ? { v: S.pull.w.lift, fast: Math.min(1, S.pull.v / SNAP()) } : null,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('urGroundsUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null,
      mole: moleOn() ? mole.st : null, boops: S.boops || 0, music: MUS.on, best: save.stat(SAVE.best, 0), eodStars: save.stat(SAVE.stars, 0),
      walk: S.phase === 'walk' ? { prompt: WK.prompt, quest: WK.near === 'ningal' ? 'TALK TO NINGAL TO START A SHIFT' : (mole.st === 'tease' || mole.st === 'up') ? 'A MOLE! RUN OVER AND KICK (1) TO BOOP IT' : 'UR GROUNDS · NINGAL IS AT THE GREEN SHED · KICK THE BALL INTO THE GOAL (1)' + (WK.goals ? ' · GOALS ' + WK.goals : '') } : null }; }
  const onVis = () => { const h = document.hidden; PAUSE = h; try { if (audio.ctx) h ? audio.ctx.suspend() : audio.ctx.resume(); } catch (e) {} if (!h) clock.getDelta(); }; document.addEventListener('visibilitychange', onVis);
  frame();
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    toggleMusic, setTool, setSeed, handBack, startDay, demoStart, demoStop, buyUpgrade, toIntro, goWalk, hud, setPaused(v) { PAUSE = !!v; },
    // ENGINE CONTRACT for Game HUD (walk mode)
    start() {}, talk() { if (S.phase !== 'walk') return; if (WK.near === 'ningal') { toIntro(); say('NINGAL: "Grass does not cut itself, young fox. Ready for a shift?"', 4); } else if (WK.near === 'shesh') { say(SHESH[WK.sheshI++ % SHESH.length], 4); WK.sheshT = 3; sfx.ui(1); } else if (WK.near && WK.near.lines) { const d = WK.near; say(d.lines[d.li++ % d.lines.length], 4); d.talkT = 3.2; sfx.ui(1); } },
    choose() {}, closeDialog() {}, nextLine() {}, clearToast() {}, melee() { if (S.phase === 'walk') kickBall(); }, range() { if (S.phase === 'walk') whistle(); }, jump() { if (S.phase === 'walk' && WK.y <= 0.01) { WK.vy = 5.2; walker.userData.hop = 1; sfx.hop(); } }, meleeUp() {},
    useItem() { flash('NO ITEMS ON THE QUAD', '#ffffff', 1.2); }, closeWheel() {}, skipTime() {}, setHudPad() {}, setStick(x, y) { WK.stick.x = x; WK.stick.y = y; }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; },
    lookBy(dx, dy) { WK.yaw += dx * 0.006; WK.pitch = clamp(WK.pitch + dy * 0.004, 0.12, 1.15); }, zoomBy(k) { WK.dist = clamp(WK.dist * k, 3.5, 14); }, getCam() { return { dist: WK.dist, pitch: WK.pitch }; }, setCam(c) { if (c && c.dist) WK.dist = c.dist; if (c && c.pitch) WK.pitch = c.pitch; },
    mapData() { const p = walker.position; return { p: [p.x, p.z, walker.rotation.y], b: [['COLLEGE DOOR', 0, -9.6], ['FOUNTAIN', 0, 0], ['SHED', 11.4, 7.6], ["DEAN'S GARDEN", -6.2, 4.6], ['FIG TREE', Q.tree.x, Q.tree.z], ['HEDGE', -6, -7.4]], f: [[ningal.position.x, ningal.position.z], [shesh.position.x, shesh.position.z]], e: [], q: [ningal.position.x, ningal.position.z, 'NINGAL'] }; },
    setMinimap() {}, toggleSound() { audio.setMuted && audio.setMuted(!audio.muted); }, cycleWeather() {},
    // test hooks
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => S, _mole: () => mole, _music: () => ({ on: MUS.on, step: MUS.step, bus: !!MUS.bus }), _info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries }), _engine: () => ({ on: ENG.on, vol: ENG.nodes ? ENG.nodes.out.gain.value : 0, f: ENG.nodes ? ENG.nodes.o1.frequency.value : 0, cut: ENG.nodes ? ENG.nodes.cut.gain.value : 0 }), _scr: scr, _wp: wp, _parts: () => ({ cells, leaves, sprigs, weeds, plantSpots, urns, mower, TOP, topiary, walker, worker, ball: BALL, sprink }),
    _auto() { return { mowAll() { cells.forEach((c, k) => { if (!c.sp) { c.cut = true; c.h = 0.06; setTuft(k); paintCell(c, 'x'); } }); tufts.instanceMatrix.needsUpdate = true; checkDone(); }, rakeAll() { leaves.forEach(l => { l.in = true; l.x = Q.tarp.x; l.z = Q.tarp.z; }); bagLeaves(); }, trimAll() { sprigs.forEach(s => { s.cut = true; s.fall = 0.001; }); shapeTopiary(1); }, weedAll() { weeds.forEach(w => w.st === 'in' && popWeed(w)); }, plantAll() { S.seed = S.job.seed; plantSpots.forEach(p => { if (p.st === 'empty' || p.st === 'hole') { p.st = 'hole'; plantAt(p); } }); }, waterAll() { urns.forEach(u => { if (u.st === 'dry') { u.lvl = 0.6; S.hold = { u }; releaseWater(); } }); } }; },
    destroy() { try { if (ENG.nodes) { ENG.nodes.o1.stop(); ENG.nodes.o2.stop(); ENG.nodes.lfo.stop(); } } catch (e) {} cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis); sfx.waterOff(null); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
