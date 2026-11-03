// MERU TAVERN — a second dart board on the east wall, and Flick, a fox who plays it on a loop: three darts (wind-up, snap,
// the dart arcs in and sticks), walks up to the board, pulls them out one by one, walks back to the oche, again.
import { applyD, neutralD, endPose } from '../engine/fox-poses.js?v=s648k';   // s615 jointed Flick
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => t * t * (3 - 2 * t);
// s615 JOINTED FLICK: the same darts throw as the player (paw by the cheek, elbow at the board, forearm hinge, follow-through), a reach up to pull
// each dart out of the board, a glance + grin after a good set. Walking keeps the old walk.
const mxv = (a, b, k) => a.map((x, i) => x + (b[i] - x) * k);
function flickThrow(THREE, fox, k, pull) { const Q = neutralD(), AIM = [-0.06, 0.2, 0.44], BACK = [-0.06, 0.26, 0.28], OUT = [-0.02, 0.18, 0.68];
  if (pull != null) { const r = Math.sin(pull * Math.PI); Q.a[1] = mxv([-0.06, 0.36, 0.44], [-0.06, 0.3, 0.3], r); Q.pole[1] = [0.6, -1, 0]; Q.palm[1] = [-1, 0, 0.1]; Q.g[1] = 0.3 + r * 0.6; Q.op[1] = 1; Q.head = [-0.15, 0, 0]; Q.mood = 'curious'; applyD(THREE, fox, Q, k, 1); return; }
  const A = k < 0.45 ? mxv(AIM, BACK, ease(k / 0.45)) : k < 0.6 ? mxv(BACK, OUT, ease((k - 0.45) / 0.15)) : mxv(OUT, AIM, clamp((k - 0.6) / 0.4, 0, 1));
  Q.a[1] = A; Q.pole[1] = [0.3, -1, 0.15]; Q.palm[1] = [-1, 0.1, 0]; Q.g[1] = k > 0.5 && k < 0.7 ? 0.1 : 0.55; Q.op[1] = 1; Q.wr[1] = [k > 0.45 && k < 0.7 ? 0.3 : -0.3, 0];
  Q.a[0] = [0.1, -0.56, 0.12]; Q.l = [[0.06, 0.05, -0.1], [0.0, 0.05, 0.16]]; Q.lean = 0.08 + (k > 0.45 && k < 0.7 ? 0.06 : 0); Q.twist = -0.12; Q.head = [0.04, 0.1, 0]; Q.mood = 'squint'; applyD(THREE, fox, Q, k, 1); }
export function createDarter({ THREE, scene, makeFox, animFox, M, toon, grad, boardTex, look, board, oche, audio }) {
  // the board (same build as the first one)
  // everything lives in R: the original east-wall frame (board faces -x). board.a (deg, 270 = faces west) turns it; board.oche = metres in front
  const R = new THREE.Group(); R.position.set(board.x, 0, board.z); R.rotation.y = board.a != null ? (board.a - 270) * Math.PI / 180 : 0; scene.add(R);
  const OX = board.a != null ? -(board.oche ?? 5.24) : oche - board.x;
  const db = new THREE.Group(); db.position.set(0, board.y, 0); db.rotation.y = -Math.PI / 2; R.add(db);
  M(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 40), toon('#3a2618'), 0, 0, -0.04, db, 0.02, 0.85).rotation.x = Math.PI / 2;
  const bface = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), new THREE.MeshToonMaterial({ map: boardTex, gradientMap: grad })); bface.position.z = 0.01; db.add(bface);
  M(new THREE.TorusGeometry(0.66, 0.035, 8, 48), toon('#cbd5e1'), 0, 0, 0.01, db, 0);
  M(new THREE.BoxGeometry(0.1, 0.03, 1.4), toon('#e0a84a'), OX, 0.02, 0, R, 0);
  // the darts
  const flightM = toon('#38bdf8'), shaftM = toon('#e5e7eb'), tipM = toon('#64748b');
  const darts = Array.from({ length: 3 }, () => { const g = new THREE.Group(); R.add(g); g.visible = false;
    M(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), shaftM, 0, 0, 0, g, 0).rotation.z = Math.PI / 2;
    M(new THREE.ConeGeometry(0.01, 0.05, 6), tipM, 0.1, 0, 0, g, 0).rotation.z = -Math.PI / 2;
    for (const r of [0, Math.PI / 2]) { const f = M(new THREE.BoxGeometry(0.05, 0.002, 0.04), flightM, -0.09, 0, 0, g, 0); f.rotation.x = r; }
    return { g, stuck: false, from: new THREE.Vector3(), to: new THREE.Vector3(), t: 0 }; });
  const fox = makeFox({ key: 'darterFlick', name: 'Flick', outfit: 'coat', torso: ['#fecaca', '#b91c1c', '#450a0a'], crest: '8', mood: 'determined', look, joints: true }); R.add(fox);
  const STAND = { x: OX - 0.35, z: 0 }, BOARD_FRONT = { x: -0.75, z: 0 };
  const v = new THREE.Vector3();
  let c = 0, face = Math.PI / 2, fx = STAND.x, fz = STAND.z, n = 0;
  const T_THROW = 1.3, T_WALK = 1.9, T_PULL = 1.6, CYCLE = T_THROW * 3 + T_WALK + T_PULL + T_WALK + 0.6;
  let hold = false, mt = null;   // s89: MATCH mode (worlds/meru2-tavern-fun.js): Flick stands at the oche and throws only when told (throwTo)
  function throwDart(i, u, w, cb) {
    const d = darts[i], arm = fox.userData.P && fox.userData.P.arms[1]; if (arm) { arm.localToWorld(v.set(0, -0.5, 0.15)); R.worldToLocal(v); d.from.copy(v); } else d.from.set(fx + 0.3, 1.6, fz);
    const r = Math.sqrt(Math.random()) * 0.45, a = Math.random() * Math.PI * 2; if (u != null) d.to.set(-0.03, board.y + w, u); else d.to.set(-0.03, board.y + Math.sin(a) * r, Math.cos(a) * r); d.cb = cb || null; d.t = 0; d.stuck = false; d.flying = true; d.g.visible = true;
    const A = audio(); if (A && A.burst) A.burst(0.08, 3200, 0.06);
  }
  function flyDarts(dt) { for (const d of darts) { if (!d.flying) continue; d.t += dt / 0.32; const u = Math.min(1, d.t); d.g.position.set(lerp(d.from.x, d.to.x, u), lerp(d.from.y, d.to.y, u) + Math.sin(u * Math.PI) * 0.18, lerp(d.from.z, d.to.z, u)); d.g.rotation.set(0, 0, -0.25 + u * 0.25);
      if (u >= 1) { d.flying = false; d.stuck = true; const A = audio(); if (A && A.burst) A.burst(0.05, 900, 0.12); if (d.cb) { const f = d.cb; d.cb = null; f(); } } } }
  const clearDarts = () => darts.forEach(d => { d.g.visible = false; d.flying = d.stuck = false; d.cb = null; });
  let fPosed = false;
  return {
    fox,
    setHold(on) { hold = !!on; mt = null; clearDarts(); c = 0; },
    clear: clearDarts,
    // u = board right (m), w = up from the centre (m); onLand() when it sticks
    throwTo(i, u, w, onLand) { mt = { i, u, w, k: 0, done: false, cb: onLand }; },
    update(dt, active) { if (!active && fPosed) { endPose(fox); fPosed = false; }
      fox.visible = active || hold; for (const d of darts) if (!active && !hold) d.g.visible = false; if (!active && !hold) return;
      if (hold) { let df = Math.PI / 2 - face; df = Math.atan2(Math.sin(df), Math.cos(df)); face += df * Math.min(1, dt * 8); fox.position.set(STAND.x, 0.06, STAND.z); fox.rotation.y = face; animFox(fox, dt, 0);
        const arm = fox.userData.P && fox.userData.P.arms[1];
        if (mt && fox.userData.P.fore) { mt.k += dt; flickThrow(THREE, fox, Math.min(1, mt.k)); if (mt.k >= 0.52 && !mt.done) { mt.done = true; throwDart(mt.i, mt.u, mt.w, mt.cb); } if (mt.k > 1.0) mt = null; fPosed = true; } else if (fox.userData.P.fore) { flickThrow(THREE, fox, 0.99); fPosed = true; }
        else if (mt) { mt.k += dt; const k = mt.k; if (arm) { arm.rotation.x = k < 0.45 ? lerp(-0.4, -2.3, ease(k / 0.45)) : k < 0.6 ? lerp(-2.3, -1.0, (k - 0.45) / 0.15) : lerp(-1.0, -0.4, clamp((k - 0.6) / 0.4, 0, 1)); arm.rotation.z = 0.1; }
          if (k >= 0.52 && !mt.done) { mt.done = true; throwDart(mt.i, mt.u, mt.w, mt.cb); } if (k > 1.0) mt = null; }
        flyDarts(dt); fox.userData.lineMood = 'determined'; return; }
      const prev = c; c = (c + dt) % CYCLE; if (c < prev) n++;
      let tx = STAND.x, tz = STAND.z, tf = Math.PI / 2, spd = 0, armX = null;
      const tw = T_THROW * 3;
      if (c < tw) { const k = c % T_THROW, i = Math.floor(c / T_THROW); armX = k < 0.45 ? lerp(-0.4, -2.3, ease(k / 0.45)) : k < 0.6 ? lerp(-2.3, -1.0, (k - 0.45) / 0.15) : lerp(-1.0, -0.4, clamp((k - 0.6) / 0.4, 0, 1)); if (k >= 0.52 && (prev % T_THROW) < 0.52 && prev < tw) throwDart(i); }
      else if (c < tw + T_WALK) { const u = ease((c - tw) / T_WALK); tx = lerp(STAND.x, BOARD_FRONT.x, u); tz = STAND.z; spd = 2.6; }
      else if (c < tw + T_WALK + T_PULL) { const k = c - tw - T_WALK, i = Math.min(2, Math.floor(k / (T_PULL / 3))); tx = BOARD_FRONT.x; armX = -1.6 + Math.sin((k % (T_PULL / 3)) / (T_PULL / 3) * Math.PI) * -0.5; const d = darts[i]; if ((k % (T_PULL / 3)) > T_PULL / 3 * 0.6 && d.g.visible) { d.g.visible = false; d.stuck = false; const A = audio(); if (A && A.tone) A.tone(900, 0.04, 0.03, 'square'); } }
      else if (c < tw + T_WALK * 2 + T_PULL) { const u = ease((c - tw - T_WALK - T_PULL) / T_WALK); tx = lerp(BOARD_FRONT.x, STAND.x, u); tf = -Math.PI / 2; spd = 2.6; }
      let df = tf - face; df = Math.atan2(Math.sin(df), Math.cos(df)); face += df * Math.min(1, dt * 8); fx = tx; fz = tz;
      fox.position.set(fx, 0.06, fz); fox.rotation.y = face; animFox(fox, dt, spd);
      const arm = fox.userData.P && fox.userData.P.arms[1], JF = fox.userData.P && fox.userData.P.fore;
      if (JF && c < tw) { flickThrow(THREE, fox, c % T_THROW); fPosed = true; }
      else if (JF && c >= tw + T_WALK && c < tw + T_WALK + T_PULL) { const kk = c - tw - T_WALK; flickThrow(THREE, fox, 0, (kk % (T_PULL / 3)) / (T_PULL / 3)); fPosed = true; }
      else { if (fPosed) { endPose(fox); fPosed = false; } if (arm && armX != null) { arm.rotation.x = armX; arm.rotation.z = 0.1; } }
      flyDarts(dt);
      fox.userData.lineMood = c > tw - 0.6 && c < tw + 0.4 ? 'excited' : null;
    },
  };
}
