// 8 GATES — EARTH + SPACE creatures (the last seven families). Registered into creatureKit by the host via ck.register.
export function lastFamilies({ THREE, toon, M, fk }) {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
  const wm = (c, e, k = 0) => new THREE.MeshToonMaterial({ color: c, emissive: new THREE.Color(e), emissiveIntensity: k, gradientMap: toon('#fff').gradientMap });
  // ---- four-legged pack animals: the Desert Stray and the Cellar Rat ----
  const BEAST = { 'Desert Stray': { fur: '#b08a5a', dark: '#6b4a2a', eye: '#ffd23a', len: 0.8, h: 0.55, snout: 0.25, tail: 0.45, ears: 'dog' }, 'Cellar Rat': { fur: '#6b6560', dark: '#3a3632', eye: '#ff3b3b', len: 0.5, h: 0.22, snout: 0.18, tail: 0.6, ears: 'rat' } };
  function buildBeast(name) {
    const V = BEAST[name], g = new THREE.Group(), J = {}, fur = toon(V.fur), dk = toon(V.dark), rat = V.ears === 'rat';
    const body = new THREE.Group(); body.position.y = V.h + 0.08; g.add(body); J.body = body;
    M(new THREE.CapsuleGeometry(V.h * 0.42, V.len, 4, 10), fur, 0, 0, 0, body, 0.015).rotation.x = Math.PI / 2;
    const head = new THREE.Group(); head.position.set(0, V.h * 0.3, V.len / 2 + V.h * 0.35); body.add(head); J.head = head;
    M(new THREE.SphereGeometry(V.h * 0.42, 12, 10), fur, 0, 0, 0, head, 0.012); const sn = M(new THREE.ConeGeometry(V.h * 0.22, V.snout, 8), dk, 0, -0.03, V.h * 0.38, head, 0.008); sn.rotation.x = Math.PI / 2;
    const jaw = new THREE.Group(); jaw.position.set(0, -V.h * 0.15, V.h * 0.15); head.add(jaw); J.jaw = jaw; M(new THREE.BoxGeometry(V.h * 0.3, V.h * 0.08, V.snout), dk, 0, 0, V.snout / 2, jaw, 0.006);
    const weakMat = new THREE.MeshBasicMaterial({ color: V.eye }); for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(V.h * 0.07, 8, 6), weakMat); e.position.set(s * V.h * 0.17, V.h * 0.1, V.h * 0.33); head.add(e); }   // glowing eyes
    for (const s of [-1, 1]) { const ear = rat ? M(new THREE.SphereGeometry(V.h * 0.16, 8, 6), toon('#d8a0a8'), s * V.h * 0.26, V.h * 0.3, -0.02, head, 0.006) : M(new THREE.ConeGeometry(V.h * 0.12, V.h * 0.35, 4), dk, s * V.h * 0.2, V.h * 0.42, -0.04, head, 0.006); if (rat) ear.scale.z = 0.4; else ear.rotation.z = -s * 0.25; }
    const tail = new THREE.Group(); tail.position.set(0, V.h * 0.1, -V.len / 2 - V.h * 0.2); body.add(tail); J.tail = tail; const tl = M(new THREE.CylinderGeometry(rat ? 0.012 : 0.04, rat ? 0.025 : 0.06, V.tail, 6), rat ? toon('#d8a0a8') : fur, 0, 0, -V.tail / 2, tail, 0.006); tl.rotation.x = Math.PI / 2;
    J.legs = []; for (const s of [-1, 1]) for (const z of [-V.len / 2 + 0.05, V.len / 2 - 0.05]) { const p = new THREE.Group(); p.position.set(s * V.h * 0.25, -V.h * 0.2, z); body.add(p); M(new THREE.CylinderGeometry(V.h * 0.07, V.h * 0.06, V.h * 0.9, 6), dk, 0, -V.h * 0.42, 0, p, 0.006); J.legs.push({ p, ph: (s > 0 ? 0 : Math.PI) + (z > 0 ? Math.PI : 0) }); }
    if (!rat) { const col = M(new THREE.TorusGeometry(V.h * 0.32, 0.025, 6, 14), toon('#c42d3c'), 0, V.h * 0.1, V.len / 2 + 0.05, body, 0); col.rotation.x = Math.PI / 2 + 0.3; }   // a frayed collar: it crossed the cattle grid
    const weak = M(new THREE.SphereGeometry(V.h * 0.12, 6, 5), wm('#fff', V.eye), 0, V.h * 0.1, 0, body, 0); weak.visible = false;
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'beast', variant: name, joints: J, weak, weakMat: weak.material, weakBase: new THREE.Color(V.eye), slabColor: V.fur, calls, height: rat ? 0.45 : 1.0, reach: rat ? 0.7 : 1.2, flock: true, rat, events: [] });
    return g;
  }
  function animateBeast(g, state, t, dt, opts = {}) {
    const U = g.userData, J = U.joints, B = J.body, o = opts.off || 0, by = J.body.userData.y0 ?? (J.body.userData.y0 = B.position.y); B.position.set(0, by, 0); B.rotation.set(0, 0, 0); J.head.rotation.set(0, 0, 0);
    let amp = 0, rate = 0, jaw = 0.05, wag = Math.sin(t * 3 + o) * 0.3;
    if (state === 'idle') { const a = t * 1.2 + o; B.position.x = Math.sin(a) * 0.2; B.rotation.y = Math.cos(a) * 0.4; amp = 0.25; rate = 8; J.head.rotation.y = Math.sin(t * 0.8 + o) * 0.4; if (U.rat) J.head.rotation.x = Math.sin(t * 9 + o) * 0.06; }   // sniffing, circling
    else if (state === 'move') { amp = 0.7; rate = U.rat ? 28 : 16; B.position.y += Math.abs(Math.sin(t * rate)) * 0.04; wag *= 2; }
    else if (state === 'windup') { const k = ease(cl(t / 0.6)); B.position.y = by - by * 0.25 * k; B.rotation.x = 0.15 * k; jaw = 0.4 * k; if (U.rat) { J.head.rotation.x = -0.5 * k; } if (Math.floor(t * 5) !== U.gr) { U.gr = Math.floor(t * 5); U.events.push(U.rat ? 'squeak' : 'growl'); } }   // crouch, growl / squeak
    else if (state === 'attack') { const k = cl(t / 0.45); B.position.z = Math.sin(k * Math.PI) * (U.rat ? 0.8 : 1.4); B.position.y = by + Math.sin(k * Math.PI) * by * 0.6; amp = 0.9; rate = 24; jaw = k < 0.6 ? 0.6 : 0; if (k > 0.5 && !U.f) { U.f = true; U.events.push('swing'); } }
    else if (state === 'recover') { B.rotation.z = Math.sin(t * 5) * 0.1; jaw = 0.2; }
    else if (state === 'hurt') { B.position.x = Math.sin(t * 60) * 0.03; jaw = 0.4; }
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 7) * 0.4; amp = 0.2; rate = 8; }
    else if (state === 'armorBreak') { if (t < dt * 1.5) U.events.push(U.rat ? 'squeak' : 'howl'); J.head.rotation.x = -0.8 * Math.sin(cl(t / 0.8) * Math.PI); jaw = 0.5; }   // the Stray howls
    else if (state === 'die') { const k = ease(cl(t / 0.6)); B.rotation.z = 1.5 * k; B.position.y = by * (1 - 0.5 * k); }
    if (state !== 'attack') U.f = false; if (state !== 'windup') U.gr = -1;
    J.legs.forEach(L => L.p.rotation.x = Math.sin(t * rate + L.ph) * amp); J.jaw.rotation.x = jaw; J.tail.rotation.y = wag;
  }
  // ---- the Earth crew: people, not creatures (fox kit) ----
  const CREW = { 'Suit': { outfit: 'suit', torso: ['#2a2e34', '#1a1d22', '#0c0e10'], role: 'punch' }, 'Doorman': { outfit: 'coat', torso: ['#7a1d2a', '#4a0f18', '#2a070d'], role: 'shove' }, 'Airman': { outfit: 'armor', torso: ['#6b7348', '#4a5030', '#2a2e1c'], role: 'gun' }, 'Manager': { outfit: 'vest', torso: ['#e8e4dc', '#4a5568', '#2a3240'], role: 'rally' } };
  function buildCrew(name) {
    const V = CREW[name] || CREW['Suit'], g = fk.makeFox({ key: name, torso: V.torso, crest: 'none', outfit: V.outfit, mood: 'stern', glasses: name === 'Suit' ? 'sun' : undefined, eyes: ['#3a3a44', '#3a3a44'] });
    const U = g.userData, P = U.P, R = P.arms[1], head = P.head;
    if (name === 'Doorman' || name === 'Airman') { const cap = new THREE.Group(); cap.position.set(0, 0.32, 0); head.add(cap); M(new THREE.CylinderGeometry(0.3, 0.32, 0.16, 14), toon(name === 'Doorman' ? '#4a0f18' : '#4a5030'), 0, 0.04, 0, cap, 0.01); M(new THREE.BoxGeometry(0.36, 0.03, 0.2), toon('#1a1a1e'), 0, -0.03, 0.26, cap, 0.006); }
    if (V.role === 'gun') { const gp = new THREE.Group(); gp.position.set(0, -0.46, 0.06); R.add(gp); M(new THREE.BoxGeometry(0.05, 0.1, 0.18), toon('#1a1a1e'), 0, 0, 0.06, gp, 0.006); gp.rotation.x = -1.4; U.muzzle = new THREE.Object3D(); U.muzzle.position.set(0, 0.02, 0.18); gp.add(U.muzzle); }
    if (V.role === 'rally') { const cb = M(new THREE.BoxGeometry(0.22, 0.3, 0.03), toon('#c9a173'), 0, -0.46, 0.08, P.arms[0], 0.006); }   // clipboard
    const weakMat = wm('#ffd23a', '#ffd23a', 0); const lift = P.legs[0].position.y - 0.5;
    const weak = M(new THREE.BoxGeometry(0.12, 0.08, 0.04), weakMat, 0.16, 1.05 + lift, 0.3, P.body, 0.006);   // the badge / lanyard
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(U, { family: 'crew', variant: name, role: V.role, weak, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#ffd23a', calls, height: 1.75, reach: V.role === 'gun' ? 0 : 1.0, ranged: V.role === 'gun', laneAngles: V.role === 'gun' ? [0] : null, events: [] }); U.joints = { weak };
    return g;
  }
  function animateCrew(g, state, t, dt) {
    const U = g.userData, P = U.P, R = P.arms[1], L = P.arms[0], B = P.body; fk.animFox(g, dt, state === 'move' ? 3 : 0, false); B.rotation.set(0, 0, 0); B.position.set(0, 0, 0);
    if (state === 'windup') { const k = ease(cl(t / 0.6)); if (U.role === 'gun') { R.rotation.set(-1.5 * k, 0, 0); L.rotation.set(-1.3 * k, 0, -0.4 * k); } else if (U.role === 'rally') { R.rotation.set(-2.8 * k, 0, 0.2); if (t > 0.3 && !U.r) { U.r = true; U.events.push('whistle'); } } else if (U.role === 'shove') { R.rotation.set(-1.2 * k, 0, 0.2); L.rotation.set(-1.2 * k, 0, -0.2); B.position.z = -0.1 * k; } else { R.rotation.set(-1.4 * k, 0, 0.8 * k); B.rotation.y = -0.3 * k; } }   // the Manager whistles for backup
    else if (state === 'attack') { const s = ease(cl(t / 0.25)); if (U.role === 'gun') { R.rotation.set(-1.5 - (t < 0.1 ? 0.3 : 0), 0, 0); L.rotation.set(-1.3, 0, -0.4); if (!U.f) { U.f = true; U.events.push('shot'); } } else if (U.role === 'shove') { R.rotation.set(-1.4, 0, 0.1); L.rotation.set(-1.4, 0, -0.1); B.position.z = s * 0.35; if (t > 0.1 && !U.f) { U.f = true; U.events.push('swing'); } } else { R.rotation.set(lerp(-1.4, -1.6, s), 0, lerp(0.8, -0.2, s)); B.rotation.y = lerp(-0.3, 0.3, s); B.position.z = s * 0.25; if (t > 0.1 && !U.f) { U.f = true; U.events.push('swing'); } } }
    else if (state === 'recover') { R.rotation.set(-0.4, 0, -0.3); B.rotation.x = 0.1; U.weakMat.emissiveIntensity = 0.8; }
    else if (state === 'hurt') B.rotation.x = -0.15;
    else if (state === 'stagger') B.rotation.z = Math.sin(t * 5) * 0.15;
    else if (state === 'die') { const k = ease(cl(t / 0.9)); B.rotation.x = -1.4 * k; B.position.y = -0.15 * k; }
    if (state !== 'attack') U.f = false; if (state !== 'windup') U.r = false; if (state !== 'recover') U.weakMat.emissiveIntensity = 0;
  }
  // ---- The Night Manager: not quite human under the suit ----
  function buildNight(name) {
    const g = new THREE.Group(), fox = fk.makeFox({ key: name, torso: ['#1a1a1e', '#0c0c0e', '#050506'], crest: 'none', outfit: 'suit', mood: 'stern', eyes: ['#fff2b0', '#fff2b0'], look: { fur: '#8a8478', furDark: '#5a5448', muzzle: '#b8b0a0', chin: '#c8c0b0' } }); fox.scale.multiplyScalar(1.35); g.add(fox);
    const U = fox.userData, P = U.P, R = P.arms[1], L = P.arms[0];
    const cane = new THREE.Group(); cane.position.set(0, -0.46, 0.04); R.add(cane); M(new THREE.CylinderGeometry(0.02, 0.02, 1.0, 6), toon('#1a1a1e'), 0, 0, 0.45, cane, 0.006).rotation.x = Math.PI / 2; M(new THREE.SphereGeometry(0.05, 8, 6), toon('#ffd23a'), 0, 0, -0.04, cane, 0.006); cane.rotation.x = -1.2;
    const weakMat = wm('#fff2b0', '#ffd23a', 0.4), lift = P.legs[0].position.y - 0.5;
    const watch = M(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 12), weakMat, 0.18, 0.75 + lift, 0.28, P.body, 0.006); watch.rotation.x = Math.PI / 2;   // the pocket watch, stopped in spring 1957
    const mats = []; fox.traverse(o => { if (o.isMesh && o.material && !mats.includes(o.material)) mats.push(o.material); }); const clones = mats.map(m => { const c = m.clone(); c.transparent = true; return c; }); fox.traverse(o => { if (o.isMesh) { const i = mats.indexOf(o.material); if (i >= 0) o.material = clones[i]; } });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'night', variant: name, fox, P, weak: watch, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#fff2b0', calls, height: 2.35, reach: 1.6, phase: 1, boss: true, fade: clones, op: clones.map(m => m.opacity), events: [], joints: { weak: watch } });
    return g;
  }
  function animateNight(g, state, t, dt) {
    const U = g.userData, fox = U.fox, P = U.P, R = P.arms[1], L = P.arms[0], B = P.body, ph = U.phase; fk.animFox(fox, dt, state === 'move' ? 2.2 : 0, false); B.rotation.set(0, 0, 0); B.position.set(0, 0, 0); fox.position.set(0, 0, 0);
    let vis = 1; const stretch = ph >= 3 ? 1.7 : 1; R.scale.y = stretch * 1.25; L.scale.y = stretch * 1.25;   // phase 3: the suit stops pretending, the arms run long
    if (state === 'idle') { B.rotation.y = Math.sin(t * 0.3) * 0.2; }
    else if (state === 'windup') { const k = ease(cl(t / 0.8)); if (ph === 2) { vis = t < 0.4 ? 1 - t / 0.4 : (t - 0.4) / 0.4; fox.position.z = t > 0.4 ? 1.2 : 0; if (t > 0.38 && !U.blink) { U.blink = true; U.events.push('flicker'); } } R.rotation.set(lerp(0, -2.4, k), 0, lerp(0, 1.0, k)); B.rotation.y = -0.4 * k; }   // phase 2: the lights flicker and he is closer
    else if (state === 'attack') { const s = ease(cl(t / 0.3)); if (ph === 2) fox.position.z = 1.2; R.rotation.set(lerp(-2.4, -1.1, s), 0, lerp(1.0, -1.5, s)); if (ph >= 3) L.rotation.set(lerp(-2.4, -1.1, s), 0, lerp(-1.0, 1.5, s)); B.rotation.y = lerp(-0.4, 0.6, s); if (t > 0.15 && !U.f) { U.f = true; U.events.push(ph >= 3 ? 'slam' : 'swing'); } }
    else if (state === 'recover') { if (ph === 2) fox.position.z = 1.2; R.rotation.set(-0.5, 0, -1.2); B.rotation.x = 0.12; U.weakMat.emissiveIntensity = 1.2 + Math.sin(t * 10) * 0.4; }
    else if (state === 'hurt') B.rotation.x = -0.15;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 4) * 0.15; vis = Math.random() > 0.3 ? 1 : 0.3; }
    else if (state === 'armorBreak') { if (t < dt * 1.5) U.events.push('flicker'); vis = Math.random() > 0.5 ? 1 : 0.2; }
    else if (state === 'die') { const k = cl(t / 2.0); vis = 1 - k; B.rotation.x = -0.4 * k; }   // fades out like a light at closing time
    if (state !== 'attack') U.f = false; if (state !== 'windup') U.blink = false; if (state !== 'recover') U.weakMat.emissiveIntensity = 0.4;
    U.fade.forEach((m, i) => { m.opacity = U.op[i] * cl(vis); m.depthWrite = vis > 0.6; });
  }
  // ---- SPACE ----
  function buildBelt(name) {
    const g = new THREE.Group(), J = {}, sc = toon('#3a4a7a'), sc2 = toon('#5a6aa0'), bel = toon('#c8d0f0');
    J.segs = []; for (let i = 0; i < 18; i++) { const r = 0.38 * (1 - i / 22); const s = new THREE.Group(); g.add(s); M(new THREE.SphereGeometry(r, 12, 9), i % 2 ? sc : sc2, 0, 0, 0, s, 0.02); if (i % 3 === 0) { const f = M(new THREE.ConeGeometry(r * 0.4, r * 1.6, 4), toon('#9fb4ff'), 0, r * 1.1, 0, s, 0.008); } M(new THREE.SphereGeometry(r * 0.7, 8, 6), bel, 0, -r * 0.4, 0, s, 0); J.segs.push(s); }
    const head = new THREE.Group(); g.add(head); J.head = head; M(new THREE.BoxGeometry(0.6, 0.38, 0.85), sc2, 0, 0.04, 0.2, head, 0.025);
    const weakMat = wm('#e0f0ff', '#5fe3ff', 0.8); const eyes = [-1, 1].map(s => M(new THREE.SphereGeometry(0.08, 10, 8), weakMat, s * 0.24, 0.14, 0.45, head, 0.01));
    const jaw = new THREE.Group(); jaw.position.set(0, -0.12, 0); head.add(jaw); M(new THREE.BoxGeometry(0.55, 0.12, 0.75), bel, 0, -0.03, 0.32, jaw, 0.02); J.jaw = jaw;
    for (const s of [-1, 1]) { const fin = M(new THREE.ConeGeometry(0.12, 0.6, 4), toon('#9fb4ff'), s * 0.32, 0.2, -0.2, head, 0.008); fin.rotation.set(-1.2, 0, -s * 0.6); }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'belt', variant: name, joints: J, weak: eyes[0], weakMat, weakBase: new THREE.Color('#5fe3ff'), slabColor: '#5a6aa0', calls, height: 2.6, reach: 2.4, frame: 2.4, trail: [], hp: new THREE.Vector3(1.5, 1.6, 0), events: [] });
    return g;
  }
  function animateBelt(g, state, t, dt) {
    const U = g.userData, J = U.joints, T = new THREE.Vector3(); let jaw = 0.1, rate = 6;
    if (state === 'idle' || state === 'move') { const a = t * (state === 'move' ? 1.2 : 0.6); T.set(Math.cos(a) * 1.6, 1.6 + Math.sin(a * 2) * 0.4, Math.sin(a) * 1.6); }   // prowls in a slow loop through the rocks
    else if (state === 'windup') { const a = t * 4; T.set(Math.cos(a) * 0.7, 1.9 + Math.sin(t * 3) * 0.2, Math.sin(a) * 0.7 - 0.4); jaw = 0.3; rate = 10; }   // coils
    else if (state === 'attack') { const k = cl(t / 0.6); T.set(0, lerp(1.9, 1.2, k), lerp(-0.4, 3.2, ease(k))); jaw = k < 0.6 ? 0.8 : 0.1; rate = 18; if (k > 0.5 && !U.f) { U.f = true; U.events.push('swing'); } }   // lunges
    else if (state === 'recover') { T.set(Math.sin(t) * 0.3, 1.2, 2.8); jaw = 0.3; rate = 4; }
    else if (state === 'hurt') { T.copy(U.hp).add(new THREE.Vector3(Math.sin(t * 50) * 0.08, 0, 0)); rate = 20; }
    else if (state === 'stagger') { T.set(Math.sin(t * 3) * 0.8, 1.4 + Math.sin(t * 5) * 0.3, 1.0); rate = 5; }
    else if (state === 'die') { const k = ease(cl(t / 2.0)); T.set(0, lerp(1.6, 0.4, k), 1.0); jaw = 0.5; rate = 4; }
    if (state !== 'attack') U.f = false;
    U.hp.lerp(T, 1 - Math.exp(-rate * dt)); const tr = U.trail; if (!tr.length) for (let i = 0; i < 100; i++) tr.push(U.hp.clone().add(new THREE.Vector3(-i * 0.05, 0, 0)));
    if (tr[0].distanceTo(U.hp) > 0.05) { tr.unshift(U.hp.clone()); if (tr.length > 110) tr.pop(); }
    J.head.position.copy(U.hp); J.head.lookAt(U.hp.clone().multiplyScalar(2).sub(tr[3])); J.jaw.rotation.x = jaw;
    J.segs.forEach((s, i) => { const p = tr[Math.min(tr.length - 1, (i + 1) * 5)]; s.position.copy(p); s.lookAt(tr[Math.min(tr.length - 1, (i + 1) * 5 - 2)]); });
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 1.8 : 0.8;
  }
  function buildMoths(name) {
    const g = new THREE.Group(), J = {}, nestM = wm('#d68cff', '#c084fc', 0.6);
    const nest = new THREE.Group(); nest.position.y = 1.2; g.add(nest); J.nest = nest; for (let i = 0; i < 6; i++) { const a = i * 1.05; const c = M(new THREE.OctahedronGeometry(0.28, 0), nestM, Math.cos(a) * 0.22, (i % 3) * 0.12, Math.sin(a) * 0.22, nest, 0.015); c.scale.y = 2; c.rotation.set(Math.cos(a) * 0.4, 0, Math.sin(a) * 0.4); }
    const wingM = new THREE.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false });
    J.moths = []; for (let i = 0; i < 7; i++) { const m = new THREE.Group(); g.add(m); M(new THREE.CapsuleGeometry(0.04, 0.12, 3, 6), toon('#2a2a44'), 0, 0, 0, m, 0.005).rotation.x = Math.PI / 2; const glow = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshBasicMaterial({ color: '#5fe3ff' })); glow.position.z = -0.08; m.add(glow); const w = [-1, 1].map(s => { const p = new THREE.Group(); m.add(p); const pl = new THREE.Mesh(new THREE.CircleGeometry(0.16, 10), wingM); pl.position.x = s * 0.15; pl.rotation.x = -Math.PI / 2; p.add(pl); return { p, s }; }); J.moths.push({ m, w, a: i * 0.9, r: 0.7 + (i % 3) * 0.3, h: 0.8 + (i % 4) * 0.3 }); }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'moths', variant: name, joints: J, weak: nest.children[0], weakMat: nestM, weakBase: new THREE.Color('#c084fc'), slabColor: '#5fe3ff', calls, height: 2.2, reach: 1.8, events: [] });
    return g;
  }
  function animateMoths(g, state, t, dt) {
    const U = g.userData, J = U.joints; let spread = 1, speed = 1, fwd = 0, glow = 0.6;
    if (state === 'move') speed = 1.6;
    else if (state === 'windup') { spread = lerp(1, 0.35, ease(cl(t / 0.8))); speed = 3; glow = 1.4; }   // the swarm gathers
    else if (state === 'attack') { const k = cl(t / 0.6); fwd = Math.sin(k * Math.PI) * 2.6; spread = 0.4 + k * 0.6; speed = 4; if (!U.f) { U.f = true; U.events.push('swarm'); } }
    else if (state === 'recover') { spread = 1.3; speed = 0.5; glow = 1.6 + Math.sin(t * 10) * 0.4; }   // scattered; the nest is open
    else if (state === 'stagger' || state === 'hurt') { spread = 1.5; speed = 2.5; }
    else if (state === 'die') { spread = 1 + t; speed = 0.3; glow = Math.max(0, 0.6 - t * 0.3); }
    if (state !== 'attack') U.f = false;
    J.moths.forEach((q, i) => { q.a += dt * speed * (1 + i * 0.07); const r = q.r * spread; q.m.position.set(Math.cos(q.a) * r, q.h + Math.sin(q.a * 2 + i) * 0.2 * spread + (state === 'die' ? -t * 0.4 : 0), Math.sin(q.a) * r + fwd); q.m.rotation.y = -q.a; q.w.forEach(w => w.p.rotation.z = w.s * Math.sin(t * 30 + i) * 0.7); q.m.visible = !(state === 'die' && t > 1.6 + i * 0.1); });
    J.nest.rotation.y = t * 0.3; U.weakMat.emissiveIntensity = glow;
  }
  function buildOcto(name) {
    const g = new THREE.Group(), J = {}, skin = toon('#7a3a8a'), skin2 = toon('#c070c8');
    const body = new THREE.Group(); body.position.y = 2.0; g.add(body); J.body = body;
    const mantle = M(new THREE.SphereGeometry(0.8, 18, 14), skin, 0, 0.6, -0.2, body, 0.03, 0.8); mantle.scale.set(1, 1.3, 1.1);
    for (let i = 0; i < 6; i++) M(new THREE.SphereGeometry(0.1, 8, 6), skin2, Math.cos(i) * 0.6, 0.5 + (i % 3) * 0.3, Math.sin(i) * 0.5 - 0.2, body, 0);
    const weakMat = wm('#fff2b0', '#ffd23a', 0.6); const eyes = [-1, 1].map(s => { const e = M(new THREE.SphereGeometry(0.17, 12, 10), weakMat, s * 0.35, 0.1, 0.45, body, 0.012, 0.17); M(new THREE.BoxGeometry(0.2, 0.04, 0.02), toon('#1a1a1e'), s * 0.35, 0.1, 0.62, body, 0); return e; });
    J.arms = []; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; let par = body; const segs = []; const root = new THREE.Group(); root.position.set(Math.cos(a) * 0.45, -0.1, Math.sin(a) * 0.45); body.add(root); par = root; for (let j = 0; j < 6; j++) { const s = new THREE.Group(); s.position.y = j ? -0.34 : 0; par.add(s); M(new THREE.CylinderGeometry(0.12 - j * 0.017, 0.11 - j * 0.017, 0.36, 7), j % 2 ? skin : skin2, 0, -0.17, 0, s, 0.008); segs.push(s); par = s; } J.arms.push({ root, segs, a }); }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'octo', variant: name, joints: J, weak: eyes[0], weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#7a3a8a', calls, height: 4.0, reach: 2.6, events: [] });
    return g;
  }
  function animateOcto(g, state, t, dt) {
    const U = g.userData, J = U.joints, B = J.body; B.position.set(0, 2.0, 0); B.rotation.set(0, 0, 0); let curl = 0.25, reach = 0, wave = 1;
    if (state === 'idle') { B.position.y += Math.sin(t * 0.8) * 0.15; B.position.x = Math.sin(t * 0.3) * 0.6; }   // swims straight past you
    else if (state === 'move') { const k = (t * 0.6) % 2; B.position.y += Math.sin(t * 2) * 0.1; curl = 0.1 + Math.abs(Math.sin(t * 2)) * 0.4; B.rotation.x = -0.4; }   // jets
    else if (state === 'windup') { const k = ease(cl(t / 1.0)); curl = lerp(0.25, -0.35, k); B.position.y += 0.4 * k; B.rotation.x = -0.25 * k; wave = 2; }   // tentacles rise
    else if (state === 'attack') { const k = cl(t / 0.7), s = ease(cl(k / 0.4)); curl = lerp(-0.35, 0.6, s); reach = s; B.rotation.x = 0.3 * s; B.position.z = s * 0.6; if (k > 0.4 && !U.f) { U.f = true; U.events.push('slam'); } }
    else if (state === 'recover') { curl = 0.5; B.position.y -= 0.5; B.rotation.x = 0.25; if (t < dt * 1.5) U.events.push('ink'); }
    else if (state === 'hurt') { B.position.x = Math.sin(t * 40) * 0.06; curl = 0.5; }
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 2) * 0.25; wave = 0.5; }
    else if (state === 'die') { const k = ease(cl(t / 2.2)); B.position.y = lerp(2.0, 0.6, k); curl = 0.6 * (1 - k) + 0.05; wave = 0.3; }
    if (state !== 'attack') U.f = false;
    J.arms.forEach((A, i) => { const front = Math.cos(A.a - Math.PI / 2) > 0.3; A.root.rotation.set(Math.sin(A.a) * 0.4 + (front ? reach * 1.2 : 0), 0, -Math.cos(A.a) * 0.4); A.segs.forEach((s, j) => { s.rotation.x = Math.sin(t * 2 * wave + i + j * 0.6) * 0.18 + curl * (front ? 1 : 0.7) * (Math.sin(A.a) > 0 ? 1 : -1) * 0.5; s.rotation.z = Math.cos(t * 1.6 * wave + i * 1.3 + j * 0.5) * 0.15 + curl * Math.cos(A.a) * 0.4; }); });
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 1.6 + Math.sin(t * 10) * 0.4 : 0.6;
  }
  return {
    beast: { names: ['Desert Stray', 'Cellar Rat'], build: buildBeast, animate: animateBeast, dur: { windup: 0.7, attack: 0.45, recover: 0.8 } },
    crew: { names: ['Suit', 'Doorman', 'Airman', 'Manager'], build: buildCrew, animate: animateCrew, dur: { windup: 0.7, attack: 0.45, recover: 1.0, die: 1.6 } },
    night: { names: ['The Night Manager'], build: buildNight, animate: animateNight, enter: (g, s) => { if (s === 'armorBreak') g.userData.phase = Math.min(3, g.userData.phase + 1); }, dur: { windup: 0.9, attack: 0.5, recover: 1.3, armorBreak: 0.9, die: 2.4 } },
    belt: { names: ['The Belt Serpent'], build: buildBelt, animate: animateBelt, dur: { windup: 1.1, attack: 0.8, recover: 1.4, die: 2.4 } },
    moths: { names: ['Void Moths'], build: buildMoths, animate: animateMoths, dur: { windup: 0.9, attack: 0.7, recover: 1.4, die: 2.4 } },
    octo: { names: ['The Octopus'], build: buildOcto, animate: animateOcto, dur: { windup: 1.1, attack: 0.8, recover: 1.6, die: 2.6 } },
  };
}
