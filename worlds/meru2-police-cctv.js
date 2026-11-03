// MERU 2.0 — s81 POLICE CCTV ROOM (Ben: "the cctv job is going to be sooo fun, really put some focus on that").
// Four little CCTV SETS (market stall, bank queue, fountain bench, minimart) live in their own THREE.Scene, each watched by a
// security camera that slowly pans. They render into 4 render targets shown on the CCTV wall under the police station
// (worlds/meru2-police-jobs.js mounts the screens). Townsfolk wander each set; some pick an item up and PUT IT BACK (decoys),
// one per round POCKETS it (the thief) and heads for the edge. Tap him on his screen. Missed him? REWIND replays the tape.
// Caught = his ring turns red, an officer walks in and leads him away.
// API: makeCCTV({ THREE, kit, renderer, touch, roster }) → { tex[4], names[4], start(), stop(), tick(dt), round(onEvent), pick(i, u, v),
//   zoom(i|-1), rewind(), state(), thiefUV() }.
export function makeCCTV({ THREE, kit, renderer, touch, roster }) {
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z), rnd = (a, b) => a + Math.random() * (b - a), pickR = a => a[Math.random() * a.length | 0];
  const S = new THREE.Scene(); S.background = new THREE.Color('#9aa4ad');
  S.add(new THREE.HemisphereLight(0xffffff, 0x6b737b, 1.35)); { const d = new THREE.DirectionalLight(0xffffff, 1.1); d.position.set(30, 40, 20); S.add(d); }
  const LMc = {}, LM = c => LMc[c] || (LMc[c] = new THREE.MeshLambertMaterial({ color: c }));
  const box = (p, w, h, d, c, x, y, z, ry = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), LM(c)); m.position.set(x, y, z); m.rotation.y = ry; p.add(m); return m; };
  const cyl = (p, r0, r1, h, c, x, y, z, seg = 12) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, seg), LM(c)); m.position.set(x, y, z); p.add(m); return m; };
  const sph = (p, r, c, x, y, z) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 10, 8), LM(c)); m.position.set(x, y, z); p.add(m); return m; };
  const W = touch ? 288 : 384, H = Math.round(W * 0.625);
  const RT = [0, 1, 2, 3].map(() => { const t = new THREE.WebGLRenderTarget(W, H, { depthBuffer: true }); t.texture.colorSpace = THREE.SRGBColorSpace; return t; });
  const BIG = new THREE.WebGLRenderTarget(W * 2, H * 2, { depthBuffer: true }); BIG.texture.colorSpace = THREE.SRGBColorSpace;
  const names = ['MARKET', 'BANK QUEUE', 'FOUNTAIN', 'MINIMART'];
  // ---------- the 4 sets (each 12 × 9 m, 60 m apart) ----------
  const SETS = names.map((n, i) => { const g = new THREE.Group(); g.position.x = i * 60; S.add(g); return { i, name: n, g, foxes: [], goods: [], exits: [], walk: [] }; });
  const ground = (s, c1, c2) => { const t = document.createElement('canvas'); t.width = t.height = 128; const x = t.getContext('2d'); for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) { x.fillStyle = (a + b) % 2 ? c1 : c2; x.fillRect(a * 16, b * 16, 16, 16); }
    const tx = new THREE.CanvasTexture(t); tx.colorSpace = THREE.SRGBColorSpace; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(4, 3); const m = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), new THREE.MeshLambertMaterial({ map: tx })); m.rotation.x = -Math.PI / 2; s.g.add(m); };
  // 0 MARKET STALL: striped awning, crates of apples, pears, a till
  { const s = SETS[0]; ground(s, '#c9b79a', '#bba98c'); box(s.g, 16, 3, 0.3, '#d8d2c8', 0, 1.5, -5);
    box(s.g, 4.6, 0.9, 1.2, '#7a5a3a', 0, 0.45, -3.6); for (let k = 0; k < 6; k++) box(s.g, 0.78, 0.12, 1.4, k % 2 ? '#ec3013' : '#f3f2f2', -1.95 + k * 0.78, 2.6, -3.5, 0); for (const x of [-2.2, 2.2]) box(s.g, 0.08, 2.6, 0.08, '#5a3d26', x, 1.3, -3.0);
    for (let k = 0; k < 3; k++) { box(s.g, 1.2, 0.3, 0.9, '#9a7550', -1.5 + k * 1.5, 1.05, -3.6); for (let a = 0; a < 6; a++) sph(s.g, 0.09, k === 1 ? '#c9d65a' : '#d23a2a', -1.8 + k * 1.5 + (a % 3) * 0.28, 1.25, -3.8 + (a / 3 | 0) * 0.3); }
    box(s.g, 1.4, 0.8, 0.8, '#9a7550', 4.4, 0.4, -3.4); for (let a = 0; a < 4; a++) sph(s.g, 0.12, '#f0a030', 4.1 + a * 0.2, 0.9, -3.4);
    s.goods = [{ p: V(-1.5, 0, -2.7), it: sph(s.g, 0.11, '#d23a2a', -1.5, 1.32, -3.25), n: 'AN APPLE' }, { p: V(4.4, 0, -2.6), it: sph(s.g, 0.14, '#f0a030', 4.4, 0.98, -3.2), n: 'AN ORANGE' }, { p: V(0, 0, -2.7), it: sph(s.g, 0.11, '#c9d65a', 0, 1.32, -3.25), n: 'A PEAR' }];
    s.walk = [[-4.5, 1.5], [-1.5, -1.6], [2.5, -1.4], [4.6, 1.8], [0, 2.4], [-3.4, -0.6]]; s.exits = [[-8, 1], [8, 0.5]];
    s.cam = { p: V(-5.2, 4.6, 5.4), look: V(0.4, 0.6, -1.6) }; }
  // 1 BANK QUEUE: marble floor, rope posts, a counter with a coin bag
  { const s = SETS[1]; ground(s, '#ece6d8', '#ddd5c4'); box(s.g, 16, 3.4, 0.3, '#1f5a3e', 0, 1.7, -5); box(s.g, 6, 1.1, 0.9, '#5a3d26', 1.5, 0.55, -3.8); box(s.g, 6.1, 0.06, 1, '#c9a227', 1.5, 1.13, -3.8);
    for (let k = 0; k < 5; k++) { cyl(s.g, 0.05, 0.05, 0.9, '#c9a227', -4 + k * 1.4, 0.45, -0.6); cyl(s.g, 0.14, 0.14, 0.04, '#c9a227', -4 + k * 1.4, 0.02, -0.6); } box(s.g, 5.6, 0.05, 0.05, '#7a2a3a', -1.2, 0.8, -0.6);
    box(s.g, 0.9, 1.4, 0.5, '#3f4854', -5.2, 0.7, -4.4);
    s.goods = [{ p: V(0.4, 0, -2.9), it: sph(s.g, 0.16, '#b08d3c', 0.4, 1.28, -3.6), n: 'A COIN BAG' }, { p: V(3.0, 0, -2.9), it: box(s.g, 0.3, 0.06, 0.2, '#2f6fd6', 3.0, 1.19, -3.6), n: 'A STACK OF NOTES' }, { p: V(-5.2, 0, -3.6), it: box(s.g, 0.25, 0.3, 0.2, '#ec3013', -5.2, 1.55, -4.4), n: 'A PEN STAND' }];
    s.walk = [[-4.4, 0.4], [-1.6, 0.5], [1.2, 0.4], [3.8, -1.8], [4.8, 2.2], [-3, 2.6]]; s.exits = [[8, 2], [-8, 2.5]];
    s.cam = { p: V(5.6, 4.8, 5.0), look: V(-0.6, 0.6, -1.6) }; }
  // 2 FOUNTAIN: round basin + jet, two benches, a handbag + a sun hat on the benches
  { const s = SETS[2]; ground(s, '#c9ccd1', '#b6bac1'); cyl(s.g, 2.0, 2.1, 0.6, '#ece6d8', 0, 0.3, -1); const w = cyl(s.g, 1.8, 1.8, 0.05, '#7fb6e0', 0, 0.56, -1, 24); w.material = new THREE.MeshLambertMaterial({ color: '#7fb6e0' }); cyl(s.g, 0.2, 0.3, 1.3, '#ece6d8', 0, 0.9, -1);
    for (const [x, z, ry] of [[-4.2, -3.6, 0], [4.2, -3.6, 0]]) { box(s.g, 2.2, 0.08, 0.6, '#5a3d26', x, 0.48, z, ry); box(s.g, 2.2, 0.5, 0.06, '#5a3d26', x, 0.78, z - 0.28, ry); for (const e of [-0.9, 0.9]) box(s.g, 0.08, 0.46, 0.5, '#201e1d', x + e, 0.23, z, ry); }
    for (const [x, z] of [[-6.5, -4], [6.5, -4], [-6.5, 3.5]]) { cyl(s.g, 0.3, 0.4, 0.5, '#3d3b3a', x, 0.25, z); sph(s.g, 0.55, '#4f8a5c', x, 0.85, z); }
    s.goods = [{ p: V(-4.6, 0, -2.6), it: box(s.g, 0.34, 0.26, 0.14, '#c2456a', -4.6, 0.65, -3.6), n: 'A HANDBAG' }, { p: V(4.0, 0, -2.6), it: cyl(s.g, 0.24, 0.24, 0.05, '#ffd23a', 4.0, 0.54, -3.6, 14), n: 'A SUN HAT' }, { p: V(1.7, 0, 0.9), it: sph(s.g, 0.07, '#e0b23a', 1.4, 0.62, 0.0), n: 'A WISH COIN' }];
    s.walk = [[-3.6, 1.8], [3.6, 2.0], [-2.6, -2.2], [2.8, -2.2], [0, 2.8], [-5.4, 0.2]]; s.exits = [[-8, 3], [8, 3]];
    s.cam = { p: V(0.2, 5.2, 6.4), look: V(0, 0.4, -1.2) }; }
  // 3 MINIMART: shelves of boxes, a fridge, the till
  { const s = SETS[3]; ground(s, '#e6e1d3', '#d6d0c0'); box(s.g, 16, 3, 0.3, '#ec3013', 0, 1.5, -5);
    for (const x of [-3.5, 0.5]) { box(s.g, 2.8, 1.8, 0.6, '#c0c4cc', x, 0.9, -3.9); for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) box(s.g, 0.34, 0.36, 0.3, ['#2f6fd6', '#ffd23a', '#2f7a4a', '#c2456a'][(k + r) % 4], x - 1.1 + k * 0.44, 0.3 + r * 0.6, -3.75); }
    box(s.g, 1.4, 2.2, 0.8, '#d9dde2', 4.4, 1.1, -4.0); box(s.g, 1.2, 1.9, 0.02, '#9fd6ff', 4.4, 1.15, -3.59); box(s.g, 2.2, 1.0, 0.8, '#5c6670', 5.4, 0.5, 1.6); box(s.g, 0.4, 0.3, 0.3, '#201e1d', 5.2, 1.15, 1.6);
    s.goods = [{ p: V(-3.5, 0, -3.0), it: box(s.g, 0.34, 0.36, 0.3, '#ffd23a', -3.5, 1.5, -3.7), n: 'A BOX OF CEREAL' }, { p: V(0.5, 0, -3.0), it: box(s.g, 0.34, 0.36, 0.3, '#2f7a4a', 0.5, 1.5, -3.7), n: 'A TIN OF TEA' }, { p: V(4.4, 0, -3.0), it: cyl(s.g, 0.08, 0.08, 0.26, '#c2456a', 4.4, 1.3, -3.62, 10), n: 'A FIZZY DRINK' }];
    s.walk = [[-5, 0.4], [-1.6, -1.8], [2.4, -1.8], [3.8, 0.6], [0, 2.6], [-3.4, 2.2]]; s.exits = [[-8, 2.5], [8, -1]];
    s.cam = { p: V(-5.6, 4.6, 4.6), look: V(0.4, 0.6, -1.4) }; }
  for (const s of SETS) { s.camO = new THREE.PerspectiveCamera(52, W / H, 0.1, 60); s.yaw0 = 0; s.pan = Math.random() * 6; }
  // ---------- the people (roster looks; 3 per set + an officer) ----------
  const LOOKS = roster.filter(r => r.look && r.work !== 'Police').slice(0, 24); let made = false;
  const mkFox = (look, key) => { const f = kit.makeFox({ key, torso: look.torso, outfit: look.outfit, mood: 'happy', look: look.look }); f.scale.setScalar(1); return f; };
  function build() { if (made) return; made = true; let k = 0;
    for (const s of SETS) { for (let j = 0; j < 3; j++) { const r = LOOKS[(k++ * 5 + 3) % LOOKS.length], f = mkFox(r.look, 'cc' + s.i + '_' + j); s.g.add(f); s.foxes.push({ f, r, x: 0, z: 0, yaw: 0, sp: 0, to: null, wait: rnd(0.5, 3), role: 'walk', bag: null }); }
      const cop = mkFox({ torso: ['#24344d', '#1a2a3e', '#0f1a28'], outfit: 'suit' }, 'ccCop' + s.i); cop.visible = false; s.g.add(cop); s.cop = { f: cop, x: 0, z: 0, yaw: 0, sp: 0, on: false };
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.42, 0.6, 24), new THREE.MeshBasicMaterial({ color: '#ec3013', depthTest: false, transparent: true })); ring.rotation.x = -Math.PI / 2; ring.renderOrder = 5; ring.visible = false; s.g.add(ring); s.ring = ring;
      const bag = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.14), LM('#5a3d26')); bag.visible = false; s.g.add(bag); s.bag = bag; } }
  function place() { for (const s of SETS) { s.foxes.forEach((F, j) => { const w = s.walk[(j * 2 + (Math.random() * 2 | 0)) % s.walk.length]; F.x = w[0] + rnd(-0.4, 0.4); F.z = w[1] + rnd(-0.4, 0.4); F.yaw = rnd(-3, 3); F.to = null; F.wait = rnd(0.3, 2.5); F.role = 'walk'; F.f.visible = true; });
      s.goods.forEach(g => { g.it.visible = true; }); s.cop.on = false; s.cop.f.visible = false; s.ring.visible = false; s.bag.visible = false; } }
  // ---------- per-frame life ----------
  const step = (F, dt, sp = 1.1) => { if (!F.to) return true; const dx = F.to[0] - F.x, dz = F.to[1] - F.z, d = Math.hypot(dx, dz); if (d < 0.08) { F.sp = 0; return true; }
    const v = Math.min(d, sp * dt); F.x += dx / d * v; F.z += dz / d * v; const ty = Math.atan2(dx, dz); F.yaw += Math.atan2(Math.sin(ty - F.yaw), Math.cos(ty - F.yaw)) * Math.min(1, dt * 7); F.sp = sp; return false; };
  let R = null;   // the round: { s, thief, good, phase, t, decoy, ... }
  let on = false, zoomI = -1, frameI = 0, evt = null, tape = null, play = null;
  const emit = (k, x) => { if (evt) evt(k, x); };
  function lifeTick(s, dt) {
    for (const F of s.foxes) { if (F.role === 'gone' || F.role === 'held') continue;
      if (F.role === 'thief' || F.role === 'decoy') { roleTick(s, F, dt); continue; }
      if (F.wait > 0) { F.wait -= dt; F.sp = 0; if (F.wait <= 0) { const w = pickR(s.walk); F.to = [w[0] + rnd(-0.5, 0.5), w[1] + rnd(-0.5, 0.5)]; } continue; }
      if (step(F, dt, 1.0)) { F.to = null; F.wait = rnd(1.2, 4); } }
    if (s.cop.on) copTick(s, dt); }
  // decoy: walk to a good, lift it up, look at it, PUT IT BACK · thief: walk to a good, lift it, POCKET it (item hides, bag shows), walk out fast
  function roleTick(s, F, dt) { const g = F.good; F.rt = (F.rt || 0) + dt;
    if (F.ph === 'go') { F.to = [g.p.x, g.p.z]; if (step(F, dt, 1.05)) { F.ph = 'lift'; F.rt = 0; const ty = Math.atan2(g.it.position.x - F.x, g.it.position.z - F.z); F.yaw = ty; } return; }
    if (F.ph === 'lift') { F.sp = 0; const k = Math.min(1, F.rt / 0.6); g.it.position.y = g.y0 + k * 0.25; if (F.rt > 1.4) { F.ph = F.role === 'thief' ? 'pocket' : 'back'; F.rt = 0; if (F.role === 'thief') emit('took', s.i); } return; }
    if (F.ph === 'back') { const k = Math.min(1, F.rt / 0.5); g.it.position.y = g.y0 + (1 - k) * 0.25; if (F.rt > 0.8) { F.role = 'walk'; F.ph = null; F.to = null; F.wait = rnd(1, 3); } return; }
    if (F.ph === 'pocket') { if (F.rt > 0.35) { g.it.visible = false; g.it.position.y = g.y0; F.ph = 'run'; F.rt = 0; const e = pickR(s.exits); F.to = [e[0], e[1]]; } return; }
    if (F.ph === 'run') { if (step(F, dt, 1.45)) { F.role = 'gone'; F.f.visible = false; emit('away', s.i); } return; } }
  function copTick(s, dt) { const C = s.cop, F = R && R.thief; if (!F) return; C.rt = (C.rt || 0) + dt;
    if (C.ph === 'in') { C.to = [F.x + 0.7, F.z + 0.3]; if (step(C, dt, 2.2)) { C.ph = 'cuff'; C.rt = 0; C.yaw = Math.atan2(F.x - C.x, F.z - C.z); F.yaw = C.yaw; } }
    else if (C.ph === 'cuff') { if (C.rt > 0.9) { C.ph = 'out'; const e = s.exits[0]; C.to = [e[0], e[1]]; F.to = [e[0], e[1] + 0.6]; } }
    else if (C.ph === 'out') { step(F, dt, 1.0); if (step(C, dt, 1.0)) { C.on = false; C.f.visible = false; F.role = 'gone'; F.f.visible = false; emit('led', s.i); } } }
  const pose = s => { for (const F of s.foxes) { F.f.position.set(F.x, 0, F.z); F.f.rotation.y = F.yaw; } const C = s.cop; if (C.on) { C.f.position.set(C.x, 0, C.z); C.f.rotation.y = C.yaw; }
    const T = R && R.s === s && R.thief; if (T && s.ring.visible) { s.ring.position.set(T.x, 0.04, T.z); } if (T && T.good && (T.ph === 'pocket' || T.ph === 'run' || T.role === 'held') && T.role !== 'gone') { s.bag.visible = !T.good.it.visible; s.bag.position.set(T.x + Math.cos(T.yaw) * 0.32, 0.72, T.z - Math.sin(T.yaw) * 0.32); } else if (!T || T.role === 'gone') s.bag.visible = false; };
  // ---------- tape: 10 per second of every fox on the thief's set (positions, item, bag), for REWIND ----------
  const rec = s => { if (!tape || !R || tape.s !== s) return; tape.acc = (tape.acc || 0); const fr = s.foxes.map(F => [F.x, F.z, F.yaw, F.sp, F.f.visible ? 1 : 0, F.ph || '']); tape.f.push({ t: tape.t, fr, itv: R.good.it.visible, ity: R.good.it.position.y }); if (tape.f.length > 260) tape.f.shift(); };
  function round(onEvent) { evt = onEvent; build(); if (!R) place(); const left = SETS.filter(s => !(R && R.done && R.done.includes(s.i)));
    const done = R ? R.done : [], pool = SETS.filter(s => !done.includes(s.i)), s = pickR(pool.length ? pool : SETS);
    place(); const thief = pickR(s.foxes), good = pickR(s.goods); good.y0 = good.y0 ?? good.it.position.y;
    const others = s.foxes.filter(F => F !== thief); const decoy = pickR(others), dg = pickR(s.goods.filter(g => g !== good)); dg.y0 = dg.y0 ?? dg.it.position.y;
    R = { s, thief, good, decoy, dg, done, t: 0, at: rnd(5, 8), dAt: rnd(1.2, 3.0), state: 'watch', tries: 0 };
    // decoys on the other screens too, so every screen has something going on
    R.extra = SETS.filter(q => q !== s).map(q => { const F = pickR(q.foxes), g = pickR(q.goods); g.y0 = g.y0 ?? g.it.position.y; return { q, F, g, at: rnd(1, 9) }; });
    tape = { s, t: 0, f: [] }; play = null; return { cam: s.i, n: good.n }; }
  function startRole(F, role, g) { F.role = role; F.good = g; F.ph = 'go'; F.rt = 0; F.wait = 0; }
  function tick(dt) { if (!on) return; build();
    if (play) { playTick(dt); } else {
      if (R && R.state === 'watch') { R.t += dt; if (R.t > R.dAt && R.decoy.role === 'walk' && !R.dDone) { R.dDone = true; startRole(R.decoy, 'decoy', R.dg); }
        if (R.t > R.at && R.thief.role === 'walk') startRole(R.thief, 'thief', R.good);
        for (const e of R.extra) if (!e.done && R.t > e.at && e.F.role === 'walk') { e.done = true; startRole(e.F, 'decoy', e.g); } }
      for (const s of SETS) lifeTick(s, dt); if (tape) { tape.t += dt; rec(tape.s); } }
    for (const s of SETS) { pose(s); for (const F of s.foxes) if (F.f.visible) kit.animFox(F.f, dt, play ? (play.speed > 0 ? F.sp : 0) : F.sp, false); if (s.cop.on) kit.animFox(s.cop.f, dt, s.cop.sp, false);
      s.pan += dt * 0.18; const sw = Math.sin(s.pan) * 0.55; s.camO.position.copy(s.cam.p).add(s.g.position); s.camO.lookAt(V(s.cam.look.x + sw, s.cam.look.y, s.cam.look.z).add(s.g.position)); }
    render(); }
  // ---------- REWIND: back to 3 s before the grab (fast, scrubbing), then play forward at 0.6× ----------
  function rewind() { if (!tape || !tape.f.length || play) return false; const grab = tape.grabT != null ? tape.grabT : tape.t - 6, from = Math.max(tape.f[0].t, grab - 3);
    play = { i: tape.f.length - 1, t: tape.f[tape.f.length - 1].t, from, speed: -4, end: tape.f[tape.f.length - 1].t }; R.thief.f.visible = true; return true; }
  function playTick(dt) { if (!tape || !R) { play = null; return; } const s = tape.s; play.t += dt * play.speed; if (play.speed < 0 && play.t <= play.from) { play.t = play.from; play.speed = 0.6; }
    if (play.speed > 0 && play.t >= play.end) { play = null; R.thief.f.visible = false; emit('tapeEnd', s.i); return; }
    let a = tape.f[0]; for (const f of tape.f) { if (f.t > play.t) break; a = f; }
    s.foxes.forEach((F, j) => { const q = a.fr[j]; F.x = q[0]; F.z = q[1]; F.yaw = q[2]; F.sp = q[3]; F.f.visible = !!q[4]; }); R.good.it.visible = a.itv; R.good.it.position.y = a.ity; }
  // ---------- picking: uv on screen i → the fox under it (nearest head within a gentle radius) ----------
  const pv = V();
  function pick(i, u, v) { const s = SETS[i]; if (!s || !made) return null; let best = null, bd = touch ? (zoomI === i ? 0.13 : 0.19) : 0.085;
    for (const F of s.foxes) { if (!F.f.visible || (F.role === 'gone' && !play)) continue; for (const hy of [0.5, 1.0, 1.45]) { pv.set(F.x, hy, F.z).add(s.g.position).project(s.camO); if (pv.z > 1) continue; const su = (pv.x + 1) / 2, sv = (pv.y + 1) / 2, d = Math.hypot((su - u) * 1.6, sv - v); if (d < bd) { bd = d; best = F; } } }
    return best; }
  function judge(i, u, v) { if (!R) return { k: 'none' }; const F = pick(i, u, v); if (!F) return { k: 'none' }; const s = SETS[i];
    const took = play ? tape.grabT != null && play.t >= tape.grabT : R.thief.ph === 'pocket' || R.thief.ph === 'run';
    if (R.s === s && F === R.thief && took) { catchIt(); return { k: 'thief', who: F.r.name }; }
    if (F === R.thief) return { k: 'early', who: F.r.name };
    return { k: 'wrong', who: F.r.name, decoy: F.role === 'decoy' || (F.good && F.ph === 'back') }; }
  function catchIt() { const s = R.s, F = R.thief; if (play) { play = null; }
    F.role = 'held'; F.f.visible = true; F.sp = 0; F.to = null; s.ring.visible = true; R.state = 'caught';
    if (F.x < -7 || F.x > 7) { F.x = Math.max(-6.5, Math.min(6.5, F.x)); }
    const e = s.exits[0], C = s.cop; C.on = true; C.f.visible = true; C.x = e[0]; C.z = e[1]; C.ph = 'in'; C.rt = 0; R.done = [...R.done, s.i]; }
  // ---------- render: one small screen per frame round-robin + the zoomed screen every frame ----------
  const scr = document.createElement('canvas'); scr.width = 8; scr.height = 8;
  function render() { if (!renderer) return; const prevT = renderer.getRenderTarget(), prevX = renderer.xr && renderer.xr.enabled; const auto = renderer.autoClear; renderer.autoClear = true;
    const n = zoomI >= 0 ? 1 : 2; for (let k = 0; k < n; k++) { const i = (frameI++) % 4; renderer.setRenderTarget(RT[i]); renderer.render(S, SETS[i].camO); }
    if (zoomI >= 0) { renderer.setRenderTarget(BIG); renderer.render(S, SETS[zoomI].camO); }
    renderer.setRenderTarget(prevT); renderer.autoClear = auto; }
  return {
    tex: RT.map(r => r.texture), big: BIG.texture, names, SETS,
    start() { on = true; build(); place(); R = null; tape = null; play = null; frameI = 0; for (let i = 0; i < 4; i++) tick(0.016); },
    stop() { on = false; R = null; play = null; tape = null; zoomI = -1; },
    tick(dt) { tick(dt); if (R && R.thief.ph === 'pocket' && tape && tape.grabT == null) tape.grabT = tape.t; },
    round, judge, rewind, zoom(i) { zoomI = i; }, zoomed: () => zoomI,
    state: () => (R ? { cam: R.s.i, ph: R.thief.ph, role: R.thief.role, st: R.state, playing: !!play, item: R.good.n, thief: R.thief.r.name, done: R.done.length, t: R.t } : null),
    thiefUV() { if (!R) return null; const s = R.s, F = R.thief; pv.set(F.x, 1.0, F.z).add(s.g.position).project(s.camO); return [s.i, (pv.x + 1) / 2, (pv.y + 1) / 2]; },
    dispose() { RT.forEach(r => r.dispose()); BIG.dispose(); },
  };
}
