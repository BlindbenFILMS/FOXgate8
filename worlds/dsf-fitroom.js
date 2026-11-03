// THE FITTING ROOM (s362): GAROK'S second berth, Ben's 2D shop 1:1 (6 garments, prices 40 / 120 / 150 / 300 / 180 / 420,
// Garok's own line for each, TRY ON = a preview slot, only what you BUY walks out, CLOTHES GO OVER ARMOUR: nothing here
// touches the 8 armour, the garment is an extra layer of cloth meshes on top of it).
// In 3D: you stand on the FITTING BLOCK facing the shop, the camera is the mirror's view, and the real three-way mirror
// behind you reflects your back (a planar reflection while you are in the shop). Garok walks round the counter to fuss.
// The stock hangs on a brass CAROUSEL that turns the picked garment to the front; tap a garment or NEXT ON THE RAIL.
// What you wear is saved (stats dsfFitOwned / dsfFitWorn) and dressFox() puts it on the player when the station loads.
import { FONT } from '../engine/textures.js';
import { canvas } from './dsf-look.js?v=350e';

const rect = (c, col, x, y, w, h) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
const poly = (c, col, pts, stroke, lw) => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fillStyle = col; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 0.9; c.stroke(); } };
const ln = (c, col, w, x0, y0, x1, y1) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
const dot = (c, col, x, y, r) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };

// The stock, the 2D list and lines verbatim. hi/mid/lo = the cloth gradient, sl = sleeve [cloth, cuff], sh = shoulder [top, band],
// yb = where the hem falls on the fox (0.12 = a long coat), fl = hem radius for the long ones. paint() = the 2D front details.
export const STOCK = [
  { key: 'greys', name: 'STATION GREYS', price: 40, cut: 'Issue, unpicked and re-cut',
    line: 'Every third person on this ring is wearing these. I have taken the shoulders in and moved the seam off your neck, which is more than the quartermaster ever did.',
    hi: '#8a929c', mid: '#69717c', lo: '#3c434c', sl: ['#8a929c', '#4e5660'], sh: ['#9ba3ad', '#727a85'], yb: 0.46, fl: 0.345,
    paint(c) { ln(c, 'rgba(255,255,255,0.08)', 1, 0, -26, 0, 32); poly(c, '#6e7784', [[-10, -28], [10, -28], [8, -20], [-8, -20]]); ln(c, 'rgba(0,0,0,0.35)', 1, 0, -20, 0, 30); rect(c, 'rgba(0,0,0,0.22)', -20, 4, 13, 9); rect(c, 'rgba(0,0,0,0.22)', 7, 4, 13, 9); } },
  { key: 'pilgrim', name: 'TEMPLE CLOTH', price: 120, cut: 'Undyed, and meant to be',
    line: 'The KEEPER buys four of these a year and wears them until they are transparent. It is not a costume, STEWARD. Wear it into the temple or do not buy it.',
    hi: '#d8cbb4', mid: '#b3a48a', lo: '#7c7059', sl: ['#d2c4ab', '#8a6f42'], sh: ['#cbbca2', '#9a8b72'], yb: 0.3, fl: 0.4,
    paint(c, hem) { c.fillStyle = '#a6957a'; c.beginPath(); c.moveTo(-28, -28); c.lineTo(-4, -28); c.quadraticCurveTo(-8, 6, 6, 30); c.lineTo(-16, 22); c.quadraticCurveTo(-27, 2, -28, -14); c.closePath(); c.fill(); c.strokeStyle = 'rgba(70,60,42,0.5)'; c.lineWidth = 1; c.stroke();
      rect(c, '#8a6f42', -60, 9, 120, 4); dot(c, '#8a6f42', 9, 11, 2.6); ln(c, 'rgba(90,78,55,0.6)', 2, -11, -25, 11, -25); ln(c, '#a6957a', 3, -60, hem - 2.5, 60, hem - 2.5); } },
  { key: 'hauler', name: 'FREIGHTER LEATHERS', price: 150, cut: 'Second hand, and better for it',
    line: 'Off a hauler who did not need it any more. Do not ask. The elbows are gone and the rest of it will outlive us both, which is the usual arrangement with leather.',
    hi: '#6b4a33', mid: '#4a3122', lo: '#261a12', sl: ['#77543a', '#2e2018'], sh: ['#7b563c', '#4e3524'], yb: 0.5, fl: 0.345,
    paint(c) { poly(c, '#2a2622', [[-9, -28], [9, -28], [7, 40], [-7, 40]]);
      for (const s of [-1, 1]) { c.fillStyle = s < 0 ? '#77543a' : '#5e422d'; c.beginPath(); c.moveTo(s * 9, -28); c.lineTo(s * 24, -26); c.quadraticCurveTo(s * 20, 4, s * 12, 40); c.lineTo(s * 6, 40); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.45)'; c.lineWidth = 0.9; c.stroke(); }
      poly(c, '#8a6544', [[-15, -30], [15, -30], [10, -21], [-10, -21]]); rect(c, 'rgba(0,0,0,0.25)', -25, -2, 7, 11); rect(c, '#a8a093', -5, 12, 10, 5); } },
  { key: 'cut', name: "A CUT OF GAROK'S OWN", price: 300, cut: 'His pattern, your measurements',
    line: 'You have been looking at mine since you walked in. Yes, you can have one. No, it will not be the same colour — one of us has to be the best-dressed fox on this ring.',
    hi: '#33465e', mid: '#22303f', lo: '#121922', sl: ['#33465e', '#e8e2d6'], sh: ['#2b3a4d', '#1a2531'], yb: 0.44, fl: 0.345,
    paint(c) { c.strokeStyle = 'rgba(255,255,255,0.06)'; c.lineWidth = 0.8; for (let i = -9; i <= 9; i++) { c.beginPath(); c.moveTo(-34 + i * 7, -32); c.lineTo(-34 + i * 7 + 34, 40); c.stroke(); }
      poly(c, '#e8e2d6', [[-7.5, -28], [7.5, -28], [5.5, -4], [-5.5, -4]]); poly(c, '#2b3a4d', [[-9, -12], [9, -12], [7, 24], [0, 29], [-7, 24]]);
      for (let b = 0; b < 3; b++) dot(c, '#b99a52', 0, b * 7, 1.15);
      for (const s of [-1, 1]) poly(c, s < 0 ? '#3a506b' : '#2d3f54', [[s * 7, -28], [s * 19, -27], [s * 15, -17], [s * 20, -13], [s * 13, -1], [s * 6, 8], [s * 4, 2]], 'rgba(0,0,0,0.5)', 0.9);
      poly(c, '#c9a24a', [[13, -4], [21, -4], [20, -8], [17, -6], [14, -8.5]]); } },
  { key: 'promenade', name: 'THE PROMENADE COAT', price: 180, cut: 'Long, and lined in something loud',
    line: 'It is a walking coat. It is for being SEEN walking, which on a ring two kilometres round is a different sport. The lining is the whole point and nobody will ever see it.',
    hi: '#3c3550', mid: '#282237', lo: '#13101c', sl: ['#433a5a', '#8e2f4a'], sh: ['#463d5e', '#2a2439'], yb: 0.12, fl: 0.46,
    paint(c, hem) { poly(c, '#8e2f4a', [[-10, -26], [10, -26], [8, hem + 4], [-8, hem + 4]]);
      for (const s of [-1, 1]) { c.fillStyle = s < 0 ? '#463d5e' : '#342c47'; c.beginPath(); c.moveTo(s * 10, -28); c.lineTo(s * 26, -25); c.quadraticCurveTo(s * 27, 20, s * 30, hem + 4); c.lineTo(s * 6.5, hem + 4); c.lineTo(s * 7, 26); c.closePath(); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.5)'; c.lineWidth = 0.9; c.stroke(); }
      poly(c, '#6d5f8c', [[-11, -29], [11, -29], [8, -19], [-8, -19]]); dot(c, '#cbb26a', 0, -23, 2); } },
  { key: 'steward', name: "THE STEWARD'S DRESS", price: 420, cut: 'Gaya red, and a sash you have to earn',
    line: 'This is not clothes, STEWARD, this is an office. Your father stood in this shop for the same fitting and complained about the sash for an hour. Wear it when the provisional government is watching. Or on a Tuesday. It is yours.',
    hi: '#6e2323', mid: '#4a1616', lo: '#250a0a', sl: ['#7a2727', '#c9a24a'], sh: ['#8a2b2b', '#521818'], yb: 0.18, fl: 0.46,
    paint(c, hem) { poly(c, '#c9a24a', [[-20, -26], [-9, -28], [22, 26], [11, 30]], 'rgba(60,40,8,0.6)', 0.9); ln(c, 'rgba(255,240,190,0.45)', 0.9, -17.5, -26.5, 18.5, 27);
      poly(c, '#8a2b2b', [[-12, -30], [12, -30], [9, -19], [-9, -19]]); ln(c, '#c9a24a', 1.6, -12, -29, 12, -29);
      c.strokeStyle = '#c9a24a'; c.lineWidth = 1.4; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(2, -12 + i * 8); c.lineTo(20, -12 + i * 8); c.stroke(); }
      ln(c, '#c9a24a', 2.4, -60, hem - 3, 60, hem - 3); } },
];
const BY = {}; STOCK.forEach(o => { BY[o.key] = o; });

// ---- the cloth layer: a lathe shell just outside the cuirass (the armour stays underneath, untouched)
const PROF = [[0.44, 0.345], [0.52, 0.345], [0.66, 0.35], [0.82, 0.378], [0.98, 0.402], [1.08, 0.397], [1.18, 0.362], [1.25, 0.262], [1.29, 0.13], [1.305, 0]];
function rAt(y, o) { if (y < 0.44) return 0.345 + (o.fl - 0.345) * (0.44 - y) / Math.max(0.01, 0.44 - o.yb); for (let i = 1; i < PROF.length; i++) if (y <= PROF[i][0]) { const [y0, r0] = PROF[i - 1], [y1, r1] = PROF[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0; }
const GEO = new Map(), TEX = new Map();
function shellGeo(THREE, o, grow, lift) { const k = o.key + '|' + grow + '|' + lift.toFixed(3); if (GEO.has(k)) return GEO.get(k);
  const ys = new Set(); for (let i = 0; i <= 22; i++) ys.add(+(o.yb + (1.25 - o.yb) * i / 22).toFixed(4)); for (const [y] of PROF) if (y >= o.yb) ys.add(y);
  const pts = [...ys].sort((a, b) => a - b).map(y => new THREE.Vector2(y >= 1.3 ? 0 : rAt(y, o) + grow, y >= 1.3 ? y + grow * 0.6 : y));
  const g = new THREE.LatheGeometry(pts, 30, -Math.PI, Math.PI * 2), p = g.attributes.position, uv = g.attributes.uv;
  for (let i = 0; i < p.count; i++) { const z = p.getZ(i); p.setZ(i, z > 0 ? z * 1.14 : z * 0.95); uv.setY(i, (p.getY(i) - 0.1) / 1.2); }
  g.computeVertexNormals(); g.translate(0, lift, 0); GEO.set(k, g); return g; }
// the front, painted in the 2D game's own torso units (x ±34, y -30 neck … 36 hem), wrapped round the shell
function garmentTex(THREE, o) { if (TEX.has(o.key)) return TEX.get(o.key); const cv = document.createElement('canvas'); cv.width = cv.height = 512; const c = cv.getContext('2d');
  c.setTransform(4.267, 0, 0, 5.107, 256, 166); const hem = Math.max(36, ((1.3 - o.yb) / 1.2 * 512 - 166) / 5.107);
  const gd = c.createLinearGradient(0, -28, 0, hem); gd.addColorStop(0, o.hi); gd.addColorStop(0.5, o.mid); gd.addColorStop(1, o.lo); c.fillStyle = gd; c.fillRect(-62, -40, 124, 120);
  o.paint(c, hem); ln(c, 'rgba(0,0,0,0.35)', 1.2, -62, hem - 0.6, 62, hem - 0.6);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; TEX.set(o.key, t); return t; }
function buildGarment({ THREE, toon, ink }, o, lift, body, arms) {
  const out = [], mesh = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); p.add(m); if (mat !== ink) m.castShadow = true; return m; };
  const shell = mesh(shellGeo(THREE, o, 0, lift), toon('#ffffff', { map: garmentTex(THREE, o), side: THREE.DoubleSide }), 0, 0, 0, body); out.push(shell);
  if (ink) out.push(mesh(shellGeo(THREE, o, 0.016, lift), ink, 0, 0, 0, body));
  const capT = toon(o.sh[0]), capB = toon(o.sh[1]), cloth = toon(o.sl[0], { side: THREE.DoubleSide }), cuff = toon(o.sl[1]);
  for (const s of [-1, 1]) { const pg = new THREE.Group(); pg.position.set(s * 0.36, 1.17 + lift, 0); pg.rotation.z = -s * 0.42; body.add(pg); out.push(pg);
    mesh(new THREE.SphereGeometry(0.222, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), capT, 0, 0, 0, pg).scale.set(1, 0.78, 1.1);
    mesh(new THREE.SphereGeometry(0.205, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), capB, 0, -0.07, 0, pg).scale.set(1.06, 0.56, 1.12);
    if (ink) mesh(new THREE.SphereGeometry(0.238, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), ink, 0, -0.005, 0, pg).scale.set(1, 0.8, 1.1); }
  [-1, 1].forEach((s, i) => { let a = arms && arms[i]; if (!a) { a = new THREE.Group(); a.position.set(s * 0.41, 1.12 + lift, 0); a.scale.setScalar(1.25); a.rotation.z = s * 0.1; body.add(a); out.push(a); }
    const sl = mesh(new THREE.CylinderGeometry(0.112, 0.12, 0.34, 14, 1, true), cloth, 0, -0.13, 0, a), cf = mesh(new THREE.CylinderGeometry(0.128, 0.128, 0.065, 14), cuff, 0, -0.275, 0, a); out.push(sl, cf);
    if (ink) out.push(mesh(new THREE.CylinderGeometry(0.126, 0.134, 0.34, 14, 1, true), ink, 0, -0.13, 0, a)); });
  return out; }
// put a garment on a fox over its armour (key null = take it off). Works on any castKit fox.
export function dressFox(D, fox, key) { const U = fox && fox.userData, P = U && U.P; if (!P) return;
  if (U.dsfGarment) { for (const m of U.dsfGarment) if (m.parent) m.parent.remove(m); U.dsfGarment = null; U.dsfGarmentKey = null; }
  const o = BY[key]; if (!o) return; U.dsfGarment = buildGarment(D, o, P.legs ? P.legs[0].position.y - 0.5 : 0, P.body, P.arms); U.dsfGarmentKey = key; }
export const fitWorn = save => { const k = save.stat('dsfFitWorn', null), own = save.stat('dsfFitOwned', null); return BY[k] && Array.isArray(own) && own.includes(k) ? k : null; };

export function makeFitRoom(K, { group, OX, block, car, garokAt, keeperAt, tail, renderer, camera, fox, ink, audio, save, LOW, inside = () => false, garok, P, hooks = {} }) {
  const { THREE, scene, toon, basic, glowSprite } = K, D = { THREE, toon, ink }, RED = '#ec3013', GOLD = '#c9a24a', INK = '#f3f2f2';
  const tx = cv => { const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const gold = toon(GOLD), chrome = toon('#d4d8de'), plum = toon('#5a2a4a'), wood = toon('#6a4428');
  const owned = () => { const v = save.stat('dsfFitOwned', null); return Array.isArray(v) ? v : []; };
  // ---- the CAROUSEL: a plum base, a chrome pole, a gold ring with six arms; each garment on a hanger with a price plaque
  const R = 0.6, root = new THREE.Group(); root.position.set(car.x, 0, car.z); root.scale.setScalar(1.2); group.add(root);
  const C = (r1, r2, h, mat, x, y, z, p = root, seg = 18) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), mat); m.position.set(x, y, z); p.add(m); return m; };
  C(0.66, 0.7, 0.08, plum, 0, 0.04, 0, root, 28); { const rim = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.025, 6, 40), gold); rim.rotation.x = Math.PI / 2; rim.position.y = 0.085; root.add(rim); }
  C(0.035, 0.035, 2.25, chrome, 0, 1.17, 0, root, 10); C(0.06, 0.06, 0.05, gold, 0, 2.3, 0); { const f = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), gold); f.position.y = 2.36; root.add(f); }
  const spin = new THREE.Group(); root.add(spin);
  { const ring = new THREE.Mesh(new THREE.TorusGeometry(R, 0.018, 6, 48), gold); ring.rotation.x = Math.PI / 2; ring.position.y = 2.02; spin.add(ring); }
  const holders = [], tags = [];
  STOCK.forEach((o, k) => { const a = k * Math.PI / 3, h = new THREE.Group(); h.position.set(Math.sin(a) * R, 0, Math.cos(a) * R); h.rotation.y = a; spin.add(h); h.userData.k = k;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, R), chrome); arm.position.set(0, 2.02, -R / 2); h.add(arm);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.006, 6, 14, Math.PI * 1.4), gold); hook.position.y = 2.0; hook.rotation.z = Math.PI * 0.8; h.add(hook);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.03), wood); bar.position.y = 1.95; h.add(bar);
    const hang = new THREE.Group(); hang.scale.setScalar(0.5); hang.position.y = 1.95 - 0.65; h.add(hang); buildGarment(D, o, 0, hang, null); h.userData.hang = hang;
    const tc = document.createElement('canvas'); tc.width = 256; tc.height = 112; const tt = tx(tc), tag = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.175), new THREE.MeshBasicMaterial({ map: tt, toneMapped: false }));
    tag.position.set(0, 0.2, 0.08); tag.rotation.x = -0.55; h.add(tag); tags.push({ c: tc, t: tt, key: '' }); holders.push(h); });
  tail.circles.push([car.x, car.z, 0.9]);
  // ---- the start: a red ring round the block + a big hanging sign over it (both hidden while you shop)
  const flat = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.rotation.x = -Math.PI / 2; m.position.set(x, y, z); group.add(m); return m; };
  const ring = flat(new THREE.RingGeometry(1.0, 1.16, 48), basic(RED, 0.95), block.x, 0.03, block.z);
  const sign = new THREE.Group(); sign.position.set(block.x + 0.3, 3.75, block.z); sign.rotation.y = Math.PI / 2; group.add(sign);
  { const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.78), new THREE.MeshBasicMaterial({ map: tx(canvas(1024, 308, (c, w, h) => { c.fillStyle = '#140c18'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b98ad8'; c.lineWidth = 12; c.strokeRect(6, 6, w - 12, h - 12); c.textBaseline = 'middle'; c.fillStyle = '#b98ad8'; c.font = `900 108px ${FONT}`; c.fillText('THE FITTING ROOM', 40, 104); c.fillStyle = INK; c.font = `900 60px ${FONT}`; c.fillText('STAND ON THE BLOCK', 40, 222); })), toneMapped: false }));
    sign.add(sg); const bk = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.86, 0.04), toon('#17141d')); bk.position.z = -0.03; sign.add(bk); for (const sx of [-1.1, 1.1]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.4, 6), gold); r.position.set(sx, 1.1, -0.03); sign.add(r); } }
  // ---- the MIRROR: the centre glass of the three-way mirror reflects the room (only while you are in the shop)
  const mirror = tail.mirrors[1], glass = mirror.material, RTW = LOW ? 200 : 340, rt = new THREE.WebGLRenderTarget(RTW, Math.round(RTW * 2.8 / 1.25), { depthBuffer: true }); rt.texture.colorSpace = THREE.SRGBColorSpace;
  const mMat = new THREE.MeshBasicMaterial({ map: rt.texture, color: 0xe4eaf0, toneMapped: false }), vcam = new THREE.PerspectiveCamera(50, 1, 0.1, 60);
  const _n = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Vector3(), _q = new THREE.Quaternion(), corners = [[-0.625, -1.4], [0.625, -1.4], [0.625, 1.4], [-0.625, 1.4]].map(([x, y]) => new THREE.Vector3(x, y, 0));
  let uvSet = false, mirOn = false, mirSkip = 0;
  function renderMirror() { mirror.updateMatrixWorld(); mirror.getWorldPosition(_p); mirror.getWorldQuaternion(_q); _n.set(0, 0, 1).applyQuaternion(_q);
    _c.copy(camera.position); const dd = _c.clone().sub(_p).dot(_n); if (dd < 0.2) return; _c.addScaledVector(_n, -2 * dd);
    vcam.position.copy(_c); vcam.up.set(0, 1, 0); vcam.lookAt(_c.clone().add(_n)); vcam.updateMatrixWorld(); vcam.matrixWorldInverse.copy(vcam.matrixWorld).invert();
    const cs = corners.map(v => v.clone().applyMatrix4(mirror.matrixWorld).applyMatrix4(vcam.matrixWorldInverse)), near = -cs[0].z;
    const xs = cs.map(v => v.x), ys = cs.map(v => v.y), l = Math.min(...xs), r = Math.max(...xs), b = Math.min(...ys), t = Math.max(...ys);
    vcam.projectionMatrix.makePerspective(l, r, t, b, near, 60); vcam.projectionMatrixInverse.copy(vcam.projectionMatrix).invert();
    if (!uvSet) { uvSet = true; const g = mirror.geometry.clone(), pp = g.attributes.position, uv = g.attributes.uv, v = new THREE.Vector3(); for (let i = 0; i < pp.count; i++) { v.fromBufferAttribute(pp, i).applyMatrix4(mirror.matrixWorld).applyMatrix4(vcam.matrixWorldInverse); const s = near / -v.z; uv.setXY(i, (v.x * s - l) / (r - l), (v.y * s - b) / (t - b)); } mirror.geometry = g; }
    mirror.visible = false; const prev = renderer.getRenderTarget(), au = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false; renderer.setRenderTarget(rt); renderer.render(scene, vcam); renderer.setRenderTarget(prev); renderer.shadowMap.autoUpdate = au; mirror.visible = true; }
  function mirrorOn(on) { if (on === mirOn) return; mirOn = on; mirror.material = on ? mMat : glass; }
  // ---- sparkles (buying) + cloth puffs (trying on)
  const sparks = []; for (let i = 0; i < (LOW ? 10 : 18); i++) { const s = glowSprite(0, 0, 0, 0xffd23a, 0.12, 0, group); s.userData.t = 1; sparks.push(s); }
  function burst(col, n, up) { const cx = block.x, cz = block.z; sparks.slice(0, n).forEach((s, i) => { s.material.color.set(col); const a = i / n * Math.PI * 2; s.userData = { t: 0, a, up, r0: 0.3 }; s.position.set(cx, 1.2, cz); }); }
  // ---- sound
  const swish = () => { audio.tone(1900, 0.12, 0.018, 'triangle', 0.4); setTimeout(() => audio.tone(1200, 0.14, 0.014, 'triangle', 0.5), 60); };
  const coins = () => [0, 4, 7, 12].forEach((v, i) => setTimeout(() => audio.tone(523 * Math.pow(2, v / 12), 0.22, 0.05, 'triangle'), i * 85));
  const nope = () => audio.tone(170, 0.24, 0.06, 'square', 0.6);
  // ---- Garok walks round the counter to the block and back
  let route = null; const GSP = 2.2;
  const toFit = [[keeperAt.x - 3.9, keeperAt.z], [garokAt.x, garokAt.z]], toDesk = [[keeperAt.x - 3.9, keeperAt.z], [keeperAt.x, keeperAt.z]];
  function walkG(pts) { route = pts.map(([x, z]) => [OX + x, z]); }
  function glide(dt) { if (!route || !garok) return; const [x, z] = route[0], dx = x - garok.x, dz = z - garok.z, d = Math.hypot(dx, dz);
    if (d < 0.05) { route.shift(); if (!route.length) { route = null; garok.glide = 0; garok.home = open ? Math.atan2(P.x - garok.x, P.z - garok.z) : 0; } return; }
    const st = Math.min(d, GSP * dt); garok.x += dx / d * st; garok.z += dz / d * st; garok.glide = GSP; garok.home = Math.atan2(dx, dz); }
  // ---- state
  let open = false, sel = 0, preview = null, rot = 0, rotTo = 0, twirl = 1, msg = null, msgT = 0, lift = 0, boxH = 2.8, whirT = 0;
  const worn = () => fitWorn(save);
  function drawTags() { const own = owned(), w = worn(); tags.forEach((g, k) => { const o = STOCK[k], st = w === o.key ? 'WEARING' : own.includes(o.key) ? 'OWNED' : o.price + ' G', key = st + (k === sel && open ? '*' : ''); if (g.key === key) return; g.key = key;
    const c = g.c.getContext('2d'), on = k === sel && open; c.fillStyle = on ? RED : '#140c18'; c.fillRect(0, 0, 256, 112); c.strokeStyle = on ? INK : GOLD; c.lineWidth = 8; c.strokeRect(4, 4, 248, 104);
    c.fillStyle = st === 'OWNED' && !on ? '#8fe38f' : INK; c.font = `900 ${st.length > 5 ? 52 : 64}px ${FONT}`; c.textBaseline = 'middle'; c.fillText(st, 18, 58); g.t.needsUpdate = true; }); }
  drawTags();
  function wearPreview() { dressFox(D, fox, preview); }
  function pick(k, quiet) { sel = (k + 6) % 6; preview = STOCK[sel].key; wearPreview(); rotTo = Math.PI / 2 - sel * Math.PI / 3; twirl = 0; msg = null; drawTags(); if (!quiet) { swish(); whirT = 0.6; burst(STOCK[sel].hi, LOW ? 6 : 10, false); } if (garok) garok.wave = 0.9; hooks.pick && hooks.pick(sel); }
  function action() { const o = STOCK[sel], own = owned();
    if (worn() === o.key) { save.setStat('dsfFitWorn', null); preview = null; wearPreview(); swish(); msg = 'Back in the plain armour. It suits you too, STEWARD.'; msgT = 4; drawTags(); return; }
    if (own.includes(o.key)) { save.setStat('dsfFitWorn', o.key); preview = o.key; wearPreview(); swish(); twirl = 0; if (garok) garok.wave = 1.4; msg = null; drawTags(); return; }
    if (!save.spend(o.price)) { nope(); msg = 'That is ' + o.price + ' G, STEWARD. Work a shift at my cutting table first.'; msgT = 4; return; }
    save.setStat('dsfFitOwned', own.concat([o.key])); save.setStat('dsfFitWorn', o.key); save.setStat('dsfFitBought', save.stat('dsfFitBought', 0) + 1); if (!save.flag('dsfFitDone')) save.setFlag('dsfFitDone');
    preview = o.key; wearPreview(); coins(); burst('#ffd23a', sparks.length, true); twirl = 0; fox.userData.mood = 'happy'; setTimeout(() => { if (fox.userData.mood === 'happy') fox.userData.mood = fox.userData.base || 'neutral'; }, 2500);
    if (garok) { garok.wave = 2.0; garok.hop = 0.8; } msg = 'Sold. ' + o.name + ' is yours, and it walks out on you.'; msgT = 4; drawTags(); hooks.buy && hooks.buy(o); }
  // taps: a ray from the camera through the tap point onto the carousel garments
  const ray = new THREE.Raycaster(), hitP = new THREE.Vector3(), dir = new THREE.Vector3();
  const surface = { c: new THREE.Vector3(OX + car.x + R * 1.2, 1.4, car.z), u: new THREE.Vector3(0, 0, -1), v: new THREE.Vector3(0, -1, 0), n: new THREE.Vector3(1, 0, 0), w: 6, h: 4 };
  function tapAt(x, y) { hitP.copy(surface.c).addScaledVector(surface.u, (x / 6 - 0.5) * 6).addScaledVector(surface.v, (y / 4 - 0.5) * 4); dir.copy(hitP).sub(camera.position).normalize(); ray.set(camera.position, dir);
    const hits = ray.intersectObjects(holders, true); for (const h of hits) { let o = h.object; while (o && o.userData.k == null) o = o.parent; if (o) return o.userData.k; } return -1; }
  // camera = the mirror's view: the fox + the carousel framed in the part of the screen the card leaves free
  function camPose(camTo, lookTo, upTo, w, h, bar) { const portrait = w / h < 0.95, phone = Math.min(w, h) < 520, pad = phone ? 12 : 32;
    let x0 = 0, x1 = w, y0 = bar, y1 = h; if (portrait) y1 = h * 0.5; else x0 = Math.min(w * 0.56, pad + Math.min(480, w - 2 * pad) + 8);
    const fw = (x1 - x0) / w, fh = (y1 - y0) / h, sx = (x0 + x1) / w - 1, sy = 1 - (y0 + y1) / h, a = w / h, tf = Math.tan(25 * Math.PI / 180);
    const bw = portrait ? 2.9 : 3.6, bz = portrait ? -0.45 : -0.6, by = 0.05 + boxH / 2, d = Math.max(boxH / 2 / (tf * fh), bw / 2 / (tf * a * fw)) * 1.06;
    lookTo.set(OX + block.x, by - sy * d * tf, bz + sx * d * tf * a); camTo.copy(lookTo); camTo.x += d; camTo.y += 0.3; upTo.set(0, 1, 0); return 50; }
  function common(dt, T) { glide(dt); spin.rotation.y += Math.atan2(Math.sin(rot - spin.rotation.y), Math.cos(rot - spin.rotation.y)) * Math.min(1, dt * 5);
    const pul = 0.5 + 0.5 * Math.sin(T * 3); ring.visible = sign.visible = !open; ring.scale.setScalar(1 + 0.04 * pul);
    holders.forEach((h, k) => { const on = open && k === sel, hg = h.userData.hang; hg.position.y += ((on ? 1.36 : 1.3) - hg.position.y) * Math.min(1, dt * 6); hg.rotation.z = Math.sin(T * 1.3 + k) * (on ? 0.03 : 0.012); });
    for (const s of sparks) { const u = s.userData; if (u.t >= 1) { s.material.opacity = 0; continue; } u.t = Math.min(1, u.t + dt / (u.up ? 1.3 : 0.6)); const k = u.t, r = u.r0 + k * (u.up ? 0.9 : 0.6);
      s.position.set(block.x + Math.cos(u.a + k * 2) * r, 1.2 + (u.up ? k * 1.4 : Math.sin(k * Math.PI) * 0.4), block.z + Math.sin(u.a + k * 2) * r); s.scale.setScalar(0.08 + 0.1 * (1 - k)); s.material.opacity = (1 - k) * 0.9; }
    const want = inside() && (open || !LOW); mirrorOn(want); if (want && (!LOW || (mirSkip = (mirSkip + 1) % 2) === 0)) renderMirror(); }
  if (fitWorn(save)) dressFox(D, fox, fitWorn(save));
  return {
    title: 'THE FITTING ROOM', where: "Garok's · the mirror", W: 6, H: 4, surface, camPose, stand: { x: OX + block.x, z: block.z, face: Math.PI / 2 },
    idle(dt, T) { if (!open) { rot += dt * 0.15; common(dt, T); } },
    begin() { open = true; const bb = new THREE.Box3().setFromObject(fox), sz = new THREE.Vector3(); bb.getSize(sz); boxH = Math.max(2.6, sz.y + 0.55);
      const w = worn(); sel = w ? STOCK.findIndex(o => o.key === w) : 0; rot = spin.rotation.y; pick(sel, true); twirl = 1; walkG(toFit); hooks.open && hooks.open(true); },
    end() { open = false; preview = worn(); wearPreview(); msg = null; walkG(toDesk); drawTags(); hooks.open && hooks.open(false); },
    tick(dt, T, fly) { if (open) common(dt, T); if (open) rot = rotTo + Math.round((spin.rotation.y - rotTo) / (Math.PI * 2)) * Math.PI * 2;
      lift = 0.3 * Math.min(1, Math.max(0, fly * 1.4 - 0.2)); fox.position.y = P.gy + P.jy + lift;
      if (twirl < 1 && fly > 0.85) { twirl = Math.min(1, twirl + dt / 0.7); const k = twirl * twirl * (3 - 2 * twirl); P.face = Math.PI / 2 + k * Math.PI * 2; fox.rotation.y = P.face; }
      if (whirT > 0) { whirT -= dt; if (Math.random() < dt * 14) audio.tone(90 + Math.random() * 20, 0.06, 0.012, 'sawtooth'); }
      if (msgT > 0) { msgT -= dt; if (msgT <= 0) msg = null; } },
    down(x, y) { const k = tapAt(x, y); if (k >= 0 && k !== sel) pick(k); else if (k === sel) { twirl = 0; swish(); } },
    move() {}, up() {},
    hud() { const o = STOCK[sel], own = owned().includes(o.key), w = worn() === o.key, g = save.data.gold;
      const act = w ? 'TAKE IT OFF' : own ? 'WEAR IT' : g >= o.price ? 'BUY IT · ' + o.price + ' G' : 'NEED ' + o.price + ' G';
      return { where: 'Clothes go over your 8 armour · tap the rail', showStats: true, stats: [['Gold', g + ''], ['Rail', (sel + 1) + ' / 6']],
        card: { side: true, kicker: w ? 'Wearing it · yours' : own ? 'Yours · on the rail' : o.price + ' G · you have ' + g + ' G', title: o.name, body: msg || (o.cut + '. ' + o.line), buttons: [act, 'NEXT ON THE RAIL', 'LEAVE THE SHOP'] } }; },
    cardPick(i) { if (i === 0) action(); else if (i === 1) pick(sel + 1); else return 'leave'; },
  };
}
