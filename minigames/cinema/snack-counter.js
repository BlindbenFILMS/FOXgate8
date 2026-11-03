// 8 GATES — FOX CINEMA · THE SNACK COUNTER [foxCinema]. A drop-in interior for ANY world: a lobby with the snack counter,
// a ticket podium, posters, and SCREEN 1 (seats + a glowing screen that plays a little cartoon). Ben can walk it freely
// (Game HUD, joystick, TALK), sit down and watch the movie, or talk to REEL (owner, projectionist) for a shift.
// THE SHIFT: the rush before showtime. A 3-minute DOORS countdown; popcorn is the star:
//   KETTLE: tap the kernel scoop → STIR (draw circles on the kettle) → pull the red DUMP lever when the popping slows.
//   BUCKET: tap S / M / L → HOLD the scoop, let go in the green → PUMP butter → SHAKE a flavour → tap the bucket = tray.
//   DRINKS: tap a tap → HOLD to pour, let go at the line (foam!) · SLUSHIE (day 3) · CANDY wall (day 2, tap the box)
//   HOT DOGS (day 3): load the roller, tap when golden, ZIGZAG the mustard/ketchup · NACHOS (day 4): HOLD the cheese pump.
//   SERVE: drag the tray onto the customer → reaction → give the change (coins) → they go in to the movie.
// Pay = wage + prices + tips, employee of the day, the usher uniform, kettle upgrades. WATCH THE DEMO plays it by autopilot.
// MERGE INTO A WORLD: buildCinema(ctx) builds the whole interior at ctx.origin from a Meru-style ctx
// ({ THREE, M, toon, canvasTex, scene, grad, addOutline, origin }) and returns colliders (Meru format, world coords),
// the entrance, NPC spots, seats and an update(dt) for the movie screen. createSnackCounter({ container, onState }) runs it stand-alone.
import * as THREE from '../../vendor/three/three.module.js';
import { rr, clamp, damp, smooth, pick } from '../../village-game.js';
import { canvasTex } from '../../meru-game.js';
import { CAST } from '../../engine/cast.js';
import { save } from '../../engine/save.js';
import { createStage, cameraFit, hintRings, registerKit, dinerUniform } from '../../engine/restaurant-kit.js';
import { createCinemaAudio } from './cinema-audio.js';

export const CINEMA = { name: 'FOX CINEMA', room: 'foxCinema', shift: 180, w: 23, d: 11 };
const SAVE = { day: 'cinema.snack.day', best: 'cinema.snack.best', upg: 'cinema.snack.upg.', stars: 'cinema.snack.stars', uni: 'cinemaUniform' };
// ---------------- menu (prices in gold) ----------------
export const SIZES = { S: { name: 'SMALL', cost: 1, r: 0.085, h: 0.18, price: 4, day: 1 }, M: { name: 'MEDIUM', cost: 2, r: 0.1, h: 0.23, price: 6, day: 1 }, L: { name: 'LARGE', cost: 3, r: 0.115, h: 0.28, price: 8, day: 2 } };
export const BUTTER = { 0: 'NO BUTTER', 2: 'BUTTER', 4: 'EXTRA BUTTER' };
export const FLAVORS = { cheese: { name: 'CHEESE', col: '#f59e0b', day: 3, price: 1 }, caramel: { name: 'CARAMEL', col: '#a0612a', day: 3, price: 1 } };
export const DRINKS = { cola: { name: 'FOX COLA', col: '#4a2416', day: 1, price: 3 }, orange: { name: 'ORANGE FIZZ', col: '#ff8a1a', day: 1, price: 3 }, grape: { name: 'GRAPE POP', col: '#7c3aed', day: 2, price: 3 },
  blue: { name: 'BLUE SLUSH', col: '#38bdf8', day: 3, price: 4, slush: true }, cherry: { name: 'CHERRY SLUSH', col: '#ef4444', day: 3, price: 4, slush: true } };
export const CANDY = { bites: { name: 'FOX BITES', col: '#c42d3c', price: 3 }, gummy: { name: 'GATE GUMMIES', col: '#22a35a', price: 3 }, chews: { name: 'STAR CHEWS', col: '#2563eb', price: 3 }, moons: { name: 'CHOCO MOONS', col: '#6b3a1e', price: 3 } };
export const DOGS = { plain: 'PLAIN', mustard: 'MUSTARD', ketchup: 'KETCHUP' };
export const UNLOCK = { candy: 2, dog: 3, slush: 3, flavor: 3, nachos: 4 };
export const UPGRADES = [
  { id: 'bigKettle', name: 'BIG KETTLE', cost: 40, line: 'Every batch fills 8 servings, not 6.' },
  { id: 'stirrer', name: 'AUTO STIRRER', cost: 50, line: 'The kettle scorches half as fast.' },
  { id: 'fastFount', name: 'FAST FOUNTAIN', cost: 35, line: 'Drinks and slushies pour faster.' },
  { id: 'warmer', name: 'DOG WARMER', cost: 30, line: 'Golden hot dogs stay golden much longer.' },
  { id: 'marquee', name: 'MARQUEE LIGHTS', cost: 60, line: 'Customers wait 20% longer.' }];
// invented regulars (world-agnostic: a world can pass its own list to createSnackCounter / the page)
export const CUSTOMERS = [
  { name: 'FERN', torso: ['#22c55e', '#dcfce7', '#14532d'] }, { name: 'BOLT', torso: ['#f59e0b', '#fef3c7', '#78350f'] }, { name: 'JUNIPER', torso: ['#a78bfa', '#ede9fe', '#4c1d95'] },
  { name: 'MOSS', torso: ['#2f5d2a', '#e6b45a', '#1a3318'] }, { name: 'PIP', torso: ['#38bdf8', '#e0f2fe', '#0369a1'] }, { name: 'SABLE', torso: ['#1f2937', '#e6b45a', '#111827'], outfit: 'coat' },
  { name: 'RUSTY', torso: ['#c2410c', '#ffedd5', '#7c2d12'] }, { name: 'DOT', torso: ['#f472b6', '#fce7f3', '#9d174d'] }, { name: 'WREN', torso: ['#94a3b8', '#f1f5f9', '#334155'], outfit: 'coat' },
  { name: 'BISCUIT', torso: ['#e6c08a', '#fff7e6', '#8a5a32'] }];
// talk data, also exported so a world's own dialogue system can use it (choice.do === 'work' → open the shift)
export const CINEMA_DIALOGUE = {
  reel: { name: 'REEL', role: 'Fox Cinema · owner', lines: ['Welcome to FOX CINEMA! Doors open soon and the line is already out the front. Any chance you want a shift on the snack counter?'], choices: [
    { label: 'Put me to work!', replies: ['Ha! I knew it. Apron is on the hook. The popcorn kettle is the heart of this place: keep it stirring and it will never let you down.'], do: 'work' },
    { label: 'How do I make the popcorn?', replies: ['Tap the kernel scoop and it goes in the kettle. Then STIR: draw circles on the kettle with your finger. Stop and it scorches.', 'When the popping slows right down, pull the red lever and DUMP it. Too early and you get a bowl of old maids. Too late and it is charcoal.', 'Then hold the scoop over a bucket and let go at the line. Butter pump if they ask. That is the whole art.'] },
    { label: 'What is playing tonight?', replies: ['SPACE FOX II. Lasers, a cat with a jetpack, and a twist I am not allowed to spoil.', 'SCREEN 1 is through the curtains on the right. Grab a seat if you want a peek.'] },
    { label: 'Maybe later.', bye: true, replies: ['Kettle is always hot. Come back when you want the work.'] }] },
  stub: { name: 'STUB', role: 'Tickets', lines: ['Ticket? Oh, you are with Reel. Go on through.', 'No talking during the trailers. That is the only rule I have and I will enforce it.', 'Row C is the best seat in the house. Do not tell anyone I said that.'] },
  poster: { name: 'NOW SHOWING', role: 'Posters', lines: ['SPACE FOX II: The Cat Strikes Back.', 'THE NINE GATES: Every door has a key.', 'IRON WARDEN: He never blinks.', 'LOVE IN MERU: A tavern romance.'] } };
// the people a world places in the interior (positions come from cinemaSpots(K))
export const CINEMA_PEOPLE = [
  { key: 'cinemaReel', name: 'Reel', role: 'Fox Cinema', outfit: 'vest', torso: ['#c42d3c', '#ffd23a', '#7a1522'], crest: '8', fur: ['#d9822b', '#9a5414'], mood: 'happy', spot: 'reel', talk: 'reel' },
  { key: 'cinemaStub', name: 'Stub', role: 'Tickets', outfit: 'coat', torso: ['#1f2937', '#e6b45a', '#111827'], crest: '', fur: ['#8a8f99', '#5b606a'], mood: 'neutral', spot: 'stub', talk: 'stub' }];
// every point a world needs, in WORLD coordinates (K from buildCinema)
export function cinemaSpots(K) { const W = (p, face) => ({ x: K.OX + p.x, z: K.OZ + p.z, ...(face != null ? { face } : {}) }); return {
  door: K.DOOR, enter: K.ENTER, reel: W(K.reel, K.reel.face), stub: W(K.stub, K.stub.face), sit: { x: K.sitSpot.x, z: K.sitSpot.z, y: K.sitSpot.y, stand: K.sitSpot.stand, face: Math.PI / 2 },
  posters: { x: K.OX - 6.2, z: K.OZ + 0.25 }, screenDoor: W(K.screenDoor), counter: W({ x: 0, z: K.z }), screen: W({ x: K.screen.x, z: K.screen.z }), size: { w: CINEMA.w, d: CINEMA.d } }; }
const LINES = { order: ['Before the trailers start, please!', 'Movie snacks, go!', 'Is it SPACE FOX II tonight?', 'The smell of that popcorn!', 'Quick, the lights are dimming!'],
  angry: ['I am missing the trailers!', 'Forget it, I will eat in the dark.'] };
const REACT = { thrilled: { word: 'THRILLED!', col: '#22c55e', mood: 'excited', lines: ['Best popcorn in the whole galaxy!', 'This is better than the movie!', 'Perfect. Absolutely perfect.'] },
  happy: { word: 'HAPPY', col: '#7dd3fc', mood: 'happy', lines: ['Smells amazing, thank you!', 'Just how I like it.', 'Great, the trailers have not started!'] },
  neutral: { word: 'NEUTRAL', col: '#e6b45a', mood: 'neutral', lines: ['It is fine. Took a while.', 'Okay. Thanks.', 'Hm. Not bad.'] },
  unhappy: { word: 'UNHAPPY', col: '#ff9a8a', mood: 'sad', lines: ['Half my snacks are missing...', 'This is not what I asked for.', 'I waited for this?'] },
  insulted: { word: 'INSULTED!', col: '#ec3013', mood: 'angry', lines: ['That is NOT my order!', 'Do I look like I ordered that?', 'Were you even listening?'] } };

// ---------------- little art kit (shared by the counter, the trays and the demo) ----------------
// the 8 crest (Ben's armour crest: sky-blue ring, night core, white 8) with a gold rim, drawn into packaging
export function crest8(c, x, y, r, sx = 1) { c.save(); c.translate(x, y); c.scale(sx, 1);
  c.fillStyle = '#e6b45a'; c.beginPath(); c.arc(0, 0, r, 0, 7); c.fill(); c.fillStyle = '#201e1d'; c.beginPath(); c.arc(0, 0, r * 0.93, 0, 7); c.fill();
  c.fillStyle = '#38bdf8'; c.beginPath(); c.arc(0, 0, r * 0.87, 0, 7); c.fill(); c.fillStyle = '#070a13'; c.beginPath(); c.arc(0, 0, r * 0.7, 0, 7); c.fill();
  c.fillStyle = '#ffffff'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; c.beginPath(); c.arc(Math.cos(a) * r * 0.785, Math.sin(a) * r * 0.785, r * 0.035, 0, 7); c.fill(); }
  c.font = '900 ' + Math.round(r * 1.05) + 'px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = r * 0.12; c.strokeStyle = '#38bdf8'; c.strokeText('8', 0, r * 0.06); c.fillStyle = '#ffffff'; c.fillText('8', 0, r * 0.06); c.restore(); }
// wrap-around print: a crest on the front (u 0.5, faces the worker) and the back (u 0, faces the customer)
const wrapCrest = (c, w, h, cy, r, sx) => { crest8(c, w * 0.5, cy, r, sx); crest8(c, 0, cy, r, sx); crest8(c, w, cy, r, sx); };
const bucketTex = () => canvasTex(512, 256, (c, w, h) => { const n = 16; for (let i = 0; i < n; i++) { c.fillStyle = i % 2 ? '#fbfbf7' : '#c42d3c'; c.fillRect(i * w / n, 0, w / n + 1, h); }
  c.fillStyle = '#e6b45a'; c.fillRect(0, 0, w, 14); c.fillStyle = '#201e1d'; c.fillRect(0, 14, w, 3); c.fillStyle = '#8f1d2a'; c.fillRect(0, h - 16, w, 16);
  for (const bx of [w * 0.5, 0, w]) { c.fillStyle = '#ffd23a'; c.fillRect(bx - 66, 182, 132, 30); c.fillStyle = '#201e1d'; c.fillRect(bx - 66, 182, 132, 3); c.fillRect(bx - 66, 209, 132, 3); c.fillStyle = '#c42d3c'; c.font = 'italic 900 24px Archivo, "Arial Black", Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('POPCORN', bx, 198); }
  wrapCrest(c, w, h, 104, 62, 0.82); });
const cupTex = (slush) => canvasTex(512, 256, (c, w, h) => { if (!slush) { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, w, h); c.fillStyle = '#c42d3c'; c.fillRect(0, 60, w, 150); c.fillStyle = '#e6b45a'; c.fillRect(0, 52, w, 8); c.fillRect(0, 210, w, 8);
    c.fillStyle = 'rgba(255,255,255,0.18)'; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(i * 32, 60); c.lineTo(i * 32 + 14, 60); c.lineTo(i * 32 - 30, 210); c.lineTo(i * 32 - 44, 210); c.fill(); } }
  else { c.clearRect(0, 0, w, h); c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(0, 40, w, 4); c.fillRect(0, 228, w, 4); }
  wrapCrest(c, w, h, 134, 60, 0.7); });
const strawTex = () => canvasTex(32, 128, (c, w, h) => { c.fillStyle = '#fbfbf7'; c.fillRect(0, 0, w, h); c.fillStyle = '#c42d3c'; for (let i = -2; i < 12; i++) { c.save(); c.translate(0, i * 14); c.transform(1, 0.5, 0, 1, 0, 0); c.fillRect(0, 0, w, 6); c.restore(); } });
// one popped kernel: a lumpy puff, cream with a golden hull at the bottom (vertex colours)
function kernelGeo(T3, r) { const g = new T3.IcosahedronGeometry(r, 1), p = g.attributes.position, cols = []; const cr = new T3.Color('#fff6e0'), hull = new T3.Color('#e9a93a'), sh = new T3.Color('#f6e2b5');
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.32 * Math.sin(x * 160 + 1.3) * Math.sin(y * 150 + 0.7) * Math.sin(z * 170 + 2.1) + 0.18 * Math.sin((x + z) * 90); p.setXYZ(i, x * n, y * n * 0.82, z * n); const c = y < -r * 0.55 ? hull : y < -r * 0.15 ? sh : cr; cols.push(c.r, c.g, c.b); }
  g.setAttribute('color', new T3.Float32BufferAttribute(cols, 3)); g.computeVertexNormals(); return g; }
export function cinemaArt(T3, toon, outline, grad) {
  const BUCKET = bucketTex(), CUP = cupTex(false), CUPS = cupTex(true), STRAW = strawTex(), cache = {};
  const bumpy = (r, seg = 14) => { const g = new T3.SphereGeometry(r, seg, 8, 0, Math.PI * 2, 0, Math.PI / 2), p = g.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), n = 1 + 0.16 * Math.sin(x * 90 + z * 40) * Math.cos(z * 80 - y * 50) + (y < r * 0.15 ? -0.05 : 0); p.setXYZ(i, x * n, y * n * 0.75, z * n); } g.computeVertexNormals(); return g; };
  const piece = cache.piece = kernelGeo(T3, 0.03), pieceMat = new T3.MeshToonMaterial({ color: '#ffffff', vertexColors: true, gradientMap: grad || null });
  const toonV = col => { const m = pieceMat.clone(); m.color.set(col); return m; };
  function bucket(size, o = {}) { const S = SIZES[size], g = new T3.Group();
    const body = new T3.Mesh(new T3.CylinderGeometry(S.r, S.r * 0.7, S.h, 24, 1, true), new T3.MeshToonMaterial({ map: BUCKET, side: T3.DoubleSide, gradientMap: grad || null })); body.position.y = S.h / 2; if (outline) outline(body, 0.006, S.r); g.add(body);
    const rim = new T3.Mesh(new T3.TorusGeometry(S.r, 0.006, 6, 24), toon('#e6b45a')); rim.rotation.x = Math.PI / 2; rim.position.y = S.h; g.add(rim);
    const bot = new T3.Mesh(new T3.CircleGeometry(S.r * 0.7, 18).rotateX(-Math.PI / 2), toon('#8f1d2a')); bot.position.y = 0.003; g.add(bot);
    const cornMat = toonV('#ffffff'), plainMat = new T3.MeshToonMaterial({ color: '#fff3d6', gradientMap: grad || null }), corn = new T3.Group(); corn.position.y = S.h * 0.97; corn.visible = false; g.add(corn);
    const dome = new T3.Mesh(bumpy(S.r * 0.95), plainMat); dome.scale.y = 0.8; corn.add(dome);
    { const n = 34, im = new T3.InstancedMesh(piece, cornMat, n), m = new T3.Matrix4(), q = new T3.Quaternion(), e = new T3.Euler(); for (let i = 0; i < n; i++) { const a = i * 2.39996, rr2 = Math.sqrt((i + 0.5) / n) * S.r * 0.95, y = Math.sqrt(Math.max(0, 1 - (rr2 / (S.r * 1.02)) ** 2)) * S.r * 0.62; e.set(a * 3, a * 5, a); q.setFromEuler(e); m.compose(new T3.Vector3(Math.cos(a) * rr2, y, Math.sin(a) * rr2), q, new T3.Vector3(1, 1, 1).multiplyScalar(S.r / 0.09)); im.setMatrixAt(i, m); } corn.add(im); }
    const fillM = new T3.Mesh(new T3.CylinderGeometry(S.r * 0.97, S.r * 0.7, 1, 18), plainMat); fillM.visible = false; g.add(fillM);
    g.userData = { S, corn, fillM, set(fill, butter = 0, flavor = null, flv = 0) { const f = clamp(fill, 0, 1.25); fillM.visible = f > 0.02; fillM.scale.y = Math.max(0.001, S.h * Math.min(1, f)); fillM.position.y = S.h * Math.min(1, f) / 2;
      corn.visible = f > 0.82; corn.scale.setScalar(clamp((f - 0.82) / 0.18, 0.35, 1.15)); const base = new T3.Color('#ffffff'); if (butter) base.lerp(new T3.Color('#ffd166'), Math.min(1, butter / 4) * 0.45); if (flavor) base.lerp(new T3.Color(FLAVORS[flavor].col), Math.min(1, flv) * 0.75); cornMat.color.copy(base); plainMat.color.copy(new T3.Color('#fff3d6').multiply(base)); } };
    return g; }
  function cup(k, o = {}) { const D = DRINKS[k] || DRINKS.cola, g = new T3.Group(), slush = !!D.slush, R = 0.062, Rb = 0.045, Hc = 0.2;
    const c = new T3.Mesh(new T3.CylinderGeometry(R, Rb, Hc, 24, 1, true), new T3.MeshToonMaterial({ map: slush ? CUPS : CUP, gradientMap: grad || null, side: T3.DoubleSide, transparent: slush, color: slush ? '#e8f6ff' : '#ffffff', opacity: slush ? 0.62 : 1, depthWrite: !slush })); c.position.y = Hc / 2; if (outline) outline(c, 0.005, R); g.add(c);
    if (slush) { const dec = new T3.Mesh(new T3.CylinderGeometry(R * 1.003, Rb * 1.003, Hc, 24, 1, true), new T3.MeshBasicMaterial({ map: CUPS, transparent: true, depthWrite: false })); dec.position.y = Hc / 2; dec.renderOrder = 3; g.add(dec); }
    const lip = new T3.Mesh(new T3.TorusGeometry(R, 0.005, 6, 24), toon(slush ? '#e0f2fe' : '#fbfbf7')); lip.rotation.x = Math.PI / 2; lip.position.y = Hc; g.add(lip);
    const bot = new T3.Mesh(new T3.CircleGeometry(Rb, 18).rotateX(-Math.PI / 2), toon(slush ? '#cfe8f7' : '#e8e4da')); bot.position.y = 0.003; g.add(bot);
    const liq = new T3.Mesh(new T3.CylinderGeometry(R * 0.95, Rb * 0.95, 1, 18), toon(D.col)); liq.visible = false; g.add(liq);
    const foam = new T3.Mesh(slush ? new T3.SphereGeometry(R * 0.95, 16, 6, 0, Math.PI * 2, 0, Math.PI / 2) : new T3.CylinderGeometry(R * 0.97, R * 0.95, 1, 18), toon(slush ? new T3.Color(D.col).lerp(new T3.Color('#ffffff'), 0.35).getStyle() : '#fff8e8')); foam.visible = false; g.add(foam);
    const lid = new T3.Group(); lid.position.y = Hc; lid.visible = false; g.add(lid);
    if (slush) { const dm = new T3.Mesh(new T3.SphereGeometry(R * 1.02, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon('#e0f2fe', { transparent: true, opacity: 0.45, depthWrite: false })); dm.scale.y = 0.75; lid.add(dm); }
    else { const l1 = new T3.Mesh(new T3.CylinderGeometry(R * 1.04, R * 1.04, 0.012, 24), toon('#fbfbf7')); l1.position.y = 0.006; if (outline) outline(l1, 0.003, R); lid.add(l1); const l2 = new T3.Mesh(new T3.CylinderGeometry(R * 0.7, R * 0.85, 0.014, 24), toon('#e8e4da')); l2.position.y = 0.018; lid.add(l2);
      const l3 = new T3.Mesh(new T3.CylinderGeometry(R * 0.35, R * 0.35, 0.006, 16), toon('#c42d3c')); l3.position.y = 0.027; lid.add(l3); }
    const straw = new T3.Mesh(new T3.CylinderGeometry(0.0065, 0.0065, 0.17, 8), new T3.MeshToonMaterial({ map: STRAW, gradientMap: grad || null })); straw.position.set(0.012, Hc + 0.055, 0.004); straw.rotation.z = 0.18; straw.visible = false; g.add(straw);
    g.userData = { set(fill, foamH = 0, lidOn = false) { const f = clamp(fill, 0, 1), h = (Hc - 0.012) * f; liq.visible = f > 0.01; liq.scale.y = Math.max(0.001, h); liq.position.y = 0.004 + h / 2; foam.visible = (foamH > 0.002 || slush) && f > 0.05; foam.scale.y = slush ? 0.25 + 0.5 * f : Math.max(0.001, foamH); foam.position.y = 0.004 + h + (slush ? 0 : foamH / 2); if (slush) foam.scale.x = foam.scale.z = 1; lid.visible = straw.visible = lidOn; } };
    return g; }
  function candyBox(k) { const C = CANDY[k], g = new T3.Group(), b = new T3.Mesh(new T3.BoxGeometry(0.11, 0.15, 0.04), toon(C.col)); b.position.y = 0.075; if (outline) outline(b, 0.005); g.add(b);
    const lab = new T3.Mesh(new T3.BoxGeometry(0.08, 0.05, 0.042), toon('#ffd23a')); lab.position.y = 0.09; g.add(lab); return g; }
  function hotdog(o = {}) { const g = new T3.Group(), dog = new T3.Mesh(new T3.CapsuleGeometry(0.026, 0.19, 4, 10), toon('#e57373')); dog.rotation.z = Math.PI / 2; if (outline) outline(dog, 0.005, 0.03); g.add(dog); g.userData.dog = dog;
    const bun = new T3.Group(); for (const s of [-1, 1]) { const h = new T3.Mesh(new T3.CapsuleGeometry(0.026, 0.2, 4, 10), toon('#e8a84c')); h.rotation.z = Math.PI / 2; h.position.set(0, -0.01, s * 0.028); h.scale.set(1, 1.1, 0.8); bun.add(h); } bun.visible = false; g.add(bun); g.userData.bun = bun;
    const sq = new T3.Group(); g.add(sq); g.userData.sq = sq; return g; }
  function squiggle(g, k, n) { const sq = g.userData.sq; while (sq.children.length) sq.remove(sq.children[0]); if (!n) return; const pts = []; const len = Math.min(1, n / 4) * 0.2; for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push(new T3.Vector3(-0.1 + t * len, 0.03, Math.sin(t * 22) * 0.016)); }
    const m = new T3.Mesh(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 40, 0.006, 5), toon(k === 'mustard' ? '#facc15' : '#dc2626')); sq.add(m); }
  function nachoTray(cheese = 0) { const g = new T3.Group(), tr = new T3.Mesh(new T3.BoxGeometry(0.24, 0.03, 0.16), toon('#1f2937')); tr.position.y = 0.015; if (outline) outline(tr, 0.005); g.add(tr);
    for (let i = 0; i < 9; i++) { const ch = new T3.Mesh(new T3.ConeGeometry(0.035, 0.008, 3), toon('#f2c14e')); ch.position.set(-0.07 + (i % 3) * 0.07, 0.04 + (i % 2) * 0.006, -0.04 + Math.floor(i / 3) * 0.04); ch.rotation.set(rr(-0.3, 0.3), rr(0, 6), rr(-0.3, 0.3)); g.add(ch); }
    const ch = new T3.Mesh(new T3.SphereGeometry(0.07, 14, 6, 0, Math.PI * 2, 0, Math.PI / 2), toon('#fbbf24')); ch.scale.set(1.3, 0.01, 0.9); ch.position.y = 0.045; g.add(ch); g.userData = { setCheese(v) { ch.scale.y = Math.max(0.01, Math.min(1.3, v) * 0.45); ch.visible = v > 0.02; } }; g.userData.setCheese(cheese); return g; }
  return { piece, pieceMat, bumpy, bucket, cup, candyBox, hotdog, squiggle, nachoTray };
}

// ---------------- the interior: lobby + snack counter + SCREEN 1 ----------------
export function buildCinema(ctx) {
  const { THREE: T3, M, toon, canvasTex: CTX, scene, grad, origin = { x: 0, z: 0 } } = ctx, root = new T3.Group(); root.position.set(origin.x, 0, origin.z); scene.add(root);
  const OX = origin.x, OZ = origin.z, H = 4.6, LX0 = -7, LX1 = 7, SX1 = 16, Z0 = -5.5, Z1 = 5.5, KZ = -2.8, TOP = 1.0;
  const red = toon('#b3202e'), redD = toon('#7a1522'), gold = toon('#e6b45a'), ink = toon('#201e1d'), cream = toon('#f6efe2'), chrome = toon('#d7dde3'), dark = toon('#2a2230');
  const K = { root, z: KZ, top: TOP, cut: [], front: [], walk: [], colliders: [], seats: [], OX, OZ, H, bounds: { lobby: [LX0, LX1, Z0, Z1], screen: [LX1, SX1, Z0, Z1] } };
  const glowT = CTX(64, 64, c => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,0.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 64, 64); });
  const glow = (col, x, y, z, sc, op = 0.6, parent = root) => { const sp = new T3.Sprite(new T3.SpriteMaterial({ map: glowT, color: col, transparent: true, opacity: op, depthWrite: false, blending: T3.AdditiveBlending })); sp.position.set(x, y, z); sp.scale.setScalar(sc); parent.add(sp); return sp; };
  const box = (x0, x1, z0, z1) => K.colliders.push({ box: [OX + x0, OX + x1, OZ + z0, OZ + z1] }), circ = (x, z, r) => K.colliders.push({ c: [OX + x, OZ + z, r] });
  const flat = (w, d, mat, x, y, z, ry = 0) => { const m = new T3.Mesh(new T3.PlaneGeometry(w, d), mat); m.rotation.x = -Math.PI / 2; m.rotation.z = ry; m.position.set(x, y, z); m.receiveShadow = true; root.add(m); return m; };
  // floors: patterned lobby carpet, dark screen-room carpet with aisle lights
  const carpet = CTX(256, 256, c => { c.fillStyle = '#5a1630'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#e6b45a'; c.lineWidth = 5; for (let i = -1; i < 3; i++) for (let j = -1; j < 3; j++) { c.beginPath(); c.arc(i * 128 + 64, j * 128 + 64, 46, 0, 7); c.stroke(); } c.fillStyle = '#2b9a9a'; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { c.save(); c.translate(i * 64 + 32, j * 64 + 32); c.rotate(Math.PI / 4); c.fillRect(-7, -7, 14, 14); c.restore(); } }, [7, 5.5]);
  flat(LX1 - LX0, Z1 - Z0, new T3.MeshToonMaterial({ map: carpet, gradientMap: grad }), 0, 0, 0);
  const carp2 = CTX(128, 128, c => { c.fillStyle = '#241a2e'; c.fillRect(0, 0, 128, 128); c.fillStyle = '#35284a'; for (let i = 0; i < 40; i++) c.fillRect(Math.random() * 128, Math.random() * 128, 3, 3); }, [5, 6]);
  flat(SX1 - LX1, Z1 - Z0, new T3.MeshToonMaterial({ map: carp2, gradientMap: grad }), (LX1 + SX1) / 2, 0, 0);
  // walls
  const wallT = CTX(256, 256, c => { c.fillStyle = '#6b1d2a'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 256; i += 32) { c.fillStyle = '#7d2433'; c.fillRect(i, 0, 16, 256); } c.fillStyle = '#e6b45a'; c.fillRect(0, 150, 256, 8); c.fillStyle = '#3a0f18'; c.fillRect(0, 158, 256, 98); }, [5, 1]);
  const wallM = new T3.MeshToonMaterial({ map: wallT, gradientMap: grad }), wallS = toon('#1d1626');
  const wall = (x, z, w, ry, mat = wallM, h = H, y0 = 0, list) => { const m = new T3.Mesh(new T3.BoxGeometry(w, h, 0.25), mat); m.position.set(x, y0 + h / 2, z); m.rotation.y = ry; m.receiveShadow = true; root.add(m); if (list) list.push(m); return m; };
  K.backWall = wall(0, Z0, LX1 - LX0, 0, wallM, H, 0, K.cut); box(LX0, LX1, Z0 - 0.3, Z0 + 0.12);
  wall(LX0, 0, Z1 - Z0, Math.PI / 2); box(LX0 - 0.3, LX0 + 0.12, Z0, Z1);
  // front (south) wall with the glass entrance doors at x 0
  for (const [x0, x1] of [[LX0, -1.3], [1.3, LX1]]) { wall((x0 + x1) / 2, Z1, x1 - x0, 0, wallM, H, 0, K.front); box(x0, x1, Z1 - 0.12, Z1 + 0.3); }
  wall(0, Z1, 2.6, 0, wallM, H - 2.8, 2.8, K.front);
  for (const s of [-1, 1]) { const d = new T3.Mesh(new T3.PlaneGeometry(1.2, 2.7), new T3.MeshBasicMaterial({ color: 0x9fd3ff, transparent: true, opacity: 0.55 })); d.position.set(s * 0.62, 1.37, Z1 - 0.02); d.rotation.y = Math.PI; root.add(d); K.front.push(d); K.front.push(M(new T3.BoxGeometry(0.06, 0.5, 0.06), gold, s * 0.12, 1.3, Z1 - 0.12, root, 0)); }
  K.front.push(M(new T3.BoxGeometry(2.7, 0.14, 0.2), gold, 0, 2.78, Z1 - 0.1, root, 0)); box(-1.3, 1.3, Z1 + 0.2, Z1 + 0.5);
  K.DOOR = { x: OX, z: OZ + Z1 - 0.9, label: 'Leave ' + CINEMA.name }; K.ENTER = { x: OX, z: OZ + Z1 - 1.4, face: Math.PI };
  // dividing wall lobby | SCREEN 1, doorway z 2.6..4.4 with red velvet curtains
  wall(LX1, (Z0 + 2.6) / 2, 2.6 - Z0, Math.PI / 2); box(LX1 - 0.15, LX1 + 0.15, Z0, 2.6);
  wall(LX1, (4.4 + Z1) / 2, Z1 - 4.4, Math.PI / 2); box(LX1 - 0.15, LX1 + 0.15, 4.4, Z1);
  wall(LX1, 3.5, 1.8, Math.PI / 2, wallM, H - 2.9, 2.9);
  for (const s of [-1, 1]) { const cu = M(new T3.BoxGeometry(0.12, 2.9, 0.42), red, LX1, 1.45, 3.5 + s * 0.75, root, 0.01); cu.scale.x = 1; }
  M(new T3.BoxGeometry(0.4, 0.22, 1.9), gold, LX1, 2.95, 3.5, root, 0.01);
  { const t = CTX(512, 128, c => { c.fillStyle = '#16121c'; c.fillRect(0, 0, 512, 128); c.fillStyle = '#ffd23a'; c.font = '900 80px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('SCREEN 1', 256, 68); }); const s = new T3.Mesh(new T3.PlaneGeometry(1.6, 0.4), new T3.MeshBasicMaterial({ map: t })); s.position.set(LX1 - 0.14, 3.35, 3.5); s.rotation.y = -Math.PI / 2; root.add(s); }
  // screen room walls (dark)
  wall((LX1 + SX1) / 2, Z0, SX1 - LX1, 0, wallS); box(LX1, SX1, Z0 - 0.3, Z0 + 0.12);
  wall((LX1 + SX1) / 2, Z1, SX1 - LX1, 0, wallS, H, 0, K.front); box(LX1, SX1, Z1 - 0.12, Z1 + 0.3);
  wall(SX1, 0, Z1 - Z0, Math.PI / 2, wallS); box(SX1 - 0.12, SX1 + 0.3, Z0, Z1);
  // ceilings
  const ceil = new T3.Mesh(new T3.BoxGeometry(SX1 - LX0, 0.2, Z1 - Z0), toon('#2a1a24')); ceil.position.set((LX0 + SX1) / 2, H + 0.1, 0); root.add(ceil); K.cut.push(ceil); K.ceil = ceil;
  // ---------- SCREEN 1: the screen (animated canvas), seat rows, aisle lights ----------
  const SCR = { x: SX1 - 0.16, z: -0.8, y: 2.5, w: 6.2, h: 3.0 }; K.screen = SCR;
  const scv = document.createElement('canvas'); scv.width = 512; scv.height = 256; const scT = new T3.CanvasTexture(scv); scT.colorSpace = T3.SRGBColorSpace;
  { const s = new T3.Mesh(new T3.PlaneGeometry(SCR.w, SCR.h), new T3.MeshBasicMaterial({ map: scT })); s.position.set(SCR.x, SCR.y, SCR.z); s.rotation.y = -Math.PI / 2; root.add(s); M(new T3.BoxGeometry(0.1, SCR.h + 0.3, SCR.w + 0.3), ink, SCR.x + 0.06, SCR.y, SCR.z, root, 0); for (const s2 of [-1, 1]) M(new T3.BoxGeometry(0.3, H - 0.3, 0.9), red, SCR.x - 0.1, (H - 0.3) / 2, SCR.z + s2 * (SCR.w / 2 + 0.55), root, 0.01); }
  const scrLight = new T3.PointLight(0x9ec9ff, 0, 14, 1.4); scrLight.position.set(SCR.x - 4, SCR.y, SCR.z); root.add(scrLight); K.scrLight = scrLight;
  { const PX = LX1 + 0.2, PY = 4.1, len = SCR.x - PX - 0.1, beam = new T3.Mesh(new T3.ConeGeometry(SCR.h * 0.5, len, 24, 1, true), new T3.MeshBasicMaterial({ color: 0xcfe3ff, transparent: true, opacity: 0.06, blending: T3.AdditiveBlending, depthWrite: false, side: T3.DoubleSide }));
    beam.rotation.z = Math.PI / 2; beam.scale.set(1, 1, SCR.w / SCR.h * 0.9); beam.position.set(PX + len / 2, (PY + SCR.y) / 2, SCR.z); beam.rotation.y = 0; const tilt = Math.atan2(PY - SCR.y, len); beam.rotation.z = Math.PI / 2 - tilt; root.add(beam); K.beam = beam;
    M(new T3.BoxGeometry(0.3, 0.3, 0.5), toon('#1d1626'), PX - 0.05, PY, SCR.z, root, 0.01); glow(0xdbeaff, PX + 0.12, PY, SCR.z, 0.7, 0.9);
    const n = 70, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const t = Math.random(); pos[i * 3] = PX + t * len; pos[i * 3 + 1] = PY + (SCR.y - PY) * t + (Math.random() - 0.5) * SCR.h * t; pos[i * 3 + 2] = SCR.z + (Math.random() - 0.5) * SCR.w * t; }
    const pg = new T3.BufferGeometry(); pg.setAttribute('position', new T3.BufferAttribute(pos, 3)); const motes = new T3.Points(pg, new T3.PointsMaterial({ color: 0xffffff, size: 0.035, transparent: true, opacity: 0.6, depthWrite: false, blending: T3.AdditiveBlending })); root.add(motes); K.motes = { motes, pos, n, PX, PY, len }; }
  const ROWS = [9.0, 10.3, 11.6, 12.9], SZ = []; for (let i = 0; i < 8; i++) SZ.push(-4.3 + i * 0.75);
  { const n = ROWS.length * SZ.length, cush = new T3.InstancedMesh(new T3.BoxGeometry(0.62, 0.18, 0.62), toon('#b3202e'), n), back = new T3.InstancedMesh(new T3.BoxGeometry(0.14, 0.75, 0.62), toon('#8f1a26'), n), arm = new T3.InstancedMesh(new T3.BoxGeometry(0.55, 0.08, 0.06), toon('#1d1626'), n), mm = new T3.Matrix4(); let k = 0;
    ROWS.forEach((x, ri) => { const rise = (ROWS.length - 1 - ri) * 0.18; if (rise) { const st = M(new T3.BoxGeometry(1.3, rise, Z1 - Z0 - 4.2), toon('#2e2238'), x - 0.15, rise / 2, (Z0 + 1.7) / 2 + 0.3, root, 0.01); st.receiveShadow = true; }
      SZ.forEach(z => { mm.makeTranslation(x, rise + 0.42, z); cush.setMatrixAt(k, mm); mm.makeTranslation(x - 0.32, rise + 0.75, z); back.setMatrixAt(k, mm); mm.makeTranslation(x, rise + 0.62, z + 0.34); arm.setMatrixAt(k, mm); K.seats.push({ x: OX + x, z: OZ + z, y: rise, row: ri }); k++; });
      box(x - 0.55, x + 0.4, Z0, SZ[SZ.length - 1] + 0.4); });
    [cush, back, arm].forEach(m => { m.castShadow = true; m.receiveShadow = true; root.add(m); }); }
  for (let i = 0; i < 6; i++) { const L = M(new T3.BoxGeometry(0.12, 0.05, 0.12), toon('#ffd23a', { emissive: new T3.Color('#ffb020'), emissiveIntensity: 0.9 }), 8 + i * 1.3, 0.03, 1.95, root, 0); L.castShadow = false; }
  // ---------- lobby dressing: posters, marquee sign, ticket podium, velvet ropes, lamps ----------
  const POSTERS = [['SPACE FOX II', 'THE CAT STRIKES BACK', '#1e3a8a', '#ffd23a'], ['THE NINE GATES', 'EVERY DOOR HAS A KEY', '#4c1d95', '#f472b6'], ['IRON WARDEN', 'HE NEVER BLINKS', '#7f1d1d', '#e5e7eb'], ['LOVE IN MERU', 'A TAVERN ROMANCE', '#9d174d', '#fde68a']];
  POSTERS.forEach(([t, sub, bg, fg], i) => { const tx = CTX(256, 384, c => { c.fillStyle = bg; c.fillRect(0, 0, 256, 384); c.fillStyle = fg; c.globalAlpha = 0.25; for (let k2 = 0; k2 < 6; k2++) { c.beginPath(); c.arc(128, 200, 30 + k2 * 26, 0, 7); c.lineWidth = 6; c.strokeStyle = fg; c.stroke(); } c.globalAlpha = 1;
      c.fillStyle = '#201e1d'; c.beginPath(); c.moveTo(128, 120); c.lineTo(168, 150); c.lineTo(180, 110); c.lineTo(190, 210); c.lineTo(128, 290); c.lineTo(66, 210); c.lineTo(76, 110); c.lineTo(88, 150); c.closePath(); c.fill();
      c.fillStyle = fg; c.font = '900 34px Archivo, Arial'; c.textAlign = 'center'; c.fillText(t, 128, 60, 236); c.font = '700 16px Archivo, Arial'; c.fillText(sub, 128, 330, 236); c.fillText('NOW SHOWING', 128, 360); });
    const x = LX0 + 0.16, z = -3.2 + i * 2.3, p = new T3.Mesh(new T3.PlaneGeometry(1.1, 1.65), new T3.MeshBasicMaterial({ map: tx })); p.position.set(x, 1.9, z); p.rotation.y = Math.PI / 2; root.add(p); M(new T3.BoxGeometry(0.06, 1.85, 1.3), gold, LX0 + 0.1, 1.9, z, root, 0);
    for (let b = 0; b < 8; b++) { const bl = new T3.Mesh(new T3.SphereGeometry(0.035, 6, 4), new T3.MeshBasicMaterial({ color: 0xfff1b8 })); bl.position.set(LX0 + 0.16, 1.9 + (b < 4 ? 0.98 : -0.98), z - 0.55 + (b % 4) * 0.37); root.add(bl); } });
  // the marquee over the counter (light bulbs chase in update)
  const bulbs = []; { const g = new T3.Group(); g.position.set(0, 3.35, Z0 + 0.2); root.add(g); K.cut.push(g);
    M(new T3.BoxGeometry(6.4, 1.15, 0.16), ink, 0, 0, 0, g, 0.02); const t = CTX(1024, 192, c => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, 1024, 192); c.fillStyle = '#ffd23a'; c.font = '900 120px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(CINEMA.name, 512, 100); });
    const s = new T3.Mesh(new T3.PlaneGeometry(5.8, 0.95), new T3.MeshBasicMaterial({ map: t })); s.position.z = 0.09; g.add(s);
    for (let i = 0; i < 34; i++) { const top = i < 17, bl = new T3.Mesh(new T3.SphereGeometry(0.045, 6, 4), new T3.MeshBasicMaterial({ color: 0xffe9a0 })); bl.position.set(-3.1 + (i % 17) * (6.2 / 16), top ? 0.62 : -0.62, 0.1); g.add(bl); bulbs.push(bl); if (i % 2 === 0) bl.userData.glow = glow(0xffd27a, bl.position.x, bl.position.y, 0.14, 0.32, 0.55, g); } }
  // a menu board on the back wall (left of the marquee)
  { const t = CTX(512, 384, c => { c.fillStyle = '#16121c'; c.fillRect(0, 0, 512, 384); c.fillStyle = '#ffd23a'; c.font = '900 46px Archivo, Arial'; c.fillText('SNACKS', 28, 60); c.fillStyle = '#f6efe2'; c.font = '700 28px Archivo, Arial'; [['POPCORN S / M / L', '4 · 6 · 8g'], ['FLAVOUR SHAKE', '+1g'], ['FOUNTAIN DRINKS', '3g'], ['SLUSHIES', '4g'], ['CANDY', '3g'], ['HOT DOG', '5g'], ['NACHOS', '5g']].forEach(([a, b], i) => { c.fillText(a, 28, 112 + i * 38); c.fillText(b, 380, 112 + i * 38); }); });
    for (const x of [-5.1, 5.1]) { const m = new T3.Mesh(new T3.PlaneGeometry(2.3, 1.72), new T3.MeshBasicMaterial({ map: t })); m.position.set(x, 3.0, Z0 + 0.15); root.add(m); K.cut.push(m); } }
  // ticket podium by SCREEN 1 (STUB stands here)
  K.podium = { x: 5.9, z: 1.7 }; M(new T3.BoxGeometry(0.7, 1.05, 0.5), red, K.podium.x, 0.525, K.podium.z, root, 0.02); M(new T3.BoxGeometry(0.8, 0.06, 0.6), gold, K.podium.x, 1.08, K.podium.z, root, 0.01); circ(K.podium.x, K.podium.z, 0.5);
  // velvet ropes (queue lane) in front of the counter
  const posts = [[-4.6, 0.9], [-1.6, 0.9], [1.6, 0.9], [4.6, 0.9]]; posts.forEach(([x, z]) => { M(new T3.CylinderGeometry(0.04, 0.05, 0.9, 8), gold, x, 0.45, z, root, 0.008); M(new T3.SphereGeometry(0.07, 10, 6), gold, x, 0.93, z, root, 0.006); M(new T3.CylinderGeometry(0.16, 0.18, 0.04, 14), gold, x, 0.02, z, root, 0); circ(x, z, 0.18); });
  for (let i = 0; i < posts.length - 1; i++) { if (i === 1) continue; const [x0, z0] = posts[i], [x1] = posts[i + 1], pts = []; for (let k2 = 0; k2 <= 12; k2++) { const t = k2 / 12; pts.push(new T3.Vector3(x0 + (x1 - x0) * t, 0.85 - Math.sin(t * Math.PI) * 0.18, z0)); } M(new T3.TubeGeometry(new T3.CatmullRomCurve3(pts), 20, 0.025, 6), red, 0, 0, 0, root, 0); box(Math.min(x0, x1), Math.max(x0, x1), z0 - 0.05, z0 + 0.05); }
  // a couple of lobby benches
  for (const x of [-4.2, 3.4]) { K.front.push(M(new T3.BoxGeometry(1.8, 0.45, 0.55), red, x, 0.225, 4.4, root, 0.02), M(new T3.BoxGeometry(1.8, 0.5, 0.12), red, x, 0.65, 4.68, root, 0.02)); box(x - 0.95, x + 0.95, 4.1, 4.9); }
  K.apron = flat(LX1 - LX0, 9, new T3.MeshToonMaterial({ map: carpet.clone(), gradientMap: grad }), 0, -0.001, Z1 + 4.5); K.apron.material.map.repeat.set(7, 4.5); K.apron.material.map.needsUpdate = true; K.apron.visible = false;
  // hanging lamps (lobby)
  K.lamps = []; for (const [x, z] of [[-4.5, 2.6], [4.5, 2.6], [-4, -0.9], [4, -0.9]]) { const sh = M(new T3.ConeGeometry(0.34, 0.28, 14, 1, true), gold, x, H - 0.55, z, root, 0.01); sh.material.side = T3.DoubleSide; M(new T3.CylinderGeometry(0.01, 0.01, 0.4, 4), ink, x, H - 0.2, z, root, 0); K.lamps.push(sh); K.front.push(sh); }

  // ---------- THE SNACK COUNTER (all work stations sit on the island top, facing the worker / camera at -z) ----------
  M(new T3.BoxGeometry(10.4, 0.95, 0.9), redD, 0, 0.475, KZ - 1.6, root, 0.03); M(new T3.BoxGeometry(10.5, 0.05, 1.0), cream, 0, 0.97, KZ - 1.6, root, 0.01);
  for (let i = 0; i < 5; i++) { const sx = -4.2 + i * 2.1; K.cut.push(M(new T3.BoxGeometry(0.8, 1.1, 0.5), chrome, sx, 1.55, KZ - 1.7, root, 0.02)); const cy = M(new T3.CylinderGeometry(0.2, 0.2, 0.5, 12), toon(['#ffd23a', '#c42d3c', '#38bdf8', '#22c55e', '#f472b6'][i]), sx, 1.4, KZ - 1.4, root, 0.01); cy.rotation.x = Math.PI / 2; K.cut.push(cy); }
  // island
  const isl = M(new T3.BoxGeometry(8.0, TOP - 0.04, 1.8), red, 0, (TOP - 0.04) / 2, KZ + 0.15, root, 0.03); M(new T3.BoxGeometry(8.1, 0.05, 1.9), cream, 0, TOP - 0.02, KZ + 0.15, root, 0.012);
  M(new T3.BoxGeometry(8.1, 0.1, 0.05), gold, 0, TOP - 0.25, KZ - 0.78, root, 0);
  // pass counter (the customers' side)
  M(new T3.BoxGeometry(8.8, 1.06, 0.48), red, 0, 0.53, KZ + 1.35, root, 0.03); M(new T3.BoxGeometry(8.9, 0.06, 0.6), cream, 0, 1.09, KZ + 1.35, root, 0.012); M(new T3.BoxGeometry(8.9, 0.08, 0.04), gold, 0, 0.8, KZ + 1.62, root, 0);
  K.pass = { z: KZ + 1.35, y: 1.12 }; box(-5.25, 4.15, Z0, KZ + 1.62); box(4.15, 5.25, Z0, KZ - 1.0); box(-6.95, -5.25, Z0, KZ - 1.0);
  K.spots = [-2.2, 0, 2.2].map(x => ({ x, z: KZ + 2.3 }));
  // POPCORN MACHINE (glass cabinet, kettle on top, red DUMP lever on the side)
  const PC = K.pop = { x: 2.6, z: KZ + 0.15, w: 1.2, d: 0.76, h: 1.2 };
  { const g = new T3.Group(); g.position.set(PC.x, TOP, PC.z); root.add(g); K.popG = g; const glass = new T3.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.14, depthWrite: false });
    M(new T3.BoxGeometry(PC.w + 0.08, 0.16, PC.d + 0.08), red, 0, 0.08, 0, g, 0.015); M(new T3.BoxGeometry(PC.w + 0.08, 0.14, PC.d + 0.08), red, 0, PC.h + 0.07, 0, g, 0.015);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) M(new T3.BoxGeometry(0.05, PC.h, 0.05), red, x * PC.w / 2, PC.h / 2 + 0.08, z * PC.d / 2, g, 0.006);
    for (const [w, d, x, z] of [[PC.w, 0.01, 0, -PC.d / 2], [PC.w, 0.01, 0, PC.d / 2], [0.01, PC.d, -PC.w / 2, 0], [0.01, PC.d, PC.w / 2, 0]]) { const p = new T3.Mesh(new T3.BoxGeometry(w, PC.h - 0.08, d), glass); p.position.set(x, PC.h / 2 + 0.08, z); p.renderOrder = 5; g.add(p); }
    const sign = CTX(512, 96, c => { c.fillStyle = '#c42d3c'; c.fillRect(0, 0, 512, 96); c.fillStyle = '#ffd23a'; c.font = 'italic 900 64px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('POPCORN', 256, 52); });
    const sg = new T3.Mesh(new T3.PlaneGeometry(PC.w, 0.22), new T3.MeshBasicMaterial({ map: sign })); sg.position.set(0, PC.h + 0.27, -PC.d / 2 - 0.02); sg.rotation.y = Math.PI; g.add(sg); M(new T3.BoxGeometry(PC.w + 0.08, 0.26, 0.04), red, 0, PC.h + 0.27, -PC.d / 2 + 0.01, g, 0.01);
    // kettle (hangs from the roof inside the glass) + lid + stir paddle
    for (const sx of [-0.38, 0.42]) { M(new T3.BoxGeometry(0.16, 0.03, 0.08), new T3.MeshBasicMaterial({ color: 0xffe2a0 }), sx, PC.h + 0.0, -0.2, g, 0); }
    K.popGlow = glow(0xffb85a, 0, PC.h * 0.55, 0, 1.5, 0.28, g); K.popGlow2 = glow(0xffe2a0, 0, PC.h - 0.02, -0.2, 0.9, 0.45, g);
    M(new T3.BoxGeometry(PC.w - 0.04, 0.012, PC.d - 0.04), toon('#a8323e'), 0, 0.163, 0, g, 0);
    const kt = new T3.Group(); kt.position.set(0.05, PC.h - 0.28, 0.02); g.add(kt); K.kettle = kt;
    const pot = M(new T3.CylinderGeometry(0.24, 0.2, 0.26, 22, 1, true), chrome, 0, 0, 0, kt, 0.012, 0.24); pot.material = toon('#c7ced6', { side: T3.DoubleSide }); M(new T3.CircleGeometry(0.2, 22).rotateX(Math.PI / 2), toon('#7d8790'), 0, -0.13, 0, kt, 0);
    const lid = new T3.Group(); lid.position.y = 0.14; kt.add(lid); K.kLid = lid; M(new T3.CylinderGeometry(0.25, 0.25, 0.02, 22), chrome, 0, 0, 0, lid, 0.008, 0.25); M(new T3.CylinderGeometry(0.02, 0.02, 0.2, 8), ink, 0, 0.1, 0, lid, 0);
    const pad = new T3.Group(); pad.position.y = 0.24; kt.add(pad); K.kPaddle = pad; M(new T3.BoxGeometry(0.34, 0.03, 0.03), ink, 0.17, 0, 0, pad, 0.005); M(new T3.CylinderGeometry(0.025, 0.025, 0.12, 8), red, 0.32, 0.06, 0, pad, 0.005);
    const oil = new T3.Mesh(new T3.CircleGeometry(0.19, 22).rotateX(-Math.PI / 2), toon('#e8b84a')); oil.position.y = -0.1; oil.visible = false; kt.add(oil); K.kOil = oil;
    // corn pile on the cabinet floor (scaled with the stock)
    const art = cinemaArt(T3, toon, ctx.addOutline, grad), cornT = CTX(256, 256, c => { c.fillStyle = '#f3e2b8'; c.fillRect(0, 0, 256, 256); for (let i = 0; i < 260; i++) { const x = Math.random() * 256, y = Math.random() * 256, r = 6 + Math.random() * 6; c.fillStyle = '#c99a4a'; c.beginPath(); c.arc(x + 1, y + 2, r, 0, 7); c.fill(); c.fillStyle = i % 9 ? '#fff8e6' : '#ffe2a0'; c.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, rr2 = r * (0.75 + 0.35 * Math.sin(k * 2.7 + i)); c.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); } c.fill(); c.fillStyle = '#e9a93a'; c.beginPath(); c.arc(x + r * 0.2, y + r * 0.3, r * 0.22, 0, 7); c.fill(); } }, [3, 2]),
      pile = new T3.Mesh(art.bumpy(0.6, 28), new T3.MeshToonMaterial({ map: cornT, gradientMap: grad })); pile.scale.set(0.95, 0.01, 0.55); pile.position.set(0, 0.17, 0.02); pile.visible = false; g.add(pile); K.pile = pile;
    // every popped kernel that lands stays in the case (up to 460), so the pile is built from real popcorn
    { const im = new T3.InstancedMesh(art.piece, art.pieceMat, 460); im.count = 0; im.frustumCulled = false; g.add(im); K.landed = { im, max: 460, list: [] }; }
    // DUMP lever on the front-left post (pull it down)
    const lv = new T3.Group(); lv.position.set(-PC.w / 2 - 0.05, PC.h - 0.32, -PC.d / 2 + 0.12); g.add(lv); K.lever = lv; M(new T3.BoxGeometry(0.04, 0.04, 0.3), ink, 0, 0, -0.15, lv, 0.005); K.leverKnob = M(new T3.SphereGeometry(0.06, 12, 8), toon('#ec3013'), 0, 0, -0.32, lv, 0.006, 0.06);
    // butter pump (tall) at the right of the cabinet, kernel scoop + bucket stacks in front
    K.butter = { x: PC.x - PC.w / 2 - 0.22, z: KZ + 0.25 }; M(new T3.CylinderGeometry(0.09, 0.1, 0.38, 14), toon('#ffd166'), K.butter.x, TOP + 0.19, K.butter.z, root, 0.01, 0.1); const ph = new T3.Group(); ph.position.set(K.butter.x, TOP + 0.42, K.butter.z); root.add(ph); K.pumpHead = ph; M(new T3.CylinderGeometry(0.02, 0.02, 0.12, 8), chrome, 0, 0, 0, ph, 0); M(new T3.BoxGeometry(0.12, 0.04, 0.06), ink, 0, 0.07, 0, ph, 0.005); M(new T3.CylinderGeometry(0.01, 0.01, 0.12, 6), chrome, 0, 0.06, -0.08, ph, 0).rotation.x = Math.PI / 2;
    K.scoop = { x: PC.x - 0.95, z: KZ - 0.45 }; M(new T3.CylinderGeometry(0.1, 0.085, 0.14, 16), toon('#ffd23a'), K.scoop.x, TOP + 0.07, K.scoop.z, root, 0.008, 0.1); for (let i = 0; i < 9; i++) M(new T3.SphereGeometry(0.018, 5, 4), toon('#f2c14e'), K.scoop.x + rr(-0.05, 0.05), TOP + 0.145, K.scoop.z + rr(-0.05, 0.05), root, 0);
    K.sizes = {}; ['S', 'M', 'L'].forEach((k, i) => { const x = PC.x - 0.92 - i * 0.3, z = KZ + 0.47; for (let j = 0; j < 3; j++) { const b = art.bucket(k); b.position.set(x, TOP + j * 0.03, z); root.add(b); } K.sizes[k] = { x, z, y: TOP + SIZES[k].h + 0.08 }; });
    K.fill = { x: PC.x - 0.1, z: KZ - 0.62 };   // where the bucket stands while you fill it (in front of the glass)
    K.shakers = { cheese: { x: PC.x + 0.82, z: KZ - 0.5 }, caramel: { x: PC.x + 0.82, z: KZ - 0.15 } }; for (const [k, p] of Object.entries(K.shakers)) { M(new T3.CylinderGeometry(0.05, 0.055, 0.2, 12), toon(FLAVORS[k].col), p.x, TOP + 0.1, p.z, root, 0.008, 0.055); M(new T3.CylinderGeometry(0.052, 0.052, 0.05, 12), chrome, p.x, TOP + 0.225, p.z, root, 0.005); }
    K.art = art; }
  // DRINK FOUNTAIN (3 taps) + SLUSH machine (2 drums)
  K.fount = { x: 0.2, z: KZ + 0.2 }; M(new T3.BoxGeometry(1.05, 0.7, 0.5), chrome, K.fount.x, TOP + 0.35, K.fount.z, root, 0.02); M(new T3.BoxGeometry(1.07, 0.18, 0.52), red, K.fount.x, TOP + 0.75, K.fount.z, root, 0.01);
  M(new T3.BoxGeometry(1.0, 0.03, 0.34), toon('#3a3836'), K.fount.x, TOP + 0.015, K.fount.z - 0.42, root, 0.005);
  K.taps = ['cola', 'orange', 'grape'].map((k, i) => { const x = K.fount.x + 0.32 - i * 0.32; M(new T3.BoxGeometry(0.22, 0.2, 0.05), toon(DRINKS[k].col), x, TOP + 0.5, K.fount.z - 0.26, root, 0.006); M(new T3.CylinderGeometry(0.02, 0.025, 0.08, 8), chrome, x, TOP + 0.33, K.fount.z - 0.3, root, 0); return { k, x, z: K.fount.z - 0.42, y: TOP }; });
  K.slush = { x: -0.95, z: KZ + 0.2 }; M(new T3.BoxGeometry(0.95, 0.3, 0.5), toon('#1f2937'), K.slush.x, TOP + 0.15, K.slush.z, root, 0.015); K.drums = [];
  ['blue', 'cherry'].forEach((k, i) => { const x = K.slush.x + 0.22 - i * 0.44, dm = new T3.Mesh(new T3.CylinderGeometry(0.18, 0.18, 0.42, 18), toon(DRINKS[k].col, { transparent: true, opacity: 0.85 })); dm.position.set(x, TOP + 0.52, K.slush.z); root.add(dm); ctx.addOutline && ctx.addOutline(dm, 0.01, 0.18); const aug = M(new T3.BoxGeometry(0.3, 0.03, 0.03), toon('#ffffff'), x, TOP + 0.52, K.slush.z, root, 0); M(new T3.CylinderGeometry(0.19, 0.19, 0.04, 18), chrome, x, TOP + 0.75, K.slush.z, root, 0.005); K.drums.push({ k, aug, dm });
    K.taps.push({ k, x, z: K.slush.z - 0.42, y: TOP, slush: true }); M(new T3.BoxGeometry(0.1, 0.12, 0.08), toon('#e5e7eb'), x, TOP + 0.26, K.slush.z - 0.27, root, 0.005); });
  M(new T3.BoxGeometry(0.95, 0.03, 0.34), toon('#3a3836'), K.slush.x, TOP + 0.015, K.slush.z - 0.42, root, 0.005);
  // CANDY wall: a slanted glass case, four boxes facing the worker
  K.candy = { x: -1.85, z: KZ + 0.05 }; M(new T3.BoxGeometry(0.98, 0.12, 0.6), gold, K.candy.x, TOP + 0.06, K.candy.z, root, 0.01); { const r = M(new T3.BoxGeometry(0.96, 0.32, 0.04), toon('#3a0f18'), K.candy.x, TOP + 0.25, K.candy.z + 0.18, root, 0.008); r.rotation.x = -0.4; }
  K.candySlots = Object.keys(CANDY).map((k, i) => { const x = K.candy.x + 0.33 - i * 0.22, z = K.candy.z - 0.05; for (let j = 0; j < 2; j++) { const b = K.art.candyBox(k); b.position.set(x, TOP + 0.12, z + 0.1 + j * 0.06); b.rotation.x = -0.35; root.add(b); } return { k, x, z, y: TOP + 0.12 }; });
  // HOT DOG roller (4 slots) + bun tray + franks box + mustard / ketchup
  K.roller = { x: -3.55, z: KZ + 0.05 }; M(new T3.BoxGeometry(0.75, 0.12, 0.62), chrome, K.roller.x, TOP + 0.06, K.roller.z, root, 0.012); K.rollers = [];
  for (let i = 0; i < 4; i++) { const z = K.roller.z - 0.21 + i * 0.14, r = M(new T3.CylinderGeometry(0.022, 0.022, 0.6, 10), toon('#9aa3ab'), K.roller.x, TOP + 0.14, z, root, 0); r.rotation.z = Math.PI / 2; K.rollers.push({ x: K.roller.x, z, y: TOP + 0.165, r }); }
  M(new T3.BoxGeometry(0.75, 0.25, 0.04), toon('#e5e7eb', { transparent: true, opacity: 0.3 }), K.roller.x, TOP + 0.25, K.roller.z + 0.3, root, 0);
  K.franks = { x: K.roller.x, z: KZ + 0.64 }; M(new T3.BoxGeometry(0.24, 0.12, 0.18), toon('#c42d3c'), K.franks.x, TOP + 0.06, K.franks.z, root, 0.008); for (let i = 0; i < 4; i++) { const d = M(new T3.CapsuleGeometry(0.02, 0.12, 3, 8), toon('#e57373'), K.franks.x - 0.06 + i * 0.04, TOP + 0.13, K.franks.z, root, 0); d.rotation.x = Math.PI / 2; }
  K.bunSpot = { x: K.roller.x, z: KZ - 0.52 }; M(new T3.BoxGeometry(0.34, 0.02, 0.18), toon('#fbfbf7'), K.bunSpot.x, TOP + 0.01, K.bunSpot.z, root, 0.005);
  K.bottles = { mustard: { x: K.roller.x + 0.36, z: KZ - 0.62 }, ketchup: { x: K.roller.x - 0.36, z: KZ - 0.62 } }; for (const [k, p] of Object.entries(K.bottles)) { M(new T3.CylinderGeometry(0.045, 0.05, 0.22, 12), toon(k === 'mustard' ? '#facc15' : '#dc2626'), p.x, TOP + 0.11, p.z, root, 0.008, 0.05); M(new T3.ConeGeometry(0.03, 0.08, 10), toon(k === 'mustard' ? '#facc15' : '#dc2626'), p.x, TOP + 0.26, p.z, root, 0.005); }
  // NACHOS: chip bin + cheese pump + tray spot
  K.nacho = { x: -2.72, z: KZ + 0.2 }; M(new T3.BoxGeometry(0.36, 0.3, 0.32), toon('#f59e0b'), K.nacho.x, TOP + 0.15, K.nacho.z, root, 0.01); M(new T3.CylinderGeometry(0.03, 0.03, 0.14, 8), chrome, K.nacho.x, TOP + 0.36, K.nacho.z - 0.14, root, 0); M(new T3.BoxGeometry(0.12, 0.04, 0.06), ink, K.nacho.x, TOP + 0.43, K.nacho.z - 0.14, root, 0.005);
  K.chips = { x: K.nacho.x - 0.05, z: KZ - 0.5 }; K.chipsBag = { x: K.nacho.x + 0.33, z: KZ - 0.55 }; M(new T3.BoxGeometry(0.2, 0.24, 0.12), toon('#22a35a'), K.chipsBag.x, TOP + 0.12, K.chipsBag.z, root, 0.008); M(new T3.BoxGeometry(0.16, 0.06, 0.125), toon('#facc15'), K.chipsBag.x, TOP + 0.15, K.chipsBag.z - 0.002, root, 0);
  // serving tray (front centre, customers' side), bin, register on the pass counter
  K.tray = { x: 0.72, z: KZ + 0.74 }; M(new T3.BoxGeometry(0.85, 0.025, 0.5), toon('#c42d3c'), K.tray.x, TOP + 0.012, K.tray.z, root, 0.006);
  K.bin = { x: 1.42, z: KZ + 0.84 }; M(new T3.CylinderGeometry(0.12, 0.1, 0.22, 14), toon('#3a3836'), K.bin.x, TOP + 0.11, K.bin.z, root, 0.008, 0.12);
  K.register = { x: 1.55, z: KZ + 1.35 };
  // REEL's and STUB's spots for walk mode; the screen-room door
  K.reel = { x: 4.65, z: KZ + 0.25, face: -Math.PI / 2 - 0.4 }; K.stub = { x: K.podium.x - 0.15, z: K.podium.z - 0.65, face: -0.2 }; K.screenDoor = { x: LX1, z: 3.5 };
  K.sitSpot = { x: OX + ROWS[0] - 0.05, z: OZ + SZ[7], stand: { x: OX + ROWS[0] - 0.05, z: OZ + SZ[7] + 0.75 }, y: K.seats.find(s => s.row === 0).y };
  K.lights = []; for (const [x, z, k] of [[-3, 1, 7], [3, 1, 7], [0, -1.5, 8], [11.5, 3.2, 3]]) { const L = new T3.PointLight(0xffd7a8, k * 0.35, 12, 1.6); L.position.set(x, H - 1.2, z); root.add(L); K.lights.push(L); }
  // ---------- movie + marquee animation ----------
  let mt = 0, mAcc = 0; const sc = scv.getContext('2d'), FILMS = [['SPACE FOX II', '#0b1d4a'], ['COMING SOON', '#3b0a1a'], ['THE NINE GATES', '#1a0b3a']];
  function drawMovie(t) { const W = 512, Hh = 256, film = FILMS[Math.floor(t / 14) % FILMS.length], ph = (t % 14) / 14; sc.fillStyle = film[1]; sc.fillRect(0, 0, W, Hh);
    sc.fillStyle = '#ffffff'; for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 20) % W, y = (i * 53) % 150; sc.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(i + t * 3)); sc.fillRect(W - x, y, 2, 2); } sc.globalAlpha = 1;
    sc.fillStyle = '#ffe9a0'; sc.beginPath(); sc.arc(400, 60, 30, 0, 7); sc.fill();
    for (let L = 0; L < 2; L++) { sc.fillStyle = L ? '#14102a' : '#231a44'; sc.beginPath(); sc.moveTo(0, Hh); for (let x = 0; x <= W; x += 16) sc.lineTo(x, 190 + L * 22 - Math.sin((x + t * (40 + L * 60)) * 0.012 + L) * (24 - L * 8)); sc.lineTo(W, Hh); sc.fill(); }
    if (ph < 0.18 || film[0] !== 'SPACE FOX II') { sc.fillStyle = '#ffd23a'; sc.font = '900 52px Archivo, Arial'; sc.textAlign = 'center'; sc.textBaseline = 'middle'; sc.globalAlpha = film[0] === 'SPACE FOX II' ? Math.min(1, (0.18 - ph) * 12) : 1; sc.fillText(film[0], W / 2, 110); sc.globalAlpha = 1; }
    if (film[0] === 'SPACE FOX II') { const fx = 120 + Math.sin(t * 0.7) * 30, jump = Math.max(0, Math.sin(t * 2.4)) * 40, fy = 196 - jump; sc.fillStyle = '#ff8a1a'; sc.beginPath(); sc.ellipse(fx, fy, 22, 13, 0, 0, 7); sc.fill(); sc.beginPath(); sc.moveTo(fx + 14, fy - 8); sc.lineTo(fx + 34, fy - 16); sc.lineTo(fx + 30, fy + 2); sc.fill();
      sc.beginPath(); sc.moveTo(fx + 22, fy - 18); sc.lineTo(fx + 26, fy - 32); sc.lineTo(fx + 31, fy - 18); sc.fill(); sc.beginPath(); sc.moveTo(fx - 18, fy - 4); sc.quadraticCurveTo(fx - 50, fy - 30 - Math.sin(t * 9) * 8, fx - 36, fy + 6); sc.fill(); sc.fillStyle = '#fff'; sc.beginPath(); sc.arc(fx - 40, fy - 6, 6, 0, 7); sc.fill();
      for (let k = 0; k < 4; k++) { const lx = (W + 60 - ((t * 260 + k * 150) % (W + 120))); sc.fillStyle = k % 2 ? '#f472b6' : '#22d3ee'; sc.fillRect(lx, 120 + k * 18, 40, 4); }
      const cx = 360 + Math.sin(t * 1.3) * 50, cy = 120 + Math.cos(t * 1.7) * 20; sc.fillStyle = '#9ca3af'; sc.beginPath(); sc.arc(cx, cy, 16, 0, 7); sc.fill(); sc.beginPath(); sc.moveTo(cx - 12, cy - 10); sc.lineTo(cx - 8, cy - 26); sc.lineTo(cx - 2, cy - 12); sc.moveTo(cx + 12, cy - 10); sc.lineTo(cx + 8, cy - 26); sc.lineTo(cx + 2, cy - 12); sc.fill(); sc.fillStyle = '#f97316'; sc.fillRect(cx - 6, cy + 14, 12, 10 + Math.random() * 10); }
    sc.fillStyle = 'rgba(0,0,0,0.08)'; for (let y = 0; y < Hh; y += 4) sc.fillRect(0, y, W, 1); scT.needsUpdate = true; }
  drawMovie(0);
  K.update = (dt, { movie = true, dim = 0 } = {}) => { mt += dt; mAcc += dt; if (K.beam) { K.beam.material.opacity = 0.08 + Math.sin(mt * 23) * 0.008 + Math.sin(mt * 3.1) * 0.012; const P = K.motes.pos; for (let i = 0; i < K.motes.n; i++) { P[i * 3 + 1] += Math.sin(mt * 0.7 + i) * dt * 0.02; P[i * 3 + 2] += Math.cos(mt * 0.5 + i * 1.3) * dt * 0.02; } K.motes.motes.geometry.attributes.position.needsUpdate = true; } if (movie && mAcc > 1 / 14) { mAcc = 0; drawMovie(mt); } scrLight.intensity = movie ? 2.2 + Math.sin(mt * 7) * 0.4 : 0; bulbs.forEach((b, i) => { const on = (Math.floor(mt * 6) + i) % 3; b.material.color.setHex(on ? 0xffe9a0 : 0x8a6a2a); if (b.userData.glow) b.userData.glow.material.opacity = on ? 0.55 : 0.1; }); K.lights.forEach(L => L.intensity = L.userData.base * (1 - dim)); };
  K.lights.forEach(L => L.userData.base = L.intensity);
  K.cut.forEach(m => m.traverse(o => o.castShadow = false));
  return K;
}

// ---------------- the stand-alone game: walk the cinema, or work the counter ----------------
export async function createSnackCounter({ container, onState = () => {}, customers = CUSTOMERS, world = '', start = 'walk', onExit = null }) {
  const ST = createStage(container, { bg: '#140e16' }), { touch, CW, CHh, renderer, scene, camera, glowTex, V3, toon, addOutline, M, kit, audio, sun, puff, smokeS } = ST;
  const SND = createCinemaAudio(audio), tone = (f, d, v, type) => SND.tone(f, d, v, type), buzz = ms => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) {} };
  sun.intensity = 0.9; sun.position.set(2, 9, 3);
  const K = buildCinema({ THREE, M, toon, canvasTex, scene, grad: ST.grad, addOutline }), art = K.art, TOP = K.top, KZ = K.z;
  const lampGl = K.lamps.map(l => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd8a0, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); s.position.copy(l.position).add(V3(0, -0.25, 0)); s.scale.setScalar(1.3); scene.add(s); return s; });
  const noGear = f => { const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; return f; };
  const CUST = customers.length ? customers : CUSTOMERS;
  // ---------- cast ----------
  const ben = noGear(kit.makeFox({ ...CAST.player })); scene.add(ben);                                   // Ben as he walks the worlds
  const benU = noGear(kit.makeFox({ ...CAST.player, outfit: 'tee', torso: ['#fbfbf7', '#fbfbf7', '#c42d3c'], crest: '', gear: 'none', mood: 'happy' })); scene.add(benU); benU.visible = false; const BUP = benU.userData.P;
  const popPrint = canvasTex(256, 256, g => { g.clearRect(0, 0, 256, 256); g.lineJoin = 'round'; const st = () => { g.strokeStyle = '#201e1d'; g.lineWidth = 7; g.stroke(); };
    g.fillStyle = '#fff3d6'; for (const [x, y, r] of [[78, 92, 26], [108, 70, 28], [142, 66, 28], [174, 86, 26], [96, 104, 22], [128, 96, 26], [160, 106, 22]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); st(); }
    g.beginPath(); g.moveTo(62, 112); g.lineTo(194, 112); g.lineTo(176, 222); g.lineTo(80, 222); g.closePath(); g.save(); g.clip(); for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? '#fbfbf7' : '#c42d3c'; g.fillRect(56 + i * 20, 110, 20, 120); } g.restore(); g.beginPath(); g.moveTo(62, 112); g.lineTo(194, 112); g.lineTo(176, 222); g.lineTo(80, 222); g.closePath(); st();
    g.save(); g.translate(128, 170); g.rotate(-0.07); g.fillStyle = '#201e1d'; g.fillRect(-112, -24, 224, 48); g.fillStyle = '#ffd23a'; g.fillRect(-106, -18, 212, 36); g.fillStyle = '#c42d3c'; g.font = 'italic 900 34px Archivo, "Arial Black", Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FOX CINEMA', 0, 2); g.restore(); });
  dinerUniform(ST, benU, { print: popPrint, stripe: '#c42d3c', towelCol: '#ffd23a', printY: 1.17 });
  const reel = noGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#d9822b', furDark: '#9a5414' }, torso: ['#c42d3c', '#ffd23a', '#7a1522'], outfit: 'vest', crest: '8', gear: 'none', mood: 'happy' })); reel.position.set(K.reel.x, 0, K.reel.z); reel.rotation.y = K.reel.face; scene.add(reel);
  const stub = noGear(kit.makeFox({ ...CAST.player, look: { ...CAST.player.look, fur: '#8a8f99', furDark: '#5b606a' }, torso: ['#1f2937', '#e6b45a', '#111827'], outfit: 'coat', crest: '', gear: 'none', mood: 'neutral' })); stub.position.set(K.stub.x, 0, K.stub.z); stub.rotation.y = K.stub.face; scene.add(stub);
  const goers = [[1, 2], [4, 3], [2, 3]].map(([si, row], i) => { const seat = K.seats.find(s => s.row === row && Math.abs(s.z - K.seats[si].z) < 0.01) || K.seats[si], f = noGear(kit.makeFox({ ...CAST.player, torso: CUST[(i * 3 + 1) % CUST.length].torso, outfit: 'vest', crest: '', gear: 'none', mood: 'happy' })); f.position.set(seat.x - 0.05, seat.y + 0.02, seat.z); f.rotation.y = Math.PI / 2; f.scale.setScalar(0.92); scene.add(f); f.userData.seat = seat; return f; });
  const seated = [], seatTaken = s => goers.some(f => f.userData.seat === s) || seated.some(q => q.seat === s) || (Math.abs(s.x - K.sitSpot.x - 0.05) < 0.1 && Math.abs(s.z - K.sitSpot.z) < 0.1);
  const custFox = CUST.map(cu => { const f = noGear(kit.makeFox({ ...CAST.player, torso: cu.torso, outfit: cu.outfit || 'vest', crest: '', gear: 'none', mood: 'happy' })); f.visible = false; scene.add(f); return f; });
  const { SAFE, shotFor } = cameraFit(ST);
  const upg = id => !!save.stat(SAVE.upg + id, 0);
  const S = { phase: 'walk', focus: 'all', day: Math.max(1, save.stat(SAVE.day, 1)), t: 0, earned: 0, tips: 0, served: 0, lost: 0, starList: [], flash: null, flashT: 0, say: '', sayT: 0, pay: null, payOut: null, next: 3, done: null, combo: 0, react: null, demo: false, dim: 0, toast: null, toastT: 0 };
  let drag = null;
  const flash = (txt, col = '#ffd23a', t = 1.4) => { S.flash = { txt, col }; S.flashT = t; }, say = (s, t = 3.5) => { S.say = s; S.sayT = t; };
  const can = k => S.day >= UNLOCK[k];
  const sizesAv = () => Object.keys(SIZES).filter(k => SIZES[k].day <= S.day), drinksAv = () => Object.keys(DRINKS).filter(k => DRINKS[k].day <= S.day);

  // ================= WALK MODE =================
  const PL = { x: K.ENTER.x, z: K.ENTER.z - 2.4, yaw: Math.PI, y: 0, vy: 0, sit: false, wave: 0 }, stick = { x: 0, y: 0 }, keys = new Set(); let camYaw = Math.PI, DLG = null, hudPad = false, PAUSE = false;
  const room = (x, z) => x > K.OX + 7 ? K.bounds.screen : K.bounds.lobby;
  function collide(p, r) { for (const c of K.colliders) { if (c.box) { const [x0, x1, z0, z1] = c.box, cx = clamp(p.x, x0, x1), cz = clamp(p.z, z0, z1), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
        if (d < r) { if (d > 1e-5) { p.x = cx + dx / d * r; p.z = cz + dz / d * r; } else { const e = [p.x - x0, x1 - p.x, p.z - z0, z1 - p.z], m = Math.min(...e), i = e.indexOf(m); if (i === 0) p.x = x0 - r; else if (i === 1) p.x = x1 + r; else if (i === 2) p.z = z0 - r; else p.z = z1 + r; } } }
      else { const [cx, cz, cr] = c.c, dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz); if (d < r + cr && d > 1e-5) { p.x = cx + dx / d * (r + cr); p.z = cz + dz / d * (r + cr); } } } }
  const SPOTS = () => [{ key: 'reel', label: 'Talk to REEL', x: K.reel.x - 0.6, z: K.reel.z + 0.5, r: 1.9 }, { key: 'stub', label: 'Talk to STUB', x: K.stub.x, z: K.stub.z, r: 1.6 },
    { key: 'seat', label: 'Sit and watch the movie', x: K.sitSpot.stand.x, z: K.sitSpot.stand.z, r: 1.0 }, { key: 'door', label: K.DOOR.label, x: K.DOOR.x, z: K.DOOR.z, r: 1.3 }, { key: 'poster', label: 'Read the posters', x: -6.2, z: 0.25, r: 1.4 }];
  function nearSpot() { if (PL.sit) return { key: 'stand', label: 'Stand up' }; let best = null, bd = 9; for (const s of SPOTS()) { const d = Math.hypot(PL.x - s.x, PL.z - s.z); if (d < s.r && d < bd) { bd = d; best = s; } } return best; }
  const DLGS = { reel: () => JSON.parse(JSON.stringify(CINEMA_DIALOGUE.reel)), stub: () => ({ ...CINEMA_DIALOGUE.stub, lines: [pick(CINEMA_DIALOGUE.stub.lines)] }), poster: () => ({ ...CINEMA_DIALOGUE.poster }) };
  function openDlg(key) { const d = DLGS[key](); DLG = { ...d, i: 0, showCh: false, base: d }; PL.talkTo = key === 'reel' ? reel : key === 'stub' ? stub : null; if (PL.talkTo) PL.talkTo.userData.talking = true; SND.talk(); }
  function endDlg() { const after = DLG && DLG.after; if (PL.talkTo) PL.talkTo.userData.talking = false; DLG = null; if (after === 'work') toIntro(); }
  const chOn = () => !!(DLG && DLG.choices && !DLG.after && DLG.i >= DLG.lines.length - 1);
  function nextLine() { if (!DLG || chOn()) return; if (DLG.i < DLG.lines.length - 1) DLG.i++; else endDlg(); }
  function choose(i) { if (!chOn()) return; const c = DLG.choices[i]; if (!c) return; c.asked = true; DLG.lines = c.replies; DLG.i = 0; if (c.do) DLG.after = c.do; if (c.bye) DLG.choices = null; SND.tick(); }
  function talk() { if (S.phase !== 'walk') return; SND.unlock(); if (DLG) { nextLine(); return; } const s = nearSpot(); if (!s) return;
    if (s.key === 'stand') { PL.sit = false; PL.x = K.sitSpot.stand.x; PL.z = K.sitSpot.stand.z; PL.yaw = 0; ben.position.y = 0; return; }
    if (s.key === 'seat') { SND.sit(); PL.sit = true; PL.x = K.sitSpot.x; PL.z = K.sitSpot.z; PL.yaw = Math.PI / 2; toast('SPACE FOX II IS ON · TALK AGAIN TO STAND UP'); return; }
    if (s.key === 'door') { toast(world ? 'Back out to ' + world + '…' : 'This door leads back out into the world once the cinema sits in a building.'); return; }
    openDlg(s.key); }
  const toast = (t, d = 3.5) => { S.toast = t; S.toastT = d; };
  function walkStep(dt) { if (DLG) { stick.x = stick.y = 0; if (PL.talkTo) { const t = PL.talkTo.position, ty = Math.atan2(t.x - PL.x, t.z - PL.z); let d = ty - PL.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); PL.yaw += d * Math.min(1, dt * 6); let c = ty - camYaw; c = Math.atan2(Math.sin(c), Math.cos(c)); camYaw += c * Math.min(1, dt * 2.5); PL.talkTo.userData.lookAt = V3(PL.x, 1.5, PL.z); } }
    let ix = stick.x, iy = stick.y; if (!DLG) { if (keys.has('KeyA') || keys.has('ArrowLeft')) ix -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) ix += 1; if (keys.has('KeyW') || keys.has('ArrowUp')) iy += 1; if (keys.has('KeyS') || keys.has('ArrowDown')) iy -= 1; }
    const l = Math.hypot(ix, iy); if (l > 1) { ix /= l; iy /= l; } let sp = 0;
    if (PL.sit) { ix = iy = 0; }
    if (l > 0.08) { const fx = Math.sin(camYaw), fz = Math.cos(camYaw), rx = -Math.cos(camYaw), rz = Math.sin(camYaw), mx = fx * iy + rx * ix, mz = fz * iy + rz * ix, ml = Math.hypot(mx, mz); sp = 3.4 * Math.min(1, l);
      PL.x += mx / ml * sp * dt; PL.z += mz / ml * sp * dt; PL.stepAcc = (PL.stepAcc || 0) + sp * dt; if (PL.stepAcc > 0.8 && PL.y === 0) { PL.stepAcc = 0; SND.step(); } const ty = Math.atan2(mx, mz); let d = ty - PL.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); PL.yaw += d * Math.min(1, dt * 12); collide(PL, 0.34); }
    PL.vy -= 18 * dt; const wasAir = PL.y > 0; PL.y = Math.max(0, PL.y + PL.vy * dt); if (PL.y === 0) { PL.vy = Math.max(0, PL.vy); if (wasAir) SND.land(); } { const inS = PL.x > K.OX + 7; if (inS !== PL.inScreen) { if (PL.inScreen !== undefined) SND.curtain(); PL.inScreen = inS; } }
    ben.position.set(PL.x, PL.sit ? K.sitSpot.y + 0.02 : PL.y, PL.z); ben.rotation.y = PL.yaw; kit.animFox(ben, dt, sp, PL.y > 0.02);
    if (PL.wave > 0) { PL.wave -= dt; const arm = ben.userData.P.arms[0]; arm.rotation.set(-0.25, 0, -2.55 + Math.sin(PL.wave * 18) * 0.32); }
    for (const f of [reel, stub, ...goers]) { if (f !== PL.talkTo || !DLG) f.userData.lookAt = Math.hypot(f.position.x - PL.x, f.position.z - PL.z) < 3.2 && f !== goers[0] && f !== goers[1] && f !== goers[2] ? V3(PL.x, 1.5, PL.z) : null; kit.animFox(f, dt, 0); }
    // camera: behind Ben, swings round slowly when he walks; inside the room he is in
    if (PL.sit) { const sx = K.sitSpot.x - (CW() < CHh() ? 1.6 : 1.1), pos = V3(sx, 3.3 + K.sitSpot.y, K.sitSpot.z - 0.9); camera.position.lerp(pos, Math.min(1, dt * 3)); CAM.look.lerp(V3(K.OX + K.screen.x, K.screen.y - 0.2, K.OZ + K.screen.z * 0.75 + (K.sitSpot.z - K.OZ) * 0.25), Math.min(1, dt * 3)); camera.lookAt(CAM.look); return; }
    if (sp > 0.5 && Math.abs(stick.x) < 0.7) { let d = PL.yaw - camYaw; d = Math.atan2(Math.sin(d), Math.cos(d)); camYaw += d * Math.min(1, dt * 1.6); }
    const port = CW() < CHh(), dist = port ? 4.8 : 4.4, ht = port ? 3.5 : 2.6, B = room(PL.x, PL.z), cp = V3(PL.x - Math.sin(camYaw) * dist, ht, PL.z - Math.cos(camYaw) * dist);
    cp.x = clamp(cp.x, K.OX + B[0] + 0.35, K.OX + B[1] - 0.35); cp.z = clamp(cp.z, K.OZ + B[2] + 0.35, K.OZ + B[3] - 0.35);
    const short = Math.max(0, dist - Math.hypot(cp.x - PL.x, cp.z - PL.z)); cp.y = Math.min(K.H - 0.35, ht + short * 0.55);
    const ahead = (port ? 1.6 : 0.8) + short * 0.5; camera.position.lerp(cp, Math.min(1, dt * 5)); CAM.look.lerp(V3(PL.x + Math.sin(camYaw) * ahead, 1.15 + PL.y * 0.5, PL.z + Math.cos(camYaw) * ahead), Math.min(1, dt * 8)); camera.lookAt(CAM.look); }
  function stdWalk() { const s = !DLG && S.phase === 'walk' ? nearSpot() : null; const d = DLG ? { name: DLG.name, role: DLG.role, text: DLG.lines[Math.min(DLG.i, DLG.lines.length - 1)], choices: chOn() ? DLG.choices.map(c => ({ text: c.label, asked: c.asked, bye: c.bye })) : null, step: DLG.i + 1, total: DLG.lines.length, more: false, required: false } : null;
    return { prompt: s ? s.label : null, dialog: d, toast: S.toast, place: CINEMA.name + (world ? ' · ' + world : ''), quest: PL.sit ? 'SCREEN 1 · SPACE FOX II · talk again to stand up' : PL.x > K.OX + 7 ? 'SCREEN 1 · find the glowing aisle seat to watch' : 'FOX CINEMA · talk to REEL at the snack counter for a shift (day ' + S.day + ')' }; }

  // ================= THE SHIFT =================
  const CAM = { look: V3(), from: null, to: null, t: 1, dur: 1 };
  function glideTo(shot, dur = 1.6) { CAM.from = { pos: camera.position.clone(), look: CAM.look.clone() }; CAM.to = shot; CAM.t = 0; CAM.dur = dur; }
  const STATIONS = [['all', 'ALL'], ['pop', 'POPCORN'], ['drinks', 'DRINKS'], ['candy', 'CANDY', 'candy'], ['dog', 'HOT DOG', 'dog'], ['nachos', 'NACHOS', 'nachos'], ['serve', 'SERVE']];
  const stationsOn = () => STATIONS.filter(s => !s[2] || can(s[2]));
  const P3 = (x, z, y = TOP) => V3(x, y, z);
  function shotPoints(id) { const o = [], pc = K.pop;
    if (id === 'pop') { for (const sx of [-1, 1]) for (const sz of [-1, 1]) o.push(P3(pc.x + sx * 0.66, pc.z + sz * 0.4), P3(pc.x + sx * 0.66, pc.z + sz * 0.4, TOP + 1.45)); o.push(P3(K.scoop.x - 0.12, K.scoop.z - 0.1), P3(K.sizes.L.x - 0.15, K.sizes.L.z), P3(K.fill.x, K.fill.z - 0.15), P3(K.shakers.cheese.x + 0.08, K.shakers.cheese.z - 0.08)); }
    else if (id === 'drinks') { o.push(P3(K.fount.x + 0.55, KZ - 0.62), P3(K.slush.x - 0.5, KZ - 0.62), P3(K.fount.x + 0.55, K.fount.z, TOP + 0.85), P3(K.slush.x - 0.5, K.slush.z, TOP + 0.8)); }
    else if (id === 'candy') { o.push(P3(K.candy.x - 0.55, K.candy.z - 0.35), P3(K.candy.x + 0.55, K.candy.z + 0.3), P3(K.candy.x, K.candy.z + 0.2, TOP + 0.45)); }
    else if (id === 'dog') { o.push(P3(K.roller.x - 0.45, KZ - 0.72), P3(K.roller.x + 0.45, KZ - 0.72), P3(K.franks.x - 0.2, K.franks.z + 0.12), P3(K.franks.x + 0.2, K.franks.z + 0.12, TOP + 0.15), P3(K.roller.x, K.roller.z, TOP + 0.3)); }
    else if (id === 'nachos') { o.push(P3(K.chips.x - 0.18, K.chips.z - 0.15), P3(K.chipsBag.x + 0.14, K.chipsBag.z - 0.1), P3(K.nacho.x - 0.2, K.nacho.z + 0.2, TOP + 0.5), P3(K.nacho.x + 0.2, K.nacho.z + 0.2)); }
    else if (id === 'serve') { o.push(P3(K.tray.x - 0.5, K.tray.z - 0.3), P3(K.tray.x + 0.5, K.tray.z + 0.3), P3(K.bin.x - 0.15, K.bin.z), ...K.spots.flatMap(s => [P3(s.x - 0.45, s.z, 2.25), P3(s.x + 0.45, s.z, 2.25), P3(s.x, s.z, 1.1)])); }
    else { o.push(P3(-4.0, KZ - 0.7), P3(3.6, KZ - 0.7), P3(-4.0, KZ + 1.0), P3(3.6, KZ + 1.0), P3(pc.x, pc.z, TOP + 1.45), ...K.spots.map(s => P3(s.x, s.z, 1.6))); }
    if (id !== 'all' && id !== 'serve') { let x0 = 9, x1 = -9; o.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); }); const cx = (x0 + x1) / 2, hw = Math.max(0.75, (x1 - x0) / 2); o.push(P3(cx - hw, KZ - 0.72), P3(cx + hw, KZ - 0.72), P3(cx, KZ + 0.5, TOP + 0.4)); }
    return o; }
  function workShot(id = S.focus || 'all') { const port = CW() < CHh(); return shotFor('w:' + id, () => shotPoints(id), id === 'serve' ? (port ? 0.75 : 0.55) : id === 'pop' ? (port ? 0.62 : 0.5) : id === 'drinks' ? (port ? 0.62 : 0.5) : id === 'dog' || id === 'nachos' || id === 'candy' ? (port ? 0.8 : 0.65) : id === 'all' && port ? 1.3 : port ? 1.1 : 0.85, 0, id === 'all' ? 0.03 : 0.06); }
  function wideShot() { const port = CW() < CHh(), z = KZ + 3.7, bx = 1.6, pts = [V3(bx - 0.5, 0.05, z), V3(bx + 0.5, 0.05, z), V3(bx - 0.5, 2.3, z), V3(bx + 0.5, 2.3, z), V3(bx, 2.6, z)]; return port ? shotFor('wideP', () => pts, 0.1, Math.PI - 0.25, 0.1) : shotFor('wideL', () => pts, 0.12, Math.PI - 0.32, 0.05); }
  function setFocus(id) { if (S.focus === id) return; S.focus = id; S.userFocusT = performance.now(); }

  // ---------- KETTLE: load → heat → popping (stir!) → done (dump!) ----------
  const KT = { st: 'empty', heat: 0, p: 0, scorch: 0, stirV: 0, stirAcc: 0, dry: 0, tilt: 0, popAcc: 0, lastRate: 0, demoStir: false }; let stock = 4;
  const kettleW = () => { K.kettle.updateWorldMatrix(true, false); return K.kettle.getWorldPosition(V3()); };
  const POPN = 320, popIM = new THREE.InstancedMesh(art.piece, art.pieceMat.clone(), POPN); popIM.frustumCulled = false; scene.add(popIM); const pops = Array.from({ length: POPN }, () => ({ on: false, p: V3(), v: V3(), r: V3(), w: V3(), life: 0, col: 0 })); let popI = 0; const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = V3(1, 1, 1);
  const popCols = [new THREE.Color('#ffffff'), new THREE.Color('#ffd166'), new THREE.Color('#4a3420'), new THREE.Color('#f2c14e')]; for (let i = 0; i < POPN; i++) popIM.setColorAt(i, popCols[0]);
  function spawnPop(from, v, col = 0) { const q = pops[popI = (popI + 1) % POPN]; q.on = true; q.p.copy(from); q.v.copy(v); q.r.set(rr(0, 6), rr(0, 6), rr(0, 6)); q.w.set(rr(-12, 12), rr(-12, 12), rr(-12, 12)); q.life = 0; q.col = col; popIM.setColorAt(popI, popCols[col]); popIM.instanceColor.needsUpdate = true; }
  // ---------- the cabinet pile: every kernel that lands stays; the mound only rises once there is a lot of corn ----------
  const PER = 30, LD = K.landed, PC0 = () => K.popG.getWorldPosition(V3()); let landRemoveAcc = 0;
  const shownServ = () => LD.list.length / PER, moundH = () => Math.max(0, (shownServ() - 3) / 11) * 0.42;
  const surf = (lx, lz, mh = moundH()) => { const kk = Math.min(1, mh / 0.42), rx = 0.6 * (0.6 + 0.35 * kk) * 0.95, rz = 0.6 * (0.36 + 0.19 * kk) * 0.95; return 0.17 + mh * Math.sqrt(Math.max(0, 1 - (lx / rx) ** 2 - ((lz - 0.02) / rz) ** 2)) + 0.014; };
  function landWrite(i) { const L = LD.list[i]; _e.set(L.r.x, L.r.y, L.r.z); _q.setFromEuler(_e); _s.setScalar(1); _m.compose(L.p, _q, _s); LD.im.setMatrixAt(i, _m); LD.im.setColorAt(i, popCols[L.col]); }
  function landAdd(lp, rot, col) { if (LD.list.length >= LD.max) return false; LD.list.push({ p: lp.clone(), r: rot.clone(), col }); landWrite(LD.list.length - 1); LD.im.count = LD.list.length; LD.im.instanceMatrix.needsUpdate = true; if (LD.im.instanceColor) LD.im.instanceColor.needsUpdate = true; return true; }
  function landFillTo(n) { const pc = K.pop; while (LD.list.length < Math.min(LD.max, n)) { const lx = rr(-pc.w / 2 + 0.06, pc.w / 2 - 0.06), lz = rr(-pc.d / 2 + 0.06, pc.d / 2 - 0.06), mh = Math.min(0.42, Math.max(0, ((LD.list.length + 1) / PER - 2.2) / 8) * 0.42); landAdd(V3(lx, surf(lx, lz, mh) - rr(0, 0.01), lz), V3(rr(0, 6), rr(0, 6), rr(0, 6)), Math.random() < 0.12 ? 3 : 0); } }
  function landTrim(n) { if (LD.list.length <= n) return; LD.list.length = Math.max(0, n); LD.im.count = LD.list.length; const mh = moundH(); LD.list.forEach((L, i) => { const sy = surf(L.p.x, L.p.z, mh); if (L.p.y > sy + 0.02) { L.p.y = sy - 0.005; landWrite(i); } }); LD.im.instanceMatrix.needsUpdate = true; }
  const pileTarget = () => Math.round((stock + ((KT.st === 'popping' || KT.st === 'done' || KT.st === 'burnt') ? KT.p * (upg('bigKettle') ? 8 : 6) : 0)) * PER);
  function loadKettle() { if (KT.st !== 'empty') { flash(KT.st === 'heat' ? 'HEATING UP · GET READY TO STIR' : 'KETTLE IS BUSY', '#ffffff', 1); return; } KT.st = 'heat'; KT.heat = 0; KT.p = 0; KT.scorch = 0; KT.dry = 0; K.kOil.visible = true; SND.kernels(); const kp = kettleW(); for (let i = 0; i < 14; i++) spawnPop(V3(K.scoop.x, TOP + 0.2, K.scoop.z), V3((kp.x - K.scoop.x) * 1.6 + rr(-0.2, 0.2), 3.2, (kp.z - K.scoop.z) * 1.6 + rr(-0.1, 0.1)), 1); }
  function dump() { if (KT.st !== 'popping' && KT.st !== 'done' && KT.st !== 'burnt') { flash(KT.st === 'empty' ? 'NOTHING IN THE KETTLE' : 'NOT POPPING YET', '#ffffff', 1); return; }
    const p = KT.p, burnt = KT.st === 'burnt', mx = upg('bigKettle') ? 8 : 6, y0 = () => burnt ? 0.6 : Math.max(0.5, p * 1.4); let y = 0, msg, col;
    SND.lever(); SND.dump(y0(), burnt); buzz(40);
    if (burnt) { msg = 'BURNT BATCH · SCRAPPED'; col = '#ec3013'; SND.error(); }
    else if (p < 0.72) { y = Math.round(mx * p * 0.5); msg = 'TOO EARLY · OLD MAIDS · +' + y; col = '#ff9a8a'; SND.error(); }
    else if (p < 0.88) { y = Math.round(mx * p); msg = 'A BIT EARLY · +' + y; col = '#ffd23a'; SND.good(); }
    else { y = mx; msg = 'PERFECT BATCH! +' + y; col = '#22c55e'; setTimeout(() => SND.perfect(), 350); for (let i = 0; i < 14; i++) setTimeout(() => { const kp2 = kettleW(); puff(kp2.x + rr(-0.5, 0.5), kp2.y - rr(0.2, 0.7), kp2.z + rr(-0.3, 0.3), 0xffd23a, 1); }, 300 + i * 40); S.perfectPops = (S.perfectPops || 0) + 1; }
    stock = Math.min(14, stock + y); flash(msg, col, 1.8); KT.tilt = 1; KT.st = 'empty'; K.kOil.visible = false; KT.p = 0; KT.scorch = 0; KT.heat = 0;
    const kp = kettleW(); for (let i = 0; i < (burnt ? 30 : 40 + y * 8); i++) spawnPop(kp.clone().add(V3(-0.18 + rr(-0.05, 0.05), -0.05 + rr(-0.05, 0.05), rr(-0.12, 0.12))), V3(rr(-1.5, -0.3), rr(-0.2, 1.2), rr(-0.5, 0.5)), burnt ? 2 : Math.random() < 0.15 ? 3 : 0); if (burnt) for (let i = 0; i < 6; i++) puff(kp.x, kp.y + 0.2, kp.z, 0x3a3836, 1); }
  function kettleStep(dt) { const kp = kettleW(); KT.stirV = KT.demoStir ? 7 : damp(KT.stirV, KT.stirAcc / Math.max(dt, 1e-3), 6, dt); KT.stirAcc = 0; const stirring = KT.stirV > 2.2, sf = 0.5 + 0.5 * Math.min(1, KT.stirV / 5);
    if (KT.st === 'heat') { KT.heat += dt / 2.6; if (Math.random() < dt * 4) puff(kp.x, kp.y + 0.1, kp.z, 0xffffff, 1); if (KT.heat >= 1) { KT.st = 'popping'; KT.p = 0; SND.pop(0, 1.4); } }
    else if (KT.st === 'popping' || KT.st === 'done') { if (KT.st === 'popping') { const rate = 1.05 * sf * (KT.p + 0.06) * (1 - KT.p); KT.p = Math.min(0.995, KT.p + rate * dt); KT.lastRate = rate; KT.popAcc += rate * dt * PER * (upg('bigKettle') ? 8 : 6) * 1.3;
        while (KT.popAcc > 1) { KT.popAcc -= 1; const a = rr(0, 6.28), spill = Math.random() < 0.45, col = Math.random() < 0.12 ? 3 : 0;
          if (spill) spawnPop(kp.clone().add(V3(Math.cos(a) * 0.22, 0.13, Math.sin(a) * 0.22)), V3(Math.cos(a) * rr(0.3, 0.9), rr(0.1, 0.7), Math.sin(a) * rr(0.2, 0.6)), col);
          else spawnPop(kp.clone().add(V3(rr(-0.15, 0.15), 0.16, rr(-0.15, 0.15))), V3(rr(-1.2, 1.2), rr(0.6, 2.4), rr(-0.7, 0.7)), col);
          { const ps = scr(kp); SND.pop(ps.x / CW() * 2 - 1, rr(0.7, 1.2)); } if (Math.random() < 0.02) buzz(8); }
        if (KT.p >= 0.97) { KT.st = 'done'; flash('POPPING SLOWED · DUMP IT!', '#22c55e', 1.6); SND.good(); buzz([20, 40, 20]); } }
      KT.scorch = clamp(KT.scorch + dt * (KT.st === 'done' ? 0.22 : stirring ? -0.12 : 0.24) * (upg('stirrer') ? 0.5 : 1), 0, 1);
      if (KT.scorch >= 1) { KT.st = 'burnt'; flash('SCORCHED! DUMP THE BURNT BATCH', '#ec3013', 2); SND.scorch(); buzz(120); } }
    if (KT.st === 'burnt' && Math.random() < dt * 6) puff(kp.x, kp.y + 0.25, kp.z, 0x3a3836, 1);
    K.kPaddle.rotation.y += (KT.demoStir ? 7 : KT.stirV) * dt * (KT.demoStir ? 1 : 0) + (KT.stirDelta || 0); KT.stirDelta = 0;
    K.kLid.position.y = 0.14 + (KT.st === 'popping' ? Math.abs(Math.sin(performance.now() / 50)) * 0.03 * KT.lastRate * 3 : 0);
    KT.tilt = Math.max(0, KT.tilt - dt * 1.4); K.kettle.rotation.z = Math.sin(Math.min(1, KT.tilt) * Math.PI) * 1.6; K.kettle.position.x = 0.05 + (KT.st === 'popping' ? Math.sin(performance.now() / 30) * 0.004 : 0);
    K.kOil.material.color.set(KT.st === 'burnt' ? '#3a2a1a' : '#e8b84a'); K.popGlow.material.opacity = 0.22 + (KT.st === 'popping' ? 0.12 + Math.sin(performance.now() / 70) * 0.04 : KT.st === 'heat' ? 0.08 * KT.heat : 0);
    K.leverKnob.material.color.set(KT.st === 'done' || KT.st === 'burnt' ? (Math.sin(performance.now() / 120) > 0 ? '#ffd23a' : '#ec3013') : '#ec3013'); K.lever.rotation.x = damp(K.lever.rotation.x, S.lever ? 0.7 : 0, 12, dt);
    // pile: the mound appears only once enough kernels have landed; scooping takes kernels off the top
    { const tgt = pileTarget(), live = KT.st === 'popping' || KT.st === 'done' || KT.st === 'burnt' || KT.tilt > 0;
      if (LD.list.length > tgt + 2) { landRemoveAcc += dt * 90; const n = Math.floor(landRemoveAcc); if (n) { landRemoveAcc -= n; landTrim(Math.max(tgt, LD.list.length - n)); } }
      else if (!live && LD.list.length < tgt - 4 && !pops.some(q => q.on && q.life < 2)) landFillTo(tgt);
      const mh = moundH(), kk = Math.min(1, mh / 0.42); K.pile.visible = mh > 0.004; K.pile.scale.set(0.6 + 0.35 * kk, Math.max(0.01, mh / 0.45), 0.36 + 0.19 * kk); }
    // flying corn: bounces off the glass, lands and STAYS in the case (until the pile is full)
    const pc = K.pop, W0 = PC0(), fx0 = pc.x - pc.w / 2 + 0.035, fx1 = pc.x + pc.w / 2 - 0.035, fz0 = pc.z - pc.d / 2 + 0.035, fz1 = pc.z + pc.d / 2 - 0.035, tgtN = pileTarget(); let landed = 0;
    for (let i = 0; i < POPN; i++) { const q = pops[i]; if (!q.on) { _m.makeScale(0, 0, 0); popIM.setMatrixAt(i, _m); continue; } q.life += dt; q.v.y -= 6.5 * dt; q.p.addScaledVector(q.v, dt); q.r.addScaledVector(q.w, dt);
      const inside = q.p.x > fx0 - 0.08 && q.p.x < fx1 + 0.08 && q.p.z > fz0 - 0.08 && q.p.z < fz1 + 0.08 && q.p.y > TOP + 0.1 && q.p.y < TOP + pc.h + 0.1;
      if (inside) { if (q.p.x < fx0) { q.p.x = fx0; q.v.x *= -0.45; } if (q.p.x > fx1) { q.p.x = fx1; q.v.x *= -0.45; } if (q.p.z < fz0) { q.p.z = fz0; q.v.z *= -0.45; } if (q.p.z > fz1) { q.p.z = fz1; q.v.z *= -0.45; } if (q.p.y > TOP + pc.h - 0.03) { q.p.y = TOP + pc.h - 0.03; q.v.y = -Math.abs(q.v.y) * 0.3; } }
      const lx = q.p.x - W0.x, lz = q.p.z - W0.z, fl = inside ? W0.y + surf(lx, lz) : TOP + 0.02;
      if (q.p.y < fl) { q.p.y = fl; q.v.y = Math.abs(q.v.y) * 0.28; q.v.x *= 0.55; q.v.z *= 0.55; q.w.multiplyScalar(0.5);
        if (inside && (q.v.y < 0.25 || q.life > 1.1) && q.col !== 1 && landed < 12 && LD.list.length < tgtN + 6 && landAdd(V3(lx, q.p.y - W0.y - rr(0, 0.006), lz), q.r, q.col)) { q.on = false; landed++; _m.makeScale(0, 0, 0); popIM.setMatrixAt(i, _m); continue; } }
      if (q.life > 2.8) q.on = false; const sc = q.life > 2.4 ? (2.8 - q.life) / 0.4 : 1; _e.set(q.r.x, q.r.y, q.r.z); _q.setFromEuler(_e); _s.setScalar(sc); _m.compose(q.p, _q, _s); popIM.setMatrixAt(i, _m); }
    popIM.instanceMatrix.needsUpdate = true; }

  // ---------- BUCKET: size → hold to fill → butter pumps → flavour shake → tray ----------
  let BK = null;
  function takeBucket(size) { if (!SIZES[size] || SIZES[size].day > S.day) { flash('LARGE BUCKETS FROM DAY 2', '#ffffff', 1); return; } if (BK) { if (BK.fill < 0.02) { scene.remove(BK.mesh); BK = null; } else { flash('ONE BUCKET AT A TIME · TAP IT FOR THE TRAY', '#ffffff', 1.2); return; } }
    const m = art.bucket(size); m.position.set(K.fill.x, TOP, K.fill.z); scene.add(m); BK = { size, mesh: m, fill: 0, butter: 0, flavor: null, flv: 0, st: 'empty', q: 0, used: false }; SND.bucket(); }
  const bkSet = () => BK && BK.mesh.userData.set(BK.fill, BK.butter, BK.flavor, BK.flv);
  const FILL_OK = [0.86, 1.02], POUR_OK = [0.84, 1.0], CHEESE_OK = [0.78, 1.04];
  function pumpButter() { if (!BK || BK.fill < 0.5) { flash(BK ? 'FILL THE BUCKET FIRST' : 'GRAB A BUCKET FIRST', '#ffffff', 1); return; } BK.butter = Math.min(8, BK.butter + 1); bkSet(); K.pumpHead.position.y = TOP + 0.34; SND.butter(); const p = BK.mesh.position; for (let i = 0; i < 4; i++) spawnPop(V3(p.x + rr(-0.03, 0.03), p.y + SIZES[BK.size].h + 0.25, p.z), V3(rr(-0.1, 0.1), -0.5, rr(-0.1, 0.1)), 1); if (BK.butter > 4) flash('TOO MUCH BUTTER · SOGGY', '#ff9a8a', 1); }
  function bucketToTray() { if (!BK) return; if (BK.fill < 0.3) { flash('HOLD THE SCOOP TO FILL IT', '#ffffff', 1.1); return; } const fq = BK.fill >= FILL_OK[0] && BK.fill <= FILL_OK[1] ? 1 : BK.fill > FILL_OK[1] ? 0.6 : 0.55 + 0.4 * BK.fill;
    addTray({ type: 'pop', size: BK.size, butter: BK.butter, flavor: BK.flv >= 0.5 ? BK.flavor : null, flv: BK.flv, q: fq, label: SIZES[BK.size].name + ' POPCORN' + (BK.butter ? ' · BUTTER ' + BK.butter : '') + (BK.flavor && BK.flv >= 0.5 ? ' · ' + FLAVORS[BK.flavor].name : '') }); scene.remove(BK.mesh); BK = null; }

  // ---------- DRINKS + SLUSHIES: hold to pour, let go at the line ----------
  const cups = []; // { tap, k, g, fill, foam, lid }
  const cupAt = tp => cups.find(c => c.tap === tp);
  function addCup(tp) { const c = { tap: tp, k: tp.k, g: art.cup(tp.k), fill: 0, foam: 0, spill: false }; c.g.position.set(tp.x, TOP + 0.03, tp.z); scene.add(c.g); cups.push(c); SND.cupDown(); if (!DRINKS[tp.k].slush) setTimeout(() => SND.ice(), 120); return c; }
  const stream = (() => { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 1, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); st.visible = false; scene.add(st); return st; })();
  function cupToTray(c) { if (c.fill < 0.3) { flash('HOLD THE TAP TO POUR', '#ffffff', 1); return; } const q = c.spill ? 0.6 : c.fill >= POUR_OK[0] ? 1 : 0.55 + 0.4 * c.fill; SND.lid(); addTray({ type: 'drink', k: c.k, q, label: DRINKS[c.k].name }, true); scene.remove(c.g); cups.splice(cups.indexOf(c), 1); }
  // ---------- HOT DOGS: franks on the roller → golden → bun → zigzag the sauce ----------
  const dogs = [null, null, null, null]; let BUN = null; // dogs[i] = { g, c }
  const DOG_GOLD = 1, dogBurn = () => upg('warmer') ? 3.4 : 2.2;
  function addDog() { if (!can('dog')) return; const i = dogs.findIndex(d => !d); if (i < 0) { flash('ROLLER IS FULL', '#ffffff', 0.9); return; } const g = art.hotdog(); const R = K.rollers[i]; g.position.set(R.x, R.y, R.z); scene.add(g); dogs[i] = { g, c: 0 }; SND.sizzleTick(); }
  function takeDog(i) { const d = dogs[i]; if (!d) return; if (d.c >= dogBurn()) { scene.remove(d.g); dogs[i] = null; flash('BURNT DOG · BIN', '#ec3013', 1.1); SND.bin(); return; } if (d.c < DOG_GOLD) { flash('NOT GOLDEN YET', '#ffffff', 0.9); return; } if (BUN) { flash('ONE DOG IN THE BUN AT A TIME', '#ffffff', 1); return; }
    dogs[i] = null; d.g.userData.bun.visible = true; d.g.position.set(K.bunSpot.x, TOP + 0.04, K.bunSpot.z); d.g.rotation.x = 0; BUN = { g: d.g, q: d.c < 1.6 ? 1 : 0.8, top: null, n: 0, sel: null }; SND.bun(); }
  function dogToTray() { if (!BUN) return; addTray({ type: 'dog', top: BUN.n >= 4 ? BUN.top : 'plain', q: BUN.q * (BUN.top && BUN.n > 0 && BUN.n < 4 ? 0.8 : 1), label: 'HOT DOG · ' + (BUN.n >= 4 ? DOGS[BUN.top] : 'PLAIN') }); scene.remove(BUN.g); BUN = null; }
  // ---------- NACHOS: chips → hold the cheese pump ----------
  let NACH = null;
  function addNachos() { if (!can('nachos')) return; if (NACH) { flash('ONE TRAY AT A TIME', '#ffffff', 0.9); return; } const g = art.nachoTray(0); g.position.set(K.chips.x, TOP + 0.005, K.chips.z); scene.add(g); NACH = { g, cheese: 0 }; SND.chips(); }
  function nachosToTray() { if (!NACH) return; if (NACH.cheese < 0.2) { flash('HOLD THE CHEESE PUMP', '#ffffff', 1); return; } const q = NACH.cheese >= CHEESE_OK[0] && NACH.cheese <= CHEESE_OK[1] ? 1 : NACH.cheese > CHEESE_OK[1] ? 0.65 : 0.5 + 0.4 * NACH.cheese; addTray({ type: 'nachos', q, label: 'NACHOS' }); scene.remove(NACH.g); NACH = null; }
  // ---------- THE TRAY ----------
  const tray = [], trayG = new THREE.Group(); trayG.position.set(K.tray.x, TOP + 0.03, K.tray.z); scene.add(trayG); const trayHome = trayG.position.clone();
  const trayPlate = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.025, 0.5), toon('#c42d3c')); addOutline(trayPlate, 0.006); trayPlate.visible = false; trayG.add(trayPlate);
  function rebuildTray() { while (trayG.children.length > 1) trayG.remove(trayG.children[1]); tray.forEach((it, i) => { let m; if (it.type === 'pop') { m = art.bucket(it.size); m.userData.set(1, it.butter, it.flavor, it.flv); } else if (it.type === 'drink') { m = art.cup(it.k); m.userData.set(1, 0, true); } else if (it.type === 'candy') { m = art.candyBox(it.k); } else if (it.type === 'dog') { m = art.hotdog(); m.userData.bun.visible = true; if (it.top !== 'plain') art.squiggle(m, it.top, 4); m.userData.dog.material = toon('#c46a3a'); m.position.y = 0.03; } else m = art.nachoTray(1);
    const col = i % 4, row = Math.floor(i / 4); m.position.x += -0.3 + col * 0.2; m.position.z += -0.1 + row * 0.2; trayG.add(m); }); trayPlate.visible = tray.length > 0 && drag; }
  function addTray(it, quiet) { if (tray.length >= 8) { flash('TRAY IS FULL', '#ffffff', 1); SND.error(); return false; } tray.push(it); rebuildTray(); if (it.type === 'candy') SND.candy(); else if (!quiet) SND.tray(); buzz(10); puff(K.tray.x, TOP + 0.2, K.tray.z, 0xfff3d0, 1); return true; }
  function binLast() { const it = tray.pop(); if (!it) { flash('TRAY IS EMPTY', '#ffffff', 0.9); return; } rebuildTray(); flash(it.label + ' BINNED', '#ec3013', 1.1); SND.bin(); }

  // ---------- customers + orders ----------
  const orders = []; let idSeq = 1;
  const itemLabel = w => w.type === 'pop' ? SIZES[w.size].name + ' POPCORN' : w.type === 'drink' ? DRINKS[w.k].name : w.type === 'candy' ? CANDY[w.k].name : w.type === 'dog' ? 'HOT DOG' : 'NACHOS';
  const itemSub = w => w.type === 'pop' ? [...(w.butter ? [BUTTER[w.butter]] : []), ...(w.flavor ? [FLAVORS[w.flavor].name] : [])].join(' · ') : w.type === 'dog' ? DOGS[w.top] : w.type === 'drink' ? (DRINKS[w.k].slush ? 'SLUSHIE' : '') : '';
  const itemPrice = w => w.type === 'pop' ? SIZES[w.size].price + (w.flavor ? 1 : 0) : w.type === 'drink' ? DRINKS[w.k].price : w.type === 'candy' ? 3 : 5;
  function unseat(q) { const i = seated.indexOf(q); if (i >= 0) seated.splice(i, 1); q.f.visible = false; q.f.position.y = 0; q.f.scale.setScalar(1); if (q.snack) { q.f.remove(q.snack); q.f.userData.hold = null; } }
  function clearSeated() { while (seated.length) unseat(seated[0]); }
  function carrySnack(o, items) { const it = items.find(w => w.type === 'pop') || items.find(w => w.type === 'drink') || items[0]; if (!it) return; let m; if (it.type === 'pop') { m = art.bucket(it.size); m.userData.set(1, it.butter, it.flavor, it.flv || 1); } else if (it.type === 'drink') { m = art.cup(it.k); m.userData.set(1, 0, true); } else if (it.type === 'candy') m = art.candyBox(it.k); else if (it.type === 'dog') { m = art.hotdog(); m.userData.bun.visible = true; } else m = art.nachoTray(1);
    m.position.set(-0.36, 0.92, 0.3); m.scale.setScalar(1.15); o.f.add(m); o.snack = m; o.f.userData.hold = { right: true }; }
  function toSeats(o) { const free = K.seats.filter(q => q.row > 0 && !seatTaken(q)), seat = free.length ? pick(free) : null; o.seat = seat; o.path = [V3(K.OX, 0, K.OZ + 1.5), V3(K.OX + 6.4, 0, K.OZ + 3.5), V3(K.OX + 8.2, 0, K.OZ + 3.5)];
    if (seat) { o.path.push(V3(seat.x - 0.75, 0, K.OZ + 2.2), V3(seat.x - 0.75, 0, seat.z), V3(seat.x - 0.05, 0, seat.z)); o.st = 'toSeat'; seated.push({ f: o.f, ci: o.ci, seat, snack: null, pending: true }); } else o.st = 'leave'; }
  function newOrder() { const free = K.spots.findIndex((_, i) => !orders.some(o => o.spot === i && o.st !== 'leave' && o.st !== 'gone')); if (free < 0) return; const used = [...orders.map(o => o.ci), ...seated.map(q => q.ci)]; let pool = CUST.map((_, i) => i).filter(i => !used.includes(i)); if (!pool.length && seated.length) { unseat(seated[0]); pool = CUST.map((_, i) => i).filter(i => !orders.some(o => o.ci === i) && !seated.some(q => q.ci === i)); } if (!pool.length) return; const ci = pick(pool), d = S.day, items = [];
    if (Math.random() < 0.9) { const sz = sizesAv(); items.push({ type: 'pop', size: pick(sz.length > 2 && Math.random() < 0.5 ? ['M', 'L'] : sz), butter: pick([0, 2, 2, 4]), flavor: can('flavor') && Math.random() < 0.35 ? pick(Object.keys(FLAVORS)) : null }); }
    if (Math.random() < 0.65) items.push({ type: 'drink', k: pick(drinksAv()) });
    if (can('candy') && Math.random() < 0.4) items.push({ type: 'candy', k: pick(Object.keys(CANDY)) });
    if (can('dog') && Math.random() < 0.35) items.push({ type: 'dog', top: pick(['plain', 'mustard', 'mustard', 'ketchup']) });
    if (can('nachos') && Math.random() < 0.3) items.push({ type: 'nachos' });
    if (!items.length) items.push({ type: 'pop', size: 'M', butter: 2, flavor: null }); items.length = Math.min(items.length, 2 + Math.floor(d / 2));
    const total = items.reduce((s, w) => s + itemPrice(w), 0), patMax = (78 - Math.min(24, (d - 1) * 6)) * (upg('marquee') ? 1.2 : 1), sp = K.spots[free], f = custFox[ci];
    f.visible = true; f.position.set(K.OX + rr(-0.5, 0.5), 0, K.OZ + 5.0); f.userData.mood = 'happy';
    orders.push({ id: idSeq++, ci, spot: free, items, total, pat: patMax, patMax, st: 'walk', f, path: [V3(K.OX, 0, K.OZ + 1.5), V3(sp.x, 0, sp.z)], line: pick(LINES.order) }); }
  function walkPath(o, dt, speed = 2.0) { const to = o.path[0]; if (!to) return true; const dx = to.x - o.f.position.x, dz = to.z - o.f.position.z, d = Math.hypot(dx, dz); if (d < 0.06) { o.path.shift(); return !o.path.length; } const s = Math.min(d, speed * dt); o.f.position.x += dx / d * s; o.f.position.z += dz / d * s; o.f.rotation.y = damp(o.f.rotation.y, Math.atan2(dx, dz), 10, dt); return false; }
  function matchQ(w, h) { if (w.type !== h.type) return -1; if (w.type === 'pop') { if (w.size !== h.size || (w.flavor || null) !== (h.flavor || null)) return -1; return h.q * (w.butter === h.butter || (w.butter && h.butter >= w.butter - 1 && h.butter <= w.butter + 1) ? 1 : 0.75); }
    if (w.type === 'drink' || w.type === 'candy') return w.k === h.k ? h.q || 1 : -1; if (w.type === 'dog') return h.q * (w.top === h.top ? 1 : 0.6); return h.q; }
  function assign(o, list) { const pool = list.slice(), res = o.items.map(w => { let bi = -1, bq = -1; pool.forEach((h, i) => { const q = matchQ(w, h); if (q > bq) { bq = q; bi = i; } }); if (bi >= 0 && bq >= 0) { pool.splice(bi, 1); return bq; } return -1; }); return { res, extra: pool }; }
  function grade(o) { const { res } = assign(o, tray), got = res.filter(q => q >= 0), avgQ = got.length ? got.reduce((a, b) => a + b, 0) / got.length : 0; return { frac: got.length / o.items.length, avgQ }; }
  function serve(o) { const g = grade(o), pq = o.pat / o.patMax, stars = g.frac >= 1 ? (g.avgQ >= 0.85 && pq > 0.45 ? 3 : 2) : g.frac >= 0.5 ? 1 : 0;
    if (stars === 0) { startReact(o, 'insulted', 0, null); return false; }
    o.st = 'pay'; o.stars = stars; const level = stars === 3 ? (pq > 0.7 ? 'thrilled' : 'happy') : stars === 2 ? 'neutral' : 'unhappy'; o.tip = level === 'thrilled' ? Math.ceil(o.total * 0.4) + 3 : level === 'happy' ? Math.ceil(o.total * 0.25) + 1 : level === 'neutral' ? 1 : 0;
    tray.length = 0; rebuildTray(); const bill = [5, 10, 20, 50].find(b => b > o.total + (Math.random() < 0.3 ? 4 : 0)) || 50; startReact(o, level, stars, { oid: o.id, total: o.total, paid: bill, owed: bill - o.total, given: 0 }); return true; }
  function startReact(o, level, stars, pay) { const R = REACT[level]; o.f.userData.mood = R.mood; o.f.userData.lineMood = R.mood; if (level === 'thrilled') o.f.userData.hop = 1; S.react = { o, level, stars, pay, t: 0, word: R.word, col: R.col, line: pick(R.lines), who: CUST[o.ci].name, tip: o.tip || 0 }; S.focus = 'all';
    SND.serve(); setTimeout(() => SND.react(level), 120); buzz(level === 'insulted' ? [60, 40, 60] : 20); if (level === 'thrilled') { for (let i = 0; i < 10; i++) puff(o.f.position.x + rr(-0.4, 0.4), rr(1.4, 2.2), o.f.position.z + rr(-0.2, 0.2), 0xffd23a, 1); } }
  function reactDone() { const r = S.react; S.react = null; r.o.f.userData.lineMood = null; if (r.pay) { S.pay = r.pay; payProps(r.pay); S.payOut = null; SND.drawer(); } else { r.o.pat = Math.max(4, r.o.pat - 6); } }
  const REG = V3(-1.3, 1.12, KZ + 1.3), RG = registerKit(ST, REG, { open: 'FOX CINEMA · OPEN' }), { DISH, regDisp, drawer, regDraw, coinsOut, payProps, coinDrop } = RG;
  M(new THREE.BoxGeometry(0.44, 0.3, 0.22), toon('#201e1d'), REG.x, REG.y + 0.15, REG.z + 0.17, null, 0.01); M(new THREE.BoxGeometry(0.36, 0.1, 0.04), toon('#22c55e'), REG.x, REG.y + 0.34, REG.z + 0.05, null, 0);
  function giveCoin(v) { const P = S.pay; if (!P) return; P.given += v; coinDrop(v); regDraw(P); SND.coin(); buzz(8); if (P.given === P.owed) payDone(); else if (P.given > P.owed) { flash('TOO MUCH · TRY AGAIN', '#ec3013'); P.given = 0; SND.error(); coinsOut.forEach(c => scene.remove(c)); coinsOut.length = 0; regDraw(P); } }
  function payDone() { const P = S.pay, o = orders.find(q => q.id === P.oid); S.pay = null; S.payOut = { t: 0, o }; regDraw({ ...P, given: P.owed }); if (!o) return; const pts = o.total + o.tip; S.earned += o.total; S.tips += o.tip; S.served++; S.starList.push(o.stars); S.combo = o.stars === 3 ? S.combo + 1 : 0; if (S.demo) DM.served++;
    flash((o.stars === 3 ? '★★★' : o.stars === 2 ? '★★' : '★') + ' +' + pts + 'g' + (o.tip ? ' (TIP ' + o.tip + ')' : ''), '#ffd23a', 1.8); SND.kaching(); S.combo >= 2 && (S.tips += Math.min(5, S.combo - 1), flash('STREAK ×' + S.combo + ' · +' + Math.min(5, S.combo - 1) + 'g BONUS', '#22c55e', 1.6)); carrySnack(o, o.items); toSeats(o); }

  // ---------- input: tap, hold, stir circles, pull the lever, shake, zigzag, drag the tray ----------
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(V3(0, 1, 0), -(TOP + 0.1)), hit = V3();
  const scr = p => { const v = p.clone().project(camera); return { x: (v.x + 1) / 2 * CW(), y: (1 - v.y) / 2 * CHh() }; };
  const scale = () => Math.min(1.6, Math.max(0.85, Math.min(CW(), CHh()) / 420));
  function TARGETS() { const t = [], add = (kind, p, r, x = {}) => t.push({ kind, p, r, ...x }), kp = kettleW();
    add('kettle', kp.clone(), 70); add('lever', K.leverKnob.getWorldPosition(V3()), 40); add('scoop', P3(K.scoop.x, K.scoop.z, TOP + 0.1), 36);
    for (const k of sizesAv()) add('size', P3(K.sizes[k].x, K.sizes[k].z, TOP + SIZES[k].h), 30, { k });
    if (BK) add('bucket', P3(K.fill.x, K.fill.z, TOP + SIZES[BK.size].h * 0.7), 44); add('cabFront', P3(K.pop.x, K.pop.z - 0.4, TOP + 0.45), 46);
    add('pump', P3(K.butter.x, K.butter.z, TOP + 0.42), 34); if (can('flavor')) for (const [k, p] of Object.entries(K.shakers)) add('shaker', P3(p.x, p.z, TOP + 0.15), 30, { k });
    for (const tp of K.taps) if (DRINKS[tp.k].day <= S.day) { const c = cupAt(tp); if (c) add('cup', c.g.position.clone().setY(TOP + 0.12), 30, { c }); add('tap', P3(tp.x, tp.z + 0.12, TOP + 0.42), 32, { tp }); }
    if (can('candy')) for (const s of K.candySlots) add('candy', P3(s.x, s.z + 0.1, TOP + 0.2), 26, { k: s.k });
    if (can('dog')) { add('franks', P3(K.franks.x, K.franks.z, TOP + 0.1), 34); dogs.forEach((d, i) => d && add('dog', d.g.position.clone(), 26, { i })); if (BUN) add('bun', BUN.g.position.clone(), 40); for (const [k, p] of Object.entries(K.bottles)) add('bottle', P3(p.x, p.z, TOP + 0.18), 28, { k }); }
    if (can('nachos')) { add('chips', P3(K.chipsBag.x, K.chipsBag.z, TOP + 0.15), 34); add('cheese', P3(K.nacho.x, K.nacho.z - 0.1, TOP + 0.35), 36); if (NACH) add('nacho', NACH.g.position.clone(), 36); }
    if (tray.length) add('tray', trayG.position.clone(), 54); add('bin', P3(K.bin.x, K.bin.z, TOP + 0.2), 30);
    orders.forEach(o => o.st === 'wait' && add('cust', V3(o.f.position.x, 1.45, o.f.position.z), 70, { o })); return t; }
  function pickAt(x, y, kinds) { let best = null, bd = 1e9; for (const t of TARGETS()) { if (kinds && !kinds.includes(t.kind)) continue; const s = scr(t.p), d = Math.hypot(s.x - x, s.y - y); if (d < t.r * scale() && d < bd) { bd = d; best = t; } } return best; }
  const local = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  const STN = { kettle: 'pop', lever: 'pop', scoop: 'pop', size: 'pop', bucket: 'pop', cabFront: 'pop', pump: 'pop', shaker: 'pop', tap: 'drinks', cup: 'drinks', candy: 'candy', franks: 'dog', dog: 'dog', bun: 'dog', bottle: 'dog', chips: 'nachos', cheese: 'nachos', nacho: 'nachos', tray: 'serve', bin: 'serve', cust: 'serve' };
  function startHold(kind, ref) { S.hold = { kind, ref, t: 0 }; if (kind === 'fill') { if (BK.st === 'empty') { if (stock < SIZES[BK.size].cost) { S.hold = null; flash(KT.st === 'empty' ? 'OUT OF POPCORN · TAP THE KERNEL SCOOP' : 'OUT OF POPCORN · WAIT FOR THE BATCH', '#ec3013', 1.6); return; } stock -= SIZES[BK.size].cost; BK.st = 'filling'; } } }
  function endHold() { const H = S.hold; S.hold = null; stream.visible = false; if (!H) return; if (H.kind === 'fill') { const f = BK && BK.fill; if (!BK) return; BK.st = 'filled'; flash(f > FILL_OK[1] ? 'SPILLED A BIT' : f >= FILL_OK[0] ? 'JUST RIGHT!' : 'A LITTLE SKIMPY · HOLD AGAIN TO TOP UP', f > FILL_OK[1] ? '#ff9a8a' : f >= FILL_OK[0] ? '#22c55e' : '#ffd23a', 1.2); if (f >= FILL_OK[0] && f <= FILL_OK[1]) SND.good(); else SND.tick(); }
    else if (H.kind === 'pour') { const c = H.ref; if (!DRINKS[c.k].slush) S.fizz = 1; flash(c.spill ? 'OVERFLOW!' : c.fill >= POUR_OK[0] ? 'TO THE LINE!' : 'NOT FULL · HOLD AGAIN', c.spill ? '#ff9a8a' : c.fill >= POUR_OK[0] ? '#22c55e' : '#ffd23a', 1); if (c.fill >= POUR_OK[0] && !c.spill) SND.good(); }
    else if (H.kind === 'cheese') { const n = NACH && NACH.cheese; if (n == null) return; flash(n > CHEESE_OK[1] ? 'CHEESE EVERYWHERE' : n >= CHEESE_OK[0] ? 'GOOEY. PERFECT.' : 'MORE CHEESE?', n > CHEESE_OK[1] ? '#ff9a8a' : n >= CHEESE_OK[0] ? '#22c55e' : '#ffd23a', 1); } }
  function onDown(e) { SND.unlock(); S.lastInput = performance.now(); if (S.phase !== 'shift' || S.pay || DM.on || S.react) return; const { x, y } = local(e), t = pickAt(x, y);
    if (BUN && BUN.sel && (!t || t.kind === 'bun')) { e.preventDefault(); S.zig = { x, last: x, dir: 0 }; return; }
    if (!t) return; e.preventDefault(); if (S.focus === 'all' && !['cust', 'tray'].includes(t.kind)) setFocus(STN[t.kind]);
    switch (t.kind) {
      case 'scoop': loadKettle(); break;
      case 'kettle': if (KT.st === 'empty') { flash('TAP THE KERNEL SCOOP FIRST', '#ffffff', 1.1); break; } if (KT.st === 'burnt' || KT.st === 'done') { flash('PULL THE RED LEVER DOWN', '#ffd23a', 1.1); break; } S.stir = { cx: scr(kettleW()).x, cy: scr(kettleW()).y, a: null }; S.stir.a = Math.atan2(y - S.stir.cy, x - S.stir.cx); break;
      case 'lever': S.lever = { y0: y }; SND.tick(); break;
      case 'size': takeBucket(t.k); break;
      case 'bucket': case 'cabFront': if (!BK) { flash('TAP A BUCKET SIZE FIRST', '#ffffff', 1); break; } if (t.kind === 'bucket' && BK.st === 'filled' && BK.fill >= FILL_OK[0]) { bucketToTray(); break; } startHold('fill'); break;
      case 'pump': pumpButter(); break;
      case 'shaker': if (!BK || BK.fill < 0.5) { flash('FILL A BUCKET FIRST', '#ffffff', 1); break; } if (BK.flavor !== t.k) { BK.flavor = t.k; BK.flv = 0; } S.shake = { k: t.k, last: x, dir: 0, n: 0 }; break;
      case 'tap': { let c = cupAt(t.tp); if (!c) c = addCup(t.tp); if (c.fill >= 1) { flash('FULL · TAP THE CUP', '#ffffff', 0.9); break; } startHold('pour', c); break; }
      case 'cup': if (t.c.fill < 0.3) startHold('pour', t.c); else cupToTray(t.c); break;
      case 'candy': addTray({ type: 'candy', k: t.k, q: 1, label: CANDY[t.k].name }); break;
      case 'franks': addDog(); break;
      case 'dog': takeDog(t.i); break;
      case 'bun': dogToTray(); break;
      case 'bottle': if (!BUN) { flash('PUT A GOLDEN DOG IN THE BUN FIRST', '#ffffff', 1.1); break; } if (BUN.top !== t.k) { BUN.top = t.k; BUN.n = 0; art.squiggle(BUN.g, t.k, 0); } BUN.sel = t.k; flash('ZIGZAG ACROSS THE DOG', '#ffd23a', 1.1); break;
      case 'chips': addNachos(); break;
      case 'cheese': if (!NACH) { flash('TAP THE CHIPS FIRST', '#ffffff', 1); break; } startHold('cheese'); break;
      case 'nacho': if (NACH.cheese < 0.2) startHold('cheese'); else nachosToTray(); break;
      case 'tray': drag = { x0: x, y0: y, moved: false }; SND.whoosh(); break;
      case 'bin': binLast(); break;
      case 'cust': flash(tray.length ? 'DRAG THE TRAY ONTO ' + CUST[t.o.ci].name : CUST[t.o.ci].name + ' IS WAITING · CHECK THE TICKET', '#ffffff', 1.2); break; } }
  function onMove(e) { if (S.phase !== 'shift') return; const { x, y } = local(e);
    if (S.stir) { const a = Math.atan2(y - S.stir.cy, x - S.stir.cx); let d = a - S.stir.a; d = Math.atan2(Math.sin(d), Math.cos(d)); S.stir.a = a; if (Math.hypot(x - S.stir.cx, y - S.stir.cy) > 12) { KT.stirAcc += Math.abs(d); KT.stirDelta = (KT.stirDelta || 0) + d; } return; }
    if (S.lever) { if (y - S.lever.y0 > 40 * scale()) { S.lever = null; dump(); } return; }
    if (S.shake && BK) { const dx = x - S.shake.last; if (Math.abs(dx) > 14) { const dir = Math.sign(dx); if (dir !== S.shake.dir) { S.shake.dir = dir; BK.flv = Math.min(1.2, BK.flv + 0.18); bkSet(); SND.shake(); const p = BK.mesh.position; for (let i = 0; i < 3; i++) spawnPop(V3(p.x + rr(-0.04, 0.04), p.y + SIZES[BK.size].h + 0.3, p.z), V3(rr(-0.1, 0.1), -0.3, 0), 1); if (BK.flv >= 1 && BK.flv < 1.18) flash(FLAVORS[BK.flavor].name + ' · COATED!', '#22c55e', 1); } S.shake.last = x; } return; }
    if (S.zig && BUN) { const dx = x - S.zig.last; if (Math.abs(dx) > 16) { const dir = Math.sign(dx); if (dir !== S.zig.dir) { S.zig.dir = dir; BUN.n = Math.min(4, BUN.n + 1); art.squiggle(BUN.g, BUN.top, BUN.n); SND.squirt(); buzz(10); if (BUN.n >= 4) { BUN.sel = null; S.zig = null; flash(DOGS[BUN.top] + '! TAP THE DOG FOR THE TRAY', '#22c55e', 1.2); } } S.zig && (S.zig.last = x); } return; }
    if (drag) { if (Math.hypot(x - drag.x0, y - drag.y0) > 10) drag.moved = true; ndc.set(x / CW() * 2 - 1, -(y / CHh()) * 2 + 1); ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) { trayG.position.set(clamp(hit.x, -3.6, 3.6), TOP + 0.28, clamp(hit.z, KZ - 0.6, K.pass.z + 0.15)); trayPlate.visible = true; } } }
  function onUp(e) { if (S.hold) endHold(); S.stir = null; S.lever = null; S.shake = null; if (S.zig) S.zig = null;
    if (drag) { const d = drag; drag = null; trayPlate.visible = false; if (d.moved) { const { x, y } = local(e), t = pickAt(x, y, ['cust']); trayG.position.copy(trayHome); if (t) serve(t.o); else flash('DROP THE TRAY ON A CUSTOMER', '#ffffff', 1); } else { trayG.position.copy(trayHome); flash('DRAG THE TRAY ONTO THE CUSTOMER', '#ffffff', 1.1); } } }
  renderer.domElement.addEventListener('pointerdown', onDown); addEventListener('pointermove', onMove); addEventListener('pointerup', onUp); addEventListener('pointercancel', onUp);

  // ---------- NEXT-STEP HINT (also drives the demo autopilot through .act) ----------
  const RINGS = hintRings(ST); let HINT = null, hintT = 0;
  const H = (p, station, text, r = 0.16, act = null) => ({ p, station, text, r, act });
  function missingFor(o) { const { res } = assign(o, tray); return o.items.filter((_, i) => res[i] < 0); }
  function kettleHint(urgent) { const kp = kettleW().setY(TOP + 1.0);
    if (KT.st === 'burnt') return H(P3(K.leverKnob.getWorldPosition(V3()).x, K.pop.z - 0.4), 'pop', 'BURNT! PULL THE RED LEVER DOWN TO DUMP IT', 0.14, { do: 'dump' });
    if (KT.st === 'done') return H(P3(K.leverKnob.getWorldPosition(V3()).x, K.pop.z - 0.4), 'pop', 'POPPING SLOWED: PULL THE RED LEVER DOWN', 0.14, { do: 'dump' });
    if (KT.st === 'popping') return H(kp, 'pop', KT.stirV > 2.2 ? 'KEEP STIRRING · DUMP WHEN THE POPPING SLOWS' : 'STIR! DRAW CIRCLES ON THE KETTLE', 0.28, { do: 'stir' });
    if (KT.st === 'heat') return urgent ? H(kp, 'pop', 'HEATING UP · GET READY TO STIR', 0.28, { do: 'wait' }) : null;
    return urgent ? H(P3(K.scoop.x, K.scoop.z), 'pop', 'TAP THE KERNEL SCOOP: CORN IN THE KETTLE', 0.16, { do: 'scoop' }) : null; }
  function nextHint() { if (S.phase !== 'shift' || S.pay || S.react) return null; const live = KT.st === 'popping' || KT.st === 'done' || KT.st === 'burnt'; if (live) return kettleHint(true);
    const o = orders.filter(q => q.st === 'wait').sort((a, b) => a.pat - b.pat)[0]; if (!o) return stock < 4 ? kettleHint(true) : null;
    const miss = missingFor(o), who = CUST[o.ci].name;
    if (!miss.length) return H(V3(o.f.position.x, 0.02, o.f.position.z), 'serve', 'DRAG THE TRAY ONTO ' + who, 0.45, { do: 'serve', o });
    for (const w of miss) {
      if (w.type === 'pop') { const cost = SIZES[w.size].cost;
        if (BK && BK.size !== w.size && BK.fill < 0.02) return H(P3(K.sizes[w.size].x, K.sizes[w.size].z), 'pop', 'TAP THE ' + SIZES[w.size].name + ' BUCKETS', 0.13, { do: 'size', k: w.size });
        if (BK && BK.size === w.size) {
          if (BK.fill < FILL_OK[0]) { if (BK.st === 'empty' && stock < cost) return kettleHint(true) || H(kettleW(), 'pop', 'WAIT FOR THE CORN', 0.28, { do: 'wait' }); return H(P3(K.fill.x, K.fill.z), 'pop', 'HOLD THE SCOOP · LET GO IN THE GREEN', 0.14, { do: 'fill' }); }
          if (BK.butter < w.butter) return H(P3(K.butter.x, K.butter.z), 'pop', 'TAP THE BUTTER PUMP · ' + BK.butter + ' / ' + w.butter, 0.13, { do: 'pump' });
          if (w.flavor && (BK.flavor !== w.flavor || BK.flv < 1)) { const p = K.shakers[w.flavor]; return H(P3(p.x, p.z), 'pop', 'SWIPE LEFT-RIGHT ON THE ' + FLAVORS[w.flavor].name + ' TO SHAKE IT', 0.12, { do: 'shake', k: w.flavor }); }
          return H(P3(K.fill.x, K.fill.z), 'pop', 'TAP THE BUCKET: ON THE TRAY', 0.14, { do: 'bucket' }); }
        if (!BK) { if (stock < cost) { const kh = kettleHint(true); if (kh) return kh; } else return H(P3(K.sizes[w.size].x, K.sizes[w.size].z), 'pop', 'TAP THE ' + SIZES[w.size].name + ' BUCKETS', 0.13, { do: 'size', k: w.size }); }
        if (BK && BK.size !== w.size) return H(P3(K.fill.x, K.fill.z), 'pop', 'FINISH THAT BUCKET: TAP IT FOR THE TRAY', 0.14, { do: 'bucket' }); }
      if (w.type === 'drink') { const tp = K.taps.find(q => q.k === w.k), c = cupAt(tp); if (!c || c.fill < POUR_OK[0]) return H(P3(tp.x, tp.z, TOP + 0.02), 'drinks', c ? 'HOLD THE TAP · LET GO AT THE LINE' : 'HOLD THE ' + DRINKS[w.k].name + ' TAP TO POUR', 0.11, { do: 'pour', tp }); return H(c.g.position.clone().setY(TOP), 'drinks', 'TAP THE CUP: ON THE TRAY', 0.1, { do: 'cup', c }); }
      if (w.type === 'candy') { const s = K.candySlots.find(q => q.k === w.k); return H(P3(s.x, s.z + 0.1), 'candy', 'TAP THE ' + CANDY[w.k].name, 0.1, { do: 'candy', k: w.k }); }
      if (w.type === 'dog') { if (BUN) { if (w.top !== 'plain' && (BUN.top !== w.top || BUN.n < 4)) { if (BUN.sel === w.top) return H(BUN.g.position.clone().setY(TOP), 'dog', 'ZIGZAG ACROSS THE DOG · ' + BUN.n + ' / 4', 0.16, { do: 'zig' }); const p = K.bottles[w.top]; return H(P3(p.x, p.z), 'dog', 'TAP THE ' + DOGS[w.top], 0.1, { do: 'bottle', k: w.top }); } return H(BUN.g.position.clone().setY(TOP), 'dog', 'TAP THE HOT DOG: ON THE TRAY', 0.16, { do: 'bun' }); }
        const gi = dogs.findIndex(d => d && d.c >= DOG_GOLD && d.c < dogBurn()); if (gi >= 0) return H(dogs[gi].g.position.clone().setY(TOP), 'dog', 'GOLDEN! TAP THE DOG', 0.14, { do: 'dog', i: gi });
        const bi = dogs.findIndex(d => d && d.c >= dogBurn()); if (bi >= 0) return H(dogs[bi].g.position.clone().setY(TOP), 'dog', 'BURNT DOG: TAP IT TO BIN IT', 0.14, { do: 'dog', i: bi });
        if (!dogs.some(Boolean)) return H(P3(K.franks.x, K.franks.z), 'dog', 'TAP THE FRANKS: ONE ON THE ROLLER', 0.14, { do: 'franks' }); }
      if (w.type === 'nachos') { if (!NACH) return H(P3(K.chipsBag.x, K.chipsBag.z), 'nachos', 'TAP THE CHIPS', 0.14, { do: 'chips' }); if (NACH.cheese < CHEESE_OK[0]) return H(P3(K.nacho.x, K.nacho.z - 0.1), 'nachos', 'HOLD THE CHEESE PUMP · LET GO IN THE GREEN', 0.14, { do: 'cheese' }); return H(NACH.g.position.clone().setY(TOP), 'nachos', 'TAP THE NACHOS: ON THE TRAY', 0.14, { do: 'nacho' }); } }
    const kh = kettleHint(stock < 3); if (kh) return kh; const cook = dogs.find(d => d && d.c < DOG_GOLD); if (cook) return H(cook.g.position.clone().setY(TOP), 'dog', 'THE DOG IS ROLLING · WAIT FOR GOLDEN', 0.14, { do: 'wait' }); return null; }
  function autoFollow() { if (DM.on || !HINT || !HINT.station || S.focus === 'all' || S.focus === HINT.station) return; if (drag || S.hold || S.stir || S.shake || S.zig || S.react || S.pay) return; if (S.focus === 'pop' && (KT.st === 'popping' || KT.st === 'heat')) return; const idle = (performance.now() - (S.lastInput || 0)) / 1000; if (idle > 1.0 && performance.now() - (S.userFocusT || 0) > 2500) S.focus = HINT.station; }

  // ---------- DEMO: the autopilot follows the hints (nothing is saved) ----------
  const DM = { on: false, cd: 0, cap: '', key: '', seen: {}, served: 0, anim: null, day0: 1, hold: null };
  const hand = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffd23a, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending })); hand.scale.setScalar(0.32); hand.visible = false; hand.renderOrder = 40; scene.add(hand);
  const cap = (id, key, text) => { DM.key = key; DM.seen[id] = true; DM.cap = text; };
  function demoAct() { const h = nextHint(); if (!h || !h.act) { KT.demoStir = false; return 0.4; } const a = h.act; hand.visible = true; hand.position.copy(h.p).add(V3(0, 0.12, 0)); hand.scale.setScalar(0.5); setFocus(h.station);
    if (a.do !== 'stir') KT.demoStir = false;
    switch (a.do) {
      case 'scoop': cap('scoop', 'TAP', 'TAP THE KERNEL SCOOP: CORN GOES IN THE KETTLE'); loadKettle(); return 1.0;
      case 'wait': cap('wait' + h.station, '…', h.text); return 0.4;
      case 'stir': cap('stir', 'CIRCLES', 'STIR! DRAW CIRCLES ON THE KETTLE OR IT SCORCHES'); KT.demoStir = true; DM.stirT = (DM.stirT || 0); return 0.3;
      case 'dump': cap('dump', 'PULL', 'POPPING SLOWED? PULL THE RED LEVER DOWN: DUMP!'); dump(); return 1.2;
      case 'size': cap('size', 'TAP', 'TAP A BUCKET SIZE: THE TICKET SAYS WHICH'); takeBucket(a.k); return 0.8;
      case 'fill': cap('fill', 'HOLD', 'HOLD THE SCOOP. LET GO WHEN THE BAR IS IN THE GREEN'); startHold('fill'); DM.hold = 0.93; return 0.2;
      case 'pump': cap('pump', 'TAP', 'TAP THE BUTTER PUMP: ONE TAP = ONE PUMP'); pumpButter(); return 0.45;
      case 'shake': cap('shake', 'SWIPE', 'SWIPE LEFT-RIGHT ON THE SHAKER TO COAT IT'); if (BK.flavor !== a.k) { BK.flavor = a.k; BK.flv = 0; } BK.flv = Math.min(1.05, BK.flv + 0.2); bkSet(); SND.shake(); return 0.25;
      case 'bucket': cap('bucket', 'TAP', 'TAP THE BUCKET: IT GOES ON THE TRAY'); bucketToTray(); return 0.7;
      case 'pour': { cap('pour', 'HOLD', 'HOLD THE TAP TO POUR. LET GO AT THE LINE, WATCH THE FOAM'); let c = cupAt(a.tp); if (!c) c = addCup(a.tp); startHold('pour', c); DM.hold = 0.93; return 0.2; }
      case 'cup': cap('cup', 'TAP', 'TAP THE CUP: LID ON, ON THE TRAY'); cupToTray(a.c); return 0.7;
      case 'candy': cap('candy', 'TAP', 'CANDY? TAP THE BOX THE TICKET NAMES'); addTray({ type: 'candy', k: a.k, q: 1, label: CANDY[a.k].name }); return 0.7;
      case 'franks': cap('franks', 'TAP', 'TAP THE FRANKS: A DOG ROLLS ON THE GRILL'); addDog(); return 0.7;
      case 'dog': cap('dog', 'TAP', 'GOLDEN? TAP IT INTO A BUN'); takeDog(a.i); return 0.7;
      case 'bottle': cap('bottle', 'TAP', 'TAP THE SAUCE THE TICKET WANTS'); BUN.top = a.k; BUN.n = 0; BUN.sel = a.k; return 0.5;
      case 'zig': cap('zig', 'ZIGZAG', 'ZIGZAG ACROSS THE DOG: LEFT, RIGHT, LEFT, RIGHT'); BUN.n++; SND.squirt(); art.squiggle(BUN.g, BUN.top, BUN.n); if (BUN.n >= 4) BUN.sel = null; return 0.3;
      case 'bun': cap('bun', 'TAP', 'TAP THE HOT DOG: ON THE TRAY'); dogToTray(); return 0.6;
      case 'chips': cap('chips', 'TAP', 'TAP THE CHIPS'); addNachos(); return 0.6;
      case 'cheese': cap('cheese', 'HOLD', 'HOLD THE CHEESE PUMP, LET GO IN THE GREEN'); startHold('cheese'); DM.hold = 0.92; return 0.2;
      case 'nacho': cap('nacho', 'TAP', 'TAP THE NACHOS'); nachosToTray(); return 0.6;
      case 'serve': { cap('serve', 'DRAG', 'DRAG THE TRAY ONTO THE CUSTOMER WHO ORDERED'); const o = a.o, to = V3(o.f.position.x, TOP + 0.15, K.pass.z); DM.anim = { from: trayG.position.clone(), to: to.setY(TOP + 0.28), t: 0, dur: 0.8, done: () => { trayG.position.copy(trayHome); serve(o); } }; return 1.0; } }
    return 0.4; }
  function demoStep(dt) { if (DM.anim) { const a = DM.anim; a.t += dt / a.dur; const k = Math.min(1, a.t), p = a.from.clone().lerp(a.to, smooth(0, 1, k)); p.y += Math.sin(k * Math.PI) * 0.15; trayG.position.copy(p); hand.position.copy(p).add(V3(0, 0.15, 0)); if (k >= 1) { DM.anim = null; a.done && a.done(); } return; }
    if (KT.demoStir) { const kp = kettleW(), a = performance.now() / 180; hand.position.set(kp.x + Math.cos(a) * 0.2, kp.y + 0.3, kp.z + Math.sin(a) * 0.2); }
    if (S.pay) { DM.cd -= dt; if (DM.cd > 0) return; const P = S.pay, left = P.owed - P.given, v = [10, 5, 2, 1].find(c => c <= left); if (!DM.seen.pay) { DM.seen.pay = true; DM.cap = 'THEY PAID ' + P.paid + 'g FOR A ' + P.total + 'g BILL. TAP COINS TO GIVE ' + P.owed + 'g CHANGE'; DM.key = 'COINS'; DM.cd = 1.8; return; } DM.cap = 'GIVE ' + P.owed + 'g CHANGE · ' + (P.given + v) + ' / ' + P.owed + 'g'; DM.key = v + 'g'; giveCoin(v); DM.cd = 0.8; if (!S.pay) { DM.cap = 'EXACT CHANGE! OFF THEY GO TO THE MOVIE'; DM.key = '✓'; DM.cd = 1.6; } return; }
    hand.scale.setScalar(Math.max(0.3, hand.scale.x - dt * 0.6)); if (S.phase !== 'shift' || S.react || S.payOut) return;
    if (S.hold && DM.hold != null) { const v = S.hold.kind === 'fill' ? BK && BK.fill : S.hold.kind === 'pour' ? S.hold.ref.fill : NACH && NACH.cheese; if (v >= DM.hold) { DM.hold = null; endHold(); DM.cd = 0.6; } return; }
    DM.cd -= dt; if (DM.cd > 0) return; const f0 = S.focus; DM.cd = demoAct(); if (S.focus !== f0) DM.cd += 0.45;
    if (!DM.auto && (DM.served >= 2 || S.t > 150)) { DM.cap = 'YOUR TURN! TAP PUT ME TO WORK'; DM.key = 'GO'; DM.cd = 99; KT.demoStir = false; setTimeout(() => DM.on && demoStop(), 2600); } }
  function demoStart() { if (DM.on) return; SND.unlock(); DM.on = true; DM.seen = {}; DM.served = 0; DM.anim = null; DM.cd = 2.2; DM.hold = null; DM.day0 = S.day; DM.stock0 = stock; S.day = 2; DM.cap = 'WATCH A SHIFT AT THE SNACK COUNTER'; DM.key = ''; S.phase = 'intro'; S.done = null; S.demo = true; stock = 0; startShift(); S.next = 0.6; }
  function demoStop() { if (!DM.on) return; DM.on = false; S.demo = false; hand.visible = false; KT.demoStir = false; if (DM.anim) { DM.anim = null; trayG.position.copy(trayHome); } S.day = DM.day0; clearWork(); clearSeated(); stock = DM.stock0; S.phase = 'intro'; showIntro(); }

  // ---------- flow: walk → intro (welcome card) → glide → shift → done → (next shift | back to the lobby) ----------
  function clearWork() { S.pay = null; S.payOut = null; payProps(null); S.react = null; S.hold = null; S.stir = S.lever = S.shake = S.zig = null; drag = null; trayG.position.copy(trayHome); stream.visible = false;
    if (BK) { scene.remove(BK.mesh); BK = null; } cups.forEach(c => scene.remove(c.g)); cups.length = 0; dogs.forEach((d, i) => { if (d) scene.remove(d.g); dogs[i] = null; }); if (BUN) { scene.remove(BUN.g); BUN = null; } if (NACH) { scene.remove(NACH.g); NACH = null; }
    tray.length = 0; rebuildTray(); seated.filter(q => q.pending).forEach(unseat); orders.forEach(o => { if (!seated.some(q => q.f === o.f)) { o.f.visible = false; o.f.position.y = 0; if (o.snack) { o.f.remove(o.snack); o.f.userData.hold = null; } } }); orders.length = 0; Object.assign(KT, { st: 'empty', heat: 0, p: 0, scorch: 0, stirV: 0, tilt: 0, demoStir: false }); K.kOil.visible = false; S.dim = 0; }
  function showIntro() { DLG = null; reel.visible = true; ben.visible = false; benU.visible = true; benU.position.set(1.6, 0, KZ + 3.7); benU.rotation.y = 0.15; reel.position.set(K.reel.x, 0, K.reel.z); glideTo(wideShot(), 1.2); }
  function toIntro() { if (S.phase === 'shift' || S.phase === 'glide') return; clearWork(); S.phase = 'intro'; S.done = null; setUniform(); showIntro(); say('REEL: "Apron on! Doors open in three minutes."', 4); }
  function toWalk() { if (DM.on) demoStop(); clearWork(); if (onExit) { S.phase = 'intro'; S.done = null; try { onExit({ gold: save.data.gold, day: S.day }); } catch (e) {} return; } reel.visible = true; S.phase = 'walk'; S.done = null; benU.visible = false; ben.visible = true; PL.x = K.OX + 3.9; PL.z = K.OZ + KZ + 2.4; PL.yaw = Math.PI / 2; PL.sit = false; camYaw = Math.PI * 0.75; CAM.from = null; CAM.t = 1; }
  const setUniform = () => {};
  function startShift() { if (S.phase !== 'intro' && S.phase !== 'done') return; if (!S.demo && DM.on) demoStop(); clearWork(); SND.unlock(); try { audio.wind && audio.wind.gain && (audio.wind.gain.value = 0); } catch (e) {}
    clearSeated(); Object.assign(S, { phase: 'glide', t: 0, earned: 0, tips: 0, served: 0, lost: 0, missed: 0, starList: [], next: 2.0, done: null, combo: 0, focus: 'all', perfectPops: 0 }); if (!S.demo) stock = Math.max(stock, 4);
    benU.visible = false; ben.visible = false; reel.visible = false; glideTo(workShot('all'), 1.6); S.glideT = 1.65; SND.unlock(); SND.sting('start'); say('REEL: "Kettle on the left, drinks in the middle, tray at the front. Doors are open!"', 6); }
  function endShift() { S.phase = 'done'; const avg = S.starList.length ? S.starList.reduce((a, b) => a + b, 0) / S.starList.length : 0, eod = S.served >= 4 + S.day && avg >= 2.4, wage = 10 + S.day * 2, total = wage + S.earned + S.tips;
    let newDay = false, unlock = []; try { save.addGold(total); save.best(SAVE.best, total); if (S.served >= 3 + S.day) { const nd = S.day + 1; save.setStat(SAVE.day, nd); newDay = true; unlock = [...Object.entries(SIZES).filter(([, v]) => v.day === nd).map(([, v]) => v.name + ' BUCKETS'), ...Object.entries(DRINKS).filter(([, v]) => v.day === nd).map(([, v]) => v.name), ...Object.entries(UNLOCK).filter(([, v]) => v === nd).map(([k]) => ({ candy: 'CANDY WALL', dog: 'HOT DOG ROLLER', slush: 'SLUSHIES', flavor: 'FLAVOUR SHAKERS', nachos: 'NACHOS' })[k])]; }
      if (!save.flag(SAVE.uni) && S.served >= 3) { save.setFlag(SAVE.uni); unlock.push('USHER UNIFORM (paper hat + popcorn tee)'); } if (eod) save.setStat(SAVE.stars, save.stat(SAVE.stars, 0) + 1); } catch (e) {}
    S.done = { day: S.day, served: S.served, lost: S.lost, missed: S.missed, avg: Math.round(avg * 10) / 10, wage, earned: S.earned, tips: S.tips, total, eod, newDay, unlock, stars: save.stat(SAVE.stars, 0), gold: save.data.gold, perfect: S.perfectPops || 0 };
    if (newDay) S.day += 1; SND.showtime(); setTimeout(() => SND.sting(eod ? 'eod' : 'done'), 600); glideTo(wideShot(), 1.4); clearHalf(); benU.visible = true; benU.position.set(1.6, 0, KZ + 3.7); reel.visible = true;
    say(eod ? 'REEL: "EMPLOYEE OF THE DAY! Take a bow!"' : S.served >= 3 ? 'REEL: "Lights down, show on. Good shift!"' : 'REEL: "Rough rush. Tomorrow the kettle is ours."', 6); }
  function clearHalf() { orders.forEach(o => { if (o.st === 'wait' || o.st === 'walk') toSeats(o); }); S.pay = null; S.payOut = null; payProps(null); S.react = null; S.hold = null; stream.visible = false; }
  function buyUpgrade(id) { const u = UPGRADES.find(q => q.id === id); if (!u || upg(id)) return false; if (!save.spend(u.cost)) { flash('NOT ENOUGH GOLD', '#ec3013'); return false; } save.setStat(SAVE.upg + id, 1); flash(u.name + ' · INSTALLED', '#22c55e', 1.6); SND.upgrade(); if (S.done) S.done.gold = save.data.gold; return true; }

  // ---------- per-frame ----------
  const clock = new THREE.Clock(); let raf = 0, hudT = 0;
  function camWork(dt) {
    if (S.pay || S.payOut) { const sh = shotFor('pay', () => [V3(REG.x - 0.24, REG.y, REG.z - 0.38), V3(REG.x + 0.24, REG.y + 0.1, REG.z + 0.05), V3(DISH.x - 0.14, DISH.y, DISH.z - 0.14), V3(DISH.x + 0.14, DISH.y, DISH.z + 0.14), V3(REG.x + 0.52, REG.y, REG.z - 0.5), V3(REG.x - 0.24, REG.y + 0.5, REG.z - 0.05), V3(REG.x + 0.24, REG.y + 0.5, REG.z - 0.05)], 1.32, 0.1, 0.07); camera.position.lerp(sh.pos, Math.min(1, dt * 5)); CAM.look.lerp(sh.look, Math.min(1, dt * 5)); regDisp.scale.set(CW() < CHh() ? 0.36 : 0.46, CW() < CHh() ? 0.133 : 0.17, 1); return; }
    if (S.react) { const o = S.react.o, f = o.f.position, sh = shotFor('react' + o.spot, () => [V3(f.x - 0.45, 1.25, f.z), V3(f.x + 0.45, 1.25, f.z), V3(f.x, 2.35, f.z), V3(f.x, 1.55, f.z - 0.3)], 0.12, 0.12, 0.1); camera.position.lerp(sh.pos, Math.min(1, dt * 5)); CAM.look.lerp(sh.look, Math.min(1, dt * 5)); return; }
    if (CAM.t < 1 && CAM.from) { CAM.t = Math.min(1, CAM.t + dt / CAM.dur); const k = smooth(0, 1, CAM.t); camera.position.lerpVectors(CAM.from.pos, CAM.to.pos, k); CAM.look.lerpVectors(CAM.from.look, CAM.to.look, k); return; }
    const w = S.phase === 'intro' || S.phase === 'done' ? wideShot() : workShot(); camera.position.lerp(w.pos, Math.min(1, dt * 3.2)); CAM.look.lerp(w.look, Math.min(1, dt * 3.2)); }
  function step(dt) { const walk = S.phase === 'walk', work = S.phase === 'shift';
    S.flashT -= dt; if (S.flashT <= 0) S.flash = null; S.sayT -= dt; if (S.sayT <= 0) S.say = ''; S.toastT -= dt; if (S.toastT <= 0) S.toast = null;
    { const fov = walk && CW() < CHh() ? 66 : 50; if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); } }
    K.update(dt, { movie: walk ? (PL.sit || PL.x > K.OX + 5) : true, dim: S.dim });
    if (walk) walkStep(dt); else { camWork(dt); camera.lookAt(CAM.look); }
    { const workView = (S.phase === 'shift' || S.phase === 'glide') && (CAM.t > 0.35 || !CAM.from), introV = S.phase === 'intro' || S.phase === 'done'; K.cut.forEach(m => m.visible = !workView); K.front.forEach(m => m.visible = !introV); K.apron.visible = introV; lampGl.forEach(s => s.visible = !workView && !introV); }
    for (const p of smokeS) { if (p.life <= 0) { p.s.material.opacity = 0; continue; } p.life -= dt * 0.8; p.s.position.addScaledVector(p.v, dt); p.s.material.opacity = 0.45 * p.life; p.s.scale.setScalar(0.18 + (1 - p.life) * 0.3); }
    if (S.phase === 'glide') { S.glideT -= dt; if (S.glideT <= 0) S.phase = 'shift'; }
    if (work) { S.t += dt; if (S.t >= CINEMA.shift && !DM.on) { S.dim = 0; endShift(); } else S.dim = S.t > CINEMA.shift - 15 ? (S.t - (CINEMA.shift - 15)) / 15 * 0.5 : 0; if (S.t > CINEMA.shift - 20 && !S.lastCall && !DM.on) { S.lastCall = true; flash('LAST CALL! LIGHTS DIMMING', '#ffd23a', 2); SND.chime(); } }
    if (S.phase === 'glide') S.lastCall = false;
    if (DM.on) demoStep(dt);
    { const H0 = S.hold, inScr = walk && PL.x > K.OX + 7, waiting = orders.filter(o => o.st === 'wait').length; S.fizz = Math.max(0, (S.fizz || 0) - dt * 0.35);
      SND.update(dt, { cue: walk ? (PL.sit || inScr ? 'movie' : 'lobby') : (S.phase === 'shift' || S.phase === 'glide') ? 'shift' : 'lobby', intensity: S.phase === 'shift' ? clamp((S.t - (CINEMA.shift - 30)) / 30, 0, 1) : 0,
        sizzle: S.phase === 'walk' ? 0 : (KT.st === 'heat' ? KT.heat * 0.5 : KT.st === 'popping' ? 1 : KT.st === 'done' ? 0.8 : KT.st === 'burnt' ? 1.2 : 0) + (dogs.some(Boolean) ? 0.35 : 0),
        rustle: H0 && H0.kind === 'fill' ? 1 : 0, pour: H0 && H0.kind === 'pour' ? 1 : 0, pourF: H0 && H0.kind === 'pour' ? H0.ref.fill : 0, gloop: H0 && H0.kind === 'cheese' ? 1 : 0, fizz: S.fizz,
        hum: S.phase === 'walk' ? (inScr ? 0 : 0.25) : 0.5 + (H0 && H0.kind === 'pour' && DRINKS[H0.ref.k].slush ? 1 : 0) + (KT.st === 'popping' ? 0.4 : 0),
        crowd: walk ? (inScr ? (PL.sit ? 0.05 : 0.2) : 0.85) : S.phase === 'shift' ? 0.3 + Math.min(0.6, waiting * 0.2) : 0.6, projector: walk && inScr ? 1 : 0, movie: walk && PL.sit ? 1 : inScr ? 0.5 : 0 }); }
    kettleStep(dt);
    // holds
    if (S.hold) { const Hh = S.hold; Hh.t += dt;
      if (Hh.kind === 'fill' && BK) { BK.fill = Math.min(1.25, BK.fill + dt * 0.55); bkSet(); const p = BK.mesh.position; if (Math.random() < dt * 30) spawnPop(V3(p.x + rr(-0.03, 0.03), p.y + SIZES[BK.size].h + 0.3, p.z + rr(-0.03, 0.03)), V3(rr(-0.2, 0.2), -0.6, rr(-0.2, 0.2))); if (BK.fill > FILL_OK[1] && Math.random() < dt * 12) spawnPop(V3(p.x, p.y + SIZES[BK.size].h + 0.03, p.z), V3(rr(-0.8, 0.8), 0.6, rr(-0.8, 0.8))); }
      if (Hh.kind === 'pour') { const c = Hh.ref, slush = DRINKS[c.k].slush, rate = (slush ? 0.42 : 0.5) * (upg('fastFount') ? 1.6 : 1); c.fill = Math.min(1.06, c.fill + dt * rate); c.foam = slush ? 0.012 : Math.min(0.035, c.foam + dt * 0.08); if (c.fill > 1.0 && !c.spill) { c.spill = true; flash('OVERFLOW!', '#ff9a8a', 0.8); } c.g.userData.set(c.fill, c.foam, false);
        const p = c.g.position, top = TOP + (slush ? 0.27 : 0.33), bot = p.y + 0.19 * Math.min(1, c.fill) + c.foam, h = Math.max(0.02, top - bot); stream.visible = true; stream.material.color.set(DRINKS[c.k].col); stream.scale.set(1 + Math.sin(performance.now() / 25) * 0.12, h, 1); stream.position.set(p.x, bot + h / 2, p.z);  if (c.spill && Math.random() < dt * 6) puff(p.x, p.y + 0.18, p.z, 0xffffff, 1); }
      if (Hh.kind === 'cheese' && NACH) { NACH.cheese = Math.min(1.3, NACH.cheese + dt * 0.5); NACH.g.userData.setCheese(NACH.cheese); } }
    cups.forEach(c => { if (!(S.hold && S.hold.ref === c)) { c.foam = Math.max(0, c.foam - dt * 0.02); c.g.userData.set(c.fill, c.foam, c.fill >= POUR_OK[0]); } });
    K.drums.forEach((d, i) => d.aug.rotation.y += dt * (S.hold && S.hold.ref && S.hold.ref.k === d.k ? 9 : 2));
    K.pumpHead.position.y = damp(K.pumpHead.position.y, TOP + 0.42, 10, dt);
    // hot dogs roll + cook
    dogs.forEach((d, i) => { if (!d) return; d.c += dt / 7; const R = K.rollers[i]; R.r.rotation.x += dt * 4; d.g.rotation.x += dt * 4; const c = d.c, col = c < DOG_GOLD ? new THREE.Color('#e57373').lerp(new THREE.Color('#c46a3a'), c) : c < dogBurn() ? new THREE.Color('#c46a3a') : new THREE.Color('#4a2a1a'); d.g.userData.dog.material = toon('#' + col.getHexString()); if (c >= DOG_GOLD && !d.goldT) { d.goldT = 1; tone(1320, 0.08, 0.04); } if (c >= dogBurn() && !d.burnT) { d.burnT = 1; tone(220, 0.25, 0.04, 'sawtooth'); } if (Math.random() < dt * 3) puff(d.g.position.x, TOP + 0.25, d.g.position.z, c >= dogBurn() ? 0x3a3836 : 0xffffff, 1); });
    // customers
    if (work && (!DM.on || DM.auto)) { S.next -= dt; const maxQ = Math.min(3, 1 + Math.ceil(S.day / 2)); if (S.next <= 0 && orders.filter(o => o.st === 'wait' || o.st === 'walk').length < maxQ && S.t < CINEMA.shift - 25) { newOrder(); S.next = Math.max(9, 18 - S.day * 1.5) * rr(0.8, 1.2); } }
    if (work && DM.on && !DM.auto) { S.next -= dt; if (S.next <= 0 && orders.filter(o => o.st === 'wait' || o.st === 'walk' || o.st === 'pay').length < 1 && DM.served < 2) { newOrder(); const o = orders[orders.length - 1]; if (o) o.items = DM.served === 0 ? [{ type: 'pop', size: 'M', butter: 2, flavor: null }, { type: 'drink', k: 'cola' }] : [{ type: 'pop', size: 'L', butter: 0, flavor: null }, { type: 'candy', k: 'bites' }]; if (o) o.total = o.items.reduce((s, w) => s + itemPrice(w), 0); S.next = 4; } }
    for (let i = orders.length - 1; i >= 0; i--) { const o = orders[i]; let mv = 0;
      if (o.st === 'walk') { mv = 2; if (walkPath(o, dt)) { o.st = 'wait'; o.f.rotation.y = Math.PI; say(CUST[o.ci].name + ': "' + o.line + '"', 3); tone(1046, 0.06, 0.03); } }
      else if (o.st === 'wait') { o.f.rotation.y = damp(o.f.rotation.y, Math.PI, 8, dt); if (work) { o.pat -= DM.on ? 0 : dt; o.f.userData.mood = o.pat / o.patMax < 0.3 ? 'angry' : o.pat / o.patMax < 0.6 ? 'neutral' : 'happy'; if (o.pat <= 0) { o.st = 'leave'; S.lost++; S.combo = 0; o.path = [V3(K.OX, 0, K.OZ + 2.0), V3(K.OX, 0, K.OZ + 6.2)]; flash(CUST[o.ci].name + ' LEFT · ' + pick(LINES.angry), '#ec3013', 1.8); SND.react('insulted'); } } }
      else if (o.st === 'leave') { mv = 2.4; if (walkPath(o, dt, 2.4)) { o.f.visible = false; orders.splice(i, 1); continue; } }
      else if (o.st === 'toSeat') { mv = 2.2; if (o.path.length <= 2) o.f.position.y = damp(o.f.position.y, o.seat.y, 8, dt); if (walkPath(o, dt, 2.2)) { o.f.position.set(o.seat.x - 0.05, o.seat.y + 0.02, o.seat.z); o.f.rotation.y = Math.PI / 2; o.f.scale.setScalar(0.92); o.f.userData.mood = 'happy'; const q = seated.find(q2 => q2.f === o.f && q2.pending); if (q) { q.pending = false; q.snack = o.snack; } orders.splice(i, 1); continue; } }
      kit.animFox(o.f, dt, mv); }
    if (S.react) { S.react.t += dt; if (S.react.t > (DM.on ? 2.0 : 2.4)) reactDone(); }
    regDisp.visible = !!(S.pay || S.payOut); drawer.position.z = damp(drawer.position.z, REG.z - 0.05 - (S.pay ? 0.26 : 0), 10, dt);
    for (const m of coinsOut) { if (m.userData.t < 1) { m.userData.t = Math.min(1, m.userData.t + dt / 0.35); const k = m.userData.t, a = V3(drawer.position.x, drawer.position.y + 0.08, drawer.position.z); m.position.lerpVectors(a, m.userData.target, k); m.position.y += Math.sin(k * Math.PI) * 0.12; m.rotation.x = k * 6; if (k >= 1) { m.rotation.x = 0; tone(2400 + Math.random() * 400, 0.04, 0.03, 'square'); } } }
    if (S.payOut) { S.payOut.t += dt; const o = S.payOut.o; if (o) { const to = V3(o.f.position.x, K.pass.y + 0.03, K.pass.z); coinsOut.forEach(m => m.position.lerp(to, Math.min(1, dt * 4))); if (RG.bill()) RG.bill().position.lerp(V3(REG.x, REG.y + 0.02, REG.z - 0.2), Math.min(1, dt * 6)); } if (S.payOut.t > 1.1) { S.payOut = null; payProps(null); } }
    hintT += dt; HINT = S.phase === 'shift' ? nextHint() : null; RINGS.place(HINT && !S.react && !S.pay && !(DM.on && DM.anim) ? HINT : null, hintT, dt); if (work) autoFollow();
    if (S.phase !== 'walk') { const greet = S.phase === 'intro' || S.phase === 'done'; benU.userData.mood = greet ? 'excited' : 'happy'; kit.animFox(benU, dt, 0); if (greet && BUP.arms && BUP.arms[0]) BUP.arms[0].rotation.set(-0.25, 0, -2.55 + Math.sin(performance.now() / 1000 * 7) * 0.32); reel.userData.lookAt = null; kit.animFox(reel, dt, 0); kit.animFox(stub, dt, 0); goers.forEach(f => kit.animFox(f, dt, 0)); } seated.forEach(q => { if (!q.pending) kit.animFox(q.f, dt, 0); });
    lampGl.forEach((s, i) => s.material.opacity = (0.5 + Math.sin(clock.elapsedTime * 2 + i) * 0.04) * (1 - S.dim));
  }
  function frame() { raf = requestAnimationFrame(frame); const dt = Math.min(0.05, clock.getDelta()); if (!PAUSE) step(dt); renderer.render(scene, camera); hudT -= dt; if (hudT <= 0) { hudT = 0.1; onState(hud()); } }
  function onRs() { renderer.setSize(CW(), CHh()); camera.aspect = CW() / CHh(); camera.fov = S.phase === 'walk' && CW() < CHh() ? 62 : 50; camera.updateProjectionMatrix(); } addEventListener('resize', onRs); const ro = new ResizeObserver(onRs); ro.observe(container);
  const onKD = e => { SND.unlock(); if (S.phase !== 'walk') return; if (e.code === 'KeyE' || e.code === 'Enter') { e.preventDefault(); talk(); return; } if (e.code === 'Space' || e.code === 'Digit3') { e.preventDefault(); api.jump(); return; } if (/^Digit[1-9]$/.test(e.code) && chOn()) { choose(+e.code.slice(5) - 1); return; } if (e.code === 'Digit1') { api.melee(); return; } if (e.code === 'Digit2') { api.range(); return; } if (/^Digit[1-9]$/.test(e.code) && chOn()) { choose(+e.code.slice(5) - 1); return; } keys.add(e.code); }, onKU = e => keys.delete(e.code), onBlur = () => keys.clear(); addEventListener('keydown', onKD); addEventListener('keyup', onKU); addEventListener('blur', onBlur);

  function hud() { const port = CW() < CHh(), ticket = o => ({ id: o.id, name: CUST[o.ci].name, pat: Math.max(0, o.pat / o.patMax), waiting: o.st === 'wait', total: o.total, lines: o.items.map(w => { const m = assign(o, tray).res[o.items.indexOf(w)] >= 0; return { t: itemLabel(w), sub: itemSub(w), done: m }; }) });
    const stOn = stationsOn(), badge = { pop: KT.st === 'burnt' ? 'BURNT!' : KT.st === 'done' ? 'DUMP!' : KT.st === 'popping' ? 'STIR!' : KT.st === 'heat' ? 'HEATING' : 'CORN ' + stock, drinks: cups.some(c => c.fill >= POUR_OK[0]) ? 'READY' : cups.length ? 'POUR' : '', candy: '', dog: dogs.some(d => d && d.c >= dogBurn()) ? 'BURNT' : dogs.some(d => d && d.c >= DOG_GOLD) || BUN ? 'READY' : dogs.some(Boolean) ? 'ROLLING' : '', nachos: NACH ? (NACH.cheese >= CHEESE_OK[0] ? 'READY' : 'CHEESE') : '', serve: tray.length ? tray.length + ' ON' : '', all: orders.filter(o => o.st === 'wait').length ? orders.filter(o => o.st === 'wait').length + ' WAIT' : '' };
    const meter = S.hold ? (S.hold.kind === 'fill' && BK ? { label: SIZES[BK.size].name + ' BUCKET', v: BK.fill, lo: FILL_OK[0], hi: FILL_OK[1], max: 1.25, zones: ['SKIMPY', 'JUST RIGHT', 'SPILL'] } : S.hold.kind === 'pour' ? { label: DRINKS[S.hold.ref.k].name, v: S.hold.ref.fill, lo: POUR_OK[0], hi: POUR_OK[1], max: 1.06, zones: ['LOW', 'TO THE LINE', 'OVERFLOW'] } : S.hold.kind === 'cheese' && NACH ? { label: 'CHEESE', v: NACH.cheese, lo: CHEESE_OK[0], hi: CHEESE_OK[1], max: 1.3, zones: ['MORE', 'GOOEY', 'TOO MUCH'] } : null) : null;
    return { phase: S.phase, day: S.day, left: Math.max(0, CINEMA.shift - S.t), earned: S.earned, tips: S.tips, served: S.served, lost: S.lost, stars: S.starList.length ? Math.round(S.starList.reduce((a, b) => a + b, 0) / S.starList.length * 10) / 10 : 0, combo: S.combo,
      orders: orders.filter(o => o.st === 'wait' || o.st === 'walk').sort((a, b) => a.spot - b.spot).map(ticket), tray: tray.map(t => t.label), focus: S.focus, stations: stOn.map(([id, label]) => ({ id, label, badge: badge[id] || '' })),
      hint: HINT && HINT.text ? { text: HINT.text, station: HINT.station } : null, flash: S.flash, say: S.say, meter, kettle: { st: KT.st, p: KT.p, scorch: KT.scorch, stir: Math.min(1, KT.stirV / 5), stock, max: 14, heat: KT.heat },
      dog: BUN ? { top: BUN.top, n: BUN.n, sel: BUN.sel } : null, shake: BK && BK.flavor ? { k: FLAVORS[BK.flavor].name, v: Math.min(1, BK.flv) } : null, butter: BK ? BK.butter : 0,
      react: S.react ? { word: S.react.word, col: S.react.col, line: S.react.line, who: S.react.who, stars: S.react.stars, tip: S.react.tip } : null, pay: S.pay ? { ...S.pay } : null, done: S.done, gold: save.data.gold, uniform: !!save.flag(SAVE.uni),
      upgrades: UPGRADES.map(u => ({ ...u, owned: upg(u.id) })), menu: { sizes: sizesAv().map(k => SIZES[k].name), drinks: drinksAv().map(k => DRINKS[k].name), extras: [can('candy') && 'CANDY', can('dog') && 'HOT DOGS', can('nachos') && 'NACHOS', can('flavor') && 'FLAVOURS'].filter(Boolean) },
      demo: DM.on ? { cap: DM.cap, key: DM.key, n: DM.served, of: 2 } : null, walk: stdWalk(), sound: SND.prefs(), sit: PL.sit, port }; }
  frame();
  const api = { hud, startShift, endShift, toIntro, toWalk, demoStart, demoStop, giveCoin, buyUpgrade, setFocus,
    setSafe(top, bottom, left = 0) { if (Math.abs(SAFE.top - top) > 3 || Math.abs(SAFE.bottom - bottom) > 3 || Math.abs(SAFE.left - left) > 3) { SAFE.top = top; SAFE.bottom = bottom; SAFE.left = left; } },
    // ENGINE CONTRACT for Game HUD (walk mode)
    start() {}, talk, choose, closeDialog() { if (DLG) { DLG.after = null; endDlg(); } }, nextLine() { if (DLG && !chOn()) nextLine(); else if (!DLG) talk(); }, clearToast() { S.toast = null; },
    melee() { if (S.phase === 'walk' && !PL.sit) { PL.wave = 1.2; SND.unlock(); SND.yay(); } }, meleeUp() {}, range() { if (S.phase === 'walk') toast('NO BLASTERS IN THE CINEMA. STUB WILL TAKE IT OFF YOU.'); },
    jump() { if (S.phase === 'walk' && !PL.sit && PL.y === 0) { PL.vy = 6; SND.unlock(); SND.jump(); } }, useItem() { toast('NO OUTSIDE SNACKS!'); }, closeWheel() {}, skipTime() {}, setPaused(v) { PAUSE = !!v; }, setHudPad(v) { hudPad = !!v; },
    setStick(x, y) { stick.x = x; stick.y = y; if (x || y) SND.unlock(); }, eyeLook() {}, eyeRelease() {}, togglePov() { return false; }, lookBy(dx) { camYaw -= (dx || 0) * 0.005; }, zoomBy() {}, getCam() { return { dist: 4.4, pitch: 0.4 }; }, setCam() {}, setMinimap() {}, toggleSound() { const on = !(SND.prefs().music || SND.prefs().sfx); SND.setMusic(on); SND.setSfx(on); return !on; }, setMusic: v => { SND.unlock(); SND.setMusic(v); }, setSfx: v => { SND.unlock(); SND.setSfx(v); }, unlockAudio: () => SND.unlock(), cycleWeather() {},
    mapData() { return { p: [PL.x - K.OX, PL.z - K.OZ, PL.yaw], b: [['SNACK COUNTER', 0, KZ], ['SCREEN 1', 11.5, 0], ['TICKETS', K.podium.x, K.podium.z], ['EXIT', 0, 5.5]], f: [[K.reel.x, K.reel.z], [K.stub.x, K.stub.z]], e: [], q: [K.reel.x, K.reel.z, 'REEL'] }; },
    _pump(n = 1, dt = 1 / 30) { for (let i = 0; i < n; i++) step(dt); renderer.render(scene, camera); onState(hud()); }, _state: () => S, _kt: () => KT, _skip(t) { S.t = Math.max(S.t, CINEMA.shift - t); }, _stock(n) { stock = n; },
    _scr: kind => { const t = TARGETS().find(q => q.kind === kind); if (!t) return null; const r = renderer.domElement.getBoundingClientRect(), s = scr(t.p); return { x: r.left + s.x, y: r.top + s.y }; }, _scr2: (kind, k) => { const t = TARGETS().find(q => q.kind === kind && (q.k === k || !k)); if (!t) return null; const r = renderer.domElement.getBoundingClientRect(), s2 = scr(t.p); return { x: r.left + s2.x, y: r.top + s2.y }; }, _tapPos: name => { const t = TARGETS().find(q => q.kind === 'tap' && DRINKS[q.tp.k].name === name); if (!t) return null; const r = renderer.domElement.getBoundingClientRect(), s2 = scr(t.p); return { x: r.left + s2.x, y: r.top + s2.y }; }, _targets: () => TARGETS().map(t => t.kind + (t.k ? ':' + t.k : '')), _PL: PL, _snd: () => ({ ready: SND.ready, state: audio.ctx && audio.ctx.state, prefs: SND.prefs() }), _demoOff() { DM.on = false; DM.auto = false; S.demo = false; hand.visible = false; KT.demoStir = false; }, _view(px, py, pz, tx, ty, tz) { PAUSE = true; camera.position.set(px, py, pz); camera.lookAt(tx, ty, tz); renderer.render(scene, camera); }, _force(items) { const o = orders.find(q => q.st === 'wait' || q.st === 'walk'); if (o) { o.items = items; o.total = items.reduce((a, w) => a + itemPrice(w), 0); } return !!o; }, _auto(day = 4) { DM.on = true; DM.auto = true; DM.seen = {}; DM.served = 0; DM.cd = 1; DM.day0 = S.day; DM.stock0 = stock; S.demo = true; S.phase = 'intro'; S.day = day; startShift(); }, _cam: () => ({ pos: camera.position.toArray().map(v => +v.toFixed(2)), look: CAM.look.toArray().map(v => +v.toFixed(2)), SAFE: { ...SAFE }, wide: wideShot(), fov: camera.fov, benU: benU.position.toArray(), vis: benU.visible }),
    destroy() { cancelAnimationFrame(raf); removeEventListener('resize', onRs); ro.disconnect(); removeEventListener('pointermove', onMove); removeEventListener('pointerup', onUp); removeEventListener('pointercancel', onUp); removeEventListener('keydown', onKD); removeEventListener('keyup', onKU); removeEventListener('blur', onBlur); SND.destroy(); renderer.dispose(); renderer.domElement.remove(); try { audio.ctx && audio.ctx.close(); } catch (e) {} } };
  onRs(); if (start === 'intro') setTimeout(() => toIntro(), 0);
  return api;
}
