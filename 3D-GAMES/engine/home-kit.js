// 8 GATES — HOME creatures (snow + worms). Registered into creatureKit by the host via ck.register.
export function homeFamilies({ THREE, toon, M }) {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k);
  const snow = () => toon('#f4f8fb'), snow2 = () => toon('#d6e4ee'), coal = () => toon('#1a1a1e'), carrot = () => toon('#ff8a1a'), ice = () => toon('#a8e0f5');
  // ---- snowmen: nobody built them ----
  function buildSnow(name) {
    const icicle = /Icicle/.test(name), g = new THREE.Group(), J = {};
    const weakMat = new THREE.MeshToonMaterial({ color: '#2a2a30', emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const body = new THREE.Group(); g.add(body); J.body = body;
    M(new THREE.SphereGeometry(0.55, 16, 12), snow(), 0, 0.5, 0, body, 0.03, 0.55);
    const mid = new THREE.Group(); mid.position.y = 1.2; body.add(mid); J.mid = mid; M(new THREE.SphereGeometry(0.4, 14, 10), snow(), 0, 0, 0, mid, 0.025, 0.4);
    const heart = M(new THREE.SphereGeometry(0.07, 8, 6), weakMat, 0, 0.1, 0.38, mid, 0); for (const y of [-0.12]) M(new THREE.SphereGeometry(0.05, 6, 5), coal(), 0, y, 0.39, mid, 0);   // coal buttons; the top one is its heart
    const head = new THREE.Group(); head.position.y = 0.6; mid.add(head); J.head = head; M(new THREE.SphereGeometry(0.28, 14, 10), snow(), 0, 0, 0, head, 0.02, 0.28);
    for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.04, 6, 5), coal(), s * 0.1, 0.06, 0.25, head, 0);
    const nose = M(new THREE.ConeGeometry(0.05, 0.26, 8), carrot(), 0, 0, 0.36, head, 0.008); nose.rotation.x = Math.PI / 2;
    for (let i = 0; i < 5; i++) M(new THREE.SphereGeometry(0.02, 5, 4), coal(), (i - 2) * 0.05, -0.1 - Math.abs(i - 2) * -0.015, 0.25, head, 0);   // a frown
    if (!icicle) { const hat = new THREE.Group(); hat.position.y = 0.24; head.add(hat); M(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 14), coal(), 0, 0, 0, hat, 0.01); M(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 14), coal(), 0, 0.16, 0, hat, 0.012); }
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.36, 0.12, 0); mid.add(sh); const st = M(new THREE.CylinderGeometry(0.025, 0.035, 0.7, 5), toon('#5a3d2b'), s * 0.3, 0, 0, sh, 0.008); st.rotation.z = -s * 1.2; const hand = new THREE.Group(); hand.position.set(s * 0.62, 0.2, 0); sh.add(hand); return { sh, hand, s }; });
    if (icicle) { const ic = M(new THREE.ConeGeometry(0.1, 1.3, 8), ice(), 0, 0.55, 0, J.arms[1].hand, 0.01); J.icicle = ic; for (let i = 0; i < 6; i++) { const c = M(new THREE.ConeGeometry(0.04, 0.25, 6), ice(), Math.cos(i) * 0.2, -0.15, Math.sin(i) * 0.2, head, 0.006); c.rotation.x = Math.PI; } }
    else { J.ball = M(new THREE.SphereGeometry(0.12, 10, 8), snow2(), 0, 0, 0, J.arms[1].hand, 0.01); J.ball.visible = false; }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'snow', variant: name, joints: J, weak: heart, weakMat, weakBase: new THREE.Color('#5fe3ff'), slabColor: '#f4f8fb', calls, height: 2.1, reach: icicle ? 1.6 : 0, ranged: !icicle, laneAngles: icicle ? null : [0], events: [] });
    return g;
  }
  function animateSnow(g, state, t, dt) {
    const U = g.userData, J = U.joints, icicle = !U.ranged; J.body.position.set(0, 0, 0); J.body.rotation.set(0, 0, 0); J.mid.rotation.set(0, 0, 0); J.head.rotation.set(0, 0, 0);
    let a0 = [0, 0, 0], a1 = [0, 0, 0], open = 0; if (J.ball) J.ball.visible = false;
    if (state === 'idle') { J.head.rotation.y = Math.sin(t * 0.5) * 0.4; J.body.rotation.z = Math.sin(t * 0.8) * 0.02; }
    else if (state === 'move') { J.body.position.y = Math.abs(Math.sin(t * 5)) * 0.12; J.body.rotation.z = Math.sin(t * 5) * 0.08; }   // it hops; nobody saw it walk
    else if (state === 'windup') { const k = ease(cl(t / (icicle ? 1.1 : 0.7))); if (icicle) { J.mid.rotation.y = -1.6 * k; a1 = [0, -0.4 * k, -0.6 * k]; open = k; } else { a1 = [lerp(0, -0.8, k), 0, lerp(0, 0.9, k)]; J.ball.visible = true; J.mid.rotation.y = -0.4 * k; } }   // the Icicle winds all the way back
    else if (state === 'attack') { const k = cl(t / 0.5), s = ease(cl(k / 0.4)); if (icicle) { J.mid.rotation.y = lerp(-1.6, 1.0, s); a1 = [0, lerp(-0.4, 0.2, s), lerp(-0.6, 0.3, s)]; if (k > 0.35 && !U.f) { U.f = true; U.events.push('swing'); } } else { a1 = [lerp(-0.8, 0.2, s), 0, lerp(0.9, -0.3, s)]; J.mid.rotation.y = lerp(-0.4, 0.3, s); J.ball.visible = k < 0.3; if (k > 0.3 && !U.f) { U.f = true; U.events.push('snowball'); } } }
    else if (state === 'recover') { J.mid.rotation.y = icicle ? 1.0 : 0.3; J.body.rotation.x = 0.1; open = 1; }
    else if (state === 'hurt') J.body.position.x = Math.sin(t * 50) * 0.03;
    else if (state === 'stagger') { J.head.rotation.z = Math.sin(t * 4) * 0.3; J.body.rotation.z = Math.sin(t * 3) * 0.1; }
    else if (state === 'die') { const k = ease(cl(t / 1.2)); J.body.scale.set(1 + k * 0.4, Math.max(0.05, 1 - k), 1 + k * 0.4); if (t < dt * 1.5) U.events.push('snowpuff'); }   // slumps into a drift
    if (state !== 'die') J.body.scale.set(1, 1, 1); if (state !== 'attack') U.f = false;
    J.arms[0].sh.rotation.set(a0[0], a0[1], a0[2]); J.arms[1].sh.rotation.set(a1[0], a1[1], a1[2]);
    U.weakMat.emissiveIntensity = open ? 0.6 + open * 0.8 : 0;
  }
  // ---- the Snow King ----
  function buildKing(name) {
    const g = new THREE.Group(), J = {};
    const throne = new THREE.Group(); throne.position.z = -0.9; g.add(throne); M(new THREE.BoxGeometry(2.4, 0.6, 1.4), ice(), 0, 0.3, 0, throne, 0.03); M(new THREE.BoxGeometry(2.4, 2.6, 0.3), ice(), 0, 1.6, -0.6, throne, 0.03);
    for (let i = 0; i < 5; i++) { const c = M(new THREE.ConeGeometry(0.15, 0.8, 6), ice(), (i - 2) * 0.5, 3.1 + (i === 2 ? 0.3 : 0), -0.6, throne, 0.01); }
    const body = new THREE.Group(); g.add(body); J.body = body;
    M(new THREE.SphereGeometry(1.0, 18, 14), snow(), 0, 1.0, 0, body, 0.035, 1.0);
    const mid = new THREE.Group(); mid.position.y = 2.25; body.add(mid); J.mid = mid; M(new THREE.SphereGeometry(0.72, 16, 12), snow(), 0, 0, 0, mid, 0.03, 0.72);
    const weakMat = new THREE.MeshToonMaterial({ color: '#2a2a30', emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 0.3, gradientMap: toon('#fff').gradientMap });
    const heart = M(new THREE.SphereGeometry(0.14, 10, 8), weakMat, 0, 0.12, 0.7, mid, 0);
    M(new THREE.TorusGeometry(0.74, 0.08, 6, 20), toon('#7a1d2a'), 0, -0.35, 0, mid, 0.012).rotation.x = Math.PI / 2;   // a robe sash
    const head = new THREE.Group(); head.position.y = 1.05; mid.add(head); J.head = head; M(new THREE.SphereGeometry(0.48, 14, 12), snow(), 0, 0, 0, head, 0.025, 0.48);
    for (const s of [-1, 1]) M(new THREE.SphereGeometry(0.07, 8, 6), coal(), s * 0.17, 0.1, 0.43, head, 0);
    const nose = M(new THREE.ConeGeometry(0.08, 0.45, 8), carrot(), 0, 0, 0.6, head, 0.01); nose.rotation.x = Math.PI / 2;
    const crown = new THREE.Group(); crown.position.y = 0.42; head.add(crown); M(new THREE.CylinderGeometry(0.32, 0.36, 0.18, 14, 1, true), toon('#ffd23a', { side: THREE.DoubleSide }), 0, 0, 0, crown, 0.01); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; M(new THREE.ConeGeometry(0.06, 0.22, 4), toon('#ffd23a'), Math.cos(a) * 0.32, 0.18, Math.sin(a) * 0.32, crown, 0.006); }   // a crown nobody made
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 0.7, 0.2, 0); mid.add(sh); M(new THREE.SphereGeometry(0.3, 10, 8), snow2(), s * 0.15, 0, 0, sh, 0.015); M(new THREE.CylinderGeometry(0.2, 0.18, 1.0, 10), snow(), s * 0.2, -0.5, 0, sh, 0.02); const fist = M(new THREE.SphereGeometry(0.32, 12, 10), snow2(), s * 0.2, -1.1, 0.05, sh, 0.02); return { sh, fist, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'king', variant: name, joints: J, weak: heart, weakMat, weakBase: new THREE.Color('#5fe3ff'), slabColor: '#f4f8fb', calls, height: 4.0, reach: 2.2, phase: 1, boss: true, events: [] });
    return g;
  }
  function animateKing(g, state, t, dt) {
    const U = g.userData, J = U.joints, ph = U.phase; J.body.position.set(0, 0, 0); J.mid.rotation.set(0, 0, 0); J.head.rotation.set(0, 0, 0);
    let a0 = [0.1, 0, 0.1], a1 = [0.1, 0, -0.1];
    if (state === 'idle') { J.head.rotation.y = Math.sin(t * 0.4) * 0.3; J.mid.rotation.z = Math.sin(t * 0.7) * 0.03; }
    else if (state === 'move') J.mid.rotation.y = Math.sin(t * 1.1) * 0.4;
    else if (state === 'windup') { const k = ease(cl(t / 1.0)); if (ph === 1) { a0 = [lerp(0.1, -2.6, k), 0, 0.4]; a1 = [lerp(0.1, -2.6, k), 0, -0.4]; J.mid.rotation.x = -0.15 * k; } else if (ph === 2) { a1 = [lerp(0.1, -0.6, k), 0, lerp(-0.1, 0.9, k)]; J.mid.rotation.y = -0.5 * k; } else { a0 = [-1.5 * k, 0, 1.2 * k]; a1 = [-1.5 * k, 0, -1.2 * k]; J.head.rotation.x = -0.4 * k; } }
    else if (state === 'attack') { const k = cl(t / 0.7), s = ease(cl(k / 0.4));
      if (ph === 1) { a0 = [lerp(-2.6, 0.5, s), 0, 0.2]; a1 = [lerp(-2.6, 0.5, s), 0, -0.2]; J.mid.rotation.x = 0.35 * s; if (k > 0.4 && !U.f) { U.f = true; U.events.push('slam'); } }   // 1 two-arm swings
      else if (ph === 2) { a1 = [lerp(-0.6, 0.8, s), 0, lerp(0.9, -0.2, s)]; J.mid.rotation.y = lerp(-0.5, 0.3, s); if (k > 0.35 && !U.f) { U.f = true; U.events.push('rollball'); } }   // 2 snowballs that grow as they roll
      else { a0 = [-1.5, 0, 1.2]; a1 = [-1.5, 0, -1.2]; J.head.rotation.x = 0.2; if (!U.f) { U.f = true; U.events.push('iceFloor', 'roar'); } } }   // 3 the floor freezes slick
    else if (state === 'recover') { J.mid.rotation.x = 0.25; a0 = [0.5, 0, 0.2]; a1 = [0.5, 0, -0.2]; }
    else if (state === 'hurt') J.body.position.x = Math.sin(t * 40) * 0.04;
    else if (state === 'stagger') { J.mid.rotation.z = Math.sin(t * 3) * 0.15; J.head.rotation.z = Math.sin(t * 4) * 0.2; }
    else if (state === 'armorBreak') { if (t < dt * 1.5) U.events.push('snowpuff', 'roar'); J.mid.rotation.x = -0.2 * Math.sin(cl(t / 1.2) * Math.PI); }
    else if (state === 'die') { const k = ease(cl(t / 2.0)); J.body.scale.set(1 + k * 0.3, Math.max(0.05, 1 - k), 1 + k * 0.3); if (t < dt * 1.5) U.events.push('snowpuff'); }
    if (state !== 'die') J.body.scale.set(1, 1, 1); if (state !== 'attack') U.f = false;
    J.arms[0].sh.rotation.set(a0[0], a0[1], a0[2]); J.arms[1].sh.rotation.set(a1[0], a1[1], a1[2]);
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 1.2 + Math.sin(t * 10) * 0.4 : 0.3;
  }
  // ---- worms ----
  function buildWorm(name) {
    const burrow = /Burrower/.test(name), g = new THREE.Group(), J = {}, c1 = toon(burrow ? '#a0624a' : '#c48a9a'), c2 = toon(burrow ? '#7a4a38' : '#9a6a78');
    const weakMat = new THREE.MeshToonMaterial({ color: '#ffe0e8', emissive: new THREE.Color('#ff7fb0'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.45, 18), new THREE.MeshBasicMaterial({ color: '#2a2018' })); hole.rotation.x = -Math.PI / 2; hole.position.y = 0.02; g.add(hole);
    J.segs = []; for (let i = 0; i < 9; i++) { const s = M(new THREE.SphereGeometry(0.26 - i * 0.012, 12, 9), i % 2 ? c1 : c2, 0, 0, 0, g, 0.015); J.segs.push(s); }
    const head = new THREE.Group(); g.add(head); J.head = head;
    M(new THREE.SphereGeometry(0.24, 12, 10), c1, 0, 0, 0, head, 0.015);
    const mouth = M(new THREE.TorusGeometry(0.11, 0.04, 6, 14), weakMat, 0, 0, 0.2, head, 0); J.mouth = mouth;   // the round mouth is the soft spot
    if (burrow) for (let i = 0; i < 6; i++) { const a = i * 1.05; const c = M(new THREE.ConeGeometry(0.03, 0.12, 4), toon('#e8e4dc'), Math.cos(a) * 0.12, Math.sin(a) * 0.12, 0.24, head, 0); c.rotation.x = Math.PI / 2; }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'worm', variant: name, joints: J, weak: mouth, weakMat, weakBase: new THREE.Color('#ff7fb0'), slabColor: burrow ? '#a0624a' : '#c48a9a', calls, height: 1.9, reach: 0, ranged: !burrow, laneAngles: burrow ? null : [0], charge: burrow, events: [] });
    return g;
  }
  function animateWorm(g, state, t, dt) {
    const U = g.userData, J = U.joints; let h = 1.5, lean = 0.2, sway = Math.sin(t * 1.4) * 0.15, open = 0;
    if (state === 'move') { sway = Math.sin(t * 4) * 0.35; h = 1.3; }
    else if (state === 'windup') { const k = ease(cl(t / 0.8)); lean = U.charge ? lerp(0.2, -0.3, k) : lerp(0.2, -0.4, k); h = U.charge ? lerp(1.5, 0.7, k) : 1.6; open = U.charge ? 0 : k; }   // the Spitter rears back; the Burrower drops low
    else if (state === 'attack') { const k = cl(t / 0.5); if (U.charge) { lean = 1.3; h = 0.6; } else { lean = lerp(-0.4, 0.6, ease(cl(k / 0.3))); open = 1 - k; if (k > 0.15 && !U.f) { U.f = true; U.events.push('wormSpit'); } } }
    else if (state === 'recover') { if (U.charge) { lean = 1.4; h = 0.5; } else { h = lerp(1.5, 0.6, cl(t / 0.6)); } open = 0.6; }   // the Spitter ducks back into its hole
    else if (state === 'hurt') sway = Math.sin(t * 50) * 0.1;
    else if (state === 'stagger') { sway = Math.sin(t * 6) * 0.5; lean = 0.6; }
    else if (state === 'die') { const k = ease(cl(t / 1.2)); h = lerp(1.5, 0.2, k); lean = 1.4 * k; }
    if (state !== 'attack') U.f = false;
    // the body is a curve out of the hole: up, then leaning forward at the top
    const n = J.segs.length; J.segs.forEach((s, i) => { const u = (i + 1) / (n + 1); s.position.set(Math.sin(sway * u * 2) * u * 0.4, u * h, Math.sin(lean * u) * u * h * 0.9); });
    J.head.position.set(Math.sin(sway * 2) * 0.4, h + 0.1, Math.sin(lean) * h * 0.9 + 0.1); J.head.rotation.set(-lean * 0.6 + 0.2, sway, 0);
    U.weakMat.emissiveIntensity = open * 1.4 + (state === 'recover' || state === 'stagger' ? 0.8 : 0);
  }
  // ---- The Fed One: a gentle boss ----
  function buildFed(name) {
    const g = new THREE.Group(), J = {}, body = toon('#e8d8f0'), glowM = new THREE.MeshToonMaterial({ color: '#f5e6ff', emissive: new THREE.Color('#c084fc'), emissiveIntensity: 0.6, gradientMap: toon('#fff').gradientMap });
    J.segs = []; for (let i = 0; i < 12; i++) { const r = 0.62 - Math.abs(i - 4) * 0.035; const s = M(new THREE.SphereGeometry(r, 16, 12), i % 3 === 1 ? glowM : body, 0, 0, 0, g, 0.025, r); J.segs.push(s); }
    const head = new THREE.Group(); g.add(head); J.head = head; M(new THREE.SphereGeometry(0.66, 16, 12), body, 0, 0, 0, head, 0.025, 0.66);
    for (const s of [-1, 1]) { M(new THREE.SphereGeometry(0.12, 10, 8), toon('#2a2030'), s * 0.24, 0.12, 0.56, head, 0); const tear = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), new THREE.MeshBasicMaterial({ color: '#a8e0f5' })); tear.position.set(s * 0.26, -0.04, 0.6); head.add(tear); }   // big, sad eyes
    const crystal = new THREE.Group(); crystal.position.set(0, 3.6, -0.3); g.add(crystal); J.crystal = crystal; for (let i = 0; i < 5; i++) { const c = M(new THREE.OctahedronGeometry(0.35, 0), new THREE.MeshToonMaterial({ color: '#d68cff', emissive: new THREE.Color('#c084fc'), emissiveIntensity: 0.5, gradientMap: toon('#fff').gradientMap }), (i - 2) * 0.4, Math.abs(i - 2) * -0.2, 0, crystal, 0.015); c.scale.y = 2; c.rotation.x = Math.PI; }   // the crystal it lives under
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'fed', variant: name, joints: J, weak: J.segs[1], weakMat: glowM, weakBase: new THREE.Color('#c084fc'), slabColor: '#e8d8f0', calls, height: 3.0, reach: 0, boss: false, gentle: true, frame: 2.6, events: [] });
    return g;
  }
  function animateFed(g, state, t, dt) {
    const U = g.userData, J = U.joints; let rise = 1.2, curl = 1, sway = Math.sin(t * 0.6) * 0.2, glow = 0.6 + Math.sin(t * 1.5) * 0.2, droop = 0.3;
    if (state === 'move') sway = Math.sin(t * 1.2) * 0.5;
    else if (state === 'windup') { const k = cl(t / 1.0); rise = 1.2 + k * 0.8; glow = 0.6 + k * 1.6; droop = 0.3 - 0.5 * k; }
    else if (state === 'attack') { glow = 2.2; rise = 2.0; droop = -0.2; if (!U.f) { U.f = true; U.events.push('wail'); } }   // not an attack: a long sad call that pushes you back
    else if (state === 'recover') { rise = 0.5; droop = 0.6; glow = 0.4; }
    else if (state === 'hurt') { sway = Math.sin(t * 40) * 0.1; droop = 0.6; }
    else if (state === 'stagger') { sway = Math.sin(t * 2) * 0.6; }
    else if (state === 'die') { const k = ease(cl(t / 2.0)); rise = lerp(1.2, 0.2, k); curl = 1 + k * 1.5; glow = 0.6 + k * 1.5; droop = 0.8 * k; }   // it curls up, glowing and calm
    if (state !== 'attack') U.f = false;
    const n = J.segs.length; J.segs.forEach((s, i) => { const u = i / (n - 1), a = u * Math.PI * 1.4 * curl + sway; s.position.set(Math.cos(a) * 1.3 * (1 - u * 0.3), 0.55 + Math.sin(u * Math.PI) * rise * 0.6, Math.sin(a) * 1.0 - 0.2); });
    const last = J.segs[n - 1].position; J.head.position.set(last.x * 0.4, 0.6 + rise, 0.7); J.head.rotation.set(droop, sway * 0.5, 0);
    U.weakMat.emissiveIntensity = glow; J.crystal.rotation.y = t * 0.15;
  }
  return {
    snow: { names: ['Snowball Sentry', 'Icicle Snowman'], build: buildSnow, animate: animateSnow, dur: { windup: 0.8, attack: 0.5, recover: 1.3, die: 1.6 } },
    king: { names: ['The Snow King'], build: buildKing, animate: animateKing, enter: (g, s) => { if (s === 'armorBreak') g.userData.phase = Math.min(3, g.userData.phase + 1); }, dur: { windup: 1.2, attack: 0.8, recover: 1.6, armorBreak: 1.2, die: 2.6 } },
    worm: { names: ['Spitter Worm', 'Burrower Worm'], build: buildWorm, animate: animateWorm, dur: { windup: 0.9, attack: 0.5, recover: 1.2, stagger: 1.6 } },
    fed: { names: ['The Fed One'], build: buildFed, animate: animateFed, dur: { windup: 1.2, attack: 1.4, recover: 1.6, die: 2.6 } },
  };
}
