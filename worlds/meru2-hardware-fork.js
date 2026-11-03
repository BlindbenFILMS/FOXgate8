// MERU 2.0 — s165 FORKLIFT LOAD in 3D (Ben: "replace the 2D panel · rack 4, then load the truck with 2 · timer, bumps, drops and wrong height cost stars · yard only").
// Hank's job starts at his counter → the forklift in the LUMBER YARD gets a ring → TALK / E climbs in (P.veh = this controller; meru2-walk.js routes stick, buttons,
// talk, prompt + camera to it). Joystick drives. Phone: 1 LIFT DOWN (hold) · 2 PICK UP / DROP · 3 LIFT UP (hold). Desktop: WASD drive · R / F (or hold 3 / 1, Space) lift ·
// 2 / Enter / Q pallet · E get out (stops the job). PALLET RACK on the store wall (2 bays × 2 shelves); the truck's open rear takes 2 more (only while the crew is home).
// Wrong height at a beam / the truck bumper = BEAM HIT (bounce + miss); bumping fences / racks fast = miss; dropping a pallet from up high = miss. 160 s; over 110 s caps at 2 stars.
const PI = Math.PI, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), angD = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));
export function buildForklift({ THREE, G, OUT, cols, touch, isMuted = () => false, board, plane, toast, setCard, hideCard, onDone, onQuit }) {
  const INK = '#201e1d', YEL = '#ffd23a', RED = '#ec3013', OX = 254, OZ = -214;   // s167: the yard moved with the store (meru2-hardware-out.js OX / OZ)
  const FK = OUT.fork, PARK = { x: FK.g.position.x, z: FK.g.position.z, yaw: FK.g.rotation.y };
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), cc = new THREE.Color();
  const mk = () => { const pos = [], nor = [], col = [];
    const box = (w, h, d, hex, x, y, z) => { const g = new THREE.BoxGeometry(w, h, d).toNonIndexed(); g.translate(x, y, z); const p = g.attributes.position, n = g.attributes.normal; cc.set(hex);
      for (let i = 0; i < p.count; i++) { pos.push(p.getX(i), p.getY(i), p.getZ(i)); nor.push(n.getX(i), n.getY(i), n.getZ(i)); col.push(cc.r, cc.g, cc.b); } g.dispose(); };
    return { box, geo() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeBoundingSphere(); return g; } }; };
  const VC = new THREE.MeshLambertMaterial({ vertexColors: true });
  // ================= the PALLET RACK (east wall of the yard = the store's west wall) =================
  const RK = { x0: -231.5 + OX, x1: -230.35 + OX, z0: 23.5 + OZ, z1: 28.7 + OZ, bays: [24.8 + OZ, 27.4 + OZ], lv: [1.15, 2.2] }, SX = (RK.x0 + RK.x1) / 2;
  { const R = mk(); for (const z of [RK.z0, (RK.z0 + RK.z1) / 2, RK.z1]) for (const x of [RK.x0 + 0.05, RK.x1 - 0.05]) { R.box(0.1, 2.9, 0.1, '#2e4a6b', x, 1.45, z); cols.push({ f: [x - 0.08, x + 0.08, z - 0.08, z + 0.08] }); }
    for (const L of [0.2, ...RK.lv]) for (const x of [RK.x0 + 0.05, RK.x1 - 0.05]) R.box(0.1, 0.12, RK.z1 - RK.z0, '#e8742a', x, L - 0.06, (RK.z0 + RK.z1) / 2);
    for (const L of RK.lv) for (const z of RK.bays) R.box(0.06, 0.05, 0.06, YEL, RK.x0 - 0.01, L - 0.06, z);   // centre ticks on the beam fronts
    // floor paint: the staging box + the lane into the rack
    for (const [w, d, x, z] of [[1.6, 0.08, -235.4, 18.6], [1.6, 0.08, -235.4, 24.7], [0.08, 6.1, -236.2, 21.65], [0.08, 6.1, -234.6, 21.65], [0.08, 5.2, -232.4, 26.1]]) R.box(w, 0.01, d, YEL, x + OX, 0.085, z + OZ);
    const m = new THREE.Mesh(R.geo(), VC); G.add(m); }
  plane(board('PALLET RACK', 'FORKS LEVEL WITH THE BEAM \u00b7 THEN DRIVE IN', '#e8742a', '#ffffff', INK, 1024, 200), 3.0, 0.6, RK.x1 + 0.03, 3.35, (RK.z0 + RK.z1) / 2, -PI / 2);
  plane(board('PICK UP', 'PALLETS FOR THE RACK', YEL, INK, RED, 512, 200), 1.3, 0.5, -235.4 + OX, 0.09, 17.9 + OZ, 0).rotation.x = -PI / 2;
  // ================= pallets (6 · merged boards) =================
  const palGeo = (() => { const P = mk(); P.box(1.1, 0.14, 1.1, '#a07a52', 0, 0.07, 0); for (const z of [-0.42, 0, 0.42]) P.box(1.1, 0.04, 0.16, '#7a5236', 0, 0.02, z);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) P.box(0.24, 0.12, 1.05, ['#c9a27a', '#d6b48a', '#b88a5c'][(i + r) % 3], -0.39 + i * 0.26, 0.2 + r * 0.13, 0); P.box(1.12, 0.03, 0.06, RED, 0, 0.31, 0); return P.geo(); })();
  const ringG = new THREE.RingGeometry(0.78, 0.94, 28), ringM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.85, depthWrite: false });
  const STG = [[-235.4, 23.9], [-235.4, 22.4], [-235.4, 20.9], [-235.4, 19.4]].map(([x, z]) => [x + OX, z + OZ]);
  const PAL = STG.concat(STG.slice(0, 2)).map(([x, z], i) => { const m = new THREE.Mesh(palGeo, VC); G.add(m); const ring = new THREE.Mesh(ringG, ringM); ring.rotation.x = -PI / 2; ring.visible = false; G.add(ring);
    return { i, m, ring, st: i < 4 ? 'floor' : 'off', x, z, y: 0, ry: 0, vy: 0 }; });
  const putPal = p => { p.m.position.set(p.x, p.y, p.z); p.m.rotation.set(0, p.ry, 0); p.ring.position.set(p.x, 0.09, p.z); p.m.visible = p.st !== 'off'; };
  PAL.forEach(putPal);
  const SLOTS = [...RK.bays.flatMap(z => RK.lv.map((y, li) => ({ kind: 'rack', x: SX, z, y, ry: PI / 2, name: li ? 'TOP SHELF' : 'MIDDLE SHELF', full: null }))),
    { kind: 'truck', x: -234.48 + OX, z: 31.62 + OZ, y: 0.55, ry: 0, name: 'TRUCK BED', full: null }, { kind: 'truck', x: -233.32 + OX, z: 31.62 + OZ, y: 0.55, ry: 0, name: 'TRUCK BED', full: null }];
  const ghostM = new THREE.MeshBasicMaterial({ color: YEL, transparent: true, opacity: 0.3, depthWrite: false });
  for (const s of SLOTS) { s.g = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.4, 1.1), ghostM); s.g.position.set(s.x, s.y + 0.2, s.z); s.g.visible = false; G.add(s.g); }
  // fork-tip lights (white = not lined up · green = lined up)
  const tipM = new THREE.MeshBasicMaterial({ color: '#ffffff' }), tips = [-0.3, 0.3].map(x => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.08, 0.08), tipM); m.position.set(x, 0, 1.2); m.visible = false; FK.forks.add(m); return m; });
  // ================= sound =================
  let ac = null, eng = null; const A = () => { if (isMuted()) return null; try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); return ac; } catch (e) { return null; } };
  const tone = (f, k = 0.05, len = 0.3, type = 'sine') => { const a = A(); if (!a) return; const t = a.currentTime, o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f; g.gain.setValueAtTime(k, t); g.gain.exponentialRampToValueAtTime(0.0001, t + len); o.connect(g).connect(a.destination); o.start(t); o.stop(t + len); };
  const thunk = () => { tone(130, 0.09, 0.15, 'square'); tone(80, 0.07, 0.25, 'triangle'); }, ding = () => { tone(1568, 0.06, 0.7); tone(2093, 0.035, 0.7); }, nope = () => tone(180, 0.06, 0.3, 'square');
  const engine = on => { const a = A(); if (on && a && !eng) { const o = a.createOscillator(), o2 = a.createOscillator(), g = a.createGain(), g2 = a.createGain(); o.type = 'sawtooth'; o.frequency.value = 46; g.gain.value = 0.018; o2.type = 'triangle'; o2.frequency.value = 210; g2.gain.value = 0; o.connect(g).connect(a.destination); o2.connect(g2).connect(a.destination); o.start(); o2.start(); eng = { o, o2, g, g2 }; }
    if (!on && eng) { try { eng.o.stop(); eng.o2.stop(); } catch (e) {} eng = null; } };
  // ================= state =================
  const S = { armed: false, on: false, x: PARK.x, z: PARK.z, yaw: PARK.yaw, sp: 0, h: 0, carry: null, zone: null, hold: { 1: false, 3: false }, bumpCd: 0, beep: 0, t: 0, miss: 0, rack: 0, truck: 0, stage: 'rack', end: 0, kPrev: false, msg: '', msgT: 0 };
  const T_MAX = 160, T_GOOD = 110, BOT = () => 0.15 + S.h;   // pallet bottom height on the forks
  const fwd = (lz, yaw = S.yaw, x = S.x, z = S.z) => [x + Math.sin(yaw) * lz, z + Math.cos(yaw) * lz];
  const pc = () => fwd(1.72);   // where a carried pallet's centre is
  const say = (t, s = 2.2) => { S.msg = t; S.msgT = s; toast(t, s); };
  const miss = t => { S.miss++; nope(); say(t + ' \u00b7 MISS ' + S.miss, 2.6); };
  const place = () => { FK.g.position.set(S.x, 0, S.z); FK.g.rotation.y = S.yaw; FK.forks.position.y = 0.12 + S.h; };
  function reset() { S.x = PARK.x; S.z = PARK.z; S.yaw = PARK.yaw; S.h = 0; S.sp = 0; S.carry = null; S.zone = null; S.t = 0; S.miss = 0; S.rack = 0; S.truck = 0; S.stage = 'rack'; S.end = 0;
    for (const s of SLOTS) s.full = null; PAL.forEach((p, i) => { if (p.m.parent !== G) G.add(p.m); Object.assign(p, { st: i < 4 ? 'floor' : 'off', x: STG[i % 4][0], z: STG[i % 4][1], y: 0, ry: 0, vy: 0 }); putPal(p); }); place(); }
  // ================= zones: the rack front + the truck's rear opening =================
  function zoneAt(x, z) { const b = BOT();
    if (x + 0.55 > RK.x0 && x < RK.x1 + 0.4 && z > RK.z0 && z < RK.z1) { const L = RK.lv.find(L => b >= L - 0.03 && b <= L + 0.43); return L == null ? { hit: 'PALLET HIT THE BEAM \u00b7 LEVEL THE FORKS FIRST' } : { lo: L - 0.03, hi: Math.min(L + 0.43, 2.6) }; }
    if (FK.truckOn() && z + 0.55 > 33.05 && z < 38 && Math.abs(x + 235.3) < 1.2) return b < 0.52 ? { hit: 'PALLET HIT THE TRUCK BUMPER \u00b7 RAISE IT A LITTLE' } : { lo: 0.52, hi: 2.6 };
    return null; }
  function blocked(x, z, yaw, vBlock) { for (const [lz, r] of [[-0.95, 0.55], [0.15, 0.62], [0.95, 0.38]]) { const [cx, cz] = fwd(lz, yaw, x, z);
      if (cx < -239.85 + OX + r || cx > -230.35 + OX - r || cz < 13.3 + OZ + r || cz > 37.8 + OZ - r) return true; if (vBlock(cx, cz, r)) return true;
      if (lz < 0.5) for (const p of PAL) if (p.st === 'floor' && Math.hypot(cx - p.x, cz - p.z) < r + 0.6) return true; } return false; }
  const pickable = () => { if (S.carry || BOT() > 0.33) return null; const [px, pz] = pc(); let best = null, bd = 0.5;
    for (const p of PAL) { if (p.st !== 'floor') continue; const d = Math.hypot(px - p.x, pz - p.z), a = Math.abs(angD(S.yaw * 4, p.ry * 4)) / 4; if (d < bd && a < 0.36) { bd = d; best = p; } } return best; };
  const targets = () => SLOTS.filter(s => !s.full && s.kind === S.stage);
  const nearT = () => { const [px, pz] = pc(); let b = null, bd = 1e9; for (const s of targets()) { const d = Math.hypot(px - s.x, pz - s.z); if (d < bd) { bd = d; b = s; } } return b; };
  const lined = s => { const b = BOT(); return !!s && b >= s.y - 0.03 && b <= s.y + (s.kind === 'truck' ? 0.4 : 0.43); };
  // ================= pallet button =================
  function pallet() { if (!S.on || S.end) return;
    if (!S.carry) { const p = pickable(); if (!p) { say(BOT() > 0.33 ? 'LOWER THE FORKS TO PICK UP' : 'LINE THE FORKS UP WITH A PALLET'); return; }
      p.st = 'carry'; S.carry = p; p.ring.visible = false; FK.forks.add(p.m); p.m.position.set(0, 0.03, 0.62); p.m.rotation.set(0, Math.round(angD(p.ry, S.yaw) / (PI / 2)) * (PI / 2), 0); thunk(); say('PALLET UP \u00b7 TAKE IT TO A YELLOW SLOT'); return; }
    const p = S.carry, [px, pz] = pc(), b = BOT();
    const s = targets().find(s => Math.abs(px - s.x) < 0.38 && Math.abs(pz - s.z) < 0.42 && Math.abs(angD(S.yaw, s.ry)) < 0.36);
    if (s) { if (b < s.y - 0.03) { say('TOO LOW FOR THAT SLOT'); return; } const high = b > s.y + 0.45;
      G.add(p.m); Object.assign(p, { st: 'slot', x: s.x, z: s.z, y: s.y, ry: s.ry }); putPal(p); s.full = p; S.carry = null; S.zone = null; thunk(); if (high) miss('DROPPED IT IN FROM TOO HIGH'); else ding();
      if (s.kind === 'rack') S.rack++; else S.truck++; nextStage(); return; }
    if (zoneAt(px, pz)) { say('LINE UP WITH A SLOT \u00b7 THE YELLOW BOX'); return; }
    G.add(p.m); Object.assign(p, { st: b > 0.4 ? 'fall' : 'floor', x: px, z: pz, y: b - 0.03, ry: S.yaw, vy: 0 }); putPal(p); S.carry = null; S.zone = null;
    if (p.st === 'fall') miss('YOU DROPPED A PALLET \u00b7 HANK WINCED'); else { p.y = 0; putPal(p); thunk(); say('SET DOWN \u00b7 PICK IT UP AGAIN'); } }
  function nextStage() { if (S.stage === 'rack' && S.rack >= 4) { if (FK.truckOn()) { S.stage = 'truck'; PAL.slice(4).forEach((p, j) => { Object.assign(p, { st: 'floor', x: STG[j][0], z: STG[j][1], y: 0, ry: 0 }); putPal(p); }); say('RACK FULL! TWO MORE \u00b7 LOAD THE TRUCK', 3.2); }
      else finish(); return; }
    if (S.stage === 'truck' && S.truck >= 2) finish(); else say(S.stage === 'rack' ? 'ON THE RACK! ' + S.rack + ' / 4' : 'IN THE TRUCK! ' + S.truck + ' / 2'); }
  function finish() { S.end = 1.2; S.sp = 0; ding(); say('ALL LOADED! \u00b7 ' + Math.floor(S.t) + ' S', 3); }
  const stars = () => { let st = S.miss === 0 ? 3 : S.miss <= 2 ? 2 : 1; if (S.t > T_GOOD) st = Math.min(st, 2); return st; };
  // ================= the P.veh controller (meru2-walk.js) =================
  const ctl = { kind: 'forklift',
    drive(dt, ix, iy, P, vBlock, keys) { const k = keys || new Set();
      if (S.end > 0) { S.end -= dt; if (S.end <= 0) { const st = stars(); off(P); onDone && onDone(st); } seat(P); return; }
      S.t += dt; if (S.t >= T_MAX) { S.t = T_MAX; const any = S.rack + S.truck; say('OUT OF TIME \u00b7 ' + any + ' PALLET' + (any === 1 ? '' : 'S'), 3); const done = any > 0; off(P); if (done) onDone && onDone(1); else onQuit && onQuit(); return; }
      S.bumpCd = Math.max(0, S.bumpCd - dt); if (S.msgT > 0) S.msgT -= dt;
      const kp = k.has('Enter') || k.has('KeyQ'); if (kp && !S.kPrev) pallet(); S.kPrev = kp;
      // lift (clamped inside a beam / truck window so it can't rise into the shelf above)
      const up = S.hold[3] || k.has('KeyR') || k.has('Space') || k.has('Digit3'), dn = S.hold[1] || k.has('KeyF') || k.has('Digit1'), dir = (up ? 1 : 0) - (dn ? 1 : 0);
      let nh = clamp(S.h + dir * 0.8 * dt, 0, 2.45); if (S.carry && S.zone && !S.zone.hit) nh = clamp(nh + 0.15, S.zone.lo, S.zone.hi) - 0.15; S.h = Math.max(0, nh);
      if (eng) { eng.o2.frequency.value = 200 + S.h * 40; eng.g2.gain.value = dir ? 0.012 : 0; }
      // drive
      const top = S.carry ? 2.6 : 3.3, want = iy > 0.12 ? iy * top : iy < -0.12 ? iy * 2.0 : 0;
      S.sp += clamp(want - S.sp, -dt * 4.5, dt * 3.2); if (!want) S.sp *= Math.pow(0.02, dt);
      const turn = ix * 1.55 * dt * clamp(0.45 + Math.abs(S.sp) / 2, 0.45, 1) * (iy < -0.12 && S.sp < 0 ? -1 : 1);
      let ny = S.yaw - turn; if (blocked(S.x, S.z, ny, vBlock)) ny = S.yaw;
      const nx = S.x + Math.sin(ny) * S.sp * dt, nz = S.z + Math.cos(ny) * S.sp * dt;
      if (blocked(nx, nz, ny, vBlock)) { if (Math.abs(S.sp) > 1.15 && S.bumpCd <= 0) { S.bumpCd = 1.4; thunk(); miss('BUMP! MIND THE FENCES AND RACKS'); } S.sp = -S.sp * 0.2; S.yaw = ny; }
      else { let ok = true; if (S.carry) { const [ox, oz] = pc(), [px, pz] = fwd(1.72, ny, nx, nz), z0 = zoneAt(ox, oz), z1 = zoneAt(px, pz);
          if (z1 && z1.hit && !(z0 && !z0.hit)) { ok = false; if (S.bumpCd <= 0) { S.bumpCd = 1.0; thunk(); miss(z1.hit); } S.sp = -0.9; const [bx, bz] = fwd(-0.25, ny); S.x = bx; S.z = bz; }
          else S.zone = z1 && !z1.hit ? (S.zone && z0 && !z0.hit ? S.zone : z1) : null; }
        if (ok) { S.x = nx; S.z = nz; S.yaw = ny; } }
      if (S.sp < -0.2) { S.beep -= dt; if (S.beep <= 0) { S.beep = 0.55; tone(1050, 0.03, 0.25, 'square'); } } else S.beep = 0;
      if (eng) eng.o.frequency.value = 46 + Math.abs(S.sp) * 16;
      place(); seat(P); },
    cam(camera, CAM, dt) { const port = camera.aspect < 1, d = port ? 8.4 : 6.6, hg = port ? 4.6 : 3.6;
      if (!(CAM.drag > 0)) CAM.yaw += angD(S.yaw + PI, CAM.yaw) * Math.min(1, dt * 2.4);
      let cx = S.x + Math.sin(CAM.yaw) * d, cz = S.z + Math.cos(CAM.yaw) * d, t = 1;
      if (cx > -230.7 + OX) t = Math.min(t, (-230.7 + OX - S.x) / (cx - S.x)); if (cz < 13.6 + OZ) t = Math.min(t, (13.6 + OZ - S.z) / (cz - S.z));
      t = clamp(t, 0.25, 1); cx = S.x + (cx - S.x) * t; cz = S.z + (cz - S.z) * t;
      camera.position.set(cx, hg + (1 - t) * 3 + S.h * 0.35, cz); const [lx, lz] = fwd(1.3); camera.lookAt(lx, 0.9 + S.h * 0.55, lz); },
    btn(n) { if (n === 2) { pallet(); return; } const ev = window.event; if (ev && /^key/.test(ev.type)) return; S.hold[n] = true; },
    btnUp(n) { if (n !== 2) S.hold[n] = false; },
    off(P) { off(P, true); onQuit && onQuit(); },
    prompt: () => (S.end > 0 ? null : Math.abs(S.sp) < 1 ? 'GET OUT \u00b7 STOPS THE JOB' : null),
    talk(P) { if (S.end > 0) return; if (Math.abs(S.sp) > 1) { say('SLOW DOWN FIRST'); return; } off(P); onQuit && onQuit(); } };
  function seat(P) { const [x, z] = fwd(-0.32); P.x = x; P.z = z; P.y = 0.42; P.yaw = S.yaw; P.sp = 0; P.vy = 0; P.ground = true; P.swim = false; }
  function on(P) { reset(); S.on = true; FK.col.on = false; FK.load.visible = false; tips.forEach(m => { m.visible = true; }); P.veh = ctl; P.car = false; P.boat = false; P.ab = null; S.hold[1] = S.hold[3] = false; engine(true); seat(P);
    say(touch ? 'DRIVE \u00b7 HOLD 3 UP \u00b7 HOLD 1 DOWN \u00b7 2 PICK UP' : 'WASD DRIVE \u00b7 R / F LIFT \u00b7 2 PICK UP', 3.4); }
  function off(P, quiet) { if (!S.on) return; S.on = false; engine(false); tips.forEach(m => { m.visible = false; });
    if (S.carry) { const p = S.carry, [px, pz] = pc(); G.add(p.m); Object.assign(p, { st: 'floor', x: px, z: pz, y: 0, ry: S.yaw }); putPal(p); S.carry = null; }
    S.sp = 0; S.h = 0; place(); for (const s of SLOTS) s.g.visible = false; PAL.forEach(p => { p.ring.visible = false; });
    // the collider follows where you left it
    { const c = Math.abs(Math.cos(S.yaw)), s = Math.abs(Math.sin(S.yaw)), hw = 0.68, hl = 1.4, [cx, cz] = fwd(0.1), ex = c * hw + s * hl, ez = s * hw + c * hl; FK.col.f = [cx - ex, cx + ex, cz - ez, cz + ez]; FK.col.on = true; }
    if (P) { P.veh = null; const side = [PI / 2, -PI / 2, PI]; for (const a of side) { const [x, z] = fwd(0, S.yaw + a, S.x, S.z), ex = x + Math.sin(S.yaw + a) * 1.5, ez = z + Math.cos(S.yaw + a) * 1.5;
        if (ex > -239.6 + OX && ex < -230.6 + OX && ez > 13.6 + OZ && ez < 37.6 + OZ) { P.x = ex; P.z = ez; break; } } P.y = 0; P.vy = 0; P.ground = true; P.yaw = S.yaw; }
    S.armed = false; if (!quiet) hideCard(); }
  // ================= per frame (visuals + the card) =================
  const seatPos = () => fwd(-0.32, FK.g.rotation.y, FK.g.position.x, FK.g.position.z);
  const nearSeat = P => { const [sx, sz] = seatPos(); return Math.hypot(P.x - sx, P.z - sz) < 2.4; };
  const armRing = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.75, 32), ringM); armRing.rotation.x = -PI / 2; armRing.visible = false; G.add(armRing);
  let cardT = 0;
  function tick(dt) { const t = performance.now() / 1000;
    armRing.visible = S.armed && !S.on; if (armRing.visible) { armRing.position.set(FK.g.position.x, 0.09, FK.g.position.z); armRing.scale.setScalar(1 + 0.06 * Math.sin(t * 3)); }
    for (const p of PAL) { if (p.st === 'fall') { p.vy -= 14 * dt; p.y += p.vy * dt; if (p.y <= 0) { p.y = 0; p.st = 'floor'; thunk(); } putPal(p); } p.ring.visible = S.on && !S.carry && p.st === 'floor'; if (p.ring.visible) p.ring.scale.setScalar(1 + 0.06 * Math.sin(t * 4 + p.i)); }
    const tg = S.on && S.carry ? targets() : []; for (const s of SLOTS) { s.g.visible = tg.includes(s); }
    ghostM.opacity = 0.22 + 0.12 * Math.sin(t * 4);
    if (S.on) { const s = S.carry ? nearT() : null, ok = S.carry ? lined(s) : !!pickable(); tipM.color.set(ok ? '#4cff7a' : '#ffffff'); } }
  function card() { cardT -= 1 / 60; if (!S.armed && !S.on) return false;
    if (!S.on) { setCard('fkArm', '<div style="background:#8b6a48;color:#fff;padding:6px 10px;font-weight:900;font-size:13px">FORKLIFT LOAD \u00b7 HANK</div><div style="padding:8px 10px 10px;font-size:12px;font-weight:800">Go out to the LUMBER YARD (side gate by Electrical). Climb into Hank\u2019s forklift: walk up + ' + (touch ? 'TALK' : 'E') + '.</div>'); return true; }
    const s = S.carry ? nearT() : null, b = BOT(); let step;
    if (!S.carry) step = pickable() ? '\u2713 FORKS UNDER IT \u00b7 PRESS 2 = PICK UP' : b > 0.33 ? '\u25bc LOWER THE FORKS' : 'DRIVE THE FORKS INTO A PALLET (YELLOW RING)';
    else if (!s) step = 'NO FREE SLOT';
    else { const need = s.y + 0.15, d = need - b; step = lined(s) ? '\u2713 LINED UP \u00b7 ' + s.name + ' \u00b7 DRIVE IN \u00b7 2 = DROP' : (d > 0 ? '\u25b2 RAISE TO THE ' : '\u25bc LOWER TO THE ') + s.name; }
    const left = Math.max(0, Math.ceil(T_MAX - S.t)), mm = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0'), tr = FK.truckOn();
    const key = 'fk' + mm + step + S.rack + S.truck + S.miss + S.stage; if (key === card.k) return true; card.k = key;
    const chip = (t, on) => '<span style="padding:2px 6px;border:2px solid #201e1d;font-size:11px;font-weight:900;background:' + (on ? '#201e1d' : '#f3f2f2') + ';color:' + (on ? '#ffd23a' : '#201e1d') + '">' + t + '</span>';
    setCard(key, '<div style="background:#8b6a48;color:#fff;padding:6px 10px;font-weight:900;font-size:13px;display:flex;justify-content:space-between;gap:8px;white-space:nowrap"><span>FORKLIFT LOAD</span><span style="color:' + (S.t > T_GOOD ? '#ffd23a' : '#fff') + '">' + mm + '</span></div>'
      + '<div style="padding:8px 10px 10px"><div style="display:flex;flex-wrap:wrap;gap:4px">' + chip('RACK ' + S.rack + ' / 4', S.rack >= 4) + (tr ? chip('TRUCK ' + S.truck + ' / 2', S.truck >= 2) : '') + chip('MISSES ' + S.miss, false) + '</div>'
      + '<div style="margin-top:6px;font-size:13px;font-weight:900;color:' + (step[0] === '\u2713' ? '#2e7a46' : '#201e1d') + '">' + step + '</div>'
      + '<div style="margin-top:4px;font-size:11px;font-weight:800;color:#5b5753">FORKS ' + b.toFixed(2) + ' M' + (s ? ' \u00b7 SLOT ' + s.y.toFixed(2) + ' M' : '') + '</div>'
      + '<div style="margin-top:4px;font-size:11px;font-weight:800">' + (touch ? 'HOLD 3 UP \u00b7 HOLD 1 DOWN \u00b7 2 PALLET' : 'R / F LIFT \u00b7 2 PALLET \u00b7 E GET OUT') + '</div></div>'); return true; }
  return { arm() { reset(); S.armed = true; toast('FORKLIFT LOAD \u00b7 GO TO THE LUMBER YARD \u00b7 CLIMB INTO THE FORKLIFT', 4); }, disarm() { S.armed = false; },
    prompt: P => (!S.on && OUT.inYard(P) && nearSeat(P) ? (S.armed ? 'CLIMB IN \u00b7 FORKLIFT LOAD' : 'HANK\u2019S FORKLIFT \u00b7 ASK HANK FOR THE JOB') : null),
    talk(P) { if (S.on || !OUT.inYard(P) || !nearSeat(P)) return false; tone(1320, 0.05, 0.4); if (!S.armed) { toast('HANK\u2019S FORKLIFT \u00b7 ASK HANK AT LUMBER FOR FORKLIFT LOAD', 3.4); return true; } on(P); return true; },
    tick, card, on: () => S.on, armed: () => S.armed, ctl, S, SLOTS, PAL, off, dispose() { engine(false); } };
}
