// MERU 2.0 — s76 MERU MARKET JOBS (Ben's picks): the Item Shop grocery [meruItemshop] gets a manager, 10 job games and a shine pass.
// Built in the grocery's ORIGINAL frame (worlds/meru2-grocery.js GROCERY: x -56..-11 × z 60..108, door N (-28, 60)); meru2-walk.js wraps it in
// RL.mark / collect (the TOWN_MOVES relocation carries it), ticks it with RL.frame P, camFix inside RL.camWrap. Screen maths go through toW().
// KEEPERS: KIA stays at her item counter (buy menu, meru-shops.js) · PLUM = new market manager (jobs, menu, BEST board).
// GAMES (gentle, no fail; stars by mistakes 0 = 3, ≤ 2 = 2): LIST HELPER (walk, cart, E to grab) · RESTOCK (drag carton to the aisle, tap the shelf) ·
// PRICE GUN (tap item, pick the card price) · CHECKOUT (scan on the line, bag heavy first, give change) · PRODUCE (hold to mist, tap the bad ones) ·
// CART ROUND-UP (walk the lot, carts snake behind you, back to the corral) · DELI (hold the slicer to the weight, bag the steaming buns) ·
// SPILL (sign first, rub to mop, customer walks round) · FREEZER (close open doors before they frost, tap to face the stock) · FLYER (drag to the flyer picture).
// PRIZES: 1st clear MARKET APRON (worn + Tailor wardrobe) · 3 different jobs STAFF DISCOUNT (20 % at Kia's, save mkDiscount) · all 10 GOLDEN CART + 60 gold.
// LOOK: glass storefront + striped awnings, MERU MARKET roof sign (bulbs at night), MARKET neon blade, fruit + flower stands, outdoor cart lot + corral,
// 2 checkout lanes (replace Kia's floor gondolas), deli counter, aisle number cubes, end-cap colour bands, pennants + SALE banners, produce misters, bakery steam.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { dueAt, rosterFoxes, workLabel } from './meru2-roster.js';   // s77: the browsers are the town's real foxes
import { funKit } from '../engine/vehicle-fun.js?v=s645';
export function buildMarket({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour, isMuted, M, toon, grad }) { const JW = jobWorker(THREE);
  const X0 = -56, X1 = -11, Z0 = 60, Z1 = 108;
  const G = new THREE.Group(); G.name = 'market'; scene.add(G);
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color(), clamp = (v, a, b) => Math.max(a, Math.min(b, v)), rnd = (a, b) => a + Math.random() * (b - a);
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const toW = v => { G.updateWorldMatrix(true, false); return G.localToWorld(v.clone()); };
  const mk = () => { const pos = [], nor = [], col = [];
    const put = (geo, x, y, z, hex, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) => { const g = geo.index ? geo.toNonIndexed() : geo.clone(); g.applyMatrix4(new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), V(sx, sy, sz)));
      const p = g.attributes.position, n = g.attributes.normal; cc.set(hex); for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } };
    const geo = () => { const g0 = new THREE.BufferGeometry(); g0.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g0.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g0.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g0.computeBoundingSphere(); return g0; };
    return { put, geo, n: () => pos.length, box: (w, h, d, hex, x, y, z, ry = 0, rx = 0, rz = 0) => put(new THREE.BoxGeometry(w, h, d), x, y, z, hex, ry, rx, rz),
      cyl: (r0, r1, h, hex, x, y, z, seg = 12, rx = 0, rz = 0) => put(new THREE.CylinderGeometry(r0, r1, h, seg), x, y, z, hex, 0, rx, rz),
      sph: (r, hex, x, y, z, sx = 1, sy = 1, sz = 1) => put(new THREE.SphereGeometry(r, 8, 6), x, y, z, hex, 0, 0, 0, sx, sy, sz) }; };
  const S = mk(), GLs = mk(), GLO = mk();
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.c = c; return t; };
  const fitTxt = (g, txt, x, y, maxW, fs, wt = 900) => { let f = fs; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; while (g.measureText(txt).width > maxW && f > 12) { f -= 2; g.font = wt + ' ' + f + 'px Archivo, sans-serif'; } g.fillText(txt, x, y); };
  const label = (txt, bg, fg, w = 256, h = 64, fs = 34) => CT(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 12, H / 2 + 2, W - 24, fs); });
  const plane = (map, w, h, x, y, z, ry = 0, ds = false) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map, side: ds ? THREE.DoubleSide : THREE.FrontSide })); m.position.set(x, y, z); m.rotation.y = ry; G.add(m); return m; };
  const LMc = {}; const LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const ringC = (x, z, r) => cols.push({ c: [x, z, r] }), rect = (a, b, c2, d) => cols.push({ f: [a, b, c2, d] });
  const INK = '#201e1d', RED = '#ec3013', YEL = '#ffd23a', WHITE = '#f3f2f2', GREEN = '#2f7a4a', LGREEN = '#5fb36a', BLUE = '#2f6fd6', STEEL = '#c9ced3', DARK = '#3d3b3a', WOOD = '#8a6440', SHELF = '#d8d2c8';
  // ================= products (one maker for every game) =================
  const PR = { ketchup: ['KETCHUP', 'cyl', '#c42d3c', WHITE, 0.09, 0.22], mustard: ['MUSTARD', 'cyl', '#f2c21b', WHITE, 0.09, 0.22], mayo: ['MAYO', 'cyl', '#f6f0dc', '#2e8bd8', 0.1, 0.2],
    pickle: ['PICKLES', 'cyl', '#5f8f3a', '#c9a227', 0.12, 0.18], beans: ['BEANS', 'cyl', '#e07a24', WHITE, 0.1, 0.14], chips: ['CHIPS', 'box', YEL, RED, 0.24, 0.32, 0.09],
    soda: ['SODA', 'cyl', '#5a2a1a', RED, 0.08, 0.16], oil: ['OIL', 'cyl', '#e0b030', '#16a34a', 0.1, 0.3], cereal: ['CEREAL', 'box', '#2e8bd8', WHITE, 0.22, 0.34, 0.08],
    flour: ['FLOUR', 'box', '#f6f0dc', '#2e8bd8', 0.26, 0.34, 0.14], buns: ['BUNS', 'box', '#d9a35a', WHITE, 0.3, 0.12, 0.22], fbuns: ['FRESH BUNS', 'box', '#d9a35a', WHITE, 0.3, 0.12, 0.22],
    milk: ['MILK', 'box', WHITE, '#2e8bd8', 0.12, 0.24, 0.12], cheese: ['CHEESE', 'box', '#f2c21b', '#c42d3c', 0.2, 0.09, 0.13], patty: ['PATTIES', 'box', '#b5473f', WHITE, 0.26, 0.06, 0.2],
    shake: ['SHAKES', 'cyl', '#f9a8d4', WHITE, 0.1, 0.18], fries: ['FRIES', 'box', RED, YEL, 0.22, 0.3, 0.08], cookies: ['COOKIES', 'box', '#7a4a24', YEL, 0.22, 0.1, 0.16],
    tomato: ['TOMATOES', 'ball', '#e0442a', '', 0.13], lettuce: ['LETTUCE', 'ball', '#4fae3a', '', 0.2], onion: ['ONIONS', 'ball', '#d9b46a', '', 0.12] };
  const pn = k => PR[k][0];
  function makeProd(k, s = 1) { const [, sh, c, c2, w, h, d] = PR[k], g = new THREE.Group(), add = (geo, col, y) => { const m = new THREE.Mesh(geo, LM(col)); m.position.y = y; g.add(m); return m; };
    if (sh === 'cyl') { add(new THREE.CylinderGeometry(w / 2, w / 2, h, 12), c, h / 2); add(new THREE.CylinderGeometry(w / 2 + 0.004, w / 2 + 0.004, h * 0.35, 12), c2, h * 0.5); add(new THREE.CylinderGeometry(w * 0.25, w * 0.3, h * 0.12, 8), c2, h + h * 0.06); }
    else if (sh === 'box') { add(new THREE.BoxGeometry(w, h, d), c, h / 2); add(new THREE.BoxGeometry(w * 1.02, h * 0.25, d * 1.02), c2, h * 0.62); }
    else { const m = add(new THREE.SphereGeometry(w / 2, 10, 8), c, w / 2); if (k === 'lettuce') m.scale.y = 0.8; }
    g.scale.setScalar(s); g.traverse(o => { o.renderOrder = 1; }); return g; }
  // ================= EXTERIOR (z < 60, the 5.5 m in front of the facade) =================
  const WINGS = [[-55.6, -38.6], [-17.6, -11.4]], winM = new THREE.MeshBasicMaterial({ color: '#a9c7cf' });
  for (const [a, b] of WINGS) { const w = b - a, xc = (a + b) / 2;
    GLs.box(w, 3.8, 0.04, '#9fd6ff', xc, 2.25, 59.86); { const m = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.2, 3.5), winM); m.position.set(xc, 2.25, 59.93); m.rotation.y = Math.PI; G.add(m); }
    S.box(w + 0.1, 0.32, 0.14, GREEN, xc, 0.16, 59.84); S.box(w + 0.1, 0.12, 0.14, INK, xc, 4.2, 59.84); S.box(w + 0.1, 0.1, 0.14, INK, xc, 0.36, 59.84);
    for (let x = a; x <= b + 0.01; x += w / Math.round(w / 1.7)) S.box(0.08, 3.9, 0.12, INK, x, 2.25, 59.84);
    // striped awning + valance
    const at = CT(256, 64, (g, W, H) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? WHITE : GREEN; g.fillRect(i * 16, 0, 16, H); } }); at.wrapS = THREE.RepeatWrapping; at.repeat.set(w / 4, 1);
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.4, 1.9), new THREE.MeshLambertMaterial({ map: at, side: THREE.DoubleSide })); aw.position.set(xc, 4.55, 59.05); aw.rotation.x = -Math.PI / 2 + 0.42; G.add(aw);
    const vt = CT(256, 32, (g, W, H) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? WHITE : GREEN; g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16 + 16, 0); g.lineTo(i * 16 + 16, H * 0.6); g.lineTo(i * 16 + 8, H); g.lineTo(i * 16, H * 0.6); g.fill(); } }); vt.wrapS = THREE.RepeatWrapping; vt.repeat.set(w / 4, 1);
    const vl = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.4, 0.32), new THREE.MeshLambertMaterial({ map: vt, transparent: true, side: THREE.DoubleSide, alphaTest: 0.3 })); vl.position.set(xc, 3.98, 58.18); G.add(vl);
    for (const x of [a + 0.2, b - 0.2]) S.box(0.05, 0.05, 1.9, INK, x, 4.15, 59.0); }
  // roof sign: MERU MARKET + bulbs (glow at night)
  const SIGN = { x: -28, y: 8.1, z: 59.7, w: 13.4, h: 1.9 };
  { const t = CT(1024, 146, (g, W, H) => { g.fillStyle = RED; g.fillRect(0, 0, W, H); g.fillStyle = INK; g.fillRect(0, H - 14, W, 14); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; fitTxt(g, 'MERU MARKET', 40, H / 2 - 4, W - 220, 104); g.fillStyle = YEL; g.font = '900 30px Archivo, sans-serif'; g.fillText('GROCERY', W - 170, 48); g.fillText('ITEMS', W - 170, 88); });
    plane(t, SIGN.w, SIGN.h, SIGN.x, SIGN.y, SIGN.z - 0.07, Math.PI); S.box(SIGN.w + 0.2, SIGN.h + 0.2, 0.12, INK, SIGN.x, SIGN.y, SIGN.z); for (const x of [-33, -23]) S.box(0.14, 1.4, 0.14, INK, x, 6.9, SIGN.z + 0.1); }
  const bulbs = []; for (let i = 0; i <= 26; i++) { const x = SIGN.x - SIGN.w / 2 + i * SIGN.w / 26; bulbs.push([x, SIGN.y + SIGN.h / 2 + 0.06, SIGN.z - 0.12], [x, SIGN.y - SIGN.h / 2 - 0.06, SIGN.z - 0.12]); }
  // MARKET neon blade (letters light one by one, then the whole word blinks)
  const NEON = CT(128, 640, () => {}), neonM = new THREE.MeshBasicMaterial({ map: NEON, side: THREE.DoubleSide });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 4.75), neonM); m.position.set(-38.9, 3.9, 59.05); m.rotation.y = Math.PI / 2; G.add(m); S.box(0.06, 0.06, 1.1, INK, -38.9, 6.35, 59.5); S.box(0.06, 0.06, 1.1, INK, -38.9, 1.55, 59.5); }
  let neonF = -1; function drawNeon(f, night) { if (f === neonF) return; neonF = f; const g = NEON.userData.c.getContext('2d'), W = 128, H = 640; g.fillStyle = INK; g.fillRect(0, 0, W, H); g.strokeStyle = YEL; g.lineWidth = 5; g.strokeRect(6, 6, W - 12, H - 12);
    const L = 'MARKET', on = f < 6 ? f + 1 : (f % 2 ? 6 : 0); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = '900 86px Archivo, sans-serif';
    for (let i = 0; i < 6; i++) { const lit = i < on; g.shadowColor = '#5cff9a'; g.shadowBlur = lit && night ? 24 : 0; g.fillStyle = lit ? '#7dffb0' : '#2c4a38'; g.fillText(L[i], W / 2, 60 + i * 100); } g.shadowBlur = 0; NEON.needsUpdate = true; }
  // fruit stand + flower stand (east wing front)
  { const x = -14.4, z = 57.8; S.box(2.6, 0.08, 1.2, WOOD, x, 0.85, z); for (const [a, b] of [[-1.2, -0.5], [1.2, -0.5], [-1.2, 0.5], [1.2, 0.5]]) S.box(0.07, 0.85, 0.07, '#5a3a22', x + a, 0.42, z + b);
    [['#e0442a', -0.85], [YEL, 0], ['#7ac142', 0.85]].forEach(([c, o]) => { S.box(0.8, 0.2, 0.9, '#b8955f', x + o, 1.0, z, 0, 0.3); for (let i = 0; i < (touch ? 7 : 14); i++) S.sph(0.075, c, x + o + rnd(-0.32, 0.32), 1.12 + rnd(0, 0.07), z + rnd(-0.3, 0.3)); });
    for (const a of [-1.3, 1.3]) S.box(0.05, 2.3, 0.05, INK, x + a, 1.15, z + 0.55); const at = CT(128, 32, (g, W, H) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? WHITE : RED; g.fillRect(i * 16, 0, 16, H); } });
    const aw = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 1.3), new THREE.MeshLambertMaterial({ map: at, side: THREE.DoubleSide })); aw.position.set(x, 2.3, z); aw.rotation.x = -Math.PI / 2 + 0.3; G.add(aw);
    plane(label('FRESH FRUIT', INK, YEL, 256, 64, 40), 1.0, 0.25, x, 0.55, z - 0.62, Math.PI); }
  { const x = -18.9, z = 58.1; S.box(1.6, 0.5, 0.9, '#3d2a1c', x, 0.25, z); for (let i = 0; i < 6; i++) { const bx = x - 0.6 + (i % 3) * 0.6, bz = z - 0.2 + (i < 3 ? 0 : 0.4); S.cyl(0.16, 0.13, 0.3, STEEL, bx, 0.65, bz, 10);
      const c = ['#f472b6', YEL, RED, '#a78bfa', WHITE, '#fb923c'][i]; for (let k = 0; k < 5; k++) { S.box(0.015, 0.4, 0.015, '#3f7a3a', bx + rnd(-0.06, 0.06), 0.95, bz + rnd(-0.06, 0.06)); S.sph(0.06, c, bx + rnd(-0.09, 0.09), 1.17 + rnd(0, 0.08), bz + rnd(-0.09, 0.09)); } }
    plane(label('FLOWERS', INK, '#f9a8d4', 256, 64, 40), 0.8, 0.2, x, 0.3, z - 0.47, Math.PI); rect(x - 0.85, x + 0.85, z - 0.5, z + 0.5); }
  rect(-15.8, -13.0, 57.1, 58.5);
  // OUTDOOR CART LOT (x -55..-39.6, z 54.8..59.4) + corral
  { const t = CT(512, 160, (g, W, H) => { g.fillStyle = '#4a4846'; g.fillRect(0, 0, W, H); g.fillStyle = '#f3f2f2'; for (let i = 0; i <= 8; i++) g.fillRect(i * 64 - 2, 0, 4, H * 0.55); g.fillStyle = YEL; g.fillRect(0, H - 8, W, 8); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(15.4, 4.6), new THREE.MeshLambertMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.set(-47.3, 0.035, 57.1); G.add(m); }
  const CORRAL = { x: -47.5, z: 57.2 };
  for (const z of [56.65, 57.75]) S.box(3.4, 0.05, 0.05, STEEL, CORRAL.x, 1.0, z); for (const x of [-49.2, -45.8]) for (const z of [56.65, 57.75]) S.box(0.06, 1.0, 0.06, STEEL, x, 0.5, z); S.box(0.06, 0.05, 1.1, STEEL, -49.2, 1.0, 57.2);
  plane(label('CART RETURN', GREEN, '#ffffff', 256, 64, 40), 1.2, 0.3, -49.25, 1.35, CORRAL.z, -Math.PI / 2, true); rect(-49.3, -45.7, 56.6, 56.7); rect(-49.3, -45.7, 57.7, 57.8); rect(-49.3, -49.1, 56.6, 57.8);
  // ================= INTERIOR: checkout lanes (replace Kia's floor gondolas) =================
  const LANES = [-34.6, -21.4], LZ0 = 62.6, LZ1 = 66.4, TOP = 0.93;
  const beltTex = CT(64, 64, (g, W, H) => { g.fillStyle = '#2a2826'; g.fillRect(0, 0, W, H); g.fillStyle = '#3d3b3a'; for (let i = 0; i < 4; i++) g.fillRect(0, i * 16, W, 6); }); beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(1, 8);
  LANES.forEach((lx, i) => { const zc = (LZ0 + LZ1) / 2, cs = i ? -1 : 1;   // cashier side faces the middle walkway
    S.box(0.9, 0.9, LZ1 - LZ0, INK, lx, 0.45, zc); S.box(0.92, 0.04, LZ1 - LZ0 + 0.02, WHITE, lx, 0.91, zc); S.box(0.03, 0.36, LZ1 - LZ0, GREEN, lx - cs * 0.465, 0.62, zc);
    { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 2.0), new THREE.MeshLambertMaterial({ map: beltTex })); m.rotation.x = -Math.PI / 2; m.position.set(lx, TOP + 0.006, 65.2); G.add(m); }
    S.box(0.6, 0.02, 0.04, RED, lx, TOP + 0.01, 64.2); S.box(0.04, 0.4, 0.06, DARK, lx + cs * 0.33, TOP + 0.2, 64.2); S.box(0.04, 0.04, 0.7, DARK, lx, TOP + 0.42, 64.2, Math.PI / 2);
    S.box(0.36, 0.2, 0.3, DARK, lx + cs * 0.28, 1.04, 62.95); S.box(0.3, 0.14, 0.04, INK, lx + cs * 0.28, 1.22, 63.05, 0, 0.4); GLO.box(0.26, 0.1, 0.01, '#7cffd0', lx + cs * 0.28, 1.22, 63.075, 0, 0.4);
    S.box(0.08, 2.6, 0.08, DARK, lx + cs * 0.4, 1.3, LZ0 + 0.05); S.box(0.5, 0.5, 0.5, INK, lx + cs * 0.4, 2.85, LZ0 + 0.05);
    const t = CT(128, 128, (g, W) => { g.fillStyle = i ? '#9fd05a' : LGREEN; g.fillRect(6, 6, W - 12, W - 12); g.fillStyle = INK; g.font = '900 96px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(String(i + 1), 34, 70); });
    for (const ry of [0, Math.PI, Math.PI / 2, -Math.PI / 2]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.46), new THREE.MeshBasicMaterial({ map: t })); m.position.set(lx + cs * 0.4 + Math.sin(ry) * 0.26, 2.85, LZ0 + 0.05 + Math.cos(ry) * 0.26); m.rotation.y = ry; G.add(m); }
    S.box(0.4, 1.1, 0.5, DARK, lx - cs * 0.75, 0.55, LZ0 + 0.3); for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) S.box(0.06, 0.2, 0.12, [RED, YEL, BLUE, '#f472b6'][(a + b) % 4], lx - cs * 0.52, 0.35 + a * 0.3, LZ0 + 0.15 + b * 0.15);
    rect(lx - 0.47, lx + 0.47, LZ0, LZ1); rect(lx - cs * 0.75 - 0.22, lx - cs * 0.75 + 0.22, LZ0 + 0.05, LZ0 + 0.55); });
  // ================= DELI counter (east wing) =================
  const DX = -16.2, DZ = 63.0;
  S.box(0.9, 0.95, 2.8, WHITE, DX, 0.475, DZ); S.box(0.94, 0.05, 2.84, STEEL, DX, 0.97, DZ); GLs.box(0.04, 0.45, 2.7, '#cfe9ff', DX - 0.46, 1.2, DZ, 0, 0, -0.25);
  for (let i = 0; i < 6; i++) S.box(0.35, 0.08, 0.32, ['#e79aa0', '#f2c21b', '#b5473f', '#f6e6c8', '#e79aa0', '#f2c21b'][i], DX - 0.1, 0.84, DZ - 1.1 + i * 0.44);
  S.box(0.3, 0.26, 0.36, STEEL, DX, 1.12, 62.2); S.box(0.06, 0.3, 0.06, DARK, DX + 0.12, 1.3, 62.2);
  const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 20), LM('#e8ecef')); blade.rotation.z = Math.PI / 2; blade.position.set(DX - 0.02, 1.2, 62.42); G.add(blade);
  S.box(0.34, 0.06, 0.34, WHITE, DX, 1.02, 63.65); S.box(0.2, 0.18, 0.04, INK, DX + 0.12, 1.12, 63.83);
  const scaleTex = CT(128, 48, () => {}), scaleDisp = plane(scaleTex, 0.18, 0.07, DX + 0.12, 1.14, 63.805, 0); scaleDisp.rotation.y = -Math.PI / 2; scaleDisp.position.x = DX - 0.07; scaleDisp.position.z = 63.83;
  const scaleShow = txt => { const g = scaleTex.userData.c.getContext('2d'); g.fillStyle = '#0f2a1a'; g.fillRect(0, 0, 128, 48); g.fillStyle = '#7cffb0'; g.font = '900 32px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(txt, 10, 26); scaleTex.needsUpdate = true; }; scaleShow('0 G');
  { const t = label('DELI', RED, '#ffffff', 256, 96, 70); for (const ry of [Math.PI / 2, -Math.PI / 2]) plane(t, 1.4, 0.5, DX + (ry > 0 ? 0.02 : -0.02), 3.2, DZ, ry); S.box(0.01, 0.9, 0.01, INK, DX, 3.85, DZ - 0.5); S.box(0.01, 0.9, 0.01, INK, DX, 3.85, DZ + 0.5); }
  rect(DX - 0.5, DX + 0.5, DZ - 1.45, DZ + 1.45);
  // ================= cross aisle: restock pallet, end-cap ledges (aisles 1-3), SALE end-cap (flyer), number cubes, colour bands, pennants =================
  const AIS = [[-52, 'BUNS + BREAD', '#d9a35a'], [-45.5, 'SAUCES', '#c42d3c'], [-39, 'PICKLES + CANS', '#5f8f3a'], [-32.5, 'SNACKS', YEL], [-26, 'SODA', '#7a3a1a'], [-19.5, 'BAKING + OIL', '#e0b030'], [-13.2, 'BREAKFAST', '#2e8bd8']];
  const PAL = V(-48.75, 0, 77.6); S.box(1.2, 0.14, 1.0, '#b8955f', PAL.x, 0.07, PAL.z); for (const o of [-0.45, 0, 0.45]) S.box(0.1, 0.04, 1.0, '#7a5a3a', PAL.x + o, 0.16, PAL.z); rect(PAL.x - 0.62, PAL.x + 0.62, PAL.z - 0.52, PAL.z + 0.52);
  const LEDGE_Y = [0.4, 1.0, 1.6], SHN = ['BOTTOM', 'MIDDLE', 'TOP'];
  for (const [gx] of AIS.slice(0, 3)) { for (const y of LEDGE_Y) { S.box(1.02, 0.04, 0.24, SHELF, gx, y, 79.33); S.box(1.02, 0.05, 0.02, WHITE, gx, y + 0.01, 79.21); } rect(gx - 0.55, gx + 0.55, 79.2, 79.45); }
  AIS.forEach(([gx, , c], i) => { S.box(1.12, 0.32, 0.03, c, gx, 1.95, 79.44);
    const t = CT(128, 128, (g, W) => { g.fillStyle = c; g.fillRect(0, 0, W, W); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, W - 10); g.fillStyle = c === YEL || c === '#e0b030' || c === '#d9a35a' ? INK : '#ffffff'; g.font = '900 92px Archivo, sans-serif'; g.textBaseline = 'middle'; g.textAlign = 'center'; g.fillText(String(i + 1), W / 2, W / 2 + 6); });
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), new THREE.MeshBasicMaterial({ map: t })); cube.position.set(gx, 4.7, 79.2); G.add(cube); S.box(0.02, 1.2, 0.02, INK, gx, 5.7, 79.2); });
  const FX = -26, FZ = 78.95, FSY = [0.42, 0.97, 1.52], FSX = [-0.55, 0, 0.55];
  S.box(1.9, 0.08, 0.55, INK, FX, 0.04, FZ); for (const s of [-1, 1]) S.box(0.06, 2.0, 0.55, INK, FX + s * 0.92, 1.0, FZ); S.box(1.9, 2.0, 0.04, '#f6e6c8', FX, 1.0, FZ + 0.26);
  for (const y of FSY) S.box(1.8, 0.04, 0.5, WHITE, FX, y - 0.02, FZ); plane(label('SALE', RED, '#ffffff', 256, 96, 80), 1.9, 0.5, FX, 2.3, FZ - 0.28, Math.PI); rect(FX - 0.96, FX + 0.96, FZ - 0.3, FZ + 0.3);
  const DOL = V(-27.45, 0.3, 78.3); S.box(0.95, 0.06, 0.8, DARK, DOL.x, 0.24, DOL.z); for (const [a, b] of [[-0.4, -0.32], [0.4, -0.32], [-0.4, 0.32], [0.4, 0.32]]) S.cyl(0.06, 0.06, 0.05, INK, DOL.x + a, 0.06, DOL.z + b, 10, Math.PI / 2); rect(DOL.x - 0.5, DOL.x + 0.5, DOL.z - 0.42, DOL.z + 0.42);
  { const N = 34, x0 = -55.2, x1 = -12.2; for (let i = 0; i < N; i++) { const x = x0 + (i + 0.5) * (x1 - x0) / N, k = (x - x0) / (x1 - x0), y = 4.25 - Math.sin(k * Math.PI) * 0.5, sh = new THREE.Shape(); sh.moveTo(-0.22, 0); sh.lineTo(0.22, 0); sh.lineTo(0, -0.42); sh.closePath();
      S.put(new THREE.ShapeGeometry(sh), x, y, 77.6, [RED, YEL, LGREEN, BLUE, WHITE][i % 5], 0); S.put(new THREE.ShapeGeometry(sh), x, y, 77.61, [RED, YEL, LGREEN, BLUE, WHITE][i % 5], Math.PI); } }
  { const t = CT(512, 128, (g, W, H) => { g.fillStyle = RED; g.fillRect(0, 0, W, H); g.fillStyle = YEL; g.fillRect(0, H - 14, W, 14); g.fillStyle = '#ffffff'; g.textBaseline = 'middle'; fitTxt(g, 'SALE · THIS WEEK', 22, H / 2 - 4, W - 44, 64); });
    plane(t, 4.2, 1.05, X0 + 0.42, 3.6, 92, Math.PI / 2); plane(t, 4.2, 1.05, X1 - 0.42, 3.6, 88, -Math.PI / 2); }
  // produce misters (pipes) + job rings
  for (const x of [-54.4, -48, -42.4]) { S.box(0.05, 0.05, 9.5, STEEL, x, 2.45, 72); for (let i = 0; i < 6; i++) S.cyl(0.03, 0.02, 0.07, DARK, x, 2.4, 68.3 + i * 1.5, 6); }
  const RINGS = { list: [-40.4, 64.6], restock: [-48.75, 76.4], price: [-35.6, 86.0], checkout: [-33.55, 64.45], produce: [-51.2, 70.0], carts: [-44.4, 57.2], deli: [-14.4, 63.0], spill: [-42.25, 83.6], freezer: [-35.1, 104.2], flyer: [-27.7, 77.0] };
  for (const [x, z] of Object.values(RINGS)) { S.cyl(0.5, 0.5, 0.012, YEL, x, 0.085, z, 22); S.cyl(0.42, 0.42, 0.014, INK, x, 0.087, z, 22); }
  // ---------- merge ----------
  G.add(new THREE.Mesh(S.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  G.add(new THREE.Mesh(GLs.geo(), new THREE.MeshPhongMaterial({ vertexColors: true, transparent: true, opacity: 0.42, shininess: 90, depthWrite: false })));
  G.add(new THREE.Mesh(GLO.geo(), new THREE.MeshBasicMaterial({ vertexColors: true })));
  // ---------- particles: sign bulbs, bakery steam, produce mist ----------
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.45, 'rgba(255,255,255,0.35)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const pts = (n, size, color, op, blend = true) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ map: glowT, size, color, transparent: true, opacity: op, depthWrite: false, blending: blend ? THREE.AdditiveBlending : THREE.NormalBlending })); p.frustumCulled = false; G.add(p); return p; };
  const BULB = pts(bulbs.length, 0.55, '#ffd27a', 0.95); BULB.geometry.attributes.position.array.set(bulbs.flat()); BULB.visible = false;
  const STN = touch ? 24 : 48, STEAM = pts(STN, 0.5, '#ffffff', 0.32, false), steamD = [...Array(STN)].map((_, i) => [[-12.2, 64], [-12.2, 67.4], [DX, 62.4]][i % 3].concat(rnd(0, 3)));
  const MSN = touch ? 30 : 60, MIST = pts(MSN, 0.35, '#dff3ff', 0.55, false), mistD = [...Array(MSN)].map(() => [0, 0, 0, 9]);
  let mistT = 0, mistAt = null; const mistEmit = (x, z, y0 = 2.35, k = 1) => { for (const d of mistD) if (d[3] > 1 && Math.random() < 0.25 * k) { d[0] = x + rnd(-0.4, 0.4); d[1] = y0; d[2] = z + rnd(-0.5, 0.5); d[3] = 0; } };
  // ================= PLUM (market manager) + Kit =================
  const plum = kit.makeFox({ key: 'mgrPlum', torso: [GREEN, WHITE, INK], outfit: 'vest', mood: 'happy', look: { fur: '#b8743a', furDark: '#8a5226', muzzle: '#f6e6d2' } }); plum.scale.multiply(V(1.08, 1.0, 1.08));
  { const P = plum.userData && plum.userData.P; if (P && P.arms && P.arms[0]) { const cb = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.3, 0.22), LM('#8a6440')); cb.add(b); const pp = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.24, 0.18), LM('#ffffff')); pp.position.x = 0.004; cb.add(pp); cb.position.set(0.04, -0.42, 0.12); cb.traverse(o => { o.renderOrder = 2; }); P.arms[0].add(cb); }
    if (P && P.head) { const cap = new THREE.Group(); const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 14), LM(GREEN)); c1.position.set(0, 0.32, 0); cap.add(c1); const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.18), LM(GREEN)); c2.position.set(0, 0.27, 0.2); cap.add(c2); cap.traverse(o => { o.renderOrder = 2; }); P.head.add(cap); } }
  const PLUM0 = [-24.6, 66.6, Math.PI]; plum.position.set(PLUM0[0], 0, PLUM0[1]); plum.rotation.y = PLUM0[2]; G.add(plum); ringC(PLUM0[0], PLUM0[1], 0.5);
  const pmT = { key: 'mgrPlum', name: 'Plum', role: 'MARKET MANAGER', obj: plum, ry: PLUM0[2], r: 2.3 }, endT = { key: 'mgrPlumEnd', name: 'Plum', role: 'MARKET MANAGER', obj: plum, ry: PLUM0[2], r: 60 };
  const ln = text => ({ who: 'plum', role: 'MARKET MANAGER', text });
  const GAMES = [{ k: 'list', name: 'Shopping List', color: RED, gold: 30 }, { k: 'restock', name: 'Restock', color: '#c42d3c', gold: 26 }, { k: 'price', name: 'Price Gun', color: YEL, gold: 22 }, { k: 'checkout', name: 'Checkout', color: GREEN, gold: 26 },
    { k: 'produce', name: 'Produce', color: LGREEN, gold: 22 }, { k: 'carts', name: 'Cart Round-up', color: STEEL, gold: 26 }, { k: 'deli', name: 'Deli + Bakery', color: '#e79aa0', gold: 24 }, { k: 'spill', name: 'Spill on 3', color: '#9fd05a', gold: 20 },
    { k: 'freezer', name: 'Freezer Front', color: '#7fd3ff', gold: 24 }, { k: 'flyer', name: 'Weekly Flyer', color: RED, gold: 24 }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const rFox = rosterFoxes({ THREE, kit, cap: 6 }); let endClear = 0;
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'mk', color: GREEN, boardTitle: "Plum's best", toWorld: toW,
    room: { X0, X1, Z0, Z1 }, door: [-28, 60.6], keeper: plum, keeperRy: PLUM0[2], games: GAMES, board: { x: -24.4, y: 3.15, z: 60.1, ry: 0, w: 1.45 }, hiring: { x: -30.9, z: 61.0, ry: 0 }, hiringLine: '10 JOBS · ASK PLUM',
    sun: [{ x: -28, z: 61.6, w: 2.4, d: 2.2 }, { x: -46.5, z: 61.8, w: 9, d: 2.4 }, { x: -14.6, z: 61.6, w: 4, d: 1.8 }], lamps: [-52, -39, -26, -13.2].flatMap(x => [[x, 5.5, 82], [x, 5.5, 96]]).concat([[-28, 6.4, 64], [-28, 6.4, 71]]),
    browse: [[-28, 68.6, 0], [-25.6, 68.5, 0], [-31.2, 68.5, 0], [-36.6, 71.0, 0], [-20.6, 69.6, 0]], slots: 3, visitors: h => dueAt('market', h), visitorFox: r => rFox(r, G),
    onVisit: (e, inside) => { if (inside && !busy) toast(e.r.name.toUpperCase() + ' \u00b7 ' + (e.kind === 'through' ? e.r.role.toUpperCase() + ' ON THE BEAT' : workLabel(e.r) + ' \u00b7 ' + e.why), 2.2); }, looks: [['#e07a24', '#fff1e0', '#7a3a10'], ['#7c4dc4', '#ede4fb', '#3d2563']], clock: { x: -32.2, y: 3.5, z: 60.09, ry: 0 } });
  const CUST = [{ name: 'OTTO', forW: 'Lakeside doorman', torso: ['#2f5d2a', '#e6b45a', '#1a3318'] }, { name: 'MARLA', forW: 'Arena market', torso: ['#f472b6', '#fce7f3', '#9d174d'] },
    { name: 'PELL', forW: 'Crestview doorman', torso: ['#1f2937', '#e6b45a', '#111827'] }, { name: 'FLICK', forW: 'Skate Park', torso: ['#ffd23a', '#201e1d', '#a16207'] },
    { name: 'THE FISHERMAN', forW: 'Lake jetty', torso: ['#0e7fb8', '#e0f2fe', '#0b3a52'] }, { name: 'MICHAEL JAY', forW: 'Burgers', torso: [RED, '#f3f2f2', '#7a1808'] }];
  const cfox = {}; const custFox = i => { if (cfox[i]) return cfox[i]; const f = kit.makeFox({ key: 'mkCust' + i, torso: CUST[i].torso, outfit: 'vest', mood: 'happy' }); f.visible = false; G.add(f); cfox[i] = f; return f; };
  const FK = funKit({ THREE, M, toon, grad, scene });
  const mkCart = () => { const c = FK.make('cart'); const CV = c.userData.V; if (CV && CV.cargo) CV.cargo.forEach(m => { m.visible = false; }); G.add(c); return c; };
  for (let i = 0; i < 3; i++) { const c = mkCart(); c.position.set(-48.5 + i * 0.5, 0, CORRAL.z); c.rotation.y = -Math.PI / 2; }
  const LOOSE = [[-53.6, 55.6, 0.4], [-41.4, 55.5, -1.2], [-51.2, 58.6, 2.0], [-37.4, 57.6, -2.4], [-16.4, 56.0, 1.1]];
  const loose = LOOSE.map(([x, z, ry], i) => { const c = mkCart(); c.position.set(x, 0, z); c.rotation.y = ry; c.visible = i < 2; return c; });
  // ================= state, sound, UI =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), beep = () => tone(1800, 0.06, 0.12, 'square'), nope = () => tone(196, 0.05, 0.25, 'square'), coin = (at = 0) => { tone(2400, 0.04, 0.15, 'triangle', at); tone(3200, 0.03, 0.12, 'triangle', at + 0.03); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#2f7a4a;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, walk) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (walk ? 'PLUM · STOP' : (touch ? '3' : 'SPACE') + ' · STOP') + '</span></div>';
  const meter = (f, c, band) => '<div style="position:relative;height:14px;background:#cfcac3;border:2px solid #201e1d;margin:4px 0 2px">' + (band ? '<div style="position:absolute;left:' + band[0] * 100 + '%;width:' + (band[1] - band[0]) * 100 + '%;top:0;bottom:0;background:#ffd23a"></div>' : '') + '<div style="position:absolute;left:0;top:' + (band ? 4 : 0) + 'px;bottom:' + (band ? 4 : 0) + 'px;width:' + (clamp(f, 0, 1) * 100).toFixed(1) + '%;background:' + c + '"></div></div>';
  const lst = items => innerHeight < 720 ? '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px">' + items.map(([sw, t, r, ok]) => '<span style="display:flex;align-items:center;gap:4px;padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (ok ? '#201e1d' : '#f3f2f2') + ';color:' + (ok ? '#ffffff' : '#201e1d') + '"><span style="width:8px;height:8px;background:' + sw + ';border:1px solid #201e1d"></span>' + t + (r ? ' · ' + r : '') + '</span>').join('') + '</div>' : items.map(a => row(...a)).join('');
  const lab = t => '<div style="font-size:12px;font-weight:900;margin-top:4px">' + t + '</div>';
  const setCard = (key, html) => { if (key === cardKey) return; cardKey = key; card.innerHTML = html; card.style.display = 'block'; };
  const hideCard = () => { card.style.display = 'none'; cardKey = ''; };
  const btnCss = (primary, on) => 'display:flex;align-items:center;justify-content:flex-start;gap:8px;width:100%;min-height:48px;padding:0 12px;margin-top:6px;border:2px solid #201e1d;border-radius:0;font:900 14px Archivo,sans-serif;text-align:left;cursor:pointer;background:' + (primary ? '#ec3013' : on ? '#201e1d' : '#f3f2f2') + ';color:' + (primary || on ? '#ffffff' : '#201e1d');
  let pickKey = ''; const showPick = (key, title, right, html, opts, grid) => { if (key === pickKey) return; pickKey = key; pick.innerHTML = head(title, right) + '<div style="padding:8px 10px 10px">' + (html || '') + '</div>'; const body = pick.lastChild;
    const wrap = document.createElement('div'); wrap.style.cssText = grid ? 'display:grid;grid-template-columns:repeat(' + grid + ',minmax(0,1fr));gap:6px' : ''; body.appendChild(wrap);
    opts.forEach(o => { const b = document.createElement('button'); b.type = 'button'; b.style.cssText = btnCss(o.primary, o.on) + (grid ? ';margin-top:0' : ''); b.innerHTML = '<span style="flex:1;min-width:0;white-space:normal">' + o.label + '</span>';
      b.addEventListener('click', e => { e.stopPropagation(); o.go(); }); b.addEventListener('pointerdown', e => e.stopPropagation()); wrap.appendChild(b); }); pick.style.display = 'block'; };
  const hidePick = () => { pick.style.display = 'none'; pick.innerHTML = ''; pickKey = ''; };
  // ---------- input ----------
  const ptr = { down: false, x: 0, y: 0, id: null };
  const blocked = e => { const t = e.target; if (t && t.closest && (t.closest('button,a,input,[role="button"],[aria-label]') || pick.contains(t))) return true; if (touch && ((e.clientX > innerWidth - 180 && e.clientY > innerHeight - 240) || e.clientY > innerHeight - 70)) return true; return false; };
  const jobOn = () => busy === 'job' && J && !GN[J.g].walk;
  addEventListener('pointerdown', e => { if (!jobOn() || blocked(e)) return; ptr.down = true; ptr.id = e.pointerId; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); press(); drag(); }, true);
  addEventListener('pointermove', e => { if (!jobOn() || !ptr.down || e.pointerId !== ptr.id) return; ptr.x = e.clientX; ptr.y = e.clientY; e.stopPropagation(); drag(); }, true);
  const up = e => { if (e.pointerId === ptr.id) { ptr.down = false; ptr.id = null; release(); } }; addEventListener('pointerup', up, true); addEventListener('pointercancel', up, true);
  const tmp = V(), RAD = () => (touch ? 44 : 26) * Math.max(1, Math.min(innerWidth, innerHeight) / 700);
  const scrW = v => { tmp.copy(toW(v)).project(camera); return [(tmp.x + 1) / 2 * innerWidth, (1 - tmp.y) / 2 * innerHeight, tmp.z]; };
  const dist = s => Math.hypot(s[0] - ptr.x, s[1] - ptr.y);
  const rc = new THREE.Raycaster(), ndc = new THREE.Vector2(), hitP = V(), inv = new THREE.Matrix4();
  const ray = () => { ndc.set(ptr.x / innerWidth * 2 - 1, -(ptr.y / innerHeight) * 2 + 1); rc.setFromCamera(ndc, camera); G.updateWorldMatrix(true, false); inv.copy(G.matrixWorld).invert(); return rc.ray.clone().applyMatrix4(inv); };
  const hitZ = z => ray().intersectPlane(new THREE.Plane(V(0, 0, 1), -z), hitP) ? hitP.clone() : null;
  const hitY = y => ray().intersectPlane(new THREE.Plane(V(0, 1, 0), -y), hitP) ? hitP.clone() : null;
  const nearestOf = (list, posOf, k = 1.6) => { let best = null, bd = RAD() * k; for (const o of list) { const d = dist(scrW(posOf(o))); if (d < bd) { bd = d; best = o; } } return best; };
  function fly(obj, to, dur, arc, then) { J.flies.push({ obj, from: obj.position.clone(), to: to.clone(), t: 0, dur, arc, then }); }
  function flyTick(dt) { for (const F of J.flies.slice()) { F.t += dt / F.dur; const k = Math.min(1, F.t), e = k * k * (3 - 2 * k); F.obj.position.lerpVectors(F.from, F.to, e); F.obj.position.y += Math.sin(k * Math.PI) * F.arc; if (k >= 1) { J.flies.splice(J.flies.indexOf(F), 1); F.then && F.then(); } } }
  const own = o => { J.objs.push(o); G.add(o); return o; };
  const tagTex = {}; const tagFor = (txt, bg, fg) => tagTex[txt + bg] || (tagTex[txt + bg] = CT(256, 72, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(4, 4, W - 8, H - 8); g.fillStyle = fg; g.textBaseline = 'middle'; fitTxt(g, txt, 16, H / 2 + 2, W - 32, 40); }));
  const tagSprite = (txt, bg = '#ffffff', fg = INK, s = 0.42, top = true) => { if (touch) s *= 1.25; const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tagFor(txt, bg, fg), depthTest: !top })); sp.scale.set(s, s * 0.28, 1); sp.renderOrder = 6; return sp; };
  const addGold = n => { n = Math.max(0, Math.round(n)); J.gold += n; save.addGold(n); return n; };
  const miss = (t, s = 1.8) => { J.miss++; nope(); toast(t, s); };
  const NEXT = (sub, after, t = 1.0) => { J.sub = sub; J.pause = t; J.after = after; };
  const arrowM = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.6, 4), new THREE.MeshBasicMaterial({ color: RED })); arrowM.rotation.x = Math.PI; arrowM.visible = false; arrowM.renderOrder = 5; G.add(arrowM);
  const beacon = new THREE.Mesh(new THREE.RingGeometry(0.55, 0.75, 24), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.8, depthWrite: false })); beacon.rotation.x = -Math.PI / 2; beacon.visible = false; G.add(beacon);
  // ================= prizes + apron =================
  const APRON = { outfit: 'vest', torso: [GREEN, WHITE, INK], name: 'MARKET APRON' };
  const apronOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === APRON.name); };
  const done = () => save.stat('mkDone', null) || {};
  function giveGift() { save.setStat('mkClears', save.stat('mkClears', 0) + 1); const d = done(), nd = GAMES.filter(q => d[q.k]).length;
    if (!save.stat('mkApron', false)) { save.setStat('mkApron', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === APRON.name)) save.setStat('tailorOutfits', [...list, APRON]);
      save.setStat('mkPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(APRON); wear && wear(APRON); return 'apron'; }
    if (nd >= 3 && !save.stat('mkDiscount', false)) { save.setStat('mkDiscount', true); return 'discount'; }
    if (nd >= GAMES.length && !save.stat('mkCart', false)) { save.setStat('mkCart', true); save.give('goldenCart'); save.addGold(60); return 'cart'; } return null; }
  let worn = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const on = apronOn();
    if (worn && worn.on === on && worn.fox === fox && (!worn.m || worn.m.parent === P.body)) return; if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, fox, m: null }; if (!on) return;
    const t = CT(64, 96, (g, w, h) => { g.fillStyle = WHITE; g.fillRect(0, 0, w, h); g.fillStyle = GREEN; g.fillRect(0, 0, w, 10); g.fillRect(14, 40, 36, 22); g.fillStyle = '#ffffff'; g.font = '900 9px Archivo, sans-serif'; g.fillText('MERU', 20, 54); });
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.02), new THREE.MeshLambertMaterial({ map: t })); m.position.set(0, 0.92, 0.38); m.rotation.x = -0.06; m.renderOrder = 2; P.body.add(m); worn.m = m; }
  // ================= GAME 1: SHOPPING LIST HELPER (walk with the cart, E to grab) =================
  const GRAB = [['buns', 'AISLE 1', -51.45, 1.0, 85], ['ketchup', 'AISLE 2', -44.95, 1.0, 82.5], ['mustard', 'AISLE 2', -44.95, 1.0, 86.5], ['mayo', 'AISLE 2', -44.95, 1.0, 90.5], ['pickle', 'AISLE 3', -39.55, 1.0, 84],
    ['beans', 'AISLE 3', -38.45, 1.0, 89], ['chips', 'AISLE 4', -31.95, 1.0, 84], ['soda', 'AISLE 5', -26.55, 1.0, 86], ['oil', 'AISLE 6', -18.95, 1.0, 84], ['cereal', 'AISLE 7', -13.75, 1.0, 86],
    ['milk', 'DAIRY', -35.1, 1.2, 106.5], ['cheese', 'CHEESE', -46.5, 1.2, 106.5], ['patty', 'MEAT', -52.6, 1.2, 106.5], ['shake', 'DESSERTS', -28.3, 1.2, 106.5], ['fries', 'FREEZER', -34, 0.95, 99.2],
    ['tomato', 'PRODUCE', -53.5, 1.1, 67.2], ['lettuce', 'PRODUCE', -47.1, 1.1, 69.0], ['onion', 'PRODUCE', -41.5, 1.1, 74.0], ['fbuns', 'BAKERY', -12.7, 1.2, 67.4]].map(([k, w, x, y, z]) => ({ k, where: w, x, y, z }));
  const LISTC = V(-36.3, 0, 66.9), gro = () => window.__m2grocery;
  const nearGrab = P => { let b = null, bd = 1.9; for (const s of GRAB) { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < bd) { bd = d; b = s; } } return b; };
  const G1 = { walk: true,
    begin(P) { const C = J.C, f = custFox(J.ci); f.visible = true; f.position.copy(LISTC); f.rotation.y = Math.PI * 0.75; J.cf = f;
      const pool = shuffle(GRAB.slice()); J.list = pool.slice(0, 5).map(s => ({ s, got: false })); J.tags = GRAB.map(s => { const t = own(tagSprite(pn(s.k), '#ffffff', INK, 0.5, false)); t.position.set(s.x, s.y + 0.75, s.z); return t; });
      const g0 = gro(); if (g0 && g0.state && !g0.state().pushing && g0.cart && Math.hypot(g0.cart.position.x - P.x, g0.cart.position.z - P.z) < 6) g0.spot.use(P);
      toast(C.name + ' NEEDS 5 THINGS · WALK THE AISLES · E TO GRAB', 2.6); },
    goal() { const rest = J.list.filter(q => !q.got); if (!rest.length) return [LISTC.x, LISTC.z]; const P = J.P; let b = rest[0].s, bd = 1e9; for (const q of rest) { const d = Math.hypot(P.x - q.s.x, P.z - q.s.z); if (d < bd) { bd = d; b = q.s; } } return [b.x, b.z, b.y]; },
    prompt(P) { if (J.list.every(q => q.got)) return Math.hypot(P.x - LISTC.x, P.z - LISTC.z) < 2.2 ? 'HAND OVER · ' + J.C.name : null; const s = nearGrab(P); return s ? 'GRAB · ' + pn(s.k) : null; },
    talk(P) { if (J.list.every(q => q.got)) { if (Math.hypot(P.x - LISTC.x, P.z - LISTC.z) < 2.2) { coin(); coin(0.15); addGold(8 * J.list.length); finishGame(); return true; } return false; }
      const s = nearGrab(P); if (!s) return false; const q = J.list.find(l => l.s === s && !l.got); if (!q) { if (!J.list.some(l => l.s === s)) miss('PLUM: "' + pn(s.k) + ' IS NOT ON THE LIST. CHECK THE CARD."'); else toast('GOT THAT ONE ALREADY', 1.2); return true; }
      q.got = true; pop(); const g0 = gro(), m = makeProd(s.k, 1.5); if (g0 && g0.state && g0.state().pushing && g0.cart) { const i = J.list.filter(l => l.got).length - 1; m.position.set(-0.2 + (i % 3) * 0.2, 0.75, -0.15 + (i > 2 ? 0.25 : 0)); g0.cart.add(m); J.inCart = (J.inCart || []).concat(m); } else { m.position.set(s.x, s.y, s.z); own(m); fly(m, V(P.x, 1.2, P.z), 0.4, 0.3, () => { m.visible = false; }); }
      toast(J.list.every(l => l.got) ? 'ALL 5 · TAKE THEM TO ' + J.C.name + ' BY LANE 1' : pn(s.k) + ' ✓', 1.6); return true; },
    card() { const all = J.list.every(q => q.got); return [all ? 'BACK TO ' + J.C.name + ' BY LANE 1' : 'FIND THEM · E TO GRAB', (innerHeight >= 720 ? '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + J.C.name + ' <span style="font-weight:700;font-size:12px;color:#5a5654">' + J.C.forW + '</span></div>' : '') + lst(J.list.map(q => [PR[q.s.k][2], pn(q.s.k), q.got ? '\u2713' : q.s.where, q.got])), J.list.filter(q => q.got).length + '' + J.miss]; },
    end() { if (J.inCart) J.inCart.forEach(m => m.parent && m.parent.remove(m)); } };
  // ================= GAME 2: RESTOCK (drag to the aisle, tap the shelf) =================
  const RS_AIS = [{ n: 1, x: -52, items: ['buns', 'flour'] }, { n: 2, x: -45.5, items: ['ketchup', 'mustard', 'mayo'] }, { n: 3, x: -39, items: ['pickle', 'beans'] }];
  const HOLD2 = V(PAL.x, 1.35, 77.9);
  const makeCarton = (k, sh) => { const g = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.38, 0.4), LM('#b8955f')); b.position.y = 0.19; g.add(b); const tp = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.04, 0.12), LM('#e6d8b0')); tp.position.y = 0.38; g.add(tp);
    const p = makeProd(k, 0.9); p.position.y = 0.4; g.add(p); const t = tagSprite(pn(k) + ' · ' + SHN[sh], YEL, INK, 0.7); t.position.y = 0.78; t.visible = false; g.add(t); g.userData.tag = t; return g; };
  const G2 = {
    begin() { J.cart = shuffle(RS_AIS.flatMap(a => a.items.map(k => ({ a, k })))).slice(0, 6).map((q, i) => { q.sh = Math.random() * 3 | 0; q.g = own(makeCarton(q.k, q.sh)); q.g.position.set(PAL.x + (i % 2 ? 0.25 : -0.25), 0.18 + Math.floor(i / 2) * 0.4, PAL.z); return q; }); J.i = 0; J.sub = 'drag'; this.lift(); toast('DRAG EACH CARTON TO ITS AISLE · 1, 2 OR 3', 2.4); },
    lift() { const q = J.cart[J.i]; if (!q) return; J.cur = q; q.g.userData.tag.visible = true; J.held = false; fly(q.g, HOLD2, 0.35, 0.15, null); },
    press() { if (J.sub === 'drag') { if (J.cur && !J.flies.length) { J.held = true; this.drag(); } return; }
      if (J.sub === 'shelf') { const q = J.cur, a = q.a, hit = nearestOf([0, 1, 2], i => V(a.x, LEDGE_Y[i] + 0.15, 79.3), 2.4); if (hit == null) return;
        if (hit !== q.sh) { miss('PLUM: "THE CARTON SAYS ' + SHN[q.sh] + ' SHELF."'); return; }
        pop(); J.cur = null; fly(q.g, V(a.x, LEDGE_Y[hit] + 0.02, 79.3), 0.35, 0.1, () => { q.g.children.forEach(c => { c.visible = false; }); for (let s = 0; s < 3; s++) { const p = own(makeProd(q.k, 1.4)); p.position.set(a.x - 0.33 + s * 0.33, LEDGE_Y[hit] + 0.02, 79.3); } tone(880, 0.03, 0.1, 'triangle'); });
        J.i++; if (J.i < J.cart.length) { J.sub = 'drag'; this.lift(); } else { ding(); addGold(5 * J.cart.length); NEXT('done', finishGame, 1.2); } } },
    drag() { if (!J.held) return; const p = hitZ(79.0); if (!p) return; J.cur.g.position.set(clamp(p.x, -55, -36), clamp(p.y - 0.2, 0.2, 2.4), 79.0); },
    release() { if (!J.held) return; J.held = false; const q = J.cur, p = q.g.position, a = RS_AIS.find(r => Math.abs(p.x - r.x) < 2.6);
      if (!a || p.y < 0.15) { fly(q.g, HOLD2, 0.3, 0.05, null); return; } if (a !== q.a) { miss('PLUM: "' + pn(q.k) + ' LIVES IN AISLE ' + q.a.n + '."'); fly(q.g, HOLD2, 0.35, 0.1, null); return; }
      pop(); J.sub = 'shelf'; fly(q.g, V(a.x, 2.1, 78.8), 0.3, 0.05, null); toast('AISLE ' + a.n + ' · TAP THE ' + SHN[q.sh] + ' SHELF', 1.6); },
    card() { const q = J.cur; return [J.sub === 'shelf' ? 'TAP THE ' + SHN[q.sh] + ' SHELF' : 'DRAG IT TO ITS AISLE', (q ? row(PR[q.k][2], pn(q.k) + ' · ' + SHN[q.sh] + ' SHELF', '', false) : '') + RS_AIS.map(a => row(AIS[a.n - 1][2], 'AISLE ' + a.n + ' · ' + a.items.map(pn).join(', '), '', false)).join('') + lab('CARTONS') + meter(J.i / J.cart.length, YEL), J.i + J.sub + J.miss]; },
    hint() { const q = J.cur; if (!q) return null; return J.sub === 'shelf' ? [V(q.a.x, LEDGE_Y[q.sh] + 0.15, 79.3), 'TAP ' + SHN[q.sh]] : [V(q.a.x, 1.2, 79.0), 'DRAG TO AISLE ' + q.a.n]; },
    shot() { return J.sub === 'shelf' && J.cur ? [V(J.cur.a.x, 1.05, 79.3), 1.8, 2.3, 0.15, 2.4, Math.PI, 3.4] : [V(-45.5, 1.0, 79.2), 14, 2.6, 0.5, 6, Math.PI, 13]; } };
  // ================= GAME 3: PRICE GUN (aisle 4 west face, x -33.05) =================
  const PG_POOL = [['chips', 2], ['cereal', 3], ['cookies', 2], ['soda', 1], ['beans', 1], ['pickle', 3], ['oil', 4], ['flour', 3]], PGX = -33.12;
  const G3 = {
    begin() { const pick6 = shuffle(PG_POOL.slice()).slice(0, 6); J.items = pick6.map(([k, p], i) => { const g = own(makeProd(k, 1.7)); g.position.set(PGX, [0.62, 1.12][i % 2], 84.6 + Math.floor(i / 2) * 0.95); g.rotation.y = -Math.PI / 2; const q = own(tagSprite('? G', '#ffffff', INK, 0.3)); q.material.depthTest = true; q.position.copy(g.position).add(V(-0.14, 0.06, 0)); return { k, p, g, q, done: false }; }); J.sel = null; toast('TAP AN ITEM · PICK THE PRICE ON THE CARD', 2.4); },
    press() { const it = nearestOf(J.items.filter(q => !q.done), q => q.g.position.clone().add(V(0, 0.15, 0)), 2.0); if (!it) return; J.items.forEach(o => { if (o.q.visible) o.q.material.map = tagFor('? G', '#ffffff', INK); }); J.sel = it; it.q.material.map = tagFor('? G', YEL, INK); pop(); },
    choose(p) { const it = J.sel; if (!it) return; if (p !== it.p) { miss('PLUM: "THE CARD SAYS ' + pn(it.k) + ' IS ' + it.p + ' G."'); return; }
      beep(); it.done = true; it.q.visible = false; J.sel = null; const t = own(tagSprite(p + ' G', YEL, INK, 0.3)); t.material.depthTest = true; t.position.copy(it.g.position).add(V(-0.12, 0.08, 0)); tone(1500, 0.04, 0.08, 'square');
      if (J.items.every(q => q.done)) { ding(); addGold(4 * J.items.length); NEXT('done', finishGame, 1.0); } },
    ui() { const it = J.sel;
      if (pickKey === 'pg' + (it ? it.k : '') + J.items.filter(q => q.done).length + J.miss) return true; showPick('pg' + (it ? it.k : '') + J.items.filter(q => q.done).length + J.miss, 'PRICE GUN', J.items.filter(q => q.done).length + ' / 6', lab(it ? 'PRICE FOR ' + pn(it.k) + '? CHECK THE CARD' : 'TAP AN ITEM WITH A ? TAG'),
        it ? [1, 2, 3, 4, 5].map(p => ({ label: p + ' G', go: () => this.choose(p) })) : [], it ? 3 : 0); const pl = document.createElement('div'); pl.innerHTML = lab('PRICE CARD') + lst(J.items.map(q => [PR[q.k][2], pn(q.k), q.p + ' G' + (q.done ? ' \u2713' : ''), q.done])); pick.lastChild.appendChild(pl); return true; },
    hint() { const it = J.sel ? null : J.items.find(q => !q.done); return it ? [it.g.position.clone().add(V(0, 0.15, 0)), 'TAP ' + pn(it.k)] : null; },
    shot() { return [V(PGX, 0.95, 85.55), 3.4, 1.4, 0.12, 2.2, -Math.PI / 2, 4.6]; } };
  // ================= GAME 4: CHECKOUT (lane 1: scan · bag heavy first · change) =================
  const LX = LANES[0], BZ0 = 66.2, BZ1 = 64.25, SZ = 64.7, BAGP = V(LX + 0.22, TOP, 62.9), BUY = { milk: [1, 3], beans: [1, 2], flour: [1, 3], oil: [1, 4], chips: [0, 2], buns: [0, 2], cookies: [0, 3], cereal: [0, 3] };
  const laserM = new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0 }); { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.03), laserM); m.rotation.x = -Math.PI / 2; m.position.set(LX, TOP + 0.014, SZ); G.add(m); }
  const zoneM = new THREE.MeshBasicMaterial({ color: 0x3f9a5e, transparent: true, opacity: 0 }); { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.42), zoneM); m.rotation.x = -Math.PI / 2; m.position.set(LX, TOP + 0.01, SZ); G.add(m); }
  const G4 = {
    begin() { const f = custFox(J.ci); f.visible = true; f.position.set(LX - 1.15, 0, 65.4); f.rotation.y = Math.PI / 2; J.cf = f; J.list = shuffle(Object.keys(BUY)).slice(0, 5); J.toBelt = J.list.slice(); J.belt = []; J.row = []; J.spawnT = 0.6; J.total = 0; J.sub = 'scan'; laserM.opacity = 0.7; const bg = own(new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.36, 0.22), LM('#c9a77a'))); bg.position.copy(BAGP).add(V(0, 0.18, 0)); toast('TAP EACH ITEM ON THE RED LINE', 2.2); },
    tick(dt) { if (J.sub !== 'scan') return; beltTex.offset.y -= dt * 0.45 * 4;
      J.spawnT -= dt; if (J.toBelt.length && J.spawnT <= 0 && !J.belt.some(b => b.z > BZ0 - 0.5)) { const k = J.toBelt.shift(), g = own(makeProd(k, 1.3)); g.position.set(LX, TOP, BZ0); J.belt.push({ k, g, z: BZ0, ok: false }); J.spawnT = 1.1; }
      let inZ = false; for (const b of J.belt.slice()) { if (b.ret) continue; b.z -= dt * 0.45; b.g.position.z = b.z; if (Math.abs(b.z - SZ) < 0.2 && !b.ok) inZ = true;
        if (b.z <= BZ1) { J.belt.splice(J.belt.indexOf(b), 1); if (!b.ok) { miss('PLUM: "MISSED ONE. BACK IT GOES."', 1.2); b.ret = true; J.belt.push(b); fly(b.g, V(LX, TOP, BZ0), 0.6, 0.25, () => { b.ret = false; b.z = BZ0; }); }
          else { const i = J.row.length; J.row.push(b); fly(b.g, V(LX - 0.22 + (i % 3) * 0.22, TOP, 63.9 - Math.floor(i / 3) * 0.32), 0.3, 0.05, null); } } }
      zoneM.opacity = inZ ? 0.55 : 0; laserM.opacity = 0.5 + 0.4 * Math.sin(J.t * 30);
      if (!J.toBelt.length && !J.belt.length && J.row.length === J.list.length && !J.flies.length) { ding(); laserM.opacity = 0; J.sub = 'bag'; J.row.forEach(b => { b.tag = own(tagSprite(BUY[b.k][0] ? 'HEAVY' : 'LIGHT', BUY[b.k][0] ? YEL : '#ffffff', INK, 0.34)); b.tag.position.copy(b.g.position).add(V(0, 0.42, 0)); }); toast('NOW BAG THEM · HEAVY FIRST', 1.8); } },
    press() { if (J.sub === 'scan') { const b = J.belt.find(q => !q.ok && !q.ret && Math.abs(q.z - SZ) < 0.26); if (!b) return; b.ok = true; J.total += BUY[b.k][1]; beep(); const t = own(tagSprite(pn(b.k) + ' ' + BUY[b.k][1] + ' G', '#ffffff', INK, 0.4)); t.position.set(LX, TOP + 0.55, SZ); J.pops = (J.pops || []).concat([{ t, life: 0.9 }]); return; }
      if (J.sub === 'bag') { const rest = J.row.filter(b => !b.bag), b = nearestOf(rest, q => q.g.position.clone().add(V(0, 0.1, 0)), 2.2); if (!b) return;
        if (!BUY[b.k][0] && rest.some(q => BUY[q.k][0])) { miss('PLUM: "HEAVY FIRST. THE ' + pn(b.k) + ' CAN WAIT."'); return; }
        b.bag = true; b.tag.visible = false; pop(); fly(b.g, BAGP.clone().add(V(0, 0.15, 0)), 0.4, 0.3, () => { b.g.visible = false; });
        if (J.row.every(q => q.bag)) { const paid = J.total < 10 ? 10 : J.total < 20 ? 20 : 50; J.paid = paid; J.change = paid - J.total; J.given = 0; J.sub = 'change'; coin(); toast(J.C.name + ' PAYS ' + paid + ' G · GIVE ' + J.change + ' G CHANGE', 2.2); } } },
    give(n) { if (n === 0) { J.given = 0; return; } J.given += n; coin(); if (J.given > J.change) { miss('PLUM: "TOO MUCH! COUNT IT AGAIN: ' + J.change + ' G."'); J.given = 0; return; }
      if (J.given === J.change) { ding(); J.cf.userData.hop = 1; addGold(J.total + 6); J.sub = 'paid'; hidePick(); NEXT('paid', finishGame, 1.4); } },
    ui() { if (J.sub !== 'change') return false; showPick('ch' + J.given + '_' + J.miss, 'CHANGE', 'GIVE ' + J.change + ' G', '<div style="font-size:13px;font-weight:800;margin-bottom:6px">' + J.total + ' G · PAID ' + J.paid + ' G · GIVEN ' + J.given + ' / ' + J.change + ' G</div>',
      [1, 2, 5].map(n => ({ label: n + ' G', go: () => this.give(n) })).concat([{ label: 'AGAIN', go: () => this.give(0) }]), 2); return true; },
    card() { if (J.sub === 'scan') return ['TAP WHEN AN ITEM IS ON THE RED LINE', lst(J.list.map(k => { const ok = J.row.some(b => b.k === k) || J.belt.some(b => b.k === k && b.ok); return [PR[k][2], pn(k), BUY[k][1] + ' G' + (ok ? ' \u2713' : ''), ok]; })) + row(INK, 'TOTAL', J.total + ' G', false), 's' + J.total + J.miss + J.row.length];
      if (J.sub === 'bag') { const rest = J.row.filter(b => !b.bag); return [rest.some(b => BUY[b.k][0]) ? 'TAP THE HEAVY ONES FIRST' : 'NOW THE LIGHT ONES', lst(J.row.map(b => [BUY[b.k][0] ? YEL : '#ffffff', pn(b.k) + ' · ' + (BUY[b.k][0] ? 'HEAVY' : 'LIGHT'), b.bag ? '\u2713' : '', b.bag])), 'b' + rest.length + J.miss]; } return null; },
    hint() { if (J.sub === 'scan') return J.belt.find(q => !q.ok && !q.ret && Math.abs(q.z - SZ) < 0.2) ? [V(LX, TOP + 0.1, SZ), 'TAP NOW'] : null;
      if (J.sub === 'bag') { const rest = J.row.filter(b => !b.bag), b = rest.find(q => BUY[q.k][0]) || rest[0]; return b ? [b.g.position.clone().add(V(0, 0.1, 0)), 'TAP ' + pn(b.k)] : null; } return null; },
    shot() { return [V(LX, TOP + 0.35, J.sub === 'scan' ? 64.9 : 63.6), 2.8, 1.6, 0.45, 2.4, Math.PI / 2, 4.4]; },
    end() { laserM.opacity = 0; zoneM.opacity = 0; } };
  // ================= GAME 5: PRODUCE (hold to mist 4 crates, tap the bad fruit) =================
  const PX = -54.4, CRATES = [67.15, 68.85, 71.15, 72.85].map(z => V(PX + 0.1, 1.05, z)), COMPOST = V(-53.0, 0, 70.0);
  const G5 = {
    begin() { J.wet = CRATES.map(() => 0); J.sub = 'mist'; J.bin = own(new THREE.Group()); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.24, 0.6, 14), LM('#3f7a3a')); b.position.y = 0.3; J.bin.add(b); const t = tagSprite('COMPOST', '#3f7a3a', '#ffffff', 0.5); t.position.y = 0.85; J.bin.add(t); J.bin.position.copy(COMPOST); toast('HOLD ON EACH CRATE TO MIST IT', 2.2); },
    press() { if (J.sub === 'mist') { J.hold = nearestOf(CRATES.filter((_, i) => J.wet[i] < 1), v => v, 2.2); return; }
      if (J.sub === 'sort') { const f = nearestOf(J.fruit.filter(q => !q.gone), q => q.m.position, 1.4); if (!f) return; if (!f.bad) { miss('PLUM: "THAT ONE IS FRESH. LOOK FOR BROWN SPOTS."'); return; }
        f.gone = true; pop(); fly(f.m, COMPOST.clone().add(V(0, 0.6, 0)), 0.45, 0.4, () => { f.m.visible = false; tone(300, 0.04, 0.12, 'triangle'); }); if (f.fly) f.fly.visible = false;
        if (J.fruit.every(q => !q.bad || q.gone)) { ding(); addGold(20); NEXT('done', finishGame, 1.0); } } },
    release() { J.hold = null; },
    tick(dt) { if (J.sub === 'mist' && J.hold && ptr.down) { const i = CRATES.indexOf(J.hold); J.wet[i] = Math.min(1, J.wet[i] + dt * 0.7); mistEmit(J.hold.x - 0.1, J.hold.z, 2.3, 2); if (Math.random() < 0.3) tone(1200 + Math.random() * 400, 0.01, 0.05, 'triangle'); if (J.wet[i] >= 1) { J.hold = null; pop(); } }
      if (J.sub === 'mist' && J.wet.every(w => w >= 1)) { ding(); J.sub = 'sort'; J.pause = 0.6; this.fruit(); toast('TAP THE BAD ONES INTO THE COMPOST', 2.2); }
      if (J.fruit) for (const f of J.fruit) if (f.fly && f.fly.visible) f.fly.position.set(f.m.position.x + Math.sin(J.t * 9 + f.ph) * 0.09, f.m.position.y + 0.14 + Math.cos(J.t * 13 + f.ph) * 0.04, f.m.position.z + Math.cos(J.t * 7 + f.ph) * 0.09); },
    fruit() { const bad = new Set(shuffle([...Array(10).keys()]).slice(0, 3 + (Math.random() < 0.5 ? 1 : 0))); const KS = ['tomato', 'onion', 'tomato', 'lettuce'];
      J.fruit = [...Array(10).keys()].map(i => { const k = KS[i % 4], bd = bad.has(i), m = own(makeProd(k, 1.25)); m.position.set(PX + 0.25 + (i % 2) * 0.22, 1.12, 70.6 + Math.floor(i / 2) * 0.48);
        if (bd) { m.traverse(o => { if (o.material) o.material = LM('#6b4a2a'); }); const s = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), LM('#2a1a10')); s.position.set(0.04, 0.1, 0.05); m.add(s); }
        const fl = bd ? own(new THREE.Mesh(new THREE.SphereGeometry(0.018, 5, 4), LM(INK))) : null; return { m, bad: bd, fly: fl, ph: Math.random() * 6 }; }); },
    card() { if (J.sub === 'mist') return ['HOLD ON A DRY CRATE', CRATES.map((_, i) => row('#7fd3ff', 'CRATE ' + (i + 1), J.wet[i] >= 1 ? '\u2713' : Math.round(J.wet[i] * 100) + '%', J.wet[i] >= 1)).join(''), 'm' + J.wet.map(w => Math.round(w * 20)).join()];
      const left = J.fruit ? J.fruit.filter(q => q.bad && !q.gone).length : 0; return ['TAP THE BROWN, SPOTTY ONES', row('#6b4a2a', 'BAD ONES LEFT', String(left), !left), 's' + left + J.miss]; },
    hint() { if (J.sub === 'mist') { const i = J.wet.findIndex(w => w < 1); return i >= 0 ? [CRATES[i], 'HOLD TO MIST'] : null; } const f = J.fruit && J.fruit.find(q => q.bad && !q.gone); return f ? [f.m.position.clone(), 'TAP · BAD'] : null; },
    shot() { return J.sub === 'sort' ? [V(PX + 0.3, 1.1, 71.8), 1.6, 1.2, 0.85, 2.0, Math.PI / 2, 3.2] : [V(PX, 1.1, 70.0), 7.8, 1.8, 0.6, 2.6, Math.PI / 2, 8.8, 0.45]; } };
  // ================= GAME 6: CART ROUND-UP (walk the lot, carts snake behind you) =================
  const G6 = { walk: true,
    begin(P) { const g0 = gro(); if (g0 && g0.state && g0.state().pushing) g0.spot.use(P); J.carts = loose.map((c, i) => { c.visible = true; c.position.set(LOOSE[i][0], 0, LOOSE[i][1]); c.rotation.y = LOOSE[i][2]; return { c, st: 'loose' }; }); J.trail = [[P.x, P.z]]; J.back = 0; toast('ROUND UP 5 CARTS · WALK INTO THEM · BACK TO THE CORRAL', 2.6); },
    goal() { const P = J.P, snake = J.carts.filter(q => q.st === 'snake').length, l = J.carts.filter(q => q.st === 'loose'); if (!l.length || (snake >= 3 && Math.hypot(P.x - CORRAL.x, P.z - CORRAL.z) < 12)) return [CORRAL.x + 2.2, CORRAL.z];
      let b = l[0], bd = 1e9; for (const q of l) { const d = Math.hypot(P.x - q.c.position.x, P.z - q.c.position.z); if (d < bd) { bd = d; b = q; } } return [b.c.position.x, b.c.position.z, 1.2]; },
    tick(dt) { const P = J.P, T = J.trail, last = T[T.length - 1]; if (Math.hypot(P.x - last[0], P.z - last[1]) > 0.1) { T.push([P.x, P.z]); if (T.length > 400) T.shift(); }
      for (const q of J.carts) if (q.st === 'loose' && Math.hypot(P.x - q.c.position.x, P.z - q.c.position.z) < 1.5) { q.st = 'snake'; q.n = J.carts.filter(z => z.st === 'snake').length; pop(); toast('CART ' + q.n + ' · ' + J.carts.filter(z => z.st === 'loose').length + ' TO GO', 1.2); }
      for (const q of J.carts) if (q.st === 'snake') { const idx = Math.max(0, T.length - 1 - Math.round(q.n * 11)), a = T[idx], b = T[Math.min(T.length - 1, idx + 3)]; q.c.position.x += (a[0] - q.c.position.x) * Math.min(1, dt * 8); q.c.position.z += (a[1] - q.c.position.z) * Math.min(1, dt * 8);
        if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 0.02) { const yw = Math.atan2(b[0] - a[0], b[1] - a[1]) + Math.PI / 2; let d = yw - q.c.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); q.c.rotation.y += d * Math.min(1, dt * 6); } }
      if (Math.hypot(P.x - (CORRAL.x + 2.2), P.z - CORRAL.z) < 2.0) { const sn = J.carts.filter(q => q.st === 'snake'); if (sn.length) { sn.forEach(q => { q.st = 'in'; const k = J.back++; fly(q.c, V(-48.2 + 0.45 * (3 + k) * 0.5 + 0.0, 0, CORRAL.z), 0.6, 0.0, () => { q.c.rotation.y = -Math.PI / 2; }); }); ding(); toast('IN THE CORRAL · ' + J.back + ' / 5', 1.4); } }
      if (J.back >= 5 && !J.flies.length && J.sub !== 'done') { J.sub = 'done'; J.miss = J.st < 70 ? 0 : J.st < 120 ? 1 : 3; addGold(22); NEXT('done', finishGame, 0.8); } },
    card() { const n = s => J.carts.filter(q => q.st === s).length; return [n('loose') ? 'WALK INTO A CART' : 'BACK TO THE CORRAL', row(STEEL, 'LOOSE', String(n('loose')), !n('loose')) + row(YEL, 'FOLLOWING YOU', String(n('snake')), false) + row(GREEN, 'IN THE CORRAL', J.back + ' / 5', J.back >= 5) + row(INK, 'TIME', Math.floor(J.st) + ' S', false), n('loose') + '' + n('snake') + J.back + Math.floor(J.st)]; },
    end() { loose.forEach((c, i) => { c.visible = i < 2; c.position.set(LOOSE[i][0], 0, LOOSE[i][1]); c.rotation.y = LOOSE[i][2]; }); } };
  // ================= GAME 7: DELI + BAKERY (hold the slicer to the weight · bag the steaming buns) =================
  const ORD = [['HAM', '#e79aa0'], ['CHEESE', '#f2c21b'], ['TURKEY', '#f6e6c8']], RACK = { x: -12.6, z: 64.0 }, BUNBAG = V(-13.2, 0.42, 64.0);
  const G7 = {
    begin() { const f = custFox(J.ci); f.visible = true; f.position.set(DX - 1.25, 0, DZ + 0.3); f.rotation.y = Math.PI / 2; J.cf = f; J.orders = shuffle(ORD.slice()).slice(0, 2).map(([n, c]) => ({ n, c, want: [100, 150, 200, 250][Math.random() * 4 | 0], w: 0 })); J.oi = 0; J.sub = 'slice'; J.slices = []; scaleShow('0 G'); toast('HOLD THE SLICER · LET GO ON THE WEIGHT', 2.4); },
    press() { if (J.sub === 'slice') { J.cutting = true; tone(160, 0.03, 0.3, 'sawtooth'); return; }
      if (J.sub === 'buns') { const b = nearestOf(J.buns.filter(q => !q.in), q => q.m.position, 1.5); if (!b) return; if (!b.fresh) { miss('PLUM: "THAT ONE IS YESTERDAY\'S. FRESH ONES STEAM!"'); return; }
        b.in = true; pop(); if (b.st) b.st.visible = false; fly(b.m, BUNBAG.clone().add(V(0, 0.25, 0)), 0.4, 0.3, () => { b.m.visible = false; }); J.bagged++;
        if (J.bagged >= 6) { ding(); addGold(18); NEXT('done', finishGame, 1.0); } } },
    release() { if (J.sub !== 'slice' || !J.cutting) return; J.cutting = false; const o = J.orders[J.oi]; if (o.w < 15) return; const d = o.w - o.want, ok = Math.abs(d) <= 20; o.ok = ok;
      if (ok) { ding(); toast(o.n + ' · ' + Math.round(o.w) + ' G · SPOT ON', 1.4); } else miss('PLUM: "' + Math.round(o.w) + ' G. ' + (d > 0 ? 'A LITTLE OVER' : 'A LITTLE UNDER') + ', THEY DON\'T MIND."', 1.8);
      J.oi++; J.pause = 1.0; J.after = () => { J.slices.forEach(s => { s.visible = false; }); J.slices = []; scaleShow('0 G'); if (J.oi >= J.orders.length) this.toBuns(); }; },
    toBuns() { J.sub = 'buns'; J.bagged = 0; const fresh = new Set(shuffle([...Array(8).keys()]).slice(0, 6)); const bag = own(new THREE.Group()); const bb = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.38, 0.22), LM('#c9a77a')); bb.position.y = 0.19; bag.add(bb); bag.position.copy(BUNBAG); bag.rotation.y = Math.PI / 2;
      const st = own(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.42, 0.5), LM(DARK))); st.position.set(BUNBAG.x, 0.21, BUNBAG.z);
      J.buns = [...Array(8).keys()].map(i => { const fr = fresh.has(i), m = own(makeProd('buns', 1.0)); m.position.set(RACK.x - 0.05, 1.04, 63.0 + i * 0.28); m.rotation.y = Math.PI / 2; if (!fr) { m.traverse(o => { if (o.material) o.material = LM('#8f7f62'); }); m.scale.y = 0.62; m.rotation.z = 0.12;   // s77: yesterday's = grey-brown, flat, tipped, with mould spots
          for (const [dx, dz] of [[-0.05, -0.04], [0.04, 0.05], [0.0, -0.08]]) { const sp = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 4), LM('#5f6e3a')); sp.position.set(m.position.x + dx * 0.2, m.position.y + 0.1, m.position.z + dz); sp.scale.y = 0.4; own(sp); } }
        let s = null; if (fr) { s = own(tagSprite('~ HOT ~', '#ffffff', '#ec3013', 0.26, false)); s.position.set(m.position.x, 1.32, m.position.z); } return { m, fresh: fr, st: s, in: false }; }); toast('BAG 6 FRESH BUNS · THE STEAMING ONES', 2.2); },
    tick(dt) { if (J.sub === 'slice') { const o = J.orders[J.oi]; blade.rotation.x += dt * (J.cutting ? 40 : 0); if (J.cutting && o) { o.w += dt * 58; scaleShow(Math.round(o.w) + ' G');
        if (Math.floor(o.w / 25) > J.slices.length) { const s = own(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.008, 16), LM(o.c))); s.position.set(DX, 1.2, 62.45); J.slices.push(s); fly(s, V(DX + rnd(-0.02, 0.02), 1.06 + J.slices.length * 0.008, 63.65), 0.35, 0.05, null); tone(240, 0.02, 0.06, 'triangle'); }
        if (o.w > o.want + 140) this.release(); } }
      if (J.buns) for (const b of J.buns) if (b.st && b.st.visible) b.st.position.y = 1.32 + Math.sin(J.t * 3 + b.m.position.z * 7) * 0.03; },
    card() { if (J.sub === 'slice') { const o = J.orders[J.oi] || J.orders[J.orders.length - 1]; return ['HOLD TO SLICE · LET GO ON ' + o.want + ' G', '<div style="font-weight:900;font-size:14px;margin-bottom:4px">' + J.C.name + '</div>' + lab('SCALE · ' + Math.round(o.w) + ' / ' + o.want + ' G') + meter(o.w / (o.want * 1.5), INK, [(o.want - 20) / (o.want * 1.5), (o.want + 20) / (o.want * 1.5)]) + J.orders.map((q, i) => row(q.c, q.want + ' G ' + q.n, i < J.oi ? (q.ok ? '\u2713' : Math.round(q.w) + ' G') : i === J.oi ? Math.round(q.w) + ' G' : '', i < J.oi && q.ok)).join(''), 'sl' + J.oi + Math.round(o.w / 5)]; }
      return ['TAP THE STEAMING BUNS', row('#d9a35a', 'FRESH BUNS IN THE BAG', J.bagged + ' / 6', J.bagged >= 6), 'bn' + J.bagged + J.miss]; },
    hint() { if (J.sub === 'slice') { const o = J.orders[J.oi]; return !o ? null : J.cutting ? (o.w > o.want - 30 ? [V(DX, 1.1, 63.65), 'LET GO NOW'] : null) : [V(DX, 1.25, 62.3), 'HOLD TO SLICE']; } const b = J.buns && J.buns.find(q => q.fresh && !q.in); return b ? [b.m.position.clone(), 'TAP · FRESH'] : null; },
    shot() { return J.sub === 'buns' ? [V(RACK.x, 1.0, 64.0), 2.8, 1.6, 0.25, 2.0, -Math.PI / 2, 2.6] : [V(DX, 1.3, 63.0), 2.6, 1.5, 0.38, 1.9, Math.PI / 2, 2.8]; },
    end() { blade.rotation.x = 0; scaleShow('0 G'); } };
  // ================= GAME 8: SPILL ON AISLE 3 (sign first · rub to mop · customer walks round) =================
  const PUD = V(-42.25, 0.08, 86.5), SIGNP = V(-42.25, 0, 85.15);
  const G8 = {
    begin() { const m = own(new THREE.Mesh(new THREE.CircleGeometry(0.9, 26), new THREE.MeshBasicMaterial({ color: '#9fd05a', transparent: true, opacity: 0.8, depthWrite: false }))); m.rotation.x = -Math.PI / 2; m.position.copy(PUD); J.pud = m; J.rub = 0; J.sub = 'sign';
      const jar = own(makeProd('pickle', 1.4)); jar.position.set(PUD.x + 0.5, 0.08, PUD.z + 0.3); jar.rotation.z = Math.PI / 2;
      J.ring = own(new THREE.Mesh(new THREE.RingGeometry(0.28, 0.4, 20), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.9, depthWrite: false }))); J.ring.rotation.x = -Math.PI / 2; J.ring.position.copy(SIGNP).setY(0.09);
      J.mop = own(new THREE.Group()); const h = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.16), LM('#e8e0c8')); J.mop.add(h); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 1.4, 6), LM(WOOD)); st.position.set(0, 0.68, 0.18); st.rotation.x = 0.25; J.mop.add(st); J.mop.visible = false; toast('SAFETY FIRST · TAP THE RING FOR THE WET FLOOR SIGN', 2.4); },
    press() { if (J.sub === 'sign') { if (dist(scrW(SIGNP)) < RAD() * 1.8) { pop(); J.ring.visible = false; J.sign = own(new THREE.Group()); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.62, 0.02), LM(YEL)); p.position.set(0, 0.3, s * 0.09); p.rotation.x = s * 0.28; J.sign.add(p); }
          const t = tagSprite('WET FLOOR', YEL, INK, 0.5); t.position.y = 0.78; J.sign.add(t); J.sign.position.copy(SIGNP); J.sub = 'mop'; J.mop.visible = true; toast('NOW RUB THE SPILL TO MOP IT', 1.8); }
        else if (dist(scrW(PUD)) < RAD() * 2.4) miss('PLUM: "SIGN FIRST! SOMEONE COULD SLIP."'); return; }
      if (J.sub === 'pickup' && J.sign && dist(scrW(SIGNP.clone().setY(0.4))) < RAD() * 2) { pop(); J.sign.visible = false; ding(); addGold(18); NEXT('done', finishGame, 0.8); } },
    drag() { if (J.sub !== 'mop' || !ptr.down) return; const p = hitY(0.1); if (!p) return; const m = J.mop.position, d = Math.hypot(p.x - m.x, p.z - m.z); m.set(p.x, 0.1, p.z);
      if (d < 1.0 && Math.hypot(p.x - PUD.x, p.z - PUD.z) < 0.9 * J.pud.scale.x + 0.3) { J.rub += d; const k = Math.max(0.05, 1 - J.rub / 8); J.pud.scale.setScalar(k); if (Math.random() < 0.2) tone(500 + Math.random() * 200, 0.012, 0.05, 'triangle');
        if (k <= 0.06) { J.pud.visible = false; J.mop.visible = false; ding(); J.sub = 'walk'; const f = custFox(J.ci); f.visible = true; f.position.set(PUD.x, 0, 93.5); f.rotation.y = Math.PI; J.cf = f; toast('ALL DRY · ' + J.C.name + ' WALKS PAST THE SIGN', 1.8); } } },
    tick(dt) { if (J.sub === 'sign' && J.ring) J.ring.scale.setScalar(1 + Math.sin(J.t * 6) * 0.12);
      if (J.sub === 'walk' && J.cf) { const f = J.cf, tz = 84.2, dz = Math.abs(f.position.z - SIGNP.z), tx = dz < 1.6 ? PUD.x - 1.15 : PUD.x; f.position.x += (tx - f.position.x) * Math.min(1, dt * 3); f.position.z -= dt * 1.6; kit.animFox && kit.animFox(f, dt, 1.6); f.rotation.y = Math.PI + (tx - f.position.x) * 0.6;
        if (f.position.z <= tz) { f.position.z = tz; f.rotation.y = Math.PI; kit.animFox && kit.animFox(f, dt, 0); J.sub = 'pickup'; toast('TAP THE SIGN TO PICK IT UP', 1.6); } } },
    card() { const s = J.sub; return [s === 'sign' ? 'TAP THE YELLOW RING' : s === 'mop' ? 'RUB THE SPILL' : s === 'walk' ? 'WATCH THEM WALK ROUND' : 'TAP THE SIGN', row(YEL, 'WET FLOOR SIGN', s === 'sign' ? '\u2014' : '\u2713', s !== 'sign') + row('#9fd05a', 'MOP THE PICKLE JUICE', s === 'mop' ? Math.round((1 - J.pud.scale.x) * 100) + '%' : s === 'sign' ? '\u2014' : '\u2713', s !== 'sign' && s !== 'mop') + row(INK, 'PICK UP THE SIGN', s === 'done' ? '\u2713' : '\u2014', false), s + Math.round(J.rub * 3) + J.miss]; },
    hint() { const s = J.sub; return s === 'sign' ? [SIGNP.clone().setY(0.1), 'TAP THE RING'] : s === 'mop' ? [PUD.clone(), 'RUB'] : s === 'pickup' ? [SIGNP.clone().setY(0.4), 'TAP'] : null; },
    shot() { return J.sub === 'walk' || J.sub === 'pickup' ? [V(PUD.x, 0.6, 86.0), 2.6, 3.0, 0.6, 4.4, Math.PI, 5.0] : [V(PUD.x, 0.3, 86.2), 2.6, 3.6, 0.95, 3.2, Math.PI, 5.6]; } };   // s77: walk = camera pulled back to the front of the aisle; the customer walks round the sign towards you and stops short of the lens
  // ================= GAME 9: FREEZER FRONT (close the open doors before they frost · face the stock) =================
  const FZD = 106.64, DW = 6.67 / 5, FDX0 = -38.4 + DW, FDN = 3;
  const glassM = new THREE.MeshPhongMaterial({ color: '#cfe9ff', transparent: true, opacity: 0.45, depthWrite: false, shininess: 90 });
  const G9 = {
    begin() { J.doors = [...Array(FDN).keys()].map(i => { const g = own(new THREE.Group()); g.position.set(FDX0 + i * DW, 0, FZD); const p = new THREE.Mesh(new THREE.BoxGeometry(DW - 0.06, 2.4, 0.03), glassM); p.position.set(DW / 2, 1.35, 0); g.add(p);
        const h = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.6, 0.05), LM(STEEL)); h.position.set(DW - 0.15, 1.35, -0.04); g.add(h); const fm = new THREE.Mesh(new THREE.PlaneGeometry(DW - 0.08, 2.3), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, depthWrite: false })); fm.position.set(DW / 2, 1.35, -0.02); fm.rotation.y = Math.PI; g.add(fm);
        return { g, fm, open: false, frost: 0, a: 0 }; }); J.queue = [6, 13]; this.open(0); this.open(2);
      J.face = [...Array(6).keys()].map(i => { const k = i % 3 === 1 ? 'shake' : 'milk', m = own(makeProd(k, 1.5)); const x = FDX0 + 0.3 + (i % 3) * 1.2 + (i > 2 ? 0.45 : 0), y = i > 2 ? 1.4 : 0.86; m.position.set(x, y, 107.25); m.rotation.z = (i % 2 ? 1 : -1) * 0.35; return { m, x, y, ok: false }; });
      J.opened = 2; toast('CLOSE THE OPEN DOORS · TAP THE MESSY ITEMS TO FACE THEM', 2.6); },
    open(i) { const d = J.doors[i]; if (!d || d.open) return; d.open = true; d.frost = 0; tone(300, 0.03, 0.3, 'sine'); },
    press() { const op = J.doors.filter(d => d.open), d = nearestOf(op, q => q.g.position.clone().add(V(DW * 0.5 * Math.cos(q.a), 1.35, -DW * 0.5 * Math.sin(q.a))), 2.2);
      if (d) { d.open = false; tone(200, 0.05, 0.15, 'square'); pop(); return; }
      const f = nearestOf(J.face.filter(q => !q.ok), q => q.m.position.clone().add(V(0, 0.15, -0.4)), 1.6); if (f) { f.ok = true; pop(); fly(f.m, V(f.x, f.y, 106.85), 0.3, 0.02, () => { f.m.rotation.z = 0; }); } },
    tick(dt) { for (const d of J.doors) { const ta = d.open ? 1.1 : 0; d.a += (ta - d.a) * Math.min(1, dt * 8); d.g.rotation.y = d.a; if (d.open) { d.frost += dt / 10; if (d.frost >= 1) { d.open = false; miss('PLUM CLOSES IT: "FROSTY! KEEP AN EYE ON THE DOORS."', 1.6); } } else d.frost = Math.max(0, d.frost - dt * 0.4); d.fm.material.opacity = d.frost * 0.75; }
      if (J.queue.length && J.st > J.queue[0]) { J.queue.shift(); const shut = J.doors.map((d, i) => [d, i]).filter(([d]) => !d.open); if (shut.length) { this.open(shut[Math.random() * shut.length | 0][1]); J.opened++; toast('A CUSTOMER LEFT A DOOR OPEN!', 1.4); } }
      if (J.sub !== 'done' && !J.queue.length && J.doors.every(d => !d.open) && J.face.every(q => q.ok) && !J.flies.length) { J.sub = 'done'; ding(); addGold(20); NEXT('done', finishGame, 0.9); } },
    card() { const op = J.doors.filter(d => d.open).length, left = J.face.filter(q => !q.ok).length; return [op ? 'TAP AN OPEN DOOR' : left ? 'TAP A MESSY ITEM' : 'ALL GOOD · WAIT A MOMENT', row('#7fd3ff', 'OPEN DOORS', String(op), !op) + J.doors.map((d, i) => d.open ? lab('DOOR ' + (i + 1) + ' FROST') + meter(d.frost, '#7fd3ff') : '').join('') + row(WHITE, 'ITEMS TO FACE', String(left), !left), 'f' + op + left + J.doors.map(d => Math.round(d.frost * 10)).join('') + J.miss]; },
    hint() { const d = J.doors.find(q => q.open); if (d) return [d.g.position.clone().add(V(DW * 0.5 * Math.cos(d.a), 1.35, -DW * 0.5 * Math.sin(d.a))), 'TAP · CLOSE']; const f = J.face.find(q => !q.ok); return f ? [f.m.position.clone().add(V(0, 0.15, -0.4)), 'TAP · FACE IT'] : null; },
    shot() { return [V(FDX0 + DW * 1.5, 1.3, FZD), 5.4, 2.6, 0.12, 3.0, Math.PI, 5.6]; } };
  // ================= GAME 10: WEEKLY FLYER (drag each product to its spot in the flyer picture) =================
  const FL_K = ['soda', 'chips', 'cookies', 'cereal'], slotP = i => V(FX + FSX[i % 3], FSY[Math.floor(i / 3)], FZ - 0.08);
  const G10 = {
    begin() { const grid = shuffle([...FL_K, ...[...Array(5)].map(() => FL_K[Math.random() * 4 | 0])]); J.grid = grid; J.fill = grid.map(() => null);
      J.items = shuffle(grid.slice()).map((k, i) => { const g = own(makeProd(k, 0.95)); const p = V(DOL.x - 0.28 + (i % 3) * 0.28, 0.3, DOL.z - 0.24 + Math.floor(i / 3) * 0.24); g.position.copy(p); return { k, g, home: p, placed: false }; }); J.cur = null; toast('MATCH THE FLYER · DRAG EACH ONE TO ITS SPOT', 2.4); },
    press() { const it = nearestOf(J.items.filter(q => !q.placed), q => q.g.position.clone().add(V(0, 0.12, 0)), 1.5); if (!it) return; J.cur = it; pop(); this.drag(); },
    drag() { const it = J.cur; if (!it) return; const p = hitZ(FZ - 0.35); if (!p) return; it.g.position.set(clamp(p.x, DOL.x - 0.6, FX + 1.2), clamp(p.y - 0.12, 0.25, 1.9), FZ - 0.35); },
    release() { const it = J.cur; if (!it) return; J.cur = null; const s = nearestOf([...Array(9).keys()].filter(i => !J.fill[i]), i => slotP(i).add(V(0, 0.15, 0)), 1.7);
      if (s == null) { fly(it.g, it.home, 0.3, 0.1, null); return; } if (J.grid[s] !== it.k) { miss('PLUM: "THE FLYER SHOWS ' + pn(J.grid[s]) + ' THERE."'); fly(it.g, it.home, 0.35, 0.15, null); return; }
      it.placed = true; J.fill[s] = it; pop(); fly(it.g, slotP(s), 0.2, 0.02, () => tone(880, 0.03, 0.1, 'triangle'));
      if (J.fill.every(Boolean)) { ding(); addGold(18); NEXT('done', finishGame, 1.2); } },
    card() { const sh = innerHeight < 720, cells = J.grid.map((k, i) => '<div style="height:' + (sh ? 20 : 34) + 'px;border:2px solid #201e1d;background:' + (J.fill[i] ? '#201e1d' : PR[k][2]) + ';color:' + (J.fill[i] ? '#ffd23a' : (k === 'chips' ? INK : '#ffffff')) + ';font-size:10px;font-weight:900;display:flex;align-items:center;padding:0 4px;overflow:hidden">' + (J.fill[i] ? '\u2713 ' : '') + pn(k) + '</div>').join('');
      return ['DRAG FROM THE DOLLY TO THE SHELF', (sh ? '' : lab('THIS WEEK\'S FLYER')) + '<div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;margin-top:4px;background:#ec3013;padding:4px">' + cells + '</div>' + lab('TOP ROW = TOP SHELF'), 'fl' + J.fill.filter(Boolean).length + J.miss]; },
    hint() { if (J.cur) { const s = [...Array(9).keys()].find(i => !J.fill[i] && J.grid[i] === J.cur.k); return s != null ? [slotP(s).add(V(0, 0.15, 0)), 'DROP HERE'] : null; } const it = J.items.find(q => !q.placed); return it ? [it.g.position.clone().add(V(0, 0.12, 0)), 'DRAG ' + pn(it.k)] : null; },
    shot() { return [V(FX - 0.5, 0.85, FZ - 0.2), 3.3, 2.6, 0.55, 2.6, Math.PI, 3.6, 0.25]; } };
  // flyer grid: the card shows TOP row first (shelf index 2 = top) → flip rows for the card
  { const c0 = G10.card; G10.card = function () { const g = J.grid, f = J.fill; J.grid = [6, 7, 8, 3, 4, 5, 0, 1, 2].map(i => g[i]); J.fill = [6, 7, 8, 3, 4, 5, 0, 1, 2].map(i => f[i]); const r = c0.call(this); J.grid = g; J.fill = f; return r; }; }
  const GD = { list: G1, restock: G2, price: G3, checkout: G4, produce: G5, carts: G6, deli: G7, spill: G8, freezer: G9, flyer: G10 };
  for (const q of GAMES) Object.assign(GD[q.k], { k: q.k }); for (const q of GAMES) GN[q.k].walk = !!GD[q.k].walk;
  // ================= run a game =================
  let lastP = null;
  function startGame(g, P) { if (busy) return; const n = save.stat('mkVisits', 0); save.setStat('mkVisits', n + 1); const ci = n % CUST.length;
    J = { g, ci, C: CUST[ci], miss: 0, gold: 0, objs: [], flies: [], t: 0, st: 0, sub: '', pause: 0, P }; busy = 'job';
    if (P && RINGS[g] && !GD[g].walk) Object.assign(P, { x: RINGS[g][0], z: RINGS[g][1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, q = GN[g], stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('mkDone', d); const gift = giveGift(); K.finish(g, stars, gold, first); const P0 = J.P; stop(); endClear = 7;
    if (P0 && !GD[g].walk) Object.assign(P0, { x: PLUM0[0] + Math.sin(PLUM0[2]) * 2.3, z: PLUM0[1] + Math.cos(PLUM0[2]) * 2.3, sp: 0, yaw: PLUM0[2] + Math.PI });   // s77: tap jobs end face to face with Plum (no talking across the aisles)
    const OPEN = ['Lovely work!', 'Plum-tastic!', 'The store sparkles!', 'Customers are smiling!'][save.stat('mkClears', 1) % 4];
    const GIFT = { apron: ' Your market apron! The Tailor keeps it too.', discount: " Staff discount: 20% off at Kia's counter.", cart: ' Every job done! The Golden Cart, plus 60 gold.' }[gift] || '';
    sayTo(endT, [ln(OPEN + ' ' + gold + ' gold.' + GIFT)]); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); if (J.cf) J.cf.visible = false; Object.values(cfox).forEach(f => { f.visible = false; }); }
    busy = null; J = null; ptr.down = false; hideCard(); hidePick(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g]; if (g.ui && g.ui()) { hideCard(); return; } hidePick(); const c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : J.C && /list|checkout|deli/.test(J.g) ? 'FOR ' + J.C.name : 'MERU MARKET') + foot(c[0], g.walk) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.st += dt; J.P = P; if (J.flies.length) flyTick(dt); const g = GD[J.g];
    if (J.pops) for (const p of J.pops.slice()) { p.life -= dt; p.t.position.y += dt * 0.25; if (p.life <= 0) { p.t.visible = false; J.pops.splice(J.pops.indexOf(p), 1); } }
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return; if (J.cur && J.g === 'restock' && !J.held && !J.flies.length && J.sub === 'drag') J.cur.g.rotation.y += dt * 1.2;
    if (g.goal) { const go = g.goal(); arrowM.visible = true; beacon.visible = true; arrowM.position.set(go[0], (go[2] || 0) + 1.7 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], 0.09, go[1]); }
    drawCard(); }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99, offK = 1]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * offK * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GD[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = Math.min(1, dt * 3.2); camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    camCur.pos.set(clamp(camCur.pos.x, X0 + 0.4, X1 - 0.4), clamp(camCur.pos.y, 0.6, 5.4), clamp(camCur.pos.z, J && J.g === 'flyer' ? 75.8 : Z0 + 0.4, Z1 - 0.4)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 && (P.y || 0) < 2.5;
  const inLot = P => P.x > X0 - 1 && P.x < X1 + 1 && P.z > 53.8 && P.z <= Z0 + 0.5 && (P.y || 0) < 2.5;
  const ringAt = P => GAMES.find(q => Math.hypot(P.x - RINGS[q.k][0], P.z - RINGS[q.k][1]) < 1.05);
  const nearPlum = P => Math.hypot(P.x - plum.position.x, P.z - plum.position.z) < pmT.r;
  function prompt(P) { if (!inShop(P) && !inLot(P)) return null; if (J && GD[J.g].walk) { if (nearPlum(P)) return 'PLUM · STOP THE JOB'; return GD[J.g].prompt ? GD[J.g].prompt(P) : null; } if (busy) return null;
    const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START · ' + r.name.toUpperCase(); if (K.atHiring(P)) return 'NOW HIRING · START WORK'; if (nearPlum(P)) return 'TALK · PLUM'; return null; }
  const HELLO = ["Welcome to Meru Market! I'm Plum, the manager. Ten jobs, one store. Want to work?", 'Back again? The shelves missed you.', 'Busy day! Shall I put you to work?', 'Fresh stock, fresh jobs. Ready?'];
  const TIPS = ['Heavy things go in the bag first. Buns go on top. Always.', 'Aisle 3 has pickles. Aisle 3 also has spills. Coincidence?', 'Mist the lettuce, never the bread.', 'A closed freezer door is a happy freezer.', 'Kia runs the item counter. Ask her about potions.', 'The yellow rings on the floor are jobs. Ten of them.'];
  const nextJob = () => { const d = done(); return (GAMES.find(q => !d[q.k]) || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const plumMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'SHOPPING LIST HELPER', pick: () => { if (!busy) startGame('list', lastP); } },
      { text: 'WORK THE CHECKOUT', pick: () => { if (!busy) startGame('checkout', lastP); } }, { text: 'A MARKET TIP, PLEASE', pick: () => sayTo(pmT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(pmT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (J && GD[J.g].walk) { if (nearPlum(P)) { stop(); toast('JOB STOPPED · GOLD KEPT', 1.8); return true; } return GD[J.g].talk ? GD[J.g].talk(P) : false; }
    if (busy) return true; if (!inShop(P) && !inLot(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (!nearPlum(P)) return false; tone(1320, 0.05, 0.6); plumMenu(!talked++); return true; }
  function quit() { stop(); toast('JOB STOPPED · GOLD KEPT', 2); }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - -33.5, P.z - 80); G.visible = d < (touch ? 70 : 130); toastT -= dt; applyWear(fox); lastP = P;
    if (busy === 'job' && J) { const ok = GD[J.g].walk ? inShop(P) || inLot(P) : inShop(P); outT = ok ? 0 : outT + dt; if (outT > (GD[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB · GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GD[J.g].walk && fox) JW(fox, J.g);
    if (!G.visible) return; if (busy === 'job' && J) jobTick(dt, P); hintTick(t);
    const h = hour ? hour() : 12, night = h >= 19.5 || h < 6.5; BULB.visible = night; winM.color.set(night ? '#ffe2a8' : '#a9c7cf'); drawNeon(Math.floor(t * 3) % 10, night);
    // steam + mist (look)
    { const a = STEAM.geometry.attributes.position.array; steamD.forEach((s, i) => { const k = (t * 0.35 + s[2]) % 1; a[i * 3] = s[0] + Math.sin(t + i) * 0.12; a[i * 3 + 1] = 1.9 + k * 1.2; a[i * 3 + 2] = s[1] + Math.cos(t * 0.7 + i) * 0.25; }); STEAM.geometry.attributes.position.needsUpdate = true; STEAM.material.opacity = 0.28; }
    mistT -= dt; if (mistT <= 0) { mistT = 7; mistAt = [[-54.4, 70], [-48, 71.5], [-42.4, 71.5]][Math.random() * 3 | 0]; } if (mistT > 5.2 && mistAt) mistEmit(mistAt[0], mistAt[1] + rnd(-3, 3));
    { const a = MIST.geometry.attributes.position.array; mistD.forEach((m, i) => { if (m[3] <= 1) { m[3] += dt * 0.9; m[1] -= dt * 1.3; } a[i * 3] = m[0]; a[i * 3 + 1] = m[3] <= 1 ? m[1] : -50; a[i * 3 + 2] = m[2]; }); MIST.geometry.attributes.position.needsUpdate = true; }
    if (busy === 'job' && J && !GD[J.g].walk) { const f0 = PLUM0[2]; plum.rotation.y += Math.atan2(Math.sin(f0 - plum.rotation.y), Math.cos(f0 - plum.rotation.y)) * Math.min(1, dt * 3); }
    endClear -= dt; K.tick(dt, P, { inShop: inShop(P), busy: !!(busy && J && !GD[J.g].walk), near: Math.hypot(P.x - -28, P.z - 68), talking: false, clear: endClear > 0 ? [PLUM0[0], PLUM0[1] + 1.2, 3.4] : null }); }
  const API = { group: G, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GD[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), plum, GD, RINGS, toW,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), pick, card, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__market = API; return API;
}
