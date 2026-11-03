// MERU LANES — a fox bowler on lane one, on a loop: picks a ball off the return, steps up, four-step approach, swing, release,
// the ball hooks down the lane into the pocket, the pins scatter (a strike most times, a few left standing otherwise), a hop
// or a slump, the pinsetter resets them, back to the return. Built in the lanes group's own frame (down the lane = −z).
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => t * t * (3 - 2 * t);
export function createBowler({ THREE, T, makeFox, animFox, M, toon, look, pins, lane = -4, audio }) {
  const fox = makeFox({ key: 'bowlerDash', name: 'Dash', outfit: 'vest', torso: ['#fde047', '#7c3aed', '#3b0764'], crest: '8', mood: 'determined', look });
  T.add(fox);
  const ball = M(new THREE.SphereGeometry(0.2, 16, 12), toon('#7c3aed'), 0, -5, 0, T, 0.01, 0.2); ball.visible = false;
  for (const [x, y, z] of [[0.06, 0.12, 0.13], [-0.05, 0.13, 0.13], [0, 0.17, 0.08]]) M(new THREE.SphereGeometry(0.03, 6, 4), toon('#1e1b2e'), x, y, z, ball, 0);
  const base = pins.map(p => ({ p, x: p.position.x, y: p.position.y, z: p.position.z, k: 0, hit: false, vx: 0, vz: 0, up: 0, rz: 0, rx: 0 }));
  const RET = { x: lane + 1.0, z: 6.4 }, SET = { x: lane, z: 7.6 }, FOUL = { x: lane, z: 5.45 }, HEAD = -9.95;
  const v = new THREE.Vector3(), CYCLE = 10.6;
  let c = Math.random() * 3, released = false, impacted = false, strike = true, fx = RET.x, fz = RET.z, face = Math.PI / 2, rollFrom = null;
  function knock() {
    impacted = true; strike = Math.random() < 0.65; const keep = strike ? 0 : 1 + Math.floor(Math.random() * 3), stand = new Set(); while (stand.size < keep) stand.add(6 + Math.floor(Math.random() * 4));
    base.forEach((b, i) => { b.hit = !stand.has(i); b.k = 0; const dx = b.x - ball.position.x; b.vx = (dx * 1.6 + (Math.random() - 0.5) * 0.6); b.vz = -(0.5 + Math.random() * 0.9); b.up = Math.random() < 0.4 ? 0.25 + Math.random() * 0.45 : 0; b.rz = -Math.sign(dx || 0.01) * (1.2 + Math.random() * 0.35); b.rx = -(0.9 + Math.random() * 0.6); });
    const A = audio(); if (A && A.burst) { A.burst(0.45, 2600, 0.14); A.tone(180, 0.25, 0.04, 'triangle', 0.7); }
  }
  const cw = new THREE.Vector3(), lw = new THREE.Vector3(), L = (x, y, z, out) => T.localToWorld(out.set(x, y, z));
  let show = null;
  return {
    showcase() { c = 2.25; released = false; impacted = false; rollFrom = null; show = { t: 0 }; },
    // the camera for the showcase: beside Dash on the approach, then low behind the ball down the lane, then on the pins, then hand back
    cam() {
      if (!show) return null; const t = show.t;
      if (t > 6.0) { show = null; return null; }
      if (c < 3.62 && !released) { L(lane + 2.6, 2.4, FOUL.z + 4.2, cw); L(fx, 0.9, fz - 1.0, lw); }
      else if (!impacted) { const b = ball.position; L(b.x + 0.25, 0.75, b.z + 2.0, cw); L(b.x, 0.25, b.z - 2.5, lw); }
      else { L(lane + 0.4, 0.9, HEAD + 3.0, cw); L(lane, 0.25, HEAD - 0.5, lw); }
      return { cam: cw, look: lw, done: t > 5.4 };
    },
    update(dt, active) {
      if (show) show.t += dt;
      fox.visible = ball.visible && active || active; if (!active) return;
      c += dt; if (c >= CYCLE) { c -= CYCLE; released = false; impacted = false; rollFrom = null; }
      let spd = 0, armX = null, hold = false, tx = fx, tz = fz, tf = face;
      if (c < 1.0) { tx = RET.x; tz = RET.z; tf = Math.PI / 2; const a = Math.sin(clamp((c - 0.3) / 0.6, 0, 1) * Math.PI); armX = -1.3 * a; hold = c > 0.65; }
      else if (c < 2.2) { const u = ease((c - 1.0) / 1.2); tx = lerp(RET.x, SET.x, u); tz = lerp(RET.z, SET.z, u); tf = Math.atan2(SET.x - RET.x, SET.z - RET.z) * (u < 0.7 ? 1 : 0) + (u < 0.7 ? 0 : Math.PI); spd = 2; hold = true; armX = -0.5; }
      else if (c < 2.6) { tx = SET.x; tz = SET.z; tf = Math.PI; hold = true; armX = -0.9; }
      else if (c < 3.8) { const u = (c - 2.6) / 1.2; tx = SET.x; tz = lerp(SET.z, FOUL.z, ease(Math.min(1, u * 1.15))); tf = Math.PI; spd = 3.2 * (1 - u * 0.5); armX = u < 0.55 ? lerp(-0.4, 1.35, u / 0.55) : lerp(1.35, -1.7, (u - 0.55) / 0.45); hold = c < 3.62; }
      else if (c < 7.0) { tx = FOUL.x; tz = FOUL.z; tf = Math.PI; armX = c < 4.6 ? lerp(-1.7, -0.6, (c - 3.8) / 0.8) : null; }
      else if (c < 8.2) { const u = ease((c - 7.0) / 1.2); tx = lerp(FOUL.x, RET.x, u); tz = lerp(FOUL.z, RET.z, u); tf = Math.atan2(RET.x - FOUL.x, RET.z - FOUL.z); spd = 2; }
      else { tx = RET.x; tz = RET.z; tf = Math.PI; }
      let df = tf - face; df = Math.atan2(Math.sin(df), Math.cos(df)); face += df * Math.min(1, dt * 8); fx = tx; fz = tz;
      fox.position.set(fx, 0.08, fz); fox.rotation.y = face; animFox(fox, dt, spd);
      const arm = fox.userData.P && fox.userData.P.arms[1]; if (arm && armX != null) { arm.rotation.x = armX; arm.rotation.z = 0.15; }
      // the ball: in hand, then rolling (a gentle hook into the pocket), then gone into the pit
      if (hold && arm) { arm.localToWorld(v.set(0, -0.5, 0.14)); T.worldToLocal(v); ball.position.copy(v); ball.visible = true; }
      else if (c >= 3.62 && !impacted || (impacted && c < 6.3)) {
        if (!released) { released = true; rollFrom = { x: ball.position.x, z: ball.position.z, y: ball.position.y, t: c }; const A = audio(); if (A && A.tone) A.tone(70, 1.6, 0.05, 'sine', 1.3); }
        const u = clamp((c - rollFrom.t) / 2.3, 0, 1.15), z = lerp(rollFrom.z, HEAD, u), x = lane + 0.32 * Math.sin(Math.min(1, u) * Math.PI) * 0.9 + 0.06 * Math.min(1, u);
        ball.position.set(x, Math.max(0.2, lerp(rollFrom.y, 0.2, Math.min(1, u * 6))), z); ball.rotation.x -= dt * 22; ball.visible = u < 1.12;
        if (u >= 1 && !impacted) knock();
      } else if (!hold) ball.visible = false;
      // pins: fly on the hit, lie there, then the pinsetter stands them back up
      const reset = c > 8.6 ? clamp((c - 8.6) / 0.5, 0, 1) : 0;
      for (const b of base) {
        if (impacted && b.hit && reset === 0) b.k = Math.min(1, b.k + dt * 2.2);
        const k = b.hit ? ease(b.k) * (1 - reset) : 0;
        b.p.position.set(b.x + b.vx * 0.45 * k, b.y + Math.sin(Math.min(1, b.k) * Math.PI) * b.up * (1 - reset), b.z + b.vz * 0.6 * k); b.p.rotation.set(b.rx * k, 0, b.rz * k);
        if (reset >= 1) { b.hit = false; b.k = 0; }
      }
      // the reaction
      if (impacted && c > 6.1 && c < 6.15) { fox.userData.hop = 1; }
      fox.userData.lineMood = impacted && c > 6.1 && c < 7.6 ? (strike ? 'excited' : 'sad') : null;
    },
  };
}
