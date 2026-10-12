// FUN RIDES plugin for the Vehicle Workshop: specs, models, behaviour and rider poses for the extra rides.
// The lab passes a live context (getters) so this file can read/write the shared controller state C, St, V…
export function funKit(X) {
  const { THREE, M, toon } = X;
  const red = () => toon('#ec3013'), dark = () => toon('#201e1d'), white = () => toon('#f3f2f2'), alu = () => toon('#cbd5e1'), gold = () => toon('#e6b45a'), blue = () => toon('#38bdf8');
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  const tb = (p, q, r, mat, parent, ol = 0.006) => { const d = new THREE.Vector3().subVectors(q, p), m = M(new THREE.CylinderGeometry(r, r, d.length(), 8), mat, (p.x + q.x) / 2, (p.y + q.y) / 2, (p.z + q.z) / 2, parent, ol); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); return m; };
  const badgeTex = (() => { let t; return () => t || (t = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.fill(); g.lineWidth = 8; g.strokeStyle = '#201e1d'; g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 92px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', 64, 70); return new THREE.CanvasTexture(c); })()); })();
  const badge = (r, parent, x, y, z, ry = 0, rx = 0) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 20), new THREE.MeshBasicMaterial({ map: badgeTex() })); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); parent.add(m); return m; };
  const glow = (col, s, parent, x, y, z) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.glowTex, color: col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); sp.scale.setScalar(s); sp.position.set(x, y, z); parent.add(sp); return sp; };
  function shell() { const root = new THREE.Group(), body = new THREE.Group(); root.add(body); const spin = new THREE.Group(); body.add(spin); const V = { wheels: [], steer: [], body, spin, seatParent: spin, noSmoke: true }; const ex = new THREE.Object3D(); spin.add(ex); V.exhaust = ex; root.userData.V = V; return { root, V, s: spin }; }
  const torps = [];
  let SK = null;
  window.__sk = () => SK && { x: SK.x, z: SK.z, y: SK.y, up: SK.up, down: SK.down, air: SK.air };
  function skierKill() { if (!SK) return; X.scene.remove(SK.f, SK.handle, SK.rope); SK = null; }
  function skierSpot(P, yaw, L) { for (const da of [0, 0.5, -0.5, 1, -1, 1.6, -1.6, 2.2, -2.2, 3.1]) for (let k = L; k >= 3; k -= 1.5) { const x = P.x - Math.sin(yaw + da) * k, z = P.z - Math.cos(yaw + da) * k; if (X.inLake(x, z) && X.groundH(x, z) < 0.2) return [x, z]; } return null; }
  function skierUpd(dt) { const C = X.C, V = X.V, t = X.St.t, L = 9;
    X.veh.updateMatrixWorld(true); const P = V.tow.getWorldPosition(new THREE.Vector3());
    if (!SK) { const f = X.makeFox({ torso: ['#f3f2f2', '#ec3013', '#7f1d1d'], crest: '', gear: 'none', outfit: 'vest', mood: 'happy' }); f.rotation.order = 'YXZ'; X.scene.add(f); const bb = new THREE.Box3().setFromObject(f), h = Math.max(0.8, bb.max.y - bb.min.y), s0 = f.scale.x;
      for (const sd of [-1, 1]) { const sk2 = new THREE.Group(); sk2.position.set(sd * 0.11 / s0 * h / 1.6, 0.02 / s0, 0); f.add(sk2); M(new THREE.BoxGeometry(0.13 / s0, 0.03 / s0, 1.45 / s0), white(), 0, 0, 0.1 / s0, sk2, 0.004); M(new THREE.BoxGeometry(0.135 / s0, 0.032 / s0, 0.5 / s0), red(), 0, 0.002 / s0, 0.15 / s0, sk2, 0); const tip = M(new THREE.BoxGeometry(0.13 / s0, 0.03 / s0, 0.2 / s0), white(), 0, 0.04 / s0, 0.88 / s0, sk2, 0.004); tip.rotation.x = -0.5; M(new THREE.BoxGeometry(0.12 / s0, 0.08 / s0, 0.16 / s0), dark(), 0, 0.05 / s0, 0, sk2, 0.004); }
      const handle = new THREE.Group(); X.scene.add(handle); const hb = M(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 8), dark(), 0, 0, 0, handle, 0.004); hb.rotation.z = Math.PI / 2; for (const sd of [-1, 1]) M(new THREE.CylinderGeometry(0.032, 0.032, 0.12, 8), red(), sd * 0.15, 0, 0, handle, 0).rotation.z = Math.PI / 2;
      const rope = new THREE.Line(new THREE.BufferGeometry().setFromPoints([P.clone(), P.clone()]), new THREE.LineBasicMaterial({ color: 0xffd23a })); rope.frustumCulled = false; X.scene.add(rope);
      const sp0 = skierSpot(P, C.yaw, L) || [P.x, P.z], bx = sp0[0], bz = sp0[1]; SK = { f, h, handle, rope, x: bx, z: bz, px: bx, pz: bz, y: 0, vy: 0, up: false, air: false, down: sp0[0] === P.x ? 0.5 : 0, pts: 0, wasRamp: false, yaw: C.yaw }; }
    const S = SK, wy = X.inLake(S.x, S.z) ? X.waveH(S.x, S.z, t) : 0;
    if (S.down > 0) { S.down -= dt; S.y = X.damp(S.y, wy - 0.35, 3, dt); S.f.position.set(S.x, S.y, S.z); S.f.rotation.set(-1.25, S.yaw, 0); S.rope.visible = false; S.handle.position.set(S.x + Math.sin(S.yaw) * 1.2, wy + 0.05, S.z + Math.cos(S.yaw) * 1.2); X.animFox(S.f, dt, 0, false);
      if (S.down <= 0 && X.inLake(C.x, C.z)) { const q = skierSpot(P, C.yaw, L); if (!q) { S.down = 0.5; return; } S.x = S.px = q[0]; S.z = S.pz = q[1]; S.up = false; S.air = false; S.rope.visible = true; } else if (S.down <= 0) S.down = 0.3; return; }
    // verlet on the water, rope keeps it within L of the tow point
    const vx = S.x - S.px, vz = S.z - S.pz, dx0 = S.x - P.x, dz0 = S.z - P.z, d0 = Math.hypot(dx0, dz0) || 1, kD = S.air ? 0.995 : S.up ? 0.985 : 0.9;
    let ax = 0, az = 0; if (S.up && !S.air) { const sw = Math.sin(t * 0.55) * 7; ax = -dz0 / d0 * sw; az = dx0 / d0 * sw; }
    let nx = S.x + vx * kD + ax * dt * dt, nz = S.z + vz * kD + az * dt * dt; const dx = nx - P.x, dz = nz - P.z, d = Math.hypot(dx, dz) || 1; if (d > L) { nx = P.x + dx / d * L; nz = P.z + dz / d * L; }
    S.px = S.x; S.pz = S.z; S.x = nx; S.z = nz; const spd = Math.hypot(S.x - S.px, S.z - S.pz) / Math.max(dt, 1e-3), lat = ((S.x - S.px) * -dz0 + (S.z - S.pz) * dx0) / d0 / Math.max(dt, 1e-3);
    if (!S.up && spd > 7) { S.up = true; X.popup(X.tmp.set(S.x, 2.8, S.z), 'UP ON SKIS!', '#0e7fb8'); X.St.score += 10; X.audio.tone(990, 0.12, 0.04, 'triangle', 1.4); }
    if (S.up && !S.air && spd < 3.2) { S.up = false; X.popup(X.tmp.set(S.x, 2.6, S.z), 'SINKING', '#9ca3af'); }
    const gh = X.groundH(S.x, S.z), onRamp = X.inLake(S.x, S.z) && gh > wy + 0.2;
    if (!X.inLake(S.x, S.z) && !S.air) { S.down = 2.5; X.popup(X.tmp.set(S.x, 2.6, S.z), 'SKIER DOWN', '#ec3013'); X.spray(X.tmp.set(S.x, 0.4, S.z), 12, 4); X.audio.burst(0.3, 800, 0.2); return; }
    if (S.air) { S.vy -= 18 * dt; S.y += S.vy * dt; if (S.y <= Math.max(wy, gh)) { S.air = false; S.y = Math.max(wy, gh); X.spray(X.tmp.set(S.x, 0.4, S.z), 12, 4); X.ripple(S.x, S.z, 3, 0.8); if (spd > 5) { X.popup(X.tmp.set(S.x, 3, S.z), 'SKI JUMP +50', '#ffd23a'); X.St.score += 50; X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.5); } else { S.down = 2.5; X.popup(X.tmp.set(S.x, 2.6, S.z), 'WIPEOUT', '#ec3013'); return; } } }
    else if (onRamp) S.y = gh; else { if (S.wasRamp && S.up) { S.air = true; S.vy = 3 + spd * 0.3; X.popup(X.tmp.set(S.x, 3, S.z), 'SKIER AIR', '#0e7fb8'); } S.y = X.damp(S.y, S.up ? wy + 0.02 : wy - 0.45, 6, dt); }
    S.wasRamp = onRamp;
    if (S.up && !S.air) { S.pts += dt * 6; if (S.pts >= 1) { X.St.score += Math.floor(S.pts); S.pts %= 1; } if (Math.random() < 0.5) X.spray(X.tmp.set(S.x, wy + 0.2, S.z), 1, 1.5 + spd * 0.12); if (Math.random() < 0.08) X.ripple(S.x, S.z, 1.4, 0.5); }
    S.yaw = Math.atan2(P.x - S.x, P.z - S.z); const up = S.up || S.air; S.f.position.set(S.x, S.y, S.z); S.f.rotation.set(up ? -0.32 : -0.85, S.yaw, X.clamp(-lat * 0.04, -0.5, 0.5));
    X.animFox(S.f, dt, 0, false); const FP = S.f.userData.P; FP.legs.forEach((l, i) => { l.rotation.x = up ? -0.4 : -1.3; l.rotation.z = (i ? 1 : -1) * 0.08; }); FP.arms.forEach((a, i) => { a.rotation.x = -1.35; a.rotation.z = (i ? 1 : -1) * 0.12; }); FP.body.rotation.set(up ? 0.25 : 0.5, 0, 0);
    S.f.updateMatrixWorld(true); const hp = new THREE.Vector3(0, S.h * 0.5 / S.f.scale.x, S.h * 0.36 / S.f.scale.x).applyMatrix4(S.f.matrixWorld); S.handle.position.copy(hp); S.handle.rotation.set(0, S.yaw, 0);
    const pa = S.rope.geometry.attributes.position; pa.setXYZ(0, P.x, P.y, P.z); pa.setXYZ(1, hp.x, hp.y, hp.z); pa.needsUpdate = true; }
  function tBlast(x, y, z, wet) { const p = new THREE.Vector3(x, Math.max(y, 0.3), z); X.St.shake = Math.max(X.St.shake, 0.45); X.ripple(x, z, 5, 0.9); X.buoyBlast(x, z, 3);
    if (wet) { X.spray(p, 28, 9); X.puff(p, 0xffffff, 8, 5, 1.4, 1.0); X.popup(p.clone().setY(4.2), 'KABLOOSH', '#0369a1'); } else { X.puff(p, 0xff8a1a, 14, 5, 1.3, 0.5, true); X.puff(p, 0xffe08a, 6, 3, 0.9, 0.35, true); X.puff(p, 0x4b5563, 10, 3, 1.5, 1.3); X.popup(p.clone().setY(4.2), 'BOOM', '#ec3013'); }
    X.audio.burst(0.6, wet ? 500 : 300, 0.35); X.audio.tone(70, 0.5, 0.08, 'sine', 0.5); const n2 = knock(x, z, 4.5, 8, wet ? 'SOAKED!' : 'BOOM!'); crates(x, z, 3.5, 'torpedo'); for (const o of X.props) if (o.kind === 'car' && !o.dead && Math.hypot(o.x - x, o.z - z) < 4.5) X.damage(o, 40, 'torpedo'); if (n2) X.St.score += 20 * n2; }
  function torpMesh() { const g = new THREE.Group(), b = M(new THREE.CylinderGeometry(0.13, 0.13, 1.0, 12), toon('#334155'), 0, 0, 0, g, 0.01); b.rotation.x = Math.PI / 2; M(new THREE.SphereGeometry(0.13, 12, 8), red(), 0, 0, 0.5, g, 0.01, 0.13).scale.z = 1.6; const bd = M(new THREE.CylinderGeometry(0.135, 0.135, 0.1, 12), white(), 0, 0, 0.25, g, 0); bd.rotation.x = Math.PI / 2;
    for (let k = 0; k < 4; k++) { const fn = M(new THREE.BoxGeometry(0.02, 0.2, 0.18), dark(), 0, 0, -0.42, g, 0.003); fn.rotation.z = k * Math.PI / 2; fn.position.set(Math.sin(k * Math.PI / 2) * 0.12, Math.cos(k * Math.PI / 2) * 0.12, -0.42); } const pr = new THREE.Group(); pr.position.z = -0.56; g.add(pr); for (let k = 0; k < 3; k++) { const bl = M(new THREE.BoxGeometry(0.04, 0.14, 0.01), alu(), 0, 0, 0, pr, 0); bl.rotation.z = k * 2.094; } g.userData.pr = pr; g.rotation.order = 'YXZ'; return g; }
  function fireTorp(off, sd) { const C = X.C, S = X.V.spec, fx = Math.sin(C.yaw), fz = Math.cos(C.yaw), rx = Math.cos(C.yaw), rz = -Math.sin(C.yaw), sc = S.scale || 1, x = C.x + fx * 1.7 * sc + rx * sd * 0.62 * sc, z = C.z + fz * 1.7 * sc + rz * sd * 0.62 * sc, yaw = C.yaw + off;
    let tg = null, bd = 50; for (const o of [...X.props.filter(o => !o.dead), ...X.npcs.filter(n => n.st === 'walk')]) { const d = Math.hypot(o.x - x, o.z - z), a = Math.atan2(o.x - x, o.z - z) - yaw, da = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))); if (d < bd && da < 0.6) { bd = d; tg = o; } }
    const m = torpMesh(); X.scene.add(m); torps.push({ m, x, z, y: 0, yaw, sp: Math.max(24, C.speed + 14), life: 3.6, tg, air: false, wd: 0 }); X.spray(X.tmp.set(x, 0.4, z), 6, 3); X.audio.burst(0.25, 700, 0.14); X.audio.tone(160, 0.3, 0.05, 'sawtooth', 0.5); F.kick = 1; }
  function updTorps(dt) { const t = X.St.t; for (let i = torps.length - 1; i >= 0; i--) { const T = torps[i]; T.life -= dt; T.m.userData.pr.rotation.z += dt * 40;
    if (!T.air) { if (T.tg && !T.tg.dead) { const want = Math.atan2(T.tg.x - T.x, T.tg.z - T.z), df = Math.atan2(Math.sin(want - T.yaw), Math.cos(want - T.yaw)); T.yaw += X.clamp(df, -1.4 * dt, 1.4 * dt); }
      T.x += Math.sin(T.yaw) * T.sp * dt; T.z += Math.cos(T.yaw) * T.sp * dt; const inW = X.inLake(T.x, T.z), gh = X.groundH(T.x, T.z);
      if (inW && gh < 0.25) { T.y = X.waveH(T.x, T.z, t) - 0.06; T.wd += dt; if (T.wd > 0.05) { T.wd = 0; X.puff(X.tmp.set(T.x - Math.sin(T.yaw) * 0.7, T.y + 0.2, T.z - Math.cos(T.yaw) * 0.7), 0xffffff, 1, 0.5, 0.5, 0.7); } if (Math.random() < 0.12) X.ripple(T.x, T.z, 1.3, 0.5); }
      else { T.air = true; T.vy = 7.5; T.vx = Math.sin(T.yaw) * T.sp * 0.6; T.vz = Math.cos(T.yaw) * T.sp * 0.6; T.y = Math.max(T.y, gh) + 0.1; X.spray(X.tmp.set(T.x, 0.5, T.z), 10, 4); X.popup(X.tmp.set(T.x, 2.6, T.z), inW ? 'AIRBORNE' : 'BEACH LEAP', '#0e7fb8'); } }
    else { T.vy -= 18 * dt; T.x += T.vx * dt; T.z += T.vz * dt; T.y += T.vy * dt; if (Math.random() < 0.6) X.puff(T.m.position, 0xb8bcc4, 1, 0.4, 0.45, 0.5); }
    T.m.position.set(T.x, T.y, T.z); T.m.rotation.set(T.air ? -Math.atan2(T.vy, Math.hypot(T.vx, T.vz)) : 0, T.yaw, 0);
    let hit = Math.abs(T.x) > (X.LIM || 67) || Math.abs(T.z) > (X.LIM || 67); if (!hit) for (const o of X.props) if (!o.dead && Math.hypot(o.x - T.x, o.z - T.z) < (o.r || 1) + 0.4 && T.y < 2.2) { hit = true; if (o.kind === 'car') X.damage(o, 30, 'torpedo'); break; } if (!hit) for (const n of X.npcs) if (n.st === 'walk' && Math.hypot(n.x - T.x, n.z - T.z) < 0.9 && T.y < 2) { hit = true; break; }
    const gnd = T.air && T.vy < 0 && T.y <= X.groundH(T.x, T.z) + 0.05, wetEnd = T.air && T.vy < 0 && X.inLake(T.x, T.z) && T.y <= X.waveH(T.x, T.z, t);
    if (hit || T.life <= 0 || gnd || wetEnd) { tBlast(T.x, T.y, T.z, !hit && !gnd && X.inLake(T.x, T.z)); X.scene.remove(T.m); torps.splice(i, 1); } } }

  const specs = {
    hopper: { name: 'SPACE HOPPER', built: true, scale: 1, max: 6, rev: 2, accel: 8, turn: 3, grip: 1, jump: 0, lean: 0, r: 0.6, cam: [6, 0.3], btn: ['BELLY BOUNCE', 'ROLL', 'MEGA'], line: 'A giant bouncy ball with horns. It never stops bouncing and bowls people over. 1 BELLY BOUNCE: big squash + shockwave. Hold 2 = ROLL (fast, flattens walkers like skittles). Hold 3 to wind up, release = MEGA BOUNCE.' },
    kroo: { name: 'KANGAROO BOOTS', built: true, scale: 1, max: 11, rev: 2, accel: 10, turn: 3, grip: 1, jump: 0, lean: 0, r: 0.5, cam: [6.5, 0.3], btn: ['STOMP', 'DROP-KICK', 'BIG HOP'], line: 'Spring stilts. Hold the stick to bound: every bound in a row goes higher (up to 5). 1 STOMP down, 2 DROP-KICK in the air (dash + knocks people over), 3 BIG HOP (higher with a longer chain).' },
    jetpack: { name: 'JETPACK', built: true, fly: true, pivot: true, scale: 1, max: 12, rev: 3, accel: 9, turn: 2.6, grip: 1, jump: 0, lean: 0, r: 0.5, cam: [7.5, 0.3], btn: ['FLAMER', 'ROLL', 'THRUST'], line: 'Hold 3 to thrust up; fuel drains in the air and refills on the ground. Walk on the ground, fly anywhere. Hold 1 = FLAMETHROWER (toasts walkers, burns crates and cars). 2 BARREL ROLL in the air.' },
    hover: { name: 'HOVERBOARD', built: true, fly: true, scale: 1, max: 15, rev: 4, accel: 11, turn: 3, grip: 1, jump: 0, lean: 0.5, r: 0.6, cam: [6.5, 0.3], btn: ['LASER', 'KICKFLIP', 'HOVER JUMP'], line: 'Floats 45 cm up, glides over the lake like it is solid. 1 LASER (hold = beam), 2 KICKFLIP (+50 in the air), 3 HOVER JUMP (floaty, hold to drift down slowly).' },
    unicycle: { name: 'UNICYCLE', built: true, scale: 1, max: 7, rev: 2, accel: 6, turn: 3.2, grip: 1, jump: 0, lean: 0.4, r: 0.5, cam: [6, 0.3], btn: ['JUGGLE', 'SPIN', 'HOP'], line: 'Wobbly! Turn too hard at speed and you fall off. 1 JUGGLE: throw a juggling pin (bonks walkers, knocks crates). 2 SPIN on the spot (+30). 3 HOP.' },
    turtle: { name: 'GIANT TURTLE', built: true, scale: 1.3, max: 4, rev: 1.5, accel: 4, turn: 1.8, grip: 1, jump: 0, lean: 0, r: 1.2, cam: [8, 0.32], btn: ['SHELL SPIN', 'HIDE', 'STOMP'], line: 'Slow and unstoppable. 1 SHELL SPIN: tucks in and spins, scattering everyone. Hold 2 = HIDE in the shell (walkers clonk off it); release after a second = POP OUT shockwave. 3 slow, heavy STOMP.' },
    ostrich: { name: 'OSTRICH', built: true, scale: 1, max: 16, rev: 2, accel: 12, turn: 2.6, grip: 1, jump: 0, lean: 0.3, r: 0.7, cam: [7.5, 0.3], btn: ['PECK', 'DUST KICK', 'FLAP'], line: 'The fastest legs in the yard. 1 PECK (chain 3 for a combo), 2 DUST KICK: a cloud blasts everyone behind you over. 3 jump, hold it in the air to FLAP-GLIDE.' },
    dragon: { name: 'DRAGON HATCHLING', built: true, scale: 1.1, max: 10, rev: 2, accel: 9, turn: 2.6, grip: 1, jump: 0, lean: 0.3, r: 0.9, cam: [8, 0.32], btn: ['FIRE', 'TAIL WHIP', 'FLAP'], line: 'A baby dragon you can ride. Tap 3 to flap up (stamina refills on the ground), hold 3 to glide. Hold 1 = FIRE BREATH, 2 TAIL WHIP spin.' },
    cart: { name: 'SHOPPING CART', built: true, scale: 1, max: 7, rev: 2, accel: 8, turn: 2.8, grip: 0.8, jump: 0, lean: 0, r: 0.6, cam: [6.5, 0.3], btn: ['THROW', 'SPIN', 'HOP IN'], line: 'Push it to build speed, then 3 = HOP IN and coast. Drive into crates to load them (3 max). 1 THROW a crate, 2 drift SPIN. 3 again = hop out.' },
    hamster: { name: 'HAMSTER BALL', built: true, scale: 1, max: 11, rev: 3, accel: 9, turn: 2.6, grip: 1, jump: 0, lean: 0, r: 1.35, cam: [7.5, 0.3], btn: ['DASH', 'PINBALL', 'JUMP'], line: 'Run inside a giant see-through ball and bowl people over. 1 DASH, 2 PINBALL for 3 s (ricochet off walls, cars and crates for points), 3 JUMP.' },
    bumper: { name: 'BUMPER CAR', built: true, pivot: true, scale: 1, max: 9, rev: 5, accel: 12, turn: 3.4, grip: 0.7, jump: 0, lean: 0, r: 1.0, cam: [6.5, 0.32], btn: ['CHARGE', 'SPIN-OUT', 'HORN'], line: 'Bounces off everything with a BONK, and sends cars flying. 1 CHARGE dash. 2 SPIN-OUT (wild spin, bonks anyone close). 3 HORN: walkers nearby jump and run away.' },
    rskates: { name: 'ROCKET SKATES', built: true, scale: 1, max: 13, rev: 2, accel: 9, turn: 3, grip: 0.9, jump: 0, lean: 0.4, r: 0.5, cam: [6.5, 0.3], btn: ['KICK', '360', 'ROCKET'], line: 'Inline skates with rockets on the heels. The fox strides to skate. 1 spinning KICK, 2 360 SPIN (+40 in the air), 3 ROCKET BURST (huge speed; jumps off ramps).' },
    crane: { name: 'WRECKING CRANE', built: true, pivot: true, scale: 1.2, max: 3.5, rev: 2, accel: 3, turn: 1.4, grip: 1, jump: 0, lean: 0, r: 1.6, cam: [13, 0.38], btn: ['SWING', 'DROP', 'MAGNET'], line: 'A slow crawler crane with a wrecking ball. 1 SWING the ball round (hold to keep swinging: smashes crates, flips cars, scatters walkers). 2 DROP the ball straight down (big smash). 3 MAGNET: grab the nearest crate or car, 3 again to fling it.' },
    balloon: { name: 'HOT AIR BALLOON', built: true, fly: true, scale: 1.3, max: 5, rev: 1, accel: 2, turn: 1, grip: 1, jump: 0, lean: 0, r: 1.2, cam: [16, 0.35], btn: ['SANDBAG', 'BURNER', 'RISE'], line: 'Drift with the wind (it changes direction now and then). Hold 3 to fire the burner and rise; let go to sink slowly. 1 drop SANDBAGS (they knock over walkers), 2 BURNER BLAST (flame jet downwards). Stick steers a little.' },
    spider: { name: 'ROBOT SPIDER', built: true, pivot: true, scale: 1.7, max: 8, rev: 3, accel: 8, turn: 2.6, grip: 1, jump: 0, lean: 0, r: 1.2, cam: [9, 0.35], btn: ['WEB', 'POUNCE', 'CLIMB'], line: 'Eight clanking legs that turn on the spot. 1 WEB shot: sticks a walker in place. 2 POUNCE leap that lands with a shockwave. Hold 3 = CLIMB straight up the arena wall (let go to drop).' },
    boat: { name: 'SPEEDBOAT', built: true, water: true, scale: 1.3, max: 26, rev: 4, accel: 12, turn: 1.9, grip: 0.7, jump: 0, lean: 0.3, r: 2.0, cam: [10, 0.3], btn: ['TORPEDO', 'POWER TURN', 'NITRO'], line: 'Lives in the lake. Gets up on the plane at speed (bow lifts, rooster tail). 1 TORPEDO from the bow tubes (homes a little; leaps out onto the shore and blows up; hold 1 = SPREAD of 3). 2 POWER TURN: a 180 spin with a spray wall that soaks anyone near (air = barrel roll). 3 NITRO. Hit the floating kicker for big air.' },
  };

  const B = {
    boat() { const { root, V, s } = shell(); const hull = new THREE.Group(); s.add(hull); V.hull = hull; V.pose = 'boat';
      const DS = { side: THREE.DoubleSide }, mRed = toon('#ec3013', DS), mInk = toon('#201e1d', DS), mWh = toon('#f3f2f2', DS), N = 16, S2 = [];
      for (let i = 0; i <= N; i++) { const u = i / N, z = -2.3 + u * 4.6, q = Math.max(0, (u - 0.45) / 0.55), gw = 0.92 * Math.sqrt(Math.max(0.0016, 1 - q * q)) * (u < 0.15 ? 0.95 + u / 3 : 1), hc = gw * 0.8, yk = 0.62 * Math.pow(Math.max(0, (u - 0.5) / 0.5), 2), yc = 0.2 + 0.48 * Math.pow(q, 1.5), yg = 0.78 + 0.16 * u * u;
        S2.push({ u, z, gw, hc, yk, yc, yb: yc + 0.09, xb: hc + (gw - hc) * 0.14, yg }); }
      const pt = (q, k, sd) => k === 'K' ? [0, q.yk, q.z] : k === 'C' ? [sd * q.hc, q.yc, q.z] : k === 'B' ? [sd * q.xb, q.yb, q.z] : k === 'G' ? [sd * q.gw, q.yg, q.z] : k === 'I' ? [sd * (q.gw - 0.13), q.yg, q.z] : [0, q.yg + 0.07, q.z];
      const G3 = [[], [], []], quad = (arr, a, b, c, d, rev) => rev ? arr.push(...a, ...c, ...b, ...a, ...d, ...c) : arr.push(...a, ...b, ...c, ...a, ...c, ...d);
      const band = (arr, k1, k2, sd, i0 = 0, i1 = N) => { for (let i = i0; i < i1; i++) quad(arr, pt(S2[i], k1, sd), pt(S2[i], k2, sd), pt(S2[i + 1], k2, sd), pt(S2[i + 1], k1, sd), sd < 0); };
      for (const sd of [-1, 1]) { band(G3[0], 'K', 'C', sd); band(G3[1], 'C', 'B', sd); band(G3[2], 'B', 'G', sd); band(G3[2], 'G', 'D', sd, 9, N); band(G3[2], 'G', 'I', sd, 0, 9); }
      { const q = S2[0], ring = [pt(q, 'G', -1), pt(q, 'B', -1), pt(q, 'C', -1), pt(q, 'K', 1), pt(q, 'C', 1), pt(q, 'B', 1), pt(q, 'G', 1)], c = [0, (q.yk + q.yg) / 2, q.z]; for (let i = 0; i < ring.length - 1; i++) G3[2].push(...c, ...ring[i + 1], ...ring[i]); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute([...G3[0], ...G3[1], ...G3[2]], 3)); let o = 0; G3.forEach((a, k) => { geo.addGroup(o, a.length / 3, k); o += a.length / 3; }); geo.translate(0, -0.47, 0); geo.computeVertexNormals();
      M(geo, [mRed, mInk, mWh], 0, 0.47, 0, hull, 0.025);
      const hw = (q, y) => y <= q.yc ? q.hc * Math.max(0, (y - q.yk) / Math.max(0.01, q.yc - q.yk)) : y <= q.yb ? q.hc + (q.xb - q.hc) * (y - q.yc) / 0.09 : q.xb + (q.gw - q.xb) * Math.min(1, (y - q.yb) / (q.yg - q.yb));
      // rub rail + bow grab rails
      for (const sd of [-1, 1]) { for (let i = 0; i < N; i++) tb(V3(sd * (S2[i].gw + 0.02), S2[i].yg - 0.03, S2[i].z), V3(sd * (S2[i + 1].gw + 0.02), S2[i + 1].yg - 0.03, S2[i + 1].z), 0.035, dark(), hull, 0.004);
        for (let i = 10; i < N - 1; i++) { const a = S2[i], b = S2[i + 1]; tb(V3(sd * (a.gw - 0.1), a.yg + 0.2, a.z), V3(sd * (b.gw - 0.1), b.yg + 0.2, b.z), 0.022, alu(), hull, 0.004); if (i % 2 === 0) tb(V3(sd * (a.gw - 0.1), a.yg, a.z), V3(sd * (a.gw - 0.1), a.yg + 0.2, a.z), 0.018, alu(), hull, 0.003); } }
      tb(V3(-S2[0].gw - 0.02, S2[0].yg - 0.03, S2[0].z - 0.01), V3(S2[0].gw + 0.02, S2[0].yg - 0.03, S2[0].z - 0.01), 0.035, dark(), hull, 0.004);
      // decals: 8 roundel by the bow + 8 GATES on the topsides, tilted to the flare
      const gatesTex = (() => { const c = document.createElement('canvas'); c.width = 512; c.height = 96; const g = c.getContext('2d'); g.font = '900 70px Archivo, sans-serif'; g.textBaseline = 'middle'; g.fillStyle = '#ec3013'; g.fillText('8 GATES', 14, 52); g.fillStyle = '#201e1d'; g.fillRect(330, 28, 170, 10); g.fillRect(330, 52, 140, 10); g.fillRect(330, 76, 110, 10); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
      for (const sd of [-1, 1]) { const q = S2[4], yb = 0.47, yt = 0.68, xb = hw(q, yb), xt = hw(q, yt), gp = new THREE.Group(); gp.position.set(sd * ((xb + xt) / 2 + 0.014), (yb + yt) / 2, -1.0); gp.rotation.z = -sd * Math.atan2(xt - xb, yt - yb); hull.add(gp);
        const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 0.29), new THREE.MeshBasicMaterial({ map: gatesTex, transparent: true })); pl.rotation.y = sd * Math.PI / 2; if (sd < 0) pl.scale.x = 1; gp.add(pl);
        const q2 = S2[12], y0 = 0.6, y1 = 0.74, x0 = hw(q2, y0), x1 = hw(q2, y1), gb = new THREE.Group(); gb.position.set(sd * ((x0 + x1) / 2 + 0.015), (y0 + y1) / 2, q2.z); gb.rotation.z = -sd * Math.atan2(x1 - x0, y1 - y0); hull.add(gb); badge(0.15, gb, 0, 0, 0, sd * Math.PI / 2); }
      // cockpit: floor, side bolsters, driver seat, rear bench, console, wheel, windscreen
      M(new THREE.BoxGeometry(1.46, 0.06, 2.75), toon('#a8784c'), 0, 0.36, -0.85, hull, 0.01); for (let k = -3; k <= 3; k++) M(new THREE.BoxGeometry(0.012, 0.005, 2.7), dark(), k * 0.2, 0.395, -0.85, hull, 0);
      for (const sd of [-1, 1]) M(new THREE.BoxGeometry(0.1, 0.28, 2.2), red(), sd * 0.74, 0.62, -0.95, hull, 0.008);
      const seat = new THREE.Group(); seat.position.set(0, 0.39, -0.5); hull.add(seat); M(new THREE.CylinderGeometry(0.07, 0.09, 0.2, 10), alu(), 0, 0.1, 0, seat, 0.005); M(new THREE.BoxGeometry(0.52, 0.12, 0.46), white(), 0, 0.26, 0, seat, 0.012); M(new THREE.BoxGeometry(0.54, 0.03, 0.48), red(), 0, 0.2, 0, seat, 0); M(new THREE.BoxGeometry(0.52, 0.5, 0.1), white(), 0, 0.55, -0.22, seat, 0.012); M(new THREE.BoxGeometry(0.06, 0.48, 0.105), red(), 0, 0.55, -0.22, seat, 0); for (const sd of [-1, 1]) M(new THREE.BoxGeometry(0.08, 0.3, 0.4), white(), sd * 0.27, 0.4, 0, seat, 0.008);
      M(new THREE.BoxGeometry(1.5, 0.15, 0.5), white(), 0, 0.6, -1.85, hull, 0.012); M(new THREE.BoxGeometry(1.52, 0.03, 0.52), red(), 0, 0.53, -1.85, hull, 0); M(new THREE.BoxGeometry(1.5, 0.34, 0.1), white(), 0, 0.85, -2.15, hull, 0.012); M(new THREE.BoxGeometry(1.5, 0.22, 0.4), white(), 0, 0.46, -1.85, hull, 0);
      M(new THREE.BoxGeometry(0.64, 0.5, 0.36), white(), 0, 0.62, 0.08, hull, 0.012); const dash = M(new THREE.BoxGeometry(0.66, 0.06, 0.38), dark(), 0, 0.9, 0.06, hull, 0.008); dash.rotation.x = -0.35;
      for (const gx of [-0.16, 0.16]) { const gq = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), new THREE.MeshBasicMaterial({ color: 0xbaf2ff })); gq.position.set(gx, 0.94, 0.0); gq.rotation.x = -Math.PI / 2 - 0.35 + Math.PI / 2 - 1.2; hull.add(gq); }
      const wh = new THREE.Group(); wh.position.set(0, 1.0, -0.12); wh.rotation.x = -0.75; hull.add(wh); const whs = new THREE.Group(); wh.add(whs); V.wheel = whs; M(new THREE.TorusGeometry(0.17, 0.022, 8, 22), dark(), 0, 0, 0, whs, 0.005); for (let k = 0; k < 3; k++) { const sp = M(new THREE.BoxGeometry(0.02, 0.17, 0.02), alu(), 0, 0, 0, whs, 0); sp.rotation.z = k * Math.PI * 2 / 3; sp.position.set(Math.sin(k * Math.PI * 2 / 3) * -0.085, Math.cos(k * Math.PI * 2 / 3) * 0.085, 0); } M(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 10), red(), 0, 0, 0, whs, 0).rotation.x = Math.PI / 2; tb(V3(0, 0.88, 0.0), V3(0, 1.0, -0.1), 0.025, alu(), hull, 0);
      { const sg = new THREE.CylinderGeometry(0.95, 0.95, 0.38, 28, 1, true, -1.0, 2.0), scr = new THREE.Mesh(sg, new THREE.MeshToonMaterial({ color: 0x7dd3fc, gradientMap: X.grad, transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false })); scr.position.set(0, 1.04, -0.55); hull.add(scr);
        const arc = []; for (let k = 0; k <= 16; k++) { const a = -1 + k / 8; arc.push(V3(Math.sin(a) * 0.95, 1.23, -0.55 + Math.cos(a) * 0.95)); } for (let k = 0; k < 16; k++) tb(arc[k], arc[k + 1], 0.02, alu(), hull, 0); for (const a of [-1, 0, 1]) tb(V3(Math.sin(a) * 0.95, 0.85, -0.55 + Math.cos(a) * 0.95), V3(Math.sin(a) * 0.95, 1.23, -0.55 + Math.cos(a) * 0.95), 0.018, alu(), hull, 0); }
      // torpedo tubes on the bow + nav lights
      V.tubeGlow = []; for (const sd of [-1, 1]) { const q = S2[11], x = sd * (hw(q, 0.62) - 0.02), tu = M(new THREE.CylinderGeometry(0.1, 0.1, 0.7, 12), dark(), x, 0.6, q.z, hull, 0.008); tu.rotation.x = Math.PI / 2; M(new THREE.TorusGeometry(0.1, 0.022, 6, 14), red(), x, 0.6, q.z + 0.35, hull, 0); V.tubeGlow.push(glow(0xff3b1f, 0.01, hull, x, 0.6, q.z + 0.4)); }
      { const q = S2[14]; for (const sd of [-1, 1]) { M(new THREE.SphereGeometry(0.04, 8, 6), toon(sd < 0 ? '#ec3013' : '#22c55e'), sd * (q.gw - 0.03), q.yg + 0.06, q.z, hull, 0); glow(sd < 0 ? 0xff3b1f : 0x22c55e, 0.4, hull, sd * (q.gw - 0.03), q.yg + 0.06, q.z); } }
      // stern pole: white light + pennant
      tb(V3(0.62, 0.8, -2.15), V3(0.62, 1.75, -2.15), 0.02, dark(), hull, 0.003); M(new THREE.SphereGeometry(0.045, 8, 6), white(), 0.62, 1.78, -2.15, hull, 0.004); glow(0xffffff, 0.35, hull, 0.62, 1.78, -2.15);
      { const fl = new THREE.Group(); fl.position.set(0.62, 1.6, -2.15); hull.add(fl); V.flag = fl; const pm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.3), new THREE.MeshBasicMaterial({ color: 0xec3013, side: THREE.DoubleSide })); pm.rotation.y = Math.PI / 2; pm.position.z = -0.25; fl.add(pm); badge(0.09, fl, 0.003, 0, -0.25, Math.PI / 2); badge(0.09, fl, -0.003, 0, -0.25, -Math.PI / 2); }
      // outboard: steering yaw → trim tilt → cowl, leg, plate, prop
      const mY = new THREE.Group(); mY.position.set(0, 0.66, -2.42); hull.add(mY); V.steer.push(mY); const mT = new THREE.Group(); mY.add(mT); V.trim = mT;
      M(new THREE.BoxGeometry(0.2, 0.2, 0.16), dark(), 0, 0.05, 0.1, mT, 0.006); M(new THREE.BoxGeometry(0.5, 0.52, 0.56), red(), 0, 0.36, -0.12, mT, 0.014); M(new THREE.BoxGeometry(0.52, 0.12, 0.58), white(), 0, 0.66, -0.12, mT, 0.012); M(new THREE.BoxGeometry(0.505, 0.04, 0.565), dark(), 0, 0.2, -0.12, mT, 0); for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(0.01, 0.03, 0.3), dark(), sd * 0.252, 0.32 + k * 0.07, -0.12, mT, 0); badge(0.13, mT, 0, 0.4, -0.405, Math.PI);
      M(new THREE.BoxGeometry(0.15, 0.95, 0.22), dark(), 0, -0.3, -0.12, mT, 0.008); M(new THREE.BoxGeometry(0.36, 0.03, 0.42), dark(), 0, -0.6, -0.12, mT, 0.005); const gc = M(new THREE.CylinderGeometry(0.075, 0.06, 0.4, 10), dark(), 0, -0.76, -0.12, mT, 0.005); gc.rotation.x = Math.PI / 2; M(new THREE.BoxGeometry(0.03, 0.16, 0.14), dark(), 0, -0.86, -0.06, mT, 0.004);
      const prop = new THREE.Group(); prop.position.set(0, -0.76, -0.36); mT.add(prop); V.prop = prop; for (let k = 0; k < 3; k++) { const bl = M(new THREE.BoxGeometry(0.07, 0.2, 0.015), alu(), 0, 0, 0, prop, 0.003); bl.rotation.z = k * Math.PI * 2 / 3; bl.position.set(-Math.sin(k * Math.PI * 2 / 3) * 0.11, Math.cos(k * Math.PI * 2 / 3) * 0.11, 0); bl.rotation.y = 0.5; }
      tb(V3(0, 0.4, -1.45), V3(0, 1.25, -1.45), 0.035, alu(), hull, 0.005); M(new THREE.SphereGeometry(0.06, 10, 8), red(), 0, 1.27, -1.45, hull, 0.006); V.tow = new THREE.Object3D(); V.tow.position.set(0, 1.27, -1.45); hull.add(V.tow);
      V.jet = new THREE.Object3D(); V.jet.position.set(0, -0.1, -2.75); hull.add(V.jet); V.bow = new THREE.Object3D(); V.bow.position.set(0, 0.3, 1.6); hull.add(V.bow);
      V.seatLocal = V3(0, 0.42, -0.5); return root; },
    hopper() { const { root, V, s } = shell(); const ball = new THREE.Group(); ball.position.y = 0.48; s.add(ball); V.ball = ball;
      const c = document.createElement('canvas'); c.width = 512; c.height = 256; { const g = c.getContext('2d'); g.fillStyle = '#ff7a1a'; g.fillRect(0, 0, 512, 256); g.fillStyle = '#ffb066'; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(i * 64 + 32, 128, 10, 120, 0, 0, 7); g.globalAlpha = 0.25; g.fill(); } g.globalAlpha = 1;
        const fx = 128; g.fillStyle = '#fff'; g.strokeStyle = '#201e1d'; g.lineWidth = 6; for (const sx of [-1, 1]) { g.beginPath(); g.ellipse(fx + sx * 34, 90, 22, 28, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#201e1d'; g.beginPath(); g.arc(fx + sx * 30, 96, 10, 0, 7); g.fill(); g.fillStyle = '#fff'; }
        g.beginPath(); g.arc(fx, 130, 52, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke(); g.fillStyle = '#201e1d'; g.beginPath(); g.ellipse(fx, 120, 12, 8, 0, 0, 7); g.fill(); }
      const tex = new THREE.CanvasTexture(c); tex.offset.x = 0.0;
      const bm = M(new THREE.SphereGeometry(0.48, 28, 20), new THREE.MeshToonMaterial({ map: tex, gradientMap: X.grad }), 0, 0, 0, ball, 0.025, 0.48); bm.rotation.y = -Math.PI / 2;
      for (const sx of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.035, 8, 14, Math.PI * 1.4), toon('#ff7a1a')); h.position.set(sx * 0.13, 0.46, 0.2); h.rotation.set(0, Math.PI / 2, -Math.PI / 2 + sx * 0.3); ball.add(h); M(new THREE.SphereGeometry(0.05, 10, 8), toon('#ff7a1a'), sx * 0.13, 0.56, 0.24, ball, 0.008); }
      V.seatLocal = V3(0, 0.36, -0.12); V.pose = 'hopper'; return root; },
    kroo() { const { root, V, s } = shell(); V.blades = [];
      for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 0.13, 0, 0); s.add(g); V.blades.push(g);
        const pts = [V3(0, 0.62, 0.02), V3(0, 0.5, -0.16), V3(0, 0.3, -0.2), V3(0, 0.14, -0.08), V3(0, 0.05, 0.1)]; const cur = new THREE.CatmullRomCurve3(pts);
        const bl = new THREE.Mesh(new THREE.TubeGeometry(cur, 30, 0.03, 6), red()); bl.scale.x = 2.2; bl.castShadow = true; g.add(bl);
        M(new THREE.BoxGeometry(0.1, 0.035, 0.22), dark(), 0, 0.03, 0.1, g, 0.006); M(new THREE.BoxGeometry(0.12, 0.05, 0.2), dark(), 0, 0.62, 0.04, g, 0.006);
        M(new THREE.BoxGeometry(0.13, 0.12, 0.05), gold(), 0, 0.82, -0.04, g, 0.004); tb(V3(0, 0.62, 0.0), V3(0, 0.85, -0.03), 0.02, alu(), g);
        M(new THREE.BoxGeometry(0.14, 0.04, 0.09), dark(), 0, 0.88, -0.01, g, 0.004); }
      V.seatLocal = V3(0, 0.6, -0.03); V.pose = 'kroo'; return root; },
    jetpack() { const { root, V, s } = shell(); const pk = new THREE.Group(); pk.position.set(0, 0.98, -0.3); s.add(pk); V.pack = pk;
      M(new THREE.BoxGeometry(0.42, 0.5, 0.18), dark(), 0, 0, 0, pk, 0.012);
      for (const sx of [-1, 1]) { M(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 14), red(), sx * 0.16, 0.02, -0.12, pk, 0.012, 0.1); M(new THREE.SphereGeometry(0.1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), red(), sx * 0.16, 0.3, -0.12, pk, 0.008, 0.1); M(new THREE.CylinderGeometry(0.06, 0.09, 0.14, 12), alu(), sx * 0.16, -0.32, -0.12, pk, 0.008); }
      badge(0.1, pk, 0, 0.08, 0.091 - 0.18, Math.PI); for (const sx of [-1, 1]) tb(V3(sx * 0.15, 0.22, 0.1), V3(sx * 0.17, -0.2, 0.1), 0.02, dark(), pk);
      V.flames = [-1, 1].map(sx => { const g = new THREE.Group(); g.position.set(sx * 0.16, -0.42, -0.12); pk.add(g); const a = glow(0xffd23a, 0.5, g, 0, 0, 0), b = glow(0xff5a1a, 0.8, g, 0, -0.35, 0); return { g, a, b }; });
      const mz = new THREE.Object3D(); mz.position.set(0, 1.0, 0.45); s.add(mz); V.muzzle = mz;
      V.seatLocal = V3(0, 0, 0); V.pose = 'jet'; return root; },
    hover() { const { root, V, s } = shell(); const deck = new THREE.Group(); s.add(deck); V.deck = deck;
      const sh = new THREE.Shape(); sh.absarc(0, 0.38, 0.17, 0, Math.PI); sh.absarc(0, -0.38, 0.17, Math.PI, Math.PI * 2);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2 }); g.rotateX(-Math.PI / 2);
      M(g, white(), 0, 0, 0, deck, 0.012); const top = M(new THREE.ExtrudeGeometry(sh, { depth: 0.01, bevelEnabled: false }).rotateX(-Math.PI / 2).scale(0.9, 1, 0.92), red(), 0, 0.075, 0, deck, 0);
      badge(0.1, deck, 0, 0.087, 0, 0, -Math.PI / 2);
      V.pads = [-0.36, 0.36].map(z => { M(new THREE.CylinderGeometry(0.13, 0.15, 0.06, 18), dark(), 0, -0.03, z, deck, 0.006); M(new THREE.TorusGeometry(0.1, 0.02, 6, 18), blue(), 0, -0.065, z, deck, 0).rotation.x = Math.PI / 2; return glow(0x38bdf8, 0.6, deck, 0, -0.12, z); });
      const mz = new THREE.Object3D(); mz.position.set(0, 1.05, 0.4); s.add(mz); V.muzzle = mz;
      V.seatLocal = V3(0, 0.08, 0); V.pose = 'hover'; return root; },
    unicycle() { const { root, V, s } = shell(); const R0 = 0.32; const wg = new THREE.Group(); wg.position.y = R0; s.add(wg); const sp = new THREE.Group(); wg.add(sp);
      const t = M(new THREE.TorusGeometry(R0 - 0.035, 0.04, 8, 26), toon('#2a2826'), 0, 0, 0, sp, 0.01); t.rotation.y = Math.PI / 2;
      const rim = M(new THREE.TorusGeometry(R0 - 0.07, 0.012, 6, 26), red(), 0, 0, 0, sp, 0); rim.rotation.y = Math.PI / 2;
      for (let i = 0; i < 12; i++) { const q = i / 12 * Math.PI * 2; const k = M(new THREE.CylinderGeometry(0.004, 0.004, R0 - 0.07, 4), alu(), 0, Math.cos(q) * (R0 - 0.07) / 2, Math.sin(q) * (R0 - 0.07) / 2, sp, 0); k.rotation.x = q; }
      V.wheels.push({ g: wg, sp, r: R0, side: 0 });
      const crank = new THREE.Group(); wg.add(crank); V.crank = crank; for (const sx of [-1, 1]) { const arm = new THREE.Group(); arm.position.x = sx * 0.07; arm.rotation.x = sx > 0 ? 0 : Math.PI; crank.add(arm); M(new THREE.BoxGeometry(0.02, 0.14, 0.03), alu(), 0, -0.07, 0, arm, 0.004); M(new THREE.BoxGeometry(0.08, 0.02, 0.06), dark(), sx * 0.04, -0.14, 0, arm, 0.004); }
      for (const sx of [-1, 1]) tb(V3(sx * 0.055, R0, 0), V3(sx * 0.03, R0 + 0.3, 0), 0.016, red(), s);
      tb(V3(0, R0 + 0.3, 0), V3(0, 1.0, 0), 0.02, alu(), s); M(new THREE.BoxGeometry(0.13, 0.05, 0.28), dark(), 0, 1.02, 0, s, 0.008); M(new THREE.BoxGeometry(0.06, 0.04, 0.05), red(), 0, 1.03, 0.15, s, 0.004);
      V.seatLocal = V3(0, 0.38, -0.02); V.pose = 'uni'; return root; },
    turtle() { const { root, V, s } = shell(); const tb2 = new THREE.Group(); s.add(tb2); V.tb = tb2;
      const c = document.createElement('canvas'); c.width = 512; c.height = 256; { const g = c.getContext('2d'); g.fillStyle = '#3f7d3a'; g.fillRect(0, 0, 512, 256); for (let r = 0; r < 5; r++) for (let k = 0; k < 9; k++) { const x = k * 60 + (r % 2) * 30, y = r * 56 + 20; g.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); } g.closePath(); g.fillStyle = (r + k) % 3 ? '#4f9446' : '#5aa34f'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#24502a'; g.stroke(); } }
      const sh = M(new THREE.SphereGeometry(0.85, 22, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshToonMaterial({ map: new THREE.CanvasTexture(c), gradientMap: X.grad }), 0, 0.35, 0, tb2, 0.03); sh.scale.set(1, 0.65, 1.25);
      const rim = M(new THREE.TorusGeometry(0.85, 0.08, 8, 28), toon('#c9b27a'), 0, 0.35, 0, tb2, 0.012); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1.25, 1);
      M(new THREE.CylinderGeometry(0.8, 0.7, 0.18, 22), toon('#d9c38a'), 0, 0.26, 0, tb2, 0.015).scale.z = 1.22;
      const skin = toon('#7fb069'); const head = new THREE.Group(); head.position.set(0, 0.38, 1.12); tb2.add(head); V.head = head;
      M(new THREE.CylinderGeometry(0.13, 0.16, 0.3, 12), skin, 0, -0.02, -0.12, head, 0.01).rotation.x = Math.PI / 2 - 0.3;
      const hd = M(new THREE.SphereGeometry(0.22, 16, 12), skin, 0, 0.06, 0.08, head, 0.015, 0.22); hd.scale.set(1, 0.85, 1.15);
      for (const sx of [-1, 1]) { M(new THREE.SphereGeometry(0.06, 10, 8), white(), sx * 0.11, 0.14, 0.2, head, 0.006); M(new THREE.SphereGeometry(0.032, 8, 6), dark(), sx * 0.12, 0.15, 0.25, head, 0); }
      M(new THREE.BoxGeometry(0.16, 0.015, 0.02), dark(), 0, 0.0, 0.32, head, 0);
      V.legs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const g = new THREE.Group(); g.position.set(sx * 0.62, 0.24, sz * 0.72); tb2.add(g); const f = M(new THREE.SphereGeometry(0.2, 12, 8), skin, sx * 0.08, -0.08, sz * 0.05, g, 0.012, 0.2); f.scale.set(1.1, 0.7, 1.5); return g; });
      const tail = M(new THREE.ConeGeometry(0.08, 0.3, 8), skin, 0, 0.26, -1.15, tb2, 0.008); tail.rotation.x = -Math.PI / 2 - 0.3;
      V.seatLocal = V3(0, 0.3, -0.05); V.seatParent = tb2; V.pose = 'turtle'; return root; },
    ostrich() { const { root, V, s } = shell(); const feather = toon('#2a2420'), pink = toon('#f2a7a0'), orange = toon('#f59e0b');
      const bd = new THREE.Group(); bd.position.y = 1.15; s.add(bd); V.obody = bd;
      M(new THREE.SphereGeometry(0.5, 18, 12), feather, 0, 0, 0, bd, 0.025, 0.5).scale.set(0.8, 0.7, 1.1);
      for (let i = 0; i < 5; i++) M(new THREE.SphereGeometry(0.14, 10, 8), white(), (i - 2) * 0.08, 0.12 + (i % 2) * 0.05, -0.55 - Math.abs(i - 2) * 0.03, bd, 0.01, 0.14);
      V.wings = [-1, 1].map(sx => { const g = new THREE.Group(); g.position.set(sx * 0.36, 0.08, 0.05); bd.add(g); const w = M(new THREE.SphereGeometry(0.3, 12, 8), feather, sx * 0.08, 0, -0.05, g, 0.012, 0.3); w.scale.set(0.35, 0.6, 1.1); M(new THREE.SphereGeometry(0.1, 8, 6), white(), sx * 0.12, -0.08, -0.32, g, 0.006); return g; });
      const nk = new THREE.Group(); nk.position.set(0, 1.35, 0.42); s.add(nk); V.neck = nk;
      tb(V3(0, 0, 0), V3(0, 0.72, 0.2), 0.065, pink, nk); const hd = new THREE.Group(); hd.position.set(0, 0.78, 0.22); nk.add(hd);
      M(new THREE.SphereGeometry(0.13, 14, 10), pink, 0, 0, 0, hd, 0.01, 0.13).scale.set(0.9, 0.85, 1.1);
      const bk = M(new THREE.ConeGeometry(0.05, 0.18, 8), orange, 0, -0.02, 0.17, hd, 0.006); bk.rotation.x = Math.PI / 2; bk.scale.set(1.3, 1, 0.6);
      for (const sx of [-1, 1]) { M(new THREE.SphereGeometry(0.045, 8, 6), white(), sx * 0.08, 0.03, 0.06, hd, 0.005); M(new THREE.SphereGeometry(0.025, 6, 6), dark(), sx * 0.095, 0.035, 0.085, hd, 0); }
      V.olegs = [-1, 1].map(sx => { const g = new THREE.Group(); g.position.set(sx * 0.17, 1.0, 0); s.add(g); tb(V3(0, 0, 0), V3(0, -0.5, 0.06), 0.06, pink, g); tb(V3(0, -0.5, 0.06), V3(0, -0.97, -0.04), 0.035, pink, g); M(new THREE.BoxGeometry(0.1, 0.04, 0.2), pink, 0, -0.98, 0.04, g, 0.005); return g; });
      V.seatLocal = V3(0, 0.88, -0.12); V.pose = 'ostrich'; return root; },
    dragon() { const { root, V, s } = shell(); const sc = toon('#d9381e'), bel = toon('#f2b84b'), wingM = toon('#8a1c10');
      const bd = new THREE.Group(); bd.position.y = 0.75; s.add(bd); V.dbody = bd;
      M(new THREE.SphereGeometry(0.5, 18, 12), sc, 0, 0, 0, bd, 0.025, 0.5).scale.set(1.05, 0.95, 1.7);
      M(new THREE.SphereGeometry(0.45, 16, 10), bel, 0, -0.1, 0.1, bd, 0.012, 0.45).scale.set(0.85, 0.75, 1.5);
      for (let i = 0; i < 5; i++) M(new THREE.ConeGeometry(0.06, 0.16, 6), bel, 0, 0.45, -0.55 + i * 0.12 - 0.2, bd, 0.006);
      tb(V3(0, 0.95, 0.6), V3(0, 1.35, 0.95), 0.15, sc, s, 0.012);
      const hd = new THREE.Group(); hd.position.set(0, 1.45, 1.05); s.add(hd); V.dhead = hd;
      M(new THREE.SphereGeometry(0.24, 16, 12), sc, 0, 0, 0, hd, 0.015, 0.24).scale.set(1, 0.85, 1.2);
      M(new THREE.BoxGeometry(0.26, 0.16, 0.26), sc, 0, -0.05, 0.25, hd, 0.012); M(new THREE.BoxGeometry(0.24, 0.05, 0.24), bel, 0, -0.13, 0.25, hd, 0.006);
      for (const sx of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.05, 0.25, 8), toon('#f3e6c4'), sx * 0.12, 0.2, -0.1, hd, 0.006); h.rotation.x = -0.7; M(new THREE.SphereGeometry(0.06, 10, 8), toon('#ffd23a'), sx * 0.13, 0.06, 0.15, hd, 0.006); M(new THREE.BoxGeometry(0.015, 0.07, 0.02), dark(), sx * 0.14, 0.06, 0.2, hd, 0); M(new THREE.SphereGeometry(0.02, 6, 4), dark(), sx * 0.07, -0.02, 0.38, hd, 0); }
      const mouth = new THREE.Object3D(); mouth.position.set(0, -0.05, 0.42); hd.add(mouth); V.mouth = mouth;
      const wsh = new THREE.Shape([new THREE.Vector2(0, 0.25), new THREE.Vector2(1.2, 0.45), new THREE.Vector2(1.05, -0.2), new THREE.Vector2(0.75, -0.05), new THREE.Vector2(0.55, -0.4), new THREE.Vector2(0.35, -0.15), new THREE.Vector2(0, -0.3)]);
      const wg = new THREE.ExtrudeGeometry(wsh, { depth: 0.02, bevelEnabled: false }); wg.rotateX(-Math.PI / 2);
      V.dwings = [-1, 1].map(sx => { const g = new THREE.Group(); g.position.set(sx * 0.38, 1.1, 0.15); g.scale.x = sx; s.add(g); const m = M(wg, wingM, 0, 0, 0, g, 0.012); m.material = m.material.clone(); m.material.side = THREE.DoubleSide; tb(V3(0, 0.02, -0.25), V3(1.2, 0.02, -0.45), 0.03, sc, g); return g; });
      const tail = new THREE.Group(); tail.position.set(0, 0.8, -0.8); s.add(tail); V.dtail = tail; let p = V3(0, 0, 0); const segs = [V3(0, -0.1, -0.35), V3(0, -0.2, -0.7), V3(0, -0.25, -1.05)]; segs.forEach((q, i) => { tb(p, q, 0.13 - i * 0.035, sc, tail, 0.01); p = q; });
      const spade = M(new THREE.ConeGeometry(0.14, 0.3, 4), bel, 0, -0.25, -1.2, tail, 0.008); spade.rotation.x = -Math.PI / 2; spade.scale.set(1, 1, 0.3);
      V.dlegs = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => { const g = new THREE.Group(); g.position.set(sx * 0.32, 0.55, sz * 0.45); s.add(g); tb(V3(0, 0, 0), V3(0, -0.5, 0.05), 0.08, sc, g); M(new THREE.BoxGeometry(0.14, 0.06, 0.2), sc, 0, -0.52, 0.08, g, 0.006); return g; });
      V.seatLocal = V3(0, 0.62, -0.1); V.pose = 'dragon'; return root; },
    cart() { const { root, V, s } = shell(); const W2 = 0.3, Lb = 0.45, y0 = 0.42, y1 = 0.92, wire = new THREE.LineBasicMaterial({ color: 0x8a93a3 }), pts = [];
      const corner = (sx, sz, y) => V3(sx * (W2 + (y - y0) * 0.08), y, sz * (Lb + (y - y0) * 0.12));
      for (const y of [y0, y1]) for (const [a, b2] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) tb(corner(...a, y), corner(...b2, y), 0.014, alu(), s, 0.004);
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) tb(corner(sx, sz, y0), corner(sx, sz, y1), 0.014, alu(), s, 0.004);
      for (let k = 1; k < 8; k++) { const t = k / 8; for (const sx of [-1, 1]) { const a = corner(sx, -1, y0).lerp(corner(sx, 1, y0), t), b2 = corner(sx, -1, y1).lerp(corner(sx, 1, y1), t); pts.push(a.x, a.y, a.z, b2.x, b2.y, b2.z); } }
      for (let k = 1; k < 5; k++) { const t = k / 5; for (const sz of [-1, 1]) { const a = corner(-1, sz, y0).lerp(corner(1, sz, y0), t), b2 = corner(-1, sz, y1).lerp(corner(1, sz, y1), t); pts.push(a.x, a.y, a.z, b2.x, b2.y, b2.z); } }
      for (let k = 1; k < 3; k++) { const y = y0 + (y1 - y0) * k / 3; for (const [a, b2] of [[[-1, -1], [1, -1]], [[1, -1], [1, 1]], [[1, 1], [-1, 1]], [[-1, 1], [-1, -1]]]) { const p = corner(...a, y), q = corner(...b2, y); pts.push(p.x, p.y, p.z, q.x, q.y, q.z); } }
      const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); s.add(new THREE.LineSegments(lg, wire));
      M(new THREE.BoxGeometry(W2 * 2, 0.02, Lb * 2), toon('#9aa3b2'), 0, y0, 0, s, 0.004);
      for (const sx of [-1, 1]) for (const sz of [-1, 1]) tb(V3(sx * 0.26, 0.12, sz * 0.38), V3(sx * W2, y0, sz * Lb), 0.016, alu(), s, 0.004);
      tb(V3(-0.32, 1.0, -0.62), V3(0.32, 1.0, -0.62), 0.03, red(), s, 0.006); for (const sx of [-1, 1]) tb(V3(sx * 0.32, 1.0, -0.62), corner(sx, -1, y1), 0.014, alu(), s, 0.004);
      V.casters = [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => { const g = new THREE.Group(); g.position.set(sx * 0.26, 0.07, sz * 0.38); s.add(g); M(new THREE.CylinderGeometry(0.065, 0.065, 0.04, 12), dark(), 0, 0, 0, g, 0.004).rotation.z = Math.PI / 2; return g; });
      badge(0.07, s, 0, 0.7, corner(0, 1, 0.7).z + 0.01);
      V.cargo = [0, 1, 2].map(i => { const m = M(new THREE.BoxGeometry(0.34, 0.26, 0.3), toon('#8a5a2e'), 0, y0 + 0.14 + (i === 2 ? 0.26 : 0), i === 1 ? -0.18 : 0.18, s, 0.008); m.visible = false; return m; });
      V.seatLocal = V3(0, 0, -0.9); V.pose = 'cart'; return root; },
    hamster() { const { root, V, s } = shell(); const ball = new THREE.Group(); ball.position.y = 1.35; ball.scale.setScalar(1.35); s.add(ball); V.hball = ball;
      const gl = new THREE.Mesh(new THREE.SphereGeometry(1.0, 28, 18), new THREE.MeshToonMaterial({ color: 0xbfe6f5, gradientMap: X.grad, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide })); ball.add(gl);
      for (const [rx, rz, c] of [[0, 0, '#ec3013'], [Math.PI / 2, 0, '#f3f2f2'], [0, Math.PI / 2, '#f3f2f2']]) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.025, 6, 48), toon(c)); r.rotation.set(rx, 0, rz); ball.add(r); }
      for (const sx of [-1, 1]) { const cap = M(new THREE.CylinderGeometry(0.16, 0.16, 0.04, 18), red(), sx * 0.99, 0, 0, ball, 0.006); cap.rotation.z = Math.PI / 2; badge(0.12, ball, sx * 1.015, 0, 0, sx * Math.PI / 2); }
      for (let i = 0; i < 6; i++) { const q = i / 6 * Math.PI * 2; M(new THREE.CircleGeometry(0.06, 10), new THREE.MeshBasicMaterial({ color: 0x201e1d, side: THREE.DoubleSide }), 0, Math.cos(q) * 0.999, Math.sin(q) * 0.999, ball, 0).lookAt(0, 0, 0); }
      V.seatLocal = V3(0, 0.04, 0); V.pose = 'hamster'; return root; },
    bumper() { const { root, V, s } = shell(); const bd = new THREE.Group(); s.add(bd); V.bb = bd;
      const sh = new THREE.Shape(); sh.absarc(-0.3, 0.45, 0.35, Math.PI / 2, Math.PI); sh.absarc(-0.3, -0.45, 0.35, Math.PI, Math.PI * 1.5); sh.absarc(0.3, -0.45, 0.35, -Math.PI / 2, 0); sh.absarc(0.3, 0.45, 0.35, 0, Math.PI / 2);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3 }); g.rotateX(-Math.PI / 2);
      M(g, toon('#38bdf8'), 0, 0.12, 0, bd, 0.02); const rub = new THREE.ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.12, bevelSegments: 3 }); rub.rotateX(-Math.PI / 2); M(rub, toon('#2a2826'), 0, 0.05, 0, bd, 0.015);
      M(new THREE.BoxGeometry(0.5, 0.36, 0.12), toon('#0e7fb8'), 0, 0.68, -0.38, bd, 0.012); M(new THREE.BoxGeometry(0.52, 0.12, 0.55), toon('#0e7fb8'), 0, 0.46, -0.12, bd, 0.012);
      const st = tb(V3(0, 0.5, 0.35), V3(0, 0.78, 0.18), 0.02, dark(), bd); const wh = M(new THREE.TorusGeometry(0.13, 0.025, 6, 16), dark(), 0, 0.8, 0.17, bd, 0.004); wh.rotation.x = -0.9;
      badge(0.14, bd, 0, 0.45, 0.82, 0, 0); for (const sx of [-1, 1]) badge(0.12, bd, sx * 0.71, 0.32, 0, sx * Math.PI / 2);
      tb(V3(0, 0.55, -0.5), V3(0, 2.6, -0.5), 0.015, alu(), bd); M(new THREE.SphereGeometry(0.05, 8, 6), toon('#ffd23a'), 0, 2.62, -0.5, bd, 0); V.spark = glow(0xffd23a, 0.4, bd, 0, 2.62, -0.5);
      V.seatLocal = V3(0, 0.08, -0.1); V.pose = 'bumper'; return root; },
    rskates() { const { root, V, s } = shell(); V.skates = [-1, 1].map(sx => { const g = new THREE.Group(); g.position.set(sx * 0.13, 0, 0); s.add(g);
        M(new THREE.BoxGeometry(0.13, 0.16, 0.26), red(), 0, 0.17, 0.02, g, 0.008); M(new THREE.BoxGeometry(0.12, 0.05, 0.3), dark(), 0, 0.08, 0.02, g, 0.006); M(new THREE.BoxGeometry(0.11, 0.03, 0.06), white(), 0, 0.26, 0.1, g, 0);
        for (let i = 0; i < 4; i++) M(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 10), toon('#ffd23a'), 0, 0.035, -0.11 + i * 0.075, g, 0.003).rotation.z = Math.PI / 2;
        M(new THREE.CylinderGeometry(0.04, 0.05, 0.16, 10), alu(), 0, 0.18, -0.17, g, 0.006).rotation.x = Math.PI / 2; const fl = glow(0xff7a1a, 0.01, g, 0, 0.18, -0.3); return { g, fl }; });
      V.seatLocal = V3(0, 0.1, 0); V.pose = 'rskate'; return root; },
    crane() { const { root, V, s } = shell(); const yel = toon('#f2b01e');
      for (const sx of [-1, 1]) { M(new THREE.BoxGeometry(0.5, 0.5, 2.4), dark(), sx * 0.85, 0.25, 0, s, 0.02); for (let i = 0; i < 4; i++) M(new THREE.CylinderGeometry(0.2, 0.2, 0.52, 12), toon('#3a3836'), sx * 0.85, 0.25, -0.9 + i * 0.6, s, 0).rotation.z = Math.PI / 2; }
      const turn = new THREE.Group(); turn.position.y = 0.55; s.add(turn); V.turn = turn;
      M(new THREE.BoxGeometry(1.8, 0.7, 2.0), yel, 0, 0.35, -0.2, turn, 0.025); M(new THREE.BoxGeometry(0.9, 0.9, 0.9), yel, -0.4, 1.15, 0.45, turn, 0.02); M(new THREE.BoxGeometry(0.8, 0.6, 0.02), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.5 }), -0.4, 1.25, 0.91, turn, 0);
      M(new THREE.BoxGeometry(1.4, 0.5, 0.6), dark(), 0, 0.95, -1.0, turn, 0.015); badge(0.25, turn, 0.91, 0.35, -0.2, Math.PI / 2);
      const boom = new THREE.Group(); boom.position.set(0.35, 0.9, 0.2); boom.rotation.x = -0.75; turn.add(boom); V.boom = boom; const BL = 5.2;
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) tb(V3(sx * 0.18, sy * 0.15, 0), V3(sx * 0.06, sy * 0.05, BL), 0.035, yel, boom, 0.006);
      for (let i = 0; i < 9; i++) { const z = i / 9 * BL, w = 0.18 - z / BL * 0.12; tb(V3(-w, 0.15 - z / BL * 0.1, z), V3(w, -(0.15 - z / BL * 0.1), z + BL / 18), 0.015, yel, boom, 0); }
      const tip = new THREE.Object3D(); tip.position.set(0, 0, BL); boom.add(tip); V.tip = tip;
      const ball = new THREE.Group(); s.add(ball); V.wball = ball; M(new THREE.SphereGeometry(0.55, 20, 14), toon('#3a3836'), 0, 0, 0, ball, 0.025, 0.55); M(new THREE.CylinderGeometry(0.1, 0.1, 0.2, 10), dark(), 0, 0.6, 0, ball, 0.008);
      const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)); V.chain = new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0x201e1d })); V.chain.frustumCulled = false; s.add(V.chain);
      V.seatLocal = V3(-0.4, 1.0, 0.45); V.seatParent = turn; V.pose = 'crane'; return root; },
    balloon() { const { root, V, s } = shell(); const env = new THREE.Group(); env.position.y = 4.2; s.add(env); V.env = env;
      const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16, a = t * Math.PI; pts.push(new THREE.Vector2(Math.sin(a) * 1.9 * (t < 0.5 ? 1 : 1 - (t - 0.5) * 1.1) + 0.0, -Math.cos(a) * 2.1)); } pts[pts.length - 1].x = 0.5; pts.push(new THREE.Vector2(0.42, 2.5));
      const c = document.createElement('canvas'); c.width = 512; c.height = 256; { const g = c.getContext('2d'); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#f3f2f2' : '#ec3013'; g.fillRect(i * 512 / 12, 0, 512 / 12 + 1, 256); } g.fillStyle = '#0e7fb8'; g.fillRect(0, 118, 512, 22); for (const x of [128, 384]) { g.fillStyle = '#f3f2f2'; g.beginPath(); g.arc(x, 128, 40, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#201e1d'; g.stroke(); g.fillStyle = '#201e1d'; g.font = '900 60px Archivo, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('8', x, 132); } }
      const eg = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p.x, -p.y)), 24); const em = new THREE.Mesh(eg, new THREE.MeshToonMaterial({ map: new THREE.CanvasTexture(c), gradientMap: X.grad, side: THREE.DoubleSide })); em.castShadow = true; env.add(em);
      const bs = new THREE.Group(); s.add(bs); M(new THREE.BoxGeometry(1.0, 0.7, 1.0), toon('#a0703e'), 0, 0.35, 0, bs, 0.02); M(new THREE.BoxGeometry(1.06, 0.1, 1.06), toon('#7a4f28'), 0, 0.72, 0, bs, 0.008);
      for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) tb(V3(sx * 0.48, 0.75, sz * 0.48), V3(sx * 0.42, 1.9 + 0.6, sz * 0.42), 0.015, dark(), s, 0);
      M(new THREE.BoxGeometry(0.5, 0.18, 0.5), alu(), 0, 2.35, 0, s, 0.008); V.flame = glow(0xff9a1a, 0.01, s, 0, 2.6, 0); V.flame2 = glow(0xffd23a, 0.01, s, 0, 2.9, 0);
      V.bags = []; for (const [sx, sz] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const m = M(new THREE.SphereGeometry(0.13, 10, 8), toon('#c9b27a'), sx * 0.58, 0.45, sz * 0.58, s, 0.008); m.scale.y = 1.3; V.bags.push(m); }
      V.seatLocal = V3(0, 0.1, 0); V.pose = 'balloon'; return root; },
    spider() { const { root, V, s } = shell(); const gm = toon('#64748b'), dk = toon('#334155');
      const bd = new THREE.Group(); bd.position.y = 1.0; s.add(bd); V.sbody = bd;
      M(new THREE.SphereGeometry(0.55, 18, 12), gm, 0, 0, -0.45, bd, 0.025, 0.55).scale.set(1, 0.75, 1.15); M(new THREE.CylinderGeometry(0.5, 0.55, 0.3, 16), dk, 0, 0, 0.2, bd, 0.02);
      for (let i = 0; i < 4; i++) { const r = M(new THREE.SphereGeometry(0.07, 10, 8), new THREE.MeshBasicMaterial({ color: 0xec3013 }), -0.21 + i * 0.14, 0.05 + (i % 3 === 0 ? 0 : 0.06), 0.68, bd, 0.008); } V.eyes = glow(0xec3013, 0.9, bd, 0, 0.08, 0.7);
      badge(0.2, bd, 0, 0.42, -0.45, 0, -Math.PI / 2 + 0.3); M(new THREE.BoxGeometry(0.45, 0.06, 0.45), dark(), 0, 0.17, 0.2, bd, 0.006);
      const mz = new THREE.Object3D(); mz.position.set(0, -0.05, 0.75); bd.add(mz); V.muzzle = mz;
      V.slegs = []; for (let i = 0; i < 8; i++) { const sx = i < 4 ? -1 : 1, k = i % 4, az = (k - 1.5) * 0.45; const hip = new THREE.Group(); hip.position.set(sx * 0.42, 0, 0.15 - k * 0.25); hip.rotation.y = sx * (Math.PI / 2) - sx * az; bd.add(hip);
        const up = new THREE.Group(); hip.add(up); up.rotation.x = -0.7; tb(V3(0, 0, 0), V3(0, 0, 0.75), 0.05, dk, up); M(new THREE.SphereGeometry(0.08, 8, 6), gm, 0, 0, 0.75, up, 0.006);
        const lo = new THREE.Group(); lo.position.z = 0.75; up.add(lo); lo.rotation.x = 1.9; tb(V3(0, 0, 0), V3(0, 0, 0.95), 0.035, gm, lo); M(new THREE.ConeGeometry(0.05, 0.14, 6), toon('#ec3013'), 0, 0, 1.0, lo, 0.004).rotation.x = Math.PI / 2;
        V.slegs.push({ hip, up, lo, ph: (k % 2 === 0) === (sx < 0) ? 0 : Math.PI }); }
      V.seatLocal = V3(0, 1.15, 0.2); V.pose = 'spider'; return root; },
  };

  // ---------- shared state + helpers ----------
  let F = {}; const proj = [];
  function knock(x, z, r, pow, text) { let n2 = 0; for (const n of X.npcs) { const d = Math.hypot(n.x - x, n.z - z); if (n.st === 'walk' && d < r) { X.npcDown(n, (n.x - x) / (d || 1) * pow, (n.z - z) / (d || 1) * pow, text); n2++; } } return n2; }
  function crates(x, z, r, by) { let k = 0; for (const o of X.props) if (o.kind === 'crate' && !o.dead && Math.hypot(o.x - x, o.z - z) < r) { X.smash(o, by); k++; } return k; }
  function shock(r, text, pts) { const C = X.C; X.St.shake = Math.max(X.St.shake, 0.55); X.ripple(C.x, C.z, r, 0.9); for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; X.puff(X.tmp.set(C.x + Math.cos(a) * 1.2, 0.25, C.z + Math.sin(a) * 1.2), 0xb8a77a, 1, 6, 0.9, 0.6); } X.audio.burst(0.5, 220, 0.3);
    const n2 = knock(C.x, C.z, r, 7, 'BOOM!'); crates(C.x, C.z, r * 0.75, 'stomp'); X.popup(X.tmp.set(C.x, C.y + 3, C.z), n2 ? text + ' +' + n2 * pts : text, '#ec3013'); X.St.score += n2 * pts; }
  function airCtl(dt, thr, k = 0.85) { const C = X.C, S = X.V.spec; C.speed += S.accel * thr * dt * k; C.speed = Math.max(-S.rev, Math.min(S.max * (C.vy > 10 ? 1.4 : 1), C.speed)); C.yaw -= C.steer * S.turn * 0.75 * dt; }
  // bouncer: auto-bounce on landing (pogo-style). opts: idle, move, super(q), cd, onLand, gate
  function bouncer(dt, thr, o) { const C = X.C;
    if (C.ground && !F.wasG) { F.comp = 0.001; o.onLand && o.onLand(); }
    if (C.ground) { if (o.gate && !o.gate()) { F.comp = 0; } else { F.comp = (F.comp || 0) + dt / o.cd; if (F.comp >= 1) { const q = F.superQ || 0; C.ground = false; C.y += 0.03; C.vy = q > 0.15 ? o.sup(q) : (Math.abs(thr) < 0.1 && Math.abs(C.steer) < 0.1 ? o.idle : o.move); C.airT = 0; F.comp = 0; if (q > 0.15) { X.popup(X.tmp.set(C.x, C.y + 3, C.z), q > 0.9 ? 'MEGA BOING' : 'SUPER BOING', '#ffd23a'); X.audio.tone(200, 0.4, 0.06, 'triangle', 3.2); } F.superQ = 0; o.onLaunch && o.onLaunch(); } } }
    else { airCtl(dt, thr); C.pitch = 0; }
    F.wasG = C.ground; F.k = C.ground ? Math.sin(Math.min(1, F.comp || 0) * Math.PI) : 0; }
  function throwProj(mesh, v, onHit, grav = 14, life = 2) { X.scene.add(mesh); proj.push({ m: mesh, v, onHit, grav, life }); }
  function updProj(dt) { for (let i = proj.length - 1; i >= 0; i--) { const p = proj[i]; p.life -= dt; p.v.y -= p.grav * dt; p.m.position.addScaledVector(p.v, dt); p.m.rotation.x += dt * 12; const pos = p.m.position; let hit = false;
      for (const n of X.npcs) if (n.st === 'walk' && Math.hypot(n.x - pos.x, n.z - pos.z) < 0.7 && pos.y < 2) { p.onHit('npc', n); hit = true; break; }
      if (!hit) for (const o of X.props) if (!o.dead && Math.hypot(o.x - pos.x, o.z - pos.z) < (o.r || 1) && pos.y < 1.8) { p.onHit('prop', o); hit = true; break; }
      if (hit || pos.y < 0.05 || p.life <= 0) { if (!hit && pos.y < 0.05) p.onHit('ground'); X.scene.remove(p.m); proj.splice(i, 1); } } }

  // ---------- per-ride update ----------
  const U = {
    boat(dt, thr, sp) { const C = X.C, V = X.V, t = X.St.t, onW = X.inLake(C.x, C.z), fx = Math.sin(C.yaw), fz = Math.cos(C.yaw), rx = Math.cos(C.yaw), rz = -Math.sin(C.yaw), sc = V.spec.scale || 1;
      updTorps(dt); if (!X.noSkier) skierUpd(dt); F.pl = X.damp(F.pl || 0, onW && C.ground ? X.clamp((sp - 4) / 10, 0, 1) : 0, 3, dt); const nit = C.nitro > 0 && onW;
      let bank = -C.steer * 0.1 * F.pl;
      if (F.pt != null) { F.pt += dt / 0.7; const u = Math.min(1, F.pt); C.yaw += F.ptDir * Math.PI / 0.7 * dt; bank += F.ptDir * 0.4 * Math.sin(u * Math.PI); X.St.score += 0;
        if (Math.random() < 0.9) X.spray(X.tmp.set(C.x - fx * 1.6 * sc - rx * F.ptDir * 1.4 * sc, 0.5, C.z - fz * 1.6 * sc - rz * F.ptDir * 1.4 * sc), 3, 6);
        if (u >= 1) { F.pt = null; const n = knock(C.x, C.z, 7, 4, 'SOAKED!'); const pts = (F.ptFast ? 40 : 10) + n * 15; X.St.score += pts; X.popup(X.tmp.set(C.x, 3.4, C.z), 'POWER TURN +' + pts, F.ptFast ? '#ffd23a' : '#0e7fb8'); X.ripple(C.x, C.z, 6, 0.8); } }
      V.spin.rotation.x = -(F.pl * 0.09 + (nit ? 0.07 : 0)) + (F.kick || 0) * 0.03; V.spin.rotation.z = bank; V.spin.position.y = -0.2 + F.pl * 0.14; F.kick = X.damp(F.kick || 0, 0, 6, dt);
      V.prop.rotation.z += (3 + C.speed * 2.6) * dt; V.trim.rotation.x = -F.pl * 0.14; V.wheel.rotation.z = C.steer * 1.8;
      V.flag.rotation.y = Math.sin(t * (6 + sp * 0.4)) * 0.22 * (0.4 + F.pl);
      const chg = X.holds.b1 && F.chg; V.tubeGlow.forEach(g => g.scale.setScalar(chg ? 0.7 + Math.sin(t * 20) * 0.15 : (F.tcd || 0) > t ? 0.01 : 0.3));
      if (X.holds.b1 && !F.chg && t - (F.t1 || 0) > 0.4) { F.chg = true; X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.5); }
      if (onW && C.ground && sp > 3) { X.veh.updateMatrixWorld(true); if (Math.random() < (nit ? 1 : 0.35 + F.pl * 0.5)) { const p = V.jet.getWorldPosition(X.tmp); p.y += 0.3; X.spray(p, nit ? 3 : 1, 2 + sp * (nit ? 0.3 : 0.16)); }
        if (F.pl > 0.3 && Math.random() < F.pl * 0.7) for (const sd of [-1, 1]) X.spray(X.tmp.set(C.x + fx * 0.9 * sc + rx * sd * 1.0 * sc, 0.35, C.z + fz * 0.9 * sc + rz * sd * 1.0 * sc), 1, 2.5); }
      if (onW && Math.random() < 0.12) X.audio.burst(0.05, 160 + sp * 24 + (nit ? 300 : 0), 0.05); },
    hopper(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds; if (h.b3) F.chg = Math.min(1, (F.chg || 0) + dt);
      const rolling = h.b2 && C.ground;
      if (rolling) { F.wasG = true; F.comp = 0; C.speed = Math.min(C.speed + 10 * dt * Math.max(0.3, thr), 11); F.rollA = (F.rollA || 0) + C.speed * dt / 0.48; if (sp > 3) { const n2 = knock(C.x + Math.sin(C.yaw) * 0.8, C.z + Math.cos(C.yaw) * 0.8, 1.1, 6, 'STRIKE!'); if (n2) { X.St.score += 15 * n2; X.popup(X.tmp.set(C.x, 3, C.z), 'SKITTLES +' + 15 * n2, '#ffd23a'); } } }
      else bouncer(dt, thr, { cd: 0.16, idle: 4.2, move: 6.2, sup: q => 7 + q * 13, onLand: () => { X.audio.tone(130 + Math.random() * 30, 0.2, 0.05, 'sine', 2.2); if (F.belly) { F.belly = false; shock(7, 'BELLY BOUNCE', 20); F.squashT = 0.35; } if (sp > 2.5) { const n2 = knock(C.x, C.z, 1.1, 5, 'BOING!'); if (n2) { X.St.score += 10 * n2; X.popup(X.tmp.set(C.x, 3, C.z), 'BOUNCED +' + 10 * n2, '#0e7fb8'); } } } });
      F.squashT = Math.max(0, (F.squashT || 0) - dt); const k = Math.max(F.k || 0, (F.chg || 0) * 0.45, F.squashT * 2);
      V.ball.scale.set(1 + k * 0.22, 1 - k * 0.32, 1 + k * 0.22); V.ball.position.y = 0.48 * (1 - k * 0.32); V.ball.rotation.x = rolling ? F.rollA : X.damp(V.ball.rotation.x % (Math.PI * 2), 0, 6, dt); F.pk = k; F.rolling = rolling;
      X.C.wheelie = X.damp(X.C.wheelie || 0, -Math.max(-1, Math.min(1, C.speed / 6)) * 0.12, 6, dt); },
    kroo(dt, thr, sp) { const C = X.C, V = X.V, moving = Math.abs(thr) > 0.1;
      bouncer(dt, thr, { cd: 0.1, idle: 0, move: 6 + Math.min(5, F.chain || 0) * 1.3, sup: q => q, gate: () => moving || F.hopQ, onLaunch: () => { if (F.hopQ) { C.vy = 9 + Math.min(5, F.chain || 0) * 1.8; F.hopQ = false; X.popup(X.tmp.set(C.x, C.y + 3, C.z), 'BIG HOP', '#0e7fb8'); } X.audio.tone(260, 0.1, 0.04, 'triangle', 1.8); },
        onLand: () => { X.audio.tone(170, 0.14, 0.04, 'triangle', 2); F.chain = moving ? Math.min(5, (F.chain || 0) + 1) : 0; if (F.chain >= 3 && F.chain !== F.lastChain) { X.popup(X.tmp.set(C.x, C.y + 3, C.z), 'BOUND x' + F.chain, '#ffd23a'); X.St.score += 5 * F.chain; } F.lastChain = F.chain; if (F.stomp) { F.stomp = false; shock(5, 'STOMP', 20); } if (F.kick) { F.kick = 0; } } });
      if (!moving && C.ground) { F.chain = 0; C.speed = X.damp(C.speed, 0, 4, dt); }
      if (F.kick > 0) { F.kick -= dt; C.speed = Math.max(C.speed, 13); const n2 = knock(C.x + Math.sin(C.yaw), C.z + Math.cos(C.yaw), 1.3, 9, 'KICKED!'); crates(C.x + Math.sin(C.yaw), C.z + Math.cos(C.yaw), 1.4, 'kick'); if (n2) { X.St.score += 25 * n2; X.popup(X.tmp.set(C.x, C.y + 3, C.z), 'DROP-KICK +' + 25 * n2, '#ec3013'); } }
      const k = F.k || 0; V.blades.forEach(b => { b.scale.y = 1 - k * 0.3; }); V.spin.position.y = 0; F.pk = k;
      C.wheelie = X.damp(C.wheelie || 0, -Math.max(-1, Math.min(1, C.speed / 11)) * 0.15 + (F.kick > 0 ? 0.5 : 0), 6, dt); },
    jetpack(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds, gh = X.groundH(C.x, C.z);
      const thrust = h.b3 && (F.fuel ?? 1) > 0; F.fuel = Math.max(0, Math.min(1, (F.fuel ?? 1) + (C.ground ? 0.45 : thrust ? -0.2 : 0) * dt));
      if (thrust && !F.lowPop && F.fuel < 0.2) { F.lowPop = true; X.popup(X.tmp.set(C.x, C.y + 2.5, C.z), 'LOW FUEL', '#ec3013'); } if (F.fuel > 0.4) F.lowPop = false;
      C.vy += ((thrust ? 30 : 0) - 18) * dt; C.vy = Math.max(-16, Math.min(9, C.vy)); C.y += C.vy * dt; C.y = Math.min(C.y, 40);
      if (C.y <= gh) { if (!C.ground && C.vy < -11) { X.St.shake = Math.max(X.St.shake, 0.35); X.puff(X.tmp.set(C.x, 0.3, C.z), 0xb8a77a, 10, 3, 0.8, 0.6); X.popup(X.tmp.set(C.x, 3, C.z), 'HARD LANDING', '#ec3013'); } C.y = gh; C.vy = Math.max(0, C.vy); C.ground = true; } else C.ground = C.y < gh + 0.02;
      if (C.ground) C.speed = Math.max(-2, Math.min(3.5, C.speed)); else { C.yaw -= C.steer * 1.6 * dt; }
      if (F.rollT != null) { F.rollT += dt / 0.7; if (F.rollT >= 1) { F.rollT = null; X.St.score += 40; X.popup(X.tmp.set(C.x, C.y + 2.5, C.z), 'BARREL ROLL +40', '#ffd23a'); } }
      V.spin.rotation.z = F.rollT != null ? F.rollT * Math.PI * 2 : X.damp(V.spin.rotation.z, C.ground ? 0 : -C.steer * 0.3, 5, dt); V.spin.rotation.x = X.damp(V.spin.rotation.x, C.ground ? 0 : Math.max(0, C.speed / 12) * 0.35, 4, dt);
      F.pow = X.damp(F.pow || 0, thrust ? 1 : C.ground ? 0 : 0.15, 10, dt); V.flames.forEach((f, i) => { const j = 0.8 + Math.random() * 0.4; f.g.visible = F.pow > 0.05; f.a.scale.setScalar(0.5 * F.pow * j); f.b.scale.setScalar(0.9 * F.pow * j); f.b.position.y = -0.35 * F.pow; });
      if (thrust) { if (Math.random() < 0.6) { X.veh.updateMatrixWorld(true); const p = V.flames[Math.random() < 0.5 ? 0 : 1].g.getWorldPosition(X.tmp); X.puff(p, 0x9ca3af, 1, 1.5, 0.6, 0.6); } if (Math.random() < 0.3) X.audio.burst(0.06, 500, 0.06); if (C.y - gh < 3) { if (Math.random() < 0.5) X.puff(X.tmp.set(C.x + X.rr(-1, 1), 0.2, C.z + X.rr(-1, 1)), 0xb8a77a, 1, 3, 0.8, 0.5); } }
      if (h.b1 && (F.fcd = (F.fcd || 0) - dt) <= 0) { F.fcd = 0.04; X.veh.updateMatrixWorld(true); const p = V.muzzle.getWorldPosition(new THREE.Vector3()), fx = Math.sin(C.yaw), fz = Math.cos(C.yaw);
        const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.glowTex, color: Math.random() < 0.5 ? 0xff5a1a : 0xffb347, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); s2.scale.setScalar(0.5); s2.position.copy(p);
        throwProj(s2, new THREE.Vector3(fx * 14 + X.rr(-1, 1), X.rr(-1, 1) - 1, fz * 14 + X.rr(-1, 1)), (w, o) => { if (w === 'npc') { X.npcDown(o, fx * 4, fz * 4, 'TOASTY!'); X.St.score += 15; } else if (w === 'prop') { if (o.kind === 'crate') X.smash(o, 'fire'); else X.damage(o, 2, 'fire'); } }, -2, 0.45);
        if (Math.random() < 0.3) X.audio.burst(0.06, 900, 0.07); } },
    hover(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds, onW = X.inLake(C.x, C.z), floor = Math.max(X.groundH(C.x, C.z), onW ? X.waveH(C.x, C.z, X.St.t) + 0.05 : 0) + 0.45;
      if (F.air) { C.vy -= (h.b3 && C.vy < 0 ? 5 : 14) * dt; C.y += C.vy * dt; airCtl(dt, thr, 0.5); if (C.y <= floor) { C.y = floor; C.vy = 0; F.air = false; C.ground = true; X.audio.tone(500, 0.1, 0.03, 'sine', 0.6); if (onW) X.ripple(C.x, C.z, 3, 0.7);
          if (F.flipT != null) { if (F.flipT >= 0.85) { X.St.score += 50; X.popup(X.tmp.set(C.x, 3, C.z), 'KICKFLIP +50', '#ffd23a'); } else X.popup(X.tmp.set(C.x, 3, C.z), 'SKETCHY', '#9ca3af'); F.flipT = null; } } }
      else { C.ground = true; C.y = X.damp(C.y, floor + Math.sin(X.St.t * 3) * 0.05, 10, dt); if (floor < C.y - 0.6) { F.air = true; C.ground = false; C.vy = 0; } }
      if (F.flipT != null) F.flipT += dt / 0.45;
      V.deck.rotation.z = F.flipT != null ? Math.min(1, F.flipT) * Math.PI * 2 : X.damp(V.deck.rotation.z, -C.steer * 0.25, 6, dt); V.deck.rotation.x = X.damp(V.deck.rotation.x, F.air ? 0 : -Math.max(-1, Math.min(1, C.speed / 15)) * 0.08, 5, dt);
      V.pads.forEach((p, i) => p.scale.setScalar(0.5 + Math.sin(X.St.t * 20 + i) * 0.08 + Math.min(1, sp / 15) * 0.3));
      if (onW && !F.air && sp > 3) { F.wd = (F.wd || 0) + sp * dt; if (F.wd > 1.4) { F.wd = 0; X.ripple(C.x - Math.sin(C.yaw) * 0.6, C.z - Math.cos(C.yaw) * 0.6, 1.6, 0.5); } if (Math.random() < 0.4) X.spray(X.tmp.set(C.x - Math.sin(C.yaw) * 0.6, 0.3, C.z - Math.cos(C.yaw) * 0.6), 1, 2); }
      if (h.b1 && !F.chg && X.St.t - (F.t1 || 0) > 0.4) { F.chg = true; X.audio.tone(1320, 0.12, 0.05, 'triangle', 1.5); } },
    unicycle(dt, thr, sp) { const C = X.C, V = X.V;
      if (F.fallT > 0) { F.fallT -= dt; C.speed = X.damp(C.speed, 0, 5, dt); V.spin.rotation.z = X.damp(V.spin.rotation.z, F.fallDir * 1.3, 8, dt); if (F.fallT <= 0) { X.popup(X.tmp.set(C.x, 2.6, C.z), 'BACK ON', '#0e7fb8'); } return; }
      F.wob = (F.wob || 0) + ((Math.random() - 0.5) * 3 - (F.wob || 0) * 2.5) * dt + C.steer * sp * 0.012 * dt * 60 * 0.05;
      const risk = Math.abs(C.steer) * sp / 7; F.tip = X.damp(F.tip || 0, risk > 0.75 ? (F.tip || 0) + dt * 2.2 : 0, 4, dt);
      if (F.tip > 0.6) { F.fallT = 1.4; F.fallDir = C.steer > 0 ? 1 : -1; F.tip = 0; X.popup(X.tmp.set(C.x, 2.6, C.z), 'WOBBLE FAIL', '#ec3013'); X.St.shake = Math.max(X.St.shake, 0.3); X.puff(X.tmp.set(C.x, 0.3, C.z), 0xb8a77a, 10, 2.5, 0.8, 0.6); X.audio.burst(0.3, 300, 0.2); return; }
      if (F.spinT != null) { F.spinT += dt / 0.7; C.speed *= 1 - dt * 3; if (F.spinT >= 1) { F.spinT = null; X.St.score += 30; X.popup(X.tmp.set(C.x, 2.6, C.z), 'SPIN +30', '#ffd23a'); } }
      V.spin.rotation.z = Math.sin(X.St.t * 4.3) * 0.06 + F.wob * 0.12 - C.steer * Math.min(1, sp / 6) * 0.15 + F.tip * Math.sign(C.steer) * 0.4 * -1; V.spin.rotation.y = F.spinT != null ? F.spinT * Math.PI * 2 : 0;
      F.crank = (F.crank || 0) + C.speed * dt / 0.32; V.crank.rotation.x = F.crank; X.C.crankA = F.crank;
      if (F.tip > 0.2 && Math.random() < dt * 6) X.audio.tone(900, 0.04, 0.03, 'square'); },
    turtle(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds; F.walk = (F.walk || 0) + sp * dt * 3; const hidden = h.b2 && F.spinT == null; F.hid = X.damp(F.hid || 0, hidden ? 1 : 0, 8, dt); F.hidT = hidden ? (F.hidT || 0) + dt : F.hidT;
      if (hidden) { C.speed = X.damp(C.speed, 0, 6, dt); for (const n of X.npcs) if (n.st === 'walk' && Math.hypot(n.x - C.x, n.z - C.z) < 1.9) { X.npcDown(n, (n.x - C.x) * 3, (n.z - C.z) * 3, 'CLONK!'); X.audio.tone(200, 0.08, 0.05, 'square'); } }
      if (F.spinT != null) { F.spinT += dt / 1.2; C.speed = 0; F.hid = Math.max(F.hid, 0.9); V.tb.rotation.y += dt * 16; const n2 = knock(C.x, C.z, 2.8, 8, 'SPUN OUT!'); crates(C.x, C.z, 2.4, 'spin'); F.spinN = (F.spinN || 0) + n2; if (Math.random() < 0.5) X.puff(X.tmp.set(C.x + X.rr(-1.2, 1.2), 0.2, C.z + X.rr(-1.2, 1.2)), 0xb8a77a, 1, 3, 0.7, 0.4); if (F.spinT >= 1) { F.spinT = null; V.tb.rotation.y = 0; if (F.spinN) { X.St.score += F.spinN * 20; X.popup(X.tmp.set(C.x, 3.4, C.z), 'SHELL SPIN +' + F.spinN * 20, '#ffd23a'); } F.spinN = 0; } }
      if (F.stT != null) { F.stT += dt / 0.9; C.speed = 0; V.tb.rotation.x = -Math.sin(Math.min(1, F.stT) * Math.PI) * 0.45; if (F.stT > 0.62 && !F.stDone) { F.stDone = true; shock(6, 'TURTLE STOMP', 20); } if (F.stT >= 1) { F.stT = null; V.tb.rotation.x = 0; } }
      V.tb.position.y = -F.hid * 0.22; V.head.position.z = 1.12 - F.hid * 0.38; V.head.scale.setScalar(1 - F.hid * 0.5);
      V.legs.forEach((l, i) => { l.rotation.x = Math.sin(F.walk + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.5 * Math.min(1, sp); l.scale.setScalar(1 - F.hid * 0.8); }); V.head.rotation.y = Math.sin(X.St.t * 0.7) * 0.25 * (1 - F.hid); },
    ostrich(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds, fx = Math.sin(C.yaw), fz = Math.cos(C.yaw); F.run = (F.run || 0) + sp * dt * 1.9;
      const amp = C.ground ? Math.min(1, sp / 3) : 0.2; V.olegs.forEach((l, i) => l.rotation.x = Math.sin(F.run + i * Math.PI) * 0.95 * amp + (C.ground ? 0 : -0.5)); V.obody.position.y = 1.15 + Math.abs(Math.sin(F.run)) * 0.06 * amp;
      const glide = !C.ground && h.b3 && C.vy < 0; if (glide) C.vy += 18 * dt; if (!C.ground) X.C.speed += (V.spec.accel * thr * 0.3) * dt;
      V.wings.forEach((w, i) => { w.rotation.z = (i ? -1 : 1) * (glide ? 0.9 + Math.sin(X.St.t * 22) * 0.6 : 0.05 + Math.sin(F.run) * 0.05 * amp); });
      if (F.peckT != null) { F.peckT += dt / 0.3; V.neck.rotation.x = Math.sin(Math.min(1, F.peckT) * Math.PI) * 1.0; if (F.peckT > 0.45 && !F.pkDone) { F.pkDone = true; const n2 = knock(C.x + fx * 1.7, C.z + fz * 1.7, 1.1, 6, 'PECKED!'); crates(C.x + fx * 1.6, C.z + fz * 1.6, 1.0, 'peck'); if (n2) { F.combo = (X.St.t - (F.lastPk || 0) < 1.2 ? (F.combo || 0) : 0) + 1; F.lastPk = X.St.t; X.St.score += 10 * F.combo; X.popup(X.tmp.set(C.x, 3.2, C.z), F.combo >= 3 ? 'PECK COMBO x' + F.combo : 'PECK +' + 10 * F.combo, F.combo >= 3 ? '#ffd23a' : '#0e7fb8'); } } if (F.peckT >= 1) { F.peckT = null; V.neck.rotation.x = 0; } }
      else V.neck.rotation.x = X.damp(V.neck.rotation.x, Math.sin(F.run * 2) * 0.08 * amp - Math.min(1, sp / 16) * 0.25, 8, dt);
      if (F.dustT != null) { F.dustT += dt / 0.5; if (Math.random() < 0.9) X.puff(X.tmp.set(C.x - fx * (1 + F.dustT * 2.5) + X.rr(-0.8, 0.8), 0.4, C.z - fz * (1 + F.dustT * 2.5) + X.rr(-0.8, 0.8)), 0xb8a77a, 2, 4, 1.2, 0.9); V.olegs[1].rotation.x = 1.2 * Math.sin(Math.min(1, F.dustT) * Math.PI);
        if (F.dustT > 0.3 && !F.dsDone) { F.dsDone = true; const n2 = knock(C.x - fx * 2.8, C.z - fz * 2.8, 2.8, 7, 'DUSTED!'); crates(C.x - fx * 2.5, C.z - fz * 2.5, 2, 'dust'); if (n2) { X.St.score += 15 * n2; X.popup(X.tmp.set(C.x, 3.2, C.z), 'DUST KICK +' + 15 * n2, '#ffd23a'); } } if (F.dustT >= 1) F.dustT = null; } },
    dragon(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds; F.st = Math.max(0, Math.min(1, (F.st ?? 1) + (C.ground ? 0.5 : 0) * dt)); F.walk = (F.walk || 0) + sp * dt * 3;
      if (!C.ground) { C.vy += 12 * dt; if (h.b3 && C.vy < 0) C.vy += 8 * dt; airCtl(dt, thr, 0.7); }
      F.flapT = Math.max(0, (F.flapT || 0) - dt); const flap = F.flapT > 0 ? Math.sin(X.St.t * 26) * 1.0 : !C.ground ? 0.25 + Math.sin(X.St.t * 5) * 0.12 : -0.9;
      V.dwings.forEach(w => { w.rotation.z = X.damp(w.rotation.z, flap, 14, dt); w.rotation.y = !C.ground || F.flapT > 0 ? 0 : 0.9; });
      V.dlegs.forEach((l, i) => l.rotation.x = C.ground ? Math.sin(F.walk + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.6 * Math.min(1, sp / 2) : 0.6);
      V.dtail.rotation.y = Math.sin(X.St.t * 3) * 0.25; V.dbody.rotation.x = C.ground ? 0 : -0.1; V.dhead.rotation.x = X.damp(V.dhead.rotation.x, h.b1 ? 0.25 : 0, 8, dt);
      if (F.whipT != null) { F.whipT += dt / 0.55; V.spin.rotation.y = Math.min(1, F.whipT) * Math.PI * 2; const n2 = knock(C.x, C.z, 3, 8, 'WHIPPED!'); crates(C.x, C.z, 2.6, 'whip'); F.whN = (F.whN || 0) + n2; if (F.whipT >= 1) { F.whipT = null; V.spin.rotation.y = 0; if (F.whN) { X.St.score += 20 * F.whN; X.popup(X.tmp.set(C.x, 3.2, C.z), 'TAIL WHIP +' + 20 * F.whN, '#ffd23a'); } F.whN = 0; } }
      if (h.b1 && (F.fcd = (F.fcd || 0) - dt) <= 0) { F.fcd = 0.04; X.veh.updateMatrixWorld(true); const p = V.mouth.getWorldPosition(new THREE.Vector3()), fx = Math.sin(C.yaw), fz = Math.cos(C.yaw);
        const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.glowTex, color: Math.random() < 0.5 ? 0xff5a1a : 0xffd23a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); s2.scale.setScalar(0.6); s2.position.copy(p);
        throwProj(s2, new THREE.Vector3(fx * 13 + X.rr(-1, 1), -2.5 + X.rr(-1, 1), fz * 13 + X.rr(-1, 1)), (w, o) => { if (w === 'npc') { X.npcDown(o, fx * 4, fz * 4, 'SCORCHED!'); X.St.score += 15; } else if (w === 'prop') { if (o.kind === 'crate') X.smash(o, 'fire'); else X.damage(o, 2, 'fire'); } }, -1, 0.5); if (Math.random() < 0.3) X.audio.burst(0.06, 700, 0.08); } },
    cart(dt, thr, sp) { const C = X.C, V = X.V, fx = Math.sin(C.yaw), fz = Math.cos(C.yaw);
      if (F.ride) { F.rs = Math.max(0, (F.rs || 0) - 0.7 * dt); C.speed = F.rs; if (F.rs < 0.4 && !F.stopPop) { F.stopPop = true; X.popup(X.tmp.set(C.x, 2.6, C.z), '3 = HOP OUT', '#9ca3af'); } }
      if ((F.cargo || 0) < 3) for (const o of X.props) if (o.kind === 'crate' && !o.dead && Math.hypot(o.x - (C.x + fx * 0.7), o.z - (C.z + fz * 0.7)) < 1.2) { o.dead = true; o.g.visible = false; o.respawn = 10; F.cargo = (F.cargo || 0) + 1; X.popup(X.tmp.set(C.x, 2.6, C.z), 'CRATE ' + F.cargo + '/3', '#0e7fb8'); X.audio.tone(600, 0.08, 0.04, 'triangle', 1.3); if (F.cargo >= 3) break; }
      V.cargo.forEach((m, i) => m.visible = i < (F.cargo || 0));
      if (F.dsT != null) { F.dsT += dt / 0.6; V.spin.rotation.y = Math.min(1, F.dsT) * Math.PI * 2; const n2 = knock(C.x, C.z, 2, 6, 'SPUN!'); F.dsN = (F.dsN || 0) + n2; if (Math.random() < 0.6) X.puff(X.tmp.set(C.x, 0.1, C.z), 0x9ca3af, 1, 2, 0.5, 0.4); if (F.dsT >= 1) { F.dsT = null; V.spin.rotation.y = 0; X.St.score += 25 + 15 * (F.dsN || 0); X.popup(X.tmp.set(C.x, 2.8, C.z), 'CART SPIN +' + (25 + 15 * (F.dsN || 0)), '#ffd23a'); F.dsN = 0; } }
      V.casters.forEach((c, i) => c.rotation.y = i > 1 ? Math.sin(X.St.t * 17 + i) * 0.4 * Math.min(1, sp / 3) - C.steer * 0.5 : 0); F.run = (F.run || 0) + sp * dt * 2.4;
      if (sp > 5 && Math.random() < 0.08) X.audio.tone(1800 + Math.random() * 400, 0.03, 0.02, 'square'); },
    hamster(dt, thr, sp) { const C = X.C, V = X.V; F.run = (F.run || 0) + sp * dt * 2.6; V.hball.rotation.x += C.speed * dt / 1.35;
      if (F.dash > 0) { F.dash -= dt; C.speed = Math.max(C.speed, 18); if (Math.random() < 0.7) X.puff(X.tmp.set(C.x, 0.2, C.z), 0xb8a77a, 1, 2, 0.8, 0.5); }
      if (sp > 3) { const n2 = knock(C.x + Math.sin(C.yaw) * 1.1, C.z + Math.cos(C.yaw) * 1.1, 1.7, 7, 'STRIKE!'); if (n2) { X.St.score += 20 * n2; X.popup(X.tmp.set(C.x, 3, C.z), 'BOWLED +' + 20 * n2, '#ffd23a'); X.audio.tone(250, 0.15, 0.05, 'triangle', 0.6); } }
      if (F.pin > 0) { F.pin -= dt; const LIMW = 66.5; let hitW = false; if (Math.abs(C.x) > LIMW && Math.sign(C.x) * Math.sin(C.yaw) > 0) { C.yaw = -C.yaw; hitW = true; } if (Math.abs(C.z) > LIMW && Math.sign(C.z) * Math.cos(C.yaw) > 0) { C.yaw = Math.PI - C.yaw; hitW = true; }
        for (const o of X.props) { if (o.dead || F.pinCd > X.St.t) continue; const dx = C.x - o.x, dz = C.z - o.z, d = Math.hypot(dx, dz); if (d < (o.r || 1) + 1.5) { const nx = dx / (d || 1), nz = dz / (d || 1), vx = Math.sin(C.yaw), vz = Math.cos(C.yaw), dot = vx * nx + vz * nz; if (dot < 0) { C.yaw = Math.atan2(vx - 2 * dot * nx, vz - 2 * dot * nz); hitW = true; if (o.kind === 'crate') X.smash(o, 'ball'); else X.damage(o, 3, 'ball'); F.pinCd = X.St.t + 0.15; } } }
        if (hitW) { C.speed = Math.max(sp, 12); X.St.score += 10; X.popup(X.tmp.set(C.x, 3, C.z), 'PINBALL +10', '#0e7fb8'); X.audio.tone(1200, 0.06, 0.05, 'square'); X.St.shake = Math.max(X.St.shake, 0.15); }
        if (F.pin <= 0) X.popup(X.tmp.set(C.x, 3, C.z), 'PINBALL OVER', '#9ca3af'); } },
    bumper(dt, thr, sp) { const C = X.C, V = X.V, fx = Math.sin(C.yaw), fz = Math.cos(C.yaw);
      if (F.chg > 0) { F.chg -= dt; C.speed = Math.max(C.speed, 15); }
      if (F.so != null) { F.so += dt / 1.0; V.spin.rotation.y += dt * 18 * (1 - F.so * 0.6); const n2 = knock(C.x, C.z, 1.9, 6, 'BONK!'); F.soN = (F.soN || 0) + n2; if (F.so >= 1) { F.so = null; V.spin.rotation.y = 0; if (F.soN) { X.St.score += 15 * F.soN; X.popup(X.tmp.set(C.x, 2.8, C.z), 'SPIN-OUT +' + 15 * F.soN, '#ffd23a'); } F.soN = 0; } }
      if ((F.bcd || 0) < X.St.t && sp > 1.5) { let hit = null; for (const o of X.props) { if (o.dead) continue; const d = Math.hypot(o.x - C.x, o.z - C.z); if (d < (o.r || 1) + 0.95 && ((o.x - C.x) * fx + (o.z - C.z) * fz) * Math.sign(C.speed) > 0) { hit = o; break; } }
        const wall = Math.abs(C.x + fx * C.speed * 0.05) > 66 || Math.abs(C.z + fz * C.speed * 0.05) > 66;
        if (hit || wall) { F.bcd = X.St.t + 0.3; const v = C.speed; C.speed = -v * 0.75; X.St.shake = Math.max(X.St.shake, 0.25); X.audio.tone(140, 0.15, 0.06, 'square', 0.6); X.popup(X.tmp.set(C.x, 2.6, C.z), 'BONK!', '#0e7fb8'); X.St.score += 5;
          if (hit && hit.kind === 'car') { hit.fly = { vx: fx * v * 0.9, vz: fz * v * 0.9, vy: 4 + Math.abs(v) * 0.4, spin: X.rr(-4, 4) }; X.damage(hit, 2, 'bump'); } else if (hit) X.smash(hit, 'bump'); } }
      for (const n of X.npcs) if (n.st === 'walk' && sp > 3 && Math.hypot(n.x - C.x, n.z - C.z) < 1.2) { X.npcDown(n, fx * 6, fz * 6, 'BUMPED!'); X.St.score += 10; }
      for (const o of X.props) if (o.fly) { const f2 = o.fly; o.x += f2.vx * dt; o.z += f2.vz * dt; f2.vy -= 20 * dt; o.fy = Math.max(0, (o.fy || 0) + f2.vy * dt); o.g.position.set(o.x, o.fy, o.z); o.g.rotation.z += f2.spin * dt; f2.vx *= 1 - dt; f2.vz *= 1 - dt; if (o.fy <= 0 && f2.vy < 0) { if (Math.abs(f2.vy) > 3) { f2.vy = -f2.vy * 0.4; X.puff(X.tmp.set(o.x, 0.3, o.z), 0x9ca3af, 6, 2, 0.6, 0.5); } else { o.fly = null; o.g.rotation.z = 0; } } }
      V.spark.visible = Math.random() < 0.3 + Math.min(0.6, sp / 10); V.bb.rotation.x = X.damp(V.bb.rotation.x, -(C.speed - (F.ls || 0)) / Math.max(dt, 1e-3) * 0.004, 8, dt); F.ls = C.speed;
      if (F.horn > 0) F.horn -= dt; },
    rskates(dt, thr, sp) { const C = X.C, V = X.V; F.str = (F.str || 0) + (C.ground && thr > 0.1 ? dt * (2 + sp * 0.25) : 0);
      if (F.rk > 0) { F.rk -= dt; C.speed = Math.max(C.speed, 22); if (Math.random() < 0.8) { X.veh.updateMatrixWorld(true); for (const k of V.skates) { const p = k.fl.getWorldPosition(X.tmp); X.puff(p, 0xff9a1a, 1, 1.2, 0.5, 0.35, true); } } if (F.rk <= 0) X.C.speed = Math.min(X.C.speed, 15); }
      V.skates.forEach(k => k.fl.scale.setScalar(F.rk > 0 ? 0.8 + Math.random() * 0.3 : 0.01));
      if (F.spT != null) { F.spT += dt / 0.55; V.spin.rotation.y = Math.min(1, F.spT) * Math.PI * 2; if (C.ground && F.spT > 0.15 || F.spT >= 1) { if (F.spT >= 0.9) { const air = !C.ground || F.spAir; X.St.score += air ? 40 : 15; X.popup(X.tmp.set(C.x, 2.8, C.z), air ? '360 +40' : 'SPIN +15', '#ffd23a'); } F.spT = null; V.spin.rotation.y = 0; } }
      if (F.kT != null) { F.kT += dt / 0.4; if (F.kT > 0.4 && !F.kDone) { F.kDone = true; const n2 = knock(C.x, C.z, 1.8, 7, 'KICKED!'); crates(C.x, C.z, 1.6, 'kick'); if (n2) { X.St.score += 20 * n2; X.popup(X.tmp.set(C.x, 2.8, C.z), 'KICK +' + 20 * n2, '#ec3013'); } } V.spin.rotation.y = F.spT == null ? Math.sin(Math.min(1, F.kT) * Math.PI) * 2.6 : V.spin.rotation.y; if (F.kT >= 1) { F.kT = null; if (F.spT == null) V.spin.rotation.y = 0; } }
      if (C.ground && sp > 8 && Math.random() < 0.06) X.audio.burst(0.04, 3000, 0.03); },
    crane(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds; X.veh.updateMatrixWorld(true);
      if (h.b1) F.sw = Math.min(5.5, (F.sw || 0) + dt * 4); else F.sw = X.damp(F.sw || 0, 0, 0.8, dt);
      V.turn.rotation.y += (F.sw || 0) * dt; if (!h.b1 && (F.sw || 0) < 0.3) V.turn.rotation.y = X.damp(V.turn.rotation.y % (Math.PI * 2), 0, 1.5, dt);
      if (F.drop != null) { F.drop += dt; } const tip = V.tip.getWorldPosition(new THREE.Vector3()), base = tip.clone(); const len = F.drop != null ? Math.min(tip.y - 0.55, 1.6 + F.drop * F.drop * 30) : 1.6 + (F.sw || 0) * 0.05;
      const out = new THREE.Vector3(tip.x - C.x, 0, tip.z - C.z).normalize(); const ang = Math.min(1.0, (F.sw || 0) * 0.18);
      const bw = new THREE.Vector3(tip.x + out.x * Math.sin(ang) * len, tip.y - Math.cos(ang) * len, tip.z + out.z * Math.sin(ang) * len);
      if (F.drop != null && bw.y <= 0.56 && !F.dropHit) { F.dropHit = true; bw.y = 0.55; X.St.shake = Math.max(X.St.shake, 0.8); X.boom ? X.boom(bw, 2.5, 0xffffff) : 0; X.puff(X.tmp.set(bw.x, 0.3, bw.z), 0xb8a77a, 20, 5, 1.2, 0.8); X.audio.burst(0.6, 150, 0.35); const n2 = knock(bw.x, bw.z, 4.5, 8, 'WRECKED!'); crates(bw.x, bw.z, 3, 'ball'); for (const o of X.props) if (o.kind === 'car' && !o.dead && Math.hypot(o.x - bw.x, o.z - bw.z) < 3) X.damage(o, 6, 'ball'); X.popup(X.tmp.set(bw.x, 3.5, bw.z), n2 ? 'WRECKING BALL +' + n2 * 25 : 'WRECKING BALL', '#ec3013'); X.St.score += n2 * 25; }
      if (F.drop != null && F.drop > 1.4) { F.drop = null; F.dropHit = false; }
      X.veh.worldToLocal(bw); V.wball.position.copy(bw); X.veh.worldToLocal(base); const p = V.chain.geometry.attributes.position; p.setXYZ(0, base.x, base.y, base.z); p.setXYZ(1, bw.x, bw.y + 0.6, bw.z); p.needsUpdate = true;
      const bwW = V.wball.getWorldPosition(new THREE.Vector3()); if ((F.sw || 0) > 1.5) { const n2 = knock(bwW.x, bwW.z, 1.4, 9, 'SMASHED!'); if (n2) { X.St.score += 20 * n2; X.popup(X.tmp.set(bwW.x, 3, bwW.z), 'SMASH +' + 20 * n2, '#ffd23a'); } for (const o of X.props) if (!o.dead && Math.hypot(o.x - bwW.x, o.z - bwW.z) < (o.r || 1) + 0.6 && bwW.y < 2) { if (o.kind === 'crate') X.smash(o, 'ball'); else if ((F.hcd || 0) < X.St.t) { F.hcd = X.St.t + 0.4; X.damage(o, 3, 'ball'); X.audio.tone(120, 0.15, 0.06, 'square'); } } }
      if (F.grab) { const o = F.grab; const tw = V.tip.getWorldPosition(new THREE.Vector3()); o.x = X.damp(o.x, tw.x, 6, dt); o.z = X.damp(o.z, tw.z, 6, dt); o.fy = X.damp(o.fy || 0, tw.y - 1.6, 6, dt); o.g.position.set(o.x, o.fy, o.z); }
      V.wball.visible = !F.grab; V.chain.visible = true; },
    balloon(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds, gh = X.groundH(C.x, C.z); F.wT = (F.wT || 0) - dt; if (F.wT <= 0) { F.wT = 8 + Math.random() * 6; F.wind = Math.random() * Math.PI * 2; X.popup(X.tmp.set(C.x, C.y + 6, C.z), 'WIND SHIFT', '#9ca3af'); }
      const burn = h.b3; C.vy = X.damp(C.vy, burn ? 2.6 : -1.1, 0.9, dt); C.y += C.vy * dt; C.y = Math.min(C.y, 38);
      if (C.y <= gh) { if (!C.ground && C.vy < -2) X.popup(X.tmp.set(C.x, 3, C.z), 'BUMP', '#9ca3af'); C.y = gh; C.vy = Math.max(0, C.vy); C.ground = true; } else C.ground = false;
      const wx = Math.sin(F.wind || 0) * 1.8 * (C.ground ? 0 : 1), wz = Math.cos(F.wind || 0) * 1.8 * (C.ground ? 0 : 1); C.x = Math.max(-66, Math.min(66, C.x + wx * dt)); C.z = Math.max(-66, Math.min(66, C.z + wz * dt));
      if (C.ground) C.speed = 0; else C.yaw -= C.steer * 0.6 * dt;
      F.fl = X.damp(F.fl || 0, burn ? 1 : 0, 12, dt) + (F.blast > 0 ? 1 : 0); V.flame.scale.setScalar(0.01 + F.fl * (0.9 + Math.random() * 0.3)); V.flame2.scale.setScalar(0.01 + F.fl * (0.5 + Math.random() * 0.2)); if (burn && Math.random() < 0.15) X.audio.burst(0.08, 300, 0.07);
      V.env.rotation.z = Math.sin(X.St.t * 0.7) * 0.03; V.env.scale.set(1, 1 + Math.sin(X.St.t * 1.3) * 0.01, 1); V.bags.forEach((b, i) => b.visible = i < (F.bagsLeft ?? 4));
      if (F.blast > 0) { F.blast -= dt; if (Math.random() < 0.9) { const s2 = new THREE.Sprite(new THREE.SpriteMaterial({ map: X.glowTex, color: Math.random() < 0.5 ? 0xff5a1a : 0xffd23a, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false })); s2.scale.setScalar(0.9); s2.position.set(C.x, C.y - 0.2, C.z);
          throwProj(s2, new THREE.Vector3(X.rr(-2, 2), -14, X.rr(-2, 2)), (w, o) => { if (w === 'npc') { X.npcDown(o, X.rr(-3, 3), X.rr(-3, 3), 'TOASTY!'); X.St.score += 15; } else if (w === 'prop') { if (o.kind === 'crate') X.smash(o, 'fire'); else X.damage(o, 2, 'fire'); } }, 0, 3); } }
      if ((F.bagsLeft ?? 4) < 4 && C.ground) { F.refT = (F.refT || 0) + dt; if (F.refT > 1.5) { F.refT = 0; F.bagsLeft = 4; X.popup(X.tmp.set(C.x, 3, C.z), 'SANDBAGS RELOADED', '#0e7fb8'); } } },
    spider(dt, thr, sp) { const C = X.C, V = X.V, h = X.holds; F.walk = (F.walk || 0) + (sp + Math.abs(C.steer) * 3) * dt * 2.2;
      const nearWall = Math.abs(C.x) > 64 || Math.abs(C.z) > 64;
      if (h.b3 && nearWall) { F.climb = true; C.vy = 3.5; C.y = Math.min(C.y + C.vy * dt, 14); C.ground = false; C.speed = 0; if (!F.cPop) { F.cPop = true; X.popup(X.tmp.set(C.x, C.y + 3, C.z), 'CLIMBING', '#0e7fb8'); } }
      else if (F.climb) { if (h.b3) { C.vy = 0; } else { F.climb = false; F.cPop = false; } }
      if (h.b3 && !nearWall && !F.climbHint) { F.climbHint = true; X.popup(X.tmp.set(C.x, 3, C.z), 'WALK TO THE WALL', '#9ca3af'); } if (!h.b3) F.climbHint = false;
      if (F.climb) { const wx = Math.abs(C.x) > Math.abs(C.z); V.spin.rotation.x = X.damp(V.spin.rotation.x, -1.3, 6, dt); } else V.spin.rotation.x = X.damp(V.spin.rotation.x, 0, 6, dt);
      if (F.pounce && C.ground && !F.wasG2) { F.pounce = false; shock(5.5, 'POUNCE', 25); } F.wasG2 = C.ground;
      const amp = Math.min(1, (sp + Math.abs(C.steer) * 3) / 3) + (F.climb ? 1 : 0); V.slegs.forEach(l => { const a = F.walk * 2 + l.ph; l.up.rotation.x = -0.7 - Math.max(0, Math.sin(a)) * 0.35 * amp + (C.ground ? 0 : -0.3); l.hip.rotation.z = Math.cos(a) * 0.25 * amp; });
      V.sbody.position.y = 1.0 + Math.abs(Math.sin(F.walk * 2)) * 0.04 * amp; V.eyes.scale.setScalar(0.8 + Math.sin(X.St.t * 6) * 0.15);
      if (C.ground && sp > 2 && Math.random() < sp * dt * 2) X.audio.tone(180 + Math.random() * 60, 0.03, 0.03, 'square');
      for (const n of X.npcs) if (n.webT > 0) { n.webT -= dt; n.x = n.webX; n.z = n.webZ; if (n.webT <= 0 && n.webM) { X.scene.remove(n.webM); n.webM = null; } } },
  };

  // ---------- poses ----------
  const P = {
    boat(fox, FP) { const C = X.C, pt = F.pt != null ? Math.sin(Math.min(1, F.pt) * Math.PI) * F.ptDir : 0; fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.12 + (C.nitro > 0 ? 0.12 : 0), 0, -C.steer * 0.12 - pt * 0.3);
      FP.legs.forEach((l, i) => { l.rotation.x = -1.4; l.rotation.z = (i ? 1 : -1) * 0.14; }); FP.arms.forEach((a, i) => { a.rotation.x = -1.2 + (i ? 1 : -1) * C.steer * 0.25; a.rotation.z = (i ? 1 : -1) * 0.2; }); fox.position.set(0, 0.42, -0.5); },
    hopper(fox, FP) { const k = F.pk || 0, C = X.C; fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.1 + k * 0.2, 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = -1.1 + k * 0.3; l.rotation.z = (i ? 1 : -1) * 0.55; }); FP.arms.forEach((a, i) => { a.rotation.x = -0.9 - k * 0.2; a.rotation.z = (i ? 1 : -1) * 0.12; }); fox.position.copy(X.V.seatLocal); fox.position.y = 0.36 + 0.48 * (1 - k * 0.32) * 2 - 0.96 + (F.rolling ? 0.06 : 0); },
    kroo(fox, FP) { const k = F.pk || 0, C = X.C; fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.2 + k * 0.25 + (F.kick > 0 ? -0.6 : 0), 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = F.kick > 0 ? -1.3 : -k * 0.4 + (C.ground ? 0 : -0.15 + (i ? 0.3 : -0.3) * Math.min(1, Math.abs(C.speed) / 8)); l.rotation.z = (i ? 1 : -1) * 0.04; });
      FP.arms.forEach((a, i) => { a.rotation.x = C.ground ? 0.2 : -0.5 + (i ? 0.4 : -0.4); a.rotation.z = (i ? 1 : -1) * 0.35; }); fox.position.copy(X.V.seatLocal); fox.position.y -= k * 0.18; X.V.blades.forEach((b, i) => { b.rotation.x = FP.legs[i].rotation.x * 0.6; }); },
    jet(fox, FP) { const C = X.C, air = !C.ground, run = C.ground && Math.abs(C.speed) > 0.5, ph = X.St.t * 9; fox.rotation.set(0, 0, 0); FP.body.rotation.set(air ? 0.1 : run ? 0.15 : 0, 0, 0);
      FP.legs.forEach((l, i) => { l.rotation.x = air ? 0.1 + Math.sin(X.St.t * 2 + i) * 0.08 : run ? Math.sin(ph + i * Math.PI) * 0.7 : 0; l.rotation.z = (i ? 1 : -1) * (air ? 0.08 : 0); });
      FP.arms.forEach((a, i) => { a.rotation.x = X.holds.b1 ? -1.5 : air ? -0.3 : run ? -Math.sin(ph + i * Math.PI) * 0.6 : 0; a.rotation.z = (i ? 1 : -1) * (air ? 0.5 : 0.15); }); fox.position.set(0, 0, 0); },
    hover(fox, FP) { const C = X.C, sp = Math.abs(C.speed); fox.rotation.set(0, Math.PI / 2 * 0.85, 0); FP.body.rotation.set(0.15 + (F.air ? 0.2 : 0), 0, C.lean * 0.4); FP.legs[0].rotation.x = -0.35 - (F.air ? 0.3 : 0); FP.legs[1].rotation.x = 0.35; FP.legs.forEach((l, i) => l.rotation.z = (i ? 1 : -1) * 0.12);
      FP.arms.forEach((a, i) => { a.rotation.x = X.holds.b1 ? -1.5 : -0.3; a.rotation.z = (i ? 1 : -1) * (0.9 - Math.min(1, sp / 15) * 0.4); }); fox.position.set(0, 0.08 + (F.flipT != null ? 0.35 : 0), 0); },
    uni(fox, FP) { const C = X.C, ca = F.crank || 0; fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.05, 0, 0); FP.legs[0].rotation.x = -0.75 + Math.sin(ca) * 0.45; FP.legs[1].rotation.x = -0.75 - Math.sin(ca) * 0.45; FP.legs.forEach((l, i) => l.rotation.z = (i ? 1 : -1) * 0.05);
      const w = Math.sin(X.St.t * 5) * 0.25; FP.arms.forEach((a, i) => { a.rotation.x = F.throwT > 0 && i ? -2.4 : -0.2; a.rotation.z = (i ? 1 : -1) * (1.3 + (i ? w : -w)) ; }); F.throwT = Math.max(0, (F.throwT || 0) - 1 / 60); fox.position.copy(X.V.seatLocal); if (F.fallT > 0) { fox.position.y -= 0.3; FP.body.rotation.x = -0.4; } },
    turtle(fox, FP) { const hd = F.hid || 0; fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.15 + hd * 0.45, 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = -1.35; l.rotation.z = (i ? 1 : -1) * 0.75; }); FP.arms.forEach((a, i) => { a.rotation.x = hd > 0.5 ? -2.6 : -0.55; a.rotation.z = (i ? 1 : -1) * (hd > 0.5 ? 0.3 : 0.6); }); fox.position.copy(X.V.seatLocal); },
    ostrich(fox, FP) { const C = X.C, amp = Math.min(1, Math.abs(C.speed) / 3); fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.3 + Math.min(1, Math.abs(C.speed) / 16) * 0.25, 0, C.lean * 0.4); FP.legs.forEach((l, i) => { l.rotation.x = -0.95; l.rotation.z = (i ? 1 : -1) * 0.55; }); FP.arms.forEach((a, i) => { a.rotation.x = -1.0; a.rotation.z = (i ? 1 : -1) * 0.18; }); fox.position.copy(X.V.seatLocal); fox.position.y += Math.abs(Math.sin(F.run || 0)) * 0.06 * amp; },
    dragon(fox, FP) { const C = X.C; fox.rotation.set(0, 0, 0); FP.body.rotation.set(C.ground ? 0.25 : 0.5, 0, C.lean * 0.4); FP.legs.forEach((l, i) => { l.rotation.x = -1.05; l.rotation.z = (i ? 1 : -1) * 0.7; }); FP.arms.forEach((a, i) => { a.rotation.x = -1.15; a.rotation.z = (i ? 1 : -1) * 0.25; }); fox.position.copy(X.V.seatLocal); },
    cart(fox, FP) { const C = X.C, sp = Math.abs(C.speed); fox.rotation.set(0, 0, 0);
      if (F.ride) { FP.body.rotation.set(-0.15, 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = -1.45; l.rotation.z = (i ? 1 : -1) * 0.15; }); FP.arms.forEach((a, i) => { a.rotation.x = sp > 3 ? -2.8 + Math.sin(X.St.t * 8 + i) * 0.15 : -0.5; a.rotation.z = (i ? 1 : -1) * 0.35; }); fox.position.set(0, 0.2, -0.05); }
      else { const run = sp > 0.4, ph = F.run || 0; FP.body.rotation.set(0.35, 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = run ? Math.sin(ph + i * Math.PI) * 0.8 : 0; l.rotation.z = 0; }); FP.arms.forEach((a, i) => { a.rotation.x = -1.3; a.rotation.z = (i ? 1 : -1) * 0.12; }); fox.position.set(0, run ? Math.abs(Math.sin(ph)) * 0.05 : 0, -0.9); } },
    hamster(fox, FP) { const C = X.C, sp = Math.abs(C.speed), ph = F.run || 0, run = sp > 0.3; fox.rotation.set(0, 0, 0); FP.body.rotation.set(run ? 0.25 : 0, 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = run ? Math.sin(ph + i * Math.PI) * 0.9 : 0; l.rotation.z = 0; }); FP.arms.forEach((a, i) => { a.rotation.x = run ? -Math.sin(ph + i * Math.PI) * 0.8 : 0; a.rotation.z = (i ? 1 : -1) * 0.15; }); fox.position.set(0, 0.04 + (run ? Math.abs(Math.sin(ph)) * 0.05 : 0), 0); },
    bumper(fox, FP) { fox.rotation.set(0, 0, 0); FP.body.rotation.set(-0.1, 0, -X.C.steer * 0.15); FP.legs.forEach((l, i) => { l.rotation.x = -1.4; l.rotation.z = (i ? 1 : -1) * 0.2; }); FP.arms.forEach((a, i) => { a.rotation.x = F.horn > 0 && i ? -2.8 : -1.0; a.rotation.z = (i ? 1 : -1) * 0.25; }); fox.position.set(0, 0.32, -0.12); },
    rskate(fox, FP) { const C = X.C, sp = Math.abs(C.speed), a = F.str || 0, st = C.ground && sp > 0.5; fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.35 + Math.min(1, sp / 13) * 0.15, Math.sin(a * Math.PI) * 0.15, C.lean * 0.4);
      FP.legs[0].rotation.x = st ? Math.sin(a * Math.PI) * 0.5 : 0; FP.legs[1].rotation.x = st ? -Math.sin(a * Math.PI) * 0.5 : 0; FP.legs[0].rotation.z = -0.1 - (st ? Math.max(0, Math.sin(a * Math.PI)) * 0.25 : 0); FP.legs[1].rotation.z = 0.1 + (st ? Math.max(0, -Math.sin(a * Math.PI)) * 0.25 : 0);
      FP.arms.forEach((ar, i) => { ar.rotation.x = st ? -Math.sin(a * Math.PI + i * Math.PI) * 0.7 : -0.3; ar.rotation.z = (i ? 1 : -1) * (F.kT != null ? 1.3 : 0.25); }); fox.position.set(0, 0.1, 0);
      X.V.skates.forEach((k, i) => { k.g.position.set((i ? 1 : -1) * 0.13 + Math.sin(FP.legs[i].rotation.z) * 0.5 * (i ? 1 : 1), 0, Math.sin(-FP.legs[i].rotation.x) * 0.45); k.g.rotation.x = FP.legs[i].rotation.x * 0.3; }); },
    crane(fox, FP) { fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.1, 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = -1.4; l.rotation.z = (i ? 1 : -1) * 0.15; }); FP.arms.forEach((a, i) => { a.rotation.x = -1.0 + (X.holds.b1 ? Math.sin(X.St.t * 10 + i) * 0.2 : 0); a.rotation.z = (i ? 1 : -1) * 0.25; }); fox.position.copy(X.V.seatLocal); fox.position.y -= 0.4; },
    balloon(fox, FP) { fox.rotation.set(0, 0, 0); FP.body.rotation.set(0, 0, 0); FP.legs.forEach(l => { l.rotation.x = 0; l.rotation.z = 0; }); FP.arms.forEach((a, i) => { a.rotation.x = X.holds.b3 && i ? -2.9 : F.bagT > 0 && !i ? -1.6 : -0.6; a.rotation.z = (i ? 1 : -1) * 0.3; }); F.bagT = Math.max(0, (F.bagT || 0) - 1 / 60); fox.position.set(0, 0.1, 0); },
    spider(fox, FP) { fox.rotation.set(0, 0, 0); FP.body.rotation.set(0.25, 0, 0); FP.legs.forEach((l, i) => { l.rotation.x = -1.4; l.rotation.z = (i ? 1 : -1) * 0.25; }); FP.arms.forEach((a, i) => { a.rotation.x = -0.9; a.rotation.z = (i ? 1 : -1) * 0.3; }); fox.position.copy(X.V.seatLocal); fox.position.y = X.V.sbody.position.y + 0.15; },
  };

  // ---------- buttons: return true when handled ----------
  const pinGeo = new THREE.CylinderGeometry(0.04, 0.07, 0.36, 8);
  const BT = {
    boat(n, d) { const C = X.C, t = X.St.t;
      if (n === 1) { if (d) { F.t1 = t; F.chg = false; return true; } const ch = F.chg; F.chg = false; if ((F.tcd || 0) > t) return true; F.tcd = t + (ch ? 1.6 : 0.6); if (ch) { fireTorp(-0.22, -1); fireTorp(0, 0); fireTorp(0.22, 1); X.popup(X.tmp.set(C.x, 3.4, C.z), 'SPREAD', '#ec3013'); } else { F.side = -(F.side || 1); fireTorp(0, F.side); } return true; }
      if (n === 2) { if (!d) return true; if (!C.ground) { if (C.rollT == null) { C.rollT = 0; X.audio.tone(800, 0.1, 0.04, 'triangle', 1.6); } } else if (F.pt == null && X.inLake(C.x, C.z)) { F.pt = 0; F.ptDir = C.steer > 0.1 ? -1 : C.steer < -0.1 ? 1 : (Math.random() < 0.5 ? 1 : -1); F.ptFast = Math.abs(C.speed) > 10; C.speed *= 0.55; if (SK && SK.up && F.ptFast && SK.down <= 0) { SK.down = 2.5; X.popup(X.tmp.set(SK.x, 2.6, SK.z), 'SKIER WIPEOUT', '#ec3013'); X.spray(X.tmp.set(SK.x, 0.4, SK.z), 14, 5); } X.audio.burst(0.6, 1200, 0.2); } return true; }
      if (n === 3) { if (!d) return true; if (!X.inLake(C.x, C.z)) { X.popup(X.tmp.set(C.x, 2.6, C.z), 'BEACHED', '#9ca3af'); return true; } if (C.nitroCd > 0) return true; C.nitro = 2.2; C.nitroCd = 4.5; X.popup(X.tmp.set(C.x, 3.2, C.z), 'NITRO', '#38bdf8'); X.audio.burst(0.5, 1200, 0.18); X.audio.tone(220, 0.5, 0.05, 'sawtooth', 2); return true; } return true; },
    hopper(n, d) { const C = X.C; if (n === 1 && d) { F.belly = true; if (!C.ground) C.vy = Math.min(C.vy, -16); } if (n === 3) { if (d) F.chg = 0; else { if ((F.chg || 0) > 0.15) F.superQ = F.chg; F.chg = 0; } } return true; },
    kroo(n, d) { const C = X.C; if (!d) return true; if (n === 1) { F.stomp = true; if (!C.ground) C.vy = Math.min(C.vy, -20); } if (n === 2 && !C.ground && !(F.kick > 0)) { F.kick = 0.45; C.vy = Math.max(C.vy, 2); X.audio.burst(0.3, 1400, 0.15); } if (n === 3) { if (C.ground) { F.hopQ = true; F.comp = 0.5; } } return true; },
    jetpack(n, d) { const C = X.C; if (n === 2 && d && !C.ground && F.rollT == null) { F.rollT = 0; X.audio.burst(0.3, 800, 0.1); } return true; },
    hover(n, d) { const C = X.C; if (n === 1) { if (d) { F.t1 = X.St.t; F.chg = false; } else { const ch = F.chg; F.chg = false; if ((F.lcd || 0) > X.St.t && !ch) return true; F.lcd = X.St.t + (ch ? 0.8 : 0.22); X.bikeLaser(ch); } }
      if (n === 2 && d && F.flipT == null) { if (!F.air) { F.air = true; C.ground = false; C.vy = 5; } F.flipT = 0; X.audio.tone(800, 0.1, 0.04, 'triangle', 1.6); }
      if (n === 3 && d && !F.air) { F.air = true; C.ground = false; C.vy = 9; X.audio.tone(400, 0.25, 0.05, 'sine', 2); X.puff(X.tmp.set(C.x, 0.3, C.z), 0x7dd3fc, 8, 2.5, 0.6, 0.5, true); } return true; },
    unicycle(n, d) { const C = X.C; if (!d || F.fallT > 0) return true;
      if (n === 1 && (F.pcd || 0) < X.St.t) { F.pcd = X.St.t + 0.35; F.throwT = 0.25; const m = new THREE.Mesh(pinGeo, toon(Math.random() < 0.5 ? '#f3f2f2' : '#ec3013')); m.position.set(C.x, C.y + 1.6, C.z); const fx = Math.sin(C.yaw), fz = Math.cos(C.yaw);
        throwProj(m, new THREE.Vector3(fx * (11 + Math.max(0, C.speed)), 5, fz * (11 + Math.max(0, C.speed))), (w, o) => { if (w === 'npc') { X.npcDown(o, fx * 4, fz * 4, 'BONK!'); X.St.score += 15; X.popup(X.tmp.set(o.x, 2.6, o.z), '+15', '#0e7fb8'); } else if (w === 'prop') { if (o.kind === 'crate') X.smash(o, 'pin'); else X.damage(o, 3, 'pin'); } X.audio.tone(700, 0.06, 0.04, 'square'); }); X.audio.tone(500, 0.08, 0.03, 'triangle', 1.4); }
      if (n === 2 && F.spinT == null) F.spinT = 0;
      if (n === 3 && C.ground) { C.vy = 6.5; C.ground = false; X.audio.tone(300, 0.12, 0.05, 'triangle', 1.8); } return true; },
    turtle(n, d) { const C = X.C; if (n === 1 && d && F.spinT == null && F.stT == null) { F.spinT = 0; F.spinN = 0; X.audio.burst(0.6, 600, 0.12); }
      if (n === 2) { if (d) F.hidT = 0; else if ((F.hidT || 0) > 1 && F.hid > 0.7) shock(3.5, 'POP OUT', 10); }
      if (n === 3 && d && F.stT == null && F.spinT == null) { F.stT = 0; F.stDone = false; } return true; },
    ostrich(n, d) { const C = X.C; if (!d) return true; if (n === 1 && F.peckT == null) { F.peckT = 0; F.pkDone = false; X.audio.tone(900, 0.05, 0.04, 'square'); } if (n === 2 && F.dustT == null) { F.dustT = 0; F.dsDone = false; X.audio.burst(0.4, 500, 0.15); } if (n === 3 && C.ground) { C.vy = 7.5; C.ground = false; X.audio.tone(500, 0.1, 0.04, 'triangle', 1.6); } return true; },
    dragon(n, d) { const C = X.C; if (!d) return true; if (n === 2 && F.whipT == null) { F.whipT = 0; F.whN = 0; X.audio.burst(0.4, 900, 0.12); }
      if (n === 3) { if ((F.st ?? 1) > 0.15) { F.st = (F.st ?? 1) - 0.2; C.vy = Math.min(11, Math.max(C.vy, 0) + 7.5); C.ground = false; C.y += 0.05; F.flapT = 0.4; X.audio.burst(0.25, 400, 0.15); X.puff(X.tmp.set(C.x, 0.2, C.z), 0xb8a77a, 6, 3, 0.8, 0.5); } else X.popup(X.tmp.set(C.x, C.y + 2.8, C.z), 'TIRED', '#9ca3af'); } return true; },
    cart(n, d) { const C = X.C; if (!d) return true;
      if (n === 1) { if (!(F.cargo > 0)) { X.popup(X.tmp.set(C.x, 2.6, C.z), 'NO CRATES', '#9ca3af'); return true; } F.cargo--; const fx = Math.sin(C.yaw), fz = Math.cos(C.yaw), m = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.32, 0.36), toon('#8a5a2e')); m.position.set(C.x + fx * 0.3, C.y + 1.4, C.z + fz * 0.3);
        const land = (x, z) => { X.puff(X.tmp.set(x, 0.3, z), 0x8a5a2e, 8, 3, 0.5, 0.6); const n2 = knock(x, z, 1.8, 6, 'CRATED!'); if (n2) { X.St.score += 20 * n2; X.popup(X.tmp.set(x, 2.6, z), 'CRATED +' + 20 * n2, '#ffd23a'); } X.audio.burst(0.2, 400, 0.18); };
        throwProj(m, new THREE.Vector3(fx * (10 + Math.max(0, C.speed)), 4.5, fz * (10 + Math.max(0, C.speed))), (w, o) => { if (w === 'prop') { if (o.kind === 'crate') X.smash(o, 'crate'); else X.damage(o, 4, 'crate'); } land(m.position.x, m.position.z); }, 16, 3); }
      if (n === 2 && F.dsT == null) { F.dsT = 0; F.dsN = 0; X.audio.burst(0.4, 1600, 0.1); }
      if (n === 3) { F.ride = !F.ride; if (F.ride) { F.rs = Math.abs(C.speed) + 2; F.stopPop = false; X.popup(X.tmp.set(C.x, 2.6, C.z), Math.abs(C.speed) > 4 ? 'WHEEE!' : 'HOPPED IN', '#0e7fb8'); } else { C.speed = 0; X.popup(X.tmp.set(C.x, 2.6, C.z), 'HOPPED OUT', '#9ca3af'); } X.audio.tone(400, 0.1, 0.04, 'triangle', 1.5); } return true; },
    hamster(n, d) { const C = X.C; if (!d) return true; if (n === 1 && !(F.dash > 0) && (F.dcd || 0) < X.St.t) { F.dash = 0.6; F.dcd = X.St.t + 1.5; X.popup(X.tmp.set(C.x, 3, C.z), 'DASH', '#0e7fb8'); X.audio.burst(0.3, 1200, 0.15); }
      if (n === 2) { F.pin = 3; X.popup(X.tmp.set(C.x, 3, C.z), 'PINBALL!', '#ffd23a'); X.audio.tone(1000, 0.15, 0.05, 'square', 1.5); } if (n === 3 && C.ground) { C.vy = 8; C.ground = false; X.audio.tone(300, 0.12, 0.05, 'triangle', 1.8); } return true; },
    bumper(n, d) { const C = X.C; if (!d) return true; if (n === 1 && !(F.chg > 0) && (F.ccd || 0) < X.St.t) { F.chg = 0.5; F.ccd = X.St.t + 1.2; X.popup(X.tmp.set(C.x, 2.6, C.z), 'CHARGE', '#0e7fb8'); X.audio.burst(0.3, 1200, 0.15); }
      if (n === 2 && F.so == null) { F.so = 0; F.soN = 0; X.audio.burst(0.5, 1800, 0.12); }
      if (n === 3) { F.horn = 0.5; X.audio.tone(330, 0.35, 0.07, 'square'); X.audio.tone(415, 0.35, 0.06, 'square'); let k = 0; for (const n2 of X.npcs) { const dd = Math.hypot(n2.x - C.x, n2.z - C.z); if (n2.st === 'walk' && dd < 7) { n2.x += (n2.x - C.x) / (dd || 1) * 2.5; n2.z += (n2.z - C.z) / (dd || 1) * 2.5; n2.f.userData.mood = 'surprised'; X.popup(X.tmp.set(n2.x, 2.6, n2.z), 'EEK!', '#ec3013'); k++; } } if (k) X.St.score += 5 * k; } return true; },
    rskates(n, d) { const C = X.C; if (!d) return true; if (n === 1 && F.kT == null) { F.kT = 0; F.kDone = false; X.audio.burst(0.3, 1400, 0.12); }
      if (n === 2 && F.spT == null) { F.spT = 0; F.spAir = !C.ground; if (C.ground) { C.vy = 4.5; C.ground = false; } X.audio.tone(800, 0.1, 0.04, 'triangle', 1.6); }
      if (n === 3 && !(F.rk > 0) && (F.rcd || 0) < X.St.t) { F.rk = 1.1; F.rcd = X.St.t + 3; X.popup(X.tmp.set(C.x, 2.8, C.z), 'ROCKET', '#ec3013'); X.audio.burst(0.6, 500, 0.2); X.audio.tone(200, 0.6, 0.05, 'sawtooth', 2.5); } return true; },
    crane(n, d) { const C = X.C; if (!d) return true;
      if (n === 2 && F.drop == null && !F.grab) { F.drop = 0; F.dropHit = false; X.audio.tone(400, 0.4, 0.05, 'sawtooth', 0.4); }
      if (n === 3) { X.veh.updateMatrixWorld(true); const tw = X.V.tip.getWorldPosition(new THREE.Vector3());
        if (F.grab) { const o = F.grab; F.grab = null; const out = new THREE.Vector3(tw.x - C.x, 0, tw.z - C.z).normalize(); o.fly = { vx: out.x * 14, vz: out.z * 14, vy: 6, spin: X.rr(-5, 5) }; X.popup(X.tmp.set(o.x, 3, o.z), 'FLING!', '#ffd23a'); X.St.score += 20; X.audio.burst(0.4, 700, 0.15); F.flung = o; }
        else { let best = null, bd = 9; for (const o of X.props) { if (o.dead) continue; const dd = Math.hypot(o.x - tw.x, o.z - tw.z); if (dd < bd) { bd = dd; best = o; } } if (best) { F.grab = best; X.popup(X.tmp.set(best.x, 3, best.z), 'MAGNET', '#0e7fb8'); X.audio.tone(120, 0.3, 0.05, 'sawtooth', 2); } else X.popup(X.tmp.set(C.x, 3, C.z), 'NOTHING IN REACH', '#9ca3af'); } } return true; },
    balloon(n, d) { const C = X.C; if (!d) return true;
      if (n === 1) { if ((F.bagsLeft ?? 4) <= 0) { X.popup(X.tmp.set(C.x, C.y + 2, C.z), 'NO SANDBAGS', '#9ca3af'); return true; } F.bagsLeft = (F.bagsLeft ?? 4) - 1; F.bagT = 0.3; const m = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 8), toon('#c9b27a')); m.scale.y = 1.3; m.position.set(C.x, C.y + 0.4, C.z);
        throwProj(m, new THREE.Vector3(0, -1, 0), (w, o) => { const p = m.position; X.puff(X.tmp.set(p.x, 0.3, p.z), 0xd9c38a, 10, 3, 0.7, 0.6); X.audio.burst(0.25, 300, 0.2); const n2 = knock(p.x, p.z, 2.2, 5, 'THUD!'); if (w === 'prop') { if (o.kind === 'crate') X.smash(o, 'bag'); else X.damage(o, 3, 'bag'); } if (n2) { X.St.score += 20 * n2; X.popup(X.tmp.set(p.x, 2.6, p.z), 'SANDBAGGED +' + 20 * n2, '#ffd23a'); } }, 16, 6); }
      if (n === 2) { F.blast = 0.8; X.audio.burst(0.6, 250, 0.2); } return true; },
    spider(n, d) { const C = X.C; if (!d) return true;
      if (n === 1 && (F.wcd || 0) < X.St.t) { F.wcd = X.St.t + 0.5; X.veh.updateMatrixWorld(true); const p = X.V.muzzle.getWorldPosition(new THREE.Vector3()), fx = Math.sin(C.yaw), fz = Math.cos(C.yaw); const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 6), toon('#f3f2f2')); m.position.copy(p);
        throwProj(m, new THREE.Vector3(fx * 22, 2, fz * 22), (w, o) => { if (w === 'npc' && !(o.webT > 0)) { o.webT = 4; o.webX = o.x; o.webZ = o.z; const wm = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55, wireframe: true })); wm.position.set(o.x, 0.8, o.z); wm.scale.y = 1.6; X.scene.add(wm); o.webM = wm; X.popup(X.tmp.set(o.x, 2.6, o.z), 'WEBBED +15', '#0e7fb8'); X.St.score += 15; } else if (w === 'prop' && o.kind === 'crate') X.smash(o, 'web'); }, 6, 1.2); X.audio.tone(1200, 0.08, 0.04, 'sine', 0.5); }
      if (n === 2 && C.ground && !F.climb) { C.vy = 11; C.ground = false; C.speed = Math.max(C.speed, 9); F.pounce = true; X.audio.tone(250, 0.2, 0.05, 'sawtooth', 2); } return true; },
  };

  return {
    specs, has: k => !!specs[k],
    make(k) { const r = B[k](); r.userData.V.spec = specs[k]; return r; },
    reset(k) { F = {}; for (const T of torps) X.scene.remove(T.m); torps.length = 0; skierKill(); for (const p of proj) X.scene.remove(p.m); proj.length = 0; if (specs[k]) { X.C.ground = true; X.C.y = 0; X.C.wheelie = 0; } },
    update(dt, thr, sp) { updProj(dt); const f = U[X.St.key]; if (f) f(dt, thr, sp); },
    pose(pz) { const f = P[pz]; if (!f) return false; f(X.fox, X.FP); return true; },
    press(n, down) { const f = BT[X.St.key]; return f ? f(n, down) : false; },
  };
}
