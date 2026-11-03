// MERU 2.0 — ARENA PATH RIDES (Ben): HELICOPTER RIDES (fly the chopper yourself, all over town) on the north side and the CAROUSEL
// (ride a horse, rise + sink it to meet things; GRAB the brass ring off the arm and catch what the crowd throws you) on the south side,
// across a short road from each other, at x 280, a little further off the path than the booths.
// HELI: E at the chopper = FLY. Stick = forward/back + turn · 3 UP (tap = +8 m) · 1 DOWN (tap = -8 m; at the bottom = land) ·
//   2 BOOST. E when landed = get out (anywhere). Walk 80 m away and the chopper flies itself home to the pad.
// CAROUSEL: E at the gate = RIDE (60 s). 3 RISE (tap lifts your horse, it sinks back slowly) · 1 GRAB. Brass ring 50, gold star 30,
//   plush 20, candy 10. Best score in the save (stat meru2Carousel.best). E again = get off early.
import { applyD, lifeD } from '../engine/fox-poses.js?v=s648k';   // s630 life poses
import { WS } from '../engine/world-sfx.js?v=s713';   // s711 Runway sounds (audio/meru)
import { vehicleKit } from '../engine/vehicle-kit.js';
import { PLAYER_MALE, PLAYER_FEMALE } from '../fox-kit.js?v=s673';

export function buildRides({ THREE, scene, M, toon, grad, kit, cols, L, save, touch, root, bulbs, TALK, talkers, keepers, signTower }) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt)), wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
  const CT = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const tc = c => typeof c === 'string' ? toon(c) : c;
  const B = (w, h, d, col, x, y, z, par, o = 0.015) => M(new THREE.BoxGeometry(w, h, d), tc(col), x, y, z, par, o);
  const C = (r, h, col, x, y, z, par, o = 0.012, n = 12) => M(new THREE.CylinderGeometry(r, r, h, n), tc(col), x, y, z, par, o, r);
  const S = (r, col, x, y, z, par, o = 0.01) => M(new THREE.SphereGeometry(r, 12, 10), tc(col), x, y, z, par, o, r);
  const box = (x0, x1, z0, z1) => cols.push({ f: [x0, x1, z0, z1] }), ring = (x, z, r) => cols.push({ c: [x, z, r] });
  const FONT = '"Archivo", "Arial Black", Arial, sans-serif', BULB = ['#ffd23a', '#ff6b6b', '#7dd3fc', '#86efac', '#fff4d0'];
  let toast = '', toastT = 0; const say = (t, s = 2.2) => { toast = t; toastT = s; };
  const RX = 280, HZ0 = -21, CZ0 = 19;

  // ---------- the short road between the two rides (crosses the Arena Path) ----------
  { const g = new THREE.Group(); root.add(g); const asph = toon('#3a3836');
    B(5, 0.04, 27, asph, RX, 0.03, -0.5, g, 0); for (const s of [-1, 1]) B(0.12, 0.05, 27, '#f3f2f2', RX + s * 2.3, 0.035, -0.5, g, 0);
    for (let z = -12; z <= 11; z += 2.4) B(0.12, 0.05, 1.2, '#ffd23a', RX, 0.036, z, g, 0);
    for (const zz of [-4.4, 4.4]) for (let i = 0; i < 6; i++) B(0.42, 0.05, 1.4, '#f3f2f2', RX - 1.9 + i * 0.76, 0.04, zz, g, 0); }

  // ================= HELICOPTER RIDES (north) =================
  const VK = vehicleKit({ THREE, M, toon });
  const pad = new THREE.Group(); pad.position.set(RX, 0, HZ0); root.add(pad);
  { const padT = CT(512, 512, (q, w) => { q.fillStyle = '#5b5956'; q.fillRect(0, 0, w, w); for (let i = 0; i < 900; i++) { q.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)'; q.fillRect(Math.random() * w, Math.random() * w, 3, 3); }
      q.strokeStyle = '#ffd23a'; q.lineWidth = 22; q.beginPath(); q.arc(w / 2, w / 2, w * 0.38, 0, 7); q.stroke(); q.fillStyle = '#f3f2f2'; q.fillRect(w * 0.33, w * 0.28, w * 0.08, w * 0.44); q.fillRect(w * 0.59, w * 0.28, w * 0.08, w * 0.44); q.fillRect(w * 0.33, w * 0.46, w * 0.34, w * 0.08);
      q.strokeStyle = '#f3f2f2'; q.lineWidth = 10; q.strokeRect(14, 14, w - 28, w - 28); });
    const p = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 14), [toon('#4a4845'), toon('#4a4845'), new THREE.MeshToonMaterial({ map: padT, gradientMap: grad }), toon('#4a4845'), toon('#4a4845'), toon('#4a4845')]); p.position.y = 0.15; p.receiveShadow = true; pad.add(p);
    const edge = []; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; edge.push([Math.cos(a) * 6.6, 0.36, Math.sin(a) * 6.6]); } pad.updateMatrixWorld(true);
    const v = new THREE.Vector3(); edge.forEach(([x, y, z], i) => { v.set(x, y, z); pad.localToWorld(v); bulbs.push({ p: v.clone(), col: i % 2 ? '#86efac' : '#ffd23a', marq: true, ph: i }); });
    // windsock + a ticket hut with the sign
    C(0.06, 4.5, '#f3f2f2', 6.4, 2.25, -6.4, pad, 0.006, 8); const sock = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.8, 10, 1, true), new THREE.MeshToonMaterial({ map: CT(64, 16, (q) => { for (let i = 0; i < 4; i++) { q.fillStyle = i % 2 ? '#f3f2f2' : '#ec3013'; q.fillRect(i * 16, 0, 16, 16); } }), gradientMap: grad, side: THREE.DoubleSide }));
    sock.rotation.z = Math.PI / 2; sock.position.set(7.3, 4.3, -6.4); pad.add(sock); pad.userData.sock = sock;
    const hut = new THREE.Group(); hut.position.set(-5.2, 0.3, -5.2); pad.add(hut); B(2.4, 2.4, 2.0, '#f3f2f2', 0, 1.2, 0, hut, 0.02); B(2.7, 0.2, 2.3, '#ec3013', 0, 2.5, 0, hut, 0.015); B(1.6, 0.8, 0.06, '#9fe3ff', 0, 1.5, 1.01, hut, 0);
    ring(RX - 5.2, HZ0 - 5.2, 1.5); ring(RX + 6.4, HZ0 - 6.4, 0.2);
    signTower(pad, 'HELICOPTER RIDES', { bg: '#1f3a5f', fg: '#ffd23a', edge: '#e6b45a', fw: 3.6, x: -6.4, y: 4.6, z: 6.4, pole: 4.0 }); ring(RX - 6.4, HZ0 + 6.4, 0.2); }
  const heli = VK.make('heli'), HV = heli.userData.V; heli.scale.setScalar(1.4); scene.add(heli);
  if (HV.gun) HV.gun.visible = false; (HV.podTubes || []).forEach(t => t.visible = false);
  const HOME = { x: RX, z: HZ0, y: 0.3, yaw: Math.PI };
  const H = { on: false, x: HOME.x, z: HOME.z, y: HOME.y, yaw: HOME.yaw, sp: 0, alt: 0, boost: false, spin: 0, tilt: 0, roll: 0, gone: false };
  const placeHeli = () => { heli.position.set(H.x, H.y, H.z); heli.rotation.set(0, H.yaw, 0); if (HV.body) { HV.body.rotation.x = H.tilt; HV.body.rotation.z = H.roll; } };
  placeHeli();
  const heliBlock = { f: [HOME.x - 2, HOME.x + 2, HOME.z - 2.6, HOME.z + 2.6] }; cols.push(heliBlock);
  keeper('skyPilot', 'CAPTAIN GALE', 'Helicopter rides (DRAFT)', ['Fancy seeing Meru from the sky? She is fuelled and ready.', 'Stick to fly, 3 to climb, 1 to come down. 2 for a burst of speed.', 'Land anywhere flat and hop out. She finds her own way home.'],
    { torso: ['#1f3a5f', '#f3f2f2', '#ffd23a'], outfit: 'coat', look: { ...PLAYER_FEMALE, fur: '#d9733a', furDark: '#9a4a22' } }, RX - 5.2, HZ0 - 3.6, 0);
  const nearHeli = P => !H.on && P.y < 2 && Math.hypot(P.x - H.x, P.z - H.z) < 4.2;

  // ================= CAROUSEL (south) =================
  const car = new THREE.Group(); car.position.set(RX, 0, CZ0); root.add(car);
  const spin = new THREE.Group(); spin.position.y = 0.45; car.add(spin);
  const NH = touch ? 8 : 12, RH = 3.6, SEAT0 = 1.0, horses = [];
  { const deckT = CT(256, 256, (q, w) => { for (let i = 0; i < 16; i++) { q.fillStyle = i % 2 ? '#c89a62' : '#b5844e'; q.beginPath(); q.moveTo(w / 2, w / 2); q.arc(w / 2, w / 2, w / 2, i / 16 * 7 * 0.9, (i + 1) / 16 * 7 * 0.9); q.fill(); } });
    C(5.4, 0.45, '#e6b45a', 0, 0.22, 0, car, 0.02, 40); const deck = new THREE.Mesh(new THREE.CircleGeometry(5.2, 40), new THREE.MeshToonMaterial({ map: deckT, gradientMap: grad })); deck.rotation.x = -Math.PI / 2; deck.position.y = 0.01; spin.add(deck);
    C(0.8, 5.2, '#c42d3c', 0, 2.6, 0, spin, 0.02, 20); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; B(0.5, 4.4, 0.06, i % 2 ? '#ffd23a' : '#f3ecdf', Math.cos(a) * 0.82, 2.6, Math.sin(a) * 0.82, spin, 0).rotation.y = -a; }
    const stripes = CT(512, 64, (q, w, h) => { for (let i = 0; i < 16; i++) { q.fillStyle = i % 2 ? '#f3ecdf' : '#c42d3c'; q.fillRect(i * w / 16, 0, w / 16 + 1, h); } });
    const roof = new THREE.Mesh(new THREE.ConeGeometry(6.0, 2.2, 32, 1, true), new THREE.MeshToonMaterial({ map: stripes, gradientMap: grad, side: THREE.DoubleSide })); roof.position.y = 6.3; spin.add(roof);
    const val = CT(1024, 128, (q, w) => { const n = 32, sw = w / n; for (let i = 0; i < n; i++) { q.fillStyle = i % 2 ? '#f3ecdf' : '#c42d3c'; q.fillRect(i * sw, 0, sw + 1, 80); q.beginPath(); q.arc(i * sw + sw / 2, 80, sw / 2, 0, Math.PI); q.fill(); } q.fillStyle = '#e6b45a'; q.fillRect(0, 0, w, 10); });
    const vm = new THREE.Mesh(new THREE.CylinderGeometry(6.0, 6.0, 0.7, 40, 1, true), new THREE.MeshToonMaterial({ map: val, gradientMap: grad, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); vm.position.y = 4.9; spin.add(vm);
    C(0.12, 0.8, '#e6b45a', 0, 7.7, 0, spin, 0.01, 8); S(0.28, '#ffd23a', 0, 8.2, 0, spin, 0.01);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), new THREE.MeshToonMaterial({ color: '#ec3013', gradientMap: grad, side: THREE.DoubleSide })); flag.position.set(0.45, 8.0, 0); spin.add(flag);
    // horses on brass poles (they bob; yours you control)
    const HC = ['#f3ecdf', '#201e1d', '#c98a3c', '#f3ecdf', '#7a4a2a', '#f8fafc'], SAD = ['#c42d3c', '#38bdf8', '#ffd23a', '#22c55e', '#a78bfa', '#f472b6'];
    for (let i = 0; i < NH; i++) { const a = i / NH * Math.PI * 2, hg = new THREE.Group(); spin.add(hg); const pole = C(0.05, 5.0, '#e6b45a', Math.cos(a) * RH, 2.55, Math.sin(a) * RH, spin, 0.006, 8);
      const h = new THREE.Group(); hg.add(h); h.position.set(Math.cos(a) * RH, SEAT0, Math.sin(a) * RH); h.rotation.y = -a + Math.PI; const c = toon(HC[i % HC.length]), sd = toon(SAD[i % SAD.length]);
      const bd = M(new THREE.SphereGeometry(0.42, 14, 10), c, 0, 0, 0, h, 0.02, 0.42); bd.scale.set(0.62, 0.62, 1.25);
      const nk = M(new THREE.CylinderGeometry(0.13, 0.18, 0.6, 10), c, 0, 0.33, 0.48, h, 0.012); nk.rotation.x = 0.6; const hd = M(new THREE.BoxGeometry(0.2, 0.22, 0.42), c, 0, 0.58, 0.7, h, 0.012); hd.rotation.x = 0.35;
      for (const e of [-1, 1]) M(new THREE.ConeGeometry(0.04, 0.12, 6), c, e * 0.07, 0.74, 0.58, h, 0);
      B(0.05, 0.3, 0.32, sd, 0, 0.5, 0.42, h, 0); B(0.5, 0.06, 0.42, sd, 0, 0.27, -0.05, h, 0.008);
      for (const [lx, lz, rx] of [[-0.15, 0.32, -0.9], [0.15, 0.32, -0.6], [-0.15, -0.36, 0.8], [0.15, -0.36, 0.5]]) { const lg = M(new THREE.CylinderGeometry(0.05, 0.04, 0.55, 6), c, lx, -0.3, lz, h, 0.006); lg.rotation.x = rx; }
      const tl = M(new THREE.ConeGeometry(0.08, 0.5, 6), toon('#201e1d'), 0, 0.05, -0.62, h, 0); tl.rotation.x = -2.2;
      horses.push({ h, a, ph: i * 1.3 }); } }
  const mine = 0;   // you always get horse 0
  // rim bulbs (in world space they rotate, so they are their own little instanced mesh)
  { const n = 40, im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }), n), m4 = new THREE.Matrix4(), cc = new THREE.Color();
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; m4.makeTranslation(Math.cos(a) * 6.02, 4.55, Math.sin(a) * 6.02); im.setMatrixAt(i, m4); im.setColorAt(i, cc.set(BULB[i % BULB.length])); } im.instanceColor.needsUpdate = true; spin.add(im); car.userData.rim = im; }
  // fence + gate (the gate faces the road, north side of the carousel)
  { const fm = toon('#e6b45a'); const FR = 6.6; for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; if (Math.abs(wrap(a - (-Math.PI / 2))) < 0.2) continue; C(0.05, 1.0, fm, Math.cos(a) * FR, 0.5, Math.sin(a) * FR, car, 0.004, 6); }
    const rail = new THREE.Mesh(new THREE.TorusGeometry(FR, 0.05, 6, 64, Math.PI * 2 - 0.4), fm); rail.rotation.x = Math.PI / 2; rail.rotation.z = -Math.PI / 2 + 0.2; rail.position.y = 1.0; car.add(rail);
    for (const s of [-1, 1]) { C(0.1, 1.5, '#c42d3c', s * 1.35, 0.75, -FR, car, 0.008, 8); S(0.14, '#ffd23a', s * 1.35, 1.6, -FR, car, 0.006); }
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; if (Math.abs(wrap(a - (-Math.PI / 2))) < 0.25) continue; ring(RX + Math.cos(a) * FR, CZ0 + Math.sin(a) * FR, 0.3); }
    ring(RX, CZ0, 5.5); }
  signTower(car, 'CAROUSEL', { bg: '#c42d3c', fg: '#ffffff', edge: '#e6b45a', fw: 3.2, x: -3.6, y: 4.6, z: -7.9, pole: 4.0 }); ring(RX - 3.6, CZ0 - 7.9, 0.2);
  // the BRASS RING ARM (outside the fence on the far side, swings a ring in over the horses)
  const ARM_A = Math.PI / 2;   // south side of the carousel (away from the road)
  const arm = new THREE.Group(); arm.position.set(Math.cos(ARM_A) * 7.4, 0, Math.sin(ARM_A) * 7.4); car.add(arm);
  C(0.1, 4.4, '#201e1d', 0, 2.2, 0, arm, 0.008, 8); const boom = B(3.8, 0.1, 0.1, '#201e1d', 0, 4.3, 0, arm, 0.006); boom.rotation.y = -ARM_A + Math.PI / 2; boom.position.set(-Math.cos(ARM_A) * 1.8, 4.3, -Math.sin(ARM_A) * 1.8); ring(RX + Math.cos(ARM_A) * 7.4, CZ0 + Math.sin(ARM_A) * 7.4, 0.3);
  const brass = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.035, 8, 20), new THREE.MeshToonMaterial({ color: '#ffcf4a', gradientMap: grad, emissive: '#5a3a00' })); car.add(brass);
  const wire = C(0.01, 1, '#201e1d', 0, 0, 0, car, 0, 4);
  // the crowd round the fence who throw you things
  const CROWD = [[-2.2, 'pip', '#38bdf8'], [-1.4, 'juno', '#f472b6'], [-0.2, 'mae', '#a78bfa'], [0.9, 'tobi', '#22c55e'], [2.0, 'bex', '#ffd23a'], [2.6, 'rook', '#ec3013']];
  const crowd = (matchMedia('(pointer: coarse)').matches ? CROWD.filter((_, i) => i % 2 === 0) : CROWD).map(([a, key, c], i) => { const f = kit.makeFox({ joints: true, key: 'carCrowd' + i, torso: [c, '#f3f2f2', '#201e1d'], outfit: 'tee', crest: '', gear: 'none', mood: 'happy', look: { ...(i % 2 ? PLAYER_FEMALE : PLAYER_MALE), fur: ['#e9772c', '#d86a26', '#f08a3c', '#c96a2a'][i % 4] } });
    const P = f.userData.P; if (P.sword) P.sword.visible = false; if (P.gun) P.gun.visible = false; const x = Math.cos(a) * 7.6, z = Math.sin(a) * 7.6; f.position.set(RX + x, 0, CZ0 + z); f.rotation.y = Math.atan2(-x, -z); f.scale.setScalar(0.92); root.add(f); ring(RX + x, CZ0 + z, 0.4); keepers.push(f); return { f, a, t: 0 }; });
  keeper('carouselKeeper', 'MISS TWIRL', 'Carousel (DRAFT)', ['All aboard! One minute a ride.', 'Tap 3 to lift your horse, she sinks back down by herself.', 'Grab the brass ring as you pass the arm! And catch what the crowd throws you.'],
    { torso: ['#c42d3c', '#f3ecdf', '#e6b45a'], outfit: 'dress', look: { ...PLAYER_FEMALE, fur: '#e8873a', furDark: '#b5531c' } }, RX + 3.2, CZ0 - 7.4, Math.PI);
  const GATE = { x: RX, z: CZ0 - 6.9 };
  const nearGate = P => !R.on && P.y < 1 && Math.hypot(P.x - GATE.x, P.z - GATE.z) < 2.2;
  // flying prizes (pool)
  const PRIZE = { candy: { pts: 10, col: '#f472b6' }, plush: { pts: 20, col: '#f2741f' }, star: { pts: 30, col: '#ffd23a' } };
  const pool = []; for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.visible = false; root.add(g); const kinds = {};
    kinds.candy = S(0.13, '#f472b6', 0, 0, 0, g, 0.008); kinds.plush = S(0.17, '#f2741f', 0, 0, 0, g, 0.01); kinds.star = new THREE.Mesh(new THREE.OctahedronGeometry(0.2), new THREE.MeshToonMaterial({ color: '#ffd23a', gradientMap: grad, emissive: '#4a3000' })); g.add(kinds.star);
    pool.push({ g, kinds, live: false }); }
  const R = { on: false, t: 0, ang: 0, w: 0, h: 0, vh: 0, pts: 0, grabCd: 0, ringY: 2.2, ringLive: true, lapA: 0, throwT: 2, caught: 0, rings: 0, best: (save && save.stat ? save.stat('meru2Carousel.best') : 0) || 0 };
  const DUR = 60, W_RIDE = 0.55;
  const seatWorld = (i, out) => { const hz = horses[i]; out.set(Math.cos(R.ang + hz.a) * RH, 0, Math.sin(R.ang + hz.a) * RH); out.x += RX; out.z += CZ0; return out; };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
  function throwOne() { const P0 = pool.find(p => !p.live); if (!P0) return; const c = crowd[(Math.random() * crowd.length) | 0], T = 1.25 + Math.random() * 0.35;
    const futA = R.ang + horses[mine].a - R.w * T; const tx = RX + Math.cos(futA) * RH, tz = CZ0 + Math.sin(futA) * RH, ty = 2.35 + Math.random() * 1.4;   // a height you have to meet
    const kind = Math.random() < 0.2 ? 'star' : Math.random() < 0.55 ? 'plush' : 'candy'; for (const k in P0.kinds) P0.kinds[k].visible = k === kind;
    Object.assign(P0, { live: true, kind, t: 0, T, x0: c.f.position.x, y0: 1.6, z0: c.f.position.z, tx, ty, tz }); P0.g.visible = true; c.t = 0.5; }

  // ================= API =================
  function prompt(P) { if (H.on) return H.y - groundY(H.x, H.z) < 0.4 ? 'GET OUT' : null; if (R.on) return 'GET OFF';
    if (nearHeli(P)) return 'FLY \u00b7 HELICOPTER RIDE \u00b7 FREE'; if (nearGate(P)) return 'RIDE \u00b7 CAROUSEL \u00b7 FREE'; return null; }
  let groundY = () => 0;
  function talk(P) {
    if (H.on) { if (H.y - groundY(H.x, H.z) < 0.4 && H.sp < 2) { off(P); } else say('LAND FIRST \u00b7 TAP 1 TO COME DOWN'); return true; }
    if (R.on) { endRide(P, true); return true; }
    if (nearHeli(P)) { H.on = true; P.heli = true; WS.play('heli-startup', 0.55); H.alt = 0; H.sp = 0; heliBlock.f = [0, 0, 0, 0]; say('STICK FLY \u00b7 3 UP \u00b7 1 DOWN \u00b7 2 BOOST', 3.5); return true; }
    if (nearGate(P)) { Object.assign(R, { on: true, t: 0, h: 0, vh: 0, pts: 0, caught: 0, rings: 0, ringLive: true, throwT: 2.5, w: 0 }); P.carousel = true; say('3 RISE \u00b7 1 GRAB \u00b7 GRAB THE BRASS RING!', 3); return true; }
    return false; }
  function off(P) { if (H.on) { H.on = false; P.heli = false; const a = H.yaw + Math.PI / 2; P.x = H.x + Math.sin(a) * 3; P.z = H.z + Math.cos(a) * 3; P.y = groundY(P.x, P.z); P.vy = 0; H.sp = 0; H.boost = false;
      if (Math.hypot(H.x - HOME.x, H.z - HOME.z) < 6) homeHeli(); }
    if (R.on) endRide(P, true); }
  function homeHeli() { Object.assign(H, { x: HOME.x, z: HOME.z, y: HOME.y, yaw: HOME.yaw, tilt: 0, roll: 0, alt: 0 }); heliBlock.f = [HOME.x - 2, HOME.x + 2, HOME.z - 2.6, HOME.z + 2.6]; placeHeli(); }
  function endRide(P, early) { R.on = false; P.carousel = false; const best = Math.max(R.best, R.pts); if (best > R.best && save && save.setStat) save.setStat('meru2Carousel.best', best); R.best = best;
    say((early ? 'OFF THE CAROUSEL' : 'RIDE OVER') + ' \u00b7 ' + R.pts + ' POINTS \u00b7 BEST ' + R.best, 3.5); P.x = GATE.x; P.z = GATE.z - 1.2; P.y = 0; P.vy = 0; P.yaw = Math.PI; for (const p of pool) { p.live = false; p.g.visible = false; } }
  const btn = {
    one(P) { if (H.on) { H.alt = Math.max(0, H.alt - 8); if (H.alt === 0) say('COMING DOWN', 1.2); return true; }
      if (R.on) { if (R.grabCd > 0) return true; R.grabCd = 0.35; const hand = seatWorld(mine, tmp); hand.y = 1.2 + R.h + 1.15; let got = null;
        for (const p of pool) if (p.live && p.g.position.distanceTo(hand) < 0.95) { got = p; break; }
        if (got) { got.live = false; got.g.visible = false; const v = PRIZE[got.kind].pts; R.pts += v; R.caught++; say('CAUGHT A ' + got.kind.toUpperCase() + ' \u00b7 +' + v, 1.4); return true; }
        if (R.ringLive && brass.visible) { const d = brass.getWorldPosition(tmp2).distanceTo(hand); if (d < 0.75) { R.ringLive = false; brass.visible = false; R.pts += 50; R.rings++; say('THE BRASS RING! +50', 1.8); return true; } }
        say('MISSED', 0.6); return true; }
      return false; },
    two(P) { if (H.on) { H.boost = !H.boost; say(H.boost ? 'BOOST ON' : 'BOOST OFF', 1); return true; } if (R.on) return true; return false; },
    three(P) { if (H.on) { H.alt = Math.min(140, H.alt + 8); return true; } if (R.on) { R.vh = Math.min(R.vh + 1.5, 2.6); return true; } return false; } };
  // flying: stick y = forward/back, stick x = turn; climbs to H.alt above the ground; buildings block below 24 m
  function heliDrive(dt, ix, iy, P, blocked, ground) { groundY = (x, z) => ground(x, z, 0).h;
    const top = H.boost ? 42 : 24; H.sp = damp(H.sp, iy > 0.05 ? iy * top : iy < -0.05 ? iy * 8 : 0, 1.4, dt); H.yaw -= ix * 1.6 * dt;
    const g = groundY(H.x, H.z), want = g + 0.3 + H.alt; H.y = damp(H.y, want, H.alt > 0 || H.y > g + 0.5 ? 1.2 : 3, dt);
    const air = H.y > g + 0.8; if (!air && H.alt === 0) H.sp *= Math.exp(-dt * 3);
    const nx = H.x + Math.sin(H.yaw) * H.sp * dt, nz = H.z + Math.cos(H.yaw) * H.sp * dt, Hm = L.MAP.half - 12;
    if (L.outOfMap ? L.outOfMap(nx, nz, 12) : Math.abs(nx) > Hm || Math.abs(nz) > Hm) { H.sp *= -0.3; say('THAT IS THE EDGE OF MERU', 1.4); }
    else if (H.y < 24 && blocked(nx, nz, 3)) { H.sp *= -0.25; if (toastT <= 0) say('TOO LOW \u00b7 TAP 3 TO CLIMB', 1.4); } else { H.x = nx; H.z = nz; }
    H.tilt = damp(H.tilt, (H.sp / 42) * 0.32, 3, dt); H.roll = damp(H.roll, ix * 0.3 * Math.min(1, H.sp / 10 + 0.3), 3, dt); placeHeli();
    const st = new THREE.Vector3(HV.seat.x, HV.seat.y, HV.seat.z).multiplyScalar(1.4); st.applyAxisAngle(new THREE.Vector3(0, 1, 0), H.yaw);
    P.x = H.x + st.x; P.z = H.z + st.z; P.y = H.y + st.y - 0.25; P.yaw = H.yaw; P.sp = 0; P.ground = true; P.swim = false; P.vy = 0; }
  // the per-frame for both rides (also when not riding: the carousel turns, the crowd waves, the chopper idles)
  let T = 0, nightK = false;
  function tick(dt, P, night) { T += dt; if (toastT > 0) toastT -= dt; nightK = night;
    // chopper
    H.spin = damp(H.spin, H.on ? 1 : 0, 1.2, dt); if (H.spin > 0.02) { if (!H.snd) H.snd = WS.loop('heli-rotor'); const dd = P ? Math.hypot(P.x - H.x, P.z - H.z) : 0, fall = H.on ? 1 : clamp(1 - dd / 60, 0, 1); H.snd.set(H.spin * H.spin * 0.7 * fall, 0.7 + H.spin * 0.3 + (H.boost ? 0.08 : 0)); } else if (H.snd) { H.snd.stop(); H.snd = null; }   /* s711 recorded rotor */ if (HV.rotor) HV.rotor.rotation.y += dt * 28 * H.spin; if (HV.tailRotor) HV.tailRotor.rotation.x += dt * 40 * H.spin;
    if (HV.rotorDisc) HV.rotorDisc.visible = H.spin > 0.6; if (HV.strobe) HV.strobe.visible = (T % 1.2) < 0.12;
    if (pad.userData.sock) pad.userData.sock.rotation.y = Math.sin(T * 0.7) * 0.4;
    if (!H.on && P && Math.hypot(H.x - HOME.x, H.z - HOME.z) > 6 && Math.hypot(P.x - H.x, P.z - H.z) > 80) homeHeli();
    // carousel
    R.w = damp(R.w, W_RIDE, 0.6, dt); R.ang -= R.w * dt; spin.rotation.y = -R.ang; const rideOn = R.on;
    horses.forEach((hz, i) => { const y = i === mine && rideOn ? SEAT0 + R.h : SEAT0 + 0.35 + Math.sin(T * 1.6 + hz.ph) * 0.35; hz.h.position.y = y; });
    if (rideOn) { R.t += dt; R.grabCd = Math.max(0, R.grabCd - dt); R.vh -= 1.6 * dt; R.h += R.vh * dt; if (R.h < 0) { R.h = 0; R.vh = 0; } if (R.h > 1.5) { R.h = 1.5; R.vh = Math.min(0, R.vh); }
      const s = seatWorld(mine, tmp); P.x = s.x; P.z = s.z; P.y = 1.2 + R.h; P.yaw = -(R.ang + horses[mine].a) - Math.PI; P.sp = 0; P.vy = 0; P.ground = true;
      if ((R.throwT -= dt) <= 0) { R.throwT = 2.4 + Math.random() * 1.8; throwOne(); }
      if (toastT <= 0) { const left = Math.max(0, Math.ceil(DUR - R.t)); toast = 'CAROUSEL \u00b7 ' + left + 's \u00b7 ' + R.pts + ' PTS'; toastT = 0.25; }
      if (R.t >= DUR) endRide(P, false); }
    // the brass ring: hangs on the arm at a new height every lap
    { const lap = Math.floor(-R.ang / (Math.PI * 2)); if (lap !== R.lapA) { R.lapA = lap; R.ringY = 2.4 + Math.random() * 1.2; R.ringLive = true; brass.visible = true; }
      const bx = Math.cos(ARM_A) * (RH + 0.1), bz = Math.sin(ARM_A) * (RH + 0.1); brass.position.set(bx, R.ringY, bz); brass.rotation.y = ARM_A; brass.visible = R.ringLive;
      wire.position.set(bx, (4.3 + R.ringY + 0.17) / 2, bz); wire.scale.y = Math.max(0.05, 4.3 - R.ringY - 0.17); wire.visible = R.ringLive; }
    // prizes in the air
    for (const p of pool) { if (!p.live) continue; p.t += dt; const u = p.t / p.T; if (u > 1.5) { p.live = false; p.g.visible = false; continue; }
      const x = p.x0 + (p.tx - p.x0) * u, z = p.z0 + (p.tz - p.z0) * u, y = p.y0 + (p.ty - p.y0) * u + 3.2 * u * (1 - u) - (u > 1 ? (u - 1) * (u - 1) * 14 : 0); p.g.position.set(x, y, z); p.g.rotation.y += dt * 4; }
    // crowd: wave, throw
    crowd.forEach((c, i) => { const Pp = c.f.userData.P; c.t = Math.max(0, c.t - dt); if (Pp && Pp.fore) { const D = lifeD(c.t > 0 ? 'cheer' : 'warm', T, { ph: i }); if (c.t <= 0) { D.a = [[0.06, -0.5 + 0.08 * Math.sin(T * 3 + i) * (rideOn ? 2 : 0.5), 0.12], [0.06, -0.6, 0.06]]; D.g = [0.4, 0.3]; D.mood = rideOn ? 'happy' : 'calm'; D.palm = [[0, 0, 1], [-1, 0, -0.2]]; } applyD(THREE, c.f, D, T, 1); } else if (Pp && Pp.arms) Pp.arms[0].rotation.x = c.t > 0 ? -2.6 + (0.5 - c.t) * 5 : -0.4 + Math.sin(T * 3 + i) * 0.3 * (rideOn ? 2 : 0.5); });
    // rim bulbs chase at night
    const im = car.userData.rim; if (im && (Math.floor(T / 0.18) !== im.userData.k)) { im.userData.k = Math.floor(T / 0.18); const cc = new THREE.Color(); for (let i = 0; i < 40; i++) { cc.set(BULB[i % BULB.length]); if (!night) cc.multiplyScalar(0.55); else if ((i + im.userData.k) % 3) cc.multiplyScalar(0.4); im.setColorAt(i, cc); } im.instanceColor.needsUpdate = true; } }
  // the player's pose on a ride: sitting (legs forward)
  function pose(fox, P) { const Pp = fox.userData.P; if (!Pp || !Pp.legs) return; if (P.heli || P.carousel) { Pp.legs[0].rotation.x = Pp.legs[1].rotation.x = -1.45; Pp.legs[0].rotation.z = P.carousel ? 0.45 : 0.1; Pp.legs[1].rotation.z = P.carousel ? -0.45 : -0.1; } }
  // chase camera for both rides
  function cam(camera, CAM, dt, P) {
    if (P.heli) { CAM.yaw += wrap(H.yaw + Math.PI - CAM.yaw) * Math.min(1, dt * 2.2); const d = 17, pt = 0.34, c2 = Math.cos(pt); camera.position.set(H.x + Math.sin(CAM.yaw) * c2 * d, H.y + 2 + Math.sin(pt) * d, H.z + Math.cos(CAM.yaw) * c2 * d); camera.lookAt(H.x, H.y + 1.4, H.z); return; }
    if (P.carousel) { const a = R.ang + horses[mine].a + 0.62, r = 9.6; camera.position.set(RX + Math.cos(a) * r, 6.0, CZ0 + Math.sin(a) * r); camera.lookAt(P.x, P.y + 0.6, P.z); CAM.yaw = Math.atan2(camera.position.x - P.x, camera.position.z - P.z); } }
  function keeper(key, name, role, lines, opt, x, z, ry) { const f = kit.makeFox({ key, crest: '', gear: 'none', mood: 'happy', outfit: 'vest', ...opt }); const P = f.userData.P; if (P && P.sword) P.sword.visible = false; if (P && P.gun) P.gun.visible = false;
    f.position.set(x, 0, z); f.rotation.y = ry; root.add(f); ring(x, z, 0.45); TALK[key] = { name, role, lines: lines.map(text => ({ who: 'npc', text })) }; talkers.push({ key, obj: f, ry, r: 2.4 }); keepers.push(f); }
  return { prompt, talk, off, btn, heliDrive, tick, pose, cam, toast: () => (toastT > 0 ? toast : ''), heli: H, ride: R, car, pad: [RX, HZ0] };
}
