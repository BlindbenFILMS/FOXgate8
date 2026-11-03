// FOXY TAILORS (s361): Ben's 2D game (minigames/dsf/logic/foxy-tailors.js) played ON GAROK'S CUTTING TABLE, rules 1:1
// (4 orders shirt / pants / dress / coat, CUT 20 s: shears down the chalk, tol 6.6/6/5.4/4.8, a tear per move off the chalk;
// SEW 26 s: hold to run, the feed pulls sideways (pull 2.1/2.95/3.8 alternating), steer against it, release at each corner
// (legT >= 0.76, clean < 0.12), speed 30/34/38/42; PRESS 17 s: hold the iron, fill each dial into the green band, scorch at 114;
// stage scores as the 2D, the order = their average, the 2D workroom loop through the station mixer).
// In 3D: a cutting mat set into the deep counter, real SHEARS that snip open and shut, a long-arm SEWING MACHINE that rises
// out of the counter while the CLOTH FEEDS UNDER THE NEEDLE (the machine head drifts sideways with the pull), a flat IRON
// with steam, then the garment folds into a parcel and flies to the customer, a real fox who walked in and waits at the end.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function polyInfo(pts) { const segs = []; let total = 0; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 0.001; segs.push({ a, b, dx, dy, len, at: total, ang: Math.atan2(dy, dx) }); total += len; } return { pts, segs, total }; }
function projOn(info, x, y) { let best = { dist: 1e9, t: 0, ang: 0 }; info.segs.forEach(s => { const u = clamp(((x - s.a[0]) * s.dx + (y - s.a[1]) * s.dy) / (s.len * s.len), 0, 1), px = s.a[0] + s.dx * u, py = s.a[1] + s.dy * u, d = Math.hypot(x - px, y - py); if (d < best.dist) best = { dist: d, t: (s.at + u * s.len) / info.total, ang: s.ang }; }); return best; }
function upTo(info, t) { const L = clamp(t, 0, 1) * info.total, out = [info.segs[0].a]; for (const s of info.segs) { if (s.at + s.len <= L) out.push(s.b); else { const u = clamp((L - s.at) / s.len, 0, 1); if (u > 0.001) out.push([s.a[0] + s.dx * u, s.a[1] + s.dy * u]); break; } } return out; }
function blank(label, box, cut, keepSide) { const [x0, y0, x1, y1] = box, rev = cut.slice().reverse(); let keep, off, away;
  if (keepSide === 'h-below') { keep = cut.concat([[x1, y1], [x0, y1]]); off = rev.concat([[x0, y0], [x1, y0]]); away = [0, -11]; }
  else if (keepSide === 'h-above') { keep = cut.concat([[x1, y0], [x0, y0]]); off = rev.concat([[x0, y1], [x1, y1]]); away = [0, 11]; }
  else if (keepSide === 'v-left') { keep = cut.concat([[x0, y1], [x0, y0]]); off = rev.concat([[x1, y0], [x1, y1]]); away = [12, 0]; }
  else { keep = cut.concat([[x1, y1], [x1, y0]]); off = rev.concat([[x0, y0], [x0, y1]]); away = [-12, 0]; }
  return { label, box, cut, keep, off, away, info: polyInfo(cut) }; }
const GARMENTS = {
  shirt: { name: 'Shirt', fill: '#6e8fb8', stroke: '#3f5d80', pieces: [blank('FRONT', [16, 58, 62, 120], [[44, 58], [48, 88], [40, 120]], 'v-left'), blank('SLEEVE', [72, 58, 128, 120], [[72, 86], [100, 78], [128, 92]], 'h-below'), blank('COLLAR', [138, 58, 184, 120], [[138, 76], [160, 70], [184, 74]], 'h-above')],
    sil: [[74, 64], [92, 64], [100, 70], [108, 64], [126, 64], [146, 84], [132, 96], [126, 88], [126, 120], [74, 120], [74, 88], [68, 96], [54, 84]], shade: [[100, 70], [108, 64], [126, 64], [146, 84], [132, 96], [126, 88], [126, 120], [100, 120]],
    seam: [[80, 72], [120, 72], [122, 114], [80, 114]], zones: [[100, 74, 8, 'YOKE'], [80, 102, 8, 'FRONT'], [120, 108, 8, 'HEM']] },
  pants: { name: 'Pants', fill: '#6f7a45', stroke: '#4a5228', pieces: [blank('LEG A', [16, 58, 62, 120], [[36, 58], [30, 88], [44, 120]], 'v-right'), blank('LEG B', [72, 58, 128, 120], [[106, 58], [112, 86], [98, 120]], 'v-left'), blank('WAISTBAND', [138, 58, 184, 120], [[138, 80], [160, 74], [184, 80]], 'h-above')],
    sil: [[76, 62], [124, 62], [128, 76], [120, 120], [106, 120], [100, 92], [94, 120], [80, 120], [72, 76]], shade: [[100, 62], [124, 62], [128, 76], [120, 120], [106, 120], [100, 92]],
    seam: [[82, 74], [100, 92], [118, 74], [120, 112]], zones: [[100, 70, 8, 'WAIST'], [84, 100, 8, 'LEG A'], [116, 100, 8, 'LEG B']] },
  dress: { name: 'Dress', fill: '#b8566b', stroke: '#7d2f42', pieces: [blank('BODICE', [16, 58, 62, 120], [[16, 96], [40, 102], [62, 90]], 'h-above'), blank('SKIRT', [72, 58, 128, 120], [[86, 58], [98, 90], [120, 120]], 'v-right'), blank('STRAP', [138, 58, 184, 120], [[138, 72], [160, 66], [184, 76]], 'h-above')],
    sil: [[80, 62], [92, 62], [100, 68], [108, 62], [120, 62], [124, 84], [142, 120], [58, 120], [76, 84]], shade: [[100, 68], [108, 62], [120, 62], [124, 84], [142, 120], [100, 120]],
    seam: [[86, 76], [114, 76], [130, 114], [70, 114]], zones: [[100, 72, 8, 'BODICE'], [80, 108, 8, 'SKIRT L'], [120, 108, 8, 'SKIRT R']] },
  coat: { name: 'Coat', fill: '#b98a4e', stroke: '#7d5828', pieces: [blank('BODY', [12, 58, 52, 120], [[34, 58], [38, 88], [28, 120]], 'v-left'), blank('LAPEL', [56, 58, 96, 120], [[74, 58], [70, 86], [84, 120]], 'v-right'), blank('SLEEVE', [100, 58, 140, 120], [[100, 90], [120, 96], [140, 82]], 'h-below'), blank('POCKET', [144, 58, 184, 120], [[144, 78], [164, 72], [184, 78]], 'h-above')],
    sil: [[72, 62], [92, 62], [100, 68], [108, 62], [128, 62], [148, 82], [138, 94], [130, 88], [130, 122], [70, 122], [70, 88], [62, 94], [52, 82]], shade: [[100, 68], [108, 62], [128, 62], [148, 82], [138, 94], [130, 88], [130, 122], [100, 122]],
    seam: [[76, 70], [124, 70], [126, 98], [126, 118], [76, 118]], zones: [[100, 74, 8, 'COLLAR'], [80, 102, 8, 'PANEL'], [118, 110, 8, 'HEM']] } };
const ORDER = ['shirt', 'pants', 'dress', 'coat'];
// s363 PORTRAIT (upright, no 90° turn): the pieces sit in two rows so the camera can fit them across a narrow phone
const shiftPiece = (p, dx, dy) => { const m = pts => pts.map(([x, y]) => [x + dx, y + dy]); const q = { ...p, box: [p.box[0] + dx, p.box[1] + dy, p.box[2] + dx, p.box[3] + dy], cut: m(p.cut), keep: m(p.keep), off: m(p.off) }; q.info = polyInfo(q.cut); q.lblY = q.box[3] - 4.5; return q; };
for (const k of ORDER) { const g = GARMENTS[k], P = g.pieces, rowW = ps => ps.reduce((t, p) => t + p.box[2] - p.box[0], 0) + (ps.length - 1) * 10;
  const rows = [P.slice(0, 2), P.slice(2)]; g.piecesP = []; rows.forEach((ps, r) => { let x = 100 - rowW(ps) / 2; for (const p of ps) { g.piecesP.push(shiftPiece(p, x - p.box[0], (r ? 74 : 6) - p.box[1])); x += p.box[2] - p.box[0] + 10; } });
  const bx = g.piecesP.map(p => p.box); g.frameP = [Math.min(...bx.map(b => b[0])) - 5, 0, Math.max(...bx.map(b => b[2])) + 5, 140];
  const sx = g.sil.map(p => p[0]), sy = g.sil.map(p => p[1]); g.pressP = [Math.min(...sx) - 6, Math.min(...sy) - 6, Math.max(...sx) + 6, Math.min(140, Math.max(...sy) + 16)]; }
for (const k of ORDER) { const g = GARMENTS[k]; g.seamInfo = polyInfo(g.seam); g.legs = g.seamInfo.segs.map((s, i) => ({ a: s.a, len: s.len, ang: s.ang, dx: s.dx / s.len, dy: s.dy / s.len, px: -s.dy / s.len, py: s.dx / s.len, pull: (2.1 + (i % 3) * 0.85) * (i % 2 ? -1 : 1) })); }
const CUSTOMERS = [{ name: 'Yuzu', fur: '#ee7d24', dark: '#b8531a', inner: '#f9ecd9', cloth: '#1f3350', clothDark: '#16263c', outfit: 'coat' }, { name: 'Mochi', fur: '#dedcd6', dark: '#a8a6a0', inner: '#f6f4ef', cloth: '#4a3a5c', clothDark: '#332745', outfit: 'vest' },
  { name: 'Kuma', fur: '#9a6f4a', dark: '#6b4a2c', inner: '#d9bb96', cloth: '#3f5d47', clothDark: '#2b4232', outfit: 'suit' }, { name: 'Hana', fur: '#f0e6da', dark: '#bfae99', inner: '#f8f2ea', cloth: '#8f2b1e', clothDark: '#661a10', outfit: 'dress' }];
const SECONDS = { cut: 20, sew: 26, press: 17, serve: 0 };
const TITLES = { cut: 'CUT THE PIECES', sew: 'SEW THE SEAMS', press: 'PRESS THE GARMENT', serve: 'HAND IT OVER' };
const BAND = [{ lo: 56, hi: 98 }, { lo: 58, hi: 94 }, { lo: 60, hi: 92 }, { lo: 62, hi: 90 }], TOL = [6.6, 6, 5.4, 4.8], SEW_SPEED = [30, 34, 38, 42], SCORCH = 114;
const MUSIC = (() => { const scale = [57, 60, 62, 64, 67, 69, 72, 74, 76, 79], notes = [];
  [[0, 2], [0.5, 4], [1, 5], [2, 4], [3, 6], [4, 5], [5, 3], [6, 4], [7, 2], [8, 3], [8.5, 5], [9, 6], [10, 5], [11, 7], [12, 6], [13, 4], [14, 5], [15, 3], [16, 5], [16.5, 7], [17, 8], [18, 6], [19, 5], [20, 7], [21, 5], [22, 4], [23, 2], [24, 4], [24.5, 3], [25, 5], [26, 3], [27, 2], [28, 3], [29, 1], [30, 2], [31, 0]].forEach(p => notes.push({ b: p[0], m: scale[p[1]], d: 0.5, v: 'pluck' }));
  [0, 4, 8, 12, 16, 20, 24, 28].forEach(b => { notes.push({ b, m: 33, d: 0.46, v: 'bass' }); notes.push({ b: b + 2.5, m: 40, d: 0.3, v: 'bass' }); });
  for (let b = 0; b < 32; b += 0.5) notes.push({ b, m: b % 4 === 0 ? 88 : 94, d: 0.05, v: 'tick' }); return { notes, beats: 32, spb: 0.32 }; })();
const midiHz = m => 440 * Math.pow(2, (m - 69) / 12);

export function makeTailors(K, { group, OX, at, cust, door, audio, save, LOW, makeFox, animFox, portrait = () => false, hooks = {} }) {
  const { THREE, glowSprite, toon, basic } = K;
  const PW = 2.4, PH = 1.68, U = PW / 200, Y0 = 1.08, YC = Y0 + 0.012, RED = '#ec3013', GOLD = '#c9a24a', GREEN = '#8fe38f', INK = '#f3f2f2';
  const toL = (gx, gy) => [(gx / 200 - 0.5) * PW, (gy / 140 - 0.5) * PH];
  const root = new THREE.Group(); root.position.set(at.x, 0, at.z); group.add(root);
  const CU = { x: cust.x - at.x, z: cust.z - at.z }, DO = { x: door.x - at.x, z: door.z - at.z };
  const tx = cv => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const B = (w, h, d, mat, x, y, z, p = root) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); p.add(m); return m; };
  const CY = (r1, r2, h, mat, x, y, z, p = root, seg = 14) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); p.add(m); return m; };
  const flat = (geo, mat, x, y, z, p = root) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); p.add(m); return m; };
  const gold = toon(GOLD), chrome = toon('#d4d8de'), lacq = toon('#17141d'), plum = toon('#5a2a4a');
  // ---- the cutting mat (green, ruled), a gold frame let into the counter
  B(PW + 0.08, 0.012, PH + 0.08, gold, 0, Y0 + 0.002, 0);
  flat(new THREE.PlaneGeometry(PW, PH), toon('#ffffff', { map: tx(canvas(1024, 717, (c, w, h) => { const k = w / 200; c.fillStyle = '#1e3b30'; c.fillRect(0, 0, w, h);
    for (let x = 0; x <= 200; x += 5) { c.strokeStyle = x % 25 ? 'rgba(160,220,190,0.13)' : 'rgba(170,230,200,0.32)'; c.lineWidth = x % 25 ? 1 : 2; c.beginPath(); c.moveTo(x * k, 0); c.lineTo(x * k, h); c.stroke(); }
    for (let y = 0; y <= 140; y += 5) { c.strokeStyle = y % 25 ? 'rgba(160,220,190,0.13)' : 'rgba(170,230,200,0.32)'; c.lineWidth = y % 25 ? 1 : 2; c.beginPath(); c.moveTo(0, y * k); c.lineTo(w, y * k); c.stroke(); }
    c.strokeStyle = 'rgba(201,162,74,0.85)'; c.lineWidth = 3; for (let x = 0; x <= 200; x += 2.5) { const L = x % 25 ? (x % 5 ? 5 : 9) : 16; c.beginPath(); c.moveTo(x * k, 0); c.lineTo(x * k, L); c.stroke(); c.beginPath(); c.moveTo(x * k, h); c.lineTo(x * k, h - L); c.stroke(); } })) }), 0, Y0 + 0.009, 0);
  // ---- the cloth layer: everything you cut, sew and press is drawn here; in the sew stage it slides under the needle
  const CW = LOW ? 800 : 1100, CH = Math.round(CW * 0.7), SC = CW / 200, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH; const c = cv.getContext('2d'), tex = tx(cv);
  const cloth = flat(new THREE.PlaneGeometry(PW, PH), new THREE.MeshToonMaterial({ map: tex, transparent: true, alphaTest: 0.03, gradientMap: toon('#fff').gradientMap }), 0, YC, 0);
  const weave = (() => { const p = document.createElement('canvas'); p.width = p.height = 8; const q = p.getContext('2d'); q.strokeStyle = 'rgba(255,255,255,0.12)'; q.lineWidth = 1; q.beginPath(); q.moveTo(0, 8); q.lineTo(8, 0); q.stroke(); q.strokeStyle = 'rgba(0,0,0,0.12)'; q.beginPath(); q.moveTo(0, 4); q.lineTo(4, 0); q.moveTo(4, 8); q.lineTo(8, 4); q.stroke(); const pt = c.createPattern(p, 'repeat'); try { pt.setTransform(new DOMMatrix([1 / SC, 0, 0, 1 / SC, 0, 0])); } catch (e) {} return pt; })();
  // ---- SHEARS: two chrome blades on a gold screw, plum bows; the tip sits on the cut point
  const shears = new THREE.Group(); root.add(shears); const arms = [];
  for (const sd of [-1, 1]) { const arm = new THREE.Group(); arm.position.x = -0.13; shears.add(arm); arms.push(arm);
    const bs = new THREE.Shape(); bs.moveTo(0, 0); bs.lineTo(0.13, sd * 0.003); bs.lineTo(0.02, sd * 0.016); bs.closePath(); const bg = new THREE.ExtrudeGeometry(bs, { depth: 0.004, bevelEnabled: false }); bg.rotateX(Math.PI / 2); const bl = new THREE.Mesh(bg, chrome); bl.position.y = 0.006 + (sd > 0 ? 0.004 : 0); arm.add(bl);
    const sh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.006, 0.01), chrome); sh.position.set(-0.03, 0.007, sd * 0.01); sh.rotation.y = sd * 0.25; arm.add(sh);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.006, 6, 18), plum); bow.rotation.x = Math.PI / 2; bow.position.set(-0.07, 0.008, sd * 0.024); arm.add(bow); }
  CY(0.007, 0.007, 0.016, gold, -0.13, 0.009, 0, shears, 10);
  // ---- SEWING MACHINE: a black + gold long-arm; it rises out of the counter's back edge, the needle on the arm's south end
  const NEED = { x: 100, y: 84 }, [NX, NZ] = toL(NEED.x, NEED.y), PZ = -PH / 2 - 0.06, armL = NZ - PZ;
  const mach = new THREE.Group(); root.add(mach); const machIn = new THREE.Group(); mach.add(machIn);
  B(0.2, 0.04, 0.2, lacq, NX, Y0 + 0.02, PZ, machIn); B(0.13, 0.34, 0.13, lacq, NX, Y0 + 0.19, PZ, machIn); B(0.072, 0.085, armL, lacq, NX, Y0 + 0.31, PZ + armL / 2 - 0.03, machIn);
  B(0.012, 0.004, armL - 0.08, gold, NX, Y0 + 0.354, PZ + armL / 2 - 0.03, machIn); for (const sx of [-1, 1]) B(0.003, 0.01, armL - 0.08, gold, NX + sx * 0.037, Y0 + 0.32, PZ + armL / 2 - 0.03, machIn);
  B(0.085, 0.2, 0.1, lacq, NX, Y0 + 0.25, NZ - 0.055, machIn); B(0.087, 0.07, 0.006, chrome, NX, Y0 + 0.22, NZ - 0.004, machIn);
  const needle = new THREE.Group(); machIn.add(needle); CY(0.006, 0.006, 0.1, chrome, NX, Y0 + 0.14, NZ + 0.004, needle, 8); CY(0.0022, 0.0012, 0.06, toon('#f3f2f2'), NX, Y0 + 0.065, NZ + 0.004, needle, 6);
  B(0.03, 0.005, 0.045, chrome, NX, Y0 + 0.018, NZ + 0.01, machIn); CY(0.003, 0.003, 0.03, chrome, NX - 0.012, Y0 + 0.035, NZ + 0.004, machIn, 6);
  const wheel = CY(0.075, 0.075, 0.026, gold, NX + 0.08, Y0 + 0.3, PZ, machIn, 20); wheel.rotation.z = Math.PI / 2; B(0.006, 0.13, 0.012, lacq, 0, 0, 0, wheel);
  CY(0.012, 0.012, 0.05, toon(RED), NX + 0.03, Y0 + 0.4, PZ, machIn, 8);
  const lamp = glowSprite(NX, Y0 + 0.13, NZ + 0.02, 0xffe2b0, 0.16, 0.0, machIn);
  const dot = glowSprite(NX, YC + 0.004, NZ + 0.004, 0xff3a20, 0.05, 0, machIn); dot.material.depthTest = false; dot.renderOrder = 20;
  // ---- IRON: chrome sole plate, plum body, wooden grip; rests on its heel at the mat's east edge
  const iron = new THREE.Group(); root.add(iron); const ironIn = new THREE.Group(); iron.add(ironIn);
  { const sh = new THREE.Shape(); sh.moveTo(-0.05, 0.075); sh.lineTo(0.05, 0.075); sh.lineTo(0.05, -0.02); sh.quadraticCurveTo(0.035, -0.08, 0, -0.1); sh.quadraticCurveTo(-0.035, -0.08, -0.05, -0.02); sh.closePath();
    const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }); sg.rotateX(Math.PI / 2); const so = new THREE.Mesh(sg, chrome); so.position.y = 0.012; ironIn.add(so);
    const bg = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.006, bevelSegments: 2 }); bg.rotateX(Math.PI / 2); const bo = new THREE.Mesh(bg, plum); bo.scale.set(0.86, 1, 0.86); bo.position.y = 0.062; ironIn.add(bo);
    B(0.018, 0.018, 0.11, toon('#6a4428'), 0, 0.105, 0.01, ironIn); for (const z of [-0.035, 0.05]) B(0.012, 0.04, 0.012, toon('#6a4428'), 0, 0.08, z, ironIn); B(0.03, 0.006, 0.03, gold, 0, 0.066, 0.045, ironIn); }
  const hot = glowSprite(0, 0.01, 0, 0xff7a30, 0.22, 0, iron); const steam = []; for (let i = 0; i < 5; i++) steam.push({ sp: glowSprite(0, 0.1, 0, 0xffffff, 0.06, 0, iron), t: i / 5 });
  // ---- the folded parcel for the hand-over
  const parcel = new THREE.Group(); root.add(parcel); parcel.visible = false; const pFill = toon('#6e8fb8').clone(), pEdge = toon('#3f5d80').clone();
  B(0.36, 0.012, 0.28, toon('#efe6d8'), 0, 0.006, 0, parcel); for (let i = 0; i < 3; i++) B(0.3 - i * 0.012, 0.022, 0.22 - i * 0.008, i === 1 ? pEdge : pFill, 0, 0.024 + i * 0.022, 0, parcel); B(0.05, 0.075, 0.226, toon(GOLD), 0.06, 0.045, 0, parcel);
  // ---- the start ring in front of the counter + a big hanging sign (hidden while you work)
  const stZ = PH / 2 + 0.75, ring = flat(new THREE.RingGeometry(0.75, 0.95, 48), basic(RED, 0.95), 0, 0.04, stZ), ringF = flat(new THREE.CircleGeometry(0.75, 40), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.18, depthWrite: false }), 0, 0.035, stZ);
  const hang = new THREE.Group(); hang.position.set(0, 3.3, PH / 2 + 0.25); root.add(hang);
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.78), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 308, (cc, w, h) => { cc.fillStyle = '#140c18'; cc.fillRect(0, 0, w, h); cc.strokeStyle = '#b98ad8'; cc.lineWidth = 12; cc.strokeRect(6, 6, w - 12, h - 12); cc.textBaseline = 'middle'; cc.fillStyle = '#b98ad8'; cc.font = `900 116px ${FONT}`; cc.fillText('FOXY TAILORS', 40, 104); cc.fillStyle = INK; cc.font = `900 60px ${FONT}`; cc.fillText('STAND ON THE RED RING', 40, 222); })), toneMapped: false }));
    hang.add(sg); const bk = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.86, 0.04), lacq); bk.position.z = -0.03; hang.add(bk); for (const sx of [-1.1, 1.1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.8, 6), gold); r.position.set(sx, 1.3, -0.03); hang.add(r); } }

  // ---- sound through the station mixer
  let bus = null, mStart = 0, mBar = 0, noise = null, hold = null;
  const AC = () => audio.ctx && !audio.muted ? audio.ctx : null, OUT = ac => audio.master || ac.destination;
  function noiseBuf(ac) { if (!noise) { noise = ac.createBuffer(1, ac.sampleRate * 1.4, ac.sampleRate); const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noise; }
  function tone(freq, dur, gain, type, to) { const ac = AC(); if (!ac) return; const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime; o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(Math.max(20, to), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(OUT(ac)); o.start(t); o.stop(t + dur + 0.02); }
  function burst(o) { const ac = AC(); if (!ac) return; const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(), t = ac.currentTime; src.buffer = noiseBuf(ac); src.loop = true; f.type = o.type || 'bandpass'; f.Q.value = o.q == null ? 1 : o.q; f.frequency.setValueAtTime(o.f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(60, o.f1), t + o.dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.gain, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur); src.connect(f); f.connect(g); g.connect(OUT(ac)); src.start(t); src.stop(t + o.dur + 0.05); }
  function sfx(k) { if (k === 'snip') { burst({ f0: 3400, f1: 900, dur: 0.07, gain: 0.07, q: 2.4 }); tone(1400, 0.05, 0.03, 'triangle', 900); }
    else if (k === 'tear') burst({ f0: 900, f1: 260, dur: 0.2, gain: 0.075, q: 0.7 });
    else if (k === 'corner') tone(880, 0.08, 0.045, 'triangle', 620);
    else if (k === 'hiss') burst({ f0: 5200, f1: 2400, dur: 0.26, gain: 0.045, type: 'highpass', q: 0.6 });
    else if (k === 'good') [0, 4, 7].forEach((v, i) => setTimeout(() => tone(midiHz(72 + v), 0.16, 0.055, 'triangle'), i * 62));
    else if (k === 'bad') tone(170, 0.24, 0.075, 'square', 105);
    else if (k === 'stage') [0, 7].forEach((v, i) => setTimeout(() => tone(midiHz(69 + v), 0.2, 0.05, 'triangle'), i * 80));
    else if (k === 'serve') [0, 4, 7, 12].forEach((v, i) => setTimeout(() => tone(midiHz(72 + v), 0.24, 0.06, 'triangle'), i * 95));
    else if (k === 'whir') { tone(120, 0.5, 0.03, 'sawtooth', 240); burst({ f0: 400, f1: 900, dur: 0.5, gain: 0.03, q: 2 }); } }
  function startHold(kind) { const ac = AC(); if (!ac || hold) return; const src = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain(); src.buffer = noiseBuf(ac); src.loop = true; let lfo = null;
    if (kind === 'machine') { f.type = 'bandpass'; f.frequency.value = 260; f.Q.value = 3.2; g.gain.value = 0.05; lfo = ac.createOscillator(); const lg = ac.createGain(); lfo.frequency.value = 17; lg.gain.value = 0.04; lfo.connect(lg); lg.connect(g.gain); lfo.start(); }
    else { f.type = 'highpass'; f.frequency.value = 2600; g.gain.value = 0.028; }
    src.connect(f); f.connect(g); g.connect(OUT(ac)); src.start(); hold = { src, g, lfo }; }
  function stopHold() { if (!hold) return; try { hold.g.gain.value = 0; hold.src.stop(); hold.src.disconnect(); hold.g.disconnect(); if (hold.lfo) hold.lfo.stop(); } catch (e) {} hold = null; }
  function voice(nt, a0) { const ac = audio.ctx, g = ac.createGain(), o = ac.createOscillator(), dur = nt.d * MUSIC.spb; let peak = 0.03; if (nt.v === 'pluck') o.type = 'triangle'; else if (nt.v === 'bass') { o.type = 'sine'; peak = 0.045; } else { o.type = 'square'; peak = 0.012; }
    o.frequency.setValueAtTime(midiHz(nt.m), a0); g.gain.setValueAtTime(0.0001, a0); g.gain.exponentialRampToValueAtTime(peak, a0 + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, a0 + dur); o.connect(g); g.connect(bus); o.start(a0); o.stop(a0 + dur + 0.02); }
  function music() { const ac = AC(); if (!ac) return; if (!bus) { bus = ac.createGain(); bus.gain.value = 0.5; bus.connect(OUT(ac)); mStart = ac.currentTime + 0.1; mBar = 0; }
    const L = MUSIC.beats * MUSIC.spb; while (mStart + mBar * L < ac.currentTime + 0.7) { const base = mStart + mBar * L; MUSIC.notes.forEach(nt => { const a = base + nt.b * MUSIC.spb; if (a > ac.currentTime - 0.05) voice(nt, a); }); mBar++; } }
  function killMusic() { if (bus) { try { bus.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.15); const b = bus; setTimeout(() => { try { b.disconnect(); } catch (e) {} }, 800); } catch (e) {} } bus = null; }

  // ---- customers: real foxes walk in from the door, wait at the counter's end, take the parcel and walk out
  const pool = [], actors = [];
  function custFox(i) { let f = pool[i]; if (f) return f; const C = CUSTOMERS[i]; const fx = makeFox({ key: 'tlCust' + i, torso: [C.cloth, C.clothDark, '#14100c'], look: { fur: C.fur, furDark: C.dark, muzzle: C.inner, chin: C.inner, fluff: C.inner, snout: C.fur, paw: C.dark, tailBase: C.dark, tailMid: C.fur, tailTip: C.inner }, outfit: C.outfit, eyes: ['#38bdf8', '#38bdf8'], mood: 'neutral' });
    root.add(fx); fx.visible = false; return (pool[i] = fx); }
  function customerIn(i) { const fx = custFox(i); if (actors.some(a => a.c === fx && !a.gone)) return; fx.visible = true; actors.push({ c: fx, i, x: DO.x, z: DO.z, mode: 'in', mood: 'neutral', hop: 0, carry: false }); fx.position.set(DO.x, 0, DO.z); }
  const waiting = () => actors.find(a => a.mode === 'in' || a.mode === 'wait');
  function syncActors(dt, T) { for (let k = actors.length - 1; k >= 0; k--) { const a = actors[k], c2 = a.c; const [tx2, tz2] = a.mode === 'out' ? [DO.x, DO.z] : [CU.x, CU.z]; const dx = tx2 - a.x, dz = tz2 - a.z, d = Math.hypot(dx, dz);
      let spd = 0; if (d > 0.05 && a.mode !== 'wait') { const st = Math.min(d, dt * 2.3); a.x += dx / d * st; a.z += dz / d * st; spd = 2.3; a.face = Math.atan2(dx, dz); } else if (a.mode === 'in') a.mode = 'wait';
      if (a.mode === 'wait') a.face = Math.PI / 2; if (a.mode === 'out' && d <= 0.05) { c2.visible = false; actors.splice(k, 1); continue; }
      let df = (a.face || 0) - c2.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df)); c2.rotation.y += df * Math.min(1, dt * 8);
      a.hop = Math.max(0, a.hop - dt); c2.userData.mood = a.mood; animFox(c2, dt, spd); c2.position.set(a.x, a.hop > 0 ? Math.abs(Math.sin(a.hop * 9)) * 0.18 : 0, a.z); } }

  // ---- the game (the 2D rules)
  let s = null, overlay = 'intro', cardInfo = null, open = false, ending = false, dirty = true, drawT = 0, clock = 0, prW = null;
  let machK = 0, ironRest = 1, co = { x: 0, y: 0 }, latV = { x: 0, y: 0 }, fold = 0, flyT = -1, pullK = 0;
  const G = () => GARMENTS[s.spec.key], stage = () => s.stages[s.stageIndex], PC = () => portrait() ? G().piecesP : G().pieces;
  function fresh(round) { const r = round % 4, key = ORDER[r], g = GARMENTS[key];
    return { round, stages: ['cut', 'sew', 'press', 'serve'], stageIndex: 0, scores: {}, notes: [], timeLeft: SECONDS.cut, card: 1.4, cust: CUSTOMERS[round % 4], spec: { key, tol: TOL[r], speed: SEW_SPEED[r], band: BAND[r], forgive: 1 },
      prog: g.pieces.map(() => 0), cutDone: g.pieces.map(() => false), cutAt: g.pieces.map(() => 0), cutDevs: [], tears: 0, tearAt: [], activeCut: null, shear: null, snipK: 0,
      legIndex: 0, legT: 0, lat: 0, holding: false, stitch: [[]], latDevs: [], cornerErrs: [], overshoots: 0, sewDone: false, ptr: null, latAcc: 0,
      heat: g.zones.map(() => 0), scorched: g.zones.map(() => false), iron: null, ironing: false, handed: false, committed: -1 }; }
  function newRound(round) { s = fresh(round); overlay = null; cardInfo = null; fold = 0; flyT = -1; parcel.visible = false; pFill.color.set(G().fill); pEdge.color.set(G().stroke); customerIn(s.round % 4); dirty = true; }
  function note(t) { if (!s.notes.includes(t)) s.notes.push(t); }
  function commit(name, score) { if (s.committed === s.stageIndex) return; s.committed = s.stageIndex; const sc = Math.round(clamp(score, 0, 100)); sfx(sc >= 75 ? 'good' : sc >= 45 ? 'stage' : 'bad'); stopHold();
    s.scores[name] = sc; s.stageIndex++; const nx = stage(); s.timeLeft = SECONDS[nx] || 0; s.card = 1.4; s.activeCut = null; s.holding = false; s.ironing = false; hooks.stage && hooks.stage(sc);
    if (nx === 'sew') sfx('whir'); if (nx === 'serve') sfx('serve'); dirty = true; }
  function timeUp() { const st = stage(); if (st === 'cut') commit('Cutting', cutScore()); else if (st === 'sew') commit('Sewing', sewScore()); else if (st === 'press') commit('Pressing', pressScore()); }
  const avg = a => a.length ? a.reduce((p, q) => p + q, 0) / a.length : 0;
  function cutScore() { const g = G(), done = s.cutDone.filter(Boolean).length, need = g.pieces.length; if (!done && !s.cutDevs.length) { note('No cloth got cut.'); return 0; }
    if (done < need) note((need - done) + ' piece' + (need - done > 1 ? 's' : '') + ' never came free of the blank.');
    const dev = s.cutDevs.length ? avg(s.cutDevs) : 4, acc = clamp(100 - dev * 19 / s.spec.forgive, 0, 100); if (dev > 2.2) note('The shears wandered off the chalk. Ragged edges.'); if (s.tears) note(s.tears + ' tear' + (s.tears > 1 ? 's' : '') + ' in the cloth.');
    return (done / need) * 100 * 0.58 + acc * 0.42 - s.tears * 5; }
  function sewScore() { const g = G(), legs = g.legs.length, doneLegs = clamp(s.legIndex, 0, legs); if (!doneLegs && !s.latDevs.length) { note('Not a stitch went in.'); return 0; }
    if (doneLegs < legs) note('Only ' + doneLegs + ' of ' + legs + ' seams got sewn.');
    const dev = s.latDevs.length ? avg(s.latDevs) : 5, straight = clamp(100 - dev * 15 / s.spec.forgive, 0, 100); if (dev > 2.4) note('The stitch line wandered off the seam.');
    const cerr = s.cornerErrs.length ? avg(s.cornerErrs) : 0.3, corners = clamp(100 - cerr * 220, 0, 100); if (cerr > 0.14) note('Corners turned early or late. The seams do not meet square.');
    return (doneLegs / legs) * 100 * 0.42 + straight * 0.36 + corners * 0.22 - s.overshoots * 4; }
  function pressScore() { const g = G(), b = s.spec.band, lo = b.lo / s.spec.forgive, hi = b.hi * s.spec.forgive; let sum = 0, cold = 0;
    g.zones.forEach((z, i) => { const v = s.heat[i]; if (s.scorched[i]) { sum += 22; return; } if (v >= lo && v <= hi) sum += 100; else if (v < lo) { sum += (v / lo) * 74; if (v < lo * 0.5) cold++; } else sum += clamp(100 - (v - hi) * 1.8, 30, 100); });
    if (cold) note(cold + ' patch' + (cold > 1 ? 'es' : '') + ' left creased.'); const sc = s.scorched.filter(Boolean).length; if (sc) note(sc + ' scorch' + (sc > 1 ? 'es' : '') + ' on the finished garment.'); return sum / g.zones.length; }
  function pivot(lat, clean) { const g = G(); s.legIndex++; s.legT = 0; s.lat = lat * 0.25; s.holding = false; s.stitch.push([]); stopHold();
    if (s.legIndex >= g.legs.length) { s.sewDone = true; setTimeout(() => { if (s && stage() === 'sew') commit('Sewing', sewScore()); }, 60); } else if (clean) sfx('corner'); dirty = true; }
  const score = () => Math.round(avg(Object.values(s.scores)));
  const moodOf = v => v >= 90 ? 'Delighted' : v >= 80 ? 'Happy' : v >= 70 ? 'Satisfied' : v >= 60 ? 'Unconvinced' : v >= 50 ? 'Disappointed' : 'Asking for a refund';
  function handOver() { if (s.handed || fold < 0.95) return; s.handed = true; flyT = 0; const v = score(); sfx(v >= 70 ? 'good' : 'stage'); const a = waiting(); if (a) a.mood = v >= 80 ? 'happy' : v >= 60 ? 'neutral' : 'stern'; hooks.serve && hooks.serve(v); const me = s; setTimeout(() => { if (s === me && open) finish(); }, 1700); }
  function finish() { const g = G(), sc = score(), stars = sc >= 90 ? 3 : sc >= 75 ? 2 : 1, gold = [0, 10, 20, 30][stars], last = s.round % 4 === 3;
    const best = save.stat('dsfTailorBest', 0), isBest = save.best('dsfTailorBest', sc); save.addGold(gold); save.setStat('dsfTailorOrders', save.stat('dsfTailorOrders', 0) + 1); if (!save.flag('dsfTailorDone')) save.setFlag('dsfTailorDone');
    const col = v => v >= 75 ? GREEN : v >= 45 ? '#ffd23a' : RED;
    overlay = 'card'; cardInfo = { kicker: last ? 'Shop closed · ' + g.name : g.name + ' for ' + s.cust.name, title: sc + ' / 100', mood: s.cust.name + ' is ' + moodOf(sc).toLowerCase() + '.', stars, best: isBest ? 'NEW BEST' : 'BEST ' + Math.max(best, sc), gold: '+' + gold + ' G',
      rows: Object.keys(s.scores).map(k => ({ name: k, val: s.scores[k] + '', pct: s.scores[k] + '%', color: col(s.scores[k]) })), notes: s.notes.slice(0, 3), buttons: [last ? 'OPEN AGAIN TOMORROW' : 'NEXT CUSTOMER', 'LEAVE THE TABLE'] }; }

  function step(dt) { if (overlay || !s) return; const st = stage(); if (s.card > 0) { s.card -= dt; if (s.card <= 0) { s.card = 0; dirty = true; } return; }
    if (st === 'sew' && s.holding && !s.sewDone) { const g = G(), leg = g.legs[s.legIndex];
      if (leg) { const legT = s.legT + (s.spec.speed / leg.len) * dt, p = s.ptr ? { x: s.ptr.x - co.x, y: s.ptr.y - co.y } : null;
        const perp = p ? (p.x - leg.a[0]) * leg.px + (p.y - leg.a[1]) * leg.py : 0, wob = Math.sin(clock * 1000 / 520 + s.legIndex) * 1.1;
        const lat = clamp(s.lat + (leg.pull + wob + clamp(perp, -6, 6) * 1.7 / s.spec.forgive) * dt, -9, 9);
        s.latAcc += dt; if (s.latAcc > 0.045) { s.latAcc = 0; const t = clamp(legT, 0, 1); s.stitch[s.legIndex].push([leg.a[0] + leg.dx * t * leg.len + leg.px * lat, leg.a[1] + leg.dy * t * leg.len + leg.py * lat]); s.latDevs.push(Math.abs(lat)); dirty = true; }
        if (legT >= 1) { sfx('tear'); note('The needle ran past a corner. The stitch line overshot.'); s.overshoots++; s.cornerErrs.push(0.4); pivot(lat, false); } else { s.legT = legT; s.lat = lat; } } }
    if (st === 'press' && s.ironing && s.iron) { G().zones.forEach((z, i) => { if (Math.hypot(s.iron.x - z[0], s.iron.y - z[1]) < z[2] + 3) { s.heat[i] = Math.min(150, s.heat[i] + dt * 26); if (s.heat[i] > SCORCH && !s.scorched[i]) { s.scorched[i] = true; sfx('tear'); note('Scorch mark on the ' + z[3].toLowerCase() + '. The iron sat too long.'); } } }); dirty = true; }
    if (SECONDS[st] > 0) { s.timeLeft -= dt; if (s.timeLeft <= 0) { s.timeLeft = 0; timeUp(); } } }

  // ---- drawing the cloth layer (game units 200 x 140)
  function path(pts) { c.beginPath(); pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); }
  function fabric(pts, g) { path(pts); c.closePath(); c.fillStyle = g.fill; c.fill(); c.fillStyle = weave; c.fill(); c.strokeStyle = g.stroke; c.lineWidth = 0.7; c.stroke(); }
  function lbl(t, x, y, size, col, w = 900) { c.save(); c.translate(x, y); c.font = `${w} ${size}px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = size * 0.28; c.strokeStyle = 'rgba(12,10,14,0.8)'; c.strokeText(t, 0, 0); c.fillStyle = col; c.fillText(t, 0, 0); c.restore(); }
  function ring2(x, y, r, col, lw, dash) { c.beginPath(); c.arc(x, y, r, 0, 6.283); c.setLineDash(dash || []); c.strokeStyle = col; c.lineWidth = lw; c.stroke(); c.setLineDash([]); }
  function draw(T) { c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, CW, CH); if (!s) { tex.needsUpdate = true; return; } c.save(); c.scale(SC, SC); const g = G(), st = stage(), pul = 0.5 + 0.5 * Math.sin(T * 6);
    if (st === 'cut') { const nextP = s.cutDone.findIndex(v => !v);
      PC().forEach((pc, i) => { const done = s.cutDone[i], k = done ? clamp((T - s.cutAt[i]) / 0.45, 0, 1) : 0, e = k * k * (3 - 2 * k);
        c.save(); c.translate(pc.away[0] * e, pc.away[1] * e); c.globalAlpha = 1 - 0.5 * e; fabric(pc.off, g); c.restore(); fabric(pc.keep, g);
        if (!done) { path(pc.cut); c.setLineDash([2.2, 1.5]); c.lineCap = 'round'; c.strokeStyle = 'rgba(250,248,242,0.95)'; c.lineWidth = 0.9; c.stroke(); c.setLineDash([]); }
        if (s.prog[i] > 0.01 && !done) { path(upTo(pc.info, s.prog[i])); c.strokeStyle = '#120d10'; c.lineWidth = 1.3; c.stroke(); }
        if (!done && (i === nextP || s.activeCut === i)) { const [sx, sy] = pc.cut[0]; c.beginPath(); c.arc(sx, sy, 3.2, 0, 6.283); c.fillStyle = 'rgba(236,48,19,0.35)'; c.fill(); ring2(sx, sy, 4 + pul * 1.6, RED, 1.2); }
        lbl(pc.label, (pc.box[0] + pc.box[2]) / 2, pc.lblY ?? pc.box[3] + 6, 4.6, done ? GREEN : INK); });
      c.strokeStyle = '#ff5a40'; c.lineWidth = 0.8; for (const [x, y] of s.tearAt) { c.beginPath(); c.moveTo(x - 2, y - 1.5); c.lineTo(x - 0.7, y + 1.5); c.lineTo(x + 0.7, y - 1.5); c.lineTo(x + 2, y + 1.5); c.stroke(); } }
    else if (st !== 'serve' || fold < 1) { c.save(); if (st === 'serve') c.globalAlpha = 1 - fold; fabric(g.sil, g); path(g.shade); c.closePath(); c.fillStyle = 'rgba(0,0,0,0.16)'; c.fill();
      if (st === 'sew') { path(g.seam); c.setLineDash([1.4, 1.4]); c.strokeStyle = 'rgba(255,255,255,0.6)'; c.lineWidth = 0.6; c.stroke(); c.setLineDash([]);
        for (const pts of s.stitch) if (pts.length > 1) { path(pts); c.lineCap = 'round'; c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 1.2; c.stroke(); c.setLineDash([1.6, 0.9]); c.strokeStyle = '#f0c040'; c.lineWidth = 0.85; c.stroke(); c.setLineDash([]); }
        g.seam.forEach((p, i) => { const live = !s.sewDone && i === s.legIndex + 1, reached = i <= s.legIndex; ring2(p[0], p[1], i === 0 ? 3 : live ? 4.2 + pul * 1.4 : 4.2, live ? RED : reached ? GREEN : 'rgba(246,244,239,0.8)', live ? 1.6 : 1); }); }
      if (st === 'press') { const b = s.spec.band, fr = v => clamp(v / SCORCH, 0, 1);
        g.zones.forEach((z, i) => { const v = s.heat[i], sc = s.scorched[i], inB = v >= b.lo && v <= b.hi, over = !sc && v > b.hi, [x, y, r] = z;
          c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fillStyle = sc ? 'rgba(107,74,44,0.78)' : over ? `rgba(201,138,58,${clamp(0.2 + (v - b.hi) / 100, 0, 0.8)})` : `rgba(29,24,38,${clamp(0.3 - v / 420, 0.02, 0.3)})`; c.fill();
          if (!sc && v < b.lo * 0.8) { c.strokeStyle = 'rgba(0,0,0,0.38)'; c.lineWidth = 0.6; for (const dy of [-2.5, 0.5, 3.5]) { c.beginPath(); c.moveTo(x - r * 0.6, y + dy); c.quadraticCurveTo(x - r * 0.3, y + dy + 2.4, x, y + dy); c.quadraticCurveTo(x + r * 0.3, y + dy - 2.4, x + r * 0.6, y + dy); c.stroke(); } }
          if (inB) { c.beginPath(); c.moveTo(x - r * 0.5, y + r * 0.3); c.quadraticCurveTo(x, y - r * 0.6, x + r * 0.5, y - r * 0.2); c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1; c.stroke(); }
          ring2(x, y, r, sc ? '#c2210f' : inB ? GREEN : over ? '#ff8a3a' : 'rgba(246,244,239,0.9)', 0.7, inB || sc ? null : [2.4, 2.2]);
          const R = r + 3.4, a0 = -Math.PI / 2; c.lineCap = 'butt'; c.beginPath(); c.arc(x, y, R, 0, 6.283); c.strokeStyle = 'rgba(18,13,16,0.75)'; c.lineWidth = 2.4; c.stroke();
          c.beginPath(); c.arc(x, y, R, a0 + fr(b.lo) * 6.283, a0 + fr(b.hi) * 6.283); c.strokeStyle = '#3fae55'; c.lineWidth = 2.4; c.stroke();
          if (v > 0.5) { c.beginPath(); c.arc(x, y, R, a0, a0 + fr(v) * 6.283); c.strokeStyle = sc ? '#c2210f' : inB ? '#f6f4ef' : over ? RED : '#f0c040'; c.lineWidth = 1.2; c.stroke(); }
          lbl(z[3], x, y + R + 4.6, 4, inB ? GREEN : INK); }); }
      c.restore(); }
    if (s.card > 0 && !overlay) { const a = clamp(Math.min(s.card, 1.4 - s.card) / 0.25, 0, 1), pr = false; c.globalAlpha = a; c.fillStyle = 'rgba(14,10,16,0.9)'; if (pr) c.fillRect(82, 0, 36, 140); else c.fillRect(0, 52, 200, 36); c.fillStyle = RED; if (pr) c.fillRect(82, 0, 1.2, 140); else c.fillRect(0, 52, 200, 1.2);
      lbl(TITLES[st], 100, pr ? 70 : 66, pr ? 8 : 10, INK); lbl('ORDER ' + (s.round % 4 + 1) + ' OF 4 · ' + g.name.toUpperCase() + ' FOR ' + s.cust.name.toUpperCase(), pr ? 110 : 100, pr ? 70 : 79, 4.6, '#b98ad8', 800); c.globalAlpha = 1; }
    c.restore(); tex.needsUpdate = true; dirty = false; }

  // ---- 3D each frame
  const sm = k => k * k * (3 - 2 * k);
  function render3D(dt, T) { const st = s && !overlay ? stage() : s ? stage() : null, pul = 0.5 + 0.5 * Math.sin(T * 3);
    ringF.material.opacity = 0.12 + 0.1 * pul; ring.scale.setScalar(1 + 0.04 * Math.sin(T * 3)); ring.visible = ringF.visible = !open; hang.visible = !open; cloth.visible = !!s && open;
    syncActors(dt, T);
    // shears: only in the cut stage; snip while cutting
    shears.visible = open && st === 'cut'; if (shears.visible) { const p = s.shear || (portrait() ? { x: 150, y: 71 } : { x: 188, y: 30 }), [x, z] = toL(p.x, p.y); let ang = -0.6; if (s.activeCut != null) ang = projOn(PC()[s.activeCut].info, p.x, p.y).ang; else if (s.shear) ang = shears.userData.ang ?? ang;
      shears.userData.ang = ang; shears.position.x += (x - shears.position.x) * Math.min(1, dt * 30); shears.position.z += (z - shears.position.z) * Math.min(1, dt * 30); shears.position.y = YC + (s.activeCut != null ? 0.002 : 0.03);
      let dr = -ang - shears.rotation.y; dr = Math.atan2(Math.sin(dr), Math.cos(dr)); shears.rotation.y += dr * Math.min(1, dt * 18); s.snipK = Math.max(0, s.snipK - dt * 5); const op = s.activeCut != null ? 0.1 + 0.18 * Math.abs(Math.sin(T * 14)) : 0.22; arms[0].rotation.y = op; arms[1].rotation.y = -op; }
    // machine: rises out of the counter's back edge, slides on; the needle bobs while you hold
    machK = open && (st === 'sew') ? Math.min(1, machK + dt / 1.0) : Math.max(0, machK - dt / 0.8); mach.visible = machK > 0.001; const e1 = sm(clamp(machK * 2, 0, 1)), e2 = sm(clamp(machK * 2 - 1, 0, 1));
    machIn.position.set(0, -0.62 * (1 - e1), -1.05 * (1 - e2)); const holding = st === 'sew' && s.holding && !s.card; needle.position.y = holding ? Math.sin(T * 60) * 0.012 - 0.006 : 0.012; wheel.rotation.x += dt * (holding ? 26 : 0);
    lamp.material.opacity = machK * 0.7; dot.material.opacity = e2 * (st === 'sew' ? 0.95 : 0);
    // the cloth slides so the seam runs under the needle; the head drifts sideways with the pull
    let tx2 = 0, ty2 = 0, lx = 0, ly = 0; if (s && st === 'sew') { const g = G(), li = Math.min(s.legIndex, g.legs.length - 1), lg = g.legs[li], t = s.sewDone ? 1 : clamp(s.legT, 0, 1); tx2 = NEED.x - (lg.a[0] + lg.dx * t * lg.len); ty2 = NEED.y - (lg.a[1] + lg.dy * t * lg.len); if (!s.sewDone) { lx = lg.px * s.lat; ly = lg.py * s.lat; } }
    const kc = Math.min(1, dt * 9); co.x += (tx2 - co.x) * kc; co.y += (ty2 - co.y) * kc; cloth.position.x = co.x * U; cloth.position.z = co.y * U; latV.x += (lx - latV.x) * Math.min(1, dt * 20); latV.y += (ly - latV.y) * Math.min(1, dt * 20); mach.position.set(latV.x * U, 0, latV.y * U);
    // iron: rests on its heel until the press stage; follows the finger, sole down while held
    iron.visible = open && st === 'press'; if (iron.visible) { const p = s.iron || (portrait() ? { x: Math.min(186, G().pressP[2] - 6), y: 132 } : { x: 186, y: 122 }), [x, z] = toL(p.x, p.y), down = s.ironing && !s.card; ironRest = s.iron ? Math.max(0, ironRest - dt * 4) : 1;
      iron.position.x += (x - iron.position.x) * Math.min(1, dt * 24); iron.position.z += (z - iron.position.z) * Math.min(1, dt * 24); iron.position.y += ((YC + (down ? 0.001 : 0.04)) - iron.position.y) * Math.min(1, dt * 16); ironIn.rotation.x = -ironRest * 1.2; ironIn.position.y = ironRest * 0.07;
      hot.material.opacity = down ? 0.55 + 0.15 * Math.sin(T * 20) : 0.12; for (const q of steam) { q.t += dt * (down ? 1.4 : 0.5); if (q.t > 1) q.t -= 1; q.sp.position.set(Math.sin(q.t * 7 + q.sp.id) * 0.03, 0.08 + q.t * 0.22, -0.06 + q.t * 0.02); q.sp.scale.setScalar(0.04 + q.t * 0.12); q.sp.material.opacity = (down ? 0.45 : 0.08) * (1 - q.t); } }
    // hand-over: the garment folds into a parcel, then flies to the customer, who carries it out
    fold = st === 'serve' ? Math.min(1, fold + dt / 0.8) : 0; if (st === 'serve' && fold > 0.2 && flyT < 0) { parcel.visible = true; const k = sm(clamp((fold - 0.2) / 0.8, 0, 1)); parcel.position.set(0, YC + 0.3 * (1 - k), 0); parcel.scale.set(1, Math.max(0.05, k), 1); parcel.rotation.y = (1 - k) * 0.6; }
    if (flyT >= 0) { const a = actors.find(q => q.mode === 'wait' || q.carry); flyT = Math.min(1, flyT + dt / 0.8); const k = sm(flyT), hx = a ? a.x + Math.sin(a.c.rotation.y) * 0.32 : CU.x, hz = a ? a.z + Math.cos(a.c.rotation.y) * 0.32 : CU.z;
      parcel.position.set(hx * k, YC + (0.85 - YC) * k + Math.sin(k * Math.PI) * 0.55, hz * k); parcel.rotation.y = k * Math.PI * 2; parcel.scale.setScalar(1 - k * 0.35);
      if (flyT >= 1 && a && !a.carry) { a.carry = true; a.hop = a.mood === 'happy' ? 0.7 : 0; setTimeout(() => { if (a.mode === 'wait') a.mode = 'out'; }, 600); }
      if (a && a.carry) { parcel.position.set(a.x + Math.sin(a.c.rotation.y) * 0.32, 0.85 + a.c.position.y, a.z + Math.cos(a.c.rotation.y) * 0.32); parcel.rotation.y = a.c.rotation.y; } else if (!a && flyT >= 1) parcel.visible = false;
      if (a && a.mode === 'out' && !a.c.visible) parcel.visible = false; }
    if (!open && !actors.some(a => a.carry)) parcel.visible = false; }

  const surface = { c: new THREE.Vector3(OX + at.x, YC, at.z), u: new THREE.Vector3(1, 0, 0), v: new THREE.Vector3(0, 0, 1), n: new THREE.Vector3(0, 1, 0), w: PW, h: PH, maxD: 3.4, maxY: 4.8, turn: false }, base = surface.c.clone();
  return {
    title: 'FOXY TAILORS', where: "Garok's · the cutting table", W: 200, H: 140, surface,
    stand: { x: OX + at.x, z: at.z + stZ, face: Math.PI }, _s: () => s,
    frame() { if (!s || overlay) return [0, 0, 200, 140]; const st = stage(), g = G(); return st === 'cut' ? g.frameP : st === 'sew' ? [50, 34, 150, 132] : st === 'press' ? g.pressP : [0, 0, 200, 140]; },
    idle(dt, T) { if (!open) render3D(dt, T); },
    begin() { open = true; ending = false; overlay = 'intro'; s = fresh(save.stat('dsfTailorRound', 0) % 4); pFill.color.set(G().fill); pEdge.color.set(G().stroke); customerIn(s.round % 4); co.x = co.y = 0; dirty = true; draw(0); hooks.open && hooks.open(true); },
    end() { ending = true; killMusic(); stopHold(); if (s) { save.setStat('dsfTailorRound', s.handed ? s.round + 1 : s.round); s.holding = s.ironing = false; s.activeCut = null; } open = false; for (const a of actors) if (a.mode !== 'out') a.mode = 'out'; pullK = 0; surface.c.copy(base); surface.w = PW; surface.h = PH; hooks.open && hooks.open(false); },
    tick(dt, T, fly) { if (!open) return; clock += dt; if (fly > 0.85 && !ending && !overlay && s) music(); else if (overlay || ending) killMusic();
      if (fly > 0.85 && !ending) step(dt);
      const pr = portrait(); if (pr !== prW) { prW = pr; dirty = true; }
      render3D(dt, T); drawT += dt; if (dirty || drawT > 0.06) { drawT = 0; draw(T); } },
    down(x, y) { if (overlay || !s || s.card > 0) return; const st = stage(), p = { x, y };
      if (st === 'cut') { let pick = null, bd = 9.5; PC().forEach((pc, i) => { if (s.cutDone[i]) return; const pr = projOn(pc.info, x, y); if (pr.dist < bd && pr.t <= s.prog[i] + 0.2) { bd = pr.dist; pick = i; } }); s.activeCut = pick; s.shear = p; if (pick != null) tone(1200, 0.04, 0.02, 'triangle'); }
      else if (st === 'sew' && !s.sewDone) { startHold('machine'); s.holding = true; s.ptr = p; }
      else if (st === 'press') { startHold('steam'); sfx('hiss'); s.ironing = true; s.iron = p; }
      else if (st === 'serve') handOver(); dirty = true; },
    move(x, y) { if (overlay || !s || s.card > 0) return; const st = stage(), p = { x, y };
      if (st === 'cut') { s.shear = p; const i = s.activeCut; if (i == null || s.cutDone[i]) return; const pc = PC()[i], pr = projOn(pc.info, x, y), tol = s.spec.tol * s.spec.forgive;
        if (pr.t > s.prog[i]) { const prev = s.prog[i]; s.cutDevs.push(Math.min(pr.dist, 12)); s.prog[i] = pr.t;
          if (pr.dist > tol) { s.tears++; sfx('tear'); const lt = s.tearAt[s.tearAt.length - 1]; if (!lt || Math.hypot(lt[0] - x, lt[1] - y) > 3) { s.tearAt.push([x, y]); if (s.tearAt.length > 40) s.tearAt.shift(); } }
          else if (Math.floor(pr.t * 6) > Math.floor(prev * 6)) sfx('snip');
          if (pr.t > 0.94) { s.cutDone[i] = true; s.prog[i] = 1; s.cutAt[i] = clock; s.activeCut = null; sfx('snip'); hooks.snip && hooks.snip(); if (s.cutDone.every(Boolean)) { const me = s; setTimeout(() => { if (s === me && stage() === 'cut') commit('Cutting', cutScore()); }, 120); } }
          dirty = true; } }
      else if (st === 'sew') s.ptr = p; else if (st === 'press') s.iron = p; },
    up() { if (!s || overlay) return; const st = stage();
      if (st === 'cut') s.activeCut = null;
      else if (st === 'sew') { stopHold(); if (!s.holding || s.sewDone) { s.holding = false; return; } if (s.legT >= 0.76) { const err = Math.abs(1 - s.legT); s.cornerErrs.push(err); pivot(s.lat, err < 0.12); } else s.holding = false; }
      else if (st === 'press') { stopHold(); s.ironing = false; } dirty = true; },
    hud() { if (overlay === 'intro') { const r = s ? s.round % 4 : 0; return { card: { kicker: "Garok's · Order " + (r + 1) + ' of 4 · ' + GARMENTS[ORDER[r]].name, title: 'Foxy Tailors', body: 'Cut along the chalk, sew the seams straight, press it crisp, then hand it to the customer.', buttons: ['YES, PUT ME TO WORK!', 'NOT NOW'] } }; }
      if (overlay === 'card' && cardInfo) return { card: cardInfo }; if (!s) return {};
      const g = G(), st = stage(), lat = Math.abs(s.lat); let hint = '', prog = ['', ''];
      if (s.card > 0) hint = TITLES[st] + ' · ' + g.name + ' for ' + s.cust.name;
      else if (st === 'cut') hint = s.activeCut != null ? 'Follow the chalk to its end' : 'Press the red ring, drag the shears down the chalk';
      else if (st === 'sew') hint = s.sewDone ? 'Seams done' : s.holding ? (s.legT >= 0.76 ? 'RELEASE NOW · at the red ring' : lat > 3.4 ? 'Steer back · move your finger to the other side' : 'Running · steer against the pull') : (s.legIndex > 0 ? 'Hold to sew the next seam' : 'Hold anywhere to sew');
      else if (st === 'press') hint = 'Hold the iron on a patch · lift in the green';
      else hint = s.handed ? s.cust.name + ' takes it' : 'Tap the parcel to hand it to ' + s.cust.name;
      if (st === 'cut') prog = ['Pieces', s.cutDone.filter(Boolean).length + ' / ' + g.pieces.length, s.tears ? RED : INK];
      else if (st === 'sew') prog = ['Seams', Math.min(s.legIndex, g.legs.length) + ' / ' + g.legs.length, lat > 3.4 ? RED : INK];
      else if (st === 'press') { const b = s.spec.band, ok = g.zones.filter((z, i) => !s.scorched[i] && s.heat[i] >= b.lo && s.heat[i] <= b.hi).length; prog = ['Pressed', ok + ' / ' + g.zones.length, s.scorched.some(Boolean) ? RED : ok === g.zones.length ? GREEN : INK]; }
      else prog = ['Score', score() + '', score() >= 75 ? GREEN : INK];
      const tl = SECONDS[st] > 0 ? Math.ceil(s.timeLeft) + 's' : '—';
      return { where: hint, showStats: true, stats: [['Order', (s.round % 4 + 1) + ' of 4'], prog, ['Time', tl, s.timeLeft < 4 && SECONDS[st] ? RED : s.timeLeft < 8 && SECONDS[st] ? '#ffd23a' : INK]] }; },
    cardPick(i) { if (overlay === 'intro') { if (i === 0) { tone(660, 0.12, 0.04, 'triangle'); newRound(s.round); } else return 'leave'; return; }
      if (overlay === 'card') { if (i === 0) newRound(s.round + 1); else return 'leave'; } },
  };
}
