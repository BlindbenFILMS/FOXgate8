// 8 GATES — ZION creatures (scrap) + the Zion gang (fox kit). Registered into creatureKit by the host via ck.register.
export function zionFamilies({ THREE, toon, M, fk }) {
  const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = k => k * k * (3 - 2 * k), rr = (a, b) => a + Math.random() * (b - a);
  const rust = () => toon('#8a4a2a'), rust2 = () => toon('#5a3020'), steelM = () => toon('#9aa0a8'), hub = () => toon('#cfd6dc');
  function buildScrap(name) {
    const kind = name === 'Scrapper' ? 'scrapper' : name === 'Rust Hulk' ? 'hulk' : 'bolt', g = new THREE.Group(), J = {};
    const weakMat = new THREE.MeshToonMaterial({ color: '#ffb020', emissive: new THREE.Color('#ff8a1a'), emissiveIntensity: 0.4, gradientMap: toon('#fff').gradientMap });
    const body = new THREE.Group(); g.add(body); J.body = body; J.parts = [];
    const part = (geo, mat, x, y, z, par = body, o = 0.015) => { const p = M(geo, mat, x, y, z, par, o); p.userData.home = p.position.clone(); p.userData.hr = p.rotation.clone(); J.parts.push(p); return p; };
    if (kind === 'scrapper') {
      body.position.y = 0.35;
      part(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16), hub(), 0, 0.05, 0).rotation.x = Math.PI / 2;   // a hubcap body
      part(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10), rust(), 0, 0.05, 0.06).rotation.x = Math.PI / 2;
      const eye = part(new THREE.SphereGeometry(0.06, 8, 6), weakMat, 0, 0.12, 0.1); J.eye = eye;
      for (const s of [-1, 1]) { const w = part(new THREE.BoxGeometry(0.04, 0.36, 0.04), steelM(), s * 0.3, -0.05, 0.05); w.rotation.z = s * 0.5; part(new THREE.BoxGeometry(0.12, 0.05, 0.04), steelM(), s * 0.42, 0.11, 0.05).rotation.z = s * 0.5; }   // wrench arms
      J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.15, -0.25, 0); body.add(p); M(new THREE.CylinderGeometry(0.025, 0.025, 0.25, 5), rust2(), 0, -0.05, 0, p, 0.008); return p; });
      Object.assign(g.userData, { weak: eye, reach: 0.9, flock: true, height: 0.75 });
    } else if (kind === 'hulk') {
      body.position.y = 0.55;
      part(new THREE.BoxGeometry(1.4, 0.9, 2.2), rust(), 0, 0.5, 0, body, 0.03); part(new THREE.BoxGeometry(1.2, 0.6, 0.9), rust2(), 0, 1.2, 0.5, body, 0.025);
      for (let i = 0; i < 5; i++) part(new THREE.BoxGeometry(rr(0.3, 0.6), rr(0.2, 0.4), rr(0.3, 0.6)), [rust(), steelM(), rust2()][i % 3], rr(-0.5, 0.5), 1.1 + rr(0, 0.4), rr(-0.8, 0.2));
      part(new THREE.BoxGeometry(1.5, 0.25, 0.2), steelM(), 0, 0.15, 1.15);
      const grille = part(new THREE.BoxGeometry(0.9, 0.4, 0.06), weakMat, 0, 0.6, 1.12); J.eye = grille;   // the glowing engine behind the grille
      for (const s of [-1, 1]) { const l = part(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10), new THREE.MeshBasicMaterial({ color: '#fff2b0' }), s * 0.5, 0.75, 1.13); l.rotation.x = Math.PI / 2; }
      J.wheels = []; for (const s of [-1, 1]) for (const z of [-0.7, 0.7]) { const w = M(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 14), toon('#1a1a1e'), s * 0.75, -0.15, z, body, 0.02, 0.38); w.rotation.z = Math.PI / 2; J.wheels.push(w); }
      Object.assign(g.userData, { weak: grille, reach: 0, charge: true, height: 2.0 });
    } else {
      body.position.y = 0.9;
      part(new THREE.CylinderGeometry(0.3, 0.35, 0.9, 10), rust(), 0, 0.3, 0, body, 0.02);
      J.bolts = []; for (let i = 0; i < 12; i++) { const a = i * 0.9, y = -0.05 + (i % 4) * 0.22; const b = M(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 6), steelM(), Math.cos(a) * 0.33, y, Math.sin(a) * 0.33, body, 0.006); b.lookAt(new THREE.Vector3(0, y, 0)); b.rotateX(Math.PI / 2); J.bolts.push(b); }   // its own fixings: it throws these
      const head = new THREE.Group(); head.position.y = 0.95; body.add(head); J.head = head; part(new THREE.BoxGeometry(0.36, 0.28, 0.32), rust2(), 0, 0, 0, head);
      const eye = part(new THREE.SphereGeometry(0.07, 8, 6), weakMat, 0, 0.02, 0.17, head); J.eye = eye;
      J.arm = new THREE.Group(); J.arm.position.set(0.38, 0.6, 0); body.add(J.arm); M(new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6), steelM(), 0, -0.35, 0, J.arm, 0.01);
      J.legs = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.16, -0.15, 0); body.add(p); M(new THREE.CylinderGeometry(0.06, 0.05, 0.75, 6), rust2(), 0, -0.37, 0, p, 0.01); return p; });
      Object.assign(g.userData, { weak: eye, reach: 0, ranged: true, laneAngles: [0], height: 1.9, ammo: 12 });
    }
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'scrap', kind, variant: name, joints: J, weakMat, weakBase: new THREE.Color('#ff8a1a'), slabColor: '#8a4a2a', calls, apart: 0, events: [] });
    return g;
  }
  function enterScrap(g, state) { const U = g.userData; if (state === 'idle') { U.apart = 0; if (U.kind === 'bolt') U.ammo = 12; } if (state === 'armorBreak') U.apart = Math.min(1, U.apart + 0.5); if (state === 'die' && U.kind === 'hulk') U.events.push('fallLane'); }
  function animateScrap(g, state, t, dt, opts = {}) {
    const U = g.userData, J = U.joints, B = J.body, kind = U.kind, by = kind === 'scrapper' ? 0.35 : kind === 'hulk' ? 0.55 : 0.9, o = opts.off || 0; B.position.set(0, by, 0); B.rotation.set(0, 0, 0);
    let wheel = 0, legA = 0;
    if (state === 'idle') { B.position.y += Math.abs(Math.sin(t * 3 + o)) * (kind === 'scrapper' ? 0.04 : 0.01); if (kind === 'scrapper') B.rotation.z = Math.sin(t * 5 + o) * 0.1; }
    else if (state === 'move') { legA = 0.6; wheel = 6; if (kind === 'scrapper') B.rotation.z = Math.sin(t * 16 + o) * 0.2; }
    else if (state === 'windup') { const k = cl(t / 0.7); if (kind === 'hulk') { wheel = 14 * k; B.position.z = -0.3 * k; B.rotation.x = 0.06 * k; if (Math.floor(t * 8) !== U.rv) { U.rv = Math.floor(t * 8); U.events.push('rev'); } } else if (kind === 'bolt') { J.arm.rotation.x = -2.6 * ease(k); J.arm.rotation.z = 0.3 * k; } else { B.position.y -= 0.1 * k; if (Math.floor(t * 10) !== U.rv) { U.rv = Math.floor(t * 10); U.events.push('rattle'); } } }   // the rattle before the rush
    else if (state === 'attack') { const k = cl(t / 0.5); if (kind === 'hulk') { wheel = 30; B.position.z = -0.3 + ease(k) * 3.4; } else if (kind === 'bolt') { J.arm.rotation.x = lerp(-2.6, 0.5, ease(cl(k / 0.4))); if (k > 0.3 && !U.f) { U.f = true; if (U.ammo > 0) { U.ammo -= 2; U.events.push('boltThrow'); } } } else { B.position.z = Math.sin(k * Math.PI) * 1.2; B.position.y += Math.sin(k * Math.PI) * 0.3; legA = 0.9; if (k > 0.4 && !U.f) { U.f = true; U.events.push('swing'); } } }
    else if (state === 'recover') { if (kind === 'hulk') B.position.z = 3.1; B.rotation.z = Math.sin(t * 4) * 0.08; }
    else if (state === 'hurt') B.position.x = Math.sin(t * 60) * 0.03;
    else if (state === 'stagger') { B.rotation.z = Math.sin(t * 6) * 0.2; if (kind === 'hulk') B.position.z = 3.1; }
    else if (state === 'die') { if (kind === 'hulk') { const k = ease(cl((t - 0.6) / 0.6)); B.rotation.z = (Math.PI / 2) * k; B.position.x = 0.9 * k; if (t > 1.2 && !U.f) { U.f = true; U.events.push('slam'); } } else U.apart = 1; }   // the Hulk falls where the red lane showed
    if (state !== 'attack' && !(state === 'die' && kind === 'hulk')) U.f = false; if (state !== 'windup') U.rv = -1; if (kind === 'bolt' && state !== 'windup' && state !== 'attack') J.arm.rotation.set(0, 0, 0);
    if (J.legs) J.legs.forEach((p, i) => p.rotation.x = Math.sin(t * 14 + i * Math.PI) * legA);
    if (J.wheels) J.wheels.forEach(w => w.rotation.x += wheel * dt);
    if (J.bolts) { J.bolts.forEach((b, i) => b.visible = i < U.ammo); B.scale.setScalar(0.75 + 0.25 * (U.ammo / 12)); }   // gets smaller with each throw
    J.parts.forEach((p, i) => { const a = U.apart * (state === 'die' ? cl(t / 0.6) : 0.4); const d = p.userData.home.clone(); if (!d.lengthSq()) d.set(0, 1, 0); d.normalize(); p.position.copy(p.userData.home).addScaledVector(d, a * (0.4 + (i % 3) * 0.3)); if (state === 'die' && kind !== 'hulk') p.position.y -= a * a * 1.2; p.rotation.set(p.userData.hr.x + a * i, p.userData.hr.y, p.userData.hr.z + a * (i % 2 ? 1 : -1)); });   // two hits and it's scrap
    U.weakMat.emissiveIntensity = state === 'recover' || state === 'stagger' ? 1.2 + Math.sin(t * 12) * 0.4 : 0.4;
  }
  function buildCrusher(name) {
    const g = new THREE.Group(), J = {};
    const body = new THREE.Group(); body.position.y = 0.4; g.add(body); J.body = body;
    for (const s of [-1, 1]) { M(new THREE.BoxGeometry(0.9, 1.6, 1.2), rust2(), s * 0.8, 0.8, 0, body, 0.03); M(new THREE.CylinderGeometry(0.45, 0.45, 0.4, 14), toon('#1a1a1e'), s * 1.3, 0.3, 0.3, body, 0.02).rotation.z = Math.PI / 2; }
    const tor = new THREE.Group(); tor.position.y = 1.6; body.add(tor); J.torso = tor;
    M(new THREE.BoxGeometry(2.6, 1.8, 1.6), rust(), 0, 0.9, 0, tor, 0.04);
    for (let i = 0; i < 8; i++) M(new THREE.BoxGeometry(rr(0.4, 0.9), rr(0.3, 0.6), rr(0.3, 0.6)), [rust2(), steelM(), hub(), toon('#c42d3c')][i % 4], rr(-1.1, 1.1), 1.2 + rr(0, 0.8), rr(-0.6, 0.7), tor, 0.02);
    const weakMat = new THREE.MeshToonMaterial({ color: '#ffb020', emissive: new THREE.Color('#ff5a1a'), emissiveIntensity: 0.6, gradientMap: toon('#fff').gradientMap });
    const engine = M(new THREE.BoxGeometry(0.9, 0.6, 0.1), weakMat, 0, 0.7, 0.82, tor, 0.01);
    J.lights = [-1, 0, 1].map(s => { const lg = new THREE.Group(); lg.position.set(s * 0.9, 2.1, 0.3); tor.add(lg); M(new THREE.CylinderGeometry(0.04, 0.04, 0.5, 6), steelM(), 0, -0.25, 0, lg, 0.008); M(new THREE.BoxGeometry(0.42, 0.3, 0.2), toon('#2a2826'), 0, 0.05, 0, lg, 0.012); return M(new THREE.BoxGeometry(0.36, 0.24, 0.02), new THREE.MeshBasicMaterial({ color: '#555' }), 0, 0.05, 0.11, lg, 0); });   // floodlights still wired in
    J.arms = [-1, 1].map(s => { const sh = new THREE.Group(); sh.position.set(s * 1.5, 1.4, 0); tor.add(sh); M(new THREE.BoxGeometry(0.5, 1.2, 0.5), steelM(), 0, -0.55, 0, sh, 0.025); const el = new THREE.Group(); el.position.y = -1.15; sh.add(el); M(new THREE.BoxGeometry(0.45, 1.0, 0.45), rust(), 0, -0.45, 0, el, 0.025); M(new THREE.BoxGeometry(0.9, 0.5, 0.9), toon('#2a2826'), 0, -1.1, 0, el, 0.03); return { sh, el, s }; });
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(g.userData, { family: 'crusher', variant: name, joints: J, weak: engine, weakMat, weakBase: new THREE.Color('#ff5a1a'), slabColor: '#8a4a2a', calls, height: 4.6, reach: 2.4, phase: 1, boss: true, events: [] });
    return g;
  }
  function enterCrusher(g, state) { if (state === 'armorBreak') g.userData.phase = Math.min(3, g.userData.phase + 1); }
  function animateCrusher(g, state, t, dt) {
    const U = g.userData, J = U.joints, T = J.torso, ph = U.phase; J.body.position.set(0, 0.4, 0); T.rotation.set(0, 0, 0);
    let a0 = [0.1, 0, 0.15, -0.2], a1 = [0.1, 0, -0.15, -0.2], flash = 0;
    if (state === 'idle') T.rotation.z = Math.sin(t * 0.8) * 0.02;
    else if (state === 'move') { T.rotation.z = Math.sin(t * 2) * 0.05; J.body.position.y += Math.abs(Math.sin(t * 2)) * 0.04; }
    else if (state === 'windup') { const k = ease(cl(t / 1.0)); a0 = [lerp(0.1, -2.8, k), 0, 0.3, -0.4]; a1 = [lerp(0.1, -2.8, k), 0, -0.3, -0.4]; T.rotation.x = -0.15 * k; flash = Math.floor(t * (ph + 1) * 3) % 2 === 0 && t > 0.2 ? 1 : 0; if (flash && !U.fl) U.events.push('flash'); U.fl = flash; }   // floodlights flash before the slam, more each phase
    else if (state === 'attack') { const k = cl(t / 0.7), s = ease(cl(k / 0.4)); a0 = [lerp(-2.8, 0.6, s), 0, 0.1, -0.1]; a1 = [lerp(-2.8, 0.6, s), 0, -0.1, -0.1]; T.rotation.x = 0.4 * s; J.body.position.y = 0.4 - 0.15 * s; if (k > 0.4 && !U.f) { U.f = true; U.events.push('slam'); if (ph >= 2) U.events.push('rain'); } }
    else if (state === 'recover') { T.rotation.x = 0.35; a0 = [0.6, 0, 0.2, -0.1]; a1 = [0.6, 0, -0.2, -0.1]; }
    else if (state === 'hurt') T.position.x = Math.sin(t * 40) * 0.05;
    else if (state === 'stagger') { T.rotation.z = Math.sin(t * 3) * 0.1; flash = Math.random() > 0.7 ? 1 : 0; }
    else if (state === 'armorBreak') { if (t < dt * 1.5) U.events.push('chunks', 'roar'); T.rotation.x = -0.2 * Math.sin(cl(t / 1.2) * Math.PI); }
    else if (state === 'die') { const k = ease(cl(t / 2.0)); T.rotation.x = 1.0 * k; J.body.position.y = 0.4 - 1.0 * k; if (t > 2.0 && !U.dd) { U.dd = true; U.events.push('explode'); } }
    if (state !== 'attack') U.f = false; if (state !== 'die') U.dd = false; if (state !== 'windup') U.fl = 0;
    J.lights.forEach((l, i) => l.material.color.set(flash ? '#ffffff' : (i < 4 - ph ? '#fff2b0' : '#333')));
    const set = (A, a) => { A.sh.rotation.set(a[0], a[1], a[2]); A.el.rotation.x = a[3]; }; set(J.arms[0], a0); set(J.arms[1], a1);
    U.weakMat.emissiveIntensity = state === 'recover' ? 1.4 + Math.sin(t * 10) * 0.4 : 0.6;
  }
  // the gang: Ratchet (quick wrench), Wrench (heavy slam), Sparks (spray paint)
  const GANG = { 'Ratchet': { torso: ['#ffd23a', '#3a3a44', '#1a1a1e'], fur: '#a0522d', role: 'brawl' }, 'Wrench': { torso: ['#5a6a7a', '#2a3440', '#121820'], fur: '#6b6b6b', role: 'heavy' }, 'Sparks': { torso: ['#ec3013', '#2a1a1a', '#120a0a'], fur: '#e07020', role: 'paint' } };
  function buildGang(name) {
    const V = GANG[name] || GANG['Ratchet'], g = fk.makeFox({ key: name, torso: V.torso, crest: 'none', outfit: 'vest', mood: 'determined', eyes: ['#ffd23a', '#ffd23a'], look: { fur: V.fur } });
    const U = g.userData, P = U.P, R = P.arms[1], head = P.head, lift = P.legs[0].position.y - 0.5;
    const gg = new THREE.Group(); gg.position.set(0, 0.12, 0.3); head.add(gg); for (const s of [-1, 1]) { M(new THREE.TorusGeometry(0.09, 0.025, 6, 14), toon('#3a3a44'), s * 0.12, 0, 0.05, gg, 0); const l = new THREE.Mesh(new THREE.CircleGeometry(0.08, 14), new THREE.MeshBasicMaterial({ color: '#5fe3ff', transparent: true, opacity: 0.7 })); l.position.set(s * 0.12, 0, 0.06); gg.add(l); } M(new THREE.TorusGeometry(0.4, 0.02, 4, 24), toon('#1a1a1e'), 0, 0.1, -0.3, head, 0).rotation.x = Math.PI / 2;   // goggles
    for (const s of [-1, 1]) M(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 12), steelM(), s * 0.44, 1.2 + lift, 0, P.body, 0.012).rotation.z = Math.PI / 2;   // axle-hub shoulder armour
    const hand = new THREE.Group(); hand.position.set(0, -0.46, 0.04); R.add(hand);
    if (V.role === 'paint') { M(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 10), toon('#ec3013'), 0, 0, 0.06, hand, 0.008); U.nozzle = new THREE.Object3D(); U.nozzle.position.set(0, 0.12, 0.06); hand.add(U.nozzle); }
    else { const L = V.role === 'heavy' ? 0.9 : 0.5; M(new THREE.BoxGeometry(0.05, 0.05, L), steelM(), 0, 0, L / 2, hand, 0.008); M(new THREE.BoxGeometry(0.16, 0.06, 0.1), steelM(), 0, 0, L, hand, 0.008); hand.rotation.x = -1.3; }
    const weakMat = new THREE.MeshToonMaterial({ color: '#ffd23a', emissive: new THREE.Color('#ffd23a'), emissiveIntensity: 0, gradientMap: toon('#fff').gradientMap });
    const weak = M(new THREE.BoxGeometry(0.2, 0.12, 0.1), weakMat, 0, 0.6 + lift, -0.3, P.body, 0.01);   // the tool-belt pack
    if (V.role === 'heavy') g.scale.multiplyScalar(1.12);
    let calls = 0; g.traverse(o => { if (o.isMesh) calls++; });
    Object.assign(U, { family: 'gang', variant: name, role: V.role, weak, weakMat, weakBase: new THREE.Color('#ffd23a'), slabColor: '#ec3013', calls, height: 1.75, reach: V.role === 'paint' ? 0 : V.role === 'heavy' ? 1.6 : 1.2, ranged: V.role === 'paint', laneAngles: null, events: [] }); U.joints = { weak };
    return g;
  }
  function animateGang(g, state, t, dt) {
    const U = g.userData, P = U.P, R = P.arms[1], L = P.arms[0], B = P.body; fk.animFox(g, dt, state === 'move' ? 3.4 : 0, false); B.rotation.set(0, 0, 0); B.position.set(0, 0, 0);
    if (state === 'windup') { const k = ease(cl(t / 0.6)); if (U.role === 'paint') { R.rotation.set(lerp(0, -1.5, k), 0, 0); if (Math.floor(t * 6) !== U.sh) { U.sh = Math.floor(t * 6); U.events.push('rattle'); } } else if (U.role === 'heavy') { R.rotation.set(lerp(0, -2.9, k), 0, 0.2); L.rotation.set(lerp(0, -2.9, k), 0, -0.2); } else { R.rotation.set(lerp(0, -2, k), 0, lerp(0, 1.1, k)); B.rotation.y = -0.4 * k; } }   // Sparks shakes the can
    else if (state === 'attack') { const s = ease(cl(t / 0.3)); if (U.role === 'paint') { R.rotation.set(-1.5, Math.sin(t * 12) * 0.3, 0); if (Math.floor(t * 20) !== U.sp) { U.sp = Math.floor(t * 20); U.events.push('paint'); } } else if (U.role === 'heavy') { R.rotation.set(lerp(-2.9, -0.4, s), 0, 0.1); L.rotation.set(lerp(-2.9, -0.4, s), 0, -0.1); B.rotation.x = 0.3 * s; if (t > 0.15 && !U.f) { U.f = true; U.events.push('slam'); } } else { R.rotation.set(lerp(-2, -1, s), 0, lerp(1.1, -1.4, s)); B.rotation.y = lerp(-0.4, 0.6, s); B.position.z = Math.sin(cl(t / 0.5) * Math.PI) * 0.4; if (t > 0.15 && !U.f) { U.f = true; U.events.push('swing'); } } }
    else if (state === 'recover') { R.rotation.set(-0.4, 0, -0.6); B.rotation.x = 0.1; U.weakMat.emissiveIntensity = 0.8 + Math.sin(t * 12) * 0.4; }
    else if (state === 'hurt') B.rotation.x = -0.15;
    else if (state === 'stagger') B.rotation.z = Math.sin(t * 5) * 0.15;
    else if (state === 'die') { const k = ease(cl(t / 0.9)); B.rotation.x = -1.4 * k; B.position.y = -0.15 * k; }
    if (state !== 'attack') U.f = false; if (state !== 'recover') U.weakMat.emissiveIntensity = 0;
  }
  return {
    scrap: { names: ['Scrapper', 'Rust Hulk', 'Bolt Thrower'], build: buildScrap, animate: animateScrap, enter: enterScrap, dur: { windup: 0.7, attack: 0.5, recover: 1.0, die: 2.0 } },
    crusher: { names: ['The Crusher'], build: buildCrusher, animate: animateCrusher, enter: enterCrusher, dur: { windup: 1.2, attack: 0.7, recover: 1.6, armorBreak: 1.2, die: 2.6 } },
    gang: { names: ['Ratchet', 'Wrench', 'Sparks'], build: buildGang, animate: animateGang, dur: { windup: 0.7, attack: 0.5, recover: 1.0, armorBreak: 0.8, die: 1.6 } },
  };
}
