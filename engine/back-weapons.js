// s223 BACK WEAPONS: every melee weapon in the 8 GATES shops, worn on the fox's back in place of the sword sheath.
// Each builder makes the weapon along local +y, flat side facing the back (xy plane). The mount sits on FP.body.
//   mountBackWeapon({ THREE, M, toon }, fox, key, fit?) → hides the sword sheath (G.backAnchor) and straps `key` on instead ('sword' = the normal sheath)
//   Fit (Back Weapons Lab) is saved in localStorage 'backWeapons.fit' → loadBackFit()
export const BACK_WEAPONS = [   // s225 Ben's melee = the Combat Workshop list + HALBERD
  { key: 'sword', name: 'SWORD', from: 'Balanced 3-hit combo · Fox Fighters sheath' },
  { key: 'racket', name: 'TENNIS RACKET', from: 'Two-handed · 2 = 360° spin that returns shots' },
  { key: 'gloves', name: 'BOXING GLOVES', from: '4× faster, half damage · laced over the shoulder' },
  { key: 'spear', name: 'SPEAR', from: '50% more reach, 25% less damage' },
  { key: 'maul', name: 'WAR HAMMER', from: 'Half speed, more reach · smashes crates' },
  { key: 'halberd', name: 'HALBERD', from: 'Meru · Kufa · Nebo · Luxor armories' },
  { key: 'bat', name: 'BASEBALL BAT', from: 'new · wooden slugger, knob down' },
  { key: 'net', name: 'BUG NET', from: 'new · catch butterflies, bugs + critters' },
  { key: 'flail', name: 'BALL AND CHAIN', from: 'new · spiked iron ball on a chain, hangs + swings' },
  { key: 'whip', name: 'BULLWHIP', from: 'new · coiled leather whip, handle up, tail swaying' }];
export const BACK_FIT = {   // s231 Ben's melee placements saved from the lab
  sword: { x: 0.118, y: 1.079, z: -0.5, ang: -16, lean: 0, twist: -34, s: 1 },   // s234 Ben: sheath lies FLAT along the chest strap (parallel, on top of it, wide face against the back)   // s233 offsets on the Sword Workshop fit (y 1.22 / z -0.45 = no change)
  racket: { x: 0, y: 1.35, z: -0.48, ang: -35, lean: -6, s: 1.1 },
  gloves: { x: 0, y: 1.53, z: -0.345, ang: 0, lean: 29, s: 1.11 },
  spear: { x: 0, y: 1.22, z: -0.405, ang: -44, lean: -6, s: 1 },
  maul: { x: 0, y: 1.27, z: -0.4, ang: -45, lean: -6, s: 1 },
  halberd: { x: 0, y: 1.22, z: -0.385, ang: -45, lean: -6, s: 1 },
  bat: { x: 0, y: 1.19, z: -0.435, ang: -44, lean: -6, s: 1.22 },
  net: { x: 0.1, y: 1.22, z: -0.405, ang: -48, lean: -6, s: 1 },
  flail: { x: 0.05, y: 1.3, z: -0.45, ang: -40, lean: -6, s: 1.2 },
  whip: { x: 0.1, y: 1.22, z: -0.46, ang: -10, lean: -6, s: 1.35 },
  staff: { y: 1.22, z: -0.47, ang: -36, lean: -6, s: 1 },
  wrench: { y: 1.2, z: -0.47, ang: -32, lean: -6, s: 1 },
  bow: { y: 1.2, z: -0.46, ang: 32, lean: -6, s: 1 },
  claws: { y: 1.3, z: -0.47, ang: 0, lean: -6, s: 1.15 } };
// s224 RANGED: how each ranged weapon is worn when it is not in the paw (replaces the hip laser; the sword stays on the back)
export const RANGED_WEAPONS = [   // s225 Ben's ranged = the Combat Workshop list + CROSSBOW + LASER RIFLE
  { key: 'laser', name: 'LASER', from: 'Fast homing bolts · hip holster' },
  { key: 'staffR', name: 'STAFF', from: 'Exploding fireballs · on the back' },
  { key: 'scatter', name: 'SCATTER GUN', from: '5 short beams · slung on the back' },
  { key: 'rocket', name: 'ROCKET LAUNCHER', from: 'Triple damage, blast · on the back' },
  { key: 'crossbow', name: 'CROSSBOW', from: 'new · slung across the back' },
  { key: 'rifle', name: 'LASER RIFLE', from: 'new · slung across the back' },
  { key: 'flame', name: 'FLAMETHROWER', from: 'new · fuel tank on the back, the flame wand on the hip' },
  { key: 'freeze', name: 'FREEZE THROWER', from: 'new · coolant tank on the back, the frost wand on the hip' },
  { key: 'fog', name: 'FOG THROWER', from: 'new · fog tank on the back, the wand on the hip · fog goggles' }];
export const RANGED_FIT = {   // s232 Ben's ranged placements saved from the lab
  staffR: { x: 0, y: 1.22, z: -0.5, ang: 36, lean: -6, s: 1 },
  scatter: { x: 0, y: 1.38, z: -0.55, ang: 30, lean: -6, s: 1 },
  ice: { x: -0.46, y: 0.9, z: 0.08, ang: 8, lean: 90, s: 1 },
  rocket: { x: 0, y: 1.37, z: -0.58, ang: 30, lean: -6, s: 1 },
  crossbow: { x: 0, y: 1.29, z: -0.5, ang: 32, lean: -6, s: 1.1 },
  rifle: { x: 0, y: 1.41, z: -0.51, ang: 34, lean: -6, s: 1 },
  flame: { x: 0, y: 1.12, z: -0.62, ang: 0, lean: -4, s: 1.2 },
  flameHip: { x: -0.46, y: 0.9, z: 0.08, ang: 8, lean: 90, s: 1 },
  freeze: { x: 0, y: 1.12, z: -0.62, ang: 0, lean: -4, s: 1.2 },
  freezeHip: { x: -0.46, y: 0.9, z: 0.08, ang: 8, lean: 90, s: 1 },
  fog: { x: 0, y: 1.12, z: -0.62, ang: 0, lean: -4, s: 1.2 },
  fogHip: { x: -0.46, y: 0.9, z: 0.08, ang: 8, lean: 90, s: 1 },
  heal: { x: -0.46, y: 0.9, z: 0.08, ang: 8, lean: 90, s: 1 },
  twin: { x: 0.375, y: 0.9, z: 0.06, ang: -6, lean: 90, s: 0.76 },
  darts: { x: -0.43, y: 0.84, z: 0.1, ang: 6, lean: 0, s: 1.1 },
  sling: { x: -0.44, y: 0.88, z: 0.12, ang: 8, lean: 0, s: 1.15 } };
const ALL_FIT = () => ({ ...BACK_FIT, ...RANGED_FIT });
// s228 cloth that moves (the bug net): call tickBackWeapons(seconds) once per frame from the map / lab
const WAVERS = new Set();
export function tickBackWeapons(time) { for (const w of WAVERS) { if (!w.obj.parent) { WAVERS.delete(w); continue; } let vis = true; for (let o = w.obj; o; o = o.parent) if (!o.visible) { vis = false; break; } if (!vis) continue;
  const p = w.geo.attributes.position, a = p.array, B = w.base, T = time + w.ph;
  for (let i = 0; i < p.count; i++) { const k = i * 3, t = Math.min(1, -B[k + 2] / (w.H * 0.72)), tt = t * t, ang = Math.atan2(B[k + 1], B[k]);
    a[k] = B[k] + Math.sin(T * 3.4 + t * 5.5) * 0.03 * tt + Math.sin(T * 7 + ang * 2 + t * 3) * 0.006 * t;   /* s229 half as wavy */
    a[k + 1] = B[k + 1] + Math.sin(T * 2.6 + t * 4.2 + 1.3) * 0.0225 * tt + Math.cos(T * 6.1 + ang * 3) * 0.005 * t;
    a[k + 2] = B[k + 2] + Math.cos(T * 3.1 + t * 4.8) * 0.015 * tt; }
  p.needsUpdate = true; } }
const KEY = 'backWeapons.fit', D2R = Math.PI / 180;
export function loadBackFit() { let o = {}; try { o = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) {} const r = {}, A = ALL_FIT(); for (const k in A) r[k] = { x: 0, ...A[k], ...(o[k] || {}) }; return r; }
export function defaultFit(k) { const A = ALL_FIT(); return A[k] ? { x: 0, ...A[k] } : null; }
export function saveBackFit(f) { try { localStorage.setItem(KEY, JSON.stringify(f)); } catch (e) {} }
export function applyBackFit(mt, f) { mt.position.set(f.x || 0, f.y, f.z); mt.rotation.set(f.lean * D2R, (f.twist || 0) * D2R, f.ang * D2R); mt.scale.setScalar(f.s); }
function build(key, { THREE, M, toon }, fox) {
  const g = new THREE.Group(), O = 0.008;
  const steel = toon('#c9d1d9'), dark = toon('#59626b'), wood = toon('#6a4426'), gold = toon('#d4a73a'), navy = toon('#1f2a44'), lea = toon('#4a2a17'), red = toon('#c0392b'), white = toon('#f3f2f2');
  const cyl = (r, h, mat, y = 0, x = 0, o = O) => M(new THREE.CylinderGeometry(r, r, h, 10), mat, x, y, 0, g, o);
  const box = (w, h, d, mat, x, y, z = 0, o = O) => M(new THREE.BoxGeometry(w, h, d), mat, x, y, z, g, o);
  const flat = (sh, mat, x, y, depth = 0.03, o = O) => { const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 8 }); geo.translate(0, 0, -depth / 2); return M(geo, mat, x, y, 0, g, o); };
  const clips = (...ys) => ys.forEach(y => box(0.11, 0.045, 0.07, gold, 0, y, 0.01));
  if (key === 'staffR') key = 'staff';
  if (key === 'staff') {   // navy staff, gold bands, the orange crest gem in a gold ring (King Might's prize)
    cyl(0.032, 1.8, navy); for (const y of [-0.55, -0.15, 0.3]) cyl(0.04, 0.05, gold, y);
    M(new THREE.ConeGeometry(0.04, 0.12, 10), gold, 0, -0.95, 0, g, O).rotation.x = Math.PI;
    const ring = M(new THREE.TorusGeometry(0.1, 0.022, 8, 20), gold, 0, 1.0, 0, g, O); ring.rotation.y = 0; ring.scale.setScalar(1.45);   // s339: bigger ring for the bigger glass sphere
    { // s339 (Ben): a clear BLUE GLASS SPHERE with a gold 8 floating inside it (seen from every side)
      const gem = new THREE.Group(); gem.position.set(0, 1.0, 0); gem.scale.setScalar(1.75); g.add(gem);
      const c = document.createElement('canvas'); c.width = c.height = 128; const q = c.getContext('2d'); q.font = '900 112px Archivo, Arial, sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle';
      q.lineWidth = 12; q.strokeStyle = '#0b2a66'; q.strokeText('8', 64, 70); q.fillStyle = '#ffd23a'; q.fillText('8', 64, 70);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      const c2 = document.createElement('canvas'); c2.width = c2.height = 128; const q2 = c2.getContext('2d'); q2.font = q.font; q2.textAlign = 'center'; q2.textBaseline = 'middle'; q2.lineWidth = 12; q2.strokeStyle = '#f4d599'; q2.strokeText('8', 64, 70); q2.fillStyle = '#002dc5'; q2.fillText('8', 64, 70);
      const tInv = new THREE.CanvasTexture(c2); tInv.colorSpace = THREE.SRGBColorSpace;   // s339: the 8 in inverted colours, shown at the peak of the pulse
      const eight = new THREE.Mesh(new THREE.PlaneGeometry(0.075, 0.075), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false })); eight.renderOrder = 1; gem.add(eight);
      const eightInv = new THREE.Mesh(eight.geometry, new THREE.MeshBasicMaterial({ map: tInv, transparent: true, side: THREE.DoubleSide, depthWrite: false })); eightInv.renderOrder = 1; eightInv.visible = false; gem.add(eightInv);
      const glass = new THREE.Mesh(new THREE.SphereGeometry(0.068, 20, 14), new THREE.MeshBasicMaterial({ color: '#3d8bff', transparent: true, opacity: 0.45, depthWrite: false })); glass.renderOrder = 2; gem.add(glass);
      const rim = new THREE.Mesh(new THREE.SphereGeometry(0.071, 20, 14), new THREE.MeshBasicMaterial({ color: '#0b2a66', side: THREE.BackSide, transparent: true, opacity: 0.55, depthWrite: false })); gem.add(rim);
      const shine = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 })); shine.position.set(-0.03, 0.035, 0.05); gem.add(shine);
      // s339 (Ben): ELECTRICITY out of the 8: jagged bolts flick from the 8 to the glass, the 8 + the glass pulse (self-animating, onBeforeRender)
      const NB = 5, SEG = 6, R = 0.066, bolts = [], boltM = new THREE.LineBasicMaterial({ color: '#bfe6ff', transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending });
      for (let i = 0; i < NB; i++) { const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.BufferAttribute(new Float32Array((SEG + 1) * 3), 3)); const ln = new THREE.Line(gg, boltM.clone()); ln.renderOrder = 3; ln.frustumCulled = false; gem.add(ln); bolts.push({ ln, next: 0 }); }
      const glow = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), new THREE.MeshBasicMaterial({ color: '#6fc3ff', transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); glow.renderOrder = 2; gem.add(glow);
      const zap = b => { const p = b.ln.geometry.attributes.position.array, u = Math.random() * 2 - 1, th = Math.random() * 6.283, sq = Math.sqrt(1 - u * u), ex = sq * Math.cos(th) * R, ey = u * R, ez = sq * Math.sin(th) * R;
        for (let k = 0; k <= SEG; k++) { const f = k / SEG, j = k && k < SEG ? 0.012 : 0; p[k * 3] = ex * f + (Math.random() - 0.5) * j; p[k * 3 + 1] = ey * f + (Math.random() - 0.5) * j; p[k * 3 + 2] = ez * f + (Math.random() - 0.5) * j; }
        b.ln.geometry.attributes.position.needsUpdate = true; };
      glass.onBeforeRender = () => { const t = performance.now() / 1000;   // s339 (Ben): no pulse, just the electricity
        for (const b of bolts) { if (t > b.next) { b.next = t + 0.1 + Math.random() * 0.18; b.on = Math.random() < 0.55; if (b.on) zap(b); } b.ln.visible = !!b.on; } };
    }
    cyl(0.045, 0.06, gold, 0.88); clips(-0.25, 0.25);
  } else if (key === 'whip') {   // s339 (Ben): BULLWHIP: braided brown leather, coiled in loops flat on the back, the handle sticking up, the tail hanging + swaying
    const hide = toon('#7a4a26'), hideD = toon('#5a3418'), knot = toon('#3a2010');
    for (let i = 0; i < 4; i++) { const r = 0.14 - i * 0.012, lp = M(new THREE.TorusGeometry(r, 0.016, 6, 28), i % 2 ? hide : hideD, 0.005 * i, -0.02 * i, 0.012 * i, g, 0.006); lp.scale.y = 1.15; }
    const wrap = M(new THREE.TorusGeometry(0.03, 0.012, 6, 12), knot, 0, 0.1, 0.03, g, 0); wrap.rotation.y = Math.PI / 2; wrap.scale.set(1, 2.2, 1);   // the strap round the coil
    const H = new THREE.Group(); H.position.set(0.1, 0.16, 0.04); H.rotation.z = -0.5; g.add(H);
    M(new THREE.CylinderGeometry(0.022, 0.026, 0.26, 10), hideD, 0, 0.13, 0, H, O); for (let i = 0; i < 6; i++) { const b = M(new THREE.TorusGeometry(0.024, 0.006, 4, 10), knot, 0, 0.03 + i * 0.04, 0, H, 0); b.rotation.x = Math.PI / 2; b.rotation.z = i % 2 ? 0.4 : -0.4; }
    M(new THREE.SphereGeometry(0.03, 10, 8), knot, 0, 0.27, 0, H, O); const loop = M(new THREE.TorusGeometry(0.03, 0.006, 4, 12), knot, 0, 0.31, 0, H, 0);
    const tail = new THREE.Group(); tail.position.set(-0.13, -0.08, 0.02); g.add(tail); const segs = [], NS = 7, tq = new THREE.Quaternion(), dn = new THREE.Vector3(), Y = new THREE.Vector3(0, -1, 0);
    let par = tail; for (let i = 0; i < NS; i++) { const sg = new THREE.Group(); sg.position.y = i ? -0.05 : 0; par.add(sg); const r = 0.014 * (1 - i / NS) + 0.003; M(new THREE.CylinderGeometry(r, r * 0.9 + 0.001, 0.05, 6), hide, 0, -0.025, 0, sg, 0); segs.push(sg); par = sg; }
    const pop = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.05, 5), toon('#e9e2d0')); pop.rotation.x = Math.PI; pop.position.y = -0.07; par.add(pop);   // the cracker
    segs[0].children[0].onBeforeRender = () => { const t = performance.now() / 1000; g.updateWorldMatrix(true, false); g.getWorldQuaternion(tq).invert(); dn.set(Math.sin(t * 1.5) * 0.15, -1, 0.1).normalize().applyQuaternion(tq); tail.quaternion.setFromUnitVectors(Y, dn);
      segs.forEach((sg, i) => { if (i) sg.rotation.set(Math.sin(t * 2.2 - i * 0.7) * 0.12, 0, Math.sin(t * 1.8 - i * 0.6) * 0.18); }); };
  } else if (key === 'flail') {   // s339 (Ben): BALL AND CHAIN: leather-wrapped wood handle (grip down), iron cap + ring, a chain that always HANGS toward the ground and swings, a spiked iron ball
    const iron = toon('#4a4f55'), ink = toon('#26292d');
    cyl(0.032, 0.5, wood, 0.0); for (let i = 0; i < 5; i++) cyl(0.036, 0.04, lea, -0.2 + i * 0.05); cyl(0.042, 0.03, gold, -0.255); M(new THREE.SphereGeometry(0.04, 10, 8), gold, 0, -0.28, 0, g, O);
    cyl(0.04, 0.07, iron, 0.27); const ring = M(new THREE.TorusGeometry(0.03, 0.009, 6, 12), iron, 0, 0.33, 0, g, 0); ring.rotation.y = Math.PI / 2;
    const piv = new THREE.Group(); piv.position.set(0, 0.34, 0); g.add(piv); const NL = 8, LL = 0.055, linkG = new THREE.TorusGeometry(0.022, 0.007, 5, 10);
    for (let i = 0; i < NL; i++) { const lk = new THREE.Mesh(linkG, ink); lk.position.y = -(i + 0.5) * LL; lk.scale.y = 1.5; if (i % 2) lk.rotation.y = Math.PI / 2; piv.add(lk); }
    const ball = new THREE.Group(); ball.position.y = -NL * LL - 0.08; piv.add(ball); M(new THREE.SphereGeometry(0.08, 14, 10), iron, 0, 0, 0, ball, O);
    const spG = new THREE.ConeGeometry(0.022, 0.06, 6), dirs = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1], [0.7, 0.7, 0], [-0.7, 0.7, 0], [0.7, -0.7, 0], [-0.7, -0.7, 0], [0, 0.7, 0.7], [0, -0.7, 0.7], [0, 0.7, -0.7], [0, -0.7, -0.7]];
    for (const d of dirs) { const v = new THREE.Vector3(...d).normalize(), sp = new THREE.Mesh(spG, steel); sp.position.copy(v).multiplyScalar(0.095); sp.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); ball.add(sp); }
    const q = new THREE.Quaternion(), dn = new THREE.Vector3(), Y = new THREE.Vector3(0, -1, 0); let sw = 0;
    piv.children[0].onBeforeRender = () => { const t = performance.now() / 1000; g.updateWorldMatrix(true, false); g.getWorldQuaternion(q).invert();   // world-down in the weapon's frame + a gentle swing
      dn.set(Math.sin(t * 1.7) * 0.12, -1, Math.cos(t * 1.3) * 0.08).normalize().applyQuaternion(q); piv.quaternion.setFromUnitVectors(Y, dn); ball.rotation.y = Math.sin(t * 0.9) * 0.6; };
  } else if (key === 'halberd') {   // wood haft, steel crescent axe + top spike + back hook
    cyl(0.03, 1.9, wood); cyl(0.038, 0.16, dark, 0.84); cyl(0.036, 0.06, dark, -0.94);
    // s662l TWO-TONE STEEL (Ben: like the war hammer spike + the sword ridge): bright steel + deep gunmetal meeting on a ridge / an edge line
    const brt = toon('#e3e9ee'), gun = toon('#3d4651');
    for (const [th, m] of [[0, brt], [Math.PI, gun]]) M(new THREE.ConeGeometry(0.045, 0.3, 2, 1, false, th, Math.PI), m, 0, 1.1, 0, g, th ? 0 : O);   // 4-sided spike, two faces each tone
    const ax = new THREE.Shape(); ax.moveTo(0.02, -0.1); ax.lineTo(0.1, -0.2); ax.quadraticCurveTo(0.36, -0.02, 0.1, 0.18); ax.lineTo(0.02, 0.08); ax.closePath(); flat(ax, brt, 0, 0.82, 0.03).scale.set(1.25, 1.25, 1);   // the bright CUTTING EDGE
    const ai = new THREE.Shape(); ai.moveTo(0.02, -0.08); ai.lineTo(0.09, -0.15); ai.quadraticCurveTo(0.27, -0.02, 0.09, 0.13); ai.lineTo(0.02, 0.06); ai.closePath(); flat(ai, gun, 0, 0.82, 0.042, 0).scale.set(1.25, 1.25, 1);   // s662m blade 25 % bigger (Ben)   // the dark blade body, proud of the edge
    const hk = new THREE.Shape(); hk.moveTo(-0.02, -0.05); hk.lineTo(-0.16, 0.02); hk.lineTo(-0.02, 0.05); hk.closePath(); flat(hk, brt, 0, 0.84, 0.025).scale.set(1.25, 1.25, 1);
    const hi = new THREE.Shape(); hi.moveTo(-0.02, -0.03); hi.lineTo(-0.11, 0.015); hi.lineTo(-0.02, 0.03); hi.closePath(); flat(hi, gun, 0, 0.84, 0.035, 0).scale.set(1.25, 1.25, 1);
    for (const y of [0.77, 0.91]) M(new THREE.SphereGeometry(0.012, 6, 4), brt, 0.035, y, 0.022, g, 0);   // rivets through the socket
    clips(-0.25, 0.25);
  } else if (key === 'spear') {   // long haft, leaf blade, red tassel
    cyl(0.027, 1.85, wood); cyl(0.034, 0.12, gold, 0.9); cyl(0.032, 0.05, gold, -0.92);
    const lf = new THREE.Shape(); lf.moveTo(0, -0.02); lf.quadraticCurveTo(0.085, 0.1, 0, 0.36); lf.quadraticCurveTo(-0.085, 0.1, 0, -0.02); flat(lf, steel, 0, 0.95, 0.025);
    for (let i = 0; i < 5; i++) { const t = M(new THREE.CylinderGeometry(0.008, 0.004, 0.2, 4), red, Math.cos(i * 1.26) * 0.035, 0.76, Math.sin(i * 1.26) * 0.035, g, 0); t.rotation.z = Math.cos(i * 1.26) * 0.2; }
    clips(-0.25, 0.25);
  } else if (key === 'maul') {   // short wrapped handle, big steel head behind the shoulder
    cyl(0.04, 1.0, lea, -0.08); for (let i = 0; i < 5; i++) cyl(0.045, 0.025, dark, -0.5 + i * 0.09);
    cyl(0.055, 0.06, dark, -0.6); box(0.36, 0.24, 0.24, steel, 0.04, 0.52); box(0.05, 0.26, 0.26, gold, -0.12, 0.52); box(0.05, 0.26, 0.26, gold, 0.2, 0.52);
    const sp = M(new THREE.ConeGeometry(0.075, 0.24, 4), steel, -0.25, 0.52, 0, g, O); sp.rotation.z = Math.PI / 2; M(new THREE.ConeGeometry(0.04, 0.14, 4), steel, 0.04, 0.7, 0, g, O); clips(0.05);   /* WAR HAMMER: hammer face + back spike + top spike */
  } else if (key === 'wrench') {   // Zion LONG WRENCH: open jaw at the top, red grip
    box(0.085, 1.2, 0.035, steel, 0, 0); box(0.11, 0.36, 0.05, red, 0, -0.44); box(0.13, 0.06, 0.05, dark, 0, -0.62);
    box(0.28, 0.1, 0.045, steel, 0, 0.64); box(0.075, 0.2, 0.045, steel, -0.1, 0.78); box(0.075, 0.2, 0.045, steel, 0.1, 0.78);
    M(new THREE.TorusGeometry(0.04, 0.012, 6, 14), dark, 0, 0.42, 0, g, 0); clips(-0.2, 0.2);
  } else if (key === 'bow') {   // white recurve bow with gold tips + a quiver of arrows beside it
    const pts = [[0.03, -0.8], [0.13, -0.62], [0.2, -0.3], [0.22, 0], [0.2, 0.3], [0.13, 0.62], [0.03, 0.8]].map(([x, y]) => new THREE.Vector3(x, y, 0));
    M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.022, 6), white, 0, 0, 0, g, 0.01);
    for (const y of [-0.8, 0.8]) M(new THREE.SphereGeometry(0.03, 8, 6), gold, 0.03, y, 0, g, O);
    cyl(0.032, 0.18, lea, 0, 0.22); M(new THREE.CylinderGeometry(0.004, 0.004, 1.58, 4), toon('#e9e4dc'), 0.03, 0, 0, g, 0);
    const q = new THREE.Group(); q.position.set(-0.17, 0.02, -0.04); g.add(q);
    M(new THREE.CylinderGeometry(0.075, 0.06, 0.66, 12), lea, 0, 0, 0, q, O); M(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), gold, 0, 0.33, 0, q, 0);
    for (let i = 0; i < 4; i++) { const ax = (i - 1.5) * 0.03; M(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 4), wood, ax, 0.42, 0, q, 0); M(new THREE.BoxGeometry(0.004, 0.08, 0.04), i % 2 ? red : white, ax, 0.5, 0, q, 0); }
  } else if (key === 'claws') {   // two claw gauntlets crossed on a belt plate at the small of the back
    box(0.34, 0.14, 0.04, lea, 0, -0.05, -0.02); M(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10), gold, 0, -0.05, 0.03, g, O).rotation.x = Math.PI / 2;
    for (const sd of [-1, 1]) { const c = new THREE.Group(); c.position.set(sd * 0.08, 0.08, 0.02); c.rotation.z = sd * -0.55; g.add(c);
      M(new THREE.BoxGeometry(0.13, 0.22, 0.09), dark, 0, 0, 0, c, O); M(new THREE.BoxGeometry(0.14, 0.04, 0.1), gold, 0, 0.1, 0, c, 0);
      for (let i = 0; i < 3; i++) { const cl = new THREE.Shape(); cl.moveTo(-0.014, 0); cl.lineTo(0.014, 0); cl.quadraticCurveTo(0.03, 0.17, -0.035, 0.3); cl.quadraticCurveTo(0.0, 0.15, -0.014, 0);
        const geo = new THREE.ExtrudeGeometry(cl, { depth: 0.014, bevelEnabled: false, curveSegments: 8 }); M(geo, steel, (i - 1) * 0.042, 0.11, -0.007, c, 0.006); } }
  } else if (key === 'bat') {   // wooden baseball bat: knob + taped grip at the bottom, fat barrel up behind the shoulder
    const ash = toon('#d9b27a'), tape = toon('#201e1d');
    M(new THREE.CylinderGeometry(0.03, 0.026, 0.42, 10), ash, 0, -0.42, 0, g, O); M(new THREE.CylinderGeometry(0.031, 0.031, 0.26, 10), tape, 0, -0.48, 0, g, 0);
    M(new THREE.CylinderGeometry(0.05, 0.05, 0.025, 12), ash, 0, -0.64, 0, g, O);
    M(new THREE.CylinderGeometry(0.068, 0.03, 0.5, 12), ash, 0, 0.04, 0, g, O); M(new THREE.CylinderGeometry(0.068, 0.068, 0.3, 12), ash, 0, 0.44, 0, g, O);
    const cap = M(new THREE.SphereGeometry(0.068, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), ash, 0, 0.59, 0, g, O); cap.scale.y = 0.4;
    box(0.004, 0.08, 0.004, toon('#c0392b'), 0, 0.34, -0.069, 0); clips(-0.2, 0.15);
    g.rotation.z = Math.PI;   /* s227 Ben: handle at the TOP, barrel down */
  } else if (key === 'net') {   // butterfly / bug net: long bamboo pole, green hoop, see-through mesh bag hanging off the hoop
    const bam = toon('#c9a75a'), node = toon('#9a7a3a'), hoopM = toon('#2bbf6a');
    cyl(0.022, 1.5, bam, -0.1); for (const y of [-0.6, -0.25, 0.1, 0.42]) cyl(0.027, 0.025, node, y); cyl(0.03, 0.05, toon('#201e1d'), -0.84);
    const hd = new THREE.Group(); hd.position.y = 0.64; g.add(hd); const HR = 0.27, HY = HR;   // s228 Ben: bigger hoop + net
    M(new THREE.TorusGeometry(HR, 0.016, 6, 32), hoopM, 0, HY, 0, hd, 0.006, HR); cyl(0.021, 0.07, hoopM, 0.67);
    // the mesh bag is built FROM the hoop (rim = the hoop circle), runs back away from the fox, droops, and WAVES like a flag (tickBackWeapons)
    const H = 0.62, bg = new THREE.ConeGeometry(HR, H, 20, 10, true); bg.rotateX(-Math.PI / 2); bg.translate(0, 0, -H / 2);
    const pa = bg.attributes.position; for (let i = 0; i < pa.count; i++) { const t = Math.max(0, -pa.getZ(i) / H), x0 = pa.getX(i), y0 = pa.getY(i), rr0 = Math.hypot(x0, y0), rad = HR * Math.sqrt(Math.max(0, 1 - Math.pow(t, 2.4))), k = rr0 > 1e-5 ? rad / rr0 : 0;   /* s229 rounded tip (a sock, not a point) */
      pa.setX(i, x0 * k); pa.setY(i, y0 * k - t * t * 0.36); pa.setZ(i, pa.getZ(i) * 0.72); }
    const base = Float32Array.from(pa.array); bg.computeVertexNormals();
    const bag = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xf3f2f2, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false })); bag.position.y = HY; hd.add(bag);
    const wire = new THREE.Mesh(bg, new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true, transparent: true, opacity: 0.6 })); wire.position.y = HY; hd.add(wire);
    M(new THREE.TorusGeometry(HR, 0.009, 4, 32), toon('#e9e4dc'), 0, HY, -0.004, hd, 0);   /* sewn hem where the net meets the hoop */
    WAVERS.add({ geo: bg, base, H, ph: Math.random() * 6, obj: g });
    clips(-0.35, 0.1);
  } else if (key === 'gloves') {   // two red boxing gloves tied by their laces, hanging over the shoulders
    const gr = toon('#d8241a'), cuff = toon('#f3f2f2');
    const lace = new THREE.CatmullRomCurve3([[-0.2, -0.28, 0.02], [-0.12, 0.05, 0.03], [0, 0.12, 0.03], [0.12, 0.05, 0.03], [0.2, -0.28, 0.02]].map(p => new THREE.Vector3(...p)));
    M(new THREE.TubeGeometry(lace, 20, 0.008, 4), cuff, 0, 0, 0, g, 0);
    for (const sd of [-1, 1]) { const c = new THREE.Group(); c.position.set(sd * 0.22, -0.42, 0); c.rotation.z = sd * 0.12; g.add(c);
      const bl = M(new THREE.SphereGeometry(0.13, 12, 10), gr, 0, 0, 0, c, 0.012, 0.13); bl.scale.set(1, 1.15, 0.85);
      const th = M(new THREE.SphereGeometry(0.05, 8, 6), gr, sd * -0.11, 0.02, 0.03, c, 0.008, 0.05); th.scale.set(1, 1.6, 1);
      M(new THREE.CylinderGeometry(0.085, 0.09, 0.12, 12), cuff, 0, 0.17, 0, c, 0.01); }
  } else if (key === 'scatter') {   // stubby wide-mouth scatter gun, 5 barrel ports, slung muzzle-up
    const glow = toon('#ffb23a', { emissive: '#ff8a00', emissiveIntensity: 0.6 });
    box(0.11, 0.3, 0.08, wood, 0, -0.42); box(0.15, 0.36, 0.12, toon('#3a4048'), 0, -0.1); const mz = M(new THREE.CylinderGeometry(0.1, 0.07, 0.34, 12), dark, 0, 0.24, 0, g, O);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; M(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 6), glow, Math.cos(a) * 0.05, 0.42, Math.sin(a) * 0.05, g, 0); }
    box(0.155, 0.08, 0.02, glow, 0, -0.06, 0.065, 0); clips(-0.25, 0.15);
    box(0.05, 0.06, 0.15, wood, 0, -0.26, -0.12).rotation.x = -0.27; cyl(0.104, 0.12, wood, 0.17); for (const y of [0.13, 0.17, 0.21]) cyl(0.107, 0.012, dark, y);   // s662n pistol grip + a ribbed wooden PUMP for the support paw
  } else if (key === 'ice') {   // ice-blue blaster with a frosty crystal cell, barrel +z (holstered muzzle-down)
    const ice = toon('#9fe8ff', { emissive: '#3ab8ff', emissiveIntensity: 0.6 }), frame = toon('#e7f4fb');
    box(0.1, 0.12, 0.3, frame, 0, 0, 0.02); const nz = M(new THREE.CylinderGeometry(0.03, 0.05, 0.14, 8), toon('#5b7d93'), 0, 0.01, 0.23, g, O); nz.rotation.x = Math.PI / 2;
    const cr = M(new THREE.OctahedronGeometry(0.06, 0), ice, 0, 0.1, -0.02, g, 0.008); cr.scale.set(0.8, 1.3, 0.8);
    box(0.07, 0.16, 0.08, toon('#5b7d93'), 0, -0.12, -0.08); box(0.14, 0.11, 0.26, lea, 0, 0, 0.12, 0.01);
  } else if (key === 'heal') {   // white med blaster, green glowing battery, barrel +z (worn muzzle-down in a holster)
    const glow = toon('#5dffb0', { emissive: '#22ff88', emissiveIntensity: 0.8 });
    box(0.1, 0.12, 0.3, white, 0, 0, 0.02); const nz = M(new THREE.CylinderGeometry(0.035, 0.045, 0.14, 10), dark, 0, 0.01, 0.23, g, O); nz.rotation.x = Math.PI / 2;
    const tip = M(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), glow, 0, 0.01, 0.31, g, 0); tip.rotation.x = Math.PI / 2;
    const cell = M(new THREE.CylinderGeometry(0.03, 0.03, 0.14, 10), glow, 0, 0.08, -0.02, g, O); cell.rotation.x = Math.PI / 2;
    box(0.07, 0.16, 0.08, dark, 0, -0.12, -0.08); box(0.104, 0.02, 0.2, toon('#2bbf6a'), 0, -0.05, 0.04, 0);
    box(0.14, 0.11, 0.26, lea, 0, -0.0, 0.12, 0.01);
  } else if (key === 'twin') {   // a second copy of Ben's laser in its own holster
    const P = fox && fox.userData.P; if (P && P.gun) { const c = P.gun.clone(true); c.position.set(0, 0, 0); c.rotation.set(0, 0, 0); c.scale.copy(P.gun.scale); c.traverse(m => { if (m.isSprite) m.visible = false; Object.defineProperty(m, 'visible', { value: m.isSprite ? false : true, writable: true }); }); g.add(c); }
    M(new THREE.BoxGeometry(0.13, 0.1, 0.26), toon('#3b2416'), 0, -0.02, -0.02, g, 0.01);
  } else if (key === 'rifle') {   // long laser rifle, muzzle up, slung on the back
    const glow = toon('#ff4a3a', { emissive: '#ff2a1a', emissiveIntensity: 0.7 });
    box(0.1, 0.32, 0.07, dark, 0, -0.5); box(0.12, 0.42, 0.1, toon('#3a4048'), 0, -0.14); cyl(0.028, 0.62, steel, 0.38); cyl(0.04, 0.06, dark, 0.7);
    const sc = M(new THREE.CylinderGeometry(0.03, 0.03, 0.22, 10), dark, 0, -0.1, -0.07, g, O); box(0.04, 0.03, 0.03, dark, 0, -0.14, -0.04, 0);
    box(0.126, 0.12, 0.02, glow, 0, -0.18, 0.05, 0); box(0.05, 0.06, 0.15, dark, 0, -0.33, 0.11).rotation.x = 0.27; clips(-0.3, 0.2);
    cyl(0.046, 0.24, toon('#3a4048'), 0.2); for (const y of [0.11, 0.2, 0.29]) cyl(0.049, 0.014, dark, y);   // s662n raked pistol grip + a ribbed HANDGUARD for the support paw
  } else if (key === 'crossbow') {   // stock along y, limbs across x (worn limbs-down at the small of the back)
    box(0.07, 0.62, 0.06, wood, 0, 0); box(0.08, 0.1, 0.07, dark, 0, -0.1); const pts = [[-0.34, 0.2], [-0.2, 0.28], [0, 0.31], [0.2, 0.28], [0.34, 0.2]].map(([x, y]) => new THREE.Vector3(x, y, 0));
    M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.018, 6), steel, 0, 0, 0, g, 0.008);
    for (const sd of [-1, 1]) { const s = M(new THREE.CylinderGeometry(0.003, 0.003, 0.37, 4), toon('#e9e4dc'), sd * 0.17, 0.11, 0, g, 0); s.rotation.z = sd * -1.12; }
    box(0.045, 0.05, 0.13, wood, 0, -0.2, -0.085).rotation.x = -0.27;   // s662n pistol grip
    for (let i = 0; i < 2; i++) { cyl(0.006, 0.4, wood, -0.05, (i ? 1 : -1) * 0.05); box(0.004, 0.06, 0.03, red, (i ? 1 : -1) * 0.05, -0.24, 0, 0); }
  } else if (key === 'darts') {   // leather dart pouch on the hip, five flights sticking up
    box(0.16, 0.2, 0.09, lea, 0, 0); box(0.17, 0.04, 0.1, gold, 0, 0.1, 0, 0);
    for (let i = 0; i < 5; i++) { const x = (i - 2) * 0.028, h = 0.13 + (i % 2) * 0.03; M(new THREE.CylinderGeometry(0.006, 0.006, h, 4), steel, x, 0.1 + h / 2, 0, g, 0); box(0.004, 0.06, 0.04, i % 2 ? red : white, x, 0.1 + h + 0.02, 0, 0); }
  } else if (key === 'sling') {   // wooden Y slingshot tucked in the back of the belt + a pebble pouch
    cyl(0.025, 0.22, wood, -0.08); for (const sd of [-1, 1]) { const a = M(new THREE.CylinderGeometry(0.022, 0.022, 0.18, 8), wood, sd * 0.05, 0.1, 0, g, O); a.rotation.z = sd * -0.5; }
    const band = M(new THREE.TorusGeometry(0.1, 0.008, 4, 16, Math.PI), toon('#c0392b'), 0, 0.18, 0, g, 0); band.rotation.z = Math.PI; band.scale.set(1, 0.6, 1);
    const pp = M(new THREE.SphereGeometry(0.07, 10, 8), lea, -0.24, -0.02, 0.02, g, O); pp.scale.set(1, 0.85, 0.7);
  } else if (key === 'flame' || key === 'freeze' || key === 'fog') {   // s339: FOG THROWER = the same rig in slate + amber, a grey wisp at the nozzle
    const FG = key === 'fog';   // s339: FREEZE THROWER = the same rig in ice colours (white-blue tank, frost vents, a cold mist at the nozzle)
    const FZ = key === 'freeze';   // s339 (Ben): FLAMETHROWER: twin red fuel tanks (pack), a black hose to the steel wand clipped up the right side, pilot flame flickering at the nozzle
    const tankM = FG ? toon('#5c6670') : FZ ? toon('#dff1ff') : toon('#c0392b'), ink = toon('#201e1d'), brass = FG ? toon('#ffd23a') : FZ ? toon('#7fb8e6') : toon('#c9a24a');
    for (const sx of [0]) { cyl(0.085, 0.46, tankM, 0, sx); M(new THREE.SphereGeometry(0.085, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), tankM, sx, 0.23, 0, g, O); M(new THREE.SphereGeometry(0.085, 12, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), tankM, sx, -0.23, 0, g, O);
      cyl(0.018, 0.05, brass, 0.33, sx); box(0.12, 0.03, 0.005, FG ? toon('#f3f2f2') : FZ ? toon('#2f7de1') : toon('#ffd23a'), sx, 0.06, 0.086, 0); if (FZ) for (const y of [-0.12, 0, 0.12]) box(0.005, 0.07, 0.05, toon('#9fd4ff'), 0.086, y, 0, 0); }
    box(0.19, 0.035, 0.18, ink, 0, 0.14, 0); box(0.19, 0.035, 0.18, ink, 0, -0.14, 0);   // the straps round the tank
    const hose = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.3, 0), new THREE.Vector3(0.03, -0.38, 0.03), new THREE.Vector3(0.09, -0.4, 0.05)]);
    M(new THREE.TubeGeometry(hose, 10, 0.016, 6, false), ink, 0, 0, 0, g, O);
    const W = new THREE.Group(); g.add(W); g.userData.hipPart = W;   // s339 (Ben): the wand rides on the ranged hip (mountRanged moves it there)
    M(new THREE.CylinderGeometry(0.024, 0.024, 0.52, 10), steel, 0, 0, 0, W, O); M(new THREE.CylinderGeometry(0.036, 0.03, 0.08, 10), dark, 0, 0.29, 0, W, O);
    M(new THREE.BoxGeometry(0.032, 0.05, 0.12), ink, 0, -0.12, 0.08, W, O).rotation.x = 0.25; M(new THREE.BoxGeometry(0.03, 0.045, 0.1), ink, 0, 0.06, 0.07, W, O).rotation.x = 0.15;   // s662n real grips: rear pistol grip + front handle
    const fl = new THREE.Mesh(new THREE.ConeGeometry(FZ || FG ? 0.03 : 0.018, 0.07, 8), new THREE.MeshBasicMaterial({ color: FG ? '#c9ced3' : FZ ? '#bfe9ff' : '#ffb23a', transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); fl.position.y = 0.36; W.add(fl);
    const core = new THREE.Mesh(new THREE.ConeGeometry(0.009, 0.04, 6), new THREE.MeshBasicMaterial({ color: FG ? '#e9ecef' : FZ ? '#ffffff' : '#7fc8ff', transparent: true, opacity: 0.9, depthWrite: false })); core.position.y = 0.345; W.add(core);
    if (FG) {   // s339 (Ben): FOG THROWER: no flame cone, a dark fog trail curling UP out of the nozzle
      fl.visible = false; core.visible = false;
      const c = document.createElement('canvas'); c.width = c.height = 64; const q = c.getContext('2d'), rg = q.createRadialGradient(32, 32, 0, 32, 32, 32); rg.addColorStop(0, 'rgba(255,255,255,0.9)'); rg.addColorStop(0.5, 'rgba(255,255,255,0.4)'); rg.addColorStop(1, 'rgba(255,255,255,0)'); q.fillStyle = rg; q.fillRect(0, 0, 64, 64);
      const tx = new THREE.CanvasTexture(c), N = 9, puffs = [];
      for (let i = 0; i < N; i++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, color: i % 2 ? '#6b7178' : '#4f555c', transparent: true, depthWrite: false, opacity: 0 })); sp.position.y = 0.34; W.add(sp); puffs.push({ sp, ph: i / N }); }
      const nozzleW = new THREE.Vector3(), tmp = new THREE.Vector3(), up = new THREE.Vector3(), q4 = new THREE.Quaternion();
      puffs[0].sp.onBeforeRender = () => { const t = performance.now() / 1000; W.updateWorldMatrix(true, false); W.getWorldQuaternion(q4).invert(); W.getWorldScale(tmp); const s0 = 1 / Math.max(0.001, tmp.x);
        for (const p of puffs) { const k = (t * 0.35 + p.ph) % 1;   // 0 = at the nozzle, 1 = gone, risen ~0.45 m
          up.set(Math.sin(t * 1.3 + p.ph * 9) * 0.03 * k, 0.45 * k, Math.cos(t * 1.1 + p.ph * 7) * 0.03 * k).applyQuaternion(q4).multiplyScalar(s0);   // world-up, in the wand's frame
          p.sp.position.set(up.x, 0.35 + up.y, up.z); p.sp.scale.setScalar((0.07 + 0.22 * k) * s0); p.sp.material.opacity = 0.9 * Math.min(1, k * 6) * (1 - k); } };
    }
    fl.onBeforeRender = () => { const t = performance.now() / (FZ || FG ? 2500 : 1000), k = 0.85 + Math.sin(t * 17) * 0.1 + Math.sin(t * 29) * 0.07; fl.scale.set(1, k, 1); fl.position.y = 0.33 + 0.035 * k; fl.material.opacity = 0.7 + Math.sin(t * 23) * 0.2; };
    clips(-0.2, 0.2);
  } else if (key === 'rocket') {   // short olive rocket tube with red bands, two grips
    cyl(0.085, 0.8, toon('#5b6b3a')); cyl(0.095, 0.05, red, 0.38); cyl(0.095, 0.05, red, -0.38); cyl(0.1, 0.04, dark, 0.42);
    box(0.05, 0.06, 0.14, dark, 0, -0.05, 0.15).rotation.x = 0.2; box(0.05, 0.06, 0.12, dark, 0, 0.17, 0.14).rotation.x = 0.12;   // s662n vertical grips under the tube box(0.05, 0.1, 0.12, dark, 0, 0.05, -0.12); clips(-0.2, 0.2);
  } else if (key === 'racket') {   // yellow frame (the Inner Tube racket), strung face, black taped grip, head up behind the shoulder
    const yel = toon('#ffd23a'), ink = toon('#201e1d');
    cyl(0.032, 0.42, ink, -0.36); cyl(0.04, 0.05, yel, -0.58); for (let i = 0; i < 4; i++) cyl(0.036, 0.018, toon('#3a3836'), -0.5 + i * 0.07, 0, 0);
    for (const sd of [-1, 1]) { const th = M(new THREE.CylinderGeometry(0.018, 0.018, 0.26, 6), yel, sd * 0.05, -0.04, 0, g, O); th.rotation.z = sd * 0.38; }
    const head = new THREE.Group(); head.position.y = 0.32; head.scale.set(1, 1.28, 1); g.add(head);
    M(new THREE.TorusGeometry(0.22, 0.026, 6, 24), yel, 0, 0, 0, head, 0.01, 0.22);
    head.add(new THREE.Mesh(new THREE.CircleGeometry(0.205, 20), new THREE.MeshBasicMaterial({ color: 0xf3f2f2, transparent: true, opacity: 0.35, side: THREE.DoubleSide })));
    const sm = toon('#f3f2f2'); for (let i = -4; i <= 4; i++) { const o = i * 0.044, L = 2 * Math.sqrt(Math.max(0, 0.205 * 0.205 - o * o)); if (L < 0.02) continue; M(new THREE.BoxGeometry(0.005, L, 0.005), sm, o, 0, 0, head, 0); M(new THREE.BoxGeometry(L, 0.005, 0.005), sm, 0, o, 0, head, 0); }
    clips(-0.2);
  }
  return g;
}
export function makeBackWeapon(kit, key) { return build(key, kit); }
// s339 (Ben): FOG GOGGLES, worn while the FOG THROWER is equipped (see through the fog). On the skull, so they follow the head + its proportions.
export function addGoggles(THREE, toon, fox) { const P = fox.userData.P; if (!P || !P.head) return null; if (fox.userData.goggles) return fox.userData.goggles;
  const sk = P.head.children.find(c => c.isMesh) || P.head, g = new THREE.Group(), rim = toon('#26292d'), strap = toon('#3a3836');
  const lens = new THREE.MeshBasicMaterial({ color: '#ffb000', transparent: true, opacity: 0.78 });
  for (const sd of [-1, 1]) { const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.115, 0.09, 18), rim); cup.rotation.x = Math.PI / 2; cup.position.set(sd * 0.14, 0.06, 0.41); g.add(cup);
    const ln = new THREE.Mesh(new THREE.CircleGeometry(0.088, 20), lens); ln.position.set(sd * 0.14, 0.06, 0.457); g.add(ln);
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.022, 8), new THREE.MeshBasicMaterial({ color: '#fff4cc' })); sh.position.set(sd * 0.14 - 0.035, 0.095, 0.459); g.add(sh); }
  const br = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.04), rim); br.position.set(0, 0.07, 0.44); g.add(br);
  const st = new THREE.Mesh(new THREE.TorusGeometry(0.405, 0.028, 6, 36), strap); st.rotation.x = Math.PI / 2; st.position.y = 0.06; g.add(st);
  sk.add(g); fox.userData.goggles = g; return g; }
export function setGoggles(THREE, toon, fox, on) { const g = on ? addGoggles(THREE, toon, fox) : fox.userData.goggles; if (g) g.visible = !!on; }
export function mountRanged(kit, fox, key, fit) {
  try { setGoggles(kit.THREE, kit.toon, fox, key === 'fog'); } catch (e) {}
  const u = fox.userData, FP = u.P, G = u.rig; if (!FP || !FP.body) return null;
  if (u.rangedW) { u.rangedW.parent && u.rangedW.parent.remove(u.rangedW); const ex = u.rangedW.userData.hip; if (ex && ex.parent) ex.parent.remove(ex); u.rangedW = null; }
  if (G && G.hipAnchor) G.hipAnchor.visible = key === 'laser' || key === 'twin';
  if (key === 'laser') return null; const f = { ...defaultFit(key), ...(fit || {}) }; if (!f) return null;
  const mt = new kit.THREE.Object3D(), bw = build(key, kit, fox); mt.add(bw); applyBackFit(mt, f); FP.body.add(mt); u.rangedW = mt; u.rangedKey = key;
  if (bw.userData.hipPart) { const W = bw.userData.hipPart, hp = new kit.THREE.Object3D(); bw.remove(W); W.position.set(0, 0, 0); hp.add(W); applyBackFit(hp, { ...defaultFit(key + 'Hip'), ...((fit && fit.hip) || {}) }); FP.body.add(hp); mt.userData.hip = hp; }   // s339: flamethrower wand on the ranged hip
  return mt;
}
export function mountBackWeapon(kit, fox, key, fit) {
  const u = fox.userData, FP = u.P, G = u.rig; if (!FP || !FP.body) return null;
  if (u.backW) { u.backW.parent && u.backW.parent.remove(u.backW); u.backW = null; }
  if (G && G.backAnchor) G.backAnchor.visible = key === 'sword';
  if (key === 'sword') { G && G.applySwordFit && G.applySwordFit({ ...defaultFit('sword'), ...(fit || {}) }); return null; }
  if (!defaultFit(key)) return null;
  const mt = new kit.THREE.Object3D(); mt.add(build(key, kit)); applyBackFit(mt, { ...BACK_FIT[key], ...(fit || {}) }); FP.body.add(mt); u.backW = mt; u.backKey = key; return mt;
}
