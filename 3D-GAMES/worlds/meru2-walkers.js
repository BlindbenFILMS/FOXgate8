// MERU 2.0 — exterior polish: BACKGROUND WALKERS (Ben: "yes, a few"). No talking, no names, just life on the Town Square paths.
// Phone 4, desktop 8. Each walks a route (one of the plaza paths from the fountain ring out to the street block, or the ring round
// the fountain), keeps right, pauses now and then to look about, steps round the player, turns back at the end. A moving collider
// each so the player bumps them. Hidden beyond 70 m (50 m phones). Looks: a palette of torsos + outfits from the fox kit.
export function buildWalkers({ THREE, scene, kit, L, cols, touch, PLAYER_FEMALE }) {
  const N = touch ? 4 : 8, R = Math.random, IN = (x, z) => Math.abs(x) < 148 && Math.abs(z) < 136;
  const inB = (x, z, m) => L.BUILDINGS.some(b => b.f && x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m);
  // routes: each plaza path clipped to [ring 14 m .. 3 m short of a building / the block edge], plus the fountain ring
  const routes = [];
  for (const P of L.PATHS) { const [ax, az] = P.p[0], [bx, bz] = P.p[1]; if (Math.hypot(ax, az) > 1) continue; const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len; let t1 = 14;
    while (t1 < len && IN(ux * t1, uz * t1) && !inB(ux * t1, uz * t1, 3)) t1 += 1; if (t1 - 14 > 20) routes.push({ kind: 'line', a: [ux * 14, uz * 14], b: [ux * (t1 - 1), uz * (t1 - 1)], n: [-uz, ux] }); }
  routes.push({ kind: 'ring', r: 13.6 });
  const TORSO = ['#2e4a6b', '#7a3f6b', '#3f7a52', '#c9a24a', '#8a5a34', '#5b6570', '#b8407f', '#2e8bd8', '#a8323e', '#e6dfcf'];
  const OUT = ['vest', 'coat', 'dress', 'suit', 'robe', 'vest', 'coat'];
  const W = [];
  for (let i = 0; i < N; i++) { const female = R() < 0.5, outfit = female && R() < 0.5 ? 'dress' : OUT[(R() * OUT.length) | 0];
    let f; try { f = kit.makeFox({ key: 'walker' + i, torso: TORSO[i % TORSO.length], mood: R() < 0.5 ? 'happy' : 'neutral', look: female ? PLAYER_FEMALE : undefined, outfit, gear: 'none' }); } catch (e) { continue; }
    f.scale.setScalar(0.92 + R() * 0.14); scene.add(f);
    const rt = routes[i % routes.length], col = { c: [0, 0, 0.45] }; cols.push(col);
    W.push({ f, rt, col, u: R(), dir: R() < 0.5 ? 1 : -1, sp: 1.05 + R() * 0.45, side: 1.4 + R() * 0.8, pause: 0, nextPause: 6 + R() * 14, yaw: 0, look: 0, x: 0, z: 0 }); }
  const posOf = w => { const r = w.rt; if (r.kind === 'ring') { const a = w.u * Math.PI * 2, rr = r.r + (w.dir > 0 ? 0 : 1.6); return [Math.cos(a) * rr, Math.sin(a) * rr]; }
    const x = r.a[0] + (r.b[0] - r.a[0]) * w.u, z = r.a[1] + (r.b[1] - r.a[1]) * w.u, s = w.side * w.dir; return [x + r.n[0] * s, z + r.n[1] * s]; };
  const lenOf = r => r.kind === 'ring' ? Math.PI * 2 * r.r : Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]);
  for (const w of W) { const [x, z] = posOf(w); w.x = x; w.z = z; w.f.position.set(x, 0, z); }
  let cullT = 0;
  function tick(dt, P, hideAll) {
    if ((cullT -= dt) <= 0) { cullT = 0.5; const RR = touch ? 50 : 70; for (const w of W) w.f.visible = !hideAll && Math.hypot(w.x - P.x, w.z - P.z) < RR; }
    for (const w of W) {
      const dP = Math.hypot(P.x - w.x, P.z - w.z), block = dP < 1.4;
      let sp = 0; if (w.pause > 0) w.pause -= dt; else if (!block) { sp = w.sp; w.u += w.dir * sp * dt / lenOf(w.rt); if (w.rt.kind === 'ring') w.u = (w.u + 1) % 1; else if (w.u > 1 || w.u < 0) { w.u = Math.max(0, Math.min(1, w.u)); w.dir *= -1; w.pause = 1 + R() * 2; }
        if ((w.nextPause -= dt) <= 0) { w.nextPause = 8 + R() * 16; w.pause = 1.5 + R() * 3; w.look = (R() - 0.5) * 2; } }
      const [nx, nz] = posOf(w), mx = nx - w.x, mz = nz - w.z; if (Math.hypot(mx, mz) > 1e-4) w.yaw = Math.atan2(mx, mz); w.x = nx; w.z = nz; w.col.c[0] = nx; w.col.c[1] = nz;
      if (!w.f.visible) continue;
      const want = block ? Math.atan2(P.x - w.x, P.z - w.z) : w.pause > 0 ? w.yaw + w.look : w.yaw; let cur = w.f.rotation.y; cur += Math.atan2(Math.sin(want - cur), Math.cos(want - cur)) * Math.min(1, dt * 5);
      w.f.rotation.y = cur; w.f.position.set(w.x, 0, w.z); kit.animFox(w.f, dt, sp, false); } }
  return { tick, count: W.length, list: W };
}
