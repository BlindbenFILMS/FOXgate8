// 8 GATES — INNER TUBE kit (shared by every map with water): the tube, a fox sitting in it, arm paddling, the RACKET,
// and the tube physics (paddle, DASH, DUCK under, HOP off a lip, bumps, the AIR meter). The map only supplies the water:
// level(x, z), the flow at (x, z) and its own bounds. Tuning lives in TUBE (tested in Jidda Inner Tube).
export const TUBE = { FOX: 1.3, PADDLE: 8, DRAG: 1.3, MAXV: 11, DASH: 8, DASH_CD: 1.3, DUCK_T: 0.8, DUCK_CD: 1.2, SWING_T: 0.34, SWING_CD: 0.4, REACH: 3.1, INV: 0.9, AIR: 100, G: 18 };

export function tubeKit({ THREE, M, toon, kit }) {
  const ink = toon('#201e1d'), white = toon('#f3f2f2');
  function makeRacket(h) {
    const g = new THREE.Group(), k = h / 1.6;
    M(new THREE.CylinderGeometry(0.035 * k, 0.04 * k, 0.42 * k, 6), ink, 0, -0.21 * k, 0, g, 0);
    const head = new THREE.Group(); head.position.y = -0.62 * k; g.add(head);
    M(new THREE.TorusGeometry(0.2 * k, 0.03 * k, 6, 18), toon('#ffd23a'), 0, 0, 0, head, 0.012, 0.2 * k);
    const net = new THREE.Mesh(new THREE.CircleGeometry(0.19 * k, 16), new THREE.MeshBasicMaterial({ color: 0xf3f2f2, transparent: true, opacity: 0.55, side: THREE.DoubleSide })); head.add(net);
    head.scale.set(1, 1.25, 1); return g; }
  // fox → a rig in a tube. color = the tube; the fox keeps its own look.
  function make(fox, opts = {}) {
    const root = new THREE.Group(), ring = new THREE.Group(); root.add(ring);
    fox.scale.setScalar(opts.scale ?? TUBE.FOX); fox.updateMatrixWorld(true);
    const bx = new THREE.Box3().setFromObject(fox), h = Math.max(0.8, bx.max.y - bx.min.y), R = h * 0.33, r = h * 0.15;
    const tube = M(new THREE.TorusGeometry(R, r, 10, 30), toon(opts.color || '#ec3013'), 0, 0, 0, ring, 0.035, R + r); tube.rotation.x = Math.PI / 2;
    for (let i = 0; i < 4; i++) { const st = M(new THREE.TorusGeometry(R, r * 1.03, 8, 5, 0.32), white, 0, 0, 0, ring, 0); st.rotation.set(Math.PI / 2, 0, i * Math.PI / 2); }
    M(new THREE.CylinderGeometry(r * 0.16, r * 0.16, r * 0.5, 6), ink, R, r * 0.95, 0, ring, 0);
    const pivot = new THREE.Group(); pivot.position.set(0, r * 0.15, -R * 0.12); ring.add(pivot); fox.position.set(0, -h * 0.26, 0); pivot.add(fox);
    const sc = opts.scale ?? TUBE.FOX, P = fox.userData.P, racket = makeRacket(h / sc); if (P && P.arms && P.arms[1]) { racket.position.set(0, -h * 0.27 / sc, 0); P.arms[1].add(racket); } racket.visible = opts.racket !== false;
    const blob = new THREE.Mesh(new THREE.CircleGeometry(R + r * 1.6, 18), new THREE.MeshBasicMaterial({ color: 0x063a52, transparent: true, opacity: 0.22, depthWrite: false })); blob.rotation.x = -Math.PI / 2; root.add(blob); blob.position.y = 0.04;
    return { root, ring, pivot, fox, P, h, R, r, racket, blob, x: 0, z: 0, y: 0, vx: 0, vz: 0, vy: 0, yaw: 0, spin: 0, air: TUBE.AIR, mode: 'water', duckT: 0, duckCd: 0, swingT: 0, swingCd: 0, dashCd: 0, dashT: 0, inv: 0, wob: 0, ph: 0, paddle: 0, hit: 0 }; }

  // one physics step. inp: { ax, az } paddle direction in world (|a| ≤ 1); fx, fz: the water's flow here; level: water height here; slope: drop under you
  function step(T, dt, inp) {
    const fx = inp.fx || 0, fz = inp.fz || 0, ax = inp.ax || 0, az = inp.az || 0, am = Math.hypot(ax, az);
    T.duckT = Math.max(0, T.duckT - dt); T.duckCd = Math.max(0, T.duckCd - dt); T.swingT = Math.max(0, T.swingT - dt); T.swingCd = Math.max(0, T.swingCd - dt); T.dashCd = Math.max(0, T.dashCd - dt); T.dashT = Math.max(0, T.dashT - dt); T.inv = Math.max(0, T.inv - dt); T.wob = Math.max(0, T.wob - dt * 1.4); T.hit = Math.max(0, T.hit - dt);
    const k = T.duckT > 0 ? 0.35 : 1;
    T.vx += (ax * TUBE.PADDLE * k - (T.vx - fx) * TUBE.DRAG) * dt; T.vz += (az * TUBE.PADDLE * k - (T.vz - fz) * TUBE.DRAG) * dt;
    const rv = Math.hypot(T.vx - fx, T.vz - fz), cap = TUBE.MAXV + (T.dashT > 0 ? 6 : 0) + (T.boost || 0); if (rv > cap) { T.vx = fx + (T.vx - fx) * cap / rv; T.vz = fz + (T.vz - fz) * cap / rv; }
    T.x += T.vx * dt; T.z += T.vz * dt;
    if (T.mode === 'air') { T.vy -= TUBE.G * dt; T.y += T.vy * dt; if (T.y <= inp.level && T.vy < 0) { T.y = inp.level; T.mode = 'water'; T.landed = Math.abs(T.vy); T.vy = 0; } }
    else { const ny = inp.level; if (ny < T.y - 0.6) { T.mode = 'air'; T.vy = T.hopReq > 0 ? 7.5 : 1.5; T.hopped = T.hopReq > 0; T.hopReq = 0; } else T.y = ny; }
    T.hopReq = Math.max(0, (T.hopReq || 0) - dt);
    T.paddle = am; T.ph += dt * (am > 0.2 ? 9 : 2);
    const want = am > 0.2 ? Math.atan2(ax, az) : Math.hypot(T.vx, T.vz) > 1 ? Math.atan2(T.vx, T.vz) : T.yaw, d = Math.atan2(Math.sin(want - T.yaw), Math.cos(want - T.yaw));
    T.yaw += clampN(d, -3.2 * dt, 3.2 * dt) + T.spin * dt; T.spin *= Math.exp(-1.5 * dt); }
  const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
  function dash(T, ax, az) { if (T.dashCd > 0 || T.duckT > 0) return false; const m = Math.hypot(ax, az); let dx = ax, dz = az; if (m < 0.2) { dx = Math.sin(T.yaw); dz = Math.cos(T.yaw); } else { dx /= m; dz /= m; } T.vx += dx * TUBE.DASH; T.vz += dz * TUBE.DASH; T.dashCd = TUBE.DASH_CD; T.dashT = 0.5; T.yaw = Math.atan2(dx, dz); return true; }
  function duck(T) { if (T.duckCd > 0 || T.mode === 'air') return false; T.duckT = TUBE.DUCK_T; T.duckCd = TUBE.DUCK_CD + TUBE.DUCK_T; return true; }
  function swing(T) { if (T.swingCd > 0 || T.duckT > 0) return false; T.swingT = TUBE.SWING_T; T.swingCd = TUBE.SWING_CD; return true; }
  // true while the racket face is out in front (the hit window)
  const swingLive = T => T.swingT > 0 && T.swingT < TUBE.SWING_T - 0.04;
  function hurt(T, n) { if (T.inv > 0 || T.duckT > 0 || T.shield > 0) return false; T.air = Math.max(0, T.air - n); T.inv = TUBE.INV; T.wob = 1; T.hit = 0.4; return true; }

  // pose: sitting in the ring, legs over the front, arms paddling either side; the racket swings forehand; DUCK flips the ring over your head
  function pose(T, dt, t, kitAnim = true) {
    const f = T.fox, P = T.P; if (kitAnim) kit.animFox(f, dt, 0, false); if (!P) return;
    T.root.position.set(T.x, T.y, T.z); T.root.rotation.set(0, T.yaw, 0);
    const du = T.duckT > 0 ? 1 - T.duckT / TUBE.DUCK_T : 0, flip = du > 0 ? Math.sin(Math.PI * Math.min(1, du * 1.15)) : 0;
    T.ring.rotation.set(-flip * 2.6 + (T.mode === 'air' ? -0.25 : 0) + Math.sin(t * 2.2) * 0.04, 0, Math.sin(t * 1.7) * 0.05 + T.wob * Math.sin(t * 28) * 0.18);
    T.ring.position.y = T.r * 0.55 - flip * T.h * 0.35;
    T.blob.material.opacity = T.mode === 'air' ? 0.1 : 0.22; T.blob.position.y = T.mode === 'air' ? -(T.y - (T.lvl ?? T.y)) + 0.05 : 0.04;
    T.pivot.rotation.set(-0.5, 0, 0); f.rotation.set(0, 0, 0); P.body.rotation.set(-0.15, 0, 0);
    P.legs.forEach((l, i) => { l.rotation.x = -1.35 + Math.sin(t * 3 + i * 2) * 0.08; l.rotation.z = (i ? 1 : -1) * 0.18; });
    const pp = T.paddle > 0.2 ? 1 : 0.3;
    P.arms.forEach((a, i) => { const s = Math.sin(T.ph + i * Math.PI); a.rotation.x = -0.35 + s * 0.85 * pp; a.rotation.z = (i ? 1 : -1) * (1.05 - Math.max(0, s) * 0.3 * pp); });
    if (T.swingT > 0) { const u = 1 - T.swingT / TUBE.SWING_T, a = P.arms[1], e = u < 0.3 ? u / 0.3 : 1; a.rotation.x = -0.2 - 1.2 * Math.sin(Math.PI * u); a.rotation.z = 1.6 - 2.4 * u; P.body.rotation.y = 0.7 - 1.4 * u * e; }
    if (T.duckT > 0) P.arms.forEach((a, i) => { a.rotation.x = -2.8 * flip; a.rotation.z = (i ? 1 : -1) * 0.4; });
    if (T.mode === 'air') P.arms.forEach((a, i) => { a.rotation.x = -2.4; a.rotation.z = (i ? 1 : -1) * 0.6; }); }

  return { make, step, dash, duck, swing, swingLive, hurt, pose };
}
