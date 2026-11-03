// MERU 2.0 — CASINO [meruCasino] (f -150..-105 × -32..32, door E at z 0). Session 32: rebuilt from a LAYOUT so Ben can move,
// turn, add and remove things in Casino Workshop.dc.html (saved to localStorage 'meru2.casinoLayout'; these are the defaults).
// Every object is built in its own frame (a = facing in degrees: 0 = front faces south +z, 90 = east, 180 = north, 270 = west),
// then all plain-colour parts are baked into ~4 draws (one per material) so the room stays light on phones.
// Session 32 changes: the glass partitions (the "cage" round the middle) are gone, so the floor is open. New: BAR + 2 LOUNGES,
// an entrance LOBBY (gold arch, host podium, velvet ropes, welcome sign), an outside canopy + blade sign + marquee, more players.
import { makeRoomKit } from './meru2-roomkit.js';
import { PLAYER_FEMALE } from '../fox-kit.js?v=s673';
export const CASINO_LAYOUT_KEY = 'meru2.casinoLayout';
export const CASINO_ROOM = { x0: -150, x1: -105, z0: -32, z1: 32, door: { x: -105, z: 0 } };
export const CASINO_DEFAULT = {
  colors: { carpet: '#3b1424', carpetLine: '#c9a227', carpetDot: '#5b2a5e', wall: '#2a1020', ceiling: '#2a1020', beam: '#c9a227', neon: '#ff3fb4', chandelier: '#fff1c8', light: '#ffe2a8' },
  slots: [...[-16.5, -13.5, -10.5, -7.5, 7.5, 10.5, 13.5, 16.5].map(z => ({ x: -148.95, z, a: 90 })),
    // two back-to-back SLOT ISLANDS each side of the centre aisle (4 + 4 machines per island)
    ...[-141.15, -140.1, -139.05, -138, -131.15, -130.1, -129.05, -128].flatMap(x => [{ x, z: -9.2, a: 0 }, { x, z: -10.7, a: 180 }, { x, z: 9.2, a: 180 }, { x, z: 10.7, a: 0 }])],
  props: [{ type: 'statue', x: -134.6, z: -10, a: 90 }, { type: 'statue', x: -134.6, z: 10, a: 90 },
    { type: 'plant', x: -148.7, z: -30.7, a: 0 }, { type: 'plant', x: -148.7, z: 30.7, a: 0 }, { type: 'plant', x: -106.7, z: 30.7, a: 0 }, { type: 'plant', x: -129.5, z: -30.7, a: 0 }, { type: 'plant', x: -121.9, z: 30.7, a: 0 }, { type: 'plant', x: -148.7, z: -21, a: 0 }, { type: 'plant', x: -148.7, z: 21, a: 0 },
    { type: 'hightop', x: -135.6, z: 27.6, a: 0 }, { type: 'hightop', x: -123, z: 28.6, a: 0 }, { type: 'kiosk', x: -135.2, z: 22.2, a: 90 }, { type: 'kiosk', x: -111.5, z: -30.9, a: 0 }],
  pokers: [{ x: -137, z: -21, a: 0, game: 'stud' }, { x: -122, z: -22, a: 0, game: 'holdem' }],
  wheel: { x: -147.3, z: 0, a: 90 }, craps: { x: -118, z: 24, a: 180 }, roulette: { x: -112, z: -22, a: 0 }, cashier: { x: -140, z: 22, a: 180 }, vending: { x: -110, z: -31.1, a: 0 }, bar: { x: -129, z: 28.8, a: 180 },
  lounges: [{ x: -131, z: 18, a: 90 }, { x: -124, z: 18, a: 90 }],
  chandeliers: [{ x: -135, z: 0 }, { x: -124, z: 0 }, { x: -113, z: 0 }],
  people: [
    { key: 'casinoPoker1', x: -137, z: -23.6, a: 0 }, { key: 'casinoPoker2', x: -122, z: -24.6, a: 0 }, { key: 'casinoWheel', x: -146.2, z: -3.7, a: 90 }, { key: 'casinoCashier', x: -140, z: 23.6, a: 180 },
    { key: 'casinoHost', x: -110.8, z: -2.8, a: 90 }, { key: 'casinoBartender', x: -129, z: 29.9, a: 180 },
    { key: 'casinoSlots1', x: -147.75, z: -10.5, a: 270 }, { key: 'casinoSlots2', x: -147.75, z: 10.5, a: 270, phoneSkip: true },
    { key: 'casinoStickman', x: -118, z: 25.6, a: 180 }, { key: 'casinoCroupier', x: -112, z: -23.3, a: 0 }, { key: 'casinoCrapsPlayer', x: -117, z: 22.3, a: 0, phoneSkip: true }, { key: 'ulric', x: -108.6, z: -19.4, a: 235 },
    { key: 'casinoPlayer1', x: -135.6, z: -19.2, a: 218 }, { key: 'casinoPlayer2', x: -123.4, z: -20.2, a: 143, phoneSkip: true }, { key: 'casinoBarGuest', x: -128, z: 27.6, a: 0, phoneSkip: true }] };
export const PEOPLE_LOOK = {
  casinoPoker1: { torso: '#201e1d', outfit: 'vest' }, casinoPoker2: { torso: '#201e1d', outfit: 'vest' }, casinoWheel: { torso: '#7a2a3a', outfit: 'suit' }, casinoCashier: { torso: '#2e4a6b', outfit: 'vest' },
  casinoHost: { torso: ['#201e1d', '#c9a227', '#111111'], outfit: 'suit' }, casinoBartender: { torso: ['#f3f2f2', '#201e1d', '#7a2a3a'], outfit: 'vest' },
  casinoSlots1: { torso: '#38bdf8', outfit: 'coat', look: PLAYER_FEMALE }, casinoSlots2: { torso: '#a78bfa', outfit: 'dress', look: PLAYER_FEMALE },
  casinoPlayer1: { torso: '#16a34a', outfit: 'suit' }, casinoPlayer2: { torso: '#f97316', outfit: 'coat' }, casinoBarGuest: { torso: '#ec3013', outfit: 'dress', look: PLAYER_FEMALE },
  casinoStickman: { torso: ['#f3f2f2', '#7a2a3a', '#201e1d'], outfit: 'vest' }, casinoCroupier: { torso: ['#f3f2f2', '#201e1d', '#c9a227'], outfit: 'vest', look: PLAYER_FEMALE }, casinoCrapsPlayer: { torso: '#facc15', outfit: 'coat' },
  ulric: { outfit: 'robe', torso: ['#fdba74', '#b45309', '#7c2d12'], crest: 'U' } };   // Ulric: look from worlds/meru.js FOXES
export const PEOPLE_NAME = { casinoPoker1: 'Stud dealer', casinoPoker2: "Hold'em dealer", casinoWheel: 'Wheel host', casinoCashier: 'Cashier', casinoHost: 'Door host', casinoBartender: 'Bartender', casinoSlots1: 'Slots player 1', casinoSlots2: 'Slots player 2', casinoPlayer1: 'Poker player 1', casinoPlayer2: 'Poker player 2', casinoBarGuest: 'Bar guest', casinoStickman: 'Craps stickman', casinoCroupier: 'Roulette croupier', casinoCrapsPlayer: 'Craps player', ulric: 'Ulric' };
// people who talk: name, role + lines verbatim from worlds/meru.js (FOXES / DIALOGUE)
export const CASINO_TALK = { ulric: { name: 'Ulric', role: "Ur's advisor", lines: [{who:'player',text:'Is it true that Ur is running rogue border raids?'}, {who:'npc',text:'A logical commander tests his neighbours. Weak borders invite the strike. That is your failing, not our malice.'},{who:'npc',text:'Keep your fleet sharp, young Steward.'}, {who:'player',text:'Do you believe Zion caused your planet\'s disaster on purpose?'}, {who:'npc',text:'The data points at their research facility. Sabotage or incompetence. The graves are the same size. They pay either way.'}] } };
export function casinoLayout() { const D = JSON.parse(JSON.stringify(CASINO_DEFAULT)); try { const s = JSON.parse(localStorage.getItem(CASINO_LAYOUT_KEY) || 'null');
  if (s && typeof s === 'object') { for (const k of Object.keys(D)) if (s[k] != null) D[k] = k === 'colors' ? { ...D.colors, ...s.colors } : s[k];
    if (Array.isArray(s.people)) { const have = new Set(s.people.map(p => p.key)); for (const p of CASINO_DEFAULT.people) if (!have.has(p.key)) D.people.push({ ...p }); } } } catch (e) {} return D; }
// footprint half sizes (x, z) in the object's own frame, for colliders + the workshop plan
export const CASINO_SIZE = { slot: [0.5, 0.75], poker: [3.2, 2.4], wheel: [3.0, 1.9], cashier: [4.1, 2.9], vending: [0.6, 0.45], bar: [3.7, 2.4], lounge: [1.3, 2.0], plant: [0.45, 0.45], hightop: [0.95, 0.95], statue: [0.8, 0.8], kiosk: [0.45, 0.35], craps: [2.3, 1.3], roulette: [2.3, 0.85], chandelier: [1.1, 1.1], person: [0.35, 0.35] };
const GOLD = '#c9a227', CYAN = '#00f0ff', PINK = '#ff007c', VIO = '#bd00ff';
const SYM = (g, k, x, y, r) => { g.save(); g.translate(x, y); g.lineJoin = 'round';
  if (k === 'star') { g.fillStyle = '#20e8ff'; g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.1; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * 0.45 : r; g.lineTo(Math.cos(a) * q, Math.sin(a) * q); } g.closePath(); g.fill(); g.stroke(); }
  else if (k === '8') { g.fillStyle = '#05080f'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.strokeStyle = '#38bdf8'; g.lineWidth = r * 0.22; g.beginPath(); g.arc(0, 0, r * 0.86, 0, 7); g.stroke(); g.fillStyle = '#ffffff'; g.font = '900 ' + Math.round(r * 1.3) + 'px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 0, r * 0.06); }
  else if (k === 'fox') { g.fillStyle = '#f97316'; g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.12; g.beginPath(); g.moveTo(-r, -r * 0.75); g.lineTo(-r * 0.45, -r * 0.35); g.lineTo(r * 0.45, -r * 0.35); g.lineTo(r, -r * 0.75); g.lineTo(r * 0.85, 0); g.lineTo(0, r * 0.8); g.lineTo(-r * 0.85, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#201e1d'; for (const s of [-1, 1]) { g.beginPath(); g.arc(s * r * 0.35, -r * 0.05, r * 0.11, 0, 7); g.fill(); } }
  else if (k === 'rocket') { g.fillStyle = '#ff2d8a'; g.strokeStyle = '#ffffff'; g.lineWidth = r * 0.08; g.beginPath(); g.moveTo(0, -r); g.quadraticCurveTo(r * 0.45, -r * 0.4, r * 0.32, r * 0.35); g.lineTo(r * 0.8, r * 0.8); g.lineTo(r * 0.2, r * 0.6); g.lineTo(-r * 0.2, r * 0.6); g.lineTo(-r * 0.8, r * 0.8); g.lineTo(-r * 0.32, r * 0.35); g.quadraticCurveTo(-r * 0.45, -r * 0.4, 0, -r); g.fill(); g.stroke(); }
  else if (k === 'heart') { g.fillStyle = '#ff4f9a'; g.beginPath(); g.moveTo(0, r * 0.8); g.bezierCurveTo(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.1, 0, -r * 0.4); g.bezierCurveTo(r * 0.6, -r * 1.1, r * 1.3, -r * 0.1, 0, r * 0.8); g.fill(); }
  else if (k === 'moon') { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, r * 0.8, 0, 7); g.fill(); g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(r * 0.35, -r * 0.2, r * 0.7, 0, 7); g.fill(); g.globalCompositeOperation = 'source-over'; }
  else if (k === 'bolt') { g.fillStyle = '#ffd23f'; g.beginPath(); g.moveTo(r * 0.2, -r); g.lineTo(-r * 0.55, r * 0.15); g.lineTo(-r * 0.05, r * 0.15); g.lineTo(-r * 0.25, r); g.lineTo(r * 0.55, -r * 0.2); g.lineTo(r * 0.05, -r * 0.2); g.closePath(); g.fill(); }
  g.restore(); };
const R = a => a * Math.PI / 180;
// front point of an object: (x, z) moved d metres along its facing
export const frontOf = (o, d) => [o.x + Math.sin(R(o.a)) * d, o.z + Math.cos(R(o.a)) * d];
export function rotBox(o, hw, hd) { const r = R(o.a), c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r)), ex = hw * c + hd * s, ez = hw * s + hd * c; return [o.x - ex, o.x + ex, o.z - ez, o.z + ez]; }

// buildCasino({ THREE, scene, cols, touch, layout, exterior }) → { group, ext, spots: [{label, url, x, z, r}], people: [{key, x, z, ry, look}], tick, dispose }
export function buildCasino({ THREE, scene, cols = [], touch = false, layout, exterior = true, ceiling = true, backDoor = null }) {   // backDoor = z on the west wall (s34)
  const LY = layout || casinoLayout(), C = { ...CASINO_DEFAULT.colors, ...(LY.colors || {}) };
  const { CT, Bin, flat, rnd } = makeRoomKit({ THREE, touch });
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const colR = (o, hw, hd, lx = 0, lz = 0) => { const r = R(o.a), cx = o.x + lx * Math.cos(r) + lz * Math.sin(r), cz = o.z - lx * Math.sin(r) + lz * Math.cos(r); const [a, b2, c2, d] = rotBox({ x: cx, z: cz, a: o.a }, hw, hd); box(a, b2, c2, d); };
  const G = new THREE.Group(); G.name = 'meru2Casino'; G.userData.noCull = true; scene.add(G);   // noCull: the walk's prop cull hid the merged sign/reel quads on phones; the casino shows/hides itself by distance in tick()
  const spots = [], people = [], live = [];
  // per-object frame: a fresh Bin built into a group at (x, 0, z) turned a; baked together at the end
  const frame = o => { const g = new THREE.Group(); g.position.set(o.x, 0, o.z); g.rotation.y = R(o.a || 0); G.add(g); return g; };
  // textured quads, merged per texture across every object: add(tex, parentMatrix, [x, y, z, w, h, ry, rx, u0, v0, u1, v1])
  const QS = new Map(), qAdd = (tex, pm, q) => { if (!QS.has(tex)) QS.set(tex, []); QS.get(tex).push([pm, q]); };
  const objM = o => new THREE.Matrix4().compose(new THREE.Vector3(o.x, 0, o.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, R(o.a || 0), 0)), new THREE.Vector3(1, 1, 1));
  const WORLD = new THREE.Matrix4();
  // ---------- floor, walls, ceiling, neon ----------
  const carpet = CT(256, 256, (g, w) => { g.fillStyle = C.carpet; g.fillRect(0, 0, w, w); const t = 64;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const cx = i * t + t / 2, cy = j * t + t / 2; g.strokeStyle = C.carpetLine; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, 22, 0, 7); g.stroke();
      g.fillStyle = C.carpetDot; g.beginPath(); g.moveTo(cx, cy - 14); g.lineTo(cx + 14, cy); g.lineTo(cx, cy + 14); g.lineTo(cx - 14, cy); g.closePath(); g.fill(); g.fillStyle = C.carpetLine; g.beginPath(); g.arc(cx, cy, 4, 0, 7); g.fill(); } });
  flat(G, carpet, 44.2, 63.2, -127.5, 0.05, 0, 3);
  const b = Bin();
  b.box('mat', '#8f1d2c', 37, 0.012, 2.4, -123.5, 0.062, 0); for (const s of [-1, 1]) b.box('gls', GOLD, 37, 0.014, 0.08, -123.5, 0.064, s * 1.22);
  // walls: a wainscot + dado rail low down and a band above the neon, so the glass facade still shows between them
  for (const [y0, y1] of [[0, 1.4], [6.4, 9]]) { const h = y1 - y0, y = (y0 + y1) / 2;
    if (backDoor == null || y0 > 0) b.box('mat', C.wall, 0.1, h, 63.2, -149.6, y, 0); else for (const [z0, z1] of [[-31.6, backDoor - 2.6], [backDoor + 2.6, 31.6]]) b.box('mat', C.wall, 0.1, h, z1 - z0, -149.6, y, (z0 + z1) / 2);   // s34: gap for the back door
    for (const z of [-31.55, 31.55]) b.box('mat', C.wall, 44.2, h, 0.1, -127.5, y, z);
    for (const [z0, z1] of [[-31.6, -3.4], [3.4, 31.6]]) b.box('mat', C.wall, 0.1, h, z1 - z0, -105.45, y, (z0 + z1) / 2); }
  for (const z of [-31.48, 31.48]) b.box('gls', C.beam, 44.2, 0.06, 0.06, -127.5, 1.42, z); if (backDoor == null) b.box('gls', C.beam, 0.06, 0.06, 63, -149.52, 1.42, 0); else for (const [z0, z1] of [[-31.5, backDoor - 2.6], [backDoor + 2.6, 31.5]]) b.box('gls', C.beam, 0.06, 0.06, z1 - z0, -149.52, 1.42, (z0 + z1) / 2);
  for (const s of [-1, 1]) { b.cyl('mat', '#e9e3d6', 0.35, 6.2, -117.4, 3.1, s * 11.2, 16); b.box('gls', C.beam, 0.9, 0.3, 0.9, -117.4, 0.15, s * 11.2); b.box('gls', C.beam, 0.9, 0.3, 0.9, -117.4, 6.35, s * 11.2); ring(-117.4, s * 11.2, 0.5); }
  { const CY = 9, x0 = -149.6, x1 = -105.4, z0 = -31.6, z1 = 31.6, cx = (x0 + x1) / 2, CH = LY.chandeliers || [];
    if (ceiling) { b.box('mat', C.ceiling, x1 - x0, 0.2, z1 - z0, cx, CY + 0.1, 0);
    for (let x = x0 + 4.4; x < x1 - 1; x += 4.42) b.box('gls', C.beam, 0.22, 0.32, z1 - z0, x, CY - 0.16, 0);
    for (let z = z0 + 4.5; z < z1 - 1; z += 4.51) b.box('gls', C.beam, x1 - x0, 0.32, 0.22, cx, CY - 0.16, z);
    const coffer = new THREE.Color(C.ceiling).lerp(new THREE.Color('#ffffff'), 0.08).getStyle();
    for (let x = x0 + 2.2; x < x1; x += 4.42) for (let z = z0 + 2.25; z < z1; z += 4.51) { if (CH.some(q => Math.abs(q.x - x) < 3 && Math.abs(q.z - z) < 3)) continue; b.box('mat', coffer, 3.2, 0.06, 3.2, x, CY - 0.03, z); b.sph('glo', C.light, 0.12, x, CY - 0.08, z); } }
    for (const q of CH) { if (ceiling) { b.cyl('glo', C.light, 3.2, 0.04, q.x, CY - 0.04, q.z, 28); b.tor('gls', C.beam, 3.25, 0.08, q.x, CY - 0.08, q.z, Math.PI / 2); b.tor('gls', C.beam, 2.6, 0.05, q.x, CY - 0.08, q.z, Math.PI / 2); }
      const y = 7.5; b.sph('gls', C.beam, 0.25, q.x, y, q.z); b.box('gls', C.beam, 0.03, 9 - y, 0.03, q.x, (9 + y) / 2, q.z);
      for (const [Rr, yy, n] of [[1.1, y - 0.2, touch ? 10 : 16], [0.7, y - 0.5, touch ? 6 : 10]]) { b.tor('gls', C.beam, Rr, 0.035, q.x, yy, q.z, Math.PI / 2);
        for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2, px = q.x + Math.cos(a) * Rr, pz = q.z + Math.sin(a) * Rr; b.oct('glass', '#ffffff', 0.07, px, yy - 0.2, pz, 2.2); b.sph('glo', C.chandelier, 0.06, px, yy + 0.08, pz, 1.3, 6); } }
      b.oct('glass', '#ffffff', 0.18, q.x, y - 0.9, q.z, 2.4); }
    b.box('gls', C.beam, x1 - x0, 0.4, 0.3, cx, CY - 0.2, z0 + 0.15); b.box('gls', C.beam, x1 - x0, 0.4, 0.3, cx, CY - 0.2, z1 - 0.15); b.box('gls', C.beam, 0.3, 0.4, z1 - z0, x0 + 0.15, CY - 0.2, 0); b.box('gls', C.beam, 0.3, 0.4, z1 - z0, x1 - 0.15, CY - 0.2, 0); }
  for (const [w, d, x, z] of [[44, 0.1, -127.5, -31.4], [44, 0.1, -127.5, 31.4], [0.1, 62, -149.4, 0]]) b.box('glo', C.neon, w, 0.18, d, x, 6.2, z);
  // ---------- LOBBY (inside the east door): gold arch, host podium, velvet ropes, urns, floor medallion, welcome sign ----------
  for (const s of [-1, 1]) { b.box('gls', C.beam, 0.5, 5.2, 0.5, -106.2, 2.6, s * 3.4); b.box('mat', '#201e1d', 0.56, 0.3, 0.56, -106.2, 0.15, s * 3.4); box(-106.45, -105.95, s * 3.4 - 0.25, s * 3.4 + 0.25);
    b.cyl('mat', '#e9e3d6', 0.42, 1.0, -107.6, 0.5, s * 5.4, 14, 0, 0, 1.3); b.sph('mat', '#2f6b3a', 0.55, -107.6, 1.35, s * 5.4, 0.8, 8); ring(-107.6, s * 5.4, 0.6);
    for (let x = -107.4; x >= -114.4; x -= 1.75) { b.cyl('gls', C.beam, 0.04, 0.95, x, 0.475, s * 2.25, 8); b.sph('gls', C.beam, 0.07, x, 0.98, s * 2.25, 1, 8); b.cyl('gls', C.beam, 0.16, 0.04, x, 0.02, s * 2.25, 12); }
    b.box('mat', '#a3162b', 7.0, 0.06, 0.06, -110.9, 0.86, s * 2.25); box(-114.5, -107.3, s * 2.25 - 0.06, s * 2.25 + 0.06); }
  b.box('gls', C.beam, 0.5, 0.5, 7.3, -106.2, 5.45, 0); b.box('glo', C.neon, 0.06, 0.06, 6.4, -106.48, 5.2, 0);
  b.tor('gls', C.beam, 1.4, 0.04, -110.6, 0.08, 0, Math.PI / 2); b.cyl('mat', '#5b2a5e', 1.38, 0.01, -110.6, 0.07, 0, 24);
  b.box('mat', '#201e1d', 0.7, 1.1, 0.6, -110, 0.55, -3.3); b.box('gls', C.beam, 0.78, 0.05, 0.68, -110, 1.12, -3.3); b.box('glo', C.light, 0.02, 0.06, 0.5, -109.64, 0.95, -3.3); box(-110.35, -109.65, -3.6, -3.0);
  const welcome = CT(512, 96, (g, w, h) => { g.fillStyle = '#05080f'; g.fillRect(0, 0, w, h); g.strokeStyle = GOLD; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8); g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.font = '900 46px Archivo, sans-serif'; g.fillText('WELCOME TO MERU CASINO', 22, h / 2 + 2, w - 44); });
  qAdd(welcome, WORLD, [-105.92, 6.05, 0, 6.6, 1.0, Math.PI / 2]); b.box('mat', '#05080f', 0.1, 1.1, 6.8, -106.0, 6.05, 0);
  b.build(G);
  // ---------- SLOTS ----------
  const reel = CT(512, 184, (g, w, h) => { g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, w, h); const grid = [['star', '8', 'fox'], ['8', 'fox', 'star'], ['fox', 'rocket', '8']];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const x = 14 + c * 78, y = 10 + r * 56; g.fillStyle = '#141a33'; g.fillRect(x, y, 70, 50); g.strokeStyle = '#1e5b6b'; g.lineWidth = 2; g.strokeRect(x, y, 70, 50); SYM(g, grid[r][c], x + 35, y + 25, 17); }
    ['star', '8', 'fox'].forEach((k, c) => { const x = 266 + c * 80; g.fillStyle = '#141a33'; g.fillRect(x, 22, 74, 140); g.strokeStyle = '#1e5b6b'; g.lineWidth = 2; g.strokeRect(x, 22, 74, 140); SYM(g, k, x + 37, 92, 28); });
    g.fillStyle = '#ff3fb4'; g.fillRect(262, 91, 244, 2); });
  const tops = CT(256, 192, (g, w) => { for (let i = 0; i < 3; i++) { const y = i * 64; g.fillStyle = '#10081e'; g.fillRect(0, y, w, 64); g.strokeStyle = i === 2 ? '#f97316' : CYAN; g.lineWidth = 4; g.strokeRect(3, y + 3, w - 6, 58); g.fillStyle = '#ffffff'; g.font = '900 30px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('LUCKY GATES', 16, y + 34, w - 32); } });
  (LY.slots || []).forEach((o, i) => { const g = frame(o), s = Bin(), col = ['#2a1640', '#1d1a44', '#2a1630'][i % 3], edge = i % 3 === 2 ? '#f97316' : CYAN, k = i % 3, M4 = objM(o);
    s.box('mat', '#201e1d', 1.0, 0.8, 0.95, 0, 0.4, 0); s.box('gls', col, 1.0, 1.1, 0.9, 0, 1.35, -0.05); s.box('mat', '#111111', 0.82, 0.62, 0.05, 0, 1.45, 0.42);
    for (const y of [1.13, 1.77]) s.box('glo', edge, 0.86, 0.035, 0.03, 0, y, 0.43); for (const x of [-0.43, 0.43]) s.box('glo', edge, 0.035, 0.64, 0.03, x, 1.45, 0.43); s.box('glo', VIO, 1.02, 0.03, 0.92, 0, 0.81, -0.05);
    s.box('mat', '#201e1d', 0.95, 0.08, 0.4, 0, 0.98, 0.55, 0, 0.2); ['#ff3030', '#ffd23a', '#38ff9b'].forEach((c, q) => s.box('glo', c, 0.12, 0.03, 0.08, -0.25 + q * 0.25, 1.01, 0.62));
    s.box('gls', '#c0c4cc', 0.6, 0.08, 0.25, 0, 0.62, 0.55); s.box('mat', '#201e1d', 1.0, 0.55, 0.7, 0, 2.2, -0.1); s.cyl('glo', edge, 0.14, 0.2, 0, 2.58, -0.1, 12);
    s.cyl('mat', '#7a2a3a', 0.26, 0.1, 0, 0.72, 1.75, 14); s.cyl('gls', C.beam, 0.04, 0.7, 0, 0.35, 1.75, 6); s.cyl('gls', C.beam, 0.25, 0.04, 0, 0.02, 1.75, 14); s.build(g);
    const half = i % 2; g.userData.keep = true;   // s101 SLOTS IN WORLD: this cabinet keeps its own meshes (not baked) so it can hide while slots.js plays its real machine here
    const qm = (tex, [x, y, z, w, h, ry, rx, u0, v0, u1, v1]) => { const geo = new THREE.PlaneGeometry(w, h), uv = geo.attributes.uv; for (let n = 0; n < uv.count; n++) uv.setXY(n, uv.getX(n) ? u1 : u0, uv.getY(n) ? v1 : v0); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0, 'YXZ'); g.add(m); };
    qm(reel, [0, 1.45, 0.475, 0.72, 0.52, 0, 0, half * 0.5, 0, half * 0.5 + 0.5, 1]); qm(tops, [0, 2.2, 0.27, 0.86, 0.43, 0, 0, 0, 1 - (k + 1) / 3, 1, 1 - k / 3]);
    colR(o, 0.5, 0.75); const [sx, sz] = frontOf(o, 2.55); spots.push({ label: 'LUCKY GATES SLOTS', url: '../../slots.dc.html?embed=1', x: sx, z: sz, r: 1.3, slot: { group: g } }); });
  if ((LY.slots || []).length) { const pay = CT(1024, 192, (g, w, h) => { g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, w, h); g.strokeStyle = CYAN; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8);
      [['star', '50X', '3.0'], ['8', '25X', '2.0'], ['fox', '10X', '1.5'], ['rocket', '5X', '1.2'], ['heart', '3X', '1.1'], ['moon', '2X', '1.0'], ['bolt', '1.5X', '1.0']].forEach(([k, m3, m2], i) => { const x = 24 + i * 140;
        SYM(g, k, x + 50, 58, 26); g.fillStyle = ['#20e8ff', '#38bdf8', '#f97316', '#ff2d8a', '#ff4f9a', '#ffffff', '#ffd23f'][i]; g.font = '900 28px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('3: ' + m3, x + 50, 128); g.fillStyle = '#c9d2e3'; g.font = '700 24px Archivo, sans-serif'; g.fillText('2: ' + m2, x + 50, 162); }); });
    // one PAYOUT banner over each group of slots: slots that face the same way and stand next to each other (under 3.2 m apart) form a group
    const SL = LY.slots, par = SL.map((_, i) => i), find = i => par[i] === i ? i : (par[i] = find(par[i]));
    for (let i = 0; i < SL.length; i++) for (let j = i + 1; j < SL.length; j++) if (((SL[i].a || 0) - (SL[j].a || 0)) % 360 === 0 && Math.hypot(SL[i].x - SL[j].x, SL[i].z - SL[j].z) < 3.2) par[find(i)] = find(j);
    const gm = new Map(); SL.forEach((o, i) => { const k = find(i); if (!gm.has(k)) gm.set(k, []); gm.get(k).push(o); }); const groups = [...gm.values()];
    for (const g of groups) { const n = g.length, mx = g.reduce((t, o) => t + o.x, 0) / n, mz = g.reduce((t, o) => t + o.z, 0) / n, a = g[0].a || 0, span = Math.max(3, Math.max(...g.map(o => Math.hypot(o.x - g[0].x, o.z - g[0].z))) + 2.6), w = Math.min(12, span), h = w * 192 / 1024;
      qAdd(pay, WORLD, [mx - Math.sin(R(a)) * 0.5, 3.0 + h / 2 + 0.25, mz - Math.cos(R(a)) * 0.5, w, h, R(a)]); } }
  // ---------- POKER ----------
  const cardBack = CT(64, 90, (g, w, h) => { g.fillStyle = '#0d2236'; g.fillRect(0, 0, w, h); g.strokeStyle = '#163a57'; g.lineWidth = 4; for (let i = -h; i < w + h; i += 9) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i - h, h); g.stroke(); } g.strokeStyle = '#7dd3fc'; g.lineWidth = 3; g.strokeRect(3, 3, w - 6, h - 6); SYM(g, '8', w / 2, h / 2, 16); });
  const lampT = CT(256, 64, (g, w) => { ["FIVE CARD STUD", "TEXAS HOLD'EM"].forEach((t, i) => { const y = i * 32; g.fillStyle = '#0a0d1c'; g.fillRect(0, y, w, 32); g.fillStyle = CYAN; g.fillRect(0, y + 29, w, 3); g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#ffffff'; g.fillText(t, 10, y + 16, w - 20); }); });
  (LY.pokers || []).forEach(o => { const g = frame(o), s = Bin(), tx = o.game === 'holdem', M4 = objM(o); g.userData.keep = true;   // s101: keeps its own meshes so it can hide while the card game plays on it
    s.cyl('mat', '#201e1d', 0.4, 0.7, 0, 0.35, 0, 12); s.cyl('mat', '#201e1d', 0.9, 0.06, 0, 0.03, 0, 16);
    s.ecyl('mat', '#3d2a1c', 2.5, 1.7, 0.2, 0, 0.83, 0); s.ecyl('mat', '#10283a', 2.4, 1.6, 0.06, 0, 0.96, 0); s.etor('mat', '#201e1d', 2.45, 1.65, 0.05, 0, 1.0, 0, 2);
    s.ecyl('mat', '#163a52', 1.6, 0.9, 0.005, 0, 0.992, 0); s.etor('glo', CYAN, 1.62, 0.92, 0.012, 0, 0.996, 0, 2);
    const cardQ = (x, y, z, w, h, ry) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: cardBack })); m.position.set(x, y, z); m.rotation.set(-Math.PI / 2, ry, 0, 'YXZ'); g.add(m); };   // s101: the painted card backs belong to the table (they hide while the real game deals)
    if (tx) for (let k = 0; k < 5; k++) cardQ(-0.44 + k * 0.22, 0.998, 0, 0.17, 0.24, 0);
    s.box('gls', '#201e1d', 0.6, 0.05, 0.25, 0, 1.0, -1.3); for (let k = 0; k < 6; k++) s.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e', '#201e1d', '#ffd23a'][k], 0.035, 0.04, -0.22 + k * 0.09, 1.04, -1.3, 8);
    for (let k = 0; k < 5; k++) { const a = Math.PI * 0.2 + k * Math.PI * 0.15, px = Math.cos(a) * 3.0, pz = Math.sin(a) * 2.05, ry = Math.atan2(-px, -pz);
      s.box('mat', '#7a2a3a', 0.55, 0.1, 0.55, px, 0.55, pz, ry); s.box('mat', '#7a2a3a', 0.55, 0.7, 0.08, px - Math.sin(ry) * 0.26, 0.95, pz - Math.cos(ry) * 0.26, ry);
      s.cyl('gls', C.beam, 0.04, 0.5, px, 0.25, pz, 6); s.cyl('gls', C.beam, 0.22, 0.03, px, 0.015, pz, 12);
      const r = R(o.a), wx = o.x + px * Math.cos(r) + pz * Math.sin(r), wz = o.z - px * Math.sin(r) + pz * Math.cos(r); ring(wx, wz, 0.3);
      const cx = Math.cos(a) * 1.85, cz = Math.sin(a) * 1.2, hx = Math.cos(a) * 2.15, hz = Math.sin(a) * 1.42, n = tx ? 2 : 5;
      for (let c = 0; c < n; c++) { const off = (c - (n - 1) / 2) * 0.13; cardQ(hx + Math.cos(ry) * off, 0.997 + c * 0.0005, hz - Math.sin(ry) * off, 0.14, 0.2, ry); }
      for (let q = 0; q < 3; q++) s.cyl('gls', ['#ec3013', '#2e4a6b', '#201e1d'][q], 0.04, 0.03 + rnd() * 0.08, cx + (q - 1) * 0.09, 1.03, cz, 8); }
    s.box('gls', '#201e1d', 2.6, 0.42, 1.0, 0, 3.2, 0); s.box('glo', C.light, 2.4, 0.02, 0.85, 0, 2.98, 0); for (const x of [-1.1, 1.1]) s.box('mat', '#201e1d', 0.012, 10.4, 0.012, x, 8.4, 0); s.build(g);
    for (const sd of [-1, 1]) { const geo = new THREE.PlaneGeometry(2.4, 0.34), uv = geo.attributes.uv, u0 = 0, v0 = tx ? 0 : 0.5, u1 = 1, v1 = tx ? 0.5 : 1; for (let n = 0; n < uv.count; n++) uv.setXY(n, uv.getX(n) ? u1 : u0, uv.getY(n) ? v1 : v0); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: lampT })); m.position.set(0, 3.2, sd * 0.51); m.rotation.y = sd > 0 ? 0 : Math.PI; g.add(m); }   // s101: own meshes so the sign hides with the table while you play
    ring(o.x, o.z, 2.2); const [sx, sz] = frontOf(o, 3.4); spots.push(tx ? { label: "TEXAS HOLD'EM", url: '../../Meru%20Texas%20Holdem.dc.html?embed=1', x: sx, z: sz, r: 1.6, poker: { group: g, game: 'holdem' } } : { label: 'FIVE CARD STUD', url: '../../Meru%20Five%20Card%20Stud.dc.html?embed=1', x: sx, z: sz, r: 1.6, poker: { group: g, game: 'stud' } }); });
  if ((LY.pokers || []).length) { const pk = CT(1024, 448, (g, w, h) => { g.fillStyle = '#0a0d1c'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1e5b6b'; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8); g.textBaseline = 'middle'; g.font = '800 24px Archivo, sans-serif'; const cx = [36, 470, 580, 690, 800, 920];
      ['HAND', 'BET 5', 'BET 10', 'BET 15', 'BET 20', 'BET 25'].forEach((t, i) => { g.fillStyle = i === 1 ? CYAN : '#5d8ba3'; g.textAlign = i ? 'right' : 'left'; g.fillText(t, i ? cx[i] + 70 : cx[0], 40); });
      [['ROYAL FLUSH', 250, 500, 750, 1000, 4000], ['STRAIGHT FLUSH', 50, 100, 150, 200, 250], ['FOUR OF A KIND', 25, 50, 75, 100, 125], ['FULL HOUSE', 9, 18, 27, 36, 45], ['FLUSH', 6, 12, 18, 24, 30], ['STRAIGHT', 4, 8, 12, 16, 20], ['THREE OF A KIND', 3, 6, 9, 12, 15]].forEach((r, j) => { const y = 92 + j * 50;
        g.fillStyle = '#1e2a44'; g.fillRect(24, y - 25, w - 48, 2); g.font = '800 28px Archivo, sans-serif'; g.textAlign = 'left'; g.fillStyle = '#e8f7ff'; g.fillText(r[0], cx[0], y); for (let i = 1; i < 6; i++) { g.textAlign = 'right'; g.fillStyle = i === 1 ? CYAN : '#c9d2e3'; g.fillText(String(r[i] * 5), cx[i] + 70, y); } }); });
    qAdd(pk, WORLD, [-129.5, 4.4, -31.45, 8, 3.5, 0]); }
  // ---------- TREASURE WHEEL (front = the betting side) ----------
  let wheel = null;
  if (LY.wheel) { const o = LY.wheel, g = frame(o), s = Bin(), M4 = objM(o), SEGS = [2, 8, 'S', 3, 12, 2, 'M', 5, 15, 3, 'B', 8], TIER = { S: ['SMALL', CYAN], M: ['MID', VIO], B: ['BIG', PINK] }, HUE = ['#22c55e', '#e11d48', '#f97316', '#ec4899', '#14b8a6', '#2563eb', '#7c3aed', '#eab308', '#0891b2', '#dc2626', '#65a30d', '#c026d3'];
    const wt = CT(512, 512, (q, w) => { const cx = w / 2, n = 12; q.fillStyle = '#05080f'; q.fillRect(0, 0, w, w);
      for (let i = 0; i < n; i++) { const a0 = -Math.PI / 2 - Math.PI / n + i / n * 6.2832, sg = SEGS[i]; q.fillStyle = typeof sg === 'string' ? TIER[sg][1] : HUE[i]; q.beginPath(); q.moveTo(cx, cx); q.arc(cx, cx, cx, a0, a0 + 6.2832 / n); q.fill();
        q.save(); q.translate(cx, cx); q.rotate(a0 + Math.PI / n + Math.PI / 2); q.fillStyle = '#ffffff'; q.textAlign = 'center'; q.textBaseline = 'middle';
        if (typeof sg === 'string') { q.font = '900 34px Archivo, sans-serif'; q.fillText(TIER[sg][0], 0, -cx * 0.72); q.font = '800 22px Archivo, sans-serif'; q.fillText('PRIZE', 0, -cx * 0.58); } else { q.font = '900 64px Archivo, sans-serif'; q.fillText(String(sg), 0, -cx * 0.7); } q.restore(); }
      q.fillStyle = '#05080f'; q.beginPath(); q.arc(cx, cx, cx * 0.24, 0, 7); q.fill(); q.strokeStyle = CYAN; q.lineWidth = 6; q.beginPath(); q.arc(cx, cx, cx * 0.24, 0, 7); q.stroke(); SYM(q, '8', cx, cx, cx * 0.16); });
    wheel = new THREE.Group(); wheel.position.set(0, 3.0, 0); wheel.userData.keep = true; g.add(wheel);
    { const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.2, 40), new THREE.MeshLambertMaterial({ color: 0x10182a })); disc.rotation.x = Math.PI / 2; wheel.add(disc);
      const face = new THREE.Mesh(new THREE.CircleGeometry(2.18, 48), new THREE.MeshBasicMaterial({ map: wt, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 })); face.position.z = 0.13; face.renderOrder = 2; wheel.add(face);   /* s643: was 5 mm off the disc cap = flickering sections (z-fight) */
      const w2 = Bin(); for (let i = 0; i < 12; i++) { const a = (i + 0.5) / 12 * Math.PI * 2; w2.cyl('gls', GOLD, 0.025, 0.14, Math.cos(a) * 2.08, Math.sin(a) * 2.08, 0.2, 6, Math.PI / 2); } w2.tor('gls', GOLD, 2.22, 0.03, 0, 0, 0.13); w2.build(wheel); }
    s.cyl('mat', '#0d1424', 2.7, 0.1, 0, 3.0, -0.2, 32, Math.PI / 2); s.tor('glo', CYAN, 2.72, 0.035, 0, 3.0, -0.14); for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; s.sph('glo', i % 2 ? CYAN : '#ffd23f', 0.07, Math.cos(a) * 2.5, 3.0 + Math.sin(a) * 2.5, -0.12, 1, 6); }
    s.box('gls', C.beam, 0.3, 0.45, 0.1, 0, 5.35, 0.15); s.cyl('gls', C.beam, 0.16, 0.12, 0, 5.05, 0.15, 3, Math.PI / 2);
    s.box('mat', '#3d2a1c', 0.4, 3, 0.4, 0, 1.5, -0.45); s.box('mat', '#3d2a1c', 6, 0.3, 3, 0, 0.15, -0.6); s.box('gls', C.beam, 6.04, 0.05, 3.04, 0, 0.31, -0.6);
    s.box('mat', '#3d2a1c', 4, 0.88, 1.1, 0, 0.44, 1.6); s.box('mat', '#1f6b45', 3.9, 0.04, 1.0, 0, 0.9, 1.6); s.box('gls', C.beam, 4.04, 0.04, 1.14, 0, 0.89, 1.6);
    for (let i = 0; i < 8; i++) s.box('mat', [CYAN, VIO, PINK, '#22c55e', '#f97316', '#2563eb', '#eab308', '#e11d48'][i], 0.42, 0.006, 0.36, 1.6 - i * 0.46, 0.925, 1.7);
    for (const [cx, cy, cz, sz, t] of [[2.45, 0.31, 0.4, 0.62, 'S'], [-2.45, 0.31, 0.4, 0.62, 'M'], [-2.4, 0.93, 0.35, 0.5, 'B']]) { const c = TIER[t][1];
      s.box('mat', '#1a2230', sz, sz, sz, cx, cy + sz / 2, cz); for (const yy of [0.12, 0.88]) s.box('glo', c, sz + 0.02, 0.04, sz + 0.02, cx, cy + sz * yy, cz); s.box('glo', c, 0.04, sz * 0.5, 0.02, cx, cy + sz / 2, cz + sz / 2 + 0.005); }
    s.box('mat', '#05080f', 5.4, 1.4, 0.12, 0, 6.4, -0.25); s.build(g);
    const mq = CT(512, 128, (q, w, h) => { q.fillStyle = '#05080f'; q.fillRect(0, 0, w, h); q.strokeStyle = CYAN; q.lineWidth = 5; q.strokeRect(4, 4, w - 8, h - 8); q.textBaseline = 'middle'; q.fillStyle = VIO; q.font = '800 20px Archivo, sans-serif'; q.fillText('THE CASINO PRESENTS', 24, 32); q.fillStyle = '#ffffff'; q.font = '900 54px Archivo, sans-serif'; q.fillText('TREASURE WHEEL', 22, 82, w - 44); });
    qAdd(mq, M4, [0, 6.4, -0.18, 5.2, 1.3, 0]);
    colR(o, 2.6, 1.8, 0, -0.4); const [sx, sz] = frontOf(o, 3.5); spots.push({ label: 'TREASURE WHEEL', url: '../../Meru%20Treasure%20Wheel.dc.html?embed=1', x: sx, z: sz, r: 1.8, wheel: { group: g, disc: wheel } }); }   // s101: the wheel plays in world
  // ---------- CASHIER (front = the guests' side) ----------
  if (LY.cashier) { const o = LY.cashier, g = frame(o), s = Bin();
    s.box('mat', '#3d2a1c', 8, 1.1, 0.8, 0, 0.55, 0); s.box('gls', '#e9e3d6', 8.2, 0.06, 0.95, 0, 1.13, 0);
    for (let x = -3.8; x <= 3.8; x += touch ? 0.6 : 0.4) s.box('gls', C.beam, 0.04, 1.65, 0.04, x, 1.98, 0); s.box('mat', '#201e1d', 8.2, 0.5, 1.0, 0, 3.05, 0); s.box('gls', C.beam, 8.24, 0.06, 1.04, 0, 2.8, 0); s.box('glo', C.light, 7.8, 0.02, 0.8, 0, 2.79, -0.05);
    s.box('mat', '#201e1d', 6, 1.0, 0.4, 0, 0.5, -2.6); for (let i = 0; i < 24; i++) s.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e'][i % 4], 0.05, 0.2 + (i % 3) * 0.06, 2.6 - i * 0.22, 1.1 + (i % 3) * 0.03, -2.6, 8);
    s.build(g); colR(o, 4, 0.4); colR(o, 3, 0.2, 0, -2.6); }
  // ---------- SNACK STOP vending machine ----------
  if (LY.vending) { const o = LY.vending, g = frame(o), s = Bin(), SN = ['#22c55e', '#2563eb', '#6b3a1f', '#e11d48', '#facc15'], BL = '#1d3f8f';
    s.box('mat', BL, 1.15, 2.0, 0.1, 0, 1.0, -0.375); for (const sx of [-0.55, 0.55]) s.box('mat', BL, 0.05, 2.0, 0.85, sx, 1.0, 0); s.box('mat', BL, 1.15, 0.64, 0.85, 0, 0.32, 0); s.box('mat', BL, 1.15, 0.14, 0.85, 0, 1.93, 0); s.box('mat', BL, 0.32, 1.22, 0.85, 0.39, 1.25, 0);
    s.box('gls', '#ec3013', 1.17, 0.06, 0.87, 0, 2.0, 0); for (const sx of [-0.56, 0.56]) s.box('glo', '#ffd23a', 0.04, 1.96, 0.04, sx, 1.0, 0.43);
    s.box('glo', '#dfe8f0', 0.72, 1.2, 0.02, -0.15, 1.25, 0.2); for (let r = 0; r < 5; r++) { const y = 0.78 + r * 0.22; s.box('gls', '#c0c4cc', 0.7, 0.015, 0.2, -0.15, y - 0.06, 0.33); for (let c = 0; c < 4; c++) s.box('mat', SN[r], 0.12, r === 1 ? 0.16 : 0.11, 0.08, -0.41 + c * 0.175, y + 0.02, 0.36); }
    s.box('mat', '#132a60', 0.26, 1.2, 0.03, 0.38, 1.25, 0.43); s.box('glo', '#7dd3fc', 0.2, 0.12, 0.01, 0.38, 1.78, 0.45); s.box('mat', '#05080f', 0.7, 0.24, 0.02, -0.15, 0.36, 0.43); s.box('glass', '#bfe6ff', 0.66, 0.2, 0.01, -0.15, 0.36, 0.445);
    s.box('mat', '#201e1d', 1.15, 0.3, 0.1, 0, 2.17, 0.4); s.build(g);
    const vh = CT(256, 48, (q, w, h) => { q.fillStyle = '#ec3013'; q.fillRect(0, 0, w, h); q.fillStyle = '#ffffff'; q.font = '900 30px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('SNACK STOP', 14, 26, w - 28); });
    qAdd(vh, objM(o), [0, 2.17, 0.455, 1.1, 0.26, 0]);
    colR(o, 0.6, 0.45); const [sx, sz] = frontOf(o, 1.7); spots.push({ label: 'SNACK STOP', url: '../../Arcade%20Vending%20Machine.dc.html?embed=1&sign=MERU%20CASINO', x: sx, z: sz, r: 1.3 }); }
  // ---------- BAR (front = the stools) ----------
  if (LY.bar) { const o = LY.bar, g = frame(o), s = Bin(), BOT = ['#16a34a', '#a16207', '#7c2d12', '#e9e3d6', '#38bdf8', '#be123c'];
    s.box('mat', '#3d2a1c', 7, 1.1, 0.7, 0, 0.55, 0); s.box('gls', '#e9e3d6', 7.2, 0.06, 0.85, 0, 1.13, 0.05); s.box('gls', C.beam, 7, 0.05, 0.05, 0, 0.22, 0.45); s.box('glo', C.neon, 7, 0.04, 0.02, 0, 0.98, 0.36);
    s.box('mat', '#201e1d', 7, 1.0, 0.5, 0, 0.5, -2.0); s.box('mat', C.wall, 7.4, 2.8, 0.06, 0, 1.4, -2.3); s.box('glo', C.light, 7.0, 0.9, 0.02, 0, 2.0, -2.26);
    for (const y of [1.55, 2.25]) { s.box('mat', '#201e1d', 7, 0.04, 0.32, 0, y, -2.1); for (let i = 0; i < (touch ? 12 : 22); i++) { const x = -3.3 + i * (6.6 / ((touch ? 12 : 22) - 1)); s.cyl('gls', BOT[i % BOT.length], 0.045, 0.26, x, y + 0.15, -2.1, 6); } }
    s.box('glo', C.neon, 7, 0.06, 0.06, 0, 2.95, -2.25);
    for (let i = 0; i < 5; i++) { const x = -2.8 + i * 1.4; s.cyl('mat', '#7a2a3a', 0.22, 0.08, x, 0.78, 0.95, 12); s.cyl('gls', C.beam, 0.035, 0.75, x, 0.38, 0.95, 6); s.cyl('gls', C.beam, 0.22, 0.03, x, 0.015, 0.95, 12); }
    s.build(g); colR(o, 3.6, 0.42); colR(o, 3.7, 0.35, 0, -2.0);
    const bt = CT(256, 64, (q, w, h) => { q.fillStyle = '#05080f'; q.fillRect(0, 0, w, h); q.strokeStyle = GOLD; q.lineWidth = 4; q.strokeRect(3, 3, w - 6, h - 6); q.fillStyle = '#ffffff'; q.font = '900 34px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillText('THE 8 BAR', 18, h / 2 + 2, w - 36); });
    qAdd(bt, objM(o), [0, 3.35, -2.25, 2.4, 0.6, 0]); }
  // ---------- LOUNGES (two sofas facing over a low table) ----------
  (LY.lounges || []).forEach(o => { const g = frame(o), s = Bin();
    for (const sd of [-1, 1]) { const z = sd * 1.4; s.box('mat', '#7a2a3a', 2.4, 0.45, 0.9, 0, 0.22, z); s.box('mat', '#5e1f2c', 2.4, 0.6, 0.2, 0, 0.7, z + sd * 0.4); for (const x of [-1.2, 1.2]) s.box('mat', '#5e1f2c', 0.2, 0.62, 0.9, x, 0.31, z); }
    s.box('mat', '#201e1d', 1.2, 0.36, 0.7, 0, 0.18, 0); s.box('gls', C.beam, 1.24, 0.04, 0.74, 0, 0.37, 0); s.cyl('glo', C.light, 0.08, 0.12, 0.3, 0.45, 0, 8);
    s.build(g); colR(o, 1.3, 0.45, 0, -1.4); colR(o, 1.3, 0.45, 0, 1.4); colR(o, 0.6, 0.35); });
  // ---------- simple PROPS (plants, high-top tables, gold 8 statues, change kiosks): all baked with the rest ----------
  for (const o of LY.props || []) { const g = frame(o), s = Bin();
    if (o.type === 'plant') { s.cyl('mat', '#e9e3d6', 0.36, 0.6, 0, 0.3, 0, 10, 0, 0, 0.8); s.tor('gls', C.beam, 0.36, 0.06, 0, 0.56, 0, Math.PI / 2); s.cyl('mat', '#5b3a22', 0.05, 1.0, 0, 1.0, 0, 5);
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; s.cyl('mat', k % 2 ? '#2f6b3a' : '#3f8a4a', 0.16, 1.0, Math.cos(a) * 0.32, 1.55, Math.sin(a) * 0.32, 4, Math.sin(a) * 1.1, -Math.cos(a) * 1.1, 0); }
      s.build(g); ring(o.x, o.z, 0.45); }
    else if (o.type === 'hightop') { s.cyl('gls', C.beam, 0.05, 1.05, 0, 0.52, 0, 6); s.cyl('mat', '#201e1d', 0.3, 0.04, 0, 0.02, 0, 12); s.cyl('mat', '#3d2a1c', 0.45, 0.05, 0, 1.07, 0, 16); s.cyl('glo', C.light, 0.05, 0.1, 0, 1.15, 0, 6);
      for (let k = 0; k < 3; k++) { const a = k / 3 * Math.PI * 2 + 0.5, x = Math.cos(a) * 0.72, z = Math.sin(a) * 0.72; s.cyl('mat', '#7a2a3a', 0.2, 0.07, x, 0.78, z, 10); s.cyl('gls', C.beam, 0.03, 0.75, x, 0.38, z, 5); }
      s.build(g); ring(o.x, o.z, 0.5); }
    else if (o.type === 'statue') { s.box('mat', '#201e1d', 1.4, 0.9, 1.4, 0, 0.45, 0); s.box('gls', C.beam, 1.46, 0.06, 1.46, 0, 0.9, 0); s.box('glo', C.neon, 1.42, 0.04, 1.42, 0, 0.1, 0);
      s.tor('gls', C.beam, 0.4, 0.28, 0, 1.42, 0); s.tor('gls', C.beam, 0.32, 0.3, 0, 2.12, 0); /* an 8: the bigger loop at the bottom */ s.build(g); colR(o, 0.72, 0.72); }
    else if (o.type === 'kiosk') { s.box('mat', '#1d3f8f', 0.8, 1.6, 0.55, 0, 0.8, 0); s.box('gls', '#ec3013', 0.82, 0.06, 0.57, 0, 1.62, 0); s.box('glo', '#7dd3fc', 0.5, 0.36, 0.02, 0, 1.2, 0.285); s.box('mat', '#05080f', 0.3, 0.06, 0.02, 0, 0.8, 0.285); s.box('glo', '#ffd23a', 0.12, 0.12, 0.02, 0.22, 0.95, 0.285);
      s.build(g); colR(o, 0.42, 0.3); } }
  // ---------- CRAPS (front = the long rail you throw from; the stickman stands on the far side) ----------
  if (LY.craps) { const o = LY.craps, g = frame(o), s = Bin(), M4 = objM(o); g.userData.keep = true;   // s101: keeps its meshes, so the frame is not empty and moves with the casino (an empty frame stayed at the old spot: the craps game played there)
    const felt = CT(512, 256, (q, w, h) => { q.fillStyle = '#1f6b45'; q.fillRect(0, 0, w, h); q.strokeStyle = '#f3f2f2'; q.lineWidth = 3; q.fillStyle = '#f3f2f2'; q.textBaseline = 'middle';
      q.strokeRect(10, 10, w - 20, h - 20); q.strokeRect(24, h - 52, w - 48, 30); q.font = '900 22px Archivo, sans-serif'; q.fillText('PASS LINE', w / 2 - 60, h - 37);
      q.strokeRect(24, h - 92, w - 48, 34); q.font = '800 15px Archivo, sans-serif'; q.fillText("DON'T PASS BAR", 40, h - 75); q.fillText('2 · 3 · 4 · 9 · 10 · 11 · 12   FIELD', w / 2 - 70, h - 75);
      q.strokeRect(24, 90, w - 48, 70); q.font = '900 30px Archivo, sans-serif'; q.fillText('COME', w / 2 - 44, 125);
      ['4', '5', 'SIX', '8', 'NINE', '10'].forEach((t, i) => { const x = 24 + i * ((w - 48) / 6); q.strokeRect(x, 24, (w - 48) / 6, 60); q.font = '900 ' + (t.length > 2 ? 20 : 30) + 'px Archivo, sans-serif'; q.fillStyle = t === 'SIX' || t === 'NINE' ? '#ffd23a' : '#f3f2f2'; q.fillText(t, x + 14, 54); q.fillStyle = '#f3f2f2'; }); });
    s.box('mat', '#201e1d', 3.2, 0.7, 1.2, 0, 0.35, 0); s.box('mat', '#3d2a1c', 4.6, 0.25, 2.5, 0, 0.82, 0);
    for (const sd of [-1, 1]) { s.box('mat', '#3d2a1c', 4.6, 0.36, 0.14, 0, 1.12, sd * 1.18); s.box('mat', '#201e1d', 4.7, 0.12, 0.26, 0, 1.36, sd * 1.24); s.box('gls', C.beam, 4.4, 0.03, 0.16, 0, 1.2, sd * 1.06); }
    for (const sd of [-1, 1]) { s.box('mat', '#3d2a1c', 0.14, 0.36, 2.5, sd * 2.25, 1.12, 0); s.box('mat', '#201e1d', 0.26, 0.12, 2.6, sd * 2.31, 1.36, 0); s.box('mat', '#f3f2f2', 0.02, 0.3, 2.2, sd * 2.17, 1.12, 0); }
    qAdd(felt, M4, [0, 0.96, 0, 4.3, 2.2, Math.PI, -Math.PI / 2]);
    // s101: the two static decoration dice are gone (they sat under the real dice of the in-world craps game)
    s.box('mat', '#c9a227', 1.6, 0.03, 0.05, 0.2, 1.42, -1.2); s.cyl('mat', '#3d2a1c', 0.015, 1.8, -0.6, 1.55, -1.5, 6, 0.3, 1.2);
    for (let k = 0; k < 8; k++) s.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e'][k % 4], 0.045, 0.04 + (k % 3) * 0.04, -1.4 + k * 0.38, 1.0, -0.85, 8);
    s.box('gls', '#201e1d', 2.8, 0.42, 1.2, 0, 3.2, 0); s.box('glo', C.light, 2.6, 0.02, 1.05, 0, 2.98, 0); for (const x of [-1.2, 1.2]) s.box('mat', '#201e1d', 0.012, 10.4, 0.012, x, 8.4, 0);
    s.build(g); colR(o, 2.35, 1.3);
    const ct = CT(256, 32, (q, w, h) => { q.fillStyle = '#0a0d1c'; q.fillRect(0, 0, w, h); q.fillStyle = CYAN; q.fillRect(0, h - 3, w, 3); q.font = '900 20px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillStyle = '#ffffff'; q.fillText('CRAPS', 10, h / 2, w - 20); });
    for (const sd of [-1, 1]) qAdd(ct, M4, [0, 3.2, sd * 0.61, 2.6, 0.34, sd > 0 ? 0 : Math.PI]);
    const [sx, sz] = frontOf(o, 2.4); spots.push({ label: 'CRAPS', url: '../earth/craps.html', x: sx, z: sz, r: 1.6, craps: { group: g } });   /* s101: craps plays in world */ }
  // ---------- ROULETTE (wheel at the left end, the betting layout to the right; front = the players' side) ----------
  let rotor = null, ball = null;
  if (LY.roulette) { const o = LY.roulette, g = frame(o), s = Bin(), M4 = objM(o);
    const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
    const lay = CT(512, 192, (q, w, h) => { q.fillStyle = '#1f6b45'; q.fillRect(0, 0, w, h); q.strokeStyle = '#f3f2f2'; q.lineWidth = 2; q.textAlign = 'center'; q.textBaseline = 'middle'; const cw = (w - 70) / 12, ch = 36;
      q.fillStyle = '#16a34a'; q.fillRect(6, 6, 40, ch * 3); q.strokeRect(6, 6, 40, ch * 3); q.fillStyle = '#ffffff'; q.font = '900 18px Archivo, sans-serif'; q.fillText('0', 26, 6 + ch * 0.75); q.fillText('00', 26, 6 + ch * 2.25); q.beginPath(); q.moveTo(6, 6 + ch * 1.5); q.lineTo(46, 6 + ch * 1.5); q.stroke();
      for (let c = 0; c < 12; c++) for (let r = 0; r < 3; r++) { const n = c * 3 + (3 - r), x = 50 + c * cw, y = 6 + r * ch; q.fillStyle = RED.has(n) ? '#c42d3c' : '#141414'; q.fillRect(x + 3, y + 3, cw - 6, ch - 6); q.strokeRect(x, y, cw, ch); q.fillStyle = '#ffffff'; q.font = '800 15px Archivo, sans-serif'; q.fillText(String(n), x + cw / 2, y + ch / 2); }
      q.font = '800 14px Archivo, sans-serif'; ['1st 12', '2nd 12', '3rd 12'].forEach((t, i) => { const x = 50 + i * cw * 4; q.strokeRect(x, 6 + ch * 3, cw * 4, 30); q.fillText(t, x + cw * 2, 21 + ch * 3); });
      ['1-18', 'EVEN', 'RED', 'BLACK', 'ODD', '19-36'].forEach((t, i) => { const x = 50 + i * cw * 2; q.strokeRect(x, 36 + ch * 3, cw * 2, 30); if (t === 'RED' || t === 'BLACK') { q.fillStyle = t === 'RED' ? '#c42d3c' : '#141414'; q.fillRect(x + 8, 42 + ch * 3, cw * 2 - 16, 18); q.fillStyle = '#ffffff'; } else q.fillText(t, x + cw, 51 + ch * 3); }); });
    s.box('mat', '#201e1d', 3.4, 0.7, 0.9, 0.3, 0.35, 0); s.box('mat', '#3d2a1c', 4.6, 0.2, 1.7, 0, 0.8, 0); s.box('mat', '#201e1d', 4.7, 0.1, 0.22, 0, 0.95, 0.86); s.box('gls', C.beam, 4.6, 0.03, 0.06, 0, 0.92, 0.74);
    qAdd(lay, M4, [0.75, 0.905, 0.05, 3.0, 1.35, 0, -Math.PI / 2]);
    s.cyl('mat', '#3d2a1c', 0.72, 0.22, -1.55, 1.0, 0, 28); s.cyl('mat', '#2a1a10', 0.62, 0.02, -1.55, 1.11, 0, 28); s.tor('gls', C.beam, 0.71, 0.03, -1.55, 1.11, 0, Math.PI / 2);
    for (let k = 0; k < 6; k++) s.cyl('gls', ['#ec3013', '#2e4a6b', '#f3f2f2', '#22c55e', '#ffd23a', '#201e1d'][k], 0.04, 0.05 + (k % 3) * 0.04, 0.2 + k * 0.32, 0.93, -0.55, 8);
    s.box('gls', '#201e1d', 3.0, 0.42, 1.0, 0, 3.2, 0); s.box('glo', C.light, 2.8, 0.02, 0.85, 0, 2.98, 0); for (const x of [-1.3, 1.3]) s.box('mat', '#201e1d', 0.012, 10.4, 0.012, x, 8.4, 0);
    s.build(g);
    const ORDER = [0, 28, 9, 26, 30, 11, 7, 20, 32, 17, 5, 22, 34, 15, 3, 24, 36, 13, 1, 37, 27, 10, 25, 29, 12, 8, 19, 31, 18, 6, 21, 33, 16, 4, 23, 35, 14, 2];
    const rt = CT(256, 256, (q, w) => { const cx = w / 2, n = ORDER.length; q.fillStyle = '#2a1a10'; q.fillRect(0, 0, w, w);
      for (let i = 0; i < n; i++) { const a0 = i / n * 6.2832, v = ORDER[i]; q.fillStyle = v === 0 || v === 37 ? '#16a34a' : RED.has(v) ? '#c42d3c' : '#141414'; q.beginPath(); q.moveTo(cx, cx); q.arc(cx, cx, cx, a0, a0 + 6.2832 / n); q.fill();
        q.save(); q.translate(cx, cx); q.rotate(a0 + 3.1416 / n + Math.PI / 2); q.fillStyle = '#ffffff'; q.font = '700 11px Archivo, sans-serif'; q.textAlign = 'center'; q.fillText(v === 37 ? '00' : String(v), 0, -cx * 0.88); q.restore(); }
      q.fillStyle = '#7a4a2a'; q.beginPath(); q.arc(cx, cx, cx * 0.62, 0, 7); q.fill(); q.strokeStyle = GOLD; q.lineWidth = 4; q.beginPath(); q.arc(cx, cx, cx * 0.62, 0, 7); q.stroke(); q.beginPath(); q.arc(cx, cx, cx * 0.76, 0, 7); q.stroke(); });
    rotor = new THREE.Group(); rotor.userData.keep = true; rotor.position.set(-1.55, 1.13, 0); g.add(rotor);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.5, 38), new THREE.MeshBasicMaterial({ map: rt })); face.rotation.x = -Math.PI / 2; rotor.add(face);
    const tur = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.16, 10), new THREE.MeshPhongMaterial({ color: GOLD, shininess: 80 })); tur.position.y = 0.08; rotor.add(tur);
    for (const ry of [0, Math.PI / 2]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.02), tur.material); bar.position.y = 0.15; bar.rotation.y = ry; rotor.add(bar); }
    ball = new THREE.Group(); ball.userData.keep = true; ball.position.copy(rotor.position); g.add(ball); const bm = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); bm.position.set(0.58, 0.01, 0); ball.add(bm);
    colR(o, 2.35, 0.9);
    const rl = CT(256, 32, (q, w, h) => { q.fillStyle = '#0a0d1c'; q.fillRect(0, 0, w, h); q.fillStyle = CYAN; q.fillRect(0, h - 3, w, 3); q.font = '900 20px Archivo, sans-serif'; q.textBaseline = 'middle'; q.fillStyle = '#ffffff'; q.fillText('ROULETTE', 10, h / 2, w - 20); });
    for (const sd of [-1, 1]) qAdd(rl, M4, [0, 3.2, sd * 0.51, 2.8, 0.34, sd > 0 ? 0 : Math.PI]);
    const [sx, sz] = frontOf(o, 2.0); spots.push({ label: 'ROULETTE', url: '../earth/roulette.html', x: sx, z: sz, r: 1.5, roul: { group: g, rotor, order: ORDER } }); }   // s101: roulette plays in world
  // ---------- bake every plain-colour part into one mesh per material ----------
  bake(THREE, G);
  for (const [tex, list] of QS) { const P = [], U = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
    for (const [pm, [x, y, z, w, h, ry = 0, rx = 0, u0 = 0, v0 = 0, u1 = 1, v1 = 1]] of list) { m4.compose(new THREE.Vector3(x, y, z), q.setFromEuler(e.set(rx, ry, 0, 'YXZ')), one).premultiply(pm);
      const c = [[-w / 2, -h / 2, u0, v0], [w / 2, -h / 2, u1, v0], [w / 2, h / 2, u1, v1], [-w / 2, h / 2, u0, v1]]; for (const j of [0, 1, 2, 0, 2, 3]) { v.set(c[j][0], c[j][1], 0).applyMatrix4(m4); P.push(v.x, v.y, v.z); U.push(c[j][2], c[j][3]); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeBoundingSphere();
    G.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05 }))); }
  // ---------- OUTSIDE: canopy over the door, bulb row, blade sign, marquee ----------
  let ext = null;
  if (exterior) { ext = new THREE.Group(); ext.name = 'meru2CasinoFront'; scene.add(ext); const e = Bin(), X = -105;
    e.box('mat', '#201e1d', 3.2, 0.28, 8.4, X + 1.6, 4.3, 0); e.box('glo', C.light, 3.0, 0.02, 8.0, X + 1.6, 4.15, 0); e.box('gls', C.beam, 0.08, 0.36, 8.5, X + 3.22, 4.3, 0); for (const s of [-1, 1]) e.box('gls', C.beam, 3.25, 0.36, 0.08, X + 1.6, 4.3, s * 4.22);
    for (let i = 0; i < (touch ? 12 : 20); i++) { const z = -4 + i * (8 / ((touch ? 12 : 20) - 1)); e.sph('glo', i % 2 ? '#fff1c8' : '#ffd23a', 0.07, X + 3.28, 4.12, z, 1, 6); }
    for (const s of [-1, 1]) { e.cyl('gls', C.beam, 0.09, 4.2, X + 3.0, 2.1, s * 3.9, 10); e.cyl('gls', C.beam, 0.2, 0.1, X + 3.0, 0.05, s * 3.9, 12); ring(X + 3.0, s * 3.9, 0.2); }
    e.box('mat', '#a3162b', 5.5, 0.02, 2.6, X + 2.6, 0.03, 0);
    e.box('mat', '#201e1d', 1.7, 7.4, 0.32, X + 0.95, 8.6, -6.6); for (const y of [4.95, 12.25]) e.box('gls', C.beam, 1.74, 0.08, 0.36, X + 0.95, y, -6.6); e.box('gls', C.beam, 0.08, 7.4, 0.36, X + 1.8, 8.6, -6.6);
    for (let i = 0; i < (touch ? 10 : 16); i++) { const y = 5.2 + i * (6.8 / ((touch ? 10 : 16) - 1)); e.sph('glo', i % 2 ? '#fff1c8' : C.neon, 0.07, X + 1.86, y, -6.6, 1, 6); }
    e.box('mat', '#05080f', 0.12, 1.9, 9.4, X + 0.08, 6.0, 0); e.box('gls', C.beam, 0.16, 0.08, 9.5, X + 0.1, 7.0, 0); e.box('gls', C.beam, 0.16, 0.08, 9.5, X + 0.1, 5.0, 0);
    e.build(ext);
    const blade = CT(128, 512, (q, w, h) => { q.fillStyle = '#201e1d'; q.fillRect(0, 0, w, h); q.fillStyle = '#ffffff'; q.font = '900 78px Archivo, sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; 'CASINO'.split('').forEach((ch, i) => { q.fillStyle = i % 2 ? '#ffd23a' : '#ffffff'; q.fillText(ch, w / 2, 44 + i * 84); }); });
    const mar = CT(1024, 192, (q, w, h) => { q.fillStyle = '#05080f'; q.fillRect(0, 0, w, h); q.strokeStyle = GOLD; q.lineWidth = 8; q.strokeRect(6, 6, w - 12, h - 12); q.textBaseline = 'middle'; q.fillStyle = C.neon; q.font = '800 34px Archivo, sans-serif'; q.fillText('SLOTS · POKER · CRAPS · ROULETTE · TREASURE WHEEL · THE 8 BAR', 32, 50, w - 64); q.fillStyle = '#ffffff'; q.font = '900 92px Archivo, sans-serif'; q.fillText('MERU CASINO', 30, 128, w - 60); });
    const qm = (tex, list) => { const P = [], U = [], m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
      for (const [x, y, z, w, h, ry] of list) { m4.compose(new THREE.Vector3(x, y, z), qq.setFromEuler(new THREE.Euler(0, ry, 0)), one); const c = [[-w / 2, -h / 2, 0, 0], [w / 2, -h / 2, 1, 0], [w / 2, h / 2, 1, 1], [-w / 2, h / 2, 0, 1]]; for (const j of [0, 1, 2, 0, 2, 3]) { v.set(c[j][0], c[j][1], 0).applyMatrix4(m4); P.push(v.x, v.y, v.z); U.push(c[j][2], c[j][3]); } }
      const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(U, 2)); g.computeBoundingSphere(); ext.add(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex }))); };
    qm(blade, [[X + 0.95, 8.6, -6.6 + 0.17, 1.5, 6.9, 0], [X + 0.95, 8.6, -6.6 - 0.17, 1.5, 6.9, Math.PI]]); qm(mar, [[X + 0.15, 6.0, 0, 9.2, 1.75, Math.PI / 2]]); }
  // ---------- people (the caller builds the foxes: kit lives in the walk) ----------
  for (const p of LY.people || []) { if (touch && p.phoneSkip) continue; people.push({ key: p.key, x: p.x, z: p.z, ry: R(p.a || 0), look: PEOPLE_LOOK[p.key] || { torso: '#201e1d', outfit: 'vest' } }); }
  const far = touch ? 70 : 130;
  function tick(dt, t, P) { if (P) G.visible = Math.hypot(P.x + 127.5, P.z) < far; if (wheel) wheel.rotation.z += dt * 0.4; if (rotor) (rotor.userData.held || (rotor.rotation.y += dt * 0.9)); if (ball) ball.rotation.y -= dt * 2.2; }
  function dispose() { for (const g of [G, ext]) { if (!g) continue; g.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } }); scene.remove(g); } }
  return { group: G, ext, spots, people, tick, dispose, layout: LY };
}
// one mesh per material kind for every Bin mesh under G (skips textured meshes and anything under a userData.keep group)
function bake(THREE, G) { G.updateMatrixWorld(true); const inv = new THREE.Matrix4().copy(G.matrixWorld).invert(), bins = new Map(), take = [];
  G.traverse(o => { if (!o.isMesh || !o.material || !o.material.vertexColors || o.material.map) return; for (let p = o; p && p !== G; p = p.parent) if (p.userData && p.userData.keep) return;
    const m = o.material, k = m.type + '|' + (m.transparent ? 1 : 0); if (!bins.has(k)) bins.set(k, { m, list: [] }); bins.get(k).list.push(o); });
  for (const { m, list } of bins.values()) { if (list.length < 2) continue; let n = 0; const gs = [];
    for (const o of list) { const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()); g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld)); gs.push(g); n += g.attributes.position.count; take.push(o); }
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), col = new Float32Array(n * 3); let off = 0;
    for (const g of gs) { pos.set(g.attributes.position.array, off * 3); nor.set(g.attributes.normal.array, off * 3); col.set(g.attributes.color.array, off * 3); off += g.attributes.position.count; g.dispose(); }
    const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); bg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); bg.setAttribute('color', new THREE.BufferAttribute(col, 3)); bg.computeBoundingSphere();
    const me = new THREE.Mesh(bg, m); me.receiveShadow = list[0].receiveShadow; me.renderOrder = list[0].renderOrder; G.add(me); }
  for (const o of take) { if (o.parent) o.parent.remove(o); o.geometry.dispose(); }
  const empty = []; G.children.forEach(c => { if (!c.isMesh && c.children.length === 0) empty.push(c); }); for (const c of empty) G.remove(c); }
