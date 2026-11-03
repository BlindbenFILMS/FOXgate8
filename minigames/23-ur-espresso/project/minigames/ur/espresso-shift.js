// 8 GATES — UR · FOXY CREMA: THE SHIFT [urCoffee]. Ben works Ku-bau's lever machine on the end of the college.
// Built on the Meru Burgers / Jidda Smoothie engine + engine/restaurant-kit.js. Steps follow the 2D espresso game (minigames/ur/espresso.html):
//   GRIND (draw circles on the crank, ~3 g a turn) → TAMP (press + hold, keep your finger centred, let go in the green)
//   → LOCK (drag the basket into the machine) → [DATE SYRUP pumps] → PULL (drag the lever down, hold, let go in the band)
//   → STEAM (hold; slide up = heat, down = foam, let go when both meters are green) → POUR (draw the rosetta / heart on the cup)
//   → [HONEY zig-zag] → SLIDE the cup across the bar to the customer → PAY (exact, or give change at the register).
// TWO MODES in one scene:
//   'walk'  = the café as an interior: Ben (CAST.player) walks in and around it, sits, waves, talks to Ku-bau, Ubara + Shala.
//             Game HUD drives it (vehicle="cafe": 1 WAVE · 2 SIT · 3 JUMP, TALK near someone).
//   'shift' = the job (intro welcome card → 3 minute shift → day card), like every restaurant.
// Save keys ur.coffee.* (2D bank: ur.coffee.cups, ur.coffee.best, flag ur.coffee.hired), uniform flag coffeeUniform.
// MERGE: buildCafe(ctx) builds the interior at an origin (12 x 10 m, door on +z) and returns colliders, seats, the keeper spot and
// the door, so any FOX world building can host it; createEspressoShift({ container, mode }) runs it stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { createCremaAudio } from './crema-audio.js';

export const CREMA = { name: 'FOXY CREMA · KU-BAU’S MACHINE', room: 'urCoffee', shift: 180, keeper: 'Ku-bau' };
export const SHOTS = { ristretto: { name: 'RISTRETTO', lo: 26, hi: 40 }, normale: { name: 'NORMALE', lo: 48, hi: 64 }, lungo: { name: 'LUNGO', lo: 72, hi: 86 } };
export const MILK = { silky: { name: 'SILKY', foam: [22, 38] }, foamy: { name: 'FOAMY', foam: [38, 56] } };
export const DRINKS = [
  { id: 'espresso', name: 'ESPRESSO', day: 1, price: 3 },
  { id: 'latte', name: 'LATTE', day: 1, price: 5, milk: 'silky', art: 'rosetta' },
  { id: 'cappuccino', name: 'CAPPUCCINO', day: 2, price: 5, milk: 'foamy', art: 'heart' },
  { id: 'honey', name: 'UR HONEY LATTE', day: 3, price: 7, milk: 'silky', art: 'rosetta', honey: true }];
export const SYRUP = { name: 'DATE SYRUP', day: 2, price: 1 };
export const UPGRADES = [
  { id: 'motor', name: 'MOTOR GRINDER', cost: 45, line: 'Hold anywhere to grind, no cranking.' },
  { id: 'tamper', name: 'LEVEL TAMPER', cost: 35, line: 'A slanted tamp costs half as much.' },
  { id: 'gauge', name: 'BREW GAUGE', cost: 40, line: 'Every shot band is 30% wider.' },
  { id: 'thermo', name: 'MILK THERMOMETER', cost: 30, line: 'Wider heat band, and it beeps when ready.' },
  { id: 'radio', name: 'UR LUTE RADIO', cost: 60, line: 'Customers wait 20% longer.' }];
// the 2D game's four regulars + Ur townsfolk
const CUSTOMERS = [
  { name: 'YUZU', role: 'Regular', fur: '#ee7d24', furDark: '#b8531a', torso: ['#1f3350', '#e6ecf4', '#16263c'] },
  { name: 'MOCHI', role: 'Regular', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#4a3a5c', '#e9e2f0', '#332745'], outfit: 'coat' },
  { name: 'KUMA', role: 'Regular', fur: '#c9682a', furDark: '#8a4213', torso: ['#3f5d47', '#e6b45a', '#2b4232'] },
  { name: 'HANA', role: 'Regular', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#8f2b1e', '#fce7f3', '#661a10'], outfit: 'dress' },
  { name: 'GEME', role: 'Customer', torso: ['#bcd2a8', '#7f9a5f', '#3b4c25'] },
  { name: 'ILU', role: 'Apprentice', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#4a4a52', '#d7dde3', '#2a2a30'] },
  { name: 'SARRU', role: 'Townsfolk', torso: ['#e8c88a', '#fbf8ec', '#b08340'], outfit: 'robe' }];
const LINES = { order: ['One coffee, please.', 'Ku-bau said the new fox is good.', 'Make it strong. Long night at the lake.', 'The usual, whatever that is today.', 'Smells like the machine is awake.', 'Quick one before the college opens?'], angry: ['Too slow.', 'I will boil my own water.'] };
// Ku-bau, verbatim from the Ur world file (urBarista)
const KUBAU = {
  hello: 'Any chance you are looking for a job? We got great COFFEE here, super fun to make.',
  back: 'Back again. Good — there is a ticket up and my paws are wet.',
  work: ['Ha! Right. Apron. Hatch is that way — come round, do not climb it.', 'Nine of the ten things on this machine will burn you and the tenth one is the steam wand, which will burn you twice. Watch the meters and you will be fine.', 'Order comes up on the ticket. Dose, tamp, pull, steam, pour, out. Go.'],
  again: ['Ticket is up. Go on.'],
  how: ['Six things, and the machine will tell you which one it wants.', 'GRIND until the basket has what the ticket asks for — about three grams a turn of the handle, and turning it backwards does nothing, so do not try to be clever.', 'TAMP it flat. Lean on it and keep your paw over the middle, because a bed on a slant lets the water cut a channel straight down one side.', 'PULL, and STOP it in the band. Short is sour, long is bitter, and there is about four seconds between the two.', 'STEAM: wand at the surface makes foam, wand buried just makes it hot. You want both, in that order, and off it before it scalds.', 'Then POUR. Start at the far rim, wiggle as you draw the jug back, and finish with one line straight through the middle. That is a rosetta.'],
  story: ['I kept a tavern. Twenty-two years, good house, no trouble I did not start myself.', 'Then the lake went over, and everything I poured came out of the same water everybody was arguing about, and I got very tired of explaining that it did not.', 'Beans come up the road from somewhere else. Water gets boiled in front of you. Nobody has asked me one question about the lake since.', 'And it turns out I like it. Twenty-two years of pulling a handle and this is the first drink I have ever made that can be WRONG.'],
  later: ['It will be here.'] };
// the two regulars at the corner table, verbatim (Ubara + Shala argue about the tavern token machine)
const TABLE_TALK = {
  ubara: { name: 'Ubara', role: 'Regular', lines: [['npc', 'He has put nine tokens in that machine tonight.'], ['player', 'Nine?'], ['npc', 'Nine. He will tell you eight. It was nine.']] },
  shala: { name: 'Shala', role: 'Regular', lines: [['npc', 'It was eight.'], ['player', 'She says nine.'], ['npc', 'She says nine about everything. Ask her how many outfalls the lake has.']] } };
// ---- for merging into a world: the café's cast as makeFox options (spread CAST.player first, as below) + their talk ----
export const CAFE_CAST = {
  kubau: { name: 'Ku-bau', role: 'The Coffee', key: 'urBarista', fox: { look: { fur: '#e08a3c', furDark: '#b8460f', muzzle: '#f0a26b', snout: '#f0a26b', paw: '#8a4213', tailBase: '#8a4213', tailMid: '#c9682a', tailTip: '#f6ead2', browColor: '#f6ead2', browWeight: 8 }, torso: ['#e8d9bd', '#b89a6a', '#5e4a28'], outfit: 'vest', crest: '', gear: 'none', mood: 'warm' }, towel: '#c9682a' },
  ubara: { name: 'Ubara', role: 'Regular', fox: { look: { fur: '#f2c08a', furDark: '#c28a4a', paw: '#f2c08a' }, torso: ['#a78bfa', '#ede9fe', '#5b21b6'], outfit: 'dress', crest: '', gear: 'none', mood: 'happy' }, seat: 0 },
  shala: { name: 'Shala', role: 'Regular', fox: { look: { fur: '#d9822b', furDark: '#a35510', paw: '#d9822b' }, torso: ['#2f8d84', '#cfe8e4', '#1f6a62'], outfit: 'robe', crest: '', gear: 'none', mood: 'happy' }, seat: 1 },
  customers: CUSTOMERS };
export const CAFE_TALK = { KUBAU, TABLE_TALK };
const SAVE = { day: 'ur.coffee.day', best: 'ur.coffee.best', cups: 'ur.coffee.cups', upg: 'ur.coffee.upg.', stars: 'ur.coffee.stars', hired: 'ur.coffee.hired', uniform: 'coffeeUniform' };
const STEP_INFO = {
  grind: { label: 'GRIND', st: 'grind' }, tamp: { label: 'TAMP', st: 'tamp' }, lock: { label: 'LOCK', st: 'brew' }, syrup: { label: 'SYRUP', st: 'brew' },
  pull: { label: 'PULL', st: 'brew' }, steam: { label: 'STEAM', st: 'milk' }, art: { label: 'POUR', st: 'art' }, honey: { label: 'HONEY', st: 'art' }, serve: { label: 'SERVE', st: 'serve' } };
const TEMP = [58, 70];

// ---------------- the café interior ----------------
// Room 12 x 10 m, origin in the middle of the floor, door in the front wall (+z). The bar runs across the room at z = -1.2;
// Ku-bau's side (the barista side) is -z. Everything the job needs is returned in K (positions in world space).
export function buildCafe(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, grad, origin = { x: 0, z: 0 }, rotY: rot0 = 0 } = ctx, rotY = Math.round(rot0 / (Math.PI / 2)) * (Math.PI / 2), root = new T3.Group(); root.position.set(origin.x, origin.y || 0, origin.z); root.rotation.y = rotY; scene.add(root);
  // rotY: quarter turns only (0 = door on +z, Math.PI = door on -z, ±Math.PI/2 = door on ±x); everything below is laid out in LOCAL space
  const cR = Math.cos(rotY), sR = Math.sin(rotY), rotXZ = (x, z) => [x * cR + z * sR, -x * sR + z * cR];
  const ox = origin.x, oz = origin.z, W = 12, D = 10, H = 4.6, KZ = -1.2, T = 1.15;
  const terra = toon('#c9682a'), terraD = toon('#8a4213'), cream = toon('#f3e6cc'), brass = toon('#d9a441'), brassD = toon('#a8792e'), ink = toon('#201e1d'), wood = toon('#8a5a32'), woodD = toon('#5e3a1e'), teal = toon('#2f8d84'), chrome = toon('#d7dde3'), white = toon('#fbf8ec');
  const TM = map => new T3.MeshToonMaterial({ map, gradientMap: grad });
  // floor: terracotta tiles with a little U-crest diamond in every fourth tile
  const floorT = CTX(256, 256, c => { c.fillStyle = '#b8572a'; c.fillRect(0, 0, 256, 256); for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#c9682a' : '#d47a3a'; c.fillRect(x * 64 + 2, y * 64 + 2, 60, 60); } c.fillStyle = '#f3e6cc'; c.save(); c.translate(128, 128); c.rotate(Math.PI / 4); c.fillRect(-10, -10, 20, 20); c.restore(); c.fillStyle = '#8a4213'; c.font = '900 16px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('U', 128, 129); });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2, D / 2);
  const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), TM(floorT)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
  // the street outside the door (seen from the walk camera + through the windows)
  { const st = CTX(256, 256, c => { c.fillStyle = '#d9a46a'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#b8814a'; c.lineWidth = 4; for (let y = 0; y < 256; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); for (let x = (y / 32) % 2 * 24; x < 256; x += 48) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 32); c.stroke(); } } }); st.wrapS = st.wrapT = T3.RepeatWrapping; st.repeat.set(8, 3);
    const sp = new T3.Mesh(new T3.PlaneGeometry(W + 10, 7), TM(st)); sp.rotation.x = -Math.PI / 2; sp.position.set(0, -0.004, D / 2 + 3.5); sp.receiveShadow = true; root.add(sp); }
  // walls: terracotta brick wainscot, a turquoise Ur tile band, warm plaster above
  const wallT = CTX(256, 256, c => { c.fillStyle = '#f3e6cc'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#ead9b8'; for (let i = 0; i < 40; i++) c.fillRect(rr(0, 250), rr(0, 150), rr(2, 6), rr(2, 6));
    c.fillStyle = '#2f8d84'; c.fillRect(0, 150, 256, 14); c.fillStyle = '#d9a441'; for (let x = 4; x < 256; x += 16) { c.beginPath(); c.moveTo(x, 157); c.lineTo(x + 4, 152); c.lineTo(x + 8, 157); c.lineTo(x + 4, 162); c.fill(); }
    c.fillStyle = '#b8572a'; c.fillRect(0, 164, 256, 92); c.fillStyle = '#9a4520'; for (let y = 164; y < 256; y += 14) for (let x = ((y - 164) / 14) % 2 * 16; x < 256; x += 32) { c.fillRect(x, y, 30, 1.5); c.fillRect(x, y, 1.5, 14); } });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(4, 1); const wallM = TM(wallT);
  const cut = [], front = [];
  for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); }
  { const ceil = M(new T3.BoxGeometry(W, 0.16, D), toon('#e8d9bd'), 0, H + 0.08, 0, root, 0); cut.push(ceil); for (const x of [-4, 0, 4]) cut.push(M(new T3.BoxGeometry(0.22, 0.22, D), woodD, x, H - 0.1, 0, root, 0.01)); }
  // front wall with the door + two street windows (hidden in walk mode so the camera can look in)
  { const streetT = CTX(512, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#f6c98a'); g.addColorStop(0.55, '#fbe3c0'); g.addColorStop(0.56, '#d9a46a'); g.addColorStop(1, '#c48a4f'); c.fillStyle = g; c.fillRect(0, 0, 512, 256);
      c.fillStyle = '#c9682a'; c.fillRect(20, 60, 140, 82); c.fillRect(320, 40, 170, 102); c.fillStyle = '#8a4213'; c.fillRect(40, 86, 24, 56); c.fillRect(360, 70, 30, 72); c.fillRect(420, 70, 30, 30); c.fillStyle = '#2f8d84'; c.beginPath(); c.arc(250, 120, 34, Math.PI, 0); c.fill(); c.fillStyle = '#d9a441'; c.fillRect(244, 60, 12, 30); c.fillStyle = '#ffffff'; c.globalAlpha = 0.25; c.fillRect(0, 0, 512, 256); });
    const fw = new T3.Group(); root.add(fw); front.push(fw);
    const seg = (x0, x1, y0, y1) => { const m = new T3.Mesh(new T3.PlaneGeometry(x1 - x0, y1 - y0), wallM); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, D / 2); m.rotation.y = Math.PI; fw.add(m); };
    seg(-6, -5.1, 0, H); seg(5.1, 6, 0, H); seg(-1.75, -1.25, 0, H); seg(1.25, 1.75, 0, H); seg(-1.25, 1.25, 3.1, H); seg(-5.1, -1.75, 0, 0.95); seg(1.75, 5.1, 0, 0.95); seg(-5.1, -1.75, 3.45, H); seg(1.75, 5.1, 3.45, H);
    for (const cx of [-3.425, 3.425]) { const win = new T3.Mesh(new T3.PlaneGeometry(3.35, 2.5), new T3.MeshBasicMaterial({ map: streetT })); win.position.set(cx, 2.2, D / 2 + 0.02); win.rotation.y = Math.PI; fw.add(win);
      for (const dx of [-1.68, 0, 1.68]) M(new T3.BoxGeometry(0.1, 2.6, 0.12), woodD, cx + dx, 2.2, D / 2 - 0.04, fw, 0.01); M(new T3.BoxGeometry(3.45, 0.1, 0.14), woodD, cx, 3.45, D / 2 - 0.04, fw, 0.01); M(new T3.BoxGeometry(3.5, 0.08, 0.3), woodD, cx, 0.97, D / 2 - 0.12, fw, 0.01); }
    M(new T3.BoxGeometry(0.16, 3.1, 0.2), woodD, -1.3, 1.55, D / 2 - 0.05, fw, 0.01); M(new T3.BoxGeometry(0.16, 3.1, 0.2), woodD, 1.3, 1.55, D / 2 - 0.05, fw, 0.01); M(new T3.BoxGeometry(2.76, 0.16, 0.2), woodD, 0, 3.12, D / 2 - 0.05, fw, 0.01);
    const openT = CTX(256, 128, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#d9a441'; c.lineWidth = 6; c.strokeRect(6, 6, 244, 116); c.fillStyle = '#ffd23a'; c.font = '900 54px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('OPEN', 128, 66); });
    const op = new T3.Mesh(new T3.PlaneGeometry(0.62, 0.31), new T3.MeshBasicMaterial({ map: openT })); op.position.set(2.6, 2.6, D / 2 - 0.03); op.rotation.y = Math.PI; fw.add(op); }
  const K0 = {};
  // ---- the bar ----
  const L = 3.6, barT = CTX(512, 128, c => { c.fillStyle = '#8a4213'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#9a4c18'; for (let x = 0; x < 512; x += 32) c.fillRect(x, 0, 28, 128); c.fillStyle = '#d9a441'; c.fillRect(0, 0, 512, 8); c.fillRect(0, 120, 512, 8); for (let x = 16; x < 512; x += 64) { c.save(); c.translate(x + 16, 64); c.rotate(Math.PI / 4); c.fillRect(-9, -9, 18, 18); c.restore(); } });
  barT.wrapS = T3.RepeatWrapping; barT.repeat.set(3, 1);
  { const body = new T3.Mesh(new T3.BoxGeometry(L * 2, T - 0.06, 0.9), [toon('#8a4213'), toon('#8a4213'), toon('#8a4213'), toon('#8a4213'), TM(barT), toon('#6b3410')]); body.position.set(0, (T - 0.06) / 2, KZ); body.castShadow = body.receiveShadow = true; ctx.addOutline && ctx.addOutline(body, 0.02); root.add(body);
    M(new T3.BoxGeometry(L * 2 + 0.12, 0.06, 1.0), toon('#efe2c4'), 0, T - 0.03, KZ, root, 0.012); M(new T3.BoxGeometry(L * 2 + 0.12, 0.05, 0.05), brass, 0, 0.12, KZ + 0.48, root, 0.008);
    // side returns: the left one is solid, the right one has the hatch (Ku-bau: come round, do not climb it)
    M(new T3.BoxGeometry(6 - L, T, 0.5), toon('#8a4213'), -(L + (6 - L) / 2), T / 2, KZ, root, 0.015); M(new T3.BoxGeometry(6 - L - 1.1, T, 0.5), toon('#8a4213'), L + 1.1 + (6 - L - 1.1) / 2, T / 2, KZ, root, 0.015);
    const hatch = M(new T3.BoxGeometry(1.06, T - 0.25, 0.06), wood, L + 0.55, (T - 0.25) / 2 + 0.1, KZ, root, 0.01); M(new T3.BoxGeometry(1.06, 0.06, 0.08), brass, L + 0.55, T - 0.12, KZ, root, 0.006);
    const staffT = CTX(256, 64, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#ffd23a'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('STAFF ONLY', 128, 34); }); const sm = new T3.Mesh(new T3.PlaneGeometry(0.62, 0.16), new T3.MeshBasicMaterial({ map: staffT })); sm.position.set(L + 0.55, T * 0.6, KZ + 0.04); hatch.parent.add(sm);
    const backG = new T3.Group(); root.add(backG); K0.back = backG;
    // back bar: shelves of bean sacks, jars, cups; menu board; neon
    M(new T3.BoxGeometry(W - 0.2, 1.45, 0.6), toon('#6b3410'), 0, 0.725, -D / 2 + 0.32, backG, 0.015); M(new T3.BoxGeometry(W - 0.1, 0.05, 0.66), toon('#efe2c4'), 0, 1.47, -D / 2 + 0.32, backG, 0.01);
    for (const y of [2.35, 3.0]) { M(new T3.BoxGeometry(4.2, 0.05, 0.32), wood, -3.6, y, -D / 2 + 0.18, backG, 0.01); M(new T3.BoxGeometry(4.2, 0.05, 0.32), wood, 3.6, y, -D / 2 + 0.18, backG, 0.01); }
    const sackT = CTX(128, 128, c => { c.fillStyle = '#c9a06a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#a8794a'; c.lineWidth = 3; for (let i = 0; i < 128; i += 8) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 128); c.stroke(); } c.fillStyle = '#5e3a1e'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.fillText('UR', 64, 64); c.font = '800 16px Archivo, Arial'; c.fillText('BEANS', 64, 88); });
    const sackM = TM(sackT); for (let i = 0; i < 6; i++) { const s = new T3.Mesh(new T3.CylinderGeometry(0.17, 0.2, 0.36, 10), sackM); s.position.set(-5.3 + i * 0.32 + (i > 2 ? 9 : 0), 1.67 + (i % 2) * 0.01, -D / 2 + 0.3); s.rotation.y = rr(-0.4, 0.4); s.castShadow = true; ctx.addOutline && ctx.addOutline(s, 0.01); backG.add(s); }
    const jarCols = ['#5e3a1e', '#c9a06a', '#3b2410', '#e6b45a', '#8a4213'];
    for (const sx of [-1, 1]) for (const y of [2.38, 3.03]) for (let i = 0; i < 7; i++) { const x = sx * 3.6 - 1.8 + i * 0.6; M(new T3.CylinderGeometry(0.09, 0.09, 0.22, 10), toon('#cfe8e4', { transparent: true, opacity: 0.7 }), x, y + 0.14, -D / 2 + 0.2, backG, 0.006, 0.09); M(new T3.CylinderGeometry(0.075, 0.075, 0.12 + (i % 3) * 0.03, 10), toon(jarCols[(i + (y > 2.6 ? 2 : 0)) % 5]), x, y + 0.1, -D / 2 + 0.2, backG, 0); M(new T3.CylinderGeometry(0.095, 0.095, 0.03, 10), brassD, x, y + 0.26, -D / 2 + 0.2, backG, 0.004, 0.095); }
    const menuT = CTX(1024, 640, c => { c.fillStyle = '#1f2a26'; c.fillRect(0, 0, 1024, 640); c.strokeStyle = '#d9a441'; c.lineWidth = 14; c.strokeRect(10, 10, 1004, 620); c.fillStyle = '#ffd23a'; c.font = '900 84px Archivo, Arial'; c.fillText('FOXY CREMA', 50, 110); c.fillStyle = '#e6b45a'; c.font = '800 30px Archivo, Arial'; c.fillText('KU-BAU’S MACHINE · SINCE THE LAKE WENT OVER', 52, 156);
      c.font = '800 46px Archivo, Arial'; [['ESPRESSO', '3g'], ['LATTE', '5g'], ['CAPPUCCINO', '5g'], ['UR HONEY LATTE', '7g']].forEach(([n, p], i) => { c.fillStyle = '#fbf8ec'; c.fillText(n, 60, 250 + i * 76); c.fillStyle = '#ffd23a'; c.fillText(p, 860, 250 + i * 76); c.fillStyle = '#3a4a44'; c.fillRect(60, 266 + i * 76, 900, 3); });
      c.fillStyle = '#cfe8e4'; c.font = '700 30px Archivo, Arial'; c.fillText('+ DATE SYRUP 1g   ·   WATER BOILED IN FRONT OF YOU', 60, 590); });
    const mb = new T3.Mesh(new T3.PlaneGeometry(2.6, 1.62), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(0, 2.75, -D / 2 + 0.06); backG.add(mb); M(new T3.BoxGeometry(2.72, 1.74, 0.04), woodD, 0, 2.75, -D / 2 + 0.01, backG, 0);
    const neonT = CTX(512, 160, c => { c.clearRect(0, 0, 512, 160); c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff8a3a'; c.shadowBlur = 22; c.strokeStyle = '#ffd9a8'; c.lineWidth = 6; c.font = 'italic 900 76px Archivo, Arial'; c.strokeText('CREMA', 300, 82); c.fillStyle = '#ff9a4a'; c.fillText('CREMA', 300, 82);
      c.shadowColor = '#5cf0e0'; c.strokeStyle = '#c8fff8'; c.lineWidth = 6; c.beginPath(); c.moveTo(40, 60); c.lineTo(120, 60); c.lineTo(110, 128); c.lineTo(50, 128); c.closePath(); c.stroke(); c.beginPath(); c.arc(126, 88, 18, -1.2, 1.2); c.stroke(); for (const x of [62, 82, 102]) { c.beginPath(); c.moveTo(x, 48); c.quadraticCurveTo(x + 10, 34, x, 18); c.stroke(); } });
    const ne = new T3.Mesh(new T3.PlaneGeometry(1.9, 0.6), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); ne.position.set(-W / 2 + 0.03, 3.3, -2.6); ne.rotation.y = Math.PI / 2; root.add(ne);
    // U crest banner on the right wall
    const banT = CTX(128, 256, c => { c.fillStyle = '#c9682a'; c.fillRect(0, 0, 128, 220); c.beginPath(); c.moveTo(0, 220); c.lineTo(64, 256); c.lineTo(128, 220); c.fill(); c.fillStyle = '#d9a441'; c.fillRect(0, 0, 128, 10); c.beginPath(); c.arc(64, 110, 44, 0, 7); c.fill(); c.fillStyle = '#8a4213'; c.font = '900 64px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('U', 64, 114); });
    for (const z of [-2.6, 2.4]) { const b = new T3.Mesh(new T3.PlaneGeometry(0.8, 1.6), new T3.MeshBasicMaterial({ map: banT, transparent: true })); b.position.set(W / 2 - 0.03, 3.1, z); b.rotation.y = -Math.PI / 2; root.add(b); M(new T3.CylinderGeometry(0.02, 0.02, 0.9, 6), brass, W / 2 - 0.06, 3.91, z, root, 0).rotation.x = Math.PI / 2; } }
  // ---- stations on the bar (barista side = -z) ----
  const oy = origin.y || 0, P = (x, z, y = T) => { const [rx, rz] = rotXZ(x, z); return new T3.Vector3(ox + rx, oy + y, oz + rz); }, Lp = {};
  const LP = (name, x, z, y = T) => { Lp[name] = { x, z, y }; return P(x, z, y); };
  const K = { root, z: KZ, T, W, D, cut, front, origin, top: T, back: K0.back };
  K.grinder = LP('grinder', 2.55, KZ - 0.12); K.tampMat = LP('tampMat', 1.72, KZ - 0.28); K.group = LP('group', 0.55, KZ - 0.32, T + 0.4); K.drip = P(0.55, KZ - 0.32); K.wand = LP('wand', -0.12, KZ - 0.36, T + 0.22); K.jugHome = P(-0.55, KZ - 0.3);
  K.pump = LP('pump', 1.12, KZ - 0.2); K.pourSpot = LP('pourSpot', -1.3, KZ - 0.24); K.honey = LP('honey', -1.9, KZ - 0.18); K.register = LP('register', -2.85, KZ); K.pastry = LP('pastry', 3.15, KZ + 0.1); K.cupStack = P(-0.85, KZ + 0.05, T);
  K.knock = LP('knock', 1.72, KZ + 0.12);
  K.spots = [P(1.75, KZ + 1.45, 0), P(-0.8, KZ + 1.45, 0), P(-2.25, KZ + 1.45, 0)]; K.pass = { y: T, z: oz + KZ + 0.36 }; // pass.z is used by the stand-alone job (rotY 0)
  // grinder: base, body, glass hopper of beans, the crank on top (the thing you turn), a fork under the chute
  { const g = new T3.Group(); g.position.copy(K.grinder); g.rotation.y = rotY; scene.add(g); K.grinderG = g;
    M(new T3.BoxGeometry(0.34, 0.06, 0.34), ink, 0, 0.03, 0, g, 0.01); M(new T3.CylinderGeometry(0.13, 0.15, 0.36, 16), terra, 0, 0.24, 0, g, 0.012, 0.15); M(new T3.CylinderGeometry(0.135, 0.135, 0.04, 16), brass, 0, 0.42, 0, g, 0.006, 0.135);
    M(new T3.CylinderGeometry(0.15, 0.06, 0.26, 16, 1, true), toon('#cfe8e4', { transparent: true, opacity: 0.55, side: T3.DoubleSide }), 0, 0.57, 0, g, 0);
    const beanT = CTX(64, 64, c => { c.fillStyle = '#3b2410'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#5e3a1e'; for (let i = 0; i < 40; i++) { c.beginPath(); c.ellipse(rr(0, 64), rr(0, 64), 4, 2.6, rr(0, 3), 0, 7); c.fill(); } });
    M(new T3.CylinderGeometry(0.13, 0.065, 0.18, 16), TM(beanT), 0, 0.53, 0, g, 0);
    const crank = new T3.Group(); crank.position.set(0, 0.72, 0); g.add(crank); K.crank = crank; M(new T3.CylinderGeometry(0.025, 0.025, 0.06, 8), brassD, 0, 0, 0, crank, 0.004); M(new T3.BoxGeometry(0.22, 0.025, 0.04), brass, 0.11, 0.03, 0, crank, 0.006); M(new T3.CylinderGeometry(0.025, 0.025, 0.08, 10), woodD, 0.21, 0.07, 0, crank, 0.006, 0.025);
    M(new T3.BoxGeometry(0.06, 0.06, 0.1), brassD, 0, 0.3, -0.16, g, 0.006); M(new T3.BoxGeometry(0.12, 0.02, 0.08), brassD, 0, 0.17, -0.2, g, 0.004);
    K.crankHub = P(Lp.grinder.x, Lp.grinder.z, T + 0.74); K.chute = P(Lp.grinder.x, Lp.grinder.z - 0.2, T + 0.2); }
  // tamping mat + knock box
  M(new T3.BoxGeometry(0.34, 0.025, 0.3), toon('#2a2826'), Lp.tampMat.x, T + 0.012, Lp.tampMat.z, root, 0.006);
  { const kb = new T3.Group(); kb.position.copy(K.knock); kb.rotation.y = rotY; scene.add(kb); M(new T3.CylinderGeometry(0.12, 0.11, 0.16, 14), ink, 0, 0.08, 0, kb, 0.008, 0.12); M(new T3.CylinderGeometry(0.008, 0.008, 0.22, 6), woodD, 0, 0.14, 0, kb, 0).rotation.z = Math.PI / 2; }
  // the machine: an old terracotta + brass lever machine, older than the city
  { const g = new T3.Group(); g.position.copy(P(0.35, KZ + 0.02)); g.rotation.y = rotY; scene.add(g); K.machine = g;
    M(new T3.BoxGeometry(1.25, 0.08, 0.6), brassD, 0, 0.04, 0, g, 0.012); const body = M(new T3.BoxGeometry(1.15, 0.5, 0.5), terra, 0, 0.33, 0.02, g, 0.016); body.receiveShadow = true;
    M(new T3.BoxGeometry(1.18, 0.05, 0.53), brass, 0, 0.6, 0.02, g, 0.008); M(new T3.CylinderGeometry(0.2, 0.26, 0.26, 20, 1, false, 0, Math.PI * 2), brass, 0, 0.75, 0.02, g, 0.012, 0.26); M(new T3.SphereGeometry(0.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), brass, 0, 0.88, 0.02, g, 0.01, 0.2);
    M(new T3.SphereGeometry(0.05, 10, 8), toon('#ffd23a'), 0, 1.1, 0.02, g, 0.008, 0.05); for (let i = 0; i < 4; i++) M(new T3.BoxGeometry(0.02, 0.14, 0.02), brassD, Math.cos(i * 1.57) * 0.16, 1.0, 0.02 + Math.sin(i * 1.57) * 0.16, g, 0);
    const crestT = CTX(128, 128, c => { c.fillStyle = '#d9a441'; c.beginPath(); c.arc(64, 64, 60, 0, 7); c.fill(); c.fillStyle = '#8a4213'; c.beginPath(); c.arc(64, 64, 50, 0, 7); c.fill(); c.fillStyle = '#ffd23a'; c.font = '900 70px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('U', 64, 68); });
    for (const z of [-0.235, 0.275]) { const cr = new T3.Mesh(new T3.CircleGeometry(0.14, 24), new T3.MeshBasicMaterial({ map: crestT, transparent: true })); cr.position.set(-0.3, 0.34, z); if (z < 0) cr.rotation.y = Math.PI; g.add(cr); }
    // pressure gauge on the barista face
    const gaugeCv = document.createElement('canvas'); gaugeCv.width = gaugeCv.height = 128; const gaugeT = new T3.CanvasTexture(gaugeCv); gaugeT.colorSpace = T3.SRGBColorSpace;
    const gauge = new T3.Mesh(new T3.CircleGeometry(0.075, 24), new T3.MeshBasicMaterial({ map: gaugeT })); gauge.position.set(-0.05, 0.42, -0.236); gauge.rotation.y = Math.PI; g.add(gauge); M(new T3.TorusGeometry(0.078, 0.012, 6, 24), brass, -0.05, 0.42, -0.236, g, 0);
    K.gauge = v => { const c = gaugeCv.getContext('2d'); c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#201e1d'; c.lineWidth = 4; for (let i = 0; i <= 10; i++) { const a = Math.PI * 0.75 + i / 10 * Math.PI * 1.5; c.beginPath(); c.moveTo(64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46); c.lineTo(64 + Math.cos(a) * 56, 64 + Math.sin(a) * 56); c.stroke(); }
      c.strokeStyle = '#22c55e'; c.lineWidth = 8; c.beginPath(); c.arc(64, 64, 51, Math.PI * 0.75 + 0.55 * Math.PI * 1.5, Math.PI * 0.75 + 0.75 * Math.PI * 1.5); c.stroke(); const a = Math.PI * 0.75 + clamp(v, 0, 1) * Math.PI * 1.5; c.strokeStyle = '#ec3013'; c.lineWidth = 5; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.cos(a) * 44, 64 + Math.sin(a) * 44); c.stroke(); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(64, 64, 7, 0, 7); c.fill(); gaugeT.needsUpdate = true; };
    K.gauge(0.1);
    // group head + the lever (pivot sits above the group; rest = up, pulled = down toward the barista)
    const gx = Lp.group.x - 0.35, gz = Lp.group.z - (KZ + 0.02);
    M(new T3.CylinderGeometry(0.09, 0.075, 0.18, 16), chrome, gx, 0.42, gz, g, 0.008, 0.09); M(new T3.BoxGeometry(0.12, 0.2, 0.14), brassD, gx, 0.6, gz + 0.04, g, 0.008);
    const lever = new T3.Group(); lever.position.set(gx, 0.66, gz - 0.02); g.add(lever); K.lever = lever; M(new T3.BoxGeometry(0.04, 0.5, 0.04), chrome, 0, 0.25, 0, lever, 0.006); M(new T3.SphereGeometry(0.055, 14, 10), ink, 0, 0.52, 0, lever, 0.008, 0.055); lever.rotation.x = 0.12;
    K.leverTip = () => { lever.updateWorldMatrix(true, false); return lever.localToWorld(new T3.Vector3(0, 0.52, 0)); };
    // drip tray, steam wand + its knob, cup warmer cups on top
    M(new T3.BoxGeometry(0.3, 0.03, 0.2), chrome, gx, 0.095, gz - 0.02, g, 0.006);
    const wx = Lp.wand.x - 0.35, wz = Lp.wand.z - (KZ + 0.02); M(new T3.CylinderGeometry(0.03, 0.03, 0.06, 10), brassD, wx, 0.55, wz + 0.1, g, 0.004).rotation.x = Math.PI / 2;
    const wand = M(new T3.CylinderGeometry(0.012, 0.012, 0.36, 8), chrome, wx, 0.38, wz, g, 0.004); wand.rotation.x = -0.12; K.wandMesh = wand; M(new T3.SphereGeometry(0.035, 10, 8), ink, wx, 0.62, wz + 0.12, g, 0.006, 0.035);
    for (let i = 0; i < 5; i++) M(new T3.CylinderGeometry(0.045, 0.035, 0.07, 12), white, 0.3 + (i % 3) * 0.1, 0.665 + Math.floor(i / 3) * 0.07, 0.12 - (i % 2) * 0.04, g, 0.005, 0.045); }
  // syrup pump bottle, honey bottle, cups stack, pastry dome
  { const pg = new T3.Group(); pg.position.copy(K.pump); pg.rotation.y = rotY; scene.add(pg); K.pumpG = pg; M(new T3.CylinderGeometry(0.07, 0.07, 0.26, 12), toon('#6b2410'), 0, 0.13, 0, pg, 0.008, 0.07); M(new T3.BoxGeometry(0.11, 0.08, 0.002), toon('#e6b45a'), 0, 0.14, -0.072, pg, 0);
    const head = new T3.Group(); head.position.y = 0.28; pg.add(head); K.pumpHead = head; M(new T3.CylinderGeometry(0.012, 0.012, 0.1, 6), ink, 0, 0.03, 0, head, 0.004); M(new T3.BoxGeometry(0.12, 0.03, 0.04), ink, -0.03, 0.08, 0, head, 0.004); }
  { const hg = new T3.Group(); hg.position.copy(K.honey); hg.rotation.y = rotY; scene.add(hg); K.honeyG = hg; M(new T3.CylinderGeometry(0.06, 0.07, 0.18, 12), toon('#e8a020', { transparent: true, opacity: 0.85 }), 0, 0.09, 0, hg, 0.008, 0.07); M(new T3.ConeGeometry(0.05, 0.08, 12), toon('#fbf8ec'), 0, 0.22, 0, hg, 0.006); M(new T3.CylinderGeometry(0.075, 0.075, 0.02, 12), toon('#2f8d84'), 0, 0.12, 0, hg, 0); }
  M(new T3.CylinderGeometry(0.15, 0.17, 0.035, 18), brassD, Lp.pourSpot.x, T + 0.018, Lp.pourSpot.z, root, 0.006, 0.17);
  { const px = Lp.pastry.x, pz = Lp.pastry.z; M(new T3.CylinderGeometry(0.3, 0.3, 0.03, 20), white, px, T + 0.015, pz, root, 0.006, 0.3); for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.12, 0.06, 0.1), toon(i % 2 ? '#8a4213' : '#c9a06a'), px + Math.cos(i * 1.26) * 0.15, T + 0.06, pz + Math.sin(i * 1.26) * 0.15, root, 0.006).rotation.y = i;
    M(new T3.SphereGeometry(0.29, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e8f6fb', { transparent: true, opacity: 0.35 }), px, T + 0.03, pz, root, 0); M(new T3.SphereGeometry(0.03, 8, 6), brass, px, T + 0.33, pz, root, 0.004, 0.03); }
  // brass cash register at the left end of the bar
  { const rx = Lp.register.x, rz = Lp.register.z; M(new T3.BoxGeometry(0.42, 0.2, 0.36), brass, rx, T + 0.1, rz + 0.08, root, 0.01); M(new T3.BoxGeometry(0.4, 0.14, 0.2), brassD, rx, T + 0.27, rz + 0.12, root, 0.008).rotation.x = -0.5;
    for (let i = 0; i < 8; i++) M(new T3.CylinderGeometry(0.018, 0.018, 0.02, 8), white, rx - 0.12 + (i % 4) * 0.08, T + 0.34 - Math.floor(i / 4) * 0.05, rz + 0.06 + Math.floor(i / 4) * 0.06, root, 0.003).rotation.x = -0.5; }
  // lamps over the bar + tables
  const lamps = []; for (const [x, z, y] of [[-0.75, KZ + 0.15, 3.4], [1.55, KZ + 0.15, 3.4], [-4.0, 2.7, 3.3], [4.0, 2.7, 3.3]]) { M(new T3.CylinderGeometry(0.008, 0.008, H - y, 4), ink, x, y + (H - y) / 2, z, root, 0); const sh = M(new T3.ConeGeometry(0.22, 0.2, 16, 1, true), brass, x, y, z, root, 0.008); sh.material = toon('#d9a441', { side: T3.DoubleSide }); const b = M(new T3.SphereGeometry(0.06, 10, 8), toon('#fff6d8', { emissive: '#ffd890', emissiveIntensity: 1 }), x, y - 0.08, z, root, 0); lamps.push(b); }
  K.lamps = lamps;
  // ---- the customer side: two café tables + chairs, plants, rug ----
  const colliders = [], seats = [];
  colliders.push({ type: 'box', x0: -6, x1: 6, z0: -5, z1: KZ + 0.45 + 0.28 });   // bar + everything behind it
  const chair = (x, z, ry) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; g.scale.set(1.45, 1.3, 1.45); root.add(g); M(new T3.BoxGeometry(0.44, 0.05, 0.44), wood, 0, 0.47, 0, g, 0.008); for (const [a, b] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) M(new T3.BoxGeometry(0.04, 0.46, 0.04), woodD, a, 0.23, b, g, 0.004);
    M(new T3.BoxGeometry(0.44, 0.42, 0.04), wood, 0, 0.72, -0.2, g, 0.008); M(new T3.BoxGeometry(0.36, 0.05, 0.36), toon('#2f8d84'), 0, 0.51, 0.01, g, 0.006); { const w = P(x, z, 0.7); seats.push({ x: w.x, z: w.z, ry: ry + rotY, y: w.y }); } colliders.push({ type: 'circle', x: x, z: z, r: 0.34 }); return g; };
  const table = (x, z) => { M(new T3.CylinderGeometry(0.62, 0.62, 0.05, 24), toon('#efe2c4'), x, 1.05, z, root, 0.01, 0.62); M(new T3.CylinderGeometry(0.635, 0.635, 0.03, 24), brass, x, 1.02, z, root, 0, 0.635); M(new T3.CylinderGeometry(0.06, 0.07, 1.0, 8), ink, x, 0.51, z, root, 0.006); M(new T3.CylinderGeometry(0.3, 0.33, 0.04, 14), ink, x, 0.02, z, root, 0.006);
    colliders.push({ type: 'circle', x, z, r: 0.66 }); chair(x - 1.05, z, Math.PI / 2); chair(x + 1.05, z, -Math.PI / 2); };
  table(-4.0, 2.7); table(4.0, 2.7); K.tables = [P(-4.0, 2.7, 1.08), P(4.0, 2.7, 1.08)];
  for (const [x, z] of [[-5.4, 4.4], [5.4, 4.4], [-5.4, 0.45]]) { M(new T3.CylinderGeometry(0.34, 0.26, 0.6, 12), terraD, x, 0.3, z, root, 0.01, 0.34); for (let i = 0; i < 8; i++) { const lf = M(new T3.ConeGeometry(0.13, 1.4, 5), toon(i % 2 ? '#3f6b2a' : '#5a8a3a'), x + Math.cos(i * 0.8) * 0.14, 1.2, z + Math.sin(i * 0.8) * 0.14, root, 0.006); lf.rotation.set(Math.sin(i * 0.8) * 0.5, 0, -Math.cos(i * 0.8) * 0.5); } colliders.push({ type: 'circle', x, z, r: 0.42 }); }
  { const rugT = CTX(256, 128, c => { c.fillStyle = '#2f8d84'; c.fillRect(0, 0, 256, 128); c.strokeStyle = '#d9a441'; c.lineWidth = 6; c.strokeRect(10, 10, 236, 108); c.fillStyle = '#c9682a'; for (let x = 40; x < 230; x += 44) { c.save(); c.translate(x, 64); c.rotate(Math.PI / 4); c.fillRect(-14, -14, 28, 28); c.restore(); } });
    const rug = new T3.Mesh(new T3.PlaneGeometry(2.4, 1.2), TM(rugT)); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.006, D / 2 - 1.0); rug.receiveShadow = true; root.add(rug); }
  const boxW = (x0, x1, z0, z1) => { const a = P(x0, z0, 0), b = P(x1, z1, 0); return { x0: Math.min(a.x, b.x), x1: Math.max(a.x, b.x), z0: Math.min(a.z, b.z), z1: Math.max(a.z, b.z) }; };
  K.colliders = colliders.map(c => c.type === 'box' ? { type: 'box', ...boxW(c.x0, c.x1, c.z0, c.z1) } : { ...c, ...(w => ({ x: w.x, z: w.z }))(P(c.x, c.z, 0)) }); K.seats = seats; { const dp = P(0, D / 2, 0); K.door = { x: dp.x, z: dp.z, w: 2.2, facing: rotY }; } K.keeperSpot = P(-1.75, KZ - 0.85, 0); K.talkSpot = P(-1.75, KZ + 0.95, 0);
  K.walkBox = { ...boxW(-W / 2 + 0.35, W / 2 - 0.35, KZ + 0.73, D / 2 - 0.3), rotY }; K.toWorld = P; K.rotY = rotY;
  // the honey bottle group + register body follow the same rule (see Lp)
  return K;
}

// ---------------- the game ----------------
export async function createEspressoShift({ container, onState = () => {}, mode = 'walk', onExit = null, onLeave = null }) {
  const ST = createStage(container, { bg: '#f3e6cc' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildCafe({ THREE, M, toon, canvasTex, scene, grad, addOutline }), T = K.T, KZ = K.z;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd9a0, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); l.getWorldPosition(s.position); s.scale.setScalar(1.3); scene.add(s); return s; });
  const warm = new THREE.PointLight(0xffc98a, 0.9, 9, 1.6); warm.position.set(0.4, 2.2, KZ + 0.6); scene.add(warm);
  const hideGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };

  // ---------- cast ----------
  const KU_LOOK = { ...CAST.player.look, fur: '#e08a3c', furDark: '#b8460f', muzzle: '#f0a26b', snout: '#f0a26b', paw: '#8a4213', tailBase: '#8a4213', tailMid: '#c9682a', tailTip: '#f6ead2', browColor: '#f6ead2', browWeight: 8 };
  const kubau = hideGear(kit.makeFox({ ...CAST.player, look: KU_LOOK, torso: ['#e8d9bd', '#b89a6a', '#5e4a28'], outfit: 'vest', crest: '', gear: 'none', mood: 'warm' }));
  kubau.position.copy(K.keeperSpot); kubau.rotation.y = 0; scene.add(kubau);
  { const towel = canvasTex(32, 32, c => { for (let y = 0; y < 2; y++) for (let x = 0; x < 2; x++) { c.fillStyle = (x + y) % 2 ? '#fbfbf7' : '#c9682a'; c.fillRect(x * 16, y * 16, 16, 16); } }); const BPk = kubau.userData.P; const t = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.36, 0.03), new THREE.MeshToonMaterial({ map: towel, gradientMap: grad })); t.position.set(-0.3, 0.98, 0.3); t.rotation.z = 0.1; BPk.body.add(t); }
  // Ben at work (tee + uniform) and Ben walking around (the world look: CAST.player, weapons put away)
  const ben = hideGear(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#5e4a28'], crest: '', gear: 'none', mood: 'happy' })); const BP = ben.userData.P; scene.add(ben);
  const benW = hideGear(kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' })); const BW = benW.userData.P; scene.add(benW);
  const drawCup = (g, s) => { g.save(); g.scale(s, s); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#fbf8ec'; g.beginPath(); g.moveTo(-62, -30); g.lineTo(62, -30); g.quadraticCurveTo(58, 60, 0, 66); g.quadraticCurveTo(-58, 60, -62, -30); g.closePath(); g.fill(); st();
    g.beginPath(); g.arc(70, 6, 22, -1.3, 1.3); g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.stroke(); g.lineWidth = 6; g.strokeStyle = '#fbf8ec'; g.stroke();
    g.fillStyle = '#c68a4a'; g.beginPath(); g.ellipse(0, -30, 62, 16, 0, 0, 7); g.fill(); st(); g.fillStyle = '#fbf8ec'; for (const [x, y, rx] of [[0, -40, 10], [-10, -33, 13], [10, -33, 13], [0, -26, 16]]) { g.beginPath(); g.ellipse(x, y, rx, 4, 0, 0, 7); g.fill(); }
    g.strokeStyle = '#201e1d'; g.lineWidth = 5; for (const x of [-22, 0, 22]) { g.beginPath(); g.moveTo(x, -56); g.quadraticCurveTo(x + 12, -72, x, -92); g.stroke(); } g.restore(); };
  const uniform = (() => { const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 100); drawCup(g, 0.78); g.restore();
      g.save(); g.translate(128, 196); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-122, -24); g.lineTo(126, -30); g.lineTo(116, 34); g.lineTo(-130, 30); g.closePath(); g.fill(); g.fillStyle = '#c9682a'; g.beginPath(); g.moveTo(-114, -18); g.lineTo(118, -24); g.lineTo(110, 26); g.lineTo(-121, 23); g.closePath(); g.fill();
      g.font = 'italic 900 40px Archivo, "Arial Black", Arial, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('FOXY CREMA', 0, 2); g.fillStyle = '#ffd23a'; g.fillText('FOXY CREMA', 0, 2); g.restore(); });
    return dinerUniform(ST, ben, { print, printY: 1.17, stripe: '#5e4a28', towelCol: '#c9682a' }).parts; })();
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); };
  setUniform(true);
  const custFox = CUSTOMERS.map(cu => { const f = hideGear(kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark, paw: cu.fur } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  // Ubara + Shala at the left table, arguing about nine tokens
  const tableA = K.tables[0], seatA = K.seats.filter(s => Math.abs(s.z - tableA.z) < 0.1 && Math.abs(s.x - tableA.x) < 1.2);
  const regulars = [['ubara', { fur: '#f2c08a', furDark: '#c28a4a' }, ['#a78bfa', '#ede9fe', '#5b21b6'], 'dress'], ['shala', { fur: '#d9822b', furDark: '#a35510' }, ['#2f8d84', '#cfe8e4', '#1f6a62'], 'robe']].map(([key, lk, torso, outfit], i) => {
    const f = hideGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, ...lk, paw: lk.fur }, torso, outfit, crest: '', gear: 'none', mood: 'happy' })); const s = seatA[i]; s.taken = key; f.position.set(s.x, 0, s.z); f.rotation.y = s.ry; scene.add(f); return { key, f, seat: s }; });
  const sitPose = (f, on) => { const P = f.userData.P; if (!on) return; P.legs[0].rotation.x = P.legs[1].rotation.x = -1.45; P.arms[0].rotation.x = -0.6; P.arms[1].rotation.x = -0.7; };
  // tiny cups on table A
  for (const dx of [-0.25, 0.25]) { const c = M(new THREE.CylinderGeometry(0.045, 0.035, 0.07, 12), toon('#fbf8ec'), tableA.x + dx, tableA.y + 0.035, tableA.z, null, 0.005, 0.045); M(new THREE.CylinderGeometry(0.07, 0.07, 0.01, 14), toon('#fbf8ec'), 0, -0.035, 0, c, 0.004, 0.07); }

  // ---------- props: portafilter, tamper, cup, pitcher, streams ----------
  const pf = new THREE.Group(); scene.add(pf);
  { M(new THREE.CylinderGeometry(0.075, 0.065, 0.05, 18), toon('#d7dde3'), 0, 0, 0, pf, 0.006, 0.075); const h = M(new THREE.CylinderGeometry(0.018, 0.022, 0.22, 8), toon('#201e1d'), 0, 0, -0.15, pf, 0.005); h.rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.03, 0.02, 0.04), toon('#d7dde3'), 0, -0.035, 0.05, pf, 0.003); }
  const grounds = M(new THREE.CylinderGeometry(0.06, 0.06, 1, 18), toon('#3b2410'), 0, 0.025, 0, pf, 0); grounds.geometry.translate(0, 0.5, 0); grounds.scale.y = 0.001;
  const mound = M(new THREE.SphereGeometry(0.06, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#4a2c14'), 0, 0.025, 0, pf, 0); mound.scale.y = 0.01;
  const tamper = new THREE.Group(); scene.add(tamper); tamper.visible = false; M(new THREE.CylinderGeometry(0.058, 0.058, 0.03, 18), toon('#d7dde3'), 0, 0.015, 0, tamper, 0.004, 0.058); M(new THREE.CylinderGeometry(0.02, 0.03, 0.08, 10), toon('#a8792e'), 0, 0.07, 0, tamper, 0.004); M(new THREE.SphereGeometry(0.045, 12, 10), toon('#5e3a1e'), 0, 0.14, 0, tamper, 0.006, 0.045);
  const grindStream = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 1, 6), new THREE.MeshBasicMaterial({ color: 0x3b2410 })); grindStream.visible = false; scene.add(grindStream);
  const shotStream = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.01, 1, 6), new THREE.MeshBasicMaterial({ color: 0x5a3018 })); shotStream.visible = false; scene.add(shotStream);
  const shotStream2 = shotStream.clone(); scene.add(shotStream2);
  const milkStream = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.013, 1, 8), new THREE.MeshBasicMaterial({ color: 0xfbf8ec })); milkStream.visible = false; scene.add(milkStream);
  const honeyStream = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, 1, 6), new THREE.MeshBasicMaterial({ color: 0xe8a020 })); honeyStream.visible = false; scene.add(honeyStream);
  // the latte art canvas (drawn live as you pour), on the cup's surface
  const artCv = document.createElement('canvas'); artCv.width = artCv.height = 256; const artTex = new THREE.CanvasTexture(artCv); artTex.colorSpace = THREE.SRGBColorSpace;
  function makeCup(drinkId) { const big = drinkId !== 'espresso', r = big ? 0.075 : 0.05, h = big ? 0.085 : 0.06, g = new THREE.Group();
    M(new THREE.CylinderGeometry(r * 1.9, r * 1.9, 0.012, 22), toon('#fbf8ec'), 0, 0.006, 0, g, 0.004, r * 1.9);
    const body = M(new THREE.CylinderGeometry(r, r * 0.72, h, 22, 1, true), toon('#fbf8ec', { side: THREE.DoubleSide }), 0, 0.012 + h / 2, 0, g, 0.006, r); body.castShadow = true;
    M(new THREE.CylinderGeometry(r * 0.72, r * 0.72, 0.006, 22), toon('#fbf8ec'), 0, 0.015, 0, g, 0);
    const hd = M(new THREE.TorusGeometry(r * 0.38, r * 0.1, 6, 12, Math.PI * 1.2), toon('#fbf8ec'), r * 1.02, 0.012 + h * 0.55, 0, g, 0.003); hd.rotation.z = -Math.PI * 0.6;
    const band = M(new THREE.CylinderGeometry(r * 0.93, r * 0.86, h * 0.18, 22, 1, true), toon('#c9682a'), 0, 0.012 + h * 0.42, 0, g, 0); band.scale.setScalar(1.012);
    const liq = new THREE.Mesh(new THREE.CircleGeometry(r * 0.94, 32), new THREE.MeshBasicMaterial({ map: artTex })); liq.rotation.x = -Math.PI / 2; liq.position.y = 0.014; liq.visible = false; g.add(liq);
    g.userData = { r, h, liq, base: 0.016, top: 0.012 + h - 0.006 }; scene.add(g); return g; }
  const setFill = (cup, k) => { const u = cup.userData; u.liq.visible = k > 0.01; u.liq.position.y = u.base + (u.top - u.base) * clamp(k, 0, 1); u.liq.scale.setScalar(0.72 + 0.28 * clamp(k, 0, 1)); };
  const jug = new THREE.Group(); scene.add(jug);
  { const body = M(new THREE.CylinderGeometry(0.06, 0.075, 0.16, 18, 1, true), toon('#d7dde3', { side: THREE.DoubleSide }), 0, 0.08, 0, jug, 0.006, 0.075); M(new THREE.CylinderGeometry(0.075, 0.075, 0.008, 18), toon('#c4ccd4'), 0, 0.004, 0, jug, 0); M(new THREE.ConeGeometry(0.025, 0.05, 8), toon('#d7dde3'), 0, 0.15, 0.066, jug, 0.004).rotation.x = 1.2;
    const hd = M(new THREE.BoxGeometry(0.018, 0.1, 0.02), toon('#d7dde3'), 0, 0.09, -0.085, jug, 0.004); hd.rotation.x = 0.2; body.castShadow = true; }
  const milkTop = new THREE.Mesh(new THREE.CircleGeometry(0.064, 22), toon('#fbf8ec')); milkTop.rotation.x = -Math.PI / 2; milkTop.position.y = 0.07; jug.add(milkTop);
  const foamTop = new THREE.Mesh(new THREE.CylinderGeometry(0.064, 0.064, 1, 22), toon('#ffffff')); foamTop.geometry.translate(0, 0.5, 0); foamTop.position.y = 0.07; foamTop.scale.y = 0.001; jug.add(foamTop);
  const resetJug = () => { jug.position.copy(K.jugHome); jug.rotation.set(0, 0, 0); foamTop.scale.y = 0.001; milkTop.position.y = 0.07; milkTop.visible = true; };
  resetJug();
  // hold-sounds (grinder burr, steam hiss, espresso pour) + Ku-bau's corner-bar bossa from the 2D game
  const SND = { node: null, kind: '' };
  // sound: synthesized café SFX + Ku-bau's bossa (minigames/ur/crema-audio.js)
  const CA = createCremaAudio(audio); try { const mv = localStorage.getItem('ur.coffee.music'); if (mv === '0') CA.musicOn = false; } catch (e) {}
  const LOOPK = { grind: 'grind', pour: 'pour', steam: 'steam', milk: 'milk', honey: 'honey', tamp: 'tamp' };
  function holdSound(kind) { if (SND.kind === kind) return; holdStop(); SND.node = CA.loop(LOOPK[kind] || kind); SND.kind = kind; }
  function holdStop() { const h = SND.node; SND.node = null; SND.kind = ''; if (h) h.stop(); }
  const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);
  function musicStep() { CA.step(); }
  function audioOn() { if (!audio.ctx) { audio.init && audio.init(); try { audio.wind.gain.value = 0; audio.wind.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.01); } catch (e) {} } else audio.ctx.resume && audio.ctx.resume(); CA.ambience(true); CA.start(S.phase === 'walk' ? 'walk' : 'shift'); }

  // ---------- graphics polish: blob shadows, sunbeams, steam wisps, order bubbles ----------
  const blobTex = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(40,20,10,0.55)'); g.addColorStop(0.6, 'rgba(40,20,10,0.25)'); g.addColorStop(1, 'rgba(40,20,10,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blobGeo = new THREE.PlaneGeometry(1.1, 1.1).rotateX(-Math.PI / 2), blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
  const blobs = []; const addBlob = f => { const m = new THREE.Mesh(blobGeo, blobMat); m.renderOrder = 1; scene.add(m); blobs.push({ f, m }); };
  [kubau, ben, benW, ...custFox, ...regulars.map(r => r.f)].forEach(addBlob);
  function blobStep() { for (const b of blobs) { const vis = b.f.visible && b.f.parent; b.m.visible = !!vis; if (vis) { b.m.position.set(b.f.position.x, 0.012, b.f.position.z); const sc = 1 - Math.min(0.4, Math.max(0, b.f.position.y) * 0.5 + (b.f.userData.hopY || 0)); b.m.scale.setScalar(sc); } } }
  // sunbeams through the two street windows (soft additive shafts on the floor)
  const beamTex = canvasTex(128, 256, c => { const g = c.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, 'rgba(255,214,150,0.9)'); g.addColorStop(1, 'rgba(255,214,150,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(20, 0); c.lineTo(108, 0); c.lineTo(128, 256); c.lineTo(0, 256); c.closePath(); c.fill(); });
  const beams = []; for (const cx of [-3.4, 3.4]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: beamTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.16 })); m.position.set(cx + (cx > 0 ? -0.5 : 0.5), 0.014, K.D / 2 - 1.6); m.rotation.y = cx > 0 ? 0.25 : -0.25; m.renderOrder = 2; scene.add(m); beams.push(m); }
  // steam wisps (own little pool so the job's smoke puffs are not used up)
  const wispS = []; for (let i = 0; i < 18; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); scene.add(sp); wispS.push({ s: sp, life: 0, v: V3() }); } let wI = 0, wT = 0;
  const wisp = (x, y, z, sz = 0.12) => { const w = wispS[wI = (wI + 1) % wispS.length]; w.s.position.set(x + rr(-0.02, 0.02), y, z + rr(-0.02, 0.02)); w.life = 1; w.sz = sz; w.v.set(rr(-0.03, 0.03), rr(0.18, 0.3), rr(-0.03, 0.03)); };
  function wispStep(dt) { for (const w of wispS) { if (w.life <= 0) { w.s.material.opacity = 0; continue; } w.life -= dt * 0.55; w.s.position.addScaledVector(w.v, dt); w.v.x += Math.sin((1 - w.life) * 9) * dt * 0.05; w.s.material.opacity = 0.22 * Math.sin(Math.PI * Math.max(0, w.life)); w.s.scale.setScalar(w.sz * (1 + (1 - w.life) * 1.6)); }
    wT -= dt; if (wT > 0) return; wT = 0.22; const src = [];
    if (cupMesh && cupMesh.visible && C && STEP_ORDER(step()) >= STEP_ORDER('pull')) src.push(cupMesh.position.clone().setY(cupMesh.position.y + (cupMesh.userData.top || 0.08) + 0.02));
    orders.forEach(o => { if (o.cup && o.f.visible) { const p = V3(); o.cup.getWorldPosition(p); src.push(p.setY(p.y + 0.12)); } });
    if (Math.random() < 0.25) src.push(V3(K.machine.position.x, T + 1.15, K.machine.position.z + 0.02)); if (Math.random() < 0.18) src.push(V3(K.tables[0].x + (Math.random() < 0.5 ? -0.25 : 0.25), K.tables[0].y + 0.08, K.tables[0].z));
    src.forEach(p => wisp(p.x, p.y, p.z)); }
  // order bubbles over waiting customers: the drink, and a dot that goes red as patience runs out
  const bubbleTex = {}, bubbleFor = (drink, mood) => { const key = drink + mood; if (bubbleTex[key]) return bubbleTex[key]; bubbleTex[key] = canvasTex(256, 128, c => { c.fillStyle = '#000'; c.fillRect(8, 8, 240, 96); c.fillStyle = mood === 2 ? '#ec3013' : mood === 1 ? '#ffd23a' : '#22c55e'; c.fillRect(8, 8, 18, 96); c.strokeStyle = '#ffd23a'; c.lineWidth = 6; c.strokeRect(8, 8, 240, 96); c.beginPath(); c.moveTo(110, 104); c.lineTo(128, 124); c.lineTo(146, 104); c.fillStyle = '#000'; c.fill();
      // little cup icon
      c.fillStyle = '#fbf8ec'; c.beginPath(); c.moveTo(40, 40); c.lineTo(80, 40); c.lineTo(74, 78); c.lineTo(46, 78); c.closePath(); c.fill(); c.strokeStyle = '#fbf8ec'; c.lineWidth = 5; c.beginPath(); c.arc(82, 56, 9, -1.2, 1.2); c.stroke(); c.fillStyle = drink === 'espresso' ? '#5a3018' : '#c68a4a'; c.fillRect(44, 40, 32, 8);
      c.fillStyle = '#fff'; c.font = '900 30px Archivo, Arial'; c.textBaseline = 'middle'; const nm = { espresso: 'ESPRESSO', latte: 'LATTE', cappuccino: 'CAPPUCCINO', honey: 'HONEY LATTE' }[drink] || drink.toUpperCase(); let fs = 30; while (fs > 16) { c.font = '900 ' + fs + 'px Archivo, Arial'; if (c.measureText(nm).width < 148) break; fs -= 2; } c.fillText(nm, 96, 58); }); return bubbleTex[key]; };
  const bubbles = custFox.map(() => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false })); sp.scale.set(1.1, 0.55, 1); sp.renderOrder = 22; sp.visible = false; scene.add(sp); return sp; });
  function bubbleStep(t) { bubbles.forEach(b => b.visible = false); if (S.phase !== 'shift' || S.react || S.pay) return; orders.forEach(o => { if (o.st !== 'wait') return; const b = bubbles[o.ci], r = o.pat / o.patMax, mood = r < 0.3 ? 2 : r < 0.6 ? 1 : 0, tex = bubbleFor(o.drink, mood); if (b.material.map !== tex) { b.material.map = tex; b.material.needsUpdate = true; } const making = C && C.oid === o.id; b.visible = true; b.position.set(o.f.position.x, 3.2 + Math.sin(t * 2 + o.ci) * 0.04, o.f.position.z); b.material.opacity = making ? 1 : 0.85; b.scale.set(making ? 1.2 : 1.0, making ? 0.6 : 0.5, 1); }); }

  // ---------- cameras ----------
  const CAM = { look: V3(0, 1.2, KZ), from: null, t: 1, dur: 1 };
  const { SAFE, shotFor } = cameraFit(ST);
  const port = () => CW() < CHh();
  const wideShot = () => { const z = KZ + 1.6, x = -0.7, box = [V3(x - 0.55, 0.05, z), V3(x + 0.55, 0.05, z), V3(x - 0.55, 2.25, z), V3(x + 0.55, 2.25, z), V3(x, 2.5, z)];
    const sh = port() ? shotFor('wideP', () => box, 0.3, Math.PI - 0.25, 0.1) : shotFor('wideL', () => box, 0.2, Math.PI - 0.3, 0.05); if (sh.pos.y < 0.9) { sh.look.y += 0.9 - sh.pos.y; sh.pos.y = 0.9; } return sh; };
  const FOCUS = { all: 1, grind: 1, tamp: 1, brew: 1, milk: 1, art: 1, serve: 1 };
  function shotPoints(id) { const P = (p, dx = 0, dz = 0, dy = 0) => V3(p.x + dx, p.y + dy, p.z + dz), out = [];
    if (id === 'grind') out.push(P(K.grinder, -0.24, -0.34), P(K.grinder, 0.24, 0.18), P(K.grinder, 0.24, -0.34), P(K.grinder, -0.24, 0.18), P(K.grinder, 0.24, 0, 0.8), P(K.grinder, -0.24, 0, 0.8), P(K.knock, 0, 0, 0.1));
    else if (id === 'tamp') out.push(P(K.tampMat, -0.22, -0.22), P(K.tampMat, 0.22, 0.2), P(K.tampMat, 0, 0, 0.3), P(K.grinder, -0.1, -0.2, 0.2));
    else if (id === 'brew') out.push(P(K.drip, -0.25, -0.15), P(K.drip, 0.25, -0.15), P(K.group, 0, 0, 0.6), P(K.pump, 0.1, 0, 0.35), P(K.tampMat, 0.2, -0.15), P(K.tampMat, -0.15, 0.12, 0.1), P(K.drip, 0, 0.2, 0.2));
    else if (id === 'milk') out.push(P(K.wand, -0.2, -0.2, -0.22), P(K.wand, 0.2, -0.2, -0.22), P(K.wand, 0, 0, 0.42), P(K.jugHome, -0.12, -0.1), P(K.machine.position, -0.05, -0.24, 0.42));
    else if (id === 'art') { const c = artCenter(); out.push(P(c, -0.13, -0.13), P(c, 0.13, 0.13), P(c, -0.13, 0.13), P(c, 0.13, -0.13), P(c, 0, 0, 0.16)); }
    else if (id === 'serve') { out.push(P(K.pourSpot, -0.2, -0.2), P(K.pourSpot, 0.2, 0.1, 0.2)); const tgt = serveSpot(); (port() && tgt >= 0 ? [K.spots[tgt]] : K.spots).forEach(s => out.push(V3(s.x - 0.5, 2.45, s.z), V3(s.x + 0.5, 1.2, s.z))); }
    else { out.push(V3(-3.1, T, KZ - 0.5), V3(3.1, T, KZ - 0.5), V3(-3.1, T, KZ + 0.4), V3(3.1, T, KZ + 0.4), V3(0.35, T + 1.12, KZ)); K.spots.forEach(s => out.push(V3(s.x, 1.5, s.z), V3(s.x, 3.45, s.z))); }
    return out; }
  const ELV = { all: [0.62, 0.85], grind: [1.0, 0.8], tamp: [1.2, 1.0], brew: [0.75, 0.6], milk: [0.7, 0.55], art: [1.42, 1.32], serve: [0.42, 0.6] };
  const serveSpot = () => { const o = C && orders.find(q => q.id === C.oid && q.st === 'wait'); return o ? o.spot : -1; };
  function workShot(id = S.focus || 'all') { const e = ELV[id] || ELV.all; return shotFor('w:' + id + (id === 'art' ? ':' + artKey() : id === 'serve' ? ':' + serveSpot() : ''), () => shotPoints(id), port() ? e[0] : e[1], 0, id === 'all' ? 0.03 : 0.06); }
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  camera.position.set(0, 2.6, 7.5); camera.lookAt(CAM.look);

  // ---------- game state ----------
  const S = { mode, phase: mode === 'walk' ? 'walk' : 'intro', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, payOut: null, next: 3, done: null, combo: 0, hold: null, stroke: null, react: null, fade: 0, xp: 0, tipSeen: {}, userFocusT: 0, lastInput: 0 };
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const orders = []; let C = null, idSeq = 1, cupMesh = null, drag = null, slide = null;
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 4) => { S.say = s; S.sayT = t; };
  const avail = () => DRINKS.filter(d => d.day <= S.day), DR = id => DRINKS.find(d => d.id === id);
  const shotBand = sh => { const b = SHOTS[sh], w = upg('gauge') ? (b.hi - b.lo) * 0.15 : 0; return [b.lo - w, b.hi + w]; };
  const tempBand = () => upg('thermo') ? [55, 73] : TEMP;
  const step = () => C && C.steps[C.i];
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const custName = ci => CUSTOMERS[ci].name;
  const artCenter = () => V3(K.pourSpot.x, T + 0.012 + (cupMesh ? cupMesh.userData.top : 0.08), K.pourSpot.z);
  const artKey = () => C && C.drink === 'espresso' ? 's' : 'b';
  function makeSpec(drink) { const d = DR(drink);
    return { shot: drink === 'espresso' ? pick(['ristretto', 'normale', 'lungo']) : pick(['normale', 'normale', 'ristretto']), dose: pick([17, 18, 18, 19, 20]), milk: d.milk || null, art: d.art || null, lobes: d.art === 'rosetta' ? pick([6, 7, 8]) : 0, syrup: S.day >= SYRUP.day && Math.random() < 0.35 ? pick([1, 2, 2, 3]) : 0, honey: !!d.honey }; }
  const stepsFor = (drink, spec) => ['grind', 'tamp', 'lock', ...(spec.syrup ? ['syrup'] : []), 'pull', ...(spec.milk ? ['steam', 'art'] : []), ...(spec.honey ? ['honey'] : []), 'serve'];
  const priceOf = o => DR(o.drink).price + (o.spec.syrup ? SYRUP.price : 0);
  const sfx = k => CA.sfx(k === 'click' ? 'leaf' : k);

  // ---------- art canvas: crema, rosetta leaves, heart, honey ----------
  // art space is the 2D game's: cup centre (100, 80), radius 42; far rim y = 38, near rim y = 122
  const AX = x => (x - 58) / 84 * 256, AY = y => (y - 38) / 84 * 256;
  function drawArt() { const c = artCv.getContext('2d'); c.clearRect(0, 0, 256, 256); if (!C) return;
    const shotK = clamp(C.shot / 60, 0.35, 1), gr = c.createRadialGradient(128, 128, 10, 128, 128, 128); gr.addColorStop(0, '#8a5228'); gr.addColorStop(0.65, '#b0723a'); gr.addColorStop(1, '#6b3a18'); c.fillStyle = gr; c.fillRect(0, 0, 256, 256);
    c.globalAlpha = 0.25 * shotK; c.fillStyle = '#e8c08a'; for (let i = 0; i < 26; i++) { c.beginPath(); c.arc(128 + Math.cos(i * 2.4) * (30 + i * 3), 128 + Math.sin(i * 2.4) * (30 + i * 3), 3 + (i % 4), 0, 7); c.fill(); } c.globalAlpha = 1;
    const A = C.art, milkCol = '#f6f2ea';
    if (A.base > 0) { c.globalAlpha = Math.min(0.85, A.base); c.fillStyle = '#d9b58a'; c.beginPath(); c.arc(128, 128, 120, 0, 7); c.fill(); c.globalAlpha = 1; }
    if (C.spec.art === 'heart') { if (A.blob > 0) { const r = A.blob / 84 * 256, bx = AX(A.bx), by = AY(A.by); c.fillStyle = milkCol;
        if (A.pull) { const ex = AX(A.pull.x), ey = AY(A.pull.y), ang = Math.atan2(ey - by, ex - bx) - Math.PI / 2; c.save(); c.translate(bx, by); c.rotate(ang); c.beginPath(); c.moveTo(0, r * 1.25); c.bezierCurveTo(-r * 1.5, r * 0.25, -r * 1.05, -r * 1.2, 0, -r * 0.45); c.bezierCurveTo(r * 1.05, -r * 1.2, r * 1.5, r * 0.25, 0, r * 1.25); c.fill(); c.restore();
          c.strokeStyle = '#c9905a'; c.lineWidth = 3; c.beginPath(); c.moveTo(AX(A.pull.sx), AY(A.pull.sy)); c.lineTo(ex, ey); c.stroke(); }
        else { c.beginPath(); c.arc(bx, by, r, 0, 7); c.fill(); c.strokeStyle = 'rgba(201,144,90,0.5)'; c.lineWidth = 2; for (let k = 0.45; k < 1; k += 0.2) { c.beginPath(); c.arc(bx, by + r * (1 - k) * 0.4, r * k, 0, 7); c.stroke(); } } } }
    else { A.lobes.forEach(l => { const prog = clamp((l.y - 44) / 64, 0, 1), rx = (7 + prog * 9) / 84 * 256, ry = (3.6 + prog * 1.2) / 84 * 256 * 1.4; c.save(); c.translate(AX(l.x), AY(l.y)); c.rotate(l.side * (10 + prog * 12) * Math.PI / 180); c.fillStyle = milkCol; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(176,114,58,0.55)'; c.lineWidth = 2; c.beginPath(); c.ellipse(0, ry * 0.25, rx * 0.8, ry * 0.5, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.restore(); });
      if (A.stem) { c.strokeStyle = milkCol; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(AX(100), AY(A.stem.y)); c.lineTo(AX(100), AY(46)); c.stroke(); } }
    if (step() === 'art' && !A.on && !A.lobes.length && !A.blob) { c.save(); c.setLineDash([6, 6]); c.lineWidth = 3; c.strokeStyle = 'rgba(255,248,230,0.55)';
      if (C.spec.art === 'heart') { c.beginPath(); c.arc(AX(100), AY(80), 24 / 84 * 256, 0, 7); c.stroke(); c.beginPath(); c.moveTo(AX(100), AY(70)); c.lineTo(AX(100), AY(112)); c.stroke(); }
      else { c.beginPath(); for (let i = 0; i <= 24; i++) { const k = i / 24, y = 46 + k * 64, x = 100 + Math.sin(i * 1.6) * (6 + k * 12); i ? c.lineTo(AX(x), AY(y)) : c.moveTo(AX(x), AY(y)); } c.stroke(); c.beginPath(); c.moveTo(AX(100), AY(112)); c.lineTo(AX(100), AY(46)); c.stroke(); }
      c.restore(); }
    if (C.honey.pts.length > 1) { c.strokeStyle = '#e8a020'; c.lineWidth = 5; c.lineJoin = c.lineCap = 'round'; c.beginPath(); C.honey.pts.forEach((p, i) => i ? c.lineTo(AX(p.x), AY(p.y)) : c.moveTo(AX(p.x), AY(p.y))); c.stroke(); c.strokeStyle = 'rgba(255,240,180,0.7)'; c.lineWidth = 1.5; c.stroke(); }
    artTex.needsUpdate = true; }

  // ---------- orders + customers ----------
  function newOrder() { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i && o.st !== 'gone')); if (free < 0) return; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)); if (!pool.length) return; const ci = pick(pool);
    const list = avail(), drink = S.forceDrink ? S.forceDrink : S.demo && S.demoOrders && S.demoOrders.length ? S.demoOrders.shift() : S.day <= 1 && S.served + S.lost === 0 && !orders.length ? 'espresso' : pick(list.slice(-Math.min(list.length, 3 + S.day))).id, spec = makeSpec(drink); if (S.demo) spec.syrup = drink === 'cappuccino' ? 1 : 0;
    const patMax = (115 - Math.min(35, (S.day - 1) * 7)) * (upg('radio') ? 1.2 : 1), f = custFox[ci]; f.visible = true; f.position.set(K.door.x + rr(-0.5, 0.5), 0, K.door.z - 0.2); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.userData.lineMood = null;
    const o = { id: idSeq++, ci, spot: free, drink, spec, pat: patMax, patMax, st: 'walk', f, line: pick(LINES.order), t: 0 }; o.total = priceOf(o); orders.push(o); sfx('door'); }
  const waiting = () => orders.filter(o => o.st === 'wait');
  function nextOrderToMake() { return waiting().filter(o => !o.cupDone).sort((a, b) => a.pat - b.pat)[0] || null; }
  function startCup(o) { C = { oid: o.id, ci: o.ci, drink: o.drink, spec: { ...o.spec }, steps: stepsFor(o.drink, o.spec), i: 0, scores: {}, notes: [], grams: 0, crank: 0, press: 0, tiltSum: 0, tiltN: 0, tilt: 0, shot: 0, temp: 20, foam: 6, depth: 0.5, pumps: 0,
      art: { lobes: [], stem: null, lastX: null, lastDir: 0, artY: 42, on: false, base: 0, blob: 0, bx: 100, by: 80, pull: null }, honey: { pts: [], zig: 0, lastDir: 0, lastX: null, ext: 100 } };
    o.making = true; if (cupMesh) scene.remove(cupMesh); cupMesh = makeCup(o.drink); cupMesh.visible = false; setFill(cupMesh, 0); pfHome(); grounds.scale.y = 0.001; mound.scale.y = 0.01; resetJug(); drawArt(); beginStep(); }
  // where the portafilter / cup sit; moves glide (PF.to)
  const PF = { to: null, rot: 0 }; const pfAt = (p, dy = 0) => V3(p.x, p.y + dy, p.z);
  function pfHome() { PF.to = pfAt(K.chute, -0.02); }
  function beginStep() { const s = step(); if (!s) return; S.touched = false; if (s === 'art') setTimeout(drawArt, 0); S.hold = null; S.stroke = null; holdStop(); const st = STEP_INFO[s].st; S.focus = st; S.userFocusT = 0;
    if (s === 'grind') pfHome(); else if (s === 'tamp') PF.to = pfAt(K.tampMat, 0.03); else if (s === 'lock') PF.to = pfAt(K.tampMat, 0.03);
    else if (s === 'steam') { CUPTO.to = pfAt(K.pourSpot, 0.035); }
    else if (s === 'serve') { CUPTO.to = pfAt(K.pourSpot, 0.035); }
    // Ku-bau's own words the first time you meet each step (day 1 + 2)
    const TIP = { grind: KUBAU.how[1], tamp: KUBAU.how[2], pull: KUBAU.how[3], steam: KUBAU.how[4], art: KUBAU.how[5] };
    if (TIP[s] && !S.tipSeen[s] && S.day <= 2 && !DM.on) { S.tipSeen[s] = 1; say('KU-BAU: “' + TIP[s] + '”', 7); } }
  function commit(name, score) { if (!C) return; const sc = Math.round(clamp(score, 0, 100)); if (name) { C.scores[name] = sc; sfx(sc >= 75 ? 'good' : sc >= 45 ? 'stage' : 'bad'); if (!DM.on) buzz(sc >= 75 ? [18, 40, 18] : sc >= 45 ? 25 : 70); flash(name.toUpperCase() + ' · ' + sc, sc >= 75 ? '#22c55e' : sc >= 45 ? '#ffd23a' : '#ec3013', 1.1); } else sfx('clack');
    S.hold = null; S.stroke = null; holdStop(); C.i++; beginStep(); }
  const note = t => C && C.notes.push(t);
  // ---- scoring: the 2D game's formulas ----
  function doseScore() { const want = C.spec.dose; if (C.grams < 1) { note('Nothing came out of the grinder.'); return 0; } const off = Math.abs(C.grams - want); if (off > 1.2) note(C.grams < want ? 'Under-dosed by ' + off.toFixed(1) + 'g — the shot will run thin.' : 'Over-dosed by ' + off.toFixed(1) + 'g — the puck will choke.'); return off <= 1 ? 100 : clamp(100 - (off - 1) * 17, 0, 100); }
  function tampScore() { if (C.press < 4) { note('The puck never got tamped.'); return 0; } const tilt = C.tiltN ? C.tiltSum / C.tiltN : 0, ps = C.press >= 52 && C.press <= 78 ? 100 : clamp(100 - Math.abs(C.press - 65) * 2.6, 0, 100), lv = clamp(100 - tilt * 7, 0, 100);
    if (C.press < 52) note('Light tamp — water will channel straight through.'); else if (C.press > 78) note('Tamped too hard — the shot will strangle.'); if (tilt > 5) note('Hand drifted off centre, so the bed tamped on a slant.'); return ps * 0.55 + lv * 0.45; }
  function shotScore() { const [lo, hi] = shotBand(C.spec.shot), mid = (lo + hi) / 2, half = (hi - lo) / 2, off = Math.abs(C.shot - mid), nm = SHOTS[C.spec.shot].name.toLowerCase(); if (C.shot >= 99) { note('The shot ran forever — bitter and watery.'); return 8; } if (off <= half) return 100 - off / half * 12;
    note(C.shot < lo ? 'Pulled short of a ' + nm + ' — sour and thin.' : 'Ran past a ' + nm + ' — over-extracted and bitter.'); return clamp(88 - (off - half) * 3.2, 0, 88); }
  function milkScore() { const tb = tempBand(), fb = MILK[C.spec.milk].foam, tMid = (tb[0] + tb[1]) / 2, tHalf = (tb[1] - tb[0]) / 2, fMid = (fb[0] + fb[1]) / 2, fHalf = (fb[1] - fb[0]) / 2, tOff = Math.abs(C.temp - tMid), fOff = Math.abs(C.foam - fMid);
    if (C.temp >= 99) { note('Milk scalded — it went thin and eggy.'); return 10; } const ts = tOff <= tHalf ? 100 - tOff / tHalf * 12 : clamp(88 - (tOff - tHalf) * 3.4, 0, 88), fs = fOff <= fHalf ? 100 - fOff / fHalf * 12 : clamp(88 - (fOff - fHalf) * 3.2, 0, 88);
    if (C.temp < tb[0]) note('Milk pulled off cold — it will not hold the pour.'); else if (C.temp > tb[1]) note('Milk run hot — the sweetness is gone.'); if (C.foam < fb[0]) note('Too little foam — the milk is flat.'); else if (C.foam > fb[1]) note('Stretched too long — stiff foam, no shine.'); return ts * 0.55 + fs * 0.45; }
  function artScore() { const A = C.art;
    if (C.spec.art === 'heart') { if (A.blob < 6) { note('The pour never formed a pattern.'); return 0; } const size = clamp(100 - Math.abs(A.blob - 24) * 4, 0, 100), cen = clamp(100 - Math.hypot(A.bx - 100, A.by - 80) * 3, 0, 100), pl = A.pull ? clamp(((A.pull.y - A.pull.sy) / 34) * 100, 0, 100) * clamp(1 - Math.abs(A.pull.x - A.pull.sx) / 30, 0, 1) : 0;
      if (A.blob < 16) note('Small heart — hold the pour a little longer.'); else if (A.blob > 32) note('The heart flooded the cup.'); if (!A.pull) note('No line through the middle, so it stayed a blob.'); if (cen < 60) note('The heart drifted off the middle.'); return size * 0.4 + cen * 0.25 + pl * 0.35; }
    const want = C.spec.lobes, lo = A.lobes; if (lo.length < 2) { note('The pour never formed a pattern.'); return 0; }
    const count = clamp(100 - Math.abs(lo.length - want) * 10, 0, 100), left = lo.filter(l => l.side < 0), right = lo.filter(l => l.side > 0), amp = arr => arr.length ? arr.reduce((a, b) => a + Math.abs(b.x - 100), 0) / arr.length : 0, sym = clamp(100 - Math.abs(amp(left) - amp(right)) * 9, 0, 100);
    const ys = lo.map(l => l.y).sort((a, b) => a - b), gaps = []; for (let i = 1; i < ys.length; i++) gaps.push(ys[i] - ys[i - 1]); const gm = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0, dev = gaps.length ? gaps.reduce((a, b) => a + Math.abs(b - gm), 0) / gaps.length : 0, even = gaps.length >= 3 ? clamp(100 - dev * 12, 0, 100) : 30, reach = clamp((ys[ys.length - 1] - ys[0]) / 56 * 112, 0, 100);
    if (lo.length < want - 1) note('Only ' + lo.length + ' leaves — wiggle faster as you draw the jug back.'); else if (lo.length > want + 2) note(lo.length + ' leaves crowded the cup — slow the wiggle down.'); if (Math.abs(amp(left) - amp(right)) > 4) note('The rosetta came out lopsided.'); if (reach < 70) note('The pattern stopped short of the near rim.'); if (!A.stem) note('No stem drawn through the middle to finish it.');
    return count * 0.3 + sym * 0.24 + even * 0.22 + reach * 0.14 + (A.stem ? 100 : 0) * 0.1; }
  function honeyScore() { const z = C.honey.zig; if (z < 3) note('A dribble of honey, not a drizzle.'); return clamp(100 - Math.abs(z - 5) * 12, 0, 100); }
  function syrupScore() { const d = Math.abs(C.pumps - C.spec.syrup); if (d) note(C.pumps < C.spec.syrup ? 'Short on date syrup.' : 'Too much date syrup — it tastes like candy.'); return d === 0 ? 100 : d === 1 ? 55 : 15; }

  // ---------- step actions (shared by touch, mouse and the demo autopilot) ----------
  function grindTurn(d) { if (step() !== 'grind' || d <= 0) return; C.crank += d; const g0 = Math.floor(C.grams); C.grams = clamp(C.crank / (Math.PI * 2) * 3, 0, 34); if (Math.floor(C.grams) > g0) { const atDose = Math.floor(C.grams) === C.spec.dose - 1 || Math.floor(C.grams) === C.spec.dose; sfx(Math.floor(C.grams) === C.spec.dose ? 'ding' : 'tick'); if (!DM.on) buzz(atDose ? 25 : 6); } K.crank.rotation.y -= d; S.grindT = 0.18; }
  function grindDone() { if (step() !== 'grind' || C.grams < 0.5) return false; commit('Dose', doseScore()); return true; }
  function knockOut() { if (step() !== 'grind' || C.grams <= 0) return; C.grams = 0; C.crank = 0; sfx('knock'); puff(K.knock.x, T + 0.2, K.knock.z, 0x5e3a1e, 3); flash('BASKET EMPTIED', '#ffd23a', 0.9); }
  function tampMove(off) { if (step() !== 'tamp' || !S.hold) return; const k = upg('tamper') ? 0.5 : 1; C.tilt = Math.abs(off) * 12 * k; C.tiltSum += C.tilt; C.tiltN++; S.hold.off = off; }
  function tampDone() { if (step() !== 'tamp') return; sfx('tamp'); commit('Tamp', tampScore()); }
  function lockIn() { if (step() !== 'lock') return; PF.to = pfAt(K.group, -0.07); PF.locked = true; cupMesh.visible = true; CUPTO.to = pfAt(K.drip, 0.11); cupMesh.position.copy(K.cupStack).setY(T + 0.68); setTimeout(() => sfx('clink'), 380); commit(null, 0); }
  function pumpOnce() { if (step() !== 'syrup') return; C.pumps++; S.pumpT = 0.25; buzz(12); sfx('pump'); puff(K.drip.x, T + 0.2, K.drip.z, 0x6b2410, 1); if (C.pumps >= C.spec.syrup + 2) commit('Syrup', syrupScore()); }
  function syrupDone() { if (step() !== 'syrup') return; commit('Syrup', syrupScore()); }
  function pullStart() { if (step() === 'syrup') syrupDone(); if (step() !== 'pull') return false; S.hold = { kind: 'pull' }; sfx('creak'); setTimeout(() => S.hold && S.hold.kind === 'pull' && holdSound('pour'), 260); return true; }
  function pullDone() { if (step() !== 'pull') return; S.hold = null; holdStop(); sfx('spring'); commit('Shot', shotScore()); PF.locked = false; PF.to = pfAt(K.knock, 0.18); setTimeout(() => { sfx('knock'); grounds.scale.y = 0.001; mound.scale.y = 0.01; pfHome(); }, 700); CUPTO.to = pfAt(K.pourSpot, 0.035); setTimeout(() => sfx('clink'), 420); }
  function steamStart() { if (step() !== 'steam') return false; S.hold = { kind: 'steam' }; holdSound('steam'); return true; }
  function steamStop() { if (step() !== 'steam' || !S.hold) return; S.hold = null; holdStop(); const tb = tempBand(), fb = MILK[C.spec.milk].foam, tIn = C.temp >= tb[0] && C.temp <= tb[1], fIn = C.foam >= fb[0] && C.foam <= fb[1];
    if ((tIn && fIn) || C.temp >= tb[1] + 6 || C.foam > fb[1] + 8) { commit('Milk', milkScore()); return; } flash(!fIn && C.foam < fb[0] ? 'MORE FOAM · SLIDE DOWN' : C.temp < tb[0] ? 'NOT HOT YET · SLIDE UP' : 'ALMOST', '#ffd23a', 1.2); }
  // rosetta: each change of direction lays a leaf (2D rule); heart: hold to grow, then draw through it
  function artDown(x, y) { const A = C.art; if (C.spec.art === 'heart') { if (A.pull) return; if (!A.blob) { A.bx = x; A.by = y; } A.on = true; A.hx = x; A.hy = y; holdSound('milk'); return; }
    if (Math.hypot(x - 100, y - 80) > 46) return; A.on = true; A.lastX = x; A.lastDir = 0; A.artY = Math.max(y, 44); holdSound('milk'); }
  function artMove(x, y) { const A = C.art; if (!A.on) return; A.px = x; A.py = y;
    if (C.spec.art === 'heart') { if (!A.pull && A.blob > 8 && Math.hypot(x - A.hx, y - A.hy) > 7) A.pull = { sx: A.bx, sy: A.by - A.blob * 0.6, x, y }; else if (A.pull) { A.pull.x = x; A.pull.y = Math.max(A.pull.y, y); } drawArt(); return; }
    const dx = x - A.lastX; if (Math.abs(dx) < 1.4) return; const dir = dx > 0 ? 1 : -1;
    if (A.lastDir !== 0 && dir !== A.lastDir && Math.abs(A.lastX - 100) > 3.5 && y >= A.artY - 2) { const yy = clamp(Math.max(y, A.artY), 44, 116); A.lobes.push({ x: A.lastX, y: yy, side: A.lastX < 100 ? -1 : 1 }); sfx('click'); if (!DM.on) buzz(8); A.lastX = x; A.lastDir = dir; A.artY = yy; drawArt();
      if (yy > 108 || A.lobes.length >= 14) { A.on = false; A.stem = { y: yy }; holdStop(); drawArt(); commit('Art', artScore()); } return; }
    A.lastX = x; A.lastDir = dir; A.artY = Math.max(A.artY, Math.min(y, 116)); }
  function artUp() { const A = C.art; if (!A.on) return; A.on = false; holdStop();
    if (C.spec.art === 'heart') { if (A.blob >= 6 && (A.pull || A.blob > 34)) { drawArt(); commit('Art', artScore()); } return; }
    if (A.lobes.length >= 1) { A.stem = A.lobes.length >= 2 ? { y: A.artY } : null; drawArt(); commit('Art', artScore()); } }
  function honeyPt(x, y, first) { const H = C.honey; if (first) { H.on = true; H.lastX = x; H.lastDir = 0; H.ext = x; holdSound('honey'); } if (!H.on) return; H.pts.push({ x, y }); if (H.pts.length > 400) H.pts.shift(); const dx = x - H.lastX;
    if (Math.abs(dx) > 1.2) { const dir = dx > 0 ? 1 : -1; if (H.lastDir && dir !== H.lastDir && Math.abs(H.ext - 100) > 12) { H.zig++; sfx('leaf'); } if (dir !== H.lastDir) H.ext = x; else H.ext = dir > 0 ? Math.max(H.ext, x) : Math.min(H.ext, x); H.lastDir = dir; H.lastX = x; } drawArt(); }
  function honeyUp() { const H = C.honey; if (!H.on) return; H.on = false; holdStop(); if (H.zig >= 3) commit('Honey', honeyScore()); else flash('MORE ZIG-ZAGS', '#ffd23a', 1); }

  // ---------- serve, react, pay ----------
  const CUPTO = { to: null };
  const REACT = { delighted: { word: 'DELIGHTED!', col: '#22c55e', mood: 'excited', lines: ['That is the best cup in Ur. Do not tell Ku-bau I said so.', 'Look at that crema!', 'I am coming back tomorrow. And the day after.'] },
    happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Lovely. Just how I like it.', 'Smooth. Thank you.', 'Now the day can start.'] },
    neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['It is coffee. It is fine.', 'Bit off, but it is hot.', 'Okay. Thanks.'] },
    unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['That is not quite right.', 'Ku-bau makes it smoother.', 'Hmm. Sour.'] },
    upset: { word: 'UPSET', col: '#ff7a5a', mood: 'stern', lines: ['I can taste the lake in this.', 'Bitter as the Pyramid Path.', 'Did the machine bite you?'] },
    insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'stern', lines: ['That is NOT my order!', 'Do I look like I ordered that?', 'Make it again. Properly.'] } };
  const cupAvg = () => { const v = Object.values(C.scores); return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0; };
  function slideTo(o) { if (!C || step() !== 'serve' || slide || S.react) return; const to = V3(o.f.position.x, T + 0.035, K.pass.z); slide = { o, from: cupMesh.position.clone(), to, t: 0 }; sfx('slide'); }
  function serve(o) { if (o.drink !== C.drink) { startReact(o, 'insulted', 0, null); o.pat = Math.max(8, o.pat - 10); CUPTO.to = pfAt(K.pourSpot, 0.035); return; }
    const avg = cupAvg(), pq = o.pat / o.patMax; let level = avg >= 90 ? 'delighted' : avg >= 80 ? 'happy' : avg >= 68 ? 'neutral' : avg >= 55 ? 'unhappy' : avg >= 40 ? 'upset' : 'insulted';
    if (level === 'insulted') { startReact(o, 'insulted', 0, null, true); return; }
    let stars = level === 'delighted' || level === 'happy' ? 3 : level === 'neutral' ? 2 : 1; if (pq < 0.25 && stars > 1) stars--; o.stars = stars; o.cupScore = avg;
    o.tip = level === 'delighted' ? Math.ceil(o.total * 0.5) + 2 : level === 'happy' ? Math.ceil(o.total * 0.3) + 1 : level === 'neutral' ? 1 : 0; o.st = 'pay';
    // the cup goes into their paw
    const cm = cupMesh; cupMesh = null; o.cup = cm; const P = o.f.userData.P; cm.position.set(0.12, 0.92, 0.38); cm.rotation.set(0, 0, 0); cm.scale.setScalar(1.6 / (o.f.scale.x || 1)); P.body.add(cm); o.f.userData.hold = { right: true };
    const order = orders.find(q => q.id === C.oid); if (order && order !== o) order.cupDone = false; o.cupDone = true; S.xp += 4 + Math.round(avg / 100 * 6); C = null; sfx('serve');
    const bill = Math.random() < 0.45 ? [5, 10, 20].find(b => b > o.total) : 0; startReact(o, level, stars, bill ? { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 } : { oid: o.id, total: o.total, exact: true }); }
  function startReact(o, level, stars, pay, binned) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; S.react = { o, level, stars, pay, binned, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: custName(o.ci), tip: o.tip || 0, score: o.cupScore || (C ? cupAvg() : 0) }; S.focus = 'serve';
    sfx(level === 'insulted' ? 'refuse' : level === 'unhappy' || level === 'upset' ? 'bad' : level === 'delighted' ? 'serve' : 'good'); if (level === 'delighted') { for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null;
    if (r.binned) { flash('KU-BAU BINS IT · MAKE IT AGAIN', '#ec3013', 1.8); const o = r.o, ord = orders.find(q => q.id === (C && C.oid)) || o; o.pat = Math.max(10, o.pat - 10); if (cupMesh) { scene.remove(cupMesh); cupMesh = null; } C = null; startCup(ord); return; }
    if (!r.pay) { CUPTO.to = pfAt(K.pourSpot, 0.035); return; }
    if (r.pay.exact) { const o = r.o; for (let i = 0; i < Math.min(6, o.total); i++) setTimeout(() => coinDrop(i < 3 ? 1 : 2), i * 90); S.payOut = { t: 0, o, exact: true }; payDone(r.pay); return; }
    S.pay = r.pay; payProps(r.pay); S.payOut = null; sfx('ching'); }
  const REG = V3(K.register.x, T, K.register.z - 0.32), RG = registerKit(ST, REG, { open: 'FOXY CREMA · OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; buzz(10); coinDrop(v); regDraw(P); if (P.given === P.owed) payDone(P); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; sfx('bad'); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone(P) { const o = orders.find(q => q.id === P.oid); if (!P.exact) { S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); } if (!o) return; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars); S.combo = o.stars === 3 ? S.combo + 1 : 0;
    if (DM.on) DM.served++; flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + pts + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : '') + (P.exact ? ' · EXACT' : ''), '#ffd23a', 1.8); tone(1046, 0.1, 0.05); setTimeout(() => tone(1568, 0.12, 0.05), 90); o.t = 0; const seat = !DM.on && Math.random() < 0.6 ? K.seats.find(q => !q.taken) : null; if (seat) { seat.taken = 'c' + o.id; o.seat = seat; o.st = 'toSeat'; o.spot = -1; o.sitT = rr(16, 28); } else o.st = 'leave'; }

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitV = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const onPlane = (x, y, h) => { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); const pl = new THREE.Plane(V3(0, 1, 0), -h); return ray.ray.intersectPlane(pl, hitV) ? hitV.clone() : null; };
  const toArt = (x, y) => { const c = artCenter(), p = onPlane(x, y, c.y); if (!p) return null; const r = cupMesh ? cupMesh.userData.r * 0.94 : 0.07; return { x: 100 + (p.x - c.x) / r * 42, y: 80 - (p.z - c.z) / r * 42 }; };
  const TARGETS = () => { const t = [], s = step(); if (!C) return t;
    if (s === 'grind') { t.push({ kind: 'pf', p: pf.position.clone(), r: 46 }); if (C.grams > 0) t.push({ kind: 'knock', p: V3(K.knock.x, T + 0.12, K.knock.z), r: 40 }); }
    if (s === 'lock') t.push({ kind: 'pf', p: pf.position.clone(), r: 70 }, { kind: 'group', p: V3(K.group.x, K.group.y - 0.05, K.group.z), r: 60 });
    if (s === 'syrup') t.push({ kind: 'pump', p: V3(K.pump.x, T + 0.3, K.pump.z), r: 52 });
    if (s === 'serve' && !slide) { t.push({ kind: 'cup', p: cupMesh.position.clone().setY(T + 0.08), r: 64 }); waiting().forEach(o => t.push({ kind: 'cust', o, p: V3(o.f.position.x, 1.45, o.f.position.z), r: 80 })); }
    return t; };
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * scale() && d < bd) { bd = d; best = t; } } return best; }
  const busyUI = () => S.phase !== 'shift' || !!S.pay || DM.on || !!S.react || !!slide;
  function onDown(e) { audioOn(); S.lastInput = performance.now(); if (busyUI() || !C) return; S.touched = true; const { x, y } = local(e), s = step(), t = pickAt(x, y); e.preventDefault(); S.ptr = { x, y, x0: x, y0: y, t0: performance.now(), hist: [{ x, y, t: performance.now() }] };
    if (s === 'grind') { if (t && t.kind === 'knock') { knockOut(); return; } if (t && t.kind === 'pf' && C.grams > 0.5) { S.stroke = { kind: 'tapPf' }; return; } if (upg('motor')) { S.hold = { kind: 'grind' }; holdSound('grind'); return; } S.stroke = { kind: 'crank', px: x, py: y, dir: null }; return; }
    if (s === 'tamp') { S.hold = { kind: 'tamp', off: 0 }; const c = scr(pf.position), e2 = scr(pf.position.clone().add(V3(0.06, 0, 0))); S.hold.cx = c.x; S.hold.R = Math.max(18, Math.abs(e2.x - c.x)) * 1.6; tampMove((x - S.hold.cx) / S.hold.R); holdSound('tamp'); return; }
    if (s === 'lock') { drag = { kind: 'pf', x0: x, y0: y }; return; }
    if (s === 'syrup') { if (t && t.kind === 'pump') { pumpOnce(); return; } if (C.pumps > 0) { pullStart(); S.ptr.pull = true; } else flash('TAP THE SYRUP PUMP FIRST', '#ffd23a', 1); return; }
    if (s === 'pull') { pullStart(); return; }
    if (s === 'steam') { if (steamStart()) { S.hold.y0 = y; S.hold.d0 = C.depth; } return; }
    if (s === 'art') { const a = toArt(x, y); if (a) artDown(a.x, a.y); return; }
    if (s === 'honey') { const a = toArt(x, y); if (a && Math.hypot(a.x - 100, a.y - 80) < 60) honeyPt(a.x, a.y, true); return; }
    if (s === 'serve') { if (t && t.kind === 'cust') { slideTo(t.o); return; } if (t && t.kind === 'cup') drag = { kind: 'cup', x0: x, y0: y }; return; } }
  const P0x = () => S.ptr ? S.ptr.x0 : 0, P0y = () => S.ptr ? S.ptr.y0 : 0;
  function onMove(e) { if (!S.ptr) return; const { x, y } = local(e); S.ptr.x = x; S.ptr.y = y; S.ptr.hist.push({ x, y, t: performance.now() }); if (S.ptr.hist.length > 8) S.ptr.hist.shift(); if (!C) return; const s = step();
    if (S.stroke && S.stroke.kind === 'tapPf' && Math.hypot(x - P0x(), y - P0y()) > 14) S.stroke = { kind: 'crank', px: x, py: y, dir: null };
    if (S.stroke && S.stroke.kind === 'crank') { const k = S.stroke, mx = x - k.px, my = y - k.py; if (Math.hypot(mx, my) < 7) return; const a = Math.atan2(my, mx); k.px = x; k.py = y; if (k.dir != null) { let d = a - k.dir; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; if (Math.abs(d) < 1.6) { if (d > 0) grindTurn(d); else if (d < -0.05) S.backT = 0.6; } } k.dir = a; return; }
    if (S.hold && S.hold.kind === 'tamp') { tampMove((x - S.hold.cx) / S.hold.R); return; }
    if (S.hold && S.hold.kind === 'steam') { C.depth = clamp(S.hold.d0 + (S.hold.y0 - y) / (150 * scale()), 0, 1); return; }
    if (drag) { const p = onPlane(x, y, T + 0.12); if (p) { if (drag.kind === 'pf') { PF.to = null; pf.position.set(clamp(p.x, K.group.x - 0.1, K.tampMat.x + 0.3), T + 0.16, clamp(p.z, KZ - 0.5, KZ + 0.1)); } else { CUPTO.to = null; cupMesh.position.set(clamp(p.x, -3.3, 3.3), T + 0.06, clamp(p.z, KZ - 0.4, K.pass.z)); } } return; }
    if (s === 'art') { const a = toArt(x, y); if (a) artMove(a.x, a.y); return; }
    if (s === 'honey') { const a = toArt(x, y); if (a) honeyPt(a.x, a.y, false); } }
  function onUp(e) { const P0 = S.ptr; S.ptr = null; if (!P0 || !C) { if (S.hold) S.hold = null; return; } const s = step(), { x, y } = P0, tap = Math.hypot(x - P0.x0, y - P0.y0) < 14;
    if (S.stroke) { const k = S.stroke.kind; S.stroke = null; if (k === 'tapPf' && tap) grindDone(); return; }
    if (S.hold) { const k = S.hold.kind; if (k === 'grind') { S.hold = null; holdStop(); } else if (k === 'tamp') tampDone(); else if (k === 'pull') pullDone(); else if (k === 'steam') steamStop(); return; }
    if (drag) { const d = drag; drag = null; if (d.kind === 'pf') { const g = scr(V3(K.group.x, K.group.y - 0.05, K.group.z)); if (tap || Math.hypot(x - g.x, y - g.y) < 110 * scale() || pf.position.x < K.group.x + 0.35) lockIn(); else PF.to = pfAt(K.tampMat, 0.03); return; }
      if (d.kind === 'cup') { const h = P0.hist, a = h[0], b = h[h.length - 1], dt = Math.max(1, b.t - a.t), vx = (b.x - a.x) / dt * 1000, vy = (b.y - a.y) / dt * 1000; let tgt = pickAt(x, y, ['cust']);
        if (!tgt && (vy < -350 || y < scr(V3(0, T, K.pass.z)).y)) { const px = x + vx * 0.25; let bd = 1e9; waiting().forEach(o => { const sp = scr(V3(o.f.position.x, 1.2, o.f.position.z)); const dd = Math.abs(sp.x - px); if (dd < bd) { bd = dd; tgt = { o }; } }); }
        if (tgt) slideTo(tgt.o); else CUPTO.to = pfAt(K.pourSpot, 0.035); return; } }
    if (s === 'art') { artUp(); return; } if (s === 'honey') { honeyUp(); return; } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- NEXT-STEP HINT ----------
  const RINGS = hintRings(ST);
  function nextHint() { if (S.phase !== 'shift' || S.pay || S.react) return null; const H = (p, station, text, r = 0.16) => ({ p, station, text, r });
    if (!C) return waiting().length ? null : H(V3(K.door.x, 0.02, K.door.z - 1.2), 'all', 'WAITING FOR A CUSTOMER', 0.5);
    const s = step(), who = custName(C.ci), sp = C.spec;
    if (s === 'grind') { if (C.grams > sp.dose + 1.5) return H(V3(K.knock.x, T, K.knock.z), 'grind', 'TOO MUCH · TAP THE BASKET ANYWAY, OR THE KNOCK BOX TO START AGAIN', 0.15); if (C.grams >= sp.dose - 1) return H(pf.position.clone().setY(T), 'grind', 'ON THE DOT · TAP THE BASKET TO TAMP', 0.14); return H(V3(K.crankHub.x, T + 0.62, K.crankHub.z), 'grind', upg('motor') ? 'HOLD TO GRIND · ' + sp.dose + ' g' : 'DRAW CIRCLES ↻ CLOCKWISE TO TURN THE CRANK · ' + sp.dose + ' g', 0.2); }
    if (s === 'tamp') return H(pf.position.clone().setY(T), 'tamp', 'PRESS + HOLD · KEEP CENTRED · LET GO IN THE GREEN', 0.14);
    if (s === 'lock') return H(V3(K.drip.x, T, K.drip.z), 'brew', 'DRAG THE BASKET INTO THE MACHINE', 0.16);
    if (s === 'syrup') return H(V3(K.pump.x, T, K.pump.z), 'brew', 'TAP THE DATE SYRUP PUMP · ' + C.pumps + ' / ' + sp.syrup + ' · THEN THE LEVER', 0.13);
    if (s === 'pull') return H(V3(K.drip.x, T, K.drip.z), 'brew', 'HOLD THE LEVER DOWN · LET GO AT ' + SHOTS[sp.shot].name, 0.15);
    if (s === 'steam') return H(V3(K.wand.x, T, K.wand.z), 'milk', 'HOLD + SLIDE · DOWN = FOAM · UP = HEAT', 0.16);
    if (s === 'art') return H(artCenter().setY(T + 0.02), 'art', sp.art === 'heart' ? 'HOLD IN THE MIDDLE, THEN DRAW DOWN THROUGH IT' : 'START AT THE FAR RIM · WIGGLE AS YOU DRAW BACK · ' + sp.lobes + ' LEAVES', 0.12);
    if (s === 'honey') return H(artCenter().setY(T + 0.02), 'art', 'ZIG-ZAG THE HONEY ACROSS THE CUP', 0.12);
    if (s === 'serve') { const o = orders.find(q => q.id === C.oid && q.st === 'wait'); return H(o ? V3(o.f.position.x, 0.02, o.f.position.z) : V3(K.pourSpot.x, T, K.pourSpot.z), 'serve', 'SLIDE THE CUP ACROSS THE BAR TO ' + (o ? custName(o.ci) : who), o ? 0.45 : 0.15); }
    return null; }
  let HINT = null, hintT = 0;
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === HINT.station) return; if (drag || S.hold || S.stroke || S.react || S.pay) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 0.9 && performance.now() - (S.userFocusT || 0) > 2500) S.focus = HINT.station; }
  function setFocus(id) { if (!FOCUS[id] || S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }

  // ---------- DEMO: an autopilot plays a real shift with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, day0: 1, act: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 20; scene.add(hand);
  const handTo = p => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.4); DM.hint = { p: p.clone().setY(Math.max(T, p.y - 0.15)), r: 0.14 }; };
  const cap = (id, key, text) => { DM.key = key; if (DM.seen[id]) { DM.cap = text.split('. ')[0].split(':')[0]; return false; } DM.seen[id] = true; DM.cap = text; return true; };
  function demoAct(dt) { // returns true while busy with a continuous action
    const A = DM.act; if (A) { A.t += dt; return A.run(dt, A) !== false; }
    if (S.pay) { const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); DM.cap = 'THEY PAID ' + P.paid + 'g FOR ' + P.total + 'g · TAP COINS TO GIVE ' + P.owed + 'g CHANGE'; DM.key = v + 'g'; giveCoin(v); DM.cd = 0.8; return false; }
    if (!C) return false; const s = step(), sp = C.spec;
    if (s === 'grind') { if (C.grams < sp.dose - 0.3) { cap('grind', 'CIRCLE', 'DRAW CIRCLES ON THE GRINDER CRANK. ABOUT 3 g A TURN · THE TICKET WANTS ' + sp.dose + ' g'); DM.act = { t: 0, run: (d) => { grindTurn(d * 7); const a = performance.now() / 140; handTo(V3(K.crankHub.x + Math.cos(a) * 0.15, T + 0.75, K.crankHub.z + Math.sin(a) * 0.15)); if (C.grams >= sp.dose - 0.2) { DM.act = null; DM.cd = 0.5; return false; } } }; return true; }
      cap('dose', 'TAP', 'ON THE DOT. TAP THE BASKET TO TAKE IT TO THE TAMP'); handTo(pf.position.clone().setY(T + 0.1)); grindDone(); DM.cd = 0.9; return false; }
    if (s === 'tamp') { cap('tamp', 'HOLD', 'PRESS AND HOLD THE BASKET. KEEP YOUR FINGER IN THE MIDDLE. LET GO IN THE GREEN'); S.hold = { kind: 'tamp', off: 0 }; DM.act = { t: 0, run: () => { tampMove(Math.sin(performance.now() / 300) * 0.08); handTo(pf.position.clone().setY(T + 0.15)); if (C.press >= 64) { DM.act = null; tampDone(); DM.cd = 0.8; return false; } } }; return true; }
    if (s === 'lock') { cap('lock', 'DRAG', 'DRAG THE BASKET INTO THE MACHINE'); const from = pf.position.clone(), to = V3(K.group.x, T + 0.16, K.group.z); PF.to = null; DM.act = { t: 0, run: (d, a) => { const k = Math.min(1, a.t / 0.8); pf.position.lerpVectors(from, to, smooth(0, 1, k)); handTo(pf.position.clone().setY(T + 0.2)); if (k >= 1) { DM.act = null; lockIn(); DM.cd = 0.7; return false; } } }; return true; }
    if (s === 'syrup') { cap('syrup', 'TAP', 'THE TICKET SAYS DATE SYRUP ×' + sp.syrup + '. TAP THE PUMP'); handTo(V3(K.pump.x, T + 0.32, K.pump.z)); pumpOnce(); if (C.pumps >= sp.syrup) syrupDone(); DM.cd = 0.5; return false; }
    if (s === 'pull') { const [lo, hi] = shotBand(sp.shot); cap('pull', 'HOLD', 'HOLD THE LEVER DOWN. THE SHOT RUNS. LET GO IN THE ' + SHOTS[sp.shot].name + ' BAND'); pullStart(); DM.act = { t: 0, run: () => { handTo(K.leverTip()); if (C.shot >= (lo + hi) / 2) { DM.act = null; pullDone(); DM.cd = 1.0; return false; } } }; return true; }
    if (s === 'steam') { const fb = MILK[sp.milk].foam, tb = tempBand(); cap('steam', 'SLIDE', 'HOLD AND SLIDE: DOWN = FOAM, UP = HEAT. LET GO WHEN BOTH METERS ARE GREEN'); steamStart(); DM.act = { t: 0, run: () => { const fIn = C.foam >= (fb[0] + fb[1]) / 2 - 2; C.depth = damp(C.depth, fIn ? 0.95 : 0.05, 6, 1 / 30); handTo(V3(K.wand.x, T + 0.1, K.wand.z)); if (fIn && C.temp >= (tb[0] + tb[1]) / 2) { DM.act = null; steamStop(); DM.cd = 1.0; return false; } } }; return true; }
    if (s === 'art') { if (sp.art === 'heart') { cap('heart', 'HOLD', 'CAPPUCCINO HEART: HOLD THE POUR IN THE MIDDLE, THEN DRAW DOWN THROUGH IT'); artDown(100, 76); DM.act = { t: 0, run: (d, a) => { const c = artCenter(); if (a.t < 1.5) { handTo(c.clone().setY(c.y + 0.05)); return; } const k = Math.min(1, (a.t - 1.5) / 0.5); artMove(100, 76 + k * 34); handTo(V3(c.x, c.y + 0.05, c.z - k * 0.06)); if (k >= 1) { DM.act = null; artUp(); DM.cd = 1.0; return false; } } }; return true; }
      cap('art', 'WIGGLE', 'ROSETTA: START AT THE FAR RIM, WIGGLE SIDE TO SIDE AS YOU DRAW THE JUG BACK'); artDown(100, 46); DM.act = { t: 0, run: (d, a) => { const k = Math.min(1, a.t / 3.2), y = 46 + k * 66, x = 100 + Math.sin(a.t * 14) * (6 + k * 10); if (C.art.on) artMove(x, y); const c = artCenter(); handTo(V3(c.x + (x - 100) / 42 * 0.07, c.y + 0.05, c.z - (y - 80) / 42 * 0.07)); if (step() !== 'art') { DM.act = null; DM.cd = 1.0; return false; } if (k >= 1) { DM.act = null; artUp(); DM.cd = 1.0; return false; } } }; return true; }
    if (s === 'honey') { cap('honey', 'ZIG-ZAG', 'UR HONEY: ZIG-ZAG THE HONEY ACROSS THE CUP'); honeyPt(70, 50, true); DM.act = { t: 0, run: (d, a) => { const k = Math.min(1, a.t / 2), y = 50 + k * 60, x = 100 + (Math.floor(a.t * 3.2) % 2 ? 26 : -26) * Math.min(1, (a.t * 3.2 % 1) * 3); honeyPt(x, y, false); if (k >= 1) { DM.act = null; honeyUp(); DM.cd = 1.0; return false; } } }; return true; }
    if (s === 'serve') { const o = orders.find(q => q.id === C.oid && q.st === 'wait') || waiting()[0]; if (!o) return false; cap('serve', 'SLIDE', 'SLIDE THE CUP ACROSS THE BAR TO ' + custName(o.ci)); handTo(V3(o.f.position.x, T + 0.1, K.pass.z)); slideTo(o); DM.cd = 1.2; return false; }
    return false; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.6)); if (S.phase !== 'shift' || S.react || S.payOut || slide) return; if (DM.act) { demoAct(dt); return; } DM.cd -= dt; if (DM.cd > 0) return; DM.cd = 0.4; demoAct(dt);
    if (DM.served >= 2 || S.t > 150) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; audioOn(); DM.on = true; DM.seen = {}; DM.served = 0; DM.act = null; DM.cd = 2.2; DM.day0 = S.day; S.day = Math.max(S.day, 2); DM.cap = 'WATCH A SHIFT AT FOXY CREMA'; DM.key = ''; S.phase = 'intro'; S.done = null; S.demo = true; startShift(); S.next = 0.6; S.demoOrders = ['espresso', 'cappuccino']; }
  function demoStop() { if (!DM.on) return; S.payOut = null; payProps(null); DM.on = false; S.demo = false; DM.act = null; hand.visible = false; S.day = DM.day0; S.pay = null; clearAll(); toIntro(); }

  // ---------- shift flow ----------
  function clearAll() { S.hold = null; S.stroke = null; holdStop(); drag = null; slide = null; S.react = null; S.pay = null; payProps(null); DM.act = null;
    K.seats.forEach(q => { if (q.taken && q.taken[0] === 'c') q.taken = null; }); orders.forEach(o => { o.f.visible = false; o.f.userData.hold = null; o.f.position.y = 0; if (o.cup) { o.cup.parent && o.cup.parent.remove(o.cup); o.cup = null; } }); orders.length = 0; C = null; if (cupMesh) { scene.remove(cupMesh); cupMesh = null; }
    [shotStream, shotStream2, milkStream, honeyStream, grindStream].forEach(m => m.visible = false); tamper.visible = false; PF.locked = false; pf.position.copy(pfAt(K.chute, -0.02)); PF.to = null; grounds.scale.y = 0.001; mound.scale.y = 0.01; resetJug(); K.lever.rotation.x = 0.12; drawArt(); }
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done') return; S.payOut = null; if (!S.demo && DM.on) demoStop(); audioOn(); clearAll(); dismissPatrons(); CA.start('shift'); Object.assign(S, { phase: 'glide', mode: 'shift', t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2.5, done: null, pay: null, combo: 0, xp: 0, tipSeen: {} });
    S.focus = 'all'; ben.visible = false; benW.visible = false; kubau.position.set(-3.6, 0, KZ - 1.4); kubau.rotation.y = 0.5; glideTo(workShot('all'), 1.6); say('KU-BAU: “' + KUBAU.work[2] + '”', 6); S.glideT = 1.65; }
  function endShift() { S.phase = 'done'; S.hold = null; holdStop(); CA.meter(null); sfx('sting'); const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 3 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = [];
    try { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.cups, save.stat(SAVE.cups, 0) + S.served); if (S.xp) save.addXp(S.xp); if (S.served >= 2 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...DRINKS.filter(r => r.day === nd).map(r => r.name), ...(SYRUP.day === nd ? [SYRUP.name + ' (+1g)'] : [])]; }
      if (!save.flag(SAVE.uniform) && S.served >= 3) { save.setFlag(SAVE.uniform); unlock.push('CREMA UNIFORM (cap, towel + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold, xp: S.xp, cups: save.stat(SAVE.cups, 0) };
    if (newDay) S.day += 1; clearAll(); placeGreeter(); glideTo(wideShot(), 1.4);
    say(eod ? 'KU-BAU: “EMPLOYEE OF THE DAY. Do not let it go to your head, it is a small town.”' : S.served >= 3 ? 'KU-BAU: “Good shift. Same machine tomorrow.”' : 'KU-BAU: “The machine won that one. Tomorrow you win.”', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); tone(1320, 0.1, 0.05); if (S.done) S.done.gold = save.data.gold; return true; }
  function placeGreeter() { setUniform(!!save.flag(SAVE.uniform) || true); ben.visible = true; benW.visible = false; ben.position.set(-0.7, 0, KZ + 1.6); ben.rotation.y = 0.3; kubau.position.copy(K.keeperSpot); kubau.rotation.y = 0; }
  function toIntro() { S.phase = 'intro'; S.mode = 'shift'; S.done = null; clearAll(); placeGreeter(); glideTo(wideShot(), 1); }
  function fadeTo(fn) { S.fadeDir = 1; S.fadeFn = fn; }
  function toWalk() { if (LEAVE.fn) { LEAVE.fn(); return; } fadeTo(() => { S.phase = 'walk'; S.mode = 'walk'; S.done = null; clearAll(); ben.visible = false; benW.visible = true; benW.position.set(K.talkSpot.x - 0.4, 0, K.talkSpot.z + 0.5); benW.rotation.y = Math.PI; W.sit = null; kubau.position.copy(K.keeperSpot); kubau.rotation.y = 0; W.camInit = true; seatPatrons(); CA.start('walk'); }); }
  function hireAndWork() { try { save.setFlag(SAVE.hired); } catch (e) {} fadeTo(() => { W.sit = null; toIntro(); camera.position.copy(wideShot().pos); CAM.look.copy(wideShot().look); CAM.t = 1; }); }

  // ---------- WALK MODE: the café as an interior Ben can walk around ----------
  const W = { stick: { x: 0, y: 0 }, keys: new Set(), sit: null, wave: 0, D: null, toast: '', toastT: 0, camInit: true, look: 0, kuWave: 0, chatT: 0, chatWho: 0 };
  const KU_SPOT = () => V3(kubau.position.x, 0, KZ + 0.6);
  function talkTarget() { if (W.sit && !W.sit.taken) { /* sitting: can still talk to a neighbour */ } const p = benW.position, out = [];
    out.push({ key: 'kubau', d: Math.hypot(p.x - K.talkSpot.x, p.z - (KZ + 0.75)), max: 2.2, label: 'Talk to Ku-bau' });
    regulars.forEach(r => out.push({ key: r.key, d: Math.hypot(p.x - r.f.position.x, p.z - r.f.position.z), max: 1.6, label: 'Talk to ' + TABLE_TALK[r.key].name }));
    const best = out.filter(o => o.d < o.max).sort((a, b) => a.d - b.d)[0]; return best || null; }
  function openTalk(key) { if (key === 'kubau') { const hired = save.flag(SAVE.hired); kubau.userData.talking = true;
      const menu = hired ? [{ text: 'Another cup?', lines: KUBAU.again, then: 'work' }, { text: 'How do I make coffee?', lines: KUBAU.how }, { text: 'How did you get into the coffee business?', lines: KUBAU.story }, { text: 'Not just now.', lines: KUBAU.later, then: 'bye', bye: true }]
        : [{ text: 'THAT WILL KEEP ME BUSY! Put me to work.', lines: KUBAU.work, then: 'work' }, { text: 'How do I make coffee?', lines: KUBAU.how }, { text: 'How did you get into the coffee business?', lines: KUBAU.story }];
      W.D = { key, name: 'Ku-bau', role: 'The Coffee', lines: [['npc', hired ? KUBAU.back : KUBAU.hello]], i: 0, menu, showMenu: false }; }
    else { const tt = TABLE_TALK[key], r = regulars.find(q => q.key === key); r.f.userData.talking = true; r.f.userData.lookAt = benW.position.clone().setY(1.5); W.D = { key, name: tt.name, role: tt.role, lines: tt.lines, i: 0, menu: null }; }
    tone(1046, 0.06, 0.03); }
  function closeTalk() { if (!W.D) return; const k = W.D.key; W.D = null; kubau.userData.talking = false; regulars.forEach(r => { r.f.userData.talking = false; }); if (k === 'work') return; }
  function dlgNext() { const D = W.D; if (!D) return; if (D.showMenu) return; D.i++; if (D.i < D.lines.length) { tone(880, 0.04, 0.02); return; }
    if (D.then === 'work') { closeTalk(); hireAndWork(); return; } if (D.then === 'bye' || !D.menu) { closeTalk(); return; } D.showMenu = true; D.lines = [['npc', D.lines[D.lines.length - 1][1]]]; D.i = 0; }
  function dlgChoose(i) { const D = W.D; if (!D || !D.menu || !D.showMenu) return; const c = D.menu[i]; if (!c) return; c.asked = true; D.showMenu = false; D.lines = c.lines.map(t => ['npc', t]); D.i = 0; D.then = c.then || null; tone(990, 0.05, 0.03); }
  function dlgHud() { const D = W.D; if (!D) return null; const ln = D.lines[Math.min(D.i, D.lines.length - 1)], isP = ln[0] === 'player';
    if (D.showMenu) return { name: D.name, role: D.role, text: ln[1], choices: D.menu.map(c => ({ text: c.text, asked: !!c.asked && !c.then, bye: !!c.bye })), step: 1, total: 1 };
    return { name: isP ? 'Ben' : D.name, role: isP ? '' : D.role, text: ln[1], step: D.i + 1, total: D.lines.length, more: !!D.menu }; }
  function sitToggle() { if (S.phase !== 'walk' || W.D) return; if (W.sit) { standUp(); return; } const p = benW.position; let best = null, bd = 1.35; for (const s of K.seats) { if (s.taken) continue; const d = Math.hypot(s.x - p.x, s.z - p.z); if (d < bd) { bd = d; best = s; } }
    if (!best) { W.toast = 'NO FREE CHAIR HERE · WALK UP TO ONE'; W.toastT = 1.6; return; } W.sit = best; benW.position.set(best.x - Math.sin(best.ry) * 0.06, 0, best.z - Math.cos(best.ry) * 0.06); benW.rotation.y = best.ry; tone(330, 0.08, 0.03); }
  function standUp() { const s = W.sit; if (!s) return; W.sit = null; benW.position.set(s.x + Math.sin(s.ry) * 0.7, 0, s.z + Math.cos(s.ry) * 0.7); }
  function wave() { if (S.phase !== 'walk' || W.D) return; W.wave = 1.6; const p = benW.position; if (kubau.position.distanceTo(p) < 7) W.kuWave = 1.6; regulars.forEach(r => { if (r.f.position.distanceTo(p) < 6) { r.f.userData.lookAt = p.clone().setY(1.5); r.f.userData.mood = 'excited'; r.waveT = 1.6; } }); tone(784, 0.08, 0.03, 'triangle'); setTimeout(() => tone(988, 0.1, 0.03, 'triangle'), 90); }
  function hop() { if (S.phase !== 'walk' || W.D || W.sit) return; if (benW.userData.hop <= 0) { benW.userData.hop = 1; tone(520, 0.08, 0.03, 'triangle', 1.5); } }
  function collide(p) { const B = K.walkBox; for (const c of K.colliders) { if (c.type === 'circle') { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), r = c.r + 0.3; if (d < r && d > 1e-4) { p.x = c.x + dx / d * r; p.z = c.z + dz / d * r; } } }
    p.x = clamp(p.x, B.x0, B.x1); p.z = Math.max(p.z, B.z0); const inDoor = Math.abs(p.x - K.door.x) < K.door.w / 2 - 0.3; if (p.z > B.z1 && !inDoor) p.z = B.z1; if (inDoor) p.z = Math.min(p.z, K.door.z + 0.7); }
  function walkStep(dt) { const k = W.keys; let sx = W.stick.x, sy = W.stick.y; if (k.has('KeyA') || k.has('ArrowLeft')) sx = -1; if (k.has('KeyD') || k.has('ArrowRight')) sx = 1; if (k.has('KeyW') || k.has('ArrowUp')) sy = 1; if (k.has('KeyS') || k.has('ArrowDown')) sy = -1;
    const mag = Math.min(1, Math.hypot(sx, sy)); let speed = 0; if (W.D) { sx = sy = 0; }
    if (W.sit && Math.hypot(sx, sy) > 0.5) standUp();
    if (!W.sit && Math.hypot(sx, sy) > 0.12) { const dir = V3(sx, 0, -sy).normalize(); speed = 3.4 * mag; benW.position.addScaledVector(dir, speed * dt); let da = Math.atan2(dir.x, dir.z) - benW.rotation.y; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2; benW.rotation.y += da * Math.min(1, dt * 12); W.stepT = (W.stepT || 0) - dt * speed; if (W.stepT < 0) { W.stepT = 0.75; sfx('step'); } }
    collide(benW.position);
    if (benW.position.z > K.door.z + 0.25) { if (onExit) { onExit(); benW.position.z = K.door.z - 0.6; } else { benW.position.z = K.door.z - 0.9; benW.rotation.y = Math.PI; W.toast = 'THE DOOR OUT TO UR TOWN SQUARE · IN THE WORLD MAP THIS TAKES YOU OUTSIDE'; W.toastT = 3; } }
    kit.animFox(benW, dt, speed, benW.userData.hop > 0); if (W.sit) { sitPose(benW, true); benW.position.y = W.sit.y - 0.5; } else benW.position.y = 0;
    if (W.wave > 0) { W.wave -= dt; BW.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32); }
    // Ku-bau watches you when you are close, waves back
    const near = kubau.position.distanceTo(benW.position) < 5.5; kubau.userData.lookAt = near ? benW.position.clone().setY(1.4) : null; kubau.userData.mood = W.kuWave > 0 ? 'excited' : 'warm';
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
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false, HIDDEN = false; const LEAVE = { fn: onLeave };
  const lerpCam = (sh, k) => { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); };
  function tick(dt) {
    if (S.fadeDir) { S.fade = clamp(S.fade + S.fadeDir * dt * 4, 0, 1); if (S.fade >= 1 && S.fadeDir > 0) { const f = S.fadeFn; S.fadeFn = null; S.fadeDir = -1; f && f(); } else if (S.fade <= 0 && S.fadeDir < 0) S.fadeDir = 0; }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.12 + (1 - p.life) * 0.25); }
    lampGl.forEach((s, i) => s.material.opacity = 0.45 + Math.sin(clock.elapsedTime * 2 + i) * 0.04);
    musicStep(); blobStep(); wispStep(dt); bubbleStep(clock.elapsedTime); beams.forEach((m, i) => { m.material.opacity = 0.13 + Math.sin(clock.elapsedTime * 0.4 + i) * 0.025; });
    if (W.kuWave > 0) { W.kuWave -= dt; }
    regularsStep(dt);
    if (S.phase === 'walk') { K.front.forEach(m => m.visible = false); K.cut.forEach(m => m.visible = false); walkStep(dt); patronsStep(dt); if (!W.greeted && kubau.position.distanceTo(benW.position) < 4.5) { W.greeted = true; W.kuWave = 2.2; tone(659, 0.08, 0.03, 'triangle'); setTimeout(() => tone(880, 0.1, 0.03, 'triangle'), 110); } kit.animFox(kubau, dt, 0); if (W.kuWave > 0) kubau.userData.P.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32); camera.lookAt(CAM.look); return; }
    // ---- job phases ----
    const work = S.phase === 'shift';
    if (S.react) { S.react.t += dt; const o = S.react.o, f = o.f.position, sh = shotFor('react' + o.spot, () => [V3(f.x - 0.85, 0.9, f.z), V3(f.x + 0.85, 0.9, f.z), V3(f.x, 2.55, f.z), V3(f.x, T, K.pass.z)], 0.42, 0, 0.1); lerpCam(sh, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.0 : 2.4)) reactDone(); }
    else if (S.pay || (S.payOut && !S.payOut.exact)) { const sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.0, 0, 0.07); lerpCam(sh, Math.min(1, dt * 5)); regDisp.scale.set(port() ? 0.36 : 0.46, port() ? 0.133 : 0.17, 1); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (work || S.phase === 'glide') { const forced = step() === 'art' || step() === 'honey' ? 'art' : null; lerpCam(workShot(forced || S.focus), Math.min(1, dt * (forced ? 4.5 : 3.2))); }
    { const wide = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !wide); K.cut.forEach(m => m.visible = wide && false); }
    K.back.visible = camera.position.z > KZ - 3.1;
    camera.lookAt(CAM.look);
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { S.phase = 'shift'; S.next = S.demo ? 0.4 : 1.2; flash('DOORS OPEN!', '#22c55e', 1.4); } }
    if (work) { S.t += dt; if (S.t >= CREMA.shift && !DM.on) endShift(); }
    if (work && C) stepCup(dt);
    { const h = work && C && S.hold, s0 = step(); if (h && s0 === 'tamp') CA.meter(C.press / 100, C.press >= 52 && C.press <= 78); else if (h && s0 === 'pull' && K.lever.rotation.x < -1.2) { const [lo, hi] = shotBand(C.spec.shot); CA.meter(C.shot / 100, C.shot >= lo && C.shot <= hi); } else if (h && s0 === 'steam') { const tb = tempBand(), fb = MILK[C.spec.milk].foam; CA.meter(C.temp / 100, C.temp >= tb[0] && C.temp <= tb[1] && C.foam >= fb[0] && C.foam <= fb[1]); } else CA.meter(null); }
    stepProps(dt);
    if (DM.on) demoStep(dt);
    hintT += dt; HINT = DM.on ? (DM.hint && DM.act ? DM.hint : DM.hint) : nextHint(); RINGS.place(HINT && !S.react && S.phase === 'shift' && step() !== 'art' && step() !== 'honey' ? HINT : null, hintT, dt); if (work) autoFollow();
    regDisp.visible = !!(S.pay || (S.payOut && !S.payOut.exact)); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; sfx('coin'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o && !S.payOut.exact) { const to = V3(o.f.position.x, K.pass.y + 0.03, K.pass.z); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > (S.payOut.exact ? 1.4 : 1.1)) { S.payOut = null; payProps(null); } }
    // customers: walk in from the door, wait, leave with their cup
    if (work) { S.next -= dt; const maxQ = Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st === 'walk' || o.st === 'wait' || o.st === 'pay').length < maxQ && S.t < CREMA.shift - 15) { newOrder(); S.next = Math.max(16, 30 - S.day * 2) * rr(0.8, 1.2); } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i], sp = K.spots[o.spot]; o.t += dt; let spd = 0;
      if (o.st === 'walk') { const d = V3(sp.x - o.f.position.x, 0, sp.z - o.f.position.z), L = d.length(); if (L < 0.06) { o.st = 'wait'; o.f.rotation.y = Math.PI; say(custName(o.ci) + ': “' + o.line + '”', 3); tone(1046, 0.06, 0.03); } else { spd = 1.7; o.f.position.addScaledVector(d.normalize(), Math.min(L, spd * dt)); o.f.rotation.y = Math.atan2(d.x, d.z); } }
      else if (o.st === 'wait' && work) { o.pat -= DM.on ? 0 : dt; const r = o.pat / o.patMax; if (!S.react || S.react.o !== o) o.f.userData.mood = r < 0.3 ? 'stern' : r < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; o.t = 0; S.lost++; S.combo = 0; flash(custName(o.ci) + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); tone(180, 0.3, 0.05, 'sawtooth'); if (C && C.oid === o.id) { const alt = waiting().find(q => q.drink === C.drink && !q.cupDone); if (alt) { C.oid = alt.id; C.ci = alt.ci; } else { say('KU-BAU: “I will drink that one.”', 3); if (cupMesh) { scene.remove(cupMesh); cupMesh = null; } C = null; } } } }
      else if (o.st === 'toSeat') { const st = o.seat, tx = st.x + Math.sin(st.ry) * 0.8, tz = st.z + Math.cos(st.ry) * 0.8, d = V3(tx - o.f.position.x, 0, tz - o.f.position.z), L = d.length(); if (L < 0.08 || o.t > 8) { o.st = 'sit'; o.t = 0; o.f.position.set(st.x, st.y - 0.5, st.z); o.f.rotation.y = st.ry; } else { spd = 1.6; o.f.position.addScaledVector(d.normalize(), Math.min(L, spd * dt)); o.f.rotation.y = Math.atan2(d.x, d.z); } }
      else if (o.st === 'sit') { if (o.t > o.sitT || !work) { o.st = 'leave'; o.t = 0; o.seat.taken = null; o.f.position.set(o.seat.x + Math.sin(o.seat.ry) * 0.8, 0, o.seat.z + Math.cos(o.seat.ry) * 0.8); } }
      else if (o.st === 'leave') { const d = V3(K.door.x - o.f.position.x, 0, K.door.z + 0.6 - o.f.position.z), L = d.length(); spd = 1.9; if (L > 0.1) { o.f.position.addScaledVector(d.normalize(), Math.min(L, spd * dt)); o.f.rotation.y = Math.atan2(d.x, d.z); } if (L < 0.4 || o.t > 9) { o.f.visible = false; o.f.userData.hold = null; o.f.position.y = 0; if (o.cup) { o.cup.parent && o.cup.parent.remove(o.cup); o.cup = null; } orders.splice(i, 1); } }
      kit.animFox(o.f, dt, spd); if (o.st === 'sit') { sitPose(o.f, true); o.f.userData.P.arms[1].rotation.x = -0.9 + Math.sin(o.t * 0.8) * 0.15; } }
    // start the next cup when the bar is free
    if (work && !C && !S.react && !slide && !DM.act && !S.pay && !S.payOut) { const o = nextOrderToMake(); if (o) { startCup(o); flash('TICKET UP · ' + custName(o.ci) + ' · ' + DR(o.drink).name, '#ffd23a', 1.4); } }
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox(ben, dt, 0); kit.animFox(kubau, dt, 0);
    if (greet && BP.arms && BP.arms[0]) { const w = performance.now() / 1000; BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(w * 7) * 0.32); }
    if (work) { kubau.userData.lookAt = cupMesh ? cupMesh.position : null; }
  }
  // the cup in progress: holds, meters, streams
  function stepCup(dt) { const s = step();
    if (S.hold && S.hold.kind === 'grind' && s === 'grind') { const g0 = Math.floor(C.grams); C.grams = clamp(C.grams + dt * 5, 0, 34); if (Math.floor(C.grams) > g0) sfx(Math.floor(C.grams) === C.spec.dose ? 'ding' : 'tick'); K.crank.rotation.y -= dt * 18; S.grindT = 0.1; }
    if (S.backT > 0) S.backT -= dt; if (S.grindT > 0) { S.grindT -= dt; holdSound('grind'); } else if (SND.kind === 'grind' && !(S.hold && S.hold.kind === 'grind')) holdStop();
    if (s === 'tamp' && S.hold) C.press = Math.min(100, C.press + dt * 34);
    if (s === 'pull' && S.hold) { const lv = K.lever.rotation.x; if (lv < -1.2) { C.shot = Math.min(100, C.shot + dt * 11); if (C.shot >= 100) pullDone(); } }
    if (s === 'steam' && S.hold) { if (SND.node && SND.kind === 'steam') SND.node.set({ depth: C.depth }); const sh = clamp(1 - C.depth * 1.7, 0, 1); C.temp = Math.min(100, C.temp + dt * (7 + (1 - sh) * 9)); C.foam = Math.min(100, C.foam + dt * sh * 15); if (C.temp >= 100) { S.hold = null; holdStop(); commit('Milk', milkScore()); }
      if (upg('thermo')) { const tb = tempBand(), fb = MILK[C.spec.milk].foam; if (C.temp >= tb[0] && C.temp <= tb[1] && C.foam >= fb[0] && C.foam <= fb[1] && !S.beeped) { S.beeped = 1; tone(1760, 0.12, 0.05, 'square'); } } }
    if (s === 'art' && C.spec.art === 'heart' && C.art.on && !C.art.pull) { C.art.blob = Math.min(40, C.art.blob + dt * 15); drawArt(); }
    if (s === 'art' && C.art.on) C.art.base = Math.min(0.5, C.art.base + dt * 0.4);
    // grounds pile: grams → level; tamp → pressed flat
    grounds.scale.y = Math.max(0.001, Math.min(C.grams, 24) / 24 * 0.022); mound.position.y = 0.025 + grounds.scale.y; mound.scale.y = s === 'grind' ? clamp(C.grams / 18, 0.01, 1.3) * 0.5 : Math.max(0.01, 0.5 * (1 - C.press / 70));
  }
  function stepProps(dt) { const s = step(), t = performance.now() / 1000;
    if (PF.to && !(drag && drag.kind === 'pf')) { pf.position.lerp(PF.to, Math.min(1, dt * 9)); }
    pf.rotation.y = damp(pf.rotation.y, PF.locked ? 0.6 : 0, 8, dt);
    if (cupMesh && CUPTO.to && !(drag && drag.kind === 'cup') && !slide) cupMesh.position.lerp(CUPTO.to, Math.min(1, dt * 8));
    if (slide) { slide.t += dt / 0.55; const k = Math.min(1, slide.t); cupMesh.position.lerpVectors(slide.from, slide.to, smooth(0, 1, k)); cupMesh.rotation.y += dt * 4; if (k >= 1) { const o = slide.o; slide = null; cupMesh.rotation.y = 0; if (o.st === 'wait') serve(o); else CUPTO.to = pfAt(K.pourSpot, 0.035); } }
    // grinder stream
    grindStream.visible = s === 'grind' && S.grindT > 0; if (grindStream.visible) { const top = K.chute.y + 0.02, bot = pf.position.y + 0.03 + grounds.scale.y, h = Math.max(0.01, top - bot); grindStream.scale.set(1 + Math.sin(t * 50) * 0.2, h, 1); grindStream.position.set(K.chute.x, bot + h / 2, K.chute.z); }
    // tamper
    tamper.visible = s === 'tamp'; if (tamper.visible) { const pr = C.press / 100, off = S.hold && S.hold.off || 0; tamper.position.set(pf.position.x + clamp(off, -1, 1) * 0.015, pf.position.y + 0.07 - pr * 0.035 + (S.hold ? 0 : 0.04), pf.position.z); tamper.rotation.z = -clamp(off, -1, 1) * 0.3; }
    // lever: held = down toward the barista
    const leverT = s === 'pull' && S.hold ? -1.75 : 0.12; K.lever.rotation.x = damp(K.lever.rotation.x, leverT, S.hold ? 7 : 4, dt);
    const pulling = s === 'pull' && S.hold && K.lever.rotation.x < -1.2; shotStream.visible = shotStream2.visible = !!pulling;
    if (cupMesh && C) { const top = K.group.y - 0.12, bot = cupMesh.position.y + cupMesh.userData.base + (cupMesh.userData.top - cupMesh.userData.base) * clamp(C.shot / 100, 0, 1) * 0.6, h = Math.max(0.01, top - bot);
      for (const [m, dx] of [[shotStream, -0.012], [shotStream2, 0.012]]) { m.scale.set(1 + Math.sin(t * 40 + dx * 100) * 0.15, h, 1); m.position.set(K.group.x + dx, bot + h / 2, K.group.z); m.material.color.setHex(C.shot < 16 ? 0x3b2317 : C.shot < 62 ? 0x7a4a22 : 0xc9a877); }
      const big = C.drink !== 'espresso', milkIn = big && C.spec.milk && STEP_ORDER(s) >= STEP_ORDER('art'), fillK = milkIn ? 0.9 + C.art.base * 0.1 : clamp(C.shot / 100, 0, 1) * (big ? 0.42 : 0.95); setFill(cupMesh, Math.min(0.97, fillK));
      if (pulling && Math.random() < dt * 4) drawArt(); }
    K.gauge(s === 'pull' && S.hold ? 0.6 + Math.sin(t * 9) * 0.04 : s === 'steam' && S.hold ? 0.45 : 0.15);
    // syrup pump head
    if (S.pumpT > 0) { S.pumpT -= dt; K.pumpHead.position.y = 0.28 - Math.sin(S.pumpT / 0.25 * Math.PI) * 0.05; }
    // milk jug: under the wand while steaming, over the cup while pouring
    if (C && s === 'steam') { const tip = K.wand.y, y = tip - 0.075 - 0.04 + C.depth * 0.065; jug.position.lerp(V3(K.wand.x, y, K.wand.z + 0.01), Math.min(1, dt * 10)); jug.rotation.z = damp(jug.rotation.z, 0.12, 6, dt); foamTop.scale.y = Math.max(0.001, C.foam / 100 * 0.06); milkTop.visible = false;
      if (S.hold && Math.random() < dt * 14) puff(K.wand.x + rr(-0.05, 0.05), jug.position.y + 0.2, K.wand.z, 0xffffff, 1); }
    else if (C && (s === 'art')) { const c = artCenter(), A = C.art, ax = A.on ? (A.px != null ? A.px : A.lastX || 100) : 100, ay = A.on ? (A.py != null ? A.py : A.artY) : 50, r = cupMesh.userData.r * 0.94, wx = c.x + (ax - 100) / 42 * r, wz = c.z - (ay - 80) / 42 * r;
      jug.position.lerp(V3(wx, c.y + 0.05, c.z + r + 0.2), Math.min(1, dt * 14)); jug.scale.setScalar(0.7); jug.rotation.set(damp(jug.rotation.x, A.on ? -0.95 : -0.35, 8, dt), Math.PI, 0); milkStream.visible = !!A.on; if (A.on) { const top = c.y + 0.07, bot = c.y, h = Math.max(0.01, top - bot); milkStream.scale.set(0.8, h, 0.8); milkStream.position.set(wx, bot + h / 2, wz); } }
    else { milkStream.visible = false; if (!(C && s === 'honey')) { jug.scale.setScalar(1); jug.position.lerp(K.jugHome, Math.min(1, dt * 6)); jug.rotation.set(damp(jug.rotation.x, 0, 6, dt), 0, damp(jug.rotation.z, 0, 6, dt)); if (!C || STEP_ORDER(s) < STEP_ORDER('steam')) { foamTop.scale.y = 0.001; milkTop.visible = true; } } }
    if (C && s === 'honey') { const c = artCenter(), H = C.honey, p = H.pts[H.pts.length - 1] || { x: 70, y: 50 }, r = cupMesh.userData.r * 0.94, wx = c.x + (p.x - 100) / 42 * r, wz = c.z - (p.y - 80) / 42 * r; K.honeyG.position.lerp(V3(wx, c.y + 0.1, c.z + r + 0.2), Math.min(1, dt * 14)); K.honeyG.rotation.x = damp(K.honeyG.rotation.x, -2.2, 8, dt);
      honeyStream.visible = !!H.on; if (H.on) { honeyStream.scale.set(1, 0.06, 1); honeyStream.position.set(wx, c.y + 0.03, wz); } }
    else { honeyStream.visible = false; K.honeyG.position.lerp(K.honey, Math.min(1, dt * 6)); K.honeyG.rotation.x = damp(K.honeyG.rotation.x, 0, 8, dt); }
  }
  const STEP_ORDER = s => ['grind', 'tamp', 'lock', 'syrup', 'pull', 'steam', 'art', 'honey', 'serve'].indexOf(s);
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE && !HIDDEN) tick(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onKD = e => { if (S.phase !== 'walk') return; if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return; if (e.code === 'KeyE') { e.preventDefault(); api.talk(); return; } if (e.code === 'Digit1') { wave(); return; } if (e.code === 'Digit2') { sitToggle(); return; } if (e.code === 'Space') { e.preventDefault(); hop(); return; } W.keys.add(e.code); },
    onKU = e => W.keys.delete(e.code), onBlur = () => W.keys.clear(); const onVis = () => { HIDDEN = document.hidden; try { if (audio.ctx) document.hidden ? audio.ctx.suspend() : audio.ctx.resume(); } catch (e) {} }; document.addEventListener('visibilitychange', onVis); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- HUD state for the page ----------
  function pressInfo() { if (!C || S.phase !== 'shift' || S.react || S.pay) return null; const s = step(), sp = C.spec, bar = (label, v, lo, hi, state, max = 100) => ({ label, v: clamp(v / max, 0, 1), lo: lo / max, hi: hi / max, state, ok: v >= lo && v <= hi, over: v > hi });
    if (s === 'grind') { const mx = sp.dose * 1.4; return { title: 'DOSE ' + sp.dose + ' g', sub: upg('motor') ? 'HOLD TO GRIND' : 'DRAW CIRCLES ↻ ANYWHERE · ABOUT 3 g A TURN', bars: [bar('SCALE', C.grams, sp.dose - 1, sp.dose + 1, (S.backT || 0) > 0 ? 'WRONG WAY' : C.grams.toFixed(1) + ' g', mx)] }; }
    if (s === 'tamp') return { title: 'TAMP IT LEVEL', sub: 'PRESS + HOLD · LET GO IN THE GREEN', bars: [bar('PRESS', C.press, 52, 78, C.press < 52 ? 'LIGHT' : C.press <= 78 ? 'FIRM' : 'TOO HARD')], level: clamp((S.hold && S.hold.off) || 0, -1, 1), levelOk: Math.abs((S.hold && S.hold.off) || 0) < 0.35 };
    if (s === 'lock') return { title: 'LOCK IT IN', sub: 'DRAG THE BASKET INTO THE MACHINE', bars: [] };
    if (s === 'syrup') return { title: 'DATE SYRUP × ' + sp.syrup, sub: 'TAP THE PUMP · THEN GRAB THE LEVER', bars: [bar('PUMPS', C.pumps, sp.syrup - 0.4, sp.syrup + 0.4, C.pumps + ' / ' + sp.syrup, Math.max(4, sp.syrup + 1))] };
    if (s === 'pull') { const [lo, hi] = shotBand(sp.shot); return { title: 'PULL A ' + SHOTS[sp.shot].name, sub: 'HOLD THE LEVER DOWN · LET GO IN THE BAND', bars: [bar('SHOT', C.shot, lo, hi, C.shot < lo ? 'SHORT' : C.shot <= hi ? 'READY' : C.shot > 94 ? 'FLOODED' : 'LONG')] }; }
    if (s === 'steam') { const tb = tempBand(), fb = MILK[sp.milk].foam; return { title: 'STEAM ' + MILK[sp.milk].name, sub: (C.depth < 0.42 ? 'WAND AT THE SURFACE · FOAMING' : 'WAND BURIED · HEATING') + ' · SLIDE ↓ FOAM ↑ HEAT', bars: [bar('HEAT', C.temp, tb[0], tb[1], C.temp < tb[0] ? 'COLD' : C.temp <= tb[1] ? 'READY' : C.temp > 92 ? 'SCALDING' : 'HOT'), bar('FOAM', C.foam, fb[0], fb[1], C.foam < fb[0] ? 'FLAT' : C.foam <= fb[1] ? (sp.milk === 'silky' ? 'SILKY' : 'FOAMY') : 'STIFF')], depth: C.depth }; }
    if (s === 'art') return sp.art === 'heart' ? { title: 'POUR A HEART', sub: 'HOLD IN THE MIDDLE · THEN DRAW DOWN THROUGH IT', bars: [bar('SIZE', C.art.blob, 18, 30, C.art.blob < 18 ? 'SMALL' : C.art.blob <= 30 ? 'GOOD' : 'BIG', 40)] } : { title: 'POUR A ROSETTA · ' + sp.lobes + ' LEAVES', sub: 'FAR RIM FIRST · WIGGLE AS YOU DRAW BACK', bars: [bar('LEAVES', C.art.lobes.length, sp.lobes - 1, sp.lobes + 1, C.art.lobes.length + ' / ' + sp.lobes, Math.max(10, sp.lobes + 3))] };
    if (s === 'honey') return { title: 'UR HONEY', sub: 'ZIG-ZAG ACROSS THE CUP', bars: [bar('ZIG-ZAGS', C.honey.zig, 4, 6, String(C.honey.zig), 9)] };
    return null; }
  function coachInfo() { if (S.phase !== 'shift' || !C || S.touched || DM.on || S.react || S.pay || slide || CAM.t < 1) return null; const s = step(), at = p => { const q = scr(p); return { x: Math.round(q.x), y: Math.round(q.y) }; };
    if (s === 'grind') { if (C.grams > 0.5) return { kind: 'tap', ...at(pf.position), label: 'TAP' }; return upg('motor') ? { kind: 'hold', ...at(K.crankHub), label: 'HOLD' } : { kind: 'circle', ...at(K.crankHub), label: 'CIRCLES' }; }
    if (s === 'tamp') return { kind: 'hold', ...at(pf.position), label: 'HOLD' };
    if (s === 'lock') { const a = at(pf.position), b = at(V3(K.group.x, K.group.y - 0.05, K.group.z)); return { kind: 'drag', ...a, dx: b.x - a.x, dy: b.y - a.y, label: 'DRAG' }; }
    if (s === 'syrup') return { kind: 'tap', ...at(V3(K.pump.x, T + 0.3, K.pump.z)), label: 'TAP ×' + C.spec.syrup };
    if (s === 'pull') return { kind: 'down', ...at(K.leverTip()), label: 'HOLD' };
    if (s === 'steam') return { kind: 'updown', ...at(V3(K.wand.x, T + 0.12, K.wand.z)), label: 'SLIDE' };
    if (s === 'art' || s === 'honey') { const c = artCenter(), r = cupMesh.userData.r * 0.94, a = at(c), f = at(V3(c.x, c.y, c.z + r)); return { kind: C.spec.art === 'heart' && s === 'art' ? 'heart' : 'zigzag', ...a, rad: Math.max(30, Math.round(Math.abs(f.y - a.y))), label: s === 'honey' ? 'ZIG-ZAG' : C.spec.art === 'heart' ? 'HOLD, THEN DOWN' : 'WIGGLE BACK' }; }
    if (s === 'serve') { const o = orders.find(q => q.id === C.oid && q.st === 'wait'); if (!o) return null; const a = at(cupMesh.position), b = at(V3(o.f.position.x, 1.3, o.f.position.z)); return { kind: 'drag', ...a, dx: b.x - a.x, dy: b.y - a.y, label: 'SLIDE' }; }
    return null; }
  function hud() {
    const ticket = o => { const d = DR(o.drink), sp = o.spec, lines = [{ t: d.name, k: 'name' }, { t: SHOTS[sp.shot].name + ' · ' + sp.dose + ' g', k: 'shot' }]; if (sp.milk) lines.push({ t: MILK[sp.milk].name + ' MILK · ' + (sp.art === 'heart' ? 'HEART' : 'ROSETTA ' + sp.lobes), k: 'milk' }); if (sp.syrup) lines.push({ t: '+ DATE SYRUP × ' + sp.syrup, k: 'extra' }); if (sp.honey) lines.push({ t: '+ HONEY ZIG-ZAG', k: 'extra' });
      return { id: o.id, name: custName(o.ci), role: CUSTOMERS[o.ci].role, lines, short: d.name.replace('UR HONEY LATTE', 'HONEY LATTE') + ' · ' + SHOTS[sp.shot].name.slice(0, 4) + (sp.syrup ? ' +S' + sp.syrup : ''), total: o.total, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait', making: !!(C && C.oid === o.id) }; };
    const s = step(), steps = C ? C.steps.filter(x => x !== 'lock').map(x => ({ id: x, label: STEP_INFO[x].label, done: C.steps.indexOf(x) < C.i, now: x === s, score: C.scores[{ grind: 'Dose', tamp: 'Tamp', syrup: 'Syrup', pull: 'Shot', steam: 'Milk', art: 'Art', honey: 'Honey' }[x]] })) : [];
    const stDone = id => C ? C.steps.filter(x => STEP_INFO[x].st === id).every(x => C.steps.indexOf(x) < C.i) && C.steps.some(x => STEP_INFO[x].st === id) : false, stHas = id => C ? C.steps.some(x => STEP_INFO[x].st === id) : false;
    const badges = {}; ['grind', 'tamp', 'brew', 'milk', 'art', 'serve'].forEach(id => { badges[id] = !C ? '' : s && STEP_INFO[s].st === id ? 'NOW' : stDone(id) ? '✓' : stHas(id) ? '' : '—'; }); badges.all = waiting().length ? waiting().length + ' WAIT' : '';
    const cup = C ? { who: custName(C.ci), drink: DR(C.drink).name, avg: cupAvg(), rows: Object.entries(C.scores).map(([k, v]) => ({ k: k.toUpperCase(), v })), notes: C.notes.slice(-2) } : null;
    const walk = S.phase === 'walk' ? { prompt: W.prompt, dialog: dlgHud(), toast: W.toast || null, sitting: !!W.sit, hired: !!save.flag(SAVE.hired) } : null;
    return { phase: S.phase, mode: S.mode, day: S.day, left: Math.max(0, CREMA.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), steps, cup, step: s || null, press: pressInfo(),
      pay: S.pay ? { ...S.pay } : null, flash: S.flash, say: S.say, done: S.done, gold: save.data.gold, uniform: !!save.flag(SAVE.uniform), hired: !!save.flag(SAVE.hired), cups: save.stat(SAVE.cups, 0),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: avail().map(r => ({ name: r.name, price: r.price })), extras: S.day >= SYRUP.day ? [SYRUP.name] : [], demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null, focus: S.focus,
      hint: HINT && HINT.text && !S.react && S.phase === 'shift' ? { text: HINT.text, station: HINT.station } : null, react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip, score: S.react.score, binned: !!S.react.binned } : null,
      badges, fade: S.fade, walk, keeper: CREMA.keeper, coach: coachInfo(), musicOn: CA.musicOn, soundOn: CA.on }; }
  function emit() { onState(hud()); }
  drawArt(); if (S.phase === 'intro') placeGreeter(); else { seatPatrons(); ben.visible = false; benW.position.set(K.door.x, 0, K.door.z - 0.8); benW.rotation.y = Math.PI; }
  if (S.phase === 'intro') { const w = wideShot(); camera.position.copy(w.pos); CAM.look.copy(w.look); }
  frame();
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    setFocus, demoStart, demoStop, startShift, endShift, giveCoin, buyUpgrade, hud, toIntro() { toIntro(); }, toWalk, setPaused(v) { PAUSE = !!v; },
    pickOrder(id) { const o = orders.find(q => q.id === id && q.st === 'wait'); if (!o || !C || C.oid === id || C.i > 0 || C.grams > 0) return; startCup(o); },
    // ---- Game HUD engine contract (walk mode) ----
    start() {}, talk() { if (S.phase !== 'walk') return; if (W.D) { dlgNext(); return; } if (W.target) openTalk(W.target.key); }, choose(i) { dlgChoose(i); }, closeDialog() { closeTalk(); }, nextLine() { dlgNext(); }, clearToast() { W.toast = ''; },
    melee() { wave(); }, range() { sitToggle(); }, jump() { hop(); }, meleeUp() {}, useItem() { W.toast = 'SAVE IT · KU-BAU DOES NOT ALLOW OUTSIDE SNACKS'; W.toastT = 2; }, closeWheel() {}, skipTime() {}, setHudPad() {}, setStick(x, y) { W.stick.x = x; W.stick.y = y; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy() {}, zoomBy() {}, getCam() { return { dist: 6, pitch: 0.6 }; }, setCam() {}, setMinimap() {}, toggleSound() { CA.setOn(!CA.on); if (!CA.on) holdStop(); return !CA.on; }, setMusic(on) { CA.setMusic(on); try { localStorage.setItem('ur.coffee.music', on ? '1' : '0'); } catch (e) {} }, uiTap() { audioOn(); sfx('ui'); }, setOnLeave(fn) { LEAVE.fn = fn; }, cycleWeather() {},
    mapData() { const p = benW.position; return { p: [p.x, p.z, benW.rotation.y], b: [['BAR', 0, KZ], ['DOOR', K.door.x, K.door.z], ['TABLES', 0, 2.7]], f: regulars.map(r => [r.f.position.x, r.f.position.z]), e: [], q: [kubau.position.x, kubau.position.z, 'KU-BAU'] }; },
    _order(drink, syrup = 0) { S.forceDrink = drink; newOrder(); S.forceDrink = null; const o = orders[orders.length - 1]; if (o) { o.spec.syrup = syrup; o.total = priceOf(o); o.f.position.set(K.spots[o.spot].x, 0, K.spots[o.spot].z + 0.03); } return o && o.id; }, _sim(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); }, _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) tick(dt); renderer.render(scene, camera); emit(); }, _skip(t) { S.t = Math.max(S.t, CREMA.shift - t); }, _state: () => S, _cup: () => C, _W: W, _orders: orders,
    _scene: () => scene, _dbg() { return { cam: camera.position.toArray().map(v => +v.toFixed(2)), look: CAM.look.toArray().map(v => +v.toFixed(2)), safe: { ...SAFE }, focus: S.focus, shot: workShot(S.focus) }; }, _auto() { return { grindTurn, grindDone, tampMove, tampDone, lockIn, pumpOnce, syrupDone, pullStart, pullDone, steamStart, steamStop, artDown, artMove, artUp, honeyPt, honeyUp, slideTo, waiting, scr, K, pf, get cup() { return cupMesh; }, artCenter, benW, camera }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); document.removeEventListener('visibilitychange', onVis); holdStop(); CA.stop(); CA.ambience(false); CA.meter(null); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
