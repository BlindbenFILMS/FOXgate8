// 8 GATES — ZION · AUREL'S GOLDWORKS: THE GOLDSMITH OF ZION [zionGoldsmith]. Ben works Aurel's forge and bench.
// Built on the restaurant engine (Meru Burgers → Ur Espresso) + engine/restaurant-kit.js. Every step is a touch move:
//   MELT    tap river nuggets into the crucible, then PUMP the bellows (slide up + down) until the gold is MOLTEN, not scorched
//   POUR    press + drag DOWN to tilt the crucible; the further you drag the faster it pours; let go at the line
//   HAMMER  the ring sits on the mandrel; TAP when the shrinking ring meets the gold mark (a rhythm game)
//   STONE   tap the stone the ticket asks for (ruby = round, sapphire = diamond, emerald = square), then tap to close 4 prongs
//   ENGRAVE trace the dotted Z (Zion's crest) on the signet plate with one finger
//   POLISH  rub back and forth on the piece: steady wins, too fast heats it and leaves a smear
//   SERVE   slide the velvet tray across the counter (drag, flick, or tap the customer) → PAY (exact, or give change)
// TWO MODES in one scene (same contract as Ur Espresso):
//   'walk'  = the shop as an interior: Ben (CAST.player) walks in and around it, sits, waves, talks to Aurel, Tobe + Wynn.
//             Game HUD drives it (vehicle="gold": 1 WAVE · 2 SIT · 3 JUMP, TALK near someone).
//   'shift' = the job (intro welcome card → 3 minute shift → day card), like every restaurant.
// Save keys zion.gold.* (day, best, pieces, upg.*, stars, flag zion.gold.hired), uniform flag goldsmithUniform.
// MERGE: buildGoldworks(ctx) builds the interior at an origin (12 x 10 m, door on +z) and returns colliders, seats, the keeper
// spot and the door, so any FOX world building can host it; createGoldsmithShift({ container, mode }) runs it stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit } from '../../engine/restaurant-kit.js';

export const GOLDWORKS = { name: 'AUREL’S GOLDWORKS', room: 'zionGoldsmith', shift: 180, keeper: 'Aurel' };
export const PIECES = [
  { id: 'ring', name: 'GOLD RING', day: 1, price: 6, nug: [2, 3], kind: 'ring', steps: ['melt', 'pour', 'hammer', 'polish'] },
  { id: 'pendant', name: 'GEM PENDANT', day: 1, price: 8, nug: [2, 3], kind: 'drop', gem: true, steps: ['melt', 'pour', 'gem', 'polish'] },
  { id: 'signet', name: 'SIGNET RING', day: 2, price: 10, nug: [3, 4], kind: 'ring', plate: true, steps: ['melt', 'pour', 'hammer', 'engrave', 'polish'] },
  { id: 'crest', name: 'ZION CREST RING', day: 3, price: 14, nug: [3, 4], kind: 'ring', plate: true, gem: true, steps: ['melt', 'pour', 'hammer', 'engrave', 'gem', 'polish'] }];
// stones differ in SHAPE as well as colour, so they read without colour too
export const GEMS = { ruby: { name: 'RUBY', col: '#e0284a', shape: 'round', day: 1 }, sapphire: { name: 'SAPPHIRE', col: '#2f6bff', shape: 'diamond', day: 1 }, emerald: { name: 'EMERALD', col: '#22c55e', shape: 'square', day: 2 } };
export const UPGRADES = [
  { id: 'bellows', name: 'BIG BELLOWS', cost: 40, line: 'Every pump gives 40% more heat.' },
  { id: 'tongs', name: 'STEADY TONGS', cost: 35, line: 'The crucible pours gentler. Easier to stop on the line.' },
  { id: 'metronome', name: 'BRASS METRONOME', cost: 40, line: 'The hammer beat is slower and the window wider.' },
  { id: 'loupe', name: 'JEWELLER’S LOUPE', cost: 30, line: 'Engraving forgives a wobbly paw.' },
  { id: 'musicbox', name: 'ZION MUSIC BOX', cost: 60, line: 'Customers wait 20% longer.' }];
// Zion townsfolk (names from the Zion town square)
const CUSTOMERS = [
  { name: 'CASS', role: 'Townsfolk', fur: '#ee7d24', furDark: '#b8531a', torso: ['#e8b923', '#fbf3d2', '#8a6a10'] },
  { name: 'JUNO', role: 'Townsfolk', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#5a3e8c', '#ece4f6', '#332745'], outfit: 'dress' },
  { name: 'RELL', role: 'Gold panner', fur: '#c9682a', furDark: '#8a4213', torso: ['#6b7d3a', '#e6b45a', '#3b4520'] },
  { name: 'MIKA', role: 'Townsfolk', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#b3262e', '#fce7f3', '#661a10'], outfit: 'coat' },
  { name: 'SOLEN', role: 'Truck driver', torso: ['#3a4a5c', '#d7dde3', '#1f2a36'] },
  { name: 'IVET', role: 'Townsfolk', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#2f8d84', '#cfe8e4', '#1f6a62'], outfit: 'dress' },
  { name: 'ORO', role: 'Townsfolk', torso: ['#e8c88a', '#fbf8ec', '#b08340'], outfit: 'robe' }];
const LINES = {
  ring: ['Just a plain gold ring. Plain is honest.', 'A ring for my sister. She will say it is too much.', 'Panned that gold myself. Make it a ring.'],
  pendant: ['Something with a stone in it. For luck.', 'A pendant, please. My old one went down the river.', 'I want it to catch the lantern light.'],
  signet: ['A signet. With the Z. Proper Zion.', 'I need a seal ring for the survey papers.', 'Signet ring. The clerk says I sign like a goat.'],
  crest: ['The crest ring. The good one.', 'Zada wears one like it. Not that I am copying.', 'Crest ring, stone in the middle. I saved all season.'],
  angry: ['I could pan faster than this.', 'Gold does not wait and neither do I.'] };
// Aurel the goldsmith
const AUREL = {
  hello: 'You have steady paws. Ever held a crucible? I could use a second pair at the forge.',
  back: 'There you are. Forge is hot, there is a ticket up.',
  work: ['Good. Apron on, loupe up. Gate in the counter lifts, come round.', 'Gold is soft and it forgives you a lot. Heat it, pour it, beat it, set it, shine it.', 'The ticket tells you the piece. Gold first. Go.'],
  again: ['Ticket is up. The forge is waiting.'],
  how: ['Six things, and the bench will tell you which one it wants.', 'MELT: tap the nuggets into the crucible, exactly as many as the ticket says. Then pump the bellows. Slide up, slide down. Stop pumping when it is molten. Gold that boils goes grey.', 'POUR: press and drag down to tip the crucible. A little drag is a trickle, a long drag is a flood. Let go at the line.', 'HAMMER: the ring goes on the mandrel. A ring of light closes on the mark. Strike when they meet. Keep the beat.', 'STONE: read the ticket. Ruby is round, sapphire is a diamond, emerald is square. Then close the four prongs over it.', 'ENGRAVE: trace the Z with one steady line. POLISH: rub it, steady. Rub too fast and it smears. Then slide the tray across the counter.'],
  story: ['I came up the Gold River with a pan and a bad knee, like half of Zion.', 'Everybody else wanted the gold. I wanted to know what it could become.', 'So I learned the fire. Thirty years now, and the river still sends me more than I can shape.', 'Some days the water tastes of that oil drill. The gold does not mind. Gold never minds.'],
  later: ['The forge stays lit.'] };
// the two panners on the bench, arguing about the river
const BENCH_TALK = {
  tobe: { name: 'Tobe', role: 'Gold panner', lines: [['npc', 'The North Bar. Best colour on the whole river.'], ['player', 'He seems sure.'], ['npc', 'I am sure. Ask Aurel whose nugget is in the window.']] },
  wynn: { name: 'Wynn', role: 'Gold panner', lines: [['npc', 'The Deep Bend. Fewer flakes, bigger flakes.'], ['player', 'Tobe says the North Bar.'], ['npc', 'Tobe also says the oil drill is good for the fish.']] } };
const SAVE = { day: 'zion.gold.day', best: 'zion.gold.best', pieces: 'zion.gold.pieces', upg: 'zion.gold.upg.', stars: 'zion.gold.stars', hired: 'zion.gold.hired', uniform: 'goldsmithUniform' };
const STEP_INFO = { melt: { label: 'MELT', st: 'forge' }, pour: { label: 'POUR', st: 'forge' }, hammer: { label: 'HAMMER', st: 'anvil' }, gem: { label: 'STONE', st: 'bench' },
  engrave: { label: 'ENGRAVE', st: 'bench' }, polish: { label: 'POLISH', st: 'bench' }, serve: { label: 'SERVE', st: 'counter' } };
const HEAT = [60, 80];

// ---------------- the shop interior ----------------
// Room 12 x 10 m, origin in the middle of the floor, door in the front wall (+z). The counter runs across the room at z = KZ;
// Aurel's side (the workshop: forge, anvil, bench) is -z. Everything the job needs is returned in K (world space).
export function buildGoldworks(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, grad, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const ox = origin.x, oz = origin.z, W = 12, D = 10, H = 4.6, KZ = -0.6, T = 1.05;
  const gold = toon('#f0bd40', { emissive: '#6a4300', emissiveIntensity: 0.35 }), goldD = toon('#c8952e', { emissive: '#4a2e00', emissiveIntensity: 0.3 }), brass = toon('#d9a441', { emissive: '#3a2400', emissiveIntensity: 0.2 }), brassD = toon('#a8792e'), ink = toon('#201e1d'), wood = toon('#9a6a36'), woodD = toon('#5e3a1e'), plank = toon('#c8924a'), iron = toon('#3a3836'), ironL = toon('#5a5754'), steel = toon('#c4ccd4'), brick = toon('#8a3e22'), velvet = toon('#5a1830'), cream = toon('#fbf3d2');
  const TM = map => new T3.MeshToonMaterial({ map, gradientMap: grad });
  const zMark = (c, x, y, s, col = '#201e1d', lw = 0.18) => { c.save(); c.translate(x, y); c.strokeStyle = col; c.lineWidth = s * lw; c.lineJoin = 'miter'; c.lineCap = 'square'; c.beginPath(); c.moveTo(-s * 0.4, -s * 0.38); c.lineTo(s * 0.4, -s * 0.38); c.lineTo(-s * 0.4, s * 0.38); c.lineTo(s * 0.4, s * 0.38); c.stroke(); c.restore(); };
  // floor: wide honey boards with dark nail lines
  const floorT = CTX(256, 256, c => { for (let i = 0; i < 8; i++) { c.fillStyle = ['#b07a3a', '#a26e32', '#bb8442', '#a87436'][i % 4]; c.fillRect(0, i * 32, 256, 32); c.fillStyle = '#6b4320'; c.fillRect(0, i * 32, 256, 2); const j = (i * 97) % 256; c.fillRect(j, i * 32, 2, 32); c.fillStyle = '#4a2c14'; c.fillRect(j + 6, i * 32 + 8, 3, 3); c.fillRect(j + 6, i * 32 + 21, 3, 3); } });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 3, D / 3);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), TM(floorT)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  { const flagT = CTX(256, 256, c => { c.fillStyle = '#3a2a1e'; c.fillRect(0, 0, 256, 256); const cols = ['#6b5340', '#7a604a', '#5e4836', '#735a44']; for (let r = 0; r < 4; r++) for (let q = -1; q < 3; q++) { c.fillStyle = cols[(r * 3 + q + 8) % 4]; c.beginPath(); c.roundRect(q * 96 + (r % 2) * 48 + 4, r * 64 + 4, 88, 56, 8); c.fill(); c.fillStyle = 'rgba(255,220,160,0.08)'; c.fillRect(q * 96 + (r % 2) * 48 + 10, r * 64 + 8, 60, 6); } });
    flagT.wrapS = flagT.wrapT = T3.RepeatWrapping; flagT.repeat.set(W / 2.2, 4.4 / 2.2); const ws = new T3.Mesh(new T3.PlaneGeometry(W, 4.4), TM(flagT)); ws.rotation.x = -Math.PI / 2; ws.position.set(0, 0.004, -D / 2 + 2.2); ws.receiveShadow = true; root.add(ws); }
  // the street outside: cobbles + dust
  { const st = CTX(256, 256, c => { c.fillStyle = '#c9a86a'; c.fillRect(0, 0, 256, 256); for (let r = 0; r < 8; r++) for (let k = -1; k < 5; k++) { c.fillStyle = ['#d9b878', '#cfae6e', '#bfa064'][(r + k + 9) % 3]; c.beginPath(); c.roundRect(k * 64 + (r % 2) * 32 + 3, r * 32 + 3, 58, 26, 9); c.fill(); } }); st.wrapS = st.wrapT = T3.RepeatWrapping; st.repeat.set(8, 3);
    const sp = new T3.Mesh(new T3.PlaneGeometry(W + 10, 7), TM(st)); sp.rotation.x = -Math.PI / 2; sp.position.set(0, -0.004, D / 2 + 3.5); sp.receiveShadow = true; root.add(sp); }
  // walls: yellow-gold planks over a dark wainscot, a brass band with little Z marks
  const wallT = CTX(256, 256, c => { for (let q = 0; q < 8; q++) { c.fillStyle = ['#e8b84a', '#dfae40', '#eec158'][q % 3]; c.fillRect(q * 32, 0, 32, 150); c.fillStyle = '#b8862a'; c.fillRect(q * 32, 0, 2, 150); }
    c.fillStyle = '#a8792e'; c.fillRect(0, 150, 256, 14); for (let x = 16; x < 256; x += 32) zMark(c, x, 157, 10, '#fff2c0', 0.2);
    c.fillStyle = '#5e3a1e'; c.fillRect(0, 164, 256, 92); c.fillStyle = '#4a2c14'; for (let q = 0; q < 8; q++) c.fillRect(q * 32, 164, 2, 92); });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1); const wallM = TM(wallT);
  const cut = [], front = [];
  for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); }
  { const ceil = M(new T3.BoxGeometry(W, 0.16, D), toon('#d9b878'), 0, H + 0.08, 0, root, 0); cut.push(ceil); for (const x of [-4, 0, 4]) cut.push(M(new T3.BoxGeometry(0.24, 0.24, D), woodD, x, H - 0.1, 0, root, 0.01)); }
  // front wall: door + two street windows (hidden in walk mode so the camera can look in)
  { const streetT = CTX(512, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#f6d27a'); g.addColorStop(0.55, '#fbe9b8'); g.addColorStop(0.56, '#d9b06a'); g.addColorStop(1, '#c49650'); c.fillStyle = g; c.fillRect(0, 0, 512, 256);
      c.fillStyle = '#e8b84a'; c.fillRect(20, 60, 140, 82); c.fillRect(330, 50, 160, 92); c.fillStyle = '#5e3a1e'; c.fillRect(40, 86, 24, 56); c.fillRect(370, 80, 30, 62); c.fillStyle = '#8a8580'; c.beginPath(); c.moveTo(220, 142); c.lineTo(250, 30); c.lineTo(280, 142); c.fill(); c.fillStyle = '#ffd23a'; c.fillRect(240, 60, 20, 6); c.fillStyle = '#ffffff'; c.globalAlpha = 0.25; c.fillRect(0, 0, 512, 256); });
    const fw = new T3.Group(); root.add(fw); front.push(fw);
    const seg = (x0, x1, y0, y1) => { const m = new T3.Mesh(new T3.PlaneGeometry(x1 - x0, y1 - y0), wallM); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, D / 2); m.rotation.y = Math.PI; fw.add(m); };
    seg(-6, -5.1, 0, H); seg(5.1, 6, 0, H); seg(-1.75, -1.25, 0, H); seg(1.25, 1.75, 0, H); seg(-1.25, 1.25, 3.1, H); seg(-5.1, -1.75, 0, 0.95); seg(1.75, 5.1, 0, 0.95); seg(-5.1, -1.75, 3.45, H); seg(1.75, 5.1, 3.45, H);
    for (const cx of [-3.425, 3.425]) { const win = new T3.Mesh(new T3.PlaneGeometry(3.35, 2.5), new T3.MeshBasicMaterial({ map: streetT })); win.position.set(cx, 2.2, D / 2 + 0.02); win.rotation.y = Math.PI; fw.add(win);
      for (const dx of [-1.68, 0, 1.68]) M(new T3.BoxGeometry(0.1, 2.6, 0.12), woodD, cx + dx, 2.2, D / 2 - 0.04, fw, 0.01); M(new T3.BoxGeometry(3.45, 0.1, 0.14), woodD, cx, 3.45, D / 2 - 0.04, fw, 0.01); M(new T3.BoxGeometry(3.5, 0.08, 0.3), woodD, cx, 0.97, D / 2 - 0.12, fw, 0.01); }
    M(new T3.BoxGeometry(0.16, 3.1, 0.2), woodD, -1.3, 1.55, D / 2 - 0.05, fw, 0.01); M(new T3.BoxGeometry(0.16, 3.1, 0.2), woodD, 1.3, 1.55, D / 2 - 0.05, fw, 0.01); M(new T3.BoxGeometry(2.76, 0.16, 0.2), woodD, 0, 3.12, D / 2 - 0.05, fw, 0.01);
    const openT = CTX(256, 128, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#e6b13a'; c.lineWidth = 6; c.strokeRect(6, 6, 244, 116); c.fillStyle = '#ffd23a'; c.font = '900 54px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OPEN', 128, 66); });
    const op = new T3.Mesh(new T3.PlaneGeometry(0.62, 0.31), new T3.MeshBasicMaterial({ map: openT })); op.position.set(2.6, 2.6, D / 2 - 0.03); op.rotation.y = Math.PI; fw.add(op); }
  const K = { root, z: KZ, T, W, D, cut, front, origin, top: T };
  const P = (x, z, y = T) => new T3.Vector3(ox + x, y, oz + z);
  // ---- the back wall (hidden when the work camera stands behind it) ----
  const backG = new T3.Group(); root.add(backG); K.back = backG;
  { const signT = CTX(1024, 256, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 256); c.strokeStyle = '#e6b13a'; c.lineWidth = 14; c.strokeRect(10, 10, 1004, 236); c.fillStyle = '#ffd23a'; c.font = '900 96px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('AUREL’S GOLDWORKS', 512, 110); c.fillStyle = '#e6b13a'; c.font = '800 34px Archivo, Arial'; c.fillText('RIVER GOLD · MELTED, HAMMERED + SET IN ZION', 512, 196); });
    const sg = new T3.Mesh(new T3.PlaneGeometry(4.2, 1.05), new T3.MeshBasicMaterial({ map: signT })); sg.position.set(0, 3.55, -D / 2 + 0.05); backG.add(sg); M(new T3.BoxGeometry(4.32, 1.17, 0.05), woodD, 0, 3.55, -D / 2 + 0.02, backG, 0);
    // tool wall: hammers, tongs, files on pegs; ingot shelf
    for (let i = 0; i < 7; i++) { const x = -1.6 + i * 0.52; M(new T3.CylinderGeometry(0.02, 0.02, 0.1, 6), woodD, x, 2.55, -D / 2 + 0.06, backG, 0).rotation.x = Math.PI / 2; const kind = i % 3;
      if (kind === 0) { M(new T3.BoxGeometry(0.04, 0.42, 0.04), wood, x, 2.32, -D / 2 + 0.1, backG, 0.006); M(new T3.BoxGeometry(0.18, 0.08, 0.08), iron, x, 2.12, -D / 2 + 0.1, backG, 0.008); }
      else if (kind === 1) { for (const s of [-1, 1]) M(new T3.BoxGeometry(0.025, 0.5, 0.025), ironL, x + s * 0.04, 2.3, -D / 2 + 0.1, backG, 0.005).rotation.z = s * 0.12; }
      else M(new T3.BoxGeometry(0.03, 0.4, 0.015), steel, x, 2.32, -D / 2 + 0.1, backG, 0.005); }
    M(new T3.BoxGeometry(3.6, 0.06, 0.34), wood, 0, 1.75, -D / 2 + 0.18, backG, 0.01);
    for (let i = 0; i < 9; i++) M(new T3.BoxGeometry(0.22, 0.07, 0.1), i % 3 ? gold : goldD, -1.5 + i * 0.37, 1.82 + (i % 2) * 0.07, -D / 2 + 0.2, backG, 0.006);
    // Z banners
    const banT = CTX(128, 256, c => { c.fillStyle = '#e8b923'; c.fillRect(0, 0, 128, 220); c.beginPath(); c.moveTo(0, 220); c.lineTo(64, 256); c.lineTo(128, 220); c.fill(); c.fillStyle = '#8a6a10'; c.fillRect(0, 0, 128, 10); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(64, 110, 44, 0, 7); c.fill(); zMark(c, 64, 110, 56, '#ffd23a', 0.2); });
    for (const x of [-4.2, 4.2]) { const b = new T3.Mesh(new T3.PlaneGeometry(0.9, 1.8), new T3.MeshBasicMaterial({ map: banT, transparent: true })); b.position.set(x, 3.2, -D / 2 + 0.04); backG.add(b); }
    K.banT = banT; }
  for (const z of [-2.0, 2.6]) for (const sx of [-1, 1]) { const b = new T3.Mesh(new T3.PlaneGeometry(0.8, 1.6), new T3.MeshBasicMaterial({ map: K.banT, transparent: true })); b.position.set(sx * (W / 2 - 0.03), 3.1, z); b.rotation.y = -sx * Math.PI / 2; root.add(b); }
  // ---- the counter ----
  const L = 3.6;
  { const ctrT = CTX(512, 128, c => { c.fillStyle = '#4a2c14'; c.fillRect(0, 0, 512, 128); for (let x = 0; x < 512; x += 128) { c.fillStyle = '#6b4320'; c.fillRect(x + 8, 16, 112, 96); c.fillStyle = '#7a4e26'; c.fillRect(x + 14, 22, 100, 84); c.strokeStyle = '#3a2210'; c.lineWidth = 3; c.strokeRect(x + 14, 22, 100, 84); }
      c.fillStyle = '#e6b13a'; c.fillRect(0, 0, 512, 8); c.fillRect(0, 120, 512, 8); for (const x of [64, 320]) { c.fillStyle = '#201e1d'; c.beginPath(); c.arc(x, 64, 30, 0, 7); c.fill(); c.strokeStyle = '#e6b13a'; c.lineWidth = 5; c.beginPath(); c.arc(x, 64, 30, 0, 7); c.stroke(); zMark(c, x, 64, 34, '#ffd23a', 0.2); } });
    ctrT.wrapS = T3.RepeatWrapping; ctrT.repeat.set(2, 1);
    const body = new T3.Mesh(new T3.BoxGeometry(L * 2, T - 0.06, 0.8), [toon('#5e3a1e'), toon('#5e3a1e'), toon('#5e3a1e'), toon('#5e3a1e'), TM(ctrT), toon('#4a2c14')]); body.position.set(0, (T - 0.06) / 2, KZ); body.castShadow = body.receiveShadow = true; ctx.addOutline && ctx.addOutline(body, 0.02); root.add(body);
    M(new T3.BoxGeometry(L * 2 + 0.12, 0.06, 0.9), toon('#2a2826'), 0, T - 0.03, KZ, root, 0.012); M(new T3.BoxGeometry(L * 2 + 0.12, 0.05, 0.05), brass, 0, 0.12, KZ + 0.43, root, 0.008);
    // a glass case built into the counter front-left: rings on velvet
    M(new T3.BoxGeometry(6 - L, T, 0.5), toon('#5e3a1e'), -(L + (6 - L) / 2), T / 2, KZ, root, 0.015); M(new T3.BoxGeometry(6 - L - 1.1, T, 0.5), toon('#5e3a1e'), L + 1.1 + (6 - L - 1.1) / 2, T / 2, KZ, root, 0.015);
    const gate = M(new T3.BoxGeometry(1.06, T - 0.25, 0.06), wood, L + 0.55, (T - 0.25) / 2 + 0.1, KZ, root, 0.01); M(new T3.BoxGeometry(1.06, 0.06, 0.08), brass, L + 0.55, T - 0.12, KZ, root, 0.006);
    const staffT = CTX(256, 64, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#ffd23a'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STAFF ONLY', 128, 34); }); const sm = new T3.Mesh(new T3.PlaneGeometry(0.62, 0.16), new T3.MeshBasicMaterial({ map: staffT })); sm.position.set(L + 0.55, T * 0.6, KZ + 0.04); gate.parent.add(sm); }
  // velvet serving tray on the counter + the register
  K.pass = { y: T, z: oz + KZ + 0.3 }; K.tray = P(0.9, KZ - 0.12); K.register = P(-2.9, KZ);
  { const tr = new T3.Group(); tr.position.copy(K.tray); scene.add(tr); K.trayG = tr; M(new T3.BoxGeometry(0.42, 0.03, 0.32), brassD, 0, 0.015, 0, tr, 0.006); M(new T3.BoxGeometry(0.38, 0.02, 0.28), velvet, 0, 0.035, 0, tr, 0); }
  { const rx = K.register.x - ox, rz = K.register.z - oz; M(new T3.BoxGeometry(0.42, 0.2, 0.36), brass, rx, T + 0.1, rz + 0.08, root, 0.01); M(new T3.BoxGeometry(0.4, 0.14, 0.2), brassD, rx, T + 0.27, rz + 0.12, root, 0.008).rotation.x = -0.5;
    for (let i = 0; i < 8; i++) M(new T3.CylinderGeometry(0.018, 0.018, 0.02, 8), cream, rx - 0.12 + (i % 4) * 0.08, T + 0.34 - Math.floor(i / 4) * 0.05, rz + 0.06 + Math.floor(i / 4) * 0.06, root, 0.003).rotation.x = -0.5; }
  // a little scale + a ring tree on the counter
  { const sx = 2.6, sz = KZ - 0.05; M(new T3.CylinderGeometry(0.1, 0.12, 0.04, 14), brassD, sx, T + 0.02, sz, root, 0.006, 0.12); M(new T3.CylinderGeometry(0.015, 0.015, 0.36, 6), brass, sx, T + 0.2, sz, root, 0); M(new T3.BoxGeometry(0.42, 0.02, 0.02), brass, sx, T + 0.38, sz, root, 0);
    for (const s of [-1, 1]) { M(new T3.CylinderGeometry(0.08, 0.06, 0.02, 14), brass, sx + s * 0.2, T + 0.26, sz, root, 0.004, 0.08); }
    const tx = -1.6, tz = KZ + 0.05; M(new T3.ConeGeometry(0.07, 0.4, 10), velvet, tx, T + 0.2, tz, root, 0.006); for (let i = 0; i < 4; i++) { const r = M(new T3.TorusGeometry(0.035 + i * 0.006, 0.007, 6, 18), i % 2 ? gold : goldD, tx, T + 0.32 - i * 0.07, tz, root, 0); r.rotation.x = Math.PI / 2; } }
  // ---- the workshop (Aurel's side = -z) ----
  // FORGE: brick hearth, coal bed, crucible, bellows on the left, hood + chimney
  K.forge = P(-2.6, -1.95, 0); K.crucible = P(-2.6, -1.85, 1.0); K.bellows = P(-3.8, -1.95, 0.55); K.mold = P(-2.3, -2.95, 0.86); K.nugDish = P(-2.85, -2.95, 0.86);
  { const f = new T3.Group(); f.position.copy(K.forge); scene.add(f); K.forgeG = f;
    const brT = CTX(128, 128, c => { c.fillStyle = '#5a2412'; c.fillRect(0, 0, 128, 128); for (let r = 0; r < 8; r++) for (let q = -1; q < 4; q++) { c.fillStyle = ['#8a3e22', '#9a4a28', '#7a3420'][(r + q + 6) % 3]; c.fillRect(q * 40 + (r % 2) * 20 + 2, r * 16 + 2, 36, 12); } }); brT.wrapS = brT.wrapT = T3.RepeatWrapping; brT.repeat.set(2, 2);
    const hearth = new T3.Mesh(new T3.BoxGeometry(1.5, 0.92, 1.05), TM(brT)); hearth.position.set(0, 0.46, 0); hearth.castShadow = hearth.receiveShadow = true; ctx.addOutline && ctx.addOutline(hearth, 0.015); f.add(hearth);
    M(new T3.BoxGeometry(1.56, 0.06, 1.1), iron, 0, 0.94, 0, f, 0.008);
    const coalT = CTX(64, 64, c => { c.fillStyle = '#1a1210'; c.fillRect(0, 0, 64, 64); for (let i = 0; i < 40; i++) { c.fillStyle = ['#2a1a14', '#3a2418', '#ff6a1a', '#ffb03a'][i % 4 < 2 ? i % 2 : (i % 7 ? 0 : 2 + (i % 2))]; c.beginPath(); c.arc(rr(0, 64), rr(0, 64), rr(2, 6), 0, 7); c.fill(); } });
    const coalM = new T3.MeshToonMaterial({ map: coalT, gradientMap: grad, emissive: new T3.Color('#ff5a10'), emissiveMap: coalT, emissiveIntensity: 0.4 }); K.coalM = coalM;
    const coal = new T3.Mesh(new T3.CylinderGeometry(0.36, 0.4, 0.08, 18), coalM); coal.position.set(0, 0.99, 0.1); f.add(coal);
    M(new T3.TorusGeometry(0.4, 0.045, 6, 24), toon('#9a4a28'), 0, 1.01, 0.1, f, 0.008, 0.4).rotation.x = Math.PI / 2;
    const emberM = new T3.MeshToonMaterial({ color: '#2a1810', gradientMap: grad, emissive: new T3.Color('#ff7a1a'), emissiveIntensity: 0.8 }); K.emberM = emberM;
    for (let i = 0; i < 22; i++) { const a = i * 2.4, r = 0.08 + (i % 5) * 0.06; const l = new T3.Mesh(new T3.DodecahedronGeometry(0.035 + (i % 3) * 0.012, 0), i % 3 ? emberM : coalM); l.position.set(Math.cos(a) * r, 1.04 + (i % 2) * 0.012, 0.1 + Math.sin(a) * r); l.rotation.set(i, i * 2, 0); f.add(l); }
    // hood + chimney
    const hoodG = new T3.Group(); f.add(hoodG); K.hood = hoodG;   // hidden while working so the camera sees the coals
    const hood = M(new T3.CylinderGeometry(0.3, 0.85, 0.7, 4, 1, true), toon('#3a3836', { side: T3.DoubleSide }), 0, 2.35, 0, hoodG, 0.01); hood.rotation.y = Math.PI / 4; M(new T3.BoxGeometry(0.42, H - 2.7, 0.42), iron, 0, 2.7 + (H - 2.7) / 2, 0, hoodG, 0.01);
    M(new T3.BoxGeometry(0.14, 1.45, 0.14), iron, -0.7, 1.65, -0.48, hoodG, 0.006); M(new T3.BoxGeometry(0.14, 1.45, 0.14), iron, 0.7, 1.65, -0.48, hoodG, 0.006);
    // tongs resting on the side, a water bucket
    M(new T3.CylinderGeometry(0.17, 0.15, 0.3, 14), woodD, 0.95, 0.15, 0.35, f, 0.008, 0.17); M(new T3.CylinderGeometry(0.155, 0.155, 0.01, 14), toon('#4a8aa8'), 0.95, 0.28, 0.35, f, 0); }
  // bellows: two boards hinged at the nozzle end, leather between, the top board is what you pump
  { const b = new T3.Group(); b.position.copy(K.bellows); b.rotation.y = Math.PI / 2; b.scale.setScalar(1.25); scene.add(b); K.bellowsG = b;
    M(new T3.BoxGeometry(0.5, 0.06, 0.62), wood, 0, 0, 0, b, 0.008); const top = new T3.Group(); top.position.set(0, 0.03, 0.3); b.add(top); K.bellowsTop = top;
    M(new T3.BoxGeometry(0.5, 0.05, 0.62), wood, 0, 0.12, -0.31, top, 0.008); M(new T3.CylinderGeometry(0.03, 0.03, 0.22, 8), woodD, 0, 0.26, -0.58, top, 0.006); M(new T3.SphereGeometry(0.05, 10, 8), woodD, 0, 0.38, -0.58, top, 0.006, 0.05);
    const pleatT = CTX(64, 64, c => { for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#5e2c0c' : '#8a4a1e'; c.fillRect(0, i * 8, 64, 8); } }); const leather = M(new T3.BoxGeometry(0.46, 1, 0.56), TM(pleatT), 0, 0.03, -0.01, b, 0); leather.geometry.translate(0, 0.5, 0); K.bellowsLeather = leather;
    M(new T3.ConeGeometry(0.05, 0.3, 8), brassD, 0, 0.03, 0.42, b, 0.006).rotation.x = Math.PI / 2; M(new T3.BoxGeometry(0.1, 0.55, 0.1), woodD, 0, -0.27, -0.2, b, 0.006); M(new T3.BoxGeometry(0.1, 0.55, 0.1), woodD, 0, -0.27, 0.2, b, 0.006); }
  K.bellowsHandle = () => { K.bellowsTop.updateWorldMatrix(true, false); return K.bellowsTop.localToWorld(new T3.Vector3(0, 0.38, -0.58)); };
  // mold table: the mould block + the nugget dish
  { const tx = (K.mold.x + K.nugDish.x) / 2 - ox, tz = -2.95; M(new T3.BoxGeometry(1.0, 0.06, 0.6), wood, tx, 0.83, tz, root, 0.01); for (const [a, b] of [[-0.44, -0.24], [0.44, -0.24], [-0.44, 0.24], [0.44, 0.24]]) M(new T3.BoxGeometry(0.06, 0.8, 0.06), woodD, tx + a, 0.4, tz + b, root, 0.005);
    const mg = new T3.Group(); mg.position.copy(K.mold); scene.add(mg); K.moldG = mg; M(new T3.BoxGeometry(0.36, 0.09, 0.28), ironL, 0, 0.045, 0, mg, 0.008); M(new T3.CylinderGeometry(0.09, 0.09, 0.012, 22), ink, 0, 0.091, 0, mg, 0);
    const fillM = new T3.MeshToonMaterial({ color: '#ffb02a', gradientMap: grad, emissive: new T3.Color('#ff7a10'), emissiveIntensity: 1.2 }); const mf = new T3.Mesh(new T3.CylinderGeometry(0.085, 0.085, 1, 22), fillM); mf.geometry.translate(0, 0.5, 0); mf.position.y = 0.06; mf.scale.y = 0.001; mg.add(mf); K.moldFill = mf; K.moldFillM = fillM;
    const line = new T3.Mesh(new T3.TorusGeometry(0.089, 0.005, 4, 24), new T3.MeshBasicMaterial({ color: 0xffffff })); line.rotation.x = Math.PI / 2; line.position.y = 0.093; mg.add(line);
    const dg = new T3.Group(); dg.position.copy(K.nugDish); scene.add(dg); K.dishG = dg; M(new T3.CylinderGeometry(0.19, 0.14, 0.05, 18), woodD, 0, 0.025, 0, dg, 0.006, 0.19); }
  // ANVIL on a stump, a steel ring mandrel across its face
  K.anvil = P(0.3, -2.1, 0.86); K.mandrel = P(0.36, -2.1, 0.94);
  { const a = new T3.Group(); a.position.set(K.anvil.x, 0, K.anvil.z); scene.add(a); K.anvilG = a;
    M(new T3.CylinderGeometry(0.32, 0.36, 0.56, 14), toon('#7a5230'), 0, 0.28, 0, a, 0.012, 0.36); M(new T3.CylinderGeometry(0.31, 0.31, 0.01, 14), toon('#c8a070'), 0, 0.565, 0, a, 0);
    M(new T3.BoxGeometry(0.34, 0.16, 0.22), iron, 0, 0.64, 0, a, 0.01); M(new T3.BoxGeometry(0.46, 0.1, 0.24), iron, 0, 0.8, 0, a, 0.01); M(new T3.ConeGeometry(0.1, 0.3, 10), iron, -0.36, 0.8, 0, a, 0.008).rotation.z = Math.PI / 2;
    const man = M(new T3.CylinderGeometry(0.032, 0.05, 0.5, 16), toon('#8f9aa6'), 0.06, 0.94, 0.17, a, 0.006); man.rotation.x = -Math.PI / 2; K.mandrelM = man;   // points at the worker, so the ring faces the camera
    M(new T3.BoxGeometry(0.06, 0.06, 0.06), ironL, 0.4, 0.88, 0, a, 0.004);
    // the hammer (pivot at the handle end)
    const h = new T3.Group(); h.position.set(0.58, 1.14, 0); a.add(h); K.hammer = h; M(new T3.CylinderGeometry(0.022, 0.026, 0.46, 8), wood, -0.23, 0, 0, h, 0.006).rotation.z = Math.PI / 2; M(new T3.BoxGeometry(0.09, 0.17, 0.09), iron, -0.47, 0.03, 0, h, 0.01); M(new T3.CylinderGeometry(0.048, 0.048, 0.02, 14), toon('#7d8794'), -0.47, -0.065, 0, h, 0.004); M(new T3.BoxGeometry(0.095, 0.02, 0.095), brassD, -0.47, 0.09, 0, h, 0.003); h.rotation.z = -0.6; }
  // the jeweller's BENCH: leather pad, ring clamp, gem tray (stones on velvet), engraver + polishing cloth, a lamp
  K.bench = P(2.5, -2.2, 0.95); K.pad = P(2.25, -2.08, 0.95); K.gemTray = P(2.95, -2.02, 0.95);
  { const b = new T3.Group(); b.position.set(K.bench.x, 0, K.bench.z); scene.add(b); K.benchG = b;
    M(new T3.BoxGeometry(1.8, 0.07, 0.75), wood, 0, 0.915, 0, b, 0.01); for (const [x, z] of [[-0.84, -0.32], [0.84, -0.32], [-0.84, 0.32], [0.84, 0.32]]) M(new T3.BoxGeometry(0.07, 0.88, 0.07), woodD, x, 0.44, z, b, 0.005);
    M(new T3.BoxGeometry(1.8, 0.5, 0.06), woodD, 0, 1.2, 0.34, b, 0.008); M(new T3.BoxGeometry(1.6, 0.04, 0.18), wood, 0, 1.3, 0.28, b, 0.006);
    for (let i = 0; i < 6; i++) M(new T3.CylinderGeometry(0.035, 0.035, 0.07, 10), toon(['#d7dde3', '#e6b13a', '#c4ccd4'][i % 3]), -0.6 + i * 0.24, 1.36, 0.28, b, 0.004, 0.035);
    M(new T3.BoxGeometry(0.42, 0.012, 0.32), toon('#7a4a24'), K.pad.x - K.bench.x, 0.956, K.pad.z - K.bench.z, b, 0.004);
    // lamp on an arm
    M(new T3.CylinderGeometry(0.012, 0.012, 0.6, 6), iron, -0.7, 1.25, 0.15, b, 0); const sh = M(new T3.ConeGeometry(0.12, 0.14, 14, 1, true), toon('#2f8d84', { side: T3.DoubleSide }), -0.45, 1.5, 0.05, b, 0.006); sh.rotation.z = -0.6; M(new T3.CylinderGeometry(0.01, 0.01, 0.3, 6), iron, -0.58, 1.55, 0.1, b, 0).rotation.z = 1.1;
    const tg = new T3.Group(); tg.position.set(K.gemTray.x - K.bench.x, 0.95, K.gemTray.z - K.bench.z); b.add(tg); M(new T3.BoxGeometry(0.5, 0.02, 0.18), brassD, 0, 0.01, 0, tg, 0.004); M(new T3.BoxGeometry(0.48, 0.012, 0.16), velvet, 0, 0.022, 0, tg, 0);
    M(new T3.CylinderGeometry(0.008, 0.012, 0.16, 6), woodD, 0.2, 0.97, -0.25, b, 0.003).rotation.z = Math.PI / 2; M(new T3.ConeGeometry(0.006, 0.04, 6), steel, 0.3, 0.97, -0.25, b, 0).rotation.z = -Math.PI / 2;
    M(new T3.BoxGeometry(0.16, 0.012, 0.12), toon('#f3e6cc'), -0.75, 0.96, -0.2, b, 0.003); }
  K.gemSlots = [0.15, 0, -0.15].map(dx => P(K.gemTray.x - ox + dx, K.gemTray.z - oz, T - 0.1 + 0.05));
  // lamps over the counter + workshop + customer side
  const lamps = []; for (const [x, z, y] of [[-1.4, KZ + 0.1, 3.4], [1.6, KZ + 0.1, 3.4], [0.3, -2.1, 3.3], [2.5, -2.1, 3.0], [-4.0, 2.4, 3.3], [4.0, 2.4, 3.3]]) { M(new T3.CylinderGeometry(0.008, 0.008, H - y, 4), ink, x, y + (H - y) / 2, z, root, 0); const fr = M(new T3.BoxGeometry(0.22, 0.28, 0.22), toon('#3a3836'), x, y, z, root, 0.008); fr.material = toon('#3a3836', { transparent: true, opacity: 0.35 }); M(new T3.ConeGeometry(0.2, 0.14, 4), iron, x, y + 0.2, z, root, 0.006).rotation.y = Math.PI / 4; const b = M(new T3.SphereGeometry(0.07, 10, 8), toon('#fff6d8', { emissive: '#ffd890', emissiveIntensity: 1 }), x, y, z, root, 0); lamps.push(b); }
  K.lamps = lamps;
  // ---- the customer side: display cases, a waiting bench, a small table, plants, rug ----
  const colliders = [], seats = [];
  colliders.push({ type: 'box', x0: -6, x1: 6, z0: -5, z1: KZ + 0.4 + 0.28 });
  const showCase = (x, z) => { M(new T3.BoxGeometry(1.5, 0.75, 0.8), woodD, x, 0.375, z, root, 0.012); M(new T3.BoxGeometry(1.42, 0.03, 0.72), velvet, x, 0.765, z, root, 0);
    const gl = new T3.Mesh(new T3.BoxGeometry(1.5, 0.36, 0.8), toon('#dff4ff', { transparent: true, opacity: 0.22, depthWrite: false })); gl.position.set(x, 0.96, z); root.add(gl); M(new T3.BoxGeometry(1.52, 0.03, 0.82), brass, x, 1.15, z, root, 0.004);
    for (let i = 0; i < 5; i++) { const r = M(new T3.TorusGeometry(0.045, 0.011, 8, 20), i % 2 ? gold : goldD, x - 0.56 + i * 0.28, 0.84, z - 0.1, root, 0); const gc = [GEMS.ruby.col, GEMS.sapphire.col, GEMS.emerald.col][i % 3]; M(new T3.OctahedronGeometry(0.018), toon(gc, { emissive: gc, emissiveIntensity: 0.3 }), x - 0.56 + i * 0.28, 0.9, z - 0.1, root, 0); r.rotation.x = 0; }
    for (let i = 0; i < 3; i++) { const p = M(new T3.SphereGeometry(0.04, 12, 8), gold, x - 0.4 + i * 0.4, 0.8, z + 0.18, root, 0); p.scale.set(1, 0.35, 1.35); }
    colliders.push({ type: 'box', x0: x - 0.8, x1: x + 0.8, z0: z - 0.45, z1: z + 0.45 }); };
  showCase(-3.8, 1.9); showCase(3.8, 1.9);
  // the waiting bench along the left wall (3 seats facing into the room)
  { const bx = -5.45; M(new T3.BoxGeometry(0.6, 0.08, 2.4), wood, bx, 0.47, 3.6, root, 0.01); M(new T3.BoxGeometry(0.08, 0.6, 2.4), wood, bx - 0.28, 0.8, 3.6, root, 0.01); for (const z of [2.5, 4.7]) M(new T3.BoxGeometry(0.56, 0.46, 0.08), woodD, bx, 0.23, z, root, 0.006);
    M(new T3.BoxGeometry(0.5, 0.05, 2.3), toon('#e8b923'), bx + 0.02, 0.53, 3.6, root, 0.004);
    for (const z of [2.85, 3.6, 4.35]) seats.push({ x: ox + bx + 0.06, z: oz + z, ry: Math.PI / 2, y: 0.7 }); colliders.push({ type: 'box', x0: bx - 0.35, x1: bx + 0.32, z0: 2.4, z1: 4.8 }); }
  // small round table + two chairs on the right
  const chair = (x, z, ry) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.set(1.45, 1.3, 1.45); root.add(g); M(new T3.BoxGeometry(0.44, 0.05, 0.44), wood, 0, 0.47, 0, g, 0.008); for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) M(new T3.BoxGeometry(0.04, 0.46, 0.04), woodD, a, 0.23, b, g, 0.004);
    M(new T3.BoxGeometry(0.44, 0.42, 0.04), wood, 0, 0.72, -0.2, g, 0.008); M(new T3.BoxGeometry(0.36, 0.05, 0.36), toon('#e8b923'), 0, 0.51, 0.01, g, 0.006); seats.push({ x: ox + x, z: oz + z, ry, y: 0.7 }); colliders.push({ type: 'circle', x, z, r: 0.34 }); };
  { const x = 4.3, z = 3.9; M(new T3.CylinderGeometry(0.5, 0.5, 0.05, 22), toon('#efe2c4'), x, 1.0, z, root, 0.01, 0.5); M(new T3.CylinderGeometry(0.06, 0.07, 0.96, 8), ink, x, 0.49, z, root, 0.006); M(new T3.CylinderGeometry(0.26, 0.3, 0.04, 14), ink, x, 0.02, z, root, 0.006);
    M(new T3.BoxGeometry(0.3, 0.02, 0.22), toon('#f3e6cc'), x - 0.1, 1.035, z, root, 0.003); colliders.push({ type: 'circle', x, z, r: 0.55 }); chair(x - 0.95, z, Math.PI / 2); chair(x + 0.95, z, -Math.PI / 2); K.table = P(x, z, 1.03); }
  for (const [x, z] of [[-5.4, 0.55], [5.4, 0.55], [5.4, 4.5]]) { M(new T3.CylinderGeometry(0.34, 0.26, 0.6, 12), toon('#8a6a10'), x, 0.3, z, root, 0.01, 0.34); for (let i = 0; i < 8; i++) { const lf = M(new T3.ConeGeometry(0.13, 1.4, 5), toon(i % 2 ? '#6b7d3a' : '#8a9a4a'), x + Math.cos(i * 0.8) * 0.14, 1.2, z + Math.sin(i * 0.8) * 0.14, root, 0.006); lf.rotation.set(Math.sin(i * 0.8) * 0.5, 0, -Math.cos(i * 0.8) * 0.5); } colliders.push({ type: 'circle', x, z, r: 0.42 }); }
  { const rugT = CTX(256, 128, c => { c.fillStyle = '#7a2a1a'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#e8b923'; c.lineWidth = 6; c.strokeRect(10, 10, 236, 108); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(128, 64, 40, 0, 7); c.fill(); zMark(c, 128, 64, 50, '#ffd23a', 0.2); for (const x of [50, 206]) { c.save(); c.translate(x, 64); c.rotate(Math.PI / 4); c.fillStyle = '#e8b923'; c.fillRect(-12, -12, 24, 24); c.restore(); } });
    const rug = new T3.Mesh(new T3.PlaneGeometry(2.8, 1.4), TM(rugT)); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.006, 3.2); rug.receiveShadow = true; root.add(rug); }
  { const sh = new T3.Group(); root.add(sh); K.shafts = sh; const shT = CTX(64, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,236,170,0.55)'); g.addColorStop(1, 'rgba(255,236,170,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 256); });
    for (const cx of [-3.425, 3.425]) for (const dx of [-0.8, 0.8]) { const m = new T3.Mesh(new T3.PlaneGeometry(1.4, 4.2), new T3.MeshBasicMaterial({ map: shT, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide, opacity: 0.32 })); m.position.set(cx + dx * 0.9, 1.4, D / 2 - 1.3); m.rotation.set(-0.85, dx * 0.15, 0); sh.add(m); }
    const n = 140, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pos[i * 3] = rr(-5.5, 5.5); pos[i * 3 + 1] = rr(0.3, 3.6); pos[i * 3 + 2] = rr(0.2, 4.8); }
    const dg = new T3.BufferGeometry(); dg.setAttribute('position', new T3.BufferAttribute(pos, 3)); const dust = new T3.Points(dg, new T3.PointsMaterial({ color: 0xfff0c0, size: 0.03, transparent: true, opacity: 0.55, depthWrite: false, blending: T3.AdditiveBlending })); sh.add(dust); K.dust = dust; }
  K.spots = [P(1.95, KZ + 1.45, 0), P(0.35, KZ + 1.45, 0), P(-1.3, KZ + 1.45, 0)];
  K.colliders = colliders.map(c => c.type === 'box' ? { ...c, x0: c.x0 + ox, x1: c.x1 + ox, z0: c.z0 + oz, z1: c.z1 + oz } : { ...c, x: c.x + ox, z: c.z + oz }); K.seats = seats; K.door = { x: ox, z: oz + D / 2, w: 2.2 };
  K.keeperSpot = P(-0.5, KZ - 0.75, 0); K.talkSpot = P(-0.5, KZ + 0.95, 0);
  K.walkBox = { x0: ox - W / 2 + 0.35, x1: ox + W / 2 - 0.35, z0: oz + KZ + 0.68, z1: oz + D / 2 - 0.3 };
  return K;
}

// ---------------- the game ----------------
export async function createGoldsmithShift({ container, onState = () => {}, mode = 'walk', onExit = null, audioBase = null }) {
  const ST = createStage(container, { bg: '#1c120b' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildGoldworks({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.T, KZ = K.z;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd9a0, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); l.getWorldPosition(s.position); s.scale.setScalar(1.3); scene.add(s); return s; });
  const warm = new THREE.PointLight(0xffc98a, 0.8, 9, 1.6); warm.position.set(0.4, 2.2, KZ + 0.6); scene.add(warm);
  const forgeL = new THREE.PointLight(0xff7a2a, 1.2, 5, 1.5); forgeL.position.set(K.forge.x, 1.5, K.forge.z + 0.4); scene.add(forgeL);
  const forgeGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a3a, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending })); forgeGlow.position.set(K.forge.x, 1.15, K.forge.z + 0.1); forgeGlow.scale.setScalar(1.4); scene.add(forgeGlow);
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };

  // ---------- cast ----------
  const AU_LOOK = { ...CAST.player.look, fur: '#d9822b', furDark: '#a35510', muzzle: '#f6e0c0', snout: '#f2c89a', paw: '#7a4a24', tailBase: '#a35510', tailMid: '#d9822b', tailTip: '#fbf3d2', browColor: '#fbf3d2', browWeight: 9 };
  const aurel = hideGear(kit.makeFox({ ...CAST.player, look: AU_LOOK, torso: ['#e8d9bd', '#7a4a24', '#4a2c14'], outfit: 'vest', crest: 'Z', gear: 'none', mood: 'warm' }));
  aurel.position.copy(K.keeperSpot); aurel.rotation.y = 0; scene.add(aurel);
  // leather apron with a gold Z + a brass loupe on a headband (Aurel's own, and Ben's uniform)
  const apronTex = canvasTex(128, 160, c => { c.fillStyle = '#7a4a24'; c.fillRect(0, 0, 128, 160); c.strokeStyle = '#5e3a1e'; c.lineWidth = 6; c.strokeRect(3, 3, 122, 154); c.fillStyle = '#5e3a1e'; c.fillRect(20, 96, 88, 40); c.strokeStyle = '#ffd23a'; c.lineWidth = 9; c.lineJoin = 'miter'; c.beginPath(); c.moveTo(42, 34); c.lineTo(86, 34); c.lineTo(42, 74); c.lineTo(86, 74); c.stroke(); });
  function dressSmith(fox, withLoupe = true) { const BP = fox.userData.P, hs = BP.head ? (BP.head.scale.x || 1) : 1, parts = [];
    const ap = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.62), new THREE.MeshToonMaterial({ map: apronTex, gradientMap: grad, side: THREE.DoubleSide })); ap.position.set(0, 0.86, 0.36); ap.rotation.x = -0.08; BP.body.add(ap); parts.push(ap);
    const strap = M(new THREE.TorusGeometry(0.2, 0.018, 6, 20, Math.PI), toon('#5e3a1e'), 0, 1.16, 0.06, BP.body, 0); strap.rotation.set(-0.35, 0, 0); parts.push(strap);
    if (withLoupe && BP.head) { const band = new THREE.Group(); band.position.set(0, BP.head.position.y + 0.16 * hs, 0); band.scale.setScalar(hs); BP.body.add(band); const ring = M(new THREE.TorusGeometry(0.3, 0.025, 6, 28), toon('#5e3a1e'), 0, 0, 0, band, 0); ring.rotation.x = Math.PI / 2; ring.scale.set(1.0, 1.15, 1);
      const lp = M(new THREE.CylinderGeometry(0.05, 0.06, 0.08, 14), toon('#d9a441'), 0.12, 0.02, 0.34, band, 0.006, 0.06); lp.rotation.x = Math.PI / 2; M(new THREE.CircleGeometry(0.042, 14), toon('#bfe8ff', { emissive: '#7dd3fc', emissiveIntensity: 0.4 }), 0, 0.041, 0, lp, 0).rotation.x = -Math.PI / 2; parts.push(band); }
    return parts; }
  dressSmith(aurel);
  // Ben at work (vest + apron) and Ben walking around (the world look: CAST.player, weapons put away)
  const ben = hideGear(kit.makeFox({ ...CAST.player, outfit: 'vest', torso: ['#fbf3d2', '#e8b923', '#5e3a1e'], crest: '8', gear: 'none', mood: 'happy' })); const BP = ben.userData.P; scene.add(ben);
  const benW = hideGear(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' })); const BW = benW.userData.P; scene.add(benW);
  const uniform = dressSmith(ben); const setUniform = on => uniform.forEach(p => p.visible = on); setUniform(true);
  const custFox = CUSTOMERS.map(cu => { const f = hideGear(kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark, paw: cu.fur } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: 'Z', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  // Tobe + Wynn on the waiting bench, arguing about the river
  const regulars = [['tobe', { fur: '#e08a3c', furDark: '#b8460f' }, ['#6b7d3a', '#e6b45a', '#3b4520'], 'vest'], ['wynn', { fur: '#f2c08a', furDark: '#c28a4a' }, ['#3f6b8a', '#d7e6f0', '#24405a'], 'coat']].map(([key, lk, torso, outfit], i) => {
    const f = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, ...lk, paw: lk.fur }, torso, outfit, crest: 'Z', gear: 'none', mood: 'happy' })); const s = K.seats[i]; s.taken = key; f.position.set(s.x, 0, s.z); f.rotation.y = s.ry; scene.add(f); return { key, f, seat: s }; });
  const sitPose = (f, on) => { const P = f.userData.P; if (!on) return; P.legs[0].rotation.x = P.legs[1].rotation.x = -1.45; P.arms[0].rotation.x = -0.6; P.arms[1].rotation.x = -0.7; };
  // gold pans by the bench (they came straight from the river)
  for (const dz of [-0.35, 0.35]) { const s = K.seats[0]; M(new THREE.CylinderGeometry(0.2, 0.14, 0.05, 16), toon('#5a5754'), s.x + 0.5, 0.03, 3.6 + dz, null, 0.006, 0.2); }

  // ---------- props: crucible, nuggets, pour stream, piece, stones, cloth ----------
  const goldM = toon('#f0bd40', { emissive: '#6a4300', emissiveIntensity: 0.4 });
  const cru = new THREE.Group(); scene.add(cru);
  { const body = M(new THREE.CylinderGeometry(0.13, 0.09, 0.2, 18, 1, true), toon('#8a7f76', { side: THREE.DoubleSide }), 0, 0.1, 0, cru, 0.01, 0.13); body.castShadow = true; M(new THREE.CylinderGeometry(0.09, 0.09, 0.01, 16), toon('#5a5250'), 0, 0.005, 0, cru, 0); M(new THREE.TorusGeometry(0.13, 0.012, 6, 24), toon('#d9a441'), 0, 0.2, 0, cru, 0).rotation.x = Math.PI / 2; M(new THREE.ConeGeometry(0.03, 0.05, 6), toon('#8a7f76'), 0.135, 0.19, 0, cru, 0.004).rotation.z = -Math.PI / 2; }
  const poolM = new THREE.MeshToonMaterial({ color: '#ffb02a', gradientMap: grad, emissive: new THREE.Color('#ff7a10'), emissiveIntensity: 1.2 });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), poolM); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.07; pool.visible = false; cru.add(pool);
  const cruNugs = []; for (let i = 0; i < 6; i++) { const n = M(new THREE.DodecahedronGeometry(0.03, 0), goldM, Math.cos(i * 2.1) * 0.045, 0.04 + Math.floor(i / 3) * 0.025, Math.sin(i * 2.1) * 0.045, cru, 0.003, 0.03); n.visible = false; cruNugs.push(n); }
  const CRU = { to: null, tilt: 0 }; const resetCru = () => { cru.position.copy(K.crucible); cru.rotation.set(0, 0, 0); CRU.to = null; CRU.tilt = 0; };
  resetCru();
  const dishNugs = []; for (let i = 0; i < 7; i++) { const n = M(new THREE.DodecahedronGeometry(0.032, 0), goldM, Math.cos(i * 0.9) * (i ? 0.1 : 0), 0.07 + (i ? 0 : 0.025), Math.sin(i * 0.9) * (i ? 0.1 : 0), K.dishG, 0.003, 0.032); n.scale.set(1, 0.75, 1.15); n.rotation.y = i; dishNugs.push(n); }
  const flyNugs = [];
  const pourStream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, 1, 8), new THREE.MeshBasicMaterial({ color: 0xffb02a })); pourStream.visible = false; scene.add(pourStream);
  // the piece in progress
  const engCv = document.createElement('canvas'); engCv.width = engCv.height = 256; const engTex = new THREE.CanvasTexture(engCv); engTex.colorSpace = THREE.SRGBColorSpace;
  const pieceM = new THREE.MeshToonMaterial({ color: '#b8862a', gradientMap: grad, emissive: new THREE.Color('#ff6a10'), emissiveIntensity: 0 });
  const engM = new THREE.MeshToonMaterial({ map: engTex, color: '#b8862a', gradientMap: grad, emissive: new THREE.Color('#ff6a10'), emissiveIntensity: 0 });
  function gemMesh(id) { const g = GEMS[id], m = toon(g.col, { emissive: g.col, emissiveIntensity: 0.35 }); let geo;
    if (g.shape === 'round') geo = new THREE.IcosahedronGeometry(0.012, 1); else if (g.shape === 'diamond') { geo = new THREE.OctahedronGeometry(0.013); geo.scale(1, 1.25, 1); } else { geo = new THREE.BoxGeometry(0.019, 0.013, 0.019); }
    const mesh = new THREE.Mesh(geo, m); addOutline(mesh, 0.002); mesh.castShadow = true; return mesh; }
  function makePiece(pc, spec) { const g = new THREE.Group(), u = { kind: pc.kind, prongs: [], gemAt: null, plate: null };
    if (pc.kind === 'ring') { const band = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.013, 12, 40), pieceM); band.castShadow = true; addOutline(band, 0.002, 0.063); g.add(band); u.band = band;
      if (pc.plate) { const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.012, 32), [pieceM, engM, pieceM]); pl.position.y = 0.066; addOutline(pl, 0.002, 0.027); g.add(pl); u.plate = pl; u.plateTop = 0.072; }
      u.gemAt = new THREE.Vector3(0, pc.plate ? 0.082 : 0.075, 0); }
    else { const body = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 16), pieceM); body.scale.set(1, 0.26, 1.3); body.castShadow = true; addOutline(body, 0.002, 0.05); g.add(body); u.band = body;
      const bail = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 6, 16), pieceM); bail.position.set(0, 0, -0.072); g.add(bail); u.gemAt = new THREE.Vector3(0, 0.018, 0.004); }
    if (pc.gem) { const col = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.009, 0.008, 14), pieceM); col.position.copy(u.gemAt).y -= 0.008; g.add(col);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4, pv = new THREE.Group(); pv.position.set(u.gemAt.x + Math.cos(a) * 0.011, u.gemAt.y - 0.006, u.gemAt.z + Math.sin(a) * 0.011); pv.rotation.y = -a; g.add(pv);
        const pr = new THREE.Mesh(new THREE.BoxGeometry(0.003, 0.016, 0.004), pieceM); pr.position.y = 0.008; pv.add(pr); pv.userData.a = 0; u.prongs.push(pv); } }
    g.userData = u; scene.add(g); return g; }
  const PC = { to: null, rot: null };
  const sparkS = []; for (let i = 0; i < 10; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, opacity: 0 })); s.renderOrder = 25; scene.add(s); sparkS.push({ s, life: 0 }); }
  const spark = (p, col = 0xffffff, n = 1, size = 0.06) => { for (let i = 0; i < n; i++) { const q = sparkS.find(z => z.life <= 0) || sparkS[0]; q.s.position.set(p.x + rr(-0.03, 0.03), p.y + rr(0, 0.04), p.z + rr(-0.03, 0.03)); q.s.material.color.setHex(col); q.life = 1; q.size = size; } };
  // star glints: gold catching the lantern light
  const starTex = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.2, 'rgba(255,244,200,0.95)'); g.addColorStop(1, 'rgba(255,214,110,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(32, 0); c.quadraticCurveTo(35, 29, 64, 32); c.quadraticCurveTo(35, 35, 32, 64); c.quadraticCurveTo(29, 35, 0, 32); c.quadraticCurveTo(29, 29, 32, 0); c.fill(); });
  const glints = []; for (let i = 0; i < 16; i++) { const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); s2.renderOrder = 24; scene.add(s2); glints.push({ s: s2, life: 0, size: 0.08 }); }
  const glint = (p, size = 0.08) => { const q = glints.find(z => z.life <= 0); if (!q) return; q.s.position.copy(p); q.life = 1; q.size = size; q.s.material.rotation = rr(0, 1.5); };
  const GLINT_SPOTS = []; for (const x of [-3.8, 3.8]) for (let i = 0; i < 5; i++) GLINT_SPOTS.push([V3(x - 0.56 + i * 0.28, 0.9, 1.8), 0.09]); GLINT_SPOTS.push([V3(-1.6, T + 0.3, KZ + 0.05), 0.08], [V3(2.6, T + 0.27, KZ - 0.05), 0.07]); for (let i = 0; i < 9; i++) GLINT_SPOTS.push([V3(-1.5 + i * 0.37, 1.88, -4.8), 0.1]);
  let glintT = 0;
  // embers lifting off the coals
  const embers = []; for (let i = 0; i < 22; i++) { const e = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff9a3a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); scene.add(e); embers.push({ s: e, life: 0, v: V3() }); } let emberAcc = 0;
  // a warm work lamp over the bench, a flash light at the anvil, the glow in the mould while pouring
  const benchL = new THREE.PointLight(0xfff0d0, 0.9, 2.6, 1.6); benchL.position.set(K.bench.x - 0.45, 1.5, K.bench.z + 0.05); scene.add(benchL);
  const anvilL = new THREE.PointLight(0xffd080, 0, 2.5, 1.6); anvilL.position.set(K.mandrel.x, K.mandrel.y + 0.3, K.mandrel.z - 0.2); scene.add(anvilL);
  const moldGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffa040, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); moldGlow.position.set(K.mold.x, K.mold.y + 0.12, K.mold.z); moldGlow.scale.setScalar(0.6); scene.add(moldGlow);
  // hammer-beat sprites: the gold mark and the closing ring
  const ringTex = (col, w) => canvasTex(128, 128, c => { c.strokeStyle = '#000'; c.lineWidth = w + 6; c.beginPath(); c.arc(64, 64, 52, 0, 7); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.arc(64, 64, 52, 0, 7); c.stroke(); });
  const beatMark = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex('#ffd23a', 12), transparent: true, depthTest: false, depthWrite: false })); beatMark.renderOrder = 26; beatMark.visible = false; scene.add(beatMark);
  const beatRing = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex('#ffffff', 8), transparent: true, depthTest: false, depthWrite: false })); beatRing.renderOrder = 27; beatRing.visible = false; scene.add(beatRing);
  // tray stones (rebuilt per piece) and the polishing cloth
  let trayGems = [];
  const cloth = M(new THREE.BoxGeometry(0.09, 0.012, 0.07), toon('#f3e6cc'), 0, 0, 0, null, 0.003); cloth.visible = false;
  const clampBlock = M(new THREE.BoxGeometry(0.07, 0.03, 0.05), toon('#5e3a1e'), K.pad.x, K.pad.y + 0.015, K.pad.z, null, 0.004); clampBlock.visible = false;

  // ---------- sounds + a frontier tune ----------
  const SND = { node: null, kind: '' };
  function holdSound(kind) { if (!audio.ctx || audio.muted || BANK.buf.forge_loop) return; if (SND.kind === kind) return; holdStop(); const ac = audio.ctx, src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); src.buffer = audio.noise; src.loop = true;
    f.type = kind === 'engrave' ? 'bandpass' : 'lowpass'; f.frequency.value = kind === 'engrave' ? 3200 : kind === 'pour' ? 900 : kind === 'polish' ? 1800 : 500; f.Q.value = kind === 'engrave' ? 3 : 0.8; g.gain.value = 0.0001; g.gain.linearRampToValueAtTime(kind === 'engrave' ? 0.08 : kind === 'pour' ? 0.12 : 0.07, ac.currentTime + 0.08);
    src.connect(f); f.connect(g); g.connect(audio.master); src.start(); SND.node = { src, g, f }; SND.kind = kind; }
  function holdStop() { const h = SND.node; SND.node = null; SND.kind = ''; if (!h) return; try { const ac = audio.ctx; h.g.gain.cancelScheduledValues(ac.currentTime); h.g.gain.setValueAtTime(h.g.gain.value, ac.currentTime); h.g.gain.linearRampToValueAtTime(0.0001, ac.currentTime + 0.09); h.src.stop(ac.currentTime + 0.14); } catch (e) {} }
  const MUSIC = (() => { const scale = [60, 62, 64, 67, 69, 72, 74, 76, 79, 81], phrase = [[0, 2], [1, 3], [2, 4], [3, 3], [4, 5], [5, 4], [6, 3], [7, 2], [8, 1], [9, 2], [10, 3], [11, 4], [12, 2], [14, 0], [16, 4], [17, 5], [18, 6], [19, 5], [20, 7], [21, 6], [22, 5], [23, 4], [24, 3], [25, 4], [26, 5], [27, 3], [28, 2], [30, 1], [31, 0]], notes = [];
    phrase.forEach(([b, i]) => notes.push({ b, m: scale[i], d: 0.5, v: 'pluck' })); for (let b = 0; b < 32; b += 2) notes.push({ b, m: [36, 43, 41, 43][(b / 2) % 4], d: 0.5, v: 'bass' }); for (let b = 1; b < 32; b += 2) notes.push({ b, m: [55, 59, 57, 59][Math.floor(b / 2) % 4], d: 0.25, v: 'chuck' });
    return { notes, beats: 32, spb: 0.3 }; })();
  const midiHz = m => 440 * Math.pow(2, (m - 69) / 12); const MZ = { bus: null, at: 0, on: true };
  function musicStep() { const ac = audio.ctx; if (!ac || audio.muted || !MZ.on || document.hidden) return; if (!MZ.bus) { MZ.bus = ac.createGain(); MZ.bus.gain.value = 0.28; MZ.bus.connect(audio.master); MZ.at = ac.currentTime + 0.2; }
    while (MZ.at < ac.currentTime + 1.3) { const base = MZ.at; for (const nt of MUSIC.notes) { const at = base + nt.b * MUSIC.spb; if (at < ac.currentTime) continue; const o = ac.createOscillator(), g = ac.createGain(), pk = nt.v === 'bass' ? 0.05 : nt.v === 'chuck' ? 0.012 : 0.03; o.type = nt.v === 'pluck' ? 'triangle' : nt.v === 'chuck' ? 'square' : 'sine'; o.frequency.setValueAtTime(midiHz(nt.m), at); g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(pk, at + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, at + nt.d); o.connect(g); g.connect(MZ.bus); o.start(at); o.stop(at + nt.d + 0.03); } MZ.at = base + MUSIC.beats * MUSIC.spb; } }
  function audioOn() { if (!audio.ctx) { audio.init && audio.init(); try { audio.wind.gain.value = 0; audio.wind.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.01); } catch (e) {} } else audio.ctx.resume && audio.ctx.resume(); decodeBank(); }
  // ---------- THE SOUND BANK: rendered samples in audio/*.mp3 (see audio/render.py), with the synth tones as a fallback ----------
  const LOOPS = { forge_loop: 4, pour_loop: 2, engrave_loop: 2, polish_loop: 2, music_shop: 41.739125, music_shift: 33.103437 };
  const SFX_NAMES = ['clink', 'pick', 'bellows', 'bubble', 'steam', 'anvil', 'anvil_dull', 'thud', 'chime', 'prong', 'wrong', 'smear', 'slide', 'coin', 'cash', 'bell', 'good', 'great', 'meh', 'bad', 'fanfare', 'click', 'hop', 'wave', ...Object.keys(LOOPS)];
  const BANK = { raw: {}, buf: {}, lead: {}, sfx: null, mus: null, loops: {}, music: null, musicName: '', decoding: null, lastPlay: {} };
  const AB = audioBase || (() => { try { return new URL('audio/', document.baseURI).href; } catch (e) { return 'audio/'; } })();
  SFX_NAMES.forEach(n => { BANK.raw[n] = fetch(AB + n + '.mp3').then(r => r.ok ? r.arrayBuffer() : null).catch(() => null); });
  function decodeBank() { const ac = audio.ctx; if (!ac || BANK.decoding) return; BANK.sfx = ac.createGain(); BANK.sfx.gain.value = 0.85; BANK.sfx.connect(audio.master); BANK.mus = ac.createGain(); BANK.mus.gain.value = 0.3; BANK.mus.connect(audio.master);
    BANK.decoding = Promise.all(SFX_NAMES.map(async n => { try { const ab = await BANK.raw[n]; if (!ab) return; const b = await ac.decodeAudioData(ab.slice(0)); BANK.buf[n] = b; const d = b.getChannelData(0); let i = 0; while (i < Math.min(4000, d.length) && Math.abs(d[i]) < 1e-5) i++; BANK.lead[n] = i < 4000 ? i / b.sampleRate : 0; } catch (e) {} })); }
  // play(name, { vol, rate, delay }) → true when the sample played (false = not loaded yet: callers fall back to a synth tone)
  function play(name, o = {}) { const ac = audio.ctx, b = BANK.buf[name]; if (!ac || !b || audio.muted) return !!b; const now = ac.currentTime; if (o.gap && BANK.lastPlay[name] && now - BANK.lastPlay[name] < o.gap) return true; BANK.lastPlay[name] = now;
    const src = ac.createBufferSource(), g = ac.createGain(); src.buffer = b; src.playbackRate.value = o.rate || 1; g.gain.value = o.vol == null ? 1 : o.vol; src.connect(g); g.connect(BANK.sfx); src.start(now + (o.delay || 0), BANK.lead[name] || 0); return true; }
  function loopSet(name, vol, rate = 1, tc = 0.08) { const ac = audio.ctx, b = BANK.buf[name]; if (!ac || !b) return; let L = BANK.loops[name];
    if (!L) { if (vol < 0.01) return; const src = ac.createBufferSource(), g = ac.createGain(); src.buffer = b; src.loop = true; src.loopStart = BANK.lead[name] || 0; src.loopEnd = src.loopStart + LOOPS[name]; g.gain.value = 0; src.connect(g); g.connect(BANK.sfx); src.start(0, src.loopStart + Math.random() * LOOPS[name] * 0.5); L = BANK.loops[name] = { src, g }; }
    const now = ac.currentTime; L.g.gain.setTargetAtTime(Math.max(0, vol), now, tc); L.src.playbackRate.setTargetAtTime(rate, now, 0.1); }
  function setMusic(kind) { const ac = audio.ctx, name = kind ? 'music_' + kind : ''; if (!ac || BANK.musicName === name) return; const b = BANK.buf[name]; if (name && !b) return; BANK.musicName = name; const now = ac.currentTime;
    if (BANK.music) { const old = BANK.music; old.g.gain.setTargetAtTime(0, now, 0.4); setTimeout(() => { try { old.src.stop(); } catch (e) {} }, 2500); BANK.music = null; }
    if (!b) return; const src = ac.createBufferSource(), g = ac.createGain(); src.buffer = b; src.loop = true; src.loopStart = BANK.lead[name] || 0; src.loopEnd = src.loopStart + LOOPS[name]; g.gain.value = 0; g.gain.setTargetAtTime(1, now, 0.6); src.connect(g); g.connect(BANK.mus); src.start(0, src.loopStart); BANK.music = { src, g }; }
  const AUD = { t: 0, bellowsDir: 0, bellowsT: 0, engSpd: 0 };
  function audioTick(dt) { AUD.t -= dt; AUD.engSpd *= Math.pow(0.02, dt); if (C && C.pol) C.pol.spd *= Math.pow(0.05, dt); if (AUD.t > 0 || !audio.ctx) return; AUD.t = 0.08;
    const hasMusic = !!BANK.buf.music_shop; MZ.on = !hasMusic; if (hasMusic) setMusic(audio.muted ? '' : S.phase === 'shift' || S.phase === 'glide' ? 'shift' : 'shop');
    const s = step(), heatK = C && s === 'melt' ? clamp((C.melt.heat - 20) / 70, 0, 1.3) : 0.15, walk = S.phase === 'walk';
    loopSet('forge_loop', walk ? clamp(1.2 - benW.position.distanceTo(K.forge) / 6, 0.05, 0.35) : 0.18 + heatK * 0.75, 0.9 + heatK * 0.25);
    loopSet('pour_loop', C && s === 'pour' ? clamp((C.pour.flow || 0) * 2.4, 0, 1) : 0, 0.85 + (C && s === 'pour' ? C.pour.tilt * 0.3 : 0));
    loopSet('engrave_loop', C && s === 'engrave' && (S.stroke || DM.act) ? clamp(AUD.engSpd / 500, 0, 0.9) : 0, 0.85 + clamp(AUD.engSpd / 2000, 0, 0.4), 0.04);
    loopSet('polish_loop', C && s === 'polish' && (S.stroke || DM.act) ? clamp(C.pol.spd / 700, 0, 1) : 0, 0.8 + clamp(C ? C.pol.spd / 2200 : 0, 0, 0.5), 0.05); }
  const clang = (k = 1) => { if (play(k >= 1 ? 'anvil' : 'anvil_dull', { rate: rr(0.97, 1.03) * (k >= 1 ? 1 : 0.95) })) return; tone(1760 * k, 0.18, 0.05, 'triangle'); tone(2640 * k, 0.12, 0.03, 'sine'); audio.burst && audio.burst(0.06, 4000, 0.1); };

  // ---------- cameras ----------
  const CAM = { look: V3(0, 1.2, KZ), from: null, t: 1, dur: 1 };
  const { SAFE, shotFor } = cameraFit(ST);
  const port = () => CW() < CHh();
  const wideShot = () => { const z = KZ + 1.6, x = -0.7, box = [V3(x - 0.55, 0.05, z), V3(x + 0.55, 0.05, z), V3(x - 0.55, 2.25, z), V3(x + 0.55, 2.25, z), V3(x, 2.5, z)];
    return port() ? shotFor('wideP', () => box, 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL', () => box, 0.12, Math.PI - 0.3, 0.05); };
  const FOCUS = { all: 1, forge: 1, anvil: 1, bench: 1, counter: 1 };
  const piecePos = () => piece ? piece.position.clone() : K.pad.clone();
  function shotPoints(id) { const P = (p, dx = 0, dz = 0, dy = 0) => V3(p.x + dx, p.y + dy, p.z + dz), out = [];
    if (id === 'forge') { const cr = cru.position; out.push(P(K.crucible, -0.3, -0.25, 0), P(K.crucible, 0.2, 0.25, 0.25), P(K.bellows, 0, 0, 0.55), P(K.bellows, -0.15, 0.1, -0.1), P(K.mold, 0.15, 0.15), P(K.mold, -0.1, -0.15, 0.25), P(K.nugDish, 0.18, 0.1), P(K.nugDish, 0.1, -0.15, 0.15), P(cr, 0, 0, 0.3)); }
    else if (id === 'anvil') out.push(P(K.mandrel, -0.14, 0, -0.09), P(K.mandrel, 0.14, 0, -0.09), P(K.mandrel, 0, 0, 0.24), P(K.mandrel, 0, 0.05, -0.12));
    else if (id === 'bench') out.push(P(K.pad, -0.09, -0.08), P(K.pad, -0.09, 0.08, 0.1), P(K.gemTray, 0.22, 0.08), P(K.gemTray, 0.22, -0.08), P(K.pad, 0, 0, 0.13));
    else if (id === 'close') { const c = piecePos(), st = step(), top = piece && piece.userData.kind === 'ring' && st !== 'polish';
      if (piece && piece.userData.kind === 'ring' && st === 'polish') { const r = 0.08; out.push(V3(c.x - r, c.y - r, c.z), V3(c.x + r, c.y + r, c.z), V3(c.x - r, c.y + r, c.z), V3(c.x + r, c.y - r, c.z)); }
      else { const r = st === 'engrave' ? 0.045 : top ? 0.05 : 0.085, cy = top && piece ? c.y + (piece.userData.plateTop || 0.07) : c.y; out.push(V3(c.x - r, cy, c.z - r), V3(c.x + r, cy, c.z + r), V3(c.x - r, cy, c.z + r), V3(c.x + r, cy, c.z - r), V3(c.x, cy + r * 0.8, c.z)); } }
    else if (id === 'counter') { out.push(P(K.tray, -0.25, -0.2), P(K.tray, 0.25, 0.1, 0.2)); const tgt = serveSpot(); (port() && tgt >= 0 ? [K.spots[tgt]] : K.spots).forEach(s => out.push(V3(s.x - 0.5, 2.45, s.z), V3(s.x + 0.5, 1.2, s.z))); }
    else { out.push(P(K.crucible, -0.6, -0.3, -0.1), P(K.bench, 1.0, 0, 0.1), V3(-3.1, T, KZ + 0.4), V3(3.1, T, KZ + 0.4), P(K.mandrel, 0, 0, 0.4)); K.spots.forEach(s => out.push(V3(s.x, 1.6, s.z))); }
    return out; }
  const ELV = { all: [0.62, 0.62], forge: [0.82, 0.72], anvil: [0.22, 0.2], bench: [1.05, 0.95], close: [1.36, 1.3], counter: [0.42, 0.6] };
  const serveSpot = () => { const o = C && orders.find(q => q.id === C.oid && q.st === 'wait'); return o ? o.spot : -1; };
  function workShot(id = S.focus || 'all') { const e = id === 'close' && piece && piece.userData.kind === 'ring' && step() === 'polish' ? [0.42, 0.38] : ELV[id] || ELV.all; return shotFor('w:' + id + (id === 'close' ? ':' + (step() || '') + ':' + (C ? C.oid : 0) + ':' + (piece ? piece.position.toArray().map(v => v.toFixed(2)).join(',') : '') : id === 'counter' ? ':' + serveSpot() : ''), () => shotPoints(id), port() ? e[0] : e[1], 0, id === 'all' ? 0.03 : 0.06); }
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  camera.position.set(0, 2.6, 7.5); camera.lookAt(CAM.look);

  // ---------- game state ----------
  const S = { mode, phase: mode === 'walk' ? 'walk' : 'intro', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, payOut: null, next: 3, done: null, combo: 0, hold: null, stroke: null, react: null, fade: 0, xp: 0, userFocusT: 0, lastInput: 0 };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const orders = []; let C = null, idSeq = 1, piece = null, drag = null, slide = null;
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 4) => { S.say = s; S.sayT = t; };
  const avail = () => PIECES.filter(d => d.day <= S.day), PZ = id => PIECES.find(d => d.id === id);
  const gemsAvail = () => Object.keys(GEMS).filter(k => GEMS[k].day <= S.day);
  const step = () => C && C.steps[C.i];
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const custName = ci => CUSTOMERS[ci].name;
  function makeSpec(id) { const pc = PZ(id); return { nug: pick([pc.nug[0], pc.nug[1]]), gem: pc.gem ? pick(gemsAvail()) : null, hits: pc.steps.includes('hammer') ? Math.min(6, 3 + S.day) : 0 }; }
  const stepsFor = id => [...PZ(id).steps, 'serve'];
  const priceOf = o => PZ(o.piece).price + (o.spec.gem === 'emerald' ? 2 : 0);
  const sfx = k => { if (k === 'good' && play('good', { vol: 0.7 })) return; if (k === 'bad' && play('bad', { vol: 0.7 })) return; if (k === 'stage' && play('good', { vol: 0.5, rate: 0.89 })) return; if ((k === 'click' || k === 'clack') && play('click', { vol: 0.6 })) return; if (k === 'serve' && BANK.buf.great) return; if (k === 'good') [0, 4, 7].forEach((s, i) => setTimeout(() => tone(midiHz(72 + s), 0.16, 0.05, 'triangle'), i * 62)); else if (k === 'bad') tone(180, 0.22, 0.06, 'square'); else if (k === 'stage') [0, 7].forEach((s, i) => setTimeout(() => tone(midiHz(69 + s), 0.2, 0.045, 'triangle'), i * 80)); else if (k === 'click') tone(1500, 0.05, 0.035, 'square'); else if (k === 'serve') [0, 4, 7, 12].forEach((s, i) => setTimeout(() => tone(midiHz(72 + s), 0.24, 0.05, 'triangle'), i * 95)); else if (k === 'clack') { audio.burst && audio.burst(0.08, 2400, 0.1); tone(420, 0.06, 0.04, 'square'); } };

  // ---------- the signet plate: a live engraving canvas ----------
  // plate space (su, sv): su = screen right, sv = screen up (the work camera stands at -z looking +z), radius 1
  const ZP = [[-0.58, 0.58], [0.58, 0.58], [-0.58, -0.58], [0.58, -0.58]];
  const toCv = (su, sv) => [128 * (1 + sv), 128 * (1 + su)];
  function drawEng() { const c = engCv.getContext('2d'); c.fillStyle = '#ffffff'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#e8dcc0'; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 116, 0, 7); c.stroke();
    const E = C && C.eng; if (E && !E.done) { c.setLineDash([10, 12]); c.strokeStyle = '#c9b48a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); ZP.forEach(([u, v], i) => { const [x, y] = toCv(u, v); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); c.setLineDash([]); }
    if (E) { c.lineCap = 'round'; c.lineJoin = 'round'; for (const s of E.strokes) { if (s.pts.length < 2) continue; c.strokeStyle = s.off ? '#b89a6a' : '#4a2c14'; c.lineWidth = s.off ? 5 : 15; c.beginPath(); s.pts.forEach(([u, v], i) => { const [x, y] = toCv(u, v); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); } }
    engTex.needsUpdate = true; }

  // ---------- orders, the piece in progress ----------
  function newOrder() { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i && o.st !== 'gone')); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)); if (!pool.length) return; const ci = pick(pool);
    const list = avail(), id = S.forcePiece ? S.forcePiece : S.demo && S.demoOrders && S.demoOrders.length ? S.demoOrders.shift() : S.day <= 1 && S.served + S.lost === 0 && !orders.length ? 'ring' : pick(list.slice(-Math.min(list.length, 3 + S.day))).id, spec = makeSpec(id);
    const patMax = (125 - Math.min(35, (S.day - 1) * 7)) * (upg('musicbox') ? 1.2 : 1), f = custFox[ci]; f.visible = true; f.position.set(K.door.x + rr(-0.5, 0.5), 0, K.door.z - 0.2); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.userData.lineMood = null;
    play('bell', { vol: 0.55 }); const o = { id: idSeq++, ci, spot: free, piece: id, spec, pat: patMax, patMax, st: 'walk', f, line: pick(LINES[id]), t: 0 }; o.total = priceOf(o); orders.push(o); }
  const waiting = () => orders.filter(o => o.st === 'wait');
  function nextOrderToMake() { return waiting().filter(o => !o.made).sort((a, b) => a.pat - b.pat)[0] || null; }
  function clearPiece() { if (piece) { scene.remove(piece); piece = null; } trayGems.forEach(g => g.parent && g.parent.remove(g)); trayGems = []; clampBlock.visible = false; cloth.visible = false; beatMark.visible = beatRing.visible = false; pourStream.visible = false; }
  function startPiece(o) { clearPiece(); C = { oid: o.id, ci: o.ci, piece: o.piece, spec: { ...o.spec }, steps: stepsFor(o.piece), i: 0, scores: {}, notes: [],
      melt: { nug: 0, heat: 25, prog: 0, over: 0, p: 0, warned: false }, pour: { fill: 0, tilt: 0, on: false, y0: 0 }, ham: { n: 0, sc: [], t: -0.6, last: null }, gem: { placed: false, prongs: 0, wrong: 0, fly: null },
      eng: { prog: 0, dev: 0, n: 0, off: 0, strokes: [], done: false }, pol: { shine: 0, warm: 0, smear: 0, spd: 0 } };
    o.making = true; resetCru(); dishNugs.forEach(n => n.visible = true); cruNugs.forEach(n => n.visible = false); pool.visible = false; K.moldFill.scale.y = 0.001; K.moldFillM.emissiveIntensity = 1.2; pieceM.color.set('#b8862a'); engM.color.set('#b8862a'); drawEng(); beginStep(); }
  const PCat = (p, dy = 0) => V3(p.x, p.y + dy, p.z);
  function placeFor(s) { if (!piece) return; const ring = piece.userData.kind === 'ring';
    if (s === 'hammer') { PC.to = PCat(K.mandrel); PC.rot = V3(0, 0, 0); clampBlock.visible = false; }
    else if (s === 'gem' || s === 'engrave' || s === 'polish') { PC.to = ring ? PCat(K.pad, 0.093) : PCat(K.pad, 0.016); PC.rot = ring ? V3(0, 0, 0) : V3(0, Math.PI, 0); clampBlock.visible = ring; }
    else if (s === 'serve') { PC.to = ring ? PCat(K.tray, 0.103) : PCat(K.tray, 0.055); PC.rot = ring ? V3(0, 0, 0) : V3(0, Math.PI, 0); clampBlock.visible = false; } }
  function beginStep() { const s = step(); if (!s) return; S.touched = false; S.hold = null; S.stroke = null; holdStop(); S.focus = STEP_INFO[s].st; S.userFocusT = 0;
    if (s === 'pour') { CRU.to = V3(K.mold.x - 0.17, K.mold.y + 0.32, K.mold.z); }
    else if (s !== 'melt') { CRU.to = PCat(K.crucible); }
    if (s === 'gem') buildTray();
    if (s === 'engrave') { C.eng.strokes = []; drawEng(); }
    if (s === 'polish') { cloth.visible = false; }
    PC.wait = C.i > 0 && C.steps[C.i - 1] === 'pour' ? 0.9 : 0; placeFor(s); }
  function commit(name, score) { if (!C) return; const sc = Math.round(clamp(score, 0, 100)); if (name) { C.scores[name] = sc; sfx(sc >= 75 ? 'good' : sc >= 45 ? 'stage' : 'bad'); if (!DM.on) buzz(sc >= 75 ? [18, 40, 18] : sc >= 45 ? 25 : 70); flash(name.toUpperCase() + ' · ' + sc, sc >= 75 ? '#22c55e' : sc >= 45 ? '#ffd23a' : '#ec3013', 1.1); } else sfx('clack');
    S.hold = null; S.stroke = null; holdStop(); C.i++; beginStep(); }
  const note = t => C && C.notes.push(t);

  // ---- MELT: nuggets in, then the bellows ----
  function tapNug() { if (step() !== 'melt' || !C) return; const Mt = C.melt; if (Mt.nug >= 6) return; Mt.nug++; const n = dishNugs.find(q => q.visible); if (n) { n.visible = false; const from = new THREE.Vector3(); n.getWorldPosition(from); const fm = M(new THREE.DodecahedronGeometry(0.03, 0), goldM, from.x, from.y, from.z, null, 0.003, 0.022); flyNugs.push({ m: fm, from, t: 0, i: Mt.nug - 1 }); }
    if (!play('pick', { vol: 0.8, rate: rr(0.9, 1.15) })) tone(1200 + Mt.nug * 90, 0.06, 0.04, 'triangle'); buzz(8);
    if (Mt.nug > C.spec.nug) { flash('TOO MUCH GOLD · THE TICKET SAYS ' + C.spec.nug, '#ec3013', 1.2); if (!play('wrong', { vol: 0.7, delay: 0.3 })) tone(220, 0.15, 0.04, 'sawtooth'); } else if (Mt.nug === C.spec.nug) flash('THAT IS ' + C.spec.nug + ' · NOW PUMP THE BELLOWS', '#22c55e', 1.3); }
  function bellowsTo(p) { if (step() !== 'melt' || !C) return; const Mt = C.melt; p = clamp(p, 0, 1); const dp = p - Mt.p; Mt.p = p;
    if (Mt.nug < C.spec.nug) { if (Math.abs(dp) > 0.05 && !Mt.warned) { Mt.warned = true; flash('TAP ' + (C.spec.nug - Mt.nug) + ' MORE NUGGET' + (C.spec.nug - Mt.nug > 1 ? 'S' : '') + ' IN FIRST', '#ffd23a', 1.2); } return; }
    if (dp < -0.02 && AUD.bellowsDir >= 0) { AUD.bellowsDir = -1; play('bellows', { vol: 0.9, rate: rr(0.92, 1.08), gap: 0.22 }); } else if (dp > 0.02) AUD.bellowsDir = 1;
    if (dp < 0) { Mt.heat += -dp * 26 * (upg('bellows') ? 1.4 : 1); if (-dp > 0.02) { const nz = V3(K.bellows.x + 0.55, K.bellows.y + 0.05, K.bellows.z); puff(nz.x, nz.y, nz.z, 0xffd9a0, 1); } if (-dp > 0.05 && !BANK.buf.bellows) audio.burst && audio.burst(0.12, 700, 0.06 * Math.min(1, -dp * 4)); } }
  function meltScore() { const Mt = C.melt, err = Math.abs(Mt.nug - C.spec.nug); if (err) note(Mt.nug > C.spec.nug ? 'Too much gold went in, the piece came out heavy.' : 'Short on gold, the piece came out thin.'); if (Mt.over > 0.6) note('The gold got scorched. Boiling gold goes grey.'); return 100 - err * 25 - Math.max(0, Mt.over - 0.25) * 32; }
  // ---- POUR: drag down to tip ----
  const cruReady = () => CRU.to && cru.position.distanceTo(CRU.to) < 0.03;
  function pourDone() { if (step() !== 'pour') return; const Pr = C.pour; Pr.on = false; Pr.tilt = 0; holdStop(); const f = Pr.fill;
    const sc = f >= 0.9 && f <= 1.04 ? 100 : f < 0.9 ? clamp(100 - (0.9 - f) * 350, 0, 100) : clamp(100 - (f - 1.04) * 450, 0, 100); if (f < 0.88) note('The mould was short. The piece has a thin spot.'); else if (f > 1.06) note('Poured over the line. Gold ran down the side of the mould.');
    piece = makePiece(PZ(C.piece), C.spec); piece.position.copy(K.mold).y += 0.07; const ring = piece.userData.kind === 'ring'; piece.rotation.set(ring ? Math.PI / 2 : 0, 0, 0); piece.scale.set(1, ring ? 0.82 : 1, 1); pieceM.emissiveIntensity = 1.3; engM.emissiveIntensity = 1.3; PC.to = null; PC.rot = null; play('steam', { vol: 0.75, delay: 0.15 });
    commit('Pour', sc); }
  // ---- HAMMER: tap on the beat ----
  const beatPer = () => upg('metronome') ? 1.35 : 1.1, beatWin = () => upg('metronome') ? 0.18 : 0.12;
  const beatScale = () => 2.4 - 2.0 * (C.ham.t / beatPer());
  const atMandrel = () => piece && PC.to && piece.position.distanceTo(PC.to) < 0.02 && !PC.wait;
  const HS = { t: 1 };
  function hammerHit() { if (step() !== 'hammer' || !C || !atMandrel()) return; const H = C.ham; if (H.t < 0) return; const s = beatScale(), err = Math.abs(s - 1), w = beatWin(), sc = err <= w ? 100 : clamp(100 - (err - w) * 170, 0, 100);
    H.sc.push(sc); H.last = sc; H.n++; HS.t = 0; clang(sc >= 90 ? 1 : 0.85); buzz(sc >= 90 ? 20 : 40); const top = piece.position.clone().add(V3(0, 0.065, 0)); spark(top, sc >= 90 ? 0xffd23a : 0xffffff, 3, 0.05); anvilL.intensity = sc >= 90 ? 1.4 : 0.8; if (sc >= 90) { glint(top.clone().add(V3(0.03, 0.02, 0)), 0.12); glint(top.clone().add(V3(-0.04, 0.01, 0)), 0.09); } puff(top.x, top.y, top.z, 0xffd9a0, 1);
    H.streak = sc >= 90 ? (H.streak || 0) + 1 : 0; flash(sc >= 90 ? (H.streak > 1 ? 'PERFECT ×' + H.streak : 'PERFECT') : sc >= 60 ? 'GOOD' : s > 1 ? 'TOO EARLY' : 'TOO LATE', sc >= 90 ? '#22c55e' : sc >= 60 ? '#ffd23a' : '#ec3013', 0.5); H.t = -0.32;
    if (H.n >= C.spec.hits) { const avg = H.sc.reduce((a, b) => a + b, 0) / H.sc.length; if (avg < 70) note('The beat wandered. The band came out a little lumpy.'); setTimeout(() => step() === 'hammer' && commit('Hammer', avg), 380); } }
  // ---- STONE: the right stone, then four prongs ----
  function buildTray() { trayGems.forEach(g => g.parent && g.parent.remove(g)); trayGems = gemsAvail().map((id, i) => { const m = gemMesh(id); m.scale.setScalar(3.8); m.position.copy(K.gemSlots[i]); m.userData.id = id; m.userData.home = K.gemSlots[i].clone(); scene.add(m); return m; }); }
  function pickGem(id) { if (step() !== 'gem' || !C || C.gem.placed || C.gem.fly) return; const G = C.gem, m = trayGems.find(g => g.userData.id === id); if (!m) return;
    if (id !== C.spec.gem) { G.wrong++; m.userData.bounce = 1; flash('WRONG STONE · THE TICKET SAYS ' + GEMS[C.spec.gem].name, '#ec3013', 1.3); if (!play('wrong')) tone(220, 0.18, 0.05, 'sawtooth'); buzz(70); return; }
    G.fly = { m, from: m.position.clone(), t: 0 }; if (!play('pick', { rate: 1.6, vol: 0.7 })) tone(2200, 0.06, 0.04, 'triangle'); }
  function prongTap() { if (step() !== 'gem' || !C || !C.gem.placed) return; const G = C.gem, pr = piece.userData.prongs[G.prongs]; if (!pr) return; pr.userData.a = 1; G.prongs++; if (!play('prong', { rate: 1 + G.prongs * 0.07 })) tone(1600 + G.prongs * 140, 0.05, 0.04, 'square'); buzz(10); spark(piece.localToWorld(piece.userData.gemAt.clone()), 0xffffff, 1, 0.05);
    if (G.prongs >= 4) { if (G.wrong) note(G.wrong > 1 ? 'Reached for the wrong stone ' + G.wrong + ' times.' : 'Reached for the wrong stone first.'); setTimeout(() => step() === 'gem' && commit('Stone', 100 - G.wrong * 30), 250); } }
  // ---- ENGRAVE: trace the Z ----
  const plateC = () => { const c = piece.position.clone(); c.y += piece.userData.plateTop || 0.02; return c; };
  const PR = 0.027;
  const zWorld = ([u, v]) => { const c = plateC(); return V3(c.x - u * PR, c.y, c.z + v * PR); };
  function toPlate(x, y) { if (!piece || !piece.userData.plate) return null; const c = plateC(), p = onPlane(x, y, c.y); if (!p) return null; return [-(p.x - c.x) / PR, (p.z - c.z) / PR]; }
  function zNearest(q, lo, hi) { let best = null; for (let i = 0; i < 3; i++) { const [ax, ay] = ZP[i], [bx, by] = ZP[i + 1], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy, t = clamp(((q[0] - ax) * dx + (q[1] - ay) * dy) / L2, 0, 1), g = i + t; if (g < lo || g > hi) continue; const d = Math.hypot(ax + dx * t - q[0], ay + dy * t - q[1]); if (!best || d < best.d) best = { d, g }; } return best; }
  function engPt(q, first) { const E = C.eng; if (E.done) return; const tol = upg('loupe') ? 0.34 : 0.22, nb = zNearest(q, E.prog - 0.25, E.prog + 0.45);
    const on = nb && nb.d < tol; if (first || !E.cur || E.cur.off !== !on) { E.cur = { off: !on, pts: E.cur && E.cur.pts.length ? [E.cur.pts[E.cur.pts.length - 1]] : [] }; E.strokes.push(E.cur); }
    if (E.cur.pts.length) { const lq = E.cur.pts[E.cur.pts.length - 1]; AUD.engSpd = Math.max(AUD.engSpd, Math.hypot(q[0] - lq[0], q[1] - lq[1]) * 4000); }
    E.cur.pts.push(q); if (on) { E.prog = Math.max(E.prog, nb.g); E.dev += nb.d; E.n++; } else E.off++;
    if (S.ptr && Math.random() < 0.3) spark(zWorld(q), 0xffffff, 1, 0.025);
    drawEng(); if (E.prog >= 2.93) { E.done = true; drawEng(); holdStop(); play('chime', { vol: 0.55, rate: 0.85 }); const avg = E.n ? E.dev / E.n : 1, offR = E.off / Math.max(1, E.n + E.off); if (avg > 0.12 || offR > 0.2) note('The Z wobbled off the line in places.'); setTimeout(() => step() === 'engrave' && commit('Engrave', 100 - avg * 140 - offR * 70), 250); } }
  // ---- POLISH: rub, steady ----
  const spdBand = () => [160 * scale(), 1000 * scale()];
  function rub(d, dtS) { if (step() !== 'polish' || !C) return; const Pl = C.pol, sp = d / Math.max(0.008, dtS); Pl.spd = Pl.spd * 0.7 + sp * 0.3; const [lo, hi] = spdBand();
    if (Pl.spd > hi) { Pl.warm += d / (420 * scale()); if (Pl.warm >= 1) { Pl.warm = 0.35; Pl.smear++; flash('TOO FAST · IT SMEARED', '#ec3013', 1.1); if (!play('smear')) tone(200, 0.15, 0.05, 'sawtooth'); buzz(60); } }
    else Pl.shine = Math.min(1, Pl.shine + d / (2300 * scale()) * (Pl.spd >= lo ? 1 : 0.35));
    if (Math.random() < 0.25 && piece) spark(piece.position.clone().add(V3(rr(-0.05, 0.05), 0.04, rr(-0.04, 0.04))), 0xffffff, 1, 0.05);
    if (Pl.shine >= 1 && !Pl.done) { Pl.done = true; holdStop(); cloth.visible = false; play('chime', { vol: 0.6, rate: 1.26 }); if (Pl.smear) note(Pl.smear > 1 ? 'Rubbed too fast. ' + Pl.smear + ' smears in the shine.' : 'One smear where the cloth went too fast.'); for (let i = 0; i < 6; i++) setTimeout(() => piece && spark(piece.position.clone().add(V3(rr(-0.06, 0.06), rr(0, 0.08), rr(-0.05, 0.05))), 0xffffff, 1, 0.09), i * 60); setTimeout(() => step() === 'polish' && commit('Polish', 100 - Pl.smear * 25), 300); } }
  // ---- scoring + serving ----
  const REACT = { delighted: { word: 'DELIGHTED!', col: '#22c55e', mood: 'excited', lines: ['That is the finest piece in Zion. Do not tell Aurel I said so.', 'Look at it catch the light!', 'Zada herself would wear this.'] },
    happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Lovely. Just what I wanted.', 'Good weight to it. Thank you.', 'That will turn heads at the tavern.'] },
    neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['It is gold. It is fine.', 'A bit rough, but it is mine.', 'Okay. Thanks.'] },
    unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['That is not quite right.', 'Aurel makes them smoother.', 'Hmm. Lumpy.'] },
    upset: { word: 'UPSET', col: '#ff7a5a', mood: 'stern', lines: ['Did the river do this, or you?', 'It looks like a truck ran it over.', 'I panned a whole week for this.'] },
    insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'stern', lines: ['That is NOT my piece!', 'Do I look like I ordered that?', 'Make it again. Properly.'] } };
  const avgScore = () => { const v = Object.values(C.scores); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0; };
  function slideTo(o) { if (!C || step() !== 'serve' || slide || S.react || !piece) return; const to = V3(o.f.position.x, piece.position.y, K.pass.z); slide = { o, from: piece.position.clone(), to, t: 0 }; if (!play('slide')) { tone(330, 0.25, 0.03, 'sine', 1.6); audio.burst && audio.burst(0.3, 900, 0.05); } }
  function serve(o) { if (o.piece !== C.piece) { startReact(o, 'insulted', 0, null); o.pat = Math.max(8, o.pat - 10); placeFor('serve'); return; }
    const avg = avgScore(), pq = o.pat / o.patMax; let level = avg >= 90 ? 'delighted' : avg >= 80 ? 'happy' : avg >= 68 ? 'neutral' : avg >= 55 ? 'unhappy' : avg >= 40 ? 'upset' : 'insulted';
    if (level === 'insulted') { startReact(o, 'insulted', 0, null, true); return; }
    let stars = level === 'delighted' || level === 'happy' ? 3 : level === 'neutral' ? 2 : 1; if (pq < 0.25 && stars > 1) stars--; o.stars = stars; o.score = avg;
    o.tip = level === 'delighted' ? Math.ceil(o.total * 0.5) + 2 : level === 'happy' ? Math.ceil(o.total * 0.3) + 1 : level === 'neutral' ? 1 : 0; o.st = 'pay';
    const pm = piece; piece = null; o.held = pm; const P = o.f.userData.P; pm.position.set(0.12, 0.98, 0.4); pm.rotation.set(0, 0, 0); pm.scale.setScalar(2.2 / (o.f.scale.x || 1)); P.body.add(pm); o.f.userData.hold = { right: true };
    // the finished piece keeps its shine: freeze a copy of the material on it
    const frozen = pieceM.clone(), frozenE = engM.clone(); frozenE.map = new THREE.CanvasTexture((() => { const c2 = document.createElement('canvas'); c2.width = c2.height = 256; c2.getContext('2d').drawImage(engCv, 0, 0); return c2; })()); frozenE.map.colorSpace = THREE.SRGBColorSpace;
    pm.traverse(m => { if (m.isMesh) { if (Array.isArray(m.material)) m.material = m.material.map(x => x === engM ? frozenE : x === pieceM ? frozen : x); else if (m.material === pieceM) m.material = frozen; } });
    const order = orders.find(q => q.id === C.oid); if (order && order !== o) order.made = false; o.made = true; S.xp += 4 + Math.round(avg / 100 * 6); C = null; sfx('serve');
    const bill = Math.random() < 0.45 ? [5, 10, 20].find(b => b > o.total) : 0; startReact(o, level, stars, bill ? { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 } : { oid: o.id, total: o.total, exact: true }); }
  function startReact(o, level, stars, pay, binned) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; S.react = { o, level, stars, pay, binned, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: custName(o.ci), tip: o.tip || 0, score: o.score || (C ? avgScore() : 0) }; S.focus = 'counter';
    if (play({ delighted: 'great', happy: 'good', neutral: 'good', unhappy: 'meh', upset: 'meh', insulted: 'bad' }[level], { vol: level === 'neutral' ? 0.55 : 0.85, rate: level === 'neutral' ? 0.9 : 1 })) { if (level === 'delighted') for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); return; }
    tone(level === 'insulted' ? 180 : level === 'unhappy' || level === 'upset' ? 300 : 880, 0.18, 0.05, level === 'insulted' || level === 'upset' ? 'sawtooth' : 'triangle'); if (level === 'delighted') { setTimeout(() => tone(1175, 0.1, 0.05), 110); setTimeout(() => tone(1568, 0.16, 0.05), 220); for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null;
    if (r.binned) { flash('AUREL MELTS IT DOWN · MAKE IT AGAIN', '#ec3013', 1.8); const o = r.o, ord = orders.find(q => q.id === (C && C.oid)) || o; o.pat = Math.max(10, o.pat - 10); clearPiece(); C = null; startPiece(ord); return; }
    if (!r.pay) { placeFor('serve'); return; }
    if (r.pay.exact) { const o = r.o; for (let i = 0; i < Math.min(6, o.total); i++) setTimeout(() => coinDrop(i < 3 ? 1 : 2), i * 90); S.payOut = { t: 0, o, exact: true }; payDone(r.pay); return; }
    S.pay = r.pay; payProps(r.pay); S.payOut = null; if (!play('cash', { vol: 0.6 })) { tone(880, 0.1, 0.05); audio.burst && audio.burst(0.2, 3200, 0.08); } }
  const REG = V3(K.register.x, T, K.register.z - 0.32), RG = registerKit(ST, REG, { open: 'GOLDWORKS · OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; buzz(10); coinDrop(v); regDraw(P); if (!play('coin', { rate: 0.92 + v * 0.015, vol: 0.8 })) tone(1400 + v * 40, 0.05, 0.03); if (P.given === P.owed) payDone(P); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; if (!play('wrong')) tone(220, 0.2, 0.04, 'sawtooth'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone(P) { const o = orders.find(q => q.id === P.oid); if (!P.exact) { S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); } if (!o) return; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars); S.combo = o.stars === 3 ? S.combo + 1 : 0;
    if (DM.on) DM.served++; flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + pts + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : '') + (P.exact ? ' · EXACT' : ''), '#ffd23a', 1.8); if (!play('cash', { vol: 0.75 })) { tone(1046, 0.1, 0.05); setTimeout(() => tone(1568, 0.12, 0.05), 90); } o.t = 0; o.st = Math.random() < 0.5 && !DM.on ? 'browse' : 'leave'; if (o.st === 'browse') { o.case = pick([V3(-3.8, 0, 1.25), V3(3.8, 0, 1.25)]); o.browseT = rr(5, 9); } }

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitV = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onPlane = (x, y, h) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const pl = new THREE.Plane(V3(0, 1, 0), -h); return ray.ray.intersectPlane(pl, hitV) ? hitV.clone() : null; };
  const TARGETS = () => { const t = [], s = step(); if (!C) return t;
    if (s === 'melt') t.push({ kind: 'nug', p: V3(K.nugDish.x, K.nugDish.y + 0.06, K.nugDish.z), r: 58 });
    if (s === 'gem' && !C.gem.placed) trayGems.forEach(g => t.push({ kind: 'gem', id: g.userData.id, p: g.position.clone(), r: 38 }));
    if (s === 'serve' && !slide && piece) { t.push({ kind: 'piece', p: piece.position.clone(), r: 70 }); waiting().forEach(o => t.push({ kind: 'cust', o, p: V3(o.f.position.x, 1.45, o.f.position.z), r: 80 })); }
    return t; };
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * scale() && d < bd) { bd = d; best = t; } } return best; }
  const busyUI = () => S.phase !== 'shift' || !!S.pay || DM.on || !!S.react || !!slide;
  function onDown(e) { audioOn(); S.lastInput = performance.now(); if (busyUI() || !C) return; S.touched = true; const { x, y } = local(e), s = step(), t = pickAt(x, y); e.preventDefault(); S.ptr = { x, y, x0: x, y0: y, t0: performance.now(), lt: performance.now(), hist: [{ x, y, t: performance.now() }] };
    if (s === 'melt') { if (t && t.kind === 'nug') { tapNug(); S.ptr.nug = true; return; } S.stroke = { kind: 'bellows', y0: y, p0: C.melt.p }; return; }
    if (s === 'pour') { if (!cruReady()) { flash('WAIT FOR THE CRUCIBLE', '#ffd23a', 0.8); return; } C.pour.on = true; C.pour.y0 = y; holdSound('pour'); return; }
    if (s === 'hammer') { hammerHit(); return; }
    if (s === 'gem') { if (!C.gem.placed) { if (t && t.kind === 'gem') drag = { kind: 'gem', id: t.id, x0: x, y0: y }; else flash('TAP THE ' + GEMS[C.spec.gem].name + ' ON THE TRAY', '#ffd23a', 1); return; } prongTap(); return; }
    if (s === 'engrave') { const q = toPlate(x, y); if (q) { holdSound('engrave'); engPt(q, true); } S.stroke = { kind: 'engrave' }; return; }
    if (s === 'polish') { S.stroke = { kind: 'polish' }; holdSound('polish'); return; }
    if (s === 'serve') { if (t && t.kind === 'cust') { slideTo(t.o); return; } if (t && t.kind === 'piece') drag = { kind: 'piece', x0: x, y0: y }; return; } }
  function onMove(e) { if (!S.ptr) return; const { x, y } = local(e), now = performance.now(), dtS = (now - S.ptr.lt) / 1000, d = Math.hypot(x - S.ptr.x, y - S.ptr.y); S.ptr.x = x; S.ptr.y = y; S.ptr.lt = now; S.ptr.hist.push({ x, y, t: now }); if (S.ptr.hist.length > 8) S.ptr.hist.shift(); if (!C) return; const s = step();
    if (S.stroke && S.stroke.kind === 'bellows') { bellowsTo(S.stroke.p0 + (S.stroke.y0 - y) / (110 * scale())); if (C.melt.p <= 0 || C.melt.p >= 1) { S.stroke.y0 = y; S.stroke.p0 = C.melt.p; } return; }
    if (s === 'pour' && C.pour.on) { C.pour.tilt = clamp((y - C.pour.y0) / (130 * scale()), 0, 1); return; }
    if (S.stroke && S.stroke.kind === 'engrave') { const q = toPlate(x, y); if (q) engPt(q, false); return; }
    if (S.stroke && S.stroke.kind === 'polish') { rub(d, dtS); if (piece) { const p = onPlane(x, y, piece.position.y + 0.02); if (p) { cloth.visible = true; cloth.position.set(clamp(p.x, piece.position.x - 0.1, piece.position.x + 0.1), piece.position.y + (piece.userData.kind === 'ring' ? 0.0 : 0.02), clamp(p.z, piece.position.z - 0.1, piece.position.z + 0.1)); cloth.rotation.y += d * 0.002; } } return; }
    if (drag && drag.kind === 'gem') { const p = onPlane(x, y, K.pad.y + 0.06), m = trayGems.find(g => g.userData.id === drag.id); if (p && m) m.position.set(clamp(p.x, K.pad.x - 0.3, K.gemTray.x + 0.3), K.pad.y + 0.06, clamp(p.z, K.pad.z - 0.3, K.pad.z + 0.3)); return; }
    if (drag && drag.kind === 'piece') { const p = onPlane(x, y, piece.position.y); if (p) { PC.to = null; piece.position.set(clamp(p.x, -3.3, 3.3), piece.position.y, clamp(p.z, KZ - 0.35, K.pass.z)); } return; } }
  function onUp() { const P0 = S.ptr; S.ptr = null; if (!P0 || !C) return; const s = step(), { x, y } = P0, tap = Math.hypot(x - P0.x0, y - P0.y0) < 14;
    if (S.stroke) { const k = S.stroke.kind; S.stroke = null; if (k === 'engrave' || k === 'polish') { holdStop(); cloth.visible = false; if (C.eng) C.eng.cur = null; } return; }
    if (s === 'pour' && C.pour.on) { C.pour.on = false; C.pour.tilt = 0; holdStop(); if (C.pour.fill >= 0.7) pourDone(); else if (C.pour.fill > 0.02) flash('KEEP POURING · UP TO THE WHITE LINE', '#ffd23a', 1.2); return; }
    if (drag) { const d = drag; drag = null;
      if (d.kind === 'gem') { const m = trayGems.find(g => g.userData.id === d.id); const ps = piece ? scr(piece.position) : null; if (tap || (ps && Math.hypot(x - ps.x, y - ps.y) < 100 * scale())) pickGem(d.id); if (m && !(C.gem.fly && C.gem.fly.m === m)) m.userData.back = 1; return; }
      if (d.kind === 'piece') { const h = P0.hist, a = h[0], b = h[h.length - 1], dt = Math.max(1, b.t - a.t), vx = (b.x - a.x) / dt * 1000, vy = (b.y - a.y) / dt * 1000; let tgt = pickAt(x, y, ['cust']);
        if (!tgt && (vy < -350 || y < scr(V3(0, T, K.pass.z)).y)) { const px = x + vx * 0.25; let bd = 1e9; waiting().forEach(o => { const sp = scr(V3(o.f.position.x, 1.2, o.f.position.z)); const dd = Math.abs(sp.x - px); if (dd < bd) { bd = dd; tgt = { o }; } }); }
        if (tgt) slideTo(tgt.o); else placeFor('serve'); return; } } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- NEXT-STEP HINT ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'shift' || S.pay || S.react) return null; const H = (p, station, text, r = 0.16) => ({ p, station, text, r });
    if (!C) return waiting().length ? null : H(V3(K.door.x, 0.02, K.door.z - 1.2), 'all', 'WAITING FOR A CUSTOMER', 0.5);
    const s = step(), sp = C.spec;
    if (s === 'melt') { const Mt = C.melt; if (Mt.nug < sp.nug) return H(V3(K.nugDish.x, K.nugDish.y, K.nugDish.z), 'forge', 'TAP THE NUGGET DISH · ' + Mt.nug + ' / ' + sp.nug + ' NUGGETS', 0.15); return H(V3(K.bellows.x, 0.02, K.bellows.z), 'forge', Mt.heat > HEAT[1] ? 'TOO HOT · STOP PUMPING, LET IT COOL' : 'SLIDE UP + DOWN TO PUMP THE BELLOWS · KEEP THE HEAT IN THE GREEN', 0.3); }
    if (s === 'pour') return H(V3(K.mold.x, K.mold.y, K.mold.z), 'forge', 'PRESS + DRAG DOWN TO TIP THE CRUCIBLE · LET GO AT THE WHITE LINE', 0.15);
    if (s === 'hammer') return H(V3(K.mandrel.x, K.mandrel.y - 0.06, K.mandrel.z), 'anvil', 'TAP WHEN THE WHITE RING MEETS THE GOLD ONE · ' + C.ham.n + ' / ' + sp.hits, 0.14);
    if (s === 'gem') { if (C.gem.placed) return H(PCat(K.pad), 'bench', 'TAP 4 TIMES TO CLOSE THE PRONGS · ' + C.gem.prongs + ' / 4', 0.12); const g = trayGems.find(q => q.userData.id === sp.gem); return H(g ? V3(g.position.x, K.pad.y, g.position.z) : PCat(K.gemTray), 'bench', 'TAP THE ' + GEMS[sp.gem].name + ' · ' + GEMS[sp.gem].shape.toUpperCase(), 0.08); }
    if (s === 'engrave') return H(PCat(K.pad), 'bench', 'TRACE THE DOTTED Z · ONE STEADY LINE, TOP LEFT FIRST', 0.12);
    if (s === 'polish') return H(PCat(K.pad), 'bench', 'RUB BACK AND FORTH · STEADY, NOT TOO FAST', 0.12);
    if (s === 'serve') { const o = orders.find(q => q.id === C.oid && q.st === 'wait'); return H(o ? V3(o.f.position.x, 0.02, o.f.position.z) : PCat(K.tray), 'counter', 'SLIDE THE TRAY ACROSS THE COUNTER TO ' + (o ? custName(o.ci) : custName(C.ci)), o ? 0.45 : 0.15); }
    return null; }
  let HINT = null, hintT = 0;
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === HINT.station) return; if (drag || S.hold || S.stroke || S.react || S.pay || (C && C.pour.on)) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 0.9 && performance.now() - (S.userFocusT || 0) > 2500) S.focus = HINT.station; }
  function setFocus(id) { if (!FOCUS[id] || S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); play('click', { vol: 0.4 }); }

  // ---------- DEMO: an autopilot works a real shift with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, day0: 1, act: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 20; scene.add(hand);
  const handTo = p => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.3); DM.hint = { p: p.clone().setY(Math.max(0.9, p.y - 0.15)), r: 0.12 }; };
  const cap = (id, key, text) => { DM.key = key; if (DM.seen[id]) { DM.cap = text.split('. ')[0].split(':')[0]; return false; } DM.seen[id] = true; DM.cap = text; return true; };
  const zAt = g => { const i = Math.min(2, Math.floor(g)), t = g - i, [ax, ay] = ZP[i], [bx, by] = ZP[i + 1]; return [ax + (bx - ax) * t, ay + (by - ay) * t]; };
  function demoAct(dt) {
    const A = DM.act; if (A) { A.t += dt; return A.run(dt, A) !== false; }
    if (S.pay) { const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); DM.cap = 'THEY PAID ' + P.paid + 'g FOR ' + P.total + 'g · TAP COINS TO GIVE ' + P.owed + 'g CHANGE'; DM.key = v + 'g'; giveCoin(v); DM.cd = 0.8; return false; }
    if (!C) return false; const s = step(), sp = C.spec;
    if (s === 'melt') { if (C.melt.nug < sp.nug) { cap('nug', 'TAP', 'THE TICKET SAYS ' + sp.nug + ' NUGGETS. TAP THE DISH ONCE FOR EACH'); handTo(V3(K.nugDish.x, K.nugDish.y + 0.08, K.nugDish.z)); tapNug(); DM.cd = 0.55; return false; }
      cap('pump', 'SLIDE', 'PUMP THE BELLOWS: SLIDE UP AND DOWN. KEEP THE HEAT IN THE GREEN UNTIL IT MELTS'); DM.act = { t: 0, ph: 0, run: (d, a) => { if (step() !== 'melt') { DM.act = null; DM.cd = 0.6; return false; } if (C.melt.heat < 64 || a.ph % 1 > 0.05) a.ph += d * 1.6; bellowsTo(0.5 - 0.5 * Math.cos(a.ph * Math.PI * 2)); handTo(K.bellowsHandle()); } }; return true; }
    if (s === 'pour') { if (!cruReady()) { DM.cd = 0.2; return false; } cap('pour', 'DRAG ↓', 'PRESS AND DRAG DOWN TO TIP THE CRUCIBLE. LET GO AT THE WHITE LINE'); holdSound('pour'); DM.act = { t: 0, run: () => { C.pour.tilt = 0.85; handTo(V3(K.mold.x, K.mold.y + 0.35, K.mold.z)); if (C.pour.fill >= 0.96) { C.pour.tilt = 0; DM.act = null; pourDone(); DM.cd = 1.2; return false; } } }; return true; }
    if (s === 'hammer') { if (!atMandrel()) { DM.cd = 0.2; return false; } cap('ham', 'TAP', 'TAP WHEN THE CLOSING WHITE RING MEETS THE GOLD MARK. KEEP THE BEAT'); DM.act = { t: 0, run: () => { if (step() !== 'hammer') { DM.act = null; DM.cd = 0.8; return false; } if (piece) handTo(piece.position.clone().add(V3(0, 0.1, 0))); if (C.ham.t >= 0 && Math.abs(beatScale() - 1) < 0.04) hammerHit(); } }; return true; }
    if (s === 'gem') { if (!C.gem.placed && !C.gem.fly) { cap('gem', 'TAP', 'READ THE TICKET: ' + GEMS[sp.gem].name + '. ' + GEMS[sp.gem].name + ' IS ' + GEMS[sp.gem].shape.toUpperCase() + '. TAP IT ON THE TRAY'); const g = trayGems.find(q => q.userData.id === sp.gem); if (g) handTo(g.position.clone()); pickGem(sp.gem); DM.cd = 1.1; return false; }
      if (C.gem.placed) { cap('prong', 'TAP ×4', 'NOW TAP FOUR TIMES TO CLOSE THE PRONGS OVER THE STONE'); handTo(piece.position.clone().add(V3(0, 0.1, 0))); prongTap(); DM.cd = 0.4; } else DM.cd = 0.2; return false; }
    if (s === 'engrave') { if (!piece || PC.wait || piece.position.distanceTo(PC.to || piece.position) > 0.02) { DM.cd = 0.3; return false; } cap('eng', 'TRACE', 'ENGRAVE THE Z: TRACE THE DOTTED LINE IN ONE STEADY STROKE, TOP LEFT FIRST'); holdSound('engrave'); DM.act = { t: 0, first: true, run: (d, a) => { if (step() !== 'engrave') { DM.act = null; DM.cd = 1; holdStop(); return false; } const q = zAt(Math.min(3, a.t / 2.6 * 3)); engPt([q[0] + Math.sin(a.t * 9) * 0.03, q[1]], a.first); a.first = false; handTo(zWorld(q).add(V3(0, 0.03, 0))); } }; return true; }
    if (s === 'polish') { if (!piece || PC.wait) { DM.cd = 0.3; return false; } cap('pol', 'RUB', 'POLISH: RUB BACK AND FORTH. STEADY. TOO FAST AND IT SMEARS'); holdSound('polish'); DM.act = { t: 0, run: (d, a) => { if (step() !== 'polish') { DM.act = null; DM.cd = 1; cloth.visible = false; return false; } const k = 560 * scale() * d; rub(k, d); cloth.visible = true; cloth.position.set(piece.position.x + Math.sin(a.t * 7) * 0.06, piece.position.y + (piece.userData.kind === 'ring' ? 0 : 0.02), piece.position.z); handTo(cloth.position.clone().add(V3(0, 0.05, 0))); } }; return true; }
    if (s === 'serve') { const o = orders.find(q => q.id === C.oid && q.st === 'wait') || waiting()[0]; if (!o || !piece) return false; cap('serve', 'SLIDE', 'SLIDE THE TRAY ACROSS THE COUNTER TO ' + custName(o.ci)); handTo(V3(o.f.position.x, T + 0.1, K.pass.z)); slideTo(o); DM.cd = 1.2; return false; }
    return false; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.24, hand.scale.x - dt * 0.5)); if (S.phase !== 'shift' || S.react || S.payOut || slide) return; if (DM.act) { demoAct(dt); return; } DM.cd -= dt; if (DM.cd > 0) return; DM.cd = 0.4; demoAct(dt);
    if (DM.served >= 2 || S.t > 160) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; audioOn(); DM.on = true; DM.seen = {}; DM.served = 0; DM.act = null; DM.cd = 2.2; DM.day0 = S.day; S.day = Math.max(S.day, 2); DM.cap = 'WATCH A SHIFT AT AUREL’S GOLDWORKS'; DM.key = ''; S.phase = 'intro'; S.done = null; S.demo = true; startShift(); S.next = 0.6; S.demoOrders = ['ring', 'pendant']; }
  function demoStop() { if (!DM.on) return; S.payOut = null; payProps(null); DM.on = false; S.demo = false; DM.act = null; hand.visible = false; S.day = DM.day0; S.pay = null; clearAll(); toIntro(); }

  // ---------- shift flow ----------
  function clearAll() { S.hold = null; S.stroke = null; holdStop(); drag = null; slide = null; S.react = null; S.pay = null; payProps(null); DM.act = null;
    orders.forEach(o => { o.f.visible = false; o.f.userData.hold = null; o.f.position.y = 0; if (o.held) { o.held.parent && o.held.parent.remove(o.held); o.held = null; } }); orders.length = 0; C = null; clearPiece();
    flyNugs.forEach(f => scene.remove(f.m)); flyNugs.length = 0; resetCru(); dishNugs.forEach(n => n.visible = true); cruNugs.forEach(n => n.visible = false); pool.visible = false; K.moldFill.scale.y = 0.001; pourStream.visible = false; K.bellowsTop.rotation.x = 0; }
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done') return; S.payOut = null; if (!S.demo && DM.on) demoStop(); audioOn(); clearAll(); dismissPatrons(); Object.assign(S, { phase: 'glide', mode: 'shift', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.5, done: null, pay: null, combo: 0, xp: 0 });
    S.focus = 'all'; ben.visible = false; benW.visible = false; aurel.position.set(4.35, 0, KZ - 0.85); aurel.rotation.y = -2.2; glideTo(workShot('all'), 1.6); say('AUREL: “' + AUREL.work[2] + '”', 6); S.glideT = 1.65; }
  function endShift() { S.phase = 'done'; S.hold = null; holdStop(); const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 3 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.pieces, save.stat(SAVE.pieces, 0) + S.served); if (S.xp) save.addXp(S.xp); if (S.served >= 2 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...PIECES.filter(r => r.day === nd).map(r => r.name), ...Object.values(GEMS).filter(g => g.day === nd).map(g => g.name + ' (+2g)')]; }
      if (!save.flag(SAVE.uniform) && S.served >= 3) { save.setFlag(SAVE.uniform); unlock.push('GOLDSMITH APRON + LOUPE'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold, xp: S.xp, pieces: save.stat(SAVE.pieces, 0) };
    if (newDay) S.day += 1; clearAll(); placeGreeter(); glideTo(wideShot(), 1.4); play('fanfare', { vol: 0.9 });
    say(eod ? 'AUREL: “EMPLOYEE OF THE DAY. The river would be proud.”' : S.served >= 3 ? 'AUREL: “Good shift. The forge likes you.”' : 'AUREL: “Gold forgives. Come back tomorrow.”', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); if (!play('cash')) tone(1320, 0.1, 0.05); if (S.done) S.done.gold = save.data.gold; return true; }
  function placeGreeter() { setUniform(true); ben.visible = true; benW.visible = false; ben.position.set(-0.7, 0, KZ + 1.6); ben.rotation.y = 0.3; aurel.position.copy(K.keeperSpot); aurel.rotation.y = 0; }
  function toIntro() { S.phase = 'intro'; S.mode = 'shift'; S.done = null; clearAll(); placeGreeter(); glideTo(wideShot(), 1); }
  function fadeTo(fn) { S.fadeDir = 1; S.fadeFn = fn; }
  function toWalk() { fadeTo(() => { S.phase = 'walk'; S.mode = 'walk'; S.done = null; clearAll(); ben.visible = false; benW.visible = true; benW.position.set(K.talkSpot.x - 0.4, 0, K.talkSpot.z + 0.5); benW.rotation.y = Math.PI; W.sit = null; aurel.position.copy(K.keeperSpot); aurel.rotation.y = 0; W.camInit = true; seatPatrons(); }); }
  function hireAndWork() { try { save.setFlag(SAVE.hired); } catch (e) {} fadeTo(() => { W.sit = null; toIntro(); camera.position.copy(wideShot().pos); CAM.look.copy(wideShot().look); CAM.t = 1; }); }

  // ---------- WALK MODE: the shop as an interior Ben can walk around ----------
  const W = { stick: { x: 0, y: 0 }, keys: new Set(), sit: null, wave: 0, D: null, toast: '', toastT: 0, camInit: true, look: 0, auWave: 0, chatT: 0, chatWho: 0 };
  function talkTarget() { const p = benW.position, out = [];
    out.push({ key: 'aurel', d: Math.hypot(p.x - K.talkSpot.x, p.z - (KZ + 0.75)), max: 2.2, label: 'Talk to Aurel' });
    regulars.forEach(r => out.push({ key: r.key, d: Math.hypot(p.x - r.f.position.x, p.z - r.f.position.z), max: 1.7, label: 'Talk to ' + BENCH_TALK[r.key].name }));
    const best = out.filter(o => o.d < o.max).sort((a, b) => a.d - b.d)[0]; return best || null; }
  function openTalk(key) { if (key === 'aurel') { const hired = save.flag(SAVE.hired); aurel.userData.talking = true;
      const menu = hired ? [{ text: 'Another piece?', lines: AUREL.again, then: 'work' }, { text: 'How do I work the gold?', lines: AUREL.how }, { text: 'How did you become a goldsmith?', lines: AUREL.story }, { text: 'Not just now.', lines: AUREL.later, then: 'bye', bye: true }]
        : [{ text: 'I WOULD LOVE TO! Put me to work.', lines: AUREL.work, then: 'work' }, { text: 'How do I work the gold?', lines: AUREL.how }, { text: 'How did you become a goldsmith?', lines: AUREL.story }];
      W.D = { key, name: 'Aurel', role: 'The Goldsmith', lines: [['npc', hired ? AUREL.back : AUREL.hello]], i: 0, menu, showMenu: false }; }
    else { const tt = BENCH_TALK[key], r = regulars.find(q => q.key === key); r.f.userData.talking = true; r.f.userData.lookAt = benW.position.clone().setY(1.5); W.D = { key, name: tt.name, role: tt.role, lines: tt.lines, i: 0, menu: null }; }
    if (!play('click', { vol: 0.6 })) tone(1046, 0.06, 0.03); }
  function closeTalk() { if (!W.D) return; W.D = null; aurel.userData.talking = false; regulars.forEach(r => { r.f.userData.talking = false; }); }
  function dlgNext() { const D = W.D; if (!D) return; if (D.showMenu) return; D.i++; if (D.i < D.lines.length) { if (!play('click', { vol: 0.35, rate: 1.2 })) tone(880, 0.04, 0.02); return; }
    if (D.then === 'work') { closeTalk(); hireAndWork(); return; } if (D.then === 'bye' || !D.menu) { closeTalk(); return; } D.showMenu = true; D.lines = [['npc', D.lines[D.lines.length - 1][1]]]; D.i = 0; }
  function dlgChoose(i) { const D = W.D; if (!D || !D.menu || !D.showMenu) return; const c = D.menu[i]; if (!c) return; c.asked = true; D.showMenu = false; D.lines = c.lines.map(t => ['npc', t]); D.i = 0; D.then = c.then || null; if (!play('click', { vol: 0.5 })) tone(990, 0.05, 0.03); }
  function dlgHud() { const D = W.D; if (!D) return null; const ln = D.lines[Math.min(D.i, D.lines.length - 1)], isP = ln[0] === 'player';
    if (D.showMenu) return { name: D.name, role: D.role, text: ln[1], choices: D.menu.map(c => ({ text: c.text, asked: !!c.asked && !c.then, bye: !!c.bye })), step: 1, total: 1 };
    return { name: isP ? 'Ben' : D.name, role: isP ? '' : D.role, text: ln[1], step: D.i + 1, total: D.lines.length, more: !!D.menu }; }
  function sitToggle() { if (S.phase !== 'walk' || W.D) return; if (W.sit) { standUp(); return; } const p = benW.position; let best = null, bd = 1.35; for (const s of K.seats) { if (s.taken) continue; const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; best = s; } }
    if (!best) { W.toast = 'NO FREE SEAT HERE · WALK UP TO ONE'; W.toastT = 1.6; return; } W.sit = best; benW.position.set(best.x - Math.sin(best.ry) * 0.06, 0, best.z - Math.cos(best.ry) * 0.06); benW.rotation.y = best.ry; if (!play('thud', { vol: 0.35, rate: 1.5 })) tone(330, 0.08, 0.03); }
  function standUp() { const s = W.sit; if (!s) return; W.sit = null; benW.position.set(s.x + Math.sin(s.ry) * 0.7, 0, s.z + Math.cos(s.ry) * 0.7); }
  function wave() { if (S.phase !== 'walk' || W.D) return; W.wave = 1.6; const p = benW.position; if (aurel.position.distanceTo(p) < 7) W.auWave = 1.6; regulars.forEach(r => { if (r.f.position.distanceTo(p) < 6) { r.f.userData.lookAt = p.clone().setY(1.5); r.f.userData.mood = 'excited'; r.waveT = 1.6; } }); if (!play('wave', { vol: 0.8 })) { tone(784, 0.08, 0.03, 'triangle'); setTimeout(() => tone(988, 0.1, 0.03, 'triangle'), 90); } }
  function hop() { if (S.phase !== 'walk' || W.D || W.sit) return; if (benW.userData.hop <= 0) { benW.userData.hop = 1; if (!play('hop', { vol: 0.6 })) tone(520, 0.08, 0.03, 'triangle', 1.5); } }
  function collide(p) { const B = K.walkBox; for (const c of K.colliders) { if (c.type === 'circle') { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), r = c.r + 0.3; if (d < r && d > 1e-4) { p.x = c.x + dx / d * r; p.z = c.z + dz / d * r; } }
      else if (c.z1 > B.z0 + 0.05) { const x0 = c.x0 - 0.3, x1 = c.x1 + 0.3, z0 = c.z0 - 0.3, z1 = c.z1 + 0.3; if (p.x > x0 && p.x < x1 && p.z > z0 && p.z < z1) { const m = [p.x - x0, x1 - p.x, p.z - z0, z1 - p.z], k = m.indexOf(Math.min(...m)); if (k === 0) p.x = x0; else if (k === 1) p.x = x1; else if (k === 2) p.z = z0; else p.z = z1; } } }
    p.x = clamp(p.x, B.x0, B.x1); p.z = Math.max(p.z, B.z0); const inDoor = Math.abs(p.x - K.door.x) < K.door.w / 2 - 0.3; if (p.z > B.z1 && !inDoor) p.z = B.z1; if (inDoor) p.z = Math.min(p.z, K.door.z + 0.7); }
  function walkStep(dt) { const k = W.keys; let sx = W.stick.x, sy = W.stick.y; if (k.has('KeyA') || k.has('ArrowLeft')) sx = -1; if (k.has('KeyD') || k.has('ArrowRight')) sx = 1; if (k.has('KeyW') || k.has('ArrowUp')) sy = 1; if (k.has('KeyS') || k.has('ArrowDown')) sy = -1;
    const mag = Math.min(1, Math.hypot(sx, sy)); let speed = 0; if (W.D) { sx = sy = 0; }
    if (W.sit && Math.hypot(sx, sy) > 0.5) standUp();
    if (!W.sit && Math.hypot(sx, sy) > 0.12) { const dir = V3(sx, 0, -sy).normalize(); speed = 3.4 * mag; benW.position.addScaledVector(dir, speed * dt); let da = Math.atan2(dir.x, dir.z) - benW.rotation.y; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; benW.rotation.y += da * Math.min(1, dt * 12); W.stepT = (W.stepT || 0) - dt * speed; if (W.stepT < 0) { W.stepT = 0.75; audio.step && audio.ctx && audio.step(); } }
    collide(benW.position);
    if (benW.position.z > K.door.z + 0.25) { if (onExit) { onExit(); benW.position.z = K.door.z - 0.6; } else { benW.position.z = K.door.z - 0.9; benW.rotation.y = Math.PI; W.toast = 'THE DOOR OUT TO ZION TOWN SQUARE · IN THE WORLD MAP THIS TAKES YOU OUTSIDE'; W.toastT = 3; } }
    kit.animFox(benW, dt, speed, benW.userData.hop > 0); if (W.sit) { sitPose(benW, true); benW.position.y = W.sit.y - 0.5; } else benW.position.y = 0;
    if (W.wave > 0) { W.wave -= dt; BW.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32); }
    const near = aurel.position.distanceTo(benW.position) < 5.5; aurel.userData.lookAt = near ? benW.position.clone().setY(1.4) : null; aurel.userData.mood = W.auWave > 0 ? 'excited' : 'warm';
    const tt = talkTarget(); W.prompt = W.D ? null : tt ? tt.label : null; W.target = tt;
    if (W.toastT > 0) { W.toastT -= dt; if (W.toastT <= 0) W.toast = ''; }
    // camera: from the street side, over Ben's shoulder, front wall cut away
    const off = port() ? V3(0, 7.2, 7.4) : V3(0, 6.4, 6.6), want = benW.position.clone().add(off); want.x = clamp(want.x * 0.7, -3.2, 3.2); want.z = Math.min(want.z, K.door.z + 6.5); const look = benW.position.clone().add(V3(0, 0.9, port() ? -2.2 : -3.0)); look.x = clamp(look.x, -4.2, 4.2);
    if (W.camInit) { camera.position.copy(want); CAM.look.copy(look); W.camInit = false; } else { camera.position.lerp(want, Math.min(1, dt * 4)); CAM.look.lerp(look, Math.min(1, dt * 5)); } }
  function regularsStep(dt) { W.chatT -= dt; if (W.chatT <= 0) { W.chatT = rr(2.2, 3.6); W.chatWho = 1 - W.chatWho; } regulars.forEach((r, i) => { const u = r.f.userData; if (!(W.D && W.D.key === r.key)) { u.talking = S.phase === 'walk' && !W.D && W.chatWho === i; u.lookAt = r.waveT > 0 ? benW.position.clone().setY(1.5) : regulars[1 - i].f.position.clone().setY(1.5); } if (r.waveT > 0) { r.waveT -= dt; if (r.waveT <= 0) u.mood = 'happy'; } kit.animFox(r.f, dt, 0); sitPose(r.f, true); r.f.position.y = r.seat.y - 0.5;
      if (r.waveT > 0) u.P.arms[1].rotation.set(-0.25, 0, 2.55 - Math.sin(performance.now() / 1000 * 7) * 0.32); }); }
  const patrons = []; function seatPatrons() { dismissPatrons(); const free = K.seats.filter(q => !q.taken && q.x > 0); [0, 3].forEach((ci, i) => { const st = free[i]; if (!st) return; const f = custFox[ci]; f.visible = true; st.taken = 'p'; f.position.set(st.x, st.y - 0.5, st.z); f.rotation.y = st.ry; f.userData.mood = 'happy'; patrons.push({ f, seat: st, t: rr(0, 6) }); }); }
  function dismissPatrons() { patrons.forEach(p => { p.f.visible = false; p.f.position.y = 0; p.f.userData.talking = false; if (p.seat.taken === 'p') p.seat.taken = null; }); patrons.length = 0; }
  function patronsStep(dt) { patrons.forEach((p, i) => { p.t += dt; const u = p.f.userData; u.talking = Math.sin(p.t * 0.5 + i * 3) > 0.6; u.lookAt = W.wave > 0 ? benW.position.clone().setY(1.5) : patrons[1 - i] ? patrons[1 - i].f.position.clone().setY(1.5) : null; kit.animFox(p.f, dt, 0); sitPose(p.f, true); p.f.position.y = p.seat.y - 0.5; u.P.arms[1].rotation.x = -0.9 + Math.sin(p.t * 0.7 + i) * 0.2; }); }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  const lerpCam = (sh, k) => { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); };
  const DULL = new THREE.Color('#a8803a'), BRIGHT = new THREE.Color('#ffd04a'), HOT = new THREE.Color('#ffb02a');
  function tick(dt) {
    if (S.fadeDir) { S.fade = clamp(S.fade + S.fadeDir * dt * 4, 0, 1); if (S.fade >= 1 && S.fadeDir > 0) { const f = S.fadeFn; S.fadeFn = null; S.fadeDir = -1; f && f(); } else if (S.fade <= 0 && S.fadeDir < 0) S.fadeDir = 0; }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.12 + (1 - p.life) * 0.25); }
    for (const q of sparkS) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt * 2.4; q.s.material.opacity = Math.max(0, q.life); q.s.scale.setScalar((q.size || 0.06) * (0.6 + Math.sin(q.life * Math.PI) * 0.8)); q.s.position.y += dt * 0.05; }
    lampGl.forEach((s, i) => s.material.opacity = 0.45 + Math.sin(clock.elapsedTime * 2 + i) * 0.04);
    for (const q of glints) { if (q.life <= 0) { q.s.material.opacity = 0; continue; } q.life -= dt * 1.6; const k = Math.sin(Math.max(0, q.life) * Math.PI); q.s.material.opacity = k; q.s.scale.setScalar(q.size * (0.3 + k)); q.s.material.rotation += dt * 1.5; }
    glintT -= dt; if (glintT <= 0) { glintT = rr(0.12, 0.35); const [p, sz] = pick(GLINT_SPOTS); if (camera.position.distanceTo(p) < 9) glint(p.clone().add(V3(rr(-0.04, 0.04), rr(0, 0.03), rr(-0.04, 0.04))), sz); if (piece && (!C || C.pol.shine > 0.4 || step() === 'serve') && Math.random() < 0.6) glint(piece.position.clone().add(V3(rr(-0.05, 0.05), rr(-0.02, 0.07), rr(-0.03, 0.03))), 0.05); }
    { const heat = C && step() === 'melt' ? C.melt.heat : 35; emberAcc += dt * (2 + clamp((heat - 30) / 50, 0, 1.5) * 10); while (emberAcc > 1) { emberAcc--; const e = embers.find(z => z.life <= 0); if (!e) break; e.life = 1; e.s.position.set(K.forge.x + rr(-0.3, 0.3), 1.08, K.forge.z + 0.1 + rr(-0.3, 0.3)); e.v.set(rr(-0.08, 0.08), rr(0.35, 0.8), rr(-0.08, 0.08)); }
      for (const e of embers) { if (e.life <= 0) { e.s.material.opacity = 0; continue; } e.life -= dt * 0.7; e.s.position.addScaledVector(e.v, dt); e.s.position.x += Math.sin(e.life * 9 + e.v.y * 20) * dt * 0.06; e.s.material.opacity = Math.min(1, e.life * 1.5) * 0.9; e.s.scale.setScalar(0.03 + e.life * 0.03); } }
    { const t2 = clock.elapsedTime, h2 = C && step() === 'melt' ? clamp((C.melt.heat - 20) / 70, 0, 1.3) : 0.2; K.emberM.emissiveIntensity = 0.6 + h2 * 1.6 + Math.sin(t2 * 11) * 0.12 + Math.sin(t2 * 5.3) * 0.1; }
    anvilL.intensity = Math.max(0, anvilL.intensity - dt * 9);
    { const pf = C && step() === 'pour' ? C.pour : null; moldGlow.material.opacity = damp(moldGlow.material.opacity, pf ? Math.min(0.9, 0.2 + pf.fill * 0.7) : piece && PC.wait > 0 ? 0.5 : 0, 5, dt); moldGlow.scale.setScalar(0.45 + (pf ? (pf.flow || 0) * 1.2 : 0) + Math.sin(clock.elapsedTime * 8) * 0.03); }
    K.shafts.visible = S.phase === 'intro' || S.phase === 'done' || S.phase === 'walk'; if (K.shafts.visible) { K.dust.position.y = Math.sin(clock.elapsedTime * 0.25) * 0.08; K.dust.rotation.y += dt * 0.004; K.shafts.children.forEach((m, i) => { if (m.isMesh) m.material.opacity = 0.26 + Math.sin(clock.elapsedTime * 0.5 + i) * 0.05; }); }
    musicStep(); audioTick(dt);
    // the forge breathes: brighter with the heat
    { const h = C && step() === 'melt' ? C.melt.heat : 35, f = clamp((h - 20) / 70, 0, 1.3), fl = Math.sin(clock.elapsedTime * 13) * 0.05 + Math.sin(clock.elapsedTime * 7.3) * 0.05; K.coalM.emissiveIntensity = 0.35 + f * 1.6 + fl; forgeL.intensity = 0.8 + f * 2.2 + fl * 4; forgeGlow.material.opacity = 0.35 + f * 0.5 + fl; forgeGlow.scale.setScalar(1.2 + f * 0.8); }
    if (W.auWave > 0) { W.auWave -= dt; }
    regularsStep(dt);
    if (S.phase === 'walk') { K.front.forEach(m => m.visible = false); K.cut.forEach(m => m.visible = false); K.back.visible = true; K.hood.visible = true; walkStep(dt); patronsStep(dt); if (!W.greeted && aurel.position.distanceTo(benW.position) < 4.5) { W.greeted = true; W.auWave = 2.2; if (!play('wave', { vol: 0.6, rate: 0.9 })) { tone(659, 0.08, 0.03, 'triangle'); setTimeout(() => tone(880, 0.1, 0.03, 'triangle'), 110); } } kit.animFox(aurel, dt, 0); if (W.auWave > 0) aurel.userData.P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32); stepProps(dt); camera.lookAt(CAM.look); return; }
    // ---- job phases ----
    const work = S.phase === 'shift';
    if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position, sh = shotFor('react' + o.spot, () => [V3(f.x - 0.85, 0.9, f.z), V3(f.x + 0.85, 0.9, f.z), V3(f.x, 2.55, f.z), V3(f.x, T, K.pass.z)], 0.42, 0, 0.1); lerpCam(sh, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.0 : 2.4)) reactDone(); }
    else if (S.pay || (S.payOut && !S.payOut.exact)) { const sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0, 0.07); lerpCam(sh, Math.min(1, dt * 5)); regDisp.scale.set(port() ? 0.36 : 0.46, port() ? 0.133 : 0.17, 1); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (work || S.phase === 'glide') { const s = step(), arrived = piece && !PC.wait && PC.to && piece.position.distanceTo(PC.to) < 0.01, forced = (s === 'engrave' || s === 'polish' || (s === 'gem' && C && C.gem.placed)) && arrived ? 'close' : s === 'gem' ? 'bench' : null; lerpCam(workShot(forced || S.focus), Math.min(1, dt * (forced ? 4.5 : 3.2))); }
    { const wide = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !wide); K.cut.forEach(m => m.visible = false); K.hood.visible = wide; }
    K.back.visible = camera.position.z > -4.2;
    camera.lookAt(CAM.look);
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { S.phase = 'shift'; S.next = S.demo ? 0.4 : 1.2; flash('DOORS OPEN!', '#22c55e', 1.4); play('bell', { vol: 0.8 }); } }
    if (work) { S.t += dt; if (S.t >= GOLDWORKS.shift && !DM.on) endShift(); }
    if (work && C) stepWork(dt);
    stepProps(dt);
    if (DM.on) demoStep(dt);
    hintT += dt; HINT = DM.on ? DM.hint : nextHint(); const sNow = step(); RINGS.place(HINT && !S.react && S.phase === 'shift' && !['engrave', 'polish', 'hammer'].includes(sNow) && !(sNow === 'gem' && C && C.gem.placed) ? HINT : null, hintT, dt); if (work) autoFollow();
    regDisp.visible = !!(S.pay || (S.payOut && !S.payOut.exact)); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; if (!play('coin', { vol: 0.35, rate: rr(1.0, 1.25), gap: 0.05 })) tone(2400 + Math.random() * 400, 0.04, 0.03, 'square'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o && !S.payOut.exact) { const to = V3(o.f.position.x, K.pass.y + 0.03, K.pass.z); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > (S.payOut.exact ? 1.4 : 1.1)) { S.payOut = null; payProps(null); } }
    // customers: walk in from the door, wait, maybe admire a display case, leave with their piece
    if (work) { S.next -= dt; const maxQ = Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st === 'walk' || o.st === 'wait' || o.st === 'pay').length < maxQ && S.t < GOLDWORKS.shift - 15) { newOrder(); S.next = Math.max(20, 36 - S.day * 2) * rr(0.8, 1.2); } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot]; o.t += dt; let spd = 0;
      const walkTo = (x, z, v) => { const d = V3(x - o.f.position.x, 0, z - o.f.position.z), L = d.length(); if (L > 0.06) { spd = v; o.f.position.addScaledVector(d.normalize(), Math.min(L, spd * dt)); o.f.rotation.y = Math.atan2(d.x, d.z); } return L; };
      if (o.st === 'walk') { if (walkTo(sp.x, sp.z, 1.7) < 0.07) { o.st = 'wait'; o.f.rotation.y = Math.PI; say(custName(o.ci) + ': “' + o.line + '”', 3); tone(1046, 0.06, 0.03); } }
      else if (o.st === 'wait' && work) { o.pat -= DM.on ? 0 : dt; const r = o.pat / o.patMax; if (!S.react || S.react.o !== o) o.f.userData.mood = r < 0.3 ? 'stern' : r < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; S.combo = 0; flash(custName(o.ci) + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); if (!play('bad', { vol: 0.6 })) tone(180, 0.3, 0.05, 'sawtooth'); if (C && C.oid === o.id) { const alt = waiting().find(q => q.piece === C.piece && !q.made); if (alt) { C.oid = alt.id; C.ci = alt.ci; } else { say('AUREL: “I will put that one in the window.”', 3); clearPiece(); C = null; } } } }
      else if (o.st === 'browse') { const L = walkTo(o.case.x, o.case.z, 1.5); if (L < 0.08) { o.f.rotation.y = Math.PI; o.f.userData.mood = 'curious'; o.browseT -= dt; if (o.browseT <= 0 || !work) { o.st = 'leave'; o.t = 0; } } if (o.t > 14) { o.st = 'leave'; o.t = 0; } }
      else if (o.st === 'leave') { const L = walkTo(K.door.x, K.door.z + 0.6, 1.9); if (L < 0.4 || o.t > 9) { o.f.visible = false; o.f.userData.hold = null; o.f.position.y = 0; if (o.held) { o.held.parent && o.held.parent.remove(o.held); o.held = null; } orders.splice(i, 1); } }
      kit.animFox(o.f, dt, spd); }
    // start the next piece when the bench is free
    if (work && !C && !S.react && !slide && !DM.act && !S.pay && !S.payOut) { const o = nextOrderToMake(); if (o) { startPiece(o); flash('TICKET UP · ' + custName(o.ci) + ' · ' + PZ(o.piece).name, '#ffd23a', 1.4); } }
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox(ben, dt, 0); kit.animFox(aurel, dt, 0);
    if (greet && BP.arms && BP.arms[0]) { const w = performance.now() / 1000; BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(w * 7) * 0.32); }
    if (work) aurel.userData.lookAt = piece ? piece.position : cru.position;
  }
  // the piece in progress: heat, flow, the beat
  function stepWork(dt) { const s = step();
    if (s === 'melt') { const Mt = C.melt; Mt.heat = Math.max(20, Mt.heat - (Mt.heat - 20) * 0.16 * dt);
      if (Mt.nug >= C.spec.nug && !flyNugs.length) { if (Mt.heat >= HEAT[0] && Mt.heat <= HEAT[1]) Mt.prog = Math.min(1, Mt.prog + dt / 1.8); if (Mt.heat > HEAT[1]) { Mt.over += dt * (Mt.heat > 92 ? 2 : 1); if (Math.random() < dt * 6) puff(cru.position.x, cru.position.y + 0.2, cru.position.z, 0x777777, 1); } }
      if (Mt.prog >= 1) commit('Melt', meltScore()); }
    else if (s === 'pour') { const Pr = C.pour; if (cruReady() && Pr.tilt > 0.02) { const fl = Pr.tilt * Pr.tilt * (upg('tongs') ? 0.32 : 0.5); Pr.fill += fl * dt; Pr.flow = fl; } else Pr.flow = 0; if (Pr.fill >= 1.15) { flash('IT RAN OVER!', '#ec3013', 1); pourDone(); } }
    else if (s === 'hammer') { if (atMandrel()) { const H = C.ham; H.t += dt; if (H.t >= 0 && beatScale() < 0.4) { H.sc.push(20); H.last = 20; H.n++; H.t = -0.32; flash('MISSED THE BEAT', '#ec3013', 0.6); if (!play('thud', { vol: 0.8 })) tone(200, 0.1, 0.04, 'square'); if (H.n >= C.spec.hits) { const avg = H.sc.reduce((a, b) => a + b, 0) / H.sc.length; note('Missed a beat or two on the anvil.'); setTimeout(() => step() === 'hammer' && commit('Hammer', avg), 300); } } } }
    else if (s === 'gem' && C.gem.fly) { const F = C.gem.fly; F.t += dt / 0.45; const to = piece.localToWorld(piece.userData.gemAt.clone()); F.m.position.lerpVectors(F.from, to, smooth(0, 1, Math.min(1, F.t))); F.m.position.y += Math.sin(Math.min(1, F.t) * Math.PI) * 0.08; F.m.scale.setScalar(3.8 - 2.8 * Math.min(1, F.t));
      if (F.t >= 1) { C.gem.fly = null; C.gem.placed = true; trayGems = trayGems.filter(g => g !== F.m); piece.add(F.m); F.m.position.copy(piece.userData.gemAt); F.m.scale.setScalar(1); F.m.rotation.set(0, 0, 0); if (!play('chime', { vol: 0.8 })) tone(1800, 0.08, 0.04, 'triangle'); flash('NOW TAP 4 TIMES TO CLOSE THE PRONGS', '#22c55e', 1.2); } }
    if (s === 'polish' && C.pol) C.pol.warm = Math.max(0, C.pol.warm - dt * 0.5); }
  function stepProps(dt) { const s = step(), t = performance.now() / 1000;
    // crucible: on the coals, or lifted over the mould by the tongs, tipping
    if (CRU.to) cru.position.lerp(CRU.to, Math.min(1, dt * 5)); const tilt = C && s === 'pour' ? C.pour.tilt : 0; cru.rotation.z = damp(cru.rotation.z, -tilt * 1.9, 9, dt);
    for (let i = flyNugs.length - 1; i >= 0; i--) { const f = flyNugs[i]; f.t += dt / 0.4; const to = V3(cru.position.x, cru.position.y + 0.06, cru.position.z); f.m.position.lerpVectors(f.from, to, Math.min(1, f.t)); f.m.position.y += Math.sin(Math.min(1, f.t) * Math.PI) * 0.25; f.m.rotation.x += dt * 8; if (f.t >= 1) { scene.remove(f.m); flyNugs.splice(i, 1); if (!play('clink', { vol: 0.85, rate: rr(0.88, 1.15) })) tone(600, 0.05, 0.03, 'triangle'); } }
    const Mt = C && C.melt, molten = C && (s === 'melt' || s === 'pour'); const nIn = Mt ? Mt.nug - flyNugs.length : 0;
    cruNugs.forEach((n, i) => { n.visible = !!molten && s === 'melt' && i < nIn; n.scale.setScalar(Math.max(0.2, 1 - (Mt ? Mt.prog : 0) * 0.85)); });
    pool.visible = !!molten && (s === 'pour' || (Mt && Mt.prog > 0.02)); if (pool.visible) { const k = s === 'pour' ? Math.max(0.15, 1 - C.pour.fill * 0.85) : 0.3 + Mt.prog * 0.7; pool.scale.setScalar(k); poolM.color.copy(HOT).lerp(new THREE.Color(Mt && Mt.heat > HEAT[1] + 6 ? '#8a8580' : '#fff2b0'), Mt && Mt.heat > HEAT[1] + 6 ? 0.4 : 0.2 + Math.sin(t * 9) * 0.05); poolM.emissiveIntensity = 1 + Math.sin(t * 7) * 0.15; }
    // bellows
    const bp = C && s === 'melt' ? C.melt.p : 0; K.bellowsTop.rotation.x = damp(K.bellowsTop.rotation.x, bp * 0.5, 18, dt); K.bellowsLeather.scale.y = 0.06 + K.bellowsTop.rotation.x * 0.5;
    // pour stream + the mould filling up
    const fl = C && s === 'pour' ? C.pour.flow || 0 : 0; pourStream.visible = fl > 0.002; if (pourStream.visible) { cru.updateMatrixWorld(); const lip = cru.localToWorld(V3(0.15, 0.19, 0)), bot = K.mold.y + 0.06 + 0.033 * Math.min(1.1, C.pour.fill), h = Math.max(0.01, lip.y - bot); pourStream.scale.set(0.6 + fl * 2, h, 0.6 + fl * 2); pourStream.position.set(lip.x, bot + h / 2, K.mold.z); if (Math.random() < dt * 10) spark(V3(K.mold.x, bot, K.mold.z), 0xffd23a, 1, 0.05); }
    if (C && s === 'pour') K.moldFill.scale.y = Math.max(0.001, 0.033 * Math.min(1.1, C.pour.fill)); else K.moldFill.scale.y = damp(K.moldFill.scale.y, 0.001, 10, dt);
    K.moldFillM.emissiveIntensity = damp(K.moldFillM.emissiveIntensity, C && s === 'pour' ? 1.2 : 0.2, 2, dt);
    // the piece: waits in the mould to cool a moment, then glides to the next station
    if (piece) { if (PC.wait > 0) { PC.wait = Math.max(0, PC.wait - dt); puff(piece.position.x, piece.position.y + 0.05, piece.position.z, 0xdddddd, Math.random() < dt * 8 ? 1 : 0); } else if (PC.to && !(drag && drag.kind === 'piece') && !slide) { piece.position.lerp(PC.to, Math.min(1, dt * 7)); if (PC.rot) { piece.rotation.x = damp(piece.rotation.x, PC.rot.x, 8, dt); piece.rotation.y = damp(piece.rotation.y, PC.rot.y, 8, dt); piece.rotation.z = damp(piece.rotation.z, PC.rot.z, 8, dt); } }
      const glow = Math.max(0, pieceM.emissiveIntensity - dt * 0.6); pieceM.emissiveIntensity = engM.emissiveIntensity = glow; const sh = C ? C.pol.shine : 1;
      pieceM.color.copy(DULL).lerp(BRIGHT, s === 'serve' || !C ? 1 : sh).lerp(HOT, Math.min(1, glow * 0.6)); engM.color.copy(pieceM.color);
      if (C && piece.userData.kind === 'ring') piece.scale.y = damp(piece.scale.y, 0.82 + 0.18 * Math.min(1, C.ham.n / Math.max(1, C.spec.hits) + (C.steps.includes('hammer') ? 0 : 1)), 8, dt);
      piece.userData.prongs.forEach(pv => { pv.rotation.z = damp(pv.rotation.z, pv.userData.a ? 0.45 : -0.7, 12, dt); });
      if (C && s === 'serve' && C.pol.shine >= 1 && Math.random() < dt * 3) spark(piece.position.clone().add(V3(rr(-0.05, 0.05), rr(0, 0.08), rr(-0.04, 0.04))), 0xffffff, 1, 0.07); }
    if (slide) { slide.t += dt / 0.55; const k = Math.min(1, slide.t); piece.position.lerpVectors(slide.from, slide.to, smooth(0, 1, k)); if (k >= 1) { const o = slide.o; slide = null; if (o.st === 'wait') serve(o); else placeFor('serve'); } }
    // hammer swing + the beat rings
    if (HS.t < 1) { HS.t = Math.min(1, HS.t + dt * 7); K.hammer.rotation.z = -0.6 + 0.74 * Math.sin(HS.t * Math.PI); } else K.hammer.rotation.z = damp(K.hammer.rotation.z, -0.6 + (C && s === 'hammer' && C.ham.t >= 0 ? -0.25 * (C.ham.t / beatPer()) : 0), 6, dt);
    const beatOn = C && s === 'hammer' && atMandrel() && C.ham.t >= 0; beatMark.visible = beatRing.visible = !!beatOn;
    if (beatOn) { const top = piece.position.clone().add(V3(0, 0.1, 0)), sc = beatScale(), ok = Math.abs(sc - 1) <= beatWin(); beatMark.position.copy(top); beatRing.position.copy(top); beatMark.scale.setScalar(0.07); beatRing.scale.setScalar(0.07 * sc); beatRing.material.color.set(ok ? '#22c55e' : '#ffffff'); }
    // tray stones: bounce on a wrong pick, drift home after a drag
    trayGems.forEach(g => { const u = g.userData; g.rotation.y += dt * 1.2; if (u.bounce > 0) { u.bounce = Math.max(0, u.bounce - dt * 2.5); g.position.y = u.home.y + Math.abs(Math.sin(u.bounce * Math.PI * 2)) * 0.05; } else if (u.back && !(drag && drag.id === u.id)) { g.position.lerp(u.home, Math.min(1, dt * 8)); if (g.position.distanceTo(u.home) < 0.002) u.back = 0; } });
  }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) tick(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onKD = e => { if (S.phase !== 'walk') return; if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.code === 'KeyE') { e.preventDefault(); api.talk(); return; } if (e.code === 'Digit1') { wave(); return; } if (e.code === 'Digit2') { sitToggle(); return; } if (e.code === 'Space') { e.preventDefault(); hop(); return; } W.keys.add(e.code); },
    onKU = e => W.keys.delete(e.code), onBlur = () => W.keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- HUD state for the page ----------
  function pressInfo() { if (!C || S.phase !== 'shift' || S.react || S.pay) return null; const s = step(), sp = C.spec, bar = (label, v, lo, hi, state, max = 100) => ({ label, v: clamp(v / max, 0, 1), lo: lo / max, hi: hi / max, state, ok: v >= lo && v <= hi, over: v > hi });
    if (s === 'melt') { const Mt = C.melt; if (Mt.nug < sp.nug) return { title: 'MELT ' + sp.nug + ' NUGGETS', sub: 'TAP THE NUGGET DISH · ONE TAP = ONE NUGGET', bars: [bar('NUGGETS', Mt.nug, sp.nug - 0.4, sp.nug + 0.4, Mt.nug + ' / ' + sp.nug, sp.nug + 2)] };
      return { title: 'MELT IT', sub: 'SLIDE UP + DOWN TO PUMP · STOP WHEN THE HEAT IS GREEN', bars: [bar('HEAT', Mt.heat, HEAT[0], HEAT[1], Mt.heat < HEAT[0] ? 'WARMING' : Mt.heat <= HEAT[1] ? 'MOLTEN' : Mt.heat > 92 ? 'BOILING' : 'TOO HOT'), bar('MELT', Mt.prog * 100, 100, 100, Math.round(Mt.prog * 100) + '%')], depth: Mt.p, depthTop: 'OPEN ↑', depthBot: 'PUSH ↓' }; }
    if (s === 'pour') { const f = C.pour.fill * 100; return { title: 'POUR TO THE LINE', sub: 'DRAG DOWN TO TIP · FURTHER = FASTER · LET GO AT THE LINE', bars: [bar('FILL', f, 90, 104, f < 90 ? (f < 2 ? 'EMPTY' : 'LOW') : f <= 104 ? 'ON THE LINE' : 'OVER', 115), bar('TIP', C.pour.tilt * 100, -1, -1, C.pour.tilt > 0.6 ? 'FLOOD' : C.pour.tilt > 0.05 ? 'TRICKLE' : 'LEVEL')] }; }
    if (s === 'hammer') { const H = C.ham; return { title: 'HAMMER IT ROUND', sub: 'TAP WHEN THE WHITE RING MEETS THE GOLD ONE', bars: [bar('STRIKES', H.n, sp.hits - 0.4, sp.hits + 0.4, H.n + ' / ' + sp.hits, sp.hits), bar('LAST', H.last == null ? 0 : H.last, 90, 100, H.last == null ? '–' : H.last >= 90 ? 'PERFECT' : H.last >= 60 ? 'GOOD' : 'OFF')] }; }
    if (s === 'gem') { const G = C.gem, g = GEMS[sp.gem]; return G.placed ? { title: 'CLOSE THE PRONGS', sub: 'TAP ANYWHERE · ONE TAP PER PRONG', bars: [bar('PRONGS', G.prongs, 3.6, 4.4, G.prongs + ' / 4', 4)] } : { title: 'SET A ' + g.name, sub: g.name + ' IS ' + g.shape.toUpperCase() + ' · TAP IT, OR DRAG IT ONTO THE PIECE', bars: [], gem: { name: g.name, col: g.col, shape: g.shape } }; }
    if (s === 'engrave') { const E = C.eng, avg = E.n ? E.dev / E.n : 0; return { title: 'ENGRAVE THE Z', sub: 'TRACE THE DOTTED LINE · TOP LEFT → RIGHT → DOWN → RIGHT', bars: [bar('TRACE', E.prog / 3 * 100, 97, 100, Math.round(E.prog / 3 * 100) + '%'), bar('STEADY', 100 - avg * 140, 75, 100, avg < 0.1 ? 'STEADY' : avg < 0.18 ? 'WOBBLY' : 'SHAKY')] }; }
    if (s === 'polish') { const Pl = C.pol, [lo, hi] = spdBand(), sv = clamp(Pl.spd / (hi * 1.4), 0, 1) * 100; return { title: 'POLISH TILL IT SHINES', sub: 'RUB BACK AND FORTH · STEADY, NOT TOO FAST', bars: [bar('SHINE', Pl.shine * 100, 100, 100, Math.round(Pl.shine * 100) + '%'), bar('SPEED', sv, lo / (hi * 1.4) * 100, 100 / 1.4, Pl.spd < 5 ? 'STILL' : Pl.spd > hi ? 'TOO FAST' : Pl.spd < lo ? 'SLOW' : 'STEADY'), ...(Pl.warm > 0.05 ? [bar('HEAT', Pl.warm * 100, 0, 60, Pl.warm > 0.6 ? 'SMEARING' : 'WARM')] : [])] }; }
    return null; }
  function coachInfo() { if (S.phase !== 'shift' || !C || S.touched || DM.on || S.react || S.pay || slide || CAM.t < 1) return null; const s = step(), at = p => { const q = scr(p); return { x: Math.round(q.x), y: Math.round(q.y) }; };
    if (s === 'melt') { if (C.melt.nug < C.spec.nug) return { kind: 'tap', ...at(V3(K.nugDish.x, K.nugDish.y + 0.05, K.nugDish.z)), label: 'TAP ×' + C.spec.nug }; return { kind: 'updown', ...at(K.bellowsHandle()), label: 'PUMP', up: 'OPEN', down: 'PUSH' }; }
    if (s === 'pour') { if (!cruReady()) return null; return { kind: 'down', ...at(V3(cru.position.x, cru.position.y + 0.15, cru.position.z)), label: 'DRAG DOWN' }; }
    if (s === 'hammer') { if (!atMandrel()) return null; return { kind: 'tap', ...at(piece.position.clone().add(V3(0, 0.068, 0))), label: 'TAP ON THE BEAT' }; }
    if (s === 'gem') { if (C.gem.placed) return { kind: 'tap', ...at(piece.localToWorld(piece.userData.gemAt.clone())), label: 'TAP ×4' }; const g = trayGems.find(q => q.userData.id === C.spec.gem); if (!g || !piece) return null; const a = at(g.position), b = at(piece.localToWorld(piece.userData.gemAt.clone())); return { kind: 'drag', ...a, dx: b.x - a.x, dy: b.y - a.y, label: 'TAP OR DRAG' }; }
    if (s === 'engrave') { if (!piece || PC.wait || CAM.t < 1) return null; const c = at(plateC()), pts = ZP.map(q => { const w = at(zWorld(q)); return [w.x - c.x, w.y - c.y]; }); return { kind: 'path', ...c, pts, label: 'TRACE THE Z' }; }
    if (s === 'polish') { if (!piece) return null; return { kind: 'rub', ...at(piece.position), label: 'RUB · STEADY' }; }
    if (s === 'serve') { const o = orders.find(q => q.id === C.oid && q.st === 'wait'); if (!o || !piece) return null; const a = at(piece.position), b = at(V3(o.f.position.x, 1.3, o.f.position.z)); return { kind: 'drag', ...a, dx: b.x - a.x, dy: b.y - a.y, label: 'SLIDE' }; }
    return null; }
  function hud() {
    const ticket = o => { const d = PZ(o.piece), sp = o.spec, lines = [{ t: d.name, k: 'name' }, { t: 'GOLD · ' + sp.nug + ' NUGGETS', k: 'gold' }]; if (sp.gem) lines.push({ t: '+ ' + GEMS[sp.gem].name + ' · ' + GEMS[sp.gem].shape.toUpperCase(), k: 'gem', col: GEMS[sp.gem].col }); if (d.plate) lines.push({ t: '+ ENGRAVE THE Z', k: 'extra' });
      return { id: o.id, name: custName(o.ci), role: CUSTOMERS[o.ci].role, lines, short: d.name.replace('ZION ', '') + ' · ' + sp.nug + 'N' + (sp.gem ? ' · ' + GEMS[sp.gem].name : ''), total: o.total, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait', making: !!(C && C.oid === o.id) }; };
    const s = step(), steps = C ? C.steps.map(x => ({ id: x, label: STEP_INFO[x].label, done: C.steps.indexOf(x) < C.i, now: x === s, score: C.scores[{ melt: 'Melt', pour: 'Pour', hammer: 'Hammer', gem: 'Stone', engrave: 'Engrave', polish: 'Polish' }[x]] })) : [];
    const stDone = id => C ? C.steps.filter(x => STEP_INFO[x].st === id).every(x => C.steps.indexOf(x) < C.i) && C.steps.some(x => STEP_INFO[x].st === id) : false, stHas = id => C ? C.steps.some(x => STEP_INFO[x].st === id) : false;
    const badges = {}; ['forge', 'anvil', 'bench', 'counter'].forEach(id => { badges[id] = !C ? '' : s && STEP_INFO[s].st === id ? 'NOW' : stDone(id) ? '✓' : stHas(id) ? '' : '—'; }); badges.all = waiting().length ? waiting().length + ' WAIT' : '';
    const card = C ? { who: custName(C.ci), piece: PZ(C.piece).name, avg: avgScore(), rows: Object.entries(C.scores).map(([k, v]) => ({ k: k.toUpperCase(), v })), notes: C.notes.slice(-2) } : null;
    const walk = S.phase === 'walk' ? { prompt: W.prompt, dialog: dlgHud(), toast: W.toast || null, sitting: !!W.sit, hired: !!save.flag(SAVE.hired) } : null;
    return { phase: S.phase, mode: S.mode, day: S.day, left: Math.max(0, GOLDWORKS.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), steps, card, step: s || null, press: pressInfo(),
      pay: S.pay ? { ...S.pay } : null, flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, uniform: !!save.flag(SAVE.uniform), hired: !!save.flag(SAVE.hired), pieces: save.stat(SAVE.pieces, 0),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: avail().map(r => ({ name: r.name, price: r.price })), stones: gemsAvail().map(k => GEMS[k].name), demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null, focus: S.focus,
      hint: HINT && HINT.text && !S.react && S.phase === 'shift' ? { text: HINT.text, station: HINT.station } : null, react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip, score: S.react.score, binned: !!S.react.binned } : null,
      badges, fade: S.fade, walk, keeper: GOLDWORKS.keeper, coach: coachInfo(), muted: !!audio.muted }; }
  function emit() { onState(hud()); }
  drawEng(); if (S.phase === 'intro') placeGreeter(); else { seatPatrons(); ben.visible = false; benW.position.set(K.door.x, 0, K.door.z - 0.8); benW.rotation.y = Math.PI; }
  if (S.phase === 'intro') { const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); }
  frame();
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setFocus, demoStart, demoStop, startShift, endShift, giveCoin, buyUpgrade, hud, toIntro() { toIntro(); }, toWalk, setPaused(v) { PAUSE = !!v; },
    pickOrder(id) { const o = orders.find(q => q.id === id && q.st === 'wait'); if (!o || !C || C.oid === id || C.i > 0 || C.melt.nug > 0) return; startPiece(o); },
    // ---- Game HUD engine contract (walk mode) ----
    start() { audioOn(); }, talk() { audioOn(); if (S.phase !== 'walk') return; if (W.D) { dlgNext(); return; } if (W.target) openTalk(W.target.key); }, choose(i) { dlgChoose(i); }, closeDialog() { closeTalk(); }, nextLine() { dlgNext(); }, clearToast() { W.toast = ''; },
    melee() { wave(); }, range() { sitToggle(); }, jump() { hop(); }, meleeUp() {}, useItem() { W.toast = 'SAVE IT · AUREL SAYS NO SNACKS NEAR THE STONES'; W.toastT = 2; }, closeWheel() {}, skipTime() {}, setHudPad() {}, setStick(x, y) { if (x || y) audioOn(); W.stick.x = x; W.stick.y = y; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 6, pitch: 0.6 }; }, setCam() {}, setMinimap() {}, toggleSound() { audioOn(); audio.setMuted && audio.setMuted(!audio.muted); if (audio.muted) holdStop(); return audio.muted; }, cycleWeather() {},
    mapData() { const p = benW.position; return { p: [p.x, p.z, benW.rotation.y], b: [['COUNTER', 0, KZ], ['DOOR', K.door.x, K.door.z], ['FORGE', K.forge.x, K.forge.z], ['CASES', 0, 1.9]], f: regulars.map(r => [r.f.position.x, r.f.position.z]), e: [], q: [aurel.position.x, aurel.position.z, 'AUREL'] }; },
    _order(id, gem) { S.forcePiece = id; newOrder(); S.forcePiece = null; const o = orders[orders.length - 1]; if (o) { if (gem) o.spec.gem = gem; o.total = priceOf(o); o.f.position.set(K.spots[o.spot].x, 0, K.spots[o.spot].z + 0.03); } return o && o.id; }, _sim(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, GOLDWORKS.shift - t); }, _state: () => S, _piece: () => C, _W: W, _orders: orders,
    _bank: () => ({ loaded: Object.keys(BANK.buf).length, music: BANK.musicName, ctx: !!audio.ctx }), _scene: () => scene, _dbg() { return { cam: camera.position.toArray().map(v => +v.toFixed(2)), look: CAM.look.toArray().map(v => +v.toFixed(2)), safe: { ...SAFE }, focus: S.focus }; }, _auto() { return { tapNug, bellowsTo, pourDone, hammerHit, pickGem, prongTap, engPt, rub, slideTo, waiting, scr, K, get piece() { return piece; }, benW, camera, beatScale, zAt, atMandrel, cruReady }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); holdStop(); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
