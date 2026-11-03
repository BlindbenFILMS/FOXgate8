// 8 GATES — FOXY PIES: THE SHIFT [foxyPies]. "Wood-fired · fox-run". The 2D Foxy Pies / ORBITAL PIE game (food games/pizza.html) rebuilt in 3D
// on the restaurant engine (Meru Burgers → Jidda Smoothie) + engine/restaurant-kit.js.
// Every pizza follows the 2D stages and scoring exactly: DOUGH (5 tosses: tap the moving mark) → SAUCE → CHEESE (press + drag to the crust line,
// 8 s each) → TOPPINGS (tap to place 10 of each; half-and-half tickets from the 3rd order) → BAKE (hold, let go in the ordered band)
// → SLICE (4 drags through the middle, no clock) → SERVE. Stage scores average into the customer's mood; streak ×0.15 like the 2D tips.
// A shift = one day of orders → wage + prices + tips (gold, engine/save.js) → employee of the day → uniform → upgrades → harder next day.
// Save keys pies.foxy.*, flag piesUniform.
// INTERCHANGEABLE INTERIOR: buildPizzeria(ctx) builds the room at an origin and FITS ANY FOOTPRINT (ctx.size = { w, d }, min 7.5 x 7.5 m),
// with or without its own walls (ctx.shell = false inside a world's walk-in building). It returns stations, a work spot, a keeper spot and
// collider boxes, so engine/shop-slot.js can drop it into any building in any world. createPizzaShift({ container, onState, opts }) runs stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../engine/textures.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, dinerUniform } from '../../engine/restaurant-kit.js';
import { createPiesAudio } from './pies-audio.js';

export const PIES = { name: 'FOXY PIES · THE SHIFT', room: 'foxyPies', label: 'FOXY PIES', tag: 'WOOD-FIRED · FOX-RUN', size: { w: 10, d: 9 } };
const SECTORS = 28, TOSSES = 5, STAGE_SECONDS = 8, R = 0.34;   // R: metres per 2D pizza unit (a 0.9 pie ≈ 61 cm across)
// ---------------- the 2D game's data (food games/pizza.html), unchanged ----------------
export const TOPPINGS = {
  pepperoni: { name: 'PEPPERONI', fill: '#c9331b', stroke: '#7d1e0f', r: 0.085, shape: 'disc' },
  mushroom: { name: 'MUSHROOM', fill: '#eae1d1', stroke: '#9a8b76', r: 0.082, shape: 'mush' },
  olive: { name: 'OLIVE', fill: '#332e2d', stroke: '#151313', r: 0.058, shape: 'ring' },
  pepper: { name: 'GREEN PEPPER', fill: '#4f9b45', stroke: '#2b5a25', r: 0.078, shape: 'cring' },
  onion: { name: 'ONION', fill: '#f0e7f0', stroke: '#b7a5bb', r: 0.082, shape: 'thinring' } };
const UNLOCK = ['pepperoni', 'mushroom', 'olive', 'pepper', 'onion'];
export const NAMES = ['NEBULA CLASSIC', 'COMET SPECIAL', 'METEOR MELT', 'SOLAR FLARE', 'DEEP SPACE DELUXE', 'STAR ROUTE PIE'];
const doneName = v => v < 28 ? 'PALE' : v < 46 ? 'LIGHT BAKE' : v < 64 ? 'GOLDEN' : v < 82 ? 'WELL FIRED' : 'CHARRED';
const n3 = v => Math.round(v * 1000) / 1000;
const rotPt = (p, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return { x: n3(p.x * c - p.y * s), y: n3(p.x * s + p.y * c) }; };
const pickTarget = meanR => { const a = Math.random() * Math.PI * 2, d = Math.max(0.12, meanR * (0.4 + Math.random() * 0.35)); return { x: n3(Math.cos(a) * d), y: n3(Math.sin(a) * d) }; };
const seeded = (count, fn) => Array.from({ length: count }, (_, i) => fn(i));
// customers: the 2D game's six, or a world's own townsfolk (opts.world = 'meru' → the Meru Burgers crowd), so the shop fits any world
export const CUSTOMER_SETS = {
  station: [{ name: 'KIT VEGA', short: 'KIT', torso: ['#1f3350', '#e6ecf4', '#16263c'] }, { name: 'RANGER ASH', short: 'ASH', fur: '#9a6f4a', furDark: '#6b4a2c', torso: ['#3f5d47', '#e6b45a', '#2b4232'], outfit: 'coat' },
    { name: 'CMDR. SABLE', short: 'SABLE', fur: '#3a3436', furDark: '#1c1a1b', torso: ['#e7edf4', '#c42d3c', '#6b7d93'], outfit: 'armor' }, { name: 'PIP OF DECK 9', short: 'PIP', fur: '#f0dcbe', furDark: '#c2a577', torso: ['#f2c53d', '#201e1d', '#a8792e'] },
    { name: 'THE QUARTERMASTER', short: 'THE QUARTERMASTER', fur: '#c9682a', furDark: '#8a4213', torso: ['#4a4a52', '#d7dde3', '#2a2a30'], outfit: 'coat' }, { name: 'NINE-TAILS NELL', short: 'NELL', fur: '#e6e4de', furDark: '#a8a6a0', torso: ['#a78bfa', '#ede9fe', '#5b21b6'], outfit: 'robe' }],
  meru: [{ name: 'KIA', torso: ['#38bdf8', '#e0f2fe', '#0369a1'] }, { name: 'PELL', torso: ['#1f2937', '#e6b45a', '#111827'] }, { name: 'OTTO', torso: ['#2f5d2a', '#e6b45a', '#1a3318'] },
    { name: 'MARLA', torso: ['#f472b6', '#fce7f3', '#9d174d'] }, { name: 'MICHAEL JAY', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'] }, { name: 'THE FISHERMAN', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] },
    { name: 'THE SAGE', torso: ['#a78bfa', '#ede9fe', '#5b21b6'], outfit: 'robe' }, { name: 'DOC BRAUN', torso: ['#f6f8fb', '#e2e8f0', '#94a3b8'], outfit: 'coat' }, { name: 'FLICK', torso: ['#c42d3c', '#f3f2f2', '#7a1d2a'], outfit: 'coat' }] };
export const UPGRADES = [
  { id: 'stone', name: 'PIZZA STONE', cost: 40, line: 'The ordered bake band is 30% wider.' },
  { id: 'ladle', name: 'BIG LADLE', cost: 30, line: 'Sauce spreads in wider strokes.' },
  { id: 'grater', name: 'BOX GRATER', cost: 30, line: 'Cheese falls in wider strokes.' },
  { id: 'wheel', name: 'GUIDE WHEEL', cost: 45, line: 'A line through the middle shows where to cut.' },
  { id: 'radio', name: 'ACCORDION RADIO', cost: 60, line: 'Tips +25%.' }];
const SAVE = { day: 'pies.foxy.day', best: 'pies.foxy.best', upg: 'pies.foxy.upg.', stars: 'pies.foxy.stars', made: 'pies.foxy.made' };
const MOOD = [[90, 'DELIGHTED', 'THRILLED!', '#22c55e', 'excited', 3], [80, 'HAPPY', 'HAPPY', '#7dd3fc', 'happy', 3], [70, 'NEUTRAL', 'NEUTRAL', '#e6b45a', 'neutral', 2], [60, 'UNHAPPY', 'UNHAPPY', '#ff9a8a', 'sad', 1], [50, 'UPSET', 'UPSET', '#f27021', 'sad', 1], [-1, 'INSULTED', 'INSULTED!', '#ec3013', 'angry', 0]];
const moodOf = avg => MOOD.find(m => avg >= m[0]);
const REACT_LINES = { THRILLED: ['Best pie on the whole route!', 'The deck is going to hear about this!', 'Wow. Just wow.'], HAPPY: ['Smells perfect, thank you!', 'Just how I like it.', 'Great pie!'], NEUTRAL: ['It is fine. Not quite what I asked for.', 'Okay. Thanks.'], UNHAPPY: ['This is not what I ordered...', 'I waited for this?'], UPSET: ['Did you even read the ticket?', 'Hmph.'], INSULTED: ['That is NOT my pizza!', 'Are you even listening?'] };
const ORDER_LINES = ['Something hot, please!', 'Big day. Feed me!', 'Make it quick?', 'Smells like the oven is on!', 'The usual!'];

// ---------------- topping art (3D, sized from the 2D radii) ----------------
export function toppingMesh(T3, toon, key, outline, seed = Math.random()) {
  const t = TOPPINGS[key], r = t.r * R * (0.92 + seed * 0.16), g = new T3.Group(), ol = (m, w = 0.0025, rad) => { if (outline) outline(m, w, rad); return m; };
  const add = (geo, col, x = 0, y = 0, z = 0, extra) => { const ms = new T3.Mesh(geo, toon(col, extra)); ms.position.set(x, y, z); ms.castShadow = true; g.add(ms); return ms; };
  if (t.shape === 'disc') {   // PEPPERONI: a cupped slice (edges curl up in the oven), darker rim, little fat spots
    const prof = [new T3.Vector2(0, 0.0035), new T3.Vector2(r * 0.5, 0.0042), new T3.Vector2(r * 0.85, 0.006), new T3.Vector2(r, 0.0085), new T3.Vector2(r * 1.02, 0.0055), new T3.Vector2(r * 0.97, 0.0005), new T3.Vector2(0, 0)];
    ol(add(new T3.LatheGeometry(prof.reverse(), 22), '#c3301b'), 0.0025, r);
    const rim = add(new T3.TorusGeometry(r * 0.96, 0.0028, 4, 24), '#8a1f10', 0, 0.0082, 0); rim.rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) { const a = i * 2.39 + seed * 6, d = r * (0.18 + (i % 3) * 0.22); const sp = add(new T3.SphereGeometry(r * (0.07 + (i % 2) * 0.04), 6, 4), i % 3 ? '#f0c9a8' : '#e9a07a', Math.cos(a) * d, 0.0052, Math.sin(a) * d); sp.scale.y = 0.25; }
  } else if (t.shape === 'mush') {   // MUSHROOM: a sliced cap + stem, tan rim, dark gills
    const shp = (k) => { const sh = new T3.Shape(); sh.moveTo(-r * k, 0.1 * r); sh.absarc(0, 0.1 * r, r * k, Math.PI, 0, true); sh.lineTo(0.3 * r * k, 0.1 * r); sh.lineTo(0.24 * r * k, -0.86 * r); sh.quadraticCurveTo(0, -1.1 * r, -0.24 * r * k, -0.86 * r); sh.lineTo(-0.3 * r * k, 0.1 * r); sh.lineTo(-r * k, 0.1 * r); return sh; };
    const geo = new T3.ExtrudeGeometry(shp(1), { depth: 0.006, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.0015, bevelSegments: 1, curveSegments: 10 }); geo.rotateX(-Math.PI / 2); ol(add(geo, '#e9dcc4', 0, 0.0015, 0), 0.002);
    const cap = new T3.Shape(); cap.moveTo(-r, 0.1 * r); cap.absarc(0, 0.1 * r, r, Math.PI, 0, true); cap.absarc(0, 0.1 * r, r * 0.8, 0, Math.PI, false); const cg = new T3.ShapeGeometry(cap, 10); cg.rotateX(-Math.PI / 2); add(cg, '#a8875e', 0, 0.0094, 0);
    for (const x of [-0.42, 0, 0.42]) { const gl = add(new T3.BoxGeometry(0.0016, 0.0008, r * 0.42), '#7a6046', x * r, 0.0094, -r * 0.35); gl.rotation.y = x * 0.5; }
  } else if (t.shape === 'ring') {   // OLIVE: a thick black ring with a soft sheen
    const m = ol(add(new T3.TorusGeometry(r * 0.7, r * 0.3, 8, 22), '#2b2326'), 0.002); m.rotation.x = -Math.PI / 2; m.scale.z = 0.55; m.position.y = 0.006;
    const hi = add(new T3.TorusGeometry(r * 0.7, r * 0.09, 4, 12, Math.PI * 0.6), '#7a6e72', 0, 0.0105, 0); hi.rotation.x = -Math.PI / 2; hi.rotation.z = seed * 6;
  } else if (t.shape === 'cring') {   // GREEN PEPPER: a crescent strip with a pale inner wall
    const arc = Math.PI * 1.45, rot = seed * 6; const o = ol(add(new T3.TorusGeometry(r * 0.82, r * 0.18, 5, 22, arc), '#3f8e3a'), 0.002); o.rotation.set(-Math.PI / 2, 0, rot); o.scale.z = 0.45; o.position.y = 0.005;
    const inn = add(new T3.TorusGeometry(r * 0.68, r * 0.06, 4, 22, arc), '#8fd17a', 0, 0.0075, 0); inn.rotation.set(-Math.PI / 2, 0, rot);
  } else {   // ONION: two thin translucent rings, purple skin edge
    const rot = seed * 6; for (const [k, col] of [[1, '#b07ab4'], [0.74, '#f6ecf4']]) { const m = add(new T3.TorusGeometry(r * 0.9 * k, r * 0.1, 4, 26, Math.PI * (1.5 + k * 0.2)), col, 0, 0.004 + k * 0.002, 0, { transparent: true, opacity: 0.92 }); m.rotation.set(-Math.PI / 2, 0, rot + k); m.scale.z = 0.6; }
  }
  g.rotation.x = (seed - 0.5) * 0.12; return g; }

// ---------------- the pizzeria interior: fits any footprint ----------------
// ctx: { THREE, M, toon, canvasTex, scene, grad, addOutline, origin:{x,z}, rotY, size:{w,d}, shell, parent }
// local frame: origin = room centre, +z = toward the front door, kitchen + oven on the back wall (-z).
export function buildPizzeria(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, origin = { x: 0, z: 0 }, rotY = 0, shell = true } = ctx;
  const W = Math.max(7.5, (ctx.size && ctx.size.w) || PIES.size.w), D = Math.max(7.5, (ctx.size && ctx.size.d) || PIES.size.d), H = 3.8;
  const root = new T3.Group(); root.position.set(origin.x, ctx.y || 0, origin.z); root.rotation.y = rotY; (ctx.parent || scene).add(root);
  const red = toon('#b8321c'), cream = toon('#f4ead2'), green = toon('#3f7a3a'), ink = toon('#201e1d'), wood = toon('#9a6a3e'), woodD = toon('#6b4426'), marble = toon('#eeeae2'), brick = toon('#b5583a'), chrome = toon('#cfd6dc');
  const cut = [], front = [], booths = [], blocks = [], K = { root, W, D, H, cut, front, booths, blocks };
  const solid = (x0, x1, z0, z1, h, mat, ol = 0.025, y0 = 0) => { blocks.push([x0, x1, z0, z1]); return M(new T3.BoxGeometry(x1 - x0, h, z1 - z0), mat, (x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2, root, ol); };
  if (shell) {
    const floorT = CTX(256, 256, c => { c.fillStyle = '#efe4cf'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#b8321c'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if ((x + y) % 2) c.fillRect(x * 32, y * 32, 32, 32); c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 2; for (let i = 0; i <= 256; i += 32) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, 256); c.moveTo(0, i); c.lineTo(256, i); c.stroke(); } });
    floorT.wrapS = floorT.wrapT = T3.RepeatWrapping; floorT.repeat.set(W / 2.4, D / 2.4);
    const fl = new T3.Mesh(new T3.PlaneGeometry(W, D), new T3.MeshToonMaterial({ map: floorT, gradientMap: ctx.grad })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; root.add(fl);
    const wallT = CTX(256, 256, c => { c.fillStyle = '#f4ead2'; c.fillRect(0, 0, 256, 256); c.fillStyle = '#e6d8b8'; for (let y = 0; y < 128; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < 256; x += 32) c.fillRect(x + 1, y + 1, 30, 14); c.fillStyle = '#3f7a3a'; c.fillRect(0, 150, 256, 106); c.fillStyle = '#2f5d2a'; for (let i = 0; i < 256; i += 32) c.fillRect(i, 150, 3, 106); c.fillStyle = '#b8321c'; c.fillRect(0, 138, 256, 12); c.fillStyle = '#f4ead2'; c.fillRect(0, 134, 256, 4); });
    wallT.wrapS = T3.RepeatWrapping; wallT.repeat.set(W / 3, 1); const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: ctx.grad });
    for (const [x, z, w, ry] of [[0, -D / 2, W, 0], [-W / 2, 0, D, Math.PI / 2], [W / 2, 0, D, -Math.PI / 2]]) { const m = new T3.Mesh(new T3.PlaneGeometry(w, H), wallM); m.position.set(x, H / 2, z); m.rotation.y = ry; root.add(m); if (!ry) cut.push(m); }
    { const fw = new T3.Mesh(new T3.PlaneGeometry(W, H), wallM); fw.position.set(0, H / 2, D / 2); fw.rotation.y = Math.PI; root.add(fw); front.push(fw); }
    cut.push(M(new T3.BoxGeometry(W, 0.2, D), toon('#efe4cf'), 0, H + 0.1, 0, root, 0));
    { const fc = root.children.length, streetT = CTX(256, 128, c => { const gr = c.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#9fc9e8'); gr.addColorStop(0.6, '#e8f2f8'); gr.addColorStop(0.61, '#b9b2a6'); gr.addColorStop(1, '#8f877a'); c.fillStyle = gr; c.fillRect(0, 0, 256, 128); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(30, 10, 6, 60); c.fillRect(46, 10, 3, 60); });
      for (const x of [-W * 0.27, W * 0.27]) { const win = new T3.Mesh(new T3.PlaneGeometry(W * 0.3, 1.8), new T3.MeshBasicMaterial({ map: streetT })); win.position.set(x, 1.8, D / 2 - 0.02); win.rotation.y = Math.PI; root.add(win); M(new T3.BoxGeometry(W * 0.3 + 0.16, 0.12, 0.14), green, x, 2.74, D / 2 - 0.06, root, 0.01); M(new T3.BoxGeometry(W * 0.3 + 0.16, 0.12, 0.14), green, x, 0.86, D / 2 - 0.06, root, 0.01);
        const lt = CTX(256, 64, c => { c.clearRect(0, 0, 256, 64); c.fillStyle = '#f2c53d'; c.font = 'italic 900 34px Archivo, Arial'; c.textAlign = 'center'; c.fillText('FOXY PIES', 128, 44); }); const ld = new T3.Mesh(new T3.PlaneGeometry(1.6, 0.4), new T3.MeshBasicMaterial({ map: lt, transparent: true })); ld.position.set(x, 2.25, D / 2 - 0.04); ld.rotation.y = Math.PI; root.add(ld); }
      const door = new T3.Mesh(new T3.PlaneGeometry(1.5, 2.5), new T3.MeshBasicMaterial({ color: 0xe8f2f8 })); door.position.set(0, 1.25, D / 2 - 0.02); door.rotation.y = Math.PI; root.add(door); M(new T3.BoxGeometry(1.7, 0.14, 0.14), green, 0, 2.56, D / 2 - 0.06, root, 0.01);
      front.push(...root.children.slice(fc)); }
  }
  // ---- kitchen line: the wood-fired oven (back wall, left), the prep counter in front of it, the service pass for customers ----
  const back = -D / 2, KZ = back + 2.35, span = Math.min(W - 1.8, 6.2), T = 0.98; K.z = KZ; K.top = T;
  // OVEN: brick dome with an open mouth facing the cook; fire at the back; the pizza sits on its hearth while it bakes
  const OX = clamp(-span * 0.26, -W / 2 + 1.6, 0), OZ = back + 1.0; K.oven = { x: OX, z: OZ, y: T, mouth: { x: OX, z: OZ + 0.62 } };
  { solid(OX - 1.15, OX + 1.15, back + 0.05, OZ + 0.75, T - 0.02, brick, 0.03);
    M(new T3.BoxGeometry(2.36, 0.06, 1.0), toon('#8a3a22'), OX, T - 0.01, OZ + 0.2, root, 0.012);
    // the dome in two halves: the FRONT half (with its dark mouth) hides while the pie bakes, so the camera looks straight onto the hearth
    const domeIn = toon('#7a3a26', { side: T3.BackSide }), domeOut = toon('#b5583a');
    const backH = new T3.Group(), frontH = new T3.Group(); backH.position.set(OX, T, OZ); frontH.position.set(OX, T, OZ); root.add(backH, frontH);
    for (const [g, p0] of [[backH, Math.PI], [frontH, 0]]) { const o = M(new T3.SphereGeometry(1.0, 26, 12, p0, Math.PI, 0, Math.PI / 2), domeOut, 0, 0, 0, g, 0.03, 1.0); o.scale.y = 0.8; const i = new T3.Mesh(new T3.SphereGeometry(0.96, 26, 12, p0, Math.PI, 0, Math.PI / 2), domeIn); i.scale.y = 0.78; g.add(i); }
    { const mouth = new T3.Mesh(new T3.CircleGeometry(0.48, 20, 0, Math.PI), new T3.MeshBasicMaterial({ color: 0x1a0d08 })); mouth.position.set(0, 0.005, 0.975); mouth.scale.y = 0.95; frontH.add(mouth); const glow = new T3.Mesh(new T3.CircleGeometry(0.36, 16, 0, Math.PI), new T3.MeshBasicMaterial({ color: 0xff7a2a, transparent: true, opacity: 0.55 })); glow.position.set(0, 0.006, 0.98); frontH.add(glow); K.mouthGlow = glow;
      const arch = M(new T3.TorusGeometry(0.5, 0.07, 6, 20, Math.PI), toon('#e6d8b8'), 0, 0.01, 0.99, frontH, 0.012); arch.scale.y = 0.95; }
    K.domeFront = frontH;
    const hearth = M(new T3.CylinderGeometry(0.9, 0.9, 0.02, 30), toon('#3a2a24'), OX, T + 0.01, OZ, root, 0); K.ovenHearth = hearth;
    M(new T3.BoxGeometry(0.34, 1.6, 0.34), brick, OX + 0.2, T + 0.75 + 0.8, OZ - 0.45, root, 0.02); M(new T3.BoxGeometry(0.42, 0.08, 0.42), ink, OX + 0.2, T + 2.4, OZ - 0.45, root, 0);
    K.flames = []; for (let i = 0; i < 6; i++) { const f = M(new T3.ConeGeometry(0.09 + (i % 2) * 0.03, 0.34 + (i % 3) * 0.1, 7), toon(['#f5b342', '#ec3013', '#f27021'][i % 3], { emissive: new T3.Color(['#f5b342', '#ec3013', '#f27021'][i % 3]), emissiveIntensity: 1.6 }), OX - 0.4 + i * 0.16, T + 0.18, OZ - 0.6 + Math.abs(i - 2.5) * 0.04, root, 0); f.castShadow = false; K.flames.push(f); }
    for (let i = 0; i < 5; i++) { const lg = M(new T3.CylinderGeometry(0.05, 0.05, 0.42, 7), woodD, OX - 0.32 + i * 0.16, T + 0.06, OZ - 0.68, root, 0.006); lg.rotation.z = Math.PI / 2; lg.rotation.y = 0.3 * (i - 2); }
    for (let i = 0; i < 9; i++) { const lg = M(new T3.CylinderGeometry(0.06, 0.06, 0.5, 7), wood, OX + 1.3 + (i % 3) * 0.13, 0.08 + Math.floor(i / 3) * 0.12, back + 0.45, root, 0.006); lg.rotation.x = Math.PI / 2; }
    const sg = CTX(512, 96, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#f2c53d'; c.font = '900 52px Archivo, Arial'; c.textAlign = 'center'; c.fillText('WOOD-FIRED', 256, 66); }); const sp = new T3.Mesh(new T3.PlaneGeometry(1.4, 0.26), new T3.MeshBasicMaterial({ map: sg })); sp.position.set(0, 0.86, 0.62); sp.rotation.x = -0.5; K.domeFront.add(sp); }
  // PREP COUNTER (marble top) with the pizza board, the sauce pot, cheese bowl and five topping tubs on its back edge
  const PX = clamp(span * 0.12, OX + 1.6, W / 2 - 1.6); K.board = { x: PX, z: KZ };
  solid(-span / 2, span / 2, KZ - 0.55, KZ + 0.55, T - 0.04, green, 0.03); M(new T3.BoxGeometry(span + 0.1, 0.06, 1.18), marble, 0, T - 0.01, KZ, root, 0.015);
  for (let i = 0; i < Math.floor(span / 0.5); i++) M(new T3.BoxGeometry(0.03, 0.8, 0.02), toon('#2f5d2a'), -span / 2 + 0.25 + i * 0.5, 0.42, KZ + 0.56, root, 0);
  M(new T3.CylinderGeometry(0.4, 0.4, 0.03, 32), toon('#c99a62'), PX, T + 0.015, KZ, root, 0.008, 0.4); { const hd = M(new T3.BoxGeometry(0.1, 0.02, 0.22), toon('#c99a62'), PX + 0.46, T + 0.012, KZ, root, 0.005); hd.rotation.y = 0; }
  { const fl = new T3.Mesh(new T3.CircleGeometry(0.5, 24), new T3.MeshBasicMaterial({ color: 0xfbf6e8, transparent: true, opacity: 0.55, depthWrite: false })); fl.rotation.x = -Math.PI / 2; fl.position.set(PX, T + 0.032, KZ); root.add(fl); K.flour = fl; }
  // SAUCE POT (steel, a ring of tomato sauce, a spoon resting in it) and the CHEESE BOWL (a heaped mound of shreds)
  K.sauce = { x: PX - 0.82, z: KZ - 0.3 }; M(new T3.CylinderGeometry(0.15, 0.13, 0.18, 20), chrome, K.sauce.x, T + 0.09, K.sauce.z, root, 0.008, 0.15); M(new T3.TorusGeometry(0.15, 0.012, 6, 24), toon('#aeb6bd'), K.sauce.x, T + 0.18, K.sauce.z, root, 0).rotation.x = Math.PI / 2;
  M(new T3.CylinderGeometry(0.14, 0.14, 0.01, 20), toon('#b8321c'), K.sauce.x, T + 0.172, K.sauce.z, root, 0); for (let i = 0; i < 5; i++) { const b = M(new T3.SphereGeometry(0.018, 6, 4), toon('#d9482c'), K.sauce.x + Math.cos(i * 1.3) * 0.07, T + 0.177, K.sauce.z + Math.sin(i * 1.3) * 0.07, root, 0); b.scale.y = 0.3; }
  for (const sx of [-1, 1]) M(new T3.BoxGeometry(0.05, 0.02, 0.02), toon('#aeb6bd'), K.sauce.x + sx * 0.165, T + 0.15, K.sauce.z, root, 0.004);
  { const sp = M(new T3.CylinderGeometry(0.008, 0.008, 0.3, 6), chrome, K.sauce.x + 0.05, T + 0.26, K.sauce.z + 0.04, root, 0.003); sp.rotation.z = -0.5; }
  K.cheese = { x: PX - 0.82, z: KZ + 0.18 }; M(new T3.CylinderGeometry(0.16, 0.11, 0.1, 20), cream, K.cheese.x, T + 0.05, K.cheese.z, root, 0.008, 0.16); M(new T3.TorusGeometry(0.16, 0.01, 6, 24), toon('#3f7a3a'), K.cheese.x, T + 0.1, K.cheese.z, root, 0).rotation.x = Math.PI / 2;
  { const mound = M(new T3.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#f2dc8e'), K.cheese.x, T + 0.09, K.cheese.z, root, 0.006, 0.14); mound.scale.y = 0.5; }
  for (let i = 0; i < 22; i++) { const a = i * 2.4, d = (i % 4) * 0.032, m = M(new T3.BoxGeometry(0.05, 0.007, 0.011), toon(['#e8d08a', '#f4e3a8', '#fbeec0'][i % 3]), K.cheese.x + Math.cos(a) * d, T + 0.16 - d * 0.5, K.cheese.z + Math.sin(a) * d, root, 0); m.rotation.set(i * 0.3, i, 0); }
  // TOPPINGS TABLE: a wooden rail of five steel trays along the far edge of the prep counter, right in front of the cook, each heaped and labelled
  const TZ = KZ + 0.49, TW = 0.21; K.toppingsTable = { x: PX, z: TZ };
  M(new T3.BoxGeometry(TW * 5 + 0.08, 0.03, 0.19), wood, PX, T + 0.015, TZ, root, 0.006);
  { const st = CTX(512, 64, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 512, 64); c.fillStyle = '#f2c53d'; c.font = '900 40px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('TOPPINGS TABLE', 256, 34); });
    const sp = new T3.Mesh(new T3.PlaneGeometry(TW * 5, TW * 5 / 8), new T3.MeshBasicMaterial({ map: st })); sp.position.set(PX, T + 0.1, TZ + 0.1); sp.rotation.set(-0.35, Math.PI, 0); root.add(sp); }
  K.tubs = {}; UNLOCK.forEach((k, i) => { const x = PX + (2 - i) * TW, z = TZ;
    M(new T3.BoxGeometry(TW - 0.02, 0.05, 0.16), chrome, x, T + 0.055, z, root, 0.005); { const inr = new T3.Mesh(new T3.PlaneGeometry(TW - 0.045, 0.135), toon('#5a646d')); inr.rotation.x = -Math.PI / 2; inr.position.set(x, T + 0.081, z); root.add(inr); }
    const pile = new T3.Group(); pile.position.set(x, T + 0.082, z); root.add(pile);
    for (let j = 0; j < 9; j++) { const tp = toppingMesh(T3, toon, k, null, (j * 0.37) % 1); tp.scale.setScalar(0.8); tp.position.set(((j % 3) - 1) * 0.05, Math.floor(j / 3) * 0.006 + (j % 2) * 0.003, ((Math.floor(j / 3) % 3) - 1) * 0.04); tp.rotation.y = j * 1.7; pile.add(tp); }
    const lt = CTX(256, 64, c => { c.fillStyle = TOPPINGS[k].fill; c.fillRect(0, 0, 256, 64); c.fillStyle = k === 'mushroom' || k === 'onion' ? '#201e1d' : '#ffffff'; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(TOPPINGS[k].name.split(' ').pop(), 128, 34); });
    const lb = new T3.Mesh(new T3.PlaneGeometry(TW - 0.03, 0.045), new T3.MeshBasicMaterial({ map: lt })); lb.position.set(x, T + 0.045, z - 0.082); lb.rotation.y = Math.PI; root.add(lb);
    K.tubs[k] = { x, z, pile }; });
  // PEEL rack, flour sacks, tomato cans
  for (let i = 0; i < 2; i++) { const pl = M(new T3.BoxGeometry(0.42, 0.02, 1.4), wood, OX - 1.35 - i * 0.12, 0.95, back + 0.15, root, 0.006); pl.rotation.x = -1.35; }
  for (let i = 0; i < 3; i++) { const s = M(new T3.CylinderGeometry(0.2, 0.24, 0.55, 10), toon('#efe4cf'), W / 2 - 0.5 - (i % 2) * 0.42, 0.28 + Math.floor(i / 2) * 0.5, back + 0.45 + (i % 2) * 0.1, root, 0.01); s.scale.z = 0.7; }
  cut.push(M(new T3.BoxGeometry(Math.min(3, W / 2 - 0.4), 0.05, 0.3), woodD, W / 4, 1.95, back + 0.18, root, 0.006)); for (let i = 0; i < 8; i++) { const cn = M(new T3.CylinderGeometry(0.07, 0.07, 0.16, 10), toon(i % 2 ? '#b8321c' : '#f2c53d'), W / 4 - 1.3 + i * 0.36, 2.06, back + 0.18, root, 0.005); cut.push(cn); }
  // MENU board (back wall, right) from the 2D order names
  { const menuT = CTX(1024, 512, c => { c.fillStyle = '#23302a'; c.fillRect(0, 0, 1024, 512); c.fillStyle = '#f2c53d'; c.font = 'italic 900 80px Archivo, Arial'; c.fillText('FOXY PIES', 40, 96); c.fillStyle = '#f7f6f2'; c.font = '700 34px Archivo, Arial'; NAMES.forEach((nm, i) => c.fillText(nm, 40 + (i % 2) * 500, 180 + Math.floor(i / 2) * 70)); c.fillStyle = '#9fd18c'; c.font = '700 30px Archivo, Arial'; c.fillText('PERSONAL · REGULAR · FAMILY   ·   HALF + HALF', 40, 460); });
    const mw = Math.min(3.6, W / 2 - 0.6), mb = new T3.Mesh(new T3.PlaneGeometry(mw, mw / 2), new T3.MeshBasicMaterial({ map: menuT })); mb.position.set(W / 4, 2.95, back + 0.06); root.add(mb); cut.push(mb, M(new T3.BoxGeometry(mw + 0.2, mw / 2 + 0.2, 0.05), woodD, W / 4, 2.95, back + 0.02, root, 0.01)); }
  // SERVICE PASS: a counter between kitchen and dining room; boxes, the register, three customer spots
  const PZ = KZ + 1.45; K.pass = { z: PZ, y: 1.1 };
  solid(-span / 2, span / 2, PZ - 0.25, PZ + 0.25, 1.05, red, 0.03); M(new T3.BoxGeometry(span + 0.12, 0.06, 0.62), wood, 0, 1.08, PZ, root, 0.012);
  K.box = { x: -span / 2 + 0.55, z: PZ }; for (let i = 0; i < 5; i++) M(new T3.BoxGeometry(0.62, 0.05, 0.62), toon('#e8d6ac'), K.box.x, 1.135 + i * 0.052, PZ, root, i === 4 ? 0.006 : 0);
  K.register = { x: span / 2 - 0.45, z: PZ }; M(new T3.BoxGeometry(0.42, 0.28, 0.34), ink, K.register.x, 1.25, PZ, root, 0.01); M(new T3.BoxGeometry(0.36, 0.12, 0.04), toon('#3f7a3a'), K.register.x, 1.42, PZ - 0.16, root, 0);
  K.serve = { x: 0.2, z: PZ }; K.spots = [0.2, -1.5, 1.9].map((x, i) => ({ x: clamp(x, -span / 2 + 0.4, span / 2 - 0.4), z: PZ + 0.9 + (i ? 0.5 : 0) }));
  // the cook's place and the keeper's place, for a world that hosts the shop
  K.work = { x: PX, z: KZ - 0.85, face: 0 }; K.keeper = { x: OX + 1.25, z: OZ + 0.15, face: 0.6 }; K.door = { x: 0, z: D / 2 };
  // DINING: tables with checked cloths along the front, string lights, hanging lamps, a FOXY PIES neon on the side wall
  const clothT = CTX(64, 64, c => { for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { c.fillStyle = (x + y) % 2 ? '#fbf6ea' : '#b8321c'; c.fillRect(x * 16, y * 16, 16, 16); } }), clothM = new T3.MeshToonMaterial({ map: clothT, gradientMap: ctx.grad });
  const tz = Math.min(D / 2 - 1.1, PZ + 2.3), tables = W >= 9 ? [-W / 2 + 1.2, W / 2 - 1.2] : [W / 2 - 1.1]; K.seats = [];
  for (const x of tables) { const bc = root.children.length; M(new T3.CylinderGeometry(0.5, 0.5, 0.06, 20), clothM, x, 0.78, tz, root, 0.01, 0.5); M(new T3.CylinderGeometry(0.05, 0.08, 0.76, 8), ink, x, 0.38, tz, root, 0); blocks.push([x - 0.5, x + 0.5, tz - 0.5, tz + 0.5]);
    for (const sx of [-0.85, 0.85]) { M(new T3.BoxGeometry(0.42, 0.05, 0.42), wood, x + sx, 0.46, tz, root, 0.008); M(new T3.BoxGeometry(0.05, 0.5, 0.42), wood, x + sx * 1.24, 0.72, tz, root, 0.006); for (const lx of [-0.17, 0.17]) for (const lz of [-0.17, 0.17]) M(new T3.BoxGeometry(0.04, 0.44, 0.04), woodD, x + sx + lx, 0.22, tz + lz, root, 0); K.seats.push({ x: x + sx, z: tz, face: sx < 0 ? Math.PI / 2 : -Math.PI / 2 }); }
    { const bx = M(new T3.BoxGeometry(0.36, 0.04, 0.36), toon('#e8d6ac'), x, 0.83, tz, root, 0.004); bx.rotation.y = 0.4; } booths.push(...root.children.slice(bc)); }
  K.lamps = []; for (const x of [-span / 3, span / 3]) { cut.push(M(new T3.CylinderGeometry(0.01, 0.01, 1.0, 4), ink, x, H - 0.5, KZ + 0.1, root, 0)); const sh = M(new T3.ConeGeometry(0.28, 0.28, 14, 1, true), toon('#3f7a3a', { side: T3.DoubleSide }), x, H - 1.1, KZ + 0.1, root, 0.01); K.lamps.push(sh); cut.push(sh); }
  { const bulbs = []; for (let i = 0; i < 14; i++) { const x = -W / 2 + 0.4 + i * (W - 0.8) / 13, y = H - 0.25 - Math.sin(i / 13 * Math.PI) * 0.35; const b = M(new T3.SphereGeometry(0.04, 6, 4), toon(['#f5b342', '#ec3013', '#9fd18c'][i % 3], { emissive: new T3.Color(['#f5b342', '#ec3013', '#9fd18c'][i % 3]), emissiveIntensity: 1.2 }), x, y, D / 2 - 1.6, root, 0); b.castShadow = false; bulbs.push(b); } cut.push(...bulbs); }
  { const neonT = CTX(512, 128, c => { c.clearRect(0, 0, 512, 128); c.font = 'italic 900 72px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ff6a5a'; c.shadowBlur = 24; c.strokeStyle = '#ff8a7a'; c.lineWidth = 8; c.strokeText('FOXY PIES', 256, 66); c.fillStyle = '#fff'; c.fillText('FOXY PIES', 256, 66); });
    const nm = new T3.Mesh(new T3.PlaneGeometry(2.8, 0.7), new T3.MeshBasicMaterial({ map: neonT, transparent: true, depthWrite: false })); nm.position.set(-W / 2 + 0.06, 2.9, PZ + 0.6); nm.rotation.y = Math.PI / 2; root.add(nm); }
  { const p = new T3.Group(); p.position.set(W / 2 - 0.5, 0, D / 2 - 0.55); root.add(p); M(new T3.CylinderGeometry(0.26, 0.2, 0.42, 12), toon('#b5583a'), 0, 0.21, 0, p, 0.01); for (let i = 0; i < 7; i++) M(new T3.SphereGeometry(0.2, 8, 6), toon(i % 2 ? '#3f7a3a' : '#5a9a4a'), Math.cos(i) * 0.14, 0.62 + (i % 3) * 0.14, Math.sin(i) * 0.14, p, 0.006); booths.push(p); }
  cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K; }

// ---------------- the stand-alone game ----------------
export async function createPizzaShift({ container, onState = () => {}, opts = {} }) {
  const ST = createStage(container, { bg: '#efe4cf' }), { CW, CHh, renderer, scene, camera, grad, glowTex, V3, toon, addOutline, M, kit, audio, tone, puff, smokeS } = ST;
  const K = buildPizzeria({ THREE, M, toon, canvasTex, scene, grad, addOutline, size: opts.size }), T = K.top, B = K.board;
  const SND = createPiesAudio(audio), SX = (n, o) => SND.sfx(n, o), buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  const wake = () => { audio.init && audio.init(); if (audio.wind) audio.wind.gain.value = 0; if (audio.muted) return; SND.ambience(true); SND.oven(true, 0.3); };   // the village wind loop is for outdoors: silence it in here
  const CUST = CUSTOMER_SETS[opts.world] || CUSTOMER_SETS.station, FORGIVE = opts.forgiveness || 1;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffe0b0, transparent: true, depthWrite: false, opacity: 0.55, blending: THREE.AdditiveBlending })); s.position.copy(l.position).applyMatrix4(K.root.matrixWorld).add(V3(0, -0.25, 0)); s.scale.setScalar(1.3); scene.add(s); return s; });
  const ovenGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a3a, transparent: true, depthWrite: false, opacity: 0.7, blending: THREE.AdditiveBlending })); ovenGlow.position.set(K.oven.x, T + 0.3, K.oven.z - 0.55); ovenGlow.scale.setScalar(1.1); ovenGlow.material.depthTest = true; scene.add(ovenGlow);
  const ovenLight = new THREE.PointLight(0xff8a3a, 2.2, 4, 1.6); ovenLight.position.set(K.oven.x, T + 0.4, K.oven.z + 0.2); scene.add(ovenLight);

  // ---------- cast: Ben in the Foxy Pies uniform, the customers ----------
  const ben = kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#b8321c'], crest: '', gear: 'none', mood: 'happy' }), BP = ben.userData.P; if (BP.sword) BP.sword.visible = false; if (BP.gun) BP.gun.visible = false;
  const BEN_AT = V3(-0.9, 0, K.pass.z + 1.5); ben.position.copy(BEN_AT); ben.rotation.y = 0.3; scene.add(ben);
  const drawSlice = (g, s) => { g.save(); g.scale(s, s); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#e9c98a'; g.beginPath(); g.moveTo(-70, -50); g.quadraticCurveTo(0, -78, 70, -50); g.lineTo(0, 82); g.closePath(); g.fill(); st();
    g.fillStyle = '#f2c53d'; g.beginPath(); g.moveTo(-58, -40); g.quadraticCurveTo(0, -62, 58, -40); g.lineTo(0, 66); g.closePath(); g.fill();
    g.fillStyle = '#c9331b'; for (const [x, y] of [[-24, -24], [20, -20], [0, 16]]) { g.beginPath(); g.arc(x, y, 12, 0, 7); g.fill(); st(); } g.restore(); };
  const uniform = { parts: [] }; {
    const print = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.save(); g.translate(128, 92); drawSlice(g, 1.05); g.restore();
      g.save(); g.translate(128, 212); g.rotate(-0.06); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#201e1d'; g.beginPath(); g.moveTo(-122, -24); g.lineTo(126, -30); g.lineTo(116, 34); g.lineTo(-130, 30); g.closePath(); g.fill(); g.fillStyle = '#3f7a3a'; g.beginPath(); g.moveTo(-114, -18); g.lineTo(118, -24); g.lineTo(110, 26); g.lineTo(-121, 23); g.closePath(); g.fill();
        g.font = 'italic 900 44px Archivo, "Arial Black", Arial, sans-serif'; g.lineJoin = 'round'; g.lineWidth = 12; g.strokeStyle = '#201e1d'; g.strokeText('FOXY PIES', 0, 2); g.fillStyle = '#f2c53d'; g.fillText('FOXY PIES', 0, 2); g.restore(); });
    const U = dinerUniform(ST, ben, { print, printY: 1.13, printSize: 0.52, stripe: '#3f7a3a', towelCol: '#b8321c' });
    // an old-school Italian chef's toque instead of the paper diner hat: a pleated white band and a tall puffed crown
    U.hat.visible = false; const hs = BP.head.scale.x || 1, toque = new THREE.Group(); toque.position.set(0, BP.head.position.y + 0.3 * hs, 0.04); toque.scale.setScalar(hs); toque.rotation.x = -0.06; BP.body.add(toque);
    { const wht = toon('#fbfbf7'), shade = toon('#e8e4da');
      M(new THREE.CylinderGeometry(0.25, 0.24, 0.2, 24), wht, 0, 0.08, 0, toque, 0.012, 0.25);
      for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; M(new THREE.BoxGeometry(0.012, 0.19, 0.02), shade, Math.sin(a) * 0.252, 0.08, Math.cos(a) * 0.252, toque, 0).rotation.y = a; }
      M(new THREE.CylinderGeometry(0.255, 0.255, 0.035, 24), toon('#3f7a3a'), 0, 0.005, 0, toque, 0);
      const crown = M(new THREE.SphereGeometry(0.33, 20, 14), wht, 0, 0.36, 0, toque, 0.012, 0.33); crown.scale.set(1, 0.72, 1);
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; M(new THREE.SphereGeometry(0.15, 12, 10), wht, Math.sin(a) * 0.2, 0.46 + (i % 2) * 0.04, Math.cos(a) * 0.2, toque, 0.008, 0.15); }
      M(new THREE.SphereGeometry(0.17, 12, 10), wht, 0, 0.56, 0, toque, 0.008, 0.17); }
    uniform.parts = [...U.parts.filter(q => q !== U.hat), toque]; }
  const crestSlots = []; ben.traverse(m => { if (m.isMesh && Array.isArray(m.material) && m.material[1] && m.material[1].map) crestSlots.push(m); });
  const setUniform = on => { uniform.parts.forEach(p => p.visible = on); crestSlots.forEach(m => m.visible = !on); }; setUniform(true);
  const custFox = CUST.map(cu => { const f = kit.makeFox({ ...CAST.player, look: cu.fur ? { ...CAST.player.look, fur: cu.fur, furDark: cu.furDark } : CAST.player.look, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' }); const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; f.visible = false; scene.add(f); return f; });

  // ---------- the pizza: dough mesh (28-sector rim from the 2D game), a canvas face for sauce/cheese/bake/cuts, 3D toppings ----------
  const PZ = new THREE.Group(); PZ.position.set(B.x, T + 0.031, B.z); scene.add(PZ);
  const spinG = new THREE.Group(); PZ.add(spinG);                 // spins with the dough (rotation.y = -spin)
  const A = 56, RING = [[0, 0.0105], [0.3, 0.0105], [0.6, 0.0105], [0.78, 0.0108], [0.86, 0.013], [0.9, 0.021], [0.94, 0.027], [0.975, 0.024], [0.995, 0.014], [1.0, 0.004]];
  const doughCol = new THREE.Color('#f3e2b8'), crustCol = new THREE.Color('#ead09a'), goldCol = new THREE.Color('#d08a3a'), charCol = new THREE.Color('#5a3018'), tmpC = new THREE.Color();
  const doughMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad });
  const faceCv = document.createElement('canvas'); faceCv.width = faceCv.height = 512; const fctx = faceCv.getContext('2d'); const faceTex = new THREE.CanvasTexture(faceCv); faceTex.colorSpace = THREE.SRGBColorSpace;
  const faceMat = new THREE.MeshToonMaterial({ map: faceTex, gradientMap: grad, transparent: true, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 });
  let doughMesh = null, faceMesh = null;
  const P = {};   // the current pizza (the 2D game's per-order state)
  const radAt = (sectors, a) => { const f = ((a / (Math.PI * 2)) * SECTORS % SECTORS + SECTORS) % SECTORS, i0 = Math.floor(f), t = f - i0; return sectors[i0 % SECTORS] * (1 - t) + sectors[(i0 + 1) % SECTORS] * t; };
  const smoothRad = (sectors, a) => (radAt(sectors, a - 0.06) + radAt(sectors, a) * 2 + radAt(sectors, a + 0.06)) / 4;
  function ringGeo(sectors, rings, inset, yOff) { const pos = [], col = [], uv = [], idx = [], nR = rings.length, crustF = [0];
    pos.push(0, rings[0][1] + yOff, 0); col.push(doughCol.r, doughCol.g, doughCol.b); uv.push(0.5, 0.5);
    for (let j = 1; j < nR; j++) for (let i = 0; i <= A; i++) { const a = i / A * Math.PI * 2, rr2 = Math.max(0.04, smoothRad(sectors, a) - inset) * rings[j][0], x = Math.cos(a) * rr2, y = Math.sin(a) * rr2;
      pos.push(-x * R, rings[j][1] + yOff, -y * R); const c = rings[j][0] > 0.86 ? crustCol : doughCol; col.push(c.r, c.g, c.b); crustF.push(rings[j][0] > 0.86 ? 1 : 0); uv.push((x + 1) / 2, 1 - (y + 1) / 2); }
    for (let i = 0; i < A; i++) idx.push(0, 1 + i + 1, 1 + i);
    for (let j = 1; j < nR - 1; j++) for (let i = 0; i < A; i++) { const a0 = 1 + (j - 1) * (A + 1) + i, b0 = 1 + j * (A + 1) + i; idx.push(a0, a0 + 1, b0, a0 + 1, b0 + 1, b0); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); g.userData.crust = crustF; return g; }
  function rebuildDough() { if (doughMesh) { spinG.remove(doughMesh); doughMesh.geometry.dispose(); } if (faceMesh) { spinG.remove(faceMesh); faceMesh.geometry.dispose(); }
    doughMesh = new THREE.Mesh(ringGeo(P.sectors, RING, 0, 0), doughMat); doughMesh.castShadow = doughMesh.receiveShadow = true; spinG.add(doughMesh);
    faceMesh = new THREE.Mesh(ringGeo(P.sectors, [[0, 0], [0.5, 0], [1, 0]], 0.075, 0.0112), faceMat); faceMesh.renderOrder = 2; spinG.add(faceMesh); tintDough(); }
  function tintDough() { if (!doughMesh) return; const g = doughMesh.geometry, c = g.attributes.color, cr = g.userData.crust, k = P.cooked || 0;
    for (let i = 0; i < c.count; i++) { const crust = !!cr[i]; tmpC.copy(crust ? crustCol : doughCol);
      if (k > 0) { tmpC.lerp(goldCol, clamp(k / 64, 0, 1) * (crust ? 1 : 0.6)); if (k > 70) tmpC.lerp(charCol, clamp((k - 70) / 40, 0, 0.85) * (crust ? 1 : 0.5)); if (crust && k > 35) { const h = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1; if (h > 0.72) tmpC.lerp(charCol, clamp((k - 35) / 60, 0, 0.55) * (h - 0.72) / 0.28); else if (h < 0.25) tmpC.offsetHSL(0, 0, 0.05 * clamp((k - 35) / 40, 0, 1)); } } c.setXYZ(i, tmpC.r, tmpC.g, tmpC.b); } c.needsUpdate = true; }
  const topsG = new THREE.Group(); PZ.add(topsG);
  // tap mark (dough), ordered size ring (board), cutter wheel + live cut line (slice)
  const markTex = canvasTex(128, 128, c => { c.clearRect(0, 0, 128, 128); c.strokeStyle = '#201e1d'; c.lineWidth = 16; c.beginPath(); c.arc(64, 64, 44, 0, 7); c.stroke(); c.strokeStyle = '#ffd23a'; c.lineWidth = 9; c.beginPath(); c.arc(64, 64, 44, 0, 7); c.stroke(); c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(64, 64, 12, 0, 7); c.fill(); });
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshBasicMaterial({ map: markTex, transparent: true, depthTest: false })); mark.rotation.x = -Math.PI / 2; mark.renderOrder = 22; scene.add(mark);
  const sizeRing = new THREE.Mesh(new THREE.RingGeometry(0.98, 1, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthWrite: false })); sizeRing.rotation.x = -Math.PI / 2; sizeRing.position.set(B.x, T + 0.036, B.z); sizeRing.renderOrder = 3; scene.add(sizeRing);
  const chromeM = toon('#d7dde3'), woodM = toon('#9a6a3e'), redM = toon('#b8321c');
  // PIZZA WHEEL: chrome wheel with a bevelled edge and hub, a red guard, a turned wooden handle
  const cutter = (() => { const g = new THREE.Group(), wheel = new THREE.Group(); g.add(wheel);
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.062, 0.004, 28), chromeM); w.rotation.z = Math.PI / 2; addOutline(w, 0.003, 0.062); wheel.add(w);
    for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.064, 0.003, 28), toon('#eef2f5')); b.rotation.z = Math.PI / 2; b.position.x = sx * 0.0035; wheel.add(b); }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.022, 12), toon('#9aa4ad')); hub.rotation.z = Math.PI / 2; wheel.add(hub); wheel.position.y = 0.062;
    const guard = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.008, 6, 16, Math.PI * 0.9), redM); guard.rotation.y = Math.PI / 2; guard.rotation.x = 0.1; guard.position.y = 0.062; addOutline(guard, 0.003); g.add(guard);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 8), chromeM); neck.position.set(0, 0.12, 0.05); neck.rotation.x = -0.9; g.add(neck);
    const h = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, 0.14, 4, 10), woodM); h.position.set(0, 0.18, 0.14); h.rotation.x = -1.0; addOutline(h, 0.003); g.add(h);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.019, 10, 8), redM); cap.position.set(0, 0.22, 0.2); g.add(cap); g.userData.wheel = wheel; g.visible = false; scene.add(g); return g; })();
  const cutLine = new THREE.Mesh(new THREE.BoxGeometry(1, 0.004, 0.012), new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false })); cutLine.renderOrder = 23; cutLine.visible = false; scene.add(cutLine);
  // SAUCE LADLE: a deep chrome bowl full of sauce, a long handle with a hook
  const ladle = (() => { const g = new THREE.Group(), prof = []; for (let i = 0; i <= 8; i++) { const a = i / 8 * Math.PI / 2; prof.push(new THREE.Vector2(Math.sin(a) * 0.065, 0.065 - Math.cos(a) * 0.065)); }
    const bowl = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), toon('#d7dde3', { side: THREE.DoubleSide })); addOutline(bowl, 0.003, 0.065); g.add(bowl);
    const sauce = new THREE.Mesh(new THREE.CircleGeometry(0.058, 18), toon('#b8321c')); sauce.rotation.x = -Math.PI / 2; sauce.position.y = 0.05; g.add(sauce);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0.064, 0.062), new THREE.Vector3(0, 0.13, 0.11), new THREE.Vector3(0, 0.25, 0.2), new THREE.Vector3(0, 0.33, 0.24), new THREE.Vector3(0, 0.33, 0.29)]);
    const handle = new THREE.Mesh(new THREE.TubeGeometry(curve, 20, 0.008, 6), chromeM); addOutline(handle, 0.003); g.add(handle);
    const drip = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), toon('#b8321c')); drip.position.y = -0.008; drip.scale.y = 1.4; g.add(drip); g.userData.drip = drip; g.visible = false; scene.add(g); return g; })();
  // CHEESE GRATER: a four-sided steel box grater with punched holes and a top handle; shreds fall from it while you drag
  const grater = (() => { const g = new THREE.Group(), holes = canvasTex(64, 128, c => { c.fillStyle = '#c9d1d8'; c.fillRect(0, 0, 64, 128); c.fillStyle = '#5a646d'; for (let y = 6; y < 128; y += 10) for (let x = (y / 10) % 2 ? 6 : 11; x < 64; x += 11) { c.beginPath(); c.ellipse(x, y, 3, 2, 0, 0, 7); c.fill(); } });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.2, 4, 1, true), new THREE.MeshToonMaterial({ map: holes, gradientMap: grad, side: THREE.DoubleSide })); body.rotation.y = Math.PI / 4; body.position.y = 0.11; addOutline(body, 0.003); g.add(body);
    const top = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.008, 0.08), chromeM); top.position.y = 0.212; g.add(top);
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 16, Math.PI), redM); loop.position.y = 0.215; addOutline(loop, 0.003); g.add(loop);
    g.visible = false; scene.add(g); return g; })();
  const shreds = Array.from({ length: 28 }, (_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.003, 0.004), toon(['#e8d08a', '#f4e3a8', '#fbeec0'][i % 3])); m.visible = false; scene.add(m); return { m, life: 0, v: new THREE.Vector3() }; }); let shI = 0;
  const dropShreds = (p, n = 3) => { for (let i = 0; i < n; i++) { const s = shreds[shI = (shI + 1) % shreds.length]; s.m.visible = true; s.m.position.set(p.x + rr(-0.04, 0.04), p.y, p.z + rr(-0.04, 0.04)); s.m.rotation.set(rr(0, 3), rr(0, 3), rr(0, 3)); s.v.set(rr(-0.1, 0.1), -rr(0.1, 0.4), rr(-0.1, 0.1)); s.life = 1; } };
  // PIZZA PEEL: carries the pie to the oven and back, handle toward the cook
  const peel = (() => { const g = new THREE.Group(), sh = new THREE.Shape(); sh.moveTo(-0.24, 0); sh.lineTo(0.24, 0); sh.quadraticCurveTo(0.27, -0.42, 0, -0.5); sh.quadraticCurveTo(-0.27, -0.42, -0.24, 0); const pg = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }); pg.rotateX(Math.PI / 2); pg.translate(0, 0, 0.27);
    const pad = new THREE.Mesh(pg, toon('#c99a62')); addOutline(pad, 0.004); g.add(pad); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.02, 0.9, 10), woodM); hd.rotation.x = Math.PI / 2; hd.position.set(0, -0.006, 0.72); addOutline(hd, 0.003, 0.02); g.add(hd);
    g.visible = false; scene.add(g); return g; })();
  const boxG = (() => { const g = new THREE.Group(), m = toon('#e8d6ac'); const base = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.05, 0.66), m); base.position.y = 0.025; addOutline(base, 0.006); g.add(base); const lid = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.012, 0.66), m); lid.geometry.translate(0, 0, -0.33); lid.position.set(0, 0.05, 0.33); lid.rotation.x = -1.9; addOutline(lid, 0.005); g.add(lid);
    const lt = canvasTex(256, 256, c => { c.fillStyle = '#e8d6ac'; c.fillRect(0, 0, 256, 256); c.save(); c.translate(128, 110); drawSlice(c, 0.7); c.restore(); c.fillStyle = '#b8321c'; c.font = 'italic 900 36px Archivo, Arial'; c.textAlign = 'center'; c.fillText('FOXY PIES', 128, 226); }); const lp = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshBasicMaterial({ map: lt })); lp.position.set(0, -0.007, -0.33); lp.rotation.x = Math.PI / 2; lid.add(lp); g.visible = false; scene.add(g); g.userData.lid = lid; return g; })();
  // SPARKLES (a perfect toss or a 90+ stage) and EMBERS (rising in the oven while you bake)
  const starTex = canvasTex(64, 64, c => { c.clearRect(0, 0, 64, 64); c.fillStyle = '#fff6c8'; c.beginPath(); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, r = i % 2 ? 9 : 30; c.lineTo(32 + Math.cos(a) * r, 32 + Math.sin(a) * r); } c.closePath(); c.fill(); });
  const sparks = Array.from({ length: 24 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: starTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); sp.visible = false; sp.renderOrder = 26; scene.add(sp); return { sp, life: 0, v: new THREE.Vector3() }; }); let spI = 0;
  const sparkle = (p, n = 10, sz = 0.07) => { for (let i = 0; i < n; i++) { const q = sparks[spI = (spI + 1) % sparks.length], a = Math.random() * Math.PI * 2; q.sp.visible = true; q.sp.position.copy(p); q.v.set(Math.cos(a) * rr(0.3, 0.7), rr(0.4, 0.9), Math.sin(a) * rr(0.3, 0.7)); q.life = 1; q.sz = sz * rr(0.7, 1.3); } };
  const embers = Array.from({ length: 16 }, () => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xff8a2a, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.visible = false; scene.add(sp); return { sp, life: 0, v: new THREE.Vector3() }; }); let emI = 0;
  const steamS = []; for (let i = 0; i < 3; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })); s.scale.setScalar(0.18); scene.add(s); steamS.push(s); }

  // ---------- shift + order state ----------
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const S = { phase: 'intro', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, starList: [], scoreList: [], flash: null, flashT: 0, say: '', sayT: 0, done: null, combo: 0, card: null, react: null, oi: 0, ord: null, queue: [], demo: false, baking: false, lastInput: 0 };
  const ordersToday = () => 3 + Math.min(3, S.day - 1);
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  // the 2D game's difficulty table, per order level
  function cfg(lvl) { return { targetR: [0.78, 0.86, 0.72, 0.9, 0.82][(lvl - 1) % 5], doughTol: 0.1 * FORGIVE, zoneWidth: Math.max(8, 22 - (lvl - 1) * 2) * FORGIVE * (upg('stone') ? 1.3 : 1), bakeSpeed: 22 + (lvl - 1) * 3, cutsNeeded: 4, stageTime: opts.stageSeconds || STAGE_SECONDS }; }
  function freshOrder(lvl, ci) { const c = cfg(lvl), keys = UNLOCK.slice(0, Math.min(UNLOCK.length, lvl + 1)), req = {}, sides = {}; keys.forEach(k => req[k] = 10);
    if (lvl >= 3) { const pool = keys.slice(1).sort(() => Math.random() - 0.5), pk = pool.slice(0, lvl >= 5 ? 2 : 1), flip = Math.random() < 0.5; pk.forEach((k, i) => { sides[k] = (i === 0) === flip ? 'left' : 'right'; }); }
    const stages = ['dough', 'sauce', 'cheese', ...keys.map(k => 'top:' + k), 'bake', 'slice', 'serve'];
    return { lvl, ci, stages, stageIndex: 0, stageTime: c.stageTime, sectors: seeded(SECTORS, () => 0.3 + Math.random() * 0.02), air: null, spin: 0, tosses: 0, target: pickTarget(0.3), lastErr: null,
      tossesAllowed: TOSSES, perfectGain: (c.targetR - 0.3) / TOSSES, targetR: c.targetR, sauce: [], sauceCells: {}, cheese: [], cheeseCells: {}, spill: 0, spillAt: 0, placed: [], req, keys, sides,
      cuts: [], drag: null, cutsNeeded: c.cutsNeeded, cooked: 0, bakeDone: false, doneTarget: Math.round(38 + Math.random() * 34), zoneWidth: c.zoneWidth, order: NAMES[(lvl - 1 + S.day) % NAMES.length],
      elapsed: 0, scores: {}, announceAt: 0, seeds: { chars: seeded(11, () => ({ a: Math.random() * Math.PI * 2, d: Math.random() * 0.9, r: 0.028 + Math.random() * 0.035 })) } }; }
  const stage = () => P.stages ? P.stages[P.stageIndex] : 'none';
  const meanR = () => P.sectors.reduce((a, b) => a + b, 0) / SECTORS;
  const radiusAt = a => { const i = ((Math.round((a / (Math.PI * 2)) * SECTORS) % SECTORS) + SECTORS) % SECTORS; return P.sectors[i]; };
  const smoothS = (sec, k) => sec.map((r, i) => r * (1 - k) + ((sec[(i - 1 + SECTORS) % SECTORS] + sec[(i + 1) % SECTORS]) / 2) * k);
  const rotateSectors = (sec, deg) => { const shift = deg / (360 / SECTORS), out = []; for (let i = 0; i < SECTORS; i++) { const src = i - shift, lo = Math.floor(src), f = src - lo; const a = sec[((lo % SECTORS) + SECTORS) % SECTORS], b = sec[(((lo + 1) % SECTORS) + SECTORS) % SECTORS]; out.push(a + (b - a) * f); } return out; };
  const sideOf = k => (P.sides || {})[k] || 'whole';
  function evenness(list, halves) { if (list.length < 3) return 0; const W = halves ? 4 : 8, bins = new Array(W).fill(0), bands = [0, 0];
    list.forEach(p => { const a = Math.atan2(p.y, p.x); let t; if (halves) { const folded = halves === 'left' ? Math.atan2(p.y, -p.x) : a; t = (Math.max(-Math.PI / 2, Math.min(Math.PI / 2, folded)) + Math.PI / 2) / Math.PI; } else t = ((a + Math.PI) / (Math.PI * 2)) % 1; bins[Math.min(W - 1, Math.floor(t * W))]++; const r = Math.hypot(p.x, p.y) / Math.max(0.2, radiusAt(Math.atan2(p.y, p.x))); bands[r < 0.62 ? 0 : 1]++; });
    const ideal = list.length / W, dev = bins.reduce((acc, b) => acc + Math.abs(b - ideal), 0) / (2 * list.length), wedge = Math.max(0, 100 - dev * 170), split = Math.min(bands[0], bands[1]) / Math.max(1, Math.max(bands[0], bands[1]));
    return wedge * 0.65 + Math.min(100, split * 210) * 0.35; }
  function sideCorrect(placed, k) { const side = sideOf(k), mine = placed.filter(x => x.key === k); if (!mine.length) return 0; if (side === 'whole') return 100; return mine.filter(p => side === 'left' ? p.x < 0.02 : p.x > -0.02).length / mine.length * 100; }
  function toppingScore(placed, k) { const want = P.req[k], mine = placed.filter(x => x.key === k), side = sideOf(k), count = Math.max(0, 100 - (want - mine.length) * (100 / want)); let sc = count * 0.34 + evenness(mine, side === 'whole' ? null : side) * 0.36 + sideCorrect(placed, k) * 0.3;
    for (let i = 0; i < mine.length; i++) for (let j = i + 1; j < mine.length; j++) if (Math.hypot(mine[i].x - mine[j].x, mine[i].y - mine[j].y) < 0.1) return sc * 0.85; return sc; }
  const chordOff = d => { const vx = d.x2 - d.x1, vy = d.y2 - d.y1, len = Math.hypot(vx, vy); return len ? Math.abs(vx * d.y1 - vy * d.x1) / len : 1; };
  function sliceScore(cuts) { if (!cuts.length) return 0; const off = cuts.reduce((a, c) => a + (c.off || 0), 0) / cuts.length; let sc = Math.max(0, 100 - off * 190 / FORGIVE - (P.cutsNeeded - cuts.length) * 18); if (cuts.some(c => (c.off || 0) > 0.16)) sc *= 0.85; return sc; }

  // ---------- the pizza's face: sauce, cheese, bake tint, char, cuts, crust guide, half split — drawn in the 2D game's units ----------
  let faceDirty = true; const px = v => (v + 1) * 256, pr = v => v * 256;
  function rimPath(c, inset) { c.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * Math.PI * 2, r = Math.max(0.04, smoothRad(P.sectors, a) - inset); const x = px(Math.cos(a) * r), y = px(Math.sin(a) * r); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); }
  function drawFace() { faceDirty = false; const c = fctx; c.clearRect(0, 0, 512, 512); if (!P.sectors) { faceTex.needsUpdate = true; return; } const st = stage();
    c.save(); rimPath(c, 0.075); c.clip();
    for (const s of P.sauce) { const g = c.createRadialGradient(px(s.x), px(s.y), 2, px(s.x), px(s.y), pr(0.095)); g.addColorStop(0, '#c23a20'); g.addColorStop(0.7, '#b3301a'); g.addColorStop(1, 'rgba(160,40,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(px(s.x), px(s.y), pr(0.095), 0, 7); c.fill(); }
    const melt = clamp(((P.cooked || 0) - 18) / 40, 0, 1);
    if (melt > 0) { c.globalAlpha = melt; for (const ch of P.cheese) { const g = c.createRadialGradient(px(ch.x), px(ch.y), 2, px(ch.x), px(ch.y), pr(0.085)); g.addColorStop(0, '#f8dc78'); g.addColorStop(0.75, '#efc85a'); g.addColorStop(1, 'rgba(236,196,84,0)'); c.fillStyle = g; c.beginPath(); c.arc(px(ch.x), px(ch.y), pr(0.085), 0, 7); c.fill(); } c.globalAlpha = 1;
      if (P.cooked > 45) { const o = clamp((P.cooked - 45) / 30, 0, 0.9); for (let i = 0; i < 22; i++) { const a = i * 2.39996, d = Math.sqrt((i + 0.5) / 22) * (meanR() - 0.12), x = Math.cos(a) * d, y = Math.sin(a) * d; const g = c.createRadialGradient(px(x), px(y), 1, px(x), px(y), pr(0.03 + (i % 3) * 0.01)); g.addColorStop(0, 'rgba(196,128,40,' + o + ')'); g.addColorStop(1, 'rgba(196,128,40,0)'); c.fillStyle = g; c.beginPath(); c.arc(px(x), px(y), pr(0.045), 0, 7); c.fill(); } } }
    c.globalAlpha = 1 - melt * 0.85;
    for (const ch of P.cheese) for (let k = 0; k < 5; k++) { const a = ((ch.rot + k * 47) % 180) * Math.PI / 180, ox = ((k % 3) - 1) * 0.05, oy = (Math.floor(k / 3) - 0.5) * 0.06; c.save(); c.translate(px(ch.x + ox), px(ch.y + oy)); c.rotate(a); c.fillStyle = k % 3 === 0 ? '#e8d08a' : k % 3 === 1 ? '#f4e3a8' : '#fbeec0'; c.fillRect(-pr(0.06), -pr(0.012), pr(0.12 + (k % 3) * 0.024), pr(0.022 + (k % 2) * 0.006)); c.restore(); }
    c.globalAlpha = 1;
    if (P.cooked > 2) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = P.cooked > 82 ? '#2a1a0e' : '#8a5a20'; c.globalAlpha = P.cooked > 82 ? Math.min(0.55, P.cooked / 190) : Math.min(0.55, P.cooked / 190) * 0.35; c.fillRect(0, 0, 512, 512); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      const o = Math.max(0, Math.min(0.85, (P.cooked - 45) / 60)); if (o > 0) { c.fillStyle = 'rgba(42,26,14,' + o + ')'; for (const ch of P.seeds.chars) { const r = (radiusAt(ch.a) - 0.08) * ch.d; c.beginPath(); c.arc(px(Math.cos(ch.a) * r), px(Math.sin(ch.a) * r), pr(ch.r), 0, 7); c.fill(); } } }
    c.restore();
    if (st.indexOf('top:') === 0 && sideOf(st.slice(4)) !== 'whole') { const left = sideOf(st.slice(4)) === 'left'; c.save(); rimPath(c, 0); c.clip(); c.fillStyle = 'rgba(20,18,24,0.42)'; c.fillRect(left ? 256 : 0, 0, 256, 512); c.strokeStyle = '#ffd23a'; c.lineWidth = 4; c.setLineDash([14, 10]); c.beginPath(); c.moveTo(256, 0); c.lineTo(256, 512); c.stroke(); c.restore(); }
    if (st === 'sauce' || st === 'cheese') { const hot = performance.now() - P.spillAt < 320; c.save(); rimPath(c, st === 'cheese' ? 0.08 : 0.06); c.strokeStyle = hot ? '#ec3013' : '#7d5526'; c.globalAlpha = hot ? 1 : 0.85; c.lineWidth = hot ? 7 : 4; c.setLineDash([12, 9]); c.stroke(); c.restore(); }
    if (st === 'slice' && upg('wheel') && P.cuts.length < P.cutsNeeded) { c.save(); c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(256, 256, 7, 0, 7); c.fill(); c.restore(); }
    if (P.cuts.length) { c.save(); rimPath(c, -0.03); c.clip(); c.strokeStyle = '#3a2414'; c.lineWidth = 5; c.lineCap = 'round'; for (const k of P.cuts) { const dx = k.x2 - k.x1, dy = k.y2 - k.y1, L = Math.hypot(dx, dy) || 1, ex = dx / L * 2, ey = dy / L * 2; c.beginPath(); c.moveTo(px(k.x1 - ex), px(k.y1 - ey)); c.lineTo(px(k.x2 + ex), px(k.y2 + ey)); c.stroke(); } c.restore(); }
    faceTex.needsUpdate = true; }
  // 2D → 3D on the pizza (camera looks from the kitchen side, so screen-right = -x and screen-down = -z)
  const toW = (x, y, h = 0) => V3(PZ.position.x - x * R, PZ.position.y + h, PZ.position.z - y * R);
  // the TOPPINGS TABLE in play: the tray for the current topping glows and lifts, a tag shows how many are left; drag from it or tap the pie
  const trayRing = new THREE.Mesh(new THREE.RingGeometry(0.105, 0.125, 4, 1, Math.PI / 4), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, depthWrite: false })); trayRing.rotation.x = -Math.PI / 2; trayRing.scale.set(1.05, 0.85, 1); trayRing.renderOrder = 21; trayRing.visible = false; scene.add(trayRing);
  const tagCv = document.createElement('canvas'); tagCv.width = 512; tagCv.height = 72; const tagTex = new THREE.CanvasTexture(tagCv); tagTex.colorSpace = THREE.SRGBColorSpace; const trayTag = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagTex, depthTest: false })); trayTag.scale.set(0.5, 0.07, 1); trayTag.renderOrder = 25; trayTag.visible = false; scene.add(trayTag); let tagKey = '';
  function drawTag(k, left, side) { const key = k + left + side; if (key === tagKey) return; tagKey = key; const c = tagCv.getContext('2d'); c.clearRect(0, 0, 512, 72); c.fillStyle = '#000'; c.fillRect(0, 0, 512, 72); c.fillStyle = TOPPINGS[k].fill; c.fillRect(0, 0, 14, 72); c.textBaseline = 'middle';
    const txt = TOPPINGS[k].name + ' · ' + left + ' LEFT' + (side !== 'whole' ? ' · ' + side.toUpperCase() + ' HALF' : ''); let f = 38; do { c.font = '900 ' + f + 'px Archivo, Arial'; f -= 2; } while (c.measureText(txt).width > 470 && f > 16); c.fillStyle = '#ffd23a'; c.fillText(txt, 30, 38); tagTex.needsUpdate = true; }
  function scoopTray(k) { const tb = K.tubs[k]; if (tb && tb.pile) tb.pile.userData.bob = 1; }
  function trayStep(dt) { const st = stage(), on = S.phase === 'shift' && st.indexOf('top:') === 0 && !PZ.userData.move && !S.react; trayRing.visible = trayTag.visible = on;
    for (const [k, tb] of Object.entries(K.tubs)) { const act = on && st.slice(4) === k; tb.pile.userData.bob = Math.max(0, (tb.pile.userData.bob || 0) - dt * 4); tb.pile.position.y = T + 0.082 + (act ? 0.02 + Math.sin(clock.elapsedTime * 5) * 0.006 : 0) - (tb.pile.userData.bob || 0) * 0.015; }
    if (!on) return; const k = st.slice(4), tb = K.tubs[k], pls = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 6); trayRing.position.set(tb.x, T + 0.09, tb.z); trayRing.material.opacity = 0.55 + pls * 0.45; trayTag.position.set(K.toppingsTable.x, T + 0.2, K.toppingsTable.z + 0.16); drawTag(k, P.req[k] - P.placed.filter(x => x.key === k).length, sideOf(k)); }
  let tDrag = null;
  function trayDown(x, y) { const st = stage(), k = st.slice(4), tb = K.tubs[k]; if (!tb) return false; const s2 = scr(V3(tb.x, T + 0.1, tb.z)); if (Math.hypot(s2.x - x, s2.y - y) > Math.max(34, Math.min(CW(), CHh()) * 0.08)) return false;
    const m = toppingMesh(THREE, toon, k, addOutline); m.scale.setScalar(1.25); m.position.set(tb.x, T + 0.15, tb.z); scene.add(m); tDrag = { k, m }; scoopTray(k); SX('pick'); buzz(8); return true; }
  function trayMove(x, y) { if (!tDrag) return; ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); plane.constant = -(T + 0.12); if (ray.ray.intersectPlane(plane, hit)) tDrag.m.position.set(hit.x, T + 0.12, hit.z); }
  function trayUp(x, y) { if (!tDrag) return; const d = tDrag; tDrag = null; scene.remove(d.m); const p = pieAt(x, y); if (p && Math.hypot(p.x, p.y) < 1.3 && stage() === 'top:' + d.k) place(p, d.k, true); }
  function rebuildTops() { while (topsG.children.length) topsG.remove(topsG.children[0]); for (const t of P.placed) { const m = toppingMesh(THREE, toon, t.key, addOutline, (t.spin % 1 + 1) % 1); m.position.set(-t.x * R, 0.012, -t.y * R); m.rotation.y = t.spin; if (t.fresh) { m.userData.drop = 0; if (t.fresh === 'fly' && K.tubs[t.key]) { const tb = K.tubs[t.key]; m.userData.fly = V3(tb.x - PZ.position.x, T + 0.12 - PZ.position.y, tb.z - PZ.position.z); } t.fresh = false; } topsG.add(m); } }

  // ---------- the 2D game's actions ----------
  function commit(label, score) { P.scores[label] = Math.max(0, Math.min(100, Math.round(score))); if (P.scores[label] >= 90) { sparkle(V3(PZ.position.x, PZ.position.y + 0.08, PZ.position.z), 14, 0.08); flash(label + ' · ' + P.scores[label] + ' · PERFECT!', '#22c55e', 1.1); } P.stageIndex = Math.min(P.stages.length - 1, P.stageIndex + 1); P.stageTime = cfg(P.lvl).stageTime; P.drag = null; P.announceAt = performance.now(); faceDirty = true; onStage(); }
  function toss(p) { if (P.air) return; const t = rotPt(P.target, P.spin), err = Math.hypot(p.x - t.x, p.y - t.y), acc = clamp(1 - err / 0.42, 0, 1), reach = Math.pow(acc, 1.3);
    SX('toss'); if (err < 0.1) { SX('perfect'); buzz(25); sparkle(toW(t.x, t.y, 0.05), 8, 0.05); } else { buzz(10); if (err >= 0.22) SX('wide'); } P.lastErr = err; P.air = { t: 0, gain: P.perfectGain * (0.22 + 0.78 * reach), skew: (1 - acc) * 0.24, skewAng: Math.atan2(p.y, p.x) };
    flash(err < 0.1 ? 'DEAD ON!' : err < 0.22 ? 'CLOSE' : 'WIDE · THE DOUGH PULLED', err < 0.1 ? '#22c55e' : err < 0.22 ? '#ffd23a' : '#ec3013', 0.8); }
  function landToss() { const a = P.air; P.sectors = smoothS(smoothS(P.sectors.map((r, i) => { const ang = i / SECTORS * Math.PI * 2, cs = Math.cos(ang - a.skewAng), pull = Math.sign(cs) * Math.pow(Math.abs(cs), 2.2); return clamp(r + a.gain + a.skew * pull, 0.12, 0.94); }), 0.18), 0.18);
    SX('catch'); puff(PZ.position.x, T + 0.06, PZ.position.z, 0xfbf6e8, 6); P.air = null; P.tosses++; rebuildDough(); if (P.tosses >= P.tossesAllowed) stageDone(); else P.target = pickTarget(meanR()); }
  function paint(p, kind, fresh) { const a = Math.atan2(p.y, p.x), lim = radiusAt(a) - (kind === 'sauce' ? 0.06 : 0.08); if (Math.hypot(p.x, p.y) > lim) { P.spill++; P.spillAt = performance.now(); faceDirty = true; return; }
    const cellsKey = kind + 'Cells', key = Math.round(p.x * 9) + ':' + Math.round(p.y * 9); if (kind === 'sauce' && P[cellsKey][key]) return; P[cellsKey][key] = 1;
    const list = P[kind], last = list[list.length - 1], gap = kind === 'sauce' ? 0.045 : 0.03, now = performance.now();
    if (now - (S.lastSpread || 0) > (kind === 'sauce' ? 105 : 70)) { S.lastSpread = now; SX(kind); }
    if (fresh || !last || Math.hypot(p.x - last.x, p.y - last.y) > gap) { list.push({ x: p.x, y: p.y, rot: Math.round(Math.random() * 180) }); faceDirty = true; } }
  function paintWide(p, kind, fresh) { paint(p, kind, fresh); if (upg(kind === 'sauce' ? 'ladle' : 'grater')) { const d = 0.1, a = (S.strokeA || 0) + Math.PI / 2; paint({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d }, kind, true); paint({ x: p.x - Math.cos(a) * d, y: p.y - Math.sin(a) * d }, kind, true); } }
  function place(p, k, fromTray) { const t = TOPPINGS[k]; if (Math.hypot(p.x, p.y) > radiusAt(Math.atan2(p.y, p.x)) - 0.1) { flash('ON THE PIE, PLEASE', '#ffffff', 0.7); return; } if (P.placed.filter(x => x.key === k).length >= P.req[k]) return;
    if (!fromTray) SX('pick'); buzz(8); P.placed.push({ key: k, x: p.x, y: p.y, r: t.r, shape: t.shape, spin: Math.random() * 6.2, fresh: fromTray ? 'drop' : 'fly' }); rebuildTops(); scoopTray(k);
    if (P.placed.filter(x => x.key === k).length >= P.req[k]) commit(t.name, toppingScore(P.placed, k)); }
  function stageDone() { const st = stage();
    if (st === 'dough') { const mean = meanR(), dev = Math.sqrt(P.sectors.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / SECTORS), c = cfg(P.lvl), off = Math.abs(mean - P.targetR);
      const size = off <= c.doughTol ? 100 - (off / c.doughTol) * 10 : Math.max(0, 90 - ((off - c.doughTol) / c.doughTol) * 28), round = Math.max(0, 100 - dev * 300);
      P.sectors = rotateSectors(P.sectors, P.spin); P.spin = 0; spinG.rotation.y = 0; rebuildDough(); commit('DOUGH', size * 0.6 + round * 0.4); }
    else if (st === 'sauce' || st === 'cheese') { const inset = st === 'sauce' ? 0.06 : 0.08, cells = Object.keys(P[st + 'Cells']).length, area = P.sectors.reduce((acc, r) => acc + Math.pow(Math.max(0.04, r - inset) * 9, 2) * Math.PI / SECTORS, 0), cov = Math.min(1, cells / Math.max(10, area * 0.9));
      let sc = Math.pow(cov, 1.35) * 100 * 0.62 + evenness(P[st], null) * 0.38 - P.spill * 0.6; if (P.spill > 0) sc *= 0.85; P.spill = 0; commit(st === 'sauce' ? 'SAUCE' : 'CHEESE', sc); }
    else if (st.indexOf('top:') === 0) commit(TOPPINGS[st.slice(4)].name, toppingScore(P.placed, st.slice(4)));
    else if (st === 'slice') commit('SLICE', sliceScore(P.cuts)); }
  // BAKE: hold to fire, let go inside the ordered band
  function bakeDown() { if (stage() !== 'bake' || P.bakeDone || S.baking || PZ.userData.move) return; S.baking = true; SX('fire'); SND.oven(true, 1); P.zoneCue = false; buzz(15); }
  function bakeUp() { if (stage() !== 'bake' || P.bakeDone || !S.baking) return; S.baking = false; SND.oven(true, 0.3); const off = Math.abs(P.cooked - P.doneTarget), half = P.zoneWidth / 2, sc = off <= half ? 100 - (off / half) * 22 : Math.max(0, 76 - (off - half) * 2.4);
    P.bakeDone = true; flash(doneName(P.cooked) + (off <= half ? ' · AS ORDERED' : P.cooked < P.doneTarget ? ' · UNDERDONE' : ' · OVERDONE'), off <= half ? '#22c55e' : '#ec3013', 1.3); SX(off <= half ? 'ding' : 'over'); buzz(off <= half ? 30 : 60); commit('BAKE', sc); }
  // SLICE: a swipe through the pie
  function cutUp() { const d = P.drag; P.drag = null; cutLine.visible = false; if (!d || P.cuts.length >= P.cutsNeeded) return; const len = Math.hypot(d.x2 - d.x1, d.y2 - d.y1); if (len < 0.2) return;
    SX('cut'); buzz(12); P.cuts.push({ x1: n3(d.x1), y1: n3(d.y1), x2: n3(d.x2), y2: n3(d.y2), off: chordOff(d) }); faceDirty = true;
    const off = chordOff(d); flash(off < 0.08 ? 'RIGHT THROUGH THE MIDDLE' : off < 0.16 ? 'A LITTLE OFF' : 'MISSED THE MIDDLE', off < 0.08 ? '#22c55e' : off < 0.16 ? '#ffd23a' : '#ec3013', 0.8);
    if (P.cuts.length >= P.cutsNeeded) commit('SLICE', sliceScore(P.cuts)); }

  // ---------- moving the pie: board → oven hearth → board → the pass ----------
  const AT = { board: () => V3(B.x, T + 0.031, B.z), oven: () => V3(K.oven.x, T + 0.022, K.oven.z + 0.05), pass: () => V3(K.serve.x, K.pass.y + 0.055, K.pass.z) };
  function moveTo(where, dur = 0.7, arc = 0.25, done) { PZ.userData.move = { from: PZ.position.clone(), to: AT[where](), t: 0, dur, arc, done }; }
  function onStage() { const st = stage(); S.stageT = 0;
    if (st === 'bake') { moveTo('oven', 0.8, 0.3, () => { flash('HOLD TO BAKE · LET GO AT ' + doneName(P.doneTarget), '#ffd23a', 1.6); }); say('THE OVEN: Bake it to ' + doneName(P.doneTarget).toLowerCase() + '. Hold, then let go in the band.', 3); }
    else if (st === 'slice') moveTo('board', 0.8, 0.3);
    else if (st === 'serve') { boxG.visible = true; boxG.position.copy(AT.pass()).add(V3(0, -0.055, 0)); moveTo('pass', 0.8, 0.35, () => { boxG.userData.close = 0; }); }
    else if (st.indexOf('top:') === 0) { const k = st.slice(4), side = sideOf(k); if (side !== 'whole') flash('HALF AND HALF · ' + TOPPINGS[k].name + ' ON THE ' + side.toUpperCase() + ' ONLY', '#ffd23a', 1.8); }
    if (st === 'bake' || st === 'slice' || st === 'serve') SX('slide'); if (P.stageIndex > 0) SX('chime'); }

  // ---------- customers + orders ----------
  function walkIn(ci, spot) { const f = custFox[ci], sp = K.spots[spot]; f.visible = true; f.position.set(sp.x + (spot === 2 ? 3 : -3), 0, K.D / 2 - 0.6); f.rotation.y = Math.PI; f.userData.mood = 'happy'; f.userData.lineMood = null; return { ci, f, spot, st: 'walk' }; }
  function nextCi(skip = []) { const used = [S.ord && S.ord.ci, ...S.queue.map(q => q.ci), ...skip]; const pool = CUST.map((_, i) => i).filter(i => !used.includes(i)); return pick(pool.length ? pool : CUST.map((_, i) => i)); }
  function startOrder() { const lvl = Math.min(8, S.day + S.oi), q = S.queue.shift(); const cu = q ? q : walkIn(nextCi(), 0); cu.spot = 0; cu.st = 'walk';
    Object.keys(P).forEach(k => delete P[k]); Object.assign(P, freshOrder(lvl, cu.ci)); S.ord = cu; S.card = null; S.react = null; boxG.visible = false; PZ.position.copy(AT.board()); PZ.scale.setScalar(1); spinG.rotation.y = 0; rebuildDough(); rebuildTops(); faceDirty = true; sizeRing.visible = true;
    if (S.oi + 1 < ordersToday()) S.queue.push(walkIn(nextCi(), 1)); onStage(); SX('doorbell'); }
  function serve() { if (stage() !== 'serve' || S.react || S.card) return; const vals = Object.values(P.scores), avg = Math.round(vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length)), speed = Math.max(0, Math.round(40 - P.elapsed * 0.4)), m = moodOf(avg);
    const combo = avg >= 80 ? S.combo + 1 : 0, price = 6 + P.keys.length + (P.targetR > 0.85 ? 2 : P.targetR < 0.75 ? -1 : 0), mult = (1 + combo * 0.15) * (upg('radio') ? 1.25 : 1), tipK = { THRILLED: 0.5, HAPPY: 0.3, NEUTRAL: 0.12 }[m[2].replace('!', '')] || 0, tip = Math.round(price * tipK * mult + (m[5] ? speed / 10 : 0));
    S.combo = combo; S.earned += price; S.tips += tip; S.served++; S.starList.push(m[5]); S.scoreList.push(avg);
    const o = S.ord, f = o.f; f.userData.mood = m[4]; f.userData.lineMood = m[4]; f.userData.hop = 1; boxG.userData.close = 1;
    S.react = { t: 0, word: m[2], mood: m[1], col: m[3], stars: m[5], who: CUST[o.ci].name, line: pick(REACT_LINES[m[2].replace('!', '')]), tip, price, avg, speed, mult };
    SX('box'); setTimeout(() => SX(m[5] >= 3 ? 'fanfare' : m[5] === 2 ? 'happy' : m[5] === 1 ? 'sad' : 'angry'), 260); setTimeout(() => SX('register'), 900); buzz(m[5] >= 3 ? [20, 40, 20] : 20); }
  function reactDone() { const r = S.react; S.react = null; S.card = { ...r, rows: Object.entries(P.scores).map(([k, v]) => ({ k, v })) }; const o = S.ord; o.st = 'leave'; o.t = 0; o.f.userData.lineMood = null; boxG.visible = false; PZ.visible = false; }
  function nextOrder() { if (!S.card) return; S.card = null; PZ.visible = true; S.oi++; if (S.oi >= ordersToday()) endShift(); else startOrder(); }

  // ---------- flow ----------
  function clearAll() { S.baking = false; SND.oven(true, 0.3); cutter.visible = cutLine.visible = ladle.visible = grater.visible = peel.visible = false; S.card = null; S.react = null; [S.ord, ...S.queue].forEach(o => o && (o.f.visible = false)); S.ord = null; S.queue = []; boxG.visible = false; PZ.visible = true;
    Object.keys(P).forEach(k => delete P[k]); Object.assign(P, freshOrder(1, 0)); P.stages = ['none']; PZ.position.copy(AT.board()); rebuildDough(); rebuildTops(); faceDirty = true; sizeRing.visible = false; mark.visible = false; }
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done') return; if (!S.demo && DM.on) demoStop(); wake(); SX('doorbell'); clearAll(); Object.assign(S, { phase: 'glide', t: 0, oi: 0, earned: 0, tips: 0, served: 0, starList: [], scoreList: [], done: null, combo: 0 });
    setUniform(!!save.flag('piesUniform') || S.demo); ben.visible = false; glideTo(workShot(), 1.4); S.glideT = 1.45; say('FOXY PIES: "Toss it, sauce it, cheese it, top it, fire it, slice it. ' + ordersToday() + ' orders today!"', 5); }
  function endShift() { S.phase = 'done'; S.baking = false; SND.oven(true, 0.3); setTimeout(() => SX('fanfare'), 400); const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = avg >= 2.5, wage = 10 + S.day * 2, total = wage + S.earned + S.tips; let newDay = false; const unlock = [];
    if (!S.demo) try { save.addGold(total); save.best(SAVE.best, total); save.setStat(SAVE.made, save.stat(SAVE.made, 0) + S.served); if (avg >= 1.5) { save.setStat(SAVE.day, S.day + 1); newDay = true; const k = Math.min(5, S.day + 2); unlock.push('DAY ' + (S.day + 1) + ' · UP TO ' + k + ' TOPPINGS A PIE'); }
      if (!save.flag('piesUniform') && S.served >= 3) { save.setFlag('piesUniform'); unlock.push('FOXY PIES UNIFORM (hat + towel + tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, avg: Math.round(avg * 10) / 10, avgScore: S.scoreList.length ? Math.round(S.scoreList.reduce((a, b) => a + b, 0) / S.scoreList.length) : 0, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0) };
    if (newDay) S.day += 1; [S.ord, ...S.queue].forEach(o => { if (o) { o.st = 'leave'; o.t = 0; } }); S.queue = []; ben.visible = true; ben.position.copy(BEN_AT); setUniform(true); glideTo(wideShot(), 1.4); PZ.visible = false; sizeRing.visible = false;
    say(eod ? 'FOXY PIES: "EMPLOYEE OF THE DAY! The whole route is talking!"' : avg >= 1.5 ? 'FOXY PIES: "Good shift. Same time tomorrow?"' : 'FOXY PIES: "Rough one. Tomorrow will be smoother."', 6); }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); SX('register'); return true; }
  function toIntro() { S.phase = 'intro'; S.done = null; ben.visible = true; ben.position.copy(BEN_AT); ben.rotation.y = 0.3; setUniform(true); PZ.visible = true; glideTo(wideShot(), 1); }

  // ---------- cameras ----------
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 }, { SAFE, shotFor } = cameraFit(ST);
  const wideShot = () => { const z = BEN_AT.z, x = BEN_AT.x, box = [V3(x - 0.55, 0.05, z), V3(x + 0.55, 0.05, z), V3(x - 0.55, 2.25, z), V3(x + 0.55, 2.25, z), V3(x, 3.05, z)]; /* 3.05 m: the top of the chef's toque */ return CW() < CHh() ? shotFor('wideP2', () => box, 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL2', () => box, 0.12, Math.PI - 0.3, 0.05); };
  const pieBox = (pad = 0.05) => { const r = Math.max(P.targetR || 0.8, P.sectors ? Math.max(...P.sectors) : 0.8) * R + pad, c = AT.board(); return [V3(c.x - r, T, c.z - r), V3(c.x + r, T, c.z + r), V3(c.x - r, T, c.z + r), V3(c.x + r, T, c.z - r), V3(c.x, T + 0.06, c.z)]; };
  function workShot() { const st = stage(), port = CW() < CHh();
    if (st === 'bake') { const o = AT.oven(); return shotFor('oven' + (port ? 'P' : 'L'), () => [V3(o.x - 0.62, T, o.z - 0.1), V3(o.x + 0.62, T, o.z - 0.1), V3(o.x - 0.5, T + 0.62, o.z - 0.55), V3(o.x + 0.5, T + 0.62, o.z - 0.55), V3(o.x, T, o.z + 0.55)], port ? 0.62 : 0.5, Math.PI, 0.05); }
    if (S.card) return shotFor('card' + (port ? 'P' : 'L'), () => [V3(K.oven.x - 1.1, T, K.oven.z), V3(K.oven.x, T + 1.0, K.oven.z), V3(B.x + 0.9, T, B.z), V3(-2.6, 1.1, K.pass.z), V3(2.6, 1.1, K.pass.z)], 0.32, Math.PI - 0.25, 0.04);
    if (st === 'serve' && !S.react) { const p = AT.pass(), c = K.spots[0]; return shotFor('pass' + (port ? 'P' : 'L'), () => [V3(p.x - 0.36, p.y, p.z - 0.36), V3(p.x + 0.36, p.y, p.z + 0.36), V3(p.x - 0.36, p.y, p.z + 0.36), V3(c.x, 2.05, c.z), V3(c.x - 0.3, 1.6, c.z)], 0.85, 0, 0.06); }
    const top = st.indexOf('top:') === 0, key = 'pie' + (top ? 'T' : '') + (port ? 'P' : 'L') + Math.round((P.targetR || 0.8) * 100), tt = K.toppingsTable;
    return shotFor(key, () => top ? [...pieBox(0.04), V3(tt.x - 0.56, T, tt.z + 0.1), V3(tt.x + 0.56, T, tt.z + 0.1), V3(tt.x, T + 0.24, tt.z + 0.16)] : pieBox(0.12), port ? 1.05 : 0.95, 0, 0.05); }
  function glideTo(shot, dur = 1.4) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  camera.position.set(-0.6, 2.0, K.pass.z + 4.2); CAM.look.set(0, 1.2, K.pass.z); camera.lookAt(CAM.look);

  // ---------- input ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = V3();
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  function pieAt(x, y) { ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); plane.constant = -(PZ.position.y + 0.012); if (!ray.ray.intersectPlane(plane, hit)) return null; return { x: -(hit.x - PZ.position.x) / R, y: -(hit.z - PZ.position.z) / R, w: hit.clone() }; }
  const canWork = () => S.phase === 'shift' && !DM.on && !S.react && !S.card && !PZ.userData.move && S.ord && S.ord.st !== 'walk-x';
  function onDown(e) { wake(); S.lastInput = performance.now(); if (!canWork()) return; const { x, y } = local(e), st = stage();
    if (st === 'bake') { const o = scr(V3(K.oven.x, T + 0.3, K.oven.z + 0.3)); if (Math.hypot(o.x - x, o.y - y) < Math.min(CW(), CHh()) * 0.45) { e.preventDefault(); bakeDown(); S.ptrBake = true; } return; }
    if (st.indexOf('top:') === 0 && trayDown(x, y)) { e.preventDefault(); return; }
    const p = pieAt(x, y); if (!p) return; const d = Math.hypot(p.x, p.y);
    if (st === 'dough') { if (d < 1.35) { e.preventDefault(); toss(p); } }
    else if (st === 'sauce' || st === 'cheese') { if (d < 1.3) { e.preventDefault(); P.drag = st; S.strokeLast = p; paintWide(p, st, true); } }
    else if (st.indexOf('top:') === 0) { if (trayDown(x, y)) { e.preventDefault(); return; } if (d < 1.3) { e.preventDefault(); place(p, st.slice(4)); } }
    else if (st === 'slice') { e.preventDefault(); P.drag = { x1: p.x, y1: p.y, x2: p.x, y2: p.y }; } }
  function onMove(e) { if (tDrag) { const q = local(e); trayMove(q.x, q.y); return; } if (!P.drag || !canWork()) return; const { x, y } = local(e), p = pieAt(x, y); if (!p) return; const st = stage();
    if ((st === 'sauce' || st === 'cheese') && P.drag === st) { if (S.strokeLast) S.strokeA = Math.atan2(p.y - S.strokeLast.y, p.x - S.strokeLast.x); S.strokeLast = p; paintWide(p, st); const tool = st === 'sauce' ? ladle : grater; tool.visible = true; tool.position.copy(p.w).setY(T + (st === 'sauce' ? 0.06 : 0.09)); tool.rotation.y = damp(tool.rotation.y, (S.strokeA || 0) * 0.3, 6, 0.016); if (st === 'cheese') dropShreds(V3(p.w.x, T + 0.08, p.w.z), 2); }
    else if (st === 'slice' && P.drag.x1 !== undefined) { P.drag.x2 = p.x; P.drag.y2 = p.y; } }
  function onUp(e) { if (tDrag) { const q = local(e); trayUp(q.x, q.y); return; } if (S.ptrBake) { S.ptrBake = false; bakeUp(); return; } if (!P.drag) return; ladle.visible = grater.visible = false; if (stage() === 'slice' && P.drag.x1 !== undefined) { cutUp(); return; } P.drag = null; }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- music + room sound (pies-audio.js): the music plays softly on the cards, full in the shift, and ducks while the oven is fired ----------
  const MZ = { on: opts.music !== false };
  function musicTick(dt) { SND.music(MZ.on && !PAUSE); SND.setDuck(S.baking ? 0.4 : (S.phase === 'intro' || S.phase === 'done') ? 0.55 : S.react ? 0.6 : 1); SND.update(dt); }
  // ---------- DEMO: an autopilot makes one whole pizza with captions (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, plan: null, planFor: '', bakeTo: null, made: 0 };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.22); hand.visible = false; hand.renderOrder = 24; scene.add(hand);
  const handTo = p => { hand.visible = true; hand.position.copy(p); hand.scale.setScalar(0.3); };
  const cap = (id, key, text) => { if (DM.seen[id]) return; DM.seen[id] = true; DM.cap = text; DM.key = key; };
  function paintPlan(inset) { const pts = [], m = meanR(); let row = 0; for (let y = -m; y <= m; y += 0.085, row++) { const line = []; for (let x = -m; x <= m; x += 0.085) { const a = Math.atan2(y, x); if (Math.hypot(x, y) < radiusAt(a) - inset - 0.035) line.push({ x: n3(x), y: n3(y) }); } if (row % 2) line.reverse(); pts.push(...line); } return pts; }
  function topPlan(k) { const side = sideOf(k), m = meanR(), ki = P.keys.indexOf(k), out = [];
    const ring = (n, r, a0, a1) => { for (let i = 0; i < n; i++) { const a = a0 + (i + 0.5) / n * (a1 - a0) + ki * 0.23; out.push({ x: n3(Math.cos(a) * r), y: n3(Math.sin(a) * r) }); } };
    if (side === 'whole') { ring(4, m * 0.33, 0, Math.PI * 2); ring(6, m * 0.66, 0.3, Math.PI * 2 + 0.3); }
    else { const c = side === 'left' ? Math.PI : 0; ring(4, m * 0.36, c - 1.2, c + 1.2); ring(6, m * 0.68, c - 1.35, c + 1.35); }
    return out.map(p => side === 'whole' ? p : { x: side === 'left' ? -Math.abs(p.x) - 0.04 : Math.abs(p.x) + 0.04, y: p.y }); }
  function demoAct() { const st = stage();
    if (S.card) { if (DM.made >= 1) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; setTimeout(() => DM.on && demoStop(), 2400); return 99; } nextOrder(); return 1; }
    if (S.react || PZ.userData.move || !S.ord || S.ord.st === 'walk') return 0.2;
    if (st === 'dough') { if (P.air) return 0.1; cap('dough', 'TAP', 'TAP THE YELLOW MARK. EACH TOSS STRETCHES THE DOUGH TOWARD THE WHITE RING'); const t = rotPt(P.target, P.spin); handTo(toW(t.x, t.y, 0.05)); toss(t); return 0.95; }
    if (st === 'sauce' || st === 'cheese') { if (DM.planFor !== st) { DM.plan = paintPlan(st === 'sauce' ? 0.06 : 0.08); DM.planFor = st; cap(st, 'DRAG', st === 'sauce' ? 'PRESS AND DRAG TO SAUCE IT. FILL TO THE DASHED CRUST LINE, NOT PAST IT' : 'SAME AGAIN WITH THE CHEESE. COVER IT ALL, STAY INSIDE THE LINE'); }
      for (let i = 0; i < 5 && DM.plan.length; i++) { const p = DM.plan.shift(); paint(p, st, i === 0); handTo(toW(p.x, p.y, 0.08)); const tool = st === 'sauce' ? ladle : grater; tool.visible = true; tool.position.copy(toW(p.x, p.y, st === 'sauce' ? 0.05 : 0.08)); if (st === 'cheese') dropShreds(toW(p.x, p.y, 0.07), 1); }
      if (!DM.plan.length) { ladle.visible = grater.visible = false; DM.planFor = ''; DM.cap = st === 'sauce' ? 'SAUCE DONE: TAP THE DONE BUTTON TO MOVE ON EARLY' : 'CHEESE DONE'; DM.key = 'DONE'; stageDone(); return 0.8; } return 0.05; }
    if (st.indexOf('top:') === 0) { const k = st.slice(4); if (DM.planFor !== st) { DM.plan = topPlan(k); DM.planFor = st; const side = sideOf(k); cap(st, 'TAP', side === 'whole' ? 'TAP TO PLACE TEN ' + TOPPINGS[k].name + '. SPREAD THEM OVER THE WHOLE PIE' : 'HALF AND HALF: TEN ' + TOPPINGS[k].name + ' ON THE ' + side.toUpperCase() + ' HALF ONLY'); }
      const p = DM.plan.shift(); if (p) { handTo(toW(p.x, p.y, 0.05)); place(p, k); } if (!DM.plan.length) DM.planFor = ''; return 0.16; }
    if (st === 'bake') { if (S.baking || P.bakeDone) return 0.1; cap('bake', 'HOLD', 'HOLD TO BAKE. LET GO WHEN THE BAR IS IN THE ORDERED BAND: ' + doneName(P.doneTarget)); handTo(V3(K.oven.x, T + 0.3, K.oven.z + 0.4)); DM.bakeTo = P.doneTarget; bakeDown(); return 0.1; }
    if (st === 'slice') { cap('slice', 'DRAG', 'DRAG STRAIGHT THROUGH THE MIDDLE: FOUR CUTS MAKE EIGHT SLICES'); const a = P.cuts.length * Math.PI / 4, L = meanR() * 1.15; P.drag = { x1: -Math.cos(a) * L, y1: -Math.sin(a) * L, x2: Math.cos(a) * L, y2: Math.sin(a) * L }; handTo(toW(P.drag.x2, P.drag.y2, 0.05)); DM.cutAnim = { t: 0, ...P.drag }; return 0.75; }
    if (st === 'serve') { cap('serve', 'SERVE', 'SERVE IT: THE STAGE SCORES ADD UP TO THE CUSTOMER\'S MOOD AND YOUR TIP'); DM.made++; serve(); return 1.2; }
    return 0.3; }
  function demoStep(dt) { hand.scale.setScalar(Math.max(0.16, hand.scale.x - dt * 0.4));
    if (S.baking && DM.bakeTo != null && P.cooked >= DM.bakeTo) { DM.bakeTo = null; bakeUp(); DM.cd = 0.9; return; }
    if (DM.cutAnim) { const c = DM.cutAnim; c.t += dt / 0.5; const k = Math.min(1, c.t); P.drag = { x1: c.x1, y1: c.y1, x2: c.x1 + (c.x2 - c.x1) * k, y2: c.y1 + (c.y2 - c.y1) * k }; hand.position.copy(toW(P.drag.x2, P.drag.y2, 0.05)); if (k >= 1) { DM.cutAnim = null; cutUp(); } return; }
    if (S.phase !== 'shift') return; DM.cd -= dt; if (DM.cd > 0) return; DM.cd = demoAct(); }
  function demoStart() { if (DM.on) return; wake(); Object.assign(DM, { on: true, seen: {}, plan: null, planFor: '', bakeTo: null, made: 0, cd: 1.6, cap: 'WATCH ONE PIZZA AT FOXY PIES', key: '', cutAnim: null, day0: S.day }); S.day = Math.max(S.day, 3); S.phase = 'intro'; S.done = null; S.demo = true; startShift(); }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; ladle.visible = grater.visible = false; S.day = DM.day0; S.phase = 'intro'; S.done = null; clearAll(); toIntro(); }

  // ---------- next-step hint (pulsing rings) ----------
  const RINGS = hintRings(ST); let hintT = 0, HINT = null;
  function nextHint() { if (S.phase !== 'shift' || S.react || S.card || PZ.userData.move || !S.ord) return null; const st = stage(), c = AT.board(), m = (P.sectors ? meanR() : 0.6) * R;
    if (st === 'dough') { if (P.air) return null; const t = rotPt(P.target, P.spin); return { p: toW(t.x, t.y, 0.0), r: 0.06, text: 'TAP THE YELLOW MARK · ' + (P.tossesAllowed - P.tosses) + ' TOSSES LEFT' }; }
    if (st === 'sauce') return { p: V3(c.x, T + 0.03, c.z), r: m, text: 'PRESS + DRAG TO SAUCE · FILL TO THE DASHED LINE' };
    if (st === 'cheese') return { p: V3(c.x, T + 0.03, c.z), r: m, text: 'PRESS + DRAG TO CHEESE · STAY INSIDE THE LINE' };
    if (st.indexOf('top:') === 0) { const k = st.slice(4), side = sideOf(k), left = P.req[k] - P.placed.filter(x => x.key === k).length; return { p: V3(c.x, T + 0.03, c.z), r: m * 0.7, text: 'TAP THE PIE OR DRAG FROM THE TRAY · ' + TOPPINGS[k].name + (side === 'whole' ? ' ALL OVER' : ' · ' + side.toUpperCase() + ' HALF ONLY') + ' · ' + left + ' LEFT' }; }
    if (st === 'bake') return { p: V3(K.oven.x, T + 0.02, K.oven.z + 0.6), r: 0.5, text: S.baking ? 'LET GO AT ' + doneName(P.doneTarget) : 'HOLD TO BAKE · AIM FOR ' + doneName(P.doneTarget) };
    if (st === 'slice') return { p: V3(c.x, T + 0.03, c.z), r: 0.06, text: 'DRAG THROUGH THE MIDDLE · ' + (P.cutsNeeded - P.cuts.length) + ' CUTS LEFT' };
    if (st === 'serve') return { p: V3(K.serve.x, K.pass.y, K.serve.z), r: 0.45, text: 'SERVE IT TO ' + CUST[P.ci].name };
    return null; }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0, PAUSE = false, faceT = 0;
  const lerpCam = (sh, k) => { camera.position.lerp(sh.pos, k); CAM.look.lerp(sh.look, k); };
  function step(dt) { const st = stage(), work = S.phase === 'shift';
    // camera
    if (S.react && S.ord) { S.react.t += dt; const f = S.ord.f.position, sh = shotFor('react' + S.ord.spot, () => [V3(f.x - 0.45, 1.25, f.z), V3(f.x + 0.45, 1.25, f.z), V3(f.x, 2.35, f.z), V3(f.x, 1.55, f.z - 0.3)], 0.12, 0.12, 0.1); lerpCam(sh, Math.min(1, dt * 5)); if (S.react.t > (DM.on ? 2.0 : 2.6)) reactDone(); }
    else if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); }
    else if ((S.phase === 'intro' || S.phase === 'done') && !DM.on) lerpCam(wideShot(), Math.min(1, dt * 4));
    else if (work || S.phase === 'glide') lerpCam(workShot(), Math.min(1, dt * 3.2));
    camera.lookAt(CAM.look);
    { const greet = S.phase === 'intro' || S.phase === 'done'; K.front.forEach(m => m.visible = !greet); K.booths.forEach(m => m.visible = !greet); const hide = (work || S.phase === 'glide') && st !== 'bake' && (CAM.t > 0.35 || !CAM.from); K.cut.forEach(m => m.visible = !hide); lampGl.forEach(s => s.visible = !hide); K.domeFront.visible = !((work && (st === 'bake' || (PZ.userData.move && PZ.userData.move.to.z < K.oven.z + 0.3))) && !S.react); }
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = '';
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    { const tt = clock.elapsedTime, heat = S.baking ? 1 : 0.55; K.flames.forEach((f, i) => { f.scale.set(1, (0.7 + Math.sin(tt * (9 + i) + i) * 0.18 + Math.random() * 0.1) * (0.8 + heat * 0.5), 1); }); ovenGlow.material.opacity = 0.3 + heat * 0.3 + Math.sin(tt * 13) * 0.05; if (K.mouthGlow) K.mouthGlow.material.opacity = 0.35 + heat * 0.4 + Math.sin(tt * 9) * 0.06; ovenLight.intensity = 1.6 + heat * 2.2 + Math.sin(tt * 11) * 0.3; }
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) { S.phase = 'shift'; flash('DOORS OPEN!', '#22c55e', 1.2); startOrder(); } }
    // the pie on the move (peel)
    const mv = PZ.userData.move; if (mv) { mv.t += dt / mv.dur; const k = Math.min(1, mv.t), e = smooth(0, 1, k); PZ.position.lerpVectors(mv.from, mv.to, e); PZ.position.y += Math.sin(k * Math.PI) * mv.arc; if (k >= 1) { PZ.userData.move = null; mv.done && mv.done(); } }
    if (work && S.ord) {
      S.t += dt; if (!S.card && !S.react) P.elapsed += dt;
      const timed = st === 'sauce' || st === 'cheese' || st.indexOf('top:') === 0;
      if (timed && !mv && !S.react) { const sec0 = Math.ceil(P.stageTime); P.stageTime -= dt; if (Math.ceil(P.stageTime) !== sec0 && sec0 <= 4 && sec0 > 1) SX('tick', { hi: sec0 <= 2 }); if (P.stageTime <= 0) { P.stageTime = 0; flash('TIME!', '#ec3013', 0.9); stageDone(); } }
      if (st === 'dough') { P.spin = (P.spin || 0) + (P.air ? dt * 1200 : dt * 70); if (P.air) { P.air.t += dt / 0.6; if (P.air.t >= 1) landToss(); } }
      if (S.baking) { P.cooked = Math.min(100, P.cooked + cfg(P.lvl).bakeSpeed * dt); if (!P.zoneCue && P.cooked >= P.doneTarget - P.zoneWidth / 2) { P.zoneCue = true; SX('tick', { hi: true }); } faceT -= dt; if (faceT <= 0) { faceT = 0.12; tintDough(); faceDirty = true; } if (Math.random() < dt * 4) puff(K.oven.x + rr(-0.3, 0.3), T + 0.5, K.oven.z + 0.4, 0x8a8a8a, 1); if (P.cooked >= 100) { tintDough(); bakeUp(); } }
    }
    // dough on the board / in the air
    { const lift = P.air ? Math.sin(Math.PI * P.air.t) : 0, maxR = P.sectors ? Math.max(...P.sectors) : 0.5; spinG.rotation.y = -(P.spin || 0) * Math.PI / 180; if (st === 'dough' && !mv) { PZ.position.y = T + 0.031 + lift * 0.5; PZ.scale.setScalar(1 + lift * 0.34 * Math.min(1, 0.72 / Math.max(0.3, maxR))); } else if (!mv) PZ.scale.setScalar(1); }
    { const showMark = work && st === 'dough' && !P.air && !mv && !S.react; mark.visible = showMark; if (showMark) { const t = rotPt(P.target, P.spin); mark.position.copy(toW(t.x, t.y, 0.03)); mark.scale.setScalar(1 + Math.sin(clock.elapsedTime * 8) * 0.12); }
      sizeRing.visible = work && st === 'dough'; if (sizeRing.visible) sizeRing.scale.setScalar(P.targetR * R); }
    // slicing: cutter wheel + the live cut line
    { const d = st === 'slice' && P.drag && P.drag.x1 !== undefined ? P.drag : null; cutter.visible = cutLine.visible = !!d; if (d) { const a = toW(d.x1, d.y1, 0.03), b = toW(d.x2, d.y2, 0.03), L = a.distanceTo(b); cutter.position.copy(b).setY(T + 0.1); cutter.rotation.y = Math.atan2(b.x - a.x, b.z - a.z); cutLine.position.copy(a).lerp(b, 0.5); cutLine.scale.set(Math.max(0.01, L), 1, 1); cutLine.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x); cutLine.material.color.set(Math.hypot(d.x2 - d.x1, d.y2 - d.y1) >= 0.2 ? 0xffd23a : 0xffffff); } }
    { const on = PZ.visible && (P.cooked || 0) > 25 && (st === 'slice' || st === 'serve'); steamS.forEach((s, i) => { s.visible = on; if (!on) return; const k = (clock.elapsedTime * 0.45 + i / 3) % 1; s.position.set(PZ.position.x + (i - 1) * 0.12, PZ.position.y + 0.05 + k * 0.4, PZ.position.z); s.material.opacity = 0.4 * Math.sin(k * Math.PI); s.scale.setScalar(0.12 + k * 0.2); }); }
    for (const m of topsG.children) if (m.userData.drop != null && m.userData.drop < 1) { const d = m.userData.drop = Math.min(1, m.userData.drop + dt / (m.userData.fly ? 0.3 : 0.22)), e = 1 - Math.pow(1 - d, 3); if (m.userData.fly) { if (!m.userData.to) m.userData.to = m.position.clone(); m.position.lerpVectors(m.userData.fly, m.userData.to, smooth(0, 1, d)); m.position.y += Math.sin(d * Math.PI) * 0.14; m.rotation.z = (1 - d) * 2.5; } else m.position.y = 0.012 + (1 - e) * 0.13; m.scale.setScalar(d < 1 ? 1 + Math.sin(d * Math.PI) * 0.18 : 1); if (d >= 1 && !m.userData.landed) { m.userData.landed = 1; SX('pat', { pitch: 0.85 + Math.random() * 0.35, gap: 0 }); puff(PZ.position.x + m.position.x, PZ.position.y + 0.02, PZ.position.z + m.position.z, 0xfff3d0, 1); } }
    trayStep(dt);
    for (const q of sparks) { if (q.life <= 0) { q.sp.visible = false; continue; } q.life -= dt * 1.6; q.v.y -= dt * 1.6; q.sp.position.addScaledVector(q.v, dt); q.sp.material.opacity = Math.min(1, q.life * 1.5); q.sp.material.rotation += dt * 4; q.sp.scale.setScalar(q.sz * (0.6 + q.life * 0.6)); }
    if (S.baking && Math.random() < dt * 14) { const q = embers[emI = (emI + 1) % embers.length]; q.sp.visible = true; q.sp.position.set(K.oven.x + rr(-0.45, 0.45), T + 0.1, K.oven.z + rr(-0.5, 0.1)); q.v.set(rr(-0.05, 0.05), rr(0.3, 0.6), rr(-0.03, 0.05)); q.life = 1; }
    for (const q of embers) { if (q.life <= 0) { q.sp.visible = false; continue; } q.life -= dt * 0.9; q.sp.position.addScaledVector(q.v, dt); q.sp.position.x += Math.sin(clock.elapsedTime * 7 + q.v.x * 50) * dt * 0.05; q.sp.material.opacity = q.life; q.sp.scale.setScalar(0.03 + q.life * 0.03); }
    for (const s2 of shreds) { if (s2.life <= 0) continue; s2.life -= dt * 2.2; s2.v.y -= dt * 2.5; s2.m.position.addScaledVector(s2.v, dt); s2.m.rotation.x += dt * 6; if (s2.m.position.y < PZ.position.y + 0.015 || s2.life <= 0) { s2.life = 0; s2.m.visible = false; } }
    peel.visible = !!PZ.userData.move && PZ.visible; if (peel.visible) { peel.position.set(PZ.position.x, PZ.position.y - 0.006, PZ.position.z); peel.rotation.y = Math.atan2(PZ.userData.move.from.x - PZ.userData.move.to.x, PZ.userData.move.from.z - PZ.userData.move.to.z) || 0; }
    if (cutter.visible) cutter.userData.wheel.rotation.x -= dt * 14;
    if (ladle.visible) { const d = ladle.userData.drip; d.position.y = -0.008 - ((clock.elapsedTime * 1.5) % 1) * 0.04; d.scale.setScalar(1 - ((clock.elapsedTime * 1.5) % 1) * 0.6); }
    if (boxG.visible) { const lid = boxG.userData.lid; lid.rotation.x = damp(lid.rotation.x, boxG.userData.close ? 0 : -1.9, 8, dt); }
    // customers
    const all = [S.ord, ...S.queue].filter(o => o && o.st !== 'gone'); for (const o of [...all, ...(S.leaving || [])]) { const sp = K.spots[o.spot]; o.t = (o.t || 0) + dt; kit.animFox && kit.animFox(o.f, dt, o.st === 'walk' || o.st === 'leave' ? 2 : 0);
      if (o.st === 'walk') { o.f.position.x = damp(o.f.position.x, sp.x, 2.4, dt); o.f.position.z = damp(o.f.position.z, sp.z, 2.4, dt); o.f.rotation.y = Math.PI; if (Math.hypot(o.f.position.x - sp.x, o.f.position.z - sp.z) < 0.08) { o.st = 'wait'; if (o === S.ord) { say(CUST[o.ci].name + ': "' + pick(ORDER_LINES) + ' One ' + P.order.toLowerCase() + ', please."', 3.5); SX('chime'); } } }
      else if (o.st === 'leave') { o.f.rotation.y = 0; o.f.position.z += dt * 2.2; if (o.t > 2.6) { o.f.visible = false; o.gone = true; } } }
    if (S.ord && S.ord.st === 'leave') { (S.leaving = S.leaving || []).push(S.ord); S.ord = { ...S.ord, st: 'gone', f: S.ord.f }; } if (S.leaving) S.leaving = S.leaving.filter(o => !o.gone);
    // Ben waves on the welcome + day cards
    const greet = S.phase === 'intro' || S.phase === 'done'; ben.rotation.y = damp(ben.rotation.y, 0.3, 4, dt); ben.userData.mood = greet ? 'excited' : 'happy'; kit.animFox && kit.animFox(ben, dt, 0);
    if (greet && BP.arms && BP.arms[0]) { const w = performance.now() / 1000; BP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(w * 7) * 0.32); }
    lampGl.forEach((s, i) => s.material.opacity = 0.5 + Math.sin(clock.elapsedTime * 2 + i) * 0.04);
    if (DM.on) demoStep(dt);
    hintT += dt; HINT = nextHint(); { const big = HINT && HINT.r > 0.2 && /SAUCE|CHEESE|TAP THE PIE/.test(HINT.text || ''); RINGS.place(HINT && !big && (!DM.on || hand.visible) ? HINT : null, hintT, dt); }
    if (faceDirty) drawFace(); musicTick(dt); }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.08; emit(); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onVis = () => { const h = document.hidden; try { audio.ctx && (h ? audio.ctx.suspend() : audio.ctx.resume()); } catch (e) {} if (h && S.baking) bakeUp(); }; document.addEventListener('visibilitychange', onVis);

  // ---------- HUD state for the page ----------
  const STAGE_TXT = { dough: ['TAP TO TOSS', 'Five tosses fill the ring, if you catch the moving mark every time.'], sauce: ['PRESS TO SAUCE', 'Fill to the crust line. It flares red if you go over.'], cheese: ['PRESS TO CHEESE', 'Same again: fill to the crust line, not past it.'], bake: ['HOLD TO BAKE', 'Stop inside the ordered band.'], slice: ['DRAG TO CUT', 'Four cuts through the middle. No clock, take your aim.'], serve: ['SERVE IT UP', 'Hand it over.'] };
  const SHORT = s => s === 'dough' ? 'DOUGH' : s === 'sauce' ? 'SAUCE' : s === 'cheese' ? 'CHEESE' : s === 'bake' ? 'BAKE' : s === 'slice' ? 'SLICE' : s === 'serve' ? 'SERVE' : s.indexOf('top:') === 0 ? { pepperoni: 'PEPP', mushroom: 'MUSH', olive: 'OLIVE', pepper: 'PEPPER', onion: 'ONION' }[s.slice(4)] : '';
  function hud() { const st = stage(), isTop = st.indexOf('top:') === 0, tk = isTop ? st.slice(4) : null, live = S.phase === 'shift' && S.ord && P.stages && P.stages[0] !== 'none';
    let label = '', hint = ''; if (isTop) { const side = sideOf(tk); label = (side === 'whole' ? '' : side.toUpperCase() + ' HALF · ') + P.req[tk] + ' ' + TOPPINGS[tk].name; hint = side === 'whole' ? 'Tap to place. Spread them over the whole pie.' : 'Half and half: keep all ten on the ' + side + ' side.'; } else if (STAGE_TXT[st]) [label, hint] = STAGE_TXT[st];
    const mean = P.sectors ? meanR() : 0, placedOf = k => (P.placed || []).filter(x => x.key === k).length, timed = st === 'sauce' || st === 'cheese' || isTop;
    let status = ''; if (st === 'dough') status = 'WIDTH ' + Math.round(mean / P.targetR * 100) + '% OF ORDERED' + (P.lastErr == null ? '' : ' · LAST TAP ' + (P.lastErr < 0.1 ? 'DEAD ON' : P.lastErr < 0.22 ? 'CLOSE' : 'WIDE, DOUGH PULLED'));
    else if (st === 'slice') status = P.cuts.length + ' OF ' + P.cutsNeeded + ' CUTS · ' + P.cutsNeeded * 2 + ' SLICES WHEN DONE'; else if (st === 'bake') status = 'ORDERED ' + doneName(P.doneTarget) + ' · NOW ' + doneName(P.cooked); else if (isTop) status = placedOf(tk) + ' PLACED · UP TO 10'; else if (live) status = CUST[P.ci].name + ' IS WAITING';
    const vals = Object.values(P.scores || {}), avgNow = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0, md = moodOf(avgNow);
    const half = (P.zoneWidth || 0) / 2, z0 = Math.max(0, (P.doneTarget || 0) - half), z1 = Math.min(100, (P.doneTarget || 0) + half);
    return { phase: S.phase, day: S.day, orderNo: Math.min(S.oi + 1, ordersToday()), orders: ordersToday(), earned: S.earned, tips: S.tips, served: S.served, combo: S.combo, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, gold: save.data.gold,
      ticket: live ? { who: CUST[P.ci].name, pie: P.order, size: P.targetR > 0.85 ? 'FAMILY SIZE' : P.targetR < 0.75 ? 'PERSONAL SIZE' : 'REGULAR', slices: P.cutsNeeded * 2, done: doneName(P.doneTarget) + ' (' + P.doneTarget + '%)', waiting: S.ord.st === 'walk',
        reqs: P.keys.map(k => { const side = sideOf(k), got = placedOf(k), active = tk === k, passed = P.stages.indexOf('top:' + k) < P.stageIndex; return { name: (side === 'whole' ? '' : side.toUpperCase() + ' / ') + TOPPINGS[k].name, tally: got + ' / ' + P.req[k], col: TOPPINGS[k].fill, state: got >= P.req[k] || passed ? 'done' : active ? 'now' : 'todo' }; }) } : null,
      stage: live ? { id: isTop ? 'top' : st, n: P.stageIndex + 1, of: P.stages.length, label, hint, timed, left: Math.ceil(P.stageTime), frac: timed ? Math.max(0, P.stageTime / cfg(P.lvl).stageTime) : 0, urgent: timed && P.stageTime <= 3, canDone: (timed || st === 'dough') && !S.react && !PZ.userData.move, doneLabel: st === 'dough' ? 'DOUGH DONE' : isTop ? TOPPINGS[tk].name.split(' ').pop() + ' DONE' : st === 'sauce' ? 'SAUCE DONE' : st === 'cheese' ? 'CHEESE DONE' : '',
        tosses: st === 'dough' ? P.tossesAllowed - P.tosses : null, cuts: st === 'slice' ? P.cutsNeeded - P.cuts.length : null, left10: isTop ? P.req[tk] - placedOf(tk) : null, status, mood: md[1], moodCol: md[3], avgNow,
        strip: P.stages.map((s, i) => ({ t: SHORT(s), state: i < P.stageIndex ? 'done' : i === P.stageIndex ? 'now' : 'todo', score: i < P.stageIndex && P.scores ? null : null })) } : null,
      bake: live && st === 'bake' ? { on: S.baking, d: P.cooked / 100, now: doneName(P.cooked), want: doneName(P.doneTarget), pct: Math.round(P.cooked), zones: [{ w: z0, col: '#5a5650', want: false }, { w: z1 - z0, col: '#22c55e', want: true }, { w: 100 - z1, col: '#ec3013', want: false }], inZone: P.cooked >= z0 && P.cooked <= z1 } : null,
      serveBtn: live && st === 'serve' && !S.react && !S.card && !PZ.userData.move ? 'SERVE ' + CUST[P.ci].name : '',
      react: S.react ? { word: S.react.word, col: S.react.col, who: S.react.who, line: S.react.line, stars: S.react.stars, tip: S.react.tip } : null,
      card: S.card ? { word: S.card.word, mood: S.card.mood, col: S.card.col, who: S.card.who, avg: S.card.avg, price: S.card.price, tip: S.card.tip, speed: S.card.speed, mult: S.card.mult.toFixed(2), stars: S.card.stars, rows: S.card.rows, last: S.oi + 1 >= ordersToday() } : null,
      flash: S.flash, say: S.say, done: S.done, uniform: !!save.flag('piesUniform'), upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), music: MZ.on, sound: !audio.muted,
      demo: DM.on ? { cap: DM.cap, key: DM.key } : null, hint: HINT && !DM.on ? HINT.text : '' }; }
  function emit() { onState(hud()); }
  clearAll(); frame();
  return { setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    startShift, demoStart, demoStop, toIntro, buyUpgrade, hud, nextOrder, serve, bakeDown, bakeUp, stageDone: () => { if (canWork()) { const st = stage(); if (st === 'sauce' || st === 'cheese' || st === 'dough' || st.indexOf('top:') === 0) stageDone(); } },
    toggleMusic() { MZ.on = !MZ.on; wake(); }, toggleSound() { audio.setMuted && audio.setMuted(!audio.muted); if (audio.muted) SND.stopAll(); else wake(); return !audio.muted; }, setPaused(v) { PAUSE = !!v; }, K,
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); emit(); }, _state: () => ({ S, P, DM }), _cam: () => ({ cam: camera.position.toArray().map(v => +v.toFixed(2)), look: CAM.look.toArray().map(v => +v.toFixed(2)), pz: PZ.position.toArray().map(v => +v.toFixed(2)), pzVis: PZ.visible, safe: { ...SAFE }, board: [B.x, B.z], oven: [K.oven.x, K.oven.z], scr: scr(PZ.position.clone()) }),
    _auto() { return { toss, landToss, paint, place, stageDone, bakeDown, bakeUp, cutUp, serve, nextOrder, rotPt, toW, scr, pieAt, radiusAt, meanR, topPlan, paintPlan }; },
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); SND.stopAll(); document.removeEventListener('visibilitychange', onVis); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
}
