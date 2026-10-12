// 8 GATES — GAYA · FELT'S BALL WORKS [gayaBallFactory]. A tennis ball factory job (Ben: "Tennis Ball Factory, for Gaya").
// A walk-in interior: drop it into any building with buildFactory(ctx) and the player can walk around it; talk to FELT (foreman) to work a shift.
// THE LINE (one touch gesture per station, built for thumbs):
//   1 PRESS  · HOLD to squeeze the rubber, let go while the bar is GREEN → 3 cores (4 with the Quad Mould)
//   2 DYE    · DRAG the basket of cores into a dye vat → OPTIC YELLOW · COURT PINK · GAYA GOLD (day 2) · SKY BLUE (day 3)
//   3 SEAM   · TRACE THE 8 with your finger (every ball's seam is the 8 of the Gates)
//   4 TEST   · FLICK the ball UP at the wall, TAP to catch it on the way back; a dead ball thuds → SWIPE LEFT into REJECT
//   5 CAN    · DRAG 3 balls of one colour into a can, TAP the pump into the green, TWIST the lid round to seal it
//   SHIP     · DRAG the can (or tap it, then tap them) to the customer waiting at the loading dock
// Orders come from Gaya folk (Ace, Slice, Loft, Fault, Deuce, Volley, Pip, Sorrel, Grish, Fenn, Ledger, Plum, Iris...).
// Day loop like Sizzle's: 3-minute shift → wage + cans + tips → EMPLOYEE OF THE DAY → uniform → upgrades → harder day.
// Save: stats gaya.balls.day / gaya.balls.best / gaya.balls.upg.<id>, flag ballUniform.
// createBallFactory({ container, onState, onExit }) runs it stand-alone: intro card → PUT ME TO WORK, or WALK AROUND (Game HUD contract below).
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { createBallworksAudio } from './ballworks-audio.js';

export const FACTORY = { name: "FELT'S BALL WORKS", room: 'gayaBallFactory', world: 'gaya', shift: 180 };
export const COLOURS = {
  yellow: { name: 'OPTIC YELLOW', short: 'YELLOW', col: '#d4ef3a', dark: '#93ad18', day: 1, price: 6 },
  pink: { name: 'COURT PINK', short: 'PINK', col: '#ff7eb6', dark: '#c4467e', day: 1, price: 7 },
  gold: { name: 'GAYA GOLD', short: 'GOLD', col: '#f2b632', dark: '#a8741a', day: 2, price: 10 },
  sky: { name: 'SKY BLUE', short: 'BLUE', col: '#5cc0f2', dark: '#2a7fb0', day: 3, price: 8 } };
export const COL_KEYS = ['yellow', 'pink', 'gold', 'sky'];
export const UPGRADES = [
  { id: 'guide', name: 'WIDE NEEDLE GUIDE', cost: 35, line: 'The seam line is easier to follow.' },
  { id: 'pump', name: 'BIG PUMP', cost: 30, line: 'Fewer pumps to fill a can.' },
  { id: 'lamp', name: 'BOUNCE LAMP', cost: 40, line: 'Dead balls glow red. Wider catch window.' },
  { id: 'mould', name: 'QUAD MOULD', cost: 60, line: 'The press makes 4 balls at once.' },
  { id: 'radio', name: 'FACTORY RADIO', cost: 50, line: 'Happy customers tip 25% more.' }];
export const CUSTOMERS = [
  { name: 'ACE', role: 'Champion · Stadium', fur: '#3a3836', furDark: '#1a1918', torso: ['#f2c94c', '#201e1d', '#a8792e'] },
  { name: 'SLICE', role: 'Gaya Open', fur: '#c9682a', furDark: '#8a4213', torso: ['#3a6ea5', '#fbf8ec', '#22446e'] },
  { name: 'LOFT', role: 'Gaya Open', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#2f9a8f', '#fbf8ec', '#1f6a62'] },
  { name: 'FAULT', role: 'Ballfox · Stadium', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#ec3013', '#fbf8ec', '#a82c26'] },
  { name: 'DEUCE', role: 'Umpire', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#1f4a34', '#fbf8ec', '#16352a'], outfit: 'coat' },
  { name: 'VOLLEY', role: 'Tavern table', torso: ['#a78bfa', '#ede9fe', '#5b21b6'] },
  { name: 'PIP', role: 'Tavern table', fur: '#f0dcbe', furDark: '#b89a72', torso: ['#38bdf8', '#e0f2fe', '#0369a1'] },
  { name: 'SORREL', role: 'Barkeep · Tavern', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#7a2e1f', '#f2e6d0', '#4a1a12'] },
  { name: 'GRISH', role: 'Hero', torso: ['#6b7d93', '#e7edf4', '#3a4a5c'], outfit: 'armor' },
  { name: 'FENN', role: 'Item Shop', fur: '#9a9a9e', furDark: '#5a5a5e', torso: ['#2f5d2a', '#e6b45a', '#1a3318'] },
  { name: 'LEDGER', role: 'Stadium buyer', fur: '#3a3836', furDark: '#1a1918', torso: ['#1f2937', '#e6b45a', '#111827'], outfit: 'coat' },
  { name: 'PLUM', role: 'Town Square', torso: ['#7c3a8a', '#f3e8f8', '#4a1a5a'] },
  { name: 'IRIS', role: 'Town Square', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#6a5acd', '#eef', '#3a2a8d'] }];
const REACT = {
  thrilled: { word: 'THRILLED', col: '#22c55e', mood: 'excited', lines: ['These bounce like a dream!', 'Best balls on Gaya!', 'Look at that seam. Perfect eight!'] },
  happy: { word: 'HAPPY', col: '#ffd23a', mood: 'happy', lines: ['Nice and lively. Thanks!', 'Good can, good pop.', 'That will do nicely.'] },
  okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['A bit flat, but fine.', 'Hm. The seam wobbles.', 'They will do for practice.'] },
  grumpy: { word: 'GRUMPY', col: '#ec3013', mood: 'stern', lines: ['These are dead!', 'Too slow! I have a match!', 'I am buying from Earth next time.'] } };
const FELT_SAYS = { start: ['Line is running! Watch the tickets.', 'Squeeze, dunk, stitch, bounce, can!'], idle: ['Press a new batch, the vats are hungry!', 'Check the colours on the tickets.'], pop: ['Easy on the pump!'], dead: ['Good eye! Dead ones go in the bin.'], great: ['Now THAT is a Gaya ball!'] };
export const FELT = { key: 'feltForeman', name: 'FELT', role: 'FOREMAN · BALL WORKS', fur: '#b9854a', furDark: '#7a5226', torso: ['#d4ef3a', '#201e1d', '#93ad18'], outfit: 'coat', mood: 'happy' };
export const FELT_LINES = { greet: "Ben! Welcome to the Ball Works. Every ball they whack at the Gaya Open rolls off my line.", how: "Squeeze the rubber, dunk the felt, stitch the 8, bounce test it, then can it under pressure. Three balls a can. The tickets up top tell you the colours.", pay: "A wage, plus every can you ship, plus tips when they bounce right. Employee of the Day gets my gold star.", bye: "Help yourself. Mind the press, it bites.", work: "Uniform's on the hook. Watch the tickets and mind the press!" };
const SK = { day: 'gaya.balls.day', best: 'gaya.balls.best', upg: 'gaya.balls.upg.' };
const STATIONS = ['press', 'dye', 'seam', 'test', 'can'];
// the seam is the 8 of the Gates: a vertical lissajous, started at the top of the upper loop
export function seamPath(n = 96) { const out = []; for (let i = 0; i <= n; i++) { const t = Math.PI / 2 + i / n * Math.PI * 2; out.push([0.5 + 0.27 * Math.sin(2 * t), 0.5 - 0.4 * Math.sin(t)]); } return out; }

// ---------- ball textures (shared): felt colour, optional white seam band ----------
const _ballTex = new Map();
export function ballTexture(T3, col, seam) {
  const k = col + (seam ? '|s' : ''); if (_ballTex.has(k)) return _ballTex.get(k);
  const c = document.createElement('canvas'); c.width = 256; c.height = 128; const g = c.getContext('2d');
  g.fillStyle = col; g.fillRect(0, 0, 256, 128);
  const lt = T3.Color ? new T3.Color(col) : null, hsl = { h: 0, s: 0, l: 0 }; if (lt) lt.getHSL(hsl);
  for (let i = 0; i < 1600; i++) { const x = Math.random() * 256, y = Math.random() * 128, a = Math.random() * Math.PI, L = 2 + Math.random() * 3; g.strokeStyle = 'hsla(' + (hsl.h * 360) + ',' + (hsl.s * 100) + '%,' + (hsl.l * 100 + (Math.random() < 0.5 ? 14 : -12)) + '%,0.45)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); } // felt fuzz
  if (seam) { const path = () => { g.beginPath(); for (let x = -4; x <= 260; x += 4) { const y = 64 + Math.sin(x / 256 * Math.PI * 4) * 30; x > -4 ? g.lineTo(x, y) : g.moveTo(x, y); } };
    g.lineCap = 'round'; g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 13; path(); g.stroke(); g.strokeStyle = '#fbfbf7'; g.lineWidth = 9; path(); g.stroke(); g.strokeStyle = 'rgba(160,160,150,0.7)'; g.lineWidth = 1.5; path(); g.stroke(); }
  const t = new T3.CanvasTexture(c); t.colorSpace = T3.SRGBColorSpace; _ballTex.set(k, t); return t;
}

// ---------- THE INTERIOR (no game logic) ----------
// ctx: { THREE, M, toon, canvasTex, scene, origin, grad }. Returns K: positions (world), meshes the game animates, colliders for walking.
export function buildFactory(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, grad } = ctx;
  const root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const W = 20, D = 14, H = 5.2, LZ = -1.8, TOP = 1.0, SX = { press: -6.4, dye: -3.2, seam: 0, test: 3.2, can: 6.4 };
  const P = (x, y, z) => new T3.Vector3(origin.x + x, y, origin.z + z);
  const K = { root, W, D, H, origin, lineZ: origin.z + LZ, top: TOP, st: {}, front: [], cut: [], colliders: [], looks: [], belts: [] };
  for (const k of STATIONS) K.st[k] = { x: origin.x + SX[k], z: origin.z + LZ };
  const tm = col => toon(col), ink = tm('#201e1d'), steel = tm('#b8c2cc'), steelD = tm('#7d8a96'), green = tm('#2f7a52'), cream = tm('#f2ead8'), yellow = tm('#ffd23a'), red = tm('#ec3013');
  const box = (w, h, d, mat, x, y, z, o = 0.02) => M(new T3.BoxGeometry(w, h, d), mat, x, y, z, root, o);
  const cyl = (rt, rb, h, mat, x, y, z, seg = 16, o = 0.02) => M(new T3.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, root, o, Math.max(rt, rb));
  const collide = (x0, z0, x1, z1) => K.colliders.push({ x0: origin.x + Math.min(x0, x1), z0: origin.z + Math.min(z0, z1), x1: origin.x + Math.max(x0, x1), z1: origin.z + Math.max(z0, z1) });
  const signTex = (w, h, draw) => { const t = CTX(w, h, draw); t.anisotropy = 4; return t; };
  const plane = (w, h, tex, x, y, z, ry = 0, basic = true) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, h), basic ? new T3.MeshBasicMaterial({ map: tex, transparent: true }) : new T3.MeshToonMaterial({ map: tex, gradientMap: grad })); m.position.set(x, y, z); m.rotation.y = ry; root.add(m); return m; };

  // floor: green-grey concrete with yellow safety lanes along the line + walkway
  const floorT = CTX(512, 512, c => { c.fillStyle = '#9aa69c'; c.fillRect(0, 0, 512, 512); c.globalAlpha = 0.08; for (let i = 0; i < 1400; i++) { c.fillStyle = Math.random() < 0.5 ? '#fff' : '#000'; c.fillRect(Math.random() * 512, Math.random() * 512, 3, 3); } c.globalAlpha = 0.22; c.strokeStyle = '#5c665e'; c.lineWidth = 2; for (let i = 0; i <= 512; i += 128) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 512); c.stroke(); c.beginPath(); c.moveTo(0, i); c.lineTo(512, i); c.stroke(); } c.globalAlpha = 1; });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 4, D / 4);
  { const f = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: grad })); f.rotation.x = -Math.PI / 2; f.receiveShadow = true; root.add(f); }
  const stripe = (w, d, x, z, col = '#ffd23a') => { const m = new T3.Mesh(new T3.PlaneGeometry(w, d), new T3.MeshBasicMaterial({ color: col })); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.006, z); root.add(m); };
  stripe(17.4, 0.1, 0, LZ + 1.75); stripe(17.4, 0.1, 0, LZ - 1.95); stripe(0.1, 3.7, -8.7, LZ - 0.1); stripe(0.1, 3.7, 8.7, LZ - 0.1);
  { const hz = CTX(128, 32, c => { for (let i = -2; i < 10; i++) { c.fillStyle = i % 2 ? '#201e1d' : '#ffd23a'; c.beginPath(); c.moveTo(i * 16, 32); c.lineTo(i * 16 + 16, 32); c.lineTo(i * 16 + 32, 0); c.lineTo(i * 16 + 16, 0); c.fill(); } }); hz.wrapS = T3.RepeatWrapping; hz.repeat.set(5, 1);
    const m = new T3.Mesh(new T3.PlaneGeometry(3.4, 0.4), new T3.MeshBasicMaterial({ map: hz })); m.rotation.x = -Math.PI / 2; m.position.set(6.6, 0.007, -6.4); root.add(m); }

  // walls: cream brick upper, Gaya green lower band, gold trim
  const wallT = CTX(256, 256, c => { c.fillStyle = '#efe4cc'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#d8c9a8'; c.lineWidth = 2; for (let y = 0; y < 170; y += 21) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); for (let x = (y / 21) % 2 ? 0 : 32; x < 256; x += 64) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 21); c.stroke(); } } c.fillStyle = '#2f7a52'; c.fillRect(0, 176, 256, 80); c.fillStyle = '#f2c94c'; c.fillRect(0, 168, 256, 8); });
  wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(5, 1); const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: grad });
  for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); }
  { const fw = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); fw.position.set(0, H / 2, D / 2); fw.rotation.y = Math.PI; root.add(fw); K.front.push(fw); }
  collide(-W / 2 - 1, -D / 2 - 1, W / 2 + 1, -D / 2 + 0.35); collide(-W / 2 - 1, -D / 2, -W / 2 + 0.35, D / 2); collide(W / 2 - 0.35, -D / 2, W / 2 + 1, D / 2); collide(-W / 2, D / 2 - 0.35, W / 2, D / 2 + 1);
  // roof trusses + skylight glow (cut away while working so the camera sees down)
  for (let x = -8; x <= 8; x += 4) { K.cut.push(box(0.18, 0.3, D, steelD, x, H - 0.2, 0, 0.01)); }
  K.cut.push(box(W, 0.15, 0.3, steelD, 0, H - 0.1, -D / 2 + 0.3, 0));
  // pipes along the back wall
  for (const [y, col] of [[3.7, '#c42d3c'], [4.0, '#2a7fb0'], [4.3, '#f2c94c']]) { const p = M(new T3.CylinderGeometry(0.07, 0.07, W - 0.6, 10), tm(col), 0, y, -D / 2 + 0.25, root, 0.01, 0.07); p.rotation.z = Math.PI / 2; }

  // big sign on the back wall: FELT'S BALL WORKS · GAYA
  const signT = signTex(1024, 256, c => {
    c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 256); c.fillStyle = '#f2c94c'; c.fillRect(0, 0, 1024, 10); c.fillRect(0, 246, 1024, 10);
    c.save(); c.translate(128, 128); c.fillStyle = '#d4ef3a'; c.beginPath(); c.arc(0, 0, 92, 0, 7); c.fill(); c.strokeStyle = '#fbfbf7'; c.lineWidth = 12; c.beginPath(); for (let i = 0; i <= 64; i++) { const t = Math.PI / 2 + i / 64 * Math.PI * 2; const x = 0.27 * Math.sin(2 * t) * 180, y = -0.4 * Math.sin(t) * 180; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
    c.fillStyle = '#fbfbf7'; c.font = '900 92px Archivo, "Arial Black", Arial'; c.textBaseline = 'middle'; c.fillText("FELT'S BALL WORKS", 250, 108); c.fillStyle = '#f2c94c'; c.font = '800 44px Archivo, Arial'; c.fillText('GAYA · EST. AFTER THE FIRST OPEN', 254, 192); });
  plane(7.2, 1.8, signT, -1.6, 3.4, -D / 2 + 0.03);

  // ---------- THE LINE: one long conveyor ----------
  const beltT = CTX(64, 64, c => { c.fillStyle = '#2b2a2e'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#3d3c42'; for (let i = 0; i < 64; i += 16) c.fillRect(i, 0, 6, 64); }); beltT.wrapS = beltT.wrapT = T3.RepeatWrapping; beltT.repeat.set(36, 1);
  { const belt = new T3.Mesh(new T3.BoxGeometry(17, 0.08, 0.7), [steel, steel, new T3.MeshToonMaterial({ map: beltT, gradientMap: grad }), steel, steel, steel]); belt.position.set(0, TOP - 0.04, LZ); belt.receiveShadow = true; root.add(belt); K.belts.push(beltT);
    box(17.1, 0.1, 0.08, yellow, 0, TOP - 0.02, LZ + 0.39, 0.008); box(17.1, 0.1, 0.08, yellow, 0, TOP - 0.02, LZ - 0.39, 0.008);
    for (let x = -8; x <= 8; x += 2) { box(0.1, TOP - 0.1, 0.1, steelD, x, (TOP - 0.1) / 2, LZ + 0.3, 0.008); box(0.1, TOP - 0.1, 0.1, steelD, x, (TOP - 0.1) / 2, LZ - 0.3, 0.008); }
    collide(-8.7, LZ - 0.5, 8.7, LZ + 0.5); }
  // station number boards hanging above the line
  STATIONS.forEach((k, i) => { const t = signTex(256, 128, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 128); c.fillStyle = '#ffd23a'; c.fillRect(0, 0, 70, 128); c.fillStyle = '#201e1d'; c.font = '900 80px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i + 1), 35, 68); c.fillStyle = '#fbfbf7'; c.font = '900 50px Archivo, Arial'; c.textAlign = 'left'; c.fillText(k.toUpperCase(), 86, 68); });
    const s = plane(1.3, 0.65, t, SX[k], 3.35, LZ - 0.2); K.cut.push(s); K.cut.push(box(0.02, 1.3, 0.02, ink, SX[k] - 0.5, 4.3, LZ - 0.2, 0), box(0.02, 1.3, 0.02, ink, SX[k] + 0.5, 4.3, LZ - 0.2, 0)); });

  // 1 PRESS: hopper of raw rubber feeding a squat hydraulic press over a 3/4-cavity mould
  { const x = SX.press; box(1.5, 0.12, 1.3, steelD, x, TOP + 0.02, LZ - 0.25, 0.012);
    const mould = box(1.1, 0.14, 0.5, tm('#3a3836'), x, TOP + 0.13, LZ, 0.01); K.mould = mould;
    for (const sx of [-1, 1]) box(0.14, 1.7, 0.14, steel, x + sx * 0.72, TOP + 0.9, LZ - 0.35, 0.012);
    box(1.6, 0.26, 0.5, red, x, TOP + 1.85, LZ - 0.35, 0.015);
    const head = new T3.Group(); head.position.set(x, TOP + 1.2, LZ); root.add(head); K.pressHead = head; K.pressHeadY = { up: TOP + 1.2, down: TOP + 0.3 };
    M(new T3.BoxGeometry(1.1, 0.18, 0.5), red, 0, 0, 0, head, 0.012); M(new T3.CylinderGeometry(0.1, 0.1, 0.9, 10), steel, 0, 0.5, 0, head, 0.01, 0.1);
    const gT = signTex(256, 64, c => { c.fillStyle = '#fbfbf7'; c.font = '900 40px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText('PRESS', 10, 34); }); const lab = plane(0.8, 0.2, gT, x, TOP + 1.85, LZ - 0.09); lab.renderOrder = 2;
    // the hopper (a big funnel of black rubber pellets) behind-left
    cyl(0.75, 0.25, 1.1, tm('#d7dde3'), x - 1.55, 2.3, LZ - 0.6, 18, 0.02); cyl(0.7, 0.7, 0.05, tm('#2a2a2e'), x - 1.55, 2.84, LZ - 0.6, 18, 0); box(0.12, 1.75, 0.12, steelD, x - 1.55, 0.87, LZ - 0.6, 0.01);
    const chute = M(new T3.CylinderGeometry(0.08, 0.08, 1.1, 8), tm('#d7dde3'), x - 0.95, 1.65, LZ - 0.5, root, 0.01, 0.08); chute.rotation.z = -1.0;
    collide(x - 2.4, LZ - 1.5, x - 0.8, LZ + 0.2);
    K.looks.push({ p: P(x, 0, LZ + 1.2), name: 'RUBBER PRESS', line: 'Squeezes three rubber cores at a time. Hold too long and they come out flat as pancakes.' }); }

  // 2 DYE: four vats behind the belt + an overhead rail with a wire basket
  K.vats = []; { const x = SX.dye; box(3.0, 0.08, 0.08, steel, x, 2.5, LZ - 0.2, 0.01); for (const sx of [-1.5, 1.5]) box(0.1, 2.5, 0.1, steelD, x + sx, 1.25, LZ - 0.2, 0.01);
    COL_KEYS.forEach((k, i) => { const vx = x - 1.05 + i * 0.7, vz = LZ - 0.95; M(new T3.CylinderGeometry(0.32, 0.29, 0.9, 20, 1, true), new T3.MeshToonMaterial({ color: 0xd7dde3, gradientMap: grad, side: T3.DoubleSide }), vx, 0.45, vz, root, 0); M(new T3.TorusGeometry(0.33, 0.035, 6, 24), tm(COLOURS[k].dark), vx, 0.92, vz, root, 0).rotation.x = Math.PI / 2; const liq = M(new T3.CylinderGeometry(0.3, 0.3, 0.02, 20), tm(COLOURS[k].col), vx, 0.84, vz, root, 0);
      const lid = M(new T3.CylinderGeometry(0.34, 0.34, 0.05, 20), tm('#5c6670'), vx, 0.96, vz, root, 0.01, 0.34); lid.visible = false;
      const tT = signTex(128, 48, c => { c.fillStyle = COLOURS[k].dark; c.fillRect(0, 0, 128, 48); c.fillStyle = '#fbfbf7'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(COLOURS[k].short, 64, 26); });
      const tag = plane(0.5, 0.19, tT, vx, 0.55, vz + 0.33);
      K.vats.push({ k, x: origin.x + vx, z: origin.z + vz, y: 0.86, liq, lid, tag }); });
    collide(x - 1.5, LZ - 1.35, x + 1.5, LZ - 0.5);
    const basket = new T3.Group(); root.add(basket); basket.position.set(x, TOP + 0.75, LZ); K.basket = basket; K.basketHome = P(x, TOP + 0.75, LZ);
    const wire = tm('#d7dde3'); for (const a of [0, 1, 2, 3]) { const b = M(new T3.BoxGeometry(0.42, 0.18, 0.012), wire, 0, 0, 0, basket, 0.004); b.rotation.y = a * Math.PI / 2; b.position.set(Math.sin(a * Math.PI / 2) * 0.21, 0, Math.cos(a * Math.PI / 2) * 0.21); }
    M(new T3.BoxGeometry(0.42, 0.012, 0.42), wire, 0, -0.09, 0, basket, 0.004); const hook = M(new T3.CylinderGeometry(0.012, 0.012, 1.2, 6), steelD, 0, 0.68, 0, basket, 0); K.basketCable = hook;
    K.looks.push({ p: P(x, 0, LZ + 1.2), name: 'DYE VATS', line: 'Felt goes in white and comes out Optic Yellow, Court Pink, Gaya Gold or Sky Blue.' }); }

  // 3 SEAM: a stitching machine with a tilted felt board facing the worker
  { const x = SX.seam; box(1.4, 0.45, 0.6, cream, x, TOP + 0.22, LZ - 0.85, 0.015); box(1.5, 0.08, 0.7, steelD, x, TOP + 0.47, LZ - 0.85, 0.01);
    M(new T3.CylinderGeometry(0.05, 0.05, 0.3, 10), steel, x - 0.5, TOP + 0.9, LZ - 0.75, root, 0.008, 0.05); M(new T3.CylinderGeometry(0.05, 0.05, 0.3, 10), steel, x + 0.5, TOP + 0.9, LZ - 0.75, root, 0.008, 0.05);
    const bc = document.createElement('canvas'); bc.width = bc.height = 512; const bt = new T3.CanvasTexture(bc); bt.colorSpace = T3.SRGBColorSpace; bt.anisotropy = 4;
    const board = new T3.Mesh(new T3.PlaneGeometry(1.15, 1.15), new T3.MeshBasicMaterial({ map: bt })); board.position.set(x, TOP + 0.62, LZ - 0.25); board.rotation.x = -0.88; root.add(board);
    const frame = M(new T3.BoxGeometry(1.25, 1.25, 0.05), ink, 0, 0, -0.03, board, 0.01); frame.position.z = -0.035;
    K.seam = { board, canvas: bc, tex: bt, size: 1.15 }; { const c = bc.getContext('2d'); c.fillStyle = '#2f7a52'; c.fillRect(0, 0, 512, 512); c.strokeStyle = 'rgba(251,251,247,0.18)'; c.lineWidth = 30; c.lineCap = 'round'; c.beginPath(); seamPath(96).forEach(([u, v], i) => i ? c.lineTo(u * 512, v * 512) : c.moveTo(u * 512, v * 512)); c.stroke(); c.fillStyle = '#f2c94c'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.fillText('SEAM STITCHER', 256, 64); bt.needsUpdate = true; }
    const needle = new T3.Group(); M(new T3.CylinderGeometry(0.012, 0.004, 0.22, 6), steel, 0, 0.11, 0, needle, 0.006, 0.012); M(new T3.SphereGeometry(0.03, 8, 6), red, 0, 0.23, 0, needle, 0.006, 0.03); needle.visible = false; root.add(needle); K.needle = needle;
    collide(x - 0.8, LZ - 1.1, x + 0.8, LZ - 0.4);
    K.looks.push({ p: P(x, 0, LZ + 1.2), name: 'SEAM STITCHER', line: 'Every Gaya ball is sewn with the 8 of the Gates. Trace it right and it flies true.' }); }

  // 4 TEST: launch plate, a padded test wall, a reject bin with a red lid
  { const x = SX.test; box(0.6, 0.06, 0.6, steelD, x, TOP + 0.03, LZ - 0.6, 0.01); box(0.5, TOP, 0.5, steel, x, TOP / 2, LZ - 0.6, 0.012);
    const plate = M(new T3.CylinderGeometry(0.22, 0.22, 0.04, 20), tm('#fbfbf7'), x, TOP + 0.08, LZ - 0.6, root, 0.008, 0.22); K.plate = P(x, TOP + 0.21, LZ - 0.6);
    const wallT2 = signTex(256, 384, c => { c.fillStyle = '#2f7a52'; c.fillRect(0, 0, 256, 384); c.strokeStyle = '#fbfbf7'; c.lineWidth = 8; c.strokeRect(14, 14, 228, 356); c.beginPath(); c.arc(128, 150, 54, 0, 7); c.stroke(); c.fillStyle = '#ffd23a'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.fillText('BOUNCE', 128, 290); c.fillText('TEST', 128, 330); });
    box(1.5, 2.3, 0.14, tm('#1f4a34'), x, 1.15 + 0.6, LZ - 1.6, 0.015); plane(1.36, 2.1, wallT2, x, 1.8, LZ - 1.52); K.testWall = P(x, 2.2, LZ - 1.45);
    const rT = signTex(128, 40, c => { c.fillStyle = '#fbfbf7'; c.font = '900 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('REJECT', 64, 22); }); const bin = new T3.Group(); bin.position.set(x - 0.95, 0, LZ - 0.65); root.add(bin); M(new T3.CylinderGeometry(0.3, 0.25, 0.9, 16), red, 0, 0.45, 0, bin, 0.02, 0.3); M(new T3.CylinderGeometry(0.31, 0.31, 0.05, 16), tm('#8f1d2a'), 0, 0.92, 0, bin, 0.01, 0.31); { const tl = new T3.Mesh(new T3.PlaneGeometry(0.5, 0.16), new T3.MeshBasicMaterial({ map: rT, transparent: true })); tl.rotation.x = -Math.PI / 2; tl.position.y = 0.95; bin.add(tl); }
    const rl = new T3.Mesh(new T3.PlaneGeometry(0.46, 0.15), new T3.MeshBasicMaterial({ map: rT, transparent: true })); rl.position.set(0, 0.6, 0.3); bin.add(rl);
    K.bin = P(x - 0.95, 1.0, LZ - 0.65); K.testTray = P(x + 0.75, TOP + 0.08, LZ - 0.55);
    box(0.8, 0.05, 0.4, steelD, x + 0.75, TOP + 0.02, LZ - 0.55, 0.008); box(0.7, TOP, 0.35, steel, x + 0.75, TOP / 2, LZ - 0.55, 0.01);
    collide(x - 1.3, LZ - 1.8, x + 1.2, LZ - 0.3);
    K.looks.push({ p: P(x, 0, LZ + 1.2), name: 'BOUNCE TEST', line: 'Every ball hits the wall. Lively ones come back for a catch, dead ones go in the red bin.' }); }

  // 5 CAN: colour rack (left), can stand + pump + lid (centre/right), shelf of sealed cans (right)
  { const x = SX.can; box(1.9, 0.06, 0.9, steelD, x + 0.05, TOP + 0.03, LZ - 0.75, 0.01); box(1.8, TOP, 0.8, steel, x + 0.05, TOP / 2, LZ - 0.75, 0.012);
    K.rack = {}; COL_KEYS.forEach((k, i) => { const rx = x - 0.75 + (i % 2) * 0.36, rz = LZ - 0.98 + Math.floor(i / 2) * 0.42; const tray = M(new T3.BoxGeometry(0.32, 0.06, 0.36), tm(COLOURS[k].dark), rx, TOP + 0.09, rz, root, 0.006); K.rack[k] = { x: origin.x + rx, z: origin.z + rz, y: TOP + 0.12, tray }; });
    const stand = M(new T3.CylinderGeometry(0.2, 0.22, 0.08, 18), steelD, x + 0.1, TOP + 0.1, LZ - 0.6, root, 0.008, 0.22);
    K.canAt = P(x + 0.1, TOP + 0.14, LZ - 0.6);
    const pump = new T3.Group(); pump.position.set(x + 0.8, TOP + 0.06, LZ - 0.72); root.add(pump); M(new T3.CylinderGeometry(0.09, 0.11, 0.55, 12), red, 0, 0.28, 0, pump, 0.01, 0.11);
    const plunger = new T3.Group(); plunger.position.y = 0.62; pump.add(plunger); M(new T3.CylinderGeometry(0.02, 0.02, 0.3, 6), steel, 0, -0.1, 0, plunger, 0); M(new T3.BoxGeometry(0.34, 0.06, 0.08), ink, 0, 0.06, 0, plunger, 0.008);
    const hose = M(new T3.TorusGeometry(0.33, 0.018, 6, 16, Math.PI), tm('#201e1d'), x + 0.45, TOP + 0.14, LZ - 0.66, root, 0); hose.rotation.x = Math.PI / 2; hose.rotation.z = Math.PI;
    K.pump = pump; K.plunger = plunger; K.pumpAt = P(x + 0.8, TOP + 0.6, LZ - 0.72);
    const gc = document.createElement('canvas'); gc.width = 256; gc.height = 256; const gt = new T3.CanvasTexture(gc); gt.colorSpace = T3.SRGBColorSpace;
    const gauge = new T3.Mesh(new T3.CircleGeometry(0.2, 28), new T3.MeshBasicMaterial({ map: gt })); gauge.position.set(x + 0.8, TOP + 1.05, LZ - 0.69); gauge.rotation.x = -0.35; root.add(gauge); M(new T3.TorusGeometry(0.2, 0.025, 6, 28), ink, 0, 0, 0, gauge, 0);
    K.gauge = { mesh: gauge, canvas: gc, tex: gt };
    // sealed-can shelf at the right end of the bench, nearest the dock
    box(0.45, 0.05, 0.85, tm('#8a5a32'), x + 1.35, TOP + 0.36, LZ - 0.7, 0.008); for (const sz of [-0.38, 0.38]) box(0.04, 0.36, 0.04, steelD, x + 1.35, TOP + 0.18, LZ - 0.7 + sz, 0);
    K.outSlots = [0, 1, 2].map(i => P(x + 1.35, TOP + 0.39, LZ - 0.98 + i * 0.28));
    collide(x - 1.0, LZ - 1.3, x + 1.6, LZ - 0.3);
    K.looks.push({ p: P(x, 0, LZ + 1.2), name: 'CANNER', line: 'Three balls a can, pumped up under pressure so they stay bouncy on the shelf.' }); }

  // LOADING DOCK (back right): roll-up door, customers wait in a line facing the worker
  { const dT = signTex(256, 256, c => { c.fillStyle = '#c9ced4'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#9aa2aa'; for (let y = 0; y < 256; y += 16) c.fillRect(0, y, 256, 4); c.fillStyle = '#201e1d'; c.fillRect(0, 200, 256, 56); c.fillStyle = '#ffd23a'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.fillText('SHIPPING', 128, 238); });
    plane(3.0, 3.0, dT, 6.0, 1.5, -D / 2 + 0.03, 0, false); box(3.3, 0.18, 0.2, yellow, 6.0, 3.05, -D / 2 + 0.1, 0.01); for (const s of [-1, 1]) box(0.16, 3.1, 0.2, yellow, 6 + s * 1.6, 1.55, -D / 2 + 0.1, 0.01);
    K.dockDoor = P(6.0, 0, -D / 2 + 0.6); K.dock = [P(4.9, 0, LZ - 3.3), P(6.35, 0, LZ - 3.45), P(7.8, 0, LZ - 3.3)];
    const pT = signTex(256, 64, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#ffd23a'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('PICK-UP', 128, 34); }); plane(1.0, 0.25, pT, 8.6, 2.5, -D / 2 + 0.04); }

  // FELT'S OFFICE (front left): desk, clipboard wall, the SAFETY board
  { box(1.8, 0.85, 0.8, tm('#8a5a32'), -8.2, 0.42, 3.4, 0.02); box(1.9, 0.06, 0.9, tm('#6a4022'), -8.2, 0.87, 3.4, 0.01); box(0.5, 0.35, 0.05, ink, -8.5, 1.08, 3.2, 0.006);
    const bT = signTex(512, 320, c => { c.fillStyle = '#20332a'; c.fillRect(0, 0, 512, 320); c.strokeStyle = '#8a5a32'; c.lineWidth = 16; c.strokeRect(0, 0, 512, 320); c.fillStyle = '#fbfbf7'; c.font = '800 34px Archivo, Arial'; c.fillText('SAFETY FIRST', 36, 70); c.font = '700 26px Archivo, Arial'; c.fillText('DAYS SINCE A BALL', 36, 130); c.fillText('ESCAPED THE LINE:', 36, 166); c.fillStyle = '#ffd23a'; c.font = '900 92px Archivo, Arial'; c.fillText('0', 380, 175); c.fillStyle = '#d4ef3a'; c.font = '700 24px Archivo, Arial'; c.fillText('Squeeze · Dunk · Stitch · Bounce · Can', 36, 268); });
    plane(1.9, 1.2, bT, -W / 2 + 0.04, 2.0, 3.2, Math.PI / 2);
    collide(-9.2, 2.9, -7.2, 3.9); K.office = P(-7.3, 0, 2.7);
    K.looks.push({ p: P(-8.8, 0, 2.3), name: 'SAFETY BOARD', line: 'DAYS SINCE A BALL ESCAPED THE LINE: 0. Someone keeps flicking them at the ceiling.' }); }

  // the big display ball by the door (the factory's mascot) + stacked cans + pallets for life
  { const big = M(new T3.SphereGeometry(0.85, 28, 20), new T3.MeshToonMaterial({ map: ballTexture(T3, COLOURS.yellow.col, true), gradientMap: grad }), 3.6, 1.55, 4.6, root, 0.03, 0.85); big.rotation.set(0.4, 0.6, 0.2); K.bigBall = big;
    box(1.1, 0.7, 1.1, ink, 3.6, 0.35, 4.6, 0.02); const pT2 = signTex(256, 64, c => { c.fillStyle = '#ffd23a'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('BALL No. 1', 128, 34); }); plane(1.0, 0.25, pT2, 3.6, 0.42, 5.16);
    collide(2.95, 3.95, 4.25, 5.25); K.looks.push({ p: P(3.6, 0, 5.8), name: 'BALL No. 1', line: 'The first ball off the line. Felt swears Ace served an ace with it.' });
    const canM = tm('#d7dde3'); for (let i = 0; i < 9; i++) { const cx = 0.4 + (i % 3) * 0.32, cz = 6.1, cy = 0.2 + Math.floor(i / 3) * 0.42; cyl(0.14, 0.14, 0.4, canM, cx, cy, cz, 12, 0.01); cyl(0.145, 0.145, 0.04, tm(COLOURS[COL_KEYS[i % 4]].col), cx, cy + 0.21, cz, 12, 0); }
    box(1.4, 0.15, 1.1, tm('#a8794a'), -1.9, 0.08, 5.7, 0.01); for (let i = 0; i < 4; i++) box(0.5, 0.42, 0.42, tm('#c9a26a'), -2.2 + (i % 2) * 0.55, 0.36 + Math.floor(i / 2) * 0.43, 5.7, 0.012);
    collide(0.1, 5.8, 1.3, 6.5); collide(-2.6, 5.15, -1.2, 6.3); }
  // the front door (players come in here when it is placed in a world)
  { const doorT = signTex(128, 256, c => { c.fillStyle = '#8a5a32'; c.fillRect(0, 0, 128, 256); c.fillStyle = '#bfe6ff'; c.fillRect(20, 24, 88, 90); c.fillStyle = '#ffd23a'; c.fillRect(96, 140, 14, 14); });
    const dr = plane(1.5, 2.7, doorT, 7.2, 1.35, D / 2 - 0.03, Math.PI, false); K.front.push(dr); K.door = P(7.2, 0, D / 2 - 1.0); K.spawn = P(7.2, 0, D / 2 - 1.6);
    K.looks.push({ p: P(7.2, 0, D / 2 - 0.9), name: 'EXIT', line: 'Out to Gaya.', exit: true }); }
  // lights: four hanging lamps (shades only, one shared light keeps it phone-cheap)
  for (const x of [-6, -2, 2, 6]) { const sh = M(new T3.ConeGeometry(0.4, 0.35, 16, 1, true), tm('#2f7a52'), x, 3.6, LZ + 0.4, root, 0.01, 0.4); K.cut.push(sh); const bulb = new T3.Mesh(new T3.SphereGeometry(0.1, 8, 6), new T3.MeshBasicMaterial({ color: 0xfff2c4 })); bulb.position.set(x, 3.45, LZ + 0.4); root.add(bulb); K.cut.push(bulb); K.cut.push(box(0.02, 1.4, 0.02, ink, x, 4.45, LZ + 0.4, 0)); }
  { const L = new T3.PointLight(0xfff0d0, 1.2, 26, 1.4); L.position.set(origin.x, 3.8, origin.z + 0.5); root.add(L); K.light = L; }
  // ================= POLISH PASS: light, floor paint, life =================
  const radial = (inner, outer) => CTX(128, 128, c => { const g = c.createRadialGradient(64, 64, 2, 64, 64, 64); g.addColorStop(0, inner); g.addColorStop(1, outer); c.fillStyle = g; c.fillRect(0, 0, 128, 128); });
  const glowT = radial('rgba(255,232,180,0.36)', 'rgba(255,232,180,0)');
  const decal = (tex, w, d, x, z, y = 0.012, add = true, rot = 0) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, d), new T3.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: add ? T3.AdditiveBlending : T3.NormalBlending })); m.rotation.x = -Math.PI / 2; m.rotation.z = rot; m.position.set(x, y, z); m.renderOrder = 1; root.add(m); return m; };
  // warm pools of light under every lamp + the walk area
  K.pools = [];
  for (const x of [-6, -2, 2, 6]) K.pools.push(decal(glowT, 4.2, 4.2, x, LZ + 0.8));
  for (const [x, z] of [[-6, 3.4], [-1.2, 3.8], [4.4, 3.8]]) { K.pools.push(decal(glowT, 4.6, 4.6, x, z)); const sh = M(new T3.ConeGeometry(0.42, 0.36, 16, 1, true), tm('#2f7a52'), x, 3.9, z, root, 0.01, 0.42); K.cut.push(sh); const bulb = new T3.Mesh(new T3.SphereGeometry(0.11, 8, 6), new T3.MeshBasicMaterial({ color: 0xfff2c4 })); bulb.position.set(x, 3.74, z); root.add(bulb); K.cut.push(bulb); K.cut.push(box(0.02, 1.2, 0.02, ink, x, 4.6, z, 0)); }
  // painted floor: big station numbers, hatched machine pads, green walkway with chevrons
  STATIONS.forEach((k, i) => { const nT = signTex(128, 128, c => { c.fillStyle = 'rgba(251,251,247,0.85)'; c.font = '900 110px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(i + 1), 64, 70); }); decal(nT, 0.75, 0.75, SX[k], LZ + 1.25, 0.011, false);
    const pT = signTex(256, 192, c => { c.clearRect(0, 0, 256, 192); c.save(); c.beginPath(); c.rect(0, 0, 256, 192); c.rect(14, 14, 228, 164); c.clip('evenodd'); for (let j = -20; j < 30; j++) { c.fillStyle = j % 2 ? '#201e1d' : '#ffd23a'; c.beginPath(); c.moveTo(j * 16, 0); c.lineTo(j * 16 + 16, 0); c.lineTo(j * 16 + 16 - 192, 192); c.lineTo(j * 16 - 192, 192); c.fill(); } c.restore(); c.fillStyle = 'rgba(32,30,29,0.10)'; c.fillRect(14, 14, 228, 164); });
    decal(pT, 2.9, 2.0, SX[k], LZ - 0.95, 0.009, false); });
  { const wT = signTex(512, 64, c => { c.fillStyle = 'rgba(47,122,82,0.55)'; c.fillRect(0, 0, 512, 64); c.fillStyle = 'rgba(251,251,247,0.8)'; for (let i = 0; i < 8; i++) { const x = 20 + i * 64; c.beginPath(); c.moveTo(x, 14); c.lineTo(x + 22, 32); c.lineTo(x, 50); c.lineTo(x + 10, 50); c.lineTo(x + 32, 32); c.lineTo(x + 10, 14); c.fill(); } }); wT.wrapS = T3.RepeatWrapping; wT.repeat.set(2.4, 1);
    const w = decal(wT, 15.5, 1.1, 0, 5.15, 0.01, false); w.rotation.z = Math.PI; }
  // belt end rollers + a ball chute at the start
  for (const ex of [-8.55, 8.55]) { const r = M(new T3.CylinderGeometry(0.1, 0.1, 0.72, 14), steel, ex, TOP - 0.05, LZ, root, 0.01, 0.1); r.rotation.x = Math.PI / 2; }
  // PRESS: hazard base, warning lamps, rubber pellets heaped in the hopper
  { const x = SX.press, hz = signTex(128, 32, c => { for (let i = -2; i < 10; i++) { c.fillStyle = i % 2 ? '#201e1d' : '#ffd23a'; c.beginPath(); c.moveTo(i * 16, 32); c.lineTo(i * 16 + 16, 32); c.lineTo(i * 16 + 32, 0); c.lineTo(i * 16 + 16, 0); c.fill(); } }); hz.wrapS = T3.RepeatWrapping; hz.repeat.set(3, 1);
    const band = new T3.Mesh(new T3.BoxGeometry(1.62, 0.1, 0.52), new T3.MeshBasicMaterial({ map: hz })); band.position.set(x, TOP + 1.72, LZ - 0.35); root.add(band);
    K.pressLamps = ['#22c55e', '#ec3013'].map((col, i) => { const m = new T3.Mesh(new T3.SphereGeometry(0.075, 12, 8), new T3.MeshBasicMaterial({ color: new T3.Color(col).multiplyScalar(0.35) })); m.position.set(x - 0.3 + i * 0.6, TOP + 2.05, LZ - 0.35); m.userData.on = new T3.Color(col); m.userData.off = new T3.Color(col).multiplyScalar(0.35); root.add(m); const cap = M(new T3.CylinderGeometry(0.06, 0.07, 0.04, 10), ink, m.position.x, TOP + 1.99, LZ - 0.35, root, 0); return m; });
    const pel = tm('#2a2a2e'); for (let i = 0; i < 18; i++) { const a = i * 2.4, r = 0.15 + (i % 6) * 0.08; const p = new T3.Mesh(new T3.SphereGeometry(0.07, 7, 5), pel); p.position.set(x - 1.55 + Math.cos(a) * r, 2.86 + (i % 3) * 0.04, LZ - 0.6 + Math.sin(a) * r); root.add(p); }
    for (const sx of [-1, 1]) { const piston = M(new T3.CylinderGeometry(0.05, 0.05, 0.9, 10), tm('#e8eef4'), x + sx * 0.42, TOP + 1.45, LZ - 0.12, root, 0.008, 0.05); } }
  // DYE: feed pipes into each vat + rising bubbles (the game animates K.bubbles)
  K.bubbles = []; { const mx = K.vats[0].x - origin.x, mz = K.vats[0].z - origin.z - 0.32, man = M(new T3.CylinderGeometry(0.06, 0.06, 2.4, 10), tm('#7d8a96'), SX.dye, 1.75, mz, root, 0.008, 0.06); man.rotation.z = Math.PI / 2; M(new T3.CylinderGeometry(0.06, 0.06, 1.75, 10), tm('#7d8a96'), SX.dye - 1.2, 0.87, mz, root, 0.008, 0.06); M(new T3.SphereGeometry(0.08, 10, 8), tm('#ffd23a'), SX.dye - 1.2, 1.75, mz, root, 0.008, 0.08); }
  K.vats.forEach(v => { const lx = v.x - origin.x, lz = v.z - origin.z; const p = M(new T3.CylinderGeometry(0.035, 0.035, 0.85, 8), tm('#7d8a96'), lx, 1.32, lz - 0.32, root, 0.006, 0.035); const e = M(new T3.CylinderGeometry(0.035, 0.035, 0.3, 8), tm('#7d8a96'), lx, 0.92, lz - 0.2, root, 0); e.rotation.x = 0.9;
    for (let i = 0; i < 3; i++) { const b = new T3.Mesh(new T3.SphereGeometry(0.035, 8, 6), new T3.MeshBasicMaterial({ color: new T3.Color(COLOURS[v.k].col).lerp(new T3.Color('#ffffff'), 0.5), transparent: true, opacity: 0.9 })); b.position.set(v.x - origin.x, v.y, v.z - origin.z); b.userData = { v, t: i * 0.6, dx: (i - 1) * 0.11 }; root.add(b); K.bubbles.push(b); } });
  // SEAM: thread spools on the stitcher (they spin while you trace)
  K.spools = []; { const x = SX.seam; for (const [sx, col] of [[-0.45, '#fbfbf7'], [0.45, '#c42d3c']]) { const s = new T3.Group(); s.position.set(x + sx, TOP + 0.6, LZ - 0.95); root.add(s); M(new T3.CylinderGeometry(0.1, 0.1, 0.2, 14), tm(col), 0, 0, 0, s, 0.008, 0.1); M(new T3.CylinderGeometry(0.13, 0.13, 0.03, 14), tm('#8a5a32'), 0, 0.11, 0, s, 0.006, 0.13); M(new T3.CylinderGeometry(0.13, 0.13, 0.03, 14), tm('#8a5a32'), 0, -0.11, 0, s, 0.006, 0.13); K.spools.push(s); } }
  // TEST: BOUNCE-O-METER light bar over the wall (the game lights it per catch)
  { const x = SX.test; box(1.5, 0.22, 0.12, ink, x, 3.0, LZ - 1.6, 0.01); K.meterLamps = [0, 1, 2, 3, 4].map(i => { const m = new T3.Mesh(new T3.CircleGeometry(0.075, 16), new T3.MeshBasicMaterial({ color: 0x3a3836 })); m.position.set(x - 0.56 + i * 0.28, 3.0, LZ - 1.53); root.add(m); return m; }); }
  // OFFICE: rug, desk lamp, nameplate, filing cabinet, trophy shelf, plants, water cooler
  { const rugT = signTex(256, 256, c => { c.fillStyle = '#2f7a52'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.strokeStyle = '#f2c94c'; c.lineWidth = 10; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.stroke(); c.strokeStyle = '#d4ef3a'; c.lineWidth = 14; c.beginPath(); seamPath(48).forEach(([u, v], i) => { const px = 128 + (u - 0.5) * 170, py = 128 + (v - 0.5) * 170; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke(); }); decal(rugT, 2.6, 2.6, -7.4, 2.7, 0.011, false);
    cyl(0.03, 0.09, 0.05, ink, -7.6, 0.92, 3.6, 10, 0); const arm = M(new T3.CylinderGeometry(0.015, 0.015, 0.4, 6), ink, -7.6, 1.12, 3.6, root, 0); const shade = M(new T3.ConeGeometry(0.13, 0.15, 12, 1, true), tm('#2f7a52'), -7.55, 1.32, 3.52, root, 0.006, 0.13); shade.rotation.x = 0.6;
    const npT = signTex(256, 64, c => { c.fillStyle = '#f2c94c'; c.fillRect(0, 0, 256, 64); c.fillStyle = '#201e1d'; c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('FELT · FOREMAN', 128, 34); }); plane(0.8, 0.2, npT, -8.2, 0.62, 3.81);
    box(0.6, 1.3, 0.55, tm('#6b7d93'), -9.55, 0.65, 4.6, 0.015); for (let i = 0; i < 3; i++) box(0.4, 0.03, 0.02, steel, -9.55 + 0.29, 0.3 + i * 0.4, 4.6, 0);
    box(0.25, 0.05, 2.0, tm('#8a5a32'), -9.86, 2.3, 2.0, 0.008); for (let i = 0; i < 3; i++) { const tx = 1.3 + i * 0.6; cyl(0.06, 0.04, 0.12, tm('#f2c94c'), -9.85, 2.4, tx, 10, 0.006); const cup = M(new T3.SphereGeometry(0.09, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), tm('#f2c94c'), -9.85, 2.55, tx, root, 0.006, 0.09); cup.rotation.x = Math.PI; }
    collide(-9.9, 4.25, -9.2, 4.95);
    const plant = (px, pz, s = 1) => { cyl(0.22 * s, 0.17 * s, 0.38 * s, tm('#c4523e'), px, 0.19 * s, pz, 12, 0.01); for (let i = 0; i < 5; i++) { const a = i * 1.26; M(new T3.SphereGeometry(0.2 * s, 10, 8), tm(i % 2 ? '#3f8a3a' : '#5aa83a'), px + Math.cos(a) * 0.12 * s, 0.55 * s + (i % 3) * 0.08 * s, pz + Math.sin(a) * 0.12 * s, root, 0.008, 0.2 * s); } collide(px - 0.3 * s, pz - 0.3 * s, px + 0.3 * s, pz + 0.3 * s); };
    plant(-9.4, 6.4); plant(9.4, -0.6, 0.9); plant(-9.4, -0.3, 0.9); plant(1.8, 6.4, 0.8);
    cyl(0.18, 0.18, 0.9, tm('#fbfbf7'), -9.5, 0.45, 1.0, 12, 0.01); cyl(0.15, 0.15, 0.45, new T3.MeshToonMaterial({ color: 0x7cc8e0, gradientMap: grad, transparent: true, opacity: 0.75 }), -9.5, 1.12, 1.0, 12, 0.01); collide(-9.75, 0.75, -9.25, 1.25); }
  // BREAK CORNER on the right wall: BALL-ADE vending machine + lockers by the door
  { const vT = signTex(256, 512, c => { c.fillStyle = '#c42d3c'; c.fillRect(0, 0, 256, 512); c.fillStyle = '#fbfbf7'; c.font = 'italic 900 52px Archivo, Arial'; c.textAlign = 'center'; c.fillText('BALL-ADE', 128, 70); c.fillStyle = '#1a2a3a'; c.fillRect(24, 100, 150, 330); for (let r = 0; r < 5; r++) for (let q = 0; q < 3; q++) { c.fillStyle = ['#d4ef3a', '#ff7eb6', '#5cc0f2', '#f2b632'][(r + q) % 4]; c.fillRect(36 + q * 46, 116 + r * 62, 30, 44); } c.fillStyle = '#ffd23a'; c.fillRect(190, 140, 44, 80); c.fillStyle = '#201e1d'; c.fillRect(190, 300, 44, 30); });
    box(0.8, 2.0, 0.75, tm('#c42d3c'), 9.55, 1.0, 1.6, 0.02); plane(0.7, 1.4, vT, 9.14, 1.15, 1.6, -Math.PI / 2); collide(9.1, 1.2, 10, 2.0);
    for (let i = 0; i < 4; i++) { box(0.5, 1.9, 0.5, tm(i % 2 ? '#2a7fb0' : '#2f7a52'), 9.7, 0.95, 3.0 + i * 0.52, 0.012); box(0.02, 0.2, 0.08, steel, 9.44, 1.1, 3.0 + i * 0.52, 0); } collide(9.4, 2.7, 10, 5.1);
    box(0.45, 0.45, 1.5, tm('#8a5a32'), 9.55, 0.25, -2.4, 0.015); collide(9.3, -3.2, 10, -1.6); }
  // posters + a clock on the walls
  { const poster = (draw, w, h, x, y, z, ry) => { const t = signTex(256, Math.round(256 * h / w), draw); const p = plane(w, h, t, x, y, z, ry); box(w + 0.08, h + 0.08, 0.03, ink, x, y, z, 0).position.set(x - Math.sin(ry) * 0.02, y, z - Math.cos(ry) * 0.02); return p; };
    poster(c => { c.fillStyle = '#1f4a34'; c.fillRect(0, 0, 256, 360); c.fillStyle = '#d4ef3a'; c.beginPath(); c.arc(128, 150, 70, 0, 7); c.fill(); c.strokeStyle = '#fbfbf7'; c.lineWidth = 8; c.beginPath(); c.arc(70, 150, 70, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(186, 150, 70, Math.PI - 0.9, Math.PI + 0.9); c.stroke(); c.fillStyle = '#f2c94c'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.fillText('THE GAYA', 128, 270); c.fillText('OPEN', 128, 315); }, 1.1, 1.55, 3.6, 2.6, -D / 2 + 0.04, 0);
    poster(c => { c.fillStyle = '#f2c94c'; c.fillRect(0, 0, 256, 300); c.fillStyle = '#201e1d'; c.font = '900 48px Archivo, Arial'; c.textAlign = 'center'; c.fillText('THINK', 128, 110); c.fillText('FUZZY', 128, 170); c.font = '700 22px Archivo, Arial'; c.fillText('every ball bounces', 128, 230); }, 1.0, 1.17, -W / 2 + 0.04, 2.3, -1.2, Math.PI / 2);
    poster(c => { c.fillStyle = '#2a7fb0'; c.fillRect(0, 0, 256, 300); c.fillStyle = '#fbfbf7'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.fillText('3 BALLS', 128, 110); c.fillText('A CAN', 128, 155); c.font = '700 22px Archivo, Arial'; c.fillText('no more, no less', 128, 215); }, 1.0, 1.17, W / 2 - 0.04, 2.4, -1.4, -Math.PI / 2);
    const cc = document.createElement('canvas'); cc.width = cc.height = 128; const ct = new T3.CanvasTexture(cc); ct.colorSpace = T3.SRGBColorSpace; const clock = new T3.Mesh(new T3.CircleGeometry(0.38, 28), new T3.MeshBasicMaterial({ map: ct })); clock.position.set(-6.2, 3.4, -D / 2 + 0.05); root.add(clock); M(new T3.TorusGeometry(0.38, 0.04, 6, 28), ink, -6.2, 3.4, -D / 2 + 0.06, root, 0);
    K.clock = { canvas: cc, tex: ct }; }
  // crates of finished balls by the dock + bunting on the side walls
  { const crate = (x, z, col) => { box(0.7, 0.45, 0.55, tm('#a8794a'), x, 0.23, z, 0.012); const bm = new T3.MeshToonMaterial({ map: ballTexture(T3, col, true), gradientMap: grad }); for (let i = 0; i < 6; i++) { const b = new T3.Mesh(new T3.SphereGeometry(0.1, 12, 8), bm); b.position.set(x - 0.2 + (i % 3) * 0.2, 0.5, z - 0.1 + Math.floor(i / 3) * 0.2); b.rotation.set(i, i * 2, 0); root.add(b); } collide(x - 0.4, z - 0.32, x + 0.4, z + 0.32); };
    crate(8.9, -5.9, COLOURS.yellow.col); crate(8.9, -5.2, COLOURS.pink.col); crate(3.6, -6.3, COLOURS.gold.col);
    for (const [wx, ry] of [[-W / 2 + 0.06, Math.PI / 2], [W / 2 - 0.06, -Math.PI / 2]]) for (let i = 0; i < 12; i++) { const tri = new T3.Mesh(new T3.CircleGeometry(0.16, 3), new T3.MeshBasicMaterial({ color: ['#d4ef3a', '#f2c94c', '#2f7a52', '#ff7eb6'][i % 4], side: T3.DoubleSide })); tri.position.set(wx, 3.15 - Math.sin(i / 11 * Math.PI) * 0.25, -5.5 + i); tri.rotation.set(0, ry, -Math.PI / 2); root.add(tri); } }
  // soft dust motes floating in the lamp light (animated by the game)
  { const mT = radial('rgba(255,248,220,0.9)', 'rgba(255,248,220,0)'), N = 40, pos = new Float32Array(N * 3), base = []; for (let i = 0; i < N; i++) { base.push([origin.x + (Math.random() - 0.5) * 17, 0.6 + Math.random() * 2.8, origin.z + (Math.random() - 0.3) * 10, Math.random() * 6]); }
    const geo = new T3.BufferGeometry(); geo.setAttribute('position', new T3.BufferAttribute(pos, 3)); const pts = new T3.Points(geo, new T3.PointsMaterial({ map: mT, size: 0.09, transparent: true, depthWrite: false, opacity: 0.55, blending: T3.AdditiveBlending, sizeAttenuation: true })); pts.frustumCulled = false; scene.add(pts); K.motes = { pts, base, pos }; }
  K.merged = mergeStatic(T3, root, [...K.cut, ...K.front, K.pressHead, K.basket, K.needle, K.pump, K.bigBall, ...K.vats.map(v => v.lid), ...K.spools, ...K.bubbles, ...(K.pressLamps || []), ...(K.meterLamps || [])]);
  return K;
}



// ---------- idle life for the interior (belts, bubbles, dust, clock, BALL No. 1). A world calls this every frame while the player is inside ----------
export function tickFactory(K, dt, { busy = false } = {}) { const TAU = Math.PI * 2;
  K.belts.forEach(t => t.offset.x -= dt * (busy ? 0.9 : 0.5));
    K.bubbles.forEach(b => { const u = b.userData; u.t += dt * 0.9; const k = u.t % 1.2; b.visible = k < 1; b.position.y = u.v.y + 0.01 + k * 0.06; b.position.x = u.v.x - K.origin.x + u.dx + Math.sin(u.t * 5) * 0.015; b.scale.setScalar(0.6 + k * 0.7); b.material.opacity = 1 - k; });
    { const Mo = K.motes; Mo.base.forEach((b, i) => { b[3] += dt * 0.4; Mo.pos[i * 3] = b[0] + Math.sin(b[3] * 0.7) * 0.3; Mo.pos[i * 3 + 1] = b[1] + Math.sin(b[3]) * 0.25; Mo.pos[i * 3 + 2] = b[2]; }); Mo.pts.geometry.attributes.position.needsUpdate = true; }
    if ((K._clockT = (K._clockT || 0) - dt) <= 0) { K._clockT = 1; const c = K.clock.canvas.getContext('2d'), d = new Date(), hh = d.getHours() % 12 + d.getMinutes() / 60, mm = d.getMinutes() + d.getSeconds() / 60; c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#201e1d'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.fillRect(64 + Math.cos(a) * 52 - 3, 64 + Math.sin(a) * 52 - 3, 6, 6); } const hnd = (a, L, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.beginPath(); c.moveTo(64, 64); c.lineTo(64 + Math.sin(a) * L, 64 - Math.cos(a) * L); c.stroke(); }; hnd(hh / 12 * TAU, 30, 7, '#201e1d'); hnd(mm / 60 * TAU, 46, 4, '#201e1d'); hnd(d.getSeconds() / 60 * TAU, 48, 2, '#ec3013'); K.clock.tex.needsUpdate = true; }
  K.bigBall.rotation.y += dt * 0.25; if (!busy) K.spools.forEach((sp, i) => sp.rotation.y += dt * 0.3 * (i ? -1 : 1)); }

// ---------- phone budget: merge every static mesh that shares a material into one draw call ----------
export function mergeStatic(T3, root, skipList = []) {
  const skip = new Set(); skipList.forEach(o => o && o.traverse(c => skip.add(c)));
  const count = new Map(); root.traverse(o => { if (o.isMesh && !skip.has(o) && !o.material.transparent && !Array.isArray(o.material)) count.set(o.material, (count.get(o.material) || 0) + 1); });
  const ok = o => o.isMesh && !skip.has(o) && !Array.isArray(o.material) && !o.material.transparent && count.get(o.material) > 1;
  const cands = []; root.traverse(o => { if (!ok(o)) return; let all = true; o.traverse(c => { if (c !== o && !ok(c)) all = false; }); if (all) cands.push(o); });
  root.updateMatrixWorld(true); const inv = root.matrixWorld.clone().invert(), groups = new Map(), m4 = new T3.Matrix4(), nm = new T3.Matrix3();
  const seen = new Set(); cands.forEach(o => o.traverse(c => { if (seen.has(c) || !c.isMesh) return; seen.add(c); const g = groups.get(c.material) || []; g.push(c); groups.set(c.material, g); }));
  let merged = 0;
  for (const [mat, list] of groups) { if (list.length < 2) continue; const useUv = !!mat.map; let n = 0; const parts = list.map(c => { let g = c.geometry.index ? c.geometry.toNonIndexed() : c.geometry.clone(); m4.multiplyMatrices(inv, c.matrixWorld); g.applyMatrix4(m4); n += g.attributes.position.count; return g; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = useUv ? new Float32Array(n * 2) : null; let k = 0;
    for (const g of parts) { const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv; pos.set(P.array.subarray(0, P.count * 3), k * 3); if (N) nor.set(N.array.subarray(0, P.count * 3), k * 3); if (uv && U) uv.set(U.array.subarray(0, P.count * 2), k * 2); k += P.count; g.dispose(); }
    const geo = new T3.BufferGeometry(); geo.setAttribute('position', new T3.BufferAttribute(pos, 3)); geo.setAttribute('normal', new T3.BufferAttribute(nor, 3)); if (uv) geo.setAttribute('uv', new T3.BufferAttribute(uv, 2)); geo.computeBoundingSphere();
    const mesh = new T3.Mesh(geo, mat); mesh.castShadow = mesh.receiveShadow = mat.side !== T3.BackSide; mesh.userData.merged = list.length; root.add(mesh); merged += list.length; }
  cands.forEach(o => { if (groups.get(o.material) && groups.get(o.material).length > 1) o.parent && o.parent.remove(o); });
  return merged; }

// ---------- THE GAME (stand-alone page, or call from a world once the interior is placed) ----------
export async function createBallFactory({ container, onState = () => {}, onExit = null } = {}) {
  const ST = createStage(container, { bg: '#dcd4c2' }), { CW, CHh, renderer, scene, camera, V3, toon, M, kit, audio, puff, smokeS, sun, grad } = ST;
  const SND = createBallworksAudio(), tone = () => {}; // all sound goes through SND (old synth beeps are silenced)
  camera.far = 90; camera.updateProjectionMatrix();
  sun.position.set(5, 14, 9); Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 10, bottom: -10, far: 40 }); sun.shadow.camera.updateProjectionMatrix();
  const K = buildFactory({ THREE, M, toon, canvasTex, scene, origin: { x: 0, z: 0 }, grad });
  const { SAFE, shotFor, setSafe } = cameraFit(ST), RINGS = hintRings(ST);
  const LZ = K.lineZ, TOP = K.top, BR = 0.105, TAU = Math.PI * 2;
  const upg = id => !!save.stat(SK.upg + id, 0);
  const buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const ballMat = (col, seam) => new THREE.MeshToonMaterial({ map: ballTexture(THREE, col, seam), gradientMap: grad });
  const ballGeo = new THREE.SphereGeometry(BR, 18, 12);
  const newBall = (col = '#2f2d30') => { const m = new THREE.Mesh(ballGeo, col.isMaterial ? col : toon(col)); m.castShadow = true; ST.addOutline(m, 0.01, BR); scene.add(m); return m; };

  // ---------- the cast ----------
  const crestTex = canvasTex(256, 256, c => { c.fillStyle = '#2f7a52'; c.beginPath(); c.arc(128, 128, 126, 0, 7); c.fill(); c.fillStyle = '#f2c94c'; c.beginPath(); c.arc(128, 128, 112, 0, 7); c.fill(); c.fillStyle = '#d4ef3a'; c.beginPath(); c.arc(128, 128, 96, 0, 7); c.fill();
    c.strokeStyle = '#fbfbf7'; c.lineWidth = 14; c.lineCap = 'round'; c.beginPath(); seamPath(64).forEach(([u, v], i) => { const x = 128 + (u - 0.5) * 190, y = 128 + (v - 0.5) * 190; i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.stroke(); });
  const benWalk = kit.makeFox({ ...CAST.player, gear: 'none', mood: 'happy' });
  const benWork = kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#2f7a52'], crest: '', gear: 'none', mood: 'happy' });
  for (const f of [benWalk, benWork]) { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; }
  dinerUniform(ST, benWork, { print: crestTex, stripe: '#2f7a52', towelCol: '#d4ef3a', printY: 1.17 });
  const felt = kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: FELT.fur, furDark: FELT.furDark }, torso: FELT.torso, outfit: FELT.outfit, crest: '', gear: 'none', mood: FELT.mood });
  felt.position.copy(K.office); felt.rotation.y = 0.5;
  const custFox = CUSTOMERS.map(cu => { const f = kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' }); const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.visible = false; return f; });

  // ---------- props the game animates ----------
  const canGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.5, 20, 1, true), canMat = new THREE.MeshToonMaterial({ color: 0xdfe6ee, gradientMap: grad, transparent: true, opacity: 0.38, side: THREE.DoubleSide, depthWrite: false });
  function makeCan() { const g = new THREE.Group(); const body = new THREE.Mesh(canGeo, canMat); body.position.y = 0.25; g.add(body); const base = new THREE.Mesh(new THREE.CylinderGeometry(0.152, 0.152, 0.03, 20), toon('#b8c2cc')); base.position.y = 0.015; ST.addOutline(base, 0.006, 0.152); g.add(base);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.012, 6, 20), toon('#7d8a96')); rim.rotation.x = Math.PI / 2; rim.position.y = 0.5; g.add(rim);
    const lid = new THREE.Group(); const lm = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.165, 0.05, 20), toon('#2f7a52')); ST.addOutline(lm, 0.008, 0.165); lid.add(lm); const tab = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 0.05), toon('#f2c94c')); tab.position.y = 0.04; lid.add(tab); lid.position.y = 0.95; lid.visible = false; g.add(lid); g.userData.lid = lid;
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.154, 0.154, 0.24, 24, 1, true), toon('#d4ef3a')); band.position.y = 0.27; band.visible = false; g.add(band); g.userData.band = band; scene.add(g); return g; }
  const _labels = {}; function labelMat(k) { if (_labels[k]) return _labels[k]; const C = COLOURS[k]; const t = canvasTex(256, 64, c => { c.fillStyle = '#1f4a34'; c.fillRect(0, 0, 256, 64); c.fillStyle = C.col; c.fillRect(0, 50, 256, 14); c.fillRect(0, 0, 256, 6); c.fillStyle = C.col; c.beginPath(); c.arc(28, 28, 18, 0, 7); c.fill(); c.strokeStyle = '#fbfbf7'; c.lineWidth = 3; c.beginPath(); c.arc(16, 28, 16, -0.8, 0.8); c.stroke(); c.beginPath(); c.arc(40, 28, 16, Math.PI - 0.8, Math.PI + 0.8); c.stroke(); c.fillStyle = '#fbfbf7'; c.font = 'italic 900 30px Archivo, Arial'; c.textBaseline = 'middle'; c.fillText("FELT'S", 56, 26); c.font = '800 14px Archivo, Arial'; c.fillStyle = C.col; c.fillText(C.short + ' · 3 BALLS', 160, 30); }); t.wrapS = THREE.RepeatWrapping; t.repeat.set(2, 1); return (_labels[k] = new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); }
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthTest: false, side: THREE.DoubleSide });
  const catchRing = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.19, 32), ringMat); catchRing.renderOrder = 40; catchRing.visible = false; scene.add(catchRing);
  const catchCore = new THREE.Mesh(new THREE.RingGeometry(0.115, 0.135, 32), ringMat.clone()); catchCore.renderOrder = 40; catchCore.visible = false; scene.add(catchCore);
  const hand = (() => { const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color: 0xfbfbf7, depthTest: false }), o = new THREE.MeshBasicMaterial({ color: 0x201e1d, depthTest: false, side: THREE.BackSide });
    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), m); palm.scale.set(1, 1.2, 0.7); const po = new THREE.Mesh(palm.geometry, o); po.scale.setScalar(1.18); palm.add(po);
    const fin = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.11, 4, 8), m); fin.position.set(0, -0.15, 0); const fo = new THREE.Mesh(fin.geometry, o); fo.scale.setScalar(1.3); fin.add(fo); g.add(palm, fin); g.traverse(x => x.renderOrder = x.material === o ? 44 : 45); g.visible = false; scene.add(g); return g; })();
  const ambient = []; for (let i = 0; i < 7; i++) { const m = newBall(ballMat(COLOURS[COL_KEYS[i % 4]].col, true)); ambient.push({ m, x: -6.4 + i * 2.1 }); }


  // ---------- FX: sparkles, droplets, confetti, wall impact ring, soft blob shadows (phones have no real shadows) ----------
  const fxTex = { star: canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); c.fillStyle = '#fff'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r = i % 2 ? 7 : 31; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.closePath(); c.fill(); }),
    dot: canvasTex(32, 32, c => { c.clearRect(0, 0, 32, 32); c.fillStyle = '#fff'; c.beginPath(); c.arc(16, 16, 14, 0, 7); c.fill(); }), sq: canvasTex(16, 16, c => { c.fillStyle = '#fff'; c.fillRect(0, 0, 16, 16); }) };
  const FXP = []; for (let i = 0; i < 90; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: fxTex.dot, transparent: true, depthWrite: false, depthTest: false })); sp.visible = false; sp.renderOrder = 35; scene.add(sp); FXP.push({ s: sp, life: 0, v: V3(), g: 0, spin: 0, size: 0.05, dec: 1 }); } let fxI = 0;
  function burst(kind, p, n = 10, col = '#ffd23a', spd = 1.6) { const cols = Array.isArray(col) ? col : [col]; for (let i = 0; i < n; i++) { const P = FXP[fxI = (fxI + 1) % FXP.length]; P.s.material.map = fxTex[kind === 'confetti' ? 'sq' : kind === 'spark' ? 'star' : 'dot']; P.s.material.color.set(cols[i % cols.length]); P.s.position.copy(p); const a = Math.random() * TAU, up = rr(0.4, 1);
      P.v.set(Math.cos(a) * spd * rr(0.3, 1), up * spd * (kind === 'confetti' ? 1.7 : 1.1), Math.sin(a) * spd * rr(0.3, 1)); P.g = kind === 'spark' ? 1.2 : kind === 'confetti' ? 3.0 : 5.5; P.dec = kind === 'confetti' ? 0.5 : kind === 'spark' ? 1.3 : 1.7; P.size = kind === 'confetti' ? 0.075 : kind === 'spark' ? rr(0.09, 0.16) : rr(0.035, 0.065); P.life = 1; P.s.visible = true; P.s.material.rotation = Math.random() * 6; P.spin = rr(-7, 7); } }
  function fxStep(dt) { for (const P of FXP) { if (P.life <= 0) continue; P.life -= dt * P.dec; if (P.life <= 0) { P.s.visible = false; continue; } P.v.y -= P.g * dt; P.s.position.addScaledVector(P.v, dt); P.s.material.opacity = Math.min(1, P.life * 1.6); P.s.material.rotation += P.spin * dt; P.s.scale.setScalar(P.size * (0.6 + P.life * 0.6)); } }
  const impact = new THREE.Mesh(new THREE.RingGeometry(0.1, 0.16, 28), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); impact.position.copy(K.testWall).add(V3(0, 0, 0.03)); impact.visible = false; scene.add(impact); let impactT = 0, impactCol = 0xffd23a;
  const blobT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 32); g.addColorStop(0, 'rgba(20,16,12,0.42)'); g.addColorStop(1, 'rgba(20,16,12,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blob = (f, r = 0.62) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.renderOrder = 2; f.add(m); };
  [benWalk, benWork, felt, ...custFox].forEach(f => blob(f));
  scene.fog = new THREE.Fog(0xdcd4c2, 22, 48);
  let meterN = 0, meterT = 0;
  // ---------- state ----------
  const S = { phase: 'intro', day: Math.max(1, save.stat(SK.day, 1)), t: 0, focus: 'all', userFocusT: 0, autoT: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 2, flash: null, flashT: 0, say: '', sayT: 0, react: null, reactT: 0, done: null, demo: false, dlg: null, toast: null, toastT: 0, sel: null, seq: 0, glideT: 0 };
  const slot = { press: null, dye: null, seam: null, test: null };
  const batches = [], rack = { yellow: [], pink: [], gold: [], sky: [] }, outCans = [], orders = [];
  const PR = { hold: false, v: 0, anim: 0, last: null };
  const DYE = { drag: false, dunk: null };
  const SEAM = { path: seamPath(96), prog: 0, dev: 0, n: 0, stroke: false, warned: false, dirty: true };
  const TEST = { b: null, st: 'idle', t: 0, from: null };
  const CAN = { g: makeCan(), balls: [], col: null, p: 0, st: 'fill', twist: 0, popT: 0, slide: 0 };
  CAN.g.position.copy(K.canAt);
  const WALK = { x: K.spawn.x, z: K.spawn.z, yaw: Math.PI, mv: 0, camYaw: 0, camDist: 1, stick: { x: 0, y: 0 } };
  const keys = new Set(); let G = null, PAUSE = false, raf = 0;
  const availCols = () => COL_KEYS.filter(k => COLOURS[k].day <= S.day);

  function flash(txt, col = '#ffd23a', dur = 1.3) { S.flash = { txt, col }; S.flashT = dur; if (col === '#ec3013' && S.phase === 'shift') sfx('error', null, 0.6); }
  function sfx(name, at, vol = 1, rate = 1) { let pan = 0; if (at) { const v = at.clone().project(camera); pan = clamp(v.x, -1, 1) * 0.55; } SND.play(name, { vol, rate: rate * (0.97 + Math.random() * 0.06), pan }); }
  function combo(ok) { if (S.phase !== 'shift') return; if (!ok) { if (S.combo >= 3) flash('COMBO ENDS · ×' + S.combo, '#ffffff', 1); S.combo = 0; return; } S.combo = (S.combo || 0) + 1; S.comboBest = Math.max(S.comboBest || 0, S.combo);
    if (S.combo >= 3) { const bonus = Math.min(4, S.combo - 2); S.tips += bonus; S.comboGold = (S.comboGold || 0) + bonus; setTimeout(() => flash('PERFECT ×' + S.combo + ' · +' + bonus + 'g BONUS', '#22c55e', 1.2), 650); SND.play('sparkle', { vol: 0.35, rate: 1 + Math.min(0.5, S.combo * 0.05), delay: 0.5 }); } }
  function say(t, dur = 3.5) { S.say = t; S.sayT = dur; }
  function toast(t, dur = 4) { S.toast = t; S.toastT = dur; }

  // ---------- screen helpers ----------
  const scl = () => clamp(Math.min(CW(), CHh()) / 400, 0.85, 1.7), RAD = () => 34 * scl();
  const _v = V3(); const scr = p => { _v.copy(p).project(camera); return { x: (_v.x + 1) / 2 * CW(), y: (1 - _v.y) / 2 * CHh(), z: _v.z }; };
  const dist2 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const ray = new THREE.Raycaster(), _pl = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), _hit = V3();
  function onPlane(x, y, h) { ray.setFromCamera({ x: x / CW() * 2 - 1, y: -(y / CHh()) * 2 + 1 }, camera); _pl.constant = -h; return ray.ray.intersectPlane(_pl, _hit) ? _hit.clone() : null; }
  const seamWorld = i => { const [u, v] = SEAM.path[Math.min(i, SEAM.path.length - 1)]; K.seam.board.updateMatrixWorld(); return K.seam.board.localToWorld(V3((u - 0.5) * K.seam.size, (0.5 - v) * K.seam.size, 0.004)); };

  // ---------- cameras ----------
  const CAM = { look: V3(0, 1.2, 0) };
  const port = () => CW() < CHh();
  const stationPts = id => { const s = K.st[id], x = s ? s.x : 0, P = (a, b, c) => V3(a, b, c);
    if (id === 'press') return [P(x - 1.7, TOP + 1.8, LZ - 0.6), P(x + 0.85, TOP + 2.0, LZ - 0.35), P(x - 0.9, TOP, LZ + 0.4), P(x + 0.9, TOP, LZ + 0.4)];
    if (id === 'dye') return [P(x - 1.45, 0.95, LZ - 1.3), P(x + 1.45, 0.95, LZ - 1.3), P(x - 1.2, TOP + 1.0, LZ + 0.1), P(x + 1.2, TOP, LZ + 0.4)];
    if (id === 'seam') return [[-0.62, -0.62], [0.62, -0.62], [-0.62, 0.62], [0.62, 0.62]].map(([a, b]) => { K.seam.board.updateMatrixWorld(); return K.seam.board.localToWorld(V3(a, b, 0)); });
    if (id === 'test') return [P(x - 1.3, 1.0, LZ - 0.6), P(x + 1.2, TOP + 0.1, LZ - 0.5), P(x, 2.95, LZ - 1.5), P(x, TOP + 0.1, LZ + 0.35), P(x, TOP + 1.3, LZ - 0.2)];
    if (id === 'can') return [P(x - 1.0, TOP, LZ - 1.2), P(x + 1.6, TOP + 0.4, LZ - 0.5), P(x - 0.9, TOP, LZ + 0.2), P(x + 0.8, TOP + 1.25, LZ - 0.7), P(x + 1.6, TOP + 0.9, LZ - 1.1)];
    return [P(-8.6, TOP, LZ + 0.6), P(8.6, TOP, LZ + 0.6), P(-8.6, 2.6, LZ - 1.2), P(8.6, 2.4, LZ - 1.5), ...K.dock.map(d => P(d.x, 2.2, d.z))]; };
  const workShot = (id = S.focus) => shotFor('w:' + id, () => stationPts(id), port() ? (id === 'all' ? 1.0 : id === 'can' ? 1.05 : 0.98) : (id === 'all' ? 0.72 : id === 'can' ? 0.9 : 0.78), Math.PI, id === 'all' ? 0.03 : 0.05);
  const introShot = () => { const b = benWork.position, f = felt.position; return shotFor('intro', () => [V3(b.x - 0.5, 0.05, b.z), V3(b.x + 0.5, 0.05, b.z), V3(b.x, 2.35, b.z), V3(f.x - 0.4, 2.2, f.z), V3(f.x + 0.4, 0.05, f.z)], 0.12, Math.PI - 0.35, 0.06); };
  function walkShot() { const d = (port() ? 8.4 : 7.0) * WALK.camDist, h = (port() ? 6.2 : 4.6) * WALK.camDist, cy = WALK.camYaw, tx = WALK.x, tz = WALK.z;
    const pos = V3(tx + Math.sin(cy) * d, h, tz + Math.cos(cy) * d); pos.x = clamp(pos.x, -9.3, 9.3); pos.z = clamp(pos.z, -6.3, 15); return { pos, look: V3(tx, 1.1, tz - (port() ? 0.4 : 0)) }; }

  // ---------- batches on the belt ----------
  function stationBallPos(b, i, n, x) { return V3(x + (i - (n - 1) / 2) * 0.24, TOP + BR + 0.01, LZ); }
  function pressRelease() { if (!PR.hold) return; PR.hold = false; const v = PR.v; PR.v = 0;
    const zone = v < 0.5 ? 'SOFT' : v < 0.72 ? 'GOOD' : v <= 0.9 ? 'PERFECT' : v <= 1.02 ? 'GOOD' : 'FLAT';
    const pq = { SOFT: 0.45, GOOD: 0.78, PERFECT: 1, FLAT: 0.2 }[zone], dead = { SOFT: 0.45, GOOD: 0.12, PERFECT: 0, FLAT: 0.7 }[zone];
    const n = upg('mould') ? 4 : 3, b = { id: ++S.seq, n, stage: 'press', x: K.st.press.x, ready: false, arrived: true, col: null, pq, balls: [] };
    for (let i = 0; i < n; i++) { const isDead = S.demo ? (DM.deadNext && i === 1) : Math.random() < dead; const m = newBall(); m.position.copy(stationBallPos(b, i, n, b.x)); m.scale.set(1, zone === 'FLAT' ? 0.55 : 1, 1); b.balls.push({ m, dead: isDead, pq, sq: 0, tq: 0, where: 'belt' }); }
    if (S.demo) DM.deadNext = false;
    batches.push(b); slot.press = b; PR.anim = 1; PR.last = zone;
    flash(zone === 'PERFECT' ? 'PERFECT PRESS · ' + n + ' CORES' : zone === 'FLAT' ? 'SQUASHED FLAT!' : zone === 'SOFT' ? 'TOO SOFT · SOME MAY BE DEAD' : 'GOOD PRESS · ' + n + ' CORES', zone === 'PERFECT' ? '#22c55e' : zone === 'GOOD' ? '#ffd23a' : '#ec3013');
    sfx('thunk', K.mould.getWorldPosition(V3()), 1, zone === 'FLAT' ? 0.85 : 1); S.shake = zone === 'FLAT' ? 1 : 0.6; if (zone === 'FLAT') sfx('squish', null, 0.8); if (zone === 'PERFECT') { sfx('sparkle', null, 0.5); combo(true); } else combo(false);
    if (zone === 'PERFECT') burst('spark', V3(K.st.press.x, TOP + 0.4, LZ + 0.1), 16, ['#ffd23a', '#fbfbf7', '#d4ef3a'], 1.8); else if (zone === 'FLAT') burst('dot', V3(K.st.press.x, TOP + 0.3, LZ + 0.1), 12, '#3a3836', 1.6); tone(zone === 'PERFECT' ? 880 : 440, 0.15, 0.06, 'square'); audio.burst && audio.burst(0.3, 900, 0.18); puff(K.st.press.x, TOP + 0.35, LZ, 0xffffff, 4); buzz(zone === 'PERFECT' ? [20, 40, 20] : 30);
    b.ready = true; done('press'); }
  const NEXT = { press: 'dye', dye: 'seam', seam: 'test', test: null };
  function moveBatches(dt) { for (const b of batches) {
      if (b.ready && NEXT[b.stage] && !slot[NEXT[b.stage]]) { if (b.stage === 'seam') SEAM.dirty = true; slot[b.stage] = null; b.stage = NEXT[b.stage]; slot[b.stage] = b; b.ready = false; b.arrived = false; if (b.stage === 'seam') { SEAM.last = null; SEAM.prog = 0; SEAM.dev = 0; SEAM.n = 0; SEAM.stroke = false; SEAM.warned = false; SEAM.dirty = true; } }
      const tx = K.st[b.stage].x; if (!b.arrived) { b.x = Math.min(tx, b.x + dt * 2.6); if (b.x >= tx - 0.001) { b.arrived = true; onArrive(b); } }
      if (b.stage === 'dye' && b.arrived && (DYE.drag || DYE.dunk)) continue;
      b.balls.forEach((bl, i) => { if (bl.where === 'belt') { const p = stationBallPos(b, i, b.n, b.x); bl.m.position.lerp(p, Math.min(1, dt * 14)); bl.m.rotation.z -= dt * (b.arrived ? 0 : 12); } }); } }
  function onArrive(b) { if (b.stage === 'seam') SEAM.dirty = true; if (b.stage === 'dye') b.balls.forEach(bl => bl.where = 'basket'); if (b.stage === 'test') { b.balls.forEach((bl, i) => { bl.where = 'tray'; bl.trayI = i; }); b.testI = 0; } }
  function done(st) { S.autoT = 0.75; S.autoFrom = st; }

  // ---------- DYE ----------
  const dyeReady = () => { const b = slot.dye; return b && b.arrived && !b.ready && !DYE.dunk; };
  function basketTo(p, dt, k = 16) { K.basket.position.lerp(p, Math.min(1, dt * k)); }
  function dyeDragTo(x, y) { const h = onPlane(x, y, TOP + 0.75); if (!h) return; const v0 = K.vats[0], v3 = K.vats[3];
    DYE.target = V3(clamp(h.x, v0.x - 0.25, v3.x + 0.25), TOP + 0.75, clamp(h.z, v0.z, LZ)); }
  function nearestVat(p) { let best = null, bd = 9; for (const v of K.vats) { const d = Math.hypot(p.x - v.x, (p.z - v.z) * 0.8); if (d < bd) { bd = d; best = v; } } return bd < 0.38 ? best : null; }
  function dyeDrop() { DYE.drag = false; const v = nearestVat(K.basket.position); if (!v) { DYE.target = null; return; }
    if (COLOURS[v.k].day > S.day) { flash(COLOURS[v.k].short + ' OPENS ON DAY ' + COLOURS[v.k].day, '#ffffff'); DYE.target = null; return; }
    DYE.dunk = { v, t: 0 }; DYE.target = null; sfx('whoosh', null, 0.4, 0.8); }
  function dyeStep(dt) { const b = slot.dye;
    if (DYE.dunk) { const D = DYE.dunk, v = D.v; D.t += dt; const over = V3(v.x, TOP + 0.75, v.z), down = V3(v.x, 0.86, v.z);
      if (D.t < 0.25) basketTo(over, dt, 14); else if (D.t < 0.6) basketTo(down, dt, 12); else if (D.t < 0.95) { if (!D.splash) { D.splash = true; puff(v.x, 1.0, v.z, new THREE.Color(COLOURS[v.k].col).getHex(), 6); burst('dot', V3(v.x, 0.95, v.z), 18, [COLOURS[v.k].col, COLOURS[v.k].dark], 2.0); sfx('splash', V3(v.x, 1, v.z)); audio.burst && audio.burst(0.35, 1400, 0.2); tone(196, 0.25, 0.05, 'sine'); buzz(25); b && b.balls.forEach(bl => { bl.m.material = ballMat(COLOURS[v.k].col, false); }); if (b) b.col = v.k; } basketTo(down, dt, 12); }
      else if (D.t < 1.35) basketTo(over, dt, 10); else { basketTo(K.basketHome, dt, 10); if (K.basket.position.distanceTo(K.basketHome) < 0.05) { DYE.dunk = null; if (b) { b.balls.forEach(bl => bl.where = 'belt'); b.ready = true; flash(COLOURS[b.col].name, COLOURS[b.col].col); done('dye'); } } } }
    else if (DYE.drag && DYE.target) basketTo(DYE.target, dt, 18); else if (!DYE.drag) basketTo(K.basketHome, dt, 8);
    if (b && b.arrived) b.balls.forEach((bl, i) => { if (bl.where !== 'basket') return; const a = i / b.n * TAU; bl.m.position.set(K.basket.position.x + Math.cos(a) * 0.09, K.basket.position.y - 0.03 + (i > 2 ? 0.12 : 0), K.basket.position.z + Math.sin(a) * 0.09); });
    K.basketCable.scale.y = 1; for (const v of K.vats) { const avail = COLOURS[v.k].day <= S.day; v.lid.visible = !avail; } }

  // ---------- SEAM ----------
  const seamReady = () => { const b = slot.seam; return b && b.arrived && !b.ready; };
  function drawSeam() { const live = slot.seam && slot.seam.arrived ? slot.seam : null, b = live || (SEAM.last ? { col: SEAM.last, arrived: true, done: true } : null), c = K.seam.canvas.getContext('2d'), Wd = 512, col = b && b.col ? COLOURS[b.col] : null; if (b && b.done) SEAM.prog = SEAM.path.length - 1;
    c.fillStyle = col ? col.col : '#3a3836'; c.fillRect(0, 0, Wd, Wd); c.globalAlpha = 0.14; for (let i = 0; i < 1500; i++) { c.fillStyle = (i * 7919) % 2 ? '#fff' : '#000'; c.fillRect((i * 97) % Wd, (i * 191) % Wd, 2, 2); } c.globalAlpha = 1;
    if (!b || !b.arrived) { c.fillStyle = '#2f7a52'; c.fillRect(0, 0, Wd, Wd); c.strokeStyle = 'rgba(251,251,247,0.18)'; c.lineWidth = 30; c.lineCap = 'round'; c.beginPath(); SEAM.path.forEach(([u, v], i) => i ? c.lineTo(u * Wd, v * Wd) : c.moveTo(u * Wd, v * Wd)); c.stroke(); c.fillStyle = '#f2c94c'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.fillText('SEAM STITCHER', 256, 64); c.fillStyle = 'rgba(251,251,247,0.75)'; c.font = '800 30px Archivo, Arial'; c.fillText('waiting for felt…', 256, 480); K.seam.tex.needsUpdate = true; return; }
    const P = SEAM.path, X = u => u * Wd, guideW = upg('guide') ? 40 : 28; c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = 'rgba(32,30,29,0.28)'; c.lineWidth = guideW + 10; c.beginPath(); P.forEach(([u, v], i) => i ? c.lineTo(X(u), X(v)) : c.moveTo(X(u), X(v))); c.stroke();
    c.strokeStyle = 'rgba(251,251,247,0.85)'; c.lineWidth = 7; c.setLineDash([18, 16]); c.beginPath(); P.forEach(([u, v], i) => i ? c.lineTo(X(u), X(v)) : c.moveTo(X(u), X(v))); c.stroke(); c.setLineDash([]);
    if (SEAM.prog > 0) { c.strokeStyle = '#fbfbf7'; c.lineWidth = 16; c.beginPath(); for (let i = 0; i <= SEAM.prog; i++) { const [u, v] = P[i]; i ? c.lineTo(X(u), X(v)) : c.moveTo(X(u), X(v)); } c.stroke();
      c.strokeStyle = '#c42d3c'; c.lineWidth = 4; for (let i = 1; i <= SEAM.prog; i += 2) { const [u0, v0] = P[i - 1], [u1, v1] = P[i], dx = X(u1) - X(u0), dy = X(v1) - X(v0), L = Math.hypot(dx, dy) || 1, nx = -dy / L * 10, ny = dx / L * 10; c.beginPath(); c.moveTo(X(u1) - nx, X(v1) - ny); c.lineTo(X(u1) + nx, X(v1) + ny); c.stroke(); } }
    const [cu, cv] = P[SEAM.prog]; c.fillStyle = '#ec3013'; c.beginPath(); c.arc(X(cu), X(cv), 18, 0, 7); c.fill(); c.strokeStyle = '#fbfbf7'; c.lineWidth = 5; c.stroke();
    if (b.done) { c.fillStyle = 'rgba(32,30,29,0.55)'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.fillText('DONE', 256, 270); }
    if (SEAM.prog === 0) { c.fillStyle = '#201e1d'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'left'; c.fillText('START', X(cu) + 30, X(cv) + 12); }
    { const [nu, nv] = P[Math.min(P.length - 1, SEAM.prog + 6)]; c.fillStyle = 'rgba(32,30,29,0.55)'; c.beginPath(); c.arc(X(nu), X(nv), 8, 0, 7); c.fill(); }
    K.seam.tex.needsUpdate = true; }
  function seamMove(x, y) { if (!SEAM.stroke) return; const R = RAD() * (upg('guide') ? 1.45 : 1); let best = -1, bd = 1e9;
    for (let j = SEAM.prog; j <= Math.min(SEAM.path.length - 1, SEAM.prog + 9); j++) { const d = dist2(scr(seamWorld(j)), { x, y }); if (d < bd) { bd = d; best = j; } }
    if (bd < R) { if (best > SEAM.prog) { for (let j = SEAM.prog + 1; j <= best; j++) { SEAM.dev += Math.min(1, bd / R); SEAM.n++; } SEAM.prog = best; SEAM.dirty = true;  } }
    else if (bd > R * 1.9) { SEAM.stroke = false; if (!SEAM.warned) { SEAM.warned = true; flash('STAY ON THE LINE · PICK UP AT THE RED DOT', '#ffffff', 1.6); } }
    if (SEAM.prog >= SEAM.path.length - 2) seamDone(); }
  function seamDone() { const b = slot.seam; if (!b || b.ready) return; SEAM.stroke = false; const avg = SEAM.n ? SEAM.dev / SEAM.n : 0, sq = clamp(1.12 - avg * 0.9, 0.45, 1);
    b.balls.forEach(bl => { bl.sq = sq; bl.m.material = ballMat(COLOURS[b.col].col, true); }); b.ready = true; SEAM.last = b.col; SEAM.prog = SEAM.path.length - 1; SEAM.dirty = true;
    if (sq > 0.7) for (let i = 0; i < SEAM.path.length; i += 8) burst('spark', seamWorld(i), 1, sq > 0.9 ? '#ffd23a' : '#fbfbf7', 0.7); sfx('ding', null, 0.8, sq > 0.9 ? 1.12 : 1); if (sq > 0.9) sfx('sparkle', null, 0.5); combo(sq > 0.9); flash(sq > 0.9 ? 'A PERFECT 8!' : sq > 0.7 ? 'NEAT STITCHING' : 'WOBBLY SEAM', sq > 0.9 ? '#22c55e' : sq > 0.7 ? '#ffd23a' : '#e6b45a'); tone(1568, 0.2, 0.05); buzz([15, 30, 15]); if (sq > 0.9) say(pick(FELT_SAYS.great)); done('seam'); }

  // ---------- TEST ----------
  const catchPt = () => V3(K.st.test.x + 0.05, TOP + 1.25, LZ - 0.15);
  function testStep(dt) { const b = slot.test; if (!b || !b.arrived) { TEST.st = 'idle'; catchRing.visible = catchCore.visible = false; return; }
    b.balls.forEach((bl, i) => { if (bl.where === 'tray') bl.m.position.lerp(V3(K.testTray.x - 0.24 + (bl.trayI % 4) * 0.16, TOP + BR + 0.07, K.testTray.z), Math.min(1, dt * 10)); if (bl.where === 'tray' && upg('lamp') && bl.dead) bl.m.material = toon('#8a2a22'); });
    if (TEST.st === 'idle') { const bl = b.balls.find(q => q.where === 'tray'); if (!bl) { if (!b.balls.some(q => q.where === 'plate' || q.where === 'fly')) { slot.test = null; batches.splice(batches.indexOf(b), 1); done('test'); } return; } bl.where = 'plate'; TEST.b = bl; TEST.st = 'load'; TEST.t = 0; TEST.from = bl.m.position.clone(); }
    const bl = TEST.b; if (!bl) return; TEST.t += dt; const pl = K.plate, wall = K.testWall, cp = catchPt();
    const arc = (a, c, k, hgt) => a.clone().lerp(c, k).add(V3(0, Math.sin(k * Math.PI) * hgt, 0));
    catchRing.visible = catchCore.visible = false;
    if (TEST.st === 'load') { const k = Math.min(1, TEST.t / 0.35); bl.m.position.copy(arc(TEST.from, pl, k, 0.2)); if (k >= 1) { TEST.st = 'wait'; TEST.t = 0; } }
    else if (TEST.st === 'wait') { bl.m.position.lerp(pl, Math.min(1, dt * 10)); bl.m.position.y = pl.y + Math.abs(Math.sin(TEST.t * 3)) * 0.02; }
    else if (TEST.st === 'fly') { const k = Math.min(1, TEST.t / 0.36); bl.m.position.copy(arc(pl, wall, k, 0.25)); bl.m.rotation.x += dt * 20; if (k >= 1) { TEST.t = 0; impactT = 1; impactCol = bl.dead ? 0x9ca3af : 0xffd23a; sfx(bl.dead ? 'thud' : 'pock', K.testWall, 1, bl.dead ? 1 : 1.05); if (bl.dead) { TEST.st = 'thud'; tone(90, 0.25, 0.08, 'sine'); audio.burst && audio.burst(0.15, 300, 0.25); buzz(60); } else { TEST.st = 'ret'; tone(980, 0.06, 0.05, 'square'); audio.burst && audio.burst(0.06, 4000, 0.15); } } }
    else if (TEST.st === 'ret') { const RET = 0.95, k = Math.min(1, TEST.t / RET); bl.m.position.copy(arc(wall, cp, k, 0.75)); bl.m.rotation.x -= dt * 16; const win = upg('lamp') ? 0.32 : 0.22, inWin = k >= 1 - win;
      catchRing.visible = catchCore.visible = true; catchRing.position.copy(bl.m.position); catchCore.position.copy(bl.m.position); catchRing.quaternion.copy(camera.quaternion); catchCore.quaternion.copy(camera.quaternion); catchRing.scale.setScalar(1 + (1 - k) * 4); catchRing.material.color.set(inWin ? 0x22c55e : 0xffd23a); catchCore.material.color.set(inWin ? 0x22c55e : 0xfbfbf7);
      if (k >= 1) { TEST.st = 'drop'; TEST.t = 0; TEST.from = bl.m.position.clone(); bl.tq = 0.5; meterN = 1; meterT = 2; combo(false); [0, 0.22, 0.38].forEach((d, i) => SND.play('pock', { vol: 0.6 - i * 0.18, rate: 0.9, delay: 0.25 + d })); flash('MISSED · STILL A GOOD BALL', '#e6b45a'); } }
    else if (TEST.st === 'drop') { const k = Math.min(1, TEST.t / 0.7), fl = V3(cp.x + 0.6, BR, LZ + 0.9); const p = TEST.from.clone().lerp(fl, k); p.y = TEST.from.y * (1 - k) + BR + Math.abs(Math.sin(k * Math.PI * 2.5)) * (1 - k) * 0.6; bl.m.position.copy(p); if (k >= 1) toRack(bl); }
    else if (TEST.st === 'thud') { const k = Math.min(1, TEST.t / 0.55); const p = wall.clone().lerp(pl, k); p.y = wall.y + (pl.y - wall.y) * k * k + Math.abs(Math.sin(k * Math.PI * 2)) * (1 - k) * 0.12; bl.m.position.copy(p); if (k >= 1) { TEST.st = 'dead'; TEST.t = 0; bl.m.scale.set(1.1, 0.8, 1.1); bl.m.material = toon(upg('lamp') ? '#8a2a22' : '#7d7a70'); flash('THUD · A DEAD BALL · SWIPE IT LEFT', '#ec3013', 1.8); } }
    else if (TEST.st === 'dead') { bl.m.position.lerp(pl, Math.min(1, dt * 8)); }
    else if (TEST.st === 'catch') { const k = Math.min(1, TEST.t / 0.5); bl.m.position.copy(arc(TEST.from, rackPos(bl.col || slot.test.col, rack[slot.test.col].length), k, 0.3)); if (k >= 1) toRack(bl); }
    else if (TEST.st === 'rej') { const k = Math.min(1, TEST.t / 0.5); bl.m.position.copy(arc(TEST.from, K.bin, k, 0.5)); if (k >= 1) { sfx('clang', K.bin, 0.7); burst('dot', K.bin, 10, ['#ec3013', '#8f1d2a'], 1.2); scene.remove(bl.m); bl.where = 'gone'; TEST.b = null; TEST.st = 'idle'; tone(160, 0.12, 0.05, 'square'); } } }
  function toRack(bl) { const b = slot.test, col = b ? b.col : bl.col; bl.col = col; bl.where = 'rack'; bl.q = bl.pq * 0.35 + bl.sq * 0.35 + bl.tq * 0.3; rack[col].push(bl); TEST.b = null; TEST.st = 'idle'; }
  function testThrow() { if (TEST.st !== 'wait' && TEST.st !== 'dead') return false; TEST.st = 'fly'; TEST.t = 0; sfx('whoosh', K.plate, 0.7, 1.2); tone(520, 0.08, 0.04, 'triangle'); audio.burst && audio.burst(0.1, 2400, 0.12); return true; }
  function testCatch() { if (TEST.st === 'ret') { const k = Math.min(1, TEST.t / 0.95), win = upg('lamp') ? 0.32 : 0.22; if (k >= 1 - win) { const perfect = k >= 1 - win * 0.55; TEST.b.tq = perfect ? 1 : 0.85; sfx('catch', TEST.b.m.position, 1); if (perfect) sfx('sparkle', null, 0.4, 1.2); combo(perfect); meterN = perfect ? 5 : 3; meterT = 2.2; burst('spark', TEST.b.m.position, perfect ? 14 : 7, perfect ? ['#22c55e', '#ffd23a', '#fbfbf7'] : ['#ffd23a', '#fbfbf7'], 1.6); TEST.st = 'catch'; TEST.t = 0; TEST.from = TEST.b.m.position.clone(); flash(perfect ? 'PERFECT CATCH!' : 'GOOD CATCH', perfect ? '#22c55e' : '#ffd23a'); tone(perfect ? 1760 : 1320, 0.1, 0.05); buzz(perfect ? [15, 25, 15] : 20); return true; }
      flash('TOO EARLY · WAIT FOR GREEN', '#ffffff', 0.9); return false; }
    if (TEST.st === 'dead') { flash('IT IS FLAT · SWIPE LEFT INTO REJECT', '#ec3013'); return false; } if (TEST.st === 'wait') { flash('FLICK UP TO THROW IT', '#ffffff', 0.9); return false; } return false; }
  function testReject() { if (TEST.st !== 'wait' && TEST.st !== 'dead') return false; const bl = TEST.b, was = TEST.st; TEST.st = 'rej'; TEST.t = 0; sfx('whoosh', K.bin, 0.5, 0.9); TEST.from = bl.m.position.clone();
    if (bl.dead) { flash(was === 'dead' ? 'REJECTED · GOOD EYE' : 'SHARP EYE · THAT ONE WAS DEAD', '#22c55e'); say(pick(FELT_SAYS.dead)); } else flash('THAT ONE WAS FINE!', '#e6b45a'); buzz(20); return true; }

  // ---------- CAN ----------
  const rackPos = (k, i) => { const r = K.rack[k], layer = Math.floor(i / 4), j = i % 4; return V3(r.x - 0.075 + (j % 2) * 0.15, r.y + BR * 0.8 + layer * 0.15, r.z - 0.08 + Math.floor(j / 2) * 0.16); };
  function canAdd(k) { if (CAN.st !== 'fill' || CAN.slide > 0) return false; if (!rack[k].length) return false; if (CAN.col && CAN.col !== k) { flash('ONE COLOUR PER CAN', '#ffffff'); return false; } if (outCans.length >= 3) { flash('SHELF FULL · SHIP A CAN FIRST', '#ffffff'); return false; }
    const bl = rack[k].pop(); CAN.col = k; CAN.balls.push(bl); bl.where = 'can'; sfx('plunk', K.canAt, 0.9, 1 + CAN.balls.length * 0.12); tone(700 + CAN.balls.length * 140, 0.08, 0.05); audio.burst && audio.burst(0.05, 3000, 0.1);
    if (CAN.balls.length >= 3) { CAN.st = 'pump'; CAN.p = 0.05; CAN.twist = 0; CAN.g.userData.lid.visible = true; flash('PUMP IT UP · TAP THE PUMP', '#ffd23a'); done('fill'); } return true; }
  const pzone = p => p < 0.55 ? 'FLAT' : p < 0.72 ? 'OK' : p <= 0.88 ? 'PERFECT' : p < 1 ? 'TIGHT' : 'POP';
  function pumpTap() { if (CAN.st !== 'pump') return; CAN.p += upg('pump') ? 0.125 : 0.085; K.plunger.position.y = 0.45; sfx('pump', K.pumpAt, 0.8, 0.85 + CAN.p * 0.4); tone(220 + CAN.p * 500, 0.07, 0.04, 'sawtooth'); audio.burst && audio.burst(0.08, 600, 0.12);
    if (CAN.p >= 1) { CAN.p = 0.3; CAN.twist = 0; CAN.popT = 1; sfx('pop', K.canAt, 1); combo(false); S.shake = 0.8; flash('POP! TOO MUCH AIR', '#ec3013'); say(pick(FELT_SAYS.pop)); tone(1800, 0.05, 0.06, 'square'); audio.burst && audio.burst(0.4, 5000, 0.3); buzz([40, 30, 40]); puff(K.canAt.x, TOP + 0.9, K.canAt.z, 0xffffff, 5); burst('dot', K.canAt.clone().add(V3(0, 0.8, 0)), 14, '#fbfbf7', 2.4); } }
  function canSeal() { const z = pzone(CAN.p), cq = { FLAT: 0.35, OK: 0.75, PERFECT: 1, TIGHT: 0.8 }[z] ?? 0.5, bq = CAN.balls.reduce((a, b) => a + b.q, 0) / CAN.balls.length, dead = CAN.balls.some(b => b.dead);
    const can = { col: CAN.col, q: dead ? 0.2 : bq * 0.75 + cq * 0.25, dead, g: CAN.g, ballsRef: CAN.balls, slot: [0, 1, 2].find(i => !outCans.some(c => c.slot === i)) };
    can.g.userData.band.visible = true; can.g.userData.band.material = labelMat(CAN.col); outCans.push(can); CAN.balls.forEach(b => b.where = 'sealed');
    flash(z === 'PERFECT' ? 'SEALED · PERFECT PRESSURE' : 'SEALED · ' + z, z === 'PERFECT' ? '#22c55e' : z === 'FLAT' ? '#e6b45a' : '#ffd23a'); burst('spark', K.canAt.clone().add(V3(0, 0.6, 0)), 12, [COLOURS[CAN.col].col, '#fbfbf7'], 1.4); sfx('seal', K.canAt, 0.9); combo(z === 'PERFECT'); tone(1046, 0.12, 0.05); setTimeout(() => tone(1568, 0.15, 0.05), 110); buzz([20, 30, 40]);
    CAN.g = makeCan(); CAN.g.position.copy(K.canAt).add(V3(-0.9, 0, 0)); CAN.balls = []; CAN.col = null; CAN.p = 0; CAN.twist = 0; CAN.st = 'fill'; CAN.slide = 1; done('can'); }
  function canStep(dt) { CAN.g.position.lerp(K.canAt, Math.min(1, dt * 6)); CAN.slide = Math.max(0, CAN.slide - dt * 2); const lid = CAN.g.userData.lid;
    if (CAN.st === 'pump') { CAN.p = Math.max(0, CAN.p - dt * 0.03); lid.position.y = damp(lid.position.y, CAN.p >= 0.45 ? 0.53 : 0.95, 8, dt); lid.rotation.y = CAN.twist; }
    if (CAN.popT > 0) { CAN.popT -= dt; lid.position.y = 0.95 + Math.sin((1 - CAN.popT) * Math.PI) * 0.8; lid.rotation.x = (1 - CAN.popT) * 6; } else lid.rotation.x = 0;
    K.plunger.position.y = damp(K.plunger.position.y, 0.62, 10, dt);
    CAN.balls.forEach((bl, i) => bl.m.position.lerp(V3(CAN.g.position.x, CAN.g.position.y + 0.1 + i * 0.15, CAN.g.position.z), Math.min(1, dt * 12)));
    COL_KEYS.forEach(k => rack[k].forEach((bl, i) => { if (G && G.kind === 'rack' && G.drag === bl) return; bl.m.position.lerp(rackPos(k, i), Math.min(1, dt * 10)); bl.m.visible = i < 8; }));
    outCans.forEach(c => { if (G && G.kind === 'ship' && G.can === c && G.moved) return; if (c.fly) return; const p = K.outSlots[c.slot]; c.g.position.lerp(p, Math.min(1, dt * 7)); c.g.userData.lid.position.y = 0.53; });
    outCans.concat(flyCans).forEach(c => (c.ballsRef || []).forEach((bl, i) => bl.m.position.set(c.g.position.x, c.g.position.y + (0.1 + i * 0.15) * c.g.scale.y, c.g.position.z)));
    outCans.forEach(c => { const g = c.g; const sel = S.sel === c; g.scale.setScalar(damp(g.scale.x, sel ? 1.15 + Math.sin(S.t * 8) * 0.04 : 1, 12, dt)); });
    // gauge
    { const p = CAN.st === 'pump' ? CAN.p : 0; if (Math.abs(p - (CAN.gaugeP ?? -1)) > 0.004) { CAN.gaugeP = p; const c = K.gauge.canvas.getContext('2d'); c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, 256, 256); const arcZ = (a0, a1, col) => { c.strokeStyle = col; c.lineWidth = 34; c.beginPath(); c.arc(128, 140, 92, Math.PI * (0.8 + a0 * 1.4), Math.PI * (0.8 + a1 * 1.4)); c.stroke(); };
      arcZ(0, 0.55, '#9ca3af'); arcZ(0.55, 0.72, '#e8e4de'); arcZ(0.72, 0.88, '#22c55e'); arcZ(0.88, 1, '#ec3013'); const a = Math.PI * (0.8 + Math.min(1, p) * 1.4); c.strokeStyle = '#201e1d'; c.lineWidth = 10; c.beginPath(); c.moveTo(128, 140); c.lineTo(128 + Math.cos(a) * 86, 140 + Math.sin(a) * 86); c.stroke(); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(128, 140, 16, 0, 7); c.fill(); c.font = '900 30px Archivo, Arial'; c.textAlign = 'center'; c.fillText('PSI', 128, 228); K.gauge.tex.needsUpdate = true; } } }

  // ---------- ORDERS / CUSTOMERS ----------
  function bubbleTex(o, ready) { const C = COLOURS[o.col]; return canvasTex(128, 128, c => { c.clearRect(0, 0, 128, 128); c.fillStyle = '#fbfbf7'; c.strokeStyle = ready ? '#22c55e' : '#201e1d'; c.lineWidth = ready ? 9 : 6; c.beginPath(); c.roundRect(8, 8, 112, 92, 22); c.moveTo(52, 98); c.lineTo(64, 120); c.lineTo(76, 98); c.fill(); c.stroke(); c.fillStyle = '#fbfbf7'; c.fillRect(54, 92, 20, 10);
    c.fillStyle = C.col; c.beginPath(); c.arc(o.cans > 1 ? 48 : 64, 54, 30, 0, 7); c.fill(); c.strokeStyle = '#201e1d'; c.lineWidth = 4; c.stroke(); c.strokeStyle = '#fbfbf7'; c.lineWidth = 5; const cx = o.cans > 1 ? 48 : 64; c.beginPath(); c.arc(cx - 30, 54, 28, -0.75, 0.75); c.stroke(); c.beginPath(); c.arc(cx + 30, 54, 28, Math.PI - 0.75, Math.PI + 0.75); c.stroke();
    if (o.cans > 1) { c.fillStyle = '#201e1d'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('×' + (o.cans - o.got), 94, 56); } }); }
  function setBubble(o) { const ready = o.st === 'wait' && outCans.some(c => c.col === o.col), key = ready + '|' + o.got; if (o.bKey === key) return; o.bKey = key; if (!o.bub) { o.bub = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false })); o.bub.renderOrder = 33; o.bub.scale.set(0.62, 0.62, 1); scene.add(o.bub); } if (o.bub.material.map) o.bub.material.map.dispose(); o.bub.material.map = bubbleTex(o, ready); o.bub.material.needsUpdate = true; o.bub.userData.ready = ready; }
  function newOrder() { const spot = [0, 1, 2].find(i => !orders.some(o => o.spot === i)); if (spot == null) return; const used = orders.map(o => o.ci), pool = CUSTOMERS.map((_, i) => i).filter(i => !used.includes(i)); const ci = S.demo && !DM.firstOrder ? 0 : pick(pool); if (S.demo) DM.firstOrder = true;
    const cols = availCols(), col = S.demo ? 'yellow' : pick(cols), two = !S.demo && S.day >= 2 && Math.random() < (S.day >= 3 ? 0.5 : 0.3), cans = two ? 2 : 1, patMax = 80 + 35 * cans - Math.min(24, S.day * 4);
    const f = custFox[ci]; f.visible = true; f.position.copy(K.dockDoor); f.rotation.y = 0; f.userData.mood = 'happy';
    orders.push({ id: ++S.seq, ci, f, col, cans, got: 0, qs: [], pat: patMax, patMax, price: COLOURS[col].price * cans, spot, st: 'walk', tip: 0 }); sfx('doorbell', K.dockDoor, 0.55); tone(660, 0.1, 0.04); setTimeout(() => tone(880, 0.12, 0.04), 120); }
  function ordersStep(dt) { for (const o of orders.slice()) { const f = o.f, spot = K.dock[o.spot];
      if (o.st === 'walk') { const d = V3(spot.x - f.position.x, 0, spot.z - f.position.z), L = d.length(); if (L < 0.05) { o.st = 'wait'; f.rotation.y = damp(f.rotation.y, 0, 8, dt); } else { d.multiplyScalar(Math.min(L, dt * 2.6) / L); f.position.add(d); f.rotation.y = Math.atan2(d.x, d.z); } kit.animFox(f, dt, L > 0.05 ? 2.6 : 0); }
      if (o.bub || o.st === 'wait') { if (o.st === 'leave') { if (o.bub) { scene.remove(o.bub); o.bub.material.map && o.bub.material.map.dispose(); o.bub = null; } } else { setBubble(o); const pu = o.bub.userData.ready ? 1 + Math.sin(T * 7) * 0.08 : 1; o.bub.position.set(f.position.x, 2.85 + Math.sin(T * 2 + o.spot) * 0.05, f.position.z); o.bub.scale.set(0.62 * pu, 0.62 * pu, 1); o.bub.visible = f.visible; } }
      if (o.st === 'walk') {} else if (o.st === 'wait') { f.rotation.y = damp(f.rotation.y, 0, 6, dt); if (!S.demo || o.pat > 30) o.pat -= dt; if (o.pat < o.patMax * 0.3) f.userData.mood = 'stern'; if (o.pat <= 0) { o.st = 'leave'; S.lost++; f.userData.mood = 'sad'; S.react = { who: CUSTOMERS[o.ci].name, ...REACT.grumpy, line: 'Too slow! I have a match!', stars: 0, tip: 0, pay: 0 }; S.reactT = 2.2; sfx('wahwah', null, 0.7); combo(false); } kit.animFox(f, dt, 0); }
      else if (o.st === 'leave') { const d = V3(K.dockDoor.x - f.position.x, 0, K.dockDoor.z - f.position.z), L = d.length(); if (L < 0.1) { f.visible = false; (o.held || []).forEach(g => f.remove(g)); orders.splice(orders.indexOf(o), 1); } else { d.multiplyScalar(Math.min(L, dt * 2.8) / L); f.position.add(d); f.rotation.y = Math.atan2(d.x, d.z); kit.animFox(f, dt, 2.8); } } } }
  function deliver(can, o) { if (!o || o.st !== 'wait') return false; if (o.col !== can.col) { flash(CUSTOMERS[o.ci].name + ' WANTS ' + COLOURS[o.col].short, '#ffffff'); S.sel = null; return false; }
    outCans.splice(outCans.indexOf(can), 1); S.sel = null; can.fly = { t: 0, from: can.g.position.clone(), o }; flyCans.push(can); o.got++; o.qs.push(can.q); if (can.dead) o.dead = true; sfx('whoosh', o.f.position, 0.5, 1.3); tone(988, 0.1, 0.05); buzz(25);
    if (o.got >= o.cans) completeOrder(o); else flash(o.got + ' / ' + o.cans + ' CANS FOR ' + CUSTOMERS[o.ci].name, '#ffd23a'); return true; }
  const flyCans = [];
  function flyStep(dt) { for (const c of flyCans.slice()) { c.fly.t += dt / 0.55; const k = Math.min(1, c.fly.t), to = c.fly.o.f.position.clone().add(V3(0, 1.2, 0.35)); c.g.position.copy(c.fly.from.clone().lerp(to, k)).add(V3(0, Math.sin(k * Math.PI) * 0.8, 0)); if (k >= 1) { const o = c.fly.o, n = (o.held || (o.held = [])).length; flyCans.splice(flyCans.indexOf(c), 1); o.f.add(c.g); c.g.position.set(n ? 0.22 : -0.05, 0.78, 0.42); c.g.rotation.set(0, 0, n ? -0.15 : 0.1); c.g.scale.setScalar(0.85); CAN_BALLS(c).forEach((bl, i) => { c.g.add(bl.m); bl.m.position.set(0, 0.1 + i * 0.15, 0); }); o.held.push(c.g); } } }
  const CAN_BALLS = c => c.ballsRef || [];
  function completeOrder(o) { const q = o.qs.reduce((a, b) => a + b, 0) / o.qs.length, late = o.pat < o.patMax * 0.25; let stars = o.dead ? 1 : q >= 0.86 ? 3 : q >= 0.66 ? 2 : 1; if (late) stars = Math.min(stars, 2);
    const level = o.dead ? 'grumpy' : stars === 3 ? 'thrilled' : stars === 2 ? 'happy' : 'okay', R = REACT[level]; let tip = stars === 3 ? 2 + S.day : stars === 2 ? 1 : 0; if (upg('radio')) tip = Math.ceil(tip * 1.25);
    S.earned += o.price; S.tips += tip; S.served++; sfx('cash', null, 0.75); if (level === 'thrilled') sfx('cheer', o.f.position, 0.7); else if (level === 'grumpy') sfx('wahwah', null, 0.6); S.starList.push(stars); o.st = 'leave'; o.f.userData.mood = R.mood; if (level === 'thrilled') o.f.userData.hop = 1;
    { const top = o.f.position.clone().add(V3(0, 2.3, 0)); if (level === 'thrilled') burst('confetti', top, 30, ['#d4ef3a', '#ff7eb6', '#f2c94c', '#5cc0f2', '#fbfbf7'], 2.0); else if (level === 'happy') burst('spark', top, 10, ['#ffd23a', '#fbfbf7'], 1.2); }
    S.react = { who: CUSTOMERS[o.ci].name, word: R.word, col: R.col, line: o.dead ? 'One of these is dead!' : pick(R.lines), stars, tip, pay: o.price }; S.reactT = 2.4; tone(1318, 0.12, 0.05); setTimeout(() => tone(1760, 0.16, 0.05), 140); if (S.demo) DM.served++; }

  // ---------- shift flow ----------
  function resetLine() { batches.forEach(b => b.balls.forEach(bl => scene.remove(bl.m))); batches.length = 0; for (const k in slot) slot[k] = null; COL_KEYS.forEach(k => { rack[k].forEach(bl => scene.remove(bl.m)); rack[k].length = 0; });
    outCans.forEach(c => { scene.remove(c.g); (c.ballsRef || []).forEach(bl => scene.remove(bl.m)); }); outCans.length = 0; flyCans.forEach(c => scene.remove(c.g)); flyCans.length = 0; CAN.balls.forEach(bl => scene.remove(bl.m)); CAN.balls = []; CAN.col = null; CAN.p = 0; CAN.st = 'fill'; CAN.twist = 0; CAN.g.userData.lid.visible = false; CAN.g.position.copy(K.canAt);
    orders.forEach(o => { o.f.visible = false; (o.held || []).forEach(g => o.f.remove(g)); if (o.bub) scene.remove(o.bub); }); orders.length = 0; PR.hold = false; PR.v = 0; DYE.drag = false; DYE.dunk = null; SEAM.prog = 0; SEAM.stroke = false; SEAM.dirty = true; TEST.b = null; TEST.st = 'idle'; S.sel = null; S.react = null; G = null; }
  function startShift() { if (S.phase === 'shift' || S.phase === 'glide') return; SND.init(); resetLine(); if (!S.demo && DM.on) demoStop();
    Object.assign(S, { phase: 'glide', glideT: 1.1, t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], next: 1.6, done: null, focus: 'press', dlg: null, toast: null });
    benWalk.visible = false; benWork.visible = true; benWork.position.set(K.st.press.x - 1.75, 0, LZ + 0.75); benWork.rotation.y = Math.PI; save.where(FACTORY.world, FACTORY.room); say(pick(FELT_SAYS.start)); SND.play('whistle', { vol: 0.5, rate: 1.15 }); S.combo = 0; S.comboBest = 0; S.comboGold = 0; S.tick = 0; }
  function endShift() { S.phase = 'done'; S.focus = 'all'; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, need = 2 + S.day, eod = S.served >= need && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    if (S.demo) { demoStop(); return; }
    const unlock = []; if (S.served >= 2 && !save.flag('ballUniform')) { save.setFlag('ballUniform'); unlock.push('BALL WORKS UNIFORM · cap, towel + the 8-ball crest'); }
    const newDay = S.served >= need; if (newDay) { const nd = S.day + 1; save.setStat(SK.day, nd); COL_KEYS.forEach(k => { if (COLOURS[k].day === nd) unlock.push(COLOURS[k].name + ' DYE VAT'); }); }
    save.addGold(total); save.best(SK.best, S.served);
    S.done = { comboBest: S.comboBest || 0, comboGold: S.comboGold || 0, day: S.day, served: S.served, lost: S.lost, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, need, unlock };
    if (newDay) S.day += 1; SND.play('whistle', { vol: 0.55 }); SND.stinger(eod || newDay ? 'win' : 'end'); }
  function toIntro() { if (DM.on) demoStop(); resetLine(); S.phase = 'intro'; S.done = null; S.dlg = null; S.focus = 'all'; benWalk.visible = false; benWork.visible = true; benWork.position.set(-5.7, 0, 3.6); benWork.rotation.y = 0.15; }
  function toWalk() { if (DM.on) demoStop(); resetLine(); S.phase = 'walk'; S.done = null; S.focus = 'all'; benWork.visible = false; benWalk.visible = true; const from = S.prevPhase === 'intro' ? K.spawn : V3(-5.2, 0, 3.2); WALK.x = from.x; WALK.z = from.z; WALK.yaw = Math.PI; WALK.camYaw = 0; save.where(FACTORY.world, FACTORY.room); toast('Walk around the Ball Works. Talk to FELT to work a shift.', 4); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SK.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); SND.play('cash', { vol: 0.7 }); SND.play('sparkle', { vol: 0.4, delay: 0.15 }); SEAM.dirty = true; return true; }

  // ---------- hints, badges, gestures ----------
  function neededColours() { const need = []; for (const o of orders.filter(q => q.st !== 'leave').sort((a, b) => a.pat - b.pat)) { let left = o.cans - o.got - outCans.filter(c => c.col === o.col).length; for (let i = 0; i < left; i++) need.push(o.col); } return need; }
  function nextHint() { if (S.phase !== 'shift') return null; const waiting = orders.filter(o => o.st === 'wait'), need = neededColours();
    const ship = outCans.find(c => waiting.some(o => o.col === c.col)); if (ship) { const o = waiting.find(q => q.col === ship.col); return { station: 'can', text: 'TAP ' + CUSTOMERS[o.ci].name + '\'S TICKET TO SHIP THE ' + COLOURS[ship.col].short + ' CAN', p: K.outSlots[ship.slot], r: 0.3 }; }
    if (CAN.st === 'pump') return CAN.p >= 0.45 ? { station: 'can', text: pzone(CAN.p) === 'PERFECT' ? 'GREEN! TWIST THE LID ROUND NOW' : 'PUMP INTO THE GREEN, THEN TWIST THE LID', p: K.canAt.clone().add(V3(0, 0.55, 0)), r: 0.3 } : { station: 'can', text: 'TAP THE RED PUMP', p: K.pumpAt, r: 0.25 };
    const fillCol = CAN.col || COL_KEYS.find(k => need.includes(k) && rack[k].length >= 3) || COL_KEYS.find(k => rack[k].length >= 3 && !need.length);
    if (fillCol && rack[fillCol].length + CAN.balls.length >= 3 && outCans.length < 3) return { station: 'can', text: 'DRAG 3 ' + COLOURS[fillCol].short + ' BALLS INTO THE CAN', p: rackPos(fillCol, 0), r: 0.25 };
    if (slot.test && slot.test.arrived) return { station: 'test', text: TEST.st === 'dead' ? 'SWIPE LEFT · DEAD BALL TO REJECT' : TEST.st === 'ret' ? 'TAP WHEN THE RING IS GREEN' : 'FLICK UP · THROW IT AT THE WALL', p: K.plate, r: 0.3 };
    if (slot.seam && slot.seam.arrived && !slot.seam.ready) return { station: 'seam', text: 'TRACE THE 8 FROM THE RED DOT', p: seamWorld(SEAM.prog), r: 0.12 };
    if (slot.dye && slot.dye.arrived && !slot.dye.ready && !DYE.dunk) { const want = need.find(k => COLOURS[k].day <= S.day) || need[0] || 'yellow', v = K.vats.find(q => q.k === want); return { station: 'dye', text: 'DRAG THE BASKET INTO ' + COLOURS[want].short, p: V3(v.x, 0.9, v.z), r: 0.36, col: want }; }
    if (!slot.press && (need.length > COL_KEYS.reduce((a, k) => a + rack[k].length, 0) / 3 + batches.length || batches.length < 1)) return { station: 'press', text: 'HOLD THE PRESS · LET GO IN THE GREEN', p: V3(K.st.press.x, TOP + 0.2, LZ), r: 0.6 };
    return null; }
  function badges() { const b = {}; b.press = slot.press ? (slot.press.ready ? 'FULL' : 'BUSY') : PR.hold ? 'PRESSING' : 'READY';
    b.dye = slot.dye ? (slot.dye.arrived && !slot.dye.ready ? 'DUNK ME' : DYE.dunk ? 'DYEING' : '…') : '';
    b.seam = slot.seam ? (slot.seam.arrived && !slot.seam.ready ? 'STITCH' : '…') : '';
    b.test = slot.test ? 'TEST ' + slot.test.balls.filter(q => q.where === 'tray' || q.where === 'plate').length : '';
    const rk = COL_KEYS.reduce((a, k) => a + rack[k].length, 0); b.can = outCans.length ? 'SHIP ' + outCans.length : CAN.st === 'pump' ? 'PUMP' : rk ? rk + ' BALLS' : ''; return b; }
  function gesture() { if (S.phase !== 'shift') return null; const f = S.focus;
    if (f === 'press') return slot.press ? ['WAIT', 'THE DYE VAT IS STILL BUSY'] : ['HOLD', 'HOLD THE SCREEN · LET GO IN THE GREEN'];
    if (f === 'dye') return dyeReady() ? ['DRAG', 'DRAG THE BASKET INTO A COLOUR'] : ['WAIT', 'NO CORES HERE YET'];
    if (f === 'seam') return seamReady() ? ['TRACE', 'TRACE THE 8 FROM THE RED DOT'] : ['WAIT', 'NOTHING TO STITCH YET'];
    if (f === 'test') return slot.test ? ['FLICK', 'FLICK UP = THROW · TAP = CATCH · SWIPE LEFT = REJECT'] : ['WAIT', 'NO BALLS TO TEST YET'];
    if (f === 'can') return outCans.length && orders.some(o => o.st === 'wait') && CAN.st !== 'pump' ? ['TAP', 'TAP THE TICKET TO SHIP · OR DRAG THE CAN TO THEM'] : CAN.st === 'pump' ? (CAN.p >= 0.45 ? ['TWIST', 'TWIST THE LID ROUND · OR KEEP PUMPING'] : ['TAP', 'TAP THE PUMP FAST']) : ['DRAG', 'DRAG 3 BALLS OF ONE COLOUR INTO THE CAN'];
    return ['TAP', 'TAP A MACHINE TO ZOOM IN']; }

  // ---------- input ----------
  const STAGE = () => renderer.domElement;
  function pickOut(x, y) { let best = null, bd = RAD() * 1.5; for (const c of outCans) { const d = dist2(scr(c.g.position.clone().add(V3(0, 0.25, 0))), { x, y }); if (d < bd) { bd = d; best = c; } } return best; }
  function pickCustomer(x, y, r = 3) { let best = null, bd = RAD() * r; for (const o of orders) { if (o.st !== 'wait') continue; const s1 = scr(o.f.position.clone().add(V3(0, 1.3, 0))), s2 = scr(o.f.position.clone().add(V3(0, 0.5, 0))), d = Math.min(dist2(s1, { x, y }), dist2(s2, { x, y })); if (d < bd) { bd = d; best = o; } } return best; }
  function pickRack(x, y) { let best = null, bd = RAD() * 1.7; for (const k of COL_KEYS) { if (!rack[k].length) continue; const d = dist2(scr(V3(K.rack[k].x, K.rack[k].y + 0.08, K.rack[k].z)), { x, y }); if (d < bd) { bd = d; best = k; } } return best; }
  function pickStation(x, y) { let best = null, bd = 1e9; for (const k of STATIONS) { const d = dist2(scr(V3(K.st[k].x, TOP + 0.5, LZ - 0.4)), { x, y }); if (d < bd) { bd = d; best = k; } } return best; }
  function onDown(e) { SND.init(); S.lastInput = performance.now(); if (S.phase !== 'shift' || DM.on) return; if (G) return; const { x, y } = local(e); try { STAGE().setPointerCapture(e.pointerId); } catch (er) {} e.preventDefault();
    G = { id: e.pointerId, x0: x, y0: y, x, y, t0: performance.now(), kind: null, moved: false };
    const oc = pickOut(x, y); if (oc) { G.kind = 'ship'; G.can = oc; return; }
    const f = S.focus;
    if (f === 'all') { G.kind = 'pickStation'; return; }
    if (f === 'press') { if (slot.press) { G.kind = 'none'; flash('THE DYE VAT IS STILL BUSY', '#ffffff', 0.9); } else { G.kind = 'press'; PR.hold = true; PR.v = 0; } return; }
    if (f === 'dye') { G.kind = dyeReady() ? 'dye' : 'none'; if (G.kind === 'dye') { DYE.drag = true; dyeDragTo(x, y); } return; }
    if (f === 'seam') { if (!seamReady()) { G.kind = 'none'; return; } const d = dist2(scr(seamWorld(SEAM.prog)), { x, y }); if (d < RAD() * 1.7 * (upg('guide') ? 1.3 : 1)) { G.kind = 'seam'; SEAM.stroke = true; SEAM.warned = false; seamMove(x, y); } else G.kind = 'seamMiss'; return; }
    if (f === 'test') { G.kind = 'test'; return; }
    if (f === 'can') { if (CAN.st === 'fill') { const k = pickRack(x, y); if (k) { G.kind = 'rack'; G.col = k; G.drag = rack[k][rack[k].length - 1]; return; } }
      if (CAN.st === 'pump') { const ls = scr(K.canAt.clone().add(V3(0, 0.55, 0))); const ps = scr(K.pumpAt), dl = dist2(ls, { x, y }); const dp = dist2(ps, { x, y }); if (CAN.p >= 0.45 && (dl < RAD() * 1.5 || (dl < RAD() * 2.6 && dl < dp))) { G.kind = 'twist'; G.ang = Math.atan2(y - ls.y, x - ls.x); G.c = ls; return; } G.kind = 'pump'; return; }
      G.kind = 'tapCan'; } }
  function onMove(e) { if (!G || e.pointerId !== G.id) return; const { x, y } = local(e); G.x = x; G.y = y; if (Math.hypot(x - G.x0, y - G.y0) > 10) G.moved = true;
    if (G.kind === 'dye') dyeDragTo(x, y);
    else if (G.kind === 'seam') { if (!SEAM.stroke) { const d = dist2(scr(seamWorld(SEAM.prog)), { x, y }); if (d < RAD() * 1.3) SEAM.stroke = true; } seamMove(x, y); }
    else if (G.kind === 'rack' && G.drag && G.moved) { const h = onPlane(x, y, TOP + 0.45); if (h) G.drag.m.position.lerp(h, 0.6); }
    else if (G.kind === 'ship' && G.moved) { const h = onPlane(x, y, TOP + 0.4); if (h) G.can.g.position.lerp(h.add(V3(0, -0.25, 0)), 0.6); }
    else if (G.kind === 'twist') { const a = Math.atan2(y - G.c.y, x - G.c.x); let d = a - G.ang; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; G.ang = a; CAN.twist += Math.abs(d); if (Math.floor(CAN.twist / 0.55) !== Math.floor((CAN.twist - Math.abs(d)) / 0.55)) sfx('ratchet', null, 0.8, 0.9 + CAN.twist * 0.08); if (CAN.twist >= TAU * 0.85) { G.kind = 'none'; canSeal(); } } }
  function onUp(e) { if (!G || e.pointerId !== G.id) return; const g = G; G = null; const { x, y } = local(e), dx = x - g.x0, dy = y - g.y0, tap = Math.hypot(dx, dy) < 14 && performance.now() - g.t0 < 450;
    if (tap && S.sel && g.kind !== 'ship') { const o = pickCustomer(x, y); if (o) { deliver(S.sel, o); return; } }
    switch (g.kind) {
      case 'press': pressRelease(); break;
      case 'dye': dyeDrop(); break;
      case 'seam': SEAM.stroke = false; break;
      case 'seamMiss': flash('START AT THE RED DOT', '#ffffff', 1); break;
      case 'pickStation': if (tap) { const k = pickStation(x, y); if (k) setFocus(k); } break;
      case 'test': { const swipeUp = dy < -38 && Math.abs(dy) > Math.abs(dx), swipeL = dx < -45 && Math.abs(dx) > Math.abs(dy); if (swipeUp) testThrow(); else if (swipeL) testReject(); else if (tap || Math.hypot(dx, dy) < 30) testCatch(); break; }
      case 'rack': { const can = scr(K.canAt.clone().add(V3(0, 0.3, 0))); if (!g.moved || dist2(can, { x, y }) < RAD() * 2.4) { if (!canAdd(g.col)) {} } break; }
      case 'pump': if (Math.hypot(dx, dy) < 30) pumpTap(); break;
      case 'ship': { const o = pickCustomer(x, y, g.moved ? 3.4 : 0); if (g.moved && o) { deliver(g.can, o); } else if (!g.moved) { S.sel = S.sel === g.can ? null : g.can; if (S.sel) flash('NOW TAP THE CUSTOMER', '#ffd23a', 1); } break; }
      case 'tapCan': if (tap) flash(outCans.length >= 3 ? 'SHELF FULL · SHIP A CAN FIRST' : 'NO BALLS ON THE RACK YET', '#ffffff', 1); break; } }
  function onCancel(e) { if (G && G.kind === 'press') pressRelease(); if (G && G.kind === 'dye') dyeDrop(); SEAM.stroke = false; G = null; }
  STAGE().addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onCancel);
  function setFocus(id) { if (!STATIONS.includes(id) && id !== 'all') return; S.focus = id; S.userFocusT = performance.now(); }
  const onKD = e => { SND.init(); if (S.phase === 'shift' && !DM.on) { const n = { Digit1: 'press', Digit2: 'dye', Digit3: 'seam', Digit4: 'test', Digit5: 'can', Digit0: 'all' }[e.code]; if (n) { setFocus(n); return; } } keys.add(e.code); }, onKU = e => keys.delete(e.code), onBlur = () => keys.clear();
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  // ---------- DEMO (autopilot with captions + a glowing hand; nothing is saved) ----------
  const DM = { on: false, cd: 0, task: null, cap: '', key: '', served: 0, firstOrder: false, deadNext: false, day0: 1, hp: null, endT: 0 };
  function demoStart() { if (DM.on) return; SND.init(); Object.assign(DM, { on: true, served: 0, firstOrder: false, deadNext: true, day0: S.day, task: null, cd: 1.8, cap: "WATCH A SHIFT AT FELT'S BALL WORKS", key: '', endT: 0 }); S.demo = true; S.phase = 'intro'; startShift(); S.next = 0.6; }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; DM.task = null; S.day = DM.day0; toIntro(); }
  function cap(c, k = '') { DM.cap = c; DM.key = k; }
  function demoPlan() { const h = nextHint(); if (!h) { cap(batches.some(b => !b.arrived) ? 'THE BELT CARRIES THE BALLS TO THE NEXT MACHINE' : 'WAITING FOR THE NEXT ORDER…', ''); return 0.4; } S.focus = h.station;
    if (h.station === 'can') { const waiting = orders.filter(o => o.st === 'wait'), ship = outCans.find(c => waiting.some(o => o.col === c.col));
      if (ship && CAN.st !== 'pump') { const o = waiting.find(q => q.col === ship.col); DM.task = { kind: 'ship', t: 0, can: ship, o }; cap('DRAG THE CAN TO ' + CUSTOMERS[o.ci].name + ' AT THE DOCK', 'DRAG'); return 0; }
      if (CAN.st === 'pump') { DM.task = { kind: 'pump', t: 0, n: 0 }; cap('TAP THE PUMP UNTIL THE NEEDLE IS GREEN', 'TAP'); return 0; }
      const k = CAN.col || COL_KEYS.find(q => rack[q].length >= 3); if (k) { DM.task = { kind: 'fill', t: 0, k }; cap('DRAG 3 ' + COLOURS[k].short + ' BALLS INTO THE CAN', 'DRAG'); return 0; } }
    if (h.station === 'test') { DM.task = { kind: 'test', t: 0 }; return 0; }
    if (h.station === 'seam') { DM.task = { kind: 'seam', t: 0 }; cap('TRACE THE 8 WITH YOUR FINGER, FROM THE RED DOT', 'TRACE'); return 0; }
    if (h.station === 'dye') { DM.task = { kind: 'dye', t: 0, v: K.vats.find(v => v.k === (h.col || 'yellow')) }; cap('DRAG THE BASKET INTO ' + COLOURS[h.col || 'yellow'].short + ' FOR THE TICKET', 'DRAG'); return 0; }
    if (h.station === 'press') { DM.task = { kind: 'press', t: 0 }; cap('HOLD THE PRESS · LET GO WHEN THE BAR IS GREEN', 'HOLD'); return 0; }
    return 0.5; }
  function demoTask(dt) { const T = DM.task; T.t += dt; const H = p => { DM.hp = p.clone(); };
    if (T.kind === 'press') { H(V3(K.st.press.x, TOP + 0.6, LZ + 0.2)); if (T.t > 0.6 && !PR.hold && !slot.press) { PR.hold = true; PR.v = 0; } if (PR.hold && PR.v >= 0.8) { pressRelease(); return true; } return slot.press && !PR.hold && T.t > 0.8; }
    if (T.kind === 'dye') { const v = T.v, b = slot.dye; if (!b || !b.arrived) return T.t > 2; if (T.t < 0.5) { H(K.basket.position); return false; } DYE.drag = true; DYE.target = V3(v.x, TOP + 0.75, v.z); H(K.basket.position); if (T.t > 1.5) { DYE.drag = false; K.basket.position.set(v.x, TOP + 0.75, v.z); dyeDrop(); return true; } return false; }
    if (T.kind === 'seam') { if (!seamReady()) return true; const target = Math.min(SEAM.path.length - 1, Math.floor(Math.max(0, T.t - 0.5) / 2.4 * SEAM.path.length)); while (SEAM.prog < target) { SEAM.prog++; SEAM.dev += 0.12; SEAM.n++; SEAM.dirty = true; } H(seamWorld(SEAM.prog)); if (SEAM.prog % 6 === 0) tone(1200 + SEAM.prog * 6, 0.03, 0.02, 'square'); if (SEAM.prog >= SEAM.path.length - 2) { seamDone(); return true; } return false; }
    if (T.kind === 'test') { if (!slot.test) return true; H(K.plate.clone().add(V3(0, 0.25, 0.1)));
      if (TEST.st === 'wait' && T.t > 0.7) { cap('FLICK UP · THROW THE BALL AT THE WALL', 'FLICK'); testThrow(); T.t = 0; }
      else if (TEST.st === 'ret') { cap('TAP WHEN THE RING TURNS GREEN · CATCH!', 'TAP'); H(TEST.b.m.position); if (TEST.t / 0.95 >= 0.9) { testCatch(); T.t = 0; } }
      else if (TEST.st === 'dead' && T.t > 1.3) { cap('THUD! A DEAD BALL · SWIPE IT LEFT INTO REJECT', 'SWIPE'); testReject(); T.t = 0; }
      else if (TEST.st === 'dead') cap('THUD! A DEAD BALL · SWIPE IT LEFT INTO REJECT', 'SWIPE');
      return !slot.test; }
    if (T.kind === 'fill') { H(rackPos(T.k, 0)); if (T.t > 0.55) { T.t = 0; if (!canAdd(T.k) || CAN.st === 'pump') return true; } return false; }
    if (T.kind === 'pump') { H(K.pumpAt); if (CAN.p < 0.78) { if (T.t > 0.17) { T.t = 0; pumpTap(); } return false; } cap('GREEN! TWIST THE LID ROUND TO SEAL IT', 'TWIST'); H(K.canAt.clone().add(V3(Math.cos(S.t * 9) * 0.15, 0.6, Math.sin(S.t * 9) * 0.15))); CAN.twist += dt * 6; if (CAN.twist >= TAU * 0.85) { canSeal(); return true; } return false; }
    if (T.kind === 'ship') { const c = T.can, o = T.o; if (!outCans.includes(c) || o.st !== 'wait') return true; if (T.t < 0.6) { H(c.g.position.clone().add(V3(0, 0.3, 0))); return false; } const k = Math.min(1, (T.t - 0.6) / 0.8), to = o.f.position.clone().add(V3(0, 1.1, 0.4)); c.g.position.copy(K.outSlots[c.slot].clone().lerp(to, k)); H(c.g.position.clone().add(V3(0, 0.3, 0))); if (k >= 1) { deliver(c, o); return true; } return false; }
    return true; }
  function demoStep(dt) { hand.visible = !!DM.hp && S.phase === 'shift'; if (DM.hp) { hand.position.lerp(DM.hp.clone().add(V3(0.06, 0.16, 0.12)), Math.min(1, dt * 10)); hand.scale.setScalar(clamp(camera.position.distanceTo(hand.position) * 0.22, 0.5, 2)); }
    if (S.phase !== 'shift') return; if (DM.served >= 2) { DM.endT += dt; cap('THAT IS THE JOB! YOUR TURN · PUT ME TO WORK', '✓'); DM.hp = null; if (DM.endT > 3) demoStop(); return; }
    if (DM.task) { if (demoTask(dt)) { DM.task = null; DM.cd = 0.7; } return; } DM.cd -= dt; if (DM.cd <= 0) DM.cd = demoPlan(); }

  // ---------- WALK MODE (Game HUD) ----------
  const feltChoices = asked => [{ text: 'Put me to work.' }, { text: 'How is a ball made?', asked: asked.how }, { text: 'What does it pay?', asked: asked.pay }, { text: 'Just looking around.', bye: true }];
  function openFelt() { S.feltAsked = {}; S.dlg = { name: 'FELT', role: 'FOREMAN · BALL WORKS', text: FELT_LINES.greet, choices: feltChoices({}), step: 1, total: 1, more: false, required: false }; SND.play('blip'); felt.userData.hop = 1; }
  function nearTarget() { if (S.phase !== 'walk') return null; const p = V3(WALK.x, 0, WALK.z); if (p.distanceTo(V3(felt.position.x, 0, felt.position.z)) < 2.3) return { kind: 'felt', label: 'Talk to FELT' };
    let best = null, bd = 1.8; for (const L of K.looks) { const d = Math.hypot(L.p.x - p.x, L.p.z - p.z); if (d < bd) { bd = d; best = L; } } return best ? { kind: 'look', L: best, label: best.exit ? 'Exit to Gaya' : 'Look · ' + best.name } : null; }
  function blocked(x, z, r = 0.34) { for (const c of K.colliders) if (x > c.x0 - r && x < c.x1 + r && z > c.z0 - r && z < c.z1 + r) return true; return Math.hypot(x - felt.position.x, z - felt.position.z) < 0.6; }
  function walkStep(dt) { let sx = WALK.stick.x, sy = WALK.stick.y; if (keys.has('KeyW') || keys.has('ArrowUp')) sy = 1; if (keys.has('KeyS') || keys.has('ArrowDown')) sy = -1; if (keys.has('KeyA') || keys.has('ArrowLeft')) sx = -1; if (keys.has('KeyD') || keys.has('ArrowRight')) sx = 1;
    const m = Math.min(1, Math.hypot(sx, sy)), busy = !!S.dlg; let sp = 0;
    if (m > 0.08 && !busy) { const c = WALK.camYaw, fx = -Math.sin(c), fz = -Math.cos(c), rx = Math.cos(c), rz = -Math.sin(c); let mx = rx * sx + fx * sy, mz = rz * sx + fz * sy; const L = Math.hypot(mx, mz) || 1; mx /= L; mz /= L;
      sp = (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5.4 : 3.6) * m; const nx = WALK.x + mx * sp * dt, nz = WALK.z + mz * sp * dt; if (!blocked(nx, WALK.z)) WALK.x = nx; if (!blocked(WALK.x, nz)) WALK.z = nz;
      const want = Math.atan2(mx, mz); let d = want - WALK.yaw; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; WALK.yaw += d * Math.min(1, dt * 12); }
    benWalk.position.set(WALK.x, 0, WALK.z); benWalk.rotation.y = WALK.yaw; kit.animFox(benWalk, dt, sp); WALK.stepD = (WALK.stepD || 0) + sp * dt; if (WALK.stepD > (sp > 4.5 ? 1.15 : 0.85)) { WALK.stepD = 0; WALK.foot = !WALK.foot; SND.play('step', { vol: 0.5, rate: WALK.foot ? 1 : 1.12 }); }
    const near = Math.hypot(WALK.x - felt.position.x, WALK.z - felt.position.z) < 3.2; const fy = near ? Math.atan2(WALK.x - felt.position.x, WALK.z - felt.position.z) : 0.5; felt.rotation.y = damp(felt.rotation.y, fy, 5, dt);
    felt.userData.lineMood = S.dlg ? 'excited' : null; }
  function talk() { if (S.phase !== 'walk') return; if (S.dlg) { nextLine(); return; } const n = nearTarget(); if (!n) return; if (n.kind === 'felt') { openFelt(); return; }
    if (n.L.exit) { if (onExit) { onExit(); return; } toast('Out to Gaya. When the Ball Works sits in a Gaya building, this door leads back outside.', 4.5); return; } toast(n.L.name + ' · ' + n.L.line, 5); SND.play('blip', { rate: 1.2 }); }
  function choose(i) { if (!S.dlg || !S.dlg.choices) return; if (i === 0) { S.dlg = null; startShift(); return; }
    if (i === 1) { S.feltAsked.how = true; S.dlg = { ...S.dlg, text: FELT_LINES.how, choices: feltChoices(S.feltAsked) }; return; }
    if (i === 2) { S.feltAsked.pay = true; S.dlg = { ...S.dlg, text: FELT_LINES.pay, choices: feltChoices(S.feltAsked) }; return; }
    S.dlg = { ...S.dlg, text: FELT_LINES.bye, choices: null, step: 1, total: 1 }; }
  function nextLine() { if (S.dlg && !S.dlg.choices) S.dlg = null; }

  // ---------- main loop ----------
  const clock = new THREE.Clock(); let T = 0, hudT = 0, clockT = 0;
  function step(dt) { T += dt; const ph = S.phase, work = ph === 'shift';
    if (S.flashT > 0 && (S.flashT -= dt) <= 0) S.flash = null; if (S.sayT > 0 && (S.sayT -= dt) <= 0) S.say = ''; if (S.toastT > 0 && (S.toastT -= dt) <= 0) S.toast = null; if (S.reactT > 0 && (S.reactT -= dt) <= 0) S.react = null;
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 1.3; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = Math.max(0, p.life) * 0.75; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.55); }
    const amb = !work && ph !== 'glide'; ambient.forEach(a => { a.m.visible = amb; if (!amb) return; a.x += dt * 1.1; if (a.x > 6.6) a.x = -6.4; a.m.position.set(a.x, TOP + BR + 0.01, LZ); a.m.rotation.z -= dt * 10; });
    K.cut.forEach(m => m.visible = ph === 'intro'); K.front.forEach(m => m.visible = false);
    if (ph === 'glide') { S.glideT -= dt; if (S.glideT <= 0) S.phase = 'shift'; }
    if (work) { S.t += dt; S.next -= dt; const waiting = orders.filter(o => o.st !== 'leave').length; if (S.next <= 0 && waiting < 3 && S.t < FACTORY.shift - 20) { newOrder(); S.next = S.demo ? (DM.firstOrder && orders.length < 2 ? 26 : 40) : Math.max(13, 27 - S.day * 2) + rr(-3, 3); } else if (S.next <= 0) S.next = 2;
      if (PR.hold) { PR.v += dt / 1.45; if (PR.v > 1.2) pressRelease(); if (Math.random() < 0.3) audio.burst && audio.burst(0.05, 400 + PR.v * 900, 0.05); }
      moveBatches(dt); dyeStep(dt); testStep(dt); if (SEAM.dirty) { SEAM.dirty = false; drawSeam(); } flyStep(dt);
      if (S.autoT > 0 && (S.autoT -= dt) <= 0 && !G && !DM.on && performance.now() - S.userFocusT > 1500) { const h = nextHint(); if (h && h.station !== S.focus) S.focus = h.station; }
      if (!DM.on && !G && S.focus !== 'all') { const g0 = gesture(), idle = (performance.now() - (S.lastInput || 0)) / 1000; if (g0 && g0[0] === 'WAIT' && idle > 1.3 && performance.now() - S.userFocusT > 2500) { const h = nextHint(); if (h) S.focus = h.station; } }
      if (S.t >= FACTORY.shift) endShift(); }
    if (DM.on) demoStep(dt); else hand.visible = false;
    canStep(dt); ordersStep(dt);
    // press head
    { const hy = K.pressHeadY, k = PR.hold ? Math.min(1, PR.v / 0.95) : 0; PR.anim = Math.max(0, PR.anim - dt * 3); K.pressHead.position.y = damp(K.pressHead.position.y, hy.up + (hy.down - hy.up) * k - PR.anim * 0.05, PR.hold ? 30 : 8, dt); K.pressHead.position.x = K.st.press.x + (PR.hold ? Math.sin(T * 60) * 0.004 * PR.v : 0); }
    // needle on the seam board
    K.needle.visible = work && seamReady(); if (K.needle.visible) { const p = seamWorld(SEAM.prog); K.needle.position.copy(p).add(V3(0, 0.02, 0.06)); }
    // the worker walks along the line to the station in view
    if (ph === 'shift' || ph === 'glide' || ph === 'done') { benWork.visible = S.focus === 'all' || ph === 'glide'; const tgt = S.focus === 'all' ? V3(-8.1, 0, LZ + 1.3) : V3(K.st[S.focus].x - 1.75, 0, LZ + 0.75), d = tgt.clone().sub(benWork.position).setY(0), L = d.length();
      if (L > 0.05) { d.multiplyScalar(Math.min(L, dt * 4.2) / L); benWork.position.add(d); benWork.rotation.y = damp(benWork.rotation.y, Math.atan2(d.x, d.z), 10, dt); kit.animFox(benWork, dt, 4); } else { benWork.rotation.y = damp(benWork.rotation.y, Math.PI, 8, dt); kit.animFox(benWork, dt, 0); }
      benWork.userData.mood = S.react && S.react.stars === 3 ? 'excited' : 'happy'; }
    else if (ph === 'intro') { if ((S.introHop = (S.introHop || 0) - dt) <= 0) { S.introHop = 3.5 + Math.random() * 2; (Math.random() < 0.5 ? felt : benWork).userData.hop = 1; } benWork.rotation.y = damp(benWork.rotation.y, 0.15, 4, dt); benWork.userData.mood = 'excited'; kit.animFox(benWork, dt, 0); felt.rotation.y = damp(felt.rotation.y, 0.55, 4, dt); }
    if (ph === 'walk') walkStep(dt); else if (ph !== 'intro') felt.rotation.y = damp(felt.rotation.y, 0.6, 4, dt);
    // ---- sound: music by phase, held loops, countdown ticks, footsteps ----
    if (SND.ready) { const left = FACTORY.shift - S.t; SND.music(ph === 'shift' || ph === 'glide' ? (left < 20 && ph === 'shift' ? 'hurry' : 'work') : ph === 'done' ? 'off' : 'chill');
      SND.loop('hum', 0.1); SND.setLoop('hum', { vol: work ? 0.22 : 0.1, rate: work ? 1.08 : 1 });
      if (PR.hold) { SND.loop('hiss', 0.25); SND.setLoop('hiss', { vol: 0.2 + PR.v * 0.35, rate: 0.75 + PR.v * 0.6, freq: 1200 + PR.v * 6000 }); } else SND.stopLoop('hiss');
      if (work && (SEAM.stroke || (DM.on && DM.task && DM.task.kind === 'seam' && seamReady()))) SND.loop('stitch', 0.45); else SND.stopLoop('stitch');
      if (work && left <= 5.5 && left > 0) { const n = Math.ceil(left); if (n !== S.tick) { S.tick = n; SND.play('tick', { vol: 0.6, rate: n <= 2 ? 1.25 : 1 }); } } }
    fxStep(dt);
    if (impactT > 0) { impactT = Math.max(0, impactT - dt * 2.6); impact.visible = impactT > 0; impact.scale.setScalar(1 + (1 - impactT) * 3.5); impact.material.opacity = impactT; impact.material.color.setHex(impactCol); }
    tickFactory(K, dt, { busy: work || ph === 'glide' });
    if (K.pressLamps) { const red = PR.hold, grn = PR.anim > 0 && PR.last === 'PERFECT' || (!PR.hold && !slot.press && work && Math.sin(T * 4) > 0); K.pressLamps[1].material.color.copy(red ? K.pressLamps[1].userData.on : K.pressLamps[1].userData.off); K.pressLamps[0].material.color.copy(grn ? K.pressLamps[0].userData.on : K.pressLamps[0].userData.off); }
    K.spools.forEach((sp, i) => { sp.rotation.y += dt * (SEAM.stroke || (DM.on && DM.task && DM.task.kind === 'seam') ? 14 : 0.3) * (i ? -1 : 1); });
    meterT = Math.max(0, meterT - dt); K.meterLamps.forEach((m, i) => m.material.color.set(meterT > 0 && i < meterN ? (meterN >= 5 ? '#22c55e' : meterN >= 3 ? '#ffd23a' : '#ec3013') : '#3a3836'));


    kit.animFox(felt, dt, 0);
    // hint rings + catch ring
    RINGS.place(work && !DM.on ? nextHint() : null, T, dt);
    // camera
    const sh = ph === 'walk' ? walkShot() : ph === 'intro' ? introShot() : workShot(ph === 'done' ? 'all' : S.focus), rate = ph === 'glide' ? 2.6 : ph === 'walk' ? 5 : 3.4;
    camera.position.lerp(sh.pos, Math.min(1, dt * rate)); CAM.look.lerp(sh.look, Math.min(1, dt * rate)); camera.lookAt(CAM.look);
    if (S.shake > 0) { S.shake = Math.max(0, S.shake - dt * 3); const a = S.shake * S.shake * 0.035; camera.position.x += (Math.random() - 0.5) * a; camera.position.y += (Math.random() - 0.5) * a; } }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  const onVis = () => { if (document.hidden) { PAUSE = true; SND.suspend(); } else { PAUSE = !!S.userPause; SND.resume(); clock.getDelta(); } }; document.addEventListener('visibilitychange', onVis);
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);

  // ---------- HUD (what the page draws) ----------
  function hud() { const h = nextHint(), avg = S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, near = nearTarget();
    return { phase: S.phase, day: S.day, left: Math.max(0, FACTORY.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: avg, focus: S.focus,
      badges: badges(), hint: h ? { station: h.station, text: h.text } : null, gesture: gesture(),
      press: PR.hold ? { v: PR.v } : null, pump: S.phase === 'shift' && CAN.st === 'pump' && S.focus === 'can' ? { p: CAN.p, zone: pzone(CAN.p), twist: Math.min(1, CAN.twist / (TAU * 0.85)) } : null,
      seam: S.focus === 'seam' && seamReady() ? { prog: SEAM.prog / (SEAM.path.length - 1) } : null,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: save.flag('ballUniform'),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), colours: availCols().map(k => COLOURS[k].name),
      orders: orders.filter(o => o.st !== 'leave').map(o => ({ name: CUSTOMERS[o.ci].name, role: CUSTOMERS[o.ci].role, colName: COLOURS[o.col].short, col: COLOURS[o.col].col, dark: COLOURS[o.col].dark, cans: o.cans, got: o.got, pat: clamp(o.pat / o.patMax, 0, 1), price: o.price, waiting: o.st === 'wait', ready: o.st === 'wait' && outCans.some(c => c.col === o.col) })),
      rack: COL_KEYS.filter(k => COLOURS[k].day <= S.day).map(k => ({ k, n: rack[k].length, name: COLOURS[k].short, col: COLOURS[k].col })), out: outCans.length, sel: !!S.sel,
      demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null,
      prompt: S.phase === 'walk' && !S.dlg && near ? near.label : null, dialog: S.phase === 'walk' ? S.dlg : null, toast: S.toast, best: save.stat(SK.best, 0), combo: S.combo || 0, sound: SND.prefs }; }

  // warm up shaders + textures once so the first sparkle / catch / label never hitches on a phone
  { const tmp = [], show = o => { if (!o.visible) { o.visible = true; tmp.push(o); } }; FXP.forEach(P => show(P.s)); [impact, catchRing, catchCore, hand, K.needle].forEach(show); custFox.forEach(show);
    const warmCans = COL_KEYS.map((k, i) => { const g = makeCan(); g.userData.band.visible = true; g.userData.band.material = labelMat(k); g.userData.lid.visible = true; g.position.set(K.st.can.x + i * 0.3, -5, LZ); return g; });
    const warmBalls = COL_KEYS.flatMap(k => [newBall(ballMat(COLOURS[k].col, false)), newBall(ballMat(COLOURS[k].col, true))]); warmBalls.forEach(b => b.position.y = -5); newBall(toon('#7d7a70')).position.y = -5;
    const culled = []; scene.traverse(o => { if (o.frustumCulled) { o.frustumCulled = false; culled.push(o); } }); try { renderer.compile(scene, camera); renderer.render(scene, camera); } catch (e) {} culled.forEach(o => o.frustumCulled = true);
    tmp.forEach(o => o.visible = false); warmCans.forEach(g => scene.remove(g)); warmBalls.forEach(b => scene.remove(b)); }
  frame(); drawSeam(); toIntro();
  function shipTo(i) { if (S.phase !== 'shift' || DM.on) return false; const o = orders.filter(q => q.st !== 'leave')[i]; if (!o) return false; if (o.st !== 'wait') { flash(CUSTOMERS[o.ci].name + ' IS STILL WALKING IN', '#ffffff'); return false; }
    const can = S.sel && S.sel.col === o.col ? S.sel : outCans.find(c => c.col === o.col); if (!can) { flash('NO ' + COLOURS[o.col].short + ' CAN ON THE SHELF YET', '#ffffff'); return false; } return deliver(can, o); }
  const api = { shipTo, startShift, endShift, demoStart, demoStop, toIntro, toWalk() { S.prevPhase = S.phase; toWalk(); }, buyUpgrade, setFocus, hud, setSafe,
    // Game HUD contract (walk mode)
    start() {}, talk, choose, closeDialog() { S.dlg = null; }, nextLine, clearToast() { S.toast = null; }, melee() { talk(); }, range() {}, jump() { if (S.phase === 'walk') benWalk.userData.hop = 1; }, meleeUp() {},
    useItem() { toast('No snacks on the factory floor! Felt rule No. 1.', 2.5); }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; S.userPause = !!v; }, setHudPad() {}, setStick(x, y) { WALK.stick.x = x; WALK.stick.y = y; },
    eyeLook(dx = 0) { WALK.camYaw -= dx * 0.01; }, eyeRelease() {}, togglePov() { return false; }, lookBy(dx = 0) { WALK.camYaw -= dx * 0.006; }, zoomBy(f = 1) { WALK.camDist = clamp(WALK.camDist * f, 0.6, 1.5); },
    getCam() { return { dist: WALK.camDist * 8, pitch: 0.6 }; }, setCam() {}, setMinimap() {}, toggleSound() { SND.init(); const on = !(SND.prefs.music || SND.prefs.sfx); SND.setMusic(on); SND.setSfx(on); return !on; }, sfx(name) { SND.init(); SND.play(name, { vol: 0.5 }); }, soundCycle() { SND.init(); return SND.cycle(); }, soundPrefs: () => SND.prefs, cycleWeather() {},
    mapData() { return { p: [WALK.x, WALK.z, WALK.yaw], b: [...STATIONS.map(k => [k.toUpperCase(), K.st[k].x, K.st[k].z]), ['OFFICE', K.office.x, K.office.z], ['DOCK', K.dockDoor.x, K.dockDoor.z], ['DOOR', K.door.x, K.door.z]], f: [[felt.position.x, felt.position.z]], e: [], q: S.phase === 'walk' ? [felt.position.x, felt.position.z, 'FELT'] : null }; },
    // test hooks
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => ({ S, slot, rack, CAN, TEST, SEAM, PR, orders, outCans, batches, DM, WALK }), _skip(t) { S.t = Math.max(S.t, FACTORY.shift - t); },
    _scr: p => { const r = renderer.domElement.getBoundingClientRect(), s = scr(p); return { x: r.left + s.x, y: r.top + s.y }; }, _K: K, _snd: SND, _info: () => ({ calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures }), _seamPt: i => seamWorld(i),
    destroy() { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onVis); SND.destroy(); removeEventListener('resize', onRs); ro.disconnect(); STAGE().removeEventListener('pointerdown', onDown); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onCancel); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
