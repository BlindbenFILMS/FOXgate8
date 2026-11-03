// MERU 2.0 — s53 TOWN 2 INTERIOR 11: BIG TALL'S ROCK WALL [meruRock] (f -238..-214 × 61..85, door N (-226, 61), h 18).
// BIG TALL (Ben): a huge gentle fox who belays; TINY: a tiny loud fox who coaches from the top ledge.
// ONE SESSION, ALL STEPS (Ben): 1 GEAR UP (tap harness / shoes / chalk, drag the figure-8 knot) · 2 ROUTE SETTING (drag your holds onto the chalk rings) ·
// 3 BOULDER (tap the next hold of YOUR colour; wrong colour = slip, twice = fall to the mat) · 4 DYNO (hold to charge, let go in the gold, tap at the top) ·
// 5 TOP ROPE (12 m main wall + roof: GRIP METER: hold, let go in the gold band to reach; stamina drains, CHALK UP; fall = Big Tall catches you) ·
// 6 RAPPEL (tap = push off, tap = brake on the yellow tape) · 7 BELAY (hold to take in slack, tap when they fall, hold to lower) · 8 SPEED WALL (race Tiny).
// Can fall, retry (Ben). Outside face is climbable too (yellow ring by the right of the door). Prizes (Ben): CLIMBING SHOES → HARNESS + ROPE → GRAPPLING HOOK → SUMMIT MEDAL.
// s70 INTERIOR POLISH 11: shopKit (Big Tall = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board SESSION; badge), NOW HIRING by the door,
// ONE-box menu with choices, 1-box end line, hint hand, touch radius 44 + bigger pulsing dots, portrait lens.
import { applyD, endPose, climbD } from '../engine/fox-poses.js?v=s648k';   // s621b jointed climbers (player, customer, Tiny, Big Tall belaying)
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildRockWall({ THREE, scene, kit, cols, save, touch, sayTo, camera, inside, hour = () => 12, isMuted = () => false }) {
  const X0 = -237.6, X1 = -214.4, Z0 = 61.4, Z1 = 84.6, CX = -226, CZ = 73, HT = 17.6;
  const G = new THREE.Group(); G.name = 'rockWall'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData = { c, fn }; return t; };
  const redraw = (t, fn) => { const c = t.userData.c, g = c.getContext('2d'); g.clearRect(0, 0, c.width, c.height); fn(g, c.width, c.height); t.needsUpdate = true; };
  const rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] }), ringC = (x, z, r) => cols.push({ c: [x, z, r] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', BLUE = '#2e86b8', GREEN = '#3f9a5e', STEEL = '#c9ced3', DARK = '#3d3b3a', WOOD = '#a77a4c', ORANGE = '#f97316', PURPLE = '#7c3aed', CONC = '#cfcac3';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const mm = (geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); return m; };
  const smooth = k => k * k * (3 - 2 * k), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // ================= WALL SURFACES (u = along the wall, y = up) =================
  let outZ = () => 60.6;
  const WALLS = {
    main: { n: V(0, 0, -1), face: 0, yaw: Math.PI, p: (u, y) => V(u, y, y < 8 ? 84.45 : 84.45 - (y - 8) * 0.3) },
    speed: { n: V(1, 0, 0), face: -Math.PI / 2, yaw: Math.PI / 2, p: (u, y) => V(-237.3, y, u) },
    boulder: { n: V(-1, 0, 0), face: Math.PI / 2, yaw: -Math.PI / 2, p: (u, y) => V(y < 3.4 ? -214.55 : -214.55 - (y - 3.4) * 0.55, y, u) },
    out: { n: V(0, 0, -1), face: 0, yaw: Math.PI, p: (u, y) => V(u, y, outZ(y)) } };
  const HG = new THREE.SphereGeometry(1, 9, 6);
  const hScale = (W, s) => Math.abs(W.n.z) > 0.5 ? V(0.17 * s, 0.13 * s, 0.07 * s) : V(0.07 * s, 0.13 * s, 0.17 * s);
  const DECO = []; const deco = (wall, u, y, col, s = 1) => { const W = WALLS[wall]; DECO.push([W.p(u, y).addScaledVector(W.n, 0.03), hScale(W, s), col]); };
  // ---------- floor + walls ----------
  { const t = CT(256, 256, (g, W, H) => { g.fillStyle = '#4a5560'; g.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { g.fillStyle = ['rgba(255,255,255,0.10)', 'rgba(236,48,19,0.18)', 'rgba(255,210,58,0.16)', 'rgba(0,0,0,0.15)'][i % 4]; g.fillRect((i * 97) % W, (i * 57 + (i >> 3)) % H, 2, 2); } g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, 0, W, 2); g.fillRect(0, 0, 2, H); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  const wall = (len, x, z, ry) => { box(len, 0.3, 0.06, INK, x, 0.15, z, ry); box(len, 1.1, 0.05, '#2e3a44', x, 0.62, z, ry); box(len, 0.1, 0.08, YEL, x, 1.2, z, ry); box(len, HT - 1.25, 0.05, '#dcd8d2', x, 1.25 + (HT - 1.25) / 2, z, ry); };
  wall(X1 - X0, CX, Z1 - 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2); wall(Z1 - Z0, X1 - 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[X0, -227.4], [-224.6, X1]]) wall(b - a, (a + b) / 2, Z0 + 0.03, 0);
  box(2.8, HT - 4.2, 0.05, '#dcd8d2', -226, 4.2 + (HT - 4.2) / 2, Z0 + 0.03); box(3.2, 0.02, 1.6, RED, -226, 0.08, Z0 + 0.9);
  // ================= MAIN TOP-ROPE WALL (south, 12 m, roof from 8 m) =================
  const MW = { x0: -233.2, x1: -220.8 };
  { const greys = ['#8e9aa3', '#9da8b0', '#83909a', '#a5afb6']; for (let c = 0; c < 4; c++) for (let r = 0; r < 2; r++) box(3.08, 3.98, 0.3, greys[(c + r) % 4], MW.x0 + 1.55 + c * 3.1, 2 + r * 4, 84.6);
    for (let c = 0; c < 4; c++) box(3.08, 4.18, 0.3, greys[(c + 1) % 4], MW.x0 + 1.55 + c * 3.1, 10.04, 84.0, 0, -0.2915);
    for (const x of [MW.x0, MW.x1]) { box(0.12, 12.2, 0.42, INK, x, 6.1, 84.55); box(0.12, 4.2, 1.3, INK, x, 10.1, 84.0); }
    box(12.6, 0.25, 1.45, INK, -227, 12.12, 83.88); box(12.6, 0.06, 0.06, YEL, -227, 13.15, 83.2); for (let x = MW.x0; x <= MW.x1 + 0.01; x += 1.55) box(0.05, 1.0, 0.05, INK, x, 12.7, 83.2);
    box(13.0, 0.3, 0.3, INK, -227, 13.55, 83.6); for (let x = MW.x0; x <= MW.x1 + 0.01; x += 3.1) box(0.18, HT - 13.6, 0.18, INK, x, 13.6 + (HT - 13.6) / 2, 84.3);
    box(4.2, 0.6, 0.05, RED, -227, 0.9, 84.42); }
  // ================= BOULDER CAVE (east, south) with crash mats =================
  { box(0.3, 3.4, 10, '#c8b48a', -214.4, 1.7, 79.2); box(0.3, 2.86, 10, '#b89f70', -215.1, 4.72, 79.2, 0, 0, 0.503); box(1.7, 0.22, 10.2, INK, -215.0, 6.0, 79.2);
    for (const z of [74.2, 84.2]) box(1.6, 6.0, 0.1, INK, -215.0, 3.0, z);
    box(3.2, 0.12, 10, BLUE, -216.1, 0.13, 79.2); for (let i = 0; i < 5; i++) box(0.04, 0.125, 10, '#1d5f86', -217.65 + i * 0.78, 0.135, 79.2);
    plane(label('THE CAVE · BOULDERING', INK, YEL, 512, 64, 36), 2.6, 0.32, -215.1, 6.4, 79.2, -Math.PI / 2); }
  // ================= SPEED WALL (west, 2 lanes, red, lit timer) =================
  const SPL = { a: 75.5, b: 78.5 };
  { box(0.3, 16.2, 6.4, RED, -237.45, 8.1, 77.0); box(0.32, 16.2, 0.08, WHITE, -237.43, 8.1, 77.0); for (let y = 1.4; y < 16; y += 1.32) box(0.32, 0.03, 6.4, '#b8260f', -237.43, y, 77.0);
    for (const z of [SPL.a, SPL.b]) { box(1.2, 0.04, 1.2, YEL, -236.6, 0.09, z); box(0.5, 0.5, 0.5, DARK, -237.1, 16.4, z); cyl(0.2, 0.2, 0.1, YEL, -237.25, 15.2, z, 16, 0, Math.PI / 2); } }
  const timerT = CT(512, 128, () => {}), timer = plane(timerT, 3.2, 0.8, -237.24, 17.0, 77.0, Math.PI / 2);
  const drawTimer = (a, b, la = 'YOU', lb = 'TINY') => redraw(timerT, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.textBaseline = 'middle'; g.font = '900 30px Archivo, sans-serif'; g.fillStyle = YEL; g.fillText(la, 16, 34); g.fillText(lb, W / 2 + 16, 34); g.font = '900 56px Archivo, sans-serif'; g.fillStyle = '#ff6b4a'; g.fillText(a, 16, 90); g.fillText(b, W / 2 + 16, 90); g.fillStyle = WHITE; g.fillRect(W / 2 - 2, 10, 4, H - 20); });
  drawTimer('0.00', '0.00');
  // ================= KIDS' WALL (east, north of the cave) =================
  { box(0.3, 4.2, 4.6, '#bfe3f2', -214.4, 2.1, 72.2); box(0.32, 0.2, 4.7, YEL, -214.42, 4.25, 72.2); plane(label("KIDS' WALL · ALL SMILES", YEL, INK, 512, 64, 36), 2.2, 0.28, -214.6, 4.6, 72.2, -Math.PI / 2);
    for (let i = 0; i < 12; i++) { const z = 70.3 + (i % 4) * 1.25 + (i % 2) * 0.2, y = 0.8 + Math.floor(i / 4) * 1.15 + (i % 3) * 0.12, x = -214.62;
      if (i % 3 === 0) { sph(0.24, YEL, x, y, z, 0.45, 1, 1); for (const s of [-1, 1]) sph(0.035, INK, x - 0.11, y + 0.06, z + s * 0.08); box(0.02, 0.03, 0.14, INK, x - 0.11, y - 0.07, z); }
      else if (i % 3 === 1) { for (let k = 0; k < 5; k++) box(0.08, 0.3, 0.1, RED, x, y + Math.cos(k * 1.2566) * 0.08, z + Math.sin(k * 1.2566) * 0.08, 0, k * 1.2566); }
      else sph(0.2, [GREEN, PURPLE, ORANGE][i % 3 + (i >> 2) % 2], x, y, z, 0.5, 1, 1.3); } }
  // ================= BALCONY CAFE (north-east) + stairs =================
  { box(7.4, 0.25, 3.4, '#4a4744', -218.3, 4.4, 63.1); for (const x of [-221.8, -218.3]) { box(0.16, 4.3, 0.16, INK, x, 2.15, 64.7); ringC(x, 64.7, 0.25); }
    box(7.4, 0.06, 0.06, INK, -218.3, 5.5, 64.75); for (let x = -221.9; x < -214.6; x += 0.35) box(0.03, 1.0, 0.03, INK, x, 5.0, 64.75); box(7.4, 0.3, 0.06, YEL, -218.3, 4.18, 64.82);
    for (const x of [-220.6, -217.6]) { cyl(0.38, 0.38, 0.04, WHITE, x, 5.25, 63.4, 16); cyl(0.04, 0.04, 0.7, INK, x, 4.88, 63.4, 6); for (const s of [-1, 1]) { cyl(0.16, 0.16, 0.04, RED, x + s * 0.55, 4.98, 63.4, 12); cyl(0.03, 0.03, 0.45, INK, x + s * 0.55, 4.75, 63.4, 6); } }
    box(3.0, 1.0, 0.6, INK, -216.4, 5.03, 61.8); box(3.05, 0.05, 0.65, WOOD, -216.4, 5.55, 61.8); box(0.5, 0.55, 0.4, STEEL, -215.6, 5.85, 61.75); box(0.2, 0.08, 0.1, RED, -215.6, 5.8, 61.98); cyl(0.05, 0.05, 0.1, WHITE, -216.2, 5.63, 61.8, 8);
    for (let i = 0; i < 10; i++) box(1.4, 0.2, 0.46, WOOD, -215.3, 0.43 * (i + 1) - 0.1, 69.4 - i * 0.46); box(0.08, 4.6, 4.8, INK, -216.03, 2.3, 67.2, 0, 0.73); rect(-216.1, X1, 64.9, 69.7);
    plane(label('SUMMIT CAFE', RED, WHITE, 512, 64, 38), 2.4, 0.3, -218.3, 3.9, 64.86, 0); }
  // ================= TRAINING CORNER: campus board + hangboard (south, east of the main wall) =================
  { box(2.0, 0.5, 0.12, WOOD, -217.9, 2.5, 84.45); for (let i = 0; i < 5; i++) box(0.24, 0.1, 0.05, INK, -218.7 + i * 0.4, 2.55, 84.38);
    box(1.4, 2.6, 0.1, WOOD, -215.7, 2.6, 84.2, 0, 0.22); for (let i = 0; i < 8; i++) box(1.3, 0.05, 0.08, '#6a4a2e', -215.7, 1.5 + i * 0.3, 84.08 + i * 0.066, 0, 0.22);
    box(4.6, 0.1, 2.2, BLUE, -217.2, 0.11, 83.3); plane(label('TRAINING', INK, YEL, 256, 64, 36), 1.4, 0.35, -217.2, 4.2, 84.52, Math.PI); }
  // ================= RENTAL DESK + SHOE WALL (north-west) =================
  const DESK = { x: -233.5, z: 64.0, y: 1.06 };
  { box(5.4, 1.0, 1.2, RED, -233.5, 0.5, 64.0); box(5.5, 0.06, 1.3, WOOD, -233.5, 1.03, 64.0); rect(-236.25, -230.75, 63.35, 64.65);
    box(6.4, 3.0, 0.4, '#6a4a2e', -234.0, 1.5, 61.62); for (let r = 0; r < 4; r++) box(6.4, 0.04, 0.4, INK, -234.0, 0.35 + r * 0.72, 61.66);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { const x = -236.9 + c * 0.7, y = 0.45 + r * 0.72, col = [RED, YEL, BLUE, INK, GREEN, ORANGE][(r * 3 + c) % 6]; box(0.14, 0.1, 0.24, col, x - 0.09, y, 61.75); box(0.14, 0.1, 0.24, col, x + 0.09, y, 61.75); }
    for (let i = 0; i < 4; i++) { const z = 62.2 + i * 0.75; box(0.05, 0.05, 0.3, STEEL, X0 + 0.15, 2.4, z); const h = new THREE.TorusGeometry(0.2, 0.04, 6, 16); R0.put(h, X0 + 0.24, 2.1, z, [RED, YEL, BLUE, ORANGE][i], Math.PI / 2); }
    plane(label('RENTALS · HARNESS · SHOES · CHALK', INK, YEL, 768, 64, 34), 3.4, 0.28, -233.5, 3.3, 61.85, 0); }
  // ---------- gear hook (west wall) ----------
  { box(0.06, 0.06, 0.4, STEEL, X0 + 0.15, 2.0, 68.6); box(0.6, 0.9, 0.05, YEL, X0 + 0.06, 2.6, 68.6, Math.PI / 2); }
  plane(label('MY GEAR', INK, YEL, 256, 64, 36), 0.9, 0.22, X0 + 0.1, 3.3, 68.6, Math.PI / 2);
  // ---------- route board (north wall, under the balcony) + medal frame ----------
  const boardT = CT(1024, 640, () => {}); plane(boardT, 4.0, 2.5, -218.3, 2.15, Z0 + 0.09, 0);
  const DEF_REC = { speed: [{ n: 'TINY', t: 7.42 }, { n: 'FLICK', t: 9.3 }, { n: 'BIG TALL', t: 11.9 }], rope: [{ n: 'BIG TALL', t: 48.0 }, { n: 'TINY', t: 61.5 }], out: [{ n: 'TINY', t: 74.0 }] };
  const recs = () => { const r = save.stat('rkRecords', null); return r && r.speed ? r : JSON.parse(JSON.stringify(DEF_REC)); };
  function addRec(kind, t) { const r = recs(), L = r[kind] || (r[kind] = []), old = L.find(q => q.n === 'YOU'); let best = false; if (!old || t < old.t) { if (old) old.t = t; else L.push({ n: 'YOU', t }); }
    L.sort((a, b) => a.t - b.t); r[kind] = L.slice(0, 4); best = r[kind][0].n === 'YOU'; save.setStat('rkRecords', r); drawBoard(); return best; }
  function drawBoard() { const r = recs(); redraw(boardT, (g, W, H) => { g.fillStyle = INK; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, 86); g.fillStyle = WHITE; g.textBaseline = 'middle'; g.font = '900 52px Archivo, sans-serif'; g.fillText('ROUTE BOARD', 28, 46);
    const routes = [['V0', "KIDS' WALL", YEL], ['V2', 'THE CAVE · YOUR SET', BLUE], ['V4', 'THE LIP · DYNO', GREEN], ['5.10', 'MAIN WALL · BIG ROOF', RED], ['5.11', 'OUTSIDE FACE', ORANGE], ['SPD', 'SPEED WALL · 15 M', WHITE]];
    routes.forEach(([gr, nm, c], i) => { const y = 130 + i * 78; g.fillStyle = c; g.fillRect(28, y - 26, 16, 52); g.fillStyle = WHITE; g.font = '900 34px Archivo, sans-serif'; g.fillText(gr, 60, y); g.font = '700 26px Archivo, sans-serif'; fitTxt(g, nm, 160, y, 300, 26, 700); });
    g.fillStyle = YEL; g.fillRect(500, 104, 4, H - 130);
    const sec = (title, L, y0) => { g.fillStyle = YEL; g.font = '900 28px Archivo, sans-serif'; g.fillText(title, 530, y0); L.slice(0, 3).forEach((q, i) => { const y = y0 + 44 + i * 40, me = q.n === 'YOU'; g.fillStyle = me ? '#ff6b4a' : WHITE; g.font = (me ? '900' : '700') + ' 28px Archivo, sans-serif'; g.fillText((i + 1) + '  ' + q.n, 540, y); g.fillText(q.t.toFixed(2) + ' S', 840, y); }); };
    sec('SPEED WALL', r.speed, 130); sec('TOP ROPE · MAIN', r.rope || [], 320); sec('OUTSIDE FACE', r.out || [], 480); }); }
  drawBoard();
  const medal = new THREE.Group(); { const fr = mm(new THREE.BoxGeometry(0.9, 1.1, 0.06), LM(INK), 0, 0, 0); const bg = mm(new THREE.BoxGeometry(0.78, 0.98, 0.07), LM(RED), 0, 0, 0.005); const dsk = mm(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 20), new THREE.MeshLambertMaterial({ color: 0xffc64a, emissive: 0x6a4a10 }), 0, -0.08, 0.06, Math.PI / 2);
    const rib = mm(new THREE.BoxGeometry(0.12, 0.4, 0.02), LM(YEL), 0, 0.22, 0.05); medal.add(fr, bg, dsk, rib); medal.position.set(-229.2, 2.3, Z0 + 0.1); G.add(medal); }
  plane(label('SUMMIT MEDAL', INK, YEL, 256, 64, 34), 0.9, 0.2, -229.2, 1.6, Z0 + 0.1, 0);
  // ---------- hanging sign + lights ----------
  { const T = label("BIG TALL'S ROCK WALL", RED, WHITE, 768, 96, 60); const s1 = plane(T, 5.0, 0.62, -226, 7.2, 68.0, 0); const s2 = s1.clone(); s2.rotation.y = Math.PI; s2.position.z = 67.99; G.add(s2); for (const x of [-228.3, -223.7]) box(0.02, HT - 7.5, 0.02, DARK, x, 7.5 + (HT - 7.5) / 2, 68); }
  { const M4 = new THREE.Matrix4(), lm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.08, 6.0), new THREE.MeshBasicMaterial({ color: 0xfff8ec }), 8); [[-234, 67], [-226, 67], [-218, 67], [-234, 78], [-226, 77], [-218, 78], [-230, 72.5], [-222, 72.5]].forEach((p, i) => { M4.makeTranslation(p[0], HT - 0.4, p[1]); lm.setMatrixAt(i, M4); }); G.add(lm); }
  // ---------- decorative holds (instanced) ----------
  { let s = 17; const rr = () => (s = (s * 16807) % 2147483647) / 2147483647, HC = [RED, YEL, BLUE, GREEN, ORANGE, PURPLE, WHITE, INK];
    for (let i = 0; i < 150; i++) { const u = MW.x0 + 0.4 + rr() * 11.6, y = 0.7 + rr() * 11.2; if (Math.abs(u + 229.8) < 0.9 || Math.abs(u + 224.6) < 0.9) continue; deco('main', u, y, HC[i % 8], 0.7 + rr() * 0.9); }
    for (let i = 0; i < 40; i++) { const u = 74.6 + rr() * 9.2, y = 0.6 + rr() * 4.9; if (Math.abs(u - 78.2) < 2.3) continue; deco('boulder', u, y, HC[(i + 3) % 8], 0.8 + rr() * 0.7); }
    for (const L of [SPL.a, SPL.b]) for (let i = 0; i < 11; i++) deco('speed', L + (i % 2 ? 0.25 : -0.25) + 0.9, 1.3 + i * 1.32, INK, 0.9); }
  const decoIM = new THREE.InstancedMesh(HG, new THREE.MeshLambertMaterial({ color: 0xffffff }), DECO.length); { const M4 = new THREE.Matrix4(); DECO.forEach((q, i) => { M4.compose(q[0], new THREE.Quaternion(), q[1]); decoIM.setMatrixAt(i, M4); decoIM.setColorAt(i, cc.set(q[2])); }); G.add(decoIM); }
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  // ================= ROUTES (live holds) =================
  const holdM = (wall, u, y, col, s = 1) => { const W = WALLS[wall], m = new THREE.Mesh(HG, LM(col)); m.position.copy(W.p(u, y).addScaledVector(W.n, 0.04)); m.scale.copy(hScale(W, s)); G.add(m); return m; };
  const mkRoute = (wall, u0, offs, y0, dy, col, s = 1.25) => offs.map((o, i) => { const h = { u: u0 + o, y: y0 + i * dy }; h.m = holdM(wall, h.u, h.y, col, s); return h; });
  const MAIN_A = mkRoute('main', -229.8, [0, 0.5, -0.4, 0.4, -0.5, 0.3, -0.3, 0.5, -0.2, 0], 1.95, 1.08, YEL), MAIN_B = mkRoute('main', -224.6, [0, -0.4, 0.4, -0.3, 0.5, -0.4, 0.3, -0.5, 0.2, 0], 1.95, 1.08, GREEN);
  const SPD_A = mkRoute('speed', SPL.a, [-0.25, 0.25, -0.25, 0.25, -0.25, 0.25, -0.25, 0.25, -0.25, 0.25], 1.95, 1.32, '#2a2826', 1.4), SPD_B = mkRoute('speed', SPL.b, [0.25, -0.25, 0.25, -0.25, 0.25, -0.25, 0.25, -0.25, 0.25, -0.25], 1.95, 1.32, '#2a2826', 1.4);
  const bellM = (pos) => { const g = new THREE.Group(); g.add(mm(new THREE.CylinderGeometry(0.06, 0.2, 0.26, 14, 1, true), new THREE.MeshLambertMaterial({ color: 0xe6b45a, side: THREE.DoubleSide, emissive: 0x3a2a08 }), 0, -0.13, 0), mm(new THREE.SphereGeometry(0.05, 8, 6), LM(INK), 0, -0.27, 0), mm(new THREE.BoxGeometry(0.03, 0.2, 0.03), LM(INK), 0, 0.08, 0)); g.position.copy(pos); G.add(g); return g; };
  const BELL_A = { u: -229.8, y: 12.95, g: bellM(V(-229.8, 13.05, 83.15)) };
  const MAIN_R = { wall: 'main', holds: MAIN_A, bell: BELL_A, anchor: V(-229.8, 13.45, 83.45), bands: [8.9, 5.4, 2.7], key: 'rope', name: 'MAIN WALL' };
  // outside face: route + bell + anchor; the face is measured (raycast) the first time you climb it
  const OUTU = -221.5, OUT_SPOT = { x: OUTU, z: 57.4, r: 1.1 };
  const OUT_H = [0, 0.4, -0.35, 0.3, -0.4, 0.35, -0.3, 0.4, -0.35, 0.3, 0].map((o, i) => ({ u: OUTU + o, y: 1.95 + i * 1.2 }));
  const OUT_R = { wall: 'out', holds: OUT_H, bell: { u: OUTU, y: 15.2, g: null }, anchor: V(OUTU, 15.6, 58.4), bands: [10.6, 6.4, 2.7], key: 'out', name: 'OUTSIDE FACE', ready: false };
  { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.012, 22), LM(YEL)); r.position.set(OUT_SPOT.x, 0.1, OUT_SPOT.z); const r2 = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.014, 22), LM(INK)); r2.position.set(OUT_SPOT.x, 0.102, OUT_SPOT.z); G.add(r, r2); }
  const outSign = plane(label('CLIMB THE FACE · TOP ROPE', YEL, INK, 512, 64, 34), 1.8, 0.24, OUTU, 2.6, 57.0, Math.PI); { const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.4, 0.08), LM(INK)); p.position.set(OUTU + 0.95, 1.2, 57.0); G.add(p); }
  function prepOut() { if (OUT_R.ready) return; OUT_R.ready = true; const rc = new THREE.Raycaster(), zs = []; rc.camera = camera;
    const skip = o => { for (let q = o; q; q = q.parent) if (q === G || (q.userData && q.userData.P)) return true; return false; };
    for (const h of [...OUT_H, { u: OUTU, y: 15.2 }]) { rc.set(V(h.u, h.y, 52), V(0, 0, 1)); rc.far = 10; let z = 60.6; try { const hits = rc.intersectObjects(scene.children, true); for (const q of hits) { if (skip(q.object) || !q.object.visible) continue; if (q.point.z > 57.4 && q.point.z < 61.4) { z = q.point.z - 0.06; break; } } } catch (e) {} zs.push([h.y, z]); }
    outZ = y => { if (y <= zs[0][0]) return zs[0][1]; for (let i = 1; i < zs.length; i++) if (y <= zs[i][0]) { const a = zs[i - 1], b = zs[i], k = (y - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * k; } return zs[zs.length - 1][1]; };
    OUT_H.forEach(h => { h.m = holdM('out', h.u, h.y, YEL, 1.5); }); OUT_R.bell.g = bellM(V(OUTU, 15.3, outZ(15.2) - 0.35)); OUT_R.anchor.z = outZ(15.2) - 0.5; }
  // boulder: start + 5 chalk rings you set + the lip (dyno) · decoys of other colours
  const BSTART = { u: 78.2, y: 1.95 }, BSET = [[77.5, 2.5], [78.7, 3.05], [77.8, 3.6], [78.8, 4.1], [78.1, 4.6]].map(([u, y]) => ({ u, y })), BLIP = { u: 79.0, y: 5.55 };
  const BDECOY = [[77.0, 2.2], [79.2, 2.6], [78.2, 3.3], [76.9, 3.9], [79.4, 3.7], [77.3, 4.9], [79.5, 4.6], [78.6, 5.15], [76.8, 2.9]].map(([u, y]) => ({ u, y }));
  const COLS = [{ k: 'RED', c: RED }, { k: 'YELLOW', c: YEL }, { k: 'BLUE', c: BLUE }, { k: 'GREEN', c: GREEN }, { k: 'ORANGE', c: ORANGE }, { k: 'PURPLE', c: PURPLE }];
  const ringGeo = new THREE.TorusGeometry(0.17, 0.022, 6, 22), ringM = new THREE.MeshBasicMaterial({ color: 0xffffff }), haloM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true });
  const halo = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.03, 6, 26), haloM); halo.renderOrder = 5; halo.visible = false; G.add(halo);
  const showHalo = (wall, u, y) => { const W = WALLS[wall], p = W.p(u, y).addScaledVector(W.n, 0.06); halo.position.copy(p); halo.lookAt(p.clone().add(W.n)); halo.visible = true; };
  // ================= ROPES (3 segments each) =================
  const ropeGeo = new THREE.CylinderGeometry(0.022, 0.022, 1, 6); ropeGeo.translate(0, 0.5, 0);
  const mkRope = c => { const segs = [0, 1, 2].map(() => { const m = new THREE.Mesh(ropeGeo, LM(c)); m.visible = false; G.add(m); return m; }); return { segs, set(pts) { segs.forEach((s, i) => { const a = pts[i], b = pts[i + 1]; if (!a || !b) { s.visible = false; return; } const d = b.clone().sub(a), L = d.length(); s.visible = L > 0.01; s.position.copy(a); s.scale.set(1, L, 1); s.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize()); }); }, hide() { segs.forEach(s => { s.visible = false; }); } }; };
  const ROPE1 = mkRope(ORANGE), ROPE2 = mkRope(BLUE);
  // ================= HARNESS + CLIMBING SHOES =================
  const harnessParts = (shoeC) => { const body = new THREE.Group(); const belt = mm(new THREE.TorusGeometry(0.34, 0.035, 6, 20), LM(RED), 0, 0.72, 0.02, Math.PI / 2); belt.scale.set(1, 0.85, 1); body.add(belt);
    body.add(mm(new THREE.TorusGeometry(0.05, 0.014, 6, 12), LM('#e6b45a'), 0, 0.64, 0.33), mm(new THREE.CylinderGeometry(0.07, 0.08, 0.14, 10), LM(WHITE), 0.12, 0.68, -0.3));
    const coil = mm(new THREE.TorusGeometry(0.3, 0.04, 6, 22), LM(ORANGE), 0, 1.0, 0, 0, Math.PI / 2, 0.85); body.add(coil);
    const legs = [0, 1].map(() => { const g = new THREE.Group(); const l = mm(new THREE.TorusGeometry(0.12, 0.025, 6, 14), LM(RED), 0, -0.1, 0.0, Math.PI / 2); g.add(l); return g; });
    [body, ...legs].forEach(g => g.traverse(o => { o.renderOrder = 2; })); return { body, legs }; };
  const shoePart = c => { const g = new THREE.Group(), S = new THREE.BoxGeometry(1, 1, 1); g.add(mm(S, LM(c), 0, -0.42, 0.06), mm(S, LM(INK), 0, -0.49, 0.065), mm(S, LM(YEL), 0, -0.39, 0.1)); g.children[0].scale.set(0.16, 0.11, 0.23); g.children[1].scale.set(0.165, 0.035, 0.24); g.children[2].scale.set(0.168, 0.03, 0.06); g.traverse(o => { o.renderOrder = 2; }); return g; };
  const gearOn = (f, harness, shoes, shoeC = RED) => { const U = f && f.userData; if (!U || !U.P) return null; const P = U.P, parts = [];
    if (harness && P.body) { const h = harnessParts(); P.body.add(h.body); parts.push(h.body); if (P.legs) P.legs.forEach((l, i) => { l.add(h.legs[i]); parts.push(h.legs[i]); }); }
    if (shoes && P.legs) P.legs.forEach(l => { const s = shoePart(shoeC); l.add(s); parts.push(s); }); return parts; };
  const wearSt = () => save.stat('rkWear', null) || {}; const setWear = (k, v) => { const w = { ...wearSt() }; w[k] = v; save.setStat('rkWear', w); };
  let worn = null;
  function applyWear(fox, climbing) { const U = fox && fox.userData; if (!U || !U.P) return; const w = wearSt(), ownS = !!save.stat('rkShoes', false), ownH = !!save.stat('rkHarness', false);
    const hs = climbing || (ownH && !!w.harness), ss = climbing || (ownS && !!w.shoes), sc = ownS ? RED : '#8a8780', key = (hs ? 1 : 0) + '|' + (ss ? 1 : 0) + sc;
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (U.feet) U.feet.forEach(p => { p.visible = !ss; });
    if (worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox)) return;
    if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: gearOn(fox, hs, ss, sc) || [] }; }
  // ================= BIG TALL + TINY =================
  const BT_LOOK = { fur: '#7a4a2a', furDark: '#4a2a14', muzzle: '#f1e2cf', snout: '#e8d4bc', chin: '#f6ece0', fluff: '#f6ece0' };
  const bigTall = kit.makeFox({ key: 'bigTallRock', torso: ['#5a6b7a', '#e2e6ea', '#2f3a44'], outfit: 'tee', mood: 'happy', eyes: ['#3a2a1a', '#3a2a1a'], look: BT_LOOK }); bigTall.scale.multiplyScalar(1.4); G.add(bigTall); gearOn(bigTall, true, true, BLUE);
  const TN_LOOK = { fur: '#ec6a2a', furDark: '#a8401a', muzzle: '#fff1e0', snout: '#ffe2c8', chin: '#fff6ec', fluff: '#fff6ec' };
  const tiny = kit.makeFox({ key: 'tinyRock', joints: true, torso: [RED, YEL, '#7f1d1d'], outfit: 'tee', mood: 'excited', eyes: ['#2a3a5a', '#2a3a5a'], look: TN_LOOK }); tiny.scale.multiplyScalar(0.62); G.add(tiny); gearOn(tiny, true, true, YEL);
  { const P = tiny.userData && tiny.userData.P; if (P && P.head) { const hb = mm(new THREE.TorusGeometry(0.31, 0.04, 6, 22), LM(YEL), 0, 0.22, 0, Math.PI / 2 - 0.15); hb.renderOrder = 2; P.head.add(hb); }
    if (P && P.arms) { const mg = new THREE.Group(); mg.add(mm(new THREE.CylinderGeometry(0.16, 0.05, 0.36, 12, 1, true), new THREE.MeshLambertMaterial({ color: RED, side: THREE.DoubleSide }), 0, -0.55, 0.12, Math.PI / 2)); mg.traverse(o => { o.renderOrder = 2; }); P.arms[1].add(mg); } }
  const BTS = { desk: [-233.5, 0, 62.6, 0], cave: [-217.6, 0, 80.8, Math.PI / 2], belay: [-231.6, 0, 82.4, 0.5], backup: [-221.4, 0, 82.6, -0.6], speed: [-234.0, 0, 82.0, -Math.PI * 0.7], out: [OUTU + 2.8, 0, 58.4, -Math.PI * 0.6] };
  const TNS = { ledge: [-227.6, 12.25, 84.0, Math.PI], cave: [-215.1, 6.11, 77.0, -Math.PI / 2] };
  const btCol = { c: [0, 0, 0.7] }; cols.push(btCol);
  const place = (f, s) => { f.position.set(s[0], s[1], s[2]); f.rotation.set(0, s[3], 0); f.userData.face0 = s[3]; };
  const placeBT = k => { place(bigTall, BTS[k]); btCol.c[0] = BTS[k][0]; btCol.c[1] = BTS[k][2]; }; placeBT('desk'); place(tiny, TNS.ledge);
  const btT = { key: 'bigTallRock', obj: bigTall, ry: 0, r: 2.8 }, tnT = { key: 'tinyRock', obj: tiny, ry: 0, r: 3.2 }, endT = { key: 'rockEnd', obj: bigTall, ry: 0, r: 12 };
  const lb = text => ({ who: 'big tall', role: 'THE BELAYER', text }), lt = text => ({ who: 'tiny', role: 'THE COACH', text });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'rock', color: RED, boardTitle: "Big Tall's best",
    room: { X0, X1, Z0, Z1 }, door: [-226, 61.2], keeper: bigTall, keeperRy: 0,
    games: [{ k: 'session', name: 'Session', color: RED }], board: { x: X0 + 0.06, y: 2.6, z: 71.5, ry: Math.PI / 2, w: 1.3 }, hiring: { x: -223.2, z: 62.0, ry: 0 }, hiringLine: '8 CLIMBS · ONE SESSION',
    sun: [{ x: -226, z: 62.4, w: 2.4, d: 2.0 }], lamps: [[-234, 67], [-226, 67], [-218, 67], [-234, 78], [-226, 77], [-218, 78], [-230, 72.5], [-222, 72.5]].map(p => [p[0], HT - 1.0, p[1]]),
    browse: [[-219.5, 66.2, Math.PI], [-229.2, 62.6, Math.PI], [-216.6, 72.2, Math.PI / 2], [-226, 79.5, 0], [-233.0, 77.0, -Math.PI / 2]],
    looks: [['#3f9a5e', '#e2f4e8', '#1e5230'], ['#2e86b8', '#e0f2fe', '#1d4f6e']], clock: { x: X0 + 0.08, y: 3.4, z: 66.0, ry: Math.PI / 2 } });
  // ================= CUSTOMERS (the belay step) =================
  const CUST = [
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], say: 'First time on the big wall. Do not let go of me.' },
    { name: 'OTTO', forW: 'Barracks', torso: ['#7a8a3a', '#e8e2c8', '#4a5420'], say: 'Soldiers climb. I will prove it.' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], say: 'I climb on Thursdays. It is Thursday somewhere.' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], say: 'I want to ring that bell. Loudly.' },
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], say: 'Like a ramp. But up. Easy.' },
    { name: 'PELL', forW: 'Armory', torso: ['#5a6b7a', '#e2e6ea', '#2f3a44'], say: 'Check my knot twice. Then once more.' },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#2e4a6b', '#ffd23a', '#1d2f44'], say: 'I can see the lake from the top, they say.' }];
  const custCache = {}; const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'rkCust' + i, joints: true, torso: C.torso, outfit: 'vest', mood: 'neutral' }); f.visible = false; G.add(f); gearOn(f, true, true, ORANGE); custCache[i] = f; return f; };
  // ================= GEAR UP items on the desk =================
  const GEAR = [{ k: 'harness', name: 'HARNESS', p: V(-235.3, DESK.y + 0.05, 63.8) }, { k: 'shoes', name: 'SHOES', p: V(-234.4, DESK.y + 0.05, 63.8) }, { k: 'chalk', name: 'CHALK BAG', p: V(-232.4, DESK.y + 0.08, 63.8) }];
  GEAR.forEach(q => { const g = new THREE.Group(); if (q.k === 'harness') { g.add(mm(new THREE.TorusGeometry(0.17, 0.035, 6, 18), LM(RED), 0, 0, 0, Math.PI / 2), mm(new THREE.TorusGeometry(0.07, 0.02, 6, 12), LM(RED), -0.1, 0, 0.14, Math.PI / 2), mm(new THREE.TorusGeometry(0.07, 0.02, 6, 12), LM(RED), 0.1, 0, 0.14, Math.PI / 2)); }
    else if (q.k === 'shoes') { for (const s of [-1, 1]) g.add(mm(new THREE.BoxGeometry(0.11, 0.08, 0.24), LM(RED), s * 0.08, 0.02, 0), mm(new THREE.BoxGeometry(0.115, 0.025, 0.245), LM(INK), s * 0.08, -0.02, 0)); }
    else g.add(mm(new THREE.CylinderGeometry(0.08, 0.09, 0.16, 12), LM(WHITE), 0, 0, 0), mm(new THREE.TorusGeometry(0.08, 0.012, 6, 14), LM(INK), 0, 0.08, 0, Math.PI / 2));
    g.position.copy(q.p); G.add(g); q.g = g; q.home = q.p.clone(); });
  const KNOT_C = V(-233.4, DESK.y + 0.03, 64.05); { const coil = mm(new THREE.TorusGeometry(0.16, 0.03, 6, 20), LM(ORANGE), -232.0 + 0.6, DESK.y + 0.03, 63.7, Math.PI / 2); G.add(coil); }
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talkedB = 0, talkedT = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.4); tone(2093, 0.05, 1.4); tone(1175, 0.04, 1.6, 'sine', 0.05); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), grab = () => { tone(300, 0.05, 0.08, 'square'); tone(520, 0.04, 0.1, 'triangle'); };
  const whoosh = () => tone(220, 0.05, 0.5, 'sawtooth', 0, 90), thud = () => { tone(90, 0.09, 0.3, 'square', 0, 50); }, beep = (hi) => tone(hi ? 1320 : 660, 0.06, hi ? 0.5 : 0.18, 'square'), zip = () => tone(300, 0.05, 1.2, 'sawtooth', 0, 1400);
  // ---------- prizes ----------
  function giveGift() { save.setStat('rkClears', save.stat('rkClears', 0) + 1);
    if (!save.stat('rkShoes', false)) { save.setStat('rkShoes', true); setWear('shoes', true); return { kind: 'shoes', label: 'CLIMBING SHOES' }; }
    if (!save.stat('rkHarness', false)) { save.setStat('rkHarness', true); setWear('harness', true); return { kind: 'harness', label: 'HARNESS + ROPE' }; }
    if (!save.count('grapplingHook')) { save.give('grapplingHook'); return { kind: 'hook', label: 'GRAPPLING HOOK' }; }
    if (!save.count('summitMedal')) { save.give('summitMedal'); return { kind: 'medal', label: 'SUMMIT MEDAL' }; }
    save.addGold(20); return { kind: 'gold', label: 'BONUS +20 GOLD' }; }
  // ---------- card (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  document.body.appendChild(card); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; card.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; card.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; card.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; card.style.zoom = short ? '0.85' : mid ? '0.82' : ''; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:15px;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const bar = (lbl, v, a, b, col = '#ec3013') => '<div style="padding:6px 0 2px;font-size:12px;font-weight:900">' + lbl + '</div><div style="position:relative;height:16px;border:2px solid #201e1d;background:#ffffff">' + (a != null ? '<div style="position:absolute;left:' + (a * 100).toFixed(1) + '%;width:' + ((b - a) * 100).toFixed(1) + '%;top:0;bottom:0;background:#ffd23a"></div>' : '') + '<div style="position:absolute;left:0;top:0;bottom:0;width:' + (clamp(v, 0, 1) * 100).toFixed(1) + '%;background:' + col + ';opacity:0.85"></div></div>';
  const btn = (act, txt) => '<button data-act="' + act + '" style="pointer-events:auto;display:block;width:100%;min-height:44px;margin-top:6px;padding:0 10px;text-align:left;font:900 14px Archivo,sans-serif;background:#201e1d;color:#ffd23a;border:2px solid #201e1d;border-radius:0;cursor:pointer">' + txt + '</button>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  card.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-act]'); if (b) { e.stopPropagation(); act(b.getAttribute('data-act')); } });
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const playing = () => busy === 'job' || busy === 'out' || busy === 'zip';
  const blocked = e => { const t = e.target; if (t && t.closest && t.closest('button,a,input,[role="button"],[aria-label]')) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (!playing() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(0); }, true);
  addEventListener('pointermove', e => { if (!playing() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(0.016); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (playing()) release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  const ray = new THREE.Raycaster(), pl = new THREE.Plane(), hitP = V();
  const ptrOnPlane = (n, c) => { ray.setFromCamera(new THREE.Vector2(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1), camera); pl.set(n, c); return ray.ray.intersectPlane(pl, hitP) ? hitP.clone() : null; };
  const holdW = (wall, h) => WALLS[wall].p(h.u, h.y).addScaledVector(WALLS[wall].n, 0.05);
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = smooth(k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const keep = o => { J.objs.push(o); G.add(o); return o; };
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotDone = new THREE.MeshBasicMaterial({ color: 0xf97316, depthTest: false, transparent: true }), dotGeo = new THREE.SphereGeometry(0.018 * (touch ? 1.4 : 1), 8, 6);
  // ================= CLIMBERS =================
  const mkClimber = () => ({ wall: 'main', u: 0, y: 1.95, fu: 0, fy: 0, tu: 0, ty: 0, t: 1, dur: 0.3, then: null, off: 0, phase: 0, fall: null, stand: null, stall: 0, pull: 0 });
  const CLP = mkClimber(), CLC = mkClimber(), CLT = mkClimber();
  const setC = (c, wall, u, y) => { c.wall = wall; c.u = c.tu = u; c.y = c.ty = y; c.t = 1; c.then = null; c.fall = null; c.stand = null; c.off = 0; };
  const moveC = (c, u, y, dur, then) => { c.fu = c.u; c.fy = c.y; c.tu = u; c.ty = y; c.t = 0; c.dur = dur; c.then = then || null; };
  const dropC = (c, toY, then) => { c.fall = { v: 0, toY, then }; c.t = 1; };
  function climbTick(c, dt) { if (c.stall > 0) c.stall -= dt;
    if (c.fall) { c.fall.v = Math.min(14, c.fall.v + 16 * dt); c.y -= c.fall.v * dt; c.phase += dt * 4; if (c.y <= c.fall.toY) { c.y = c.fall.toY; const f = c.fall; c.fall = null; thud(); f.then && f.then(); } return; }
    if (c.t < 1) { c.t = Math.min(1, c.t + dt / c.dur); const e = smooth(c.t); c.u = c.fu + (c.tu - c.fu) * e; c.y = c.fy + (c.ty - c.fy) * e; c.phase += dt * 10; if (c.t >= 1 && c.then) { const f = c.then; c.then = null; f(); } } }
  const harnessPt = c => { const W = WALLS[c.wall]; return W.p(c.u, c.y).addScaledVector(W.n, 0.42 + c.off).add(V(0, -0.98, 0)); };
  // s621b JOINTED CLIMB: the climber's state → climbD (fox-poses). Unjointed foxes keep the old arm swing below.
  function renderJ(c, f, sc) { const U = f.userData, mine = c === CLP && J, ws = f.scale.x || 1;
    if (c.stand) { f.position.set(c.stand[0], 0, c.stand[1]); f.rotation.set(0, c.stand[2], 0); U._clT = (U._clT || 0) + 0.016 * (1 + 3 * (c.pull || 0)); applyD(THREE, f, climbD({ mode: 'belay', ph: U._clT * 3, k: c.brace || 0 }), U._clT, 1); U._climbJ = 1; return; }
    const W = WALLS[c.wall], p = W.p(c.u, c.y).addScaledVector(W.n, 0.42 + c.off); f.position.set(p.x, c.y - 1.9 * sc, p.z); f.rotation.set(0, W.face, 0);
    const wd = (0.42 + c.off) / ws; let o;
    if (c.fall) o = { mode: 'fall', ph: c.phase * 2 };
    else if (mine && J.sub === 'rappel') o = { mode: 'rappel', k: Math.min(1, c.off / 0.6), wd };
    else if (mine && J.sub === 'bell') o = { mode: 'bell', ph: c.phase * 3 + performance.now() / 90, k: 0 };
    else if (mine && J.dy && J.sub === 'dyno' && J.dy.st === 'fly') o = { mode: 'dyno', k: 1, wd };
    else if (c.off < -0.01) o = { mode: 'crouch', k: Math.min(1, -c.off / 0.1), wd: 0.42 / ws };
    else if (c.off > 0.3) o = { mode: 'hang', ph: c.phase };
    else o = { mode: 'climb', ph: c.phase * 0.5, wd };
    applyD(THREE, f, climbD(o), c.phase, 1); U._climbJ = 1; }
  function renderC(c, f, sc = 1) { const U = f.userData, P = U && U.P; if (!P) return; if (P.fore) { renderJ(c, f, sc); return; }
    if (c.stand) { f.position.set(c.stand[0], 0, c.stand[1]); f.rotation.set(0, c.stand[2], 0); if (P.arms) { const k = Math.sin(c.phase * 3) * 0.3 * c.pull; P.arms[0].rotation.x = -1.2 + k; P.arms[1].rotation.x = -1.0 - k; P.arms[0].rotation.z = -0.12; P.arms[1].rotation.z = 0.12; } if (P.legs) { P.legs[0].rotation.x = 0; P.legs[1].rotation.x = 0; } return; }
    const W = WALLS[c.wall], p = W.p(c.u, c.y).addScaledVector(W.n, 0.42 + c.off); f.position.set(p.x, c.y - 1.9 * sc, p.z); f.rotation.set(0, W.face, 0);
    const s = Math.sin(c.phase), air = !!c.fall || c.off > 0.3;
    if (P.arms) { P.arms[0].rotation.x = air ? -2.5 : -2.85 + 0.3 * s; P.arms[1].rotation.x = air ? -2.5 : -2.85 - 0.3 * s; P.arms[0].rotation.z = -0.28; P.arms[1].rotation.z = 0.28; }
    if (P.legs) { P.legs[0].rotation.x = air ? 0.2 : -0.55 + 0.35 * s; P.legs[1].rotation.x = air ? -0.1 : -0.55 - 0.35 * s; }
    if (P.body) P.body.position.y = 0; }
  // ================= THE SESSION =================
  const STEP_N = ['GEAR', 'SET', 'BOULDER', 'DYNO', 'ROPE', 'RAPPEL', 'BELAY', 'SPEED'];
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const tinySays = (t, s = 2) => toast('TINY: "' + t + '"', s), btSays = (t, s = 2.2) => toast('BIG TALL: "' + t + '"', s);
  const newJ = o => ({ gold: 0, pause: 0, t: 0, clean: 0, falls: 0, objs: [], flies: [], sub: '', step: 0, ...o });
  function startSession() { const n = save.stat('rkVisits', 0), ci = n % CUST.length, colI = n % 4; save.setStat('rkVisits', n + 1);
    const order = [0, 1, 2].sort(() => Math.random() - 0.5);
    J = newJ({ ci, C: CUST[ci], col: COLS[colI], order, gi: 0, gearMiss: 0 }); busy = 'job'; J.step = 1; J.sub = 'gear'; placeBT('desk'); pop(); toast('STEP 1 OF 8 · GEAR UP', 2); }
  // ---- 1 GEAR UP: tap the 3 items, then drag the figure-8 knot ----
  function gearTap() { const want = GEAR[J.order[J.gi]], q = nearestOf(GEAR.filter(g => g.g.visible), g => g.g.position, 1.8); if (!q) return;
    if (q !== want) { J.gearMiss++; nope(); btSays('That is the ' + q.name.toLowerCase() + '... ' + want.name.toLowerCase() + ' first.', 1.8); return; }
    grab(); fly(q.g, camera.position.clone().add(V(0, -0.6, 0)), 0.35, 0.2, () => { q.g.visible = false; }); J.gi++; addGold(4);
    if (J.gi >= 3) { if (!J.gearMiss) J.clean++; NEXT('knot', beginKnot, 0.8); } }
  function beginKnot() { J.sub = 'knot'; const pts = []; for (let i = 0; i <= 16; i++) { const t = Math.PI / 2 + i / 16 * Math.PI * 2, d = 1 + Math.sin(t) ** 2; pts.push(KNOT_C.clone().add(V(0.36 * Math.cos(t) / d * 1.0, 0.004, 0.36 * Math.sin(t) * Math.cos(t) / d * 1.1))); }
    J.path = { pts: pts.map(p => { const d = keep(new THREE.Mesh(dotGeo, dotM)); d.position.copy(p); d.renderOrder = 4; return { p, d }; }), i: 0, wob: 0 }; toast('TIE IN · DRAG ALONG THE FIGURE 8', 1.8); }
  function knotDrag(dt) { const Pa = J.path; if (!Pa || Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + 3, Pa.pts.length); j++) if (dist(scrW(Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) { Pa.pts[j].d.material = dotDone; Pa.pts[j].d.scale.setScalar(1.6); } Pa.i = hit + 1; tone(400 + Pa.i * 40, 0.02, 0.07, 'triangle'); if (Pa.i >= Pa.pts.length) knotDone(); }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scrW(Pa.pts[j].p))); if (md > R * 2.6) Pa.wob += dt; } }
  function knotDone() { const clean = J.path.wob < 0.4; if (clean) J.clean++; const g = addGold(clean ? 12 : 7); ding(); btSays(clean ? 'Good knot. I... trust it.' : 'It holds. Good.', 1.8); J.path = null; NEXT('setgo', beginSet, 1.6); }
  // ---- 2 ROUTE SETTING: drag your 5 holds onto the chalk rings (cave) ----
  function beginSet() { J.step = 2; J.sub = 'set'; placeBT('cave'); place(tiny, TNS.cave);
    J.rings = BSET.map(h => { const r = keep(new THREE.Mesh(ringGeo, ringM)); const p = holdW('boulder', h); r.position.copy(p); r.lookAt(p.clone().add(WALLS.boulder.n)); return { h, r, used: false }; });
    J.start = { ...BSTART, m: keep(holdM('boulder', BSTART.u, BSTART.y, J.col.c, 1.3)) }; J.lip = { ...BLIP, m: keep(holdM('boulder', BLIP.u, BLIP.y, J.col.c, 1.5)) };
    const others = COLS.filter(c => c !== J.col); J.decoys = BDECOY.map((h, i) => ({ ...h, m: keep(holdM('boulder', h.u, h.y, others[i % others.length].c, 1.25)) }));
    J.tray = BSET.map((h, i) => { const m = keep(new THREE.Mesh(HG, LM(J.col.c))); m.scale.set(0.07 * 1.3, 0.13 * 1.3, 0.17 * 1.3); const home = V(-215.0, 0.62 + (i % 2) * 0.32, 76.3 + i * 0.5); m.position.copy(home); return { m, home, done: false }; });
    J.held = null; J.setMiss = 0; toast('STEP 2 OF 8 · SET YOUR ROUTE · DRAG THE ' + J.col.k + ' HOLDS ONTO THE RINGS', 2.6); tinySays('MAKE IT GOOD! YOU HAVE TO CLIMB IT!', 2.4); }
  const freeRings = () => J.rings.filter(r => !r.used);
  function setPress() { if (J.flies.length) return; const H = J.held;
    if (H && H.tap) { const r = nearestOf(freeRings(), q => q.r.position, 1.8); if (r) { snapHold(H.t, r); return; } dropHold(H.t, false); J.held = null; }
    const t = nearestOf(J.tray.filter(q => !q.done), q => q.m.position, 1.8); if (t) { J.held = { t, x0: ptr.x, y0: ptr.y, moved: false, tap: false }; pop(); } }
  function setDrag() { const H = J.held; if (!H || !ptr.down) return; if (Math.hypot(ptr.x - H.x0, ptr.y - H.y0) > 10) { H.moved = true; H.tap = false; } if (!H.moved) return;
    const h = ptrOnPlane(V(1, 0, 0), 214.7); if (h) { const y = clamp(h.y, 0.5, 5.4), z = clamp(h.z, 74.8, 83.6); H.t.m.position.copy(WALLS.boulder.p(z, y).addScaledVector(WALLS.boulder.n, 0.12)); } }
  function setRelease() { const H = J.held; if (!H) return; if (!H.moved) { H.tap = true; toast('NOW TAP A WHITE RING', 1.2); return; }
    const sp = scrW(H.t.m.position); let best = null, bd = RAD() * 1.7; for (const r of freeRings()) { const s = scrW(r.r.position), d = Math.hypot(s[0] - sp[0], s[1] - sp[1]); if (d < bd) { bd = d; best = r; } }
    if (best) snapHold(H.t, best); else { dropHold(H.t, true); J.held = null; } }
  function dropHold(t, said) { fly(t.m, t.home, 0.3, 0.1); if (said) { J.setMiss++; nope(); btSays('On the white rings... little one.', 1.6); } }
  function snapHold(t, r) { r.used = true; J.held = null; fly(t.m, holdW('boulder', r.h), 0.2, 0.05, () => { r.r.visible = false; t.done = true; r.h.m = t.m; grab(); addGold(3); const left = J.tray.filter(q => !q.done).length;
      if (!left) { if (!J.setMiss) J.clean++; ding(); tinySays('NICE ROUTE! NOW CLIMB IT!', 1.8); NEXT('bgo', beginBoulder, 1.4); } else toast('SET · ' + left + ' TO GO', 0.9); }); }
  // ---- 3 BOULDER: tap the next hold of YOUR colour ----
  function beginBoulder() { J.step = 3; J.sub = 'boulder'; J.route = [J.start, ...BSET.map(h => ({ u: h.u, y: h.y, m: h.m }))]; J.bi = 0; J.slips = 0; J.slipRow = 0; J.bfalls = 0; setC(CLP, 'boulder', BSTART.u, BSTART.y); J.showFox = true; J.climbing = true;
    toast('STEP 3 OF 8 · BOULDER · TAP THE NEXT ' + J.col.k + ' HOLD', 2.4); }
  function boulderTap() { if (CLP.t < 1 || CLP.fall) return; const all = [...J.route.slice(1).map(h => ({ h, mine: true })), ...J.decoys.map(h => ({ h, mine: false }))];
    const q = nearestOf(all, o => holdW('boulder', o.h), 1.6); if (!q) return; const next = J.route[J.bi + 1];
    if (q.mine && q.h === next) { grab(); J.slipRow = 0; J.bi++; moveC(CLP, next.u, next.y, 0.32, () => { addGold(3); if (J.bi >= J.route.length - 1) { if (!J.slips) J.clean++; tinySays('THE LIP! JUMP FOR IT!', 1.8); NEXT('dgo', beginDyno, 1.0); } }); return; }
    if (q.mine) { nope(); toast('ONE HOLD AT A TIME · THE NEXT ' + J.col.k + ' ONE', 1.4); showHalo('boulder', next.u, next.y); J.haloT = 1.2; return; }
    J.slips++; J.slipRow++; nope(); showHalo('boulder', next.u, next.y); J.haloT = 1.4;
    if (J.slipRow >= 2 || J.bi === 0) { J.slipRow = 0; J.bfalls++; J.falls++; toast('FELL ON THE MAT · TRY AGAIN', 1.6); tinySays('UP YOU GET! AGAIN!', 1.4); dropC(CLP, 1.95, () => { J.bi = 0; setC(CLP, 'boulder', BSTART.u, BSTART.y); }); return; }
    toast('WRONG COLOUR · SLIPPED · ' + J.col.k + ' ONLY', 1.5); J.bi = Math.max(0, J.bi - 1); const b = J.route[J.bi]; moveC(CLP, b.u, b.y, 0.25); }
  // ---- 4 DYNO: hold to charge, let go in the gold, tap at the top ----
  const DY_BAND = [0.65, 0.92];
  function beginDyno() { J.step = 4; J.sub = 'dyno'; J.dy = { st: 'idle', p: 0, d: 1, tries: 0 }; showHalo('boulder', BLIP.u, BLIP.y); toast('STEP 4 OF 8 · DYNO · HOLD TO CHARGE, LET GO IN THE GOLD', 2.4); }
  function dynoPress() { const D = J.dy; if (D.st === 'idle') { D.st = 'charge'; D.p = 0; D.d = 1; tone(220, 0.03, 0.2, 'triangle'); return; }
    if (D.st === 'fly') { if (Math.abs(CLP.y - BLIP.y) < 0.32) { D.st = 'caught'; grab(); CLP.u = BLIP.u; CLP.y = BLIP.y; CLP.off = 0; const clean = D.tries === 0; if (clean) J.clean++; addGold(clean ? 16 : 10); ding(); tinySays('DYNO! DID YOU SEE THAT?! I SAW THAT!', 2); NEXT('topout', topOut, 1.4); } else { D.miss = true; toast(CLP.y < BLIP.y ? 'TOO EARLY' : 'TOO LATE', 1); } } }
  function dynoRelease() { const D = J.dy; if (D.st !== 'charge') return; const p = D.p; D.tries++; whoosh();
    const reach = 0.3 + p * 1.0, vy = Math.sqrt(2 * 9.8 * reach); D.st = 'fly'; D.miss = false; D.t = 0; D.vy = vy; D.y0 = CLP.y; D.u0 = CLP.u; D.reach = reach;
    if (p < DY_BAND[0]) toast('NOT ENOUGH · CHARGE TO THE GOLD', 1.4); else if (p > DY_BAND[1]) toast('TOO MUCH · TAP FAST AT THE TOP', 1.4); else toast('NOW TAP AT THE TOP!', 1); }
  function dynoTick(dt) { const D = J.dy; if (D.st === 'charge') { if (!ptr.down) { dynoRelease(); return; } D.p += D.d * dt * 1.0; if (D.p >= 1) { D.p = 1; D.d = -1; } if (D.p <= 0) { D.p = 0; D.d = 1; } CLP.off = -0.1 * D.p; return; }
    if (D.st === 'fly') { D.t += dt * 0.6; const y = D.y0 + D.vy * D.t - 4.9 * D.t * D.t; CLP.y = y; CLP.u = D.u0 + (BLIP.u - D.u0) * clamp(D.t / 0.5, 0, 1); CLP.off = 0.35 * Math.sin(clamp(D.t / 0.9, 0, 1) * Math.PI); CLP.phase += dt * 3;
      if (y < D.y0 - 0.05 && D.t > 0.1) { D.st = 'fall'; J.falls++; CLP.off = 0; toast('FELL · BIG TALL PUTS YOU BACK UP', 1.6); btSays('Again. You... nearly had it.', 1.6); dropC(CLP, 1.95, () => { J.pause = 0.6; J.after = () => { setC(CLP, 'boulder', D.u0, D.y0); D.st = 'idle'; }; }); } } }
  function topOut() { CLP.stand = null; moveC(CLP, BLIP.u, BLIP.y + 0.35, 0.5, () => { dropC(CLP, 1.95, () => { CLP.stand = [-216.4, 79.4, -Math.PI / 2]; NEXT('ropego', beginRopeMain, 1.0); }); }); }
  // ---- 5 TOP ROPE (and the outside face): GRIP METER ----
  function beginRopeMain() { J.step = 5; place(tiny, TNS.ledge); placeBT('belay'); J.decoys.forEach(h => { h.m.visible = false; }); beginRope(MAIN_R); toast('STEP 5 OF 8 · TOP ROPE · HOLD, LET GO IN THE GOLD TO REACH', 2.6); tinySays('UP HERE! COME UP HERE!', 2); }
  function beginRope(R) { J.R = R; J.sub = 'rope'; J.i = 0; J.S = 1; J.G = 0; J.Gd = 1; J.chalk = 3; J.rfalls = 0; J.over = 0; J.t0 = J.t; setC(CLP, R.wall, R.holds[0].u, R.holds[0].y); J.showFox = true; J.climbing = true; showNext(); }
  const isOver = () => J.R.wall === 'main' && J.R.holds[Math.min(J.i + 1, J.R.holds.length - 1)].y > 8;
  const gBand = () => isOver() ? [0.66, 0.84] : [0.6, 0.87];
  const showNext = () => { const R = J.R, h = R.holds[J.i + 1]; if (h) showHalo(R.wall, h.u, h.y); else halo.visible = false; };
  function ropeTick(dt) { if (CLP.fall) return; const R = J.R; J.S = Math.max(0, J.S - dt * (isOver() ? 0.05 : 0.028));
    if (ptr.down && CLP.t >= 1 && J.charging) { J.G += J.Gd * dt * 1.15; if (J.G >= 1) { J.G = 1; J.Gd = -1; } if (J.G <= 0) { J.G = 0; J.Gd = 1; } }
    if (J.S <= 0) ropeFall('PUMPED OUT · STAMINA GONE'); }
  function ropePress() { if (CLP.t < 1 || CLP.fall) return; J.charging = true; J.G = 0; J.Gd = 1; }
  function ropeRelease() { if (!J.charging) return; J.charging = false; const g = J.G, b = gBand(); J.G = 0; if (g < 0.05) return;
    if (g >= b[0] && g <= b[1]) { const h = J.R.holds[J.i + 1]; grab(); J.i++; J.S = Math.max(0, J.S - 0.02); moveC(CLP, h.u, h.y, 0.4, () => { addGold(2); if (J.i >= J.R.holds.length - 1) { halo.visible = false; J.sub = 'bell'; toast('RING THE BELL · TAP IT', 1.8); tinySays('RING IT! RING IT!', 1.6); } else showNext(); }); return; }
    if (g < b[0]) { J.S = Math.max(0, J.S - 0.06); nope(); toast('TOO SHORT · HOLD LONGER', 1.2); return; }
    J.over++; ropeFall('OVERREACHED · SLIPPED'); }
  function ropeFall(why) { J.falls++; J.rfalls++; J.charging = false; const to = Math.max(0, J.i - 2), h = J.R.holds[to]; toast(why + ' · BIG TALL: "GOT YOU."', 2); nope(); CLP.off = 0.2;
    dropC(CLP, h.y - 0.5, () => { J.i = to; moveC(CLP, h.u, h.y, 0.5, () => { CLP.off = 0; J.S = Math.max(J.S, 0.75); showNext(); }); }); }
  function chalkUp() { if (!J || J.sub !== 'rope' || J.chalk <= 0) return; J.chalk--; J.S = Math.min(1, J.S + 0.35); tone(1200, 0.02, 0.3, 'triangle', 0, 400); toast('CHALKED UP · GRIP +35 %', 1.1); }
  function bellTap() { const R = J.R, bp = R.bell.g ? R.bell.g.position : holdW(R.wall, R.bell); if (dist(scrW(bp)) > RAD() * 2.4 && !J.zip) return; ding(); J.bellT = 1.5; const secs = J.t - J.t0;
    if (J.zip) { NEXT('rapgo', () => beginRappel(R), 1.4); return; }
    const best = addRec(R.key, secs), clean = J.rfalls === 0; if (clean) J.clean++; const g = addGold((clean ? 20 : 12) + (best ? 10 : 0));
    toast('TOP! ' + secs.toFixed(1) + ' S' + (best ? ' · NEW RECORD' : '') + ' · +' + g, 2.4); if (!J.out) tinySays(best ? 'RECORD! THAT IS MY RECORD! WAS!' : 'YOU RANG IT! EVERYONE HEARD!', 2); NEXT('rapgo', () => beginRappel(R), 1.6); }
  // ---- 6 RAPPEL: tap = push off, tap = brake on the yellow tape ----
  const tapeMs = []; const showTapes = (R) => { tapeMs.forEach(m => { G.remove(m); }); tapeMs.length = 0; for (const y of R.bands) { const W = WALLS[R.wall], h = R.holds[0], p = W.p(h.u, y).addScaledVector(W.n, 0.03); const m = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), new THREE.MeshBasicMaterial({ color: 0xffd23a, transparent: true, opacity: 0.55, depthWrite: false })); m.position.copy(p); m.lookAt(p.clone().add(W.n)); G.add(m); tapeMs.push(m); } };
  function beginRappel(R) { if (!J.out && !J.zip) J.step = 6; J.sub = 'rappel'; J.rp = { st: 'hang', v: 0, bi: 0, good: 0, miss: 0 }; showTapes(R); toast((J.out || J.zip ? '' : 'STEP 6 OF 8 · ') + 'RAPPEL · TAP TO DROP, TAP TO BRAKE ON THE YELLOW', 2.6); }
  function rappelTap() { const D = J.rp; if (D.st === 'hang') { D.st = 'drop'; D.v = 0.6; whoosh(); return; } if (D.st === 'drop') { D.st = 'brake'; tone(900, 0.03, 0.2, 'sawtooth', 0, 300); } }
  function rappelTick(dt) { const D = J.rp, R = J.R, band = R.bands[D.bi];
    if (D.st === 'hang') { CLP.off += (0 - CLP.off) * Math.min(1, dt * 4); return; }
    if (D.st === 'drop' || D.st === 'brake') { D.v = D.st === 'drop' ? Math.min(6, D.v + 5 * dt) : Math.max(0, D.v - 16 * dt); CLP.y -= D.v * dt; CLP.off = 0.6 * Math.min(1, D.v / 2.5); CLP.phase += dt * 2;
      if (band == null) { if (CLP.y <= 1.95) { CLP.y = 1.95; land(); } return; }
      if (CLP.y < band - 0.55) { CLP.y = band - 0.55; D.v = 0; D.miss++; D.st = 'hang'; btSays('Whoa... I braked for you.', 1.4); nope(); nextBand(); return; }
      if (D.st === 'brake' && D.v <= 0) { D.st = 'hang'; if (CLP.y <= band + 0.5) { D.good++; addGold(4); grab(); toast('ON THE TAPE · NICE', 1); nextBand(); } else toast('A BIT HIGH · TAP TO DROP AGAIN', 1.2); } } }
  function nextBand() { const D = J.rp; if (tapeMs[D.bi]) tapeMs[D.bi].visible = false; D.bi++; if (D.bi >= J.R.bands.length) { D.st = 'final'; J.pause = 0.5; J.after = () => { D.st = 'drop'; D.v = 1; }; } }
  function land() { const D = J.rp; D.st = 'down'; thud(); tapeMs.forEach(m => { m.visible = false; }); CLP.off = 0;
    if (J.zip) { stop(); toast('DOWN SAFE · THE HOOK IS BACK IN YOUR BAG', 2.2); return; }
    if (J.out) { const g = addGold(D.miss ? 0 : 8); endOut(); return; }
    if (!D.miss) J.clean++; toast('DOWN · ' + D.good + '/3 ON THE TAPE', 1.6); NEXT('belgo', beginBelay, 1.4); }
  // ---- 7 BELAY: hold to take in slack, tap when they fall, hold to lower ----
  function beginBelay() { J.step = 7; J.sub = 'belay'; CLP.stand = [-224.4, 81.4, 0]; CLP.pull = 0; J.climbing = true; placeBT('backup');
    const f = custFox(J.ci); f.visible = true; J.cust = f; setC(CLC, 'main', MAIN_B[0].u, MAIN_B[0].y); J.bl = { i: 0, cd: 1.6, slack: 0.4, fallAt: [4, 7], warn: 0, caught: 0, tight: 0, missed: 0, st: 'climb' };
    toast('STEP 7 OF 8 · BELAY ' + J.C.name + ' · HOLD TO TAKE IN SLACK', 2.6); }
  function belayPress() { const B = J.bl; if (B.st === 'warn') { B.st = 'catch'; catchFall(true); } }
  function catchFall(you) { const B = J.bl, drop = B.slack + (you ? 0.4 : 2.4); if (you) { B.caught++; if (B.slack < 1.0) { B.tight++; addGold(10); toast('TIGHT CATCH · +10', 1.2); } else { addGold(5); toast('CAUGHT · TOO MUCH SLACK', 1.4); } grab(); }
    else { B.missed++; btSays('I have the rope too... always.', 1.6); nope(); }
    const toY = Math.max(1.95, CLC.y - drop); let k = 0; for (let i = 0; i < MAIN_B.length; i++) if (MAIN_B[i].y <= toY + 0.01) k = i; CLC.off = 0.3; B.slack = 0.3;
    dropC(CLC, toY, () => { B.i = k; moveC(CLC, MAIN_B[k].u, MAIN_B[k].y, 0.4, () => { CLC.off = 0; B.st = 'climb'; B.cd = 1.4; }); }); B.st = 'falling'; }
  function belayTick(dt) { const B = J.bl; climbTick(CLC, dt); CLP.pull = ptr.down ? 1 : 0; CLP.phase += dt * (ptr.down ? 4 : 1);
    if (B.st === 'climb' || B.st === 'warn') { if (ptr.down) B.slack = Math.max(0.15, B.slack - dt * 1.0); }
    if (B.st === 'climb' && CLC.t >= 1 && !CLC.fall) { B.cd -= dt; if (B.cd <= 0) { if (B.i >= MAIN_B.length - 1) { B.st = 'bell'; ding(); J.bellT = 1.5; toast(J.C.name + ' RANG THE BELL · NOW HOLD TO LOWER', 2.2); B.cd = 1.0; return; }
        if (B.fallAt.includes(B.i) && !B['f' + B.i]) { B['f' + B.i] = 1; B.st = 'warn'; B.warn = 1.3; nope(); toast('FALLING! TAP NOW!', 1.2); return; }
        B.i++; const h = MAIN_B[B.i]; moveC(CLC, h.u, h.y, 0.55); B.slack = Math.min(3.5, B.slack + 0.32); B.cd = 0.75 + Math.random() * 0.4; } }
    if (B.st === 'warn') { B.warn -= dt; CLC.off = 0.15 * Math.sin(J.t * 30); if (B.warn <= 0) { B.st = 'catch'; catchFall(false); } }
    if (B.st === 'bell') { B.cd -= dt; if (B.cd <= 0) B.st = 'lower'; }
    if (B.st === 'lower') { if (ptr.down) { CLC.y = Math.max(1.95, CLC.y - dt * 1.6); CLC.off = 0.5; CLC.phase += dt * 2; } if (CLC.y <= 1.95) { CLC.off = 0; B.st = 'done';
        const clean = B.missed === 0 && B.tight >= 1; if (clean) J.clean++; const g = addGold(15 + B.tight * 4); CLC.stand = [-223.6, 82.2, Math.PI]; J.cust.userData.mood = J.cust.userData.base = 'happy'; J.cust.userData.hop = 1;
        toast(J.C.name + ': "' + ['You never let me drop far. Thank you.', 'Again tomorrow? Same belayer.', 'I rang it! You heard it!'][J.ci % 3] + '" +' + g, 2.6); NEXT('spdgo', beginSpeed, 2.4); } } }
  // ---- 8 SPEED WALL: race Tiny ----
  function beginSpeed() { J.step = 8; J.sub = 'speed'; if (J.cust) { J.cust.visible = false; } CLC.stand = null; placeBT('speed'); J.race = { tries: (J.race && J.race.tries) || 0 }; resetRace(); toast('STEP 8 OF 8 · SPEED WALL · RACE TINY · TAP THE NEXT HOLD FAST', 2.6); tinySays('MY WALL! MY RECORD! READY?!', 2); }
  function resetRace() { const Rc = J.race; Rc.t = -3.2; Rc.cnt = 3; Rc.my = 0; Rc.mi = 0; Rc.ti = 0; Rc.tt = 0; Rc.myDone = null; Rc.tnDone = null; Rc.pace = 0.74 + Rc.tries * 0.1; Rc.tcd = 0;
    setC(CLP, 'speed', SPD_A[0].u, SPD_A[0].y); CLP.stand = null; setC(CLT, 'speed', SPD_B[0].u, SPD_B[0].y); J.showFox = true; J.climbing = true; drawTimer('0.00', '0.00'); halo.visible = false; }
  function speedTap() { const Rc = J.race; if (Rc.t < 0 || Rc.myDone != null || CLP.t < 1 || CLP.stall > 0) return;
    const tgt = Rc.mi < SPD_A.length - 1 ? holdW('speed', SPD_A[Rc.mi + 1]) : V(-237.2, 15.2, SPL.a);
    if (dist(scrW(tgt)) > RAD() * 2.0) { CLP.stall = 0.35; nope(); toast('SLIP', 0.5); return; }
    if (Rc.mi >= SPD_A.length - 1) { Rc.myDone = Rc.t; beep(true); finishCheck(); return; }
    Rc.mi++; const h = SPD_A[Rc.mi]; grab(); moveC(CLP, h.u, h.y, 0.15); }
  function speedTick(dt) { const Rc = J.race; climbTick(CLT, dt); const prev = Rc.t; Rc.t += dt;
    if (Rc.t < 0) { const c = Math.ceil(-Rc.t); if (c !== Rc.cnt && c > 0) { Rc.cnt = c; beep(false); } if (Math.ceil(-prev) > 0 && Rc.t >= 0) {} return; }
    if (prev < 0) { beep(true); toast('GO!', 0.8); }
    if (Rc.tnDone == null) { Rc.tcd -= dt; if (Rc.tcd <= 0 && CLT.t >= 1) { if (Rc.ti >= SPD_B.length - 1) { Rc.tnDone = Rc.t; beep(true); finishCheck(); } else { Rc.ti++; const h = SPD_B[Rc.ti]; moveC(CLT, h.u, h.y, 0.2); Rc.tcd = Rc.pace - 0.2 + Math.random() * 0.08; } } }
    const nxt = Rc.myDone == null ? (Rc.mi < SPD_A.length - 1 ? SPD_A[Rc.mi + 1] : { u: SPL.a, y: 15.2 }) : null; if (nxt) showHalo('speed', nxt.u, nxt.y); else halo.visible = false;
    if (((Rc.t * 10) | 0) !== ((prev * 10) | 0)) drawTimer((Rc.myDone ?? Rc.t).toFixed(2), (Rc.tnDone ?? Rc.t).toFixed(2));
    if (Rc.tnDone != null && Rc.myDone == null && Rc.t > Rc.tnDone + 6) { Rc.myDone = Rc.t; finishCheck(); } }
  function finishCheck() { const Rc = J.race; drawTimer((Rc.myDone ?? Rc.t).toFixed(2), (Rc.tnDone ?? Rc.t).toFixed(2)); if (Rc.myDone == null) return; if (Rc.tnDone == null) { Rc.tnDone = Rc.t + Rc.pace * (SPD_B.length - 1 - Rc.ti) + 0.3; }
    drawTimer(Rc.myDone.toFixed(2), Rc.tnDone.toFixed(2)); halo.visible = false; const win = Rc.myDone < Rc.tnDone;
    if (win) { const best = addRec('speed', Rc.myDone); if (Rc.tries === 0) J.clean++; const g = addGold(30 + (best ? 15 : 0)); ding(); tinySays(best ? 'NO! NO!! THE RECORD! ...OK THAT WAS AMAZING!' : 'YOU BEAT ME?! REMATCH! NEXT TIME!', 2.4); toast('YOU WIN · ' + Rc.myDone.toFixed(2) + ' S · +' + g, 2.4); J.race.done = true; NEXT('fin', endSession, 2.6); return; }
    Rc.tries++; if (Rc.tries < 3) { tinySays('HA! TOO SLOW! AGAIN! I WILL GO SLOWER... A BIT!', 2.2); toast('TINY WINS · ' + Rc.tnDone.toFixed(2) + ' S · REMATCH', 2.2); J.falls++; J.pause = 2.6; J.after = () => { J.sub = 'speed'; resetRace(); }; J.sub = 'speedwait'; return; }
    addGold(10); tinySays('GOOD RACE! YOU ARE FAST! I AM FASTER! FOR NOW!', 2.2); NEXT('fin', endSession, 2.6); }
  function endSession() { const gold0 = J.gold, cl = J.clean, clean = cl >= 6, C = J.C, first = !K.stars('session'); let bonus = 0; if (clean) bonus = addGold(15); const gift = giveGift(); save.best && save.best('rkBest', J.gold); stop(); placeBT('desk');
    const gold = gold0 + bonus; K.finish('session', cl >= 6 ? 3 : cl >= 3 ? 2 : 1, gold, first);
    toast('SESSION DONE · +' + gold + ' GOLD · ' + gift.label, 3.5);
    const OPEN = ['Eight climbs... all of them. ' + gold + ' gold.', 'Good session. ' + gold + ' gold.', 'You fell. You got up. ' + gold + ' gold.', gold + ' gold. I am... proud.'][save.stat('rkClears', 1) % 4];
    const GIFT = { shoes: 'Climbing shoes... yours now.', harness: 'Your own harness and rope. The MY GEAR hook takes it off.', hook: 'A grappling hook. Find the yellow anchors... tap it in ITEMS.',
      medal: 'The summit medal. Your name is on the frame.', gold: 'A little gold... for a good day.' }[gift.kind];
    sayTo(endT, [lb(OPEN + ' ' + GIFT)], null, true); }
  // ---- the outside face + grappling hook ----
  const sessionsDone = () => save.stat('rkClears', 0) > 0;
  function startOut() { prepOut(); J = newJ({ out: true, C: { name: 'OUTSIDE' } }); busy = 'out'; J.sub = 'rope'; placeBT('out'); beginRope(OUT_R); toast('THE OUTSIDE FACE · HOLD, LET GO IN THE GOLD', 2.4); tinySays('OUTSIDE! IN THE WIND! BRAVE!', 2); }
  function endOut() { const secs = J.t - J.t0; const first = !save.stat('rkOutDone', false); save.setStat('rkOutDone', true); const g = addGold(first ? 30 : 10); stop(); placeBT('desk'); toast('OUTSIDE FACE DONE · +' + J0gold(g) + ' GOLD', 2.6); }
  const J0gold = g => g;
  function startZip(R) { if (R.wall === 'out') prepOut(); J = newJ({ zip: true, C: { name: 'HOOK' } }); busy = 'zip'; J.R = R; J.sub = 'zip'; J.i = R.holds.length - 1; J.S = 1; J.G = 0; J.chalk = 0; J.showFox = true; J.climbing = true; J.t0 = 0; const h0 = R.holds[0], top = R.holds[R.holds.length - 1]; setC(CLP, R.wall, h0.u, h0.y); zip(); CLP.off = 0.3;
    moveC(CLP, top.u, top.y, 1.6, () => { CLP.off = 0; J.sub = 'bell'; toast('AT THE TOP · TAP THE BELL', 1.6); }); toast('GRAPPLING HOOK · ZIIIP', 1.4); }
  // ---- gear hook (MY GEAR) ----
  function openHook() { busy = 'hook'; drawHook(); }
  function drawHook() { const w = wearSt(), ownS = !!save.stat('rkShoes', false), ownH = !!save.stat('rkHarness', false); cardKey = '';
    setCard('hook' + Math.random(), head('MY GEAR', 'BIG TALL\'S') + '<div style="padding:8px 10px 10px"><div style="font-size:13px;margin-bottom:2px">Wear it everywhere in Meru 2.</div>' + (ownS ? btn('shoes', 'CLIMBING SHOES · ' + (w.shoes ? 'ON' : 'OFF')) : '') + (ownH ? btn('harness', 'HARNESS + ROPE · ' + (w.harness ? 'ON' : 'OFF')) : '') + btn('done', 'DONE') + '</div>'); }
  function act(a) { if (a === 'chalk') { chalkUp(); return; } if (busy !== 'hook') return; if (a === 'done') { busy = null; hideCard(); return; } const w = wearSt(); setWear(a, !w[a]); pop(); drawHook(); }
  // ================= DISPATCH + CARD =================
  function press() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'gear') gearTap(); else if (s === 'set') setPress(); else if (s === 'boulder') boulderTap(); else if (s === 'dyno') dynoPress(); else if (s === 'rope') ropePress(); else if (s === 'bell') bellTap(); else if (s === 'rappel') rappelTap(); else if (s === 'belay') belayPress(); else if (s === 'speed') speedTap(); }
  function drag(dt) { if (!J || J.pause > 0) return; if (J.sub === 'knot') knotDrag(dt); else if (J.sub === 'set') setDrag(); }
  function release() { if (!J) return; if (J.sub === 'set') setRelease(); else if (J.sub === 'dyno') dynoRelease(); else if (J.sub === 'rope') ropeRelease(); }
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 2px;font-size:8px;font-weight:900;border:2px solid #201e1d;overflow:hidden;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J) return; const s = J.sub; let next = '', det = '', key = s + J.step, r = v => Math.round(v * 30);
    if (s === 'gear' || s === 'knot' || s === 'setgo') { const done = J.gi; key += done + '_' + (J.path ? J.path.i : '');
      next = s === 'gear' ? 'TAP THE ' + GEAR[J.order[Math.min(2, J.gi)]].name : 'DRAG ALONG THE FIGURE 8';
      det = J.order.map((k, i) => row(i === 0 ? RED : i === 1 ? RED : WHITE, GEAR[k].name, i < done ? '\u2713' : i === done && s === 'gear' ? 'NOW' : '\u2014', i < done)).join('') + row(ORANGE, 'FIGURE 8 KNOT', s === 'gear' ? '\u2014' : J.path ? J.path.i + '/' + J.path.pts.length : '\u2713', !J.path && s !== 'gear'); }
    else if (s === 'set' || s === 'bgo') { const d = J.tray.filter(q => q.done).length; key += d + (J.held ? (J.held.tap ? 't' : 'h') : ''); next = J.held && J.held.tap ? 'TAP A WHITE RING' : 'DRAG A ' + J.col.k + ' HOLD ONTO A RING'; det = row(J.col.c, 'YOUR COLOUR · ' + J.col.k, '', false) + row(WHITE, 'HOLDS SET', d + '/5', d >= 5); }
    else if (s === 'boulder' || s === 'dgo') { key += J.bi + '_' + J.slips; next = 'TAP THE NEXT ' + J.col.k + ' HOLD'; det = row(J.col.c, J.col.k + ' ONLY', (J.bi) + '/' + (J.route.length - 1), false) + row(INK, 'SLIPS', String(J.slips), false); }
    else if (s === 'dyno' || s === 'topout' || s === 'ropego') { const D = J.dy; key += D.st + r(D.p); next = D.st === 'idle' ? 'HOLD TO CHARGE' : D.st === 'charge' ? 'LET GO IN THE GOLD' : D.st === 'fly' ? 'TAP AT THE TOP!' : 'DYNO!'; det = bar('POWER', D.p, DY_BAND[0], DY_BAND[1]); }
    else if (s === 'rope' || s === 'bell' || s === 'rapgo') { const b = gBand(); key += r(J.S) + '_' + r(J.G) + '_' + J.i + '_' + J.chalk + s; next = s === 'bell' ? 'TAP THE BELL' : J.charging ? 'LET GO IN THE GOLD' : 'HOLD TO REACH';
      det = row(YEL, J.R.name, J.i + '/' + (J.R.holds.length - 1), J.i >= J.R.holds.length - 1) + bar('REACH' + (isOver() ? ' · ROOF' : ''), J.G, b[0], b[1]) + bar('GRIP', J.S, null, null, J.S < 0.3 ? '#ec3013' : '#3f9a5e'); }
    else if (s === 'rappel' || s === 'belgo') { const D = J.rp; key += D ? D.st + D.bi : ''; next = !D ? '' : D.st === 'hang' ? 'TAP TO DROP' : D.st === 'drop' ? 'TAP TO BRAKE ON THE YELLOW' : 'DOWN'; det = D ? row(YEL, 'YELLOW TAPE', D.good + '/' + J.R.bands.length, D.good >= J.R.bands.length) + row(INK, 'OVERSHOT', String(D.miss), false) : ''; }
    else if (s === 'belay' || s === 'spdgo') { const B = J.bl; key += B.st + r(B.slack / 3.5) + B.i; next = B.st === 'warn' ? 'TAP NOW · CATCH!' : B.st === 'lower' ? 'HOLD TO LOWER' : B.st === 'done' ? 'NICE BELAY' : 'HOLD TO TAKE IN SLACK';
      det = '<div style="font-weight:900;font-size:14px">' + J.C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + J.C.forW + '</span></div>' + (innerHeight > 700 ? '<div style="font-size:13px;font-style:italic;margin:2px 0 4px">"' + J.C.say + '"</div>' : '') + bar('SLACK', B.slack / 3.5, 0, 0.29, B.slack > 2.2 ? '#ec3013' : '#201e1d') + row(GREEN, 'CATCHES', B.caught + (B.tight ? ' · ' + B.tight + ' TIGHT' : ''), false); }
    else if (s === 'speed' || s === 'speedwait' || s === 'fin') { const Rc = J.race; key += (Rc.t < 0 ? Math.ceil(-Rc.t) : 'g') + Rc.mi + '_' + Rc.ti + (Rc.myDone != null) + Rc.tries; next = Rc.t < 0 ? 'READY · ' + Math.ceil(-Rc.t) : Rc.myDone == null ? (Rc.mi >= SPD_A.length - 1 ? 'TAP THE BUTTON!' : 'TAP THE NEXT HOLD!') : 'DONE';
      det = row(RED, 'YOU', Rc.mi + '/' + (SPD_A.length - 1), Rc.myDone != null) + row(YEL, 'TINY', Rc.ti + '/' + (SPD_B.length - 1), Rc.tnDone != null) + row(INK, 'TRY', (Rc.tries + 1) + ' OF 3', false); }
    else return;
    const total = J.out || J.zip ? '' : 'STEP ' + J.step + ' OF 8';
    setCard(key, head(total || (J.zip ? 'GRAPPLING HOOK' : 'OUTSIDE FACE'), J.gold ? J.gold + ' G' : (J.out || J.zip ? '' : J.col.k + ' ROUTE')) + foot(next) + (s === 'rope' && J.chalk != null ? '<div style="padding:0 10px">' + btn('chalk', 'CHALK UP · ' + J.chalk + ' LEFT') + '</div>' : '') + '<div style="padding:8px 10px 10px">' + (!J.out && !J.zip && innerHeight >= 720 ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { if (J.path) J.path = null; J.objs.forEach(o => o.parent && o.parent.remove(o)); if (J.cust) { J.cust.visible = false; J.cust.userData.mood = J.cust.userData.base = 'neutral'; } }
    GEAR.forEach(q => { q.g.visible = true; q.g.position.copy(q.home); }); J = null; ptr.down = false; halo.visible = false; ROPE1.hide(); ROPE2.hide(); tapeMs.forEach(m => { m.visible = false; }); setC(CLT, 'speed', SPD_B[0].u, SPD_B[0].y); CLP.stand = null; CLC.stand = null;
    hideCard(); placeBT('desk'); place(tiny, TNS.ledge); }
  // ---------- per-frame session tick ----------
  function jobTick(dt) { J.t += dt; if (J.flies.length) flyTick(dt); if (J.haloT > 0) { J.haloT -= dt; if (J.haloT <= 0 && (J.sub === 'boulder')) halo.visible = false; }
    if (J.path && J.path.pts) { const ph = 1 + 0.35 * Math.sin(performance.now() / 140); J.path.pts.forEach((q, i) => { if (q.d) q.d.scale.setScalar(i === J.path.i ? ph : 1); }); }
    climbTick(CLP, dt); haloM.opacity = 0.55 + 0.4 * Math.sin(performance.now() / 140);
    if (J.bellT > 0) { J.bellT -= dt; const bg = J.R && J.R.bell && J.R.bell.g; if (bg) bg.rotation.z = Math.sin(J.bellT * 30) * 0.4 * J.bellT; }
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } drawCard(); return; }
    const s = J.sub; if (s === 'dyno') dynoTick(dt); else if (s === 'rope') ropeTick(dt); else if (s === 'rappel') rappelTick(dt); else if (s === 'belay') belayTick(dt); else if (s === 'speed') speedTick(dt);
    drawCard(); }
  function ropesTick() { if (!J) { ROPE1.hide(); ROPE2.hide(); return; } const s = J.sub;
    if (J.R && ['rope', 'bell', 'rappel', 'zip', 'rapgo', 'ropego'].includes(s) && !CLP.stand) { const R = J.R, a = R.anchor, hp = harnessPt(CLP); const bt = bigTall.position, hand = V(bt.x, 1.5, bt.z + (R.wall === 'out' ? -0.4 : 0.4));
      ROPE1.set(J.out || J.zip ? [V(a.x + 0.3, 0.9, a.z - 0.3), a, hp] : [hand, a, hp]); ROPE2.hide(); return; }
    if (s === 'belay' && J.bl) { const a = V(MAIN_B[0].u, 13.45, 83.45), hp = harnessPt(CLC), me = V(-224.4, 1.2, 81.7), sag = V(-224.3, Math.max(0.2, 1.1 - J.bl.slack * 0.35), 82.4); ROPE1.set([me, sag, a, hp]); ROPE2.hide(); return; }
    if ((s === 'speed' || s === 'speedwait' || s === 'fin') && J.race) { ROPE1.set([V(-237.0, 16.2, SPL.a), harnessPt(CLP)]); ROPE2.set([V(-237.0, 16.2, SPL.b), harnessPt(CLT)]); return; }
    ROPE1.hide(); ROPE2.hide(); }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  const cTgt = (c, dy) => { const W = WALLS[c.wall]; return W.p(c.u, c.y + dy).addScaledVector(W.n, 0.4); };
  function shot() { if (!J || !playing()) return null; const s = J.sub;
    if (s === 'gear' || s === 'knot') return [V(-233.6, 1.1, 64.0), 3.2, 1.6, 0.8, 1.8, 0, 3.6];
    if (s === 'setgo' || s === 'set' || s === 'bgo') return [V(-214.9, 2.9, 78.0), 3.8, 5.4, 0.12, 3, -Math.PI / 2, 8];
    if (s === 'boulder' || s === 'dyno' || s === 'dgo' || s === 'topout' || s === 'ropego') return [cTgt(CLP, 0.1), 4.4, 5.6, -0.1, 5.2, -Math.PI / 2 + 0.25, 8];
    if (s === 'belay' || s === 'spdgo') { const cy = CLC.y; return [V(-224.5, (1.2 + cy) / 2 + 0.3, 82.8), 4.6, Math.max(6, cy + 2), -0.12, 6.2, Math.PI + 0.15, 16]; }
    if (s === 'speed' || s === 'speedwait' || s === 'fin') return [V(-236.9, Math.max(1.6, CLP.y * 0.75 + CLT.y * 0.25 - 0.4), 76.6), 5.0, 5.2, -0.15, 5, Math.PI / 2 + 0.15, 9];
    if (J.R) return [cTgt(CLP, 0.0), 4.6, 6.0, -0.2, 5.6, WALLS[J.R.wall].yaw + 0.22, 10];
    return null; }
  let near0 = null, fovP = null; const hidArms = [], lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function hideArms(fox, on) { if (!on) { hidArms.forEach(o => { o.visible = true; }); hidArms.length = 0; return; } const P = fox && fox.userData && fox.userData.P; if (!P) return; for (const k of Object.keys(P)) { if (!/sword|gun|laser|blaster|weapon|pin|rod/i.test(k)) continue; const o = P[k]; if (o && o.isObject3D && o.visible) { o.visible = false; hidArms.push(o); } } }
  function camFix(cam, dt, fox) { if (fox) { applyWear(fox, !!(J && J.climbing)); }
    if (fox && J && playing()) { if (J.showFox) { fox.visible = true; renderC(CLP, fox); hideArms(fox, true); } else fox.visible = false; } else { if (hidArms.length) hideArms(fox, false); if (fox && fox.userData._climbJ) { fox.userData._climbJ = 0; endPose(fox); } }
    const v = shot(); if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens
    fitCam(v);
    if (!(J && J.out) && !(J && J.zip && J.R.wall === 'out')) { camT.pos.x = clamp(camT.pos.x, X0 + 0.4, X1 - 0.4); camT.pos.z = clamp(camT.pos.z, Z0 + 0.4, Z1 - 0.4); } camT.pos.y = clamp(camT.pos.y, 0.5, HT - 0.6);
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || (J.flies && J.flies.length)) return null; const s = J.sub;
    if (s === 'gear') { const q = GEAR[J.order[J.gi]]; return q ? [q.g.position.clone(), 'TAP THE ' + q.name] : null; }
    if (s === 'knot' && J.path && J.path.i < J.path.pts.length) return [J.path.pts[J.path.i].p, 'DRAG ALONG THE FIGURE 8'];
    if (s === 'set') { const r = freeRings()[0]; if (J.held && J.held.tap) return r ? [r.r.position.clone(), 'TAP A WHITE RING'] : null; const t = J.tray.find(q => !q.done); return t ? [t.m.position.clone(), 'DRAG IT ONTO A RING'] : null; }
    if (s === 'boulder') { const n = J.route[J.bi + 1]; return n ? [holdW('boulder', n), 'TAP THE NEXT ' + J.col.k + ' HOLD'] : null; }
    if (s === 'bell') return [J.R.bell.g ? J.R.bell.g.position.clone() : holdW(J.R.wall, J.R.bell), 'TAP THE BELL'];
    if (s === 'speed' && J.race && J.race.t >= 0 && J.race.myDone == null) return [J.race.mi < SPD_A.length - 1 ? holdW('speed', SPD_A[J.race.mi + 1]) : V(-237.2, 15.2, SPL.a), J.race.mi < SPD_A.length - 1 ? 'TAP THE NEXT HOLD' : 'TAP THE BUTTON'];
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const SPOT = { start: { x: -233.5, z: 66.3, r: 1.0 }, hook: { x: -236.6, z: 68.6, r: 0.9 }, out: OUT_SPOT };
  for (const s of [SPOT.start, SPOT.hook]) { const a = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.012, 22), LM(YEL)); a.position.set(s.x, 0.075, s.z); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.014, 22), LM(INK)); b.position.set(s.x, 0.077, s.z); G.add(a, b); }
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 2.5;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  const ownGear = () => !!(save.stat('rkShoes', false) || save.stat('rkHarness', false));
  const nearMain = P => inShop(P) && P.z > 76 && P.x > MW.x0 - 1 && P.x < MW.x1 + 1;
  function prompt(P) { if (busy) return null; if (at(P, SPOT.out) && !(inside && inside())) return sessionsDone() ? 'CLIMB THE OUTSIDE FACE' : 'OUTSIDE FACE · FINISH A SESSION INSIDE FIRST';
    if (!inShop(P) || P.skate) return null; if (at(P, SPOT.start)) return 'START A SESSION · 8 CLIMBS'; if (at(P, SPOT.hook) && ownGear()) return 'MY GEAR · WEAR IT IN TOWN'; if (K.atHiring(P)) return 'NOW HIRING · START WORK';
    if (near(P, btT)) return 'TALK · BIG TALL'; if (near(P, tnT)) return 'TALK · TINY'; return null; }
  // s70: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last); Tiny = one box
  const HELLO = ['Hello... little one. I am Big Tall. Eight climbs, one session. You fall, I hold the rope.', 'Back... good. The yellow mark by the desk is free.', 'The wall is waiting. So am I... slowly.', 'Chalk up. Eight climbs today?'];
  const TIPS = ['Chalk... is for hands. Not for faces. Tell Tiny.', 'The roof up there... it bites. Breathe.', 'I have never fallen far. I am... too tall.', 'Feet first. Then hands. Then... courage.', "The speed wall is Tiny's. Do not tell him... I let him win."];
  let lastP = null; const goWork = P => { if (P) Object.assign(P, { x: SPOT.start.x, z: SPOT.start.z, sp: 0 }); startSession(); };
  const btMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) goWork(lastP); } }, ...(ownGear() ? [{ text: 'MY GEAR', pick: () => { if (!busy) openHook(); } }] : []),
      { text: 'A CLIMBING TIP, PLEASE', pick: () => sayTo(btT, [lb(TIPS[talkedB % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(btT, [{ ...lb(first ? HELLO[0] : HELLO[1 + (talkedB % 3)]), choices: ch }]); };
  const TN_TALK = [[lt('SPEED WALL RECORD! SEVEN POINT FOUR TWO! MINE! COME AND TAKE IT!')], [lt('LEGS ARE STRONGER THAN ARMS! USE THEM! I DON\'T, BUT YOU SHOULD!')], [lt('I CAN SEE YOUR HOUSE FROM HERE! PROBABLY!')], [lt('BIG TALL CAUGHT ME FOUR HUNDRED TIMES! I COUNTED! HE DIDN\'T!')]];
  function talk(P) { lastP = P; if (busy === 'hook') { busy = null; hideCard(); return true; } if (busy) return true;
    if (at(P, SPOT.out) && !(inside && inside())) { if (!sessionsDone()) { toast('BIG TALL WANTS YOU TO DO A SESSION INSIDE FIRST', 2.2); return true; } startOut(); return true; }
    if (!inShop(P) || P.skate) return false;
    if (at(P, SPOT.start)) { startSession(); return true; } if (at(P, SPOT.hook) && ownGear()) { openHook(); return true; }
    if (K.atHiring(P)) { ding(); goWork(P); return true; }
    if (near(P, btT)) { pop(); btMenu(!talkedB++); return true; }
    if (near(P, tnT)) { pop(); sayTo(tnT, !talkedT++ ? [lt("HEY! DOWN THERE! I'M TINY! I COACH! BIG TALL HOLDS THE ROPE! YELLOW MARK BY THE DESK!")] : TN_TALK[talkedT % TN_TALK.length]); return true; }
    return false; }
  function useItem(id, P) { if (id !== 'grapplingHook' || !save.count('grapplingHook')) return false; if (busy) return true;
    if (Math.hypot(P.x - OUTU, P.z - 58.5) < 6 && !(inside && inside())) { startZip(OUT_R); return true; }
    if (nearMain(P)) { startZip(MAIN_R); return true; }
    toast('NO ANCHOR HERE · TRY THE ROCK WALL (INSIDE OR THE FACE OUTSIDE)', 2.4); return true; }
  function quit() { if (busy === 'hook') { busy = null; hideCard(); return; } stop(); toast('SESSION STOPPED · GOLD KEPT', 2); }
  function tick(dt, P, fox) { dt = Math.min(dt, 0.05); const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); G.visible = d < (touch ? 45 : 90); toastT -= dt;
    if (busy === 'job' && !inShop(P)) stop(); if ((busy === 'out' || (busy === 'zip' && J && J.R.wall === 'out')) && Math.hypot(P.x - OUTU, P.z - 58) > 9) stop(); if (busy === 'zip' && J && J.R.wall === 'main' && !inShop(P)) stop();
    medal.visible = save.count('summitMedal') > 0;
    if (!G.visible) return; lastP = P; if (playing() && J) jobTick(dt); hintTick(t);
    ropesTick();
    const tinyClimb = J && J.race && (J.sub === 'speed' || J.sub === 'speedwait' || J.sub === 'fin') && !J.race.done;
    if (tinyClimb) renderC(CLT, tiny, 0.62); else { if (tiny.userData._climbJ) { tiny.userData._climbJ = 0; endPose(tiny); } if (!(J && (J.sub === 'set' || J.sub === 'bgo' || J.sub === 'boulder' || J.sub === 'dyno' || J.sub === 'dgo' || J.sub === 'topout'))) { if (tiny.position.y < 1 || tiny.position.x > -220) place(tiny, TNS.ledge); }
      const lk = (tiny.userData.face0 ?? 0) + Math.sin(t * 1.3) * 0.5; tiny.rotation.y = lk; tiny.userData.hop = (Math.sin(t * 2.1) > 0.97) ? 1 : tiny.userData.hop; kit.animFox && kit.animFox(tiny, dt, 0); }
    if (J && J.cust && J.cust.visible) { if (CLC.stand) { renderC(CLC, J.cust); kit.animFox && kit.animFox(J.cust, dt, 0); } else renderC(CLC, J.cust); }
    { const work = !!busy && busy !== 'hook'; K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: work });
      if (work) { const f0 = bigTall.userData.face0 ?? 0; bigTall.rotation.y += Math.atan2(Math.sin(f0 - bigTall.rotation.y), Math.cos(f0 - bigTall.rotation.y)) * Math.min(1, dt * 2); }
      if (J && J.R && (J.sub === 'rope' || J.sub === 'rappel') && bigTall.userData.P) { const A = bigTall.userData.P.arms; if (bigTall.userData.P.fore) { applyD(THREE, bigTall, climbD({ mode: 'belay', ph: t * (J.sub === 'rappel' ? 1.5 : 3), k: J.rp && J.rp.st === 'brake' ? 1 : 0 }), t, 1); bigTall.userData._climbJ = 1; } else if (A) { A[0].rotation.x = -1.4 + Math.sin(t * 2) * 0.1; A[1].rotation.x = -1.1; } } else if (bigTall.userData._climbJ) { bigTall.userData._climbJ = 0; endPose(bigTall); } } }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, startSession, startOut, startZip: k => startZip(k === 'out' ? OUT_R : MAIN_R), bigTall, tiny, camera, save, useItem, chalkUp, clp: CLP, clc: CLC,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(0); ptr.down = false; if (playing()) release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(0); }, dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.x = x; ptr.y = y; drag(dt); }, release() { ptr.down = false; if (playing()) release(); },
    targets() { if (!J) return []; const s = J.sub; if (s === 'gear') return [scrW(GEAR[J.order[J.gi]].g.position)]; if (s === 'knot' && J.path) return J.path.pts.slice(J.path.i).map(q => scrW(q.p));
      if (s === 'set') { const t = J.tray.find(q => !q.done), r = freeRings()[0]; return t && r ? [scrW(t.m.position), scrW(r.r.position)] : []; }
      if (s === 'boulder') { const n = J.route[J.bi + 1]; return n ? [scrW(holdW('boulder', n))] : []; } if (s === 'bell') return [scrW(J.R.bell.g ? J.R.bell.g.position : holdW(J.R.wall, J.R.bell))];
      if (s === 'speed' && J.race) return [scrW(J.race.mi < SPD_A.length - 1 ? holdW('speed', SPD_A[J.race.mi + 1]) : V(-237.2, 15.2, SPL.a))]; return []; },
    setG(v) { if (J) J.G = v; }, setP(v) { if (J && J.dy) J.dy.p = v; },
    skipTo(s) { if (!J) startSession(); J.pause = 0; J.after = null; J.flies.length = 0; GEAR.forEach(q => { q.g.visible = false; });
      if (['set', 'boulder', 'dyno'].includes(s)) { beginSet(); if (s !== 'set') { J.tray.forEach((t, i) => { const r = J.rings[i]; r.used = true; r.r.visible = false; t.done = true; r.h.m = t.m; t.m.position.copy(holdW('boulder', r.h)); }); beginBoulder(); if (s === 'dyno') { J.bi = J.route.length - 1; const h = J.route[J.bi]; setC(CLP, 'boulder', h.u, h.y); beginDyno(); } } }
      else if (s === 'rope') { J.decoys = []; beginRopeMain(); } else if (s === 'rappel') { J.decoys = []; J.step = 5; J.R = MAIN_R; J.showFox = true; J.climbing = true; const h = MAIN_A[MAIN_A.length - 1]; setC(CLP, 'main', h.u, h.y); J.t0 = J.t; beginRappel(MAIN_R); }
      else if (s === 'belay') { J.decoys = []; beginBelay(); } else if (s === 'speed') { J.decoys = []; beginSpeed(); } },
    hiring: K, dispose() { card.remove(); HINT.remove(); K.dispose(); } };
  window.__rock = API; return API;
}
