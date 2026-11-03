// MERU 2.0 — s110 MERU RADIO STUDIO [meruRadio] (Ben s110 picks: BOTH keepers give jobs (MORNING DJ: DJ SHIFT · TAKE THE CALLS · NIGHT SHOW · RADIO WEATHER;
// SOUND ENGINEER: SOUND EFFECTS · MIXING DESK · SONG REQUEST · TRAFFIC REPORT) · on-air booth + a RECORD LIBRARY wall you can browse · GENTLE ·
// prizes: DJ JACKET + headphones (1st clear), POCKET RADIO item (2), TAVERN REQUEST LINE (3), PICK TOMORROW'S SONG (4), YOUR VOICE ON THE TOWN RADIO (6),
// GOLD RECORD + 60 gold (all 8) · look: ON AIR lights, spinning records + bouncing VU meters, radio mast on the roof (blinking), town radio ticker, fan mail board).
// The STUDIO = an extra room in the cluster lobby row (clusters.addRoom), through a STUDIO door in the Meru Radio lobby back wall (quick fade).
// Kit pieces (card, panel, strip, fade, job camera, hint hand) follow worlds/meru2-tv.js. Stats prefix mrd.
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s645';
import { CLUSTER_LINES } from './meru2-cluster-lines.js';
export function buildRadioStation({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour = () => 12, isMuted = () => false, L, clusters, renderer, terrainAt = () => 0, go, jukebox = null }) {
  const LR = clusters && clusters.rooms && clusters.rooms.find(r => r && r.c.key === 'radio'); if (!LR || !clusters.addRoom) return null;
  const GEO = clusters.geo, LY = GEO.LY, LZ = GEO.LZ, LOX = LR.ox, RH = 6;
  const SR = clusters.addRoom({ key: 'radioStudio', room: 'meruRadio', title: 'MERU RADIO \u00b7 STUDIO' }, RH); SR.out = LR.out; const OX = SR.ox;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a), cc = new THREE.Color();
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', PAPER = '#f3f2f2', NAVY = '#1d2a33', STEEL = '#9aa0a6', DARK = '#3d3b3a', BLACK = '#26292d', GREEN = '#3f9a5e', WOOD = '#7a5236', FOAM = '#33363b';
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c })), BM = c => new THREE.MeshBasicMaterial({ color: c });
  const VCM = new THREE.MeshLambertMaterial({ vertexColors: true });
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(1, 1, 1)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 10, rx = 0, rz = 0, ry = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, ry, rx, rz),
      sph: (r, hex, x, y, z) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex),
      mesh(parent) { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); const m = new THREE.Mesh(g0, VCM); m.userData.noCull = true; parent.add(m); return m; } }; };
  const plate = (txt, w, h, bg, fg, bar) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (bar) { g.fillStyle = bar; g.fillRect(0, 0, Math.max(8, W * 0.03), H); } g.fillStyle = fg; g.textBaseline = 'middle'; let s = Math.round(H * 0.6); g.font = '900 ' + s + 'px Archivo, sans-serif'; while (g.measureText(txt).width > W * 0.86 && s > 10) { s -= 2; g.font = '900 ' + s + 'px Archivo, sans-serif'; } g.fillText(txt, bar ? W * 0.07 : W * 0.06, H / 2 + 2); });
  const planeT = (tex, w, h, x, y, z, ry, parent, both = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, side: both ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.set(0, ry, 0); m.userData.noCull = true; parent.add(m); return m; };
  const rectL = (a, b, c, d) => cols.push({ f: [OX + a, OX + b, LZ + c, LZ + d], y0: LY - 3, y1: LY + 12 }), circL = (x, z, r) => cols.push({ c: [OX + x, LZ + z, r], y0: LY - 3, y1: LY + 12 });
  const G = new THREE.Group(); G.name = 'meruRadioStudio'; G.position.set(OX, LY, LZ); scene.add(G); G.visible = false;
  const toW = (x, y, z) => V(OX + x, LY + y, LZ + z), toL = P => ({ x: P.x - OX, y: (P.y || 0) - LY, z: P.z - LZ });
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const today = () => save.stat('meru2Day', 1), night = () => { const h = hour(); return h >= 19 || h < 6.5; };
  const done = () => save.stat('mrdDone', null) || {};
  const hash = n => { n = (n * 2654435761) >>> 0; n ^= n >>> 15; n = Math.imul(n, 2246822519) >>> 0; n ^= n >>> 13; return n >>> 0; };
  // ================= THE EIGHT SONGS (A1-A5 = the Tavern jukebox; m = melody in scale steps, used for the hum + the record graphs) =================
  const SONGS = [{ t: 'SPACE HORSE', g: 'COUNTRY', root: 196, m: [0, 0, 4, 4, 5, 5, 4, 4], c: '#ffd23a', j: 0 }, { t: 'FLY ME PAST THE MOON', g: 'JAZZ', root: 175, m: [7, 6, 5, 4, 3, 4, 5, 2], c: '#38bdf8', j: 1 },
    { t: 'PHANTOM OF THE UNIVERSE', g: 'OPERA', root: 220, m: [0, 7, 6, 5, 6, 5, 4, 0], c: '#c084fc', j: 2 }, { t: 'SPACE FOX', g: 'ROCKABILLY', root: 165, m: [0, 2, 4, 0, 2, 4, 5, 4], c: RED, j: 3 },
    { t: 'BLAST OFF', g: 'ROCK & ROLL', root: 196, m: [0, 0, 0, 3, 4, 4, 4, 7], c: '#ff3bd4', j: 4 }, { t: 'MORNING SPIRE', g: 'POP', root: 247, m: [4, 3, 2, 1, 0, 1, 2, 4], c: '#7cff9b' },
    { t: 'LAST TRAIN TO THE LAKE', g: 'FOLK', root: 147, m: [0, 1, 2, 3, 4, 3, 2, 1], c: '#2e86b8' }, { t: 'SALT AND PEPPER', g: 'FUNK', root: 185, m: [0, 4, 0, 4, 6, 5, 4, 2], c: '#e07a1f' }];
  const SEMI = [0, 2, 4, 5, 7, 9, 11, 12], fq = d => 392 * Math.pow(2, SEMI[clamp(d, 0, 7)] / 12);
  const graph = (m, col = INK, h = 64) => '<svg viewBox="0 0 170 74" style="display:block;width:100%;height:' + h + 'px" aria-hidden="true"><polyline fill="none" stroke="' + col + '" stroke-width="3" points="' + m.map((d, k) => (12 + k * 21) + ',' + (66 - d * 8.4)).join(' ') + '"/>' + m.map((d, k) => '<rect x="' + (6 + k * 21) + '" y="' + (60 - d * 8.4) + '" width="12" height="12" fill="' + col + '"/>').join('') + '</svg>';
  // TODAY'S WEATHER: the same day-seeded forecast Meru TV shows (worlds/meru2-tv.js forecast(), copied so the printout always matches the TV wall)
  const REG = [['spire', 'THE SPIRE'], ['deco', 'DECO'], ['square', 'TOWN SQUARE'], ['lake', 'THE LAKE'], ['garden', 'GARDEN ISLAND']];
  const KINDS = ['SUN', 'CLOUD', 'RAIN', 'FOG', 'WIND'], KNAME = { SUN: 'SUNSHINE', CLOUD: 'CLOUD', RAIN: 'RAIN', FOG: 'FOG', WIND: 'WIND' };
  const forecast = (d = today()) => Object.fromEntries(REG.map(([k], i) => [k, KINDS[hash(d * 7 + i) % (i === 3 ? 5 : 4)]]));
  const temp = (d = today()) => 14 + hash(d * 3 + 1) % 12;
  // ================= STUDIO SHELL =================
  const R0 = mk(), { box, cyl, sph } = R0, WALL = '#4b4f55';
  box(20, 0.1, 20, '#6b4a35', 0, -0.05, 0); for (let x = -9; x <= 9; x += 1.5) box(0.03, 0.012, 20, '#5a3d2b', x, 0.006, 0); box(20, 0.2, 20, '#1b1d20', 0, RH + 0.1, 0);
  box(20, RH, 0.3, WALL, 0, RH / 2, -10); for (const s of [-1, 1]) { box(0.3, RH, 20, WALL, s * 10, RH / 2, 0); box(8.4, RH, 0.3, WALL, s * 5.8, RH / 2, 10); }
  box(3.2, RH - 3.2, 0.3, WALL, 0, 3.2 + (RH - 3.2) / 2, 10); box(3.2, 3.2, 0.05, '#141517', 0, 1.6, 10.12);
  for (const s of [-1, 1]) box(0.14, 3.3, 0.16, STEEL, s * 1.66, 1.65, 9.8); box(3.46, 0.14, 0.16, STEEL, 0, 3.27, 9.8);
  box(1.8, 0.02, 13.2, '#7a1d2a', 0, 0.012, 3.0); for (const s of [-1, 1]) box(0.06, 0.022, 13.2, YEL, s * 0.9, 0.014, 3.0);   // runner: door → booth
  for (let k = 0; k < 9; k++) for (let j = 0; j < 3; j++) if (Math.abs(-8 + k * 2) > 1.2 || j > 0) box(1.7, 1.1, 0.12, (k + j) % 2 ? FOAM : '#2a2c30', -8 + k * 2, 1.4 + j * 1.3, -9.8);   // acoustic foam
  rectL(-10, 10, -10.2, -9.8); rectL(9.8, 10.2, -10, 10); rectL(-10.2, -9.8, -10, 10); rectL(-10, -1.6, 9.8, 10.2); rectL(1.6, 10, 9.8, 10.2);
  // ON-AIR BOOTH (north): low walls + glass, the front open in the middle (the walkway runs straight in to the desk)
  const BW = [[-4.3, -4.1, -10, -3.8], [4.1, 4.3, -10, -3.8], [-4.3, -1.3, -3.9, -3.7], [1.3, 4.3, -3.9, -3.7]];
  for (const [a, b, c2, d] of BW) { const w = b - a, dd = d - c2, cx = (a + b) / 2, cz = (c2 + d) / 2; box(w, 1.0, dd, '#5a3d2b', cx, 0.5, cz); box(Math.max(w, 0.14), 0.08, Math.max(dd, 0.14), STEEL, cx, 1.04, cz); box(Math.max(w, 0.1), 0.1, Math.max(dd, 0.1), STEEL, cx, 3.0, cz); rectL(a, b, c2, d); }
  for (const x of [-4.2, -1.3, 1.3, 4.2]) box(0.12, 3.0, 0.12, STEEL, x, 1.5, -3.8); box(2.7, 0.3, 0.2, INK, 0, 3.05, -3.8);
  // DJ desk + two turntables + two mic booms + a small speaker pair
  box(6.4, 0.1, 1.3, '#c9ced3', 0, 1.0, -7.4); box(6.2, 0.95, 1.1, BLACK, 0, 0.48, -7.4); box(6.2, 0.95, 0.06, RED, 0, 0.48, -6.82); rectL(-3.2, 3.2, -8.05, -6.75);
  for (const x of [-2.4, -1.0]) { box(1.0, 0.1, 0.9, '#3a3d42', x, 1.1, -7.45); box(0.06, 0.05, 0.5, STEEL, x + 0.38, 1.18, -7.5, 0.4); }
  for (const x of [0.8, 2.2]) { cyl(0.025, 0.025, 0.5, STEEL, x, 1.3, -7.7, 6); box(0.04, 0.04, 0.6, STEEL, x, 1.55, -7.45, 0, 0.5); cyl(0.07, 0.06, 0.2, INK, x, 1.45, -7.15, 10, 0.3); }
  for (const s of [-1, 1]) { box(0.5, 0.8, 0.45, INK, s * 3.6, 1.45, -8.9); cyl(0.14, 0.14, 0.04, DARK, s * 3.6, 1.3, -8.66, 12, Math.PI / 2); cyl(0.08, 0.08, 0.04, DARK, s * 3.6, 1.66, -8.66, 12, Math.PI / 2); }
  // PHONE BANK (outside the booth's west wall): 4 line lamps live, a handset
  box(0.5, 1.0, 1.6, INK, -4.6, 1.6, -6.4); box(0.5, 0.9, 0.9, DARK, -4.6, 0.45, -6.4); box(0.3, 0.12, 0.5, RED, -4.82, 1.0, -6.0); rectL(-4.9, -4.3, -7.2, -5.6);
  // TELEPRINTER (north-east): Meru TV's forecast comes out here
  box(1.2, 0.9, 0.9, '#cfd5da', 6.4, 0.45, -8.6); box(1.0, 0.25, 0.7, '#9aa0a6', 6.4, 1.02, -8.6); cyl(0.1, 0.1, 0.9, PAPER, 6.4, 1.2, -8.85, 10, 0, Math.PI / 2); box(0.7, 0.01, 1.1, PAPER, 6.4, 0.9, -7.7, 0, -0.5); rectL(5.7, 7.1, -9.1, -8.1);
  // MIXING DESK (west wall): the sound engineer behind it, a meter bridge on top
  box(1.4, 0.9, 4.6, BLACK, -7.6, 0.45, -0.5); box(1.5, 0.08, 4.7, '#5a6168', -7.55, 0.94, -0.5, 0, 0, -0.18); for (let k = 0; k < 14; k++) box(0.22, 0.05, 0.08, k % 4 ? STEEL : RED, -7.3, 1.0, -2.5 + k * 0.3); rectL(-8.3, -6.9, -2.8, 1.8);
  box(0.12, 0.5, 4.0, INK, -8.25, 1.2, -0.5); box(0.6, 0.08, 0.6, DARK, -9.0, 0.55, -0.5); cyl(0.04, 0.04, 0.5, STEEL, -9.0, 0.27, -0.5, 6);
  // FOLEY TABLE (south-east): coconuts, a bell, a gravel tray, a rain stick; a door on a stand and a THUNDER SHEET hang beside it (their own meshes, they move)
  box(3.4, 0.08, 1.3, WOOD, 6.4, 0.95, 5.8); for (const [x, z] of [[4.8, 5.25], [8.0, 5.25], [4.8, 6.35], [8.0, 6.35]]) box(0.08, 0.95, 0.08, DARK, x, 0.47, z); box(0.9, 0.12, 0.6, '#8a8178', 7.4, 1.05, 5.9); rectL(4.6, 8.2, 5.1, 6.5);
  box(0.08, 3.4, 0.08, INK, 9.3, 1.7, 6.9); box(0.08, 3.4, 0.08, INK, 9.3, 1.7, 8.9); box(0.08, 0.08, 2.1, INK, 9.3, 3.4, 7.9); rectL(9.1, 9.6, 6.7, 9.1);
  box(0.1, 2.2, 0.1, DARK, 4.2, 1.1, 7.4); box(0.1, 2.2, 0.1, DARK, 5.4, 1.1, 7.4); box(1.3, 0.1, 0.1, DARK, 4.8, 2.2, 7.4); rectL(4.0, 5.6, 7.2, 7.6);
  // RECORD LIBRARY (east wall): floor-to-ceiling shelves (spines are a canvas), a rolling ladder
  box(0.8, 4.6, 9.4, WOOD, 9.5, 2.3, -2.0); rectL(9.0, 9.9, -6.7, 2.7); for (let y = 0.2; y < 4.7; y += 0.75) box(0.85, 0.06, 9.4, '#5a3d2b', 9.45, y, -2.0);
  box(0.05, 0.05, 9.4, STEEL, 8.95, 4.4, -2.0); box(0.06, 4.3, 0.06, STEEL, 8.6, 2.15, -0.4, 0, 0, 0.12); box(0.06, 4.3, 0.06, STEEL, 8.6, 2.15, 0.2, 0, 0, 0.12); for (let y = 0.4; y < 4.2; y += 0.4) box(0.05, 0.05, 0.6, STEEL, 8.85 - y * 0.12, y, -0.1);
  // TRAFFIC DESK (by the door, west): a desk + handset under the train loop map
  box(2.0, 0.08, 0.8, WOOD, -5.6, 0.9, 9.0); box(1.9, 0.86, 0.7, DARK, -5.6, 0.43, 9.0); box(0.3, 0.1, 0.18, INK, -5.0, 0.98, 9.0); rectL(-6.7, -4.5, 8.5, 9.6);
  // chairs, cooler, coat rack
  box(0.4, 1.2, 0.4, '#cfd5da', -9.4, 0.6, 8.8); cyl(0.16, 0.16, 0.4, '#7cc4ff', -9.4, 1.4, 8.8, 10); circL(-9.4, 8.8, 0.35);
  // pendants
  const LAMPS = [[-6, -1], [0, -1], [6, -1], [-6, 5], [6, 5], [0, -7]]; for (const [x, z] of LAMPS) { box(0.03, 1.0, 0.03, INK, x, RH - 0.5, z); cyl(0.12, 0.34, 0.3, RED, x, RH - 1.1, z, 12); }
  R0.mesh(G);
  // backdrop, signs, library spines, map, fan mail
  const backT = CT(1024, 300, (g, W, H) => { g.fillStyle = RED; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = '900 120px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('MERU RADIO', 36, 110); g.font = '900 44px Archivo, sans-serif'; g.fillText('98.8 FM \u00b7 THE VOICE OF THE SPIRE', 40, 230);
    g.strokeStyle = '#fff'; g.lineWidth = 8; for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(W - 90, 140, 30 + i * 30, -0.8, 0.8); g.stroke(); } });
  planeT(backT, 4.4, 1.29, 0, 4.4, -9.72, 0, G);
  planeT(plate('LOBBY \u00b7 MERU RADIO', 512, 96, INK, PAPER, RED), 2.4, 0.45, 0, 3.6, 9.83, Math.PI, G);
  planeT(plate('RECORD LIBRARY', 512, 96, INK, PAPER, RED), 2.6, 0.48, 9.04, 5.1, -2.0, -Math.PI / 2, G);
  planeT(plate('MIXING DESK', 512, 96, INK, PAPER, RED), 2.0, 0.38, -9.83, 3.9, -0.5, Math.PI / 2, G);
  planeT(plate('SOUND FX', 384, 96, INK, PAPER, RED), 1.5, 0.38, 6.4, 3.4, 9.83, Math.PI, G);
  planeT(plate('TRAFFIC DESK', 512, 96, INK, PAPER, RED), 1.9, 0.36, -5.6, 3.9, 9.83, Math.PI, G);
  planeT(plate('PHONES', 256, 96, INK, PAPER, RED), 1.0, 0.36, -4.87, 2.4, -6.4, -Math.PI / 2, G);
  planeT(plate('METEO WIRE', 384, 96, INK, PAPER, RED), 1.2, 0.3, 6.4, 1.45, -8.14, 0, G);
  const spineT = CT(1024, 512, (g, W, H) => { g.fillStyle = '#2a2018'; g.fillRect(0, 0, W, H); const pal = ['#ec3013', '#201e1d', '#f3f2f2', '#ffd23a', '#2e86b8', '#3f9a5e', '#c084fc', '#e07a1f', '#7a1d2a'];
    for (let r = 0; r < 6; r++) { let x = 6; while (x < W - 6) { const w = 7 + hash(x * 13 + r) % 9; g.fillStyle = pal[hash(x + r * 97) % pal.length]; g.fillRect(x, r * 85 + 8, w, 72); x += w + 1; } } });
  planeT(spineT, 9.2, 4.4, 9.08, 2.35, -2.0, -Math.PI / 2, G);
  const mapT = CT(512, 320, (g, W, H) => { g.fillStyle = PAPER; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(0, 0, W, 44); g.fillStyle = '#fff'; g.font = '900 26px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('THE TRAIN LOOP', 14, 23);
    const P = (L.TRAIN && L.TRAIN.line) || []; if (P.length) { const xs = P.map(p => p[0]), zs = P.map(p => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), z0 = Math.min(...zs), z1 = Math.max(...zs), sc = Math.min((W - 60) / (x1 - x0), (H - 90) / (z1 - z0)), X = x => 30 + (x - x0) * sc, Y = z => 62 + (z - z0) * sc;
      g.strokeStyle = RED; g.lineWidth = 7; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(X(p[0]), Y(p[1])) : g.moveTo(X(p[0]), Y(p[1]))); g.closePath(); g.stroke(); g.fillStyle = INK; for (const k of L.TRAIN.stops || []) { const c = L.TRAIN.stopAt && L.TRAIN.stopAt[k]; if (c) g.fillRect(X(c.c[0]) - 6, Y(c.c[1]) - 6, 12, 12); } } });
  planeT(mapT, 2.6, 1.62, -5.6, 2.5, 9.83, Math.PI, G);
  const onAirT = on => CT(256, 96, (g, W, H) => { g.fillStyle = on ? '#ff2a1a' : '#4a1410'; g.fillRect(0, 0, W, H); g.fillStyle = on ? '#fff' : '#7a3a30'; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('ON AIR', 22, H / 2 + 3); });
  const AIR_ON = onAirT(true), AIR_OFF = onAirT(false), airSigns = [planeT(AIR_OFF, 1.5, 0.56, 0, 3.55, -3.68, 0, G), planeT(AIR_OFF, 1.2, 0.45, 0, 4.2, 9.83, Math.PI, G)];
  // records on the turntables (spin), wall VU meters + the desk bridge (canvas), phone lamps
  const recT = CT(128, 128, (g, W) => { g.fillStyle = '#111'; g.beginPath(); g.arc(64, 64, 63, 0, 7); g.fill(); g.strokeStyle = '#2a2a2a'; g.lineWidth = 1; for (let r = 22; r < 62; r += 4) { g.beginPath(); g.arc(64, 64, r, 0, 7); g.stroke(); } g.fillStyle = RED; g.beginPath(); g.arc(64, 64, 18, 0, 7); g.fill(); g.fillStyle = '#fff'; g.fillRect(60, 50, 8, 8); });
  const RECS = [-2.4, -1.0].map(x => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.4, 24), new THREE.MeshBasicMaterial({ map: recT })); m.rotation.x = -Math.PI / 2; m.position.set(x, 1.17, -7.45); m.userData.noCull = true; G.add(m); return m; });
  const vuT = CT(512, 256, () => {}), bridgeT = CT(512, 128, () => {});
  const drawVU = lv => { const g = vuT.userData.c.getContext('2d'); g.fillStyle = INK; g.fillRect(0, 0, 512, 256); const NM = ['DJ', 'GUEST', 'MUSIC'];
    for (let i = 0; i < 3; i++) { const x = 20 + i * 166, n = 14, on = Math.round(clamp(lv[i], 0, 1) * n); for (let k = 0; k < n; k++) { const y = 200 - k * 13; g.fillStyle = k < on ? (k < 6 ? '#3f9a5e' : k < 11 ? '#7cff9b' : '#ff2a1a') : '#2c2f33'; g.fillRect(x, y, 140, 10); }
      g.fillStyle = '#ffd23a'; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(NM[i], x, 232); } vuT.needsUpdate = true;
    const b = bridgeT.userData.c.getContext('2d'); b.fillStyle = BLACK; b.fillRect(0, 0, 512, 128); for (let i = 0; i < 3; i++) { const x = 12 + i * 168; b.fillStyle = '#e8dcb0'; b.fillRect(x, 10, 152, 108); b.strokeStyle = INK; b.lineWidth = 6; const a = -2.4 + clamp(lv[i], 0, 1) * 1.7; b.beginPath(); b.moveTo(x + 76, 112); b.lineTo(x + 76 + Math.cos(a) * 80, 112 + Math.sin(a) * 80); b.stroke(); b.fillStyle = '#ff2a1a'; b.fillRect(x + 112, 18, 30, 8); } bridgeT.needsUpdate = true; };
  drawVU([0.4, 0.3, 0.5]); planeT(vuT, 3.0, 1.5, -9.83, 2.6, -0.5, Math.PI / 2, G); { const m = planeT(bridgeT, 3.8, 0.46, -8.18, 1.2, -0.5, Math.PI / 2, G); }
  const lampMs = [0, 1, 2, 3].map(i => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.22), BM('#4a1410')); m.position.set(-4.87, 1.85, -6.95 + i * 0.36); G.add(m); return m; });
  // fan mail + request board (south of the west wall)
  const mailT = CT(640, 400, () => {}); planeT(mailT, 2.6, 1.62, -9.83, 2.4, 5.4, Math.PI / 2, G);
  // the GOLD RECORD on the booth back wall (all 8 jobs)
  const goldT = CT(256, 320, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = '#e0b84a'; g.beginPath(); g.arc(W / 2, 128, 100, 0, 7); g.fill(); g.strokeStyle = '#b08a2a'; g.lineWidth = 2; for (let r = 40; r < 98; r += 8) { g.beginPath(); g.arc(W / 2, 128, r, 0, 7); g.stroke(); } g.fillStyle = RED; g.beginPath(); g.arc(W / 2, 128, 28, 0, 7); g.fill(); g.fillStyle = '#fff'; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('GOLD RECORD', 22, 268); g.font = '800 20px Archivo, sans-serif'; g.fillText('8 FOR 8 \u00b7 MERU RADIO', 26, 300); });
  const goldWall = planeT(goldT, 0.9, 1.12, 3.0, 2.6, -9.72, 0, G); goldWall.visible = false;
  // FOLEY moving props: door, thunder sheet, bell, coconuts, rain stick
  const FP = {}; { const door = new THREE.Group(); door.position.set(4.2, 0.1, 7.4); G.add(door); const d = new THREE.Mesh(new THREE.BoxGeometry(1.15, 2.0, 0.06), LM('#8a5a36')); d.position.set(0.6, 1.0, 0); door.add(d); const k = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), LM(YEL)); k.position.set(1.05, 1.0, 0.06); door.add(k); FP.knock = door;
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.03, 2.6, 1.6), LM('#b6bcc2')); sh.position.set(9.3, 1.95, 7.9); G.add(sh); FP.thunder = sh;
    const bell = new THREE.Group(); bell.position.set(5.0, 1.0, 5.6); G.add(bell); const bb = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.16, 0.22, 12, 1, true), new THREE.MeshLambertMaterial({ color: '#e0b84a', side: THREE.DoubleSide })); bb.position.y = 0.18; bell.add(bb); FP.bell = bell;
    const coco = new THREE.Group(); coco.position.set(5.9, 1.0, 5.9); G.add(coco); for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), LM('#6b4a2a')); h.position.set(s * 0.18, 0, 0); coco.add(h); } FP.hooves = coco;
    const rs = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.1, 8), LM('#c9a24a')); rs.position.set(6.6, 1.06, 5.5); rs.rotation.z = Math.PI / 2; G.add(rs); FP.rain = rs;
    const st = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.04, 0.5), LM('#a49a8c')); st.position.set(7.4, 1.13, 5.9); G.add(st); FP.steps = st; }
  const bulbs = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(LAMPS.flatMap(([x, z]) => [x, RH - 1.3, z]), 3)), new THREE.PointsMaterial({ size: 1.2, color: '#ffe6b0', map: glowT, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); bulbs.frustumCulled = false; G.add(bulbs);
  // ================= LOBBY: STUDIO door + ON AIR lamp + NOW PLAYING screen =================
  const LG = new THREE.Group(); LG.position.set(LOX, LY, LZ); scene.add(LG); LG.visible = false;
  { const D = mk(); D.box(1.9, 2.9, 0.06, '#141517', 5.6, 1.45, -9.82); for (const s of [-1, 1]) D.box(0.12, 3.0, 0.12, STEEL, 5.6 + s * 1.0, 1.5, -9.8); D.box(2.12, 0.12, 0.12, STEEL, 5.6, 3.0, -9.8); D.box(1.6, 0.02, 1.0, RED, 5.6, 0.012, -9.1); D.mesh(LG);
    planeT(plate('STUDIO \u00b7 COME IN', 512, 96, INK, PAPER, RED), 2.0, 0.38, 5.6, 3.35, -9.83, 0, LG); }
  airSigns.push(planeT(AIR_OFF, 1.0, 0.38, 5.6, 3.85, -9.83, 0, LG));
  const npT = CT(512, 296, () => {}); const RWx = GEO.RW / 2 - 0.29; planeT(npT, 2.36, 1.36, RWx, 2.8, -3.6, -Math.PI / 2, LG);
  const LDOOR = [5.6, -8.6], SDOOR = [0, 8.8];
  // ================= OUTSIDE: RADIO MAST on the roof, blinking red =================
  const CBt = (L.CLUSTER_BUILDINGS || []).find(c => c.key === 'radio'), D0 = CBt && CBt.D, BT = CBt && CBt.BT;
  const OUTW = (lx, lz) => { const c = Math.cos(D0.ry), s = Math.sin(D0.ry); return [D0.x + lx * c + lz * s, D0.z - lx * s + lz * c]; };
  const OG = new THREE.Group(); OG.name = 'meruRadioMast'; scene.add(OG); let mastLamp = null;
  if (BT) { const top = (terrainAt(BT.x, BT.z) || 0) + BT.h, S = mk(), MH = 26; OG.position.set(BT.x, top, BT.z);
    for (let k = 0; k < 3; k++) { const a = k * 2.094, x = Math.sin(a) * 1.1, z = Math.cos(a) * 1.1; for (let i = 0; i < 6; i++) S.box(0.16, MH / 6, 0.16, i % 2 ? '#f3f2f2' : RED, x * (1 - i * 0.13), MH / 12 + i * MH / 6, z * (1 - i * 0.13)); }
    for (let i = 1; i < 6; i++) { const r = 1.1 * (1 - i * 0.13) * 1.6; S.box(r, 0.08, 0.08, STEEL, 0, i * MH / 6, 0.55 * (1 - i * 0.13)); S.box(0.08, 0.08, r, STEEL, 0.48 * (1 - i * 0.13), i * MH / 6, 0, 0); }
    S.box(3.0, 0.4, 3.0, DARK, 0, 0.2, 0); S.cyl(0.06, 0.06, 3, STEEL, 0, MH + 1.5, 0, 6); S.box(1.4, 1.0, 0.1, PAPER, 0.9, MH * 0.6, 0.3); S.mesh(OG);
    mastLamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ff2a1a', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); mastLamp.scale.setScalar(5); mastLamp.position.y = MH + 3.1; OG.add(mastLamp);
    const lb = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), BM('#ff2a1a')); lb.position.y = MH + 3.1; OG.add(lb); OG.userData.lb = lb; OG.traverse(o => { o.userData.noCull = true; }); }
  // ================= FOXES =================
  const DJ0 = [-0.6, -8.6, 0], SE0 = [-9.0, -0.5, Math.PI / 2];
  const dj = kit.makeFox({ key: 'radioDJ', name: 'Morning DJ', torso: ['#ffd23a', '#ec3013', '#7a1d1d'], outfit: 'vest', mood: 'happy' }); dj.position.set(DJ0[0], 0, DJ0[1]); dj.rotation.y = DJ0[2]; dj.userData.noCull = true; dj.userData.rosterShop = 'Meru Radio'; G.add(dj);
  const eng = kit.makeFox({ key: 'radioTech', name: 'Sound Engineer', torso: ['#3d4652', '#9aa0a6', '#1d2a33'], outfit: 'coat', mood: 'neutral' }); eng.position.set(SE0[0], 0, SE0[1]); eng.rotation.y = SE0[2]; eng.userData.noCull = true; eng.userData.rosterShop = 'Meru Radio'; eng.userData.rosterRole = 'keeper'; G.add(eng); circL(SE0[0], SE0[1], 0.45);
  const phonesOn = (f, col = INK) => { const P = f && f.userData && f.userData.P; if (!P || !P.head) return null; const g = new THREE.Group(); const band = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.035, 6, 16, Math.PI), LM(col)); band.position.y = 0.06; band.rotation.y = Math.PI / 2; g.add(band);
    for (const s of [-1, 1]) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.07, 12), LM(col)); cup.rotation.z = Math.PI / 2; cup.position.set(s * 0.28, 0.0, 0); g.add(cup); const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.03, 12), LM(RED)); pad.rotation.z = Math.PI / 2; pad.position.set(s * 0.25, 0.0, 0); g.add(pad); }
    g.position.set(0, 0.08, 0); P.head.add(g); return g; };
  phonesOn(dj, RED); phonesOn(eng);
  // ================= shopKit (the DJ = keeper; the engineer has his own idle) =================
  const GAMES = [{ k: 'dj', name: 'DJ Shift', color: RED, who: 'dj' }, { k: 'calls', name: 'Take the Calls', color: '#2e86b8', who: 'dj' }, { k: 'night', name: 'Night Show', color: NAVY, who: 'dj' }, { k: 'weather', name: 'Radio Weather', color: '#7cc4ff', who: 'dj' },
    { k: 'sfx', name: 'Sound Effects', color: '#c9a24a', who: 'se' }, { k: 'mix', name: 'Mixing Desk', color: GREEN, who: 'se' }, { k: 'request', name: 'Song Request', color: '#c084fc', who: 'se' }, { k: 'traffic', name: 'Traffic Report', color: '#e07a1f', who: 'se' }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const RINGS = { dj: [-2.0, -5.1], night: [2.0, -5.1], calls: [-5.7, -5.4], weather: [6.0, -6.6], mix: [-6.0, 1.2], sfx: [5.4, 3.7], request: [7.7, -1.0], traffic: [-4.4, 7.4] };
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mrd', color: RED, boardTitle: 'Meru Radio board', room: { X0: -10, X1: 10, Z0: -10, Z1: 10 }, door: [0, 9.3], keeper: dj, keeperRy: 0, games: GAMES, toWorld: v => v.add(G.position),
    board: { x: 6.2, y: 2.4, z: 9.83, ry: Math.PI, w: 1.5 }, hiring: { x: 2.8, z: 7.8, ry: 0 }, hiringLine: 'DJ \u00b7 PHONES \u00b7 SOUND', sun: [], lamps: LAMPS.map(([x, z]) => [x, RH - 1.3, z]), lampsOn: () => true,
    browse: [[7.6, 1.6, Math.PI / 2], [3.0, 2.0, Math.PI], [-3.2, 3.0, -Math.PI / 2]], looks: [['#2e4a6b', '#e7e4dc', '#16263c'], ['#c97a3a', '#f3f2f2', '#7a3d1a'], ['#7c4dc4', '#e7e4dc', '#3d2563']], clock: { x: 0, y: 5.0, z: 9.83, ry: Math.PI } });
  const ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false }), ringMeshes = {};
  for (const k in RINGS) { const m = new THREE.Mesh(new THREE.RingGeometry(0.62, 0.8, 32), ringM); m.rotation.x = -Math.PI / 2; m.position.set(RINGS[k][0], 0.03, RINGS[k][1]); G.add(m); ringMeshes[k] = m; }
  // ================= KIT: sound, toast, fade, card, panel, strip =================
  let toastTxt = '', toastT = 0; const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null, nb = null; const AC = () => (ac = ac || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { const a = AC(), t = a.currentTime + at, o = a.createOscillator(), gn = a.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(a.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const noise = (len = 0.1, k = 0.1, type = 'highpass', f = 5000, at = 0, attack = 0) => { if (isMuted && isMuted()) return; try { const a = AC(); if (!nb) { nb = a.createBuffer(1, a.sampleRate * 2, a.sampleRate); const d = nb.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const s = a.createBufferSource(), fl = a.createBiquadFilter(), gn = a.createGain(), t = a.currentTime + at; s.buffer = nb; fl.type = type; fl.frequency.value = f; if (attack) { gn.gain.setValueAtTime(0.0001, t); gn.gain.exponentialRampToValueAtTime(k, t + attack); } else gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); s.connect(fl).connect(gn).connect(a.destination); s.start(t, Math.random()); s.stop(t + len + 0.05); } catch (e) {} };
  const ding = () => { tone(1568, 0.07, 0.8); tone(2093, 0.04, 0.8); }, nope = () => tone(196, 0.05, 0.25, 'square'), coin = () => { tone(2400, 0.04, 0.15, 'triangle'); tone(3200, 0.03, 0.12, 'triangle', 0.03); }, blip = () => tone(880, 0.04, 0.08, 'square');
  const ringRing = () => { for (let i = 0; i < 2; i++) for (let k = 0; k < 6; k++) tone(k % 2 ? 1100 : 1320, 0.03, 0.05, 'square', i * 0.5 + k * 0.05); };
  const playTune = (i, step = 0.26, k = 0.05, type = 'triangle') => { const s = SONGS[i]; if (!s) return; s.m.forEach((d, n) => tone(fq(d), k, step * 1.7, type, n * step)); tone(s.root / 2, k * 1.2, step * 4, 'sine'); tone(s.root / 2 * 1.5, k, step * 4, 'sine', step * 4); };
  const SFXS = { knock: () => [0, 0.16, 0.32].forEach(a => { tone(150, 0.18, 0.09, 'square', a); noise(0.06, 0.12, 'lowpass', 900, a); }), hooves: () => [0, 0.14, 0.34, 0.48, 0.68, 0.82].forEach((a, i) => tone(i % 2 ? 620 : 780, 0.12, 0.06, 'triangle', a)),
    thunder: () => { noise(2.2, 0.5, 'lowpass', 260, 0, 0.08); noise(0.8, 0.25, 'lowpass', 600, 0.1); }, bell: () => { tone(1046, 0.08, 1.6); tone(2093, 0.04, 1.2); tone(1568, 0.03, 1.4, 'sine', 0.01); },
    steps: () => [0, 0.32, 0.64, 0.96].forEach(a => noise(0.09, 0.22, 'bandpass', 1400, a)), rain: () => { noise(1.8, 0.12, 'highpass', 3500, 0, 0.3); for (let i = 0; i < 14; i++) tone(2400 + Math.random() * 1600, 0.012, 0.03, 'sine', Math.random() * 1.6); } };
  let veil = null, fading = false; const fade = fn => { if (fading) return; fading = true; if (!veil) { veil = document.createElement('div'); Object.assign(veil.style, { position: 'fixed', inset: '0', background: '#000', opacity: '0', pointerEvents: 'none', transition: 'opacity .28s', zIndex: '40' }); document.body.appendChild(veil); }
    void veil.offsetWidth; veil.style.opacity = '1'; setTimeout(() => { try { fn(); } finally { setTimeout(() => { veil.style.opacity = '0'; fading = false; }, 160); } }, 300); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,270px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box;line-height:1.25';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(36vw, 250px)' : 'min(58vw, 270px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:' + RED + ';color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, stopBtn) => '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span>' + (stopBtn ? '<button data-stop style="pointer-events:auto;min-height:44px;min-width:64px;padding:0 12px;text-align:left;background:#f3f2f2;color:#201e1d;border:2px solid #f3f2f2;border-radius:0;font:900 12px Archivo,sans-serif;cursor:pointer">STOP</button>' : '<span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' \u00b7 STOP</span>') + '</div>';
  const steps = items => '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">' + items.map(([t, ok]) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;line-height:1.3;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffd23a' : '#201e1d') + '">' + (ok ? '\u2713 ' : '') + t + '</span>').join('') + '</div>';
  const tipH = (who, t) => '<div style="margin-top:6px;font-size:12px;font-weight:800;line-height:1.3"><span style="color:' + RED + ';font-weight:900">' + who + ' \u00b7 </span>' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; const b = card.querySelector('[data-stop]'); if (b) b.onclick = e => { e.stopPropagation(); quit(); }; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const stopEv = el => { for (const ev of ['pointerdown', 'pointermove', 'pointerup', 'wheel', 'touchstart', 'touchmove']) el.addEventListener(ev, e => e.stopPropagation(), { passive: true }); };
  const PANEL = document.createElement('div'); PANEL.style.cssText = 'position:fixed;z-index:34;display:none;flex-direction:column;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;overflow:hidden;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(PANEL); stopEv(PANEL);
  const sideM = () => { const W = innerWidth, H = innerHeight; return H < 520 ? Math.max(8, Math.min(180, (W - 320) / 2)) : 8; };
  const fitPanel = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = sideM(), w = Math.min(640, W - side * 2); Object.assign(PANEL.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', top: (short ? 8 : 56) + 'px', bottom: (short ? 8 : 80) + 'px' }); };
  const panelHead = (l, r) => '<div style="display:flex;align-items:center;gap:10px;background:' + RED + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:14px;flex:none;min-height:46px"><span style="flex:1;min-width:0;padding:6px 0;line-height:1.2;text-wrap:balance">' + l + '</span><span style="white-space:nowrap">' + r + '</span><button data-stop style="align-self:stretch;min-width:72px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 13px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const tipBar = t => '<div data-tip style="flex:none;background:#201e1d;color:#ffd23a;font-weight:900;font-size:13px;padding:8px 12px">' + t + '</div>';
  const showPanel = html => { fitPanel(); PANEL.innerHTML = html; PANEL.style.display = 'flex'; const b = PANEL.querySelector('[data-stop]'); if (b) b.onclick = () => quit(); };
  const hidePanel = () => { PANEL.style.display = 'none'; PANEL.innerHTML = ''; };
  const STRIP = document.createElement('div'); STRIP.style.cssText = 'position:fixed;z-index:34;display:none;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;box-sizing:border-box;-webkit-user-select:none;user-select:none;touch-action:none';
  document.body.appendChild(STRIP); stopEv(STRIP);
  const fitStrip = () => { const W = innerWidth, H = innerHeight, short = H < 520, side = sideM(), port = W < H, w = Math.min(560, W - side * 2); Object.assign(STRIP.style, { left: Math.round((W - w) / 2) + 'px', width: Math.round(w) + 'px', bottom: (short ? 8 : touch && port ? 250 : 90) + 'px' }); };
  const stripHead = l => '<div style="display:flex;align-items:center;gap:10px;background:' + RED + ';color:#fff;padding:0 0 0 12px;font-weight:900;font-size:13px;min-height:40px"><span style="flex:1">' + l + '</span><button data-stop style="align-self:stretch;min-width:64px;background:#201e1d;color:#f3f2f2;border:0;border-radius:0;font:900 12px Archivo,sans-serif;text-align:left;padding:0 12px;cursor:pointer">STOP</button></div>';
  const showStrip = html => { fitStrip(); STRIP.innerHTML = html; STRIP.style.display = 'block'; const b = STRIP.querySelector('[data-stop]'); if (b) b.onclick = () => quit(); };
  addEventListener('resize', () => { if (PANEL.style.display !== 'none' && J && GD[J.g].draw) { fitPanel(); GD[J.g].draw(); } if (STRIP.style.display !== 'none') fitStrip(); });
  const shake = el => { try { el.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 260 }); } catch (e) {} };
  const pulse = el => { if (!el) return; el.style.outline = '4px solid #ffd23a'; try { el.animate([{ outlineColor: '#ffd23a', outlineWidth: '4px' }, { outlineColor: 'rgba(255,210,58,0)', outlineWidth: '8px' }], { duration: 700, iterations: 3 }); } catch (e) {} };
  const BTN = 'min-width:0;min-height:56px;padding:6px 10px;text-align:left;background:#fff;color:#201e1d;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;line-height:1.15;cursor:pointer;outline:0 solid transparent';
  const bangT = CT(64, 96, (g, W, H) => { g.fillStyle = YEL; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(4, 4, W - 8, H - 8); g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = INK; g.font = '900 64px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('!', 22, H / 2 + 3); });
  const okT = CT(64, 96, (g, W, H) => { g.fillStyle = '#3f9a5e'; g.strokeStyle = INK; g.lineWidth = 6; g.fillRect(4, 4, W - 8, H - 8); g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = '#fff'; g.font = '900 56px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('\u2713', 12, H / 2 + 3); });
  const tmp = V();
  // ================= state + input =================
  let busy = null, J = null, lastP = null, lastFox = null, snapK = false, endClear = 0;
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true; if (PANEL.contains(t) || STRIP.contains(t)) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !fading && GD[J.g].tap3d;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; e.stopPropagation(); GD[J.g].tap(e.clientX, e.clientY); }, true);
  const RAD = () => (touch ? 54 : 34) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const pdAt = (v, x, y) => { const s = scrW(v); return s[2] > 1 ? 1e9 : Math.hypot(s[0] - x, s[1] - y); };
  const addGold = n => { n = Math.max(0, Math.round(n)); if (!J) return 0; J.gold += n; save.addGold(n); coin(); return n; };
  const missOne = (msg, s = 1.8) => { if (!J) return; J.miss++; nope(); toast(msg, s); const tip = (PANEL.style.display !== 'none' ? PANEL : STRIP).querySelector('[data-tip]'); if (tip) { tip.textContent = msg; tip.style.background = '#ec3013'; tip.style.color = '#ffffff'; } };
  const timeBar = (el, f, warn) => { if (!el) return; el.style.width = (clamp(f, 0, 1) * 100).toFixed(1) + '%'; el.style.background = warn ? RED : INK; };
  // ================= talk targets =================
  const ln = (who, role) => text => ({ who, role, text });
  const T_DJ = { key: 'radioDJ', name: 'Morning DJ', role: 'MERU RADIO', obj: dj, ry: DJ0[2], r: 6 }, djLn = ln('Morning DJ', 'MERU RADIO');
  const T_SE = { key: 'radioTech', name: 'Sound Engineer', role: 'MERU RADIO', obj: eng, ry: SE0[2], r: 6 }, seLn = ln('Sound Engineer', 'MERU RADIO');
  const giver = g => (GN[g].who === 'se' ? [T_SE, seLn] : [T_DJ, djLn]);
  const goRoom = (x, z, yaw) => go(OX + x, LY, LZ + z, yaw);
  const place = (f, x, z, ry) => { f.position.set(x, 0, z); f.rotation.y = ry; };
  const armUp = (f, side, rz, rx = 0) => { const A = f && f.userData && f.userData.P && f.userData.P.arms; if (A && A[side]) { A[side].rotation.z = rz; A[side].rotation.x = rx; } };
  const shuffle = a => a.map(v => [Math.random(), v]).sort((p, q) => p[0] - q[0]).map(p => p[1]);
  const pickN = (a, n) => shuffle(a).slice(0, n);
  const GD = {};
  // ---------- 1 DJ SHIFT (strip): the beat runs; hit DROP on the ONE to bring in the next song ----------
  const BPM = 100, BEAT = 60 / BPM, BAR = BEAT * 4, DROPS = 5, ZONE = 0.11;
  GD.dj = { strip: true, shot: () => [toW(-1.6, 1.4, -7.8), 4.2, 2.6, 0.32, 4, 0.15, 7],
    begin() { goRoom(-1.7, -8.5, 0); place(dj, 2.2, -8.6, -0.3); J.clk = 0; J.e8 = -1; J.si = Math.floor(Math.random() * 8); J.order = [J.si, ...shuffle([0, 1, 2, 3, 4, 5, 6, 7].filter(i => i !== J.si))]; J.n = 0; J.ready = BAR * 1.0; J.waitBars = 0; J.flash = 0; snapK = true; this.draw(); },
    next() { return SONGS[J.order[(J.n + 1) % 8]]; },
    draw() { const cur = SONGS[J.order[J.n % 8]], nx = this.next();
      showStrip(stripHead('DJ SHIFT \u00b7 ' + Math.min(J.n, DROPS) + ' / ' + DROPS) + '<div style="padding:8px 12px 4px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px"><div><div style="font-size:11px;font-weight:900;color:#ec3013">NOW PLAYING</div><div style="font-size:15px;font-weight:900;line-height:1.15">' + cur.t + '</div></div><div><div style="font-size:11px;font-weight:900;color:#ec3013">NEXT UP</div><div style="font-size:15px;font-weight:900;line-height:1.15">' + nx.t + '</div></div></div>'
        + '<div style="padding:4px 12px"><div data-bar style="position:relative;height:40px;background:#201e1d;border:2px solid #201e1d;overflow:hidden"><div style="position:absolute;top:0;bottom:0;left:' + ((0.5 - ZONE) * 100) + '%;width:' + (ZONE * 200) + '%;background:#3f9a5e"></div>' + [0.25, 0.5, 0.75, 0].map(f => '<div style="position:absolute;top:0;bottom:0;left:' + (f * 100) + '%;width:2px;background:#5a6168"></div>').join('') + '<div style="position:absolute;left:50%;top:2px;transform:translateX(-50%);color:#fff;font-weight:900;font-size:11px">THE ONE</div><div data-head style="position:absolute;top:0;bottom:0;width:6px;background:#ffd23a;left:0"></div></div></div>'
        + '<div style="padding:6px 12px 10px"><button data-drop style="' + BTN + ';width:100%;min-height:64px;background:#ec3013;color:#fff;font-size:22px">DROP \u00b7 ' + nx.t + '</button></div>' + tipBar('WAIT FOR THE GREEN, THEN DROP'));
      STRIP.querySelector('[data-drop]').onpointerdown = e => { e.preventDefault(); this.drop(); }; J.idle = 0; J.hinted = false; },
    phase() { return (J.clk % BAR) / BAR; },
    drop() { if (!J || J.g !== 'dj' || J.n >= DROPS || J.clk < J.ready) return; const f = this.phase(), on = f < ZONE || f > 1 - ZONE; J.idle = 0;
      if (!on) { missOne('OFF THE BEAT \u00b7 WAIT FOR THE GREEN'); J.ready = J.clk + BEAT; return; } this.land(true); },
    land(good) { J.n++; J.waitBars = 0; J.ready = J.clk + BAR * 1.5; if (good) { addGold(4); noise(0.6, 0.18, 'highpass', 2000, 0, 0.05); tone(SONGS[J.order[J.n % 8]].root * 2, 0.06, 0.4, 'square'); J.flash = 0.5; }
      if (J.n >= DROPS) { addGold(6); setTimeout(() => { if (J && J.g === 'dj') { STRIP.style.display = 'none'; finishGame(); } }, 1600); toast('THAT\u2019S THE SHIFT \u00b7 SMOOTH', 1.6); } else this.draw(); },
    tick(dt) { const was = Math.floor(J.clk / BAR); J.clk += dt; J.idle = (J.idle || 0) + dt; const e8 = Math.floor(J.clk / (BEAT / 2)); const s = SONGS[J.order[J.n % 8]];
      if (e8 !== J.e8) { J.e8 = e8; const b = e8 % 8; if (b % 2 === 0) tone(70, 0.22, 0.16, 'sine'); else noise(0.04, 0.05, 'highpass', 7000); if (b === 0 || b === 4) tone(s.root / 2, 0.07, 0.36, 'triangle'); if (b === 2 || b === 6) [1, 1.26, 1.5].forEach(m => tone(s.root * m, 0.02, 0.16, 'square')); if (b === 7) tone(fq(s.m[(e8 >> 3) % 8]), 0.03, 0.2, 'triangle'); }
      if (Math.floor(J.clk / BAR) !== was && J.clk > J.ready && J.n < DROPS && ++J.waitBars >= 4) { missOne('DEAD AIR \u00b7 THE NEXT SONG FADES IN'); this.land(false); }
      const hd = STRIP.querySelector('[data-head]'); if (hd) hd.style.left = ((this.phase() + 0.5) % 1 * 100).toFixed(1) + '%'; const bt = STRIP.querySelector('[data-drop]'); if (bt) bt.style.opacity = J.clk < J.ready ? '0.45' : '1';
      if (J.idle > 3 && !J.hinted && J.clk > J.ready) { J.hinted = true; pulse(bt); }
      RECS.forEach((r, i) => { r.rotation.z -= dt * (i === J.n % 2 ? 6 : 1.5); }); if (lastFox) armUp(lastFox, 0, -0.4, -0.9); kit.animFox(dj, dt, 0, false); const A = dj.userData.P && dj.userData.P.arms; if (A) A[1].rotation.z = 2.4 + Math.sin(J.clk * Math.PI * 2 / BEAT) * 0.3; } };
  // ---------- 2 TAKE THE CALLS (panel): put the caller who matches the topic on air ----------
  const TOPICS = { req: 'A SONG REQUEST', bday: 'A BIRTHDAY SHOUT-OUT', traffic: 'A TRAFFIC TIP', joke: 'A JOKE', quiz: 'THE QUIZ ANSWER', lost: 'A LOST PET' };
  const CALLERS = [['req', 'KIA', 'Can you play Space Horse? It is my cat\u2019s favourite.'], ['req', 'OTTO', 'Blast Off, please. Loud. My neighbour is asleep.'], ['req', 'MARLA', 'Something slow? Phantom of the Universe, maybe.'],
    ['bday', 'PELL', 'It is my gran\u2019s birthday. She is 90 today!'], ['bday', 'FLICK', 'Happy birthday to my brother. He is six. And loud.'], ['bday', 'NELL', 'Shout-out to Mum. Birthday cake at the lake!'],
    ['traffic', 'BOLT', 'Big queue on the ring road, chief. A tractor.'], ['traffic', 'DUSTY', 'The Spire bridge is stuck. Lots of honking.'], ['traffic', 'RUBY', 'A goose is crossing Castle Road. Very slowly.'],
    ['joke', 'MICHAEL JAY', 'Why did the fox cross the road? Free burgers.'], ['joke', 'SIZZLE', 'What do robots eat? Micro-chips! Thank you.'], ['joke', 'ORA', 'I knew you would ask for a joke. Knock knock.'],
    ['quiz', 'GEARS', 'The answer is eight! Eight gates. Splendid.'], ['quiz', 'MOSS', 'The answer is the Spire. Two hundred metres!'], ['quiz', 'PIP', 'Is the answer the ferry? It is the ferry.'],
    ['lost', 'LUNA', 'My dog Biscuit ran off near the fountain.'], ['lost', 'TOMO', 'Lost: one parrot. Answers to Captain.'], ['lost', 'BEA', 'Our cat is up the clock tower again.'], ['silly', 'CALLER 4', 'MOO. MOO. Sorry, wrong number. Moo.'], ['silly', 'A ROBOT', 'BEEP. IS THIS THE PIZZA SHOP. BEEP.']];
  const CALLTIME = 10, CALLN = 6;
  GD.calls = { panel: true, shot: () => [toW(-4.6, 1.5, -6.4), 3.4, 2.6, 0.12, 3.4, -Math.PI / 2, 6],
    begin() { goRoom(-5.7, -5.6, -Math.PI / 2 - 0.4); const tk = pickN(Object.keys(TOPICS), CALLN); J.list = tk.map(t => { const good = pickN(CALLERS.filter(c => c[0] === t), 1)[0], bad = pickN(CALLERS.filter(c => c[0] !== t), 2); return { t, good, opts: shuffle([good, ...bad]) }; });
      J.ci = 0; J.cueT = CALLTIME; J.wait = 0.4; snapK = true; ringRing(); this.draw(); },
    draw() { const c = J.list[J.ci];
      showPanel(panelHead('TAKE THE CALLS \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, J.gold ? J.gold + ' G' : 'MERU RADIO') + '<div data-body style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">'
        + (c ? '<div style="border:2px solid #201e1d;padding:6px 10px"><div style="font-size:11px;font-weight:900;color:#ec3013">THE DJ WANTS</div><div style="font-size:22px;font-weight:900;line-height:1.1">' + TOPICS[c.t] + '</div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div>'
          + c.opts.map((o, i) => '<button data-i="' + i + '" style="' + BTN + ';display:flex;flex-direction:column;gap:3px;flex:none"><span style="font-size:11px;color:#ec3013">LINE ' + (i + 1) + ' \u00b7 ' + o[1] + '</span><span style="font-size:15px;font-weight:800;text-wrap:pretty">\u201c' + o[2] + '\u201d</span></button>').join('') : '<div style="font-size:22px;font-weight:900">LINES CLEAR</div>')
        + '</div>' + tipBar('TAP THE CALLER WHO FITS'));
      PANEL.querySelectorAll('[data-i]').forEach(b => { b.onclick = () => this.pick(+b.dataset.i, b); }); J.idle = 0; J.hinted = false; },
    pick(i, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (c.opts[i] !== c.good) { missOne('WRONG CALLER \u00b7 THE DJ COUGHS'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; }
      addGold(4); blip(); tone(1320, 0.04, 0.2, 'triangle', 0.06); el.style.background = '#201e1d'; el.style.color = '#ffd23a'; J.wait = 0.8; setTimeout(() => this.next(), 700); },
    next() { if (!J || J.g !== 'calls') return; J.ci++; J.cueT = CALLTIME; J.wait = 0.3; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } ringRing(); this.draw(); },
    tick(dt, t) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / CALLTIME, J.cueT < 3); if (J.cueT <= 0) { missOne('THE CALLER HUNG UP \u00b7 NEXT'); this.next(); } }
      if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; const c = J.list[J.ci]; pulse(PANEL.querySelector('[data-i="' + c.opts.indexOf(c.good) + '"]')); }
      lampMs.forEach((m, i) => m.material.color.set(i < 3 && Math.sin(t * 9 + i * 2) > 0 ? '#ff2a1a' : '#4a1410')); } };
  // ---------- 3 NIGHT SHOW (strip): hold the mic to read the ad, let go at every full stop, finish before the jingle ----------
  const ADS = ['MERU LANES. Three lanes. No coin. Bring your own socks.', 'BOLT\u2019S GAS. Fill up, wipe up. He calls everyone chief.', 'THE FORTUNE TELLER. Ora knows. She knew you would hear this.', 'SIZZLE\u2019S BURGERS. Hot grill. Cold shakes. Open late.', 'MERU BANK. Your gold, kept safe. Mostly by the vault door.', 'THE FERRY. It goes to the island. Then it comes back.'];
  const WPS = 2.6;
  GD.night = { strip: true, shot: () => [toW(2.0, 1.55, -6.5), 2.6, 2.0, 0.12, 2.6, Math.PI + 0.4, 3.4],
    begin() { goRoom(2.0, -6.5, Math.PI); place(dj, -2.4, -8.6, 0.3); J.ads = pickN(ADS, 3); J.ai = 0; this.load(); snapK = true; },
    load() { const a = J.ads[J.ai]; J.words = a.split(' '); J.wi = 0; J.acc = 0; J.hold = false; J.atStop = false; J.overT = 0; J.offT = 0; J.flag = {}; J.left = J.words.length / WPS + (a.match(/\./g) || []).length * 1.4 + 7; J.total = J.left; this.draw(); },
    draw() { const a = J.ads[J.ai];
      showStrip(stripHead('NIGHT SHOW \u00b7 AD ' + (J.ai + 1) + ' / ' + J.ads.length) + '<div style="padding:8px 12px 4px;background:#1d2a33;color:#f3f2f2"><div style="font-size:11px;font-weight:900;color:#ffd23a">READ IN YOUR LOW VOICE</div><div data-words style="font-size:19px;font-weight:900;line-height:1.3;text-wrap:pretty;margin-top:2px"></div><div style="font-size:11px;font-weight:900;color:#ffd23a;margin-top:6px">JINGLE</div><div data-time style="height:8px;background:#ffd23a;width:100%"></div></div>'
        + '<div style="padding:8px 12px 10px"><button data-mic style="' + BTN + ';width:100%;min-height:68px;background:#ec3013;color:#fff;font-size:20px;touch-action:none">HOLD TO READ</button></div>' + tipBar('HOLD TO READ \u00b7 LET GO AT THE RED DOT'));
      const b = STRIP.querySelector('[data-mic]'), on = e => { e.preventDefault(); this.press(true); }, off = e => { e.preventDefault(); this.press(false); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); this.words(); J.idle = 0; J.hinted = false; },
    words() { const el = STRIP.querySelector('[data-words]'); if (!el) return; el.innerHTML = J.words.map((w, i) => '<span style="color:' + (i < J.wi ? '#ffd23a' : '#8a9aa6') + '">' + w.replace(/\.$/, '') + '</span>' + (/\.$/.test(w) ? '<span style="display:inline-block;width:10px;height:10px;background:#ec3013;margin:0 2px 2px"></span>' : '')).join(' '); },
    press(on) { if (!J || J.g !== 'night' || J.wi >= J.words.length) return; J.idle = 0; if (on === J.hold) return; J.hold = on; const b = STRIP.querySelector('[data-mic]'); if (b) { b.style.background = on ? '#201e1d' : '#ec3013'; b.textContent = on ? 'READING\u2026' : 'HOLD TO READ'; }
      if (on) { J.offT = 0; tone(220, 0.03, 0.1, 'sine'); } else if (J.atStop) { J.atStop = false; addGold(2); tone(660, 0.03, 0.12, 'triangle'); } },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wi < J.words.length) { J.left -= dt; { const tb = STRIP.querySelector('[data-time]'); timeBar(tb, J.left / J.total, J.left < 3); if (tb && J.left >= 3) tb.style.background = YEL; } if (J.left <= 0) { missOne('THE JINGLE ENDED \u00b7 NEXT AD'); this.end(); return; }
        if (J.hold) { if (J.atStop) { J.overT += dt; if (J.overT > 0.7 && !J.flag['s' + J.wi]) { J.flag['s' + J.wi] = 1; missOne('RUSHED \u00b7 PAUSE AT THE RED DOT'); J.atStop = false; } }
          else { J.acc += dt * WPS; if (J.acc >= 1) { J.acc = 0; J.wi++; tone(140 + Math.random() * 30, 0.03, 0.12, 'sawtooth'); this.words(); if (J.wi >= J.words.length) { addGold(5); toast('AD DONE \u00b7 SMOOTH', 1.2); setTimeout(() => this.end(), 600); return; } if (/\.$/.test(J.words[J.wi - 1])) { J.atStop = true; J.overT = 0; } } } }
        else if (!J.atStop && J.wi > 0) { J.offT += dt; if (J.offT > 1.4 && !J.flag['o' + J.wi]) { J.flag['o' + J.wi] = 1; missOne('DEAD AIR \u00b7 KEEP HOLDING TILL THE DOT'); } } }
      if (J.idle > 3 && !J.hinted) { J.hinted = true; pulse(STRIP.querySelector('[data-mic]')); }
      if (lastFox && J.hold) armUp(lastFox, 1, 0.6, -1.2); kit.animFox(dj, dt, 0, false); },
    end() { if (!J || J.g !== 'night' || J.ending) return; J.ending = true; setTimeout(() => { if (!J || J.g !== 'night') return; J.ending = false; J.ai++; if (J.ai >= J.ads.length) { STRIP.style.display = 'none'; finishGame(); } else this.load(); }, 300); } };
  // ---------- 4 RADIO WEATHER (panel): read Meru TV's printout, region by region, then the temperature ----------
  const WTIME = 9, ICO = {};
  GD.weather = { panel: true, shot: () => [toW(6.4, 1.2, -8.2), 3.0, 2.2, 0.3, 3.0, 0.4, 5],
    begin() { goRoom(6.0, -6.8, Math.PI - 0.2); const fc = forecast(), tp = temp(); J.fc = fc; J.list = [...shuffle(REG).map(r => ({ k: r[0], nm: r[1], a: fc[r[0]] })), { temp: true, a: tp + '\u00b0', opts: shuffle([tp, tp + 4, tp - 3].map(x => x + '\u00b0')) }]; J.ci = 0; J.cueT = WTIME; J.wait = 0.4; snapK = true; tone(880, 0.03, 0.05, 'square'); this.draw(); },
    draw() { const c = J.list[J.ci], fc = J.fc, wide = innerWidth > innerHeight * 1.1;
      const prn = '<div style="flex:' + (wide ? '1 1 0' : 'none') + ';min-width:0;background:#fffdf3;border:2px solid #201e1d;padding:8px 10px;font-family:\'Courier New\',monospace;font-weight:700"><div style="font:900 12px Archivo,sans-serif;color:#ec3013">METEO WIRE \u00b7 FROM MERU TV \u00b7 DAY ' + today() + '</div>'
        + REG.map(r => '<div style="display:flex;justify-content:space-between;gap:8px;font-size:15px;line-height:1.5;border-bottom:1px dashed #cfcac3"><span>' + r[1] + '</span><span>' + fc[r[0]] + '</span></div>').join('') + '<div style="font-size:15px;line-height:1.6">TOP TEMP ' + temp() + '\u00b0</div></div>';
      const q = c ? (c.temp ? 'AND THE TOP TEMPERATURE TODAY IS\u2026' : 'AND OVER ' + c.nm + ', WE HAVE\u2026') : 'THAT\u2019S THE WEATHER!';
      const opts = c ? (c.temp ? c.opts : KINDS) : [];
      showPanel(panelHead('RADIO WEATHER \u00b7 ' + Math.min(J.ci + 1, J.list.length) + ' / ' + J.list.length, J.gold ? J.gold + ' G' : 'MERU RADIO') + '<div style="flex:1;min-height:0;display:flex;flex-direction:' + (wide ? 'row' : 'column') + ';gap:10px;padding:10px;box-sizing:border-box;overflow:auto">' + prn
        + '<div style="flex:1 1 0;min-width:0;display:flex;flex-direction:column;gap:8px"><div style="border:2px solid #201e1d;padding:6px 10px"><div style="font-size:11px;font-weight:900;color:#ec3013">ON AIR \u00b7 YOU SAY</div><div style="font-size:20px;font-weight:900;line-height:1.15;text-wrap:balance">' + q + '</div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div>'
        + '<div style="display:grid;grid-template-columns:repeat(' + (c && c.temp ? 3 : wide ? 2 : 3) + ',minmax(0,1fr));gap:8px">' + opts.map(o => '<button data-o="' + o + '" style="' + BTN + ';font-size:16px">' + (ICO[o] ? ICO[o] + ' ' : '') + o + '</button>').join('') + '</div></div></div>' + tipBar('READ IT OFF THE PRINTOUT'));
      PANEL.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => this.pick(b.dataset.o, b); }); J.idle = 0; J.hinted = false; },
    pick(o, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (o !== c.a) { missOne('NOT ON THE PRINTOUT \u00b7 LOOK AGAIN'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; } addGold(3); ding(); J.wait = 0.5; this.next(); },
    next() { J.ci++; J.cueT = WTIME; if (J.ci >= J.list.length) { addGold(6); this.draw(); setTimeout(finishGame, 800); return; } this.draw(); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / WTIME, J.cueT < 3); if (J.cueT <= 0) { missOne('TOO SLOW \u00b7 NEXT REGION'); this.next(); } }
      if (J.idle > 3 && !J.hinted && J.ci < J.list.length) { J.hinted = true; pulse(PANEL.querySelector('[data-o="' + J.list[J.ci].a + '"]')); } } };
  // ---------- 5 SOUND EFFECTS (strip, at the foley table): the script calls a sound, tap it ----------
  const SFXN = [['knock', 'DOOR KNOCK'], ['hooves', 'HOOVES'], ['thunder', 'THUNDER'], ['bell', 'BELL'], ['steps', 'FOOTSTEPS'], ['rain', 'RAIN']];
  const PLAY = [['The knight rides up the hill\u2026', 'hooves'], ['A storm rolls over the Spire\u2026', 'thunder'], ['She knocks on the castle door\u2026', 'knock'], ['The church bell rings midnight\u2026', 'bell'], ['Someone walks down the hall\u2026', 'steps'], ['It starts to pour\u2026', 'rain'], ['The horse gallops away\u2026', 'hooves'], ['A second knock, louder\u2026', 'knock'], ['Thunder again, closer\u2026', 'thunder']];
  const SFXTIME = 8;
  GD.sfx = { strip: true, shot: () => [toW(6.2, 1.3, 6.0), 5.6, 3.0, 0.35, 4.5, Math.PI + 0.35, 8],
    begin() { goRoom(4.1, 5.8, Math.PI / 2); place(eng, 8.6, 5.0, -Math.PI / 2); J.list = [PLAY[0], ...shuffle(PLAY.slice(1, 6)), PLAY[8]].slice(0, 6); J.ci = 0; J.cueT = SFXTIME; J.wait = 0.4; J.anim = {}; snapK = true; this.draw(); },
    draw() { const c = J.list[J.ci]; if (!c) return;
      showStrip(stripHead('SOUND EFFECTS \u00b7 ' + (J.ci + 1) + ' / ' + J.list.length) + '<div style="padding:8px 12px 4px"><div style="font-size:11px;font-weight:900;color:#ec3013">THE KNIGHT OF THE SPIRE \u00b7 SCRIPT</div><div style="font-size:18px;font-weight:900;line-height:1.2;text-wrap:balance">' + c[0] + ' <span style="background:#ffd23a;padding:0 6px">[SOUND]</span></div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div>'
        + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:8px 12px 10px">' + SFXN.map(([k, n]) => '<button data-s="' + k + '" style="' + BTN + ';min-height:50px;font-size:13px">' + n + '</button>').join('') + '</div>' + tipBar('TAP THE SOUND THE SCRIPT NEEDS'));
      STRIP.querySelectorAll('[data-s]').forEach(b => { b.onclick = () => this.pick(b.dataset.s, b); }); J.idle = 0; J.hinted = false; },
    pick(k, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; SFXS[k] && SFXS[k](); J.anim[k] = 1.2; if (k !== c[1]) { missOne('WRONG SOUND \u00b7 THE ACTORS LOOK UP'); shake(el); return; }
      addGold(4); el.style.background = '#201e1d'; el.style.color = '#ffd23a'; J.wait = 1.4; setTimeout(() => this.next(), 1300); },
    next() { if (!J || J.g !== 'sfx') return; J.ci++; J.cueT = SFXTIME; J.wait = 0; if (J.ci >= J.list.length) { STRIP.style.display = 'none'; addGold(6); setTimeout(finishGame, 400); return; } this.draw(); },
    tick(dt, t) { J.idle = (J.idle || 0) + dt; if (!(J.wait > 0) && J.ci < J.list.length) { J.cueT -= dt; timeBar(STRIP.querySelector('[data-time]'), J.cueT / SFXTIME, J.cueT < 3); if (J.cueT <= 0) { missOne('SILENCE \u00b7 THE SCENE MOVES ON'); this.next(); } }
      if (J.idle > 3 && !J.hinted && J.list[J.ci]) { J.hinted = true; pulse(STRIP.querySelector('[data-s="' + J.list[J.ci][1] + '"]')); }
      for (const k in J.anim) J.anim[k] = Math.max(0, J.anim[k] - dt); const a = J.anim;
      FP.knock.rotation.y = -(a.knock || 0) * 0.25 * Math.abs(Math.sin(t * 20)); FP.thunder.rotation.x = (a.thunder || 0) * 0.12 * Math.sin(t * 30); FP.bell.rotation.z = (a.bell || 0) * 0.5 * Math.sin(t * 9);
      FP.hooves.position.y = 1.0 + (a.hooves || 0) * 0.08 * Math.abs(Math.sin(t * 18)); FP.rain.rotation.x = (a.rain || 0) * 0.6 * Math.sin(t * 3); FP.steps.position.y = 1.13 + (a.steps || 0) * 0.02 * Math.abs(Math.sin(t * 16));
      if (lastFox) { const any = Object.values(a).some(v => v > 0); armUp(lastFox, 1, any ? 1.0 + Math.sin(t * 16) * 0.3 : 0.4, -0.8); } kit.animFox(eng, dt, 0, false); } };
  // ---------- 6 MIXING DESK (panel): three faders; keep every meter in the green ----------
  const MIXT = 40, GLO = 0.45, GHI = 0.75, CH = ['DJ VOICE', 'GUEST', 'MUSIC'], EVT = [[0, 'THE DJ GETS EXCITED', 1.45], [1, 'THE GUEST WHISPERS', 0.55], [2, 'A LOUD SONG STARTS', 1.4], [1, 'THE GUEST LAUGHS', 1.5], [0, 'THE DJ MUMBLES', 0.6], [2, 'A QUIET SONG', 0.6]];
  GD.mix = { panel: true, shot: () => [toW(-8.0, 1.6, -0.5), 4.6, 3.0, 0.2, 4.0, Math.PI / 2, 7],
    begin() { goRoom(-6.1, 0.6, -Math.PI / 2); J.fd = [0.6, 0.6, 0.6]; J.src = [1, 1, 1]; J.tgt = [1, 1, 1]; J.red = [0, 0, 0]; J.left = MIXT; J.okT = 0; J.evT = 4; J.ev = shuffle(EVT); J.ei = 0; snapK = true; this.draw(); },
    lv(i) { return clamp(J.fd[i] * J.src[i] * (0.94 + 0.06 * Math.sin(J.t * 13 + i * 2)), 0, 1); },
    draw() { const wide = innerWidth > innerHeight;
      showPanel(panelHead('MIXING DESK', J.gold ? J.gold + ' G' : 'MERU RADIO') + '<div style="flex:none;padding:8px 10px 0"><div style="font-size:11px;font-weight:900;color:#ec3013">SHOW TIME</div><div data-time style="height:8px;background:#201e1d;width:100%"></div><div data-ev style="font-size:15px;font-weight:900;min-height:20px;margin-top:4px"></div></div>'
        + '<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;padding:10px;box-sizing:border-box">' + CH.map((n, i) => '<div style="display:flex;flex-direction:column;gap:6px;min-height:0"><div style="font-size:13px;font-weight:900">' + n + '</div><div style="flex:1;min-height:120px;display:flex;gap:8px">'
          + '<div data-meter="' + i + '" style="position:relative;width:' + (wide ? 26 : 18) + 'px;background:#2c2f33;border:2px solid #201e1d"><div style="position:absolute;left:0;right:0;bottom:' + (GLO * 100) + '%;height:' + ((GHI - GLO) * 100) + '%;background:rgba(63,154,94,0.55)"></div><div data-lv style="position:absolute;left:3px;right:3px;bottom:0;height:0;background:#7cff9b"></div></div>'
          + '<div data-fader="' + i + '" style="position:relative;flex:1;background:#e8e6e2;border:2px solid #201e1d;touch-action:none;cursor:ns-resize"><div style="position:absolute;left:50%;top:6px;bottom:6px;width:4px;margin-left:-2px;background:#201e1d"></div><div data-knob style="position:absolute;left:6px;right:6px;height:34px;margin-top:-17px;background:#ec3013;border:2px solid #201e1d"></div></div></div>'
          + '<div data-st="' + i + '" style="font-size:12px;font-weight:900;padding:3px 6px;background:#201e1d;color:#7cff9b">GOOD</div></div>').join('') + '</div>' + tipBar('SLIDE THE RED FADERS \u00b7 KEEP THE BARS IN THE GREEN'));
      PANEL.querySelectorAll('[data-fader]').forEach(el => { const i = +el.dataset.fader; const set = e => { const r = el.getBoundingClientRect(); J.fd[i] = clamp(1 - (e.clientY - r.top - 6) / (r.height - 12), 0, 1) * 1.1; J.idle = 0; };
        el.addEventListener('pointerdown', e => { e.preventDefault(); el.setPointerCapture && el.setPointerCapture(e.pointerId); el._drag = true; set(e); }); el.addEventListener('pointermove', e => { if (el._drag) set(e); }); const up = () => { el._drag = false; }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); });
      J.idle = 0; J.hinted = false; this.paint(); },
    paint() { for (let i = 0; i < 3; i++) { const l = this.lv(i), m = PANEL.querySelector('[data-meter="' + i + '"] [data-lv]'), k = PANEL.querySelector('[data-fader="' + i + '"] [data-knob]'), s = PANEL.querySelector('[data-st="' + i + '"]'); if (m) { m.style.height = (l * 100).toFixed(1) + '%'; m.style.background = l > GHI ? '#ff2a1a' : l < GLO ? '#9aa0a6' : '#7cff9b'; }
        if (k) k.style.top = 'calc(6px + ' + ((1 - clamp(J.fd[i] / 1.1, 0, 1)) * 100).toFixed(1) + '% - ' + ((1 - clamp(J.fd[i] / 1.1, 0, 1)) * 12).toFixed(1) + 'px)'; if (s) { const t = l > GHI ? 'TOO LOUD \u00b7 DOWN' : l < GLO ? 'TOO QUIET \u00b7 UP' : 'GOOD'; if (s.textContent !== t) { s.textContent = t; s.style.color = l > GHI ? '#ff8a6a' : l < GLO ? '#f3f2f2' : '#7cff9b'; } } } },
    tick(dt) { J.idle = (J.idle || 0) + dt; J.left -= dt; timeBar(PANEL.querySelector('[data-time]'), J.left / MIXT, J.left < 6);
      if ((J.evT -= dt) <= 0 && J.left > 4) { const e = J.ev[J.ei++ % J.ev.length]; J.tgt[e[0]] = e[2]; J.evT = 5.5; const ev = PANEL.querySelector('[data-ev]'); if (ev) ev.textContent = e[1] + ' \u00b7 ' + CH[e[0]]; setTimeout(() => { if (J && J.g === 'mix') J.tgt[e[0]] = 0.9 + Math.random() * 0.25; }, 3800); }
      let allOk = true; for (let i = 0; i < 3; i++) { J.src[i] += (J.tgt[i] - J.src[i]) * Math.min(1, dt * 0.9); const l = this.lv(i), bad = l > GHI || l < GLO; if (bad) { allOk = false; J.red[i] += dt; if (J.red[i] > 2.6) { J.red[i] = 0; missOne(CH[i] + (l > GHI ? ' TOO LOUD' : ' TOO QUIET')); J.fd[i] = (GLO + GHI) / 2 / J.src[i]; } } else J.red[i] = 0; }
      if (allOk) { J.okT += dt; if (J.okT >= 4) { J.okT = 0; addGold(2); } } this.paint(); drawVU([0, 1, 2].map(i => this.lv(i)));
      if (J.idle > 3 && !J.hinted) { const b = [0, 1, 2].find(i => { const l = this.lv(i); return l > GHI || l < GLO; }); if (b != null) { J.hinted = true; pulse(PANEL.querySelector('[data-fader="' + b + '"] [data-knob]')); } }
      if (J.left <= 0) { addGold(6); hidePanel(); finishGame(); } kit.animFox(eng, dt, 0, false); } };
  // ---------- 7 SONG REQUEST (panel, at the record library): hear the hum, find the record with the same tune ----------
  const HUMMERS = ['KIA', 'OTTO', 'MARLA', 'PELL', 'FLICK', 'NELL', 'GEARS'], REQT = 16, REQN = 5;
  GD.request = { panel: true, shot: () => [toW(9.0, 2.2, -1.6), 4.0, 3.6, 0.1, 4.0, -Math.PI / 2, 7],
    begin() { goRoom(7.6, -1.0, Math.PI / 2); place(eng, 7.4, 1.4, Math.PI * 0.8); J.list = pickN([0, 1, 2, 3, 4, 5, 6, 7], REQN).map((s, i) => ({ s, who: HUMMERS[(i + Math.floor(Math.random() * 7)) % 7], opts: shuffle([s, ...pickN([0, 1, 2, 3, 4, 5, 6, 7].filter(x => x !== s), 2)]) })); J.ci = 0; J.cueT = REQT; J.wait = 0.5; snapK = true; this.draw(); setTimeout(() => this.hum(), 500); },
    hum() { const c = J && J.g === 'request' && J.list[J.ci]; if (c) playTune(c.s, 0.32, 0.06, 'sine'); },
    draw() { const c = J.list[J.ci]; if (!c) return; const s = SONGS[c.s];
      showPanel(panelHead('SONG REQUEST \u00b7 ' + (J.ci + 1) + ' / ' + J.list.length, J.gold ? J.gold + ' G' : 'MERU RADIO') + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto">'
        + '<div style="border:2px solid #201e1d;padding:6px 10px;display:flex;flex-direction:column;gap:4px"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><div><div style="font-size:11px;font-weight:900;color:#ec3013">' + c.who + ' HUMS</div><div style="font-size:16px;font-weight:900">\u201cIt goes like this\u2026\u201d</div></div><button data-hum style="' + BTN + ';min-height:44px;flex:none">HUM AGAIN</button></div>' + graph(s.m, INK, 58) + '<div data-time style="height:8px;background:#201e1d;width:100%"></div></div>'
        + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px">' + c.opts.map(o => '<button data-o="' + o + '" style="' + BTN + ';display:flex;flex-direction:column;gap:4px;padding:6px"><span style="display:block;width:100%;background:' + SONGS[o].c + ';height:6px"></span>' + graph(SONGS[o].m, INK, 58) + '<span style="font-size:12px">' + SONGS[o].t + '</span></button>').join('') + '</div></div>' + tipBar('FIND THE RECORD WITH THE SAME SHAPE'));
      PANEL.querySelector('[data-hum]').onclick = () => this.hum(); PANEL.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => this.pick(+b.dataset.o, b); }); J.idle = 0; J.hinted = false; },
    pick(o, el) { const c = J.list[J.ci]; if (!c || J.wait > 0) return; if (o !== c.s) { missOne('NOT THAT ONE \u00b7 LISTEN AGAIN'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; }
      addGold(4); el.style.background = '#201e1d'; el.style.color = '#ffd23a'; playTune(o, 0.2, 0.05, 'triangle'); J.wait = 2; setTimeout(() => this.next(), 1800); },
    next() { if (!J || J.g !== 'request') return; J.ci++; J.cueT = REQT; J.wait = 0.4; if (J.ci >= J.list.length) { addGold(6); hidePanel(); setTimeout(finishGame, 300); return; } this.draw(); setTimeout(() => this.hum(), 400); },
    tick(dt) { J.idle = (J.idle || 0) + dt; if (J.wait > 0) J.wait -= dt; else if (J.ci < J.list.length) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / REQT, J.cueT < 4); if (J.cueT <= 0) { missOne('THE LISTENER GAVE UP \u00b7 NEXT'); this.next(); } }
      if (J.idle > 4 && !J.hinted && J.list[J.ci]) { J.hinted = true; pulse(PANEL.querySelector('[data-o="' + J.list[J.ci].s + '"]')); } kit.animFox(eng, dt, 0, false); } };
  // ---------- 8 TRAFFIC REPORT (ride the train loop from the cab, tap the jams, then read them out) ----------
  const LINE = (L.TRAIN && L.TRAIN.line) || [], RAILY = 10.6, RIDEV = 14, JAMS = [130, 280, 430];
  const CUM = [0]; for (let i = 1; i <= LINE.length; i++) { const a = LINE[i - 1], b = LINE[i % LINE.length]; CUM.push(CUM[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); } const LLEN = CUM[CUM.length - 1] || 1;
  const lineAt = s => { s = ((s % LLEN) + LLEN) % LLEN; let i = 0, lo = 0, hi = LINE.length; while (lo < hi) { const m = (lo + hi) >> 1; if (CUM[m + 1] < s) lo = m + 1; else hi = m; } i = lo; const a = LINE[i], b = LINE[(i + 1) % LINE.length], u = (s - CUM[i]) / ((CUM[i + 1] - CUM[i]) || 1); return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]; };
  const nearS = (x, z) => { let b = 0, bd = 1e18; for (let i = 0; i < LINE.length; i++) { const d = (LINE[i][0] - x) ** 2 + (LINE[i][1] - z) ** 2; if (d < bd) { bd = d; b = i; } } return CUM[b]; };
  const segD = (x, z, p) => { let d = 1e9; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [bx, bz] = p[k + 1], vx = bx - ax, vz = bz - az, l2 = vx * vx + vz * vz || 1, u = clamp(((x - ax) * vx + (z - az) * vz) / l2, 0, 1); d = Math.min(d, Math.hypot(x - ax - vx * u, z - az - vz * u)); } return d; };
  const LINEC = LINE.length ? [...LINE, LINE[0]] : [];
  const STOPN = (L.TRAIN && L.TRAIN.stops || []).map(k => { const c = L.TRAIN.stopAt && L.TRAIN.stopAt[k], b = (L.BUILDINGS || []).find(q => q.key === k); return c ? { k, c: c.c, n: ((b && b.label) || k).toUpperCase() } : null; }).filter(Boolean);
  const BLDN = (L.BUILDINGS || []).filter(b => b.f && b.label && !/station/i.test(b.label)).map(b => ({ n: b.label.toUpperCase(), c: [(b.f[0] + b.f[1]) / 2, (b.f[2] + b.f[3]) / 2] })).concat((L.CLUSTER_BUILDINGS || []).filter(c => c.D && c.title).map(c => ({ n: c.title, c: [c.D.x, c.D.z] })));
  const landOf = (x, z) => (BLDN.slice().sort((a, b) => Math.hypot(a.c[0] - x, a.c[1] - z) - Math.hypot(b.c[0] - x, b.c[1] - z))[0] || { n: 'TOWN SQUARE' }).n;
  const placeOf = (x, z) => (STOPN.slice().sort((a, b) => Math.hypot(a.c[0] - x, a.c[1] - z) - Math.hypot(b.c[0] - x, b.c[1] - z))[0] || { n: 'TOWN' }).n;
  const CARC = ['#ec3013', '#2e86b8', '#ffd23a', '#f3f2f2', '#3f9a5e', '#201e1d', '#c084fc'];
  function jamAt(bx, bz) { let best = null, bd = 1e9; for (const R of L.ROADS || []) { const p = R.p || []; for (let k = 0; k < p.length - 1; k++) { const [ax, az] = p[k], [cx, cz] = p[k + 1], len = Math.hypot(cx - ax, cz - az); if (len < 8) continue; for (let s = 4; s < len - 4; s += 6) { const x = ax + (cx - ax) * s / len, z = az + (cz - az) * s / len, d = Math.hypot(x - bx, z - bz); if (d < 16 || d > 60 || d >= bd || segD(x, z, LINEC) < 9) continue; bd = d; best = [x, z, (cx - ax) / len, (cz - az) / len]; } } } return best; }
  const cabEl = document.createElement('div'); cabEl.style.cssText = 'position:fixed;inset:0;z-index:6;pointer-events:none;display:none;box-sizing:border-box;border:16px solid #201e1d;border-bottom-width:54px';
  cabEl.innerHTML = '<div style="position:absolute;left:50%;top:0;bottom:0;width:10px;margin-left:-5px;background:#201e1d"></div><div style="position:absolute;left:0;right:0;bottom:-46px;height:40px;display:flex;align-items:center;gap:12px;padding:0 12px;font:900 13px Archivo,sans-serif;color:#ffd23a"><span style="background:#ec3013;color:#fff;padding:3px 8px">MERU METRO \u00b7 CAB</span><span data-cab></span></div>'; document.body.appendChild(cabEl);
  GD.traffic = { tap3d: true,
    begin() { if (LINE.length < 3 || !D0) { stop(); return; } J.s0 = nearS(D0.x, D0.z); J.s = 0; J.end = JAMS[JAMS.length - 1] + 70; J.ride = true; J.jams = [];
      for (const js of JAMS) { const [bx, bz] = lineAt(J.s0 + js), r = jamAt(bx, bz), [nx, nz] = lineAt(J.s0 + js + 5), tx = (nx - bx) || 1, tz = nz - bz, tl = Math.hypot(tx, tz) || 1; const x = r ? r[0] : bx - tz / tl * 26, z = r ? r[1] : bz + tx / tl * 26, dx = r ? r[2] : tx / tl, dz = r ? r[3] : tz / tl;
        const g = new THREE.Group(), S = mk(), y = terrainAt(x, z) || 0; g.position.set(x, y, z); g.rotation.y = Math.atan2(dx, dz); for (let k = -2; k <= 2; k++) { const c = CARC[(k + 2 + JAMS.indexOf(js) * 2) % CARC.length], zz = k * 5.4; S.box(2.0, 0.9, 4.2, c, 0, 0.75, zz); S.box(1.7, 0.7, 2.2, c === '#201e1d' ? '#3d3b3a' : '#cfd5da', 0, 1.5, zz - 0.2); for (const sx of [-1, 1]) for (const sz of [-1.3, 1.3]) S.cyl(0.36, 0.36, 0.3, INK, sx * 0.95, 0.36, zz + sz, 10, 0, Math.PI / 2); }
        S.mesh(g); const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: bangT, depthTest: false, transparent: true })); tag.scale.set(2.4, 3.6, 1); tag.position.y = 7; tag.renderOrder = 5; g.add(tag); const haz = [-2, 0, 2].map(k => { const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowT, color: '#ffb020', transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); h.scale.setScalar(2.2); h.position.set(0, 1.4, k * 5.4 + 2.2); g.add(h); return h; });
        g.traverse(o => { o.userData.noCull = true; }); scene.add(g); J.objs.push(g); J.jams.push({ s: js, x, z, y, g, tag, haz, spotted: false, passed: false, seen: 0, place: landOf(x, z) }); }
      J.camP = V(); J.camL = V(); J.camInit = false; this.follow(0); snapK = true; toast('ALL ABOARD \u00b7 TAP EVERY TRAFFIC JAM', 2.4); },
    follow(dt) { const [x, z] = lineAt(J.s0 + J.s); if (lastFox) lastFox.visible = false; go(x, Math.max(0, terrainAt(x, z) || 0), z, 0); },
    tap(x, y) { if (!J.ride) return; J.idle = 0; const hit = J.jams.filter(j => !j.spotted && !j.passed).sort((a, b) => pdAt(a.tag.getWorldPosition(V()), x, y) - pdAt(b.tag.getWorldPosition(V()), x, y))[0]; if (!hit) return;
      const cars = hit.g.position.clone().add(V(0, 1.4, 0)); if (Math.min(pdAt(hit.tag.getWorldPosition(V()), x, y), pdAt(cars, x, y)) > RAD() * 2.6) return;
      hit.spotted = true; hit.tag.material.map = okT; hit.tag.material.needsUpdate = true; addGold(4); ding(); toast('JAM SPOTTED \u00b7 NEAR ' + hit.place, 2); },
    camFix(cam, dt) { const [x, z] = lineAt(J.s0 + J.s), [lx, lz] = lineAt(J.s0 + J.s + 40); const p = V(x, RAILY, z), l = V(lx, RAILY - 5, lz); if (!J.camInit || snapK) { J.camP.copy(p); J.camL.copy(l); J.camInit = true; } const k = Math.min(1, dt * 3); J.camP.lerp(p, k); J.camL.lerp(l, k);
      if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; if (cam.fov !== 80) { cam.fov = 80; cam.updateProjectionMatrix(); } } cam.position.copy(J.camP); cam.lookAt(J.camL); },
    tick(dt, t) { J.idle = (J.idle || 0) + dt; if (J.ride) { J.s += RIDEV * dt; this.follow(dt); J.next = placeOf(...lineAt(J.s0 + J.s + 60));
        for (const j of J.jams) { j.haz.forEach((h, i) => { h.material.opacity = (Math.sin(t * 8 + i) > 0 ? 1 : 0.15); }); if (j.spotted || j.passed) continue; const ahead = j.s - J.s; if (ahead < 150 && ahead > -10) j.seen += dt; if (ahead < -18) { j.passed = true; missOne('MISSED A JAM'); j.tag.visible = false; } }
        if (J.s >= J.end) { J.ride = false; this.read(); } } else if (J.ri != null) { J.cueT -= dt; timeBar(PANEL.querySelector('[data-time]'), J.cueT / 10, J.cueT < 3); if (J.cueT <= 0 && !(J.wait > 0)) { missOne('TOO SLOW \u00b7 NEXT JAM'); this.nextRead(); } if (J.wait > 0) J.wait -= dt;
        if (J.idle > 3 && !J.hinted && J.rl[J.ri]) { J.hinted = true; pulse(PANEL.querySelector('[data-o="' + J.rl[J.ri].place + '"]')); } } },
    hint() { if (!J.ride) return null; const j = J.jams.find(q => !q.spotted && !q.passed && q.seen > 2.2); return j ? [j.tag.getWorldPosition(V()), 'TAP THE JAM'] : null; },
    card() { const sp = J.jams.filter(j => j.spotted); return { key: 'r' + J.ride + sp.length + J.jams.filter(j => j.passed).length + (J.next || ''), right: sp.length + ' / ' + JAMS.length, next: J.ride ? 'TAP EVERY JAM YOU SEE' : 'READ IT OUT', body: '<div style="font-size:12px;font-weight:900;margin-top:6px">MERU METRO \u00b7 NEXT STOP ' + (J.next || '') + '</div>' + steps(J.jams.map((j, i) => ['JAM ' + (i + 1), j.spotted])) + tipH('ENGINEER', 'Look ahead. Jams have yellow flags.') }; },
    read() { fade(() => { cabEl.style.display = 'none'; if (lastFox) lastFox.visible = true; lensOff(camera); goRoom(-4.6, 6.6, Math.PI); snapK = true; J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = [];
      J.rl = J.jams.filter(j => j.spotted); J.ri = 0; J.cueT = 10; if (!J.rl.length) { finishGame(); return; } this.drawRead(); }); },
    drawRead() { const j = J.rl[J.ri]; if (!j) return; const others = pickN([...new Set([...J.jams.map(q => q.place), ...pickN(BLDN, 8).map(b => b.n)])].filter(n => n !== j.place), 2), opts = shuffle([j.place, ...others]);
      showPanel(panelHead('TRAFFIC REPORT \u00b7 ON AIR', J.gold ? J.gold + ' G' : 'MERU RADIO') + '<div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;padding:10px;box-sizing:border-box;overflow:auto"><div style="border:2px solid #201e1d;padding:6px 10px"><div style="font-size:11px;font-weight:900;color:#ec3013">JAM ' + (J.ri + 1) + ' OF ' + J.rl.length + '</div><div style="font-size:20px;font-weight:900;line-height:1.15">\u201cTraffic is slow near\u2026\u201d</div><div data-time style="height:8px;background:#201e1d;margin-top:6px;width:100%"></div></div>'
        + '<div style="display:flex;flex-direction:column;gap:8px">' + opts.map(o => '<button data-o="' + o + '" style="' + BTN + ';font-size:17px">' + o + '</button>').join('') + '</div></div>' + tipBar('WHERE WAS IT? THE TOAST TOLD YOU'));
      PANEL.querySelectorAll('[data-o]').forEach(b => { b.onclick = () => this.pickRead(b.dataset.o, b); }); J.idle = 0; J.hinted = false; },
    pickRead(o, el) { const j = J.rl[J.ri]; if (!j || J.wait > 0) return; if (o !== j.place) { missOne('WRONG PLACE \u00b7 DRIVERS GO THE WRONG WAY'); shake(el); el.disabled = true; el.style.opacity = '0.4'; return; } addGold(3); ding(); J.wait = 0.4; this.nextRead(); },
    nextRead() { J.ri++; J.cueT = 10; if (J.ri >= J.rl.length) { addGold(6); hidePanel(); finishGame(); return; } this.drawRead(); } };
  // ================= RECORD LIBRARY (browse any time) =================
  let libOpen = false; function openLibrary() { libOpen = true; const pk = pickToday();
    showPanel(panelHead('RECORD LIBRARY \u00b7 THE EIGHT SONGS', 'TAP TO PLAY') + '<div style="flex:1;min-height:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;padding:10px;box-sizing:border-box;overflow:auto;align-content:start">'
      + SONGS.map((s, i) => '<button data-p="' + i + '" style="' + BTN + ';display:flex;flex-direction:column;gap:4px;padding:6px"><span style="display:block;width:100%;background:' + s.c + ';height:6px"></span>' + graph(s.m, INK, 40) + '<span style="font-size:13px">' + s.t + '</span><span style="font-size:11px;font-weight:800;color:#5a5550">' + s.g + (s.j != null ? ' \u00b7 JUKEBOX A' + (s.j + 1) : ' \u00b7 RADIO ONLY') + (pk === i ? ' \u00b7 YOUR PICK' : '') + '</span></button>').join('') + '</div>' + tipBar('THE SHAPE IS THE TUNE \u00b7 STOP TO CLOSE'));
    PANEL.querySelector('[data-stop]').onclick = () => { libOpen = false; hidePanel(); }; PANEL.querySelectorAll('[data-p]').forEach(b => { b.onclick = () => { playTune(+b.dataset.p, 0.24, 0.05); pulse(b); }; }); }
  // ================= PRIZES =================
  const JACKET = { outfit: 'coat', torso: ['#201e1d', '#ec3013', '#111111'], name: 'DJ JACKET' };
  const jacketOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === JACKET.name); };
  const GIFT = { jacket: ['Your own DJ JACKET and headphones. The Tailor keeps a copy.', 'dj'], radio: ['A POCKET RADIO. Use it from your bag. Eight songs, anywhere.', 'se'], juke: ['You have the request line now. Ask me, the Tavern jukebox plays it.', 'dj'],
    pick: ['Pick tomorrow\u2019s song. I will play it all day. Promise.', 'dj'], voice: ['Your voice is on the town radio now. Listen out on the street.', 'se'], all: ['All eight jobs. The GOLD RECORD, and 60 gold. Radio legend.', 'dj'] };
  function giveGift() { save.setStat('mrdClears', save.stat('mrdClears', 0) + 1); const nd = GAMES.filter(q => done()[q.k]).length;
    if (!save.stat('mrdJacket', false)) { save.setStat('mrdJacket', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === JACKET.name)) save.setStat('tailorOutfits', [...list, JACKET]); save.setOutfit(JACKET); wear && wear(JACKET); return 'jacket'; }
    if (nd >= 2 && !save.stat('mrdRadio', false)) { save.setStat('mrdRadio', true); save.give('pocketRadio'); return 'radio'; }
    if (nd >= 3 && !save.stat('mrdJuke', false)) { save.setStat('mrdJuke', true); return 'juke'; }
    if (nd >= 4 && !save.stat('mrdPickOn', false)) { save.setStat('mrdPickOn', true); return 'pick'; }
    if (nd >= 6 && !save.stat('mrdVoice', false)) { save.setStat('mrdVoice', true); return 'voice'; }
    if (nd >= GAMES.length && !save.stat('mrdAll', false)) { save.setStat('mrdAll', true); save.give('goldRecord'); save.addGold(60); return 'all'; } return null; }
  const pickToday = () => { const p = save.stat('mrdPick', null); return p && p.d === today() ? p.i : -1; };
  function pickSong(after) { sayTo(T_DJ, [{ ...djLn('Which one plays all day tomorrow?'), choices: [...SONGS.map((s, i) => ({ text: s.t, pick: () => { save.setStat('mrdPick', { i, d: today() + 1 }); save.setStat('mrdPickSet', today()); playTune(i, 0.2, 0.05); sayTo(T_DJ, [djLn(s.t + ', all day tomorrow. Your name on it.')], after); } })), { text: CHOICE_BYE, bye: true, pick: () => after && after() }] }]); }
  function requestSong() { sayTo(T_DJ, [{ ...djLn('Request line open. Which song for the Tavern?'), choices: [...SONGS.filter(s => s.j != null).map(s => ({ text: 'A' + (s.j + 1) + ' \u00b7 ' + s.t, pick: () => { let ok = false; try { if (jukebox && jukebox.play) { jukebox.play(s.j); ok = true; } } catch (e) {} save.setStat('mrdReqN', save.stat('mrdReqN', 0) + 1); sayTo(T_DJ, [djLn(ok ? 'Done! ' + s.t + ' is playing at the Tavern right now.' : 'Sent. The Tavern will play ' + s.t + '.')]); } })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]); }
  let wornP = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.head) return; const on = jacketOn(); if (wornP && wornP.on === on && wornP.fox === fox && (!wornP.m || wornP.m.parent === P.head)) return; if (wornP && wornP.m && wornP.m.parent) wornP.m.parent.remove(wornP.m); wornP = { on, fox, m: on ? phonesOn(fox, RED) : null }; }
  // POCKET RADIO (item): play the next song, notes float up around you
  let radN = 0; const notes = []; const noteT = CT(64, 64, (g, W) => { g.fillStyle = '#fff'; g.strokeStyle = INK; g.lineWidth = 5; g.font = '900 54px Archivo, sans-serif'; g.textBaseline = 'middle'; g.strokeText('\u266a', 14, 34); g.fillText('\u266a', 14, 34); });
  function useRadio() { if (!lastP) return false; const i = radN++ % 8, s = SONGS[i]; playTune(i, 0.24, 0.06); const v = V(); if (lastFox) lastFox.getWorldPosition(v); else v.set(lastP.x, lastP.y || 0, lastP.z);
    for (let k = 0; k < 6; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteT, color: s.c, transparent: true, depthTest: false })); sp.scale.setScalar(0.45); sp.position.copy(v).add(V(rnd(-0.8, 0.8), 1.6 + rnd(0, 0.6), rnd(-0.8, 0.8))); sp.renderOrder = 6; scene.add(sp); notes.push({ s: sp, t: 2.2 + k * 0.15, y: sp.position.y }); }
    toast('MERU RADIO \u00b7 ' + s.t + ' \u00b7 ' + s.g, 2.6); return true; }
  function useItem(id) { if (id === 'pocketRadio' && save.count('pocketRadio')) { if (busy === 'job') return false; return useRadio(); } if (id === 'goldRecord' && save.count('goldRecord')) { toast('THE GOLD RECORD \u00b7 EIGHT FOR EIGHT AT MERU RADIO', 2.4); return true; } return false; }
  // TOWN RADIO TICKER (look extra): out in town, Meru Radio talks about what you did
  const TICK = { dj: 'THAT SMOOTH MORNING MIX? OUR NEW DJ.', calls: 'THANKS TO OUR NEW CALL TAKER. NOT ONE MOO.', night: 'TONIGHT\u2019S ADS, READ IN A LOVELY LOW VOICE.', weather: 'THE WEATHER, STRAIGHT FROM MERU TV. READ BY A ROOKIE.', sfx: 'THE KNIGHT OF THE SPIRE \u00b7 SOUND BY OUR NEW FOLEY ARTIST.', mix: 'CLEAN SOUND ALL SHOW. NEW HANDS ON THE DESK.', request: 'YOUR REQUESTS, FOUND BY OUR NEW LIBRARIAN.', traffic: 'TRAFFIC FROM THE TRAIN, BY OUR NEW REPORTER.' };
  let tickT = 70; function townTicker(dt, P) { if (busy || !save.stat('mrdClears', 0)) return; if ((tickT -= dt) > 0) return; tickT = 160; const last = save.stat('mrdLast', null), pk = pickToday(), voice = save.stat('mrdVoice', false);
    const lines = []; if (pk >= 0) lines.push('NOW PLAYING \u00b7 ' + SONGS[pk].t + ' \u00b7 PICKED BY YOU'); if (last && TICK[last.g]) lines.push(TICK[last.g]); if (voice) lines.push('AND NOW AN AD, READ BY YOU: \u201c' + ADS[today() % ADS.length].split('.')[0] + '.\u201d');
    if (lines.length) toast('\u25cf MERU RADIO \u00b7 ' + lines[Math.floor(Math.random() * lines.length)], 3.6); }
  // lobby NOW PLAYING screen + fan mail board
  let npKey = ''; function drawNP() { const pk = pickToday(), air = !!(busy && J), last = save.stat('mrdLast', null), i = pk >= 0 ? pk : today() % 8, key = [pk, air, J && J.g, last && last.g, save.stat('mrdVoice', false)].join('|'); if (key === npKey) return; npKey = key; const g = npT.userData.c.getContext('2d'), W = 512, H = 296, s = SONGS[i];
    g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = air ? '#ff2a1a' : RED; g.fillRect(0, 0, W, 50); g.fillStyle = '#fff'; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(air ? '\u25cf ON AIR \u00b7 ' + GN[J.g].name.toUpperCase() : 'MERU RADIO \u00b7 98.8 FM', 16, 26);
    g.fillStyle = YEL; g.font = '900 22px Archivo, sans-serif'; g.fillText('NOW PLAYING', 18, 86); g.fillStyle = '#fff'; g.font = '900 38px Archivo, sans-serif'; let fs = 38; while (g.measureText(s.t).width > W - 36 && fs > 18) { fs -= 2; g.font = '900 ' + fs + 'px Archivo, sans-serif'; } g.fillText(s.t, 18, 128);
    g.font = '800 22px Archivo, sans-serif'; g.fillText(s.g + (pk >= 0 ? ' \u00b7 PICKED BY YOU' : ''), 18, 166); g.fillStyle = s.c; for (let k = 0; k < 8; k++) g.fillRect(18 + k * 30, 236 - s.m[k] * 6, 22, 14);
    g.fillStyle = '#9aa0a6'; g.font = '800 18px Archivo, sans-serif'; g.fillText(save.stat('mrdVoice', false) ? 'TONIGHT \u00b7 THE NIGHT SHOW, WITH YOU' : 'TRAFFIC ON THE HOUR \u00b7 WEATHER AT HALF PAST', 18, H - 22); npT.needsUpdate = true; }
  let mailKey = ''; function drawMail() { const d = done(), key = Object.keys(d).sort().join(',') + pickToday(); if (key === mailKey) return; mailKey = key; const g = mailT.userData.c.getContext('2d'), W = 640, H = 400;
    g.fillStyle = '#b08a5a'; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(0, 0, W, 50); g.fillStyle = '#fff'; g.font = '900 28px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('FAN MAIL \u00b7 REQUESTS', 16, 26);
    const base = ['DEAR DJ, PLAY SPACE HORSE. FOR MY CAT.', 'MORE TRAFFIC, LESS TALKING. \u2014 A BUS', 'WHO DOES THE THUNDER? SCARY! 10/10', 'PLEASE SAY HI TO MY GRAN.'];
    const yours = GAMES.filter(q => d[q.k]).map(q => ({ dj: 'THE NEW DJ IS GREAT! DROPS ON THE ONE.', calls: 'YOU PUT ME ON AIR! HI MUM! \u2014 PELL', night: 'THAT LOW VOICE! I SLEPT LIKE A LOG.', weather: 'YOU SAID RAIN. IT RAINED. HERO.', sfx: 'THE HOOVES SOUNDED SO REAL.', mix: 'FINALLY I CAN HEAR THE GUEST.', request: 'YOU FOUND MY SONG FROM A HUM!', traffic: 'YOUR TRAFFIC TIP SAVED MY DAY.' })[q.k]);
    const list = [...yours.reverse(), ...base].slice(0, 6); list.forEach((t, i) => { const x = 18 + (i % 3) * 204, y = 66 + Math.floor(i / 3) * 164, mine = i < yours.length; g.save(); g.translate(x + 92, y + 72); g.rotate(((hash(i + 5) % 7) - 3) * 0.02); g.fillStyle = mine ? '#fffbe0' : PAPER; g.fillRect(-92, -72, 184, 144); g.fillStyle = RED; g.fillRect(-8, -80, 16, 16);
      g.fillStyle = INK; g.font = '800 17px Archivo, sans-serif'; const words = t.split(' '); let line = '', yy = -50; for (const w of words) { const tl = line ? line + ' ' + w : w; if (g.measureText(tl).width > 164) { g.fillText(line, -82, yy); line = w; yy += 22; } else line = tl; } g.fillText(line, -82, yy); if (mine) { g.fillStyle = RED; g.font = '900 13px Archivo, sans-serif'; g.fillText('ABOUT YOU', -82, 56); } g.restore(); });
    mailT.needsUpdate = true; }
  // ================= run a job =================
  const INTRO = { dj: 'Take the decks! Drop the next song right on the ONE. Big button, big moment.', calls: 'Phones are ringing! Put the right caller on air. Read fast.', night: 'Night show. Hold the mic to read the ad. Let go at every red dot.', weather: 'Meru TV sent the forecast. Read it on air, region by region.',
    sfx: 'Radio play tonight. When the script needs a sound, make it. Quickly.', mix: 'Keep all three meters in the green. Slide the faders. Gently.', request: 'A listener hums a song. Find the record with the same tune.', traffic: 'Ride the train cab. Tap every traffic jam, then read them out.' };
  const DONE = { dj: 'Smooth drops! The whole Spire is dancing. Even the robots.', calls: 'Great calls! Not one moo on air.', night: 'Lovely low voice. Very night show. Very relaxing.', weather: 'Forecast read perfectly. Meru TV will be jealous.',
    sfx: 'The knight, the storm, the bell. I believed every one.', mix: 'Green all show. You have good ears.', request: 'Right records, happy listeners. Song four next, obviously.', traffic: 'Clear report. The whole town knows where not to drive.' };
  const nextOf = who => { const d = done(), list = GAMES.filter(q => !who || q.who === who), n = list.find(q => !d[q.k]); return (n || list.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  let introT = 0; function startGame(g) { if (busy) return; if (libOpen) { libOpen = false; hidePanel(); } busy = 'intro'; introT = 0; const [T, l] = giver(g); sayTo(T, [l(INTRO[g])], () => begin(g)); }
  function begin(g) { if (busy !== 'intro') return; save.setStat('mrdVisits', save.stat('mrdVisits', 0) + 1); J = { g, miss: 0, gold: 0, objs: [], cols: [], t: 0 }; busy = 'job'; ding(); npKey = ''; fade(() => GD[g].begin()); }
  function finishGame() { if (!J || busy !== 'job') return; const g = J.g, stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('mrdDone', d); save.setStat('mrdLast', { g, s: stars, d: today() }); const gift = giveGift(); busy = 'end'; hidePanel(); STRIP.style.display = 'none'; hideCard(); HINT.style.display = 'none'; npKey = ''; mailKey = '';
    const [T, l] = giver(g); const say = () => { const L1 = [l(DONE[g] + (stars === 3 ? ' Three stars.' : ''))]; if (gift) { const [txt, who] = GIFT[gift]; L1.push((who === 'se' ? seLn : djLn)(txt)); } K.finish(g, stars, gold, first);
      sayTo(T, L1, () => { if (gift === 'pick') pickSong(() => { if (busy === 'end') { busy = null; J = null; } }); else if (busy === 'end') { busy = null; J = null; } }); };
    fade(() => { cleanup(); const se = GN[g].who === 'se'; goRoom(se ? -5.8 : 0, se ? -1.6 : -4.6, se ? -Math.PI / 2 : Math.PI); snapK = true; endClear = 6; setTimeout(say, 400); });
    setTimeout(() => { if (busy === 'end') { busy = null; J = null; } }, 30000); }
  function cleanup() { if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.objs = []; J.cols.forEach(c => { const i = cols.indexOf(c); if (i >= 0) cols.splice(i, 1); }); J.cols = []; } hidePanel(); STRIP.style.display = 'none'; hideCard(); HINT.style.display = 'none'; cabEl.style.display = 'none'; if (lastFox) lastFox.visible = true;
    place(dj, DJ0[0], DJ0[1], DJ0[2]); place(eng, SE0[0], SE0[1], SE0[2]); lampMs.forEach(m => m.material.color.set('#4a1410')); FP.knock.rotation.y = 0; FP.thunder.rotation.x = 0; FP.bell.rotation.z = 0; }
  function stop() { const away = J && J.g === 'traffic'; cleanup(); busy = null; J = null; npKey = ''; if (away) fade(() => goRoom(0, 7.2, Math.PI)); }
  function quit() { if (busy === 'intro') { busy = null; return; } if (!J || busy === 'end') return; stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ================= camera (job shots) =================
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { if (busy === 'job' && J && J.g === 'traffic' && J.ride && !fading) { GD.traffic.camFix(cam, dt); snapK = false; return; }
    const v = busy === 'job' && J && !fading && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on || snapK) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(snapK ? camT.pos : cam.position); } snapK = false; const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(clamp(camCur.pos.x, OX - 9.5, OX + 9.5), clamp(camCur.pos.y, LY + 0.6, LY + RH - 0.4), clamp(camCur.pos.z, LZ - 9.5, LZ + 9.5)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ================= hint hand (3D: traffic jams) =================
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT);
  const hintTick = t => { const g = jobOn() && GD[J.g].hint ? GD[J.g] : null, h = g ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; HINT.lastChild.textContent = h[1]; };
  // ================= talk + prompt =================
  const inRoom = P => !!P && Math.abs(P.x - OX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const inLobby = P => !!P && Math.abs(P.x - LOX) < 10.4 && Math.abs(P.z - LZ) < 10.4 && Math.abs((P.y || 0) - LY) < 8;
  const nearL = (p, x, z, r) => Math.hypot(p.x - x, p.z - z) < r;
  const ringAt = p => GAMES.find(q => nearL(p, RINGS[q.k][0], RINGS[q.k][1], 1.05));
  const nearDJ = p => nearL(p, 0, -5.8, 1.3) || nearL(p, 0, -3.6, 1.0) || nearL(p, dj.position.x, dj.position.z, 1.6), nearSE = p => nearL(p, -6.2, -1.7, 1.3) || nearL(p, eng.position.x, eng.position.z, 1.8);
  const atLib = p => nearL(p, 7.9, -4.2, 1.6) || nearL(p, 8.0, 1.8, 1.0), atMail = p => nearL(p, -8.6, 5.4, 1.6), atWire = p => nearL(p, 6.4, -7.4, 1.0);
  function prompt(P) { if (busy) return null; if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; return nearL(p, LDOOR[0], LDOOR[1], 1.6) ? 'STUDIO \u00b7 COME IN' : nearL(p, GEO.RW / 2 - 1.4, -3.6, 1.8) ? 'NOW PLAYING \u00b7 MERU RADIO' : null; }
    if (!inRoom(P)) return null; const p = toL(P); if (nearL(p, SDOOR[0], SDOOR[1], 1.5)) return 'LOBBY \u00b7 MERU RADIO'; const r = ringAt(p); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase();
    if (K.atHiring(p)) return 'NOW HIRING \u00b7 START WORK'; if (nearDJ(p)) return 'TALK \u00b7 MORNING DJ'; if (nearSE(p)) return 'TALK \u00b7 SOUND ENGINEER';
    if (atLib(p)) return 'RECORD LIBRARY \u00b7 BROWSE'; if (atMail(p)) return 'FAN MAIL \u00b7 READ'; if (atWire(p)) return 'METEO WIRE \u00b7 TODAY'; return null; }
  let talkD = save.stat('mrdTalkedD', 0), talkE = save.stat('mrdTalkedE', 0);
  const DJ_HI = ['Back on the air! Indoor voice. I am trying.', 'Eight songs, one DJ, zero sleep.', 'You again! The listeners asked about you. Twice.'];
  const SE_HI = ['Talk in the green, not the red.', 'The desk is older than me. Kinder, too.', 'Back? Good ears are rare.'];
  function djMenu() { const first = !talkD; talkD++; save.setStat('mrdTalkedD', talkD); const mine = GAMES.filter(q => q.who === 'dj'), ch = [{ text: CHOICE_WORK, pick: () => startGame(nextOf('dj')) },
      { text: 'PICK A JOB', pick: () => sayTo(T_DJ, [{ ...djLn('Which one?'), choices: [...mine.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'PLAY MY SONG?', pick: () => { playTune(3, 0.22, 0.05); sayTo(T_DJ, [djLn('Hum it. Mm. That is song four. Coming up after the traffic.')]); } }];
    if (save.stat('mrdJuke', false)) ch.push({ text: 'REQUEST A SONG (TAVERN)', pick: requestSong });
    if (save.stat('mrdPickOn', false) && save.stat('mrdPickSet', 0) !== today()) ch.push({ text: 'PICK TOMORROW\u2019S SONG', pick: () => pickSong() });
    ch.push({ text: CHOICE_BYE, bye: true, pick: () => sayTo(T_DJ, [djLn('Stay tuned, Meru!')]) });
    sayTo(T_DJ, [{ ...djLn(first ? 'GOOOOD morning! Morning DJ, Meru Radio. Want to work in radio? I have four jobs.' : DJ_HI[(talkD - 2) % DJ_HI.length]), choices: ch }]); }
  function seMenu() { const first = !talkE; talkE++; save.setStat('mrdTalkedE', talkE); const mine = GAMES.filter(q => q.who === 'se');
    sayTo(T_SE, [{ ...seLn(first ? 'Sound engineer. Shh. I have four quiet jobs, if you can be quiet.' : SE_HI[(talkE - 2) % SE_HI.length]), choices: [{ text: CHOICE_WORK, pick: () => startGame(nextOf('se')) },
      { text: 'PICK A JOB', pick: () => sayTo(T_SE, [{ ...seLn('Which one?'), choices: [...mine.map(q => ({ text: (done()[q.k] ? '\u2713 ' : '') + q.name.toUpperCase(), pick: () => startGame(q.k) })), { text: CHOICE_BYE, bye: true, pick: () => {} }] }]) },
      { text: 'WHAT IS THE GREEN?', pick: () => sayTo(T_SE, [seLn('Green is good. Red is loud. Grey is asleep. Like the DJ at noon.')]) },
      { text: CHOICE_BYE, bye: true, pick: () => sayTo(T_SE, [seLn('Quietly, please.')]) }] }]); }
  function talk(P) { lastP = P; if (busy === 'job') return true; if (busy) return false; if (libOpen) { libOpen = false; hidePanel(); return true; }
    if (inLobby(P)) { const p = { x: P.x - LOX, z: P.z - LZ }; if (nearL(p, LDOOR[0], LDOOR[1], 1.6)) { fade(() => { goRoom(0, 7.2, Math.PI); }); K.chime(); return true; } if (nearL(p, GEO.RW / 2 - 1.4, -3.6, 1.8)) { const i = pickToday() >= 0 ? pickToday() : today() % 8; playTune(i, 0.24, 0.05); toast('NOW PLAYING \u00b7 ' + SONGS[i].t, 2.4); return true; } return false; }
    if (!inRoom(P)) return false; const p = toL(P);
    if (nearL(p, SDOOR[0], SDOOR[1], 1.5)) { fade(() => { go(LOX + LDOOR[0], LY, LZ + LDOOR[1] + 1.2, 0); }); return true; }
    const r = ringAt(p); if (r) { startGame(r.k); return true; } if (K.atHiring(p)) { ding(); startGame(nextOf(null)); return true; }
    if (nearDJ(p)) { tone(1320, 0.05, 0.5); djMenu(); return true; } if (nearSE(p)) { tone(990, 0.05, 0.5); seMenu(); return true; }
    if (atLib(p)) { openLibrary(); return true; } if (atMail(p)) { toast('FAN MAIL \u00b7 ' + (Object.keys(done()).length ? 'SOME OF IT IS ABOUT YOU' : 'WORK HERE AND THE LETTERS START'), 2.4); return true; }
    if (atWire(p)) { const fc = forecast(); toast('METEO WIRE \u00b7 ' + REG.map(r => r[1] + ' ' + fc[r[0]]).join(' \u00b7 ') + ' \u00b7 ' + temp() + '\u00b0', 3.4); return true; }
    return false; }
  // ================= per frame =================
  let dayCheck = 0, airOn = null, pickPlayed = -1, wasIn = false;
  function tick(dt, P, fox) { const t = performance.now() / 1000; lastP = P; lastFox = fox; toastT -= dt; endClear -= dt; applyWear(fox);
    const inR = inRoom(P), inL = inLobby(P); G.visible = inR || busy === 'job'; LG.visible = inL; if (OG.children.length) { OG.visible = !!BT && Math.hypot(P.x - BT.x, P.z - BT.z) < (touch ? 260 : 420); if (OG.visible && mastLamp) { const on = (t % 1.6) < 0.5; mastLamp.visible = on; OG.userData.lb.material.color.set(on ? '#ff2a1a' : '#4a1410'); } }
    if ((dayCheck -= dt) <= 0) { dayCheck = 1.5; if (inL) drawNP(); if (inR) { drawMail(); goldWall.visible = !!save.stat('mrdAll', false); } }
    if (inR && !wasIn && !busy) { const pk = pickToday(); if (pk >= 0 && pickPlayed !== today()) { pickPlayed = today(); setTimeout(() => playTune(pk, 0.24, 0.05), 900); toast('ON AIR \u00b7 ' + SONGS[pk].t + ' \u00b7 PICKED BY YOU', 2.6); } } wasIn = inR;
    if (!inR && !inL) townTicker(dt, P);
    const air = !!(busy === 'job' && J); if (air !== airOn) { airOn = air; airSigns.forEach(m => { m.material.map = air ? AIR_ON : AIR_OFF; m.material.needsUpdate = true; }); npKey = ''; }
    if (busy === 'intro' && (introT += dt) > 25) busy = null;
    if (busy === 'job' && J && !fading) { J.t += dt; const D = GD[J.g]; try { D.tick && D.tick(dt, t); } catch (e) { console.warn('radio job: ' + (e && e.stack || e)); stop(); }
      if (J && D.card && J.ri == null) { const c = D.card(); setCard(J.g + c.key + J.miss + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), c.right || (J.gold ? J.gold + ' G' : 'MERU RADIO')) + foot(c.next, true) + '<div style="padding:4px 10px 8px">' + c.body + '</div>'); } else if (J && J.ri != null) hideCard(); }
    hintTick(t);
    for (let i = notes.length - 1; i >= 0; i--) { const n = notes[i]; n.t -= dt; n.s.position.y = n.y + (2.4 - n.t) * 0.5; n.s.material.opacity = clamp(n.t, 0, 1); if (n.t <= 0) { scene.remove(n.s); notes.splice(i, 1); } }
    if (G.visible) { const job = busy === 'job' && J;
      for (const k in ringMeshes) { const m = ringMeshes[k]; m.visible = !busy; m.scale.setScalar(1 + 0.06 * Math.sin(t * 3 + RINGS[k][0])); }
      if (!(job && J.g === 'dj')) RECS.forEach((r, i) => { r.rotation.z -= dt * (i ? 1.2 : 3.5); });
      if (!(job && J.g === 'mix') && inR) { const b = n => 0.35 + 0.25 * Math.abs(Math.sin(t * (2.1 + n) + n * 1.7) * Math.sin(t * (5.3 + n * 0.6))); if (((t * 10) | 0) !== drawVU._f) { drawVU._f = (t * 10) | 0; drawVU([b(0), b(1), b(2)]); } }
      if (!(job && J.g === 'calls')) lampMs.forEach((m, i) => m.material.color.set(Math.sin(t * 0.7 + i * 1.9) > 0.92 ? '#ff2a1a' : '#4a1410'));
      if (!(job && (J.g === 'mix' || J.g === 'sfx' || J.g === 'request'))) { kit.animFox(eng, dt, 0, false); if (!busy) { const p = toL(P), dd = Math.hypot(p.x - eng.position.x, p.z - eng.position.z), want = dd < 4.5 ? Math.atan2(p.x - eng.position.x, p.z - eng.position.z) : SE0[2] + Math.sin(t * 0.4) * 0.25; let df = want - eng.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); eng.rotation.y += df * Math.min(1, dt * 3); } } }
    K.tick(dt, toL(P), { inShop: inR, busy: !!busy, near: inR ? 0 : 99, talking: busy === 'job', clear: endClear > 0 ? [0, -4.6, 2.6] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, useItem, busy: () => (busy === 'job' ? busy : null), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, GD, RINGS, room: SR, lobby: LR, start: g => startGame(g), _begin: g => { busy = 'intro'; begin(g); }, _state: () => ({ busy, g: J && J.g, fading }),
    spawn: { radiostudio: [OX, LZ + 7.2, Math.PI, LY], radio: D0 ? [...OUTW(0, 11), D0.ry, 0] : null }, SONGS, forecast, finish: () => finishGame(), useRadio, openLibrary, pickSong, requestSong, dj, eng, mast: OG,
    tap(x, y) { if (jobOn()) GD[J.g].tap(x, y); }, scr: v => scrW(v), hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null),
    _view(p, l, fov = 60) { const c = new THREE.PerspectiveCamera(fov, innerWidth / innerHeight, 0.1, 600); c.position.copy(toW(...p)); c.lookAt(toW(...l)); c.updateMatrixWorld(); const v = G.visible; G.visible = true; renderer.render(scene, c); G.visible = v; return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _mastView() { if (!BT) return null; const [x, z] = OUTW(0, 70); const c = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 1200); c.position.set(x, 30, z); c.lookAt(BT.x, (terrainAt(BT.x, BT.z) || 0) + BT.h * 0.8, BT.z); c.updateMatrixWorld(); OG.visible = true; renderer.render(scene, c); return renderer.domElement.toDataURL('image/jpeg', 0.8); },
    _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) if (J && lastP) tick(dt, lastP, lastFox); },
    dispose() { card.remove(); HINT.remove(); PANEL.remove(); STRIP.remove(); cabEl.remove(); K.dispose(); } };
  window.__radio = API; return API;
}
