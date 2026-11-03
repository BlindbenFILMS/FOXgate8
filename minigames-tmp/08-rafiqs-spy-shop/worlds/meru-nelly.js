// MERU — NELLY, the lake's sea monster [meruLake], and the boat battle. Rules from the 2D game (surface_meru.html
// updateSeaMonsters / fireHarpoon): 9 HP, three phases (>66% / >33% / last third). She surfaces ten seconds after you take the
// boat out, circles at a standoff that tightens as she gets angrier, and throws ROCK VOLLEYS (1 / 3 / 5 spread across your bow).
// From phase 2 she SINKS and LUNGES at where you were (her wake is the warning), breaching under you. In phase 3, if you let
// her close, she rears and SWEEPS her tail. Harpoons: one point of damage, two out at once, a short reload, they stick and
// ride her; each hit checks her for a beat. Beaten: +90 XP and the water is yours for the rest of that trip.
// Off the boat she just roams the deep water. Metres, town frame.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, sm = t => t * t * (3 - 2 * t);
export const HP = 9;
const PH = m => { const f = m.hp / HP; return f > 0.66 ? 1 : f > 0.33 ? 2 : 3; };

export function createNelly(K) {
  const { THREE, scene, M, BOX, toon, glowing, WATER_Y, home, boat, LOW } = K;
  // ---------------- the model ----------------
  const root = new THREE.Group(); root.name = 'nelly'; scene.add(root);
  const skin = toon('#3f8a6a').clone(), skin2 = toon('#357a5c').clone(), belly = toon('#bfe0a8').clone(), spot = toon('#2c6a50'), spike = toon('#e0a84a'), white = toon('#fff6dc'), ink = toon('#1e293b'), mouthM = toon('#7a2236'), tongue = toon('#e86a8a'), tooth = toon('#fffaf0');
  const mats = [skin, skin2, belly];
  // body: four humps, belly side lighter, a ridge of spikes
  const body = new THREE.Group(); root.add(body);
  const humps = [];
  [[0, 0.35, 0.6, 1.5], [0, 0.15, -1.4, 1.25], [0, 0.0, -3.1, 1.0], [0, -0.1, -4.5, 0.75]].forEach(([x, y, z, r], i) => {
    const g = new THREE.Group(); g.position.set(x, y, z); body.add(g);
    const h = M(new THREE.SphereGeometry(r, 16, 12), i % 2 ? skin2 : skin, 0, 0, 0, g, 0.05, r); h.scale.set(1.05, 0.78, 1.25);
    const b = M(new THREE.SphereGeometry(r * 0.92, 14, 10), belly, 0, -r * 0.2, r * 0.08, g, 0); b.scale.set(0.9, 0.62, 1.15);
    for (let k = 0; k < 2; k++) { const s = M(new THREE.ConeGeometry(r * 0.22, r * 0.6, 6), spike, 0, r * 0.74, (k - 0.5) * r * 0.7, g, 0.02, r * 0.22); s.rotation.x = -0.25; }
    for (const sx of [-1, 1]) M(new THREE.SphereGeometry(r * 0.2, 8, 6), spot, sx * r * 0.62, r * 0.42, -r * 0.2 + i * 0.1, g, 0).scale.set(1, 0.4, 1.3);
    humps.push(g); });
  // flippers
  const flips = [];
  for (const [sx, z] of [[-1, 0.3], [1, 0.3], [-1, -3.0], [1, -3.0]]) { const g = new THREE.Group(); g.position.set(sx * 1.25, -0.25, z); body.add(g); const f = M(new THREE.SphereGeometry(0.55, 12, 8), skin2, sx * 0.55, 0, 0, g, 0.03, 0.55); f.scale.set(1.4, 0.18, 0.7); flips.push({ g, sx }); }
  // tail: a chain that can rise out of the water for the sweep, ending in a two-lobed fin
  const tail = new THREE.Group(); tail.position.set(0, -0.15, -5.1); body.add(tail);
  const tailSeg = []; { let parent = tail; for (let i = 0; i < 5; i++) { const g = new THREE.Group(); g.position.z = i ? -0.62 : 0; parent.add(g); const r = 0.55 - i * 0.085; M(new THREE.SphereGeometry(r, 12, 8), i % 2 ? skin2 : skin, 0, 0, -0.3, g, 0.03, r).scale.set(1, 0.85, 1.3); tailSeg.push(g); parent = g; }
    const fin = new THREE.Group(); fin.position.z = -0.7; parent.add(fin); for (const sx of [-1, 1]) { const l = M(new THREE.SphereGeometry(0.5, 10, 8), spike, sx * 0.42, 0, -0.2, fin, 0.03, 0.5); l.scale.set(1.2, 0.14, 0.6); l.rotation.y = sx * 0.6; } }
  // neck: a chain of beads along a moving curve; head on the end
  const NN = 8, neck = [];
  for (let i = 0; i < NN; i++) { const r = lerp(0.72, 0.4, i / (NN - 1)); const g = new THREE.Group(); scene.add(g); M(new THREE.SphereGeometry(r, 14, 10), i % 2 ? skin2 : skin, 0, 0, 0, g, 0.04, r); const b = M(new THREE.SphereGeometry(r * 0.86, 10, 8), belly, 0, -r * 0.12, r * 0.28, g, 0); b.scale.set(0.82, 0.9, 0.6); if (i % 2 === 0) M(new THREE.ConeGeometry(r * 0.25, r * 0.65, 6), spike, 0, r * 0.82, -r * 0.2, g, 0.02, r * 0.25).rotation.x = -0.5; neck.push(g); }
  const head = new THREE.Group(); scene.add(head);
  { M(new THREE.SphereGeometry(0.62, 18, 14), skin, 0, 0, 0, head, 0.05, 0.62).scale.set(1, 0.9, 1.15);
    const snout = M(new THREE.SphereGeometry(0.5, 16, 12), skin, 0, -0.08, 0.62, head, 0.05, 0.5); snout.scale.set(0.95, 0.7, 1.05);
    for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.06, 8, 6), ink, sx * 0.18, 0.12, 1.08, head, 0);
    for (const sx of [-1, 1]) { const h = M(new THREE.ConeGeometry(0.12, 0.55, 7), spike, sx * 0.34, 0.55, -0.25, head, 0.02, 0.12); h.rotation.set(-0.6, 0, sx * 0.35); const fr = M(new THREE.SphereGeometry(0.28, 10, 8), skin2, sx * 0.6, 0.05, -0.2, head, 0.02, 0.28); fr.scale.set(0.25, 1, 0.9); fr.rotation.y = sx * 0.5; }
    for (const sx of [-1, 1]) M(new THREE.SphereGeometry(0.1, 8, 6), spot, sx * 0.28, 0.42, 0.2, head, 0).scale.set(1, 0.5, 1); }
  const jaw = new THREE.Group(); jaw.position.set(0, -0.28, 0.1); head.add(jaw);
  { const j = M(new THREE.SphereGeometry(0.46, 14, 10), belly, 0, -0.04, 0.5, jaw, 0.04, 0.46); j.scale.set(0.9, 0.38, 1.05);
    const inside = M(new THREE.SphereGeometry(0.4, 12, 8), mouthM, 0, 0.06, 0.48, jaw, 0); inside.scale.set(0.8, 0.22, 0.95);
    M(new THREE.SphereGeometry(0.16, 10, 8), tongue, 0, 0.1, 0.55, jaw, 0).scale.set(1, 0.4, 1.4);
    for (let k = 0; k < 6; k++) { const a = (k / 5 - 0.5) * 2.0, t = M(new THREE.ConeGeometry(0.045, 0.14, 5), tooth, Math.sin(a) * 0.34, 0.1, 0.52 + Math.cos(a) * 0.36, jaw, 0); } }
  for (let k = 0; k < 6; k++) { const a = (k / 5 - 0.5) * 2.0, t = M(new THREE.ConeGeometry(0.045, 0.14, 5), tooth, Math.sin(a) * 0.36, -0.3, 0.62 + Math.cos(a) * 0.38, head, 0); t.rotation.x = Math.PI; }
  // eyes: big whites, dark pupils with a glint, lids + brows for her mood
  const eyes = [];
  for (const sx of [-1, 1]) { const g = new THREE.Group(); g.position.set(sx * 0.36, 0.3, 0.42); head.add(g);
    M(new THREE.SphereGeometry(0.2, 14, 10), white, 0, 0, 0, g, 0.025, 0.2);
    const pupil = M(new THREE.SphereGeometry(0.11, 12, 8), ink, 0, 0, 0.13, g, 0); M(new THREE.SphereGeometry(0.035, 6, 4), white, 0.04, 0.05, 0.1, pupil, 0);
    const lid = M(new THREE.SphereGeometry(0.215, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), skin, 0, 0, 0, g, 0); lid.rotation.x = -1.2;
    const brow = M(BOX(0.34, 0.08, 0.1), skin2, 0, 0.24, 0.05, g, 0.015); eyes.push({ g, pupil, lid, brow, sx }); }
  // water at her: rings round the neck and humps while she is up
  const ringM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, depthWrite: false });
  const rings = Array.from({ length: LOW ? 3 : 5 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.05, 28), ringM.clone()); r.rotation.x = -Math.PI / 2; scene.add(r); return { r, t: Math.random(), src: 0 }; });
  // ---------------- fx pools: splashes, wake, rocks, landing marks, harpoons ----------------
  const splashM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8, depthWrite: false });
  const drops = Array.from({ length: LOW ? 40 : 90 }, () => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 4), splashM); m.visible = false; scene.add(m); return { m, v: new THREE.Vector3(), life: 0 }; });
  const splashRings = Array.from({ length: 8 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.0, 32), ringM.clone()); r.rotation.x = -Math.PI / 2; r.visible = false; scene.add(r); return { r, t: 1, s: 1 }; });
  function splash(x, z, n, power, ringSize) {
    let k = 0; for (const d of drops) { if (d.life > 0) continue; const a = Math.random() * Math.PI * 2, sp = power * (0.4 + Math.random() * 0.6); d.m.position.set(x + Math.cos(a) * 0.5, WATER_Y + 0.1, z + Math.sin(a) * 0.5); d.v.set(Math.cos(a) * sp * 0.45, power * (0.7 + Math.random() * 0.6), Math.sin(a) * sp * 0.45); d.life = 1.4; d.m.visible = true; d.m.scale.setScalar(0.6 + Math.random() * 0.9); if (++k >= n) break; }
    const R = splashRings.find(q => q.t >= 1); if (R) { R.t = 0; R.s = ringSize || 2; R.r.position.set(x, WATER_Y + 0.05, z); R.r.visible = true; } }
  const rockM = toon('#7d7468');
  const rocks = Array.from({ length: 8 }, () => { const m = M(new THREE.DodecahedronGeometry(0.42, 0), rockM, 0, -50, 0, scene, 0.03, 0.42); m.visible = false; const mk = new THREE.Mesh(new THREE.RingGeometry(1.5, 1.8, 28), new THREE.MeshBasicMaterial({ color: 0xec3013, transparent: true, opacity: 0.0, depthWrite: false })); mk.rotation.x = -Math.PI / 2; mk.visible = false; scene.add(mk); return { m, mk, on: false }; });
  const wake = Array.from({ length: 14 }, () => { const r = new THREE.Mesh(new THREE.RingGeometry(0.5, 0.75, 20), ringM.clone()); r.rotation.x = -Math.PI / 2; r.visible = false; scene.add(r); return { r, t: 1 }; });
  // the harpoon gun on the boat's bow, and the spears
  const gun = new THREE.Group(); gun.position.set(0, 0.62, 1.25); boat.add(gun);
  M(new THREE.CylinderGeometry(0.1, 0.14, 0.3, 8), toon('#3a3a48'), 0, 0, 0, gun, 0.015);
  const barrel = new THREE.Group(); barrel.position.y = 0.2; gun.add(barrel); M(new THREE.CylinderGeometry(0.07, 0.07, 0.9, 8), toon('#5a5a68'), 0, 0, 0.3, barrel, 0.015).rotation.x = Math.PI / 2; M(BOX(0.24, 0.16, 0.28), toon('#c42d3c'), 0, 0, -0.05, barrel, 0.015);
  const spearM = toon('#a8784a'), tipM = toon('#d8dee6');
  const spears = Array.from({ length: 2 }, () => { const g = new THREE.Group(); scene.add(g); g.visible = false; M(new THREE.CylinderGeometry(0.04, 0.04, 1.3, 6), spearM, 0, 0, 0, g, 0.012).rotation.x = Math.PI / 2; const t = M(new THREE.ConeGeometry(0.09, 0.32, 6), tipM, 0, 0, 0.8, g, 0.012); t.rotation.x = Math.PI / 2; for (const a of [0, Math.PI / 2]) { const f = M(BOX(0.22, 0.02, 0.18), toon('#ec3013'), 0, 0, -0.6, g, 0); f.rotation.z = a; }
    const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(10 * 3), 3)); const rope = new THREE.Line(rg, new THREE.LineBasicMaterial({ color: 0xf2efe6 })); rope.frustumCulled = false; rope.visible = false; scene.add(rope);
    return { g, rope, on: false }; });

  // ---------------- state ----------------
  const m = { x: home.x, z: home.z, face: 0, hp: HP, state: 'ROAM', surface: 0.55, bob: 0, t: 0, orbit: 1, rockCool: 2, lungeCool: 5, sweepCool: 8, stagger: 0, flash: 0, windT: 0, sweepT: 0, lunge: null, mood: 'calm', mouth: 0, roarT: 0 };
  const F = { on: false, slainTrip: false, timer: 10, reload: 0, kick: 0, cine: null, msgs: [], hurtT: 0, shake: 0 };
  const wade = (x, z, isWater) => isWater(x, z);
  function setMood(md) { m.mood = md; }
  function roar() { const A = K.audio(); A.tone(110, 0.9, 0.09, 'sawtooth', 0.55); A.tone(165, 0.7, 0.05, 'square', 0.6); A.burst(0.6, 500, 0.12); m.roarT = 0.9; }
  function startFight(G) {
    F.on = true; m.hp = HP; m.state = 'SURFACING'; m.surface = 0; m.rockCool = 2.2; m.lungeCool = 5; m.sweepCool = 7; m.stagger = 0; setMood('angry');
    // somewhere in the deep water 14-26 m from you
    for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, d = 14 + Math.random() * 12, x = G.Pl.x + Math.cos(a) * d, z = G.Pl.z + Math.sin(a) * d; if (wade(x, z, G.isWater) && wade(x + 3, z, G.isWater) && wade(x - 3, z, G.isWater) && wade(x, z + 3, G.isWater) && wade(x, z - 3, G.isWater)) { m.x = x; m.z = z; break; } }
    m.face = Math.atan2(G.Pl.x - m.x, G.Pl.z - m.z); splash(m.x, m.z, 26, 9, 3.5); roar();
  }
  function endFight(slain, G) {
    F.on = false; m.state = slain ? 'DEFEATED' : 'DIVING'; F.timer = 10;
    for (const r of rocks) { r.on = false; r.m.visible = false; r.mk.visible = false; }
    if (slain) { F.slainTrip = true; setMood('hurt'); splash(m.x, m.z, 40, 10, 5); G.onSlain && G.onSlain(); }
  }
  function throwRock(G, off, delay) {
    const r = rocks.find(q => !q.on); if (!r) return; const dx = G.Pl.x - m.x, dz = G.Pl.z - m.z, d = Math.hypot(dx, dz) || 1, a = Math.atan2(dx, dz) + off;
    const tx = m.x + Math.sin(a) * d + G.Pl.vx * 0.5, tz = m.z + Math.cos(a) * d + G.Pl.vz * 0.5;
    r.on = true; r.delay = delay; r.t = 0; r.dur = 1.0 + d * 0.012; r.from = head.position.clone(); r.to = new THREE.Vector3(tx, WATER_Y, tz); r.arc = 4 + d * 0.12;
    r.mk.position.set(tx, WATER_Y + 0.06, tz); r.mk.visible = true; r.mk.material.opacity = 0;
  }
  function hurtPlayer(G, dmg, fx, fz, push, label) {
    G.hurt(dmg); F.hurtT = 0.4; F.shake = Math.max(F.shake, push > 2 ? 0.5 : 0.25); if (label) G.toast(label);
    if (push) { const dx = G.Pl.x - fx, dz = G.Pl.z - fz, d = Math.hypot(dx, dz) || 1; G.Pl.vx += dx / d * push * 2.2; G.Pl.vz += dz / d * push * 2.2; }
    K.audio().burst(0.25, 700, 0.2);
  }
  // ---------------- posing ----------------
  const cP = new THREE.Vector3(), p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), p2 = new THREE.Vector3(), tmp = new THREE.Vector3();
  function pose(dt, lookX, lookZ) {
    m.t += dt; m.bob += dt;
    const sub = 1 - m.surface, sink = sub * 4.2, rear = m.state === 'WINDUP' ? sm(clamp(m.windT / 1.0, 0, 1)) : 0, sweep = m.state === 'SWEEP' ? Math.sin(clamp(m.sweepT / 0.6, 0, 1) * Math.PI) : 0;
    root.position.set(m.x, WATER_Y - 0.2 - sink + Math.sin(m.bob * 1.6) * 0.12, m.z); root.rotation.y = m.face;
    body.rotation.z = Math.sin(m.bob * 1.1) * 0.05; humps.forEach((h, i) => { h.position.y = [0.35, 0.15, 0, -0.1][i] + Math.sin(m.bob * 2.2 - i * 0.9) * 0.16; });
    flips.forEach((f, i) => { f.g.rotation.z = f.sx * (0.2 + Math.sin(m.bob * 3 + i) * 0.35); f.g.rotation.y = Math.sin(m.bob * 3 + i) * 0.25; });
    // tail: waves under water; rises behind her on the windup, and whips round on the sweep
    tail.rotation.x = -rear * 0.9 - sweep * 0.3; tail.rotation.y = sweep * 1.9 * m.orbit;
    tailSeg.forEach((g, i) => { g.rotation.y = Math.sin(m.bob * 2.4 - i * 0.7) * 0.22 * (1 - rear); g.rotation.x = -rear * 0.25; });
    // neck curve, local: from the front of the body up and forward to the head; sways, lunges when she bites, rears back on the windup
    const roarK = m.roarT > 0 ? Math.sin((m.roarT / 0.9) * Math.PI) : 0;
    const hz = 2.4 + roarK * 0.6 - rear * 0.9, hy = 3.4 + rear * 0.9 + roarK * 0.3 + Math.sin(m.bob * 1.3) * 0.15, hx = Math.sin(m.bob * 0.9) * 0.35;
    p0.set(0, 0.6, 1.4); p1.set(hx * 0.4, 2.6 + rear * 0.4, 1.5 - rear * 0.6); p2.set(hx, hy, hz);
    const cs = Math.cos(m.face), sn = Math.sin(m.face), toW = v => { const x = v.x * cs + v.z * sn, z = -v.x * sn + v.z * cs; return v.set(root.position.x + x, root.position.y + v.y, root.position.z + z); };
    for (let i = 0; i < NN; i++) { const u = (i + 0.5) / NN; cP.set(0, 0, 0).addScaledVector(p0, (1 - u) * (1 - u)).addScaledVector(p1, 2 * u * (1 - u)).addScaledVector(p2, u * u); neck[i].position.copy(toW(cP)); neck[i].rotation.y = m.face; }
    head.position.copy(toW(tmp.copy(p2).add(p0.set(0, 0.25, 0.25))));
    // head looks at you
    const ly = Math.atan2(lookX - head.position.x, lookZ - head.position.z); let df = ly - m.face; df = Math.atan2(Math.sin(df), Math.cos(df)); head.rotation.set(0.15 - roarK * 0.35 + rear * 0.3, m.face + clamp(df, -0.9, 0.9), 0);
    // jaw + face
    const wantMouth = m.roarT > 0 ? 1 : m.state === 'WINDUP' ? 0.6 : m.mood === 'hurt' ? 0.45 : m.mood === 'angry' ? 0.18 + Math.max(0, Math.sin(m.t * 3)) * 0.12 : 0.05; m.mouth = lerp(m.mouth, wantMouth, Math.min(1, dt * 10)); jaw.rotation.x = m.mouth * 0.75;
    const blink = (m.t % 3.7) < 0.12 ? 1 : 0;
    for (const e of eyes) { const lidK = m.mood === 'hurt' ? 0.75 : m.mood === 'angry' ? 0.38 : 0.12; e.lid.rotation.x = -1.6 + (Math.max(lidK, blink)) * 1.55; e.brow.rotation.z = m.mood === 'angry' ? e.sx * -0.45 : m.mood === 'hurt' ? e.sx * 0.35 : 0; e.brow.position.y = m.mood === 'calm' ? 0.27 : 0.22; e.pupil.scale.setScalar(m.mood === 'hurt' ? 0.7 : 1); }
    if (m.roarT > 0) m.roarT -= dt;
    // red flash on a hit
    const fl = m.flash > 0 ? m.flash / 0.25 : 0; for (const mt of mats) { if (!mt.emissive) continue; mt.emissive.setRGB(fl * 0.9, fl * 0.1, fl * 0.1); } if (m.flash > 0) m.flash -= dt;
    root.visible = m.surface > 0.02 || m.state === 'LUNGE';
    neck.forEach(n => n.visible = root.visible); head.visible = root.visible;
  }

  return {
    get fighting() { return F.on; },
    get slainTrip() { return F.slainTrip; },
    head, root, m,
    hide() { root.visible = false; head.visible = false; neck.forEach(q => q.visible = false); rings.forEach(q => q.r.visible = false); gun.visible = false; },
    boarded() { F.slainTrip = false; F.timer = 10; },
    cine() { return F.cine; },
    shake() { return F.shake; },
    hud(G) { return F.on ? { hp: Math.max(0, Math.round(G.hp())), max: G.max(), hurt: F.hurtT > 0, foes: 0, boss: { name: 'NELLY', hp: m.hp, max: HP, phase: PH(m) }, hint: F.reload > 0 ? 'Reloading' : 'Harpoon ready' } : null; },
    fire(G) {
      if (!G.boatOn) return false; if (F.reload > 0 || spears.every(s => s.on)) return true; const s = spears.find(q => !q.on);
      F.reload = 0.45; F.kick = 0.15; const from = new THREE.Vector3(); barrel.getWorldPosition(from);
      // aim: at Nelly when she is up (leading her a little); otherwise straight off the bow
      let dir; if (F.on && m.surface > 0.5) { const tx = head.position.x * 0.5 + m.x * 0.5 + (m.state === 'CHASE' ? Math.cos(m.face) * m.orbit * 0.8 : 0), tz = head.position.z * 0.5 + m.z * 0.5, ty = WATER_Y + 1.6; dir = new THREE.Vector3(tx - from.x, ty - from.y, tz - from.z).normalize(); }
      else dir = new THREE.Vector3(Math.sin(G.Pl.face), 0.05, Math.cos(G.Pl.face)).normalize();
      s.on = true; s.stuck = false; s.t = 0; s.p = from.clone(); s.v = dir.multiplyScalar(30); s.g.position.copy(s.p); s.g.visible = true; s.rope.visible = true;
      K.audio().tone(700, 0.08, 0.05, 'square', 0.5); K.audio().burst(0.12, 2400, 0.1); return true;
    },
    update(dt, G) {
      const P = G.Pl;
      F.hurtT = Math.max(0, F.hurtT - dt); F.shake = Math.max(0, F.shake - dt * 1.6); F.reload = Math.max(0, F.reload - dt); F.kick = Math.max(0, F.kick - dt);
      // the gun swivels to the aim
      { const wx = F.on && m.surface > 0.3 ? m.x : P.x + Math.sin(P.face) * 5, wz = F.on && m.surface > 0.3 ? m.z : P.z + Math.cos(P.face) * 5; let a = Math.atan2(wx - P.x, wz - P.z) - P.face; a = Math.atan2(Math.sin(a), Math.cos(a)); gun.rotation.y = lerp(gun.rotation.y, a, Math.min(1, dt * 8)); barrel.position.z = -F.kick * 1.2; gun.visible = G.boatOn; }
      if (F.cine) { F.cine.t += dt; if (F.cine.t > F.cine.dur) F.cine = null; }
      // start the fight: ten seconds after you push off; the first time ever, a sighting + a look at her rising
      if (G.boatOn && !F.on && !F.slainTrip && m.state !== 'DEFEATED') { F.timer -= dt; if (F.timer <= 0) { startFight(G); if (!G.introDone()) { G.setIntroDone(); F.cine = { t: 0, dur: 3.4 }; G.toast('SIGHTING of a SEA MONSTER \u2014 get prepared!'); } else G.toast('NELLY! 1 or 2 fires the harpoon'); } }
      if (!G.boatOn && F.on) endFight(false, G);
      // ---- AI ----
      if (F.on) {
        const ph = PH(m), dx = P.x - m.x, dz = P.z - m.z, dist = Math.hypot(dx, dz) || 1, speed = 2.3 + (ph - 1) * 1.4, stand = 13 - (ph - 1) * 2.6;
        // never sit on the boat: after a breach (or if you row into her) she backs off to arm's length
        if (dist < 5 && m.state !== 'LUNGE' && m.state !== 'SINK') { const k = Math.min(1, dt * ((m.backOff || 0) > 0 ? 5 : 2.5)), bx = m.x - dx / dist * (5.2 - dist) * k, bz = m.z - dz / dist * (5.2 - dist) * k; if (G.isWater(bx, bz)) { m.x = bx; m.z = bz; } } if (m.backOff > 0) m.backOff -= dt;
        if (m.stagger > 0) m.stagger -= dt; m.rockCool -= dt; m.lungeCool -= dt; m.sweepCool -= dt;
        if (m.state !== 'LUNGE' && m.state !== 'SWEEP') { let df = Math.atan2(dx, dz) - m.face; df = Math.atan2(Math.sin(df), Math.cos(df)); m.face += df * Math.min(1, dt * 3); }
        if (m.state === 'SURFACING') { m.surface = Math.min(1, m.surface + dt * 1.4); if (m.surface >= 1) m.state = 'CHASE'; }
        else if (m.state === 'SINK') { m.surface = Math.max(0, m.surface - dt * 3.2); if (m.surface <= 0) { m.state = 'LUNGE'; m.lunge = { t: 0, fx: m.x, fz: m.z, tx: P.x, tz: P.z, w: 0 }; K.audio().tone(70, 1.2, 0.06, 'sine', 1.6); } }
        else if (m.state === 'LUNGE') { const L = m.lunge; L.t += dt; const u = Math.min(1, L.t / 1.35), e = sm(u), nx = lerp(L.fx, L.tx, e), nz = lerp(L.fz, L.tz, e); if (G.isWater(nx, nz)) { m.x = nx; m.z = nz; }
          L.w -= dt; if (L.w <= 0) { L.w = 0.09; const W = wake.find(q => q.t >= 1); if (W) { W.t = 0; W.r.position.set(m.x, WATER_Y + 0.05, m.z); W.r.visible = true; } }
          if (u >= 1) { m.state = 'SURFACING'; m.surface = 0.25; m.lungeCool = ph >= 3 ? 3.5 : 6.6; splash(m.x, m.z, 40, 11, 4.5); roar(); F.shake = 0.5; if (Math.hypot(P.x - m.x, P.z - m.z) < 3.8) hurtPlayer(G, 12, m.x, m.z, 3, 'BREACHED!'); m.backOff = 1.2; } }
        else if (m.state === 'WINDUP') { m.windT += dt; if (m.windT > 1.0) { m.state = 'SWEEP'; m.sweepT = 0; } }
        else if (m.state === 'SWEEP') { m.sweepT += dt; if (!m.swept && m.sweepT > 0.18) { m.swept = true; const tx = m.x - Math.sin(m.face) * 5, tz = m.z - Math.cos(m.face) * 5; splash(tx, tz, 30, 8, 6); F.shake = 0.6; if (dist < 7.5) hurtPlayer(G, 10, m.x, m.z, 5, 'SWEPT!'); }
          if (m.sweepT > 0.6) { m.state = 'CHASE'; m.sweepCool = ph >= 3 ? 4.3 : 8.7; m.windT = 0; m.swept = false; } }
        else if (m.state === 'CHASE') {
          if (m.stagger <= 0) {
            const rErr = dist - stand; let mx = dx / dist * rErr * 0.6, mz = dz / dist * rErr * 0.6; mx += -dz / dist * m.orbit * speed; mz += dx / dist * m.orbit * speed; const ml = Math.hypot(mx, mz) || 1, st = Math.min(speed, ml) * dt;
            const nx = m.x + mx / ml * st, nz = m.z + mz / ml * st; if (G.isWater(nx, m.z)) m.x = nx; else m.orbit *= -1; if (G.isWater(m.x, nz)) m.z = nz; else m.orbit *= -1;
            if (ph >= 3 && m.sweepCool <= 0 && dist < 9) { m.state = 'WINDUP'; m.windT = 0; roar(); }
            else if (ph >= 2 && m.lungeCool <= 0 && dist > 6) { m.state = 'SINK'; G.toast('She went under\u2026 MOVE!'); }
            else if (m.rockCool <= 0) { const n = ph === 1 ? 1 : ph === 2 ? 3 : 5; for (let k = 0; k < n; k++) throwRock(G, n === 1 ? 0 : (k / (n - 1) - 0.5) * 0.6, k * 0.09); m.rockCool = (ph === 1 ? 1.3 : ph === 2 ? 1.6 : 1.4) + Math.random() * 0.5; m.roarT = 0.35; }
          }
        }
      } else if (m.state === 'DIVING' || m.state === 'DEFEATED') {
        m.surface = Math.max(0, m.surface - dt * (m.state === 'DEFEATED' ? 0.35 : 1.2)); if (m.state === 'DEFEATED' && m.surface > 0.1) setMood('hurt');
        if (m.surface <= 0) { m.state = 'ROAM'; m.x = home.x; m.z = home.z; setMood('calm'); m.hp = HP; m.rt = 0; }
      } else { // ROAM: a slow loop through the deep water, rising and sinking (unless she was beaten this trip)
        m.rt = (m.rt || 0) + dt; const a = m.rt * 0.12; const nx = home.x + Math.cos(a) * 9, nz = home.z + Math.sin(a * 1.3) * 4; m.face = Math.atan2(nx - m.x, nz - m.z) || m.face; m.x = nx; m.z = nz;
        m.surface = F.slainTrip ? Math.max(0, m.surface - dt) : 0.25 + Math.max(0, Math.sin(m.rt * 0.35)) * 0.55; setMood('calm');
      }
      pose(dt, P.x, P.z);
      // ---- rocks ----
      for (const r of rocks) { if (!r.on) continue; if (r.delay > 0) { r.delay -= dt; continue; } r.t += dt; const u = Math.min(1, r.t / r.dur); r.m.visible = true;
        r.m.position.set(lerp(r.from.x, r.to.x, u), lerp(r.from.y, r.to.y, u) + Math.sin(u * Math.PI) * r.arc, lerp(r.from.z, r.to.z, u)); r.m.rotation.x += dt * 8; r.m.rotation.z += dt * 5;
        r.mk.material.opacity = 0.25 + u * 0.55; r.mk.scale.setScalar(1.3 - u * 0.5);
        if (u >= 1) { r.on = false; r.m.visible = false; r.mk.visible = false; splash(r.to.x, r.to.z, 14, 6, 2); K.audio().burst(0.18, 900, 0.12); if (Math.hypot(P.x - r.to.x, P.z - r.to.z) < 2.0) hurtPlayer(G, 8, r.to.x, r.to.z, 1.2, null); } }
      // ---- harpoons ----
      const anchor = tmp.set(0, 0, 0); barrel.getWorldPosition(anchor);
      for (const s of spears) { if (!s.on) continue; s.t += dt;
        if (s.stuck) { s.g.position.copy(root.position).add(s.off); if (s.t > 0.75 || m.surface < 0.25) { s.on = false; s.g.visible = false; s.rope.visible = false; continue; } }
        else { s.v.y -= 6 * dt; s.p.addScaledVector(s.v, dt); s.g.position.copy(s.p); s.g.lookAt(p1.copy(s.p).add(s.v));
          if (F.on && m.surface > 0.5) { const pts = [head.position, neck[3].position, neck[0].position, humps[0].getWorldPosition(p2)]; for (const q of pts) if (q.distanceTo(s.p) < 1.6) {
            m.hp--; m.flash = 0.25; m.stagger = 0.25; splash(s.p.x, s.p.z, 8, 4, 1.2); K.audio().tone(260, 0.2, 0.06, 'triangle', 0.6); F.shake = Math.max(F.shake, 0.15);
            s.stuck = true; s.t = 0; s.off = s.p.clone().sub(root.position);
            if (m.hp <= 0) { G.toast('NELLY is beaten! +90 XP'); endFight(true, G); } else { const nph = PH(m) !== PH({ hp: m.hp + 1 }); if (nph) roar(); G.toast('Hit! ' + m.hp + ' left' + (nph ? (PH(m) === 2 ? ' \u2014 she is getting angry' : ' \u2014 she is FURIOUS') : '')); }
            break; } }
          if (s.p.y < WATER_Y || s.t > 1.6) { if (!s.stuck) { splash(s.p.x, s.p.z, 6, 3, 1); s.on = false; s.g.visible = false; s.rope.visible = false; continue; } } }
        // rope from the gun to the spear, sagging with the distance
        const pa = s.rope.geometry.attributes.position, L = anchor.distanceTo(s.g.position); for (let i = 0; i < 10; i++) { const u = i / 9; pa.setXYZ(i, lerp(anchor.x, s.g.position.x, u), lerp(anchor.y, s.g.position.y, u) - Math.sin(u * Math.PI) * L * (s.stuck ? 0.02 : 0.07), lerp(anchor.z, s.g.position.z, u)); } pa.needsUpdate = true; }
      // ---- water fx ----
      for (const d of drops) { if (d.life <= 0) continue; d.life -= dt; d.v.y -= 18 * dt; d.m.position.addScaledVector(d.v, dt); if (d.m.position.y < WATER_Y || d.life <= 0) { d.life = 0; d.m.visible = false; } }
      for (const R of splashRings) { if (R.t >= 1) continue; R.t += dt * 0.9; R.r.scale.setScalar(R.s * (0.5 + R.t * 1.8)); R.r.material.opacity = (1 - R.t) * 0.7; if (R.t >= 1) R.r.visible = false; }
      for (const W of wake) { if (W.t >= 1) continue; W.t += dt * 0.8; W.r.scale.setScalar(1 + W.t * 3); W.r.material.opacity = (1 - W.t) * 0.75; if (W.t >= 1) W.r.visible = false; }
      const up = root.visible && m.surface > 0.15; rings.forEach((q, i) => { q.t += dt * 0.45; if (q.t > 1) q.t -= 1; const src = i % 2 ? neck[0].position : humps[Math.min(3, i >> 1)].getWorldPosition(p0); q.r.visible = up; q.r.position.set(src.x, WATER_Y + 0.04, src.z); q.r.scale.setScalar(1 + q.t * 2.2); q.r.material.opacity = (1 - q.t) * 0.45; });
    },
  };
}
