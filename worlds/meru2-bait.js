// MERU 2.0 — s52 TOWN 2 INTERIOR 10: REEL'S BAIT & TACKLE [meruBait] (f -27..-15 × 204..214, door E (-15, 209), back door S (-21, 214) → porch → boardwalk → REEL'S JETTY (layout LAKE.jetties baitJetty)).
// REEL (Ben's pick): young tan fox, fishing vest full of lures, cap; talks fast about records.
// TWO GAMES (Ben): 1 THE BAIT JOB = one customer, 5 steps in a row: DIG worms · TIE a lure · SCOOP minnows · WEIGH their catch (record board) · SORT & ICE.
// 2 DOCK FISHING = free, relaxed, stay as long as you like: tap the water to cast, tap when it bites, hold to reel. A FISH BOOK fills up. NELLY can take the line (rare).
// The 2D game's fishing kept as stock + prizes: Twig / Bamboo / Steel rod, Plain Worm / Shiny Lure / Golden Bait. Bamboo or better = fish from any lake shore or jetty.
// GENTLE (Ben): no fail anywhere. Prizes: Bamboo rod → hat + vest → Steel rod → Golden Bait ×3 → Lucky Hook → then lures / bait. Your record catches go on the board (+ a plaque).
// s70 INTERIOR POLISH 10: shopKit (Reel = keeper: idle, wave, look-at; browsers; chime; sun + dust / lamps; clock; BEST board JOB; badge), NOW HIRING by the door,
// ONE-box menu with choices, 1-box end line, hint hand, touch radius 44 + bigger pulsing dots, portrait lens + room-clamped job cameras.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { lakeF, LAKE } from './meru2-layout.js';
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
export function buildBaitShop({ THREE, scene, kit, cols, save, touch, sayTo, camera, inside, hour = () => 12, isMuted = () => false }) { const JW = jobWorker(THREE);
  const X0 = -26.6, X1 = -15.4, Z0 = 204.4, Z1 = 213.6, CX = -21, CZ = 209, WY = 0.1;
  const G = new THREE.Group(); G.name = 'baitShop'; scene.add(G); const OUT = new THREE.Group(); OUT.name = 'baitOutside'; scene.add(OUT);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), rnd = (a, b) => a + Math.random() * (b - a), pickOf = a => a[Math.floor(Math.random() * a.length)];
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 9, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const R0 = mk(), { put, box, cyl, sph } = R0;
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', NAVY = '#2e4a6b', BLUE = '#2e86b8', GREEN = '#3f9a5e', STEEL = '#c9ced3', DARK = '#3d3b3a', WOOD = '#8a6440', DRIFT = '#cdbf9f', OLIVE = '#6b7a3a', BRASS = '#c9a24a';
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0, par = G) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map })); m.position.set(x, y, z); m.rotation.y = ry; par.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  // ---------- floor + walls (navy wainscot, yellow rail, driftwood planks; gaps for both doors) ----------
  { const t = CT(256, 256, (g, W, H) => { g.fillStyle = '#8d7c64'; g.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? 'rgba(60,45,30,0.14)' : 'rgba(255,240,210,0.07)'; g.fillRect(0, i * 32, W, 32); g.fillStyle = 'rgba(40,30,20,0.4)'; g.fillRect(0, i * 32, W, 2); g.fillRect((i * 83) % W, i * 32, 2, 32); } });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set((X1 - X0) / 3, (Z1 - Z0) / 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, Z1 - Z0), new THREE.MeshLambertMaterial({ map: t })); f.rotation.x = -Math.PI / 2; f.position.set(CX, 0.07, CZ); G.add(f); }
  const wall = (len, x, z, ry) => { box(len, 0.3, 0.06, INK, x, 0.15, z, ry); box(len, 1.1, 0.05, NAVY, x, 0.62, z, ry); box(len, 0.1, 0.08, YEL, x, 1.2, z, ry); box(len, 3.5, 0.05, DRIFT, x, 2.97, z, ry); for (let y = 1.62; y < 4.6; y += 0.4) box(len, 0.03, 0.065, '#ab9c7e', x, y, z, ry); };
  wall(X1 - X0, CX, Z0 + 0.03, 0); wall(Z1 - Z0, X0 + 0.03, CZ, Math.PI / 2);
  for (const [a, b] of [[Z0, 207.6], [210.4, Z1]]) wall(b - a, X1 - 0.03, (a + b) / 2, Math.PI / 2);
  for (const [a, b] of [[X0, -22.4], [-19.6, X1]]) wall(b - a, (a + b) / 2, Z1 - 0.03, 0);
  box(1.4, 0.02, 2.4, NAVY, X1 - 0.8, 0.08, 209); box(2.4, 0.02, 1.2, NAVY, -21, 0.08, Z1 - 0.7);
  // ================= WORM TUB (north wall) =================
  const WT = { x: -23.3, z: 205.25, y: 0.8 }, CUP = V(WT.x + 0.93, 0.87, WT.z + 0.25);
  box(2.1, 0.74, 1.1, WOOD, WT.x, 0.37, WT.z); for (const s of [-1, 1]) { box(2.1, 0.14, 0.08, '#6a4a2e', WT.x, 0.82, WT.z + s * 0.51); box(0.08, 0.14, 1.1, '#6a4a2e', WT.x + s * 1.01, 0.82, WT.z); }
  box(0.08, 0.14, 1.0, '#6a4a2e', WT.x + 0.8, 0.82, WT.z); box(0.2, 0.03, 0.96, '#6a4a2e', WT.x + 0.92, 0.79, WT.z);
  cyl(0.065, 0.05, 0.12, WHITE, CUP.x, 0.87, CUP.z, 12); cyl(0.066, 0.066, 0.03, RED, CUP.x, 0.9, CUP.z, 12);
  { const t = CT(256, 160, (g, W, H) => { g.fillStyle = '#4a3020'; g.fillRect(0, 0, W, H); for (let i = 0; i < 500; i++) { g.fillStyle = ['#3a2416', '#5e3e28', '#6b4a30', '#2e1c10'][i % 4]; g.fillRect(Math.random() * W, Math.random() * H, 3 + Math.random() * 4, 2 + Math.random() * 3); } });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(1.76, 0.94), new THREE.MeshLambertMaterial({ map: t })); s.rotation.x = -Math.PI / 2; s.position.set(WT.x - 0.12, WT.y, WT.z); G.add(s); }
  const HOLES = []; for (const dz of [-0.2, 0.2]) for (const dx of [-0.72, -0.36, 0, 0.36]) HOLES.push(V(WT.x + dx + (dz > 0 ? 0.08 : -0.04), WT.y, WT.z + dz));
  for (const h of HOLES) put(new THREE.CircleGeometry(0.06, 12), h.x, WT.y + 0.004, h.z, '#1a0f08', 0, -Math.PI / 2);
  box(0.06, 1.1, 0.04, WOOD, WT.x - 1.15, 0.6, Z0 + 0.12, 0, 0, 0.12); box(0.22, 0.28, 0.03, STEEL, WT.x - 1.2, 0.12, Z0 + 0.12, 0, 0, 0.12);
  rect(WT.x - 1.06, WT.x + 1.06, Z0, WT.z + 0.56);
  plane(label('WORMS · DIG YOUR OWN', INK, YEL, 512, 64, 36), 1.6, 0.2, WT.x, 1.75, Z0 + 0.07);
  // ================= BAIT FRIDGES (north-west corner) =================
  for (const fx of [-26.05, -25.15]) { box(0.86, 1.95, 0.66, '#e8eef2', fx, 0.975, 204.78); box(0.7, 1.45, 0.02, '#9fd3ef', fx, 1.1, 205.12); box(0.05, 0.4, 0.04, STEEL, fx + 0.28, 1.1, 205.15);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) box(0.15, 0.11, 0.015, [RED, BRASS, GREEN][j], fx - 0.2 + j * 0.19, 0.62 + i * 0.42, 205.14); }
  rect(-26.5, -24.7, Z0, 205.15); plane(label('LIVE BAIT · COLD', BLUE, WHITE, 512, 64, 38), 1.7, 0.22, -25.6, 2.15, 205.13);
  // ================= LURE BENCH (north wall, east) =================
  const LB = { x: -18.9, z: 204.8 }, VE = V(-18.6, 1.3, 204.87), TZ = 204.9, SPOOLT = V(-19.95, 1.12, 204.9), BAGP = V(-17.75, 1.06, 204.85);
  box(3.0, 0.9, 0.72, WOOD, LB.x, 0.45, LB.z); box(3.04, 0.05, 0.76, '#c9a77a', LB.x, 0.925, LB.z); rect(LB.x - 1.52, LB.x + 1.52, Z0, LB.z + 0.4);
  box(2.7, 1.1, 0.03, NAVY, LB.x, 1.62, Z0 + 0.06); for (let i = 0; i < 24; i++) box(0.03, 0.07, 0.02, [RED, YEL, BLUE, WHITE, GREEN][i % 5], LB.x - 1.2 + (i % 12) * 0.2 + (i > 11 ? 0.1 : 0), 1.9 - Math.floor(i / 12) * 0.2, Z0 + 0.085);
  box(0.14, 0.1, 0.14, DARK, VE.x, 0.99, VE.z); box(0.04, 0.2, 0.04, STEEL, VE.x, 1.14, VE.z); for (const s of [-1, 1]) box(0.03, 0.08, 0.05, DARK, VE.x + s * 0.025, 1.22, VE.z);
  cyl(0.06, 0.06, 0.08, '#e8e2d6', SPOOLT.x, 1.04, SPOOLT.z, 14, Math.PI / 2); cyl(0.07, 0.07, 0.01, DARK, SPOOLT.x, 1.04, SPOOLT.z + 0.045, 14, Math.PI / 2); box(0.05, 0.08, 0.05, DARK, SPOOLT.x, 0.97, SPOOLT.z);
  box(0.72, 0.02, 0.2, STEEL, -19.45, 0.955, 204.98); box(0.2, 0.26, 0.14, '#c9a77a', BAGP.x, 1.08, BAGP.z);
  { const lx = -17.65, lz = 204.6; cyl(0.1, 0.12, 0.04, INK, lx, 0.96, lz, 14); box(0.03, 0.8, 0.03, INK, lx, 1.36, lz); box(0.03, 0.03, 0.4, INK, lx, 1.75, lz + 0.2); cyl(0.05, 0.14, 0.14, RED, lx, 1.68, lz + 0.42, 14); }
  plane(label('LURE BENCH', INK, YEL, 256, 64, 38), 0.9, 0.2, LB.x + 0.8, 2.4, Z0 + 0.08);
  // ================= COUNTER (east, north of the door) =================
  box(0.7, 1.0, 2.0, NAVY, -16.65, 0.5, 206.4); box(0.76, 0.05, 2.06, YEL, -16.65, 1.02, 206.4); rect(-17.0, -16.3, 205.4, 207.4);
  box(0.32, 0.24, 0.36, DARK, -16.65, 1.17, 206.9); box(0.3, 0.02, 0.2, '#7cff9b', -16.82, 1.24, 206.9, 0, 0, 0.5);
  cyl(0.09, 0.09, 0.22, '#bfe3c8', -16.65, 1.15, 205.9, 12); for (let i = 0; i < 5; i++) box(0.03, 0.06, 0.02, [RED, YEL, BLUE, GREEN, WHITE][i], -16.65 + (i - 2) * 0.03, 1.1 + (i % 2) * 0.05, 205.9);
  plane(label("REEL'S · BAIT · TACKLE · ICE", YEL, INK, 768, 64, 36), 1.8, 0.16, -17.01, 0.72, 206.4, -Math.PI / 2);
  // ================= LIVE MINNOW TANK (west wall) + the mounted fish + Nelly's tooth =================
  const TK = { x0: -26.48, x1: -26.12, y0: 0.88, y1: 1.4, z0: 206.4, z1: 210.0 }, NETX = -26.04, BUCK = V(-25.5, 0, 210.45);
  box(0.72, 0.8, 4.1, NAVY, -26.25, 0.4, 208.2); box(0.62, 0.04, 3.9, '#c9b48a', -26.28, 0.82, 208.2);
  for (const z of [206.25, 210.15]) for (const x of [-25.94, -26.58]) box(0.04, 0.74, 0.04, INK, x, 1.17, z); for (const y of [0.81, 1.53]) box(0.04, 0.04, 3.94, INK, -25.94, y, 208.2);
  for (let i = 0; i < 7; i++) put(new THREE.ConeGeometry(0.05, 0.3 + (i % 3) * 0.1, 5), -26.4 + (i % 2) * 0.12, 0.98 + (i % 3) * 0.05, 206.6 + i * 0.55, GREEN);
  cyl(0.03, 0.03, 0.6, STEEL, -26.5, 1.15, 209.85, 6); plane(label('LIVE MINNOWS · GUS IS NOT FOR SALE', BLUE, WHITE, 768, 64, 34), 2.2, 0.18, -25.92, 1.68, 208.2, Math.PI / 2);
  rect(-26.6, -25.88, 206.15, 210.25);
  cyl(0.16, 0.13, 0.3, YEL, BUCK.x, 0.22, BUCK.z, 14); cyl(0.165, 0.165, 0.03, INK, BUCK.x, 0.37, BUCK.z, 14); cyl(0.14, 0.14, 0.01, '#4fa3c9', BUCK.x, 0.34, BUCK.z, 14);
  box(0.06, 0.9, 2.5, WOOD, X0 + 0.08, 2.75, 208.2); plane(label('ANCIENT CATFISH · 1987', BRASS, INK, 512, 64, 36), 0.9, 0.12, X0 + 0.12, 2.2, 208.2, Math.PI / 2);
  { const t = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 8), LM('#f6f1e4')); t.rotation.z = Math.PI; t.position.set(X0 + 0.15, 2.05, 209.95); G.add(t); box(0.04, 0.3, 0.3, WOOD, X0 + 0.08, 2.28, 209.95);
    plane(label("NELLY'S TOOTH?", INK, YEL, 256, 64, 34), 0.5, 0.12, X0 + 0.12, 1.8, 209.95, Math.PI / 2); }
  // ================= SCALE + RECORD BOARD (south wall, west of the back door) =================
  const SCL = V(-23.45, 2.05, 213.2), HOOKY = 1.8, BRD = V(-25.35, 2.1, Z1 - 0.07);
  box(0.06, 0.06, 0.45, DARK, SCL.x, 2.4, 213.35); box(0.02, 0.12, 0.02, DARK, SCL.x, 2.3, SCL.z); cyl(0.23, 0.23, 0.08, WHITE, SCL.x, SCL.y, SCL.z + 0.045, 24, Math.PI / 2); put(new THREE.TorusGeometry(0.215, 0.022, 6, 28), SCL.x, SCL.y, SCL.z + 0.01, RED);
  box(0.015, 0.12, 0.015, STEEL, SCL.x, HOOKY + 0.06, SCL.z - 0.02); box(0.6, 0.5, 0.5, WOOD, SCL.x, 0.25, 213.2); rect(SCL.x - 0.32, SCL.x + 0.32, 212.9, Z1);
  box(2.16, 1.62, 0.05, WOOD, BRD.x, BRD.y, Z1 - 0.04);
  const DG = new THREE.Group(); DG.position.set(SCL.x, SCL.y, SCL.z - 0.0); DG.rotation.y = Math.PI; G.add(DG);
  const dialTex = CT(256, 256, (g, W, H) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let k = 0; k <= 20; k++) { const kg = k / 2, th = (-135 + 27 * kg) * Math.PI / 180, r0 = k % 2 ? 100 : 90; g.lineWidth = k % 2 ? 3 : 6; g.beginPath(); g.moveTo(128 + Math.sin(th) * r0, 128 - Math.cos(th) * r0); g.lineTo(128 + Math.sin(th) * 112, 128 - Math.cos(th) * 112); g.stroke();
      if (!(k % 4)) { g.font = '900 24px Archivo, sans-serif'; g.fillText(String(kg), 128 + Math.sin(th) * 70, 128 - Math.cos(th) * 70); } }
    g.font = '900 22px Archivo, sans-serif'; g.fillText('KG', 128, 176); g.fillStyle = RED; g.font = '900 16px Archivo, sans-serif'; g.fillText("REEL'S", 128, 204); });
  { const f = new THREE.Mesh(new THREE.CircleGeometry(0.2, 36), new THREE.MeshBasicMaterial({ map: dialTex })); f.position.z = 0.001; DG.add(f); }
  const bandM = new THREE.MeshBasicMaterial({ color: 0x3f9a5e, transparent: true, opacity: 0.75, depthWrite: false }); let band = null;
  const needle = new THREE.Group(); needle.position.z = 0.006; { const n = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.17, 0.004), new THREE.MeshBasicMaterial({ color: 0xec3013 })); n.position.y = 0.07; needle.add(n); const hub = new THREE.Mesh(new THREE.CircleGeometry(0.018, 12), new THREE.MeshBasicMaterial({ color: 0x201e1d })); hub.position.z = 0.003; needle.add(hub); } DG.add(needle); needle.rotation.z = 2.356;
  const THETA = kg => (-135 + 27 * Math.min(10, Math.max(0, kg))) * Math.PI / 180, DELTA = 0.4 * 27 * Math.PI / 180;
  function setBand(kg) { if (band) { DG.remove(band); band.geometry.dispose(); } const th = THETA(kg); band = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.185, 16, 1, Math.PI / 2 - th - DELTA, 2 * DELTA), bandM); band.position.z = 0.003; DG.add(band); }
  // record board (canvas) + your plaque
  const DEF_REC = { bluegill: { who: 'FLICK', kg: 0.62 }, carp: { who: 'OTTO', kg: 4.1 }, minnow: { who: 'PELL', kg: 0.03 }, trout: { who: 'KIA', kg: 2.2 }, koi: { who: 'MARLA', kg: 3.6 }, catfish: { who: 'THE FISHERMAN', kg: 8.9 } };
  const records = () => ({ ...DEF_REC, ...(save.stat('baitRecords', null) || {}) });
  const brdC = document.createElement('canvas'); brdC.width = 512; brdC.height = 384; const brdT = new THREE.CanvasTexture(brdC); brdT.colorSpace = THREE.SRGBColorSpace;
  plane(brdT, 2.0, 1.5, BRD.x, BRD.y, BRD.z, Math.PI);
  const plaque = plane(label('RECORD HOLDER · YOU', BRASS, INK, 512, 64, 36), 1.2, 0.16, BRD.x, 1.16, Z1 - 0.07, Math.PI);
  function drawBoard() { const g = brdC.getContext('2d'), W = 512, H = 384, R = records(); g.fillStyle = '#f1e7d0'; g.fillRect(0, 0, W, H); g.fillStyle = RED; g.fillRect(0, 0, W, 56); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; fitTxt(g, "MERU RECORDS · REEL'S OFFICIAL", 16, 30, W - 32, 30);
    SPK.forEach((id, i) => { const y = 66 + i * 52, r = R[id], you = r.who === 'YOU'; if (you) { g.fillStyle = '#ffe9a8'; g.fillRect(8, y - 2, W - 16, 48); }
      g.fillStyle = '#cfe6f2'; g.fillRect(16, y + 2, 64, 40); g.fillStyle = SP[id].c; g.beginPath(); g.ellipse(46, y + 22, 20, 9, 0, 0, 7); g.fill(); g.beginPath(); g.moveTo(26, y + 22); g.lineTo(16 + 4, y + 12); g.lineTo(16 + 4, y + 32); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(16, y + 2, 64, 40);
      g.fillStyle = INK; fitTxt(g, SP[id].name, 92, y + 13, 230, 22); g.fillStyle = '#5a5654'; fitTxt(g, r.who, 92, y + 34, 230, 18, 700); g.fillStyle = INK; g.textAlign = 'right'; fitTxt(g, r.kg.toFixed(2) + ' KG', W - 16, y + 22, 150, 26); g.textAlign = 'left';
      g.fillStyle = '#cfc6b0'; g.fillRect(16, y + 47, W - 32, 2); });
    g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); brdT.needsUpdate = true; plaque.visible = SPK.some(id => R[id].who === 'YOU'); }
  function setRecord(id, who, kg) { const r = { ...(save.stat('baitRecords', null) || {}) }; r[id] = { who, kg }; save.setStat('baitRecords', r); drawBoard(); }
  // ================= ICE CHESTS BIG / SMALL + the sort tray (south wall, east) =================
  const CH = { big: V(-18.65, 0.56, 213.0), small: V(-17.25, 0.56, 213.0) }, TRAYP = V(-17.95, 0.78, 212.2);
  for (const [k, p] of Object.entries(CH)) { const c = k === 'big' ? BLUE : RED; box(1.1, 0.56, 0.62, WHITE, p.x, 0.28, p.z); box(1.12, 0.08, 0.64, c, p.x, 0.06, p.z); box(0.98, 0.02, 0.5, '#eaf6ff', p.x, 0.5, p.z);
    for (let i = 0; i < 8; i++) box(0.07, 0.06, 0.07, '#dff1ff', p.x - 0.4 + (i % 4) * 0.25, 0.53, p.z - 0.15 + Math.floor(i / 4) * 0.28, i);
    box(1.1, 0.06, 0.62, c, p.x, 0.87, p.z + 0.31, 0, -Math.PI / 2 + 0.12); plane(label(k === 'big' ? 'BIG' : 'SMALL', c, WHITE, 256, 64, 44), 0.7, 0.18, p.x, 0.32, p.z - 0.315, Math.PI); }
  rect(-19.25, -16.65, 212.65, Z1);
  box(1.3, 0.72, 0.5, WOOD, TRAYP.x, 0.36, TRAYP.z); box(1.22, 0.03, 0.44, STEEL, TRAYP.x, 0.735, TRAYP.z); rect(TRAYP.x - 0.66, TRAYP.x + 0.66, TRAYP.z - 0.26, TRAYP.z + 0.26);
  plane(label('SORT & ICE', INK, YEL, 256, 64, 38), 0.9, 0.2, -17.95, 1.55, Z1 - 0.07, Math.PI);
  // ================= GEAR PEG (east wall, south of the door) =================
  for (const z of [212.0, 212.7]) { box(0.16, 0.04, 0.04, BRASS, X1 - 0.1, 1.75, z); }
  plane(label('GEAR PEG', INK, YEL, 256, 64, 38), 0.7, 0.16, X1 - 0.07, 2.15, 212.35, -Math.PI / 2);
  // ================= ROD RACKS ON THE CEILING, buoys, nets, lanterns =================
  for (const z of [206.2, 211.4]) { for (const x of [-25.5, -21, -16.5]) box(0.04, 0.55, 0.04, DARK, x, 4.4, z); box(10.5, 0.05, 0.36, WOOD, -21, 4.12, z);
    for (let i = 0; i < 9; i++) cyl(0.012, 0.022, 3.0, ['#d8c27a', STEEL, WOOD, RED, BLUE, '#d8c27a', YEL, STEEL, WOOD][i], -24.6 + (i % 3) * 3.6 + (i > 5 ? 0.6 : 0), 4.02, z - 0.14 + Math.floor(i / 3) * 0.14, 8, 0, Math.PI / 2); }
  for (const [x, z, c] of [[-26.0, 212.6, RED], [-16.0, 213.0, RED], [-16.0, 205.0, YEL], [-21.6, 204.9, RED]]) { sph(0.16, c, x, 3.2, z); cyl(0.165, 0.165, 0.08, WHITE, x, 3.2, z, 12); box(0.01, 1.3, 0.01, INK, x, 3.95, z); }
  { const nt = CT(128, 128, (g, W, H) => { g.clearRect(0, 0, W, H); g.strokeStyle = '#e8dcc0'; g.lineWidth = 3; for (let i = -W; i < W * 2; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke(); g.beginPath(); g.moveTo(i, H); g.lineTo(i + H, 0); g.stroke(); } }); nt.wrapS = nt.wrapT = THREE.RepeatWrapping;
    const nm = new THREE.MeshBasicMaterial({ map: nt, transparent: true, alphaTest: 0.3, side: THREE.DoubleSide });
    for (const [w, h, x, y, z, ry] of [[3.0, 1.6, X1 - 0.09, 3.6, 212.0, -Math.PI / 2], [3.6, 1.4, -24.4, 3.7, Z1 - 0.09, Math.PI], [2.6, 1.3, -22.0, 3.7, Z0 + 0.09, 0]]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), nm.clone()); m.material.map = nt.clone(); m.material.map.repeat.set(w * 2, h * 2); m.material.map.needsUpdate = true; m.position.set(x, y, z); m.rotation.y = ry; G.add(m); } }
  const LANT = [[-24.5, 207.0], [-18.0, 208.6], [-22.0, 211.6], [-18.2, 211.2]].map(([x, z]) => { box(0.01, 1.1, 0.01, INK, x, 4.15, z); box(0.2, 0.04, 0.2, INK, x, 3.6, z); box(0.2, 0.04, 0.2, INK, x, 3.3, z); const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.26, 0.16), new THREE.MeshBasicMaterial({ color: 0xffd98a })); m.position.set(x, 3.45, z); G.add(m); return m; });
  // tide clock over the front door (inside)
  const tideHand = new THREE.Group(); { const t = CT(256, 256, (g, W, H) => { g.fillStyle = NAVY; g.beginPath(); g.arc(128, 128, 124, 0, 7); g.fill(); g.fillStyle = WHITE; g.beginPath(); g.arc(128, 128, 108, 0, 7); g.fill(); g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 30px Archivo, sans-serif'; g.fillText('HIGH', 128, 52); g.fillText('LOW', 128, 206); g.font = '900 18px Archivo, sans-serif'; g.fillText('TIDE', 128, 150); });
    const f = new THREE.Mesh(new THREE.CircleGeometry(0.34, 30), new THREE.MeshBasicMaterial({ map: t })); f.position.set(X1 - 0.08, 3.4, 209); f.rotation.y = -Math.PI / 2; G.add(f); tideHand.position.set(X1 - 0.1, 3.4, 209); tideHand.rotation.y = -Math.PI / 2; const h = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.26, 0.01), LM(RED)); h.position.y = 0.1; tideHand.add(h); G.add(tideHand); }
  // hanging sign
  { const T = label("REEL'S BAIT & TACKLE", YEL, INK, 768, 96, 56); const s1 = plane(T, 3.0, 0.38, -21.0, 3.3, 208.8, Math.PI / 2); const s2 = s1.clone(); s2.rotation.y = -Math.PI / 2; s2.position.x = -21.01; G.add(s2); for (const z of [207.4, 210.2]) box(0.01, 1.3, 0.01, DARK, -21, 4.1, z); }
  const SPOT = { job: { x: -21, z: 207.9, r: 0.9 }, shop: { x: -17.75, z: 206.4, r: 0.75 }, board: { x: -25.3, z: 212.7, r: 0.85 }, peg: { x: -16.1, z: 212.35, r: 0.65 }, dock: { x: -21, z: 256.6, r: 1.6 } };
  cyl(0.5, 0.5, 0.012, YEL, SPOT.job.x, 0.075, SPOT.job.z, 22); cyl(0.42, 0.42, 0.014, INK, SPOT.job.x, 0.077, SPOT.job.z, 22);
  G.add(new THREE.Mesh(R0.geo(), new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide })));
  // tank glass + water (one transparent mesh each)
  { const w = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.62, 3.86), new THREE.MeshLambertMaterial({ color: '#5fb0d6', transparent: true, opacity: 0.32, depthWrite: false })); w.position.set(-26.27, 1.13, 208.2); w.renderOrder = 1; G.add(w); }
  { const M4 = new THREE.Matrix4(), lm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.25, 0.06, 2.4), new THREE.MeshBasicMaterial({ color: 0xfff8ec }), 4); [[-24.5, 207], [-18.5, 207], [-24.5, 211.5], [-18.5, 211.5]].forEach((p, i) => { M4.makeTranslation(p[0], 4.62, p[1]); lm.setMatrixAt(i, M4); }); G.add(lm); }
  // ================= OUTSIDE: back porch, boardwalk with lanterns, REEL'S JETTY dressing =================
  const R1 = mk(), PW = '#8a6a48', PD = '#5e3a26';
  R1.box(6.2, 0.14, 2.8, PW, -21, 0.07, 215.0); for (let i = 0; i < 9; i++) R1.box(6.2, 0.012, 0.02, PD, -21, 0.145, 213.8 + i * 0.3);
  R1.box(0.08, 0.08, 2.8, PD, -24.06, 0.95, 215.0); R1.box(0.08, 0.08, 2.8, PD, -17.94, 0.95, 215.0); R1.box(2.2, 0.08, 0.08, PD, -23.0, 0.95, 216.36); R1.box(2.2, 0.08, 0.08, PD, -19.0, 0.95, 216.36);
  for (const x of [-24.06, -21.9, -20.1, -17.94]) R1.box(0.12, 0.95, 0.12, PD, x, 0.5, 216.36); for (const z of [213.8, 215.0]) { R1.box(0.12, 0.95, 0.12, PD, -24.06, 0.5, z); R1.box(0.12, 0.95, 0.12, PD, -17.94, 0.5, z); }
  R1.box(1.4, 0.08, 0.4, PD, -23.2, 0.46, 214.2); for (const x of [-23.8, -22.6]) R1.box(0.08, 0.4, 0.36, PD, x, 0.25, 214.2); R1.box(0.6, 0.5, 0.5, WOOD, -18.7, 0.39, 214.3); R1.cyl(0.2, 0.18, 0.4, BLUE, -19.5, 0.34, 214.25, 12);
  const BW0 = 216.4, BW1 = 236.6; R1.box(1.6, 0.08, BW1 - BW0, PW, -21, 0.05, (BW0 + BW1) / 2); for (let z = BW0 + 0.3; z < BW1; z += 0.6) R1.box(1.6, 0.01, 0.03, PD, -21, 0.095, z);
  const LPOS = []; for (let z = 219, s = -1; z < BW1; z += 5, s = -s) { R1.cyl(0.05, 0.06, 1.6, INK, -21 + s * 1.0, 0.8, z, 6); R1.box(0.18, 0.04, 0.18, INK, -21 + s * 1.0, 1.62, z); LPOS.push([-21 + s * 1.0, 1.75, z]); }
  R1.cyl(0.07, 0.07, 2.2, PD, -23.6, 1.1, 236.6, 6); R1.box(1.9, 0.6, 0.08, NAVY, -23.6, 2.0, 236.6);
  R1.cyl(0.62, 0.62, 0.012, YEL, SPOT.dock.x, 0.912, SPOT.dock.z, 24); R1.cyl(0.52, 0.52, 0.014, INK, SPOT.dock.x, 0.914, SPOT.dock.z, 24);
  R1.box(0.4, 0.4, 0.4, PD, -22.4, 1.1, 257.3); R1.cyl(0.16, 0.13, 0.28, YEL, -19.7, 1.04, 257.3, 12); R1.cyl(0.03, 0.03, 1.6, WOOD, -19.4, 1.7, 257.5, 6, 0.25);
  OUT.add(new THREE.Mesh(R1.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  plane(label("REEL'S JETTY · FREE FISHING", NAVY, YEL, 768, 96, 50), 1.8, 0.5, -23.6, 2.0, 236.55, Math.PI, OUT);
  { const M4 = new THREE.Matrix4(), im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffd98a }), LPOS.length); LPOS.forEach((p, i) => { M4.makeTranslation(p[0], p[1], p[2]); im.setMatrixAt(i, M4); }); OUT.add(im); }
  // ================= FISH, LURES, NET (shared models) =================
  const SP = {
    bluegill: { name: 'SUNNY BLUEGILL', c: '#3f7aa8', b: '#ffb347', h: 0.5, L: [0.16, 0.28], k: 35, w: 0.45 },
    carp: { name: 'COPPER CARP', c: '#c47a2c', b: '#f1d08a', h: 0.36, L: [0.38, 0.7], k: 14, w: 0.3 },
    minnow: { name: 'SILVER MINNOW', c: '#b9c3cc', b: '#f3f2f2', h: 0.25, L: [0.08, 0.13], k: 22, w: 0.25 },
    trout: { name: 'RAINBOW TROUT', c: '#6f8f5a', b: '#f3e6e0', s: '#e8708a', h: 0.27, L: [0.35, 0.62], k: 12, w: 0.5, rare: 1 },
    koi: { name: 'GOLDEN KOI', c: '#ffb81c', b: '#fff4d6', s: '#ec3013', h: 0.32, L: [0.4, 0.72], k: 14, w: 0.3, rare: 1 },
    catfish: { name: 'ANCIENT CATFISH', c: '#5a5048', b: '#a89a88', h: 0.22, L: [0.6, 1.15], k: 9, w: 0.2, rare: 1, wh: 1 } };
  const SPK = Object.keys(SP), sphG = new THREE.SphereGeometry(1, 12, 8), finG = new THREE.ConeGeometry(1, 1, 3), boxG = new THREE.BoxGeometry(1, 1, 1);
  function makeFish(id, L, col) { const S = SP[id], g = new THREE.Group(), h = S.h * L, m = (geo, c, x, y, z, sx, sy, sz) => { const o = new THREE.Mesh(geo, LM(c)); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o; };
    m(sphG, col || S.c, 0, 0, 0, 0.11 * L, h / 2, L / 2); m(sphG, S.b, 0, -h * 0.14, 0.03 * L, 0.1 * L, h * 0.34, L * 0.4);
    const t = m(finG, col || S.c, 0, 0, -0.56 * L, 0.02 * L, 0.26 * L, h * 0.9); t.rotation.x = Math.PI / 2;
    m(boxG, col || S.c, 0, h * 0.5, -0.04 * L, 0.012 * L, h * 0.28, 0.32 * L);
    for (const s of [-1, 1]) { m(sphG, '#ffffff', s * 0.085 * L, h * 0.12, 0.33 * L, 0.03 * L, 0.03 * L, 0.03 * L); m(sphG, INK, s * 0.1 * L, h * 0.12, 0.345 * L, 0.018 * L, 0.018 * L, 0.018 * L); }
    if (id === 'koi') { m(sphG, S.s, 0, h * 0.2, 0.12 * L, 0.112 * L, h * 0.26, 0.14 * L); m(sphG, '#ffffff', 0, h * 0.18, -0.2 * L, 0.112 * L, h * 0.22, 0.1 * L); }
    if (id === 'trout') m(sphG, S.s, 0, 0, 0, 0.113 * L, h * 0.09, 0.42 * L);
    if (S.wh) for (const s of [-1, 1]) { const w = m(boxG, INK, s * 0.07 * L, -h * 0.05, 0.5 * L, 0.006 * L, 0.006 * L, 0.3 * L); w.rotation.y = s * 0.5; }
    return g; }
  { const mf = makeFish('catfish', 1.9); mf.position.set(X0 + 0.2, 2.78, 208.2); G.add(mf); }
  const LURE = { red: { name: 'RED SPINNER', c: RED }, yel: { name: 'YELLOW POPPER', c: YEL }, blue: { name: 'BLUE MINNOW', c: BLUE } }, LUK = Object.keys(LURE);
  function makeLure(k) { const g = new THREE.Group(), c = LURE[k].c, add = (geo, col, x, y, z, sx, sy, sz) => { const o = new THREE.Mesh(geo, LM(col)); o.position.set(x, y, z); o.scale.set(sx, sy, sz); g.add(o); return o; };
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0035, 6, 14), LM(STEEL))); add(boxG, STEEL, 0, -0.02, 0, 0.003, 0.02, 0.003);
    if (k === 'red') { add(sphG, c, 0, -0.06, 0, 0.012, 0.04, 0.026); add(sphG, '#e6e9ec', 0, -0.035, 0.012, 0.004, 0.014, 0.01); }
    else if (k === 'yel') { add(new THREE.CylinderGeometry(1, 1, 1, 10), c, 0, -0.065, 0, 0.018, 0.07, 0.018); add(sphG, RED, 0, -0.028, 0, 0.019, 0.016, 0.019); }
    else { add(sphG, c, 0, -0.065, 0, 0.014, 0.05, 0.022); add(sphG, '#f3f2f2', 0, -0.065, 0.008, 0.012, 0.04, 0.016); add(sphG, INK, 0.012, -0.03, 0.01, 0.004, 0.004, 0.004); }
    const hk = new THREE.Mesh(new THREE.TorusGeometry(0.016, 0.0025, 5, 10, Math.PI * 1.3), LM(STEEL)); hk.position.set(0, -0.12, 0); hk.rotation.z = Math.PI * 0.85; g.add(hk); add(boxG, STEEL, 0, -0.105, 0, 0.003, 0.03, 0.003);
    g.scale.setScalar(2.2); return g; }
  const net = new THREE.Group(); { const r = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.008, 6, 18), LM(INK)); r.rotation.y = Math.PI / 2; net.add(r); const bag = new THREE.Mesh(new THREE.ConeGeometry(0.095, 0.16, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xf3f2f2, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })); bag.rotation.z = Math.PI / 2; bag.position.x = -0.08; net.add(bag);
    const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 6), LM(WOOD)); hd.position.y = 0.45; net.add(hd); } net.visible = false; G.add(net);
  // the tank's minnows (always swimming; the SCOOP step catches them): 7 silver + 3 red shop pets (Gus and family)
  let TKZ = [TK.z0, TK.z1];
  const TFISH = []; for (let i = 0; i < 10; i++) { const red = i >= 7, g = makeFish('minnow', 0.15, red ? '#e0442a' : null); G.add(g); TFISH.push({ g, red, p: V(rnd(TK.x0, TK.x1), rnd(TK.y0, TK.y1), rnd(TK.z0, TK.z1)), v: V(0, rnd(-0.05, 0.05), (Math.random() < 0.5 ? -1 : 1) * 0.18), turn: Math.random() * 3, gone: false }); }
  function tankTick(dt, chase) { for (const f of TFISH) { if (f.gone) continue; f.turn -= dt; if (f.turn <= 0) { f.turn = 1.5 + Math.random() * 3; f.v.z = (Math.random() < 0.5 ? -1 : 1) * rnd(0.12, 0.26); f.v.y = rnd(-0.06, 0.06); }
      if (chase && net.visible) { const dy = f.p.y - net.position.y, dz = f.p.z - net.position.z, d = Math.hypot(dy, dz) || 1; if (d < 0.32) { f.v.y += dy / d * dt * 0.8; f.v.z += dz / d * dt * 0.8; } }
      const sp = Math.hypot(f.v.y, f.v.z); if (sp > 0.4) f.v.multiplyScalar(0.4 / sp);
      f.p.addScaledVector(f.v, dt); const z0 = chase ? TKZ[0] : TK.z0, z1 = chase ? TKZ[1] : TK.z1;
      if (f.p.z < z0) { f.p.z = z0; f.v.z = Math.abs(f.v.z); } if (f.p.z > z1) { f.p.z = z1; f.v.z = -Math.abs(f.v.z); } if (f.p.y < TK.y0) { f.p.y = TK.y0; f.v.y = Math.abs(f.v.y); } if (f.p.y > TK.y1) { f.p.y = TK.y1; f.v.y = -Math.abs(f.v.y); }
      f.g.position.copy(f.p); const ry = f.v.z >= 0 ? 0 : Math.PI; f.g.rotation.y += Math.atan2(Math.sin(ry - f.g.rotation.y), Math.cos(ry - f.g.rotation.y)) * Math.min(1, dt * 6); } }
  // ================= REEL =================
  const RL_LOOK = { fur: '#d9a86c', furDark: '#a8763e', muzzle: '#f6ead8', snout: '#efe0c8', chin: '#fff8ee', fluff: '#fff8ee' };
  const reel = kit.makeFox({ key: 'reelBait', torso: [OLIVE, '#f3f2f2', '#3f4a20'], outfit: 'vest', mood: 'happy', eyes: ['#3a5a2a', '#3a5a2a'], look: RL_LOOK }); reel.scale.multiply(V(0.96, 0.98, 0.96));
  function makeCap(c, logo) { const g = new THREE.Group(); const cr = new THREE.Mesh(new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), LM(c)); cr.scale.set(1, 0.75, 1); cr.position.y = 0.14; g.add(cr);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.025, 14), LM(c)); br.scale.set(1, 1, 1.25); br.position.set(0, 0.15, 0.3); g.add(br);
    const lg = new THREE.Mesh(new THREE.CircleGeometry(0.06, 12), LM(logo)); lg.position.set(0, 0.28, 0.27); lg.rotation.x = -0.5; g.add(lg); g.traverse(o => { o.renderOrder = 2; }); return g; }
  function makeLureStrip() { const g = new THREE.Group(); for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.07, 0.02), LM([RED, YEL, BLUE, WHITE, GREEN, RED][i])); b.position.set((i % 3 - 1) * 0.09 + (i > 2 ? 0.0 : 0), 1.12 - Math.floor(i / 3) * 0.12, 0.385); b.rotation.z = (i % 2 ? 0.3 : -0.3); g.add(b); } g.traverse(o => { o.renderOrder = 2; }); return g; }
  { const P = reel.userData && reel.userData.P; if (P && P.head) P.head.add(makeCap(RED, YEL)); if (P && P.body) P.body.add(makeLureStrip()); }
  const RS = { idle: [-15.9, 206.4], dig: [-21.35, 204.95], tie: [-16.85, 204.95], scoop: [-25.3, 211.0], weigh: [-20.4, 210.6], ice: [-16.2, 213.15], pay: [-17.6, 208.2] };
  const RF = { idle: [-21, 209], dig: [WT.x, WT.z], tie: [VE.x, VE.z], scoop: [-26.3, 208.2], weigh: [SCL.x, SCL.z], ice: [TRAYP.x, TRAYP.z], pay: [-20.5, 209.4] };
  G.add(reel); const rlCol = { c: [0, 0, 0.5] }; cols.push(rlCol);
  const placeReel = k => { const s = RS[k], f = RF[k]; reel.position.set(s[0], 0, s[1]); reel.userData.face0 = Math.atan2(f[0] - s[0], f[1] - s[1]); rlCol.c[0] = s[0]; rlCol.c[1] = s[1]; }; placeReel('idle');
  const rlT = { key: 'reelBait', obj: reel, ry: 0, r: 2.4 }, endT = { key: 'baitEnd', obj: reel, ry: 0, r: 9 };
  const ln = text => ({ who: 'reel', role: 'BAIT & TACKLE', text });
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'bait', color: NAVY, boardTitle: "Reel's best",
    room: { X0, X1, Z0, Z1 }, door: [-15.2, 209], keeper: reel, keeperRy: reel.userData.face0,
    games: [{ k: 'job', name: 'Bait job', color: NAVY }], board: { x: X1 - 0.06, y: 2.45, z: 205.9, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: -16.0, z: 211.0, ry: -Math.PI / 2 }, hiringLine: 'DIG · TIE · SCOOP · WEIGH · ICE',
    sun: [{ x: -16.3, z: 209, w: 1.8, d: 1.8 }, { x: -21, z: 212.8, w: 1.8, d: 1.4 }], lamps: [[-24.5, 207], [-18.5, 207], [-24.5, 211.5], [-18.5, 211.5]].map(p => [p[0], 4.3, p[1]]),
    browse: [[-23.3, 206.3, Math.PI], [-19.2, 205.7, Math.PI], [-25.4, 208.2, -Math.PI / 2], [-25.3, 212.3, 0], [-25.6, 205.9, Math.PI]],
    looks: [['#2e4a6b', '#e2e6ea', '#1d2f44'], ['#c2456a', '#fce7f3', '#7a1f3d']], clock: { x: -24.3, y: 3.0, z: Z0 + 0.08, ry: 0 } });
  const CUST = [
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#2e4a6b', '#ffd23a', '#1d2f44'], say: 'Worms, a lure, minnows. And wait till you see what I caught.' },
    { name: 'KIA', forW: 'Item Shop', torso: ['#38bdf8', '#e0f2fe', '#0369a1'], say: 'First time fishing. Give me whatever works.' },
    { name: 'OTTO', forW: 'Barracks', torso: ['#7a8a3a', '#e8e2c8', '#4a5420'], say: 'My day off. The lake, a stool, and silence.' },
    { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'], say: 'I caught a monster this morning. Weigh it, weigh it!' },
    { name: 'PELL', forW: 'Armory', torso: ['#5a6b7a', '#e2e6ea', '#2f3a44'], say: 'The usual. And I want my name on that board.' },
    { name: 'MICHAEL JAY', forW: 'Diner regular', torso: ['#e6ecf4', '#dc2626', '#7f1d1d'], say: 'Bait for the boys. We are going out on the boat.' },
    { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'], say: 'Fast bait. The fast kind. Is there a fast kind?' }];
  const CUSTP = V(-20.5, 0.02, 209.4);
  const custCache = {}; const custFox = i => { if (custCache[i]) return custCache[i]; const C = CUST[i], f = kit.makeFox({ key: 'baitCust' + i, torso: C.torso, outfit: 'vest', mood: 'neutral' }); f.visible = false; G.add(f); custCache[i] = f; return f; };
  // ---------- state, toast, sound ----------
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null, F = null, lastFox = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0, f2) => { try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + len); gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), nope = () => tone(196, 0.05, 0.25, 'square'), squish = () => tone(320, 0.05, 0.12, 'triangle', 0, 160);
  const plop = () => { tone(420, 0.07, 0.18, 'sine', 0, 140); }, plip = () => tone(900, 0.03, 0.08, 'sine', 0, 500), zip = () => tone(300, 0.04, 0.3, 'sawtooth', 0, 1400), whiz = () => tone(1400, 0.03, 0.4, 'triangle', 0, 300), click = () => tone(1800, 0.02, 0.03, 'square');
  const fanfare = () => { tone(523, 0.06, 0.4); tone(659, 0.06, 0.5, 'sine', 0.12); tone(784, 0.06, 0.6, 'sine', 0.24); tone(1047, 0.06, 0.9, 'sine', 0.36); };
  const roar = () => { tone(90, 0.12, 2.2, 'sawtooth', 0, 55); tone(140, 0.07, 1.8, 'square', 0.1, 70); };
  // ---------- rods, baits, prizes ----------
  const RODS = ['TWIG ROD', 'BAMBOO ROD', 'STEEL ROD'], RANGE = [12, 15, 18], RSPD = [1.4, 1.75, 2.1], RTEN = [1, 0.85, 0.7];
  const rodTier = () => Math.max(save.stat('baitRod', 0), save.count('steelRod') > 0 ? 2 : save.count('bambooRod') > 0 ? 1 : 0);
  const BAITS = { worm: 'PLAIN WORM', shinyLure: 'SHINY LURE', goldenBait: 'GOLDEN BAIT' }, BK = Object.keys(BAITS);
  const baitOk = k => k === 'worm' || save.count(k) > 0;
  const outfitOwned = () => !!save.stat('baitOutfit', false);
  const wearNow = () => { const w = save.stat('baitWear', null) || {}; return { hat: outfitOwned() && !!w.hat, vest: outfitOwned() && !!w.vest }; };
  const setWear = (k, v) => { const w = { ...(save.stat('baitWear', null) || {}) }; w[k] = v; save.setStat('baitWear', w); };
  function giveGift() { save.setStat('baitClears', save.stat('baitClears', 0) + 1); const n = save.stat('baitGifts', 0); save.setStat('baitGifts', n + 1);
    if (rodTier() < 1) { save.setStat('baitRod', 1); save.give('bambooRod'); return { kind: 'rod1', label: 'BAMBOO ROD' }; }
    if (!outfitOwned()) { save.setStat('baitOutfit', true); setWear('hat', true); setWear('vest', true); return { kind: 'outfit', label: 'FISHING HAT + VEST' }; }
    if (rodTier() < 2) { save.setStat('baitRod', 2); save.give('steelRod'); return { kind: 'rod2', label: 'STEEL ROD' }; }
    if (!save.stat('baitGoldOnce', false)) { save.setStat('baitGoldOnce', true); save.give('goldenBait', 3); return { kind: 'gold3', label: 'GOLDEN BAIT ×3' }; }
    if (!save.count('luckyHook')) { save.give('luckyHook'); return { kind: 'hook', label: 'LUCKY HOOK' }; }
    if (n % 2) { save.give('goldenBait'); return { kind: 'gold1', label: 'GOLDEN BAIT' }; } save.give('shinyLure', 3); return { kind: 'shiny', label: 'SHINY LURE ×3' }; }
  // what you wear: bucket hat + lure vest (Meru 2, re-attached every frame it is missing)
  function makeHat() { const g = new THREE.Group(); const cr = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.3, 0.2, 14), LM(OLIVE)); cr.position.y = 0.3; g.add(cr); const tp = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 14), LM('#5a6830')); tp.position.y = 0.41; g.add(tp);
    const br = new THREE.Mesh(new THREE.CylinderGeometry(0.44, 0.46, 0.03, 18), LM(OLIVE)); br.position.y = 0.2; br.rotation.x = 0.08; g.add(br); const bd = new THREE.Mesh(new THREE.CylinderGeometry(0.305, 0.305, 0.05, 14), LM(INK)); bd.position.y = 0.23; g.add(bd);
    for (let i = 0; i < 2; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.08, 0.02), LM(i ? YEL : RED)); l.position.set(0.12 + i * 0.07, 0.32, 0.27); l.rotation.z = 0.4; g.add(l); } g.traverse(o => { o.renderOrder = 2; }); return g; }
  function makeVest() { const g = new THREE.Group(), m = LM('#b9a77a');
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.46, 0.02), m); f.position.set(s * 0.17, 1.02, 0.37); f.rotation.set(-0.08, s * 0.1, 0); g.add(f); const sd = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5, 0.4), m); sd.position.set(s * 0.335, 0.98, 0.08); g.add(sd);
      for (const y of [0.9, 1.08]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.02), LM('#8a7a52')); p.position.set(s * 0.17, y, 0.385); g.add(p); } }
    const bk = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.58, 0.02), m); bk.position.set(0, 0.99, -0.2); g.add(bk);
    for (let i = 0; i < 3; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.02), LM([RED, YEL, BLUE][i])); l.position.set(-0.22 + i * 0.05, 1.2, 0.395); l.rotation.z = 0.3; g.add(l); }
    g.traverse(o => { o.renderOrder = 2; }); return g; }
  let worn = null;
  function applyWear(fox) { const U = fox && fox.userData; if (!U || !U.P) return; const w = wearNow(), key = (w.hat ? 1 : 0) + '|' + (w.vest ? 1 : 0);
    const onFox = p => { for (let q = p.parent; q; q = q.parent) if (q === fox) return true; return false; };
    if (worn && worn.key === key && worn.fox === fox && worn.parts.every(onFox)) return;
    if (worn) worn.parts.forEach(p => p.parent && p.parent.remove(p)); worn = { key, fox, parts: [] }; const P = U.P;
    if (w.hat && P.head) { const h = makeHat(); P.head.add(h); worn.parts.push(h); } if (w.vest && P.body) { const v = makeVest(); P.body.add(v); worn.parts.push(v); } }
  // ---------- cards (Modernist: ground, 2px ink, red bar, flush left) — LEFT, same spot as the other shops ----------
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500; const mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#3f7a52' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#ec3013;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;white-space:nowrap;gap:10px"><span>' + l + '</span><span>' + r + '</span></div>';
  const who = C => innerWidth > 900 && innerHeight > 700 ? '<div style="font-weight:900;font-size:15px">' + C.name + '</div><div style="font-size:12px;color:#5a5654;margin-bottom:2px">' + C.forW + '</div><div style="font-size:13px;font-style:italic;margin-bottom:6px">"' + C.say + '"</div>' : '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + C.forW + '</span></div>';
  const foot = next => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (touch ? '3' : 'SPACE') + ' · STOP</span></div>';
  const meter = (f, c) => '<div style="position:relative;height:12px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;left:0;top:0;bottom:0;width:' + (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:6px">' + t + '</div>';
  const tag = t => '<div style="display:inline-block;margin:6px 6px 0 0;padding:2px 6px;background:#ffd23a;border:2px solid #201e1d;font-size:12px;font-weight:900">' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; card.style.pointerEvents = 'none'; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  const showPick = (title, right, sub, opts, html = '') => { pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (sub ? '<div style="font-size:13px;font-weight:800">' + sub + '</div>' : '') + html + '</div>'; const body = pick.lastChild;
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); body.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; };
  // ---------- input: press / drag / release (phone + mouse) for the job AND for fishing ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const live = () => busy === 'job' || (busy === 'fish' && F && !F.paused);
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t) || card.contains(t))) return true;
    if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  addEventListener('pointerdown', e => { if (!live() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(0); }, true);
  addEventListener('pointermove', e => { if (!live() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(0.016); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; if (live()) release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  card.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-act]'); if (!b || !F) return; e.stopPropagation(); const a = b.dataset.act; if (a === 'bait') cycleBait(); else if (a === 'book') openBook(true); });
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  const ray = new THREE.Raycaster(), pl = new THREE.Plane(), hitP = V(), ndc = new THREE.Vector2();
  const ptrHit = (n, p) => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); pl.setFromNormalAndCoplanarPoint(n, p); return ray.ray.intersectPlane(pl, hitP) ? hitP.clone() : null; };
  const UPN = V(0, 1, 0), ZN = V(0, 0, 1), XN = V(1, 0, 0);
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const Q of J.flies.slice()) { Q.t += dt / Q.dur; const k = Math.min(1, Q.t), e = k * k * (3 - 2 * k); Q.obj.position.lerpVectors(Q.from, Q.to, e); Q.obj.position.y += Math.sin(k * Math.PI) * Q.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(Q), 1); Q.then && Q.then(); } } }
  const keep = o => { J.objs.push(o); G.add(o); return o; };
  const dotM = new THREE.MeshBasicMaterial({ color: 0xffd23a, depthTest: false, transparent: true }), dotDone = new THREE.MeshBasicMaterial({ color: 0xec3013, depthTest: false, transparent: true }), dotGeo = new THREE.SphereGeometry(0.007 * (touch ? 1.4 : 1), 8, 6);
  function makePath(pts) { clearDots(); J.path = { pts: pts.map(p => { const d = new THREE.Mesh(dotGeo, dotM); d.position.copy(p); d.renderOrder = 4; keep(d); return { p, d }; }), i: 0, wob: 0 }; }
  function clearDots() { if (J && J.path) { for (const q of J.path.pts) G.remove(q.d); J.path = null; } }
  const tieG = new THREE.BufferGeometry(); tieG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(48 * 3), 3)); const tieLine = new THREE.Line(tieG, new THREE.LineBasicMaterial({ color: 0xf3f2f2, depthTest: false, transparent: true })); tieLine.renderOrder = 5; tieLine.frustumCulled = false; tieLine.visible = false; G.add(tieLine);
  function setTie(pts) { const a = tieG.attributes.position, n = Math.min(48, pts.length); for (let i = 0; i < n; i++) a.setXYZ(i, pts[i].x, pts[i].y, pts[i].z); a.needsUpdate = true; tieG.setDrawRange(0, n); tieLine.visible = n > 1; }
  // ================= WORMS (8 holes in the tub) =================
  const wormGeo = new THREE.TorusGeometry(0.045, 0.016, 6, 14, Math.PI), wormM = LM('#e58a86');
  const WORMS = HOLES.map(p => { const g = new THREE.Group(); g.add(new THREE.Mesh(wormGeo, wormM)); const hd = new THREE.Mesh(new THREE.SphereGeometry(0.019, 8, 6), LM('#d97570')); hd.position.set(0.045, 0, 0); g.add(hd); g.position.copy(p); g.visible = false; G.add(g); return { g, p, st: 0, t: 0, life: 1.7 }; });
  const PUFF = []; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), new THREE.MeshBasicMaterial({ color: 0x6b4a30, transparent: true, opacity: 0, depthWrite: false })); m.visible = false; G.add(m); PUFF.push({ m, t: 9 }); }
  // ================= THE BAIT JOB =================
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const NEXT = (sub, after, t = 1.1) => { J.sub = sub; J.pause = t; J.after = after; };
  const STEP_N = ['DIG', 'TIE', 'SCOOP', 'WEIGH', 'ICE'];
  function startJob() { const n = save.stat('baitVisits', 0), ci = n % CUST.length, C = CUST[ci]; save.setStat('baitVisits', n + 1);
    const wid = pickOf(['carp', 'trout', 'koi', 'catfish']), rec = records()[wid], beat = rec.who !== 'YOU' && Math.random() < 0.45, kg = Math.round(Math.min(9.6, rec.kg * (beat ? rnd(1.02, 1.12) : rnd(0.55, 0.93))) * 100) / 100;
    J = { ci, C, step: 1, sub: 'dig', gold: 0, pause: 0, t: 0, perfect: 0, objs: [], flies: [], need: { worms: 4 + (n % 3), lure: pickOf(LUK), minnows: 3 + ((n + 1) % 3) }, wf: { id: wid, kg, L: Math.cbrt(kg / SP[wid].k) }, dug: 0, digMiss: 0, spawnT: 0.5, wrong: 0, wob: 0, held: null };
    const f = custFox(ci); f.visible = true; f.position.copy(CUSTP); f.userData.mood = f.userData.base = 'neutral'; J.cust = f; busy = 'job'; pop(); beginDig(); }
  const custLook = (x, z) => { if (J && J.cust) J.cust.rotation.y = Math.atan2(x - CUSTP.x, z - CUSTP.z); };
  // ---- 1 DIG: tap the worms before they wriggle back down ----
  function beginDig() { J.step = 1; J.sub = 'dig'; placeReel('dig'); custLook(WT.x, WT.z); toast('STEP 1 OF 5 · TAP THE WORMS BEFORE THEY HIDE', 2); }
  function digTick(dt) { J.spawnT -= dt; const upN = WORMS.filter(w => w.st === 1).length;
    if (J.spawnT <= 0 && upN < 2) { const free = WORMS.filter(w => w.st === 0); if (free.length) { const w = pickOf(free); w.st = 1; w.t = 0; w.life = 2.1; w.g.visible = true; w.g.rotation.set(0, Math.random() * 3, 0); w.g.position.copy(w.p); } J.spawnT = rnd(0.45, 0.95); }
    for (const w of WORMS) { if (w.st !== 1) continue; w.t += dt; const k = w.t < 0.25 ? w.t / 0.25 : w.t > w.life - 0.3 ? Math.max(0, (w.life - w.t) / 0.3) : 1;
      w.g.position.y = WT.y - 0.06 + k * 0.06; w.g.scale.set(1.7, 1.7 * Math.max(0.05, 0.3 + 0.7 * k + 0.1 * Math.sin(w.t * 14)), 1.7); w.g.rotation.z = Math.sin(w.t * 9) * 0.25;
      if (w.t >= w.life) { w.st = 0; w.g.visible = false; J.digMiss++; } }
    for (const p of PUFF) if (p.t < 0.5) { p.t += dt; p.m.position.y += dt * 0.3; p.m.scale.setScalar(1 + p.t * 3); p.m.material.opacity = 0.6 * (1 - p.t / 0.5); if (p.t >= 0.5) p.m.visible = false; } }
  function digPress() { const w = nearestOf(WORMS.filter(q => q.st === 1 && q.t > 0.06), q => q.g.position.clone().add(V(0, 0.04, 0)), 2.0);
    if (!w) { const h = ptrHit(UPN, V(0, WT.y, 0)); if (h && Math.abs(h.x - WT.x) < 0.9 && Math.abs(h.z - WT.z) < 0.5) { const p = PUFF.find(q => q.t >= 0.5); if (p) { p.t = 0; p.m.visible = true; p.m.position.set(h.x, WT.y + 0.02, h.z); } tone(160, 0.03, 0.1, 'triangle'); } return; }
    w.st = 2; squish(); w.g.scale.setScalar(1.7); fly(w.g, CUP.clone().add(V(0, 0.09, 0)), 0.35, 0.18, () => { w.g.visible = false; w.st = 0; }); J.dug++; const g2 = addGold(3);
    if (J.dug >= J.need.worms) { const clean = J.digMiss <= 2, g3 = clean ? addGold(6) : 0; if (clean) J.perfect++; ding(); toast((clean ? 'REEL: "WRIGGLERS! FAST HANDS! FASTEST IN MERU, PROBABLY!"' : 'REEL: "GOT \'EM ALL! WORMS ARE SNEAKY."') + ' +' + (g2 + g3), 1.8);
      for (const q of WORMS) if (q.st === 1) { q.st = 0; q.g.visible = false; } NEXT('dug', beginTie, 1.4); } else toast('GOT ONE · ' + J.dug + ' OF ' + J.need.worms + ' +' + g2, 0.8); }
  // ---- 2 TIE: tap the lure on the card, then thread · wrap · pull ----
  const TRAYL = [V(-19.68, 0.975, 204.98), V(-19.45, 0.975, 204.98), V(-19.22, 0.975, 204.98)];
  function beginTie() { J.step = 2; J.sub = 'lurePick'; placeReel('tie'); custLook(VE.x, VE.z); const order = LUK.slice().sort(() => Math.random() - 0.5);
    J.lures = order.map((k, i) => { const g = keep(makeLure(k)); g.position.copy(TRAYL[i]); g.rotation.x = Math.PI / 2; return { k, g }; }); toast('STEP 2 OF 5 · TAP THE ' + LURE[J.need.lure].name, 2); }
  function lurePress() { if (J.flies.length) return; const l = nearestOf(J.lures, q => q.g.position, 1.8); if (!l) return;
    if (l.k !== J.need.lure) { J.wrong++; nope(); toast('REEL: "NOPE, THAT\'S THE ' + LURE[l.k].name + '! THE CARD SAYS ' + LURE[J.need.lure].name + '!"', 1.8); return; }
    pop(); J.lure = l; l.g.rotation.set(0, 0, 0); fly(l.g, VE, 0.4, 0.12, () => { J.sub = 'thread'; J.tieP = [SPOOLT.clone()]; setTie(J.tieP); J.zoneWob = 0; makePath(tiePts('thread')); toast('THREAD IT · DRAG THROUGH THE EYE', 1.6); }); J.sub = 'lureFly'; }
  function tiePts(s) { const E = VE;
    if (s === 'thread') return [-0.22, -0.16, -0.1, -0.04, 0.02, 0.07].map(dx => V(E.x + dx, E.y, TZ));
    if (s === 'wrap') { const o = []; for (let i = 0; i < 8; i++) o.push(V(E.x + 0.05 - i * 0.032, E.y + (i % 2 ? -0.05 : 0.05), TZ)); return o; }
    return [[-0.2, 0.03], [-0.1, 0.01], [0, 0], [0.1, -0.03], [0.2, -0.06], [0.3, -0.09]].map(([dx, dy]) => V(E.x + dx, E.y + dy, TZ)); }
  function tieDrag(dt) { const Pa = J.path; if (!Pa || Pa.i >= Pa.pts.length) return; const R = RAD(); let hit = -1;
    for (let j = Pa.i; j < Math.min(Pa.i + 3, Pa.pts.length); j++) if (dist(scrW(Pa.pts[j].p)) < R * 1.1) hit = j;
    if (hit >= 0) { for (let j = Pa.i; j <= hit; j++) { Pa.pts[j].d.material = dotDone; J.tieP.push(Pa.pts[j].p.clone()); } Pa.i = hit + 1; click(); if (Pa.i >= Pa.pts.length) { setTie(J.tieP); tieStepDone(); return; } }
    else if (ptr.down && dt > 0) { let md = 1e9; for (let j = Math.max(0, Pa.i - 1); j < Pa.pts.length; j++) md = Math.min(md, dist(scrW(Pa.pts[j].p))); if (md > R * 2.6) { Pa.wob += dt; J.zoneWob += dt; if (Pa.wob > 0.5) { Pa.wob = 0; J.wob += 0.5; nope(); toast('TANGLE! REEL: "EASY, EASY, FOLLOW THE DOTS!"', 1.4); } } }
    const h = ptr.down ? ptrHit(ZN, V(0, 0, TZ)) : null; setTie(h ? J.tieP.concat([h]) : J.tieP); }
  function tieStepDone() { clearDots(); const s = J.sub, g2 = addGold(5);
    if (s === 'thread') { toast('THROUGH THE EYE +' + g2 + ' · NOW WRAP IT ROUND', 1.4); J.sub = 'wrap'; makePath(tiePts('wrap')); return; }
    if (s === 'wrap') { toast('FIVE TURNS +' + g2 + ' · TUCK IT BACK AND PULL', 1.4); J.sub = 'pull'; makePath(tiePts('pull')); return; }
    zip(); J.sub = 'tied'; J.knotT = 0; const clean = J.zoneWob < 0.5 && !J.wrong; if (clean) J.perfect++; const g3 = clean ? addGold(6) : 0;
    toast((clean ? 'REEL: "TIGHT AS A DRUM! THAT KNOT COULD HOLD NELLY!"' : 'REEL: "KNOT\'S ON! IT\'LL HOLD."') + ' +' + (g2 + g3), 1.8); }
  function knotTick(dt) { J.knotT += dt; const k = Math.min(1, J.knotT / 0.5), E = VE; const pts = J.tieP.map((p, i) => i === 0 ? p : V(p.x + (E.x - 0.04 - p.x) * k * (i > 6 && i < 15 ? 0.7 : 0), p.y + (E.y - p.y) * k * (i > 6 && i < 15 ? 0.85 : 0), p.z)); setTie(pts);
    if (J.knotT > 1.0 && !J.knotGone) { J.knotGone = true; tieLine.visible = false; fly(J.lure.g, BAGP.clone().add(V(0, 0.12, 0)), 0.45, 0.15, () => { J.lure.g.visible = false; }); for (const q of J.lures) if (q !== J.lure) fly(q.g, q.g.position.clone(), 0.1, 0, null); NEXT('tiedDone', beginScoop, 1.0); } }
  // ---- 3 SCOOP: drag the net through the tank, silver minnows only ----
  function beginScoop() { J.step = 3; J.sub = 'scoop'; placeReel('scoop'); custLook(-26.3, 208.2); J.scooped = 0; J.pet = 0; J.cd = 0; const port = (camera.aspect || 1) < 1; TKZ = port ? [207.3, 209.1] : [TK.z0, TK.z1];
    for (const f of TFISH) { f.p.z = Math.max(TKZ[0], Math.min(TKZ[1], f.p.z)); } net.visible = true; net.position.set(NETX, 1.15, (TKZ[0] + TKZ[1]) / 2); toast('STEP 3 OF 5 · DRAG THE NET THROUGH THE SILVER MINNOWS', 2.2); }
  function scoopDrag() { if (!ptr.down) return; const h = ptrHit(XN, V(NETX, 0, 0)); if (h) net.position.set(NETX, Math.max(TK.y0 - 0.02, Math.min(TK.y1 + 0.12, h.y)), Math.max(TKZ[0] - 0.1, Math.min(TKZ[1] + 0.1, h.z))); }
  const PETL = ['REEL: "NOT GUS! GUS IS THE MANAGER."', 'REEL: "THAT\'S GUS\'S COUSIN! RED ONES STAY!"', 'REEL: "RED MEANS PET! SILVER MEANS BAIT!"'];
  function scoopTick(dt) { tankTick(dt, true); J.cd -= dt; if (!ptr.down || J.cd > 0) return;
    for (const f of TFISH) { if (f.gone) continue; if (Math.hypot(f.p.y - net.position.y, f.p.z - net.position.z) > 0.11) continue;
      if (f.red) { J.pet++; J.cd = 1.0; f.v.z = -Math.sign(f.v.z || 1) * 0.4; nope(); toast(PETL[J.pet % 3], 1.6); return; }
      f.gone = true; J.scooped++; J.cd = 0.25; pop(); fly(f.g, BUCK.clone().add(V(0, 0.45, 0)), 0.5, 0.35, () => { f.g.visible = false; tone(500, 0.04, 0.1); }); const g2 = addGold(4);
      if (J.scooped >= J.need.minnows) { const clean = !J.pet, g3 = clean ? addGold(6) : 0; if (clean) J.perfect++; ding(); toast((clean ? 'REEL: "SILVER ONLY! GUS SALUTES YOU!"' : 'REEL: "BUCKET\'S FULL! GUS FORGIVES YOU. PROBABLY."') + ' +' + (g2 + g3), 1.8); net.visible = false; NEXT('scooped', beginWeigh, 1.4); }
      else toast('SCOOPED · ' + J.scooped + ' OF ' + J.need.minnows + ' +' + g2, 0.8); return; } }
  // ---- 4 WEIGH: hang their catch, tap when the needle is in the green; maybe a new record ----
  function beginWeigh() { J.step = 4; J.sub = 'weigh'; placeReel('weigh'); custLook(SCL.x, SCL.z); const W = J.wf; W.g = keep(makeFish(W.id, W.L)); W.g.rotation.set(Math.PI / 2, Math.PI / 2, 0, 'YXZ');
    W.g.position.copy(CUSTP).add(V(0, 1.1, 0)); setBand(W.kg); J.wOn = false; J.wT = 0; needle.rotation.z = -THETA(0);
    fly(W.g, V(SCL.x, HOOKY - W.L * 0.56, SCL.z - 0.03), 0.6, 0.3, () => { J.wOn = true; J.wT = 0; tone(220, 0.05, 0.3, 'triangle'); }); toast('STEP 4 OF 5 · TAP WHEN THE NEEDLE IS IN THE GREEN', 2.2); }
  function weighTick(dt) { if (!J.wOn) return; J.wT += dt; const tT = THETA(J.wf.kg), A = Math.max(DELTA * 1.9, 1.9 * Math.exp(-0.1 * J.wT)), th = Math.max(-2.36, Math.min(2.36, tT + A * Math.sin(2.4 * J.wT)));
    J.th = th; needle.rotation.z = -th; J.read = (th * 180 / Math.PI + 135) / 27; J.wf.g.rotation.z = Math.sin(J.wT * 2.4) * 0.05; }
  function weighPress() { if (!J.wOn) return; J.wOn = false; const W = J.wf, inB = Math.abs(J.th - THETA(W.kg)) <= DELTA, g2 = addGold(inB ? 10 : 4); needle.rotation.z = -THETA(W.kg); if (inB) J.perfect++;
    inB ? ding() : pop(); J.wRes = inB ? 'SPOT ON' : 'ROUNDED';
    toast((inB ? 'SPOT ON · ' : 'REEL: "STILL SWINGING! I\'LL READ IT OFF." · ') + W.kg.toFixed(2) + ' KG +' + g2, 1.8);
    const rec = records()[W.id];
    if (W.kg > rec.kg) { J.newRec = { old: rec }; setRecord(W.id, J.C.name, W.kg); const g3 = addGold(8); NEXT('weighed', () => { J.sub = 'record'; fanfare(); toast('NEW MERU RECORD! ' + J.C.name + ' · ' + SP[W.id].name + ' +' + g3, 2.6); NEXT('record', beginIce, 2.8); }, 1.6); }
    else { J.newRec = null; NEXT('weighed', () => { toast('THE RECORD IS ' + rec.kg.toFixed(2) + ' KG (' + rec.who + '). NEXT TIME!', 2.0); NEXT('weighed2', beginIce, 1.6); }, 1.6); } }
  // ---- 5 SORT & ICE: big fish in the BIG chest, small in the SMALL ----
  function beginIce() { J.step = 5; J.sub = 'ice'; placeReel('ice'); custLook(TRAYP.x, TRAYP.z); if (J.wf.g) J.wf.g.visible = false; J.iced = 0; J.iceWrong = 0; J.held = null; J.chestN = { big: 0, small: 0 };
    const kinds = ['big', 'big', 'big', 'small', 'small', 'small'].sort(() => Math.random() - 0.5);
    J.ice = kinds.map((k, i) => { const id = pickOf(k === 'big' ? ['carp', 'trout', 'koi', 'catfish'] : ['bluegill', 'bluegill', 'carp', 'trout']), L = k === 'big' ? rnd(0.36, 0.41) : rnd(0.15, 0.2), g = keep(makeFish(id, L)); g.rotation.set(0, Math.PI / 2, Math.PI / 2, 'YXZ');
      const slot = V(TRAYP.x - 0.4 + (i % 3) * 0.4, 0.78, TRAYP.z - 0.1 + Math.floor(i / 3) * 0.22); g.position.copy(slot); return { k, g, slot, done: false }; }); toast('STEP 5 OF 5 · BIG FISH IN BIG · SMALL IN SMALL', 2.2); }
  const chestAt = () => { let best = null, bd = RAD() * 3.4; for (const k of ['big', 'small']) { const d = dist(scrW(CH[k].clone().add(V(0, 0.0, 0)))); if (d < bd) { bd = d; best = k; } } return best; };
  function iceLift(f) { J.held = { f, x0: ptr.x, y0: ptr.y, moved: false, tap: false }; f.g.position.y = 0.9; pop(); }
  function icePress() { if (J.flies.length) return; const H = J.held;
    if (H && H.tap) { const k = chestAt(); if (k) { iceDrop(H.f, k); return; } const o = nearestOf(J.ice.filter(q => !q.done && q !== H.f), q => q.g.position, 1.6); fly(H.f.g, H.f.slot, 0.25, 0.04); J.held = null; if (o) iceLift(o); return; }
    const f = nearestOf(J.ice.filter(q => !q.done), q => q.g.position, 1.8); if (f) iceLift(f); }
  function iceDrag() { const H = J.held; if (!H || !ptr.down) return; if (Math.hypot(ptr.x - H.x0, ptr.y - H.y0) > 10) { H.moved = true; H.tap = false; } if (!H.moved) return;
    const h = ptrHit(UPN, V(0, 0.95, 0)); if (h) H.f.g.position.set(Math.max(-19.2, Math.min(-16.7, h.x)), 0.95, Math.max(211.9, Math.min(213.3, h.z))); }
  function iceRelease() { const H = J.held; if (!H) return; if (!H.moved) { H.tap = true; toast('NOW TAP THE BIG OR SMALL CHEST', 1.2); return; }
    const p = H.f.g.position; let k = null; for (const q of ['big', 'small']) if (Math.abs(p.x - CH[q].x) < 0.6 && Math.abs(p.z - CH[q].z) < 0.45) k = q; if (!k) k = chestAt();
    if (k) iceDrop(H.f, k); else { fly(H.f.g, H.f.slot, 0.25, 0.04); J.held = null; } }
  function iceDrop(f, k) { J.held = null;
    if (f.k !== k) { J.iceWrong++; nope(); toast(f.k === 'big' ? 'REEL: "THAT\'S A WHOPPER! BIG CHEST!"' : 'REEL: "THAT\'S A TIDDLER! SMALL CHEST!"', 1.6); fly(f.g, f.slot, 0.3, 0.06); return; }
    f.done = true; const n = J.chestN[k]++, to = CH[k].clone().add(V(-0.3 + (n % 3) * 0.3, -0.02 + Math.floor(n / 3) * 0.04, (n % 2 ? 0.1 : -0.1))); fly(f.g, to, 0.35, 0.2, () => { f.g.rotation.y = Math.PI / 2 + Math.random() * 0.6 - 0.3; tone(1200, 0.03, 0.15, 'triangle'); }); addGold(2); J.iced++;
    if (J.iced >= J.ice.length) { const clean = !J.iceWrong, g3 = clean ? addGold(6) : 0; if (clean) J.perfect++; ding(); toast((clean ? 'REEL: "PERFECT SORT! THE ICE IS HAPPY!"' : 'REEL: "ALL ON ICE! FRESH AS A DAISY!"') + (g3 ? ' +' + g3 : ''), 1.8); NEXT('iced', beginPay, 1.4); } }
  // ---- pay + gift ----
  function beginPay() { J.sub = 'pay'; J.t = 0; placeReel('pay'); const C = J.C, f = J.cust; f.rotation.y = Math.PI / 2; f.userData.mood = f.userData.base = 'happy'; f.userData.hop = 1; tone(523, 0.05, 0.4); tone(659, 0.05, 0.5); tone(784, 0.05, 0.7);
    const g2 = addGold(24), W = J.wf;
    setCard('pay', head('JOB DONE', '+' + J.gold + ' GOLD') + '<div style="padding:8px 10px 10px">' + who(C) + row('#e58a86', 'WORMS ×' + J.need.worms, '\u2713', true) + row(LURE[J.need.lure].c, LURE[J.need.lure].name, '\u2713', true)
      + row('#b9c3cc', 'MINNOWS ×' + J.need.minnows, '\u2713', true) + row(SP[W.id].c, SP[W.id].name + ' ' + W.kg.toFixed(2) + ' KG', J.newRec ? 'RECORD' : '\u2713', true) + row(WHITE, 'ON ICE ×6', '\u2713', true)
      + '<div style="font-size:13px;font-style:italic;padding-top:6px">"' + ['Best bait shop on the lake. Only bait shop on the lake. Still the best.', 'Reel, your helper is quicker than you.', 'See you at the jetty!'][J.ci % 3] + '"</div></div>'); toast(C.name + ' PAYS · +' + g2 + ' GOLD', 2.2); }
  function endJob() { const gold = J.gold, pf = J.perfect, perfect = pf >= 4, gift = giveGift(), C = J.C, first = !K.stars('job'); if (perfect && gift.kind !== 'shiny') save.give('shinyLure', 2); save.best('baitBest', gold); stop();
    K.finish('job', pf >= 4 ? 3 : pf >= 2 ? 2 : 1, gold, first);
    toast('JOB DONE · +' + gold + ' GOLD · ' + gift.label + (perfect && gift.kind !== 'shiny' ? ' + SHINY LURE ×2' : ''), 3.5);
    const nm = C.name.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    const OPEN = [nm + ' is off to the jetty! ' + gold + ' gold!', 'Happy customer! ' + gold + ' gold!', gold + ' gold! ' + nm + ' is happy as a clam!', 'Five jobs, one customer, ' + gold + ' gold!'][save.stat('baitClears', 1) % 4];
    const G2 = { rod1: 'Your own BAMBOO ROD! Fish from any shore now.', outfit: "Reel's hat and vest! The gear peg takes them off.", rod2: 'A STEEL ROD! Casts further, reels faster.', gold3: 'Three GOLDEN BAITS! Rare fish love them.',
      hook: 'My LUCKY HOOK! More rare bites.', gold1: 'A golden bait! Use it wisely.', shiny: 'Three shiny lures! They pull the big ones.' };
    sayTo(endT, [ln(OPEN + (G2[gift.kind] ? ' ' + G2[gift.kind] : ''))]); }
  function jobTick(dt, fox) { J.t += dt; if (J.flies.length) flyTick(dt); if (fox) JW(fox, 'bait ' + (J.sub === 'scoop' || J.sub === 'scooped' ? 'net' : J.sub || 'tie')); if (J.cust) kit.animFox && kit.animFox(J.cust, dt, 0);
    if (J.sub === 'tied') knotTick(dt); if (J.sub === 'scoop' || J.sub === 'scooped') { if (J.sub === 'scooped') tankTick(dt, false); else scoopTick(dt); }
    if (J.path) { const ph = 1 + 0.35 * Math.sin(performance.now() / 140); J.path.pts.forEach((q, i) => { q.d.scale.setScalar(i === J.path.i ? ph : 1); }); }
    if (J.held && !J.held.moved && J.sub === 'ice') J.held.f.g.position.y = 0.9 + Math.sin(performance.now() / 150) * 0.01;
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } drawCard(); return; }
    if (J.sub === 'dig') digTick(dt); else if (J.sub === 'weigh') weighTick(dt); else if (J.sub === 'pay' && J.t > 3.4) { endJob(); return; } if (J) drawCard(); }
  function jobPress() { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'dig') digPress(); else if (s === 'lurePick') lurePress(); else if (s === 'weigh') weighPress(); else if (s === 'ice') icePress(); }
  function jobDrag(dt) { if (!J || J.pause > 0) return; const s = J.sub; if (s === 'thread' || s === 'wrap' || s === 'pull') tieDrag(dt); else if (s === 'scoop') scoopDrag(); else if (s === 'ice') iceDrag(); }
  function jobRelease() { if (!J) return; if (J.sub === 'ice') iceRelease(); else if ((J.sub === 'thread' || J.sub === 'wrap' || J.sub === 'pull') && J.tieP) setTie(J.tieP); }
  const strip = n => '<div style="display:flex;gap:2px;margin:2px 0 6px">' + STEP_N.map((s, i) => '<span style="flex:1;min-width:0;padding:2px 3px;font-size:10px;font-weight:900;border:2px solid #201e1d;overflow:hidden;background:' + (i + 1 < n ? '#201e1d' : i + 1 === n ? '#ec3013' : '#f3f2f2') + ';color:' + (i + 1 <= n ? '#ffffff' : '#201e1d') + '">' + s + '</span>').join('') + '</div>';
  function drawCard() { if (!J || J.sub === 'pay') return; const s = J.sub, N = J.need; let next = '', det = '', key = s + J.step;
    if (J.step === 1) { key += J.dug; next = 'TAP THE WORMS'; det = row('#e58a86', 'WORMS', J.dug + '/' + N.worms, J.dug >= N.worms) + meter(J.dug / N.worms, '#e58a86'); }
    else if (J.step === 2) { const pi = J.path ? J.path.i : 0; key += pi + '_' + J.wrong; next = s === 'lurePick' || s === 'lureFly' ? 'TAP THE ' + LURE[N.lure].name : s === 'thread' ? 'DRAG THROUGH THE EYE' : s === 'wrap' ? 'WRAP · FOLLOW THE DOTS' : s === 'pull' ? 'TUCK IT · PULL TIGHT' : 'KNOT TIGHT';
      det = row(LURE[N.lure].c, LURE[N.lure].name, s === 'lurePick' ? 'TAP IT' : '\u2713', s !== 'lurePick') + ['thread', 'wrap', 'pull'].map((q, i) => { const order = ['thread', 'wrap', 'pull', 'tied', 'tiedDone'], cur = order.indexOf(s), done = cur > i; return row(INK, ['THREAD', 'WRAP', 'PULL'][i], done ? '\u2713' : cur === i && J.path ? J.path.i + '/' + J.path.pts.length : '\u2014', done); }).join(''); }
    else if (J.step === 3) { key += J.scooped + '_' + J.pet; next = 'DRAG THE NET · SILVER ONLY'; det = row('#b9c3cc', 'SILVER MINNOWS', J.scooped + '/' + N.minnows, J.scooped >= N.minnows) + row('#e0442a', 'RED ONES · SHOP PETS', 'LEAVE', false); }
    else if (J.step === 4) { const W = J.wf, rec = records()[W.id]; key += (J.wOn ? Math.round((J.read || 0) * 10) : 'x') + (J.newRec ? 'r' : ''); next = J.wOn ? 'TAP WHEN THE NEEDLE IS GREEN' : s === 'record' ? 'NEW RECORD!' : 'HANG IT ON THE HOOK';
      det = row(SP[W.id].c, SP[W.id].name, J.wOn ? (J.read || 0).toFixed(1) + ' KG' : s === 'weigh' ? '\u2014' : W.kg.toFixed(2) + ' KG', !J.wOn && s !== 'weigh') + row(BRASS, 'RECORD · ' + (J.newRec ? J.C.name : rec.who), (J.newRec ? W.kg : rec.kg).toFixed(2) + ' KG', !!J.newRec); }
    else if (J.step === 5) { const b = J.ice.filter(q => q.k === 'big' && q.done).length, sm = J.ice.filter(q => q.k === 'small' && q.done).length; key += b + '_' + sm + '_' + J.iceWrong + (J.held ? (J.held.tap ? 't' : 'h') : ''); next = J.held && J.held.tap ? 'TAP THE BIG OR SMALL CHEST' : 'DRAG EACH FISH TO ITS CHEST';
      det = row(BLUE, 'BIG CHEST', b + '/3', b >= 3) + row(RED, 'SMALL CHEST', sm + '/3', sm >= 3); }
    setCard(key, head('STEP ' + J.step + ' OF 5', STEP_N[J.step - 1] + (J.gold ? ' · ' + J.gold + ' G' : '')) + foot(next) + '<div style="padding:8px 10px 10px">' + who(J.C) + (innerHeight >= 720 ? strip(J.step) : '') + det + '</div>'); }
  function stop() { busy = null; if (J) { clearDots(); J.objs.forEach(o => o.parent && o.parent.remove(o)); if (J.cust) { J.cust.visible = false; J.cust.userData.mood = J.cust.userData.base = 'neutral'; } }
    J = null; ptr.down = false; net.visible = false; tieLine.visible = false; for (const w of WORMS) { w.st = 0; w.g.visible = false; } needle.rotation.z = -THETA(0);
    TKZ = [TK.z0, TK.z1]; for (const f of TFISH) { if (f.gone) { f.gone = false; f.g.visible = true; f.p.set(rnd(TK.x0, TK.x1), rnd(TK.y0, TK.y1), rnd(TK.z0, TK.z1)); } } hideCard(); placeReel('idle'); }
  // ================= DOCK FISHING =================
  const FX = new THREE.Group(); FX.name = 'baitFishing'; FX.visible = false; scene.add(FX);
  const bob = new THREE.Group(); { bob.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), LM(RED)), new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), LM('#ffffff'))); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 5), LM(INK)); st.position.y = 0.15; bob.add(st); } FX.add(bob);
  const LN = 24, flG = new THREE.BufferGeometry(); flG.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(LN * 3), 3)); const fline = new THREE.Line(flG, new THREE.LineBasicMaterial({ color: 0xf3f2f2 })); fline.frustumCulled = false; FX.add(fline);
  const ringG = new THREE.RingGeometry(0.82, 1, 28), ringMat = () => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide });
  const RIP = [0, 1, 2].map(i => { const m = new THREE.Mesh(ringG, ringMat()); m.rotation.x = -Math.PI / 2; FX.add(m); return { m, p: V(), off: i * 0.63, age: 0 }; });
  const splR = new THREE.Mesh(ringG, ringMat()); splR.rotation.x = -Math.PI / 2; FX.add(splR); let splT = 9;
  const bang = new THREE.Sprite(new THREE.SpriteMaterial({ map: label('!', YEL, INK, 64, 64, 56), depthTest: false })); bang.scale.set(0.5, 0.5, 1); bang.renderOrder = 6; bang.visible = false; FX.add(bang);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1, 18), new THREE.MeshBasicMaterial({ color: 0x0b2a3a, transparent: true, opacity: 0.35, depthWrite: false })); shadow.rotation.x = -Math.PI / 2; shadow.visible = false; FX.add(shadow);
  function makeRod(tier) { const g = new THREE.Group(), c = ['#8a6440', '#d8c27a', '#c9ced3'][tier]; const h = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.36, 8), LM(tier === 2 ? INK : '#5e3a26')); h.position.y = 0.18; g.add(h);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.018, 2.0, 6), LM(c)); sh.position.y = 1.36; g.add(sh); if (tier === 1) for (let i = 0; i < 5; i++) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.02 - i * 0.002, 0.02 - i * 0.002, 0.03, 6), LM('#b79f55')); n.position.y = 0.6 + i * 0.35; g.add(n); }
    const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.05, 12), LM(tier === 2 ? RED : DARK)); rl.rotation.z = Math.PI / 2; rl.position.set(0.05, 0.3, 0.02); g.add(rl);
    const tip = new THREE.Object3D(); tip.position.y = 2.36; g.add(tip); g.userData.tip = tip; g.traverse(o => { o.renderOrder = 2; }); return g; }
  let rodObj = null;
  let rodFox = null; function attachRod() { if (rodObj || !lastFox || !F) return; rodObj = makeRod(F.tier); const U = lastFox.userData || {}, P = U.P; rodFox = { fox: lastFox, hold: U.hold, sword: P && P.sword, arm: null };
    if (P && P.arms && P.arms[1]) { rodObj.position.set(0, -0.42, 0.06); rodObj.scale.setScalar(0.85); P.arms[1].add(rodObj); rodFox.arm = P.arms[1]; U.hold = { ...(U.hold || {}), right: true }; } else { rodObj.position.set(0.3, 0.9, 0.2); rodObj.rotation.x = 0.95; lastFox.add(rodObj); } }
  function dropRod() { if (rodObj && rodObj.parent) rodObj.parent.remove(rodObj); rodObj = null; if (rodFox) { if (rodFox.sword) rodFox.sword.visible = true; rodFox.fox.userData.hold = rodFox.hold; rodFox = null; } }
  let NEL = null; function makeNelly() { const g = new THREE.Group(), m = LM('#2f7a5a'), mb = LM('#9fd3a8'), add = (geo, mat, x, y, z, sx = 1, sy = 1, sz = 1, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, mat); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.set(rx, 0, rz); g.add(o); return o; };
    add(new THREE.CylinderGeometry(0.55, 0.75, 1.8, 14), m, 0, 0.9, 0); add(new THREE.CylinderGeometry(0.45, 0.56, 1.6, 14), m, 0, 2.4, 0.15, 1, 1, 1, 0.22); add(sphG, m, 0, 3.45, 0.55, 0.78, 0.62, 1.05); add(sphG, mb, 0, 3.25, 1.25, 0.5, 0.36, 0.5);
    add(sphG, mb, 0, 1.4, 0.45, 0.5, 1.1, 0.25); for (const s of [-1, 1]) { add(sphG, LM('#ffffff'), s * 0.36, 3.72, 1.0, 0.2, 0.2, 0.2); add(sphG, LM(INK), s * 0.38, 3.74, 1.16, 0.09, 0.09, 0.09); add(sphG, LM('#1d4a36'), s * 0.14, 3.32, 1.72, 0.05, 0.05, 0.05); }
    for (let i = 0; i < 4; i++) add(new THREE.ConeGeometry(0.16, 0.4, 6), LM('#c9d94a'), 0, 1.0 + i * 0.85, -0.55 + i * 0.05, 1, 1, 1, -0.4);
    add(sphG, m, 0, -0.1, -2.6, 1.3, 0.55, 1.8); g.scale.setScalar(1.2); g.visible = false; scene.add(g); return g; }
  const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), new THREE.MeshBasicMaterial({ color: 0xf6f1ff })); pearl.visible = false; FX.add(pearl);
  const jettyAt = (x, z, pad = 0) => LAKE.jetties.some(Q => x > Q.r[0] - pad && x < Q.r[1] + pad && z > Q.r[2] - pad && z < Q.r[3] + pad);
  const water = (x, z) => lakeF(x, z) < 0.985 && !jettyAt(x, z, 0.5);
  const blockedP = P => P.car || P.boat || P.ferry || P.swim || P.skate || P.tank || P.heli || P.ab || P.carousel || (inside && inside());
  function canFish(P) { if (blockedP(P)) return null; const y = P.y || 0;
    if (Math.hypot(P.x - SPOT.dock.x, P.z - SPOT.dock.z) < SPOT.dock.r && y > 0.5) return { dir: V(0, 0, 1), where: "REEL'S JETTY", dock: true };
    if (rodTier() < 1) return null; const onJ = y > 0.5 && jettyAt(P.x, P.z), f0 = lakeF(P.x, P.z), shore = !onJ && f0 >= 0.99 && f0 < 1.05 && y < 1.5; if (!onJ && !shore) return null;
    let best = null, bs = -9; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, dx = Math.sin(a), dz = Math.cos(a); if (!water(P.x + dx * 7, P.z + dz * 7) || !water(P.x + dx * 10, P.z + dz * 10)) continue; if (shore && lakeF(P.x + dx * 3, P.z + dz * 3) > 1.0) continue;
      const sc = Math.cos(a - (P.yaw || 0)); if (sc > bs) { bs = sc; best = V(dx, 0, dz); } }
    return best ? { dir: best, where: onJ ? 'JETTY' : 'LAKE SHORE' } : null; }
  function placeRipple(r, near) { const O = F.O, d = F.dir, base = Math.atan2(d.x, d.z), rg = RANGE[F.tier];
    for (let k = 0; k < 24; k++) { const a = base + rnd(-0.6, 0.6), L = rnd(6, rg - 0.8), x = O.x + Math.sin(a) * L, z = O.z + Math.cos(a) * L; if (!water(x, z)) continue; if (RIP.some(q => q !== r && q.p.distanceTo(V(x, WY, z)) < 3)) continue; r.p.set(x, WY + 0.01, z); r.age = 0; return; }
    r.p.set(O.x + d.x * 8, WY + 0.01, O.z + d.z * 8); }
  const nearRipple = p => RIP.find(r => Math.hypot(r.p.x - p.x, r.p.z - p.z) < 2.4);
  const bookN = () => { const b = save.stat('fishBook', null) || {}; return SPK.filter(k => b[k] && b[k].n).length; };
  function startFish(P, f) { busy = 'fish'; const tier = rodTier(), bp = save.stat('baitPick', 'worm');
    F = { O: V(P.x, P.y || 0, P.z), dir: f.dir.clone().normalize(), where: f.where, tier, mode: 'ready', t: 0, bait: baitOk(bp) ? bp : 'worm', tgt: V(), from: V(), flyT: 0, wait: 0, nibs: [], nibNow: 0, bw: 0, D: 0, D0: 0, ten: 0, surge: false, phT: 1, lock: 0, fish: null, catchT: 0, cast: 0, ripT: 0, u: V(), fp: V(), paused: false };
    P.yaw = Math.atan2(F.dir.x, F.dir.z); P.sp = 0; FX.visible = true; bob.visible = false; fline.visible = false; shadow.visible = false; bang.visible = false; pearl.visible = false;
    RIP.forEach(r => placeRipple(r)); attachRod(); tone(500, 0.04, 0.2, 'triangle'); toast(f.dock ? "REEL'S JETTY · FREE FISHING" : 'FISHING · ' + RODS[tier], 1.8); card.style.pointerEvents = 'auto'; cardKey = ''; }
  function stopFish(msg) { if (!F) return; F = null; busy = null; dropRod(); FX.visible = false; if (NEL) NEL.visible = false; hideCard(); hidePick(); ptr.down = false; if (msg) toast(msg, 1.6); }
  function tipW(v) { if (rodObj) { rodObj.updateMatrixWorld(true); return rodObj.userData.tip.getWorldPosition(v); } return v.set(F.O.x + F.dir.x * 1.6, F.O.y + 2.3, F.O.z + F.dir.z * 1.6); }
  function cycleBait() { if (!F || F.mode === 'reel' || F.mode === 'nelly') { toast('SWAP BAIT BETWEEN CASTS', 1.2); return; } let i = BK.indexOf(F.bait); for (let k = 0; k < 3; k++) { i = (i + 1) % 3; if (baitOk(BK[i])) break; }
    const nb = BK[i]; if (nb === F.bait) { toast('ONLY PLAIN WORMS · BUY LURES AT REEL\'S COUNTER', 1.8); return; } F.bait = nb; save.setStat('baitPick', nb); tone(880, 0.04, 0.15, 'triangle'); toast('BAIT · ' + BAITS[nb] + (nb === 'goldenBait' ? ' · RARE FISH LOVE IT' : nb === 'shinyLure' ? ' · PULLS THE BIG ONES' : ''), 1.6); cardKey = ''; }
  function castTo(h) { const O = F.O, d = F.dir, rg = RANGE[F.tier]; const v = h ? V(h.x - O.x, 0, h.z - O.z) : d.clone().multiplyScalar(rg * 0.7);
    const a0 = Math.atan2(d.x, d.z), ang = Math.atan2(v.x, v.z) - a0, a = Math.atan2(Math.sin(ang), Math.cos(ang)), base = a0 + Math.max(-0.75, Math.min(0.75, a)); let L = Math.max(4, Math.min(rg, v.length())), tx = 0, tz = 0, ok = false;
    for (let k = 0; k < 8; k++) { tx = O.x + Math.sin(base) * L; tz = O.z + Math.cos(base) * L; if (water(tx, tz)) { ok = true; break; } L += 1.2; if (L > rg + 3) break; }
    if (!ok) { nope(); toast('CAST ONTO OPEN WATER', 1.4); return; }
    F.tgt.set(tx, WY, tz); tipW(F.from); F.mode = 'fly'; F.flyT = 0; bob.visible = true; fline.visible = true; F.cast = 1; whiz(); }
  function armBite(short) { const nr = nearRipple(F.tgt); F.nearRip = !!nr; F.wait = short ? rnd(1.4, 2.8) : nr ? rnd(1.4, 3.0) : rnd(2.6, 6.0); F.nibs = []; const n = Math.floor(Math.random() * 3); for (let i = 0; i < n; i++) F.nibs.push(F.wait * rnd(0.25, 0.85)); F.nibs.sort((a, b) => b - a); F.nibNow = 0; }
  function splash(p, s = 1) { splR.position.set(p.x, WY + 0.02, p.z); splT = 0; splR.userData.s = s; plop(); }
  function chooseFish() { const gold = F.bait === 'goldenBait', shiny = F.bait === 'shinyLure', hook = save.count('luckyHook') > 0;
    if (Math.random() < (gold ? 0.06 : 0.012)) return { nelly: true, id: 'nelly', kg: 0, L: 3 };
    const rare = Math.random() < 0.12 + (shiny ? 0.13 : 0) + (gold ? 0.38 : 0) + (hook ? 0.1 : 0) + (F.nearRip ? 0.15 : 0);
    const pool = SPK.filter(k => !!SP[k].rare === rare), tw = pool.reduce((s, k) => s + SP[k].w, 0); let r = Math.random() * tw, id = pool[0]; for (const k of pool) { r -= SP[k].w; if (r <= 0) { id = k; break; } }
    const S = SP[id]; let u = Math.random(); if (shiny || gold) u = 1 - (1 - u) * (1 - u); const L = S.L[0] + (S.L[1] - S.L[0]) * u; return { id, L, kg: Math.max(0.01, Math.round(S.k * L * L * L * 100) / 100), rare: !!S.rare }; }
  function hookFish() { const S = chooseFish(); F.fish = S; F.mode = 'reel'; bang.visible = false; F.u.set(bob.position.x - F.O.x, 0, bob.position.z - F.O.z); F.D0 = F.D = Math.max(4, F.u.length()); F.u.normalize();
    if (S.nelly) { F.D0 = F.D = Math.max(F.D, 18); } F.ten = 0.15; F.surge = false; F.phT = 1.2; F.lock = 0; shadow.visible = true; shadow.scale.setScalar(S.nelly ? 3.6 : 0.2 + Math.min(0.6, S.L * 0.6)); tone(700, 0.06, 0.25, 'square', 0, 1200);
    toast(S.nelly ? 'WHOA! SOMETHING HUGE! HOLD TO REEL' : 'HOOKED! HOLD TO REEL IN', 1.6); try { navigator.vibrate && navigator.vibrate(40); } catch (e) {} }
  function landFish() { const S = F.fish; if (S.nelly) { nellyStart(); return; }
    const book = { ...(save.stat('fishBook', null) || {}) }, e = { ...(book[S.id] || { n: 0, best: 0 }) }, isNew = !e.n, isBest = !isNew && S.kg > e.best; e.n++; e.best = Math.max(e.best, S.kg); book[S.id] = e; save.setStat('fishBook', book); save.setStat('fishCaught', save.stat('fishCaught', 0) + 1);
    const rec = records()[S.id], isRec = S.kg > rec.kg; if (isRec) setRecord(S.id, 'YOU', S.kg);
    const gold = Math.max(1, Math.round(2 + S.kg * 3 * (S.rare ? 2 : 1))); save.addGold(gold);
    if (F.bait !== 'worm') { save.take(F.bait); if (!save.count(F.bait)) { F.bait = 'worm'; save.setStat('baitPick', 'worm'); } }
    F.res = { title: SP[S.id].name, sub: S.kg.toFixed(2) + ' KG · +' + gold + ' GOLD', rows: (isNew ? tag('NEW IN YOUR FISH BOOK') : '') + (isBest ? tag('YOUR BIGGEST YET') : '') + (S.rare ? tag('RARE') : '') + (isRec ? tag("NEW MERU RECORD · ON REEL'S BOARD") : '') };
    const disp = Math.max(1, 0.32 / S.L); F.fm = makeFish(S.id, S.L * disp); F.fm.position.copy(bob.position); FX.add(F.fm); F.show = V(F.O.x + F.dir.x * 2.4 - F.dir.z * 0.7, F.O.y + 1.3, F.O.z + F.dir.z * 2.4 + F.dir.x * 0.7); F.fmFrom = bob.position.clone();
    F.mode = 'catch'; F.catchT = 0; bob.visible = false; shadow.visible = false; splash(bob.position, 0.8); isRec ? fanfare() : ding(); const r = nearRipple(bob.position); if (r) placeRipple(r);
    toast(isRec ? 'NEW MERU RECORD! ' + SP[S.id].name : (isNew ? 'NEW! ' : '') + SP[S.id].name + ' · ' + S.kg.toFixed(2) + ' KG', 2.4); }
  function endCatch() { if (F.fm) { FX.remove(F.fm); F.fm = null; } F.fish = null; F.mode = 'ready'; fline.visible = false; F.show = null; }
  function nellyStart() { if (!NEL) NEL = makeNelly(); F.mode = 'nelly'; F.nT = 0; F.pearlDone = false; const d = F.dir, p = V(F.O.x + d.x * 11 - d.z * 2.6, -5.2, F.O.z + d.z * 11 + d.x * 2.6); NEL.position.copy(p); NEL.visible = true; shadow.visible = false; bob.visible = false; splash(V(p.x, 0, p.z), 3); }
  function nellyTick(dt) { F.nT += dt; const t = F.nT, ny = t < 1.8 ? -5.2 + 5.0 * Math.sin(Math.min(1, t / 1.8) * Math.PI / 2) : t < 5.4 ? -0.2 : -0.2 - 5.0 * Math.min(1, (t - 5.4) / 1.8);
    NEL.position.y = ny; NEL.rotation.order = 'YXZ'; NEL.rotation.y = Math.atan2(F.O.x - NEL.position.x, F.O.z - NEL.position.z); NEL.rotation.z = 0; NEL.rotation.x = t > 1.8 && t < 5.4 ? Math.sin((t - 1.8) * 2.2) * 0.06 : 0; if (t > 2.0 && !F.roared) { F.roared = true; roar(); try { navigator.vibrate && navigator.vibrate([80, 60, 120]); } catch (e) {} }
    if (t > 2.6 && fline.visible) { fline.visible = false; tone(2400, 0.05, 0.08, 'square'); }
    if (t > 3.2 && !F.pearlDone) { F.pearlDone = true; NEL.updateMatrixWorld(true); F.pf = NEL.localToWorld(V(0, 3.3, 1.6)); F.pt = 0; pearl.visible = true; pearl.position.copy(F.pf); }
    if (pearl.visible) { F.pt += dt / 1.0; const k = Math.min(1, F.pt), to = V(F.O.x + F.dir.x * 1.2, F.O.y + 0.15, F.O.z + F.dir.z * 1.2); pearl.position.lerpVectors(F.pf, to, k); pearl.position.y += Math.sin(k * Math.PI) * 2.5;
      if (k >= 1) { pearl.visible = false; save.give('hullPearl'); save.setStat('fishNelly', save.stat('fishNelly', 0) + 1); fanfare(); toast('NELLY SAYS HELLO · SHE LEFT YOU A HULL PEARL', 3); if (F.bait === 'goldenBait') { save.take('goldenBait'); if (!save.count('goldenBait')) { F.bait = 'worm'; save.setStat('baitPick', 'worm'); } } } }
    if (t > 7.4) { NEL.visible = false; F.mode = 'ready'; F.fish = null; F.roared = false; } }
  function fishPress() { if (!F) return; const m = F.mode;
    if (m === 'ready') { castTo(ptrHit(UPN, V(0, WY, 0))); return; }
    if (m === 'wait') { toast(F.nibNow > 0 ? 'JUST A NIBBLE · WAIT FOR THE BIG DIP' : 'WAIT FOR THE BOBBER TO DIP UNDER', 1.2); tone(300, 0.02, 0.08, 'triangle'); return; }
    if (m === 'bite') { hookFish(); return; }
    if (m === 'catch' && F.catchT > 0.8) endCatch(); }
  function fishTick(dt, P) { const t = performance.now() / 1000; if (!F) return; F.t += dt; attachRod();
    if (blockedP(P) || Math.hypot(P.x - F.O.x, P.z - F.O.z) > 1.5) { stopFish('STOPPED FISHING'); return; } P.yaw = Math.atan2(F.dir.x, F.dir.z);
    for (const r of RIP) { r.age += dt; if (r.age > 32) placeRipple(r); const s = ((t * 0.55 + r.off) % 1); r.m.position.copy(r.p); r.m.scale.setScalar(0.25 + s * 1.1); r.m.material.opacity = (F.mode === 'ready' || F.mode === 'fly' || F.mode === 'wait' ? 0.6 : 0.25) * (1 - s); }
    if (splT < 0.7) { splT += dt; const k = splT / 0.7, s = splR.userData.s || 1; splR.scale.setScalar((0.2 + k * 1.4) * s); splR.material.opacity = 0.85 * (1 - k); }
    const m = F.mode, tip = tipW(V()); if (F.paused) { drawFishCard(); return; }
    if (rodObj) { F.cast = Math.max(0, F.cast - dt * 2); if (rodFox && rodFox.sword) rodFox.sword.visible = false; const b0 = rodFox && rodFox.arm ? 0.95 - rodFox.arm.rotation.x : 0.95; rodObj.rotation.x = m === 'reel' ? b0 - 0.33 + F.ten * 0.18 + (F.surge ? Math.sin(t * 40) * 0.035 : 0) : b0 - Math.sin(F.cast * Math.PI) * 0.7; }
    if (m === 'fly') { F.flyT += dt / 0.75; const k = Math.min(1, F.flyT); bob.position.lerpVectors(F.from, F.tgt, k); bob.position.y += Math.sin(k * Math.PI) * 3; if (k >= 1) { F.mode = 'wait'; splash(F.tgt, 0.5); armBite(false); } }
    else if (m === 'wait') { F.wait -= dt; if (F.nibs.length && F.wait < F.nibs[0]) { F.nibs.shift(); F.nibNow = 0.32; plip(); } F.nibNow = Math.max(0, F.nibNow - dt);
      bob.position.set(F.tgt.x, WY + 0.02 * Math.sin(t * 2.2) - (F.nibNow > 0 ? 0.07 * Math.sin((0.32 - F.nibNow) / 0.32 * Math.PI) : 0), F.tgt.z);
      if (F.wait <= 0) { F.mode = 'bite'; F.bw = 1.8; bang.visible = true; splash(F.tgt, 0.7); try { navigator.vibrate && navigator.vibrate(80); } catch (e) {} } }
    else if (m === 'bite') { F.bw -= dt; bob.position.set(F.tgt.x, WY - 0.12 + 0.03 * Math.sin(t * 30), F.tgt.z); bang.position.set(F.tgt.x, WY + 0.75, F.tgt.z); bang.scale.setScalar(0.5 + 0.08 * Math.sin(t * 16));
      if (F.bw <= 0) { F.mode = 'wait'; bang.visible = false; toast('IT SLIPPED OFF · IT WILL BITE AGAIN', 1.6); armBite(true); } }
    else if (m === 'reel') { const S = F.fish; F.phT -= dt; if (F.phT <= 0) { F.surge = !F.surge; F.phT = F.surge ? rnd(0.7, 1.3) * (S.nelly ? 1.6 : 1) : rnd(1.2, 2.4); if (F.surge) splash(F.fp, S.nelly ? 2 : 0.6); }
      const hold = ptr.down && F.lock <= 0, tk = RTEN[F.tier] * (1 + (S.nelly ? 6 : S.kg) / 10) * (S.nelly ? 1.5 : 1);
      if (hold) { F.ten += dt * (F.surge ? 0.9 : 0.22) * tk; F.D -= dt * RSPD[F.tier] * (F.surge ? 0.25 : 1) * (S.nelly ? 0.7 : 1); if (Math.random() < 0.3) click(); } else { F.ten -= dt * 0.8; if (F.surge) F.D += dt * 0.45; }
      F.ten = Math.max(0, Math.min(1, F.ten)); if (F.lock > 0) F.lock -= dt;
      if (F.ten >= 1 && F.lock <= 0) { F.lock = 0.9; F.D += 1.2; F.ten = 0.72; nope(); toast('LINE TIGHT! LET GO A MOMENT', 1.2); }
      F.D = Math.min(F.D, F.D0 + 2); const sw = Math.sin(F.t * 1.1) * Math.min(1.5, F.D * 0.15) * (F.surge ? 1.6 : 1), px = -F.u.z, pz = F.u.x;
      F.fp.set(F.O.x + F.u.x * F.D + px * sw, WY, F.O.z + F.u.z * F.D + pz * sw); if (!water(F.fp.x, F.fp.z) && F.D > 2) F.fp.set(F.O.x + F.u.x * F.D, WY, F.O.z + F.u.z * F.D);
      bob.position.set(F.fp.x, WY - (F.surge ? 0.08 : 0.02) + 0.02 * Math.sin(t * 9), F.fp.z); shadow.position.set(F.fp.x, WY + 0.005, F.fp.z);
      if (F.D <= (S.nelly ? 5 : 1.4)) landFish(); }
    else if (m === 'catch') { F.catchT += dt; const k = Math.min(1, F.catchT / 0.6); F.fm.position.lerpVectors(F.fmFrom, F.show, k * k * (3 - 2 * k)); F.fm.position.y += Math.sin(k * Math.PI) * 0.8; F.fm.rotation.y += dt * 2.2; F.fm.rotation.z = Math.sin(F.catchT * 8) * 0.3; if (F.catchT > 3.4) endCatch(); }
    else if (m === 'nelly') nellyTick(dt);
    if (fline.visible) { const a = flG.attributes.position, end = m === 'catch' && F.fm ? F.fm.position : bob.position, dd = tip.distanceTo(end), slack = m === 'wait' || m === 'bite' ? 0.5 : m === 'fly' ? 0.15 : m === 'reel' ? 0.05 * (1 - F.ten) : 0.02;
      for (let i = 0; i < LN; i++) { const u = i / (LN - 1); a.setXYZ(i, tip.x + (end.x - tip.x) * u, tip.y + (end.y - tip.y) * u - Math.sin(u * Math.PI) * slack * Math.min(1.5, dd / 6), tip.z + (end.z - tip.z) * u); } a.needsUpdate = true; }
    drawFishCard(); }
  const fbtn = (a, t) => '<button type="button" data-act="' + a + '" style="flex:1;min-width:0;min-height:44px;padding:4px 8px;border:2px solid #201e1d;border-radius:0;background:#f3f2f2;color:#201e1d;font:900 12px Archivo,sans-serif;text-align:left;cursor:pointer;white-space:normal">' + t + '</button>';
  const tension = f => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px"><div style="position:absolute;right:0;top:0;bottom:0;width:20%;background:#f4b2a6"></div><div style="position:absolute;left:0;top:0;bottom:0;width:' + (f * 100).toFixed(0) + '%;background:' + (f > 0.8 ? RED : INK) + '"></div></div>';
  function drawFishCard() { if (!F || F.paused) return; const m = F.mode; let hint = '', sub = '', extra = '', key = m;
    if (m === 'ready') { hint = touch ? 'TAP THE WATER TO CAST' : 'CLICK THE WATER TO CAST'; sub = 'Ripples mean fish. Cast close to one.'; }
    else if (m === 'fly' || m === 'wait') { hint = 'WAIT FOR A BITE'; sub = 'Little bobs are nibbles. Wait for the big dip.'; }
    else if (m === 'bite') { hint = 'TAP NOW!'; sub = 'It bit!'; }
    else if (m === 'reel') { const S = F.fish; hint = F.lock > 0 ? 'LET GO A MOMENT' : F.surge ? 'IT\'S PULLING · EASE OFF' : 'HOLD TO REEL IN'; sub = S.nelly ? 'SOMETHING HUGE...' : 'Let go when the line goes red.'; key += Math.round(F.ten * 20) + '_' + Math.round(F.D * 2) + (F.surge ? 'p' : '') + (F.lock > 0 ? 'l' : '');
      extra = lab('LINE IN') + meter(1 - (F.D - 1.4) / Math.max(1, F.D0 - 1.4), GREEN) + lab('TENSION') + tension(F.ten); }
    else if (m === 'catch') { hint = F.res.title; sub = F.res.sub; extra = F.res.rows; key += F.res.title; }
    else if (m === 'nelly') { hint = 'NELLY!'; sub = F.pearlDone ? 'She says hello. And she left you a HULL PEARL.' : 'The lake monster herself.'; key += F.pearlDone ? 'p' : ''; }
    key += F.bait + save.count(F.bait) + bookN();
    setCard(key, head(F.where, RODS[F.tier]) + '<div style="padding:8px 10px 10px"><div style="font-weight:900;font-size:' + (m === 'bite' ? 24 : 18) + 'px;line-height:1.1;color:' + (m === 'bite' ? '#ec3013' : '#201e1d') + '">' + hint + '</div>' + (sub ? '<div style="font-size:13px;font-weight:700;margin-top:3px;color:#3d3b3a">' + sub + '</div>' : '') + extra
      + '<div style="display:flex;gap:6px;margin-top:8px">' + fbtn('bait', 'BAIT · ' + BAITS[F.bait] + (F.bait !== 'worm' ? ' ×' + save.count(F.bait) : '')) + fbtn('book', 'FISH BOOK ' + bookN() + '/6') + '</div></div>' + foot('')); }
  // ---------- fish book, tackle counter, gear peg (panels) ----------
  function openBook(fromFish) { const b = save.stat('fishBook', null) || {}, R = records(), nl = save.stat('fishNelly', 0);
    const html = SPK.map(k => { const e = b[k]; return e && e.n ? row(SP[k].c, SP[k].name, '×' + e.n + ' · ' + e.best.toFixed(2) + ' KG', true) : row('#cfcac3', '???', SP[k].rare ? 'RARE' : '\u2014', false); }).join('') + row(nl ? '#2f7a5a' : '#cfcac3', nl ? 'NELLY' : '???', nl ? 'MET ×' + nl : 'LEGEND', !!nl)
      + lab("MERU RECORDS · REEL'S BOARD") + SPK.map(k => row(R[k].who === 'YOU' ? BRASS : '#f3f2f2', SP[k].name, R[k].who + ' ' + R[k].kg.toFixed(2), R[k].who === 'YOU')).join('');
    if (fromFish && F) { F.paused = true; card.style.display = 'none'; } else busy = 'panel';
    showPick('FISH BOOK', bookN() + '/6', '', [{ label: 'DONE', primary: true, go: () => { hidePick(); if (fromFish && F) { F.paused = false; cardKey = ''; } else busy = null; } }], html); pop(); }
  function shopPanel() { busy = 'panel'; const t = rodTier(), buy = (price, fn, what) => { if (!save.spend(price)) { nope(); toast('NOT ENOUGH GOLD', 1.4); return; } fn(); tone(2400, 0.04, 0.15, 'triangle'); toast('BOUGHT · ' + what, 1.6); shopPanel(); };
    showPick('TACKLE COUNTER', 'REEL', 'BAIT, LURES AND RODS · ' + RODS[t] + ' IN HAND', [
      { label: 'SHINY LURE ×3 · 15 G <span style="font-weight:700">· pulls the big ones (you have ' + save.count('shinyLure') + ')</span>', go: () => buy(15, () => save.give('shinyLure', 3), 'SHINY LURE ×3') },
      { label: 'GOLDEN BAIT · 40 G <span style="font-weight:700">· rare fish love it (you have ' + save.count('goldenBait') + ')</span>', go: () => buy(40, () => save.give('goldenBait'), 'GOLDEN BAIT') },
      ...(t < 1 ? [{ label: 'BAMBOO ROD · 60 G <span style="font-weight:700">· fish from any lake shore</span>', go: () => buy(60, () => { save.setStat('baitRod', 1); save.give('bambooRod'); }, 'BAMBOO ROD') }] : []),
      ...(t === 1 ? [{ label: 'STEEL ROD · 150 G <span style="font-weight:700">· casts further, reels faster</span>', go: () => buy(150, () => { save.setStat('baitRod', 2); save.give('steelRod'); }, 'STEEL ROD') }] : []),
      { label: 'DONE', primary: true, go: () => { hidePick(); busy = null; } }]); }
  function pegPanel() { busy = 'panel'; const w = wearNow(), tg = k => { setWear(k, !w[k]); tone(880, 0.04, 0.2, 'triangle'); pegPanel(); };
    showPick('GEAR PEG', 'REEL', 'WHAT YOU WEAR IN MERU', [{ label: 'FISHING HAT · ' + (w.hat ? 'ON' : 'OFF'), on: w.hat, go: () => tg('hat') }, { label: 'LURE VEST · ' + (w.vest ? 'ON' : 'OFF'), on: w.vest, go: () => tg('vest') }, { label: 'DONE', primary: true, go: () => { hidePick(); busy = null; } }]); }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  function shot() { if (!J) return null; const s = J.sub, port = (camera.aspect || 1) < 1;
    if (J.step === 1) return [V(WT.x + 0.12, 0.85, WT.z + 0.05), 2.2, 1.1, 0.95, 1.6, 0, 3.0];
    if (s === 'lurePick' || s === 'lureFly') return [V(-19.15, 1.05, 204.92), 1.9, 0.9, 0.55, 1.2, 0, 2.4];
    if (J.step === 2) return [V(VE.x - 0.02, VE.y - 0.02, TZ), 0.85, 0.5, 0.12, 0.65, 0, 1.3];
    if (J.step === 3) return [V(-26.3, 1.13, (TKZ[0] + TKZ[1]) / 2), port ? 2.1 : 4.0, 1.3, 0.12, 2.3, Math.PI / 2, 5.0];
    if (s === 'record') return [V(BRD.x, BRD.y, BRD.z), 2.3, 1.7, 0.05, 1.8, Math.PI, 3.6];
    if (J.step === 4) return [V(SCL.x, 1.85, SCL.z), 1.4, 1.5, 0.1, 1.9, Math.PI, 3.0];
    if (s === 'pay') return [V(CUSTP.x, 1.0, CUSTP.z), 2.6, 2.0, 0.22, 3.2, Math.PI / 2, 4.0];
    return [V(TRAYP.x, 0.72, 212.55), 2.3, 1.4, 1.0, 1.6, Math.PI, 3.0]; }
  function fishCam() { const O = F.O, d = F.dir, port = (camera.aspect || 1) < 1, nel = F.mode === 'nelly', back = (port ? 5.2 : 4.0) + (nel ? 3 : 0), up = (port ? 6.6 : 5.2) + (nel ? 1.0 : 0), ah = port ? 9.5 : 9;
    camT.pos.set(O.x - d.x * back, O.y + up, O.z - d.z * back); camT.look.set(O.x + d.x * ah, nel ? 1.8 : 0, O.z + d.z * ah);
    { const sh = port ? 0 : 2.0, cs = port ? 0.9 : 1.4; camT.look.x += d.z * sh; camT.look.z -= d.x * sh; camT.pos.x += d.z * cs; camT.pos.z -= d.x * cs; }
    if (F.mode === 'catch' && F.show) camT.look.lerp(F.show, 0.35); }
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' ? shot() : null, fishing = busy === 'fish' && F;
    if (!v && !fishing) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; }
    if (v && (cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);   // portrait: wide lens (job only)
    if (v) { if (near0 == null) { near0 = cam.near; cam.near = 0.05; cam.updateProjectionMatrix(); } fitCam(v); } else fishCam();
    if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    if (v) camCur.pos.set(Math.max(X0 + 0.35, Math.min(X1 - 0.35, camCur.pos.x)), Math.min(4.0, camCur.pos.y), Math.max(Z0 + 0.35, Math.min(Z1 - 0.35, camCur.pos.z)));
    cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- HINT HAND: no input for 3 s → a pointer shows the next spot ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.990-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTarget = () => { if (busy !== 'job' || !J || J.pause > 0 || ptr.down || J.flies.length) return null; const s = J.sub;
    if (s === 'dig') { const w = WORMS.find(q => q.st === 1 && q.t > 0.2); return w ? [w.g.position.clone().add(V(0, 0.04, 0)), 'TAP THE WORM'] : null; }
    if (s === 'lurePick') { const l = J.lures.find(q => q.k === J.need.lure); return l ? [l.g.position.clone(), 'TAP THE ' + LURE[l.k].name] : null; }
    if ((s === 'thread' || s === 'wrap' || s === 'pull') && J.path && J.path.i < J.path.pts.length) return [J.path.pts[J.path.i].p, 'DRAG ALONG THE DOTS'];
    if (s === 'scoop') { const f = TFISH.find(q => !q.gone && !q.red); return f ? [f.p.clone(), 'DRAG THE NET TO A SILVER ONE'] : null; }
    if (s === 'weigh') return J.wOn && Math.abs(J.th - THETA(J.wf.kg)) <= DELTA ? [V(SCL.x, SCL.y, SCL.z - 0.06), 'TAP NOW'] : null;
    if (s === 'ice') { const H = J.held; if (H && H.tap) return [CH[H.f.k].clone(), 'TAP THE ' + (H.f.k === 'big' ? 'BIG' : 'SMALL') + ' CHEST']; const f = J.ice.find(q => !q.done); return f ? [f.g.position.clone(), 'DRAG IT TO THE ' + (f.k === 'big' ? 'BIG' : 'SMALL') + ' CHEST'] : null; }
    return null; };
  const hintTick = t => { const h = performance.now() - lastIn > 3000 ? hintTarget() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; } const p = h[0].clone().project(camera); if (p.z > 1) { HINT.style.display = 'none'; return; }
    const x = (p.x + 1) / 2 * innerWidth, y = (1 - p.y) / 2 * innerHeight, sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(x - 17) + 'px,' + Math.round(y - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- input routing ----------
  function press() { if (busy === 'job') jobPress(); else if (busy === 'fish') fishPress(); }
  function drag(dt) { if (busy === 'job') jobDrag(dt); }
  function release() { if (busy === 'job') jobRelease(); }
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 && P.x < X1 && P.z > Z0 - 0.3 && P.z < Z1 + 0.3 && (P.y || 0) < 2.5;
  const at = (P, s) => Math.hypot(P.x - s.x, P.z - s.z) < s.r, near = (P, t) => Math.hypot(P.x - t.obj.position.x, P.z - t.obj.position.z) < t.r;
  function prompt(P) { if (busy) return null; if (inShop(P)) { if (P.skate) return null; if (at(P, SPOT.job)) return 'NEXT CUSTOMER · THE BAIT JOB'; if (at(P, SPOT.shop)) return 'TACKLE COUNTER · BAIT + RODS'; if (at(P, SPOT.board)) return 'RECORD BOARD · FISH BOOK';
      if (at(P, SPOT.peg) && outfitOwned()) return 'GEAR PEG · HAT + VEST'; if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (near(P, rlT)) return 'TALK · REEL'; return null; }
    if (Math.abs(P.x + 21) > 300) return null; const f = canFish(P); return f ? (f.dock ? "FISH · REEL'S JETTY" : 'FISH · CAST A LINE') : null; }
  // s70: ONE box with choices (YES, PUT ME TO WORK! first · GOODBYE last)
  const HELLO = ["Hey hey HEY! Welcome to Reel's! Bait, tackle, ice and the record board. Want a job?", 'Back already? The yellow ring is free. Five jobs, one customer, go go go!', "A customer's waiting! Worms, lure, minnows, weigh, ice. You in?", 'Fish are biting today! Or are they? They are. Probably!'];
  const TIPS = ['Out the back door to my jetty. Tap the water, wait for the dip, hold to reel.', 'The Meru record catfish is eight point nine kilos. I measured it twice. Three times!', "Ripples on the water mean fish. Cast near the ripples. Don't tell anyone!",
    'Shiny lures pull the big ones. Golden bait pulls the rare ones.', "That tooth on the wall? Could be Nelly's. Could be a rock. It's Nelly's.", "Gus is the red minnow. He's not for sale. He's basically the manager.",
    "A bamboo rod lets you fish from ANY shore. Do a job and I'll set you up!", 'Beat a record and your name goes on the board. In permanent marker!'];
  let lastP = null; const goWork = P => { if (P) Object.assign(P, { x: SPOT.job.x, z: SPOT.job.z, sp: 0 }); startJob(); };
  const reelMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) goWork(lastP); } }, { text: 'THE TACKLE COUNTER', pick: () => { if (!busy) shopPanel(); } },
      ...(outfitOwned() ? [{ text: 'THE GEAR PEG', pick: () => { if (!busy) pegPanel(); } }] : []),
      { text: 'A FISHING TIP, PLEASE', pick: () => sayTo(rlT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(rlT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (busy === 'fish') { fishPress(); return true; } if (busy) return true;
    if (inShop(P) && !P.skate) {
      if (at(P, SPOT.job)) { startJob(); return true; } if (at(P, SPOT.shop)) { shopPanel(); return true; } if (at(P, SPOT.board)) { openBook(false); return true; }
      if (at(P, SPOT.peg) && outfitOwned()) { pegPanel(); return true; }
      if (K.atHiring(P)) { ding(); goWork(P); return true; }
      if (!near(P, rlT)) return false; pop(); reelMenu(!talked++); return true; }
    const f = canFish(P); if (f) { startFish(P, f); return true; } return false; }
  function quit() { if (busy === 'fish') { stopFish('STOPPED FISHING'); return; } if (busy === 'panel') { hidePick(); busy = null; return; } stop(); toast('JOB CANCELLED · GOLD KEPT', 2); }
  function useItem(id, P) { if (id === 'bambooRod' || id === 'steelRod') { if (busy) return true; const f = canFish(P); if (f) startFish(P, f); else toast('WALK TO THE LAKE SHORE OR A JETTY, THEN FISH', 2); return true; }
    if (id === 'shinyLure' || id === 'goldenBait') { if (busy === 'fish' && F && F.mode !== 'reel') { F.bait = id; save.setStat('baitPick', id); cardKey = ''; toast('BAIT · ' + BAITS[id], 1.4); } else { save.setStat('baitPick', id); toast(BAITS[id] + ' READY FOR YOUR NEXT CAST', 1.8); } return true; }
    if (id === 'luckyHook') { toast('LUCKY HOOK · MORE RARE BITES WHEN YOU FISH', 1.8); return true; } if (id === 'hullPearl') { toast("A HULL PEARL. NELLY'S GIFT. STRONGEST STUFF THERE IS.", 2); return true; } return false; }
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - CX, P.z - CZ); lastFox = fox; G.visible = d < (touch ? 45 : 90); OUT.visible = Math.hypot(P.x - CX, P.z - 236) < (touch ? 80 : 150); toastT -= dt; applyWear(fox);
    if (busy === 'job' && !inShop(P)) stop(); if (busy === 'fish') fishTick(dt, P); if (busy === 'panel' && !inShop(P) && !F) { hidePick(); busy = null; }
    if (!G.visible) return; lastP = P; if (busy === 'job' && J) jobTick(dt, fox); else tankTick(dt, false); hintTick(t);
    tideHand.rotation.z = -t * 0.05; LANT.forEach((m, i) => { m.material.color.setHSL(0.11, 1, 0.74 + 0.04 * Math.sin(t * 3 + i)); });
    const work = busy === 'job'; if (work) { const f0 = reel.userData.face0 ?? 0; reel.rotation.y += Math.atan2(Math.sin(f0 - reel.rotation.y), Math.cos(f0 - reel.rotation.y)) * Math.min(1, dt * 3); }
    K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: d, talking: work }); }
  drawBoard();
  const API = { group: G, outside: OUT, prompt, talk, tick, camFix, quit, busy: () => busy, toast: () => (toastT > 0 ? toastTxt : ''), spots: SPOT, job: () => J, fishing: () => F, startJob, startFish, canFish, reel, camera, save, useItem, records,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(0); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(0); }, dragTo(x, y, dt = 0.05) { ptr.down = true; ptr.x = x; ptr.y = y; drag(dt); }, release() { ptr.down = false; release(); }, hold(on) { ptr.down = !!on; },
    targets() { if (!J) { if (F && F.mode === 'ready') return RIP.map(r => scrW(r.p)); if (F && F.mode === 'bite') return [scrW(bob.position)]; return []; }
      if (J.path) return J.path.pts.slice(J.path.i).map(q => scrW(q.p)); const s = J.sub;
      if (s === 'dig') return WORMS.filter(w => w.st === 1).map(w => scrW(w.g.position.clone().add(V(0, 0.04, 0)))); if (s === 'lurePick') return [scrW(J.lures.find(q => q.k === J.need.lure).g.position)];
      if (s === 'scoop') return TFISH.filter(f => !f.gone && !f.red).map(f => scrW(f.p)); if (s === 'ice') { const f = J.ice.find(q => !q.done); return f ? [scrW(f.g.position), scrW(CH[f.k])] : []; } return []; },
    skipTo(s) { if (!J) startJob(); J.pause = 0; J.after = null; J.flies.length = 0; J.held = null; for (const w of WORMS) { w.st = 0; w.g.visible = false; } clearDots();
      if (s === 'tie') beginTie(); else if (s === 'scoop') beginScoop(); else if (s === 'weigh') { net.visible = false; beginWeigh(); } else if (s === 'ice') { net.visible = false; beginIce(); } else if (s === 'pay') beginPay(); },
    bite() { if (F && F.mode === 'wait') F.wait = 0.001; }, reelIn() { if (F && F.mode === 'reel') F.D = 1.0; }, nelly() { if (F) { F.fish = { nelly: true, id: 'nelly', kg: 0, L: 3 }; F.u.copy(F.dir); F.mode = 'reel'; F.D = 4; F.D0 = 18; } },
    nel: () => NEL, hiring: K, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__bait = API; return API;
}
