// MERU TAVERN — a second dart board on the east wall, and Flick, a fox who plays it on a loop: three darts (wind-up, snap,
// the dart arcs in and sticks), walks up to the board, pulls them out one by one, walks back to the oche, again.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, ease = t => t * t * (3 - 2 * t);
export function createDarter({ THREE, scene, makeFox, animFox, M, toon, grad, boardTex, look, board, oche, audio }) {
  // the board (same build as the first one)
  const db = new THREE.Group(); db.position.set(board.x, board.y, board.z); db.rotation.y = -Math.PI / 2; scene.add(db);
  M(new THREE.CylinderGeometry(0.85, 0.85, 0.06, 40), toon('#3a2618'), 0, 0, -0.04, db, 0.02, 0.85).rotation.x = Math.PI / 2;
  const bface = new THREE.Mesh(new THREE.CircleGeometry(0.66, 64), new THREE.MeshToonMaterial({ map: boardTex, gradientMap: grad })); bface.position.z = 0.01; db.add(bface);
  M(new THREE.TorusGeometry(0.66, 0.035, 8, 48), toon('#cbd5e1'), 0, 0, 0.01, db, 0);
  M(new THREE.BoxGeometry(0.1, 0.03, 1.4), toon('#e0a84a'), oche, 0.02, board.z, scene, 0);
  // the darts
  const flightM = toon('#38bdf8'), shaftM = toon('#e5e7eb'), tipM = toon('#64748b');
  const darts = Array.from({ length: 3 }, () => { const g = new THREE.Group(); scene.add(g); g.visible = false;
    M(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 6), shaftM, 0, 0, 0, g, 0).rotation.z = Math.PI / 2;
    M(new THREE.ConeGeometry(0.01, 0.05, 6), tipM, 0.1, 0, 0, g, 0).rotation.z = -Math.PI / 2;
    for (const r of [0, Math.PI / 2]) { const f = M(new THREE.BoxGeometry(0.05, 0.002, 0.04), flightM, -0.09, 0, 0, g, 0); f.rotation.x = r; }
    return { g, stuck: false, from: new THREE.Vector3(), to: new THREE.Vector3(), t: 0 }; });
  const fox = makeFox({ key: 'darterFlick', name: 'Flick', outfit: 'coat', torso: ['#fecaca', '#b91c1c', '#450a0a'], crest: '8', mood: 'determined', look }); scene.add(fox);
  const STAND = { x: oche - 0.35, z: board.z }, BOARD_FRONT = { x: board.x - 0.75, z: board.z };
  const v = new THREE.Vector3();
  let c = 0, face = Math.PI / 2, fx = STAND.x, fz = STAND.z, n = 0;
  const T_THROW = 1.3, T_WALK = 1.9, T_PULL = 1.6, CYCLE = T_THROW * 3 + T_WALK + T_PULL + T_WALK + 0.6;
  function throwDart(i) {
    const d = darts[i], arm = fox.userData.P && fox.userData.P.arms[1]; if (arm) { arm.localToWorld(v.set(0, -0.5, 0.15)); d.from.copy(v); } else d.from.set(fx + 0.3, 1.6, fz);
    const r = Math.sqrt(Math.random()) * 0.45, a = Math.random() * Math.PI * 2; d.to.set(board.x - 0.03, board.y + Math.sin(a) * r, board.z + Math.cos(a) * r); d.t = 0; d.stuck = false; d.flying = true; d.g.visible = true;
    const A = audio(); if (A && A.burst) A.burst(0.08, 3200, 0.06);
  }
  return {
    update(dt, active) {
      fox.visible = active; for (const d of darts) if (!active) d.g.visible = false; if (!active) return;
      const prev = c; c = (c + dt) % CYCLE; if (c < prev) n++;
      let tx = STAND.x, tz = STAND.z, tf = Math.PI / 2, spd = 0, armX = null;
      const tw = T_THROW * 3;
      if (c < tw) { const k = c % T_THROW, i = Math.floor(c / T_THROW); armX = k < 0.45 ? lerp(-0.4, -2.3, ease(k / 0.45)) : k < 0.6 ? lerp(-2.3, -1.0, (k - 0.45) / 0.15) : lerp(-1.0, -0.4, clamp((k - 0.6) / 0.4, 0, 1)); if (k >= 0.52 && (prev % T_THROW) < 0.52 && prev < tw) throwDart(i); }
      else if (c < tw + T_WALK) { const u = ease((c - tw) / T_WALK); tx = lerp(STAND.x, BOARD_FRONT.x, u); tz = STAND.z; spd = 2.6; }
      else if (c < tw + T_WALK + T_PULL) { const k = c - tw - T_WALK, i = Math.min(2, Math.floor(k / (T_PULL / 3))); tx = BOARD_FRONT.x; armX = -1.6 + Math.sin((k % (T_PULL / 3)) / (T_PULL / 3) * Math.PI) * -0.5; const d = darts[i]; if ((k % (T_PULL / 3)) > T_PULL / 3 * 0.6 && d.g.visible) { d.g.visible = false; d.stuck = false; const A = audio(); if (A && A.tone) A.tone(900, 0.04, 0.03, 'square'); } }
      else if (c < tw + T_WALK * 2 + T_PULL) { const u = ease((c - tw - T_WALK - T_PULL) / T_WALK); tx = lerp(BOARD_FRONT.x, STAND.x, u); tf = -Math.PI / 2; spd = 2.6; }
      let df = tf - face; df = Math.atan2(Math.sin(df), Math.cos(df)); face += df * Math.min(1, dt * 8); fx = tx; fz = tz;
      fox.position.set(fx, 0.06, fz); fox.rotation.y = face; animFox(fox, dt, spd);
      const arm = fox.userData.P && fox.userData.P.arms[1]; if (arm && armX != null) { arm.rotation.x = armX; arm.rotation.z = 0.1; }
      for (const d of darts) { if (!d.flying) continue; d.t += dt / 0.32; const u = Math.min(1, d.t); d.g.position.set(lerp(d.from.x, d.to.x, u), lerp(d.from.y, d.to.y, u) + Math.sin(u * Math.PI) * 0.18, lerp(d.from.z, d.to.z, u)); d.g.rotation.set(0, 0, -0.25 + u * 0.25);
        if (u >= 1) { d.flying = false; d.stuck = true; const A = audio(); if (A && A.burst) A.burst(0.05, 900, 0.12); } }
      fox.userData.lineMood = c > tw - 0.6 && c < tw + 0.4 ? 'excited' : null;
    },
  };
}
