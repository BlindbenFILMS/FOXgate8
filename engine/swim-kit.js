// 8 GATES — SWIM kit (shared by every map with water): a fox swimming. Surface crawl, KICK burst, DIVE just under the
// surface (shallow duck-dives, never deep), wading in the shallows, a BREATH meter, carrying someone on your back.
// The map supplies: water surface y, seabed y, the flow, and whether there is a roof (can't surface). Tuning lives in SWIM.
export const SWIM = { FOX: 1.3, SPEED: 4.8, UNDER: 4.2, WADE: 2.6, DRAG: 2.2, KICK: 6, KICK_CD: 1.1, DEPTH: 1.35, BREATH: 100, DRAIN: 8, REFILL: 40, SHALLOW: 0.95, INV: 1.0 };

export function swimKit({ THREE, M, toon, kit }) {
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  function make(fox, opts = {}) {
    const root = new THREE.Group(), pivot = new THREE.Group(); root.add(pivot);
    const sc = opts.scale ?? SWIM.FOX; fox.scale.setScalar(sc); fox.updateMatrixWorld(true);
    const bx = new THREE.Box3().setFromObject(fox), h = Math.max(0.8, bx.max.y - bx.min.y); pivot.add(fox);
    // swim trunks (red band at the hips) so he reads as dressed for the water
    const trunks = M(new THREE.CylinderGeometry(h * 0.115 / sc, h * 0.125 / sc, h * 0.1 / sc, 12), toon(opts.trunks || '#ec3013'), 0, h * 0.4 / sc, 0, fox, 0.01); trunks.scale.z = 0.8;
    const carry = new THREE.Group(); carry.position.set(0, h * 0.22, -h * 0.05); root.add(carry);
    const ring = new THREE.Mesh(new THREE.RingGeometry(h * 0.35, h * 0.48, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; root.add(ring);
    return { root, pivot, fox, P: fox.userData.P, h, sc, carry, ring, x: 0, y: 0, z: 0, vx: 0, vz: 0, yaw: 0, breath: SWIM.BREATH, diving: false, under: false, wade: false, kickCd: 0, kickT: 0, gasp: 0, inv: 0, ph: 0, paddle: 0, spin: 0, surfY: 0 }; }

  // inp: { ax, az } swim direction (|a| ≤ 1) · fx, fz flow · surf (water y here) · floor (seabed y here) · covered (a roof: you can't come up)
  function step(S, dt, inp) {
    S.kickCd = Math.max(0, S.kickCd - dt); S.kickT = Math.max(0, S.kickT - dt); S.gasp = Math.max(0, S.gasp - dt); S.inv = Math.max(0, S.inv - dt);
    const surf = inp.surf, floor = inp.floor, deep = surf - floor; S.surfY = surf;
    S.wade = deep < SWIM.SHALLOW; if (S.wade) S.diving = false;
    if (S.diving && S.breath <= 0 && !inp.covered) { S.diving = false; S.gasp = 1.4; S.outOfBreath = true; }
    const down = S.diving || inp.covered, wantY = S.wade ? floor : down ? Math.max(floor + 0.45, surf - SWIM.DEPTH) : surf - 0.1;
    if (S.wade || !down) S.y += (wantY - S.y) * Math.min(1, dt * (S.wade ? 8 : 10)); else S.y += cl(wantY - S.y, -2.6 * dt, 2.6 * dt);
    const ax = inp.ax || 0, az = inp.az || 0, am = Math.hypot(ax, az), fx = inp.fx || 0, fz = inp.fz || 0;
    const sp = (S.wade ? SWIM.WADE : S.under ? SWIM.UNDER : SWIM.SPEED) * (S.gasp > 0 ? 0.5 : 1) + (S.boost || 0);
    S.vx += (ax * sp * SWIM.DRAG - (S.vx - fx) * SWIM.DRAG) * dt; S.vz += (az * sp * SWIM.DRAG - (S.vz - fz) * SWIM.DRAG) * dt;
    S.x += S.vx * dt; S.z += S.vz * dt;
    S.under = !S.wade && S.y < surf - 0.55;
    S.breath = cl(S.breath + (S.under ? -SWIM.DRAIN : SWIM.REFILL) * dt, 0, SWIM.BREATH); if (!S.under) S.outOfBreath = false;
    S.paddle = am; S.ph += dt * (am > 0.2 ? (S.under ? 5 : 7) : 1.6);
    const want = am > 0.2 ? Math.atan2(ax, az) : Math.hypot(S.vx - fx, S.vz - fz) > 0.8 ? Math.atan2(S.vx - fx, S.vz - fz) : S.yaw, d = Math.atan2(Math.sin(want - S.yaw), Math.cos(want - S.yaw));
    S.yaw += cl(d, -4 * dt, 4 * dt) + S.spin * dt; S.spin *= Math.exp(-2 * dt); }
  function kick(S, ax, az) { if (S.kickCd > 0 || S.wade) return false; const m = Math.hypot(ax, az); let dx = ax, dz = az; if (m < 0.2) { dx = Math.sin(S.yaw); dz = Math.cos(S.yaw); } else { dx /= m; dz /= m; } S.vx += dx * SWIM.KICK; S.vz += dz * SWIM.KICK; S.kickCd = SWIM.KICK_CD; S.kickT = 0.5; S.yaw = Math.atan2(dx, dz); return true; }
  // tap = go under / tap again = come up. Returns 'shallow' | 'covered' | 'down' | 'up' | 'breath'
  function dive(S, covered) { if (S.wade) return 'shallow'; if (S.diving) { if (covered) return 'covered'; S.diving = false; return 'up'; } if (S.breath < 15) return 'breath'; S.diving = true; return 'down'; }
  function hurt(S, n) { if (S.inv > 0) return false; S.breath = Math.max(0, S.breath - n); S.inv = SWIM.INV; S.spin += (Math.random() - 0.5) * 6; return true; }

  function pose(S, dt, t) {
    const f = S.fox, P = S.P; S.root.position.set(S.x, S.y, S.z); S.root.rotation.set(0, S.yaw, 0);
    const spd = Math.hypot(S.vx, S.vz); S.ring.visible = !S.wade && !S.under; S.ring.position.y = S.surfY - S.y + 0.03; S.ring.scale.setScalar(1 + 0.15 * Math.sin(t * 3));
    if (S.wade) { S.pivot.rotation.set(0, 0, 0); S.pivot.position.set(0, 0, 0); f.position.set(0, 0, 0); f.rotation.set(0, 0, 0); kit.animFox(f, dt, Math.min(1, spd / 3), spd > 0.4); if (P) P.arms.forEach((a, i) => { a.rotation.z = (i ? 1 : -1) * 0.5; }); return; }
    kit.animFox(f, dt, 0, false); if (!P) return;
    const pitch = S.under ? (S.y > S.surfY - SWIM.DEPTH + 0.2 && S.diving ? 0.35 : 0) : 0;
    S.pivot.rotation.set(Math.PI / 2 * 0.94 + pitch, 0, Math.sin(S.ph * 0.5) * (S.under ? 0.05 : 0.18)); S.pivot.position.set(0, 0, 0); f.position.set(0, -S.h * 0.5, 0); f.rotation.set(0, 0, 0);
    P.body.rotation.set(0, 0, 0);
    if (S.under) { const u = Math.sin(S.ph); P.arms.forEach((a, i) => { a.rotation.x = -2.8 + Math.max(0, u) * 1.6; a.rotation.z = (i ? 1 : -1) * (0.2 + Math.max(0, -u) * 1.2); }); P.legs.forEach((l, i) => { l.rotation.x = Math.sin(S.ph * 2 + i * Math.PI) * 0.25; l.rotation.z = (i ? 1 : -1) * (0.1 + Math.max(0, u) * 0.3); }); }
    else { P.arms.forEach((a, i) => { const ph = (S.ph + i * Math.PI) % (Math.PI * 2); a.rotation.x = -ph; a.rotation.z = (i ? 1 : -1) * 0.15; }); P.legs.forEach((l, i) => { l.rotation.x = Math.sin(S.ph * 2.4 + i * Math.PI) * 0.35; l.rotation.z = 0; }); }
    if (S.carryOn) P.arms[0].rotation.x = -0.4; }

  return { make, step, kick, dive, hurt, pose };
}
