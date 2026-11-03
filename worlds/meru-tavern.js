// MERU TAVERN [meruTavern] — the old Meru tavern (Ben: "it was GREAT"), lifted out of meru-game.js into one build function.
// buildTavern(ctx) dresses a rect (the Meru 2 shell, its own walls/windows stay): bar + glowing bottle shelves, stone fireplace,
// round tables with candles and mugs, barrels, hanging lanterns, the 3D JUKEBOX (A1-A5, MP3 from MERU/MUSIC/JUKEBOX/ or a synth
// groove in the song's style) and DARTS on the real board (drifting red sight + timed power bar, chalk scoreboard, best score saved),
// with Flick (meru-darter.js) on the second board. Phone budget: no point lights, instanced chairs/bottles/mugs, glow sprites.
import { createDarter } from './meru-darter.js?v=s645';
import { applyD, neutralD, endPose } from '../engine/fox-poses.js?v=s648k';   // s615 jointed darts
import { PLAYER_MALE } from '../fox-kit.js?v=s673';
import { buildPoolTable, POOL_SIZE } from './meru-pooltable.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, smooth = (a, b, t) => { const k = clamp((t - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); }, rr = (a, b) => a + Math.random() * (b - a);
export const SONGS = [
  { n: 'A1', genre: 'COUNTRY', title: 'SPACE HORSE', file: 'JUKEBOX-COUNTRY.mp3', bpm: 104, col: '#ffd23a' },
  { n: 'A2', genre: 'JAZZ', title: 'FLY ME PAST THE MOON', file: 'JUKEBOX-FLY-ME-PAST-THE-MOON.mp3', bpm: 92, col: '#38bdf8' },
  { n: 'A3', genre: 'OPERA', title: 'PHANTOM OF THE UNIVERSE', file: 'JUKEBOX-PHANTOM.mp3', bpm: 70, col: '#c084fc' },
  { n: 'A4', genre: 'ROCKABILLY', title: 'SPACE FOX', file: 'JUKEBOX-SPACE-FOX.mp3', bpm: 160, col: '#ec3013' },
  { n: 'A5', genre: 'ROCK & ROLL', title: 'BLAST OFF', file: 'JUKEBOX-ROCK-AND-ROLL.mp3', bpm: 150, col: '#ff3bd4' },
];
const SEG = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5], PERFECT = 0.72;
// ---- LAYOUT (session 33): Ben moves / turns / adds things in Tavern Workshop.dc.html → localStorage 'meru2.tavernLayout'. World metres.
// a = facing in degrees: 0 = front faces south +z, 90 = east, 180 = north, 270 = west (same as the casino).
export const TAVERN_LAYOUT_KEY = 'meru2.tavernLayout';
export const TAVERN_ROOM = { x0: 12, x1: 52, z0: -100, z1: -60, door: { x: 32, z: -60, w: 4 } };
export const TAVERN_DEFAULT = {
  colors: { floor: '#7a5236', wood: '#6b4a35', dark: '#3a2618', beam: '#2e2018', brass: '#e0a84a', stool: '#c42d3c', table: '#7a5236', stone: '#9a8e7c', rug: '#7a1d2a', lantern: '#ffc070', backlight: '#ffb866', felt: '#1d6b4c', poolLamp: '#2f5a3a' },
  pool: { x: 28.0, z: -79, a: 0 },   // Tavern Pool's table + green lamp: left of the middle path, right of the west tables
  bar: { x: 30, z: -95.1, a: 0 }, shelves: { x: 30, z: -99.3, a: 0 }, barrels: { x: 47.8, z: -98.8, a: 0 },
  fireplace: { x: 12.45, z: -81, a: 90 }, rug: { x: 15.3, z: -81, a: 0 },
  darts: { x: 51.5, z: -89, a: 270 }, darts3: { x: 51.5, z: -86, a: 270 }, darts4: { x: 51.5, z: -83, a: 270 }, darts2: { x: 51.5, z: -80, a: 270 }, jukebox: { x: 51.05, z: -68, a: 270 },
  tables: [[19, -88], [27, -88], [35, -89], [19, -78], [38, -78], [19, -68], [25, -70], [39, -69], [44, -63.5], [20, -63]].map(([x, z]) => ({ x, z, a: 0 })),
  lanterns: [[19, -84], [27, -84], [35, -84], [19, -74], [30, -75], [40, -73], [24, -65], [38, -64]].map(([x, z]) => ({ x, z })),
  people: [{ key: 'noble', x: 24.6, z: -75.2, a: 153 }, { key: 'docBraun', x: 39, z: -85, a: 225 }],
};
export const TAVERN_PEOPLE = { noble: { name: 'Noble', torso: '#3b4a8f' }, docBraun: { name: 'Doc Braun', torso: '#5c6670' } };
// footprint half sizes (x, z) in the object's own frame
export const TAVERN_SIZE = { bar: [10.15, 1.4], shelves: [10.2, 0.55], barrels: [1.7, 0.8], fireplace: [2.1, 0.6], rug: [1.25, 1.85], pool: POOL_SIZE, darts: [0.85, 0.3], darts2: [0.85, 0.3], darts3: [0.85, 0.3], darts4: [0.85, 0.3], jukebox: [1.1, 0.85], table: [1.6, 1.6], lantern: [0.25, 0.25], person: [0.4, 0.4] };
export function tavernLayout() { const D = JSON.parse(JSON.stringify(TAVERN_DEFAULT)); try { const s = JSON.parse(localStorage.getItem(TAVERN_LAYOUT_KEY) || 'null');
  if (s && typeof s === 'object') for (const k of Object.keys(D)) if (s[k] != null) D[k] = k === 'colors' ? { ...D.colors, ...s.colors } : s[k]; } catch (e) {} return D; }
const RAD = a => (a || 0) * Math.PI / 180;
export const frontOf = (o, d) => [o.x + Math.sin(RAD(o.a)) * d, o.z + Math.cos(RAD(o.a)) * d];
export function rotBox(o, hw, hd) { const r = RAD(o.a), c = Math.abs(Math.cos(r)), s = Math.abs(Math.sin(r)), ex = hw * c + hd * s, ez = hw * s + hd * c; return [o.x - ex, o.x + ex, o.z - ez, o.z + ez]; }
// local (lx, lz) in an object's frame → world [x, z]
const toW = (o, lx, lz) => { const r = RAD(o.a), c = Math.cos(r), s = Math.sin(r); return [o.x + lx * c + lz * s, o.z - lx * s + lz * c]; };

// rect = { x0, x1, z0, z1 } (inside of the shell; door on the south wall z1), audio() = AudioContext or null (muted), save = engine save
export function buildTavern({ THREE, scene, M, toon, grad, kit, cols, save, audio, rect = TAVERN_ROOM, touch, layout, clear = [] }) {
  const { x0: X0, x1: X1, z0: Z0, z1: Z1 } = rect, CX = (X0 + X1) / 2, L = JSON.parse(JSON.stringify(layout || tavernLayout())), C = { ...TAVERN_DEFAULT.colors, ...(L.colors || {}) };
  // s34: keep the BACK DOOR clear (Meru 2 passes the door + its approach): barrels go to the west end of the back wall, tables step south
  if (clear.length) { const inC = (x0, x1, z0, z1) => clear.some(r => x0 < r[1] && x1 > r[0] && z0 < r[3] && z1 > r[2]);
    if (L.barrels && inC(L.barrels.x - 1.9, L.barrels.x + 1.9, L.barrels.z - 1, L.barrels.z + 1)) L.barrels = { x: X0 + 3.6, z: Z0 + 1.2, a: 0 };
    for (const t of L.tables || []) for (let n = 0; n < 12 && inC(t.x - 1.4, t.x + 1.4, t.z - 1.4, t.z + 1.4); n++) t.z += 1; }
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d), CYL = (a, b, h, n = 12) => new THREE.CylinderGeometry(a, b, h, n);
  const box = (a, b, c, d) => cols.push({ f: [a, b, c, d] }), ring = (x, z, r) => cols.push({ c: [x, z, r] }), rbox = (o, hw, hd) => box(...rotBox(o, hw, hd));
  const place = o => { const g = new THREE.Group(); g.position.set(o.x, 0, o.z); g.rotation.y = RAD(o.a); scene.add(g); return g; };
  const basic = c => new THREE.MeshBasicMaterial({ color: c });
  const canvasTex = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const glowTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const glowSprite = (x, y, z, col, s, parent) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 })); sp.position.set(x, y, z); sp.scale.setScalar(s); (parent || scene).add(sp); return sp; };
  const signTex = (txt, col) => canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = col; g.font = '900 78px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); });
  const wood = toon(C.wood), dark = toon(C.dark), beam = toon(C.beam), brass = toon(C.brass), DARK = toon('#201e1d'), stoolM = toon(C.stool), tableM = toon(C.table);
  const flames = [], spots = [];
  const inside = (x, z, m = 0) => x > X0 - m && x < X1 + m && z > Z0 - m && z < Z1 + m;

  // ---- floor: warm planks over the shell floor ----
  { const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = C.floor; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'; g.fillRect(0, i * 32 + 1, w, 30); g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(((i * 97) % 200) + 20, i * 32, 3, 32); } g.fillStyle = 'rgba(0,0,0,0.5)'; for (let i = 0; i <= 8; i++) g.fillRect(0, i * 32, w, 2); }, [(X1 - X0) / 3, (Z1 - Z0) / 3]);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 - 0.2, Z1 - Z0 - 0.2), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.position.set(CX, 0.035, (Z0 + Z1) / 2); fl.receiveShadow = true; scene.add(fl); }

  // ---- the bar (counter, brass rail, taps, stools), the glowing bottle shelves, barrels: each in its own frame from the layout ----
  { const o = L.bar, g = place(o);
    M(BOX(20, 1.15, 1.1), wood, 0, 0.58, 0, g, 0.04); M(BOX(20.3, 0.12, 1.35), dark, 0, 1.2, 0, g, 0.02); M(BOX(20, 0.1, 0.1), brass, 0, 0.18, 0.62, g, 0);
    rbox(o, 10.15, 0.7);
    for (let i = 0; i < 7; i++) { const tx = -6 + i * 2; M(CYL(0.05, 0.05, 0.5, 8), brass, tx, 1.5, -0.3, g, 0.01); M(BOX(0.12, 0.18, 0.12), stoolM, tx, 1.78, -0.3, g, 0.01); }
    for (let i = 0; i < 10; i++) { const sx = -9 + i * 2; M(CYL(0.28, 0.24, 0.12, 14), stoolM, sx, 0.95, 1.05, g, 0.015, 0.28); M(CYL(0.05, 0.07, 0.9, 8), DARK, sx, 0.45, 1.05, g, 0); const [wx, wz] = toW(o, sx, 1.05); ring(wx, wz, 0.3); } }
  { const o = L.shelves, g = place(o);
    M(BOX(20.4, 3.3, 0.5), beam, 0, 1.65, -0.25, g, 0.02); M(BOX(19.6, 2.5, 0.04), basic(C.backlight), 0, 2.25, 0.02, g, 0);   // back-lit wall unit
    const bc = ['#3f9a5e', '#c42d3c', '#e0a84a', '#38bdf8', '#7c3aed', '#ffffff'], n = 3 * 28, im = new THREE.InstancedMesh(CYL(0.07, 0.09, 0.44, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), n), m4 = new THREE.Matrix4(), c3 = new THREE.Color();
    let k = 0; for (let r = 0; r < 3; r++) { M(BOX(19.6, 0.08, 0.5), dark, 0, 1.25 + r * 0.8, 0.25, g, 0); for (let i = 0; i < 28; i++, k++) { const s = 0.85 + Math.random() * 0.35; m4.makeScale(1, s, 1).setPosition(-9.4 + i * 0.7 + rr(-0.1, 0.1), 1.52 + r * 0.8 + (s - 1) * 0.22, 0.25); im.setMatrixAt(k, m4); im.setColorAt(k, c3.set(bc[(i * 7 + r * 3) % 6]).multiplyScalar(0.85)); } }
    g.add(im); rbox(o, 10.2, 0.55); }
  { const o = L.barrels, g = place(o), bm = toon(C.table);
    for (const [x, z, y] of [[-0.8, -0.2, 0.5], [0.2, -0.2, 0.5], [-0.3, -0.2, 1.45], [1.2, 0.2, 0.5]]) { const b = M(CYL(0.48, 0.44, 0.95, 16), bm, x, y, z, g, 0.03, 0.48); for (const yy of [-0.3, 0.3]) M(new THREE.TorusGeometry(0.47, 0.03, 4, 18), DARK, 0, yy, 0, b, 0).rotation.x = Math.PI / 2; }
    rbox(o, 1.7, 0.8); }

  // ---- STONE FIREPLACE (polish s33d): dressed-stone piers + lintel with a keystone, sooty brick firebox, raised hearth, oak mantel on corbels
  // with candles + tankards, a chimney breast with a stone band, iron grate + three logs, fire tools and a log basket.
  // THE FIRE: layered additive flame sprites that lick + sway, a glowing ember bed, rising sparks, a flickering glow and a warm light pool on the floor.
  { const fp = place(L.fireplace);
    const stoneT = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#2a2622'; g.fillRect(0, 0, w, h); const base = new THREE.Color(C.stone); let y = 0;
      while (y < h) { const rh = 26 + Math.random() * 20; let x = -Math.random() * 30; while (x < w) { const rw = 34 + Math.random() * 40, k = 0.78 + Math.random() * 0.4, c = base.clone().multiplyScalar(k);
        g.fillStyle = '#' + c.getHexString(); g.beginPath(); g.roundRect ? g.roundRect(x + 2, y + 2, rw - 4, rh - 4, 6) : g.rect(x + 2, y + 2, rw - 4, rh - 4); g.fill();
        g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 4, y + 3, rw - 10, 3); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 4, y + rh - 7, rw - 8, 3); x += rw; } y += rh; } });
    stoneT.wrapS = stoneT.wrapT = THREE.RepeatWrapping;
    const SM = (rx, ry) => { const t = stoneT.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new THREE.MeshToonMaterial({ map: t, gradientMap: grad }); };
    const sootT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#1a0f0a'; g.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let i = -1; i < 5; i++) { g.fillStyle = 'rgb(' + (60 + Math.random() * 25 | 0) + ',' + (28 + Math.random() * 10 | 0) + ',' + (20 + Math.random() * 8 | 0) + ')'; g.fillRect(i * 32 + (r % 2) * 16 + 1, r * 16 + 1, 30, 14); }
      const q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, 'rgba(0,0,0,0.85)'); q.addColorStop(0.6, 'rgba(0,0,0,0.3)'); q.addColorStop(1, 'rgba(255,120,40,0.25)'); g.fillStyle = q; g.fillRect(0, 0, w, h); });
    const pier = SM(0.6, 2.4 / 1.2), oak = toon('#5a3a24'), iron = toon('#1c1a18');
    for (const sx of [-1, 1]) { M(BOX(0.7, 2.4, 0.95), pier, sx * 1.25, 1.2, 0, fp, 0.03); M(BOX(0.82, 0.2, 1.05), SM(0.7, 0.2), sx * 1.25, 0.1, 0, fp, 0.02); }
    M(BOX(1.8, 1.05, 0.95), SM(1.6, 1), 0, 1.875, 0, fp, 0.03); M(BOX(0.36, 0.5, 0.12), SM(0.3, 0.4), 0, 1.6, 0.5, fp, 0.015);   // lintel + keystone
    M(BOX(1.8, 1.35, 0.1), new THREE.MeshBasicMaterial({ map: sootT }), 0, 0.675, -0.4, fp, 0);   // firebox back
    { const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.85), new THREE.MeshBasicMaterial({ color: 0x140a06 })); fl.rotation.x = -Math.PI / 2; fl.position.set(0, 0.16, 0.05); fp.add(fl); }
    M(BOX(3.6, 0.16, 0.9), SM(2.6, 0.12), 0, 0.08, 0.85, fp, 0.02);   // raised hearth
    M(BOX(3.6, 0.2, 0.6), oak, 0, 2.5, 0.22, fp, 0.025); M(BOX(3.7, 0.06, 0.66), toon(C.brass), 0, 2.38, 0.22, fp, 0.01);   // mantel + brass edge
    for (const sx of [-1, 1]) M(BOX(0.2, 0.3, 0.4), oak, sx * 1.5, 2.25, 0.32, fp, 0.015);
    M(BOX(2.0, 4.2, 0.65), SM(1.6, 3.5), 0, 4.7, -0.15, fp, 0.03); M(BOX(2.1, 0.18, 0.72), SM(1.7, 0.15), 0, 3.6, -0.15, fp, 0.015); M(BOX(2.1, 0.18, 0.72), SM(1.7, 0.15), 0, 6.6, -0.15, fp, 0.015);
    // on the mantel: two candlesticks (lit) + three tankards
    for (const sx of [-1.35, 1.35]) { M(CYL(0.08, 0.1, 0.06, 10), toon(C.brass), sx, 2.63, 0.25, fp, 0); M(CYL(0.04, 0.04, 0.28, 8), toon('#f7f1e6'), sx, 2.8, 0.25, fp, 0); const cf = M(new THREE.ConeGeometry(0.04, 0.1, 6), basic(C.lantern), sx, 3.0, 0.25, fp, 0); flames.push({ candle: cf, ph: rr(0, 9) }); glowSprite(sx, 3.0, 0.3, 0xffb060, 0.6, fp); }
    for (const sx of [-0.55, 0, 0.55]) { M(CYL(0.09, 0.08, 0.2, 10), toon(sx ? '#8a6a4a' : C.brass), sx, 2.7, 0.24, fp, 0.01); }
    // grate + logs
    for (const sx of [-0.55, 0.55]) { M(BOX(0.06, 0.32, 0.06), iron, sx, 0.32, 0.25, fp, 0); M(BOX(0.06, 0.06, 0.55), iron, sx, 0.2, 0.05, fp, 0); }
    M(BOX(1.2, 0.04, 0.04), iron, 0, 0.22, 0.2, fp, 0);
    const logM = toon('#5a3d2c'), logEnd = toon('#c9a070');
    for (const [x, y, z, ry, rz] of [[-0.05, 0.3, 0.05, 0.12, 0], [0.12, 0.3, 0.3, -0.2, 0], [0, 0.48, 0.15, 0.05, 0.25]]) { const lg = M(CYL(0.1, 0.11, 1.15, 8), logM, x, y, z, fp, 0.01); lg.rotation.set(0, ry, Math.PI / 2 + rz); }
    // tools stand (right) + log basket (left)
    { const tx = 2.05, tz = 0.75; M(CYL(0.16, 0.18, 0.04, 10), iron, tx, 0.18, tz, fp, 0); M(CYL(0.02, 0.02, 1.0, 6), iron, tx, 0.7, tz, fp, 0); M(new THREE.TorusGeometry(0.06, 0.012, 4, 10), toon(C.brass), tx, 1.22, tz, fp, 0);
      for (const [dx, dz] of [[0.08, 0], [-0.05, 0.07], [-0.04, -0.07]]) { M(CYL(0.012, 0.012, 0.85, 4), iron, tx + dx, 0.62, tz + dz, fp, 0); M(BOX(0.1, 0.12, 0.02), iron, tx + dx, 0.2, tz + dz, fp, 0); } }
    { const bx = -2.05, bz = 0.75; M(CYL(0.36, 0.3, 0.42, 12), toon('#7a5a30'), bx, 0.37, bz, fp, 0.02, 0.36); for (const [dz, ry] of [[-0.12, 0.2], [0.1, -0.15], [0, 0.6]]) { const lg = M(CYL(0.08, 0.08, 0.7, 7), logM, bx, 0.62, bz + dz, fp, 0.01); lg.rotation.set(0, ry, Math.PI / 2); } }
    // THE FIRE
    const flameT = canvasTex(64, 128, (g, w, h) => { const q = g.createRadialGradient(w / 2, h * 0.78, 2, w / 2, h * 0.6, h * 0.6); q.addColorStop(0, 'rgba(255,250,220,1)'); q.addColorStop(0.25, 'rgba(255,210,90,0.95)'); q.addColorStop(0.55, 'rgba(255,110,30,0.7)'); q.addColorStop(1, 'rgba(200,30,10,0)');
      g.fillStyle = q; g.beginPath(); g.moveTo(w / 2, 0); g.bezierCurveTo(w * 0.95, h * 0.45, w * 0.95, h * 0.9, w / 2, h); g.bezierCurveTo(w * 0.05, h * 0.9, w * 0.05, h * 0.45, w / 2, 0); g.fill(); });
    const tongues = [[-0.36, 0.55, 0xff7a2a], [-0.12, 0.75, 0xffa040], [0.12, 0.7, 0xffb050], [0.34, 0.5, 0xff6a20], [0, 0.95, 0xffd27a], [-0.22, 0.42, 0xffc060], [0.24, 0.45, 0xff8a3a]].map(([x, hgt, col], i) => {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameT, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.center.set(0.5, 0); sp.position.set(x, 0.3, 0.12 + (i % 2) * 0.08); fp.add(sp); return { sp, x, hgt, ph: rr(0, 9), sp2: rr(7, 12) }; });
    const emberT = canvasTex(128, 64, (g, w, h) => { g.fillStyle = '#2a0d04'; g.fillRect(0, 0, w, h); for (let i = 0; i < 70; i++) { const r = 3 + Math.random() * 7; g.fillStyle = 'rgba(255,' + (90 + Math.random() * 110 | 0) + ',20,' + (0.5 + Math.random() * 0.5) + ')'; g.beginPath(); g.arc(Math.random() * w, Math.random() * h, r, 0, 7); g.fill(); } });
    const embers = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.6), new THREE.MeshBasicMaterial({ map: emberT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); embers.rotation.x = -Math.PI / 2; embers.position.set(0, 0.2, 0.12); fp.add(embers);
    const NSP = 22, spA = new Float32Array(NSP * 3), spV = Array.from({ length: NSP }, () => ({ v: rr(0.5, 1.2), life: rr(0, 1.6), ph: rr(0, 6) })), spG = new THREE.BufferGeometry(); spG.setAttribute('position', new THREE.BufferAttribute(spA, 3));
    const sparksF = new THREE.Points(spG, new THREE.PointsMaterial({ color: 0xffb060, map: glowTex, size: 0.07, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sparksF.frustumCulled = false; fp.add(sparksF);
    const glow = glowSprite(0, 0.8, 0.7, 0xff8a3a, 3.4, fp);
    const lpT = canvasTex(128, 128, (g, w) => { const q = g.createRadialGradient(w / 2, w / 2, 4, w / 2, w / 2, w / 2); q.addColorStop(0, 'rgba(255,150,60,0.5)'); q.addColorStop(1, 'rgba(255,120,40,0)'); g.fillStyle = q; g.fillRect(0, 0, w, w); });
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(5, 4), new THREE.MeshBasicMaterial({ map: lpT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.07, 2.2); fp.add(pool);
    flames.push({ fire(t, dt) { const fl = 1 + Math.sin(t * 9.1) * 0.08 + Math.sin(t * 23.7) * 0.05 + Math.sin(t * 4.3) * 0.06;
      for (const f of tongues) { const k = 0.8 + 0.3 * Math.sin(t * f.sp2 + f.ph) + 0.12 * Math.sin(t * 17 + f.ph * 2); f.sp.scale.set(0.42 * (1.15 - k * 0.2), f.hgt * k, 1); f.sp.position.x = f.x + Math.sin(t * 3.1 + f.ph) * 0.04; f.sp.material.opacity = 0.7 + 0.3 * Math.sin(t * 13 + f.ph); }
      embers.material.opacity = 0.75 + 0.25 * Math.sin(t * 2.3) * Math.sin(t * 5.1); glow.material.opacity = 0.4 * fl; glow.scale.setScalar(3.2 + fl * 0.5); pool.material.opacity = 0.75 * fl;
      for (let i = 0; i < NSP; i++) { const s = spV[i]; s.life += dt; if (s.life > 1.6) { s.life = 0; s.v = rr(0.5, 1.2); s.x0 = rr(-0.4, 0.4); }
        spA[i * 3] = (s.x0 || 0) + Math.sin(s.life * 4 + s.ph) * 0.08; spA[i * 3 + 1] = 0.35 + s.life * s.v; spA[i * 3 + 2] = 0.1 + Math.sin(s.life * 3 + s.ph) * 0.05; } spG.attributes.position.needsUpdate = true; } }); }
  rbox(L.fireplace, 2.1, 0.6);
  // ---- the RUG: an oval braided rug (rings of rug colour, gold, cream), fringe at both ends ----
  { const r = place(L.rug), base = new THREE.Color(C.rug), ringC = [base.clone(), new THREE.Color('#e0a84a'), base.clone().multiplyScalar(0.7), new THREE.Color('#efe2c4'), base.clone().multiplyScalar(1.2), new THREE.Color('#3a2618')];
    const rt = canvasTex(256, 384, (g, w, h) => { g.clearRect(0, 0, w, h); for (let i = 0; i < 14; i++) { const k = 1 - i / 14, c = ringC[i % ringC.length]; g.fillStyle = '#' + c.getHexString(); g.beginPath(); g.ellipse(w / 2, h / 2, (w / 2 - 14) * k, (h / 2 - 22) * k, 0, 0, 7); g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.18)'; g.lineWidth = 2; g.setLineDash([5, 4]); g.stroke(); g.setLineDash([]); }
      g.fillStyle = '#' + ringC[0].getHexString(); g.font = '900 64px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#efe2c4'; g.fillText('8', w / 2, h / 2 + 3);
      g.strokeStyle = '#efe2c4'; g.lineWidth = 3; for (let x = 70; x < w - 70; x += 9) { g.beginPath(); g.moveTo(x, 22); g.lineTo(x, 4); g.stroke(); g.beginPath(); g.moveTo(x, h - 22); g.lineTo(x, h - 4); g.stroke(); } });
    const rm = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 3.75), new THREE.MeshToonMaterial({ map: rt, gradientMap: grad, transparent: true, alphaTest: 0.5 })); rm.rotation.x = -Math.PI / 2; rm.position.y = 0.045; rm.receiveShadow = true; r.add(rm); }

  // ---- round tables: 3 chairs each (instanced), mugs, a candle ----
  // s181 FOX SCALE (s174 rule: fox seat 0.62-0.66 m, table top 1.0-1.05 m): chairs ×1.35 (seat top 0.65), table top 0.95 → 1.02, chairs 1.25 → 1.32 m out
  const TABLES = L.tables || [];
  { const n = TABLES.length * 3, seat = new THREE.InstancedMesh(BOX(0.68, 0.08, 0.68), wood, n), back = new THREE.InstancedMesh(BOX(0.68, 0.8, 0.08), wood, n), post = new THREE.InstancedMesh(BOX(0.46, 0.57, 0.46), beam, n), mugs = new THREE.InstancedMesh(CYL(0.09, 0.08, 0.2, 10), brass, TABLES.length * 2);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(); let k = 0, mk = 0;
    for (const T of TABLES) { const { x, z } = T;
      M(CYL(0.85, 0.85, 0.1, 20), tableM, x, 1.02, z, null, 0.025, 0.85); M(CYL(0.1, 0.16, 0.97, 10), beam, x, 0.485, z, null, 0.015, 0.16); ring(x, z, 1.0);
      for (let j = 0; j < 3; j++, k++) { const a = j / 3 * Math.PI * 2 + 0.4 + RAD(T.a), cx = x + Math.sin(a) * 1.32, cz = z + Math.cos(a) * 1.32; q.setFromEuler(e.set(0, a, 0));
        seat.setMatrixAt(k, m4.compose(p.set(cx, 0.61, cz), q, one)); back.setMatrixAt(k, m4.compose(p.set(cx + Math.sin(a) * 0.3, 1.05, cz + Math.cos(a) * 0.3), q, one)); post.setMatrixAt(k, m4.compose(p.set(cx, 0.29, cz), q, one)); }
      for (let j = 0; j < 2; j++, mk++) { const a = j * 2.6 + x; mugs.setMatrixAt(mk, m4.makeTranslation(x + Math.sin(a) * 0.45, 1.17, z + Math.cos(a) * 0.45)); }
      M(CYL(0.05, 0.05, 0.16, 8), toon('#f7f1e6'), x, 1.15, z, null, 0); const cf = M(new THREE.ConeGeometry(0.035, 0.09, 6), basic(C.lantern), x, 1.28, z, null, 0); flames.push({ candle: cf, ph: rr(0, 9) }); glowSprite(x, 1.22, z, 0xffb060, 0.7);
    }
    for (const im of [seat, back, post, mugs]) { im.castShadow = !touch; im.receiveShadow = true; scene.add(im); } }

  // ---- the POOL TABLE + its long green lamp (worlds/meru-pooltable.js, from Tavern Pool) ----
  if (L.pool) { const pt = buildPoolTable({ THREE, M, toon, grad, parent: scene, o: L.pool, look: { felt: C.felt, shade: C.poolLamp } }); rbox(L.pool, pt.half[0], pt.half[1]); }

  // ---- hanging lanterns (glow only) ----
  { const lm = basic(C.lantern); for (const { x, z } of (L.lanterns || [])) {
    M(CYL(0.02, 0.02, 2.2, 4), DARK, x, 5.9, z, null, 0); M(BOX(0.36, 0.44, 0.36), lm, x, 4.6, z, null, 0.02); glowSprite(x, 4.6, z, C.lantern, 2.6); } }

  // ================= DARTS on the east wall =================
  // FOUR boards in a row (session 33): darts / darts3 / darts4 are yours to play (the game runs on whichever one you step up to), darts2 is Flick's.
  // F = out of the board, R = board's right (+u). setBoard() points the whole game (sight, bar, pops, sparks, camera) at one board.
  let DA = 0, FX = 0, FZ = 1, RX = 1, RZ = 0, barG = null;
  const DART = { x: 0, y: 2.0, z: 0, R: 0.5, a: 0 }; const W = (u, v, d, out = new THREE.Vector3()) => out.set(DART.x + FX * d + RX * u, DART.y + v, DART.z + FZ * d + RZ * u);
  function setBoard(o) { DA = RAD(o.a); FX = Math.sin(DA); FZ = Math.cos(DA); RX = Math.cos(DA); RZ = -Math.sin(DA); DART.x = o.x; DART.z = o.z; DART.a = o.a; DART.oche = W(0, 0, 5.24); if (barG) { W(1.15, 0, 0.1, barG.position); barG.rotation.y = DA; } }
  const BOARDS = ['darts', 'darts3', 'darts4'].map(k => L[k] || TAVERN_DEFAULT[k]).filter(Boolean), ROW = [...BOARDS, L.darts2].filter(Boolean);
  setBoard(BOARDS[0]);
  const boardTex = canvasTex(512, 512, (c) => {
    const C = 256, Rr = 250; c.fillStyle = '#111'; c.beginPath(); c.arc(C, C, Rr, 0, 7); c.fill();
    const rg = (r0, r1, colA, colB) => { for (let i = 0; i < 20; i++) { const a0 = -Math.PI / 2 + (i - 0.5) * Math.PI / 10, a1 = a0 + Math.PI / 10; c.fillStyle = i % 2 ? colB : colA; c.beginPath(); c.arc(C, C, r1, a0, a1); c.arc(C, C, r0, a1, a0, true); c.closePath(); c.fill(); } };
    const S = Rr * 0.8 / DART.R;
    rg(0, 0.5 * S, '#1a1a1a', '#f1e6c8'); rg(0.29 * S, 0.32 * S, '#c42d3c', '#2f8a4a'); rg(0.47 * S, 0.5 * S, '#c42d3c', '#2f8a4a');
    c.fillStyle = '#2f8a4a'; c.beginPath(); c.arc(C, C, 0.09 * S, 0, 7); c.fill(); c.fillStyle = '#c42d3c'; c.beginPath(); c.arc(C, C, 0.04 * S, 0, 7); c.fill();
    c.strokeStyle = '#cbd5e1'; c.lineWidth = 1.5; for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + (i - 0.5) * Math.PI / 10; c.beginPath(); c.moveTo(C + Math.cos(a) * 0.09 * S, C + Math.sin(a) * 0.09 * S); c.lineTo(C + Math.cos(a) * 0.5 * S, C + Math.sin(a) * 0.5 * S); c.stroke(); }
    c.fillStyle = '#f3f2f2'; c.font = '800 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; SEG.forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 10; c.fillText(String(n), C + Math.cos(a) * 0.57 * S, C + Math.sin(a) * 0.57 * S); });
  });
  const dartsSign = new THREE.MeshBasicMaterial({ map: signTex('DARTS', '#ff4a3a') }), rimM = toon('#cbd5e1');
  // throw lanes for all four: a dark mat from the wall to the line, red edges, a white THROW LINE + the brass oche
  const laneTex = canvasTex(64, 256, (g, w, h) => { g.fillStyle = '#1f3a2c'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 16; i++) g.fillRect(0, i * 16, w, 8); g.fillStyle = '#c42d3c'; g.fillRect(0, 0, 4, h); g.fillRect(w - 4, 0, 4, h); });
  const lineTex = canvasTex(512, 64, (g, w, h) => { g.fillStyle = '#f3f2f2'; g.fillRect(0, 0, w, h); g.fillStyle = '#201e1d'; g.font = '900 40px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('THROW LINE', w / 2, h / 2 + 2); });
  const laneM = new THREE.MeshBasicMaterial({ map: laneTex, color: 0xb0b0b0 }), lineM = new THREE.MeshBasicMaterial({ map: lineTex, color: 0xd8d8d8 });
  for (const o of ROW) { setBoard(o); const lg = place(o);
    const mat = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 5.5), laneM); mat.rotation.x = -Math.PI / 2; mat.position.set(0, 0.042, 2.9); lg.add(mat);
    const ln = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.22), lineM); ln.rotation.x = -Math.PI / 2; ln.position.set(0, 0.05, 5.4); lg.add(ln); }
  for (const o of BOARDS) { setBoard(o); const db = new THREE.Group(); db.position.set(DART.x, DART.y, DART.z); db.rotation.y = DA; scene.add(db);
    M(CYL(0.85, 0.85, 0.06, 40), dark, 0, 0, -0.04, db, 0.02, 0.85).rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), new THREE.MeshToonMaterial({ map: boardTex, gradientMap: grad })); face.position.z = 0.01; db.add(face);
    M(new THREE.TorusGeometry(0.66, 0.035, 8, 48), rimM, 0, 0, 0.01, db, 0);
    M(BOX(1.4, 0.36, 0.06), [DARK, DARK, DARK, DARK, dartsSign, DARK], 0, 1.05, 0, db, 0.012);
    glowSprite(0, 1.4, 0.4, 0xffd38a, 1.6, db);
    M(BOX(1.4, 0.03, 0.1), brass, DART.oche.x, 0.05, DART.oche.z, null, 0).rotation.y = DA; }
  setBoard(BOARDS[0]);
  // ---- the darts wall (east, no windows: meru2-layout solid ['E']): brick, wood wainscot + brass rail, timber posts + beam, bunting, string lights,
  // and the DARTS TOURNEMENT chalkboard over the row. Only drawn when the boards are on the east wall.
  if (ROW.every(o => o.a === 270 && o.x > X1 - 1.2)) { const WX = X1 - 0.42, zc = ROW.reduce((a, o) => a + o.z, 0) / ROW.length, HH = 8.8, wg = new THREE.Group(); scene.add(wg);
    const brick = canvasTex(256, 256, (g, w) => { g.fillStyle = '#5a3a2c'; g.fillRect(0, 0, w, w); for (let r = 0; r < 16; r++) { const o = r % 2 ? 0 : 16; for (let i = -1; i < 9; i++) { const k = 0.82 + ((i * 7 + r * 13) % 9) / 30; g.fillStyle = 'rgb(' + (156 * k | 0) + ',' + (78 * k | 0) + ',' + (54 * k | 0) + ')'; g.fillRect(i * 32 + o + 1, r * 16 + 1, 30, 14); } } }, [(Z1 - Z0) / 2.4, HH / 1.2]);
    const bw = new THREE.Mesh(new THREE.PlaneGeometry(Z1 - Z0 - 0.8, HH), new THREE.MeshLambertMaterial({ map: brick })); bw.rotation.y = -Math.PI / 2; bw.position.set(WX, HH / 2, (Z0 + Z1) / 2); wg.add(bw);
    const wain = canvasTex(256, 64, (g, w, h) => { g.fillStyle = C.dark; g.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { g.fillStyle = C.wood; g.fillRect(i * 64 + 6, 8, 52, h - 16); g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(i * 64 + 6, h - 12, 52, 4); } }, [(Z1 - Z0) / 4, 1]);
    const wp = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, Z1 - Z0 - 0.8), [new THREE.MeshLambertMaterial({ map: wain }), dark, dark, dark, dark, dark]); wp.rotation.y = Math.PI; wp.position.set(WX - 0.04, 0.58, (Z0 + Z1) / 2); wg.add(wp);
    M(BOX(0.16, 0.1, Z1 - Z0 - 0.8), brass, WX - 0.09, 1.2, (Z0 + Z1) / 2, wg, 0);
    M(BOX(0.3, 0.4, Z1 - Z0 - 0.8), beam, WX - 0.15, 6.6, (Z0 + Z1) / 2, wg, 0.02);
    const z0r = Math.min(...ROW.map(o => o.z)) - 1.5, z1r = Math.max(...ROW.map(o => o.z)) + 1.5;
    for (const z of [Z0 + 3.2, z0r, z1r, Z1 - 3.2, (z1r + Z1 - 3.2) / 2]) M(BOX(0.3, 6.6, 0.36), beam, WX - 0.15, 3.3, z, wg, 0.02);
    // bunting: two sagging strings of pennants, one InstancedMesh
    { const cols = ['#ec3013', '#ffd23a', '#2e8bd8', '#3f9a5e', '#f3f2f2'], tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -0.22, 0, 0, 0.22, 0, -0.5, 0], 3)); tri.computeVertexNormals();
      const runs = [[Z0 + 3.2, z0r], [z1r, Z1 - 3.2]], per = 9, im = new THREE.InstancedMesh(tri, new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }), runs.length * per), m4 = new THREE.Matrix4(), c3 = new THREE.Color(); let k = 0;
      for (const [a, b] of runs) for (let i = 0; i < per; i++, k++) { const u = (i + 0.5) / per, z = a + (b - a) * u, y = 6.25 - Math.sin(u * Math.PI) * 0.7; m4.makeTranslation(WX - 0.2, y, z); im.setMatrixAt(k, m4); im.setColorAt(k, c3.set(cols[k % cols.length])); }
      wg.add(im); }
    // string lights along the beam
    for (let z = Z0 + 2; z < Z1 - 1; z += 2.6) { M(new THREE.SphereGeometry(0.07, 6, 4), basic(C.lantern), WX - 0.35, 6.3, z, wg, 0); glowSprite(WX - 0.4, 6.3, z, C.lantern, 0.8, wg); }
    // the DARTS TOURNEMENT chalkboard (Ben's sign, words as given) over the row
    const tw = Math.min(z1r - z0r - 1.2, 9), tt = canvasTex(1024, 256, (g, w, h) => { g.fillStyle = '#1c2a22'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 40; i++) g.fillRect(Math.random() * w, Math.random() * h, 60, 2);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#f7f1e6'; g.font = '900 110px Archivo, Arial'; g.fillText('DARTS TOURNEMENT', w / 2, h / 2 - 14);
      g.fillStyle = '#ffd23a'; g.fillRect(w / 2 - 300, h / 2 + 58, 600, 8); g.fillStyle = '#ec3013'; for (const x of [70, w - 70]) { g.beginPath(); g.arc(x, h / 2, 34, 0, 7); g.fill(); g.fillStyle = '#f7f1e6'; g.beginPath(); g.arc(x, h / 2, 14, 0, 7); g.fill(); g.fillStyle = '#ec3013'; } });
    const sb = M(BOX(0.12, tw * 0.25 + 0.3, tw + 0.3), beam, WX - 0.08, 4.65, zc, wg, 0.02), sf = new THREE.Mesh(new THREE.PlaneGeometry(tw, tw * 0.25), new THREE.MeshBasicMaterial({ map: tt, color: 0xe8e8e8 })); sf.rotation.y = -Math.PI / 2; sf.position.set(WX - 0.15, 4.65, zc); wg.add(sf);
    glowSprite(WX - 0.8, 5.6, zc, 0xffd38a, 3.5, wg); }
  // the chalk scoreboard (between the two boards) + the power bar beside the board
  const chalkCv = document.createElement('canvas'); chalkCv.width = 256; chalkCv.height = 300; const chalkTex = new THREE.CanvasTexture(chalkCv); chalkTex.colorSpace = THREE.SRGBColorSpace;
  { const sp = W(-2.2, 0.2, 0.05), sb = M(BOX(1.1, 1.3, 0.06), toon('#1c2a22'), sp.x, sp.y, sp.z, null, 0.02); sb.rotation.y = DA; const f = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshBasicMaterial({ map: chalkTex, transparent: true })); f.position.z = 0.035; sb.add(f); }
  const best = () => save.stat('meru.darts.best', 0) || 0;
  function drawChalk(D) { const c = chalkCv.getContext('2d'); c.clearRect(0, 0, 256, 300); c.fillStyle = 'rgba(255,255,255,0.92)'; c.font = '700 30px Archivo, Arial'; c.textAlign = 'left'; c.fillText('DARTS', 22, 44); c.fillRect(22, 56, 212, 3);
    c.font = '600 24px Archivo, Arial'; (D ? D.log : []).forEach((l, i) => c.fillText((i + 1) + '.  ' + l.label + '  ' + l.pts, 22, 98 + i * 40)); c.fillRect(22, 222, 212, 2);
    c.font = '800 30px Archivo, Arial'; c.fillText('TOTAL ' + (D ? D.score : 0), 22, 262); c.font = '600 18px Archivo, Arial'; c.fillText('BEST ' + best(), 22, 290); chalkTex.needsUpdate = true; }
  drawChalk(null);
  const bar = barG = new THREE.Group(); W(1.15, 0, 0.1, bar.position); bar.rotation.y = DA; bar.visible = false; scene.add(bar);
  const ui = (w, h, col, op = 1) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, depthTest: false })); m.renderOrder = 9; bar.add(m); return m; };
  ui(0.2, 1.3, 0x201e1d, 0.85); const fill = ui(0.12, 1.2, 0xec3013); fill.geometry.translate(0, 0.6, 0); fill.position.y = -0.6; const mark = ui(0.26, 0.035, 0xffffff); mark.position.y = -0.6 + 1.2 * PERFECT;
  const crossTex = canvasTex(128, 128, c => { c.strokeStyle = '#ff1f1f'; c.shadowColor = '#ff1f1f'; c.shadowBlur = 6; c.lineWidth = 7; c.beginPath(); c.arc(64, 64, 34, 0, Math.PI * 2); c.stroke(); c.lineWidth = 8; for (const [a, b, d, e] of [[64, 4, 64, 46], [64, 82, 64, 124], [4, 64, 46, 64], [82, 64, 124, 64]]) { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); } c.fillStyle = '#ff1f1f'; c.beginPath(); c.arc(64, 64, 5, 0, Math.PI * 2); c.fill(); });
  const dartAim = new THREE.Sprite(new THREE.SpriteMaterial({ map: crossTex, transparent: true, depthTest: false, opacity: 0 })); dartAim.scale.setScalar(0.16); dartAim.renderOrder = 10; scene.add(dartAim);
  const thrown = [];
  const shaftM = toon('#cbd5e1'), barrelM = toon('#1e293b'), flightM = toon('#38bdf8');
  function makeDart() { const d = new THREE.Group(); M(CYL(0.012, 0.012, 0.14, 6), shaftM, 0, 0, 0.07, d, 0).rotation.x = Math.PI / 2; M(CYL(0.022, 0.018, 0.12, 8), barrelM, 0, 0, 0.18, d, 0).rotation.x = Math.PI / 2; for (let k = 0; k < 3; k++) { const f = M(BOX(0.003, 0.06, 0.08), flightM, 0, 0, 0.27, d, 0); f.rotation.z = k * Math.PI / 3; } scene.add(d); return d; }
  function dartScore(u, v) { const r = Math.hypot(u, v); if (r < 0.04) return [50, 'BULLSEYE']; if (r < 0.09) return [25, 'OUTER BULL']; if (r > 0.5) return [0, 'MISS'];
    const idx = ((Math.round(Math.atan2(u, v) / (Math.PI / 10)) % 20) + 20) % 20, n = SEG[idx];
    if (r > 0.29 && r < 0.32) return [n * 3, 'TRIPLE ' + n]; if (r > 0.47) return [n * 2, 'DOUBLE ' + n]; return [n, String(n)]; }
  // pops + sparks
  const pops = [];
  function dartPop(text, color, big) { const t = canvasTex(512, 128, (c) => { c.font = '900 ' + (big ? 72 : 64) + 'px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 12; c.strokeStyle = '#201e1d'; c.strokeText(text, 256, 64); c.fillStyle = color; c.fillText(text, 256, 64); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.set(big ? 2.6 : 1.6, big ? 0.65 : 0.4, 1); W(0, 0.95, 0.3, s.position); s.renderOrder = 12; scene.add(s); pops.push({ s, t: 0, big }); }
  const NS = 90, sparkArr = new Float32Array(NS * 3).fill(-999), sparkV = Array.from({ length: NS }, () => ({ v: new THREE.Vector3(), life: 0 })), sparkGeo = new THREE.BufferGeometry(); let sparkI = 0;
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3)); const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffd38a, map: glowTex, size: 0.06, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sparks.frustumCulled = false; scene.add(sparks);
  function burstSparks(p, n, sp = 2.2) { for (let k = 0; k < n; k++) { const i = sparkI = (sparkI + 1) % NS, s = sparkV[i]; s.life = rr(0.3, 0.7); const fo = rr(0.2, 1.4), ri = rr(-1, 1); s.v.set(FX * fo + RX * ri, rr(-0.6, 1.4), FZ * fo + RZ * ri).normalize().multiplyScalar(rr(0.5, 1) * sp); sparkArr.set([p.x, p.y, p.z], i * 3); } }

  // ---- little synth sfx (same calls as the old game: tone(f, d, v, type, slide) · burst(d, f, v)) ----
  let noiseBuf = null; const noise = c => { if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = noiseBuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; } return noiseBuf; };
  const sfx = {
    tone(f, d, v, type = 'sine', slide = 1) { const c = audio && audio(); if (!c) return; const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide !== 1) o.frequency.exponentialRampToValueAtTime(f * slide, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.03); },
    burst(d, f, v) { const c = audio && audio(); if (!c) return; const t = c.currentTime, b = c.createBufferSource(); b.buffer = noise(c); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); b.connect(bp); bp.connect(g); g.connect(c.destination); b.start(t, Math.random() * 0.5); b.stop(t + d + 0.03); },
  };

  // ---- darts game state ----
  let D = null, tut = false, toast = '', toastT = 0; const say = (s, t = 3) => { toast = s; toastT = t; };
  let dSpot = null; const mkSpot = (o, i) => { const [sx, sz] = frontOf(o, 5.64), sp = { key: i ? 'tavernDarts' + (i + 1) : 'tavernDarts', x: sx, z: sz, r: 1.4, board: o, get prompt() { return D ? (dSpot === sp && D.phase === 'aim' ? 'THROW · DART ' + (D.n + 1) + ' OF 3' : null) : 'PLAY · DARTS'; },
    use(P) { if (D && dSpot !== sp) return; if (!D) { dSpot = sp; setBoard(o); thrown.forEach(d => scene.remove(d)); thrown.length = 0; D = { phase: 'aim', n: 0, score: 0, t: rr(0, 6), p: 0, pdir: 1, log: [] }; drawChalk(D); sfx.tone(520, 0.1, 0.04, 'triangle', 1.3);
        if (!tut) { tut = true; say('DARTS · THREE DARTS · WATCH THE RED SIGHT, THEN TAP WHEN THE BAR IS AT THE WHITE LINE', 5); } return; }
      if (D.phase !== 'aim') return; D.phase = 'wind'; D.wind = 0; D.lock = { u: D.u, v: D.v, p: D.p }; sfx.burst(0.05, 2400, 0.06); } }; return sp; };
  spots.push(...BOARDS.map(mkSpot));
  const V = new THREE.Vector3();
  function release(fox) { const { u, v, p } = D.lock, err = p - PERFECT, fu = u + rr(-1, 1) * Math.abs(err) * 0.16, fv = v + err * 0.55 + rr(-0.01, 0.01);
    const dm = makeDart(), from = new THREE.Vector3(), arm = fox.userData.P && fox.userData.P.arms && fox.userData.P.arms[1]; fox.updateMatrixWorld(true); const HD = fox.userData.P && fox.userData.P.hands && fox.userData.P.hands[1]; if (HD) HD.g.localToWorld(from.set(0, -0.12, -0.05)); else if (arm) { arm.getWorldPosition(from); from.y += 0.25; } else { from.set(fox.position.x, 1.6, fox.position.z); from.y += 0.25; } if (scene.userData && scene.userData.toLocal) scene.userData.toLocal(from);
    D.fly = { dm, from, to: W(fu, fv, 0.02), t: 0, u: fu, v: fv, clean: Math.abs(err) < 0.06 }; D.phase = 'fly'; sfx.burst(0.1, 3200, 0.1); sfx.tone(300, 0.25, 0.02, 'sine', 2.2); }
  function land(fox) { const F = D.fly; F.dm.position.copy(F.to); thrown.push(F.dm);
    const [pts, label] = dartScore(F.u, F.v); D.score += pts; D.n++; D.log.push({ label, pts }); drawChalk(D);
    sfx.burst(0.06, 900, 0.18); sfx.tone(pts >= 50 ? 1200 : pts >= 30 ? 980 : pts ? 700 : 180, 0.14, 0.05, pts ? 'triangle' : 'square', pts >= 50 ? 1.5 : 1);
    if (pts) burstSparks(W(F.u, F.v, 0.05, V), pts >= 50 ? 40 : /TRIPLE/.test(label) ? 30 : 12, pts >= 50 ? 3 : 2.2);
    dartPop(label === 'MISS' ? 'MISS' : label + (F.clean ? ' · CLEAN' : ''), pts >= 50 ? '#ffd76a' : /TRIPLE/.test(label) ? '#5fe3ff' : /DOUBLE/.test(label) ? '#ec3013' : pts ? '#f3f2f2' : '#9b9797');
    if (pts >= 25 || /TRIPLE/.test(label)) fox.userData.hop = 1; D.phase = 'landed'; D.hold = 0.85; }
  function tickDarts(dt, t, P, fox) {
    for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt; p.s.position.y += dt * 0.5; p.s.material.opacity = 1 - smooth(p.big ? 1.6 : 0.8, p.big ? 2.4 : 1.3, p.t); if (p.t > (p.big ? 2.4 : 1.3)) { scene.remove(p.s); p.s.material.map.dispose(); p.s.material.dispose(); pops.splice(i, 1); } }
    let live = false; for (let i = 0; i < NS; i++) { const s = sparkV[i]; if (s.life <= 0) continue; live = true; s.life -= dt; s.v.y -= 6 * dt; sparkArr[i * 3] += s.v.x * dt; sparkArr[i * 3 + 1] += s.v.y * dt; sparkArr[i * 3 + 2] += s.v.z * dt; if (s.life <= 0) sparkArr[i * 3 + 1] = -999; } if (live) sparkGeo.attributes.position.needsUpdate = true;
    bar.visible = !!D; if (!D) { dartAim.material.opacity = 0; if (dartsPosed) { endPose(fox); dartsPosed = false; } return; }
    if (!dSpot || Math.hypot(dSpot.x - P.x, dSpot.z - P.z) > 3.4) { D = null; dartAim.material.opacity = 0; bar.visible = false; return; }
    D.t += dt; const wob = 0.3 * (1 - Math.min(0.5, D.n * 0.06));
    if (D.phase === 'aim') { D.u = Math.sin(D.t * 1.9) * wob + Math.sin(D.t * 4.7) * 0.05; D.v = Math.sin(D.t * 2.6 + 1) * wob * 0.9 + Math.cos(D.t * 3.9) * 0.05; D.p += D.pdir * dt * 1.15; if (D.p > 1) { D.p = 1; D.pdir = -1; } if (D.p < 0) { D.p = 0; D.pdir = 1; } }
    const show = D.phase === 'aim' ? D : D.lock || D; W(show.u || 0, show.v || 0, 0.04, dartAim.position); dartAim.material.opacity = D.phase === 'aim' ? 0.95 : D.phase === 'wind' ? 0.6 : 0; dartAim.scale.setScalar(0.16 + Math.sin(t * 8) * 0.015);
    fill.scale.y = Math.max(0.001, show.p || 0); fill.material.color.set(Math.abs((show.p || 0) - PERFECT) < 0.06 ? 0xffd23a : 0xec3013);
    // the player's fox: faces the board, the arm draws back with the bar and snaps forward on release
    P.yaw = DA + Math.PI; const jd = fox.userData.P && fox.userData.P.fore, arm = !jd && fox.userData.P && fox.userData.P.arms && fox.userData.P.arms[1];
    if (arm && D.phase === 'aim') arm.rotation.set(-1.5 - D.p * 0.9, 0, 0.2);
    if (D.phase === 'wind') { D.wind += dt; if (arm) arm.rotation.set(lerp(-1.5 - D.lock.p * 0.9, -2.6, smooth(0, 0.14, D.wind)), 0, 0.2); if (D.wind > 0.16) release(fox); }
    if (jd) dartPose(fox, dt);
    if (D && D.phase === 'fly') { const F = D.fly; F.t += dt / 0.42; const k = Math.min(1, F.t); if (arm) arm.rotation.set(lerp(-2.6, -0.9, smooth(0, 0.25, k)), 0, 0.2);
      F.dm.position.lerpVectors(F.from, F.to, k); F.dm.position.y += Math.sin(k * Math.PI) * 0.28; F.dm.lookAt(F.to.x + FX, F.to.y, F.to.z + FZ); F.dm.rotateZ(k * 8); if (k >= 1) land(fox); }
    if (D.phase === 'landed') { D.hold -= dt; if (D.hold <= 0) {
      if (D.n < 3) { D.phase = 'aim'; D.t = rr(0, 6); }
      else { const total = D.score, b = Math.max(best(), total); save.setStat('meru.darts.best', b); drawChalk(D);
        const ton80 = D.log.every(l => l.label === 'TRIPLE 20'); if (ton80) { dartPop('ONE HUNDRED AND EIGHTY!', '#ffd76a', true); burstSparks(W(0, 0, 0.2, V), 90, 4); fox.userData.hop = 1; }
        const line = ton80 ? 'ONE HUNDRED AND EIGHTY! Mott drops a glass. The whole tavern is on its feet.' : total >= 100 ? 'A ton! The whole tavern cheers.' : total >= 60 ? 'Not bad at all. Mott nods.' : 'Mott pretends not to see.';
        say(D.log.map(l => l.label).join(' · ') + ' — ' + total + ' points. ' + line + ' · BEST ' + b, 5); D = null; dartAim.material.opacity = 0; bar.visible = false; } } }
  }
  // s615 JOINTED DARTS (Ben): the player's fox throws like a darts player. AIM: dart paw up by the cheek, elbow pointing at the board,
  // the other paw relaxed, the throwing foot forward, one eye squinting down the dart; the power bar draws the forearm back toward the
  // ear. RELEASE: the forearm snaps forward from a still elbow, fingers open, the paw follows through toward the board. LANDED: a fist
  // pump on 50+ or a treble, a nod on a score, a frustrated head shake on a MISS.
  const mxd = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k); let dartsPosed = false;
  function dartPose(fox, dt) { if (!D) { if (dartsPosed) { endPose(fox); dartsPosed = false; } return; }
    const Q = neutralD(), AIM = [-0.06, 0.2, 0.44], BACK = [-0.06, 0.26, 0.28], OUT = [-0.02, 0.18, 0.68];
    Q.a[1] = AIM.slice(); Q.pole[1] = [0.3, -1, 0.15]; Q.palm[1] = [-1, 0.1, 0]; Q.g[1] = 0.55; Q.op[1] = 1; Q.wr[1] = [-0.3, 0];
    Q.a[0] = [0.1, -0.56, 0.12]; Q.l = [[0.06, 0.05, -0.1], [0.0, 0.05, 0.16]]; Q.lean = 0.08; Q.twist = -0.12; Q.head = [0.04, 0.1, 0]; Q.mood = 'squint'; Q.look = 0.2;
    if (D.phase === 'aim') { Q.a[1] = mxd(AIM, BACK, (D.p || 0) * 0.8); }
    else if (D.phase === 'wind') { Q.a[1] = mxd(mxd(AIM, BACK, (D.lock.p || 0) * 0.8), BACK, smooth(0, 0.14, D.wind)); }
    else if (D.phase === 'fly') { const k = Math.min(1, D.fly.t); Q.a[1] = mxd(BACK, OUT, smooth(0, 0.25, k)); Q.wr[1] = [-0.3 + 0.7 * smooth(0, 0.25, k), 0]; Q.g[1] = 0.55 - 0.45 * smooth(0, 0.2, k); Q.spread = 0.5; Q.ext = [0, smooth(0, 0.25, k)]; Q.lean = 0.14; Q.mood = 'determined'; }
    else if (D.phase === 'landed') { const L0 = D.log[D.log.length - 1] || { pts: 0, label: '' }, tt = 0.85 - D.hold, e = Math.min(1, tt / 0.15);
      if (L0.pts >= 50 || /TRIPLE/.test(L0.label)) { const pump = Math.max(0, Math.sin(Math.min(1, tt / 0.5) * Math.PI)); Q.a[1] = mxd(OUT, [-0.04, -0.28 + pump * 0.1, 0.34], e); Q.pole[1] = [0.9, -0.8, 0]; Q.g[1] = 1; Q.drop = 0.04 * pump; Q.mood = 'joy'; Q.mp = { smile: 1, open: 0.4, teeth: 1, wide: 0.85 }; }
      else if (L0.label === 'MISS') { Q.a[1] = mxd(OUT, [0.06, -0.5, 0.14], e); Q.head = [0.15, Math.sin(tt * 14) * 0.25, 0]; Q.mood = 'frustrated'; Q.lean = 0.04; }
      else { Q.a[1] = mxd(OUT, AIM, e); Q.head = [0.04 + Math.max(0, Math.sin(tt * 9)) * 0.12, 0.1, 0]; Q.mood = 'happy'; Q.mp = { smile: 0.7, wide: 0.6 }; } }
    applyD(THREE, fox, Q, performance.now() / 1000, 1); dartsPosed = true; }
  // camera: over the shoulder, board in frame (narrow phone screens too)
  let camK = 0; const camT = new THREE.Vector3(), lookT = new THREE.Vector3(), lookW = new THREE.Vector3();
  function camFix(camera, P, dt) { camK = clamp(camK + (D ? dt : -dt) * 3, 0, 1); if (camK <= 0) return; const k = smooth(0, 1, camK);
    camT.set(P.x + FX * 1.9 + RX * 1.7, 2.55, P.z + FZ * 1.9 + RZ * 1.7); W(0.35, -0.2, 0, lookT); lookW.set(P.x, (P.y || 0) + 1.4, P.z);
    camera.position.lerp(camT, k); camera.lookAt(lookW.lerp(lookT, k)); }

  // ---- Flick on the second board ----
  const D2 = L.darts2, darter = kit && D2 ? createDarter({ THREE, scene, makeFox: kit.makeFox, animFox: kit.animFox, M, toon, grad, boardTex, look: PLAYER_MALE, board: { x: D2.x, y: DART.y, z: D2.z, a: D2.a ?? 270, oche: 5.24 }, audio: () => (near ? sfx : null) }) : null;
  let near = false;

  // ================= JUKEBOX on the east wall, near the door =================
  const JO = L.jukebox, JX = JO.x, JZ = JO.z, JA = RAD(JO.a), JF = [Math.sin(JA), Math.cos(JA)], JR = [Math.cos(JA), -Math.sin(JA)], [JSX, JSZ] = frontOf(JO, 2.0);
  const JUKE = { neon: [], playing: -1, el: null, synth: null, beat: 0, away: 0, last: -1 };
  { const jb = new THREE.Group(); jb.position.set(JX, 0, JZ); jb.rotation.y = JA; jb.scale.setScalar(1.55); scene.add(jb); JUKE.group = jb;
    const body = toon('#3a2a52'); M(BOX(1.3, 1.6, 0.7), body, 0, 0.8, 0, jb, 0.03); const arch = M(new THREE.CylinderGeometry(0.65, 0.65, 0.7, 24, 1, false, -Math.PI / 2, Math.PI), body, 0, 1.6, 0, jb, 0.03); arch.rotation.x = Math.PI / 2; arch.rotation.z = Math.PI / 2;
    M(new THREE.TorusGeometry(0.52, 0.06, 6, 24, Math.PI), basic(0xff6bd5), 0, 1.6, 0.37, jb, 0); M(BOX(0.9, 0.5, 0.06), basic(0x5fe3ff), 0, 0.95, 0.36, jb, 0);
    const neon = [basic(0xff3bd4), basic(0x38bdf8), basic(0xffd23a)]; JUKE.neon = neon;
    for (let k = 0; k < 3; k++) M(new THREE.TorusGeometry(0.62 + k * 0.09, 0.025, 6, 32, Math.PI), neon[k], 0, 1.6, 0.36 + k * 0.01, jb, 0);
    for (const sx of [-1, 1]) M(BOX(0.06, 1.5, 0.06), neon[1], sx * 0.68, 0.78, 0.36, jb, 0);
    M(BOX(1.1, 0.18, 0.06), neon[2], 0, 0.15, 0.36, jb, 0);
    M(BOX(1.3, 0.33, 0.06), [DARK, DARK, DARK, DARK, new THREE.MeshBasicMaterial({ map: signTex('JUKEBOX', '#ff3bd4') }), DARK], 0, 2.55, 0.1, jb, 0.01);
    JUKE.glow = glowSprite(0, 1.2, 0.8, 0xff6be0, 4.5, jb);
    JUKE.ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 40), new THREE.MeshBasicMaterial({ color: 0xff3bd4, transparent: true, opacity: 0.7, depthWrite: false })); JUKE.ring.rotation.x = -Math.PI / 2; JUKE.ring.position.set(JSX, 0.05, JSZ); scene.add(JUKE.ring); }
  rbox(JO, 1.1, 0.85);
  function stopSong() { if (JUKE.el) { JUKE.el.pause(); JUKE.el.src = ''; JUKE.el = null; } if (JUKE.synth) { clearInterval(JUKE.synth.iv); try { JUKE.synth.out.disconnect(); } catch (e) {} JUKE.synth = null; } JUKE.playing = -1; }
  function synthSong(s) {   // a stand-in groove in the song's style, so the box is never silent
    const ctx = audio && audio(); if (!ctx) return; const out = ctx.createGain(); out.gain.value = 0; out.connect(ctx.destination);
    const roots = { COUNTRY: [196, 247, 294, 247], JAZZ: [174.6, 233, 196, 261.6], OPERA: [220, 174.6, 196, 164.8], ROCKABILLY: [164.8, 220, 246.9, 220], 'ROCK & ROLL': [196, 261.6, 293.7, 261.6] }[s.genre];
    const beatDur = 60 / s.bpm; let step = 0; const next = { t: ctx.currentTime + 0.05 };
    const note = (f, t, d, type, v) => { const o = ctx.createOscillator(), gg = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); gg.gain.setValueAtTime(0, t); gg.gain.linearRampToValueAtTime(v, t + 0.01); gg.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(gg); gg.connect(out); o.start(t); o.stop(t + d + 0.05); };
    const hat = (t, v) => { const b = ctx.createBufferSource(); b.buffer = noise(ctx); const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; const gg = ctx.createGain(); gg.gain.setValueAtTime(v, t); gg.gain.exponentialRampToValueAtTime(0.0001, t + 0.05); b.connect(f); f.connect(gg); gg.connect(out); b.start(t, Math.random() * 0.5); b.stop(t + 0.06); };
    const iv = setInterval(() => { if (out.gain.value < 0.001 && JUKE.away > 1) { next.t = ctx.currentTime + 0.05; return; } while (next.t < ctx.currentTime + 0.25) { const r = roots[Math.floor(step / 8) % 4], b8 = step % 8, t = next.t;
        if (b8 % 2 === 0) note(r / 2, t, beatDur * 0.9, 'triangle', 0.22);
        if (s.genre === 'OPERA') { if (b8 === 0) [1, 1.26, 1.5].forEach(m => note(r * m, t, beatDur * 3.5, 'sine', 0.06)); if (b8 % 2 === 0) note(r * 2 * (b8 === 4 ? 1.5 : 1.26), t, beatDur * 1.6, 'sine', 0.08); }
        else { if (b8 === 2 || b8 === 6) [1, 1.26, 1.5].forEach(m => note(r * m, t, beatDur * 0.35, s.genre === 'JAZZ' ? 'sine' : 'square', 0.035)); hat(t, s.genre === 'JAZZ' ? 0.05 : 0.08); if (b8 === 0 || b8 === 4) note(70, t, 0.12, 'sine', 0.35); if (s.genre !== 'COUNTRY' && Math.random() < 0.35) note(r * 2 * [1, 1.12, 1.26, 1.5, 1.68][Math.floor(Math.random() * 5)], t, beatDur * 0.4, 'triangle', 0.05); }
        next.t += beatDur / 2; step++; } }, 60);
    JUKE.synth = { iv, out, ctx };
  }
  function playSong(i) { stopSong(); const s = SONGS[i]; if (!s) return; JUKE.playing = i; JUKE.beat = 0;
    const a = new Audio(); a.loop = true; a.volume = 0; a.src = 'MERU/MUSIC/JUKEBOX/' + s.file; JUKE.el = a;
    const fall = () => { if (JUKE.el === a) { JUKE.el = null; if (!JUKE.synth) synthSong(s); } };
    a.addEventListener('error', fall, { once: true }); a.play().catch(fall);
    sfx.tone(1320, 0.06, 0.04, 'square'); setTimeout(() => sfx.tone(990, 0.08, 0.04, 'square'), 70); say(s.n + ' · ' + s.genre + ' · ' + s.title, 3); }
  spots.push({ key: 'tavernJukebox', x: JSX, z: JSZ, r: 1.7, get prompt() { return JUKE.playing < 0 ? 'JUKEBOX · PLAY ' + SONGS[0].n : JUKE.playing < SONGS.length - 1 ? 'JUKEBOX · NEXT SONG' : 'JUKEBOX · STOP'; },
    use() { const n = JUKE.playing + 1; if (n >= SONGS.length) { stopSong(); say('JUKEBOX · OFF', 2); } else playSong(n); } });
  const notes = [], noteTex = canvasTex(64, 64, (c) => { c.fillStyle = '#fff'; c.font = '900 52px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('\u266A', 32, 34); });
  function tickJuke(dt, t, P, here) {
    const dist = Math.hypot(P.x - JSX, P.z - JSZ), ctx = audio && audio(), vol = here && JUKE.playing >= 0 && ctx ? clamp(1 - (dist - 2) / 22, 0.15, 1) : 0;
    JUKE.away = here ? 0 : JUKE.away + dt; if (JUKE.playing >= 0 && JUKE.away > 25) stopSong();   // walked away: the box goes quiet
    if (JUKE.el) JUKE.el.volume = clamp(lerp(JUKE.el.volume, vol * 0.8, Math.min(1, dt * 4)), 0, 1);
    if (JUKE.synth) JUKE.synth.out.gain.setTargetAtTime(vol * 0.9, JUKE.synth.ctx.currentTime, 0.2);
    const s = SONGS[JUKE.playing], playing = !!s; JUKE.beat += dt * (s ? s.bpm / 60 : 0.5);
    const pulse = playing ? Math.pow(0.5 + 0.5 * Math.cos(JUKE.beat * Math.PI * 2), 3) : 0.5 + 0.5 * Math.sin(t * 2);
    JUKE.neon.forEach((m, k) => m.color.setHSL(((t * (playing ? 0.25 : 0.06)) + k * 0.33) % 1, 0.95, 0.45 + pulse * (playing ? 0.25 : 0.1)));
    JUKE.glow.material.opacity = playing ? 0.35 + pulse * 0.45 : 0.3; JUKE.glow.scale.setScalar(playing ? 4.2 + pulse * 1.4 : 4);
    JUKE.group.scale.setScalar(1.55 * (1 + (playing ? pulse * 0.02 : 0)));
    JUKE.ring.material.opacity = 0.45 + 0.35 * Math.sin(t * 3); JUKE.ring.scale.setScalar(1 + 0.06 * Math.sin(t * 3));
    if (playing && here && notes.length < 14 && Math.random() < dt * (s.bpm / 40)) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, color: new THREE.Color(s.col), transparent: true, depthWrite: false })); sp.scale.setScalar(rr(0.28, 0.42)); const fo = 1.2 + rr(-0.2, 0.4), ri = rr(-0.8, 0.8), sv = rr(0.1, 0.5), sw = rr(-0.25, 0.25); sp.position.set(JX + JF[0] * fo + JR[0] * ri, 3.2, JZ + JF[1] * fo + JR[1] * ri); scene.add(sp); notes.push({ sp, t: 0, vx: JF[0] * sv + JR[0] * sw, vz: JF[1] * sv + JR[1] * sw, ph: rr(0, 6) }); }
    for (let i = notes.length - 1; i >= 0; i--) { const n = notes[i]; n.t += dt; const sw = Math.sin(n.t * 3 + n.ph) * 0.3; n.sp.position.x += (n.vx + JR[0] * sw) * dt; n.sp.position.z += (n.vz + JR[1] * sw) * dt; n.sp.position.y += dt * 0.7; n.sp.material.opacity = 1 - smooth(1.6, 2.6, n.t); if (n.t > 2.6) { scene.remove(n.sp); n.sp.material.dispose(); notes.splice(i, 1); } }
    return playing ? JUKE.beat : null;
  }

  // ================= per frame =================
  function tick(dt, t, P, fox, dancers = []) {
    for (const f of flames) { if (f.fire) { f.fire(t, dt); continue; } if (f.fl) { const k = 1 + Math.sin(t * 13) * 0.12 + Math.sin(t * 7.3) * 0.08; f.fl.scale.set(1, k, 1); f.fi.scale.set(1, 2 - k, 1); f.glow.material.opacity = 0.45 + (k - 1) * 1.2; } else f.candle.scale.y = 0.85 + Math.sin(t * 11 + f.ph) * 0.15; }
    toastT -= dt; if (toastT <= 0) toast = '';
    if (!P) return; const here = inside(P.x, P.z); near = inside(P.x, P.z, 8);
    if (darter) darter.update(dt, near);
    if (fox) tickDarts(dt, t, P, fox);
    const beat = tickJuke(dt, t, P, here);
    if (beat != null && here) for (const n of dancers) { const B = n.userData && n.userData.P; if (B && !B.fore) { B.body.position.y = Math.abs(Math.sin(beat * Math.PI)) * 0.06; B.head.rotation.z = Math.sin(beat * Math.PI) * 0.1; } }
    return { beat, here };   // s617: the rooms file dances jointed foxes to it
  }
  return { spots, tick, camFix, toast: () => toast, darting: () => !!D, keys: new Set(['darterFlick']), DART, layout: L, jukebox: { x: JX, z: JZ, play: playSong, stop: stopSong }, darter, dispose: () => stopSong() };
}
