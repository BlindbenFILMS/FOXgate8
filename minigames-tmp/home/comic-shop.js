// 8 GATES — BRAMBLE'S COMICS [gayaLibrarySquare] · Home planet. Ben is hired at Bramble's comic shop to make the comics.
// From the 2D Home planet file: COMICS (gayaLibrarySquare) — bookshelves on every wall, two black 8 banners, SUPERFOX + IRON FOX
// cardboard standees over SHELF SCREENS playing hero reels, the round 8 display (spinner) with four spotlights, two reading
// tables, bunting, red + blue poster stands, Bramble's counter by the door, the long desk at the back (now the ART DESK).
// Bramble's greeting + lines are verbatim from the 2D file (gayaComicOwner).
// WALK: Ben walks the shop with the standard Game HUD (talk to Bramble, spin the spinner, look at the standees, sit at the desk).
// JOB (like Jon's Boatworks: one item at a time, no clock, scored on quality): a fox from town walks in with a COMMISSION,
// Ben makes the page at the art desk with one touch gesture per task, right on the paper:
//   PANELS swipe along the dashed gutters · PENCIL drag over the blue dots · INK hold on a drawing, let go when the line closes (green)
//   COLOUR pick a colour, tap the shapes (colour by number) · SFX pick the word, tap to pump it up · LETTER pick the line, drag the balloon
//   TITLE (covers) hold the stamp, let go in the green. Pinch the page to zoom, two fingers to pan.
// A day = 3 commissions → wage, tips, stars, employee of the day, upgrades, the artist uniform (beret + COMICS apron).
// Save keys home.comics.*, flag comicsUniform. Built on engine/restaurant-kit.js (stage, camera fit).
// MERGE: buildComicShop(ctx) builds the interior at an origin; createComicShop({ container, onState }) runs it stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, pick } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit } from '../../engine/restaurant-kit.js';
import { comicAudio } from './comic-audio.js';

export const COMICS = { name: "BRAMBLE'S COMICS", room: 'gayaLibrarySquare', perDay: 3 };
export const INKS = { red: { n: 1, name: 'RED', col: '#d8432f' }, orange: { n: 2, name: 'ORANGE', col: '#ef8a2c' }, gold: { n: 3, name: 'GOLD', col: '#f2c94c' }, blue: { n: 4, name: 'BLUE', col: '#3b7fe0' }, purple: { n: 5, name: 'PURPLE', col: '#7c4dbe' }, steel: { n: 6, name: 'STEEL', col: '#9aa7b4' } };
export const IK = Object.keys(INKS);
export const SERIES = {
  superfox: { name: 'SUPERFOX', head: 'orange', inner: 'mask', innerCol: 'red', prop: 'star', propCol: 'gold', sfx: 'KA-POW!', sky: ['blue', 'purple'] },
  ironfox: { name: 'IRON FOX', head: 'steel', inner: 'visor', innerCol: 'blue', prop: 'bolt', propCol: 'gold', sfx: 'ZAP!', sky: ['purple', 'orange'] },
  pizza: { name: 'PIZZA PATROL', head: 'orange', inner: 'cap', innerCol: 'red', prop: 'pizza', propCol: 'gold', sfx: 'BLAM!', sky: ['blue', 'purple'] },
  hope: { name: 'HOPE', head: 'gold', inner: 'glasses', innerCol: 'purple', prop: 'heart', propCol: 'red', sfx: 'WHOOSH!', sky: ['blue', 'orange'] } };
export const SFX_WORDS = ['KA-POW!', 'ZAP!', 'BLAM!', 'WHOOSH!'];
export const FACES = ['HAPPY', 'ANGRY', 'SCARED'];
export const PROPS = { star: 'gold', bolt: 'gold', pizza: 'gold', heart: 'red', rocket: 'red' };
export const BOOKS = {
  strip: { name: '3-PANEL STRIP', price: 14, tasks: ['panels', 'pencil', 'ink', 'colour', 'letter'] },
  cover: { name: 'COVER', price: 16, tasks: ['pencil', 'ink', 'colour', 'title'] },
  action: { name: 'ACTION PAGE', price: 20, tasks: ['panels', 'pencil', 'ink', 'colour', 'sfx', 'letter'] } };
export const TASKS = { panels: { label: 'PANELS', name: 'Cut the panel borders' }, pencil: { label: 'PENCIL', name: 'Pencil the drawings' }, ink: { label: 'INK', name: 'Ink the lines' }, colour: { label: 'COLOUR', name: 'Colour by number' }, sfx: { label: 'SFX', name: 'Pump up the sound effect' }, letter: { label: 'LETTER', name: 'Letter the balloons' }, title: { label: 'TITLE', name: 'Stamp the title' }, face: { label: 'FACE', name: "Pick the hero's face" }, sign: { label: 'SIGN', name: 'Sign your page' } };
export const ORDER = ['panels', 'pencil', 'ink', 'face', 'colour', 'sfx', 'letter', 'title', 'sign'];
export const UPGRADES = [
  { id: 'lightbox', name: 'LIGHT BOX', cost: 40, line: 'Pencil dots catch from twice as far.' },
  { id: 'nib', name: 'STEADY NIB', cost: 35, line: 'Ink flows slower, so the green lasts longer.' },
  { id: 'ruler', name: 'STEEL RULER', cost: 30, line: 'Every panel cut comes out dead straight.' },
  { id: 'stamp', name: 'BIG STAMP', cost: 30, line: 'The title stamp green zone is twice as wide.' },
  { id: 'radio', name: 'SHOP RECORD PLAYER', cost: 60, line: 'Customers tip 25% more.' }];
// The town's foxes (names + torso colours from the 2D Home planet file; the hello lines are new)
export const CUSTOMERS = [
  { name: 'PLUM', torso: ['#d9d9d9', '#969696', '#525252'], fur: '#fdba74', outfit: 'vest' }, { name: 'MAUVE', torso: ['#d9d9d9', '#949494', '#363636'], fur: '#fbcd93', outfit: 'coat' },
  { name: 'IRIS', torso: ['#eaeaea', '#b2b2b2', '#707070'], fur: '#ffdcae', outfit: 'dress' }, { name: 'BROTHER CINNABAR', torso: ['#f2f6fa', '#d3dde6', '#9fb0be'], fur: '#f5a06a', outfit: 'robe' },
  { name: 'AMETHYST', torso: ['#b2b2b2', '#707070', '#2c2c2c'], fur: '#eb9a5e', outfit: 'vest' }, { name: 'LILAC', torso: ['#f0f0f0', '#d9d9d9', '#949494'], fur: '#fdba74', outfit: 'dress' },
  { name: 'SISTER DAMSON', torso: ['#f2f6fa', '#d3dde6', '#9fb0be'], fur: '#eb9a5e', outfit: 'robe' }, { name: 'ORCHID', torso: ['#c8c8c8', '#8e8e8e', '#3e3e3e'], fur: '#ffdcae', outfit: 'coat' },
  { name: 'PIP', torso: ['#cfe0f5', '#5f8ad0', '#22406b'], fur: '#fdba74', outfit: 'vest' }, { name: 'SAL', torso: ['#efe2c8', '#c9b48a', '#7d6a4a'], fur: '#fdba74', outfit: 'vest' }];
export const HELLO = ['I have wanted this comic since I was a cub.', 'Make it loud. Make it {MOOD}.', 'Bramble says you are the new hand. No pressure.', 'I will frame it. Probably. Unless it is bad.', 'Take your time. Actually, not too much time.', 'I read the last one under my blanket with a torch.'];
export const SAVE = { day: 'home.comics.day', best: 'home.comics.best', upg: 'home.comics.upg.', stars: 'home.comics.stars' };
export const BRAMBLE = { name: 'BRAMBLE', role: 'COMICS', torso: ['#e8c06a', '#c9903f', '#7d5a22'], fur: '#fdba74', furDark: '#ea580c',
  greeting: 'Careful of the spinner, it bites. Anything you want, I have read it twice.',
  best: [['player', "What's the best thing in here?"], ['npc', 'Depends. Do you want the one that is good, or the one I will not shut up about?'], ['player', 'The second one.'], ['npc', 'SUPERFOX, issue forty. He gives up the cape for eleven pages. ELEVEN. I had to sit down.'], ['player', 'And the robot one?'], ['npc', 'IRON FOX. All bolts and no feelings, allegedly. Read issue twelve and tell me that with a straight face.']],
  job: [['npc', 'You can hold a pencil? Good. The long desk at the back is yours.'], ['npc', 'Folk come in and ask for a page. You make it. They pay you, they tip you if it sings, and I take nothing because I am generous and also you are not very fast yet.']] };
// balloon lines by mood ({H} = the hero)
export const LINES = {
  FUNNY: [['MY CAPE IS STUCK IN THE DOOR. AGAIN.', 'I ORDERED ONE SLICE. WHO ORDERED NINE?', 'IS IT TOO LATE TO BE A DENTIST?', 'NOBODY TOLD ME THE CITY HAD STAIRS.'], ['...AND THAT IS WHY {H} DOES NOT FLY AFTER LUNCH.', 'NEXT TIME, I AM TAKING THE BUS.', 'WORTH IT. EXCEPT THE CAPE.', 'NOTE TO SELF: KNOCK FIRST.']],
  HEROIC: [['THIS LOOKS LIKE A JOB FOR {H}!', 'STAND BACK, CITIZENS!', 'NOT ON MY WATCH!', 'THE CITY NEEDS ME!'], ['THE CITY IS SAFE. FOR NOW.', 'JUSTICE NEVER SLEEPS. I DO, A BIT.', 'ANOTHER DAY SAVED!', 'NO ONE GETS LEFT BEHIND.']],
  SPOOKY: [['SOMETHING IS MOVING IN THE DARK...', 'THE LIGHTS ALL WENT OUT AT ONCE.', 'DID YOU HEAR THAT?', 'WE ARE NOT ALONE IN HERE.'], ['IT WAS ONLY BRAMBLE. READING. IN THE DARK.', 'THE SHADOW... HAD MY FACE.', 'AND THE DOOR LOCKED BEHIND US.', 'IT IS STILL OUT THERE.']] };
export const MOODS = Object.keys(LINES);
// Bramble's pizza order (Home planet delivery stop gayaComicOwner) — verbatim from the 2D file
export const PIZZA_LINES = { waiting: ["Before you say anything - has Sal's place got anybody running the orders yet?", 'I put in for one on Thirdday. It is Fifthday. I have read the whole of IRON FOX waiting for it and I am not a fast reader.', 'She is not slow. She is ONE FOX, and one fox cannot be at the oven and at my door.'],
    got: ['Oh that is HOT. Do not put it on the longboxes. Do not — thank you.', 'Warm. Fine. I have eaten worse over an issue of IRON FOX.', 'Cold pizza is a legitimate food group and I will hear nothing against it.'] };
// THE SNOW KING (the Home planet's Snow Fort boss) gets the last word on action pages
export const VLINES = { FUNNY: ['MY CROWN IS MELTING. THIS IS NOT FAIR.', 'I WANTED A SNOW DAY. FOREVER.', 'WHO TURNED THE HEATING ON?!'], HEROIC: ['YOU HAVE NOT SEEN THE LAST OF THE SNOW KING!', 'I WILL RETURN... NEXT WINTER!', 'CURSE YOU AND YOUR WARM HEART!'], SPOOKY: ['THE COLD IS ALREADY INSIDE YOUR HOUSE...', 'LISTEN. THE SNOW IS WHISPERING.', 'I AM IN EVERY FLAKE.'] };

// ---------------- the comic page (page px, 640 x 960) ----------------
export const PW = 640, PH = 960;
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const bbox = pts => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; for (const [x, y] of pts) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 }; };
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
// unit shapes, centred on 0,0, about 1 across, y down
const UNIT = {
  head: [[0, 0.5], [-0.24, 0.4], [-0.4, 0.24], [-0.5, 0.02], [-0.45, -0.22], [-0.5, -0.76], [-0.2, -0.38], [0, -0.42], [0.2, -0.38], [0.5, -0.76], [0.45, -0.22], [0.5, 0.02], [0.4, 0.24], [0.24, 0.4]],
  mask: [[-0.46, -0.16], [0.46, -0.16], [0.42, 0.06], [0.1, 0.09], [0, 0.03], [-0.1, 0.09], [-0.42, 0.06]],
  visor: [[-0.43, -0.17], [0.43, -0.17], [0.36, 0.07], [-0.36, 0.07]],
  cap: [[-0.28, -0.3], [-0.24, -0.5], [-0.1, -0.6], [0.1, -0.6], [0.24, -0.5], [0.28, -0.32], [0.62, -0.28], [0.56, -0.2], [-0.28, -0.22]],
  star: (() => { const o = []; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.22 : 0.52; o.push([Math.cos(a) * r, Math.sin(a) * r]); } return o; })(),
  bolt: [[-0.08, -0.52], [0.26, -0.52], [0.06, -0.1], [0.3, -0.1], [-0.2, 0.52], [-0.04, 0.06], [-0.28, 0.06]],
  pizza: [[-0.44, -0.36], [-0.2, -0.46], [0.2, -0.46], [0.44, -0.36], [0, 0.52]],
  glasses: [[-0.46, -0.15], [0.46, -0.15], [0.42, -0.02], [0.3, 0.07], [0.12, 0.05], [0.04, -0.04], [-0.04, -0.04], [-0.12, 0.05], [-0.3, 0.07], [-0.42, -0.02]],
  heart: [[0, -0.22], [0.14, -0.42], [0.36, -0.44], [0.5, -0.24], [0.44, 0.02], [0, 0.48], [-0.44, 0.02], [-0.5, -0.24], [-0.36, -0.44], [-0.14, -0.42]],
  rocket: [[0, -0.56], [0.17, -0.3], [0.17, 0.26], [0.33, 0.5], [-0.33, 0.5], [-0.17, 0.26], [-0.17, -0.3]],
  crown: [[-0.32, -0.38], [-0.34, -0.66], [-0.17, -0.5], [0, -0.72], [0.17, -0.5], [0.34, -0.66], [0.32, -0.38]],
  moon: (() => { const o = []; for (let i = 0; i < 20; i++) { const a = i / 20 * Math.PI * 2; o.push([Math.cos(a) * 0.5, Math.sin(a) * 0.5]); } return o; })() };
const place = (u, cx, cy, s) => u.map(([x, y]) => [cx + x * s, cy + y * s]);
function skyline(R, xa, xb, base, hMin, hMax) { const o = [[xa, base]]; let x = xa; while (x < xb - 10) { const w = Math.min(xb - x, 46 + R() * 44), h = hMin + R() * (hMax - hMin); o.push([x, base - h], [x + w, base - h]); x += w; } o.push([xb, base]); return o; }
function polyLen(pts) { const cum = [0]; let L = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; L += Math.hypot(b[0] - a[0], b[1] - a[1]); cum.push(L); } return { L, cum }; }
function pointAt(pts, cum, d) { const L = cum[cum.length - 1]; d = ((d % L) + L) % L; let i = 0; while (i < pts.length - 1 && cum[i + 1] < d) i++; const a = pts[i], b = pts[(i + 1) % pts.length], seg = cum[i + 1] - cum[i] || 1, k = (d - cum[i]) / seg; return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1; let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2; t = clamp(t, 0, 1); return { d: Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy), t }; };
export const pageMath = { bbox, polyLen, pointAt, segDist };

// Builds one page: panels, gutters, shapes (drawing + colour regions), balloons, sfx, title. Everything the tasks act on.
export function makePage(job) {
  const R = rng(job.seed), SR = SERIES[job.series], P = { job, panels: [], gutters: [], shapes: [], bgs: [], balloons: [], sfx: null, title: null, strays: [], blots: [], frame: null, band: null };
  const H = job.star || SR.name, mood = job.mood, sky = job.sky, cityCol = sky === 'purple' ? 'blue' : 'purple';
  if (job.book === 'strip') { P.frame = [36, 36, 604, 924]; P.panels = [rect(36, 36, 604, 323), rect(36, 337, 604, 623), rect(36, 637, 604, 924)]; P.gutters = [{ a: [36, 330], b: [604, 330] }, { a: [36, 630], b: [604, 630] }]; }
  else if (job.book === 'action') { P.frame = [36, 36, 604, 924]; P.panels = [[[36, 36], [604, 36], [604, 413], [36, 553]], [[36, 567], [604, 427], [604, 924], [36, 924]]]; P.gutters = [{ a: [36, 560], b: [604, 420] }]; }
  else { P.frame = [36, 190, 604, 924]; P.band = [36, 36, 604, 176]; P.panels = [rect(36, 190, 604, 924)]; }
  P.gutters.forEach(g => Object.assign(g, { cut: false, q: 1, anim: 0 }));
  const add = (kind, pts, want, panel, o = {}) => { const s = { id: P.shapes.length, kind, pts, want, panel, dots: [], inkV: 0, inked: false, q: 1, restarts: 0, fill: null, fillAt: null, fillT: 1, ...o }; const { L, cum } = polyLen(pts); s.L = L; s.cum = cum; s.bb = bbox(pts);
    const n = Math.max(8, Math.round(L / 26)); for (let i = 0; i < n; i++) { const p = pointAt(pts, cum, i / n * L); s.dots.push({ x: p[0], y: p[1], lit: false }); } P.shapes.push(s); return s; };
  const hero = (panel, cx, cy, s) => { const h = add('head', place(UNIT.head, cx, cy, s), SR.head, panel, { cx, cy, s, series: job.series }); h.label = [cx - s * 0.27, cy + s * 0.2]; const inn = add(SR.inner, place(UNIT[SR.inner], cx, cy, s), SR.innerCol, panel, { cx, cy, s, parent: h.id }); return h; };
  const prop = (panel, cx, cy, s, kind) => { kind = kind || SR.prop; const p = add(kind, place(UNIT[kind], cx, cy, s), PROPS[kind] || SR.propCol, panel, { cx, cy, s }); if (kind === 'pizza') p.label = [cx, cy - s * 0.18]; if (kind === 'rocket') p.label = [cx, cy + s * 0.12]; return p; };
  const villain = (panel, cx, cy, s) => { const h = add('snowking', place(UNIT.moon, cx, cy + s * 0.05, s * 0.95), 'steel', panel, { cx, cy, s }); h.label = [cx - s * 0.22, cy + s * 0.22]; add('crown', place(UNIT.crown, cx, cy, s), 'gold', panel, { cx, cy, s }); return h; };
  const city = (panel, xa, xb, base, h0, h1) => { const pts = skyline(R, xa, xb, base, h0, h1), c = add('city', pts, cityCol, panel); const b = bbox(pts); c.label = [b.cx, b.y1 - Math.min(40, (b.h) * 0.4)]; return c; };
  const moon = (panel, cx, cy, s) => add('moon', place(UNIT.moon, cx, cy, s), 'gold', panel, { cx, cy, s });
  const balloon = (panel, spot, head, slot) => { const opts = MOODS.map(m => ({ t: (slot === 'v' ? pick(VLINES[m]) : pick(LINES[m][slot])).replace('{H}', H), mood: m })).sort(() => R() - 0.5); P.balloons.push({ panel, spot, tail: [head.cx, head.cy - head.s * 0.1], opts, picked: null, pos: null, placed: false, q: 1 }); };
  if (job.book === 'strip') { const h1 = hero(0, 160, 190, 190); city(0, 300, 604, 323, 70, 150); const h2 = hero(1, 456, 486, 190); prop(1, 190, 486, 170, job.prop); const h3 = hero(2, 220, 795, 210);
    balloon(0, { x: 438, y: 104, rx: 156, ry: 62 }, h1, 0); balloon(2, { x: 452, y: 724, rx: 146, ry: 66 }, h3, 1); }
  else if (job.book === 'action') { const h1 = hero(0, 190, 260, 250); prop(0, 455, 165, 170); moon(1, 545, 650, 96); city(1, 300, 604, 924, 90, 190); const h2 = villain(1, 150, 752, 170);
    const others = SFX_WORDS.filter(w => w !== SR.sfx).sort(() => R() - 0.5).slice(0, 2), opts = [SR.sfx, ...others].sort(() => R() - 0.5);
    P.sfx = { x: 430, y: 330, want: SR.sfx, opts, picked: null, pumps: 0, need: 6, done: false, q: 1, pop: 0 }; balloon(1, { x: 380, y: 604, rx: 132, ry: 58 }, h2, 'v'); }
  else { const h = hero(0, 250, 540, 360); prop(0, 510, 300, 140); city(0, 36, 604, 924, 70, 170); P.title = { text: SR.name, star: job.star || '', issue: job.issue, v: 0, stamped: false, q: 1, look: '' }; }
  // backgrounds (sky) per panel
  P.panels.forEach((poly, i) => { const b = bbox(poly), cand = [[b.x0 + 34, b.y0 + 34], [b.x1 - 34, b.y0 + 34], [b.x0 + 34, b.y1 - 34], [b.x1 - 34, b.y1 - 34], [b.cx, b.y0 + 34], [b.cx, b.cy]];
    P.bgs.push({ id: 'bg' + i, kind: 'bg', panel: i, pts: poly, want: sky, fill: null, fillAt: null, fillT: 1, cand }); });
  P.regions = () => [...P.bgs, ...P.shapes];
  P.face = null; P.sign = job.sign ? { box: [404, 862, 596, 916], strokes: [], len: 0 } : null;
  return P;
}

// ---------------- drawing the page onto a canvas (the texture on the drafting board) ----------------
const INKC = '#151312', BLUE_GUIDE = '#4f9fe0', FONT_C = '"Archivo", "Arial Black", Arial, sans-serif';
export function pageArt(P) {
  const cv = document.createElement('canvas'); cv.width = PW; cv.height = PH; const c = cv.getContext('2d');
  const mkPath = pts => { const p = new Path2D(); pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); return p; };
  P.shapes.forEach(s => { s.path = mkPath(s.pts); }); P.bgs.forEach(b => { b.path = mkPath(b.pts); }); P.panelPaths = P.panels.map(mkPath);
  const dot = document.createElement('canvas'); dot.width = dot.height = 12; { const g = dot.getContext('2d'); g.fillStyle = 'rgba(0,0,0,0.13)'; g.beginPath(); g.arc(6, 6, 2.3, 0, 7); g.fill(); } const halftone = c.createPattern(dot, 'repeat');
  const gr = document.createElement('canvas'); gr.width = gr.height = 128; { const g = gr.getContext('2d'); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? 'rgba(120,100,70,0.06)' : 'rgba(255,255,255,0.08)'; g.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5); } } const grain = c.createPattern(gr, 'repeat');
  const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const inShape = (x, y) => P.shapes.some(s => c.isPointInPath(s.path, x, y));
  P.bgs.forEach(b => { b.label = b.cand.find(([x, y]) => c.isPointInPath(P.panelPaths[b.panel], x, y) && !inShape(x, y) && !P.balloons.some(q => q.panel === b.panel && Math.hypot((x - q.spot.x) / (q.spot.rx + 24), (y - q.spot.y) / (q.spot.ry + 24)) < 1)) || b.cand[0]; });
  P.shapes.forEach(s => { if (!s.label) { const b = s.bb; s.label = [b.cx, b.cy]; } });
  let HC = false; const patCache = {};
  const patFor = k => { if (patCache[k]) return patCache[k]; const p = document.createElement('canvas'); p.width = p.height = 24; const g = p.getContext('2d'); g.strokeStyle = 'rgba(0,0,0,0.42)'; g.fillStyle = 'rgba(0,0,0,0.42)'; g.lineWidth = 3;
    if (k === 'red') { g.beginPath(); g.moveTo(0, 24); g.lineTo(24, 0); g.moveTo(-6, 6); g.lineTo(6, -6); g.moveTo(18, 30); g.lineTo(30, 18); g.stroke(); } else if (k === 'orange') { g.beginPath(); g.arc(12, 12, 4, 0, 7); g.fill(); } else if (k === 'gold') { g.fillRect(0, 10, 24, 3); } else if (k === 'blue') { g.fillRect(10, 0, 3, 24); } else if (k === 'purple') { g.beginPath(); g.moveTo(0, 0); g.lineTo(24, 24); g.moveTo(24, 0); g.lineTo(0, 24); g.stroke(); } else { g.fillRect(0, 0, 12, 12); g.fillRect(12, 12, 12, 12); }
    return (patCache[k] = c.createPattern(p, 'repeat')); };
  function fillRegion(r) { if (!r.fill) return; c.save(); c.clip(r.path); if (r.fillT < 1) { c.beginPath(); c.arc(r.fillAt[0], r.fillAt[1], 24 + ease(r.fillT) * 760, 0, 7); c.clip(); }
    c.fillStyle = INKS[r.fill].col; c.fill(r.path); if (HC) { c.fillStyle = patFor(r.fill); c.fill(r.path); } else if (r.kind === 'bg') { c.fillStyle = halftone; c.fill(r.path); }
    if (r.kind !== 'bg') { const b = r.bb, k = Math.max(4, Math.min(16, Math.min(b.w, b.h) * 0.075)), rim = (dx, dy, col) => { const p2 = new Path2D(); p2.rect(b.x0 - 40, b.y0 - 40, b.w + 80, b.h + 80); p2.addPath(r.path, new DOMMatrix().translate(dx, dy)); c.save(); c.clip(p2, 'evenodd'); c.fillStyle = col; c.fill(r.path); c.restore(); };
      rim(-k, -k, 'rgba(20,10,30,0.2)'); rim(k * 0.7, k * 0.7, 'rgba(255,255,255,0.26)'); if (!HC) { c.save(); c.globalAlpha = 0.5; c.fillStyle = halftone; const p3 = new Path2D(); p3.rect(b.x0 - 40, b.y0 - 40, b.w + 80, b.h + 80); p3.addPath(r.path, new DOMMatrix().translate(-k * 1.8, -k * 1.8)); c.clip(p3, 'evenodd'); c.fill(r.path); c.restore(); } }
    c.restore(); }
  function strokeAlong(s, d0, v, w) { if (v <= 0) return; c.beginPath(); let p = pointAt(s.pts, s.cum, d0); c.moveTo(p[0], p[1]); for (let d = 6; d < v; d += 6) { p = pointAt(s.pts, s.cum, d0 + d); c.lineTo(p[0], p[1]); } p = pointAt(s.pts, s.cum, d0 + v); c.lineTo(p[0], p[1]); c.lineWidth = w; c.strokeStyle = INKC; c.lineCap = 'round'; c.lineJoin = 'round'; c.stroke(); }
  const inkW = s => (s.kind === 'city' ? 5 : s.s && s.s < 150 ? 5 : 6.5) * (HC ? 1.5 : 1);
  function details(s) { const S = s.s || 100, x = s.cx, y = s.cy; c.save(); c.strokeStyle = INKC; c.fillStyle = INKC; c.lineCap = 'round'; c.lineJoin = 'round';
    if (s.kind === 'head') { const inner = SERIES[s.series].inner; c.lineWidth = Math.max(3, S * 0.018);
      for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(x + sx * 0.44 * S, y - 0.6 * S); c.lineTo(x + sx * 0.3 * S, y - 0.37 * S); c.stroke(); }
      if (inner === 'mask') { for (const sx of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + sx * 0.2 * S, y - 0.045 * S, 0.085 * S, 0.05 * S, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = INKC; c.beginPath(); c.arc(x + sx * 0.19 * S, y - 0.04 * S, 0.03 * S, 0, 7); c.fill(); } }
      else if (inner === 'visor') { c.strokeStyle = '#e8fbff'; c.lineWidth = Math.max(4, S * 0.03); for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(x + sx * 0.08 * S, y - 0.05 * S); c.lineTo(x + sx * 0.3 * S, y - 0.05 * S); c.stroke(); } c.strokeStyle = INKC; c.lineWidth = Math.max(3, S * 0.018); }
      else if (inner === 'glasses') { c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(3, S * 0.02); for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(x + sx * 0.32 * S, y - 0.1 * S); c.lineTo(x + sx * 0.22 * S, y - 0.01 * S); c.stroke(); } c.strokeStyle = INKC; c.lineWidth = Math.max(3, S * 0.018);
        c.fillStyle = '#ffffff'; for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(x + 0.2 * S, y - 0.47 * S); c.lineTo(x + 0.2 * S + sx * 0.16 * S, y - 0.58 * S); c.lineTo(x + 0.2 * S + sx * 0.16 * S, y - 0.36 * S); c.closePath(); c.fill(); c.stroke(); } c.beginPath(); c.arc(x + 0.2 * S, y - 0.47 * S, 0.035 * S, 0, 7); c.fill(); c.stroke(); c.fillStyle = INKC; }
      else { for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(x + sx * 0.17 * S, y - 0.03 * S, 0.045 * S, 0.065 * S, 0, 0, 7); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + sx * 0.17 * S + 0.015 * S, y - 0.055 * S, 0.016 * S, 0, 7); c.fill(); c.fillStyle = INKC; } }
      c.beginPath(); c.moveTo(x - 0.06 * S, y + 0.16 * S); c.lineTo(x + 0.06 * S, y + 0.16 * S); c.lineTo(x, y + 0.23 * S); c.closePath(); c.fill();
      const F = P.face; if (F) { c.lineWidth = Math.max(4, S * 0.026); const by = inner === 'mask' || inner === 'visor' || inner === 'glasses' ? -0.22 : -0.15; for (const sx of [-1, 1]) { c.beginPath(); if (F === 'ANGRY') { c.moveTo(x + sx * 0.3 * S, y + (by - 0.04) * S); c.lineTo(x + sx * 0.08 * S, y + (by + 0.04) * S); } else if (F === 'SCARED') { c.moveTo(x + sx * 0.3 * S, y + (by + 0.03) * S); c.lineTo(x + sx * 0.1 * S, y + (by - 0.05) * S); } else { c.moveTo(x + sx * 0.28 * S, y + by * S); c.quadraticCurveTo(x + sx * 0.19 * S, y + (by - 0.05) * S, x + sx * 0.1 * S, y + by * S); } c.stroke(); } c.lineWidth = Math.max(3, S * 0.018); }
      if (F === 'SCARED') { c.fillStyle = '#5a1a1a'; c.beginPath(); c.ellipse(x, y + 0.31 * S, 0.06 * S, 0.075 * S, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#9ed2ff'; c.beginPath(); c.moveTo(x + 0.4 * S, y - 0.2 * S); c.quadraticCurveTo(x + 0.46 * S, y - 0.08 * S, x + 0.4 * S, y - 0.06 * S); c.quadraticCurveTo(x + 0.34 * S, y - 0.08 * S, x + 0.4 * S, y - 0.2 * S); c.fill(); c.lineWidth = 2; c.stroke(); c.fillStyle = INKC; }
      else if (F === 'ANGRY') { c.beginPath(); c.moveTo(x - 0.12 * S, y + 0.32 * S); c.quadraticCurveTo(x, y + 0.25 * S, x + 0.12 * S, y + 0.32 * S); c.stroke(); }
      else if (F === 'HAPPY') { c.fillStyle = '#5a1a1a'; c.beginPath(); c.moveTo(x - 0.13 * S, y + 0.27 * S); c.quadraticCurveTo(x, y + 0.42 * S, x + 0.13 * S, y + 0.27 * S); c.closePath(); c.fill(); c.stroke(); c.fillStyle = INKC; }
      else { c.beginPath(); c.moveTo(x - 0.12 * S, y + 0.28 * S); c.quadraticCurveTo(x - 0.05 * S, y + 0.35 * S, x, y + 0.27 * S); c.quadraticCurveTo(x + 0.05 * S, y + 0.35 * S, x + 0.12 * S, y + 0.28 * S); c.stroke(); }
      if (s.series === 'ironfox') { c.lineWidth = 2.5; for (const sx of [-1, 1]) { c.beginPath(); c.arc(x + sx * 0.36 * S, y + 0.15 * S, 0.025 * S, 0, 7); c.stroke(); } } }
    else if (s.kind === 'pizza') { c.lineWidth = 3; for (const [px, py] of [[-0.16, -0.22], [0.13, -0.2], [0, 0.06]]) { c.fillStyle = '#b8321f'; c.beginPath(); c.arc(x + px * S, y + py * S, 0.075 * S, 0, 7); c.fill(); c.stroke(); } c.lineWidth = 5; c.beginPath(); c.moveTo(x - 0.4 * S, y - 0.31 * S); c.lineTo(x + 0.4 * S, y - 0.31 * S); c.stroke(); }
    else if (s.kind === 'snowking') { c.fillStyle = INKC; for (const sx of [-1, 1]) { c.beginPath(); c.arc(x + sx * 0.16 * S, y - 0.02 * S, 0.045 * S, 0, 7); c.fill(); } c.lineWidth = Math.max(3, S * 0.02); for (const sx of [-1, 1]) { c.beginPath(); c.moveTo(x + sx * 0.28 * S, y - 0.16 * S); c.lineTo(x + sx * 0.07 * S, y - 0.09 * S); c.stroke(); }
      c.fillStyle = '#ef8a2c'; c.beginPath(); c.moveTo(x - 0.03 * S, y + 0.06 * S); c.lineTo(x + 0.03 * S, y + 0.14 * S); c.lineTo(x + 0.32 * S, y + 0.16 * S); c.closePath(); c.fill(); c.stroke(); c.fillStyle = INKC; for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(x + (i - 2) * 0.07 * S, y + (0.3 - Math.abs(i - 2) * 0.03) * S, 0.022 * S, 0, 7); c.fill(); } }
    else if (s.kind === 'crown') { for (const px of [-0.17, 0, 0.17]) { c.fillStyle = '#d8432f'; c.beginPath(); c.arc(x + px * S, y - 0.45 * S, 0.035 * S, 0, 7); c.fill(); c.lineWidth = 2; c.stroke(); } }
    else if (s.kind === 'rocket') { c.fillStyle = '#9ed2ff'; c.lineWidth = 3; c.beginPath(); c.arc(x, y - 0.12 * S, 0.08 * S, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#f2c94c'; c.beginPath(); c.moveTo(x - 0.12 * S, y + 0.5 * S); c.lineTo(x, y + 0.72 * S); c.lineTo(x + 0.12 * S, y + 0.5 * S); c.closePath(); c.fill(); c.stroke(); }
    else if (s.kind === 'heart') { c.strokeStyle = '#ffffff'; c.lineWidth = Math.max(3, S * 0.04); c.beginPath(); c.arc(x - 0.22 * S, y - 0.22 * S, 0.1 * S, Math.PI, Math.PI * 1.6); c.stroke(); }
    else if (s.kind === 'moon') { c.lineWidth = 3; for (const [px, py, r] of [[-0.14, -0.1, 0.09], [0.15, 0.12, 0.12], [0.05, -0.24, 0.05]]) { c.beginPath(); c.arc(x + px * S, y + py * S, r * S, 0, 7); c.stroke(); } }
    else if (s.kind === 'city' && s.fill) { c.save(); c.clip(s.path); c.fillStyle = '#ffe9a0'; const b = s.bb; for (let yy = b.y0 + 14; yy < b.y1 - 10; yy += 26) for (let xx = b.x0 + 12; xx < b.x1 - 10; xx += 22) if (((xx * 7 + yy * 3) | 0) % 5 < 3) c.fillRect(xx, yy, 9, 12); c.restore(); }
    c.restore(); }
  function balloonDraw(b, ghost) { const s = b.spot, p = b.pos || [s.x, s.y], [x, y] = p, rx = s.rx, ry = s.ry;
    const tx = b.tail[0], ty = b.tail[1], ang = Math.atan2(ty - y, tx - x), ex = x + Math.cos(ang) * rx * 0.8, ey = y + Math.sin(ang) * ry * 0.8, tl = Math.min(70, Math.hypot(tx - ex, ty - ey) * 0.55), px = ex + Math.cos(ang) * tl, py = ey + Math.sin(ang) * tl, nx = -Math.sin(ang) * 16, ny = Math.cos(ang) * 16;
    c.save(); if (ghost) c.globalAlpha = 0.85; c.lineWidth = 4; c.strokeStyle = INKC; c.fillStyle = '#ffffff';
    c.beginPath(); c.moveTo(ex + nx, ey + ny); c.lineTo(px, py); c.lineTo(ex - nx, ey - ny); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, 7); c.fill(); c.stroke(); c.beginPath(); c.moveTo(ex + nx * 0.7, ey + ny * 0.7); c.lineTo(ex - nx * 0.7, ey - ny * 0.7); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
    const L = fitBalloon(b.opts[b.picked].t, rx, ry); c.font = '900 ' + L.fs + 'px ' + FONT_C; c.fillStyle = INKC; c.textAlign = 'center'; c.textBaseline = 'middle'; L.lines.forEach((l, i) => c.fillText(l, x, y + (i - (L.lines.length - 1) / 2) * L.lh + L.fs * 0.04)); c.restore(); }
  // the biggest type that fits INSIDE the oval: each line gets the oval's width at its own height
  const fitCache = new Map();
  function fitBalloon(txt, rx, ry) { const key = txt + '|' + rx + '|' + ry; if (fitCache.has(key)) return fitCache.get(key); const words = txt.split(' '); let best = null;
    for (let fs = 30; fs >= 12 && !best; fs--) { c.font = '900 ' + fs + 'px ' + FONT_C; const lh = fs * 1.1, sp = c.measureText(' ').width;
      for (let n = 1; n <= 6 && !best; n++) { if (n * lh > ry * 1.7) break; const widths = []; for (let i = 0; i < n; i++) { const yy = (i - (n - 1) / 2) * lh, edge = Math.abs(yy) + lh / 2, k = 1 - Math.pow(edge / (ry * 0.94), 2); widths.push(k > 0 ? 2 * rx * 0.86 * Math.sqrt(k) : 0); }
        const total = c.measureText(txt).width; let fallback = null;
        for (const k of [1.05, 1.15, 1.3, 1.5, 9]) { const lim = widths.map(w => Math.min(w, total / n * k + sp)); const lines = []; let li = 0, cur = '', ok = true;
          for (const w of words) { const t2 = cur ? cur + ' ' + w : w; if (c.measureText(t2).width <= lim[li]) { cur = t2; continue; } if (!cur) { ok = false; break; } lines.push(cur); li++; if (li >= n || c.measureText(w).width > lim[li]) { ok = false; break; } cur = w; } if (ok && cur) lines.push(cur);
          if (!ok || lines.length > n) continue; const orphan = lines.slice(0, -1).some(l => /(^| )\S$/.test(l)) || (lines.length > 1 && !/ /.test(lines[lines.length - 1]) && lines[lines.length - 1].length <= 3);
          if (!orphan) { best = { fs, lh, lines }; break; } if (!fallback) fallback = { fs, lh, lines }; }
        if (!best && fallback && fs <= 16) best = fallback; } }
    if (!best) { c.font = '900 12px ' + FONT_C; best = { fs: 12, lh: 13, lines: [txt] }; } fitCache.set(key, best); return best; }
  function burst(S) { const k = S.picked ? 0.34 + 0.66 * Math.min(1, S.pumps / S.need) + Math.sin(S.pop * 18) * S.pop * 0.12 : 0; if (!S.picked) return; c.save(); c.translate(S.x, S.y); c.rotate(-0.12); c.scale(k, k);
    c.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 78 : 132 + (i % 4 === 0 ? 14 : 0); c[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.25, Math.sin(a) * r); } c.closePath(); c.fillStyle = '#ffd23a'; c.fill(); c.lineWidth = 6; c.strokeStyle = INKC; c.stroke();
    c.font = 'italic 900 64px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 12; c.lineJoin = 'round'; c.strokeStyle = INKC; c.strokeText(S.picked, 0, 4); c.fillStyle = '#ec3013'; c.fillText(S.picked, 0, 4); c.restore(); }
  function title(T, band) { const [x0, y0, x1, y1] = band; c.save(); c.lineWidth = 5; c.strokeStyle = INKC;
    if (!T.stamped) { c.setLineDash([14, 10]); c.strokeStyle = BLUE_GUIDE; c.lineWidth = 3; c.strokeRect(x0 + 8, y0 + 8, x1 - x0 - 16, y1 - y0 - 16); c.setLineDash([]); c.fillStyle = BLUE_GUIDE; c.font = '900 30px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TITLE GOES HERE', (x0 + x1) / 2, (y0 + y1) / 2); c.restore(); return; }
    const pass = (dx, dy, a) => { c.globalAlpha = a; c.fillStyle = '#ec3013'; c.fillRect(x0 + dx, y0 + dy, x1 - x0, y1 - y0); c.font = 'italic 900 ' + (T.text.length > 9 ? 70 : 84) + 'px ' + FONT_C; c.textAlign = 'left'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 14; c.strokeStyle = INKC; c.strokeText(T.text, x0 + 24 + dx, (y0 + y1) / 2 + 4 + dy); c.fillStyle = '#ffd23a'; c.fillText(T.text, x0 + 24 + dx, (y0 + y1) / 2 + 4 + dy);
      c.fillStyle = '#fbf8ec'; c.fillRect(x1 - 112 + dx, y0 + 18 + dy, 92, 104); c.strokeRect(x1 - 112 + dx, y0 + 18 + dy, 92, 104); c.fillStyle = INKC; c.font = '900 18px ' + FONT_C; c.textAlign = 'center'; c.fillText('NO.', x1 - 66 + dx, y0 + 44 + dy); c.font = '900 44px ' + FONT_C; c.fillText(String(T.issue), x1 - 66 + dx, y0 + 88 + dy); };
    const star = () => { if (!T.star) return; c.globalAlpha = 1; const t = 'STARRING ' + T.star; c.font = '900 18px ' + FONT_C; const w = c.measureText(t).width + 18; c.fillStyle = INKC; c.fillRect(x0 + 24, y1 - 30, w, 26); c.fillStyle = '#ffffff'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(t, x0 + 33, y1 - 17); };
    if (T.look === 'light') pass(0, 0, 0.42); else if (T.look === 'smudge') { pass(7, 5, 0.45); pass(0, 0, 0.85); } else pass(0, 0, 1); star(); c.restore(); }
  function draw(O) { const t = O.t || 0; HC = !!O.hc; c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, PW, PH); c.fillStyle = grain; c.fillRect(0, 0, PW, PH); c.strokeStyle = 'rgba(79,159,224,0.14)'; c.lineWidth = 1; for (let x = 40; x < PW; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, PH); c.stroke(); } for (let y = 40; y < PH; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(PW, y); c.stroke(); }
    P.panels.forEach((poly, i) => { c.save(); c.clip(P.panelPaths[i]); fillRegion(P.bgs[i]);
      const list = P.shapes.filter(s => s.panel === i);
      for (const s of list) { fillRegion(s);
        if (!s.inked || s.inkV < s.L) { c.lineWidth = 2.5; c.strokeStyle = '#7f7f8a'; c.lineCap = 'round'; for (let k = 0; k < s.dots.length; k++) { const a = s.dots[k], b = s.dots[(k + 1) % s.dots.length]; if (a.lit && b.lit) { c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); } } }
        strokeAlong(s, s.inkStart || 0, Math.min(s.inkV, s.L * 1.2), inkW(s)); }
      for (const s of list) if (s.inked) details(s);
      c.restore(); });
    c.lineWidth = 6; c.strokeStyle = INKC; c.lineJoin = 'miter'; const F = P.frame; c.strokeRect(F[0], F[1], F[2] - F[0], F[3] - F[1]); if (P.band && P.title) title(P.title, P.band);
    for (const g of P.gutters) { if (g.cut || g.anim > 0) { const k = g.cut ? Math.min(1, g.anim) : 0, bx = g.a[0] + (g.b[0] - g.a[0]) * k, by = g.a[1] + (g.b[1] - g.a[1]) * k; c.lineCap = 'butt'; c.beginPath(); c.moveTo(g.a[0], g.a[1]); c.lineTo(bx, by); c.lineWidth = 18; c.strokeStyle = INKC; c.stroke(); c.lineWidth = 8; c.strokeStyle = '#fbf8ec'; c.stroke(); }
      else if (O.guides) { c.setLineDash([16, 12]); c.lineDashOffset = -t * 30; c.lineWidth = 4; c.strokeStyle = BLUE_GUIDE; c.beginPath(); c.moveTo(g.a[0], g.a[1]); c.lineTo(g.b[0], g.b[1]); c.stroke(); c.setLineDash([]); } }
    if (O.dots) { for (const s of P.shapes) for (const d of s.dots) if (!d.lit) { c.beginPath(); c.arc(d.x, d.y, HC ? 9 : 6.5, 0, 7); c.fillStyle = 'rgba(79,159,224,0.38)'; c.fill(); c.lineWidth = 2; c.strokeStyle = BLUE_GUIDE; c.stroke(); } }
    c.strokeStyle = '#8f8f99'; c.lineWidth = 2; for (const st of P.strays) { c.beginPath(); st.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); }
    c.fillStyle = INKC; for (const b of P.blots) { c.beginPath(); c.arc(b.x, b.y, b.r, 0, 7); c.fill(); for (let i = 0; i < 7; i++) { const a = i * 0.9 + b.r, d = b.r * (1.3 + (i % 3) * 0.35); c.beginPath(); c.arc(b.x + Math.cos(a) * d, b.y + Math.sin(a) * d, b.r * (0.14 + (i % 2) * 0.12), 0, 7); c.fill(); } }
    if (O.numbers) for (const r of P.regions()) { if (!O.readyR(r) || (r.fill && r.fill === r.want && r.fillT >= 1)) continue; const [x, y] = r.label, wrong = r.fill && r.fill !== r.want, nr = HC ? 24 : 17; c.beginPath(); c.arc(x, y, nr, 0, 7); c.fillStyle = '#ffffff'; c.fill(); c.lineWidth = wrong ? 4 : 2.5; c.strokeStyle = wrong ? '#ec3013' : INKC; c.stroke(); c.fillStyle = INKC; c.font = '900 ' + (HC ? 28 : 20) + 'px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(INKS[r.want].n), x, y + 1); }
    if (P.sfx) { if (P.sfx.picked) burst(P.sfx); else if (O.sfxSpot) { c.setLineDash([12, 9]); c.lineWidth = 3; c.strokeStyle = BLUE_GUIDE; c.beginPath(); c.arc(P.sfx.x, P.sfx.y, 84, 0, 7); c.stroke(); c.setLineDash([]); c.fillStyle = BLUE_GUIDE; c.font = '900 26px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SFX', P.sfx.x, P.sfx.y); } }
    if (P.sign) { const [x0, y0, x1, y1] = P.sign.box; if (O.signSpot) { c.setLineDash([10, 8]); c.lineWidth = 3; c.strokeStyle = BLUE_GUIDE; c.strokeRect(x0, y0, x1 - x0, y1 - y0); c.setLineDash([]); if (!P.sign.strokes.length) { c.fillStyle = BLUE_GUIDE; c.font = '900 20px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SIGN HERE', (x0 + x1) / 2, (y0 + y1) / 2); } }
      c.strokeStyle = INKC; c.lineWidth = 4; c.lineCap = 'round'; c.lineJoin = 'round'; for (const st of P.sign.strokes) { c.beginPath(); st.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); } }
    P.balloons.forEach((b, i) => { if (O.spot === i && !b.placed) { c.setLineDash([12, 9]); c.lineWidth = 3; c.strokeStyle = BLUE_GUIDE; c.beginPath(); c.ellipse(b.spot.x, b.spot.y, b.spot.rx, b.spot.ry, 0, 0, 7); c.stroke(); c.setLineDash([]); } if (b.picked != null) balloonDraw(b, !b.placed); });
  }
  return { canvas: cv, ctx: c, draw, hit: (path, x, y) => c.isPointInPath(path, x, y) };
}

// small pattern swatches for the colour buttons (high-contrast mode)
export function swatchPattern(k) { const p = document.createElement('canvas'); p.width = p.height = 30; const g = p.getContext('2d'); g.fillStyle = INKS[k].col; g.fillRect(0, 0, 30, 30); g.strokeStyle = 'rgba(0,0,0,0.5)'; g.fillStyle = 'rgba(0,0,0,0.5)'; g.lineWidth = 3;
  if (k === 'red') { g.beginPath(); for (let i = -30; i < 30; i += 10) { g.moveTo(i, 30); g.lineTo(i + 30, 0); } g.stroke(); } else if (k === 'orange') { for (let y = 5; y < 30; y += 10) for (let x = 5; x < 30; x += 10) { g.beginPath(); g.arc(x, y, 2.5, 0, 7); g.fill(); } } else if (k === 'gold') { for (let y = 4; y < 30; y += 9) g.fillRect(0, y, 30, 3); } else if (k === 'blue') { for (let x = 4; x < 30; x += 9) g.fillRect(x, 0, 3, 30); } else if (k === 'purple') { g.beginPath(); for (let i = -30; i < 30; i += 12) { g.moveTo(i, 0); g.lineTo(i + 30, 30); g.moveTo(i + 30, 0); g.lineTo(i, 30); } g.stroke(); } else { for (let y = 0; y < 30; y += 10) for (let x = 0; x < 30; x += 10) if (((x + y) / 10) % 2 === 0) g.fillRect(x, y, 10, 10); }
  return p.toDataURL(); }

// ---------------- art for the room ----------------
const BOOKC = ['#5b8def', '#e86a8f', '#9a9a9a', '#e8823a', '#3fbf9f', '#f2c94c', '#a33b5c', '#46c2cf', '#7a6fd0', '#d8d8d8'];
function booksTex(CTX, seed, rows) { const R = rng(seed); return CTX(512, rows * 128, (c, w, h) => { c.fillStyle = '#231f1e'; c.fillRect(0, 0, w, h);
  for (let r = 0; r < rows; r++) { const y1 = r * 128 + 118; let x = 6; while (x < w - 8) { const bw = 12 + R() * 16, bh = 70 + R() * 36, col = BOOKC[Math.floor(R() * BOOKC.length)], lean = R() < 0.07;
      if (R() < 0.05) { const n = 3 + Math.floor(R() * 4); for (let k = 0; k < n; k++) { c.fillStyle = BOOKC[Math.floor(R() * BOOKC.length)]; c.fillRect(x, y1 - (k + 1) * 13, 70, 12); c.strokeStyle = '#151312'; c.lineWidth = 2; c.strokeRect(x, y1 - (k + 1) * 13, 70, 12); } x += 76; continue; }
      c.save(); if (lean) { c.translate(x, y1); c.rotate(-0.22); c.translate(-x, -y1); } c.fillStyle = col; c.fillRect(x, y1 - bh, bw, bh); c.strokeStyle = '#151312'; c.lineWidth = 2; c.strokeRect(x, y1 - bh, bw, bh); if (R() < 0.5) { c.fillStyle = '#e6b45a'; c.fillRect(x + 2, y1 - bh + 12, bw - 4, 3); c.fillRect(x + 2, y1 - 18, bw - 4, 3); } c.restore(); x += bw + 1 + (lean ? 8 : 0); }
    c.fillStyle = '#4a4240'; c.fillRect(0, y1, w, 10); c.fillStyle = '#5c5250'; c.fillRect(0, y1, w, 3); } }); }
function heroCanvas(c, w, h, who) { // a standing hero cut-out, original drawing
  const x = w / 2, ink = '#151312'; c.lineJoin = 'round'; c.lineCap = 'round'; c.lineWidth = 9; c.strokeStyle = ink;
  const iron = who === 'ironfox', suit = iron ? '#b6c2ce' : '#2f6fd8', trim = iron ? '#4fd8ff' : '#e2453f', fur = iron ? '#9aa7b4' : '#ef8a2c';
  if (!iron) { c.fillStyle = '#c42d3c'; c.beginPath(); c.moveTo(x - 90, 330); c.lineTo(x - 150, 820); c.lineTo(x + 150, 820); c.lineTo(x + 90, 330); c.closePath(); c.fill(); c.stroke(); }
  c.fillStyle = suit; c.beginPath(); c.moveTo(x - 100, 330); c.quadraticCurveTo(x - 130, 520, x - 80, 600); c.lineTo(x - 70, 860); c.lineTo(x - 10, 860); c.lineTo(x, 640); c.lineTo(x + 10, 860); c.lineTo(x + 70, 860); c.lineTo(x + 80, 600); c.quadraticCurveTo(x + 130, 520, x + 100, 330); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = trim; c.fillRect(x - 84, 560, 168, 30); c.strokeRect(x - 84, 560, 168, 30); c.fillStyle = ink; c.fillRect(x - 74, 860, 64, 30); c.fillRect(x + 10, 860, 64, 30);
  for (const s of [-1, 1]) { c.fillStyle = suit; c.beginPath(); c.moveTo(x + s * 95, 345); c.quadraticCurveTo(x + s * 175, 420, x + s * 150, 540); c.lineTo(x + s * 115, 530); c.quadraticCurveTo(x + s * 130, 440, x + s * 85, 400); c.closePath(); c.fill(); c.stroke(); c.fillStyle = iron ? '#6b7d93' : '#fbfbf7'; c.beginPath(); c.arc(x + s * 135, 548, 26, 0, 7); c.fill(); c.stroke(); }
  if (iron) { c.fillStyle = '#4fd8ff'; c.beginPath(); c.arc(x, 440, 40, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#e8fbff'; c.beginPath(); c.arc(x, 440, 18, 0, 7); c.fill(); }
  else { c.fillStyle = '#f2c94c'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 26 : 62; c.lineTo(x + Math.cos(a) * r, 450 + Math.sin(a) * r); } c.closePath(); c.fill(); c.stroke(); }
  const hy = 230, S = 250, hp = place(UNIT.head, x, hy, S); c.fillStyle = fur; c.beginPath(); hp.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fill(); c.stroke();
  c.fillStyle = '#fbf3e4'; c.beginPath(); c.moveTo(x - 0.3 * S, hy + 0.08 * S); c.quadraticCurveTo(x, hy + 0.62 * S, x + 0.3 * S, hy + 0.08 * S); c.quadraticCurveTo(x, hy + 0.25 * S, x - 0.3 * S, hy + 0.08 * S); c.fill();
  const inn = place(UNIT[iron ? 'visor' : 'mask'], x, hy, S); c.fillStyle = iron ? '#1d2a3a' : '#c42d3c'; c.beginPath(); inn.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fill(); c.stroke();
  if (iron) { c.strokeStyle = '#4fd8ff'; c.lineWidth = 10; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(x + s * 22, hy - 12); c.lineTo(x + s * 80, hy - 12); c.stroke(); } c.strokeStyle = ink; c.lineWidth = 9; }
  else for (const s of [-1, 1]) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + s * 50, hy - 11, 22, 13, 0, 0, 7); c.fill(); c.stroke(); c.fillStyle = ink; c.beginPath(); c.arc(x + s * 47, hy - 10, 8, 0, 7); c.fill(); }
  c.fillStyle = ink; c.beginPath(); c.moveTo(x - 15, hy + 40); c.lineTo(x + 15, hy + 40); c.lineTo(x, hy + 58); c.closePath(); c.fill(); c.beginPath(); c.moveTo(x - 30, hy + 70); c.quadraticCurveTo(x, hy + 92, x + 30, hy + 70); c.stroke(); }
function reelDraw(c, w, h, who, t) { const iron = who === 'ironfox'; const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, iron ? '#2b1f55' : '#2f6fd8'); gr.addColorStop(1, iron ? '#7c4dbe' : '#9ed2ff'); c.fillStyle = gr; c.fillRect(0, 0, w, h);
  c.fillStyle = iron ? '#1a1430' : '#5d6fb0'; let x = -((t * 40) % 60); for (let i = 0; x < w; i++) { const bh = 30 + ((i * 37) % 50); c.fillRect(x, h - bh, 52, bh); x += 60; }
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 3; for (let i = 0; i < 6; i++) { const y = 20 + i * 18, xx = (w - ((t * 220 + i * 70) % (w + 120))); c.beginPath(); c.moveTo(xx, y); c.lineTo(xx + 40, y); c.stroke(); }
  const fx = 60 + Math.sin(t * 1.3) * 30, fy = 60 + Math.sin(t * 2.1) * 12; c.save(); c.translate(fx, fy); c.rotate(0.15);
  if (!iron) { c.fillStyle = '#c42d3c'; c.beginPath(); c.moveTo(-6, -4); c.lineTo(-58 - Math.sin(t * 9) * 6, 8); c.lineTo(-50, 22); c.closePath(); c.fill(); }
  c.fillStyle = iron ? '#b6c2ce' : '#2f6fd8'; c.fillRect(-14, -6, 34, 16); const hp = place(UNIT.head, 30, -2, 34); c.fillStyle = iron ? '#9aa7b4' : '#ef8a2c'; c.beginPath(); hp.forEach(([a, b], i) => i ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fill(); c.strokeStyle = '#151312'; c.lineWidth = 2; c.stroke(); c.restore();
  if (iron && Math.sin(t * 5) > 0.6) { c.strokeStyle = '#4fd8ff'; c.lineWidth = 4; c.beginPath(); c.moveTo(fx + 40, fy); c.lineTo(w - 20, fy + 40); c.stroke(); }
  c.fillStyle = '#000'; c.fillRect(0, h - 26, w, 26); c.fillStyle = '#ffd23a'; c.font = 'italic 900 20px ' + FONT_C; c.textBaseline = 'middle'; c.fillText(iron ? 'IRON FOX' : 'SUPERFOX', 10, h - 12); c.fillStyle = '#ec3013'; c.fillRect(w - 46, h - 19, 10, 10); c.fillStyle = '#fff'; c.font = '800 11px ' + FONT_C; c.fillText('REEL', w - 32, h - 13); }
function coverTex(CTX, i) { const ser = ['superfox', 'ironfox', 'pizza'][i % 3], bg = ['#c42d3c', '#2f6fd8', '#f2c94c', '#7c4dbe', '#3fbf9f', '#ef8a2c'][i % 6]; return CTX(64, 96, c => { c.fillStyle = bg; c.fillRect(0, 0, 64, 96); c.fillStyle = '#fbf8ec'; c.fillRect(4, 4, 56, 16); c.fillStyle = '#151312'; c.font = '900 10px Arial'; c.fillText(SERIES[ser].name.slice(0, 9), 6, 16); const hp = place(UNIT.head, 32, 58, 36); c.fillStyle = ser === 'ironfox' ? '#9aa7b4' : '#ef8a2c'; c.beginPath(); hp.forEach(([a, b], k) => k ? c.lineTo(a, b) : c.moveTo(a, b)); c.closePath(); c.fill(); c.lineWidth = 2; c.stroke(); c.strokeRect(1, 1, 62, 94); }); }

// ---------------- the shop interior (Home planet COMICS [gayaLibrarySquare]) ----------------
// 2D art → 3D: 1000-unit render of the 2880 px scene, 1 unit = 0.016 m, room interior ±6.1 m, door south.
export function buildComicShop(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const Y = { root, colliders: [], circles: [], interact: [], reels: [], lamps: [], RW: 6.1 }, RW = 6.1, WH = 3.6, ink = toon('#201e1d'), wood = toon('#3a3230'), gold = toon('#e6b45a');
  const box = (w, h, d, mat, x, y, z, o = 0.015, p = root) => M(new T3.BoxGeometry(w, h, d), mat, x, y, z, p, o);
  const basic = (col, extra) => new T3.MeshBasicMaterial({ color: col, ...extra });
  // floor + street outside the door
  const floorT = CTX(256, 256, c => { c.fillStyle = '#cacaca'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#d4d4d4'; c.fillRect(4, 4, 120, 120); c.fillRect(132, 132, 120, 120); c.strokeStyle = '#a9a9a9'; c.lineWidth = 3; c.strokeRect(1.5, 1.5, 125, 125); c.strokeRect(129.5, 129.5, 125, 125); c.strokeRect(129.5, 1.5, 125, 125); c.strokeRect(1.5, 129.5, 125, 125); c.lineWidth = 1.5; c.strokeStyle = '#b3b3b3'; c.beginPath(); c.moveTo(30, 40); c.lineTo(70, 30); c.moveTo(170, 200); c.lineTo(220, 215); c.stroke(); });
  floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(6, 6);
  const floor = new T3.Mesh(new T3.PlaneGeometry(RW * 2, RW * 2), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; root.add(floor); Y.floor = floor;
  const street = new T3.Mesh(new T3.PlaneGeometry(9, 5), toon('#8f8a96')); street.rotation.x = -Math.PI / 2; street.position.set(0, -0.01, RW + 2.5); root.add(street);
  // walls (dark, lilac trim at the top like the 2D frame) — south wall split for the door
  const wallM = toon('#2f2c33'), trimM = toon('#8a82b8');
  box(RW * 2 + 0.6, WH, 0.3, wallM, 0, WH / 2, -RW - 0.15, 0); box(0.3, WH, RW * 2, wallM, -RW - 0.15, WH / 2, 0, 0); box(0.3, WH, RW * 2, wallM, RW + 0.15, WH / 2, 0, 0);
  Y.south = []; const cutS = fn => { const n = root.children.length; fn(); Y.south.push(...root.children.slice(n)); };
  cutS(() => { for (const s of [-1, 1]) box(RW - 0.8, WH, 0.3, wallM, s * (RW + 0.8) / 2, WH / 2, RW + 0.15, 0); box(1.6, WH - 2.6, 0.3, wallM, 0, 2.6 + (WH - 2.6) / 2, RW + 0.15, 0); });
  box(RW * 2 + 0.7, 0.14, 0.4, trimM, 0, WH, -RW - 0.1, 0.01); box(0.4, 0.14, RW * 2 + 0.6, trimM, -RW - 0.1, WH, 0, 0.01); box(0.4, 0.14, RW * 2 + 0.6, trimM, RW + 0.1, WH, 0, 0.01); cutS(() => box(RW * 2 + 0.7, 0.14, 0.4, trimM, 0, WH, RW + 0.1, 0.01));
  // pill windows above the shelves (gold frames, like the 2D walls)
  const glass = basic('#c9d3e6'), pill = (x, z, ry) => { const g = new T3.Group(); g.position.set(x, 3.05, z); g.rotation.y = ry; root.add(g); M(new T3.CapsuleGeometry(0.15, 0.85, 4, 12), gold, 0, 0, 0, g, 0).rotation.z = Math.PI / 2; const m = M(new T3.CapsuleGeometry(0.11, 0.85, 4, 12), glass, 0, 0, 0.05, g, 0); m.rotation.z = Math.PI / 2; m.scale.z = 0.4; };
  for (const x of [-4, 0, 4]) pill(x, -RW + 0.02, 0); for (const z of [-3, 0, 3]) { pill(-RW + 0.02, z, Math.PI / 2); pill(RW - 0.02, z, -Math.PI / 2); }
  // bookcases on every wall
  const tex = [0, 1, 2].map(i => { const t = booksTex(CTX, 11 + i * 7, 5); t.wrapS = T3.RepeatWrapping; return t; }), tex2 = [0, 1].map(i => { const t = booksTex(CTX, 51 + i * 5, 2); t.wrapS = T3.RepeatWrapping; return t; });
  const front = (w, h, t, k = 1.4) => { const g = new T3.PlaneGeometry(w, h), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * w / k); return new T3.Mesh(g, new T3.MeshToonMaterial({ map: t, gradientMap: ctx.grad })); };
  let tk = 0; const bookcase = (x, z, w, ry, h = 2.5, d = 0.55) => { const g = new T3.Group(); g.position.set(x, 0, z); g.rotation.y = ry; root.add(g); box(w, h, d, wood, 0, h / 2, 0, 0.02, g); const f = front(w - 0.08, h - 0.12, tex[tk++ % 3]); f.position.set(0, h / 2, d / 2 + 0.006); g.add(f); box(w + 0.06, 0.08, d + 0.06, toon('#4a4240'), 0, h + 0.04, 0, 0.01, g); return g; };
  for (const x of [-4.4, -1.47, 1.47, 4.4]) bookcase(x, -RW + 0.28, 2.9, 0);
  for (const z of [-3.95, 0, 3.95]) { bookcase(-RW + 0.28, z, 3.9, Math.PI / 2); bookcase(RW - 0.28, z, 3.9, -Math.PI / 2); }
  cutS(() => { bookcase(-3.35, RW - 0.28, 4.9, Math.PI); bookcase(3.35, RW - 0.28, 4.9, Math.PI); });
  // low display shelves (two rows each side at the back) + comic bins by the standees
  const lowShelf = (x, z, w, d = 0.45, h = 1.0) => { box(w, h, d, wood, x, h / 2, z, 0.02); for (const s of [-1, 1]) { const f = front(w - 0.06, h - 0.1, tex2[(tk++) % 2], 1.6); f.position.set(x, h / 2, z + s * (d / 2 + 0.006)); if (s < 0) f.rotation.y = Math.PI; root.add(f); } Y.colliders.push({ x0: x - w / 2 - 0.05, x1: x + w / 2 + 0.05, z0: z - d / 2 - 0.05, z1: z + d / 2 + 0.05 }); };
  for (const s of [-1, 1]) { lowShelf(s * 3.72, -4.24, 3.3); lowShelf(s * 3.72, -3.2, 3.3); }
  const bin = (x, z, w) => { box(w, 0.85, 0.7, toon('#5a4a44'), x, 0.425, z, 0.02); for (let i = 0; i < Math.floor(w / 0.22); i++) { const m = new T3.Mesh(new T3.PlaneGeometry(0.18, 0.27), new T3.MeshToonMaterial({ map: coverTex(CTX, i * 3 + (x > 0 ? 1 : 0)), gradientMap: ctx.grad })); m.position.set(x - w / 2 + 0.16 + i * 0.22, 0.95, z + 0.05); m.rotation.x = -0.5; root.add(m); } Y.colliders.push({ x0: x - w / 2 - 0.05, x1: x + w / 2 + 0.05, z0: z - 0.4, z1: z + 0.4 }); };
  bin(-4.17, 4.35, 2.45); bin(4.17, 4.35, 2.45);
  // black 8 banners hanging at the back
  const bannerT = CTX(256, 512, c => { c.clearRect(0, 0, 256, 512); c.fillStyle = '#151515'; c.beginPath(); c.moveTo(16, 40); c.lineTo(240, 40); c.lineTo(240, 500); c.lineTo(128, 410); c.lineTo(16, 500); c.closePath(); c.fill(); c.fillStyle = '#c9a03f'; c.fillRect(8, 0, 240, 46); c.beginPath(); c.arc(128, 210, 74, 0, 7); c.fillStyle = '#e6b45a'; c.fill(); c.beginPath(); c.arc(128, 210, 58, 0, 7); c.fillStyle = '#2c2c2c'; c.fill(); c.lineWidth = 10; c.strokeStyle = '#fff'; c.beginPath(); c.arc(128, 186, 19, 0, 7); c.stroke(); c.beginPath(); c.arc(128, 232, 26, 0, 7); c.stroke(); c.lineWidth = 3; c.strokeStyle = '#7dd3fc'; c.beginPath(); c.arc(128, 186, 19, 0, 7); c.stroke(); c.beginPath(); c.arc(128, 232, 26, 0, 7); c.stroke(); });
  for (const x of [-3.44, 3.44]) { const b = new T3.Mesh(new T3.PlaneGeometry(0.85, 1.7), new T3.MeshBasicMaterial({ map: bannerT, transparent: true, alphaTest: 0.5, side: T3.DoubleSide })); b.position.set(x, 2.55, -RW + 0.6); root.add(b); M(new T3.CylinderGeometry(0.025, 0.025, 1.0, 8), gold, x, 3.42, -RW + 0.6, root, 0).rotation.z = Math.PI / 2; }
  // bunting strung wall to wall
  const flagCols = ['#d8435f', '#f2a93b', '#5b8def', '#3fa88f', '#ef6aa0', '#46c2cf'], flagG = new T3.BufferGeometry().setFromPoints([new T3.Vector3(-0.11, 0, 0), new T3.Vector3(0.11, 0, 0), new T3.Vector3(0, -0.24, 0)]); flagG.setIndex([0, 2, 1]); flagG.computeVertexNormals();
  const bunting = (z, y) => { const n = 26; const pts = []; for (let i = 0; i <= n; i++) { const k = i / n, x = -RW + 0.4 + k * (RW * 2 - 0.8); pts.push(new T3.Vector3(x, y - Math.sin(k * Math.PI) * 0.35, z)); } const line = new T3.Line(new T3.BufferGeometry().setFromPoints(pts), new T3.LineBasicMaterial({ color: 0x3a3836 })); root.add(line);
    for (let i = 1; i < n; i++) { const f = new T3.Mesh(flagG, basic(flagCols[i % flagCols.length], { side: T3.DoubleSide })); f.position.copy(pts[i]); root.add(f); } };
  bunting(-4.75, 3.05); bunting(3.7, 2.75);
  // the round 8 display: rug + sunburst, table, the SPINNER, stools, four spotlights
  const rugT = CTX(512, 512, c => { const C = 256; c.fillStyle = '#d9d9d9'; c.beginPath(); c.arc(C, C, 254, 0, 7); c.fill(); c.strokeStyle = '#b9b9b9'; c.lineWidth = 3; for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; c.beginPath(); c.moveTo(C + Math.cos(a) * 190, C + Math.sin(a) * 190); c.lineTo(C + Math.cos(a) * 250, C + Math.sin(a) * 250); c.stroke(); }
    c.fillStyle = '#b8344a'; c.beginPath(); c.arc(C, C, 185, 0, 7); c.fill(); c.fillStyle = '#c64a5e'; c.beginPath(); c.arc(C, C, 150, 0, 7); c.fill(); c.fillStyle = '#2a2a2a'; c.beginPath(); c.arc(C, C, 112, 0, 7); c.fill(); c.strokeStyle = '#e6b45a'; c.lineWidth = 5; c.beginPath(); c.arc(C, C, 106, 0, 7); c.stroke();
    c.fillStyle = '#c9a03f'; c.beginPath(); c.arc(C, C + 200, 40, 0, 7); c.fill(); c.fillStyle = '#2c2c2c'; c.beginPath(); c.arc(C, C + 200, 31, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.beginPath(); c.arc(C, C + 189, 9, 0, 7); c.stroke(); c.beginPath(); c.arc(C, C + 212, 12, 0, 7); c.stroke(); });
  const raysT = CTX(512, 512, c => { c.clearRect(0, 0, 512, 512); c.strokeStyle = 'rgba(230,180,90,0.55)'; c.lineWidth = 5; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2; c.beginPath(); c.moveTo(256 + Math.cos(a) * 190, 256 + Math.sin(a) * 190); c.lineTo(256 + Math.cos(a) * (238 + (i % 2) * 14), 256 + Math.sin(a) * (238 + (i % 2) * 14)); c.stroke(); } });
  { const r = new T3.Mesh(new T3.CircleGeometry(3.3, 48), new T3.MeshBasicMaterial({ map: raysT, transparent: true, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.position.y = 0.004; root.add(r); const g = new T3.Mesh(new T3.CircleGeometry(2.4, 48), new T3.MeshToonMaterial({ map: rugT, gradientMap: ctx.grad })); g.rotation.x = -Math.PI / 2; g.position.y = 0.008; g.receiveShadow = true; root.add(g); }
  M(new T3.CylinderGeometry(0.95, 0.95, 0.08, 32), toon('#2c2a2a'), 0, 0.74, 0, root, 0.02, 0.95); M(new T3.CylinderGeometry(0.2, 0.32, 0.72, 16), ink, 0, 0.36, 0, root, 0.01, 0.3);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; for (let k = 0; k < 4; k++) { const m = box(0.28, 0.035, 0.4, toon(BOOKC[(i * 3 + k) % BOOKC.length]), Math.cos(a) * 0.62, 0.8 + k * 0.036, Math.sin(a) * 0.62, 0.005); m.rotation.y = -a + Math.PI / 2 + (k % 2) * 0.1; } }
  const spin = new T3.Group(); spin.position.set(0, 0.78, 0); root.add(spin); Y.spinner = spin; M(new T3.CylinderGeometry(0.03, 0.03, 1.6, 8), toon('#9aa3a8'), 0, 0.8, 0, spin, 0.006); M(new T3.SphereGeometry(0.07, 12, 8), gold, 0, 1.62, 0, spin, 0.006);
  Y.spinCovers = []; for (let tier = 0; tier < 4; tier++) for (let f = 0; f < 4; f++) { const fg = new T3.Group(); fg.rotation.y = f * Math.PI / 2; spin.add(fg); box(0.36, 0.02, 0.12, toon('#9aa3a8'), 0, 0.2 + tier * 0.36, 0.12, 0.004, fg); const cv = new T3.Mesh(new T3.PlaneGeometry(0.2, 0.3), new T3.MeshToonMaterial({ map: coverTex(CTX, tier * 4 + f), gradientMap: ctx.grad })); cv.position.set(0, 0.36 + tier * 0.36, 0.13); cv.rotation.x = -0.15; fg.add(cv); Y.spinCovers.push(cv); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; M(new T3.CylinderGeometry(0.17, 0.15, 0.46, 12), toon('#3a3836'), Math.cos(a) * 1.4, 0.23, Math.sin(a) * 1.4, root, 0.012, 0.17); }
  Y.circles.push({ x: 0, z: 0, r: 1.62 });
  Y.floorLamps = []; for (const [x, z] of [[-2, -2], [2, -2], [-2, 2], [2, 2]]) { const n0 = root.children.length; M(new T3.CylinderGeometry(0.04, 0.06, 1.5, 8), ink, x, 0.75, z, root, 0.006); const bowl = M(new T3.CylinderGeometry(0.32, 0.18, 0.2, 16, 1, true), toon('#2c2a2a', { side: T3.DoubleSide }), x, 1.55, z, root, 0.01); M(new T3.CircleGeometry(0.29, 16), basic('#ffe9a8'), x, 1.64, z, root, 0).rotation.x = -Math.PI / 2; Y.lamps.push(bowl); Y.circles.push({ x, z, r: 0.28 }); Y.floorLamps.push({ x, z, parts: root.children.slice(n0) }); }
  // two reading tables with stools and comics
  for (const s of [-1, 1]) { const x = s * 4.1; M(new T3.CylinderGeometry(0.67, 0.67, 0.06, 24), toon('#2c2a2a'), x, 0.74, 0, root, 0.015, 0.67); M(new T3.CylinderGeometry(0.08, 0.2, 0.72, 10), ink, x, 0.36, 0, root, 0.008); for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) M(new T3.BoxGeometry(0.34, 0.46, 0.34), toon('#3a3836'), x + dx, 0.23, dz, root, 0.012);
    for (let k = 0; k < 2; k++) { const m = new T3.Mesh(new T3.PlaneGeometry(0.22, 0.32), new T3.MeshToonMaterial({ map: coverTex(CTX, k + (s > 0 ? 3 : 0)), gradientMap: ctx.grad })); m.rotation.x = -Math.PI / 2; m.rotation.z = (k - 0.5) * 0.5; m.position.set(x - 0.14 + k * 0.28, 0.775, 0.05); root.add(m); } Y.circles.push({ x, z: 0, r: 1.15 }); }
  // poster stands (red SUPERFOX, blue IRON FOX)
  const posterT = who => CTX(256, 360, c => { const iron = who === 'ironfox'; c.fillStyle = iron ? '#2f6fd8' : '#c42d3c'; c.fillRect(0, 0, 256, 360); c.fillStyle = '#f2c94c'; c.fillRect(16, 16, 224, 60); c.fillStyle = '#151312'; c.font = 'italic 900 40px ' + FONT_C; c.textBaseline = 'middle'; c.fillText(iron ? 'IRON FOX' : 'SUPERFOX', 26, 48); c.fillStyle = '#f2c94c'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 36 : 86; c.lineTo(128 + Math.cos(a) * r, 200 + Math.sin(a) * r); } c.closePath(); c.fill(); c.lineWidth = 8; c.strokeStyle = '#151312'; c.stroke(); c.fillStyle = '#fbf8ec'; c.fillRect(30, 300, 196, 34); c.fillStyle = '#151312'; c.font = '900 22px ' + FONT_C; c.fillText(iron ? 'ISSUE 12 · IN STORE' : 'ISSUE 40 · IN STORE', 40, 318); c.lineWidth = 10; c.strokeRect(0, 0, 256, 360); });
  for (const [s, who] of [[-1, 'superfox'], [1, 'ironfox']]) { const g = new T3.Group(); g.position.set(s * 4.64, 0, -2.5); g.rotation.y = -s * 0.5; root.add(g); for (const lx of [-0.3, 0.3]) M(new T3.BoxGeometry(0.05, 1.5, 0.05), ink, lx, 0.75, -0.2, g, 0).rotation.x = 0.18; const p = new T3.Mesh(new T3.PlaneGeometry(0.75, 1.05), new T3.MeshToonMaterial({ map: posterT(who), gradientMap: ctx.grad })); p.position.set(0, 1.0, -0.05); p.rotation.x = -0.12; g.add(p); box(0.8, 1.1, 0.03, ink, 0, 1.0, -0.075, 0, g).rotation.x = -0.12; Y.circles.push({ x: s * 4.64, z: -2.5, r: 0.45 }); }
  // standees over the shelf screens playing hero reels
  for (const [s, who] of [[-1, 'superfox'], [1, 'ironfox']]) { const x = s * 4.2, z = 3.15;
    box(1.7, 2.35, 0.14, toon('#1d1b22'), x, 1.175, z - 0.5, 0.02); const cvs = document.createElement('canvas'); cvs.width = 256; cvs.height = 144; const rt = new T3.CanvasTexture(cvs); rt.colorSpace = T3.SRGBColorSpace; const scr = new T3.Mesh(new T3.PlaneGeometry(1.44, 0.81), new T3.MeshBasicMaterial({ map: rt })); scr.position.set(x, 1.82, z - 0.42); root.add(scr); Y.reels.push({ c: cvs.getContext('2d'), t: rt, who });
    const st = CTX(512, 1024, c => { c.clearRect(0, 0, 512, 1024); c.fillStyle = '#1d2a3a'; c.beginPath(); c.moveTo(40, 1000); c.lineTo(40, 250); c.arc(256, 250, 216, Math.PI, 0); c.lineTo(472, 1000); c.closePath(); c.fill(); c.lineWidth = 12; c.strokeStyle = '#c9a03f'; c.stroke(); heroCanvas(c, 512, 1024, who); c.fillStyle = '#e6b45a'; c.fillRect(70, 900, 372, 76); c.lineWidth = 6; c.strokeStyle = '#151312'; c.strokeRect(70, 900, 372, 76); c.fillStyle = '#151312'; c.font = '900 52px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(who === 'ironfox' ? 'IRON FOX' : 'SUPERFOX', 256, 940); });
    const sm = new T3.Mesh(new T3.PlaneGeometry(1.1, 2.2), new T3.MeshToonMaterial({ map: st, transparent: true, alphaTest: 0.5, side: T3.DoubleSide, gradientMap: ctx.grad })); sm.position.set(x, 1.12, z); root.add(sm); box(0.6, 0.05, 0.3, ink, x, 0.025, z - 0.1, 0.005);
    Y.colliders.push({ x0: x - 0.9, x1: x + 0.9, z0: z - 0.62, z1: z + 0.12 }); Y[who] = { x, z }; }
  // Bramble's counter by the door (register + a comic)
  { box(0.62, 1.0, 1.5, toon('#7a5a3a'), -1.6, 0.5, 4.75, 0.02); box(0.72, 0.06, 1.6, toon('#c9903f'), -1.6, 1.03, 4.75, 0.012); const reg = box(0.34, 0.24, 0.3, toon('#3a3836'), -1.62, 1.18, 4.45, 0.01); const sc = new T3.Mesh(new T3.PlaneGeometry(0.26, 0.12), basic('#5cff8a')); sc.position.set(-1.45, 1.22, 4.45); sc.rotation.y = Math.PI / 2; root.add(sc); const cm = new T3.Mesh(new T3.PlaneGeometry(0.22, 0.32), new T3.MeshToonMaterial({ map: coverTex(CTX, 0), gradientMap: ctx.grad })); cm.rotation.x = -Math.PI / 2; cm.rotation.z = 0.4; cm.position.set(-1.58, 1.065, 5.1); root.add(cm); Y.colliders.push({ x0: -1.95, x1: -1.25, z0: 3.95, z1: 5.55 }); }
  // LOCAL ART board by the door: your finished pages + sketchbook drawings hang here
  { const g = new T3.Group(); g.position.set(2.1, 0, 4.9); g.rotation.y = Math.PI; root.add(g); for (const lx of [-0.75, 0.75]) M(new T3.BoxGeometry(0.06, 1.95, 0.06), ink, lx, 0.97, 0, g, 0.004);
    box(1.7, 1.25, 0.05, toon('#c9a06a'), 0, 1.38, 0, 0.01, g); const hT = CTX(512, 64, c => { c.fillStyle = '#151515'; c.fillRect(0, 0, 512, 64); c.fillStyle = '#ffd23a'; c.font = '900 34px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NEW THIS WEEK · LOCAL ART', 256, 34); }); const hd = new T3.Mesh(new T3.PlaneGeometry(1.6, 0.2), new T3.MeshBasicMaterial({ map: hT })); hd.position.set(0, 1.88, 0.03); g.add(hd);
    Y.frames = []; for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const fx = -0.6 + k * 0.4, fy = 1.53 - r * 0.5; M(new T3.BoxGeometry(0.33, 0.45, 0.02), ink, fx, fy, 0.03, g, 0); const pm = new T3.Mesh(new T3.PlaneGeometry(0.29, 0.41), new T3.MeshBasicMaterial({ color: '#efe9da' })); pm.position.set(fx, fy, 0.045); g.add(pm); Y.frames.push(pm); }
    Y.colliders.push({ x0: 1.2, x1: 3.0, z0: 4.75, z1: 5.05 }); }
  // the door (glass, gold frame, two blue lanterns)
  cutS(() => { box(0.12, 2.6, 0.36, gold, -0.86, 1.3, RW + 0.12, 0.01); box(0.12, 2.6, 0.36, gold, 0.86, 1.3, RW + 0.12, 0.01); box(1.84, 0.12, 0.36, gold, 0, 2.6, RW + 0.12, 0.01); const d = new T3.Mesh(new T3.PlaneGeometry(1.6, 2.5), new T3.MeshBasicMaterial({ color: '#cfe6f2', transparent: true, opacity: 0.35 })); d.position.set(0, 1.25, RW + 0.2); root.add(d);
    for (const s of [-1, 1]) { const l = M(new T3.OctahedronGeometry(0.11), basic('#7dd3fc'), s * 0.86, 2.05, RW - 0.08, root, 0.008); Y.lamps.push(l); }
    const signT = CTX(512, 96, c => { c.fillStyle = '#151515'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#e6b45a'; c.font = '900 50px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TOWN SQUARE', 256, 50); }); const sg = new T3.Mesh(new T3.PlaneGeometry(1.5, 0.28), new T3.MeshBasicMaterial({ map: signT })); sg.position.set(0, 2.9, RW - 0.02); sg.rotation.y = Math.PI; root.add(sg); });
  // wall sconces on the bookcase tops
  for (const [x, z] of [[-2.9, -RW + 0.5], [0, -RW + 0.5], [2.9, -RW + 0.5], [-RW + 0.5, -2], [-RW + 0.5, 2], [RW - 0.5, -2], [RW - 0.5, 2], [-3.3, RW - 0.5], [3.3, RW - 0.5]]) { if (z > 0) { cutS(() => { M(new T3.CylinderGeometry(0.03, 0.03, 0.3, 6), ink, x, 2.68, z, root, 0); Y.lamps.push(M(new T3.SphereGeometry(0.09, 10, 8), basic('#ffe08a'), x, 2.88, z, root, 0.008)); }); continue; } M(new T3.CylinderGeometry(0.03, 0.03, 0.3, 6), ink, x, 2.68, z, root, 0); const b = M(new T3.SphereGeometry(0.09, 10, 8), basic('#ffe08a'), x, 2.88, z, root, 0.008); Y.lamps.push(b); }
  // THE ART DESK (the long desk at the back of the 2D room) — drafting board with the comic page
  const desk = { z: -4.5 }; Y.desk = desk;
  box(2.7, 0.07, 0.8, toon('#c9a06a'), 0, 0.78, -4.52, 0.015); for (const [x, z] of [[-1.25, -4.85], [1.25, -4.85], [-1.25, -4.2], [1.25, -4.2]]) box(0.07, 0.76, 0.07, ink, x, 0.38, z, 0.005);
  Y.colliders.push({ x0: -1.42, x1: 1.42, z0: -4.98, z1: -4.08 });
  const board = new T3.Group(), TILT = 0.907; board.position.set(0, 0.83 + 0.48 * Math.cos(TILT), -4.25 - 0.48 * Math.sin(TILT)); board.rotation.x = -TILT; root.add(board); Y.board = board; Y.tilt = TILT;
  box(0.74, 1.04, 0.035, toon('#d8c29a'), 0, 0, -0.02, 0.01, board); box(0.74, 0.04, 0.06, toon('#7a5a3a'), 0, -0.52, 0.02, 0.006, board);
  Y.pageW = 0.6; Y.pageH = 0.9; const pageMesh = new T3.Mesh(new T3.PlaneGeometry(0.6, 0.9), new T3.MeshBasicMaterial({ color: 0xffffff, toneMapped: false })); pageMesh.position.z = 0.003; board.add(pageMesh); Y.pageMesh = pageMesh;
  // desk props: ink pot, pencil cup, colour jars, paper stack, monitor, lamp
  const clutter0 = root.children.length;
  M(new T3.CylinderGeometry(0.05, 0.06, 0.08, 12), ink, -0.62, 0.86, -4.72, root, 0.006); for (let i = 0; i < 4; i++) M(new T3.CylinderGeometry(0.008, 0.008, 0.22, 5), toon(['#f2c94c', '#e2453f', '#3b7fe0', '#22c55e'][i]), -0.85 + (i % 2) * 0.03, 0.95, -4.62 + (i >> 1) * 0.03, root, 0).rotation.z = (i - 1.5) * 0.12;
  M(new T3.CylinderGeometry(0.06, 0.06, 0.14, 12), toon('#5a646d'), -0.85, 0.88, -4.6, root, 0.006);
  IK.forEach((k, i) => { M(new T3.CylinderGeometry(0.045, 0.045, 0.09, 12), toon(INKS[k].col), 0.55 + (i % 3) * 0.12, 0.865, -4.25 - Math.floor(i / 3) * 0.13, root, 0.005, 0.045); });
  for (let i = 0; i < 5; i++) box(0.42, 0.012, 0.58, toon(i % 2 ? '#fbf8ec' : '#efe9da'), -1.0, 0.82 + i * 0.012, -4.45, 0).rotation.y = i * 0.05;
  { const mon = box(0.62, 0.38, 0.04, toon('#2c2a2a'), 1.0, 1.15, -4.78, 0.01); const sc = new T3.Mesh(new T3.PlaneGeometry(0.56, 0.32), basic('#cfd8e2')); sc.position.set(1.0, 1.15, -4.755); root.add(sc); Y.monitor = sc; box(0.08, 0.2, 0.06, ink, 1.0, 0.92, -4.8, 0); }
  { const g = new T3.Group(); g.position.set(-1.22, 0.82, -4.78); root.add(g); M(new T3.CylinderGeometry(0.07, 0.08, 0.03, 10), ink, 0, 0, 0, g, 0); const a1 = M(new T3.CylinderGeometry(0.012, 0.012, 0.55, 6), ink, 0.08, 0.27, 0.05, g, 0); a1.rotation.z = -0.3; const sh = M(new T3.ConeGeometry(0.1, 0.14, 12, 1, true), toon('#ec3013', { side: T3.DoubleSide }), 0.24, 0.52, 0.18, g, 0.006); sh.rotation.x = 0.9; const bl = M(new T3.SphereGeometry(0.035, 8, 6), basic('#fff6d0'), 0.24, 0.47, 0.22, g, 0); Y.lamps.push(bl); }
  Y.clutter = root.children.slice(clutter0);
  board.traverse(m => { m.castShadow = false; });
  { M(new T3.CylinderGeometry(0.22, 0.2, 0.06, 14), toon('#ec3013'), 0, 0.62, -3.62, root, 0.01, 0.22); M(new T3.CylinderGeometry(0.03, 0.05, 0.6, 8), ink, 0, 0.3, -3.62, root, 0); M(new T3.CylinderGeometry(0.2, 0.22, 0.04, 12), ink, 0, 0.02, -3.62, root, 0); }
  const signT = CTX(512, 96, c => { c.fillStyle = '#ec3013'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#fff'; c.font = '900 52px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('ART DESK', 256, 52); }); { const s = new T3.Mesh(new T3.PlaneGeometry(1.1, 0.21), new T3.MeshBasicMaterial({ map: signT })); s.position.set(0, 2.72, -RW + 0.58); root.add(s); }
  // spots + things to talk to / look at (x, z in room space; `at` = where Ben stands)
  Y.spots = { start: { x: 0, z: 5.1 }, door: { x: 0, z: 6.9 }, bramble: { x: -2.42, z: 4.85 }, seat: { x: 0, z: -3.55 }, wait: { x: 1.7, z: -3.35 }, react: { x: 0.95, z: -2.75 }, aisle: { x: 0.35, z: 2.6 } };
  Y.interact = [{ id: 'bramble', x: -0.95, z: 4.75, r: 1.35, label: 'Talk to Bramble' }, { id: 'desk', x: 0, z: -3.55, r: 1.15, label: 'Sit at the art desk' }, { id: 'spinner', x: 0, z: 0, r: 2.3, label: 'Spin the spinner' },
    { id: 'superfox', x: -4.2, z: 3.45, r: 1.1, label: 'Look at SUPERFOX' }, { id: 'ironfox', x: 4.2, z: 3.45, r: 1.1, label: 'Look at IRON FOX' }, { id: 'posterL', x: -4.2, z: -1.8, r: 1.0, label: 'Read the poster' }, { id: 'posterR', x: 4.2, z: -1.8, r: 1.0, label: 'Read the poster' },
    { id: 'tableL', x: -4.1, z: 0, r: 1.75, label: 'Read a comic' }, { id: 'tableR', x: 4.1, z: 0, r: 1.75, label: 'Read a comic' }, { id: 'door', x: 0, z: 5.9, r: 0.75, label: 'Go out to Town Square' }, { id: 'gallery', x: 2.1, z: 4.25, r: 0.85, label: 'Look at the LOCAL ART board' }];
  // cutaway: anything standing against a wall hides while the camera is beyond that wall
  Y.cut = { n: [], s: [], w: [], e: [] }; const lim = RW - 0.78; for (const ch of root.children) { const p = ch.position; if (ch === floor) continue; if (p.z < -lim) Y.cut.n.push(ch); else if (p.z > lim) Y.cut.s.push(ch); else if (p.x < -lim) Y.cut.w.push(ch); else if (p.x > lim) Y.cut.e.push(ch); }
  Y.cutState = {}; Y.applyCut = cam => { const L = RW - 0.62, o = { n: cam.z < -L, s: cam.z > L, w: cam.x < -L, e: cam.x > L }; for (const k in o) if (Y.cutState[k] !== o[k]) { Y.cutState[k] = o[k]; Y.cut[k].forEach(m => m.visible = !o[k]); } };
  Y.spin = { v: 0 };
  Y.update = (dt, t) => { Y.spinner.rotation.y += Y.spin.v * dt; Y.spin.v = damp(Y.spin.v, 0.25, 0.6, dt); Y.reelT = (Y.reelT || 0) - dt; if (Y.reelT <= 0) { Y.reelT = 0.08; for (const r of Y.reels) { reelDraw(r.c, 256, 144, r.who, t); r.t.needsUpdate = true; } } };
  return Y;
}

// ---------------- the stand-alone game ----------------
const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['I am going to frame this. Twice.', 'This is better than issue forty. Do not tell Bramble.', 'LOOK at the colours on that!'] },
  happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Nice. Really nice.', 'Bramble, put this one in the window!', 'My cub is going to love it.'] },
  okay: { word: 'OKAY', col: '#e6b45a', mood: 'neutral', lines: ['It is... a comic. Yes.', 'Hmm. Some of it is the wrong colour.', 'I will read it in a dim room.'] },
  grumpy: { word: 'GRUMPY', col: '#ff9a8a', mood: 'sad', lines: ['Half of it is not even finished!', 'Is that a smudge or a villain?', 'I could have drawn this. With my tail.'] } };
export const LOOKS = { superfox: 'SUPERFOX. Cardboard, life size, a little bent at the knee. The screen behind him plays issue 40 on a loop.', ironfox: 'IRON FOX, cardboard and chrome paint. The screen behind him is stuck on the bit with the lightning.',
  posterL: 'SUPERFOX · ISSUE 40 · IN STORE. Someone has drawn a tiny moustache on him. In pencil. Respectfully.', posterR: 'IRON FOX · ISSUE 12 · IN STORE. The poster is signed. The signature says IRON FOX. Bramble will not say who signed it.',
  door: 'The door out to Town Square. When this shop joins the Home planet map, it fades you out to the square.',
  shelves: 'Shelves, shelves, shelves. Bramble has read every one of them twice.' };
export const READS = ['PIZZA PATROL #3: THE CRUST AWAKENS. Bramble left a bookmark at the sad bit.', 'IRON FOX #7. Eleven pages of him fixing a toaster. Somehow it is gripping.', 'SUPERFOX #22. The cape gets its own subplot.', 'THE 8 GATES ANNUAL. Someone has coloured in all the Os.'];
const HINTKEY = { panels: 'SWIPE', pencil: 'DRAG', ink: 'HOLD', colour: 'TAP', sfx: 'TAP', letter: 'DRAG', title: 'HOLD' };
const angWrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

export async function createComicShop({ container, onState = () => {}, onExit = null, embed = false }) {
  const ST = createStage(container, { bg: '#1c1a20' }), { CW, CHh, renderer, scene, camera, V3, toon, M, kit, audio } = ST;
  const SND = comicAudio(audio), au = () => SND.ensure(), tone = (f, d, v, type) => { if (SND.S.sfxOn && !SND.S.muted) ST.tone(f, d, v * 0.5, type); }, noBurst = () => {};
  const Y = buildComicShop({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline: ST.addOutline });
  ST.sun.position.set(2, 9, 3); ST.sun.intensity = 1.25; { const pl = new THREE.PointLight(0xffe2b0, 0.8, 8); pl.position.set(0, 2.4, -3.6); scene.add(pl); }
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  // ACCESS options (per player, this device): VOICE reads things out, HIGH CONTRAST adds patterns + thick lines, EASY TIMING widens the greens
  const OKEY = 'home.comics.opts', OPTS = (() => { try { return Object.assign({ voice: false, hc: false, easy: false, music: true, sfx: true, haptics: true }, JSON.parse(localStorage.getItem(OKEY) || '{}')); } catch (e) { return { voice: false, hc: false, easy: false, music: true, sfx: true, haptics: true }; } })();
  SND.setOptions({ music: OPTS.music, sfx: OPTS.sfx, haptics: OPTS.haptics });
  const speak = (t, force) => { if (!OPTS.voice && !force) return; try { const u = new SpeechSynthesisUtterance(String(t).toLowerCase()); u.rate = 1.02; speechSynthesis.cancel(); speechSynthesis.speak(u); } catch (e) {} };
  function setOpt(k, v) { if (!(k in OPTS)) return; OPTS[k] = !!v; try { localStorage.setItem(OKEY, JSON.stringify(OPTS)); } catch (e) {} dirty = true; au(); SND.setOptions({ music: OPTS.music, sfx: OPTS.sfx, haptics: OPTS.haptics }); SND.play('click'); tone(v ? 990 : 520, 0.08, 0.04); if (k === 'voice' && v) speak('Voice is on. I will read things out.', true); }
  // ---------- cast ----------
  const strip = f => { const P0 = f.userData.P; if (P0.sword) P0.sword.visible = false; if (P0.gun) P0.gun.visible = false; scene.add(f); return f; };
  const ben = strip(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#2b2b33', '#2b2b33', '#ffd23a'], crest: '', gear: 'none', mood: 'happy' })), BP = ben.userData.P;
  const bram = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: BRAMBLE.fur, furDark: BRAMBLE.furDark }, torso: BRAMBLE.torso, outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); bram.userData.P.body.scale.set(1.22, 1, 1.15);
  const apronTex = (bg, txt, fg) => canvasTex(256, 320, c => { c.fillStyle = bg; c.fillRect(0, 0, 256, 320); c.fillStyle = fg; c.fillRect(18, 18, 220, 6); c.font = 'italic 900 46px ' + FONT_C; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, 128, 200); c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 18 : 42; c.lineTo(128 + Math.cos(a) * r, 108 + Math.sin(a) * r); } c.closePath(); c.fill(); });
  const apron = (f, tex) => { const P0 = f.userData.P, m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), new THREE.MeshToonMaterial({ map: tex, gradientMap: ST.grad, transparent: true })); m.position.set(0, 0.86, 0.345); m.rotation.x = -0.06; P0.body.add(m); return m; };
  apron(bram, apronTex('#c9903f', 'COMICS', '#3a2410'));
  const uniform = (() => { const hs = BP.head.scale.x || 1, hat = new THREE.Group(); hat.position.set(0.04, BP.head.position.y + 0.3 * hs, 0.02); hat.rotation.z = 0.28; BP.body.add(hat);
    const b = M(new THREE.SphereGeometry(0.3 * hs, 16, 10), toon('#c42d3c'), 0, 0, 0, hat, 0.012); b.scale.set(1.05, 0.32, 1.05); M(new THREE.CylinderGeometry(0.025, 0.025, 0.07, 6), toon('#c42d3c'), 0, 0.1, 0, hat, 0.004);
    return [hat, apron(ben, apronTex('#ffd23a', '8 COMICS', '#201e1d'))]; })();
  const setUniform = on => uniform.forEach(p => p.visible = on);
  const custFox = new Map(); const custOf = i => { if (!custFox.has(i)) { const C = CUSTOMERS[i], f = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: C.fur, furDark: '#' + new THREE.Color(C.fur).multiplyScalar(0.7).getHexString() }, torso: C.torso, outfit: C.outfit, crest: '', gear: 'none', mood: 'happy' })); f.visible = false; blob(f, 0.46); custFox.set(i, f); } return custFox.get(i); };
  const placeF = (f, s, ry = 0) => { f.position.set(s.x, 0, s.z); f.rotation.y = ry; };
  placeF(bram, Y.spots.bramble, Math.PI / 2);
  // ---------- page ----------
  let P = null, ART = null, pageTex = null, dirty = true; const RC = new THREE.Raycaster(), NDC = new THREE.Vector2();
  function usePage(pg) { P = pg; ART = pageArt(P); if (pageTex) pageTex.dispose(); pageTex = new THREE.CanvasTexture(ART.canvas); pageTex.colorSpace = THREE.SRGBColorSpace; pageTex.anisotropy = 8; Y.pageMesh.material.map = pageTex; Y.pageMesh.material.needsUpdate = true; dirty = true; }
  function idlePage() { const pg = makePage({ book: pick(['strip', 'cover', 'action']), series: pick(Object.keys(SERIES)), mood: 'FUNNY', sky: 'blue', issue: 41, seed: 7 }); pg.gutters.forEach(g => { g.cut = true; g.anim = 1; }); pg.shapes.forEach(s => s.dots.forEach(d => d.lit = true)); usePage(pg); }
  // ---------- polish: soft contact shadows, light pools, dust, particles ----------
  const blobTex = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(10,8,14,0.5)'); g.addColorStop(0.6, 'rgba(10,8,14,0.22)'); g.addColorStop(1, 'rgba(10,8,14,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  const blob = (parent, r = 0.5, x = 0, z = 0, sx = 1, sz = 1, y = 0.013) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2 * sx, r * 2 * sz), blobMat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); m.renderOrder = 1; parent.add(m); return m; };
  [ben, bram].forEach(f => blob(f, 0.48));
  { const R = Y.root; blob(R, 1.15, -4.1, 0); blob(R, 1.15, 4.1, 0); blob(R, 1.25, 0, 0, 1, 1, 0.015); blob(R, 0.6, -1.6, 4.75, 1.0, 1.7); blob(R, 0.6, -4.17, 4.35, 2.3, 0.9); blob(R, 0.6, 4.17, 4.35, 2.3, 0.9); blob(R, 0.9, 0, -4.5, 1.7, 0.6); blob(R, 0.6, -4.2, 2.9, 1.6, 0.8); blob(R, 0.6, 4.2, 2.9, 1.6, 0.8); blob(R, 0.5, -4.64, -2.5); blob(R, 0.5, 4.64, -2.5); blob(R, 0.6, 2.1, 4.9, 1.6, 0.5);
    for (const sx of [-1, 1]) for (const z of [-4.24, -3.2]) blob(R, 0.6, sx * 3.72, z, 3.0, 0.75);
    const aoT = canvasTex(8, 64, c => { const g = c.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, 'rgba(10,8,14,0.55)'); g.addColorStop(1, 'rgba(10,8,14,0)'); c.fillStyle = g; c.fillRect(0, 0, 8, 64); }), aoM = new THREE.MeshBasicMaterial({ map: aoT, transparent: true, depthWrite: false });
    for (const [x, z, w, ry] of [[0, -Y.RW + 0.55, Y.RW * 2, 0], [0, Y.RW - 0.55, Y.RW * 2, Math.PI], [-Y.RW + 0.55, 0, Y.RW * 2, -Math.PI / 2], [Y.RW - 0.55, 0, Y.RW * 2, Math.PI / 2]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 0.9), aoM); m.rotation.set(-Math.PI / 2, 0, ry); m.position.set(x + Math.sin(ry) * 0.45 * (ry ? -1 : 0), 0.011, z + (ry === 0 ? 0.45 : ry === Math.PI ? -0.45 : 0)); if (ry === -Math.PI / 2) m.position.x = x + 0.45; if (ry === Math.PI / 2) m.position.x = x - 0.45; R.add(m); }
    // warm light pools under the four spotlights + the desk, cool glow at the door
    const poolT = canvasTex(64, 64, c => { const g = c.createRadialGradient(32, 32, 1, 32, 32, 31); g.addColorStop(0, 'rgba(255,214,140,0.42)'); g.addColorStop(1, 'rgba(255,214,140,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }), poolM = new THREE.MeshBasicMaterial({ map: poolT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    for (const [x, z, r] of [[-2, -2, 1.3], [2, -2, 1.3], [-2, 2, 1.3], [2, 2, 1.3], [0, -3.7, 1.5]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), poolM); m.rotation.x = -Math.PI / 2; m.position.set(x, 0.016, z); R.add(m); }
    { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshBasicMaterial({ map: poolT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: '#9fd8ff' })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.016, Y.RW - 0.6); R.add(m); }
    for (const l of Y.lamps) { const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex, color: '#ffd89a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 })); const p = l.getWorldPosition(V3()); g.position.copy(p); const big = l.geometry && l.geometry.type === 'CylinderGeometry'; g.position.y += big ? 0.05 : 0; g.scale.setScalar(big ? 1.1 : 0.45); scene.add(g); } }
  const dust = []; for (let i = 0; i < 36; i++) { const d = new THREE.Sprite(new THREE.SpriteMaterial({ map: ST.glowTex, color: '#fff2cc', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 })); d.scale.setScalar(0.035); d.userData = { x: rr(-4, 4), y: rr(0.6, 2.8), z: rr(-4, 4), ph: rr(0, 9), sp: rr(0.05, 0.15) }; scene.add(d); dust.push(d); }
  const local2world = (px, py) => Y.board.localToWorld(V3((px / PW - 0.5) * Y.pageW, (0.5 - py / PH) * Y.pageH, 0.004));
  const pageShadow = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.92), new THREE.MeshBasicMaterial({ color: '#3a2a18', transparent: true, opacity: 0.35, depthWrite: false })); pageShadow.position.set(0.008, -0.01, 0.0012); Y.board.add(pageShadow);
  const starTex = canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); c.fillStyle = '#ffffff'; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 30; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.closePath(); c.fill(); });
  const dropTex = canvasTex(32, 32, c => { const g = c.createRadialGradient(16, 14, 1, 16, 16, 15); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, 'rgba(255,255,255,0.95)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
  const confTex = canvasTex(16, 16, c => { c.fillStyle = '#ffffff'; c.fillRect(0, 3, 16, 10); });
  const PART = []; for (let i = 0; i < 140; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: dropTex, transparent: true, depthWrite: false })); m.visible = false; m.renderOrder = 35; scene.add(m); PART.push({ m, life: 0, max: 1, v: V3(), g: 0, s: 0.05, spin: 0 }); } let pI = 0;
  function spawn(pos, col, n, o = {}) { for (let i = 0; i < n; i++) { const p = PART[pI = (pI + 1) % PART.length], mt = p.m.material; mt.map = o.tex || dropTex; mt.color.set(col); mt.depthTest = o.depth !== false; mt.needsUpdate = true; p.m.position.copy(pos); const sp = o.speed || 0.6; p.v.set(rr(-1, 1) * sp, rr(0.2, 1) * sp * (o.up || 1), rr(-1, 1) * sp * 0.6); if (o.dir) p.v.add(o.dir); p.g = o.grav ?? 2.2; p.s = (o.size || 0.04) * rr(0.6, 1.3); p.max = p.life = (o.life || 0.7) * rr(0.7, 1.2); p.spin = rr(-6, 6); mt.rotation = rr(0, 6); p.m.visible = true; } }
  function stepParts(dt) { for (const p of PART) { if (p.life <= 0) continue; p.life -= dt; if (p.life <= 0) { p.m.visible = false; continue; } p.v.y -= p.g * dt; p.m.position.addScaledVector(p.v, dt); p.m.material.rotation += p.spin * dt; const k = p.life / p.max; p.m.material.opacity = Math.min(1, k * 2.2); p.m.scale.setScalar(p.s * (0.55 + 0.45 * k)); } }
  const pageN = () => V3(0, 0, 1).applyQuaternion(Y.board.getWorldQuaternion(new THREE.Quaternion()));
  function dropsAt(px, py, col, n) { const N = pageN(), w = local2world(px, py).addScaledVector(N, 0.012); spawn(w, col, n, { speed: 0.32, size: 0.02, grav: 1.4, life: 0.55, dir: N.multiplyScalar(0.35) }); }
  function sparkAt(px, py, col, n) { const N = pageN(), w = local2world(px, py).addScaledVector(N, 0.03); spawn(w, col, n, { tex: starTex, speed: 0.28, size: 0.03, grav: -0.15, life: 0.75, depth: false, dir: N.multiplyScalar(0.12) }); }
  function confetti(x, y, z) { for (const c of ['#d8432f', '#ffd23a', '#3b7fe0', '#22c55e', '#ef6aa0', '#ffffff']) spawn(V3(x, y + 0.7, z), c, 6, { tex: confTex, speed: 1.3, up: 1.7, size: 0.06, grav: 2.4, life: 1.8 }); }
  const puff = (x, y, z, col, n = 1) => spawn(V3(x, y, z), '#' + new THREE.Color(col).getHexString(), n * 2, { speed: 0.25, size: 0.05, grav: -0.3, life: 0.6 });
  // ---------- state ----------
  const S = { shake: 0, streak: 0, streakT: 0, bonus: 0, pages: [], phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), n: 0, earned: 0, tips: 0, starList: [], tool: null, brush: null, flash: null, flashT: 0, say: '', sayT: 0, hold: null, drag: null, react: null, done: null, t: 0, phT: 0, confirm: 0, strayN: 0, view: null, toast: '', toastT: 0, dlg: null };
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 4) => { S.say = s; S.sayT = t; }, toast = (s, t = 4.5) => { S.toast = s; S.toastT = t; };
  let JOB = null, cust = null, CUS = null, lastCust = -1;
  // ---------- jobs ----------
  function newJob() { const d = S.day, book = S.forceBook || (d <= 1 ? pick(['strip', 'cover']) : pick(['strip', 'cover', 'action', 'action'])), series = pick(Object.keys(SERIES)), SR = SERIES[series];
    let ci; do { ci = Math.floor(Math.random() * CUSTOMERS.length); } while (ci === lastCust); lastCust = ci;
    const pre = S.forceBook ? [] : d <= 1 ? ['panels', 'pencil'] : d <= 2 ? ['panels'] : [], tasks = BOOKS[book].tasks.filter(t => !pre.includes(t));
    if (book !== 'action' && (d >= 2 || S.forceBook)) tasks.push('face'); const sign = !!(S.event === 'sign' || S.forceSign); if (sign) tasks.push('sign'); tasks.sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
    const star = Math.random() < 0.28 ? CUSTOMERS[ci].name : '';
    return { book, series, mood: pick(MOODS), sky: pick(SR.sky), issue: 2 + Math.floor(Math.random() * 58), seed: Math.floor(Math.random() * 1e9), cust: ci, tasks, pre, hello: star ? 'Put ME in it. I have always wanted to be a hero.' : pick(HELLO), day: d, face: pick(FACES), star, sign, prop: Math.random() < 0.4 ? pick(['rocket', 'heart', 'star']) : null }; }
  function startJob() { JOB = newJob(); const pg = makePage(JOB); if (JOB.pre.includes('panels')) pg.gutters.forEach(g => { g.cut = true; g.anim = 1; }); if (JOB.pre.includes('pencil')) pg.shapes.forEach(s => s.dots.forEach(d => d.lit = true)); usePage(pg);
    CUS = CUSTOMERS[JOB.cust]; cust = custOf(JOB.cust); custFox.forEach(f => f.visible = f === cust); cust.userData.mood = 'happy'; placeF(cust, Y.spots.door, Math.PI); cust.visible = true; if (cust.userData.page) { cust.remove(cust.userData.page); cust.userData.page = null; }
    S.walkPath = [Y.spots.door, { x: 0.3, z: 3.6 }, { x: 2.6, z: 2.6 }, { x: 2.6, z: -2.0 }, Y.spots.wait]; S.phase = 'arrive'; S.phT = 0; S.tool = null; S.brush = null; S.confirm = 0; S.doneSeen = {}; S.strayN = 0; S.view = null; S.hold = null; S.drag = null; S.streak = 0; S.bonus = 0; S.best = 0; P.face = JOB.tasks.includes('face') ? null : 'HAPPY';
    ben.visible = false; SND.play('doorbell'); setTimeout(() => SND.play('paper'), 500); }
  const shapesIn = i => P.shapes.filter(s => s.panel === i);
  const panelsReady = () => P.gutters.every(g => g.cut);
  const pencilled = s => s.dots.every(d => d.lit);
  const regionReady = r => r.kind === 'bg' ? panelsReady() && shapesIn(r.panel).every(s => s.inked) : r.inked;
  const panelInked = i => shapesIn(i).every(s => s.inked);
  function info(id) { if (!P) return { done: false, q: 0, prog: 0, txt: '' };
    if (id === 'panels') { const c = P.gutters.filter(g => g.cut).length, n = P.gutters.length; return { done: c === n, q: n ? P.gutters.reduce((a, g) => a + (g.cut ? g.q : 0), 0) / n : 1, prog: n ? c / n : 1, txt: c === n ? 'DONE' : c + ' / ' + n }; }
    if (id === 'pencil') { const c = P.shapes.filter(pencilled).length, n = P.shapes.length; return { done: c === n, q: Math.max(0.4, 1 - S.strayN * 0.07), prog: c / n, txt: c === n ? 'DONE' : c + ' / ' + n }; }
    if (id === 'ink') { const c = P.shapes.filter(s => s.inked).length, n = P.shapes.length; return { done: c === n, q: P.shapes.reduce((a, s) => a + (s.inked ? s.q : 0), 0) / n, prog: c / n, txt: c === n ? 'DONE' : c + ' / ' + n }; }
    if (id === 'colour') { const R = P.regions(), c = R.filter(r => r.fill).length, ok = R.filter(r => r.fill === r.want).length; return { done: c === R.length, q: ok / R.length, prog: c / R.length, txt: c === R.length ? (ok === c ? 'DONE' : 'WRONG COLOUR') : c + ' / ' + R.length }; }
    if (id === 'sfx') { const X = P.sfx; return { done: X.done, q: X.q, prog: X.pumps / X.need, txt: X.done ? 'DONE' : X.picked ? X.pumps + ' / ' + X.need : 'PICK' }; }
    if (id === 'letter') { const B = P.balloons, c = B.filter(b => b.placed).length; return { done: c === B.length, q: B.length ? B.reduce((a, b) => a + (b.placed ? b.q : 0), 0) / B.length : 1, prog: B.length ? c / B.length : 1, txt: c === B.length ? 'DONE' : c + ' / ' + B.length }; }
    if (id === 'face') return { done: !!P.face, q: P.face === JOB.face ? 1 : 0.5, prog: P.face ? 1 : 0, txt: P.face ? 'DONE' : 'PICK' };
    if (id === 'sign') { const G = P.sign; return { done: G.len >= 200, q: 1, prog: Math.min(1, G.len / 200), txt: G.len >= 200 ? 'DONE' : Math.round(Math.min(1, G.len / 200) * 100) + '%' }; }
    if (id === 'title') { const T = P.title; return { done: T.stamped, q: T.q, prog: T.stamped ? 1 : 0, txt: T.stamped ? 'DONE' : 'HOLD' }; }
    return { done: true, q: 1, prog: 1, txt: '' }; }
  const allDone = () => JOB && JOB.tasks.every(t => info(t).done);
  const nextTask = () => JOB && JOB.tasks.find(t => !info(t).done);
  function checkDone() { if (!JOB) return; for (const t of JOB.tasks) { const I = info(t); if (I.done && !S.doneSeen[t]) { S.doneSeen[t] = 1; flash(TASKS[t].label + ' DONE ✓', '#22c55e', 1.4); speak(TASKS[t].label + ' done'); SND.play('chime'); SND.vibe(25); tone(1175, 0.1, 0.05); setTimeout(() => tone(1568, 0.14, 0.05), 110);
        const nx = nextTask(); if (!nx) say('BRAMBLE: "Done? Hand it to ' + CUS.name + '. Let us see the face."', 4.5); else { const was = S.tool; setTimeout(() => { if (S.phase === 'work' && S.tool === was && !S.hold && !S.drag && !DM.on) setTool(nx); }, 1100); } } } }
  function good() { S.streak = (S.streak || 0) + 1; S.best = Math.max(S.best || 0, S.streak); if (S.streak === 5 && !DM.on) say(pick(['BRAMBLE: "Look at you go."', 'BRAMBLE: "Steady hands. I am almost jealous."', 'BRAMBLE: "Do not stop now, you are making me look good."']), 3); if (S.streak >= 3) { S.bonus = (S.bonus || 0) + 1; S.streakT = 1.6; S.shake = Math.max(S.shake, 0.12); SND.play('streak', S.streak); } }
  function bad() { if ((S.streak || 0) >= 3) S.streakT = 0; S.streak = 0; }
  function setTool(id) { if (S.phase !== 'work' || !JOB || !JOB.tasks.includes(id)) return; S.tool = id; S.view = null; S.focusC = null; SND.play('paper'); S.hold = null; S.drag = null; dirty = true;
    if (id === 'pencil' && !panelsReady()) flash('CUT THE PANELS FIRST', '#e6b45a', 1.6); else if (id === 'ink' && !P.shapes.some(pencilled)) flash('PENCIL IT FIRST', '#e6b45a', 1.6); else if (id === 'colour' && !P.shapes.some(s => s.inked)) flash('INK IT FIRST', '#e6b45a', 1.6); }
  function setBrush(k) { if (!INKS[k]) return; S.brush = k; SND.play('pick'); speak(INKS[k].name + ', colour ' + INKS[k].n); }
  // ---------- gestures on the page ----------
  const pxPerScreen = () => { const a = local2world(0, PH / 2).project(camera), b = local2world(PW, PH / 2).project(camera); const sw = Math.abs(b.x - a.x) / 2 * CW(); return sw > 1 ? PW / sw : 1; };
  function lightAt(p, last) { if (!panelsReady()) return; const r = Math.max(upg('lightbox') ? 48 : 36, 28 * pxPerScreen()) * (upg('lightbox') ? 1.4 : 1) * (OPTS.easy ? 1.2 : 1); let hit = 0, near = false, dmin = 1e9;
    for (const s of P.shapes) { if (pencilled(s)) continue; for (const d of s.dots) { const dd = Math.hypot(d.x - p[0], d.y - p[1]); if (dd < 70) near = true; if (!d.lit && dd < dmin) dmin = dd; if (!d.lit && dd < r) { d.lit = true; hit++; } } if (s.dots.filter(d => d.lit).length / s.dots.length >= 0.86 && !pencilled(s)) { s.dots.forEach(d => d.lit = true); tone(980, 0.06, 0.04); } }
    if (S.ptr) SND.loop('pencil', true, near ? 1 : 0.4);
    if (hit) { dirty = true; if (Math.random() < 0.4) noBurst(0.03, 3200, 0.04); }
    if (dmin < 170 && S.t - (S.tickT || 0) > 0.09) { S.tickT = S.t; tone(320 + (1 - dmin / 170) * 900, 0.035, OPTS.voice || OPTS.hc ? 0.03 : 0.014, 'sine'); }
    if (last && !near && P.shapes.some(s => !pencilled(s))) { if (!S.stray) { S.stray = [last.slice()]; P.strays.push(S.stray); S.strayLen = 0; } S.stray.push(p.slice()); S.strayLen += Math.hypot(p[0] - last[0], p[1] - last[1]); if (S.strayLen > 110 && !S.strayCounted) { S.strayCounted = true; S.strayN = Math.min(8, S.strayN + 1); flash('STAY ON THE DOTS', '#e6b45a', 1); bad(); } dirty = true; }
    else if (near) { S.stray = null; S.strayCounted = false; }
    checkDone(); }
  function evalCut(pts) { if (pts.length < 4) return; let best = null;
    for (const g of P.gutters) { if (g.cut) continue; let t0 = 1, t1 = 0, sum = 0; for (const p of pts) { const r = segDist(p, g.a, g.b); t0 = Math.min(t0, r.t); t1 = Math.max(t1, r.t); sum += r.d; } const mean = sum / pts.length; if (t1 - t0 >= 0.55 && mean < 55 && (!best || mean < best.mean)) best = { g, mean }; }
    if (!best) { if (P.gutters.some(g => !g.cut)) { flash('SWIPE ALL THE WAY ALONG THE BLUE DASHES', '#e6b45a', 1.6); SND.play('wrong'); } return; }
    const g = best.g; g.cut = true; g.anim = 0; g.q = upg('ruler') ? 1 : clamp(1.08 - best.mean / 60, 0.5, 1); flash(g.q > 0.85 ? 'DEAD STRAIGHT!' : 'A BIT WONKY', g.q > 0.85 ? '#22c55e' : '#e6b45a', 1.1); g.q > 0.85 ? good() : bad(); SND.play('snip'); setTimeout(() => SND.play('ruler'), 90); SND.vibe(20); sparkAt((g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2, '#ffd23a', 6); tone(320, 0.12, 0.05, 'sawtooth'); noBurst(0.12, 1800, 0.08); checkDone(); }
  const inkDur = () => clamp(3.0 - (S.day - 1) * 0.25, 1.9, 3.0) * (upg('nib') ? 1.45 : 1) * (OPTS.easy ? 1.5 : 1);
  const GZ = () => OPTS.easy ? [0.9, 1.14, 1.24, 1.3] : [0.94, 1.08, 1.18, 1.24];
  function startInk(p) { let best = null, bd = 1e9; for (const s of P.shapes) { if (s.inked) continue; const inside = ART.hit(s.path, p[0], p[1]); let d = inside ? 0 : 1e9; if (!inside) for (const q of s.dots) d = Math.min(d, Math.hypot(q.x - p[0], q.y - p[1])); if (d < bd) { bd = d; best = s; } }
    if (!best || bd > 80 * Math.max(1, pxPerScreen() * 0.8)) return false; if (!pencilled(best)) { flash('PENCIL THAT ONE FIRST', '#e6b45a', 1.4); return true; }
    if (best.inkV <= 0) { let k = 0, kd = 1e9; best.pts.forEach((q, i) => { const d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < kd) { kd = d; k = i; } }); best.inkStart = best.cum[k]; }
    S.hold = { kind: 'ink', s: best }; SND.loop('ink', true); return true; }
  function releaseInk() { const H = S.hold; if (!H || H.kind !== 'ink') return; S.hold = null; SND.loop('ink', false); const s = H.s, r = s.inkV / s.L;
    const [g0, g1, g2] = GZ();
    if (r < g0) { s.restarts++; flash('GAP · HOLD AGAIN TO CLOSE IT', '#cfcac4', 1.3); SND.play('wrong'); bad(); }
    else if (r <= g1) { good(); s.inked = true; s.inkV = s.L; s.q = Math.max(0.5, 1 - s.restarts * 0.08); flash('CLEAN LINE!', '#22c55e', 1); SND.play('clean'); SND.vibe(15); sparkAt(s.label[0], s.label[1], '#ffd23a', 8); }
    else if (r < g2) { s.inked = true; s.q = Math.max(0.4, 0.78 - s.restarts * 0.08); flash('A BIT WOBBLY', '#e6b45a', 1.1); tone(500, 0.1, 0.04); bad(); }
    else { s.inked = true; s.q = 0.45; const e = pointAt(s.pts, s.cum, (s.inkStart || 0) + s.inkV); P.blots.push({ x: e[0], y: e[1], r: 13 }); flash('INK BLOT!', '#ec3013', 1.3); SND.play('blot'); SND.vibe(60); bad(); S.shake = 0.2; dropsAt(e[0], e[1], '#151312', 8); }
    dirty = true; checkDone(); }
  function regionAt(p) { for (let i = P.shapes.length - 1; i >= 0; i--) if (ART.hit(P.shapes[i].path, p[0], p[1])) return P.shapes[i]; for (const b of P.bgs) if (ART.hit(b.path, p[0], p[1])) return b; return null; }
  function fillAt(p) { const r = regionAt(p); if (!r) return; if (!S.brush) { flash('PICK A COLOUR BELOW FIRST', '#e6b45a', 1.4); return; } if (!regionReady(r)) { flash(r.kind === 'bg' ? 'INK EVERYTHING IN THIS PANEL FIRST' : 'INK IT FIRST', '#e6b45a', 1.4); return; }
    if (r.fill === S.brush && r.fillT >= 1) return; r.fill = S.brush; r.fillAt = p.slice(); r.fillT = 0; dirty = true; SND.play('splash', INKS[S.brush].n); SND.vibe(10); dropsAt(p[0], p[1], INKS[S.brush].col, 9); noBurst(0.08, 900, 0.05);
    if (r.fill !== r.want) { flash('THAT SPOT IS A ' + INKS[r.want].n + ' · ' + INKS[r.want].name, '#ff9a8a', 1.5); speak('that one is ' + INKS[r.want].name); SND.play('wrong'); bad(); } else good(); checkDone(); }
  function pickSfx(w) { if (S.phase !== 'work' || !P.sfx || P.sfx.done) return; if (!panelInked(0)) { flash('INK THE TOP PANEL FIRST', '#e6b45a', 1.4); return; } P.sfx.picked = w; P.sfx.q = w === P.sfx.want ? 1 : 0.5; dirty = true; SND.play('pick'); if (w !== P.sfx.want) { flash('THE CARD SAYS ' + P.sfx.want, '#ff9a8a', 1.6); bad(); } else { flash('NOW TAP IT TO PUMP IT UP', '#ffd23a', 1.3); good(); } speak(w); }
  function pump() { const X = P.sfx; if (!X || X.done || !X.picked) return; X.pumps++; X.pop = 1; dirty = true; SND.play('boom', X.pumps); SND.vibe(12); sparkAt(X.x, X.y, '#ffd23a', 4); S.shake = Math.max(S.shake, 0.06 + X.pumps * 0.02);  const w = local2world(X.x, X.y); puff(w.x, w.y, w.z + 0.02, 0xffd23a, 1);
    if (X.pumps >= X.need) { X.done = true; flash(X.picked, '#ec3013', 1.4); S.shake = 0.4; speak(X.picked); SND.play('kapow'); SND.vibe([30, 40, 70]); sparkAt(X.x, X.y, '#ffffff', 14); dropsAt(X.x, X.y, '#ffd23a', 12); noBurst(0.3, 600, 0.12); for (let i = 0; i < 6; i++) puff(w.x + rr(-0.12, 0.12), w.y + rr(-0.1, 0.1), w.z + 0.05, 0xffffff, 1); checkDone(); } }
  const pendingBalloon = () => P && P.balloons.findIndex(b => !b.placed);
  function pickLine(i) { const bi = pendingBalloon(); if (S.phase !== 'work' || bi < 0) return; const b = P.balloons[bi]; if (!panelInked(b.panel)) { flash('INK THAT PANEL FIRST', '#e6b45a', 1.4); return; }
    const first = b.picked == null; b.picked = i; if (first) { const pb = bbox(P.panels[b.panel]); b.pos = [b.spot.x, Math.min(pb.y1 - b.spot.ry - 14, b.spot.y + 150)]; } dirty = true; SND.play('pick');
    if (b.opts[i].mood !== JOB.mood) flash('THE CARD SAID ' + JOB.mood + ' · PICK AGAIN OR KEEP IT', '#ff9a8a', 1.8); else flash('NOW DRAG IT ONTO THE DASHED SPOT', '#ffd23a', 1.4); }
  function dropBalloon() { const D = S.drag; S.drag = null; if (!D) return; const b = D.b, d = Math.hypot(b.pos[0] - b.spot.x, b.pos[1] - b.spot.y);
    if (d < 80) { b.placed = true; b.pos = [b.spot.x, b.spot.y]; const mOk = b.opts[b.picked].mood === JOB.mood; b.q = (mOk ? 1 : 0.55) * (d < 34 ? 1 : 0.9); flash(mOk ? 'PERFECT FIT!' : 'IN PLACE · WRONG MOOD', mOk ? '#22c55e' : '#e6b45a', 1.2); SND.play('pop'); SND.vibe(15); if (mOk) sparkAt(b.spot.x, b.spot.y, '#ffd23a', 6); mOk ? good() : bad(); speak(b.opts[b.picked].t); checkDone(); }
    else flash('DROP IT ON THE DASHED SPOT', '#e6b45a', 1.2); dirty = true; }
  const titleZone = () => { const z = upg('stamp') ? [0.42, 0.98] : [0.55, 0.85]; return OPTS.easy ? [z[0] - 0.08, Math.min(1.08, z[1] + 0.1)] : z; };
  function releaseTitle() { const H = S.hold; if (!H || H.kind !== 'title') return; S.hold = null; const T = P.title, v = H.v, [a, b] = titleZone(); T.stamped = true;
    if (v < a) { T.look = 'light'; T.q = 0.6; flash('TOO LIGHT', '#cfcac4', 1.2); } else if (v <= b) { T.look = 'clean'; T.q = 1; flash('PERFECT STAMP!', '#22c55e', 1.2); good(); } else { T.look = 'smudge'; T.q = v >= 1.2 ? 0.5 : 0.72; flash(v >= 1.2 ? 'OVERINKED!' : 'A BIT SMUDGY', '#e6b45a', 1.2); }
    if (T.look !== 'clean') bad(); S.shake = 0.35; SND.play('stamp'); SND.vibe(45); dropsAt((P.band[0] + P.band[2]) / 2, (P.band[1] + P.band[3]) / 2, '#ec3013', 10); noBurst(0.2, 500, 0.1); dirty = true; checkDone(); }
  function pickFace(f) { if (S.phase !== 'work' || !JOB || !JOB.tasks.includes('face')) return; P.face = f; dirty = true; SND.play('pick'); if (f === JOB.face) { good(); flash(f + '!', '#22c55e', 1); } else { bad(); flash('THE CARD SAID ' + JOB.face, '#ff9a8a', 1.6); } speak(f); checkDone(); }
  // ---------- hand back + reactions ----------
  function handIn() { if (S.phase !== 'work' || !JOB) return; if (!allDone() && performance.now() - S.confirm > 2500) { S.confirm = performance.now(); flash('NOT FINISHED · TAP HAND IN AGAIN TO SEND IT', '#e6b45a', 2.2); return; } finishJob(); }
  function finishJob() { const T = JOB.tasks, qs = T.map(t => { const I = info(t); return I.done ? I.q : I.prog * 0.4; }), q = qs.reduce((a, b) => a + b, 0) / T.length, stars = q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, level = stars === 3 ? (q >= 0.97 ? 'thrilled' : 'happy') : stars === 2 ? 'okay' : 'grumpy';
    const made = T.filter(t => info(t).done).length, pay = BOOKS[JOB.book].price + made * 3, streakB = Math.min(10, S.bonus || 0), tip = Math.round(((level === 'thrilled' ? Math.ceil(pay * 0.4) + 2 : level === 'happy' ? Math.ceil(pay * 0.2) : 0) * (upg('radio') ? 1.25 : 1) + streakB) * (S.event === 'rush' && !DM.on ? 1.5 : 1));
    S.flash = null; S.say = ''; S.hold = null; S.drag = null; S.earned += pay; S.tips += tip; S.starList.push(stars); const R = REACT[level]; cust.userData.mood = R.mood; S.react = { word: R.word, col: R.col, line: pick(R.lines), who: CUS.name, stars, tip, pay, t: 0, streak: streakB };
    // the customer holds up the finished page
    const snap = document.createElement('canvas'); snap.width = PW / 2; snap.height = PH / 2; ART.draw({ t: S.t }); snap.getContext('2d').drawImage(ART.canvas, 0, 0, PW / 2, PH / 2); const st = new THREE.CanvasTexture(snap); st.colorSpace = THREE.SRGBColorSpace;
    const full = document.createElement('canvas'); full.width = PW; full.height = PH; full.getContext('2d').drawImage(ART.canvas, 0, 0); S.pages = (S.pages || []).concat([{ url: full.toDataURL('image/png'), stars, title: SERIES[JOB.series].name + ' NO. ' + JOB.issue }]).slice(-6);
    if (!DM.on) addGallery(snap, 'page', SERIES[JOB.series].name + ' NO. ' + JOB.issue);
    speak(CUS.name + ' is ' + R.word.replace('!', '') + '. ' + S.react.line + ' ' + P.balloons.filter(b => b.picked != null).map(b => b.opts[b.picked].t).join(' '));
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.69), new THREE.MeshBasicMaterial({ map: st, side: THREE.DoubleSide })); pm.position.set(0, 1.2, 0.5); cust.add(pm); cust.userData.page = pm; cust.userData.hold = { right: true, left: true };
    placeF(cust, Y.spots.react, -0.35); ben.visible = true; placeF(ben, { x: -0.2, z: -2.95 }, Math.PI / 2 - 0.3); S.phase = 'react'; S.phT = 0;
    SND.play('paper'); setTimeout(() => { if (level === 'grumpy') SND.play('sad'); else { SND.play('fanfare', stars); setTimeout(() => SND.play('kaching'), 420); } }, 250); if (stars === 3) { confetti(cust.position.x, 1.6, cust.position.z); if (level === 'thrilled' && !DM.on) setTimeout(() => say('BRAMBLE: "That one is going in the window."', 3.5), 900); } }
  function endDay() { S.phase = 'done'; custFox.forEach(f => f.visible = false); JOB = null; idlePage(); ben.visible = true; placeF(ben, { x: 0.5, z: 3.2 }, 0.2);
    const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.67, wage = 8 + S.day * 2 + (S.event === 'rush' ? 10 : 0), total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    if (DM.on) return; save.addGold(total); save.best(SAVE.best, total); if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1);
    if (!save.flag('comicsUniform')) { save.setFlag('comicsUniform'); unlock.push('ARTIST UNIFORM · BERET + 8 COMICS APRON'); setUniform(true); }
    const dayWas = S.day; if (avg >= 2) { newDay = true; S.day++; save.setStat(SAVE.day, S.day); }
    S.done = { event: S.event, day: dayWas, made: S.starList.length, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) }; SND.play('kaching'); setTimeout(() => SND.play('fanfare', Math.round(avg)), 300); }
  function startDay() { if (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk') return; au(); S.dlg = null; Object.assign(S, { n: 0, earned: 0, tips: 0, starList: [], done: null, react: null, pages: [] }); S.event = eventFor(S.day); S.perDay = S.event === 'rush' ? 4 : COMICS.perDay; setUniform(!!save.flag('comicsUniform')); say(S.event === 'rush' ? 'BRAMBLE: "COMIC DAY! The whole town is coming. Four pages today, and they tip big."' : S.event === 'sign' ? 'BRAMBLE: "SIGNING DAY. Sign every page in the corner, they love that."' : 'BRAMBLE: "Customer coming in. The card tells you what they want. Take your time, do it right."', 5); startJob(); }
  const eventFor = d => d % 5 === 0 ? 'rush' : d % 3 === 0 ? 'sign' : null;
  function buyUpgrade(id) { const u = UPGRADES.find(x => x.id === id); if (!u || upg(id)) return; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ff9a8a', 1.2); return; } save.setStat(SAVE.upg + id, 1); tone(990, 0.1, 0.05); }
  // ---------- WALK: Ben in the shop ----------
  const W = { x: Y.spots.start.x, z: Y.spots.start.z, face: Math.PI, sp: 0, stick: { x: 0, y: 0 }, keys: new Set(), target: null, camYaw: Math.PI, camPitch: 0.62, camDist: 6.2, dragT: -9, near: null, wave: 0, bWave: 0, spins: [], hudPad: false };
  // EMBED: when a world opens this page as its job screen, LOOK AROUND / TAKE A BREAK hand control back to the world
  const ringM = new THREE.Mesh(new THREE.RingGeometry(0.22, 0.3, 28).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); ringM.visible = false; scene.add(ringM);
  function toWalk() { if (DM.on) return; if (embed && onExit) { onExit({ from: COMICS.room, reason: 'break', gold: save.data.gold }); return; } S.phase = 'walk'; S.done = null; S.dlg = null; ben.visible = true; setUniform(!!save.flag('comicsUniform')); W.x = Y.spots.start.x; W.z = Y.spots.start.z; W.face = Math.PI; W.camYaw = Math.PI; W.target = null; placeF(ben, W, W.face); if (S.pzDay !== S.day) S.pz = { st: 'wait', t: 0, k: (S.pzK = ((S.pzK ?? -1) + 1) % 3) }; }
  function toIntro() { if (DM.on) return; S.phase = 'intro'; S.done = null; S.dlg = null; ben.visible = true; setUniform(!!save.flag('comicsUniform')); placeF(ben, { x: 0.5, z: 3.2 }, 0.2); }
  const collide = (x, z, r = 0.32) => { const lim = Y.RW - 0.62; if (!(Math.abs(x) < 0.62 && z > lim - 0.2)) z = clamp(z, -lim, lim); else z = Math.min(z, Y.RW + 0.5); x = clamp(x, -lim, lim);
    for (const b of Y.colliders) { if (x > b.x0 - r && x < b.x1 + r && z > b.z0 - r && z < b.z1 + r) { const dl = x - (b.x0 - r), dr = b.x1 + r - x, dt = z - (b.z0 - r), db = b.z1 + r - z, m = Math.min(dl, dr, dt, db); if (m === dl) x = b.x0 - r; else if (m === dr) x = b.x1 + r; else if (m === dt) z = b.z0 - r; else z = b.z1 + r; } }
    for (const c of [...Y.circles, { x: bram.position.x, z: bram.position.z, r: 0.35 }, ...browsers.filter(B => B.f.visible).map(B => ({ x: B.f.position.x, z: B.f.position.z, r: 0.32 }))]) { const dx = x - c.x, dz = z - c.z, d = Math.hypot(dx, dz), m = c.r + r; if (d < m && d > 1e-4) { x = c.x + dx / d * m; z = c.z + dz / d * m; } } return [x, z]; };
  function nearest() { let best = null, bs = 1e9; for (const it of Y.interact) { const d = Math.hypot(W.x - it.x, W.z - it.z); if (d < it.r && d / it.r < bs) { bs = d / it.r; best = it; } } const db = Math.hypot(W.x - bram.position.x, W.z - bram.position.z); if (db < 1.9 && (!best || best.id !== 'bramble') && db / 1.9 < bs) best = Y.interact[0]; return best; }
  const BR = BRAMBLE, dlgLines = arr => arr.map(([w, t]) => ({ name: w === 'player' ? CAST.player.name : 'BRAMBLE', role: w === 'player' ? '' : 'COMICS', text: t }));
  function bramRoot() { S.dlg = { lines: [{ name: 'BRAMBLE', role: 'COMICS', text: BR.greeting }], i: 0, choices: [{ text: "What's the best thing in here?", go: () => openLines(BR.best, bramRoot), asked: !!S.askedBest }, { text: 'Got any work for me?', go: () => openLines(BR.job, () => { S.dlg = { lines: [{ name: 'BRAMBLE', role: 'COMICS', text: 'So. Are you starting or are you browsing?' }], i: 0, choices: [{ text: 'Put me to work.', go: () => { S.dlg = null; toIntro(); } }, { text: 'Maybe later.', bye: true, go: () => { S.dlg = null; } }] }; }) }, { text: 'See you, Bramble.', bye: true, go: () => { S.dlg = null; } }] }; bram.userData.talking = true; }
  function openLines(arr, then) { if (arr === BR.best) S.askedBest = true; S.dlg = { lines: dlgLines(arr), i: 0, then }; }
  function interact(id) { if (S.phase !== 'walk' || S.dlg) return; au();
    if (id === 'bramble') { W.face = Math.atan2(bram.position.x - W.x, bram.position.z - W.z); bramRoot(); tone(520, 0.06, 0.03); }
    else if (id === 'desk') { toIntro(); }
    else if (id === 'spinner') { Y.spin.v += 7; const now = S.t; W.spins = W.spins.filter(t => now - t < 2.2); W.spins.push(now); SND.play('whoosh');
      if (W.spins.length >= 3) { W.spins = []; Y.spin.v = -3; ben.userData.hop = 1; SND.play('bite'); SND.vibe(80); toast('OW. The spinner bit you. Bramble did warn you.'); } else toast('The spinner whirls. Comics blur past.', 2); }
    else if (id === 'tableL' || id === 'tableR') toast('You flip through ' + pick(READS));
    else if (id === 'door' && onExit) { tone(300, 0.2, 0.04); onExit({ from: COMICS.room, to: 'gayaTownSquare' }); }
    else if (id === 'gallery') toast(GAL.length ? 'The LOCAL ART board: ' + GAL.length + ' of your pages and sketches. Bramble has written "OUR NEW HAND" on a card in the corner.' : 'The LOCAL ART board is empty for now. Your finished pages and sketchbook drawings hang here.');
    else if (LOOKS[id]) toast(LOOKS[id]); }
  function talk() { if (S.dlg) { nextLine(); return; } const n = W.near; if (n) interact(n.id); }
  function nextLine() { const D = S.dlg; if (!D) return; if (D.i < D.lines.length - 1) { D.i++; return; } if (D.choices) return; const th = D.then; S.dlg = null; bram.userData.talking = false; th && th(); }
  function choose(i) { const D = S.dlg; if (!D || !D.choices || !D.choices[i]) return; D.choices[i].go(); if (!S.dlg) bram.userData.talking = false; }
  function stepWalk(dt) { let sx = W.stick.x, sy = W.stick.y; const K = W.keys; if (K.has('KeyA') || K.has('ArrowLeft')) sx -= 1; if (K.has('KeyD') || K.has('ArrowRight')) sx += 1; if (K.has('KeyW') || K.has('ArrowUp')) sy += 1; if (K.has('KeyS') || K.has('ArrowDown')) sy -= 1;
    let mag = Math.min(1, Math.hypot(sx, sy)), mx = 0, mz = 0; if (S.dlg) mag = 0;
    if (mag > 0.12) { W.target = null; const y = W.camYaw, fx = -Math.sin(y), fz = Math.cos(y), rx = -Math.cos(y), rz = -Math.sin(y); mx = (fx * sy + rx * sx); mz = (fz * sy + rz * sx); const l = Math.hypot(mx, mz) || 1; mx /= l; mz /= l; }
    else if (W.target) { const dx = W.target.x - W.x, dz = W.target.z - W.z, d = Math.hypot(dx, dz); if (d < 0.18 || (W.target.t += dt) > 6) { const act = W.target.act; W.target = null; ringM.visible = false; if (act) interact(act); } else { mx = dx / d; mz = dz / d; mag = Math.min(1, d * 1.5 + 0.35); } }
    const spd = 3.1 * mag; W.sp = damp(W.sp, spd, 12, dt); if (spd > 0.4) { W.stepD = (W.stepD || 0) + spd * dt; if (W.stepD > 0.62) { W.stepD = 0; SND.play('step', Math.min(1, spd / 3)); } }
    if (mag > 0.05) { const [nx, nz] = collide(W.x + mx * spd * dt, W.z + mz * spd * dt); W.x = nx; W.z = nz; const want = Math.atan2(mx, mz); W.face += angWrap(want - W.face) * Math.min(1, dt * 12); if (S.t - W.dragT > 1.6 && sy > -0.3) W.camYaw += angWrap(-W.face - W.camYaw) * Math.min(1, dt * 0.9); }
    ben.position.set(W.x, 0, W.z); ben.rotation.y = W.face; W.near = S.dlg ? null : nearest();
    if (W.z > Y.RW + 0.3) { W.z = Y.RW - 0.2; toast(LOOKS.door); }
    if (W.wave > 0) { W.wave -= dt; BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(S.t * 9) * 0.35); }
    const bp = bram.userData.P; if (W.bWave > 0) { W.bWave -= dt; bp.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(S.t * 9) * 0.35); }
    if (ringM.visible) { ringM.material.opacity = 0.5 + Math.sin(S.t * 8) * 0.3; }
    return mag > 0.05 ? spd : 0; }
  const look = () => { const it = W.near || Y.interact.filter(i => Math.hypot(W.x - i.x, W.z - i.z) < 3.4).sort((a, b) => Math.hypot(W.x - a.x, W.z - a.z) - Math.hypot(W.x - b.x, W.z - b.z))[0]; if (!it) { toast(LOOKS.shelves); return; } if (it.id === 'bramble') toast('BRAMBLE. Owns the shop, reads the stock. Built for sitting behind a counter and he knows it.'); else if (it.id === 'desk') toast('The ART DESK. A drafting board, six colour pots, an ink pot and a lamp that only half works.'); else if (it.id === 'spinner') toast('The SPINNER. It bites. Allegedly.'); else if (it.id.startsWith('table')) toast('A reading table. Somebody has left half a doughnut on a SUPERFOX annual.'); else toast(LOOKS[it.id] || LOOKS.shelves); };
  function wave() { if (S.phase !== 'walk') return; W.wave = 1.3; tone(660, 0.06, 0.03); if (Math.hypot(W.x - bram.position.x, W.z - bram.position.z) < 5) { W.bWave = 1.4; setTimeout(() => toast('BRAMBLE: "Hello yourself."', 2.4), 300); } }
  // ---------- DEMO (one ACTION page, every task; nothing is saved) ----------
  const DM = { on: false, gen: null, wait: 0, until: null, cap: '', key: '', hand: V3(), handT: null, day0: 1 };
  const handTex = canvasTex(128, 128, c => { c.clearRect(0, 0, 128, 128); c.translate(40, 20); c.fillStyle = '#ffffff'; c.strokeStyle = '#151312'; c.lineWidth = 6; c.lineJoin = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(12, 0); c.lineTo(14, 44); c.lineTo(40, 44); c.quadraticCurveTo(58, 46, 56, 70); c.lineTo(50, 100); c.lineTo(8, 100); c.lineTo(-14, 62); c.quadraticCurveTo(-18, 50, -4, 52); c.lineTo(2, 58); c.closePath(); c.fill(); c.stroke(); });
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: handTex, depthTest: false, transparent: true })); hand.renderOrder = 40; hand.scale.set(0.09, 0.09, 1); hand.center.set(0.32, 0.86); hand.visible = false; scene.add(hand);
  const hint3 = new THREE.Mesh(new THREE.RingGeometry(0.016, 0.024, 28), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthTest: false })); hint3.renderOrder = 38; hint3.visible = false; Y.board.add(hint3);
  const hint3b = hint3.clone(); hint3b.material = hint3.material.clone(); Y.board.add(hint3b);
  const toLocal = (px, py) => [(px / PW - 0.5) * Y.pageW, (0.5 - py / PH) * Y.pageH];
  const handAt = (px, py) => { DM.handP = [px, py]; };
  const cap = (t, k = '') => { DM.cap = t; DM.key = k; };
  function* glide(a, b, dur, each) { const n = Math.max(2, Math.round(dur / 0.033)); for (let i = 0; i <= n; i++) { const k = i / n, x = a[0] + (b[0] - a[0]) * k, y = a[1] + (b[1] - a[1]) * k; handAt(x, y); if (each) each([x, y], i); yield 0.033; } }
  function* demoScript() { cap("WATCH A COMMISSION AT BRAMBLE'S"); S.forceBook = 'action'; startJob(); S.forceBook = null; yield () => S.phase === 'work'; yield 1.2;
    for (const t of JOB.tasks) { setTool(t); yield 0.6;
      if (t === 'panels') { cap('SWIPE along the blue dashes to cut the panel borders', 'SWIPE'); for (const g of P.gutters) { const pts = []; yield* glide([g.a[0] + 10, g.a[1]], [g.b[0] - 10, g.b[1]], 0.8, p => pts.push(p)); evalCut(pts); yield 0.5; } }
      if (t === 'pencil') { cap('DRAG over the blue dots to pencil each drawing', 'DRAG'); for (const s of P.shapes) { let last = null; for (let k = 0; k <= s.dots.length; k += 2) { const d = s.dots[k % s.dots.length]; handAt(d.x, d.y); lightAt([d.x, d.y], last); last = [d.x, d.y]; yield 0.03; } yield 0.15; } }
      if (t === 'ink') { cap('HOLD on a drawing. The ink runs round it. Let go when the line closes (green)', 'HOLD'); for (const s of P.shapes) { handAt(s.label[0], s.label[1]); yield 0.3; startInk(s.label); yield () => S.hold && S.hold.s.inkV / S.hold.s.L >= 1.0; releaseInk(); yield 0.35; } }
      if (t === 'colour') { cap('PICK a colour, then TAP every shape with its number', 'TAP'); for (const k of IK) { const list = P.regions().filter(r => r.want === k); if (!list.length) continue; setBrush(k); yield 0.4; for (const r of list) { handAt(r.label[0], r.label[1]); yield 0.25; fillAt(r.label); yield 0.3; } } }
      if (t === 'sfx') { cap('PICK the word on the card, then TAP it to pump it up', 'TAP'); pickSfx(P.sfx.want); yield 0.6; for (let i = 0; i < P.sfx.need; i++) { handAt(P.sfx.x + 30, P.sfx.y + 20 + (i % 2) * 14); pump(); yield 0.22; } }
      if (t === 'letter') { cap('PICK the line that matches the mood, then DRAG the balloon onto the dashed spot', 'DRAG'); for (let bi = 0; bi < P.balloons.length; bi++) { const b = P.balloons[bi]; pickLine(b.opts.findIndex(o => o.mood === JOB.mood)); yield 0.7; S.drag = { b }; yield* glide(b.pos.slice(), [b.spot.x, b.spot.y], 0.9, p => { b.pos = p; dirty = true; }); dropBalloon(); yield 0.5; } }
      yield 0.4; }
    cap('HAND IN the page. Clean work earns stars and tips', 'HAND IN'); DM.handP = null; yield 1.2; finishJob(); yield () => S.phase === 'leave'; yield 2.0; }
  function demoStart() { if (DM.on || (S.phase !== 'intro' && S.phase !== 'done' && S.phase !== 'walk')) return; au(); DM.on = true; DM.day0 = S.day; S.day = 3; S.event = null; S.perDay = COMICS.perDay; S.done = null; S.dlg = null; Object.assign(S, { n: 0, earned: 0, tips: 0, starList: [] }); DM.gen = demoScript(); DM.wait = 0; DM.until = null; }
  function demoStop() { if (!DM.on) return; DM.on = false; DM.gen = null; DM.handP = null; hand.visible = false; S.hold = null; S.drag = null; S.react = null; S.flash = null; S.say = ''; S.day = DM.day0; JOB = null; custFox.forEach(f => f.visible = false); Object.assign(S, { phase: 'intro', done: null, n: 0, earned: 0, tips: 0, starList: [] }); idlePage(); ben.visible = true; placeF(ben, { x: 0.5, z: 3.2 }, 0.2); }
  function demoStep(dt) { if (!DM.gen) return; if (DM.wait > 0) { DM.wait -= dt; return; } if (DM.until) { if (!DM.until()) return; DM.until = null; }
    for (let guard = 0; guard < 4; guard++) { const r = DM.gen.next(); if (r.done) { demoStop(); return; } if (typeof r.value === 'function') { DM.until = r.value; return; } DM.wait = r.value || 0; if (DM.wait > 0) return; } }
  // ---------- hints ----------
  function nextHint() { if (S.phase !== 'work' || !JOB) return null; const T = S.tool || nextTask(); if (!T) return { text: 'ALL DONE · TAP HAND IN', tool: null };
    const tip = (text, tool, p) => ({ text, tool, p });
    if (T === 'panels') { const g = P.gutters.find(x => !x.cut); return g ? tip('SWIPE ALONG THE BLUE DASHES', 'panels', [(g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2]) : null; }
    if (!panelsReady() && JOB.tasks.includes('panels')) return tip('CUT THE PANELS FIRST', 'panels', null);
    if (T === 'pencil') { const s = P.shapes.find(x => !pencilled(x)); if (!s) return null; const d = s.dots.find(x => !x.lit); return tip('DRAG OVER THE BLUE DOTS', 'pencil', [d.x, d.y]); }
    if (T === 'ink') { const s = P.shapes.find(x => !x.inked && pencilled(x)); if (!s) return P.shapes.some(x => !x.inked) ? tip('PENCIL IT FIRST', 'pencil', null) : null; return tip(s.inkV > 0 ? 'HOLD AGAIN TO CLOSE THE LINE' : 'HOLD ON THE DRAWING · LET GO WHEN IT CLOSES', 'ink', s.label); }
    if (T === 'colour') { const R = P.regions().filter(r => regionReady(r) && r.fill !== r.want); if (!R.length) return P.regions().some(r => !regionReady(r)) ? tip('INK EVERYTHING FIRST', 'ink', null) : null; if (!S.brush) return tip('PICK A COLOUR BELOW', 'colour', null);
      const r = R.find(x => x.want === S.brush); return r ? tip('TAP THE ' + INKS[S.brush].n + 's', 'colour', r.label) : tip('PICK COLOUR ' + INKS[R[0].want].n + ' · ' + INKS[R[0].want].name, 'colour', null); }
    if (T === 'sfx') { const X = P.sfx; if (!panelInked(0)) return tip('INK THE TOP PANEL FIRST', 'ink', null); return X.picked ? tip('TAP THE BURST · ' + X.pumps + ' / ' + X.need, 'sfx', [X.x, X.y]) : tip('PICK THE WORD ON THE CARD', 'sfx', null); }
    if (T === 'letter') { const bi = pendingBalloon(); if (bi < 0) return null; const b = P.balloons[bi]; if (!panelInked(b.panel)) return tip('INK THAT PANEL FIRST', 'ink', null); return b.picked == null ? tip('PICK THE ' + JOB.mood + ' LINE', 'letter', null) : tip('DRAG THE BALLOON ONTO THE DASHED SPOT', 'letter', b.pos); }
    if (T === 'title') return P.title.stamped ? null : tip('HOLD THE TITLE BAND · LET GO IN THE GREEN', 'title', [(P.band[0] + P.band[2]) / 2, (P.band[1] + P.band[3]) / 2]);
    return null; }
  let HINT = null;
  // ---------- camera ----------
  const { SAFE, fitShot } = cameraFit(ST), CAM = { look: V3(0, 1.2, 0), pos: V3(0, 3, 6) }; let shotCache = { k: '', v: null };
  function viewRect() { if (S.view) return S.view; if (!P || S.phase === 'sketch') return [0, 0, PW, PH];
    const fw = Math.max(1, CW() - SAFE.left), fh = Math.max(1, CHh() - SAFE.top - SAFE.bottom), A = fw / fh;
    if (A < 0.9 || S.tool === 'panels' || !S.tool) return [0, 0, PW, PH];
    if (S.tool === 'title' && P.band) return [P.band[0] - 20, P.band[1] - 20, P.band[2] + 20, P.band[3] + 200];
    const p = HINT && HINT.p; let pi = S.focusP || 0; if (p) { const k = P.panelPaths.findIndex(pp => ART.hit(pp, p[0], p[1])); if (k >= 0) pi = k; } else if (S.tool === 'letter') { const bi = pendingBalloon(); if (bi >= 0) pi = P.balloons[bi].panel; }
    if (S.hold || S.drag) pi = S.focusP != null ? S.focusP : pi;
    const b = bbox(P.panels[pi]), x0 = b.x0 - 24, x1 = b.x1 + 24, y0 = b.y0 - 24, y1 = b.y1 + 24, maxH = Math.max(330, (x1 - x0) / A);
    if (pi !== S.focusP) S.focusC = null; S.focusP = pi;
    if (y1 - y0 <= maxH) return [x0, y0, x1, y1];
    // tall panel on a wide screen: a window that follows the next step
    let cy = S.focusC != null ? S.focusC : (p ? p[1] : (y0 + y1) / 2); if (p && !S.hold && !S.drag && Math.abs(p[1] - cy) > maxH * 0.32) cy = p[1]; cy = clamp(cy, y0 + maxH / 2, y1 - maxH / 2); S.focusC = cy;
    return [x0, cy - maxH / 2, x1, cy + maxH / 2]; }
  function pageShot() { const v = viewRect(), k = v.map(Math.round).join(',') + '|' + CW() + 'x' + CHh() + '|' + SAFE.top + '|' + SAFE.bottom + '|' + SAFE.left; if (shotCache.k !== k) { const pts = [local2world(v[0], v[1]), local2world(v[2], v[1]), local2world(v[0], v[3]), local2world(v[2], v[3])]; shotCache = { k, v: fitShot(pts, Y.tilt, Math.PI, 0.025) }; } return shotCache.v; }
  function camShot() { const port = CHh() > CW();
    if (S.phase === 'work' || S.phase === 'sketch') return pageShot();
    if (S.phase === 'walk' && S.dlg) { const mx = (W.x + bram.position.x) / 2, mz = (W.z + bram.position.z) / 2, l = Math.hypot(mx, mz) || 1; const fx = mx / l, fz = mz / l, sh = port ? 0 : 1.1; return { pos: V3(mx - fx * 4.0, 2.2, mz - fz * 4.0), look: V3(mx + fz * sh, port ? 0.5 : 1.0, mz - fx * sh) }; }
    if (S.phase === 'walk') { const look = V3(W.x, 1.15, W.z), p = W.camPitch, y = W.camYaw, d = W.camDist; const pos = look.clone().add(V3(Math.sin(y) * Math.cos(p) * d, Math.sin(p) * d, -Math.cos(y) * Math.cos(p) * d)); return { pos, look }; }
    if (S.phase === 'arrive' || S.phase === 'leave') { const c = cust.position; return { pos: V3(-0.8, 3.5, -4.7), look: V3(c.x * 0.7, 0.9, Math.max(c.z, -1.6) * 0.75) }; }
    if (S.phase === 'react') { const c = cust.position; return fitShot([V3(c.x - 0.7, 0.2, c.z), V3(c.x + 0.7, 0.2, c.z), V3(c.x, 2.2, c.z), V3(-0.2, 1.8, -2.95), V3(-0.2, 0.1, -2.95)], 0.16, Math.PI - 0.32, 0.08); }
    // intro / done: Ben waving in the middle of the shop, Bramble at his counter, the art desk behind
    return fitShot([V3(-0.1, 0, 3.2), V3(1.1, 0, 3.2), V3(0.5, 2.3, 3.2), V3(-2.9, 0.1, 4.85), V3(-2.4, 2.1, 4.85), V3(0, 2.6, 0)], 0.4, Math.PI - (port ? 0.18 : 0.3), 0.05); }
  // ---------- input ----------
  const ptrs = new Map(); let pinch = null, tap = null;
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  function pagePt(x, y) { NDC.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); RC.setFromCamera(NDC, camera); const h = RC.intersectObject(Y.pageMesh, false)[0]; return h && h.uv ? [h.uv.x * PW, (1 - h.uv.y) * PH] : null; }
  function floorPt(x, y) { NDC.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); RC.setFromCamera(NDC, camera); const o = RC.ray.origin, d = RC.ray.direction; if (d.y > -0.01) return null; const k = -o.y / d.y; return [o.x + d.x * k, o.z + d.z * k]; }
  function onDown(e) { au(); const q = local(e); ptrs.set(e.pointerId, q); e.preventDefault(); try { renderer.domElement.setPointerCapture(e.pointerId); } catch (er) {}
    if (DM.on) return;
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; if (S.hold && S.hold.kind === 'ink') { S.hold = null; } S.ptr = null; S.drag = null; pinch = { d0: Math.hypot(a.x - b.x, a.y - b.y), m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }, v0: viewRect().slice(), dist0: W.camDist }; return; }
    if (ptrs.size > 2) return;
    if (S.phase === 'walk') { tap = { x: q.x, y: q.y, t: performance.now(), moved: false, lx: q.x, ly: q.y }; return; }
    if (S.phase === 'sketch') { const p = pagePt(q.x, q.y); if (!p) return; SK.cur = { col: SK.col, w: SK.size, pts: [p] }; SK.strokes.push(SK.cur); SND.loop('pencil', true, 0.5); skStroke(SK.cur); SK.tex.needsUpdate = true; return; }
    if (S.phase !== 'work' || !P) return; const p = pagePt(q.x, q.y); S.ptr = { last: p, pts: p ? [p] : [] }; if (!p) return; const T = S.tool;
    if (!T) { flash('PICK A JOB BUTTON BELOW', '#ffd23a', 1.2); return; }
    if (T === 'pencil') lightAt(p, null);
    else if (T === 'ink') startInk(p);
    else if (T === 'colour') fillAt(p);
    else if (T === 'sfx') { if (P.sfx.picked) pump(); else flash('PICK THE WORD FIRST', '#e6b45a', 1.2); }
    else if (T === 'letter') { const bi = pendingBalloon(); const b = bi >= 0 ? P.balloons[bi] : null; if (b && b.picked != null && Math.hypot((p[0] - b.pos[0]) / (b.spot.rx + 40), (p[1] - b.pos[1]) / (b.spot.ry + 40)) < 1.15) { S.drag = { b, off: [b.pos[0] - p[0], b.pos[1] - p[1]] }; tone(600, 0.05, 0.03); } else if (b && b.picked == null) flash('PICK A LINE BELOW', '#ffd23a', 1.2); }
    else if (T === 'title') { if (P.title.stamped) return; S.hold = { kind: 'title', v: 0 }; tone(200, 0.3, 0.03, 'sine'); }
    else if (T === 'sign' && P.sign) { const [x0, y0, x1, y1] = P.sign.box; if (p[0] > x0 - 40 && p[0] < x1 + 40 && p[1] > y0 - 40 && p[1] < y1 + 40) { S.signCur = [[clamp(p[0], x0 + 4, x1 - 4), clamp(p[1], y0 + 4, y1 - 4)]]; P.sign.strokes.push(S.signCur); dirty = true; } else flash('SIGN INSIDE THE DASHED BOX', '#ffd23a', 1.2); } }
  function onMove(e) { if (!ptrs.has(e.pointerId)) return; const q = local(e); ptrs.set(e.pointerId, q);
    if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()], d1 = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; if (SK.cur) { SK.strokes.pop(); SK.cur = null; skRedraw(); }
      if (S.phase === 'work' || S.phase === 'sketch') { const v = pinch.v0, w0 = v[2] - v[0], h0 = v[3] - v[1], k = clamp(pinch.d0 / Math.max(20, d1), 160 / w0, PW * 1.05 / w0), w = w0 * k, h = h0 * k, sc = w0 / Math.max(1, CW() - SAFE.left); let cx = (v[0] + v[2]) / 2 - (m.x - pinch.m0.x) * sc, cy = (v[1] + v[3]) / 2 - (m.y - pinch.m0.y) * sc; cx = clamp(cx, w / 2 - 40, PW - w / 2 + 40); cy = clamp(cy, h / 2 - 40, PH - h / 2 + 40); if (w >= PW * 0.98) { cx = PW / 2; } S.view = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]; }
      else if (S.phase === 'walk') { W.camDist = clamp(pinch.dist0 * pinch.d0 / Math.max(20, d1), 3.2, 9); W.dragT = S.t; } return; }
    if (S.phase === 'walk' && tap) { const dx = q.x - tap.lx, dy = q.y - tap.ly; if (Math.hypot(q.x - tap.x, q.y - tap.y) > 10) tap.moved = true; if (tap.moved) { W.camYaw -= dx * 0.008; W.camPitch = clamp(W.camPitch + dy * 0.005, 0.22, 1.25); W.dragT = S.t; } tap.lx = q.x; tap.ly = q.y; return; }
    if (S.phase === 'sketch' && SK.cur) { const p = pagePt(q.x, q.y); if (!p) return; const l = SK.cur.pts[SK.cur.pts.length - 1]; const dd = Math.hypot(p[0] - l[0], p[1] - l[1]); if (dd < 2) return; SND.loop('pencil', true, 0.3 + dd / 25); SK.cur.pts.push(p); skc.strokeStyle = SKC[SK.cur.col]; skc.lineWidth = SK.cur.w; skc.lineCap = 'round'; skc.beginPath(); skc.moveTo(l[0], l[1]); skc.lineTo(p[0], p[1]); skc.stroke(); SK.tex.needsUpdate = true; return; }
    const Pp = S.ptr; if (!Pp || S.phase !== 'work' || DM.on) return; const p = pagePt(q.x, q.y); if (!p) return; const T = S.tool;
    if (T === 'sign' && S.signCur) { const [x0, y0, x1, y1] = P.sign.box, l = S.signCur[S.signCur.length - 1], c2 = [clamp(p[0], x0 + 4, x1 - 4), clamp(p[1], y0 + 4, y1 - 4)]; P.sign.len += Math.hypot(c2[0] - l[0], c2[1] - l[1]); S.signCur.push(c2); dirty = true; SND.loop('sign', true, 1); if (Math.random() < 0.3) noBurst(0.03, 2600, 0.03); }
    if (T === 'pencil') { if (Pp.last) { const n = Math.ceil(Math.hypot(p[0] - Pp.last[0], p[1] - Pp.last[1]) / 10); for (let i = 1; i <= n; i++) { const k = i / n, ip = [Pp.last[0] + (p[0] - Pp.last[0]) * k, Pp.last[1] + (p[1] - Pp.last[1]) * k]; lightAt(ip, i === 1 ? Pp.last : null); } } else lightAt(p, null); }
    else if (T === 'panels') Pp.pts.push(p);
    else if (T === 'letter' && S.drag) { const b = S.drag.b, pb = bbox(P.panels[b.panel]); b.pos = [clamp(p[0] + S.drag.off[0], pb.x0 + b.spot.rx * 0.6, pb.x1 - b.spot.rx * 0.6), clamp(p[1] + S.drag.off[1], pb.y0 + b.spot.ry * 0.6, pb.y1 - b.spot.ry * 0.6)]; dirty = true; }
    Pp.last = p; }
  function onUp(e) { const had = ptrs.has(e.pointerId); ptrs.delete(e.pointerId); if (!had) return; if (pinch) { if (ptrs.size < 2) pinch = null; return; }
    if (S.phase === 'walk' && tap && !DM.on) { const q = local(e); if (!tap.moved && performance.now() - tap.t < 450) walkTap(q.x, q.y); tap = null; return; }
    SND.loop('pencil', false); SND.loop('sign', false);
    if (S.phase === 'sketch') { SK.cur = null; return; }
    if (DM.on) return; const T = S.tool; if (S.signCur) { S.signCur = null; if (P.sign.len >= 200 && !S.doneSeen.sign) { good(); sparkAt((P.sign.box[0] + P.sign.box[2]) / 2, P.sign.box[1], '#ffd23a', 8); } checkDone(); }
    if (T === 'panels' && S.ptr) evalCut(S.ptr.pts); if (S.hold && S.hold.kind === 'ink') releaseInk(); if (S.hold && S.hold.kind === 'title') releaseTitle(); if (S.drag) dropBalloon(); S.ptr = null; S.stray = null; S.strayCounted = false; }
  function walkTap(x, y) { // tap a thing = walk to it and use it · tap the floor = walk there
    let best = null, bd = 1e9; const scr = v => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * CW(), y: (1 - p.y) / 2 * CHh(), z: p.z }; };
    const anchors = [{ id: 'bramble', p: V3(bram.position.x, 1.2, bram.position.z), at: Y.interact[0] }, { id: 'desk', p: V3(0, 1.1, -4.5), at: Y.interact[1] }, { id: 'spinner', p: V3(0, 1.4, 0), at: { x: 0, z: 1.75 } }, { id: 'superfox', p: V3(-4.2, 1.3, 3.15), at: Y.interact[3] }, { id: 'ironfox', p: V3(4.2, 1.3, 3.15), at: Y.interact[4] }, { id: 'posterL', p: V3(-4.64, 1, -2.5), at: Y.interact[5] }, { id: 'posterR', p: V3(4.64, 1, -2.5), at: Y.interact[6] }, { id: 'tableL', p: V3(-4.1, 0.8, 0), at: { x: -2.75, z: 0 } }, { id: 'tableR', p: V3(4.1, 0.8, 0), at: { x: 2.75, z: 0 } }, { id: 'gallery', p: V3(2.1, 1.4, 4.9), at: Y.interact[10] }];
    for (const a of anchors) { const s = scr(a.p); if (s.z > 1) continue; const d = Math.hypot(s.x - x, s.y - y); if (d < 70 && d < bd) { bd = d; best = a; } }
    if (best) { const [tx, tz] = collide(best.at.x, best.at.z); W.target = { x: tx, z: tz, act: best.id, t: 0 }; ringM.position.set(tx, 0.02, tz); ringM.visible = true; return; }
    const f = floorPt(x, y); if (!f) return; const [tx, tz] = collide(f[0], f[1]); W.target = { x: tx, z: tz, act: null, t: 0 }; ringM.position.set(tx, 0.02, tz); ringM.visible = true; tone(520, 0.04, 0.02); }
  const onWheel = e => { if (S.phase === 'work' || S.phase === 'sketch') { const v = viewRect(), k = clamp(1 + e.deltaY * 0.0015, 0.8, 1.25), w = clamp((v[2] - v[0]) * k, 160, PW * 1.05), h = (v[3] - v[1]) * w / (v[2] - v[0]), cx = (v[0] + v[2]) / 2, cy = (v[1] + v[3]) / 2; S.view = [cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2]; e.preventDefault(); } else if (S.phase === 'walk') { W.camDist = clamp(W.camDist * (1 + e.deltaY * 0.0015), 3.2, 9); e.preventDefault(); } };
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp); renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
  const onKD = e => { au(); if (S.phase === 'work' && !DM.on && JOB) { const n = +e.key; if (n >= 1 && n <= 6 && S.tool === 'colour') { setBrush(IK[n - 1]); return; } if (e.code === 'Tab') { e.preventDefault(); const T = JOB.tasks, i = T.indexOf(S.tool); setTool(T[(i + (e.shiftKey ? T.length - 1 : 1)) % T.length]); return; } if (e.code === 'Enter') { handIn(); return; } if (e.code === 'KeyF') { S.view = null; return; } return; }
    if (S.phase !== 'walk' || DM.on) return; if (e.code === 'KeyE') { e.preventDefault(); talk(); return; } if (e.code === 'Digit1') { wave(); return; } if (e.code === 'Digit2') { look(); return; } if (e.code === 'Space') { e.preventDefault(); ben.userData.hop = 1; return; } W.keys.add(e.code); }, onKU = e => W.keys.delete(e.code), onBlur = () => W.keys.clear();
  addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);
  // ---------- LOCAL ART: finished pages + sketches stay in the shop (this device) ----------
  const GKEY = 'home.comics.gallery', PATS = {}, texLoader = new THREE.TextureLoader(); let GAL = []; try { GAL = JSON.parse(localStorage.getItem(GKEY) || '[]') || []; } catch (e) { GAL = []; }
  function showGallery() { const list = GAL.slice(-8).reverse(); Y.frames.forEach((m, i) => { const g = list[i]; if (!g) { m.material.map = null; m.material.color.set('#efe9da'); } else { const tx = texLoader.load(g.img); tx.colorSpace = THREE.SRGBColorSpace; m.material.map = tx; m.material.color.set('#ffffff'); } m.material.needsUpdate = true; });
    list.filter(g => g.kind === 'page').slice(0, 8).forEach((g, i) => { const m = Y.spinCovers[i * 2]; if (!m) return; const tx = texLoader.load(g.img); tx.colorSpace = THREE.SRGBColorSpace; m.material = new THREE.MeshToonMaterial({ map: tx, gradientMap: ST.grad }); }); }
  function addGallery(src, kind, title) { const c = document.createElement('canvas'); c.width = 160; c.height = 240; c.getContext('2d').drawImage(src, 0, 0, 160, 240); GAL.push({ img: c.toDataURL('image/jpeg', 0.72), kind, title, t: Date.now() }); GAL = GAL.slice(-8); try { localStorage.setItem(GKEY, JSON.stringify(GAL)); } catch (e) {} showGallery(); }
  showGallery();
  function savePage() { if (S.phase === 'sketch') return { url: SK.cv.toDataURL('image/png'), name: 'ben-sketch.png', title: 'Sketch by Ben' }; const ps = (S.pages || []).slice().sort((a, b) => b.stars - a.stars); if (!ps.length) return null; return { url: ps[0].url, name: ps[0].title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.png', title: ps[0].title }; }
  // ---------- SKETCHBOOK: draw anything on a blank page ----------
  const SK = { cv: document.createElement('canvas'), strokes: [], col: 'black', size: 10, cur: null, tex: null }; SK.cv.width = PW; SK.cv.height = PH; const skc = SK.cv.getContext('2d');
  const SKC = { black: '#151312', ...Object.fromEntries(IK.map(k => [k, INKS[k].col])), white: '#fbf8ec' };
  function skPaper() { skc.fillStyle = '#fbf8ec'; skc.fillRect(0, 0, PW, PH); skc.strokeStyle = 'rgba(79,159,224,0.14)'; skc.lineWidth = 1; for (let x = 40; x < PW; x += 40) { skc.beginPath(); skc.moveTo(x, 0); skc.lineTo(x, PH); skc.stroke(); } for (let y = 40; y < PH; y += 40) { skc.beginPath(); skc.moveTo(0, y); skc.lineTo(PW, y); skc.stroke(); } skc.fillStyle = '#8f8f99'; skc.font = '900 16px ' + FONT_C; skc.textAlign = 'right'; skc.fillText("BEN'S SKETCHBOOK · BRAMBLE'S COMICS", PW - 24, PH - 18); }
  function skStroke(st) { skc.strokeStyle = SKC[st.col]; skc.fillStyle = SKC[st.col]; skc.lineWidth = st.w; skc.lineCap = 'round'; skc.lineJoin = 'round'; const p = st.pts; if (p.length === 1) { skc.beginPath(); skc.arc(p[0][0], p[0][1], st.w / 2, 0, 7); skc.fill(); return; } skc.beginPath(); skc.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) skc.lineTo(p[i][0], p[i][1]); skc.stroke(); }
  function skRedraw() { skPaper(); SK.strokes.forEach(skStroke); if (SK.tex) SK.tex.needsUpdate = true; }
  function startSketch() { if (DM.on || !['intro', 'walk', 'done'].includes(S.phase)) return; au(); S.phase = 'sketch'; S.done = null; S.dlg = null; S.view = null; ben.visible = false; SK.strokes = []; SK.cur = null; if (!SK.tex) { SK.tex = new THREE.CanvasTexture(SK.cv); SK.tex.colorSpace = THREE.SRGBColorSpace; SK.tex.anisotropy = 8; } skRedraw(); Y.pageMesh.material.map = SK.tex; Y.pageMesh.material.needsUpdate = true; say("BRAMBLE: \"Free page. Draw whatever you like. If it is good, I will hang it by the door.\"", 4); speak('Sketchbook. Draw with your finger.'); }
  function endSketch() { if (S.phase !== 'sketch') return; Y.pageMesh.material.map = pageTex; Y.pageMesh.material.needsUpdate = true; S.view = null; toIntro(); }
  function sketchHang() { if (!SK.strokes.length) { flash('DRAW SOMETHING FIRST', '#e6b45a', 1.3); return; } addGallery(SK.cv, 'sketch', 'Sketch by Ben'); flash('HUNG ON THE LOCAL ART BOARD!', '#22c55e', 1.8); tone(880, 0.1, 0.05); setTimeout(() => tone(1320, 0.14, 0.05), 110); speak('Hung on the local art board'); endSketch(); }
  // ---------- SHOP LIFE: two foxes browse, Bramble reads ----------
  const BSP = [{ x: -2.6, z: -1.6, lx: -4.6, lz: -2.5 }, { x: -2.6, z: 2.6, lx: -4.2, lz: 3.15 }, { x: 0, z: 2.75, lx: 0, lz: 0 }, { x: 2.6, z: 2.6, lx: 4.2, lz: 3.15 }, { x: 2.6, z: -1.6, lx: 4.64, lz: -2.5 }];
  const browsers = [{ fur: '#fdba74', torso: ['#cdb4f5', '#8e6ad6', '#4b2a8a'], outfit: 'dress', i: 0 }, { fur: '#ffdcae', torso: ['#9fd6c8', '#3f8f7c', '#1f4a40'], outfit: 'coat', i: 4 }].map((o, k) => { const f = strip(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: o.fur, furDark: '#' + new THREE.Color(o.fur).multiplyScalar(0.7).getHexString() }, torso: o.torso, outfit: o.outfit, crest: '', gear: 'none', mood: 'happy' }));
    const bk = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.32), new THREE.MeshToonMaterial({ map: coverTex(canvasTex, k + 2), gradientMap: ST.grad, side: THREE.DoubleSide })); bk.position.set(0, 1.0, 0.42); bk.rotation.x = -0.6; f.userData.P.body.add(bk); f.visible = false; blob(f, 0.46); return { f, i: o.i, path: [], wait: rr(2, 5), book: bk, placed: false }; });
  const bramBook = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.34), new THREE.MeshToonMaterial({ map: coverTex(canvasTex, 0), gradientMap: ST.grad, side: THREE.DoubleSide })); bramBook.position.set(0, 1.0, 0.46); bramBook.rotation.x = -0.6; bram.userData.P.body.add(bramBook);
  function stepBrowsers(dt) { const on = ['walk', 'intro', 'done'].includes(S.phase); for (const B of browsers) { B.f.visible = on; if (!on) continue; if (!B.placed) { placeF(B.f, BSP[B.i]); B.placed = true; }
      if (B.path.length) { B.book.visible = false; B.f.userData.hold = null; if (moveTo(B.f, B.path, dt, 1.15)) B.wait = rr(3, 7); }
      else { const sp = BSP[B.i]; B.f.rotation.y += angWrap(Math.atan2(sp.lx - B.f.position.x, sp.lz - B.f.position.z) - B.f.rotation.y) * Math.min(1, dt * 4); B.book.visible = true; B.f.userData.hold = { right: true, left: true }; kit.animFox(B.f, dt, 0);
        if ((B.wait -= dt) <= 0) { let n = clamp(B.i + (Math.random() < 0.5 ? -1 : 1), 0, BSP.length - 1); if (browsers.some(o => o !== B && o.i === n)) n = B.i; if (n !== B.i) { B.i = n; B.path = [BSP[n]]; } else B.wait = rr(2, 4); } } } }
  // ---------- PIZZA for Bramble (the Home planet delivery stop; Bramble's lines verbatim from the 2D file) ----------
  const PZ = PIZZA_LINES;
  const sal = strip(kit.makeFox({ ...CAST.player, torso: ['#efe2c8', '#c9b48a', '#7d6a4a'], outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); sal.visible = false; blob(sal, 0.46);
  const pzT = canvasTex(128, 128, c => { c.fillStyle = '#fbf8ec'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#d8432f'; for (let i = 0; i < 4; i++) c.fillRect(0, i * 32, 128, 14); c.fillStyle = '#151312'; c.font = '900 22px Arial'; c.textAlign = 'center'; c.fillText("SAL'S", 64, 72); });
  const pzBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.07, 0.42), [toon('#efe2c8'), toon('#efe2c8'), new THREE.MeshToonMaterial({ map: pzT, gradientMap: ST.grad }), toon('#efe2c8'), toon('#efe2c8'), toon('#efe2c8')]); ST.addOutline(pzBox, 0.01); pzBox.position.set(0, 1.0, 0.45); sal.userData.P.body.add(pzBox);
  function stepPizza(dt) { const Z = S.pz; if (!Z) return; if (S.phase !== 'walk') { if (Z.st !== 'done') { sal.visible = false; S.pz = null; } return; } Z.t += dt;
    if (Z.st === 'wait' && Z.t > 6) { toast('BRAMBLE: "' + PZ.waiting[Z.k] + '"', 6); Z.st = 'call'; }
    else if (Z.st === 'call' && Z.t > 13) { sal.visible = true; pzBox.visible = true; sal.userData.P.body.add(pzBox); pzBox.position.set(0, 1.0, 0.45); pzBox.rotation.set(0, 0, 0); placeF(sal, Y.spots.door, Math.PI); sal.userData.hold = { right: true, left: true }; SND.play('doorbell'); Z.path = [{ x: 0, z: 5.3 }, { x: -0.75, z: 5.0 }]; Z.st = 'walk'; tone(660, 0.1, 0.04); }
    else if (Z.st === 'walk') { if (moveTo(sal, Z.path, dt, 1.6)) { sal.rotation.y = -Math.PI / 2; Z.st = 'hand'; Z.t2 = 0; scene.add(pzBox); pzBox.position.set(-1.6, 1.11, 5.05); pzBox.rotation.y = 0.3; sal.userData.hold = null; SND.play('box'); toast('BRAMBLE: "' + pick(PZ.got) + '"', 6); tone(880, 0.12, 0.05); bram.userData.mood = 'excited'; } }
    else if (Z.st === 'hand') { kit.animFox(sal, dt, 0); if ((Z.t2 += dt) > 2.6) { Z.path = [{ x: 0, z: 5.3 }, Y.spots.door]; Z.st = 'leave'; } }
    else if (Z.st === 'leave') { if (moveTo(sal, Z.path, dt, 2)) { sal.visible = false; Z.st = 'done'; S.pzDay = S.day; bram.userData.mood = 'happy'; } } }

  // ---------- frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false, hintT = 0;
  function moveTo(f, path, dt, spd = 1.7) { const tg = path[0]; if (!tg) return true; const dx = tg.x - f.position.x, dz = tg.z - f.position.z, d = Math.hypot(dx, dz); if (d < 0.08) { path.shift(); return !path.length; } const s = Math.min(d, spd * dt); f.position.x += dx / d * s; f.position.z += dz / d * s; f.rotation.y += angWrap(Math.atan2(dx, dz) - f.rotation.y) * Math.min(1, dt * 10); kit.animFox(f, dt, spd); return false; }
  function step(dt) { S.t += dt; S.phT += dt; const t = S.t; Y.update(dt, t);
    if (S.flashT > 0 && (S.flashT -= dt) <= 0) S.flash = null; if (S.sayT > 0 && (S.sayT -= dt) <= 0) S.say = ''; if (S.toastT > 0 && (S.toastT -= dt) <= 0) S.toast = '';
    if (DM.on) demoStep(dt);
    let bspd = 0; if (S.phase === 'walk') bspd = stepWalk(dt); else ringM.visible = false;
    if (S.phase === 'arrive') { if (moveTo(cust, S.walkPath, dt, 2.5) || S.phT > 12) { cust.position.set(Y.spots.wait.x, 0, Y.spots.wait.z); cust.rotation.y = -Math.PI / 2; S.phase = 'work'; S.phT = 0; S.n++; say(CUS.name + ': "' + JOB.hello.replace('{MOOD}', JOB.mood) + '"', 4.5); setTool(nextTask()); } }
    else if (cust && S.phase !== 'react' && S.phase !== 'leave' && cust.visible) kit.animFox(cust, dt, 0);
    if (S.phase === 'react') { kit.animFox(cust, dt, 0); if (cust.userData.page) cust.userData.page.position.y = 1.2 + Math.abs(Math.sin(S.phT * 4)) * 0.05; if (S.phT > (DM.on ? 3.4 : 4.2)) { S.react = null; S.phase = 'leave'; S.phT = 0; S.walkPath = [{ x: 1.6, z: -1.2 }, { x: 2.6, z: 0 }, { x: 2.6, z: 2.6 }, { x: 0.3, z: 3.6 }, Y.spots.door]; ben.visible = false; } }
    else if (S.phase === 'leave') { if (moveTo(cust, S.walkPath, dt, 2.8) || S.phT > 7) { cust.visible = false; if (cust.userData.page) { cust.remove(cust.userData.page); cust.userData.page = null; cust.userData.hold = null; } if (DM.on) { S.phase = 'leave'; } else if (S.n >= (S.perDay || COMICS.perDay)) endDay(); else startJob(); } }
    // ink + title holds
    if (S.hold && S.hold.kind === 'ink') { const s = S.hold.s; s.inkV += s.L / inkDur() * dt; dirty = true; if (Math.random() < 0.3) tone(180 + (s.inkV / s.L) * 300, 0.04, 0.012, 'sine'); if (!S.hold.rung && s.inkV / s.L >= GZ()[0]) { S.hold.rung = true; tone(1320, 0.14, 0.05, 'triangle'); } if (s.inkV / s.L >= GZ()[3]) releaseInk(); }
    if (S.hold && S.hold.kind === 'title') { S.hold.v += dt / 1.45; if (S.hold.v >= 1.25) releaseTitle(); }
    if (P) { for (const r of P.regions()) if (r.fillT < 1) { r.fillT = Math.min(1, r.fillT + dt / 0.38); dirty = true; } for (const g of P.gutters) if (g.cut && g.anim < 1) { g.anim = Math.min(1, g.anim + dt / 0.32); dirty = true; } if (P.sfx && P.sfx.pop > 0) { P.sfx.pop = Math.max(0, P.sfx.pop - dt * 3); dirty = true; } }
    if (dirty && ART) { const work = S.phase === 'work'; ART.draw({ t, guides: work && S.tool === 'panels' || (work && JOB && JOB.tasks.includes('panels') && !panelsReady()), dots: work && JOB && JOB.tasks.includes('pencil') && panelsReady() && P.shapes.some(s => !pencilled(s)), numbers: work && JOB && JOB.tasks.includes('colour'), readyR: regionReady, hc: OPTS.hc, signSpot: work && S.tool === 'sign' && P.sign && P.sign.len < 200, sfxSpot: work && S.tool === 'sfx', spot: work && S.tool === 'letter' ? pendingBalloon() : -1 }); pageTex.needsUpdate = true; dirty = false; }
    // hints on the page
    hintT += dt; HINT = DM.on ? null : nextHint(); const hp = HINT && HINT.p && !S.hold && !S.drag ? HINT.p : null; hint3.visible = hint3b.visible = !!hp && S.phase === 'work';
    if (hp) { const [lx, ly] = toLocal(hp[0], hp[1]), k = (hintT * 1.2) % 1, k2 = (hintT * 1.2 + 0.5) % 1, sz = 0.75 * Math.max(0.45, (viewRect()[2] - viewRect()[0]) / PW); hint3.position.set(lx, ly, 0.008); hint3b.position.copy(hint3.position); hint3.scale.setScalar(sz * (0.7 + k * 1.1)); hint3b.scale.setScalar(sz * (0.7 + k2 * 1.1)); hint3.material.opacity = 0.95 * (1 - k); hint3b.material.opacity = 0.95 * (1 - k2); }
    if (DM.on && DM.handP && S.phase === 'work') { hand.visible = true; const w = local2world(DM.handP[0], DM.handP[1]); hand.position.lerp(w, hand.userData.on ? Math.min(1, dt * 18) : 1); hand.userData.on = true; } else { hand.visible = false; hand.userData.on = false; }
    // cast
    const greet = S.phase === 'intro' || S.phase === 'done'; if (ben.visible) { kit.animFox(ben, dt, bspd); ben.userData.mood = greet ? 'excited' : 'happy'; if (greet && BP.arms && BP.arms[0]) BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(t * 7) * 0.32); }
    kit.animFox(bram, dt, 0); if (S.phase === 'walk' && !S.dlg) { const dx = ben.position.x - bram.position.x, dz = ben.position.z - bram.position.z; if (Math.hypot(dx, dz) < 4) bram.rotation.y += angWrap(Math.atan2(dx, dz) - bram.rotation.y) * Math.min(1, dt * 4); } else bram.rotation.y += angWrap(Math.PI / 2 - bram.rotation.y) * Math.min(1, dt * 3);
    Y.monitor.material.color.setHSL(0.58, 0.25, 0.78 + Math.sin(t * 2) * 0.03);
    stepBrowsers(dt); stepPizza(dt); stepParts(dt);
    { const on = S.phase === 'walk' || S.phase === 'intro' || S.phase === 'done'; for (const d of dust) { const u = d.userData; u.ph += dt * u.sp; d.position.set(u.x + Math.sin(u.ph * 1.3) * 0.4, u.y + Math.sin(u.ph) * 0.3, u.z + Math.cos(u.ph * 0.9) * 0.4); d.material.opacity = on ? 0.35 + Math.sin(u.ph * 3) * 0.2 : 0; d.visible = on; } } if (S.streakT > 0) S.streakT -= dt; if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 1.4);
    { const reading = ['walk', 'intro', 'done'].includes(S.phase) && !S.dlg && W.bWave <= 0 && !(S.pz && S.pz.st === 'hand'); bramBook.visible = reading; bram.userData.hold = reading ? { right: true, left: true } : null; }
    // camera
    { const c = camera.position.clone().sub(Y.root.position); Y.applyCut(c); }
    { const c = camera.position.clone().sub(Y.root.position); const fx = S.phase === 'walk' ? W.x : c.x, fz = S.phase === 'walk' ? W.z : c.z; for (const L of Y.floorLamps) { const v = Math.hypot(c.x - L.x, c.z - L.z) > 1.1 && segDist([L.x, L.z], [c.x, c.z], [fx, fz]).d > 0.55; if (L.on !== v) { L.on = v; L.parts.forEach(m => m.visible = v); } } }
    { const w = S.phase === 'work' || S.phase === 'sketch'; if (Y.clutterOff !== w) { Y.clutterOff = w; Y.clutter.forEach(m => m.visible = !w); } }
    const sh = camShot(), kk = S.phase === 'walk' ? Math.min(1, dt * 8) : Math.min(1, dt * 3.2); camera.position.lerp(sh.pos, kk); CAM.look.lerp(sh.look, kk); camera.lookAt(CAM.look); }
  function musicFor() { if (DM.on) return 'work'; const p = S.phase; if (p === 'sketch') return 'sketch'; if (p === 'react') return 'react'; if (p === 'work' || p === 'arrive' || p === 'leave') return S.event === 'rush' ? 'rush' : 'work'; return 'shop'; }
  let musWas = null; function musicTick() { const m = musicFor(); if (m !== musWas) { musWas = m; SND.setMusic(m); } }
  function frame() { raf = requestAnimationFrame(frame); musicTick(); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); const sk = S.shake * 0.035, ox = rr(-1, 1) * sk, oy = rr(-1, 1) * sk; camera.position.x += ox; camera.position.y += oy; renderer.render(scene, camera); camera.position.x -= ox; camera.position.y -= oy; hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); shotCache.k = ''; } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  // ---------- HUD state ----------
  function hud() { const J = JOB, work = S.phase === 'work', bi = P && work ? pendingBalloon() : -1, D = S.dlg, ln = D ? D.lines[D.i] : null, last = D && D.i >= D.lines.length - 1;
    const prompt = S.phase === 'walk' && !D && W.near ? (W.hudPad ? W.near.label : 'E · ' + W.near.label) : null;
    return { phase: S.phase, day: S.day, n: Math.min(S.n, (S.perDay || COMICS.perDay)), perDay: (S.perDay || COMICS.perDay), earned: S.earned, tips: S.tips, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0,
      job: J ? { star: J.star, face: J.tasks.includes('face') ? J.face : null, sign: J.sign, owner: CUS.name, series: SERIES[J.series].name, book: BOOKS[J.book].name, issue: J.issue, mood: J.mood, sfx: J.tasks.includes('sfx') ? SERIES[J.series].sfx : null, tasks: J.tasks.map(id => { const I = info(id); return { id, label: TASKS[id].label, name: TASKS[id].name, done: I.done, txt: I.txt }; }) } : null,
      tool: S.tool, brush: S.brush, inks: IK.map(k => ({ k, n: INKS[k].n, name: INKS[k].name, col: INKS[k].col, pat: OPTS.hc ? (PATS[k] = PATS[k] || swatchPattern(k)) : '' })),
      lines: work && S.tool === 'letter' && bi >= 0 && panelInked(P.balloons[bi].panel) ? P.balloons[bi].opts.map((o, i) => ({ t: o.t, i, on: P.balloons[bi].picked === i })) : null,
      sfxPick: work && S.tool === 'sfx' && P.sfx && !P.sfx.done && P.sfx.pumps === 0 ? P.sfx.opts.map(w => ({ w, on: P.sfx.picked === w })) : null,
      facePick: work && S.tool === 'face' && JOB && JOB.tasks.includes('face') ? FACES.map(f => ({ f, on: P.face === f })) : null,
      opts: { ...OPTS }, muted: !!S.muted, embed: !!embed, streak: S.streakT > 0 ? S.streak : 0, event: S.phase === 'intro' || S.phase === 'walk' ? eventFor(S.day) : S.event || null, galleryN: GAL.length, pagesN: (S.pages || []).length,
      sketch: S.phase === 'sketch' ? { col: SK.col, size: SK.size, n: SK.strokes.length, cols: Object.keys(SKC).map(k => ({ k, col: SKC[k] })) } : null,
      press: S.hold ? (S.hold.kind === 'ink' ? (() => { const r = S.hold.s.inkV / S.hold.s.L, [g0, g1, g2, g3] = GZ(); return { kind: 'INK · LET GO IN THE GREEN', v: Math.min(1, r / g3), zone: r < g0 ? 'KEEP HOLDING' : r <= g1 ? 'CLOSED · LET GO!' : r < g2 ? 'WOBBLY' : 'BLOT!', col: r < g0 ? '#ffffff' : r <= g1 ? '#22c55e' : r < g2 ? '#e6b45a' : '#ec3013', bands: [[g0 / g3 * 100, '#9ca3af'], [(g1 - g0) / g3 * 100, '#22c55e'], [(g2 - g1) / g3 * 100, '#e6b45a'], [(g3 - g2) / g3 * 100, '#ec3013']], green: 1 }; })()
        : (() => { const v = S.hold.v, [a, b] = titleZone(); return { kind: 'STAMP · LET GO IN THE GREEN', v: Math.min(1, v / 1.25), zone: v < a ? 'TOO LIGHT' : v <= b ? 'JUST RIGHT · LET GO!' : v < 1 ? 'SMUDGY' : 'OVERINKED', col: v < a ? '#ffffff' : v <= b ? '#22c55e' : v < 1 ? '#e6b45a' : '#ec3013', bands: [[a / 1.25 * 100, '#9ca3af'], [(b - a) / 1.25 * 100, '#22c55e'], [(1 - b) / 1.25 * 100, '#e6b45a'], [0.25 / 1.25 * 100, '#ec3013']], green: 1 }; })()) : null,
      allDone: !!allDone(), confirm: performance.now() - S.confirm < 2500, zoomed: !!S.view,
      flash: S.flash, say: S.say, react: S.react, done: S.done, gold: save.data.gold, uniform: !!save.flag('comicsUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })),
      hint: HINT ? { text: HINT.text, tool: HINT.tool, key: HINTKEY[HINT.tool] || '' } : null, demo: DM.on ? { cap: DM.cap, key: DM.key } : null, best: save.stat(SAVE.best, 0),
      walk: { prompt, toast: S.phase === 'walk' && S.toast ? S.toast : null, quest: S.phase === 'walk' ? (W.near && W.near.id === 'desk' ? 'SIT AT THE ART DESK TO START A DAY' : 'TALK TO BRAMBLE · OR SIT AT THE ART DESK AT THE BACK') : "BRAMBLE'S COMICS · DAY " + S.day, place: 'Home · Comics',
        dialog: ln ? { name: ln.name, role: ln.role, text: ln.text, step: D.i + 1, total: D.lines.length, choices: last && D.choices ? D.choices.map(c => ({ text: c.text, asked: c.asked, bye: c.bye })) : null, required: false } : null } }; }
  idlePage(); placeF(ben, { x: 0.5, z: 3.2 }, 0.2); setUniform(!!save.flag('comicsUniform'));
  frame();
  const api = { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; shotCache.k = ''; } },
    setTool, setBrush, pickLine, pickSfx, pickFace, setOpt, startSketch, sketchColor(k) { if (SKC[k]) { SK.col = k; tone(500, 0.04, 0.03); speak(k === 'white' ? 'eraser' : k); } }, sketchSize(n) { SK.size = n; tone(400 + n * 10, 0.04, 0.03); }, sketchUndo() { SK.strokes.pop(); skRedraw(); }, sketchClear() { SK.strokes = []; skRedraw(); }, sketchHang, sketchExit() { endSketch(); }, savePage, handIn, startDay, toIntro, toWalk, demoStart, demoStop, buyUpgrade, hud, fitPage() { S.view = null; }, setPaused(v) { PAUSE = !!v; },
    // ENGINE CONTRACT for Game HUD (walk mode)
    start() {}, talk, choose, closeDialog() { S.dlg = null; bram.userData.talking = false; }, nextLine, clearToast() { S.toast = ''; }, melee: wave, range: look, jump() { if (S.phase === 'walk') { ben.userData.hop = 1; tone(520, 0.05, 0.03); } }, meleeUp() {},
    useItem() { toast('No snacks near the comics. Bramble rule.', 2.5); }, closeWheel() {}, skipTime() {}, setHudPad(v) { W.hudPad = !!v; }, setStick(x, y) { W.stick.x = x; W.stick.y = y; },
    eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy(dx, dy) { W.camYaw -= dx * 0.008; W.camPitch = clamp(W.camPitch + dy * 0.005, 0.22, 1.25); W.dragT = S.t; }, zoomBy(k) { W.camDist = clamp(W.camDist * k, 3.2, 9); }, getCam() { return { dist: W.camDist, pitch: W.camPitch }; }, setCam(d, p) { W.camDist = clamp(d * 0.48, 3.2, 9); W.camPitch = clamp(p * 1.4, 0.22, 1.25); },
    mapData() { return { p: [W.x, W.z, W.face], b: [['ART DESK', 0, -4.5], ['SPINNER', 0, 0], ['COUNTER', -1.6, 4.75], ['SUPERFOX', -4.2, 3.15], ['IRON FOX', 4.2, 3.15], ['DOOR', 0, 6.1]], f: [[bram.position.x, bram.position.z]], e: [], q: [0, -4.2, 'ART DESK'] }; }, setMinimap() {}, toggleSound() { au(); S.muted = !S.muted; SND.setMuted(S.muted); return S.muted; }, cycleWeather() {},
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _scene: scene, _snd: SND, uiClick() { au(); SND.play('click'); }, _readPx(x, y) { renderer.render(scene, camera); const gl = renderer.getContext(), b = new Uint8Array(4), pr = renderer.getPixelRatio(); gl.readPixels(Math.round(x * pr), Math.round((CHh() - y) * pr), 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, b); return [...b]; }, _pick(x, y) { const r = renderer.domElement.getBoundingClientRect(); NDC.set((x - r.left) / CW() * 2 - 1, -((y - r.top) / CHh()) * 2 + 1); RC.setFromCamera(NDC, camera); return RC.intersectObjects(scene.children, true).slice(0, 4).map(h => { let o = h.object, path = []; while (o && path.length < 4) { path.push((o.type || '') + ':' + (o.geometry ? o.geometry.type : '') + ':' + (o.material && o.material.color ? o.material.color.getHexString() : '')); o = o.parent; } return h.distance.toFixed(2) + ' ' + path.join(' < ') + ' @' + h.point.toArray().map(v => v.toFixed(2)); }); }, _ff(sec) { for (let i = 0; i < sec * 30; i++) step(1 / 30); }, _state: () => S, _page: () => P, _job: () => JOB, _W: W, _cam: camera, _local2world: local2world, _scr(px, py) { const v = local2world(px, py).project(camera), r = renderer.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * CW(), r.top + (1 - v.y) / 2 * CHh()]; }, _force(b) { S.forceBook = b; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); renderer.dispose(); renderer.domElement.remove(); SND.destroy(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  return api;
}
