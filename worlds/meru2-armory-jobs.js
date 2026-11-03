// MERU 2.0 — s78 ARMORY POLISH + JOBS (Ben's picks): Bram's Armory [meruArmory] gets the interior rules, 8 job games and a back-yard TEST RANGE.
// Built in the armory's ORIGINAL frame (worlds/meru2-layout.js armory f 18..38 × 60..76, door N (28, 60); back door S (28, 76) → the yard z 76..104).
// meru2-walk.js adds API.group to the armory's moved group (RL.MV 'armory'), ticks it with the RL.P(mA) proxy P (also out in the yard), camFix in RL.camWrap.
// Yard colliders are returned in API.yardCols (old frame) and moved by the walk (the relocator only carries colliders inside the old footprint).
// KEEPER: BRAM (cheerful old smith, leather apron) = the shopKit keeper. ONE box menu: YES, PUT ME TO WORK! · BUY GEAR · FORGE A BLADE · THE TEST RANGE · TIP · GOODBYE.
// JOBS (gentle, stars by mistakes 0 = 3, ≤ 2 = 2): SHARPEN (grindstone: hold + slide, let go on gold) · FORGE (bellows heat → anvil on the beat → quench) ·
// POLISH (rub the rust, not the gold trim) · RESTOCK (drag each weapon to its outline) · FIT (measure, chart, pick S/M/L) · REPAIR (tap the dents, rivets in order) ·
// TEST RANGE (laser: red targets, not the blue friends; then 3 halberd throws in the gold band) · GUARD ORDER (walk: fetch 4 things, hand them over).
// PRIZES: 1st clear SMITH'S APRON (worn + Tailor wardrobe) · 3 jobs STAFF DISCOUNT (arDiscount, 20 % at Bram's) · all 8 = free Halberd + Reinforced Armor + GOLDEN ANVIL.
// LOOK: live forge embers + hammer sparks, pumping bellows, quench steam hiss, spinning grindstone, MERU GUARD banner over the counter, crossed halberds on the east wall.
import { jobWorker } from '../engine/job-worker.js?v=s645';   // s637 your fox stays visible + works during the job
import { shopKit, CHOICE_WORK, CHOICE_BYE } from './meru2-shopkit.js?v=s728';
import { dueAt, rosterFoxes, ROSTER } from './meru2-roster.js';
export function buildArmory({ THREE, scene, kit, cols, save, touch, sayTo, camera, wear, hour, isMuted, onShop }) { const JW = jobWorker(THREE);
  const X0 = 18, X1 = 38, Z0 = 60, Z1 = 76, YZ1 = 104;
  const G = new THREE.Group(); G.name = 'armory'; scene.add(G);
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
  const IRON = '#2a2e33', BRONZE = '#c0995c', OAK = '#6b4a32', LEATHER = '#5a3d26', STEEL2 = '#e7edf4', NAVY = '#26306b', tmpC = new THREE.Color();
  const yardCols = [], yRect = (a, b, c2, d) => yardCols.push({ f: [a, b, c2, d] }), yRing = (x, z, r) => yardCols.push({ c: [x, z, r] });
  const glowT = CT(32, 32, (g, W) => { const r = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2); r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.35, 'rgba(255,255,255,0.5)'); r.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = r; g.fillRect(0, 0, W, W); });
  const pts = (n, size, color, op, add = true) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3).fill(-50), 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ map: glowT, size, color, transparent: true, opacity: op, depthWrite: false, blending: add ? THREE.AdditiveBlending : THREE.NormalBlending })); p.frustumCulled = false; G.add(p); return p; };
  const leatherT = CT(64, 96, (g, w, h) => { g.fillStyle = LEATHER; g.fillRect(0, 0, w, h); g.fillStyle = '#4a311e'; g.fillRect(0, 0, w, 8); g.fillStyle = BRONZE; for (const [x, y] of [[8, 14], [56, 14], [8, 88], [56, 88]]) g.fillRect(x - 3, y - 3, 6, 6); g.fillStyle = '#3d2a1c'; g.fillRect(18, 44, 28, 18); });
  const apronMesh = () => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.66, 0.02), new THREE.MeshLambertMaterial({ map: leatherT })); m.position.set(0, 0.9, 0.38); m.rotation.x = -0.06; m.renderOrder = 2; return m; };
  // ================= weapons (one maker: long axis +y from the base, width along z, thin along x) =================
  const WH = { sword: 0.95, axe: 0.9, dagger: 0.5, mace: 0.74, shield: 0.64, hammer: 0.8 }, WN = { sword: 'SWORD', axe: 'AXE', dagger: 'DAGGER', mace: 'MACE', shield: 'SHIELD', hammer: 'WAR HAMMER' };
  function makeWeapon(k) { const g = new THREE.Group(), bx = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), LM(c)); m.position.set(x, y, z); g.add(m); return m; };
    if (k === 'sword') { bx(0.035, 0.16, 0.035, LEATHER, 0, 0.08, 0); bx(0.04, 0.04, 0.3, BRONZE, 0, 0.18, 0); bx(0.015, 0.75, 0.07, STEEL2, 0, 0.575, 0); }
    else if (k === 'dagger') { bx(0.03, 0.12, 0.03, LEATHER, 0, 0.06, 0); bx(0.03, 0.03, 0.18, BRONZE, 0, 0.135, 0); bx(0.012, 0.35, 0.05, STEEL2, 0, 0.325, 0); }
    else if (k === 'axe') { bx(0.04, 0.9, 0.04, OAK, 0, 0.45, 0); bx(0.02, 0.24, 0.24, '#cbd5e1', 0, 0.74, 0.12); }
    else if (k === 'hammer') { bx(0.04, 0.8, 0.04, OAK, 0, 0.4, 0); bx(0.1, 0.14, 0.28, IRON, 0, 0.72, 0); }
    else if (k === 'mace') { bx(0.035, 0.58, 0.035, OAK, 0, 0.29, 0); const h = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), LM(IRON)); h.position.y = 0.64; g.add(h); for (const [a, b] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) bx(0.04, 0.04, 0.04, '#cbd5e1', a * 0.1, 0.64, b * 0.1); bx(0.04, 0.04, 0.04, '#cbd5e1', 0, 0.75, 0); }
    else if (k === 'shield') { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.04, 22), LM(RED)); d.rotation.z = Math.PI / 2; d.position.y = 0.32; g.add(d); const b = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), LM(BRONZE)); b.position.set(0.03, 0.32, 0); g.add(b); }
    g.userData.k = k; return g; }
  function makeHalberd() { const g = new THREE.Group(), bx = (w, h, d, c, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), LM(c)); m.position.set(x, y, z); g.add(m); return m; };
    bx(0.05, 1.7, 0.05, OAK, 0, 0, 0); bx(0.3, 0.26, 0.02, '#cbd5e1', 0.14, 0.62, 0); bx(0.03, 0.36, 0.02, STEEL2, 0, 0.98, 0); return g; }
  // ================= SHOP DRESSING (inside, old frame) =================
  // RESTOCK pegboard on the west wall behind the counter (faces +x) + crate
  const RB = { x: 18.06, y: 1.85, z: 73.4, w: 3.8, h: 2.3 }, SLOTS = [1.95, 0.85].flatMap(y => [72.25, 73.4, 74.55].map(z => ({ y, z }))), IDLE = ['sword', 'axe', 'hammer', 'dagger', 'mace', 'shield'];
  const boardTex = CT(768, 464, () => {});
  function drawBoard(types) { const g = boardTex.userData.c.getContext('2d'), W = 768, H = 464, PX = W / RB.w, PY = H / RB.h, cx = z => (RB.z + RB.w / 2 - z) * PX, cy = y => (RB.y + RB.h / 2 - y) * PY;
    g.fillStyle = '#b8955f'; g.fillRect(0, 0, W, H); g.fillStyle = '#8a6a42'; for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) g.fillRect(x - 2, y - 2, 4, 4); g.strokeStyle = INK; g.lineWidth = 10; g.strokeRect(5, 5, W - 10, H - 10);
    const R = (z0, z1, y0, y1) => { g.fillRect(cx(z1), cy(y1), (z1 - z0) * PX, (y1 - y0) * PY); g.strokeRect(cx(z1), cy(y1), (z1 - z0) * PX, (y1 - y0) * PY); }, C = (z, y, r) => { g.beginPath(); g.arc(cx(z), cy(y), r * PX, 0, 7); g.fill(); g.stroke(); };
    SLOTS.forEach((s, i) => { const k = types[i], z = s.z, b = s.y; g.fillStyle = '#f3f2f2'; g.strokeStyle = INK; g.lineWidth = 3;
      if (k === 'sword') { R(z - 0.04, z + 0.04, b + 0.19, b + 0.97); R(z - 0.17, z + 0.17, b + 0.15, b + 0.21); R(z - 0.03, z + 0.03, b - 0.01, b + 0.16); }
      else if (k === 'dagger') { R(z - 0.035, z + 0.035, b + 0.14, b + 0.52); R(z - 0.1, z + 0.1, b + 0.11, b + 0.16); R(z - 0.025, z + 0.025, b - 0.01, b + 0.12); }
      else if (k === 'axe') { R(z - 0.03, z + 0.03, b - 0.01, b + 0.91); R(z, z + 0.26, b + 0.61, b + 0.87); }
      else if (k === 'hammer') { R(z - 0.03, z + 0.03, b - 0.01, b + 0.8); R(z - 0.15, z + 0.15, b + 0.64, b + 0.8); }
      else if (k === 'mace') { R(z - 0.03, z + 0.03, b - 0.01, b + 0.58); C(z, b + 0.64, 0.12); }
      else if (k === 'shield') C(z, b + 0.32, 0.34);
      g.fillStyle = INK; g.font = '900 20px Archivo, sans-serif'; g.textBaseline = 'top'; g.fillText(WN[k], cx(z + 0.5) + 2, cy(b - 0.03)); });
    boardTex.needsUpdate = true; }
  drawBoard(IDLE); plane(boardTex, RB.w, RB.h, RB.x, RB.y, RB.z, Math.PI / 2); S.box(0.05, RB.h + 0.1, RB.w + 0.1, INK, 18.03, RB.y, RB.z);
  const idleG = new THREE.Group(); G.add(idleG); SLOTS.forEach((s, i) => { const w = makeWeapon(IDLE[i]); w.position.set(18.2, s.y, s.z); idleG.add(w); });
  S.box(0.62, 0.5, 0.7, OAK, 18.75, 0.25, 72.0); for (const y of [0.1, 0.42]) S.box(0.64, 0.05, 0.72, IRON, 18.75, y, 72.0); rect(18.4, 19.1, 71.6, 72.4);
  const HOLD4 = V(18.75, 0.75, 72.45);
  // GRINDSTONE (spins; faster while you grind)
  const GWX = 22.4, GWY = 0.95, GWZ = 74.8, BLY = 1.31, BLZ = 74.56;
  for (const s of [-1, 1]) { S.box(0.08, 1.0, 0.08, OAK, GWX + s * 0.2, 0.5, GWZ - 0.2); S.box(0.08, 1.0, 0.08, OAK, GWX + s * 0.2, 0.5, GWZ + 0.2); S.box(0.06, 0.06, 0.5, OAK, GWX + s * 0.2, 0.98, GWZ); }
  S.box(0.7, 0.25, 0.5, OAK, GWX, 0.3, GWZ); S.box(0.62, 0.02, 0.42, '#2f6f8f', GWX, 0.43, GWZ); S.box(0.5, 0.04, 0.12, OAK, GWX, 0.06, GWZ - 0.42); S.cyl(0.025, 0.025, 0.5, IRON, GWX, GWY, GWZ, 8, 0, Math.PI / 2); rect(GWX - 0.4, GWX + 0.4, GWZ - 0.35, GWZ + 0.3);
  const wheelG = new THREE.Group(); wheelG.position.set(GWX, GWY, GWZ); G.add(wheelG);
  { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.12, 24), LM('#9a948a')); w.rotation.z = Math.PI / 2; wheelG.add(w); for (const a of [0, Math.PI / 2]) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.04, 0.7), LM('#6b665e')); sp.rotation.x = a; wheelG.add(sp); } }
  // REPAIR bench + tilted shield (dents + strap live on it)
  const SHX = 24.6, SHY = 1.33, SHZ = 74.85;
  S.box(1.3, 0.86, 0.7, OAK, SHX, 0.43, 74.95); S.box(1.36, 0.06, 0.76, WOOD, SHX, 0.89, 74.95); S.box(0.3, 0.05, 0.06, IRON, SHX - 0.45, 0.94, 74.75, 0.4); S.box(0.06, 0.06, 0.2, IRON, SHX + 0.42, 0.95, 74.7); S.box(0.03, 0.03, 0.3, OAK, SHX + 0.42, 0.95, 74.9);
  for (const s of [-1, 1]) S.box(0.05, 0.5, 0.05, IRON, SHX + s * 0.3, 1.15, 75.05, 0, -0.45); rect(SHX - 0.68, SHX + 0.68, 74.58, 75.32);
  const shieldG = new THREE.Group(); shieldG.position.set(SHX, SHY, SHZ); shieldG.rotation.x = 0.45; G.add(shieldG);
  { const d = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 28), LM(NAVY)); d.rotation.x = Math.PI / 2; shieldG.add(d); const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 28), LM(IRON)); shieldG.add(rim); const boss = new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), LM(BRONZE)); boss.position.z = -0.03; shieldG.add(boss); }
  const strapM = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 0.012), LM(LEATHER)); strapM.position.set(0, -0.05, -0.032); shieldG.add(strapM);
  for (const x of [-0.27, -0.09, 0.09, 0.27]) { const h = new THREE.Mesh(new THREE.CircleGeometry(0.014, 8), new THREE.MeshBasicMaterial({ color: INK })); h.position.set(x, 0, -0.007); h.rotation.y = Math.PI; strapM.add(h); }
  // FORGE extras: BELLOWS (pump) + QUENCH trough (steam)
  const FIRE = V(36.0, 1.13, 74.45), ANV = V(33.7, 0.79, 73.4), TRO = { x: 37.3, z: 72.7, y: 0.6 }, HBAND = [0.7, 0.88];
  const BEL = new THREE.Group(); BEL.position.set(34.75, 0, 74.55); G.add(BEL); let belTop, belSkin;
  { const add = (geo, c, x, y, z, par = BEL) => { const m = new THREE.Mesh(geo, LM(c)); m.position.set(x, y, z); par.add(m); return m; };
    for (const [a, b] of [[-0.3, -0.15], [-0.3, 0.15], [0.3, -0.15], [0.3, 0.15]]) add(new THREE.BoxGeometry(0.05, 0.5, 0.05), OAK, a, 0.25, b);
    add(new THREE.BoxGeometry(0.75, 0.04, 0.42), OAK, 0, 0.52, 0); const nz = add(new THREE.CylinderGeometry(0.03, 0.045, 0.3, 8), BRONZE, 0.5, 0.56, 0); nz.rotation.z = Math.PI / 2;
    belTop = new THREE.Group(); belTop.position.set(0.37, 0.56, 0); BEL.add(belTop); add(new THREE.BoxGeometry(0.75, 0.04, 0.42), OAK, -0.375, 0, 0, belTop); add(new THREE.BoxGeometry(0.3, 0.03, 0.05), OAK, -0.88, 0, 0, belTop);
    belSkin = add(new THREE.BoxGeometry(0.66, 1, 0.38), LEATHER, -0.02, 0.6, 0); }
  rect(34.3, 35.25, 74.3, 74.8);
  S.box(0.9, 0.6, 1.1, OAK, TRO.x, 0.3, TRO.z); for (const z of [TRO.z - 0.4, TRO.z + 0.4]) S.box(0.92, 0.06, 0.06, IRON, TRO.x, 0.45, z); S.box(0.8, 0.02, 1.0, '#2a5f7a', TRO.x, 0.59, TRO.z); rect(TRO.x - 0.45, TRO.x + 0.45, TRO.z - 0.55, TRO.z + 0.55);
  // MERU GUARD banner over the counter (sways) + crossed halberds + shield on the east wall
  const banT = CT(256, 400, (g, W, H) => { g.fillStyle = RED; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(W / 2, H - 60); g.lineTo(0, H); g.closePath(); g.fill(); g.strokeStyle = BRONZE; g.lineWidth = 12; g.stroke();
    g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(W / 2, 140, 70, 0, 7); g.fill(); g.fillStyle = RED; g.font = '900 104px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', W / 2, 146); g.fillStyle = '#ffffff'; g.font = '900 40px Archivo, sans-serif'; g.fillText('MERU', W / 2, 252); g.fillText('GUARD', W / 2, 296); });
  const banner = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 2.03), new THREE.MeshLambertMaterial({ map: banT, side: THREE.DoubleSide, transparent: true, alphaTest: 0.3 })); banner.geometry.translate(0, -1.0, 0); banner.position.set(28, 5.72, 70.1); G.add(banner);
  S.box(1.5, 0.05, 0.05, IRON, 28, 5.75, 70.1); for (const s of [-1, 1]) S.box(0.015, 1.15, 0.015, IRON, 28 + s * 0.7, 6.32, 70.1);
  { const XH = new THREE.Group(); XH.position.set(37.9, 3.3, 65.0); XH.rotation.y = -Math.PI / 2; G.add(XH); const add = (geo, c, x, y, z, rz = 0) => { const m = new THREE.Mesh(geo, LM(c)); m.position.set(x, y, z); m.rotation.z = rz; XH.add(m); return m; };
    for (const s of [-1, 1]) { const a = s * 0.4, sn = Math.sin(a), cs = Math.cos(a); add(new THREE.BoxGeometry(0.06, 3.0, 0.05), OAK, 0, 0, 0.03, a); add(new THREE.BoxGeometry(0.34, 0.3, 0.02), '#cbd5e1', -sn * 1.32 + cs * 0.17 * -s, cs * 1.32 + sn * 0.17 * -s, 0.06, a); add(new THREE.BoxGeometry(0.03, 0.4, 0.02), STEEL2, -sn * 1.62, cs * 1.62, 0.06, a); }
    const d = add(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 22), NAVY, 0, -0.1, 0.1); d.rotation.x = Math.PI / 2; const b = add(new THREE.SphereGeometry(0.08, 10, 8), BRONZE, 0, -0.1, 0.14); }
  // job rings (floor paint)
  const RINGS = { sharpen: [22.4, 73.5], forge: [32.6, 72.3], polish: [33.9, 65.0], restock: [19.9, 73.4], fit: [23.4, 65.0], repair: [24.6, 73.5], range: [28.0, 78.6], order: [26.6, 64.4] };
  for (const [x, z] of Object.values(RINGS)) { S.cyl(0.5, 0.5, 0.012, YEL, x, 0.085, z, 22); S.cyl(0.42, 0.42, 0.014, INK, x, 0.087, z, 22); }
  // ================= THE YARD: TEST RANGE (old z 76..104, behind the new back door) =================
  { const t = CT(128, 256, (g, W, H) => { g.fillStyle = '#d9c08a'; g.fillRect(0, 0, W, H); for (let i = 0; i < 900; i++) { g.fillStyle = Math.random() < 0.5 ? '#c9ae78' : '#e6d19e'; g.fillRect(Math.random() * W, Math.random() * H, 2, 2); } });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(18.4, 27.4), new THREE.MeshLambertMaterial({ map: t })); m.rotation.x = -Math.PI / 2; m.position.set(28, 0.035, 90.1); G.add(m); }
  S.box(17.6, 0.02, 0.14, RED, 28, 0.05, 79.3); S.box(2.4, 0.02, 1.4, '#7a5a3a', 28, 0.045, 78.6);
  for (let z = 76.6; z <= 103.9; z += 2.27) for (const x of [18.7, 37.3]) S.box(0.12, 1.3, 0.12, OAK, x, 0.65, z);
  for (let x = 18.7; x <= 37.31; x += 2.08) S.box(0.12, 1.3, 0.12, OAK, x, 0.65, 103.85);
  for (const y of [0.55, 1.1]) { for (const x of [18.7, 37.3]) S.box(0.06, 0.1, 27.3, OAK, x, y, 90.25); S.box(18.6, 0.1, 0.06, OAK, 28, y, 103.85); }
  yRect(18.5, 18.9, 76.2, 104.1); yRect(37.1, 37.5, 76.2, 104.1); yRect(18.5, 37.5, 103.65, 104.05);
  for (let i = 0; i < 8; i++) { const x = 20 + i * 2.0; S.box(1.9, 0.9, 1.0, i % 2 ? '#d9b46a' : '#cfa95c', x, 0.45, 101.7); if (i % 3 !== 1) S.box(1.9, 0.9, 1.0, '#d9b46a', x + 0.3, 1.35, 101.75); } yRect(18.9, 37.1, 101.15, 102.25);
  plane(label('TEST RANGE', RED, '#ffffff', 512, 128, 72), 2.2, 0.55, 21.4, 2.0, 77.63, Math.PI); S.box(2.3, 0.65, 0.04, INK, 21.4, 2.0, 77.67); for (const s of [-1, 1]) S.box(0.08, 2.3, 0.08, INK, 21.4 + s * 1.0, 1.15, 77.7); yRect(20.3, 22.5, 77.55, 77.85);
  S.box(1.4, 0.08, 0.5, OAK, 34.6, 0.3, 77.5); S.box(1.4, 0.08, 0.1, OAK, 34.6, 1.5, 77.7); for (const s of [-1, 1]) S.box(0.08, 1.55, 0.08, OAK, 34.6 + s * 0.65, 0.78, 77.6);
  for (let i = 0; i < 3; i++) { const h = makeHalberd(); h.position.set(34.2 + i * 0.4, 1.0, 77.55); h.rotation.x = -0.18; G.add(h); } yRect(33.8, 35.4, 77.2, 77.9);
  const LAMPS_Y = [[19.5, 78.4], [36.5, 78.4]]; for (const [x, z] of LAMPS_Y) { S.box(0.12, 3.2, 0.12, INK, x, 1.6, z); S.box(0.5, 0.06, 0.06, INK, x + (x < 28 ? 0.22 : -0.22), 3.15, z); GLO.box(0.22, 0.26, 0.22, '#ffd27a', x + (x < 28 ? 0.42 : -0.42), 2.98, z); yRing(x, z, 0.2); }
  const LMP = pts(2, 1.6, '#ffd38a', 0.9); LMP.geometry.attributes.position.array.set([19.92, 2.95, 78.4, 36.08, 2.95, 78.4]); LMP.visible = false;
  // targets (pop up on a hinge at the foot of the post)
  const tgtTex = (bg, fn) => CT(256, 256, (g, W) => { g.fillStyle = bg; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 2, 0, 7); g.fill(); fn(g, W); g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.arc(W / 2, W / 2, W / 2 - 6, 0, 7); g.stroke(); });
  const redT = tgtTex('#ffffff', (g, W) => { for (const [r, c] of [[110, RED], [80, '#ffffff'], [52, RED], [24, YEL]]) { g.fillStyle = c; g.beginPath(); g.arc(W / 2, W / 2, r, 0, 7); g.fill(); } });
  const blueT = tgtTex('#2f6fd6', (g, W) => { g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(78, 80); g.lineTo(98, 40); g.lineTo(112, 84); g.lineTo(144, 84); g.lineTo(158, 40); g.lineTo(178, 80); g.lineTo(170, 140); g.lineTo(128, 168); g.lineTo(86, 140); g.closePath(); g.fill(); g.font = '900 34px Archivo, sans-serif'; g.textAlign = 'center'; g.fillText('FRIEND', W / 2, 212); });
  const TPOS = [[22.5, 86], [26, 90.5], [31, 88], [35, 92.5], [24, 96], [29.5, 99], [33.5, 97], [20.6, 92]];
  const TG = TPOS.map(([x, z]) => { const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g); const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.0, 0.08), LM(OAK)); post.position.y = 0.5; g.add(post);
    const back = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.05, 22), LM(INK)); back.rotation.x = Math.PI / 2; back.position.set(0, 1.25, 0.03); g.add(back);
    const mat = new THREE.MeshBasicMaterial({ map: redT }), board = new THREE.Mesh(new THREE.CircleGeometry(0.45, 24), mat); board.position.set(0, 1.25, -0.002); board.rotation.y = Math.PI; g.add(board); yRing(x, z, 0.2);
    return { g, board, mat, x, z, up: 1, want: 1, friend: false, spin: 0, life: 0 }; });
  const THR = [{ i: 0, band: [0.14, 0.3], n: 'NEAR' }, { i: 3, band: [0.5, 0.67], n: 'MID' }, { i: 5, band: [0.79, 0.95], n: 'FAR' }], MUZ = V(28.3, 1.45, 79.4);
  // ---------- merge ----------
  G.add(new THREE.Mesh(S.geo(), new THREE.MeshLambertMaterial({ vertexColors: true })));
  G.add(new THREE.Mesh(GLO.geo(), new THREE.MeshBasicMaterial({ vertexColors: true })));
  // ---------- particles: sparks, steam, embers; a shared hammer ----------
  const SPN = touch ? 40 : 80, SPK = pts(SPN, 0.07, '#ffc070', 1), spD = [...Array(SPN)].map(() => ({ x: 0, y: -50, z: 0, vx: 0, vy: 0, vz: 0, l: 0 }));
  const sparkEmit = (x, y, z, n, vz = 0) => { for (const s of spD) { if (n <= 0) break; if (s.l > 0) continue; Object.assign(s, { x, y, z, vx: rnd(-1.2, 1.2), vy: rnd(0.6, 2.2), vz: vz + rnd(-1.2, 1.2), l: rnd(0.25, 0.55) }); n--; } };
  const STN = touch ? 20 : 36, STM = pts(STN, 0.55, '#ffffff', 0.45, false), stD = [...Array(STN)].map(() => ({ x: 0, y: -50, z: 0, l: 0 }));
  const steamEmit = (x, z) => { for (const s of stD) Object.assign(s, { x: x + rnd(-0.35, 0.35), y: 0.7 + rnd(0, 0.2), z: z + rnd(-0.4, 0.4), l: rnd(0.8, 1.8) }); };
  const EMN = 16, EMB = pts(EMN, 0.14, '#ff8a3a', 0.9), emD = [...Array(EMN)].map(() => [35.5 + Math.random() * 1.6, 74.15 + Math.random() * 0.9, Math.random() * 6]);
  const HAM = new THREE.Group(); { const h = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.08), LM(IRON)); HAM.add(h); const s = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.42), LM(OAK)); s.position.z = -0.22; HAM.add(s); } HAM.visible = false; G.add(HAM);
  let hamT = 0; const hamAt = V(); const hamHit = at => { hamT = 0.2; hamAt.copy(at); };
  let wheelSpin = 1.2, pumpK = 0, grindT = 0;
  // ================= BRAM (cheerful old smith) + Kit =================
  const bram = kit.makeFox({ key: 'bramKeeper', torso: ['#cbd5e1', '#7c8794', '#3f4854'], outfit: 'vest', mood: 'happy', look: { elder: 1, fur: '#b8743a', furDark: '#7a4a24', muzzle: '#f3e6d6' } });
  { const P = bram.userData && bram.userData.P; if (P && P.body) P.body.add(apronMesh()); }
  const BRAM0 = [28, 72.2, Math.PI]; bram.position.set(BRAM0[0], 0, BRAM0[1]); bram.rotation.y = BRAM0[2]; G.add(bram); ringC(BRAM0[0], BRAM0[1], 0.5);
  const bmT = { key: 'bramKeeper', name: 'Bram', role: 'ARMORY', obj: bram, ry: BRAM0[2], r: 6 }, endT = { key: 'bramEnd', name: 'Bram', role: 'ARMORY', obj: bram, ry: BRAM0[2], r: 6 };
  const ln = text => ({ who: 'bram', role: 'ARMORY', text });
  const GAMES = [{ k: 'sharpen', name: 'Sharpen', color: '#9aa4b0', gold: 22 }, { k: 'forge', name: 'Forge a Blade', color: '#e0442a', gold: 30 }, { k: 'polish', name: 'Polish Armour', color: '#cbd5e1', gold: 22 }, { k: 'restock', name: 'Restock the Wall', color: '#b8955f', gold: 22 },
    { k: 'fit', name: 'Fit a Customer', color: NAVY, gold: 26 }, { k: 'repair', name: 'Repair a Shield', color: '#2f6fd6', gold: 24 }, { k: 'range', name: 'Test Range', color: RED, gold: 30 }, { k: 'order', name: 'Guard Order', color: '#5a6470', gold: 28, walk: true }];
  const GN = Object.fromEntries(GAMES.map(q => [q.k, q]));
  const UNI = ['guardFlint', 'guardAsh', 'guardBrick', 'officerRusty', 'officerVixen', 'chiefEmber', 'spritz'], UR = UNI.map(k => ROSTER.find(r => r.key === k)).filter(Boolean);
  const rFox = rosterFoxes({ THREE, kit, cap: 4 }), cFox = rosterFoxes({ THREE, kit, cap: 3 }); let endClear = 0, custN = 0;
  const pickUni = () => UR[(custN++ + (Math.random() * 2 | 0)) % UR.length];
  const visitors = h => dueAt('armory', h).filter(e => UNI.includes(e.r.key)).map(e => (e.r.key.startsWith('guard') ? { ...e, kind: 'browse' } : e));
  const K = shopKit({ THREE, G, scene, kit, save, camera, touch, hour, isMuted, prefix: 'ar', color: '#3f4854', boardTitle: "Bram's best", toWorld: toW,
    room: { X0, X1, Z0, Z1 }, door: [28, 60.6], keeper: bram, keeperRy: BRAM0[2], games: GAMES, board: { x: 37.9, y: 2.95, z: 61.75, ry: -Math.PI / 2, w: 1.3 }, hiring: { x: 24.4, z: 61.2, ry: Math.PI / 2 }, hiringLine: 'WALK UP \u00b7 START WORK',
    sun: [{ x: 28, z: 61.6, w: 3.6, d: 2.2 }, { x: 21.8, z: 62.6, w: 2.6, d: 1.8 }, { x: 34.2, z: 62.6, w: 2.6, d: 1.8 }, { x: 28, z: 74.8, w: 3.4, d: 1.6 }],
    lamps: [23.5, 32.5].flatMap(x => [...Array(6).keys()].map(k => [x + Math.cos(k / 6 * Math.PI * 2) * 0.7, 4.02, 65.3 + Math.sin(k / 6 * Math.PI * 2) * 0.7])),
    browse: [[21.9, 64.9, -Math.PI / 2], [33.9, 66.8, Math.PI / 2], [30.2, 68.9, 0], [20.6, 69.2, -Math.PI / 2], [34.2, 62.5, Math.PI]], slots: 2, visitors, visitorFox: r => rFox(r, G),
    onVisit: (e, inside) => { if (inside && !busy) toast(e.r.name.toUpperCase() + ' \u00b7 ' + e.r.role.toUpperCase() + ' \u00b7 ' + e.why, 2.4); },
    clock: { x: 18.06, y: 3.2, z: 66.2, ry: Math.PI / 2 } });
  // ================= state, sound, UI =================
  let toastTxt = '', toastT = 0, talked = 0, busy = null, J = null;
  const toast = (t, s = 2.2) => { toastTxt = t; toastT = s; };
  let ac = null; const tone = (f, k = 0.06, len = 0.5, type = 'sine', at = 0) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const t = ac.currentTime + at, o = ac.createOscillator(), gn = ac.createGain(); o.type = type; o.frequency.value = f; gn.gain.setValueAtTime(k, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(gn).connect(ac.destination); o.start(t); o.stop(t + len); } catch (e) {} };
  const ding = () => { tone(1568, 0.08, 1.1); tone(2093, 0.05, 1.1); }, pop = () => tone(660, 0.05, 0.12, 'triangle'), beep = () => tone(1800, 0.06, 0.12, 'square'), nope = () => tone(196, 0.05, 0.25, 'square'), coin = (at = 0) => { tone(2400, 0.04, 0.15, 'triangle', at); tone(3200, 0.03, 0.12, 'triangle', at + 0.03); };
  const card = document.createElement('div'); card.style.cssText = 'position:fixed;left:12px;top:244px;width:min(58vw,260px);overflow:hidden;background:#f3f2f2;border:2px solid #201e1d;font-family:Archivo,sans-serif;color:#201e1d;z-index:30;display:none;pointer-events:none;box-sizing:border-box';
  const pick = document.createElement('div'); pick.style.cssText = card.style.cssText.replace(/pointer-events:\s*none/, 'pointer-events:auto'); document.body.appendChild(card); document.body.appendChild(pick); let cardKey = '';
  const fitCard = () => { const short = innerHeight < 500, mid = !short && innerHeight < 720; for (const el of [card, pick]) { el.style.top = short ? Math.round(96 / 0.85) + 'px' : mid ? Math.round(244 / 0.82) + 'px' : '244px'; el.style.maxHeight = short ? 'calc(100vh - 150px)' : mid ? 'calc((100vh - 364px) / 0.82)' : 'calc(100vh - 380px)'; el.style.width = short ? 'min(34vw, 240px)' : 'min(58vw, 260px)'; el.style.zoom = short ? '0.85' : mid ? '0.82' : ''; } pick.style.overflowY = 'auto'; }; fitCard(); addEventListener('resize', fitCard);
  const row = (sw, txt, right, ok) => '<div style="display:flex;gap:8px;align-items:center;padding:4px 0;border-top:1px solid #cfcac3"><span style="width:14px;height:14px;background:' + sw + ';border:2px solid #201e1d;flex:none"></span><span style="flex:1;min-width:0;font-weight:800;font-size:14px">' + txt + '</span><span style="font-weight:900;font-size:14px;white-space:nowrap;color:' + (ok ? '#2f7a4a' : '#201e1d') + '">' + right + '</span></div>';
  const head = (l, r) => '<div style="display:flex;justify-content:space-between;align-items:center;background:#3f4854;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;gap:2px 10px;flex-wrap:wrap"><span style="white-space:nowrap">' + l + '</span><span style="white-space:nowrap">' + r + '</span></div>';
  const foot = (next, walk) => '<div style="display:flex;justify-content:space-between;gap:8px;background:#201e1d;color:#ffd23a;padding:5px 10px;font-size:12px;font-weight:900"><span>' + next + '</span><span style="color:#f3f2f2;white-space:nowrap">' + (walk ? 'BRAM · STOP' : (touch ? '3' : 'SPACE') + ' · STOP') + '</span></div>';
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
  const hitX = x => ray().intersectPlane(new THREE.Plane(V(1, 0, 0), -x), hitP) ? hitP.clone() : null;
  const noise = (len = 0.5, k = 0.05, f = 3000) => { if (isMuted && isMuted()) return; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); const n = ac.sampleRate * len | 0, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ac.createBufferSource(); s.buffer = b; const fl = ac.createBiquadFilter(); fl.type = 'highpass'; fl.frequency.value = f; const gn = ac.createGain(); gn.gain.value = k; s.connect(fl).connect(gn).connect(ac.destination); s.start(); } catch (e) {} };
  const clank = (k = 1) => { tone(1500, 0.06 * k, 0.25, 'square'); tone(3100, 0.03 * k, 0.5, 'triangle'); }, thunk = () => tone(120, 0.09, 0.18, 'square'), hiss = () => { noise(1.1, 0.07, 3500); tone(330, 0.02, 0.6, 'sine'); }, whoosh = () => noise(0.35, 0.03, 800);
  // ================= prizes + smith's apron =================
  const APRON = { outfit: 'vest', torso: [LEATHER, BRONZE, '#2a1f17'], name: "SMITH'S APRON" };
  const apronOn = () => { const o = save.data && save.data.outfit; return !!(o && o.name === APRON.name); };
  const done = () => save.stat('arDone', null) || {};
  function giveGift() { save.setStat('arClears', save.stat('arClears', 0) + 1); const d = done(), nd = GAMES.filter(q => d[q.k]).length;
    if (!save.stat('arApron', false)) { save.setStat('arApron', true); const have = save.stat('tailorOutfits', null), list = Array.isArray(have) ? have : []; if (!list.some(x => x.name === APRON.name)) save.setStat('tailorOutfits', [...list, APRON]);
      save.setStat('arPrevOutfit', save.data && save.data.outfit ? save.data.outfit : null); save.setOutfit(APRON); wear && wear(APRON); return 'apron'; }
    if (nd >= 3 && !save.stat('arDiscount', false)) { save.setStat('arDiscount', true); return 'discount'; }
    if (nd >= GAMES.length && !save.stat('arAll', false)) { save.setStat('arAll', true); save.give('goldenAnvil'); const miss0 = ['halberd', 'reinforced'].filter(k => !(save.flag && save.flag('gear.' + k)));
      miss0.forEach(k => { save.setFlag('gear.' + k); save.give(k); }); if (!miss0.length) save.addGold(80); return miss0.length ? 'all' : 'allGold'; } return null; }
  let worn = null; function applyWear(fox) { const P = fox && fox.userData && fox.userData.P; if (!P || !P.body) return; const on = apronOn();
    if (worn && worn.on === on && worn.fox === fox && (!worn.m || worn.m.parent === P.body)) return; if (worn && worn.m && worn.m.parent) worn.m.parent.remove(worn.m); worn = { on, fox, m: null }; if (!on) return; const m = apronMesh(); P.body.add(m); worn.m = m; }
  // ================= GAME 1: SHARPEN (grindstone: hold + slide, let go on the gold) =================
  const BLADES = [{ n: 5, name: 'SWORD', L: 0.8 }, { n: 3, name: 'DAGGER', L: 0.42 }], SBAND = [0.7, 0.92];
  const G1 = {
    begin() { J.bi = 0; this.blade(); toast('HOLD TO GRIND \u00b7 SLIDE THE BLADE \u00b7 LET GO ON GOLD', 2.6); },
    blade() { const B = BLADES[J.bi], sl = B.L / B.n, g = own(new THREE.Group()); g.position.set(GWX + B.L / 2 - sl / 2, BLY, BLZ); g.rotation.x = 0.12;
      J.sec = [...Array(B.n)].map((_, i) => { const m = new THREE.Mesh(new THREE.BoxGeometry(sl - 0.004, 0.012, 0.07), new THREE.MeshLambertMaterial({ color: '#6b737b' })); m.position.x = -B.L / 2 + (i + 0.5) * sl; g.add(m);
        const e = new THREE.Mesh(new THREE.BoxGeometry(sl - 0.004, 0.008, 0.014), new THREE.MeshBasicMaterial({ color: '#4a4f57' })); e.position.set(m.position.x, 0, 0.04); g.add(e); return { m, e, v: 0, lock: false, hot: 0 }; });
      const gd = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.05, 0.22), LM(BRONZE)); gd.position.x = B.L / 2 + 0.015; g.add(gd); const gr = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.04, 0.04), LM(LEATHER)); gr.position.x = B.L / 2 + 0.115; g.add(gr);
      J.bl = g; J.B = B; J.sl = sl; J.cs = 0; J.sub = 'grind'; },
    contact() { return clamp(Math.floor((GWX - J.bl.position.x + J.B.L / 2) / J.sl), 0, J.B.n - 1); },
    lockIf(i) { const s = J.sec[i]; if (!s || s.lock || s.v < SBAND[0] || s.v > SBAND[1]) return; s.lock = true; tone(1760, 0.05, 0.3, 'triangle'); this.paint();
      if (J.sec.every(q => q.lock)) { ding(); addGold(4 * J.B.n); if (++J.bi < BLADES.length) NEXT('swap', () => { J.bl.visible = false; this.blade(); }, 0.9); else NEXT('done', finishGame, 1.0); } },
    paint() { for (const s of J.sec) { s.m.material.color.set('#6b737b').lerp(tmpC.set('#e7edf4'), clamp(s.v / SBAND[0], 0, 1)); s.e.material.color.set(s.lock ? YEL : s.hot > 0 ? '#4a6ad8' : s.v >= SBAND[0] ? '#fff2b0' : '#4a4f57'); } },
    press() { const p = hitZ(BLZ); J.p0 = p ? p.x : 0; J.b0 = J.bl.position.x; },
    drag() { if (!ptr.down || J.sub !== 'grind') return; const p = hitZ(BLZ); if (!p) return; const B = J.B; J.bl.position.x = clamp(J.b0 + (p.x - J.p0), GWX - B.L / 2 + J.sl * 0.5, GWX + B.L / 2 - J.sl * 0.5); const c = this.contact(); if (c !== J.cs) { this.lockIf(J.cs); J.cs = c; } },
    release() { if (J.sub === 'grind') this.lockIf(this.contact()); },
    tick(dt) { if (J.sub !== 'grind') return; const c = this.contact(), s = J.sec[c]; J.cs = c; for (const q of J.sec) if (q.hot > 0) q.hot -= dt;
      if (ptr.down && !s.lock) { s.v += dt * 0.5; wheelSpin = 9; sparkEmit(GWX, BLY - 0.02, BLZ + 0.06, 2, -1); grindT -= dt; if (grindT <= 0) { grindT = 0.11; noise(0.1, 0.03, 2500); }
        if (s.v > 1) { s.v = 0.35; s.hot = 0.8; miss('BRAM: "TOO HOT! THE EDGE WENT BLUE. GRIND IT AGAIN."'); } }
      this.paint(); },
    card() { const s = J.sec[J.cs]; return [s && s.lock ? 'SLIDE TO A DULL BIT' : 'HOLD \u00b7 LET GO ON GOLD', lab(J.B.name + ' ' + (J.bi + 1) + ' / ' + BLADES.length) + meter(s ? s.v : 0, '#9aa4b0', SBAND) + lst(J.sec.map((q, i) => ['#cbd5e1', 'EDGE ' + (i + 1), q.lock ? '\u2713' : Math.round(q.v * 100) + '%', q.lock])), J.bi + '_' + J.cs + '_' + J.sec.map(q => (q.lock ? 'L' : Math.round(q.v * 20))).join('')]; },
    hint() { const s = J.sec[J.cs]; if (!s.lock) return [V(GWX, BLY, BLZ), s.v >= SBAND[0] ? 'LET GO' : 'HOLD']; const i = J.sec.findIndex(q => !q.lock); if (i < 0) return null;
      const want = GWX - (-J.B.L / 2 + (i + 0.5) * J.sl), a = scrW(V(J.bl.position.x, BLY, BLZ)), b = scrW(V(want, BLY, BLZ)); return [V(GWX, BLY, BLZ), b[0] > a[0] ? 'SLIDE RIGHT' : 'SLIDE LEFT']; },
    shot() { return [V(GWX + 0.15, 1.2, 74.65), 1.8, 1.1, 0.55, 2.0, Math.PI + 0.3, 2.8, 0.4]; } };
  // ================= GAME 2: FORGE A BLADE (bellows heat → anvil on the beat → quench) =================
  const HEATC = [[0, '#3f4854'], [0.35, '#7a2a1a'], [0.6, '#e0442a'], [0.78, '#ffb347'], [0.9, '#ffe9a0'], [1, '#ffffff']];
  const heatCol = (h, out) => { h = clamp(h, 0, 1); for (let i = 1; i < HEATC.length; i++) if (h <= HEATC[i][0]) { const [a, ca] = HEATC[i - 1], [b, cb] = HEATC[i]; return out.set(ca).lerp(tmpC.set(cb), (h - a) / (b - a)); } return out.set('#ffffff'); };
  const G2 = {
    begin() { const m = own(new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.08), new THREE.MeshBasicMaterial({ color: '#3f4854' }))); m.position.copy(FIRE); m.rotation.y = 0.35; J.blank = m; J.heat = 0; J.hits = 0; J.sub = 'heat'; toast('HOLD TO PUMP THE BELLOWS \u00b7 LET GO WHEN IT GLOWS YELLOW', 2.8); },
    press() { if (J.sub === 'hammer' && J.ring) { if (J.ring.wait > 0) return; if (Math.abs(J.ring.r - 0.12) < 0.05) { J.hits++; clank(); sparkEmit(ANV.x, ANV.y + 0.03, ANV.z, 14, 0); hamHit(ANV); J.blank.scale.x = 1 + J.hits * 0.08; J.blank.scale.z = 1 - J.hits * 0.04; J.ring.r = 0.62; J.ring.wait = 0.25;
          if (J.hits >= 6) { ding(); addGold(12); J.ringM.visible = false; J.tgtM.visible = false; J.ring = null; NEXT('quench', () => { toast('DRAG THE BLADE INTO THE WATER', 2.2); }, 0.6); } }
        else { miss('BRAM: "STEADY! TAP WHEN THE RINGS MEET."', 1.6); J.ring.r = 0.62; J.ring.wait = 0.3; } return; }
      if (J.sub === 'quench' && dist(scrW(J.blank.position)) < RAD() * 2.4) J.held = true; },
    drag() { if (J.sub !== 'quench' || !J.held) return; const p = hitY(1.0); if (!p) return; J.blank.position.set(clamp(p.x, 32.6, 37.7), 1.0, clamp(p.z, 71.6, 75.2)); },
    release() { if (J.sub === 'heat') { if (J.heat >= HBAND[0] && J.heat <= HBAND[1]) { ding(); addGold(6); J.sub = 'move'; fly(J.blank, ANV, 0.5, 0.25, () => { if (J && J.g === 'forge') this.ring(); }); toast('ON THE ANVIL \u00b7 TAP WHEN THE RINGS MEET', 2.2); } return; }
      if (J.sub === 'quench' && J.held) { J.held = false; const p = J.blank.position; if (Math.abs(p.x - TRO.x) < 0.5 && Math.abs(p.z - TRO.z) < 0.6) { J.sub = 'cool'; fly(J.blank, V(TRO.x, TRO.y - 0.05, TRO.z), 0.25, 0, null); hiss(); steamEmit(TRO.x, TRO.z); J.cool = true; addGold(8); NEXT('done', finishGame, 1.6); } else fly(J.blank, ANV, 0.3, 0.1, null); } },
    ring() { J.sub = 'hammer'; if (!J.ringM) { const mk1 = (c, a) => { const m = own(new THREE.Mesh(new THREE.RingGeometry(a, 1, 36), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.9, depthTest: false, side: THREE.DoubleSide }))); m.rotation.x = -Math.PI / 2; m.position.set(ANV.x, ANV.y + 0.04, ANV.z); m.renderOrder = 7; return m; };
        J.ringM = mk1(RED, 0.85); J.tgtM = mk1(YEL, 0.75); J.tgtM.scale.setScalar(0.12); } J.ring = { r: 0.62, wait: 0.2 }; },
    tick(dt) { if (J.sub === 'heat') { if (ptr.down) { J.heat += dt * 0.3; pumpK = 1; } else J.heat = Math.max(0, J.heat - dt * 0.02); if (J.heat > 1) { J.heat = 0.45; miss('BRAM: "WHITE HOT! TOO LONG. LET IT COOL A BIT."', 1.8); } }
      else if (J.sub === 'hammer' && J.ring) { if (J.ring.wait > 0) J.ring.wait -= dt; else { J.ring.r -= dt * 0.42; if (J.ring.r < 0.05) { J.ring.r = 0.62; J.ring.wait = 0.2; toast('TAP WHEN THE RED RING MEETS THE GOLD ONE', 1.6); } } J.ringM.scale.setScalar(Math.max(0.01, J.ring.r)); J.ringM.visible = J.ring.wait <= 0; J.heat = Math.max(0.45, J.heat - dt * 0.015); }
      else if (J.cool) J.heat = Math.max(0, J.heat - dt * 0.6);
      heatCol(J.heat, J.blank.material.color); },
    card() { const st = [['HEAT', J.sub === 'heat' ? Math.round(J.heat * 100) + '%' : '\u2713', J.sub !== 'heat'], ['HAMMER', J.hits + ' / 6', J.hits >= 6], ['QUENCH', J.cool ? '\u2713' : '', !!J.cool]];
      return [J.sub === 'heat' ? 'HOLD TO PUMP \u00b7 LET GO ON YELLOW' : J.cool ? 'QUENCHED \u2713' : J.sub === 'quench' ? 'DRAG IT INTO THE WATER' : 'TAP WHEN THE RINGS MEET', (J.sub === 'heat' ? meter(J.heat, heatCol(J.heat, cc).getStyle(), HBAND) : '') + lst(st.map(([t, r, ok]) => [RED, t, r, ok])), J.sub + J.hits + Math.round(J.heat * 20)]; },
    hint() { if (J.sub === 'heat') return [FIRE.clone(), J.heat >= HBAND[0] ? 'LET GO' : 'HOLD TO PUMP']; if (J.sub === 'hammer') return J.ring && J.ring.wait <= 0 && Math.abs(J.ring.r - 0.12) < 0.05 ? [ANV.clone(), 'TAP NOW'] : null;
      if (J.sub === 'quench') return J.held ? [V(TRO.x, TRO.y, TRO.z), 'LET GO HERE'] : [J.blank.position.clone(), 'DRAG TO THE WATER']; return null; },
    shot() { return J.sub === 'heat' ? [V(35.9, 1.12, 74.4), 1.8, 0.9, 0.18, 1.9, Math.PI + 0.5, 2.4, 0.4] : J.sub === 'hammer' || J.sub === 'move' ? [V(33.7, 0.85, 73.4), 1.0, 0.8, 0.85, 1.5, -2.4, 2.4] : [V(35.3, 0.8, 73.2), 4.4, 1.6, 0.62, 2.2, -2.6, 4.2, 0.3]; } };
  // ================= GAME 3: POLISH ARMOUR (rub the rust; not the gold trim) =================
  const STANDS = [{ x: 35.4, z: 66.8, gold: false }, { x: 35.4, z: 63.2, gold: true }];
  const RUST = [[0.17, 2.16, 0.04], [0.26, 1.64, -0.09], [0.26, 1.5, 0.1], [0.37, 1.08, -0.14], [0.37, 0.98, 0.13], [0.12, 1.84, -0.36], [0.12, 1.86, 0.36]];
  const G3 = {
    begin() { J.si = 0; this.stand(); toast('RUB THE RUST SPOTS OFF', 2.2); },
    stand() { const S0 = STANDS[J.si]; J.S = S0; J.spots = shuffle(RUST.slice()).slice(0, 5).map(([dx, y, dz]) => { const m = own(new THREE.Mesh(new THREE.CircleGeometry(0.07 + Math.random() * 0.025, 14), new THREE.MeshBasicMaterial({ color: '#7a3e16', transparent: true, opacity: 0.95, depthWrite: false })));
        m.position.set(S0.x - dx - 0.012, y, S0.z + dz); m.rotation.y = -Math.PI / 2; m.renderOrder = 3; return { m, hp: 1 }; });
      J.trim = S0.gold ? [V(S0.x - 0.31, 1.27, S0.z), V(S0.x - 0.21, 1.92, S0.z), V(S0.x - 0.3, 1.27, S0.z - 0.2), V(S0.x - 0.3, 1.27, S0.z + 0.2)] : []; J.sub = 'rub'; J.trimCd = 0; if (S0.gold) toast('GOLD TRIM ON THIS ONE \u00b7 RUB THE RUST ONLY', 2.4); },
    press() { J.lp = [ptr.x, ptr.y]; },
    drag() { if (!ptr.down || J.sub !== 'rub' || !J.lp) return; const mv = Math.hypot(ptr.x - J.lp[0], ptr.y - J.lp[1]); J.lp = [ptr.x, ptr.y]; if (mv < 0.5) return; let any = false;
      for (const s of J.spots) { if (s.hp <= 0) continue; if (dist(scrW(s.m.position)) < RAD() * 1.6) { any = true; s.hp -= mv / (RAD() * 5); s.m.material.opacity = 0.2 + 0.75 * Math.max(0, s.hp); if (s.hp <= 0) { s.m.visible = false; pop(); sparkEmit(s.m.position.x - 0.04, s.m.position.y, s.m.position.z, 6, 0); } } }
      if (any) { if ((J.rs = (J.rs || 0) + mv) > 40) { J.rs = 0; noise(0.06, 0.02, 5000); } }
      else if (J.trim.length && J.trimCd <= 0 && J.trim.some(v => dist(scrW(v)) < RAD() * 0.7)) { J.trimCd = 1.4; miss('BRAM: "EASY! THE GOLD TRIM SCRATCHES. RUST ONLY."', 1.8); }
      if (J.sub === 'rub' && J.spots.every(s => s.hp <= 0)) { ding(); addGold(10); J.sub = 'shine'; if (++J.si < STANDS.length) NEXT('next', () => this.stand(), 1.0); else NEXT('done', finishGame, 1.0); } },
    tick(dt) { J.trimCd -= dt; },
    card() { const left = J.spots.filter(s => s.hp > 0).length; return [J.S.gold ? 'RUB THE RUST \u00b7 NOT THE GOLD' : 'RUB THE BROWN RUST SPOTS', lst(STANDS.map((q, i) => ['#9aa4b0', 'STAND ' + (i + 1) + (q.gold ? ' \u00b7 GOLD TRIM' : ''), i < J.si ? '\u2713' : i === J.si ? left + ' LEFT' : '', i < J.si])), J.si + '_' + left]; },
    hint() { const s = J.spots.find(q => q.hp > 0); return s ? [s.m.position.clone(), 'RUB'] : null; },
    shot() { const S0 = J.S; return [V(S0.x - 0.2, 1.6, S0.z), 1.3, 2.1, 0.12, 1.9, -Math.PI / 2, 3.2]; } };
  // ================= GAME 4: RESTOCK THE WALL (drag each weapon to its outline) =================
  const G4 = {
    begin() { J.types = shuffle(IDLE.slice()); drawBoard(J.types); idleG.visible = false; J.ws = shuffle(J.types.slice()).map((k, i) => { const w = own(makeWeapon(k)); w.position.set(18.62 + (i % 2) * 0.16, 0.2, 71.78 + (i % 3) * 0.2); w.rotation.x = (i % 3 - 1) * 0.15; return { k, w, done: false }; });
      J.filled = SLOTS.map(() => false); J.i = 0; this.lift(); toast('HANG EACH ONE ON ITS SHAPE', 2.2); },
    lift() { const q = J.ws[J.i]; if (!q) return; J.cur = q; q.w.rotation.set(0, 0, 0); fly(q.w, HOLD4, 0.35, 0.15, null); },
    press() { if (J.cur && !J.flies.length) { J.held = true; this.drag(); } },
    drag() { if (!J.held || !J.cur) return; const p = hitX(18.35); if (!p) return; J.cur.w.position.set(18.35, clamp(p.y - WH[J.cur.k] / 2, 0.3, 2.3), clamp(p.z, 71.5, 75.2)); },
    release() { if (!J.held || !J.cur) return; J.held = false; const q = J.cur, p = q.w.position, h = WH[q.k]; let best = -1, bd = 0.6; SLOTS.forEach((s, i) => { if (J.filled[i]) return; const d = Math.hypot(p.z - s.z, p.y + h / 2 - (s.y + 0.42)); if (d < bd) { bd = d; best = i; } });
      if (best < 0) { fly(q.w, HOLD4, 0.3, 0.05, null); return; } if (J.types[best] !== q.k) { miss('BRAM: "THAT SHAPE IS THE ' + WN[J.types[best]] + '. FIND THE ' + WN[q.k] + '."'); fly(q.w, HOLD4, 0.3, 0.05, null); return; }
      J.filled[best] = true; q.done = true; J.cur = null; J.i++; clank(0.6); fly(q.w, V(18.2, SLOTS[best].y, SLOTS[best].z), 0.25, 0.05, () => { if (!J || J.g !== 'restock') return; if (J.i < J.ws.length) this.lift(); });
      if (J.i >= J.ws.length) { ding(); addGold(4 * J.ws.length); NEXT('done', finishGame, 1.0); } },
    card() { return ['DRAG IT TO ITS SHAPE', lst(J.ws.map(q => ['#cbd5e1', WN[q.k], q.done ? '\u2713' : '', q.done])), J.i + '_' + J.miss]; },
    hint() { const q = J.cur; if (!q) return null; if (!J.held) return [q.w.position.clone().add(V(0, WH[q.k] / 2, 0)), 'DRAG']; const i = J.types.findIndex((k, j) => k === q.k && !J.filled[j]); return i < 0 ? null : [V(18.25, SLOTS[i].y + 0.42, SLOTS[i].z), 'HANG IT HERE']; },
    shot() { return [V(18.1, 1.75, 73.4), 5.0, 2.7, 0.06, 2.8, Math.PI / 2, (camera.aspect || 1) < 1 ? 7.5 : 5.6, 0.5]; },
    end() { drawBoard(IDLE); idleG.visible = true; } };
  // ================= GAME 5: FIT A CUSTOMER (measure → chart → S / M / L) =================
  const FX = 21.9, FZ = 65.0, SZ = ['S', 'M', 'L'], PCS = ['HELM', 'CHEST', 'BOOTS'], PART = { HELM: 'HEAD', CHEST: 'CHEST', BOOTS: 'FEET' };
  const CHART = { HELM: [[54, 56], [57, 59], [60, 62]], CHEST: [[80, 90], [91, 100], [101, 110]], BOOTS: [[24, 25], [26, 27], [28, 29]] };
  const G5 = {
    begin() { const r = pickUni(), f = cFox(r, G); f.visible = true; f.position.set(FX, 0, FZ); f.rotation.y = Math.PI / 2; J.cf = f; J.C = { name: r.name.toUpperCase() }; f.updateWorldMatrix(true, true); const bb = new THREE.Box3().setFromObject(f), top = clamp(bb.max.y - bb.min.y, 1.1, 2.4); J.top = top;
      J.need = PCS.map(p => { const s = Math.random() * 3 | 0, [a, b] = CHART[p][s]; return { p, s, cm: a + (Math.random() * (b - a + 1) | 0), meas: false, ok: false }; });
      J.pts = [V(FX + 0.22, top - 0.4, FZ), V(FX + 0.3, top * 0.56, FZ), V(FX + 0.3, 0.12, FZ)]; J.tags = J.pts.map((v, i) => { const t = own(tagSprite('TAP \u00b7 ' + PART[PCS[i]], YEL, INK, 0.42)); t.position.copy(v); t.visible = i === 0; return t; });
      J.mi = 0; J.sub = 'measure'; toast(J.C.name + ' NEEDS NEW KIT \u00b7 MEASURE HEAD, CHEST, FEET', 2.6); },
    press() { if (J.sub !== 'measure') return; const i = J.mi; if (dist(scrW(J.pts[i])) < RAD() * 1.7) { const n = J.need[i]; n.meas = true; J.tags[i].material.map = tagFor(PART[n.p] + ' ' + n.cm + ' CM', '#ffffff', INK); J.tags[i].material.needsUpdate = true; tone(1200, 0.05, 0.15, 'triangle'); J.mi++;
        if (J.tags[J.mi]) J.tags[J.mi].visible = true; if (J.mi >= 3) NEXT('pick', () => { J.sub = 'pick'; }, 0.6); }
      else if (J.pts.some((v, j) => j > i && dist(scrW(v)) < RAD() * 1.7)) miss('BRAM: "' + PART[PCS[i]] + ' FIRST. TOP TO TOE!"', 1.6); },
    choose(pi, s) { const n = J.need[pi]; if (n.ok || J.sub !== 'pick') return; if (s !== n.s) { miss('BRAM: "' + (s > n.s ? 'TOO BIG' : 'TOO SMALL') + '! ' + n.cm + ' CM IS ' + SZ[n.s] + '. CHECK THE CHART."', 2); return; }
      n.ok = true; pop(); this.wearIt(n.p); if (J.need.every(q => q.ok)) { ding(); hidePick(); coin(); addGold(20); J.sub = 'done'; NEXT('done', finishGame, 1.4); } },
    wearIt(p) { const f = J.cf, P = f.userData && f.userData.P, add = (par, geo, col, x, y, z) => { const m = new THREE.Mesh(geo, LM(col)); m.position.set(x, y, z); m.renderOrder = 2; par.add(m); J.att.push(m); return m; };
      if (p === 'HELM') { const par = (P && P.head) || f, y = P && P.head ? 0.22 : 1.6; const d = add(par, new THREE.SphereGeometry(0.27, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), '#cbd5e1', 0, y, 0); d.scale.set(1, 0.95, 1.08); add(par, new THREE.BoxGeometry(0.05, 0.14, 0.4), BRONZE, 0, y + 0.25, 0); }
      else if (p === 'CHEST') { const par = (P && P.body) || f; add(par, new THREE.BoxGeometry(0.46, 0.46, 0.05), '#cbd5e1', 0, 0.98, 0.39); add(par, new THREE.BoxGeometry(0.48, 0.05, 0.06), BRONZE, 0, 1.2, 0.39); }
      else for (const s of [-1, 1]) add(f, new THREE.BoxGeometry(0.15, 0.18, 0.26), IRON, s * 0.11, 0.09, 0.04); },
    ui() { if (J.sub !== 'pick') return false; const key = 'fit' + J.need.map(q => +q.ok).join('') + J.miss; if (pickKey === key) return true;
      const chart = '<div style="font-size:12px;font-weight:800;line-height:1.5">' + PCS.map(p => '<div><b>' + p + '</b> \u00b7 ' + CHART[p].map((r, i) => SZ[i] + ' ' + r[0] + '-' + r[1]).join(' \u00b7 ') + '</div>').join('') + '</div>' + lab('TAPE: ' + J.need.map(q => PART[q.p] + ' ' + q.cm).join(' \u00b7 '));
      showPick(key, 'PICK THE SIZES', 'FOR ' + J.C.name, chart, J.need.flatMap((q, pi) => SZ.map((s, si) => ({ label: q.p + ' ' + s, on: q.ok && si === q.s, go: () => this.choose(pi, si) }))), 3); return true; },
    card() { return J.sub === 'measure' ? ['TAP ' + PART[PCS[Math.min(2, J.mi)]], lst(J.need.map(q => ['#cbd5e1', PART[q.p], q.meas ? q.cm + ' CM' : '', q.meas])), 'm' + J.mi] : ['PICK THE SIZES', lst(J.need.map(q => ['#cbd5e1', q.p, q.ok ? SZ[q.s] + ' \u2713' : '', q.ok])), 'p' + J.need.map(q => +q.ok).join('')]; },
    hint() { return J.sub === 'measure' && J.pts[J.mi] ? [J.pts[J.mi], 'TAP ' + PART[PCS[J.mi]]] : null; },
    shot() { const tp = J.top || 1.8; return [V(FX + 0.1, tp * 0.5, FZ), 1.6, tp + 0.6, 0.1, 2.4, Math.PI / 2, 4.2]; } };
  // ================= GAME 6: REPAIR A SHIELD (tap the dents out · rivets in number order) =================
  const DENTC = [[-0.22, 0.18], [0.2, 0.22], [-0.25, -0.22], [0.24, -0.2], [0, 0.3], [0.06, -0.3], [-0.31, 0.02], [0.31, 0.06]];
  const lp = (x, y, z = -0.03) => { shieldG.updateMatrix(); return V(x, y, z).applyMatrix4(shieldG.matrix); };
  const G6 = {
    begin() { strapM.visible = false; J.dents = shuffle(DENTC.slice()).slice(0, 5).map(([x, y]) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.06, 14), new THREE.MeshBasicMaterial({ color: '#10142a' })); m.position.set(x, y, -0.028); m.rotation.y = Math.PI; shieldG.add(m); J.att.push(m);
        const r = new THREE.Mesh(new THREE.RingGeometry(0.06, 0.078, 16), new THREE.MeshBasicMaterial({ color: '#6b7ab8' })); r.position.set(x, y, -0.029); r.rotation.y = Math.PI; shieldG.add(r); J.att.push(r); return { x, y, m, r, hp: 2 }; });
      J.sub = 'dent'; toast('TAP THE DARK DENTS OUT', 2.0); },
    press() { if (J.sub === 'dent') { const d = nearestOf(J.dents.filter(q => q.hp > 0), q => lp(q.x, q.y), 1.3);
        if (d) { d.hp--; clank(); const p = lp(d.x, d.y); hamHit(p); sparkEmit(p.x, p.y, p.z, 5, -0.5); const s = d.hp > 0 ? 0.55 : 0.001; d.m.scale.setScalar(s); d.r.scale.setScalar(s); if (d.hp <= 0) { d.m.visible = d.r.visible = false; pop(); }
          if (J.dents.every(q => q.hp <= 0)) { ding(); addGold(10); NEXT('rivet', () => this.rivets(), 0.8); } return; }
        const c = scrW(lp(0, 0)), e = scrW(lp(0.42, 0)); if (Math.hypot(ptr.x - c[0], ptr.y - c[1]) < Math.hypot(e[0] - c[0], e[1] - c[1])) miss('BRAM: "OOF, A NEW DENT! HIT THE DARK ONES ONLY."', 1.6); return; }
      if (J.sub === 'rivet') { const h = nearestOf(J.holes.filter(q => !q.done), q => lp(q.x, -0.05), 1.2); if (!h) return; if (h.n !== J.ri) { miss('BRAM: "RIVET ' + (J.ri + 1) + ' FIRST. FOLLOW THE NUMBERS."', 1.6); return; }
        h.done = true; h.tag.visible = false; clank(0.8); hamHit(lp(h.x, -0.05)); const r = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), LM(BRONZE)); r.position.set(h.x, -0.05, -0.04); shieldG.add(r); J.att.push(r); J.ri++;
        if (J.ri >= 4) { ding(); addGold(8); NEXT('done', finishGame, 1.0); } } },
    rivets() { J.sub = 'rivet'; strapM.visible = true; J.ri = 0; const ns = shuffle([0, 1, 2, 3]); J.holes = [-0.27, -0.09, 0.09, 0.27].map((x, i) => { const t = own(tagSprite('RIVET ' + (ns[i] + 1), YEL, INK, 0.24)); t.position.copy(lp(x, 0.07, -0.06)); return { x, n: ns[i], tag: t, done: false }; }); toast('RIVET THE STRAP \u00b7 1, 2, 3, 4', 2.0); },
    card() { if (J.sub === 'rivet' || J.sub === 'done') return ['TAP RIVET ' + Math.min(4, (J.ri || 0) + 1), lst([['#10142a', 'DENTS', '\u2713', true], [BRONZE, 'RIVETS', (J.ri || 0) + ' / 4', J.ri >= 4]]), 'r' + J.ri];
      const left = J.dents.filter(q => q.hp > 0).length; return ['TAP THE DARK DENTS', lst([['#10142a', 'DENTS LEFT', String(left), !left], [BRONZE, 'RIVETS', '0 / 4', false]]), 'd' + J.dents.map(q => q.hp).join('')]; },
    hint() { if (J.sub === 'dent') { const d = J.dents.find(q => q.hp > 0); return d ? [lp(d.x, d.y), 'TAP'] : null; } if (J.sub === 'rivet') { const h = J.holes.find(q => q.n === J.ri); return h ? [lp(h.x, -0.05), 'TAP ' + (J.ri + 1)] : null; } return null; },
    shot() { return [V(SHX, SHY, SHZ - 0.05), 1.15, 1.05, 0.42, 1.3, Math.PI, 2.4]; },
    end() { strapM.visible = true; } };
  // ================= GAME 7: TEST RANGE (laser at the red targets, then 3 halberd throws) =================
  const G7 = {
    begin() { TG.forEach(t => { t.want = 0; t.friend = false; t.mat.map = redT; }); J.hits = 0; J.spawnT = 0.9; J.sub = 'laser'; J.beams = []; toast('ZAP THE RED TARGETS \u00b7 NEVER THE BLUE FRIENDS', 2.6); },
    beam(t) { const b = V(t.x, 1.25, t.z), d = b.clone().sub(MUZ), len = d.length(), m = own(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, len), new THREE.MeshBasicMaterial({ color: RED, transparent: true, opacity: 1, depthWrite: false })));
      m.position.copy(MUZ).addScaledVector(d, 0.5); m.rotation.set(-Math.atan2(d.y, Math.hypot(d.x, d.z)), Math.atan2(d.x, d.z), 0, 'YXZ'); J.beams.push({ m, t: 0.18 }); tone(1900, 0.04, 0.15, 'sawtooth'); },
    press() { if (J.sub === 'laser') { const t = nearestOf(TG.filter(q => q.want && q.up > 0.7), q => V(q.x, 1.25, q.z), 2.4); if (!t) return; this.beam(t); t.want = 0; t.spin = 0.5;
        if (t.friend) { miss('BRAM: "THAT\'S A FRIEND CUT-OUT! RED TARGETS ONLY."', 1.8); return; } J.hits++; thunk(); if (J.hits >= 8) { ding(); addGold(14); TG.forEach(q => { q.want = 0; }); NEXT('throwIn', () => this.throwSet(), 1.2); } return; }
      if (J.sub === 'throw' && !J.hal) { J.charging = true; J.pow = 0; J.dir = 1; } },
    release() { if (J.sub === 'throw' && J.charging) { J.charging = false; this.toss(); } },
    throwSet() { J.sub = 'throw'; J.ti = 0; J.res = []; this.aim(); toast('HOLD TO POWER UP \u00b7 LET GO IN THE GOLD BAND', 2.6); },
    aim() { const T = THR[J.ti], t = TG[T.i]; TG.forEach(q => { q.want = q === t ? 1 : 0; q.friend = false; q.mat.map = redT; }); J.T = T; J.pow = 0; },
    toss() { const T = J.T, t = TG[T.i], p = J.pow, ok = p >= T.band[0] && p <= T.band[1], tgt = V(t.x, 1.25, t.z - 0.1), dir = tgt.clone().sub(MUZ).setY(0).normalize(), d = 5 + p * 17, land = ok ? tgt : V(MUZ.x + dir.x * d, 0.1, MUZ.z + dir.z * d);
      const m = own(makeHalberd()); m.position.copy(MUZ); m.rotation.set(Math.PI / 2 - 0.15, Math.atan2(dir.x, dir.z), 0, 'YXZ'); J.hal = m; whoosh();
      fly(m, land, 0.55 + p * 0.5, 1.2 + p * 2.2, () => { if (!J || J.g !== 'range') return; thunk(); J.res.push(ok); J.hal = null;
        if (ok) { addGold(6); const tg = own(tagSprite('BULLSEYE!', YEL, INK, 0.9)); tg.position.set(t.x, 2.3, t.z); } else miss('BRAM: "' + (p < T.band[0] ? 'SHORT' : 'LONG') + '! LET GO IN THE GOLD BAND."', 1.8);
        if (++J.ti < THR.length) NEXT('throw', () => this.aim(), 1.0); else { ding(); NEXT('done', finishGame, 1.4); } }); },
    tick(dt) { if (J.sub === 'laser') { J.spawnT -= dt; if (J.spawnT <= 0 && TG.filter(t => t.want).length < 2) { const free = TG.filter(t => !t.want && t.up < 0.05); if (free.length) { const t = free[Math.random() * free.length | 0]; t.friend = J.hits > 0 && Math.random() < 0.25; t.mat.map = t.friend ? blueT : redT; t.want = 1; t.life = 2.4; } J.spawnT = 0.9; }
        for (const t of TG) if (t.want && (t.life -= dt) <= 0) t.want = 0; }
      if (J.sub === 'throw' && J.charging) { J.pow += dt * 0.75 * J.dir; if (J.pow > 1) { J.pow = 1; J.dir = -1; } if (J.pow < 0) { J.pow = 0; J.dir = 1; } }
      for (const b of J.beams.slice()) { b.t -= dt; b.m.material.opacity = Math.max(0, b.t / 0.18); if (b.t <= 0) { b.m.visible = false; J.beams.splice(J.beams.indexOf(b), 1); } } },
    card() { if (J.sub === 'laser' || J.sub === 'throwIn') return ['TAP THE RED TARGETS', row(RED, 'HITS', J.hits + ' / 8', J.hits >= 8) + row('#2f6fd6', 'BLUE = FRIEND \u00b7 DON\'T', '', false), 'l' + J.hits];
      return ['HOLD \u00b7 LET GO ON GOLD', lab('HALBERD THROW ' + Math.min(3, J.ti + 1) + ' / 3') + meter(J.pow || 0, RED, J.T.band) + lst(THR.map((q, i) => [RED, q.n, J.res[i] == null ? '' : J.res[i] ? '\u2713' : '\u2717', !!J.res[i]])), 't' + J.ti + '_' + Math.round((J.pow || 0) * 30) + J.res.join('')]; },
    hint() { if (J.sub === 'laser') { const t = TG.find(q => q.want && q.up > 0.7 && !q.friend); return t ? [V(t.x, 1.25, t.z), 'TAP'] : null; } if (J.sub === 'throw' && !J.hal) { const t = TG[J.T.i]; if (!J.charging) return [V(t.x, 1.25, t.z), 'HOLD']; return J.pow >= J.T.band[0] && J.pow <= J.T.band[1] ? [V(t.x, 1.25, t.z), 'LET GO'] : null; } return null; },
    shot() { return (camera.aspect || 1) < 1 ? [V(28.4, 0.6, 89.5), 12, 9, 0.48, 9, Math.PI, 13] : [V(28.4, 1.1, 90.5), 15, 4, 0.2, 7, Math.PI, 12.5]; },
    end() { TG.forEach(t => { t.want = 1; t.friend = false; t.mat.map = redT; }); } };
  // ================= GAME 8: GUARD ORDER (walk: fetch 4 things round the shop, hand them over) =================
  const OSP = [['SWORD', 19.9, 72.4, 2.2], ['SPEAR', 20.2, 69.4, 2.6], ['HELM', 21.7, 63.2, 2.5], ['SHIELD', 34.2, 62.3, 1.7], ['DAGGER', 30.2, 69.0, 1.6], ['AXE', 31.8, 74.9, 2.3], ['BREASTPLATE', 34.2, 66.8, 2.2]].map(([n, x, z, y]) => ({ n, x, z, y }));
  const GUARD = V(24.6, 0, 66.8);
  const nearGrab = P => { let b = null, bd = 1.5; for (const s of OSP) { const d = Math.hypot(P.x - s.x, P.z - s.z); if (d < bd) { bd = d; b = s; } } return b; };
  const nearGuard = P => J && J.cf && Math.hypot(P.x - J.cf.position.x, P.z - J.cf.position.z) < 2.2;
  const G8 = { walk: true,
    begin() { const r = pickUni(), f = cFox(r, G); f.visible = true; f.position.copy(GUARD); f.rotation.y = Math.PI; J.cf = f; J.C = { name: r.name.toUpperCase() };
      J.list = shuffle(OSP.slice()).slice(0, 4).map(s => ({ s, got: false })); J.tags = OSP.map(s => { const on = J.list.some(q => q.s === s), t = own(tagSprite(s.n, on ? YEL : '#ffffff', INK, 0.5)); t.position.set(s.x, s.y, s.z); return { s, t }; });
      toast(J.C.name + ' NEEDS 4 THINGS \u00b7 WALK UP + E TO GRAB', 2.6); },
    goal() { const rest = J.list.filter(q => !q.got); if (!rest.length) return [J.cf.position.x, J.cf.position.z]; const P = J.P; let b = rest[0].s, bd = 1e9; for (const q of rest) { const d = Math.hypot(P.x - q.s.x, P.z - q.s.z); if (d < bd) { bd = d; b = q.s; } } return [b.x, b.z]; },
    prompt(P) { if (J.list.every(q => q.got)) return nearGuard(P) ? 'HAND OVER \u00b7 ' + J.C.name : null; const s = nearGrab(P); return s ? 'GRAB \u00b7 ' + s.n : null; },
    talk(P) { if (J.list.every(q => q.got)) { if (nearGuard(P)) { coin(); coin(0.15); addGold(7 * J.list.length); finishGame(); return true; } return false; }
      const s = nearGrab(P); if (!s) return false; const q = J.list.find(l => l.s === s); if (!q) { miss('BRAM: "NOT ON THE LIST! CHECK THE CARD."', 1.6); return true; } if (q.got) { toast(s.n + ' \u00b7 GOT IT ALREADY', 1.4); return true; }
      q.got = true; pop(); const tg = J.tags.find(x => x.s === s); if (tg) tg.t.visible = false; toast(J.list.every(l => l.got) ? 'ALL 4 \u00b7 BACK TO ' + J.C.name : s.n + ' \u2713', 1.6); return true; },
    tick(dt) { const f = J.cf, P = J.P; if (f && P) { const a = Math.atan2(P.x - f.position.x, P.z - f.position.z); let d = a - f.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); f.rotation.y += d * Math.min(1, dt * 3); kit.animFox && kit.animFox(f, dt, 0); } },
    card() { const all = J.list.every(q => q.got); return [all ? 'BACK TO ' + J.C.name : 'FIND THEM \u00b7 E TO GRAB', lst(J.list.map(q => ['#5a6470', q.s.n, q.got ? '\u2713' : '', q.got])), J.list.map(q => +q.got).join('')]; } };
  const GD = { sharpen: G1, forge: G2, polish: G3, restock: G4, fit: G5, repair: G6, range: G7, order: G8 };
  // ================= run a game =================
  let lastP = null;
  function startGame(g, P) { if (busy) return; const n = save.stat('arVisits', 0); save.setStat('arVisits', n + 1);
    J = { g, C: null, miss: 0, gold: 0, objs: [], flies: [], att: [], t: 0, st: 0, sub: '', pause: 0, P }; busy = 'job';
    if (P && RINGS[g] && !GD[g].walk) Object.assign(P, { x: RINGS[g][0], z: RINGS[g][1], sp: 0 }); GD[g].begin(P); K.chime(0.8); }
  function finishGame() { if (!J) return; const g = J.g, q = GN[g], stars = J.miss === 0 ? 3 : J.miss <= 2 ? 2 : 1; if (J.miss === 0) addGold(10); const first = !K.stars(g), gold = J.gold;
    const d = { ...done() }; d[g] = true; save.setStat('arDone', d); const gift = giveGift(); K.finish(g, stars, gold, first); const P0 = J.P, walk = GD[g].walk; stop(); endClear = 7;
    if (P0 && !walk) Object.assign(P0, { x: 28, z: 68.5, sp: 0, yaw: 0 });   // tap jobs end face to face with Bram across the counter
    const OPEN = ['Ha! Lovely work!', 'Bright as a new blade!', "That's proper smithing!", 'The forge sings for you!'][save.stat('arClears', 1) % 4];
    const GIFT = { apron: " Your smith's apron! The Tailor keeps it too.", discount: ' Staff price now: 20% off my gear.', all: ' All eight jobs! Free Halberd and Reinforced Armor, plus the Golden Anvil.', allGold: ' All eight jobs! The Golden Anvil, plus 80 gold.' }[gift] || '';
    sayTo(endT, [ln(OPEN + ' ' + gold + ' gold.' + GIFT)]); }
  function stop() { const g = J && GD[J.g]; if (g && g.end) try { g.end(); } catch (e) {} if (J) { J.objs.forEach(o => o.parent && o.parent.remove(o)); J.att.forEach(o => o.parent && o.parent.remove(o)); if (J.cf) J.cf.visible = false; }
    busy = null; J = null; ptr.down = false; hideCard(); hidePick(); arrowM.visible = false; beacon.visible = false; }
  function press() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.press && g.press(); }
  function drag() { if (!J || J.pause > 0) return; const g = GD[J.g]; g.drag && g.drag(); }
  function release() { if (!J) return; const g = GD[J.g]; g.release && g.release(); }
  function drawCard() { if (!J) return; const g = GD[J.g]; if (g.ui && g.ui()) { hideCard(); return; } hidePick(); const c = g.card && g.card(); if (!c) { hideCard(); return; }
    setCard(J.g + c[2] + '_' + J.miss + '_' + Math.floor(J.gold), head(GN[J.g].name.toUpperCase(), J.gold ? J.gold + ' G' : J.C ? 'FOR ' + J.C.name : 'ARMORY') + foot(c[0], g.walk) + '<div style="padding:8px 10px 10px">' + c[1] + '</div>'); }
  function jobTick(dt, P) { J.t += dt; J.st += dt; J.P = P; if (J.flies.length) flyTick(dt); const g = GD[J.g];
    if (J.pause > 0) { J.pause -= dt; if (J.pause <= 0 && J.after) { const a = J.after; J.after = null; a(); } if (J) drawCard(); return; }
    if (g.tick) g.tick(dt); if (!J) return; if (J.cur && J.g === 'restock' && !J.held && !J.flies.length) J.cur.w.rotation.y += dt * 1.2;
    if (g.goal) { const go = g.goal(); arrowM.visible = true; beacon.visible = true; arrowM.position.set(go[0], 1.9 + Math.sin(J.t * 4) * 0.15, go[1]); arrowM.rotation.y += dt * 2; beacon.position.set(go[0], 0.09, go[1]); }
    drawCard(); }
  // ---------- camera ----------
  const camT = { pos: V(), look: V() }, camCur = { look: V(), pos: V(), on: false };
  const fitCam = ([tgt, w, h, pitch, minD, yaw, maxD = 99, offK = 1]) => { const vf = THREE.MathUtils.degToRad(camera.fov || 55) / 2, hT = Math.tan(vf), asp = camera.aspect || 1, wT = hT * asp, port = asp < 1;
    const d = Math.min(maxD, Math.max(port ? w / 2 / wT : w / (1.24 * wT), port ? h / (1.2 * hT) : h / 2 / hT, minD)), dir = V(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch));
    camT.look.copy(tgt); if (port) camT.look.y += 0.2 * 2 * d * hT * Math.cos(pitch); else camT.look.addScaledVector(V(Math.cos(yaw), 0, -Math.sin(yaw)), -0.16 * offK * 2 * d * wT); camT.pos.copy(camT.look).addScaledVector(dir, d); };
  let near0 = null, fovP = null, snapK = false; const lensOff = cam => { if (fovP != null) { cam.fov = fovP; fovP = null; cam.updateProjectionMatrix(); } };
  function camFix(cam, dt) { const v = busy === 'job' && J && !GD[J.g].walk && GD[J.g].shot ? GD[J.g].shot() : null;
    if (!v) { camCur.on = false; lensOff(cam); if (near0 != null) { cam.near = near0; near0 = null; cam.updateProjectionMatrix(); } return; } if (near0 == null) { near0 = cam.near; cam.near = 0.08; cam.updateProjectionMatrix(); }
    if ((cam.aspect || 1) < 1) { if (fovP == null) fovP = cam.fov; const fv = Math.max(fovP, 72); if (cam.fov !== fv) { cam.fov = fv; cam.updateProjectionMatrix(); } } else lensOff(cam);
    fitCam(v); if (!camCur.on) { camCur.on = true; camCur.look.copy(camT.look); camCur.pos.copy(cam.position); } const k = snapK ? 1 : Math.min(1, dt * 3.2); snapK = false; camCur.pos.lerp(camT.pos, k); camCur.look.lerp(camT.look, k);
    const yard = J && J.g === 'range'; camCur.pos.set(clamp(camCur.pos.x, X0 + 0.4, X1 - 0.4), clamp(camCur.pos.y, 0.6, yard ? 8 : 5.6), yard ? clamp(camCur.pos.z, Z1 + 0.6, YZ1 - 0.4) : clamp(camCur.pos.z, Z0 + 0.4, Z1 - 0.45)); cam.position.copy(camCur.pos); cam.lookAt(camCur.look); }
  // ---------- hint hand ----------
  const HINT = document.createElement('div'); HINT.style.cssText = 'position:fixed;left:0;top:0;z-index:29;pointer-events:none;display:none;font-family:Archivo,sans-serif;transform-origin:17px 4px';
  HINT.innerHTML = '<svg width="48" height="48" viewBox="0 0 24 24" fill="#ffffff" stroke="#201e1d" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block"><path d="M22 14a8 8 0 0 1-8 8"/><path d="M18 11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1"/><path d="M10 9.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg><div style="display:inline-block;margin-top:2px;background:#201e1d;color:#ffd23a;font-weight:900;font-size:12px;padding:3px 6px;white-space:nowrap"></div>';
  document.body.appendChild(HINT); let lastIn = performance.now(); for (const ev of ['pointerdown', 'keydown']) addEventListener(ev, () => { lastIn = performance.now(); }, true);
  const hintTick = t => { const g = jobOn() && J.pause <= 0 && !J.flies.length && GD[J.g].hint ? GD[J.g] : null, h = g && performance.now() - lastIn > 3000 ? g.hint() : null; if (!h) { if (HINT.style.display !== 'none') HINT.style.display = 'none'; return; }
    const p = scrW(h[0]); if (p[2] > 1) { HINT.style.display = 'none'; return; } const sc = t % 1.1 < 0.18 ? 0.82 : 1; HINT.style.display = 'block'; HINT.style.transform = 'translate(' + Math.round(p[0] - 17) + 'px,' + Math.round(p[1] - 4) + 'px) scale(' + sc + ')'; const l = HINT.lastElementChild; if (l.textContent !== h[1]) l.textContent = h[1]; };
  // ---------- talk + prompt ----------
  const inShop = P => P.x > X0 - 0.3 && P.x < X1 + 0.3 && P.z > Z0 && P.z < Z1 && (P.y || 0) < 2.5;
  const inYard = P => P.x > X0 && P.x < X1 && P.z >= Z1 && P.z < YZ1 && (P.y || 0) < 2.5;
  const ringAt = P => GAMES.find(q => Math.hypot(P.x - RINGS[q.k][0], P.z - RINGS[q.k][1]) < 1.05);
  const nearBram = P => Math.hypot(P.x - 28, P.z - 68.8) < 2.1 || Math.hypot(P.x - bram.position.x, P.z - bram.position.z) < 2.0;
  function prompt(P) { if (!inShop(P) && !inYard(P)) return null; if (J && GD[J.g].walk) { const gp = GD[J.g].prompt ? GD[J.g].prompt(P) : null; return gp || (nearBram(P) ? 'BRAM \u00b7 STOP THE JOB' : null); } if (busy) return null;
    const r = ringAt(P); if (r) return (done()[r.k] ? '\u2713 ' : '') + 'START \u00b7 ' + r.name.toUpperCase(); if (K.atHiring(P)) return 'NOW HIRING \u00b7 START WORK'; if (nearBram(P)) return 'TALK \u00b7 BRAM'; return null; }
  const HELLO = ["Ho there! I'm Bram, Meru's smith. Eight jobs in my shop. Fancy some work?", 'Back again? The forge is hot and so is the kettle!', "Ah, my favourite helper! What'll it be?", 'Steel waits for no fox. Ready to work?'];
  const TIPS = ['Hot steel glows orange-yellow. White means you waited too long.', 'Hammer on the beat. Steel likes rhythm, like a good song.', 'Rub the rust, never the gold trim. Gold scratches!', 'Every weapon has its outline on the board. Match the shape.', 'The guards pop in at all hours. Keep their kit ready.', 'At the range, red targets only. The blue ones are friends!', 'Grind slow. Too hot and the edge goes soft and blue.'];
  const nextJob = () => { const d = done(); return (GAMES.find(q => !d[q.k]) || GAMES.slice().sort((a, b) => K.stars(a.k) - K.stars(b.k))[0]).k; };
  const bramMenu = first => { const ch = [{ text: CHOICE_WORK, pick: () => { if (!busy) startGame(nextJob(), lastP); } }, { text: 'BUY GEAR', pick: () => { onShop && onShop('bram'); } },
      { text: 'FORGE A BLADE', pick: () => { if (!busy) startGame('forge', lastP); } }, { text: 'THE TEST RANGE', pick: () => { if (!busy) startGame('range', lastP); } },
      { text: 'A SMITHING TIP, PLEASE', pick: () => sayTo(bmT, [ln(TIPS[talked % TIPS.length])]) }, { text: CHOICE_BYE, bye: true, pick: () => {} }];
    sayTo(bmT, [{ ...ln(first ? HELLO[0] : HELLO[1 + (talked % 3)]), choices: ch }]); };
  function talk(P) { lastP = P; if (J && GD[J.g].walk) { if (GD[J.g].talk && GD[J.g].talk(P)) return true; if (nearBram(P)) { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 1.8); return true; } return false; }
    if (busy) return true; if (!inShop(P) && !inYard(P)) return false; const r = ringAt(P); if (r) { startGame(r.k, P); return true; }
    if (K.atHiring(P)) { ding(); startGame(nextJob(), P); return true; } if (!nearBram(P)) return false; tone(1320, 0.05, 0.6); bramMenu(!talked++); return true; }
  function quit() { stop(); toast('JOB STOPPED \u00b7 GOLD KEPT', 2); }
  // ---------- look: grindstone, bellows, embers, sparks, steam, banner, targets, hammer, yard lamps ----------
  function lookTick(dt, t) { wheelSpin += (1.2 - wheelSpin) * Math.min(1, dt * 1.5); wheelG.rotation.x -= dt * wheelSpin; pumpK = Math.max(0, pumpK - dt * 3);
    const a = pumpK > 0 ? 0.08 + 0.25 * (0.5 + 0.5 * Math.sin(t * 9)) : 0.08 + 0.05 * (0.5 + 0.5 * Math.sin(t * 1.3)); belTop.rotation.z = -a; const gap = 0.375 * Math.sin(a); belSkin.scale.y = Math.max(0.01, gap); belSkin.position.y = 0.54 + gap / 2;
    { const p = EMB.geometry.attributes.position.array; emD.forEach((e, i) => { p[i * 3] = e[0] + Math.sin(t * 3 + e[2]) * 0.03; p[i * 3 + 1] = 1.12 + Math.abs(Math.sin(t * 2.2 + e[2] * 3)) * (0.08 + pumpK * 0.25); p[i * 3 + 2] = e[1]; }); EMB.geometry.attributes.position.needsUpdate = true; EMB.material.opacity = 0.55 + 0.25 * Math.sin(t * 13) + pumpK * 0.35; EMB.material.size = 0.13 + pumpK * 0.1; }
    if (pumpK > 0.5 && Math.random() < 0.3) sparkEmit(36.0 + rnd(-0.5, 0.5), 1.15, 74.5, 1, 0);
    { const p = SPK.geometry.attributes.position.array; spD.forEach((s, i) => { if (s.l > 0) { s.l -= dt; s.vy -= 6 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; if (s.l <= 0) s.y = -50; } p[i * 3] = s.x; p[i * 3 + 1] = s.l > 0 ? s.y : -50; p[i * 3 + 2] = s.z; }); SPK.geometry.attributes.position.needsUpdate = true; }
    { const p = STM.geometry.attributes.position.array; stD.forEach((s, i) => { if (s.l > 0) { s.l -= dt; s.y += dt * 0.9; s.x += Math.sin(t * 2 + i) * dt * 0.1; } p[i * 3] = s.x; p[i * 3 + 1] = s.l > 0 ? s.y : -50; p[i * 3 + 2] = s.z; }); STM.geometry.attributes.position.needsUpdate = true; }
    banner.rotation.x = Math.sin(t * 0.7) * 0.03; banner.rotation.z = Math.sin(t * 0.5) * 0.015;
    for (const q of TG) { q.up += (q.want - q.up) * Math.min(1, dt * 8); q.g.rotation.x = (1 - q.up) * 1.45; if (q.spin > 0) { q.spin -= dt; q.board.rotation.z += dt * 18; } else q.board.rotation.z = 0; }
    if (hamT > 0) { hamT -= dt; const k = Math.max(0, hamT / 0.2); HAM.visible = true; HAM.position.set(hamAt.x, hamAt.y + 0.06 + 0.3 * k, hamAt.z - 0.05); HAM.rotation.x = -k * 0.9; } else HAM.visible = false;
    const h = hour ? hour() : 12; LMP.visible = h >= 19.5 || h < 6.5; }
  let outT = 0;
  function tick(dt, P, fox) { const t = performance.now() / 1000, d = Math.hypot(P.x - 28, P.z - 80); G.visible = d < (touch ? 70 : 130); toastT -= dt; applyWear(fox); lastP = P;
    if (busy === 'job' && J) { const ok = J.g === 'range' ? inYard(P) || inShop(P) : inShop(P); outT = ok ? 0 : outT + dt; if (outT > (GD[J.g].walk ? 2 : 0.3)) { stop(); toast('LEFT THE JOB \u00b7 GOLD KEPT', 2); } }
    if (busy === 'job' && J && !GD[J.g].walk && fox) JW(fox, J.g);
    if (!G.visible) return; if (busy === 'job' && J) jobTick(dt, P); hintTick(t); lookTick(dt, t);
    if (busy === 'job' && J && !GD[J.g].walk) { const f0 = BRAM0[2]; bram.rotation.y += Math.atan2(Math.sin(f0 - bram.rotation.y), Math.cos(f0 - bram.rotation.y)) * Math.min(1, dt * 3); }
    endClear -= dt; K.tick(dt, P, { inShop: inShop(P), busy: !!busy, near: Math.hypot(P.x - 28, P.z - 68), talking: false, clear: endClear > 0 ? [28, 68.6, 3.0] : null }); }
  const API = { group: G, yardCols, prompt, talk, tick, camFix, quit, busy: () => (busy && J && GD[J.g].walk ? null : busy), active: () => !!busy, toast: () => (toastT > 0 ? toastTxt : ''), job: () => J, start: (g, P) => startGame(g, P || lastP), bram, GD, RINGS, TG, toW,
    tap(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); ptr.down = false; release(); }, down(x, y) { ptr.down = true; ptr.x = x; ptr.y = y; press(); drag(); }, dragTo(x, y) { ptr.x = x; ptr.y = y; drag(); }, release() { ptr.down = false; release(); },
    snap() { snapK = true; }, _step(dt = 0.05, n = 1) { for (let i = 0; i < n; i++) { if (busy === 'job' && J && lastP) jobTick(dt, lastP); lookTick(dt, performance.now() / 1000); } }, hint: () => (J && GD[J.g].hint ? GD[J.g].hint() : null), scr: v => scrW(v), finish: () => finishGame(), pick, card, dispose() { card.remove(); pick.remove(); HINT.remove(); K.dispose(); } };
  window.__armory = API; return API;
}
