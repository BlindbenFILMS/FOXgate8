// 8 GATES — KUFA · RAFIQ'S SPY SHOP [kufaSpyShop]. Ben works for RAFIQ ("Quiet Trade") in the dim front room of the Kufa spy shop; the training room hides behind the FALSE BOOKCASE.
// A job location (the Boatworks recipe): clients come in one at a time with an item + a job card. No clock, scored on quality → stars, pay + tips. 3 clients = a day.
// Skills, one touch gesture each:
//   LOCK  · hold the TENSION pad with one thumb, push the pins up with the other until each one clicks at the shear line (find the stiff one; push too far = overset)
//   SAFE  · circle a thumb to turn the dial, listen for the click, let go (or turn back) to keep the number; 3 numbers R-L-R, then pull the handle
//   CODE  · rub the UV lamp over the note to show the hidden ink, turn the cipher wheel until the note reads, LOCK IN
//   SWEEP · wave the bug wand over the item, follow the beeps, tap the bug to pull it out
//   LASER · drag ANYWHERE to move the glove (relative, so your thumb never hides it), slip through the gaps, grab the order, bring it back out. DUST shows faint beams.
// TRAINING first: Rafiq teaches each skill in the back room before it can show up on real jobs. Uniform (after day 1): long navy coat, brass K pin, red fez.
// WALK: when not working the player can walk the whole shop (tap the floor, or WASD); the bookcase swings open as you get near it.
// Save keys kufa.spy.*, flag spyUniform. MERGE: buildSpyShop(ctx) builds the interior at an origin (walk data in Y.walk, spots in Y.spots, Y.update(dt, t) animates it);
// createSpyShop({ container, onState }) runs it stand-alone and returns the API the page calls.
import * as THREE from '../../vendor/three/three.module.js';
import { clamp, damp, smooth } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings } from '../../engine/restaurant-kit.js';

const R = (a, b) => a + Math.random() * (b - a), P = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const TAU = Math.PI * 2, wrapA = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
const vib = n => { try { navigator.vibrate && navigator.vibrate(n); } catch (e) {} };
const LET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const SPYSHOP = { name: "RAFIQ'S SPY SHOP", room: 'kufaSpyShop', perDay: 3 };
// Everything a world needs to wire this room in (coordinates are LOCAL to the origin you pass to buildSpyShop; +z = toward the front door).
// 2D note: in Planet Kufa build 042 the door signed SPY is lobby key 'item-shop' and leads to room kufaSpyShop (the keys are swapped there); keep the room name.
export const SPYSHOP_MERGE = { room: 'kufaSpyShop', label: 'Spy Shop', world: 'kufa', from: { room: 'kufaTownSquare', sign: 'SPY', lobbyKey: 'item-shop' },
  spawn: { x: 0, z: 3.0, facing: Math.PI }, exit: { x: 0, z: 3.45, r: 0.95, to: 'kufaTownSquare', label: 'TO KUFA TOWN SQUARE' }, size: { w: 10.4, d: 8.4, backRoom: { x: -2.85, z: -6.25, w: 4.8, d: 4.6 }, h: 3.4 },
  npc: { key: 'kufaSpy', name: 'Rafiq', title: 'Quiet Trade', at: { x: -1.15, z: -1.85 }, greeting: 'Look at what you like. Ask about nothing you see.' },
  page: 'Kufa Spy Shop.dc.html', deepLinks: ['?start=work', '?start=train', '?start=walk', '?start=lesson:lock', '?start=demo'], music: 'KUFA/KUFA-spy.mp3',
  save: { stats: 'kufa.spy.day / best / stars / upg.<id> / lesson.<skill>', flags: ['spyUniform'] } };
export const SKILLS = {
  lock: { label: 'LOCK', name: 'Pick the lock', teach: 'Thumb on the wrench, gently. Then lift each pin until one fights back. That is the one.' },
  safe: { label: 'SAFE', name: 'Crack the safe', teach: 'Turn slowly and listen. The click is the number. Let go on it, then turn the other way.' },
  code: { label: 'CODE', name: 'Read the secret note', teach: 'Ink you cannot see is still ink. Lamp first, then the wheel.' },
  sweep: { label: 'SWEEP', name: 'Sweep for bugs', teach: 'Every bug sings. Wave the wand and follow the song.' },
  laser: { label: 'LASER', name: 'Beat the laser case', teach: 'Light is a fence. Find the gaps, take the order, come back out the way you went in.' } };
export const SKILL_ORDER = ['lock', 'safe', 'code', 'sweep', 'laser'];
export const ITEMS = {
  case: { name: 'LOCKED CASE', main: 'lock', extra: ['sweep', 'code'], price: 14, obj: 'case', lines: ['Lost the key. Do not ask what is inside.', 'It came off a caravan cart. Open it gently.', 'My uncle left it. Nobody has the key.'] },
  box: { name: 'STRONGBOX', main: 'safe', extra: ['code', 'sweep'], price: 16, obj: 'box', lines: ['My grandfather\'s strongbox. He took the numbers with him.', 'It came from the way station. The numbers did not.'] },
  lamp: { name: 'BRASS LAMP', main: 'sweep', extra: [], price: 10, obj: 'lamp', lines: ['I think my lamp is listening to me.', 'Somebody knows what I said in my own kitchen.'] },
  radio: { name: 'OLD RADIO', main: 'sweep', extra: [], price: 10, obj: 'radio', lines: ['My radio hums when nobody is playing it.', 'It was a gift. From someone I do not trust.'] },
  pot: { name: 'COFFEE POT', main: 'sweep', extra: [], price: 10, obj: 'pot', lines: ['A guest left me this coffee pot. It ticks.', 'A gift from the plated coat. I do not want his ears in my house.'] },
  note: { name: 'CODED SLIP', main: 'code', extra: [], price: 12, obj: 'note', lines: ['A slip came under my door. I cannot read it.', 'Found this in a camel bag. Read it for me?'] },
  vault: { name: 'GLASS CASE ORDER', main: 'laser', extra: ['lock'], price: 14, obj: null, lines: ['Rafiq says my order is in the glass case.', 'I paid already. It is behind the lights.'] } };
const NEEDS = { case: { code: 'lock' }, box: { code: 'safe' } };
const MESSAGES = ['WATER IS GOLD', 'MEET AT THE OASIS', 'THE PAD AT DAWN', 'TRUST THE CAMEL WOMAN', 'CHECK THE TALLY BOARD', 'THE PLATED COAT LIES', 'THE BERTH IS OFF WORLD', 'GO IN DAYLIGHT', 'ASK ABOUT NOTHING', 'TWO LEGS WEST', 'THE COIN LOOKS WRONG', 'BURN THIS SLIP'];
const PRIZES = [{ name: 'SIGNAL CELL', k: 'cell' }, { name: 'SEALED PACKAGE', k: 'pack' }, { name: 'UNMARKED KEY', k: 'key' }, { name: 'DESERT RUBY', k: 'gem' }];
export const UPGRADES = [
  { id: 'picks', name: 'PRO PICK SET', cost: 40, line: 'Pins set in a wider window.' },
  { id: 'stetho', name: 'BRASS STETHOSCOPE', cost: 35, line: 'Hear the safe click from further away.' },
  { id: 'uv', name: 'STRONG UV LAMP', cost: 30, line: 'Hidden ink shows in half the rubbing.' },
  { id: 'wand', name: 'LONG-RANGE WAND', cost: 35, line: 'The bug wand hears from further away.' },
  { id: 'gloves', name: 'SILK GLOVES', cost: 40, line: 'A slimmer hand slips between the beams.' },
  { id: 'tea', name: 'MINT TEA SAMOVAR', cost: 60, line: 'Clients tip 25% more.' }];
const PELT = { amber: ['#f8ab52', '#d9822b'], sandy: ['#e8bc80', '#b4823e'], rust: ['#c9622e', '#8a3a16'], ginger: ['#ee8a3c', '#b0541c'], grey: ['#b8b4ac', '#7c7870'], dark: ['#8c5a3a', '#5a3420'] };
// Kufa names + colours from the 2D world file (uploads/ Planet Kufa build 042)
export const CLIENTS = [
  { name: 'HADI', pelt: 'sandy', torso: ['#d8b98a', '#a8843f', '#5a4218'], outfit: 'vest' }, { name: 'ZOHRA', pelt: 'rust', torso: ['#e6c884', '#b8912f', '#5f4a10'], outfit: 'dress' },
  { name: 'NASRIN', pelt: 'ginger', torso: ['#e0a48a', '#b06848', '#5e2f1c'], outfit: 'dress' }, { name: 'JAMIL', pelt: 'sandy', torso: ['#f2b7c6', '#d4879c', '#43301c'], outfit: 'vest' },
  { name: 'SURA', pelt: 'amber', torso: ['#d8b98a', '#a8843f', '#5a4218'], outfit: 'robe' }, { name: 'JIBRIL', pelt: 'dark', torso: ['#8c4a2a', '#5a2f18', '#43301c'], outfit: 'coat' },
  { name: 'GHAZI', pelt: 'ginger', torso: ['#8fa8e0', '#4a5fa8', '#1e2450'], outfit: 'coat' }, { name: 'SAHAR', pelt: 'grey', torso: ['#4f6f7a', '#2f4750', '#16242a'], outfit: 'coat' },
  { name: 'DAHAB', pelt: 'rust', torso: ['#e0a48a', '#b06848', '#5e2f1c'], outfit: 'robe' }, { name: 'BASHIR', pelt: 'grey', torso: ['#8fa3ab', '#5b6f78', '#2c3a41'], outfit: 'vest' }];
const SAVE = { day: 'kufa.spy.day', best: 'kufa.spy.best', upg: 'kufa.spy.upg.', stars: 'kufa.spy.stars', lesson: 'kufa.spy.lesson.' };
const RAFIQ_LINES = ['Look at what you like. Ask about nothing you see.', 'The trade is not the shelves.', 'Nobody looks twice at you. That is a thing I cannot buy.', 'Go in daylight. Always.', 'I do not do credit.', 'Correct. Good.'];
const LOOKS = { shelf: 'SIGNAL CELL 16g · SEALED PACKAGE 26g. Rafiq: "Look at what you like."', case: 'Red light in a glass case. Rafiq keeps the paid orders in there.', door: 'The bead curtain opens onto KUFA TOWN SQUARE.' };

// ======================= THE SHOP INTERIOR (merge-ready) =======================
export function buildSpyShop(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, grad } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const Y = { root, front: [], backWall: [], lights: [], flames: [], H: 3.4, dim: 1, red: 0 }, H = Y.H;
  const T = (w, h, f, rep) => { const t = CTX(w, h, f); if (rep) { t.wrapS = t.wrapT = T3.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const TM = t => new T3.MeshToonMaterial({ map: t, gradientMap: grad });
  const C = { wood: toon('#6a4226'), woodD: toon('#3f2614'), brass: toon('#c9a24a'), brassL: toon('#e6c26a'), ink: toon('#201e1d'), navy: toon('#1e2450'), blue: toon('#4a5fa8'), cream: toon('#f2e6cc'), red: toon('#b8202a'), clay: toon('#b8683e'), steel: toon('#5a6670'), green: toon('#2f5a3a'), white: toon('#fbf8ec'), leather: toon('#6b3a1e') };
  Y.C = C;
  const sandDraw = c => { c.fillStyle = '#d4ad78'; c.fillRect(0, 0, 256, 256); for (let r = 0; r < 8; r++) { const y = r * 32, off = r % 2 ? 32 : 0; c.fillStyle = r % 3 ? '#cfa670' : '#d9b582'; c.fillRect(0, y, 256, 30); c.fillStyle = '#a8804c'; c.fillRect(0, y + 30, 256, 2); for (let x = off; x < 256; x += 64) c.fillRect(x, y, 2, 30); } for (let i = 0; i < 220; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(120,80,40,0.18)' : 'rgba(255,240,210,0.2)'; c.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } };
  const sandMs = new Map(), sandM = (a, b) => { const k = Math.round(a) + 'x' + Math.round(b); if (!sandMs.has(k)) sandMs.set(k, TM(T(256, 256, sandDraw, [Math.max(1, a / 2.4), Math.max(1, b / 2.4)]))); return sandMs.get(k); };
  const wall = (x0, z0, x1, z1, y0 = 0, y1 = H, list) => { const w = Math.max(0.22, Math.abs(x1 - x0)), d = Math.max(0.22, Math.abs(z1 - z0)), h = y1 - y0, m = M(new T3.BoxGeometry(w, h, d), sandM(Math.max(w, d), h), (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, root, 0.012); m.castShadow = false; if (list) list.push(m); return m; };
  const tileDraw = c => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const a = (x + y) % 2; c.fillStyle = a ? '#a85c36' : '#dcc08c'; c.fillRect(x * 64, y * 64, 64, 64); c.fillStyle = a ? '#8e4a2a' : '#c4a472'; c.beginPath(); c.moveTo(x * 64 + 32, y * 64 + 10); c.lineTo(x * 64 + 54, y * 64 + 32); c.lineTo(x * 64 + 32, y * 64 + 54); c.lineTo(x * 64 + 10, y * 64 + 32); c.closePath(); c.fill(); } c.fillStyle = '#4a2e1a'; for (let i = 0; i <= 4; i++) { c.fillRect(i * 64 - 1, 0, 2, 256); c.fillRect(0, i * 64 - 1, 256, 2); } };
  const floor = (w, d, x, z) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, d), TM(T(256, 256, tileDraw, [w / 1.6, d / 1.6]))); m.rotation.x = -Math.PI / 2; m.position.set(x, 0, z); m.receiveShadow = true; root.add(m); return m; };
  floor(10.4, 8.4, 0, 0); floor(4.8, 4.6, -2.85, -6.25);
  // walls: front room (the front wall + door are cut away when the camera is inside), back room behind the bookcase
  wall(-5.1, -4.1, -5.1, 4.1); wall(5.1, -4.1, 5.1, 4.1);
  wall(-5.2, 4.1, -0.85, 4.1, 0, H, Y.front); wall(0.85, 4.1, 5.2, 4.1, 0, H, Y.front); wall(-0.85, 4.1, 0.85, 4.1, 2.5, H, Y.front);
  wall(-5.2, -4.1, -3.4, -4.1, 0, H, Y.backWall); wall(-1.6, -4.1, 5.2, -4.1, 0, H, Y.backWall); wall(-3.4, -4.1, -1.6, -4.1, 2.55, H, Y.backWall);
  wall(-5.1, -4.1, -5.1, -8.4); wall(-0.55, -4.1, -0.55, -8.4); wall(-5.2, -8.4, -0.45, -8.4);
  // blue + brass zellige band along the walls
  const zel = T(256, 32, c => { c.fillStyle = '#1e3a6a'; c.fillRect(0, 0, 256, 32); for (let i = 0; i < 8; i++) { const x = i * 32 + 16; c.fillStyle = i % 2 ? '#e6c26a' : '#f2e6cc'; c.beginPath(); c.moveTo(x, 4); c.lineTo(x + 12, 16); c.lineTo(x, 28); c.lineTo(x - 12, 16); c.closePath(); c.fill(); c.fillStyle = '#2f9a8f'; c.fillRect(x - 3, 13, 6, 6); } c.fillStyle = '#c9a24a'; c.fillRect(0, 0, 256, 3); c.fillRect(0, 29, 256, 3); });
  const band = (x0, z0, x1, z1, list) => { const len = Math.hypot(x1 - x0, z1 - z0), t = zel.clone(); t.needsUpdate = true; t.wrapS = T3.RepeatWrapping; t.repeat.set(len / 1.6, 1); const m = new T3.Mesh(new T3.PlaneGeometry(len, 0.22), new T3.MeshToonMaterial({ map: t, gradientMap: grad })); m.position.set((x0 + x1) / 2, 1.12, (z0 + z1) / 2); m.rotation.y = Math.atan2(-(z1 - z0), x1 - x0); root.add(m); if (list) list.push(m); return m; };
  band(-4.98, -3.98, -3.42, -3.98, Y.backWall); band(-1.58, -3.98, 4.98, -3.98, Y.backWall); band(-4.98, 3.9, -4.98, -3.9); band(4.98, -3.9, 4.98, 3.9);
  band(-4.98, -8.28, -0.67, -8.28); band(-4.98, -4.22, -4.98, -8.2); band(-0.67, -8.2, -0.67, -4.22);
  const plate = (w, h, draw, cw = 512, ch = 128) => new T3.Mesh(new T3.PlaneGeometry(w, h), new T3.MeshBasicMaterial({ map: CTX(cw, ch, draw), transparent: true }));
  const textPlate = (txt, w, h, bg, fg, font = 900, cw = 1024, ch = 160) => plate(w, h, c => { c.fillStyle = bg; c.fillRect(0, 0, cw, ch); c.strokeStyle = '#c9a24a'; c.lineWidth = 10; c.strokeRect(5, 5, cw - 10, ch - 10); c.fillStyle = fg; let fs = ch * 0.5; c.font = font + ' ' + fs + 'px Archivo, Arial'; while (c.measureText(txt).width > cw - 60 && fs > 10) { fs -= 2; c.font = font + ' ' + fs + 'px Archivo, Arial'; } c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, cw / 2, ch / 2 + 4); }, cw, ch);
  const crestT = CTX(256, 256, c => { c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(128, 128, 124, 0, 7); c.fill(); c.fillStyle = '#8a6a2a'; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.fill(); c.fillStyle = '#e6c26a'; c.font = '900 150px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K', 128, 138); });
  const crest = (x, y, z, r, par = root, ry = 0) => { const m = new T3.Mesh(new T3.CircleGeometry(r, 32), new T3.MeshToonMaterial({ map: crestT, gradientMap: grad, transparent: true })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };

  // ---------- the counter ----------
  const woodT = T(128, 128, c => { c.fillStyle = '#6a4226'; c.fillRect(0, 0, 128, 128); for (let i = 0; i < 40; i++) { c.strokeStyle = i % 2 ? 'rgba(40,20,10,0.35)' : 'rgba(150,100,60,0.3)'; c.lineWidth = 1 + Math.random() * 2; c.beginPath(); const y = Math.random() * 128; c.moveTo(0, y); c.bezierCurveTo(40, y + R(-6, 6), 90, y + R(-6, 6), 128, y); c.stroke(); } });
  const woodM = TM(woodT);
  M(new T3.BoxGeometry(4.5, 0.95, 0.72), woodM, 0.5, 0.475, -0.9, root, 0.02);
  M(new T3.BoxGeometry(4.66, 0.07, 0.86), C.woodD, 0.5, 0.985, -0.9, root, 0.015);
  M(new T3.BoxGeometry(4.68, 0.03, 0.03), C.brass, 0.5, 0.95, -0.47, root, 0);
  for (let i = 0; i < 4; i++) { M(new T3.BoxGeometry(0.92, 0.58, 0.02), C.woodD, -1.15 + i * 1.1, 0.47, -0.535, root, 0.006); for (const [dx, dy] of [[-0.4, 0.24], [0.4, 0.24], [-0.4, -0.24], [0.4, -0.24]]) M(new T3.SphereGeometry(0.018, 6, 4), C.brass, -1.15 + i * 1.1 + dx, 0.47 + dy, -0.52, root, 0); }
  crest(0.5, 0.5, -0.52, 0.2);
  M(new T3.BoxGeometry(1.3, 0.008, 0.5), C.green, 0.45, 1.024, -0.95, root, 0);
  { const bell = new T3.Group(); bell.position.set(-1.35, 1.02, -0.72); root.add(bell); M(new T3.SphereGeometry(0.07, 14, 8, 0, TAU, 0, Math.PI / 2), C.brassL, 0, 0.01, 0, bell, 0.006); M(new T3.CylinderGeometry(0.08, 0.08, 0.015, 14), C.woodD, 0, 0.005, 0, bell, 0.004); M(new T3.SphereGeometry(0.015, 6, 4), C.brassL, 0, 0.085, 0, bell, 0); }
  { const card = textPlate('SIGNAL CELL 16g · SEALED PACKAGE 26g', 0.8, 0.13, '#1e2450', '#f2e6cc', 800); card.position.set(2.45, 1.12, -0.6); card.rotation.set(-0.3, -0.25, 0); root.add(card); M(new T3.BoxGeometry(0.8, 0.13, 0.01), C.brass, 2.45, 1.11, -0.615, root, 0).rotation.set(-0.3, -0.25, 0); }
  // ---------- shelves of gadgets (back wall, front room) ----------
  const shelf = new T3.Group(); root.add(shelf); Y.backWall.push(shelf);
  for (const x of [-1.38, 1.88]) M(new T3.BoxGeometry(0.08, 2.5, 0.44), C.woodD, x, 1.25, -3.78, shelf, 0.01);
  for (const y of [0.88, 1.53, 2.18]) M(new T3.BoxGeometry(3.3, 0.06, 0.44), woodM, 0.25, y, -3.78, shelf, 0.01);
  M(new T3.BoxGeometry(3.3, 0.06, 0.44), woodM, 0.25, 0.03, -3.78, shelf, 0.01); M(new T3.BoxGeometry(3.26, 0.82, 0.04), C.woodD, 0.25, 0.44, -3.98, shelf, 0);
  const gadget = (k, x, y, z, par = shelf, s = 1) => { const g = new T3.Group(); g.position.set(x, y, z); g.scale.setScalar(s); par.add(g); const m = (geo, mat, a = 0, b = 0, c = 0, o = 0.005) => M(geo, mat, a, b, c, g, o);
    if (k === 'bino') { for (const sx of [-1, 1]) { m(new T3.CylinderGeometry(0.042, 0.048, 0.15, 10), C.ink, sx * 0.05, 0.05, 0).rotation.x = Math.PI / 2; m(new T3.CylinderGeometry(0.035, 0.035, 0.01, 10), toon('#6fb7d8'), sx * 0.05, 0.05, 0.078, 0).rotation.x = Math.PI / 2; } m(new T3.BoxGeometry(0.06, 0.02, 0.05), C.brass, 0, 0.06, 0); }
    else if (k === 'cam') { m(new T3.BoxGeometry(0.2, 0.12, 0.08), C.ink, 0, 0.06, 0); m(new T3.CylinderGeometry(0.035, 0.04, 0.07, 12), C.steel, 0.02, 0.06, 0.07).rotation.x = Math.PI / 2; m(new T3.BoxGeometry(0.05, 0.03, 0.04), C.brass, -0.06, 0.135, 0); }
    else if (k === 'glass') { const r = m(new T3.TorusGeometry(0.06, 0.012, 6, 18), C.brass, 0, 0.12, 0); m(new T3.CircleGeometry(0.06, 18), new T3.MeshBasicMaterial({ color: 0xbfe6f5, transparent: true, opacity: 0.45 }), 0, 0.12, 0, 0); m(new T3.BoxGeometry(0.02, 0.1, 0.02), C.woodD, 0.04, 0.03, 0).rotation.z = 0.6; r.castShadow = false; }
    else if (k === 'hat') { m(new T3.CylinderGeometry(0.075, 0.09, 0.1, 14), toon('#5a4a3a'), 0, 0.07, 0); m(new T3.CylinderGeometry(0.15, 0.15, 0.012, 18), toon('#5a4a3a'), 0, 0.02, 0); m(new T3.CylinderGeometry(0.091, 0.091, 0.025, 14), C.ink, 0, 0.035, 0, 0); }
    else if (k === 'fez') { m(new T3.CylinderGeometry(0.065, 0.08, 0.11, 14), C.red, 0, 0.055, 0); m(new T3.BoxGeometry(0.008, 0.06, 0.008), C.ink, 0.05, 0.08, 0.02, 0); }
    else if (k === 'stache') { m(new T3.BoxGeometry(0.18, 0.12, 0.01), C.cream, 0, 0.07, 0, 0.004).rotation.x = -0.2; for (const sx of [-1, 1]) m(new T3.SphereGeometry(0.035, 8, 6), C.ink, sx * 0.035, 0.075, 0.012, 0).scale.set(1.3, 0.45, 0.4); }
    else if (k === 'shades') { for (const sx of [-1, 1]) m(new T3.CylinderGeometry(0.035, 0.035, 0.01, 14), C.ink, sx * 0.045, 0.04, 0, 0).rotation.x = Math.PI / 2 - 0.3; m(new T3.BoxGeometry(0.03, 0.01, 0.01), C.ink, 0, 0.05, 0, 0); }
    else if (k === 'cell') { m(new T3.CylinderGeometry(0.03, 0.03, 0.11, 10), new T3.MeshBasicMaterial({ color: 0x5ef2ff }), 0, 0.06, 0, 0.004); m(new T3.CylinderGeometry(0.032, 0.032, 0.02, 10), C.steel, 0, 0.015, 0, 0); m(new T3.CylinderGeometry(0.032, 0.032, 0.02, 10), C.steel, 0, 0.115, 0, 0); }
    else if (k === 'pack') { m(new T3.BoxGeometry(0.16, 0.1, 0.12), toon('#a8784a'), 0, 0.05, 0); m(new T3.BoxGeometry(0.165, 0.012, 0.125), C.cream, 0, 0.1, 0, 0); m(new T3.BoxGeometry(0.012, 0.105, 0.125), C.cream, 0, 0.05, 0, 0); m(new T3.CylinderGeometry(0.02, 0.02, 0.006, 10), C.red, 0, 0.103, 0.02, 0); }
    else if (k === 'walkie') { m(new T3.BoxGeometry(0.06, 0.15, 0.04), C.ink, 0, 0.075, 0); m(new T3.CylinderGeometry(0.006, 0.006, 0.08, 4), C.ink, 0.02, 0.19, 0, 0); m(new T3.BoxGeometry(0.04, 0.03, 0.005), toon('#86d44e'), 0, 0.11, 0.022, 0); }
    else if (k === 'globe') { m(new T3.SphereGeometry(0.09, 14, 10), toon('#3f7ab8'), 0, 0.15, 0); m(new T3.TorusGeometry(0.1, 0.006, 4, 20, Math.PI), C.brass, 0, 0.15, 0, 0).rotation.z = Math.PI / 2; m(new T3.CylinderGeometry(0.05, 0.06, 0.03, 10), C.brass, 0, 0.015, 0); }
    else if (k === 'books') { for (let i = 0; i < 4; i++) m(new T3.BoxGeometry(0.05, R(0.16, 0.22), 0.16), toon(P(['#7a2a2a', '#2a4a7a', '#3f5a2a', '#6a4a8a', '#8a6a2a'])), -0.08 + i * 0.055, 0.1, 0); }
    else if (k === 'jar') { m(new T3.SphereGeometry(0.07, 10, 8), C.clay, 0, 0.07, 0); m(new T3.CylinderGeometry(0.03, 0.04, 0.05, 8), C.clay, 0, 0.15, 0); }
    else if (k === 'key') { m(new T3.TorusGeometry(0.03, 0.01, 6, 14), C.brassL, 0, 0.1, 0); m(new T3.BoxGeometry(0.012, 0.1, 0.012), C.brassL, 0, 0.04, 0, 0); m(new T3.BoxGeometry(0.03, 0.012, 0.012), C.brassL, 0.012, 0.0, 0, 0); }
    else if (k === 'gem') { m(new T3.OctahedronGeometry(0.06), toon('#e0304a', { emissive: new T3.Color('#5a0a14') }), 0, 0.08, 0); }
    return g; };
  Y.gadget = gadget;
  [['cell', -1.15], ['cell', -1.07], ['cell', -0.99], ['pack', -0.62], ['pack', -0.42], ['cam', 0.05], ['bino', 0.5], ['jar', 0.95], ['globe', 1.45]].forEach(([k, x]) => gadget(k, x, 0.91, -3.72));
  [['hat', -1.05], ['fez', -0.7], ['glass', -0.35], ['shades', 0.05], ['stache', 0.4], ['walkie', 0.8], ['walkie', 0.92], ['books', 1.4]].forEach(([k, x]) => gadget(k, x, 1.56, -3.72));
  [['books', -1.05], ['pack', -0.55], ['cam', -0.15], ['bino', 0.3], ['cell', 0.75], ['cell', 0.83], ['key', 1.15], ['hat', 1.5]].forEach(([k, x]) => gadget(k, x, 2.21, -3.72));
  { const s = textPlate("RAFIQ · QUIET TRADE", 2.4, 0.36, '#1e2450', '#e6c26a'); s.position.set(0.25, 2.72, -3.97); shelf.add(s); }
  crest(-1.0, 2.9, -3.97, 0.22, shelf); crest(1.5, 2.9, -3.97, 0.22, shelf);
  // ---------- the glass case pedestal (LASER rig sits on it) ----------
  const ped = new T3.Group(); root.add(ped); Y.backWall.push(ped);
  M(new T3.BoxGeometry(1.5, 0.9, 0.62), woodM, 3.5, 0.45, -3.62, ped, 0.02); M(new T3.BoxGeometry(1.56, 0.04, 0.66), C.brass, 3.5, 0.91, -3.62, ped, 0.008);
  { const s = textPlate('DO NOT TOUCH THE LIGHT', 1.1, 0.14, '#5a1020', '#f2e6cc', 800); s.position.set(3.5, 0.6, -3.305); ped.add(s); }
  // ---------- the FALSE BOOKCASE (hinged on its left edge, swings into the back room) ----------
  const bk = new T3.Group(); bk.position.set(-3.4, 0, -4.02); root.add(bk); Y.backWall.push(bk);
  M(new T3.BoxGeometry(1.8, 2.55, 0.3), C.woodD, 0.9, 1.275, 0, bk, 0.02);
  const BOOKC = ['#7a2a2a', '#2a4a7a', '#3f5a2a', '#6a4a8a', '#8a6a2a', '#1e2450', '#a8784a', '#4a2c18'];
  for (const [ry, rh] of [[0.12, 0.5], [0.7, 0.5], [1.28, 0.5], [1.86, 0.5]]) { M(new T3.BoxGeometry(1.66, 0.04, 0.26), woodM, 0.9, ry, 0.03, bk, 0.006); let x = 0.12; while (x < 1.66) { const w = R(0.05, 0.1), h = R(0.3, rh - 0.06); if (ry === 0.7 && x > 1.2 && !Y.lever) { const lv = M(new T3.BoxGeometry(0.08, 0.42, 0.22), C.red, x + 0.04, ry + 0.23, 0.05, bk, 0.006); Y.lever = lv; x += 0.1; continue; } M(new T3.BoxGeometry(w, h, 0.22), toon(P(BOOKC)), x + w / 2, ry + 0.02 + h / 2, 0.04, bk, 0.005); x += w + 0.008; } }
  M(new T3.BoxGeometry(1.84, 0.1, 0.34), woodM, 0.9, 2.6, 0, bk, 0.01);
  Y.book = { g: bk, k: 0, target: 0 };
  // ---------- back room: the training room ----------
  M(new T3.BoxGeometry(2.2, 0.06, 1.0), woodM, -2.85, 0.92, -6.95, root, 0.015); for (const [dx, dz] of [[-1, -0.42], [1, -0.42], [-1, 0.42], [1, 0.42]]) M(new T3.BoxGeometry(0.07, 0.9, 0.07), C.woodD, -2.85 + dx, 0.45, -6.95 + dz, root, 0.008);
  M(new T3.BoxGeometry(2.0, 0.006, 0.8), C.green, -2.85, 0.953, -6.95, root, 0);
  { const pegT = CTX(512, 256, c => { c.fillStyle = '#c9a06a'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#9a7444'; for (let y = 12; y < 256; y += 20) for (let x = 12; x < 512; x += 20) c.fillRect(x, y, 3, 3); c.strokeStyle = '#201e1d'; c.fillStyle = '#201e1d'; c.lineWidth = 6; for (let i = 0; i < 7; i++) { const x = 40 + i * 30; c.beginPath(); c.moveTo(x, 40); c.lineTo(x, 150); c.lineTo(x + (i % 2 ? 10 : -6), 160 - (i % 3) * 6); c.stroke(); } for (let i = 0; i < 3; i++) { const x = 300 + i * 70; c.fillStyle = '#c9a24a'; c.fillRect(x, 70, 50, 44); c.strokeStyle = '#8a8a8a'; c.lineWidth = 8; c.beginPath(); c.arc(x + 25, 70, 18, Math.PI, 0); c.stroke(); c.fillStyle = '#201e1d'; c.fillRect(x + 22, 88, 6, 14); } c.fillStyle = '#e6c26a'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(60 + i * 40, 205, 9, 0, 7); c.fill(); c.fillRect(57 + i * 40, 205, 6, 30); } });
    const p = new T3.Mesh(new T3.PlaneGeometry(2.4, 1.2), new T3.MeshToonMaterial({ map: pegT, gradientMap: grad })); p.position.set(-3.3, 1.85, -8.27); root.add(p); }
  { const chalk = CTX(512, 320, c => { c.fillStyle = '#24302a'; c.fillRect(0, 0, 512, 320); c.strokeStyle = '#8a6a3a'; c.lineWidth = 16; c.strokeRect(0, 0, 512, 320); c.strokeStyle = '#e8e4da'; c.fillStyle = '#e8e4da'; c.lineWidth = 4; c.font = '900 34px Archivo, Arial'; c.fillText('STATION 9', 24, 52); c.beginPath(); c.moveTo(150, 260); c.lineTo(150, 130); c.quadraticCurveTo(230, 60, 310, 130); c.lineTo(310, 260); c.stroke(); c.fillStyle = '#5cff8a'; c.beginPath(); c.arc(205, 110, 12, 0, 7); c.fill(); c.fillStyle = '#ff5a4a'; c.beginPath(); c.arc(255, 110, 12, 0, 7); c.fill(); c.fillStyle = '#e8e4da'; c.font = '700 22px Archivo, Arial'; c.fillText('GREEN, THEN RED.', 330, 200); c.fillText('NEVER RUN.', 330, 236); for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(40 + i * 18, 290); c.lineTo(52 + i * 18, 270); c.stroke(); } });
    const b = new T3.Mesh(new T3.PlaneGeometry(1.8, 1.12), new T3.MeshToonMaterial({ map: chalk, gradientMap: grad })); b.position.set(-4.98, 1.75, -6.2); b.rotation.y = Math.PI / 2; root.add(b); }
  { const v = new T3.Group(); v.position.set(-1.35, 1.25, -8.27); root.add(v); M(new T3.CylinderGeometry(0.75, 0.75, 0.12, 32), C.steel, 0, 0, 0.06, v, 0.02, 0.75).rotation.x = Math.PI / 2; M(new T3.TorusGeometry(0.62, 0.05, 6, 32), toon('#8a949c'), 0, 0, 0.13, v, 0); for (let i = 0; i < 3; i++) { const s = M(new T3.BoxGeometry(0.56, 0.05, 0.05), C.brassL, 0, 0, 0.18, v, 0.005); s.rotation.z = i * Math.PI / 3; } M(new T3.CylinderGeometry(0.09, 0.09, 0.08, 14), C.brassL, 0, 0, 0.19, v, 0.006).rotation.x = Math.PI / 2; }
  for (const [x, z, s] of [[-1.2, -5.0, 0.62], [-1.0, -5.3, 0.5], [-1.15, -4.95, 0.45]]) M(new T3.BoxGeometry(s, s, s), toon('#a8784a'), x, s / 2 + (s < 0.5 ? 0.62 : 0), z, root, 0.015);
  { const mq = new T3.Group(); mq.position.set(-4.45, 0, -4.9); root.add(mq); M(new T3.CylinderGeometry(0.03, 0.03, 1.7, 6), C.woodD, 0, 0.85, 0, mq, 0.006); M(new T3.CylinderGeometry(0.22, 0.25, 0.04, 12), C.woodD, 0, 0.02, 0, mq, 0.006); M(new T3.CylinderGeometry(0.2, 0.32, 1.05, 12), toon('#8a7a5a'), 0, 1.0, 0, mq, 0.012); M(new T3.CylinderGeometry(0.11, 0.13, 0.12, 14), C.red, 0, 1.72, 0, mq, 0.008); M(new T3.SphereGeometry(0.1, 10, 8), toon('#e8dcc4'), 0, 1.6, 0, mq, 0.006); }
  // ---------- front of the shop: bead curtain door, sunlit square outside, coat rack, jars, rug, window ----------
  { const out = new T3.Mesh(new T3.PlaneGeometry(3.2, 2.8), new T3.MeshBasicMaterial({ map: CTX(256, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#ffe9b8'); g.addColorStop(0.55, '#f5c97a'); g.addColorStop(0.56, '#e2b46a'); g.addColorStop(1, '#d09a50'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); c.fillStyle = 'rgba(170,110,60,0.5)'; c.fillRect(150, 70, 80, 75); c.fillRect(20, 85, 60, 60); }) })); out.position.set(0, 1.25, 4.6); out.rotation.y = Math.PI; root.add(out); Y.front.push(out); }
  for (let i = 0; i < 11; i++) { const x = -0.7 + i * 0.14; const s = M(new T3.BoxGeometry(0.03, 2.3, 0.03), toon(i % 3 ? '#c9a24a' : '#b8202a'), x, 1.3, 4.02, root, 0); Y.front.push(s); }
  { const rack = new T3.Group(); rack.position.set(-4.35, 0, 2.95); root.add(rack); M(new T3.CylinderGeometry(0.035, 0.04, 1.9, 8), C.woodD, 0, 0.95, 0, rack, 0.008); M(new T3.CylinderGeometry(0.25, 0.28, 0.05, 12), C.woodD, 0, 0.025, 0, rack, 0.008);
    for (const [a, col] of [[0.6, '#8a7a5a'], [2.4, '#3a3a44'], [4.2, '#1e2450']]) { const c = M(new T3.CylinderGeometry(0.12, 0.26, 1.05, 10), toon(col), Math.cos(a) * 0.17, 1.2, Math.sin(a) * 0.17, rack, 0.01); c.rotation.z = Math.cos(a) * 0.15; } gadget('fez', 0, 1.9, 0, rack, 1.4); gadget('hat', 0.12, 1.82, 0.1, rack, 1.2); }
  for (const [x, z, s] of [[3.75, 3.35, 1.3], [4.25, 3.0, 1.0], [4.35, 3.55, 0.85]]) { const j = new T3.Group(); j.position.set(x, 0, z); j.scale.setScalar(s); root.add(j); M(new T3.SphereGeometry(0.25, 14, 10), C.clay, 0, 0.27, 0, j, 0.012); M(new T3.CylinderGeometry(0.09, 0.13, 0.18, 12), C.clay, 0, 0.55, 0, j, 0.01); M(new T3.TorusGeometry(0.1, 0.025, 6, 14), toon('#9a5230'), 0, 0.64, 0, j, 0).rotation.x = Math.PI / 2; }
  { const rugT = CTX(256, 192, c => { c.fillStyle = '#8a1e24'; c.fillRect(0, 0, 256, 192); c.strokeStyle = '#e6c26a'; c.lineWidth = 8; c.strokeRect(12, 12, 232, 168); c.strokeStyle = '#1e2450'; c.lineWidth = 6; c.strokeRect(26, 26, 204, 140); c.fillStyle = '#1e2450'; c.beginPath(); c.moveTo(128, 46); c.lineTo(200, 96); c.lineTo(128, 146); c.lineTo(56, 96); c.closePath(); c.fill(); c.fillStyle = '#e6c26a'; c.font = '900 56px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K', 128, 100); c.fillStyle = '#f2e6cc'; for (let i = 0; i < 16; i++) { c.fillRect(16 + i * 15, 2, 4, 8); c.fillRect(16 + i * 15, 182, 4, 8); } });
    const rug = new T3.Mesh(new T3.PlaneGeometry(2.8, 2.0), new T3.MeshToonMaterial({ map: rugT, gradientMap: grad })); rug.rotation.x = -Math.PI / 2; rug.position.set(0.6, 0.012, 1.7); rug.receiveShadow = true; root.add(rug);
    const rug2 = rug.clone(); rug2.scale.setScalar(0.7); rug2.position.set(-2.85, 0.012, -5.6); root.add(rug2); }
  { const winT = CTX(256, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#fff2c8'); g.addColorStop(1, '#f2b860'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#3f2614'; c.lineWidth = 7; for (let y = 0; y < 256; y += 32) for (let x = 0; x < 256; x += 32) { c.beginPath(); c.moveTo(x + 16, y); c.lineTo(x + 32, y + 16); c.lineTo(x + 16, y + 32); c.lineTo(x, y + 16); c.closePath(); c.stroke(); } c.lineWidth = 16; c.strokeRect(0, 0, 256, 256); });
    const w = new T3.Mesh(new T3.PlaneGeometry(1.3, 1.5), new T3.MeshBasicMaterial({ map: winT })); w.position.set(4.97, 1.8, 0.6); w.rotation.y = -Math.PI / 2; root.add(w);
    const beam = new T3.Mesh(new T3.PlaneGeometry(1.2, 3.2), new T3.MeshBasicMaterial({ map: CTX(32, 128, c => { const g = c.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, 'rgba(255,220,150,0.35)'); g.addColorStop(1, 'rgba(255,220,150,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 128); }), transparent: true, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide })); beam.position.set(4.0, 1.0, 0.6); beam.rotation.set(0, Math.PI / 2, 0.75); root.add(beam); }
  // ---------- hanging lanterns (+ warm point lights) ----------
  const lanT = CTX(128, 128, c => { c.fillStyle = '#8a6a2a'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#ffd88a'; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { const cx = x * 32 + 16 + (y % 2) * 8, cy = y * 32 + 16; c.beginPath(); for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4, r = k % 2 ? 5 : 11; c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } c.closePath(); c.fill(); } });
  const lanM = new T3.MeshBasicMaterial({ map: lanT });
  const haloT = CTX(64, 64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,220,150,0.9)'); g.addColorStop(0.35, 'rgba(255,180,90,0.25)'); g.addColorStop(1, 'rgba(255,160,60,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const lantern = (x, y, z, k = 9) => { const g = new T3.Group(); g.position.set(x, y, z); root.add(g); M(new T3.CylinderGeometry(0.008, 0.008, H - y, 4), C.ink, 0, (H - y) / 2, 0, g, 0); const body = new T3.Mesh(new T3.CylinderGeometry(0.15, 0.12, 0.32, 8), lanM); g.add(body); M(new T3.ConeGeometry(0.17, 0.16, 8), C.brass, 0, 0.24, 0, g, 0.006); M(new T3.ConeGeometry(0.12, 0.1, 8), C.brass, 0, -0.21, 0, g, 0.005).rotation.x = Math.PI; Y.flames.push(body); const halo = new T3.Sprite(new T3.SpriteMaterial({ map: haloT, color: 0xffc070, transparent: true, depthWrite: false, blending: T3.AdditiveBlending, opacity: 0.55, fog: false })); halo.scale.setScalar(1.3); g.add(halo); (Y.halos = Y.halos || []).push(halo); const L = new T3.PointLight(0xffb060, k, 7.5, 1.6); L.position.set(0, -0.2, 0); g.add(L); Y.lights.push({ L, k }); return g; };
  lantern(-2.6, 2.55, 0.9); lantern(1.4, 2.6, 0.6, 10); lantern(3.6, 2.55, 1.6);
  { const plT = T(256, 256, c => { c.fillStyle = '#4a2c18'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#3f2614' : '#553420'; c.fillRect(0, i * 32, 256, 30); } }, [4, 4]); const cm = new T3.MeshToonMaterial({ map: plT, gradientMap: grad, side: T3.DoubleSide });
    Y.ceil = []; for (const [w, d, x, z] of [[10.4, 8.4, 0, 0], [4.8, 4.6, -2.85, -6.25]]) { const c = new T3.Mesh(new T3.PlaneGeometry(w, d), cm); c.rotation.x = Math.PI / 2; c.position.set(x, H, z); root.add(c); Y.ceil.push(c); }
    for (let x = -4.5; x <= 4.6; x += 1.5) { const b = M(new T3.BoxGeometry(0.16, 0.18, 8.2), C.woodD, x, H - 0.09, 0, root, 0.01); Y.ceil.push(b); } } lantern(-4.0, 2.5, -5.3, 11);
  { const L = new T3.PointLight(0xff3040, 0, 3.2, 2); L.position.set(3.5, 1.5, -3.0); root.add(L); Y.alarmL = L; }
  // ---------- spots + walk data (local to root) ----------
  Y.spots = { ben: { x: 0.35, z: -1.75 }, rafiq: { x: -1.15, z: -1.85 }, rafiqWork: { x: -2.4, z: -1.9 }, benWork: { x: 0.45, z: -1.8 }, client: { x: 2.25, z: 0.3 }, door: { x: 0, z: 3.7 },
    benTrain: { x: -1.85, z: -6.15 }, rafiqTrain: { x: -4.25, z: -7.1 }, walkStart: { x: 0.9, z: 1.5 },
    bench: { x: 0.45, y: 1.02, z: -0.98 }, train: { x: -2.85, y: 0.955, z: -7.0 }, vault: { x: 3.5, y: 0.93, z: -3.48 }, item: { x: 1.85, y: 1.02, z: -0.8 }, doorway: { x: -2.5, z: -4.05 } };
  Y.walk = { rooms: [{ x0: -4.7, x1: 4.7, z0: -3.3, z1: 3.75 }, { x0: -4.7, x1: -0.95, z0: -7.95, z1: -4.4 }, { x0: -3.12, x1: -1.88, z0: -4.6, z1: -3.1 }],
    solids: [{ x0: -1.9, x1: 2.9, z0: -1.4, z1: -0.42 }, { x0: 2.7, x1: 4.3, z0: -4.0, z1: -3.2 }, { x0: -4.0, x1: -1.7, z0: -7.5, z1: -6.4 }, { x0: -4.8, x1: -3.9, z0: 2.55, z1: 3.4 }, { x0: 3.35, x1: 4.7, z0: 2.6, z1: 3.8 }, { x0: -1.65, x1: -0.6, z0: -5.65, z1: -4.55 }, { x0: -4.8, x1: -4.1, z0: -5.25, z1: -4.55 }],
    hot: [{ id: 'rafiq', x: -1.15, z: -0.1, r: 1.1, label: 'TALK TO RAFIQ' }, { id: 'rafiq', x: -1.15, z: -1.85, r: 1.4, label: 'TALK TO RAFIQ' }, { id: 'train', x: -2.85, z: -5.95, r: 1.25, label: 'TRAIN WITH RAFIQ' },
      { id: 'door', x: 0, z: 3.45, r: 0.95, label: 'TO KUFA TOWN SQUARE' }, { id: 'shelf', x: 0.25, z: -2.9, r: 0.95, label: 'LOOK AT THE SHELVES' }, { id: 'case', x: 3.5, z: -2.85, r: 0.9, label: 'LOOK AT THE GLASS CASE' }] };
  Y.update = (dt, t) => { Y.book.k = damp(Y.book.k, Y.book.target, 3.2, dt); Y.book.g.rotation.y = smooth(0, 1, Y.book.k) * 1.75; if (Y.lever) Y.lever.rotation.x = -Y.book.target * 0.35;
    Y.lights.forEach((o, i) => { const f = Y.dim * (0.9 + 0.1 * Math.sin(t * 7 + i * 2) * Math.sin(t * 3.1 + i)); o.L.intensity = o.k * f; if (Y.halos && Y.halos[i]) Y.halos[i].material.opacity = 0.55 * f; }); Y.alarmL.intensity = Y.red * (0.6 + 0.4 * Math.sin(t * 18)) * 14; };
  return Y;
}

// ======================= CLIENT ITEMS (sweep rig + the item on the counter) =======================
// makeObj(ST, kind) → { g, spots } · spots = places a bug can hide (rig-local, on the front of the object)
export function makeObj(ST, kind) {
  const { M, toon } = ST, g = new THREE.Group(), m = (geo, mat, x = 0, y = 0, z = 0, o = 0.008) => M(geo, mat, x, y, z, g, o);
  const brass = toon('#d4a83a'), brassD = toon('#9a7426'), ink = toon('#201e1d'), wood = toon('#7a4a26'), steel = toon('#4d6b62'), leather = toon('#6b3a1e');
  let spots = [];
  if (kind === 'lamp') { const b = m(new THREE.SphereGeometry(0.2, 18, 12), brass, 0, 0.2, 0); b.scale.set(1.45, 0.55, 0.85); m(new THREE.CylinderGeometry(0.09, 0.13, 0.08, 16), brassD, 0, 0.05, 0);
    const sp = m(new THREE.ConeGeometry(0.05, 0.38, 10), brass, 0.33, 0.27, 0); sp.rotation.z = -1.15; const hd = m(new THREE.TorusGeometry(0.09, 0.022, 6, 14, Math.PI * 1.4), brassD, -0.33, 0.24, 0); hd.rotation.z = 1.9;
    m(new THREE.ConeGeometry(0.08, 0.12, 12), brassD, 0, 0.34, 0); m(new THREE.SphereGeometry(0.025, 8, 6), brass, 0, 0.41, 0);
    spots = [[-0.17, 0.21, 0.18], [0.08, 0.25, 0.18], [0.0, 0.11, 0.15], [0.33, 0.29, 0.05], [-0.36, 0.3, 0.03], [0.0, 0.34, 0.08]]; }
  else if (kind === 'radio') { m(new THREE.BoxGeometry(0.62, 0.4, 0.26), wood, 0, 0.21, 0); const gr = m(new THREE.CircleGeometry(0.12, 20), toon('#d9c08a'), -0.13, 0.21, 0.131, 0); for (let i = -2; i <= 2; i++) m(new THREE.BoxGeometry(0.2, 0.008, 0.004), toon('#7a5a3a'), -0.13, 0.21 + i * 0.04, 0.134, 0);
    m(new THREE.BoxGeometry(0.2, 0.08, 0.01), toon('#f2e0a8'), 0.15, 0.29, 0.13, 0); m(new THREE.BoxGeometry(0.006, 0.07, 0.012), toon('#b8202a'), 0.12, 0.29, 0.136, 0);
    for (const x of [0.1, 0.2]) m(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 12), ink, x, 0.13, 0.14).rotation.x = Math.PI / 2; m(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 4), toon('#9aa3a8'), 0.22, 0.55, -0.05, 0).rotation.z = -0.4;
    spots = [[-0.13, 0.21, 0.145], [0.15, 0.29, 0.145], [0.2, 0.13, 0.16], [-0.24, 0.34, 0.14], [0.0, 0.06, 0.14], [0.26, 0.36, 0.14]]; }
  else if (kind === 'pot') { const pts = [[0, 0], [0.13, 0], [0.15, 0.04], [0.13, 0.14], [0.08, 0.24], [0.06, 0.3], [0.08, 0.36], [0.06, 0.38], [0, 0.39]].map(([a, b]) => new THREE.Vector2(a, b)); m(new THREE.LatheGeometry(pts, 20), brass, 0, 0, 0, 0.01);
    const cv = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.12, 0.08, 0), new THREE.Vector3(0.3, 0.16, 0), new THREE.Vector3(0.32, 0.36, 0)); m(new THREE.TubeGeometry(cv, 10, 0.025, 6), brassD, 0, 0, 0, 0);
    m(new THREE.TorusGeometry(0.1, 0.018, 6, 14, Math.PI), brassD, -0.14, 0.2, 0, 0).rotation.z = Math.PI / 2; m(new THREE.ConeGeometry(0.06, 0.1, 10), brassD, 0, 0.44, 0); m(new THREE.SphereGeometry(0.02, 8, 6), brass, 0, 0.5, 0);
    spots = [[-0.06, 0.1, 0.13], [0.05, 0.2, 0.11], [0.0, 0.31, 0.07], [0.28, 0.3, 0.02], [0.0, 0.42, 0.05], [-0.1, 0.18, 0.09]]; }
  else if (kind === 'case') { m(new THREE.BoxGeometry(0.72, 0.48, 0.16), leather, 0, 0.26, 0); m(new THREE.BoxGeometry(0.74, 0.03, 0.17), toon('#4a2814'), 0, 0.33, 0, 0.004); m(new THREE.TorusGeometry(0.08, 0.018, 6, 14, Math.PI), ink, 0, 0.5, 0, 0);
    for (const x of [-0.22, 0.22]) { m(new THREE.BoxGeometry(0.07, 0.06, 0.02), brass, x, 0.33, 0.085, 0.004); m(new THREE.BoxGeometry(0.02, 0.025, 0.01), ink, x, 0.33, 0.097, 0); }
    spots = [[-0.25, 0.18, 0.09], [0.0, 0.42, 0.09], [0.24, 0.16, 0.09], [-0.1, 0.24, 0.09], [0.12, 0.42, 0.09], [0.3, 0.44, 0.09]]; }
  else if (kind === 'box') { m(new THREE.BoxGeometry(0.52, 0.44, 0.38), steel, 0, 0.22, -0.05); m(new THREE.CylinderGeometry(0.07, 0.07, 0.03, 18), toon('#c8d0d6'), -0.06, 0.24, 0.15).rotation.x = Math.PI / 2; m(new THREE.BoxGeometry(0.03, 0.16, 0.03), toon('#c8d0d6'), 0.15, 0.22, 0.15, 0.004);
    for (const [x, y] of [[-0.22, 0.04], [0.22, 0.04], [-0.22, 0.4], [0.22, 0.4]]) m(new THREE.SphereGeometry(0.02, 6, 4), toon('#c8d0d6'), x, y, 0.145, 0);
    spots = [[-0.18, 0.36, 0.15], [0.17, 0.08, 0.15], [-0.18, 0.1, 0.15], [0.05, 0.38, 0.15], [0.19, 0.36, 0.15], [-0.06, 0.06, 0.15]]; }
  else if (kind === 'note') { const p = m(new THREE.BoxGeometry(0.34, 0.004, 0.24), toon('#efe2c4'), 0, 0.004, 0, 0.003); p.rotation.y = 0.3; m(new THREE.CylinderGeometry(0.025, 0.025, 0.006, 10), toon('#b8202a'), 0.05, 0.01, 0.02, 0); }
  return { g, spots };
}

// ======================= THE FIVE SKILL RIGS =======================
// Each rig is a little close-up stage in its own vertical plane (local x right, y up, z toward the camera).
// Rig API: g, W, H, setup(D, job), down(p, off), move(p), up(), step(dt, t), info(), hint(), frame() (local points to frame), hud(), demo(dt) → seconds to wait.
// K = { ST, flash, tone, vib, upg, puff, wp }

// ---------- LOCK: see-through practice lock (pins, shear line, pick, tension wrench) ----------
function lockRig(K) {
  const { ST, flash, tone, upg, sfx } = K, { M, toon } = ST, g = new THREE.Group(), RG = { kind: 'lock', g };
  const CY = 0.5, SH = 0.05, KB = -0.13, steel = toon('#c8d0d6'), ink = toon('#201e1d');
  M(new THREE.BoxGeometry(1.36, 0.06, 0.34), toon('#4a2c18'), 0, 0.03, -0.06, g, 0.012); for (const x of [-0.56, 0.56]) M(new THREE.BoxGeometry(0.05, 0.3, 0.05), toon('#c9a24a'), x, 0.2, -0.08, g, 0.006);
  const L = new THREE.Group(); L.position.y = CY; g.add(L); RG.L = L;
  const acr = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.74, 0.02), new THREE.MeshBasicMaterial({ color: 0x141a24, transparent: true, opacity: 0.92 })); acr.position.set(0, 0.05, -0.07); L.add(acr);
  M(new THREE.BoxGeometry(1.0, 0.3, 0.06), toon('#b8912f'), -0.04, SH + 0.15, -0.03, L, 0.01);
  const plug = M(new THREE.BoxGeometry(1.0, 0.25, 0.06), toon('#e6c26a'), -0.04, SH - 0.125, -0.03, L, 0.01);
  M(new THREE.BoxGeometry(0.98, 0.07, 0.01), toon('#2a2418'), -0.04, -0.15, 0.005, L, 0);
  const shearM = new THREE.MeshBasicMaterial({ color: 0x5ef2ff }), shear = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.018, 0.01), shearM); shear.position.set(-0.04, SH, 0.04); L.add(shear);
  { const t = canvasTex(256, 48, c => { c.fillStyle = '#5ef2ff'; c.font = '900 34px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText('SHEAR LINE', 6, 26); }); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.05), new THREE.MeshBasicMaterial({ map: t, transparent: true })); s.position.set(0.6, SH + 0.035, 0.04); L.add(s); }
  const bolt = M(new THREE.BoxGeometry(0.2, 0.1, 0.05), toon('#9aa3a8'), 0.52, SH - 0.12, -0.03, L, 0.008);
  const pinsG = new THREE.Group(); L.add(pinsG);
  const pick = new THREE.Group(); L.add(pick); const pickM = new THREE.MeshBasicMaterial({ color: 0xf4f4f4 }); M(new THREE.BoxGeometry(0.9, 0.024, 0.012), pickM, -0.45, 0, 0.06, pick, 0); M(new THREE.BoxGeometry(0.024, 0.05, 0.012), pickM, 0, 0.02, 0.06, pick, 0); M(new THREE.BoxGeometry(0.26, 0.05, 0.03), ink, -0.98, -0.01, 0.05, pick, 0.005);
  const wr = new THREE.Group(); wr.position.set(-0.56, -0.18, 0.05); L.add(wr); M(new THREE.BoxGeometry(0.12, 0.016, 0.012), steel, 0.06, 0, 0, wr, 0); M(new THREE.BoxGeometry(0.016, 0.2, 0.012), steel, 0, -0.1, 0, wr, 0); const wrG = M(new THREE.BoxGeometry(0.05, 0.1, 0.03), toon('#b8202a'), 0, -0.2, 0, wr, 0.005);
  RG.wrench = wr;
  let S = {}; RG.S = () => S;
  RG.setup = (D) => { while (pinsG.children.length) pinsG.remove(pinsG.children[0]);
    const N = D.lesson ? 3 : D.demo ? 4 : clamp(2 + D.day, 3, 5), pins = [];
    for (let i = 0; i < N; i++) { const x = (i - (N - 1) / 2) * 0.19 - 0.04, Lp = 0.06 + Math.floor(Math.random() * 7) * 0.015, need = SH - (KB + Lp);
      M(new THREE.BoxGeometry(0.08, 0.46, 0.005), toon('#0e0c08'), x, 0.11, 0.0, pinsG, 0);
      const kp = new THREE.Group(); pinsG.add(kp); M(new THREE.BoxGeometry(0.062, Lp, 0.03), toon('#ffb43a'), 0, Lp / 2, 0.03, kp, 0.004); const tip = M(new THREE.ConeGeometry(0.031, 0.034, 4), toon('#ffb43a'), 0, -0.012, 0.03, kp, 0); tip.rotation.x = Math.PI;
      const drM = new THREE.MeshToonMaterial({ color: '#e8eef2', gradientMap: ST.grad }); const dr = M(new THREE.BoxGeometry(0.062, 0.12, 0.03), drM, x, 0, 0.03, pinsG, 0.004);
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.036, 1, 0.012), new THREE.MeshBasicMaterial({ color: 0x9aa3a8 })); sp.position.set(x, 0, 0.03); pinsG.add(sp);
      const glow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.02, 0.012), new THREE.MeshBasicMaterial({ color: 0x22c55e })); glow.position.set(x, SH, 0.05); glow.visible = false; pinsG.add(glow);
      kp.position.set(x, KB, 0); pins.push({ x, L: Lp, need, lift: 0, set: false, kp, dr, drM, sp, glow }); }
    S = { D, N, pins, order: shuffle(pins.map((_, i) => i)), bind: 0, tension: false, overset: -1, win: false, holdT: 0, drops: 0, oversets: 0, opened: false, openT: 0, ptr: false, tip: { x: -0.3, y: KB - 0.03 }, off: 0.1, warn: 0 };
    bolt.position.x = 0.52; plug.position.y = SH - 0.125; shearM.color.set(0x5ef2ff); };
  const tol = () => upg('picks') ? 0.022 : (S.D.lesson || S.D.day <= 1 || S.D.demo) ? 0.018 : 0.013;
  RG.setTension = on => { if (!S.pins || S.opened || on === S.tension) return; S.tension = on; if (on) { sfx('tension'); return; }
    const any = S.pins.some(p => p.set) || S.overset >= 0; S.pins.forEach(p => { p.set = false; p.glow.visible = false; }); S.bind = 0; S.overset = -1; S.win = false; S.holdT = 0;
    if (any) { S.drops++; flash('TENSION OFF · THE PINS DROPPED', '#ffffff', 1.3); sfx('drop'); } };
  const setPin = i => { const p = S.pins[i]; p.set = true; p.glow.visible = true; S.bind++; S.win = false; S.holdT = 0; sfx('pinSet'); K.vib(15);
    const n = S.pins.filter(q => q.set).length; if (n >= S.N) { S.opened = true; S.openT = 0; sfx('unlock'); flash('IT TURNS · THE LOCK IS OPEN!', '#22c55e', 1.6); K.done && K.done(); } else flash('CLICK · PIN ' + n + ' OF ' + S.N + ' SET', '#22c55e', 0.9); };
  const overset = i => { S.overset = i; S.oversets++; flash('OVERSET! LET GO OF THE TENSION TO RESET', '#ec3013', 1.8); sfx('overset'); K.vib([30, 40, 30]); };
  const clampTip = (x, y) => ({ x: clamp(x, -0.5, 0.42), y: clamp(y, KB - 0.04, SH + 0.07) });
  RG.down = (p, off) => { if (!S.pins || S.opened) return; S.off = off; S.ptr = true; S.tip = clampTip(p.x, p.y - CY + off); if (!S.tension && performance.now() - S.warn > 2500) { S.warn = performance.now(); flash(ST.touch ? 'HOLD THE TENSION PAD WITH YOUR OTHER THUMB' : 'HOLD SPACE (OR CLICK TENSION) FOR TENSION', '#ffd23a', 1.6); } };
  RG.move = p => { if (!S.ptr) return; const ox = S.tip.x, oy = S.tip.y; S.tip = clampTip(p.x, p.y - CY + S.off); if (S.tension && Math.hypot(S.tip.x - ox, S.tip.y - oy) > 0.004) sfx('scrape'); };
  RG.up = () => { if (S.pins && S.win && S.tension && S.overset < 0 && !S.opened) setPin(S.order[S.bind]); S.ptr = false; };
  RG.step = (dt) => { if (!S.pins) return;
    if (!S.ptr) S.tip.y = damp(S.tip.y, KB - 0.035, 8, dt); pick.position.set(S.tip.x, S.tip.y, 0);
    wr.rotation.z = damp(wr.rotation.z, S.tension ? -0.22 : 0, 12, dt); wrG.material = toon(S.tension ? '#22c55e' : '#b8202a');
    const bi = S.tension && S.overset < 0 && !S.opened ? S.order[S.bind] : -1; let anyWin = false;
    S.pins.forEach((p, i) => { const under = S.ptr && Math.abs(S.tip.x - p.x) < 0.05, want0 = under ? Math.max(0, S.tip.y - KB) : 0;
      if (S.opened) { p.lift = damp(p.lift, 0, 10, dt); }
      else if (p.set) { p.lift = damp(p.lift, Math.min(want0, p.need - 0.012), 16, dt); }
      else if (S.overset >= 0) { /* jammed: everything frozen until tension comes off */ }
      else { const binding = i === bi; if (binding && S.win && want0 < p.lift - 0.01) { setPin(i); return; } p.lift = damp(p.lift, Math.min(want0, 0.2), binding ? 6.5 : 16, dt);
        if (binding) { const T = tol(), inW = Math.abs(p.lift - p.need) <= T;
          if (inW) { anyWin = true; if (!S.win) { S.win = true; sfx('pinTick'); K.vib(6); } S.holdT += dt; if (S.holdT > 0.3 || want0 < p.lift - 0.01) setPin(i); }
          else { S.win = false; S.holdT = 0; if (p.lift > p.need + T + 0.03) overset(i); } } }
      p.kp.position.y = KB + p.lift; const dy = p.set ? SH + 0.06 : KB + p.lift + p.L + 0.06; p.dr.position.y = dy;
      const top = 0.335, bot = dy + 0.06; p.sp.scale.y = Math.max(0.01, top - bot); p.sp.position.y = (top + bot) / 2;
      p.drM.color.set(S.overset === i ? '#ec3013' : p.set ? '#8ff0b0' : (i === bi && under) ? '#ff9a6a' : '#e8eef2'); });
    shearM.color.set(S.opened ? 0x22c55e : anyWin ? 0xffd23a : 0x5ef2ff);
    if (S.opened) { S.openT += dt; bolt.position.x = 0.52 + Math.min(1, S.openT * 2) * 0.16; plug.position.y = SH - 0.125 - Math.sin(Math.min(1, S.openT * 3) * Math.PI) * 0.01; } };
  RG.info = () => { if (!S.pins) return { done: false, q: 0, txt: '' }; const n = S.pins.filter(p => p.set).length; return { done: S.opened, q: Math.max(0.4, 1 - 0.2 * S.oversets - 0.05 * S.drops), prog: S.opened ? 1 : n / S.N, txt: S.opened ? 'DONE' : n + ' / ' + S.N + ' PINS' }; };
  RG.hint = () => { if (!S.pins || S.opened) return null; const pw = i => K.wp(S.pins[i].kp, 0, S.pins[i].L + 0.02);
    if (S.overset >= 0) return { p: pw(S.overset), text: 'OVERSET · LET GO OF THE TENSION TO RESET' };
    if (!S.tension) return { p: K.wp(wr, 0, -0.2), text: ST.touch ? 'HOLD THE TENSION PAD WITH YOUR LEFT THUMB' : 'HOLD SPACE (OR CLICK THE TENSION PAD)' };
    if (S.win) return { text: 'IT CATCHES · EASE OFF NOW AND LET IT CLICK' };
    const bi = S.order[S.bind]; if (S.D.lesson || S.D.day <= 2) return { p: pw(bi), text: 'PUSH THIS PIN UP SLOWLY · IT CLICKS AT THE LINE' };
    return { text: 'SLIDE UNDER EACH PIN · THE STIFF ONE IS NEXT · PUSH IT UP SLOWLY' }; };
  RG.frame = () => [[-0.66, 0.2], [0.66, 0.2], [-0.66, 0.9], [0.66, 0.9]];
  RG.hud = () => S.pins ? { tension: S.tension, set: S.pins.filter(p => p.set).length, n: S.N, overset: S.overset >= 0, win: S.win, pins: S.pins.map(p => p.set) } : null;
  RG.demo = () => { if (!S.pins || S.opened) return 0.5; if (S.overset >= 0) { RG.setTension(false); return 0.5; } if (!S.tension) { RG.setTension(true); return 0.7; }
    const i = S.order[S.bind], p = S.pins[i]; S.ptr = true; if (Math.abs(S.tip.x - p.x) > 0.01) { S.tip = { x: p.x, y: KB - 0.03 }; return 0.4; }
    if (S.tip.y < KB + p.need - 0.004) { S.tip.y += 0.01; return 0.05; } return 0.1; };
  RG.demoPt = () => S.pins && K.wp(pick, 0, 0);
  return RG;
}

// ---------- SAFE: strongbox door, 40-number dial, stethoscope, spoke handle ----------
function safeRig(K) {
  const { ST, flash, tone, upg, sfx } = K, { M, toon } = ST, g = new THREE.Group(), RG = { kind: 'safe', g };
  const STEP = TAU / 40, DX = -0.08, DY = 0.5, HX = 0.3, HY = 0.43;
  M(new THREE.BoxGeometry(1.0, 0.94, 0.6), toon('#3f5a52'), 0, 0.47, -0.32, g, 0.02); for (const x of [-0.42, 0.42]) M(new THREE.BoxGeometry(0.12, 0.04, 0.5), toon('#201e1d'), x, 0.02, -0.32, g, 0.006);
  M(new THREE.BoxGeometry(0.86, 0.78, 0.02), toon('#162420'), 0, 0.48, -0.05, g, 0);
  const goods = new THREE.Group(); goods.position.set(0, 0.12, -0.25); g.add(goods); for (let i = 0; i < 5; i++) M(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 14), toon('#e6b45a'), -0.2 + (i % 3) * 0.03, i * 0.022, 0, goods, 0.004); M(new THREE.BoxGeometry(0.2, 0.12, 0.14), toon('#a8784a'), 0.15, 0.06, 0, goods, 0.006);
  const door = new THREE.Group(); door.position.set(-0.43, 0.48, 0); g.add(door); M(new THREE.BoxGeometry(0.86, 0.8, 0.05), toon('#4d6b62'), 0.43, 0, 0.025, door, 0.012);
  M(new THREE.BoxGeometry(0.78, 0.72, 0.01), toon('#557870'), 0.43, 0, 0.055, door, 0);
  { const t = canvasTex(512, 96, c => { c.fillStyle = '#c9a24a'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#3a2a10'; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('KUFA SAFE CO.', 256, 52); }); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.36, 0.07), new THREE.MeshBasicMaterial({ map: t })); s.position.set(0.43, 0.32, 0.062); door.add(s); }
  const dialT = canvasTex(512, 512, c => { c.fillStyle = '#1c1c20'; c.beginPath(); c.arc(256, 256, 254, 0, 7); c.fill(); c.fillStyle = '#d7dde3'; c.beginPath(); c.arc(256, 256, 236, 0, 7); c.fill(); c.fillStyle = '#2a2a30'; c.beginPath(); c.arc(256, 256, 110, 0, 7); c.fill();
    c.fillStyle = '#1c1c20'; for (let k = 0; k < 40; k++) { const a = Math.PI / 2 + k * STEP, big = k % 5 === 0, r0 = big ? 196 : 210; c.save(); c.translate(256 + Math.cos(a) * 222, 256 - Math.sin(a) * 222); c.rotate(-a + Math.PI / 2); c.fillRect(-3, 0, 6, big ? 26 : 14); c.restore(); if (big) { c.save(); c.translate(256 + Math.cos(a) * 160, 256 - Math.sin(a) * 160); c.rotate(-a + Math.PI / 2); c.font = '900 44px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(k), 0, 0); c.restore(); } }
    c.strokeStyle = '#c9a24a'; c.lineWidth = 10; c.beginPath(); c.arc(256, 256, 70, 0, 7); c.stroke(); });
  const dialG = new THREE.Group(); dialG.position.set(DX + 0.43, DY - 0.48, 0.07); door.add(dialG);
  M(new THREE.CylinderGeometry(0.23, 0.24, 0.05, 40), toon('#1c1c20'), 0, 0, -0.02, dialG, 0.006, 0.24).rotation.x = Math.PI / 2;
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.22, 48), new THREE.MeshBasicMaterial({ map: dialT })); face.position.z = 0.008; dialG.add(face);
  const knob = M(new THREE.CylinderGeometry(0.07, 0.08, 0.06, 16), toon('#2a2a30'), 0, 0, 0.03, dialG, 0.006); knob.rotation.x = Math.PI / 2;
  const notchM = new THREE.MeshBasicMaterial({ color: 0xec3013 }), notch = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 3), notchM); notch.rotation.z = Math.PI; notch.position.set(DX + 0.43, DY - 0.48 + 0.27, 0.075); door.add(notch);
  const hw = new THREE.Group(); hw.position.set(HX + 0.43, HY - 0.48, 0.08); door.add(hw); M(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), toon('#c9a24a'), 0, 0, 0, hw, 0.005).rotation.x = Math.PI / 2;
  for (let i = 0; i < 3; i++) { const sp = new THREE.Group(); sp.rotation.z = i * TAU / 3; hw.add(sp); M(new THREE.BoxGeometry(0.02, 0.15, 0.02), toon('#c9a24a'), 0, 0.08, 0, sp, 0.004); M(new THREE.SphereGeometry(0.025, 8, 6), toon('#c9a24a'), 0, 0.16, 0, sp, 0.004); }
  const steth = new THREE.Group(); steth.position.set(DX + 0.43 + 0.28, DY - 0.48 - 0.2, 0.07); door.add(steth); M(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 14), toon('#c9a24a'), 0, 0, 0, steth, 0.004).rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.12, 0.012, 5, 16, Math.PI), toon('#201e1d'), 0.12, 0, 0, steth, 0).rotation.z = -Math.PI / 2;
  let S = {};
  const numAt = a => ((Math.round(a / STEP) % 40) + 40) % 40, circ = (a, b) => { const d = Math.abs(a - b) % 40; return Math.min(d, 40 - d); };
  const needDir = () => S.step % 2 === 0 ? 1 : -1;
  RG.setup = (D) => { const combo = []; while (combo.length < 3) { const n = Math.floor(Math.random() * 40); if (circ(n, 0) >= 6 && combo.every(c => circ(c, n) >= 8)) combo.push(n); }
    S = { D, combo, tol: (D.lesson || D.day <= 1 || D.demo) ? 1 : 0, dialA: 0, step: 0, entered: [], misses: 0, run: { dir: 0, ext: 0 }, num: 0, open: false, openT: 0, drag: null, sig: 0, clickT: 0 }; door.rotation.y = 0; hw.rotation.z = 0; dialG.rotation.z = 0; };
  const range = () => upg('stetho') ? 9 : 6;
  const lockIn = (n, how) => { if (S.step >= 3) return; const T = S.combo[S.step]; if (circ(n, T) <= S.tol) { S.entered.push(T); S.step++; sfx('numSet'); K.vib(20); flash(S.step >= 3 ? 'ALL THREE NUMBERS · PULL THE HANDLE' : 'NUMBER ' + S.step + ' KEPT · NOW TURN ' + (needDir() > 0 ? 'RIGHT ↻' : 'LEFT ↺'), '#22c55e', 1.6); }
    else if (how === 'turn') { S.misses++; flash('NO CLICK AT ' + n + ' · KEEP LISTENING', '#e6b45a', 1.4); sfx('wrong'); } };
  const onNum = n => { S.num = n; if (S.step >= 3) return; const T = S.combo[S.step], ok = S.run.dir === needDir(), d = circ(n, T);
    if (ok && d === 0) { sfx('dialClick'); K.vib(12); S.clickT = 0.5; } else { sfx('dialTick'); if (ok && d < range()) tone(180 + (1 - d / range()) * 420, 0.05, 0.015 + (1 - d / range()) * 0.03, 'sine'); } };
  RG.turn = dA => { if (S.open || S.step >= 3 || !dA) return; S.dialA += dA; const dir = Math.sign(dA);
    if (S.run.dir === 0) S.run = { dir, ext: S.dialA };
    else if (dir === S.run.dir) { if ((S.dialA - S.run.ext) * dir > 0) S.run.ext = S.dialA; }
    else if ((S.run.ext - S.dialA) * S.run.dir > STEP * 0.7) { const stop = numAt(S.run.ext), was = S.run.dir; S.run = { dir, ext: S.dialA }; if (was === needDir()) lockIn(stop, 'turn'); }
    const n = numAt(S.dialA); if (n !== S.num) onNum(n); };
  RG.release = () => { S.dialA = Math.round(S.dialA / STEP) * STEP; if (S.step < 3 && S.run.dir === needDir() && circ(numAt(S.dialA), S.combo[S.step]) <= S.tol) lockIn(numAt(S.dialA), 'lift'); };
  const pull = () => { if (S.open) return; S.open = true; S.openT = 0; sfx('safeOpen'); flash('THE DOOR SWINGS OPEN!', '#22c55e', 1.5); K.vib(30); K.done && K.done(); };
  RG.down = p => { if (!S.combo || S.open) return; if (S.step >= 3) { if (Math.hypot(p.x - HX, p.y - HY) < 0.28) pull(); else flash('TAP THE HANDLE TO PULL THE DOOR', '#ffffff', 1.1); return; }
    const r = Math.hypot(p.x - DX, p.y - DY); if (r > 0.5) { flash('CIRCLE YOUR THUMB AROUND THE DIAL', '#ffffff', 1.1); return; } S.drag = { a: Math.atan2(p.y - DY, p.x - DX) }; };
  RG.move = p => { if (!S.drag) return; const r = Math.hypot(p.x - DX, p.y - DY); if (r < 0.03) return; const a = Math.atan2(p.y - DY, p.x - DX), d = wrapA(a - S.drag.a); S.drag.a = a; RG.turn(-d); };
  RG.up = () => { if (!S.drag) return; S.drag = null; RG.release(); };
  RG.step = (dt) => { if (!S.combo) return; dialG.rotation.z = damp(dialG.rotation.z, -S.dialA, S.drag ? 30 : 14, dt); S.clickT = Math.max(0, S.clickT - dt);
    const T = S.combo[S.step], ok = S.step < 3 && S.run.dir === needDir(); S.sig = ok ? Math.max(0, 1 - circ(S.num, T) / range()) : 0;
    notchM.color.set(S.clickT > 0 ? 0x22c55e : 0xec3013); steth.scale.setScalar(1 + S.sig * 0.25 + (S.clickT > 0 ? 0.25 : 0));
    if (S.open) { S.openT += dt; hw.rotation.z = -Math.min(1, S.openT * 3) * 1.4; door.rotation.y = -smooth(0.25, 1.4, S.openT) * 1.9; } };
  RG.info = () => S.combo ? { done: S.open, q: Math.max(0.4, 1 - 0.15 * S.misses), prog: S.open ? 1 : S.step / 3, txt: S.open ? 'DONE' : S.step >= 3 ? 'PULL' : S.step + ' / 3' } : { done: false, q: 0, txt: '' };
  RG.hint = () => { if (!S.combo || S.open) return null; if (S.step >= 3) return { p: K.wp(hw), text: 'TAP THE HANDLE TO PULL THE DOOR OPEN' };
    const ok = S.run.dir === needDir(), dir = needDir() > 0 ? 'RIGHT ↻ (CLOCKWISE)' : 'LEFT ↺ (ANTI-CLOCKWISE)';
    return { p: (S.D.lesson && S.run.dir === 0) ? K.wp(dialG) : null, text: !ok ? 'CIRCLE YOUR THUMB ' + dir : S.sig > 0.99 ? 'CLICK! LET GO TO KEEP NUMBER ' + (S.step + 1) : 'LISTEN · THE NEEDLE GROWS NEAR THE NUMBER · ' + dir }; };
  RG.frame = () => [[-0.5, 0.05], [0.5, 0.05], [-0.5, 0.92], [0.5, 0.92]];
  RG.hud = () => S.combo ? { num: S.num, need: needDir() > 0 ? 'RIGHT ↻' : 'LEFT ↺', sig: S.sig, entered: [0, 1, 2].map(i => S.entered[i] ?? null), step: S.step, pull: S.step >= 3 && !S.open, click: S.clickT > 0 } : null;
  RG.demo = () => { if (!S.combo || S.open) return 0.5; if (S.step >= 3) { pull(); return 1; } const T = S.combo[S.step], need = needDir(), d = (((T - S.num) * need) % 40 + 40) % 40;
    if (d === 0 && S.run.dir === need) { RG.release(); return 0.9; } RG.turn(need * STEP); return d < 4 ? 0.22 : 0.06; };
  RG.demoPt = () => S.combo && K.wp(dialG, 0.2 * Math.cos(-S.dialA + 1), 0.2 * Math.sin(-S.dialA + 1));
  return RG;
}

// ---------- CODE: the note (UV reveal) + a two-ring cipher wheel ----------
function codeRig(K) {
  const { ST, flash, tone, upg, sfx } = K, { M, toon } = ST, g = new THREE.Group(), RG = { kind: 'code', g };
  const PW = 1.0, PH = 0.62, PY = 0.94, CW = 1024, CH = 636; let WCX = 0, WCY = 0.33;
  M(new THREE.BoxGeometry(1.12, 0.05, 0.4), toon('#4a2c18'), 0, 0.025, -0.1, g, 0.01);
  const board = M(new THREE.BoxGeometry(1.08, 0.7, 0.03), toon('#5a3a22'), 0, PY, -0.03, g, 0.01);
  const pc = document.createElement('canvas'); pc.width = CW; pc.height = CH; const ptx = new THREE.CanvasTexture(pc); ptx.colorSpace = THREE.SRGBColorSpace;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), new THREE.MeshBasicMaterial({ map: ptx })); paper.position.set(0, PY, 0.0); g.add(paper);
  const mc = document.createElement('canvas'); mc.width = CW; mc.height = CH; const ic = document.createElement('canvas'); ic.width = CW; ic.height = CH; const cc = document.createElement('canvas'); cc.width = CW; cc.height = CH;
  const wheel = new THREE.Group(); g.add(wheel);
  const ringT = (inner) => canvasTex(512, 512, c => { c.fillStyle = inner ? '#1e2450' : '#f2e6cc'; c.beginPath(); c.arc(256, 256, 254, 0, 7); c.fill(); c.strokeStyle = inner ? '#e6c26a' : '#8a6a2a'; c.lineWidth = 6; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.stroke();
    c.fillStyle = inner ? '#e6c26a' : '#201e1d'; c.font = '900 ' + (inner ? 40 : 46) + 'px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; const r = inner ? 200 : 222;
    for (let j = 0; j < 26; j++) { const a = Math.PI / 2 - j * TAU / 26; c.save(); c.translate(256 + Math.cos(a) * r, 256 - Math.sin(a) * r); c.rotate(-a + Math.PI / 2); c.fillText(LET[j], 0, 0); c.restore(); }
    if (inner) { c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(256, 256, 40, 0, 7); c.fill(); } });
  const outer = new THREE.Mesh(new THREE.CircleGeometry(0.31, 52), new THREE.MeshBasicMaterial({ map: ringT(false) })); outer.position.z = 0.02; wheel.add(outer);
  const innerD = new THREE.Mesh(new THREE.CircleGeometry(0.235, 52), new THREE.MeshBasicMaterial({ map: ringT(true) })); innerD.position.z = 0.03; wheel.add(innerD);
  M(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 40), toon('#8a6a2a'), 0, 0, 0, wheel, 0.008, 0.32).rotation.x = Math.PI / 2;
  const ptr = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.06, 3), new THREE.MeshBasicMaterial({ color: 0xec3013 })); ptr.rotation.z = Math.PI; ptr.position.set(0, 0.35, 0.04); wheel.add(ptr);
  const win = new THREE.Mesh(new THREE.RingGeometry(0.0, 0.001, 4), new THREE.MeshBasicMaterial()); win.visible = false; wheel.add(win);
  const lamp = new THREE.Group(); g.add(lamp); { const gl = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex, color: 0x9a5cff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); gl.scale.setScalar(0.32); lamp.add(gl); RG.lampGlow = gl;
    M(new THREE.BoxGeometry(0.06, 0.26, 0.05), toon('#201e1d'), 0, -0.18, 0.08, lamp, 0.005); M(new THREE.BoxGeometry(0.1, 0.05, 0.06), toon('#6a3ac8'), 0, -0.04, 0.08, lamp, 0.005); } lamp.visible = false;
  let S = {};
  const enc = (s, k) => s.split('').map(ch => LET.includes(ch) ? LET[(LET.indexOf(ch) + k) % 26] : ch).join('');
  const dec = (s, k) => s.split('').map(ch => LET.includes(ch) ? LET[(LET.indexOf(ch) - k + 260) % 26] : ch).join('');
  const lines = msg => { const w = msg.split(' '), out = ['']; for (const x of w) { const L = out[out.length - 1]; if ((L + ' ' + x).trim().length > 13 && L) out.push(x); else out[out.length - 1] = (L + ' ' + x).trim(); } return out.slice(0, 2); };
  RG.setLayout = port => { RG.port = port; const nx = port ? 0 : 0.86, ny = port ? 0.33 : PY; if (nx !== WCX || ny !== WCY) { WCX = nx; WCY = ny; wheel.position.set(WCX, WCY, 0.0); } }; RG.setLayout(true); wheel.position.set(WCX, WCY, 0);
  const draw = () => { const c = pc.getContext('2d'); c.fillStyle = '#efe2c4'; c.fillRect(0, 0, CW, CH); c.fillStyle = 'rgba(160,120,60,0.18)'; c.fillRect(CW / 2 - 2, 0, 4, CH); c.fillRect(0, CH / 2 - 2, CW, 4); c.fillStyle = 'rgba(140,90,40,0.15)'; c.beginPath(); c.arc(820, 520, 70, 0, 7); c.fill();
    c.fillStyle = '#6a5a4a'; c.font = '800 34px Archivo, Arial'; c.textBaseline = 'top'; c.fillText(S.D && S.D.lesson ? "RAFIQ'S PRACTICE SLIP" : 'FOR ONE PAIR OF EYES', 40, 30);
    c.save(); c.translate(800, 40); c.rotate(0.06); c.strokeStyle = '#4a4a52'; c.lineWidth = 4; c.strokeRect(0, 0, 190, 80); c.fillStyle = '#3a3a42'; c.font = 'italic 800 44px Archivo, Arial'; c.fillText('A = ' + LET[S.key], 18, 16); c.restore();
    if (S.phase === 'uv') { c.fillStyle = 'rgba(38,16,72,0.62)'; c.fillRect(0, 0, CW, CH); const x = cc.getContext('2d'); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, CW, CH); x.drawImage(ic, 0, 0); x.globalCompositeOperation = 'destination-in'; x.drawImage(mc, 0, 0); x.globalCompositeOperation = 'source-over'; c.drawImage(cc, 0, 0); }
    else { c.fillStyle = S.solved ? '#8a7a6a' : '#4a2a7a'; c.font = '900 ' + S.fs + 'px "Courier New", monospace'; c.textBaseline = 'middle'; S.L.forEach((t, i) => c.fillText(enc(t, S.key), 60, S.ly[i]));
      const d = S.solved ? S.L : S.L.map(t => dec(enc(t, S.key), S.shift)); c.fillStyle = S.solved ? '#1f6a3a' : '#6a6a72'; c.font = '900 ' + Math.round(S.fs * 0.82) + 'px "Courier New", monospace';
      d.forEach((t, i) => c.fillText((i ? '  ' : '→ ') + t, 40, CH - 150 + i * S.fs * 0.9 - (d.length - 1) * 10));
      if (S.solved) { c.save(); c.translate(760, 300); c.rotate(-0.25); c.strokeStyle = '#c42d3c'; c.lineWidth = 10; c.strokeRect(-130, -46, 260, 92); c.fillStyle = '#c42d3c'; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.fillText('DECODED', 0, 4); c.restore(); } }
    ptx.needsUpdate = true; };
  RG.setup = (D, job) => { const msg = (job && job.msg) || P(MESSAGES), key = (job && job.key) || (3 + Math.floor(Math.random() * 20)); const L = lines(msg), fs = 92;
    S = { D, msg, key, L, fs, ly: L.map((_, i) => 200 + i * 112), phase: 'uv', shift: 0, rot: 0, solved: false, misses: 0, letters: [], prog: 0, drag: null, lampOn: false, lamp: { x: 0, y: 0 } };
    const x = ic.getContext('2d'); x.clearRect(0, 0, CW, CH); x.font = '900 ' + fs + 'px "Courier New", monospace'; x.textBaseline = 'middle'; x.shadowColor = '#c8ff6a'; x.shadowBlur = 24; x.fillStyle = '#d8ff8a';
    L.forEach((t, i) => { const e = enc(t, key); x.fillText(e, 60, S.ly[i]); for (let k = 0; k < e.length; k++) if (e[k] !== ' ') { const cx = 60 + x.measureText(e.slice(0, k)).width + x.measureText(e[k]).width / 2; S.letters.push({ cx, cy: S.ly[i], rev: false }); } });
    mc.getContext('2d').clearRect(0, 0, CW, CH); innerD.rotation.z = 0; lamp.visible = false; draw(); };
  const toCv = (x, y) => ({ cx: (x / PW + 0.5) * CW, cy: (0.5 - (y - PY) / PH) * CH });
  const rub = (x, y) => { const { cx, cy } = toCv(x, y), r = (upg('uv') ? 0.14 : 0.095) * CW, m = mc.getContext('2d'), gr = m.createRadialGradient(cx, cy, 0, cx, cy, r); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.7, 'rgba(0,0,0,0.9)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); m.fillStyle = gr; m.beginPath(); m.arc(cx, cy, r, 0, 7); m.fill();
    let n = 0; S.letters.forEach(l => { if (!l.rev && Math.hypot(l.cx - cx, l.cy - cy) < r * 0.8) l.rev = true; if (l.rev) n++; }); S.prog = n / S.letters.length; sfx('uvRub');
    if (S.prog >= 0.9) { S.phase = 'wheel'; S.lampOn = false; lamp.visible = false; flash('THE INK SHOWS · NOW TURN THE WHEEL', '#22c55e', 1.6); sfx('reveal'); K.relayout && K.relayout(); } draw(); };
  RG.setShift = s => { s = ((s % 26) + 26) % 26; if (s === S.shift) return; S.shift = s; sfx('wheel'); draw(); };
  RG.lockIn = () => { if (S.phase !== 'wheel' || S.solved) return; if (S.shift === S.key) { S.solved = true; draw(); flash('DECODED: ' + S.msg, '#22c55e', 2.4); sfx('decoded'); K.vib(20); K.done && K.done(); }
    else { S.misses++; flash('THAT IS NOT A MESSAGE · TURN THE WHEEL AGAIN', '#e6b45a', 1.5); sfx('wrong'); } };
  RG.down = (p, off) => { if (!S.L || S.solved) return; if (S.phase === 'uv') { S.lampOn = true; S.off = off; S.lamp = { x: p.x, y: p.y + off }; lamp.visible = true; rub(S.lamp.x, S.lamp.y); return; }
    if (Math.hypot(p.x - WCX, p.y - WCY) < 0.42) S.drag = { a: Math.atan2(p.y - WCY, p.x - WCX) }; else flash('TURN THE WHEEL · THEN TAP LOCK IN', '#ffffff', 1.1); };
  RG.move = p => { if (S.phase === 'uv' && S.lampOn) { S.lamp = { x: p.x, y: p.y + S.off }; rub(S.lamp.x, S.lamp.y); return; } if (!S.drag) return; const a = Math.atan2(p.y - WCY, p.x - WCX); S.rot += wrapA(a - S.drag.a); S.drag.a = a; RG.setShift(Math.round(S.rot / (TAU / 26))); };
  RG.up = () => { S.lampOn = false; lamp.visible = false; if (S.drag) { S.drag = null; S.rot = S.shift * TAU / 26; } };
  RG.step = (dt, t) => { if (!S.L) return; innerD.rotation.z = damp(innerD.rotation.z, S.drag ? S.rot : S.shift * TAU / 26, 18, dt); lamp.position.set(S.lamp.x, S.lamp.y, 0.06); RG.lampGlow.material.opacity = 0.7 + Math.sin(t * 20) * 0.15; };
  RG.dim = () => S.L && S.phase === 'uv' && !S.solved; RG.lampOn = () => !!(S.L && S.lampOn);
  RG.info = () => S.L ? { done: S.solved, q: Math.max(0.4, 1 - 0.2 * S.misses), prog: S.solved ? 1 : S.phase === 'uv' ? S.prog * 0.5 : 0.5, txt: S.solved ? 'DONE' : S.phase === 'uv' ? 'INK ' + Math.round(S.prog * 100) + '%' : 'WHEEL' } : { done: false, q: 0, txt: '' };
  RG.hint = () => { if (!S.L || S.solved) return null; if (S.phase === 'uv') { const l = S.letters.find(q => !q.rev); return { p: l ? K.wp(g, (l.cx / CW - 0.5) * PW, PY + (0.5 - l.cy / CH) * PH) : null, text: 'RUB THE UV LAMP OVER THE NOTE · INK ' + Math.round(S.prog * 100) + '%' }; }
    if (S.shift === S.key && (S.D.lesson || S.D.day <= 2)) return { text: 'IT READS! TAP LOCK IN' };
    return { p: S.D.lesson ? K.wp(wheel) : null, text: (S.D.lesson || S.D.day <= 2) ? 'TURN THE WHEEL UNTIL A SITS OVER ' + LET[S.key] + ' (THE CLUE) · THEN LOCK IN' : 'READ THE CLUE · TURN THE WHEEL · LOCK IN WHEN IT READS' }; };
  RG.frame = () => { const port = RG.port !== false; if (S.phase === 'uv') return [[-0.52, PY - 0.33], [0.52, PY - 0.33], [-0.52, PY + 0.33], [0.52, PY + 0.33]]; return port ? [[-0.56, 0.0], [0.56, 0.0], [-0.56, PY + 0.34], [0.56, PY + 0.34]] : [[-0.56, PY - 0.36], [1.2, PY - 0.36], [-0.56, PY + 0.34], [1.2, PY + 0.34]]; };
  RG.hud = () => S.L ? { phase: S.phase, prog: S.prog, pair: 'A → ' + LET[S.shift], clue: 'A = ' + LET[S.key], canLock: S.phase === 'wheel' && !S.solved, reads: S.shift === S.key } : null;
  RG.demo = () => { if (!S.L || S.solved) return 0.5; if (S.phase === 'uv') { const l = S.letters.find(q => !q.rev); if (!l) return 0.2; const x = (l.cx / CW - 0.5) * PW, y = PY + (0.5 - l.cy / CH) * PH; S.lamp = { x, y }; lamp.visible = true; rub(x, y); return 0.09; }
    lamp.visible = false; if (S.shift !== S.key) { const d = ((S.key - S.shift) % 26 + 26) % 26; RG.setShift(S.shift + (d <= 13 ? 1 : -1)); S.rot = S.shift * TAU / 26; return 0.12; } RG.lockIn(); return 1; };
  RG.demoPt = () => S.L && (S.phase === 'uv' ? K.wp(g, S.lamp.x, S.lamp.y) : K.wp(wheel, 0.2 * Math.cos(innerD.rotation.z + 1), 0.2 * Math.sin(innerD.rotation.z + 1)));
  return RG;
}

// ---------- SWEEP: bug wand over the client's item ----------
function sweepRig(K) {
  const { ST, flash, tone, upg, sfx } = K, { M, toon } = ST, g = new THREE.Group(), RG = { kind: 'sweep', g };
  M(new THREE.BoxGeometry(1.15, 0.03, 0.6), toon('#2f5a3a'), 0, 0.015, -0.1, g, 0.008);
  const tray = new THREE.Group(); tray.position.set(0.48, 0.03, 0.12); g.add(tray); M(new THREE.CylinderGeometry(0.09, 0.07, 0.03, 16), toon('#d7dde3'), 0, 0.015, 0, tray, 0.005, 0.09);
  const objG = new THREE.Group(); g.add(objG);
  const wand = new THREE.Group(); g.add(wand); const ringM = new THREE.MeshBasicMaterial({ color: 0x22c55e }); M(new THREE.TorusGeometry(0.09, 0.016, 6, 26), ringM, 0, 0, 0, wand, 0); const wpulse = new THREE.Mesh(new THREE.RingGeometry(0.08, 0.1, 30), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0, depthWrite: false })); wand.add(wpulse); M(new THREE.BoxGeometry(0.035, 0.28, 0.03), toon('#3a3836'), 0, -0.21, 0, wand, 0.005);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: 0x22c55e })); led.position.set(0, -0.1, 0.02); wand.add(led); wand.visible = false;
  let S = {};
  RG.setup = (D, job) => { while (objG.children.length) objG.remove(objG.children[0]); const kind = (job && job.sweepObj) || 'lamp', O = makeObj(ST, kind); O.g.position.set(-0.05, 0.03, 0); O.g.scale.setScalar(kind === 'case' ? 1.3 : 1.42); objG.add(O.g);
    const n = D.lesson ? 1 : D.demo ? 2 : clamp(1 + Math.floor(D.day / 2), 1, 3), spots = shuffle(O.spots.slice()).slice(0, n), sc = O.g.scale.x;
    const bugs = spots.map(([x, y, z]) => { const b = new THREE.Group(); b.position.set(-0.05 + x * sc, 0.03 + y * sc, z * sc + 0.01); g.add(b); M(new THREE.CylinderGeometry(0.042, 0.042, 0.02, 14), toon('#201e1d'), 0, 0, 0, b, 0.006).rotation.x = Math.PI / 2; const l = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2030 })); l.position.z = 0.016; b.add(l); const lg = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex, color: 0xff2030, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); lg.scale.setScalar(0.2); lg.position.z = 0.02; l.add(lg); for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.05, 0.006, 0.006), toon('#201e1d'), s * 0.042, 0, 0, b, 0).rotation.z = s * 0.5; b.visible = false; return { b, l, x: b.position.x, y: b.position.y, found: false, pulled: false, t: 0, fly: 0 }; });
    if (S.bugs) S.bugs.forEach(q => g.remove(q.b)); S = { D, kind, bugs, on: false, w: { x: -0.5, y: 0.5 }, sig: 0, bt: 0, findT: 0, off: 0.12, name: ITEMS[kind] ? ITEMS[kind].name : 'ITEM' }; wand.visible = false; };
  const RANGE = () => upg('wand') ? 0.5 : 0.36, FIND = 0.06;
  const pull = b => { b.pulled = true; b.fly = 0.001; sfx('pluck'); K.vib(15); const left = S.bugs.filter(q => !q.pulled).length; flash(left ? 'BUG OUT · ' + left + ' MORE IN THERE' : 'CLEAN · NO MORE BUGS', '#22c55e', 1.3); if (!left) { K.done && K.done(); wand.visible = false; S.on = false; } };
  RG.down = (p, off) => { if (!S.bugs) return; const b = S.bugs.find(q => q.found && !q.pulled && Math.hypot(p.x - q.x, p.y - q.y) < 0.11); if (b) { pull(b); return; } S.on = true; S.off = off; S.w = { x: p.x, y: p.y + off }; wand.visible = true; };
  RG.hover = p => { if (!S.bugs || S.bugs.every(q => q.pulled)) return; S.on = true; S.w = { x: p.x, y: p.y + 0.0 }; wand.visible = true; S.hoverT = 0.3; };
  RG.move = p => { if (S.on) S.w = { x: p.x, y: p.y + (S.off || 0) }; };
  RG.up = () => { if (!S.hoverT) S.on = false; };
  RG.step = (dt, t) => { if (!S.bugs) return; if (S.hoverT) { S.hoverT -= dt; if (S.hoverT <= 0) { S.hoverT = 0; S.on = false; } }
    wand.position.set(S.w.x, S.w.y, 0.18); wand.visible = S.on || S.D.demo; let best = null, bd = 9; S.bugs.forEach(q => { if (q.found) return; const d = Math.hypot(S.w.x - q.x, S.w.y - q.y); if (d < bd) { bd = d; best = q; } });
    const raw = S.on && best ? clamp(1 - bd / RANGE(), 0, 1) : 0; S.sig = damp(S.sig, raw, 10, dt);
    if (S.sig > 0.03) { S.bt -= dt; if (S.bt <= 0) { sfx('beep', S.sig); S.bt = 0.55 - S.sig * 0.48; led.scale.setScalar(1.8); wpulse.scale.setScalar(1); wpulse.material.opacity = 0.9; } } led.scale.setScalar(damp(led.scale.x, 1, 10, dt)); const sc = S.sig > 0.6 ? 0xff2030 : S.sig > 0.2 ? 0xffd23a : 0x22c55e; led.material.color.set(sc); ringM.color.set(sc); wpulse.material.color.set(sc); wpulse.scale.setScalar(wpulse.scale.x + dt * 3); wpulse.material.opacity = Math.max(0, wpulse.material.opacity - dt * 2.2);
    if (S.on && best && bd < FIND) { S.findT += dt; if (S.findT > 0.2) { best.found = true; best.b.visible = true; best.t = 0; S.findT = 0; flash('BUG FOUND · TAP IT TO PULL IT OUT', '#22c55e', 1.6); sfx('bugFound'); K.vib(25); } } else S.findT = 0;
    S.bugs.forEach(q => { if (q.found && !q.pulled) { q.t += dt; q.b.scale.setScalar(1 + Math.max(0, 0.6 - q.t) + Math.sin(t * 8) * 0.06); q.l.visible = Math.sin(t * 12) > -0.3; }
      if (q.fly > 0 && q.fly < 1) { q.fly = Math.min(1, q.fly + dt * 2); const a = new THREE.Vector3(q.x, q.y, 0.1), b = new THREE.Vector3(0.48 + R(-0.03, 0.03) * 0, 0.08, 0.12); q.b.position.lerpVectors(a, b, q.fly); q.b.position.y += Math.sin(q.fly * Math.PI) * 0.25; q.b.scale.setScalar(1); q.l.visible = q.fly < 1; } }); };
  RG.info = () => { if (!S.bugs) return { done: false, q: 0, txt: '' }; const p = S.bugs.filter(q => q.pulled).length; return { done: p === S.bugs.length, q: 1, prog: p / S.bugs.length, txt: p === S.bugs.length ? 'DONE' : p + ' / ' + S.bugs.length + ' BUGS' }; };
  RG.hint = () => { if (!S.bugs) return null; const f = S.bugs.find(q => q.found && !q.pulled); if (f) return { p: K.wp(f.b), text: 'TAP THE BUG TO PULL IT OUT' }; if (S.bugs.every(q => q.pulled)) return null;
    return { text: (ST.touch ? 'DRAG THE WAND' : 'MOVE THE WAND') + ' OVER THE ' + S.name + ' · THE BEEPS GET FASTER NEAR A BUG' }; };
  RG.frame = () => [[-0.6, 0.0], [0.62, 0.0], [-0.6, 0.8], [0.62, 0.8]];
  RG.hud = () => S.bugs ? { sig: S.sig, found: S.bugs.filter(q => q.found && !q.pulled).length, left: S.bugs.filter(q => !q.pulled).length, n: S.bugs.length } : null;
  RG.demo = () => { if (!S.bugs) return 0.5; const f = S.bugs.find(q => q.found && !q.pulled); if (f) { pull(f); return 1.0; } const b = S.bugs.find(q => !q.pulled); if (!b) return 0.5;
    S.on = true; S.dm = (S.dm || 0) + 0.12; const ax = b.x - S.w.x, ay = b.y - S.w.y, d = Math.hypot(ax, ay); if (d > 0.04) { S.w = { x: S.w.x + ax * 0.12 + Math.sin(S.dm * 3) * 0.02 * Math.min(1, d * 4), y: S.w.y + ay * 0.12 }; } else S.w = { x: b.x, y: b.y }; return 0.05; };
  RG.demoPt = () => S.bugs && K.wp(g, S.w.x, S.w.y);
  return RG;
}

// ---------- LASER: glass case with beam gates; the glove follows your drag (relative) ----------
function laserRig(K) {
  const { ST, flash, tone, upg, sfx } = K, { M, toon } = ST, g = new THREE.Group(), RG = { kind: 'laser', g };
  const X0 = -0.56, X1 = 0.56, Y0 = 0.13, Y1 = 0.9, START = { x: -0.46, y: 0.5 }, PRIZE = { x: 0.45, y: 0.5 };
  M(new THREE.BoxGeometry(1.24, 0.86, 0.04), toon('#5a1020'), 0, 0.51, -0.09, g, 0.008);
  const brass = toon('#c9a24a'); M(new THREE.BoxGeometry(1.32, 0.08, 0.2), brass, 0, 0.06, -0.02, g, 0.01); M(new THREE.BoxGeometry(1.32, 0.06, 0.2), brass, 0, 0.96, -0.02, g, 0.01); for (const x of [-0.63, 0.63]) M(new THREE.BoxGeometry(0.06, 0.9, 0.2), brass, x, 0.51, -0.02, g, 0.01);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.84), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.06, depthWrite: false })); glass.position.set(0, 0.51, 0.075); g.add(glass);
  { const t = canvasTex(128, 128, c => { c.strokeStyle = '#e6c26a'; c.lineWidth = 6; c.setLineDash([10, 8]); c.beginPath(); c.arc(64, 64, 52, 0, 7); c.stroke(); c.setLineDash([]); c.fillStyle = '#e6c26a'; c.font = '900 22px Archivo, Arial'; c.textAlign = 'center'; c.fillText('START', 64, 72); }); const s = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.16), new THREE.MeshBasicMaterial({ map: t, transparent: true })); s.position.set(START.x, START.y, -0.065); g.add(s); }
  M(new THREE.BoxGeometry(0.1, 0.24, 0.1), toon('#3a0a14'), PRIZE.x, PRIZE.y - 0.17, -0.04, g, 0.006);
  const prizeG = new THREE.Group(); g.add(prizeG);
  const hand = new THREE.Group(); g.add(hand); { const wm = toon('#f4f1e8'); M(new THREE.SphereGeometry(0.035, 12, 8), wm, 0, 0, 0, hand, 0.006).scale.set(1, 1.1, 0.6); for (let i = 0; i < 3; i++) M(new THREE.CapsuleGeometry(0.009, 0.035, 3, 6), wm, -0.02 + i * 0.02, 0.05, 0, hand, 0.004); M(new THREE.CapsuleGeometry(0.009, 0.025, 3, 6), wm, 0.04, 0.005, 0, hand, 0.004).rotation.z = -1; M(new THREE.CylinderGeometry(0.03, 0.035, 0.04, 10), toon('#1e2450'), 0, -0.05, 0, hand, 0.004); hand.scale.setScalar(1.25); const hr = new THREE.Mesh(new THREE.RingGeometry(0.033, 0.043, 28), new THREE.MeshBasicMaterial({ color: 0xffd23a })); hr.position.z = 0.03; hand.add(hr); RG.handRing = hr; }
  const beamM = new THREE.MeshBasicMaterial({ color: 0xff2030, transparent: true }), haloM = new THREE.MeshBasicMaterial({ color: 0xff3040, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
  const gatesG = new THREE.Group(); g.add(gatesG);
  let S = {};
  const HR = () => upg('gloves') ? 0.032 : 0.045;
  RG.setup = (D, job) => { while (gatesG.children.length) gatesG.remove(gatesG.children[0]); while (prizeG.children.length) prizeG.remove(prizeG.children[0]);
    const day = D.day || 1, n = D.lesson ? 2 : D.demo ? 3 : day <= 1 ? 2 : day <= 3 ? 3 : 4, gates = [];
    const kinds = D.lesson || day <= 1 ? [] : day === 2 || D.demo ? ['slide'] : day === 3 ? ['slide', 'blink'] : ['slide', 'blink', 'slide'];
    for (let i = 0; i < n; i++) { const x = -0.3 + (i + 0.5) * 0.6 / n, kind = kinds.length ? (kinds[(i + 1) % n] || 'static') : 'static';
      const G = { x, kind: D.idle ? (i % 2 ? 'slide' : 'static') : kind, base: R(0.34, 0.68), gh: 0.21, amp: 0.13, w: R(0.9, 1.4), ph: R(0, 6), on: true, gy: 0.5, meshes: [] };
      for (const yy of [Y0 - 0.02, Y1 + 0.02]) M(new THREE.BoxGeometry(0.05, 0.03, 0.06), toon('#2a2a30'), x, yy, 0.0, gatesG, 0.004);
      for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1, 0.012), beamM); b.position.set(x, 0.5, 0.0); gatesG.add(b); const h = new THREE.Mesh(new THREE.BoxGeometry(0.085, 1, 0.004), haloM); h.position.set(x, 0.5, -0.006); gatesG.add(h); G.meshes.push([b, h]); }
      gates.push(G); }
    const pz = (job && job.prize) || P(PRIZES); const pm = K.gadget(pz.k, 0, 0, 0, prizeG, pz.k === 'pack' ? 0.9 : 1.2); pm.position.y = -0.05; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex, color: 0xffd23a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.6 })); sp.scale.setScalar(0.22); sp.position.set(0, 0.03, -0.02); prizeG.add(sp); RG.spark = sp;
    S = { D, gates, hand: { ...START }, carry: false, done: false, alarms: 0, alarmT: 0, dustT: 0, t: 0, drag: null, prize: pz, faint: !D.idle && !D.lesson && day >= 4, lenient: D.lesson || day <= 1 || D.demo }; prizeG.position.set(PRIZE.x, PRIZE.y, 0.0); hand.visible = !D.idle; };
  const gateAt = (G, t) => { const gy = clamp(G.base + (G.kind === 'slide' ? G.amp * Math.sin(t * G.w + G.ph) : 0), Y0 + G.gh / 2 + 0.03, Y1 - G.gh / 2 - 0.03); const cyc = 3.0, ph = ((t + G.ph) % cyc + cyc) % cyc; return { gy, on: G.kind !== 'blink' || ph < 1.7, warn: G.kind === 'blink' && ph > 2.7 }; };
  const hit = (x, y) => { const r = HR(); for (const G of S.gates) { if (!G.on) continue; if (Math.abs(x - G.x) < r + 0.007 && (y - r < G.gy - G.gh / 2 || y + r > G.gy + G.gh / 2)) return true; } return false; };
  const alarm = () => { S.alarms++; S.alarmT = 1.3; flash('ALARM! BACK TO THE START', '#ec3013', 1.5); sfx('alarm'); K.vib([80, 40, 80]); S.hand = { ...START }; S.drag = null; if (S.carry && !S.lenient) { S.carry = false; flash('ALARM! THE ORDER GOES BACK ON ITS STAND', '#ec3013', 1.6); } };
  const moveHand = (dx, dy) => { if (S.done) return; const r = HR(), len = Math.hypot(dx, dy), n = Math.max(1, Math.ceil(len / 0.006));
    for (let i = 0; i < n; i++) { const nx = clamp(S.hand.x + dx / n, X0 + r, X1 - r), ny = clamp(S.hand.y + dy / n, Y0 + r, Y1 - r); if (hit(nx, ny)) { alarm(); return; } S.hand.x = nx; S.hand.y = ny; }
    if (!S.carry && Math.hypot(S.hand.x - PRIZE.x, S.hand.y - PRIZE.y) < 0.075) { S.carry = true; flash('GOT IT · NOW BRING IT BACK OUT', '#22c55e', 1.5); sfx('grab'); K.vib(15); }
    else if (S.carry && Math.hypot(S.hand.x - START.x, S.hand.y - START.y) < 0.07) { S.done = true; flash('CLEAN GRAB! NOT ONE BEAM TOUCHED' + (S.alarms ? '... THIS TIME' : ''), '#22c55e', 1.8); sfx('decoded'); K.vib(25); K.done && K.done(); } };
  RG.down = p => { if (!S.gates || S.done || S.D.idle) return; S.drag = { x: p.x, y: p.y }; };
  RG.move = p => { if (!S.drag) return; const dx = p.x - S.drag.x, dy = p.y - S.drag.y; S.drag = { x: p.x, y: p.y }; moveHand(dx, dy); };
  RG.up = () => { S.drag = null; };
  RG.dust = () => { if (!S.gates || S.dustT > 1) return; S.dustT = 4; sfx('dust'); for (let i = 0; i < 10; i++) { const w = K.wp(g, R(-0.5, 0.5), R(0.2, 0.85)); ST.puff(w.x, w.y, w.z + 0.05, 0xf2e6cc, 1); } };
  RG.step = (dt, t) => { if (!S.gates) return; S.t += dt; S.alarmT = Math.max(0, S.alarmT - dt); S.dustT = Math.max(0, S.dustT - dt);
    const vis = S.faint && S.dustT <= 0 ? 0.1 : 1;
    S.gates.forEach(G => { const st = gateAt(G, S.t); G.gy = st.gy; G.on = st.on; const lo = G.gy - G.gh / 2, hi = G.gy + G.gh / 2, op = (G.on ? 1 : st.warn ? (Math.sin(S.t * 40) > 0 ? 0.4 : 0) : 0) * vis;
      const segs = [[Y0 - 0.01, lo], [hi, Y1 + 0.01]]; G.meshes.forEach(([b, h], k) => { const [a, c] = segs[k]; b.scale.y = h.scale.y = Math.max(0.001, c - a); b.position.y = h.position.y = (a + c) / 2; b.visible = h.visible = op > 0.01; }); });
    beamM.opacity = vis; haloM.opacity = 0.4 * vis * (0.8 + 0.2 * Math.sin(t * 10));
    if (!S.done && !S.D.idle && hit(S.hand.x, S.hand.y)) alarm();
    hand.position.set(S.hand.x, S.hand.y, 0.03); if (RG.handRing) RG.handRing.scale.setScalar(HR() / 0.045); hand.rotation.z = Math.sin(t * 3) * 0.05;
    if (S.carry) prizeG.position.set(S.hand.x + 0.03, S.hand.y + 0.05, 0.04); else prizeG.position.set(PRIZE.x, PRIZE.y, 0.0); prizeG.rotation.y += dt * 0.8; if (RG.spark) { RG.spark.material.opacity = 0.35 + 0.3 * Math.sin(t * 4); RG.spark.scale.setScalar(0.2 + 0.04 * Math.sin(t * 6)); } };
  RG.alarmK = () => S.alarmT > 0 ? 1 : 0;
  RG.prox = () => { if (!S.gates || S.done || S.D.idle) return 0; let d = 9; for (const G of S.gates) if (G.on) { const dx = Math.abs(S.hand.x - G.x); const inGap = S.hand.y > G.gy - G.gh / 2 && S.hand.y < G.gy + G.gh / 2; d = Math.min(d, inGap ? Math.hypot(dx, Math.min(Math.abs(S.hand.y - (G.gy - G.gh / 2)), Math.abs(S.hand.y - (G.gy + G.gh / 2)))) : dx); } return clamp(1 - d / 0.2, 0, 1); };
  RG.carrying = () => !!(S.gates && S.carry && !S.done);
  RG.info = () => S.gates ? { done: S.done, q: Math.max(0.4, 1 - 0.2 * S.alarms), prog: S.done ? 1 : S.carry ? 0.5 : 0, txt: S.done ? 'DONE' : S.carry ? 'BRING IT OUT' : S.alarms ? S.alarms + (S.alarms > 1 ? ' ALARMS' : ' ALARM') : 'GRAB IT' } : { done: false, q: 0, txt: '' };
  RG.hint = () => { if (!S.gates || S.done || S.D.idle) return null; if (S.faint && S.dustT <= 0) return { text: 'THE BEAMS ARE HARD TO SEE · TAP DUST' };
    return S.carry ? { p: K.wp(g, START.x, START.y), text: 'BRING THE ' + S.prize.name + ' BACK TO THE START · MIND THE BEAMS' } : { p: S.D.lesson ? K.wp(g, PRIZE.x, PRIZE.y) : null, text: 'DRAG ANYWHERE TO MOVE THE GLOVE · SLIP THROUGH THE GAPS TO THE ' + S.prize.name }; };
  RG.frame = () => [[-0.68, 0.02], [0.68, 0.02], [-0.68, 0.99], [0.68, 0.99]];
  RG.hud = () => S.gates ? { carry: S.carry, alarms: S.alarms, faint: S.faint, dustOn: S.dustT > 0, prize: S.prize.name } : null;
  RG.demoTick = (dt) => { if (!S.gates || S.done) return; const goal = S.carry ? START : PRIZE, dir = Math.sign(goal.x - S.hand.x) || 1, sp = 0.5 * dt;
    const next = S.gates.filter(G => (G.x - S.hand.x) * dir > -0.005).sort((a, b) => (a.x - b.x) * dir)[0];
    let tx = goal.x, ty = goal.y; if (next) { const pre = next.x - dir * 0.085; if ((pre - S.hand.x) * dir > 0.004) { tx = pre; ty = next.gy; } else { const safe = Math.abs(S.hand.y - next.gy) < next.gh / 2 - HR() - 0.025; if (safe) { tx = next.x + dir * 0.09; ty = next.gy; } else { tx = S.hand.x; ty = next.gy; } } }
    const dx = tx - S.hand.x, dy = ty - S.hand.y, d = Math.hypot(dx, dy), k = Math.min(1, (next && Math.abs(next.x - S.hand.x) < 0.1 ? sp * 2.2 : sp) / Math.max(d, 1e-6)); moveHand(dx * k, dy * k); };
  RG.demoPt = () => S.gates && K.wp(hand);
  return RG;
}


// ======================= SOUND: shared room (reverb) + SFX + MUSIC =======================
// Everything is synthesised with WebAudio (no files needed, tiny on a phone) and played through a small "shop room" reverb.
// spyRoom(audio)  → { ctx, sfx, music, wet } buses, built after the first tap (audio.init()).
// spySfx(audio)   → play(name, arg) one-shots · loop(name, level 0..1) for the UV hum + laser buzz. Names are listed in SFX_NAMES.
// spyMusic(audio) → "Quiet Trade": KUFA/KUFA-spy.mp3 if that file sits next to the page, else a synth piece in D phrygian dominant
//                   (oud plucks, ney flute, darbuka + riq, drone; A and B sections). tick(mode) with mode calm | work | tense | dim.
export const SFX_NAMES = ['click', 'pinTick', 'pinSet', 'tension', 'drop', 'overset', 'scrape', 'unlock', 'dialTick', 'dialClick', 'numSet', 'safeOpen', 'wrong', 'uvRub', 'reveal', 'wheel', 'decoded', 'paper', 'beep', 'bugFound', 'pluck', 'alarm', 'grab', 'dust', 'coins', 'stars', 'beads', 'bell', 'step', 'bookcase', 'buy', 'lesson'];
function spyRoom(audio) {
  if (audio.__spyRoom) return audio.__spyRoom; const c = audio.ctx; if (!c || !audio.master) return null;
  const len = Math.floor(c.sampleRate * 1.6), ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < len; i++) { const k = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 3.2) * (i < 400 ? i / 400 : 1); } }
  const conv = c.createConvolver(); conv.buffer = ir; const wet = c.createGain(); wet.gain.value = 0.32; conv.connect(wet); wet.connect(audio.master);
  const sfx = c.createGain(); sfx.gain.value = 0.9; sfx.connect(audio.master); const sfxSend = c.createGain(); sfxSend.gain.value = 0.22; sfx.connect(sfxSend); sfxSend.connect(conv);
  const music = c.createGain(); music.gain.value = 0.5; music.connect(audio.master); const musSend = c.createGain(); musSend.gain.value = 0.35; music.connect(musSend); musSend.connect(conv);
  const nb = c.createBuffer(1, c.sampleRate, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nd.length; i++) nd[i] = Math.random() * 2 - 1;
  try { if (audio.wind) audio.wind.gain.value = 0; if (audio.rain) audio.rain.gain.value = 0; if (audio.water) audio.water.gain.value = 0; } catch (e) {}
  return (audio.__spyRoom = { ctx: c, sfx, music, conv, nb });
}
function synth(room) {
  const c = room.ctx;
  const osc = (type, f, t, dur, vol, o = {}) => { const s = c.createOscillator(), g = c.createGain(); s.type = type; s.frequency.setValueAtTime(f, t); if (o.slide) s.frequency.exponentialRampToValueAtTime(Math.max(20, f * o.slide), t + (o.slideT || dur)); if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = f * 0.012; l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t + dur + 0.05); }
    const a = o.attack || 0.004; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); if (o.hold) g.gain.setValueAtTime(vol, t + a + o.hold); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let n = g; if (o.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; g.connect(f2); n = f2; } s.connect(g); n.connect(o.dest || room.sfx); s.start(t); s.stop(t + dur + 0.05); return s; };
  const nz = (t, dur, vol, o = {}) => { const s = c.createBufferSource(); s.buffer = room.nb; const f = c.createBiquadFilter(); f.type = o.type || 'bandpass'; f.frequency.setValueAtTime(o.f || 2000, t); if (o.sweep) f.frequency.exponentialRampToValueAtTime(o.sweep, t + dur); f.Q.value = o.q || 1; const g = c.createGain();
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + (o.attack || 0.002)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(f); f.connect(g); g.connect(o.dest || room.sfx); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05); };
  return { osc, nz };
}
export function spySfx(audio) {
  let room = null, S = null; const last = {}, loops = {};
  const ready = () => { if (room) return true; room = spyRoom(audio); if (!room) return false; S = synth(room); return true; };
  const N = n => 440 * Math.pow(2, (n - 69) / 12);
  function play(name, a) { if (!ready()) return; const c = room.ctx, t = c.currentTime + 0.005, { osc, nz } = S, now = performance.now();
    const gap = { scrape: 70, uvRub: 90, dialTick: 25, wheel: 30, step: 0, pinTick: 120 }[name]; if (gap) { if (now - (last[name] || 0) < gap) return; last[name] = now; }
    switch (name) {
      case 'click': nz(t, 0.02, 0.35, { f: 4200, q: 3 }); osc('sine', 2600, t, 0.04, 0.05); break;
      case 'pinTick': osc('square', 1500, t, 0.025, 0.03, { lp: 3000 }); nz(t, 0.015, 0.12, { f: 6000, q: 4 }); break;
      case 'pinSet': nz(t, 0.025, 0.7, { f: 3200, q: 2.5 }); osc('triangle', 1760, t, 0.14, 0.12, { slide: 0.97 }); osc('sine', 3520, t, 0.4, 0.04); osc('sine', 260, t, 0.08, 0.15, { slide: 0.6 }); break;
      case 'tension': for (let i = 0; i < 3; i++) nz(t + i * 0.028, 0.02, 0.4, { f: 2600 + i * 300, q: 3 }); osc('sine', 330, t, 0.1, 0.05, { slide: 1.2 }); break;
      case 'drop': for (let i = 0; i < 4; i++) nz(t + i * 0.035 + Math.random() * 0.01, 0.03, 0.35, { f: 3500 - i * 400, q: 3 }); osc('sine', 140, t + 0.05, 0.18, 0.18, { slide: 0.5 }); break;
      case 'overset': osc('sawtooth', 150, t, 0.3, 0.1, { slide: 0.55, lp: 900 }); nz(t, 0.25, 0.35, { type: 'lowpass', f: 900 }); nz(t + 0.02, 0.12, 0.2, { f: 5200, q: 6 }); break;
      case 'scrape': nz(t, 0.06, 0.06, { f: 6500, q: 5 }); break;
      case 'unlock': nz(t, 0.09, 0.6, { type: 'lowpass', f: 1300 }); osc('sine', 190, t, 0.22, 0.25, { slide: 0.45 }); nz(t + 0.12, 0.06, 0.4, { f: 2400, q: 2 }); [74, 78, 81, 86].forEach((n, i) => osc('triangle', N(n), t + 0.2 + i * 0.08, 0.5, 0.07)); break;
      case 'dialTick': nz(t, 0.008, 0.25, { f: 5200, q: 4 }); osc('sine', 3100, t, 0.014, 0.025); break;
      case 'dialClick': nz(t, 0.03, 0.9, { f: 1900, q: 5 }); osc('sine', 880, t, 0.14, 0.12); osc('sine', 440, t, 0.2, 0.08); osc('triangle', 2640, t, 0.08, 0.04); break;
      case 'numSet': osc('triangle', N(81), t, 0.18, 0.08); osc('triangle', N(86), t + 0.09, 0.3, 0.08); nz(t, 0.04, 0.5, { f: 1500, q: 3 }); break;
      case 'safeOpen': nz(t, 0.12, 0.7, { type: 'lowpass', f: 700 }); osc('sine', 85, t, 0.4, 0.3, { slide: 0.7 }); osc('sawtooth', 210, t + 0.25, 1.0, 0.035, { slide: 0.7, lp: 900, attack: 0.1 }); nz(t + 0.25, 0.9, 0.08, { f: 400, q: 8, sweep: 260, attack: 0.1 }); [62, 69, 74].forEach((n, i) => osc('triangle', N(n), t + 0.9 + i * 0.09, 0.6, 0.06)); break;
      case 'wrong': osc('sawtooth', 170, t, 0.22, 0.08, { lp: 800 }); osc('sawtooth', 160, t + 0.12, 0.25, 0.08, { lp: 700 }); break;
      case 'uvRub': for (let i = 0; i < 2; i++) osc('sine', 2400 + Math.random() * 2400, t + i * 0.03, 0.12, 0.012); break;
      case 'reveal': for (let i = 0; i < 8; i++) osc('sine', 1800 + Math.random() * 3000, t + i * 0.035, 0.4, 0.025); osc('triangle', N(74), t, 0.6, 0.05); osc('triangle', N(81), t + 0.12, 0.6, 0.05); break;
      case 'wheel': nz(t, 0.012, 0.3, { f: 3600, q: 3 }); osc('sine', 1900, t, 0.02, 0.02); break;
      case 'decoded': [62, 66, 69, 74, 78].forEach((n, i) => osc('triangle', N(n + 12), t + i * 0.07, 0.6, 0.07)); nz(t, 0.25, 0.1, { f: 3000, q: 1, sweep: 6000 }); break;
      case 'paper': nz(t, 0.18, 0.18, { f: 2500, q: 0.8, sweep: 4000 }); nz(t + 0.12, 0.12, 0.12, { f: 3500, q: 0.8 }); break;
      case 'beep': { const s = a || 0; osc('sine', 700 + s * 900, t, 0.09, 0.05 + s * 0.06, { slide: 1.04 }); osc('sine', (700 + s * 900) * 2, t, 0.05, 0.01 + s * 0.02); break; }
      case 'bugFound': osc('square', 1200, t, 0.06, 0.05, { lp: 4000 }); osc('square', 1600, t + 0.07, 0.08, 0.05, { lp: 4000 }); osc('square', 2100, t + 0.15, 0.12, 0.05, { lp: 4000 }); break;
      case 'pluck': nz(t, 0.03, 0.6, { f: 1500, q: 2 }); osc('sine', 500, t, 0.14, 0.12, { slide: 2.6 }); osc('triangle', N(86), t + 0.1, 0.25, 0.05); break;
      case 'alarm': for (let i = 0; i < 3; i++) { osc('sawtooth', 880, t + i * 0.36, 0.34, 0.07, { slide: 0.72, lp: 2600 }); osc('square', 440, t + i * 0.36, 0.3, 0.02, { slide: 0.72, lp: 1500 }); } nz(t, 0.1, 0.3, { type: 'lowpass', f: 600 }); break;
      case 'grab': nz(t, 0.3, 0.2, { f: 700, q: 1.2, sweep: 3200 }); osc('triangle', N(81), t + 0.15, 0.4, 0.07); osc('triangle', N(88), t + 0.24, 0.5, 0.06); break;
      case 'dust': nz(t, 0.7, 0.25, { type: 'lowpass', f: 2200, attack: 0.05 }); nz(t + 0.05, 0.5, 0.08, { f: 7000, q: 1 }); break;
      case 'coins': { const n = Math.min(12, Math.max(3, a || 5)); for (let i = 0; i < n; i++) { const tt = t + i * 0.06 + Math.random() * 0.03; osc('triangle', 2400 + Math.random() * 1800, tt, 0.18, 0.05); osc('sine', 5200 + Math.random() * 1500, tt, 0.08, 0.02); } break; }
      case 'stars': { const n = a || 3; [74, 78, 81, 86].slice(0, n + 1).forEach((k, i) => { osc('triangle', N(k), t + i * 0.11, 0.5, 0.08); osc('sine', N(k + 12), t + i * 0.11, 0.3, 0.025); }); break; }
      case 'beads': for (let i = 0; i < 16; i++) nz(t + Math.random() * 0.55, 0.012, 0.18, { f: 2500 + Math.random() * 4500, q: 6 }); break;
      case 'bell': osc('sine', 2350, t, 1.4, 0.09); osc('sine', 2350 * 2.76, t, 0.6, 0.025); osc('sine', 2350 * 0.5, t, 0.8, 0.03); break;
      case 'step': nz(t, 0.06, 0.18, { type: 'lowpass', f: 420 }); nz(t, 0.02, 0.05, { f: 3000, q: 1 }); break;
      case 'bookcase': osc('sawtooth', 95, t, 1.3, 0.05, { slide: 0.7, lp: 500, attack: 0.15 }); nz(t, 1.1, 0.25, { type: 'lowpass', f: 220, attack: 0.1 }); nz(t + 0.05, 0.9, 0.05, { f: 900, q: 9, sweep: 500, attack: 0.1 }); nz(t + 1.05, 0.08, 0.5, { type: 'lowpass', f: 700 }); break;
      case 'buy': play('coins', 4); osc('triangle', N(86), t + 0.2, 0.3, 0.06); break;
      case 'lesson': [62, 69, 74, 78, 81].forEach((n, i) => osc('triangle', N(n + 12), t + i * 0.1, 0.7, 0.07)); osc('sine', N(50), t, 1.0, 0.08); break;
    } }
  // continuous layers: uv (lamp hum) and laser (beam buzz, louder near a beam)
  function loop(name, level) { if (!ready()) return; const c = room.ctx; let L = loops[name];
    if (!L) { if (level <= 0.001) return; const g = c.createGain(); g.gain.value = 0; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 2; f.frequency.value = name === 'uv' ? 520 : 1400; f.connect(g); g.connect(room.sfx);
      const os = (name === 'uv' ? [120, 240.6] : [110, 220.4, 330.9]).map(fr => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fr; o.connect(f); o.start(); return o; }); L = loops[name] = { g, f, os }; }
    const v = Math.max(0, Math.min(1, level)) * (name === 'uv' ? 0.05 : 0.07); L.g.gain.setTargetAtTime(v, c.currentTime, 0.06); if (name === 'laser') L.f.frequency.setTargetAtTime(900 + level * 1800, c.currentTime, 0.05); }
  function stopAll() { Object.values(loops).forEach(L => { try { L.os.forEach(o => o.stop()); } catch (e) {} }); }
  return { play, loop, stopAll };
}
export function spyMusic(audio) {
  const M = { on: true, started: false, mode: 'calm', step: 0, next: 0, el: null, file: false, bus: null, deg: 0, ney: 0 };
  try { M.on = localStorage.getItem('kufa.spy.music') !== 'off'; } catch (e) {}
  try { const el = new Audio(); el.loop = true; el.volume = 0.45; el.preload = 'auto'; el.addEventListener('canplaythrough', () => { if (M.file) return; M.file = true; M.el = el; if (M.bus) M.bus.gain.setTargetAtTime(0, M.ctx.currentTime, 0.3); if (M.started && M.on) el.play().catch(() => {}); }, { once: true }); el.src = new URL('KUFA/KUFA-spy.mp3', document.baseURI).href; } catch (e) {}
  const D = 146.83, SC = [0, 1, 4, 5, 7, 8, 10], hz = (deg, oct = 0) => { const o = Math.floor(deg / 7), d = ((deg % 7) + 7) % 7; return D * Math.pow(2, (SC[d] + 12 * (o + oct)) / 12); };
  let S = null;
  function start() { const room = spyRoom(audio); if (!room || M.started) return; M.ctx = room.ctx; M.started = true; S = synth(room);
    M.bus = M.ctx.createGain(); M.bus.gain.value = M.on && !M.file ? 1 : 0; M.bus.connect(room.music);
    const dr = M.ctx.createGain(); dr.gain.value = 0.03; const dl = M.ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 300; dl.connect(dr); dr.connect(M.bus); M.lp = dl;
    M.drone = [D / 2, D * 0.75].map(f => { const o = M.ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = Math.random() * 8 - 4; o.connect(dl); o.start(); return o; });
    M.next = M.ctx.currentTime + 0.1; if (M.file && M.on) M.el.play().catch(() => {}); }
  const BASS_A = [0, -1, -1, 4, -1, -1, 3, -1, 0, -1, 0, 4, -1, 5, 4, -1], BASS_B = [3, -1, -1, 5, -1, -1, 4, -1, 3, -1, 3, 1, -1, 0, 1, -1];
  const pluck = (f, t, v) => { S.osc('triangle', f, t, 0.45, v, { dest: M.bus }); S.osc('sawtooth', f * 2.003, t, 0.16, v * 0.16, { dest: M.bus, lp: 2400 }); };
  function playStep(i, t) { const md = M.mode, work = md === 'work' || md === 'tense', tense = md === 'tense', st = i % 16, bar = Math.floor(i / 16), B = (bar % 8) >= 4, bass = B ? BASS_B : BASS_A;
    if (st === 0 || st === 10 || (work && st === 7) || (tense && st === 3)) S.osc('sine', 95, t, 0.22, 0.34, { slide: 0.55, dest: M.bus });
    if (work && (st === 4 || st === 12)) S.nz(t, 0.07, 0.22, { f: 3200, dest: M.bus });
    if (work ? (st % 2 === 0 && st !== 0 && st !== 4 && st !== 12) || (tense && st % 2) : st === 12) S.nz(t, 0.04, tense ? 0.12 : 0.09, { f: 5200, q: 2, dest: M.bus });
    if (work && (st === 8 || st === 15)) for (let k = 0; k < 3; k++) S.nz(t + k * 0.012, 0.05, 0.05, { f: 9000, q: 3, dest: M.bus });
    if (bass[st] >= 0 && (work || st % 4 === 0)) S.osc('triangle', hz(bass[st], -2), t, 0.32, 0.17, { dest: M.bus });
    const ph = bar % 8; if (st % 2 === 0 && Math.random() < (work ? 0.4 : 0.2) + (ph === 3 || ph === 7 ? 0.2 : 0)) { M.deg = Math.max(-2, Math.min(9, M.deg + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)])); if (st === 0 && ph % 4 === 0) M.deg = B ? 3 : 0;
      pluck(hz(M.deg + (B ? 0 : 0)), t, 0.065); if (Math.random() < 0.25) pluck(hz(M.deg + 1), t + 0.08, 0.035); }
    if (!work && st === 0 && bar % 4 === 2) { const d0 = P([4, 5, 7]); S.osc('sine', hz(d0, 1), t, 1.6, 0.04, { vib: 5.2, attack: 0.25, dest: M.bus }); S.osc('sine', hz(d0 - 1, 1), t + 1.3, 1.2, 0.035, { vib: 5.2, attack: 0.2, dest: M.bus }); S.nz(t, 1.2, 0.01, { f: 2000, q: 0.7, attack: 0.3, dest: M.bus }); } }
  return {
    get on() { return M.on; },
    tick(mode) { if (!M.started) start(); if (!M.started) return; M.mode = mode; if (M.file || !M.on) return; const c = M.ctx, sx = 60 / (mode === 'tense' ? 108 : 98) / 4;
      if (M.next < c.currentTime - 0.5) M.next = c.currentTime + 0.05; while (M.next < c.currentTime + 0.15) { playStep(M.step, M.next); M.next += sx; M.step++; }
      M.lp.frequency.setTargetAtTime(mode === 'dim' ? 160 : 300, c.currentTime, 0.4); M.bus.gain.setTargetAtTime(mode === 'dim' ? 0.55 : 1, c.currentTime, 0.4); },
    setOn(v) { M.on = !!v; try { localStorage.setItem('kufa.spy.music', M.on ? 'on' : 'off'); } catch (e) {} if (!M.started) return; if (M.file) { if (M.on) M.el.play().catch(() => {}); else M.el.pause(); } else M.bus.gain.setTargetAtTime(M.on ? 1 : 0, M.ctx.currentTime, 0.2); },
    pause(v) { try { if (M.file && M.el) { if (v) M.el.pause(); else if (M.on) M.el.play().catch(() => {}); } } catch (e) {} },
    stop() { try { M.el && M.el.pause(); M.drone && M.drone.forEach(o => o.stop()); M.bus && M.bus.disconnect(); } catch (e) {} } };
}

// ======================= THE STAND-ALONE GAME =======================
export async function createSpyShop({ container, onState = () => {} }) {
  const ST = createStage(container, { bg: '#140e0a' }), { CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  scene.fog = new THREE.Fog('#140e0a', 16, 34);
  const hemi = scene.children.find(o => o.isHemisphereLight), sun = ST.sun, BASE = { h: 0.75, s: 0.6 }; if (hemi) hemi.intensity = BASE.h; sun.intensity = BASE.s; sun.position.set(4, 9, 7);
  const Y = buildSpyShop({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline }), MUS = spyMusic(audio);
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), n: 0, earned: 0, tips: 0, starList: [], tool: null, flash: null, flashT: 0, say: '', sayT: 0, react: null, done: null, phT: 0, confirm: 0, job: null, lesson: null, lessonRes: null, walk: { path: [], keys: {}, stuck: 0 }, prompt: null, lastClient: -1, doneSeen: {} };
  const upg = id => !!save.stat(SAVE.upg + id, 0), lessonDone = s => save.stat(SAVE.lesson + s, 0) > 0;
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const wp = (o, x = 0, y = 0, z = 0) => { o.updateWorldMatrix(true, false); return o.localToWorld(new THREE.Vector3(x, y, z)); };
  const SFX = spySfx(audio), K = { ST, flash, tone, vib, upg, puff, wp, gadget: Y.gadget, done: () => checkDone(), sfx: (n, a) => SFX.play(n, a) };
  const RIGS = { lock: lockRig(K), safe: safeRig(K), code: codeRig(K), sweep: sweepRig(K), laser: laserRig(K) };
  const placeRig = (Rg, spot) => { Rg.g.position.set(spot.x, spot.y, spot.z); Rg.g.rotation.set(-0.06, 0, 0); Rg.at = spot === Y.spots.train ? 'train' : spot === Y.spots.vault ? 'vault' : 'bench'; };
  Object.values(RIGS).forEach(r => { scene.add(r.g); r.g.visible = false; });
  // FOCUS: a dark velvet backdrop + a key light behind/above the active close-up, so the action reads clearly on a small screen
  const focusT = canvasTex(256, 256, c => { const g = c.createRadialGradient(128, 128, 20, 128, 128, 182); g.addColorStop(0, '#3a2a4a'); g.addColorStop(0.6, '#1a1222'); g.addColorStop(1, '#07050a'); c.fillStyle = g; c.fillRect(0, 0, 256, 256); });
  const focus = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: focusT, transparent: true, opacity: 0, depthWrite: true, fog: false }));  scene.add(focus);
  const keyL = new THREE.PointLight(0xfff2dc, 0, 5, 1.2); scene.add(keyL); let focusK = 0;
  const laserIdle = () => { RIGS.laser.setup({ day: 2, idle: true }); placeRig(RIGS.laser, Y.spots.vault); }; laserIdle();

  // ---------- cast ----------
  const strip = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const benPlain = strip(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' }));
  const benUni = strip(kit.makeFox({ ...CAST.player, outfit: 'coat', torso: ['#2c3a6a', '#1e2450', '#141a38'], crest: '', gear: 'none', mood: 'happy' }));
  { const BU = benUni.userData.P, hs = BU.head.scale.x || 1, fez = new THREE.Group(); fez.position.set(0, BU.head.position.y + 0.3 * hs, 0.02); fez.scale.setScalar(hs); BU.body.add(fez);
    M(new THREE.CylinderGeometry(0.12, 0.155, 0.2, 18), toon('#b8202a'), 0, 0.1, 0, fez, 0.012); M(new THREE.CylinderGeometry(0.121, 0.121, 0.02, 18), toon('#8a1018'), 0, 0.2, 0, fez, 0);
    const ts = M(new THREE.BoxGeometry(0.014, 0.15, 0.014), toon('#201e1d'), 0.08, 0.15, 0.06, fez, 0); ts.rotation.z = 0.5; M(new THREE.SphereGeometry(0.025, 8, 6), toon('#201e1d'), 0.12, 0.08, 0.07, fez, 0);
    M(new THREE.CylinderGeometry(0.05, 0.05, 0.015, 14), toon('#e6c26a'), 0.15, 1.02, 0.33, BU.body, 0.004).rotation.x = Math.PI / 2; benUni.visible = false; }
  const rafiq = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#f8ab52', furDark: '#d9822b', paw: '#d9822b', tailBase: '#cf7a24', tailMid: '#f8ab52' }, torso: ['#8fa8e0', '#4a5fa8', '#1e2450'], outfit: 'coat', crest: '', gear: 'none', eyes: ['#3b2410', '#3b2410'], mood: 'smug' }));
  const clientCache = new Map(), clientFox = i => { if (!clientCache.has(i)) { const c = CLIENTS[i], pl = PELT[c.pelt] || PELT.amber; clientCache.set(i, strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: pl[0], furDark: pl[1], paw: pl[1], tailMid: pl[0] }, torso: c.torso, outfit: c.outfit, crest: '', gear: 'none', eyes: ['#3b2410', '#3b2410'], mood: 'neutral' }))); addShadow(clientCache.get(i)); } return clientCache.get(i); };
  const shadowT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(0,0,0,0.5)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const addShadow = f => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.95), new THREE.MeshBasicMaterial({ map: shadowT, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.016; m.renderOrder = 1; f.add(m); return f; };
  [benPlain, benUni, rafiq].forEach(addShadow);
  const motes = (() => { const n = ST.touch ? 90 : 160, pos = new Float32Array(n * 3), seed = []; for (let i = 0; i < n; i++) { pos[i * 3] = R(-4.6, 4.6); pos[i * 3 + 1] = R(0.3, 3.1); pos[i * 3 + 2] = R(-3.6, 3.6); seed.push(R(0, 6)); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: glowTex, size: 0.06, color: 0xffd9a0, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(pts);
    return { pts, step(dt, t) { const a = g.attributes.position.array; for (let i = 0; i < n; i++) { a[i * 3 + 1] += dt * 0.05 * (0.5 + Math.sin(seed[i])); a[i * 3] += Math.sin(t * 0.3 + seed[i]) * dt * 0.04; if (a[i * 3 + 1] > 3.2) a[i * 3 + 1] = 0.25; } g.attributes.position.needsUpdate = true; } }; })();
  let ben = benPlain, client = null;
  const setBen = f => { if (f === ben) return; f.position.copy(ben.position); f.rotation.y = ben.rotation.y; ben.visible = false; ben = f; ben.visible = true; };
  const placeFox = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  placeFox(ben, Y.spots.ben, 0); placeFox(rafiq, Y.spots.rafiq, 0.35);
  const clientName = () => S.job && S.job.ci != null ? CLIENTS[S.job.ci].name : 'THE CLIENT';
  let itemObj = null;
  const showItem = J => { if (itemObj) { scene.remove(itemObj); itemObj = null; } const I = J && ITEMS[J.kind]; if (!I || !I.obj) return; const O = makeObj(ST, I.obj); itemObj = O.g; itemObj.scale.setScalar(0.62); itemObj.position.set(Y.spots.item.x, Y.spots.item.y, Y.spots.item.z); itemObj.rotation.y = -0.35; scene.add(itemObj); };

  // ---------- jobs + task progress ----------
  const info = t => RIGS[t].info();
  const locked = t => { const J = S.job, need = J && NEEDS[J.kind] && NEEDS[J.kind][t]; return !!(need && J.tasks.includes(need) && !info(need).done); };
  const allDone = () => !!S.job && S.job.tasks.every(t => info(t).done);
  const nextTask = () => S.job && S.job.tasks.find(t => !info(t).done && !locked(t));
  const Rg0 = () => activeRig();
  const activeRig = () => (S.phase === 'work' || S.phase === 'lesson') && S.tool ? RIGS[S.tool] : null;
  function makeJob(force) {
    if (force === 'demo') return { kind: 'case', item: "RAFIQ'S TEST KIT", tasks: ['sweep', 'lock', 'safe', 'code', 'laser'], ci: 7, line: 'Rafiq says you watch first. So watch.', sweepObj: 'case', msg: 'GO IN DAYLIGHT', key: 10, prize: PRIZES[0], demo: true };
    const trained = SKILL_ORDER.filter(lessonDone), mainSk = P(trained.filter(t => t !== S.lastMain) .length ? trained.filter(t => t !== S.lastMain) : trained), kinds = Object.keys(ITEMS).filter(k => ITEMS[k].main === mainSk), kind = P(kinds), I = ITEMS[kind]; S.lastMain = mainSk;
    const max = S.day <= 1 ? 1 : S.day <= 2 ? 2 : 3, tasks = [I.main], ex = shuffle(I.extra.filter(s => trained.includes(s)));
    while (tasks.length < max && ex.length && Math.random() < 0.8) tasks.push(ex.pop());
    let ci; do { ci = Math.floor(Math.random() * CLIENTS.length); } while (ci === S.lastClient); S.lastClient = ci;
    return { kind, item: I.name, tasks, ci, line: P(I.lines), sweepObj: I.obj && I.obj !== 'note' ? I.obj : 'lamp', msg: P(MESSAGES), prize: P(PRIZES) }; }
  function clearJob() { showItem(null); clientCache.forEach(f => f.visible = false); client = null; RIGS.lock.setTension && RIGS.lock.setTension(false); Object.values(RIGS).forEach(r => r.up && r.up()); ptrs.work = ptrs.tension = null;
    if (S.job && (S.job.tasks.includes('laser') || S.job.lesson)) laserIdle(); S.job = null; S.tool = null; S.react = null; }
  function setTool(id) { if ((S.phase !== 'work' && S.phase !== 'lesson') || !S.job || !S.job.tasks.includes(id)) return; if (locked(id)) { flash('OPEN THE ' + S.job.item + ' FIRST · THE NOTE IS INSIDE', '#e6b45a', 1.6); K.sfx('wrong'); return; }
    if (S.tool && S.tool !== id) { const o = RIGS[S.tool]; o.up && o.up(); if (S.tool === 'lock') RIGS.lock.setTension(false); } ptrs.work = ptrs.tension = null; S.tool = id; S.userToolT = performance.now(); DM.laser = false; }
  function checkDone() { setTimeout(() => { if (S.phase === 'lesson') { lessonFinish(); return; } if (S.phase !== 'work' || !S.job) return; const t = S.tool; if (t && !S.doneSeen[t] && info(t).done) S.doneSeen[t] = 1;
      const nx = nextTask(); if (!nx) say('RAFIQ: "Good. Hand it back to ' + clientName() + '."', 4); else if (S.tool && info(S.tool).done && !DM.on) S.tool = nx; }, 1100); }

  // ---------- flow: day of clients ----------
  function startDay() { if (!['intro', 'done', 'train', 'lessonDone', 'walk'].includes(S.phase) || DM.on) return; audio.init && audio.init();
    if (!SKILL_ORDER.some(lessonDone)) { openTraining(); say('RAFIQ: "Training first. Then the clients. Never the other way round."', 5); return; }
    clearJob(); Object.assign(S, { n: 0, earned: 0, tips: 0, starList: [], done: null, react: null, lessonRes: null, lesson: null }); setBen(save.flag('spyUniform') ? benUni : benPlain); placeFox(ben, Y.spots.benWork, 0); placeFox(rafiq, Y.spots.rafiqWork, 0.5); Y.book.target = 0;
    say('RAFIQ: "Clients first. Questions never."', 4); nextClient(); }
  function nextClient(force) { clearJob(); const J = makeJob(force); S.job = J; client = clientFox(J.ci); client.visible = true; client.userData.mood = 'neutral'; placeFox(client, Y.spots.door, Math.PI); S.phase = 'arrive'; S.phT = 0; S.tool = null; S.confirm = 0; S.doneSeen = {};
    const D = { day: S.day, demo: !!J.demo }; J.tasks.forEach(t => { RIGS[t].setup(D, J); placeRig(RIGS[t], t === 'laser' ? Y.spots.vault : Y.spots.bench); });
    K.sfx('beads'); setTimeout(() => K.sfx('bell'), 900); }
  function handBack() { if (S.phase !== 'work' || !S.job) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND BACK AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishJob(); }
  const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['Not a scratch. Remarkable.', 'Rafiq said you were good. He undersold you.', 'I will tell nobody. Which is the best review in Kufa.'] },
    happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Good work. Quietly done.', 'That will do nicely.', 'Exactly what I needed.'] },
    okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['It is open, at least.', 'A bit noisy for a spy shop.', 'Hm. Rafiq would have been quicker.'] },
    grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half the job is still undone!', 'This is not what I paid for.', 'I am telling Rafiq. Quietly.'] } };
  function finishJob() { const J = S.job, T = J.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : (I.prog || 0) * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.92 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.99 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const fixed = T.filter(t => info(t).done).length, price = J.demo ? 20 : ITEMS[J.kind].price, pay = price + fixed * 4, tip = Math.round((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('tea') ? 1.25 : 1));
    if (S.tool === 'lock') RIGS.lock.setTension(false); Object.values(RIGS).forEach(r => r.up && r.up()); ptrs.work = ptrs.tension = null;
    S.flash = null; S.say = ''; S.earned += pay; S.tips += tip; S.starList.push(stars); const RC = REACT[level]; client.userData.mood = RC.mood; S.react = { word: RC.word, col: RC.col, line: P(RC.lines), who: clientName(), stars, tip, pay }; S.phase = 'react'; S.phT = 0; S.tool = null; showItem(null);
    if (level === 'grumpy') K.sfx('wrong'); else K.sfx('stars', stars); setTimeout(() => K.sfx('coins', Math.round((pay + tip) / 4)), 450); if (stars === 3) { for (let i = 0; i < 10; i++) puff(client.position.x + R(-0.4, 0.4), R(1.4, 2.4), client.position.z + R(-0.2, 0.2), 0xffd23a, 1); } }
  function endDay() { clearJob(); S.phase = 'done'; setBen(benPlain); placeFox(ben, Y.spots.ben, 0); placeFox(rafiq, Y.spots.rafiq, 0.35);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); if (avg >= 2) { save.setStat(SAVE.day, S.day + 1); newDay = true; } if (!save.flag('spyUniform')) { save.setFlag('spyUniform'); unlock.push('SPY SHOP UNIFORM (navy coat, brass K pin + red fez)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; if (newDay) S.day += 1;
    say(eod ? 'RAFIQ: "Employee of the day. Tell no one."' : avg >= 2 ? 'RAFIQ: "You were never here. Nor was I. Good day."' : 'RAFIQ: "Loud. Tomorrow, quieter."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · BOUGHT', '#22c55e', 1.6); K.sfx('buy'); return true; }

  // ---------- flow: training room ----------
  function openTraining() { if (DM.on) return; clearJob(); S.phase = 'train'; S.lesson = null; S.lessonRes = null; S.done = null; setBen(benPlain); placeFox(ben, Y.spots.benTrain, -0.6); placeFox(rafiq, Y.spots.rafiqTrain, 0.7); Y.book.target = 1; }
  function startLesson(s) { if (!SKILLS[s] || DM.on) return; audio.init && audio.init(); clearJob(); S.phase = 'lesson'; S.lesson = { skill: s }; S.lessonRes = null; S.done = null;
    S.job = { kind: 'lesson', item: 'LESSON', tasks: [s], lesson: true, sweepObj: P(['lamp', 'radio', 'pot']), msg: 'ASK ABOUT NOTHING', key: 10, prize: PRIZES[1] }; RIGS[s].setup({ day: 1, lesson: true }, S.job); placeRig(RIGS[s], Y.spots.train);
    S.tool = s; Y.book.target = 1; setBen(benPlain); ben.visible = false; placeFox(ben, Y.spots.benTrain, -0.6); placeFox(rafiq, Y.spots.rafiqTrain, 0.7); say('RAFIQ: "' + SKILLS[s].teach + '"', 7); }
  function lessonFinish() { if (S.phase !== 'lesson' || !S.lesson) return; const s = S.lesson.skill, I = info(s), stars = I.q >= 0.92 ? 3 : I.q >= 0.7 ? 2 : 1, first = !lessonDone(s), prev = save.stat(SAVE.lesson + s, 0), gold = first ? 10 : 2;
    try { save.addGold(gold); if (stars > prev) save.setStat(SAVE.lesson + s, stars); } catch (e) {}
    S.lessonRes = { skill: s, label: SKILLS[s].label, stars, gold, first, next: SKILL_ORDER.find(k => !lessonDone(k)) || null, line: stars === 3 ? 'Clean. I did not hear you, which is the point.' : stars === 2 ? 'Adequate. Again some day, quieter.' : 'Loud. Very loud. But it opened.' };
    if (S.tool === 'lock') RIGS.lock.setTension(false); ptrs.work = ptrs.tension = null; S.phase = 'lessonDone'; ben.visible = true; K.sfx('lesson'); setTimeout(() => K.sfx('coins', 4), 500); }
  function quitLesson() { if (S.phase !== 'lesson') return; openTraining(); }
  function toIntro() { if (DM.on) demoStop(); clearJob(); Object.assign(S, { phase: 'intro', done: null, lessonRes: null, lesson: null, prompt: null }); setBen(benPlain); ben.visible = true; placeFox(ben, Y.spots.ben, 0); placeFox(rafiq, Y.spots.rafiq, 0.35); Y.book.target = 0; }

  // ---------- flow: walk around the shop ----------
  const marker = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.26, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); marker.visible = false; scene.add(marker);
  const walkable = (x, z) => Y.walk.rooms.some(r => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) && !Y.walk.solids.some(r => x > r.x0 - 0.22 && x < r.x1 + 0.22 && z > r.z0 - 0.22 && z < r.z1 + 0.22) && Math.hypot(x - rafiq.position.x, z - rafiq.position.z) > 0.55;
  function walkStart() { if (!['intro', 'done', 'train', 'lessonDone'].includes(S.phase) || DM.on) return; audio.init && audio.init(); const fromTrain = S.phase === 'train' || S.phase === 'lessonDone'; clearJob(); S.phase = 'walk'; S.done = null; S.lessonRes = null; setBen(benPlain); ben.visible = true;
    if (fromTrain) { placeFox(ben, { x: -2.6, z: -5.4 }, 0); } else { placeFox(ben, Y.spots.walkStart, 0); placeFox(rafiq, Y.spots.rafiq, 0.35); } S.walk.path = []; S.prompt = null; }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), floorP = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitV = new THREE.Vector3();
  function walkTap(x, y) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (!ray.ray.intersectPlane(floorP, hitV)) return; const t = { x: hitV.x, z: hitV.z };
    const bb = ben.position.z < -4.15, bt = t.z < -4.15; const raw = bb !== bt ? [{ x: -2.5, z: bb ? -4.75 : -3.35 }, { x: -2.5, z: bb ? -3.35 : -4.75 }, t] : [t], path = []; let from = { x: ben.position.x, z: ben.position.z };
    for (const q of raw) { const fb = from.z < -0.9 && from.z > -4.15, qb = q.z < -0.9 && q.z > -4.15; if (fb !== qb) { const xc = from.x + (q.x - from.x) * ((-0.9 - from.z) / ((q.z - from.z) || 1e-6)); if (xc > -2.2 && xc < 3.2) { const L = { x: -2.45, z: -0.9 }, Rr = { x: 3.55, z: -0.9 }, dl = Math.hypot(from.x - L.x, from.z - L.z) + Math.hypot(q.x - L.x, q.z - L.z), dr = Math.hypot(from.x - Rr.x, from.z - Rr.z) + Math.hypot(q.x - Rr.x, q.z - Rr.z); path.push(dl <= dr ? L : Rr); } } path.push(q); from = q; }
    S.walk.path = path; S.walk.stuck = 0; marker.position.set(t.x, 0.02, t.z); marker.visible = true; marker.scale.setScalar(1.4); }
  function stepWalk(dt) { const W = S.walk, k = W.keys; let vx = (k.r ? 1 : 0) - (k.l ? 1 : 0), vz = (k.d ? 1 : 0) - (k.u ? 1 : 0), sp = 0;
    if (vx || vz) { W.path = []; marker.visible = false; } else if (W.path.length) { const t = W.path[0], dx = t.x - ben.position.x, dz = t.z - ben.position.z, d = Math.hypot(dx, dz); if (d < 0.1) { W.path.shift(); if (!W.path.length) marker.visible = false; } else { vx = dx / d; vz = dz / d; } }
    if (vx || vz) { const l = Math.hypot(vx, vz), s = 2.5 * dt, nx = ben.position.x + vx / l * s, nz = ben.position.z + vz / l * s; let moved = false;
      if (walkable(nx, ben.position.z)) { ben.position.x = nx; moved = true; } if (walkable(ben.position.x, nz)) { ben.position.z = nz; moved = true; }
      if (!moved) { W.stuck += dt; if (W.stuck > 0.35) { W.path = []; marker.visible = false; W.stuck = 0; } } else W.stuck = 0;
      sp = moved ? 2.5 : 0; if (moved) { W.dist = (W.dist || 0) + 2.5 * dt; if (W.dist > 0.6) { W.dist = 0; K.sfx('step'); } } const a = Math.atan2(vx, vz); ben.rotation.y += wrapA(a - ben.rotation.y) * Math.min(1, dt * 12); }
    kit.animFox(ben, dt, sp); marker.scale.setScalar(damp(marker.scale.x, 1, 8, dt));
    const bx = ben.position.x, bz = ben.position.z; Y.book.target = (Math.hypot(bx - Y.spots.doorway.x, bz - Y.spots.doorway.z) < 1.9 || bz < -4.1) ? 1 : 0;
    let best = null, bd = 9; for (const h of Y.walk.hot) { const d = Math.hypot(bx - h.x, bz - h.z); if (d < h.r && d < bd) { bd = d; best = h; } } S.prompt = best ? { id: best.id, label: best.label } : null;
    rafiq.rotation.y += wrapA(Math.atan2(bx - rafiq.position.x, bz - rafiq.position.z) - rafiq.rotation.y) * Math.min(1, dt * 3); }
  function walkAct() { const p = S.prompt; if (!p || S.phase !== 'walk') return; K.sfx('click');
    if (p.id === 'rafiq') { toIntro(); say('RAFIQ: "' + P(RAFIQ_LINES) + '"', 4.5); }
    else if (p.id === 'train') openTraining();
    else say(LOOKS[p.id] || '', 4.5); }

  // ---------- input ----------
  const ptrs = { work: null, tension: null }; let pad = null;
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const inPad = (x, y) => pad && x >= pad.x && x <= pad.x + pad.w && y >= pad.y && y <= pad.y + pad.h;
  const rigP = new THREE.Plane(), nrm = new THREE.Vector3(), rp = new THREE.Vector3();
  function rigLocal(Rg, x, y) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); Rg.g.updateWorldMatrix(true, false); nrm.set(0, 0, 1).transformDirection(Rg.g.matrixWorld); rigP.setFromNormalAndCoplanarPoint(nrm, Rg.g.getWorldPosition(rp)); if (!ray.ray.intersectPlane(rigP, hitV)) return null; const l = Rg.g.worldToLocal(hitV.clone()); return { x: l.x, y: l.y }; }
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const offU = (Rg, e) => { if (e && e.pointerType === 'mouse') return 0; const a = scr(wp(Rg.g, 0, 0.5)), b = scr(wp(Rg.g, 0.1, 0.5)), ppu = Math.max(40, Math.hypot(a.x - b.x, a.y - b.y) * 10); return clamp(46 / ppu, 0.05, 0.16); };
  function onDown(e) { audio.init && audio.init(); S.lastInput = performance.now(); if (DM.on) return; const { x, y } = local(e);
    if (S.phase === 'walk') { walkTap(x, y); return; }
    const Rg = activeRig(); if (!Rg) return; e.preventDefault();
    if (Rg.kind === 'lock' && inPad(x, y)) { if (e.pointerType === 'mouse') RIGS.lock.setTension(!RIGS.lock.S().tension); else { ptrs.tension = e.pointerId; RIGS.lock.setTension(true); } return; }
    if (ptrs.work != null && ptrs.work !== e.pointerId) return; const p = rigLocal(Rg, x, y); if (!p) return; ptrs.work = e.pointerId; Rg.down(p, offU(Rg, e)); }
  function onMove(e) { const Rg = activeRig(); if (!Rg || DM.on) return; const { x, y } = local(e);
    if (e.pointerId === ptrs.work) { const p = rigLocal(Rg, x, y); if (p) Rg.move(p); }
    else if (e.pointerType === 'mouse' && ptrs.work == null && Rg.hover && e.target === renderer.domElement) { const p = rigLocal(Rg, x, y); if (p) Rg.hover(p); } }
  function onUp(e) { if (e.pointerId === ptrs.tension) { ptrs.tension = null; RIGS.lock.setTension(false); } if (e.pointerId === ptrs.work) { ptrs.work = null; const Rg = activeRig(); Rg && Rg.up(); } }
  const KEYMAP = { w: 'u', ArrowUp: 'u', s: 'd', ArrowDown: 'd', a: 'l', ArrowLeft: 'l', d: 'r', ArrowRight: 'r', W: 'u', S: 'd', A: 'l', D: 'r' };
  function onKey(e, down) { const k = e.key; if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName || '')) return;
    if (S.phase === 'walk') { const m = KEYMAP[k]; if (m) { S.walk.keys[m] = down; e.preventDefault(); } if (down && (k === 'e' || k === 'E' || k === 'Enter') && S.prompt) walkAct(); return; }
    S.walk.keys = {}; const Rg = activeRig(); if (!Rg || DM.on) return;
    if (Rg.kind === 'lock' && k === ' ') { e.preventDefault(); if (!e.repeat) RIGS.lock.setTension(down); }
    if (Rg.kind === 'safe' && (k === 'ArrowRight' || k === 'ArrowLeft')) { e.preventDefault(); if (down) RIGS.safe.turn((k === 'ArrowRight' ? 1 : -1) * TAU / 40); else RIGS.safe.release(); }
    if (down && k === 'Enter' && Rg.kind === 'code') RIGS.code.lockIn();
    if (down && (k === 'x' || k === 'X') && Rg.kind === 'laser') RIGS.laser.dust(); }
  const kd = e => onKey(e, true), ku = e => onKey(e, false);
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp); addEventListener('keydown', kd); addEventListener('keyup', ku);

  // ---------- camera ----------
  const { SAFE, shotFor } = cameraFit(ST), CAM = { look: V3(0.4, 1.2, -1.2) };
  camera.position.set(0.8, 2.6, 4.5); camera.lookAt(CAM.look);
  const fp = (s, y0 = 0, y1 = 2.2, r = 0.45) => [V3(s.x - r, y0, s.z), V3(s.x + r, y0, s.z), V3(s.x, y1, s.z)];
  function shot() { const port = CW() < CHh(), k = port ? 'P' : 'L', ph = S.phase;
    if (ph === 'intro' || ph === 'done') return shotFor('intro' + k, () => [...fp(Y.spots.ben), ...fp(Y.spots.rafiq), V3(-1.6, 1.0, -0.45), V3(2.2, 1.0, -0.45), V3(0.3, 2.75, -3.9)], 0.16, Math.PI - 0.2, port ? 0.1 : 0.06);
    if (ph === 'train' || ph === 'lessonDone' || (ph === 'lesson' && !S.tool)) return shotFor('train' + k, () => [...fp(Y.spots.benTrain), ...fp(Y.spots.rafiqTrain), V3(-3.9, 0.9, -7.4), V3(-1.8, 0.9, -7.4), V3(-2.85, 2.3, -8.2)], 0.2, Math.PI - 0.12, port ? 0.08 : 0.05);
    if (ph === 'arrive' || ph === 'leave') return shotFor('arrive' + k, () => [V3(-0.6, 0, -1.8), V3(2.9, 0, 0.6), V3(2.9, 2.3, 0.6), V3(0.0, 2.2, -1.8), V3(-0.6, 0, 3.6), V3(0.6, 0, 3.6)], 0.62, Math.PI - 0.3, 0.06);
    if (ph === 'react') { const f = client.position; return shotFor('react' + k, () => [V3(f.x - 0.7, 0, f.z), V3(f.x + 0.7, 0, f.z), V3(f.x, 2.3, f.z), V3(f.x - 2.0, 1.0, f.z - 1.6), V3(f.x - 2.0, 2.2, f.z - 1.9)], 0.16, Math.PI - 0.35, 0.08); }
    const Rg = activeRig(); if (!Rg) return shotFor('counter' + k, () => [V3(-0.6, 1, -1), V3(2.6, 1, -1), V3(1, 2.4, -1)], 0.2, Math.PI, 0.06);
    const sub = Rg.kind === 'code' ? (Rg.hud() || {}).phase + (RIGS.code.port ? 'p' : 'l') : ''; return shotFor('rig' + Rg.kind + Rg.at + sub + k, () => Rg.frame().map(([x, y]) => wp(Rg.g, x, y, 0)), 0.1, Math.PI, 0.05); }

  // ---------- DEMO: autopilot runs one job with all five skills; nothing is saved ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, laser: false };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.3); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const cap = (id, key, text, wait = 1.9) => { DM.cap = text; DM.key = key; if (DM.seen[id]) return 0; DM.seen[id] = 1; return wait; };
  function demoAct() { const J = S.job; if (!J) return 0.5; const T = nextTask();
    if (!T) { hand.visible = false; DM.cap = 'EVERY JOB DONE: TAP HAND BACK'; DM.key = 'TAP'; if (!DM.seen.hand) { DM.seen.hand = 1; return 1.6; } handBack(); return 1; }
    if (S.tool !== T) { setTool(T); DM.cap = 'JOB ' + (J.tasks.indexOf(T) + 1) + ' OF ' + J.tasks.length + ': TAP ' + SKILLS[T].label + ' AT THE BOTTOM'; DM.key = 'TAP'; hand.visible = false; return 1.5; }
    const Rg = RIGS[T], H = Rg.hud() || {}; let w = 0;
    if (T === 'sweep') w = H.found ? cap('sw2', 'TAP', 'A RED LIGHT! TAP THE BUG TO PULL IT OUT', 1.2) : cap('sw', 'DRAG', 'SWEEP · WAVE THE WAND OVER THE ITEM · THE BEEPS SPEED UP NEAR A BUG');
    else if (T === 'lock') w = !H.tension ? cap('lk', 'HOLD', 'LOCK · HOLD THE TENSION PAD WITH ONE THUMB') : cap('lk2', 'DRAG', 'PUSH EACH PIN UP SLOWLY · THE STIFF ONE CLICKS AT THE SHEAR LINE');
    else if (T === 'safe') w = H.pull ? cap('sf3', 'TAP', 'ALL THREE NUMBERS · TAP THE HANDLE') : H.step === 0 ? cap('sf', 'TURN', 'SAFE · CIRCLE YOUR THUMB TO TURN THE DIAL · LISTEN FOR THE CLICK') : cap('sf2', 'LIFT', 'LET GO ON THE CLICK TO KEEP IT · THEN TURN THE OTHER WAY');
    else if (T === 'code') w = H.phase === 'uv' ? cap('cd', 'RUB', 'CODE · RUB THE UV LAMP OVER THE NOTE TO SHOW THE HIDDEN INK') : cap('cd2', 'TURN', 'TURN THE WHEEL UNTIL A SITS OVER THE CLUE LETTER · LOCK IN');
    else if (T === 'laser') w = H.carry ? cap('lz2', 'DRAG', 'GOT IT · NOW BRING IT BACK OUT THROUGH THE GAPS', 1.2) : cap('lz', 'DRAG', 'LASER · DRAG ANYWHERE TO MOVE THE GLOVE · SLIP THROUGH THE GAPS');
    if (w) return w; if (T === 'laser') { DM.laser = true; return 0.3; } return Rg.demo(); }
  function demoStep(dt) { if (S.phase === 'arrive') { DM.cap = 'A CLIENT COMES IN WITH A JOB'; DM.key = ''; hand.visible = false; return; }
    if (S.phase === 'react') { DM.cap = 'THE CLIENT CHECKS YOUR WORK. CLEAN JOBS EARN STARS AND TIPS'; DM.key = '★'; hand.visible = false; return; }
    if (S.phase === 'leave') { DM.cap = 'YOUR TURN! TRAIN WITH RAFIQ, THEN PUT ME TO WORK'; DM.key = 'GO'; return; }
    if (S.phase !== 'work') return; if (DM.laser && S.tool === 'laser') RIGS.laser.demoTick(dt);
    const Rg = activeRig(); if (Rg && Rg.demoPt) { const p = Rg.demoPt(); if (p) { hand.visible = true; hand.position.copy(p).add(V3(0, 0, 0.08)); } }
    DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on || !['intro', 'done', 'train', 'lessonDone', 'walk'].includes(S.phase)) return; audio.init && audio.init(); clearJob(); DM.on = true; DM.seen = {}; DM.cd = 1.6; DM.laser = false; DM.cap = "WATCH A JOB AT RAFIQ'S SPY SHOP"; DM.key = ''; DM.day0 = S.day;
    Object.assign(S, { n: 0, earned: 0, tips: 0, starList: [], done: null, react: null, lessonRes: null, lesson: null, day: 2 }); setBen(benUni); placeFox(ben, Y.spots.benWork, 0); placeFox(rafiq, Y.spots.rafiqWork, 0.5); Y.book.target = 0; nextClient('demo'); }
  function demoStop() { if (!DM.on) return; DM.on = false; DM.laser = false; hand.visible = false; S.day = DM.day0; clearJob(); Object.assign(S, { phase: 'intro', done: null, n: 0, earned: 0, tips: 0, starList: [], flash: null }); setBen(benPlain); ben.visible = true; placeFox(ben, Y.spots.ben, 0); placeFox(rafiq, Y.spots.rafiq, 0.35); }

  // ---------- hints ----------
  const RINGS = hintRings(ST); let HINT = null, hintT = 0;
  function nextHint() { if ((S.phase !== 'work' && S.phase !== 'lesson') || !S.job) return null; const T = S.tool;
    if (!T || info(T).done) { const nx = nextTask(); return nx ? { text: 'NEXT · TAP ' + SKILLS[nx].label + ' BELOW', tool: nx } : S.phase === 'work' ? { text: 'ALL DONE · TAP HAND BACK', tool: 'hand' } : null; }
    const h = RIGS[T].hint(); return h ? { ...h, tool: T, r: 0.12 } : null; }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false;
  function step(dt) { const t = clock.elapsedTime; S.phT += dt;
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    { const A = Rg0(); MUS.tick(A && A.dim && A.dim() ? 'dim' : A && A.kind === 'laser' && (RIGS.laser.carrying() || RIGS.laser.alarmK()) ? 'tense' : (S.phase === 'work' || S.phase === 'lesson' || S.phase === 'arrive' || DM.on) ? 'work' : 'calm');
      SFX.loop('uv', A && A.kind === 'code' && RIGS.code.lampOn() ? 1 : 0); SFX.loop('laser', A && A.kind === 'laser' ? 0.25 + 0.75 * RIGS.laser.prox() : 0);
      if (Y.book.target !== S.bookT) { if (S.bookT !== undefined) K.sfx('bookcase'); S.bookT = Y.book.target; } }
    motes.step(dt, t); motes.pts.visible = !Rg0();
    Y.update(dt, t); RIGS.code.setLayout(CW() < CHh() * 1.05);
    const Rg = activeRig(); Object.values(RIGS).forEach(r => { r.g.visible = r === Rg || (r.kind === 'laser' && r.at === 'vault') || (S.phase === 'lessonDone' && S.lesson && r.kind === S.lesson.skill); if (r.g.visible) r.step(dt, t); });
    focusK = damp(focusK, Rg ? 1 : 0, 5, dt); focus.visible = focusK > 0.02; keyL.intensity = focusK * 7;
    if (Rg) { const fr = Rg.frame(), cx = fr.reduce((a, q) => a + q[0], 0) / fr.length, cy = fr.reduce((a, q) => a + q[1], 0) / fr.length, w = Math.max(...fr.map(q => q[0])) - Math.min(...fr.map(q => q[0])), h = Math.max(...fr.map(q => q[1])) - Math.min(...fr.map(q => q[1]));
      focus.position.copy(wp(Rg.g, cx, cy, -0.42)); focus.quaternion.copy(Rg.g.quaternion); focus.scale.set(w * 3.4 + 2.2, h * 3.4 + 2.6, 1); keyL.position.copy(wp(Rg.g, cx, cy + 0.6, 1.0)); }
    focus.material.opacity = Math.min(1, focusK * 1.03);
    const closeUp = !!Rg; rafiq.visible = !closeUp; if (client) client.visible = !closeUp && S.phase !== 'intro'; if (itemObj) itemObj.visible = !closeUp;
    Y.dim = damp(Y.dim, Rg && Rg.dim && Rg.dim() ? 0.22 : 1, 4, dt); if (hemi) hemi.intensity = BASE.h * (0.35 + 0.65 * Y.dim); sun.intensity = BASE.s * Y.dim; Y.red = RIGS.laser.alarmK();
    if (S.phase === 'walk') stepWalk(dt); else marker.visible = false;
    if (client && client.visible) { const goTo = (s, ry) => { const dx = s.x - client.position.x, dz = s.z - client.position.z, d = Math.hypot(dx, dz); if (d > 0.04) { const st = Math.min(d, 1.6 * dt); client.position.x += dx / d * st; client.position.z += dz / d * st; client.rotation.y += wrapA(Math.atan2(dx, dz) - client.rotation.y) * Math.min(1, dt * 10); kit.animFox(client, dt, 1.6); return false; } client.rotation.y += wrapA(ry - client.rotation.y) * Math.min(1, dt * 6); kit.animFox(client, dt, 0); return true; };
      if (S.phase === 'arrive') { if (goTo(Y.spots.client, Math.PI + 0.6) && S.phT > 1) { S.phase = 'work'; S.phT = 0; showItem(S.job); say(clientName() + ': "' + S.job.line + '"', 4.5); S.tool = nextTask() || S.job.tasks[0]; tone(880, 0.08, 0.04); } }
      else if (S.phase === 'react') { goTo(Y.spots.client, 0.25); if (S.phT > 2.9) { S.react = null; S.phase = 'leave'; S.phT = 0; } }
      else if (S.phase === 'leave') { if (goTo({ x: Y.spots.door.x, z: Y.spots.door.z + 0.6 }, 0) || S.phT > 4) { client.visible = false; if (DM.on) { demoStop(); return; } S.n++; if (S.n >= SPYSHOP.perDay) endDay(); else nextClient(); } }
      else goTo(Y.spots.client, Math.PI + 0.6); }
    if (S.phase !== 'walk') { ben.visible = !(S.phase === 'work' || S.phase === 'lesson' || S.phase === 'arrive' && false); kit.animFox(ben, dt, 0); }
    if (S.phase !== 'walk') { const ry = S.phase === 'train' || S.phase === 'lesson' || S.phase === 'lessonDone' ? 0.7 : 0.35; rafiq.rotation.y += wrapA(ry - rafiq.rotation.y) * Math.min(1, dt * 3); }
    kit.animFox(rafiq, dt, 0); rafiq.userData.mood = S.phase === 'lessonDone' && S.lessonRes && S.lessonRes.stars === 3 ? 'happy' : 'smug';
    const greet = S.phase === 'intro' || S.phase === 'done' || S.phase === 'train'; ben.userData.mood = greet ? 'excited' : 'happy'; const BP = ben.userData.P;
    if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32);
    // auto-follow to the next job when idle on a finished one
    if (!DM.on && S.phase === 'work' && S.tool && info(S.tool).done && ptrs.work == null && performance.now() - (S.userToolT || 0) > 3000 && performance.now() - (S.lastInput || 0) > 1200) { const nx = nextTask(); if (nx) S.tool = nx; }
    // camera
    if (S.phase === 'walk') { const port = CW() < CHh(), tg = V3(ben.position.x, 0.9, ben.position.z), off = port ? V3(0, 6.2, 6.6) : V3(0, 3.9, 4.9); camera.position.lerp(tg.clone().add(off), Math.min(1, dt * 3)); CAM.look.lerp(tg, Math.min(1, dt * 4)); }
    else { const sh = shot(), k = S.phase === 'work' || S.phase === 'lesson' ? 3.4 : 2.2; camera.position.lerp(sh.pos, Math.min(1, dt * k)); CAM.look.lerp(sh.look, Math.min(1, dt * k)); }
    camera.lookAt(CAM.look);
    { const showC = camera.position.y < Y.H - 0.1; Y.ceil.forEach(m => m.visible = showC); const showFront = camera.position.z < 3.9; Y.front.forEach(m => m.visible = showFront); const hideBack = CAM.look.z < -4.25 && camera.position.z > -4.4; Y.backWall.forEach(m => m.visible = !hideBack); if (hideBack && RIGS.laser.at === 'vault') RIGS.laser.g.visible = false; }
    if (DM.on) demoStep(dt); hintT += dt; HINT = DM.on ? null : nextHint(); const vis = HINT && HINT.p ? HINT : null; RINGS.place(vis, hintT, dt);
    if (vis) { RINGS.pulse.rotation.x = RINGS.pulse2.rotation.x = Math.PI / 2; RINGS.pulse.position.z += 0.06; RINGS.pulse2.position.z += 0.06; RINGS.pulse.scale.multiplyScalar(0.3); RINGS.pulse2.scale.multiplyScalar(0.3); RINGS.arrow.visible = false; } }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onVis = () => { const hid = document.hidden; PAUSE = hid; try { if (audio.ctx) hid ? audio.ctx.suspend() : audio.ctx.resume(); } catch (e) {} MUS.pause(hid); }; document.addEventListener('visibilitychange', onVis);
  function hud() { const J = S.job, avg = S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, T = S.tool, act = activeRig();
    return { phase: S.phase, day: S.day, n: S.n, perDay: SPYSHOP.perDay, earned: S.earned, tips: S.tips, stars: avg, tool: T, touch: ST.touch,
      job: J && !J.lesson ? { client: clientName(), item: J.item, tasks: J.tasks.map(id => { const I = info(id), lk = locked(id); return { id, label: SKILLS[id].label, name: SKILLS[id].name, done: I.done, txt: lk ? 'LOCKED' : I.txt, locked: lk }; }) } : null,
      lesson: S.lesson ? { skill: S.lesson.skill, label: SKILLS[S.lesson.skill].label, name: SKILLS[S.lesson.skill].name, txt: info(S.lesson.skill).txt } : null, lessonRes: S.lessonRes,
      lock: act && T === 'lock' ? RIGS.lock.hud() : null, safe: act && T === 'safe' ? RIGS.safe.hud() : null, code: act && T === 'code' ? RIGS.code.hud() : null, sweep: act && T === 'sweep' ? RIGS.sweep.hud() : null, laser: act && T === 'laser' ? RIGS.laser.hud() : null,
      allDone: allDone(), confirm: performance.now() - S.confirm < 2500, flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('spyUniform'),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), hint: HINT ? { text: HINT.text, tool: HINT.tool } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null, prompt: S.phase === 'walk' ? S.prompt : null, music: MUS.on, empStars: save.stat(SAVE.stars, 0), bestDay: save.stat(SAVE.best, 0),
      training: SKILL_ORDER.map(s => ({ id: s, label: SKILLS[s].label, name: SKILLS[s].name, stars: save.stat(SAVE.lesson + s, 0) })), trained: SKILL_ORDER.filter(lessonDone).length }; }
  frame();
  return { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setPad(r) { pad = r; }, toggleMusic() { audio.init && audio.init(); MUS.setOn(!MUS.on); }, setTool, handBack, startDay, startLesson, openTraining, quitLesson, toIntro, walkStart, walkStop: toIntro, walkAct, demoStart, demoStop, buyUpgrade, hud,
    lockIn: () => RIGS.code.lockIn(), dust: () => RIGS.laser.dust(), tension: on => RIGS.lock.setTension(on), setPaused(v) { PAUSE = !!v; },
    _tick(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => S, _rigs: RIGS, _sfx: (n, a) => SFX.play(n, a), _audio: audio, _scr: scr, _wp: wp, _local: rigLocal, _ben: () => ben,
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', kd); removeEventListener('keyup', ku); renderer.dispose(); renderer.domElement.remove(); try { document.removeEventListener('visibilitychange', onVis); SFX.stopAll(); MUS.stop(); audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
