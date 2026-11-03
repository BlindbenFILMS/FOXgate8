// 8 GATES — ZION · MONSTER ARENA [zionMonsterArena] · FOXTRUCK CRUSH. Course plugin for vehicle-lab.js (lock 'truck', yard:false).
// Big floodlit DIRT BOWL: concourse stands with an instanced crowd, 4 floodlight towers, flags, the central CREST MOUND, two ramp jumps over
// CAR STACKS, three CRUSH LINES of junk cars, BULLSEYE cars on tyre plinths, and the PIT (2 parked trucks + Ringmaster VANCE).
// Rounds: TRUCK SCHOOL (6 lessons) · CRUSH LINES · BIG AIR · FIREBALL ALLEY · FREESTYLE (60 s) · VS BUGGER (crush more cars, 90 s) · THE FINAL (out-score BUGGER, 90 s).
// Ben's answers: easy + pure fun, no tricks (air time only), fireballs always on, cars flatten and bounce the truck, reward = trophy relic + CRUSH GOLD paint.
// Buttons (engine): 1 FIREBALL (finds the car in front) · 2 OIL SLICK · 3 NITRO.
import { save } from '../../engine/save.js';

export const ZION_ARENA = { room: 'zionMonsterArena', world: 'Zion', entry: 'zionMonsterTruckPath', npc: 'zionRingmaster', page: 'Zion Monster Arena.dc.html' };
export const PLACES = [
  { id: 'school', name: 'TRUCK SCHOOL', built: true, time: 0, goal: '6 lessons with VANCE', line: 'Ringmaster VANCE walks you through crushing, ramps, the fireball cannon and the crest.' },
  { id: 'lines', name: 'CRUSH LINES', built: true, time: 60, goal: 'Combo the car rows · 60 s', line: 'Three rows of junk cars. Flatten a whole row without stopping for a huge combo.', g: [7000, 4500, 2500, 1200] },
  { id: 'air', name: 'BIG AIR', built: true, time: 60, goal: 'Fly the car stacks · 60 s', line: 'Nitro up the ramps and land on the car stacks. Air time and air crushes score.', g: [3200, 2000, 1100, 500] },
  { id: 'fire', name: 'FIREBALL ALLEY', built: true, time: 60, goal: 'Burn the bullseye cars · 60 s', line: 'Tap 1. The roof cannon finds the car in front. Bullseye cars on the plinths score big.', g: [3500, 2200, 1300, 600] },
  { id: 'free', name: 'FREESTYLE', built: true, time: 60, goal: 'Anything goes · 60 s', line: 'Crush, fly, burn. Everything scores. Fill the crowd meter for double points.', g: [9000, 6000, 3500, 1500] },
  { id: 'rival', name: 'VS BUGGER', built: true, time: 90, goal: 'Crush more cars than BUGGER · 90 s', line: 'BUGGER, the green bug truck, wants every car in the bowl. Get there first. Fireballs spin him out.' },
  { id: 'final', name: 'THE FINAL', built: true, time: 90, goal: 'Out-score BUGGER · trophy + gold paint', line: 'Everything scores, BUGGER too. Win it for the FOXTRUCK TROPHY and the CRUSH GOLD paint.' }];
const LESSONS = [
  { id: 'crush', name: 'CRUSH IT', need: 3, unit: 'CARS', start: [-48, -34, 0], quest: 'Drive over 3 cars in the west row', radio: 'Welcome to the bowl, kid! Stick drives. Roll right over those cars. They are junk. FLATTEN THEM!', tip: 'Just drive straight up the row. The truck does the rest.' },
  { id: 'line', name: 'CRUSH LINE', need: 1, unit: 'COMBO ×6', start: [48, -34, 0], quest: 'Crush 6 cars in one combo', radio: 'The east row. Do not stop! Every car you keep crushing climbs the combo.', tip: 'Keep the throttle on. Stop for 2 seconds and the combo banks.' },
  { id: 'air', name: 'NITRO RAMP', need: 1, unit: 'JUMP', start: [-22, -44, 0], quest: 'Tap 3 for nitro and fly ramp 1', radio: 'Ramp one. Tap 3 for NITRO on the way in and FLY it!', tip: 'Line up straight, then tap 3 just before the ramp.' },
  { id: 'stack', name: 'STACK SMASH', need: 2, unit: 'STACKS', start: [22, 44, Math.PI], quest: 'Fly ramp 2 and land on 2 car stacks', radio: 'Ramp two has cars stacked behind it. Fly it and come down ON them.', tip: 'Any landing on a stack counts. Go again if you miss.' },
  { id: 'fire', name: 'FIREBALL', need: 3, unit: 'BULLSEYES', start: [0, 18, 0], quest: 'Tap 1: hit 3 bullseye cars', radio: 'The roof cannon! Tap 1. It finds the car in front. Burn the bullseye cars on the plinths.', tip: 'Point the truck at a bullseye car and tap 1.' },
  { id: 'crest', name: 'THE CREST', need: 1, unit: 'AIR', start: [0, -40, 0], quest: 'Full speed over the crest mound', radio: 'The Z crest in the middle. Full speed, nitro, and over the top!', tip: 'Hold full throttle and tap 3 before the mound.' }];
const PASS = ['Look at that pancake!', 'A whole row! The crowd loves you.', 'Air time! That is the stuff.', 'Stack smash! Magnificent!', 'Bullseye! Bullseye! Bullseye!', 'Over the crest! You are ready, kid.'];
const HYPE = ['LADIES AND FOXES!', 'WHAT A CRUNCH!', 'THE CROWD IS ON ITS FEET!', 'LOOK AT HIM GO!', 'SOMEBODY CALL A TOW TRUCK!'];
const TAU = Math.PI * 2, wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const AX = 66, AZ = 46, MR = 11, MH = 3.2;
const moundH = r => r < MR ? MH * 0.5 * (1 + Math.cos(Math.PI * r / MR)) : 0;

export function makeTruckArena(cfg = {}) { return X => truckArena(X, cfg); }
export function truckArena(X, cfg = {}) {
  const { THREE, scene, M, toon, rr, clamp, damp } = X, touch = X.touch;
  const tmp = new THREE.Vector3(), V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const ink = toon('#201e1d'), gold = toon('#e6b45a'), conc = toon('#b8b2aa'), concD = toon('#8a847e'), steel = toon('#8a8f96');
  const glowMat = (c, o = 0.85) => new THREE.SpriteMaterial({ map: X.glowTex, color: c, transparent: true, depthWrite: false, opacity: o, blending: THREE.AdditiveBlending, fog: false });
  X.camera.far = 600; X.camera.updateProjectionMatrix();

  // ---------- floodlit dusk ----------
  scene.background = CT(8, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#141a3a'); gr.addColorStop(0.55, '#3b2e5a'); gr.addColorStop(0.85, '#c9773a'); gr.addColorStop(1, '#e6b45a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0x3b2e48, 140, 420);
  scene.traverse(o => { if (o.isHemisphereLight) { o.color.set('#fff2d8'); o.groundColor.set('#6a4a2a'); o.intensity = 1.05; } });
  X.sun.color.set('#fff0d0'); X.sun.intensity = 2.0; X.sun.position.set(30, 60, 20);
  if (X.sun.shadow) Object.assign(X.sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, far: 160 });
  const speck = (g, w, h, n, cols, s = 2) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * s, 1 + Math.random() * s); } };
  const dirtT = CT(512, 512, (g, w, h) => { g.fillStyle = '#8a5a32'; g.fillRect(0, 0, w, h); speck(g, w, h, 6000, ['rgba(60,36,18,0.45)', 'rgba(170,120,70,0.35)', 'rgba(110,70,40,0.4)'], 3); g.strokeStyle = 'rgba(60,36,18,0.25)'; g.lineWidth = 10; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(Math.random() * w, 0); g.bezierCurveTo(Math.random() * w, h / 3, Math.random() * w, h * 2 / 3, Math.random() * w, h); g.stroke(); } });
  dirtT.wrapS = dirtT.wrapT = THREE.RepeatWrapping;
  { const t = dirtT.clone(); t.needsUpdate = true; t.repeat.set(10, 7); const m = new THREE.Mesh(new THREE.PlaneGeometry(150, 110), new THREE.MeshToonMaterial({ map: t, gradientMap: X.grad })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; scene.add(m);
    const o = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), toon('#3a2a1e')); o.rotation.x = -Math.PI / 2; o.position.y = -0.03; scene.add(o); }
  // pit apron (concrete) at the south end
  { const pt = CT(256, 256, (g, w, h) => { g.fillStyle = '#9a948c'; g.fillRect(0, 0, w, h); speck(g, w, h, 1500, ['rgba(0,0,0,0.12)', 'rgba(255,255,255,0.1)']); g.fillStyle = '#e6b45a'; g.fillRect(0, h - 14, w, 8); }); pt.wrapS = THREE.RepeatWrapping; pt.repeat.set(6, 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(60, 8), new THREE.MeshToonMaterial({ map: pt, gradientMap: X.grad })); m.rotation.x = -Math.PI / 2; m.position.set(0, 0.012, -45); scene.add(m); }

  // ---------- CREST MOUND (centre): smooth dome + the Z crest on top ----------
  const zT = CT(256, 256, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = '#e6b45a'; g.beginPath(); g.arc(128, 128, 120, 0, TAU); g.fill(); g.strokeStyle = '#201e1d'; g.lineWidth = 10; g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 170px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Z', 128, 140); });
  { const pts = []; for (let i = 0; i <= 24; i++) { const r = MR * (1 - i / 24); pts.push(new THREE.Vector2(r + 0.001, moundH(r))); } const t = dirtT.clone(); t.needsUpdate = true; t.repeat.set(3, 1.5);
    const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 36), new THREE.MeshToonMaterial({ map: t, gradientMap: X.grad, side: THREE.DoubleSide })); m.receiveShadow = true; m.castShadow = true; scene.add(m);
    const cg = new THREE.CircleGeometry(3.6, 28); cg.rotateX(-Math.PI / 2); const p = cg.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, moundH(Math.hypot(p.getX(i), p.getZ(i))) + 0.05); p.needsUpdate = true; cg.computeVertexNormals();
    scene.add(new THREE.Mesh(cg, new THREE.MeshBasicMaterial({ map: zT, transparent: true, depthWrite: false }))); }

  // ---------- RAMPS over the CAR STACKS ----------
  const RAMPS = [{ x: -22, z: -20, yaw: 0, end: -11, land: 9 }, { x: 22, z: 20, yaw: Math.PI, end: 11, land: -9 }];
  const rampSign = (n, x, z, yaw) => { const t = CT(256, 128, g => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#ec3013'; g.fillRect(0, 0, 80, 128); g.fillStyle = '#fff'; g.font = '900 90px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText(String(n), 16, 70); g.font = '900 44px Archivo, sans-serif'; g.fillText('RAMP', 96, 70); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 2), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide })); m.position.set(x, 4.2, z); m.rotation.y = yaw + Math.PI; scene.add(m); for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.18, 4.2, 0.18), ink, x + Math.cos(yaw) * s * 1.9, 2.1, z - Math.sin(yaw) * s * 1.9, null, 0.01); };
  RAMPS.forEach((R, i) => { X.addRamp({ x: R.x, z: R.z, yaw: R.yaw, w: 7, l: 8, h: 2.4, top: 1 }, '#e6b45a'); X.addRamp({ x: R.x, z: R.land, yaw: R.yaw + Math.PI, w: 7, l: 8, h: 2.4, top: 0 }, '#b88a3a'); rampSign(i + 1, R.x, R.z - Math.cos(R.yaw) * 1.5, R.yaw); });
  const onRamp = (x, z) => RAMPS.some(R => Math.abs(x - R.x) < 4 && Math.abs(z - (R.z + R.end) / 2) < 6);

  // ---------- junk cars: one merged mesh per car (phone budget) ----------
  const geoCache = new Map(), carMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: X.grad }), flatMat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: X.grad, color: 0x8a8078 });
  const bx = (w, h, d, x, y, z, col) => [new THREE.BoxGeometry(w, h, d), col, new THREE.Matrix4().makeTranslation(x, y, z)];
  const cy = (r, l, x, y, z, col) => [new THREE.CylinderGeometry(r, r, l, 12), col, new THREE.Matrix4().makeRotationZ(Math.PI / 2).setPosition(x, y, z)];
  function merge(parts) { const pos = [], nor = [], col = [], cc = new THREE.Color(); for (const [g0, c, m] of parts) { const g = g0.index ? g0.toNonIndexed() : g0; g.applyMatrix4(m); cc.set(c); const p = g.attributes.position.array, n = g.attributes.normal.array; for (let i = 0; i < p.length; i++) { pos.push(p[i]); nor.push(n[i]); } for (let i = 0; i < p.length / 3; i++) col.push(cc.r, cc.g, cc.b); g0.dispose(); }
    const out = new THREE.BufferGeometry(); out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); out.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); out.computeBoundingSphere(); return out; }
  // side profile (z along the car, y up) extruded across the width
  const ex = (pts, w, col, x = 0) => { const sh = new THREE.Shape(pts.map(([z, y]) => new THREE.Vector2(z, y))); const g = new THREE.ExtrudeGeometry(sh, { depth: w, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 4 }); g.translate(0, 0, -w / 2); g.rotateY(-Math.PI / 2); return [g, col, new THREE.Matrix4().makeTranslation(x, 0, 0)]; };
  const TYPES = {
    sedan: { L: 4.0, cf: 0.55, cr: -1.15, ft: 0.05, rt: -0.85, top: 1.5, belt: 1.0, trunk: 0.97 },
    hatch: { L: 3.5, cf: 0.45, cr: -1.6, ft: -0.05, rt: -1.45, top: 1.52, belt: 1.0, trunk: 1.0 },
    pickup: { L: 4.4, cf: 0.75, cr: -0.35, ft: 0.3, rt: -0.3, top: 1.6, belt: 1.05, trunk: 1.05, bed: true },
    wagon: { L: 4.2, cf: 0.65, cr: -1.95, ft: 0.15, rt: -1.85, top: 1.62, belt: 1.0, trunk: 1.0 } };
  const TNAMES = Object.keys(TYPES);
  function carGeo(col, target, type = 'sedan', odd) { const k = col + type + (target ? 'T' : '') + (odd || ''); if (geoCache.has(k)) return geoCache.get(k);
    const T = TYPES[type], h = T.L / 2, W = 1.68, glass = '#2c4652', chrome = '#c9ccd1', dark = '#2a2826';
    const P = [ex([[-h, 0.34], [h, 0.34], [h + 0.06, 0.56], [h - 0.02, 0.84], [h - 0.35, 0.92], [T.cf, T.belt], [T.cr, T.belt], [-h + 0.25, T.trunk], [-h - 0.04, 0.86], [-h - 0.06, 0.56]], W, col),
      ex([[T.cf, T.belt - 0.02], [T.ft, T.top], [T.rt, T.top], [T.cr, T.belt - 0.02]], W - 0.14, glass),
      bx(W - 0.1, 0.07, T.ft - T.rt + 0.1, 0, T.top + 0.04, (T.ft + T.rt) / 2, col),
      bx(W - 0.08, T.top - T.belt, 0.12, 0, (T.top + T.belt) / 2, (T.cf + T.cr) / 2 * 0.35 + (T.ft + T.rt) / 2 * 0.65, col),
      bx(W + 0.16, 0.2, 0.26, 0, 0.5, h + 0.06, chrome), bx(W + 0.16, 0.2, 0.26, 0, 0.5, -h - 0.06, chrome),
      bx(1.0, 0.2, 0.05, 0, 0.72, h + 0.05, dark),
      bx(0.34, 0.16, 0.05, -0.62, 0.74, h + 0.06, '#fff4c0'), bx(0.34, 0.16, 0.05, 0.62, 0.74, h + 0.06, '#fff4c0'),
      bx(0.3, 0.14, 0.05, -0.64, 0.78, -h - 0.07, '#c0261a'), bx(0.3, 0.14, 0.05, 0.64, 0.78, -h - 0.07, '#c0261a'),
      bx(W + 0.1, 0.05, T.L * 0.55, 0, 0.66, 0, dark),
      bx(0.6, 0.04, 0.7, -0.3, 0.97, h - 0.7, '#6b3f22'), bx(0.4, 0.04, 0.5, 0.42, T.trunk + 0.02, -h + 0.5, '#6b3f22')];
    if (T.bed) { for (const sx of [-1, 1]) P.push(bx(0.1, 0.3, -h - T.cr + 0.1, sx * (W / 2 - 0.05), T.belt + 0.12, (T.cr - h) / 2 - 0.05, col)); P.push(bx(W, 0.3, 0.1, 0, T.belt + 0.12, -h + 0.02, col), bx(W - 0.2, 0.04, -h - T.cr - 0.1, 0, T.belt - 0.02, (T.cr - h) / 2, dark)); }
    if (odd) P.push(bx(0.04, 0.5, 1.0, (odd === 'L' ? -1 : 1) * (W / 2 + 0.03), 0.66, T.cf - 0.6, odd === 'L' ? '#9a948c' : '#b65a3a'));
    const wz = h - 0.75;
    for (const sx of [-1, 1]) for (const sz of [-wz, wz]) P.push(cy(0.38, 0.3, sx * 0.84, 0.38, sz, '#1c1c1e'), cy(0.2, 0.32, sx * 0.84, 0.38, sz, '#b8bcc2'));
    if (target) P.push(bx(1.1, 0.04, 1.1, 0, T.top + 0.1, (T.ft + T.rt) / 2, '#ec3013'), bx(0.7, 0.05, 0.7, 0, T.top + 0.12, (T.ft + T.rt) / 2, '#f3f2f2'), bx(0.3, 0.06, 0.3, 0, T.top + 0.14, (T.ft + T.rt) / 2, '#ec3013'));
    const g = merge(P); geoCache.set(k, g); return g; }
  const COLS = ['#4f86c6', '#e6b45a', '#7a9a5a', '#b65a3a', '#8a8f96', '#d8d4cc', '#6b4f8a', '#38bdf8'];
  function carMesh(col, target, parent, y = 0, ry = 0, type, odd) { const g = carGeo(col, target, type, odd), m = new THREE.Mesh(g, carMat); m.position.y = y; m.rotation.y = ry; m.castShadow = !touch; parent.add(m); const o = new THREE.Mesh(g, X.outlineMat); o.scale.set(1.05, 1.05, 1.025); m.add(o); return m; }
  const blobT = CT(128, 128, g => { const gr = g.createRadialGradient(64, 64, 4, 64, 64, 62); gr.addColorStop(0, 'rgba(0,0,0,0.6)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }), blobM = new THREE.MeshBasicMaterial({ map: blobT, transparent: true, depthWrite: false }), blobG = new THREE.PlaneGeometry(2.6, 5); blobG.rotateX(-Math.PI / 2);
  const CARS = [];
  function car(x, z, yaw, o2 = {}) { const g = new THREE.Group(); g.position.set(x, o2.y || 0, z); g.rotation.y = yaw; scene.add(g); const sq = new THREE.Group(); g.add(sq);
    const n = CARS.length, col = o2.target ? '#f3f2f2' : COLS[(n * 5) % COLS.length], type = o2.target ? 'sedan' : o2.stack ? (n % 2 ? 'hatch' : 'sedan') : TNAMES[(n * 3) % 4], odd = n % 3 === 0 ? 'L' : n % 5 === 0 ? 'R' : '', meshes = [carMesh(col, o2.target, sq, 0, 0, type, odd)];
    if (o2.stack) meshes.push(carMesh(COLS[(n * 3 + 2) % COLS.length], false, sq, 1.38, rr(-0.25, 0.25), n % 2 ? 'sedan' : 'hatch'));
    if (!o2.y) { const b = new THREE.Mesh(blobG, blobM); b.position.y = 0.03; b.renderOrder = 1; g.add(b); }
    const o = { kind: 'car', custom: true, noRespawn: true, g, sq, meshes, x, z, yaw, y0: o2.y || 0, r: o2.stack ? 1.8 : 1.6, h: (o2.y || 0) + (o2.stack ? 2.8 : 1.5), hp: 20, home: [x, z], dead: false, deadT: 0, drop: -1, ...o2 };
    if (o.target) { o.ring = new THREE.Sprite(glowMat(0xff4a2a, 0.55)); o.ring.scale.setScalar(5); o.ring.position.set(x, o.y0 + 1.6, z); scene.add(o.ring); }
    CARS.push(o); X.props.push(o); return o; }
  for (let i = 0; i < 9; i++) { car(-48, -18 + i * 4.5, Math.PI / 2, { row: 'W' }); car(48, -18 + i * 4.5, Math.PI / 2, { row: 'E' }); }
  for (let i = 0; i < 9; i++) car(-18 + i * 4.5, -28, 0, { row: 'S' });
  for (const R of RAMPS) for (let k = 0; k < 3; k++) car(R.x, R.end + Math.cos(R.yaw) * (4.2 + k * 3.2), Math.PI / 2, { stack: true });
  const PLINTHS = [];
  for (const x of [-36, -22, -8, 8, 22, 36]) { const z = 41; M(new THREE.CylinderGeometry(2.4, 2.6, 1.2, 16), toon('#2a2826'), x, 0.6, z, null, 0.03, 2.5); M(new THREE.TorusGeometry(2.45, 0.12, 6, 24), gold, x, 1.2, z, null, 0).rotation.x = Math.PI / 2; PLINTHS.push([x, z, 2.6]); car(x, z, Math.PI / 2 + rr(-0.3, 0.3), { target: true, y: 1.2 }); }
  for (const [x, z, a] of [[-34, 26, 0.4], [34, 26, -0.6], [-34, -36, 1.2], [34, -36, 2.0], [-8, 26, 0.2], [8, -16, 1.0], [-30, 4, 0.8], [30, -6, -0.4]]) car(x, z, a, { loose: true });
  // decorative crushed-car piles in the corners (static, flat)
  for (const [x, z] of [[-60, 40], [60, 40], [-60, -40], [60, -40]]) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(carGeo(COLS[(k + x) & 7] || '#8a8f96', false, TNAMES[k % 4]), flatMat); m.scale.set(1.1, 0.3, 1.04); m.position.y = k * 0.48; m.rotation.y = rr(-0.5, 0.5); g.add(m); } }

  // ---------- walls, stands, crowd, floodlights, flags ----------
  const stripeT = CT(256, 64, g => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#201e1d' : '#e6b45a'; g.beginPath(); g.moveTo(i * 32, 64); g.lineTo(i * 32 + 32, 64); g.lineTo(i * 32 + 64, 0); g.lineTo(i * 32 + 32, 0); g.fill(); } }); stripeT.wrapS = THREE.RepeatWrapping;
  for (const [x, z, w, d] of [[0, AZ + 2.4, 2 * AX + 6, 1], [0, -AZ - 2.4, 2 * AX + 6, 1], [AX + 2.4, 0, 1, 2 * AZ + 6], [-AX - 2.4, 0, 1, 2 * AZ + 6]]) { const t = stripeT.clone(); t.needsUpdate = true; t.repeat.set(Math.max(w, d) / 4, 1); const mats = Array(6).fill(conc); const sm = new THREE.MeshToonMaterial({ map: t, gradientMap: X.grad }); if (w > d) { mats[4] = mats[5] = sm; } else { mats[0] = mats[1] = sm; } const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.5, d), mats); m.position.set(x, 0.75, z); m.castShadow = !touch; scene.add(m); }
  // stands: stepped concrete on all four sides
  const ROWS = touch ? 4 : 6, STEP = 1.3, RISE = 1.1, SP = touch ? 2.0 : 1.4, sides = [];
  const fur = ['#d9772e', '#c9662a', '#e08a3e', '#a8692e', '#8a5a32', '#f0b070', '#6f6a65'], shirt = ['#e6b45a', '#ec3013', '#f3f2f2', '#201e1d', '#e6b45a', '#38bdf8', '#ffd23a'];
  for (const [ax, sgn] of [['z', 1], ['z', -1], ['x', 1], ['x', -1]]) { const along = ax === 'z' ? 2 * AX + 10 : 2 * AZ + 6, base = (ax === 'z' ? AZ : AX) + 5, grp = new THREE.Group(); scene.add(grp);
    for (let r = 0; r < ROWS + 1; r++) { const d = base + r * STEP + STEP / 2, h = (r + 1) * RISE; const m = new THREE.Mesh(new THREE.BoxGeometry(ax === 'z' ? along : STEP, h, ax === 'z' ? STEP : along), r % 2 ? conc : concD); m.position.set(ax === 'x' ? sgn * d : 0, h / 2, ax === 'z' ? sgn * d : 0); scene.add(m); }
    { const d = base + (ROWS + 1) * STEP + 0.6, h = (ROWS + 1) * RISE + 1.2; const m = new THREE.Mesh(new THREE.BoxGeometry(ax === 'z' ? along : 1.2, h, ax === 'z' ? 1.2 : along), toon('#5a4a3e')); m.position.set(ax === 'x' ? sgn * d : 0, h / 2, ax === 'z' ? sgn * d : 0); scene.add(m); }
    const per = Math.floor((along - 4) / SP), N = per * ROWS, body = new THREE.InstancedMesh(new THREE.BoxGeometry(0.55, 0.75, 0.4), new THREE.MeshToonMaterial({ gradientMap: X.grad }), N), head = new THREE.InstancedMesh(new THREE.BoxGeometry(0.42, 0.4, 0.4), new THREE.MeshToonMaterial({ gradientMap: X.grad }), N), o = new THREE.Object3D(), c = new THREE.Color();
    let i = 0; for (let r = 0; r < ROWS; r++) for (let k = 0; k < per; k++) { const a = -along / 2 + 2 + k * SP + rr(-0.2, 0.2), d = base + r * STEP + STEP / 2 + 0.2, y = (r + 1) * RISE; o.position.set(ax === 'x' ? sgn * d : a, y + 0.38, ax === 'z' ? sgn * d : a); o.rotation.y = ax === 'z' ? (sgn > 0 ? Math.PI : 0) : (sgn > 0 ? -Math.PI / 2 : Math.PI / 2); o.updateMatrix(); body.setMatrixAt(i, o.matrix); body.setColorAt(i, c.set(shirt[(i * 7 + r) % shirt.length])); o.position.y = y + 0.95; o.updateMatrix(); head.setMatrixAt(i, o.matrix); head.setColorAt(i, c.set(fur[(i * 3 + k) % fur.length])); i++; }
    grp.add(body, head); sides.push({ grp, ph: sides.length * 1.7 }); }
  // banners
  const sign = (txt, sub, x, z, ry, w) => { const t = CT(1024, 192, g => { g.fillStyle = '#201e1d'; g.fillRect(0, 0, 1024, 192); g.fillStyle = '#e6b45a'; g.fillRect(0, 0, 150, 192); g.fillStyle = '#201e1d'; g.font = '900 150px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('Z', 30, 104); g.fillStyle = '#fff'; g.font = '900 96px Archivo, sans-serif'; g.fillText(txt, 180, 82); g.fillStyle = '#e6b45a'; g.font = '800 36px Archivo, sans-serif'; g.fillText(sub, 184, 158); }); const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.1875), new THREE.MeshBasicMaterial({ map: t, side: THREE.DoubleSide, fog: false })); m.position.set(x, 14, z); m.rotation.y = ry; scene.add(m); for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.4, 14, 0.4), ink, x + Math.cos(ry) * s * w * 0.45, 7, z - Math.sin(ry) * s * w * 0.45, null, 0.01); };
  sign('FOXTRUCK CRUSH', 'ZION MONSTER ARENA · RINGMASTER VANCE', 0, AZ + 14, Math.PI, 44); sign('MONSTER ARENA', 'ZION · TRUCK ROAD GATE', 0, -AZ - 14, 0, 36);
  // floodlight towers
  const LIGHTS = [];
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const x = sx * (AX + 14), z = sz * (AZ + 12); M(new THREE.CylinderGeometry(0.45, 0.7, 26, 8), steel, x, 13, z, null, 0.02); const g = new THREE.Group(); g.position.set(x, 26.5, z); g.lookAt(0, 0, 0); scene.add(g); M(new THREE.BoxGeometry(6, 3.2, 0.6), ink, 0, 0, 0, g, 0.03);
    for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) { const p = M(new THREE.CircleGeometry(0.62, 14), new THREE.MeshBasicMaterial({ color: 0xfff6d8, fog: false }), -2 + a * 2, -0.75 + b * 1.5, 0.32, g, 0); p.castShadow = false; }
    const s = new THREE.Sprite(glowMat(0xfff0c0, 0.75)); s.position.set(x * 0.98, 26.5, z * 0.98); s.scale.setScalar(16); scene.add(s); LIGHTS.push([x, z]); }
  // flags along the top of the stands
  const FLAGS = [], flagT = [CT(128, 96, g => { g.fillStyle = '#e6b45a'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#201e1d'; g.font = '900 72px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillText('Z', 40, 54); }), CT(128, 96, g => { g.fillStyle = '#ec3013'; g.fillRect(0, 0, 128, 96); g.fillStyle = '#f3f2f2'; g.fillRect(0, 40, 128, 16); })];
  { const top = (ROWS + 1) * RISE + 1.2, pts = []; for (let x = -AX; x <= AX; x += 14) for (const s of [-1, 1]) pts.push([x, s * (AZ + 5 + (ROWS + 1) * STEP + 0.6)]); for (let z = -AZ + 6; z <= AZ - 6; z += 14) for (const s of [-1, 1]) pts.push([s * (AX + 5 + (ROWS + 1) * STEP + 0.6), z]);
    pts.forEach(([x, z], i) => { M(new THREE.CylinderGeometry(0.07, 0.07, 4, 6), ink, x, top + 2, z, null, 0); const pv = new THREE.Group(); pv.position.set(x, top + 3.3, z); scene.add(pv); const f = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.4), new THREE.MeshBasicMaterial({ map: flagT[i % 2], side: THREE.DoubleSide })); f.position.x = 1; pv.add(f); FLAGS.push({ pv, k: i * 0.7 }); }); }
  // tyre stacks + oil drums in the bowl corners (decor)
  { const tyre = new THREE.TorusGeometry(0.7, 0.32, 8, 16), tm = toon('#1f2023'); for (const [x, z] of [[-63, 0], [63, 0], [-40, -44], [40, -44], [-40, 44], [40, 44]]) for (let k = 0; k < 3; k++) { const t = new THREE.Mesh(tyre, tm); t.rotation.x = Math.PI / 2; t.position.set(x, 0.3 + k * 0.6, z); scene.add(t); } }
  // FIRE BARRELS: red drums with a flame on top. Drive into one = BOOM (truck armour −25). Shoot one = KABOOM (blows up cars + barrels nearby).
  const BARRELS = [], barM = toon('#c8281a'), ribM = toon('#5a1a12'), hazT = CT(256, 64, g => { g.fillStyle = '#ffd23a'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#201e1d'; for (let i = 0; i < 4; i++) { const x = 32 + i * 64; g.beginPath(); g.moveTo(x, 54); g.bezierCurveTo(x - 18, 40, x - 6, 24, x, 10); g.bezierCurveTo(x + 4, 24, x + 18, 34, x, 54); g.fill(); } }), hazM = new THREE.MeshToonMaterial({ map: hazT, gradientMap: X.grad }), barG = new THREE.CylinderGeometry(0.55, 0.55, 1.25, 16), ribG = new THREE.TorusGeometry(0.56, 0.04, 4, 18), hazG = new THREE.CylinderGeometry(0.565, 0.565, 0.34, 16, 1, true);
  hazT.wrapS = THREE.RepeatWrapping; hazT.repeat.set(2, 1);
  function barrel(x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const sq = new THREE.Group(); g.add(sq); M(barG, barM, 0, 0.625, 0, sq, 0.04, 0.55); for (const y of [0.25, 1.0]) { const rb = new THREE.Mesh(ribG, ribM); rb.rotation.x = Math.PI / 2; rb.position.y = y; sq.add(rb); } const hz = new THREE.Mesh(hazG, hazM); hz.position.y = 0.62; sq.add(hz);
    const f1 = new THREE.Sprite(glowMat(0xff6a1a, 0.9)), f2 = new THREE.Sprite(glowMat(0xffd27a, 0.9)); f1.position.y = 1.55; f2.position.y = 1.45; f1.scale.setScalar(1.6); f2.scale.setScalar(0.8); sq.add(f1, f2); const b = new THREE.Mesh(blobG, blobM); b.scale.set(0.6, 1, 0.32); b.position.y = 0.03; g.add(b);
    const o = { kind: 'barrel', custom: true, noRespawn: true, barrel: true, g, sq, f1, f2, x, z, r: 0.9, h: 1.3, hp: 1, home: [x, z], dead: false, deadT: 0, drop: -1, k: Math.random() * 9 }; BARRELS.push(o); X.props.push(o); return o; }
  for (const [x, z] of [[-48, 24], [48, 24], [-58, -20], [58, -20], [-14, 14], [14, -14], [-24, -36], [24, -36], [0, 32], [-30, 34], [30, 34], [-12, -6], [12, 6]]) barrel(x, z);
  const SOLIDS = [...PLINTHS.map(([x, z, r]) => [x, z, r]), [-63, 0, 1.3], [63, 0, 1.3], [-40, -44, 1.3], [40, -44, 1.3], [-40, 44, 1.3], [40, 44, 1.3]];

  // ---------- the PIT: Ringmaster VANCE + 2 parked trucks ----------
  const recolor = (g, map) => { const tm = new Map(); g.traverse(m => { if (m.isMesh && m.material && m.material.color && m.material !== X.outlineMat) { if (!tm.has(m.material)) { const hx = m.material.color.getHexString(); tm.set(m.material, map[hx] ? toon(map[hx]) : m.material); } m.material = tm.get(m.material); } }); };
  const GOLDMAP = { ec3013: '#e6b45a', b91c1c: '#a87a2a' }, BUGMAP = { ec3013: '#5aa02c', b91c1c: '#2f6a1a', e6b45a: '#201e1d' };
  const goldT = X.makeVeh('truck'); recolor(goldT, GOLDMAP); goldT.position.set(-15, 0, -44); goldT.rotation.y = 0.25; scene.add(goldT); SOLIDS.push([-15, -44, 2.8]);
  const tag = (txt, col, sub) => { const t = CT(512, sub ? 120 : 72, (c, W, H) => { c.fillStyle = '#201e1d'; c.fillRect(0, 0, W, H); c.fillStyle = col; c.fillRect(0, 0, 16, H); c.fillStyle = '#fff'; c.font = '900 46px Archivo, sans-serif'; c.textBaseline = 'middle'; c.fillText(txt, 32, 38); if (sub) { c.fillStyle = col; c.font = '800 28px Archivo, sans-serif'; c.fillText(sub, 32, 92); } }); const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false })); s.scale.set(4.6, sub ? 1.08 : 0.65, 1); s.renderOrder = 8; return s; };
  const G_goldTag = tag('CRUSH GOLD', '#e6b45a', 'WIN THE FINAL'); G_goldTag.position.set(-15, 5.6, -44); scene.add(G_goldTag);
  const VANCE_LOOK = { ...X.CAST.player.look, fur: '#c9662a', tailMid: '#c9662a', paw: '#201e1d', leg: '#201e1d', boot: '#201e1d', headScale: 1.05, bodyScale: 1.1 };
  const vance = X.kit.makeFox({ ...X.CAST.player, look: VANCE_LOOK, torso: ['#ec3013', '#e6b45a', '#201e1d'], outfit: 'coat', crest: '', gear: 'none', eyes: ['#3a2a1a', '#3a2a1a'], mood: 'happy' });
  { const P = vance.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; if (P.head) { const h = new THREE.Group(); h.position.set(0, 0.52, -0.02); P.head.add(h); M(new THREE.CylinderGeometry(0.5, 0.5, 0.05, 20), ink, 0, 0, 0, h, 0.01); M(new THREE.CylinderGeometry(0.3, 0.32, 0.62, 18), ink, 0, 0.33, 0, h, 0.015); M(new THREE.CylinderGeometry(0.325, 0.325, 0.1, 18), toon('#ec3013'), 0, 0.1, 0, h, 0); }
    vance.scale.multiplyScalar(1.15); vance.position.set(-5, 0, -45.5); scene.add(vance); SOLIDS.push([-5, -45.5, 1]);
    M(new THREE.BoxGeometry(2.4, 0.3, 2.4), gold, -5, 0.15, -45.5, null, 0.02); }
  const bubCv = document.createElement('canvas'); bubCv.width = 768; bubCv.height = 160; const bubTex = new THREE.CanvasTexture(bubCv); bubTex.colorSpace = THREE.SRGBColorSpace;
  const bub = new THREE.Sprite(new THREE.SpriteMaterial({ map: bubTex, transparent: true, depthTest: false })); bub.scale.set(3.9, 0.81, 1); bub.position.set(-3.6, 4.9, -45.5); bub.renderOrder = 9; scene.add(bub); let bubText = '';
  function vanceSay(s) { if (s === bubText) return; bubText = s; const g = bubCv.getContext('2d'); g.clearRect(0, 0, 768, 160); g.font = '800 40px Archivo, sans-serif'; const w = Math.min(760, g.measureText(s).width + 56); g.fillStyle = '#f3f2f2'; g.fillRect(4, 4, w, 108); g.strokeStyle = '#201e1d'; g.lineWidth = 6; g.strokeRect(4, 4, w, 108); g.beginPath(); g.moveTo(40, 112); g.lineTo(70, 150); g.lineTo(90, 112); g.closePath(); g.fillStyle = '#f3f2f2'; g.fill(); g.stroke(); g.fillStyle = '#201e1d'; g.textBaseline = 'middle'; g.fillText(s, 32, 60, w - 50); bubTex.needsUpdate = true; }
  vanceSay('Step right up, kid!');

  // ---------- BUGGER: the green bug truck (rival) ----------
  const BUG = { g: X.makeVeh('truck'), x: 15, z: -44, yaw: 0, sp: 0, tgt: null, spin: 0, cars: 0, pts: 0, bob: 0, hitCd: 0, home: [15, -44, -0.25] };
  BUG.V = BUG.g.userData.V; recolor(BUG.g, BUGMAP); scene.add(BUG.g);
  { const body = BUG.V.body, bb = new THREE.Box3().setFromObject(body), top = bb.max.y - BUG.g.position.y, front = bb.max.z;
    const white = toon('#f3f2f2'), lime = toon('#a3e635');
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.34, 14, 10), white, s * 0.62, 2.95, front - 0.45, body, 0.03, 0.34); M(new THREE.SphereGeometry(0.16, 10, 8), ink, s * 0.62, 2.98, front - 0.16, body, 0); const a = M(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), ink, s * 0.5, top + 0.55, 0.2, body, 0.01); a.rotation.z = -s * 0.35; a.rotation.x = 0.45; M(new THREE.SphereGeometry(0.16, 10, 8), lime, s * 0.78, top + 1.22, 0.55, body, 0.02, 0.16); }
    for (const [x, z] of [[0.7, 1.2], [-0.6, 0.9], [0.3, -1.6], [-0.8, -1.9]]) M(new THREE.CylinderGeometry(0.22, 0.22, 0.04, 12), ink, x, 2.68, z, body, 0);
    const drv = X.kit.makeFox({ ...X.CAST.player, look: { ...X.CAST.player.look, fur: '#5f5a55', tailMid: '#5f5a55', paw: '#201e1d' }, torso: ['#5aa02c', '#201e1d', '#a3e635'], outfit: 'armor', crest: '', gear: 'none', mood: 'angry' });
    const DP = drv.userData.P; if (DP.sword) DP.sword.visible = false; if (DP.gun) DP.gun.visible = false; if (DP.legs) DP.legs.forEach(l => l.rotation.x = -1.45); if (BUG.V.seat) drv.position.copy(BUG.V.seat); body.add(drv);
    const t = tag('BUGGER', '#a3e635'); t.position.y = top + 2.2; BUG.g.add(t); }
  BUG.prop = { kind: 'rival', custom: true, noRespawn: true, bug: true, g: BUG.g, x: BUG.x, z: BUG.z, r: 2.4, h: 3.2, hp: 1e6, home: [BUG.x, BUG.z], onHit: () => { if (BUG.hitCd > 0 || !bugLive()) return; BUG.hitCd = 2.5; BUG.spin = 1.6; flash('BUGGER SPUN OUT', '#a3e635', 1.4); addMove('SPIN OUT', 150, 'fire'); } };
  X.props.push(BUG.prop);
  function bugPark() { BUG.x = BUG.home[0]; BUG.z = BUG.home[1]; BUG.yaw = BUG.home[2]; BUG.sp = 0; BUG.tgt = null; BUG.spin = 0; BUG.g.position.set(BUG.x, 0, BUG.z); BUG.g.rotation.set(0, BUG.yaw, 0); }
  bugPark();

  // ---------- chalk sheet ----------
  const boardCv = document.createElement('canvas'); boardCv.width = 1600; boardCv.height = 900; const boardCvP = document.createElement('canvas'); boardCvP.width = 900; boardCvP.height = 1600;
  function drawBoard(g, P = false) {
    const W = P ? 900 : 1600, H = P ? 1600 : 900, J = (n = 1.6) => (Math.random() - 0.5) * n * 2;
    g.fillStyle = '#5a3a2a'; g.fillRect(0, 0, W, H); const x0 = 34, y0 = 34, w = W - 68, h = H - 98; g.fillStyle = '#1f2b27'; g.fillRect(x0, y0, w, h);
    for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.03})`; g.beginPath(); g.ellipse(x0 + Math.random() * w, y0 + Math.random() * h, 40 + Math.random() * 160, 20 + Math.random() * 60, Math.random() * 3, 0, TAU); g.fill(); }
    const CH = '#f2f1e8', YL = '#f5e08a', RD = '#ff9a8a', BL = '#9fd8f5', GR = '#b6e3a0', HF = '"Caveat", "Segoe Print", "Bradley Hand", cursive';
    const txt = (s, x, y, size, col = CH, wt = 800, fam = 'Archivo, sans-serif') => { g.font = `${wt} ${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.globalAlpha = 0.92; g.fillStyle = col; g.fillText(s, x + J(1), y + J(1)); g.globalAlpha = 1; };
    const hw = (s, x, y, size, col = YL) => txt(String(s).toUpperCase(), x, y, size, col, 700, HF);
    const circ = (x, y, r, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.globalAlpha = 0.9; g.beginPath(); g.arc(x + J(), y + J(), r, 0, TAU); g.stroke(); g.globalAlpha = 1; };
    const ln = (pts, col = CH, wd = 5) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = 'round'; g.globalAlpha = 0.9; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + J(), y + J()) : g.moveTo(x + J(), y + J())); g.stroke(); g.globalAlpha = 1; };
    txt('FOXTRUCK CRUSH', 86, 150, P ? 92 : 112, CH, 900); txt('RINGMASTER VANCE  ·  ZION MONSTER ARENA', 90, 202, P ? 26 : 30, YL, 800); ln([[88, 226], [P ? 800 : 1500, 226]], CH, 4);
    const rows = [['STICK', 'WASD', 'Drive  ·  roll over cars to CRUSH them', CH], ['1', 'J', 'Fireball  ·  finds the car in front', RD], ['2', 'K', 'Oil slick behind you', BL], ['3', 'SPACE', 'Nitro  ·  before ramps + the crest', YL], ['!', '', 'FIRE BARRELS: shoot them, never drive into them', RD], ['EYE', 'V', 'Hold the eye + drag to look  ·  tap = POV', CH]];
    rows.forEach(([k, kb, d, col], i) => { const y = 300 + i * (P ? 96 : 86), cx2 = 150, cyy = y - 14;
      if (k === 'STICK') { circ(cx2, cyy, 31, CH, 4); g.globalAlpha = 0.5; g.fillStyle = CH; g.beginPath(); g.arc(cx2 + 6, cyy - 9, 14, 0, 7); g.fill(); g.globalAlpha = 1; }
      else if (k === 'EYE') { circ(cx2, cyy, 30, CH, 4); ln([[cx2 - 19, cyy], [cx2, cyy - 10], [cx2 + 19, cyy], [cx2, cyy + 10], [cx2 - 19, cyy]], CH, 4); circ(cx2, cyy, 5, CH, 4); }
      else { circ(cx2, cyy, 30, col, 8); txt(k, cx2 - 11, cyy + 14, 40, col, 900); }
      txt(kb, 230, y - 24, 18, '#b9c4bf', 800); txt(d, 230, y + 4, P ? 28 : 30, CH, 700); });
    const L = ['1 SCHOOL  ·  6 lessons', '2 CRUSH LINES  ·  combo rows', '3 BIG AIR  ·  fly the stacks', '4 FIREBALL ALLEY  ·  bullseyes', '5 FREESTYLE  ·  everything', '6 VS BUGGER  ·  more cars', '7 THE FINAL  ·  trophy + gold paint'];
    if (P) { L.forEach((l, i) => hw(l, 90, 830 + i * 64, 40, i === 6 ? YL : CH)); hw('Keep crushing = COMBO', 90, 1330, 42, GR); hw('Full crowd meter = DOUBLE POINTS', 90, 1384, 38, YL); }
    else { L.forEach((l, i) => hw(l, 920, 300 + i * 56, 36, i === 6 ? YL : CH)); hw('Keep crushing = COMBO', 920, 720, 38, GR); hw('Full crowd = DOUBLE POINTS', 920, 770, 36, YL); }
    g.fillStyle = '#3e2618'; g.fillRect(0, H - 64, W, 64); g.fillStyle = '#5a3a2a'; g.fillRect(0, H - 64, W, 10);
    for (let i = 0; i < 5000; i++) { g.fillStyle = 'rgba(31,43,39,0.55)'; g.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, 1 + Math.random() * 2, 1 + Math.random() * 2); } }
  const paintBoards = () => { drawBoard(boardCv.getContext('2d')); drawBoard(boardCvP.getContext('2d'), true); course.boardURL = boardCv.toDataURL('image/jpeg', 0.9); course.boardURLP = boardCvP.toDataURL('image/jpeg', 0.9); course.onPaint && course.onPaint(); };
  try { if (!document.getElementById('font-caveat')) { const lk = document.createElement('link'); lk.id = 'font-caveat'; lk.rel = 'stylesheet'; lk.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap'; document.head.appendChild(lk); } } catch (e) {}

  // ---------- arena rock loop (synth until Ben uploads MP3s): 132 bpm power chords ----------
  const MU = { next: 0, step: 0, bus: null }, ROOTS = [40, 40, 45, 43], mf = n => 440 * Math.pow(2, (n - 69) / 12);
  function env(c, node, t, a, peak, d) { const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + a); gn.gain.exponentialRampToValueAtTime(0.0001, t + a + d); node.connect(gn); gn.connect(MU.bus); node.start(t); node.stop(t + a + d + 0.05); }
  function noise(c, t, type, f, peak, d) { const s = c.createBufferSource(); s.buffer = X.audio.noise; const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; const gn = c.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(peak, t + 0.002); gn.gain.exponentialRampToValueAtTime(0.0001, t + d); s.connect(b); b.connect(gn); gn.connect(MU.bus); s.start(t); s.stop(t + d + 0.05); }
  function musicStep() { const a = X.audio, c = a.ctx; if (!c || !a.master || !a.noise) return;
    if (!MU.bus) { MU.bus = c.createGain(); MU.bus.gain.value = 0.4; const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2400; MU.bus.connect(lp); lp.connect(a.master); }
    const spb = 60 / 132 / 4; if (MU.next < c.currentTime) MU.next = c.currentTime + 0.05;
    while (MU.next < c.currentTime + 0.25) { const s = MU.step, b = s % 16, rt = ROOTS[Math.floor(s / 16) % 4], t = MU.next;
      if (b % 2 === 0) [0, 7].forEach(iv => { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = mf(rt + iv); env(c, o, t, 0.004, 0.035, 0.14); });
      if (b === 0 || b === 10) [12, 19].forEach(iv => { const o = c.createOscillator(); o.type = 'square'; o.frequency.value = mf(rt + iv); env(c, o, t, 0.01, 0.015, 0.5); });
      if (b % 4 === 0 || b === 14) { const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12); env(c, o, t, 0.002, 0.16, 0.16); }
      if (b === 4 || b === 12) noise(c, t, 'bandpass', 1600, 0.08, 0.16); noise(c, t, 'highpass', 7500, b % 2 ? 0.008 : 0.016, 0.04);
      MU.step++; MU.next += spb; } }

  // ---------- state ----------
  const G = { hp: 100, towT: 0, barrels: 0, phase: 'ready', board: true, place: 'school', t: 0, pts: 0, les: 0, cnt: 0, nextT: 0, count: 0, banner: '', bannerT: 0, radio: '', radioT: 0, flash: null, flashT: 0, done: null, cars: 0, bulls: 0, bestAir: 0, bestCombo: 0, bestComboN: 0, crowd: 0, wildT: 0, stuckT: 0, cp: [0, -40, 0], ending: 0, launch: null, moundCd: 0, painted: false, hypeT: 0 };
  const CB = { n: 0, pot: 0, idle: 0 };
  let A = null, P = null;
  const banner = (s, t = 3) => { G.banner = s; G.bannerT = t; }, radio = (s, t = 6) => { G.radio = s; G.radioT = t; }, flash = (txt, col = '#ffd23a', t = 1.6) => { G.flash = { txt, col }; G.flashT = t; };
  const PL = () => PLACES.find(p => p.id === G.place), LID = () => LESSONS[G.les].id, inSchool = id => G.place === 'school' && G.phase === 'run' && LID() === id && !G.nextT;
  const fmtT = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') + '.' + Math.floor((s % 1) * 10);
  const C = () => X.C, Vv = () => X.V, bugLive = () => (G.place === 'rival' || G.place === 'final') && G.phase === 'run';
  const W = { lines: { crush: 1, air: 0.25, fire: 0.25 }, air: { crush: 0.25, air: 1, fire: 0.25 }, fire: { crush: 0.25, air: 0.25, fire: 1 } };
  function snapP() { const c = C(); P = { x: c.x, z: c.z, y: c.y, g: c.ground }; }
  function paintPlayer() { let has = false; try { has = save.flag('truckPaintGold'); } catch (e) {} if (has && X.veh) recolor(X.veh, GOLDMAP); if (has && G_goldTag) G_goldTag.visible = false; }
  function tp(x, z, yaw = 0) { X.place(x, z, yaw); const c = C(); c.nitro = 0; A = null; G.launch = null; snapP(); }
  function respawnAll() { for (const o of BARRELS) { o.dead = false; o.boomed = false; o.hp = 1; o.drop = -1; o.deadT = 0; o.g.visible = true; o.g.position.y = 0; } for (const o of CARS) { o.dead = false; o.deadT = 0; o.drop = -1; o.hp = 20; o.sq.scale.set(1, 1, 1); o.g.position.y = o.y0; o.meshes.forEach(m => m.material = carMat); o.g.visible = true; if (o.ring) o.ring.visible = true; } }
  function resetRun() { Object.assign(G, { hp: 100, towT: 0, barrels: 0, t: 0, pts: 0, cars: 0, bulls: 0, bestAir: 0, bestCombo: 0, bestComboN: 0, crowd: 0, wildT: 0, done: null, flash: null, banner: '', radio: '', nextT: 0, ending: 0, stuckT: 0 }); CB.n = CB.pot = CB.idle = 0; BUG.cars = 0; BUG.pts = 0; BUG.wait = 0; respawnAll(); bugPark(); }

  // ---------- scoring ----------
  function addMove(name, pts, cat = 'crush') { const k = (W[G.place] && W[G.place][cat]) ?? 1, v = Math.round(pts * k / 5) * 5; const c = C(); CB.n++; CB.pot += v; CB.idle = 0; G.last = name + ' +' + v; G.lastT = 1.2; }
  const mult = n => 1 + (n - 1) * 0.25;
  function bank() { if (!CB.n) return; const n = CB.n, wild = G.wildT > 0, v = Math.round(CB.pot * mult(n) * (wild ? 2 : 1)); G.pts += v; if (v > G.bestCombo) { G.bestCombo = v; G.bestComboN = n; }
    if (n >= 4) flash('COMBO ×' + n + ' · +' + v + (wild ? ' · DOUBLE' : ''), '#ffd23a', 1.4); if (n >= 6 && inSchool('line')) lesCount();
    if (G.wildT <= 0) { G.crowd = Math.min(1, G.crowd + v / 2600); if (G.crowd >= 1 && G.place !== 'school') { G.wildT = 10; G.crowd = 0; banner('THE CROWD GOES WILD · DOUBLE POINTS', 3); X.audio.burst(1.2, 900, 0.16); vanceSay('LISTEN TO THAT CROWD!'); } }
    if (v > 600 && G.hypeT <= 0) { G.hypeT = 6; vanceSay(HYPE[Math.floor(Math.random() * HYPE.length)]); X.audio.burst(0.9, 1100, 0.1); }
    CB.n = CB.pot = CB.idle = 0; }
  const BOOMS = [];
  function barrelBoom(o, by) { if (o.dead && o.boomed) return; o.dead = true; o.boomed = true; o.deadT = 0; o.g.visible = false; G.barrels++; const p = V3(o.x, 0.8, o.z);
    X.boom(p, 4.2, 0xff7a1a); X.puff(p, 0xffc04a, 16, 7, 0.4, 0.5, true); X.puff(p, 0x2a2826, 10, 3, 2, 1.4); X.St.shake = Math.max(X.St.shake, 0.8); X.audio.burst(0.6, 260, 0.4);
    const c = C(), d = Math.hypot(c.x - o.x, c.z - o.z); if (by === 'crush' || d < 5.5) truckHit(by === 'crush' ? 25 : Math.round(25 * (1 - d / 6)), o);
    else if (G.phase === 'run') addMove('KABOOM', 200, 'fire');
    BOOMS.push({ x: o.x, z: o.z, t: 0.12 }); }
  function truckHit(n, o) { if (G.phase !== 'run' || DM.on || n <= 0) return; const c = C(); G.hp = Math.max(0, G.hp - n); CB.n = CB.pot = CB.idle = 0; c.speed *= 0.35; if (c.ground) { c.ground = false; c.vy = 6; c.y += 0.05; G.launch = 'bump'; } const a = Math.atan2(c.x - o.x, c.z - o.z); c.x += Math.sin(a) * 1.5; c.z += Math.cos(a) * 1.5;
    flash('BOOM · ARMOUR −' + n, '#ec3013', 1.6); X.audio.tone(70, 0.5, 0.1, 'sawtooth', 0.4);
    if (G.hp <= 0) { G.towT = 1.6; flash('TRUCK WRECKED · TOWED TO THE PIT', '#ec3013', 2); if (G.place !== 'school') G.pts = Math.max(0, G.pts - 300); } }
  function onSmash(o, by) {
    if (o.barrel) { barrelBoom(o, by); return; }
    if (o.bug) { o.dead = false; if (BUG.hitCd <= 0 && bugLive()) { BUG.hitCd = 1; X.audio.burst(0.2, 400, 0.25); } return; }
    if (!CARS.includes(o)) return; crushFx(o);
    const c = C(), air = c.y > 1.0 + o.y0 || (!c.ground && !!A && A.src !== 'bump');
    if (by === 'blast' || by === 'fire') { if (o.target) { G.bulls++; addMove('BULLSEYE', 250, 'fire'); if (inSchool('fire')) lesCount(); } else addMove('TORCHED', 120, 'fire'); }
    else { addMove(air ? (o.stack ? 'STACK SMASH' : 'AIR CRUSH') : o.target ? 'PLINTH CRUSH' : 'CRUSH', (air ? 200 : 100) * (o.stack ? 2 : 1), air ? 'air' : 'crush');
      if (inSchool('crush')) lesCount(); if (air && o.stack && inSchool('stack')) lesCount();
      if (c.ground && !onRamp(c.x, c.z)) { c.speed = c.speed / 0.85 * 0.97; c.ground = false; c.vy = 3.4; c.y += 0.05; G.launch = 'bump'; } else if (c.ground) c.speed = c.speed / 0.85; X.St.shake = Math.max(X.St.shake, 0.35); }
    G.cars += o.stack ? 2 : 1; }
  function crushFx(o) { o.dead = true; o.deadT = 0; flyWheels(o, o.stack ? 3 : 2); o.meshes.forEach(m => m.material = flatMat); if (o.ring) o.ring.visible = false; o.g.rotation.z = rr(-0.08, 0.08);
    tmp.set(o.x, o.y0 + 1, o.z); X.puff(tmp, 0xffc04a, 12, 5, 0.35, 0.45, true); X.puff(tmp, 0xb8a77a, 8, 3, 1.3, 0.8); X.puff(tmp, 0xa5d8ea, 5, 4, 0.25, 0.5, true);
    X.audio.burst(0.35, 480, 0.3); X.audio.burst(0.12, 2600, 0.12); X.audio.tone(90, 0.3, 0.08, 'square', 0.5); }
  function lesCount() { if (G.place !== 'school' || G.nextT || DM.on || G.phase !== 'run') return; G.cnt++; G.stuckT = 0; X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.2); if (G.cnt >= LESSONS[G.les].need) lesPass(); }
  function lesPass() { bank(); G.pts += 200; flash('LESSON ' + (G.les + 1) + ' PASSED · +200', '#ffd23a', 2.2); radio(PASS[G.les], 4); vanceSay(PASS[G.les]); G.nextT = 2.2; X.audio.burst(0.9, 1000, 0.12); }
  function lesEnter(i, quiet) { G.les = i; G.cnt = 0; G.stuckT = 0; const L = LESSONS[i]; G.cp = [L.start[0], L.start[1], L.start[2]]; tp(...G.cp); respawnAll(); if (!quiet) { banner('LESSON ' + (i + 1) + ' · ' + L.name, 2.6); } radio(L.radio, 7); vanceSay(L.name + '!'); }

  function finish() { if (DM.on || G.phase === 'done') return; bank(); const pd = PL(), id = G.place; let total = Math.round(G.pts), grade = 'C', title = '', trophy = false, paint = false, has = false, nb = false, best = 0, gold = 0;
    try { has = save.flag('truckChamp'); } catch (e) {}
    const G4 = pd.g, gradeOf = v => G4 ? (v >= G4[0] ? 'S' : v >= G4[1] ? 'A' : v >= G4[2] ? 'B' : v >= G4[3] ? 'C' : 'D') : 'A';
    const rows = [['Cars crushed', String(G.cars)], ['Best combo', G.bestCombo ? G.bestCombo + ' (×' + G.bestComboN + ')' : '—'], ['Biggest air', G.bestAir ? G.bestAir.toFixed(1) + ' s' : '—'], ['Bullseyes', String(G.bulls)], ['Barrels blown', String(G.barrels)]];
    if (id === 'school') { grade = G.t < 150 ? 'S' : 'A'; title = 'SCHOOL DONE · ' + fmtT(G.t).slice(0, -2); try { save.setFlag('truckSchool'); } catch (e) {} rows.unshift(['Lessons', '6 / 6']); }
    else if (id === 'rival') { const win = G.cars > BUG.cars; grade = win ? (G.cars - BUG.cars >= 5 ? 'S' : 'A') : G.cars === BUG.cars ? 'B' : 'C'; title = win ? 'YOU BEAT BUGGER' : G.cars === BUG.cars ? 'A DRAW' : 'BUGGER WINS THIS ONE'; rows.unshift(['You vs BUGGER', G.cars + ' – ' + BUG.cars + ' cars']); if (win) try { save.setFlag('truckBugger'); } catch (e) {} }
    else if (id === 'final') { const win = total > BUG.pts; grade = win ? (total > BUG.pts * 2 ? 'S' : 'A') : 'C'; title = win ? 'FOXTRUCK CHAMPION!' : 'BUGGER TAKES THE FINAL'; rows.unshift(['BUGGER', BUG.pts + ' pts · ' + BUG.cars + ' cars']);
      if (win && !has) { try { save.setFlag('truckChamp'); save.addRelic('foxtruckTrophy'); save.setFlag('truckPaintGold'); } catch (e) {} trophy = true; paint = true; paintPlayer(); } }
    else { grade = gradeOf(total); title = grade === 'S' ? 'MONSTER!' : grade === 'A' ? 'THE CROWD LOVES YOU' : grade === 'B' ? 'NICE CRUNCHING' : 'KEEP CRUSHING'; }
    const key = 'zion.truck.' + id + '.best'; try { nb = save.best(key, total); best = save.stat(key, total); gold = Math.max(5, Math.round(total / 100)); save.addGold(gold); } catch (e) {}
    const order = PLACES.map(p => p.id), next = order[order.indexOf(id) + 1] || null;
    G.done = { id, name: pd.name, title, next, total, grade, newBest: nb, best, gold, rows, trophy, paint }; G.phase = 'done'; X.setPaused(true); X.drive(0, 0);
    vanceSay(trophy ? 'THE NEW FOXTRUCK CHAMPION!' : grade === 'S' || grade === 'A' ? 'What a show!' : 'Again! The crowd wants more!'); }
  function rollOut(id = G.place) { X.audio.init && X.audio.init(); DM.on = false; resetRun(); G.place = PLACES.some(p => p.id === id) ? id : 'school'; G.board = false; G.phase = 'count'; G.count = 3.2; X.setPaused(false); paintPlayer();
    if (G.place === 'school') lesEnter(0, true); else { G.cp = [0, -40, 0]; tp(...G.cp); if (G.place === 'rival' || G.place === 'final') { BUG.x = 8; BUG.z = -40; BUG.yaw = 0; } }
    const pd = PL(); banner(G.place === 'school' ? 'TRUCK SCHOOL · LESSON 1' : pd.name + ' · ' + pd.time + ' S', 3);
    if (G.place !== 'school') radio(pd.line, 6); vanceSay(G.place === 'rival' || G.place === 'final' ? 'BUGGER versus THE FOX!' : 'Start your engines!'); }

  // ---------- guidance ----------
  function nearestCar(f) { const c = C(); let b = null, bd = 1e9; for (const o of CARS) { if (o.dead || o.drop >= 0 || (f && !f(o))) continue; const d = Math.hypot(o.x - c.x, o.z - c.z); if (d < bd) { bd = d; b = o; } } return b; }
  function nextGoal() { if (G.phase !== 'run') return null;
    if (G.place === 'school') { if (G.nextT) return null; const id = LID();
      if (id === 'crush') { const o = nearestCar(q => q.row === 'W'); return o && { x: o.x, z: o.z, label: 'WEST ROW' }; }
      if (id === 'line') { const o = nearestCar(q => q.row === 'E'); return o && { x: o.x, z: o.z, label: 'EAST ROW' }; }
      if (id === 'air') return { x: RAMPS[0].x, z: RAMPS[0].z, label: 'RAMP 1' };
      if (id === 'stack') return { x: RAMPS[1].x, z: RAMPS[1].z, label: 'RAMP 2' };
      if (id === 'fire') { const o = nearestCar(q => q.target); return o && { x: o.x, z: o.z, label: 'BULLSEYE' }; }
      if (id === 'crest') return { x: 0, z: 0, label: 'THE CREST' }; }
    if (G.place === 'air') { const c = C(); const R = RAMPS[Math.hypot(c.x - RAMPS[0].x, c.z - RAMPS[0].z) < Math.hypot(c.x - RAMPS[1].x, c.z - RAMPS[1].z) ? 0 : 1]; return { x: R.x, z: R.z, label: 'RAMP ' + (RAMPS.indexOf(R) + 1) }; }
    if (G.place === 'fire') { const o = nearestCar(q => q.target); return o && { x: o.x, z: o.z, label: 'BULLSEYE' }; }
    const o = nearestCar(); return o && { x: o.x, z: o.z, label: 'CAR' }; }

  // ---------- cars + BUGGER per frame ----------
  const WG = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 12), WM = toon('#1c1c1e'), DEB = [];
  WG.rotateZ(Math.PI / 2);
  function flyWheels(o, n) { for (let i = 0; i < n; i++) { let d = DEB.find(q => q.t <= 0); if (!d) { if (DEB.length >= 10) continue; d = { m: new THREE.Mesh(WG, WM), v: V3(), w: V3(), t: 0 }; scene.add(d.m); DEB.push(d); } d.m.visible = true; d.m.position.set(o.x + rr(-1, 1), o.y0 + 0.6, o.z + rr(-1.5, 1.5)); d.v.set(rr(-6, 6), rr(5, 9), rr(-6, 6)); d.w.set(rr(-12, 12), rr(-12, 12), rr(-12, 12)); d.t = 1.8; } }
  function updDebris(dt) { for (const d of DEB) { if (d.t <= 0) continue; d.t -= dt; d.v.y -= 24 * dt; d.m.position.addScaledVector(d.v, dt); if (d.m.position.y < 0.38) { d.m.position.y = 0.38; d.v.y = Math.abs(d.v.y) * 0.4; d.v.x *= 0.7; d.v.z *= 0.7; } d.m.rotation.x += d.w.x * dt; d.m.rotation.y += d.w.y * dt; if (d.t <= 0) d.m.visible = false; } }
  function updBarrels(dt) { const c = C();
    for (let i = BOOMS.length - 1; i >= 0; i--) { const b = BOOMS[i]; b.t -= dt; if (b.t > 0) continue; BOOMS.splice(i, 1); for (const o of BARRELS) if (!o.dead && Math.hypot(o.x - b.x, o.z - b.z) < 6) barrelBoom(o, 'chain'); for (const o of CARS) if (!o.dead && o.drop < 0 && Math.hypot(o.x - b.x, o.z - b.z) < 4.5) onSmash(o, 'blast'); if (bugLive() && Math.hypot(BUG.x - b.x, BUG.z - b.z) < 5) BUG.prop.onHit(); }
    for (const o of BARRELS) { if (!o.dead) { const f = 1 + Math.sin(G.clock * 14 + o.k) * 0.18 + Math.sin(G.clock * 23 + o.k) * 0.1; o.f1.scale.setScalar(1.6 * f); o.f2.scale.setScalar(0.8 * f); o.f1.position.y = 1.55 + Math.sin(G.clock * 9 + o.k) * 0.05; continue; }
      o.deadT += dt; if (o.drop < 0) { if (o.deadT > 12 && Math.hypot(c.x - o.x, c.z - o.z) > 10) { o.drop = 0; o.g.visible = true; } }
      else { o.drop += dt; const t = o.drop; o.g.position.y = t < 0.5 ? 10 * (1 - (t / 0.5) ** 2) : 0; if (t > 0.6) { o.drop = -1; o.dead = false; o.boomed = false; o.hp = 1; o.g.position.y = 0; X.puff(tmp.set(o.x, 0.2, o.z), 0xb8a77a, 6, 2, 0.9, 0.5); } } } }
  function updCars(dt) { const c = C();
    for (const o of CARS) {
      if (o.ring && !o.dead) o.ring.material.opacity = 0.35 + Math.sin(G.clock * 5 + o.x) * 0.2;
      if (!o.dead) continue; o.deadT += dt;
      if (o.drop < 0) { o.sq.scale.y = damp(o.sq.scale.y, 0.3, 18, dt); o.sq.scale.x = o.sq.scale.z = damp(o.sq.scale.x, 1.1, 18, dt);
        const wait = G.place === 'fire' && o.target ? 5 : G.place === 'school' ? 6 : 9;
        if (o.deadT > wait && Math.hypot(c.x - o.x, c.z - o.z) > 10 && Math.hypot(BUG.x - o.x, BUG.z - o.z) > 7) { o.drop = 0; o.sq.scale.set(1, 1, 1); o.g.rotation.z = 0; o.meshes.forEach(m => m.material = carMat); } }
      else { o.drop += dt; const t = o.drop, y = t < 0.55 ? 12 * (1 - (t / 0.55) ** 2) : Math.abs(Math.sin((t - 0.55) * 9)) * 0.6 * Math.max(0, 1 - (t - 0.55) * 3); o.g.position.y = o.y0 + y;
        if (t > 0.55 && !o.thud) { o.thud = true; X.puff(tmp.set(o.x, o.y0 + 0.2, o.z), 0xb8a77a, 8, 2.5, 1.1, 0.6); X.audio.burst(0.15, 300, 0.12); }
        if (t > 0.9) { o.drop = -1; o.thud = false; o.dead = false; o.hp = 20; o.g.position.y = o.y0; if (o.ring) o.ring.visible = true; } } } }
  function updBug(dt) { const live = bugLive(), c = C(); BUG.hitCd -= dt;
    if (!live) { if (G.phase === 'ready' || G.place === 'school' || ['lines', 'air', 'fire', 'free'].includes(G.place)) { if (Math.hypot(BUG.x - BUG.home[0], BUG.z - BUG.home[1]) > 0.5 && G.phase !== 'count') bugPark(); } BUG.prop.x = BUG.x; BUG.prop.z = BUG.z; BUG.g.position.set(BUG.x, 0, BUG.z); BUG.g.rotation.set(0, BUG.yaw, 0); { const dx = c.x - BUG.x, dz = c.z - BUG.z, d = Math.hypot(dx, dz); if (d < 4.4 && d > 0.01 && c.y < 3) { c.x = BUG.x + dx / d * 4.4; c.z = BUG.z + dz / d * 4.4; c.speed *= 0.5; } } return; }
    BUG.wait = Math.max(0, (BUG.wait || 0) - dt);
    if (BUG.spin > 0) { BUG.spin -= dt; BUG.yaw += 9 * dt; BUG.sp = damp(BUG.sp, 0, 3, dt); }
    else if (BUG.wait > 0) BUG.sp = damp(BUG.sp, 0, 4, dt);
    else { if (!BUG.tgt || BUG.tgt.dead || BUG.tgt.drop >= 0) { let b = null, bs = 1e9; for (const o of CARS) { if (o.dead || o.drop >= 0 || o.stack || o.target) continue; const d = Math.hypot(o.x - BUG.x, o.z - BUG.z), dp = Math.hypot(o.x - c.x, o.z - c.z), s = d + (dp < 8 ? 25 : 0); if (s < bs) { bs = s; b = o; } } BUG.tgt = b; }
      const T = BUG.tgt, want = T ? Math.atan2(T.x - BUG.x, T.z - BUG.z) : BUG.yaw, err = wrap(want - BUG.yaw), top = G.place === 'final' ? 8.5 : 9;
      BUG.yaw += clamp(err, -1.7 * dt, 1.7 * dt); BUG.sp = damp(BUG.sp, T ? top * (Math.abs(err) > 1.2 ? 0.45 : 1) : 0, 1.6, dt); }
    BUG.x += Math.sin(BUG.yaw) * BUG.sp * dt; BUG.z += Math.cos(BUG.yaw) * BUG.sp * dt;
    { const r = Math.hypot(BUG.x, BUG.z); if (r < MR * 0.6 && r > 0.01) { BUG.x *= MR * 0.6 / r; BUG.z *= MR * 0.6 / r; } }
    for (const R of RAMPS) { const zc = (Math.min(R.z, R.land) + Math.max(R.z, R.land)) / 2; if (Math.abs(BUG.x - R.x) < 5.5 && Math.abs(BUG.z - zc) < 15) BUG.x = R.x + Math.sign(BUG.x - R.x || 1) * 5.5; }
    BUG.x = clamp(BUG.x, -AX + 2, AX - 2); BUG.z = clamp(BUG.z, -AZ + 2, AZ - 2);
    for (const o of BARRELS) { if (o.dead) continue; const dx = BUG.x - o.x, dz = BUG.z - o.z, d = Math.hypot(dx, dz); if (d < 3.4 && d > 0.01) { BUG.x = o.x + dx / d * 3.4; BUG.z = o.z + dz / d * 3.4; } }
    for (const [sx, sz, sr] of SOLIDS) { const dx = BUG.x - sx, dz = BUG.z - sz, d = Math.hypot(dx, dz), R = sr + 2; if (d < R && d > 0.01) { BUG.x = sx + dx / d * R; BUG.z = sz + dz / d * R; } }
    for (const o of CARS) { if (o.dead || o.drop >= 0 || o.target) continue; if (Math.hypot(o.x - BUG.x, o.z - BUG.z) < 2.6) { crushFx(o); BUG.cars += o.stack ? 2 : 1; BUG.pts += o.stack ? 240 : 120; BUG.bob = 0.5; BUG.wait = 1.4; } }
    { const dx = c.x - BUG.x, dz = c.z - BUG.z, d = Math.hypot(dx, dz); if (d < 4.4 && d > 0.01 && c.y < 2) { c.x = BUG.x + dx / d * 4.4; c.z = BUG.z + dz / d * 4.4; BUG.sp *= 0.6; } }
    BUG.bob = Math.max(0, BUG.bob - dt * 2); BUG.g.position.set(BUG.x, Math.sin(BUG.bob * 6) * BUG.bob * 0.6, BUG.z); BUG.g.rotation.set(-BUG.bob * 0.15, BUG.yaw, 0);
    (BUG.V.wheels || []).forEach(w => { if (w.sp) w.sp.rotation.x += BUG.sp * dt / (w.r || 1); });
    BUG.prop.x = BUG.x; BUG.prop.z = BUG.z; }

  // ---------- per-frame ----------
  G.clock = 0;
  function update(dt, thr, sp, rdt) {
    musicStep(); const c = C(), V = Vv(); if (!V) return; G.clock += rdt || dt || 0;
    if (!G.painted) { G.painted = true; paintPlayer(); }
    const hype = G.wildT > 0 ? 1 : 0.15 + G.crowd * 0.5; sides.forEach(s => { s.grp.position.y = Math.max(0, Math.sin(G.clock * (6 + hype * 4) + s.ph)) * 0.35 * hype; });
    FLAGS.forEach(f => { f.pv.rotation.y = Math.sin(G.clock * 2.4 + f.k) * 0.5; });
    vance.rotation.y = damp(vance.rotation.y, vance.rotation.y + wrap(Math.atan2(c.x - vance.position.x, c.z - vance.position.z) - vance.rotation.y), 3, Math.max(dt, 0.016));
    if (!dt) { if (!P) snapP(); return; }
    updCars(dt); updBarrels(dt); updDebris(dt); updBug(dt); G.hypeT -= dt;
    if (G.towT > 0) { G.towT -= dt; if (G.towT <= 0) { G.hp = 100; tp(0, -40, 0); flash('ARMOUR REPAIRED', '#22c55e', 1.4); } }
    if (G.hp < 50 && G.phase === 'run' && Math.random() < dt * (G.hp < 25 ? 14 : 6)) X.puff(tmp.set(C().x, C().y + 3, C().z), 0x3a3836, 1, 1.5, 1.2, 1.2);
    if (DM.on) demoStep(dt);
    G.lastT = (G.lastT || 0) - dt; G.bannerT -= dt; if (G.bannerT <= 0) G.banner = ''; G.radioT -= dt; if (G.radioT <= 0) G.radio = ''; G.flashT -= dt; if (G.flashT <= 0) G.flash = null;
    if (G.phase === 'count') { G.count -= dt; const s = G.cp; c.x = s[0]; c.z = s[1]; c.speed = 0; if (G.count <= 0) { G.phase = 'run'; G.count = 0; banner('GO!', 1); X.audio.tone(880, 0.3, 0.06, 'square', 1.2); X.audio.burst(1.0, 900, 0.14); } else if (Math.ceil(G.count) !== Math.ceil(G.count + dt)) X.audio.tone(440, 0.15, 0.05, 'square', 1); snapP(); return; }
    if (G.phase !== 'run') { snapP(); return; }
    if (!P) snapP();
    G.t += dt; G.wildT = Math.max(0, G.wildT - dt); if (G.wildT <= 0) G.crowd = Math.max(0, G.crowd - dt * 0.02);
    if (G.place === 'school' && !G.nextT) { G.stuckT += dt; if (G.stuckT > 25) { G.stuckT = 0; radio(LESSONS[G.les].tip, 6); } }
    if (G.nextT > 0) { G.nextT -= dt; if (G.nextT <= 0) { G.nextT = 0; if (G.les + 1 < LESSONS.length) lesEnter(G.les + 1); else finish(); } }
    // walls + solids
    const fast = Math.abs(c.speed) > 6;
    if (Math.abs(c.x) > AX || Math.abs(c.z) > AZ) { c.x = clamp(c.x, -AX, AX); c.z = clamp(c.z, -AZ, AZ); if (fast) { X.St.shake = Math.max(X.St.shake, 0.4); X.audio.burst(0.15, 700, 0.2); X.puff(tmp.set(c.x, 1, c.z), 0xb8a77a, 6, 2, 1, 0.6); } c.speed *= fast ? -0.3 : 0.4; }
    for (const [sx, sz, sr] of SOLIDS) { const dx = c.x - sx, dz = c.z - sz, d = Math.hypot(dx, dz), R = sr + 1.8; if (d < R && d > 0.01 && c.y < 3) { c.x = sx + dx / d * R; c.z = sz + dz / d * R; if (fast) X.audio.burst(0.12, 900, 0.15); c.speed *= 0.5; } }
    // crest launch: crossing the top at speed throws you off the far side
    G.moundCd -= dt; { const r = Math.hypot(c.x, c.z), fx = Math.sin(c.yaw), fz = Math.cos(c.yaw), inward = r > 0.01 ? -(c.x * fx + c.z * fz) / r : 1;
      if (c.ground && r < MR * 0.42 && inward > 0.3 && c.speed > 8 && G.moundCd <= 0) { c.ground = false; c.vy = Math.min(11, c.speed * 0.5); c.y += 0.05; G.launch = 'crest'; G.moundCd = 1.5; X.audio.burst(0.3, 600, 0.2); } }
    // air time
    if (P.g && !c.ground && !A) { A = { t: 0, src: G.launch || (onRamp(P.x, P.z) && P.y > 1.6 ? 'ramp' : 'drop') }; G.launch = null; if (A.src === 'ramp') { c.vy = Math.max(c.vy, Math.abs(c.speed) * 0.3); c.pitch = 0.25; } }
    if (A) { A.t += dt; if (c.ground) { const a = A; A = null;
      if (a.t > 0.55 && a.src !== 'bump') { G.bestAir = Math.max(G.bestAir, a.t); addMove(a.src === 'crest' ? 'CREST AIR ' + a.t.toFixed(1) + ' S' : 'AIR ' + a.t.toFixed(1) + ' S', Math.round(a.t * 300), 'air');
        if (a.src === 'ramp' && inSchool('air')) lesCount(); if (a.src === 'crest' && inSchool('crest')) lesCount(); } } }
    if (CB.n && c.ground && !A) { CB.idle += dt; if (CB.idle > 2) bank(); }
    const pd = PL();
    if (pd.time && G.t >= pd.time) { if (!G.ending) { flash('TIME!', '#ffd23a', 2); X.audio.tone(330, 0.5, 0.06, 'square', 0.6); } G.ending += dt; if ((c.ground && !A) || G.ending > 2.5) finish(); }
    snapP(); }

  // ---------- HUD ----------
  const _pv = new THREE.Vector3();
  function hud() { const pd = PL(), live = G.phase === 'run', c = C(); let goal = null;
    if (live && !DM.on) { const n = nextGoal(); if (n) { const dd = Math.hypot(c.x - n.x, c.z - n.z); if (dd > 8) { _pv.set(n.x, 1, n.z).project(X.camera); goal = { nx: _pv.x, ny: _pv.y, behind: _pv.z > 1, label: n.label, dist: Math.round(dd) }; } } }
    const bests = PLACES.map(p => { try { return save.stat('zion.truck.' + p.id + '.best', 0); } catch (e) { return 0; } });
    const id = G.place, sch = id === 'school', L = LESSONS[G.les], left = Math.max(0, (pd.time || 0) - G.t), kmh = Math.round(Math.abs(c.speed) * 3.6), vs = id === 'rival' || id === 'final';
    let trickTxt = kmh + ' KM/H', trickCol = '#7dd3fc';
    if (G.lastT > 0 && G.last) { trickTxt = G.last; trickCol = '#ffd23a'; } else if (A && !c.ground) { trickTxt = 'AIR ' + A.t.toFixed(1) + ' S'; trickCol = '#ffd23a'; } else if (c.nitro > 0) { trickTxt = 'NITRO · ' + kmh + ' KM/H'; trickCol = '#38bdf8'; } else if (G.wildT > 0) { trickTxt = 'DOUBLE POINTS · ' + Math.ceil(G.wildT) + ' S'; trickCol = '#ffd23a'; }
    const progress = sch ? (G.nextT ? 'LESSON ' + (G.les + 1) + ' PASSED' : (G.les + 1) + ' · ' + L.name + ' · ' + G.cnt + ' / ' + L.need + ' ' + L.unit) : id === 'rival' ? 'YOU ' + G.cars + ' · BUGGER ' + BUG.cars + ' CARS' : id === 'final' ? 'YOU ' + Math.round(G.pts) + ' · BUGGER ' + BUG.pts : id === 'fire' ? 'BULLSEYES ' + G.bulls : id === 'air' ? 'BIGGEST AIR ' + (G.bestAir ? G.bestAir.toFixed(1) + ' S' : '—') : 'CARS CRUSHED ' + G.cars;
    return { state: G.phase === 'ready' ? 'ready' : 'run', phase: G.phase, board: G.board, done: G.done, place: id, placeName: pd.name, room: ZION_ARENA.room,
      time: fmtT(sch ? G.t : left), over: false, low: !sch && left < 10,
      targetLbl: sch ? 'LESSON' : vs ? (id === 'rival' ? 'BUGGER CARS' : 'BUGGER PTS') : 'TOP GRADE', targetTxt: sch ? (G.les + 1) + ' / 6' : id === 'rival' ? String(BUG.cars) : id === 'final' ? String(BUG.pts) : String(pd.g[0]), lead: vs ? (id === 'rival' ? G.cars - BUG.cars : G.pts - BUG.pts) : 0,
      pts: Math.round(G.pts), comboN: CB.n, comboTxt: CB.n ? CB.pot + ' × ' + mult(CB.n).toFixed(2).replace(/0$/, '') + ' = ' + Math.round(CB.pot * mult(CB.n)) : '—', comboK: CB.n ? Math.max(0, 1 - CB.idle / 2) : 0, progress,
      les: sch ? G.les + (G.nextT ? 1 : 0) : 0, lesOf: LESSONS.length, banner: G.banner, radio: G.radio, flash: G.flash, count: G.phase === 'count' ? Math.ceil(G.count) : null, goal, bests, trickTxt, trickCol,
      hp: G.hp, cars: G.cars, bestAir: G.bestAir ? G.bestAir.toFixed(1) + ' S' : '—', crowd: G.wildT > 0 ? G.wildT / 10 : G.crowd, wild: G.wildT > 0, quest: sch ? 'Lesson ' + (G.les + 1) + ': ' + L.quest : pd.goal,
      demo: DM.on ? { cap: DM.cap, key: (DEMO[DM.i] || {}).key || '', n: DM.i + 1, of: DEMO.length } : null }; }

  // ---------- DEMO ----------
  const DM = { on: false, i: 0, t: 0, cap: '', f: {} };
  const steerTo = (tx, tz, th = 1) => { const c = C(), d = wrap(Math.atan2(tx - c.x, tz - c.z) - c.yaw); X.drive(th, clamp(-d * 2.5, -1, 1)); };
  const tap = n => { X.press(n, true); X.press(n, false); };
  const go = (place, x, z, yaw, sp) => { G.place = place; G.phase = 'run'; if (place === 'school') { G.les = 0; G.nextT = 0; } tp(x, z, yaw); C().speed = sp; DM.f = {}; };
  const DEMO = [
    { d: 4.4, key: 'STICK', cap: 'STICK = DRIVE. ROLL RIGHT OVER THE JUNK CARS TO CRUSH THEM', on() { resetRun(); go('free', -48, -30, 0, 10); }, tick() { steerTo(-48, 30, 1); } },
    { d: 3.6, key: '!', cap: 'KEEP CRUSHING = COMBO. STOP FOR 2 SECONDS AND IT BANKS', on() { go('free', 48, -28, 0, 14); }, tick() { steerTo(48, 30, 1); } },
    { d: 4.4, key: '3', cap: 'TAP 3 = NITRO. FLY THE RAMP AND COME DOWN ON THE CAR STACK', on() { go('free', -22, -42, 0, 14); }, tick() { steerTo(-22, 20, 1); if (DM.t > 0.3 && !DM.f.a) { DM.f.a = 1; tap(3); } } },
    { d: 4.6, key: '1', cap: 'TAP 1 = FIREBALL. THE ROOF CANNON FINDS THE CAR IN FRONT', on() { go('fire', 0, 16, 0, 3); }, tick() { const o = nearestCar(q => q.target) || CARS[0]; steerTo(o.x, o.z, 0.25); const k = Math.floor(DM.t / 1.1); if (k > (DM.f.k ?? -1) && DM.t > 0.4) { DM.f.k = k; tap(1); } } },
    { d: 4.2, key: '3', cap: 'FULL SPEED + NITRO OVER THE CREST MOUND = BIG AIR', on() { go('free', 0, -38, 0, 16); }, tick() { steerTo(0, 30, 1); if (DM.t > 0.3 && !DM.f.a) { DM.f.a = 1; tap(3); } } },
    { d: 4.4, key: 'GO', cap: 'THEN TAKE ON BUGGER: CRUSH MORE CARS THAN HIM. THE FINAL WINS THE TROPHY', on() { resetRun(); G.place = 'rival'; G.phase = 'run'; tp(0, -40, 0); BUG.x = 8; BUG.z = -40; BUG.yaw = 0; }, tick() { const o = nearestCar(q => !q.stack && !q.target); if (o) steerTo(o.x, o.z, 0.9); } }];
  function demoStep(dt) { const s = DEMO[DM.i]; DM.t += dt; if (s.tick) s.tick(dt); G.radio = ''; if (DM.t >= s.d) { DM.i++; DM.t = 0; if (DM.i >= DEMO.length) return demoStop(); const n = DEMO[DM.i]; DM.cap = n.cap; n.on && n.on(); } }
  function demoStart() { X.audio.init && X.audio.init(); DM.on = true; DM.i = 0; DM.t = 0; DM.cap = DEMO[0].cap; G.board = false; G.done = null; X.setPaused(false); DEMO[0].on(); }
  function demoStop() { DM.on = false; DM.cap = ''; X.drive(0, 0); resetRun(); G.place = 'school'; G.phase = 'ready'; tp(0, -40, 0); G.board = true; X.setPaused(true); }

  // ---------- API ----------
  const course = {
    start: { x: 0, z: -40, yaw: 0 }, stick: true, quietPopups: true, update, hud, onSmash, boardURL: '', boardURLP: '',
    groundH(x, z, h) { const m = moundH(Math.hypot(x, z)); return m > h ? m : h; },
    press(n) { if (G.board || G.done || G.phase !== 'run') return true; return false; },
    map: () => ({ b: [['Vance', vance.position.x, vance.position.z]], l: LIGHTS, t: CARS.filter(o => !o.dead).map(o => [o.x, o.z]), e: bugLive() ? [[BUG.x, BUG.z]] : [], q: (() => { const n = nextGoal(); return n ? [n.x, n.z, n.label] : null; })() }),
    reset() { if (G.phase !== 'run' || DM.on) return; tp(...G.cp); flash('BACK TO THE START', '#ffffff', 1.2); },
    rollOut, demoStart, demoStop, finish, say: s => flash(s, '#ffffff', 2),
    openBoard() { if (DM.on) return; G.board = true; X.setPaused(true); if (G.phase === 'done') G.done = null; },
    closeBoard() { G.board = false; if (G.phase === 'run' || G.phase === 'count') X.setPaused(false); },
    preview() {},
    _les(i) { G.board = false; X.setPaused(false); G.place = 'school'; G.phase = 'run'; lesEnter(i); },
    _dbg: () => ({ phase: G.phase, place: G.place, les: G.les, cnt: G.cnt, pts: G.pts, cars: G.cars, combo: CB.n, bug: [BUG.cars, BUG.pts, +BUG.x.toFixed(1), +BUG.z.toFixed(1)], x: +C().x.toFixed(2), z: +C().z.toFixed(2), y: +C().y.toFixed(2), sp: +C().speed.toFixed(2), ground: C().ground, air: A ? A.src + ':' + A.t.toFixed(2) : null, dead: CARS.filter(o => o.dead).length, crowd: +G.crowd.toFixed(2) }) };
  X.setPaused(true);
  setTimeout(paintBoards, 30); setTimeout(() => document.fonts && document.fonts.load('700 50px "Caveat"').then(() => paintBoards()).catch(() => {}), 1500);
  return course;
}
