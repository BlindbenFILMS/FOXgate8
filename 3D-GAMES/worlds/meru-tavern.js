// MERU TAVERN [meruTavern] — the old Meru tavern (Ben: "it was GREAT"), lifted out of meru-game.js into one build function.
// buildTavern(ctx) dresses a rect (the Meru 2 shell, its own walls/windows stay): bar + glowing bottle shelves, stone fireplace,
// round tables with candles and mugs, barrels, hanging lanterns, the 3D JUKEBOX (A1-A5, MP3 from MERU/MUSIC/JUKEBOX/ or a synth
// groove in the song's style) and DARTS on the real board (drifting red sight + timed power bar, chalk scoreboard, best score saved),
// with Flick (meru-darter.js) on the second board. Phone budget: no point lights, instanced chairs/bottles/mugs, glow sprites.
import { createDarter } from './meru-darter.js';
import { PLAYER_MALE } from '../fox-kit.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, smooth = (a, b, t) => { const k = clamp((t - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); }, rr = (a, b) => a + Math.random() * (b - a);
export const SONGS = [
  { n: 'A1', genre: 'COUNTRY', title: 'SPACE HORSE', file: 'JUKEBOX-COUNTRY.mp3', bpm: 104, col: '#ffd23a' },
  { n: 'A2', genre: 'JAZZ', title: 'FLY ME PAST THE MOON', file: 'JUKEBOX-FLY-ME-PAST-THE-MOON.mp3', bpm: 92, col: '#38bdf8' },
  { n: 'A3', genre: 'OPERA', title: 'PHANTOM OF THE UNIVERSE', file: 'JUKEBOX-PHANTOM.mp3', bpm: 70, col: '#c084fc' },
  { n: 'A4', genre: 'ROCKABILLY', title: 'SPACE FOX', file: 'JUKEBOX-SPACE-FOX.mp3', bpm: 160, col: '#ec3013' },
  { n: 'A5', genre: 'ROCK & ROLL', title: 'BLAST OFF', file: 'JUKEBOX-ROCK-AND-ROLL.mp3', bpm: 150, col: '#ff3bd4' },
];
const SEG = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5], PERFECT = 0.72;

// rect = { x0, x1, z0, z1 } (inside of the shell; door on the south wall z1), audio() = AudioContext or null (muted), save = engine save
export function buildTavern({ THREE, scene, M, toon, grad, kit, cols, save, audio, rect, touch }) {
  const { x0: X0, x1: X1, z0: Z0, z1: Z1 } = rect, CX = (X0 + X1) / 2;
  const BOX = (w, h, d) => new THREE.BoxGeometry(w, h, d), CYL = (a, b, h, n = 12) => new THREE.CylinderGeometry(a, b, h, n);
  const box = (a, b, c, d) => cols.push({ f: [a, b, c, d] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const basic = c => new THREE.MeshBasicMaterial({ color: c });
  const canvasTex = (w, h, fn, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const glowTex = canvasTex(64, 64, (g) => { const r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); });
  const glowSprite = (x, y, z, col, s, parent) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: col, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.55 })); sp.position.set(x, y, z); sp.scale.setScalar(s); (parent || scene).add(sp); return sp; };
  const signTex = (txt, col) => canvasTex(512, 128, (g, w, h) => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, w, h); g.fillStyle = col; g.font = '900 78px Archivo, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, w / 2, h / 2 + 4); });
  const wood = toon('#6b4a35'), dark = toon('#3a2618'), beam = toon('#2e2018'), brass = toon('#e0a84a'), DARK = toon('#201e1d');
  const flames = [], spots = [];
  const inside = (x, z, m = 0) => x > X0 - m && x < X1 + m && z > Z0 - m && z < Z1 + m;

  // ---- floor: warm planks over the shell floor ----
  { const t = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7a5236'; g.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#6e4a30' : '#83593b'; g.fillRect(0, i * 32 + 1, w, 30); g.fillStyle = '#4a3020'; g.fillRect(((i * 97) % 200) + 20, i * 32, 3, 32); } g.fillStyle = '#3d2818'; for (let i = 0; i <= 8; i++) g.fillRect(0, i * 32, w, 2); }, [(X1 - X0) / 3, (Z1 - Z0) / 3]);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0 - 0.2, Z1 - Z0 - 0.2), new THREE.MeshToonMaterial({ map: t, gradientMap: grad })); fl.rotation.x = -Math.PI / 2; fl.position.set(CX, 0.035, (Z0 + Z1) / 2); fl.receiveShadow = true; scene.add(fl); }

  // ---- the bar along the north wall: counter, brass rail, taps, stools, glowing bottle shelves ----
  const BZ = Z0 + 4.9, BX = CX - 2;
  M(BOX(20, 1.15, 1.1), wood, BX, 0.58, BZ, null, 0.04); M(BOX(20.3, 0.12, 1.35), dark, BX, 1.2, BZ, null, 0.02); M(BOX(20, 0.1, 0.1), brass, BX, 0.18, BZ + 0.62, null, 0);
  box(BX - 10.15, BX + 10.15, BZ - 0.7, BZ + 0.7);
  for (let i = 0; i < 7; i++) { const tx = BX - 6 + i * 2; M(CYL(0.05, 0.05, 0.5, 8), brass, tx, 1.5, BZ - 0.3, null, 0.01); M(BOX(0.12, 0.18, 0.12), toon('#c42d3c'), tx, 1.78, BZ - 0.3, null, 0.01); }
  for (let i = 0; i < 10; i++) { const sx = BX - 9 + i * 2; M(CYL(0.28, 0.24, 0.12, 14), toon('#c42d3c'), sx, 0.95, BZ + 1.05, null, 0.015, 0.28); M(CYL(0.05, 0.07, 0.9, 8), DARK, sx, 0.45, BZ + 1.05, null, 0); ring(sx, BZ + 1.05, 0.3); }
  M(BOX(20.4, 3.3, 0.5), beam, BX, 1.65, Z0 + 0.45, null, 0.02); M(BOX(19.6, 2.5, 0.04), basic(0xffb866), BX, 2.25, Z0 + 0.72, null, 0);   // back-lit wall unit
  { const bc = ['#3f9a5e', '#c42d3c', '#e0a84a', '#38bdf8', '#7c3aed', '#ffffff'], n = 3 * 28, im = new THREE.InstancedMesh(CYL(0.07, 0.09, 0.44, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), n), m4 = new THREE.Matrix4(), c3 = new THREE.Color();
    let k = 0; for (let r = 0; r < 3; r++) { M(BOX(19.6, 0.08, 0.5), dark, BX, 1.25 + r * 0.8, Z0 + 0.95, null, 0); for (let i = 0; i < 28; i++, k++) { const s = 0.85 + Math.random() * 0.35; m4.makeScale(1, s, 1).setPosition(BX - 9.4 + i * 0.7 + rr(-0.1, 0.1), 1.52 + r * 0.8 + (s - 1) * 0.22, Z0 + 0.95); im.setMatrixAt(k, m4); im.setColorAt(k, c3.set(bc[(i * 7 + r * 3) % 6]).multiplyScalar(0.85)); } }
    scene.add(im); }
  // barrels in the north-east corner
  for (const [x, z, y] of [[X1 - 5.4, Z0 + 1.0, 0.5], [X1 - 4.4, Z0 + 1.0, 0.5], [X1 - 4.9, Z0 + 1.0, 1.45], [X1 - 3.4, Z0 + 1.4, 0.5]]) { const b = M(CYL(0.48, 0.44, 0.95, 16), toon('#7a5236'), x, y, z, null, 0.03, 0.48); for (const yy of [-0.3, 0.3]) M(new THREE.TorusGeometry(0.47, 0.03, 4, 18), DARK, 0, yy, 0, b, 0).rotation.x = Math.PI / 2; }
  box(X1 - 6, X1 - 2.8, Z0, Z0 + 2.0);

  // ---- stone fireplace on the west wall + rug ----
  const FZ = (Z0 + Z1) / 2 - 1;
  { const fp = new THREE.Group(); fp.position.set(X0 + 0.45, 0, FZ); fp.rotation.y = Math.PI / 2; scene.add(fp);
    M(BOX(3.0, 2.4, 0.9), toon('#6b6280'), 0, 1.2, 0, fp, 0.04); M(BOX(1.8, 1.3, 0.7), toon('#120c0a'), 0, 0.75, 0.2, fp, 0); M(BOX(3.4, 0.25, 1.1), beam, 0, 2.5, 0.05, fp, 0.02); M(BOX(1.6, 3.2, 0.7), toon('#5c5675'), 0, 4.0, -0.1, fp, 0.03);
    const f1 = M(new THREE.ConeGeometry(0.42, 0.9, 8), basic(0xff8a3a), -0.2, 0.55, 0.35, fp, 0), f2 = M(new THREE.ConeGeometry(0.3, 0.7, 8), basic(0xffd38a), 0.25, 0.48, 0.38, fp, 0); f1.castShadow = f2.castShadow = false;
    flames.push({ fl: f1, fi: f2, glow: glowSprite(0, 0.8, 0.6, 0xff8a3a, 3.2, fp) });
    for (const sx of [-0.45, 0.45]) M(CYL(0.09, 0.09, 1.2, 8), toon('#5a3d2c'), sx * 0.6, 0.18, 0.4, fp, 0).rotation.z = Math.PI / 2 + sx; }
  box(X0, X0 + 1.1, FZ - 1.6, FZ + 1.6);
  M(CYL(1.6, 1.6, 0.03, 32), toon('#7a1d2a'), X0 + 2.6, 0.045, FZ, null, 0); M(new THREE.TorusGeometry(1.5, 0.05, 6, 32), brass, X0 + 2.6, 0.06, FZ, null, 0).rotation.x = Math.PI / 2;

  // ---- round tables: 3 chairs each (instanced), mugs, a candle ----
  const TABLES = [[19, -88], [27, -88], [35, -89], [19, -78], [38, -78], [19, -68], [25, -70], [39, -69], [44, -63.5], [20, -63]].map(([x, z]) => [X0 + (x - 12), Z0 + (z + 100)]);
  { const n = TABLES.length * 3, seat = new THREE.InstancedMesh(BOX(0.5, 0.08, 0.5), wood, n), back = new THREE.InstancedMesh(BOX(0.5, 0.6, 0.08), wood, n), post = new THREE.InstancedMesh(BOX(0.36, 0.5, 0.36), beam, n), mugs = new THREE.InstancedMesh(CYL(0.09, 0.08, 0.2, 10), brass, TABLES.length * 2);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = new THREE.Vector3(1, 1, 1), p = new THREE.Vector3(); let k = 0, mk = 0;
    for (const [x, z] of TABLES) {
      M(CYL(0.85, 0.85, 0.1, 20), toon('#7a5236'), x, 0.95, z, null, 0.025, 0.85); M(CYL(0.1, 0.16, 0.9, 10), beam, x, 0.45, z, null, 0.015, 0.16); ring(x, z, 1.0);
      for (let j = 0; j < 3; j++, k++) { const a = j / 3 * Math.PI * 2 + 0.4, cx = x + Math.sin(a) * 1.25, cz = z + Math.cos(a) * 1.25; q.setFromEuler(e.set(0, a, 0));
        seat.setMatrixAt(k, m4.compose(p.set(cx, 0.55, cz), q, one)); back.setMatrixAt(k, m4.compose(p.set(cx + Math.sin(a) * 0.22, 0.85, cz + Math.cos(a) * 0.22), q, one)); post.setMatrixAt(k, m4.compose(p.set(cx, 0.27, cz), q, one)); }
      for (let j = 0; j < 2; j++, mk++) { const a = j * 2.6 + x; mugs.setMatrixAt(mk, m4.makeTranslation(x + Math.sin(a) * 0.45, 1.1, z + Math.cos(a) * 0.45)); }
      M(CYL(0.05, 0.05, 0.16, 8), toon('#f7f1e6'), x, 1.08, z, null, 0); const cf = M(new THREE.ConeGeometry(0.035, 0.09, 6), basic(0xffc070), x, 1.21, z, null, 0); flames.push({ candle: cf, ph: rr(0, 9) }); glowSprite(x, 1.22, z, 0xffb060, 0.7);
    }
    for (const im of [seat, back, post, mugs]) { im.castShadow = !touch; im.receiveShadow = true; scene.add(im); } }

  // ---- hanging lanterns (glow only) ----
  for (const [x, z] of [[19, -84], [27, -84], [35, -84], [19, -74], [30, -75], [40, -73], [24, -65], [38, -64]].map(([x, z]) => [X0 + (x - 12), Z0 + (z + 100)])) {
    M(CYL(0.02, 0.02, 2.2, 4), DARK, x, 5.9, z, null, 0); M(BOX(0.36, 0.44, 0.36), basic(0xffc070), x, 4.6, z, null, 0.02); glowSprite(x, 4.6, z, 0xffb060, 2.6); }

  // ================= DARTS on the east wall =================
  const DART = { x: X1 - 0.5, y: 2.0, z: Z0 + 15, R: 0.5 }; DART.oche = DART.x - 5.24;
  const boardTex = canvasTex(512, 512, (c) => {
    const C = 256, Rr = 250; c.fillStyle = '#111'; c.beginPath(); c.arc(C, C, Rr, 0, 7); c.fill();
    const rg = (r0, r1, colA, colB) => { for (let i = 0; i < 20; i++) { const a0 = -Math.PI / 2 + (i - 0.5) * Math.PI / 10, a1 = a0 + Math.PI / 10; c.fillStyle = i % 2 ? colB : colA; c.beginPath(); c.arc(C, C, r1, a0, a1); c.arc(C, C, r0, a1, a0, true); c.closePath(); c.fill(); } };
    const S = Rr * 0.8 / DART.R;
    rg(0, 0.5 * S, '#1a1a1a', '#f1e6c8'); rg(0.29 * S, 0.32 * S, '#c42d3c', '#2f8a4a'); rg(0.47 * S, 0.5 * S, '#c42d3c', '#2f8a4a');
    c.fillStyle = '#2f8a4a'; c.beginPath(); c.arc(C, C, 0.09 * S, 0, 7); c.fill(); c.fillStyle = '#c42d3c'; c.beginPath(); c.arc(C, C, 0.04 * S, 0, 7); c.fill();
    c.strokeStyle = '#cbd5e1'; c.lineWidth = 1.5; for (let i = 0; i < 20; i++) { const a = -Math.PI / 2 + (i - 0.5) * Math.PI / 10; c.beginPath(); c.moveTo(C + Math.cos(a) * 0.09 * S, C + Math.sin(a) * 0.09 * S); c.lineTo(C + Math.cos(a) * 0.5 * S, C + Math.sin(a) * 0.5 * S); c.stroke(); }
    c.fillStyle = '#f3f2f2'; c.font = '800 26px Archivo, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; SEG.forEach((n, i) => { const a = -Math.PI / 2 + i * Math.PI / 10; c.fillText(String(n), C + Math.cos(a) * 0.57 * S, C + Math.sin(a) * 0.57 * S); });
  });
  { const db = new THREE.Group(); db.position.set(DART.x, DART.y, DART.z); db.rotation.y = -Math.PI / 2; scene.add(db);
    M(CYL(0.85, 0.85, 0.06, 40), dark, 0, 0, -0.04, db, 0.02, 0.85).rotation.x = Math.PI / 2;
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), new THREE.MeshToonMaterial({ map: boardTex, gradientMap: grad })); face.position.z = 0.01; db.add(face);
    M(new THREE.TorusGeometry(0.66, 0.035, 8, 48), toon('#cbd5e1'), 0, 0, 0.01, db, 0);
    M(BOX(1.4, 0.36, 0.06), [DARK, DARK, DARK, DARK, new THREE.MeshBasicMaterial({ map: signTex('DARTS', '#ff4a3a') }), DARK], 0, 1.05, 0, db, 0.012);
    glowSprite(0, 1.4, 0.4, 0xffd38a, 1.6, db);
    M(BOX(0.1, 0.03, 1.4), brass, DART.oche, 0.05, DART.z, null, 0); }
  // the chalk scoreboard (between the two boards) + the power bar beside the board
  const chalkCv = document.createElement('canvas'); chalkCv.width = 256; chalkCv.height = 300; const chalkTex = new THREE.CanvasTexture(chalkCv); chalkTex.colorSpace = THREE.SRGBColorSpace;
  { const sb = M(BOX(1.1, 1.3, 0.06), toon('#1c2a22'), DART.x - 0.05, 2.2, DART.z + 3.5, null, 0.02); sb.rotation.y = -Math.PI / 2; const f = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 1.2), new THREE.MeshBasicMaterial({ map: chalkTex, transparent: true })); f.position.z = 0.035; sb.add(f); }
  const best = () => save.stat('meru.darts.best', 0) || 0;
  function drawChalk(D) { const c = chalkCv.getContext('2d'); c.clearRect(0, 0, 256, 300); c.fillStyle = 'rgba(255,255,255,0.92)'; c.font = '700 30px Archivo, Arial'; c.textAlign = 'left'; c.fillText('DARTS', 22, 44); c.fillRect(22, 56, 212, 3);
    c.font = '600 24px Archivo, Arial'; (D ? D.log : []).forEach((l, i) => c.fillText((i + 1) + '.  ' + l.label + '  ' + l.pts, 22, 98 + i * 40)); c.fillRect(22, 222, 212, 2);
    c.font = '800 30px Archivo, Arial'; c.fillText('TOTAL ' + (D ? D.score : 0), 22, 262); c.font = '600 18px Archivo, Arial'; c.fillText('BEST ' + best(), 22, 290); chalkTex.needsUpdate = true; }
  drawChalk(null);
  const bar = new THREE.Group(); bar.position.set(DART.x - 0.1, DART.y, DART.z + 1.15); bar.rotation.y = -Math.PI / 2; bar.visible = false; scene.add(bar);
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
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false })); s.scale.set(big ? 2.6 : 1.6, big ? 0.65 : 0.4, 1); s.position.set(DART.x - 0.3, DART.y + 0.95, DART.z); s.renderOrder = 12; scene.add(s); pops.push({ s, t: 0, big }); }
  const NS = 90, sparkArr = new Float32Array(NS * 3).fill(-999), sparkV = Array.from({ length: NS }, () => ({ v: new THREE.Vector3(), life: 0 })), sparkGeo = new THREE.BufferGeometry(); let sparkI = 0;
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkArr, 3)); const sparks = new THREE.Points(sparkGeo, new THREE.PointsMaterial({ color: 0xffd38a, map: glowTex, size: 0.06, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sparks.frustumCulled = false; scene.add(sparks);
  function burstSparks(p, n, sp = 2.2) { for (let k = 0; k < n; k++) { const i = sparkI = (sparkI + 1) % NS, s = sparkV[i]; s.life = rr(0.3, 0.7); s.v.set(rr(-1.4, -0.2), rr(-0.6, 1.4), rr(-1, 1)).normalize().multiplyScalar(rr(0.5, 1) * sp); sparkArr.set([p.x, p.y, p.z], i * 3); } }

  // ---- little synth sfx (same calls as the old game: tone(f, d, v, type, slide) · burst(d, f, v)) ----
  let noiseBuf = null; const noise = c => { if (!noiseBuf || noiseBuf.sampleRate !== c.sampleRate) { noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate); const a = noiseBuf.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1; } return noiseBuf; };
  const sfx = {
    tone(f, d, v, type = 'sine', slide = 1) { const c = audio && audio(); if (!c) return; const t = c.currentTime, o = c.createOscillator(), g = c.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (slide !== 1) o.frequency.exponentialRampToValueAtTime(f * slide, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + d + 0.03); },
    burst(d, f, v) { const c = audio && audio(); if (!c) return; const t = c.currentTime, b = c.createBufferSource(); b.buffer = noise(c); const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; const g = c.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d); b.connect(bp); bp.connect(g); g.connect(c.destination); b.start(t, Math.random() * 0.5); b.stop(t + d + 0.03); },
  };

  // ---- darts game state ----
  let D = null, tut = false, toast = '', toastT = 0; const say = (s, t = 3) => { toast = s; toastT = t; };
  const dSpot = { key: 'tavernDarts', x: DART.oche - 0.4, z: DART.z, r: 1.6, get prompt() { return D ? (D.phase === 'aim' ? 'THROW · DART ' + (D.n + 1) + ' OF 3' : null) : 'PLAY · DARTS'; },
    use(P) { if (!D) { thrown.forEach(d => scene.remove(d)); thrown.length = 0; D = { phase: 'aim', n: 0, score: 0, t: rr(0, 6), p: 0, pdir: 1, log: [] }; drawChalk(D); sfx.tone(520, 0.1, 0.04, 'triangle', 1.3);
        if (!tut) { tut = true; say('DARTS · THREE DARTS · WATCH THE RED SIGHT, THEN TAP WHEN THE BAR IS AT THE WHITE LINE', 5); } return; }
      if (D.phase !== 'aim') return; D.phase = 'wind'; D.wind = 0; D.lock = { u: D.u, v: D.v, p: D.p }; sfx.burst(0.05, 2400, 0.06); } };
  spots.push(dSpot);
  const V = new THREE.Vector3();
  function release(fox) { const { u, v, p } = D.lock, err = p - PERFECT, fu = u + rr(-1, 1) * Math.abs(err) * 0.16, fv = v + err * 0.55 + rr(-0.01, 0.01);
    const dm = makeDart(), from = new THREE.Vector3(), arm = fox.userData.P && fox.userData.P.arms && fox.userData.P.arms[1]; fox.updateMatrixWorld(true); if (arm) arm.getWorldPosition(from); else from.set(fox.position.x, 1.6, fox.position.z); from.y += 0.25;
    D.fly = { dm, from, to: new THREE.Vector3(DART.x - 0.02, DART.y + fv, DART.z + fu), t: 0, u: fu, v: fv, clean: Math.abs(err) < 0.06 }; D.phase = 'fly'; sfx.burst(0.1, 3200, 0.1); sfx.tone(300, 0.25, 0.02, 'sine', 2.2); }
  function land(fox) { const F = D.fly; F.dm.position.copy(F.to); thrown.push(F.dm);
    const [pts, label] = dartScore(F.u, F.v); D.score += pts; D.n++; D.log.push({ label, pts }); drawChalk(D);
    sfx.burst(0.06, 900, 0.18); sfx.tone(pts >= 50 ? 1200 : pts >= 30 ? 980 : pts ? 700 : 180, 0.14, 0.05, pts ? 'triangle' : 'square', pts >= 50 ? 1.5 : 1);
    if (pts) burstSparks(V.set(DART.x - 0.05, F.to.y, F.to.z), pts >= 50 ? 40 : /TRIPLE/.test(label) ? 30 : 12, pts >= 50 ? 3 : 2.2);
    dartPop(label === 'MISS' ? 'MISS' : label + (F.clean ? ' · CLEAN' : ''), pts >= 50 ? '#ffd76a' : /TRIPLE/.test(label) ? '#5fe3ff' : /DOUBLE/.test(label) ? '#ec3013' : pts ? '#f3f2f2' : '#9b9797');
    if (pts >= 25 || /TRIPLE/.test(label)) fox.userData.hop = 1; D.phase = 'landed'; D.hold = 0.85; }
  function tickDarts(dt, t, P, fox) {
    for (let i = pops.length - 1; i >= 0; i--) { const p = pops[i]; p.t += dt; p.s.position.y += dt * 0.5; p.s.material.opacity = 1 - smooth(p.big ? 1.6 : 0.8, p.big ? 2.4 : 1.3, p.t); if (p.t > (p.big ? 2.4 : 1.3)) { scene.remove(p.s); p.s.material.map.dispose(); p.s.material.dispose(); pops.splice(i, 1); } }
    let live = false; for (let i = 0; i < NS; i++) { const s = sparkV[i]; if (s.life <= 0) continue; live = true; s.life -= dt; s.v.y -= 6 * dt; sparkArr[i * 3] += s.v.x * dt; sparkArr[i * 3 + 1] += s.v.y * dt; sparkArr[i * 3 + 2] += s.v.z * dt; if (s.life <= 0) sparkArr[i * 3 + 1] = -999; } if (live) sparkGeo.attributes.position.needsUpdate = true;
    bar.visible = !!D; if (!D) { dartAim.material.opacity = 0; return; }
    if (Math.hypot(dSpot.x - P.x, dSpot.z - P.z) > 3.4) { D = null; dartAim.material.opacity = 0; bar.visible = false; return; }
    D.t += dt; const wob = 0.3 * (1 - Math.min(0.5, D.n * 0.06));
    if (D.phase === 'aim') { D.u = Math.sin(D.t * 1.9) * wob + Math.sin(D.t * 4.7) * 0.05; D.v = Math.sin(D.t * 2.6 + 1) * wob * 0.9 + Math.cos(D.t * 3.9) * 0.05; D.p += D.pdir * dt * 1.15; if (D.p > 1) { D.p = 1; D.pdir = -1; } if (D.p < 0) { D.p = 0; D.pdir = 1; } }
    const show = D.phase === 'aim' ? D : D.lock || D; dartAim.position.set(DART.x - 0.04, DART.y + (show.v || 0), DART.z + (show.u || 0)); dartAim.material.opacity = D.phase === 'aim' ? 0.95 : D.phase === 'wind' ? 0.6 : 0; dartAim.scale.setScalar(0.16 + Math.sin(t * 8) * 0.015);
    fill.scale.y = Math.max(0.001, show.p || 0); fill.material.color.set(Math.abs((show.p || 0) - PERFECT) < 0.06 ? 0xffd23a : 0xec3013);
    // the player's fox: faces the board, the arm draws back with the bar and snaps forward on release
    P.yaw = Math.PI / 2; fox.rotation.y = P.yaw; const arm = fox.userData.P && fox.userData.P.arms && fox.userData.P.arms[1];
    if (arm && D.phase === 'aim') arm.rotation.set(-1.5 - D.p * 0.9, 0, 0.2);
    if (D.phase === 'wind') { D.wind += dt; if (arm) arm.rotation.set(lerp(-1.5 - D.lock.p * 0.9, -2.6, smooth(0, 0.14, D.wind)), 0, 0.2); if (D.wind > 0.16) release(fox); }
    if (D.phase === 'fly') { const F = D.fly; F.t += dt / 0.42; const k = Math.min(1, F.t); if (arm) arm.rotation.set(lerp(-2.6, -0.9, smooth(0, 0.25, k)), 0, 0.2);
      F.dm.position.lerpVectors(F.from, F.to, k); F.dm.position.y += Math.sin(k * Math.PI) * 0.28; F.dm.lookAt(F.to.x - 1, F.to.y, F.to.z); F.dm.rotateZ(k * 8); if (k >= 1) land(fox); }
    if (D.phase === 'landed') { D.hold -= dt; if (D.hold <= 0) {
      if (D.n < 3) { D.phase = 'aim'; D.t = rr(0, 6); }
      else { const total = D.score, b = Math.max(best(), total); save.setStat('meru.darts.best', b); drawChalk(D);
        const ton80 = D.log.every(l => l.label === 'TRIPLE 20'); if (ton80) { dartPop('ONE HUNDRED AND EIGHTY!', '#ffd76a', true); burstSparks(V.set(DART.x - 0.2, DART.y, DART.z), 90, 4); fox.userData.hop = 1; }
        const line = ton80 ? 'ONE HUNDRED AND EIGHTY! Mott drops a glass. The whole tavern is on its feet.' : total >= 100 ? 'A ton! The whole tavern cheers.' : total >= 60 ? 'Not bad at all. Mott nods.' : 'Mott pretends not to see.';
        say(D.log.map(l => l.label).join(' · ') + ' — ' + total + ' points. ' + line + ' · BEST ' + b, 5); D = null; dartAim.material.opacity = 0; bar.visible = false; } } }
  }
  // camera: over the shoulder, board in frame (narrow phone screens too)
  let camK = 0; const camT = new THREE.Vector3(), lookT = new THREE.Vector3(), lookW = new THREE.Vector3();
  function camFix(camera, P, dt) { camK = clamp(camK + (D ? dt : -dt) * 3, 0, 1); if (camK <= 0) return; const k = smooth(0, 1, camK);
    camT.set(P.x - 1.9, 2.55, P.z + 1.7); lookT.set(DART.x, DART.y - 0.2, DART.z + 0.35); lookW.set(P.x, (P.y || 0) + 1.4, P.z);
    camera.position.lerp(camT, k); camera.lookAt(lookW.lerp(lookT, k)); }

  // ---- Flick on the second board ----
  const darter = createDarter({ THREE, scene, makeFox: kit.makeFox, animFox: kit.animFox, M, toon, grad, boardTex, look: PLAYER_MALE, board: { x: DART.x, y: DART.y, z: DART.z + 7 }, oche: DART.oche, audio: () => (near ? sfx : null) });
  let near = false;

  // ================= JUKEBOX on the east wall, near the door =================
  const JZ = Z1 - 8, JX = X1 - 0.95;
  const JUKE = { neon: [], playing: -1, el: null, synth: null, beat: 0, away: 0, last: -1 };
  { const jb = new THREE.Group(); jb.position.set(JX, 0, JZ); jb.rotation.y = -Math.PI / 2; jb.scale.setScalar(1.55); scene.add(jb); JUKE.group = jb;
    const body = toon('#3a2a52'); M(BOX(1.3, 1.6, 0.7), body, 0, 0.8, 0, jb, 0.03); const arch = M(new THREE.CylinderGeometry(0.65, 0.65, 0.7, 24, 1, false, -Math.PI / 2, Math.PI), body, 0, 1.6, 0, jb, 0.03); arch.rotation.x = Math.PI / 2; arch.rotation.z = Math.PI / 2;
    M(new THREE.TorusGeometry(0.52, 0.06, 6, 24, Math.PI), basic(0xff6bd5), 0, 1.6, 0.37, jb, 0); M(BOX(0.9, 0.5, 0.06), basic(0x5fe3ff), 0, 0.95, 0.36, jb, 0);
    const neon = [basic(0xff3bd4), basic(0x38bdf8), basic(0xffd23a)]; JUKE.neon = neon;
    for (let k = 0; k < 3; k++) M(new THREE.TorusGeometry(0.62 + k * 0.09, 0.025, 6, 32, Math.PI), neon[k], 0, 1.6, 0.36 + k * 0.01, jb, 0);
    for (const sx of [-1, 1]) M(BOX(0.06, 1.5, 0.06), neon[1], sx * 0.68, 0.78, 0.36, jb, 0);
    M(BOX(1.1, 0.18, 0.06), neon[2], 0, 0.15, 0.36, jb, 0);
    M(BOX(1.3, 0.33, 0.06), [DARK, DARK, DARK, DARK, new THREE.MeshBasicMaterial({ map: signTex('JUKEBOX', '#ff3bd4') }), DARK], 0, 2.55, 0.1, jb, 0.01);
    JUKE.glow = glowSprite(0, 1.2, 0.8, 0xff6be0, 4.5, jb);
    JUKE.ring = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.1, 40), new THREE.MeshBasicMaterial({ color: 0xff3bd4, transparent: true, opacity: 0.7, depthWrite: false })); JUKE.ring.rotation.x = -Math.PI / 2; JUKE.ring.position.set(JX - 2.0, 0.05, JZ); scene.add(JUKE.ring); }
  box(JX - 0.75, X1, JZ - 1.1, JZ + 1.1);
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
  spots.push({ key: 'tavernJukebox', x: JX - 2.0, z: JZ, r: 1.7, get prompt() { return JUKE.playing < 0 ? 'JUKEBOX · PLAY ' + SONGS[0].n : JUKE.playing < SONGS.length - 1 ? 'JUKEBOX · NEXT SONG' : 'JUKEBOX · STOP'; },
    use() { const n = JUKE.playing + 1; if (n >= SONGS.length) { stopSong(); say('JUKEBOX · OFF', 2); } else playSong(n); } });
  const notes = [], noteTex = canvasTex(64, 64, (c) => { c.fillStyle = '#fff'; c.font = '900 52px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('\u266A', 32, 34); });
  function tickJuke(dt, t, P, here) {
    const dist = Math.hypot(P.x - (JX - 2), P.z - JZ), ctx = audio && audio(), vol = here && JUKE.playing >= 0 && ctx ? clamp(1 - (dist - 2) / 22, 0.15, 1) : 0;
    JUKE.away = here ? 0 : JUKE.away + dt; if (JUKE.playing >= 0 && JUKE.away > 25) stopSong();   // walked away: the box goes quiet
    if (JUKE.el) JUKE.el.volume = clamp(lerp(JUKE.el.volume, vol * 0.8, Math.min(1, dt * 4)), 0, 1);
    if (JUKE.synth) JUKE.synth.out.gain.setTargetAtTime(vol * 0.9, JUKE.synth.ctx.currentTime, 0.2);
    const s = SONGS[JUKE.playing], playing = !!s; JUKE.beat += dt * (s ? s.bpm / 60 : 0.5);
    const pulse = playing ? Math.pow(0.5 + 0.5 * Math.cos(JUKE.beat * Math.PI * 2), 3) : 0.5 + 0.5 * Math.sin(t * 2);
    JUKE.neon.forEach((m, k) => m.color.setHSL(((t * (playing ? 0.25 : 0.06)) + k * 0.33) % 1, 0.95, 0.45 + pulse * (playing ? 0.25 : 0.1)));
    JUKE.glow.material.opacity = playing ? 0.35 + pulse * 0.45 : 0.3; JUKE.glow.scale.setScalar(playing ? 4.2 + pulse * 1.4 : 4);
    JUKE.group.scale.setScalar(1.55 * (1 + (playing ? pulse * 0.02 : 0)));
    JUKE.ring.material.opacity = 0.45 + 0.35 * Math.sin(t * 3); JUKE.ring.scale.setScalar(1 + 0.06 * Math.sin(t * 3));
    if (playing && here && notes.length < 14 && Math.random() < dt * (s.bpm / 40)) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, color: new THREE.Color(s.col), transparent: true, depthWrite: false })); sp.scale.setScalar(rr(0.28, 0.42)); sp.position.set(JX - 1.2 + rr(-0.4, 0.2), 3.2, JZ + rr(-0.8, 0.8)); scene.add(sp); notes.push({ sp, t: 0, vx: rr(-0.5, -0.1), vz: rr(-0.25, 0.25), ph: rr(0, 6) }); }
    for (let i = notes.length - 1; i >= 0; i--) { const n = notes[i]; n.t += dt; n.sp.position.x += n.vx * dt; n.sp.position.z += (n.vz + Math.sin(n.t * 3 + n.ph) * 0.3) * dt; n.sp.position.y += dt * 0.7; n.sp.material.opacity = 1 - smooth(1.6, 2.6, n.t); if (n.t > 2.6) { scene.remove(n.sp); n.sp.material.dispose(); notes.splice(i, 1); } }
    return playing ? JUKE.beat : null;
  }

  // ================= per frame =================
  function tick(dt, t, P, fox, dancers = []) {
    for (const f of flames) { if (f.fl) { const k = 1 + Math.sin(t * 13) * 0.12 + Math.sin(t * 7.3) * 0.08; f.fl.scale.set(1, k, 1); f.fi.scale.set(1, 2 - k, 1); f.glow.material.opacity = 0.45 + (k - 1) * 1.2; } else f.candle.scale.y = 0.85 + Math.sin(t * 11 + f.ph) * 0.15; }
    toastT -= dt; if (toastT <= 0) toast = '';
    if (!P) return; const here = inside(P.x, P.z); near = inside(P.x, P.z, 8);
    darter.update(dt, near);
    if (fox) tickDarts(dt, t, P, fox);
    const beat = tickJuke(dt, t, P, here);
    if (beat != null && here) for (const n of dancers) { const B = n.userData && n.userData.P; if (B) { B.body.position.y = Math.abs(Math.sin(beat * Math.PI)) * 0.06; B.head.rotation.z = Math.sin(beat * Math.PI) * 0.1; } }
  }
  return { spots, tick, camFix, toast: () => toast, darting: () => !!D, keys: new Set(['darterFlick']), DART, jukebox: { x: JX, z: JZ, play: playSong, stop: stopSong } };
}
