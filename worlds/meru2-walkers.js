import { applyPose, endPose, FOX_ANIMS } from '../engine/fox-poses.js?v=s648k';   // s628 jointed walkers: little moments when they pause
// MERU 2.0 — exterior polish: BACKGROUND WALKERS (Ben: "yes, a few"). No talking, no names, just life on the Town Square paths.
// Phone 4, desktop 8. Each walks a route (one of the plaza paths from the fountain ring out to the street block, or the ring round
// the fountain), keeps right, pauses now and then to look about, steps round the player, turns back at the end. A moving collider
// each so the player bumps them. Hidden beyond 70 m (50 m phones). Looks: a palette of torsos + outfits from the fox kit.
export function buildWalkers({ THREE, scene, kit, L, cols, touch, PLAYER_FEMALE, n }) {
  const N = n ?? (touch ? 2 : 8), R = Math.random, IN = (x, z) => Math.abs(x) < 148 && Math.abs(z) < 136;
  const inB = (x, z, m) => L.BUILDINGS.some(b => b.f && x > b.f[0] - m && x < b.f[1] + m && z > b.f[2] - m && z < b.f[3] + m);
  // routes: each plaza path clipped to [ring 14 m .. 3 m short of a building / the block edge], plus the fountain ring
  const routes = [];
  for (const P of L.PATHS) { const [ax, az] = P.p[0], [bx, bz] = P.p[1]; if (Math.hypot(ax, az) > 1) continue; const len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len; let t1 = 14;
    while (t1 < len && IN(ux * t1, uz * t1) && !inB(ux * t1, uz * t1, 3)) t1 += 1; if (t1 - 14 > 20) routes.push({ kind: 'line', a: [ux * 14, uz * 14], b: [ux * (t1 - 1), uz * (t1 - 1)], n: [-uz, ux] }); }
  routes.push({ kind: 'ring', r: 13.6 });
  const TORSO = ['#2e4a6b', '#7a3f6b', '#3f7a52', '#c9a24a', '#8a5a34', '#5b6570', '#b8407f', '#2e8bd8', '#a8323e', '#e6dfcf'];
  const OUT = ['vest', 'coat', 'dress', 'suit', 'robe', 'vest', 'coat'];
  const W = [], MOMENTS = ['yawn', 'k_clipboard', 'think', 'town_drink', 'k_phone', 'hips', 'browse_look'];
  for (let i = 0; i < N; i++) { const female = R() < 0.5, outfit = female && R() < 0.5 ? 'dress' : OUT[(R() * OUT.length) | 0];
    let f; try { f = kit.makeFox({ joints: true, key: 'walker' + i, torso: TORSO[i % TORSO.length], mood: R() < 0.5 ? 'happy' : 'neutral', look: female ? PLAYER_FEMALE : undefined, outfit, gear: 'none' }); } catch (e) { continue; }
    f.scale.setScalar(0.92 + R() * 0.14); scene.add(f);
    const rt = routes[i % routes.length], col = { c: [0, 0, 0.45] }; cols.push(col);
    W.push({ f, rt, col, u: R(), dir: R() < 0.5 ? 1 : -1, sp: 1.05 + R() * 0.45, side: 1.4 + R() * 0.8, pause: 0, nextPause: 6 + R() * 14, yaw: 0, look: 0, x: 0, z: 0 }); }
  const posOf = w => { const r = w.rt; if (r.kind === 'ring') { const a = w.u * Math.PI * 2, rr = r.r + (w.dir > 0 ? 0 : 1.6); return [Math.cos(a) * rr, Math.sin(a) * rr]; }
    const x = r.a[0] + (r.b[0] - r.a[0]) * w.u, z = r.a[1] + (r.b[1] - r.a[1]) * w.u, s = w.side * w.dir; return [x + r.n[0] * s, z + r.n[1] * s]; };
  const lenOf = r => r.kind === 'ring' ? Math.PI * 2 * r.r : Math.hypot(r.b[0] - r.a[0], r.b[1] - r.a[1]);
  for (const w of W) { const [x, z] = posOf(w); w.x = x; w.z = z; w.f.position.set(x, 0, z); }
  let cullT = 0, meetT = 2;
  // s642 GREETINGS: two walkers who pass close stop, face each other + do a HIGH FIVE / FIST BUMP / HUG / SELFIE together (both the same move)
  const MEET = ['s_high5', 's_fistbump', 's_hug', 's_selfie'];
  function meetCheck() { for (let i = 0; i < W.length; i++) for (let j = i + 1; j < W.length; j++) { const a = W[i], b = W[j]; if (!a.f.visible || !b.f.visible || a.pause > 0 || b.pause > 0 || a.metT > 0 || b.metT > 0) continue; if (Math.hypot(a.x - b.x, a.z - b.z) > 1.9) continue;
      const m = MEET[(Math.random() * MEET.length) | 0], dur = FOX_ANIMS[m] ? FOX_ANIMS[m].dur : 2.5; for (const [x, y] of [[a, b], [b, a]]) { x.act = m; x.actT = 0; x.pause = dur; x.metT = 25; x.faceTo = Math.atan2(y.x - x.x, y.z - x.z); } return; } }
  function tick(dt, P, hideAll) { if ((meetT -= dt) <= 0) { meetT = 0.6; meetCheck(); } for (const w of W) if (w.metT > 0) w.metT -= dt;
    if ((cullT -= dt) <= 0) { cullT = 0.5; const RR = touch ? 50 : 70; for (const w of W) w.f.visible = !hideAll && Math.hypot(w.x - P.x, w.z - P.z) < RR; }
    for (const w of W) {
      const dP = Math.hypot(P.x - w.x, P.z - w.z), block = dP < 1.4;
      let sp = 0; if (w.pause > 0) w.pause -= dt; else if (!block) { sp = w.sp; w.u += w.dir * sp * dt / lenOf(w.rt); if (w.rt.kind === 'ring') w.u = (w.u + 1) % 1; else if (w.u > 1 || w.u < 0) { w.u = Math.max(0, Math.min(1, w.u)); w.dir *= -1; w.pause = 1 + R() * 2; }
        if ((w.nextPause -= dt) <= 0) { w.nextPause = 8 + R() * 16; w.look = (R() - 0.5) * 2; const M = MOMENTS[(R() * MOMENTS.length) | 0]; w.act = FOX_ANIMS[M] ? M : null; w.actT = 0; w.pause = w.act ? FOX_ANIMS[w.act].dur : 1.5 + R() * 3; } }
      const [nx, nz] = posOf(w), mx = nx - w.x, mz = nz - w.z; if (Math.hypot(mx, mz) > 1e-4) w.yaw = Math.atan2(mx, mz); w.x = nx; w.z = nz; w.col.c[0] = nx; w.col.c[1] = nz;
      if (!w.f.visible) continue;
      const want = block ? Math.atan2(P.x - w.x, P.z - w.z) : w.pause > 0 && w.faceTo != null && w.act && /^s_/.test(w.act) ? w.faceTo : w.pause > 0 ? w.yaw + w.look : w.yaw; let cur = w.f.rotation.y; cur += Math.atan2(Math.sin(want - cur), Math.cos(want - cur)) * Math.min(1, dt * 5);
      w.f.rotation.y = cur; w.f.position.set(w.x, 0, w.z); kit.animFox(w.f, dt, sp, false);
      // s628: a little moment while paused (stretch, check the list, look up at the sky, drink, wave at you when you walk by)
      if (dP < 4 && !w.hi && w.f.userData.P && w.f.userData.P.fore) { w.hi = true; w.act = 'wave'; w.actT = 0; w.pause = Math.max(w.pause, 1.6); } if (dP > 6) w.hi = false;
      if (w.act && w.pause > 0 && w.f.userData.P && w.f.userData.P.fore) { w.actT += dt; const D = FOX_ANIMS[w.act].dur; applyPose(THREE, w.f, w.act, Math.min(w.actT, D - 0.01), Math.min(1, w.actT * 3, w.pause * 3)); w.posed = true; }
      else if (w.posed) { w.posed = false; w.act = null; endPose(w.f); } } }
  return { tick, count: W.length, list: W };
}
