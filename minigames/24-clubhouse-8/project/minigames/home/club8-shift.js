// 8 GATES — HOME PLANET · CLUBHOUSE 8 [gayaChurch]: THE COUNTER. The player's own arcade clubhouse. Pip has always run it alone.
// From the 2D Planet Gaya build (GAYA.store + GAYA.arcade): two shifts (A QUIET HOUR · THE EVENING RUSH), customers ask for one thing
// at a time, a patience bar, tips for speed, walk-outs, a best per shift. The 3D job adds the restaurant loop and four touch moves:
//   TAP a shelf (HOLD an empty one to RESTOCK, a fill ring) → SWIPE the item across the glowing SCANNER (beep)
//   → FLICK it up across the counter to the customer → MAKE CHANGE at the register (tap coins) → stars, tip, next.
// STOCK = both: the arcade shelf is always on (tokens, soda, popcorn, candy, plush, glow sticks) + BONUS trays from your own save:
//   GAME PASSES for games you have played, ITEMS out of your pack (they leave the pack), RELICS (sold on, and gone).
// TWO MODES in one scene, like Foxy Crema:
//   'walk'  = the clubhouse as an interior: the FOX player walks in and around, waves, sits in the lounge, talks to Pip, and PLAYS
//             the 8 arcade cabinets (tiny one-thumb games; when nobody is playing they run their own attract demo).
//             Game HUD drives it (vehicle="club": 1 WAVE · 2 PLAY/SIT · 3 JUMP, TALK near someone or a cabinet).
//   'shift' = the job (welcome card → a shift → day card with wage, tips, stars, employee of the day, uniform, upgrades).
// Save: stats club8.* (+ the 2D names store.shifts / store.best.quiet / store.best.rush / store.sales), flag club8Uniform,
//   sign name in localStorage 'gaya.storeName' (the same key the 2D game paints the door with).
// MERGE: buildClub8(ctx) builds the interior at an origin (14 x 12 m, door on +z) and returns colliders, seats, cabinets, the
//   keeper spot and the door, so any FOX world building can host it; createClub8Shift({ container, mode }) runs it stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { CABINETS, makeCabinetGame, CAB_W, CAB_H } from './club8-cabinets.js';

export const CLUB8 = { room: 'gayaChurch', keeper: 'Pip', signKey: 'gaya.storeName', sign: 'CLUBHOUSE 8' };
export const SHIFTS = [
  { key: 'quiet', label: 'A QUIET HOUR', customers: 8, seconds: 120, queue: 2, gap: [7, 11], patience: 26, xp: 220, brief: 'Eight in, no rush. Serve what they ask for and be quick about it. A fox kept waiting pays the price and nothing over.' },
  { key: 'rush', label: 'THE EVENING RUSH', customers: 16, seconds: 180, queue: 3, gap: [4, 7], patience: 21, xp: 480, brief: 'Sixteen in, three deep at the counter, and less patience between them. The tips are where the money is.' }];
// the arcade shelf: always stocked (well, until it is not)
export const STOCK = [
  { id: 'token', name: 'TOKENS', short: 'TOKENS', price: 2, col: '#ffd23a', day: 1 },
  { id: 'soda', name: 'FIZZ 8 SODA', short: 'SODA', price: 3, col: '#38bdf8', day: 1 },
  { id: 'popcorn', name: 'POPCORN', short: 'POPCORN', price: 3, col: '#f87171', day: 1 },
  { id: 'candy', name: 'GLOW CANDY', short: 'CANDY', price: 2, col: '#f472b6', day: 2 },
  { id: 'plush', name: 'FOX PLUSH', short: 'PLUSH', price: 8, col: '#fb923c', day: 2 },
  { id: 'glow', name: 'GLOW STICK', short: 'GLOW', price: 2, col: '#4ade80', day: 3 }];
// games the save can prove you have played (a pass is sold for each): the 3D games' own keys + the 8 cabinets here
const PLAYED = [
  { id: 'tennis', name: 'GAYA TENNIS OPEN', test: d => d.flags.gayaTennisLessons || d.stats['gaya.tennis.wins'] },
  { id: 'crema', name: 'FOXY CREMA', test: d => d.stats['ur.coffee.cups'] },
  { id: 'boat', name: 'JON’S BOATWORKS', test: d => Object.keys(d.stats).some(k => k.startsWith('boat.yard.')) },
  { id: 'burger', name: 'MERU BURGERS', test: d => Object.keys(d.stats).some(k => k.startsWith('meru.burger')) },
  { id: 'counter', name: 'THE COUNTER', test: d => d.stats['store.shifts'] },
  ...CABINETS.map(c => ({ id: 'cab.' + c.id, name: c.name, test: d => d.stats['club8.cab.' + c.id] }))];
const ITEM_NAMES = { erToGo: 'ER TO GO', energyPod: 'ENERGY FILL POD', chocolates: 'BOX OF CHOCOLATES' };
const PRICE = { pass: 5, item: 9, relic: 26 };
export const UPGRADES = [
  { id: 'laser', name: 'LASER SCANNER', cost: 40, line: 'Items scan themselves the moment you pick them.' },
  { id: 'shelves', name: 'DEEP SHELVES', cost: 35, line: 'Eight on every shelf instead of five.' },
  { id: 'sorter', name: 'COIN SORTER', cost: 45, line: 'The register lights the coin to give next.' },
  { id: 'jukebox', name: 'CLUB JUKEBOX', cost: 50, line: 'Customers wait 20% longer.' },
  { id: 'neon', name: 'NEON 8 SIGN', cost: 60, line: 'Tips are 25% bigger.' }];
// the home planet's townsfolk (Town Square + Tavern + Ski Lodge + the jetty), as customers
const CUSTOMERS = [
  { name: 'PLUM', fur: '#e08a3c', torso: ['#7e22ce', '#f3e8ff', '#4c1d95'], outfit: 'dress' }, { name: 'MAUVE', fur: '#f0dcbe', torso: ['#a855f7', '#faf5ff', '#6b21a8'], outfit: 'coat' },
  { name: 'IRIS', fur: '#c9682a', torso: ['#6366f1', '#e0e7ff', '#3730a3'] }, { name: 'BROTHER CINNABAR', fur: '#d9733a', torso: ['#fbfbf7', '#e6b45a', '#a8a29e'], outfit: 'robe' },
  { name: 'AMETHYST', fur: '#f2741f', torso: ['#9333ea', '#f5d0fe', '#581c87'] }, { name: 'LILAC', fur: '#f2c08a', torso: ['#c4b5fd', '#ede9fe', '#7c3aed'], outfit: 'dress' },
  { name: 'SISTER DAMSON', fur: '#e6e4de', torso: ['#fbfbf7', '#7e22ce', '#a8a29e'], outfit: 'robe' }, { name: 'ORCHID', fur: '#ee7d24', torso: ['#db2777', '#fce7f3', '#9d174d'] },
  { name: 'VOLLEY', fur: '#c9682a', torso: ['#0ea5e9', '#e0f2fe', '#0369a1'] }, { name: 'GRISH', fur: '#9a6f4a', torso: ['#57534e', '#d6d3d1', '#292524'], outfit: 'coat' },
  { name: 'NIX', fur: '#f0dcbe', torso: ['#2563eb', '#dbeafe', '#1e3a8a'], outfit: 'coat' }, { name: 'OTTO', fur: '#d9822b', torso: ['#15803d', '#dcfce7', '#14532d'] }];
const LINES = {
  stock: ['%s, when you are ready.', '%s. Just the one.', 'Have you got %s?', 'I will take %s.', '%s, please. Quick, my game is on.'],
  two: ['%s, and %t.', 'One %s and a %t, please.', '%s. Oh, and %t.'],
  pass: ['A pass for %s. I hear you are good at it.', '%s. One go.'], item: ['Have you got a %s back there?', 'I was told you had a %s.'],
  relic: ['Something old. I do not mind what.', 'Anything off-world? I collect.', 'My sister says you have been places. Show me something.'],
  happy: ['Lovely. Keep the change.', 'That will do nicely.', 'Good. Thank you.', 'Ha! Perfect.'], wrong: ['That is not it.', 'No, the other thing.', 'Are you listening?'],
  leave: ['Forget it.', 'I will come back when there are two of you.', 'I have not got all night.']};
// Pip, from the 2D storePipTalk
const PIP = {
  first: [['player', 'You are on your own in here.'], ['npc', 'I am always on my own in here. Tokens, cabinets, wiping down. It is a two-fox counter and there has only ever been one of me.'], ['player', 'I could take the other side of it.'], ['npc', '...Say that again slowly.'], ['npc', 'Right. Right. You sell what is on the shelves, and whatever you have got. Passes for anything you have actually played, things out of your pack, and if you are carrying something old, somebody in this town will pay over the odds for it.'], ['npc', 'Be quick with them. A fox kept waiting pays the price and not a coin over it.']],
  back: n => n === 1 ? 'One shift in. Again?' : n + ' shifts. You are better at this than I am.',
  how: ['Tap a shelf and it comes down onto the counter.', 'Swipe it across the scanner. It beeps. If it does not beep, it is not sold.', 'Then flick it up the counter to them. Flick the wrong thing and they get cross.', 'Some pay exact. Some hand you a note and you make the change. Count it.', 'A shelf runs dry, hold its button and I bring a box up from the back.'],
  cabs: ['Eight cabinets. Four each wall. Every game on this planet, shrunk down and put in a box.', 'Walk up to one and press PLAY. Your best goes on the board, and once you have played one, folk will buy passes for it at the counter.'],
  sign: ['It is YOUR clubhouse. Paint what you like on the sign. I will tell everyone it was always called that.'],
  later: ['Counter is here. So am I. Always am.']};
const SAVE = { day: 'club8.day', shifts: 'store.shifts', sales: 'store.sales', best: 'store.best.', upg: 'club8.upg.', cab: 'club8.cab.', hired: 'club8.hired', uniform: 'club8Uniform', clean: 'store.clean' };

// ---------------- the room ----------------
export function buildClub8(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, grad, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const ox = origin.x, oz = origin.z, W = 14, D = 12, H = 4.8, KZ = -2.4, T = 1.1;
  const TM = map => new T3.MeshToonMaterial({ map, gradientMap: grad });
  const gold = toon('#e6b45a'), goldD = toon('#a8792e'), ink = toon('#14121f'), plum = toon('#1e3a8a'), plumD = toon('#172554'), lilac = toon('#7dd3fc'), cream = toon('#fbf8ec'), wood = toon('#6b3f24'), woodD = toon('#4a2a16');
  // floor: arcade carpet (dark plum with neon confetti + little 8s)
  const floorT = CTX(256, 256, c => { c.fillStyle = '#0b1a33'; c.fillRect(0, 0, 256, 256); const cols = ['#38bdf8', '#38bdf8', '#facc15', '#4ade80', '#38bdf8'];
    for (let i = 0; i < 46; i++) { c.fillStyle = cols[i % 5]; c.save(); c.translate((i * 97) % 256, (i * 57) % 256); c.rotate(i); if (i % 3 === 0) { c.font = '900 22px Archivo, Arial'; c.fillText('8', -6, 8); } else if (i % 3 === 1) c.fillRect(-7, -2, 14, 4); else { c.beginPath(); c.arc(0, 0, 4, 0, 7); c.fill(); } c.restore(); } });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 3, D / 3);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), TM(floorT)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  // the square outside the door
  { const st = CTX(256, 256, c => { c.fillStyle = '#cfcbe0'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#b4aecb'; c.lineWidth = 4; for (let y = 0; y < 256; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); for (let x = (y / 32) % 2 * 24; x < 256; x += 48) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } } }); st.wrapS = st.wrapT = T3.RepeatWrapping; st.repeat.set(5, 2);
    const sp = new T3.Mesh(new T3.PlaneGeometry(W + 10, 7), TM(st)); sp.rotation.x = -Math.PI / 2; sp.position.set(0, -0.004, D / 2 + 3.5); sp.receiveShadow = true; root.add(sp); }
  // walls: plum panels over a gold-trimmed wainscot, little lilac stars
  const wallT = CTX(256, 256, c => { c.fillStyle = '#13284d'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#1a3563'; for (let x = 0; x < 256; x += 64) c.fillRect(x + 6, 10, 52, 140); c.fillStyle = '#7dd3fc'; for (let i = 0; i < 10; i++) { c.beginPath(); c.arc((i * 71) % 256, 20 + (i * 43) % 120, 1.6, 0, 7); c.fill(); }
    c.fillStyle = '#e6b45a'; c.fillRect(0, 156, 256, 8); c.fillStyle = '#0b1a33'; c.fillRect(0, 164, 256, 92); c.fillStyle = '#102a52'; for (let x = 0; x < 256; x += 32) c.fillRect(x + 3, 170, 26, 80); });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1); const wallM = TM(wallT);
  const cut = [], front = [];
  for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); }
  { const ceil = M(new T3.BoxGeometry(W, 0.16, D), toon('#0a1630'), 0, H + 0.08, 0, root, 0); cut.push(ceil); }
  // front wall with the door + two windows onto the square (hidden in walk mode so the camera can look in)
  { const sq = CTX(512, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#8fb7e8'); g.addColorStop(0.55, '#dbe7f5'); g.addColorStop(0.56, '#cfcbe0'); g.addColorStop(1, '#b4aecb'); c.fillStyle = g; c.fillRect(0, 0, 512, 256);
      c.fillStyle = '#efe7d6'; c.fillRect(30, 70, 150, 72); c.fillRect(330, 50, 160, 92); c.fillStyle = '#c2963f'; c.fillRect(30, 62, 150, 10); c.fillRect(330, 42, 160, 10); c.fillStyle = '#1d4ed8'; c.fillRect(60, 100, 26, 42); c.fillRect(370, 90, 30, 52); c.fillStyle = '#7dd3fc'; c.fillRect(110, 92, 40, 18); c.fillRect(420, 80, 40, 18); });
    const fw = new T3.Group(); root.add(fw); front.push(fw);
    const seg = (x0, x1, y0, y1) => { const m = new T3.Mesh(new T3.PlaneGeometry(x1 - x0, y1 - y0), wallM); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, D / 2); m.rotation.y = Math.PI; fw.add(m); };
    seg(-7, -5.6, 0, H); seg(5.6, 7, 0, H); seg(-1.9, -1.3, 0, H); seg(1.3, 1.9, 0, H); seg(-1.3, 1.3, 3.1, H); seg(-5.6, -1.9, 0, 1.0); seg(1.9, 5.6, 0, 1.0); seg(-5.6, -1.9, 3.5, H); seg(1.9, 5.6, 3.5, H);
    for (const cx of [-3.75, 3.75]) { const win = new T3.Mesh(new T3.PlaneGeometry(3.7, 2.5), new T3.MeshBasicMaterial({ map: sq })); win.position.set(cx, 2.25, D / 2 + 0.02); win.rotation.y = Math.PI; fw.add(win); for (const dx of [-1.85, 0, 1.85]) M(new T3.BoxGeometry(0.1, 2.6, 0.12), gold, cx + dx, 2.25, D / 2 - 0.04, fw, 0.01); M(new T3.BoxGeometry(3.8, 0.1, 0.14), gold, cx, 3.5, D / 2 - 0.04, fw, 0.01); }
    for (const dx of [-1.35, 1.35]) M(new T3.BoxGeometry(0.16, 3.1, 0.2), gold, dx, 1.55, D / 2 - 0.05, fw, 0.01); M(new T3.BoxGeometry(2.86, 0.16, 0.2), gold, 0, 3.12, D / 2 - 0.05, fw, 0.01); }
  // ---- THE COUNTER: plum + gold, a glass front showing prizes ----
  const L = 2.9;
  const counterT = CTX(512, 128, c => { c.fillStyle = '#1e3a8a'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 512, 7); c.fillRect(0, 121, 512, 7); c.fillStyle = '#7dd3fc'; c.font = '900 60px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; for (let x = 64; x < 512; x += 128) c.fillText('8', x, 66); c.strokeStyle = '#38bdf8'; c.lineWidth = 3; for (let x = 0; x < 512; x += 128) c.strokeRect(x + 14, 18, 100, 92); });
  counterT.wrapS = T3.RepeatWrapping; counterT.repeat.set(2, 1);
  { const body = new T3.Mesh(new T3.BoxGeometry(L * 2, T - 0.06, 0.9), [plum, plum, plum, plum, TM(counterT), plumD]); body.position.set(0, (T - 0.06) / 2, KZ); body.castShadow = body.receiveShadow = true; ctx.addOutline && ctx.addOutline(body, 0.02); root.add(body);
    M(new T3.BoxGeometry(L * 2 + 0.12, 0.06, 1.0), toon('#eef6ff'), 0, T - 0.03, KZ, root, 0.012); M(new T3.BoxGeometry(L * 2 + 0.12, 0.05, 0.05), gold, 0, 0.12, KZ + 0.48, root, 0.008);
    // side returns: the right one has the hatch
    M(new T3.BoxGeometry(W / 2 - L, T, 0.5), plum, -(L + (W / 2 - L) / 2), T / 2, KZ, root, 0.015); M(new T3.BoxGeometry(W / 2 - L - 1.1, T, 0.5), plum, L + 1.1 + (W / 2 - L - 1.1) / 2, T / 2, KZ, root, 0.015);
    M(new T3.BoxGeometry(1.06, T - 0.25, 0.06), wood, L + 0.55, (T - 0.25) / 2 + 0.1, KZ, root, 0.01); M(new T3.BoxGeometry(1.06, 0.06, 0.08), gold, L + 0.55, T - 0.12, KZ, root, 0.006); }
  const P = (x, z, y = T) => new T3.Vector3(ox + x, y, oz + z);
  const K = { root, z: KZ, T, W, D, cut, front, origin, top: T };
  // where things happen on the counter (worker side = -z, customers +z)
  // the worker faces +z, so the world's -x is on the worker's (and the work camera's) RIGHT: pick on the left, scan, bag + till on the right
  K.pickSpot = P(1.05, KZ - 0.1); K.scanner = P(0.2, KZ - 0.05); K.bagSpot = P(-0.6, KZ - 0.05); K.register = P(-1.75, KZ - 0.05); K.handoff = P(0.0, KZ + 0.34);
  K.front = front; K.spots = [P(0, KZ + 1.15, 0), P(-1.0, KZ + 2.25, 0), P(1.0, KZ + 2.25, 0), P(0, KZ + 3.35, 0)];
  K.workSpot = P(0, KZ - 0.8, 0); K.pipWork = P(2.4, KZ - 0.85, 0); K.keeperSpot = P(0.4, KZ - 0.85, 0); K.talkSpot = P(0.4, KZ + 1.0, 0);
  // the scanner: a glass window in the counter with a red laser that brightens on a beep
  { const sx = K.scanner.x - ox, sz = K.scanner.z - oz; M(new T3.BoxGeometry(0.62, 0.02, 0.46), ink, sx, T + 0.005, sz, root, 0.006);
    const glass = new T3.Mesh(new T3.PlaneGeometry(0.5, 0.34), new T3.MeshBasicMaterial({ color: 0x7f1d1d })); glass.rotation.x = -Math.PI / 2; glass.position.set(sx, T + 0.018, sz); root.add(glass);
    const lz = []; for (const a of [-0.5, 0, 0.5]) { const l = new T3.Mesh(new T3.PlaneGeometry(0.46, 0.012), new T3.MeshBasicMaterial({ color: 0xff3b3b, transparent: true, opacity: 0.85 })); l.rotation.x = -Math.PI / 2; l.rotation.z = a; l.position.set(sx, T + 0.02, sz); root.add(l); lz.push(l); }
    K.laser = lz; K.scanGlass = glass; }
  // shelves behind the counter: six bins (one per stock line), each with a little stack you can see run down
  const backG = new T3.Group(); root.add(backG); K.back = backG;
  K.bins = {}; const binX = [2.5, 1.5, 0.5, -0.5, -1.5, -2.5];
  { M(new T3.BoxGeometry(W - 0.4, 1.3, 0.6), plumD, 0, 0.65, -D / 2 + 0.34, backG, 0.015); M(new T3.BoxGeometry(W - 0.3, 0.05, 0.66), toon('#eef6ff'), 0, 1.32, -D / 2 + 0.34, backG, 0.01);
    for (const y of [2.0, 2.6]) M(new T3.BoxGeometry(6.4, 0.05, 0.34), wood, 0, y, -D / 2 + 0.2, backG, 0.01);
    binX.forEach((x, i) => { const s = new T3.Group(); s.position.set(x, 1.35, -D / 2 + 0.34); backG.add(s); K.bins[i] = { g: s, x: ox + x, z: oz - D / 2 + 0.34 }; M(new T3.BoxGeometry(0.8, 0.12, 0.5), gold, 0, 0.06, 0, s, 0.008); }); }
  // the big prize wall over the shelves: plush foxes on hooks + the CREST 8 + the banner, and the sign with the club's name
  { const prize = (x, y, col) => { const g = new T3.Group(); g.position.set(x, y, -D / 2 + 0.25); root.add(g); M(new T3.SphereGeometry(0.17, 12, 10), toon(col), 0, 0, 0, g, 0.01, 0.17); for (const s of [-1, 1]) M(new T3.ConeGeometry(0.07, 0.14, 4), toon(col), s * 0.1, 0.17, 0, g, 0.006); M(new T3.SphereGeometry(0.07, 8, 6), cream, 0, -0.06, 0.13, g, 0.004, 0.07); };
    [[-5.6, 2.35], [-4.9, 2.35], [-5.25, 2.9], [4.9, 2.35], [5.6, 2.35], [5.25, 2.9]].forEach(([x, y], i) => prize(x, y, ['#f2741f', '#38bdf8', '#38bdf8', '#38bdf8', '#4ade80', '#facc15'][i]));
    const crestT = CTX(256, 256, c => { c.clearRect(0, 0, 256, 256); c.fillStyle = '#e6b45a'; c.beginPath(); c.arc(128, 128, 118, 0, 7); c.fill(); c.fillStyle = '#172554'; c.beginPath(); c.arc(128, 128, 98, 0, 7); c.fill(); c.strokeStyle = '#7dd3fc'; c.lineWidth = 6; c.beginPath(); c.arc(128, 128, 84, 0, 7); c.stroke(); c.fillStyle = '#ffd23a'; c.font = '900 150px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', 128, 138); });
    const cr = new T3.Mesh(new T3.CircleGeometry(0.75, 40), new T3.MeshBasicMaterial({ map: crestT, transparent: true })); cr.position.set(-3.6, 3.55, -D / 2 + 0.05); root.add(cr); K.crest = cr;
    const banT = CTX(128, 256, c => { c.fillStyle = '#1d4ed8'; c.fillRect(0, 0, 128, 220); c.beginPath(); c.moveTo(0, 220); c.lineTo(64, 256); c.lineTo(128, 220); c.fill(); c.fillStyle = '#e6b45a'; c.fillRect(0, 0, 128, 10); c.beginPath(); c.arc(64, 110, 44, 0, 7); c.fill(); c.fillStyle = '#1e3a8a'; c.font = '900 64px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', 64, 114); });
    const bn = new T3.Mesh(new T3.PlaneGeometry(0.8, 1.6), new T3.MeshBasicMaterial({ map: banT, transparent: true })); bn.position.set(3.6, 3.45, -D / 2 + 0.05); root.add(bn); M(new T3.CylinderGeometry(0.02, 0.02, 0.9, 6), gold, 3.6, 4.27, -D / 2 + 0.08, root, 0).rotation.z = Math.PI / 2;
    // the sign over the counter (repainted when the player names the club)
    const signCv = document.createElement('canvas'); signCv.width = 1024; signCv.height = 256; const signTx = new T3.CanvasTexture(signCv); signTx.colorSpace = T3.SRGBColorSpace;
    const sg = new T3.Mesh(new T3.PlaneGeometry(4.2, 1.05), new T3.MeshBasicMaterial({ map: signTx, transparent: true })); sg.position.set(0, 3.55, -D / 2 + 0.06); root.add(sg);
    K.paintSign = name => { const c = signCv.getContext('2d'); c.clearRect(0, 0, 1024, 256); c.fillStyle = '#14121f'; c.beginPath(); c.roundRect(10, 20, 1004, 216, 30); c.fill(); c.lineWidth = 10; c.strokeStyle = '#e6b45a'; c.stroke();
      c.textAlign = 'center'; c.textBaseline = 'middle'; let fs = 130; c.font = `italic 900 ${fs}px Archivo, Arial`; while (c.measureText(name).width > 900 && fs > 50) { fs -= 6; c.font = `italic 900 ${fs}px Archivo, Arial`; }
      c.shadowColor = '#38bdf8'; c.shadowBlur = 26; c.lineWidth = 8; c.strokeStyle = '#e0f2fe'; c.strokeText(name, 512, 134); c.fillStyle = '#38bdf8'; c.fillText(name, 512, 134); c.shadowBlur = 0; signTx.needsUpdate = true; }; }
  // ---- 8 ARCADE CABINETS, 4 each wall ----
  K.cabs = []; const cabZ = [-0.55, 1.15, 2.85, 4.55];
  CABINETS.forEach((cd, i) => { const side = i < 4 ? -1 : 1, z = cabZ[i % 4], x = side * (W / 2 - 0.62), g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = -side * Math.PI / 2; root.add(g);
    const bodyM = toon(['#1d4ed8', '#1d4ed8', '#be123c', '#047857', '#b45309', '#c2410c', '#1e40af', '#334155'][i]);
    M(new T3.BoxGeometry(0.9, 1.9, 0.8), bodyM, 0, 0.95, 0, g, 0.015); M(new T3.BoxGeometry(0.92, 0.06, 0.82), gold, 0, 1.9, 0, g, 0.006);
    const panel = M(new T3.BoxGeometry(0.86, 0.12, 0.42), ink, 0, 1.05, 0.48, g, 0.008); panel.rotation.x = 0.25;
    M(new T3.CylinderGeometry(0.02, 0.02, 0.14, 6), cream, -0.18, 1.18, 0.5, g, 0.004); M(new T3.SphereGeometry(0.045, 10, 8), toon('#ef4444'), -0.18, 1.26, 0.5, g, 0.004, 0.045);
    for (const [bx, col] of [[0.08, '#facc15'], [0.22, '#38bdf8']]) M(new T3.CylinderGeometry(0.045, 0.045, 0.03, 12), toon(col), bx, 1.13, 0.5, g, 0.004, 0.045);
    // screen (a live canvas)
    const cv = document.createElement('canvas'); cv.width = CAB_W; cv.height = CAB_H; const tx = new T3.CanvasTexture(cv); tx.colorSpace = T3.SRGBColorSpace;
    const scr = new T3.Mesh(new T3.PlaneGeometry(0.62, 0.775), new T3.MeshBasicMaterial({ map: tx, toneMapped: false })); scr.position.set(0, 1.5, 0.425); scr.rotation.x = -0.12; g.add(scr);
    M(new T3.BoxGeometry(0.72, 0.88, 0.04), ink, 0, 1.5, 0.39, g, 0).rotation.x = -0.12;
    // marquee
    const mq = CTX(256, 64, c => { c.fillStyle = '#05060f'; c.fillRect(0, 0, 256, 64); c.strokeStyle = cd.col; c.lineWidth = 4; c.strokeRect(4, 4, 248, 56); c.fillStyle = cd.col; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; let fs = 30; while (c.measureText(cd.name).width > 230) { fs -= 2; c.font = `900 ${fs}px Archivo, Arial`; } c.fillText(cd.name, 128, 34); });
    const mm = new T3.Mesh(new T3.PlaneGeometry(0.86, 0.22), new T3.MeshBasicMaterial({ map: mq, toneMapped: false })); mm.position.set(0, 2.08, 0.32); g.add(mm); M(new T3.BoxGeometry(0.9, 0.28, 0.2), bodyM, 0, 2.06, 0.2, g, 0.008);
    root.updateMatrixWorld(true); const sw = new T3.Vector3(); scr.getWorldPosition(sw); const nrm = new T3.Vector3(0, 0, 1).applyQuaternion(g.quaternion);
    K.cabs.push({ ...cd, i, side, g, cv, ctx: cv.getContext('2d'), tex: tx, scr, screen: sw, normal: nrm, stand: P(x - side * 1.25, z, 0), x: ox + x, z: oz + z }); });
  // ---- the lounge: two sofas + low tables + a round rug in the middle of the floor, leaving the aisle to the counter clear ----
  const colliders = [], seats = [];
  colliders.push({ type: 'box', x0: -W / 2, x1: W / 2, z0: -D / 2, z1: KZ + 0.45 + 0.28 });
  K.cabs.forEach(c => colliders.push({ type: 'circle', x: c.x - ox, z: c.z - oz, r: 0.62 }));
  { const rugT = CTX(256, 256, c => { c.fillStyle = '#1d4ed8'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = '#e6b45a'; c.lineWidth = 8; c.beginPath(); c.arc(128, 128, 112, 0, 7); c.stroke(); c.fillStyle = '#7dd3fc'; c.font = '900 120px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('8', 128, 136); });
    const rug = new T3.Mesh(new T3.CircleGeometry(1.3, 40), new T3.MeshBasicMaterial({ map: rugT, transparent: true })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.006, 3.1); root.add(rug); }
  const sofa = (x, z, ry) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); const fab = toon('#0284c7'), fabD = toon('#075985');
    M(new T3.BoxGeometry(2.0, 0.42, 0.85), fab, 0, 0.32, 0, g, 0.012); M(new T3.BoxGeometry(2.0, 0.6, 0.22), fabD, 0, 0.72, -0.36, g, 0.012); for (const s of [-1, 1]) M(new T3.BoxGeometry(0.22, 0.6, 0.85), fabD, s * 1.0, 0.45, 0, g, 0.012);
    for (const s of [-0.5, 0.5]) { const v = new T3.Vector3(s, 0, 0.05).applyAxisAngle(new T3.Vector3(0, 1, 0), ry); seats.push({ x: ox + x + v.x, z: oz + z + v.z, ry, y: 0.62 }); }
    colliders.push({ type: 'circle', x: x + Math.sin(ry) * -0.1 + Math.cos(ry) * -0.55, z: z + Math.cos(ry) * -0.1 - Math.sin(ry) * -0.55, r: 0.55 }); colliders.push({ type: 'circle', x: x + Math.sin(ry) * -0.1 + Math.cos(ry) * 0.55, z: z + Math.cos(ry) * -0.1 - Math.sin(ry) * 0.55, r: 0.55 }); };
  sofa(-3.5, 3.0, Math.PI / 2); sofa(3.5, 3.0, -Math.PI / 2);
  for (const x of [-2.3, 2.3]) { M(new T3.CylinderGeometry(0.42, 0.42, 0.06, 20), toon('#eef6ff'), x, 0.46, 3.0, root, 0.008, 0.42); M(new T3.CylinderGeometry(0.06, 0.08, 0.44, 8), gold, x, 0.22, 3.0, root, 0.006); colliders.push({ type: 'circle', x, z: 3.0, r: 0.45 });
    M(new T3.CylinderGeometry(0.05, 0.04, 0.12, 10), toon('#38bdf8'), x - 0.1, 0.55, 3.0, root, 0.004); M(new T3.BoxGeometry(0.14, 0.12, 0.1), toon('#f87171'), x + 0.14, 0.55, 2.95, root, 0.004); }
  // 8 lamps: two rows of four pendant globes
  const lamps = []; for (const z of [0.2, 3.4]) for (const x of [-4.5, -1.5, 1.5, 4.5]) { M(new T3.CylinderGeometry(0.008, 0.008, 1.2, 4), ink, x, H - 0.6, z, root, 0); const b = M(new T3.SphereGeometry(0.2, 14, 10), toon('#fff6d8', { emissive: '#ffd890', emissiveIntensity: 1 }), x, H - 1.25, z, root, 0.008, 0.2); M(new T3.CylinderGeometry(0.08, 0.12, 0.08, 10), gold, x, H - 1.04, z, root, 0.004); lamps.push(b); }
  K.lamps = lamps;
  // ---- POLISH: neon tubes, light pools, cabinet glow on the floor, a mirror ball, drifting sparkles, plants, a door mat ----
  const radT = CTX(128, 128, c => { const g = c.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  const addM = (col, op = 0.5) => new T3.MeshBasicMaterial({ map: radT, color: new T3.Color(col), transparent: true, opacity: op, blending: T3.AdditiveBlending, depthWrite: false });
  const pool = (x, z, r, col, op) => { const m = new T3.Mesh(new T3.PlaneGeometry(r * 2, r * 2), addM(col, op)); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.012, z); m.renderOrder = 2; root.add(m); return m; };
  const neonM = col => new T3.MeshBasicMaterial({ color: new T3.Color(col), toneMapped: false });
  const neons = [];
  const tube = (x, y, z, len, axis, col, par = root) => { const g = new T3.Group(); g.position.set(x, y, z); par.add(g); const m = new T3.Mesh(new T3.CylinderGeometry(0.03, 0.03, len, 8), neonM(col)); if (axis === 'x') m.rotation.z = Math.PI / 2; else if (axis === 'z') m.rotation.x = Math.PI / 2; g.add(m);
    const halo = new T3.Mesh(new T3.PlaneGeometry(axis === 'y' ? 0.5 : len + 0.4, axis === 'y' ? len + 0.4 : 0.5), new T3.MeshBasicMaterial({ map: radT, color: new T3.Color(col), transparent: true, opacity: 0.55, blending: T3.AdditiveBlending, depthWrite: false })); halo.scale.set(1, 1, 1); if (axis === 'z') halo.rotation.y = Math.PI / 2; g.add(halo); neons.push({ m, halo, ph: neons.length * 1.7 }); return g; };
  // a cyan tube along the top of each side wall, a pink one over the back shelves, gold verticals at the corners
  tube(-W / 2 + 0.06, 4.35, 0.6, D - 1.4, 'z', '#22d3ee').children[1].rotation.y = Math.PI / 2; tube(W / 2 - 0.06, 4.35, 0.6, D - 1.4, 'z', '#22d3ee').children[1].rotation.y = -Math.PI / 2;
  tube(0, 4.45, -D / 2 + 0.08, W - 1.2, 'x', '#f472b6', backG);
  for (const sx of [-1, 1]) tube(sx * (W / 2 - 0.08), 2.4, -D / 2 + 0.08, 3.6, 'y', '#facc15', backG);
  // counter underglow + its light on the floor
  M(new T3.BoxGeometry(2 * 2.9, 0.035, 0.03), neonM('#38bdf8'), 0, 0.08, KZ + 0.47, root, 0); pool(0, KZ + 0.95, 3.2, '#38bdf8', 0.35).scale.set(1.9, 0.45, 1);
  // pools of lamp light on the carpet
  K.lamps.forEach(l => pool(l.position.x, l.position.z, 1.25, '#ffd9a0', 0.22));
  // each cabinet throws its colour onto the floor in front of it
  const spills = K.cabs.map(c => { const p = pool(c.x - ox - c.side * 0.95, c.z - oz, 0.95, c.col, 0.4); const mg = new T3.Mesh(new T3.PlaneGeometry(1.3, 0.5), new T3.MeshBasicMaterial({ map: radT, color: new T3.Color(c.col), transparent: true, opacity: 0.6, blending: T3.AdditiveBlending, depthWrite: false })); mg.position.set(0, 2.08, 0.34); c.g.add(mg); return { p, mg, ph: c.i * 0.9 }; });
  // mirror ball over the lounge, throwing specks that crawl across the carpet
  const ball = new T3.Group(); ball.position.set(0, H - 0.75, 2.2); root.add(ball); M(new T3.CylinderGeometry(0.01, 0.01, 0.6, 4), ink, 0, 0.45, 0, ball, 0);
  { const bm = new T3.Mesh(new T3.IcosahedronGeometry(0.32, 2), new T3.MeshStandardMaterial({ color: 0xdbeafe, metalness: 1, roughness: 0.15, flatShading: true, emissive: 0x1e3a8a, emissiveIntensity: 0.4 })); ball.add(bm); ball.userData.m = bm; }
  const specks = new T3.Group(); specks.position.set(0, 0.014, 2.2); root.add(specks); { const cols = ['#ffffff', '#7dd3fc', '#f9a8d4', '#fde68a']; for (let i = 0; i < 46; i++) { const a = i * 2.39996, r = 1.2 + (i * 0.618 % 1) * 4.2, m = new T3.Mesh(new T3.PlaneGeometry(0.22, 0.22), addM(cols[i % 4], 0.55)); m.rotation.x = -Math.PI / 2; m.position.set(Math.cos(a) * r, 0, Math.sin(a) * r * 0.85); m.renderOrder = 3; specks.add(m); } }
  // drifting sparkles in the air
  const SP = 70, spPos = new Float32Array(SP * 3), spSeed = []; for (let i = 0; i < SP; i++) { spPos.set([(Math.random() - 0.5) * (W - 1), 0.4 + Math.random() * 3.6, -D / 2 + 1 + Math.random() * (D - 1.5)], i * 3); spSeed.push(Math.random() * 6.28); }
  const spGeo = new T3.BufferGeometry(); spGeo.setAttribute('position', new T3.BufferAttribute(spPos, 3));
  const sparkles = new T3.Points(spGeo, new T3.PointsMaterial({ map: radT, color: 0x93c5fd, size: 0.09, transparent: true, opacity: 0.8, blending: T3.AdditiveBlending, depthWrite: false })); root.add(sparkles);
  // plants in the front corners + a welcome mat
  for (const [x, z] of [[-W / 2 + 0.55, D / 2 - 0.55], [W / 2 - 0.55, D / 2 - 0.55]]) { M(new T3.CylinderGeometry(0.32, 0.25, 0.55, 12), toon('#1e3a8a'), x, 0.28, z, root, 0.01, 0.32); M(new T3.CylinderGeometry(0.34, 0.34, 0.06, 12), gold, x, 0.56, z, root, 0.006, 0.34); for (let i = 0; i < 9; i++) { const lf = M(new T3.ConeGeometry(0.12, 1.25, 5), toon(i % 2 ? '#15803d' : '#22c55e'), x + Math.cos(i * 0.7) * 0.13, 1.1, z + Math.sin(i * 0.7) * 0.13, root, 0.006); lf.rotation.set(Math.sin(i * 0.7) * 0.45, 0, -Math.cos(i * 0.7) * 0.45); } colliders.push({ type: 'circle', x, z, r: 0.4 }); }
  { const matT = CTX(256, 128, c => { c.fillStyle = '#172554'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#e6b45a'; c.lineWidth = 6; c.strokeRect(8, 8, 240, 112); c.fillStyle = '#7dd3fc'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('WELCOME', 128, 64); }); const mat = new T3.Mesh(new T3.PlaneGeometry(1.8, 0.9), TM(matT)); mat.rotation.x = -Math.PI / 2; mat.rotation.z = Math.PI; mat.position.set(0, 0.008, D / 2 - 0.7); mat.receiveShadow = true; root.add(mat); }
  // daylight shafts through the two front windows
  const shaftT = CTX(64, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.3, 'rgba(255,255,255,0.7)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); });
  const shafts = []; for (const cx of [-3.75, 3.75]) for (const dx of [-1.1, 0, 1.1]) { const m = new T3.Mesh(new T3.PlaneGeometry(0.9, 5.2), new T3.MeshBasicMaterial({ map: shaftT, color: 0xbfe3ff, transparent: true, opacity: 0.1, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide })); m.position.set(cx + dx, 1.5, D / 2 - 1.7); m.rotation.set(-0.95, 0, 0); m.renderOrder = 4; root.add(m); shafts.push(m); }
  K.anim = (t, dt) => { shafts.forEach((m, i) => m.material.opacity = 0.08 + 0.03 * Math.sin(t * 0.7 + i)); ball.rotation.y += dt * 0.5; specks.rotation.y -= dt * 0.12; specks.children.forEach((m, i) => m.material.opacity = 0.32 + 0.3 * Math.sin(t * 2.2 + i)); neons.forEach(n => { const f = 0.5 + 0.08 * Math.sin(t * 3 + n.ph) + (Math.random() < 0.004 ? -0.3 : 0); n.halo.material.opacity = f; });
    spills.forEach(s => { s.p.material.opacity = 0.32 + 0.1 * Math.sin(t * 4 + s.ph); s.mg.material.opacity = 0.5 + 0.12 * Math.sin(t * 3 + s.ph); });
    const a = spGeo.attributes.position; for (let i = 0; i < SP; i++) { let y = a.getY(i) + dt * 0.12; if (y > 4.2) y = 0.4; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(t + spSeed[i]) * dt * 0.05); } a.needsUpdate = true; sparkles.material.opacity = 0.55 + 0.25 * Math.sin(t * 1.5); };
  K.colliders = colliders.map(c => c.type === 'box' ? { ...c, x0: c.x0 + ox, x1: c.x1 + ox, z0: c.z0 + oz, z1: c.z1 + oz } : { ...c, x: c.x + ox, z: c.z + oz }); K.seats = seats; K.door = { x: ox, z: oz + D / 2, w: 2.4 };
  K.walkBox = { x0: ox - W / 2 + 0.35, x1: ox + W / 2 - 0.35, z0: oz + KZ + 0.73, z1: oz + D / 2 - 0.3 };
  return K;
}
// ---------------- the game ----------------
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
export async function createClub8Shift({ container, onState = () => {}, mode = 'intro', onExit = null }) {
  const ST = createStage(container, { bg: '#0a1630' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildClub8({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.T, KZ = K.z; scene.fog = new THREE.Fog(0x0a1630, 14, 34);
  scene.children.filter(o => o.isHemisphereLight).forEach(h => { h.color.set(0xe0f2fe); h.groundColor.set(0x1e3a8a); h.intensity = 1.05; });
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd9a0, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); l.getWorldPosition(s.position); s.scale.setScalar(1.4); scene.add(s); return s; });
  { const pk = new THREE.PointLight(0x38bdf8, 0.9, 9, 1.6); pk.position.set(0, 3.2, KZ - 1.5); scene.add(pk); const bl = new THREE.PointLight(0x60a5fa, 0.7, 12, 1.6); bl.position.set(0, 3, 3); scene.add(bl); const wm = new THREE.PointLight(0xffc98a, 0.8, 7, 1.6); wm.position.set(0.3, 2.2, KZ + 0.6); scene.add(wm); }
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  // ---------- SOUND: a little synth with a room reverb, so every effect sits in the same clubhouse ----------
  const FX = { bus: null };
  function fxBus() { const ac = audio.ctx; if (!ac) return null; if (FX.bus) return FX.bus; const inp = ac.createGain(), dry = ac.createGain(), wet = ac.createGain(), cv = ac.createConvolver(); dry.gain.value = 0.9; wet.gain.value = 0.2;
    const len = Math.floor(ac.sampleRate * 1.1), buf = ac.createBuffer(2, len, ac.sampleRate); for (let c = 0; c < 2; c++) { const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.4); } cv.buffer = buf;
    inp.connect(dry); inp.connect(cv); cv.connect(wet); dry.connect(audio.master); wet.connect(audio.master); FX.bus = inp; return inp; }
  function out(ac, node, pan) { const b = fxBus(); if (pan && ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = clamp(pan, -1, 1); node.connect(p); p.connect(b); } else node.connect(b); }
  function osc(type, f, t0, dur, v, { f2, pan = 0, a = 0.004, cut } = {}) { const ac = audio.ctx, o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + a); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); let n = o; if (cut) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = cut; o.connect(fl); n = fl; } n.connect(g); out(ac, g, pan); o.start(t0); o.stop(t0 + dur + 0.03); }
  function nz(t0, dur, v, type, f, { f2, q = 1, pan = 0 } = {}) { const ac = audio.ctx; if (!audio.noise) return; const s = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = audio.noise; fl.type = type; fl.frequency.setValueAtTime(f, t0); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + dur); fl.Q.value = q;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); s.connect(fl); fl.connect(g); out(ac, g, pan); s.start(t0, Math.random() * 1.5); s.stop(t0 + dur + 0.03); }
  const bell = (f, t0, v, dur = 1.1, pan = 0) => [[1, 1], [2.76, 0.45], [5.4, 0.22], [8.93, 0.1]].forEach(([r, k]) => { if (f * r < 15000) osc('sine', f * r, t0, dur / Math.sqrt(r), v * k, { pan }); });
  const sfx = (k, o = {}) => { if (!audio.ctx || audio.muted) return; const t = audio.ctx.currentTime + 0.005, p = o.pan || 0;
    switch (k) {
      case 'good': [72, 76, 79].forEach((m, i) => { osc('triangle', midiHz(m), t + i * 0.06, 0.22, 0.07, { pan: p }); osc('sine', midiHz(m + 12), t + i * 0.06, 0.18, 0.03); }); break;
      case 'bad': osc('sawtooth', 110, t, 0.28, 0.07, { cut: 900 }); osc('sawtooth', 116.5, t, 0.28, 0.07, { cut: 900 }); break;
      case 'beep': osc('square', 2730, t, 0.1, 0.045, { cut: 6000 }); osc('sine', 1365, t, 0.1, 0.03); break;
      case 'click': nz(t, 0.025, 0.12, 'highpass', 4000); osc('sine', 1800, t, 0.03, 0.03); break;
      case 'ui': osc('sine', 1320, t, 0.05, 0.03); nz(t, 0.02, 0.05, 'highpass', 5000); break;
      case 'serve': nz(t, 0.09, 0.14, 'bandpass', 2600, { q: 2 }); nz(t + 0.05, 0.25, 0.06, 'bandpass', 5000, { q: 4 }); bell(2093, t + 0.08, 0.05, 0.9); bell(2637, t + 0.16, 0.04, 0.9); break;
      case 'whoosh': nz(t, 0.24 / (o.power || 1), 0.16, 'bandpass', 500, { f2: 3400, q: 1.6, pan: p }); break;
      case 'slide': nz(t, 0.3, 0.07, 'bandpass', 900, { f2: 1600, q: 3 }); break;
      case 'thud': osc('sine', 150, t, 0.14, 0.18, { f2: 55 }); nz(t, 0.06, 0.08, 'lowpass', 700); break;
      case 'drop': osc('sine', 420, t, 0.08, 0.06, { f2: 180 }); nz(t, 0.04, 0.06, 'lowpass', 1500); break;
      case 'restock': nz(t, 0.08, 0.12, 'lowpass', 900); nz(t + 0.11, 0.08, 0.1, 'lowpass', 800); [76, 81, 88].forEach((m, i) => osc('sine', midiHz(m), t + 0.2 + i * 0.05, 0.25, 0.04)); break;
      case 'coin': { const f = 1900 + (o.v || 1) * 30; osc('sine', f, t, 0.35, 0.06); osc('sine', f * 1.34, t, 0.25, 0.035); osc('sine', f * 2.1, t, 0.12, 0.02); nz(t, 0.02, 0.08, 'highpass', 6000); break; }
      case 'chime': bell(1318.5, t, 0.05, 1.2, -0.3); bell(1046.5, t + 0.22, 0.05, 1.4, -0.3); break;
      case 'pop': osc('sine', 500, t, 0.09, 0.08, { f2: 1100 }); break;
      case 'happy': osc('sine', 520, t, 0.12, 0.05, { f2: 780, pan: p }); osc('sine', 780, t + 0.12, 0.16, 0.05, { f2: 1040, pan: p }); break;
      case 'grumble': osc('sawtooth', 190, t, 0.38, 0.05, { f2: 105, cut: 700, pan: p }); break;
      case 'tick': osc('sine', 1600, t, 0.045, 0.06); nz(t, 0.015, 0.06, 'highpass', 3000); break;
      case 'start': [67, 72, 76, 79].forEach((m, i) => osc('square', midiHz(m), t + i * 0.07, 0.14, 0.04, { cut: 3500 })); break;
      case 'cabTap': osc('square', 660, t, 0.04, 0.025, { cut: 3000 }); break;
      case 'cabScore': osc('square', 880, t, 0.09, 0.04, { f2: 1320, cut: 4000 }); break;
      case 'cabHit': osc('square', 320, t, 0.28, 0.05, { f2: 70, cut: 2000 }); nz(t, 0.18, 0.06, 'lowpass', 900); break;
      case 'cabOver': [72, 67, 64, 60].forEach((m, i) => osc('square', midiHz(m), t + i * 0.13, 0.16, 0.045, { cut: 2500 })); break;
      case 'arcadeBleep': osc('square', midiHz(o.m || 76), t, 0.06, o.v || 0.012, { pan: p, cut: 3000 }); break;
    } };
  // the room: distant cabinet bleeps panned by where each cabinet is
  let ambT = 1; function ambStep(dt) { if (!audio.ctx || audio.muted || S.phase === 'cab') return; ambT -= dt; if (ambT > 0) return; ambT = rr(0.5, 1.6); const c = pick(K.cabs), cp = camera.position, rx = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const d = V3(c.x - cp.x, 0, c.z - cp.z), pan = clamp(d.dot(rx) / 6, -1, 1), v = clamp(0.03 / (1 + d.length() * 0.35), 0.004, 0.02); const base = pick([72, 74, 76, 79, 81, 84]); for (let i = 0; i < 3; i++) setTimeout(() => sfx('arcadeBleep', { m: base + [0, 4, 7, 12][(Math.random() * 4) | 0], pan, v }), i * 75); }
  function audioOn() { if (!audio.ctx) { audio.init && audio.init(); try { audio.wind.gain.value = 0; audio.wind.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.01); } catch (e) {} } else audio.ctx.resume && audio.ctx.resume(); }
  // ---------- the sign ----------
  const readSign = () => { try { const v = localStorage.getItem(CLUB8.signKey); return v ? String(v) : ''; } catch (e) { return ''; } };
  const S0sign = readSign(); K.paintSign(S0sign || CLUB8.sign);
  try { if (localStorage.getItem('club8.muted') === '1') audio.setMuted(true); } catch (e) {}

  // ---------- cast ----------
  const PIP_LOOK = { ...CAST.player.look, fur: '#f2c08a', furDark: '#c28a4a', muzzle: '#fbe7cf', snout: '#f6d2ad', paw: '#a8742e', tailBase: '#c28a4a', tailMid: '#e8b07a', tailTip: '#ffffff', browColor: '#fff', browWeight: 6 };
  const pip = hideGear(kit.makeFox({ ...CAST.player, look: PIP_LOOK, torso: ['#1d4ed8', '#dbeafe', '#172554'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' }));
  pip.scale.setScalar(0.88); pip.position.copy(K.keeperSpot); scene.add(pip);
  const ben = hideGear(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#1e3a8a', '#1e3a8a', '#e6b45a'], crest: '', gear: 'none', mood: 'happy' })); const BP = ben.userData.P; scene.add(ben);
  const benW = hideGear(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' })); const BW = benW.userData.P; scene.add(benW);
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(128, 104, 74, 0, 7); g.fill(); g.fillStyle = '#172554'; g.beginPath(); g.arc(128, 104, 60, 0, 7); g.fill(); g.fillStyle = '#ffd23a'; g.font = '900 96px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 128, 110);
      g.save(); g.translate(128, 206); g.rotate(-0.05); g.fillStyle = '#14121f'; g.fillRect(-112, -26, 224, 52); g.fillStyle = '#38bdf8'; g.fillRect(-104, -19, 208, 38); g.font = 'italic 900 34px Archivo, Arial'; g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = '#14121f'; g.strokeText('CLUB 8 CREW', 0, 2); g.fillStyle = '#fff'; g.fillText('CLUB 8 CREW', 0, 2); g.restore(); });
    return dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#1d4ed8', towelCol: '#38bdf8' }).parts; })();
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); };
  const custFox = CUSTOMERS.map(cu => { const f = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: cu.fur, furDark: cu.fur, paw: cu.fur }, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  // soft blob shadows (phones run without shadow maps, so every fox gets one)
  const blobT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(0.6, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blobM = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false });
  const addBlob = (f, r = 0.5) => { const b = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), blobM); b.rotation.x = -Math.PI / 2; b.position.y = 0.02; b.renderOrder = 1; f.add(b); return b; };
  [pip, ben, benW, ...custFox].forEach(f => addBlob(f));
  const sitPose = f => { const P = f.userData.P; P.legs[0].rotation.x = P.legs[1].rotation.x = -1.45; P.arms[0].rotation.x = -0.6; P.arms[1].rotation.x = -0.7; };
  const waveArm = (P, s = 1) => P.arms[s > 0 ? 0 : 1].rotation.set(-0.25, 0, s * (-2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32));

  // ---------- items (one little model per thing on the shelves) ----------
  function itemMesh(kind, id) { const g = new THREE.Group(), add = (geo, col, x = 0, y = 0, z = 0, o = 0.006, extra) => { const m = new THREE.Mesh(geo, toon(col, extra)); m.position.set(x, y, z); m.castShadow = true; if (o) addOutline(m, o); g.add(m); return m; };
    if (kind === 'stock' && id === 'token') { add(new THREE.CylinderGeometry(0.07, 0.055, 0.1, 14), '#1d4ed8', 0, 0.05); for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.03, 0.03, 0.012, 12), '#ffd23a', Math.cos(i * 1.3) * 0.025, 0.105 + i * 0.008, Math.sin(i * 1.3) * 0.025, 0.003).rotation.x = 0.4 * (i % 2 ? 1 : -1); }
    else if (kind === 'stock' && id === 'soda') { add(new THREE.CylinderGeometry(0.045, 0.045, 0.14, 14), '#38bdf8', 0, 0.07); add(new THREE.CylinderGeometry(0.046, 0.046, 0.03, 14), '#fbf8ec', 0, 0.08, 0, 0); add(new THREE.CylinderGeometry(0.035, 0.045, 0.015, 14), '#cbd5e1', 0, 0.148, 0, 0.003); }
    else if (kind === 'stock' && id === 'popcorn') { const b = add(new THREE.CylinderGeometry(0.07, 0.05, 0.14, 8), '#fbf8ec', 0, 0.07); for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.02, 0.141, 0.002), '#ef4444', Math.cos(i * 1.57) * 0.061, 0.07, Math.sin(i * 1.57) * 0.061, 0).rotation.y = -i * 1.57 + Math.PI / 2; for (let i = 0; i < 7; i++) add(new THREE.SphereGeometry(0.026, 6, 5), '#fde68a', Math.cos(i) * 0.035, 0.155 + (i % 3) * 0.012, Math.sin(i) * 0.035, 0.003); }
    else if (kind === 'stock' && id === 'candy') { add(new THREE.CapsuleGeometry(0.035, 0.08, 4, 10), '#f472b6', 0, 0.04).rotation.z = Math.PI / 2; for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.03, 0.05, 6), '#fbcfe8', s * 0.085, 0.04).rotation.z = s * Math.PI / 2; }
    else if (kind === 'stock' && id === 'plush') { add(new THREE.SphereGeometry(0.07, 12, 10), '#f2741f', 0, 0.07); for (const s of [-1, 1]) add(new THREE.ConeGeometry(0.03, 0.06, 4), '#f2741f', s * 0.042, 0.14); add(new THREE.SphereGeometry(0.03, 8, 6), '#fff', 0, 0.05, 0.055, 0.003); add(new THREE.SphereGeometry(0.06, 10, 8), '#f2741f', 0, 0.0, 0, 0.004).scale.set(1, 0.6, 1); }
    else if (kind === 'stock' && id === 'glow') { add(new THREE.CylinderGeometry(0.014, 0.014, 0.2, 8), '#4ade80', 0, 0.02, 0, 0.004, { emissive: new THREE.Color('#4ade80'), emissiveIntensity: 1.2 }).rotation.z = Math.PI / 2; }
    else if (kind === 'pass') { const tx = canvasTex(128, 64, c => { c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 128, 64); c.fillStyle = '#1d4ed8'; c.fillRect(0, 0, 18, 64); c.fillStyle = '#14121f'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PASS', 72, 34); }); const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.006, 0.09), [toon('#ffd23a'), toon('#ffd23a'), new THREE.MeshToonMaterial({ map: tx, gradientMap: grad }), toon('#ffd23a'), toon('#ffd23a'), toon('#ffd23a')]); m.position.y = 0.006; addOutline(m, 0.004); g.add(m); }
    else if (kind === 'relic') { add(new THREE.OctahedronGeometry(0.07, 0), '#e6b45a', 0, 0.08, 0, 0.006, { emissive: new THREE.Color('#a16207'), emissiveIntensity: 0.4 }).scale.set(0.8, 1.2, 0.8); add(new THREE.CylinderGeometry(0.05, 0.06, 0.02, 8), '#78350f', 0, 0.01); }
    else { add(new THREE.BoxGeometry(0.14, 0.09, 0.1), '#0ea5e9', 0, 0.045); add(new THREE.BoxGeometry(0.145, 0.02, 0.105), '#fbf8ec', 0, 0.06, 0, 0); }
    scene.add(g); return g; }
  // bins: little stacks you can watch run down
  const binStacks = {};
  function buildBins() { STOCK.forEach((s, i) => { const b = K.bins[i]; if (!b) return; const st = []; for (let k = 0; k < 8; k++) { const m = itemMesh('stock', s.id); scene.remove(m); m.position.set(-0.28 + (k % 4) * 0.19, 0.12 + Math.floor(k / 4) * 0.16, (k % 2) * 0.06 - 0.03); m.scale.setScalar(0.9); b.g.add(m); st.push(m); } binStacks[s.id] = st;
    const lab = canvasTex(128, 32, c => { c.fillStyle = '#14121f'; c.fillRect(0, 0, 128, 32); c.fillStyle = s.col; c.font = '900 20px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(s.short, 64, 17); }); const lm = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.17), new THREE.MeshBasicMaterial({ map: lab })); lm.position.set(0, -0.08, 0.26); b.g.add(lm); }); }
  buildBins();
  const binPos = id => { const i = STOCK.findIndex(s => s.id === id), b = K.bins[Math.max(0, i)]; return V3(b ? b.x : 0, T + 0.4, b ? b.z : KZ - 1.5); };

  // ---------- register ----------
  const RG = registerKit(ST, K.register, { open: 'CLUB 8' }), { REG, DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;

  // ---------- cameras ----------
  const CAM = { look: V3(0, 1.2, KZ), from: null, t: 1, dur: 1 };
  const { SAFE, shotFor } = cameraFit(ST);
  const port = () => CW() < CHh();
  const wideShot = () => { const z = KZ + 1.4, x = -0.5, box = [V3(x - 0.6, 0.05, z), V3(x + 0.6, 0.05, z), V3(x - 0.6, 2.3, z), V3(x + 0.6, 2.3, z), V3(0.4, 2.0, KZ - 0.85), V3(0, 3.6, -K.D / 2 + 0.2)];
    return port() ? shotFor('wideP', () => box, 0.12, Math.PI - 0.22, 0.08) : shotFor('wideL', () => box, 0.1, Math.PI - 0.32, 0.05); };
  const workPts = () => { const x0 = port() ? -1.95 : -2.15, x1 = port() ? 1.3 : 1.45; const out = [V3(x0, T, KZ - 0.35), V3(x1, T, KZ - 0.35), V3(x0, T, KZ + 0.42), V3(x1, T, KZ + 0.42), V3(K.spots[0].x, 2.35, K.spots[0].z), V3(K.spots[0].x - 0.5, 1.2, K.spots[0].z)]; if (!port()) { out.push(V3(K.spots[1].x, 2.2, K.spots[1].z), V3(K.spots[2].x, 2.2, K.spots[2].z)); } return out; };
  const workShot = () => shotFor('work', workPts, port() ? 0.92 : 0.66, 0, port() ? 0.03 : 0.05);
  const payShot = () => shotFor('pay', () => [V3(REG.x - 0.3, REG.y, REG.z - 0.42), V3(REG.x + 0.55, REG.y, REG.z - 0.5), V3(DISH.x + 0.16, DISH.y, DISH.z + 0.16), V3(REG.x - 0.3, REG.y + 0.5, REG.z), V3(REG.x + 0.3, REG.y + 0.5, REG.z), V3(K.spots[0].x + 0.3, 2.2, K.spots[0].z)], port() ? 0.95 : 0.8, -0.2, 0.06);
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  camera.position.set(0, 2.6, 7.5); camera.lookAt(CAM.look);

  // ---------- game state ----------
  const S = { mode, phase: mode === 'walk' ? 'walk' : 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), shiftKey: 'quiet', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], spawned: 0, flash: null, flashT: 0, say: '', sayT: 0, pay: null, payOut: null, next: 2, done: null, react: null, fade: 0, xp: 0, press: null, sign: S0sign || CLUB8.sign, signAsk: false, touched: false, lastInput: 0, held: null, coachSeen: {} };
  function localStorageGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const spec = () => SHIFTS.find(s => s.key === S.shiftKey) || SHIFTS[0];
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 4) => { S.say = s; S.sayT = t; };
  const maxStock = () => upg('shelves') ? 8 : 5;
  const shelf = {}; STOCK.forEach(s => shelf[s.id] = maxStock());
  const availStock = () => STOCK.filter(s => s.day <= S.day);
  const customers = []; let idSeq = 1;
  const custName = o => CUSTOMERS[o.ci].name;
  const head = () => customers.find(o => o.st === 'counter' || o.st === 'pay') || null;
  // bonus trays, live from the save
  const relicName = id => String(id).replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase();
  const sellableRelic = id => !/seam|wire|key|crown|core/i.test(id);
  function bonusTrays() { const d = save.data, out = [];
    PLAYED.forEach(p => { try { if (p.test(d)) out.push({ kind: 'pass', id: p.id, name: 'PASS · ' + p.name, short: p.name, price: PRICE.pass, stock: Infinity }); } catch (e) {} });
    Object.entries(d.items || {}).forEach(([id, n]) => { if (n > 0) out.push({ kind: 'item', id, name: ITEM_NAMES[id] || relicName(id), short: ITEM_NAMES[id] || relicName(id), price: PRICE.item, stock: n }); });
    (d.relics || []).filter(sellableRelic).forEach(id => out.push({ kind: 'relic', id, name: relicName(id), short: relicName(id), price: PRICE.relic, stock: 1 }));
    return out; }
  const stockDef = id => STOCK.find(s => s.id === id);
  function makeWant(kind, id) { if (kind === 'stock') { const s = stockDef(id); return { kind, id, name: s.name, short: s.short, price: s.price, col: s.col, got: false }; }
    const b = bonusTrays().find(x => x.kind === kind && x.id === id); if (kind === 'relic') return { kind, id: null, name: 'SOMETHING OLD', short: 'SOMETHING OLD', price: PRICE.relic, col: '#c4b5fd', got: false };
    return b ? { kind, id, name: b.name, short: b.short, price: b.price, col: kind === 'pass' ? '#ffd23a' : '#7dd3fc', got: false } : null; }
  function rollWants() { if (S.demoOrders && S.demoOrders.length) return S.demoOrders.shift().map(([k, id]) => makeWant(k, id)).filter(Boolean);
    const n = S.day >= 4 ? (Math.random() < 0.3 ? 3 : Math.random() < 0.6 ? 2 : 1) : S.day >= 2 ? (Math.random() < 0.45 ? 2 : 1) : (S.shiftKey === 'rush' && Math.random() < 0.3 ? 2 : 1);
    const tr = bonusTrays(), out = [], taken = {};
    customers.forEach(o => o.wants.forEach(w => { if (!w.got && w.kind !== 'stock') taken[w.kind + (w.id || '')] = (taken[w.kind + (w.id || '')] || 0) + 1; }));
    for (let i = 0; i < n; i++) { const pool = [];
      availStock().forEach(s => { for (let k = 0; k < 3; k++) pool.push(['stock', s.id]); });
      tr.forEach(b => { const key = b.kind + (b.kind === 'relic' ? '' : b.id), left = (b.stock === Infinity ? 99 : b.stock) - (taken[key] || 0) - out.filter(w => w.kind === b.kind && (b.kind === 'relic' || w.id === b.id)).length; if (left > 0) { const wgt = b.kind === 'pass' ? 2 : 1; for (let k = 0; k < wgt; k++) pool.push([b.kind, b.id]); } });
      const [k, id] = pick(pool); const w = makeWant(k, id); if (w && !out.some(q => q.kind === w.kind && q.id === w.id && w.kind !== 'stock')) out.push(w); }
    return out.length ? out : [makeWant('stock', 'token')]; }
  function linesFor(o) { const ws = o.wants; if (ws.length >= 2) return pick(LINES.two).replace('%s', ws[0].short.toLowerCase()).replace('%t', ws[1].short.toLowerCase()) + (ws.length > 2 ? ' And ' + ws[2].short.toLowerCase() + '.' : '');
    const w = ws[0]; if (w.kind === 'relic') return pick(LINES.relic); if (w.kind === 'pass') return pick(LINES.pass).replace('%s', w.short); if (w.kind === 'item') return pick(LINES.item).replace('%s', w.short); const t = pick(LINES.stock).replace('%s', w.short.toLowerCase()); return t.charAt(0).toUpperCase() + t.slice(1); }
  // a bubble over each waiting customer's head
  function bubbleFor(o) { const cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, depthTest: false, transparent: true })); sp.renderOrder = 22; sp.scale.set(1.0, 0.5, 1); scene.add(sp); return { sp, cv, tx, key: '' }; }
  function drawBubble(o) { const B = o.bub, ws = o.wants, f = Math.max(0, o.pat / o.patMax), key = ws.map(w => w.short + (w.got ? 1 : 0)).join('|') + '|' + Math.round(f * 20) + '|' + o.st; if (B.key === key) return; B.key = key;
    const c = B.cv.getContext('2d'); c.clearRect(0, 0, 256, 128); c.fillStyle = 'rgba(20,18,31,0.92)'; c.strokeStyle = o.st === 'counter' || o.st === 'pay' ? '#ffd23a' : '#3b5b8a'; c.lineWidth = 5; c.beginPath(); c.roundRect(6, 6, 244, 98, 16); c.fill(); c.stroke(); c.beginPath(); c.moveTo(116, 104); c.lineTo(128, 122); c.lineTo(140, 104); c.fill();
    const lines = ws.slice(0, 3); c.textAlign = 'left'; c.textBaseline = 'middle'; const fs = lines.length > 2 ? 21 : lines.length > 1 ? 25 : 32; c.font = `900 ${fs}px Archivo, Arial`;
    lines.forEach((w, i) => { const y = 18 + (lines.length === 1 ? 32 : lines.length === 2 ? 20 + i * 30 : 14 + i * 24); c.fillStyle = w.got ? '#4ade80' : w.col || '#fff'; const t = (w.got ? '✓ ' : '') + w.short; let f2 = fs; c.font = `900 ${f2}px Archivo, Arial`; while (c.measureText(t).width > 222 && f2 > 12) { f2 -= 1; c.font = `900 ${f2}px Archivo, Arial`; } c.fillText(t, 18, y); });
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(18, 88, 220, 8); c.fillStyle = f > 0.5 ? '#4ade80' : f > 0.22 ? '#facc15' : '#f87171'; c.fillRect(18, 88, 220 * f, 8); B.tx.needsUpdate = true; }

  function newCustomer() { const used = customers.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)); if (!pool.length) return null; const ci = pick(pool), f = custFox[ci];
    const sp = spec(), pm = sp.patience * (upg('jukebox') ? 1.2 : 1), wants = rollWants();
    const o = { id: idSeq++, ci, f, st: 'walk', wants, pat: pm + wants.length * 6, patMax: pm + wants.length * 6, wrong: 0, t: 0, line: '', said: false, items: [] };
    o.line = linesFor(o); f.visible = true; f.position.set(K.door.x + rr(-0.6, 0.6), 0, K.door.z + 0.6); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.userData.hold = null; o.bub = bubbleFor(o); customers.push(o); S.spawned++; sfx('chime'); return o; }
  function removeCustomer(o) { o.f.visible = false; o.f.userData.hold = null; o.items.forEach(m => m.parent && m.parent.remove(m)); o.items = []; scene.remove(o.bub.sp); const i = customers.indexOf(o); if (i >= 0) customers.splice(i, 1); }
  const queue = () => customers.filter(o => o.st === 'walk' || o.st === 'queue' || o.st === 'counter' || o.st === 'pay');

  // ---------- the counter: pick → scan → flick → change ----------
  const busy = () => S.phase !== 'shift' || !!S.react;
  function pickItem(kind, id) { if (busy()) return false; audioOn(); S.lastInput = performance.now(); const o = head();
    if (!o || o.st !== 'counter') { flash('NOBODY AT THE COUNTER YET', '#facc15', 1); return false; }
    if (S.held && S.held.phase === 'fly') return false;
    if (kind === 'stock' && shelf[id] <= 0) { flash('SHELF EMPTY · HOLD IT TO RESTOCK', '#f87171', 1.4); sfx('bad'); S.hintShelf = id; return false; }
    if (kind !== 'stock') { const b = bonusTrays().find(x => x.kind === kind && x.id === id); if (!b) { flash('NONE LEFT', '#f87171'); return false; } }
    if (S.held) returnHeld(true);
    let name, price; if (kind === 'stock') { const s = stockDef(id); shelf[id]--; name = s.name; price = s.price; } else { const b = bonusTrays().find(x => x.kind === kind && x.id === id); name = b.name; price = b.price; }
    const mesh = itemMesh(kind, id); mesh.scale.setScalar(1.7); const from = kind === 'stock' ? binPos(id) : V3(2.3, T + 0.5, KZ - 0.6); mesh.position.copy(from);
    S.held = { kind, id, name, price, mesh, scanned: false, phase: 'drop', t: 0, from, to: K.pickSpot.clone() }; sfx('whoosh', { power: 1.6 }); buzz(8);
    ben.userData.lookAt = K.pickSpot.clone(); return true; }
  function returnHeld(quiet) { const H = S.held; if (!H) return; if (H.kind === 'stock') shelf[H.id] = Math.min(maxStock() + 2, shelf[H.id] + 1); scene.remove(H.mesh); S.held = null; if (!quiet) flash('BACK ON THE SHELF', '#cfcac4', 0.8); }
  function scanSwipe() { const H = S.held; if (!H || H.phase !== 'ready' || H.scanned) return false; H.phase = 'slide'; H.t = 0; H.from = H.mesh.position.clone(); H.to = K.bagSpot.clone(); sfx('slide'); return true; }
  function beep() { const H = S.held; if (!H) return; H.scanned = true; sfx('beep'); buzz(14); S.laserT = 0.35; S.regLine = H.name + ' · ' + H.price + 'g'; S.regLineT = 1.6; }
  function flick(power = 1) { const H = S.held, o = head(); if (!H || !o || o.st !== 'counter') return false;
    if (!H.scanned) { flash('SCAN IT FIRST · SWIPE IT ACROSS THE RED LIGHT', '#facc15', 1.4); sfx('bad'); return false; }
    if (H.phase !== 'ready') return false; H.phase = 'fly'; H.t = 0; H.from = H.mesh.position.clone(); H.to = V3(o.f.position.x, 1.25, o.f.position.z + 0.05); H.dur = clamp(0.45 / power, 0.22, 0.5); H.target = o; sfx('whoosh', { power }); buzz(10); return true; }
  function landHeld() { const H = S.held, o = H.target; S.held = null; if (!o || !customers.includes(o) || o.st !== 'counter') { scene.remove(H.mesh); return; }
    const w = o.wants.find(q => !q.got && q.kind === H.kind && (q.kind === 'relic' || q.id === H.id));
    if (!w) { o.wrong++; o.pat = Math.max(0.5, o.pat - o.patMax * 0.22); flash('NOT THAT · ' + pick(LINES.wrong).toUpperCase(), '#f87171', 1.4); say(custName(o) + ': “' + pick(LINES.wrong) + '”', 2.4); sfx('bad'); buzz(60); o.f.userData.mood = 'stern';
      // it slides back to you
      const back = itemMesh(H.kind, H.id); back.scale.setScalar(1.7); scene.remove(H.mesh); back.position.copy(H.mesh.position); S.held = { ...H, mesh: back, phase: 'drop', t: 0, from: H.mesh.position.clone(), to: K.bagSpot.clone(), scanned: true, target: null }; return; }
    w.got = true; w.realId = H.id; sfx('good'); setTimeout(() => sfx('happy'), 120); buzz(20); puff(o.f.position.x, 1.3, o.f.position.z, 0xffd23a, 2);
    if (H.kind === 'item') save.take(H.id); else if (H.kind === 'relic') save.dropRelic(H.id);
    // they hold it
    o.f.userData.hold = { right: true }; const P = o.f.userData.P; H.mesh.position.set(0.32, 0.72, 0.28); H.mesh.scale.setScalar(1.8); H.mesh.rotation.set(0, 0, 0); P.body.add(H.mesh); o.items.push(H.mesh);
    if (o.wants.every(q => q.got)) startPay(o); else { flash('✓ ' + w.short + ' · NEXT: ' + o.wants.find(q => !q.got).short, '#4ade80', 1.2); } }
  function startPay(o) { o.st = 'pay'; const total = o.wants.reduce((a, w) => a + w.price, 0); o.total = total; const exact = S.demo ? (S.served === 0) : Math.random() < Math.max(0.25, 0.5 - S.day * 0.04);
    if (exact) { S.payOut = { t: 0, o, exact: true }; payProps(null); regDraw({ total, paid: total, given: 0, owed: 0 }); [...greedy(total)].forEach((v, i) => setTimeout(() => { coinDrop(v); sfx('coin', { v }); }, i * 90)); flash('EXACT · ' + total + 'g', '#4ade80', 1); setTimeout(() => payDone(o), 700); return; }
    const notes = [5, 10, 20, 50], paid = notes.find(n => n > total) || total + 10; S.pay = { oid: o.id, total, paid, owed: paid - total, given: 0, exact: false }; payProps(S.pay); sfx('click'); }
  function* greedy(v) { for (const c of [10, 5, 2, 1]) while (v >= c) { v -= c; yield c; } }
  function giveCoin(v) { const P = S.pay; if (!P) return; S.lastInput = performance.now(); P.given += v; buzz(10); coinDrop(v); regDraw(P); sfx('coin', { v });
    if (P.given === P.owed) { const o = customers.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); if (o) setTimeout(() => payDone(o), 350); }
    else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; sfx('bad'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  const REACT = { 3: { word: 'THRILLED!', col: '#22c55e', mood: 'excited' }, 2: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy' }, 1: { word: 'OKAY', col: '#ffd23a', mood: 'neutral' } };
  function payDone(o) { if (!customers.includes(o) || o.st !== 'pay') return; const frac = clamp(o.pat / o.patMax, 0, 1), stars = o.wrong === 0 && frac > 0.55 ? 3 : o.wrong <= 1 && frac > 0.25 ? 2 : 1;
    const tip = Math.round(o.total * 0.35 * frac * (upg('neon') ? 1.25 : 1)) + (stars === 3 ? 1 : 0);
    S.combo = stars === 3 ? (S.combo || 0) + 1 : 0; S.bestStreak = Math.max(S.bestStreak || 0, S.combo); const sb = S.combo >= 3 ? Math.min(3, S.combo - 2) : 0; S.streakTips = (S.streakTips || 0) + sb;
    S.earned += o.total; S.tips += tip + sb; S.served++; S.starList.push(stars); if (stars === 3) { o.f.userData.hop = 1; puff(o.f.position.x, 2.0, o.f.position.z, 0xf9a8d4, 3); puff(o.f.position.x, 1.6, o.f.position.z, 0xffd23a, 2); }
    const R = REACT[stars]; o.f.userData.mood = R.mood; S.react = { o, word: R.word, col: R.col, stars, tip: tip + sb, line: pick(LINES.happy), who: custName(o), t: 0 }; sfx('serve'); if (S.combo >= 3) flash('STREAK × ' + S.combo + ' · +' + sb + 'g BONUS', '#ffd23a', 1.4); }
  function reactDone() { const r = S.react; S.react = null; if (r && customers.includes(r.o)) { r.o.st = 'leave'; r.o.t = 0; } S.payOut = null; payProps(null); regDraw(null); }
  function walkOut(o) { const wasHead = head() === o; o.st = 'leave'; o.t = 0; S.lost++; S.combo = 0; o.f.userData.mood = 'stern'; flash(custName(o) + ' WALKED OUT', '#f87171', 1.6); say(custName(o) + ': “' + pick(LINES.leave) + '”', 2.6); sfx('grumble');
    if (S.held && (wasHead || S.held.target === o)) returnHeld(true); if (S.pay && S.pay.oid === o.id) { S.pay = null; payProps(null); } }
  // restock by holding a shelf button
  function shelfDown(id) { if (S.phase !== 'shift' || S.react) return; audioOn(); S.press = { id, t: 0, done: false }; }
  function shelfUp(id, cancel) { const P = S.press; S.press = null; if (!P || P.id !== id) return; if (P.done || cancel) return; if (P.t < 0.32) pickItem('stock', id); }
  function restock(id) { shelf[id] = maxStock(); sfx('restock'); buzz([12, 30, 12]); const p = binPos(id); puff(p.x, p.y, p.z, 0x93c5fd, 3); flash(stockDef(id).short + ' RESTOCKED', '#4ade80', 1); S.hintShelf = null; S.restocks = (S.restocks || 0) + 1; pip.userData.lookAt = p.clone(); }

  // ---------- touch on the stage: swipe = scan, flick up = hand it over ----------
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  let ptr = null;
  function onDown(e) { audioOn(); S.lastInput = performance.now(); if (S.phase === 'cab') { cabPointer(e, true); return; } if (S.phase !== 'shift' || DM.on) return; const { x, y } = local(e); ptr = { x0: x, y0: y, x, y, t0: performance.now(), hist: [{ x, y, t: performance.now() }], scanned: false }; e.preventDefault && e.preventDefault(); }
  function onMove(e) { if (S.phase === 'cab') { cabPointer(e, false); return; } if (!ptr) return; const { x, y } = local(e); ptr.x = x; ptr.y = y; ptr.hist.push({ x, y, t: performance.now() }); if (ptr.hist.length > 8) ptr.hist.shift();
    const dx = x - ptr.x0, dy = y - ptr.y0, H = S.held;
    if (H && H.phase === 'ready' && !H.scanned && !ptr.scanned && Math.abs(dx) > 34 && Math.abs(dx) > Math.abs(dy) * 1.1) { ptr.scanned = true; S.touched = true; scanSwipe(); } }
  function onUp(e) { if (S.phase === 'cab') { cabUp(); return; } const P0 = ptr; ptr = null; if (!P0 || S.phase !== 'shift') return; const dx = P0.x - P0.x0, dy = P0.y - P0.y0, h = P0.hist, a = h[0], b = h[h.length - 1], dt = Math.max(16, b.t - a.t), vy = (b.y - a.y) / dt;
    if (P0.scanned) return;
    if (dy < -40 && Math.abs(dy) > Math.abs(dx) * 0.9) { S.touched = true; const power = clamp(-vy / 1.2, 0.6, 1.8); if (S.held && !S.held.scanned) { flash('SCAN IT FIRST · SWIPE IT ACROSS THE RED LIGHT', '#facc15', 1.4); sfx('bad'); return; } flick(power); return; }
    if (Math.hypot(dx, dy) < 12 && S.held && S.held.phase === 'ready') flash(S.held.scanned ? 'FLICK IT UP TO THEM ↑' : 'SWIPE IT ACROSS THE SCANNER →', '#ffd23a', 1); }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- the 8 cabinets: attract demos + play ----------
  const attract = K.cabs.map(c => makeCabinetGame(c.id)); let cabRR = 0; const overT = attract.map(() => 0);
  function cabsStep(dt) { attract.forEach((g, i) => { if (S.cab && S.cab.c.i === i) return; g.step(dt, g.bot(dt)); if (g.over) { overT[i] += dt; if (overT[i] > 2) { overT[i] = 0; g.reset(); } } else g.t; });
    const n = S.phase === 'walk' || S.phase === 'intro' ? 2 : 1; for (let k = 0; k < n; k++) { cabRR = (cabRR + 1) % K.cabs.length; const c = K.cabs[cabRR]; if (S.cab && S.cab.c === c) continue; attract[cabRR].draw(c.ctx, true); c.tex.needsUpdate = true; } }
  function cabStart(c) { audioOn(); const g = makeCabinetGame(c.id); S.cab = { c, g, x: 0.5, tap: false, keys: new Set(), best: save.stat(SAVE.cab + c.id, 0), saved: false }; S.phase = 'cab'; W.D = null; benW.visible = false; benW.position.set(c.stand.x, 0, c.stand.z); benW.rotation.y = c.side < 0 ? -Math.PI / 2 : Math.PI / 2; sfx('start'); }
  function cabExit() { if (!S.cab) return; S.cab = null; S.phase = 'walk'; benW.visible = true; W.camInit = false; }
  function cabAgain() { if (!S.cab) return; S.cab.g.reset(); S.cab.saved = false; }
  function cabPointer(e, down) { const C = S.cab; if (!C) return; const { x } = local(e); if (e.type === 'pointermove' && !(e.buttons || e.pointerType === 'touch' || C.drag)) { if (e.pointerType === 'mouse') C.x = clamp((x / CW() - 0.1) / 0.8, 0, 1); return; } C.x = clamp((x / CW() - 0.1) / 0.8, 0, 1); if (down) { C.tap = true; C.drag = true; if (C.g.over) cabAgain(); } }
  function cabUp() { if (S.cab) S.cab.drag = false; }
  function cabStep(dt) { const C = S.cab; if (!C) return; const k = C.keys; if (k.has('ArrowLeft') || k.has('KeyA')) C.x = clamp(C.x - dt * 1.4, 0, 1); if (k.has('ArrowRight') || k.has('KeyD')) C.x = clamp(C.x + dt * 1.4, 0, 1);
    const s0 = C.g.score, l0 = C.g.lives, o0 = C.g.over; if (C.tap) sfx('cabTap'); C.g.step(dt, { x: C.x, tap: C.tap }); C.tap = false; if (C.g.score > s0) sfx('cabScore'); if (C.g.lives < l0) { sfx('cabHit'); buzz(40); } if (C.g.over && !o0) sfx('cabOver'); C.g.draw(C.c.ctx, false); C.c.tex.needsUpdate = true;
    if (C.g.over && !C.saved) { C.saved = true; const pb = save.best(SAVE.cab + C.c.id, C.g.score); C.pb = pb && C.g.score > 0; C.best = save.stat(SAVE.cab + C.c.id, 0); if (C.pb) { sfx('serve'); flash('NEW BEST · ' + C.g.score, '#4ade80', 1.6); } else sfx('bad'); }
    const s = C.c.screen, n = C.c.normal, th = Math.tan(camera.fov * Math.PI / 360), dist = Math.max(0.36 / (th * camera.aspect), 0.5 / th, 0.9), want = s.clone().addScaledVector(n, dist).add(V3(0, 0.2, 0)); camera.position.lerp(want, Math.min(1, dt * 5)); CAM.look.lerp(s, Math.min(1, dt * 6)); }

  // ---------- DEMO: the counter plays itself, with captions ----------
  const DM = { on: false, cd: 0, cap: '', key: '', served: 0, act: null, target: null, phase: 0 };
  function demoStep(dt) { if (S.phase !== 'shift') return; DM.cd -= dt; if (DM.cd > 0) return; if (DM.act) { const a = DM.act; DM.act = null; DM.cd = 0.35; if (a === 'pick' && DM.pend) { DM.pend(); DM.pend = null; } else if (a === 'scan') scanSwipe(); else if (a === 'flick') flick(1); return; } const o = head(), H = S.held;
    if (DM.phase === 2) { DM.cap = 'YOUR TURN. PUT ME TO WORK WHEN YOU ARE READY'; DM.key = ''; DM.target = null; DM.cd = 2.6; DM.phase = 3; return; }
    if (DM.phase === 3) { demoStop(); return; }
    if (DM.phase === 1) { if (!S.press) { shelf.token = 0; DM.cap = 'A SHELF RUNS DRY? HOLD ITS BUTTON TO RESTOCK'; DM.key = 'HOLD'; DM.target = { shelf: 'token' }; shelfDown('token'); DM.cd = 0.2; return; } return; }
    if (S.react || S.payOut) return;
    if (S.pay) { const left = S.pay.owed - S.pay.given, c = [10, 5, 2, 1].find(v => v <= left); DM.cap = 'MAKE CHANGE: THEY PAID ' + S.pay.paid + 'g FOR ' + S.pay.total + 'g · TAP ' + S.pay.owed + 'g IN COINS'; DM.key = 'TAP'; DM.target = { coin: c }; giveCoin(c); DM.cd = 0.75; return; }
    if (!o || o.st !== 'counter') { DM.target = null; if (S.served >= 2 && !customers.length) { DM.phase = 1; } return; }
    if (!H) { const w = o.wants.find(q => !q.got); if (!w) return; DM.cap = 'TAP THE SHELF THEY ASK FOR · ' + w.short; DM.key = 'TAP'; DM.target = { shelf: w.id }; DM.cd = 1.1; DM.pend = () => pickItem('stock', w.id); DM.act = 'pick'; return; }
    if (H.phase === 'ready' && !H.scanned) { DM.cap = 'SWIPE IT ACROSS THE RED SCANNER. BEEP!'; DM.key = 'SWIPE →'; DM.target = { scan: true }; DM.cd = 1.3; DM.act = 'scan'; return; }
    if (H.phase === 'ready' && H.scanned) { DM.cap = 'FLICK IT UP THE COUNTER TO THEM'; DM.key = 'FLICK ↑'; DM.target = { flick: true }; DM.cd = 1.3; DM.act = 'flick'; return; } }
  function demoStart() { if (DM.on) return; audioOn(); Object.assign(DM, { on: true, served: 0, act: null, cd: 2.2, phase: 0, target: null, cap: 'WATCH A SHIFT AT THE COUNTER', key: '' }); DM.day0 = S.day; DM.key0 = S.shiftKey; S.shiftKey = 'quiet'; S.phase = 'intro'; S.done = null; S.demo = true; S.demoOrders = [[['stock', 'soda']], [['stock', 'token'], ['stock', 'popcorn']]]; startShift(); S.next = 0.4; }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; S.demoOrders = null; S.day = DM.day0; S.shiftKey = DM.key0 || 'quiet'; STOCK.forEach(s => shelf[s.id] = maxStock()); clearAll(); toIntro(); }

  // ---------- shift lifecycle ----------
  function clearAll() { S.press = null; if (S.held) { scene.remove(S.held.mesh); S.held = null; } S.react = null; S.pay = null; S.payOut = null; payProps(null); regDraw(null); customers.slice().forEach(removeCustomer); ptr = null; }
  function placeGreeter() { setUniform(!!save.flag(SAVE.uniform)); ben.visible = true; benW.visible = false; ben.position.set(-0.5, 0, KZ + 1.4); ben.rotation.y = 0.25; pip.position.copy(K.keeperSpot); pip.rotation.y = 0; }
  function toIntro() { S.phase = 'intro'; S.mode = 'shift'; S.done = null; S.cab = null; clearAll(); placeGreeter(); glideTo(wideShot(), 1); }
  function fadeTo(fn) { S.fadeDir = 1; S.fadeFn = fn; }
  function setShift(key) { if (SHIFTS.some(s => s.key === key)) S.shiftKey = key; sfx('ui'); }
  function startShift(key) { if (key) setShift(key); if (S.phase !== 'intro' && S.phase !== 'done') return; if (!S.demo && DM.on) demoStop(); audioOn(); clearAll();
    STOCK.forEach(s => shelf[s.id] = maxStock());
    Object.assign(S, { phase: 'glide', mode: 'shift', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], spawned: 0, next: 1.6, done: null, combo: 0, bestStreak: 0, streakTips: 0, lastCall: false, tickSec: -1, xp: 0, restocks: 0, hintShelf: null });
    setUniform(true); ben.visible = true; benW.visible = false; ben.position.copy(K.workSpot).setX(3.6); ben.rotation.y = 0; { const c = K.cabs[1]; pip.position.set(c.stand.x + 0.35, 0, c.stand.z + 0.5); pip.rotation.y = -Math.PI / 2 - 0.4; } glideTo(workShot(), 1.6); say('PIP: “Doors are open. Eyes front, there is a queue.”', 4); S.glideT = 1.65; }
  function endShift() { S.phase = 'done'; S.press = null; const sp = spec(), avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, clean = S.lost === 0 && S.served >= sp.customers, eod = clean && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    const xp = S.demo ? 0 : Math.round(sp.xp * Math.max(0.25, S.served / sp.customers) * (clean ? 1.2 : 1));
    let newDay = false, unlock = [], pb = false;
    try { if (!S.demo) { save.addGold(total); if (xp) save.addXp(xp); pb = save.best(SAVE.best + sp.key, total); save.setStat(SAVE.shifts, save.stat(SAVE.shifts, 0) + 1); save.setStat(SAVE.sales, save.stat(SAVE.sales, 0) + S.served); if (clean) save.setStat(SAVE.clean, save.stat(SAVE.clean, 0) + 1);
      if (S.served >= sp.customers - 1 && avg >= 1.8) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = STOCK.filter(s => s.day === nd).map(s => s.name + ' on the shelves'); if (nd === 2) unlock.push('Two things at once on some orders'); if (nd === 4) unlock.push('Three things at once on some orders'); }
      if (!save.flag(SAVE.uniform) && (eod || S.served >= 6)) { save.setFlag(SAVE.uniform); unlock.push('CLUB 8 CREW UNIFORM (cap, towel + tee)'); } if (eod) save.setStat('club8.eod', save.stat('club8.eod', 0) + 1); } } catch (e) {}
    S.done = { day: S.day, key: sp.key, label: sp.label, served: S.served, customers: sp.customers, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, xp, pb, best: save.stat(SAVE.best + sp.key, 0), stars: save.stat('club8.eod', 0), gold: save.data.gold, clean, bestStreak: S.bestStreak || 0, restocks: S.restocks || 0 }; jingle(S.served >= sp.customers / 2); if (clean || eod) confetti();
    if (newDay) S.day += 1; clearAll(); placeGreeter(); glideTo(wideShot(), 1.4);
    say(eod ? 'PIP: “EMPLOYEE OF THE DAY. I am putting your face on the wall.”' : clean ? 'PIP: “Nobody walked out. Nobody. That has never happened.”' : S.served >= sp.customers / 2 ? 'PIP: “Good shift. Same counter tomorrow.”' : 'PIP: “The queue won that one. Tomorrow you win.”', 6); }
  function confetti() { const cols = [0x38bdf8, 0xffd23a, 0xf472b6, 0x4ade80, 0xffffff]; for (let i = 0; i < 14; i++) setTimeout(() => puff(rr(-2.5, 2.5), rr(1.5, 3.2), KZ + rr(0.5, 2.5), pick(cols), 3), i * 70); sfx('good'); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); tone(1320, 0.1, 0.05); if (S.done) S.done.gold = save.data.gold; return true; }
  function setSign(raw) { const clean = String(raw || '').toUpperCase().replace(/[^A-Z0-9 '&!.-]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16); try { localStorage.setItem('club8.signAsked', '1'); } catch (e) {} S.signAsk = false; if (!clean) return false; try { localStorage.setItem(CLUB8.signKey, clean); } catch (e) {} S.sign = clean; K.paintSign(clean); sfx('serve'); flash('THE SIGN NOW SAYS ' + clean, '#38bdf8', 1.8); return true; }
  function signLater() { try { localStorage.setItem('club8.signAsked', '1'); } catch (e) {} S.signAsk = false; }

  // ---------- WALK MODE: the clubhouse as an interior ----------
  const W = { stick: { x: 0, y: 0 }, keys: new Set(), sit: null, wave: 0, D: null, toast: '', toastT: 0, camInit: true, pipWave: 0, target: null, prompt: null };
  function toWalk() { fadeTo(() => { S.phase = 'walk'; S.mode = 'walk'; S.done = null; S.cab = null; clearAll(); ben.visible = false; benW.visible = true; benW.position.set(K.door.x, 0, K.door.z - 1.2); benW.rotation.y = Math.PI; W.sit = null; pip.position.copy(K.keeperSpot); pip.rotation.y = 0; W.camInit = true; seatLoungers(); }); }
  function hireAndWork() { try { save.setFlag(SAVE.hired); } catch (e) {} fadeTo(() => { W.sit = null; dismissLoungers(); toIntro(); const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); CAM.t = 1; }); }
  function talkTarget() { const p = benW.position, out = [];
    out.push({ key: 'pip', d: Math.hypot(p.x - K.talkSpot.x, p.z - K.talkSpot.z), max: 2.3, label: 'Talk to Pip' });
    K.cabs.forEach(c => out.push({ key: 'cab', c, d: Math.hypot(p.x - c.stand.x, p.z - c.stand.z), max: 1.15, label: 'Play ' + c.name }));
    loungers.forEach(l => out.push({ key: 'lounger', l, d: Math.hypot(p.x - l.f.position.x, p.z - l.f.position.z), max: 1.5, label: 'Talk to ' + CUSTOMERS[l.ci].name }));
    return out.filter(o => o.d < o.max).sort((a, b) => a.d - b.d)[0] || null; }
  function openTalk(t) { if (t.key === 'cab') { cabStart(t.c); return; }
    if (t.key === 'lounger') { const l = t.l, best = attract.map((g, i) => ({ n: K.cabs[i].name, b: save.stat(SAVE.cab + K.cabs[i].id, 0) })).sort((a, b) => b.b - a.b)[0]; l.f.userData.talking = true; l.f.userData.lookAt = benW.position.clone().setY(1.5);
      W.D = { key: 'lounger', name: CUSTOMERS[l.ci].name, role: 'Regular', lines: [['npc', pick(['Best clubhouse on the planet. Also the only one.', 'I have been on SLALOM all night. The third gate is a lie.', 'Pip says you are on the counter now. Finally. Two paws.', best && best.b ? 'Somebody put ' + best.b + ' on ' + best.n + '. Was that you?' : 'Nobody has a score on any of these yet. Go on.'])]], i: 0, menu: null, l }; tone(1046, 0.06, 0.03); return; }
    const hired = save.flag(SAVE.hired), runs = save.stat(SAVE.shifts, 0); pip.userData.talking = true;
    const menu = [{ text: hired ? 'Put me on the counter.' : 'I could take the other side of it. Put me to work.', lines: ['Right. Apron. Hatch is that way, come round, do not climb it.'], then: 'work' }, { text: 'How does the counter work?', lines: PIP.how }, { text: 'What are the cabinets?', lines: PIP.cabs }, { text: 'Paint the sign.', lines: PIP.sign, then: 'sign' }, { text: 'Not now.', lines: PIP.later, then: 'bye', bye: true }];
    W.D = { key: 'pip', name: 'Pip', role: 'Front of house', lines: hired ? [['npc', runs ? PIP.back(runs) : 'Back again. Counter is there when you want it.']] : PIP.first.slice(), i: 0, menu, showMenu: false }; tone(1046, 0.06, 0.03); }
  function closeTalk() { if (!W.D) return; const D = W.D; W.D = null; pip.userData.talking = false; if (D.l) D.l.f.userData.talking = false; }
  function dlgNext() { const D = W.D; if (!D) return; if (D.showMenu) return; D.i++; if (D.i < D.lines.length) { sfx('ui'); return; }
    if (D.then === 'work') { closeTalk(); hireAndWork(); return; } if (D.then === 'sign') { closeTalk(); S.signAsk = true; return; } if (D.then === 'bye' || !D.menu) { closeTalk(); return; } D.showMenu = true; D.lines = [['npc', D.lines[D.lines.length - 1][1]]]; D.i = 0; }
  function dlgChoose(i) { const D = W.D; if (!D || !D.menu || !D.showMenu) return; const c = D.menu[i]; if (!c) return; c.asked = true; D.showMenu = false; D.lines = c.lines.map(t => ['npc', t]); D.i = 0; D.then = c.then || null; tone(990, 0.05, 0.03); }
  function dlgHud() { const D = W.D; if (!D) return null; const ln = D.lines[Math.min(D.i, D.lines.length - 1)], isP = ln[0] === 'player';
    if (D.showMenu) return { name: D.name, role: D.role, text: ln[1], choices: D.menu.map(c => ({ text: c.text, asked: !!c.asked && !c.then, bye: !!c.bye })), step: 1, total: 1 };
    return { name: isP ? 'You' : D.name, role: isP ? '' : D.role, text: ln[1], step: D.i + 1, total: D.lines.length, more: !!D.menu }; }
  function playOrSit() { if (S.phase !== 'walk' || W.D) return; if (W.sit) { standUp(); return; } const t = W.target; if (t && t.key === 'cab') { cabStart(t.c); return; }
    const p = benW.position; let best = null, bd = 1.4; for (const s of K.seats) { if (s.taken) continue; const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; best = s; } }
    if (!best) { W.toast = 'WALK UP TO A CABINET TO PLAY · OR A SOFA TO SIT'; W.toastT = 1.8; return; } W.sit = best; benW.position.set(best.x, 0, best.z); benW.rotation.y = best.ry; tone(330, 0.08, 0.03); }
  function standUp() { const s = W.sit; if (!s) return; W.sit = null; benW.position.set(s.x + Math.sin(s.ry) * 0.75, 0, s.z + Math.cos(s.ry) * 0.75); }
  function wave() { if (S.phase !== 'walk' || W.D) return; W.wave = 1.6; if (pip.position.distanceTo(benW.position) < 7) W.pipWave = 1.6; loungers.forEach(l => { if (l.f.position.distanceTo(benW.position) < 6) { l.waveT = 1.6; l.f.userData.mood = 'excited'; } }); tone(784, 0.08, 0.03, 'triangle'); setTimeout(() => tone(988, 0.1, 0.03, 'triangle'), 90); }
  function hop() { if (S.phase !== 'walk' || W.D || W.sit) return; if (!(benW.userData.hop > 0)) { benW.userData.hop = 1; sfx('pop'); } }
  function collide(p) { const B = K.walkBox; for (const c of K.colliders) { if (c.type === 'circle') { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), r = c.r + 0.3; if (d < r && d > 1e-4) { p.x = c.x + dx / d * r; p.z = c.z + dz / d * r; } } }
    p.x = clamp(p.x, B.x0, B.x1); p.z = Math.max(p.z, B.z0); const inDoor = Math.abs(p.x - K.door.x) < K.door.w / 2 - 0.3; if (p.z > B.z1 && !inDoor) p.z = B.z1; if (inDoor) p.z = Math.min(p.z, K.door.z + 0.7); }
  function walkStep(dt) { const k = W.keys; let sx = W.stick.x, sy = W.stick.y; if (k.has('KeyA') || k.has('ArrowLeft')) sx = -1; if (k.has('KeyD') || k.has('ArrowRight')) sx = 1; if (k.has('KeyW') || k.has('ArrowUp')) sy = 1; if (k.has('KeyS') || k.has('ArrowDown')) sy = -1;
    const mag = Math.min(1, Math.hypot(sx, sy)); let speed = 0; if (W.D) { sx = sy = 0; }
    if (W.sit && Math.hypot(sx, sy) > 0.5) standUp();
    if (!W.sit && Math.hypot(sx, sy) > 0.12) { const dir = V3(sx, 0, -sy).normalize(); speed = 3.4 * mag; benW.position.addScaledVector(dir, speed * dt); let da = Math.atan2(dir.x, dir.z) - benW.rotation.y; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; benW.rotation.y += da * Math.min(1, dt * 12); W.stepT = (W.stepT || 0) - dt * speed; if (W.stepT < 0) { W.stepT = 0.75; audio.step && audio.ctx && audio.step(); } }
    collide(benW.position);
    if (benW.position.z > K.door.z + 0.25) { if (onExit) { onExit(); benW.position.z = K.door.z - 0.6; } else { benW.position.z = K.door.z - 0.9; benW.rotation.y = Math.PI; W.toast = 'THE DOOR OUT TO TOWN SQUARE · IN THE WORLD MAP THIS TAKES YOU OUTSIDE'; W.toastT = 3; } }
    kit.animFox(benW, dt, speed, benW.userData.hop > 0); if (W.sit) { sitPose(benW); benW.position.y = W.sit.y - 0.5; } else benW.position.y = 0;
    if (W.wave > 0) { W.wave -= dt; waveArm(BW); }
    const near = pip.position.distanceTo(benW.position) < 5.5; pip.userData.lookAt = near ? benW.position.clone().setY(1.4) : null; pip.userData.mood = W.pipWave > 0 ? 'excited' : 'happy';
    const tt = talkTarget(); W.prompt = W.D ? null : tt ? tt.label : (W.sit ? null : null); W.target = tt;
    if (W.toastT > 0) { W.toastT -= dt; if (W.toastT <= 0) W.toast = ''; }
    const off = port() ? V3(0, 7.4, 7.6) : V3(0, 6.6, 6.8), want = benW.position.clone().add(off); want.x = clamp(want.x * 0.7, -3.6, 3.6); want.z = Math.min(want.z, K.door.z + 6.5); const look = benW.position.clone().add(V3(0, 0.9, port() ? -2.2 : -3.0)); look.x = clamp(look.x, -4.8, 4.8);
    if (W.camInit) { camera.position.copy(want); CAM.look.copy(look); W.camInit = false; } else { camera.position.lerp(want, Math.min(1, dt * 4)); CAM.look.lerp(look, Math.min(1, dt * 5)); } }
  // two regulars on the sofas when you walk in
  const loungers = [];
  function seatLoungers() { dismissLoungers(); const picks = [[0, 2], [8, 3]]; picks.forEach(([ci, si]) => { const st = K.seats[si]; if (!st) return; const f = custFox[ci]; f.visible = true; st.taken = 'l'; f.position.set(st.x, st.y - 0.5, st.z); f.rotation.y = st.ry; loungers.push({ f, ci, seat: st, t: rr(0, 6), waveT: 0 }); }); }
  function dismissLoungers() { loungers.forEach(l => { l.f.visible = false; l.f.position.y = 0; l.f.userData.talking = false; if (l.seat.taken === 'l') l.seat.taken = null; }); loungers.length = 0; }
  function loungersStep(dt) { loungers.forEach((l, i) => { l.t += dt; const u = l.f.userData; if (!(W.D && W.D.l === l)) { u.talking = Math.sin(l.t * 0.6 + i * 3) > 0.55; u.lookAt = l.waveT > 0 ? benW.position.clone().setY(1.5) : K.cabs[i ? 6 : 1].screen.clone(); } if (l.waveT > 0) { l.waveT -= dt; if (l.waveT <= 0) u.mood = 'happy'; } kit.animFox(l.f, dt, 0); sitPose(l.f); l.f.position.y = l.seat.y - 0.5; if (l.waveT > 0) waveArm(u.P, -1); }); }

  // ---------- MUSIC: three little club tracks, made live with Web Audio (no files to load) ----------
  //   LOUNGE  (walking around, welcome + day cards)  92 bpm · Fmaj7 Em7 Dm7 Cmaj7 · soft keys, round bass, brushed hats
  //   RUSH    (on the counter)                      128 bpm · Am F C G · kick, snare, hats, pumping bass, a square-wave hook
  //           LAST CALL (final 20 s) pushes it to 146 bpm and doubles the hook up an octave
  //   ARCADE  (at a cabinet)                         150 bpm · the rush chords as a chiptune, quieter, so the game's bleeps sit on top
  const MUS = { song: '', at: 0, step: 0, bus: null, lp: null };
  const SONGS = {
    lounge: { bpm: 92, vol: 0.2, chords: [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]], bass: [41, 40, 38, 36],
      lead: [72, 0, 0, 76, 0, 74, 72, 0, 71, 0, 0, 74, 0, 72, 71, 0, 69, 0, 0, 72, 0, 71, 69, 0, 67, 0, 69, 0, 71, 0, 0, 0] },
    rush: { bpm: 128, vol: 0.2, chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], bass: [45, 41, 36, 43],
      lead: [76, 0, 76, 79, 0, 76, 74, 72, 0, 72, 74, 0, 76, 0, 0, 0, 77, 0, 77, 76, 0, 74, 72, 0, 71, 0, 72, 74, 0, 79, 0, 0] },
    arcade: { bpm: 150, vol: 0.11, chords: [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]], bass: [45, 41, 36, 43], lead: null } };
  function voice(ac, type, m, t0, dur, v, cut) { const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.value = midiHz(m); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v, t0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    let n = o; if (cut) { const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = cut; o.connect(f); n = f; } n.connect(g); g.connect(MUS.bus); o.start(t0); o.stop(t0 + dur + 0.03); }
  function drum(ac, kind, t0, v) { if (kind === 'kick') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t0); o.frequency.exponentialRampToValueAtTime(42, t0 + 0.13); g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2); o.connect(g); g.connect(MUS.bus); o.start(t0); o.stop(t0 + 0.22); return; }
    if (!audio.noise) return; const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); s.buffer = audio.noise; f.type = kind === 'hat' ? 'highpass' : 'bandpass'; f.frequency.value = kind === 'hat' ? 7500 : 1800; const d = kind === 'hat' ? 0.035 : 0.14;
    g.gain.setValueAtTime(v, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d); s.connect(f); f.connect(g); g.connect(MUS.bus); s.start(t0, Math.random()); s.stop(t0 + d + 0.02); if (kind === 'snare') voice(ac, 'triangle', 50, t0, 0.08, v * 0.5); }
  function songFor() { if (S.phase === 'cab') return 'arcade'; if (S.phase === 'shift' || S.phase === 'glide') return 'rush'; return 'lounge'; }
  function musicStep() { const ac = audio.ctx; if (!ac || document.hidden) return; if (!MUS.bus) { MUS.bus = ac.createGain(); MUS.bus.gain.value = 0; MUS.bus.connect(audio.master || ac.destination); }
    const want = songFor(); if (want !== MUS.song) { MUS.song = want; MUS.step = 0; MUS.at = ac.currentTime + 0.08; }
    const SG = SONGS[MUS.song], last = MUS.song === 'rush' && S.phase === 'shift' && spec().seconds - S.t < 20 && !DM.on, bpm = SG.bpm * (last ? 1.14 : 1), st = 60 / bpm / 2;
    MUS.bus.gain.setTargetAtTime(S.react && MUS.song === 'rush' ? SG.vol * 0.75 : SG.vol, ac.currentTime, 0.3);
    while (MUS.at < ac.currentTime + 0.25) { const i = MUS.step % 32, bar = Math.floor(i / 8), beat = i % 8, t0 = MUS.at, ch = SG.chords[bar], root = SG.bass[bar];
      if (MUS.song === 'lounge') {
        if (beat === 0) ch.forEach((m, k) => voice(ac, 'triangle', m, t0 + k * 0.012, st * 7.5, 0.05, 1800));
        if (beat === 0 || beat === 3 || beat === 6) voice(ac, 'sine', root - (beat === 3 ? 0 : 0), t0, st * 1.8, 0.2);
        if (beat % 2 === 1) drum(ac, 'hat', t0, 0.04);
        if (beat === 4) drum(ac, 'snare', t0, 0.05);
        if ((MUS.step >> 5) % 2 === 1 && SG.lead[i]) voice(ac, 'sine', SG.lead[i] + 12, t0, st * 1.6, 0.05);
      } else {
        const chip = MUS.song === 'arcade';
        if (beat % 2 === 0) drum(ac, 'kick', t0, chip ? 0.4 : 0.75); if (beat === 2 || beat === 6) drum(ac, 'snare', t0, chip ? 0.12 : 0.22); drum(ac, 'hat', t0, beat % 2 ? 0.07 : 0.035);
        voice(ac, chip ? 'square' : 'sawtooth', root + (beat % 2 ? 12 : 0), t0, st * 0.9, chip ? 0.06 : 0.11, chip ? 1400 : 900);
        if (beat === 0 || beat === 3 || beat === 6) ch.forEach(m => voice(ac, 'square', m + 12, t0, st * 0.7, 0.018, 2600));
        if (SG.lead && ((MUS.step >> 5) % 2 === 1 || last) && SG.lead[i]) { voice(ac, 'square', SG.lead[i] + (last ? 12 : 0), t0, st * 1.3, 0.05, 3200); }
      }
      MUS.at += st; MUS.step++; } }
  function jingle(good) { const ac = audio.ctx; if (!ac || audio.muted) return; if (!MUS.bus) return; const t = ac.currentTime + 0.05, notes = good ? [72, 76, 79, 84, 79, 84] : [67, 64, 60]; notes.forEach((m, k) => voice(ac, 'square', m, t + k * 0.11, 0.22, 0.07, 3000)); }
  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const RINGS = hintRings(ST); let HINT = null, hintT = 0;
  const lerpCam = (sh, k) => { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); };
  function tick(dt) {
    if (S.fadeDir) { S.fade = clamp(S.fade + S.fadeDir * dt * 4, 0, 1); if (S.fade >= 1 && S.fadeDir > 0) { const f = S.fadeFn; S.fadeFn = null; S.fadeDir = -1; f && f(); } else if (S.fade <= 0 && S.fadeDir < 0) S.fadeDir = 0; }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; if (S.regLineT > 0) S.regLineT -= dt;
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.12 + (1 - p.life) * 0.25); }
    lampGl.forEach((s, i) => s.material.opacity = 0.42 + Math.sin(clock.elapsedTime * 2 + i) * 0.05);
    musicStep(); ambStep(dt); cabsStep(dt); K.anim && K.anim(clock.elapsedTime, dt);
    // laser glow
    S.laserT = Math.max(0, (S.laserT || 0) - dt); K.laser.forEach((l, i) => { l.material.opacity = S.laserT > 0 ? 1 : 0.55 + Math.sin(clock.elapsedTime * 9 + i) * 0.2; l.material.color.setHex(S.laserT > 0 ? 0xffffff : 0xff3b3b); }); K.scanGlass.material.color.setHex(S.laserT > 0 ? 0xdc2626 : 0x7f1d1d);
    // the bins show what is left
    STOCK.forEach(s => { const st = binStacks[s.id]; if (!st) return; const n = s.day <= S.day ? Math.round((shelf[s.id] / maxStock()) * 8) : 0; st.forEach((m, i) => m.visible = i < n); });
    if (W.pipWave > 0) W.pipWave -= dt;
    K.back.visible = true; if (S.phase === 'cab') { K.front.forEach(m => m.visible = false); K.cut.forEach(m => m.visible = false); cabStep(dt); kit.animFox(benW, dt, 0); kit.animFox(pip, dt, 0); loungersStep(dt); camera.lookAt(CAM.look); return; }
    if (S.phase === 'walk') { K.front.forEach(m => m.visible = false); K.cut.forEach(m => m.visible = false); walkStep(dt); loungersStep(dt); if (!W.greeted && pip.position.distanceTo(benW.position) < 5) { W.greeted = true; W.pipWave = 2.2; tone(659, 0.08, 0.03, 'triangle'); setTimeout(() => tone(880, 0.1, 0.03, 'triangle'), 110); } kit.animFox(pip, dt, 0); if (W.pipWave > 0) waveArm(pip.userData.P); camera.lookAt(CAM.look); return; }
    // ---- job phases ----
    const work = S.phase === 'shift', sp = spec();
    if (S.react) { S.react.t += dt; if (S.react.t > (DM.on ? 1.6 : 1.5)) reactDone(); }
    if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done')) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (work && (S.pay || (S.payOut && !S.payOut.exact))) lerpCam(payShot(), Math.min(1, dt * 4));
    else if (work || S.phase === 'glide') lerpCam(workShot(), Math.min(1, dt * 3.2));
    { const wide = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !wide); K.cut.forEach(m => m.visible = false); }
    K.back.visible = camera.position.z > K.origin.z - K.D / 2 + 0.7; camera.lookAt(CAM.look);
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { S.phase = 'shift'; flash('DOORS OPEN!', '#22c55e', 1.4); } }
    if (work && !DM.on) { const left = sp.seconds - S.t; if (left < 20 && !S.lastCall) { S.lastCall = true; flash('LAST CALL!', '#ec3013', 1.6); say('PIP: “Last call! Get them served!”', 3); } if (left < 10 && Math.ceil(left) !== S.tickSec) { S.tickSec = Math.ceil(left); sfx('tick'); } }
    if (work) { S.t += dt; const timeUp = S.t >= sp.seconds && !DM.on, allDone = S.spawned >= (S.demo ? 2 : sp.customers) && !customers.length; if (timeUp || (allDone && !S.demo)) { if (timeUp) customers.filter(o => o.st !== 'leave').forEach(o => { if (o.st !== 'pay') { S.lost++; } }); endShift(); return; } }
    // the hold-to-restock ring
    if (S.press) { S.press.t += dt; if (!S.press.done && S.press.t >= 0.9) { S.press.done = true; if (shelf[S.press.id] >= maxStock()) flash('ALREADY FULL', '#cfcac4', 0.9); else restock(S.press.id); if (DM.on && DM.phase === 1) { S.press = null; DM.phase = 2; DM.cd = 1.2; } } }
    // the held item: drop from the shelf, slide over the scanner, fly to the customer
    { const H = S.held; if (H) { H.t += dt;
      if (H.phase === 'drop') { const k = Math.min(1, H.t / 0.4); H.mesh.position.lerpVectors(H.from, H.to, smooth(0, 1, k)); H.mesh.position.y += Math.sin(k * Math.PI) * 0.35; H.mesh.rotation.y = k * 4; if (k >= 1) { H.mesh.rotation.y = 0; H.phase = 'ready'; sfx('drop'); if (upg('laser') && !H.scanned) { H.phase = 'slide'; H.t = 0; H.from = H.mesh.position.clone(); H.to = K.bagSpot.clone(); } } }
      else if (H.phase === 'slide') { const k = Math.min(1, H.t / 0.32); H.mesh.position.lerpVectors(H.from, H.to, smooth(0, 1, k)); if (!H.scanned && H.mesh.position.x < K.scanner.x + 0.05) beep(); if (k >= 1) H.phase = 'ready'; }
      else if (H.phase === 'fly') { const k = Math.min(1, H.t / H.dur); H.mesh.position.lerpVectors(H.from, H.to, k); H.mesh.position.y += Math.sin(k * Math.PI) * 0.45; H.mesh.rotation.x = k * 7; if (k >= 1) landHeld(); } } }
    // customers in, queue, counter, out
    if (work && !S.react) { S.next -= dt; const lim = S.demo ? 2 : sp.customers; if (S.spawned < lim && queue().length < (S.demo ? 1 : sp.queue + 1) && S.next <= 0 && S.t < sp.seconds - 20) { newCustomer(); S.next = S.demo ? 1.5 : rr(sp.gap[0], sp.gap[1]) * Math.max(0.7, 1 - S.day * 0.04); } }
    const Q = queue();
    for (let i = customers.length - 1; i >= 0; i--) { const o = customers[i]; o.t += dt; let spd = 0, qi = Q.indexOf(o);
      if (o.st === 'walk' || o.st === 'queue' || o.st === 'counter' || o.st === 'pay') { const spot = K.spots[Math.min(qi, K.spots.length - 1)], d = V3(spot.x - o.f.position.x, 0, spot.z - o.f.position.z), L = d.length();
        if (L > 0.06) { spd = 1.9; o.f.position.addScaledVector(d.normalize(), Math.min(L, spd * dt)); o.f.rotation.y = Math.atan2(d.x, d.z); }
        else { o.f.rotation.y = damp(o.f.rotation.y, Math.PI, 8, dt); if (o.st === 'walk') o.st = 'queue'; if (o.st === 'queue' && qi === 0) { o.st = 'counter'; say(custName(o) + ': “' + o.line + '”', 3.4); tone(1046, 0.06, 0.03); S.coachSeen.c = true; } }
        if (work && !DM.on && o.st !== 'pay') { o.pat -= dt * (o.st === 'counter' ? 1 : 0.32); const r = o.pat / o.patMax; if (!(S.react && S.react.o === o)) o.f.userData.mood = r < 0.25 ? 'stern' : r < 0.55 ? 'neutral' : 'happy'; if (o.pat <= 0) walkOut(o); else if (r < 0.25 && o.st === 'counter') { o.steamT = (o.steamT || 0) - dt; if (o.steamT <= 0) { o.steamT = 0.7; puff(o.f.position.x + rr(-0.15, 0.15), 2.2, o.f.position.z, 0x9ca3af, 1); } } } }
      else if (o.st === 'leave') { const d = V3(K.door.x - o.f.position.x, 0, K.door.z + 0.8 - o.f.position.z), L = d.length(); spd = 2.0; if (L > 0.1) { o.f.position.addScaledVector(d.normalize(), Math.min(L, spd * dt)); o.f.rotation.y = Math.atan2(d.x, d.z); } if (L < 0.4 || o.t > 9) removeCustomer(o); }
      if (!customers.includes(o)) continue;
      kit.animFox(o.f, dt, spd); const bp = o.f.position; o.bub.sp.position.set(bp.x, 2.55, bp.z); o.bub.sp.visible = o.st !== 'leave' && o.st !== 'walk' && !(S.react && S.react.o === o); const near = o.st === 'counter' || o.st === 'pay'; o.bub.sp.scale.set(near ? 1.15 : 0.85, near ? 0.575 : 0.425, 1); if (o.bub.sp.visible) drawBubble(o); }
    // the register drawer + coins
    regDisp.visible = !!(S.pay || (S.payOut && !S.payOut.exact)); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; sfx('drop'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, T + 0.03, KZ + 0.4); coinsOut.forEach(m => { if (m.userData.t >= 1) m.position.lerp(to, Math.min(1, dt * 3)); }); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } }
    if (DM.on) demoStep(dt);
    hintT += dt; HINT = nextHint(); RINGS.place(HINT && HINT.p && !S.react ? HINT : null, hintT, dt);
    // the cast
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox(ben, dt, 0); kit.animFox(pip, dt, 0);
    if (greet) waveArm(BP); else if (S.held) { ben.userData.lookAt = S.held.mesh.position.clone(); } else { const o = head(); ben.userData.lookAt = o ? o.f.position.clone().setY(1.6) : null; }
    if (work) { pip.userData.lookAt = head() ? head().f.position.clone().setY(1.5) : null; pip.userData.mood = S.lost ? 'neutral' : 'happy'; if (S.react && S.react.stars === 3) waveArm(pip.userData.P); }
  }
  function nextHint() { if (S.phase !== 'shift' || S.react || S.pay) return null; const o = head(), H = S.held;
    if (S.hintShelf && shelf[S.hintShelf] <= 0) return { text: 'HOLD ' + stockDef(S.hintShelf).short + ' TO RESTOCK', shelf: S.hintShelf, p: binPos(S.hintShelf).setY(T + 0.2), r: 0.3 };
    if (!o || o.st !== 'counter') return null;
    if (!H) { const w = o.wants.find(q => !q.got); return w ? { text: 'TAP ' + w.short + (w.kind === 'stock' ? ' ON THE SHELF' : ' IN THE BONUS TRAY'), shelf: w.kind === 'stock' ? w.id : null, bonus: w.kind !== 'stock' ? w.kind : null } : null; }
    if (H.phase !== 'ready') return null;
    if (!H.scanned) return { text: 'SWIPE IT ACROSS THE SCANNER →', p: K.scanner.clone(), r: 0.28 };
    return { text: 'FLICK IT UP TO ' + custName(o) + ' ↑', p: V3(o.f.position.x, 0.02, o.f.position.z), r: 0.45 }; }
  let ERR = null; function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE && !S.hiddenPause) { try { tick(dt); } catch (e) { if (!ERR) { ERR = 'Clubhouse error: ' + (e && e.message || String(e)); console.warn(e); } } } renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onKD = e => { if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (S.phase === 'cab') { if (e.code === 'Space' || e.code === 'Enter') { e.preventDefault(); if (S.cab.g.over) cabAgain(); else S.cab.tap = true; } else if (e.code === 'Escape') cabExit(); else S.cab.keys.add(e.code); return; }
    if (S.phase === 'shift') { const n = +e.key; const av = availStock(); if (n >= 1 && n <= av.length) { pickItem('stock', av[n - 1].id); return; } if (e.code === 'ArrowRight' || e.code === 'KeyS') { scanSwipe(); return; } if (e.code === 'ArrowUp' || e.code === 'KeyF' || e.code === 'Space') { e.preventDefault(); flick(1); return; } return; }
    if (S.phase !== 'walk') return; if (e.code === 'KeyE') { e.preventDefault(); api.talk(); return; } if (e.code === 'Digit1') { wave(); return; } if (e.code === 'Digit2') { playOrSit(); return; } if (e.code === 'Space') { e.preventDefault(); hop(); return; } W.keys.add(e.code); },
    onKU = e => { W.keys.delete(e.code); if (S.cab) S.cab.keys.delete(e.code); }, onBlur = () => W.keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  const onVis = () => { if (document.hidden) { S.hiddenPause = true; try { audio.ctx && audio.ctx.suspend(); } catch (e) {} } else if (S.hiddenPause) { S.hiddenPause = false; clock.getDelta(); try { audio.ctx && audio.ctx.resume(); } catch (e) {} } }; document.addEventListener('visibilitychange', onVis);
  const unlock = () => audioOn(); addEventListener('pointerdown', unlock, true); addEventListener('keydown', unlock, true);

  // ---------- HUD state for the page ----------
  function coachInfo() { if (S.phase !== 'shift' || S.react || S.pay || CAM.t < 1) return null; const H = S.held, o = head(); if (!H || H.phase !== 'ready' || !o) return null; if (!DM.on && S.touched && S.served >= 1) return null;
    const at = p => { const q = scr(p); return { x: Math.round(q.x), y: Math.round(q.y) }; };
    if (!H.scanned) { const a = at(K.pickSpot), b = at(K.bagSpot); return { kind: 'drag', ...a, dx: b.x - a.x, dy: b.y - a.y, label: 'SWIPE' }; }
    const a = at(H.mesh.position), b = at(V3(o.f.position.x, 1.5, o.f.position.z)); return { kind: 'drag', ...a, dx: b.x - a.x, dy: b.y - a.y, label: 'FLICK' }; }
  function hud() { const o = head(), sp = spec(), tr = bonusTrays();
    const wantsOf = q => q.wants.map(w => ({ name: w.short, kind: w.kind, got: w.got, col: w.col }));
    const tickets = queue().filter(q => q.st !== 'walk').map(q => ({ id: q.id, name: custName(q), wants: wantsOf(q), pat: Math.max(0, q.pat / q.patMax), at: q === o, total: q.wants.reduce((a, w) => a + w.price, 0) }));
    const wantSet = new Set(o ? o.wants.filter(w => !w.got).map(w => w.kind === 'stock' ? 'stock:' + w.id : w.kind === 'relic' ? 'relic' : w.kind + ':' + w.id) : []);
    const shelves = availStock().map((s, i) => ({ id: s.id, n: i + 1, name: s.name, short: s.short, stock: shelf[s.id], max: maxStock(), col: s.col, price: s.price, ring: S.press && S.press.id === s.id && !S.press.done ? clamp((S.press.t - 0.2) / 0.7, 0, 1) : 0, want: wantSet.has('stock:' + s.id), empty: shelf[s.id] <= 0 }));
    const bonus = tr.map(b => ({ kind: b.kind, id: b.id, name: b.short, price: b.price, stock: b.stock === Infinity ? '∞' : String(b.stock), want: b.kind === 'relic' ? wantSet.has('relic') : wantSet.has(b.kind + ':' + b.id) }));
    const H = S.held, sale = o ? { who: custName(o), wants: wantsOf(o), step: S.pay ? 'pay' : o.st === 'pay' ? 'paying' : !H ? 'pick' : H.phase === 'fly' ? 'fly' : !H.scanned ? 'scan' : 'flick', held: H ? { name: H.name, scanned: H.scanned } : null, line: o.line } : null;
    const walk = S.phase === 'walk' ? { prompt: W.prompt, dialog: dlgHud(), toast: W.toast || null, sitting: !!W.sit, hired: !!save.flag(SAVE.hired) } : null;
    const C = S.cab, cab = C ? { name: C.c.name, how: C.c.how, col: C.c.col, score: C.g.score, lives: C.g.lives, over: C.g.over, best: Math.max(C.best, C.g.over ? 0 : 0), pb: !!C.pb } : null;
    const sorterCoin = S.pay && upg('sorter') ? [10, 5, 2, 1].find(v => v <= S.pay.owed - S.pay.given) : null;
    return { phase: S.phase, mode: S.mode, day: S.day, shiftKey: S.shiftKey, shifts: SHIFTS.map(s => ({ key: s.key, label: s.label, customers: s.customers, seconds: s.seconds, best: save.stat(SAVE.best + s.key, 0), brief: s.brief })), left: Math.max(0, sp.seconds - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, of: S.demo ? 2 : sp.customers, spawned: S.spawned,
      stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo || 0, tickets, sale, shelves, bonus, pay: S.pay ? { ...S.pay } : null, sorterCoin, flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, uniform: !!save.flag(SAVE.uniform), hired: !!save.flag(SAVE.hired), shiftsRun: save.stat(SAVE.shifts, 0),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), stockList: availStock().map(s => s.short), passes: tr.filter(b => b.kind === 'pass').length, packItems: tr.filter(b => b.kind === 'item').reduce((a, b) => a + b.stock, 0), relics: tr.filter(b => b.kind === 'relic').length,
      demo: DM.on ? { cap: DM.cap, key: DM.key, n: S.served, of: 2, target: DM.target } : null, hint: HINT && HINT.text && !S.react && S.phase === 'shift' ? { text: HINT.text, shelf: HINT.shelf || null, bonus: HINT.bonus || null } : null,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip } : null, regLine: S.regLineT > 0 ? S.regLine : null,
      fade: S.fade, err: ERR, muted: !!audio.muted, lastCall: !!S.lastCall && S.phase === 'shift', bestStreak: S.bestStreak || 0, walk, cab, sign: S.sign, signAsk: !!S.signAsk, keeper: CLUB8.keeper, coach: coachInfo(), cabsBest: K.cabs.map(c => ({ name: c.name, best: save.stat(SAVE.cab + c.id, 0) })) }; }
  function emit() { onState(hud()); }
  if (S.phase === 'intro') { placeGreeter(); const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); } else { ben.visible = false; benW.visible = true; benW.position.set(K.door.x, 0, K.door.z - 1.2); benW.rotation.y = Math.PI; seatLoungers(); }
  frame();
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setShift, startShift, endShift, demoStart, demoStop, giveCoin, buyUpgrade, hud, toIntro() { toIntro(); }, toWalk, setPaused(v) { PAUSE = !!v; }, setSign, signLater, askSign() { S.signAsk = true; },
    shelfDown, shelfUp, pick(kind, id) { pickItem(kind, id); }, scan: scanSwipe, flick, cabExit, cabAgain, cabStart(i) { const c = K.cabs[i]; if (c) { if (S.phase !== 'walk') toWalk(); setTimeout(() => cabStart(c), S.phase === 'walk' ? 0 : 400); } },
    // ---- Game HUD engine contract (walk mode) ----
    start() {}, talk() { if (S.phase !== 'walk') return; if (W.D) { dlgNext(); return; } if (W.target) openTalk(W.target); }, choose(i) { dlgChoose(i); }, closeDialog() { closeTalk(); }, nextLine() { dlgNext(); }, clearToast() { W.toast = ''; },
    melee() { wave(); }, range() { playOrSit(); }, jump() { hop(); }, meleeUp() {}, useItem() { W.toast = 'KEEP IT · OR SELL IT AT THE COUNTER'; W.toastT = 2; }, closeWheel() {}, skipTime() {}, setHudPad() {}, setStick(x, y) { W.stick.x = x; W.stick.y = y; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 6, pitch: 0.6 }; }, setCam() {}, setMinimap() {}, toggleSound() { audioOn(); audio.setMuted && audio.setMuted(!audio.muted); try { localStorage.setItem('club8.muted', audio.muted ? '1' : '0'); } catch (e) {} return audio.muted; }, cycleWeather() {},
    mapData() { const p = benW.position; return { p: [p.x, p.z, benW.rotation.y], b: [['COUNTER', 0, KZ], ['DOOR', K.door.x, K.door.z], ['LOUNGE', 0, 3.0], ...K.cabs.map(c => [c.name, c.x, c.z])], f: loungers.map(l => [l.f.position.x, l.f.position.z]), e: [], q: [pip.position.x, pip.position.z, 'PIP'] }; },
    _sim(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); renderer.render(scene, camera); emit(); }, _state: () => S, _shelf: shelf, _cust: customers, _W: W, _K: K, _scr: scr, _skip(t) { S.t = Math.max(S.t, spec().seconds - t); },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); renderer.domElement.removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis); removeEventListener('pointerdown', unlock, true); removeEventListener('keydown', unlock, true); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
