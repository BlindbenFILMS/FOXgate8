// 8 GATES — EARTH · BREAKFAST ALL DAY DINER: THE MORNING SHIFT [earthMojave · diner]
// Sunny's diner out on the Mojave highway (2D: surface_earth / earthMojave, door "Breakfast All Day Diner", Sunny's "I'm on it boss!" runs the breakfast game).
// Cream tile, nine strip lights, a flat-top grill, chrome stools, red booths, the desert night in the windows and the gas pumps across the road.
// TWO MODES in one interior:
//   WALK  — Ben walks in and around the diner with the standard Game HUD (joystick, TALK, buttons). Talk to Sunny, Dottie, June and the regulars;
//           Sunny's "I'm on it boss!" (or the apron on the hook) starts a shift.
//   SHIFT — 3 minutes on the flat-top, camera over Ben's shoulder. One gesture per job, built for thumbs:
//           PANCAKES  hold on a dashed ring to pour (match the ring), FLICK UP to flip when it bubbles all over, tap to plate when golden
//           EGGS      tap the griddle to crack · leave it = SUNNY SIDE UP · flick up = flip (OVER EASY / MEDIUM / HARD) · stir in circles = SCRAMBLED
//           BACON     drag along a dashed lane to lay a strip, tap when crisp
//           HASH      scribble inside the ring to spread the shreds, flick up to flip, lift at the shade on the ticket
//           COFFEE    hold the pot to pour to the line, hold the creamer, tap the sugar bowl
//           PASS      every seat has a plate on the pass. When it is complete the bell rings: FLICK THE PLATE down the counter to the customer.
//           PAY       give the right change at the register (shared kit). A cold plate is a plate that comes back (heat timer per plate).
// Loop: a day of tickets → wage + prices + tips → employee of the day → BREAKFAST ALL DAY uniform → upgrades → harder next day (new dishes unlock).
// MERGE: buildBreakfastDiner(ctx) builds the interior at ctx.origin from a Meru-style ctx ({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin }),
// so an Earth map can place it far away (quick fade) or inside the diner building. createBreakfastShift({ container, onState }) runs it stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST, castKit } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { dinerAudio } from './diner-audio.js';

export const DINER = { name: 'BREAKFAST ALL DAY', world: 'Earth', zone: 'earthMojave', room: 'diner', shift: 180 };
// the room's footprint for a world map: 14 m wide (x), 11 m deep (z), 4.2 m high, origin at the floor centre; the street door is on the +z wall at x 4.4
export const DINER_ROOM = { w: 14, d: 11, h: 4.2, door: { x: 4.4, z: 5.5, face: Math.PI }, inside: { x: 4.4, z: 4.8, face: Math.PI } };
const SAVE = { day: 'earth.diner.day', best: 'earth.diner.best', stars: 'earth.diner.stars', upg: 'earth.diner.upg.' }, UNIFORM = 'dinerUniform';

// ---------------- the menu (prices in gold) ----------------
export const DISH = { cakes: { name: 'PANCAKES', day: 1 }, eggs: { name: 'EGGS', day: 2 }, bacon: { name: 'BACON', day: 3 }, hash: { name: 'HASH BROWNS', day: 4 }, coffee: { name: 'COFFEE', day: 1 } };
export const PRICE = { short: 4, tall: 5, eggs: 3, bacon: 3, hash: 3, coffee: 1 };
export const EGG = { sunny: { name: 'SUNNY SIDE UP', flip: false, dn: 'runny', day: 2 }, easy: { name: 'OVER EASY', flip: true, dn: 'runny', day: 2 }, medium: { name: 'OVER MEDIUM', flip: true, dn: 'medium', day: 4 }, hard: { name: 'OVER HARD', flip: true, dn: 'hard', day: 5 },
  scrSoft: { name: 'SCRAMBLED SOFT', scr: true, dn: 'runny', day: 3 }, scrMed: { name: 'SCRAMBLED', scr: true, dn: 'medium', day: 3 }, scrDry: { name: 'SCRAMBLED DRY', scr: true, dn: 'hard', day: 5 } };
export const SHADE = { golden: { name: 'GOLDEN', z: [0.35, 0.58] }, crisp: { name: 'CRISP', z: [0.58, 0.8] }, well: { name: 'WELL DONE', z: [0.8, 1.02] } };
export const CREAM = { black: { name: 'BLACK', v: 0 }, splash: { name: 'SPLASH OF CREAM', short: 'SPLASH', v: 0.35 }, extra: { name: 'EXTRA CREAM', short: 'EXTRA', v: 0.72 } };
export const UPGRADES = [
  { id: 'ladle', name: 'BIG LADLE', cost: 30, line: 'Batter pours 40% faster.' },
  { id: 'pot', name: 'SECOND POT', cost: 35, line: 'Coffee pours twice as fast.' },
  { id: 'lamps', name: 'HEAT LAMPS', cost: 40, line: 'Plates stay hot twice as long.' },
  { id: 'guard', name: 'SPLATTER GUARD', cost: 45, line: 'Food takes twice as long to burn.' },
  { id: 'jukebox', name: 'FIX THE JUKEBOX', cost: 60, line: 'Regulars wait 20% longer.' }];
// doneness bands (0..1.2 cook) — egg yolks, bacon, pancake sides
const YOLK = { runny: [0.3, 0.55], medium: [0.55, 0.8], hard: [0.8, 1.05] }, YOLK_NAME = { raw: 'RAW', runny: 'RUNNY', medium: 'MEDIUM', hard: 'HARD', burnt: 'BURNT' };
const yolkOf = d => d < 0.3 ? 'raw' : d < 0.55 ? 'runny' : d < 0.8 ? 'medium' : d < 1.12 ? 'hard' : 'burnt';
const FLIP = [0.5, 0.78], CAKE_B = [0.45, 0.8], BACON = [0.55, 0.92], CAKE_R = 0.15;
// regulars who come in for the counter during a shift (names + lines from surface_earth, earthMojave)
const CUSTOMERS = [
  { name: 'LOU-ANN', role: 'Twelve hours on the ward', fur: '#b8642a', torso: ['#6b5a3c', '#453a26', '#2a2418'], outfit: 'coat', fem: true, order: 'Twelve hours. Do not talk to me until the hash browns come.' },
  { name: 'CHESTER', role: 'Hung the sign in 1951', fur: '#a8a29a', torso: ['#c9c2b4', '#95907f', '#c9a227'], outfit: 'coat', order: 'I hung that sign outside. Nineteen fifty-one. It said DINER.' },
  { name: 'DEL', role: 'Works the pumps', fur: '#d0742c', torso: ['#3d6b8a', '#2a4a60', '#1a2a38'], outfit: 'vest', order: 'I come over here on my break and then I go back across the road.' },
  { name: 'HOLLIS DEANE', role: 'Highway pumps', fur: '#c9823a', torso: ['#8a3a2a', '#5f2419', '#2a1410'], outfit: 'vest', order: 'Quiet out here. It is not quiet, it is empty.' },
  { name: 'WADE', role: 'Long-haul trucker', fur: '#e07a2a', torso: ['#2f5d8a', '#1d3a5a', '#e6b45a'], outfit: 'coat', order: 'Four hundred miles of nothing. I prefer the nothing.' },
  { name: 'DR ALMA REYES', role: 'Studies rocks', fur: '#9a5a2a', torso: ['#e8e4d8', '#b8b0a0', '#5a5246'], outfit: 'coat', fem: true, order: 'Geology. It is very interesting geology.' },
  { name: 'ROXY CALDERON', role: 'Survey pilot', fur: '#e08a3a', torso: ['#5a6b3a', '#3a4526', '#c42d3c'], outfit: 'vest', fem: true, order: 'I have been through a gate. Technically I am fine with that.' },
  { name: 'HECTOR', role: 'Drives nights', fur: '#c2692a', torso: ['#e6b45a', '#a8792e', '#201e1d'], outfit: 'vest', order: 'Best hour of my week. I would do it again tomorrow.' }];
const LINES = { happy: ['Now THAT is a breakfast.', 'Hot plate. Sunny trained you right.', 'I am telling everybody at the pumps.', 'Exactly how I like it.'], meh: ['It is fine. It is a plate.', 'Close enough, hon.'], angry: ['I am going across the road.', 'Twenty minutes, she said. Twice.'] };

// ---------------- the diner interior (stand-alone page + any Earth map) ----------------
export function buildBreakfastDiner(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 14, D = 11, H = 4.2, KZ = -3.2, TOP = 0.95, GT = 1.0;
  const K = { root, W, D, H, z: KZ, top: TOP, gt: GT, cut: [], front: [], colliders: [], seats: [], booth: [] };
  const chrome = toon('#d7dde3'), ink = toon('#201e1d'), red = toon('#c42d3c'), mint = toon('#8fd6c4'), creamT = toon('#f3ead2'), steel = toon('#2e2d33'), vinyl = toon('#b8243a'), formica = toon('#f1e9d8'), pinkN = '#ff4fa3';
  const tm = (map, extra) => new T3.MeshToonMaterial({ map, gradientMap: ctx.grad, ...extra });
  const cutM = (...ms) => { K.cut.push(...ms); return ms[0]; };
  // floor: black + cream checker
  const floorT = CTX(256, 256, c => { for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) { c.fillStyle = (x + y) % 2 ? '#f3ead2' : '#1f1d24'; c.fillRect(x * 32, y * 32, 32, 32); } }); floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 1.6, D / 1.6);
  { const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), tm(floorT)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl); } { const ot = floorT.clone(); ot.needsUpdate = true; ot.repeat.set(40 / 1.6, 40 / 1.6); const of = new T3.Mesh(new T3.PlaneGeometry(40, 40), tm(ot)); of.rotation.x = -Math.PI / 2; of.position.y = -0.01; root.add(of); }
  // walls: cream tile above a mint wainscot with a pink rule
  const wallT = CTX(256, 256, c => { c.fillStyle = '#f3ead2'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#d9cdb2'; c.lineWidth = 2; for (let i = 0; i <= 256; i += 21) { c.beginPath(); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 190); c.stroke(); } c.fillStyle = '#8fd6c4'; c.fillRect(0, 192, 256, 64); c.fillStyle = '#ff4fa3'; c.fillRect(0, 186, 256, 7); c.fillStyle = '#6fb8a6'; for (let i = 0; i < 256; i += 16) c.fillRect(i, 196, 2, 60); });
  wallT.wrapS = T3.RepeatWrapping; const wallM = tm(wallT);
  const wall = (x, z, w, ry) => { const t = wallT.clone(); t.needsUpdate = true; t.repeat.set(w / 2.2, 1); const m = new T3.Mesh(new T3.PlaneGeometry(w, H), tm(t)); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); return m; };
  cutM(wall(0, -D / 2, W, 0)); wall(-W / 2, 0, D, Math.PI / 2); wall(W / 2, 0, D, -Math.PI / 2);
  // front wall with the big windows + the door (x 3.8..5.0)
  { const fc = root.children.length, Z = D / 2;
    M(new T3.BoxGeometry(W, 0.9, 0.2), mint, 0, 0.45, Z, root, 0.01); M(new T3.BoxGeometry(W, H - 2.7, 0.2), creamT, 0, 2.7 + (H - 2.7) / 2, Z, root, 0.01); M(new T3.BoxGeometry(W, 0.06, 0.24), toon('#ff4fa3'), 0, 0.92, Z, root, 0);
    for (const x of [-6.9, -4.4, -1.9, 0.6, 3.1, 3.75, 5.05, 6.9]) M(new T3.BoxGeometry(0.14, 1.8, 0.22), chrome, x, 1.8, Z, root, 0.01);
    M(new T3.BoxGeometry(1.3, 0.12, 0.24), chrome, 4.4, 2.64, Z, root, 0.01); M(new T3.BoxGeometry(1.7, 1.8, 0.2), creamT, 6.0, 1.8, Z, root, 0.01);
    const glassM = new T3.MeshBasicMaterial({ color: 0x9fb8e8, transparent: true, opacity: 0.12, depthWrite: false });
    const g1 = new T3.Mesh(new T3.PlaneGeometry(10, 1.8), glassM); g1.position.set(-1.9, 1.8, Z - 0.02); root.add(g1); const dg = new T3.Mesh(new T3.PlaneGeometry(1.2, 2.55), glassM); dg.position.set(4.4, 1.3, Z - 0.02); root.add(dg);
    // NOW HIRING card in the window by the door + OPEN sign
    const hire = CTX(256, 160, c => { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, 256, 160); c.strokeStyle = '#c42d3c'; c.lineWidth = 8; c.strokeRect(8, 8, 240, 144); c.fillStyle = '#c42d3c'; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.fillText('NOW', 128, 70); c.fillText('HIRING', 128, 126); });
    const hc = new T3.Mesh(new T3.PlaneGeometry(0.62, 0.39), new T3.MeshBasicMaterial({ map: hire })); hc.position.set(2.6, 1.45, Z - 0.05); hc.rotation.y = Math.PI; root.add(hc);
    const open = CTX(256, 96, c => { c.fillStyle = '#120a14'; c.fillRect(0, 0, 256, 96); c.shadowColor = '#ff3a6a'; c.shadowBlur = 18; c.fillStyle = '#ff7aa8'; c.font = '900 64px Archivo, Arial'; c.textAlign = 'center'; c.fillText('OPEN', 128, 72); });
    const os = new T3.Mesh(new T3.PlaneGeometry(0.6, 0.22), new T3.MeshBasicMaterial({ map: open })); os.position.set(4.4, 2.2, Z - 0.05); os.rotation.y = Math.PI; root.add(os);
    K.front.push(...root.children.slice(fc)); }
  // outside: the Mojave at night — sky, mesas, the highway and the gas pumps across the road
  { const sky = CTX(1024, 512, c => { const g = c.createLinearGradient(0, 0, 0, 512); g.addColorStop(0, '#0b0a24'); g.addColorStop(0.55, '#2a1b4a'); g.addColorStop(0.72, '#7a3a5a'); g.addColorStop(0.74, '#2a1a22'); g.addColorStop(1, '#14100f'); c.fillStyle = g; c.fillRect(0, 0, 1024, 512);
      c.fillStyle = '#fff'; for (let i = 0; i < 220; i++) { c.globalAlpha = Math.random() * 0.8 + 0.2; c.fillRect(Math.random() * 1024, Math.random() * 330, Math.random() < 0.1 ? 2 : 1, Math.random() < 0.1 ? 2 : 1); } c.globalAlpha = 1;
      c.fillStyle = '#1a1226'; c.beginPath(); c.moveTo(0, 378); [[60, 352], [120, 356], [150, 330], [260, 328], [290, 360], [420, 366], [470, 340], [600, 338], [640, 370], [800, 372], [840, 344], [960, 346], [1024, 372]].forEach(([x, y]) => c.lineTo(x, y)); c.lineTo(1024, 380); c.lineTo(0, 380); c.fill();
      c.fillStyle = '#2b2a30'; c.fillRect(0, 410, 1024, 40); c.fillStyle = '#e6b45a'; for (let x = 0; x < 1024; x += 60) c.fillRect(x, 428, 30, 4);
      // Hollis's gas station across the road
      c.fillStyle = '#d7dde3'; c.fillRect(560, 300, 300, 18); c.fillStyle = '#ffffff'; c.shadowColor = '#fff7d0'; c.shadowBlur = 24; for (let x = 580; x < 860; x += 46) c.fillRect(x, 318, 30, 4); c.shadowBlur = 0;
      c.fillStyle = '#3a3836'; c.fillRect(600, 318, 10, 90); c.fillRect(810, 318, 10, 90); c.fillStyle = '#c42d3c'; c.fillRect(650, 360, 24, 48); c.fillRect(730, 360, 24, 48);
      c.shadowColor = '#ff4f4f'; c.shadowBlur = 20; c.fillStyle = '#ff5a5a'; c.font = '900 34px Archivo, Arial'; c.fillText('GAS', 900, 300); c.shadowBlur = 0; c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(170, 120, 26, 0, 7); c.fill(); });
    const bd = new T3.Mesh(new T3.PlaneGeometry(44, 16), new T3.MeshBasicMaterial({ map: sky })); bd.position.set(0, 4, D / 2 + 6); bd.rotation.y = Math.PI; root.add(bd); K.sky = bd; }
  // ceiling + the NINE STRIP LIGHTS
  cutM(M(new T3.BoxGeometry(W, 0.2, D), toon('#ece3cc'), 0, H + 0.1, 0, root, 0));
  K.strips = []; for (const x of [-4, 0, 4]) for (const z of [-3.2, 0.2, 3.4]) { const s = M(new T3.BoxGeometry(1.7, 0.06, 0.26), new T3.MeshBasicMaterial({ color: 0xfffbe6 }), x, H - 0.04, z, root, 0.012); K.strips.push(s); cutM(s); }
  // ---------- KITCHEN ----------
  // back counter, shelves, menu boards, the neon (all hidden while working — the camera stands at the back wall)
  { const bc = root.children.length; M(new T3.BoxGeometry(9.7, 0.92, 0.7), creamT, -1.85, 0.46, -5.15, root, 0.02); M(new T3.BoxGeometry(9.8, 0.05, 0.76), chrome, -1.85, 0.945, -5.15, root, 0.01);
    M(new T3.BoxGeometry(0.9, 2.1, 0.8), chrome, -6.2, 1.05, -5.0, root, 0.02); M(new T3.BoxGeometry(0.04, 1.6, 0.06), ink, -5.82, 1.2, -4.58, root, 0);
    for (let i = 0; i < 2; i++) M(new T3.BoxGeometry(6.0, 0.05, 0.3), chrome, -2.2, 2.0 + i * 0.5, -5.33, root, 0.01);
    for (let i = 0; i < 9; i++) M(new T3.CylinderGeometry(0.11, 0.09, 0.03, 16), toon('#fbfbf7'), -4.6 + i * 0.12, 2.05 + (i % 3) * 0.035, -5.33, root, 0.006);
    for (let i = 0; i < 6; i++) { M(new T3.CylinderGeometry(0.045, 0.04, 0.1, 10), toon(i % 2 ? '#c42d3c' : '#fbfbf7'), -2.8 + i * 0.16, 2.08, -5.33, root, 0.005); }
    M(new T3.BoxGeometry(0.42, 0.26, 0.3), chrome, 0.6, 1.08, -5.15, root, 0.01); M(new T3.BoxGeometry(0.3, 0.02, 0.06), ink, 0.6, 1.22, -5.1, root, 0);
    M(new T3.CylinderGeometry(0.16, 0.16, 0.5, 14), chrome, -0.6, 1.2, -5.15, root, 0.012);
    K.cut.push(...root.children.slice(bc)); }
  const menuT = CTX(1024, 384, c => { c.fillStyle = '#1b1a20'; c.fillRect(0, 0, 1024, 384); c.fillStyle = '#ffd23a'; c.font = '900 56px Archivo, Arial'; c.fillText('SERVED ALL DAY', 40, 70); c.fillStyle = '#f2f1e8'; c.font = '700 38px Archivo, Arial';
    [['SHORT STACK', PRICE.short], ['TALL STACK', PRICE.tall], ['TWO EGGS', PRICE.eggs], ['BACON', PRICE.bacon], ['HASH BROWNS', PRICE.hash], ['COFFEE', PRICE.coffee]].forEach(([n, p], i) => { const x = 40 + (i % 2) * 500, y = 150 + Math.floor(i / 2) * 70; c.fillText(n, x, y); c.fillText(p + 'g', x + 380, y); }); c.fillStyle = '#ff9ac8'; c.fillText('EGGS ANY STYLE · BOTTOMLESS COFFEE', 40, 360); });
  cutM(M(new T3.BoxGeometry(4.3, 1.5, 0.06), toon('#8a5a32'), -2.0, 3.3, -D / 2 + 0.04, root, 0.01)); { const mb = new T3.Mesh(new T3.PlaneGeometry(4.1, 1.38), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(-2.0, 3.3, -D / 2 + 0.08); root.add(mb); cutM(mb); }
  const neonT = CTX(1024, 160, c => { c.clearRect(0, 0, 1024, 160); c.font = 'italic 900 96px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = pinkN; c.shadowBlur = 30; c.strokeStyle = pinkN; c.lineWidth = 10; c.strokeText('BREAKFAST ALL DAY', 512, 84); c.fillStyle = '#fff2f8'; c.fillText('BREAKFAST ALL DAY', 512, 84); });
  { const n = new T3.Mesh(new T3.PlaneGeometry(4.2, 0.66), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); n.position.set(3.0, 3.35, -D / 2 + 0.1); root.add(n); cutM(n); K.neon = n;
    const n2 = n.clone(); n2.position.set(-W / 2 + 0.1, 3.2, 0.5); n2.rotation.y = Math.PI / 2; root.add(n2); K.neon2 = n2; }
  // the apron hook ("Apron is on the hook, the hook is behind you")
  K.hook = { x: 5.4, z: -5.0 }; { const hc = root.children.length; M(new T3.BoxGeometry(0.5, 0.06, 0.1), toon('#8a5a32'), 5.4, 1.75, -5.42, root, 0.006); M(new T3.CylinderGeometry(0.015, 0.015, 0.12, 6), chrome, 5.4, 1.74, -5.36, root, 0).rotation.x = Math.PI / 2;
    const ap = M(new T3.BoxGeometry(0.42, 0.62, 0.03), toon('#fbfbf7'), 5.4, 1.4, -5.37, root, 0.008); M(new T3.BoxGeometry(0.42, 0.05, 0.035), red, 5.4, 1.2, -5.36, root, 0); M(new T3.BoxGeometry(0.2, 0.12, 0.034), toon('#ffd23a'), 5.4, 1.48, -5.36, root, 0); K.apron = ap; K.cut.push(...root.children.slice(hc)); }
  // GRIDDLE COUNTER (the flat-top runs across the middle; register left, coffee right)
  M(new T3.BoxGeometry(7.9, TOP, 1.0), creamT, 0, TOP / 2, KZ, root, 0.03); M(new T3.BoxGeometry(8.0, 0.05, 1.1), chrome, 0, TOP - 0.02, KZ, root, 0.012); M(new T3.BoxGeometry(7.92, 0.1, 0.03), toon('#ff4fa3'), 0, 0.6, KZ + 0.51, root, 0);
  M(new T3.BoxGeometry(4.9, 0.05, 0.86), steel, 0, TOP + 0.025, KZ, root, 0.01); M(new T3.BoxGeometry(4.95, 0.12, 0.04), chrome, 0, TOP + 0.08, KZ + 0.45, root, 0.006); M(new T3.BoxGeometry(4.95, 0.03, 0.06), toon('#55534f'), 0, TOP + 0.03, KZ - 0.46, root, 0);
  for (const x of [-1.2, 0, 1.2]) M(new T3.BoxGeometry(0.012, 0.003, 0.84), toon('#4a4850'), x, GT + 0.002, KZ, root, 0);
  K.zones = { cakes: { x: 1.8, z: KZ }, eggs: { x: 0.6, z: KZ }, bacon: { x: -0.6, z: KZ }, hash: { x: -1.8, z: KZ } }; K.zoneW = 1.16; K.zoneD = 0.78;
  // dashed guides: pour rings, egg dots, bacon lanes, the hash ring
  const dashT = (w, h, draw) => CTX(w, h, c => { c.clearRect(0, 0, w, h); c.strokeStyle = 'rgba(255,240,200,0.75)'; c.lineWidth = 6; c.setLineDash([14, 10]); draw(c); });
  const ringT = dashT(128, 128, c => { c.beginPath(); c.arc(64, 64, 58, 0, 7); c.stroke(); }), laneT = dashT(256, 32, c => { c.beginPath(); c.moveTo(4, 16); c.lineTo(252, 16); c.stroke(); c.setLineDash([]); c.fillStyle = 'rgba(255,240,200,0.8)'; c.beginPath(); c.moveTo(4, 6); c.lineTo(20, 16); c.lineTo(4, 26); c.fill(); });
  const decal = (tex, w, h, x, z) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(x, GT + 0.003, z); root.add(m); return m; };
  const cz = K.zones.cakes; K.cakeSpots = [[-0.27, -0.19], [0.27, -0.19], [-0.27, 0.2], [0.27, 0.2]].map(([dx, dz]) => ({ x: cz.x + dx, z: KZ + dz, ring: decal(ringT, CAKE_R * 2.3, CAKE_R * 2.3, cz.x + dx, KZ + dz) }));
  const ez = K.zones.eggs; K.eggSpots = [[-0.28, -0.2], [0.24, -0.2], [-0.28, 0.2], [0.24, 0.2]].map(([dx, dz]) => ({ x: ez.x + dx, z: KZ + dz, ring: decal(ringT, 0.2, 0.2, ez.x + dx, KZ + dz) }));
  const bz = K.zones.bacon; K.lanes = [-0.27, -0.09, 0.09, 0.27].map(dz => ({ x0: bz.x + 0.36, x1: bz.x - 0.36, z: KZ + dz, dec: decal(laneT, 0.74, 0.07, bz.x, KZ + dz) }));
  const hz = K.zones.hash; K.hashRing = { x: hz.x, z: KZ, r: 0.25, dec: decal(ringT, 0.6, 0.6, hz.x, KZ) };
  // the batter pitcher, egg crate, bacon pack, potato tub along the cook's edge
  K.pitcher = new T3.Group(); { const g = K.pitcher; M(new T3.CylinderGeometry(0.075, 0.09, 0.22, 16), toon('#e8f0f4', { transparent: true, opacity: 0.85 }), 0, 0.11, 0, g, 0.008); M(new T3.CylinderGeometry(0.07, 0.085, 0.16, 16), toon('#f6e7bf'), 0, 0.085, 0, g, 0); M(new T3.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), ink, -0.09, 0.12, 0, g, 0).rotation.z = Math.PI / 2; M(new T3.ConeGeometry(0.03, 0.05, 8), toon('#e8f0f4'), 0.08, 0.2, 0, g, 0).rotation.z = -1.2; g.position.set(cz.x + 0.5, GT, KZ - 0.34); root.add(g); K.pitcherHome = g.position.clone(); }
  { M(new T3.BoxGeometry(0.3, 0.06, 0.2), toon('#c9a77a'), ez.x - 0.4, GT + 0.03, KZ - 0.34 - 0.0, root, 0.006); for (let i = 0; i < 6; i++) { const e = M(new T3.SphereGeometry(0.035, 10, 8), toon('#f4ead8'), ez.x - 0.49 + (i % 3) * 0.09, GT + 0.08, KZ - 0.39 + Math.floor(i / 3) * 0.09, root, 0.005); e.scale.y = 1.25; } }
  { M(new T3.BoxGeometry(0.26, 0.03, 0.16), toon('#fbfbf7'), bz.x + 0.45, GT + 0.015, KZ - 0.36, root, 0.006); for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.22, 0.008, 0.028), toon(i % 2 ? '#e88a8a' : '#d86a6a'), bz.x + 0.45, GT + 0.034 + i * 0.006, KZ - 0.41 + i * 0.03, root, 0); }
  { M(new T3.CylinderGeometry(0.11, 0.09, 0.12, 14), chrome, hz.x - 0.45, GT + 0.06, KZ - 0.32, root, 0.008); for (let i = 0; i < 14; i++) M(new T3.BoxGeometry(0.06, 0.008, 0.008), toon('#f2e2b0'), hz.x - 0.45 + rr(-0.06, 0.06), GT + 0.125, KZ - 0.32 + rr(-0.06, 0.06), root, 0).rotation.y = rr(0, 3); }
  // the PASS: a chrome shelf under the heat lamps, one plate per seat
  K.passZ = KZ + 0.62; K.passY = 1.24;
  M(new T3.BoxGeometry(5.6, 0.04, 0.4), chrome, 0, K.passY - 0.02, K.passZ, root, 0.01); for (const x of [-2.75, 2.75]) M(new T3.BoxGeometry(0.06, K.passY - TOP + 0.6, 0.06), chrome, x, (K.passY + TOP + 0.6) / 2, K.passZ, root, 0.006);
  { const lb = M(new T3.BoxGeometry(5.6, 0.1, 0.22), red, 0, K.passY + 0.62, K.passZ, root, 0.01); const glow = new T3.Mesh(new T3.PlaneGeometry(5.4, 0.16), new T3.MeshBasicMaterial({ color: 0xff8a3a })); glow.rotation.x = Math.PI / 2; glow.position.set(0, K.passY + 0.565, K.passZ); root.add(glow); K.lampBar = lb; }
  // CUSTOMER COUNTER + five stools (three working seats in the middle)
  K.counterZ = KZ + 1.32; K.counterY = 1.05;
  M(new T3.BoxGeometry(7.9, 1.0, 0.62), mint, 0, 0.5, K.counterZ, root, 0.03); M(new T3.BoxGeometry(8.0, 0.06, 0.72), formica, 0, K.counterY - 0.02, K.counterZ, root, 0.012); M(new T3.BoxGeometry(8.02, 0.04, 0.74), chrome, 0, K.counterY - 0.06, K.counterZ, root, 0); M(new T3.BoxGeometry(7.92, 0.12, 0.03), chrome, 0, 0.18, K.counterZ + 0.31, root, 0);
  M(new T3.BoxGeometry(7.9, 1.0, 0.36), creamT, 0, 0.5, KZ + 0.68, root, 0.01);
  K.stoolX = [-3.2, -1.6, 0, 1.6, 3.2]; K.stoolZ = KZ + 2.1;
  K.stoolX.forEach(x => { M(new T3.CylinderGeometry(0.05, 0.07, 0.66, 8), chrome, x, 0.33, K.stoolZ, root, 0); M(new T3.CylinderGeometry(0.2, 0.22, 0.03, 14), chrome, x, 0.02, K.stoolZ, root, 0); M(new T3.CylinderGeometry(0.23, 0.21, 0.1, 18), vinyl, x, 0.72, K.stoolZ, root, 0.012); });
  K.seats = [1.6, 0, -1.6].map((x, i) => ({ i, x, z: K.stoolZ, plate: { x, z: K.passZ, y: K.passY }, serve: { x, z: K.counterZ + 0.02, y: K.counterY } }));
  // pie case + napkins on the counter, ends
  { M(new T3.BoxGeometry(0.7, 0.04, 0.4), chrome, -3.3, K.counterY + 0.02, K.counterZ, root, 0.006); const dome = new T3.Mesh(new T3.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), new T3.MeshBasicMaterial({ color: 0xdff2ff, transparent: true, opacity: 0.25, depthWrite: false })); dome.position.set(-3.3, K.counterY + 0.04, K.counterZ); dome.scale.set(1.1, 0.8, 0.6); root.add(dome);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const w = M(new T3.CylinderGeometry(0.16, 0.16, 0.08, 3, 1, false, a, Math.PI / 3), toon(i % 2 ? '#e8a84c' : '#f2c46a'), -3.3, K.counterY + 0.09, K.counterZ, root, 0.004); w.scale.set(1, 1, 0.9); }
    M(new T3.BoxGeometry(0.14, 0.12, 0.1), chrome, 2.5, K.counterY + 0.06, K.counterZ, root, 0.005); M(new T3.CylinderGeometry(0.03, 0.03, 0.12, 8), toon('#c42d3c'), 2.7, K.counterY + 0.06, K.counterZ, root, 0.004); M(new T3.CylinderGeometry(0.03, 0.03, 0.1, 8), toon('#ffd23a'), 2.78, K.counterY + 0.05, K.counterZ, root, 0.004); }
  // the bell on the pass
  K.bell = { x: 2.4, z: K.passZ, y: K.passY }; { const b = new T3.Group(); M(new T3.CylinderGeometry(0.06, 0.07, 0.012, 14), ink, 0, 0.006, 0, b, 0); M(new T3.SphereGeometry(0.055, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e6b45a'), 0, 0.012, 0, b, 0.006); M(new T3.CylinderGeometry(0.008, 0.008, 0.03, 6), ink, 0, 0.075, 0, b, 0); b.position.set(K.bell.x, K.bell.y, K.bell.z); root.add(b); K.bellM = b; }
  // REGISTER (left end) + COFFEE STATION (right end)
  K.register = { x: 3.35, z: KZ - 0.05 }; M(new T3.BoxGeometry(0.46, 0.3, 0.36), toon('#3a3836'), K.register.x, TOP + 0.15, K.register.z + 0.3, root, 0.01); M(new T3.BoxGeometry(0.4, 0.06, 0.2), toon('#c9a24a'), K.register.x, TOP + 0.33, K.register.z + 0.36, root, 0.006);
  K.coffee = { pot: { x: -2.98, z: KZ + 0.02 }, mug: { x: -3.38, z: KZ + 0.04 }, cream: { x: -3.74, z: KZ + 0.06 }, sugar: { x: -3.6, z: KZ - 0.22 } };
  M(new T3.BoxGeometry(0.62, 0.62, 0.32), toon('#3a3836'), -3.3, TOP + 0.31, KZ + 0.38, root, 0.015); M(new T3.BoxGeometry(0.64, 0.08, 0.34), chrome, -3.3, TOP + 0.66, KZ + 0.38, root, 0.008); M(new T3.BoxGeometry(0.4, 0.12, 0.02), toon('#c42d3c'), -3.3, TOP + 0.45, KZ + 0.215, root, 0);
  M(new T3.CylinderGeometry(0.1, 0.1, 0.02, 16), toon('#55534f'), K.coffee.pot.x, TOP + 0.01, K.coffee.pot.z, root, 0.005); M(new T3.CylinderGeometry(0.09, 0.09, 0.006, 16), toon('#ec3013', { emissive: new T3.Color('#ec3013'), emissiveIntensity: 0.6 }), K.coffee.pot.x, TOP + 0.022, K.coffee.pot.z, root, 0);
  M(new T3.CylinderGeometry(0.075, 0.075, 0.012, 16), chrome, K.coffee.mug.x, TOP + 0.006, K.coffee.mug.z, root, 0);
  for (let i = 0; i < 4; i++) M(new T3.CylinderGeometry(0.055, 0.05, 0.11, 14), toon('#f4efe6'), -2.72, TOP + 0.055, KZ + 0.36, root, i ? 0 : 0.006).position.y = TOP + 0.055 + i * 0.105;
  // DINING ROOM: three window booths, the jukebox, a clock
  K.booths = [-5.2, -2.4, 0.4].map((bx, bi) => { const bc = root.children.length, zc = 4.3;
    M(new T3.BoxGeometry(0.8, 0.05, 1.3), formica, bx, 0.76, zc, root, 0.01); M(new T3.BoxGeometry(0.82, 0.03, 1.32), chrome, bx, 0.73, zc, root, 0); M(new T3.CylinderGeometry(0.06, 0.06, 0.72, 8), chrome, bx, 0.37, zc, root, 0);
    for (const s of [-1, 1]) { M(new T3.BoxGeometry(0.5, 0.45, 1.4), vinyl, bx + s * 0.75, 0.22, zc, root, 0.02); M(new T3.BoxGeometry(0.16, 0.85, 1.4), vinyl, bx + s * 1.02, 0.8, zc, root, 0.02); M(new T3.BoxGeometry(0.18, 0.06, 1.42), chrome, bx + s * 1.02, 1.24, zc, root, 0.006); }
    M(new T3.BoxGeometry(0.08, 0.12, 0.12), chrome, bx, 0.85, zc + 0.5, root, 0.004); K.colliders.push([bx - 1.12, bx + 1.12, zc - 0.75, D / 2]);
    return { bx, zc, seats: [[-0.78, -0.32, Math.PI / 2], [-0.78, 0.32, Math.PI / 2], [0.78, -0.32, -Math.PI / 2], [0.78, 0.32, -Math.PI / 2]].map(([dx, dz, f]) => ({ x: bx + dx, z: zc + dz, f })), parts: root.children.slice(bc) }; });
  K.juke = { x: 6.55, z: 1.4 }; { const j = new T3.Group(); j.position.set(K.juke.x, 0, K.juke.z); j.rotation.y = -Math.PI / 2; root.add(j); M(new T3.BoxGeometry(0.95, 1.3, 0.55), red, 0, 0.65, 0, j, 0.02);
    const arch = M(new T3.CylinderGeometry(0.475, 0.475, 0.55, 18, 1, false, -Math.PI / 2, Math.PI), toon('#ffd23a'), 0, 1.3, 0, j, 0.02); arch.rotation.x = Math.PI / 2; arch.rotation.z = Math.PI / 2;
    const jt = CTX(128, 128, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#ff4fa3' : '#5fe3ff'; c.fillRect(i * 16, 0, 16, 128); } c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 60, 128, 8); }); const jp = new T3.Mesh(new T3.PlaneGeometry(0.7, 0.6), new T3.MeshBasicMaterial({ map: jt })); jp.position.set(0, 0.85, 0.28); j.add(jp); K.jukePanel = jp; K.colliders.push([K.juke.x - 0.35, 7, K.juke.z - 0.55, K.juke.z + 0.55]); }
  { const ck = CTX(128, 128, c => { c.fillStyle = '#fbfbf7'; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.lineWidth = 8; c.strokeStyle = '#ff4fa3'; c.stroke(); c.fillStyle = '#201e1d'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.fillRect(64 + Math.cos(a) * 48 - 3, 64 + Math.sin(a) * 48 - 3, 6, 6); } c.lineWidth = 6; c.strokeStyle = '#201e1d'; c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 26); c.moveTo(64, 64); c.lineTo(94, 76); c.stroke(); });
    const cl = new T3.Mesh(new T3.CircleGeometry(0.34, 24), new T3.MeshBasicMaterial({ map: ck })); cl.position.set(-W / 2 + 0.03, 2.6, -2.2); cl.rotation.y = Math.PI / 2; root.add(cl); }
  // ---------- DRESSING (polish pass): fans, pendants, wall art, table settings, the untouched breakfasts ----------
  K.fans = []; for (const [x, z] of [[-3.6, 2.6], [2.2, 2.6]]) { const f = new T3.Group(); f.position.set(x, H - 0.45, z); root.add(f); M(new T3.CylinderGeometry(0.02, 0.02, 0.45, 6), ink, 0, 0.22, 0, f, 0); M(new T3.CylinderGeometry(0.12, 0.1, 0.12, 12), toon('#e6b45a'), 0, 0, 0, f, 0.008); const bl = new T3.Group(); f.add(bl); for (let i = 0; i < 4; i++) { const b = M(new T3.BoxGeometry(0.62, 0.012, 0.13), toon('#8a5a32'), 0.38, -0.04, 0, null, 0.006); const arm = new T3.Group(); arm.rotation.y = i * Math.PI / 2; arm.add(b); bl.add(arm); } K.fans.push(bl); K.cut.push(f); }
  K.pendants = []; for (const b of K.booths) { const p = new T3.Group(); p.position.set(b.bx, H, b.zc); root.add(p); M(new T3.CylinderGeometry(0.004, 0.004, 1.5, 4), toon('#55534f'), 0, -0.75, 0, p, 0); const sh = M(new T3.ConeGeometry(0.24, 0.24, 18, 1, true), toon('#ff4fa3'), 0, -1.6, 0, p, 0.008); sh.material = toon('#ff4fa3', { side: T3.DoubleSide }); const bulb = M(new T3.SphereGeometry(0.06, 10, 8), new T3.MeshBasicMaterial({ color: 0xfff2c8 }), 0, -1.7, 0, p, 0); K.pendants.push(bulb); b.parts.push(p); }
  // table settings on every booth: napkin box, ketchup + mustard, sugar caddy, two menus
  for (const b of K.booths) { const y = 0.79, bc = root.children.length; M(new T3.BoxGeometry(0.12, 0.14, 0.08), chrome, b.bx, y + 0.07, b.zc + 0.5, root, 0.005); M(new T3.BoxGeometry(0.1, 0.1, 0.002), toon('#fbfbf7'), b.bx, y + 0.1, b.zc + 0.459, root, 0);
    M(new T3.CylinderGeometry(0.025, 0.028, 0.14, 8), red, b.bx - 0.09, y + 0.07, b.zc + 0.5, root, 0.004); M(new T3.CylinderGeometry(0.025, 0.028, 0.14, 8), toon('#ffd23a'), b.bx + 0.09, y + 0.07, b.zc + 0.5, root, 0.004); M(new T3.CylinderGeometry(0.04, 0.04, 0.08, 10), new T3.MeshBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.5 }), b.bx, y + 0.04, b.zc + 0.36, root, 0);
    for (const s of [-1, 1]) { const mn = M(new T3.BoxGeometry(0.22, 0.012, 0.3), toon(s < 0 ? '#c42d3c' : '#2aa58f'), b.bx + s * 0.22, y + 0.006, b.zc - 0.2, root, 0.004); mn.rotation.y = s * 0.2; } b.parts.push(...root.children.slice(bc)); }
  // the booth by the window: four full breakfasts nobody will eat (The Man and The Other Man, "four of them, same booth")
  { const b = K.booths[2], bc = root.children.length; for (const [dx, dz] of [[-0.2, -0.32], [-0.2, 0.25], [0.2, -0.32], [0.2, 0.25]]) { const g = new T3.Group(); g.position.set(b.bx + dx, 0.79, b.zc + dz); root.add(g); M(new T3.CylinderGeometry(0.15, 0.12, 0.02, 20), toon('#fbfbf7'), 0, 0.01, 0, g, 0.005); for (let i = 0; i < 2; i++) M(new T3.CylinderGeometry(0.07, 0.07, 0.018, 16), toon('#d99a44'), -0.03, 0.03 + i * 0.018, 0.02, g, 0.004); M(new T3.CylinderGeometry(0.035, 0.035, 0.012, 12), toon('#ffb21a'), 0.06, 0.026, -0.05, g, 0); M(new T3.BoxGeometry(0.12, 0.008, 0.025), toon('#a8583a'), 0.05, 0.024, 0.06, g, 0);
      M(new T3.CylinderGeometry(0.04, 0.036, 0.09, 12), toon('#f4efe6'), dx < 0 ? -0.2 : 0.2, 0.045, 0, g, 0.004); } b.parts.push(...root.children.slice(bc)); }
  // wall art: framed photos + posters on the left wall, the PIE OF THE DAY board, a cactus and a gumball machine by the door
  { const art = (w, h, draw, x, y, z, ry) => { const t = CTX(Math.round(w * 200), Math.round(h * 200), draw); const fr = M(new T3.BoxGeometry(w + 0.08, h + 0.08, 0.04), ink, x, y, z, root, 0.005); fr.rotation.y = ry; const m = new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: t })); m.position.set(x + Math.sin(ry) * 0.025, y, z + Math.cos(ry) * 0.025); m.rotation.y = ry; root.add(m); return m; };
    const lx = -W / 2 + 0.03, ry = Math.PI / 2;
    art(1.0, 0.7, (c, ) => { const g = c.createLinearGradient(0, 0, 0, 140); g.addColorStop(0, '#f4a25a'); g.addColorStop(1, '#7a3a5a'); c.fillStyle = g; c.fillRect(0, 0, 200, 140); c.fillStyle = '#2a1a2a'; c.beginPath(); c.moveTo(0, 110); c.lineTo(40, 80); c.lineTo(80, 96); c.lineTo(130, 70); c.lineTo(200, 100); c.lineTo(200, 140); c.lineTo(0, 140); c.fill(); c.fillStyle = '#fff3c0'; c.font = '900 18px Archivo, Arial'; c.fillText('ROUTE 95 · NEVADA', 14, 26); }, lx, 2.1, 2.2, ry);
    art(0.6, 0.8, c => { c.fillStyle = '#e8e2d6'; c.fillRect(0, 0, 120, 160); c.fillStyle = '#3a3836'; c.fillRect(10, 10, 100, 100); c.fillStyle = '#e8e2d6'; c.fillRect(45, 60, 30, 50); c.fillStyle = '#201e1d'; c.font = '700 11px Archivo, Arial'; c.fillText('THE GATE · 1968', 14, 134); c.fillText('(nothing there)', 18, 150); }, lx, 2.0, 0.8, ry);
    art(0.7, 0.5, c => { c.fillStyle = '#f2e6c8'; c.fillRect(0, 0, 140, 100); c.fillStyle = '#c42d3c'; c.font = '900 22px Archivo, Arial'; c.fillText('EST.', 14, 34); c.font = '900 40px Archivo, Arial'; c.fillText('1951', 14, 80); }, lx, 2.25, 4.0, ry);
    const pie = art(1.1, 0.8, c => { c.fillStyle = '#1b2a24'; c.fillRect(0, 0, 220, 160); c.fillStyle = '#fff'; c.font = '900 24px Archivo, Arial'; c.fillText('PIE OF THE DAY', 16, 36); c.fillStyle = '#ffd23a'; c.font = 'italic 900 34px Archivo, Arial'; c.fillText('Cherry', 16, 86); c.fillStyle = '#ff9ac8'; c.font = '700 18px Archivo, Arial'; c.fillText('ask June · 2g a slice', 16, 128); }, W / 2 - 0.03, 2.2, -1.2, -Math.PI / 2); }
  { const cg = new T3.Group(); cg.position.set(6.2, 0, 4.8); root.add(cg); M(new T3.CylinderGeometry(0.22, 0.17, 0.32, 14), toon('#c46a3a'), 0, 0.16, 0, cg, 0.01); M(new T3.CapsuleGeometry(0.11, 0.5, 4, 10), toon('#4f8a4a'), 0, 0.68, 0, cg, 0.01); const arm = M(new T3.CapsuleGeometry(0.06, 0.18, 4, 8), toon('#4f8a4a'), 0.15, 0.78, 0, cg, 0.008); arm.rotation.z = -0.9; const arm2 = M(new T3.CapsuleGeometry(0.06, 0.14, 4, 8), toon('#4f8a4a'), -0.14, 0.62, 0, cg, 0.008); arm2.rotation.z = 0.9; M(new T3.SphereGeometry(0.04, 8, 6), toon('#ff4fa3'), 0, 1.0, 0, cg, 0); K.colliders.push([5.9, 6.5, 4.5, 5.5]);
    const gm = new T3.Group(); gm.position.set(2.9, 0, 4.9); root.add(gm); M(new T3.CylinderGeometry(0.06, 0.12, 0.8, 10), red, 0, 0.4, 0, gm, 0.008); M(new T3.BoxGeometry(0.24, 0.16, 0.24), red, 0, 0.88, 0, gm, 0.008); M(new T3.SphereGeometry(0.2, 16, 12), new T3.MeshBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0.35, depthWrite: false }), 0, 1.15, 0, gm, 0); for (let i = 0; i < 26; i++) { const a = rr(0, 6.28), r = rr(0, 0.15), y = rr(0.98, 1.2); M(new T3.SphereGeometry(0.032, 6, 5), toon(pick(['#ff4fa3', '#ffd23a', '#5fe3ff', '#22c55e', '#ffffff', '#c42d3c'])), Math.cos(a) * r, y, Math.sin(a) * r, gm, 0); } K.colliders.push([2.6, 3.2, 4.6, 5.5]);
    const mat = new T3.Mesh(new T3.PlaneGeometry(1.4, 0.9), toon('#7a1d2a')); mat.rotation.x = -Math.PI / 2; mat.position.set(K.door ? 4.4 : 4.4, 0.006, 4.85); root.add(mat); }
  // napkin dispensers + salt and pepper along the counter
  for (const x of [-2.4, -0.8, 0.8, 2.4]) { M(new T3.BoxGeometry(0.11, 0.13, 0.07), chrome, x, K.counterY + 0.065, K.counterZ + 0.1, root, 0.004); M(new T3.CylinderGeometry(0.018, 0.02, 0.07, 8), toon('#fbfbf7'), x + 0.1, K.counterY + 0.035, K.counterZ + 0.1, root, 0.003); M(new T3.CylinderGeometry(0.018, 0.02, 0.07, 8), toon('#3a3836'), x + 0.14, K.counterY + 0.035, K.counterZ + 0.1, root, 0.003); }
  // brushed-steel griddle top with a little grease
  { const gT = CTX(512, 128, c => { c.fillStyle = '#2e2d33'; c.fillRect(0, 0, 512, 128); for (let i = 0; i < 260; i++) { c.fillStyle = 'rgba(255,255,255,' + rr(0.01, 0.05) + ')'; c.fillRect(rr(0, 512), rr(0, 128), rr(20, 90), 1); } for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(30,20,10,' + rr(0.15, 0.35) + ')'; c.beginPath(); c.ellipse(rr(0, 512), rr(0, 128), rr(4, 18), rr(3, 9), rr(0, 3), 0, 7); c.fill(); } });
    const gp = new T3.Mesh(new T3.PlaneGeometry(4.86, 0.84), new T3.MeshToonMaterial({ map: gT, gradientMap: ctx.grad })); gp.rotation.x = -Math.PI / 2; gp.position.set(0, GT + 0.001, KZ); root.add(gp); }
  // a crate of syrup bottles + butter dish by the pass
  for (let i = 0; i < 3; i++) { M(new T3.CylinderGeometry(0.03, 0.035, 0.13, 10), toon('#b8641a', { transparent: true, opacity: 0.9 }), 2.62 + i * 0.08, K.top + 0.065, KZ + 0.42, root, 0.004); M(new T3.CylinderGeometry(0.012, 0.016, 0.03, 6), red, 2.62 + i * 0.08, K.top + 0.145, KZ + 0.42, root, 0); }
  // warm light over the flat-top
  { const L = new T3.PointLight(0xffc890, 7, 7, 2); L.position.set(0, 2.6, KZ + 0.4); root.add(L); }
  K.door = { x: 4.4, z: D / 2 - 0.7 };
  // walk colliders, local [x0, x1, z0, z1]
  K.colliders.push([-W / 2, 3.0, -D / 2, -4.78], [-3.98, 3.98, KZ - 0.52, K.counterZ + 0.33], [-W / 2, -6.5, -D / 2, -4.55]);
  K.cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K; }

// ---------------- the stand-alone game ----------------
export async function createBreakfastShift({ container, onState = () => {}, opts = {} }) {
  const ST = createStage(container, { bg: '#14101f' }), { touch, CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const SFX = dinerAudio(audio), panX = x => clamp(-x / 3.2, -0.8, 0.8);
  const K = buildBreakfastDiner({ THREE, M, toon, canvasTex, scene, grad, addOutline }), GT = K.gt, T = K.top;
  const stripGl = K.strips.map(s => { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xfff2c8, transparent: true, depthWrite: false, opacity: 0.35, blending: THREE.AdditiveBlending })); g.position.copy(s.position).add(V3(0, -0.15, 0)); g.scale.set(2.6, 1.0, 1); scene.add(g); return g; });
  const lampGl = [-2, 0, 2].map(x => { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff9a4a, transparent: true, depthWrite: false, opacity: 0.4, blending: THREE.AdditiveBlending })); g.position.set(x, K.passY + 0.35, K.passZ); g.scale.set(2.4, 0.9, 1); scene.add(g); return g; });
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const look = (base, o) => ({ ...base, ...o });
  const FEM = kit.getLook ? { ...CAST.player.look, eyeSpacing: 50, earWidth: 0.75, fluffSize: 0.86, headTuft: 0, blush: 0.42, lashes: 1, headWidth: 0.85 } : CAST.player.look;
  const npcFox = (o) => hideGear(kit.makeFox({ ...CAST.player, crest: '', gear: 'none', outfit: o.outfit || 'vest', torso: o.torso, mood: o.mood || 'happy', look: look(o.fem ? FEM : CAST.player.look, { fur: o.fur || '#d0742c', furDark: o.furDark || new THREE.Color(o.fur || '#d0742c').multiplyScalar(0.7).getStyle(), paw: o.fur || '#d0742c', tailMid: o.fur || '#d0742c', ...(o.look || {}) }) }));

  // ---------- THE CAST ----------
  // Ben for walking: from the cast (8 armour), weapons stowed indoors
  const CK = castKit({ THREE, M, toon, makeFox: kit.makeFox }); const walker = hideGear(CK.make('player')); walker.position.set(K.door.x, 0, K.door.z - 0.6); walker.rotation.y = Math.PI; walker.visible = false;
  // Ben at work: the BREAKFAST ALL DAY uniform (paper hat, mint towel, the egg tee)
  const ben = hideGear(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#ff4fa3'], crest: '', gear: 'none', mood: 'happy' })); const BP = ben.userData.P;
  const eggPrint = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.translate(128, 120); g.lineJoin = 'round'; g.fillStyle = '#fbfbf7'; g.strokeStyle = '#201e1d'; g.lineWidth = 8; g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, r = 92 + Math.sin(a * 5) * 10 + Math.cos(a * 3) * 6; g.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.82); } g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#ffb21a'; g.beginPath(); g.arc(-8, -8, 40, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#fff3c0'; g.beginPath(); g.arc(-22, -22, 11, 0, 7); g.fill();
    g.rotate(-0.08); g.fillStyle = '#ff4fa3'; g.fillRect(-122, 50, 244, 52); g.strokeRect(-122, 50, 244, 52); g.fillStyle = '#ffffff'; g.font = 'italic 900 34px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('ALL DAY', 0, 77); });
  const uniParts = dinerUniform(ST, ben, { print: eggPrint, stripe: '#ff4fa3', towelCol: '#2aa58f', printY: 1.17 }).parts;
  const setUniform = on => uniParts.forEach(p => p.visible = on);
  // Sunny runs the grill (white shirt, red tie, paper hat); Dottie + June work the floor
  const tieT = canvasTex(128, 128, g => { g.clearRect(0, 0, 128, 128); g.fillStyle = '#c9333f'; g.beginPath(); g.moveTo(52, 6); g.lineTo(76, 6); g.lineTo(70, 22); g.lineTo(82, 100); g.lineTo(64, 122); g.lineTo(46, 100); g.lineTo(58, 22); g.closePath(); g.fill(); g.strokeStyle = '#201e1d'; g.lineWidth = 4; g.stroke(); });
  const sunny = npcFox({ outfit: 'tee', torso: ['#f2efe6', '#f2efe6', '#c8c0ae'], fur: '#b9824a', mood: 'warm', look: { elder: 1, browColor: '#f8fafc', muzzle: '#f1d9be' } }); dinerUniform(ST, sunny, { print: tieT, stripe: '#c9333f', towelCol: '#c9333f', printSize: 0.3, printY: 1.12 });
  const dottie = npcFox({ outfit: 'dress', torso: ['#f7c6d9', '#e8e2d6', '#a89f8d'], fur: '#e0a24a', fem: true, mood: 'warm' }), june = npcFox({ outfit: 'dress', torso: ['#9fdcd0', '#e8e2d6', '#a89f8d'], fur: '#8a4a24', fem: true, mood: 'neutral' });
  const STAFF = { sunny: { f: sunny, x: 0.7, z: K.z - 0.85, face: 0 }, dottie: { f: dottie, x: -4.9, z: -0.7, face: Math.PI * 0.6 }, june: { f: june, x: 4.6, z: -1.2, face: -Math.PI * 0.55 } };
  for (const s of Object.values(STAFF)) { s.f.position.set(s.x, 0, s.z); s.f.rotation.y = s.face; }
  // the regulars in the booths (they stay all night)
  const B = K.booths, seatAt = (b, i) => B[b].seats[i];
  const REGULARS = [
    { key: 'marguerite', name: 'Marguerite', role: 'Crossword, every night', at: seatAt(0, 2), fox: { outfit: 'dress', torso: ['#b0303a', '#7a1f27', '#4a1218'], fur: '#cdbfae', fem: true, mood: 'curious', look: { elder: 1, browColor: '#f8fafc' } } },
    { key: 'bobby', name: 'Bobby', role: 'Nine. Should not be here.', at: seatAt(1, 0), small: 0.72, fox: { outfit: 'vest', torso: ['#8c3a2a', '#5f2419', '#1d3a6b'], fur: '#e08a3a', mood: 'excited' } },
    { key: 'faye', name: 'Faye', role: 'In from the picture', at: seatAt(1, 2), fox: { outfit: 'dress', torso: ['#2a5f6b', '#173c45', '#0e2329'], fur: '#d06a2a', fem: true, mood: 'happy' } },
    { key: 'duane', name: 'Duane', role: 'Here since nine', at: seatAt(1, 3), fox: { outfit: 'coat', torso: ['#4a3a5c', '#2e2338', '#1d3a6b'], fur: '#9a5a2a', mood: 'neutral' } },
    { key: 'theMan', name: 'The Man', role: 'Waiting for the order', at: seatAt(2, 0), fox: { outfit: 'suit', torso: ['#2a2e3a', '#1a1d26', '#eef2f8'], fur: '#8a8a92', mood: 'stern' } },
    { key: 'otherMan', name: 'The Other Man', role: 'Same suit, same order', at: seatAt(2, 2), fox: { outfit: 'suit', torso: ['#2a2e3a', '#1a1d26', '#eef2f8'], fur: '#8a8a92', mood: 'stern' } }];
  REGULARS.forEach(r => { r.f = npcFox(r.fox); r.f.position.set(r.at.x, 0, r.at.z); r.f.rotation.y = r.at.f; if (r.small) r.f.scale.multiplyScalar(r.small); r.seat = 'booth'; });
  // the untouched full breakfasts in front of The Man and The Other Man
  const plateMesh = () => { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.2, 0.16, 0.022, 26), toon('#fbfbf7'), 0, 0.011, 0, g, 0.008, 0.2); M(new THREE.CylinderGeometry(0.15, 0.15, 0.004, 26), toon('#efe9dc'), 0, 0.024, 0, g, 0); M(new THREE.TorusGeometry(0.18, 0.006, 4, 30), toon('#2aa58f'), 0, 0.022, 0, g, 0).rotation.x = Math.PI / 2; return g; };

  // ---------- food art ----------
  const Q = (c1, c2, k, steps = 8) => '#' + new THREE.Color(c1).lerp(new THREE.Color(c2), Math.round(clamp(k, 0, 1) * steps) / steps).getHexString();
  const shadeCol = (d, stops) => { for (let i = 1; i < stops.length; i++) if (d <= stops[i][0]) return Q(stops[i - 1][1], stops[i][1], (d - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0])); return stops[stops.length - 1][1]; };
  const BROWN = [[0, '#f6e7bf'], [0.5, '#f0c878'], [0.65, '#d99a44'], [0.85, '#a8642a'], [1.1, '#5a3418'], [1.3, '#2a1a12']];
  const cakeGeo = new THREE.CylinderGeometry(1, 0.97, 0.026, 26);
  const cakeTopT = canvasTex(128, 128, c => { const g = c.createRadialGradient(64, 64, 8, 64, 64, 64); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#f2ece0'); g.addColorStop(0.92, '#cfc0a0'); g.addColorStop(1, '#a89470'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 70; i++) { const a = Math.random() * 6.28, r = Math.random() * 56; c.fillStyle = 'rgba(140,90,40,' + (0.08 + Math.random() * 0.18) + ')'; c.beginPath(); c.arc(64 + Math.cos(a) * r, 64 + Math.sin(a) * r, 1 + Math.random() * 3, 0, 7); c.fill(); } });
  const cakeTops = new Map(), cakeTop = col => { if (!cakeTops.has(col)) cakeTops.set(col, new THREE.MeshToonMaterial({ map: cakeTopT, color: col, gradientMap: grad })); return cakeTops.get(col); };
  function cakeMesh() { const g = new THREE.Group(); const disc = new THREE.Mesh(cakeGeo, [toon('#f6e7bf'), toon('#f6e7bf'), toon('#f6e7bf')]); disc.position.y = 0.013; disc.castShadow = true; g.add(disc); const o = new THREE.Mesh(cakeGeo, ST.outlineMat); o.scale.set(1.04, 1.4, 1.04); disc.add(o);
    const bub = new THREE.Group(); for (let i = 0; i < 14; i++) { const a = i * 2.4, r = 0.15 + (i % 5) * 0.16; const b = new THREE.Mesh(new THREE.CircleGeometry(0.06, 8), toon('#c9a26a')); b.rotation.x = -Math.PI / 2; b.position.set(Math.cos(a) * r, 0.0275, Math.sin(a) * r); b.visible = false; bub.add(b); } disc.add(bub); g.userData = { disc, bub }; return g; }
  function eggMesh() { const g = new THREE.Group(), sh = new THREE.Shape(); for (let i = 0; i <= 20; i++) { const a = i / 20 * Math.PI * 2, r = 0.085 + Math.sin(a * 3 + 1) * 0.012 + Math.cos(a * 5) * 0.006; i ? sh.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const white = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }), toon('#eef2f2')); white.rotation.x = -Math.PI / 2; white.castShadow = true; addOutline(white, 0.006); g.add(white);
    const yolk = new THREE.Mesh(new THREE.SphereGeometry(0.034, 14, 10), toon('#ffb21a')); yolk.scale.y = 0.62; yolk.position.set(0.006, 0.016, 0.004); addOutline(yolk, 0.004, 0.034); g.add(yolk);
    const curd = new THREE.Group(); for (let i = 0; i < 10; i++) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.026 + (i % 3) * 0.006, 8, 6), toon(i % 3 ? '#ffd35a' : '#ffe58a')); c.scale.y = 0.6; c.position.set(Math.cos(i * 2.2) * (0.02 + (i % 4) * 0.018), 0.016, Math.sin(i * 2.2) * (0.02 + (i % 4) * 0.018)); curd.add(c); } curd.visible = false; g.add(curd);
    const shell = new THREE.Group(); for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f4ead8', { side: THREE.DoubleSide })); h.position.x = s * 0.03; h.rotation.z = s * 2.4; shell.add(h); } shell.position.y = 0.16; g.add(shell);
    g.userData = { white, yolk, curd, shell }; return g; }
  const baconTex = canvasTex(128, 32, c => { c.fillStyle = '#e07070'; c.fillRect(0, 0, 128, 32); c.fillStyle = '#fbe4dc'; c.fillRect(0, 9, 128, 5); c.fillRect(0, 22, 128, 3); c.fillStyle = '#c45050'; c.fillRect(0, 0, 128, 3); c.fillRect(0, 29, 128, 3); });
  function baconGeo(len) { const n = Math.max(2, Math.round(len / 0.03)), geo = new THREE.PlaneGeometry(Math.max(0.02, len), 0.06, n, 1); geo.rotateX(-Math.PI / 2); const p = geo.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, 0.006 + Math.abs(Math.sin(p.getX(i) * 38)) * 0.012); geo.computeVertexNormals(); geo.translate(len / 2, 0, 0); return geo; }
  const baconMats = new Map(), baconMat = col => { if (!baconMats.has(col)) baconMats.set(col, new THREE.MeshToonMaterial({ map: baconTex, color: col, gradientMap: grad, side: THREE.DoubleSide })); return baconMats.get(col); };
  function hashTex() { const cv = document.createElement('canvas'); cv.width = cv.height = 128; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return { cv, tx, c: cv.getContext('2d') }; }
  function mugMesh() { const g = new THREE.Group(); M(new THREE.CylinderGeometry(0.055, 0.05, 0.12, 16, 1, true), toon('#f4efe6', { side: THREE.DoubleSide }), 0, 0.06, 0, g, 0.006, 0.055); M(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 16), toon('#f4efe6'), 0, 0.004, 0, g, 0); M(new THREE.CylinderGeometry(0.0565, 0.0565, 0.014, 16, 1, true), toon('#ff4fa3'), 0, 0.09, 0, g, 0);
    const h = M(new THREE.TorusGeometry(0.03, 0.009, 6, 12, Math.PI), toon('#f4efe6'), -0.058, 0.06, 0, g, 0.004); h.rotation.z = Math.PI / 2;
    const cof = new THREE.Mesh(new THREE.CylinderGeometry(0.049, 0.049, 0.004, 16), toon('#3a2112')); cof.visible = false; g.add(cof); g.userData.cof = cof; return g; }
  const coffeeCol = cream => Q('#2e1a0e', '#c9a27a', cream / 0.9, 10);

  // ---------- cameras ----------
  const { SAFE, fitShot, shotFor } = cameraFit(ST);
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 }, port = () => CW() < CHh();
  const glideTo = (shot, dur = 1.4) => { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; };
  const ZONE_PTS = id => { const zc = K.zones[id], w = K.zoneW / 2 + 0.04, d = K.zoneD / 2 + 0.02; return [V3(zc.x - w, GT, zc.z - d), V3(zc.x + w, GT, zc.z - d), V3(zc.x - w, GT, zc.z + d), V3(zc.x + w, GT, zc.z + d), V3(zc.x, GT + 0.2, zc.z)]; };
  function shotPoints(id) { const P = (x, z, y = GT) => V3(x, y, z), C = K.coffee;
    if (K.zones[id]) { const pts = ZONE_PTS(id); if (id === 'cakes') pts.push(P(K.pitcherHome.x, K.pitcherHome.z, GT + 0.2)); return pts; }
    if (id === 'coffee') return [P(C.pot.x - 0.16, C.sugar.z - 0.12), P(C.cream.x + 0.12, C.sugar.z - 0.12), P(C.pot.x - 0.16, C.mug.z + 0.2, T + 0.5), P(C.cream.x + 0.12, C.mug.z + 0.12, T + 0.3), P(C.mug.x, C.mug.z + 0.3, T + 0.66)];
    if (id === 'pass') return [...K.seats.flatMap(s => [P(s.x - 0.35, K.passZ - 0.25, K.passY), P(s.x + 0.35, K.passZ - 0.25, K.passY), P(s.x, s.z, 1.95)]), P(-2.5, K.passZ, K.passY), P(2.6, K.passZ, K.passY)];
    return [P(-2.5, K.z - 0.42), P(2.5, K.z - 0.42), P(-2.5, K.passZ, K.passY), P(2.5, K.passZ, K.passY), ...K.seats.map(s => P(s.x, s.z, 1.8))]; }
  const EL = { all: [0.9, 1.15], pass: [0.62, 0.78], coffee: [0.95, 1.15] };
  function workShot(id = S.focus) { const el = (EL[id] || [1.0, 1.22])[port() ? 1 : 0]; return shotFor('w:' + id, () => shotPoints(id), el, 0, id === 'all' ? 0.03 : 0.05); }
  const wideShot = () => { const b = ben.position, s = sunny.position; const pts = [V3(b.x - 0.5, 0.05, b.z), V3(b.x + 0.5, 0.05, b.z), V3(b.x - 0.5, 2.3, b.z), V3(b.x + 0.5, 2.3, b.z), V3(s.x, 2.0, s.z)]; return port() ? shotFor('wideP', () => pts, 0.12, Math.PI - 0.22, 0.08) : shotFor('wideL', () => pts, 0.14, Math.PI - 0.3, 0.05); };
  const doneShot = () => shotFor('doneW', () => [V3(-2.6, GT, K.z), V3(2.6, GT, K.z), V3(-2.6, 2.4, K.z - 0.85), V3(2.6, 2.4, K.z - 0.85), ...K.seats.map(s => V3(s.x, 1.8, s.z))], 0.28, Math.PI, 0.06);

  // ---------- game state ----------
  const S = { mode: 'intro', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, payOut: null, react: null, next: 2, done: null, demo: false, toast: null, toastT: 0 };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 4) => { S.say = s; S.sayT = t; };
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const items = [], orders = []; let idSeq = 1, mug = null;
  const plates = K.seats.map(s => { const g = plateMesh(); g.position.set(s.plate.x, s.plate.y, s.plate.z); scene.add(g); g.visible = false; const food = new THREE.Group(); g.add(food); return { seat: s.i, g, food, o: null, heat: 1, hot: false, slide: null }; });
  const dayOK = k => DISH[k].day <= S.day;

  // ---------- GAUGES: a little meter floating over everything that cooks ----------
  function makeGauge() { const gc = document.createElement('canvas'); gc.width = 256; gc.height = 44; const gt = new THREE.CanvasTexture(gc); gt.colorSpace = THREE.SRGBColorSpace; const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: gt, depthTest: false, transparent: true })); s.renderOrder = 25; s.scale.set(0.3, 0.052, 1); scene.add(s); return { s, gc, gt, key: '' }; }
  const Z_CAKE_A = [[0, 0.5, '#9ca3af', 'raw'], [0.5, 0.78, '#22c55e', 'flip'], [0.78, 1.05, '#e6b45a', 'scorch'], [1.05, 1.25, '#ec3013', 'burnt']];
  const Z_CAKE_B = [[0, 0.45, '#f6e7bf', 'pale'], [0.45, 0.8, '#22c55e', 'golden'], [0.8, 1.1, '#a8642a', 'dark'], [1.1, 1.25, '#ec3013', 'burnt']];
  const Z_YOLK = [[0, 0.3, '#9ca3af', 'raw'], [0.3, 0.55, '#ffb21a', 'runny'], [0.55, 0.8, '#e6b45a', 'medium'], [0.8, 1.12, '#a8792e', 'hard'], [1.12, 1.25, '#ec3013', 'burnt']];
  const Z_BACON = [[0, 0.55, '#e88a8a', 'limp'], [0.55, 0.92, '#22c55e', 'crisp'], [0.92, 1.12, '#8a4a26', 'dark'], [1.12, 1.25, '#ec3013', 'burnt']];
  const Z_HASH_A = [[0, 0.4, '#9ca3af', 'raw'], [0.4, 1.02, '#22c55e', 'flip'], [1.02, 1.25, '#ec3013', 'burnt']];
  const Z_HASH_B = [[0, 0.35, '#f2e2b0', 'pale'], [0.35, 0.58, '#f0c878', 'golden'], [0.58, 0.8, '#d99a44', 'crisp'], [0.8, 1.02, '#a8642a', 'well'], [1.02, 1.25, '#ec3013', 'burnt']];
  function drawGauge(G, zones, v, want) { const key = zones.length + ':' + Math.round(v * 120) + ':' + want; if (key === G.key) return; G.key = key; const c = G.gc.getContext('2d'), W = 256, H = 44, sx = q => 6 + q / 1.25 * (W - 12); c.clearRect(0, 0, W, H); c.fillStyle = '#201e1d'; c.fillRect(0, 8, W, H - 16);
    zones.forEach(([a, b, col, k]) => { c.fillStyle = col; c.fillRect(sx(a), 13, Math.max(1, sx(b) - sx(a) - 2), H - 26); if (want === k) { c.strokeStyle = '#ffd23a'; c.lineWidth = 5; c.strokeRect(sx(a) - 1, 10, sx(b) - sx(a), H - 20); } });
    const m = sx(Math.min(1.25, v)); c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(m - 9, 0); c.lineTo(m + 9, 0); c.lineTo(m, 12); c.closePath(); c.fill(); c.fillRect(m - 2, 8, 4, H - 16); G.gt.needsUpdate = true; }
  const zoneAt = (zones, v) => (zones.find(z => v >= z[0] && v < z[1]) || zones[zones.length - 1])[3];
  const killItem = it => { scene.remove(it.g); if (it.G) scene.remove(it.G.s); const i = items.indexOf(it); if (i >= 0) items.splice(i, 1); };

  // ---------- what the waiting tickets still need ----------
  const waiting = () => orders.filter(o => o.st === 'wait');
  const need = (o, k) => { const N = o.need, G = o.got; if (k === 'cakes') return Math.max(0, N.cakes - G.cakes.length); if (k === 'eggs') return N.eggs ? Math.max(0, 2 - G.eggs.length) : 0; if (k === 'bacon') return Math.max(0, N.bacon - G.bacon.length); if (k === 'hash') return N.hash && !G.hash ? 1 : 0; if (k === 'coffee') return N.coffee && !G.coffee ? 1 : 0; return 0; };
  const complete = o => ['cakes', 'eggs', 'bacon', 'hash', 'coffee'].every(k => need(o, k) === 0);
  const urgent = list => list.slice().sort((a, b) => a.pat - b.pat);
  const eggStyle = it => it.stir >= 0.9 ? 'scr' : it.flipped ? 'over' : 'sunny';
  const eggFits = (it, spec) => { const E = EGG[spec], st = eggStyle(it); return E.scr ? st === 'scr' : E.flip ? st === 'over' : st === 'sunny'; };
  const wantFor = kind => { for (const o of urgent(waiting())) { if (kind === 'eggs' && need(o, 'eggs')) return EGG[o.need.eggs].dn; if (kind === 'hash' && need(o, 'hash')) return o.need.hash; } return ''; };

  // ---------- PANCAKES: hold on a dashed ring to pour, flick up to flip, tap to plate ----------
  function startPour(spot) { const it = { kind: 'cake', id: idSeq++, x: spot.x, z: spot.z, spot, r: 0.03, pouring: true, d: 0, d2: 0, flipped: false, flipT: 0, wob: 0, g: cakeMesh(), G: makeGauge() }; it.g.position.set(spot.x, GT, spot.z); it.g.userData.disc.scale.set(it.r, 1, it.r); scene.add(it.g); items.push(it); S.pour = it; buzz(15); SFX.pour(true); return it; }
  function stopPour() { const it = S.pour; if (!it) return; S.pour = null; it.pouring = false; SFX.pour(false); const off = it.r - CAKE_R; if (off > 0.045) flash('TOO BIG · IT RAN WIDE', '#ec3013', 1.2); else if (off < -0.05) flash('TOO SMALL', '#ffffff', 1.1); else if (Math.abs(off) <= 0.025) flash('JUST RIGHT', '#22c55e', 0.9); }
  function flip(it, strong) { if (it.flipped || it.flipT) return false;
    if (it.kind === 'egg') { if (it.stir >= 0.9) return false; if (it.d < 0.18) { flash('WAIT FOR THE WHITE TO SET', '#ffffff', 1.1); return false; } }
    if (it.kind === 'hash' && it.cover < 0.2) { flash('SPREAD MORE SHREDS FIRST', '#ffffff', 1.1); return false; }
    if (it.kind === 'cake' && it.pouring) return false;
    it.flipT = 0.001; it.toss = strong ? 0.34 : 0.2; it.flipAt = it.d; SFX.flip(strong, panX(it.x)); buzz(25);
    if (it.kind === 'cake') { it.flipQ = it.d < FLIP[0] ? 0.35 : it.d <= FLIP[1] ? 1 : it.d <= 1.05 ? 0.55 : 0.15; if (it.d >= FLIP[0] && it.d <= FLIP[1]) { SFX.perfect(panX(it.x)); for (let i = 0; i < 8; i++) puff(it.x + rr(-0.15, 0.15), GT + rr(0.1, 0.4), it.z + rr(-0.1, 0.1), 0xffd23a, 1); } flash(it.d < FLIP[0] ? 'TOO EARLY · IT TORE' : it.d <= FLIP[1] ? (strong ? 'PERFECT FLICK!' : 'PERFECT FLIP') : 'LATE · SCORCHED', it.d < FLIP[0] || it.d > FLIP[1] ? '#e6b45a' : '#22c55e', 0.9); }
    if (it.kind === 'hash') { it.flipQ = it.d < 0.4 ? 0.5 : it.d <= 1.02 ? 1 : 0.2; flash(it.d < 0.4 ? 'EARLY · IT FELL APART A BIT' : strong ? 'PERFECT FLICK!' : 'FLIPPED', it.d < 0.4 ? '#e6b45a' : '#22c55e', 0.9); }
    if (it.kind === 'egg') flash(strong ? 'FLICKED · OVER IT GOES' : 'FLIPPED · OVER', '#22c55e', 0.8);
    return true; }

  // ---------- EGGS: tap to crack, stir in circles to scramble ----------
  function crackEgg(x, z) { const n = items.filter(i => i.kind === 'egg').length; if (n >= 4) { flash('FOUR EGGS IS A FULL SECTION', '#ffffff', 1); return null; } const zc = K.zones.eggs; x = clamp(x, zc.x - 0.48, zc.x + 0.48); z = clamp(z, zc.z - 0.3, zc.z + 0.3);
    const it = { kind: 'egg', id: idSeq++, x, z, d: 0, flipped: false, flipT: 0, stir: 0, crackT: 0, g: eggMesh(), G: makeGauge() }; it.g.position.set(x, GT, z); it.g.rotation.y = rr(0, 6); it.g.userData.white.scale.setScalar(0.2); scene.add(it.g); items.push(it);
    SFX.crack(panX(x)); buzz(12); return it; }
  function stirAt(x, z, len) { let any = false; for (const it of items) { if (it.kind !== 'egg' || it.flipped || it.d > 0.95) continue; if (Math.hypot(it.x - x, it.z - z) < 0.16) { const was = it.stir; it.stir = Math.min(1.2, it.stir + len * 1.5); any = true; if (was < 0.9 && it.stir >= 0.9) { flash('SCRAMBLED', '#22c55e', 0.8); tone(880, 0.08, 0.04); } } } if (any && Math.random() < 0.3) audio.burst && audio.burst(0.06, 1300, 0.04); return any; }

  // ---------- BACON: drag along a lane ----------
  function startLay(lane) { const it = { kind: 'bacon', id: idSeq++, lane, x: lane.x0, z: lane.z, len: 0.02, dev: 0, d: 0, laying: true, g: new THREE.Mesh(baconGeo(0.02), baconMat('#ffffff')), G: makeGauge() }; it.g.position.set(lane.x0, GT, lane.z); it.g.rotation.y = Math.PI; it.g.castShadow = true; scene.add(it.g); items.push(it); S.lay = it; buzz(10); SFX.slap(panX(lane.x0)); return it; }
  function layTo(it, x, z) { const L = clamp(it.lane.x0 - x, 0.02, it.lane.x0 - it.lane.x1); it.dev = Math.max(it.dev, Math.abs(z - it.lane.z)); if (Math.abs(L - it.len) > 0.02) { it.len = L; it.g.geometry.dispose(); it.g.geometry = baconGeo(L); if (Math.random() < 0.5) audio.burst && audio.burst(0.08, 1800, 0.05); } }
  function stopLay() { const it = S.lay; S.lay = null; if (!it) return; it.laying = false; if (it.len < 0.18) { killItem(it); flash('TOO SHORT · DRAG THE WHOLE LANE', '#ffffff', 1.2); return; } tone(500, 0.08, 0.03); audio.burst && audio.burst(0.3, 2800, 0.08); if (it.len > 0.6) flash('END TO END', '#22c55e', 0.7); }

  // ---------- HASH BROWNS: scribble in the ring ----------
  const HR = K.hashRing, HN = 12, cellIn = []; for (let i = 0; i < HN; i++) for (let j = 0; j < HN; j++) { const cx = -HR.r + (i + 0.5) * 2 * HR.r / HN, cz = -HR.r + (j + 0.5) * 2 * HR.r / HN; if (Math.hypot(cx, cz) < HR.r) cellIn.push(i * HN + j); }
  function startHash() { const tx = hashTex(), mat = new THREE.MeshToonMaterial({ map: tx.tx, transparent: true, alphaTest: 0.05, gradientMap: grad, color: '#ffffff' }), m = new THREE.Mesh(new THREE.CircleGeometry(HR.r, 30), mat); m.rotation.x = -Math.PI / 2; m.position.set(HR.x, GT + 0.006, HR.z);
    const it = { kind: 'hash', id: idSeq++, x: HR.x, z: HR.z, cells: new Set(), cover: 0, d: 0, d2: 0, flipped: false, flipT: 0, cooking: false, tx, g: new THREE.Group(), G: makeGauge() }; it.g.add(m); it.mesh = m; it.g.position.set(0, 0, 0); m.position.set(0, 0.006, 0); it.g.position.set(HR.x, GT, HR.z); scene.add(it.g); items.push(it); return it; }
  function spread(it, x, z) { if (it.flipped) return; const lx = x - HR.x, lz = z - HR.z; if (Math.hypot(lx, lz) > HR.r + 0.05) return; let added = 0; const c = it.tx.c;
    for (const id of cellIn) { const i = Math.floor(id / HN), j = id % HN, cx = -HR.r + (i + 0.5) * 2 * HR.r / HN, cz = -HR.r + (j + 0.5) * 2 * HR.r / HN; if (Math.hypot(cx - lx, cz - lz) < 0.06 && !it.cells.has(id)) { it.cells.add(id); added++;
      const px = (cx / HR.r * 0.5 + 0.5) * 128, py = (cz / HR.r * 0.5 + 0.5) * 128; for (let k = 0; k < 7; k++) { const a = rr(0, 3.14), l = rr(5, 11); c.strokeStyle = pick(['#f2e2b0', '#e8d090', '#fbf0c8', '#d9b870']); c.lineWidth = rr(1.5, 3); c.beginPath(); c.moveTo(px + rr(-6, 6), py + rr(-6, 6)); c.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); c.stroke(); } } }
    if (added) { it.cover = it.cells.size / cellIn.length; it.tx.tx.needsUpdate = true; if (Math.random() < 0.6) SFX.scratch(panX(HR.x)); } }

  // ---------- COFFEE: hold the pot, hold the creamer, tap the sugar ----------
  const CF = K.coffee, pot = new THREE.Group(); { M(new THREE.CylinderGeometry(0.08, 0.09, 0.2, 16), toon('#cfe3ea', { transparent: true, opacity: 0.6 }), 0, 0.1, 0, pot, 0.008); M(new THREE.CylinderGeometry(0.075, 0.085, 0.12, 16), toon('#3a2112'), 0, 0.065, 0, pot, 0); M(new THREE.CylinderGeometry(0.05, 0.08, 0.06, 16), toon('#e07a2a'), 0, 0.225, 0, pot, 0.006); const hd = M(new THREE.BoxGeometry(0.03, 0.14, 0.03), toon('#201e1d'), 0.11, 0.14, 0, pot, 0.005); hd.rotation.z = -0.2; pot.position.set(CF.pot.x, T + 0.02, CF.pot.z); scene.add(pot); }
  const creamer = new THREE.Group(); { M(new THREE.CylinderGeometry(0.035, 0.045, 0.1, 12), toon('#d7dde3'), 0, 0.05, 0, creamer, 0.006); M(new THREE.ConeGeometry(0.018, 0.04, 6), toon('#d7dde3'), 0.04, 0.09, 0, creamer, 0).rotation.z = -1.2; creamer.position.set(CF.cream.x, T, CF.cream.z); scene.add(creamer); }
  { const bowl = M(new THREE.CylinderGeometry(0.07, 0.05, 0.06, 16), toon('#fbfbf7'), CF.sugar.x, T + 0.03, CF.sugar.z, null, 0.006); for (let i = 0; i < 5; i++) M(new THREE.BoxGeometry(0.022, 0.022, 0.022), toon('#ffffff'), CF.sugar.x + rr(-0.03, 0.03), T + 0.065, CF.sugar.z + rr(-0.03, 0.03), null, 0.003); }
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 1, 8), new THREE.MeshBasicMaterial({ color: 0x3a2112 })); stream.visible = false; scene.add(stream);
  const lineMark = new THREE.Mesh(new THREE.TorusGeometry(0.049, 0.003, 4, 24), new THREE.MeshBasicMaterial({ color: 0xffd23a })); lineMark.rotation.x = Math.PI / 2; scene.add(lineMark);
  const cubes = [];
  function freshMug() { if (mug) scene.remove(mug.g); mug = { fill: 0, cream: 0, sugars: 0, spilt: false, g: mugMesh() }; mug.g.position.set(CF.mug.x, T + 0.012, CF.mug.z); scene.add(mug.g); lineMark.position.set(CF.mug.x, T + 0.012 + 0.01 + 0.105 * 0.8, CF.mug.z); }
  freshMug();
  function mugLook() { const c = mug.g.userData.cof; c.visible = mug.fill > 0.02; c.position.y = 0.01 + 0.105 * Math.min(1, mug.fill); c.material = toon(coffeeCol(mug.cream)); }
  function addSugar() { if (mug.fill < 0.2) { flash('COFFEE FIRST', '#ffffff', 0.9); return; } if (mug.sugars >= 4) { flash('THAT IS PLENTY OF SUGAR', '#ffffff', 0.9); return; } mug.sugars++; const cb = M(new THREE.BoxGeometry(0.022, 0.022, 0.022), toon('#ffffff'), CF.sugar.x, T + 0.08, CF.sugar.z, null, 0.003); cubes.push({ m: cb, t: 0 }); SFX.plink(); buzz(8); }
  function coffeeQ(o) { const w = o.need.coffee, m = mug, lv = 1 - clamp(Math.abs(m.fill - 0.8) - 0.05, 0, 0.4) / 0.4, cr = 1 - clamp(Math.abs(m.cream - CREAM[w.cream].v) - 0.08, 0, 0.5) / 0.5, sg = 1 - Math.min(1, Math.abs(m.sugars - w.sugars) * 0.34); return 0.4 * lv + 0.3 * cr + 0.3 * sg; }
  function plateMug(seatI) { if (mug.fill < 0.25) { flash('POUR THE COFFEE FIRST · HOLD THE POT', '#ffffff', 1.2); return false; } let o = seatI != null ? plates[seatI].o : null;
    if (seatI != null && (!o || !need(o, 'coffee'))) { flash('NO COFFEE ON THAT TICKET', '#ffffff', 1.1); return false; }
    if (!o) { const c = urgent(waiting().filter(q => need(q, 'coffee'))); if (!c.length) { flash('NOBODY ORDERED COFFEE YET', '#ffffff', 1.1); return false; } o = c.slice().sort((a, b) => coffeeQ(b) - coffeeQ(a) || a.pat - b.pat)[0]; }
    o.got.coffee = { q: coffeeQ(o), cream: mug.cream, sugars: mug.sugars, fill: mug.fill }; landed(o, 'COFFEE'); freshMug(); return true; }

  // ---------- PLATING ----------
  function cakeQ(it) { const size = 1 - clamp((Math.abs(it.r - CAKE_R) - 0.02) / 0.06, 0, 1), b = it.d2 >= CAKE_B[0] && it.d2 <= CAKE_B[1] ? 1 : it.d2 < CAKE_B[0] ? 0.5 : 0.6; return 0.35 * size + 0.3 * (it.flipQ ?? 0.3) + 0.35 * b - Math.min(0.15, it.wob * 0.02); }
  function eggQ(it, spec) { const E = EGG[spec], dn = yolkOf(it.d), ord = ['runny', 'medium', 'hard'], off = Math.abs(ord.indexOf(dn) - ord.indexOf(E.dn)); return (eggFits(it, spec) ? 0.55 : 0.15) + (off === 0 ? 0.45 : off === 1 ? 0.22 : 0.08); }
  function baconQ(it) { const b = it.d >= BACON[0] && it.d <= BACON[1] ? 1 : it.d < BACON[0] ? 0.4 : 0.7; return 0.4 * clamp(it.len / 0.6, 0, 1) + 0.15 * clamp(1 - it.dev * 8, 0, 1) + 0.45 * b; }
  function hashQ(it, want) { const z = zoneAt(Z_HASH_B, it.d2), ord = ['pale', 'golden', 'crisp', 'well'], off = Math.abs(ord.indexOf(z) - ord.indexOf(want)); return 0.35 * clamp(it.cover / 0.8, 0, 1) + 0.2 * (it.flipQ ?? 0.5) + 0.45 * (off === 0 ? 1 : off === 1 ? 0.6 : 0.3); }
  const KIND = { cake: 'cakes', egg: 'eggs', bacon: 'bacon', hash: 'hash' }, KNAME = { cakes: 'PANCAKES', eggs: 'EGGS', bacon: 'BACON', hash: 'HASH BROWNS', coffee: 'COFFEE' };
  function isBurnt(it) { return it.kind === 'cake' ? (it.flipped ? it.d2 > 1.1 : it.d > 1.05 && false) : it.kind === 'hash' ? (it.flipped ? it.d2 > 1.02 : it.d > 1.02) : it.kind === 'bacon' ? it.d > 1.12 : it.d > 1.12; }
  function tapItem(it) { if (isBurnt(it)) { killItem(it); flash('BURNT · IN THE BIN', '#ec3013', 1.1); SFX.burn(panX(it.x)); buzz([30, 40, 30]); return; }
    if (it.kind === 'cake') { if (!it.flipped) { flip(it, false); return; } if (it.d2 < 0.25) { flash('SECOND SIDE IS STILL RAW', '#ffffff', 1); return; } return plateItem(it); }
    if (it.kind === 'hash') { if (!it.flipped) { if (!it.cooking) { flash('SCRIBBLE TO SPREAD, THEN LET IT COOK', '#ffffff', 1.1); return; } flip(it, false); return; } if (it.d2 < 0.2) { flash('STILL PALE UNDERNEATH', '#ffffff', 1); return; } return plateItem(it); }
    if (it.kind === 'egg') { if (it.d < 0.3) { flash('STILL RAW', '#ffffff', 0.9); return; } return plateItem(it); }
    if (it.kind === 'bacon') { if (it.d < 0.35) { flash('STILL LIMP', '#ffffff', 0.9); return; } return plateItem(it); } }
  function plateItem(it, seatI) { const k = KIND[it.kind]; let o = seatI != null ? plates[seatI].o : null;
    if (seatI != null && (!o || !need(o, k))) { flash(o ? 'NOT ON ' + CUSTOMERS[o.ci].name + "'S TICKET" : 'NOBODY AT THAT SEAT', '#ffffff', 1.1); return false; }
    if (!o) { let c = urgent(waiting().filter(q => need(q, k))); if (!c.length) { flash('NOBODY NEEDS ' + KNAME[k] + ' RIGHT NOW', '#ffffff', 1.1); return false; }
      if (k === 'eggs') { const fit = c.filter(q => eggFits(it, q.need.eggs)); if (fit.length) c = fit; } if (k === 'hash') { const z = zoneAt(Z_HASH_B, it.d2), fit = c.filter(q => q.need.hash === z); if (fit.length) c = fit; } o = c[0]; }
    if (k === 'cakes') { o.got.cakes.push(cakeQ(it)); killItem(it); }
    else if (k === 'hash') { o.got.hash = { q: hashQ(it, o.need.hash), shade: zoneAt(Z_HASH_B, it.d2) }; killItem(it); }
    else if (k === 'eggs') { const st = eggStyle(it), grp = [it, ...items.filter(q => q !== it && q.kind === 'egg' && !isBurnt(q) && q.d >= 0.3 && eggStyle(q) === st)].slice(0, need(o, 'eggs')); grp.forEach(e => { o.got.eggs.push({ q: eggQ(e, o.need.eggs), st, dn: yolkOf(e.d) }); killItem(e); }); }
    else if (k === 'bacon') { const grp = [it, ...items.filter(q => q !== it && q.kind === 'bacon' && !q.laying && !isBurnt(q) && q.d >= 0.35).sort((a, b) => Math.abs(a.d - 0.75) - Math.abs(b.d - 0.75))].slice(0, need(o, 'bacon')); grp.forEach(b => { o.got.bacon.push(baconQ(b)); killItem(b); }); }
    landed(o, KNAME[k]); return true; }
  function landed(o, what) { const p = plates[o.seat]; if (!p.hot) { p.hot = true; p.heat = 1; } rebuildPlate(p); SFX.clink(panX(p.g.position.x)); puff(p.g.position.x, K.passY + 0.15, p.g.position.z, 0xfff3d0, 2); buzz(15);
    if (complete(o)) { o.ready = true; ding(); flash('ORDER UP · FLICK THE PLATE TO ' + CUSTOMERS[o.ci].name, '#ffd23a', 2); } else flash(what + ' ON ' + CUSTOMERS[o.ci].name + "'S PLATE", '#22c55e', 1); }
  function ding() { SFX.bell(); K.bellM.userData.hit = 1; buzz([20, 30, 20]); }
  function rebuildPlate(p) { const F = p.food; while (F.children.length) F.remove(F.children[0]); const o = p.o; if (!o) return; const G = o.got;
    G.cakes.forEach((q, i) => { const m = cakeMesh(); m.userData.disc.scale.set(0.1, 1, 0.1); m.userData.disc.material.forEach((mm, j) => m.userData.disc.material[j] = j === 1 ? cakeTop('#d99a44') : toon('#c9883a')); m.position.set(-0.05, 0.024 + i * 0.026, 0.01); m.rotation.y = i; F.add(m); });
    if (G.cakes.length && G.cakes.length >= o.need.cakes) { M(new THREE.BoxGeometry(0.04, 0.016, 0.04), toon('#ffe58a'), -0.05, 0.03 + G.cakes.length * 0.026, 0.01, F, 0.003); const sy = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.004, 18), toon('#b8641a')); sy.position.set(-0.05, 0.026 + G.cakes.length * 0.026, 0.01); F.add(sy); }
    G.eggs.forEach((e, i) => { const m = eggMesh(); m.userData.shell.visible = false; m.scale.setScalar(0.62); m.position.set(0.09, 0.024, -0.07 + i * 0.09); if (e.st === 'scr') { m.userData.white.visible = false; m.userData.yolk.visible = false; m.userData.curd.visible = true; } else if (e.st === 'over') m.userData.yolk.material = toon('#f5efe0'); F.add(m); });
    G.bacon.forEach((q, i) => { const b = new THREE.Mesh(baconGeo(0.18), baconMat('#c07850')); b.position.set(-0.02, 0.026, 0.09 + i * 0.022 - 0.02); b.rotation.y = 0.15; b.scale.set(0.8, 1, 0.5); F.add(b); });
    if (G.hash) { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 14), toon(Q('#f0c878', '#8a4a20', ['golden', 'crisp', 'well'].indexOf(G.hash.shade) / 2))); h.position.set(0.1, 0.034, 0.06); F.add(h); }
    if (G.coffee) { const m = mugMesh(); m.position.set(0.3, -0.004, 0.02); m.userData.cof.visible = true; m.userData.cof.position.y = 0.01 + 0.105 * Math.min(1, G.coffee.fill); m.userData.cof.material = toon(coffeeCol(G.coffee.cream)); F.add(m); } }

  // ---------- CUSTOMERS at the counter ----------
  const custFox = CUSTOMERS.map(cu => { const f = npcFox(cu); f.visible = false; return f; });
  function makeNeed(force) { if (force) return { cakes: 0, eggs: null, bacon: 0, hash: null, coffee: null, ...force };
    const d = S.day, N = { cakes: 0, eggs: null, bacon: 0, hash: null, coffee: null }, eggKeys = Object.keys(EGG).filter(k => EGG[k].day <= d), shades = ['golden', 'crisp', ...(d >= 5 ? ['well'] : [])];
    if (d >= 4 && Math.random() < 0.18) { Object.assign(N, { cakes: 2, eggs: pick(eggKeys), bacon: 3, hash: pick(shades), full: true }); }
    else { const slots = 1 + (d >= 2 && Math.random() < 0.5 ? 1 : 0) + (d >= 4 && Math.random() < 0.35 ? 1 : 0), opts = ['cakes', ...(d >= 2 ? ['eggs'] : []), ...(d >= 3 ? ['bacon'] : []), ...(d >= 4 ? ['hash'] : [])];
      for (let i = 0; i < slots && opts.length; i++) { const k = opts.splice(Math.floor(Math.random() * opts.length), 1)[0]; if (k === 'cakes') N.cakes = Math.random() < 0.5 ? 2 : 3; if (k === 'eggs') N.eggs = pick(eggKeys); if (k === 'bacon') N.bacon = d >= 4 && Math.random() < 0.4 ? 3 : 2; if (k === 'hash') N.hash = pick(shades); } }
    if (N.full || Math.random() < 0.7) N.coffee = { cream: d <= 1 ? pick(['black', 'splash']) : pick(['black', 'splash', 'extra']), sugars: d <= 1 ? pick([0, 1]) : pick([0, 1, 1, 2, 3]) };
    return N; }
  const priceOf = N => (N.cakes === 3 ? PRICE.tall : N.cakes ? PRICE.short : 0) + (N.eggs ? PRICE.eggs : 0) + (N.bacon ? PRICE.bacon : 0) + (N.hash ? PRICE.hash : 0) + (N.coffee ? PRICE.coffee : 0) + (N.full ? 1 : 0);
  function newOrder(force) { const free = K.seats.findIndex(s => !orders.some(o => o.seat === s.i)); if (free < 0) return null; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)), ci = force && force.ci != null ? force.ci : pick(pool);
    const N = makeNeed(force && force.need), items_ = (N.cakes ? 1 : 0) + (N.eggs ? 1 : 0) + (N.bacon ? 1 : 0) + (N.hash ? 1 : 0) + (N.coffee ? 1 : 0), patMax = (60 + items_ * 18 - Math.min(20, (S.day - 1) * 4)) * (upg('jukebox') ? 1.2 : 1);
    const f = custFox[ci], seat = K.seats[free]; f.visible = true; f.position.set(K.door.x, 0, K.door.z); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.position.y = 0;
    const o = { id: idSeq++, ci, seat: free, need: N, got: { cakes: [], eggs: [], bacon: [], hash: null, coffee: null }, total: priceOf(N), pat: patMax, patMax, st: 'walk', f, path: [V3(seat.x + 0.4, 0, K.stoolZ + 1.1), V3(seat.x, 0, K.stoolZ)], t: 0 };
    orders.push(o); SFX.door(); return o; }
  function sitPose(f, seatY) { const P = f.userData.P; P.legs.forEach(l => l.rotation.x = -1.35); f.position.y = seatY; }
  // ---------- SERVE: flick the plate down the counter ----------
  function servePlate(p) { const o = p.o; if (!o || o.st !== 'wait') return; if (!complete(o)) { const miss = ['cakes', 'eggs', 'bacon', 'hash', 'coffee'].filter(k => need(o, k)).map(k => KNAME[k]); flash('STILL NEEDS ' + miss.join(' + '), '#ffffff', 1.4); return; }
    o.st = 'served'; p.slide = { t: 0 }; SFX.slide(panX(p.g.position.x)); buzz(30); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited' }, happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy' }, neutral: { word: 'OKAY', col: '#e6b45a', mood: 'neutral' }, unhappy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad' }, insulted: { word: 'SENT BACK!', col: '#ec3013', mood: 'angry' } };
  function judge(o) { const G = o.got, parts = [], avg = a => a.reduce((s, v) => s + v, 0) / a.length; if (G.cakes.length) parts.push(avg(G.cakes)); if (G.eggs.length) parts.push(avg(G.eggs.map(e => e.q))); if (G.bacon.length) parts.push(avg(G.bacon)); if (G.hash) parts.push(G.hash.q); if (G.coffee) parts.push(G.coffee.q);
    const q = parts.length ? avg(parts) : 0, pq = o.pat / o.patMax, cold = plates[o.seat].heat < 0.2; let stars = q >= 0.8 && pq > 0.3 ? 3 : q >= 0.6 ? 2 : q >= 0.38 ? 1 : 0; if (cold && stars) stars = Math.max(1, stars - 1); return { q, pq, stars, cold }; }
  function startReact(o) { const J = judge(o), cu = CUSTOMERS[o.ci];
    const level = J.stars === 0 ? 'insulted' : J.stars === 3 ? (J.pq > 0.65 ? 'thrilled' : 'happy') : J.stars === 2 ? 'neutral' : 'unhappy', R = REACT[level];
    o.stars = J.stars; o.tip = level === 'thrilled' ? Math.ceil(o.total * 0.5) + 3 : level === 'happy' ? Math.ceil(o.total * 0.3) + 1 : level === 'neutral' ? 1 : 0;
    const line = J.cold ? 'This plate is cold, hon.' : level === 'insulted' ? 'That is not what I ordered. Take it back.' : level === 'unhappy' ? pick(LINES.meh) : level === 'neutral' ? 'It is fine. It is a plate.' : pick(LINES.happy);
    o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; if (level === 'thrilled') { o.f.userData.hop = 1; for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.6, 2.4), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); }
    if (level === 'insulted' || level === 'unhappy') SFX.bad(); else SFX.good(J.stars);
    if (J.cold) say('SUNNY: "A cold plate is a plate that comes back."', 4);
    const bill = J.stars ? ([5, 10, 20, 50].find(b => b > o.total + (Math.random() < 0.3 ? 3 : 0)) || 50) : 0;
    S.react = { o, level, stars: J.stars, t: 0, word: R.word, col: R.col, line, who: cu.name, tip: o.tip, cold: J.cold, pay: J.stars ? { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 } : null }; S.focus = 'pass'; }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; const p = plates[r.o.seat];
    if (r.pay) { S.pay = r.pay; payProps(r.pay); SFX.register(); }
    else { // sent back: the plate comes home, start it again
      r.o.st = 'wait'; r.o.got = { cakes: [], eggs: [], bacon: [], hash: null, coffee: null }; r.o.ready = false; r.o.pat = Math.max(10, r.o.pat - 10); p.g.position.set(K.seats[p.seat].plate.x, K.passY, K.passZ); p.hot = false; p.heat = 1; rebuildPlate(p); } }
  const REG = V3(K.register.x, T, K.register.z + 0.12), RG = registerKit(ST, REG, { open: 'ALL DAY  ·  OPEN' }), { DISH: CASH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; coinDrop(v); regDraw(P); SFX.coin(v); buzz(8); if (P.given === P.owed) payDone(); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; tone(220, 0.2, 0.04, 'sawtooth'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone() { const P = S.pay, o = orders.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); if (!o) return; S.streak = o.stars === 3 ? (S.streak || 0) + 1 : 0; const bonus = S.streak >= 2 ? Math.min(4, S.streak - 1) : 0; o.tip += bonus; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars);
    flash((bonus ? 'HOT STREAK ×' + S.streak + ' · ' : '') + '★'.repeat(o.stars) + ' +' + pts + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : ''), '#ffd23a', 2); SFX.register(); SFX.good(o.stars); o.st = 'eat'; o.t = 0; if (DM.on) DM.served++; }

  // ---------- INPUT ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), gPlane = new THREE.Plane(V3(0, 1, 0), -GT), hit = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onGrid = (x, y) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.ray.intersectPlane(gPlane, hit) ? hit.clone() : null; };
  const pxScale = () => clamp(Math.min(CW(), CHh()) / 420, 0.85, 1.6);
  function pickScreen(x, y, list) { let best = null, bd = 1e9; for (const t of list) { const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * pxScale() && d < bd) { bd = d; best = t; } } return best; }
  const itemPos = it => V3(it.x - (it.kind === 'bacon' ? it.len / 2 : 0), GT + 0.02, it.z);
  function targets() { const t = [];
    t.push({ kind: 'pot', p: V3(CF.pot.x, T + 0.12, CF.pot.z), r: 38 }, { kind: 'cream', p: V3(CF.cream.x, T + 0.06, CF.cream.z), r: 34 }, { kind: 'sugar', p: V3(CF.sugar.x, T + 0.05, CF.sugar.z), r: 34 }, { kind: 'mug', p: V3(CF.mug.x, T + 0.08, CF.mug.z), r: 32 });
    plates.forEach((p, i) => p.o && p.o.st === 'wait' && t.push({ kind: 'plate', i, p: V3(p.g.position.x, K.passY + 0.05, p.g.position.z), r: 48 }));
    items.forEach(it => !it.laying && !it.pouring && t.push({ kind: 'item', it, p: itemPos(it), r: it.kind === 'bacon' ? 30 : it.kind === 'hash' ? 46 : 30 })); return t; }
  const zoneOf = p => { for (const [k, z] of Object.entries(K.zones)) if (Math.abs(p.x - z.x) <= K.zoneW / 2 && Math.abs(p.z - z.z) <= 0.43) return k; return null; };
  const STN = { pot: 'coffee', cream: 'coffee', sugar: 'coffee', mug: 'coffee', plate: 'pass' };
  function setFocus(id) { if (S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }
  function onDown(e) { audio.init && audio.init(); startMusic(); S.lastInput = performance.now(); if (S.mode !== 'shift' || S.pay || S.react || DM.on || S.G) return; const { x, y } = local(e); e.preventDefault();
    const G = { x0: x, y0: y, x, y, t0: performance.now(), path: 0, id: e.pointerId }; let tg = pickScreen(x, y, targets());
    if (tg && tg.kind === 'item' && tg.it.kind === 'bacon') { const gp = onGrid(x, y), free = gp && K.lanes.find(l => Math.abs(gp.z - l.z) < 0.07 && !items.some(i => i.kind === 'bacon' && i.lane === l)); if (free && gp.x > free.x0 - 0.2) tg = null; }
    if (tg) { G.kind = tg.kind; G.tg = tg; if (tg.kind === 'pot' || tg.kind === 'cream') { if (tg.kind === 'cream' && mug.fill < 0.2) { flash('COFFEE FIRST · HOLD THE POT', '#ffffff', 1); return; } S.hold = tg.kind; } if (tg.kind === 'sugar') addSugar(); S.G = G; S.tapStation = STN[tg.kind] || (tg.it ? KIND[tg.it.kind] : null); return; }
    const gp = onGrid(x, y), zn = gp && zoneOf(gp); if (!zn) return; S.tapStation = zn; G.kind = zn;
    if (!dayOK(zn)) { flash(DISH[zn].name + ' FROM DAY ' + DISH[zn].day, '#ffffff', 1.1); return; }
    if (zn === 'cakes') { const sp = K.cakeSpots.filter(s => !items.some(i => i.spot === s)).sort((a, b) => Math.hypot(a.x - gp.x, a.z - gp.z) - Math.hypot(b.x - gp.x, b.z - gp.z))[0]; if (!sp) { flash('ALL FOUR RINGS ARE FULL', '#ffffff', 1); return; } if (Math.hypot(sp.x - gp.x, sp.z - gp.z) > 0.24) return; startPour(sp); }
    else if (zn === 'eggs') { const near = items.find(i => i.kind === 'egg' && Math.hypot(i.x - gp.x, i.z - gp.z) < 0.12); if (!near) crackEgg(gp.x, gp.z); G.last = gp; }
    else if (zn === 'bacon') { const lane = K.lanes.filter(l => !items.some(i => i.kind === 'bacon' && i.lane === l)).sort((a, b) => Math.abs(a.z - gp.z) - Math.abs(b.z - gp.z))[0]; if (!lane) { flash('ALL LANES ARE FULL', '#ffffff', 1); return; } if (Math.abs(lane.z - gp.z) > 0.12) return; startLay(lane); layTo(S.lay, gp.x, gp.z); }
    else if (zn === 'hash') { if (Math.hypot(gp.x - HR.x, gp.z - HR.z) > HR.r + 0.08) return; let h = items.find(i => i.kind === 'hash'); if (h && h.flipped) { G.kind = 'item'; G.tg = { kind: 'item', it: h }; S.G = G; return; } if (!h) h = startHash(); G.hash = h; h.spreading = true; spread(h, gp.x, gp.z); }
    S.G = G; }
  function onMove(e) { const G = S.G; if (!G || (G.id != null && e.pointerId !== G.id)) return; const { x, y } = local(e); G.path += Math.hypot(x - G.x, y - G.y); G.x = x; G.y = y; const gp = onGrid(x, y);
    if (G.kind === 'cakes' && S.pour) { if (Math.hypot(x - G.x0, y - G.y0) > 28) S.pour.wob += 0.05; return; }
    if (G.kind === 'bacon' && S.lay && gp) { layTo(S.lay, gp.x, gp.z); return; }
    if (G.kind === 'hash' && G.hash && gp) { spread(G.hash, gp.x, gp.z); return; }
    if ((G.kind === 'eggs' || (G.kind === 'item' && G.tg.it.kind === 'egg')) && gp) { if (G.last && G.path > 40) stirAt(gp.x, gp.z, Math.hypot(gp.x - G.last.x, gp.z - G.last.z)); G.last = gp; return; }
    if (G.kind === 'item' && !G.carry) { const it = G.tg.it, flick = performance.now() - G.t0 < 650 && G.y0 - y > 30; if (G.path > 22 && !flick && (it.kind === 'cake' || it.kind === 'hash') && it.flipped) { G.carry = it; } if (G.path > 22 && it.kind === 'hash' && !it.flipped && gp) spread(it, gp.x, gp.z); }
    if (G.kind === 'mug' && G.path > 22) G.carryMug = true;
    if (G.carry && gp) G.carry.g.position.set(gp.x + (G.carry.kind === 'bacon' ? G.carry.len / 2 : 0), GT + 0.12, gp.z);
    if (G.carryMug && gp) mug.g.position.set(gp.x, T + 0.15, gp.z); }
  function plateUnder(x, y) { let best = -1, bd = 1e9; plates.forEach((p, i) => { if (!p.o) return; const s = scr(V3(p.g.position.x, K.passY, p.g.position.z)), d = Math.hypot(s.x - x, s.y - y); if (d < 90 * pxScale() && d < bd) { bd = d; best = i; } }); return best; }
  function onUp(e) { const G = S.G; if (!G || (G.id != null && e.pointerId !== G.id)) return; S.G = null; S.hold = null; const { x, y } = local(e), dt = performance.now() - G.t0, dx = x - G.x0, dy = y - G.y0, flick = dt < 650 && dy < -32 && Math.abs(dy) > Math.abs(dx) * 0.8, tap = G.path < 16 && dt < 600;
    if (S.focus === 'all' && S.tapStation) setFocus(S.tapStation); S.tapStation = null;
    if (G.kind === 'cakes') { stopPour(); return; }
    if (G.kind === 'bacon') { stopLay(); return; }
    if (G.kind === 'hash') { const h = G.hash; if (h) { h.spreading = false; if (!h.cooking && h.cover > 0.08) { h.cooking = true; SFX.slap(panX(HR.x)); } if (h.cover < 0.5) flash('SPREAD IT ALL THE WAY TO THE RING', '#ffffff', 1.1); } return; }
    if (G.kind === 'mug') { if (G.carryMug) { const pi = plateUnder(x, y); mug.g.position.set(CF.mug.x, T + 0.012, CF.mug.z); if (pi >= 0) plateMug(pi); } else if (tap) plateMug(); return; }
    if (G.kind === 'plate') { if (flick || tap) servePlate(plates[G.tg.i]); return; }
    if (G.kind === 'item') { const it = G.tg.it; if (G.carry) { const pi = plateUnder(x, y); it.g.position.set(it.x, GT, it.z); if (pi >= 0) plateItem(it, pi); return; }
      if (flick && (it.kind === 'cake' || it.kind === 'hash' || it.kind === 'egg') && !it.flipped) { flip(it, true); return; }
      if (tap) tapItem(it); return; } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- WALK MODE: Ben in the diner (standard Game HUD drives this) ----------
  const WK = { sx: 0, sy: 0, yaw: Math.PI, pitch: 0.5, dist: 5.6, dragT: 0, eye0: null, pov: false, hop: 0, wave: 0, near: null };
  const TALK = {
    sunny: { name: 'Sunny', role: 'Runs the grill', lines: ['THERE you are.', 'You are late for your shift and we are super busy, get to grilling!'], play: { label: "I'm on it boss!", yes: ['Good man. Apron is on the hook, the hook is behind you.', 'Four tickets up. Do not let the hash go.'] },
      topics: [{ label: 'Remind me how to cook breakfast again???', keeps: true, replies: ['...You are joking.', { who: 'player', text: 'Mostly.' }, 'Ticket comes up, you read it, you pour what it says onto the flat-top. Pancakes go on first because they take the longest.', 'Then you WATCH it. When it bubbles all over and the edge goes dull, that is the moment. Flip it then, not before it and not after it.', 'And you send the plate while it is hot. A cold plate is a plate that comes back.', { who: 'player', text: 'That is it?' }, 'That is the whole of it and I have watched grown men cry over it. Go on.'] },
        { label: "I don't work here, sorry.", replies: ['Everybody who has ever stood there has said that.', 'Apron is on the hook when you change your mind. We are open all day. That is the entire idea.'] }] },
    dottie: { name: 'Dottie', role: 'Front of house', lines: ['Evening! Just the one?', 'Sit anywhere you can find, hon — we are slammed and we are two girls down.'],
      topics: [{ label: 'Where can I sit?', replies: ['One stool. Far end of the counter, under the bell.', 'That is the whole of what I have got and I have had four people ask me since midnight.'] }, { label: 'Are you hiring?', replies: ['Honey, we are ALWAYS hiring. That card has been in that window since the spring.', 'Can you carry four plates? Nobody can carry four plates. June can carry four plates and June is one woman.'] }, { label: 'Busy night.', replies: ['It is a Tuesday. They are all like this.', 'Go on, sit down before somebody takes it.'] }] },
    june: { name: 'June', role: 'Works the counter', lines: [{ who: 'player', text: 'Table for one?' }, 'Sit anywhere, hon. Coffee is on.', 'You want my advice, do not go poking round that gate up the road. The men out there do not wear names.', { who: 'player', text: 'What is behind it?' }, 'Nothing. That is the official position and I would not go arguing with it in daylight.'],
      topics: [{ label: 'Tell me about the men from the gate.', replies: ['In on a Thursday, four of them, same booth, and I could not tell you one thing about a single face.', 'They order. Every time. Full breakfast, four of them, and it goes back cold and untouched and they pay in cash and they tip properly.', { who: 'player', text: 'Nobody eats?' }, 'Nobody eats, hon. Twenty-six years I have been carrying plates and you learn to read a table, and that table reads like four people doing an impression of four people.'] },
        { label: 'What is really behind that fence?', replies: ['Officially nothing, and I said I would not argue with that in daylight, and it is dark now, so.', 'There is a ramp. You can see the top of it from the ridge behind the gas station. A ramp goes down, and a thing you build a ramp down to is a thing that is underneath.'] },
        { label: 'Coffee, then.', replies: ['Sit anywhere. And listen — if you are going up that road tonight, eat something first. That is not folklore, that is a waitress.'] }] },
    marguerite: { name: 'Marguerite', role: 'Eighty-one · the crossword', lines: ['Six letters. A thing that is always coming and never arrives.', '...Do not tell me. I will get it.'] },
    bobby: { name: 'Bobby', role: 'Nine. Should not be here.', lines: ['My mom says I can stay up because it is not a school night.', '...It is a school night.'] },
    faye: { name: 'Faye', role: 'In when the picture let out', lines: ['We came in when the picture let out.', 'That was three hours ago and I have not finished telling him about it.'] },
    duane: { name: 'Duane', role: 'Here since nine', lines: ['She came in when the picture let out.', 'I got here at nine. I am fine. I am having a lovely time.'] },
    theMan: { name: 'The Man', role: 'The plate has not been touched', lines: ['...', 'We are waiting for our order.'] },
    otherMan: { name: 'The Other Man', role: 'Has not blinked', lines: ['We are waiting for our order.', 'It is a full breakfast. Four of them. It is coming.'] } };
  const TALKERS = () => [...Object.entries(STAFF).map(([k, s]) => ({ key: k, f: s.f, r: k === 'sunny' ? 4.4 : 1.7 })), ...REGULARS.map(r => ({ key: r.key, f: r.f, r: 1.7 }))];
  const D = { on: null };
  function openTalk(key) { const T0 = TALK[key]; if (!T0) return; const q = T0.lines.map(l => typeof l === 'string' ? { who: 'npc', text: l } : l); D.on = { key, T: T0, q, i: 0, choices: null, after: null, asked: {} }; const tk = TALKERS().find(t => t.key === key); if (tk) { tk.f.userData.talking = true; walker.rotation.y = Math.atan2(tk.f.position.x - walker.position.x, tk.f.position.z - walker.position.z); } tone(880, 0.06, 0.03); }
  function showChoices() { const d = D.on, T0 = d.T; const ch = [...(T0.play ? [{ label: T0.play.label, play: true }] : []), ...(T0.topics || []).map((t, i) => ({ label: t.label, topic: i, asked: !!d.asked[i] })), { label: T0.play ? 'Maybe later.' : 'See you.', bye: true }]; if (ch.length === 1) return closeTalk(); d.choices = ch; }
  function closeTalk() { if (!D.on) return; const tk = TALKERS().find(t => t.key === D.on.key); if (tk) tk.f.userData.talking = false; const after = D.on.after; D.on = null; if (after) after(); }
  function nextLine() { const d = D.on; if (!d || d.choices) return; d.i++; SFX.talk(); if (d.i >= d.q.length) { if (d.after) return closeTalk(); if (d.T.topics || d.T.play) { d.i = d.q.length - 1; showChoices(); } else closeTalk(); } }
  function choose(n) { const d = D.on; if (!d || !d.choices) return; const c = d.choices[n]; if (!c) return; if (c.bye) return closeTalk(); d.choices = null; d.i = 0;
    if (c.play) { d.q = [{ who: 'player', text: c.label }, ...d.T.play.yes.map(t => ({ who: 'npc', text: t }))]; d.after = () => { save.setFlag('grillOn'); startShift(); }; return; }
    const tp = d.T.topics[c.topic]; d.asked[c.topic] = true; d.q = [{ who: 'player', text: c.label }, ...tp.replies.map(t => typeof t === 'string' ? { who: 'npc', text: t } : t)]; }
  function dialogHud() { const d = D.on; if (!d) return null; const l = d.q[Math.min(d.i, d.q.length - 1)]; return { name: l.who === 'player' ? CAST.player.name.charAt(0) + CAST.player.name.slice(1).toLowerCase() : d.T.name, role: l.who === 'player' ? 'You' : d.T.role, text: l.text, choices: d.choices ? d.choices.map(c => ({ text: c.label, asked: c.asked, bye: c.bye })) : null, step: d.i + 1, total: d.q.length, more: false, required: false }; }
  const SPOTS = () => [{ key: 'hook', x: K.hook.x, z: K.hook.z, r: 1.3, text: 'Put on the apron · start a shift' }, { key: 'door', x: K.door.x, z: K.door.z + 0.2, r: 1.0, text: opts.onExit ? 'Leave · ' + (opts.exitLabel || 'The Mojave') : 'Leave · back to the card' }, { key: 'juke', x: K.juke.x - 0.6, z: K.juke.z, r: 1.2, text: 'Jukebox · ' + (MUS.want ? 'turn it down' : 'play the morning shuffle') }];
  function nearest() { const p = walker.position; let best = null, bd = 1e9; for (const t of TALKERS()) { const d = Math.hypot(t.f.position.x - p.x, t.f.position.z - p.z); if (d < t.r && d < bd) { bd = d; best = { key: t.key, text: 'Talk to ' + TALK[t.key].name }; } } for (const s of SPOTS()) { const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < s.r && d < bd) { bd = d; best = { key: s.key, text: s.text }; } } return best; }
  function talk() { if (S.mode !== 'walk') return; if (D.on) { if (!D.on.choices) nextLine(); return; } const n = WK.near; if (!n) return; if (n.key === 'hook') { save.setFlag('grillOn'); flash('APRON ON', '#22c55e', 1); startShift(); return; } if (n.key === 'door') { if (opts.onExit) { SFX.door(); SFX.music(null); opts.onExit(); } else toIntro(); return; } if (n.key === 'juke') { MUS.want ? stopMusic(true) : startMusic(true); return; } openTalk(n.key); }
  const PR = 0.3, blocked = (x, z) => { if (x < -K.W / 2 + PR || x > K.W / 2 - PR || z < -K.D / 2 + PR || z > K.D / 2 - PR) return true; for (const [a, b, c, d] of K.colliders) if (x > a - PR && x < b + PR && z > c - PR && z < d + PR) return true;
    for (const sx of K.stoolX) if (Math.hypot(x - sx, z - K.stoolZ) < 0.22 + PR) return true; for (const t of TALKERS()) if (t.f.visible && Math.hypot(x - t.f.position.x, z - t.f.position.z) < 0.32 + PR) return true; for (const o of orders) if (o.f.visible && Math.hypot(x - o.f.position.x, z - o.f.position.z) < 0.6) return true; return false; };
  function enterWalk(at) { S.mode = 'walk'; S.done = null; D.on = null; walker.visible = true; ben.visible = false; sunny.visible = true; const p = at || { x: K.door.x, z: K.door.z - 0.5, f: Math.PI }; walker.position.set(p.x, 0, p.z); walker.rotation.y = p.f; WK.yaw = p.f; WK.sx = WK.sy = 0; S.focus = 'all';
    orders.forEach(o => { o.f.visible = false; }); orders.length = 0; plates.forEach(p => { p.o = null; p.g.visible = false; rebuildPlate(p); }); clearGriddle(); placeWalkCam(true); }
  function walkStep(dt) { const p = walker.position, mv = Math.hypot(WK.sx, WK.sy) > 0.12 && !D.on; let sp = 0;
    if (mv) { const fx = Math.sin(WK.yaw), fz = Math.cos(WK.yaw), rx = -Math.cos(WK.yaw), rz = Math.sin(WK.yaw), vx = fx * WK.sy + rx * WK.sx, vz = fz * WK.sy + rz * WK.sx, l = Math.hypot(vx, vz), spd = 3.0 * Math.min(1, l);
      const nx = p.x + vx / l * spd * dt, nz = p.z + vz / l * spd * dt, ox = p.x, oz = p.z; if (!blocked(nx, p.z)) p.x = nx; if (!blocked(p.x, nz)) p.z = nz; WK.stepD = (WK.stepD || 0) + Math.hypot(p.x - ox, p.z - oz); if (WK.stepD > 0.62) { WK.stepD = 0; SFX.step(); } const want = Math.atan2(vx, vz); let df = ((want - walker.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI; walker.rotation.y += df * Math.min(1, dt * 12); sp = spd;
      if (WK.dragT <= 0 && WK.sy > 0.3) { let dy = ((walker.rotation.y - WK.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; WK.yaw += dy * Math.min(1, dt * 1.6); } }
    if (D.on && WK.dragT <= 0) { let dy = ((walker.rotation.y - WK.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI; WK.yaw += dy * Math.min(1, dt * 3); }
    WK.dragT -= dt; if (WK.hop > 0) { WK.hop = Math.max(0, WK.hop - dt * 2.4); } walker.position.y = Math.sin((1 - WK.hop) * Math.PI) * (WK.hop > 0 ? 0.45 : 0);
    kit.animFox(walker, dt, sp, WK.hop > 0); if (WK.wave > 0) { WK.wave -= dt; const a = walker.userData.P.arms[0]; a.rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 8) * 0.32); }
    WK.near = D.on ? null : nearest(); placeWalkCam(false, dt); }
  function placeWalkCam(snap, dt = 1) { const p = walker.position, head = V3(p.x + Math.sin(WK.yaw) * 1.4, 1.2, p.z + Math.cos(WK.yaw) * 1.4);
    if (WK.pov) { const f = walker.rotation.y; camera.position.set(p.x + Math.sin(f) * 0.25, 1.62, p.z + Math.cos(f) * 0.25); CAM.look.set(p.x + Math.sin(f) * 3, 1.5 - WK.pitch * 2 + 0.7, p.z + Math.cos(f) * 3); walker.visible = false; return; } walker.visible = true;
    const d = WK.dist, cp = V3(p.x - Math.sin(WK.yaw) * Math.cos(WK.pitch) * d, 1.35 + Math.sin(WK.pitch) * d, p.z - Math.cos(WK.yaw) * Math.cos(WK.pitch) * d);
    cp.x = clamp(cp.x, -K.W / 2 + 0.25, K.W / 2 - 0.25); const cz = clamp(cp.z, -K.D / 2 + 0.25, K.D / 2 - 0.3), cx = cp.x, lost = Math.abs(cz - cp.z) + Math.abs(cp.x - clamp(cp.x, -K.W / 2 + 0.25, K.W / 2 - 0.25)); cp.z = cz; cp.y = Math.min(cp.y + lost * 0.5, K.H - 0.3);
    if (snap) { camera.position.copy(cp); CAM.look.copy(head); } else { camera.position.lerp(cp, Math.min(1, dt * 6)); CAM.look.lerp(head, Math.min(1, dt * 8)); } }
  function clearGriddle() { items.slice().forEach(killItem); S.pour = null; S.lay = null; S.G = null; S.hold = null; stream.visible = false; freshMug(); pot.position.set(CF.pot.x, T + 0.02, CF.pot.z); pot.rotation.set(0, 0, 0); creamer.rotation.set(0, 0, 0); }

  // ---------- MUSIC: the 2D game's bright morning shuffle (walking bass, pentatonic top line, brushed pulse) ----------
  const MUS = { want: true };
  function startMusic(user) { if (user) MUS.want = true; SFX.musicWanted(MUS.want); }
  function stopMusic(user) { if (user) MUS.want = false; SFX.musicWanted(MUS.want); }
  function soundTick(dt) { if (!audio.ctx) return; if (audio.wind && audio.wind.gain.value > 0.001) audio.wind.gain.value = 0; const shift = S.mode === 'shift' || S.mode === 'glide'; SFX.music(audio.muted ? null : shift ? 'rush' : 'shuffle'); SFX.setRush(shift && DINER.shift - S.t < 30);
    if (S.mode === 'walk') { const d = Math.hypot(walker.position.x - K.juke.x, walker.position.z - K.juke.z); SFX.setMusicLevel(clamp(1.3 - d / 9, 0.35, 1)); } else SFX.setMusicLevel(shift ? 0.75 : 0.85);
    SFX.tick(dt, { sizzle: shift ? items.filter(i => !i.pouring && !i.laying && (i.kind !== 'hash' || i.cooking)).length * 0.32 : S.mode === 'walk' ? 0.18 : 0.08, room: true }); }
  // ---------- FLOW ----------
  function startShift() { if (!['intro', 'done', 'walk'].includes(S.mode)) return; audio.init && audio.init(); startMusic(); D.on = null; S.payOut = null; payProps(null); S.react = null; S.pay = null; if (!S.demo && DM.on) demoStop();
    Object.assign(S, { mode: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, streak: 0, starList: [], next: 2.2, done: null, focus: 'all' }); orders.forEach(o => o.f.visible = false); orders.length = 0; clearGriddle();
    plates.forEach(p => { p.o = null; p.g.visible = false; p.hot = false; p.heat = 1; p.slide = null; p.g.position.set(K.seats[p.seat].plate.x, K.passY, K.passZ); rebuildPlate(p); });
    walker.visible = false; ben.visible = false; sunny.visible = false; setUniform(!!save.flag(UNIFORM)); glideTo(workShot('all'), 1.6); S.glideT = 1.65;
    say(S.day <= 1 ? 'SUNNY: "Pancakes and coffee tonight. Hold on a ring to pour, flick it when it bubbles. Go!"' : 'SUNNY: "Four tickets up. Do not let the hash go."', 6); }
  function endShift() { S.mode = 'done'; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 3 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false, unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (S.served >= 2 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...Object.entries(DISH).filter(([, v]) => v.day === nd).map(([, v]) => v.name), ...Object.values(EGG).filter(e => e.day === nd).map(e => 'EGGS ' + e.name)]; }
      if (!save.flag(UNIFORM) && S.served >= 2) { save.setFlag(UNIFORM); setUniform(true); unlock.push('BREAKFAST ALL DAY UNIFORM (paper hat, towel, egg tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold };
    if (newDay) S.day += 1; clearGriddle(); sunny.visible = true; ben.visible = true; ben.position.set(-0.9, 0, K.stoolZ + 1.0); ben.rotation.y = 0.3; glideTo(wideShot(), 1.4);
    say(eod ? 'SUNNY: "EMPLOYEE OF THE DAY. Do not let it go to your head."' : S.served >= 2 ? 'SUNNY: "Good shift. Same time tomorrow? We are open all day."' : 'SUNNY: "Rough one. Grown men cry over it. Tomorrow."', 6); orders.forEach(o => { if (o.st !== 'leave') { o.st = 'leave'; o.t = 0; } }); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); tone(1320, 0.1, 0.05); if (S.done) S.done.gold = save.data.gold; return true; }
  function toIntro() { if (DM.on) return demoStop(); S.mode = 'intro'; S.done = null; D.on = null; walker.visible = false; ben.visible = true; sunny.visible = true; setUniform(true); clearGriddle(); orders.forEach(o => o.f.visible = false); orders.length = 0; plates.forEach(p => { p.o = null; p.g.visible = false; });
    ben.position.set(-0.9, 0, K.stoolZ + 1.0); ben.rotation.y = 0.3; glideTo(wideShot(), 1); }

  // ---------- NEXT-STEP HINT: a bobbing arrow + pulsing ring over the next thing to do ----------
  const RINGS = hintRings(ST); let HINT = null, hintT = 0;
  const P3 = (x, z, y = GT) => V3(x, y, z), H = (p, station, text, r = 0.14) => ({ p, station, text, r });
  function nextHint() { if (S.mode !== 'shift' || S.pay || S.react) return null; const W = urgent(waiting());
    const burnt = items.find(i => isBurnt(i)); if (burnt) return H(itemPos(burnt), KIND[burnt.kind], 'BURNT · TAP IT TO BIN IT');
    const fc = items.find(i => i.kind === 'cake' && !i.pouring && !i.flipped && !i.flipT && i.d >= FLIP[0]); if (fc) return H(itemPos(fc), 'cakes', 'BUBBLES ALL OVER · FLICK IT UP TO FLIP', 0.16);
    const fh = items.find(i => i.kind === 'hash' && i.cooking && !i.flipped && !i.flipT && i.d >= 0.4); if (fh) return H(itemPos(fh), 'hash', 'GOLDEN EDGES · FLICK THE HASH UP TO FLIP', 0.26);
    const rp = plates.find(p => p.o && p.o.st === 'wait' && complete(p.o)); if (rp) return H(P3(rp.g.position.x, rp.g.position.z, K.passY), 'pass', 'ORDER UP · FLICK THE PLATE TO ' + CUSTOMERS[rp.o.ci].name, 0.24);
    if (!W.length) return null;
    const ok = (k, c) => W.some(o => need(o, k) && (!c || c(o)));
    const gc = items.find(i => i.kind === 'cake' && i.flipped && !i.flipT && i.d2 >= CAKE_B[0] && i.d2 <= CAKE_B[1]); if (gc && ok('cakes')) return H(itemPos(gc), 'cakes', 'GOLDEN UNDERNEATH · TAP TO PLATE IT');
    for (const o of W) { if (!need(o, 'eggs')) continue; const E = EGG[o.need.eggs]; const ge = items.find(i => i.kind === 'egg' && eggFits(i, o.need.eggs) && yolkOf(i.d) === E.dn); if (ge) return H(itemPos(ge), 'eggs', E.name + ' · ' + YOLK_NAME[E.dn] + ' · TAP TO PLATE'); if (E.flip) { const fe = items.find(i => i.kind === 'egg' && !i.flipped && i.stir < 0.9 && i.d >= 0.2); if (fe) return H(itemPos(fe), 'eggs', E.name + ' · FLICK THE EGG UP TO FLIP IT'); } if (E.scr) { const se = items.find(i => i.kind === 'egg' && i.stir < 0.9 && !i.flipped); if (se) return H(itemPos(se), 'eggs', 'SCRAMBLED · STIR THE EGGS IN CIRCLES'); } }
    const gb = items.find(i => i.kind === 'bacon' && !i.laying && i.d >= BACON[0] && i.d <= BACON[1]); if (gb && ok('bacon')) return H(itemPos(gb), 'bacon', 'CRISP · TAP THE BACON TO PLATE IT');
    for (const o of W) { if (!need(o, 'hash')) continue; const h = items.find(i => i.kind === 'hash' && i.flipped && zoneAt(Z_HASH_B, i.d2) === o.need.hash); if (h) return H(itemPos(h), 'hash', SHADE[o.need.hash].name + ' · TAP THE HASH TO PLATE IT', 0.26); }
    const o = W[0], onG = k => items.filter(i => i.kind === k && !isBurnt(i)).length;
    for (const o2 of W) { if (need(o2, 'cakes') > onG('cake') - W.filter(q => q !== o2 && q.pat < o2.pat).reduce((s, q) => s + need(q, 'cakes'), 0) && dayOK('cakes')) { const sp = K.cakeSpots.find(s => !items.some(i => i.spot === s)); if (sp) return H(P3(sp.x, sp.z), 'cakes', 'HOLD ON A DASHED RING TO POUR · LET GO AT THE RING', 0.16); } }
    if (W.some(q => need(q, 'hash')) && !items.some(i => i.kind === 'hash')) return H(P3(HR.x, HR.z), 'hash', 'SCRIBBLE INSIDE THE RING TO SPREAD THE SHREDS', 0.26);
    const hs = items.find(i => i.kind === 'hash' && !i.cooking); if (hs) return H(P3(HR.x, HR.z), 'hash', 'KEEP SCRIBBLING · LET GO TO COOK', 0.26);
    const needB = W.reduce((s, q) => s + need(q, 'bacon'), 0); if (needB > onG('bacon')) { const ln = K.lanes.find(l => !items.some(i => i.lane === l)); if (ln) return H(P3(ln.x0 - 0.1, ln.z), 'bacon', 'DRAG ALONG A LANE TO LAY A STRIP', 0.1); }
    const needE = W.reduce((s, q) => s + need(q, 'eggs'), 0); if (needE > onG('egg')) return H(P3(K.zones.eggs.x, K.zones.eggs.z), 'eggs', 'TAP THE GRIDDLE TO CRACK AN EGG', 0.2);
    const wc = W.find(q => need(q, 'coffee')); if (wc) { const w = wc.need.coffee; if (mug.fill < 0.7) return H(P3(CF.pot.x, CF.pot.z, T), 'coffee', 'HOLD THE POT · POUR TO THE YELLOW LINE', 0.12); if (mug.cream < CREAM[w.cream].v - 0.08) return H(P3(CF.cream.x, CF.cream.z, T), 'coffee', 'HOLD THE CREAMER · ' + CREAM[w.cream].name, 0.1); if (mug.sugars < w.sugars) return H(P3(CF.sugar.x, CF.sugar.z, T), 'coffee', 'TAP THE SUGAR · ' + mug.sugars + ' / ' + w.sugars, 0.1); return H(P3(CF.mug.x, CF.mug.z, T), 'coffee', 'TAP THE MUG · IT GOES ON ' + CUSTOMERS[wc.ci].name + "'S PLATE", 0.1); }
    return H(P3(o.f.position.x, o.f.position.z, 0.02), 'all', 'COOKING · WATCH THE METERS', 0.4); }
  function autoFollow() { if (DM.on || !HINT || !HINT.station || HINT.station === 'all' || S.focus === 'all' || S.focus === HINT.station || S.G || S.react || S.pay) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 1.1 && performance.now() - (S.userFocusT || 0) > 2600) S.focus = HINT.station; }

  // ---------- DEMO: an autopilot works two tickets with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, task: null, day0: 1, hint: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 30; scene.add(hand);
  const handTo = (p, f) => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.5); if (f) S.focus = f; DM.hint = { p: p.clone(), r: 0.14 }; };
  const cap = (id, key, text) => { DM.cap = text; DM.key = key; if (DM.seen[id]) return 0; DM.seen[id] = true; return 1.1; };
  function demoAct() { if (S.pay) { const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); const w = cap('pay', 'COINS', 'THEY PAID ' + P.paid + 'g FOR ' + P.total + 'g · TAP COINS FOR ' + P.owed + 'g CHANGE'); if (w) return w; giveCoin(v); return 0.8; }
    const W = urgent(waiting());
    const rp = plates.find(p => p.o && p.o.st === 'wait' && complete(p.o)); if (rp) { const w = cap('serve', 'FLICK', 'ORDER UP! FLICK THE PLATE DOWN THE COUNTER'); handTo(P3(rp.g.position.x, rp.g.position.z, K.passY + 0.1), 'pass'); if (w) return w; servePlate(rp); return 1; }
    const bu = items.find(i => isBurnt(i)); if (bu) { handTo(itemPos(bu), KIND[bu.kind]); const w = cap('bin', 'TAP', 'BURNT? TAP IT AND IT GOES IN THE BIN'); if (w) return w; tapItem(bu); return 0.6; }
    for (const o of W) if (need(o, 'eggs')) { const E = EGG[o.need.eggs], e = items.find(i => i.kind === 'egg' && eggFits(i, o.need.eggs) && (yolkOf(i.d) === E.dn || i.d > YOLK[E.dn][1])); if (e) { handTo(itemPos(e), 'eggs'); const w = cap('eplate', 'TAP', 'YOLK STILL RUNNY: TAP TO PLATE BOTH EGGS'); if (w) return w; plateItem(e); return 0.7; } }
    const fc = items.find(i => i.kind === 'cake' && !i.pouring && !i.flipped && !i.flipT && i.d >= 0.6); if (fc) { handTo(itemPos(fc), 'cakes'); const w = cap('flip', 'FLICK', 'BUBBLES ALL OVER, EDGE GOES DULL: FLICK IT UP TO FLIP'); if (w) return w; flip(fc, true); return 0.7; }
    for (const o of W) if (need(o, 'eggs') && EGG[o.need.eggs].flip) { const e = items.find(i => i.kind === 'egg' && !i.flipped && i.d >= 0.24); if (e) { handTo(itemPos(e), 'eggs'); const w = cap('eflip', 'FLICK', 'OVER EASY MEANS FLIP IT: FLICK THE EGG UP'); if (w) return w; flip(e, true); return 0.7; } }
    const gc = items.find(i => i.kind === 'cake' && i.flipped && !i.flipT && i.d2 >= 0.55); if (gc) { handTo(itemPos(gc), 'cakes'); const w = cap('plate', 'TAP', 'GOLDEN UNDERNEATH: TAP IT AND IT GOES ON THE PLATE'); if (w) return w; plateItem(gc); return 0.6; }
    for (const o of W) if (need(o, 'eggs')) { const e = items.find(i => i.kind === 'egg' && eggFits(i, o.need.eggs) && yolkOf(i.d) === EGG[o.need.eggs].dn); if (e) { handTo(itemPos(e), 'eggs'); const w = cap('eplate', 'TAP', 'YOLK STILL RUNNY: TAP TO PLATE BOTH EGGS'); if (w) return w; plateItem(e); return 0.7; } }
    const gb = items.find(i => i.kind === 'bacon' && !i.laying && i.d >= 0.7); if (gb && W.some(o => need(o, 'bacon'))) { handTo(itemPos(gb), 'bacon'); const w = cap('bplate', 'TAP', 'CRISP: TAP THE BACON'); if (w) return w; plateItem(gb); return 0.7; }
    const onG = k => items.filter(i => i.kind === k).length;
    if (W.reduce((s, o) => s + need(o, 'cakes'), 0) > onG('cake')) { const sp = K.cakeSpots.find(s => !items.some(i => i.spot === s)); if (sp) { handTo(P3(sp.x, sp.z), 'cakes'); const w = cap('pour', 'HOLD', 'HOLD ON A DASHED RING TO POUR. LET GO WHEN IT FILLS THE RING'); if (w) return w; const it = startPour(sp); DM.task = () => { if (it.r >= CAKE_R - 0.004) { stopPour(); return true; } }; return 0.3; } }
    if (W.reduce((s, o) => s + need(o, 'bacon'), 0) > onG('bacon')) { const ln = K.lanes.find(l => !items.some(i => i.lane === l)); if (ln) { handTo(P3(ln.x0, ln.z), 'bacon'); const w = cap('lay', 'DRAG', 'DRAG ALONG A LANE, END TO END, TO LAY A STRIP'); if (w) return w; const it = startLay(ln); let x = ln.x0; DM.task = dt => { x -= dt * 1.1; layTo(it, x, ln.z); hand.position.set(ln.x0 - it.len, GT + 0.05, ln.z); if (x <= ln.x1) { stopLay(); return true; } }; return 0.3; } }
    if (W.reduce((s, o) => s + need(o, 'eggs'), 0) > onG('egg')) { const ez = K.eggSpots.find(s => !items.some(i => i.kind === 'egg' && Math.hypot(i.x - s.x, i.z - s.z) < 0.1)); if (ez) { handTo(P3(ez.x, ez.z), 'eggs'); const w = cap('crack', 'TAP', 'TAP THE GRIDDLE TO CRACK AN EGG'); if (w) return w; crackEgg(ez.x, ez.z); return 0.6; } }
    const wc = W.find(o => need(o, 'coffee')); if (wc) { const want = wc.need.coffee;
      if (mug.fill < 0.78) { handTo(P3(CF.pot.x, CF.pot.z, T + 0.15), 'coffee'); const w = cap('pot', 'HOLD', 'HOLD THE POT. LET GO AT THE YELLOW LINE'); if (w) return w; S.hold = 'pot'; DM.task = () => { if (mug.fill >= 0.8) { S.hold = null; return true; } }; return 0.3; }
      if (mug.cream < CREAM[want.cream].v - 0.05) { handTo(P3(CF.cream.x, CF.cream.z, T + 0.1), 'coffee'); const w = cap('cream', 'HOLD', 'TICKET SAYS ' + CREAM[want.cream].name + ': HOLD THE CREAMER'); if (w) return w; S.hold = 'cream'; DM.task = () => { if (mug.cream >= CREAM[want.cream].v) { S.hold = null; return true; } }; return 0.3; }
      if (mug.sugars < want.sugars) { handTo(P3(CF.sugar.x, CF.sugar.z, T + 0.08), 'coffee'); const w = cap('sugar', 'TAP', 'ONE TAP = ONE SUGAR'); if (w) return w; addSugar(); return 0.6; }
      handTo(P3(CF.mug.x, CF.mug.z, T + 0.1), 'coffee'); const w = cap('mug', 'TAP', 'TAP THE MUG: IT GOES NEXT TO THEIR PLATE'); if (w) return w; plateMug(); return 0.7; }
    DM.cap = 'COOKING · WATCH THE METER OVER EACH ONE'; DM.key = ''; hand.visible = false; DM.hint = null; return 0.3; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.6)); if (DM.task) { if (DM.task(dt)) DM.task = null; return; } if (S.mode !== 'shift' || S.react || S.payOut) return; DM.cd -= dt; if (DM.cd > 0) return; const f0 = S.focus; DM.cd = demoAct(); if (S.focus !== f0) DM.cd += 0.5;
    if (DM.served >= 2 || S.t > 150) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; audio.init && audio.init(); startMusic(); DM.on = true; DM.seen = {}; DM.served = 0; DM.task = null; DM.cd = 2.4; DM.day0 = S.day; S.mode = 'intro'; S.demo = true; S.day = Math.max(S.day, 3); startShift(); S.next = 99; DM.cap = 'WATCH A SHIFT ON SUNNY\'S FLAT-TOP'; DM.key = '';
    setTimeout(() => { if (!DM.on) return; newOrder({ ci: 0, need: { cakes: 3, coffee: { cream: 'splash', sugars: 1 } } }); }, 600); setTimeout(() => { if (!DM.on) return; newOrder({ ci: 4, need: { eggs: 'easy', bacon: 2 } }); }, 2600); }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; DM.task = null; DM.hint = null; S.day = DM.day0; S.pay = null; S.payOut = null; payProps(null); S.react = null; S.mode = 'done'; toIntro(); }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false; const _q = new THREE.Quaternion();
  const burnRate = (v, top) => upg('guard') && v > top ? 0.5 : 1;
  function cookItems(dt, et) { for (const it of items.slice()) { const ud = it.g.userData;
      if (it.flipT > 0) { it.flipT = Math.min(1, it.flipT + dt / 0.5); const k = it.flipT; it.g.position.y = GT + Math.sin(k * Math.PI) * it.toss; it.g.rotation.x = k * Math.PI; if (k >= 1) { it.flipT = 0; it.g.rotation.x = 0; it.g.position.y = GT; it.flipped = true; tone(700, 0.06, 0.04); puff(it.x, GT + 0.06, it.z, 0xffffff, 2); } }
      if (it.kind === 'cake') { if (it.pouring) { it.r = Math.min(0.24, it.r + dt * 0.07 * (upg('ladle') ? 1.4 : 1)); ud.disc.scale.set(it.r, 1, it.r); }
        else if (!it.flipped && !it.flipT) it.d += dt * 0.072 * burnRate(it.d, FLIP[1]); else if (it.flipped) it.d2 += dt * 0.085 * burnRate(it.d2, CAKE_B[1]);
        const showA = it.flipped || it.flipT > 0.5, top = showA ? shadeCol(0.5 + (it.flipAt ?? it.d) * 0.4, BROWN) : Q('#f6e7bf', '#f2dcaa', it.d), side = shadeCol(showA ? 0.45 + it.d2 * 0.55 : 0.35 + it.d * 0.5, BROWN); ud.disc.material[1] = cakeTop(top); ud.disc.material[0] = toon(side); ud.disc.material[2] = toon(side);
        const nb = showA ? 0 : Math.round(clamp((it.d - 0.2) / 0.45, 0, 1) * 14); ud.bub.children.forEach((b, i) => b.visible = i < nb);
        drawGauge(it.G, it.flipped ? Z_CAKE_B : Z_CAKE_A, it.flipped ? it.d2 : it.d, it.flipped ? 'golden' : 'flip'); it.G.s.visible = !it.pouring; }
      else if (it.kind === 'egg') { if (it.crackT < 1) { it.crackT = Math.min(1, it.crackT + dt / 0.4); ud.white.scale.setScalar(0.2 + 0.8 * smooth(0, 1, it.crackT)); ud.shell.position.y = 0.16 - it.crackT * 0.1; ud.shell.children.forEach((h, i) => h.position.x = (i ? 1 : -1) * (0.03 + it.crackT * 0.05)); if (it.crackT >= 1) ud.shell.visible = false; }
        it.d += dt * 0.05 * (it.flipped ? 1.15 : 1) * burnRate(it.d, 1.05); const scr = it.stir >= 0.9, dn = yolkOf(it.d);
        ud.white.material = toon(it.d > 1.12 ? '#5a3a1a' : it.d > 0.95 ? '#ecd6a0' : it.d > 0.2 ? '#fbfbf7' : '#e2ecee'); ud.white.visible = !scr; ud.curd.visible = scr; ud.yolk.visible = !scr; ud.yolk.material = toon(it.flipped || (it.flipT > 0.5) ? '#f5efe0' : dn === 'raw' || dn === 'runny' ? '#ffb21a' : dn === 'medium' ? '#f6b84a' : '#f0d27a'); if (scr) ud.curd.children.forEach(c => c.material = toon(it.d > 1.12 ? '#6a4a1a' : it.d > 0.8 ? '#f2c84a' : '#ffd35a'));
        if (!scr && it.stir > 0.05) ud.white.scale.set(1 + it.stir * 0.3, 1 + it.stir * 0.3, 1); drawGauge(it.G, Z_YOLK, it.d, wantFor('eggs')); }
      else if (it.kind === 'bacon') { if (!it.laying) it.d += dt * 0.065 * burnRate(it.d, BACON[1]); it.g.material = baconMat(shadeCol(it.d, [[0, '#ffffff'], [0.55, '#d8906c'], [0.75, '#b0603e'], [1.0, '#70381e'], [1.2, '#2a1810']])); it.g.scale.y = 1 + Math.min(1, it.d) * 0.9; drawGauge(it.G, Z_BACON, it.d, 'crisp'); it.G.s.visible = !it.laying; }
      else if (it.kind === 'hash') { if (it.cooking && !it.flipT) { if (!it.flipped) it.d += dt * 0.075 * burnRate(it.d, 1.0); else it.d2 += dt * 0.075 * burnRate(it.d2, 0.85); } const showA = it.flipped || it.flipT > 0.5; it.mesh.material.color.set(showA ? shadeCol(0.5 + (it.flipAt || 0) * 0.45, BROWN) : '#ffffff'); drawGauge(it.G, it.flipped ? Z_HASH_B : Z_HASH_A, it.flipped ? it.d2 : it.d, it.flipped ? wantFor('hash') : 'flip'); it.G.s.visible = it.cooking; }
      { const pn = panX(it.x), cue = (k, kind) => { if (!it['c_' + k]) { it['c_' + k] = 1; SFX.ready(kind, pn); buzz(18); } };
        if (it.kind === 'cake' && !it.pouring) { if (!it.flipped && it.d >= FLIP[0]) cue('f', 'flip'); if (it.flipped && it.d2 >= CAKE_B[0]) cue('g', 'cakes'); }
        if (it.kind === 'egg') { const w = wantFor('eggs'); if (w && yolkOf(it.d) === w) cue('w' + w, 'eggs'); }
        if (it.kind === 'bacon' && !it.laying && it.d >= BACON[0]) cue('c', 'bacon');
        if (it.kind === 'hash' && it.cooking) { if (!it.flipped && it.d >= 0.4) cue('f', 'flip'); const w = wantFor('hash'); if (it.flipped && w && zoneAt(Z_HASH_B, it.d2) === w) cue('s' + w, 'hash'); }
        if (isBurnt(it) && !it.c_burn) { it.c_burn = 1; SFX.burn(pn); buzz([40, 30, 40]); } }
      const pp = itemPos(it); it.G.s.position.set(pp.x, GT + (it.kind === 'hash' ? 0.2 : 0.16), pp.z + (it.kind === 'hash' ? 0.12 : 0.02));
      if (Math.random() < dt * (isBurnt(it) ? 6 : 1.6)) puff(pp.x + rr(-0.05, 0.05), GT + 0.05, pp.z, isBurnt(it) ? 0x3a3836 : 0xffffff, 1); } }
  function coffeeStep(dt) { const C = CF, mx = CF.mug.x, mz = CF.mug.z; if (S.hold === 'pot') { pot.position.lerp(V3(mx + 0.15, T + 0.3, mz), Math.min(1, dt * 10)); pot.rotation.z = damp(pot.rotation.z, 1.0, 10, dt); if (pot.rotation.z > 0.6) { mug.fill += dt * 0.36 * (upg('pot') ? 2 : 1); stream.visible = true; const top = T + 0.27, bot = T + 0.02 + 0.105 * Math.min(1, mug.fill); stream.scale.set(1, top - bot, 1); stream.position.set(mx + 0.02, (top + bot) / 2, mz); if (!mug.cueL && mug.fill >= 0.72) { mug.cueL = 1; SFX.ready('coffee', panX(mx)); buzz(20); } }
        if (mug.fill > 1.02) { S.hold = null; mug.spilt = 0.7; flash('SPILLED · FRESH MUG', '#ec3013', 1.2); tone(200, 0.2, 0.04, 'sawtooth'); buzz([40, 30, 40]); puff(mx, T + 0.15, mz, 0x3a2112, 3); } }
    else { pot.position.lerp(V3(C.pot.x, T + 0.02, C.pot.z), Math.min(1, dt * 8)); pot.rotation.z = damp(pot.rotation.z, 0, 10, dt); stream.visible = false; }
    if (S.hold === 'cream') { creamer.rotation.z = damp(creamer.rotation.z, -1.2, 10, dt); creamer.position.lerp(V3(mx - 0.13, T + 0.2, mz), Math.min(1, dt * 10)); if (creamer.rotation.z < -0.8) { mug.cream = Math.min(1, mug.cream + dt * 0.45); mug.fill += dt * 0.04; } } else { creamer.rotation.z = damp(creamer.rotation.z, 0, 10, dt); creamer.position.lerp(V3(C.cream.x, T, C.cream.z), Math.min(1, dt * 8)); }
    SFX.coffee(S.hold === 'pot' && pot.rotation.z > 0.6 && !mug.spilt); SFX.cream(S.hold === 'cream' && creamer.rotation.z < -0.8);
    if (mug.spilt) { mug.spilt -= dt; if (mug.spilt <= 0) freshMug(); }
    for (let i = cubes.length - 1; i >= 0; i--) { const c = cubes[i]; c.t += dt / 0.35; const k = Math.min(1, c.t); c.m.position.set(C.sugar.x + (mx - C.sugar.x) * k, T + 0.08 + Math.sin(k * Math.PI) * 0.18, C.sugar.z + (mz - C.sugar.z) * k); if (k >= 1) { scene.remove(c.m); cubes.splice(i, 1); puff(mx, T + 0.12, mz, 0xffffff, 1); } }
    mugLook(); lineMark.visible = S.mode === 'shift' || S.mode === 'glide'; }
  function custStep(dt, work) { for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], f = o.f, seat = K.seats[o.seat]; o.t += dt; let sp = 0;
      if (o.st === 'walk' || o.st === 'leave') { const tgt = o.path[0]; if (tgt) { const dx = tgt.x - f.position.x, dz = tgt.z - f.position.z, l = Math.hypot(dx, dz); f.position.y = 0; if (l < 0.06) o.path.shift(); else { const s = Math.min(l, dt * 1.7); f.position.x += dx / l * s; f.position.z += dz / l * s; f.rotation.y = Math.atan2(dx, dz); sp = 1.7; } }
        else if (o.st === 'walk') { o.st = 'wait'; o.t = 0; f.rotation.y = Math.PI; const p = plates[o.seat]; p.o = o; p.g.visible = true; p.hot = false; p.heat = 1; p.g.position.set(seat.plate.x, K.passY, K.passZ); rebuildPlate(p); say(CUSTOMERS[o.ci].name + ': "' + CUSTOMERS[o.ci].order + '"', 4); SFX.ticket(); buzz(10); }
        else { f.visible = false; const p = plates[o.seat]; if (p.o === o) { p.o = null; p.g.visible = false; rebuildPlate(p); } orders.splice(i, 1); continue; } }
      kit.animFox(f, dt, sp); if (o.st !== 'walk' && o.st !== 'leave') { f.rotation.y = Math.PI; sitPose(f, 0.28); }
      if (o.st === 'wait' && work && !DM.on) { o.pat -= dt; f.userData.mood = o.pat / o.patMax < 0.3 ? 'angry' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; flash(CUSTOMERS[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); tone(180, 0.3, 0.05, 'sawtooth'); buzz([60, 40, 60]); o.path = [V3(seat.x + 0.4, 0, K.stoolZ + 1.1), V3(K.door.x, 0, K.door.z)]; } }
      if (o.st === 'eat' && o.t > 1.8) { o.st = 'leave'; o.t = 0; o.path = [V3(seat.x + 0.4, 0, K.stoolZ + 1.1), V3(K.door.x, 0, K.door.z)]; f.userData.mood = 'happy'; } } }
  function plateStep(dt) { for (const p of plates) { const o = p.o; if (!o) continue;
      if (p.hot && o.st === 'wait') { p.heat = Math.max(0, p.heat - dt / (upg('lamps') ? 70 : 35)); if (p.heat > 0.25 && Math.random() < dt * 2.5) puff(p.g.position.x + rr(-0.08, 0.08), K.passY + 0.1, p.g.position.z, 0xffffff, 1); }
      if (p.slide) { p.slide.t += dt / 0.55; const k = Math.min(1, p.slide.t), s = K.seats[p.seat], a = V3(s.plate.x, K.passY, K.passZ), b = V3(s.serve.x, s.serve.y + 0.005, s.serve.z); p.g.position.lerpVectors(a, b, smooth(0, 1, k)); p.g.position.y += Math.sin(k * Math.PI) * 0.12; p.g.rotation.y = k * 0.6; if (k >= 1) { p.slide = null; startReact(o); } } } }
  function camStep(dt) { const L = (sh, r) => { camera.position.lerp(sh.pos, Math.min(1, dt * r)); CAM.look.lerp(sh.look, Math.min(1, dt * r)); };
    if (S.react) { S.react.t += dt; const f = S.react.o.f.position; L(shotFor('react' + S.react.o.seat, () => [V3(f.x - 0.5, 1.0, f.z), V3(f.x + 0.5, 1.0, f.z), V3(f.x, 2.2, f.z), V3(f.x, K.counterY, K.counterZ - 0.2)], 0.2, 0, 0.1), 5); if (S.react.t > (DM.on ? 2.0 : 2.4)) reactDone(); }
    else if (S.pay || S.payOut) { L(shotFor('pay', () => [V3(REG.x - 0.26, REG.y, REG.z - 0.45), V3(REG.x + 0.55, REG.y, REG.z - 0.45), V3(CASH.x - 0.14, CASH.y, CASH.z + 0.14), V3(REG.x + 0.26, REG.y + 0.5, REG.z + 0.2), V3(REG.x - 0.26, REG.y + 0.5, REG.z + 0.2)], 1.0, 0, 0.07), 5); regDisp.scale.set(port() ? 0.36 : 0.46, port() ? 0.133 : 0.17, 1); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if (S.mode === 'intro' && !DM.on) L(wideShot(), 4);
    else if (S.mode === 'done') L(wideShot(), 4);
    else if (S.mode === 'walk') walkStep(dt);
    else if (S.mode === 'shift' || S.mode === 'glide') { if (S.hold === 'pot' || S.hold === 'cream') { const m = CF.mug; L(shotFor('pour', () => [V3(m.x - 0.25, T, m.z - 0.18), V3(m.x + 0.25, T, m.z - 0.18), V3(m.x, T + 0.42, m.z), V3(m.x - 0.25, T, m.z + 0.12), V3(m.x + 0.3, T + 0.3, m.z)], port() ? 0.9 : 0.6, 0, 0.12), 4); } else L(workShot(), 3.2); }
    camera.lookAt(CAM.look); }
  function step(dt) { const et = clock.elapsedTime, work = S.mode === 'shift';
    camStep(dt);
    { const hideBack = (S.mode === 'shift' || S.mode === 'glide') && (CAM.t > 0.35 || !CAM.from); K.cut.forEach(m => m.visible = !hideBack); stripGl.forEach(s => s.visible = !hideBack); const hideFront = S.mode === 'intro' || S.mode === 'done'; K.front.forEach(m => m.visible = !hideFront); K.booths.forEach(b => b.parts.forEach(m => m.visible = !hideFront)); REGULARS.forEach(r => r.f.visible = !hideFront); K.sky.visible = !hideFront; }
    if (S.mode === 'glide') { S.glideT -= dt; if (S.glideT <= 0) S.mode = 'shift'; }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; if (S.toastT > 0) { S.toastT -= dt; if (S.toastT <= 0) S.toast = null; }
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.14 + (1 - p.life) * 0.28); }
    K.fans.forEach((f, i) => f.rotation.y += dt * (2.2 + i * 0.3)); if (mug.fill > 0.3 && Math.random() < dt * 2) puff(CF.mug.x + rr(-0.02, 0.02), T + 0.18, CF.mug.z, 0xffffff, 1);
    lampGl.forEach((s, i) => s.material.opacity = 0.36 + Math.sin(et * 2 + i) * 0.04); K.neon2.material.opacity = 0.85 + Math.sin(et * 13) * 0.05 * (Math.sin(et * 0.7) > 0.95 ? 3 : 1); K.neon2.material.transparent = true;
    if (K.bellM.userData.hit) { K.bellM.userData.hit = Math.max(0, K.bellM.userData.hit - dt * 3); K.bellM.rotation.z = Math.sin(K.bellM.userData.hit * 30) * 0.15 * K.bellM.userData.hit; }
    if (work) { S.t += dt; if (S.t >= DINER.shift && !DM.on) endShift(); }
    if (work && !DM.on) { S.next -= dt; const maxQ = S.day <= 1 ? 2 : 3; if (S.next <= 0 && orders.filter(o => o.st !== 'leave').length < maxQ && S.t < DINER.shift - 25) { newOrder(); S.next = Math.max(9, 21 - S.day * 1.5) * rr(0.8, 1.2); } }
    if (DM.on) demoStep(dt);
    cookItems(dt, et); coffeeStep(dt); custStep(dt, work); plateStep(dt);
    S.gauge = S.pour ? { title: 'POURING · LET GO AT THE RING', v: S.pour.r / 0.24, zones: [['TOO SMALL', 0.11 / 0.24, '#9ca3af'], ['RIGHT', 0.065 / 0.24, '#22c55e'], ['TOO BIG', 0.065 / 0.24, '#ec3013']], tag: Math.abs(S.pour.r - CAKE_R) <= 0.025 ? 'RIGHT' : S.pour.r < CAKE_R ? 'TOO SMALL' : 'TOO BIG' }
      : S.hold === 'pot' ? { title: 'POUR TO THE YELLOW LINE', v: mug.fill / 1.1, zones: [['LOW', 0.68 / 1.1, '#9ca3af'], ['LINE', 0.24 / 1.1, '#22c55e'], ['SPILL', 0.18 / 1.1, '#ec3013']], tag: mug.fill < 0.7 ? 'LOW' : mug.fill <= 0.92 ? 'LINE' : 'SPILL' }
      : S.hold === 'cream' ? { title: 'CREAM', v: mug.cream, zones: [['BLACK', 0.12, '#3a2112'], ['SPLASH', 0.38, '#a87a52'], ['EXTRA', 0.5, '#e0c4a0']], tag: mug.cream < 0.12 ? 'BLACK' : mug.cream < 0.5 ? 'SPLASH' : 'EXTRA' } : null;
    HINT = DM.on ? (DM.hint || null) : nextHint(); hintT += dt; RINGS.place(HINT && !S.react && !S.pay && S.mode === 'shift' ? HINT : null, hintT, dt); if (S.mode === 'shift') autoFollow();
    regDisp.visible = !!(S.pay || S.payOut); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; tone(2400 + Math.random() * 400, 0.04, 0.03, 'square'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, K.counterY + 0.03, K.counterZ); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    // the cast
    const greet = S.mode === 'intro' || S.mode === 'done'; if (ben.visible) { kit.animFox(ben, dt, 0); ben.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(et * 7) * 0.32); }
    for (const [k, s] of Object.entries(STAFF)) { if (!s.f.visible) continue; const tk = D.on && D.on.key === k, near = S.mode === 'walk' && Math.hypot(walker.position.x - s.f.position.x, walker.position.z - s.f.position.z) < 2.6; const want = near || tk ? Math.atan2(walker.position.x - s.f.position.x, walker.position.z - s.f.position.z) : s.face; let df = ((want - s.f.rotation.y + Math.PI * 3) % (Math.PI * 2)) - Math.PI; s.f.rotation.y += df * Math.min(1, dt * 4); kit.animFox(s.f, dt, 0); }
    for (const r of REGULARS) { if (!r.f.visible) continue; kit.animFox(r.f, dt, 0); sitPose(r.f, 0.02); if (r.key === 'marguerite') r.f.userData.P.head.rotation.x = 0.35; }
    soundTick(dt);
    K.jukePanel.material.color.setHSL(0, 0, MUS.want ? 0.85 + Math.sin(et * 6) * 0.15 : 0.55); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- HUD ----------
  function ticket(p) { const o = p.o; if (!o || o.st === 'leave' || o.st === 'eat') return { seat: p.seat, empty: true }; const N = o.need, G = o.got, L = [];
    if (N.cakes) L.push({ t: (N.cakes === 3 ? 'TALL STACK' : 'SHORT STACK') + ' · ' + G.cakes.length + '/' + N.cakes, done: G.cakes.length >= N.cakes });
    if (N.eggs) L.push({ t: 'EGGS · ' + EGG[N.eggs].name + (G.eggs.length ? ' · ' + G.eggs.length + '/2' : ''), done: G.eggs.length >= 2 });
    if (N.bacon) L.push({ t: 'BACON × ' + N.bacon + (G.bacon.length ? ' · ' + G.bacon.length + '/' + N.bacon : ''), done: G.bacon.length >= N.bacon });
    if (N.hash) L.push({ t: 'HASH BROWNS · ' + SHADE[N.hash].name, done: !!G.hash });
    if (N.coffee) L.push({ t: 'COFFEE · ' + (N.coffee.cream === 'black' ? 'BLACK' : CREAM[N.coffee.cream].short) + (N.coffee.sugars ? ' · ' + N.coffee.sugars + ' SUGAR' : ''), done: !!G.coffee });
    return { seat: p.seat, empty: false, name: CUSTOMERS[o.ci].name, role: CUSTOMERS[o.ci].role, pat: Math.max(0, o.pat / o.patMax), heat: p.hot ? p.heat : 1, hot: p.hot, ready: o.st === 'wait' && complete(o), arriving: o.st === 'walk', served: o.st === 'served', total: o.total, full: !!N.full, lines: L }; }
  function badges() { const B = {}, has = k => items.filter(i => i.kind === k);
    const ck = has('cake'); B.cakes = ck.some(i => isBurnt(i)) ? 'BURNING' : ck.some(i => !i.flipped && !i.pouring && i.d >= FLIP[0]) ? 'FLIP!' : ck.some(i => i.flipped && i.d2 >= CAKE_B[0]) ? 'READY' : ck.length ? ck.length + ' ON' : '';
    const eg = has('egg'); B.eggs = eg.some(i => isBurnt(i)) ? 'BURNING' : eg.some(i => i.d >= 0.3) ? 'READY' : eg.length ? eg.length + ' ON' : '';
    const bc = has('bacon'); B.bacon = bc.some(i => isBurnt(i)) ? 'BURNING' : bc.some(i => i.d >= BACON[0]) ? 'READY' : bc.length ? bc.length + ' ON' : '';
    const hs = has('hash')[0]; B.hash = !hs ? '' : isBurnt(hs) ? 'BURNING' : hs.cooking && !hs.flipped && hs.d >= 0.4 ? 'FLIP!' : hs.flipped && hs.d2 >= 0.35 ? 'READY' : 'COOKING';
    B.coffee = mug.fill >= 0.7 ? 'POURED' : mug.fill > 0.02 ? 'POURING' : ''; B.pass = plates.some(p => p.o && p.o.st === 'wait' && complete(p.o)) ? 'ORDER UP' : ''; B.all = waiting().length ? waiting().length + ' WAIT' : ''; return B; }
  function hud() { const W = urgent(waiting()), wq = !save.flag('grillOn') ? 'Talk to Sunny behind the counter, or grab the apron on the hook.' : 'Day ' + S.day + ' · Sunny needs you on the grill. Apron is on the hook.';
    return { mode: S.mode, streak: S.streak || 0, day: S.day, left: Math.max(0, DINER.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      tickets: plates.map(ticket), focus: S.focus, badges: badges(), flash: S.flash, say: S.say, gauge: S.gauge, done: S.done, gold: save.data.gold, uniform: !!save.flag(UNIFORM),
      hint: HINT && HINT.text && !S.react ? { text: HINT.text, station: HINT.station } : null, pay: S.pay ? { ...S.pay } : null,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip, cold: S.react.cold } : null,
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: Object.entries(DISH).filter(([, v]) => v.day <= S.day).map(([, v]) => v.name), next: Object.entries(DISH).filter(([, v]) => v.day > S.day).map(([, v]) => v.name + ' (DAY ' + v.day + ')'),
      locked: Object.fromEntries(Object.entries(DISH).map(([k, v]) => [k, v.day > S.day ? v.day : 0])), demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null,
      walk: S.mode === 'walk' ? { prompt: WK.near && !D.on ? WK.near.text : null, dialog: dialogHud(), toast: S.toast, quest: wq, place: 'Earth · Breakfast All Day' } : null }; }
  function emit() { onState(hud()); }
  frame(); toIntro(); { const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); CAM.t = 1; }
  if (opts.start === 'walk') enterWalk(opts.at); else if (opts.start === 'shift') startShift();
  const onVis = () => { const hid = document.hidden; PAUSE = hid; try { if (audio.ctx) hid ? audio.ctx.suspend() : audio.ctx.resume(); } catch (e) {} }; document.addEventListener('visibilitychange', onVis);
  const toast = (t, s = 2.4) => { S.toast = t; S.toastT = s; };
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setFocus, startShift, endShift, toIntro, walk(at) { audio.init && audio.init(); startMusic(); enterWalk(at); }, enter(at) { audio.init && audio.init(); enterWalk(at || { x: DINER_ROOM.inside.x, z: DINER_ROOM.inside.z, f: DINER_ROOM.inside.face }); }, get mode() { return S.mode; }, breakTime() { enterWalk({ x: 4.9, z: -3.2, f: 0.6 }); }, demoStart, demoStop, giveCoin, buyUpgrade, hud,
    // ENGINE CONTRACT for the standard Game HUD (walk mode)
    start() {}, talk, choose, closeDialog: closeTalk, nextLine, clearToast() { S.toast = null; },
    melee() { if (S.mode !== 'walk' || D.on) return; WK.wave = 1.2; const n = WK.near; if (n && TALK[n.key]) toast(TALK[n.key].name + ' waves back.'); }, range() { if (S.mode === 'walk') toast("No blasters in Sunny's diner, hon."); }, jump() { if (S.mode === 'walk' && WK.hop <= 0) { WK.hop = 1; SFX.hop(); } }, meleeUp() {},
    useItem() { toast('Save it for the road. Breakfast is on the house tonight.'); }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; }, setHudPad() {}, setStick(x, y) { WK.sx = x; WK.sy = y; },
    eyeLook(dx, dy) { if (!WK.eye0) WK.eye0 = { yaw: WK.yaw, pitch: WK.pitch }; WK.dragT = 99; WK.yaw -= dx * 0.008; WK.pitch = clamp(WK.pitch + dy * 0.006, 0.05, 1.1); }, eyeRelease() { if (WK.eye0) { WK.yaw = WK.eye0.yaw; WK.pitch = WK.eye0.pitch; WK.eye0 = null; } WK.dragT = 0; },
    togglePov() { WK.pov = !WK.pov; return WK.pov; }, lookBy(dx, dy) { WK.dragT = 2; WK.yaw -= dx * 0.006; WK.pitch = clamp(WK.pitch + dy * 0.0048, 0.05, 1.1); }, zoomBy(f) { WK.dist = clamp(WK.dist * f, 2.5, 8); }, getCam() { return { dist: WK.dist, pitch: WK.pitch }; }, setCam(d, p) { if (d != null) WK.dist = clamp(d, 2.5, 8); if (p != null) WK.pitch = clamp(p, 0.05, 1.1); },
    mapData() { const p = walker.position; return { p: [p.x, p.z, walker.rotation.y], b: [['GRILL', 0, K.z], ['DOOR', K.door.x, K.door.z], ['JUKEBOX', K.juke.x, K.juke.z], ['APRON', K.hook.x, K.hook.z]], f: [...Object.values(STAFF).map(s => [s.f.position.x, s.f.position.z]), ...REGULARS.map(r => [r.f.position.x, r.f.position.z])], e: [], q: save.flag('grillOn') ? [K.hook.x, K.hook.z, 'Apron'] : [sunny.position.x, sunny.position.z, 'Sunny'] }; },
    setMinimap() {}, toggleSound() { audio.init && audio.init(); audio.setMuted(!audio.muted); SFX.stopLoops(); }, soundOn: () => !audio.muted, toggleMusic() { MUS.want ? stopMusic(true) : startMusic(true); return MUS.want; }, musicOn: () => MUS.want, cycleWeather() {},
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, DINER.shift - t); }, _state: () => S, _items: () => items, _orders: () => orders, _plates: () => plates, _mug: () => mug,
    _scr: p => { const r = renderer.domElement.getBoundingClientRect(), s = scr(p); return { x: r.left + s.x, y: r.top + s.y }; }, _K: K, _newOrder: newOrder, _V3: V3, _walker: walker, _wk: WK,
    destroy() { document.removeEventListener('visibilitychange', onVis); cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); stopMusic(); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
